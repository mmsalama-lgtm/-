"""Step 10.1 (2026-10-16): the full explanation of ISO 10009:2024 in modules/iso10009.html. Same style as test_iso10009.py.
Covers: the inventory of the PDF (tests/iso10009/inventory_10009.json, built by tests/build/inv_10009.py) against the guide — every
clause and subclause, every reviewed tool, every "other relevant tools" list and its names, the tables, figures, Annex A/B/C items and the
bibliography count; the card of each of the 53 tools in Arabic and English (all blocks present, 5–8 steps, chain codes valid, apply
buttons); clauses 1–4; every clause page (mini-map, other tools with their explanation and platform status, three questions, prev/next);
Annex A matrix (contexts, ranges, highlight); Annex B; Annex C table (sort, filters, competence CSV, 16.3/16.2 note); the platform link map
inside the hub (parent.ciaOpenFile) and outside it (new tab); learning paths in their own key; the self-check (not stored); search;
?tool= deep links and the hub hint; copy link; the report appendix (only when ticked); the six new assistant answers with computed counts;
the reading path and diagram of the standard guide; the library cards' steps and auditor lines; 390 px with no horizontal scroll.
Served over http (CIA_BASE, default http://127.0.0.1:8802).   Usage: python3 tests/iso10009/test_iso10009_explain.py"""
import os, sys, json, re
from playwright.sync_api import sync_playwright
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
sys.path.insert(0, os.path.join(ROOT, "tests", "build"))
import cat_10009 as C  # noqa: E402
import cards_10009 as X  # noqa: E402
BASE = os.environ.get("CIA_BASE", "http://127.0.0.1:8802")
URL = BASE + "/modules/iso10009.html"
INV = json.load(open(os.path.join(HERE, "inventory_10009.json"), encoding="utf-8"))
results = []


def check(name, cond, detail=""):
    results.append((name, bool(cond), detail))
    print(("PASS " if cond else "FAIL ") + name + (("  -- " + str(detail)[:400]) if detail and not cond else ""), flush=True)


cmp = lambda c: [int(x) for x in c.split(".")]
# ---------------- inventory against the guide (static) ----------------
codes = {t["c"] for t in C.T}
check("inventory: 16 clauses, titles match the guide's clauses 5–16", len(INV["clauses"]) == 16 and
      [c for c, _ in INV["clauses"][4:]] == [c[0] for c in C.CLAUSES])
check("inventory: 70 subclauses", len(INV["subclauses"]) == 70, len(INV["subclauses"]))
GEN = {"4.1", "4.2", "5.4.1", "5.4.2", "13.1"}
other_sc = {c for c, t in INV["subclauses"] if t.lower().startswith("other relevant")}
tool_sc = [c for c, t in INV["subclauses"] if c not in GEN and c not in other_sc]
check("inventory: every reviewed-tool subclause is a tool of the guide (53)", sorted(tool_sc, key=cmp) == sorted(codes, key=cmp), set(tool_sc) ^ codes)
check("inventory: 12 'other relevant tools' lists, one per clause 5–16, all in the guide", len(other_sc) == 12 and other_sc == {o[0] for o in C.OTHER})
tok = lambda s: set(w for w in re.findall(r"[a-z0-9]{3,}", s.lower()) if w not in ("and", "the", "for", "tool", "tools", "analysis", "diagram", "model", "chart"))
miss = []
for sc, names in INV["other"].items():
    pool = " ".join(o[1]["en"] for o in C.OTHER if o[0] == sc).lower()
    for n in names:
        tk = tok(n)
        if tk and not any(w in pool for w in tk):
            miss.append((sc, n))
