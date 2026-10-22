"""Fishbone before and after the Pareto link (2026-10-11, Pareto step). Serve the uploaded package (the Fishbone release) at
CIA_ORIG (default :8801) and this one at CIA_BASE (default :8802). With Date and Math.random frozen, the same steps run on the old
and the new fishbone.html: example data, a scripted analysis, the self-assessment; then stored state, report HTML, CSV, audit and
the text of every tab (plus the forms of FB-EX-01 … FB-EX-03) are compared. Expected: everything identical while no Pareto data
exists. Then, in the new version only, with the Pareto example in the browser: the read-only panel lists the Pareto analysis on
FB-EX-01, FB-EX-02 and FB-EX-03, the ?pareto= request fills a new unsaved analysis, and Fishbone's stored state does not change.
Usage: python3 tests/pareto/fish_regress.py"""
import os, sys, json, difflib
from playwright.sync_api import sync_playwright
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "..", "platform", "results", "text-diff-fish-pareto.json")
BASE = os.environ.get("CIA_BASE", "http://127.0.0.1:8802"); ORIG = os.environ.get("CIA_ORIG", "http://127.0.0.1:8801")
TABS = ["home", "explain-std", "explain-cl", "assess", "tools", "docs", "audit", "dash", "report", "ai"]
FREEZE = """(function(){ var T=Date.UTC(2026,9,11,9,0,0), OD=Date;
 function FD(){ if(!(this instanceof FD)) return new OD(T).toString(); var a=[].slice.call(arguments);
   return a.length? new (Function.prototype.bind.apply(OD,[null].concat(a)))() : new OD(T); }
 FD.now=function(){ return T; }; FD.UTC=OD.UTC; FD.parse=OD.parse; FD.prototype=OD.prototype; window.Date=FD;
 var s=20261011; Math.random=function(){ s=(s*16807)%2147483647; return (s-1)/2147483646; };
 try{ if(!sessionStorage.getItem('f0')){ sessionStorage.setItem('f0','1'); localStorage.clear(); localStorage.setItem('cia-lang','ar'); ['five-whys','fishbone','pareto'].forEach(function(k){ localStorage.setItem('cia-tour:m:'+k,'done'); }); } }catch(e){} })();"""
results = []


def check(name, cond, detail=""):
    results.append((name, bool(cond), detail))
    print(("PASS " if cond else "FAIL ") + name + (("  -- " + str(detail)[:400]) if detail and not cond else ""), flush=True)




def run(b, base):
    ctx = b.new_context(viewport={"width": 1280, "height": 900}); pg = ctx.new_page(); errs = []
    pg.on("pageerror", lambda e: errs.append(str(e))); pg.on("dialog", lambda d: d.accept())
    pg.add_init_script(FREEZE)
    pg.goto(base + "/modules/fishbone.html", wait_until="load"); pg.wait_for_timeout(300)
    out = {}
    pg.evaluate("go('docs')"); pg.evaluate("document.getElementById('pfEx').click()"); pg.wait_for_timeout(300)
    out["example"] = pg.evaluate("localStorage.getItem('cia-fish:v1')")
    out["report"] = pg.evaluate("buildReportHTML()"); out["csv"] = pg.evaluate("buildCSV()")
    out["tabs"] = {}
    for lang in ("ar", "en"):
        if pg.evaluate("L") != lang: pg.evaluate("switchLang()"); pg.wait_for_timeout(150)
        for t in TABS:
            out["tabs"][lang + ":" + t] = pg.evaluate(f"(go('{t}'), document.querySelector('.tabpane[data-tab=\"{t}\"]').innerText)")
        for fid in ("FB-EX-01", "FB-EX-02", "FB-EX-03"):
            pg.evaluate(f"go('tools'); loadRecordIntoForm(DB.records.find(r=>r.id==='{fid}')); 0"); pg.wait_for_timeout(100)
            out["tabs"][lang + ":tools/" + fid] = pg.evaluate("document.querySelector('.tabpane[data-tab=\"tools\"]').innerText")
    if pg.evaluate("L") != "ar": pg.evaluate("switchLang()")
    pg.evaluate("go('tools'); clearForm(); 0")
    pg.fill("#f-title", "Late certificates"); pg.fill("#f-ref", "NCR-2026-090"); pg.fill("#f-what", "Three certificates were late."); pg.fill("#f-date", "2026-10-01")
    pg.click('[data-cadd="1"]'); pg.wait_for_timeout(40)
    cid = pg.evaluate("[...document.querySelectorAll('#boneBox .fb-item[data-id]')].pop().getAttribute('data-id')")
    pg.fill(f"#i-{cid}-t", "No due date for certificates."); pg.fill(f"#i-{cid}-ev", "Shipping list"); pg.select_option(f"#i-{cid}-st", "sup")
    pg.click("#saveBtn"); pg.wait_for_timeout(80)
    pg.evaluate("go('assess')"); pg.check('input[name="as-LK2"][value="2"]'); pg.wait_for_timeout(80)
    out["flow"] = pg.evaluate("localStorage.getItem('cia-fish:v1')")
    out["audit"] = pg.evaluate("JSON.stringify(DB.records.map(auditRecord))")
    out["errs"] = errs
    ctx.close()
    return out


