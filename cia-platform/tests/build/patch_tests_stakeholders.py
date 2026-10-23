"""Step 2026-10-17 (Stakeholder Analysis): the platform and earlier tool suites follow the hub's new counts (39 tools, Audit & Improvement 16),
the removal of the grouped "coming soon" toolbox entry, the new news item and the new tool's checks. Every anchor must match once.
    python3 tests/build/patch_tests_stakeholders.py"""
import os, re
T = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))


def patch(rel, edits, mark):
    p = os.path.join(T, rel); s = open(p, encoding="utf-8").read()
    if mark in s:
        print(rel, "already patched"); return
    for a, b in edits:
        n = s.count(a); assert n == 1, (rel, n, a[:80]); s = s.replace(a, b)
    open(p, "w", encoding="utf-8").write(s); print(rel, "patched:", len(edits))


CIT = "pg.evaluate(\"(typeof SOON!=='undefined'?SOON:[]).filter(t=>t.k==='citbox').map(t=>t.ed.en).join('')\") == \"1 tool · PDCA, CAPA, 5 Whys, Fishbone, Pareto, RCA, A3, DMAIC, FMEA, Lessons Learned, SWOT and PESTLE are live\")"
CIT_NEW = "pg.evaluate(\"(typeof SOON!=='undefined'?SOON:[]).filter(t=>t.k==='citbox').length\") == 0)"
for rel, tag in (("lessons/test_lessons.py", " (PESTLE step)"), ("swot/test_swot.py", " (PESTLE step)"), ("fmea/test_fmea.py", " (PESTLE step)"), ("pestle/test_pestle.py", "")):
    patch(rel, [
        ('check("hub: 38 tools and Audit & Improvement 15%s", pg.evaluate("TOOLKITS.length") == 38 and pg.evaluate("wStats().per[SYSTEMS.findIndex(s=>s.id===\'aud\')].n") == 15)' % tag,
         'check("hub: 39 tools and Audit & Improvement 16 (Stakeholder step)", pg.evaluate("TOOLKITS.length") == 39 and pg.evaluate("wStats().per[SYSTEMS.findIndex(s=>s.id===\'aud\')].n") == 16)'),
        ('check("hub: grouped toolbox entry names the 1 tool left%s", ' % tag + CIT,
         'check("hub: the toolbox is complete, no grouped toolbox entry (Stakeholder step)", ' + CIT_NEW),
    ], "(Stakeholder step)")