check("inventory: every name in the 'other relevant tools' lists is covered by the guide (word match)", not miss, miss)
check("inventory: names counted (49) and every guide entry explained (OTX aligned with OTHER)", sum(len(v) for v in INV["other"].values()) == 49 and len(X.OTX) == len(C.OTHER))
check("inventory: 53 tables, each belongs to a tool of the guide (5.4.2 → 5.4)", len(INV["tables"]) == 53 and {("5.4" if sc == "5.4.2" else sc) for _, sc in INV["tables"]} == codes)
check("inventory: 17 figures in the body and B.1–B.3", len([f for f in INV["figures"] if f[1] != "B"]) == 17 and INV["annex"]["B"] == ["B.1", "B.2", "B.3"] and len(X.ANNEXB["figs"]) == 3)
check("inventory: Annex A tables A.1–A.3 and the three contexts of the guide", INV["annex"]["A"] == ["A.1", "A.2", "A.3"] and sorted(C.ANNEX_A) == ["c", "p", "s"])
c1 = {("16.2" if c == "16.3" else c) for c in INV["annex"]["C1"]}
check("inventory: Table C.1 has 53 rows; with TQM 16.3 → 16.2 they are the guide's tools", len(INV["annex"]["C1"]) == 53 and c1 == codes and "16.3" in INV["annex"]["C1"])
check("inventory: bibliography of 91 references", INV["bibliography"]["n"] == 91)
check("cards: every tool has 5–8 steps and the card blocks in both languages",
      all(5 <= len(t["st"]) <= 8 and t["nw"] and t["inp"] and t["mis"] and t["aud"] and all(x["ar"] and x["en"] for k in ("st", "nw", "inp", "mis", "aud") for x in t[k]) for t in C.T))
check("cards: chain codes before/after are tools of the guide and never the tool itself", all(c in codes and c != t["c"] for t in C.T for c in t["pre"] + t["nxt"]))
check("quiz: 36 questions, 3 per clause 5–16, answer index valid", sum(len(v) for v in X.QUIZ.values()) == 36 and all(0 <= q["ok"] < len(q["o"]) for v in X.QUIZ.values() for q in v))
check("paths: five paths of 4–8 tools", len(X.PATHS) == 5 and all(4 <= len(p["c"]) <= 8 for p in X.PATHS))
check("terms: ISO 9000:2026 numbers given for every term", all(re.match(r"^3\.\d+\.\d+$", n) for n, _ in X.FRONT["terms"]))
src = open(os.path.join(ROOT, "modules", "iso10009.html"), encoding="utf-8").read()
check("no text of the standard: the card note says interpretive summary", "ملخص تفسيري بصياغة مستقلة، وليس النص الرسمي" in src and "Interpretive summary in independent wording, not the official text" in src)
check("the paths key is separate from the store", 'PKEY="cia-iso10009-paths:v1"' in src and 'STORE="cia-iso10009:v1"' in src)


def page(b, lang="ar", w=1280, h=900, init=""):
    ctx = b.new_context(viewport={"width": w, "height": h}); pg = ctx.new_page(); errs = []
    pg.route(re.compile(r"fonts\.(googleapis|gstatic)\.com"), lambda r: r.abort())
    pg.add_init_script("try{if(!sessionStorage.getItem('t-init')){sessionStorage.setItem('t-init','1');localStorage.clear();localStorage.setItem('cia-lang','%s');localStorage.setItem('cia-tour:m:iso10009','done');}}catch(e){}%s" % (lang, init))
    pg.on("pageerror", lambda x: errs.append("pageerror " + str(x)[:300]))
    pg.on("console", lambda m: errs.append("console " + m.text[:300]) if m.type == "error" and "Failed to load" not in m.text and "ERR_FAILED" not in m.text else None)
    pg.on("dialog", lambda d: d.accept())
    return ctx, pg, errs


