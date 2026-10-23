"""Example data in every tool: load it (confirming the replace prompts), then every tab in Arabic and English
shows no error, no "undefined" / "NaN" / "[object Object]" and no empty pane; then the hub dashboard reads
every tool's example (status "ok" with an index) and the executive cockpit picks the tools up."""
import os, sys
sys.path.insert(0, os.path.dirname(__file__))
from common import BASE, Report, modules, launch, new_page, bad_words, sync_playwright

R = Report("example")
BUTTONS = """()=>{ let g={}; try{ const s=[...document.scripts].map(x=>x.textContent).find(t=>t.includes('var CFG={"file"'));
   g=JSON.parse(s.match(/var CFG=(\\{.*?\\});/)[1]).guard||{}; }catch(e){}
   const ids=Object.keys(g).filter(k=>g[k]!=='restore'); if(!ids.includes('pfEx')&&document.documentElement.innerHTML.includes('id="pfEx"')) ids.unshift('pfEx');
   ids.sort((a,b)=>(g[b]==='all')-(g[a]==='all')); return ids; }"""
SWITCH = """async (t)=>{ const b=document.querySelector('#side button[data-t="'+t+'"]'); b&&b.click();
  await new Promise(r=>setTimeout(r,90)); const e=document.querySelector('.tabpane[data-tab="'+t+'"]');
  return {len:e?e.innerText.trim().length:0, text:e?e.innerText:''}; }"""