with sync_playwright() as p:
    b = p.chromium.launch()
    old, new = run(b, ORIG), run(b, BASE)
    check("Fishbone stored state after the example is identical", old["example"] == new["example"] and len(new["example"]) > 1000)
    check("Fishbone report HTML is identical", old["report"] == new["report"])
    check("Fishbone CSV is identical", old["csv"] == new["csv"])
    check("Fishbone stored state after a scripted analysis and an answer is identical", old["flow"] == new["flow"])
    check("Fishbone automatic audit results are identical", old["audit"] == new["audit"])
    check("no errors in either version", not old["errs"] and not new["errs"], [old["errs"][:2], new["errs"][:2]])
    diffs = {}
    for k in old["tabs"]:
        if old["tabs"][k] != new["tabs"][k]:
            diffs[k] = [x for x in difflib.unified_diff(old["tabs"][k].splitlines(), new["tabs"][k].splitlines(), lineterm="", n=0) if x[:1] in "+-" and x[:3] not in ("+++", "---")]
    sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "iso10009")); import kitdiff; diffs = kitdiff.strip(diffs)   # ISO 10009 step: only the kit references on the method tab changed (tests/iso10009/kits_regress.py)
    check("with no Pareto data, the text of every tab is identical (AR/EN, including the three example forms)", not diffs, sorted(diffs))
    # with the Pareto example in the browser (new version only)
    ctx = b.new_context(viewport={"width": 1280, "height": 900}); pg = ctx.new_page(); errs = []
    pg.on("pageerror", lambda e: errs.append(str(e))); pg.on("dialog", lambda d: d.accept()); pg.add_init_script(FREEZE)
    pg.goto(BASE + "/modules/fishbone.html", wait_until="load"); pg.wait_for_timeout(300)
    pg.evaluate("go('docs')"); pg.evaluate("document.getElementById('pfEx').click()"); pg.wait_for_timeout(300)
    s0 = pg.evaluate("localStorage.getItem('cia-fish:v1')")
    pg.goto(BASE + "/modules/pareto.html", wait_until="load"); pg.wait_for_timeout(300)
    pg.evaluate("go('docs')"); pg.evaluate("document.getElementById('pfEx').click()"); pg.wait_for_timeout(300)
    p0 = pg.evaluate("localStorage.getItem('cia-pareto:v1')")
    pg.goto(BASE + "/modules/fishbone.html", wait_until="load"); pg.wait_for_timeout(300)
    pan = {}
    for fid in ("FB-EX-01", "FB-EX-02", "FB-EX-03"):
        pg.evaluate(f"go('tools'); loadRecordIntoForm(DB.records.find(r=>r.id==='{fid}')); 0"); pg.wait_for_timeout(80)
        pan[fid] = pg.evaluate("document.getElementById('paFrom').hidden ? '' : document.getElementById('paFrom').innerText")
    check("the panel lists PA-EX-01 on FB-EX-01, PA-EX-02 on FB-EX-02 and PA-EX-03 on FB-EX-03",
          "PA-EX-01" in pan["FB-EX-01"] and "PA-EX-02" in pan["FB-EX-02"] and "PA-EX-03" in pan["FB-EX-03"] and pan["FB-EX-02"].count("PA-EX-") == 1, pan)
    pg.evaluate("go('tools'); clearForm(); 0"); pg.wait_for_timeout(60)
    check("a new analysis shows no Pareto panel", pg.evaluate("document.getElementById('paFrom').hidden"))
    pg.goto(BASE + "/modules/fishbone.html?pareto=PA-EX-02&cat=k1#tools", wait_until="load"); pg.wait_for_timeout(350)
    f = pg.evaluate("({id:document.getElementById('rid').value, what:document.getElementById('f-what').value, much:document.getElementById('f-much').value, when:document.getElementById('f-when').value, ref:document.getElementById('f-ref').value, pdca:document.getElementById('f-pdca').value, tab:curTab, ok:document.getElementById('recOk').textContent})")
    check("?pareto=PA-EX-02&cat=k1 fills a new, unsaved analysis from the category", f["id"] == "" and f["tab"] == "tools" and "حرارة الخرسانة" in f["what"] and "14" in f["much"] and "35" in f["much"] and "40%" in f["much"] and f["when"] == "2026-04-01 → 2026-05-31" and f["ref"] == "NCR-2026-044" and f["pdca"] == "PD-EX-03" and "PA-EX-02" in f["ok"], f)
    check("reading the Pareto data and the request changes neither Fishbone's nor Pareto's stored state", pg.evaluate("localStorage.getItem('cia-fish:v1')") == s0 and pg.evaluate("localStorage.getItem('cia-pareto:v1')") == p0)
    pg.goto(BASE + "/modules/fishbone.html?pareto=PA-NONE&cat=k1#tools", wait_until="load"); pg.wait_for_timeout(300)
    check("an unknown Pareto analysis leaves the page on its tab with an empty form", pg.evaluate("document.getElementById('f-what').value") == "")
    check("no errors with the Pareto data present", not errs, errs[:3])
    ctx.close()
    b.close()
json.dump(diffs, open(OUT, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
failed = [r for r in results if not r[1]]
print(f"\n{len(results) - len(failed)}/{len(results)} passed")
sys.exit(1 if failed else 0)
