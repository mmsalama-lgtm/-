"""Pareto tool (modules/pareto.html) — 2026-10-11. Same style as tests/fish/test_fish.py.
Covers: shared engine (five files) and layer identity, AR/EN and RTL/LTR, tabs, kit links both ways, self-assessment, the analysis
form (validation, stages, categories and "Other", sorting and cumulative % with ties, the cut-off line and its adjustment, the
vital few confirmed with reasons, stratification, next steps linked to Fishbone / 5 Whys / CAPA with previews, the before/after
check with period length and verdict, independent review), the live chart (SVG in RTL and LTR, ranked table at 390 px), records,
audit, dashboard, report with the SVG and CSV, persistence, example data, clear all, an analysis with missing parts, the read-only
builds from CAPA, Fishbone and Smart Audit (other tools only read), the Fishbone prefill from a vital-few category (new tab and hub
overlay), the 5 Whys and CAPA links, the PDCA link, the assistant, the guided tour, keyboard use and 390 px.
Served over http when the platform server runs (CIA_BASE, default http://127.0.0.1:8802); PA_FILE=1 forces file:// URLs.
Usage: python3 tests/pareto/test_pareto.py"""
import os, sys, json, re
from playwright.sync_api import sync_playwright
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
MOD = os.path.join(ROOT, "modules")
BASE = "file://" + ROOT
if not os.environ.get("PA_FILE"):
    import urllib.request
    _b = os.environ.get("CIA_BASE", "http://127.0.0.1:8802")
    try:
        urllib.request.urlopen(_b + "/modules/pareto.html", timeout=3).read(64); BASE = _b
    except Exception:
        pass
URL, CAPA, FISH, W5, SA, HUB = (BASE + "/modules/pareto.html", BASE + "/modules/capa.html", BASE + "/modules/fishbone.html",
                                BASE + "/modules/five-whys.html", BASE + "/modules/smart-audit-improvement.html", BASE + "/index.html")
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


# ---------------- static: shared engine, kit and tour layers ----------------
pa, fb, w5, capa, pdca, tpl = (read(os.path.join(MOD, "pareto.html")), read(os.path.join(MOD, "fishbone.html")), read(os.path.join(MOD, "five-whys.html")),
                               read(os.path.join(MOD, "capa.html")), read(os.path.join(MOD, "pdca.html")), read(os.path.join(ROOT, "templates", "explain-kit-template.html")))
e = [engine(x) for x in (pdca, capa, w5, fb, pa)]
check("engine block present once in pdca, capa, five-whys, fishbone and pareto", all(x is not None for x in e))
check("engine block identical in the five files", len(set(e)) == 1 and len(e[0] or "") > 2000)
check("engine block identical to tests/build/engine.js", (e[4] or "") == read(os.path.join(ROOT, "tests", "build", "engine.js")).rstrip("\n"))
for tag, id_ in (("style", "cia-explain-kit-css"), ("script", "cia-explain-kit-js")):
    check(f"pareto.html {id_} byte-identical to the template", block(pa, tag, id_) == block(tpl, tag, id_))
norm = lambda x: re.sub(r"var CFG=\{.*?\};", "var CFG={};", x or "", count=1)
check("tour script identical to fishbone.html apart from CFG", norm(block(pa, "script", "cia-tour-js")) == norm(block(fb, "script", "cia-tour-js")) and block(pa, "script", "cia-tour-js") != block(fb, "script", "cia-tour-js"))
check("tour CSS identical to fishbone.html", block(pa, "style", "cia-tour-css") == block(fb, "style", "cia-tour-css"))
check("tour CFG names pareto and guards the example", 'var CFG={"file": "pareto", "hasEx": true, "guard": {"pfEx": "all"}};' in pa)
i0 = pa.find("Pareto tool — host logic")
check("storage key and schema documented at the top of the host script", 'STORE="cia-pareto:v1"' in pa and "Schema:" in pa[i0:i0 + 5000] and '"cia-capa:v1"' in pa[i0:i0 + 5000] and '"audit-center:v1"' in pa[i0:i0 + 5000])
check("Pareto never writes another tool's key; no other tool writes the Pareto key",
      not re.search(r"(localStorage\.setItem|TBX\.save)\((CAPA_KEY|FISH_KEY|WHY5_KEY|PDCA_KEY|AUD_KEY|['\"](cia-(capa|fish|why5|pdca):v1|audit-center:v1))", pa) and not re.search(r"setItem\((PARETO_KEY|['\"]cia-pareto:v1)", fb + w5 + capa))
check("sidebar buttons carry data-go and data-t", pa.count('data-go="') >= 10 and all(f'data-go="{t}" data-t="{t}"' in pa for t in TABS))

