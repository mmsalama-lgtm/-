"""Lessons Learned tool (modules/lessons.html) — 2026-10-16. Same style as tests/fmea/test_fmea.py.
Covers: shared engine (eleven files) and layer identity, AR/EN and RTL/LTR, tabs, kit links both ways, self-assessment, the lesson record
(validation, the computed stage captured → cause linked → lesson written → actions planned → embedded → verified → shared, the cause rule —
linked or written here, "not analysed" refused for a severe event —, the blame rule on the cause and the lesson, the rule sentence, the
embedding actions with owner, date and evidence, the verification dated after the actions with "applied and worked", sharing), the search of
the register and "read before you start", the chart of lessons by stage and type (mirrored for Arabic, readable at 390 px), records, audit
(11 checks), dashboard, report and CSV, persistence, example data, clear all, a record with missing parts, the read-only starts from RCA, A3,
DMAIC, FMEA, CAPA and PDCA with previews by each tool's own stage rule (other tools only read), taking the cause from the source, the FMEA-row
embedding action with its preview, the ?open= / ?rca= / ?fmea= requests and the hub hint, the FMEA panel, the ISO 10009 link, the assistant,
the guided tour, keyboard use, 390 px and the hub links.
Served over http when the platform server runs (CIA_BASE, default http://127.0.0.1:8802).
Usage: python3 tests/lessons/test_lessons.py"""
import os, sys, json, re
from playwright.sync_api import sync_playwright
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
MOD = os.path.join(ROOT, "modules")
BASE = os.environ.get("CIA_BASE", "http://127.0.0.1:8802")
URL = BASE + "/modules/lessons.html"
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
FILES = ["pdca", "capa", "five-whys", "fishbone", "pareto", "rca", "a3", "dmaic", "iso10009", "fmea", "lessons"]
src = {f: read(os.path.join(MOD, f + ".html")) for f in FILES}
ll, tpl = src["lessons"], read(os.path.join(ROOT, "templates", "explain-kit-template.html"))
e = [engine(src[f]) for f in FILES]
check("engine block present once in the eleven toolbox files", all(x is not None for x in e))
check("engine block identical in the eleven files and to tests/build/engine.js", len(set(e)) == 1 and e[0] == read(os.path.join(ROOT, "tests", "build", "engine.js")).rstrip("\n"))
for tag, id_ in (("style", "cia-explain-kit-css"), ("script", "cia-explain-kit-js")):
    check(f"lessons.html {id_} byte-identical to the template", block(ll, tag, id_) == block(tpl, tag, id_))
norm = lambda x: re.sub(r"var CFG=\{.*?\};", "var CFG={};", x or "", count=1)
check("tour script identical to fmea.html apart from CFG", norm(block(ll, "script", "cia-tour-js")) == norm(block(src["fmea"], "script", "cia-tour-js")) and block(ll, "script", "cia-tour-js") != block(src["fmea"], "script", "cia-tour-js"))
check("tour CSS identical to fmea.html", block(ll, "style", "cia-tour-css") == block(src["fmea"], "style", "cia-tour-css"))
check("tour CFG names lessons and guards the example", 'var CFG={"file": "lessons", "hasEx": true, "guard": {"pfEx": "all"}};' in ll)
i0 = ll.find("Lessons Learned tool — host logic")
check("storage key and schema documented at the top of the host script", 'STORE="cia-lessons:v1"' in ll and "Schema:" in ll[i0:i0 + 9000] and '"cia-fmea:v1"' in ll[i0:i0 + 9000])
host = ll[i0:ll.find("<!-- CIA guided tour")]; host = host.replace(engine(ll) or "", "")
check("the host writes only its own key (TBX.save/drop on STORE, language key only)", not re.search(r"TBX\.(save|drop)\((?!STORE)", host) and not re.search(r"localStorage\.(setItem|removeItem)\((?!LKEY)", host))
check("other tools' rules are carried read-only: DMR, FMR, pdcaStage, rcaStage, a3Stage, capaStage", all(x in ll for x in ("var DMR=(function(){", "var FMR=(function(){", "function pdcaStage(", "function rcaStage(", "function a3Stage(", "function capaStage(")))
data = block(ll, "script", "cia-explain-data")
check("Explain Kit data: EXPLAIN_LESSONS with meta.verified, 7.1.6, 10.2.1, 3.2.4, ISO 10009 clause 15 and 'not verified' references", data and "const EXPLAIN_LESSONS=" in data and '"verified"' in data and '"7.1.6"' in data and '"10.2.1"' in data and '"3.2.4"' in data and '"15"' in data and "ISO 30401" in data and "not verified" in data)
check("Explain Kit ui labels set (roles, wheelT, purpose, smap, assess, assessOff, offGo, actCtx)", all(('"%s"' % k) in data for k in ("roles", "wheelT", "purpose", "smap", "assess", "assessOff", "offGo", "actCtx")))
check("author name on the page and the report", ll.count("مدثر سلامه") >= 5)
check("method honesty on the method tab: lessons learned is a practice, not a requirement", "الدروس المستفادة ممارسة، وليست متطلباً" in ll and "Lessons learned is a practice, not a requirement of any standard" in ll)
fm = src["fmea"]
check("FMEA carries the read-only lessons panel (cia-lessons:v1 read, cia-nav:lessons hint)", 'LL_KEY="cia-lessons:v1"' in fm and 'id="llBox"' in fm and "cia-nav:lessons" in fm)

