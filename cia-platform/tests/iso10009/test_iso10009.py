"""ISO 10009 quality tools guide (modules/iso10009.html) — 2026-10-16. Same style as tests/dmaic/test_dmaic.py.
Covers: shared engine (nine files) and layer identity, the catalogue (53 tools, unique clause numbers, Annex A and Table C.1 data, every
platform link pointing at a tab that exists in the target tool), the kit (an item for every tool, every question linked), AR/EN and
RTL/LTR, every tab at 1280 and 390 px, the navigator (aim, phase, context, team, data, capability, effort, platform-only), the library
(search, clause and level filters), adding tools to the storyboard, the storyboard form (validation, lanes, stage, read-only record links
with previews found / not found, persistence), the example (three storyboards, audit results), the calculators (NPS, OEE, COQ), records,
audit, dashboard (coverage, platform usage read from the toolbox), report and CSV, ?open= and ?tool= requests and the hub hint, opening
platform tools inside the hub on a tab, other tools' storage only read, the assistant, keyboard use.
Served over http when the platform server runs (CIA_BASE, default http://127.0.0.1:8802).   Usage: python3 tests/iso10009/test_iso10009.py"""
import os, sys, json, re
from playwright.sync_api import sync_playwright
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
MOD = os.path.join(ROOT, "modules")
sys.path.insert(0, os.path.join(ROOT, "tests", "build"))
import cat_10009 as C  # noqa: E402
BASE = os.environ.get("CIA_BASE", "http://127.0.0.1:8802")
URL = BASE + "/modules/iso10009.html"
TABS = ["home", "explain-std", "explain-cl", "assess", "tools", "docs", "audit", "dash", "report", "ai"]
results = []


def check(name, cond, detail=""):
    results.append((name, bool(cond), detail))
    print(("PASS " if cond else "FAIL ") + name + (("  -- " + str(detail)[:400]) if detail and not cond else ""), flush=True)


def read(p): return open(p, encoding="utf-8").read()
def engine(s):
    a, b = "/* CIA toolbox engine v1 — start */", "/* CIA toolbox engine v1 — end */"
    return s[s.find(a):s.find(b) + len(b)] if s.count(a) == 1 and s.count(b) == 1 else None
def block(s, tag, id_):
    i = s.find('<%s id="%s">' % (tag, id_)); j = s.find("</%s>" % tag, i)
    return s[i:j + len(tag) + 3] if i >= 0 else None


# ---------------- static ----------------
FILES = ["pdca", "capa", "five-whys", "fishbone", "pareto", "rca", "a3", "dmaic", "iso10009"]
src = {f: read(os.path.join(MOD, f + ".html")) for f in FILES}
qt, tpl = src["iso10009"], read(os.path.join(ROOT, "templates", "explain-kit-template.html"))
e = [engine(src[f]) for f in FILES]
check("engine block present once in the nine toolbox files", all(x is not None for x in e))
check("engine block identical in the nine files and to tests/build/engine.js", len(set(e)) == 1 and e[0] == read(os.path.join(ROOT, "tests", "build", "engine.js")).rstrip("\n"))
for tag, id_ in (("style", "cia-explain-kit-css"), ("script", "cia-explain-kit-js")):
    check(f"iso10009.html {id_} byte-identical to the template", block(qt, tag, id_) == block(tpl, tag, id_))
