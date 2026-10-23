"""Integration map (#map) — step 15, 2026-10-22. Serve the platform over http first (CIA_BASE, default http://127.0.0.1:8802).
Covers: the menu item after Guides; the map is built from tests/build/link_types.json (same links, same types as links.json); every one of the
39 nodes opens its tool in the overlay; hovering a node highlights exactly the tools it reads and the tools that read it; the side list matches;
the map is mirrored in Arabic; under 760 px it is collapsible branches; AR/EN at 1280 and 390 without errors, undefined/NaN or overflow.
Usage: python3 tests/hub/test_map.py"""
import os, sys, json
sys.path.insert(0, os.path.dirname(__file__))
from hubkit import *  # noqa

T = json.load(open(os.path.join(ROOT, "tests", "build", "link_types.json")))
LJ = json.load(open(os.path.join(ROOT, "tests", "build", "links.json")))
check("link_types.json and links.json name the same links", all(sorted(x for x, _ in T[k]) == sorted(LJ[k]) for k in LJ) and set(T) == set(LJ))
N = sum(len(v) for v in T.values())
with sync_playwright() as p:
    b = launch(p)
    pos = {}
    for lang, w in (("ar", 1280), ("en", 1280), ("ar", 390), ("en", 390)):
        ctx, pg, errs = hub(b, lang, w, hash_="#map")
        tag = f"{lang} {w}px"
        check(f"{tag}: #map opens the integration map", pg.evaluate("curView") == "map")
        tx = pg.evaluate("document.getElementById('map').innerText")
        check(f"{tag}: no undefined/NaN/[object Object]", not bad_words(tx), bad_words(tx))
        check(f"{tag}: no horizontal overflow", overflow(pg) <= 1, overflow(pg))
        check(f"{tag}: the mobile menu has the map item", pg.evaluate("!!document.querySelector('#mNav a[href=\"#map\"]')"))
        if w == 1280:
            check(f"{tag}: the top menu has the map item after Guides", "#guides,#map" in pg.evaluate("[...document.querySelectorAll('#nav a')].map(a=>a.getAttribute('href')).join(',')"))
            check(f"{tag}: the map embeds every link of link_types.json ({N})", pg.evaluate("mapEdges().length") == N and pg.evaluate("document.querySelectorAll('#mpWrap .mp-e').length") == N)
            check(f"{tag}: 39 tool nodes, 7 branches, the 6-step cycle and the centre", pg.evaluate("document.querySelectorAll('#mpWrap .mp-n').length") == 39 and pg.evaluate("document.querySelectorAll('#mpWrap .mp-sys').length") == 7 and pg.evaluate("document.querySelectorAll('#mpWrap .mp-cy').length") == 6)
            check(f"{tag}: the counters equal the data", str(N) in pg.evaluate("document.getElementById('mpStats').innerText"))
            check(f"{tag}: legend lists the four link types and the profile", pg.evaluate("document.querySelectorAll('#mpLeg li').length") == 5)
            pos[lang] = pg.evaluate("Object.fromEntries([...document.querySelectorAll('#mpWrap .mp-n')].map(n=>{ const r=n.querySelector('rect'); return [n.dataset.k, +r.getAttribute('x') + +r.getAttribute('width')/2]; }))")
            pg.set_viewport_size({"width": 1280, "height": 1600}); pg.evaluate("document.documentElement.style.scrollBehavior='auto'; scrollTo(0,0)"); pg.wait_for_timeout(200)
            bad = []
            for k in T:
                pg.hover(f'#mpWrap .mp-n[data-k="{k}"] rect'); pg.wait_for_timeout(30)
                on = pg.evaluate("[...document.querySelectorAll('#mpWrap .mp-e.on')].map(e=>e.dataset.s+'>'+e.dataset.t).sort()")
                exp = sorted([s + ">" + k for s, _ in T[k]] + [k + ">" + t for t in T for s, _ in T[t] if s == k])
                side = pg.evaluate("document.querySelectorAll('#mpSide li').length")
                if on != exp or side != len(exp): bad.append((k, len(on), len(exp), side))
            check(f"{tag}: hovering each node highlights exactly its links (reads and read by) and the side list matches", not bad, bad[:5])
            if lang == "ar":
                bad = []
                for k in ("iso9001", "capa", "w8", "str", "pmo"):
                    pg.click(f'#mpWrap .mp-n[data-k="{k}"] rect'); pg.wait_for_timeout(600)
                    if pg.evaluate("document.getElementById('modFrame').dataset.k") != k or not pg.evaluate("document.getElementById('modOverlay').classList.contains('on')"): bad.append(k)
                    pg.evaluate("closeModule()"); pg.wait_for_timeout(250); pg.evaluate("route('#map')"); pg.wait_for_timeout(250)
                check(f"{tag}: a click on a node opens its tool in the overlay (5 sampled by click)", not bad, bad)
                bad = []
                for k in T:
                    pg.evaluate(f"document.querySelector('#mpWrap .mp-n[data-k=\"{k}\"]').dispatchEvent(new KeyboardEvent('keydown',{{key:'Enter',bubbles:true}}))")
                    try: pg.wait_for_function(f"document.getElementById('modFrame').dataset.k==='{k}'", timeout=4000)
                    except Exception: bad.append(k)
                    pg.evaluate("closeModule(false)"); pg.wait_for_timeout(40)
                check(f"{tag}: every one of the 39 nodes opens its tool (keyboard Enter)", not bad, bad)
        else:
            check(f"{tag}: on a phone the map is collapsible branches (7)", pg.evaluate("getComputedStyle(document.getElementById('mpList')).display") != "none" and pg.evaluate("document.querySelectorAll('#mpList details.mp-br').length") == 7)
            pg.evaluate("document.querySelector('#mpList details.mp-br').open=true; document.querySelector('#mpList details.mp-tl').open=true"); pg.wait_for_timeout(150)
            check(f"{tag}: a tool opened in a branch lists what it feeds and what feeds it, with an open button", pg.evaluate("!!document.querySelector('#mpList .mp-tlb a[data-mod]')"))
            check(f"{tag}: no overflow with a branch open", overflow(pg) <= 1, overflow(pg))
        check(f"{tag}: no console errors", not errs, errs[:3])
        ctx.close()
    if "ar" in pos and "en" in pos:
        bad = [k for k in pos["en"] if abs(pos["ar"][k] - (1200 - pos["en"][k])) > 0.5]
        check("the Arabic map is the English one mirrored (every node)", not bad, bad[:5])
    b.close()
sys.exit(1 if save("hub-map") else 0)
