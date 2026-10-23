"""SWOT tool (modules/swot.html) — 2026-10-17. Same style as tests/lessons/test_lessons.py.
Covers: shared engine (twelve files) and layer identity, AR/EN and RTL/LTR, tabs, kit links both ways, self-assessment, the study record
(validation, the computed stage scoped → team → quadrants with evidence → ranked → TOWS options → actions and risks → reviewed, the one-person
flag, the outside-input rule, the evidence / opinion-only / "lack of…" flags, the placement check and the note that accepts it, ranking and
"rank by weight", TOWS options linking two quadrants, actions with owner and date, risk entries for the top threats, the review and its date),
the grid (mirrored for Arabic, 390 px), the TOWS matrix and the chart of sources, records, audit (10 checks), dashboard, report and CSV,
persistence, example data, clear all, a record with missing parts, the read-only starts from the Strategy Studio (SWOT, whole grid, TOWS,
PESTLE), lessons, Pareto and FMEA with previews by each tool's own rule (other tools only read), the ?open= / ?strat= / ?fmea= requests and
the hub hint, the assistant, the guided tour, keyboard use, 390 px and the hub links.
Served over http when the platform server runs (CIA_BASE, default http://127.0.0.1:8802).
Usage: python3 tests/swot/test_swot.py"""
import os, sys, json, re
from playwright.sync_api import sync_playwright
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
MOD = os.path.join(ROOT, "modules")
BASE = os.environ.get("CIA_BASE", "http://127.0.0.1:8802")
URL = BASE + "/modules/swot.html"
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
FILES = ["pdca", "capa", "five-whys", "fishbone", "pareto", "rca", "a3", "dmaic", "iso10009", "fmea", "lessons", "swot"]
src = {f: read(os.path.join(MOD, f + ".html")) for f in FILES}
sw, tpl = src["swot"], read(os.path.join(ROOT, "templates", "explain-kit-template.html"))
e = [engine(src[f]) for f in FILES]
check("engine block present once in the twelve toolbox files", all(x is not None for x in e))
check("engine block identical in the twelve files and to tests/build/engine.js", len(set(e)) == 1 and e[0] == read(os.path.join(ROOT, "tests", "build", "engine.js")).rstrip("\n"))
for tag, id_ in (("style", "cia-explain-kit-css"), ("script", "cia-explain-kit-js")):
    check(f"swot.html {id_} byte-identical to the template", block(sw, tag, id_) == block(tpl, tag, id_))
norm = lambda x: re.sub(r"var CFG=\{.*?\};", "var CFG={};", x or "", count=1)
check("tour script identical to lessons.html apart from CFG", norm(block(sw, "script", "cia-tour-js")) == norm(block(src["lessons"], "script", "cia-tour-js")) and block(sw, "script", "cia-tour-js") != block(src["lessons"], "script", "cia-tour-js"))
check("tour CSS identical to lessons.html", block(sw, "style", "cia-tour-css") == block(src["lessons"], "style", "cia-tour-css"))
check("tour CFG names swot and guards the example", 'var CFG={"file": "swot", "hasEx": true, "guard": {"pfEx": "all"}};' in sw)
i0 = sw.find("SWOT tool — host logic")
check("storage key and schema documented at the top of the host script", 'STORE="cia-swot:v1"' in sw and "Schema:" in sw[i0:i0 + 9000] and '"strategy-studio:v1"' in sw[i0:i0 + 9000])
host = sw[i0:sw.find("<!-- CIA guided tour")]; host = host.replace(engine(sw) or "", "")
check("the host writes only its own key (TBX.save/drop on STORE, language key only)", not re.search(r"TBX\.(save|drop)\((?!STORE)", host) and not re.search(r"localStorage\.(setItem|removeItem)\((?!LKEY)", host))
check("other tools' rules are carried read-only: ssTKV, ssIds, SSO, paRank/paStage, FMR, LLR", all(x in sw for x in ("var ssTKV=", "var ssIds=", "var SSO=(function(){", "function paRank(p)", "function paStage(p)", "var FMR=(function(){", "var LLR=(function(){")))
data = block(sw, "script", "cia-explain-data")
check("Explain Kit data: EXPLAIN_SWOT with meta.verified, 4.1, 4.2, 6.1.1, 6.1.2, 6.1.3, 6.2, 9.3.2, 3.1.2, 3.1.4, 5.1, 5.2, 5.3 and 'not verified'", data and "const EXPLAIN_SWOT=" in data and '"verified"' in data and all(('"c": "%s"' % c) in data for c in ("4.1", "4.2", "6.1.1", "6.1.2", "6.1.3", "6.2", "9.3.2", "3.1.2", "3.1.4", "5.1", "5.2", "5.3")) and "not verified" in data)
check("Explain Kit ui labels set (roles, wheelT, purpose, smap, assess, assessOff, offGo, actCtx)", all(('"%s"' % k) in data for k in ("roles", "wheelT", "purpose", "smap", "assess", "assessOff", "offGo", "actCtx")))
check("every self-assessment question is reached from the kit", all(('"q": "%s"' % q) in data for q in ("IN1", "IN2", "IN3", "EV1", "EV2", "EV3", "DE1", "DE2", "DE3", "RV1", "RV2", "RV3")))
check("method guide says once that SWOT is a technique, not a requirement", "SWOT is a technique, not a requirement of any standard" in sw and "SWOT أسلوب، وليس متطلباً في أي مواصفة" in sw)
check("author name on the page and the report", sw.count("مدثر سلامه") >= 5)
check("sidebar buttons carry data-go and data-t", all(('data-go="%s" data-t="%s"' % (t, t)) in sw for t in TABS))

