"""Step 15 (2026-10-22), Part D: the author's name is "مدثر سلامه" everywhere (the standing rule of the project).
    python3 tests/build/patch_author_name.py        (every module and index.html; after the step-15 patches)
The English interface and report texts of 25 older tools (and 7 hub strings) said "Modather Salama"; they now say "مدثر سلامه". Three phrasings
are reworded so the sentence reads well ("in Modather Salama's toolkit" → "in the toolkit by مدثر سلامه"; "and Modather Salama's name" →
"and the name مدثر سلامه"). Example data is left exactly as it was (the assessor / lead pairs such as B("مدثر سلامه","Modather Salama") and
"… — independent assessor"), so no stored state changes. No question, score, key or CSV column changes."""
import os, re, glob
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
KEEP = re.compile(r'(B\("مدثر سلامه","Modather Salama"\)|","Modather Salama — (?:independent|lead) assessor")')
n = 0
for p in sorted(glob.glob(os.path.join(ROOT, "modules", "*.html"))) + [os.path.join(ROOT, "index.html")]:
    s = open(p, encoding="utf-8").read(); s0 = s
    parts = KEEP.split(s)
    for i in range(0, len(parts), 2):
        t = parts[i]
        t = t.replace("assistant in Modather Salama's toolkit", "assistant in the toolkit by مدثر سلامه")
        t = t.replace("and Modather Salama's name", "and the name مدثر سلامه")
        t = t.replace("Modather Salama", "مدثر سلامه")
        parts[i] = t
    s = "".join(parts)
    if s != s0:
        c = s0.count("Modather Salama") - s.count("Modather Salama"); n += c
        open(p, "w", encoding="utf-8").write(s); print(os.path.relpath(p, ROOT), c)
print("replaced", n)
