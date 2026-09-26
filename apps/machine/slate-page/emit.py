#!/usr/bin/env python3
"""emit.py (run from the week's directory) -> slate.json

Turns the selection into the exact rows that go into the bank and
the exact cards the ruling page renders.

Every field here is derived by a stated rule. Nothing is hand-written per card,
because a slate assembled by hand cannot be compared against next week's.
"""
import json, io, os, sys, collections

if len(sys.argv) > 1: os.chdir(sys.argv[1])   # the week's directory

sc   = {r['candidate_id']: r for r in json.load(io.open('scored.json'))}
ver  = json.load(io.open('verdicts.json'))
sel  = json.load(io.open('selection.json'))
raw  = json.load(io.open('candidates.json'))
cand = {c['candidate_id']: c for c in raw['candidates']}
mand = json.load(io.open('mandates.json'))
SAYS = {h['slug']: h['says'] for h in mand['handoff_reasons']}

FIX = {
  'source_not_archived': 'Archive the surface first: save the page to the Wayback Machine and put that timestamped url on the row. Then it is checkable a week from now and the piece can be written.',
  'evidence_must_be_created': 'Either find a named producer who already published the missing half, or drop it. The material gate does not commission primary research, however good the idea.',
  'format_ambiguous_question': 'Decide what the reader changes next, not the subject. A price, a budget or a contract is follow.the.money; what they build or buy is under.the.hood; how they think or what they expect is mind.the.gap. Say which and the row becomes writable.',
  'claim_not_in_source': 'Point the row at the reporting that carries the claim, or restate the claim to what the source actually says. Either makes it writable; neither is a guess the machine may make for you.',
}

# ── derivative plan: one rule per asset, applied to every card the same way ──
def derivatives(s):
    n, a, f = s['number'], s['angle'], s['fun']
    return [
      {'kind': 'written_piece', 'do': True,
       'why': 'The spine. Everything else is cut from it, so it is written first whatever else runs.'},
      {'kind': 'your_call_artifact', 'do': True,
       'why': "The format's standing question is the artifact. It is the interactive piece, not a decoration on the article."},
      {'kind': 'long_video', 'do': n >= 7,
       'why': ('The number is load-bearing (%d of 10), so there is something to walk through on screen rather than talk over.' % n)
              if n >= 7 else
              ('The number scores only %d of 10, so a long video would be a person asserting rather than showing. Cut it unless the draft finds a figure.' % n)},
      {'kind': 'short_cuts', 'do': f >= 7,
       'why': ('Scores %d of 10 for life, so at least one line carries on its own off the page.' % f)
              if f >= 7 else
              ('Scores %d of 10 for life. Short cuts off a flat piece are the fastest way to look like everyone else.' % f)},
      {'kind': 'ig_carousel', 'do': n >= 7 and a >= 7,
       'why': ('A countable structure (number %d, angle %d) pages well: one figure a card, the turn on the last.' % (n, a))
              if (n >= 7 and a >= 7) else
              ('Nothing here pages: number %d, angle %d. A carousel would be the headline broken over six slides.' % (n, a))},
    ]

def check_line(cid):
    v = ver.get(cid) or {}
    got = [k for k in ('evidence', 'format', 'voice') if k in v]
    if not got:
        return 'unchecked', 'Not checked against the evidence, format or voice lens yet. It is an alternate for that reason, not a pick.'
    if len(got) == 3:
        return 'verified', 'Checked on all three lenses: the evidence exists and is attributed, the format boundary holds, and the voice is not preaching.'
    missing = [k for k in ('evidence', 'format', 'voice') if k not in v]
    return 'part_checked', ('Checked on %s. The %s lens has not run, so it is held as an alternate rather than led with, however it scored.'
                            % (' and '.join(got), ' and '.join(missing)))

cards = []
# the swing: the one card whose number is weakest, so it has to work on the
# angle instead of the figure. That is the bet, and it is marked as one.
pool = []
for f, v in sel['chosen'].items():
    if v.get('pick'): pool.append(v['pick']['candidate_id'])
    pool += [a['candidate_id'] for a in v.get('alts', [])]
swing = min(pool, key=lambda c: (sc[c]['scores']['number'], -sc[c]['composite']))

