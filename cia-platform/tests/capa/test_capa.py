"""CAPA tool (modules/capa.html) — 2026-10-11. Runs on file:// like tests/pdca/test_pdca.py; no server needed.
Covers: shared engine and layer identity, AR/EN and RTL/LTR, tabs, kit links both ways, self-assessment, the record
form from reaction to closure (validation, stages, reopen and a new review round), overdue flags, records, audit,
dashboard, report and CSV, persistence, example data, clear all, a record with missing parts, the read-only import
from the Smart Audit center (preview, take theirs / keep mine, nothing written to the center), the PDCA link, the
Smart Audit row link, the assistant, the guided tour, keyboard use and 390 px.
Usage: python3 tests/capa/test_capa.py"""
import os, sys, json, re
from playwright.sync_api import sync_playwright
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
MOD = os.path.join(ROOT, "modules")
URL = "file://" + os.path.join(MOD, "capa.html")
AUD = "file://" + os.path.join(MOD, "smart-audit-improvement.html")
PDCA = "file://" + os.path.join(MOD, "pdca.html")
# Served over http when the platform server is running (CIA_BASE, default http://127.0.0.1:8802): on file:// pages Chromium
# can drop a localStorage write that lands just before a reload. CAPA_FILE=1 forces file:// URLs.
if not os.environ.get("CAPA_FILE"):
    import urllib.request
    _b = os.environ.get("CIA_BASE", "http://127.0.0.1:8802")
    try:
        urllib.request.urlopen(_b + "/modules/capa.html", timeout=3).read(64)
        URL, AUD, PDCA = _b + "/modules/capa.html", _b + "/modules/smart-audit-improvement.html", _b + "/modules/pdca.html"
    except Exception:
        pass
TABS = ["home", "explain-std", "explain-cl", "assess", "tools", "docs", "audit", "dash", "report", "ai"]
results = []


def check(name, cond, detail=""):
    results.append((name, bool(cond), detail))
    print(("PASS " if cond else "FAIL ") + name + (("  -- " + str(detail)[:400]) if detail and not cond else ""), flush=True)


# ---------------- static: shared engine, kit and tour layers ----------------
def read(p): return open(p, encoding="utf-8").read()
def engine(s):
    a, b = "/* CIA toolbox engine v1 — start */", "/* CIA toolbox engine v1 — end */"
    return s[s.find(a):s.find(b) + len(b)] if s.count(a) == 1 and s.count(b) == 1 else None
def block(s, tag, id_):
    i = s.find('<%s id="%s">' % (tag, id_)); j = s.find("</%s>" % tag, i)
    return s[i:j + len(tag) + 3] if i >= 0 else None
capa, pdca, tpl = read(os.path.join(MOD, "capa.html")), read(os.path.join(MOD, "pdca.html")), read(os.path.join(ROOT, "templates", "explain-kit-template.html"))
e1, e2 = engine(pdca), engine(capa)
check("engine block present once in pdca.html and capa.html", e1 is not None and e2 is not None)
check("engine block identical in pdca.html and capa.html", e1 == e2 and len(e1 or "") > 2000, (len(e1 or ""), len(e2 or "")))
src = os.path.join(ROOT, "tests", "build", "engine.js")
if os.path.exists(src): check("engine block identical to tests/build/engine.js", (e2 or "") + "\n" == read(src) or e2 == read(src).rstrip("\n"))
for tag, id_ in (("style", "cia-explain-kit-css"), ("script", "cia-explain-kit-js")):
    check(f"capa.html {id_} byte-identical to the template", block(capa, tag, id_) == block(tpl, tag, id_))
tj_c, tj_p = block(capa, "script", "cia-tour-js"), block(pdca, "script", "cia-tour-js")
norm = lambda x: re.sub(r"var CFG=\{.*?\};", "var CFG={};", x or "", count=1)
check("tour script identical to pdca.html apart from CFG", norm(tj_c) == norm(tj_p) and tj_c != tj_p)
check("tour CSS identical to pdca.html", block(capa, "style", "cia-tour-css") == block(pdca, "style", "cia-tour-css"))
check("tour CFG names capa and guards the example", 'var CFG={"file": "capa", "hasEx": true, "guard": {"pfEx": "all"}};' in capa)
check("storage key and schema documented at the top of the host script", 'STORE="cia-capa:v1"' in capa and "Schema:" in capa[capa.find("CAPA tool — host logic"):capa.find("CAPA tool — host logic") + 2500])

