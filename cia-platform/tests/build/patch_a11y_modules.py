"""Step 15 (2026-10-22), Part D: WCAG 2.1 AA basics in the 39 tools' shared shell (found by axe-core; tests/platform/results/axe.json).
    python3 tests/build/patch_a11y_modules.py        (every module)
- Toolbox tools (14): the side menu is a tab list — <aside id="side"> gains role="tablist" aria-orientation="vertical" and its buttons
  role="tab", which makes their aria-selected valid. The kit-based tools build their menu in script with links that are not tabs: unchanged.
- The muted text colour #7A869E (3.7:1 on white) becomes #5B677F (5.6:1). Nothing else changes: no text, state, report or CSV."""
import os, re, glob
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
A = '<aside class="side" id="side" aria-label="Tabs">'
for p in sorted(glob.glob(os.path.join(ROOT, "modules", "*.html"))):
    s = open(p, encoding="utf-8").read()
    if "--muted:#5B677F" in s: continue
    assert s.count(A) == 1 and s.count("--muted:#7A869E") == 1, p
    i = s.find(A); j = s.find("</aside>", i)
    side = s[i:j]
    if 'data-go="' in side:   # toolbox shell: every control in the side menu is a tab (the kit-based tools build theirs with other links: unchanged)
        side = side.replace(A, '<aside class="side" id="side" aria-label="Tabs" role="tablist" aria-orientation="vertical">')
    side = re.sub(r'<button type="button" data-go="', '<button type="button" role="tab" data-go="', side)
    s = s[:i] + side + s[j:]
    s = s.replace("--muted:#7A869E", "--muted:#5B677F")
    open(p, "w", encoding="utf-8").write(s)
print("side menus are tab lists; muted text meets 4.5:1")