norm = lambda x: re.sub(r"var CFG=\{.*?\};", "var CFG={};", x or "", count=1)
check("tour script identical to dmaic.html apart from CFG", norm(block(qt, "script", "cia-tour-js")) == norm(block(src["dmaic"], "script", "cia-tour-js")) and block(qt, "script", "cia-tour-js") != block(src["dmaic"], "script", "cia-tour-js"))
check("tour CSS identical to dmaic.html", block(qt, "style", "cia-tour-css") == block(src["dmaic"], "style", "cia-tour-css"))
check("tour CFG names iso10009 and guards the example", 'var CFG={"file": "iso10009", "hasEx": true, "guard": {"pfEx": "all"}};' in qt)
i0 = qt.find("ISO 10009 quality tools guide — host logic")
check("storage key and schema documented at the top of the host script", 'STORE="cia-iso10009:v1"' in qt and "Schema:" in qt[i0:i0 + 6000] and '"cia-dmaic:v1"' in qt[i0:i0 + 6000])
check("author name in the page", "مدثر سلامه" in qt)
check("catalogue: 53 reviewed tools with unique ids and clause numbers", len(C.T) == 53 and len({t["c"] for t in C.T}) == 53 and len({t["id"] for t in C.T}) == 53)
check("catalogue: clauses 5 to 16 each have tools", all(any(t["sec"] == c[0] for t in C.T) for c in C.CLAUSES) and len(C.CLAUSES) == 12)
check("catalogue: Table C.1 values within the allowed sets", all(t["cap"] in (1, 2, 3) and t["team"] in ("team", "ind", "both", "") and t["data"] in ("small", "medium", "large", "any", "") and t["eff"] in ("easy", "medium", "difficult", "") for t in C.T))
check("catalogue: CTQ trees (13.6) carry only the capability level, as in Table C.1", [x for x in C.T if x["c"] == "13.6"][0]["cap"] == 3 and [x for x in C.T if x["c"] == "13.6"][0]["data"] == "")
spot = {t["c"]: t for t in C.T}
check("catalogue: Table C.1 spot checks (SWOT, FMEA, OEE, Five whys, Six Sigma, TQM)",
      (spot["5.1"]["team"], spot["5.1"]["data"], spot["5.1"]["cap"], spot["5.1"]["eff"]) == ("team", "small", 1, "easy") and
      (spot["7.3"]["team"], spot["7.3"]["data"], spot["7.3"]["cap"], spot["7.3"]["eff"]) == ("team", "medium", 3, "difficult") and
      (spot["10.7"]["ps"], spot["10.7"]["team"]) == ("mfg", "ind") and spot["14.4"]["data"] == "any" and
      (spot["16.1"]["data"], spot["16.1"]["cap"]) == ("large", 3) and (spot["16.2"]["eff"], spot["16.2"]["cap"]) == ("difficult", 3))
check("catalogue: Annex A spot checks (SWOT Plan/Act in A.1; SIPOC Do in A.2 and A.3; FMEA Do in A.3 only; Pareto Check by range in A.1 and A.3)",
      spot["5.1"]["pdca"]["s"] == ["P", "A"] and spot["6.1"]["pdca"]["p"] == ["D"] and spot["6.1"]["pdca"]["c"] == ["D"] and
      spot["7.3"]["pdca"] == {"s": [], "p": [], "c": ["D"]} and spot["13.7"]["pdca"]["s"] == ["C*"] and spot["13.7"]["pdca"]["p"] == [] and spot["13.7"]["pdca"]["c"] == ["C*"])
# every platform link points at a tab that exists in the target module
missing = []
for t in C.T:
    for p in t["plat"]:
        if p["k"] and p["tab"]:
            h = read(os.path.join(MOD, C.FILES[p["k"]]))
            if ('data-tab="%s"' % p["tab"]) not in h and ('"#%s"' % p["tab"]) not in h and ("#" + p["tab"]) not in h:
                missing.append((t["c"], p["k"], p["tab"]))
for o in C.OTHER:
    for p in o[2]:
        h = read(os.path.join(MOD, C.FILES[p["k"]]))
        if ('data-tab="%s"' % p["tab"]) not in h and ("#" + p["tab"]) not in h:
            missing.append((o[0], p["k"], p["tab"]))
check("every platform link names a tab that exists in its tool", not missing, missing)
dat = block(qt, "script", "cia-explain-data")
codes = re.findall(r'"c": "([^"]+)"', dat)
check("kit: an item for every one of the 53 tools", all(t["c"] in codes for t in C.T))
check("kit: Annex items A.1–A.3, B.1–B.3 and C.1 present", all(x in codes for x in ["A.1", "A.2", "A.3", "B.1", "B.2", "B.3", "C.1"]))
check("kit: verified line names the uploaded ISO 10009 file and the date", "ISO-10009-2024-Quality-Management-Guidance-for-Quality-Tools.pdf" in dat and "2026-10-16" in dat)
check("kit: ISO 10017 marked not verified", "ISO 10017" in dat and "not verified" in dat)

