"""5 Whys before and after the optional Fishbone panel (2026-10-11). Serve the uploaded package at CIA_ORIG (default :8801) and
this one at CIA_BASE (default :8802). With Date and Math.random frozen, the same steps run on the old and the new five-whys.html:
example data, a scripted analysis, an answer; then stored state, report HTML, CSV, audit and the text of every tab (and of the
form with W5-EX-03 open) are compared with no Fishbone data in the browser: everything must be identical. Then, in the new
version only, the Fishbone example is loaded: the read-only panel appears on W5-EX-02 and W5-EX-03, and the 5 Whys stored state
does not change. Usage: python3 tests/fish/why5_regress.py"""
import os, sys, json, difflib
from playwright.sync_api import sync_playwright
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "..", "platform", "results", "text-diff-why5-fish.json")
BASE = os.environ.get("CIA_BASE", "http://127.0.0.1:8802"); ORIG = os.environ.get("CIA_ORIG", "http://127.0.0.1:8801")
TABS = ["home", "explain-std", "explain-cl", "assess", "tools", "docs", "audit", "dash", "report", "ai"]
FREEZE = """(function(){ var T=Date.UTC(2026,9,11,9,0,0), OD=Date;
 function FD(){ if(!(this instanceof FD)) return new OD(T).toString(); var a=[].slice.call(arguments);
   return a.length? new (Function.prototype.bind.apply(OD,[null].concat(a)))() : new OD(T); }
 FD.now=function(){ return T; }; FD.UTC=OD.UTC; FD.parse=OD.parse; FD.prototype=OD.prototype; window.Date=FD;
 var s=20261011; Math.random=function(){ s=(s*16807)%2147483647; return (s-1)/2147483646; };
 try{ if(!sessionStorage.getItem('f0')){ sessionStorage.setItem('f0','1'); localStorage.clear(); localStorage.setItem('cia-lang','ar'); ['five-whys','fishbone'].forEach(function(k){ localStorage.setItem('cia-tour:m:'+k,'done'); }); } }catch(e){} })();"""
results = []


def check(name, cond, detail=""):
    results.append((name, bool(cond), detail))
    print(("PASS " if cond else "FAIL ") + name + (("  -- " + str(detail)[:400]) if detail and not cond else ""), flush=True)


def run(b, base):
    ctx = b.new_context(viewport={"width": 1280, "height": 900}); pg = ctx.new_page(); errs = []
    pg.on("pageerror", lambda e: errs.append(str(e))); pg.on("dialog", lambda d: d.accept())
    pg.add_init_script(FREEZE)
    pg.goto(base + "/modules/five-whys.html", wait_until="load"); pg.wait_for_timeout(300)
    out = {}
    pg.evaluate("go('docs')"); pg.evaluate("document.getElementById('pfEx').click()"); pg.wait_for_timeout(300)
    out["example"] = pg.evaluate("localStorage.getItem('cia-why5:v1')")
    out["report"] = pg.evaluate("buildReportHTML()"); out["csv"] = pg.evaluate("buildCSV()")
    out["tabs"] = {}
    for lang in ("ar", "en"):
        if pg.evaluate("L") != lang: pg.evaluate("switchLang()"); pg.wait_for_timeout(150)
        for t in TABS:
            out["tabs"][lang + ":" + t] = pg.evaluate(f"(go('{t}'), document.querySelector('.tabpane[data-tab=\"{t}\"]').innerText)")
        pg.evaluate("go('tools'); loadRecordIntoForm(DB.records.find(r=>r.id==='W5-EX-03')); 0"); pg.wait_for_timeout(100)
        out["tabs"][lang + ":tools/W5-EX-03"] = pg.evaluate("document.querySelector('.tabpane[data-tab=\"tools\"]').innerText")
    if pg.evaluate("L") != "ar": pg.evaluate("switchLang()")
    pg.evaluate("go('tools'); clearForm(); 0")
    pg.fill("#f-title", "Late certificates"); pg.fill("#f-ref", "NCR-2026-090"); pg.fill("#f-what", "Three certificates were late."); pg.fill("#f-date", "2026-10-01")
    pg.fill("#w-0-0-a", "No due date for certificates."); pg.fill("#w-0-0-ev", "Shipping list"); pg.fill("#f-root", "No due date for certificates.")
    pg.click("#saveBtn"); pg.wait_for_timeout(80)
    pg.evaluate("go('assess')"); pg.check('input[name="as-LK2"][value="2"]'); pg.wait_for_timeout(80)
    out["flow"] = pg.evaluate("localStorage.getItem('cia-why5:v1')")
    out["audit"] = pg.evaluate("JSON.stringify(DB.records.map(auditRecord))")
    out["errs"] = errs
    ctx.close()
    return out


