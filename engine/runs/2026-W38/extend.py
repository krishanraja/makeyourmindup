#!/usr/bin/env python3
"""Extend the W38 candidate pool with everything that arrived after it was built.

The pool was cut on 2026-09-19. Thirteen content_ideas rows have landed since:
nine from the newsletters the dead Anthropic key ate and which were recovered on
2026-09-20, three pool_headline rows, and one more the sweep produced during the
verification run of the bookmark fix.

The same four gates the original merge used, in the same order (NOT US, NO
CLAIM, STALE, DUPLICATE), applied by hand with the reason recorded, because the
original merge was hand-curated and a different method here would not be a
re-run of the same rule.
"""
import json, io, os

W = os.path.dirname(os.path.abspath(__file__))
cands = json.load(io.open(f"{W}/candidates.json"))
scored = json.load(io.open(f"{W}/scored.json"))
by_id = {c["candidate_id"]: c for c in cands["candidates"]}

# ── DUPLICATE: the story is already a candidate. The new row's evidence folds
#    into it as provenance, which is what the original merge did with its
#    clusters. Ten of the thirteen land here, which is the finding: the outage
#    ate newsletters whose stories ran in other newsletters the pool already had.
FOLD = {
 "80921fcd-7d2e-4b84-991b-7afdf754a7a9": ("c0125", "TypeSafe's Jev; c0125 already carries the $42 per billion, the 238x and the Jevons line, and was built from this same Gmail message"),
 "f1967935-95bb-48e6-9c1c-41c0acd2fb8c": ("c0048", "OpenAI's Model Misalignment Reporting Framework; c0048 already carries the six reports and the Astra self-instruction line"),
 "eca65faa-c1ce-406a-8c5e-c5e0ef6ff407": ("c0114", "Salesforce Koa; c0114 already carries Nemotron 3 Super, the 3x fewer errors and the Dreamforce launches"),
 "5255dcd8-3772-420d-994c-6bf2ab5f06e3": ("c0114", "the same Koa story, read a second time during the bookmark-fix verification run"),
 "b7d951e8-8ae2-4455-bf97-2a9f71674ab1": ("c0076", "the slowdown scorecard; the for and against split is c0076's subject, and the pool carries eight candidates on the pacing story"),
 "a9ef9249-740b-458b-9d97-b2f63cb408fc": ("c0014", "a16z Charts of the Week on app supply; c0014 already carries the doubling to quadrupling, the flat downloads and the SensorTower 2 percent"),
 "253142c8-6a60-4d3c-a340-ec06fc1e013c": ("c0104", "Navier-Stokes; c0104 already carries the 10,000 agents, the 300 billion tokens, the $22.5M and the Buckmaster credit dispute"),
 "ce7e68a6-4a6a-447a-ba41-ad59deb3c944": ("c0039", "Hacktron reaching OpenAI's internal GitHub; c0039 already carries the 72 hours, the libheif overflow and the $6,500 bounty"),
 "3631e44a-702f-4a6e-aaed-54bf6d94e77b": ("c0032", "the Pew survey; c0032 already carries the 42,000 respondents, 36 countries, 46 percent, 71 percent US and the Bloomberg layoff count"),
 "5f624ca1-bf6f-4858-958a-165fab650d00": ("c0107", "agentic data analysis; c0107 is built from this same Substack piece"),
}

