"""The integrated report — step 15, 2026-10-22. Serve the platform over http first (CIA_BASE, default http://127.0.0.1:8802).
Covers, with every tool's example data: the overall index and each tool's index equal the dashboard's (#dash, same adapters, same selection);
every section is there (cover, 1–8); the organization's logo and name on the cover (with a profile), the "register your organization" note
without one; the static integration map; the consolidated action plan CSV (one row per roadmap item); the snapshot in cia-org-reports:v1 and
the change column in the next report; AR (rtl) and EN (ltr); no undefined/NaN; the buttons in #actions, #dash and the Executive Cockpit.
Usage: python3 tests/hub/test_integrated_report.py"""
import os, sys, json, re, base64, io
sys.path.insert(0, os.path.dirname(__file__))
from hubkit import *  # noqa
from PIL import Image

buf = io.BytesIO(); Image.new("RGB", (120, 60), (30, 140, 147)).save(buf, "PNG")
LOGO = "data:image/png;base64," + base64.b64encode(buf.getvalue()).decode()
PROF = dict(PROFILE, logo=LOGO)
with sync_playwright() as p:
    b = launch(p)
    EX = examples(b)
    for lang in ("ar", "en"):
        ctx, pg, errs = hub(b, lang, 1280, seed=EX, profile=PROF, hash_="#dash")
        check(f"{lang}: the dashboard carries the 'Issue the integrated report' button", pg.evaluate("!!document.getElementById('dIssue')"))
        dash = pg.evaluate("(()=>{ DEMO=false; dCompute(); const o=dOverall(); return {idx:o.idx, comp:o.comp, started:o.started, t:Object.fromEntries(CIADASH.TOOLS.map(t=>[t.k, DR[t.k].idx]))}; })()")
        B = pg.evaluate("async()=>{ const B=await ciaIntegratedReport({noOpen:true}); return {html:B.html, n:B.RM.length, o:B.o}; }")
        h = B["html"]
        open(os.path.join(RES, f"integrated-report-{lang}.html"), "w", encoding="utf-8").write(h)
        check(f"{lang}: overall index equals the dashboard's ({round(dash['idx'])}%)", abs(B["o"]["idx"] - dash["idx"]) < 1e-9 and f"<b>{round(dash['idx'])}%</b>" in h)
        check(f"{lang}: data completeness and tools used equal the dashboard's", abs(B["o"]["comp"] - dash["comp"]) < 1e-9 and f"{dash['started']} / 39" in h)
        bad = []
        for k, v in dash["t"].items():
            code = pg.evaluate("(k)=>CIADASH.TOOLS.find(t=>t.k===k).code", k)
            row = re.search(r"<tr class=\"[^\"]*\"><td><b>" + re.escape(code.replace("&", "&amp;")) + r"</b>[^<]*</td><td>([^<]*)</td>", h)
            exp = "—" if v is None else f"{round(v)}%"
            if not row or row.group(1) != exp: bad.append((k, row.group(1) if row else None, exp))
        check(f"{lang}: every tool's index in the status section equals the dashboard's (39)", not bad, bad[:5])
        secs = re.findall(r"<h2>(\d)\. ", h)
        check(f"{lang}: the cover and the eight numbered sections are there", 'class="cover"' in h and secs == [str(i) for i in range(1, 9)], secs)
        check(f"{lang}: the cover shows the organization's logo and name next to the academy logo", f'<img class="org" src="{LOGO}"' in h and 'class="acad"' in h and PROF["name"][lang].replace("&", "&amp;") in h.split("</section>")[0])
        check(f"{lang}: the cover says 'prepared for … · prepared by …' and the academy line", PROF["prepFor"] in h and "مدثر سلامه" in h.split("</section>")[0])
        check(f"{lang}: the static integration map is on page 2 with its 39 tools", h.count('class="mp-n') == 39 and "<svg" in h.split("<h2>2.")[1].split("<h2>3.")[0])
        check(f"{lang}: three decisions for management", len(re.findall(r"<li>", h.split('class="dec"')[1].split("</ol>")[0])) == 3)
        check(f"{lang}: the verification table has the eight finding types", h.split('class="vt"')[1].split("</table>")[0].count("<tr>") == 9)
        check(f"{lang}: direction and language", (f'lang="{lang}" dir="{"rtl" if lang == "ar" else "ltr"}"') in h)
        txt = re.sub(r"<[^>]+>", " ", re.sub(r"<(style|svg)[\s\S]*?</\1>", " ", h))
        check(f"{lang}: no undefined/NaN/[object Object] in the report", not bad_words(txt), bad_words(txt))
        check(f"{lang}: the standing note", ("ملخصات تفسيرية وليست النص الرسمي" if lang == "ar" else "Interpretive summaries, not the official text") in h)
        csv = pg.evaluate("rpCsv(window.__ciaLastReport.RM)")
        check(f"{lang}: the consolidated action plan CSV has one row per roadmap item ({B['n']})", csv.startswith("﻿") and len(csv.strip().split("\r\n")) == B["n"] + 1)
        st = pg.evaluate("JSON.parse(localStorage.getItem('cia-org-reports:v1'))")
        check(f"{lang}: a snapshot of the report's numbers is kept in cia-org-reports:v1", st and st["v"] == 1 and len(st["list"]) == 1 and abs(st["list"][0]["o"] - round(dash["idx"], 1)) < 0.06)
        h2 = pg.evaluate("async()=>(await ciaIntegratedReport({noOpen:true})).html")
        check(f"{lang}: the next report shows the change since the last one", ("التغير عن التقرير السابق" if lang == "ar" else "Change since the last report") in h2)
        # the real button: the report opens in a new tab and the CSV downloads
        pg.evaluate("route('#actions')"); pg.wait_for_timeout(500)
        with ctx.expect_page() as np_, pg.expect_download() as dl:
            pg.click("#acIssue")
        rp = np_.value; rp.wait_for_load_state();
        check(f"{lang}: #actions → the report opens in a new tab; the plan downloads as CSV", "cover" in rp.content() and dl.value.suggested_filename.endswith(".csv"))
        rp.close()
        check(f"{lang}: no console errors", not errs, errs[:3])
        ctx.close()
    ctx, pg, errs = hub(b, "ar", 1280, seed=EX, hash_="#dash")
    h = pg.evaluate("async()=>(await ciaIntegratedReport({noOpen:true})).html")
    cover = h.split("</section>")[0]
    check("no profile: no organization logo on the cover, and a note to register it", 'class="org"' not in cover and "لم يُسجَّل ملف المنشأة بعد" in cover)
    ctx.close()
    # the Executive Cockpit's panel offers the report (inside the hub it calls the hub)
    ctx, pg, errs = hub(b, "ar", 1280, seed=EX, profile=PROF, hash_="#m=w8/cockpit")
    pg.wait_for_timeout(2500)
    fr = pg.frame(name="modFrame") or [f for f in pg.frames if "executive-cockpit" in f.url][0]
    fr.evaluate("()=>{ const d=document.getElementById('cia-lk-w8'); if(d) d.open=true; }"); pg.wait_for_timeout(300)
    has = fr.evaluate("()=>[...document.querySelectorAll('#cia-lk-w8 button')].some(b=>b.textContent.includes('أصدر التقرير الشامل'))")
    check("Executive Cockpit: its panel offers 'Issue the integrated report'", has)
    with ctx.expect_page() as np_:
        fr.evaluate("()=>[...document.querySelectorAll('#cia-lk-w8 button')].find(b=>b.textContent.includes('أصدر التقرير الشامل')).click()")
    check("Executive Cockpit: the button issues the hub's report", "cover" in np_.value.content())
    ctx.close()
    b.close()
sys.exit(1 if save("hub-integrated-report") else 0)
