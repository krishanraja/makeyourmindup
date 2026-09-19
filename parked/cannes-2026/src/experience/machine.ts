import type { Answers, ResultPayload, Step } from '@/lib/types';

export type Status = 'idle' | 'generating' | 'ready' | 'error';

// Step indices:
//   0 threshold | 1 linkedin | 2 q1 | 3 q2 | 4 q3 | 5 q4 | 6 q5 | 7 pause | 8 result | 9 fork
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
  | { type: 'linkedin-done' }
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
    case 'linkedin-done':
      return { ...state, step: 2 };
    case 'exit':
      return state;
    case 'answer': {
      const nextAnswers = { ...state.answers, [action.key]: action.value };
      const stepFor: Record<keyof Answers, Step> = {
        q1: 3,
        q2: 4,
        q3: 5,
        q4: 6,
        q5: 7,
      };
      return { ...state, answers: nextAnswers, step: stepFor[action.key] };
    }
    case 'response-id':
      return { ...state, responseId: action.id };
    case 'generating':
      return { ...state, status: 'generating', step: 7 };
    case 'result':
      return { ...state, status: 'ready', result: action.payload, step: 8 };
    case 'error':
      return { ...state, status: 'error' };
    case 'email':
      return { ...state, email: action.value, step: 9 };
    case 'fork':
      return state;
    default:
      return state;
  }
}

export function completionMs(state: State): number {
  return Date.now() - state.startedAt;
}
