---
kill_list_scope: canon
---
# 2026-W38, the first slate

The inputs the first slate was built from, kept so the week is reproducible and
so next week has something to be compared against. Run the four stages in
`apps/machine/slate-page` against this directory and you get back the page that
was published, byte for byte:

```
python3 ../../apps/machine/slate-page/select.py   .
python3 ../../apps/machine/slate-page/emit.py     .
python3 ../../apps/machine/slate-page/emit_sql.py . > insert.sql
python3 ../../apps/machine/slate-page/fill.py \
  ../../apps/machine/slate-page/template.html slate.json ids.json mandates.json \
  out.html provenance.json candidates.json
```

`selection.json`, `slate.json`, `insert.sql` and `out.html` are not kept: they
are derived from what is here and regenerating them is the check.

| File | What it is |
|---|---|
| `candidates.json` | 216 candidates that cleared the four intake gates, plus the 164 that did not and the reason each was dropped |
| `scored.json` | 210 scored rows: eight dimensions, a composite, the gates, and the model's reason in a sentence |
| `verdicts.json` | the three lens checks per candidate, and what each one found |
| `mandates.json` | `venture_formats`, `format_aliases`, `handoff_reasons` and `suggestion_surfaces` as read from Mindmaker OS on 2026-09-19 |
| `provenance.json` | which model actually served each agent, by label |
| `ids.json` | the uuids `public.suggestions` returned. Not derivable: a verdict is a foreign key to one of these |

## What this week is evidence of

Nothing yet. It becomes evidence when the rulings land in
`public.suggestion_verdicts` and the two sides can be compared. That is the
whole design: a suggestion with a reason on one side, a ruling with a reason on
the other, and the gap between them read over weeks. One week of suggestions
with no rulings teaches nothing, and the bank says so rather than implying a
trend.

## Known about this run

- The check stage was stopped part way. 88 of the 96 candidates over the bar were
  checked; the rest carry `unchecked` and are held as alternates rather than led
  with. Every card that was published is checked on all three lenses.
- The checks ran across two models, because the run spanned a model switch. Each
  card says which, and the footer carries the totals. The scoring is one model
  throughout.
- Three subchannels were available and all three filled. lift.the.lid cleared its
  raised bar of 7.5 with 7.83, which is the closest call on the slate.