def mk(cid, fmt, rank):
    r, c = sc[cid], cand[cid]
    st, note = check_line(cid)
    row = {
      'surface': 'slate_pick',
      'subject_id': cid,
      'title': r['headline'],
      'confidence': r['confidence'],
      'reason': r['reason'],
      'alternatives': r.get('alternatives') or [],
      'proposed': {
        'format': fmt, 'rank': rank,
        'headline': r['headline'],
        'your_call_question': r['your_call_question'],
        'candidate_id': cid,
        'source_url': c.get('url'),
        'source_kind': c.get('source_kind'),
        'received_at': c.get('received_at'),
        'composite': r['composite'],
        'scores': r['scores'],
        'check_state': st,
        'check_note': note,
        'check_detail': ((ver.get(cid) or {}).get('evidence') or {}).get('reason'),
        'evidence_refs': r.get('evidence_refs') or [],
        'derivative_plan': derivatives(r['scores']),
      },
      'is_swing': cid == swing,
    }
    row['proposed']['is_swing'] = (cid == swing)
    if cid == swing:
        row['swing_why'] = ('This is the week\'s swing. Its number scores %d of 10, the weakest on the slate, so unlike '
                            'every other card it has to work on the angle rather than the figure. One proposal a batch is '
                            'spent this way on purpose: a slate that only ever proposes the safe shape stops surprising you, '
                            'and a prompt that is only prohibitions returns joyless work.') % sc[cid]['scores']['number']
        row['proposed']['swing_why'] = row['swing_why']
    return row

for f in ('follow_the_money', 'mind_the_gap', 'under_the_hood'):
    v = sel['chosen'][f]
    if v.get('pick'):
        cards.append(mk(v['pick']['candidate_id'], f, 1))
    for i, a in enumerate(v.get('alts', []), start=2):
        cards.append(mk(a['candidate_id'], f, i))

# ── hand-offs: a named row, never a silence ────────────────────────────────
hand = []
for r in sorted((r for r in sc.values() if r.get('handoff_reason')),
                key=lambda r: -(r.get('composite') or 0)):
    cid = r['candidate_id']
    hand.append({
      'surface': 'slate_pick',
      'subject_id': cid,
      'title': r.get('headline') or cand[cid].get('title'),
      'handoff_reason': r['handoff_reason'],
      'reason': r['reason'],
      'says': r['reason'],
      'rule': SAYS.get(r['handoff_reason']),
      'fix_hint': FIX.get(r['handoff_reason']),
      'proposed_hint': r.get('headline') or cand[cid].get('title'),
    })

# ── refutations: checked, and the check said no ────────────────────────────
ref = []
for cid, v in ver.items():
    if 'evidence' in v and not v['evidence']['passes']:
        r = sc.get(cid) or {}
        ref.append({
          'surface': 'slate_pick',
          'subject_id': cid,
          'title': r.get('headline') or cand.get(cid, {}).get('title'),
          'handoff_reason': 'claim_not_in_source',
          'reason': (v['evidence']['reason'] or '').strip(),
          'says': (v['evidence']['reason'] or '').strip(),
          'rule': SAYS.get('claim_not_in_source'),
          'fix_hint': FIX['claim_not_in_source'],
          'proposed_hint': r.get('headline') or cand.get(cid, {}).get('title'),
          'composite': r.get('composite'),
        })
ref.sort(key=lambda r: -(r.get('composite') or 0))

picks = [c for c in cards if c['proposed']['rank'] == 1]
summary = ('%d candidates in, %d dropped at the gates, %d scored, %d over the 6.5 bar. '
           '%d picks and %d alternates here, %d hand-offs the machine would not decide, and %d rows it checked and refused. '
           'Nothing on this page has been published, sent or scheduled.'
           % (raw['count'], raw['dropped_count'], len(sc), sel['counts']['eligible'],
              len(picks), len(cards) - len(picks), len(hand), len(ref)))

out = {'week_of': '2026-09-21', 'summary': summary,
       'suggestions': cards + hand + ref,
       'selection_rules': {
         'bar': 6.5,
         'order': 'composite, then how many independent sources carry the story, then recency. Never by age.',
         'under_the_hood': 'a fixed Monday slot since 2026-09-26, filled like the other two',
         'source_cap': 'at most two cards from one publication across the whole slate',
         'swing': 'the card with the weakest load-bearing number, marked as the bet it is',
       }}
json.dump(out, io.open('slate.json', 'w'), indent=1, ensure_ascii=False)
print(summary)
print('swing:', swing)
print('rows: %d cards, %d handoffs, %d refutations = %d' % (len(cards), len(hand), len(ref), len(out['suggestions'])))
