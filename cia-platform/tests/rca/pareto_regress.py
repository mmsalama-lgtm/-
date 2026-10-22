"""Pareto before and after the "rca" next step (2026-10-15, RCA step). Serve the uploaded package (the Pareto release) at CIA_ORIG
(default :8801) and this one at CIA_BASE (default :8802). With Date and Math.random frozen, the same steps run on the old and the
new pareto.html: example data, a scripted analysis, the self-assessment; then stored state, report HTML, CSV, audit and the text of
every tab (plus the forms of PA-EX-01 … PA-EX-03) are compared. Expected: stored state, report, CSV and audit identical; tab text
differs only where a next-step list is shown, by the new option "RCA investigation" (each difference is listed). Then, in the new
version only, with the RCA example in the browser: a category linked to RC-EX-01 shows the RCA preview, the value "rca" is stored
as an accepted next step, and the RCA tool's data does not change.
Usage: python3 tests/rca/pareto_regress.py"""
import os, sys, json, difflib
from playwright.sync_api import sync_playwright
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "..", "platform", "results", "text-diff-pareto-rca.json")
BASE = os.environ.get("CIA_BASE", "http://127.0.0.1:8802"); ORIG = os.environ.get("CIA_ORIG", "http://127.0.0.1:8801")
TABS = ["home", "explain-std", "explain-cl", "assess", "tools", "docs", "audit", "dash", "report", "ai"]
FREEZE = """(function(){ var T=Date.UTC(2026,9,15,9,0,0), OD=Date;
 function FD(){ if(!(this instanceof FD)) return new OD(T).toString(); var a=[].slice.call(arguments);
   return a.length? new (Function.prototype.bind.apply(OD,[null].concat(a)))() : new OD(T); }
 FD.now=function(){ return T; }; FD.UTC=OD.UTC; FD.parse=OD.parse; FD.prototype=OD.prototype; window.Date=FD;
 var s=20261015; Math.random=function(){ s=(s*16807)%2147483647; return (s-1)/2147483646; };
 try{ if(!sessionStorage.getItem('f0')){ sessionStorage.setItem('f0','1'); localStorage.clear(); localStorage.setItem('cia-lang','ar'); ['pareto','rca'].forEach(function(k){ localStorage.setItem('cia-tour:m:'+k,'done'); }); } }catch(e){} })();"""
results = []


def check(name, cond, detail=""):
    results.append((name, bool(cond), detail))
    print(("PASS " if cond else "FAIL ") + name + (("  -- " + str(detail)[:400]) if detail and not cond else ""), flush=True)


def run(b, base):
    ctx = b.new_context(viewport={"width": 1280, "height": 900}); pg = ctx.new_page(); errs = []
    pg.on("pageerror", lambda e: errs.append(str(e))); pg.on("dialog", lambda d: d.accept())
    pg.add_init_script(FREEZE)
    pg.goto(base + "/modules/pareto.html", wait_until="load"); pg.wait_for_timeout(300)
    out = {}
    pg.evaluate("go('docs')"); pg.evaluate("document.getElementById('pfEx').click()"); pg.wait_for_timeout(300)
    out["example"] = pg.evaluate("localStorage.getItem('cia-pareto:v1')")
    out["report"] = pg.evaluate("buildReportHTML()"); out["csv"] = pg.evaluate("buildCSV()")
    out["tabs"] = {}
    for lang in ("ar", "en"):
        if pg.evaluate("L") != lang: pg.evaluate("switchLang()"); pg.wait_for_timeout(150)
        for t in TABS:
            out["tabs"][lang + ":" + t] = pg.evaluate(f"(go('{t}'), document.querySelector('.tabpane[data-tab=\"{t}\"]').innerText)")
        for rid in ("PA-EX-01", "PA-EX-02", "PA-EX-03"):
            pg.evaluate(f"go('tools'); loadRecordIntoForm(DB.records.find(r=>r.id==='{rid}')); 0"); pg.wait_for_timeout(100)
            out["tabs"][lang + ":tools/" + rid] = pg.evaluate("document.querySelector('.tabpane[data-tab=\"tools\"]').innerText")
    if pg.evaluate("L") != "ar": pg.evaluate("switchLang()")
    pg.evaluate("go('tools'); clearForm(); 0")
    pg.fill("#f-title", "Complaints by reason"); pg.fill("#f-ref", "CC-2026-Q3"); pg.fill("#f-q", "Which reasons make most complaints?"); pg.fill("#f-from", "2026-07-01"); pg.fill("#f-to", "2026-09-30")
    for i, (n, v) in enumerate((("Late delivery", "12"), ("Wrong invoice", "7"), ("Damaged goods", "3"))):
        if i >= 3: pg.click("#catAdd")
        pg.fill(f'#catRows tr:nth-child({i+1}) [data-k="name"]', n); pg.fill(f'#catRows tr:nth-child({i+1}) [data-k="def"]', n + " as logged"); pg.fill(f'#catRows tr:nth-child({i+1}) [data-k="v"]', v)
    pg.click("#saveBtn"); pg.wait_for_timeout(80)
    pg.evaluate("go('assess')"); pg.check('input[name="as-AC3"][value="2"]'); pg.wait_for_timeout(80)
    out["flow"] = pg.evaluate("localStorage.getItem('cia-pareto:v1')")
    out["audit"] = pg.evaluate("JSON.stringify(DB.records.map(auditRecord))")
    out["errs"] = errs
    ctx.close()
    return out


