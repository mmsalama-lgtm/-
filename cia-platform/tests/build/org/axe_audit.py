"""Accessibility audit (axe-core 4.10.2, WCAG 2.0/2.1 A and AA, serious and critical) of every tool's home tab — step 15, 2026-10-22.
    npm i axe-core@4.10.2 in a folder of your choice, set AXE_JS to its axe.min.js, serve the package on 8802, then: python3 tests/build/org/axe_audit.py
Writes the counts to tests/platform/results/axe-modules.json."""
import os, sys, json, collections
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "hub"))
from hubkit import *
import os
AXE = open(os.environ.get("AXE_JS", "node_modules/axe-core/axe.min.js")).read()
agg=collections.Counter(); per={}
with sync_playwright() as p:
    b = launch(p)
    for m in modules():
        ctx, pg, errs = new_page(b,"ar",1280,900,tour_done=[m])
        pg.goto(f"{BASE}/modules/{m}.html"); pg.wait_for_timeout(500)
        pg.add_script_tag(content=AXE)
        r = pg.evaluate("""async()=>{ const r=await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa']}}); return r.violations.filter(v=>v.impact==='critical'||v.impact==='serious').map(v=>[v.id,v.nodes.length]); }""")
        per[m]=r; [agg.update({k:n}) for k,n in r]; ctx.close()
    b.close()
print(agg); json.dump(per, open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "platform", "results", "axe-modules.json"),"w"), indent=0)
for m,r in per.items(): print(m, r)
