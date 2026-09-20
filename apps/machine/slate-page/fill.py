#!/usr/bin/env python3
"""Fill the slate page template from the workflow's slate.json and the real
suggestion row ids returned by the INSERT.

  fill_slate_page.py <template.html> <slate.json> <ids.json> <mandates.json> <out.html>

ids.json is the RETURNING output of the suggestions insert, a list of
{id, surface, subject_id, handoff_reason}. A card whose subject_id has no row
is dropped with a loud note rather than rendered unruleable.
"""
import json, io, sys, collections, re

tpl_path, slate_path, ids_path, mandates_path, out_path = sys.argv[1:6]
prov_path = sys.argv[6] if len(sys.argv) > 6 else None
cands_path = sys.argv[7] if len(sys.argv) > 7 else None

tpl = io.open(tpl_path, encoding='utf-8').read()
slate = json.load(io.open(slate_path, encoding='utf-8'))
ids = json.load(io.open(ids_path, encoding='utf-8'))
mand = json.load(io.open(mandates_path, encoding='utf-8'))

# ---- provenance: which model scored each candidate, and which checked it -----
prov_by_cand, prov_note = {}, ''
if prov_path and cands_path:
    prov = json.load(io.open(prov_path, encoding='utf-8'))['by_label']
    raw = json.load(io.open(cands_path, encoding='utf-8'))
    cands = raw['candidates'] if isinstance(raw, dict) else raw
    BATCH = 12
    for i, c in enumerate(cands):
        cid = c.get('candidate_id')
        if not cid:
            continue
        prov_by_cand[cid] = {
            'scored_by': prov.get('score:batch-%d' % (i // BATCH)),
            'verified_by': [m for m in (prov.get('verify:%s:%s' % (lens, cid))
                                        for lens in ('evidence', 'format', 'voice')) if m],
        }
    scored = collections.Counter(v['scored_by'] for v in prov_by_cand.values() if v['scored_by'])
    checked = collections.Counter(m for v in prov_by_cand.values() for m in v['verified_by'])
    def short(m):
        return str(m).replace('claude-', '').replace('-5-1', ' 5.1').replace('-5', ' 5')
    prov_note = ('Scoring: ' + ', '.join('%s on %d' % (short(m), n) for m, n in scored.most_common())
                 + '. Checks: ' + ', '.join('%s on %d' % (short(m), n) for m, n in checked.most_common()) + '.')

# ---- index the real row ids by (surface, subject_id) -----------------------
by_key = {}
for r in ids:
    by_key[(r['surface'], str(r['subject_id']))] = r['id']

# ---- format headers, from the live mandates -------------------------------
formats = mand['formats'] if isinstance(mand, dict) and 'formats' in mand else mand
CAD = {'split_the_bill': 'Wednesdays', 'mind_the_gap': 'Fridays, the hero', 'lift_the_lid': 'standing, no fixed day'}
QUESTION = {
    'split_the_bill': 'What does it really cost to run, and who ends up holding the bill?',
    'mind_the_gap': 'What is actually happening, against what everyone says is happening?',
    'lift_the_lid': 'Does this make its user sharper, or dependent?',
}
fmt_rows = []
for slug in ('split_the_bill', 'mind_the_gap', 'lift_the_lid'):
    live = next((f for f in formats if f.get('slug') == slug), {})
    fmt_rows.append({
        'slug': slug,
        'cadence': live.get('cadence_label') or CAD[slug],
        'standing_question': QUESTION[slug],
        'empty_note': ('No candidate earned this slot this week. lift.the.lid has no fixed day, '
                       'so an empty week is the format working as specified, not a gap.')
        if slug == 'lift_the_lid' else
        'No candidate cleared the bar for this slot this week, and the machine says so rather than filling it.',
    })

# ---- suggestions, with their real ids --------------------------------------
out_sugs, missing = [], []
for s in slate.get('suggestions', []):
    key = (s.get('surface'), str(s.get('subject_id')))
    rid = by_key.get(key)
    if not rid:
        missing.append(key)
        continue
    out_sugs.append({
        'id': rid,
        'surface': s.get('surface'),
        'subject_id': s.get('subject_id'),
        'proposed': s.get('proposed'),
        'reason': s.get('reason'),
        'confidence': s.get('confidence'),
        'alternatives': s.get('alternatives') or [],
        'is_swing': bool(s.get('is_swing')),
        'swing_why': s.get('swing_why'),
        'handoff_reason': s.get('handoff_reason'),
        'says': s.get('says'),
        'fix_hint': s.get('fix_hint'),
        'title': s.get('title') or (s.get('proposed') or {}).get('headline'),
        'prov': prov_by_cand.get(str(s.get('subject_id'))),
    })

data = {
    'week_of': slate.get('week_of') or '2026-09-21',
    'project_id': 'gojpffsrxybbpbdzzrvs',
    'producer': 'intake-and-first-slate',
    'proposed_on': '2026-09-19',
    'summary': slate.get('summary') or '',
    # Set when the week is selected again over a pool that has changed since the
    # first publish. It travels in slate.json rather than being written here, so
    # the note is part of the run rather than part of the renderer.
    'rerun': slate.get('rerun') or '',
    'prov_note': prov_note,
    'formats': fmt_rows,
    'suggestions': out_sugs,
}

assert '__SLATE_JSON__' in tpl, 'template placeholder missing'
# json.dumps escapes < and > only via ensure_ascii; close the </script> hole explicitly
payload = json.dumps(data, ensure_ascii=False).replace('</', '<\\/')
html = tpl.replace('__SLATE_JSON__', payload)
io.open(out_path, 'w', encoding='utf-8').write(html)

picks = [s for s in out_sugs if s['surface'] == 'slate_pick' and not s['handoff_reason']]
hands = [s for s in out_sugs if s['handoff_reason']]
print('wrote %s  (%d bytes)' % (out_path, len(html)))
print('  cards: %d slate_pick, %d format_assignment, %d hand-offs'
      % (len(picks), len([s for s in out_sugs if s['surface'] == 'format_assignment']), len(hands)))
print('  swing: %s' % ([s['subject_id'] for s in out_sugs if s['is_swing']] or 'NONE SET'))
if missing:
    print('  WARNING: %d suggestion(s) had no bank row and were dropped: %s' % (len(missing), missing[:6]))
