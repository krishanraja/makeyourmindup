---
kill_list_scope: canon
---
# The panel

Ten judges who never see the byline. Machine-readable roster in `panel/judges.json`.

The panel **runs on everything, unasked, and it can stop the work. It cannot
approve anything.** Only Krish approves. A piece that clears the publish bar is
eligible, not approved.

## Why disciplines and not famous people

The obvious build is ten real names and a prompt asking what each would say.
That is not what this is, and the reason is craft rather than caution.

**A persona of a real person returns a caricature.** Ask what a legendary adman
thinks and you get advertising aphorisms regardless of what is in front of it,
because the machine is pattern-matching a reputation rather than applying a
skill. Ask a discipline with one mandate, one scale and one veto, and you get a
finding with a location in the text, and the same finding twice on the same
input.

The calibre comes from the sharpness of the mandate. Every judge has a lens, a
veto, and **a territory it is forbidden to comment on**, which is what stops ten
judges all writing the same note about the headline while nobody examines the
diagram.

## The ten

| Judge | Veto | Asks |
|---|---|---|
| The Preacher-Catcher | absolute | Does any sentence tell the reader what to conclude, believe or become? |
| The Fact Checker | absolute | Who produced this number, when, counting what? |
| The Cold Reader | yes | After fifteen seconds, can you say what this is about and why it matters to you? |
| The Art Director | yes | Does the picture carry the argument, or decorate it? |
| The Line Editor | yes | Would a good editor let this line through? |
| The Sceptic | yes | What would a well-informed person who disagrees say, and does this survive it? |
| The Distribution Judge | yes | Does this survive a thumbnail, a muted autoplay and a collapsed first line? |
| The Continuity Judge | yes | Have we said this, contradicted this, or used this angle before? |
| The Agency Judge | yes | Does a reader finish more capable of judging for themselves, or merely better informed? |
| The Commissioner | **none** | Against everything else we could have run this week, was this the right use of the day? |

Each judge's catches and its forbidden territory are in `panel/judges.json`. Two
are worth repeating here because they are counter-intuitive:

- **The Agency Judge may not demand the mission be stated.** The
  Preacher-Catcher overrules it on that, deliberately.
- **The Commissioner has no veto.** Opportunity cost is Krish's call, not a
  judge's.

**The Chair is not a judge.** It aggregates, names outstanding vetoes, and
writes one paragraph on where the panel split. It has no score, no veto and no
power to soften a finding. **The split is the interesting part.** Unanimity at 8
is competence. A 9.5 from the Cold Reader against a 6 from the Sceptic is the
conversation worth having.

## Blind means blind

A judge sees the artifact and its format contract. Nothing else. No author, no
commissioning note, no rubric score, no record of what Krish liked before, and
no other judge's score until all are filed.

**The panel never sees reader verdicts from your.call.** That would turn craft
judgement into popularity prediction.

## The publish bar

| | |
|---|---|
| Every judge, minimum | **7.5** |
| Mean, minimum | **8.4** |
| Outstanding vetoes | **0** |
| How a veto clears | **by fixing the work** |

Deliberately the same shape as the website award panel, so one standard runs
across the business. **A veto is never cleared by out-voting the judge.**

## A judge never authors

Naming the failure and its location is the job. Supplying the fix is not,
because a judge who writes the line then scores it is scoring themselves.
Improvement is a separate role acting on the findings.

## When it runs without being asked

The trigger table is in `panel/judges.json` under `gates`. Two gates are
cheaper than the others and exist for that reason: the idea gate sits before a
word is written, and the draft gate after. A finding after the writing is a
rewrite. The same finding before it is a brief.

## Calibration, and its one exception

Every time Krish overrules a judge it is recorded: which judge, which piece,
which direction. A judge repeatedly overruled in the same direction is
mis-calibrated and its threshold moves, exactly as the commissioning weights
moved against his votes. Overruled in both directions means it is working.

**The Preacher-Catcher and the Fact Checker never calibrate down.** Those two
exist to hold the line when the deadline argues otherwise.
