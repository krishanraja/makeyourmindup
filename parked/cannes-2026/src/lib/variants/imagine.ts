import type { VariantBundle } from './index';

export const imagine: VariantBundle = {
  slug: 'imagine',
  hero: {
    eyebrow: 'Imagine.',
    headline: 'Yes, you.',
    body: "For the version of you that knows the company you're building isn't the one you'd build today.",
    cta: "Sketch what's possible",
  },
  resultLens: {
    systemPromptAddition:
      `Lens: IMAGINE. The reader came through the imagine door. They sense the company they have is not the one they would build if they started today. Write paragraph one as a week inside the rebuilt version, not the old company with tools bolted on. In paragraph two, sketch the shape of that rebuilt company: the pairings of people and agents that make it run, and the one redesign they started this quarter that put it on the new shape. Speak as a peer who already started.`,
    resultIntroLine: "Here's the company you'd build now.",
    shareText: "I just sketched the company I'd build if I started today.",
    shareCardSubtitle: 'Made via imagine.makeyourmindup.ai',
  },
  og: {
    title: "Yes, you. The company you'd build now.",
    subtitle: 'imagine.makeyourmindup.ai',
  },
  analytics: {
    entryEvent: 'entry_imagine_viewed',
    completeEvent: 'entry_imagine_completed',
  },
};
