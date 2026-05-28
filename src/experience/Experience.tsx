'use client';

import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { Answers, EnrichmentPayload, Source, UtmFields } from '@/lib/types';
import { resolveArchetype } from '@/lib/archetypes';
import { events } from '@/lib/analytics';
import { reportError } from '@/lib/telemetry';
import { anonHeaders, functionsUrl, getSupabase } from '@/lib/supabase';
import { initialState, reducer, completionMs } from './machine';
import { Threshold } from './screens/Threshold';
import { LinkedInDrop } from './screens/LinkedInDrop';
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

  const normalizedSource = useMemo<Source>(
    () => ((['qr', 'direct', 'shared'] as Source[]).includes(source as Source) ? (source as Source) : 'direct'),
    [source],
  );

  const insertRow = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        const supabase = getSupabase();
        const ua = typeof navigator !== 'undefined' ? navigator.userAgent : null;
        const { error } = await supabase.from('cannes_responses').insert({
          id,
          user_agent: ua,
          source: normalizedSource,
          utm_source: utm.source ?? null,
          utm_medium: utm.medium ?? null,
          utm_campaign: utm.campaign ?? null,
        });
        if (error) throw error;
        return true;
      } catch (err) {
        reportError('insert-row', err);
        return false;
      }
    },
    [normalizedSource, utm.source, utm.medium, utm.campaign],
  );

  const onLinkedInSubmit = useCallback(
    async (payload: EnrichmentPayload) => {
      events.screen('linkedin_submitted');
      const id = state.responseId ?? crypto.randomUUID();
      if (!state.responseId) {
        const ok = await insertRow(id);
        if (ok) dispatch({ type: 'response-id', id });
      }
      // Fire-and-forget enrichment.
      fetch(functionsUrl('enrich-profile'), {
        method: 'POST',
        headers: anonHeaders(),
        body: JSON.stringify({ id, ...payload }),
      }).catch((err) => reportError('enrich-profile', err));
      dispatch({ type: 'linkedin-done' });
    },
    [insertRow, state.responseId],
  );

  const onLinkedInSkip = useCallback(() => {
    events.screen('linkedin_skipped');
    dispatch({ type: 'linkedin-done' });
  }, []);

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
      'linkedin',
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

  // Fallback insert: if user skipped LinkedIn but answered Q1, ensure a row exists.
  useEffect(() => {
    if (state.responseId || insertingRef.current) return;
    if (!state.answers.q1 && state.answers.q1 !== 0) return;
    insertingRef.current = true;
    const id = crypto.randomUUID();
    (async () => {
      const ok = await insertRow(id);
      if (ok) dispatch({ type: 'response-id', id });
      insertingRef.current = false;
    })();
  }, [state.responseId, state.answers.q1, insertRow]);

  useEffect(() => {
    if (state.step !== 7) return;
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
            <LinkedInDrop onSubmit={onLinkedInSubmit} onSkip={onLinkedInSkip} />
          )}
          {state.step === 2 && (
            <QuestionSlider
              question={Q1}
              initial={state.answers.q1 ?? 50}
              onSubmit={(v) => onAnswer('q1', v)}
            />
          )}
          {state.step === 3 && (
            <QuestionCards
              question={Q2}
              onSubmit={(v) => onAnswer('q2', v)}
            />
          )}
          {state.step === 4 && (
            <QuestionSlider
              question={Q3}
              initial={state.answers.q3 ?? 50}
              onSubmit={(v) => onAnswer('q3', v)}
            />
          )}
          {state.step === 5 && (
            <QuestionCards
              question={Q4}
              onSubmit={(v) => onAnswer('q4', v)}
            />
          )}
          {state.step === 6 && (
            <QuestionText
              question={Q5}
              onSubmit={(v) => onAnswer('q5', v)}
            />
          )}
          {state.step === 7 && <Pause />}
          {state.step === 8 && state.result && state.responseId && (
            <Result
              responseId={state.responseId}
              answers={state.answers as Answers}
              result={state.result}
              completionMs={completion}
              onEmail={onEmail}
            />
          )}
          {state.step === 9 && state.result && state.responseId && (
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
