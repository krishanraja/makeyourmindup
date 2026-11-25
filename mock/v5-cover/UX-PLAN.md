# makeyourmindup.ai: UI and UX plan (v5)

## The job
The site has one job: turn a visitor into a subscriber. The North Star is 50,000 Substack subscribers by 27 Dec 2027. Everything else on the page either earns that subscription (proof we are worth reading) or is required (legal, search, members). The pieces themselves live on Substack. The site is the front door, not the library.

## One brand mark, one heading (the fix for the last mock)
- **The header carries the brand once:** the icon plus the one-line wordmark (V9) at left, and Subscribe at right.
- **The hero carries a real heading**, not the name again. In Anton, large, with a one-time line-wipe reveal:
  - WE TAKE AI CLAIMS APART, ONE WHY AT A TIME.
  - Under it, in Fraunces: "Who gets paid. What's real. Where the pitch and the product part ways."
  - Then the email field and Subscribe, inline, so the job happens in the first screen.
- The big S3h name moves to where it belongs: the podcast and social avatars. It is not on the site.

## Page map
1. **/ (cover).** One page, seven bands, top to bottom:
   1. **Header:** V9 and Subscribe. On scroll it stays as a thin ink bar with Subscribe only (no marquee, no sticky wordmark).
   2. **Hero:** the heading, the line and the inline email form ("Free to read. Unsubscribe any time.").
   3. **This week:** the latest three pieces from the live feed (lib/rss.ts, every 15 minutes).
      - Each card shows its Substack cover image, the day and series in DM Mono (for example "MON · FOLLOW.THE.MONEY"), the Anton title, one Fraunces line and the date.
      - Read it opens the article.
      - Watch and Short sit beside it when they exist (Ruling, 11 Nov: "A for the cards").
      - The rung colour is a thin bar in coral, butter and lilac in order.
   4. **Recent:** the five pieces before this week, as tall panels that open on hover or tap. The others narrow to vertical titles with "01 / 05" numbering (from ui-inspo cards-accordion). On mobile they become a simple list.
   5. **How we work:** the why-ladder in three plain steps on a hairline timeline (from ui-inspo's numbered timeline):
      - "We start with the claim."
      - "We ask why until the evidence runs out."
      - "We show what holds and what doesn't."
   6. **Questions:** four or five index cards that open in place (from ui-inspo faq-drawer):
      - What is this?
      - How often?
      - Is it free?
      - How do you check?
      - What's in Members?
   7. **Footer:**
      - the icon;
      - the legal note filled from legal-entities.md;
      - Terms, Privacy, Substack and Members;
      - YouTube, Instagram and Facebook as text links, with no TikTok or X tiles.
2. **Subscribe sheet:** the header Subscribe opens a dialog on desktop and a bottom sheet on mobile (from ui-inspo modal), with the same plain GET form to https://home.makeyourmindup.ai/subscribe?email= in a new tab. With JavaScript off it is a plain link to the subscribe page.
3. **/members:** the code gate (unchanged logic), then the files as a checklist dossier: one row per piece, its files listed, and "4 pieces · 10 files". Same auth, noindex and no-store.
4. **/terms and /privacy:** a reading layout with Fraunces body, a DM Mono updated date and a 68-character measure.
5. **404:** "This page doesn't exist. This week's pieces do." It links home and to Substack.

## What carries over from today's site (must keep)
- Root metadata, canonical, OG and Twitter images with alt text (lib/social.ts), lang en-GB and themeColor #0C1512.
- JSON-LD Organization and WebSite, with no Person or founder node (Ruling, 13 Nov), and sameAs for Substack, YouTube, Instagram and Facebook.
- robots (members disallowed, the AI crawlers named), the sitemap, llms.txt, the manifest and icons. The icons change to the v5 D.
- The live feed loader with its fallbacks:
  - the archive API, then RSS, then the last good page;
  - the catalogue join for Watch and Short;
  - drop VIDEO: posts and anything before 25 Sep 2026.
- The subscribe GET form that works without JavaScript. No analytics, no tracking and no cookies, because the privacy page promises that.
- The members gate exactly as built, and its tests.
- The legal pages and the footer legal note, with the entity-naming rule (Ruling, 19 Oct).
- No copy names Krish (Ruling, 28 Oct).
- The kill-list scope over every copy file.
- The Substack kit and brand kit build inputs. Update them to v5 assets in the same change.

## What goes
- The Marquee, StickyBar wordmark, Reveal and Magnetic.
- StaffBox, PanelSheet and the avatar sprites. The 11 judge cards leave the cover; #panel links simply land on the page.
- The Contents diagrams and Platforms tiles. The series live in each card's DM Mono line, and the platforms in the footer and JSON-LD.
- "AI, unpicked.", the old masthead PNG, the felt robot, IBM Plex Mono and Archivo.

## States (every one designed)
- **Feed:**
  - fresh;
  - stale (serves the last good page silently);
  - down with nothing cached ("This week's pieces are on Substack" and a link);
  - 1 or 2 pieces this week, so the row adapts without a hole.
- **Card:**
  - no cover image (a flat rung-colour block with the ink title);
  - a title at the 3-line maximum;
  - no Watch or Short (the links hide, nothing broken).
- **Subscribe:** empty, invalid ("Check the email address."), sent (the new tab opens and the field says "Check your inbox to confirm."), and JavaScript off.
- **Members:** locked, wrong code (the 800 ms wait, then "That code didn't work."), unlocked, and no code configured (the page stays shut).
- **Viewports:** 320, 390, 768, 1024, 1440 and 1920, with content capped at 1440 and centred.
- **Reduced motion:** every reveal shows its end state. Nothing runs at rest.

## Interaction and motion
- One easing curve everywhere, cubic-bezier(0.22, 1, 0.36, 1), with entries of 200 to 480 ms.
- Things play once when they enter the view, then rest. No scroll-jacking, no parallax, no cursor effects, no carousels.
- The heading's line-wipe runs once, in mint. Recent's panels widen over 480 ms. The index cards open by height.
- Hover: the card photo darkens slightly and the title underlines.
- Focus: a 2 px mint outline on everything. Touch targets are at least 44 px.

## Layout system
- A 12-column grid. Outer margins are 64 px (desktop), 40 px (tablet) and 20 px (mobile), and the gutter is 24 px. The content max is 1440 px.
- An 8 px baseline. Section gaps are 120 px (desktop) and 64 px (mobile).
- One left edge for the header, heading, form, band labels, cards, timeline, cards of questions and footer.
- Type:
  - Anton for headings: the hero at clamp(56px, 7vw, 120px) and card titles at 28 to 32 px;
  - Fraunces SOFT 50 for body, 18 to 22 px;
  - DM Mono for labels, 12 to 13 px, uppercase, tracked 0.12 em, with tabular numerals.

## Build order
1. This plan, as a clickable mock in mock/v5-cover.
2. On approval, the real change in apps/cover on branch look/v5-site, in one pull request with the members and newsstand tests passing, the icons and OG images swapped to v5, and the kit inputs updated.
