"""CAPA before and after the Fishbone link (2026-10-11). Serve the uploaded package (the 5 Whys release) at CIA_ORIG (default
:8801) and this one at CIA_BASE (default :8802). With Date and Math.random frozen, the same steps run on the old and the new
capa.html: example data, a scripted record, the self-assessment; then stored state, report HTML, CSV, audit and the text of
every tab (plus the forms of CA-EX-01, a 5 Whys record, and CA-EX-02, a Fishbone record) are compared. Expected: stored state,
report, CSV and audit identical; tab text differs only on the Fishbone record's form, by the "Open the Fishbone tool" button
and the Fishbone panel (each difference is printed and saved). The 5 Whys panel is unchanged.
Usage: python3 tests/fish/capa_regress.py"""
import os, sys, json, difflib
from playwright.sync_api import sync_playwright
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "..", "platform", "results", "text-diff-capa-fish.json")
BASE = os.environ.get("CIA_BASE", "http://127.0.0.1:8802"); ORIG = os.environ.get("CIA_ORIG", "http://127.0.0.1:8801")
TABS = ["home", "explain-std", "explain-cl", "assess", "tools", "docs", "audit", "dash", "report", "ai"]
FREEZE = """(function(){ var T=Date.UTC(2026,9,11,9,0,0), OD=Date;
 function FD(){ if(!(this instanceof FD)) return new OD(T).toString(); var a=[].slice.call(arguments);
   return a.length? new (Function.prototype.bind.apply(OD,[null].concat(a)))() : new OD(T); }
 FD.now=function(){ return T; }; FD.UTC=OD.UTC; FD.parse=OD.parse; FD.prototype=OD.prototype; window.Date=FD;
 var s=20261011; Math.random=function(){ s=(s*16807)%2147483647; return (s-1)/2147483646; };
 try{ if(!sessionStorage.getItem('f0')){ sessionStorage.setItem('f0','1'); localStorage.clear(); localStorage.setItem('cia-lang','ar'); localStorage.setItem('cia-tour:m:capa','done'); } }catch(e){} })();"""
results = []


def check(name, cond, detail=""):
    results.append((name, bool(cond), detail))
    print(("PASS " if cond else "FAIL ") + name + (("  -- " + str(detail)[:400]) if detail and not cond else ""), flush=True)


def run(b, base):
    ctx = b.new_context(viewport={"width": 1280, "height": 900}); pg = ctx.new_page(); errs = []
    pg.on("pageerror", lambda e: errs.append(str(e))); pg.on("dialog", lambda d: d.accept())
    pg.add_init_script(FREEZE)
    pg.goto(base + "/modules/capa.html", wait_until="load"); pg.wait_for_timeout(300)
    out = {}
    pg.evaluate("go('docs')"); pg.evaluate("document.getElementById('pfEx').click()"); pg.wait_for_timeout(300)
    out["example"] = pg.evaluate("localStorage.getItem('cia-capa:v1')")
    out["report"] = pg.evaluate("buildReportHTML()"); out["csv"] = pg.evaluate("buildCSV()")
    out["tabs"] = {}
    for lang in ("ar", "en"):
        if pg.evaluate("L") != lang: pg.evaluate("switchLang()"); pg.wait_for_timeout(150)
        for t in TABS:
            out["tabs"][lang + ":" + t] = pg.evaluate(f"(go('{t}'), document.querySelector('.tabpane[data-tab=\"{t}\"]').innerText)")
        pg.evaluate("go('tools'); loadRecordIntoForm(DB.records.find(r=>r.id==='CA-EX-01')); 0"); pg.wait_for_timeout(100)
        out["tabs"][lang + ":tools/CA-EX-01"] = pg.evaluate("document.querySelector('.tabpane[data-tab=\"tools\"]').innerText")
        pg.evaluate("go('tools'); loadRecordIntoForm(DB.records.find(r=>r.id==='CA-EX-02')); 0"); pg.wait_for_timeout(100)
        out["tabs"][lang + ":tools/CA-EX-02"] = pg.evaluate("document.querySelector('.tabpane[data-tab=\"tools\"]').innerText")
    if pg.evaluate("L") != "ar": pg.evaluate("switchLang()")
    # scripted record flow
    pg.evaluate("go('tools'); clearForm(); 0")
    for sel, v in (("#f-title", "Late certificates"), ("#f-ref", "NCR-2026-090"), ("#f-desc", "Three certificates were late."), ("#f-raised", "2026-10-01"),
                   ("#f-correction", "Certificates issued."), ("#f-reactDate", "2026-10-02"), ("#f-root", "No due date for certificates.")):
        pg.fill(sel, v)
    pg.click("#actAdd"); pg.fill('#actRows tr:nth-child(1) [data-k="t"]', "Add the certificate to the shipping list")
    pg.fill('#actRows tr:nth-child(1) [data-k="owner"]', "QM"); pg.fill('#actRows tr:nth-child(1) [data-k="due"]', "2026-10-20")
    pg.click("#saveBtn"); pg.wait_for_timeout(80)
    pg.evaluate("go('assess')"); pg.check('input[name="as-LN2"][value="2"]'); pg.wait_for_timeout(80)
    out["flow"] = pg.evaluate("localStorage.getItem('cia-capa:v1')")
    out["audit"] = pg.evaluate("JSON.stringify(DB.records.map(auditRecord))")
    out["errs"] = errs
    ctx.close()
    return out


with sync_playwright() as p:
    b = p.chromium.launch()
    old, new = run(b, ORIG), run(b, BASE)
    b.close()
check("CAPA stored state after the example is identical", old["example"] == new["example"] and len(new["example"]) > 1000)
check("CAPA report HTML is identical", old["report"] == new["report"])
check("CAPA CSV is identical", old["csv"] == new["csv"])
check("CAPA stored state after a scripted record and an answer is identical", old["flow"] == new["flow"])
check("CAPA automatic audit results are identical", old["audit"] == new["audit"])
check("no errors in either version", not old["errs"] and not new["errs"], [old["errs"][:2], new["errs"][:2]])
diffs = {}
for k in old["tabs"]:
    if old["tabs"][k] != new["tabs"][k]:
        d = [x for x in difflib.unified_diff(old["tabs"][k].splitlines(), new["tabs"][k].splitlines(), lineterm="", n=0) if x[:1] in "+-" and x[:3] not in ("+++", "---")]
        diffs[k] = d
# "en:tools" is read after the Arabic pass, while the form still holds CA-EX-02 (a Fishbone record): the same difference
EXPECT = {"ar:tools/CA-EX-02": ["افتح أداة عظمة السمكة", "تحليلات عظمة السمكة لهذا السجل"], "en:tools/CA-EX-02": ["Open the Fishbone tool", "Fishbone analyses for this record"],
          "en:tools": ["Open the Fishbone tool", "Fishbone analyses for this record"]}
check("tab text differs only where this step changed it", set(diffs) <= set(EXPECT), sorted(set(diffs) - set(EXPECT)))
for k, d in diffs.items():
    added = " ".join(x for x in d if x.startswith("+"))
    check(f"{k}: the difference is the Fishbone link, nothing removed ({len(d)} line(s))", all(w in added for w in EXPECT.get(k, ["?"])) and not any(x.startswith("-") for x in d), d[:6])
check("the Fishbone record's form differs in both languages (the link is visible)", {"ar:tools/CA-EX-02", "en:tools/CA-EX-02"} <= set(diffs), sorted(diffs))
json.dump(diffs, open(OUT, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
failed = [r for r in results if not r[1]]
print(f"\n{len(results) - len(failed)}/{len(results)} passed")
sys.exit(1 if failed else 0)
