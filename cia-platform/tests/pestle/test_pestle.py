"""PESTLE tool (modules/pestle.html) — 2026-10-17. Same style as tests/swot/test_swot.py.
Covers: shared engine (thirteen files) and layer identity, AR/EN and RTL/LTR, tabs, the kit, self-assessment, the scan record (validation, the
computed stage scoped → team → items with sources → climate decided → ranked → outcomes → reviewed, the one-person flag, the outside-input rule,
the six factors and the "nothing relevant" reason, the source/date and generic flags, the climate decision, ranking by significance × certainty and
the top items, outcomes into SWOT and risks, actions with owner and date, the review), the board (mirrored for Arabic, 390 px), the matrix, the time
horizon and the chart, records, audit (10 checks), dashboard, report and CSV, persistence, example data, clear all, a record with missing parts, the
read-only starts from the Strategy Studio's PESTLE register and SWOT studies with previews by each tool's own rule (other tools only read), the
?open= / ?strat= / ?swot= requests and the hub hint, the assistant, the tour, keyboard, 390 px, the hub links, and the tools this step leaves
unchanged (byte-identical to the previous package when CIA_ORIG_DIR is set).
Served over http (CIA_BASE, default http://127.0.0.1:8802).   Usage: python3 tests/pestle/test_pestle.py"""
import os, sys, json, re
from playwright.sync_api import sync_playwright
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
MOD = os.path.join(ROOT, "modules")
BASE = os.environ.get("CIA_BASE", "http://127.0.0.1:8802")
URL = BASE + "/modules/pestle.html"
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
FILES = ["pdca", "capa", "five-whys", "fishbone", "pareto", "rca", "a3", "dmaic", "iso10009", "fmea", "lessons", "swot", "pestle"]
src = {f: read(os.path.join(MOD, f + ".html")) for f in FILES}
pe, tpl = src["pestle"], read(os.path.join(ROOT, "templates", "explain-kit-template.html"))
e = [engine(src[f]) for f in FILES]
check("engine block present once in the thirteen toolbox files", all(x is not None for x in e))
check("engine block identical in the thirteen files and to tests/build/engine.js", len(set(e)) == 1 and e[0] == read(os.path.join(ROOT, "tests", "build", "engine.js")).rstrip("\n"))
for tag, id_ in (("style", "cia-explain-kit-css"), ("script", "cia-explain-kit-js")):
    check(f"pestle.html {id_} byte-identical to the template", block(pe, tag, id_) == block(tpl, tag, id_))
