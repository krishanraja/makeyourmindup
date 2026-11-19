---
kill_list_scope: canon
---
# Paid tier fulfilment: what has to exist before the new perks are promised

Written 2026-11-19, from Krish's rulings of that day (media kit, "Free and paid").
Ruling (Krish, 2026-11-19): the Real-or-Theatre Desk routes to Krish by email; the reusable files sit on a code-gated
page; paying members get a Stripe code for brain modules; existing paying members are contacted to release it.

## What live state shows (read 2026-11-19)

- **Stripe.** The `mind/make` account holds both the Substack subscriptions (prices tagged `substack: yes`) and the
  eight brain modules (prices tagged `venture: mindmake`, $59 each). One account, so one coupon can cover them.
- **Paying members.** 5 active subscriptions: 3 on the annual price, 2 on prices tagged `founding`. 2 of the 5 are set
  not to renew (still paid up into 2027), and 2 carry a discount, so full price is unconfirmed for those. Every
  monthly subscription has ended. Names and emails stay in Stripe and Substack, never in this repository.
- **Prices.** The live annual price is $81, not the media kit's $80 (Substack wins; the kit line is stale). The two
  founding subscriptions paid $81 and A$115, not the $150 the kit names for founding today.
- **Module checkout.** mindmake.co's checkout sessions set no `allow_promotion_codes`, so a code cannot be entered
  today. That is the one hard blocker for the module perk.
- **Files.** content-engine's public catalogue carries each piece's address and YouTube cuts only. No diagram or
  artifact files are published anywhere a members page could read them.

## What to build, in order

| # | Thing | Where | Approval gate |
|---|---|---|---|
| 1 | Built 2026-11-19 on mindmake branch `claude/great-keller-7jcddc`: checkout accepts codes; the webhook fulfils a free checkout only for `mymu-member-module`, so other 100% codes on the account fail closed | mindmake `supabase/functions` | Deploying `kits-checkout` and `kits-webhook` |
| 2 | Done 2026-11-19: coupon `mymu-member-module`, 100% off, duration once, `applies_to` the 8 module products. Still to do, each when a member claims: promotion codes from it, one per monthly or annual member (max 1 redemption), one per founding member (max 8) | Stripe `mind/make`, live | Creating the coupon and each code |
| 3 | Built 2026-11-19, not deployed: `makeyourmindup.ai/members`: one page, noindex, behind a shared code held in the Vercel env var `MEMBERS_CODE` (Krish sets it; never in the repo), checked by middleware and remembered in a cookie. Lists each piece's files | apps/cover in this repository | The production deploy, and setting the env var |
| 4 | Publish each piece's diagrams and artifacts as files with a catalogue entry the members page reads | content-engine (separate repository) | Its own release |
| 5 | The Desk: replies to the paid welcome already land in the publication's reply inbox. Add a Gmail filter that labels them "Desk" so none is missed; Krish answers each in writing, one per annual member a month | Krish's Gmail | Creating the filter |
| 6 | The monthly live session for annual and founding: one recurring slot and its link | Krish's calendar and recording tool, his choice | Creating the event |
| 7 | The founding check-in: one a month per founding member, offered and booked by reply when they want it (Ruling, Krish, 2026-11-19). No booking tool needed yet | Krish's inbox | None |
| 8 | Release to the 5 paying members: one email to paid subscribers only, from Substack | Substack, via the Cowork brief | Sending it |

## Shared code, and why not more

A shared code is copyable. The files are low-stakes, the paid base is 5 people, and a shared code needs no login
system. Rotate it if it leaks. Revisit (email check against Stripe, then a magic link) once paid members pass 50.

## What stays manual for now

- "From the second payment" for a monthly module: checked by hand in Stripe when the member replies.
- Sending each promotion code: by reply, from the publication inbox.
- Both are fine at 5 members and become a build item past roughly 20.
