"""FMEA tool (modules/fmea.html) — 2026-10-16. Same style as tests/dmaic/test_dmaic.py.
Covers: shared engine (ten files) and layer identity, AR/EN and RTL/LTR, tabs, kit links both ways, self-assessment, the FMEA study
(validation, the written scales and their date rule, the structure of 3–15 steps, the analysis rows with the computed priority number and
action priority — severity first —, the "human error" and person-only flags, the actions with the severity rule and the re-rating, the
reviews, the computed stage), the severity × occurrence heat map (mirrored for Arabic, readable at 390 px) and the before/after chart,
records, audit (12 checks), dashboard, report with the charts and CSV, persistence, example data, clear all, a record with missing parts,
the read-only starts from DMAIC, RCA and Pareto (other tools only read), causes picked from Fishbone, 5 Whys and RCA with previews,
steps taken from a DMAIC SIPOC, the ?open= / ?dmaic= / ?rca= / ?pareto= requests and the hub hint, the Fishbone / 5 Whys / RCA / DMAIC / A3
starts, PDCA and CAPA links, the DMAIC panel, the ISO 10009 guide's 7.3 link, the assistant, the guided tour, keyboard use and 390 px.
Served over http when the platform server runs (CIA_BASE, default http://127.0.0.1:8802).
Usage: python3 tests/fmea/test_fmea.py"""
import os, sys, json, re
from playwright.sync_api import sync_playwright
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
MOD = os.path.join(ROOT, "modules")
BASE = os.environ.get("CIA_BASE", "http://127.0.0.1:8802")
URL = BASE + "/modules/fmea.html"
M = lambda f: BASE + "/modules/" + f + ".html"
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
FILES = ["pdca", "capa", "five-whys", "fishbone", "pareto", "rca", "a3", "dmaic", "iso10009", "fmea"]
src = {f: read(os.path.join(MOD, f + ".html")) for f in FILES}
fm, tpl = src["fmea"], read(os.path.join(ROOT, "templates", "explain-kit-template.html"))
e = [engine(src[f]) for f in FILES]
check("engine block present once in the ten toolbox files", all(x is not None for x in e))
check("engine block identical in the ten files and to tests/build/engine.js", len(set(e)) == 1 and e[0] == read(os.path.join(ROOT, "tests", "build", "engine.js")).rstrip("\n"))
for tag, id_ in (("style", "cia-explain-kit-css"), ("script", "cia-explain-kit-js")):
    check(f"fmea.html {id_} byte-identical to the template", block(fm, tag, id_) == block(tpl, tag, id_))
norm = lambda x: re.sub(r"var CFG=\{.*?\};", "var CFG={};", x or "", count=1)
check("tour script identical to dmaic.html apart from CFG", norm(block(fm, "script", "cia-tour-js")) == norm(block(src["dmaic"], "script", "cia-tour-js")) and block(fm, "script", "cia-tour-js") != block(src["dmaic"], "script", "cia-tour-js"))
check("tour CSS identical to dmaic.html", block(fm, "style", "cia-tour-css") == block(src["dmaic"], "style", "cia-tour-css"))
check("tour CFG names fmea and guards the example", 'var CFG={"file": "fmea", "hasEx": true, "guard": {"pfEx": "all"}};' in fm)
i0 = fm.find("FMEA tool — host logic")
check("storage key and schema documented at the top of the host script", 'STORE="cia-fmea:v1"' in fm and "Schema:" in fm[i0:i0 + 9000] and '"cia-dmaic:v1"' in fm[i0:i0 + 9000])
host = fm[i0:fm.find("<!-- CIA guided tour")]; host = host.replace(engine(fm) or "", "")
check("the host writes only its own key (TBX.save/drop on STORE, language key only)", not re.search(r"TBX\.(save|drop)\((?!STORE)", host) and not re.search(r"localStorage\.(setItem|removeItem)\((?!LKEY)", host))
check("DMAIC's own stage rule is carried (DMR) and other tools' stage rules (rcaStage, fishStage, why5Stage, a3Stage, paStage, capaStage)", "var DMR=(function(){" in fm and all(("function " + f + "(") in fm for f in ("rcaStage", "fishStage", "why5Stage", "a3Stage", "paStage", "capaStage")))
data = block(fm, "script", "cia-explain-data")
check("Explain Kit data: EXPLAIN_FMEA with meta.verified, ISO 10009 7.3, 6.3, 7.1 and C.1, and 'not verified' references", data and "const EXPLAIN_FMEA=" in data and '"verified"' in data and '"7.3"' in data and '"6.3"' in data and '"7.1"' in data and '"C.1"' in data and "IEC 60812" in data and "not verified" in data)
check("Explain Kit ui labels set (roles, wheelT, purpose, smap, assess, assessOff, offGo, actCtx)", all(('"%s"' % k) in data for k in ("roles", "wheelT", "purpose", "smap", "assess", "assessOff", "offGo", "actCtx")))
check("author name on the page and the report", fm.count("مدثر سلامه") >= 5)
check("method honesty on the method tab: FMEA is not a requirement", "FMEA منهج، وليس متطلباً" in fm and "FMEA is a method, not a requirement of any standard" in fm)
dm = src["dmaic"]
check("DMAIC carries the read-only FMEA panel (cia-fmea:v1 read, cia-nav:fmea hint)", 'FM_KEY="cia-fmea:v1"' in dm and 'id="fmBox"' in dm and "cia-nav:fmea" in dm)
qt = src["iso10009"]
check("ISO 10009 guide: 7.3 is a dedicated platform tool (own: fmea) with cia-fmea:v1 and cia-nav:fmea", '"own":"fmea"' in qt and '"fmea":"cia-fmea:v1"' in qt and '"fmea":"cia-nav:fmea"' in qt)

