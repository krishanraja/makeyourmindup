import type { Answers, ResultPayload, Step } from '@/lib/types';

export type Status = 'idle' | 'generating' | 'ready' | 'error';

export type State = {
  step: Step;
  answers: Partial<Answers>;
  responseId: string | null;
  result: ResultPayload | null;
  email: string | null;
  status: Status;
  startedAt: number;
};

export type Action =
  | { type: 'begin' }
  | { type: 'exit' }
  | { type: 'answer'; key: keyof Answers; value: Answers[keyof Answers] }
  | { type: 'response-id'; id: string }
  | { type: 'generating' }
  | { type: 'result'; payload: ResultPayload }
  | { type: 'error'; message: string }
  | { type: 'email'; value: string }
  | { type: 'fork'; destination: string };

export const initialState = (): State => ({
  step: 0,
  answers: {},
  responseId: null,
  result: null,
  email: null,
  status: 'idle',
  startedAt: Date.now(),
});

export function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'begin':
      return { ...state, step: 1, startedAt: Date.now() };
    case 'exit':
      return state;
    case 'answer': {
      const nextAnswers = { ...state.answers, [action.key]: action.value };
      const stepFor: Record<keyof Answers, Step> = {
        q1: 2,
        q2: 3,
        q3: 4,
        q4: 5,
        q5: 6,
      };
      return { ...state, answers: nextAnswers, step: stepFor[action.key] };
    }
    case 'response-id':
      return { ...state, responseId: action.id };
    case 'generating':
      return { ...state, status: 'generating', step: 6 };
    case 'result':
      return { ...state, status: 'ready', result: action.payload, step: 7 };
    case 'error':
      return { ...state, status: 'error' };
    case 'email':
      return { ...state, email: action.value, step: 8 };
    case 'fork':
      return state;
    default:
      return state;
  }
}

export function completionMs(state: State): number {
  return Date.now() - state.startedAt;
}
