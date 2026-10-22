"""Fishbone tool (modules/fishbone.html) — 2026-10-11. Same style as tests/why5/test_why5.py.
Covers: shared engine (four files) and layer identity, AR/EN and RTL/LTR, tabs, kit links both ways, self-assessment, the analysis
form (validation, stages, category sets, bones and causes, sub-causes, status, votes, the three-cause limit, ruled-out causes,
verification by data and by a linked 5 Whys analysis, the root cause test, person-only flag, independent review), the live
diagram (SVG in RTL and LTR, stacked list at 390 px), records, audit, dashboard, report with the SVG and CSV, persistence,
example data, clear all, an analysis with missing parts, the CAPA preview and prefill (CAPA only read), the CAPA panels and
"Use this root cause" for 5 Whys and Fishbone, opening an analysis from CAPA (new tab and hub overlay), the 5 Whys link from a
selected cause, the read-only panel in 5 Whys, the PDCA link, the assistant, the guided tour, keyboard use and 390 px.
Served over http when the platform server runs (CIA_BASE, default http://127.0.0.1:8802); FB_FILE=1 forces file:// URLs.
Usage: python3 tests/fish/test_fish.py"""
import os, sys, json, re
from playwright.sync_api import sync_playwright
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
MOD = os.path.join(ROOT, "modules")
BASE = "file://" + ROOT
if not os.environ.get("FB_FILE"):
    import urllib.request
    _b = os.environ.get("CIA_BASE", "http://127.0.0.1:8802")
    try:
        urllib.request.urlopen(_b + "/modules/fishbone.html", timeout=3).read(64); BASE = _b
    except Exception:
        pass
URL, CAPA, PDCA, W5, HUB = (BASE + "/modules/fishbone.html", BASE + "/modules/capa.html", BASE + "/modules/pdca.html",
                            BASE + "/modules/five-whys.html", BASE + "/index.html")
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
fb, w5, capa, pdca, tpl = (read(os.path.join(MOD, "fishbone.html")), read(os.path.join(MOD, "five-whys.html")), read(os.path.join(MOD, "capa.html")),
                           read(os.path.join(MOD, "pdca.html")), read(os.path.join(ROOT, "templates", "explain-kit-template.html")))
e = [engine(x) for x in (pdca, capa, w5, fb)]
check("engine block present once in pdca.html, capa.html, five-whys.html and fishbone.html", all(x is not None for x in e))
check("engine block identical in the four files", len(set(e)) == 1 and len(e[0] or "") > 2000)
check("engine block identical to tests/build/engine.js", (e[3] or "") == read(os.path.join(ROOT, "tests", "build", "engine.js")).rstrip("\n"))
for tag, id_ in (("style", "cia-explain-kit-css"), ("script", "cia-explain-kit-js")):
    check(f"fishbone.html {id_} byte-identical to the template", block(fb, tag, id_) == block(tpl, tag, id_))
norm = lambda x: re.sub(r"var CFG=\{.*?\};", "var CFG={};", x or "", count=1)
check("tour script identical to five-whys.html apart from CFG", norm(block(fb, "script", "cia-tour-js")) == norm(block(w5, "script", "cia-tour-js")) and block(fb, "script", "cia-tour-js") != block(w5, "script", "cia-tour-js"))
check("tour CSS identical to five-whys.html", block(fb, "style", "cia-tour-css") == block(w5, "style", "cia-tour-css"))
check("tour CFG names fishbone and guards the example", 'var CFG={"file": "fishbone", "hasEx": true, "guard": {"pfEx": "all"}};' in fb)
i0 = fb.find("Fishbone tool — host logic")
check("storage key and schema documented at the top of the host script", 'STORE="cia-fish:v1"' in fb and "Schema:" in fb[i0:i0 + 4000] and '"cia-capa:v1"' in fb[i0:i0 + 4000] and '"cia-why5:v1"' in fb[i0:i0 + 4000])
check("Fishbone never writes another tool's key; CAPA and 5 Whys never write the Fishbone key",
      not re.search(r"localStorage\.setItem\((CAPA_KEY|WHY5_KEY|PDCA_KEY|['\"]cia-(capa|why5|pdca):v1)", fb) and not re.search(r"setItem\((FISH_KEY|['\"]cia-fish:v1)", capa + w5))

