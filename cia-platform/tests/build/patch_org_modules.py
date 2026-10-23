"""Step 15 (2026-10-22): carry the organization profile kit into every tool.
    python3 tests/build/patch_org_modules.py            (after tests/build/org/build_kit.py; every file in modules/)
Inserts <style id="cia-org-css"> and <script id="cia-org-js"> from templates/org-profile-kit.html, byte-identical, just before the closing
</body> of each tool (anchor: the file's last "</script>\\n</body>\\n</html>", matched exactly once). The kit runs after the tool's own scripts:
it wraps the tool's report branding (brandHeaderHTML or TBX.reportDoc) so that a report carries the organization's cover when a profile
exists, and leaves every byte of the report unchanged when none exists. Re-running replaces the blocks with the current template."""
import os, re, sys
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
tpl = open(os.path.join(ROOT, "templates", "org-profile-kit.html"), encoding="utf-8").read()
def block(s, tag, id_):
    i = s.find('<%s id="%s">' % (tag, id_)); j = s.find('</%s>' % tag, i); return s[i:j + len(tag) + 3]
CSS, JS = block(tpl, "style", "cia-org-css"), block(tpl, "script", "cia-org-js")
files = sys.argv[1:] or sorted(os.path.join(ROOT, "modules", f) for f in os.listdir(os.path.join(ROOT, "modules")) if f.endswith(".html"))
ANCHOR = "</script>\n</body>\n</html>"
for p in files:
    s = open(p, encoding="utf-8").read()
    for tag, id_ in (("style", "cia-org-css"), ("script", "cia-org-js")):   # re-run: drop the previous copy
        old = block(s, tag, id_) if ('<%s id="%s">' % (tag, id_)) in s else None
        if old: s = s.replace(old + "\n", "", 1)
    assert s.count(ANCHOR) == 1 and s.rstrip("\n").endswith(ANCHOR), (p, s.count(ANCHOR))
    s = s.replace(ANCHOR, "</script>\n" + CSS + "\n" + JS + "\n</body>\n</html>")
    open(p, "w", encoding="utf-8").write(s)
print(len(files), "tools carry the organization profile kit")