patch("pestle/test_pestle.py", [
    ('pg.evaluate("NEWS[0].k") == "pestle"', 'pg.evaluate("NEWS.some(n=>n.k===\'pestle\')")'),
], "NEWS.some(n=>n.k===\\'pestle\\')")
patch("iso10009/test_iso10009_explain.py", [
    ('pg.evaluate("NEWS[0].k") == "pestle")', 'pg.evaluate("NEWS[0].k") == "stakeholders")'),
], 'NEWS[0].k") == "stakeholders"')
patch("platform/t_hub.py", [
    ('R.check("38 toolkit cards in the data", n_tk == 38, n_tk)', 'R.check("39 toolkit cards in the data", n_tk == 39, n_tk)'),
    ('R.check("38 toolkit cards on the page", pg.evaluate("document.querySelectorAll(\'#tools a[data-mod]\').length") >= 38,', 'R.check("39 toolkit cards on the page", pg.evaluate("document.querySelectorAll(\'#tools a[data-mod]\').length") >= 39,'),
    ('R.check("wheel: Audit & Improvement counts 15 tools", dict(per).get("aud") == 15, per)', 'R.check("wheel: Audit & Improvement counts 16 tools", dict(per).get("aud") == 16, per)'),
    ('R.check("wheel: the seven segments add up to 38", sum(n for _, n in per) == 38, per)', 'R.check("wheel: the seven segments add up to 39", sum(n for _, n in per) == 39, per)'),
    ('R.check("the toolbox entry counts 1 tool still to come, PDCA, CAPA, 5 Whys, Fishbone, Pareto, RCA, A3, DMAIC, FMEA, Lessons Learned, SWOT and PESTLE live", "1 tool · PDCA, CAPA, 5 Whys, Fishbone, Pareto, RCA, A3, DMAIC, FMEA, Lessons Learned, SWOT and PESTLE are live" in pg.evaluate("JSON.stringify(SOON.find(s=>s.k===\'citbox\'))"))',
     'R.check("the toolbox is complete: the PDCA card says so", "stakeholder analysis are live: the toolbox is complete" in pg.evaluate("JSON.stringify(TOOLKITS.find(t=>t.k===\'pdca\'))"))'),
    ('R.check("one grouped \'coming soon\' entry for the toolbox", soon == 1, soon)', 'R.check("no grouped \'coming soon\' entry for the toolbox any more", soon == 0, soon)'),
    ('R.check("hub links all 38 tools", len(keys) == 38 and "pestle" in keys', 'R.check("hub links all 39 tools", len(keys) == 39 and "stakeholders" in keys and "pestle" in keys'),
    ('("pestle", "explain-std"), ("iso9001", "explain-cl")', '("pestle", "explain-std"), ("stakeholders", "explain-std"), ("iso9001", "explain-cl")'),
], "39 toolkit cards in the data")
patch("platform/t_static.py", [
    ('R.check("PESTLE tour layer identical to the SWOT one apart from its CFG line", "pestle" in same, tour_variants)',
     'R.check("PESTLE tour layer identical to the SWOT one apart from its CFG line", "pestle" in same, tour_variants)\nR.check("Stakeholder Analysis tour layer identical to the PESTLE one apart from its CFG line", "stakeholders" in same, tour_variants)'),
    ('R.check("toolbox engine carried by PDCA, CAPA, 5 Whys, Fishbone, Pareto, RCA, A3, DMAIC, ISO 10009, FMEA, Lessons Learned, SWOT and PESTLE (thirteen files)", {"pdca", "capa", "five-whys", "fishbone", "pareto", "rca", "a3", "dmaic", "iso10009", "fmea", "lessons", "swot", "pestle"} <= set(engines) and len(engines) == 13, sorted(engines))',
     'R.check("toolbox engine carried by PDCA, CAPA, 5 Whys, Fishbone, Pareto, RCA, A3, DMAIC, ISO 10009, FMEA, Lessons Learned, SWOT, PESTLE and Stakeholder Analysis (fourteen files)", {"pdca", "capa", "five-whys", "fishbone", "pareto", "rca", "a3", "dmaic", "iso10009", "fmea", "lessons", "swot", "pestle", "stakeholders"} <= set(engines) and len(engines) == 14, sorted(engines))'),
], "Stakeholder Analysis tour layer")
patch("platform/t_example.py", [
    ('''    R.check("hub demo snapshot for PESTLE equals the hub's own reading of the example", pg.evaluate("JSON.stringify(DEMO_RES.pestle.m.map(x=>x[3]))") == pg.evaluate("JSON.stringify(CIADASH.evalAll().pestle.m.map(x=>x.d))"))''',
     '''    R.check("hub demo snapshot for PESTLE equals the hub's own reading of the example", pg.evaluate("JSON.stringify(DEMO_RES.pestle.m.map(x=>x[3]))") == pg.evaluate("JSON.stringify(CIADASH.evalAll().pestle.m.map(x=>x.d))"))
    skm = pg.evaluate("CIADASH.evalAll().stakeholders.m.map(x=>[x.k,Math.round(x.v),x.d])")
    R.check("Stakeholder metrics on the hub: 71% assessed, 15/15 key-party requirements sourced and decided, 13/13 key parties with an outcome, 2/3 reviewed", ["skAs", 71, "71%"] in skm and any(x[0] == "skReq" and x[2] == "15/15" for x in skm) and any(x[0] == "skOut" and x[2] == "13/13" for x in skm) and any(x[0] == "skRev" and x[2] == "2/3" for x in skm), skm)
    kbd = pg.evaluate("CIADASH.evalAll().stakeholders.bd.items.map(x=>x.t)")
    R.check("Stakeholder breakdown on the hub: every open-item type 0 in the example", kbd == ["0"] * 9, kbd)
    R.check("hub demo snapshot for Stakeholder Analysis equals the hub's own reading of the example", pg.evaluate("JSON.stringify(DEMO_RES.stakeholders.m.map(x=>x[3]))") == pg.evaluate("JSON.stringify(CIADASH.evalAll().stakeholders.m.map(x=>x.d))"))'''),
], "Stakeholder metrics on the hub")
patch("platform/summary.py", [
    ('"pestle", "iso10009-pestle-regress", "swot-pestle-regress"):', '"pestle", "iso10009-pestle-regress", "swot-pestle-regress", "stakeholders", "iso10009-stakeholders-regress"):'),
], '"iso10009-stakeholders-regress"')
patch("platform/run_all.sh", [
    ('for r in 1 2 3; do python3 ../pestle/test_pestle.py > "results/pestle-run$r.log" 2>&1; done\n',
     'for r in 1 2 3; do python3 ../pestle/test_pestle.py > "results/pestle-run$r.log" 2>&1; done\nfor r in 1 2 3; do python3 ../stakeholders/test_stakeholders.py > "results/stakeholders-run$r.log" 2>&1; done\n'
     '# this step (Stakeholder Analysis) changes the ISO 10009 guide only (6.5 and the 5.5 COTO entry gain a related link): the guide before/after, against the PESTLE package\n'
     'python3 ../stakeholders/iso10009_regress.py > "results/iso10009-stakeholders-regress-run1.log" 2>&1   # stored state, CSV, audit, coverage identical; report differs in the 6.5 row only\n'),
], "stakeholders/test_stakeholders.py")
