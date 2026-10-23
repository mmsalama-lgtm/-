"""Step 15 (2026-10-22), Part D: WCAG 2.1 AA contrast in the hub. The light theme's muted text colour (#6F7B93, 4.25:1 on white) becomes
#5B677F (5.6:1 on white, 5.2:1 on the page background); the dark theme is unchanged. Found by axe-core on #dash, #map, #actions, #profile.
    python3 tests/build/patch_hub_a11y.py index.html"""
import os, sys
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
path = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, "index.html")
s = open(path, encoding="utf-8").read()
a = "--ink-soft:#4B5874; --muted:#6F7B93;"
if a in s:
    assert s.count(a) == 1; s = s.replace(a, "--ink-soft:#4B5874; --muted:#5B677F;"); open(path, "w", encoding="utf-8").write(s); print("index.html: muted text colour meets 4.5:1")
else: print("already applied")
