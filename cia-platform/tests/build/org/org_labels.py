"""Step 15 (2026-10-22): labels and plan metadata of the nine ISO toolkits, read from the tools themselves (server on 8802).
    python3 tests/build/org/org_labels.py
Writes tests/build/org/iso_meta.json (per question: id, domain, clause, weight, new-in-edition flag, phase, weeks — the inputs of each tool's own
action-plan rule, no text) and assets/cia-labels.json (question, recommended action and suggested owner in Arabic and English, and the
checklist clause titles). The hub and the link panels read the labels when they can (http); without them they show the question id."""
import os, sys, json
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", "platform"))
from common import launch, new_page, sync_playwright, BASE, ROOT
ISO = {"iso9001": "iso9001", "iso14001": "iso14001", "iso45001": "iso45001", "iso27001": "iso27001", "iso22301": "iso22301",
       "iso37301": "iso37301", "iso37001": "iso37001", "iso31000": "iso31000-risk-studio", "iso37000": "iso37000-governance"}
JS = """()=>({q: TK.assess.q.map(q=>({id:q.id, dom:q.dom, cl:q.clause||"", w:q.w, nw:q.nw?1:0, ph:q.ph, wk:q.wk,
   ar:{q:q.ar.q, a:q.ar.a, o:q.ar.o}, en:{q:q.en.q, a:q.en.a, o:q.en.o}})),
  cl: Object.fromEntries(CL.flatMap(c=>c.subs.map(s=>[s.n, {ar:(s.ar&&s.ar.t)||"", en:(s.en&&s.en.t)||""}]))),
  ck: Object.keys(TK.check)})"""
meta, labels = {}, {"v": 1, "iso": {}}
with sync_playwright() as p:
    b = launch(p)
    for k, f in ISO.items():
        ctx, pg, errs = new_page(b, "ar", 1280, 900, tour_done=[f])
        pg.goto(f"{BASE}/modules/{f}.html", wait_until="load"); pg.wait_for_timeout(300)
        r = pg.evaluate(JS)
        meta[k] = [[q["id"], q["dom"], q["cl"], q["w"], q["nw"], q["ph"], q["wk"]] for q in r["q"]]
        labels["iso"][k] = {"q": {q["id"]: {"ar": q["ar"], "en": q["en"]} for q in r["q"]}, "cl": r["cl"]}
        print(k, len(r["q"]), "questions,", len(r["cl"]), "clauses,", len(r["ck"]), "checklist groups")
        ctx.close()
    b.close()
json.dump(meta, open(os.path.join(os.path.dirname(__file__), "iso_meta.json"), "w"), separators=(",", ":"))
json.dump(labels, open(os.path.join(ROOT, "assets", "cia-labels.json"), "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
