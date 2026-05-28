// Deno-side mirror of the entry-variant result lenses. Kept in step with the
// resultLens copy in src/lib/variants/<variant>.ts. Not imported from src/ on
// purpose: edge functions stay self-contained.

export type Variant = 'decide' | 'extend' | 'imagine';

export const VARIANTS = new Set<Variant>(['decide', 'extend', 'imagine']);

export function isVariant(v: unknown): v is Variant {
  return typeof v === 'string' && VARIANTS.has(v as Variant);
}

// Appended to the generate-result system prompt. Flavours the existing
// two-paragraph future memory toward the variant's frame. Same output shape.
export const RESULT_LENS: Record<Variant, string> = {
  decide:
    `Lens: DECIDE. The reader came through the decide door. They are sitting on one specific call they keep not making, the one in their Q5. Treat both paragraphs as the view from just after they finally made it. In paragraph one, write the future memory as the quiet aftermath of deciding: the week that exists because they stopped sitting on it. In paragraph two, show the company that the decision set in motion. Name the cost they stopped paying by choosing. Founder to founder.`,
  extend:
    `Lens: EXTEND. The reader came through the extend door. They want a second version of themselves for the work that only they can do right now. Treat paragraph one as the week after that second self is real and running: what the reader does instead, and what the second self quietly handles. Hold it to one clear job it owns and one thing it never touches, so the reader keeps the work that is actually theirs. In paragraph two, show the company that runs when one good operator can be in two places at once.`,
  imagine:
    `Lens: IMAGINE. The reader came through the imagine door. They sense the company they have is not the one they would build if they started today. Write paragraph one as a week inside the rebuilt version, not the old company with tools bolted on. In paragraph two, sketch the shape of that rebuilt company: the pairings of people and agents that make it run, and the one redesign they started this quarter that put it on the new shape. Speak as a peer who already started.`,
};

// Variant-aware email subject and an opening-line instruction appended to the
// send-result-email system prompt.
export const EMAIL_LENS: Record<Variant, { subject: string; systemAddition: string }> = {
  decide: {
    subject: 'The call you keep almost making',
    systemAddition:
      'Lens: this reader came through the decide door, sitting on a specific call. Open around the call they kept almost making, then quote their Q5 line, before the prose.',
  },
  extend: {
    subject: 'Your second self, drafted',
    systemAddition:
      'Lens: this reader came through the extend door. Open around the second version of them they just designed, then quote their Q5 line, before the prose.',
  },
  imagine: {
    subject: 'The company you would build now',
    systemAddition:
      'Lens: this reader came through the imagine door. Open around the company they would build if they started today, then quote their Q5 line, before the prose.',
  },
};
