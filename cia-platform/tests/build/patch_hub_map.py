"""Step 15 (2026-10-22), Part 0: the integration map in the hub (index.html, #map), built from data.
    python3 tests/build/patch_hub_map.py index.html        (after links_inventory.py, which writes links.json and link_types.json)
- Menu item "Integration map / خريطة التكامل" after Guides (both menu data blocks).
- The view: an interactive SVG mind map, mirrored for Arabic — the organization profile at the centre, the cycle Profile → Assess → Analyse →
  Improve → Monitor → Re-assess around it, the seven systems as branches with every tool as a node. Hover, focus or tap highlights the tools a
  node reads and the tools that read it, with the link type; a click opens the tool in the overlay. A side list shows "feeds → / fed by ←" and a
  legend; under 760 px the map becomes collapsible branches. mapSVG({static:true}) draws the same map for the integrated report.
- CIA_LINKS = tests/build/link_types.json, embedded at build time. No tool, adapter, snapshot or count changes."""
import os, sys, json
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
path = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, "index.html")
s = open(path, encoding="utf-8").read()
if 'data-view="map"' in s: print("integration map already present; nothing to do"); sys.exit(0)
def rep(old, new, times=1):
    global s
    n = s.count(old); assert n == times, (n, old[:120]); s = s.replace(old, new)
T = json.load(open(os.path.join(HERE, "link_types.json")))
data = "const CIA_LINKS = " + json.dumps(T, separators=(",", ":")) + ";"
js = open(os.path.join(HERE, "org", "hub_map.js"), encoding="utf-8").read().replace("__CIA_LINKS__", data)
rep('["guides","Guides"],["systems","Systems"]', '["guides","Guides"],["map","Integration map"],["systems","Systems"]', 2)
rep('["guides","الشروح"],["systems","المنظومات"]', '["guides","الشروح"],["map","خريطة التكامل"],["systems","المنظومات"]', 2)
rep('''  <section id="profile" class="band" data-view="profile" hidden''', '''  <section id="map" class="band" data-view="map" hidden aria-labelledby="mpTitle">
    <div class="wrap">
      <div class="sec-head"><div><h2 id="mpTitle"></h2><p id="mpSub"></p></div><div class="mp-stats" id="mpStats"></div></div>
      <div class="mp-grid"><div class="mp-wrap" id="mpWrap"></div><aside class="mp-aside"><div class="mp-side" id="mpSide" aria-live="polite"></div><div class="mp-leg" id="mpLeg"></div></aside></div>
      <div class="mp-list" id="mpList"></div>
    </div>
  </section>

  <section id="profile" class="band" data-view="profile" hidden''')
rep('/* views of step 15:', js.strip() + '\n\n/* views of step 15:')
open(path, "w", encoding="utf-8").write(s)
print("index.html: integration map (#map) with", sum(len(v) for v in T.values()), "links")
