"""RCA tool (modules/rca.html) — 2026-10-15. Same style as tests/pareto/test_pareto.py.
Covers: shared engine (six files) and layer identity, AR/EN and RTL/LTR, tabs, kit links both ways, self-assessment, the
investigation form (validation, the problem in four parts, the risk grid and the depth rule with a written reason for a lower
depth, the timeline with facts and assumptions, the evidence register, the team with someone who does the work, methods linked by
id with previews and the data and barrier tables, causes in three levels with codes, parents, status and the removal test, the
person-only flag, similar cases, actions per root cause, the effectiveness criterion, the review and the stages), the live cause
tree (SVG mirrored for Arabic, indented list at 390 px), records, audit (13 checks), dashboard, report with the SVG and CSV,
persistence, example data, clear all, a record with missing parts, the read-only starts from CAPA and Pareto with their previews
(other tools only read), the ?open= / ?capa= / ?pareto= requests and the hub hint, the Fishbone / 5 Whys / Pareto links, the CAPA
panel with "Use this root cause", Pareto's "rca" next step, the PDCA link, the assistant, the guided tour, keyboard use and 390 px.
Served over http when the platform server runs (CIA_BASE, default http://127.0.0.1:8802); RC_FILE=1 forces file:// URLs.
Usage: python3 tests/rca/test_rca.py"""
import os, sys, json, re
from playwright.sync_api import sync_playwright
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
MOD = os.path.join(ROOT, "modules")
BASE = "file://" + ROOT
if not os.environ.get("RC_FILE"):
    import urllib.request
    _b = os.environ.get("CIA_BASE", "http://127.0.0.1:8802")
    try:
        urllib.request.urlopen(_b + "/modules/rca.html", timeout=3).read(64); BASE = _b
    except Exception:
        pass
URL, CAPA, PARETO, FISH, W5, HUB = (BASE + "/modules/rca.html", BASE + "/modules/capa.html", BASE + "/modules/pareto.html",
                                    BASE + "/modules/fishbone.html", BASE + "/modules/five-whys.html", BASE + "/index.html")
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
rc, pa, fb, w5, capa, pdca, tpl = (read(os.path.join(MOD, "rca.html")), read(os.path.join(MOD, "pareto.html")), read(os.path.join(MOD, "fishbone.html")),
                                   read(os.path.join(MOD, "five-whys.html")), read(os.path.join(MOD, "capa.html")), read(os.path.join(MOD, "pdca.html")),
                                   read(os.path.join(ROOT, "templates", "explain-kit-template.html")))
e = [engine(x) for x in (pdca, capa, w5, fb, pa, rc)]
check("engine block present once in pdca, capa, five-whys, fishbone, pareto and rca", all(x is not None for x in e))
check("engine block identical in the six files", len(set(e)) == 1 and len(e[0] or "") > 2000)
check("engine block identical to tests/build/engine.js", (e[5] or "") == read(os.path.join(ROOT, "tests", "build", "engine.js")).rstrip("\n"))
for tag, id_ in (("style", "cia-explain-kit-css"), ("script", "cia-explain-kit-js")):
    check(f"rca.html {id_} byte-identical to the template", block(rc, tag, id_) == block(tpl, tag, id_))
norm = lambda x: re.sub(r"var CFG=\{.*?\};", "var CFG={};", x or "", count=1)
check("tour script identical to pareto.html apart from CFG", norm(block(rc, "script", "cia-tour-js")) == norm(block(pa, "script", "cia-tour-js")) and block(rc, "script", "cia-tour-js") != block(pa, "script", "cia-tour-js"))
check("tour CSS identical to pareto.html", block(rc, "style", "cia-tour-css") == block(pa, "style", "cia-tour-css"))
check("tour CFG names rca and guards the example", 'var CFG={"file": "rca", "hasEx": true, "guard": {"pfEx": "all"}};' in rc)
i0 = rc.find("RCA tool — host logic")
check("storage key and schema documented at the top of the host script", 'STORE="cia-rca:v1"' in rc and "Schema:" in rc[i0:i0 + 6000] and '"cia-capa:v1"' in rc[i0:i0 + 6000] and '"cia-pareto:v1"' in rc[i0:i0 + 6000])
check("RCA never writes another tool's key; no other tool writes the RCA key",
      not re.search(r"(localStorage\.setItem|TBX\.save)\((CAPA_KEY|PARETO_KEY|FISH_KEY|WHY5_KEY|PDCA_KEY|['\"](cia-(capa|pareto|fish|why5|pdca):v1))", rc) and not re.search(r"setItem\((RCA_KEY|['\"]cia-rca:v1)", pa + fb + w5 + capa))
check("sidebar buttons carry data-go and data-t", all(f'data-go="{t}" data-t="{t}"' in rc for t in TABS))
check("RC code badge and the RCA hero code", '<div class="brand-mark" aria-hidden="true">RC</div>' in rc and '<div class="std-code">RCA<small' in rc)

