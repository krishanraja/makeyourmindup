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
    { "slug": "follow_the_money", "cadence": "Wednesdays", "standing_question": "...", "empty_note": "..." },
    { "slug": "mind_the_gap",   "cadence": "Fridays, the hero", "standing_question": "..." },
    { "slug": "under_the_hood",   "cadence": "Mondays", "standing_question": "..." }
  ],
  "suggestions": [
    { "id": "<uuid from public.suggestions>", "surface": "slate_pick", "subject_id": "c0012",
      "proposed": { "format": "follow_the_money", "headline": "...", "your_call_question": "...",
                    "rank": 1, "derivative_plan": [ { "kind": "written_piece", "do": true, "why": "..." } ] },
      "reason": "...", "confidence": 0.82, "alternatives": [ { "format": "under_the_hood", "why_lost": "..." } ],
      "is_swing": false, "swing_why": null, "handoff_reason": null },
    { "id": "<uuid>", "surface": "slate_pick", "subject_id": "c0044", "proposed": null,
      "handoff_reason": "evidence_must_be_created", "says": "...", "fix_hint": "...", "title": "..." }
  ]
}
```

`id` must be the row's real uuid in `public.suggestions`: a verdict is a
foreign key to it, and the page refuses to rule on a card with no bank id.

## The four stages that fill it

The page is the last stage. Everything before it is four scripts, run in order,
and each one writes a file the next one reads, so a stage can be re-run without
re-running the ones before it. That mattered the first time: the check stage was
stopped part way and the slate was finished from what was already on disk.

| Stage | Script | In | Out |
|---|---|---|---|
| Select | `select.py` | `scored.json`, `verdicts.json`, `candidates.json` | `selection.json` |
| Compose | `emit.py` | `selection.json`, `mandates.json` | `slate.json` |
| Bank | `emit_sql.py` | `slate.json`, `prov-slate.json` | the INSERT, and `ids.json` from its RETURNING |
| Fill | `fill.py` | `slate.json`, `ids.json`, `mandates.json`, `prov-slate.json` | the page |

### The selection rules, all of them

Every rule is stated and deterministic, so the same inputs give the same slate
and a ruling that overturns one is a ruling about the rule rather than about a
mood. The rules travel with the row: `suggestions.producer.selection_rules`
carries them, so a verdict six months from now can be read against the rule that
was in force when the suggestion was made.

- **The bar is 6.5.** Below it a candidate is not eligible, whatever else is true
  of it.
- **The gates come first.** `not_us` true or `material_exists` false removes a
  candidate before any score is looked at.
- **Order is composite, then how many independent sources carry the story, then
  recency.** Never by age: an older row whose story is still live is not worse
  than a new one, it is only older.
- **A pick must be checked on all three lenses.** A candidate that scored higher
  but has not been checked is held as an alternate and its card says why. The
  machine does not lead with something it has not verified, and the first slate
  had exactly this case at the top of follow.the.money.
- **A candidate the evidence lens refuted is never a pick or an alternate.** It
  becomes a `claim_not_in_source` row instead.
- **One pick and up to two alternates per format.**
- **At most two cards from one publication across the whole slate**, so a single
  newsletter cannot own the week.
- **under.the.hood is a fixed Monday slot**, filled like the other two, since
  2026-09-26, when the makeyourmindup cover page went live promising Mon, Wed
  and Fri. Until then it was a half slot that filled only against a raised bar
  of 7.5, as an extra piece rather than a scheduled one.
- **Exactly one card is the swing**: the one with the weakest load-bearing
  number, so unlike every other card it has to work on the angle rather than the
  figure. That is the bet, and the card says it is one.

### The derivative plan, also a rule

Each card carries five assets with a do-or-skip and a reason, from the piece's
own scores rather than from a preference:

- `written_piece` and `your_call_artifact` always run. The first is the spine
  everything else is cut from; the second is the format's standing question, and
  it is the interactive piece rather than a decoration on the article.
- `long_video` runs when the number scores 7 or more, because below that a long
  video is a person asserting rather than showing.
- `short_cuts` run when the piece scores 7 or more for life, because short cuts
  off a flat piece are the fastest way to look like everyone else.
- `ig_carousel` runs when both the number and the angle score 7 or more, because
  a carousel with nothing countable in it is the headline broken over six slides.

A skip is shown struck through with its reason on hover, not hidden. The point
is that the machine proposed an amplification plan and said why, so a ruling can
disagree with the rule rather than with a blank.

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

## Which model produced each card

More than one model can produce one slate: a run that is stopped and resumed
picks up whatever model the session is on, and a week's work can span a switch.
The first slate did, so the page says so rather than implying one author.

`provenance.py <workflow-dir>` reads the run's journal for agent labels and each
agent transcript for the model that actually served it, and emits `{label: model}`.
`fill.py` maps that onto candidates: the scoring batch a candidate fell in
(`score:batch-<i>` where `i` is its index divided by the batch size) and its
three checks (`verify:evidence|format|voice:<candidate_id>`).

Each card then carries one line, "scored by X, checked by Y", and the footer
carries the totals. A card nobody checked says "not yet checked" rather than
leaving the reader to assume. An agent that was served by more than one model
mid-run reports both, joined by a plus, rather than picking one.

The point is not the model names. It is that a ruling is evidence about the
thing that produced the suggestion, and the bank cannot tell you whether a
producer improved if it does not know which producer it was. `suggestions.producer`
carries the same fact for the row.

## Rules the page holds

- Accept, Tweak, Replace, Reject, and Not now. A reject needs a reason chip or
  eight characters of note, because a reject with no reason teaches nothing.
- Hand-offs are shown, not ruled on. The machine stopped for a named reason and
  the card says the reason's sentence.
- One card in the slate is marked the swing (the proposalPlay rule).
- No em dashes, no exclamation marks, nothing clamped or ellipsised.
