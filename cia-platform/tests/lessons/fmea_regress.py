"""FMEA before and after the Lessons Learned panel (2026-10-16, Lessons Learned step). Serve the uploaded package (the FMEA release) at CIA_ORIG (default :8801)
and this one at CIA_BASE (default :8802). With Date and Math.random frozen, the same steps run on the old and the new fmea.html:
example data, a scripted study, the self-assessment; then stored state, report HTML, CSV, audit and the text of every tab (plus the forms
of FM-EX-01 … FM-EX-03) are compared. Expected: everything identical while no lessons data exists (the panel stays hidden and empty).
Then, in the new version only, with the Lessons Learned example in the browser: the panel lists LL-EX-01, LL-EX-02 and LL-EX-03 on their
studies, "Open in Lessons Learned" asks for the tool with ?open=, and neither FMEA's nor the lessons' stored state changes.
Usage: python3 tests/lessons/fmea_regress.py"""
import os, sys, json, difflib
from playwright.sync_api import sync_playwright
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "..", "platform", "results", "text-diff-fmea-lessons.json")
BASE = os.environ.get("CIA_BASE", "http://127.0.0.1:8802"); ORIG = os.environ.get("CIA_ORIG", "http://127.0.0.1:8801")
TABS = ["home", "explain-std", "explain-cl", "assess", "tools", "docs", "audit", "dash", "report", "ai"]
FREEZE = """(function(){ var T=Date.UTC(2026,9,16,9,0,0), OD=Date;
 function FD(){ if(!(this instanceof FD)) return new OD(T).toString(); var a=[].slice.call(arguments);
   return a.length? new (Function.prototype.bind.apply(OD,[null].concat(a)))() : new OD(T); }
 FD.now=function(){ return T; }; FD.UTC=OD.UTC; FD.parse=OD.parse; FD.prototype=OD.prototype; window.Date=FD;
 var s=20261016; Math.random=function(){ s=(s*16807)%2147483647; return (s-1)/2147483646; };
 try{ if(!sessionStorage.getItem('f0')){ sessionStorage.setItem('f0','1'); localStorage.clear(); localStorage.setItem('cia-lang','ar'); ['fmea','lessons'].forEach(function(k){ localStorage.setItem('cia-tour:m:'+k,'done'); }); } }catch(e){} })();"""
results = []


def check(name, cond, detail=""):
    results.append((name, bool(cond), detail))
    print(("PASS " if cond else "FAIL ") + name + (("  -- " + str(detail)[:400]) if detail and not cond else ""), flush=True)


def run(b, base):
    ctx = b.new_context(viewport={"width": 1280, "height": 900}); pg = ctx.new_page(); errs = []
    pg.on("pageerror", lambda e: errs.append(str(e))); pg.on("dialog", lambda d: d.accept())
    pg.add_init_script(FREEZE)
    pg.goto(base + "/modules/fmea.html", wait_until="load"); pg.wait_for_timeout(300)
    out = {}
    pg.evaluate("go('docs')"); pg.evaluate("document.getElementById('pfEx').click()"); pg.wait_for_timeout(300)
    out["example"] = pg.evaluate("localStorage.getItem('cia-fmea:v1')")
    out["report"] = pg.evaluate("buildReportHTML()"); out["csv"] = pg.evaluate("buildCSV()")
    out["tabs"] = {}
    for lang in ("ar", "en"):
        if pg.evaluate("L") != lang: pg.evaluate("switchLang()"); pg.wait_for_timeout(150)
        for t in TABS:
            out["tabs"][lang + ":" + t] = pg.evaluate(f"(go('{t}'), document.querySelector('.tabpane[data-tab=\"{t}\"]').innerText)")
        for rid in ("FM-EX-01", "FM-EX-02", "FM-EX-03"):
            pg.evaluate(f"go('tools'); loadRecordIntoForm(DB.records.find(r=>r.id==='{rid}')); 0"); pg.wait_for_timeout(100)
            out["tabs"][lang + ":tools/" + rid] = pg.evaluate("document.querySelector('.tabpane[data-tab=\"tools\"]').innerText")
    if pg.evaluate("L") != "ar": pg.evaluate("switchLang()")
    pg.evaluate("go('tools'); clearForm(); 0")
    for sel, v in (("#f-title", "Tile adhesive mixing"), ("#f-ref", "PFMEA-T-01"), ("#f-facil", "Quality engineer"), ("#f-owner", "Site manager"), ("#f-scope", "From bag to mixed adhesive")):
        pg.fill(sel, v)
    pg.click("#saveBtn"); pg.wait_for_timeout(80)
    pg.evaluate("go('assess')"); pg.check('input[name="as-PP1"][value="2"]'); pg.wait_for_timeout(80)
    out["flow"] = pg.evaluate("localStorage.getItem('cia-fmea:v1')")
    out["audit"] = pg.evaluate("JSON.stringify(DB.records.map(auditRecord))")
    out["errs"] = errs
    ctx.close()
    return out


