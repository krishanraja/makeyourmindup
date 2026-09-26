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
TARGET = {'follow_the_money': 1.0, 'mind_the_gap': 1.0, 'under_the_hood': 1.0}
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

# Three fixed slots: the hero, then the money slot, then Monday's. under.the.hood
# was a half slot until 2026-09-26, filling only against a raised bar of 7.5 as
# an extra piece; it became a weekly Monday slot when the makeyourmindup cover
# page went live promising Mon, Wed and Fri (Krish: "Correct the engine's table
# and anywhere else, its out of date"), so it now fills like the other two.
for fmt in ('mind_the_gap', 'follow_the_money', 'under_the_hood'):
    verified = [r for r in elig if r['format'] == fmt and r['check_state'] == 'verified']
    pick = take(fmt, verified, 1)
    alts = take(fmt, [r for r in elig if r['format'] == fmt
                      and r['candidate_id'] not in {p['candidate_id'] for p in pick}], MAX_ALTS)
    chosen[fmt] = {'pick': pick[0] if pick else None, 'alts': alts}

json.dump({'chosen': {k: {kk: (vv if not isinstance(vv, dict) else vv) for kk, vv in v.items()}
                      for k, v in chosen.items()},
           'counts': {'eligible': len(elig), 'refuted': len(refuted), 'below_bar': len(below)}},
          io.open('selection.json', 'w'), indent=1, ensure_ascii=False)

print('eligible %d  refuted %d  below bar %d' % (len(elig), len(refuted), len(below)))
for f, v in chosen.items():
    p = v['pick']
    print('%-15s pick=%s  alts=%s' % (f, ('%s %.2f' % (p['candidate_id'], p['composite'])) if p else 'NONE',
          ', '.join('%s %.2f/%s' % (a['candidate_id'], a['composite'], a['check_state']) for a in v['alts']) or '-'))
