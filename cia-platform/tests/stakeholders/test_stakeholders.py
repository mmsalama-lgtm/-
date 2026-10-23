"""Stakeholder Analysis tool (modules/stakeholders.html) — 2026-10-17. Same style as tests/pestle/test_pestle.py.
Covers: shared engine (fourteen files) and layer identity, AR/EN and RTL/LTR, tabs, the kit, self-assessment, the register (validation, the
computed stage scoped → team → parties named → requirements sourced and decided → rated, climate asked → engagement and outcomes → reviewed, the
one-person flag, the outside-input rule, the generic-name flag, the source/date rule on key-party requirements, the 4.2 c) decision with its
reason, power and interest with reasons, the key-party rule, the climate question, outcomes into SWOT, PESTLE and risks, actions with owner and
date, the review), the power/interest grid (mirrored for Arabic, 390 px), the requirements matrix and the chart, records, audit (10 checks),
dashboard, report and CSV, persistence, example data, clear all, a record with missing parts, the read-only starts from SWOT, PESTLE, the
Strategy Studio and Lessons Learned with previews by each tool's own rule (other tools only read), the ?open= / ?swot= / ?pestle= / ?strat=
requests and the hub hint, the assistant, the tour, keyboard, 390 px, the hub links, and the tools this step leaves unchanged (byte-identical
to the previous package when CIA_ORIG_DIR is set).
Served over http (CIA_BASE, default http://127.0.0.1:8802).   Usage: python3 tests/stakeholders/test_stakeholders.py"""
import os, sys, json, re
from playwright.sync_api import sync_playwright
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
MOD = os.path.join(ROOT, "modules")
BASE = os.environ.get("CIA_BASE", "http://127.0.0.1:8802")
URL = BASE + "/modules/stakeholders.html"
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
FILES = ["pdca", "capa", "five-whys", "fishbone", "pareto", "rca", "a3", "dmaic", "iso10009", "fmea", "lessons", "swot", "pestle", "stakeholders"]
src = {f: read(os.path.join(MOD, f + ".html")) for f in FILES}
sk, tpl = src["stakeholders"], read(os.path.join(ROOT, "templates", "explain-kit-template.html"))
e = [engine(src[f]) for f in FILES]
check("engine block present once in the fourteen toolbox files", all(x is not None for x in e))
check("engine block identical in the fourteen files and to tests/build/engine.js", len(set(e)) == 1 and e[0] == read(os.path.join(ROOT, "tests", "build", "engine.js")).rstrip("\n"))
for tag, id_ in (("style", "cia-explain-kit-css"), ("script", "cia-explain-kit-js")):
    check(f"stakeholders.html {id_} byte-identical to the template", block(sk, tag, id_) == block(tpl, tag, id_))
norm = lambda x: re.sub(r"var CFG=\{.*?\};", "var CFG={};", x or "", count=1)
check("tour script identical to pestle.html apart from CFG", norm(block(sk, "script", "cia-tour-js")) == norm(block(src["pestle"], "script", "cia-tour-js")) and block(sk, "script", "cia-tour-js") != block(src["pestle"], "script", "cia-tour-js"))
check("tour CSS identical to pestle.html", block(sk, "style", "cia-tour-css") == block(src["pestle"], "style", "cia-tour-css"))
check("tour CFG names stakeholders and guards the example", 'var CFG={"file": "stakeholders", "hasEx": true, "guard": {"pfEx": "all"}};' in sk)
i0 = sk.find("Stakeholder Analysis tool — host logic")
check("storage key and schema documented at the top of the host script", 'STORE="cia-stakeholders:v1"' in sk and "Schema:" in sk[i0:i0 + 9000] and all(k in sk[i0:i0 + 9000] for k in ('"cia-swot:v1"', '"cia-pestle:v1"', '"strategy-studio:v1"', '"cia-lessons:v1"')))
host = sk[i0:sk.find("<!-- CIA guided tour")]; host = host.replace(engine(sk) or "", "")
check("the host writes only its own key (TBX.save/drop on STORE, language key only)", not re.search(r"TBX\.(save|drop)\((?!STORE)", host) and not re.search(r"localStorage\.(setItem|removeItem)\((?!LKEY)", host))
check("other tools' rules carried read-only: ssTKV, SWR, PER, LLR", all(x in sk for x in ("var ssTKV=", "var SWR=(function(){", "var PER=(function(){", "var LLR=(function(){")))
check("no host function named after a browser global", not re.search(r"\bfunction (top|name|status|parent|self|open|close)\(", host))
data = block(sk, "script", "cia-explain-data")
check("Explain Kit data: EXPLAIN_STAKEHOLDERS with meta.verified, 4.2, A.4.2, 4.3, 5.1.2, 6.1.1, 9.1.2, 9.3.2, 3.1.4, 4.4.2, 5.1, 5.5, 6.5 and 'not verified'", data and "const EXPLAIN_STAKEHOLDERS=" in data and '"verified"' in data and all(('"c": "%s"' % c) in data for c in ("4.2", "A.4.2", "4.3", "5.1.2", "6.1.1", "9.1.2", "9.3.2", "3.1.4", "4.4.2", "5.1", "5.5", "6.5")) and "not verified" in data)
check("Explain Kit ui labels set", all(('"%s"' % k) in data for k in ("roles", "wheelT", "purpose", "smap", "assess", "assessOff", "offGo", "actCtx")))
check("every self-assessment question is reached from the kit", all(('"q": "%s"' % q) in data for q in ("IN1", "IN2", "IN3", "DE1", "DE2", "DE3", "OU1", "OU2", "OU3", "RV1", "RV2", "RV3")))
check("method guide says once that stakeholder analysis is a technique, not a requirement", "Stakeholder analysis is a technique, not a requirement of any standard" in sk and "تحليل الأطراف المعنية أسلوب، وليس متطلباً في أي مواصفة" in sk)
check("method guide says plainly what ISO 10009 does not cover", "ISO 10009 names no tool called" in sk and "لا تسمي ISO 10009 أداة باسم" in sk)
check("author name on the page and the report", sk.count("مدثر سلامه") >= 5)
check("sidebar buttons carry data-go and data-t", all(('data-go="%s" data-t="%s"' % (t, t)) in sk for t in TABS))
OD = os.environ.get("CIA_ORIG_DIR")
if OD:
    same = [f for f in ("swot", "pestle", "strategy-performance", "lessons", "fmea", "pareto", "pdca", "capa", "iso31000-risk-studio", "smart-audit-improvement", "iso9001") if read(os.path.join(MOD, f + ".html")) == read(os.path.join(OD, "modules", f + ".html"))]
    check("SWOT, PESTLE, Strategy Studio, Lessons, FMEA, Pareto, PDCA, CAPA, Risk Studio, Smart Audit and ISO 9001 unchanged (byte-identical)", len(same) == 11, same)