# ---------------- dynamic ----------------
def page(b, lang="ar", w=1280, h=900, init=""):
    ctx = b.new_context(viewport={"width": w, "height": h}); pg = ctx.new_page(); errs = []
    pg.route(re.compile(r"fonts\.(googleapis|gstatic)\.com"), lambda r: r.abort())
    pg.add_init_script("try{if(!sessionStorage.getItem('t-init')){sessionStorage.setItem('t-init','1');localStorage.setItem('cia-lang','%s');localStorage.setItem('cia-tour:m:iso10009','done');}}catch(e){}%s" % (lang, init))
    pg.on("pageerror", lambda x: errs.append("pageerror " + str(x)[:300]))
    pg.on("console", lambda m: errs.append("console " + m.text[:300]) if m.type == "error" and "Failed to load" not in m.text and "ERR_FAILED" not in m.text else None)
    pg.on("dialog", lambda d: d.accept())
    return ctx, pg, errs


BAD = ["undefined", "NaN", "[object Object]"]
with sync_playwright() as p:
    b = p.chromium.launch()
    # ---- every tab in both languages and both widths, empty and with the example
    for lang in ("ar", "en"):
        for w in (1280, 390):
            ctx, pg, errs = page(b, lang, w)
            pg.goto(URL, wait_until="load"); pg.wait_for_timeout(500)
            check(f"{lang} {w}: direction", pg.evaluate("document.documentElement.dir") == ("rtl" if lang == "ar" else "ltr"))
            for ex in (False, True):
                if ex: pg.evaluate("loadExample()"); pg.wait_for_timeout(200)
                for tb in TABS:
                    pg.evaluate("t=>go(t)", tb)
                    subs = ["nav", "lib", "sb", "calc"] if tb == "tools" else [None]
                    for sb in subs:
                        if sb: pg.evaluate("s=>setSub(s)", sb)
                        pg.wait_for_timeout(60)
                        tx = pg.evaluate("()=>document.querySelector('.tabpane.on').innerText")
                        ov = pg.evaluate("()=>document.documentElement.scrollWidth-document.documentElement.clientWidth")
                        tag = f"{lang} {w} {'example' if ex else 'empty'} {tb}{':' + sb if sb else ''}"
                        if any(x in tx for x in BAD) or ov > 1 or len(tx) < 40:
                            check(tag + ": renders cleanly", False, (tx[:120], ov, [x for x in BAD if x in tx]))
            check(f"{lang} {w}: every tab renders with no bad words, no empty pane and no overflow", not any((not ok) and n.startswith(f"{lang} {w} ") for n, ok, _ in results))
            check(f"{lang} {w}: no console or page errors", not errs, errs[:3])
            ctx.close()

    ctx, pg, errs = page(b, "en", 1280)
    pg.goto(URL, wait_until="load"); pg.wait_for_timeout(500)
    # ---- kit
    pg.evaluate("go('explain-cl')"); pg.wait_for_timeout(200)
    pg.evaluate("CIAEX.openCode('13.7')"); pg.wait_for_timeout(250)
    check("kit: item 13.7 opens in the drawer with the Pareto chart", pg.evaluate("document.querySelector('#ex-drawer.on')!==null") and "Pareto" in pg.evaluate("document.getElementById('ex-d-body').innerText"))
    check("kit: the 13.7 item carries its platform flag", "Dedicated platform tool" in pg.evaluate("document.getElementById('ex-d-body').innerText"))
    pg.evaluate("CIAEX.openCode('14.6')"); pg.wait_for_timeout(250)
    pg.evaluate("document.querySelector('#ex-items [data-code=\"14.6\"] [data-ex-assess]').click()"); pg.wait_for_timeout(600)
    check("kit: “Assess this” on 14.6 lands on question DT2", pg.evaluate("location.hash") == "#assess" and pg.evaluate("!!document.querySelector('#as-DT2')"))
    pg.evaluate("CIAEX.openCode('5.3')"); pg.wait_for_timeout(250)
    check("kit: an item outside the assessment shows the note and a button to the navigator", "outside the self-assessment" in pg.evaluate("document.getElementById('ex-d-body').innerText"))
    pg.evaluate("document.querySelector('#ex-items [data-code=\"5.3\"] [data-ex-go]').click()"); pg.wait_for_timeout(300)
    check("kit: the button opens the tool navigator", pg.evaluate("location.hash") == "#tools" and pg.evaluate("SUB") == "nav")
    pg.evaluate("go('assess')"); pg.wait_for_timeout(300)
    check("assessment: “Explain” back-links on the questions", pg.evaluate("document.querySelectorAll('#asList .ex-qx').length") >= 10)
    # ---- navigator
    pg.evaluate("go('tools');setSub('nav')")
    pg.select_option("#nAim", "prob"); pg.select_option("#nCtx", "p"); pg.select_option("#nPh", "D"); pg.wait_for_timeout(150)
    top = pg.evaluate("[...document.querySelectorAll('#navRes .qt-card h3 code')].map(e=>e.textContent)")
    check("navigator: problem solving, process improvement, Do → five whys and fishbone first", set(top[:2]) == {"14.4", "14.5"}, top[:6])
    check("navigator: shows at most 12 cards with reasons", 0 < len(top) <= 12 and pg.evaluate("document.querySelectorAll('#navRes .qt-why li.ok').length") > 0)
    pg.select_option("#nWho", "ind"); pg.wait_for_timeout(120)
    check("navigator: one person → fishbone warns it needs a team", "Needs a team, not one person" in pg.evaluate("document.getElementById('navRes').innerText"))
    pg.select_option("#nWho", ""); pg.select_option("#nCap", "1"); pg.select_option("#nPh", "C"); pg.select_option("#nCtx", "c"); pg.wait_for_timeout(120)
    check("navigator: reading-only capability → trained tools are flagged", "Needs dedicated training (••)" in pg.evaluate("document.getElementById('navRes').innerText"))
    pg.check("#navPlat"); pg.wait_for_timeout(120)
    lv = pg.evaluate("[...document.querySelectorAll('#navRes .qt-card')].map(c=>c.querySelector('.qt-lv').className)")
    check("navigator: platform-only shows only own / in / here tools", lv and all(re.search(r"\b(own|in|here)\b", x) for x in lv), lv)
    check("navigator: choices are saved", json.loads(pg.evaluate("localStorage.getItem('cia-iso10009:v1')"))["nav"]["plat"] is True)
    pg.click("#navReset"); pg.wait_for_timeout(100)
    check("navigator: reset clears the choices", pg.evaluate("DB.nav.aim") == "" and pg.evaluate("DB.nav.plat") is False)
    # ---- library
    pg.evaluate("setSub('lib')"); pg.wait_for_timeout(150)
    check("library: 53 tool cards", pg.evaluate("document.querySelectorAll('#libBox .qt-card').length") == 53)
    check("library: “other relevant tools” listed under the clauses", pg.evaluate("document.querySelectorAll('#libBox .qt-other').length") == 12)
    pg.fill("#libQ", "pareto"); pg.wait_for_timeout(120)
    check("library: search finds the Pareto chart", pg.evaluate("[...document.querySelectorAll('#libBox .qt-card h3 code')].map(e=>e.textContent)") == ["13.7"])
    pg.fill("#libQ", ""); pg.select_option("#libSec", "14"); pg.wait_for_timeout(120)
    check("library: clause 14 shows its six tools", pg.evaluate("document.querySelectorAll('#libBox .qt-card').length") == 6)
    pg.select_option("#libSec", ""); pg.select_option("#libLv", "own"); pg.wait_for_timeout(120)
    check("library: eight dedicated platform tools (7.3 FMEA since the FMEA step, 5.1 SWOT and 5.2 PESTLE since their steps)", pg.evaluate("[...document.querySelectorAll('#libBox .qt-card h3 code')].map(e=>e.textContent)") == ["5.1", "5.2", "7.3", "13.7", "14.1", "14.4", "14.5", "16.1"])
    pg.select_option("#libLv", ""); pg.wait_for_timeout(100)
    # ---- add to storyboard, form, validation, save
    pg.evaluate("document.querySelector('#lib-fish [data-addt]').click()"); pg.wait_for_timeout(200)
    check("adding a tool opens the storyboard with the step in its phase", pg.evaluate("SUB") == "sb" and pg.evaluate("editing.steps.length") == 1 and pg.evaluate("editing.steps[0].tool") == "fish")
    check("the fishbone step offers the Fishbone records read-only", pg.evaluate("!!document.getElementById('st-0-rid')"))
    pg.click("#saveBtn"); pg.wait_for_timeout(100)
    check("validation: a storyboard needs a title", pg.evaluate("document.getElementById('recErr').textContent") == "Write the title of the improvement.")
    pg.fill("#f-title", "Test storyboard"); pg.select_option("#f-ctx", "p"); pg.select_option("#f-aim", "prob")
    pg.evaluate("document.querySelector('[data-addph=\"P\"]').click()"); pg.wait_for_timeout(100)
    pg.click("#saveBtn"); pg.wait_for_timeout(100)
    check("validation: a step with no tool stops the save", "A step with no tool in Plan" in pg.evaluate("document.getElementById('recErr').textContent"))
    pg.select_option("#st-1-tool", "isnot"); pg.wait_for_timeout(100); pg.fill("#f-start", "2026-10-01"); pg.fill("#f-review", "2026-09-01")
    pg.click("#saveBtn"); pg.wait_for_timeout(100)
    check("validation: review before start stops the save", pg.evaluate("document.getElementById('recErr').textContent") == "The review date is before the start date.")
    pg.fill("#f-review", ""); pg.click("#saveBtn"); pg.wait_for_timeout(150)
    st = json.loads(pg.evaluate("localStorage.getItem('cia-iso10009:v1')"))
    check("save: the storyboard is stored with an id and its two steps", len(st["records"]) == 1 and st["records"][0]["id"] == "QT-001" and len(st["records"][0]["steps"]) == 2)
    check("stage: Plan while the Plan step is not done", pg.evaluate("stageOf(DB.records[0])") == "P")
    check("storyboard page shows the four quadrants", pg.evaluate("document.querySelectorAll('#sbPage .qt-q').length") == 4)
    check("open items are shown under the page", pg.evaluate("document.querySelectorAll('#sbFlags .ca-chip').length") > 0)
    pg.reload(wait_until="load"); pg.wait_for_timeout(400)
    check("persistence: the storyboard survives a reload", pg.evaluate("DB.records.length") == 1 and pg.evaluate("DB.records[0].title") == "Test storyboard")
    # ---- example data and audit
    pg.evaluate("go('docs')"); pg.click("#pfEx"); pg.wait_for_timeout(400)
    check("example: three storyboards", pg.evaluate("DB.records.map(r=>r.id)") == ["QT-EX-01", "QT-EX-02", "QT-EX-03"])
    check("example: stages reviewed, Check, Plan", pg.evaluate("DB.records.map(stageOf)") == ["reviewed", "C", "P"])
    a = pg.evaluate("DB.records.map(auditRecord)")
    check("audit: QT-EX-01 passes every check", all(v is True for v in a[0].values()), a[0])
    check("audit: QT-EX-02 lacks a reason on one step and, since 7.3 FMEA is a dedicated tool, a link from its done FMEA step; the rest pass or do not apply yet", a[1]["why"] is False and a[1]["link"] is False and all(v is not False for k, v in a[1].items() if k not in ("why", "link")), a[1])
    check("audit: QT-EX-03 needs more data for benchmarking", a[2]["data"] is False and a[2]["comp"] is None, a[2])
    check("example: self-assessment 72%", pg.evaluate("assessScore()") == 72)
    pg.evaluate("go('audit')"); pg.wait_for_timeout(100)
    check("audit tab: a row per storyboard and 12 checks", pg.evaluate("document.querySelectorAll('#auBox tbody tr').length") == 3 and pg.evaluate("document.querySelectorAll('#auBox thead th').length") == 13)
    # ---- record links: not found here, found once the other tools' examples are loaded
    pg.evaluate("loadRecordIntoForm(DB.records[0]);go('tools');setSub('sb')"); pg.wait_for_timeout(200)
    check("record links: a missing record is shown as not in this browser", "is not in this browser" in pg.evaluate("document.getElementById('lanes').innerText"))
    before = pg.evaluate("Object.keys(localStorage).filter(k=>/^cia-/.test(k)&&!/^cia-(lang|tour)/.test(k)).sort()")
    for f in ("pareto", "dmaic", "fishbone", "five-whys", "rca"):
        p2 = ctx.new_page(); p2.on("dialog", lambda d: d.accept()); p2.goto(BASE + "/modules/" + f + ".html", wait_until="load"); p2.wait_for_timeout(300)
        p2.evaluate("loadExample()"); p2.wait_for_timeout(200); p2.close()
    pg.reload(wait_until="load"); pg.wait_for_timeout(400)
    pg.evaluate("loadRecordIntoForm(DB.records[0]);go('tools');setSub('sb')"); pg.wait_for_timeout(250)
    lt = pg.evaluate("document.getElementById('lanes').innerText")
    check("record links: previews read from Pareto, Fishbone, 5 Whys, RCA and DMAIC", "PA-EX-02 · Rejected ready-mix loads" in lt and "FB-EX-02" in lt and "W5-EX-03" in lt and "RC-EX-01" in lt and "DM-EX-01 ·" in lt and "is not in this browser" not in lt, lt[:300])
    pg.evaluate("go('dash')"); pg.wait_for_timeout(200)
    check("dashboard: platform usage counts the toolbox records read from this browser", "13.7 Pareto" in pg.evaluate("document.getElementById('dUse').innerText"))
    check("dashboard: coverage shows 23 of 53 tools on the platform", "23/53" in pg.evaluate("document.getElementById('dKpis').innerText"))
    cov = pg.evaluate("['own','in','here','rel','none'].map(l=>QTC.T.filter(t=>(t.lv||'none')===l).length)")
    check("coverage: 8 dedicated / 12 inside / 3 here / 11 related / 19 not yet (PESTLE step)", cov == [8, 12, 3, 11, 19], cov)
    st = json.loads(pg.evaluate("localStorage.getItem('cia-iso10009:v1')"))
    check("this tool wrote only its own key (other tools' stored state untouched by it)", pg.evaluate("Object.keys(localStorage).filter(k=>/^cia-/.test(k)&&!/^cia-(lang|tour|nav)/.test(k)).sort()") == sorted(set(before) | {"cia-pareto:v1", "cia-dmaic:v1", "cia-fish:v1", "cia-why5:v1", "cia-rca:v1"}))
    # ---- calculators
    pg.evaluate("go('tools');setSub('calc')"); pg.wait_for_timeout(150)
    check("calculator: NPS 14 / 4 / 2 gives +60", "+60" in pg.evaluate("document.getElementById('calc-nps-o').innerText"))
    check("calculator: OEE 85 × 90 × 98 gives 75%", "75%" in pg.evaluate("document.getElementById('calc-oee-o').innerText") and "availability" in pg.evaluate("document.getElementById('calc-oee-o').innerText").lower())
    check("calculator: COQ total 1,690,000 with poor quality 74%", "1,690,000" in pg.evaluate("document.getElementById('calc-coq-o').innerText") and "74%" in pg.evaluate("document.getElementById('calc-coq-o').innerText"))
    pg.fill("#cl-oee-a", "140"); pg.wait_for_timeout(80)
    check("calculator: a percentage above 100 is refused", "Percentages run from 0 to 100." in pg.evaluate("document.getElementById('calc-oee-o').innerText"))
    pg.fill("#cl-oee-a", "85"); pg.evaluate("clearForm()"); pg.evaluate("document.querySelector('[data-cto=\"nps\"]').click()"); pg.wait_for_timeout(150)
    check("calculator: the NPS result becomes a Check step of the storyboard", pg.evaluate("editing.steps.length") == 1 and pg.evaluate("editing.steps[0].ph") == "C" and "+60" in pg.evaluate("editing.steps[0].out"))
    # ---- report and CSV
    html = pg.evaluate("buildReportHTML()")
    check("report: cover with the author and the 53-row coverage table", "مدثر سلامه" in html and html.count("<code>") >= 53 and "Platform coverage of the ISO 10009 tools" in html)
    check("report: each storyboard with its page and audit", html.count('class="qt-page"') == 3 and "QT-EX-02" in html)
    csv = pg.evaluate("buildCSV()")
    check("CSV: header and one row per step", csv.startswith("﻿storyboard_id,") or csv.startswith("﻿\"storyboard_id\""), csv[:60])
    check("CSV: 27 step rows for the example", len(csv.strip().splitlines()) == 1 + 11 + 7 + 9)
    # ---- requests
    pg.goto(URL + "?open=QT-EX-02", wait_until="load"); pg.wait_for_timeout(400)
    check("?open= opens the storyboard in the form", pg.evaluate("editing.id") == "QT-EX-02" and pg.evaluate("SUB") == "sb")
    pg.goto(URL + "?tool=13.7", wait_until="load"); pg.wait_for_timeout(400)
    check("?tool= opens the tool's full card in the clause guide (step 10.1)", pg.evaluate("curTab") == "explain-cl" and pg.evaluate("QS.v+' '+QS.tool") == "tool 13.7")
    pg.goto(URL, wait_until="load"); pg.evaluate("sessionStorage.setItem('cia-nav:iso10009',JSON.stringify({tool:'14.5'}))"); pg.reload(wait_until="load"); pg.wait_for_timeout(400)
    check("hub hint opens the requested tool's card once", pg.evaluate("QS.v+' '+QS.tool") == "tool 14.5" and pg.evaluate("sessionStorage.getItem('cia-nav:iso10009')") is None)
    # ---- assistant
    pg.evaluate("cbOpen(true)"); pg.evaluate("cbSend('Is ISO 10009 certifiable?')"); pg.wait_for_timeout(150)
    check("assistant: answers the certification question", "guidance, not a certification standard" in pg.evaluate("document.getElementById('cbBody').innerText"))
    pg.evaluate("cbSend('where do I find these on the platform')"); pg.wait_for_timeout(100)
    check("assistant: answers which tools are on the platform", "8 dedicated tools" in pg.evaluate("document.getElementById('cbBody').innerText"))
    pg.evaluate("cbOpen(false)")
    # ---- keyboard
    pg.evaluate("go('tools')"); pg.focus("#qtSub [data-sub='lib']"); pg.keyboard.press("Enter"); pg.wait_for_timeout(120)
    check("keyboard: sub-sections switch with Enter", pg.evaluate("SUB") == "lib")
    # ---- clear all
    pg.evaluate("go('docs')"); pg.click("#pfReset"); pg.wait_for_timeout(200)
    check("clear all empties this tool only", pg.evaluate("localStorage.getItem('cia-iso10009:v1')") is None and pg.evaluate("localStorage.getItem('cia-pareto:v1')") is not None)
    check("no console or page errors in the flows", not errs, errs[:3])
    ctx.close()

    # ---- inside the hub: overlay, open platform tools on a tab and a record by id
    ctx, pg, errs = page(b, "en", 1280, init="try{localStorage.setItem('cia-tour:v1','done')}catch(e){}")
    pg.goto(BASE + "/index.html", wait_until="load"); pg.wait_for_timeout(500)
    pg.evaluate("openModule('iso10009')"); pg.wait_for_function("()=>document.getElementById('modFrame').dataset.k==='iso10009'", timeout=8000); pg.wait_for_timeout(900)
    fr = pg.frame_locator("#modFrame")
    check("hub: the guide opens in the overlay", pg.evaluate("document.getElementById('modFrame').contentWindow.document.title").startswith("ISO 10009"))
    pg.evaluate("document.getElementById('modFrame').contentWindow.openPlat('str','swot')"); pg.wait_for_function("()=>document.getElementById('modFrame').dataset.k==='str'", timeout=8000); pg.wait_for_timeout(900)
    check("hub: a platform link opens the strategy studio on its SWOT tab", pg.evaluate("document.getElementById('modFrame').contentWindow.location.hash") == "#swot" and pg.evaluate("location.hash") == "#m=str/swot")
    pg.evaluate("openModule('iso10009')"); pg.wait_for_function("()=>document.getElementById('modFrame').dataset.k==='iso10009'", timeout=8000); pg.wait_for_timeout(900)
    pg.evaluate("document.getElementById('modFrame').contentWindow.openRec('pareto','PA-EX-02')"); pg.wait_for_function("()=>document.getElementById('modFrame').dataset.k==='pareto'", timeout=8000); pg.wait_for_timeout(1000)
    check("hub: a record link opens Pareto through its one-time hint", pg.evaluate("document.getElementById('modFrame').contentWindow.sessionStorage.getItem('cia-nav:pareto')") is None)
    check("hub: ciaOpenFile without a tab still opens the tool (older callers)", pg.evaluate("window.ciaOpenFile('capa.html')") is True)
    check("hub: no errors", not [x for x in errs if "frame" not in x.lower()], errs[:3])
    ctx.close()
    b.close()

n = len(results); f = sum(1 for r in results if not r[1])
print(f"== iso10009: {n - f}/{n} passed")
sys.exit(1 if f else 0)
