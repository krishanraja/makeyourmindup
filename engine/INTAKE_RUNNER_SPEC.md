---
kill_list_scope: canon
---
# The intake runner

The Score job from `ENGINE_SPEC.md`, made concrete over one table. Once a week
it reads everything that arrived, applies the deterministic gates, scores what
survives against the three subchannel mandates, proposes a slate, and writes a
row for every single thing it read saying what happened to it. It publishes
nothing, writes no prose, renders no screen.

Ruling (Krish, 2026-09-19): one pipeline, zero duplicative machinery, one set
of data coming in, assessed, scored, decided on and proposed.

The data model it runs over is
`control-center/supabase/migrations/20260919120000_one_intake.sql`. Read that
file's header first. Every table name below is from it or from the learning
bank migration `20260919100000_every_output_is_a_suggestion.sql`.

## Where it lives, when it runs, who runs it

| | |
|---|---|
| Code | `apps/machine/intake-runner/` in this repo. Nothing else in `apps/machine` yet, and that is correct until phase 2 of the step plan. See the phase note at the end. |
| Schedule | Saturday 21:00 UTC. After the engine's Saturday 05:00 build signals and its Friday arc surfacing, before the Sunday board opens. |
| Runner | A GitHub Actions cron in this repo. Not n8n (its execution count is the one uncapped budget in the fleet) and not the VPS (being wound down). |
| Secrets, by name only | `SUPABASE_SERVICE_KEY` for the Mindmaker OS project, `ANTHROPIC_API_KEY`. Read from the environment at run time. A missing key stops the run before the first read, exit 78, and says which name is missing. |
| Run id | `intake-score:<ISO week>`, for example `intake-score:2026-W38`. Written to `content_engine_runs.job = 'intake_score'` and copied into `suggestions.run_id` and `raw.assessment.run_id`, so a week's rows can be found from any side. |
| Model calls | One batched call per sixty items, sequential, temperature 0. Model id and prompt revision hash are recorded on every suggestion in `producer`. Never one call per item. |

## The five inputs, and what each may be used for

| Input | Where | What it may do | What it may never do |
|---|---|---|---|
| The queue | `intake_items` where `state = 'new'`, plus `assessed` rows whose `story_key` gained a member this week | Be read, gated, scored, promoted, dropped | Be deleted, or left `new` after a completed run |
| The mandates | `venture_formats` where `venture_slug = 'publication'` and `active`, `kind = 'subchannel'` for the three slots, `kind = 'holding'` for `general` | Be pasted verbatim into the scoring prompt and used to decide which subchannel claims a subject | Be copied into this repo, summarised, or paraphrased. A null mandate on an active subchannel stops the run |
| The rubric | `quality/panel/rubric.v1.json` for the criteria and gates; `calibration/2026-09-17-commissioning-round-1.json`, key `weights_as_he_left_them` only, for the weights | Weight the eight scores | Read any other key of the calibration file. The `votes` key is never loaded. The runner asserts the weights equal the rubric file's weights and stops on a mismatch, because a silent drift is how a calibration stops being reproducible |
| The kill list | `quality/panel/kill-list.v1.json`, through `check()` exported by `scripts/qa/kill-list.mjs` | Veto before any model call | Be reimplemented. One list owns each word |
| The reasons | `handoff_reasons` | Name why a row ended or why the runner will not decide | Be invented. A slug the table does not hold is a write the runner refuses, and the refusal is a run failure, not a fallback |

Two more tables are written and never read as input: `suggestions` and
`content_ideas`. The runner never reads `suggestion_verdicts`, the slate record,
Krish's approvals, or anything that says which subjects he liked. Weights are
how much each question counts. Votes are which subjects he said yes to. The
first is allowed and the second is the anti-echo rule's exact prohibition,
because a scorer that ranks by resemblance to past approvals still returns a
full slate and the failure is invisible.

## The steps, in order