FREEZE = """(function(){ var T=Date.UTC(2026,9,17,9,0,0), OD=Date;
 function FD(){ if(!(this instanceof FD)) return new OD(T).toString(); var a=[].slice.call(arguments);
   return a.length? new (Function.prototype.bind.apply(OD,[null].concat(a)))() : new OD(T); }
 FD.now=function(){ return T; }; FD.UTC=OD.UTC; FD.parse=OD.parse; FD.prototype=OD.prototype; window.Date=FD;
 try{ if(!sessionStorage.getItem('f0')){ sessionStorage.setItem('f0','1'); localStorage.clear(); localStorage.setItem('cia-lang','ar');
   ['stakeholders','pestle','swot','lessons','strategy-performance'].forEach(function(k){ localStorage.setItem('cia-tour:m:'+k,'done'); }); } }catch(e){} })();"""


def page(b, w=1280):
    ctx = b.new_context(viewport={"width": w, "height": 900}); pg = ctx.new_page(); errs = []
    pg.on("pageerror", lambda x: errs.append(str(x))); pg.on("dialog", lambda d: d.accept()); pg.add_init_script(FREEZE)
    pg.route(re.compile(r"fonts\.(googleapis|gstatic)\.com"), lambda r: r.abort())
    return ctx, pg, errs


def ex(pg, mod):
    pg.goto(M(mod), wait_until="load"); pg.wait_for_timeout(350)
    if mod == "strategy-performance":
        pg.evaluate("loadExample(); save()"); pg.wait_for_timeout(500); return
    pg.evaluate("go('docs')"); pg.evaluate("document.getElementById('pfEx').click()"); pg.wait_for_timeout(350)


