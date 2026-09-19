---
kill_list_scope: canon
---
# The slate page

The phone-first page Krish opens to rule on the week's slate. One template,
filled once a week with the rows the intake runner wrote to `public.suggestions`,
published as a private artifact, and the link sent to his inbox.

## What it is

`template.html` is the whole page. It has one placeholder, `__SLATE_JSON__`,
which is replaced with a JSON object of this shape before publishing:

```
{
  "week_of": "2026-09-21",
  "project_id": "<the Mindmaker OS project ref>",
  "producer": "intake-and-first-slate",
  "proposed_on": "2026-09-19",
  "summary": "six lines a person reads on a phone",
  "formats": [
    { "slug": "split_the_bill", "cadence": "Wednesdays", "standing_question": "...", "empty_note": "..." },
    { "slug": "mind_the_gap",   "cadence": "Fridays, the hero", "standing_question": "..." },
    { "slug": "lift_the_lid",   "cadence": "standing, no fixed day", "standing_question": "..." }
  ],
  "suggestions": [
    { "id": "<uuid from public.suggestions>", "surface": "slate_pick", "subject_id": "c0012",
      "proposed": { "format": "split_the_bill", "headline": "...", "your_call_question": "...",
                    "rank": 1, "derivative_plan": [ { "kind": "written_piece", "do": true, "why": "..." } ] },
      "reason": "...", "confidence": 0.82, "alternatives": [ { "format": "lift_the_lid", "why_lost": "..." } ],
      "is_swing": false, "swing_why": null, "handoff_reason": null },
    { "id": "<uuid>", "surface": "slate_pick", "subject_id": "c0044", "proposed": null,
      "handoff_reason": "evidence_must_be_created", "says": "...", "fix_hint": "...", "title": "..." }
  ]
}
```

`id` must be the row's real uuid in `public.suggestions`: a verdict is a
foreign key to it, and the page refuses to rule on a card with no bank id.

## How a verdict travels

Every ruling is written twice, and the card says which happened:

1. **The bank.** Through the viewer's own Supabase connector, the page runs
   one `insert into public.suggestion_verdicts ... on conflict (suggestion_id, round)`.
   That is why the artifact declares the `mcp` capability with the Supabase
   connector and the `execute_sql` tool, and nothing else. Consent is asked on
   the first tap, never on load.
2. **The page's own store.** The `db` capability keeps `verdicts/<suggestion_id>`
   so a ruling made without the connector is held rather than lost. The card
   reads "held here, not in the bank yet" and the weekly runner, or a session,
   syncs it.

Rounds are first class: ruling on a card a second time writes round 2. The
delta the page computes is form only (length, sentences, em dashes,
exclamation marks, a rewritten opening, hashes of before and after), never the
subject, because the bank's CHECK refuses any other key. See
`delta_keys_are_form_only()` in control-center.

## Rules the page holds

- Accept, Tweak, Replace, Reject, and Not now. A reject needs a reason chip or
  eight characters of note, because a reject with no reason teaches nothing.
- Hand-offs are shown, not ruled on. The machine stopped for a named reason and
  the card says the reason's sentence.
- One card in the slate is marked the swing (the proposalPlay rule).
- No em dashes, no exclamation marks, nothing clamped or ellipsised.
