"""DMAIC before and after the FMEA panel (2026-10-16, FMEA step). Serve the uploaded package (the ISO 10009 release) at CIA_ORIG (default :8801)
and this one at CIA_BASE (default :8802). With Date and Math.random frozen, the same steps run on the old and the new dmaic.html:
example data, a scripted project, the self-assessment; then stored state, report HTML, CSV, audit and the text of every tab (plus the forms
of DM-EX-01 … DM-EX-03) are compared. Expected: everything identical while no FMEA data exists (the panel stays hidden and empty).
Then, in the new version only, with the FMEA example in the browser: the panel lists FM-EX-01 on DM-EX-01 and FM-EX-03 on DM-EX-03 and
nothing on DM-EX-02, "Open in FMEA" asks for the FMEA tool with ?open=, and neither DMAIC's nor FMEA's stored state changes.
Usage: python3 tests/fmea/dmaic_regress.py"""
import os, sys, json, difflib
from playwright.sync_api import sync_playwright
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "..", "platform", "results", "text-diff-dmaic-fmea.json")
BASE = os.environ.get("CIA_BASE", "http://127.0.0.1:8802"); ORIG = os.environ.get("CIA_ORIG", "http://127.0.0.1:8801")
TABS = ["home", "explain-std", "explain-cl", "assess", "tools", "docs", "audit", "dash", "report", "ai"]
FREEZE = """(function(){ var T=Date.UTC(2026,9,16,9,0,0), OD=Date;
 function FD(){ if(!(this instanceof FD)) return new OD(T).toString(); var a=[].slice.call(arguments);
   return a.length? new (Function.prototype.bind.apply(OD,[null].concat(a)))() : new OD(T); }
 FD.now=function(){ return T; }; FD.UTC=OD.UTC; FD.parse=OD.parse; FD.prototype=OD.prototype; window.Date=FD;
 var s=20261016; Math.random=function(){ s=(s*16807)%2147483647; return (s-1)/2147483646; };
 try{ if(!sessionStorage.getItem('f0')){ sessionStorage.setItem('f0','1'); localStorage.clear(); localStorage.setItem('cia-lang','ar'); ['dmaic','fmea'].forEach(function(k){ localStorage.setItem('cia-tour:m:'+k,'done'); }); } }catch(e){} })();"""
results = []


def check(name, cond, detail=""):
    results.append((name, bool(cond), detail))
    print(("PASS " if cond else "FAIL ") + name + (("  -- " + str(detail)[:400]) if detail and not cond else ""), flush=True)


def run(b, base):
    ctx = b.new_context(viewport={"width": 1280, "height": 900}); pg = ctx.new_page(); errs = []
    pg.on("pageerror", lambda e: errs.append(str(e))); pg.on("dialog", lambda d: d.accept())
    pg.add_init_script(FREEZE)
    pg.goto(base + "/modules/dmaic.html", wait_until="load"); pg.wait_for_timeout(300)
    out = {}
    pg.evaluate("go('docs')"); pg.evaluate("document.getElementById('pfEx').click()"); pg.wait_for_timeout(300)
    out["example"] = pg.evaluate("localStorage.getItem('cia-dmaic:v1')")
    out["report"] = pg.evaluate("buildReportHTML()"); out["csv"] = pg.evaluate("buildCSV()")
    out["tabs"] = {}
    for lang in ("ar", "en"):
        if pg.evaluate("L") != lang: pg.evaluate("switchLang()"); pg.wait_for_timeout(150)
        for t in TABS:
            out["tabs"][lang + ":" + t] = pg.evaluate(f"(go('{t}'), document.querySelector('.tabpane[data-tab=\"{t}\"]').innerText)")
        for rid in ("DM-EX-01", "DM-EX-02", "DM-EX-03"):
            pg.evaluate(f"go('tools'); loadRecordIntoForm(DB.records.find(r=>r.id==='{rid}')); 0"); pg.wait_for_timeout(100)
            out["tabs"][lang + ":tools/" + rid] = pg.evaluate("document.querySelector('.tabpane[data-tab=\"tools\"]').innerText")
    if pg.evaluate("L") != "ar": pg.evaluate("switchLang()")
    pg.evaluate("go('tools'); clearForm(); 0")
    for sel, v in (("#f-title", "Late certificates"), ("#f-ref", "NCR-2026-090"), ("#f-lead", "Quality engineer"), ("#f-sponsor", "Quality manager"),
                   ("#f-problem", "Three certificates were late."), ("#f-gmeasure", "Late certificates %"), ("#f-gfrom", "8"), ("#f-gto", "2")):
        pg.fill(sel, v)
    pg.click("#saveBtn"); pg.wait_for_timeout(80)
    pg.evaluate("go('assess')"); pg.check('input[name="as-DF1"][value="2"]'); pg.wait_for_timeout(80)
    out["flow"] = pg.evaluate("localStorage.getItem('cia-dmaic:v1')")
    out["audit"] = pg.evaluate("JSON.stringify(DB.records.map(auditRecord))")
    out["errs"] = errs
    ctx.close()
    return out