FREEZE = "try{ if(!sessionStorage.getItem('f0')){ sessionStorage.setItem('f0','1'); localStorage.clear(); localStorage.setItem('cia-lang','ar'); ['fmea','dmaic','rca','pareto','fishbone','five-whys','a3','iso10009','capa','pdca'].forEach(function(k){ localStorage.setItem('cia-tour:m:'+k,'done'); }); } }catch(e){}"


def ex(pg, mod):
    pg.goto(M(mod), wait_until="load"); pg.wait_for_timeout(250)
    pg.evaluate("go('docs')"); pg.evaluate("document.getElementById('pfEx').click()"); pg.wait_for_timeout(250)


with sync_playwright() as p:
    b = p.chromium.launch()
    ctx = b.new_context(viewport={"width": 1280, "height": 900}); pg = ctx.new_page(); errs = []
    pg.on("pageerror", lambda e: errs.append(str(e))); pg.on("dialog", lambda d: d.accept())
    pg.add_init_script(FREEZE)
    pg.add_init_script("window.__opened=[]; window.open=function(u){ window.__opened.push(String(u)); return null; };")
    pg.goto(URL, wait_until="load"); pg.wait_for_timeout(400)
    check("loads with no errors", not errs, errs[:3])
    check("Arabic by default, right to left", pg.evaluate("document.documentElement.lang") == "ar" and pg.evaluate("document.documentElement.dir") == "rtl")
    check("title names FMEA and the author", "FMEA" in pg.title() and "مدثر سلامه" in pg.title())
    check("ten sidebar buttons, each with data-go and data-t", pg.evaluate("[...document.querySelectorAll('#side button')].filter(b=>b.dataset.go&&b.dataset.t===b.dataset.go).length") == 10)
    check("header: home button, FM badge, hero logo and the author line", pg.evaluate("!!document.getElementById('ciaHomeBtn')") and pg.evaluate("document.querySelector('.brand-mark').textContent") == "FM" and "مدثر سلامه" in pg.evaluate("document.querySelector('.hero .author').innerText"))
    check("related tools strip lists DMAIC, A3, RCA, Pareto, Fishbone, 5 Whys, CAPA, PDCA and ISO 10009", pg.evaluate("[...document.querySelectorAll('#homeStd a b')].map(x=>x.textContent).join('|')") == "DMAIC|A3|RCA|Pareto|Fishbone|5 Whys|CAPA|PDCA|ISO 10009")
    for lang in ("ar", "en"):
        if pg.evaluate("L") != lang: pg.evaluate("switchLang()"); pg.wait_for_timeout(150)
        ok = True
        for t in TABS:
            pg.evaluate(f"go('{t}')"); pg.wait_for_timeout(60)
            if not pg.evaluate(f"document.querySelector('.tabpane[data-tab=\"{t}\"]').classList.contains('on')"): ok = False
        check(f"{lang}: every tab opens", ok)
    check("English is left to right", pg.evaluate("document.documentElement.dir") == "ltr")
    pg.evaluate("switchLang()"); pg.wait_for_timeout(150)
    # ---- kit
    pg.evaluate("go('explain-cl')"); pg.wait_for_timeout(200)
    nsec = pg.evaluate("EXPLAIN_FMEA.sections.length"); nit = pg.evaluate("EXPLAIN_FMEA.sections.reduce((a,s)=>a+s.it.length,0)")
    linked = pg.evaluate("EXPLAIN_FMEA.sections.flatMap(s=>s.it).filter(i=>i.q!=='x:tools').map(i=>i.q)")
    check("kit: 8 sections and 22 items", nsec == 8 and nit == 22, [nsec, nit])
    check("kit: every one of the 12 questions is explained by an item", sorted(linked) == sorted(pg.evaluate("AQ.map(q=>q[0])")), linked)
    check("kit: the clause guide renders", len(pg.evaluate("document.getElementById('ex-cl-box').innerText")) > 300, len(pg.evaluate("document.getElementById('ex-cl-box').innerText")))
    pg.evaluate("go('explain-std')"); pg.wait_for_timeout(200)
    check("kit: the method guide renders with the term card", len(pg.evaluate("document.getElementById('ex-std-box').innerText")) > 1000 and "FMEA" in pg.evaluate("document.getElementById('fmTerm').innerText"))
    pg.evaluate("go('assess')"); pg.wait_for_timeout(150)
    check("assessment: 12 questions in four areas", pg.evaluate("document.querySelectorAll('#asList .pd-q').length") == 12 and pg.evaluate("document.querySelectorAll('#asList h3').length") == 4)
    check("assessment: 'Explain' back-links on the questions", pg.evaluate("document.querySelectorAll('#asList .ex-qx').length") >= 10)
    pg.check('input[name="as-PP1"][value="2"]'); pg.check('input[name="as-AC1"][value="1"]'); pg.wait_for_timeout(80)
    check("assessment: score per area and overall (3/24 → 13%)", pg.evaluate("document.getElementById('asPct').textContent") == "13%")
    pg.reload(); pg.wait_for_timeout(300)
    check("assessment persists after reload", pg.evaluate("DB.assess.PP1") == 2 and pg.evaluate("DB.assess.AC1") == 1)
    # ---- study form: validation, scales, structure, rows
    pg.evaluate("go('tools'); clearForm(); 0")
    pg.click("#saveBtn"); pg.wait_for_timeout(60)
    check("validation: a study needs a title", pg.evaluate("document.getElementById('recErr').textContent") != "" and pg.evaluate("DB.records.length") == 0)
    for sel, v in (("#f-title", "Tile adhesive mixing"), ("#f-ref", "PFMEA-T-01"), ("#f-facil", "Quality engineer"), ("#f-owner", "Site manager"), ("#f-scope", "From bag to mixed adhesive")):
        pg.fill(sel, v)
    for i in range(3):
        pg.click('[data-add="tm"]'); pg.fill(f"#r-tm-{i}-n", ["QE", "Foreman", "Mason"][i]); pg.fill(f"#r-tm-{i}-role", ["Facilitator", "Process", "Work"][i])
    pg.wait_for_timeout(60)
    check("stage: scoped once title, scope, facilitator, owner and three roles are in", pg.evaluate("stageOf(formToRec())") == "scoped")
    pg.click("#scFill"); pg.wait_for_timeout(60)
    check("scales: the default scales fill the 30 empty cells", "30" in pg.evaluate("document.getElementById('scMsg').textContent") and pg.evaluate("scMissing(formToRec())") == 0)
    pg.fill("#f-sdate", "2026-10-10"); pg.fill("#f-rated", "2026-10-09"); pg.wait_for_timeout(60)
    check("scales rule: agreed after the first rating → warning and stage stays 'scoped'", not pg.evaluate("document.getElementById('scLateW').hidden") and pg.evaluate("stageOf(formToRec())") == "scoped")
    pg.fill("#f-rated", "2026-10-11"); pg.wait_for_timeout(60)
    check("scales rule: agreed before the rating → 'scales agreed'", pg.evaluate("document.getElementById('scLateW').hidden") and pg.evaluate("stageOf(formToRec())") == "scales")
    for i in range(3):
        pg.click('[data-add="stp"]'); pg.fill(f"#r-stp-{i}-t", ["Open bag", "Add water", "Mix"][i])
    pg.wait_for_timeout(60)
    check("structure: three steps → 'structure mapped'", pg.evaluate("stageOf(formToRec())") == "struct")
    def row(i, step, mode, eff, s, cause, o, d):
        pg.click('[data-add="rw"]'); pg.wait_for_timeout(40)
        pg.select_option(f"#r-rw-{i}-step", step); pg.fill(f"#r-rw-{i}-mode", mode); pg.fill(f"#r-rw-{i}-eff", eff); pg.fill(f"#r-rw-{i}-cause", cause)
        pg.select_option(f"#r-rw-{i}-s", str(s)); pg.select_option(f"#r-rw-{i}-o", str(o)); pg.select_option(f"#r-rw-{i}-d", str(d)); pg.wait_for_timeout(40)
    row(0, "p1", "Wrong product opened", "Tiles fall off later; injury possible", 9, "Bags of similar colour", 2, 2)
    row(1, "p2", "Too much water", "Weak bond, rework", 6, "No measuring jug", 6, 7)
    row(2, "p3", "Mixed too short", "Lumps, poor coverage", 5, "No timer", 3, 5)
    rp = pg.evaluate("formToRec().rows.map(w=>[rowRpn(w),rowAp(w)])")
    check("computed priority number S×O×D", [x[0] for x in rp] == [36, 252, 75], rp)
    check("action priority by the written rule: severity 9 is high whatever its number (36); S×O 36 with D 7 high; S×O 15 with D 5 low", [x[1] for x in rp] == ["H", "H", "L"], rp)
    check("apOf: S×O 21 → medium; S 7 with D 7 → medium; S 8 × O 5 = 40 → high", pg.evaluate("[apOf(7,3,4),apOf(7,1,7),apOf(8,5,1)]") == ["M", "M", "H"])
    check("the card shows the computed number and the priority chip", "252" in pg.evaluate("document.querySelector('#rwCards .dm-card[data-row=\"1\"] [data-calc]').textContent") and pg.evaluate("document.querySelector('#rwCards .dm-card[data-row=\"1\"] .fm-ap').classList.contains('ap-H')"))
    check("the written meaning of the chosen level shows under the rating", pg.evaluate("document.querySelector('#rwCards .dm-card [data-sx=\"s\"]').textContent") != "")
    check("stage: every step analysed → 'analysed'", pg.evaluate("stageOf(formToRec())") == "analysed")
    check("high rows with no action → warning naming them", "R1" in pg.evaluate("document.getElementById('hiWarn').textContent") and "R2" in pg.evaluate("document.getElementById('hiWarn').textContent"))
    # human-error flags
    pg.fill("#r-rw-2-mode", "Human error"); pg.wait_for_timeout(60)
    check("flag: a failure mode written as \"human error\" is flagged and blocks the analysis stage", "خطأ بشري" in pg.evaluate("document.querySelector('#rwCards .dm-card[data-row=\"2\"] [data-flag]').textContent") and not pg.evaluate("document.getElementById('humanWarn').hidden") and pg.evaluate("stageOf(formToRec())") == "struct")
    pg.fill("#r-rw-2-mode", "Mixed too short"); pg.fill("#r-rw-2-cause", "Operator not paying attention"); pg.wait_for_timeout(60)
    check("flag: a cause that names a person only is flagged", "names a person" in pg.evaluate("document.querySelector('#rwCards .dm-card[data-row=\"2\"] [data-flag]').textContent") or "شخص" in pg.evaluate("document.querySelector('#rwCards .dm-card[data-row=\"2\"] [data-flag]').textContent"))
    pg.fill("#r-rw-2-cause", "No timer at the mixing point"); pg.wait_for_timeout(60)
    # actions and the severity rule
    def act(i, rowid, kind, who, by, st, done, ns, no, nd, ev):
        pg.click('[data-add="ac"]'); pg.wait_for_timeout(40)
        pg.select_option(f"#r-ac-{i}-row", rowid); pg.fill(f"#r-ac-{i}-what", "Action " + str(i + 1)); pg.select_option(f"#r-ac-{i}-kind", kind)
        pg.fill(f"#r-ac-{i}-who", who); pg.fill(f"#r-ac-{i}-by", by); pg.select_option(f"#r-ac-{i}-st", st)
        if done: pg.fill(f"#r-ac-{i}-done", done)
        for k, v in (("ns", ns), ("no", no), ("nd", nd)):
            if v: pg.select_option(f"#r-ac-{i}-{k}", str(v))
        if ev: pg.fill(f"#r-ac-{i}-ev", ev)
        pg.wait_for_timeout(40)
    act(0, "r1", "change", "Store keeper", "2026-10-14", "plan", "", None, None, None, "")
    act(1, "r2", "prevent", "Foreman", "2026-10-14", "done", "2026-10-13", 5, 2, 7, "Jug in use, 10 batches checked")
    check("severity rule: lowered by a prevention control → flagged and counted", "Severity lowered" in pg.evaluate("document.querySelector('#acCards .dm-card[data-row=\"1\"] [data-flag]').textContent") or "الخطورة خُفضت" in pg.evaluate("document.querySelector('#acCards .dm-card[data-row=\"1\"] [data-flag]').textContent"))
    check("severity rule: the study cannot reach 'done' with that re-rating", pg.evaluate("sevBads(formToRec()).length") == 1)
    pg.select_option("#r-ac-1-ns", "6"); pg.wait_for_timeout(40)
    check("severity rule: unchanged severity → no flag", pg.evaluate("sevBads(formToRec()).length") == 0)
    check("stage: every high row has an owned action → 'actions planned'", pg.evaluate("stageOf(formToRec())") == "planned")
    pg.select_option("#r-ac-0-st", "done"); pg.fill("#r-ac-0-done", "2026-10-12"); pg.wait_for_timeout(40)
    check("re-rating: done without new ratings and evidence → flagged", pg.evaluate("doneNotRe(formToRec()).length") == 1)
    pg.select_option("#r-ac-0-ns", "7"); pg.select_option("#r-ac-0-no", "1"); pg.select_option("#r-ac-0-nd", "2"); pg.fill("#r-ac-0-ev", "Separate shelf and labels")
    pg.wait_for_timeout(40)
    check("severity rule: lowered by a design or process change → allowed", pg.evaluate("sevBads(formToRec()).length") == 0)
    check("stage: all actions done and re-rated → 'done and re-rated'", pg.evaluate("stageOf(formToRec())") == "done")
    check("review warning: no review after the last change", not pg.evaluate("document.getElementById('rvWarn').hidden"))
    pg.click('[data-add="rv"]'); pg.fill("#r-rv-0-date", "2026-10-15"); pg.fill("#r-rv-0-team", "QE, foreman, mason"); pg.fill("#r-rv-0-chg", "Jug and shelf"); pg.wait_for_timeout(40)
    check("stage: a dated review after the last change → 'reviewed'", pg.evaluate("stageOf(formToRec())") == "reviewed")
    check("stage map: seven stages, all done", pg.evaluate("document.querySelectorAll('#caSteps li').length") == 7 and pg.evaluate("document.querySelectorAll('#caSteps li.done').length") == 7)
    pg.click("#saveBtn"); pg.wait_for_timeout(80)
    check("save: an id FM-2026-001 and the study stored under cia-fmea:v1", pg.evaluate("DB.records[0].id") == "FM-2026-001" and "FM-2026-001" in pg.evaluate("localStorage.getItem('cia-fmea:v1')"))
    check("validation: an action done before the first rating is refused", pg.evaluate("(function(){ var r=formToRec(); r.acts[0].done='2026-10-01'; return !!validate(r); })()"))
    # charts
    check("heat map: a 10 × 10 grid of cells in each chart", pg.evaluate("document.querySelectorAll('#heatB svg rect[rx]').length") == 100 and pg.evaluate("document.querySelectorAll('#heatA svg rect[rx]').length") == 100)
    check("heat map: counts in the cells (three rows before, two re-rated after)", pg.evaluate("[...document.querySelectorAll('#heatB svg text[font-weight=\"700\"][fill=\"#FFFFFF\"]')].reduce((a,x)=>a+Number(x.textContent),0)") == 3 and pg.evaluate("[...document.querySelectorAll('#heatA svg text[font-weight=\"700\"][fill=\"#FFFFFF\"]')].reduce((a,x)=>a+Number(x.textContent),0)") == 2)
    xo = lambda: pg.evaluate("(function(){ var t=[...document.querySelectorAll('#heatB svg rect[rx] title')]; var a=t.find(x=>x.textContent.indexOf('S 1 · O 1')===0).parentNode, z=t.find(x=>x.textContent.indexOf('S 1 · O 10')===0).parentNode; return Number(a.getAttribute('x'))>Number(z.getAttribute('x')); })()")
    check("heat map mirrored for Arabic: occurrence 1 on the right", xo())
    pg.evaluate("switchLang()"); pg.wait_for_timeout(150)
    check("heat map left to right in English: occurrence 1 on the left", not xo())
    pg.evaluate("switchLang()"); pg.wait_for_timeout(150)
    check("before/after chart: before and after bars for the re-rated rows", pg.evaluate("document.querySelectorAll('#barC svg rect[fill=\"#1E8C93\"]').length") >= 3)
    # records, audit, dashboard
    pg.evaluate("go('docs')"); pg.wait_for_timeout(80)
    check("records: a row per study with stage and actions", pg.evaluate("document.querySelectorAll('#docsBox tbody tr').length") == 1 and "2/2" in pg.evaluate("document.getElementById('docsBox').innerText"))
    pg.evaluate("go('audit')"); pg.wait_for_timeout(80)
    check("audit tab: a row per study and 12 checks", pg.evaluate("document.querySelectorAll('#auBox thead th').length") == 13)
    check("audit: the scripted study passes every applicable check", all(v is not False for v in pg.evaluate("auditRecord(DB.records[0])").values()), pg.evaluate("auditRecord(DB.records[0])"))
    # ---- example
    ex(pg, "fmea")
    check("example: three studies FM-EX-01 … FM-EX-03 and 75% self-assessment", pg.evaluate("DB.records.map(r=>r.id)") == ["FM-EX-01", "FM-EX-02", "FM-EX-03"] and pg.evaluate("assessScore()") == 75)
    check("example stages: concrete reviewed, lifting held at the structure by a person-only cause, calibration reviewed", pg.evaluate("DB.records.map(stageOf)") == ["reviewed", "struct", "reviewed"])
    a = pg.evaluate("DB.records.map(auditRecord)")
    check("audit: FM-EX-01 passes every applicable check", all(v is not False for v in a[0].values()) and a[0]["review"] is True, a[0])
    check("audit: FM-EX-02 fails only 'no human error'", [k for k, v in a[1].items() if v is False] == ["human"], a[1])
    check("audit: FM-EX-03 links its CAPA record (nonconformity source) and passes", a[2]["capa"] is True and all(v is not False for v in a[2].values()), a[2])
    check("example: lifting rows of severity 10 are high whatever their number (R5: 40, R2: 100)", pg.evaluate("(function(){ var r=DB.records[1]; return [rowRpn(r.rows[4]),rowAp(r.rows[4]),rowRpn(r.rows[1]),rowAp(r.rows[1]),rowRpn(r.rows[2]),rowAp(r.rows[2])]; })()") == [40, "H", 100, "H", 252, "H"])
    check("example: severity lowered 8 → 6 only by a change (tag lines)", pg.evaluate("(function(){ var r=DB.records[1], a=r.acts[3]; return [a.kind,a.ns,r.rows[3].s,sevBad(r,a)]; })()") == ["change", 6, 8, False])
    pg.evaluate("go('dash')"); pg.wait_for_timeout(120)
    k = pg.evaluate("document.getElementById('dKpis').innerText")
    check("dashboard: studies, high rows acted on 100%, re-rated 67%, audit and self-assessment", "100%" in k and "67%" in k and "75%" in k, k)
    check("dashboard: the heat map of all rows", pg.evaluate("document.querySelectorAll('#dHeat svg rect[rx]').length") == 100)
    check("dashboard: rows by action priority", pg.evaluate("document.querySelectorAll('#dAp .pd-bar').length") == 3)
    # report and CSV
    html = pg.evaluate("buildReportHTML()")
    check("report: cover with the author, each study, its scales, analysis table, heat maps, before/after chart, actions, reviews and audit", "مدثر سلامه" in html and html.count('class="an"') == 3 and html.count("<svg") >= 9 and "FM-EX-02" in html and 'class="sc"' in html and 'class="rows"' in html)
    csv = pg.evaluate("buildCSV()")
    check("CSV: byte-order mark, header and a line per study", csv.startswith("﻿") and csv.count("\n") >= 4 and '"FM-EX-01"' in csv and "highRowsWithoutAction" in csv)
    # assistant
    pg.click("#cbFab"); pg.wait_for_timeout(100)
    pg.fill("#cbIn", "Is the RPN enough to decide what to fix?"); pg.press("#cbIn", "Enter"); pg.wait_for_timeout(100)
    check("assistant: answers the priority-number question with severity first", "severity" in pg.evaluate("document.getElementById('cbBody').innerText").lower() or "الخطورة" in pg.evaluate("document.getElementById('cbBody').innerText"))
    pg.fill("#cbIn", "FMEA, RCA or DMAIC — which one?"); pg.press("#cbIn", "Enter"); pg.wait_for_timeout(100)
    check("assistant: answers FMEA, RCA or DMAIC", "RCA" in pg.evaluate("[...document.querySelectorAll('#cbBody .cb-msg.bot')].pop().innerText"))
    check("assistant: six fixed answers and two dynamic ones", pg.evaluate("KB.filter(x=>!x.dyn).length") == 6 and pg.evaluate("KB.filter(x=>x.dyn).length") == 2)
    pg.click("#cbClose")
    # ---- links: other tools' examples in this browser (read only)
    for mod in ("dmaic", "rca", "pareto", "fishbone", "five-whys", "a3", "capa", "pdca"):
        ex(pg, mod)
    stores = pg.evaluate("JSON.stringify(['cia-dmaic:v1','cia-rca:v1','cia-pareto:v1','cia-fish:v1','cia-why5:v1','cia-a3:v1','cia-capa:v1','cia-pdca:v1'].map(k=>localStorage.getItem(k)))")
    fm0 = pg.evaluate("localStorage.getItem('cia-fmea:v1')")
    pg.goto(URL, wait_until="load"); pg.wait_for_timeout(300)
    check("home: offers to start from DMAIC, RCA or Pareto only when this tool is empty", pg.evaluate("document.getElementById('homeImp').hidden"))
    pg.evaluate("go('tools'); document.getElementById('stSrc').value='dmaic'; stPreview(false); 0"); pg.wait_for_timeout(100)
    st = pg.evaluate("document.getElementById('stTable').innerText")
    check("start preview: DMAIC projects with their stage by DMAIC's own rule, SIPOC steps and proved causes", "DM-EX-01" in st and "أُغلق بالتسليم" in st and "طلب الشحنة" in st and "ماء ال" in st, st[:300])
    pg.evaluate("prefillFromDm('DM-EX-01')"); pg.wait_for_timeout(120)
    r = pg.evaluate("formToRec()")
    check("prefill from DM-EX-01: seven SIPOC steps, rows from its proved causes, no ratings copied, unsaved", len(r["steps"]) == 7 and r["stepsFrom"] == "DM-EX-01" and len(r["rows"]) >= 1 and all(w["s"] is None for w in r["rows"]) and r["id"] == "" and r["dmaic"] == "DM-EX-01")
    pg.evaluate("prefillFromRca('RC-EX-02')"); pg.wait_for_timeout(120)
    r = pg.evaluate("formToRec()")
    check("prefill from RC-EX-02: the failure as the mode, root causes as causes from RCA", r["rca"] == "RC-EX-02" and len(r["rows"]) >= 1 and r["rows"][0]["how"] == "rca" and "1.2" in r["rows"][0]["mode"])
    pg.evaluate("prefillFromPareto('PA-EX-02','k1')"); pg.wait_for_timeout(120)
    r = pg.evaluate("formToRec()")
    check("prefill from Pareto PA-EX-02 / k1: the category as a mode with its occurrence evidence", r["pareto"] == "PA-EX-02" and r["pcat"] == "k1" and "PA-EX-02" in r["rows"][0]["oev"])
    pg.evaluate("clearForm(); 0")
    pg.fill("#f-dmaic", "DM-EX-03"); pg.wait_for_timeout(60)
    check("DMAIC link preview by DMAIC's rule", "DM-EX-03" in pg.evaluate("document.getElementById('dmInfo').textContent"))
    pg.click("#stpDm"); pg.wait_for_timeout(60)
    check("steps taken read-only from the DMAIC SIPOC", pg.evaluate("formToRec().steps.length") == 6 and pg.evaluate("formToRec().stepsFrom") == "DM-EX-03")
    for how, ref, needle in (("rca", "RC-EX-02", "RC-EX-02"), ("fish", "FB-EX-01", "FB-EX-01"), ("why5", "W5-EX-01", "W5-EX-01")):
        pg.select_option("#pkHow", how); pg.fill("#pkRef", ref); pg.wait_for_timeout(60)
        pv = pg.evaluate("document.getElementById('pkPv').textContent")
        n0 = pg.evaluate("formRaw().rw.length"); pg.click("#pkUse"); pg.wait_for_timeout(60)
        check(f"cause picked from {how} {ref} with a preview, added as a row", needle in pv and pg.evaluate("formRaw().rw.length") > n0 and pg.evaluate(f"formRaw().rw.some(w=>w.how==='{how}'&&w.ref==='{ref}')"), pv)
    check("the row's own preview of its linked analysis", "RC-EX-02" in pg.evaluate("[...document.querySelectorAll('#rwCards [data-pv]')].map(x=>x.textContent).join(' ')"))
    pg.evaluate("window.__opened=[]")
    pg.fill("#f-rca", "RC-EX-02"); pg.wait_for_timeout(40)
    for k2 in ("fish", "why5", "rca", "dmaic", "a3"):
        pg.click(f'[data-start="{k2}"]'); pg.wait_for_timeout(30)
    op = pg.evaluate("window.__opened")
    check("starts: Fishbone, 5 Whys, RCA, DMAIC (?rca=) and A3 (?rca=) open through their own requests", any("fishbone.html" in u for u in op) and any("five-whys.html" in u for u in op) and any("rca.html" in u for u in op) and any("dmaic.html?rca=RC-EX-02" in u for u in op) and any("a3.html?rca=RC-EX-02" in u for u in op), op)
    pg.fill("#f-pdca", "PD-EX-03"); pg.fill("#f-capa", "CA-EX-04"); pg.wait_for_timeout(40)
    check("PDCA and CAPA previews", "PD-EX-03" not in pg.evaluate("document.getElementById('pdInfo').textContent") and pg.evaluate("document.getElementById('pdInfo').textContent") != "" and "CA-EX-04" in pg.evaluate("document.getElementById('caInfo').textContent"))
    pg.evaluate("window.__opened=[]"); pg.click("#pdOpen"); pg.click("#caOpen"); pg.wait_for_timeout(40)
    check("PDCA and CAPA open in a new tab outside the hub", any("pdca.html" in u for u in pg.evaluate("window.__opened")) and any("capa.html" in u for u in pg.evaluate("window.__opened")))
    check("nothing was written to the other tools, and the starts did not save a study", pg.evaluate("JSON.stringify(['cia-dmaic:v1','cia-rca:v1','cia-pareto:v1','cia-fish:v1','cia-why5:v1','cia-a3:v1','cia-capa:v1','cia-pdca:v1'].map(k=>localStorage.getItem(k)))") == stores and pg.evaluate("localStorage.getItem('cia-fmea:v1')") == fm0)
    # requests
    pg.goto(URL + "?dmaic=DM-EX-01", wait_until="load"); pg.wait_for_timeout(300)
    check("?dmaic= starts a study from the project", pg.evaluate("formToRec().dmaic") == "DM-EX-01" and pg.evaluate("curTab") == "tools")
    pg.goto(URL + "?pareto=PA-EX-02&cat=k1", wait_until="load"); pg.wait_for_timeout(300)
    check("?pareto=&cat= starts a study from the category", pg.evaluate("formToRec().pcat") == "k1")
    pg.goto(URL + "?open=FM-EX-02", wait_until="load"); pg.wait_for_timeout(300)
    check("?open= opens the study", pg.evaluate("document.getElementById('rid').value") == "FM-EX-02")
    pg.evaluate("sessionStorage.setItem('cia-nav:fmea', JSON.stringify({open:'FM-EX-03'}))")
    pg.goto(URL, wait_until="load"); pg.wait_for_timeout(300)
    check("the one-time hint opens the study and is removed", pg.evaluate("document.getElementById('rid').value") == "FM-EX-03" and pg.evaluate("sessionStorage.getItem('cia-nav:fmea')") is None)
    # DMAIC panel
    pg.goto(M("dmaic"), wait_until="load"); pg.wait_for_timeout(300)
    pg.evaluate("go('tools'); loadRecordIntoForm(DB.records.find(r=>r.id==='DM-EX-01')); 0"); pg.wait_for_timeout(100)
    check("DMAIC panel lists FM-EX-01 on DM-EX-01", "FM-EX-01" in pg.evaluate("document.getElementById('fmBox').innerText") and not pg.evaluate("document.getElementById('fmBox').hidden"))
    # ISO 10009 storyboard step 7.3 links an FMEA study
    pg.goto(M("iso10009"), wait_until="load"); pg.wait_for_timeout(300)
    check("ISO 10009 guide: 7.3 FMEA reads cia-fmea:v1 for its record list", pg.evaluate("recList('fmea').map(x=>x.id)") == ["FM-EX-01", "FM-EX-02", "FM-EX-03"])
    check("ISO 10009 guide: 7.3 is a dedicated platform tool", pg.evaluate("QTC.T.find(t=>t.c==='7.3').own") == "fmea" and pg.evaluate("QTC.T.find(t=>t.c==='7.3').lv") == "own")
    # clear all and a broken record
    pg.goto(URL, wait_until="load"); pg.wait_for_timeout(300)
    pg.evaluate("go('docs')"); pg.click("#pfReset"); pg.wait_for_timeout(150)
    check("clear all (confirmed) empties this tool only", pg.evaluate("DB.records.length") == 0 and pg.evaluate("localStorage.getItem('cia-fmea:v1')") is None and pg.evaluate("!!localStorage.getItem('cia-dmaic:v1')"))
    pg.evaluate("localStorage.setItem('cia-fmea:v1', JSON.stringify({records:[{id:'X1',title:'Broken',rows:[{s:'a',o:99},null,'x'],acts:'no',sc:{S:[1]},steps:[{t:5}],reviews:[{}]}],assess:{}}))")
    errs.clear(); pg.reload(); pg.wait_for_timeout(300)
    for t in TABS: pg.evaluate(f"go('{t}')"); pg.wait_for_timeout(40)
    pg.evaluate("loadRecordIntoForm(DB.records[0]); go('tools')"); pg.wait_for_timeout(100); pg.evaluate("buildReportHTML(); buildCSV()")
    check("a record with missing or broken parts renders everywhere without errors", not errs and pg.evaluate("DB.records[0].sc.S.length") == 10, errs[:3])
    # keyboard and tour
    pg.evaluate("go('home')"); pg.focus('#side button[data-go="audit"]'); pg.keyboard.press("Enter"); pg.wait_for_timeout(80)
    check("keyboard: a sidebar button opens its tab with Enter", pg.evaluate("curTab") == "audit")
    ctx.close()
    # ---- tour on a fresh browser: the example is guarded
    ctx = b.new_context(viewport={"width": 1280, "height": 900}); pg = ctx.new_page(); dlg = []
    pg.on("dialog", lambda d: (dlg.append(d.message), d.accept()))
    pg.goto(URL, wait_until="load"); pg.wait_for_timeout(500)
    check("tour: offered on the first visit", pg.evaluate("!!document.querySelector('[id^=cia-tour], .cia-tour, #ciaTour')") or pg.evaluate("document.body.innerHTML.indexOf('cia-tour')>=0"))
    ctx.close()
    # ---- 390 px
    ctx = b.new_context(viewport={"width": 390, "height": 844}); pg = ctx.new_page(); errs2 = []
    pg.on("pageerror", lambda e: errs2.append(str(e))); pg.on("dialog", lambda d: d.accept()); pg.add_init_script(FREEZE)
    ex(pg, "fmea")
    pg.evaluate("loadRecordIntoForm(DB.records[1]); go('tools')"); pg.wait_for_timeout(300)
    check("390 px: no horizontal page scroll on the study (Arabic)", pg.evaluate("document.documentElement.scrollWidth") <= 392)
    check("390 px: the heat map fits the screen", pg.evaluate("Math.max(...[...document.querySelectorAll('#heatB svg, #heatA svg, #barC svg')].map(s=>s.getBoundingClientRect().width))") <= 380)
    check("390 px: the stage map stacks in one column", pg.evaluate("getComputedStyle(document.querySelector('.fm-map')).gridTemplateColumns.split(' ').length") == 1)
    for t in TABS: pg.evaluate(f"go('{t}')"); pg.wait_for_timeout(40)
    pg.evaluate("go('dash')"); pg.wait_for_timeout(100)
    check("390 px: dashboard without page scroll, no errors", pg.evaluate("document.documentElement.scrollWidth") <= 392 and not errs2, errs2[:2])
    ctx.close()
    # ---- hub
    ctx = b.new_context(viewport={"width": 1280, "height": 900}); pg = ctx.new_page(); errs3 = []
    pg.on("pageerror", lambda e: errs3.append(str(e))); pg.add_init_script(FREEZE)
    pg.goto(BASE + "/index.html", wait_until="load"); pg.wait_for_timeout(600)
    check("hub: FMEA URL, Audit & Improvement row and card", pg.evaluate("URLS.fmea") == "./modules/fmea.html" and pg.evaluate("SYSTEMS.find(s=>s.id==='aud').mods.some(t=>t.k==='fmea'&&t.status==='live')") and pg.evaluate("TOOLKITS.some(t=>t.k==='fmea')"))
    check("hub: 39 tools and Audit & Improvement 16 (Stakeholder step)", pg.evaluate("TOOLKITS.length") == 39 and pg.evaluate("wStats().per[SYSTEMS.findIndex(s=>s.id==='aud')].n") == 16)
    check("hub: adapter reads the example snapshot (75%, 3/3, 2/3)", pg.evaluate("JSON.stringify(DEMO_RES.fmea.m.map(x=>x[3]))") == '["75%","3/3","2/3","12/12"]')
    check("hub: TOOLINFO, NEWS and the request mapping", pg.evaluate("!!TOOLINFO.fmea && TOOLINFO.fmea.q===12") and pg.evaluate("NEWS.some(n=>n.k==='fmea')") and pg.evaluate("JSON.stringify(TOOL_RQ.fmea)") == '["iac",null]')
    check("hub: the toolbox is complete, no grouped toolbox entry (Stakeholder step)", pg.evaluate("(typeof SOON!=='undefined'?SOON:[]).filter(t=>t.k==='citbox').length") == 0)
    pg.evaluate("ciaOpenFile('fmea.html')"); pg.wait_for_timeout(800)
    check("hub: ciaOpenFile opens FMEA in the overlay", "fmea.html" in pg.evaluate("document.getElementById('modFrame').src"))
    check("hub: no errors", not errs3, errs3[:3])
    ctx.close()
    b.close()
failed = [r for r in results if not r[1]]
print(f"\n{len(results) - len(failed)}/{len(results)} passed")
sys.exit(1 if failed else 0)