norm = lambda x: re.sub(r"var CFG=\{.*?\};", "var CFG={};", x or "", count=1)
check("tour script identical to swot.html apart from CFG", norm(block(pe, "script", "cia-tour-js")) == norm(block(src["swot"], "script", "cia-tour-js")) and block(pe, "script", "cia-tour-js") != block(src["swot"], "script", "cia-tour-js"))
check("tour CSS identical to swot.html", block(pe, "style", "cia-tour-css") == block(src["swot"], "style", "cia-tour-css"))
check("tour CFG names pestle and guards the example", 'var CFG={"file": "pestle", "hasEx": true, "guard": {"pfEx": "all"}};' in pe)
i0 = pe.find("PESTLE tool — host logic")
check("storage key and schema documented at the top of the host script", 'STORE="cia-pestle:v1"' in pe and "Schema:" in pe[i0:i0 + 9000] and '"strategy-studio:v1"' in pe[i0:i0 + 9000] and '"cia-swot:v1"' in pe[i0:i0 + 9000])
host = pe[i0:pe.find("<!-- CIA guided tour")]; host = host.replace(engine(pe) or "", "")
check("the host writes only its own key (TBX.save/drop on STORE, language key only)", not re.search(r"TBX\.(save|drop)\((?!STORE)", host) and not re.search(r"localStorage\.(setItem|removeItem)\((?!LKEY)", host))
check("other tools' rules carried read-only: ssTKV, SSO (pestleF, pestleImp, tf), SWR", all(x in pe for x in ("var ssTKV=", "var SSO=(function(){", "pestleF:[[", "pestleImp:[[", "tf:[[", "var SWR=(function(){")))
check("no host function named after a browser global", not re.search(r"\bfunction (top|name|status|parent|self|open|close)\(", host))
data = block(pe, "script", "cia-explain-data")
check("Explain Kit data: EXPLAIN_PESTLE with meta.verified, 4.1, A.4.1, 4.2, 6.1.1–6.1.3, 9.3.2, 3.1.2, 3.7.2, 5.1, 5.2, 5.3, 7.2 and 'not verified'", data and "const EXPLAIN_PESTLE=" in data and '"verified"' in data and all(('"c": "%s"' % c) in data for c in ("4.1", "A.4.1", "4.2", "6.1.1", "6.1.2", "6.1.3", "9.3.2", "3.1.2", "3.7.2", "5.1", "5.2", "5.3", "7.2")) and "not verified" in data)
check("Explain Kit ui labels set", all(('"%s"' % k) in data for k in ("roles", "wheelT", "purpose", "smap", "assess", "assessOff", "offGo", "actCtx")))
check("every self-assessment question is reached from the kit", all(('"q": "%s"' % q) in data for q in ("IN1", "IN2", "IN3", "EV1", "EV2", "EV3", "OU1", "OU2", "OU3", "RV1", "RV2", "RV3")))
check("method guide says once that PESTLE is a technique, not a requirement", "PESTLE is a technique, not a requirement of any standard" in pe and "PESTLE أسلوب، وليس متطلباً في أي مواصفة" in pe)
check("author name on the page and the report", pe.count("مدثر سلامه") >= 5)
check("sidebar buttons carry data-go and data-t", all(('data-go="%s" data-t="%s"' % (t, t)) in pe for t in TABS))
OD = os.environ.get("CIA_ORIG_DIR")
if OD:
    same = [f for f in ("swot", "strategy-performance", "lessons", "fmea", "pareto", "iso31000-risk-studio") if read(os.path.join(MOD, f + ".html")) == read(os.path.join(OD, "modules", f + ".html"))]
    check("SWOT, Strategy Studio, Lessons, FMEA, Pareto and the Risk Studio unchanged (byte-identical to the previous package)", len(same) == 6, same)

