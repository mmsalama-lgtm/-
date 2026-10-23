"""Hub Guides center (#guides) — 2026-10-22. Serve the platform folder over http first (CIA_BASE, default http://127.0.0.1:8802).
Covers: the menu item, the view in AR/EN at 1280 and 390 (errors, undefined/NaN, overflow), the introduction (three kinds with their screenshots
loaded in each language, the path drawing, the note), counts against the data (every live tool with an explanation, every explanation tab),
filters and search, the knowledge-centre link, and every one of the guide links: it opens the right tool in the overlay on the right tab.
Usage: python3 tests/hub/test_guides.py"""
import os, sys, re
from playwright.sync_api import sync_playwright
BASE = os.environ.get("CIA_BASE", "http://127.0.0.1:8802")
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
results = []


def check(name, cond, detail=""):
    results.append((name, bool(cond), detail))
    print(("PASS " if cond else "FAIL ") + name + (("  -- " + str(detail)[:400]) if detail and not cond else ""), flush=True)


INIT = "try{['ar'].forEach(function(){}); localStorage.setItem('cia-lang','%s'); localStorage.setItem('cia-tour:hub','done'); localStorage.setItem('cia-hub-tour','done'); for(var k of %s) localStorage.setItem('cia-tour:m:'+k,'done'); }catch(e){}"
MODS = sorted(f[:-5] for f in os.listdir(os.path.join(ROOT, "modules")) if f.endswith(".html"))
BAD = ["undefined", "NaN", "[object Object]"]
with sync_playwright() as p:
    b = p.chromium.launch()
    for lang, w in (("ar", 1280), ("en", 1280), ("ar", 390), ("en", 390)):
        ctx = b.new_context(viewport={"width": w, "height": 900}); pg = ctx.new_page(); errs = []
        pg.on("pageerror", lambda e: errs.append(str(e)))
        ctx.route(re.compile(r"fonts\.(googleapis|gstatic)\.com"), lambda r: r.abort())
        ctx.add_init_script(INIT % (lang, str(MODS).replace("'", '"')))
        pg.goto(BASE + "/index.html#guides", wait_until="load"); pg.wait_for_timeout(900)
        tag = f"{lang} {w}px"
        check(f"{tag}: #guides opens the Guides view", pg.evaluate("curView") == "guides")
        if w == 1280:
            check(f"{tag}: the top menu has the Guides item after Tools", pg.evaluate("[...document.querySelectorAll('#nav a')].map(a=>a.getAttribute('href')).join(',')").find("#tools,#guides") >= 0)
        check(f"{tag}: the mobile menu has the Guides item", pg.evaluate("!!document.querySelector('#mNav a[href=\"#guides\"]')"))
        tx = pg.evaluate("document.getElementById('guides').innerText")
        check(f"{tag}: no undefined/NaN/[object Object]", not any(x in tx for x in BAD))
        check(f"{tag}: no horizontal overflow", pg.evaluate("document.documentElement.scrollWidth-innerWidth") <= 1, pg.evaluate("document.documentElement.scrollWidth-innerWidth"))
        n_t = pg.evaluate("gdTools().length"); n_g = pg.evaluate("gdTools().reduce((a,x)=>a+GUIDES[x.k].length,0)")
        check(f"{tag}: every live tool has its card and every explanation tab its link (39 tools, 95 guides)", n_t == 39 and n_g == 95 and pg.evaluate("document.querySelectorAll('#gdGrid .gd-card').length") == 39 and pg.evaluate("document.querySelectorAll('#gdGrid .gd-links a').length") == 95, [n_t, n_g])
        check(f"{tag}: the counter and the hero show the same numbers", ("39" in pg.evaluate("document.getElementById('gdCount').textContent") and "95" in pg.evaluate("document.getElementById('gdCount').textContent") and "95" in pg.evaluate("document.querySelector('.gd-hero .gd-stats').textContent")))
        pg.evaluate("document.querySelectorAll('.gd-kind img').forEach(i=>i.loading='eager'); [...document.querySelectorAll('.gd-kind img')].forEach(i=>i.scrollIntoView())"); pg.wait_for_timeout(700)
        imgs = pg.evaluate("[...document.querySelectorAll('.gd-kind img')].map(i=>[i.getAttribute('src'), i.naturalWidth, i.alt.length>5])")
        check(f"{tag}: three kinds of explanation with their screenshots in this language (loaded, with alt text)", len(imgs) == 3 and all(x[1] > 100 and x[2] and x[0].endswith("-" + lang + ".webp") for x in imgs), imgs)
        check(f"{tag}: the path drawing has four steps", pg.evaluate("document.querySelectorAll('.gd-path svg circle').length") == 8)
        check(f"{tag}: the note says the guides are not the official text", ("ليست النص الرسمي" if lang == "ar" else "not the official text") in pg.evaluate("document.querySelector('.gd-note').textContent"))
        if w == 1280 and lang == "ar":
            pg.evaluate("document.querySelector('#gdF .chip[data-f=\"aud\"]').click()"); pg.wait_for_timeout(100)
            check("filter: Audit & Improvement shows its 16 tools only", pg.evaluate("document.querySelectorAll('#gdGrid .gd-card').length") == 16 and pg.evaluate("[...document.querySelectorAll('#gdGrid .gd-card')].every(c=>c.style.getPropertyValue('--c').includes('c-aud'))"))
            pg.evaluate("document.querySelector('#gdF .chip[data-f=\"all\"]').click()")
            pg.fill("#gdQ", "دليل البنود"); pg.wait_for_timeout(100)
            n1 = pg.evaluate("document.querySelectorAll('#gdGrid .gd-card').length")
            check("search: 'دليل البنود' narrows the list", 0 < n1 < 39, n1)
            pg.fill("#gdQ", "zzzz-nothing"); pg.wait_for_timeout(100)
            check("search: no match shows the empty message", pg.evaluate("document.querySelectorAll('#gdGrid .gd-card').length") == 0 and not pg.evaluate("document.getElementById('gdNone').hidden"))
            pg.fill("#gdQ", ""); pg.wait_for_timeout(100)
            pg.evaluate("route('#learn')"); pg.wait_for_timeout(150)
            check("knowledge centre links to the Guides center", pg.evaluate("document.getElementById('kGd').getAttribute('href')") == "#guides" and pg.evaluate("document.getElementById('kGd').textContent").strip() != "")
            pg.evaluate("document.getElementById('kGd').click()"); pg.wait_for_timeout(150)
            check("the knowledge-centre link opens the Guides view", pg.evaluate("curView") == "guides")
            pg.evaluate("document.getElementById('langBtn').click()"); pg.wait_for_timeout(300)
            check("switching language re-renders the view in English", pg.evaluate("document.getElementById('gdTitle').textContent") == "Guides center" and pg.evaluate("document.querySelector('.gd-kind img').getAttribute('src')").endswith("-en.webp"))
            pg.evaluate("document.getElementById('langBtn').click()"); pg.wait_for_timeout(300)
            # every guide link opens the right tool on the right tab
            links = pg.evaluate("[...document.querySelectorAll('#gdGrid .gd-links a')].map(a=>[a.dataset.mod,a.dataset.anchor])")
            bad = []
            for i, (k, a) in enumerate(links):
                pg.evaluate(f"document.querySelectorAll('#gdGrid .gd-links a')[{i}].click()")
                try:
                    pg.wait_for_function("([k,a])=>{ const f=document.getElementById('modFrame'); if(f.dataset.k!==k) return false; try{ const d=f.contentDocument, p=d&&d.querySelector('[data-tab=\"'+a+'\"]'); return !!p && p.offsetParent!==null && d.readyState==='complete'; }catch(e){ return false; } }", arg=[k, a], timeout=10000)
                    ok = pg.evaluate("document.getElementById('modOverlay').classList.contains('on')") and pg.evaluate("location.hash") == f"#m={k}/{a}"
                except Exception:
                    ok = False
                if not ok: bad.append(f"{k}#{a}")
                pg.evaluate("closeModule()"); pg.wait_for_timeout(80)
            check(f"all {len(links)} guide links open the tool in the overlay on its explanation tab", not bad and len(links) == 95, bad)
            kinds = pg.evaluate("[...document.querySelectorAll('.gd-kind a[data-mod]')].map(a=>a.dataset.mod+'#'+a.dataset.anchor)")
            check("the three 'try it' links open ISO 9001 on the method guide and the clause guide", kinds == ["iso9001#explain-std", "iso9001#explain-cl", "iso9001#explain-cl"], kinds)
        check(f"{tag}: no page errors", not errs, errs[:3])
        ctx.close()
    b.close()
failed = [r for r in results if not r[1]]
print(f"\n{len(results) - len(failed)}/{len(results)} passed")
sys.exit(1 if failed else 0)
