"""Fills DEMO_RES.dmaic in index.html with the hub's own reading of the DMAIC example data (the dashboard's demo mode
shows it). Serve the platform folder first (CIA_BASE, default http://127.0.0.1:8802).   python3 tests/build/demo_dmaic.py"""
import os, sys, json, re
from playwright.sync_api import sync_playwright
BASE = os.environ.get("CIA_BASE", "http://127.0.0.1:8802")
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
r1 = lambda v: (round(v, 1) if isinstance(v, float) else v)
with sync_playwright() as p:
    b = p.chromium.launch(); ctx = b.new_context(); pg = ctx.new_page()
    pg.add_init_script("try{localStorage.setItem('cia-lang','ar');localStorage.setItem('cia-tour:m:dmaic','done')}catch(e){}")
    pg.on("dialog", lambda d: d.accept())
    pg.goto(BASE + "/modules/dmaic.html", wait_until="load"); pg.wait_for_timeout(300)
    pg.evaluate("go('docs')"); pg.evaluate("document.getElementById('pfEx').click()"); pg.wait_for_timeout(300)
    pg.goto(BASE + "/index.html", wait_until="load"); pg.wait_for_timeout(500)
    x = pg.evaluate("JSON.parse(JSON.stringify(CIADASH.evalTool(CIADASH.TOOLS.find(t=>t.k==='dmaic'))))")
    b.close()
demo = {"st": x["st"], "idx": r1(x["idx"]), "comp": r1(x["comp"]), "m": [[m["k"], r1(m["v"]), m["kind"], m["d"]] for m in x["m"]],
        "bd": ({"t": x["bd"]["t"], "items": [{"l": i["l"], "v": r1(i["v"]), "t": i["t"], "col": i["col"]} for i in x["bd"]["items"]]} if x["bd"] else None)}
p = os.path.join(ROOT, "index.html"); s = open(p, encoding="utf-8").read()
i = s.find('const DEMO_RES = {"dmaic": '); assert i >= 0 and s.count('const DEMO_RES = {"dmaic": ') == 1
j = s.find(', "a3": ', i); assert j > i
s = s[:i] + 'const DEMO_RES = {"dmaic": ' + json.dumps(demo, ensure_ascii=False) + s[j:]
open(p, "w", encoding="utf-8").write(s)
print(json.dumps(demo, ensure_ascii=False))
