'use client';

import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { Answers, Source, UtmFields } from '@/lib/types';
import { resolveArchetype } from '@/lib/archetypes';
import { events } from '@/lib/analytics';
import { reportError } from '@/lib/telemetry';
import { anonHeaders, functionsUrl, getSupabase } from '@/lib/supabase';
import { initialState, reducer, completionMs } from './machine';
import { Threshold } from './screens/Threshold';
import { QuestionSlider } from './screens/QuestionSlider';
import { QuestionCards } from './screens/QuestionCards';
import { QuestionText } from './screens/QuestionText';
import { Pause } from './screens/Pause';
import { Result } from './screens/Result';
import { Fork } from './screens/Fork';
import { Q1, Q2, Q3, Q4, Q5 } from './questions';

type Props = {
  source: string;
  utm: UtmFields;
};

export function Experience({ source, utm }: Props) {
  const [state, dispatch] = useReducer(reducer, undefined, initialState);
  const insertingRef = useRef(false);
  const generatingRef = useRef(false);

  const onAnswer = useCallback(
    <K extends keyof Answers>(key: K, value: Answers[K]) => {
      events.answer(key, value);
      dispatch({ type: 'answer', key, value });
    },
    [],
  );

  useEffect(() => {
    const screenNames = [
      'threshold',
      'q1',
      'q2',
      'q3',
      'q4',
      'q5',
      'pause',
      'result',
      'fork',
    ];
    events.screen(screenNames[state.step]);
  }, [state.step]);

  useEffect(() => {
    if (state.responseId || insertingRef.current) return;
    if (!state.answers.q1 && state.answers.q1 !== 0) return;
    insertingRef.current = true;
    (async () => {
      try {
        const supabase = getSupabase();
        const ua = typeof navigator !== 'undefined' ? navigator.userAgent : null;
        const normalizedSource = (['qr', 'direct', 'shared'] as Source[]).includes(source as Source)
          ? source
          : 'direct';
        const { data, error } = await supabase
          .from('cannes_responses')
          .insert({
            q1_week_needs_me: state.answers.q1,
            user_agent: ua,
            source: normalizedSource,
            utm_source: utm.source ?? null,
            utm_medium: utm.medium ?? null,
            utm_campaign: utm.campaign ?? null,
          })
          .select('id')
          .single();
        if (error) throw error;
        dispatch({ type: 'response-id', id: data.id });
      } catch (err) {
        reportError('insert-row', err);
      } finally {
        insertingRef.current = false;
      }
    })();
  }, [state.responseId, state.answers.q1, source, utm.source, utm.medium, utm.campaign]);

  useEffect(() => {
    if (!state.responseId) return;
    const partial: Record<string, unknown> = {};
    if (state.answers.q2) partial.q2_extra_self = state.answers.q2;
    if (typeof state.answers.q3 === 'number') partial.q3_company_ai = state.answers.q3;
    if (state.answers.q4) partial.q4_company_future = state.answers.q4;
    if (state.answers.q5) partial.q5_decision = state.answers.q5;
    if (Object.keys(partial).length === 0) return;
    const supabase = getSupabase();
    supabase
      .from('cannes_responses')
      .update(partial)
      .eq('id', state.responseId)
      .then(({ error }) => {
        if (error) reportError('update-answers', error);
      });
  }, [state.responseId, state.answers.q2, state.answers.q3, state.answers.q4, state.answers.q5]);

  useEffect(() => {
    if (state.step !== 6) return;
    if (generatingRef.current) return;
    if (state.result) return;
    if (!state.answers.q1 && state.answers.q1 !== 0) return;
    if (!state.answers.q2 || !state.answers.q4 || !state.answers.q5) return;
    if (typeof state.answers.q3 !== 'number') return;
    if (!state.responseId) return;

    generatingRef.current = true;
    dispatch({ type: 'generating' });
    const startedMs = state.startedAt;

    (async () => {
      const archetype = resolveArchetype(state.responseId!, state.answers.q2!, state.answers.q4!);
      try {
        const res = await fetch(functionsUrl('generate-result'), {
          method: 'POST',
          headers: anonHeaders(),
          body: JSON.stringify({
            id: state.responseId,
            answers: state.answers,
            archetype,
          }),
        });
        if (!res.ok) throw new Error(`generate-result ${res.status}`);
        const data = (await res.json()) as {
          twelve_months: string;
          three_years: string;
          archetype_title: string;
        };
        const elapsed = Date.now() - startedMs;
        events.generated(data.archetype_title, elapsed);
        dispatch({
          type: 'result',
          payload: {
            archetypeKey: archetype.key,
            archetypeTitle: data.archetype_title || archetype.title,
            archetypeVariant: archetype.variant,
            twelveMonths: data.twelve_months,
            threeYears: data.three_years,
          },
        });
      } catch (err) {
        reportError('generate-result', err);
        dispatch({
          type: 'result',
          payload: {
            archetypeKey: archetype.key,
            archetypeTitle: archetype.title,
            archetypeVariant: archetype.variant,
            twelveMonths:
              'Your week settles into a shape you recognise. The work that needs you finds you. The work that does not, runs without you. You make fewer, sharper calls. You notice the difference in the room before anyone says it.',
            threeYears:
              'Your company looks lighter from the outside and heavier from the inside. The headcount is smaller. The output is larger. The decisions are yours. The execution is the system.',
          },
        });
      } finally {
        generatingRef.current = false;
      }
    })();
  }, [state.step, state.result, state.answers, state.responseId, state.startedAt]);

  const onEmail = useCallback(
    async (email: string) => {
      if (!state.responseId) return;
      events.email();
      dispatch({ type: 'email', value: email });
      try {
        await fetch(functionsUrl('send-result-email'), {
          method: 'POST',
          headers: anonHeaders(),
          body: JSON.stringify({ id: state.responseId, email }),
        });
      } catch (err) {
        reportError('send-result-email', err);
      }
    },
    [state.responseId],
  );

  const onFork = useCallback(
    async (destination: string) => {
      if (!state.responseId) return;
      events.fork(destination);
      try {
        await fetch(functionsUrl('track-fork'), {
          method: 'POST',
          headers: anonHeaders(),
          body: JSON.stringify({ id: state.responseId, destination }),
        });
      } catch (err) {
        reportError('track-fork', err);
      }
    },
    [state.responseId],
  );

  const completion = useMemo(() => completionMs(state), [state]);

  return (
    <div className="relative mx-auto flex min-h-[100dvh] w-full max-w-[640px] flex-col">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={state.step}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.36, ease: [0.22, 1, 0.36, 1] }}
          className="flex w-full flex-1 flex-col"
        >
          {state.step === 0 && (
            <Threshold
              onContinue={() => dispatch({ type: 'begin' })}
              onExit={() => {
                window.location.href = 'https://themindmaker.ai';
              }}
            />
          )}
          {state.step === 1 && (
            <QuestionSlider
              question={Q1}
              initial={state.answers.q1 ?? 50}
              onSubmit={(v) => onAnswer('q1', v)}
            />
          )}
          {state.step === 2 && (
            <QuestionCards
              question={Q2}
              onSubmit={(v) => onAnswer('q2', v)}
            />
          )}
          {state.step === 3 && (
            <QuestionSlider
              question={Q3}
              initial={state.answers.q3 ?? 50}
              onSubmit={(v) => onAnswer('q3', v)}
            />
          )}
          {state.step === 4 && (
            <QuestionCards
              question={Q4}
              onSubmit={(v) => onAnswer('q4', v)}
            />
          )}
          {state.step === 5 && (
            <QuestionText
              question={Q5}
              onSubmit={(v) => onAnswer('q5', v)}
            />
          )}
          {state.step === 6 && <Pause />}
          {state.step === 7 && state.result && state.responseId && (
            <Result
              responseId={state.responseId}
              answers={state.answers as Answers}
              result={state.result}
              completionMs={completion}
              onEmail={onEmail}
            />
          )}
          {state.step === 8 && state.result && state.responseId && (
            <Fork
              responseId={state.responseId}
              answers={state.answers as Answers}
              result={state.result}
              onFork={onFork}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
