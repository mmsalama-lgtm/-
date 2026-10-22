"""ISO 10009 guide before and after the catalogue change of the PESTLE step (2026-10-17): 5.2 PESTLE became a dedicated platform tool (level
"own" through its platform link; the tool's "own" record field stays empty, so storyboard steps do not become linkable). Serve the uploaded
package at CIA_ORIG (default :8801) and this one at CIA_BASE (default :8802). With Date and Math.random frozen, the example is loaded in the
old and the new iso10009.html. Expected: stored state, CSV, audit of every storyboard and self-assessment identical; the default report
differs only in the 5.2 row of the coverage table (level and platform names); coverage counts change by one (dedicated 7 → 8, inside
13 → 12). Differences are listed in tests/platform/results/text-diff-iso10009-pestle.json. Usage: python3 tests/pestle/iso10009_regress.py"""
import os, sys, json, difflib, re
from playwright.sync_api import sync_playwright
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "..", "platform", "results", "text-diff-iso10009-pestle.json")
BASE = os.environ.get("CIA_BASE", "http://127.0.0.1:8802"); ORIG = os.environ.get("CIA_ORIG", "http://127.0.0.1:8801")
FREEZE = """(function(){ var T=Date.UTC(2026,9,17,9,0,0), OD=Date;
 function FD(){ if(!(this instanceof FD)) return new OD(T).toString(); var a=[].slice.call(arguments);
   return a.length? new (Function.prototype.bind.apply(OD,[null].concat(a)))() : new OD(T); }
 FD.now=function(){ return T; }; FD.UTC=OD.UTC; FD.parse=OD.parse; FD.prototype=OD.prototype; window.Date=FD;
 var s=20261017; Math.random=function(){ s=(s*16807)%2147483647; return (s-1)/2147483646; };
 try{ if(!sessionStorage.getItem('f0')){ sessionStorage.setItem('f0','1'); localStorage.clear(); localStorage.setItem('cia-lang','ar'); localStorage.setItem('cia-tour:m:iso10009','done'); } }catch(e){} })();"""
results = []


def check(name, cond, detail=""):
    results.append((name, bool(cond), detail))
    print(("PASS " if cond else "FAIL ") + name + (("  -- " + str(detail)[:400]) if detail and not cond else ""), flush=True)


def run(b, base):
    ctx = b.new_context(viewport={"width": 1280, "height": 900}); pg = ctx.new_page(); errs = []
    pg.on("pageerror", lambda e: errs.append(str(e))); pg.on("dialog", lambda d: d.accept()); pg.add_init_script(FREEZE)
    pg.goto(base + "/modules/iso10009.html", wait_until="load"); pg.wait_for_timeout(300)
    pg.evaluate("go('docs')"); pg.evaluate("document.getElementById('pfEx').click()"); pg.wait_for_timeout(300)
    out = {"state": pg.evaluate("localStorage.getItem('cia-iso10009:v1')"), "report": pg.evaluate("buildReportHTML()"), "csv": pg.evaluate("buildCSV()"),
           "audit": pg.evaluate("DB.records.map(auditRecord)"), "assess": pg.evaluate("assessScore()"),
           "cov": pg.evaluate("(function(){ var c=covCounts(TL); return [c.own,c.in,c.here,c.rel,c.none]; })()"),
           "lv51": pg.evaluate("TL.filter(function(x){ return x.c==='5.2'; })[0].lv"), "errs": errs}
    ctx.close(); return out


def lines(a, b):
    sp = lambda x: re.split(r"(?<=>)(?=<)|\n", x)
    return [x for x in difflib.unified_diff(sp(a), sp(b), lineterm="", n=0) if x[:1] in "+-" and x[:3] not in ("+++", "---")]


with sync_playwright() as p:
    b = p.chromium.launch(); old, new = run(b, ORIG), run(b, BASE); b.close()
check("ISO 10009 stored state after the example is identical", old["state"] == new["state"] and len(new["state"]) > 1000)
check("CSV is byte-identical", old["csv"] == new["csv"])
check("audit of every storyboard is identical (5.2 steps do not become linkable)", old["audit"] == new["audit"])
check("self-assessment score is identical", old["assess"] == new["assess"])
check("5.2 PESTLE: level 'in' → 'own'", old["lv51"] == "in" and new["lv51"] == "own", (old["lv51"], new["lv51"]))
check("coverage counts: dedicated 7 → 8, inside 13 → 12, the rest unchanged", old["cov"] == [7, 13, 3, 11, 19] and new["cov"] == [8, 12, 3, 11, 19], (old["cov"], new["cov"]))
rd = lines(old["report"], new["report"])
OKR = re.compile(r"5\.2|PESTLE|أداة مستقلة|جزء من أداة|مخططة في صندوق الأدوات|استوديو الاستراتيجية|Strategy|^[+-]<(br|small|/small|/td|td|span|/span)[^>]*>")
check("default report: differences only in the 5.2 coverage row", rd and len(rd) <= 12 and all(OKR.search(x) for x in rd), [x for x in rd if not OKR.search(x)][:6])
check("no errors in either version", not old["errs"] and not new["errs"])
json.dump({"report": rd, "coverage": {"old": old["cov"], "new": new["cov"]}}, open(OUT, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
failed = [r for r in results if not r[1]]
print(f"\n{len(results) - len(failed)}/{len(results)} passed")
sys.exit(1 if failed else 0)
