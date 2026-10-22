"""5 Whys tool (modules/five-whys.html) — 2026-10-11. Same style as tests/capa/test_capa.py.
Covers: shared engine and layer identity, AR/EN and RTL/LTR, tabs, kit links both ways, self-assessment, the analysis form
(validation, stages, prompts, branches, stop rule, person-only flag, root-cause test, reading back, independent review),
records, audit, dashboard, report and CSV, persistence, example data, clear all, an analysis with missing parts, the CAPA
preview and prefill (CAPA only read), the CAPA panel and "Use this root cause", opening an analysis from CAPA (new tab and
hub overlay), the PDCA link, the assistant, the guided tour, keyboard use and 390 px.
Served over http when the platform server runs (CIA_BASE, default http://127.0.0.1:8802); W5_FILE=1 forces file:// URLs.
Usage: python3 tests/why5/test_why5.py"""
import os, sys, json, re
from playwright.sync_api import sync_playwright
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
MOD = os.path.join(ROOT, "modules")
BASE = "file://" + ROOT
if not os.environ.get("W5_FILE"):
    import urllib.request
    _b = os.environ.get("CIA_BASE", "http://127.0.0.1:8802")
    try:
        urllib.request.urlopen(_b + "/modules/five-whys.html", timeout=3).read(64); BASE = _b
    except Exception:
        pass
URL, CAPA, PDCA, HUB = BASE + "/modules/five-whys.html", BASE + "/modules/capa.html", BASE + "/modules/pdca.html", BASE + "/index.html"
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
w5, capa, pdca, tpl = read(os.path.join(MOD, "five-whys.html")), read(os.path.join(MOD, "capa.html")), read(os.path.join(MOD, "pdca.html")), read(os.path.join(ROOT, "templates", "explain-kit-template.html"))
e = [engine(x) for x in (pdca, capa, w5)]
check("engine block present once in pdca.html, capa.html and five-whys.html", all(x is not None for x in e))
check("engine block identical in the three files", len(set(e)) == 1 and len(e[0] or "") > 2000)
src = os.path.join(ROOT, "tests", "build", "engine.js")
check("engine block identical to tests/build/engine.js", (e[2] or "") == read(src).rstrip("\n"))
for tag, id_ in (("style", "cia-explain-kit-css"), ("script", "cia-explain-kit-js")):
    check(f"five-whys.html {id_} byte-identical to the template", block(w5, tag, id_) == block(tpl, tag, id_))
norm = lambda x: re.sub(r"var CFG=\{.*?\};", "var CFG={};", x or "", count=1)
check("tour script identical to capa.html apart from CFG", norm(block(w5, "script", "cia-tour-js")) == norm(block(capa, "script", "cia-tour-js")) and block(w5, "script", "cia-tour-js") != block(capa, "script", "cia-tour-js"))
check("tour CSS identical to capa.html", block(w5, "style", "cia-tour-css") == block(capa, "style", "cia-tour-css"))
check("tour CFG names five-whys and guards the example", 'var CFG={"file": "five-whys", "hasEx": true, "guard": {"pfEx": "all"}};' in w5)
i0 = w5.find("5 Whys tool — host logic")
check("storage key and schema documented at the top of the host script", 'STORE="cia-why5:v1"' in w5 and "Schema:" in w5[i0:i0 + 3000] and '"cia-capa:v1"' in w5[i0:i0 + 3000])
check("sidebar buttons and the CAPA panel never write another tool's key (no setItem on cia-capa/cia-pdca)",
      not re.search(r"setItem\((CAPA_KEY|PDCA_KEY|['\"]cia-(capa|pdca):v1)", w5) and not re.search(r"setItem\((WHY5_KEY|['\"]cia-why5:v1)", capa))

