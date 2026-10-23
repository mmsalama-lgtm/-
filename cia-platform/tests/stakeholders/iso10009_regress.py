"""ISO 10009 guide before and after the catalogue change of the Stakeholder Analysis step (2026-10-17): the stakeholder tool becomes a related
platform link ("rel") for 6.5 RACI and for the 5.5 "other relevant tool" COTO log; FILES and NAMES gain "stakeholders". The tool's "own" record
field stays empty and REC_KEYS is unchanged, so storyboard steps do not become linkable. Serve the uploaded package at CIA_ORIG (default :8801)
and this one at CIA_BASE (default :8802). With Date and Math.random frozen, the example is loaded in the old and the new iso10009.html.
Expected: stored state, CSV, audit of every storyboard and self-assessment identical; 6.5 keeps its level "in"; the coverage counts are
unchanged (8 dedicated, 12 inside, 3 here, 11 related, 19 none); the default report differs only in the 6.5 row (one more platform name).
Differences are listed in tests/platform/results/text-diff-iso10009-stakeholders.json. Usage: python3 tests/stakeholders/iso10009_regress.py"""
import os, sys, json, difflib, re
from playwright.sync_api import sync_playwright
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "..", "platform", "results", "text-diff-iso10009-stakeholders.json")
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
           "lv65": pg.evaluate("TL.filter(function(x){ return x.c==='6.5'; })[0].lv"),
           "p65": pg.evaluate("JSON.stringify(TL.filter(function(x){ return x.c==='6.5'; })[0].plat||TL.filter(function(x){ return x.c==='6.5'; })[0].p||null)"), "errs": errs}
    ctx.close(); return out


def lines(a, b):
    sp = lambda x: re.split(r"(?<=>)(?=<)|\n", x)
    return [x for x in difflib.unified_diff(sp(a), sp(b), lineterm="", n=0) if x[:1] in "+-" and x[:3] not in ("+++", "---")]


with sync_playwright() as p:
    b = p.chromium.launch(); old, new = run(b, ORIG), run(b, BASE); b.close()
check("ISO 10009 stored state after the example is identical", old["state"] == new["state"] and len(new["state"]) > 1000)
check("CSV is byte-identical", old["csv"] == new["csv"])
check("audit of every storyboard is identical (no step becomes linkable to a register)", old["audit"] == new["audit"])
check("self-assessment score is identical", old["assess"] == new["assess"])
check("6.5 RACI keeps its level 'in'", old["lv65"] == "in" and new["lv65"] == "in", (old["lv65"], new["lv65"]))
check("6.5 RACI gains the stakeholder tool as a related platform link", "stakeholders" in new["p65"] and "stakeholders" not in old["p65"], (old["p65"], new["p65"]))
check("coverage counts unchanged (8, 12, 3, 11, 19)", old["cov"] == new["cov"] == [8, 12, 3, 11, 19], (old["cov"], new["cov"]))
rd = lines(old["report"], new["report"])
OKR = re.compile(r"6\.5|RACI|الأطراف المعنية|Stakeholder|مركز التميز التشغيلي|Operations Excellence|^[+-]<(br|small|/small|/td|td|span|/span)[^>]*>")
check("default report: differences only in the 6.5 row (or none)", len(rd) <= 12 and all(OKR.search(x) for x in rd), [x for x in rd if not OKR.search(x)][:6])
check("no errors in either version", not old["errs"] and not new["errs"])
json.dump({"report": rd, "coverage": {"old": old["cov"], "new": new["cov"]}}, open(OUT, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
failed = [r for r in results if not r[1]]
print(f"\n{len(results) - len(failed)}/{len(results)} passed")
sys.exit(1 if failed else 0)
