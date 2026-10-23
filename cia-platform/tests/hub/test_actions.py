"""Follow-up register (#actions) — step 15, 2026-10-22. Serve the platform over http first (CIA_BASE, default http://127.0.0.1:8802).
Covers, with every tool's example data loaded: the register's counts equal each tool's own open items (the nine ISO toolkits: their own action
plan (buildPlan) and checklist verdicts; CAPA: its records not closed (stageOf); the toolbox tools: the dashboard adapter's open-item counts, which
the register adds up record by record); filters (system, tool, type, overdue, search); every tool's first row opens its record in its tool;
AR/EN at 1280 and 390 without errors, undefined/NaN or overflow; empty state with no data. Usage: python3 tests/hub/test_actions.py"""
import os, sys, json
sys.path.insert(0, os.path.dirname(__file__))
from hubkit import *  # noqa

ISO = {"iso9001": "iso9001", "iso14001": "iso14001", "iso45001": "iso45001", "iso27001": "iso27001", "iso22301": "iso22301", "iso37301": "iso37301",
       "iso37001": "iso37001", "iso31000": "iso31000-risk-studio", "iso37000": "iso37000-governance"}
with sync_playwright() as p:
    b = launch(p)
    EX = examples(b)
    # with checklist verdicts in two ISO toolkits, so that NCR/OFI rows exist
    S = json.loads(EX["iso9001tk:v1"]); S["check"]["st"] = {"4.1": "C", "7.5.3": "M", "8.4.1": "m", "9.2.2": "O"}; EX["iso9001tk:v1"] = json.dumps(S)
    S = json.loads(EX["iso45001tk:v1"]); S["check"]["st"] = {"6.1.2": "m", "8.1.2": "M"}; EX["iso45001tk:v1"] = json.dumps(S)
    # ---- the tools' own counts, read inside each tool
    own = {}
    for k, f in ISO.items():
        ctx, pg, errs = new_page(b, "ar", 1280, 900, tour_done=[f], extra_init=FREEZE + "try{ if(!sessionStorage.getItem('s')){ sessionStorage.setItem('s','1'); var S=%s; for(var k in S) localStorage.setItem(k,S[k]); } }catch(e){}" % json.dumps(EX))
        pg.goto(f"{BASE}/modules/{f}.html", wait_until="load"); pg.wait_for_timeout(350)
        own[k] = pg.evaluate("()=>({plan:buildPlan().acts.length, ck:Object.values(ST.check.st||{}).filter(v=>v==='M'||v==='m'||v==='O').length})"); ctx.close()
    ctx, pg, errs = new_page(b, "ar", 1280, 900, tour_done=["capa"], extra_init=FREEZE + "try{ if(!sessionStorage.getItem('s')){ sessionStorage.setItem('s','1'); var S=%s; for(var k in S) localStorage.setItem(k,S[k]); } }catch(e){}" % json.dumps(EX))
    pg.goto(f"{BASE}/modules/capa.html", wait_until="load"); pg.wait_for_timeout(350)
    own["capa"] = pg.evaluate("DB.records.filter(r=>stageOf(r)!=='closed').length"); ctx.close()

    ctx, pg, errs = hub(b, "ar", 1280, seed=EX, hash_="#actions")
    I = pg.evaluate("acAll().map(x=>({t:x.t,kind:x.kind,id:x.id,late:x.late,n:x.flagN||0,dom:!!x.dom,plan:x.plan}))")
    for k in ISO:
        g = sum(1 for x in I if x["t"] == k and x["kind"] == "gap"); c = sum(1 for x in I if x["t"] == k and x["kind"] in ("ncr", "ofi"))
        check(f"{k}: the register lists the tool's own action plan ({own[k]['plan']}) and checklist findings ({own[k]['ck']})", g == own[k]["plan"] and c == own[k]["ck"], (g, c, own[k]))
    check(f"capa: the register lists every CAPA record not closed by the tool's own stage rule ({own['capa']})", sum(1 for x in I if x["t"] == "capa" and x["kind"] == "capa") == own["capa"])
    TB = ["capa", "why5", "fish", "pareto", "rca", "a3", "dmaic", "iso10009", "fmea", "lessons", "swot", "pestle", "stakeholders"]
    dash = pg.evaluate("(T)=>Object.fromEntries(T.map(k=>{ const r=CIADASH.evalAll()[k]; return [k, r.bd? r.bd.items.reduce((a,x)=>a+(parseInt(x.t,10)||0),0) : 0]; }))", TB)
    for k in TB:
        n = sum(x["n"] for x in I if x["t"] == k and x["kind"] == "flag")
        check(f"{k}: the register's follow-up flags add up to the dashboard's open-item count ({dash[k]})", n == dash[k], (n, dash[k]))
    rd = pg.evaluate("Object.fromEntries(Object.entries(CIAR.all()).map(([k,v])=>[k,v.length]))")
    bad = [k for k in rd if sum(1 for x in I if x["t"] == k and x["kind"] != "flag" and not x["dom"]) != rd[k]]
    check("every tool: the register holds exactly the items its reader returns", not bad, bad)
    rows = pg.evaluate("document.querySelectorAll('#acBody tbody tr').length"); tot = len(I)
    check("the register shows the first 80 rows and a 'show more' button", rows == min(80, tot) and (tot <= 80 or pg.evaluate("!!document.getElementById('acMore')")), (rows, tot))
    check("the counters equal the items", str(tot) in pg.evaluate("document.getElementById('acStats').innerText") and str(sum(1 for x in I if x["late"])) in pg.evaluate("document.getElementById('acStats').innerText"))
    pg.check("#acLate"); pg.wait_for_timeout(200)
    check("filter: overdue only", pg.evaluate("document.querySelectorAll('#acBody tbody tr').length") == sum(1 for x in I if x["late"]) and pg.evaluate("[...document.querySelectorAll('#acBody tbody tr')].every(r=>r.classList.contains('late'))"))
    pg.uncheck("#acLate"); pg.wait_for_timeout(200)
    pg.click('#acBar [data-sy="grc"]'); pg.wait_for_timeout(200)
    grc = pg.evaluate("acFilter(acAll()).length")
    check("filter: a system shows its tools only", grc == sum(1 for x in I if x["t"] in ("iso31000", "iso37000", "ccc", "aireg")) and grc > 0, grc)
    pg.click('#acBar [data-sy="all"]'); pg.wait_for_timeout(150)
    pg.select_option("#acTool", "capa"); pg.wait_for_timeout(200)
    check("filter: one tool", pg.evaluate("acFilter(acAll()).every(x=>x.t==='capa')") and pg.evaluate("document.querySelectorAll('#acBody tbody tr').length") == sum(1 for x in I if x["t"] == "capa"))
    pg.select_option("#acTool", ""); pg.wait_for_timeout(150)
    pg.fill("#acQ", "CA-EX-02"); pg.wait_for_timeout(500)
    check("search narrows to the matching record", 0 < pg.evaluate("document.querySelectorAll('#acBody tbody tr').length") < 10)
    pg.fill("#acQ", ""); pg.wait_for_timeout(500)
    # ---- every tool's first row opens the record in its tool
    tools = pg.evaluate("[...new Set(acAll().map(x=>x.t))]"); bad = []
    for k in tools:
        pg.evaluate("(k)=>{ AC.f={sys:'all',tool:k,owner:'',site:'',kind:'',late:false,q:''}; renderActions(); }", k); pg.wait_for_timeout(120)
        pg.click("#acBody tbody tr");
        try: pg.wait_for_function(f"document.getElementById('modFrame').dataset.k==='{k}' && document.getElementById('modOverlay').classList.contains('on')", timeout=5000)
        except Exception: bad.append(k)
        pg.evaluate("closeModule(false)"); pg.wait_for_timeout(60)
    check(f"each of the {len(tools)} tools with items: its first row opens the record's tool in the overlay", not bad, bad)
    pg.evaluate("AC.f={sys:'all',tool:'fmea',owner:'',site:'',kind:'',late:false,q:''}; renderActions();"); pg.wait_for_timeout(150)
    rid = pg.evaluate("acFilter(acAll())[0].id"); pg.click("#acBody tbody tr"); pg.wait_for_timeout(2200)
    check("a toolbox record opens on its own record (FMEA: the one-time hint {open})", rid in pg.evaluate("(()=>{ try{ const d=document.getElementById('modFrame').contentDocument; return [...d.querySelectorAll('input')].map(i=>i.value).join(' ')+' '+d.body.innerText; }catch(e){ return ''; } })()"), rid)
    check("no console errors", not errs, errs[:3])
    ctx.close()
    for lang, w in (("ar", 1280), ("en", 1280), ("ar", 390), ("en", 390)):
        ctx, pg, errs = hub(b, lang, w, seed=EX, hash_="#actions")
        tag = f"{lang} {w}px"; tx = pg.evaluate("document.getElementById('actions').innerText")
        check(f"{tag}: #actions renders; menu item present", pg.evaluate("curView") == "actions" and pg.evaluate("!!document.querySelector('#mNav a[href=\"#actions\"]')"))
        check(f"{tag}: no undefined/NaN/[object Object]", not bad_words(tx), bad_words(tx))
        check(f"{tag}: no horizontal overflow", overflow(pg) <= 1, overflow(pg))
        check(f"{tag}: no console errors", not errs, errs[:3])
        ctx.close()
    ctx, pg, errs = hub(b, "ar", 1280, hash_="#actions")
    check("no data: the register says so and invites starting a tool", "لا توجد بيانات" in pg.evaluate("document.getElementById('acBody').innerText"))
    ctx.close()
    b.close()
sys.exit(1 if save("hub-actions") else 0)
