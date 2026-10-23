"""DMAIC tool (modules/dmaic.html) — 2026-10-16. Same style as tests/a3/test_a3.py.
Covers: shared engine (eight files) and layer identity, AR/EN and RTL/LTR, tabs, kit links both ways, self-assessment, the DMAIC project
(validation, the five phases with a gate each, the phase map, the sponsor not the lead, CTQs and the SIPOC of 5–7 steps, the goal rule —
written before the analysis, changed only with a reason —, the operational definition and the measurement check before the baseline, the
computed mean, median and defect rate, the baseline and after-change run charts (mirrored for Arabic), causes with the two-group data check
and the person-only flag, solutions tied to proved causes and piloted, the control plan, the after-change result, the hand-over, the gates),
records, audit (12 checks), dashboard, report with the charts and CSV, persistence, example data, clear all, a record with missing parts,
the read-only starts from A3, RCA and Pareto (other tools only read), causes picked from Fishbone, 5 Whys and RCA with previews, the
?open= / ?a3= / ?rca= / ?pareto= requests and the hub hint, the Fishbone / 5 Whys / RCA starts, the A3 panel, PDCA and CAPA links, the
assistant, the guided tour, keyboard use and 390 px with the stacked phases.
Served over http when the platform server runs (CIA_BASE, default http://127.0.0.1:8802); DM_FILE=1 forces file:// URLs.
Usage: python3 tests/dmaic/test_dmaic.py"""
import os, sys, json, re
from playwright.sync_api import sync_playwright
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
MOD = os.path.join(ROOT, "modules")
BASE = "file://" + ROOT
if not os.environ.get("DM_FILE"):
    import urllib.request
    _b = os.environ.get("CIA_BASE", "http://127.0.0.1:8802")
    try:
        urllib.request.urlopen(_b + "/modules/dmaic.html", timeout=3).read(64); BASE = _b
    except Exception:
        pass
URL = BASE + "/modules/dmaic.html"
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
FILES = ["pdca", "capa", "five-whys", "fishbone", "pareto", "rca", "a3", "dmaic"]
src = {f: read(os.path.join(MOD, f + ".html")) for f in FILES}
dm, tpl = src["dmaic"], read(os.path.join(ROOT, "templates", "explain-kit-template.html"))
e = [engine(src[f]) for f in FILES]
check("engine block present once in the eight toolbox files", all(x is not None for x in e))
check("engine block identical in the eight files and to tests/build/engine.js", len(set(e)) == 1 and e[0] == read(os.path.join(ROOT, "tests", "build", "engine.js")).rstrip("\n"))
for tag, id_ in (("style", "cia-explain-kit-css"), ("script", "cia-explain-kit-js")):
    check(f"dmaic.html {id_} byte-identical to the template", block(dm, tag, id_) == block(tpl, tag, id_))
norm = lambda x: re.sub(r"var CFG=\{.*?\};", "var CFG={};", x or "", count=1)
check("tour script identical to a3.html apart from CFG", norm(block(dm, "script", "cia-tour-js")) == norm(block(src["a3"], "script", "cia-tour-js")) and block(dm, "script", "cia-tour-js") != block(src["a3"], "script", "cia-tour-js"))
check("tour CSS identical to a3.html", block(dm, "style", "cia-tour-css") == block(src["a3"], "style", "cia-tour-css"))
check("tour CFG names dmaic and guards the example", 'var CFG={"file": "dmaic", "hasEx": true, "guard": {"pfEx": "all"}};' in dm)
i0 = dm.find("DMAIC tool — host logic")
check("storage key and schema documented at the top of the host script", 'STORE="cia-dmaic:v1"' in dm and "Schema:" in dm[i0:i0 + 7000] and '"cia-a3:v1"' in dm[i0:i0 + 7000])
check("DMAIC never writes another tool's key; no other tool writes the DMAIC key",
      not re.search(r"(localStorage\.setItem|TBX\.save)\((A3_KEY|RCA_KEY|CAPA_KEY|PARETO_KEY|FISH_KEY|WHY5_KEY|PDCA_KEY|['\"]cia-(a3|rca|capa|pareto|fish|why5|pdca):v1)", dm) and not re.search(r"setItem\((DM_KEY|STORE_DM|['\"]cia-dmaic:v1)", "".join(src[f] for f in FILES[:-1])))
check("sidebar buttons carry data-go and data-t", all(f'data-go="{t}" data-t="{t}"' in dm for t in TABS))
check("DM code badge and the DMAIC hero code", '<div class="brand-mark" aria-hidden="true">DM</div>' in dm and '<div class="std-code">DMAIC<small' in dm)
check("A3 carries the read-only DMAIC panel and only reads cia-dmaic:v1", 'DM_KEY="cia-dmaic:v1"' in src["a3"] and 'id="dmBox"' in src["a3"] and not re.search(r"setItem\(DM_KEY", src["a3"]))
def own(s):
    """the tool's own code: without the shared blocks of step 15 (organization kit, readers, link panels)"""
    for i in ("cia-org-js", "cia-readers-js", "cia-linkui-js", "cia-links-cfg"):
        a = s.find('<script id="%s"' % i)
        if a >= 0: s = s[:a] + s[s.find("</script>", a) + 9:]
    return s
check("RCA, PDCA and CAPA unchanged in this step (no DMAIC reference)", all("cia-dmaic" not in own(src[f]) for f in ("rca", "pdca", "capa", "pareto", "fishbone", "five-whys")))