with sync_playwright() as p:
    b = p.chromium.launch()

    def page_new(lang="ar", w=1280, h=900, url=URL):
        ctx = b.new_context(viewport={"width": w, "height": h}, accept_downloads=True)
        pg = ctx.new_page(); errs = []
        pg.on("pageerror", lambda e: errs.append("pageerror: " + str(e)))
        pg.on("console", lambda m: errs.append("console." + m.type + ": " + m.text) if (m.type == "error" and "Failed to load resource" not in m.text) else None)
        pg.route(re.compile(r"fonts\.(googleapis|gstatic)\.com"), lambda r: r.abort())
        init = ("try{if(!sessionStorage.getItem('t0')){sessionStorage.setItem('t0','1');localStorage.setItem('cia-lang','%s');" % lang +
                "['pareto','fishbone','five-whys','capa','pdca','smart-audit-improvement'].forEach(function(k){localStorage.setItem('cia-tour:m:'+k,'done');});localStorage.setItem('cia-tour:v1','done');}}catch(e){}")
        pg.add_init_script(init)
        pg.on("dialog", lambda d: d.accept())
        pg.goto(url); pg.wait_for_timeout(350)
        return ctx, pg, errs

    def tab_text(pg, t): return pg.evaluate(f"(go('{t}'), document.querySelector('.tabpane[data-tab=\"{t}\"]').innerText)")
    def last_bot(pg): return pg.evaluate("[...document.querySelectorAll('#cbBody .cb-msg.bot')].pop().innerText")
    def load_ex(pg): pg.evaluate("go('docs')"); pg.click("#pfEx"); pg.wait_for_function("document.querySelectorAll('#docsBox tbody tr').length===3", timeout=5000)

    # ---- 1. load, Arabic default, method tab, kit
    ctx, pg, errs = page_new("ar")
    check("loads in Arabic RTL", pg.evaluate("document.documentElement.dir") == "rtl" and pg.evaluate("document.documentElement.lang") == "ar")
    check("header: home button, PA badge, Arabic brand line, language button", pg.evaluate("!!document.getElementById('ciaHomeBtn')") and pg.inner_text(".brand-mark") == "PA" and "أكاديمية التحسين المستمر" in pg.inner_text("#brandBy") and pg.inner_text("#langLabel") == "English")
    check("hero shows the academy logo and the author", pg.evaluate("document.querySelector('.hero-logo').src.startsWith('data:image')") and "مدثر سلامه" in pg.inner_text(".hero .author"))
    check("related tools strip: CAPA, Fishbone, 5 Whys, Smart Audit", pg.evaluate("[...document.querySelectorAll('#homeStd a')].map(a=>a.getAttribute('href'))") == ["./capa.html", "./fishbone.html", "./five-whys.html", "./smart-audit-improvement.html"])
    pg.click('#side button[data-go="explain-std"]'); pg.wait_for_timeout(150)
    term = pg.inner_text("#paTerm")
    check("method tab says once that Pareto is a method, not a clause, and names 9.1.3, its note, 10.2.1 ب) 2) and A.10.2",
          "ليس بنداً" in term and "9.1.3" in term and "الأساليب الإحصائية" in term and "10.2.1 ب) 2)" in term and "A.10.2" in term and pg.evaluate("document.querySelectorAll('#paTerm').length") == 1, term[:200])
    check("method tab: 80/20 is a rule of thumb, the chart depends on definitions, period and unit, a category is where to dig, not a cause",
          "قاعدة تقريبية وليست قانوناً" in term and "تعريفات فئاته" in term and "الوحدة" in term and "مكان تحفر فيه، وليست سبباً" in term)
    check("the explanation is marked as interpretive summary", "ملخص تفسيري" in term)
    check("term cards: ISO 9000:2026 3.8.1, 3.8.2 (Pareto charts), 3.8.3, 3.8.6", all(c in term for c in ["3.8.1", "3.8.2", "3.8.3", "3.8.6"]) and "مخططات باريتو" in term)
    std = pg.evaluate("document.getElementById('ex-std-box').innerText")
    check("method guide renders (kit) with the roles and the steps", len(std) > 400 and "من يعمل على المخطط" in std and "خطوات تحليل باريتو" in std, len(std))
    pg.evaluate("location.hash='#explain-cl'"); pg.wait_for_timeout(250)
    check("clause guide index shows 5 clauses", pg.evaluate("document.querySelectorAll('#ex-cl-box .ex-idx [data-ex-sec]').length") == 5)
    check("clause guide draws the cycle diagram", pg.evaluate("document.querySelectorAll('#ex-cl-box svg .ex-seg').length") == 5)
    pg.click('#ex-cl-box .ex-idx [data-ex-sec="9.1.3"]'); pg.wait_for_timeout(250)
    body = pg.evaluate("document.getElementById('ex-d-body').innerText")
    check("opening 9.1.3 shows 9.1.3, the method rules GD-1 … GD-6 and A.9.1", all(c in body for c in ["9.1.3", "GD-1", "GD-6", "A.9.1"]), body[:200])
    a91 = pg.evaluate("CIAEX.open('A.9.1'), document.querySelector('#ex-d-body .ex-it.open').innerText")
    check("A.9.1 names ISO 10009 and ISO 10017 as not verified", "ISO 10009" in a91 and "ISO 10017" in a91 and "غير متحقق منه" in a91, a91[:200])
    check("requirements are marked as interpretive summaries", "ملخص تفسيري" in pg.evaluate("CIAEX.open('10.2.1 b 2'), document.querySelector('#ex-d-body .ex-it.open').innerText"))
    check("method rules are marked as guidance, not normative text", "إرشاد تطبيقي" in pg.evaluate("CIAEX.open('GD-6'), document.querySelector('#ex-d-body .ex-it.open').innerText"))
    pg.keyboard.press("Escape"); pg.wait_for_timeout(200)
    info = pg.evaluate("({n:CIAEX.items.length, q:CIAEX.items.filter(i=>/^[A-Z]{2}\\d$/.test(i.q)).length, off:CIAEX.items.filter(i=>i.q==='x:tools').length})")
    check("kit: 14 items, 10 linked to the 10 questions, 4 outside the assessment", info == {"n": 14, "q": 10, "off": 4}, info)
    check("every question has an item", pg.evaluate("AQ.every(q=>CIAEX.items.some(i=>i.q===q[0]))"))
    check("meta.verified names the date and the source files", "2026-10-11" in pg.evaluate("EXPLAIN_PARETO.meta.verified.ar") and "ISO_9001_2026en 1.pdf" in pg.evaluate("EXPLAIN_PARETO.meta.verified.en") and "ISO 9000-2026.pdf" in pg.evaluate("EXPLAIN_PARETO.meta.verified.en"))
    check("ui labels set (roles, wheelT, purpose, smap, assess, assessOff, offGo, actCtx)", pg.evaluate("['roles','wheelT','purpose','smap','assess','assessOff','offGo','actCtx'].every(k=>EXPLAIN_PARETO.ui.ar[k]&&EXPLAIN_PARETO.ui.en[k])") and pg.evaluate("EXPLAIN_PARETO.ui.en.offGo") == "Open the Pareto analysis")
    pg.evaluate("CIAEX.open('GD-6')"); pg.wait_for_timeout(120)
    pg.evaluate("document.querySelector('#ex-d-body .ex-it.open [data-ex-assess]').click()"); pg.wait_for_timeout(500)
    check("'Assess this' lands on question VF2, highlighted", pg.evaluate("curTab") == "assess" and pg.evaluate("!!document.querySelector('.ex-aq[data-id=\"VF2\"].ex-hl')"))
    pg.evaluate("go('explain-cl')"); pg.evaluate("CIAEX.open('7.1.6')"); pg.wait_for_timeout(120)
    off = pg.evaluate("(()=>{const it=document.querySelector('#ex-d-body .ex-it.open'); return {note:!!it.querySelector('.ex-act-off'), btn:!!it.querySelector('[data-ex-go=\"tools\"]')};})()")
    check("item outside the assessment shows the note and a button to the analysis", off == {"note": True, "btn": True}, off)
    pg.evaluate("document.querySelector('#ex-d-body .ex-it.open [data-ex-go]').click()"); pg.wait_for_timeout(200)
    check("the note's button opens the Pareto analysis tab", pg.evaluate("curTab") == "tools")
    pg.evaluate("go('assess')"); pg.wait_for_timeout(250)
    check("'Explain' back-link on each of the 10 questions", pg.evaluate("document.querySelectorAll('#asList .ex-qx[data-ex-q]').length") == 10)
    pg.evaluate("document.querySelector('.ex-aq[data-id=\"AC2\"] .ex-qx').click()"); pg.wait_for_timeout(200)
    check("'Explain' on AC2 opens 10.1 (before/after check)", pg.evaluate("!!document.querySelector('#ex-d-body .ex-it.open[data-code=\"10.1\"]')"))
    pg.keyboard.press("Escape"); pg.wait_for_timeout(150)
    check("no JS errors on load and kit use (ar)", not errs, errs[:5])

    # ---- 2. tabs, language switch AR → EN → AR
    for tab in TABS:
        pg.click(f'#side button[data-go="{tab}"]'); pg.wait_for_timeout(50)
        check(f"tab {tab} shows content (ar)", pg.evaluate(f"document.querySelector('.tabpane[data-tab=\"{tab}\"]').innerText.trim().length") > 30)
    pg.evaluate("go('explain-std')"); pg.click("#langBtn"); pg.wait_for_timeout(200)
    check("switches to English LTR and re-renders the open explain tab", pg.evaluate("document.documentElement.dir") == "ltr" and "Who works on the chart" in pg.evaluate("document.getElementById('ex-std-box').innerText") and "rule of thumb, not a law" in pg.inner_text("#paTerm"))
    check("English title and toolName", "Pareto" in pg.title() and pg.inner_text("#brandName") == "Pareto tool — Vital few analysis")
    pg.click("#langBtn"); pg.wait_for_timeout(200)
    check("back to Arabic re-renders the explain tab", "من يعمل على المخطط" in pg.evaluate("document.getElementById('ex-std-box').innerText") and pg.evaluate("document.documentElement.lang") == "ar")
    check("tab descriptions in both languages (no raw keys)", all(not re.search(r"\bt[A-Z][a-z]+\b", pg.inner_text("#launchGrid")) for _ in [0]))

    # ---- 3. self-assessment
    pg.evaluate("go('assess')"); pg.wait_for_timeout(100)
    check("10 questions in 4 groups, 0–2 scale", pg.evaluate("document.querySelectorAll('#asList .pd-q').length") == 10 and pg.evaluate("document.querySelectorAll('#asList input[type=radio]').length") == 30)
    pg.check('input[name="as-QD1"][value="2"]'); pg.check('input[name="as-DT2"][value="1"]'); pg.wait_for_timeout(80)
    check("score updates: 3 of 20 points = 15%", pg.inner_text("#asPct") == "15%", pg.inner_text("#asPct"))
    check("group scores: QD 50%, DT 17%", pg.evaluate("assessScore('QD')") == 50 and pg.evaluate("assessScore('DT')") == 17)
    check("answers saved under cia-pareto:v1", pg.evaluate("JSON.parse(localStorage.getItem('cia-pareto:v1')).assess") == {"QD1": 2, "DT2": 1})
    pg.reload(); pg.wait_for_timeout(300); pg.evaluate("go('assess')")
    check("answers persist after reload", pg.evaluate("document.querySelector('input[name=\"as-QD1\"][value=\"2\"]').checked"))
    pg.click("#asReset"); pg.wait_for_timeout(80)
    check("clear answers", pg.evaluate("Object.keys(DB.assess).length") == 0 and pg.inner_text("#asPct") == "0%")

    # ---- 4. the analysis form
    pg.evaluate("go('tools')"); pg.wait_for_timeout(100)
    save = lambda: (pg.click("#saveBtn"), pg.wait_for_timeout(60))
    save()
    check("validation: title required", "عنواناً" in pg.inner_text("#recErr"))
    pg.fill("#f-title", "شكاوى العملاء بحسب السبب"); save()
    check("validation: question required", "السؤال" in pg.inner_text("#recErr"))
    pg.fill("#f-q", "ما الأسباب التي تصنع معظم شكاوى العملاء في الربع الثالث 2026؟")
    pg.fill("#f-from", "2026-07-01"); pg.fill("#f-to", "2026-06-01"); save()
    check("validation: period end not before start", "نهاية الفترة" in pg.inner_text("#recErr"))
    pg.fill("#f-to", "2026-09-30")
    check("three empty category rows to start, plus Other", pg.evaluate("document.querySelectorAll('#catRows tr[data-cid]').length") == 4)
    def setcat(i, name, d, v):
        pg.fill(f"#c-k{i}-n", name); pg.fill(f"#c-k{i}-d", d); pg.fill(f"#c-k{i}-v", str(v))
    setcat(1, "تأخر التسليم", "شكوى سببها وصول الطلب بعد الموعد المتفق عليه", 10)
    setcat(2, "فاتورة خاطئة", "شكوى سببها خطأ في مبلغ أو بند الفاتورة", 30)
    setcat(3, "تلف المنتج", "شكوى سببها منتج وصل تالفاً", 10)
    pg.wait_for_timeout(80)
    rk = pg.evaluate("ranked(formToRec()).rows.map(x=>[x.c.id,x.v,Math.round(x.cum*10)/10,x.line])")
    check("sorted largest first, ties keep entry order (k1 before k3)", [x[0] for x in rk] == ["k2", "k1", "k3"], rk)
    check("cumulative %: 60, 80, 100", [x[2] for x in rk] == [60.0, 80.0, 100.0], rk)
    check("80% cut-off: the line takes k2 and k1 (the category that crosses the line), not k3", [x[3] for x in rk] == [True, True, False], rk)
    check("stage moves to data", pg.evaluate("stageOf(formToRec())") == "data")
    check("live chart: SVG with three bars, the cumulative line and the cut-off line", pg.evaluate("document.querySelectorAll('#paChart svg .pa-bar').length") == 3 and pg.evaluate("!!document.querySelector('#paChart svg path')") and pg.evaluate("[...document.querySelectorAll('#paChart svg text')].some(t=>t.textContent.includes('80% القطع'))"))
    check("SVG is mirrored for Arabic (largest bar on the right)", pg.evaluate("(()=>{const r=[...document.querySelectorAll('#paChart svg .pa-bar rect')].map(x=>+x.getAttribute('x')); return r[0]>r[1]&&r[1]>r[2];})()"))
    pg.evaluate("document.getElementById('f-cut').value=60; document.getElementById('f-cut').dispatchEvent(new Event('input',{bubbles:true}))"); pg.wait_for_timeout(80)
    check("cut-off moved to 60%: only k2 is on the line; the label follows", pg.evaluate("ranked(formToRec()).rows.filter(x=>x.line).map(x=>x.c.id)") == ["k2"] and pg.inner_text("#cutOut") == "60%")
    pg.evaluate("document.getElementById('f-cut').value=80; document.getElementById('f-cut').dispatchEvent(new Event('input',{bubbles:true}))"); pg.wait_for_timeout(80)
    # Other larger than a named category
    pg.fill("#c-other-v", "12"); pg.wait_for_timeout(80)
    check("'Other' larger than a named category is flagged", not pg.evaluate("document.getElementById('othWarn').hidden") and "«أخرى» أكبر" in pg.inner_text("#othWarn"))
    check("'Other' is drawn last and never in the vital few", pg.evaluate("(()=>{const R=ranked(formToRec()).rows; return R[R.length-1].other && !isVital(R[R.length-1]);})()"))
    pg.fill("#c-other-v", "40"); pg.wait_for_timeout(80)
    check("'Other' the largest: bad flag and the audit check fails", "هي الأكبر" in pg.inner_text("#othWarn") and pg.evaluate("auditRecord(formToRec()).oth") is False)
    pg.fill("#c-other-v", "2"); pg.wait_for_timeout(80)
    check("small 'Other': no warning", pg.evaluate("document.getElementById('othWarn').hidden"))
    # add a category, max 15
    pg.click("#catAdd"); pg.wait_for_timeout(40)
    check("add a category row (focus moves to its name)", pg.evaluate("document.activeElement.id") == "c-k4-n")
    pg.fill("#c-k4-n", "سوء تعامل الموظف"); pg.fill("#c-k4-v", "4"); pg.wait_for_timeout(60)
    check("an undefined category is flagged", pg.evaluate("undefinedCats(formToRec())") == 1 and pg.evaluate("auditRecord(formToRec()).def") is False)
    pg.fill("#c-k4-d", "شكوى سببها أسلوب موظف خدمة العملاء"); pg.wait_for_timeout(40)
    for _ in range(11): pg.click("#catAdd"); pg.wait_for_timeout(10)
    check("15 categories at most: the add button hides with a note", pg.evaluate("document.querySelectorAll('#catRows tr[data-cid]:not([data-cid=\"other\"])').length") == 15 and pg.evaluate("document.getElementById('catAdd').hidden") and "15" in pg.inner_text("#catMax"))
    for k in range(5, 16): pg.click(f'[data-cdel="k{k}"]'); pg.wait_for_timeout(10)
    check("removing empty rows", pg.evaluate("document.querySelectorAll('#catRows tr[data-cid]:not([data-cid=\"other\"])').length") == 4)
    pg.fill("#c-k1-v", "-3"); save()
    check("validation: negative values refused", "سالبة" in pg.inner_text("#recErr"))
    pg.fill("#c-k1-v", "10"); save()
    check("saved as PA-2026-001 at stage data", pg.evaluate("DB.records[0].id") == "PA-2026-001" and pg.evaluate("stageOf(DB.records[0])") == "data")
    # vital few: the team adds a category with a reason
    pg.wait_for_timeout(60)
    check("vital-few table lists the ranked categories with the line marks", pg.evaluate("document.querySelectorAll('#vfBox tr[data-vid]').length") == 5)
    pg.check("#vf-k4"); pg.wait_for_timeout(80)
    check("adding k4 against the line asks for a reason", pg.evaluate("!!document.getElementById('vf-k4-w')") and not pg.evaluate("document.getElementById('whyWarn').hidden"))
    pg.check("#f-vconf"); pg.wait_for_timeout(60)
    check("confirmed without the reason: still stage data, audit 'conf' fails", pg.evaluate("stageOf(formToRec())") == "data" and pg.evaluate("auditRecord(formToRec()).conf") is False)
    pg.fill("#vf-k4-w", "أقل عدداً لكنها تمس سمعة الشركة مباشرة"); pg.wait_for_timeout(80)
    check("with the reason: stage vital few; the line now takes k2, k1, k3 (71% before k3) and the team adds k4", pg.evaluate("stageOf(formToRec())") == "vital" and pg.evaluate("vitalRows(formToRec()).map(x=>x.c.id)") == ["k2", "k1", "k3", "k4"])
    pg.fill("#f-strat", "قُسّمت الفواتير الخاطئة بحسب الفرع: فرع جدة 22 من 30.")
    # next steps
    check("next-step cards for the four vital-few categories", pg.evaluate("document.querySelectorAll('#nxBox .pa-nx').length") == 4)
    pg.select_option("#nx-k2-h", "capa"); pg.wait_for_timeout(80)
    check("choosing CAPA with no CAPA data says so in the preview", "لا توجد بيانات" in pg.inner_text('[data-pv="k2"]'))
    pg.fill("#nx-k2-r", "CA-EX-09"); pg.wait_for_timeout(60)
    check("an id not in CAPA is flagged in the preview", "غير موجود" in pg.inner_text('[data-pv="k2"]'))
    pg.select_option("#nx-k1-h", "why5"); pg.wait_for_timeout(60); pg.fill("#nx-k1-r", "W5-2026-004")
    pg.select_option("#nx-k3-h", "capa"); pg.wait_for_timeout(60); pg.fill("#nx-k3-r", "CA-EX-10")
    pg.select_option("#nx-k4-h", "fish"); pg.wait_for_timeout(60); pg.fill("#nx-k4-r", "FB-2026-002"); pg.wait_for_timeout(60)
    check("all vital-few linked: stage next steps", pg.evaluate("stageOf(formToRec())") == "acted")
    pg.select_option("#nx-k4-h", "capa"); pg.wait_for_timeout(80)
    check("changing the method clears the id", pg.evaluate("document.getElementById('nx-k4-r').value") == "" and pg.evaluate("stageOf(formToRec())") == "vital")
    pg.select_option("#nx-k4-h", "fish"); pg.wait_for_timeout(60); pg.fill("#nx-k4-r", "FB-2026-002"); save()
    # before/after
    pg.fill("#f-afrom", "2026-10-01"); pg.fill("#f-ato", "2026-10-31"); pg.wait_for_timeout(80)
    check("periods of different length are flagged", "مختلف" in pg.inner_text("#lenWarn"))
    pg.fill("#f-ato", "2026-12-31"); pg.wait_for_timeout(60)
    check("92 days against 92: same basis", "قبل 92 يوماً، بعد 92 يوماً" in pg.inner_text("#lenWarn"), pg.inner_text("#lenWarn"))
    for cid, v in (("k2", "12"), ("k1", "8"), ("k3", "9"), ("k4", "1"), ("other", "2")):
        pg.fill(f"#ba-{cid}", v); pg.wait_for_timeout(20)
    pg.wait_for_timeout(80)
    check("change per category is drawn as you type (k2: -18, -60.0%)", "-18" in pg.inner_text('#baBox tr[data-bar="k2"]') and "-60.0%" in pg.inner_text('#baBox tr[data-bar="k2"]'))
    check("totals: vital few 54 → 30, all 56 → 32", "54" in pg.inner_text("#baBox tfoot") and "30" in pg.inner_text("#baBox tfoot") and "56" in pg.inner_text("#baBox tfoot") and "32" in pg.inner_text("#baBox tfoot"))
    check("the figures suggest 'improved'; the before/after chart is drawn", "تحسّن" in pg.inner_text("#baSug") and pg.evaluate("!!document.querySelector('#baChart svg')"))
    check("no verdict yet: stage stays at next steps", pg.evaluate("stageOf(formToRec())") == "acted")
    pg.select_option("#f-verdict", "imp"); pg.wait_for_timeout(60)
    check("verdict confirmed: effect checked, waiting for review", pg.evaluate("stageOf(formToRec())") == "checked" and pg.evaluate("auditRecord(formToRec()).ba") is True)
    pg.click("#tmAdd"); pg.fill("#teamRows tr:nth-child(1) [data-k='n']", "مسؤول خدمة العملاء"); pg.fill("#teamRows tr:nth-child(1) [data-k='role']", "صنّف الشكاوى")
    pg.fill("#f-rby", "مسؤول خدمة العملاء"); pg.fill("#f-rdate", "2026-10-01"); pg.fill("#f-date", "2026-10-05"); save()
    check("review date before the analysis date is refused", "المراجعة" in pg.inner_text("#recErr"))
    pg.fill("#f-rdate", "2027-01-10"); pg.wait_for_timeout(40)
    check("reviewer from the team is flagged", not pg.evaluate("document.getElementById('rvWarn').hidden") and pg.evaluate("auditRecord(formToRec()).rev") is False)
    pg.fill("#f-rby", "مدير الجودة"); save()
    check("reviewed: stage 'reviewed', all audit checks pass except the reference", pg.evaluate("stageOf(DB.records[0])") == "reviewed" and pg.evaluate("Object.entries(auditRecord(DB.records[0])).filter(e=>e[1]===false).map(e=>e[0])") == ["ref"])
    pg.fill("#f-ref", "CC-2026-Q3"); save()
    check("with a reference every applicable check passes", pg.evaluate("Object.values(auditRecord(DB.records[0])).every(v=>v!==false)"))
    stored = pg.evaluate("JSON.parse(localStorage.getItem('cia-pareto:v1')).records[0]")
    check("stored: categories with values, after values, vf/why and next steps; Other and cut", stored["cats"][3]["vf"] == "add" and stored["cats"][3]["why"] and stored["cats"][1]["a"] == 12 and stored["cats"][0]["nx"] == {"how": "why5", "ref": "W5-2026-004"} and stored["other"]["v"] == 2 and stored["cut"] == 80 and stored["vconf"] is True and stored["after"]["verdict"] == "imp")
    pg.reload(); pg.wait_for_timeout(300)
    pg.evaluate("go('docs')"); pg.click('[data-open="PA-2026-001"]'); pg.wait_for_timeout(150)
    check("persists after reload and opens in the form with its state", pg.evaluate("document.getElementById('f-title').value") == "شكاوى العملاء بحسب السبب" and pg.evaluate("document.getElementById('vf-k4').checked") and pg.evaluate("document.getElementById('nx-k4-r').value") == "FB-2026-002" and pg.evaluate("document.getElementById('ba-k2').value") == "12")
    # verdict worse is flagged
    pg.select_option("#f-verdict", "worse"); pg.wait_for_timeout(40)
    check("verdict 'worse' is a bad flag", any("ساء" in x[0] and x[1] == "bad" for x in pg.evaluate("flagsOf(formToRec())")))
    pg.select_option("#f-verdict", "imp")
    # records, audit, dashboard, report
    docs = tab_text(pg, "docs")
    check("records table shows the analysis with stage, vital few and before/after", "PA-2026-001" in docs and "روجع التحليل" in docs and "تحسّن" in docs and "فاتورة خاطئة" in docs)
    check("audit tab: 10 checks per analysis", pg.evaluate("document.querySelectorAll('#auBox thead th').length") == 11)
    dash = tab_text(pg, "dash")
    check("dashboard KPIs and distributions", "إجمالي التحليلات" in dash and "نتيجة التحقق قبل وبعد" in dash and "الخطوات التالية للفئات الحيوية" in dash)
    rep = pg.evaluate("buildReportHTML()")
    check("report: cover, author, the Pareto SVG and the before/after SVG, ranked table, audit, open items, self-assessment",
          "مدثر سلامه" in rep and rep.count("<svg") == 2 and "جدول الترتيب" in rep and "Audit results" in rep and "Open items" in rep and "Self-assessment" in rep)
    csv = pg.evaluate("buildCSV()")
    check("CSV with BOM, header and the analysis row", csv.startswith("﻿") and "vitalFew" in csv.splitlines()[0] and "PA-2026-001" in csv)
    with pg.expect_download() as dl:
        pg.evaluate("go('report')"); pg.click("#rpHtml")
    check("report downloads as HTML", dl.value.suggested_filename.startswith("Pareto-report-") and dl.value.suggested_filename.endswith(".html"))
    with pg.expect_download() as dl2:
        pg.click("#rpCsv")
    check("CSV downloads", dl2.value.suggested_filename.endswith(".csv"))
    # delete with confirmation
    pg.evaluate("go('docs')"); pg.click('[data-del="PA-2026-001"]'); pg.wait_for_timeout(40)
    check("delete asks for confirmation first", pg.evaluate("DB.records.length") == 1 and "تأكيد الحذف" in pg.inner_text("#docsBox"))
    pg.click('[data-del="PA-2026-001"]'); pg.wait_for_timeout(60)
    check("deleted after confirmation", pg.evaluate("DB.records.length") == 0)
    check("no JS errors in the form flow", not errs, errs[:5])
    ctx.close()

    # ---- 5. example data, chatbot, clear all, broken record, keyboard
    ctx, pg, errs = page_new("ar")
    load_ex(pg)
    check("example: 3 analyses, assessment 70%", pg.evaluate("DB.records.length") == 3 and pg.evaluate("assessScore()") == 70)
    st = pg.evaluate("DB.records.map(r=>[r.id,stageOf(r)])")
    check("example stages: PA-EX-01 next steps, PA-EX-02 reviewed, PA-EX-03 vital few", st == [["PA-EX-01", "acted"], ["PA-EX-02", "reviewed"], ["PA-EX-03", "vital"]], st)
    v1 = pg.evaluate("vitalRows(DB.records[0]).map(x=>[x.c.name,x.c.nx.ref,x.line])")
    check("PA-EX-01: CA-EX-01, CA-EX-04 and CA-EX-03 are in the vital few by the line; calibration added by the team (FB-EX-01)",
          [x[1] for x in v1] == ["CA-EX-01", "CA-EX-04", "CA-EX-03", "FB-EX-01"] and [x[2] for x in v1] == [True, True, True, False], v1)
    v2 = pg.evaluate("vitalRows(DB.records[1]).map(x=>x.c.nx.how+':'+x.c.nx.ref)")
    check("PA-EX-02 links Fishbone FB-EX-02, 5 Whys W5-EX-03 and CAPA CA-EX-04; before/after improved on 61 vs 62 days",
          v2 == ["fish:FB-EX-02", "why5:W5-EX-03", "capa:CA-EX-04"] and pg.evaluate("sameLen(DB.records[1]) && DB.records[1].after.verdict==='imp'"), v2)
    o1 = pg.evaluate("ranked(DB.records[0]).rows.filter(x=>!x.other).map(x=>x.c.id)"); o3 = pg.evaluate("ranked(DB.records[2]).rows.filter(x=>!x.other).map(x=>x.c.id)")
    check("PA-EX-03 ranks the same categories by cost in a different order", o1[0] == "k1" and o3[0] == "k2" and o3.index("k1") == 4 and set(o1) == set(o3), [o1, o3])
    check("example labelled illustrative", "توضيحية" in pg.inner_text("#exBox"))
    for t in TABS:
        txt_ = tab_text(pg, t)
        check(f"example: tab {t} renders without undefined/NaN", len(txt_) > 30 and not re.search(r"undefined|NaN|\[object Object\]", txt_))
    pg.click("#cbFab"); pg.wait_for_timeout(100)
    check("assistant suggestions include 'Is it always 80/20?' and 'Pareto or Fishbone first?'", "هل هي دائماً 80/20؟" in pg.inner_text("#cbSug") and "باريتو أم عظمة السمكة أولاً؟" in pg.inner_text("#cbSug"))
    pg.click('#cbSug [data-sid="8020"]'); pg.wait_for_timeout(80)
    check("80/20 answer: rule of thumb, not a law", "قاعدة تقريبية" in last_bot(pg))
    pg.fill("#cbIn", "هل أبدأ بباريتو أم عظمة السمكة أولاً؟"); pg.press("#cbIn", "Enter"); pg.wait_for_timeout(80)
    check("typed question answered: Pareto first, Fishbone on the category", "باريتو أولاً" in last_bot(pg))
    pg.fill("#cbIn", "ما البنود المفتوحة؟"); pg.press("#cbIn", "Enter"); pg.wait_for_timeout(80)
    check("assistant reads the open items", "PA-EX-01" in last_bot(pg) or "NCR-LOG-2026-Q3" in last_bot(pg))
    pg.fill("#cbIn", "ما وضع تحليلاتي؟"); pg.press("#cbIn", "Enter"); pg.wait_for_timeout(80)
    check("assistant reads the status", "3" in last_bot(pg) and "70%" in last_bot(pg))
    pg.click("#cbClose"); pg.wait_for_timeout(60)
    # keyboard
    pg.evaluate("go('tools')"); pg.focus("#f-title"); pg.keyboard.press("Tab"); pg.wait_for_timeout(30)
    check("keyboard: Tab moves through the form fields", pg.evaluate("document.activeElement.id") == "f-ref")
    pg.focus("#f-cut"); pg.keyboard.press("ArrowUp"); pg.wait_for_timeout(60)
    check("keyboard: the cut-off slider moves with arrow keys", pg.inner_text("#cutOut") == "85%")
    # broken record
    pg.evaluate("localStorage.setItem('cia-pareto:v1', JSON.stringify({records:[{id:'PA-Y',title:'x',cats:[null,{name:'a',v:'7'},{v:'abc'}],other:'bad',after:5,team:'no'}],assess:null}))")
    pg.reload(); pg.wait_for_timeout(300)
    for t in ("docs", "audit", "dash", "report"):
        check(f"analysis with missing parts: {t} renders", len(tab_text(pg, t)) > 30)
    pg.evaluate("go('docs')"); pg.click('[data-open="PA-Y"]'); pg.wait_for_timeout(100)
    check("analysis with missing parts opens in the form", pg.evaluate("document.getElementById('f-title').value") == "x" and pg.evaluate("buildReportHTML().length") > 1000)
    load_ex(pg)
    pg.evaluate("go('docs')"); pg.click("#pfReset"); pg.wait_for_timeout(100)
    check("clear all removes the key", pg.evaluate("localStorage.getItem('cia-pareto:v1')") is None and pg.evaluate("DB.records.length") == 0)
    check("no JS errors with example, assistant and broken data", not errs, errs[:5])
    ctx.close()

    # ---- 6. read-only builds from CAPA, Fishbone and Smart Audit
    ctx, pg, errs = page_new("ar", url=CAPA)
    pg.evaluate("go('docs')"); pg.click("#pfEx"); pg.wait_for_timeout(300)
    pg.goto(FISH); pg.wait_for_timeout(300); pg.evaluate("go('docs')"); pg.click("#pfEx"); pg.wait_for_timeout(300)
    pg.goto(W5); pg.wait_for_timeout(300); pg.evaluate("go('docs')"); pg.click("#pfEx"); pg.wait_for_timeout(300)
    pg.goto(SA); pg.wait_for_timeout(600)
    ids = pg.evaluate("""()=>{ let g={}; try{ const s=[...document.scripts].map(x=>x.textContent).find(t=>t.includes('var CFG={"file"')); g=JSON.parse(s.match(/var CFG=(\\{.*?\\});/)[1]).guard||{}; }catch(e){} return Object.keys(g).filter(k=>g[k]==='all'); }""")
    for bid in ids:
        pg.evaluate("(id)=>{ const tabs=[...document.querySelectorAll('#side button[data-t]')]; for(const b of tabs){ if(document.getElementById(id)) break; b.click(); } const e=document.getElementById(id); e&&e.click(); }", bid); pg.wait_for_timeout(800)
    snap = pg.evaluate("({c:localStorage.getItem('cia-capa:v1'),f:localStorage.getItem('cia-fish:v1'),a:localStorage.getItem('audit-center:v1')})")
    check("CAPA, Fishbone and Smart Audit examples are in the browser", all(snap.values()), [k for k, v in snap.items() if not v])
    pg.goto(URL); pg.wait_for_timeout(350)
    check("home strip offers to build categories from the data in this browser", not pg.evaluate("document.getElementById('homeImp').hidden") and "سجل CAPA" in pg.inner_text("#homeImpT"))
    pg.click("#homeImpGo"); pg.wait_for_timeout(150)
    check("the strip opens the builder", pg.evaluate("curTab") == "tools")
    pg.click("#bdPrev"); pg.wait_for_timeout(100)
    check("CAPA by source: preview of 4 records (no period: all data)", pg.evaluate("BD.rows.reduce((a,g)=>a+g.v,0)") == 4 and "كل البيانات" in pg.inner_text("#bdPer") and not pg.evaluate("document.getElementById('bdUse').hidden"))
    check("preview lists the CAPA ids as examples", "CA-EX-0" in pg.inner_text("#bdTable"))
    pg.fill("#f-from", "2026-05-01"); pg.fill("#f-to", "2026-12-31"); pg.click("#bdPrev"); pg.wait_for_timeout(100)
    check("CAPA within the period: 3 records (CA-EX-01 raised in April is left out)", pg.evaluate("BD.rows.reduce((a,g)=>a+g.v,0)") == 3 and "2026-05-01" in pg.inner_text("#bdPer"))
    pg.select_option("#bdBy", "method"); pg.wait_for_timeout(100)
    check("CAPA by method groups Fishbone / 5 Whys", any("عظمة السمكة" == r for r in pg.evaluate("BD.rows.map(g=>g.l)")))
    pg.click("#bdUse"); pg.wait_for_timeout(120)
    check("'Use these categories' fills the form (unsaved) with values and definitions", pg.evaluate("DB.records.length") == 0 and pg.evaluate("formToRec().cats.every(c=>c.v>0&&c.def.length>10)") and pg.evaluate("formToRec().src") == "capa" and "لم يُكتب أي شيء" in pg.inner_text("#recOk"))
    pg.select_option("#bdSrc", "fish"); pg.wait_for_timeout(60); pg.fill("#f-from", ""); pg.fill("#f-to", ""); pg.click("#bdPrev"); pg.wait_for_timeout(100)
    fr = pg.evaluate("BD.rows.map(g=>[g.l,g.v])")
    check("Fishbone causes by bone (ruled-out causes not counted)", len(fr) >= 4 and all(v > 0 for _, v in fr), fr)
    pg.select_option("#bdBy", "votes"); pg.wait_for_timeout(100)
    check("Fishbone causes by votes", pg.evaluate("BD.by") == "votes" and pg.evaluate("BD.rows.reduce((a,g)=>a+g.v,0)") > pg.evaluate("1"))
    pg.select_option("#bdSrc", "audit"); pg.wait_for_timeout(60); pg.click("#bdPrev"); pg.wait_for_timeout(100)
    ar_ = pg.evaluate("BD?BD.rows.map(g=>[g.l,g.v]):null")
    check("Smart Audit findings by clause", ar_ and all(l.startswith("ISO ") for l, _ in ar_), ar_)
    pg.select_option("#bdBy", "dept"); pg.wait_for_timeout(100)
    check("Smart Audit findings by department", pg.evaluate("BD.rows.length") >= 2 and not any(l.startswith("dp_") for l in pg.evaluate("BD.rows.map(g=>g.l)")))
    check("the other tools' data is unchanged after the builds", pg.evaluate("({c:localStorage.getItem('cia-capa:v1'),f:localStorage.getItem('cia-fish:v1'),a:localStorage.getItem('audit-center:v1')})") == snap)
    # next-step previews read the other tools
    load_ex(pg)
    pg.evaluate("loadRecordIntoForm(DB.records[1]); go('tools')"); pg.wait_for_timeout(150)
    pv = pg.evaluate("[...document.querySelectorAll('#nxBox [data-pv]')].map(e=>e.innerText)")
    check("next-step previews: FB-EX-02 with its stage, W5-EX-03 with its root cause, CA-EX-04 with its stage", "FB-EX-02" in pv[0] and "روجع التحليل" in pv[0] and "W5-EX-03" in pv[1] and "CA-EX-04" in pv[2] and "أعيد فتحه" in pv[2], pv)
    check("datalists offer the other tool's ids", pg.evaluate("[...document.querySelectorAll('#nx-k1-l option')].map(o=>o.value)") == ["FB-EX-01", "FB-EX-02", "FB-EX-03"])
    check("no JS errors in the builds", not errs, errs[:5])
    # Fishbone prefill from a vital-few category, new tab
    pg.evaluate("loadRecordIntoForm(DB.records[2]); go('tools')"); pg.wait_for_timeout(120)
    pg.select_option("#nx-k4-h", "fish"); pg.wait_for_timeout(80)
    with ctx.expect_page() as np:
        pg.click('[data-nxfish="k4"]')
    fp = np.value; fp.wait_for_load_state(); fp.wait_for_timeout(400)
    check("'Start a Fishbone analysis' saves first and opens fishbone.html?pareto=PA-EX-03&cat=k4", "fishbone.html?pareto=PA-EX-03&cat=k4" in fp.url and pg.evaluate("DB.records.find(r=>r.id==='PA-EX-03').cats.find(c=>c.id==='k4').nx.how") == "fish", fp.url)
    check("Fishbone opens a new, unsaved analysis filled from the category", fp.evaluate("document.getElementById('rid').value") == "" and "إعادة عمل" in fp.evaluate("document.getElementById('f-what').value") and "PA-EX-03" in fp.evaluate("document.getElementById('f-much').value"))
    fp.close()
    pg.select_option("#nx-k4-h", "why5"); pg.wait_for_timeout(60)
    with ctx.expect_page() as np2:
        pg.click('[data-nx5="k4"]')
    w = np2.value; w.wait_for_load_state()
    check("'Open the 5 Whys tool' opens five-whys.html on its analysis tab", "five-whys.html#tools" in w.url, w.url); w.close()
    pg.evaluate("loadRecordIntoForm(DB.records[1]); go('tools')"); pg.wait_for_timeout(120)
    with ctx.expect_page() as np3:
        pg.click('[data-nxopen="k2"]')
    w2 = np3.value; w2.wait_for_load_state(); w2.wait_for_timeout(300)
    check("'Open the linked one' opens 5 Whys on W5-EX-03 (its existing ?open=)", "five-whys.html?open=W5-EX-03" in w2.url and w2.evaluate("document.getElementById('rid').value") == "W5-EX-03", w2.url); w2.close()
    with ctx.expect_page() as np4:
        pg.click('[data-nxopen="k3"]')
    c2 = np4.value; c2.wait_for_load_state()
    check("CAPA link opens capa.html", "capa.html" in c2.url, c2.url); c2.close()
    with ctx.expect_page() as np5:
        pg.click("#pdOpen")
    p5 = np5.value; p5.wait_for_load_state()
    check("PDCA link opens pdca.html in a new tab outside the hub", "pdca.html" in p5.url); p5.close()
    ctx.close()

    # ---- 7. inside the hub: Fishbone in the overlay with the one-time hint; PDCA through ciaOpenFile
    ctx, pg, errs = page_new("ar", url=HUB)
    pg.evaluate("openModule('pareto')"); pg.wait_for_timeout(900)
    fr_ = lambda: pg.frame_locator("#modFrame")
    fw = lambda js: pg.evaluate("(js)=>document.getElementById('modFrame').contentWindow.eval(js)", js)
    fw("go('docs'); document.getElementById('pfEx').click(); 0"); pg.wait_for_timeout(400)
    fw("loadRecordIntoForm(DB.records[1]); go('tools'); 0"); pg.wait_for_timeout(200)
    check("inside the hub the next-step cards say the other tool replaces this one", "مكان هذه الأداة" in fw("document.getElementById('nxBox').innerText"))
    fw("document.querySelector('[data-nxfish=\"k1\"]').click(); 0"); pg.wait_for_timeout(1200)
    check("hub: Fishbone opens in the overlay from a Pareto category", pg.evaluate("document.getElementById('modFrame').dataset.k") == "fish")
    pg.wait_for_function("document.getElementById('modFrame').contentWindow.document.getElementById('f-what') && document.getElementById('modFrame').contentWindow.document.getElementById('f-what').value.length>0", timeout=8000)
    check("hub: the hint fills the Fishbone effect, then is removed", "حرارة الخرسانة" in fw("document.getElementById('f-what').value") and fw("sessionStorage.getItem('cia-nav:fishbone')") is None)
    pg.evaluate("openModule('pareto')"); pg.wait_for_timeout(900)
    fw("go('tools'); document.getElementById('pdOpen').click(); 0"); pg.wait_for_timeout(900)
    check("hub: PDCA opens through ciaOpenFile", pg.evaluate("document.getElementById('modFrame').dataset.k") == "pdca")
    pg.evaluate("openModule('fish')"); pg.wait_for_timeout(900)
    fw("go('docs'); document.getElementById('pfEx').click(); 0"); pg.wait_for_timeout(400)
    fw("loadRecordIntoForm(DB.records.find(r=>r.id==='FB-EX-02')); go('tools'); 0"); pg.wait_for_timeout(200)
    fw("document.querySelector('[data-paopen]').click(); 0"); pg.wait_for_timeout(1200)
    check("hub: Fishbone's panel opens the Pareto analysis it came from", pg.evaluate("document.getElementById('modFrame').dataset.k") == "pareto" and fw("document.getElementById('rid').value") == "PA-EX-02")
    check("no errors in the hub flow", not errs, errs[:3])
    ctx.close()

    # ---- 8. English and 390 px
    for lang in ("en", "ar"):
        ctx, pg, errs = page_new(lang, 390, 844)
        load_ex(pg)
        pg.evaluate("loadRecordIntoForm(DB.records[0]); go('tools')"); pg.wait_for_timeout(200)
        over = pg.evaluate("document.documentElement.scrollWidth-innerWidth")
        check(f"390 px {lang}: no horizontal overflow on the analysis tab", over <= 1, over)
        check(f"390 px {lang}: chart becomes a ranked table with bars", pg.evaluate("getComputedStyle(document.querySelector('#paChart .pa-svgw')).display") == "none" and pg.evaluate("document.querySelectorAll('#paChart .pa-rank li.vf').length") == 4)
        check(f"390 px {lang}: the ranked table reads in order with share and cumulative %", "33.8%" in pg.inner_text("#paChart .pa-rank") and "100.0%" in pg.inner_text("#paChart .pa-rank"))
        for t in TABS:
            pg.evaluate(f"go('{t}')"); pg.wait_for_timeout(40)
            o = pg.evaluate("document.documentElement.scrollWidth-innerWidth")
            check(f"390 px {lang}: tab {t} no overflow", o <= 1, o)
        if lang == "en":
            check("English LTR chart: largest bar on the left", pg.evaluate("(()=>{const s=document.createElement('div'); s.innerHTML=paretoSVG(DB.records[0],'en'); const r=[...s.querySelectorAll('.pa-bar rect')].map(x=>+x.getAttribute('x')); return r[0]<r[1];})()"))
            check("English labels on the analysis", "Vital few" in pg.inner_text("#sec-Vital") and "Before/after check" in pg.inner_text("#sec-Ba"))
        check(f"no errors at 390 px {lang}", not errs, errs[:3])
        ctx.close()

    # ---- 9. tour (AR and EN): every section after home, no empty titles
    for lang in ("ar", "en"):
        ctx, pg, errs = page_new(lang)
        pg.wait_for_function("!!window.ciaTour")
        pg.evaluate("ciaTour.start('full')"); pg.wait_for_timeout(200)
        seen, n, empty = set(), 0, []
        while pg.evaluate("ciaTour.state().active") and n < 80:
            s_ = pg.evaluate("ciaTour.state()")
            if not s_["title"].strip(): empty.append(s_["i"])
            seen.add(pg.evaluate("(document.querySelector('.tabpane.on')||{dataset:{}}).dataset.tab||''"))
            pg.evaluate("ciaTour.next()"); pg.wait_for_timeout(150); n += 1
        check(f"full tour ({lang}) covers all 9 sections after home", set(TABS[1:]) <= seen, sorted(seen))
        check(f"tour ({lang}) has no empty titles and no errors", not empty and not errs, [empty, errs[:3]])
        ctx.close()
    b.close()

failed = [r for r in results if not r[1]]
print(f"\n{len(results) - len(failed)}/{len(results)} passed")
sys.exit(1 if failed else 0)