# ── The three that pass every gate and become candidates.
NEW = [
 {
  "candidate_id": "c0217",
  "source_kind": "idea",
  "source_ref": "deabd237-c393-4bf1-bfb0-3a155ad1d130",
  "url": "https://apnews.com/article/antitrust-lawsuit-ai-slowdown-anthropic-openai-spacexai-google-960af4308161eaf4ed13c383b0ce1c1b",
  "title": "Lawsuit says Anthropic, OpenAI and others made illegal agreement on AI slowdown",
  "claim": "Four paying subscribers filed an antitrust complaint on 18 September 2026 in the Northern District of California against Anthropic, OpenAI, SpaceXAI and Google, on behalf of a proposed nationwide class of paid ChatGPT, Claude, Grok and Gemini subscribers. It alleges the companies coordinated a slowdown, pointing to Dario Amodei's 12 September essay and the same-day public agreement from Altman, Musk and Hassabis, and to a July 2026 statement signed by senior lab staff acknowledging intense competitive pressure not to unilaterally slow. The plaintiffs do not object to any company slowing on its own; they say antitrust law forbids the shortcut of substituting collective restraint for individual accountability, and that subscribers get less than they paid for.",
  "snippet": "Filed Friday in the US District Court for the Northern District of California. Counsel for the plaintiffs: the antitrust laws do not permit competitors to decide among themselves that competition is too dangerous. Corroborated by CBS News and by CNN, PBS and Fortune on 19 September 2026.",
  "received_at": "2026-09-20T11:30:24Z",
  "provenance": ["deabd237-c393-4bf1-bfb0-3a155ad1d130"],
 },
 {
  "candidate_id": "c0218",
  "source_kind": "idea",
  "source_ref": "8209912d-bd5d-4734-a7e2-c25b8910f47f",
  "url": "https://the-decoder.com/simulated-students-that-make-realistic-mistakes-help-ai-tutors-learn-faster/",
  "title": "Simulated students that make realistic mistakes help AI tutors learn faster",
  "claim": "Microsoft and the University of Illinois built StudentSim, which replicates an individual student from limited data so an AI tutor can get fast, low-cost feedback.",
  "snippet": "Microsoft and the University of Illinois built StudentSim to replicate individual students from limited data and give AI tutors fast, low-cost feedback.",
  "received_at": "2026-09-20T11:30:24Z",
  "provenance": ["8209912d-bd5d-4734-a7e2-c25b8910f47f"],
 },
 {
  "candidate_id": "c0219",
  "source_kind": "idea",
  "source_ref": "8ea6c2a8-3d7c-4db0-8b1a-c002e62bfae0",
  "url": "https://simonwillison.net/2026/Sep/19/datasette-auth-github/",
  "title": "datasette-auth-github 1.0",
  "claim": "Simon Willison released version 1.0 of datasette-auth-github, the GitHub login plugin he runs on his own Datasette instances.",
  "snippet": "Release note for a personal plugin reaching 1.0.",
  "received_at": "2026-09-20T11:30:24Z",
  "provenance": ["8ea6c2a8-3d7c-4db0-8b1a-c002e62bfae0"],
 },
]

# ── The scores. Same rubric.v1 weights, same 0-10 scale, same composite
#    (weighted mean over 17.5) the 210 existing rows were scored on; verified
#    against all 210 before any of these were written.
W_ = {"angle": 2.5, "number": 2.0, "fresh": 2.5, "fun": 2.5, "fit": 2.0, "make": 1.5, "preach": 2.5, "exists": 2.0}
def composite(s):
    return round(sum(W_[k] * s[k] for k in W_) / sum(W_.values()), 2)

