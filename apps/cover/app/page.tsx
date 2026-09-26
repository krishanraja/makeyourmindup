import { Contents } from '@/components/Contents'
import { Cover } from '@/components/Cover'
import { Footer } from '@/components/Footer'
import { Marquee } from '@/components/Marquee'
import { Newsstand } from '@/components/Newsstand'
import { Platforms } from '@/components/Platforms'
import { Scoreboard } from '@/components/Scoreboard'
import { StaffBox } from '@/components/StaffBox'
import { StickyBar } from '@/components/StickyBar'
import { CONFIG, SITE } from '@/lib/content'
import { latestPosts } from '@/lib/rss'

// Static, refreshed hourly. If Substack is down, the last good page keeps serving.
export const revalidate = 3600

export default async function Page() {
  const posts = await latestPosts()
  return (
    <>
      <a
        href="#inside"
        className="mono-label sr-only z-[60] bg-mint px-4 py-3 text-ink focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        {SITE.a11y.skip}
      </a>
      <span id="top" />
      <StickyBar />
      <main>
        <Cover />
        <Marquee />
        <Contents />
        {CONFIG.scoreboard.show && <Scoreboard />}
        <Newsstand posts={posts} />
        <Platforms />
        <StaffBox />
      </main>
      <Footer />
    </>
  )
}