with sync_playwright() as p:
    b = p.chromium.launch()
    old, new = run(b, ORIG), run(b, BASE)
    check("DMAIC stored state after the example is identical", old["example"] == new["example"] and len(new["example"]) > 1000)
    check("DMAIC report HTML is identical", old["report"] == new["report"])
    check("DMAIC CSV is identical", old["csv"] == new["csv"])
    check("DMAIC stored state after a scripted project and an answer is identical", old["flow"] == new["flow"])
    check("DMAIC automatic audit results are identical", old["audit"] == new["audit"])
    check("no errors in either version", not old["errs"] and not new["errs"], [old["errs"][:2], new["errs"][:2]])
    diffs = {}
    for k in old["tabs"]:
        if old["tabs"][k] != new["tabs"][k]:
            diffs[k] = [x for x in difflib.unified_diff(old["tabs"][k].splitlines(), new["tabs"][k].splitlines(), lineterm="", n=0) if x[:1] in "+-" and x[:3] not in ("+++", "---")]
    check("with no FMEA data, the text of every tab is identical (AR/EN, including the three example forms)", not diffs, sorted(diffs))
    # with the FMEA example in the browser (new version only)
    ctx = b.new_context(viewport={"width": 1280, "height": 900}); pg = ctx.new_page(); errs = []
    pg.on("pageerror", lambda e: errs.append(str(e))); pg.on("dialog", lambda d: d.accept()); pg.add_init_script(FREEZE)
    pg.add_init_script("window.__opened=[]; window.open=function(u){ window.__opened.push(String(u)); return null; };")
    pg.goto(BASE + "/modules/dmaic.html", wait_until="load"); pg.wait_for_timeout(300)
    pg.evaluate("go('docs')"); pg.evaluate("document.getElementById('pfEx').click()"); pg.wait_for_timeout(300)
    c0 = pg.evaluate("localStorage.getItem('cia-dmaic:v1')")
    pg.goto(BASE + "/modules/fmea.html", wait_until="load"); pg.wait_for_timeout(300)
    pg.evaluate("go('docs')"); pg.evaluate("document.getElementById('pfEx').click()"); pg.wait_for_timeout(300)
    r0 = pg.evaluate("localStorage.getItem('cia-fmea:v1')")
    pg.goto(BASE + "/modules/dmaic.html", wait_until="load"); pg.wait_for_timeout(300)
    pan = {}
    for rid in ("DM-EX-01", "DM-EX-02", "DM-EX-03"):
        pg.evaluate(f"go('tools'); loadRecordIntoForm(DB.records.find(r=>r.id==='{rid}')); 0"); pg.wait_for_timeout(80)
        pan[rid] = pg.evaluate("document.getElementById('fmBox').hidden ? '' : document.getElementById('fmBox').innerText")
    check("the panel lists FM-EX-01 on DM-EX-01 and FM-EX-03 on DM-EX-03 with rows and actions, and stays hidden on DM-EX-02",
          "FM-EX-01" in pan["DM-EX-01"] and "7 صف" in pan["DM-EX-01"] and "FM-EX-03" in pan["DM-EX-03"] and pan["DM-EX-02"] == "", pan)
    pg.evaluate("go('tools'); loadRecordIntoForm(DB.records.find(r=>r.id==='DM-EX-01')); 0"); pg.wait_for_timeout(80)
    pg.click('[data-fmopen="FM-EX-01"]'); pg.wait_for_timeout(80)
    check("'Open in FMEA' asks for fmea.html?open=FM-EX-01 outside the hub", any("fmea.html?open=FM-EX-01" in u for u in pg.evaluate("window.__opened")), pg.evaluate("window.__opened"))
    check("reading the FMEA data changes neither DMAIC's nor FMEA's stored state", pg.evaluate("localStorage.getItem('cia-dmaic:v1')") == c0 and pg.evaluate("localStorage.getItem('cia-fmea:v1')") == r0)
    check("no errors with the FMEA data present", not errs, errs[:3])
    ctx.close()
    b.close()
json.dump(diffs, open(OUT, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
failed = [r for r in results if not r[1]]
print(f"\n{len(results) - len(failed)}/{len(results)} passed")
sys.exit(1 if failed else 0)