with sync_playwright() as p:
    b = p.chromium.launch()

    def page_new(lang="ar", w=1280, h=900, url=URL):
        ctx = b.new_context(viewport={"width": w, "height": h}, accept_downloads=True)
        pg = ctx.new_page(); errs = []
        pg.on("pageerror", lambda e: errs.append("pageerror: " + str(e)))
        pg.on("console", lambda m: errs.append("console." + m.type + ": " + m.text) if (m.type == "error" and "Failed to load resource" not in m.text) else None)
        pg.route(re.compile(r"fonts\.(googleapis|gstatic)\.com"), lambda r: r.abort())
        init = ("try{if(!sessionStorage.getItem('t0')){sessionStorage.setItem('t0','1');localStorage.setItem('cia-lang','%s');" % lang +
                "['fishbone','five-whys','capa','pdca','smart-audit-improvement'].forEach(function(k){localStorage.setItem('cia-tour:m:'+k,'done');});localStorage.setItem('cia-tour:v1','done');}}catch(e){}")
        pg.add_init_script(init)
        pg.on("dialog", lambda d: d.accept())
        pg.goto(url); pg.wait_for_timeout(350)
        return ctx, pg, errs

    def tab_text(pg, t): return pg.evaluate(f"(go('{t}'), document.querySelector('.tabpane[data-tab=\"{t}\"]').innerText)")
    def last_bot(pg): return pg.evaluate("[...document.querySelectorAll('#cbBody .cb-msg.bot')].pop().innerText")

    # ---- 1. load, Arabic default, method tab, kit
    ctx, pg, errs = page_new("ar")
    check("loads in Arabic RTL", pg.evaluate("document.documentElement.dir") == "rtl" and pg.evaluate("document.documentElement.lang") == "ar")
    pg.click('#side button[data-go="explain-std"]'); pg.wait_for_timeout(150)
    term = pg.inner_text("#fbTerm")
    check("method tab says once that Fishbone is a method, not a clause, and names 10.2.1 b) 2) and b) 3) and A.10.2",
          "ليس بنداً" in term and "10.2.1 ب) 2)" in term and "10.2.1 ب) 3)" in term and "A.10.2" in term and pg.evaluate("document.querySelectorAll('#fbTerm').length") == 1, term[:200])
    check("method tab: categories are prompts, a cause is a candidate until evidence supports it, 5 Whys or data confirms",
          "محفّزات" in term and "ليست قائمة ثابتة" in term and "مرشّح حتى يسنده دليل" in term and "لماذا الخمس أو البيانات" in term)
    check("the explanation is marked as interpretive summary", "ملخص تفسيري" in term)
    std = pg.evaluate("document.getElementById('ex-std-box').innerText")
    check("method guide renders (kit) with the roles and the steps", len(std) > 400 and "من يحضر الجلسة" in std and "خطوات تحليل عظمة السمكة" in std, len(std))
    pg.evaluate("location.hash='#explain-cl'"); pg.wait_for_timeout(250)
    check("clause guide index shows 5 clauses", pg.evaluate("document.querySelectorAll('#ex-cl-box .ex-idx [data-ex-sec]').length") == 5)
    check("clause guide draws the cycle diagram", pg.evaluate("document.querySelectorAll('#ex-cl-box svg .ex-seg').length") == 5)
    pg.click('#ex-cl-box .ex-idx [data-ex-sec="10.2"]'); pg.wait_for_timeout(250)
    body = pg.evaluate("document.getElementById('ex-d-body').innerText")
    check("opening 10.2 shows 10.2.1 b 1 … b 3, the method rules GD-1 … GD-5 and A.10.2", all(c in body for c in ["10.2.1 b 1", "10.2.1 b 2", "10.2.1 b 3", "GD-1", "GD-5", "A.10.2", "10.2.2"]), body[:200])
    check("requirements are marked as interpretive summaries", "ملخص تفسيري" in pg.evaluate("CIAEX.open('10.2.1 b 2'), document.querySelector('#ex-d-body .ex-it.open').innerText"))
    check("method rules are marked as guidance, not normative text", "إرشاد تطبيقي" in pg.evaluate("CIAEX.open('GD-1'), document.querySelector('#ex-d-body .ex-it.open').innerText"))
    pg.keyboard.press("Escape"); pg.wait_for_timeout(200)
    info = pg.evaluate("({n:CIAEX.items.length, q:CIAEX.items.filter(i=>/^[A-Z]{2}\\d$/.test(i.q)).length, off:CIAEX.items.filter(i=>i.q==='x:tools').length})")
    check("kit: 15 items, 10 linked to the 10 questions, 5 outside the assessment", info == {"n": 15, "q": 10, "off": 5}, info)
    check("every question has an item", pg.evaluate("AQ.every(q=>CIAEX.items.some(i=>i.q===q[0]))"))
    check("meta.verified names the date and the source files", "2026-10-11" in pg.evaluate("EXPLAIN_FISH.meta.verified.ar") and "ISO_9001_2026en 1.pdf" in pg.evaluate("EXPLAIN_FISH.meta.verified.en") and "ISO 9000-2026.pdf" in pg.evaluate("EXPLAIN_FISH.meta.verified.en"))
    check("ui labels set (roles, wheelT, purpose, smap, assess, assessOff, offGo, actCtx)", pg.evaluate("['roles','wheelT','purpose','smap','assess','assessOff','offGo','actCtx'].every(k=>EXPLAIN_FISH.ui.ar[k]&&EXPLAIN_FISH.ui.en[k])") and pg.evaluate("EXPLAIN_FISH.ui.en.offGo") == "Open the Fishbone analysis")
    pg.evaluate("CIAEX.open('GD-4')"); pg.wait_for_timeout(120)
    pg.evaluate("document.querySelector('#ex-d-body .ex-it.open [data-ex-assess]').click()"); pg.wait_for_timeout(500)
    check("'Assess this' lands on question VR2, highlighted", pg.evaluate("curTab") == "assess" and pg.evaluate("!!document.querySelector('.ex-aq[data-id=\"VR2\"].ex-hl')"))
    pg.evaluate("go('explain-cl')"); pg.evaluate("CIAEX.open('9.1.3')"); pg.wait_for_timeout(120)
    off = pg.evaluate("(()=>{const it=document.querySelector('#ex-d-body .ex-it.open'); return {note:!!it.querySelector('.ex-act-off'), btn:!!it.querySelector('[data-ex-go=\"tools\"]')};})()")
    check("item outside the assessment shows the note and a button to the analysis", off == {"note": True, "btn": True}, off)
    pg.evaluate("document.querySelector('#ex-d-body .ex-it.open [data-ex-go]').click()"); pg.wait_for_timeout(200)
    check("the note's button opens the Fishbone analysis tab", pg.evaluate("curTab") == "tools")
    pg.evaluate("go('assess')"); pg.wait_for_timeout(250)
    check("'Explain' back-link on each of the 10 questions", pg.evaluate("document.querySelectorAll('#asList .ex-qx[data-ex-q]').length") == 10)
    pg.evaluate("document.querySelector('.ex-aq[data-id=\"VR3\"] .ex-qx').click()"); pg.wait_for_timeout(200)
    check("'Explain' on VR3 opens GD-5 (confirm before acting)", pg.evaluate("!!document.querySelector('#ex-d-body .ex-it.open[data-code=\"GD-5\"]')"))
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
    e_std = pg.evaluate("document.getElementById('ex-std-box').innerText")
    check("kit re-renders the open method tab in English", "Who is in the session" in e_std and len(re.findall(r"[؀-ۿ]", e_std)) / max(1, len(e_std)) < 0.05)
    check("English method card: not a clause, prompts not a fixed list, candidate until evidence", "not a clause" in pg.inner_text("#fbTerm") and "prompts, not a fixed list" in pg.inner_text("#fbTerm") and "candidate until evidence" in pg.inner_text("#fbTerm"))
    pg.click("#langBtn"); pg.wait_for_timeout(200)
    check("toggle back to Arabic re-renders again", pg.evaluate("document.documentElement.dir") == "rtl" and "من يحضر الجلسة" in pg.evaluate("document.getElementById('ex-std-box').innerText"))

    # ---- 4. self-assessment
    pg.evaluate("go('assess')"); pg.wait_for_timeout(80)
    pg.check('input[name="as-EF1"][value="2"]'); pg.check('input[name="as-CS3"][value="1"]'); pg.wait_for_timeout(120)
    st = pg.evaluate("JSON.parse(localStorage.getItem('cia-fish:v1')).assess")
    check("assessment answers persisted under cia-fish:v1", st.get("EF1") == 2 and st.get("CS3") == 1, st)
    check("gauge value correct (15%)", pg.inner_text("#asPct") == "15%", pg.inner_text("#asPct"))
    check("score per stage group shown (4 groups)", pg.evaluate("document.querySelectorAll('#asStages .pd-bar').length") == 4)
    check("10 questions on a 0–2 scale", pg.evaluate("document.querySelectorAll('#asList .ex-aq').length") == 10 and pg.evaluate("document.querySelectorAll('#asList input[type=radio]').length") == 30)

    # ---- 5. analysis form
    pg.evaluate("go('tools')"); pg.wait_for_timeout(80)
    err = lambda: pg.inner_text("#recErr")
    stage = lambda: pg.inner_text("#curStage")
    save = lambda: (pg.click("#saveBtn"), pg.wait_for_timeout(60))
    check("a new form starts with the six 6M bones and no causes", pg.evaluate("document.querySelectorAll('#boneBox .fb-bone').length") == 6 and pg.evaluate("document.querySelectorAll('#boneBox .fb-item').length") == 0 and pg.input_value("#f-set") == "6m")
    check("bone names are the 6M prompts", pg.evaluate("[...document.querySelectorAll('#boneBox [data-bk=name]')].map(i=>i.value).join('|')") == "الأفراد|الطريقة|المواد|الآلات والمعدات|القياس|البيئة")
    check("the diagram is drawn even when empty (head, spine, six bones)", pg.evaluate("document.querySelectorAll('#fbDiag svg.fb-svg rect[rx=\"12\"]').length") == 6)
    save(); check("empty save is refused (title)", "عنوان" in err(), err())
    pg.fill("#f-title", "تأخر تسليم الوثائق للعميل"); save()
    check("missing effect refused", "الأثر" in err(), err())
    pg.fill("#f-what", "سُلّمت 4 من 12 حزمة وثائق بعد موعدها في الربع الثالث."); pg.fill("#f-date", "2026-10-02"); save()
    check("valid analysis saves with id FB-2026-001, stage Effect defined", err() == "" and "FB-2026-001" in pg.inner_text("#recOk") and "تعريف الأثر" in stage(), [err(), pg.inner_text("#recOk"), stage()])
    head_txt = pg.evaluate("[...document.querySelectorAll('#fbDiag svg .fb-head text')].map(t=>t.textContent).join(' ')")
    check("the head of the fish shows the effect", "سُلّمت 4 من 12" in head_txt, head_txt)
    # set change keeps causes
    pg.click('[data-cadd="1"]'); pg.wait_for_timeout(40)
    cid = pg.evaluate("document.querySelector('#boneBox .fb-bone[data-bone=\"1\"] .fb-item').dataset.id")
    pg.fill(f"#i-{cid}-t", "لا قائمة تحقق قبل إرسال الحزمة."); pg.fill(f"#i-{cid}-ev", "إجراء الإرسال DC-05")
    pg.select_option(f"#i-{cid}-st", "sup"); pg.fill(f"#i-{cid}-v", "4"); pg.wait_for_timeout(40)
    pg.select_option("#f-set", "4s"); pg.wait_for_timeout(80)
    names = pg.evaluate("[...document.querySelectorAll('#boneBox [data-bk=name]')].map(i=>i.value)")
    check("changing the set to 4S renames the bones in order and keeps the cause", names == ["المحيط", "الموردون", "الأنظمة", "المهارات"] and pg.input_value(f"#i-{cid}-t") == "لا قائمة تحقق قبل إرسال الحزمة." and "طُبّقت" in pg.inner_text("#setMsg"), names)
    pg.select_option("#f-set", "6m"); pg.wait_for_timeout(80)
    check("back to 6M: six bones again, cause still on bone 2", pg.evaluate("document.querySelectorAll('#boneBox .fb-bone').length") == 6 and pg.evaluate(f"!!document.querySelector('#boneBox .fb-bone[data-bone=\"1\"] .fb-item[data-id=\"{cid}\"]')"))
    save(); check("with a cause the stage is Causes mapped", "رسم الأسباب" in stage(), stage())
    check("the diagram draws the cause on its bone", "لا قائمة تحقق" in pg.evaluate("document.querySelector('#fbDiag svg').textContent"))
    # more causes, sub-cause, ruled out, votes
    def add_cause(bone, text, ev, stv, votes=0):
        pg.click(f'[data-cadd="{bone}"]'); pg.wait_for_timeout(30)
        i_ = pg.evaluate(f"[...document.querySelectorAll('#boneBox .fb-bone[data-bone=\"{bone}\"] .fb-item[data-lvl=\"0\"]')].pop().dataset.id")
        pg.fill(f"#i-{i_}-t", text); pg.fill(f"#i-{i_}-ev", ev); pg.select_option(f"#i-{i_}-st", stv); pg.fill(f"#i-{i_}-v", str(votes)); return i_
    c2 = add_cause(0, "خطأ بشري من الموظف في المراجعة.", "", "cand", 2)
    c3 = add_cause(4, "لا مؤشر لزمن التسليم.", "تقرير الربع الثالث", "sup", 3)
    c4 = add_cause(5, "ضغط المشاريع في الصيف.", "جدول المشاريع: لم يتغير عدد الحزم", "out", 0)
    pg.click(f'[data-subadd="{cid}"]'); pg.wait_for_timeout(30)
    sid = pg.evaluate(f"document.querySelector('.fb-c[data-cid=\"{cid}\"] .fb-subs .fb-item').dataset.id")
    pg.fill(f"#i-{sid}-t", "قائمة التحقق القديمة أُلغيت في 2025 ولم تُستبدل."); pg.fill(f"#i-{sid}-ev", "سجل الوثائق"); pg.select_option(f"#i-{sid}-st", "sup")
    pg.wait_for_timeout(40)
    svg_txt = pg.evaluate("document.querySelector('#fbDiag svg').textContent")
    check("sub-cause, ruled-out cause and votes appear on the diagram", "قائمة التحقق القديمة" in svg_txt and "ضغط المشاريع" in svg_txt and "(4)" in svg_txt, svg_txt[:200])
    check("a ruled-out cause is struck through on the diagram", pg.evaluate("[...document.querySelectorAll('#fbDiag svg text[text-decoration=\"line-through\"]')].some(t=>t.textContent.includes('ضغط المشاريع'))"))
    check("the diagram is mirrored in Arabic (head on the left, direction rtl)", pg.evaluate("(()=>{const s=document.querySelector('#fbDiag svg'); const h=s.querySelector('.fb-head text'); return s.getAttribute('direction')==='rtl' && +h.getAttribute('x') < +s.getAttribute('width')/2; })()"))
    # selection rules
    pg.click(f"#i-{c4}-sel"); pg.wait_for_timeout(40)
    check("a ruled-out cause cannot be selected", not pg.is_checked(f"#i-{c4}-sel") and "المستبعد" in pg.inner_text("#pickMsg"))
    pg.check(f"#i-{cid}-sel"); pg.check(f"#i-{c2}-sel"); pg.check(f"#i-{c3}-sel"); pg.wait_for_timeout(40)
    pg.click(f"#i-{sid}-sel"); pg.wait_for_timeout(40)
    check("a fourth selection is refused (three at most)", not pg.is_checked(f"#i-{sid}-sel") and "ثلاثة" in pg.inner_text("#pickMsg") and pg.evaluate("document.querySelectorAll('#selBox .fb-ver').length") == 3)
    check("selected causes carry numbered gold markers on the diagram", pg.evaluate("document.querySelectorAll('#fbDiag svg circle[fill=\"#B8901E\"]').length") == 3)
    check("selecting a cause that names a person shows the person-only warning", pg.evaluate("!document.getElementById('personWarn').hidden") and "ما الذي في العملية" in pg.inner_text("#personWarn"))
    pg.uncheck(f"#i-{c2}-sel"); pg.wait_for_timeout(40)
    check("unselecting clears the warning and leaves two causes to verify", pg.evaluate("document.getElementById('personWarn').hidden") and pg.evaluate("document.querySelectorAll('#selBox .fb-ver').length") == 2)
    save(); check("with selected causes the stage is Causes selected", "اختيار الأسباب" in stage(), stage())
    a1 = pg.evaluate("auditRecord(DB.records[0])")
    check("audit: four bones with causes pass; a candidate without evidence passes (only supported causes need it); verification fails",
          a1["bones"] is True and a1["ev"] is True and a1["ver"] is False and a1["max3"] is True and a1["person"] is True and a1["rev"] is None, a1)
    # verification: data for one, 5 Whys for the other
    pg.evaluate("go('tools')")
    pg.select_option(f"#v-{cid}-how", "data"); pg.fill(f"#v-{cid}-note", "8 من 8 حزم بلا قائمة تحقق تأخرت، مقابل 0 من 4 حزم راجعها مدير المشروع."); pg.select_option(f"#v-{cid}-res", "conf"); pg.wait_for_timeout(60)
    check("a data verification with a result turns the row green", pg.evaluate(f"document.querySelector('#selBox .fb-ver[data-vid=\"{cid}\"]').classList.contains('ok')"))
    pg.select_option(f"#v-{c3}-how", "why5"); pg.wait_for_timeout(80)
    check("choosing 5 Whys shows the list and says when none exist", pg.evaluate(f"!!document.getElementById('v-{c3}-w5')") and "لا توجد تحليلات" in pg.inner_text(f'[data-w5p="{c3}"]'))
    pg.select_option(f"#v-{c3}-res", "conf"); pg.wait_for_timeout(40); save()
    check("a 5 Whys verification without a linked analysis is not verified", pg.evaluate("auditRecord(DB.records[0]).ver") is False and "لم يُتحقق منه: 1" in tab_text(pg, "docs"))
    pg.evaluate("go('tools')")
    pg.fill("#f-root", "لا قائمة تحقق إلزامية قبل إرسال حزمة الوثائق."); pg.select_option("#f-test", "part"); pg.wait_for_timeout(40)
    check("'only partly' shows the incomplete-test note", pg.evaluate("!document.getElementById('testWarn').hidden"))
    pg.select_option("#f-test", "yes")
    pg.select_option(f"#v-{c3}-how", "data"); pg.wait_for_timeout(60); pg.fill(f"#v-{c3}-note", "مؤشر زمن التسليم غير موجود في لوحة الربع."); pg.select_option(f"#v-{c3}-res", "conf"); pg.wait_for_timeout(40)
    pg.click("#tmAdd"); pg.fill("#teamRows tr:nth-child(1) [data-k='n']", "منسق الوثائق"); pg.check("#teamRows tr:nth-child(1) [data-k='work']")
    pg.select_option("#f-similar", "could"); pg.click("#cmAdd"); pg.fill("#cmRows tr:nth-child(1) [data-k='t']", "قائمة تحقق إلزامية قبل الإرسال"); pg.fill("#cmRows tr:nth-child(1) [data-k='owner']", "مدير الجودة")
    save(); check("all selected causes verified, root written and tested: stage Root cause verified", "تحقق السبب الجذري" in stage(), stage())
    pg.fill("#f-rby", "منسق الوثائق"); pg.fill("#f-rdate", "2026-10-01"); save()
    check("review dated before the analysis is refused", "لا يسبق" in err(), err())
    pg.fill("#f-rdate", "2026-10-05"); pg.wait_for_timeout(40)
    check("a reviewer from the team is flagged", pg.evaluate("!document.getElementById('rvWarn').hidden"))
    save(); check("reviewed (stage) but the audit fails the independent review", "روجع التحليل" in stage() and pg.evaluate("auditRecord(DB.records[0]).rev") is False, stage())
    pg.fill("#f-rby", "مدير المشروع"); save()
    a2 = pg.evaluate("auditRecord(DB.records[0])")
    check("an outside reviewer passes; only the reference and the four-part effect still fail", a2["rev"] is True and {k for k, v in a2.items() if v is False} == {"ref", "effect"}, a2)
    pg.fill("#f-ref", "CC-2026-040"); pg.fill("#f-where", "قسم الوثائق"); pg.fill("#f-when", "الربع الثالث 2026"); pg.fill("#f-much", "4 من 12 حزمة")
    add_cause(2, "نموذج الحزمة لا يحدد الوثائق المطلوبة لكل عميل.", "النموذج DP-01", "sup", 1); save()
    check("all eleven checks pass on a complete analysis", all(v is True for v in pg.evaluate("auditRecord(DB.records[0])").values()), pg.evaluate("auditRecord(DB.records[0])"))
    rec = pg.evaluate("DB.records[0]")
    allit = [c for bn in rec["bones"] for c in bn["causes"]]
    check("saved record: ids, statuses, votes, the sub-cause and both verifications", len(rec["bones"]) == 6 and any(c["subs"] and c["subs"][0]["t"].startswith("قائمة التحقق القديمة") for c in allit)
          and sum(1 for c in allit if c["sel"]) == 2 and all(c["ver"]["res"] == "conf" for c in allit if c["sel"]) and any(c["st"] == "out" for c in allit) and any(c["v"] == 4 for c in allit), json.dumps(rec, ensure_ascii=False)[:300])
    pg.click("#newBtn"); pg.wait_for_timeout(40)
    pg.fill("#f-title", "شكوى عميل عن أخطاء الفواتير"); pg.fill("#f-what", "3 فواتير بمبالغ خاطئة في سبتمبر."); pg.select_option("#f-src", "cc"); save()
    check("second analysis saves as FB-2026-002", "FB-2026-002" in pg.inner_text("#recOk"), pg.inner_text("#recOk"))
    check("no JS errors after the analysis flow", not errs, errs[:5])

    # ---- 6. records, audit, dashboard
    pg.evaluate("go('docs')"); pg.wait_for_timeout(80)
    d = pg.inner_text("#docsBox")
    check("records list both analyses with stage, causes line and flags", "CC-2026-040" in d and "شكوى عميل" in d and "مستبعد 1" in d, d[:300])
    check("sidebar count badge is 2", pg.inner_text("#cntDocs") == "2")
    pg.click('[data-open="FB-2026-001"]'); pg.wait_for_timeout(80)
    check("open loads the analysis into the form, with its bones and selections", pg.input_value("#f-ref") == "CC-2026-040" and pg.evaluate("curTab") == "tools" and pg.evaluate("document.querySelectorAll('#selBox .fb-ver').length") == 2)
    pg.evaluate("go('audit')"); pg.wait_for_timeout(80)
    check("audit table lists the analyses with 11 checks", pg.evaluate("document.querySelectorAll('#auBox thead th').length") == 12 and "شكوى عميل" in pg.inner_text("#auBox"))
    check("audit KPI tiles present (4)", pg.evaluate("document.querySelectorAll('#auKpis .pd-kpi').length") == 4)
    pg.evaluate("go('dash')"); pg.wait_for_timeout(80)
    check("dashboard has 11 KPI tiles, stage and cause-status bars and an open-items list", pg.evaluate("document.querySelectorAll('#dKpis .pd-kpi').length") == 11 and pg.evaluate("document.querySelectorAll('#dStage .pd-bar').length") == 5 and pg.evaluate("document.querySelectorAll('#dCause .pd-bar').length") == 3 and pg.evaluate("document.querySelectorAll('#dOpen li').length") >= 1)

    # ---- 7. report and CSV
    pg.evaluate("go('report')"); pg.wait_for_timeout(80)
    with pg.expect_download() as dl:
        pg.click("#rpHtml")
    html = open(dl.value.path(), encoding="utf-8").read()
    check("HTML report named Fishbone-report-*.html", dl.value.suggested_filename.startswith("Fishbone-report-") and dl.value.suggested_filename.endswith(".html"), dl.value.suggested_filename)
    check("report has the cover, each diagram as SVG, the cause table with evidence, selected causes, audit, open items and sources",
          all(x in html for x in ["مدثر سلامه", "class=\"cover\"", "<svg", "class=\"fb-svg\"", "CC-2026-040", "إجراء الإرسال DC-05", "قائمة التحقق القديمة", "Audit results", "Open items", "10.2", "not a requirement of any standard"]) and html.count("<svg") == 2)
    check("report uses the shared engine frame (same CSS as PDCA, CAPA and 5 Whys)", pg.evaluate("TBX.REPORT_CSS") in html)
    with pg.expect_download() as dl2:
        pg.click("#rpCsv")
    csv = open(dl2.value.path(), encoding="utf-8-sig").read()
    check("CSV header and rows", csv.splitlines()[0].startswith("id,ref,title,source,capa,pdca") and "categorySet" in csv.splitlines()[0] and "CC-2026-040" in csv and "FB-2026-002" in csv, csv[:120])

    # ---- 8. persistence and delete
    pg.reload(wait_until="load"); pg.wait_for_function("typeof go==='function'"); pg.evaluate("go('docs')"); pg.wait_for_timeout(80)
    check("analyses persist after reload", "CC-2026-040" in pg.inner_text("#docsBox"))
    pg.click('[data-del="FB-2026-001"]'); pg.wait_for_timeout(40)
    check("first delete click arms confirmation", "تأكيد" in pg.inner_text("#docsBox"))
    pg.click('[data-del="FB-2026-001"]'); pg.wait_for_timeout(60)
    check("second click deletes", "CC-2026-040" not in pg.inner_text("#docsBox") and pg.evaluate("DB.records.length") == 1)
    check("no JS errors through the full flow", not errs, errs[:5])
    ctx.close()

    # ---- 9. identity, example, clear all, robustness, assistant, tour
    ctx, pg, errs = page_new("ar")
    check("home button back to the hub is present", pg.evaluate("!!document.getElementById('ciaHomeBtn')"))
    check("code badge FB and Arabic brand line in AR", pg.inner_text(".brand-mark") == "FB" and "أكاديمية التحسين المستمر" in pg.inner_text("#brandBy"))
    check("language button reads English in AR", pg.inner_text("#langLabel") == "English")
    check("hero shows the academy logo and 'إعداد مدثر سلامه'", pg.evaluate("!!document.querySelector('.hero img[data-logo]').src.startsWith('data:image')") and "مدثر سلامه" in pg.inner_text(".hero .author"))
    check("sidebar uses SVG icons with tinted tiles (10)", pg.evaluate("document.querySelectorAll('#side button[data-t] .ic svg').length") == 10)
    check("launch grid has 9 tiles", pg.evaluate("document.querySelectorAll('#launchGrid a').length") == 9)
    check("related tools strip: CAPA, 5 Whys, PDCA, Smart Audit", pg.evaluate("[...document.querySelectorAll('#homeStd a.hs')].map(a=>a.getAttribute('href').split('/').pop()).join()") == "capa.html,five-whys.html,pdca.html,smart-audit-improvement.html")
    check("AI tab is a placeholder labelled under construction", "قيد البناء" in tab_text(pg, "ai"))
    pg.evaluate("go('docs')"); pg.click("#pfEx"); pg.wait_for_function("document.querySelectorAll('#docsBox tbody tr').length===3", timeout=5000)
    st = pg.evaluate("JSON.parse(localStorage.getItem('cia-fish:v1'))")
    check("example loads 3 analyses linked to CA-EX-02, CA-EX-04 and CA-EX-03", [r["capa"] for r in st["records"]] == ["CA-EX-02", "CA-EX-04", "CA-EX-03"])
    check("example stages: reviewed, reviewed, verified (waiting for review)", pg.evaluate("DB.records.map(r=>stageOf(r)).join()") == "reviewed,reviewed,verified", pg.evaluate("DB.records.map(r=>stageOf(r)).join()"))
    check("the concrete analysis verifies both selected causes with 5 Whys W5-EX-03", pg.evaluate("selList(DB.records[1]).map(x=>x.it.ver.how+':'+x.it.ver.w5).join()") == "why5:W5-EX-03,why5:W5-EX-03")
    check("the calibration analysis verifies with data; the drawings analysis uses 4S", pg.evaluate("selList(DB.records[0]).every(x=>x.it.ver.how==='data'&&x.it.ver.note)") and st["records"][2]["set"] == "4s")
    check("example dates are in 2026 and labelled illustrative", all(r["date"].startswith("2026") for r in st["records"]) and "توضيحية" in pg.inner_text("#exBox"))
    check("example self-assessment is 75%", pg.evaluate("assessScore()") == 75, pg.evaluate("assessScore()"))
    check("example audit: only the missing review of FB-EX-03 fails", pg.evaluate("DB.records.map(r=>Object.entries(auditRecord(r)).filter(x=>x[1]===false).map(x=>x[0]).join('+')).join('|')") == "||rev", pg.evaluate("DB.records.map(r=>Object.entries(auditRecord(r)).filter(x=>x[1]===false).map(x=>x[0]).join('+')).join('|')"))
    for tab in TABS:
        tx = tab_text(pg, tab)
        bad = [w for w in ("undefined", "NaN", "[object Object]") if w in tx]
        check(f"example: {tab} has content and no undefined/NaN/[object Object]", len(tx.strip()) > 40 and not bad, bad)
    check("no errors with example data on every tab", not errs, errs[:5])
    check("assistant button and panel present", pg.evaluate("!!document.getElementById('cbFab') && !!document.getElementById('cbSub').textContent"))
    pg.click("#cbFab"); pg.wait_for_timeout(100)
    pg.click('#cbSug [data-sid="fb5"]'); pg.wait_for_timeout(80)
    check("assistant: Fishbone or 5 Whys?", "أين تبحث" in last_bot(pg) and "لماذا الخمس" in last_bot(pg))
    pg.fill("#cbIn", "أي الفئات أستخدم 6M أو 4S؟"); pg.press("#cbIn", "Enter"); pg.wait_for_timeout(80)
    check("assistant answers the categories question", "محفّزات" in last_bot(pg))
    pg.fill("#cbIn", "ما البنود المفتوحة؟"); pg.press("#cbIn", "Enter"); pg.wait_for_timeout(80)
    check("assistant lists open items from the data", "EA-2026-02" in last_bot(pg), last_bot(pg)[:200])
    pg.click("#cbClose"); pg.wait_for_timeout(60)
    check("assistant has 4–6 method answers plus two that read the data", 4 <= pg.evaluate("KB.filter(k=>!k.dyn).length") <= 6 and pg.evaluate("KB.filter(k=>k.dyn).length") == 2)
    pg.evaluate("go('docs')"); pg.click("#pfReset"); pg.wait_for_timeout(100)
    check("clear all removes the stored data", pg.evaluate("localStorage.getItem('cia-fish:v1')") is None and "لا توجد تحليلات" in pg.inner_text("#docsBox"))
    pg.evaluate("""localStorage.setItem('cia-fish:v1', JSON.stringify({records:[{id:'FB-X',title:'t',ref:'R-1'},{id:'FB-Y',ref:'R-2',effect:'x',team:'bad',set:'zz',bones:[null,{name:7,causes:'x'},{causes:[null,{t:'a',st:'odd',v:'99',sel:true,ver:'v',subs:[null,{t:'s',sel:true,ver:{how:'why5'}}]}]},{},{},{},{},{},{},{}],test:[1],cms:{},review:7},null,7],assess:{EF1:2}}))""")
    pg.reload(wait_until="load"); pg.wait_for_function("typeof go==='function'")
    for tab in TABS: tab_text(pg, tab)
    pg.evaluate("go('docs')"); pg.click('[data-open="FB-Y"]'); pg.wait_for_timeout(80)
    dtx = tab_text(pg, "docs")
    check("analyses with missing or broken parts render without errors", (not errs) and "R-1" in dtx and "R-2" in dtx and pg.evaluate("DB.records[1].bones.length") <= 8 and pg.evaluate("DB.records[1].bones[1].causes[0].v") == 9, [errs[:3], dtx[:120]])
    pg.evaluate("localStorage.removeItem('cia-fish:v1')")
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

    # ---- 10. links with CAPA, 5 Whys (read only both ways) and PDCA
    ctx, pg, errs = page_new("ar")
    pg.evaluate("go('tools')"); pg.click("#cpPrev"); pg.wait_for_timeout(80)
    check("without CAPA data the preview says so", "لا توجد سجلات CAPA" in pg.inner_text("#cpMsg"))
    pg.goto(CAPA); pg.wait_for_function("typeof go==='function'"); pg.evaluate("go('docs')"); pg.evaluate("document.getElementById('pfEx').click()"); pg.wait_for_timeout(300)
    capa0 = pg.evaluate("localStorage.getItem('cia-capa:v1')")
    pg.goto(PDCA); pg.wait_for_function("typeof go==='function'"); pg.evaluate("go('docs')"); pg.evaluate("document.getElementById('pfEx').click()"); pg.wait_for_timeout(300)
    pd0 = pg.evaluate("localStorage.getItem('cia-pdca:v1')")
    pg.goto(URL); pg.wait_for_function("typeof go==='function'"); pg.wait_for_timeout(150)
    check("home shows the CAPA records whose method is Fishbone and have no analysis yet (2: CA-EX-02, CA-EX-04)", not pg.evaluate("document.getElementById('homeImp').hidden") and "2" in pg.inner_text("#homeImpT"), pg.inner_text("#homeImpT"))
    pg.click("#homeImpGo"); pg.wait_for_timeout(150)
    rows = pg.evaluate("document.querySelectorAll('#cpTable tbody tr').length")
    check("preview lists the 4 CAPA records with their stage and method", pg.evaluate("curTab") == "tools" and rows == 4 and "أعيد فتحه" in pg.inner_text("#cpTable") and "Fishbone" in pg.inner_text("#cpTable"), rows)
    pg.click('[data-cpuse="CA-EX-02"]'); pg.wait_for_timeout(150)
    check("'start from this record' prefills reference, CAPA link, PDCA link and the effect",
          pg.input_value("#f-ref") == "IA-2026-07 / F-03" and pg.input_value("#f-capa") == "CA-EX-02" and pg.input_value("#f-pdca") == "PD-EX-02" and "6 من 38" in pg.input_value("#f-what") and pg.input_value("#f-src") == "capa")
    tx_items = pg.evaluate("[...document.querySelectorAll('#boneBox .fb-bone')].map(b=>b.querySelector('[data-bk=name]').value+':'+b.querySelectorAll('.fb-item').length).join('|')")
    check("the CAPA cause analysis lines become candidate causes on the matching 6M bones (4)", tx_items == "الأفراد:1|الطريقة:1|المواد:0|الآلات والمعدات:1|القياس:1|البيئة:0" and "نُقل 4" in pg.inner_text("#recOk"), tx_items)
    check("the prefill message says nothing was written to CAPA", "لم يُكتب أي شيء في CAPA" in pg.inner_text("#recOk"))
    check("the CAPA record and the PDCA cycle names are read and shown", "IA-2026-07" in pg.inner_text("#cpInfo") and ("PD-EX-02" in pg.inner_text("#pdInfo") or "معايرة" in pg.inner_text("#pdInfo")), [pg.inner_text("#cpInfo"), pg.inner_text("#pdInfo")])
    pg.click('[data-cpuse="CA-EX-04"]'); pg.wait_for_timeout(150)
    tx4 = pg.evaluate("[...document.querySelectorAll('#boneBox [data-bk=name]')].map(i=>i.value)")
    check("a CAPA line on a category outside 6M (supplier) adds that bone", "الموردون" in tx4 and len(tx4) == 7, tx4)
    pg.click('[data-cpuse="CA-EX-02"]'); pg.wait_for_timeout(150)
    cid = pg.evaluate("document.querySelector('#boneBox .fb-item').dataset.id")
    pg.select_option(f"#i-{cid}-st", "sup"); pg.fill(f"#i-{cid}-ev", "مصفوفة المسؤوليات"); pg.check(f"#i-{cid}-sel"); pg.wait_for_timeout(60)
    pg.fill("#f-root", "لا يوجد سجل معايرة موحد بتنبيه مسبق."); pg.click("#saveBtn"); pg.wait_for_timeout(80)
    check("the prefilled analysis saves", pg.inner_text("#recErr") == "" and pg.evaluate("DB.records[0].capa") == "CA-EX-02")
    check("CAPA and PDCA data were only read", pg.evaluate("localStorage.getItem('cia-capa:v1')") == capa0 and pg.evaluate("localStorage.getItem('cia-pdca:v1')") == pd0)
    pg.evaluate("window.__open=[]; window.open=function(u,t){ window.__open.push([u,t]); return null; }; 0")
    pg.click("#cpOpen"); pg.click("#pdOpen"); pg.wait_for_timeout(60)
    check("outside the hub 'Open CAPA' and 'Open PDCA' open new tabs", pg.evaluate("window.__open") == [["./capa.html#docs", "_blank"], ["./pdca.html#docs", "_blank"]], pg.evaluate("window.__open"))
    # 5 Whys link from a selected cause
    pg.select_option(f"#v-{cid}-how", "why5"); pg.wait_for_timeout(80)
    pg.evaluate("window.__open=[]; 0")
    pg.click(f'[data-w5go="{cid}"]'); pg.wait_for_timeout(40); pg.click("#saveBtn"); pg.wait_for_timeout(60)
    check("'Analyse with 5 Whys' opens 5 Whys prefilled from the CAPA record (?capa=)", pg.evaluate("window.__open") == [["./five-whys.html?capa=CA-EX-02#tools", "_blank"]], pg.evaluate("window.__open"))
    pg.goto(W5); pg.wait_for_function("typeof go==='function'"); pg.evaluate("go('docs')"); pg.click("#pfEx"); pg.wait_for_timeout(250)
    w50 = pg.evaluate("localStorage.getItem('cia-why5:v1')")
    pg.goto(URL); pg.wait_for_function("typeof go==='function'"); pg.evaluate("go('docs')"); pg.click('[data-open="FB-2026-001"]'); pg.wait_for_timeout(150)
    opts_ = pg.evaluate(f"[...document.getElementById('v-{cid}-w5').options].map(o=>o.value)")
    check("the 5 Whys list reads the analyses in this browser (3 + empty choice)", opts_[0] == "" and set(opts_[1:]) == {"W5-EX-01", "W5-EX-02", "W5-EX-03"}, opts_)
    pg.select_option(f"#v-{cid}-w5", "W5-EX-01"); pg.wait_for_timeout(80)
    prev = pg.inner_text(f'[data-w5p="{cid}"]')
    check("choosing an analysis shows its preview (id, stage, root cause)", "W5-EX-01" in prev and "روجع التحليل" in prev and "نموذج أمر الشراء" in prev, prev)
    pg.select_option(f"#v-{cid}-res", "conf"); pg.click("#saveBtn"); pg.wait_for_timeout(80)
    check("the Fishbone record keeps the 5 Whys id; the 5 Whys data is only read", pg.evaluate("selList(DB.records[0])[0].it.ver.w5") == "W5-EX-01" and pg.evaluate("localStorage.getItem('cia-why5:v1')") == w50 and pg.evaluate("auditRecord(DB.records[0]).ver") is True)
    pg.evaluate("window.__open=[]; window.open=function(u,t){ window.__open.push([u,t]); return null; }; 0")
    pg.click('#selBox [data-w5open="W5-EX-01"]'); pg.wait_for_timeout(40)
    check("'Open in 5 Whys' opens the linked analysis (?open=)", pg.evaluate("window.__open") == [["./five-whys.html?open=W5-EX-01#tools", "_blank"]], pg.evaluate("window.__open"))
    pg.goto(W5 + "?open=W5-EX-01#tools"); pg.wait_for_function("typeof go==='function'"); pg.wait_for_timeout(150)
    fbf = pg.inner_text("#fbFrom") if pg.evaluate("!document.getElementById('fbFrom').hidden") else ""
    check("5 Whys shows, read-only, the Fishbone analysis that verifies a cause with it", "FB-2026-001" in fbf and "لا مسؤول محدد" in fbf, fbf)
    pg.evaluate("loadRecordIntoForm(DB.records.find(r=>r.id==='W5-EX-02'))"); pg.wait_for_timeout(60)
    check("5 Whys hides the panel for an analysis no Fishbone links to", pg.evaluate("document.getElementById('fbFrom').hidden"))
    # CAPA panels
    pg.goto(URL); pg.wait_for_function("typeof go==='function'"); pg.evaluate("go('docs')"); pg.click("#pfEx"); pg.wait_for_timeout(250)
    fb0 = pg.evaluate("localStorage.getItem('cia-fish:v1')")
    pg.goto(CAPA); pg.wait_for_function("typeof go==='function'"); pg.evaluate("go('tools')"); pg.wait_for_timeout(80)
    check("CAPA: new record (method 5 Whys) shows the 5 Whys button only; both panels hidden",
          pg.evaluate("!document.getElementById('w5Open').hidden && document.getElementById('fbOpen').hidden && document.getElementById('w5Box').hidden && document.getElementById('fbBox').hidden"))
    pg.select_option("#f-method", "fish"); pg.wait_for_timeout(40)
    check("CAPA: method Fishbone shows the 'Open the Fishbone tool' button and hides the 5 Whys one", pg.evaluate("document.getElementById('w5Open').hidden && !document.getElementById('fbOpen').hidden") and "افتح أداة عظمة السمكة" in pg.inner_text("#fbOpen"))
    pg.evaluate("loadRecordIntoForm(DB.records.find(r=>r.id==='CA-EX-02'))"); pg.wait_for_timeout(80)
    box = pg.inner_text("#fbBox")
    check("CAPA: the cause section lists the Fishbone analysis naming CA-EX-02 (5 Whys panel stays hidden)", "FB-EX-01" in box and "استخدم هذا السبب الجذري" in box and "FB-EX-02" not in box and pg.evaluate("document.getElementById('w5Box').hidden"), box[:200])
    root_fb = pg.evaluate("JSON.parse(localStorage.getItem('cia-fish:v1')).records.find(r=>r.id==='FB-EX-01').root")
    root_c0 = pg.input_value("#f-root")
    pg.click('[data-fbuse="FB-EX-01"]'); pg.wait_for_timeout(60)
    check("CAPA: 'Use this root cause' copies the Fishbone root cause into the form field", pg.input_value("#f-root") == root_fb and root_fb != root_c0 and "احفظ السجل" in pg.inner_text("#recOk"))
    check("CAPA: nothing is stored until the user saves", pg.evaluate("localStorage.getItem('cia-capa:v1')") == capa0)
    pg.click("#saveBtn"); pg.wait_for_timeout(80)
    check("CAPA: after saving, the record holds the copied root cause", pg.evaluate("DB.records.find(r=>r.id==='CA-EX-02').cause.root") == root_fb)
    check("CAPA never writes the Fishbone or 5 Whys keys", pg.evaluate("localStorage.getItem('cia-fish:v1')") == fb0 and pg.evaluate("localStorage.getItem('cia-why5:v1')") == w50)
    pg.evaluate("loadRecordIntoForm(DB.records.find(r=>r.id==='CA-EX-04'))"); pg.wait_for_timeout(60)
    check("CAPA: CA-EX-04 lists both its 5 Whys analysis (W5-EX-03) and its Fishbone analysis (FB-EX-02)", "W5-EX-03" in pg.inner_text("#w5Box") and "FB-EX-02" in pg.inner_text("#fbBox"))
    w5root = pg.evaluate("JSON.parse(localStorage.getItem('cia-why5:v1')).records.find(r=>r.id==='W5-EX-03').root")
    pg.click('[data-w5use="W5-EX-03"]'); pg.wait_for_timeout(60)
    check("CAPA: the 5 Whys 'Use this root cause' still works as before", pg.input_value("#f-root") == w5root)
    pg.evaluate("loadRecordIntoForm(DB.records.find(r=>r.id==='CA-EX-01'))"); pg.wait_for_timeout(60)
    check("CAPA: a 5 Whys record with no Fishbone analysis shows no Fishbone panel", pg.evaluate("document.getElementById('fbBox').hidden") and "W5-EX-01" in pg.inner_text("#w5Box"))
    pg.evaluate("window.__open=[]; window.open=function(u,t){ window.__open.push([u,t]); return null; }; 0")
    pg.evaluate("loadRecordIntoForm(DB.records.find(r=>r.id==='CA-EX-04'))"); pg.wait_for_timeout(40)
    pg.click('[data-fbopen="FB-EX-02"]'); pg.wait_for_timeout(40)
    pg.evaluate("loadRecordIntoForm(DB.records.find(r=>r.id==='CA-EX-02'))"); pg.click("#fbOpen"); pg.wait_for_timeout(40)
    check("CAPA outside the hub: links open Fishbone in a new tab on the analysis or prefilled from the record",
          pg.evaluate("window.__open") == [["./fishbone.html?open=FB-EX-02#tools", "_blank"], ["./fishbone.html?capa=CA-EX-02#tools", "_blank"]], pg.evaluate("window.__open"))
    pg.goto(BASE + "/modules/fishbone.html?open=FB-EX-02#tools"); pg.wait_for_function("typeof go==='function'"); pg.wait_for_timeout(150)
    check("Fishbone opens the analysis named in ?open=", pg.evaluate("curTab") == "tools" and pg.input_value("#rid") == "FB-EX-02" and pg.evaluate("document.querySelectorAll('#selBox .fb-ver').length") == 2)
    pg.goto(BASE + "/modules/fishbone.html?capa=CA-EX-03#tools"); pg.wait_for_function("typeof go==='function'"); pg.wait_for_timeout(150)
    check("Fishbone starts a new analysis from the CAPA record in ?capa=", pg.input_value("#rid") == "" and pg.input_value("#f-capa") == "CA-EX-03" and pg.input_value("#f-ref") == "EA-2026-02 / NC-2")
    pg.evaluate("window.__open=[]; window.open=function(u,t){ window.__open.push([u,t]); return null; }; 0")
    pg.evaluate("go('docs')"); pg.click('#docsBox [data-pdca="PD-EX-03"]'); pg.wait_for_timeout(40)
    check("outside the hub the record's 'PDCA ↗' opens PDCA in a new tab", pg.evaluate("window.__open") == [["./pdca.html#docs", "_blank"]], pg.evaluate("window.__open"))
    check("no errors in the link checks", not errs, errs[:5])
    # inside the hub: CAPA → Fishbone and Fishbone → 5 Whys in the overlay
    pg.goto(HUB, wait_until="load"); pg.wait_for_timeout(500)
    pg.evaluate("openModule('capa')"); pg.wait_for_function("document.getElementById('modFrame').dataset.k==='capa'"); pg.wait_for_timeout(700)
    fr = lambda js: pg.evaluate("(()=>{const w=document.getElementById('modFrame').contentWindow; return w.eval(%s);})()" % json.dumps(js))
    fr("go('tools'); loadRecordIntoForm(DB.records.find(r=>r.id==='CA-EX-04')); 0"); pg.wait_for_timeout(100)
    fr("document.querySelector('[data-fbopen=\"FB-EX-02\"]').click(); 0")
    pg.wait_for_function("document.getElementById('modFrame').dataset.k==='fish'", timeout=8000); pg.wait_for_timeout(900)
    check("in the hub, 'Open in Fishbone' opens the tool in the overlay on that analysis",
          fr("curTab") == "tools" and fr("document.getElementById('rid').value") == "FB-EX-02" and pg.evaluate("location.hash").startswith("#m=fish"), [fr("curTab"), fr("document.getElementById('rid').value")])
    check("the Fishbone navigation hint is removed after use", fr("sessionStorage.getItem('cia-nav:fishbone')") is None)
    check("inside the hub the verification shows the 'save first' note", "احفظ التحليل أولاً" in fr("document.getElementById('selBox').innerText"))
    fr("document.querySelector('#selBox [data-w5open=\"W5-EX-03\"]').click(); 0")
    pg.wait_for_function("document.getElementById('modFrame').dataset.k==='why5'", timeout=8000); pg.wait_for_timeout(900)
    check("in the hub, 'Open in 5 Whys' from a selected cause opens 5 Whys on W5-EX-03", fr("document.getElementById('rid').value") == "W5-EX-03" and "FB-EX-02" in fr("document.getElementById('fbFrom').innerText"))
    fr("document.querySelector('#fbFrom [data-fbopen=\"FB-EX-02\"]').click(); 0")
    pg.wait_for_function("document.getElementById('modFrame').dataset.k==='fish'", timeout=8000); pg.wait_for_timeout(900)
    check("in the hub, 5 Whys' 'Open in Fishbone' goes back to FB-EX-02", fr("document.getElementById('rid').value") == "FB-EX-02")
    fr("document.getElementById('cpOpen').click(); 0")
    pg.wait_for_function("document.getElementById('modFrame').dataset.k==='capa'", timeout=8000)
    check("in the hub, 'Open CAPA' opens CAPA in the overlay", pg.evaluate("document.getElementById('modFrame').dataset.k") == "capa")
    check("no errors in the hub link checks", not errs, errs[:5])
    ctx.close()

    # ---- 11. English, keyboard, 390 px (stacked diagram)
    ctx, pg, errs = page_new("en", 390, 844)
    check("English loads LTR", pg.evaluate("document.documentElement.dir") == "ltr" and pg.inner_text("#langLabel") == "العربية")
    pg.focus('#side button[data-go="home"]'); pg.keyboard.press("Tab"); pg.keyboard.press("Enter"); pg.wait_for_timeout(80)
    check("keyboard can switch tabs (focus next + Enter)", pg.evaluate("curTab") != "home", pg.evaluate("curTab"))
    pg.evaluate("go('tools')"); pg.focus("#f-title"); pg.keyboard.type("Keyboard analysis"); pg.keyboard.press("Tab")
    check("form fields reachable by keyboard", pg.input_value("#f-title") == "Keyboard analysis" and pg.evaluate("document.activeElement.id") == "f-ref")
    pg.evaluate("go('docs')"); pg.click("#pfEx"); pg.wait_for_timeout(250)
    pg.click('[data-open="FB-EX-02"]'); pg.wait_for_timeout(150)
    vis = pg.evaluate("(()=>{const w=document.querySelector('#fbDiag .fb-svgw'), s=document.querySelector('#fbDiag .fb-stack'); return {svg:getComputedStyle(w).display, stack:getComputedStyle(s).display, items:s.querySelectorAll('li').length, bones:s.querySelectorAll('.fb-sb').length}; })()")
    check("at 390 px the diagram switches to the stacked list of bones", vis["svg"] == "none" and vis["stack"] == "block" and vis["bones"] == 6 and vis["items"] >= 8, vis)
    check("the stacked list marks the selected causes", pg.evaluate("document.querySelectorAll('#fbDiag .fb-stack .fb-star').length") == 2)
    for tab in TABS:
        pg.evaluate(f"go('{tab}')"); pg.wait_for_timeout(60)
        sw = pg.evaluate("document.documentElement.scrollWidth")
        check(f"no horizontal scroll at 390px on {tab} (sw={sw})", sw <= 390, sw)
    check("English example text has no Arabic in the analyses", not re.search(r"[؀-ۿ]", pg.evaluate("JSON.stringify(DB.records.map(r=>[r.title,r.effect,r.root,r.bones]))")))
    pg.set_viewport_size({"width": 1280, "height": 900}); pg.evaluate("go('tools')"); pg.wait_for_timeout(150)
    ltr = pg.evaluate("(()=>{const s=document.querySelector('#fbDiag svg'); const h=s.querySelector('.fb-head text'); return {dir:s.getAttribute('direction'), headRight:+h.getAttribute('x') > +s.getAttribute('width')/2, shown:getComputedStyle(document.querySelector('#fbDiag .fb-svgw')).display!=='none'}; })()")
    check("at 1280 px in English the SVG shows, left to right with the head on the right", ltr == {"dir": "ltr", "headRight": True, "shown": True}, ltr)
    check("no JS errors in English/mobile run", not errs, errs[:5])
    ctx.close()
    b.close()

failed = [r for r in results if not r[1]]
print(f"\n{len(results) - len(failed)}/{len(results)} passed")
sys.exit(1 if failed else 0)