Cheap and deterministic first. A model is consulted once, batched, only after
everything decidable without judgement has been decided.

### 1. Open the run

Insert `content_engine_runs` (`job = 'intake_score'`, `trigger = 'cron'`,
`status = 'ok'` provisionally, `counts = {"run_id": "<run id>"}`). Load the three mandates. If any
active subchannel has a null or blank mandate, write one `suggestions` row on
the `slate_pick` surface with `proposed = null`, `handoff_reason =
'mandate_missing'`, `subject_table = 'venture_formats'`, `subject_id = <slug>`,
mark the run `failed` with reason `mandate missing: <slug>`, and stop. Nothing
in intake is touched.

Load the weights. Assert they equal the rubric's. Mismatch stops the run the
same way, reason `weights drifted: <key> rubric <a> calibration <b>`.

### 2. Read the queue

Every `intake_items` row with `state = 'new'`, ordered by `received_at desc
nulls last`, then `first_seen_at desc`, capped at 400. Above the cap the rest
stays `new` and the count goes in `counts.deferred_by_cap`, because a cap that
hides work looks identical to having none.

Also every `assessed` row whose `story_key` matches a story that a `new` row
joins in step 6. A story that grew is new evidence and the row is re-scored.

### 3. Normalise the carried text

On `title`, `claim` and `snippet`, in place: U+2014 and U+2013 become a comma
and a space, a run of commas collapses to one, an exclamation mark at the end
of a sentence becomes a full stop and elsewhere is removed, whitespace
collapses. `raw` is untouched and still holds the verbatim source text. This
is punctuation, not prose: the same class of change as `canonicalUrl()`.

It exists because the kill list was written for our copy, and two of its rules
(`em_dash`, `exclamation`) describe typography a third party's headline carries
freely. Without this step half the newsletters would be vetoed for their
subject lines. With it, the kill list decides on what the source said and not
on how it was punctuated.

### 4. The kill list

Run `check(text)` on the string `title + "\n\n" + claim + "\n\n" + snippet`
for every row. Any finding with `level = 'veto'` ends the row: `state =
'dropped'`, `drop_reason = 'kill_list_veto'`, `assessed_at = now()`,
`raw.kill_list = findings`. Warnings are stored on `raw.kill_list` and change
nothing. `counts.kill_list` holds vetoes by rule and by source.

The known cost, stated so it is measured rather than discovered.
`banned_vocabulary` will veto a real story whose source wrote "leverage" as a
noun. `product_in_editorial` will veto anything that names Mindmake or CTRL,
which at intake is also the NOT US gate every mandate carries, so that one is
right by construction. `retired_name` and `preach_pattern` are right on
anyone's text. If the per-rule counts show one rule dominating one source, the
question of whether a rule written for our copy should apply to someone else's
headline goes to Krish as a ruling. The runner does not narrow the gate on its
own. Recommendation for that ruling: a `scope` field per rule in
`kill-list.v1.json`, `ours` or `any`, so the list says it once.

### 5. The host denylist

For rows with a `url`: `isLowQualityHost(host)` from mm-ctrl's
`news-sources.ts`, ported as a pure function with its test beside it. A hit
ends the row: `dropped`, `source_denylisted`, `raw.denylist = {host, rule}`.
Rows without a URL skip this step and say so in `raw`.

### 6. Dedupe by story

Two questions, kept separate as `existing-scorers.md` section 3 lays out.

File level is already answered by the unique `(source, source_ref)`: the same
message, file or link cannot arrive twice from one source.

Story level is this step. Candidates are the surviving rows from steps 4 and 5
plus every non-dropped `intake_items` row with `received_at` in the last 21
days. Two rows are the same story when any of these holds, checked in this
order, first hit wins and is recorded as `raw.dedupe.match`:

1. `canonicalUrl(a.url) = canonicalUrl(b.url)` (content-engine `_text.ts`).
2. Both carry a `story_key` and it is equal.
3. `jaccard(titleTokens(a.title), titleTokens(b.title)) >= 0.5`, the two pure
   functions from mm-ctrl's `news-cluster.ts`, ported with their tests.

Clustering is greedy and best-first, as `clusterArticles()` does it: rows are
ordered by `compareArticleStrength` (source tier, then freshness) so the
representative is the strongest member. Source tier uses content-engine's
`sourceTier(url)`, the one scale the shared layer keeps (0 primary to 4
aggregator, lower is better).

Assignment: if any member already has a `story_key`, every member inherits it.
Otherwise the key is `story:<representative intake id>`. A `new` row that joins
a story whose representative is another row ends as `dropped`, `drop_reason =
'duplicate_story'`, `dedupe_of = <representative id>`. It still counts.
`sources_count` for the story is the number of distinct root domains across
every member, dropped ones included, and rides forward on the representative
as `raw.story.sources_count`.

Embedding similarity is not used. The thresholds in mm-ctrl (0.87) and
content-engine (0.92) exist and are good; they need a key the runner does not
hold and they are not deterministic across model versions. If the Jaccard pass
proves too coarse the run counts will say so (`counts.stories` against
`counts.candidates`) and the decision to add it is a change to this spec.

### 7. The mandate check and the scores

One batched model call per sixty representatives, sequential, temperature 0.
The prompt carries the three mandates verbatim from `venture_formats.mandate`,
the `general` mandate as the holding lane, and per item: `title`, `claim`,
`snippet`, the URL's host, `received_at`, `sources_count`. It carries no
history, no past picks, no verdicts.

The model returns strict JSON per item and nothing else:

```
{
  "id": "<intake id>",
  "format": "split_the_bill" | "mind_the_gap" | "lift_the_lid" | "general" | "ambiguous",
  "question": "who pays" | "sharper or dependent" | "the gap over time" | "none",
  "coverage": "signature" | "broad",
  "scores": { "angle": 0-5, "number": 0-5, "fresh": 0-5, "fun": 0-5,
              "fit": 0-5, "make": 0-5, "preach": 0-5, "exists": 0-5 },
  "number_quoted": "<verbatim span from the item text>" | null,
  "why": { "angle": "<one line>", ..., "exists": "<one line>" }
}
```

`format` is decided by the boundary test written into the mandates: the
question decides, never the surface. `question` is the answer to that test and
is stored so a wrong assignment can be traced to a wrong answer.

Deterministic checks on the reply, per item, before anything is stored:

- `number_quoted` must be a verbatim substring of the carried text or of
  `raw`. If it is not, `scores.number` is set to 0 and `raw.assessment.note`
  says `number not in source`. A number the model saw and the source does not
  carry is the default failure mode, and it is caught here, not trusted.
- Every score is an integer 0 to 5, else the batch is malformed.
- `format` is one of the five strings, else malformed.
- Every `id` in the request is in the reply, else malformed.

A malformed batch is retried once with the validation error quoted back. A
second malformed reply fails the run: `status = 'failed'`, reason `scorer
returned unusable JSON twice`, and every row in that batch stays `new`.

There is no deterministic fallback for scoring. mm-ctrl's fallback pattern
picks among rows that already carry scores; it does not invent them. A model
that is down (5xx, timeout) fails the run with the status quoted. A model that
refuses the key (401, 402, 403) is a deployment fault and fails the run with
reason `deployment fault: <status>`, the same posture as
`systemicComposerFailure()` in content-engine. Rows stay `new` either way and
the next run reads them.

### 8. The rubric gates

Applied to the validated scores, in this order, first hit ends the row. Each
records the observed value in `raw.assessment.gate`.