with sync_playwright() as p:
    b = p.chromium.launch()

    def page_new(lang="ar", w=1280, h=900, tour_done=True):
        ctx = b.new_context(viewport={"width": w, "height": h}, accept_downloads=True)
        pg = ctx.new_page(); errs = []
        pg.on("pageerror", lambda e: errs.append("pageerror: " + str(e)))
        pg.on("console", lambda m: errs.append("console." + m.type + ": " + m.text) if (m.type == "error" and "Failed to load resource" not in m.text) else None)
        pg.route(re.compile(r"fonts\.(googleapis|gstatic)\.com"), lambda r: r.abort())
        init = "try{if(!sessionStorage.getItem('t0')){sessionStorage.setItem('t0','1');localStorage.setItem('cia-lang','%s');" % lang
        if tour_done: init += "localStorage.setItem('cia-tour:m:capa','done');localStorage.setItem('cia-tour:m:smart-audit-improvement','done');localStorage.setItem('cia-tour:m:pdca','done');"
        init += "}}catch(e){}"
        pg.add_init_script(init)
        pg.on("dialog", lambda d: d.accept())
        pg.goto(URL); pg.wait_for_timeout(350)
        return ctx, pg, errs

    def tab_text(pg, t): return pg.evaluate(f"(go('{t}'), document.querySelector('.tabpane[data-tab=\"{t}\"]').innerText)")

    # ---- 1. load, Arabic default, kit
    ctx, pg, errs = page_new("ar")
    check("loads in Arabic RTL", pg.evaluate("document.documentElement.dir") == "rtl" and pg.evaluate("document.documentElement.lang") == "ar")
    pg.click('#side button[data-go="explain-std"]'); pg.wait_for_timeout(150)
    std = pg.evaluate("document.getElementById('ex-std-box').innerText")
    check("method guide renders (kit) with the roles and the steps", len(std) > 400 and "من يفعل ماذا" in std and "خطوات سجل CAPA" in std, len(std))
    term = pg.inner_text("#caTerm")
    check("method tab explains once that preventive action is not an ISO 9001 clause", "الإجراء الوقائي" in term and "6.1" in term and "10.2" in term and pg.evaluate("document.querySelectorAll('#caTerm').length") == 1)
    check("the explanation is marked as interpretive summary", "ملخص تفسيري" in term)
    pg.evaluate("location.hash='#explain-cl'"); pg.wait_for_timeout(250)
    check("clause guide index shows 7 clauses", pg.evaluate("document.querySelectorAll('#ex-cl-box .ex-idx [data-ex-sec]').length") == 7)
    check("clause guide draws the cycle diagram", pg.evaluate("document.querySelectorAll('#ex-cl-box svg .ex-seg').length") == 7)
    pg.click('#ex-cl-box .ex-idx [data-ex-sec="10.2"]'); pg.wait_for_timeout(250)
    body = pg.evaluate("document.getElementById('ex-d-body').innerText")
    check("opening 10.2 shows its items 10.2.1 a … 10.2.2", all(c in body for c in ["10.2.1 a", "10.2.1 b", "10.2.1 d", "10.2.2"]), body[:200])
    check("requirements are marked as interpretive summaries", "ملخص تفسيري" in pg.evaluate("CIAEX.open('10.2.1 d'), document.querySelector('#ex-d-body .ex-it.open').innerText"))
    pg.keyboard.press("Escape"); pg.wait_for_timeout(200)
    info = pg.evaluate("({n:CIAEX.items.length, q:CIAEX.items.filter(i=>/^[A-Z]{2}\\d$/.test(i.q)).length, off:CIAEX.items.filter(i=>i.q==='x:tools').length})")
    check("kit: 19 items, 13 linked to the 12 questions, 6 outside the assessment", info == {"n": 19, "q": 13, "off": 6}, info)
    check("meta.verified names the date and the source files", "2026-10-11" in pg.evaluate("EXPLAIN_CAPA.meta.verified.ar") and "ISO_9001_2026en 1.pdf" in pg.evaluate("EXPLAIN_CAPA.meta.verified.en"))
    check("ui labels set (roles, wheelT, purpose, smap, assess, assessOff, offGo, actCtx)", pg.evaluate("['roles','wheelT','purpose','smap','assess','assessOff','offGo','actCtx'].every(k=>EXPLAIN_CAPA.ui.ar[k]&&EXPLAIN_CAPA.ui.en[k])") and pg.evaluate("EXPLAIN_CAPA.ui.ar.wheelT") == "عجلة البنود")
    # assess this -> question highlighted; outside items -> note and button to the record
    pg.evaluate("CIAEX.open('10.2.1 b')"); pg.wait_for_timeout(120)
    pg.evaluate("document.querySelector('#ex-d-body .ex-it.open [data-ex-assess]').click()"); pg.wait_for_timeout(500)
    check("'Assess this' lands on question CA1, highlighted", pg.evaluate("curTab") == "assess" and pg.evaluate("!!document.querySelector('.ex-aq[data-id=\"CA1\"].ex-hl')"))
    pg.evaluate("go('explain-cl')"); pg.evaluate("CIAEX.open('9.2.2 d')"); pg.wait_for_timeout(120)
    off = pg.evaluate("(()=>{const it=document.querySelector('#ex-d-body .ex-it.open'); return {note:!!it.querySelector('.ex-act-off'), btn:!!it.querySelector('[data-ex-go=\"tools\"]')};})()")
    check("item outside the assessment shows the note and opens the CAPA record", off == {"note": True, "btn": True}, off)
    pg.evaluate("document.querySelector('#ex-d-body .ex-it.open [data-ex-go]').click()"); pg.wait_for_timeout(200)
    check("the note's button opens the CAPA record tab", pg.evaluate("curTab") == "tools")
    pg.evaluate("go('assess')"); pg.wait_for_timeout(250)
    check("'Explain' back-link on each of the 12 questions", pg.evaluate("document.querySelectorAll('#asList .ex-qx[data-ex-q]').length") == 12)
    pg.evaluate("document.querySelector('.ex-aq[data-id=\"EF1\"] .ex-qx').click()"); pg.wait_for_timeout(200)
    check("'Explain' on EF1 opens 10.2.1 d", pg.evaluate("!!document.querySelector('#ex-d-body .ex-it.open[data-code=\"10.2.1 d\"]')"))
    pg.keyboard.press("Escape"); pg.wait_for_timeout(150)
    check("no JS errors on load and kit use (ar)", not errs, errs[:5])

    # ---- 2. tabs and sidebar
    for tab in TABS:
        pg.click(f'#side button[data-go="{tab}"]'); pg.wait_for_timeout(50)
        on = pg.evaluate(f"document.querySelector('.tabpane[data-tab=\"{tab}\"]').classList.contains('on')")
        sel = pg.evaluate(f"document.querySelector('#side button[data-go=\"{tab}\"]').getAttribute('aria-selected')")
        check(f"tab {tab} shows and is selected", on and sel == "true")
    check("sidebar buttons carry data-go and data-t", pg.evaluate("[...document.querySelectorAll('#side button')].every(b=>b.dataset.go&&b.dataset.t===b.dataset.go)"))

    # ---- 3. language
    pg.evaluate("go('explain-std')"); pg.click("#langBtn"); pg.wait_for_timeout(200)
    check("toggle to English sets LTR", pg.evaluate("document.documentElement.dir") == "ltr")
    check("English brand line", "Continual Improvement Academy" in pg.inner_text("#brandBy"))
    e_std = pg.evaluate("document.getElementById('ex-std-box').innerText")
    check("kit re-renders the open method tab in English", "Who does what" in e_std and len(re.findall(r"[؀-ۿ]", e_std)) / max(1, len(e_std)) < 0.05)
    pg.click("#langBtn"); pg.wait_for_timeout(200)
    check("toggle back to Arabic", pg.evaluate("document.documentElement.dir") == "rtl" and "من يفعل ماذا" in pg.evaluate("document.getElementById('ex-std-box').innerText"))

    # ---- 4. self-assessment
    pg.evaluate("go('assess')"); pg.wait_for_timeout(80)
    pg.check('input[name="as-RE1"][value="2"]'); pg.check('input[name="as-CA1"][value="1"]'); pg.wait_for_timeout(120)
    st = pg.evaluate("JSON.parse(localStorage.getItem('cia-capa:v1')).assess")
    check("assessment answers persisted under cia-capa:v1", st.get("RE1") == 2 and st.get("CA1") == 1, st)
    check("gauge value correct (13%)", pg.inner_text("#asPct") == "13%", pg.inner_text("#asPct"))
    check("score per group shown (6 groups)", pg.evaluate("document.querySelectorAll('#asStages .pd-bar').length") == 6)
    check("12 questions on a 0–2 scale", pg.evaluate("document.querySelectorAll('#asList .ex-aq').length") == 12 and pg.evaluate("document.querySelectorAll('#asList input[type=radio]').length") == 36)

    # ---- 5. record: validation, stages, reopen
    pg.evaluate("go('tools')"); pg.wait_for_timeout(80)
    err = lambda: pg.inner_text("#recErr")
    stage = lambda: pg.inner_text("#curStage")
    save = lambda: (pg.click("#saveBtn"), pg.wait_for_timeout(60))
    save(); check("empty save is refused (title)", "عنوان" in err(), err())
    pg.fill("#f-title", "تأخر إصدار شهادات المطابقة للعميل"); save()
    check("missing reference refused", "المرجع" in err(), err())
    pg.fill("#f-ref", "NCR-2026-090"); save()
    check("missing description refused", "صِف" in err(), err())
    pg.fill("#f-desc", "صدرت ثلاث شهادات مطابقة بعد موعد التسليم المتفق عليه مع العميل.")
    pg.fill("#f-raised", "2026-10-01"); pg.fill("#f-owner", "مدير الجودة"); save()
    check("valid record saves with id CA-2026-001", err() == "" and "CA-2026-001" in pg.inner_text("#recOk"), pg.inner_text("#recOk"))
    check("stage badge is Reaction", "التفاعل" in stage(), stage())
    pg.fill("#f-reactDate", "2026-09-20"); save()
    check("correction date before the date found is refused", "الاكتشاف" in err(), err())
    pg.fill("#f-correction", "أُصدرت الشهادات الثلاث وأُرسلت للعميل."); pg.fill("#f-reactDate", "2026-10-02"); save()
    check("with a dated correction the stage is Cause analysis", err() == "" and "تحليل السبب" in stage(), [err(), stage()])
    pg.select_option("#f-method", "why5"); pg.click("#tplBtn"); pg.wait_for_timeout(40)
    check("method template inserted into the analysis", "لماذا 1" in pg.input_value("#f-analysis"))
    pg.fill("#f-root", "لا موعد محدد لإصدار الشهادة في إجراء الشحن."); save()
    check("with a root cause the stage is Action", "الإجراء" in stage(), stage())
    pg.click("#actAdd"); pg.click("#actAdd"); pg.wait_for_timeout(40)
    rows = pg.query_selector_all("#actRows tr")
    check("action rows can be added", len(rows) == 2)
    pg.fill('#actRows tr:nth-child(1) [data-k="t"]', "إضافة إصدار الشهادة إلى قائمة الشحن"); pg.fill('#actRows tr:nth-child(1) [data-k="owner"]', "مدير الجودة"); pg.fill('#actRows tr:nth-child(1) [data-k="due"]', "2026-10-20")
    pg.fill('#actRows tr:nth-child(2) [data-k="t"]', "تنبيه آلي قبل موعد التسليم بثلاثة أيام"); pg.fill('#actRows tr:nth-child(2) [data-k="owner"]', "مدير تقنية المعلومات"); pg.fill('#actRows tr:nth-child(2) [data-k="due"]', "2026-10-25")
    save()
    rec = pg.evaluate("DB.records[0]")
    check("actions saved with owner, due date and status", len(rec["actions"]) == 2 and all(a["owner"] and a["due"] and a["st"] == "open" for a in rec["actions"]), rec["actions"])
    pg.select_option('#actRows tr:nth-child(1) [data-k="st"]', "done"); pg.select_option('#actRows tr:nth-child(2) [data-k="st"]', "done"); save()
    check("all actions done: stage is Effectiveness check", "التحقق من الفعالية" in stage(), stage())
    pg.select_option("#f-result", "eff"); save()
    check("a result without criterion and review date is refused", "معيار" in err(), err())
    pg.fill("#f-criterion", "صفر شهادات متأخرة خلال 60 يوماً"); pg.fill("#f-checked", "2026-12-10"); pg.fill("#f-closeDate", "2026-12-12"); save()
    check("closure without justification and approver is refused", "تبرير" in err(), err())
    pg.fill("#f-just", "فعال: صفر حالات في 60 يوماً"); pg.fill("#f-approver", "مدير الجودة"); pg.fill("#f-closeDate", "2026-12-01"); save()
    check("closure dated before the effectiveness review is refused", "لا يسبق" in err(), err())
    pg.fill("#f-closeDate", "2026-12-12"); save()
    check("closed with an effective result", err() == "" and "مغلق" in stage(), [err(), stage()])
    pg.select_option("#f-result", "ineff"); save()
    check("a record cannot stay closed when the action was not effective", "فعال" in err(), err())
    pg.fill("#f-closeDate", ""); pg.fill("#f-just", ""); save()
    check("not effective: the record is reopened", err() == "" and "أعيد فتحه" in stage(), [err(), stage()])
    check("reopen note with 'start a new review round'", pg.evaluate("!!document.getElementById('newRound')"))
    pg.click("#newRound"); pg.wait_for_timeout(60); save()
    rec = pg.evaluate("DB.records[0]")
    check("new round keeps the earlier review in the history and clears the result", len(rec["hist"]) == 1 and rec["hist"][0]["res"] == "ineff" and rec["eff"]["result"] == "" and "التحقق من الفعالية" in stage(), [rec["hist"], stage()])
    # overdue
    pg.click("#newBtn"); pg.wait_for_timeout(40)
    pg.fill("#f-title", "شكوى عميل عن تأخر التسليم"); pg.fill("#f-ref", "CC-2026-007"); pg.select_option("#f-src", "cc"); pg.fill("#f-desc", "تأخر تسليم دفعة واحدة أسبوعاً.")
    pg.fill("#f-containment", "تسليم الدفعة بنقل سريع"); pg.fill("#f-reactDate", "2026-01-05"); pg.fill("#f-root", "لا متابعة لمواعيد الناقل")
    pg.click("#actAdd"); pg.fill('#actRows tr:nth-child(1) [data-k="t"]', "متابعة يومية للناقل"); pg.fill('#actRows tr:nth-child(1) [data-k="owner"]', "مدير اللوجستيات"); pg.fill('#actRows tr:nth-child(1) [data-k="due"]', "2026-02-01"); save()
    check("second record saves as CA-2026-002 (year of the date found or today)", "CA-2026-00" in pg.inner_text("#recOk"), pg.inner_text("#recOk"))
    check("an open action past its date is flagged overdue", pg.evaluate("isOverdue(DB.records[0]) && actOver(DB.records[0])"))
    check("no JS errors after the record flow", not errs, errs[:5])

    # ---- 6. records, audit, dashboard
    pg.evaluate("go('docs')"); pg.wait_for_timeout(80)
    d = pg.inner_text("#docsBox")
    check("records list both records with flags", "NCR-2026-090" in d and "CC-2026-007" in d and "إجراء متأخر" in d and "أعيد فتحه ×1" in d, d[:300])
    check("sidebar count badge is 2", pg.inner_text("#cntDocs") == "2")
    pg.click('[data-open="CA-2026-001"]'); pg.wait_for_timeout(80)
    check("open loads the record into the form", pg.input_value("#f-ref") == "NCR-2026-090" and pg.evaluate("curTab") == "tools")
    pg.evaluate("go('audit')"); pg.wait_for_timeout(80)
    check("audit table lists the records with 9 checks", pg.evaluate("document.querySelectorAll('#auBox thead th').length") == 10 and "CC-2026-007" in pg.inner_text("#auBox"))
    check("audit KPI tiles present (4)", pg.evaluate("document.querySelectorAll('#auKpis .pd-kpi').length") == 4)
    a2 = pg.evaluate("auditRecord(DB.records.find(r=>r.ref==='CC-2026-007'))")
    check("audit flags the overdue record and passes its dated containment", a2["time"] is False and a2["cont"] is True and a2["ref"] is True, a2)
    pg.evaluate("go('dash')"); pg.wait_for_timeout(80)
    check("dashboard has 9 KPI tiles and an open-items list", pg.evaluate("document.querySelectorAll('#dKpis .pd-kpi').length") == 9 and pg.evaluate("document.querySelectorAll('#dOpen li').length") >= 1)

    # ---- 7. report and CSV
    pg.evaluate("go('report')"); pg.wait_for_timeout(80)
    with pg.expect_download() as dl:
        pg.click("#rpHtml")
    html = open(dl.value.path(), encoding="utf-8").read()
    check("HTML report named CAPA-report-*.html", dl.value.suggested_filename.startswith("CAPA-report-") and dl.value.suggested_filename.endswith(".html"), dl.value.suggested_filename)
    check("report carries the author, the records, audit results, open items and sources", all(x in html for x in ["مدثر سلامه", "NCR-2026-090", "Audit results", "Open items", "10.2", "interpretive summaries"]))
    check("report uses the shared engine frame (same CSS as PDCA)", pg.evaluate("TBX.REPORT_CSS") in html)
    with pg.expect_download() as dl2:
        pg.click("#rpCsv")
    csv = open(dl2.value.path(), encoding="utf-8-sig").read()
    check("CSV header and rows", csv.splitlines()[0].startswith('id,ref,title,source,class') and "NCR-2026-090" in csv and "CC-2026-007" in csv, csv[:120])

    # ---- 8. persistence and delete
    pg.reload(wait_until="load"); pg.wait_for_function("typeof go==='function'"); pg.evaluate("go('docs')"); pg.wait_for_timeout(80)
    check("records persist after reload", "NCR-2026-090" in pg.inner_text("#docsBox"))
    pg.click('[data-del="CA-2026-001"]'); pg.wait_for_timeout(40)
    check("first delete click arms confirmation", "تأكيد" in pg.inner_text("#docsBox"))
    pg.click('[data-del="CA-2026-001"]'); pg.wait_for_timeout(60)
    check("second click deletes", "NCR-2026-090" not in pg.inner_text("#docsBox") and pg.evaluate("DB.records.length") == 1)
    check("no JS errors through the full flow", not errs, errs[:5])
    ctx.close()

    # ---- 9. identity, example, clear all, robustness, assistant
    ctx, pg, errs = page_new("ar")
    check("home button back to the hub is present", pg.evaluate("!!document.getElementById('ciaHomeBtn')"))
    check("code badge CAPA and Arabic brand line in AR", pg.inner_text(".brand-mark") == "CAPA" and "أكاديمية التحسين المستمر" in pg.inner_text("#brandBy"))
    check("language button reads English in AR", pg.inner_text("#langLabel") == "English")
    check("hero shows the academy logo and 'إعداد مدثر سلامه'", pg.evaluate("!!document.querySelector('.hero img[data-logo]').src.startsWith('data:image')") and "مدثر سلامه" in pg.inner_text(".hero .author"))
    check("sidebar uses SVG icons with tinted tiles (10)", pg.evaluate("document.querySelectorAll('#side button[data-t] .ic svg').length") == 10)
    check("launch grid has 9 tiles", pg.evaluate("document.querySelectorAll('#launchGrid a').length") == 9)
    check("related tools strip: Smart Audit, PDCA, ISO 9001, IMS", pg.evaluate("[...document.querySelectorAll('#homeStd a.hs')].map(a=>a.getAttribute('href').split('/').pop()).join()") == "smart-audit-improvement.html,pdca.html,iso9001.html,ims-builder.html")
    check("AI tab is a placeholder labelled under construction", "قيد البناء" in tab_text(pg, "ai"))
    pg.evaluate("go('docs')"); pg.click("#pfEx"); pg.wait_for_function("document.querySelectorAll('#docsBox tbody tr').length===4", timeout=5000)
    st = pg.evaluate("JSON.parse(localStorage.getItem('cia-capa:v1'))")
    check("example loads 4 records, each with its NCR or finding reference", len(st["records"]) == 4 and all(r["ref"] for r in st["records"]))
    check("example stages: closed, waiting for review, action (overdue), reopened", pg.evaluate("DB.records.map(r=>stageOf(r)+(isOverdue(r)?'!':'')).join(',')") == "closed,verify,action!,reopened", pg.evaluate("DB.records.map(r=>stageOf(r)+(isOverdue(r)?'!':'')).join(',')"))
    check("example dates are in 2026 and labelled illustrative", all(r["raised"].startswith("2026") for r in st["records"]) and "توضيحية" in pg.inner_text("#exBox"))
    check("example self-assessment is 67%", pg.evaluate("assessScore()") == 67, pg.evaluate("assessScore()"))
    check("example links PDCA cycles", pg.evaluate("DB.records.filter(r=>r.pdca).map(r=>r.pdca).join()") == "PD-EX-02,PD-EX-03")
    for tab in TABS:
        tx = tab_text(pg, tab)
        bad = [w for w in ("undefined", "NaN", "[object Object]") if w in tx]
        check(f"example: {tab} has content and no undefined/NaN/[object Object]", len(tx.strip()) > 40 and not bad, bad)
    check("no errors with example data on every tab", not errs, errs[:5])
    # assistant
    check("assistant button and panel present", pg.evaluate("!!document.getElementById('cbFab') && !!document.getElementById('cbSub').textContent"))
    pg.click("#cbFab"); pg.wait_for_timeout(100)
    pg.click('#cbSug [data-sid="prev"]'); pg.wait_for_timeout(80)
    check("assistant answers the preventive-action question from the guide", "6.1" in pg.evaluate("[...document.querySelectorAll('#cbBody .cb-msg.bot')].pop().innerText"))
    pg.fill("#cbIn", "ما السجلات المتأخرة؟"); pg.press("#cbIn", "Enter"); pg.wait_for_timeout(80)
    check("assistant lists overdue records from the data", "EA-2026-02" in pg.evaluate("[...document.querySelectorAll('#cbBody .cb-msg.bot')].pop().innerText"))
    pg.click("#cbClose"); pg.wait_for_timeout(60)
    # clear all
    pg.evaluate("go('docs')"); pg.click("#pfReset"); pg.wait_for_timeout(100)
    check("clear all removes the stored data", pg.evaluate("localStorage.getItem('cia-capa:v1')") is None and "لا توجد سجلات" in pg.inner_text("#docsBox"))
    # a record with missing or broken parts
    pg.evaluate("localStorage.setItem('cia-capa:v1', JSON.stringify({records:[{id:'CA-X',title:'t',ref:'R-1'},{id:'CA-Y',ref:'R-2',react:'x',cause:null,actions:'bad',eff:{result:'maybe'},close:[1],hist:{}},null,7],assess:{RE1:2}}))")
    pg.reload(wait_until="load"); pg.wait_for_function("typeof go==='function'")
    for tab in TABS: tab_text(pg, tab)
    pg.evaluate("go('docs')"); pg.click('[data-open="CA-Y"]'); pg.wait_for_timeout(80)
    dtx = tab_text(pg, "docs")
    check("records with missing or broken parts render without errors", (not errs) and "R-1" in dtx and "R-2" in dtx, [errs[:3], dtx[:120]])
    pg.evaluate("localStorage.removeItem('cia-capa:v1')")
    # tour
    pg.reload(wait_until="load"); pg.wait_for_function("typeof go==='function' && !!window.ciaTour")
    pg.evaluate("ciaTour.start('full')"); pg.wait_for_timeout(200)
    seen, n, empty = set(), 0, []
    while pg.evaluate("ciaTour.state().active") and n < 80:
        s = pg.evaluate("ciaTour.state()")
        if not s["title"].strip(): empty.append(s["i"])
        seen.add(pg.evaluate("(document.querySelector('.tabpane.on')||{dataset:{}}).dataset.tab||''"))
        pg.evaluate("ciaTour.next()"); pg.wait_for_timeout(200); n += 1
    check("full tour covers all 9 sections after home", set(TABS[1:]) <= seen, sorted(seen))
    check("tour has no empty titles and no errors", not empty and not errs, [empty, errs[:3]])
    ctx.close()

    # ---- 10. import from the Smart Audit center (read only) and the row link there
    ctx, pg, errs = page_new("ar")
    pg.goto(AUD); pg.wait_for_function("typeof go==='function'"); pg.wait_for_timeout(300)
    pg.evaluate("go('capa')"); pg.wait_for_timeout(200)
    pg.evaluate("go('home')")
    ex_id = pg.evaluate("document.getElementById('pfEx') ? 'pfEx' : ''")
    if not ex_id:
        for t in pg.evaluate("[...document.querySelectorAll('#side button[data-t]')].map(b=>b.dataset.t)"):
            pg.evaluate(f"go('{t}')"); pg.wait_for_timeout(40)
            if pg.evaluate("!!document.getElementById('pfEx')"): break
    pg.evaluate("document.getElementById('pfEx').click()"); pg.wait_for_timeout(900)
    aud0 = pg.evaluate("localStorage.getItem('audit-center:v1')")
    n_ca = pg.evaluate("JSON.parse(localStorage.getItem('audit-center:v1')).r.capa.length")
    pg.evaluate("go('capa')"); pg.wait_for_timeout(250)
    links = pg.evaluate("[...document.querySelectorAll('#capaBox a[data-capa-tool]')].map(a=>a.getAttribute('href'))")
    check(f"Smart Audit: every CAPA row links to the CAPA tool ({len(links)} of {n_ca})", len(links) == n_ca and all(h == "./capa.html#docs" for h in links), links[:3])
    pg.evaluate("window.__open=[]; window.open=function(u,t){ window.__open.push([u,t]); return null; }; 0")
    pg.evaluate("document.querySelector('#capaBox a[data-capa-tool]').click()"); pg.wait_for_timeout(100)
    check("outside the hub the link opens the CAPA tool in a new tab", pg.evaluate("window.__open") == [["./capa.html#docs", "_blank"]] and pg.url.endswith("smart-audit-improvement.html#capa"), [pg.evaluate("window.__open"), pg.url])
    check("Smart Audit: the CAPA register CSV is unchanged by the link", pg.evaluate("regRows('capa')[0].length") == pg.evaluate("REG.capa.cols.length"))
    check("Smart Audit: stored data unchanged by the link", pg.evaluate("localStorage.getItem('audit-center:v1')") == aud0)
    pg.goto(URL); pg.wait_for_function("typeof go==='function'"); pg.wait_for_timeout(200)
    check("home shows what can be imported from the center", pg.evaluate("!document.getElementById('homeImp').hidden") and str(n_ca) in pg.inner_text("#homeImpT") or "بنداً" in pg.inner_text("#homeImpT"), pg.inner_text("#homeImpT"))
    pg.click("#homeImpGo"); pg.wait_for_timeout(250)
    nrows = pg.evaluate("document.querySelectorAll('#impTable tbody tr').length")
    nnc = pg.evaluate("(()=>{const S=JSON.parse(localStorage.getItem('audit-center:v1')).r; const withCa=new Set(S.capa.map(c=>c.f)); return S.fnd.filter(f=>(f.cls==='maj'||f.cls==='min')&&!withCa.has(f.id)).length;})()")
    check(f"preview lists every CAPA row and every NC finding without one ({nrows})", pg.evaluate("curTab") == "docs" and nrows == n_ca + nnc, [nrows, n_ca, nnc])
    it = pg.inner_text("#impTable")
    check("preview shows bilingual fields in Arabic, never as objects", "[object Object]" not in it and "undefined" not in it and len(re.findall(r"[؀-ۿ]", it)) > 200)
    pg.click("#langBtn"); pg.wait_for_timeout(200)
    it_en = pg.inner_text("#impTable")
    check("preview re-renders in English", "[object Object]" not in it_en and "Take theirs" in it_en and "Supplier" in it_en or "supplier" in it_en, it_en[:200])
    pg.click("#langBtn"); pg.wait_for_timeout(200)
    check("new rows default to 'take theirs'", pg.evaluate("IMP.every(r=>r.state!=='new'||r.ch==='take')"))
    pg.click("#impAllK"); pg.click("#impApply"); pg.wait_for_timeout(100)
    check("'All: mine' then apply imports nothing", pg.evaluate("DB.records.length") == 0 and pg.inner_text("#impMsg") != "")
    pg.evaluate("document.querySelector('[data-impch=\"0\"][data-v=\"take\"]').click()"); pg.click("#impApply"); pg.wait_for_timeout(120)
    check("one row taken: one record imported", pg.evaluate("DB.records.length") == 1 and pg.evaluate("DB.records[0].origin.tool") == "audit-center")
    pg.click("#impAllT"); pg.click("#impApply"); pg.wait_for_timeout(150)
    nrec = pg.evaluate("DB.records.length")
    check("'All: theirs' imports the rest", nrec == nrows, [nrec, nrows])
    check("nothing was written to the Smart Audit center's key", pg.evaluate("localStorage.getItem('audit-center:v1')") == aud0)
    check("after import every row shows 'no change'", pg.evaluate("IMP.every(r=>r.state==='same')"))
    sa = pg.evaluate("DB.records.find(r=>r.origin&&r.origin.ca==='CA-02')")
    check("imported record keeps the center's facts (root cause, action, owner) in the current language", sa and sa["cause"]["root"] and sa["actions"][0]["o"] == "sa" and re.search(r"[؀-ۿ]", sa["owner"]), sa and sa["owner"])
    check("an imported record closed without an effectiveness result fails 'effectiveness before closure'", pg.evaluate("(()=>{const r=DB.records.find(r=>r.origin&&r.origin.ca==='CA-02'); return stageOf(r)==='closed' && auditRecord(r).effb===false;})()"))
    pg.evaluate("go('tools')"); pg.evaluate("loadRecordIntoForm(DB.records.find(r=>r.origin&&r.origin.ca==='CA-02'))")
    root0 = pg.input_value("#f-root")
    pg.fill("#f-pdca", "PD-EX-09"); pg.fill("#f-closeDate", ""); pg.fill("#f-root", "local wording of the cause"); pg.fill("#f-qms", "keep me"); pg.click("#saveBtn"); pg.wait_for_timeout(80)
    check("a local edit of an imported record saves", pg.inner_text("#recErr") == "", pg.inner_text("#recErr"))
    pg.evaluate("go('docs')"); pg.click("#impPrev"); pg.wait_for_timeout(150)
    row = pg.evaluate("IMP.find(r=>r.c&&r.c.id==='CA-02')")
    check("after a local edit the row shows as an update, defaulting to 'keep mine'", row["state"] == "upd" and row["ch"] == "keep", [row["state"], row["ch"]])
    pg.evaluate("IMP.forEach(r=>r.ch='keep'); IMP.find(r=>r.c&&r.c.id==='CA-02').ch='take'; renderImp(); 0"); pg.click("#impApply"); pg.wait_for_timeout(100)
    r2 = pg.evaluate("DB.records.find(r=>r.origin&&r.origin.ca==='CA-02')")
    check("'take theirs' on an existing record restores the center's fields and keeps the ones it does not have", r2["cause"]["root"] == root0 and r2["pdca"] == "PD-EX-09" and r2["upd"]["qms"] == "keep me", [r2["cause"]["root"][:40], r2["pdca"], r2["upd"]["qms"]])
    check("no errors in the import flow", not errs, errs[:5])
    # PDCA link: name of the cycle read from PDCA (read only) and opening it
    pg.goto(PDCA); pg.wait_for_function("typeof go==='function'"); pg.evaluate("go('docs')"); pg.evaluate("document.getElementById('pfEx').click()"); pg.wait_for_timeout(300)
    pd0 = pg.evaluate("localStorage.getItem('cia-pdca:v1')")
    pg.goto(URL); pg.wait_for_function("typeof go==='function'"); pg.evaluate("go('tools')"); pg.fill("#f-pdca", "PD-EX-03"); pg.wait_for_timeout(60)
    check("the PDCA cycle's title is read from the PDCA tool", "خفض شحنات الخرسانة" in pg.inner_text("#pdInfo"), pg.inner_text("#pdInfo"))
    check("PDCA cycles offered as suggestions", pg.evaluate("document.querySelectorAll('#pdcaList option').length") == 3)
    pg.evaluate("window.__open=[]; window.open=function(u,t){ window.__open.push([u,t]); return null; }; 0")
    pg.click("#pdOpen"); pg.wait_for_timeout(60)
    check("outside the hub 'Open PDCA' opens a new tab", pg.evaluate("window.__open") == [["./pdca.html#docs", "_blank"]], pg.evaluate("window.__open"))
    check("PDCA data was only read", pg.evaluate("localStorage.getItem('cia-pdca:v1')") == pd0)
    check("no errors in the PDCA link checks", not errs, errs[:5])
    ctx.close()

    # ---- 11. English, keyboard, 390 px
    ctx, pg, errs = page_new("en", 390, 844)
    check("English loads LTR", pg.evaluate("document.documentElement.dir") == "ltr" and pg.inner_text("#langLabel") == "العربية")
    pg.focus('#side button[data-go="home"]'); pg.keyboard.press("Tab"); pg.keyboard.press("Enter"); pg.wait_for_timeout(80)
    check("keyboard can switch tabs (focus next + Enter)", pg.evaluate("curTab") != "home", pg.evaluate("curTab"))
    pg.evaluate("go('tools')"); pg.focus("#f-title"); pg.keyboard.type("Keyboard record"); pg.keyboard.press("Tab")
    check("form fields reachable by keyboard", pg.input_value("#f-title") == "Keyboard record" and pg.evaluate("document.activeElement.id") == "f-ref")
    pg.evaluate("go('docs')"); pg.click("#pfEx"); pg.wait_for_timeout(250)
    for tab in TABS:
        pg.evaluate(f"go('{tab}')"); pg.wait_for_timeout(60)
        sw = pg.evaluate("document.documentElement.scrollWidth")
        check(f"no horizontal scroll at 390px on {tab} (sw={sw})", sw <= 390, sw)
    check("English example text has no Arabic in the records", not re.search(r"[؀-ۿ]", pg.evaluate("JSON.stringify(DB.records.map(r=>[r.title,r.desc,r.cause.root]))")))
    check("no JS errors in English/mobile run", not errs, errs[:5])
    ctx.close()
    b.close()

failed = [r for r in results if not r[1]]
print(f"\n{len(results) - len(failed)}/{len(results)} passed")
sys.exit(1 if failed else 0)
