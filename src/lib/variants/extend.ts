import type { VariantBundle } from './index';

export const extend: VariantBundle = {
  slug: 'extend',
  hero: {
    eyebrow: 'Extend.',
    headline: 'Yes, you.',
    body: 'For the voice wondering what a second you would ship this week.',
    cta: 'Design the second you',
  },
  resultLens: {
    systemPromptAddition:
      `Lens: EXTEND. The reader came through the extend door. They want a second version of themselves for the work that only they can do right now. Treat paragraph one as the week after that second self is real and running: what the reader does instead, and what the second self quietly handles. Hold it to one clear job it owns and one thing it never touches, so the reader keeps the work that is actually theirs. In paragraph two, show the company that runs when one good operator can be in two places at once.`,
    resultIntroLine: "Here's the second you.",
    shareText: 'I just designed a second me. I have my Wednesday back.',
    shareCardSubtitle: 'Made via extend.makeyourmindup.ai',
  },
  og: {
    title: 'Yes, you. The second you, designed.',
    subtitle: 'extend.makeyourmindup.ai',
  },
  analytics: {
    entryEvent: 'entry_extend_viewed',
    completeEvent: 'entry_extend_completed',
  },
};