with sync_playwright() as p:
    b = p.chromium.launch()

    def page_new(lang="ar", w=1280, h=900, url=URL):
        ctx = b.new_context(viewport={"width": w, "height": h}, accept_downloads=True)
        pg = ctx.new_page(); errs = []
        pg.on("pageerror", lambda e: errs.append("pageerror: " + str(e)))
        pg.on("console", lambda m: errs.append("console." + m.type + ": " + m.text) if (m.type == "error" and "Failed to load resource" not in m.text) else None)
        pg.route(re.compile(r"fonts\.(googleapis|gstatic)\.com"), lambda r: r.abort())
        init = ("try{if(!sessionStorage.getItem('t0')){sessionStorage.setItem('t0','1');localStorage.setItem('cia-lang','%s');" % lang +
                "['dmaic','a3','rca','pareto','fishbone','five-whys','capa','pdca'].forEach(function(k){localStorage.setItem('cia-tour:m:'+k,'done');});localStorage.setItem('cia-tour:v1','done');}}catch(e){}")
        pg.add_init_script(init)
        pg.add_init_script("window.__opened=[]; window.open=function(u){ window.__opened.push(String(u)); return null; };")
        pg.on("dialog", lambda d: d.accept())
        pg.goto(url); pg.wait_for_timeout(350)
        return ctx, pg, errs

    def load_ex(pg): pg.evaluate("go('docs')"); pg.click("#pfEx"); pg.wait_for_function("document.querySelectorAll('#docsBox tbody tr').length===3", timeout=5000)
    def load_other(pg, f): pg.goto(M(f)); pg.wait_for_timeout(350); pg.evaluate("go('docs')"); pg.click("#pfEx"); pg.wait_for_timeout(300)
    def last_bot(pg): return pg.evaluate("[...document.querySelectorAll('#cbBody .cb-msg.bot')].pop().innerText")
    def stage(pg): return pg.inner_text("#curStage")
    def hidden(pg, id_): return pg.evaluate(f"document.getElementById('{id_}').hidden")
    def gate(pg, ph, date, by, q, dec):
        pg.fill(f"#g-{ph}-date", date); pg.fill(f"#g-{ph}-by", by); pg.fill(f"#g-{ph}-q", q); pg.select_option(f"#g-{ph}-dec", dec); pg.wait_for_timeout(60)

    # ---- 1. identity, method tab, kit
    ctx, pg, errs = page_new("ar")
    check("loads in Arabic RTL", pg.evaluate("document.documentElement.dir") == "rtl" and pg.evaluate("document.documentElement.lang") == "ar")
    check("header: home button, DM badge, Arabic brand line, language button", pg.evaluate("!!document.getElementById('ciaHomeBtn')") and pg.inner_text(".brand-mark") == "DM" and "أكاديمية التحسين المستمر" in pg.inner_text("#brandBy") and pg.inner_text("#langLabel") == "English")
    check("hero shows the academy logo and the author", pg.evaluate("document.querySelector('.hero-logo').src.startsWith('data:image')") and "مدثر سلامه" in pg.inner_text(".hero .author"))
    check("related tools strip: A3, RCA, Pareto, Fishbone, 5 Whys, CAPA, PDCA", pg.evaluate("[...document.querySelectorAll('#homeStd a')].map(a=>a.getAttribute('href'))") == ["./a3.html", "./rca.html", "./pareto.html", "./fishbone.html", "./five-whys.html", "./capa.html", "./pdca.html"])
    check("launch tiles for the nine tabs after home", pg.evaluate("document.querySelectorAll('#launchGrid a').length") == 9)
    check("sidebar icons are SVG with tinted tiles", pg.evaluate("[...document.querySelectorAll('#side button .ic')].every(x=>x.querySelector('svg')&&x.style.background)"))
    check("AI tab is labelled under construction", "قيد البناء" in pg.evaluate("document.querySelector('.tabpane[data-tab=\"ai\"]').innerText"))
    pg.click('#side button[data-go="explain-std"]'); pg.wait_for_timeout(150)
    term = pg.inner_text("#dmTerm")
    check("method tab says once that DMAIC is a method, not a clause, and names the five phases", pg.evaluate("document.querySelectorAll('#dmTerm').length") == 1 and "وليس بنداً في أي مواصفة" in term and all(x in term for x in ["التعريف", "القياس", "التحليل", "التحسين", "الضبط"]))
    check("method tab cites 0.3.2 and the note to 9.1.3 (statistical techniques) as explanation, not requirement", "0.3.2" in term and "9.1.3" in term and "تقنيات إحصائية" in term and "شرح وليست متطلبات" in term)
    check("method tab: cause unknown, known solution is a project, goal not moved, trusted measure, simple tools, gates by the sponsor",
          "الحل المعروف فمشروع تنفيذ لا DMAIC" in term and "ولا يُحرَّك" in term and "لا يُوثق به يجعل كل مرحلة بعده غير موثوقة" in term and "الأدوات البسيطة تكفي" in term and "يجريها الراعي بالأسئلة" in term)
    check("method tab: DMAIC uses the toolbox (Pareto, Fishbone, 5 Whys, RCA, A3, PDCA, CAPA)", "يستخدم صندوق الأدوات ولا يحل محله" in term and all(x in term for x in ["باريتو", "عظمة السمكة", "لماذا الخمس", "RCA", "A3", "PDCA", "CAPA"]))
    check("term cards: ISO 9000:2026 3.10.2, 3.3.1, 3.11.4, 3.7.11, 4.2.7; Six Sigma / ISO 13053 not verified", all(c in term for c in ["3.10.2", "3.3.1", "3.11.4", "3.7.11", "4.2.7"]) and "ملخص تفسيري" in term and "ISO 13053" in term and "غير متحقق منه" in term)
    std = pg.evaluate("document.getElementById('ex-std-box').innerText")
    check("method guide renders with roles and steps", len(std) > 400 and "من يعمل في مشروع DMAIC" in std and "خطوات مشروع DMAIC" in std, len(std))
    pg.evaluate("location.hash='#explain-cl'"); pg.wait_for_timeout(250)
    check("clause guide index shows 8 sections and the cycle diagram", pg.evaluate("document.querySelectorAll('#ex-cl-box .ex-idx [data-ex-sec]').length") == 8 and pg.evaluate("document.querySelectorAll('#ex-cl-box svg .ex-seg').length") == 8)
    info = pg.evaluate("({n:CIAEX.items.length, q:CIAEX.items.filter(i=>/^[A-Z]{2}\\d$/.test(i.q)).length, off:CIAEX.items.filter(i=>i.q==='x:tools').length})")
    check("kit: 24 items, 12 linked to the 12 questions, 12 outside the assessment", info == {"n": 24, "q": 12, "off": 12}, info)
    check("every question has an item", pg.evaluate("AQ.every(q=>CIAEX.items.some(i=>i.q===q[0]))"))
    it = pg.evaluate("CIAEX.open('7.1.5.1'), document.querySelector('#ex-d-body .ex-it.open').innerText")
    check("7.1.5.1: valid and reliable results, A.7.1.5, checked before the baseline, interpretive summary", "صحيحة وموثوقة" in it and "A.7.1.5" in it and "قبل الأساس" in it and "ملخص تفسيري" in it)
    it = pg.evaluate("CIAEX.open('9.1.3'), document.querySelector('#ex-d-body .ex-it.open').innerText")
    check("9.1.3: the note on statistical techniques, data not vote", "تقنيات إحصائية" in it and "التصويت" in it)
    it = pg.evaluate("CIAEX.open('GD-1'), document.querySelector('#ex-d-body .ex-it.open').innerText")
    check("GD-1: when DMAIC fits, marked as guidance", "الحل المعروف" in it and "إرشاد تطبيقي" in it)
    pg.keyboard.press("Escape"); pg.wait_for_timeout(150)
    check("meta.verified names the date, the source files and what is not verified",
          "2026-10-16" in pg.evaluate("EXPLAIN_DMAIC.meta.verified.ar") and all(x in pg.evaluate("EXPLAIN_DMAIC.meta.verified.en") for x in ["ISO_9001_2026en 1.pdf", "ISO 9000-2026.pdf", "not verified", "ISO 13053", "Six Sigma"]))
    check("ui labels set", pg.evaluate("['roles','wheelT','purpose','smap','assess','assessOff','offGo','actCtx'].every(k=>EXPLAIN_DMAIC.ui.ar[k]&&EXPLAIN_DMAIC.ui.en[k])") and pg.evaluate("EXPLAIN_DMAIC.ui.en.offGo") == "Open the DMAIC project")
    pg.evaluate("go('explain-cl')"); pg.evaluate("CIAEX.open('7.1.5.1')"); pg.wait_for_timeout(120)
    pg.evaluate("document.querySelector('#ex-d-body .ex-it.open [data-ex-assess]').click()"); pg.wait_for_timeout(500)
    check("'Assess this' lands on question ME2, highlighted", pg.evaluate("curTab") == "assess" and pg.evaluate("!!document.querySelector('.ex-aq[data-id=\"ME2\"].ex-hl')"))
    pg.evaluate("go('explain-cl')"); pg.evaluate("CIAEX.open('0.3.2')"); pg.wait_for_timeout(120)
    off = pg.evaluate("(()=>{const it=document.querySelector('#ex-d-body .ex-it.open'); return {note:!!it.querySelector('.ex-act-off'), btn:!!it.querySelector('[data-ex-go=\"tools\"]')};})()")
    check("item outside the assessment shows the note and a button to the project", off == {"note": True, "btn": True}, off)
    pg.keyboard.press("Escape"); pg.wait_for_timeout(150)
    pg.evaluate("go('assess')"); pg.wait_for_timeout(150)
    check("'Explain' back-link on each of the 12 questions", pg.evaluate("document.querySelectorAll('#asList .ex-qx[data-ex-q]').length") == 12)
    pg.evaluate("go('explain-std')"); pg.wait_for_timeout(120)
    pg.click("#langBtn"); pg.wait_for_timeout(250)
    check("language switch re-renders the open method guide in English", "Who works on a DMAIC project" in pg.evaluate("document.getElementById('ex-std-box').innerText") and pg.evaluate("document.documentElement.dir") == "ltr")
    pg.click("#langBtn"); pg.wait_for_timeout(250)
    check("and back to Arabic", "من يعمل في مشروع DMAIC" in pg.evaluate("document.getElementById('ex-std-box').innerText"))
    check("no errors so far", not errs, errs[:3]); del errs[:]

    # ---- 2. self-assessment
    pg.evaluate("go('assess')"); pg.wait_for_timeout(100)
    check("12 questions in 6 phases (Define, Measure, Analyse, Improve, Control, Gates)", pg.evaluate("document.querySelectorAll('#asList .pd-q').length") == 12 and pg.evaluate("AGROUPS.join()") == "DF,ME,AN,IM,CT,GT")
    pg.check('input[name="as-DF1"][value="2"]'); pg.check('input[name="as-ME2"][value="1"]'); pg.wait_for_timeout(80)
    check("answers saved and scored (3 of 24 = 13%), a score per phase", pg.inner_text("#asPct") == "13%" and json.loads(pg.evaluate("localStorage.getItem('cia-dmaic:v1')"))["assess"] == {"DF1": 2, "ME2": 1} and pg.evaluate("assessScore('DF')") == 33)
    pg.click("#asReset"); pg.wait_for_timeout(80)
    check("clear answers", pg.inner_text("#asPct") == "0%")

    # ---- 3. the project: phases, gates, rules
    pg.evaluate("go('tools')"); pg.wait_for_timeout(100)
    check("five phases in order, each with a gate, and a phase map of five", pg.evaluate("[...document.querySelectorAll('#stages .dm-ph')].map(x=>x.id).join()") == "ph-D,ph-M,ph-A,ph-I,ph-C" and pg.evaluate("document.querySelectorAll('#stages .dm-gate').length") == 5 and pg.evaluate("document.querySelectorAll('#caSteps .dm-map li').length") == 5)
    check("new project is in Define", "التعريف" in stage(pg))
    pg.click("#saveBtn"); pg.wait_for_timeout(80)
    check("save without a title is refused", pg.inner_text("#recErr") == "أدخل عنواناً مختصراً للمشروع.")
    pg.fill("#f-title", "Late deliveries"); pg.fill("#f-ref", "NCR-T-9"); pg.fill("#f-lead", "Ali"); pg.fill("#f-sponsor", "Ali"); pg.wait_for_timeout(60)
    check("sponsor equal to the lead is flagged", not hidden(pg, "spWarn"))
    pg.fill("#f-sponsor", "Sara"); pg.fill("#f-owner", "Omar"); pg.fill("#f-start", "2026-09-01")
    pg.fill("#f-problem", "Deliveries arrive late."); pg.fill("#f-cost", "SAR 20,000 a month"); pg.fill("#f-customer", "Site team")
    for k in range(5): pg.click('[data-add="ctq"]')
    check("five CTQs at most", pg.evaluate("document.querySelectorAll('#ctqRows tr').length") == 5 and pg.evaluate("document.querySelector('[data-add=\"ctq\"]').disabled"))
    for k in range(4): pg.evaluate("document.querySelector('#ctqRows tr:last-child [data-rdel]').click()")
    pg.fill('#ctqRows tr:nth-child(1) [data-k="t"]', "On-time delivery"); pg.fill('#ctqRows tr:nth-child(1) [data-k="spec"]', "Within the agreed slot")
    pg.fill("#f-scin", "Deliveries to site A"); pg.fill("#f-scout", "Site B"); pg.fill("#f-sips", "Supplier"); pg.fill("#f-sipi", "Orders"); pg.fill("#f-sipo", "Delivered goods"); pg.fill("#f-sipc", "Site team")
    for i in range(4):
        pg.click('[data-add="stp"]'); pg.fill(f'#stpRows tr:nth-child({i+1}) [data-k="t"]', f"Step {i+1}")
    pg.wait_for_timeout(60)
    check("a SIPOC with 4 steps is flagged (5 to 7 needed)", not hidden(pg, "stpWarn") and "4" in pg.inner_text("#stpWarn"))
    pg.click('[data-add="stp"]'); pg.fill('#stpRows tr:nth-child(5) [data-k="t"]', "Step 5"); pg.wait_for_timeout(60)
    check("5 steps clear the flag; the SIPOC table is drawn with five columns", hidden(pg, "stpWarn") and pg.evaluate("document.querySelectorAll('#sipPrev .dm-sip thead tr:first-child th').length") == 5 and pg.evaluate("document.querySelectorAll('#sipPrev ol li').length") == 5)
    pg.click('[data-add="stp"]'); pg.click('[data-add="stp"]')
    check("seven steps at most", pg.evaluate("document.querySelector('[data-add=\"stp\"]').disabled"))
    pg.evaluate("document.querySelector('#stpRows tr:last-child [data-rdel]').click()"); pg.evaluate("document.querySelector('#stpRows tr:last-child [data-rdel]').click()")
    pg.fill("#f-gmeasure", "Late deliveries %"); pg.fill("#f-gfrom", "12"); pg.fill("#f-gto", "4"); pg.fill("#f-gby", "2026-12-31"); pg.fill("#f-gdate", "2026-09-05"); pg.fill("#f-andate", "2026-09-03"); pg.wait_for_timeout(60)
    check("goal written after the analysis started is flagged and keeps the project in Define", not hidden(pg, "lateWarn") and "التعريف" in stage(pg) and "خفض" in pg.inner_text("#goalDir"))
    pg.fill("#f-gdate", "2026-09-02"); pg.wait_for_timeout(60)
    check("goal before the analysis: Define complete, waiting for the gate", hidden(pg, "lateWarn") and "التعريف" in stage(pg) and pg.evaluate("document.querySelector('#caSteps li').className") == "wait" and "تنتظر بوابة الراعي" in pg.inner_text("#gn-D"))
    pg.fill("#f-gorig", "3"); pg.wait_for_timeout(60)
    check("goal changed without a reason is flagged", not hidden(pg, "chgWarn") and pg.evaluate("document.querySelector('#caSteps li').className") == "cur")
    pg.fill("#f-gwhy", "The contract changed the slot"); pg.wait_for_timeout(60)
    gate(pg, "D", "2026-09-03", "Ali", "Is the cause unknown?", "go")
    check("a gate recorded under the lead's name does not count", "التعريف" in stage(pg) and "باسم قائد المشروع" in pg.inner_text("#gn-D"))
    gate(pg, "D", "2026-09-03", "Sara", "Is the cause unknown? Is the goal dated?", "go")
    check("sponsor's gate passed -> Measure; Define shown done on the map", "القياس" in stage(pg) and pg.evaluate("document.querySelector('#caSteps li').className") == "done")
    pg.fill("#f-what", "Deliveries after the slot / all deliveries"); pg.fill("#f-unit", "%"); pg.fill("#f-source", "Gate log"); pg.fill("#f-sample", "All deliveries, weekly")
    pg.select_option("#f-mmethod", "attr"); pg.fill("#f-mres", "2 clerks agreed on 28 of 30"); pg.fill("#f-mrule", "Pass at 90%"); pg.select_option("#f-mverd", "fail"); pg.fill("#f-mdate", "2026-09-10"); pg.wait_for_timeout(60)
    check("a measurement that cannot be trusted is flagged", not hidden(pg, "msaFailW"))
    pg.select_option("#f-mverd", "pass"); pg.fill("#f-bdate", "2026-09-08"); pg.fill("#f-bperiod", "July–August 2026"); pg.wait_for_timeout(60)
    check("a check dated after the baseline is flagged (the check comes first)", hidden(pg, "msaFailW") and not hidden(pg, "msaLateW"))
    pg.fill("#f-bdate", "2026-09-11"); pg.wait_for_timeout(40)
    check("rate data: defects and units shown, measured value hidden; chart asks for 4 points", pg.evaluate("document.getElementById('bpW').classList.contains('k-rate')") and "4 نقاط" in pg.evaluate("document.getElementById('bChart').textContent"))
    for i, (d, n) in enumerate([("2", "40"), ("4", "40"), ("3", "30"), ("1", "50")]):
        pg.click('[data-add="bp"]'); pg.fill(f'#bpRows tr:nth-child({i+1}) [data-k="l"]', f"W{i+1}"); pg.fill(f'#bpRows tr:nth-child({i+1}) [data-k="d"]', d); pg.fill(f'#bpRows tr:nth-child({i+1}) [data-k="n"]', n)
    pg.wait_for_timeout(80)
    bs = pg.evaluate("(r=>{const o=baseStats(r); return [o.n,o.mean,o.median,Math.round(o.rate*100)/100,o.defects,o.units];})(formToRec())")
    check("computed baseline: 4 points, mean 6.75, median 7.5, defect rate 6.25% (10 of 160)", bs == [4, 6.75, 7.5, 6.25, 10, 160], bs)
    st = pg.inner_text("#bStats")
    check("baseline figures shown with the rate per point", "6.75" in st and "7.5" in st and "6.3%" in st and pg.evaluate("[...document.querySelectorAll('#bpRows [data-calc]')].map(c=>c.textContent).join()") == "5.0,10.0,10.0,2.0", st)
    xs = pg.evaluate("[...document.querySelectorAll('#bChart svg circle')].map(c=>+c.getAttribute('cx'))")
    check("baseline run chart: 4 points, median and goal lines, mirrored for Arabic (first point on the right)", len(xs) == 4 and xs[0] > xs[-1] and pg.evaluate("document.querySelectorAll('#bChart svg line[stroke-dasharray]').length") == 2, xs)
    gate(pg, "M", "2026-09-12", "Sara", "Can we trust the gate log?", "go")
    check("Measure gate passed -> Analyse", "التحليل" in stage(pg))
    pg.click('[data-add="cz"]'); pg.fill('#czCards .dm-card:nth-child(1) [data-k="t"]', "خطأ بشري من السائق"); pg.wait_for_timeout(60)
    check("cause naming a person only is flagged", "يشير إلى شخص فقط" in pg.inner_text('#czCards .dm-card:nth-child(1) [data-flag]') and not hidden(pg, "personWarn"))
    pg.fill('#czCards .dm-card:nth-child(1) [data-k="t"]', "Dispatch plan has no cut-off time"); pg.select_option('#czCards .dm-card:nth-child(1) [data-k="st"]', "conf"); pg.wait_for_timeout(60)
    check("'proved' with no data check is flagged and does not count", "التصويت لا يثبت" in pg.inner_text('#czCards .dm-card:nth-child(1) [data-flag]') and "التحليل" in stage(pg) and pg.inner_text('#czCards .dm-card:nth-child(1) [data-code]') == "R1")
    c1 = '#czCards .dm-card:nth-child(1) '
    pg.select_option(c1 + '[data-k="kind"]', "rate"); pg.fill(c1 + '[data-k="ga"]', "Left after 14:00"); pg.fill(c1 + '[data-k="xa"]', "12"); pg.fill(c1 + '[data-k="na"]', "100")
    pg.fill(c1 + '[data-k="gb"]', "Left before 14:00"); pg.fill(c1 + '[data-k="xb"]', "3"); pg.fill(c1 + '[data-k="nb"]', "100"); pg.wait_for_timeout(60)
    ck = pg.inner_text(c1 + "[data-ckres]")
    check("two-group rate check: 12% against 3%, difference 9.0 points, z shown, unlikely to be chance", "12.0%" in ck and "3.0%" in ck and "9.0" in ck and "z = 2." in ck and "يصعب أن يكون مصادفة" in ck, ck)
    check("cause proved with data -> Analyse complete, waiting for the gate", pg.evaluate("proved(formToRec()).length") == 1 and pg.evaluate("document.querySelectorAll('#caSteps li')[2].className") == "wait")
    pg.click('[data-add="cz"]'); c2 = '#czCards .dm-card:nth-child(2) '
    pg.fill(c2 + '[data-k="t"]', "Trucks wait at the gate"); pg.select_option(c2 + '[data-k="st"]', "out"); pg.select_option(c2 + '[data-k="kind"]', "mean")
    pg.fill(c2 + '[data-k="ga"]', "Long wait"); pg.fill(c2 + '[data-k="xa"]', "5.1"); pg.fill(c2 + '[data-k="na"]', "8"); pg.fill(c2 + '[data-k="sa"]', "1")
    pg.fill(c2 + '[data-k="gb"]', "Short wait"); pg.fill(c2 + '[data-k="xb"]', "5"); pg.fill(c2 + '[data-k="nb"]', "8"); pg.fill(c2 + '[data-k="sb"]', "1"); pg.wait_for_timeout(60)
    ck2 = pg.inner_text(c2 + "[data-ckres]")
    check("two-group mean check rules a cause out with data (SD field shown for means)", "استُبعد بالبيانات" in ck2 and "0.1" in ck2 and pg.evaluate("getComputedStyle(document.querySelector('" + c2 + ".dm-f-sa')).display") != "none" and pg.evaluate("formToRec().an.causes[1].st") == "out", ck2)
    check("cause summary counts 1 proved, 0 hypothesis, 1 ruled out", "1 مثبت بالبيانات" in pg.inner_text("#czSum") and "1 مستبعد" in pg.inner_text("#czSum"))
    gate(pg, "A", "2026-09-15", "Sara", "What is the difference, and is the sample enough?", "go")
    check("Analyse gate passed -> Improve", "التحسين" in stage(pg))
    pg.click('[data-add="so"]'); s1 = '#soCards .dm-card:nth-child(1) '
    pg.fill(s1 + '[data-k="t"]', "Cut-off at 13:00"); pg.wait_for_timeout(60)
    fl = pg.inner_text(s1 + "[data-flag]")
    check("solution not tied and not piloted is flagged", "غير مرتبط" in fl and "لم يُجرَّب" in fl, fl)
    opts = pg.evaluate("[...document.querySelectorAll('" + s1 + "[data-k=\"cause\"] option')].map(o=>o.textContent)")
    check("cause list offers only live causes, with the proved mark", any(o.startswith("R1 ✓") for o in opts) and not any(o.startswith("R2") for o in opts), opts)
    pg.select_option(s1 + '[data-k="cause"]', "c1"); pg.fill(s1 + '[data-k="where"]', "Depot 1"); pg.fill(s1 + '[data-k="from"]', "2026-09-16"); pg.fill(s1 + '[data-k="to"]', "2026-09-30"); pg.fill(s1 + '[data-k="val"]', "3.5"); pg.wait_for_timeout(60)
    check("pilot result computed against the goal (3.5 against 12 -> 4: met)", "تحقق الهدف" in pg.inner_text(s1 + "[data-pres]"))
    pg.fill(s1 + '[data-k="risk"]', "Late orders"); pg.fill(s1 + '[data-k="ctrl"]', "Order cut-off in the ERP"); pg.select_option(s1 + '[data-k="dec"]', "roll"); pg.wait_for_timeout(60)
    check("solution tied, piloted, risks controlled -> Improve complete", pg.evaluate("impOk(formToRec())") and pg.inner_text(s1 + "[data-code]") == "S1")
    pg.fill(s1 + '[data-k="from"]', "2026-10-30"); pg.click("#saveBtn"); pg.wait_for_timeout(60)
    check("pilot starting after it ends is refused", pg.inner_text("#recErr") == "بداية التجربة لا تأتي بعد نهايتها.")
    pg.fill(s1 + '[data-k="from"]', "2026-09-16")
    gate(pg, "I", "2026-10-01", "Sara", "Did the pilot reach the goal?", "go")
    check("Improve gate passed -> Control", "الضبط" in stage(pg))
    pg.click('[data-add="cp"]'); pg.fill('#cpRows tr:nth-child(1) [data-k="m"]', "Late deliveries %"); pg.wait_for_timeout(60)
    check("control plan line without owner, frequency or reaction is flagged", not hidden(pg, "cpWarn"))
    pg.fill('#cpRows tr:nth-child(1) [data-k="target"]', "Below 4%"); pg.fill('#cpRows tr:nth-child(1) [data-k="freq"]', "Weekly"); pg.fill('#cpRows tr:nth-child(1) [data-k="who"]', "Omar"); pg.fill('#cpRows tr:nth-child(1) [data-k="react"]', "Two weeks above 4%: call the depot"); pg.wait_for_timeout(60)
    check("complete control plan line", hidden(pg, "cpWarn"))
    pg.fill("#f-ameasure", "Something else"); pg.wait_for_timeout(40)
    check("a different after-change measure is flagged", not hidden(pg, "sameWarn"))
    pg.fill("#f-ameasure", "Late deliveries %"); pg.check("#f-asame"); pg.fill("#f-afrom", "2026-10-02"); pg.fill("#f-ato", "2026-10-29")
    for i, (d, n) in enumerate([("1", "50"), ("2", "50"), ("1", "50"), ("2", "50")]):
        pg.click('[data-add="ap"]'); pg.fill(f'#apRows tr:nth-child({i+1}) [data-k="l"]', f"A{i+1}"); pg.fill(f'#apRows tr:nth-child({i+1}) [data-k="d"]', d); pg.fill(f'#apRows tr:nth-child({i+1}) [data-k="n"]', n)
    pg.wait_for_timeout(80)
    check("after-change result computed: 6 of 200 = 3% against 4 -> met", "تحقق الهدف" in pg.inner_text("#aSugg") and abs(pg.evaluate("afterKey(formToRec())") - 3) < 1e-9)
    check("after-change run chart with the baseline median as reference, and the run reading", pg.evaluate("document.querySelectorAll('#aChart svg circle').length") == 4 and pg.evaluate("document.querySelectorAll('#aChart svg line[stroke-dasharray]').length") == 3 and "وسيط الأساس" in pg.inner_text("#runInfo"))
    pg.select_option("#f-ares", "met"); pg.wait_for_timeout(40)
    check("result recorded, standardisation asked for", not hidden(pg, "stdWarn") and "الضبط" in stage(pg))
    pg.fill("#f-astd", "Dispatch procedure rev 2"); pg.fill("#f-handto", "Omar"); pg.fill("#f-hdate", "2026-10-30")
    gate(pg, "C", "2026-10-31", "Sara", "Who owns the control plan now?", "go")
    check("hand-over dated and Control gate passed -> closed; map all done", "أُغلق بالتسليم" in stage(pg) and pg.evaluate("[...document.querySelectorAll('#caSteps li')].every(li=>li.className==='done')"))
    pg.fill("#f-afrom", "2026-11-30"); pg.click("#saveBtn"); pg.wait_for_timeout(60)
    check("after-change period starting after it ends is refused", pg.inner_text("#recErr") == "بداية فترة ما بعد التغيير لا تأتي بعد نهايتها.")
    pg.fill("#f-afrom", "2026-10-02"); pg.click("#saveBtn"); pg.wait_for_timeout(80)
    rid = pg.evaluate("document.getElementById('rid').value")
    check("saved with a DM-2026-NNN id", rid == "DM-2026-001" and "تم حفظ المشروع" in pg.inner_text("#recOk"), rid)
    stv = json.loads(pg.evaluate("localStorage.getItem('cia-dmaic:v1')"))["records"][0]
    check("stored record keeps every phase", stv["goal"]["orig"] == 3 and len(stv["def"]["sip"]["steps"]) == 5 and stv["meas"]["pts"][0] == {"l": "W1", "d": 2, "n": 40, "v": None} and stv["an"]["causes"][0]["chk"]["xa"] == 12 and stv["imp"]["sols"][0]["cause"] == "c1" and stv["ctl"]["same"] is True and stv["gates"]["C"]["by"] == "Sara")
    pg.reload(); pg.wait_for_timeout(350)
    check("persists after reload", pg.evaluate("DB.records.length") == 1 and pg.evaluate("stageOf(DB.records[0])") == "closed")
    check("audit: 12 checks, all pass on the complete project", pg.evaluate("CHECKS.length") == 12 and pg.evaluate("Object.values(auditRecord(DB.records[0])).every(v=>v===true)"))
    pg.evaluate("var r=JSON.parse(JSON.stringify(DB.records[0])); r.gates.I.dec='stop'; window.__s=stageOf(fixRec(r));")
    check("a stop decision at a gate stops the project", pg.evaluate("window.__s") == "stop")
    check("no errors in the project flow", not errs, errs[:3]); del errs[:]
    pg.evaluate("go('tools')"); pg.focus("#f-title"); pg.keyboard.press("Tab")
    check("keyboard: Tab moves from the title to the next field", pg.evaluate("document.activeElement.id") == "f-ref")
    pg.focus('#side button[data-go="docs"]'); pg.keyboard.press("Enter"); pg.wait_for_timeout(100)
    check("keyboard: Enter on a sidebar button opens its tab", pg.evaluate("curTab") == "docs")
    ctx.close()

    # ---- 4. example, records, dashboard, report, CSV, clear all
    ctx, pg, errs = page_new("ar")
    load_ex(pg)
    S = pg.evaluate("DB.records.map(r=>[r.id,stageOf(r),suggest(r),r.ctl.res])")
    check("example: concrete closed (met), formwork in Analyse, calibration closed (partly met)",
          S == [["DM-EX-01", "closed", "met", "met"], ["DM-EX-02", "A", "", ""], ["DM-EX-03", "closed", "part", "part"]], S)
    check("example links: A3-EX-01, RC-EX-01, PA-EX-02/k1, CA-EX-04, PD-EX-03; PA-EX-03/k4; CA-EX-02, PD-EX-02",
          pg.evaluate("DB.records.map(r=>[r.a3,r.rca,r.pareto,r.pcat,r.capa,r.pdca].join('|'))") == ["A3-EX-01|RC-EX-01|PA-EX-02|k1|CA-EX-04|PD-EX-03", "||PA-EX-03|k4||", "||||CA-EX-02|PD-EX-02"])
    check("concrete: baseline 20 of 335 (6.0%) over July–August, thermometer check before the baseline, after-change 2.4% against below 3%",
          pg.evaluate("(r=>{const b=baseStats(r); return [b.defects,b.units,Math.round(b.rate*10)/10,r.meas.msa.date<r.meas.date,r.meas.msa.method,Math.round(afterKey(r)*10)/10,r.goal.to];})(DB.records[0])") == [20, 335, 6, True, "ref", 2.4, 3])
    check("concrete: chilled-water cause proved by comparing loads (z = 2.15), gate wait ruled out, plant check proved by RC-EX-01",
          pg.evaluate("DB.records[0].an.causes.map(c=>[c.st,c.chk.kind,chkRes(c).z===null?null:Math.round(chkRes(c).z*100)/100])") == [["conf", "rate", 2.15], ["out", "rate", -0.02], ["conf", "link", None]])
    check("concrete: pilot on one plant, met against the goal; control plan of three lines; next cycle PD-EX-03",
          pg.evaluate("(r=>[r.imp.sols.every(s=>s.where===r.imp.sols[0].where&&cmpGoal(r,s.val)==='met'),r.ctl.plan.length,r.ctl.next])(DB.records[0])") == [True, 3, "PD-EX-03"])
    check("formwork: measurement partly trusted (87%), one cause ruled out by data, no cause proved yet", pg.evaluate("(r=>[r.meas.msa.verdict,r.an.causes.filter(c=>c.st==='out'&&chkRes(c).ok).length,proved(r).length])(DB.records[1])") == ["part", 1, 0])
    check("example self-assessment 79%", pg.evaluate("assessScore()") == 79)
    check("records table lists three with flags and links", pg.evaluate("document.querySelectorAll('#docsBox tbody tr').length") == 3 and pg.evaluate("document.querySelectorAll('#docsBox [data-oa3]').length") == 1 and pg.evaluate("document.querySelectorAll('#docsBox [data-pdca]').length") == 2)
    au = pg.evaluate("auditRecord(DB.records[1])")
    check("audit of the project in Analyse: cause fails, later checks do not apply yet, gates pass", au["cause"] is False and au["sol"] is None and au["after"] is None and au["hand"] is None and au["gates"] is True, au)
    pg.evaluate("go('dash')"); pg.wait_for_timeout(100)
    k = pg.inner_text("#dKpis")
    check("dashboard: 3 projects, 67% goal met or partly met, 100% gates, 79% assessed", "67%" in k and "100%" in k and "79%" in k, k[:300])
    check("dashboard: two open items on the project in Analyse", pg.evaluate("openItems().length") == 2 and "لا سبب مثبت" in pg.inner_text("#dOpen"))
    rep = pg.evaluate("buildReportHTML()")
    check("report: cover with the author, three projects with phase maps, SIPOC, gates, audit, open items, self-assessment",
          "مدثر سلامه" in rep and rep.count('class="dm-map"') == 3 and rep.count('class="dm-sip"') == 3 and "مراجعات البوابات" in rep and "Audit results" in rep and "Open items" in rep and "Self-assessment" in rep)
    check("report carries the baseline and after-change run charts", rep.count("<svg") == 5 and "وسيط الأساس" in rep)
    csv = pg.evaluate("buildCSV()")
    check("CSV: BOM, header, three rows, baseline and computed result columns", csv.startswith("﻿") and len(csv.strip().split("\n")) == 4 and "computedResult" in csv and "baselineRate" in csv)
    pg.evaluate("go('report')")
    with pg.expect_download() as d: pg.click("#rpHtml")
    check("HTML report downloads", d.value.suggested_filename.startswith("DMAIC-report-"))
    with pg.expect_download() as d: pg.click("#rpCsv")
    check("CSV downloads", d.value.suggested_filename.endswith(".csv"))
    pg.click("#langBtn"); pg.wait_for_timeout(200)
    pg.evaluate("go('docs')"); pg.click("#pfEx"); pg.wait_for_timeout(300)
    check("English example loads in English", "Cut the remaining" in pg.evaluate("DB.records[0].title"))
    pg.evaluate("loadRecordIntoForm(DB.records[0]); go('tools')"); pg.wait_for_timeout(150)
    xs = pg.evaluate("[...document.querySelectorAll('#bChart svg circle')].map(c=>+c.getAttribute('cx'))")
    check("English run chart LTR (first point on the left)", pg.evaluate("document.documentElement.dir") == "ltr" and xs[0] < xs[-1])
    pg.evaluate("go('docs')"); pg.click("#pfReset"); pg.wait_for_timeout(200)
    check("clear all removes the data after confirmation", pg.evaluate("DB.records.length") == 0 and pg.evaluate("localStorage.getItem('cia-dmaic:v1')") is None)
    pg.evaluate("localStorage.setItem('cia-dmaic:v1', JSON.stringify({records:[{id:'X1',title:'Broken',def:'x',goal:null,meas:{pts:[{l:'a',d:'z'},null,5],msa:7},an:{causes:[{t:'a',chk:'q'},null]},imp:'no',ctl:{pts:'x',res:'abc'},gates:{D:3}}],assess:null}))")
    pg.reload(); pg.wait_for_timeout(350)
    txts = []
    for t in TABS:
        txts.append(pg.evaluate(f"(go('{t}'), document.querySelector('.tabpane[data-tab=\"{t}\"]').innerText)"))
    pg.evaluate("loadRecordIntoForm(DB.records[0]); go('tools')"); pg.wait_for_timeout(100)
    txts.append(pg.evaluate("document.querySelector('.tabpane.on').innerText"))
    check("a record with missing parts renders every tab without errors or undefined/NaN", not errs and not any(w in x for x in txts for w in ("undefined", "NaN", "[object Object]")), errs[:3])
    ctx.close()

    # ---- 5. links: starts from A3, RCA, Pareto; pick causes; A3 panel; requests
    ctx, pg, errs = page_new("ar")
    for f in ("a3", "rca", "capa", "pareto", "fishbone", "five-whys", "pdca"):
        load_other(pg, f)
    KEYS = "['cia-a3:v1','cia-rca:v1','cia-capa:v1','cia-pareto:v1','cia-fish:v1','cia-why5:v1','cia-pdca:v1']"
    before = pg.evaluate(f"JSON.stringify({KEYS}.map(k=>localStorage.getItem(k)))")
    pg.goto(URL); pg.wait_for_timeout(350)
    check("home strip counts what can be started from", not hidden(pg, "homeImp") and "3 صفحة A3" in pg.inner_text("#homeImpT"))
    pg.evaluate("go('tools')"); pg.click("#stPrev"); pg.wait_for_timeout(100)
    rows = pg.evaluate("[...document.querySelectorAll('#stTable tbody tr')].map(r=>r.innerText)")
    check("A3 preview: three A3s with their stage (A3's rule), goal, result and current condition", len(rows) == 3 and "روجعت مع الموجّه" in rows[0] and "تحقق جزئياً" in rows[0] and "9.2" in rows[0], rows[:1])
    pg.click('[data-sta3="A3-EX-01"]'); pg.wait_for_timeout(150)
    r = pg.evaluate("formToRec()")
    check("prefill from A3: links, lead, sponsor, problem, measure; goal left for the lead",
          r["a3"] == "A3-EX-01" and r["rca"] == "RC-EX-01" and r["capa"] == "CA-EX-04" and r["pareto"] == "PA-EX-02" and r["pdca"] == "PD-EX-03" and r["src"] == "a3" and r["lead"] and r["sponsor"] and r["def"]["problem"] and r["meas"]["unit"] == "%" and r["goal"]["to"] is None and r["id"] == "")
    check("prefill message: nothing written to A3, the A3's goal and result quoted", "لم يُكتب أي شيء في A3" in pg.inner_text("#recOk") and "تحقق جزئياً" in pg.inner_text("#recOk"))
    check("header preview of the A3 uses its stage, goal and current condition", "A3-EX-01" in pg.inner_text("#a3Info") and "روجعت مع الموجّه" in pg.inner_text("#a3Info") and "الوضع الحالي في A3" in pg.inner_text("#a3Info"))
    pg.select_option("#stSrc", "rca"); pg.click("#stPrev"); pg.wait_for_timeout(100)
    check("RCA preview lists the investigations with RCA's stages", pg.evaluate("document.querySelectorAll('#stTable [data-strca]').length") == 3 and "روجع التحقيق" in pg.inner_text("#stTable"))
    pg.click('[data-strca="RC-EX-01"]'); pg.wait_for_timeout(150)
    r = pg.evaluate("formToRec()")
    check("prefill from RCA: proved root causes come in proved by the linked analysis", r["rca"] == "RC-EX-01" and r["src"] == "rca" and len(r["an"]["causes"]) == 2 and all(c["st"] == "conf" and c["how"] == "rca" and c["chk"]["kind"] == "link" for c in r["an"]["causes"]) and "لم يُكتب أي شيء في RCA" in pg.inner_text("#recOk"))
    pg.select_option("#stSrc", "pareto"); pg.click("#stPrev"); pg.wait_for_timeout(100)
    pg.evaluate("document.querySelector('[data-stpa=\"PA-EX-02\"][data-cat=\"k1\"]').click()"); pg.wait_for_timeout(150)
    r = pg.evaluate("formToRec()")
    check("prefill from Pareto: category, period, Pareto baseline; message quotes value and share", r["pareto"] == "PA-EX-02" and r["pcat"] == "k1" and r["meas"]["pareto"] == "PA-EX-02" and r["meas"]["period"] == "2026-04-01 → 2026-05-31" and "14" in pg.inner_text("#recOk") and "%" in pg.inner_text("#recOk"))
    check("baseline chart drawn from the Pareto analysis, the chosen category marked", pg.evaluate("document.querySelectorAll('#bChart svg rect[rx=\"3\"]').length") >= 5 and pg.evaluate("[...document.querySelectorAll('#bChart svg rect[rx=\"3\"]')].some(x=>x.getAttribute('fill')==='#C2410C')"))
    pg.evaluate("clearForm()"); pg.select_option("#pkHow", "fish"); pg.fill("#pkRef", "FB-EX-02"); pg.wait_for_timeout(80)
    check("pick preview uses Fishbone's stage rule", "FB-EX-02" in pg.inner_text("#pkPv") and "السبب الجذري" in pg.inner_text("#pkPv"))
    pg.click("#pkUse"); pg.wait_for_timeout(80)
    cz = pg.evaluate("formToRec().an.causes.map(c=>[c.how,c.ref,c.st,c.chk.kind])")
    check("Fishbone cause added with its method and id; verified there, so proved by the linked analysis", cz == [["fish", "FB-EX-02", "conf", "link"]] and "أُضيف 1" in pg.inner_text("#pkMsg"), cz)
    pg.click("#pkUse"); pg.wait_for_timeout(60)
    check("picking again does not duplicate", pg.evaluate("formToRec().an.causes.length") == 1 and "موجودة" in pg.inner_text("#pkMsg"))
    pg.select_option("#pkHow", "why5"); pg.fill("#pkRef", "W5-EX-01"); pg.click("#pkUse"); pg.wait_for_timeout(60)
    pg.select_option("#pkHow", "rca"); pg.fill("#pkRef", "RC-EX-02"); pg.click("#pkUse"); pg.wait_for_timeout(60)
    check("5 Whys and RCA causes added", pg.evaluate("formToRec().an.causes.map(c=>c.how)")[:2] == ["fish", "why5"] and pg.evaluate("formToRec().an.causes.filter(c=>c.how==='rca').length") >= 1)
    pg.fill("#pkRef", "NOPE"); pg.click("#pkUse"); pg.wait_for_timeout(40)
    check("unknown id says so", "غير موجود" in pg.inner_text("#pkMsg"))
    pv = pg.evaluate("[...document.querySelectorAll('#czCards [data-pv]')].map(x=>x.textContent)")
    check("each picked cause card shows a preview", all(pv) and "W5-EX-01" in pv[1], pv)
    check("the analysis date is set when causes are picked", pg.evaluate("formToRec().an.date") != "")
    pg.fill("#f-capa", "CA-EX-04"); pg.wait_for_timeout(60)
    pg.click('[data-start="rca"]'); pg.click('[data-start="fish"]'); pg.click('[data-start="why5"]'); pg.wait_for_timeout(60)
    op = pg.evaluate("window.__opened")
    check("start buttons open RCA, Fishbone and 5 Whys with ?capa= outside the hub", any("rca.html?capa=CA-EX-04" in u for u in op) and any("fishbone.html?capa=CA-EX-04" in u for u in op) and any("five-whys.html?capa=CA-EX-04" in u for u in op), op)
    pg.fill("#f-rca", "RC-EX-01"); pg.fill("#f-pdca", "PD-EX-03"); pg.fill("#f-a3", "A3-EX-01"); pg.wait_for_timeout(60)
    check("header previews: RCA stage, CAPA stage, PDCA cycle", "RC-EX-01" in pg.inner_text("#rcInfo") and "CA-EX-04" in pg.inner_text("#caInfo") and "PDCA" in pg.inner_text("#pdInfo"))
    pg.click("#rcOpen"); pg.click("#pdOpen"); pg.click("#caOpen"); pg.click("#a3Open"); pg.wait_for_timeout(60)
    op = pg.evaluate("window.__opened")
    check("Open RCA and A3 (?open=), PDCA and CAPA open in a new tab outside the hub", any("rca.html?open=RC-EX-01" in u for u in op) and any("a3.html?open=A3-EX-01" in u for u in op) and any("pdca.html" in u for u in op) and any("capa.html" in u for u in op), op)
    after = pg.evaluate(f"JSON.stringify({KEYS}.map(k=>localStorage.getItem(k)))")
    check("no other tool's stored state changed", before == after)
    pg.goto(URL + "?a3=A3-EX-02"); pg.wait_for_timeout(350)
    check("?a3= opens a prefilled project on the project tab", pg.evaluate("curTab") == "tools" and pg.evaluate("formToRec().a3") == "A3-EX-02")
    pg.goto(URL + "?rca=RC-EX-02"); pg.wait_for_timeout(350)
    check("?rca= prefills from RCA", pg.evaluate("formToRec().rca") == "RC-EX-02")
    pg.goto(URL + "?pareto=PA-EX-03&cat=k4"); pg.wait_for_timeout(350)
    check("?pareto=&cat= prefills from Pareto", pg.evaluate("formToRec().pcat") == "k4")
    pg.goto(URL); pg.wait_for_timeout(300); load_ex(pg)
    pg.goto(URL + "?open=DM-EX-03"); pg.wait_for_timeout(350)
    check("?open= opens the project", pg.evaluate("document.getElementById('rid').value") == "DM-EX-03")
    pg.evaluate("sessionStorage.setItem('cia-nav:dmaic', JSON.stringify({open:'DM-EX-02'}))"); pg.goto(URL); pg.wait_for_timeout(350)
    check("hub hint cia-nav:dmaic opens the project and is removed", pg.evaluate("document.getElementById('rid').value") == "DM-EX-02" and pg.evaluate("sessionStorage.getItem('cia-nav:dmaic')") is None)
    pg.goto(M("a3")); pg.wait_for_timeout(350)
    pg.evaluate("loadRecordIntoForm(DB.records.find(r=>r.id==='A3-EX-01')); go('tools')"); pg.wait_for_timeout(100)
    check("A3 panel lists the DMAIC project on A3-EX-01", not hidden(pg, "dmBox") and "DM-EX-01" in pg.inner_text("#dmBox"))
    pg.click('[data-dmopen="DM-EX-01"]'); pg.wait_for_timeout(60)
    check("A3 'Open in DMAIC' asks for dmaic.html?open=", any("dmaic.html?open=DM-EX-01" in u for u in pg.evaluate("window.__opened")))
    check("no errors in the link flows", not errs, errs[:3])
    ctx.close()

    # ---- 6. hub overlay, assistant, tour, 390 px
    ctx, pg, errs = page_new("ar", url=BASE + "/index.html")
    pg.evaluate("openModule('dmaic')")
    pg.wait_for_function("document.getElementById('modFrame').dataset.k==='dmaic' && document.getElementById('modFrame').contentDocument.readyState==='complete' && !!document.getElementById('modFrame').contentDocument.getElementById('side')", timeout=10000)
    check("DMAIC opens in the hub overlay", pg.evaluate("document.getElementById('modOverlay').classList.contains('on')"))
    pg.evaluate("document.getElementById('modFrame').contentWindow.go('tools')"); pg.wait_for_timeout(100)
    check("inside the hub the 'save first' note shows", not pg.evaluate("document.getElementById('modFrame').contentDocument.getElementById('pkHub').hidden"))
    pg.evaluate("document.getElementById('modFrame').contentWindow.startIn('rca')"); pg.wait_for_timeout(800)
    check("inside the hub 'Start an RCA investigation' opens RCA in the overlay", pg.evaluate("document.getElementById('modFrame').dataset.k") == "rca")
    ctx.close()
    ctx, pg, errs = page_new("en")
    pg.click("#cbFab"); pg.wait_for_timeout(100)
    sug = pg.evaluate("[...document.querySelectorAll('#cbSug button')].map(b=>b.textContent)")
    check("assistant suggests 'Is DMAIC only for Six Sigma experts?' and 'DMAIC, A3 or PDCA — which one?'", "Is DMAIC only for Six Sigma experts?" in sug and "DMAIC, A3 or PDCA — which one?" in sug, sug)
    pg.evaluate("document.querySelector('#cbSug [data-sid=\"six\"]').click()"); pg.wait_for_timeout(80)
    check("answer: a structured way of thinking, simple tools", "structured way of thinking" in last_bot(pg) and "simple tools" in last_bot(pg))
    pg.fill("#cbIn", "why check the measurement before the baseline"); pg.keyboard.press("Enter"); pg.wait_for_timeout(80)
    check("typed question finds the measurement answer", "cannot be trusted" in last_bot(pg))
    pg.fill("#cbIn", "what happens at a gate"); pg.keyboard.press("Enter"); pg.wait_for_timeout(80)
    check("gate answer", "through questions, not a signature" in last_bot(pg))
    pg.fill("#cbIn", "status"); pg.keyboard.press("Enter"); pg.wait_for_timeout(80)
    check("status answer reads the data (none yet)", "No projects yet" in last_bot(pg))
    check("assistant answers 6 static + 2 dynamic questions", pg.evaluate("KB.filter(k=>k.a).length") == 6 and pg.evaluate("KB.filter(k=>k.dyn).length") == 2)
    pg.keyboard.press("Escape"); pg.wait_for_timeout(80)
    ctx.close()
    for lang in ("ar", "en"):
        ctx, pg, errs = page_new(lang)
        check(f"guided tour layer present ({lang})", pg.evaluate("!!window.ciaTour"))
        ctx.close()
    ctx, pg, errs = page_new("ar", 390, 844)
    load_ex(pg)
    over = {}
    for t in TABS:
        pg.evaluate(f"go('{t}')"); pg.wait_for_timeout(60)
        over[t] = pg.evaluate("document.documentElement.scrollWidth-innerWidth")
    for rid in ("DM-EX-01", "DM-EX-02"):
        pg.evaluate(f"loadRecordIntoForm(DB.records.find(r=>r.id==='{rid}')); go('tools')"); pg.wait_for_timeout(150)
        over[rid] = pg.evaluate("document.documentElement.scrollWidth-innerWidth")
    check("390 px: no horizontal overflow on any tab or a filled project", all(v <= 1 for v in over.values()), over)
    pg.evaluate("loadRecordIntoForm(DB.records[0]); go('tools')"); pg.wait_for_timeout(150)
    mp = pg.evaluate("[...document.querySelectorAll('#caSteps .dm-map li')].map(li=>[li.querySelector('i').textContent,li.getBoundingClientRect().top,li.getBoundingClientRect().width])")
    check("390 px: the phase map stacks its five phases in order, full width", [x[0] for x in mp] == list("DMAIC") and all(mp[i][1] < mp[i + 1][1] for i in range(4)) and all(x[2] > 250 for x in mp), mp)
    ph = pg.evaluate("[...document.querySelectorAll('.dm-ph')].map(s=>s.getBoundingClientRect().top)")
    check("390 px: the five phases stack in order", len(ph) == 5 and all(ph[i] < ph[i + 1] for i in range(4)))
    cw = pg.evaluate("[document.querySelector('#bChart svg').getAttribute('width'), document.querySelector('#bChart svg').getBoundingClientRect().width]")
    check("390 px: run charts drawn at phone width (360) and fit the screen", cw[0] == "360" and cw[1] <= 390, cw)
    check("390 px: no errors", not errs, errs[:3])
    ctx.close()
    b.close()

failed = [r for r in results if not r[1]]
print(f"\n{len(results) - len(failed)}/{len(results)} passed")
sys.exit(1 if failed else 0)
