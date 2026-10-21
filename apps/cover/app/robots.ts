import type { MetadataRoute } from 'next'
import { CONFIG } from '@/lib/content'

// Every crawler may read everything. The answer engines are also named,
// because several of them read "not named" as "not invited". A named group
// replaces the * group for that agent, so it repeats the same allow.
//
// The pieces themselves live on the Substack. Listing its sitemap here too is
// cross-host submission, which sitemaps.org allows from the robots.txt of a
// host the owner controls.
const AI_AGENTS = [
  'GPTBot', 'OAI-SearchBot', 'ChatGPT-User',
  'ClaudeBot', 'Claude-User', 'Claude-SearchBot',
  'PerplexityBot', 'Perplexity-User',
  'Google-Extended', 'Applebot', 'Applebot-Extended',
  'meta-externalagent', 'Amazonbot', 'DuckAssistBot', 'MistralAI-User', 'CCBot',
]

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/' },
      { userAgent: AI_AGENTS, allow: '/' },
    ],
    sitemap: [`${CONFIG.siteUrl}/sitemap.xml`, `${CONFIG.substackUrl}/sitemap.xml`],
  }
}
