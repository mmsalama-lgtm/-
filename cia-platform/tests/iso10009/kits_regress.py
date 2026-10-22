"""ISO 10009 step: Fishbone, Pareto, RCA, A3 and DMAIC changed only inside their Explain Kit data block (the ISO 10009 references).
Compares each file with the previous release (CIA_ORIG_DIR, default /home/claude/orig): every byte outside
<script id="cia-explain-data"> is identical, the data block still parses, and no "ISO 10009 ... not uploaded" sentence is left.
Stored state, reports, CSV and audit are compared at run time by tests/platform/t_regress.py.   Usage: python3 tests/iso10009/kits_regress.py"""
import os, re, subprocess, tempfile
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
ORIG = os.environ.get("CIA_ORIG_DIR", "/home/claude/orig")
res = []
def check(n, c, d=""):
    res.append(bool(c)); print(("PASS " if c else "FAIL ") + n + ("" if c else "  -- " + str(d)[:300]), flush=True)
def split(s):
    a = s.find('<script id="cia-explain-data">'); b = s.find("</script>", a)
    return s[:a], s[a:b], s[b:]
for f in ("fishbone", "pareto", "rca", "a3", "dmaic"):
    old = open(os.path.join(ORIG, "modules", f + ".html"), encoding="utf-8").read()
    new = open(os.path.join(ROOT, "modules", f + ".html"), encoding="utf-8").read()
    o, n = split(old), split(new)
    check(f"{f}: identical outside the kit data block", o[0] == n[0] and o[2] == n[2])
    check(f"{f}: kit data block changed", o[1] != n[1])
    t = tempfile.NamedTemporaryFile("w", suffix=".js", delete=False, encoding="utf-8"); t.write(n[1][len('<script id="cia-explain-data">'):]); t.close()
    check(f"{f}: kit data still parses", subprocess.run(["node", "--check", t.name], capture_output=True).returncode == 0)
    check(f"{f}: names the ISO 10009:2024 subclause", "ISO 10009:2024" in n[1])
    check(f"{f}: no sentence still says ISO 10009 is not uploaded", not re.search(r"ISO 10009(?!:2024)[^.]{0,80}(not uploaded|غير مرفوع)", n[1]), re.findall(r".{40}ISO 10009(?!:2024).{60}", n[1])[:2])
print(f"== kits-10009-regress: {sum(res)}/{len(res)} passed")
