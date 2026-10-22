"""Step 10.1 (2026-10-16, full explanation of ISO 10009 in modules/iso10009.html): nothing the user stores or exports may change.
Serve the uploaded package at CIA_ORIG (default :8801) and this one at CIA_BASE (default :8802). With Date and Math.random frozen, the
example is loaded in the old and the new iso10009.html; the stored state, the report built without the new appendix, the CSV and the audit
of every storyboard must be identical, the learning-path key must stay absent until a tool is marked, and marking one must not touch
"cia-iso10009:v1". Usage: python3 tests/iso10009/explain_regress.py"""
import os, sys, json, difflib, re
from playwright.sync_api import sync_playwright
BASE = os.environ.get("CIA_BASE", "http://127.0.0.1:8802"); ORIG = os.environ.get("CIA_ORIG", "http://127.0.0.1:8801")
FREEZE = """(function(){ var T=Date.UTC(2026,9,16,9,0,0), OD=Date;
 function FD(){ if(!(this instanceof FD)) return new OD(T).toString(); var a=[].slice.call(arguments);
   return a.length? new (Function.prototype.bind.apply(OD,[null].concat(a)))() : new OD(T); }
 FD.now=function(){ return T; }; FD.UTC=OD.UTC; FD.parse=OD.parse; FD.prototype=OD.prototype; window.Date=FD;
 var s=20261016; Math.random=function(){ s=(s*16807)%2147483647; return (s-1)/2147483646; };
 try{ if(!sessionStorage.getItem('f0')){ sessionStorage.setItem('f0','1'); localStorage.clear(); localStorage.setItem('cia-lang','ar'); localStorage.setItem('cia-tour:m:iso10009','done'); } }catch(e){} })();"""
results = []


def check(name, cond, detail=""):
    results.append((name, bool(cond), detail))
    print(("PASS " if cond else "FAIL ") + name + (("  -- " + str(detail)[:400]) if detail and not cond else ""), flush=True)


def run(b, base, new=False):
    ctx = b.new_context(viewport={"width": 1280, "height": 900}); pg = ctx.new_page(); errs = []
    pg.on("pageerror", lambda e: errs.append(str(e))); pg.on("dialog", lambda d: d.accept()); pg.add_init_script(FREEZE)
    pg.goto(base + "/modules/iso10009.html", wait_until="load"); pg.wait_for_timeout(300)
    pg.evaluate("go('docs')"); pg.evaluate("document.getElementById('pfEx').click()"); pg.wait_for_timeout(300)
    out = {"state": pg.evaluate("localStorage.getItem('cia-iso10009:v1')"), "report": pg.evaluate("buildReportHTML()"), "csv": pg.evaluate("buildCSV()"),
           "audit": pg.evaluate("DB.records.map(auditRecord)"), "assess": pg.evaluate("assessScore()"), "errs": errs}
    if new:
        out["pk0"] = pg.evaluate("localStorage.getItem('cia-iso10009-paths:v1')")
        pg.evaluate("go('explain-cl'); qxTool('14.5')"); pg.evaluate("document.querySelector('[data-qxdone=\"14.5\"]').click()"); pg.wait_for_timeout(100)
        pg.evaluate("qxClause('14')"); pg.evaluate("document.querySelector('[data-qxq=\"14|0|1\"]').click()")
        out["pk1"] = pg.evaluate("localStorage.getItem('cia-iso10009-paths:v1')"); out["state2"] = pg.evaluate("localStorage.getItem('cia-iso10009:v1')")
        out["reportTick"] = pg.evaluate("(function(){ var ax=document.getElementById('rpAppx'); return ax && !ax.checked; })()")
        out["keys"] = pg.evaluate("Object.keys(localStorage).sort()")
    ctx.close(); return out


with sync_playwright() as p:
    b = p.chromium.launch(); old, new = run(b, ORIG), run(b, BASE, True); b.close()
check("stored state after the example is identical", old["state"] == new["state"] and len(new["state"]) > 1000)
R51 = re.compile(r"<tr><td><code>5\.[12]</code>.*?</tr>")   # the SWOT and PESTLE steps (2026-10-17) make 5.1 and 5.2 dedicated platform tools: those coverage rows are set aside
check("report without the appendix is byte-identical (apart from the 5.1 and 5.2 coverage rows changed by the SWOT and PESTLE steps)", R51.sub("", old["report"]) == R51.sub("", new["report"]) and len(R51.findall(new["report"])) == 2, (len(old["report"]), len(new["report"])))
check("CSV is byte-identical", old["csv"] == new["csv"])
check("audit of every storyboard is identical", old["audit"] == new["audit"])
check("self-assessment score is identical", old["assess"] == new["assess"])
check("the appendix box is there and unticked by default", new["reportTick"] is True)
check("learning-path key absent until a tool is marked", new["pk0"] is None)
check("marking a tool writes only cia-iso10009-paths:v1", new["pk1"] == '{"studied":["14.5"]}' and new["state2"] == new["state"], new["pk1"])
check("self-check answers are not stored", not any("quiz" in k for k in new["keys"]), new["keys"])
check("no errors in either version", not old["errs"] and not new["errs"], old["errs"] + new["errs"])
failed = [r for r in results if not r[1]]
print(f"\n== iso10009-explain-regress: {len(results) - len(failed)}/{len(results)} passed")
sys.exit(1 if failed else 0)