FREEZE = """(function(){ var T=Date.UTC(2026,9,17,9,0,0), OD=Date;
 function FD(){ if(!(this instanceof FD)) return new OD(T).toString(); var a=[].slice.call(arguments);
   return a.length? new (Function.prototype.bind.apply(OD,[null].concat(a)))() : new OD(T); }
 FD.now=function(){ return T; }; FD.UTC=OD.UTC; FD.parse=OD.parse; FD.prototype=OD.prototype; window.Date=FD;
 try{ if(!sessionStorage.getItem('f0')){ sessionStorage.setItem('f0','1'); localStorage.clear(); localStorage.setItem('cia-lang','ar');
   ['pestle','swot','strategy-performance'].forEach(function(k){ localStorage.setItem('cia-tour:m:'+k,'done'); }); } }catch(e){} })();"""


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
    check("home: code badge, author, launch tiles and the related-tools strip", "PESTLE" in pg.evaluate("document.querySelector('.std-code').textContent") and "مدثر سلامه" in pg.evaluate("document.querySelector('.author').textContent") and pg.evaluate("document.querySelectorAll('#launchGrid a').length") == 9 and pg.evaluate("document.querySelectorAll('#homeStd a.hs').length") == 10)
    check("AI tab is a placeholder labelled under construction", "قيد الإنشاء" in pg.evaluate("document.querySelector('[data-tab=ai]').innerText"))
    for lang in ("ar", "en"):
        for t in TABS:
            pg.evaluate(f"go('{t}')"); pg.wait_for_timeout(60)
            tx = pg.evaluate(f"document.querySelector('.tabpane[data-tab=\"{t}\"]').innerText")
            if any(w in tx for w in BAD) or len(tx.strip()) < 40:
                check(f"{lang}:{t} renders text with no undefined/NaN", False, tx[:200])
        if lang == "ar": pg.evaluate("switchLang()")
    check("every tab renders in AR and EN with no undefined/NaN/[object Object]", not [r for r in results if r[0].startswith(("ar:", "en:")) and not r[1]])
    check("English switches to LTR and the title", pg.evaluate("document.documentElement.dir") == "ltr" and "PESTLE" in pg.evaluate("document.title"))
    pg.evaluate("switchLang()")
    pg.evaluate("go('explain-cl')"); pg.wait_for_timeout(300)
    check("clause guide renders the sections", pg.evaluate("document.querySelectorAll('#ex-cl-box [data-ex-sec], #ex-cl-box .ex-sec, #ex-cl-box section').length") >= 5)
    pg.evaluate("go('explain-std')"); pg.wait_for_timeout(300)
    check("method guide shows the term box and the kit", "PESTLE" in pg.evaluate("document.getElementById('peTerm').innerText") and len(pg.evaluate("document.getElementById('ex-std-box').innerText")) > 400)
    pg.evaluate("go('assess')"); pg.wait_for_timeout(100)
    check("12 questions in 4 groups on a 0–2 scale", pg.evaluate("document.querySelectorAll('#asList .ex-aq').length") == 12 and pg.evaluate("document.querySelectorAll('#asList input[type=radio]').length") == 36)
    pg.evaluate("document.getElementById('as-IN1-2').click()"); pg.wait_for_timeout(100)
    check("an answer is saved under cia-pestle:v1 and scored", json.loads(pg.evaluate("localStorage.getItem('cia-pestle:v1')"))["assess"] == {"IN1": 2} and pg.evaluate("assessScore()") == 8)
    pg.evaluate("document.getElementById('asReset').click()")
    # ---- the scan form: stages one by one
    pg.evaluate("go('tools')"); pg.wait_for_timeout(150)
    R = lambda: pg.evaluate("stageOf(formToRec())")
    check("an empty scan is a draft", R() == "draft")
    pg.evaluate("document.getElementById('saveBtn').click()")
    check("saving with no title is refused", pg.evaluate("document.getElementById('recErr').textContent") != "" and pg.evaluate("DB.records.length") == 0)
    def setf(k, v):
        pg.evaluate("([k,v])=>{ var e=document.getElementById('f-'+k); e.value=v; e.dispatchEvent(new Event('input',{bubbles:true})); e.dispatchEvent(new Event('change',{bubbles:true})); }", [k, v])
    for k, v in (("title", "Test scan"), ("ref", "T-1"), ("scope", "market"), ("level", "regional"), ("decision", "Decide X"), ("date", "2026-10-01"), ("facil", "QM")):
        setf(k, v)
    check("title, reference, scope, level, decision, date and facilitator → scoped", R() == "scoped")
    def member(n, role, ext):
        pg.evaluate("document.querySelector('[data-add=\"tm\"]').click()")
        pg.evaluate("""([n,r,x])=>{ var t=[...document.querySelectorAll('#tmRows tr')].pop(); t.querySelector('[data-k=n]').value=n; t.querySelector('[data-k=role]').value=r; t.querySelector('[data-k=ext]').value=x; t.dispatchEvent(new Event('change',{bubbles:true})); }""", [n, role, ext])
    member("A", "Ops", "no")
    def item(g, t, so, d, eff, sig, cer, hz):
        pg.evaluate(f"document.querySelector('[data-add=\"fa:{g}\"]').click()")
        pg.evaluate("""([g,t,so,d,e,s,c,h])=>{ var c0=[...document.querySelectorAll('#faC-'+g+' .dm-card')].pop(); var set=(k,v)=>{ c0.querySelector('[data-k='+k+']').value=v; };
          set('t',t); set('so',so); set('d',d); set('eff',e); set('sig',s?String(s):''); set('cer',c?String(c):''); set('hz',h); c0.dispatchEvent(new Event('change',{bubbles:true})); }""", [g, t, so, d, eff, sig, cer, hz])
    item("p", "The economy is uncertain", "", "", "t", 4, 4, "s")
    check("one person with an item: the one-person flag", "solo" in pg.evaluate("issues(formToRec()).map(x=>x[0])") and not pg.evaluate("document.getElementById('tmWarn').hidden"))
    member("B", "Finance", "no"); member("C", "Supplier rep", "supplier")
    check("three roles with an outside input → team complete", R() == "team")
    check("a generic, unsourced item is flagged (generic and no source)", pg.evaluate("genOf(formToRec().fac[0])") and "src" in pg.evaluate("issues(formToRec()).map(x=>x[0])") and pg.evaluate("document.querySelector('#faC-p .dm-card [data-flag]').textContent") != "")
    check("five factors not looked at are flagged", pg.evaluate("notConsidered(formToRec()).length") == 5 and not pg.evaluate("document.getElementById('faW-e').hidden"))
    pg.evaluate("()=>{ var c=document.querySelector('#faC-p .dm-card'); c.querySelector('[data-k=t]').value='Public programme: 4 hospitals planned to 2028'; c.querySelector('[data-k=so]').value='Programme notice'; c.querySelector('[data-k=d]').value='2026-06-01'; c.querySelector('[data-k=eff]').value='o'; c.dispatchEvent(new Event('change',{bubbles:true})); }")
    for g, t in (("e", "Rebar up 12% in six months"), ("s", "4 of 9 riggers available"), ("t", "Retrofit quotation Q-311 for 2 cranes"), ("l", "Inspection every 6 months from 2027")):
        item(g, t, "Source " + g, "2026-09-0" + str(len(g)), "t", 3, 3, "m")
    check("an empty factor with no reason keeps the scan at 'team'", R() == "team")
    pg.evaluate("()=>{ var i=document.getElementById('g-en-nr'); i.value='No environmental condition for this market'; i.dispatchEvent(new Event('input',{bubbles:true})); }")
    check("the 'nothing relevant' reason counts as looked at → items with sources", R() == "sourced")
    setf("clDec", "rel")
    check("a climate decision with no reason is not enough", R() == "sourced" and not pg.evaluate("document.getElementById('clWarn').hidden"))
    setf("clWhy", "Heat stress on site")
    check("climate decided with its reason → past 'climate' (the items are already rated, so ranked)", pg.evaluate("climOk(formToRec())") and R() == "ranked")
    check("ranking: score = significance × certainty, top items are the six highest of 6 or more", pg.evaluate("topList(formToRec()).map(f=>score(f))") == [16, 9, 9, 9, 9] and R() == "ranked")
    check("the board shows the six factors, the matrix 25 cells, the timeline 3 columns, the chart drawn", pg.evaluate("document.querySelectorAll('#peBoard .pe-g').length") == 6 and pg.evaluate("document.querySelectorAll('#peMx td').length") == 25 and pg.evaluate("document.querySelectorAll('#peTl section').length") == 3 and pg.evaluate("document.querySelectorAll('#peChart svg rect').length") > 7)
    pg.evaluate("()=>{ var c=document.querySelector('#faC-l .dm-card'); c.querySelector('[data-k=cer]').value=''; c.dispatchEvent(new Event('change',{bubbles:true})); }")
    check("an item not rated keeps the scan at 'climate'", R() == "climate")
    pg.evaluate("()=>{ var c=document.querySelector('#faC-l .dm-card'); c.querySelector('[data-k=cer]').value='3'; c.dispatchEvent(new Event('change',{bubbles:true})); }")
    pg.evaluate("document.getElementById('ouAuto').click()"); pg.wait_for_timeout(80)
    check("'add an outcome for each top item' adds five rows, not yet complete", pg.evaluate("document.querySelectorAll('#ouRows tr').length") == 5 and R() == "ranked")
    pg.evaluate("""()=>{ var T=[...document.querySelectorAll('#ouRows tr')]; var set=(tr,k,v)=>{ tr.querySelector('[data-k='+k+']').value=v; };
      set(T[0],'to','swot'); set(T[0],'q','o'); set(T[0],'ref','SW-NONE');
      set(T[1],'to','reg'); set(T[1],'ref','RR-1'); set(T[2],'to','plan'); set(T[2],'what','6.1 entry');
      set(T[3],'to','iso31000'); set(T[3],'what','Rigger shortage'); set(T[4],'to','aside'); T[4].dispatchEvent(new Event('change',{bubbles:true})); }"""); pg.wait_for_timeout(60)
    check("an outcome set aside with no reason leaves one top item uncovered", pg.evaluate("uncov(formToRec()).length") == 1 and not pg.evaluate("document.getElementById('ouWarn').hidden"))
    check("a SWOT outcome with an unknown study says so (read-only preview)", "SWOT" in pg.evaluate("document.querySelector('#ouRows [data-pv]').textContent"))
    pg.evaluate("()=>{ var tr=[...document.querySelectorAll('#ouRows tr')][4]; tr.querySelector('[data-k=why]').value='Within contingency'; tr.dispatchEvent(new Event('change',{bubbles:true})); }")
    check("every top item has an outcome → outcomes", R() == "outcomes")
    pg.evaluate("document.querySelector('[data-add=\"ac\"]').click()"); pg.wait_for_timeout(40)
    pg.evaluate("()=>{ var c=document.querySelector('#acCards .dm-card'); c.querySelector('[data-k=what]').value='Book inspection'; c.dispatchEvent(new Event('change',{bubbles:true})); }")
    check("an action with no owner or date keeps the scan at 'ranked'", R() == "ranked" and not pg.evaluate("document.getElementById('acWarn').hidden"))
    pg.evaluate("()=>{ var c=document.querySelector('#acCards .dm-card'); c.querySelector('[data-k=who]').value='HSE'; c.querySelector('[data-k=by]').value='2026-12-01'; c.dispatchEvent(new Event('change',{bubbles:true})); }")
    setf("revBy", "2027-01-01"); setf("trig", "A new circular")
    pg.evaluate("document.querySelector('[data-add=\"rv\"]').click()")
    pg.evaluate("""()=>{ var tr=document.querySelector('#rvRows tr'); tr.querySelector('[data-k=date]').value='2026-09-01'; tr.querySelector('[data-k=chg]').value='Price changed'; tr.dispatchEvent(new Event('change',{bubbles:true})); }"""); pg.wait_for_timeout(50)
    pg.evaluate("document.getElementById('saveBtn').click()")
    check("a review dated before the scan is refused on save", pg.evaluate("document.getElementById('recErr').textContent") != "" and pg.evaluate("DB.records.length") == 0)
    pg.evaluate("()=>{ var tr=document.querySelector('#rvRows tr'); tr.querySelector('[data-k=date]').value='2026-10-10'; tr.dispatchEvent(new Event('change',{bubbles:true})); }")
    check("a review after the scan with what changed, and a next date → reviewed", R() == "reviewed")
    pg.evaluate("document.getElementById('saveBtn').click()"); pg.wait_for_timeout(100)
    st = json.loads(pg.evaluate("localStorage.getItem('cia-pestle:v1')"))
    check("saved under PE-2026-001 with every part", [r["id"] for r in st["records"]] == ["PE-2026-001"] and len(st["records"][0]["fac"]) == 5 and len(st["records"][0]["outs"]) == 5 and st["records"][0]["clim"]["dec"] == "rel")
    a = pg.evaluate("auditRecord(DB.records[0])")
    check("audit: the reviewed scan passes all ten checks", list(a.keys()) == ["ref", "team", "groups", "src", "gen", "clim", "rank", "outs", "acts", "review"] and all(v is True for v in a.values()), a)
    pg.evaluate("document.getElementById('grAdd').click()"); pg.wait_for_timeout(60)
    check("a factor can be added for the context (names adjustable)", pg.evaluate("document.querySelectorAll('#gBoxes .pe-gbox').length") == 7 and pg.evaluate("!!document.getElementById('g-x1-n')"))
    pg.reload(wait_until="load"); pg.wait_for_timeout(400)
    check("persistence: the scan is there after a reload", pg.evaluate("DB.records.length") == 1 and pg.evaluate("stageOf(DB.records[0])") == "reviewed")
    pg.evaluate("""localStorage.setItem('cia-pestle:v1', JSON.stringify({records:[{id:'X',title:'Broken',fac:[{g:'zz',t:5,sig:'9'},null,'x'],outs:[{to:'qq',f:'nope'}],grp:'bad',clim:3,team:'no',revs:[{date:3}]}],assess:'x'}))"""); pg.reload(wait_until="load"); pg.wait_for_timeout(400)
    errs_b = list(errs)
    for t in TABS: pg.evaluate(f"go('{t}')")
    pg.evaluate("loadRecordIntoForm(DB.records[0]); go('tools')"); pg.wait_for_timeout(150)
    check("a record with missing or broken parts renders on every tab without errors", not errs and pg.evaluate("stageOf(DB.records[0])") == "draft", errs[:3])
    # ---- example
    pg.evaluate("go('docs')"); pg.evaluate("document.getElementById('pfEx').click()"); pg.wait_for_timeout(300)
    check("example: three scans PE-EX-01…03 with stages reviewed / outcomes / outcomes", pg.evaluate("DB.records.map(r=>r.id+':'+stageOf(r)).join(',')") == "PE-EX-01:reviewed,PE-EX-02:outcomes,PE-EX-03:outcomes")
    check("example: self-assessment 75%", pg.evaluate("assessScore()") == 75)
    au = pg.evaluate("auditSummary()")
    check("example: audit 100% of the applicable checks", au["rate"] == 100 and au["failRec"] == 0, au)
    check("example: climate decided relevant in PE-EX-01, not relevant (with a reason) in PE-EX-02", pg.evaluate("DB.records.map(r=>r.clim.dec).join(',')") == "rel,not,rel")
    check("example: PE-EX-01 outcomes go to SW-EX-01 as opportunity and threat; PE-EX-02 to SW-EX-02 and the bid risk plan", pg.evaluate("DB.records[0].outs.filter(o=>o.ref==='SW-EX-01').map(o=>o.q).sort().join('')") == "oot" and pg.evaluate("DB.records[1].outs.some(o=>o.ref==='SW-EX-02')&&DB.records[1].outs.some(o=>o.to==='plan')"))
    check("example: 17/17 top items with a source and an outcome on the dashboard", "17/17" in pg.evaluate("go('dash'); document.getElementById('dKpis').innerText"))
    check("example: 2026 dates up to today, illustrative", all("2026-01-01" <= r["date"] <= "2026-10-17" for r in json.loads(pg.evaluate("localStorage.getItem('cia-pestle:v1')"))["records"]) and "illustrative" in pg.evaluate("UI.en.exS"))
    check("example: open items are the two scans not reviewed yet", pg.evaluate("openItems().length") == 2)
    csv = pg.evaluate("buildCSV()"); rep = pg.evaluate("buildReportHTML()")
    check("CSV: BOM, 29 columns, one row per scan", csv.startswith("﻿") and csv.split("\n")[0].count(",") == 28 and csv.count("PE-EX-0") >= 3)
    check("report: cover with the author, board, matrix, outcomes, audit and self-assessment", "مدثر سلامه" in rep and rep.count('class="pe-board"') == 3 and rep.count('class="pe-mx"') == 3 and "Audit results" in rep and "Self-assessment" in rep)
    pg.evaluate("go('docs')"); pg.evaluate("document.querySelector('[data-del=\"PE-EX-02\"]').click()")
    check("delete needs a second click", pg.evaluate("DB.records.length") == 3)
    pg.evaluate("document.querySelector('[data-del=\"PE-EX-02\"]').click()")
    check("second click deletes", pg.evaluate("DB.records.length") == 2)
    pg.evaluate("document.getElementById('pfReset').click()"); pg.wait_for_timeout(100)
    check("clear all (with its confirmation) empties the tool's key only", pg.evaluate("localStorage.getItem('cia-pestle:v1')") is None and pg.evaluate("DB.records.length") == 0)
    check("no page errors in the main run", not [x for x in errs if x not in errs_b], errs[:3])
    ctx.close()
    # ---- links: the Strategy Studio and SWOT examples in this browser (read only)
    ctx, pg, errs = page(b)
    for mod in ("strategy-performance", "swot"):
        ex(pg, mod)
    keys = ["strategy-studio:v1", "cia-swot:v1"]
    before = pg.evaluate("(k)=>k.map(x=>localStorage.getItem(x))", keys)
    pg.goto(URL, wait_until="load"); pg.wait_for_timeout(400)
    check("home: the start note counts the items other tools hold", not pg.evaluate("document.getElementById('homeImp').hidden"))
    pg.evaluate("go('tools')")
    counts = {}
    for s in ("strat", "swot"):
        pg.select_option("#stSrc", s); pg.evaluate("document.getElementById('stPrev').click()"); pg.wait_for_timeout(80)
        counts[s] = pg.evaluate("document.querySelectorAll('#stTable tbody tr').length")
    check("start previews list the Studio's PESTLE register (6) and SWOT items from PESTLE (3)", counts == {"strat": 6, "swot": 3}, counts)
    check("Studio preview uses its own factor and effect names", "اقتصادي" in pg.evaluate("pvPestle(ssRows()[1])") and "تهديد" in pg.evaluate("pvPestle(ssRows()[1])"))
    check("SWOT read with its own stage rule", pg.evaluate("SWR.stage(swRec('SW-EX-01'))") == "reviewed" and "SW-EX-01" in pg.evaluate("pvSwStudy('SW-EX-01')"))
    pg.select_option("#stSrc", "strat"); pg.evaluate("document.getElementById('stPrev').click()"); pg.wait_for_timeout(60)
    pg.evaluate("document.querySelector('#stTable [data-stid=\"*\"]').click()"); pg.wait_for_timeout(150)
    r = pg.evaluate("formToRec()")
    check("start from the whole register: a new unsaved scan with every factor in its group, its id, no source yet", r["id"] == "" and len(r["fac"]) == 6 and all(f["sid"].startswith("PE-") for f in r["fac"]) and [f["g"] for f in r["fac"]] == ["p", "e", "s", "t", "l", "en"] and pg.evaluate("DB.records.length") == 0)
    check("the Studio's generic wording is flagged (the scan needs specifics)", pg.evaluate("formToRec().fac.filter(genOf).length") >= 1 and pg.evaluate("formToRec().fac.every(f=>!srcOk(f))"))
    check("item source ids show a preview by the Studio's rule", "PE-01" in pg.evaluate("document.querySelector('#faC-p .dm-card [data-pv]').textContent"))
    pg.select_option("#stSrc", "swot"); pg.evaluate("document.getElementById('stPrev').click()"); pg.wait_for_timeout(60)
    pg.evaluate("document.querySelector('#stTable [data-stid=\"SW-EX-01\"][data-stx=\"\"]').click()"); pg.wait_for_timeout(150)
    r = pg.evaluate("formToRec()")
    check("start from a SWOT study: its PESTLE items become items with their evidence, source, date and factor", r["src"] == "swot" and len(r["fac"]) == 2 and sorted(f["g"] for f in r["fac"]) == ["en", "l"] and all(f["so"] and f["d"] for f in r["fac"]) and r["fac"][0]["sid"].startswith("SW-EX-01/"))
    check("the source shows in the header with its preview", "SW-EX-01" in pg.evaluate("document.getElementById('srcInfo').textContent"))
    after = pg.evaluate("(k)=>k.map(x=>localStorage.getItem(x))", keys)
    check("the other tools' stored data is unchanged (read only)", before == after)
    pg.goto(URL + "?swot=SW-EX-02&item=i9", wait_until="load"); pg.wait_for_timeout(400)
    check("?swot=&item= starts a new scan from that item", pg.evaluate("curTab") == "tools" and pg.evaluate("formToRec().fac.length") == 1 and pg.evaluate("formToRec().fac[0].g") == "e")
    pg.goto(URL + "?strat=*", wait_until="load"); pg.wait_for_timeout(400)
    check("?strat=* starts a scan from the whole register", pg.evaluate("formToRec().fac.length") == 6)
    pg.evaluate("sessionStorage.setItem('cia-nav:pestle', JSON.stringify({strat:'PE-03'}))"); pg.goto(URL, wait_until="load"); pg.wait_for_timeout(400)
    check("the one-time hint cia-nav:pestle starts a scan and is removed", pg.evaluate("formToRec().src") == "strat" and pg.evaluate("formToRec().fac[0].g") == "s" and pg.evaluate("sessionStorage.getItem('cia-nav:pestle')") is None)
    pg.evaluate("go('docs')"); pg.evaluate("document.getElementById('pfEx').click()"); pg.wait_for_timeout(200)
    pg.goto(URL + "?open=PE-EX-01", wait_until="load"); pg.wait_for_timeout(400)
    check("?open= loads a saved scan", pg.evaluate("document.getElementById('rid').value") == "PE-EX-01")
    check("SWOT outcomes preview SW-EX-01 with SWOT's own stage", "SW-EX-01" in pg.evaluate("document.querySelector('#ouRows [data-pv]').textContent") and "روجعت" in pg.evaluate("document.querySelector('#ouRows [data-pv]').textContent"))
    check("no errors with other tools' data", not errs, errs[:3])
    ctx.close()
    # ---- assistant and keyboard
    ctx, pg, errs = page(b)
    pg.goto(URL, wait_until="load"); pg.wait_for_timeout(400)
    pg.evaluate("document.getElementById('cbFab').click()"); pg.wait_for_timeout(100)
    check("assistant: five suggested questions including 'useful' and 'PESTLE, SWOT or Porter'", pg.evaluate("document.querySelectorAll('#cbSug button').length") == 5 and pg.evaluate("['useful','which'].every(id=>!!document.querySelector('#cbSug [data-sid='+id+']'))"))
    pg.evaluate("cbSend('ما الذي يجعل تحليل PESTLE مفيداً؟')")
    check("assistant answers 'useful' with the stages", "مصدر" in pg.evaluate("document.getElementById('cbBody').innerText"))
    pg.evaluate("cbSend('PESTLE, SWOT or Porter - which one?')")
    check("assistant answers 'which one' with 5.1, 5.3 and 7.2", "7.2" in pg.evaluate("document.getElementById('cbBody').innerText"))
    k = pg.evaluate("KB.map(k=>k.dyn?'d':'f')")
    check("assistant: 4–6 fixed FAQ answers plus two answers from the scans", k.count("f") in (4, 5, 6) and k.count("d") == 2)
    pg.keyboard.press("Escape"); pg.wait_for_timeout(100)
    check("Escape closes the assistant", pg.evaluate("document.getElementById('cb').hidden"))
    pg.evaluate("go('tools')"); pg.focus("#f-title"); pg.keyboard.type("Keyboard scan"); pg.keyboard.press("Tab")
    check("keyboard: typing into the form and tabbing moves focus", pg.evaluate("document.getElementById('f-title').value") == "Keyboard scan" and pg.evaluate("document.activeElement.id") != "f-title")
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
    check("390 px: no page overflow on any tab in AR and EN (scan loaded)", not over, over)
    pg.evaluate("go('tools')"); pg.wait_for_timeout(100)
    g = pg.evaluate("(function(){ var g=document.querySelector('#peBoard .pe-board'), q=g.querySelectorAll('.pe-g'); return [g.getBoundingClientRect().width, q[0].getBoundingClientRect().left>q[1].getBoundingClientRect().left]; })()")
    check("390 px: the board fits in two columns (Arabic: political on the right)", g[0] <= 360 and g[1] is True, g)
    check("390 px: no errors", not errs, errs[:2])
    ctx.close()
    # ---- hub
    ctx, pg, errs = page(b)
    pg.goto(BASE + "/index.html", wait_until="load"); pg.wait_for_timeout(600)
    check("hub: PESTLE URL, Audit & Improvement row and card", pg.evaluate("URLS.pestle") == "./modules/pestle.html" and pg.evaluate("SYSTEMS.find(s=>s.id==='aud').mods.some(t=>t.k==='pestle'&&t.status==='live')") and pg.evaluate("TOOLKITS.some(t=>t.k==='pestle'&&t.code==='PESTLE'&&t.pre==='CIA')"))
    check("hub: 39 tools and Audit & Improvement 16 (Stakeholder step)", pg.evaluate("TOOLKITS.length") == 39 and pg.evaluate("wStats().per[SYSTEMS.findIndex(s=>s.id==='aud')].n") == 16)
    check("hub: adapter reads the example snapshot (75%, 17/17, 17/17, 1/3)", pg.evaluate("JSON.stringify(DEMO_RES.pestle.m.map(x=>x[3]))") == '["75%","17/17","17/17","1/3","12/12"]')
    check("hub: TOOLINFO (12 questions, tools tab), NEWS and the request mapping", pg.evaluate("!!TOOLINFO.pestle && TOOLINFO.pestle.q===12 && TOOLINFO.pestle.start==='tools'") and pg.evaluate("NEWS.some(n=>n.k==='pestle')") and pg.evaluate("JSON.stringify(TOOL_RQ.pestle)") == '["iac",null]')
    check("hub: the toolbox is complete, no grouped toolbox entry (Stakeholder step)", pg.evaluate("(typeof SOON!=='undefined'?SOON:[]).filter(t=>t.k==='citbox').length") == 0)
    check("hub: Advisor rules name PESTLE for strategy and KPIs, and risk", pg.evaluate("ADVISOR_RULES.filter(r=>r[2].pestle).map(r=>r[0]+':'+r[1]).sort().join(',')") == "goal:kpi,goal:risk")
    check("hub: knowledge topic links the method guide", 'guide:{k:"pestle",a:"explain-std"}' in read(os.path.join(ROOT, "index.html")))
    pg.evaluate("ciaOpenFile('pestle.html')"); pg.wait_for_timeout(800)
    check("hub: ciaOpenFile opens PESTLE in the overlay", "pestle.html" in pg.evaluate("document.getElementById('modFrame').src"))
    check("hub: no errors", not errs, errs[:3])
    ctx.close()
    b.close()
failed = [r for r in results if not r[1]]
print(f"\n{len(results) - len(failed)}/{len(results)} passed")
sys.exit(1 if failed else 0)