FREEZE = "try{ if(!sessionStorage.getItem('f0')){ sessionStorage.setItem('f0','1'); localStorage.clear(); localStorage.setItem('cia-lang','ar'); ['lessons','fmea','dmaic','rca','pareto','fishbone','five-whys','a3','iso10009','capa','pdca'].forEach(function(k){ localStorage.setItem('cia-tour:m:'+k,'done'); }); } }catch(e){}"


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
    check("title names the tool and the author", "الدروس المستفادة" in pg.title() and "مدثر سلامه" in pg.title())
    check("ten sidebar buttons, each with data-go and data-t", pg.evaluate("[...document.querySelectorAll('#side button')].filter(b=>b.dataset.go&&b.dataset.t===b.dataset.go).length") == 10)
    check("header: home button, LL badge, hero logo and the author line", pg.evaluate("!!document.getElementById('ciaHomeBtn')") and pg.evaluate("document.querySelector('.brand-mark').textContent") == "LL" and "مدثر سلامه" in pg.evaluate("document.querySelector('.hero .author').innerText"))
    check("related tools strip lists FMEA, DMAIC, A3, RCA, Pareto, Fishbone, 5 Whys, CAPA, PDCA and ISO 10009", pg.evaluate("[...document.querySelectorAll('#homeStd a b')].map(x=>x.textContent).join('|')") == "FMEA|DMAIC|A3|RCA|Pareto|Fishbone|5 Whys|CAPA|PDCA|ISO 10009")
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
    nsec = pg.evaluate("EXPLAIN_LESSONS.sections.length"); nit = pg.evaluate("EXPLAIN_LESSONS.sections.reduce((a,s)=>a+s.it.length,0)")
    linked = pg.evaluate("EXPLAIN_LESSONS.sections.flatMap(s=>s.it).filter(i=>i.q!=='x:tools').map(i=>i.q)")
    check("kit: 7 sections and 25 items", nsec == 7 and nit == 25, [nsec, nit])
    check("kit: every one of the 12 questions is explained by exactly one item", sorted(linked) == sorted(pg.evaluate("AQ.map(q=>q[0])")), linked)
    check("kit: the clause guide renders", len(pg.evaluate("document.getElementById('ex-cl-box').innerText")) > 300)
    pg.evaluate("go('explain-std')"); pg.wait_for_timeout(200)
    check("kit: the method guide renders with the term card (practice, not a requirement)", len(pg.evaluate("document.getElementById('ex-std-box').innerText")) > 1000 and "ممارسة" in pg.evaluate("document.getElementById('llTerm').innerText"))
    pg.evaluate("go('assess')"); pg.wait_for_timeout(150)
    check("assessment: 12 questions in four areas", pg.evaluate("document.querySelectorAll('#asList .pd-q').length") == 12 and pg.evaluate("document.querySelectorAll('#asList h3').length") == 4)
    check("assessment: 'Explain' back-links on the questions", pg.evaluate("document.querySelectorAll('#asList .ex-qx').length") >= 10, pg.evaluate("document.querySelectorAll('#asList .ex-qx').length"))
    pg.check('input[name="as-CP1"][value="2"]'); pg.check('input[name="as-VS1"][value="1"]'); pg.wait_for_timeout(80)
    check("assessment: score per area and overall (3/24 → 13%)", pg.evaluate("document.getElementById('asPct').textContent") == "13%")
    pg.reload(); pg.wait_for_timeout(300)
    check("assessment persists after reload", pg.evaluate("DB.assess.CP1") == 2 and pg.evaluate("DB.assess.VS1") == 1)
    # ---- the lesson form: stages one by one
    pg.evaluate("go('tools'); clearForm(); 0")
    pg.click("#saveBtn"); pg.wait_for_timeout(60)
    check("validation: a lesson needs a title", pg.evaluate("document.getElementById('recErr').textContent") != "" and pg.evaluate("DB.records.length") == 0)
    for sel, v in (("#f-title", "Formwork release agent in hot weather"), ("#f-ref", "NCR-2026-077"), ("#f-date", "2026-08-10"), ("#f-owner", "Site engineer"),
                   ("#f-proc", "Formwork"), ("#f-ptype", "Buildings — structural works"), ("#f-site", "Site C"),
                   ("#f-event", "Concrete stuck to the plywood on three slab bays"), ("#f-ev", "Photos and the pour log of 10 August")):
        pg.fill(sel, v)
    pg.wait_for_timeout(60)
    check("stage: captured once title, type, date, owner, event and evidence are in", pg.evaluate("stageOf(formToRec())") == "captured")
    pg.select_option("#f-sev", "high"); pg.fill("#f-ct", "The release agent dried out in the sun before the pour"); pg.wait_for_timeout(60)
    check("cause rule: written here for a severe event → 'not analysed' warning and the stage stays 'captured'", not pg.evaluate("document.getElementById('naWarn').hidden") and pg.evaluate("stageOf(formToRec())") == "captured")
    pg.select_option("#f-sev", "med"); pg.wait_for_timeout(60)
    check("cause rule: written here for an event that is not severe → allowed with the 'not analysed' note → 'cause linked'", pg.evaluate("document.getElementById('naWarn').hidden") and not pg.evaluate("document.getElementById('naInfo').hidden") and pg.evaluate("stageOf(formToRec())") == "cause")
    pg.fill("#f-when", "we apply release agent to formwork in summer"); pg.fill("#f-dothis", "apply it within 30 minutes of the pour and shade the panels"); pg.fill("#f-because", "the operator was careless")
    pg.fill("#f-applies", "All slab and wall formwork in summer"); pg.wait_for_timeout(60)
    check("blame rule: a lesson that blames a person is flagged and blocks 'lesson written'", not pg.evaluate("document.getElementById('blameWarn').hidden") and pg.evaluate("stageOf(formToRec())") == "cause")
    pg.fill("#f-because", "agent applied earlier than 2 hours dried out on 3 of 3 bays in the August log"); pg.wait_for_timeout(60)
    check("rule: When…, do…, because… with its scope → 'lesson written', and the sentence shows", pg.evaluate("stageOf(formToRec())") == "lesson" and "30 minutes" in pg.evaluate("document.getElementById('ruleSay').textContent"))
    pg.click('[data-add="ac"]'); pg.wait_for_timeout(40)
    pg.fill("#r-ac-0-what", "Add the 30-minute rule to the formwork method statement"); pg.wait_for_timeout(40)
    check("action without owner or date → flagged, stage stays 'lesson written'", "بلا مسؤول" in pg.evaluate("document.querySelector('#acCards [data-flag]').textContent") and pg.evaluate("stageOf(formToRec())") == "lesson")
    pg.fill("#r-ac-0-who", "Formwork engineer"); pg.fill("#r-ac-0-by", "2026-08-25"); pg.wait_for_timeout(40)
    check("an owned and dated action → 'actions planned'", pg.evaluate("stageOf(formToRec())") == "planned")
    pg.select_option("#r-ac-0-st", "done"); pg.fill("#r-ac-0-done", "2026-08-22"); pg.wait_for_timeout(40)
    check("done without evidence of the change → flagged, still 'actions planned'", pg.evaluate("noEv(formToRec()).length") == 1 and pg.evaluate("stageOf(formToRec())") == "planned")
    pg.fill("#r-ac-0-ev", "MS-FW-02 rev 3 issued"); pg.wait_for_timeout(40)
    check("done with evidence → 'embedded'", pg.evaluate("stageOf(formToRec())") == "embedded")
    pg.click('[data-add="vr"]'); pg.fill("#r-vr-0-date", "2026-08-20"); pg.fill("#r-vr-0-next", "Site D slabs"); pg.fill("#r-vr-0-ev", "No sticking on 6 bays"); pg.wait_for_timeout(40)
    check("verification dated before the last action → warning, not verified", not pg.evaluate("document.getElementById('vrWarn').hidden") and pg.evaluate("stageOf(formToRec())") == "embedded")
    pg.fill("#r-vr-0-date", "2026-09-05"); pg.select_option("#r-vr-0-res", "part"); pg.wait_for_timeout(40)
    check("verification 'applied, partly' → warning, not verified", not pg.evaluate("document.getElementById('vrWarn').hidden") and pg.evaluate("stageOf(formToRec())") == "embedded")
    pg.select_option("#r-vr-0-res", "worked"); pg.wait_for_timeout(40)
    check("verification after the actions, 'applied and worked', with evidence → 'verified'", pg.evaluate("stageOf(formToRec())") == "verified")
    pg.click('[data-add="sh"]'); pg.fill("#r-sh-0-date", "2026-09-10"); pg.fill("#r-sh-0-who", "All site engineers"); pg.fill("#r-sh-0-how", "Monthly quality meeting"); pg.wait_for_timeout(40)
    check("sharing → 'shared'; the stage map shows seven stages, all done", pg.evaluate("stageOf(formToRec())") == "shared" and pg.evaluate("document.querySelectorAll('#caSteps li').length") == 7 and pg.evaluate("document.querySelectorAll('#caSteps li.done').length") == 7)
    check("validation: a verification before the date of the event is refused", pg.evaluate("(function(){ var r=formToRec(); r.ver[0].date='2026-08-01'; return !!validate(r); })()"))
    pg.click("#saveBtn"); pg.wait_for_timeout(80)
    check("save: an id LL-2026-001 and the lesson stored under cia-lessons:v1", pg.evaluate("DB.records[0].id") == "LL-2026-001" and "LL-2026-001" in pg.evaluate("localStorage.getItem('cia-lessons:v1')"))
    check("the source 'none' with a cause written here is listed as 'not analysed' (info)", any(x[0] == "naI" for x in pg.evaluate("issues(DB.records[0])")))
    pg.evaluate("go('audit')"); pg.wait_for_timeout(80)
    check("audit tab: a row per lesson and 11 checks", pg.evaluate("document.querySelectorAll('#auBox thead th').length") == 12)
    check("audit: the scripted lesson passes every applicable check", all(v is not False for v in pg.evaluate("auditRecord(DB.records[0])").values()), pg.evaluate("auditRecord(DB.records[0])"))
    # ---- example
    ex(pg, "lessons")
    check("example: three lessons LL-EX-01 … LL-EX-03 and 71% self-assessment", pg.evaluate("DB.records.map(r=>r.id)") == ["LL-EX-01", "LL-EX-02", "LL-EX-03"] and pg.evaluate("assessScore()") == 71)
    check("example stages: concrete shared, lifting (a success) shared, calibration embedded and waiting for verification", pg.evaluate("DB.records.map(stageOf)") == ["shared", "shared", "embedded"] and pg.evaluate("DB.records[1].type") == "success")
    a = pg.evaluate("DB.records.map(auditRecord)")
    check("audit: LL-EX-01 passes every check, with its CAPA link (a nonconformity source)", all(v is True for v in a[0].values()), a[0])
    check("audit: LL-EX-02 passes every applicable check; no CAPA needed for a success", all(v is not False for v in a[1].values()) and a[1]["capa"] is None, a[1])
    check("audit: LL-EX-03 fails only 'verified after the actions'; sharing does not apply yet", [k for k, v in a[2].items() if v is False] == ["verify"] and a[2]["shared"] is None, a[2])
    check("open items: only LL-EX-03 'check on the next project'", [x for x in pg.evaluate("openItems().map(x=>x.r.id)")] == ["LL-EX-03"])
    pg.evaluate("go('dash')"); pg.wait_for_timeout(120)
    k = pg.evaluate("document.getElementById('dKpis').innerText")
    check("dashboard: embedded 100%, verified 67%, shared 67%, actions 9/9, self-assessment 71%", "100%" in k and "67%" in k and "9/9" in k and "71%" in k, k)
    check("dashboard: stage and type bars and the stage × type chart", pg.evaluate("document.querySelectorAll('#dStage .pd-bar').length") == 8 and pg.evaluate("document.querySelectorAll('#dType .pd-bar').length") == 6 and pg.evaluate("document.querySelectorAll('#dChart svg rect[fill=\"#3C9A5F\"]').length") >= 2)
    xo = lambda: pg.evaluate("(function(){ var r=[...document.querySelectorAll('#dChart svg rect')].filter(x=>(x.querySelector('title')||{}).textContent); var a=r[0]; return Number(a.getAttribute('x'))>200; })()")
    check("chart mirrored for Arabic: bars grow from the right", xo())
    pg.evaluate("switchLang()"); pg.wait_for_timeout(150)
    check("chart left to right in English: bars grow from the left", not xo())
    pg.evaluate("switchLang()"); pg.wait_for_timeout(150)
    # search and read-before-you-start
    pg.evaluate("go('tools')"); pg.wait_for_timeout(80)
    check("search: with no filter only the hint shows", pg.evaluate("document.querySelectorAll('#fRes li').length") == 0 and "3" in pg.evaluate("document.getElementById('fCnt').textContent"))
    pg.fill("#fq", "ماء مبرد"); pg.wait_for_timeout(60)
    check("search by text (Arabic letters folded) finds the concrete lesson", pg.evaluate("[...document.querySelectorAll('#fRes li [data-open]')].map(b=>b.dataset.open)") == ["LL-EX-01"], pg.evaluate("document.getElementById('fRes').innerText")[:200])
    pg.fill("#fq", ""); pg.select_option("#fstage", "embedded"); pg.wait_for_timeout(60)
    check("search by stage finds the calibration lesson", pg.evaluate("[...document.querySelectorAll('#fRes li [data-open]')].map(b=>b.dataset.open)") == ["LL-EX-03"])
    pg.select_option("#fstage", ""); pg.select_option("#ftype", "success"); pg.wait_for_timeout(60)
    check("search by type finds the success", pg.evaluate("[...document.querySelectorAll('#fRes li [data-open]')].map(b=>b.dataset.open)") == ["LL-EX-02"])
    pg.select_option("#ftype", ""); pg.wait_for_timeout(40)
    opts = pg.evaluate("[...document.querySelectorAll('#rbSel option')].map(o=>o.value)")
    pg.select_option("#rbSel", [o for o in opts if o.startswith("ptype|") and "مبان" in o][0]); pg.wait_for_timeout(60)
    rb = pg.evaluate("document.getElementById('rbList').innerText")
    check("read before you start: the project type lists the two building lessons with their rules and verification", pg.evaluate("document.querySelectorAll('#rbList li').length") == 2 and "عندما" in rb and "تُحقق منه" in rb, rb[:300])
    html = pg.evaluate("buildReportHTML()")
    check("report: cover with the author, the chart, read-before-you-start for the chosen type, three lessons with actions, verification, sharing and audit", "مدثر سلامه" in html and html.count('class="an"') == 3 and "<svg" in html and "اقرأ قبل أن تبدأ" in html and "LL-EX-03" in html)
    csv = pg.evaluate("buildCSV()")
    check("CSV: byte-order mark, header and a line per lesson", csv.startswith("﻿") and csv.count("\n") >= 4 and '"LL-EX-01"' in csv and "embeddingActions" in csv)
    # assistant
    pg.click("#cbFab"); pg.wait_for_timeout(100)
    pg.fill("#cbIn", "When is a lesson really learned?"); pg.press("#cbIn", "Enter"); pg.wait_for_timeout(100)
    check("assistant: answers when a lesson is learned", "وثيقة" in pg.evaluate("[...document.querySelectorAll('#cbBody .cb-msg.bot')].pop().innerText") or "document" in pg.evaluate("[...document.querySelectorAll('#cbBody .cb-msg.bot')].pop().innerText"))
    pg.fill("#cbIn", "Lessons learned, CAPA or FMEA — which one?"); pg.press("#cbIn", "Enter"); pg.wait_for_timeout(100)
    check("assistant: answers lessons, CAPA or FMEA", "CAPA" in pg.evaluate("[...document.querySelectorAll('#cbBody .cb-msg.bot')].pop().innerText"))
    check("assistant: six fixed answers and two dynamic ones", pg.evaluate("KB.filter(x=>!x.dyn).length") == 6 and pg.evaluate("KB.filter(x=>x.dyn).length") == 2)
    pg.click("#cbClose")
    # ---- links: other tools' examples in this browser (read only)
    for mod in ("dmaic", "rca", "pareto", "fishbone", "five-whys", "a3", "capa", "pdca", "fmea"):
        ex(pg, mod)
    KEYS = ['cia-dmaic:v1', 'cia-rca:v1', 'cia-pareto:v1', 'cia-fish:v1', 'cia-why5:v1', 'cia-a3:v1', 'cia-capa:v1', 'cia-pdca:v1', 'cia-fmea:v1']
    stores = pg.evaluate("JSON.stringify(%s.map(k=>localStorage.getItem(k)))" % json.dumps(KEYS))
    ll0 = pg.evaluate("localStorage.getItem('cia-lessons:v1')")
    pg.goto(URL, wait_until="load"); pg.wait_for_timeout(300)
    check("home: offers to start from another tool only when this tool is empty", pg.evaluate("document.getElementById('homeImp').hidden"))
    exp = {"rca": ("RC-EX-01", "روجع التحقيق"), "a3": ("A3-EX-02", "وُضعت الخطة"), "dmaic": ("DM-EX-01", "أُغلق بالتسليم"), "fmea": ("FM-EX-01", "روجعت"), "capa": ("CA-EX-02", "التحقق من الفعالية"), "pdca": ("PD-EX-01", "مغلقة")}
    for s_, (rid, stn) in exp.items():
        pg.evaluate(f"go('tools'); document.getElementById('stSrc').value='{s_}'; stPreview(false); 0"); pg.wait_for_timeout(80)
        st = pg.evaluate("document.getElementById('stTable').innerText")
        check(f"start preview from {s_}: {rid} with its stage by its own rule", rid in st and stn in st, st[:240])
    st = pg.evaluate("(document.getElementById('stSrc').value='dmaic', stPreview(false), document.getElementById('stTable').innerText)")
    check("start preview from DMAIC lists closed or stopped projects only (DM-EX-02 is open)", "DM-EX-01" in st and "DM-EX-02" not in st)
    pg.evaluate("prefillFrom('rca','RC-EX-02')"); pg.wait_for_timeout(120)
    r = pg.evaluate("formToRec()")
    check("prefill from RC-EX-02: a near miss, the event and the root causes as the linked cause, severe, unsaved", r["src"] == "rca" and r["srcId"] == "RC-EX-02" and r["type"] == "near" and r["cause"]["how"] == "link" and "خطة الرفع" in r["cause"]["t"] and r["what"]["sev"] == "high" and r["id"] == "")
    check("the linked cause is read-only, with a preview by RCA's own rule", pg.evaluate("document.getElementById('f-ct').readOnly") and "RC-EX-02" in pg.evaluate("document.getElementById('czPv').textContent"))
    pg.evaluate("prefillFrom('fmea','FM-EX-02')"); pg.wait_for_timeout(120)
    check("prefill from FM-EX-02: the re-rated rows' causes, including a person-only cause → blame flag", pg.evaluate("formToRec().srcId") == "FM-EX-02" and not pg.evaluate("document.getElementById('blameWarn').hidden"))
    pg.evaluate("prefillFrom('capa','CA-EX-02')"); pg.wait_for_timeout(120)
    r = pg.evaluate("formToRec()")
    check("prefill from CA-EX-02: an audit finding, nonconformity source with its CAPA link", r["type"] == "audit" and r["nc"] is True and r["capa"] == "CA-EX-02")
    pg.evaluate("prefillFrom('pdca','PD-EX-01')"); pg.wait_for_timeout(120)
    r = pg.evaluate("formToRec()")
    check("prefill from PD-EX-01: the cycle's lessons field as a draft rule", r["src"] == "pdca" and len(r["lesson"]["dothis"]) > 10)
    pg.evaluate("clearForm(); 0")
    pg.select_option("#f-src", "a3"); pg.fill("#f-srcId", "A3-EX-01"); pg.select_option("#f-chow", "link"); pg.wait_for_timeout(60)
    check("source preview by A3's own rule", "A3-EX-01" in pg.evaluate("document.getElementById('srcInfo').textContent"))
    pg.click("#czTake"); pg.wait_for_timeout(60)
    check("take the cause from the source (read-only)", "A3-EX-01" in pg.evaluate("document.getElementById('czMsg').textContent") and len(pg.evaluate("document.getElementById('f-ct').value")) > 20)
    pg.click('[data-add="ac"]'); pg.select_option("#r-ac-0-kind", "fmea"); pg.fill("#r-ac-0-ref", "FM-EX-01"); pg.fill("#r-ac-0-what", "Row added"); pg.wait_for_timeout(60)
    check("FMEA-row action: preview of the study by FMEA's own rule and 'Open in FMEA'", "FM-EX-01" in pg.evaluate("document.querySelector('#acCards [data-pv]').textContent") and not pg.evaluate("document.querySelector('#acCards [data-fmo]').hidden"))
    pg.evaluate("window.__opened=[]"); pg.click("#acCards [data-fmo]"); pg.click("#srcOpen"); pg.wait_for_timeout(40)
    op = pg.evaluate("window.__opened")
    check("'Open in FMEA' and 'Open the source' use the tools' own ?open= requests", any("fmea.html?open=FM-EX-01" in u for u in op) and any("a3.html?open=A3-EX-01" in u for u in op), op)
    pg.fill("#f-capa", "CA-EX-04"); pg.wait_for_timeout(40)
    check("CAPA preview by CAPA's own rule", "CA-EX-04" in pg.evaluate("document.getElementById('caInfo').textContent"))
    check("nothing was written to the other tools, and the starts did not save a lesson", pg.evaluate("JSON.stringify(%s.map(k=>localStorage.getItem(k)))" % json.dumps(KEYS)) == stores and pg.evaluate("localStorage.getItem('cia-lessons:v1')") == ll0)
    # requests
    pg.goto(URL + "?rca=RC-EX-01", wait_until="load"); pg.wait_for_timeout(300)
    check("?rca= starts a lesson from the investigation", pg.evaluate("formToRec().srcId") == "RC-EX-01" and pg.evaluate("curTab") == "tools")
    pg.goto(URL + "?fmea=FM-EX-03", wait_until="load"); pg.wait_for_timeout(300)
    check("?fmea= starts a lesson from the study", pg.evaluate("formToRec().srcId") == "FM-EX-03")
    pg.goto(URL + "?open=LL-EX-02", wait_until="load"); pg.wait_for_timeout(300)
    check("?open= opens the lesson", pg.evaluate("document.getElementById('rid').value") == "LL-EX-02")
    pg.evaluate("sessionStorage.setItem('cia-nav:lessons', JSON.stringify({open:'LL-EX-03'}))")
    pg.goto(URL, wait_until="load"); pg.wait_for_timeout(300)
    check("the one-time hint opens the lesson and is removed", pg.evaluate("document.getElementById('rid').value") == "LL-EX-03" and pg.evaluate("sessionStorage.getItem('cia-nav:lessons')") is None)
    pg.evaluate("window.__opened=[]"); pg.evaluate("document.querySelector('#homeStd a[data-qt]').click()"); pg.wait_for_timeout(40)
    check("the ISO 10009 link opens the guide on its clause guide", any("iso10009.html#explain-cl" in u for u in pg.evaluate("window.__opened")), pg.evaluate("window.__opened"))
    # FMEA panel
    pg.goto(M("fmea"), wait_until="load"); pg.wait_for_timeout(300)
    pan = {}
    for rid in ("FM-EX-01", "FM-EX-02", "FM-EX-03"):
        pg.evaluate(f"go('tools'); loadRecordIntoForm(DB.records.find(r=>r.id==='{rid}')); 0"); pg.wait_for_timeout(80)
        pan[rid] = pg.evaluate("document.getElementById('llBox').hidden ? '' : document.getElementById('llBox').innerText")
    check("FMEA panel lists LL-EX-01 on FM-EX-01, LL-EX-02 on FM-EX-02 and LL-EX-03 on FM-EX-03", "LL-EX-01" in pan["FM-EX-01"] and "LL-EX-02" in pan["FM-EX-02"] and "LL-EX-03" in pan["FM-EX-03"], pan)
    pg.evaluate("window.__opened=[]"); pg.evaluate("loadRecordIntoForm(DB.records.find(r=>r.id==='FM-EX-01'))"); pg.wait_for_timeout(60)
    pg.click('[data-llopen="LL-EX-01"]'); pg.wait_for_timeout(40)
    check("'Open in Lessons Learned' asks for lessons.html?open=LL-EX-01", any("lessons.html?open=LL-EX-01" in u for u in pg.evaluate("window.__opened")))
    # clear all and a broken record
    pg.goto(URL, wait_until="load"); pg.wait_for_timeout(300)
    pg.evaluate("go('docs')"); pg.click("#pfReset"); pg.wait_for_timeout(150)
    check("clear all (confirmed) empties this tool only", pg.evaluate("DB.records.length") == 0 and pg.evaluate("localStorage.getItem('cia-lessons:v1')") is None and pg.evaluate("!!localStorage.getItem('cia-fmea:v1')"))
    pg.evaluate("localStorage.setItem('cia-lessons:v1', JSON.stringify({records:[{id:'X1',title:'Broken',what:'no',cause:null,lesson:[1],acts:[{st:'x'},null,'y'],ver:'no',share:[{}],tags:5}],assess:{}}))")
    errs.clear(); pg.reload(); pg.wait_for_timeout(300)
    for t in TABS: pg.evaluate(f"go('{t}')"); pg.wait_for_timeout(40)
    pg.evaluate("loadRecordIntoForm(DB.records[0]); go('tools')"); pg.wait_for_timeout(100); pg.evaluate("buildReportHTML(); buildCSV()")
    check("a record with missing or broken parts renders everywhere without errors", not errs and pg.evaluate("DB.records[0].what.sev") == "med", errs[:3])
    # keyboard
    pg.evaluate("go('home')"); pg.focus('#side button[data-go="audit"]'); pg.keyboard.press("Enter"); pg.wait_for_timeout(80)
    check("keyboard: a sidebar button opens its tab with Enter", pg.evaluate("curTab") == "audit")
    ctx.close()
    # ---- tour on a fresh browser: offered on the first visit
    ctx = b.new_context(viewport={"width": 1280, "height": 900}); pg = ctx.new_page()
    pg.on("dialog", lambda d: d.accept())
    pg.goto(URL, wait_until="load"); pg.wait_for_timeout(500)
    check("tour: the layer is present on the first visit", pg.evaluate("document.body.innerHTML.indexOf('cia-tour')>=0"))
    ctx.close()
    # ---- 390 px
    ctx = b.new_context(viewport={"width": 390, "height": 844}); pg = ctx.new_page(); errs2 = []
    pg.on("pageerror", lambda e: errs2.append(str(e))); pg.on("dialog", lambda d: d.accept()); pg.add_init_script(FREEZE)
    ex(pg, "lessons")
    pg.evaluate("loadRecordIntoForm(DB.records[1]); go('tools')"); pg.wait_for_timeout(300)
    check("390 px: no horizontal page scroll on the lesson (Arabic)", pg.evaluate("document.documentElement.scrollWidth") <= 392)
    check("390 px: the stage map stacks in one column", pg.evaluate("getComputedStyle(document.querySelector('.ll-map')).gridTemplateColumns.split(' ').length") == 1)
    for t in TABS: pg.evaluate(f"go('{t}')"); pg.wait_for_timeout(40)
    pg.evaluate("go('dash')"); pg.wait_for_timeout(100)
    check("390 px: the chart fits the screen", pg.evaluate("document.querySelector('#dChart svg').getBoundingClientRect().width") <= 380)
    check("390 px: dashboard without page scroll, no errors", pg.evaluate("document.documentElement.scrollWidth") <= 392 and not errs2, errs2[:2])
    ctx.close()
    # ---- hub
    ctx = b.new_context(viewport={"width": 1280, "height": 900}); pg = ctx.new_page(); errs3 = []
    pg.on("pageerror", lambda e: errs3.append(str(e))); pg.add_init_script(FREEZE)
    pg.goto(BASE + "/index.html", wait_until="load"); pg.wait_for_timeout(600)
    check("hub: Lessons Learned URL, Audit & Improvement row and card", pg.evaluate("URLS.lessons") == "./modules/lessons.html" and pg.evaluate("SYSTEMS.find(s=>s.id==='aud').mods.some(t=>t.k==='lessons'&&t.status==='live')") and pg.evaluate("TOOLKITS.some(t=>t.k==='lessons')"))
    check("hub: 39 tools and Audit & Improvement 16 (Stakeholder step)", pg.evaluate("TOOLKITS.length") == 39 and pg.evaluate("wStats().per[SYSTEMS.findIndex(s=>s.id==='aud')].n") == 16)
    check("hub: adapter reads the example snapshot (71%, 3/3, 2/3)", pg.evaluate("JSON.stringify(DEMO_RES.lessons.m.map(x=>x[3]))") == '["71%","3/3","2/3","12/12"]')
    check("hub: TOOLINFO, NEWS and the request mapping", pg.evaluate("!!TOOLINFO.lessons && TOOLINFO.lessons.q===12") and pg.evaluate("NEWS.some(n=>n.k==='lessons')") and pg.evaluate("JSON.stringify(TOOL_RQ.lessons)") == '["iac",null]')
    check("hub: the toolbox is complete, no grouped toolbox entry (Stakeholder step)", pg.evaluate("(typeof SOON!=='undefined'?SOON:[]).filter(t=>t.k==='citbox').length") == 0)
    check("hub: Advisor rules name Lessons Learned for repeated findings, skills, audit findings and projects", pg.evaluate("ADVISOR_RULES.filter(r=>r[2].lessons).map(r=>r[0]+':'+r[1]).sort().join(',')") == "goal:audit,goal:proj,pain:repeat,pain:skills")
    pg.evaluate("ciaOpenFile('lessons.html')"); pg.wait_for_timeout(800)
    check("hub: ciaOpenFile opens Lessons Learned in the overlay", "lessons.html" in pg.evaluate("document.getElementById('modFrame').src"))
    check("hub: no errors", not errs3, errs3[:3])
    ctx.close()
    b.close()
failed = [r for r in results if not r[1]]
print(f"\n{len(results) - len(failed)}/{len(results)} passed")
sys.exit(1 if failed else 0)