NEW_SCORES = [
 {
  "candidate_id": "c0217",
  "format": "split_the_bill",
  "handoff_reason": None,
  "reason": "The pool carries eight candidates on the pacing story and every one of them is about what the labs said. This is the only one about what it costs the people who pay them: four subscribers say a coordinated slowdown makes the thing they bought worth less, and a court now has to decide whether agreeing to be careful together is an agreement. That is a money question with a named payer, which is split.the.bill's test.",
  "confidence": 0.81,
  "alternatives": [
   {"format": "mind_the_gap", "why_lost": "The claim and reality gap is real, safety in public against price in private, but the load-bearing fact is a filing about subscription value rather than a number traced over time, and mind.the.gap wants one topic traced rather than a dispute reported."}
  ],
  "headline": "They agreed to slow down. Their subscribers sent the bill.",
  "your_call_question": "You pay for at least one of these four. If the four providers agree with each other to move slower, what exactly have you lost, and how would you price it?",
  "scores": {"angle": 8, "number": 5, "fresh": 7, "fun": 8, "fit": 8, "make": 8, "preach": 6, "exists": 9},
  "gates": {"not_us": False, "material_exists": True, "source_archive_needed": False, "preach_risk": True},
  "evidence_refs": [
   "https://apnews.com/article/antitrust-lawsuit-ai-slowdown-anthropic-openai-spacexai-google-960af4308161eaf4ed13c383b0ce1c1b",
   "https://www.cbsnews.com/news/ai-slowdown-lawsuit-openai-anthropic-google/",
   "deabd237-c393-4bf1-bfb0-3a155ad1d130",
  ],
 },
 {
  "candidate_id": "c0218",
  "format": "general",
  "handoff_reason": None,
  "reason": "A tutoring research result with no money in it and no figure in the source note. The reader this publication is written for runs a business, not a classroom, and would not see themselves in it.",
  "confidence": 0.74,
  "alternatives": [],
  "headline": "Fake students, real feedback.",
  "your_call_question": "If a simulated version of your customer could be wrong in the ways your real customer is wrong, what would you test on it first?",
  "scores": {"angle": 3, "number": 3, "fresh": 7, "fun": 4, "fit": 2, "make": 6, "preach": 8, "exists": 8},
  "gates": {"not_us": False, "material_exists": True, "source_archive_needed": False, "preach_risk": False},
  "evidence_refs": ["https://the-decoder.com/simulated-students-that-make-realistic-mistakes-help-ai-tutors-learn-faster/"],
 },
 {
  "candidate_id": "c0219",
  "format": "general",
  "handoff_reason": None,
  "reason": "A point release of a personal plugin. There is a fact here and it is checkable, which is why it is not gated out, but the only number in it is the version number and nothing is at stake for anybody who does not already run Datasette.",
  "confidence": 0.88,
  "alternatives": [],
  "headline": "A login plugin reached 1.0.",
  "your_call_question": None,
  "scores": {"angle": 1, "number": 1, "fresh": 6, "fun": 2, "fit": 1, "make": 7, "preach": 9, "exists": 8},
  "gates": {"not_us": False, "material_exists": True, "source_archive_needed": False, "preach_risk": False},
  "evidence_refs": ["https://simonwillison.net/2026/Sep/19/datasette-auth-github/"],
 },
]

for s in NEW_SCORES:
    s["composite"] = composite(s["scores"])

# ── apply
folded = {}
for row_id, (cid, why) in FOLD.items():
    c = by_id[cid]
    if row_id not in c["provenance"]:
        c["provenance"].append(row_id)
    folded.setdefault(cid, []).append({"row": row_id, "why": why})

# Idempotent: this file sits in the run directory beside the data it wrote, so
# running it twice has to be safe. The folds above already are (a provenance
# entry is added only if absent); the appends need the same guard or a second
# run doubles the pool.
already = {c["candidate_id"] for c in cands["candidates"]}
fresh = [n for n in NEW if n["candidate_id"] not in already]
cands["candidates"].extend(fresh)
cands["count"] = len(cands["candidates"])
cands["by_source_kind"]["idea"] = cands["by_source_kind"].get("idea", 0) + len(fresh)
cands["extended_2026_09_20"] = {
 "why": "the pool was cut on 2026-09-19; these arrived after, including the nine ideas recovered from the newsletters the dead Anthropic key ate",
 "rows_considered": 13,
 "new_candidates": [n["candidate_id"] for n in NEW],
 "folded_as_duplicate": folded,
 "gates_in_order": ["NOT US", "NO CLAIM", "STALE", "DUPLICATE"],
 "finding": "ten of thirteen were DUPLICATE: the stories the outage ate ran in other newsletters the pool already held, with the same figures already in the claim",
}
scored_already = {r["candidate_id"] for r in scored}
scored.extend([r for r in NEW_SCORES if r["candidate_id"] not in scored_already])

json.dump(cands, io.open(f"{W}/candidates.json", "w"), indent=1, ensure_ascii=False)
json.dump(scored, io.open(f"{W}/scored.json", "w"), indent=1, ensure_ascii=False)
print("candidates %d  scored %d  new %s" % (
    cands["count"], len(scored), ", ".join("%s %.2f %s" % (s["candidate_id"], s["composite"], s["format"]) for s in NEW_SCORES)))
