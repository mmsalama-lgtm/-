"""PDCA after the engine move behaves exactly as before: with Date and Math.random frozen, the previous pdca.html
(CIA_ORIG_DIR, default /home/claude/orig) and the new one give the same stored state, the same report HTML, the
same CSV and the same text on every tab, in Arabic and English, empty, seeded and with the example loaded.
Usage: python3 tests/capa/pdca_engine_regress.py"""
import os, sys, json
from playwright.sync_api import sync_playwright
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
ORIG_DIR = os.environ.get("CIA_ORIG_DIR", "/home/claude/orig")
NEW = "file://" + os.path.join(ROOT, "modules", "pdca.html")
OLD = "file://" + os.path.join(ORIG_DIR, "modules", "pdca.html")
# over http when both releases are served (CIA_BASE / CIA_ORIG, as in tests/platform): file:// pages can lose a
# localStorage write that lands just before a reload
try:
    import urllib.request
    _n, _o = os.environ.get("CIA_BASE", "http://127.0.0.1:8802"), os.environ.get("CIA_ORIG", "http://127.0.0.1:8801")
    urllib.request.urlopen(_n + "/modules/pdca.html", timeout=3).read(64); urllib.request.urlopen(_o + "/modules/pdca.html", timeout=3).read(64)
    NEW, OLD = _n + "/modules/pdca.html", _o + "/modules/pdca.html"
except Exception:
    pass
SEED = json.load(open(os.path.join(ROOT, "tests", "platform", "pdca_seed.json"), encoding="utf-8"))
FREEZE = """(function(){ var T=Date.UTC(2026,9,10,9,0,0), OD=Date;
 function FD(){ if(!(this instanceof FD)) return new OD(T).toString(); var a=[].slice.call(arguments);
   return a.length? new (Function.prototype.bind.apply(OD,[null].concat(a)))() : new OD(T); }
 FD.prototype=OD.prototype; FD.now=function(){ return T; }; FD.UTC=OD.UTC; FD.parse=OD.parse; window.Date=FD;
 var s=20261010; Math.random=function(){ s=(s*16807)%2147483647; return (s-1)/2147483646; }; })();"""
TABS = ["home", "explain-std", "explain-cl", "assess", "tools", "docs", "audit", "dash", "report", "ai"]
results = []
def check(n, c, d=""):
    results.append((n, bool(c))); print(("PASS " if c else "FAIL ") + n + (("  -- " + str(d)[:300]) if d and not c else ""))

def run(b, url):
    out = {}
    for lang in ("ar", "en"):
        ctx = b.new_context(viewport={"width": 1280, "height": 900}); pg = ctx.new_page(); errs = []
        pg.on("pageerror", lambda e: errs.append(str(e)))
        pg.add_init_script(FREEZE + "try{localStorage.setItem('cia-lang','%s');localStorage.setItem('cia-tour:m:pdca','done')}catch(e){}" % lang)
        pg.on("dialog", lambda d: d.accept())
        pg.goto(url); pg.wait_for_timeout(250)
        for phase in ("empty", "seed", "example", "answers"):
            if phase == "seed":
                for _ in range(3):  # seed, reload, and make sure the seed is there before reading
                    pg.evaluate("(s)=>localStorage.setItem('cia-pdca:v1', JSON.stringify(s))", SEED); pg.reload(wait_until="load")
                    pg.wait_for_function("typeof go==='function'"); pg.wait_for_timeout(200)
                    if pg.evaluate("!!localStorage.getItem('cia-pdca:v1') && DB.records.length>0"): break
            if phase == "example":
                pg.evaluate("go('docs')"); pg.evaluate("document.getElementById('pfEx').click()"); pg.wait_for_timeout(250)
            if phase == "answers":
                pg.evaluate("go('assess')"); pg.check('input[name="as-AC3"][value="2"]'); pg.wait_for_timeout(100)
            tx = {}
            for t in TABS:
                pg.evaluate(f"go('{t}')"); pg.wait_for_timeout(40)
                tx[t] = pg.evaluate(f"document.querySelector('.tabpane[data-tab=\"{t}\"]').innerText")
            out[f"{lang}:{phase}"] = {"store": pg.evaluate("localStorage.getItem('cia-pdca:v1')"), "report": pg.evaluate("buildReportHTML()"),
                                      "csv": pg.evaluate("buildCSV()"), "text": tx, "audit": pg.evaluate("JSON.stringify(DB.records.map(auditRecord))"),
                                      "as": pg.evaluate("[assessScore(),assessScore('plan'),assessScore('act'),assessAnswered(),bandOf(assessScore())]")}
        pg.evaluate("go('docs')"); pg.evaluate("document.getElementById('pfReset').click()"); pg.wait_for_timeout(150)
        out[f"{lang}:cleared"] = {"store": pg.evaluate("localStorage.getItem('cia-pdca:v1')"), "docs": pg.evaluate("document.getElementById('docsBox').innerText")}
        out[f"{lang}:errs"] = errs
        ctx.close()
    return out

with sync_playwright() as p:
    b = p.chromium.launch()
    if OLD.startswith("file://") and not os.path.exists(OLD[7:]):
        print("previous pdca.html not found at", OLD); sys.exit(2)
    old, new = run(b, OLD), run(b, NEW)
    b.close()
for k in sorted(old):
    if k.endswith(":errs"):
        check(f"{k}: no page errors (new)", not new[k], new[k][:2]); continue
    for part in old[k]:
        a, c = old[k][part], new[k].get(part)
        if part == "text" and isinstance(a, dict) and isinstance(c, dict):   # step 15: the explanation tabs carry the ISO 10009 line (Part C)
            a = {t: v for t, v in a.items() if not t.startswith("explain")}; c = {t: v for t, v in c.items() if not t.startswith("explain")}
        check(f"{k} {part} identical", a == c, "" if a == c else (str(a)[:150] + " | " + str(c)[:150]))
f = [r for r in results if not r[1]]
print(f"\n{len(results) - len(f)}/{len(results)} passed"); sys.exit(1 if f else 0)