with sync_playwright() as p:
    b = p.chromium.launch()
    old, new = run(b, ORIG), run(b, BASE)
    check("FMEA stored state after the example is identical", old["example"] == new["example"] and len(new["example"]) > 1000)
    check("FMEA report HTML is identical", old["report"] == new["report"])
    check("FMEA CSV is identical", old["csv"] == new["csv"])
    check("FMEA stored state after a scripted study and an answer is identical", old["flow"] == new["flow"])
    check("FMEA automatic audit results are identical", old["audit"] == new["audit"])
    check("no errors in either version", not old["errs"] and not new["errs"], [old["errs"][:2], new["errs"][:2]])
    diffs = {}
    for k in old["tabs"]:
        if old["tabs"][k] != new["tabs"][k]:
            diffs[k] = [x for x in difflib.unified_diff(old["tabs"][k].splitlines(), new["tabs"][k].splitlines(), lineterm="", n=0) if x[:1] in "+-" and x[:3] not in ("+++", "---")]
    check("with no lessons data, the text of every tab is identical (AR/EN, including the three example forms)", not diffs, sorted(diffs))
    # with the Lessons Learned example in the browser (new version only)
    ctx = b.new_context(viewport={"width": 1280, "height": 900}); pg = ctx.new_page(); errs = []
    pg.on("pageerror", lambda e: errs.append(str(e))); pg.on("dialog", lambda d: d.accept()); pg.add_init_script(FREEZE)
    pg.add_init_script("window.__opened=[]; window.open=function(u){ window.__opened.push(String(u)); return null; };")
    pg.goto(BASE + "/modules/fmea.html", wait_until="load"); pg.wait_for_timeout(300)
    pg.evaluate("go('docs')"); pg.evaluate("document.getElementById('pfEx').click()"); pg.wait_for_timeout(300)
    c0 = pg.evaluate("localStorage.getItem('cia-fmea:v1')")
    pg.goto(BASE + "/modules/lessons.html", wait_until="load"); pg.wait_for_timeout(300)
    pg.evaluate("go('docs')"); pg.evaluate("document.getElementById('pfEx').click()"); pg.wait_for_timeout(300)
    r0 = pg.evaluate("localStorage.getItem('cia-lessons:v1')")
    pg.goto(BASE + "/modules/fmea.html", wait_until="load"); pg.wait_for_timeout(300)
    pan = {}
    for rid in ("FM-EX-01", "FM-EX-02", "FM-EX-03"):
        pg.evaluate(f"go('tools'); loadRecordIntoForm(DB.records.find(r=>r.id==='{rid}')); 0"); pg.wait_for_timeout(80)
        pan[rid] = pg.evaluate("document.getElementById('llBox').hidden ? '' : document.getElementById('llBox').innerText")
    check("the panel lists LL-EX-01 on FM-EX-01, LL-EX-02 on FM-EX-02 and LL-EX-03 on FM-EX-03 with their actions done",
          "LL-EX-01" in pan["FM-EX-01"] and "3 من 3" in pan["FM-EX-01"] and "LL-EX-02" in pan["FM-EX-02"] and "LL-EX-03" in pan["FM-EX-03"] and "LL-EX-01" not in pan["FM-EX-02"], pan)
    pg.evaluate("go('tools'); loadRecordIntoForm(DB.records.find(r=>r.id==='FM-EX-01')); 0"); pg.wait_for_timeout(80)
    pg.click('[data-llopen="LL-EX-01"]'); pg.wait_for_timeout(80)
    check("'Open in Lessons Learned' asks for lessons.html?open=LL-EX-01 outside the hub", any("lessons.html?open=LL-EX-01" in u for u in pg.evaluate("window.__opened")), pg.evaluate("window.__opened"))
    check("reading the lessons changes neither FMEA's nor the lessons' stored state", pg.evaluate("localStorage.getItem('cia-fmea:v1')") == c0 and pg.evaluate("localStorage.getItem('cia-lessons:v1')") == r0)
    check("no errors with the lessons data present", not errs, errs[:3])
    ctx.close()
    b.close()
json.dump(diffs, open(OUT, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
failed = [r for r in results if not r[1]]
print(f"\n{len(results) - len(failed)}/{len(results)} passed")
sys.exit(1 if failed else 0)
