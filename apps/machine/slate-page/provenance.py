#!/usr/bin/env python3
"""Which model produced each result in a workflow run.

  provenance.py <workflow-dir> [out.json]

Reads the journal for agentId -> label, and each agent transcript for the model
that actually served it. Emits {label: model} plus a per-stage roll-up, so a
card or a row can say who decided it rather than implying one author.

A label that ran more than once (a stop, then a resume) keeps the model of the
run that produced the result the workflow used, which is the LAST completed one.
"""
import json, io, os, sys, glob, collections

d = sys.argv[1]
out = sys.argv[2] if len(sys.argv) > 2 else None

# journal: agentId -> label, in order, plus which agents produced a result
lab, ordered, produced = {}, [], set()
for line in io.open(os.path.join(d, 'journal.jsonl'), encoding='utf-8'):
    line = line.strip()
    if not line:
        continue
    try:
        r = json.loads(line)
    except Exception:
        continue
    aid = r.get('agentId')
    if r.get('type') == 'started' and aid:
        lab[aid] = r.get('label')
        ordered.append(aid)
    if r.get('type') == 'result' and aid:
        produced.add(aid)

def model_of(aid):
    f = os.path.join(d, 'agent-%s.jsonl' % aid)
    if not os.path.exists(f):
        return None
    seen = []
    for line in io.open(f, encoding='utf-8'):
        line = line.strip()
        if not line:
            continue
        try:
            r = json.loads(line)
        except Exception:
            continue
        m = (r.get('message') or {}).get('model')
        if m and m != '<synthetic>' and m not in seen:
            seen.append(m)
    # A serving fallback mid-agent would show two; report both rather than pick.
    return seen[0] if len(seen) == 1 else ('+'.join(seen) if seen else None)

by_label = {}
for aid in ordered:                       # later runs overwrite earlier ones
    if aid not in produced:
        continue                          # killed or failed; it produced nothing
    m = model_of(aid)
    if m:
        by_label[lab.get(aid)] = m

stages = collections.defaultdict(collections.Counter)
for l, m in by_label.items():
    stages[(l or '').split(':')[0]][m] += 1

res = {
    'by_label': by_label,
    'by_stage': {k: dict(v) for k, v in sorted(stages.items())},
    'models': dict(collections.Counter(by_label.values())),
}
if out:
    io.open(out, 'w', encoding='utf-8').write(json.dumps(res, indent=2, ensure_ascii=False))

print('labels with a result: %d' % len(by_label))
for stage, c in sorted(stages.items()):
    print('  %-10s %s' % (stage, dict(c)))
print('overall: %s' % res['models'])
