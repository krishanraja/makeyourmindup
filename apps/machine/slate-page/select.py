#!/usr/bin/env python3
"""Pick this week's slate from the scored pool and the cached lens verdicts.

  select.py   (run from the week's directory)  ->  selection.json

Reads scored.json, verdicts.json and candidates.json beside it.

Every rule here is stated, deterministic and applied in a fixed order, so the
same inputs produce the same slate and a ruling that overturns it is a ruling
about the rule rather than about a mood. Ordering is composite, then how many
independent sources carry the story, then recency. Never by age: an older row
whose story is still live is not worse than a new one, it is just older.
"""
import json, io, os, sys, collections, urllib.parse

if len(sys.argv) > 1: os.chdir(sys.argv[1])   # the week's directory

BAR = 6.5
TARGET = {'split_the_bill': 1.0, 'mind_the_gap': 1.0, 'lift_the_lid': 0.5}
MAX_ALTS = 2
SOURCE_CAP = 2          # at most two cards from one publication across the slate

sc   = json.load(io.open('scored.json'))
ver  = json.load(io.open('verdicts.json'))
raw  = json.load(io.open('candidates.json'))
cand = {c['candidate_id']: c for c in raw['candidates']}

def domain(cid):
    u = (cand.get(cid) or {}).get('url') or ''
    try:
        h = urllib.parse.urlparse(u).netloc.lower()
    except Exception:
        return 'unknown'
    return h[4:] if h.startswith('www.') else (h or 'unknown')

def sources_count(cid):
    return len((cand.get(cid) or {}).get('provenance') or []) or 1

def received(cid):
    return (cand.get(cid) or {}).get('received_at') or ''

def check_state(cid):
    v = ver.get(cid)
    if not v:
        return 'unchecked', []
    lenses = [k for k in ('evidence', 'format', 'voice') if k in v]
    if any(not v[k]['passes'] for k in lenses):
        return 'refuted', lenses
    return ('verified' if len(lenses) == 3 else 'part_checked'), lenses

# ── 1. the eligible pool ────────────────────────────────────────────────────
elig, refuted, below = [], [], []
for r in sc:
    cid = r['candidate_id']
    if r.get('handoff_reason'):
        continue
    g = r.get('gates') or {}
    if g.get('not_us') or not g.get('material_exists'):
        continue
    st, lenses = check_state(cid)
    r = dict(r, check_state=st, lenses=lenses,
             domain=domain(cid), sources=sources_count(cid), received=received(cid))
    if st == 'refuted':
        refuted.append(r); continue
    (elig if (r.get('composite') or 0) >= BAR else below).append(r)

order = lambda r: (-(r['composite'] or 0), -r['sources'], r['received'] or '', r['candidate_id'])
elig.sort(key=order)

# ── 2. the pick per fixed-cadence format, then the standing one ────────────
used_domain = collections.Counter()
chosen = {}

def take(fmt, pool, n):
    out = []
    for r in pool:
        if r['format'] != fmt or r['candidate_id'] in {x['candidate_id'] for x in out}:
            continue
        if used_domain[r['domain']] >= SOURCE_CAP:
            r['_capped'] = True
            continue
        out.append(r); used_domain[r['domain']] += 1
        if len(out) == n: break
    return out

for fmt in ('mind_the_gap', 'split_the_bill'):          # hero first, then the money slot
    verified = [r for r in elig if r['format'] == fmt and r['check_state'] == 'verified']
    pick = take(fmt, verified, 1)
    alts = take(fmt, [r for r in elig if r['format'] == fmt
                      and r['candidate_id'] not in {p['candidate_id'] for p in pick}], MAX_ALTS)
    chosen[fmt] = {'pick': pick[0] if pick else None, 'alts': alts}

# lift.the.lid: target 0.5 a week. Its mandate says it publishes when a subject
# earns it, because a third fixed slot costs hours the two-to-four-hour rule does
# not have. So it fills against a RAISED BAR of its own, the standing 6.5 plus a
# one-point premium for being an extra piece rather than a scheduled one. It is
# deliberately not judged against the other two picks: a standing format that
# only runs in a weak week would run for the wrong reason. When it does not
# fill, the near miss is named rather than hidden.
floor = BAR + 1.0
lid_v = [r for r in elig if r['format'] == 'lift_the_lid' and r['check_state'] == 'verified']
lid_best = lid_v[0] if lid_v else None
lid_fills = bool(lid_best and lid_best['composite'] >= floor)
if lid_fills:
    pick = take('lift_the_lid', lid_v, 1)
    alts = take('lift_the_lid', [r for r in elig if r['format'] == 'lift_the_lid'
                                 and r['candidate_id'] not in {p['candidate_id'] for p in pick}], MAX_ALTS)
    chosen['lift_the_lid'] = {'pick': pick[0] if pick else None, 'alts': alts}
else:
    chosen['lift_the_lid'] = {'pick': None, 'alts': [], 'near_miss': lid_best, 'floor': floor}

json.dump({'chosen': {k: {kk: (vv if not isinstance(vv, dict) else vv) for kk, vv in v.items()}
                      for k, v in chosen.items()},
           'counts': {'eligible': len(elig), 'refuted': len(refuted), 'below_bar': len(below)},
           'lid_fills': lid_fills, 'floor': floor},
          io.open('selection.json', 'w'), indent=1, ensure_ascii=False)

print('eligible %d  refuted %d  below bar %d' % (len(elig), len(refuted), len(below)))
for f, v in chosen.items():
    p = v['pick']
    print('%-15s pick=%s  alts=%s' % (f, ('%s %.2f' % (p['candidate_id'], p['composite'])) if p else 'NONE',
          ', '.join('%s %.2f/%s' % (a['candidate_id'], a['composite'], a['check_state']) for a in v['alts']) or '-'))
if not lid_fills:
    nm = chosen['lift_the_lid'].get('near_miss')
    print('  lid did not fill: floor %.2f, best %s' % (floor, ('%s %.2f' % (nm['candidate_id'], nm['composite'])) if nm else 'none'))
