// Shared shapes for the person-resolver waterfall.

export type Confidence = 'high' | 'medium' | 'low';

export type ProviderName =
  | 'pdl'
  | 'apollo'
  | 'apify'
  | 'phantombuster'
  | 'exa'
  | 'perplexity'
  | 'brave'
  | 'newsapi'
  | 'brandfetch'
  | 'builtwith'
  | 'tranco'
  | 'neverbounce'
  | 'claude';

export type Experience = { title: string; company: string; isCurrent: boolean };

export type ResolvedPerson = {
  name: string | null;
  role: string | null; // current title
  company: string | null;
  companyDomain: string | null;
  linkedinUrl: string | null; // the REAL resolved profile URL
  location: string | null;
  experience: Experience[];
  // company context
  companyBlurb: string | null;
  companyRank: number | null; // Tranco
  techStack: string[] | null; // BuiltWith
  industry: string | null;
  headcount: string | null;
  fundingStage: string | null;
  logoUrl: string | null;
  brandColors: string[] | null;
  // signals
  publicSignals: string[];
  newsHeadlines: string[];
  // meta
  provenance: Partial<Record<keyof ResolvedPerson, ProviderName>>;
  providersHit: ProviderName[];
  confidence: Confidence;
  emailDeliverable: boolean | null;
};

export function emptyPerson(): ResolvedPerson {
  return {
    name: null,
    role: null,
    company: null,
    companyDomain: null,
    linkedinUrl: null,
    location: null,
    experience: [],
    companyBlurb: null,
    companyRank: null,
    techStack: null,
    industry: null,
    headcount: null,
    fundingStage: null,
    logoUrl: null,
    brandColors: null,
    publicSignals: [],
    newsHeadlines: [],
    provenance: {},
    providersHit: [],
    confidence: 'low',
    emailDeliverable: null,
  };
}

// A provider returns a partial person; the orchestrator merges them.
export type ProviderResult = {
  provider: ProviderName;
  person: Partial<ResolvedPerson>;
} | null;