BAD = ["undefined", "NaN", "[object Object]", "{"]
BOX = "document.getElementById('qxBox').innerText"
with sync_playwright() as p:
    b = p.chromium.launch()
    for lang in ("ar", "en"):
        ctx, pg, errs = page(b, lang)
        pg.goto(URL + "#explain-cl", wait_until="load"); pg.wait_for_timeout(500)
        txt = pg.evaluate(BOX)
        check(f"{lang}: contents list clauses 1–4, 5–16, Annexes A–C, map and paths", pg.evaluate("document.querySelectorAll('#qxBox .qx-tc').length") == 1 + 12 + 5)
        check(f"{lang}: inventory figures shown on the contents", all(str(n) in txt for n in (16, 70, 53, 17, 49, 91)))
        pg.evaluate("qxView('front')"); txt = pg.evaluate(BOX)
        check(f"{lang}: clauses 1–4 — four aims with examples and the terms table", pg.evaluate("document.querySelectorAll('#qxBox .qx-tb')[0].tBodies[0].rows.length") == 4 and
              pg.evaluate("document.querySelectorAll('#qxBox .qx-tb')[1].tBodies[0].rows.length") == len(X.FRONT["terms"]) and "ISO 9000:2026 3.3.1" in txt)
        bad = []
        for c in range(5, 17):
            pg.evaluate(f"qxClause('{c}')"); t2 = pg.evaluate(BOX)
            n = len([t for t in C.T if t["sec"] == str(c)]); o = len([x for x in C.OTHER if x[0].split(".")[0] == str(c)])
            ok = (pg.evaluate("document.querySelectorAll('#qxBox .qx-mt').length") == n and pg.evaluate("document.querySelectorAll('#qxBox .qx-oth li').length") == o and
                  pg.evaluate("document.querySelectorAll('#qxBox .qx-qi').length") == 3 and pg.evaluate("document.querySelectorAll('#qxBox .qx-pn button').length") == (1 if c in (5, 16) else 2) and
                  not any(w in t2 for w in BAD))
            if not ok: bad.append(c)
        check(f"{lang}: every clause 5–16 has its tools, other tools explained, three questions and prev/next", not bad, bad)
        HEADS = ["xSum", "xAims", "xWhen", "xNot", "xInp", "xSteps", "xOut", "xAttr", "xPdca", "xBen", "xNotes", "xEx", "xMis", "xAud", "xChain", "xApply"]
        bad = []
        for t in C.T:
            pg.evaluate(f"qxTool('{t['c']}')")
            r = pg.evaluate("""(function(){ var c=document.querySelector('#qxBox .qx-card'); return {h:[...c.querySelectorAll('.qx-s h3')].map(e=>e.textContent),
              st:c.querySelectorAll('.qx-s.steps li').length, chain:c.querySelectorAll('.qx-s [data-qxt]').length, acts:c.querySelectorAll('.qx-s.apply button').length,
              crumb:document.querySelectorAll('#qxBox .qx-crumb button').length, txt:c.innerText, src:c.querySelector('.qx-src').textContent}; })()""")
            want = pg.evaluate("h=>h.map(k=>qx(k))", HEADS)
            if not (r["h"] == want and r["st"] == len(t["st"]) and r["chain"] == len(t["pre"]) + len(t["nxt"]) and r["acts"] >= 3 and r["crumb"] == 2 and
                    not any(w in r["txt"] for w in BAD) and re.search(r"\d+\.\d+", r["src"])):
                bad.append((t["c"], r["h"] == want, r["st"], r["chain"], r["acts"], r["crumb"]))
        check(f"{lang}: every one of the 53 cards has all blocks, its steps, chain, apply buttons, breadcrumb and source line", not bad, bad[:4])
        pg.evaluate("qxTool('13.4')")
        check(f"{lang}: the radar chart card names Table 13.3 (clause 13 numbering)", "13.3" in pg.evaluate("document.querySelector('#qxBox .qx-src').textContent"))
        pg.evaluate("qxTool('5.1')"); pg.click("#qxBox .qx-pn button:last-child"); pg.wait_for_timeout(50)
        check(f"{lang}: next goes 5.1 → 5.2", pg.evaluate("QS.tool") == "5.2")
        pg.click("#qxBox .qx-pn button:first-child"); check(f"{lang}: previous goes back to 5.1", pg.evaluate("QS.tool") == "5.1")
        pg.click("#qxBox .qx-crumb button:nth-of-type(2)"); check(f"{lang}: breadcrumb opens the clause", pg.evaluate("QS.v+' '+QS.c") == "cl 5")
        pg.evaluate("ctx=>0", 0); ctx.close()
        if errs: check(f"{lang}: no errors", False, errs[:3])

    ctx, pg, errs = page(b, "ar")
    pg.goto(URL + "#explain-cl", wait_until="load"); pg.wait_for_timeout(500)
    # Annex A
    pg.evaluate("qxView('A')")
    for k in ("s", "p", "c"):
        pg.click(f"[data-qxctx='{k}']")
        n = pg.evaluate("document.querySelectorAll('#qxBox .qx-ph').length"); cells = pg.evaluate("[...document.querySelectorAll('#qxBox .qx-ph > div')].map(d=>d.querySelectorAll(':scope > .qx-chip, :scope > details').length)")
        check(f"Annex A {k}: four phases with every entry of the table", n == 4 and cells == [len(C.ANNEX_A[k][ph]) for ph in "PDCA"], (cells, [len(C.ANNEX_A[k][ph]) for ph in "PDCA"]))
    pg.click("[data-qxctx='p']")
    rng = pg.evaluate("document.querySelector('#qxBox details.qx-rg').querySelectorAll('[data-qxt]').length")
    check("Annex A: the range 13.1–13.6 expands to the five reviewed tools 13.2–13.6", rng == 5, rng)
    pg.select_option("#qxHl", "14.5")
    check("Annex A: highlight marks the tool and counts its places", pg.evaluate("document.querySelectorAll('#qxBox .qx-chip.hl').length") >= 1 and "موضعاً" in pg.evaluate("document.querySelector('#qxBox .qx-pin').textContent"))
    pg.click("#qxBox .qx-chip.hl"); check("Annex A: a tool opens its card", pg.evaluate("QS.v+' '+QS.tool") == "tool 14.5")
    # Annex B
    pg.evaluate("qxView('B')")
    check("Annex B: three figure summaries and six building steps", pg.evaluate("document.querySelectorAll('#qxBox .qx-bf > div').length") == 3 and pg.evaluate("document.querySelectorAll('#qxBox ol li').length") == 6)
    pg.click("#qxBox [data-ptab='sb']"); pg.wait_for_timeout(100)
    check("Annex B: the button opens the storyboard", pg.evaluate("curTab+' '+SUB") == "tools sb")
    # Annex C
    pg.evaluate("go('explain-cl'); qxView('C')")
    check("Annex C: 53 rows", pg.evaluate("document.querySelectorAll('#qxBox .qx-c1 tbody tr').length") == 53)
    pg.click("[data-qxsort='cap']"); pg.click("[data-qxsort='cap']")
    first = pg.evaluate("[...document.querySelectorAll('#qxBox .qx-c1 tbody tr td:nth-child(7)')].slice(0,9).map(x=>x.textContent)")
    check("Annex C: sorting by capability descending puts the nine ••• tools first", first == ["•••"] * 9, first)
    pg.select_option("#qxFcap", "2"); check("Annex C: filter •• gives 20 tools", pg.evaluate("document.querySelectorAll('#qxBox .qx-c1 tbody tr').length") == 20)
    pg.select_option("#qxFcap", ""); pg.select_option("#qxFlv", "own")
    check("Annex C: platform filter gives the eight dedicated tools (5.1 SWOT and 5.2 PESTLE since their steps)", pg.evaluate("document.querySelectorAll('#qxBox .qx-c1 tbody tr').length") == 8)
    check("Annex C: the 16.3 / 16.2 note is shown", "16.3" in pg.evaluate(BOX) and "16.2" in pg.evaluate(BOX))
    with pg.expect_download() as dl:
        pg.click("[data-qxcsv]")
    csv = open(dl.value.path(), encoding="utf-8").read()
    check("Annex C: competence matrix CSV has the 29 tools needing •• or •••", len(csv.strip().splitlines()) == 30 and "7.2" in csv and dl.value.suggested_filename.startswith("ISO10009-competence-matrix-"))
    # map
    pg.evaluate("qxView('map')")
    rows = pg.evaluate("document.querySelectorAll('#qxBox .qx-mr').length")
    check("map: a row per linked platform tool, plus this guide and the not-yet list", rows >= 10, rows)
    none = len([t for t in C.T if t["lv"] == "none"])
    check("map: the not-yet list has every tool not on the platform", pg.evaluate("document.querySelector('#qxBox .qx-mr:last-child').querySelectorAll('[data-qxt]').length") == none)
    with ctx.expect_page() as np:
        pg.click("#qxBox .qx-mr:first-child [data-plat]")
    check("map outside the hub: a platform tool opens in a new tab", np.value.url.endswith(".html") or ".html#" in np.value.url, np.value.url)
    np.value.close()
    # paths and quiz
    pg.evaluate("qxView('paths')")
    check("paths: five paths, nothing stored yet", pg.evaluate("document.querySelectorAll('#qxBox .qx-path').length") == 5 and pg.evaluate("localStorage.getItem('cia-iso10009-paths:v1')") is None)
    pg.click("#qxBox .qx-path[data-path='recur'] input[data-qxdone='13.7']")
    check("paths: ticking writes only the paths key", pg.evaluate("localStorage.getItem('cia-iso10009-paths:v1')") == '{"studied":["13.7"]}' and pg.evaluate("localStorage.getItem('cia-iso10009:v1')") is None)
    check("paths: progress shows 1 of 5", "1 من 5" in pg.evaluate("document.querySelector(\"#qxBox .qx-path[data-path='recur'] small\").textContent"))
    pg.click("#qxBox .qx-path[data-path='recur'] .pd-btn"); check("paths: continue opens the next unstudied tool", pg.evaluate("QS.tool") == "14.5")
    check("paths: the card shows the path and the studied button", "حل مشكلة متكررة" in pg.evaluate(BOX))
    pg.evaluate("qxClause('7')"); q = X.QUIZ["7"][0]
    pg.click(f"[data-qxq='7|0|{(q['ok'] + 1) % len(q['o'])}']")
    check("quiz: a wrong answer shows the right one and the reason", pg.evaluate("document.querySelectorAll('#qxBox .qx-opt.ok').length") == 1 and pg.evaluate("document.querySelectorAll('#qxBox .qx-opt.bad').length") == 1 and pg.evaluate("document.querySelector('#qxBox .qx-why').textContent").startswith("ليس تماماً"))
    check("quiz: nothing stored", sorted(pg.evaluate("Object.keys(localStorage)")) == sorted(["cia-lang", "cia-tour:m:iso10009", "cia-iso10009-paths:v1"]), pg.evaluate("Object.keys(localStorage)"))
    # search
    pg.fill("#qxQ", "FMEA"); pg.wait_for_timeout(80)
    check("search: FMEA finds 7.3 and keeps focus in the box", "7.3" in pg.evaluate("[...document.querySelectorAll('#qxBox .qx-mt code')].map(e=>e.textContent)") and pg.evaluate("document.activeElement.id") == "qxQ")
    pg.fill("#qxQ", "Hoshin"); pg.wait_for_timeout(80)
    check("search: Arabic/English names (Hoshin → 8.2)", pg.evaluate("[...document.querySelectorAll('#qxBox .qx-mt code')].map(e=>e.textContent)") == ["8.2"])
    pg.fill("#qxQ", "APQP"); pg.wait_for_timeout(80)
    check("search: finds an other relevant tool (APQP) and leads to its clause", len(pg.evaluate("[...document.querySelectorAll('#qxBox .qx-mt[data-qxc]')]")) >= 1)
    pg.fill("#qxQ", "")
    # copy link
    ctx.grant_permissions(["clipboard-read", "clipboard-write"], origin=BASE)
    pg.evaluate("qxTool('7.3')"); pg.click("[data-qxcopy]"); pg.wait_for_timeout(150)
    clip = pg.evaluate("navigator.clipboard.readText()")
    check("copy link: ?tool=7.3#explain-cl copied", clip.endswith("/modules/iso10009.html?tool=7.3#explain-cl"), clip)
    # library and navigator
    pg.evaluate("go('tools'); setSub('lib')"); pg.wait_for_timeout(100)
    check("library: cards gain steps, auditor lines and a full-card button", pg.evaluate("document.querySelectorAll('#libBox .qt-card details ol').length") == 53 and pg.evaluate("document.querySelectorAll('#libBox [data-qxopen]').length") == 53)
    pg.evaluate("document.querySelector('#lib-fmea [data-qxopen]').click()"); pg.wait_for_timeout(100)
    check("library: full card opens the clause guide on the tool", pg.evaluate("curTab+' '+QS.tool") == "explain-cl 7.3")
    # deep links
    pg.goto(URL + "?tool=pareto", wait_until="load"); pg.wait_for_timeout(400)
    check("?tool= accepts the tool id too", pg.evaluate("curTab+' '+QS.tool") == "explain-cl 13.7")
    pg.goto(URL + "?tool=99.9", wait_until="load"); pg.wait_for_timeout(400)
    check("?tool= with an unknown code falls back to the page", pg.evaluate("curTab") == "home")
    # reading path and diagram
    pg.evaluate("go('explain-std')"); pg.wait_for_timeout(100)
    check("standard guide: six reading steps and a diagram with 12 clause nodes", pg.evaluate("document.querySelectorAll('#qxStd .qx-rp li').length") == 6 and pg.evaluate("document.querySelectorAll('#qxStd g[data-qxc]').length") == 12 and pg.evaluate("!!document.querySelector('#qxStd svg title')"))
    pg.click("#qxStd g[data-qxc='14']"); pg.wait_for_timeout(100)
    check("standard guide: a diagram node opens its clause", pg.evaluate("curTab+' '+QS.v+' '+QS.c") == "explain-cl cl 14")
    pg.evaluate("go('explain-std')"); pg.click("#qxStd [data-qxgo='A']"); check("standard guide: a reading step opens Annex A", pg.evaluate("curTab+' '+QS.v") == "explain-cl A")
    pg.evaluate("go('explain-std')"); pg.focus("#qxStd g[data-qxc='9']"); pg.keyboard.press("Enter"); pg.wait_for_timeout(100)
    check("standard guide: diagram nodes work with the keyboard", pg.evaluate("QS.c") == "9")
    # report appendix
    pg.evaluate("loadExample()"); pg.wait_for_timeout(200)
    h0, h1 = pg.evaluate("buildReportHTML()"), pg.evaluate("buildReportHTML(true)")
    check("report: appendix only when asked; the default report has none", "qx" not in h0 and h0.count("<h3><code>") == 0 and h1.count("<h3><code>") == 53 and h1.replace(h1[h1.find("<h2>ملحق"):h1.rfind("<footer>")], "") == h0)
    pg.evaluate("go('report')"); pg.check("#rpAppx")
    with pg.expect_download() as dl:
        pg.click("#rpHtml")
    rep = open(dl.value.path(), encoding="utf-8").read()
    check("report: ticking the box downloads the report with the appendix", rep.count("<h3><code>") == 53)
    # assistant
    pg.evaluate("cbOpen(true)")
    exp = {"كيف أطبق أداة خطوة بخطوة": "card", "متى لا أستخدم أداة": "notuse", "ماذا يطلب المدقق": "auditor", "مصفوفة الكفاءة": "compet", "مسارات التعلم": "paths", "الأدوات الأخرى ذات الصلة": "other"}
    got = {q: pg.evaluate("q=>(cbFind(q)||{}).id", q) for q in exp}
    check("assistant: six new questions find their answers", got == exp, got)
    check("assistant: older questions still answered (certification, PDCA, dots)", [pg.evaluate("q=>(cbFind(q)||{}).id", q) for q in ("هل ISO 10009 قابلة للإشهاد", "دورة PDCA", "ماذا تعني النقاط")] == ["what", "pdca", "dots"])
    c2 = len([t for t in C.T if t["cap"] == 2]); c3 = len([t for t in C.T if t["cap"] == 3])
    a = pg.evaluate("kbDyn('compet')")
    check(f"assistant: competence answer counts {c2} •• and {c3} ••• from the catalogue", f"**{c2} " in a and f"**{c3} " in a)
    a = pg.evaluate("kbDyn('other')")
    check("assistant: other-tools answer counts 49 names in 12 lists", "49" in a and "12" in a and str(len(C.OTHER)) in a)
    a = pg.evaluate("kbDyn('paths')")
    check("assistant: paths answer reads the progress", "1 من 5" in a and a.count("- **") == 5)
    pg.evaluate("cbSend('ماذا يطلب المدقق عندما أستخدم أداة؟')"); pg.wait_for_timeout(100)
    check("assistant: answer links to the clause guide tab", pg.evaluate("!!document.querySelector('#cbBody [data-cbgo=\"explain-cl\"]')"))
    check("no errors (Arabic run)", not errs, errs[:3])
    ctx.close()

    # 390 px, both languages: no horizontal scroll in any view
    for lang in ("ar", "en"):
        ctx, pg, errs = page(b, lang, 390, 844)
        pg.goto(URL + "#explain-cl", wait_until="load"); pg.wait_for_timeout(500)
        wide = []
        for v in ("toc", "front", "A", "B", "C", "map", "paths"):
            pg.evaluate(f"qxView('{v}')")
            if pg.evaluate("document.documentElement.scrollWidth") > 392: wide.append(v)
        for c in ("5", "13", "16"):
            pg.evaluate(f"qxClause('{c}')")
            if pg.evaluate("document.documentElement.scrollWidth") > 392: wide.append("cl" + c)
        for c in ("7.3", "13.8", "16.1"):
            pg.evaluate(f"qxTool('{c}')")
            if pg.evaluate("document.documentElement.scrollWidth") > 392: wide.append(c)
        pg.evaluate("go('explain-std')")
        if pg.evaluate("document.documentElement.scrollWidth") > 392: wide.append("std")
        check(f"{lang} 390 px: no horizontal scroll in any view", not wide, wide)
        check(f"{lang} 390 px: no errors", not errs, errs[:3])
        ctx.close()

    # inside the hub: the clause guide opens platform tools through parent.ciaOpenFile
    ctx, pg, errs = page(b, "en", 1280, init="try{localStorage.setItem('cia-tour:v1','done')}catch(e){}")
    pg.goto(BASE + "/index.html", wait_until="load"); pg.wait_for_timeout(500)
    pg.evaluate("openModule('iso10009')"); pg.wait_for_function("()=>document.getElementById('modFrame').dataset.k==='iso10009'", timeout=8000); pg.wait_for_timeout(900)
    fw = "document.getElementById('modFrame').contentWindow"
    pg.evaluate(fw + ".qxTool('5.1')"); pg.wait_for_timeout(200)
    pg.evaluate(fw + ".document.querySelector('#qxBox .qx-s.apply [data-plat=\"str\"]').click()")
    pg.wait_for_function("()=>document.getElementById('modFrame').dataset.k==='str'", timeout=8000); pg.wait_for_timeout(800)
    check("hub: the SWOT card's apply button opens the strategy studio on its tab", pg.evaluate("location.hash").startswith("#m=str/"), pg.evaluate("location.hash"))
    pg.evaluate("openModule('iso10009')"); pg.wait_for_function("()=>document.getElementById('modFrame').dataset.k==='iso10009'", timeout=8000); pg.wait_for_timeout(900)
    pg.evaluate(fw + ".qxView('map')"); pg.evaluate(fw + ".document.querySelector('#qxBox .qx-mr [data-plat=\"fmea\"]').click()")
    pg.wait_for_function("()=>document.getElementById('modFrame').dataset.k==='fmea'", timeout=8000); pg.wait_for_timeout(600)
    check("hub: the link map opens FMEA in the overlay", pg.evaluate("document.getElementById('modFrame').dataset.k") == "fmea")
    pg.evaluate("closeModule()"); pg.wait_for_timeout(300); pg.evaluate("showView('learn')"); pg.wait_for_timeout(200)
    g2 = pg.evaluate("document.querySelectorAll('a.kguide[data-mod=\"iso10009\"][data-anchor=\"explain-cl\"]').length")
    check("hub: the ISO 10009 knowledge topic has a second link to the clause guide", g2 == 1 and 'guide2:{k:"iso10009",a:"explain-cl"' in open(os.path.join(ROOT, "index.html"), encoding="utf-8").read(), g2)
    check("hub: TOOLINFO keeps 16 questions and the navigator start; NEWS has the update", pg.evaluate("TOOLINFO.iso10009.q===16 && TOOLINFO.iso10009.start==='tools'") and
          pg.evaluate("NEWS.filter(n=>n.k==='iso10009').length") == 2 and pg.evaluate("NEWS[0].k") == "pestle")
    pg.evaluate("document.querySelector('#kpath a.kguide[data-mod=\"iso10009\"][data-anchor=\"explain-cl\"]').click()"); pg.wait_for_function("()=>document.getElementById('modFrame').dataset.k==='iso10009'", timeout=8000); pg.wait_for_timeout(900)
    check("hub: the second link opens the guide on the clause guide tab", pg.evaluate(fw + ".curTab") == "explain-cl")
    check("hub: no errors", not [x for x in errs if "frame" not in x.lower()], errs[:3])
    ctx.close()
    b.close()

failed = [r for r in results if not r[1]]
print(f"\n== iso10009-explain: {len(results) - len(failed)}/{len(results)} passed")
sys.exit(1 if failed else 0)