with sync_playwright() as p:
    b = p.chromium.launch()
    old, new = run(b, ORIG), run(b, BASE)
    check("Pareto stored state after the example is identical", old["example"] == new["example"] and len(new["example"]) > 1000)
    check("Pareto report HTML is identical", old["report"] == new["report"])
    check("Pareto CSV is identical", old["csv"] == new["csv"])
    check("Pareto stored state after a scripted analysis and an answer is identical", old["flow"] == new["flow"])
    check("Pareto automatic audit results are identical", old["audit"] == new["audit"])
    check("no errors in either version", not old["errs"] and not new["errs"], [old["errs"][:2], new["errs"][:2]])
    diffs = {}
    for k in old["tabs"]:
        if old["tabs"][k] != new["tabs"][k]:
            diffs[k] = [x for x in difflib.unified_diff(old["tabs"][k].splitlines(), new["tabs"][k].splitlines(), lineterm="", n=0) if x[:1] in "+-" and x[:3] not in ("+++", "---")]
    sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "iso10009")); import kitdiff; diffs = kitdiff.strip(diffs)   # ISO 10009 step: only the kit references on the method tab changed (tests/iso10009/kits_regress.py)
    added = {k: [x for x in d if x.startswith("+")] for k, d in diffs.items()}
    removed = {k: [x for x in d if x.startswith("-")] for k, d in diffs.items()}
    ok_add = all(all(("RCA" in x) for x in v) for v in added.values()) and not any(removed.values())   # only the new option is added; nothing removed
    check("tab text differs only by the new next-step option 'RCA investigation' (listed in text-diff-pareto-rca.json)", ok_add, json.dumps(diffs, ensure_ascii=False)[:600])
    check("the differences sit on the analysis forms only (tools tab)", all(k.split(":")[1].startswith("tools") for k in diffs), sorted(diffs))
    # with the RCA example in the browser (new version only)
    ctx = b.new_context(viewport={"width": 1280, "height": 900}); pg = ctx.new_page(); errs = []
    pg.on("pageerror", lambda e: errs.append(str(e))); pg.on("dialog", lambda d: d.accept()); pg.add_init_script(FREEZE)
    pg.goto(BASE + "/modules/rca.html", wait_until="load"); pg.wait_for_timeout(300)
    pg.evaluate("go('docs')"); pg.evaluate("document.getElementById('pfEx').click()"); pg.wait_for_timeout(300)
    r0 = pg.evaluate("localStorage.getItem('cia-rca:v1')")
    pg.goto(BASE + "/modules/pareto.html", wait_until="load"); pg.wait_for_timeout(300)
    pg.evaluate("go('docs')"); pg.evaluate("document.getElementById('pfEx').click()"); pg.wait_for_timeout(300)
    pg.evaluate("go('tools'); loadRecordIntoForm(DB.records.find(r=>r.id==='PA-EX-03')); 0"); pg.wait_for_timeout(100)
    nid = pg.evaluate("[...document.querySelectorAll('#nxBox [data-nid]')].find(x=>!x.classList.contains('ok')).dataset.nid")
    pg.select_option(f"#nx-{nid}-h", "rca"); pg.wait_for_timeout(60); pg.fill(f"#nx-{nid}-r", "RC-EX-01"); pg.wait_for_timeout(60)
    check("an unlinked vital-few category linked to RC-EX-01 shows the RCA preview", "RC-EX-01" in pg.inner_text(f'[data-pv="{nid}"]') and "روجع التحقيق" in pg.inner_text(f'[data-pv="{nid}"]'))
    pg.click("#saveBtn"); pg.wait_for_timeout(80)
    st = pg.evaluate("JSON.parse(localStorage.getItem('cia-pareto:v1')).records.find(r=>r.id==='PA-EX-03').cats.find(c=>c.id==='%s').nx" % nid)
    check("the value 'rca' is stored as an accepted next step", st == {"how": "rca", "ref": "RC-EX-01"}, st)
    check("PA-EX-03 now has every vital-few category linked (stage moves past 'vital few')", pg.evaluate("stageOf(DB.records.find(r=>r.id==='PA-EX-03'))") == "acted")
    pg.reload(); pg.wait_for_timeout(300)
    check("the rca step survives a reload (fixRec accepts it)", pg.evaluate("DB.records.find(r=>r.id==='PA-EX-03').cats.find(c=>c.id==='%s').nx.how" % nid) == "rca")
    check("the RCA tool's data does not change", pg.evaluate("localStorage.getItem('cia-rca:v1')") == r0)
    check("no errors with the RCA data present", not errs, errs[:3])
    ctx.close()
    b.close()
json.dump(diffs, open(OUT, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
failed = [r for r in results if not r[1]]
print(f"\n{len(results) - len(failed)}/{len(results)} passed")
sys.exit(1 if failed else 0)