| Order | Rule | Outcome |
|---|---|---|
| 1 | `exists < 2` (the MATERIAL EXISTS hard gate every mandate names) | `dropped`, `evidence_must_be_created` |
| 2 | `number < 3` (rubric gate `no_number`) | `dropped`, `no_number_to_chase` |
| 3 | `coverage = signature` and `fresh <= 2` and `fun < 4` and `angle < 4` (rubric gate `over_covered`) | `dropped`, `over_covered` |
| 4 | `format = none` (the model answered nothing usable and validation passed) | `dropped`, `no_format_claims_it` |
| 5 | `format = ambiguous` | `assessed`, plus one hand-off row (step 10). Not dropped: a re-pitch with a sharper question could resolve it |
| 6 | `format = general` | `assessed`, no suggestion. general is the holding lane and collecting is what it is for |
| 7 | `preach >= 4` (rubric gate `preach_flag`) | Flag carried as `proposed.flags = ['preach']`. Never a cut |

### 9. The weighted score

`score = sum over criteria of weight × value`, with `preach` inverted as `5 -
preach`. Weights from the calibration file's `weights_as_he_left_them`: angle
2.5, number 2.0, fresh 2.5, fun 2.5, fit 2.0, make 1.5, preach 2.5, exists
2.0. Maximum 87.5. Stored as `raw.assessment.score` with the eight components.

It is never averaged with the arc score (`arc_cards.components`, is the arc
real) or the panel score (`panel/judges.json`, is the work good enough).
Three questions, run in order, never one number.

### 10. The slate

Slots come from `venture_formats.target_per_week`: `mind_the_gap` 1,
`split_the_bill` 1, `lift_the_lid` 0.5. A fixed slot is filled by the best
scoring survivor claimed by that format. A half slot is offered only when that
format's best survivor scores at or above the lower of the two fixed picks;
otherwise its best survivor is listed as an alternative and the slot is
reported empty. This is a rule proposed here, not a ruling, and it is the
first thing to revisit when the counts show lift.the.lid never getting a slot
or always getting one.

Caps, applied after ranking: at most two `coverage = broad` picks across the
slate (rubric gate `broad_cap`); at most two picks from one intake source
(`capPerSource`); a story appears once. Ordering is by score, then
`sources_count`, then newer `received_at`. Never by age. Age promoted a 10
July item to slot one for six weeks once.

Each pick carries two alternatives: the next two survivors for the same
format, with `why_it_lost` as the score difference and the one component that
differed most. Nine times in ten a rejected pick's right answer was the
runner-up, and the bank needs to know the runner saw it.

Survivors not picked end as `assessed` with their scores on the row. They are
eligible for re-scoring only if their story grows.

### 11. The writes, in order

Per pick, in this order, so that a failure between steps leaves a state the
next run can read rather than a half-written one:

1. `content_ideas` insert: `idea = title`, `thesis = claim`, `source_type =
   <intake source>`, `source_ref = <intake id>`, `source_url = url`,
   `source_snippet = snippet`, `source_captured_at = received_at`, `state =
   'seeded'`, `lane_slot = <format slug>`, `horizon = 'news'`, `origin =
   'agent'`, `meta = {intake_item_id, story_key, run_id}`. The bridge trigger
   `trg_intake_mirror_content_idea` reads `meta.intake_item_id` and flips the
   intake row to `promoted` with `promoted_idea_id` set, in the same statement.
2. `suggestions` insert on the `slate_pick` surface, `subject_table =
   'content_ideas'`, `subject_id = <idea id>`.
3. `suggestions` insert on the `format_assignment` surface, same subject.

A pick whose idea insert succeeded and whose suggestion insert failed is found
on the next run by `promoted_idea_id is not null` with no `suggestions` row
carrying that `subject_id` and this week's `run_id`, and the two suggestion
rows are written then. No pick is ever promoted twice: the unique `(source,
source_ref)` on intake and the `meta.intake_item_id` path through the trigger
make the second attempt a no-op.

Hand-off rows, `proposed = null`, for what the runner will not decide:

| Case | Surface | `subject_table` / `subject_id` | `handoff_reason` |
|---|---|---|---|
| Format ambiguous (step 8, row 5) | `format_assignment` | `intake_items` / intake id | `format_ambiguous_question` |
| Mandate missing (step 1) | `slate_pick` | `venture_formats` / slug | `mandate_missing` |

Both surfaces declare `subject = 'content_ideas'` in `suggestion_surfaces`. A
hand-off on a row that was never promoted has no idea to point at, so it
points at the intake row and `subject_table` says so. That is the one stated
exception, and it is why `subject_table` is a column and not a constant.

Drops are not hand-off rows. A drop is decided, by a rule, and the reason is
on the intake row where `intake_drops_by_reason` counts it. A hand-off is
undecided and sits in the bank where `autonomy_evidence` counts it.

Every non-dropped row read this run gets `state = 'assessed'` (or `promoted`)
and `assessed_at = now()` and `raw.assessment` filled. No row is left `new`.

### 12. Close the run

Update the `content_engine_runs` row: `finished_at`, `status`, `reason`, and
`counts`:

```
run_id, read, deferred_by_cap, normalised, kill_list: {by_rule, by_source},
denylisted, candidates, stories, duplicates, model_calls, malformed_batches,
no_format, ambiguous, general, evidence_missing, no_number, over_covered,
scored, picks, empty_slots, alternatives, promoted, assessed, dropped,
handoffs
```

Then the self-check, which reads back rather than trusts:

- every row read has `state <> 'new'`, or the run is `failed`;
- `read = promoted + assessed + dropped + deferred_by_cap`;
- every promoted row has exactly one `slate_pick` and one `format_assignment`
  suggestion with this `run_id`;
- every hand-off row names a slug present in `handoff_reasons`;
- zero picks is a valid result and is written as `picks = 0` with `status =
  'ok'`, so a quiet week is not mistaken for a run that did not happen.

Any failed check sets `status = 'failed'` with the check named. The Content
tab reads this row; nothing else announces it. The OS is pull-only.

## The reason on every suggestion

`suggestions.reason` is NOT NULL and at least twelve characters by constraint.
It is a fixed template with observed values, never a model sentence, for the
same reason `terminalStatement()` is fixed: a template cannot be softened into
marketing.

Slate pick:

> Scored `<score>` of 87.5: angle `<a>`, number `<n>` (quoted "`<number_quoted>`"), fresh `<f>`, fun `<u>`, fit `<i>`, make `<m>`, preach `<p>` inverted, exists `<e>`. Claimed by `<format>` because the question is `<question>`. `<sources_count>` sources across `<stories>` story members. Rank `<rank>` of `<survivors>` for this format.

Format assignment:

> `<format>` because the piece asks `<question>`. The other claimant would have been `<second>`, which asks `<its question>`, and the text does not.

Hand-off:

> The `says` text of the `handoff_reasons` row, verbatim, followed by the observed value in one clause.

## The shapes

`proposed` on `slate_pick`:

```
{ "week": "2026-W38", "slot": "mind_the_gap", "rank": 1,
  "score": 61.5, "components": { "angle": 4, ... },
  "number_quoted": "38-page", "question": "the gap over time",
  "coverage": "signature", "story_key": "story:<uuid>", "sources_count": 3,
  "flags": [] }
```

`proposed` on `format_assignment`:

```
{ "format": "lift_the_lid", "question": "sharper or dependent",
  "second": "split_the_bill", "second_question": "who pays" }
```

`alternatives`, both surfaces:

```
[ { "intake_item_id": "<uuid>", "score": 58.0,
    "why_it_lost": "3.5 behind on score; fresh 2 against 4" }, ... ]
```

`producer`, every row:

