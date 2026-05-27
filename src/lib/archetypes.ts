import type { CompanyFuture, ExtraSelf } from './types';
import { pickVariant } from './variant';

type ArchetypePair = { a: string; b: string };

const TABLE: Record<ExtraSelf, Record<CompanyFuture, ArchetypePair>> = {
  think: {
    same: {
      a: 'The operator who finally has time to think.',
      b: 'The leader who decides faster than the room expects.',
    },
    leaner: {
      a: 'The thinker running half a company twice as well.',
      b: 'The leader whose smallest team builds the biggest thing.',
    },
    hybrid: {
      a: 'The mind behind the machine and the team.',
      b: 'The operator who hires agents the way they used to hire people.',
    },
    autonomous: {
      a: 'The architect of a business that runs without them.',
      b: 'The mind that designed the system that runs the business.',
    },
  },
  do: {
    same: {
      a: 'The doer who stopped being the bottleneck.',
      b: 'The operator whose execution finally caught up with their ambition.',
    },
    leaner: {
      a: 'The leader whose team ships twice as much with half the headcount.',
      b: 'The doer who builds in days what teams used to build in quarters.',
    },
    hybrid: {
      a: 'The operator running a team of humans and agents like one unit.',
      b: 'The leader who finally has the leverage their instincts deserved.',
    },
    autonomous: {
      a: 'The builder of the business that builds itself.',
      b: 'The operator whose system out-executes their old company.',
    },
  },
  talk: {
    same: {
      a: 'The leader people listen to because they actually know.',
      b: 'The operator whose conversations move the business every week.',
    },
    leaner: {
      a: 'The leader of a smaller, sharper room.',
      b: 'The operator whose words now move a tighter system.',
    },
    hybrid: {
      a: 'The voice both humans and agents are tuned to.',
      b: "The operator running the team meetings AI couldn't replace.",
    },
    autonomous: {
      a: 'The director of a system they no longer have to manage.',
      b: "The leader whose conversations are the company's only manual input.",
    },
  },
  watch: {
    same: {
      a: "The leader who finally sees what's actually happening.",
      b: 'The operator with the dashboard their old company never had.',
    },
    leaner: {
      a: 'The leader who runs a small company they can hold in their head.',
      b: 'The operator whose visibility scales faster than their headcount.',
    },
    hybrid: {
      a: 'The leader who watches the agents work and steps in only when needed.',
      b: 'The operator whose attention now goes where it matters.',
    },
    autonomous: {
      a: 'The pilot of a business they can finally read like a book.',
      b: 'The leader who knows every important thing happening, instantly.',
    },
  },
};

export function archetypeKey(q2: ExtraSelf, q4: CompanyFuture): string {
  return `${q2}+${q4}`;
}

export function resolveArchetype(
  responseId: string,
  q2: ExtraSelf,
  q4: CompanyFuture,
): { title: string; variant: 'A' | 'B'; key: string } {
  const key = archetypeKey(q2, q4);
  const variant = pickVariant(responseId, key);
  const pair = TABLE[q2][q4];
  return { title: variant === 'A' ? pair.a : pair.b, variant, key };
}