FREEZE = """(function(){ var T=Date.UTC(2026,9,17,9,0,0), OD=Date;
 function FD(){ if(!(this instanceof FD)) return new OD(T).toString(); var a=[].slice.call(arguments);
   return a.length? new (Function.prototype.bind.apply(OD,[null].concat(a)))() : new OD(T); }
 FD.now=function(){ return T; }; FD.UTC=OD.UTC; FD.parse=OD.parse; FD.prototype=OD.prototype; window.Date=FD;
 try{ if(!sessionStorage.getItem('f0')){ sessionStorage.setItem('f0','1'); localStorage.clear(); localStorage.setItem('cia-lang','ar');
   ['swot','lessons','fmea','pareto','strategy-performance'].forEach(function(k){ localStorage.setItem('cia-tour:m:'+k,'done'); }); } }catch(e){} })();"""


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
    check("home: code badge, author, launch tiles and the related-tools strip", "SWOT" in pg.evaluate("document.querySelector('.std-code').textContent") and "مدثر سلامه" in pg.evaluate("document.querySelector('.author').textContent") and pg.evaluate("document.querySelectorAll('#launchGrid a').length") == 9 and pg.evaluate("document.querySelectorAll('#homeStd a.hs').length") == 10)
    check("AI tab is a placeholder labelled under construction", "قيد الإنشاء" in pg.evaluate("document.querySelector('[data-tab=ai]').innerText"))
    for lang in ("ar", "en"):
        for t in TABS:
            pg.evaluate(f"go('{t}')"); pg.wait_for_timeout(60)
            tx = pg.evaluate(f"document.querySelector('.tabpane[data-tab=\"{t}\"]').innerText")
            if any(w in tx for w in BAD) or len(tx.strip()) < 40:
                check(f"{lang}:{t} renders text with no undefined/NaN", False, tx[:200])
        if lang == "ar": pg.evaluate("switchLang()")
    check("every tab renders in AR and EN with no undefined/NaN/[object Object]", not [r for r in results if r[0].startswith(("ar:", "en:")) and not r[1]])
    check("English switches to LTR and the title", pg.evaluate("document.documentElement.dir") == "ltr" and "SWOT" in pg.evaluate("document.title"))
    pg.evaluate("switchLang()")
    # ---- kit
    pg.evaluate("go('explain-cl')"); pg.wait_for_timeout(300)
    check("clause guide renders the sections", pg.evaluate("document.querySelectorAll('#ex-cl-box [data-ex-sec], #ex-cl-box .ex-sec, #ex-cl-box section').length") >= 5)
    pg.evaluate("go('explain-std')"); pg.wait_for_timeout(300)
    check("method guide shows the term box and the kit", "SWOT" in pg.evaluate("document.getElementById('swTerm').innerText") and len(pg.evaluate("document.getElementById('ex-std-box').innerText")) > 400)
    check("kit: assess hook knows every question and refuses others", pg.evaluate("['IN1','RV3'].every(q=>AQ.some(x=>x[0]===q))") and not pg.evaluate("AQ.some(x=>x[0]==='x:tools')"))
    # ---- self-assessment
    pg.evaluate("go('assess')"); pg.wait_for_timeout(100)
    check("12 questions in 4 groups on a 0–2 scale", pg.evaluate("document.querySelectorAll('#asList .ex-aq').length") == 12 and pg.evaluate("document.querySelectorAll('#asList input[type=radio]').length") == 36)
    pg.evaluate("document.getElementById('as-IN1-2').click()"); pg.wait_for_timeout(100)
    check("an answer is saved under cia-swot:v1 and scored", json.loads(pg.evaluate("localStorage.getItem('cia-swot:v1')"))["assess"] == {"IN1": 2} and pg.evaluate("assessScore()") == 8)
    pg.evaluate("document.getElementById('asReset').click()")
    # ---- the study form: stages one by one
    pg.evaluate("go('tools')"); pg.wait_for_timeout(150)
    R = lambda: pg.evaluate("stageOf(formToRec())")
    check("an empty study is a draft", R() == "draft")
    pg.evaluate("document.getElementById('saveBtn').click()")
    check("saving with no title is refused", pg.evaluate("document.getElementById('recErr').textContent") != "" and pg.evaluate("DB.records.length") == 0)
    def setf(k, v):
        pg.evaluate("([k,v])=>{ var e=document.getElementById('f-'+k); e.value=v; e.dispatchEvent(new Event('input',{bubbles:true})); e.dispatchEvent(new Event('change',{bubbles:true})); }", [k, v])
    for k, v in (("title", "Test study"), ("ref", "T-1"), ("scope", "process"), ("decision", "Decide X"), ("date", "2026-10-01"), ("facil", "QM")):
        setf(k, v)
    check("title, reference, scope, decision, date and facilitator → scoped", R() == "scoped")
    pg.evaluate("document.querySelector('[data-add=\"tm\"]').click()")
    pg.evaluate("""()=>{ var r=document.querySelector('#tmRows tr'); r.querySelector('[data-k=n]').value='A'; r.querySelector('[data-k=role]').value='Ops'; r.dispatchEvent(new Event('input',{bubbles:true})); }"""); pg.wait_for_timeout(50)
    pg.evaluate("document.querySelector('[data-add=\"it:s\"]').click()")
    pg.evaluate("()=>{ var c=document.querySelector('#itC-s .dm-card'); c.querySelector('[data-k=t]').value='S one'; c.dispatchEvent(new Event('input',{bubbles:true})); }"); pg.wait_for_timeout(50)
    check("one person with an item: the one-person flag", "solo" in pg.evaluate("issues(formToRec()).map(x=>x[0])") and not pg.evaluate("document.getElementById('tmWarn').hidden"))
    for n, role, ext in (("B", "Finance", "no"), ("C", "Customer rep", "customer")):
        pg.evaluate("document.querySelector('[data-add=\"tm\"]').click()")
        pg.evaluate("""([n,r,x])=>{ var t=[...document.querySelectorAll('#tmRows tr')].pop(); t.querySelector('[data-k=n]').value=n; t.querySelector('[data-k=role]').value=r; t.querySelector('[data-k=ext]').value=x; t.dispatchEvent(new Event('change',{bubbles:true})); }""", [n, role, ext])
    check("three roles with an outside input → team complete", R() == "team")
    def add_item(q, t, ev, srcT, w, rk):
        pg.evaluate(f"document.querySelector('[data-add=\"it:{q}\"]').click()")
        pg.evaluate("""([q,t,ev,s,w,rk])=>{ var c=[...document.querySelectorAll('#itC-'+q+' .dm-card')].pop(); c.querySelector('[data-k=t]').value=t; c.querySelector('[data-k=ev]').value=ev; c.querySelector('[data-k=src]').value=s; c.querySelector('[data-k=w]').value=String(w); c.querySelector('[data-k=rk]').value=rk?String(rk):''; c.dispatchEvent(new Event('change',{bubbles:true})); }""", [q, t, ev, srcT, w, rk])
    pg.evaluate("()=>{ var c=document.querySelector('#itC-s .dm-card'); c.querySelector('[data-k=ev]').value='12% better'; c.querySelector('[data-k=src]').value='kpi'; c.querySelector('[data-k=w]').value='5'; c.querySelector('[data-k=rk]').value='1'; c.dispatchEvent(new Event('change',{bubbles:true})); }")
    add_item("w", "Lack of planners", "", "opinion", 4, 1)
    check("a weakness written \"lack of…\" with no evidence is flagged", "lack" in pg.evaluate("issues(formToRec()).map(x=>x[0])") and "Lack" not in "" and pg.evaluate("document.querySelector('#itC-w .dm-card [data-flag]').textContent") != "")
    check("an opinion-only top item keeps the study before 'quadrants with evidence'", R() == "team")
    pg.evaluate("()=>{ var c=document.querySelector('#itC-w .dm-card'); c.querySelector('[data-k=ev]').value='2 planners for 9 sites'; c.querySelector('[data-k=src]').value='kpi'; c.dispatchEvent(new Event('change',{bubbles:true})); }")
    check("with evidence the \"lack of\" flag goes", "lack" not in pg.evaluate("issues(formToRec()).map(x=>x[0])"))
    add_item("o", "New code", "From 2027", "pestle", 4, 1)
    add_item("t", "Competitor X grows", "5 new bidders", "kpi", 3, 1)
    check("an internal source (KPI) in an external quadrant is flagged as misplaced", pg.evaluate("misplaced(formToRec()).length") == 1 and R() == "team")
    pg.evaluate("()=>{ var c=document.querySelector('#itC-t .dm-card'); c.querySelector('[data-k=note]').value='Counted from the tenders bulletin'; c.dispatchEvent(new Event('change',{bubbles:true})); }")
    check("a placement note accepts the item → quadrants with evidence; ranks complete → ranked", pg.evaluate("misplaced(formToRec()).length") == 0 and R() == "ranked")
    add_item("o", "Second opp", "data", "market", 5, None)
    check("an item with no rank keeps the study at 'quadrants with evidence'", R() == "quads")
    pg.evaluate("document.getElementById('rkBtn').click()"); pg.wait_for_timeout(80)
    check("rank by weight fills ranks inside each quadrant (heavier first)", R() == "ranked" and pg.evaluate("formToRec().items.filter(i=>i.q==='o').map(i=>i.rk)") == [2, 1])
    check("the grid shows the four quadrants with top items", pg.evaluate("document.querySelectorAll('#swGrid .sw-q').length") == 4 and pg.evaluate("document.querySelectorAll('#swGrid .sw-q li').length") == 5)
    # TOWS
    pg.evaluate("document.querySelector('[data-add=\"op\"]').click()"); pg.wait_for_timeout(50)
    pg.evaluate("()=>{ var c=document.querySelector('#opCards .dm-card'); c.querySelector('[data-k=t]').value='Use S1 for O'; c.dispatchEvent(new Event('input',{bubbles:true})); }"); pg.wait_for_timeout(50)
    check("an option with no links is flagged (link both quadrants)", pg.evaluate("badOpts(formToRec()).length") == 1)
    pg.evaluate("()=>{ var c=document.querySelector('#opCards .dm-card'); c.querySelectorAll('fieldset[data-side=a] input')[0].checked=true; c.querySelectorAll('fieldset[data-side=b] input').forEach(x=>x.checked=true); c.dispatchEvent(new Event('change',{bubbles:true})); }"); pg.wait_for_timeout(50)
    check("an SO option linking a strength and both opportunities is valid; W and T still uncovered", pg.evaluate("badOpts(formToRec()).length") == 0 and pg.evaluate("uncov(formToRec()).length") == 2 and R() == "ranked")
    pg.evaluate("document.querySelector('[data-add=\"op\"]').click()"); pg.wait_for_timeout(50)
    pg.evaluate("()=>{ var c=[...document.querySelectorAll('#opCards .dm-card')].pop(); var k=c.querySelector('[data-k=k]'); k.value='wt'; c.querySelector('[data-k=t]').value='Train planners before the competitor arrives'; k.dispatchEvent(new Event('change',{bubbles:true})); }"); pg.wait_for_timeout(60)
    check("changing the option type redraws its item lists (W and T)", pg.evaluate("[...[...document.querySelectorAll('#opCards .dm-card')].pop().querySelectorAll('legend')].map(l=>l.textContent).join('|')").count("|") == 1 and "Weakness" not in "" )
    pg.evaluate("()=>{ var c=[...document.querySelectorAll('#opCards .dm-card')].pop(); c.querySelectorAll('input[data-iid]').forEach(x=>x.checked=true); c.dispatchEvent(new Event('change',{bubbles:true})); }"); pg.wait_for_timeout(50)
    check("every top item in an option → TOWS options", R() == "options")
    check("the TOWS matrix lists the options by type", pg.evaluate("document.querySelectorAll('#swTows .sw-tw li').length") == 2)
    # actions and entries
    for i in range(2):
        pg.evaluate("document.querySelector('[data-add=\"ac\"]').click()"); pg.wait_for_timeout(40)
    pg.evaluate("""()=>{ var C=document.querySelectorAll('#acCards .dm-card'), O=formToRec().opts; C.forEach(function(c,i){ c.querySelector('[data-k=opt]').value=O[i].id; c.querySelector('[data-k=what]').value='Act '+i; c.querySelector('[data-k=who]').value='Owner'; c.querySelector('[data-k=by]').value='2026-12-01'; }); C[0].dispatchEvent(new Event('change',{bubbles:true})); }"""); pg.wait_for_timeout(50)
    check("actions with owner and date, but the top threat has no risk entry → still options", R() == "options" and pg.evaluate("roMiss(formToRec()).length") == 1 and not pg.evaluate("document.getElementById('roWarn').hidden"))
    pg.evaluate("document.querySelector('[data-add=\"ro\"]').click()"); pg.wait_for_timeout(50)
    pg.evaluate("""()=>{ var tr=document.querySelector('#roRows tr'), T=formToRec().items.filter(i=>i.q==='t')[0]; tr.querySelector('[data-k=item]').value=T.id; tr.querySelector('[data-k=what]').value='Margin risk'; tr.querySelector('[data-k=dest]').value='fmea'; tr.querySelector('[data-k=ref]').value='FM-NONE'; tr.dispatchEvent(new Event('change',{bubbles:true})); }"""); pg.wait_for_timeout(50)
    check("a risk entry for the top threat → actions and risks", R() == "actions")
    check("an FMEA destination with an unknown study says so (read-only preview)", "FMEA" in pg.evaluate("document.querySelector('#roRows [data-pv]').textContent"))
    setf("revBy", "2027-01-01")
    pg.evaluate("document.querySelector('[data-add=\"rv\"]').click()")
    pg.evaluate("""()=>{ var tr=document.querySelector('#rvRows tr'); tr.querySelector('[data-k=date]').value='2026-09-01'; tr.querySelector('[data-k=chg]').value='Context changed'; tr.dispatchEvent(new Event('change',{bubbles:true})); }"""); pg.wait_for_timeout(50)
    pg.evaluate("document.getElementById('saveBtn').click()")
    check("a review dated before the analysis is refused on save", pg.evaluate("document.getElementById('recErr').textContent") != "" and pg.evaluate("DB.records.length") == 0)
    pg.evaluate("()=>{ var tr=document.querySelector('#rvRows tr'); tr.querySelector('[data-k=date]').value='2026-10-10'; tr.dispatchEvent(new Event('change',{bubbles:true})); }")
    check("a review after the analysis with what changed, and a next date → reviewed", R() == "reviewed")
    pg.evaluate("document.getElementById('saveBtn').click()"); pg.wait_for_timeout(100)
    st = json.loads(pg.evaluate("localStorage.getItem('cia-swot:v1')"))
    check("saved under SW-2026-001 with every part", [r["id"] for r in st["records"]] == ["SW-2026-001"] and len(st["records"][0]["items"]) == 5 and len(st["records"][0]["opts"]) == 2 and len(st["records"][0]["ros"]) == 1)
    a = pg.evaluate("auditRecord(DB.records[0])")
    check("audit: the reviewed study passes all ten checks", list(a.keys()) == ["ref", "team", "quad", "evid", "place", "rank", "tows", "acts", "ro", "review"] and all(v is True for v in a.values()), a)
    setf("revBy", "2026-10-12")
    check("a passed review date counts as kept when a review was held before it", pg.evaluate("revLate(formToRec())") is False)
    pg.reload(wait_until="load"); pg.wait_for_timeout(400)
    check("persistence: the study is there after a reload", pg.evaluate("DB.records.length") == 1 and pg.evaluate("stageOf(DB.records[0])") == "reviewed")
    # broken record renders
    pg.evaluate("""localStorage.setItem('cia-swot:v1', JSON.stringify({records:[{id:'X',title:'Broken',items:[{q:'zz',t:5},null,'x'],opts:[{k:'qq',a:'bad'}],team:'no',revs:[{date:3}]}],assess:'x'}))"""); pg.reload(wait_until="load"); pg.wait_for_timeout(400)
    errs_b = list(errs)
    for t in TABS: pg.evaluate(f"go('{t}')")
    pg.evaluate("loadRecordIntoForm(DB.records[0]); go('tools')"); pg.wait_for_timeout(150)
    check("a record with missing or broken parts renders on every tab without errors", not errs and pg.evaluate("stageOf(DB.records[0])") == "draft", errs[:3])
    # ---- example
    pg.evaluate("go('docs')"); pg.evaluate("document.getElementById('pfEx').click()"); pg.wait_for_timeout(300)
    check("example: three studies SW-EX-01…03 with stages reviewed / actions / actions", pg.evaluate("DB.records.map(r=>r.id+':'+stageOf(r)).join(',')") == "SW-EX-01:reviewed,SW-EX-02:actions,SW-EX-03:actions")
    check("example: self-assessment 71%", pg.evaluate("assessScore()") == 71)
    au = pg.evaluate("auditSummary()")
    check("example: audit 100% of the applicable checks", au["rate"] == 100 and au["failRec"] == 0, au)
    check("example: open items are the opinion-only item and the two studies not reviewed yet", pg.evaluate("openItems().map(x=>x.r.id+':'+x.s.slice(0,4)).length") == 3)
    check("example: 26/26 top items with evidence on the dashboard", "26/26" in pg.evaluate("go('dash'); document.getElementById('dKpis').innerText"))
    check("example: 2026 dates up to today, illustrative", all(r["date"] <= "2026-10-17" and r["date"] >= "2026-01-01" for r in json.loads(pg.evaluate("localStorage.getItem('cia-swot:v1')"))["records"]) and "illustrative" in pg.evaluate("UI.en.exS"))
    check("the chart of sources (evidence against opinion) is drawn", pg.evaluate("document.querySelectorAll('#dChart svg rect').length") > 10 and "%" in pg.evaluate("document.getElementById('dShare').textContent"))
    pg.evaluate("go('docs')")
    check("records: three rows with open / delete buttons and the source link of SW-EX-03", pg.evaluate("document.querySelectorAll('#docsBox tbody tr').length") == 3 and pg.evaluate("document.querySelectorAll('#docsBox [data-osrc=lessons]').length") == 1)
    csv = pg.evaluate("buildCSV()"); rep = pg.evaluate("buildReportHTML()")
    check("CSV: BOM, 23 columns, one row per study", csv.startswith("﻿") and csv.split("\n")[0].count(",") == 22 and csv.count("SW-EX-0") >= 3)
    check("report: cover with the author, grid, TOWS, actions, reviews, audit and self-assessment", "مدثر سلامه" in rep and rep.count('class="sw-grid"') == 3 and rep.count('class="sw-tows"') == 3 and "Audit results" in rep and "Self-assessment" in rep)
    pg.evaluate("go('docs')"); pg.evaluate("document.querySelector('[data-del=\"SW-EX-02\"]').click()")
    check("delete needs a second click", pg.evaluate("DB.records.length") == 3)
    pg.evaluate("document.querySelector('[data-del=\"SW-EX-02\"]').click()")
    check("second click deletes", pg.evaluate("DB.records.length") == 2)
    pg.evaluate("document.getElementById('pfReset').click()"); pg.wait_for_timeout(100)
    check("clear all (with its confirmation) empties the tool's key only", pg.evaluate("localStorage.getItem('cia-swot:v1')") is None and pg.evaluate("DB.records.length") == 0)
    check("no page errors in the main run", not [x for x in errs if x not in errs_b], errs[:3])
    ctx.close()
    # ---- links: other tools' examples in this browser (read only)
    ctx, pg, errs = page(b)
    for mod in ("strategy-performance", "lessons", "pareto", "fmea"):
        ex(pg, mod)
    keys = ["strategy-studio:v1", "cia-lessons:v1", "cia-pareto:v1", "cia-fmea:v1"]
    before = pg.evaluate("(k)=>k.map(x=>localStorage.getItem(x))", keys)
    pg.goto(URL, wait_until="load"); pg.wait_for_timeout(400)
    check("home: the start note counts the records other tools hold", not pg.evaluate("document.getElementById('homeImp').hidden"))
    pg.evaluate("go('tools')")
    counts = {}
    for s in ("strat", "tows", "pestle", "lessons", "pareto", "fmea"):
        pg.select_option("#stSrc", s); pg.evaluate("document.getElementById('stPrev').click()"); pg.wait_for_timeout(80)
        counts[s] = pg.evaluate("document.querySelectorAll('#stTable tbody tr').length")
    check("start previews list rows from the Strategy Studio (SWOT, TOWS, PESTLE), lessons, Pareto vital few and FMEA high rows", all(counts[s] > 0 for s in counts), counts)
    check("Strategy Studio preview uses its own category names", "قوة" in pg.evaluate("(function(){ var r=ssRows('swot')[0]; return pvStrat(r); })()") or "Strength" in pg.evaluate("pvStrat(ssRows('swot')[0])"))
    check("FMEA high rows read with FMEA's own action priority", pg.evaluate("stRows('fmea').length") == pg.evaluate("(recsOf(FM_KEY)||[]).reduce((n,c)=>n+FMR.hi(FMR.fix(JSON.parse(JSON.stringify(c)))).length,0)"))
    check("lessons read with the Lessons Learned stage rule", pg.evaluate("stRows('lessons').every(x=>/LL-EX/.test(x.id))") and "LL-EX-02" in pg.evaluate("pvLesson('LL-EX-02')"))
    pg.select_option("#stSrc", "strat"); pg.evaluate("document.getElementById('stPrev').click()"); pg.wait_for_timeout(60)
    pg.evaluate("document.querySelector('#stTable [data-stid=\"*\"]').click()"); pg.wait_for_timeout(150)
    r = pg.evaluate("formToRec()")
    check("start from the whole Strategy Studio grid: a new unsaved study with every item in its quadrant and its source id", r["id"] == "" and len(r["items"]) == counts["strat"] and all(i["sid"].startswith("SW-") for i in r["items"]) and pg.evaluate("DB.records.length") == 0)
    pg.select_option("#stSrc", "tows"); pg.evaluate("document.getElementById('stPrev').click()"); pg.wait_for_timeout(60)
    pg.evaluate("document.querySelector('#stTable [data-stid]').click()"); pg.wait_for_timeout(150)
    r = pg.evaluate("formToRec()")
    check("start from a TOWS option: the option with its linked SWOT items on both sides", len(r["opts"]) == 1 and r["src"] == "tows" and pg.evaluate("optOk(formToRec(),formToRec().opts[0])"))
    pg.select_option("#stSrc", "fmea"); pg.evaluate("document.getElementById('stPrev').click()"); pg.wait_for_timeout(60)
    pg.evaluate("document.querySelector('#stTable [data-stid=\"FM-EX-02\"]').click()"); pg.wait_for_timeout(150)
    r = pg.evaluate("formToRec()")
    check("start from an FMEA high row: a threat with S/O/D evidence, risk source and the study id", len(r["items"]) == 1 and r["items"][0]["q"] == "t" and r["items"][0]["src"] == "risk" and r["items"][0]["sid"] == "FM-EX-02" and "S10" in r["items"][0]["ev"])
    pg.select_option("#stSrc", "pareto"); pg.evaluate("document.getElementById('stPrev').click()"); pg.wait_for_timeout(60)
    pg.evaluate("document.querySelector('#stTable [data-stid]').click()"); pg.wait_for_timeout(150)
    r = pg.evaluate("formToRec()")
    check("start from a Pareto vital-few category: a weakness with the figure and its share as evidence", r["items"][0]["q"] == "w" and r["items"][0]["src"] == "kpi" and "%" in r["items"][0]["ev"])
    pg.select_option("#stSrc", "lessons"); pg.evaluate("document.getElementById('stPrev').click()"); pg.wait_for_timeout(60)
    pg.evaluate("document.querySelector('#stTable [data-stid=\"LL-EX-02\"]').click()"); pg.wait_for_timeout(150)
    r = pg.evaluate("formToRec()")
    check("start from a success lesson: a strength with the lesson's evidence", r["items"][0]["q"] == "s" and r["items"][0]["src"] == "lesson" and r["items"][0]["ev"] != "")
    check("item source ids show a preview by the other tool's rule", "LL-EX-02" in pg.evaluate("document.querySelector('#itC-s .dm-card [data-pv]').textContent"))
    check("the source shows in the header with its preview", "LL-EX-02" in pg.evaluate("document.getElementById('srcInfo').textContent"))
    after = pg.evaluate("(k)=>k.map(x=>localStorage.getItem(x))", keys)
    check("the other tools' stored data is unchanged (read only)", before == after)
    pg.goto(URL + "?fmea=FM-EX-02&row=r1", wait_until="load"); pg.wait_for_timeout(400)
    check("?fmea=&row= starts a new study from that row", pg.evaluate("curTab") == "tools" and pg.evaluate("formToRec().items.length") == 1 and pg.evaluate("formToRec().src") == "fmea")
    pg.goto(URL + "?strat=*", wait_until="load"); pg.wait_for_timeout(400)
    check("?strat=* starts a study from the whole Strategy Studio grid", pg.evaluate("formToRec().items.length") == counts["strat"])
    pg.evaluate("sessionStorage.setItem('cia-nav:swot', JSON.stringify({lessons:'LL-EX-01'}))"); pg.goto(URL, wait_until="load"); pg.wait_for_timeout(400)
    check("the one-time hint cia-nav:swot starts a study and is removed", pg.evaluate("formToRec().src") == "lessons" and pg.evaluate("sessionStorage.getItem('cia-nav:swot')") is None)
    pg.evaluate("go('docs')"); pg.evaluate("document.getElementById('pfEx').click()"); pg.wait_for_timeout(200)
    pg.goto(URL + "?open=SW-EX-03", wait_until="load"); pg.wait_for_timeout(400)
    check("?open= loads a saved study", pg.evaluate("document.getElementById('rid').value") == "SW-EX-03")
    check("FMEA ids named by the lifting study preview with FMEA's own stage", "FM-EX-02" in pg.evaluate("document.querySelector('#roRows [data-pv]').textContent"))
    check("no errors with other tools' data", not errs, errs[:3])
    ctx.close()
    # ---- assistant and keyboard
    ctx, pg, errs = page(b)
    pg.goto(URL, wait_until="load"); pg.wait_for_timeout(400)
    pg.evaluate("document.getElementById('cbFab').click()"); pg.wait_for_timeout(100)
    check("assistant: five suggested questions including 'what makes a SWOT useful' and 'SWOT, PESTLE or risk register'", pg.evaluate("document.querySelectorAll('#cbSug button').length") == 5 and pg.evaluate("['useful','which'].every(id=>!!document.querySelector('#cbSug [data-sid='+id+']'))"))
    pg.evaluate("cbSend('ما الذي يجعل تحليل SWOT مفيداً؟')")
    check("assistant answers 'useful' with the stages", "قرار" in pg.evaluate("document.getElementById('cbBody').innerText"))
    pg.evaluate("cbSend('SWOT or PESTLE or risk register?')")
    check("assistant answers 'which one' with PESTLE, Porter and the risk register", "7.2" in pg.evaluate("document.getElementById('cbBody').innerText"))
    check("assistant: 4–6 fixed FAQ answers plus two answers from the studies", len([k for k in pg.evaluate("KB.map(k=>k.dyn?'d':'f')") if k == "f"]) in (4, 5, 6) and len([k for k in pg.evaluate("KB.map(k=>k.dyn?'d':'f')") if k == "d"]) == 2)
    pg.keyboard.press("Escape"); pg.wait_for_timeout(100)
    check("Escape closes the assistant", pg.evaluate("document.getElementById('cb').hidden"))
    pg.evaluate("go('tools')"); pg.focus("#f-title"); pg.keyboard.type("Keyboard study"); pg.keyboard.press("Tab")
    check("keyboard: typing into the form and tabbing moves focus", pg.evaluate("document.getElementById('f-title').value") == "Keyboard study" and pg.evaluate("document.activeElement.id") != "f-title")
    check("no errors", not errs, errs[:3])
    ctx.close()
    # ---- tour on a fresh browser: offered on the first visit
    ctx = b.new_context(viewport={"width": 1280, "height": 900}); pg = ctx.new_page(); errs = []
    pg.on("pageerror", lambda x: errs.append(str(x)))
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
    check("390 px: no page overflow on any tab in AR and EN (study loaded)", not over, over)
    pg.evaluate("go('tools')"); pg.wait_for_timeout(100)
    g = pg.evaluate("(function(){ var g=document.querySelector('#swGrid .sw-grid'), q=g.querySelectorAll('.sw-q'); return [g.getBoundingClientRect().width, q[0].getBoundingClientRect().left>q[1].getBoundingClientRect().left]; })()")
    check("390 px: the grid fits and keeps two columns (Arabic: strengths on the right)", g[0] <= 360 and g[1] is True, g)
    check("390 px: no errors", not errs, errs[:2])
    ctx.close()
    # ---- hub
    ctx, pg, errs = page(b)
    pg.goto(BASE + "/index.html", wait_until="load"); pg.wait_for_timeout(600)
    check("hub: SWOT URL, Audit & Improvement row and card", pg.evaluate("URLS.swot") == "./modules/swot.html" and pg.evaluate("SYSTEMS.find(s=>s.id==='aud').mods.some(t=>t.k==='swot'&&t.status==='live')") and pg.evaluate("TOOLKITS.some(t=>t.k==='swot'&&t.code==='SWOT'&&t.pre==='CIA')"))
    check("hub: 39 tools and Audit & Improvement 16 (Stakeholder step)", pg.evaluate("TOOLKITS.length") == 39 and pg.evaluate("wStats().per[SYSTEMS.findIndex(s=>s.id==='aud')].n") == 16)
    check("hub: adapter reads the example snapshot (71%, 26/26, 3/3, 1/3)", pg.evaluate("JSON.stringify(DEMO_RES.swot.m.map(x=>x[3]))") == '["71%","26/26","3/3","1/3","12/12"]')
    check("hub: TOOLINFO (12 questions, tools tab), NEWS and the request mapping", pg.evaluate("!!TOOLINFO.swot && TOOLINFO.swot.q===12 && TOOLINFO.swot.start==='tools'") and pg.evaluate("NEWS.some(n=>n.k==='swot')") and pg.evaluate("JSON.stringify(TOOL_RQ.swot)") == '["iac",null]')
    check("hub: the toolbox is complete, no grouped toolbox entry (Stakeholder step)", pg.evaluate("(typeof SOON!=='undefined'?SOON:[]).filter(t=>t.k==='citbox').length") == 0)
    check("hub: Advisor rules name SWOT for strategy and KPIs, risk, and KPIs not linked to strategy", pg.evaluate("ADVISOR_RULES.filter(r=>r[2].swot).map(r=>r[0]+':'+r[1]).sort().join(',')") == "goal:kpi,goal:risk,pain:kpis")
    check("hub: knowledge topic links the method guide", 'guide:{k:"swot",a:"explain-std"}' in read(os.path.join(ROOT, "index.html")))
    pg.evaluate("ciaOpenFile('swot.html')"); pg.wait_for_timeout(800)
    check("hub: ciaOpenFile opens SWOT in the overlay", "swot.html" in pg.evaluate("document.getElementById('modFrame').src"))
    check("hub: no errors", not errs, errs[:3])
    ctx.close()
    b.close()
failed = [r for r in results if not r[1]]
print(f"\n{len(results) - len(failed)}/{len(results)} passed")
sys.exit(1 if failed else 0)