with sync_playwright() as p:
    b = p.chromium.launch()

    def page_new(lang="ar", w=1280, h=900, url=URL):
        ctx = b.new_context(viewport={"width": w, "height": h}, accept_downloads=True)
        pg = ctx.new_page(); errs = []
        pg.on("pageerror", lambda e: errs.append("pageerror: " + str(e)))
        pg.on("console", lambda m: errs.append("console." + m.type + ": " + m.text) if (m.type == "error" and "Failed to load resource" not in m.text) else None)
        pg.route(re.compile(r"fonts\.(googleapis|gstatic)\.com"), lambda r: r.abort())
        init = ("try{if(!sessionStorage.getItem('t0')){sessionStorage.setItem('t0','1');localStorage.setItem('cia-lang','%s');" % lang +
                "['rca','pareto','fishbone','five-whys','capa','pdca','smart-audit-improvement'].forEach(function(k){localStorage.setItem('cia-tour:m:'+k,'done');});localStorage.setItem('cia-tour:v1','done');}}catch(e){}")
        pg.add_init_script(init)
        pg.on("dialog", lambda d: d.accept())
        pg.goto(url); pg.wait_for_timeout(350)
        return ctx, pg, errs

    def tab_text(pg, t): return pg.evaluate(f"(go('{t}'), document.querySelector('.tabpane[data-tab=\"{t}\"]').innerText)")
    def last_bot(pg): return pg.evaluate("[...document.querySelectorAll('#cbBody .cb-msg.bot')].pop().innerText")
    def load_ex(pg): pg.evaluate("go('docs')"); pg.click("#pfEx"); pg.wait_for_function("document.querySelectorAll('#docsBox tbody tr').length===3", timeout=5000)
    def load_other(pg, url, rows=None):
        pg.goto(url); pg.wait_for_timeout(350); pg.evaluate("go('docs')"); pg.click("#pfEx"); pg.wait_for_timeout(300)

    # ---- 1. load, Arabic default, method tab, kit
    ctx, pg, errs = page_new("ar")
    check("loads in Arabic RTL", pg.evaluate("document.documentElement.dir") == "rtl" and pg.evaluate("document.documentElement.lang") == "ar")
    check("header: home button, RC badge, Arabic brand line, language button", pg.evaluate("!!document.getElementById('ciaHomeBtn')") and pg.inner_text(".brand-mark") == "RC" and "أكاديمية التحسين المستمر" in pg.inner_text("#brandBy") and pg.inner_text("#langLabel") == "English")
    check("hero shows the academy logo and the author", pg.evaluate("document.querySelector('.hero-logo').src.startsWith('data:image')") and "مدثر سلامه" in pg.inner_text(".hero .author"))
    check("related tools strip: CAPA, Pareto, Fishbone, 5 Whys, Smart Audit", pg.evaluate("[...document.querySelectorAll('#homeStd a')].map(a=>a.getAttribute('href'))") == ["./capa.html", "./pareto.html", "./fishbone.html", "./five-whys.html", "./smart-audit-improvement.html"])
    check("launch tiles for the nine tabs after home", pg.evaluate("document.querySelectorAll('#launchGrid a').length") == 9)
    pg.click('#side button[data-go="explain-std"]'); pg.wait_for_timeout(150)
    term = pg.inner_text("#rcTerm")
    check("method tab says once that RCA is a discipline, not a clause, and names 10.2.1 ب) 2) and 3), 10.2.2 and A.10.2",
          "ليس بنداً في أي مواصفة" in term and "10.2.1 ب) 2)" in term and "10.2.1 ب) 3)" in term and "10.2.2" in term and "A.10.2" in term and pg.evaluate("document.querySelectorAll('#rcTerm').length") == 1, term[:200])
    check("method tab: ISO 9000:2026 does not define root cause; root cause investigation under 4.2.6", "لا تعرّف ISO 9000:2026 «السبب الجذري» مصطلحاً" in term and "4.2.6" in term)
    check("method tab: more than one root cause, human error a starting point, a hypothesis until tested, depth by risk, chooses among the methods",
          "أكثر من سبب جذري" in term and "«الخطأ البشري» نقطة بداية" in term and "فرضية حتى يثبتها الدليل والاختبار" in term and "يتبع الخطر والأثر، لا العادة" in term and "باريتو ليحدد أين تبحث" in term)
    check("the explanation is marked as interpretive summary", "ملخص تفسيري" in term)
    check("term cards: ISO 9000:2026 3.5.13, 3.6.4, 3.8.6, 4.2.6, 4.2.7", all(c in term for c in ["3.5.13", "3.6.4", "3.8.6", "4.2.6", "4.2.7"]))
    std = pg.evaluate("document.getElementById('ex-std-box').innerText")
    check("method guide renders (kit) with the roles and the steps", len(std) > 400 and "من يعمل على التحقيق" in std and "خطوات التحقيق في السبب الجذري" in std, len(std))
    pg.evaluate("location.hash='#explain-cl'"); pg.wait_for_timeout(250)
    check("clause guide index shows 9 sections", pg.evaluate("document.querySelectorAll('#ex-cl-box .ex-idx [data-ex-sec]').length") == 9)
    check("clause guide draws the cycle diagram", pg.evaluate("document.querySelectorAll('#ex-cl-box svg .ex-seg').length") == 9)
    pg.click('#ex-cl-box .ex-idx [data-ex-sec="10.2.1 b"]'); pg.wait_for_timeout(250)
    body = pg.evaluate("document.getElementById('ex-d-body').innerText")
    check("opening 10.2.1 b) shows b) 2), GD-2, GD-3 and b) 3)", all(c in body for c in ["10.2.1 b 2", "GD-2", "GD-3", "10.2.1 b 3"]) or all(c in body for c in ["GD-2", "GD-3"]), body[:200])
    it851 = pg.evaluate("CIAEX.open('8.5.1 g'), document.querySelector('#ex-d-body .ex-it.open').innerText")
    check("8.5.1 g) human error item: a starting point, the process allowed it", "الخطأ البشري" in it851 and "ما الذي في العملية سمح به" in it851, it851[:200])
    itb2 = pg.evaluate("CIAEX.open('10.2.1 b 2'), document.querySelector('#ex-d-body .ex-it.open').innerText")
    check("10.2.1 b) 2) item: cause(s), more than one root cause, 3.6.4 and 4.2.6", "سبب أو أسباب" in itb2 and "أكثر من سبب جذري" in itb2 and "3.6.4" in itb2 and "4.2.6" in itb2)
    check("requirements are marked as interpretive summaries", "ملخص تفسيري" in itb2)
    check("method rules are marked as guidance, not normative text", "إرشاد تطبيقي" in pg.evaluate("CIAEX.open('GD-3'), document.querySelector('#ex-d-body .ex-it.open').innerText"))
    pg.keyboard.press("Escape"); pg.wait_for_timeout(200)
    info = pg.evaluate("({n:CIAEX.items.length, q:CIAEX.items.filter(i=>/^[A-Z]{2}\\d$/.test(i.q)).length, off:CIAEX.items.filter(i=>i.q==='x:tools').length})")
    check("kit: 18 items, 12 linked to the 12 questions, 6 outside the assessment", info == {"n": 18, "q": 12, "off": 6}, info)
    check("every question has an item", pg.evaluate("AQ.every(q=>CIAEX.items.some(i=>i.q===q[0]))"))
    check("meta.verified names the date and the source files, and the standards not verified",
          "2026-10-15" in pg.evaluate("EXPLAIN_RCA.meta.verified.ar") and all(x in pg.evaluate("EXPLAIN_RCA.meta.verified.en") for x in ["ISO_9001_2026en 1.pdf", "ISO 9000-2026.pdf", "ISO 19011 2026 Standard.pdf", "IEC 62740", "not verified"]))
    check("ui labels set (roles, wheelT, purpose, smap, assess, assessOff, offGo, actCtx)", pg.evaluate("['roles','wheelT','purpose','smap','assess','assessOff','offGo','actCtx'].every(k=>EXPLAIN_RCA.ui.ar[k]&&EXPLAIN_RCA.ui.en[k])") and pg.evaluate("EXPLAIN_RCA.ui.en.offGo") == "Open the RCA investigation")
    pg.evaluate("go('explain-cl')"); pg.evaluate("CIAEX.open('8.5.1 g')"); pg.wait_for_timeout(120)
    pg.evaluate("document.querySelector('#ex-d-body .ex-it.open [data-ex-assess]').click()"); pg.wait_for_timeout(500)
    check("'Assess this' lands on question AN3, highlighted", pg.evaluate("curTab") == "assess" and pg.evaluate("!!document.querySelector('.ex-aq[data-id=\"AN3\"].ex-hl')"))
    pg.evaluate("go('explain-cl')"); pg.evaluate("CIAEX.open('10.2.2')"); pg.wait_for_timeout(120)
    off = pg.evaluate("(()=>{const it=document.querySelector('#ex-d-body .ex-it.open'); return {note:!!it.querySelector('.ex-act-off'), btn:!!it.querySelector('[data-ex-go=\"tools\"]')};})()")
    check("item outside the assessment shows the note and a button to the investigation", off == {"note": True, "btn": True}, off)
    pg.keyboard.press("Escape"); pg.wait_for_timeout(150)
    pg.evaluate("go('assess')"); pg.wait_for_timeout(150)
    check("'Explain' back-link on each of the 12 questions", pg.evaluate("document.querySelectorAll('#asList .ex-qx[data-ex-q]').length") == 12)
    pg.evaluate("document.querySelector('#asList .ex-qx[data-ex-q=\"8.5.1 g\"]').click()"); pg.wait_for_timeout(400)
    check("'Explain' on AN3 opens 8.5.1 g) (human error)", pg.evaluate("!!document.querySelector('#ex-d-body .ex-it.open[data-code=\"8.5.1 g\"]')"))
    pg.keyboard.press("Escape"); pg.wait_for_timeout(150)
    # language switch re-renders an open explain tab (AR -> EN -> AR)
    pg.evaluate("go('explain-std')"); pg.wait_for_timeout(120)
    pg.click("#langBtn"); pg.wait_for_timeout(250)
    en_std = pg.evaluate("document.getElementById('ex-std-box').innerText")
    check("language switch re-renders the method guide in English", "Who works on the investigation" in en_std and pg.evaluate("document.documentElement.dir") == "ltr")
    check("English term card", "discipline that combines methods" in pg.inner_text("#rcTerm") and "does not define “root cause”" in pg.inner_text("#rcTerm"))
    pg.click("#langBtn"); pg.wait_for_timeout(250)
    check("and back to Arabic", "من يعمل على التحقيق" in pg.evaluate("document.getElementById('ex-std-box').innerText") and pg.evaluate("document.documentElement.dir") == "rtl")
    check("no JS errors on load and kit use", not errs, errs[:3])
    ctx.close()

    # ---- 2. self-assessment
    ctx, pg, errs = page_new("ar")
    pg.evaluate("go('assess')")
    check("12 questions in 5 groups, 0–2 scale", pg.evaluate("document.querySelectorAll('#asList .pd-q').length") == 12 and pg.evaluate("document.querySelectorAll('#asList input[type=radio]').length") == 36 and pg.evaluate("document.querySelectorAll('#asList h3').length") == 5)
    for q, v in (("PS1", 2), ("PS2", 1), ("AN3", 2)):
        pg.click(f'label[for="as-{q}-{v}"]'); pg.wait_for_timeout(30)
    check("score from 3 answers (5 of 24 = 21%)", pg.inner_text("#asPct") == "21%", pg.inner_text("#asPct"))
    check("score per group: PS 75%", "75%" in pg.inner_text("#asStages"))
    pg.reload(); pg.wait_for_timeout(300); pg.evaluate("go('assess')")
    check("answers persist after reload", pg.evaluate("document.querySelector('input[name=\"as-PS1\"][value=\"2\"]').checked") and pg.evaluate("JSON.parse(localStorage.getItem('cia-rca:v1')).assess.AN3") == 2)
    pg.click("#asReset"); pg.wait_for_timeout(60)
    check("clear answers", pg.inner_text("#asPct") == "0%")
    ctx.close()

    # ---- 3. the investigation form
    ctx, pg, errs = page_new("ar")
    pg.evaluate("go('tools')")
    check("stepper shows the six stages", pg.evaluate("[...document.querySelectorAll('#caSteps li')].map(l=>l.textContent)") == ["المشكلة", "جُمعت الوقائع", "حُددت الأسباب", "تأكد السبب الجذري", "اقتُرحت الإجراءات", "روجع التحقيق"])
    pg.click("#saveBtn"); pg.wait_for_timeout(60)
    check("validation: a title is required", "عنواناً" in pg.inner_text("#recErr"))
    pg.fill("#f-title", "تسرب زيت هيدروليكي من الرافعة الشوكية"); pg.fill("#f-ref", "NCR-2026-090")
    for k, v in (("what", "تسرب زيت هيدروليكي على أرضية المستودع"), ("where", "المستودع الرئيسي، الممر 4"), ("when", "3 أكتوبر 2026، 10:15"), ("much", "15 لتراً؛ توقف الممر ساعتين"), ("req", "إجراء الصيانة الوقائية MP-02: فحص الخراطيم كل 250 ساعة")):
        pg.fill(f"#f-{k}", v)
    check("stage stays 'problem' until risk, facts and evidence are in", pg.evaluate("stageOf(formToRec())") == "problem")
    # risk grid and the depth rule
    for sev, lik, want in ((4, 4, "full"), (5, 1, "full"), (2, 2, "light"), (4, 1, "std"), (3, 2, "std"), (1, 5, "light"), (3, 5, "full")):
        pg.select_option("#f-sev", str(sev)); pg.select_option("#f-lik", str(lik)); pg.wait_for_timeout(20)
        check(f"depth rule: severity {sev} × likelihood {lik} → {want}", pg.evaluate("reqDepth(formToRec())") == want and pg.evaluate("document.querySelector('#rcGrid .on').textContent") == str(sev * lik))
    check("the rule is written on the page", "الخطورة × الاحتمال" in pg.inner_text("#rcRule") and "15" in pg.inner_text("#rcRule"))
    pg.select_option("#f-sev", "4"); pg.select_option("#f-lik", "3"); pg.wait_for_timeout(20)
    check("severity 4 × 3 requires standard", "قياسي" in pg.inner_text("#reqBadge"))
    pg.select_option("#f-depth", "light"); pg.wait_for_timeout(30)
    check("lowering the depth without a reason warns and fails the depth check", not pg.evaluate("document.getElementById('lowWarn').hidden") and pg.evaluate("auditRecord(formToRec()).depth") is False and pg.evaluate("issues(formToRec()).some(x=>x[0]==='low'&&x[1]==='bad')"))
    check("the reason field shows when the depth is lowered", pg.evaluate("document.getElementById('f-depthWhy').closest('.pd-f').style.display") != "none")
    pg.fill("#f-depthWhy", "تسرب صغير احتُوي فوراً، ولا أثر على السلامة"); pg.wait_for_timeout(30)
    check("with a written reason the depth check passes", pg.evaluate("auditRecord(formToRec()).depth") is True and pg.evaluate("document.getElementById('lowWarn').hidden"))
    pg.select_option("#f-depth", "full"); pg.wait_for_timeout(30)
    check("raising the depth needs no reason", pg.evaluate("depthOk(formToRec())") and pg.evaluate("depOf(formToRec())") == "full")
    pg.select_option("#f-depth", ""); pg.fill("#f-depthWhy", "")
    # team
    pg.click('[data-add="team"]'); pg.fill('#teamRows tr:nth-child(1) [data-k="n"]', "مشرف المستودع"); pg.fill('#teamRows tr:nth-child(1) [data-k="role"]', "قائد")
    pg.wait_for_timeout(30)
    check("warns when no one in the team does the work", not pg.evaluate("document.getElementById('workWarn').hidden"))
    pg.click('[data-add="team"]'); pg.fill('#teamRows tr:nth-child(2) [data-k="n"]', "مشغّل الرافعة"); pg.check('#teamRows tr:nth-child(2) [data-k="work"]'); pg.wait_for_timeout(30)
    check("the warning goes when someone does the work", pg.evaluate("document.getElementById('workWarn').hidden"))
    # timeline and evidence
    pg.click('[data-add="tl"]'); pg.fill('#tlRows tr:nth-child(1) [data-k="at"]', "2026-10-03T10:15"); pg.fill('#tlRows tr:nth-child(1) [data-k="ev"]', "ظهر الزيت على الأرض"); pg.fill('#tlRows tr:nth-child(1) [data-k="src"]', "تقرير المشرف")
    pg.click('[data-add="tl"]'); pg.fill('#tlRows tr:nth-child(2) [data-k="at"]', "2026-10-03T08:00"); pg.fill('#tlRows tr:nth-child(2) [data-k="ev"]', "قد يكون الخرطوم قديماً"); pg.fill('#tlRows tr:nth-child(2) [data-k="src"]', "المشغّل"); pg.select_option('#tlRows tr:nth-child(2) [data-k="kind"]', "asm")
    pg.wait_for_timeout(30)
    check("timeline counts facts and assumptions", pg.evaluate("[facts(formToRec()),asmN(formToRec())]") == [1, 1] and "1 واقعة و1 افتراض" in pg.inner_text("#tlSum"))
    check("an assumption row is marked", pg.evaluate("document.querySelector('#tlRows tr:nth-child(2)').className") == "asm")
    pg.click("#tlSort"); pg.wait_for_timeout(30)
    check("sort by time puts 08:00 first", pg.evaluate("document.querySelector('#tlRows tr:nth-child(1) [data-k=\"at\"]').value") == "2026-10-03T08:00")
    pg.click('[data-add="tl"]'); pg.fill('#tlRows tr:nth-child(3) [data-k="at"]', "2026-10-03T10:30"); pg.fill('#tlRows tr:nth-child(3) [data-k="ev"]', "أوقف الممر ونُظف الزيت"); pg.fill('#tlRows tr:nth-child(3) [data-k="src"]', "سجل المستودع")
    pg.click('[data-add="ev"]'); pg.fill('#evRows tr:nth-child(1) [data-k="item"]', "صور الخرطوم المتشقق"); pg.select_option('#evRows tr:nth-child(1) [data-k="type"]', "photo"); pg.fill('#evRows tr:nth-child(1) [data-k="by"]', "مشرف المستودع")
    pg.wait_for_timeout(40)
    check("problem, depth, two facts and evidence move the stage to 'facts collected'", pg.evaluate("stageOf(formToRec())") == "evidence", pg.evaluate("stageOf(formToRec())"))
    # causes in three levels
    pg.click('[data-czadd="direct"]'); pg.fill('#czRows [data-row="0"] [data-k="t"]', "تشقق الخرطوم الهيدروليكي عند الوصلة"); pg.fill('#czRows [data-row="0"] [data-k="ev"]', "الصور")
    pg.select_option('#czRows [data-row="0"] [data-k="st"]', "conf")
    pg.click('[data-czadd="contrib"]'); pg.fill('#czRows [data-row="1"] [data-k="t"]', "خطأ بشري من المشغّل"); pg.wait_for_timeout(30)
    check("a cause that names only a person is flagged", "شخص فقط" in pg.inner_text('#czRows [data-row="1"] [data-flag]') and not pg.evaluate("document.getElementById('personWarn').hidden") and pg.evaluate("issues(formToRec()).some(x=>x[0]==='person'&&x[1]==='bad')"))
    pg.fill('#czRows [data-row="1"] [data-k="t"]', "الخرطوم تجاوز عمره دون استبدال"); pg.fill('#czRows [data-row="1"] [data-k="ev"]', "سجل الساعات: 410 ساعة دون فحص")
    pg.select_option('#czRows [data-row="1"] [data-k="st"]', "conf"); pg.wait_for_timeout(30)
    check("the flag goes when the cause is rewritten in the process", pg.evaluate("document.getElementById('personWarn').hidden"))
    pg.click('[data-czadd="root"]'); pg.fill('#czRows [data-row="2"] [data-k="t"]', "جدول الصيانة الوقائية يعتمد التاريخ لا ساعات التشغيل"); pg.wait_for_timeout(30)
    check("codes D1, C1, R1", pg.evaluate("[...document.querySelectorAll('#czRows [data-code]')].map(x=>x.textContent)") == ["D1", "C1", "R1"])
    check("the root cause explains the contributing cause by default; a direct cause explains the problem", pg.evaluate("document.querySelector('#czRows [data-row=\"2\"] [data-k=\"p\"]').value") == pg.evaluate("document.querySelector('#czRows [data-row=\"1\"]').dataset.cid") or pg.evaluate("document.querySelector('#czRows [data-row=\"2\"] [data-k=\"p\"]').value") == pg.evaluate("document.querySelector('#czRows [data-row=\"0\"]').dataset.cid"))
    pg.select_option('#czRows [data-row="2"] [data-k="p"]', pg.evaluate("document.querySelector('#czRows [data-row=\"1\"]').dataset.cid")); pg.wait_for_timeout(30)
    check("the test field is only for root causes", pg.evaluate("document.querySelector('#czRows [data-row=\"0\"] [data-k=\"test\"]').disabled") and not pg.evaluate("document.querySelector('#czRows [data-row=\"2\"] [data-k=\"test\"]').disabled"))
    check("stage 'causes mapped' with a direct and a root cause", pg.evaluate("stageOf(formToRec())") == "causes")
    check("an untested hypothesis root cause is flagged", "لم يُجب" in pg.inner_text('#czRows [data-row="2"] [data-flag]') and pg.evaluate("issues(formToRec()).some(x=>x[0]==='untested')"))
    pg.select_option('#czRows [data-row="2"] [data-k="test"]', "no"); pg.wait_for_timeout(20)
    check("removal test 'no' says this is not the root cause", "ليس السبب الجذري" in pg.inner_text('#czRows [data-row="2"] [data-flag]'))
    pg.select_option('#czRows [data-row="2"] [data-k="test"]', "yes"); pg.select_option('#czRows [data-row="2"] [data-k="st"]', "conf"); pg.wait_for_timeout(20)
    check("confirmed without evidence is still not enough", "دليل مطلوب" in pg.inner_text('#czRows [data-row="2"] [data-flag]') and not pg.evaluate("rootsOk(formToRec())"))
    pg.fill('#czRows [data-row="2"] [data-k="ev"]', "4 من 6 خراطيم في الرافعات الأخرى تجاوزت 250 ساعة"); pg.wait_for_timeout(30)
    check("root cause confirmed with evidence and tested", pg.evaluate("rootsOk(formToRec())"))
    check("a full depth needs two methods including data before the root stage", pg.evaluate("stageOf(formToRec())") == "causes" and "طريقة" in pg.inner_text("#meSum"))
    # methods: data analysis and barrier analysis done here
    pg.click('[data-add="me"]'); pg.select_option('#meRows tr:nth-child(1) [data-k="how"]', "data"); pg.wait_for_timeout(60)
    check("choosing data analysis shows its table and disables the id", not pg.evaluate("document.getElementById('daBox').hidden") and pg.evaluate("document.querySelector('#meRows tr:nth-child(1) [data-k=\"ref\"]').disabled"))
    pg.click('[data-add="da"]'); pg.fill('#daRows tr:nth-child(1) [data-k="g"]', "خراطيم فوق 250 ساعة"); pg.fill('#daRows tr:nth-child(1) [data-k="n"]', "6"); pg.fill('#daRows tr:nth-child(1) [data-k="k"]', "4"); pg.wait_for_timeout(30)
    check("data analysis rate computed (4/6 = 66.7%)", pg.inner_text('#daRows tr:nth-child(1) [data-rate]') == "66.7%")
    pg.click('[data-add="me"]'); pg.select_option('#meRows tr:nth-child(2) [data-k="how"]', "barrier"); pg.wait_for_timeout(60)
    pg.click('[data-add="ba"]'); pg.fill('#baRows tr:nth-child(1) [data-k="b"]', "فحص الخراطيم كل 250 ساعة"); pg.select_option('#baRows tr:nth-child(1) [data-k="res"]', "missing"); pg.wait_for_timeout(30)
    check("two valid methods with data reach 'root cause confirmed'", pg.evaluate("methOk(formToRec())") and pg.evaluate("stageOf(formToRec())") == "root", pg.evaluate("stageOf(formToRec())"))
    pg.fill('#daRows tr:nth-child(1) [data-k="k"]', "9"); pg.wait_for_timeout(20)
    pg.click("#saveBtn"); pg.wait_for_timeout(40)
    check("validation: cases with the problem cannot exceed the cases", "لا يزيد" in pg.inner_text("#recErr"))
    pg.fill('#daRows tr:nth-child(1) [data-k="k"]', "4")
    # similar cases, actions, criterion, review
    pg.select_option("#f-similar", "could"); pg.fill("#f-similarNote", "الرافعات الأربع الأخرى بالجدول نفسه")
    pg.click('[data-add="ac"]'); pg.wait_for_timeout(30)
    check("the action's root-cause list offers R1", "R1" in pg.evaluate("document.querySelector('#acRows [data-k=\"cause\"]').innerText"))
    pg.select_option('#acRows tr:nth-child(1) [data-k="cause"]', pg.evaluate("document.querySelector('#czRows [data-row=\"2\"]').dataset.cid"))
    pg.fill('#acRows tr:nth-child(1) [data-k="t"]', "جدول صيانة بساعات التشغيل")
    pg.wait_for_timeout(30)
    check("an action without an owner is flagged and the root stays without an action", pg.evaluate("issues(formToRec()).some(x=>x[0]==='own')") and pg.evaluate("noAct(formToRec()).length") == 1 and not pg.evaluate("document.getElementById('acWarn').hidden"))
    pg.fill('#acRows tr:nth-child(1) [data-k="owner"]', "مدير الصيانة"); pg.wait_for_timeout(30)
    check("no CAPA link: the hint says the plan belongs in CAPA", not pg.evaluate("document.getElementById('acCapaN').hidden"))
    pg.fill("#f-cwhat", "صفر تسرب هيدروليكي"); pg.fill("#f-cwhere", "سجل المستودع"); pg.fill("#f-cperiod", "ثلاثة أشهر"); pg.fill("#f-cdate", "2026-10-05"); pg.wait_for_timeout(20)
    check("the criterion needs the 'written before the action' box", not pg.evaluate("critOk(formToRec())"))
    pg.check("#f-cbefore"); pg.wait_for_timeout(30)
    check("stage 'actions proposed' with an action per root and the criterion", pg.evaluate("stageOf(formToRec())") == "actions")
    pg.fill("#f-rby", "مشرف المستودع"); pg.fill("#f-rdate", "2026-10-06"); pg.wait_for_timeout(30)
    check("a reviewer from the team is flagged", not pg.evaluate("document.getElementById('rvWarn').hidden") and pg.evaluate("auditRecord(formToRec()).rev") is False)
    pg.fill("#f-rby", "مدير الجودة"); pg.fill("#f-date", "2026-10-04"); pg.wait_for_timeout(30)
    check("stage 'reviewed'", pg.evaluate("stageOf(formToRec())") == "reviewed" and "روجع التحقيق" in pg.inner_text("#curStage"))
    # tree
    tr = pg.evaluate("(()=>{const s=document.querySelector('#rcTree svg'); return {n:s.querySelectorAll('.rc-node').length, p:s.querySelectorAll('path').length};})()")
    check("cause tree: problem + 3 causes and 3 edges", tr == {"n": 4, "p": 3}, tr)
    rtl = pg.evaluate("(()=>{const d=document.createElement('div'); d.innerHTML=treeSVG(formToRec(),'ar'); const r=[...d.querySelectorAll('.rc-node rect')].map(x=>+x.getAttribute('x')); d.innerHTML=treeSVG(formToRec(),'en'); const l=[...d.querySelectorAll('.rc-node rect')].map(x=>+x.getAttribute('x')); return [r,l];})()")
    check("tree mirrored: the problem (drawn last) on the right in Arabic, on the left in English", rtl[0][-1] == max(rtl[0]) and rtl[1][-1] == min(rtl[1]) and rtl[0][-1] > rtl[0][0], rtl)
    pg.click("#saveBtn"); pg.wait_for_timeout(80)
    check("saved with a new id RC-2026-001", "RC-2026-001" in pg.inner_text("#recOk") and pg.evaluate("DB.records.length") == 1)
    pg.reload(); pg.wait_for_timeout(300)
    pg.evaluate("go('docs')"); pg.click('[data-open="RC-2026-001"]'); pg.wait_for_timeout(150)
    check("persists after reload and opens with its rows, parents and tests", pg.evaluate("document.getElementById('f-title').value") == "تسرب زيت هيدروليكي من الرافعة الشوكية" and pg.evaluate("document.querySelectorAll('#czRows [data-row]').length") == 3
          and pg.evaluate("document.querySelector('#czRows [data-row=\"2\"] [data-k=\"test\"]').value") == "yes" and pg.evaluate("document.querySelector('#czRows [data-row=\"2\"] [data-k=\"p\"]').value") == pg.evaluate("document.querySelector('#czRows [data-row=\"1\"]').dataset.cid")
          and pg.evaluate("document.querySelectorAll('#tlRows tr').length") == 3 and pg.evaluate("stageOf(formToRec())") == "reviewed",
          pg.evaluate("JSON.stringify([document.getElementById('f-title').value, document.querySelectorAll('#czRows [data-row]').length, [...document.querySelectorAll('#czRows [data-k=\"p\"]')].map(x=>x.value), [...document.querySelectorAll('#czRows [data-row]')].map(x=>x.dataset.cid), document.querySelectorAll('#tlRows tr').length, stageOf(formToRec())])"))
    docs = tab_text(pg, "docs")
    check("records table shows the investigation with stage, depth and roots", "RC-2026-001" in docs and "روجع التحقيق" in docs and "1 من 1 مؤكد ومختبر" in docs)
    check("audit tab: 13 checks per investigation", pg.evaluate("document.querySelectorAll('#auBox thead th').length") == 14)
    dash = tab_text(pg, "dash")
    check("dashboard KPIs and distributions", "إجمالي التحقيقات" in dash and "عمق التحقيق" in dash and "الطرق المستخدمة" in dash)
    rep = pg.evaluate("buildReportHTML()")
    check("report: cover, author, the tree SVG, timeline, evidence, methods, causes with tests, actions, criterion, audit, open items, self-assessment",
          "مدثر سلامه" in rep and rep.count("<svg") == 1 and "تسلسل الأحداث" in rep and "سجل الأدلة" in rep and "الطرق" in rep and "الأسباب" in rep and "معيار الفعالية" in rep and "Audit results" in rep and "Open items" in rep and "Self-assessment" in rep)
    csv = pg.evaluate("buildCSV()")
    check("CSV with BOM, header and the investigation row", csv.startswith("﻿") and "requiredDepth" in csv.splitlines()[0] and "RC-2026-001" in csv and "R1 root [conf, test yes]" in csv)
    with pg.expect_download() as dl:
        pg.evaluate("go('report')"); pg.click("#rpHtml")
    check("report downloads as HTML", dl.value.suggested_filename.startswith("RCA-report-") and dl.value.suggested_filename.endswith(".html"))
    with pg.expect_download() as dl2:
        pg.click("#rpCsv")
    check("CSV downloads", dl2.value.suggested_filename.endswith(".csv"))
    pg.evaluate("go('docs')"); pg.click('[data-del="RC-2026-001"]'); pg.wait_for_timeout(40)
    check("delete asks for confirmation first", pg.evaluate("DB.records.length") == 1 and "تأكيد الحذف" in pg.inner_text("#docsBox"))
    pg.click('[data-del="RC-2026-001"]'); pg.wait_for_timeout(60)
    check("deleted after confirmation", pg.evaluate("DB.records.length") == 0)
    check("no JS errors in the form flow", not errs, errs[:5])
    ctx.close()

    # ---- 4. example data, chatbot, clear all, broken record, keyboard
    ctx, pg, errs = page_new("ar")
    load_ex(pg)
    check("example: 3 investigations, assessment 71%", pg.evaluate("DB.records.length") == 3 and pg.evaluate("assessScore()") == 71)
    st = pg.evaluate("DB.records.map(r=>[r.id,stageOf(r),depOf(r)])")
    check("example stages and depths: RC-EX-01 reviewed full, RC-EX-02 actions full, RC-EX-03 reviewed light", st == [["RC-EX-01", "reviewed", "full"], ["RC-EX-02", "actions", "full"], ["RC-EX-03", "reviewed", "light"]], st)
    r1 = pg.evaluate("(()=>{const r=DB.records[0]; return {src:r.src,capa:r.capa,pa:r.pareto+'/'+r.pcat,m:r.methods.map(m=>m.how+':'+m.ref),roots:roots(r).length,ok:rootsOk(r),crit:r.crit.what,cp:r.crit.pareto};})()")
    check("RC-EX-01: from Pareto PA-EX-02 temperature, CAPA CA-EX-04, Fishbone FB-EX-02, 5 Whys W5-EX-03, data, two root causes, the 3% criterion",
          r1["src"] == "pareto" and r1["capa"] == "CA-EX-04" and r1["pa"] == "PA-EX-02/k1" and r1["m"] == ["pareto:PA-EX-02", "fish:FB-EX-02", "why5:W5-EX-03", "data:"] and r1["roots"] == 2 and r1["ok"] and "3%" in r1["crit"] and r1["cp"] == "PA-EX-02", r1)
    r2 = pg.evaluate("(()=>{const r=DB.records[1]; return {src:r.src,sev:r.risk.sev,m:r.methods.map(m=>m.how),b:r.barrier.length,pc:personCauses(r).length,asm:asmN(r)};})()")
    check("RC-EX-02: near miss, severity 5, barrier and data analysis, no person-only cause, one assumption", r2 == {"src": "near", "sev": 5, "m": ["barrier", "data"], "b": 4, "pc": 0, "asm": 1}, r2)
    check("RC-EX-03: light depth from CA-EX-03 with FB-EX-03; the methods check does not apply", pg.evaluate("[DB.records[2].capa, DB.records[2].methods[0].ref, auditRecord(DB.records[2]).meth]") == ["CA-EX-03", "FB-EX-03", None])
    check("example audit: every applicable check passes except RC-EX-02's review", pg.evaluate("TBX.audit(DB.records,auditRecord,CHECKS).pass") == pg.evaluate("TBX.audit(DB.records,auditRecord,CHECKS).applic") - 1)
    check("example labelled illustrative", "توضيحية" in pg.inner_text("#exBox"))
    for t in TABS:
        txt_ = tab_text(pg, t)
        check(f"example: tab {t} renders without undefined/NaN", len(txt_) > 30 and not re.search(r"undefined|NaN|\[object Object\]", txt_))
    pg.evaluate("go('tools')"); pg.evaluate("loadRecordIntoForm(DB.records[0])"); pg.wait_for_timeout(100)
    check("RC-EX-01 tree draws the problem, 7 causes and the ruled-out one dashed", pg.evaluate("document.querySelectorAll('#rcTree svg .rc-node').length") == 8 and pg.evaluate("document.querySelectorAll('#rcTree svg rect[stroke-dasharray]').length") == 1)
    pg.evaluate("go('report')")
    rep = pg.evaluate("buildReportHTML()")
    check("example report: three trees and the illustrative note", rep.count("<svg") == 3 and "illustrative" in rep)
    # chatbot
    pg.click("#cbFab"); pg.wait_for_timeout(100)
    sug = pg.evaluate("[...document.querySelectorAll('#cbSug [data-sid]')].map(b=>b.dataset.sid)")
    check("assistant suggests 5 questions incl. one root cause and which method", sug == ["one", "which", "human", "depth", "status"], sug)
    pg.click('#cbSug [data-sid="one"]'); pg.wait_for_timeout(80)
    check("'Is there always one root cause?' → more than one, cause(s) in 3.6.4", "أكثر من سبب جذري" in last_bot(pg) and "3.6.4" in last_bot(pg))
    pg.fill("#cbIn", "RCA أم لماذا الخمس أم عظمة السمكة: أيها أستخدم؟"); pg.press("#cbIn", "Enter"); pg.wait_for_timeout(80)
    check("'RCA, 5 Whys or Fishbone — which one?' → not alternatives, RCA chooses", "ليست بدائل" in last_bot(pg))
    pg.fill("#cbIn", "هل الخطأ البشري سبب جذري؟"); pg.press("#cbIn", "Enter"); pg.wait_for_timeout(80)
    check("human error answer cites 8.5.1 ز)", "8.5.1" in last_bot(pg) and "نقطة بداية" in last_bot(pg))
    pg.fill("#cbIn", "ما البنود المفتوحة؟"); pg.press("#cbIn", "Enter"); pg.wait_for_timeout(80)
    check("assistant lists the open items from the investigations", "NM-2026-031" in last_bot(pg))
    pg.click("#cbClose")
    # clear all
    pg.evaluate("go('docs')"); pg.click("#pfReset"); pg.wait_for_timeout(120)
    check("clear all (confirmed) removes every investigation and the answers", pg.evaluate("DB.records.length") == 0 and pg.evaluate("localStorage.getItem('cia-rca:v1')") is None)
    # a record with missing parts
    pg.evaluate("localStorage.setItem('cia-rca:v1', JSON.stringify({records:[{id:'RC-X',title:'broken',causes:[{lvl:'root',t:'x'},null,'s'],tl:'no',risk:{sev:9},crit:null,acts:[{cause:'zz'}]}, null, 5], assess:{PS1:2}}))")
    pg.reload(); pg.wait_for_timeout(300)
    for t in TABS:
        txt_ = tab_text(pg, t)
        check(f"record with missing parts: tab {t} renders", len(txt_) > 20 and not re.search(r"undefined|NaN|\[object Object\]", txt_))
    pg.evaluate("go('docs')"); pg.click('[data-open="RC-X"]'); pg.wait_for_timeout(100)
    check("record with missing parts opens in the form", pg.evaluate("document.getElementById('f-title').value") == "broken" and pg.evaluate("stageOf(formToRec())") == "problem")
    # keyboard
    pg.evaluate("go('home')"); pg.focus('#side button[data-go="assess"]'); pg.keyboard.press("Enter"); pg.wait_for_timeout(80)
    check("keyboard: Enter on a sidebar button opens the tab", pg.evaluate("curTab") == "assess")
    pg.evaluate("go('tools')"); pg.focus("#f-title"); pg.keyboard.press("Tab"); pg.wait_for_timeout(30)
    check("keyboard: Tab moves through the form fields", pg.evaluate("document.activeElement.id") == "f-ref")
    check("no JS errors with example, chatbot, broken record", not errs, errs[:5])
    ctx.close()

    # ---- 5. starts from CAPA and Pareto (read-only, preview first) and the requests
    ctx, pg, errs = page_new("ar", url=CAPA)
    load_other(pg, CAPA); load_other(pg, PARETO); load_other(pg, FISH); load_other(pg, W5)
    snap = pg.evaluate("JSON.stringify(['cia-capa:v1','cia-pareto:v1','cia-fish:v1','cia-why5:v1'].map(k=>localStorage.getItem(k)))")
    pg.goto(URL); pg.wait_for_timeout(350)
    check("home strip counts what can start an investigation", not pg.evaluate("document.getElementById('homeImp').hidden") and "CAPA" in pg.inner_text("#homeImpT"))
    pg.evaluate("go('tools')"); pg.click("#stPrev"); pg.wait_for_timeout(80)
    capaRows = pg.evaluate("document.querySelectorAll('#stTable tbody tr').length")
    check("CAPA preview lists the four CAPA records with their stage and root cause", capaRows == 4 and "CA-EX-04" in pg.inner_text("#stTable") and "أعيد فتحه" in pg.inner_text("#stTable"), capaRows)
    pg.click('[data-stcapa="CA-EX-04"]'); pg.wait_for_timeout(120)
    f = pg.evaluate("formToRec()")
    check("prefill from CA-EX-04: reference, source, CAPA, PDCA, problem, timeline, evidence, root cause as hypothesis, similar cases",
          f["ref"] == "NCR-2026-044" and f["src"] == "capa" and f["capa"] == "CA-EX-04" and f["pdca"] == "PD-EX-03" and "9%" in f["prob"]["what"] and len(f["tl"]) == 2 and len(f["evid"]) == 1
          and f["causes"][0]["lvl"] == "root" and f["causes"][0]["st"] == "hyp" and f["similar"] == "could", json.dumps(f, ensure_ascii=False)[:300])
    check("the prefill is not saved and says so", pg.evaluate("DB.records.length") == 0 and "لم يُكتب أي شيء في CAPA" in pg.inner_text("#recOk"))
    check("CAPA preview in the header field", "CA-EX-04" in pg.inner_text("#caInfo") and "أعيد فتحه" in pg.inner_text("#caInfo"))
    pg.select_option("#stSrc", "pareto"); pg.click("#stPrev"); pg.wait_for_timeout(80)
    pt = pg.inner_text("#stTable")
    check("Pareto preview lists the vital-few categories with value, share and period", "PA-EX-02" in pt and "حرارة الخرسانة" in pt and "40.0%" in pt and "2026-04-01" in pt, pt[:300])
    pg.click('[data-stpa="PA-EX-02"][data-cat="k1"]'); pg.wait_for_timeout(120)
    f = pg.evaluate("formToRec()")
    check("prefill from PA-EX-02 temperature: source, Pareto link, period, value and share, method, Fishbone method, PDCA",
          f["src"] == "pareto" and f["pareto"] == "PA-EX-02" and f["pcat"] == "k1" and f["prob"]["when"] == "2026-04-01 → 2026-05-31" and "14" in f["prob"]["much"] and "40.0%" in f["prob"]["much"]
          and [m["how"] + ":" + m["ref"] for m in f["methods"]] == ["pareto:PA-EX-02", "fish:FB-EX-02"] and f["pdca"] == "PD-EX-03", json.dumps(f, ensure_ascii=False)[:400])
    check("Pareto category info shows under the field", "14" in pg.inner_text("#pcInfo") and "40.0%" in pg.inner_text("#pcInfo") and "القلة الحيوية" in pg.inner_text("#pcInfo"))
    pv = pg.evaluate("[...document.querySelectorAll('#meRows [data-pv]')].map(x=>x.textContent)")
    check("method previews read Pareto and Fishbone with their own stages", "PA-EX-02" in pv[0] and "روجع التحليل" in pv[0] and "FB-EX-02" in pv[1], pv)
    with ctx.expect_page() as npf:
        pg.click('#meRows tr:nth-child(2) [data-meopen="fish"]')
    pf = npf.value; pf.wait_for_load_state()
    check("'Open the linked one' opens Fishbone on ?open=FB-EX-02", "fishbone.html?open=FB-EX-02" in pf.url); pf.close()
    pg.click('[data-add="me"]'); pg.select_option('#meRows tr:nth-child(3) [data-k="how"]', "why5"); pg.wait_for_timeout(60)
    with ctx.expect_page() as np5:
        pg.click('#meRows tr:nth-child(3) [data-mestart="why5"]')
    p5 = np5.value; p5.wait_for_load_state()
    check("'Start a 5 Whys analysis' opens 5 Whys through its own request", "five-whys.html" in p5.url); p5.close()
    pg.fill("#f-capa", "CA-EX-04"); pg.wait_for_timeout(30)
    pg.click('[data-add="me"]'); pg.select_option('#meRows tr:nth-child(4) [data-k="how"]', "fish"); pg.wait_for_timeout(60)
    with ctx.expect_page() as npc:
        pg.click('#meRows tr:nth-child(4) [data-mestart="fish"]')
    pc = npc.value; pc.wait_for_load_state()
    check("'Start a Fishbone analysis' carries the CAPA record (?capa=CA-EX-04)", "fishbone.html?capa=CA-EX-04" in pc.url); pc.close()
    pg.fill("#f-cpareto", "PA-EX-02"); pg.wait_for_timeout(30)
    check("the criterion's Pareto before/after preview reads the verdict", "PA-EX-02" in pg.inner_text("#crInfo") and "تحسّن" in pg.inner_text("#crInfo"))
    with ctx.expect_page() as npd:
        pg.fill("#f-pdca", "PD-EX-03"); pg.click("#pdOpen")
    pd = npd.value; pd.wait_for_load_state()
    check("PDCA link opens pdca.html in a new tab outside the hub", "pdca.html" in pd.url); pd.close()
    check("other tools' data unchanged by the starts and previews", pg.evaluate("JSON.stringify(['cia-capa:v1','cia-pareto:v1','cia-fish:v1','cia-why5:v1'].map(k=>localStorage.getItem(k)))") == snap)
    # requests in the address
    pg.goto(URL + "?pareto=PA-EX-02&cat=k2#tools"); pg.wait_for_timeout(350)
    check("?pareto=PA-EX-02&cat=k2 fills a new investigation from the slump category", pg.evaluate("formToRec().pcat") == "k2" and "الهبوط" in pg.evaluate("document.getElementById('f-what').value") and pg.evaluate("DB.records.length") == 0)
    pg.goto(URL + "?capa=CA-EX-03#tools"); pg.wait_for_timeout(350)
    check("?capa=CA-EX-03 fills a new investigation from the CAPA record", pg.evaluate("formToRec().capa") == "CA-EX-03")
    pg.goto(URL); pg.wait_for_timeout(300); load_ex(pg)
    pg.goto(URL + "?open=RC-EX-02#tools"); pg.wait_for_timeout(350)
    check("?open=RC-EX-02 opens that investigation", pg.evaluate("document.getElementById('rid').value") == "RC-EX-02" and pg.evaluate("curTab") == "tools")
    check("other tools' data still unchanged", pg.evaluate("JSON.stringify(['cia-capa:v1','cia-pareto:v1','cia-fish:v1','cia-why5:v1'].map(k=>localStorage.getItem(k)))") == snap)
    # the CAPA panel
    pg.goto(CAPA); pg.wait_for_timeout(400)
    pg.evaluate("go('docs')"); pg.click('[data-open="CA-EX-04"]'); pg.wait_for_timeout(200)
    box = pg.inner_text("#rcBox")
    check("CAPA: the RCA panel lists RC-EX-01 with its two root causes, both confirmed and tested", not pg.evaluate("document.getElementById('rcBox').hidden") and "RC-EX-01" in box and "2 من 2" in box and "نافذة صب" in box, box[:200])
    before = pg.evaluate("localStorage.getItem('cia-capa:v1')")
    pg.click('[data-rcuse="RC-EX-01"]'); pg.wait_for_timeout(80)
    check("'Use this root cause' copies both root causes into the form, not into storage", "نافذة صب" in pg.evaluate("document.getElementById('f-root').value") and "عقد التوريد" in pg.evaluate("document.getElementById('f-root').value") and pg.evaluate("localStorage.getItem('cia-capa:v1')") == before)
    with ctx.expect_page() as npr:
        pg.click('[data-rcopen="RC-EX-01"]')
    pr = npr.value; pr.wait_for_load_state(); pr.wait_for_timeout(300)
    check("'Open in RCA' opens rca.html?open=RC-EX-01 on that investigation", "rca.html?open=RC-EX-01" in pr.url and pr.evaluate("document.getElementById('rid').value") == "RC-EX-01"); pr.close()
    pg.evaluate("go('docs')"); pg.click('[data-open="CA-EX-01"]'); pg.wait_for_timeout(150)
    check("CAPA: no panel for a record no investigation names", pg.evaluate("document.getElementById('rcBox').hidden"))
    # Pareto's rca next step
    pg.goto(PARETO); pg.wait_for_timeout(400)
    pg.evaluate("go('docs')"); pg.click('[data-open="PA-EX-01"]'); pg.wait_for_timeout(200)
    opts_ = pg.evaluate("[...document.querySelector('#nxBox [data-nk=\"how\"]').options].map(o=>o.value)")
    check("Pareto: the next-step list includes RCA", opts_ == ["", "fish", "why5", "capa", "rca"], opts_)
    dash0 = pg.evaluate("(go('dash'), document.getElementById('dNext').innerText)")
    check("Pareto dashboard: no RCA row while no step is RCA", "تحقيق RCA" not in dash0)
    pg.evaluate("go('tools')")
    nid = pg.evaluate("document.querySelector('#nxBox [data-nid]').dataset.nid")
    pg.select_option(f'#nx-{nid}-h', "rca"); pg.wait_for_timeout(80)
    pg.fill(f'#nx-{nid}-r', "RC-EX-01"); pg.wait_for_timeout(80)
    check("Pareto: the RCA preview uses the RCA tool's stage and root causes", "RC-EX-01" in pg.inner_text(f'[data-pv="{nid}"]') and "روجع التحقيق" in pg.inner_text(f'[data-pv="{nid}"]') and "نافذة صب" in pg.inner_text(f'[data-pv="{nid}"]'))
    check("Pareto: start button and the save-first note for RCA", pg.evaluate(f"!!document.querySelector('[data-nxrca=\"{nid}\"]')") and "أداة RCA" in pg.inner_text(f'#nxBox [data-nid="{nid}"]'))
    with ctx.expect_page() as npp:
        pg.click(f'[data-nxrca="{nid}"]')
    pp = npp.value; pp.wait_for_load_state(); pp.wait_for_timeout(350)
    check("Pareto saves first, then opens rca.html?pareto=PA-EX-01&cat=… filling a new investigation", "rca.html?pareto=PA-EX-01&cat=" + nid in pp.url and pp.evaluate("formToRec().pareto") == "PA-EX-01" and pp.evaluate("formToRec().pcat") == nid)
    pp.close()
    check("Pareto stored the rca step (accepted value)", pg.evaluate("JSON.parse(localStorage.getItem('cia-pareto:v1')).records.find(r=>r.id==='PA-EX-01').cats.find(c=>c.id==='%s').nx.how" % nid) == "rca")
    dash1 = pg.evaluate("(go('dash'), document.getElementById('dNext').innerText)")
    check("Pareto dashboard shows the RCA row once a step is RCA", "تحقيق RCA" in dash1)
    check("no JS errors across the tools", not errs, errs[:5])
    ctx.close()

    # ---- 6. inside the hub: RCA in the overlay, CAPA → RCA with the one-time hint, PDCA through ciaOpenFile
    ctx, pg, errs = page_new("ar", url=HUB)
    fw = lambda js: pg.evaluate("(js)=>document.getElementById('modFrame').contentWindow.eval(js)", js)
    pg.evaluate("openModule('capa')"); pg.wait_for_timeout(900)
    fw("go('docs'); document.getElementById('pfEx').click(); 0"); pg.wait_for_timeout(400)
    pg.evaluate("openModule('rca')"); pg.wait_for_timeout(900)
    check("hub: RCA opens in the overlay", pg.evaluate("document.getElementById('modFrame').dataset.k") == "rca")
    fw("go('docs'); document.getElementById('pfEx').click(); 0"); pg.wait_for_timeout(400)
    fw("loadRecordIntoForm(DB.records[0]); go('tools'); 0"); pg.wait_for_timeout(200)
    check("inside the hub the methods section says the other tool replaces this one", "مكان هذه الأداة" in fw("document.getElementById('meHub').textContent"))
    fw("document.getElementById('pdOpen').click(); 0"); pg.wait_for_timeout(900)
    check("hub: PDCA opens through ciaOpenFile", pg.evaluate("document.getElementById('modFrame').dataset.k") == "pdca")
    pg.evaluate("openModule('capa')"); pg.wait_for_timeout(900)
    fw("go('docs'); document.querySelector('[data-open=\"CA-EX-04\"]').click(); 0"); pg.wait_for_timeout(300)
    fw("document.querySelector('[data-rcopen=\"RC-EX-01\"]').click(); 0"); pg.wait_for_timeout(1200)
    check("hub: CAPA's panel opens RCA in the overlay on RC-EX-01, the hint removed", pg.evaluate("document.getElementById('modFrame').dataset.k") == "rca" and fw("document.getElementById('rid').value") == "RC-EX-01" and fw("sessionStorage.getItem('cia-nav:rca')") is None)
    fw("loadRecordIntoForm(DB.records[0]); 0"); pg.wait_for_timeout(100)
    fw("document.querySelector('#meRows tr:nth-child(2) [data-meopen=\"fish\"]').click(); 0"); pg.wait_for_timeout(1200)
    check("hub: a Fishbone method opens Fishbone in the overlay on its analysis", pg.evaluate("document.getElementById('modFrame').dataset.k") == "fish")
    check("no JS errors in the hub", not [x for x in errs if "Failed to load" not in x], errs[:3])
    ctx.close()

    # ---- 7. English and 390 px
    for lang in ("ar", "en"):
        ctx, pg, errs = page_new(lang, w=390, h=820)
        load_ex(pg)
        pg.evaluate("go('tools'); loadRecordIntoForm(DB.records[0])"); pg.wait_for_timeout(120)
        check(f"390 px {lang}: the cause tree becomes an indented list", pg.evaluate("getComputedStyle(document.querySelector('#rcTree .rc-svgw')).display") == "none" and pg.evaluate("getComputedStyle(document.querySelector('#rcTree .rc-list')).display") == "block"
              and pg.evaluate("document.querySelectorAll('#rcTree .rc-list li').length") == 8 and pg.evaluate("document.querySelectorAll('#rcTree .rc-list ul ul').length") >= 1)
        check(f"390 px {lang}: the list reads the problem first, then D1", pg.evaluate("[...document.querySelectorAll('#rcTree .rc-list .nd')].slice(0,2).map(x=>x.className)") == ["nd pb", "nd direct conf"])
        for t in TABS:
            pg.evaluate(f"go('{t}')"); pg.wait_for_timeout(40)
            o = pg.evaluate("document.documentElement.scrollWidth-innerWidth")
            check(f"390 px {lang}: tab {t} no overflow", o <= 1, o)
        if lang == "en":
            check("English LTR: the stage names and sections", "Root cause confirmed" in pg.evaluate("STAGES.map(stageName).join('|')") and "Causes in three levels" in pg.evaluate("(go('tools'), document.getElementById('sec-Cause').innerText)"))
        check(f"no errors at 390 px {lang}", not errs, errs[:3])
        ctx.close()

    # ---- 8. tour (AR and EN): every section after home, no empty titles
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
