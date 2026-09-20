#!/usr/bin/env python3
"""emit_sql.py (run from the week's directory): slate.json -> the SQL that puts
this week's slate in the bank. Prints only; nothing is executed here."""
import json, io, os, sys

if len(sys.argv) > 1: os.chdir(sys.argv[1])   # the week's directory

slate = json.load(io.open('slate.json'))
prov  = json.load(io.open('provenance.json'))['by_label']
raw   = json.load(io.open('candidates.json'))
BATCH = 12
scored_by, checked_by = {}, {}
for i, c in enumerate(raw['candidates']):
    cid = c['candidate_id']
    scored_by[cid] = prov.get('score:batch-%d' % (i // BATCH))
    checked_by[cid] = sorted({m for m in (prov.get('verify:%s:%s' % (l, cid))
                                          for l in ('evidence', 'format', 'voice')) if m})
# the one check re-run by hand after the workflow was stopped
checked_by['c0141'] = sorted(set(checked_by.get('c0141') or []) | {'claude-opus-5'})

def q(v):
    return 'null' if v is None else "'" + str(v).replace('\x00', '').replace("'", "''") + "'"
def j(v):
    return 'null' if v is None else q(json.dumps(v, ensure_ascii=False)) + '::jsonb'

vals = []
for r in slate['suggestions']:
    cid = r['subject_id']
    handoff = r.get('handoff_reason')
    proposed = None if handoff else r.get('proposed')
    reason = (r.get('reason') or '').strip()
    assert len(reason) >= 12, cid
    assert (proposed is None) != (handoff is None), cid
    producer = {
      'agent': 'intake-and-first-slate',
      'prompt_revision': '2026-09-19.1',
      'run': 'first-slate:2026-W38',
      'scored_by': scored_by.get(cid),
      'checked_by': checked_by.get(cid) or [],
      'selection_rules': slate['selection_rules'],
    }
    vals.append('(%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)' % (
      q(r['surface']), q('slate_candidates'), q(cid), j(proposed), q(reason),
      ('null' if r.get('confidence') is None else str(float(r['confidence']))),
      j(r.get('alternatives') or []), j(producer), q(handoff), q('first-slate:2026-W38')))

print("""-- One new hand-off reason. Sixteen candidates were checked and the check found
-- the cited source does not carry the claim as framed. That refusal recurs and
-- had no name, so it gets one rather than being recorded as a silence.
insert into public.handoff_reasons (slug, label, says, fix_hint, severity) values
  ('claim_not_in_source',
   'the source does not carry the claim',
   'The check ran and the cited source does not carry the claim as the row frames it. That is a refutation, not a thin source: the piece cannot be written from this evidence without changing what it claims.',
   'Point the row at the reporting that carries the claim, or restate the claim to what the source actually says. Either makes it writable; neither is a guess the machine may make for you.',
   'blocking')
on conflict (slug) do nothing;

insert into public.suggestions (surface, subject_table, subject_id, proposed, reason, confidence, alternatives, producer, handoff_reason, run_id) values
""" + ',\n'.join(vals) + """
returning id, surface, subject_id, handoff_reason;""")
