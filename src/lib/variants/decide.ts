import type { VariantBundle } from './index';

export const decide: VariantBundle = {
  slug: 'decide',
  hero: {
    eyebrow: 'Decide.',
    headline: 'Yes, you.',
    body: "For the version of you that keeps almost making the big call you're sat on.",
    cta: 'Show me the call',
  },
  resultLens: {
    systemPromptAddition:
      `Lens: DECIDE. The reader came through the decide door. They are sitting on one specific call they keep not making, the one in their Q5. Treat both paragraphs as the view from just after they finally made it. In paragraph one, write the future memory as the quiet aftermath of deciding: the week that exists because they stopped sitting on it. In paragraph two, show the company that the decision set in motion. Name the cost they stopped paying by choosing. Founder to founder.`,
    resultIntroLine: "Here's the shape of the call.",
    shareText: 'I sat on a decision for too long. I just made up my mind.',
    shareCardSubtitle: 'Made up via decide.makeyourmindup.ai',
  },
  og: {
    title: 'Yes, you. The call you keep almost making.',
    subtitle: 'decide.makeyourmindup.ai',
  },
  analytics: {
    entryEvent: 'entry_decide_viewed',
    completeEvent: 'entry_decide_completed',
  },
};