with sync_playwright() as p:
    b = p.chromium.launch()
    old, new = run(b, ORIG), run(b, BASE)
    check("5 Whys stored state after the example is identical", old["example"] == new["example"] and len(new["example"]) > 1000)
    check("5 Whys report HTML is identical", old["report"] == new["report"])
    check("5 Whys CSV is identical", old["csv"] == new["csv"])
    check("5 Whys stored state after a scripted analysis and an answer is identical", old["flow"] == new["flow"])
    check("5 Whys automatic audit results are identical", old["audit"] == new["audit"])
    check("no errors in either version", not old["errs"] and not new["errs"], [old["errs"][:2], new["errs"][:2]])
    diffs = {}
    for k in old["tabs"]:
        if old["tabs"][k] != new["tabs"][k]:
            diffs[k] = [x for x in difflib.unified_diff(old["tabs"][k].splitlines(), new["tabs"][k].splitlines(), lineterm="", n=0) if x[:1] in "+-" and x[:3] not in ("+++", "---")]
    check("with no Fishbone data, the text of every tab is identical (AR/EN)", not diffs, sorted(diffs))
    # with the Fishbone example in the browser (new version only)
    ctx = b.new_context(viewport={"width": 1280, "height": 900}); pg = ctx.new_page(); errs = []
    pg.on("pageerror", lambda e: errs.append(str(e))); pg.on("dialog", lambda d: d.accept()); pg.add_init_script(FREEZE)
    pg.goto(BASE + "/modules/five-whys.html", wait_until="load"); pg.wait_for_timeout(300)
    pg.evaluate("go('docs')"); pg.evaluate("document.getElementById('pfEx').click()"); pg.wait_for_timeout(300)
    s0 = pg.evaluate("localStorage.getItem('cia-why5:v1')")
    pg.goto(BASE + "/modules/fishbone.html", wait_until="load"); pg.wait_for_timeout(300)
    pg.evaluate("go('docs')"); pg.evaluate("document.getElementById('pfEx').click()"); pg.wait_for_timeout(300)
    pg.goto(BASE + "/modules/five-whys.html", wait_until="load"); pg.wait_for_timeout(300)
    pan = {}
    for wid in ("W5-EX-01", "W5-EX-02", "W5-EX-03"):
        pg.evaluate(f"go('tools'); loadRecordIntoForm(DB.records.find(r=>r.id==='{wid}')); 0"); pg.wait_for_timeout(80)
        pan[wid] = pg.evaluate("document.getElementById('fbFrom').hidden ? '' : document.getElementById('fbFrom').innerText")
    check("the panel lists FB-EX-03 on W5-EX-02 and FB-EX-02 on W5-EX-03, and stays hidden on W5-EX-01",
          "FB-EX-03" in pan["W5-EX-02"] and "FB-EX-02" in pan["W5-EX-03"] and pan["W5-EX-01"] == "" and pan["W5-EX-03"].count("FB-EX-") == 1, pan)
    check("the panel names both causes FB-EX-02 verifies with W5-EX-03", "ماء الخلط" in pan["W5-EX-03"] and "الصب يُخطط" in pan["W5-EX-03"], pan["W5-EX-03"][:200])
    check("reading the Fishbone data does not change the 5 Whys stored state", pg.evaluate("localStorage.getItem('cia-why5:v1')") == s0)
    check("no errors with the Fishbone data present", not errs, errs[:3])
    ctx.close()
    b.close()
json.dump(diffs, open(OUT, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
failed = [r for r in results if not r[1]]
print(f"\n{len(results) - len(failed)}/{len(results)} passed")
sys.exit(1 if failed else 0)