with sync_playwright() as p:
    b = launch(p)
    ALL = modules()
    ctx, pg, errs = new_page(b, "ar", 1280, 900, tour_done=ALL)
    pg.goto(f"{BASE}/index.html", wait_until="load"); pg.wait_for_timeout(300)
    KEYS = dict(pg.evaluate("CIADASH.TOOLS.map(t=>[URLS[t.k].split('/').pop().replace('.html',''), t.key])"))
    loaded = {}
    for m in ALL:
        pg.goto(f"{BASE}/modules/{m}.html", wait_until="load"); pg.wait_for_timeout(400)
        before = pg.evaluate("Object.keys(localStorage).filter(k=>!/^cia-(tour|lang)/.test(k)).map(k=>k+'='+localStorage.getItem(k).length)")
        ids = pg.evaluate(BUTTONS)
        tabs = pg.evaluate("[...document.querySelectorAll('#side button[data-t]')].map(b=>b.dataset.t)")
        clicked = []
        for bid in ids:
            if not pg.evaluate(f"!!document.getElementById('{bid}')"):
                for t in tabs:  # some buttons only exist once their tab has been drawn
                    pg.evaluate(SWITCH, t)
                    if pg.evaluate(f"!!document.getElementById('{bid}')"): break
            if pg.evaluate(f"!!document.getElementById('{bid}')"):
                pg.evaluate(f"document.getElementById('{bid}').click()"); pg.wait_for_timeout(700); clicked.append(bid)
        after = pg.evaluate("Object.keys(localStorage).filter(k=>!/^cia-(tour|lang)/.test(k)).map(k=>k+'='+localStorage.getItem(k).length)")
        loaded[m] = clicked
        if m == "executive-cockpit-workspace":
            R.check(f"{m}: has no example of its own (it reads the other tools)", not ids, ids)
        else:
            key = KEYS.get(m)
            val = pg.evaluate(f"localStorage.getItem({key!r})") if key else None
            R.check(f"{m}: example loads ({', '.join(clicked)}) into {key}", clicked and val and len(val) > 50, [ids, key, (val or '')[:80]])
        R.check(f"{m}: no errors while loading the example", not errs, errs[:3]); del errs[:]
    # every tab with data, both languages
    for lang in ("ar", "en"):
        pg.evaluate(f"localStorage.setItem('cia-lang','{lang}')")
        for m in ALL:
            pg.goto(f"{BASE}/modules/{m}.html", wait_until="load"); pg.wait_for_timeout(350)
            tabs = pg.evaluate("[...document.querySelectorAll('#side button[data-t]')].map(b=>b.dataset.t)")
            empty, bw = [], []
            for t in tabs:
                r = pg.evaluate(SWITCH, t)
                if r["len"] < 20: empty.append(t)
                bw += bad_words(r["text"])
            R.check(f"{m} {lang}: every tab with example data has content", not empty, empty)
            R.check(f"{m} {lang}: no undefined/NaN/[object Object] with example data", not bw, bw[:3])
            R.check(f"{m} {lang}: no errors with example data", not errs, errs[:3]); del errs[:]
    # hub dashboard reads every example
    pg.evaluate("localStorage.setItem('cia-lang','ar')")
    pg.goto(f"{BASE}/index.html", wait_until="load"); pg.wait_for_timeout(600)
    res = pg.evaluate("""()=>{const R=CIADASH.evalAll(); return CIADASH.TOOLS.map(t=>[t.k, URLS[t.k], R[t.k].st, R[t.k].idx, (R[t.k].m||[]).length])}""")
    for k, url, st, idx, nm in res:
        R.check(f"hub dashboard reads {k} ({url.split('/')[-1]})", st == "ok" and nm > 0, [st, idx, nm])
    pdca = [x for x in res if x[0] == "pdca"]
    R.check("hub reads PDCA: self-assessment 65% and 3 cycles", pdca and pdca[0][2] == "ok", pdca)
    pdm = pg.evaluate("CIADASH.evalAll().pdca.m.map(x=>[x.k,Math.round(x.v),x.d])")
    R.check("PDCA metrics on the hub: 65% assessed, 1/3 closed", ["pdAs", 65, "65%"] in pdm and any(x[0] == "pdCl" and x[2] == "1/3" for x in pdm), pdm)
    cam = pg.evaluate("CIADASH.evalAll().capa.m.map(x=>[x.k,Math.round(x.v),x.d])")
    R.check("CAPA metrics on the hub: 67% assessed, 1/4 closed and effective", ["caAs", 67, "67%"] in cam and any(x[0] == "caEff" and x[2] == "1/4" for x in cam), cam)
    cbd = pg.evaluate("CIADASH.evalAll().capa.bd.items.map(x=>x.t)")
    R.check("CAPA breakdown on the hub: overdue actions, overdue reviews, reopened, waiting", len(cbd) == 4 and cbd[2] == "1", cbd)
    wm = pg.evaluate("CIADASH.evalAll().why5.m.map(x=>[x.k,Math.round(x.v),x.d])")
    R.check("5 Whys metrics on the hub: 70% assessed, 3/3 tested, 3/3 linked to CAPA", ["w5As", 70, "70%"] in wm and any(x[0] == "w5Te" and x[2] == "3/3" for x in wm) and any(x[0] == "w5Ca" and x[2] == "3/3" for x in wm), wm)
    wbd = pg.evaluate("CIADASH.evalAll().why5.bd.items.map(x=>x.t)")
    R.check("5 Whys breakdown on the hub: not tested 0, to check 2, person only 0, waiting for review 1", wbd == ["0", "2", "0", "1"], wbd)
    R.check("hub demo snapshot for 5 Whys equals the hub's own reading of the example", pg.evaluate("JSON.stringify(DEMO_RES.why5.m.map(x=>x[3]))") == pg.evaluate("JSON.stringify(CIADASH.evalAll().why5.m.map(x=>x.d))"))
    fm = pg.evaluate("CIADASH.evalAll().fish.m.map(x=>[x.k,Math.round(x.v),x.d])")
    R.check("Fishbone metrics on the hub: 75% assessed, 3/3 with verified selected causes, 3/3 linked to CAPA", ["fbAs", 75, "75%"] in fm and any(x[0] == "fbVe" and x[2] == "3/3" for x in fm) and any(x[0] == "fbCa" and x[2] == "3/3" for x in fm), fm)
    fbd = pg.evaluate("CIADASH.evalAll().fish.bd.items.map(x=>x.t)")
    R.check("Fishbone breakdown on the hub: not verified 0, none selected 0, person only 0, waiting for review 1", fbd == ["0", "0", "0", "1"], fbd)
    R.check("hub demo snapshot for Fishbone equals the hub's own reading of the example", pg.evaluate("JSON.stringify(DEMO_RES.fish.m.map(x=>x[3]))") == pg.evaluate("JSON.stringify(CIADASH.evalAll().fish.m.map(x=>x.d))"))
    pm = pg.evaluate("CIADASH.evalAll().pareto.m.map(x=>[x.k,Math.round(x.v),x.d])")
    R.check("Pareto metrics on the hub: 70% assessed, 2/3 with every vital-few category linked, 1/3 improved on a before/after check", ["paAs", 70, "70%"] in pm and any(x[0] == "paLk" and x[2] == "2/3" for x in pm) and any(x[0] == "paIm" and x[2] == "1/3" for x in pm), pm)
    pbd = pg.evaluate("CIADASH.evalAll().pareto.bd.items.map(x=>x.t)")
    R.check("Pareto breakdown on the hub: not confirmed 0, unlinked 1, not checked 1, Other too large 0, waiting for review 0", pbd == ["0", "1", "1", "0", "0"], pbd)
    R.check("hub demo snapshot for Pareto equals the hub's own reading of the example", pg.evaluate("JSON.stringify(DEMO_RES.pareto.m.map(x=>x[3]))") == pg.evaluate("JSON.stringify(CIADASH.evalAll().pareto.m.map(x=>x.d))"))
    rm = pg.evaluate("CIADASH.evalAll().rca.m.map(x=>[x.k,Math.round(x.v),x.d])")
    R.check("RCA metrics on the hub: 71% assessed, 3/3 with every root cause confirmed and tested, 3/3 with a criterion written before the action", ["rcAs", 71, "71%"] in rm and any(x[0] == "rcRo" and x[2] == "3/3" for x in rm) and any(x[0] == "rcCr" and x[2] == "3/3" for x in rm), rm)
    rbd = pg.evaluate("CIADASH.evalAll().rca.bd.items.map(x=>x.t)")
    R.check("RCA breakdown on the hub: not tested 0, person only 0, depth or methods 0, root without action 0, waiting for review 1", rbd == ["0", "0", "0", "0", "1"], rbd)
    R.check("hub demo snapshot for RCA equals the hub's own reading of the example", pg.evaluate("JSON.stringify(DEMO_RES.rca.m.map(x=>x[3]))") == pg.evaluate("JSON.stringify(CIADASH.evalAll().rca.m.map(x=>x.d))"))
    am = pg.evaluate("CIADASH.evalAll().a3.m.map(x=>[x.k,Math.round(x.v),x.d])")
    R.check("A3 metrics on the hub: 75% assessed, 2/3 goal met or partly met on a follow-up, 3/3 with every countermeasure tied to a proved cause", ["a3As", 75, "75%"] in am and any(x[0] == "a3Met" and x[2] == "2/3" for x in am) and any(x[0] == "a3Tie" and x[2] == "3/3" for x in am), am)
    abd = pg.evaluate("CIADASH.evalAll().a3.bd.items.map(x=>x.t)")
    R.check("A3 breakdown on the hub: goal rule 0, causes 0, countermeasures 0, plan 0, waiting 1", abd == ["0", "0", "0", "0", "1"], abd)
    R.check("hub demo snapshot for A3 equals the hub's own reading of the example", pg.evaluate("JSON.stringify(DEMO_RES.a3.m.map(x=>x[3]))") == pg.evaluate("JSON.stringify(CIADASH.evalAll().a3.m.map(x=>x.d))"))
    dm = pg.evaluate("CIADASH.evalAll().dmaic.m.map(x=>[x.k,Math.round(x.v),x.d])")
    R.check("DMAIC metrics on the hub: 79% assessed, 2/3 goal met or partly met after the change, 3/3 with every completed phase passed at its gate", ["dmAs", 79, "79%"] in dm and any(x[0] == "dmMet" and x[2] == "2/3" for x in dm) and any(x[0] == "dmGate" and x[2] == "3/3" for x in dm), dm)
    dbd = pg.evaluate("CIADASH.evalAll().dmaic.bd.items.map(x=>x.t)")
    R.check("DMAIC breakdown on the hub: goal rule 0, measurement 0, causes 1, solutions 0, waiting 0", dbd == ["0", "0", "1", "0", "0"], dbd)
    R.check("hub demo snapshot for DMAIC equals the hub's own reading of the example", pg.evaluate("JSON.stringify(DEMO_RES.dmaic.m.map(x=>x[3]))") == pg.evaluate("JSON.stringify(CIADASH.evalAll().dmaic.m.map(x=>x.d))"))
    qm = pg.evaluate("CIADASH.evalAll().iso10009.m.map(x=>[x.k,Math.round(x.v),x.d])")
    R.check("ISO 10009 metrics on the hub: 72% assessed, 3/3 storyboards with tools in all four phases, 8/8 completed toolbox steps linked (hub snapshot unchanged by the FMEA step)", ["qtAs", 72, "72%"] in qm and any(x[0] == "qtFull" and x[2] == "3/3" for x in qm) and any(x[0] == "qtLink" and x[2] == "8/8" for x in qm), qm)
    qbd = pg.evaluate("CIADASH.evalAll().iso10009.bd.items.map(x=>x.t)")
    R.check("ISO 10009 breakdown on the hub: phase 0, reason 1, result 0, standard 0, review 0", qbd == ["0", "1", "0", "0", "0"], qbd)
    R.check("hub demo snapshot for ISO 10009 equals the hub's own reading of the example", pg.evaluate("JSON.stringify(DEMO_RES.iso10009.m.map(x=>x[3]))") == pg.evaluate("JSON.stringify(CIADASH.evalAll().iso10009.m.map(x=>x.d))"))
    fmm = pg.evaluate("CIADASH.evalAll().fmea.m.map(x=>[x.k,Math.round(x.v),x.d])")
    R.check("FMEA metrics on the hub: 75% assessed, 3/3 with every high-priority row acted on, 2/3 re-rated after all their actions", ["fmAs", 75, "75%"] in fmm and any(x[0] == "fmHigh" and x[2] == "3/3" for x in fmm) and any(x[0] == "fmRe" and x[2] == "2/3" for x in fmm), fmm)
    fbd = pg.evaluate("CIADASH.evalAll().fmea.bd.items.map(x=>x.t)")
    R.check("FMEA breakdown on the hub: scales 0, high rows without action 0, human error 1, severity rule 0, re-rating or review 0", fbd == ["0", "0", "1", "0", "0"], fbd)
    R.check("hub demo snapshot for FMEA equals the hub's own reading of the example", pg.evaluate("JSON.stringify(DEMO_RES.fmea.m.map(x=>x[3]))") == pg.evaluate("JSON.stringify(CIADASH.evalAll().fmea.m.map(x=>x.d))"))
    llm = pg.evaluate("CIADASH.evalAll().lessons.m.map(x=>[x.k,Math.round(x.v),x.d])")
    R.check("Lessons Learned metrics on the hub: 71% assessed, 3/3 embedded, 2/3 verified as applied and working", ["llAs", 71, "71%"] in llm and any(x[0] == "llEmb" and x[2] == "3/3" for x in llm) and any(x[0] == "llVer" and x[2] == "2/3" for x in llm), llm)
    lbd = pg.evaluate("CIADASH.evalAll().lessons.bd.items.map(x=>x.t)")
    R.check("Lessons Learned breakdown on the hub: cause 0, blame 0, rule 0, action 0, not done 0, not verified 1, not shared 0", lbd == ["0", "0", "0", "0", "0", "1", "0"], lbd)
    R.check("hub demo snapshot for Lessons Learned equals the hub's own reading of the example", pg.evaluate("JSON.stringify(DEMO_RES.lessons.m.map(x=>x[3]))") == pg.evaluate("JSON.stringify(CIADASH.evalAll().lessons.m.map(x=>x.d))"))
    swm = pg.evaluate("CIADASH.evalAll().swot.m.map(x=>[x.k,Math.round(x.v),x.d])")
    R.check("SWOT metrics on the hub: 71% assessed, 26/26 top items with evidence, 3/3 with actions, 1/3 reviewed", ["swAs", 71, "71%"] in swm and any(x[0] == "swEv" and x[2] == "26/26" for x in swm) and any(x[0] == "swAct" and x[2] == "3/3" for x in swm) and any(x[0] == "swRev" and x[2] == "1/3" for x in swm), swm)
    sbd = pg.evaluate("CIADASH.evalAll().swot.bd.items.map(x=>x.t)")
    R.check("SWOT breakdown on the hub: every open-item type 0 in the example", sbd == ["0"] * 7, sbd)
    R.check("hub demo snapshot for SWOT equals the hub's own reading of the example", pg.evaluate("JSON.stringify(DEMO_RES.swot.m.map(x=>x[3]))") == pg.evaluate("JSON.stringify(CIADASH.evalAll().swot.m.map(x=>x.d))"))
    pem = pg.evaluate("CIADASH.evalAll().pestle.m.map(x=>[x.k,Math.round(x.v),x.d])")
    R.check("PESTLE metrics on the hub: 75% assessed, 17/17 top items with a source and a date, 17/17 with an outcome, 1/3 reviewed", ["peAs", 75, "75%"] in pem and any(x[0] == "peSrc" and x[2] == "17/17" for x in pem) and any(x[0] == "peOut" and x[2] == "17/17" for x in pem) and any(x[0] == "peRev" and x[2] == "1/3" for x in pem), pem)
    pbd = pg.evaluate("CIADASH.evalAll().pestle.bd.items.map(x=>x.t)")
    R.check("PESTLE breakdown on the hub: every open-item type 0 in the example", pbd == ["0"] * 7, pbd)
    R.check("hub demo snapshot for PESTLE equals the hub's own reading of the example", pg.evaluate("JSON.stringify(DEMO_RES.pestle.m.map(x=>x[3]))") == pg.evaluate("JSON.stringify(CIADASH.evalAll().pestle.m.map(x=>x.d))"))
    skm = pg.evaluate("CIADASH.evalAll().stakeholders.m.map(x=>[x.k,Math.round(x.v),x.d])")
    R.check("Stakeholder metrics on the hub: 71% assessed, 15/15 key-party requirements sourced and decided, 13/13 key parties with an outcome, 2/3 reviewed", ["skAs", 71, "71%"] in skm and any(x[0] == "skReq" and x[2] == "15/15" for x in skm) and any(x[0] == "skOut" and x[2] == "13/13" for x in skm) and any(x[0] == "skRev" and x[2] == "2/3" for x in skm), skm)
    kbd = pg.evaluate("CIADASH.evalAll().stakeholders.bd.items.map(x=>x.t)")
    R.check("Stakeholder breakdown on the hub: every open-item type 0 in the example", kbd == ["0"] * 9, kbd)
    R.check("hub demo snapshot for Stakeholder Analysis equals the hub's own reading of the example", pg.evaluate("JSON.stringify(DEMO_RES.stakeholders.m.map(x=>x[3]))") == pg.evaluate("JSON.stringify(CIADASH.evalAll().stakeholders.m.map(x=>x.d))"))
    pg.evaluate("showView('dash')"); pg.wait_for_timeout(400)
    dtx = pg.evaluate("document.getElementById('dash').innerText")
    R.check("hub dashboard view has no undefined/NaN/[object Object]", not bad_words(dtx), bad_words(dtx)[:3])
    R.check("hub dashboard lists PDCA, CAPA, 5 Whys, Fishbone and Pareto", "PDCA" in dtx and "CAPA" in dtx and "5 Whys" in dtx and "Fishbone" in dtx and "Pareto" in dtx)
    R.check("hub: no errors", not errs, errs[:3]); del errs[:]
    # executive cockpit sees the tools
    pg.goto(f"{BASE}/modules/executive-cockpit-workspace.html#modreg", wait_until="load"); pg.wait_for_timeout(600)
    reg = pg.evaluate("(document.querySelector('.tabpane[data-tab=\"modreg\"]')||{}).innerText||''")
    R.check("executive cockpit registry shows tools with data", len(reg) > 200 and not bad_words(reg), [len(reg), bad_words(reg)[:2]])
    R.check("executive cockpit: no errors", not errs, errs[:3])
    ctx.close(); b.close()
R.save({"loaded": loaded})
