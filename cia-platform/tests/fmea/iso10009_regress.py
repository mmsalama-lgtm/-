"""ISO 10009 guide before and after the catalogue change of the FMEA step (2026-10-16): 7.3 FMEA became a dedicated platform tool.
Serve the uploaded package (the ISO 10009 release) at CIA_ORIG (default :8801) and this one at CIA_BASE (default :8802). With Date and
Math.random frozen, the example is loaded in the old and the new iso10009.html; stored state, report, CSV and audit are compared.
Expected: stored state identical; the report and CSV differ only where 7.3 is described (coverage level, platform link, link check);
the audit differs only in QT-EX-02's "link" check (its done 7.3 FMEA step is now linkable and names no study). Differences are listed in
tests/platform/results/text-diff-iso10009-fmea.json. Usage: python3 tests/fmea/iso10009_regress.py"""
import os, sys, json, difflib, re
from playwright.sync_api import sync_playwright
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "..", "platform", "results", "text-diff-iso10009-fmea.json")
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


def run(b, base):
    ctx = b.new_context(viewport={"width": 1280, "height": 900}); pg = ctx.new_page(); errs = []
    pg.on("pageerror", lambda e: errs.append(str(e))); pg.on("dialog", lambda d: d.accept()); pg.add_init_script(FREEZE)
    pg.goto(base + "/modules/iso10009.html", wait_until="load"); pg.wait_for_timeout(300)
    pg.evaluate("go('docs')"); pg.evaluate("document.getElementById('pfEx').click()"); pg.wait_for_timeout(300)
    out = {"state": pg.evaluate("localStorage.getItem('cia-iso10009:v1')"), "report": pg.evaluate("buildReportHTML()"), "csv": pg.evaluate("buildCSV()"),
           "audit": pg.evaluate("DB.records.map(auditRecord)"), "errs": errs}
    ctx.close(); return out


def lines(a, b):
    sp = lambda x: re.split(r"(?<=>)(?=<)|\n", x)
    return [x for x in difflib.unified_diff(sp(a), sp(b), lineterm="", n=0) if x[:1] in "+-" and x[:3] not in ("+++", "---")]


with sync_playwright() as p:
    b = p.chromium.launch(); old, new = run(b, ORIG), run(b, BASE); b.close()
check("ISO 10009 stored state after the example is identical", old["state"] == new["state"] and len(new["state"]) > 1000)
ad = [(i, k, old["audit"][i][k], new["audit"][i][k]) for i in range(3) for k in old["audit"][i] if old["audit"][i][k] != new["audit"][i][k]]
check("audit: only QT-EX-02 'link' changes (null/true → false: its done 7.3 FMEA step is now linkable)", [(i, k) for i, k, _, _ in ad] == [(1, "link")] and ad[0][3] is False, ad)
rd, cd = lines(old["report"], new["report"]), lines(old["csv"], new["csv"])
OKR = re.compile(r"7\.3|FMEA|نجاح التدقيق|خطوات مرتبطة|بنود مفتوحة|أداة مستقلة|جزء من أداة|التدقيق الذكي|^[+-]<(br|li|/li)>$|class=\"(ok|bad|na)\"|✓|✗|—|QT-EX-02|ربط|سجل")
check("report: differences only in the 7.3 coverage row, QT-EX-02's link check and the summary figures that count them", rd and all(OKR.search(x) for x in rd), [x for x in rd if not OKR.search(x)][:6])
check("CSV: differences only on QT-EX-02 or 7.3", all(("QT-EX-02" in x or "7.3" in x) for x in cd), cd[:4])
check("no errors in either version", not old["errs"] and not new["errs"])
json.dump({"audit": ad, "report": rd, "csv": cd}, open(OUT, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
failed = [r for r in results if not r[1]]
print(f"\n{len(results) - len(failed)}/{len(results)} passed")
sys.exit(1 if failed else 0)
