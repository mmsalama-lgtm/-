"""Step 15 (2026-10-22): the top menu keeps fitting at 1280 px with the two new views (Integration map, Follow-up).
    python3 tests/build/patch_hub_nav.py index.html        (after patch_hub_report.py)
The desktop menu (navTop) leaves out "Systems" and "Follow-up" as it already left out "Start here" and "FAQ"; all four stay in the mobile
menu and the search (Ctrl K); Systems stays on the home page and Follow-up gets a button in the dashboard's actions. Short desktop labels:
"الخريطة" / "Map", "Request", "References"."""
import os, sys
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
path = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, "index.html")
s = open(path, encoding="utf-8").read()
a = 'UI.en.navTop = UI.en.nav.filter(([h])=>h!=="start" && h!=="faq"); UI.ar.navTop = UI.ar.nav.filter(([h])=>h!=="start" && h!=="faq");'
if a in s:
    assert s.count(a) == 1
    s = s.replace(a, '''const NAV_OFF = ["start","faq","systems","actions"], NAV_SHORT = {en:{map:"Map", request:"Request", refs:"References"}, ar:{map:"الخريطة"}};
UI.en.navTop = UI.en.nav.filter(([h])=>!NAV_OFF.includes(h)).map(([h,t])=>[h, NAV_SHORT.en[h]||t]); UI.ar.navTop = UI.ar.nav.filter(([h])=>!NAV_OFF.includes(h)).map(([h,t])=>[h, NAV_SHORT.ar[h]||t]);''')
    b = '''    <button type="button" class="d-btn gold" id="dIssue">${esc(ACU[L].issue)}</button>`;'''
    assert s.count(b) == 1
    s = s.replace(b, '''    <button type="button" class="d-btn gold" id="dIssue">${esc(ACU[L].issue)}</button>
    <a class="d-btn" href="#actions" id="dFollow">${esc(ACU[L].title)}</a>`;''')
    open(path, "w", encoding="utf-8").write(s); print("index.html: the desktop menu fits")
else: print("already applied")