with sync_playwright() as p:
    b = p.chromium.launch()

    def page_new(lang="ar", w=1280, h=900, url=URL):
        ctx = b.new_context(viewport={"width": w, "height": h}, accept_downloads=True)
        pg = ctx.new_page(); errs = []
        pg.on("pageerror", lambda e: errs.append("pageerror: " + str(e)))
        pg.on("console", lambda m: errs.append("console." + m.type + ": " + m.text) if (m.type == "error" and "Failed to load resource" not in m.text) else None)
        pg.route(re.compile(r"fonts\.(googleapis|gstatic)\.com"), lambda r: r.abort())
        init = ("try{if(!sessionStorage.getItem('t0')){sessionStorage.setItem('t0','1');localStorage.setItem('cia-lang','%s');" % lang +
                "['five-whys','capa','pdca','smart-audit-improvement'].forEach(function(k){localStorage.setItem('cia-tour:m:'+k,'done');});localStorage.setItem('cia-tour:v1','done');}}catch(e){}")
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
    term = pg.inner_text("#w5Term")
    check("method tab says once that 5 Whys is a method, not a clause, and names 10.2.1 b) 2) and b) 3)",
          "ليست بنداً" in term and "10.2.1 ب) 2)" in term and "10.2.1 ب) 3)" in term and "A.10.2" in term and pg.evaluate("document.querySelectorAll('#w5Term').length") == 1, term[:200])
    check("method tab says five is a rule of thumb and when to stop", "قاعدة تقريبية" in term and "يسنده الدليل" in term)
    check("the explanation is marked as interpretive summary", "ملخص تفسيري" in term)
    std = pg.evaluate("document.getElementById('ex-std-box').innerText")
    check("method guide renders (kit) with the roles and the steps", len(std) > 400 and "من يحضر الجلسة" in std and "خطوات تحليل لماذا الخمس" in std, len(std))
    pg.evaluate("location.hash='#explain-cl'"); pg.wait_for_timeout(250)
    check("clause guide index shows 5 clauses", pg.evaluate("document.querySelectorAll('#ex-cl-box .ex-idx [data-ex-sec]').length") == 5)
    check("clause guide draws the cycle diagram", pg.evaluate("document.querySelectorAll('#ex-cl-box svg .ex-seg').length") == 5)
    pg.click('#ex-cl-box .ex-idx [data-ex-sec="10.2"]'); pg.wait_for_timeout(250)
    body = pg.evaluate("document.getElementById('ex-d-body').innerText")
    check("opening 10.2 shows 10.2.1 b 1 … b 3, the method rules and A.10.2", all(c in body for c in ["10.2.1 b 1", "10.2.1 b 2", "10.2.1 b 3", "GD-1", "GD-4", "A.10.2"]), body[:200])
    check("requirements are marked as interpretive summaries", "ملخص تفسيري" in pg.evaluate("CIAEX.open('10.2.1 b 2'), document.querySelector('#ex-d-body .ex-it.open').innerText"))
    check("method rules are marked as guidance, not normative text", "إرشاد تطبيقي" in pg.evaluate("CIAEX.open('GD-1'), document.querySelector('#ex-d-body .ex-it.open').innerText"))
    pg.keyboard.press("Escape"); pg.wait_for_timeout(200)
    info = pg.evaluate("({n:CIAEX.items.length, q:CIAEX.items.filter(i=>/^[A-Z]{2}\\d$/.test(i.q)).length, off:CIAEX.items.filter(i=>i.q==='x:tools').length})")
    check("kit: 14 items, 10 linked to the 10 questions, 4 outside the assessment", info == {"n": 14, "q": 10, "off": 4}, info)
    check("every question has an item", pg.evaluate("AQ.every(q=>CIAEX.items.some(i=>i.q===q[0]))"))
    check("meta.verified names the date and the source files", "2026-10-11" in pg.evaluate("EXPLAIN_WHY5.meta.verified.ar") and "ISO_9001_2026en 1.pdf" in pg.evaluate("EXPLAIN_WHY5.meta.verified.en"))
    check("ui labels set (roles, wheelT, purpose, smap, assess, assessOff, offGo, actCtx)", pg.evaluate("['roles','wheelT','purpose','smap','assess','assessOff','offGo','actCtx'].every(k=>EXPLAIN_WHY5.ui.ar[k]&&EXPLAIN_WHY5.ui.en[k])") and pg.evaluate("EXPLAIN_WHY5.ui.ar.wheelT") == "عجلة البنود")
    pg.evaluate("CIAEX.open('GD-1')"); pg.wait_for_timeout(120)
    pg.evaluate("document.querySelector('#ex-d-body .ex-it.open [data-ex-assess]').click()"); pg.wait_for_timeout(500)
    check("'Assess this' lands on question CH2, highlighted", pg.evaluate("curTab") == "assess" and pg.evaluate("!!document.querySelector('.ex-aq[data-id=\"CH2\"].ex-hl')"))
    pg.evaluate("go('explain-cl')"); pg.evaluate("CIAEX.open('A.10.2')"); pg.wait_for_timeout(120)
    off = pg.evaluate("(()=>{const it=document.querySelector('#ex-d-body .ex-it.open'); return {note:!!it.querySelector('.ex-act-off'), btn:!!it.querySelector('[data-ex-go=\"tools\"]')};})()")
    check("item outside the assessment shows the note and a button to the analysis", off == {"note": True, "btn": True}, off)
    pg.evaluate("document.querySelector('#ex-d-body .ex-it.open [data-ex-go]').click()"); pg.wait_for_timeout(200)
    check("the note's button opens the 5 Whys analysis tab", pg.evaluate("curTab") == "tools")
    pg.evaluate("go('assess')"); pg.wait_for_timeout(250)
    check("'Explain' back-link on each of the 10 questions", pg.evaluate("document.querySelectorAll('#asList .ex-qx[data-ex-q]').length") == 10)
    pg.evaluate("document.querySelector('.ex-aq[data-id=\"RT1\"] .ex-qx').click()"); pg.wait_for_timeout(200)
    check("'Explain' on RT1 opens GD-4 (root cause test)", pg.evaluate("!!document.querySelector('#ex-d-body .ex-it.open[data-code=\"GD-4\"]')"))
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
    check("English method card: not a clause, rule of thumb", "not a clause" in pg.inner_text("#w5Term") and "rule of thumb" in pg.inner_text("#w5Term"))
    pg.click("#langBtn"); pg.wait_for_timeout(200)
    check("toggle back to Arabic re-renders again", pg.evaluate("document.documentElement.dir") == "rtl" and "من يحضر الجلسة" in pg.evaluate("document.getElementById('ex-std-box').innerText"))

    # ---- 4. self-assessment
    pg.evaluate("go('assess')"); pg.wait_for_timeout(80)
    pg.check('input[name="as-PR1"][value="2"]'); pg.check('input[name="as-CH1"][value="1"]'); pg.wait_for_timeout(120)
    st = pg.evaluate("JSON.parse(localStorage.getItem('cia-why5:v1')).assess")
    check("assessment answers persisted under cia-why5:v1", st.get("PR1") == 2 and st.get("CH1") == 1, st)
    check("gauge value correct (15%)", pg.inner_text("#asPct") == "15%", pg.inner_text("#asPct"))
    check("score per stage group shown (4 groups)", pg.evaluate("document.querySelectorAll('#asStages .pd-bar').length") == 4)
    check("10 questions on a 0–2 scale", pg.evaluate("document.querySelectorAll('#asList .ex-aq').length") == 10 and pg.evaluate("document.querySelectorAll('#asList input[type=radio]').length") == 30)

    # ---- 5. analysis: validation, stages, chain, branch, flags, test, review
    pg.evaluate("go('tools')"); pg.wait_for_timeout(80)
    err = lambda: pg.inner_text("#recErr")
    stage = lambda: pg.inner_text("#curStage")
    save = lambda: (pg.click("#saveBtn"), pg.wait_for_timeout(60))
    check("a new form starts with the main chain and one empty why", pg.evaluate("document.querySelectorAll('.w5-chain').length") == 1 and pg.evaluate("document.querySelectorAll('.w5-why').length") == 1)
    save(); check("empty save is refused (title)", "عنوان" in err(), err())
    pg.fill("#f-title", "تأخر شهادات المطابقة للعميل"); save()
    check("missing problem refused (what happened)", "ماذا حدث" in err(), err())
    pg.fill("#f-what", "صدرت ثلاث شهادات مطابقة بعد موعد التسليم المتفق عليه."); pg.fill("#f-date", "2026-10-02"); save()
    check("valid analysis saves with id W5-2026-001, stage Problem", err() == "" and "W5-2026-001" in pg.inner_text("#recOk") and "تعريف المشكلة" in stage(), [err(), pg.inner_text("#recOk"), stage()])
    pg.fill("#w-0-0-a", "لأن الشهادة لا تُطلب قبل الشحن."); pg.fill("#w-0-0-ev", "قائمة الشحن SH-04")
    pg.select_option("#w-0-0-st", "ok"); pg.wait_for_timeout(40)
    check("first why asks about the problem", "صدرت ثلاث شهادات" in pg.inner_text("#w-0-0-q") and pg.inner_text("#w-0-0-q").endswith("؟"), pg.inner_text("#w-0-0-q"))
    pg.click('[data-wadd="0"]'); pg.wait_for_timeout(40)
    check("next why asks about the previous answer, without a full stop before the question mark", "لأن الشهادة لا تُطلب قبل الشحن؟" in pg.inner_text("#w-0-1-q"), pg.inner_text("#w-0-1-q"))
    pg.fill("#w-0-1-a", "لأن الموظف أهمل المتابعة."); pg.select_option("#w-0-1-st", "no"); save()
    check("with an answered why the stage is Chain of whys", "سلسلة لماذا" in stage(), stage())
    a1 = pg.evaluate("auditRecord(DB.records[0])")
    check("audit: two whys and no stop reason fail the depth check; a why without evidence and a 'not supported' answer fail", a1["depth"] is False and a1["ev"] is False and a1["sup"] is False, a1)
    pg.fill("#ch-0-s", "السبب الأخير في إجراء الشحن ويمكن تغييره."); pg.fill("#w-0-1-ev", "مقابلة المنسق"); pg.select_option("#w-0-1-st", "chk"); save()
    a1 = pg.evaluate("auditRecord(DB.records[0])")
    check("a recorded stop reason passes the depth check; evidence and no unsupported answer pass", a1["depth"] is True and a1["ev"] is True and a1["sup"] is True, a1)
    pg.fill("#f-root", "خطأ بشري من منسق الشحن."); pg.wait_for_timeout(40)
    check("a root cause naming only a person is flagged at once", pg.evaluate("!document.getElementById('personWarn').hidden") and "ما الذي في العملية" in pg.inner_text("#personWarn"))
    save(); check("with a root cause the stage is Root cause", "السبب الجذري" in stage(), stage())
    check("audit fails 'root is not a person alone' and the record shows the flag", pg.evaluate("auditRecord(DB.records[0]).person") is False and "يشير إلى شخص فقط" in tab_text(pg, "docs"))
    pg.evaluate("go('tools')")
    pg.fill("#f-root", "إجراء الشحن لا يجعل الشهادة شرطاً قبل خروج الشحنة."); pg.wait_for_timeout(40)
    check("the flag clears when the root names the process", pg.evaluate("document.getElementById('personWarn').hidden"))
    pg.select_option("#f-tstop", "part"); pg.wait_for_timeout(40)
    check("'only partly' shows the incomplete-test note", pg.evaluate("!document.getElementById('testWarn').hidden"))
    rev = pg.inner_text("#revBox")
    check("reading back runs from the deepest answer to the problem with 'therefore'", rev.find("أهمل المتابعة") < rev.find("لا تُطلب قبل الشحن") < rev.find("صدرت ثلاث شهادات") and "لذلك" in rev, rev[:300])
    pg.click("#chAdd"); pg.wait_for_timeout(40); pg.click("#chAdd"); pg.wait_for_timeout(40)
    check("up to two branches; the add button hides at the limit", pg.evaluate("document.querySelectorAll('.w5-chain').length") == 3 and pg.evaluate("document.getElementById('chAdd').hidden"))
    pg.fill("#ch-1-l", "النظام الإلكتروني"); pg.fill("#w-1-0-a", "لأن النظام لا ينبّه قبل موعد التسليم."); pg.fill("#w-1-0-ev", "إعدادات النظام"); pg.select_option("#w-1-0-st", "ok")
    pg.click('[data-chdel="2"]'); pg.wait_for_timeout(40)
    check("a branch can be removed", pg.evaluate("document.querySelectorAll('.w5-chain').length") == 2 and not pg.evaluate("document.getElementById('chAdd').hidden"))
    for i in range(8): pg.click('[data-wadd="1"]') if pg.is_visible('[data-wadd="1"]') else None
    check("at most 9 whys in a chain", pg.evaluate("document.querySelectorAll('.w5-chain[data-chain=\"1\"] .w5-why').length") == 9 and "9" in pg.inner_text('[data-wmax="1"]'))
    pg.evaluate("for(let j=8;j>0;j--) document.querySelector('[data-wdel=\"1:'+j+'\"]').click()"); pg.wait_for_timeout(40)
    pg.select_option("#f-tstop", "yes"); pg.check("#f-reads")
    pg.click("#tmAdd"); pg.fill("#teamRows tr:nth-child(1) [data-k='n']", "مدير الجودة"); pg.fill("#teamRows tr:nth-child(1) [data-k='role']", "ميسّر")
    pg.wait_for_timeout(40)
    check("a team without anyone who does the work is flagged", pg.evaluate("!document.getElementById('workWarn').hidden"))
    pg.click("#tmAdd"); pg.fill("#teamRows tr:nth-child(2) [data-k='n']", "منسق الشحن"); pg.check("#teamRows tr:nth-child(2) [data-k='work']"); pg.wait_for_timeout(40)
    check("adding a person who does the work clears the flag", pg.evaluate("document.getElementById('workWarn').hidden"))
    pg.select_option("#f-similar", "could"); pg.click("#cmAdd"); pg.fill("#cmRows tr:nth-child(1) [data-k='t']", "جعل الشهادة شرطاً في قائمة الشحن"); save()
    check("tested root cause: stage Root cause tested", "اختُبر السبب" in stage(), stage())
    rec = pg.evaluate("DB.records[0]")
    check("branch saved with its label and whys; empty whys dropped", len(rec["chains"]) == 2 and rec["chains"][1]["label"] == "النظام الإلكتروني" and len(rec["chains"][1]["whys"]) == 1, rec["chains"])
    check("audit: countermeasure without an owner fails, and the record shows the flag", pg.evaluate("auditRecord(DB.records[0]).cm") is False and "إجراء دون مالك" in tab_text(pg, "docs"))
    pg.evaluate("go('tools')")
    pg.fill("#cmRows tr:nth-child(1) [data-k='owner']", "مدير الجودة")
    pg.fill("#f-rby", "منسق الشحن"); pg.fill("#f-rdate", "2026-10-01"); save()
    check("review dated before the analysis is refused", "لا يسبق" in err(), err())
    pg.fill("#f-rdate", "2026-10-05"); pg.wait_for_timeout(40)
    check("a reviewer from the team is flagged", pg.evaluate("!document.getElementById('rvWarn').hidden"))
    save(); check("reviewed (stage) but the audit fails the independent review", "روجع التحليل" in stage() and pg.evaluate("auditRecord(DB.records[0]).rev") is False, stage())
    pg.fill("#f-rby", "مدير المشروع"); save()
    a2 = pg.evaluate("auditRecord(DB.records[0])")
    check("an outside reviewer passes the audit; every check passes except the reference", a2["rev"] is True and a2["ref"] is False and sum(1 for v in a2.values() if v is False) == 2 and a2["prob"] is False, a2)
    pg.fill("#f-ref", "CC-2026-031"); pg.fill("#f-where", "قسم الشحن"); pg.fill("#f-when", "سبتمبر 2026"); pg.fill("#f-much", "3 شهادات من 40"); save()
    check("all ten checks pass on a complete analysis", all(v is True for v in pg.evaluate("auditRecord(DB.records[0])").values()), pg.evaluate("auditRecord(DB.records[0])"))
    pg.click("#newBtn"); pg.wait_for_timeout(40)
    pg.fill("#f-title", "شكوى عميل عن تأخر التسليم"); pg.fill("#f-what", "تأخر تسليم دفعة واحدة أسبوعاً."); pg.select_option("#f-src", "cc")
    pg.fill("#w-0-0-a", "لأن الناقل تأخر."); save()
    check("second analysis saves as W5-2026-00x", "W5-2026-00" in pg.inner_text("#recOk"), pg.inner_text("#recOk"))
    check("no JS errors after the analysis flow", not errs, errs[:5])

    # ---- 6. records, audit, dashboard
    pg.evaluate("go('docs')"); pg.wait_for_timeout(80)
    d = pg.inner_text("#docsBox")
    check("records list both analyses with stage and flags", "CC-2026-031" in d and "شكوى عميل" in d and "يحتاج تحققاً: 1" in d, d[:300])
    check("sidebar count badge is 2", pg.inner_text("#cntDocs") == "2")
    pg.click('[data-open="W5-2026-001"]'); pg.wait_for_timeout(80)
    check("open loads the analysis into the form, with its branch", pg.input_value("#f-ref") == "CC-2026-031" and pg.evaluate("curTab") == "tools" and pg.evaluate("document.querySelectorAll('.w5-chain').length") == 2)
    pg.evaluate("go('audit')"); pg.wait_for_timeout(80)
    check("audit table lists the analyses with 10 checks", pg.evaluate("document.querySelectorAll('#auBox thead th').length") == 11 and "شكوى عميل" in pg.inner_text("#auBox"))
    check("audit KPI tiles present (4)", pg.evaluate("document.querySelectorAll('#auKpis .pd-kpi').length") == 4)
    pg.evaluate("go('dash')"); pg.wait_for_timeout(80)
    check("dashboard has 9 KPI tiles, stage and source bars and an open-items list", pg.evaluate("document.querySelectorAll('#dKpis .pd-kpi').length") == 9 and pg.evaluate("document.querySelectorAll('#dStage .pd-bar').length") == 5 and pg.evaluate("document.querySelectorAll('#dOpen li').length") >= 1)

    # ---- 7. report and CSV
    pg.evaluate("go('report')"); pg.wait_for_timeout(80)
    with pg.expect_download() as dl:
        pg.click("#rpHtml")
    html = open(dl.value.path(), encoding="utf-8").read()
    check("HTML report named 5Whys-report-*.html", dl.value.suggested_filename.startswith("5Whys-report-") and dl.value.suggested_filename.endswith(".html"), dl.value.suggested_filename)
    check("report draws each analysis as its chain with evidence, branch, reading back, audit, open items and sources",
          all(x in html for x in ["مدثر سلامه", "CC-2026-031", "قائمة الشحن SH-04", "النظام الإلكتروني", "لذلك", "Audit results", "Open items", "10.2", "not a requirement of any standard"]))
    check("report uses the shared engine frame (same CSS as PDCA and CAPA)", pg.evaluate("TBX.REPORT_CSS") in html)
    with pg.expect_download() as dl2:
        pg.click("#rpCsv")
    csv = open(dl2.value.path(), encoding="utf-8-sig").read()
    check("CSV header and rows", csv.splitlines()[0].startswith("id,ref,title,source,capa,pdca") and "CC-2026-031" in csv and "W5-2026-002" in csv, csv[:120])

    # ---- 8. persistence and delete
    pg.reload(wait_until="load"); pg.wait_for_function("typeof go==='function'"); pg.evaluate("go('docs')"); pg.wait_for_timeout(80)
    check("analyses persist after reload", "CC-2026-031" in pg.inner_text("#docsBox"))
    pg.click('[data-del="W5-2026-001"]'); pg.wait_for_timeout(40)
    check("first delete click arms confirmation", "تأكيد" in pg.inner_text("#docsBox"))
    pg.click('[data-del="W5-2026-001"]'); pg.wait_for_timeout(60)
    check("second click deletes", "CC-2026-031" not in pg.inner_text("#docsBox") and pg.evaluate("DB.records.length") == 1)
    check("no JS errors through the full flow", not errs, errs[:5])
    ctx.close()

    # ---- 9. identity, example, clear all, robustness, assistant, tour
    ctx, pg, errs = page_new("ar")
    check("home button back to the hub is present", pg.evaluate("!!document.getElementById('ciaHomeBtn')"))
    check("code badge 5W and Arabic brand line in AR", pg.inner_text(".brand-mark") == "5W" and "أكاديمية التحسين المستمر" in pg.inner_text("#brandBy"))
    check("language button reads English in AR", pg.inner_text("#langLabel") == "English")
    check("hero shows the academy logo and 'إعداد مدثر سلامه'", pg.evaluate("!!document.querySelector('.hero img[data-logo]').src.startsWith('data:image')") and "مدثر سلامه" in pg.inner_text(".hero .author"))
    check("sidebar uses SVG icons with tinted tiles (10)", pg.evaluate("document.querySelectorAll('#side button[data-t] .ic svg').length") == 10)
    check("launch grid has 9 tiles", pg.evaluate("document.querySelectorAll('#launchGrid a').length") == 9)
    check("related tools strip: CAPA, PDCA, Smart Audit, ISO 9001", pg.evaluate("[...document.querySelectorAll('#homeStd a.hs')].map(a=>a.getAttribute('href').split('/').pop()).join()") == "capa.html,pdca.html,smart-audit-improvement.html,iso9001.html")
    check("AI tab is a placeholder labelled under construction", "قيد البناء" in tab_text(pg, "ai"))
    pg.evaluate("go('docs')"); pg.click("#pfEx"); pg.wait_for_function("document.querySelectorAll('#docsBox tbody tr').length===3", timeout=5000)
    st = pg.evaluate("JSON.parse(localStorage.getItem('cia-why5:v1'))")
    check("example loads 3 analyses linked to CA-EX-01, CA-EX-03 and CA-EX-04", [r["capa"] for r in st["records"]] == ["CA-EX-01", "CA-EX-03", "CA-EX-04"])
    check("example stages: reviewed, tested (waiting for review), reviewed", pg.evaluate("DB.records.map(r=>stageOf(r)).join()") == "reviewed,tested,reviewed", pg.evaluate("DB.records.map(r=>stageOf(r)).join()"))
    check("the concrete analysis has a branch because two causes acted together", len(st["records"][2]["chains"]) == 2 and st["records"][2]["chains"][1]["label"] and "سببان" in st["records"][2]["root"])
    check("example dates are in 2026 and labelled illustrative", all(r["date"].startswith("2026") for r in st["records"]) and "توضيحية" in pg.inner_text("#exBox"))
    check("example self-assessment is 70%", pg.evaluate("assessScore()") == 70, pg.evaluate("assessScore()"))
    check("example audit: only the missing review of W5-EX-02 fails", pg.evaluate("DB.records.map(r=>Object.entries(auditRecord(r)).filter(x=>x[1]===false).map(x=>x[0]).join('+')).join('|')") == "|rev|", pg.evaluate("DB.records.map(r=>Object.entries(auditRecord(r)).filter(x=>x[1]===false).map(x=>x[0]).join('+')).join('|')"))
    for tab in TABS:
        tx = tab_text(pg, tab)
        bad = [w for w in ("undefined", "NaN", "[object Object]") if w in tx]
        check(f"example: {tab} has content and no undefined/NaN/[object Object]", len(tx.strip()) > 40 and not bad, bad)
    check("no errors with example data on every tab", not errs, errs[:5])
    check("assistant button and panel present", pg.evaluate("!!document.getElementById('cbFab') && !!document.getElementById('cbSub').textContent"))
    pg.click("#cbFab"); pg.wait_for_timeout(100)
    pg.click('#cbSug [data-sid="five"]'); pg.wait_for_timeout(80)
    check("assistant: five is a rule of thumb, with the clause it serves", "قاعدة تقريبية" in last_bot(pg) and "10.2.1" in last_bot(pg))
    pg.fill("#cbIn", "الجواب خطأ بشري، ماذا أفعل؟"); pg.press("#cbIn", "Enter"); pg.wait_for_timeout(80)
    check("assistant answers the human-error question", "العملية" in last_bot(pg))
    pg.fill("#cbIn", "ما البنود المفتوحة؟"); pg.press("#cbIn", "Enter"); pg.wait_for_timeout(80)
    check("assistant lists open items from the data", "EA-2026-02" in last_bot(pg), last_bot(pg)[:200])
    pg.click("#cbClose"); pg.wait_for_timeout(60)
    check("assistant has 4–6 method answers plus two that read the data", 4 <= pg.evaluate("KB.filter(k=>!k.dyn).length") <= 7 and pg.evaluate("KB.filter(k=>k.dyn).length") == 2)
    pg.evaluate("go('docs')"); pg.click("#pfReset"); pg.wait_for_timeout(100)
    check("clear all removes the stored data", pg.evaluate("localStorage.getItem('cia-why5:v1')") is None and "لا توجد تحليلات" in pg.inner_text("#docsBox"))
    pg.evaluate("localStorage.setItem('cia-why5:v1', JSON.stringify({records:[{id:'W5-X',title:'t',ref:'R-1'},{id:'W5-Y',ref:'R-2',prob:'x',team:'bad',chains:[null,{whys:'x'},{whys:[null,{a:'a',st:'odd'}]},{},{}],test:[1],cms:{},review:7},null,7],assess:{PR1:2}}))")
    pg.reload(wait_until="load"); pg.wait_for_function("typeof go==='function'")
    for tab in TABS: tab_text(pg, tab)
    pg.evaluate("go('docs')"); pg.click('[data-open="W5-Y"]'); pg.wait_for_timeout(80)
    dtx = tab_text(pg, "docs")
    check("analyses with missing or broken parts render without errors", (not errs) and "R-1" in dtx and "R-2" in dtx and pg.evaluate("DB.records[1].chains.length") <= 3, [errs[:3], dtx[:120]])
    pg.evaluate("localStorage.removeItem('cia-why5:v1')")
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

    # ---- 10. links with CAPA (read only both ways) and PDCA
    ctx, pg, errs = page_new("ar")
    pg.evaluate("go('tools')"); pg.click("#cpPrev"); pg.wait_for_timeout(80)
    check("without CAPA data the preview says so", "لا توجد سجلات CAPA" in pg.inner_text("#cpMsg"))
    pg.goto(CAPA); pg.wait_for_function("typeof go==='function'"); pg.evaluate("go('docs')"); pg.evaluate("document.getElementById('pfEx').click()"); pg.wait_for_timeout(300)
    capa0 = pg.evaluate("localStorage.getItem('cia-capa:v1')")
    pg.goto(PDCA); pg.wait_for_function("typeof go==='function'"); pg.evaluate("go('docs')"); pg.evaluate("document.getElementById('pfEx').click()"); pg.wait_for_timeout(300)
    pd0 = pg.evaluate("localStorage.getItem('cia-pdca:v1')")
    pg.goto(URL); pg.wait_for_function("typeof go==='function'"); pg.wait_for_timeout(150)
    check("home shows the CAPA records whose method is 5 Whys and have no analysis yet (1: CA-EX-03)", not pg.evaluate("document.getElementById('homeImp').hidden") and "1" in pg.inner_text("#homeImpT"), pg.inner_text("#homeImpT"))
    pg.click("#homeImpGo"); pg.wait_for_timeout(150)
    rows = pg.evaluate("document.querySelectorAll('#cpTable tbody tr').length")
    check("preview lists the 4 CAPA records with their stage and method", pg.evaluate("curTab") == "tools" and rows == 4 and "أعيد فتحه" in pg.inner_text("#cpTable") and "Fishbone" in pg.inner_text("#cpTable"), rows)
    pg.click('[data-cpuse="CA-EX-02"]'); pg.wait_for_timeout(120)
    check("'start from this record' prefills reference, CAPA link, PDCA link and the problem",
          pg.input_value("#f-ref") == "IA-2026-07 / F-03" and pg.input_value("#f-capa") == "CA-EX-02" and pg.input_value("#f-pdca") == "PD-EX-02" and "6 من 38" in pg.input_value("#f-what") and pg.input_value("#f-src") == "capa")
    check("the prefill message says nothing was written to CAPA", "لم يُكتب أي شيء في CAPA" in pg.inner_text("#recOk"))
    check("the CAPA record and the PDCA cycle names are read and shown", "IA-2026-07" in pg.inner_text("#cpInfo") and "معايرة" in pg.inner_text("#pdInfo") or "PD-EX-02" in pg.inner_text("#pdInfo"), [pg.inner_text("#cpInfo"), pg.inner_text("#pdInfo")])
    pg.fill("#w-0-0-a", "لأن السجل ورقي في كل موقع."); pg.fill("#f-root", "لا يوجد سجل معايرة موحد بتنبيه مسبق."); pg.click("#saveBtn"); pg.wait_for_timeout(80)
    check("the prefilled analysis saves", pg.inner_text("#recErr") == "" and pg.evaluate("DB.records[0].capa") == "CA-EX-02")
    check("CAPA and PDCA data were only read", pg.evaluate("localStorage.getItem('cia-capa:v1')") == capa0 and pg.evaluate("localStorage.getItem('cia-pdca:v1')") == pd0)
    pg.evaluate("window.__open=[]; window.open=function(u,t){ window.__open.push([u,t]); return null; }; 0")
    pg.click("#cpOpen"); pg.click("#pdOpen"); pg.wait_for_timeout(60)
    check("outside the hub 'Open CAPA' and 'Open PDCA' open new tabs", pg.evaluate("window.__open") == [["./capa.html#docs", "_blank"], ["./pdca.html#docs", "_blank"]], pg.evaluate("window.__open"))
    # CAPA panel
    pg.evaluate("go('docs')"); pg.click("#pfEx"); pg.wait_for_timeout(200)
    w50 = pg.evaluate("localStorage.getItem('cia-why5:v1')")
    pg.goto(CAPA); pg.wait_for_function("typeof go==='function'"); pg.evaluate("go('tools')"); pg.wait_for_timeout(80)
    check("CAPA: on a new record with method 5 Whys the 'Open the 5 Whys tool' button shows and the panel stays hidden",
          pg.evaluate("!document.getElementById('w5Open').hidden && document.getElementById('w5Box').hidden"))
    pg.select_option("#f-method", "fish"); pg.wait_for_timeout(40)
    check("CAPA: the button hides for another method", pg.evaluate("document.getElementById('w5Open').hidden"))
    pg.evaluate("loadRecordIntoForm(DB.records.find(r=>r.id==='CA-EX-01'))"); pg.wait_for_timeout(80)
    box = pg.inner_text("#w5Box")
    check("CAPA: the cause section lists the 5 Whys analysis naming CA-EX-01", "W5-EX-01" in box and "استخدم هذا السبب الجذري" in box and "W5-EX-02" not in box, box[:200])
    root_w5 = pg.evaluate("JSON.parse(localStorage.getItem('cia-why5:v1')).records.find(r=>r.id==='W5-EX-01').root")
    root_c0 = pg.input_value("#f-root")
    pg.click('[data-w5use="W5-EX-01"]'); pg.wait_for_timeout(60)
    check("CAPA: 'Use this root cause' copies the text into the form field", pg.input_value("#f-root") == root_w5 and root_w5 != root_c0 and "احفظ السجل" in pg.inner_text("#recOk"))
    check("CAPA: nothing is stored until the user saves", pg.evaluate("localStorage.getItem('cia-capa:v1')") == capa0)
    pg.click("#saveBtn"); pg.wait_for_timeout(80)
    check("CAPA: after saving, the record holds the copied root cause", pg.evaluate("DB.records.find(r=>r.id==='CA-EX-01').cause.root") == root_w5)
    check("CAPA never writes the 5 Whys key", pg.evaluate("localStorage.getItem('cia-why5:v1')") == w50)
    pg.evaluate("loadRecordIntoForm(DB.records.find(r=>r.id==='CA-EX-02'))"); pg.wait_for_timeout(60)
    check("CAPA: a record with method Fishbone and no analysis shows no panel", pg.evaluate("document.getElementById('w5Box').hidden"))
    pg.evaluate("loadRecordIntoForm(DB.records.find(r=>r.id==='CA-EX-04'))"); pg.wait_for_timeout(60)
    check("CAPA: a Fishbone record named by an analysis still lists it", "W5-EX-03" in pg.inner_text("#w5Box"))
    pg.evaluate("window.__open=[]; window.open=function(u,t){ window.__open.push([u,t]); return null; }; 0")
    pg.click('[data-w5open="W5-EX-03"]'); pg.wait_for_timeout(40)
    pg.evaluate("loadRecordIntoForm(DB.records.find(r=>r.id==='CA-EX-03'))"); pg.select_option("#f-method", "why5"); pg.click("#w5Open"); pg.wait_for_timeout(40)
    check("CAPA outside the hub: links open 5 Whys in a new tab on the analysis or prefilled from the record",
          pg.evaluate("window.__open") == [["./five-whys.html?open=W5-EX-03#tools", "_blank"], ["./five-whys.html?capa=CA-EX-03#tools", "_blank"]], pg.evaluate("window.__open"))
    pg.goto(BASE + "/modules/five-whys.html?open=W5-EX-03#tools"); pg.wait_for_function("typeof go==='function'"); pg.wait_for_timeout(150)
    check("5 Whys opens the analysis named in ?open=", pg.evaluate("curTab") == "tools" and pg.input_value("#rid") == "W5-EX-03" and pg.evaluate("document.querySelectorAll('.w5-chain').length") == 2)
    pg.goto(BASE + "/modules/five-whys.html?capa=CA-EX-03#tools"); pg.wait_for_function("typeof go==='function'"); pg.wait_for_timeout(150)
    check("5 Whys starts a new analysis from the CAPA record in ?capa=", pg.input_value("#rid") == "" and pg.input_value("#f-capa") == "CA-EX-03" and pg.input_value("#f-ref") == "EA-2026-02 / NC-2")
    check("no errors in the link checks", not errs, errs[:5])
    # inside the hub: CAPA → 5 Whys in the overlay, on the right analysis
    pg.goto(HUB, wait_until="load"); pg.wait_for_timeout(500)
    pg.evaluate("openModule('capa')"); pg.wait_for_function("document.getElementById('modFrame').dataset.k==='capa'"); pg.wait_for_timeout(700)
    fr = lambda js: pg.evaluate("(()=>{const w=document.getElementById('modFrame').contentWindow; return w.eval(%s);})()" % json.dumps(js))
    fr("go('tools'); loadRecordIntoForm(DB.records.find(r=>r.id==='CA-EX-04')); 0"); pg.wait_for_timeout(100)
    fr("document.querySelector('[data-w5open=\"W5-EX-03\"]').click(); 0")
    pg.wait_for_function("document.getElementById('modFrame').dataset.k==='why5'", timeout=8000); pg.wait_for_timeout(900)
    check("in the hub, 'Open in 5 Whys' opens the tool in the overlay on that analysis",
          fr("curTab") == "tools" and fr("document.getElementById('rid').value") == "W5-EX-03" and pg.evaluate("location.hash").startswith("#m=why5"), [fr("curTab"), fr("document.getElementById('rid').value")])
    check("the navigation hint is removed after use", fr("sessionStorage.getItem('cia-nav:five-whys')") is None)
    fr("document.getElementById('cpOpen').click(); 0")
    pg.wait_for_function("document.getElementById('modFrame').dataset.k==='capa'", timeout=8000)
    check("in the hub, 'Open CAPA' opens CAPA in the overlay", pg.evaluate("document.getElementById('modFrame').dataset.k") == "capa")
    check("no errors in the hub link checks", not errs, errs[:5])
    ctx.close()

    # ---- 11. English, keyboard, 390 px
    ctx, pg, errs = page_new("en", 390, 844)
    check("English loads LTR", pg.evaluate("document.documentElement.dir") == "ltr" and pg.inner_text("#langLabel") == "العربية")
    pg.focus('#side button[data-go="home"]'); pg.keyboard.press("Tab"); pg.keyboard.press("Enter"); pg.wait_for_timeout(80)
    check("keyboard can switch tabs (focus next + Enter)", pg.evaluate("curTab") != "home", pg.evaluate("curTab"))
    pg.evaluate("go('tools')"); pg.focus("#f-title"); pg.keyboard.type("Keyboard analysis"); pg.keyboard.press("Tab")
    check("form fields reachable by keyboard", pg.input_value("#f-title") == "Keyboard analysis" and pg.evaluate("document.activeElement.id") == "f-ref")
    pg.evaluate("go('docs')"); pg.click("#pfEx"); pg.wait_for_timeout(250)
    pg.click('[data-open="W5-EX-03"]'); pg.wait_for_timeout(150)
    for tab in TABS:
        pg.evaluate(f"go('{tab}')"); pg.wait_for_timeout(60)
        sw = pg.evaluate("document.documentElement.scrollWidth")
        check(f"no horizontal scroll at 390px on {tab} (sw={sw})", sw <= 390, sw)
    check("English example text has no Arabic in the analyses", not re.search(r"[؀-ۿ]", pg.evaluate("JSON.stringify(DB.records.map(r=>[r.title,r.prob,r.root,r.chains]))")))
    check("no JS errors in English/mobile run", not errs, errs[:5])
    ctx.close()
    b.close()

failed = [r for r in results if not r[1]]
print(f"\n{len(results) - len(failed)}/{len(results)} passed")
sys.exit(1 if failed else 0)