BAD = ["undefined", "NaN", "[object Object]"]
with sync_playwright() as p:
    b = p.chromium.launch()
    ctx, pg, errs = page(b)
    pg.goto(URL, wait_until="load"); pg.wait_for_timeout(500)
    check("opens in Arabic, RTL, on the home tab", pg.evaluate("document.documentElement.dir") == "rtl" and pg.evaluate("curTab") == "home")
    check("ten tabs in the sidebar in the agreed order", pg.evaluate("[...document.querySelectorAll('#side button[data-go]')].map(b=>b.dataset.go)") == TABS)
    check("home: code badge STK, author, launch tiles and the related-tools strip (10)", "STK" in pg.evaluate("document.querySelector('.std-code').textContent") and "مدثر سلامه" in pg.evaluate("document.querySelector('.author').textContent") and pg.evaluate("document.querySelectorAll('#launchGrid a').length") == 9 and pg.evaluate("document.querySelectorAll('#homeStd a.hs').length") == 10)
    check("AI tab is a placeholder labelled under construction", "قيد الإنشاء" in pg.evaluate("document.querySelector('[data-tab=ai]').innerText"))
    for lang in ("ar", "en"):
        for t in TABS:
            pg.evaluate(f"go('{t}')"); pg.wait_for_timeout(60)
            tx = pg.evaluate(f"document.querySelector('.tabpane[data-tab=\"{t}\"]').innerText")
            if any(w in tx for w in BAD) or len(tx.strip()) < 40:
                check(f"{lang}:{t} renders text with no undefined/NaN", False, tx[:200])
        if lang == "ar": pg.evaluate("switchLang()")
    check("every tab renders in AR and EN with no undefined/NaN/[object Object]", not [r for r in results if r[0].startswith(("ar:", "en:")) and not r[1]])
    check("English switches to LTR and the title", pg.evaluate("document.documentElement.dir") == "ltr" and "Stakeholder" in pg.evaluate("document.title"))
    pg.evaluate("switchLang()")
    pg.evaluate("go('explain-cl')"); pg.wait_for_timeout(300)
    check("clause guide renders the sections", pg.evaluate("document.querySelectorAll('#ex-cl-box [data-ex-sec], #ex-cl-box .ex-sec, #ex-cl-box section').length") >= 5)
    pg.evaluate("go('explain-std')"); pg.wait_for_timeout(300)
    check("method guide shows the term box and the kit", "4.2" in pg.evaluate("document.getElementById('skTerm').innerText") and len(pg.evaluate("document.getElementById('ex-std-box').innerText")) > 400)
    pg.evaluate("go('assess')"); pg.wait_for_timeout(100)
    check("12 questions in 4 groups on a 0–2 scale", pg.evaluate("document.querySelectorAll('#asList .ex-aq').length") == 12 and pg.evaluate("document.querySelectorAll('#asList input[type=radio]').length") == 36)
    pg.evaluate("document.getElementById('as-DE1-2').click()"); pg.wait_for_timeout(100)
    check("an answer is saved under cia-stakeholders:v1 and scored", json.loads(pg.evaluate("localStorage.getItem('cia-stakeholders:v1')"))["assess"] == {"DE1": 2} and pg.evaluate("assessScore()") == 8)
    pg.evaluate("document.getElementById('asReset').click()")
    # ---- the register form: stages one by one
    pg.evaluate("go('tools')"); pg.wait_for_timeout(150)
    R = lambda: pg.evaluate("stageOf(formToRec())")
    check("an empty register is a draft", R() == "draft")
    pg.evaluate("document.getElementById('saveBtn').click()")
    check("saving with no title is refused", pg.evaluate("document.getElementById('recErr').textContent") != "" and pg.evaluate("DB.records.length") == 0)
    def setf(k, v):
        pg.evaluate("([k,v])=>{ var e=document.getElementById('f-'+k); e.value=v; e.dispatchEvent(new Event('input',{bubbles:true})); e.dispatchEvent(new Event('change',{bubbles:true})); }", [k, v])
    for k, v in (("title", "Test register"), ("ref", "T-1"), ("scope", "project"), ("decision", "Decide X"), ("date", "2026-10-01"), ("facil", "QM")):
        setf(k, v)
    check("title, reference, scope, decision, date and facilitator → scoped", R() == "scoped")
    def member(n, role, ext):
        pg.evaluate("document.querySelector('[data-add=\"tm\"]').click()")
        pg.evaluate("""([n,r,x])=>{ var t=[...document.querySelectorAll('#tmRows tr')].pop(); t.querySelector('[data-k=n]').value=n; t.querySelector('[data-k=role]').value=r; t.querySelector('[data-k=ext]').value=x; t.dispatchEvent(new Event('change',{bubbles:true})); }""", [n, role, ext])
    def party(n, ty, pw, pwr, inn, inr, own="", ch="", fq=""):
        pg.evaluate("document.querySelector('[data-add=\"pt\"]').click()")
        pg.evaluate("""(a)=>{ var c=[...document.querySelectorAll('#ptCards .dm-card')].pop(); var set=(k,v)=>{ c.querySelector('[data-k='+k+']').value=v; };
          set('n',a[0]); set('ty',a[1]); set('pw',a[2]?String(a[2]):''); set('pwr',a[3]); set('in',a[4]?String(a[4]):''); set('inr',a[5]); set('own',a[6]); set('ch',a[7]); set('fq',a[8]); c.dispatchEvent(new Event('change',{bubbles:true})); }""", [n, ty, pw, pwr, inn, inr, own, ch, fq])
    def req(pi, t, so, d, cl, ad, why=""):
        pg.evaluate("document.querySelector('[data-add=\"rq\"]').click()"); pg.wait_for_timeout(30)
        pg.evaluate("""(a)=>{ var tr=[...document.querySelectorAll('#rqRows tr')].pop(); var set=(k,v)=>{ tr.querySelector('[data-k='+k+']').value=v; };
          set('p',a[0]); set('t',a[1]); set('so',a[2]); set('d',a[3]); set('cl',a[4]); set('ad',a[5]); set('why',a[6]); tr.dispatchEvent(new Event('change',{bubbles:true})); }""", [pi, t, so, d, cl, ad, why])
    member("A", "Ops", "no")
    party("The community", "community", 3, "", 5, "")
    check("one person with a party: the one-person flag", "solo" in pg.evaluate("issues(formToRec()).map(x=>x[0])") and not pg.evaluate("document.getElementById('tmWarn').hidden"))
    member("B", "Finance", "no"); member("C", "Client rep", "customer")
    check("three roles with an outside input → team complete", R() == "team")
    check("a generic party name is flagged and keeps the register at 'team'", pg.evaluate("genP(formToRec().pts[0])") and "gen" in pg.evaluate("issues(formToRec()).map(x=>x[0])") and R() == "team" and pg.evaluate("document.querySelector('#ptCards .dm-card [data-flag]').textContent") != "")
    pg.evaluate("()=>{ var c=document.querySelector('#ptCards .dm-card'); c.querySelector('[data-k=n]').value='Al-Nakheel residents association'; c.dispatchEvent(new Event('change',{bubbles:true})); }")
    check("a specific party name → parties named", R() == "named")
    party("City permits department", "regulator", 5, "Can stop the site", 3, "Code compliance only", "PM", "Portal", "Per permit")
    party("Rebar trader B", "supplier", 2, "Alternatives exist", 2, "Small share", "", "", "")
    check("the key-party rule: power or interest of 4 or more (parties 1 and 2 key, 3 not)", pg.evaluate("formToRec().pts.map(isKey)") == [True, True, False])
    check("grid quadrants: inform, satisfy, monitor", pg.evaluate("formToRec().pts.map(quad)") == ["inform", "satisfy", "monitor"])
    check("parties with no requirement keep the register at 'named' and are listed", R() == "named" and not pg.evaluate("document.getElementById('rqWarn').hidden"))
    req("p1", "No work after 10 pm", "", "", "no", "yes")
    req("p2", "Permit before each lift", "Circular 33/2026", "2026-08-01", "no", "yes")
    req("p3", "20% advance", "", "", "no", "no")
    check("a key-party requirement with no source keeps the register at 'named'", R() == "named" and "src" in pg.evaluate("issues(formToRec()).map(x=>x[0])"))
    check("a 'no' decision with no reason is flagged", "dec" in pg.evaluate("issues(formToRec()).map(x=>x[0])") and pg.evaluate("[...document.querySelectorAll('#rqRows tr')][2].classList.contains('a3-pf')"))
    pg.evaluate("()=>{ var T=[...document.querySelectorAll('#rqRows tr')]; T[0].querySelector('[data-k=so]').value='Association minutes'; T[0].querySelector('[data-k=d]').value='2026-09-28'; T[2].querySelector('[data-k=why]').value='Payment policy'; T[2].dispatchEvent(new Event('change',{bubbles:true})); }")
    check("non-key requirement with no source is only noted (info) → requirements sourced and decided", R() == "reqs" and "srcx" in pg.evaluate("issues(formToRec()).map(x=>x[0])"))
    check("party 1 rated without reasons keeps the register at 'reqs'", R() == "reqs" and "rate" in pg.evaluate("issues(formToRec()).map(x=>x[0])"))
    pg.evaluate("()=>{ var c=document.querySelector('#ptCards .dm-card'); c.querySelector('[data-k=pwr]').value='Complains to the municipality'; c.querySelector('[data-k=inr]').value='The crane swings near homes'; c.dispatchEvent(new Event('change',{bubbles:true})); }")
    pg.evaluate("()=>{ var c=[...document.querySelectorAll('#ptCards .dm-card')][2]; c.querySelector('[data-k=pwr]').value='x'; c.querySelector('[data-k=inr]').value='y'; c.dispatchEvent(new Event('change',{bubbles:true})); }")
    check("all rated but the climate question not asked: still 'reqs'", R() == "reqs" and not pg.evaluate("document.getElementById('clWarn').hidden"))
    setf("clDec", "found"); setf("clWhy", "Asked the association and the permits department")
    check("'climate requirements found' with none marked climate-related is not enough", R() == "reqs" and "clim" in pg.evaluate("issues(formToRec()).map(x=>x[0])"))
    setf("clDec", "none")
    check("climate asked with the result → rated", R() == "rated")
    check("the grid has four quadrants, the matrix one row per party, the chart drawn", pg.evaluate("document.querySelectorAll('#skGrid .sk-q').length") == 4 and pg.evaluate("document.querySelectorAll('#skRm tbody tr').length") == 3 and pg.evaluate("document.querySelectorAll('#skChart svg rect').length") > 8)
    pg.evaluate("document.getElementById('ouAuto').click()"); pg.wait_for_timeout(80)
    check("'add an outcome for every key party' adds two rows", pg.evaluate("document.querySelectorAll('#ouRows tr').length") == 2)
    pg.evaluate("""()=>{ var T=[...document.querySelectorAll('#ouRows tr')]; var set=(tr,k,v)=>{ tr.querySelector('[data-k='+k+']').value=v; };
      set(T[0],'to','pestle'); set(T[0],'ref','PE-NONE'); set(T[1],'to','swot'); set(T[1],'q','t'); set(T[1],'ref','SW-NONE'); T[1].dispatchEvent(new Event('change',{bubbles:true})); }"""); pg.wait_for_timeout(60)
    check("a PESTLE outcome with no factor leaves a key party uncovered", pg.evaluate("uncov(formToRec()).length") == 1 and not pg.evaluate("document.getElementById('ouWarn').hidden"))
    check("a PESTLE outcome with an unknown scan says so (read-only preview)", "PESTLE" in pg.evaluate("document.querySelector('#ouRows [data-pv]').textContent"))
    pg.evaluate("()=>{ var tr=document.querySelector('#ouRows tr'); tr.querySelector('[data-k=fac]').value='s'; tr.dispatchEvent(new Event('change',{bubbles:true})); }")
    check("a key party with no owner/channel/frequency keeps the register at 'rated'", R() == "rated" and "eng" in pg.evaluate("issues(formToRec()).map(x=>x[0])"))
    pg.evaluate("()=>{ var c=document.querySelector('#ptCards .dm-card'); c.querySelector('[data-k=own]').value='Site manager'; c.querySelector('[data-k=ch]').value='Weekly message'; c.querySelector('[data-k=fq]').value='Weekly'; c.dispatchEvent(new Event('change',{bubbles:true})); }")
    check("every key party engaged with an outcome → engagement and outcomes", R() == "engaged")
    pg.evaluate("document.querySelector('[data-add=\"ac\"]').click()"); pg.wait_for_timeout(40)
    pg.evaluate("()=>{ var c=document.querySelector('#acCards .dm-card'); c.querySelector('[data-k=what]').value='Send the schedule'; c.dispatchEvent(new Event('change',{bubbles:true})); }")
    check("an action with no owner or date keeps the register at 'rated'", R() == "rated" and not pg.evaluate("document.getElementById('acWarn').hidden"))
    pg.evaluate("()=>{ var c=document.querySelector('#acCards .dm-card'); c.querySelector('[data-k=who]').value='SM'; c.querySelector('[data-k=by]').value='2026-12-01'; c.dispatchEvent(new Event('change',{bubbles:true})); }")
    setf("revBy", "2027-01-01"); setf("trig", "A complaint")
    pg.evaluate("document.querySelector('[data-add=\"rv\"]').click()")
    pg.evaluate("""()=>{ var tr=document.querySelector('#rvRows tr'); tr.querySelector('[data-k=date]').value='2026-09-01'; tr.querySelector('[data-k=chg]').value='New crane'; tr.dispatchEvent(new Event('change',{bubbles:true})); }"""); pg.wait_for_timeout(50)
    pg.evaluate("document.getElementById('saveBtn').click()")
    check("a review dated before the analysis is refused on save", pg.evaluate("document.getElementById('recErr').textContent") != "" and pg.evaluate("DB.records.length") == 0)
    pg.evaluate("()=>{ var tr=document.querySelector('#rvRows tr'); tr.querySelector('[data-k=date]').value='2026-10-10'; tr.dispatchEvent(new Event('change',{bubbles:true})); }")
    check("a review after the analysis with what changed, and a next date → reviewed", R() == "reviewed")
    pg.evaluate("document.getElementById('saveBtn').click()"); pg.wait_for_timeout(100)
    st = json.loads(pg.evaluate("localStorage.getItem('cia-stakeholders:v1')"))
    check("saved under ST-2026-001 with every part", [r["id"] for r in st["records"]] == ["ST-2026-001"] and len(st["records"][0]["pts"]) == 3 and len(st["records"][0]["reqs"]) == 3 and len(st["records"][0]["outs"]) == 2 and st["records"][0]["clim"]["dec"] == "none")
    a = pg.evaluate("auditRecord(DB.records[0])")
    check("audit: the reviewed register passes all ten checks", list(a.keys()) == ["ref", "team", "named", "src", "dec", "rate", "clim", "outs", "acts", "review"] and all(v is True for v in a.values()), a)
    pg.reload(wait_until="load"); pg.wait_for_timeout(400)
    check("persistence: the register is there after a reload", pg.evaluate("DB.records.length") == 1 and pg.evaluate("stageOf(DB.records[0])") == "reviewed")
    pg.evaluate("""localStorage.setItem('cia-stakeholders:v1', JSON.stringify({records:[{id:'X',title:'Broken',pts:[{n:5,pw:'9',ty:'zz'},null,'x'],reqs:[{p:'nope',ad:'qq'}],outs:[{to:'qq',p:'nope'}],clim:3,team:'no',revs:[{date:3}]}],assess:'x'}))"""); pg.reload(wait_until="load"); pg.wait_for_timeout(400)
    errs_b = list(errs)
    for t in TABS: pg.evaluate(f"go('{t}')")
    pg.evaluate("loadRecordIntoForm(DB.records[0]); go('tools')"); pg.wait_for_timeout(150)
    check("a record with missing or broken parts renders on every tab without errors", not errs and pg.evaluate("stageOf(DB.records[0])") == "draft", errs[:3])
    # ---- example
    pg.evaluate("go('docs')"); pg.evaluate("document.getElementById('pfEx').click()"); pg.wait_for_timeout(300)
    check("example: three registers ST-EX-01…03 with stages reviewed / reviewed / engaged", pg.evaluate("DB.records.map(r=>r.id+':'+stageOf(r)).join(',')") == "ST-EX-01:reviewed,ST-EX-02:reviewed,ST-EX-03:engaged")
    check("example: self-assessment 71%", pg.evaluate("assessScore()") == 71)
    au = pg.evaluate("auditSummary()")
    check("example: audit 100% of the applicable checks", au["rate"] == 100 and au["failRec"] == 0, au)
    check("example: the client's hot-weather method statement is a climate-related requirement", pg.evaluate("DB.records[0].reqs[0].cl==='yes' && DB.records[0].clim.dec==='found'"))
    check("example: ST-EX-01 outcomes go to SW-EX-01 and PE-EX-01; ST-EX-02 to SW-EX-02 and the bid risk entry", pg.evaluate("DB.records[0].outs.some(o=>o.ref==='SW-EX-01')&&DB.records[0].outs.some(o=>o.to==='pestle'&&o.ref==='PE-EX-01')&&DB.records[1].outs.some(o=>o.ref==='SW-EX-02')&&DB.records[1].outs.some(o=>o.to==='reg'&&o.ref==='RR-BID-HB-03')"))
    check("example: residents named by their association (no generic party)", pg.evaluate("DB.records.every(r=>!pts(r).some(genP))") and "جمعية سكان" in pg.evaluate("DB.records[2].pts[2].n"))
    check("example: 15/15 key-party requirements and 13/13 key parties on the dashboard", all(x in pg.evaluate("go('dash'); document.getElementById('dKpis').innerText") for x in ("15/15", "13/13")))
    check("example: 2026 dates up to today, illustrative", all("2026-01-01" <= r["date"] <= "2026-10-17" for r in json.loads(pg.evaluate("localStorage.getItem('cia-stakeholders:v1')"))["records"]) and "illustrative" in pg.evaluate("UI.en.exS"))
    check("example: the only open item is the Tower C register not reviewed yet", pg.evaluate("openItems().map(x=>x.r.id).join(',')") == "ST-EX-03")
    csv = pg.evaluate("buildCSV()"); rep = pg.evaluate("buildReportHTML()")
    check("CSV: BOM, 21 columns, one row per register", csv.startswith("﻿") and csv.split("\n")[0].count(",") == 20 and csv.count("ST-EX-0") >= 3)
    check("report: cover with the author, grid, requirements matrix, outcomes, audit and self-assessment", "مدثر سلامه" in rep and rep.count('class="sk-grid"') == 3 and rep.count('class="sk-rm"') == 3 and "Audit results" in rep and "Self-assessment" in rep)
    pg.evaluate("go('docs')"); pg.evaluate("document.querySelector('[data-del=\"ST-EX-02\"]').click()")
    check("delete needs a second click", pg.evaluate("DB.records.length") == 3)
    pg.evaluate("document.querySelector('[data-del=\"ST-EX-02\"]').click()")
    check("second click deletes", pg.evaluate("DB.records.length") == 2)
    pg.evaluate("document.getElementById('pfReset').click()"); pg.wait_for_timeout(100)
    check("clear all (with its confirmation) empties the tool's key only", pg.evaluate("localStorage.getItem('cia-stakeholders:v1')") is None and pg.evaluate("DB.records.length") == 0)
    check("no page errors in the main run", not [x for x in errs if x not in errs_b], errs[:3])
    ctx.close()
    # ---- links: SWOT, PESTLE, the Strategy Studio and Lessons examples in this browser (read only)
    ctx, pg, errs = page(b)
    for mod in ("strategy-performance", "swot", "pestle", "lessons"):
        ex(pg, mod)
    keys = ["strategy-studio:v1", "cia-swot:v1", "cia-pestle:v1", "cia-lessons:v1"]
    before = pg.evaluate("(k)=>k.map(x=>localStorage.getItem(x))", keys)
    pg.goto(URL, wait_until="load"); pg.wait_for_timeout(400)
    check("home: the start note counts the items other tools hold", not pg.evaluate("document.getElementById('homeImp').hidden"))
    pg.evaluate("go('tools')")
    counts = {}
    for s in ("swot", "pestle", "strat", "lessons"):
        pg.select_option("#stSrc", s); pg.evaluate("document.getElementById('stPrev').click()"); pg.wait_for_timeout(80)
        counts[s] = pg.evaluate("document.getElementById('stTable').hidden?0:document.querySelectorAll('#stTable tbody tr').length")
    check("start previews: SWOT items naming a party (2), PESTLE items with 'who is affected' (18), Studio rows naming a party (2), customer/supplier lessons (0)", counts == {"swot": 2, "pestle": 18, "strat": 2, "lessons": 0}, counts)
    check("PESTLE read with its own stage rule and score", pg.evaluate("PER.stage(peRec('PE-EX-01'))") == "reviewed" and "PE-EX-01" in pg.evaluate("pvPeScan('PE-EX-01')"))
    check("SWOT read with its own stage rule", pg.evaluate("SWR.stage(swRec('SW-EX-01'))") == "reviewed" and "SW-EX-01" in pg.evaluate("pvSwStudy('SW-EX-01')"))
    pg.select_option("#stSrc", "pestle"); pg.evaluate("document.getElementById('stPrev').click()"); pg.wait_for_timeout(60)
    pg.evaluate("document.querySelector('#stTable [data-stid=\"PE-EX-03\"][data-stx=\"\"]').click()"); pg.wait_for_timeout(150)
    r = pg.evaluate("formToRec()")
    check("start from a PESTLE scan: each item's 'who is affected' becomes a party with the item as its requirement, source and date", r["src"] == "pestle" and len(r["pts"]) == 5 and len(r["reqs"]) == 5 and all(q["so"] and q["d"] for q in r["reqs"]) and r["pts"][0]["sid"].startswith("PE-EX-03/") and pg.evaluate("DB.records.length") == 0)
    check("party source ids show a preview by PESTLE's rule", "PE-EX-03" in pg.evaluate("document.querySelector('#ptCards .dm-card [data-pv]').textContent"))
    check("the source shows in the header with its preview", "PE-EX-03" in pg.evaluate("document.getElementById('srcInfo').textContent"))
    pg.select_option("#stSrc", "strat"); pg.evaluate("document.getElementById('stPrev').click()"); pg.wait_for_timeout(60)
    pg.evaluate("document.querySelector('#stTable [data-stid=\"SW-03\"]').click()"); pg.wait_for_timeout(150)
    r = pg.evaluate("formToRec()")
    check("start from a Studio row: one party of the suggested type (customer)", r["src"] == "strat" and len(r["pts"]) == 1 and r["pts"][0]["ty"] == "customer")
    after = pg.evaluate("(k)=>k.map(x=>localStorage.getItem(x))", keys)
    check("the other tools' stored data is unchanged (read only)", before == after)
    pg.goto(URL + "?swot=SW-EX-03&item=i5", wait_until="load"); pg.wait_for_timeout(400)
    check("?swot=&item= starts a new register from that item", pg.evaluate("curTab") == "tools" and pg.evaluate("formToRec().pts.length") == 1 and pg.evaluate("formToRec().pts[0].ty") == "supplier")
    pg.goto(URL + "?pestle=PE-EX-01&item=f7", wait_until="load"); pg.wait_for_timeout(400)
    check("?pestle=&item= starts from one item; an environmental item is marked climate-related", pg.evaluate("formToRec().reqs.length") == 1 and pg.evaluate("formToRec().reqs[0].cl") == "yes")
    pg.evaluate("sessionStorage.setItem('cia-nav:stakeholders', JSON.stringify({strat:'PE-02'}))"); pg.goto(URL, wait_until="load"); pg.wait_for_timeout(400)
    check("the one-time hint cia-nav:stakeholders starts a register and is removed", pg.evaluate("formToRec().src") == "strat" and pg.evaluate("formToRec().pts[0].ty") == "partner" and pg.evaluate("sessionStorage.getItem('cia-nav:stakeholders')") is None)
    pg.evaluate("go('docs')"); pg.evaluate("document.getElementById('pfEx').click()"); pg.wait_for_timeout(200)
    pg.goto(URL + "?open=ST-EX-01", wait_until="load"); pg.wait_for_timeout(400)
    check("?open= loads a saved register", pg.evaluate("document.getElementById('rid').value") == "ST-EX-01")
    pv = pg.evaluate("[...document.querySelectorAll('#ouRows [data-pv]')].map(x=>x.textContent)")
    check("SWOT and PESTLE outcomes preview SW-EX-01 and PE-EX-01 with each tool's own stage", "SW-EX-01" in pv[0] and "روجعت" in pv[0] and "PE-EX-01" in pv[1], pv[:2])
    check("no errors with other tools' data", not errs, errs[:3])
    ctx.close()
    # ---- assistant and keyboard
    ctx, pg, errs = page(b)
    pg.goto(URL, wait_until="load"); pg.wait_for_timeout(400)
    pg.evaluate("document.getElementById('cbFab').click()"); pg.wait_for_timeout(100)
    check("assistant: five suggested questions including 'useful' and 'Stakeholders, PESTLE or SWOT'", pg.evaluate("document.querySelectorAll('#cbSug button').length") == 5 and pg.evaluate("['useful','which'].every(id=>!!document.querySelector('#cbSug [data-sid='+id+']'))"))
    pg.evaluate("cbSend('ما الذي يجعل تحليل الأطراف المعنية مفيداً؟')")
    check("assistant answers 'useful' with the stages", "قرار" in pg.evaluate("document.getElementById('cbBody').innerText"))
    pg.evaluate("cbSend('Stakeholders, PESTLE or SWOT - which one?')")
    check("assistant answers 'which one' with 4.2 and 4.1", "4.2" in pg.evaluate("document.getElementById('cbBody').innerText") and "4.1" in pg.evaluate("document.getElementById('cbBody').innerText"))
    k = pg.evaluate("KB.map(k=>k.dyn?'d':'f')")
    check("assistant: 4–6 fixed FAQ answers plus two answers from the registers", k.count("f") in (4, 5, 6) and k.count("d") == 2)
    pg.keyboard.press("Escape"); pg.wait_for_timeout(100)
    check("Escape closes the assistant", pg.evaluate("document.getElementById('cb').hidden"))
    pg.evaluate("go('tools')"); pg.focus("#f-title"); pg.keyboard.type("Keyboard register"); pg.keyboard.press("Tab")
    check("keyboard: typing into the form and tabbing moves focus", pg.evaluate("document.getElementById('f-title').value") == "Keyboard register" and pg.evaluate("document.activeElement.id") != "f-title")
    check("no errors", not errs, errs[:3])
    ctx.close()
    ctx = b.new_context(viewport={"width": 1280, "height": 900}); pg = ctx.new_page()
    pg.goto(URL, wait_until="load"); pg.wait_for_timeout(1200)
    check("guided tour layer is present (launch button)", pg.evaluate("!!window.ciaTour") and pg.evaluate("document.body.innerText").find("جولة") >= 0)
    ctx.close()
    # ---- 390 px
    ctx, pg, errs = page(b, 390)
    pg.goto(URL, wait_until="load"); pg.wait_for_timeout(400)
    pg.evaluate("go('docs')"); pg.evaluate("document.getElementById('pfEx').click()"); pg.wait_for_timeout(200)
    over = []
    for lang in ("ar", "en"):
        for t in TABS:
            if t == "tools": pg.evaluate("loadRecordIntoForm(DB.records[0])")
            pg.evaluate(f"go('{t}')"); pg.wait_for_timeout(80)
            if pg.evaluate("document.documentElement.scrollWidth") > 392: over.append(lang + ":" + t)
        pg.evaluate("switchLang()")
    check("390 px: no page overflow on any tab in AR and EN (register loaded)", not over, over)
    pg.evaluate("go('tools')"); pg.wait_for_timeout(100)
    g = pg.evaluate("(function(){ var g=document.querySelector('#skGrid .sk-grid'), q=g.querySelectorAll('.sk-q'); return [g.getBoundingClientRect().width, q[0].getBoundingClientRect().left>q[1].getBoundingClientRect().left]; })()")
    check("390 px: the grid fits in two columns (Arabic: high interest on the left)", g[0] <= 360 and g[1] is True, g)
    check("390 px: no errors", not errs, errs[:2])
    ctx.close()
    # ---- hub
    ctx, pg, errs = page(b)
    pg.goto(BASE + "/index.html", wait_until="load"); pg.wait_for_timeout(600)
    check("hub: URL, Audit & Improvement row and card (STK)", pg.evaluate("URLS.stakeholders") == "./modules/stakeholders.html" and pg.evaluate("SYSTEMS.find(s=>s.id==='aud').mods.some(t=>t.k==='stakeholders'&&t.status==='live')") and pg.evaluate("TOOLKITS.some(t=>t.k==='stakeholders'&&t.code==='STK'&&t.pre==='CIA')"))
    check("hub: 39 tools and Audit & Improvement 16", pg.evaluate("TOOLKITS.length") == 39 and pg.evaluate("wStats().per[SYSTEMS.findIndex(s=>s.id==='aud')].n") == 16)
    check("hub: adapter reads the example snapshot (71%, 15/15, 13/13, 2/3)", pg.evaluate("JSON.stringify(DEMO_RES.stakeholders.m.map(x=>x[3]))") == '["71%","15/15","13/13","2/3","12/12"]')
    check("hub: TOOLINFO (12 questions, tools tab), NEWS and the request mapping", pg.evaluate("!!TOOLINFO.stakeholders && TOOLINFO.stakeholders.q===12 && TOOLINFO.stakeholders.start==='tools'") and pg.evaluate("NEWS[0].k") == "stakeholders" and pg.evaluate("JSON.stringify(TOOL_RQ.stakeholders)") == '["iac",null]')
    check("hub: the toolbox is complete — no grouped 'coming soon' toolbox entry", pg.evaluate("(typeof SOON!=='undefined'?SOON:[]).filter(t=>t.k==='citbox').length") == 0 and pg.evaluate("SOON.map(t=>t.k).join(',')") == "egea")
    check("hub: Advisor rules name the stakeholder tool for certification, strategy and KPIs, and risk", pg.evaluate("ADVISOR_RULES.filter(r=>r[2].stakeholders).map(r=>r[0]+':'+r[1]).sort().join(',')") == "goal:cert,goal:kpi,goal:risk")
    check("hub: knowledge topic links the method guide", 'guide:{k:"stakeholders",a:"explain-std"}' in read(os.path.join(ROOT, "index.html")))
    check("hub: PDCA card says the toolbox is complete", "stakeholder analysis are live: the toolbox is complete" in read(os.path.join(ROOT, "index.html")))
    pg.evaluate("ciaOpenFile('stakeholders.html')"); pg.wait_for_timeout(800)
    check("hub: ciaOpenFile opens the tool in the overlay", "stakeholders.html" in pg.evaluate("document.getElementById('modFrame').src"))
    check("hub: no errors", not errs, errs[:3])
    ctx.close()
    b.close()
failed = [r for r in results if not r[1]]
print(f"\n{len(results) - len(failed)}/{len(results)} passed")
sys.exit(1 if failed else 0)