```
{ "agent": "intake-runner", "version": "<git sha of this repo>",
  "model": "<model id as called>", "prompt_rev": "<sha256 of the prompt template>",
  "rubric": "rubric.v1", "kill_list": "kill-list.v1",
  "calibration": "2026-09-17-commissioning-round-1, weights only",
  "run_id": "intake-score:2026-W38" }
```

`confidence`, deterministic from what was observed, never from the model:

| Observed | Confidence |
|---|---|
| Number quoted and found in source; format not ambiguous; `sources_count >= 2` | 0.9 |
| Number quoted and found; format not ambiguous; one source | 0.7 |
| Number score kept but no span quoted | 0.5 |
| Format assigned with `question = none` | 0.4 |
| Hand-off | null |

## Idempotency and re-runs

The run id is the ISO week. A second run in the same week first looks for a
`content_engine_runs` row with `job = 'intake_score'` and this week's id in
`counts.run_id`. If that row is `ok`, the new run reads only rows still `new`
(late arrivals) and reports itself as `trigger = 'manual'`; it does not
re-score assessed rows or re-pick the slate, because the Sunday board may
already be open on it. If that row is `failed`, the new run proceeds in full.
Rows the failed run left `new` are simply read again.

## What it never does

- Publish, send, schedule, deploy or spend beyond the batched model call.
- Write a headline, an opening, or any sentence a reader will see. Titles are
  carried, normalised for punctuation, and never rewritten.
- Read `suggestion_verdicts`, the calibration `votes`, the slate record, or
  any table that says what Krish approved.
- Order by age, or let a newer row beat a better one.
- Average the three questions into one number.
- Fall back. A rule it cannot apply is a run failure with the rule named, not a
  quiet default.
- Delete an intake row, or move one back to `new`.
- Render anything. It writes rows; Control Center draws them.

## What is verified and what is inferred in this spec

Verified on 2026-09-19 against the live project: every table and column named
above exists with the type used; the six source types and their counts; the
three subchannel mandates are present and non-blank; `handoff_reasons` holds
the ten learning-bank rows and the migration adds eight more;
`content_engine_runs` has the columns the run row uses.

Inferred, and marked as such where it matters: that Jaccard at 0.5 on titles
is good enough for a first story clustering (mm-ctrl runs it live, but on
headlines from wire services, not on newsletter subjects); the half-slot rule
for lift.the.lid; that the kill list should run whole on third-party text.
Each is a number or a rule the run counts will test in the first month.

## The phase note

The step plan puts the data model, the rubric as a tested function and the
kill list in phase 1, and the machine in phase 5, behind the dry runs. This
spec follows that split. The migration and steps 3, 4, 5, 6, 8 and 9 are pure
functions over rows and can be built and tested now with fixtures. Steps 7, 10
and 11 touch the model and write the slate, and are phase 5 work, because the
dry runs fix the template and the template decides what a pick is for.

## Acceptance checks

Deterministic, run after the first live run, all must hold:

```sql
-- Nothing read was left unread. The only rows still new from before the run
-- started are the ones the cap deferred, and the run row says how many.
select count(*) from intake_items
 where state = 'new' and first_seen_at < (select started_at from content_engine_runs
   where job = 'intake_score' order by started_at desc limit 1);
-- expected: equal to counts->>'deferred_by_cap' on that run row

-- Every promoted row has both suggestions.
select i.id from intake_items i
 where i.state = 'promoted' and i.assessed_at >= now() - interval '1 day'
   and (select count(distinct surface) from suggestions s
        where s.subject_id = i.promoted_idea_id::text
          and s.surface in ('slate_pick', 'format_assignment')) <> 2;
-- expected no rows

-- Every drop names a reason the table holds. Enforced by the foreign key;
-- this is the readback.
select drop_reason, count(*) from intake_items
 where state = 'dropped' group by 1 order by 2 desc;

-- The run row adds up.
select counts from content_engine_runs where job = 'intake_score'
 order by started_at desc limit 1;
```
