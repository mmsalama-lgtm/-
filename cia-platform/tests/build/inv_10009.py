"""Inventory of ISO 10009:2024, built from the official PDF (step 10.1, 2026-10-16). The PDF itself is not part of the package (copyright
of ISO); this script reads it when it is available and writes tests/iso10009/inventory_10009.json, which the tests compare with the module.
    python3 tests/build/inv_10009.py [path/to/ISO-10009-2024-Quality-Management-Guidance-for-Quality-Tools.pdf]
Without a PDF the stored JSON is kept as it is. Only numbers, titles of numbered items and the names in the "other relevant tools" lists
are recorded (no text of the standard). Recorded:
  clauses        — the 16 numbered clauses with their titles (table of contents)
  subclauses     — every numbered subclause (4.1, 4.2, 5.1 … 16.3, including 5.4.1, 5.4.2 and 13.1) with its title
  other          — for each "other relevant tools" subclause, the names it lists
  tables         — the numbered tables of benefits and points to note (Table 5.1 … 16.2), with the subclause each belongs to
  figures        — Figures 1 to 17 with the subclause each belongs to, and Figures B.1 to B.3
  annex          — Annex A tables A.1–A.3, Annex B figures, Annex C Table C.1 (its 53 rows by number)
  bibliography   — the number of references, and for each subclause the reference numbers it cites"""
import os, re, sys, json, subprocess

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
OUT = os.path.join(ROOT, "tests", "iso10009", "inventory_10009.json")
pdf = sys.argv[1] if len(sys.argv) > 1 else os.environ.get("CIA_10009_PDF", "")
if not pdf or not os.path.exists(pdf):
    print("no PDF given: keeping", os.path.relpath(OUT, ROOT)); sys.exit(0)
txt = subprocess.run(["pdftotext", "-layout", pdf, "-"], capture_output=True, text=True, check=True).stdout
lines = txt.split("\n")
toc = [l for l in lines[:260] if re.search(r"\.{5,}", l)]
CL, SUB = [], []
for l in toc:
    m = re.match(r"^\s*(\d+(?:\.\d+)*)\s+(.+?)\s*\.{3,}", l.replace("​", "").replace("\t", " "))
    if not m:
        continue
    code, title = m.group(1), re.sub(r"\s+", " ", m.group(2)).strip()
    (CL if "." not in code else SUB).append([code, title])
assert len(CL) == 16, CL
body_i = [i for i, l in enumerate(lines) if l.strip() == "1 Scope"][-1]
annex_i = [i for i, l in enumerate(lines) if l.strip() == "Annex A"][0]
heads = []
ORDER = sorted([c for c, _ in CL + SUB], key=lambda x: [int(y) for y in x.split(".")])   # headings come in this order in the body
nxt = 0
for i in range(body_i, annex_i):
    s = lines[i].strip().replace("​", "").replace("\t", " ")
    m = re.match(r"^(\d+(?:\.\d+)*)\s+(\S.*)$", s)
    if m and nxt < len(ORDER) and m.group(1) in ORDER[nxt:nxt + 3] and len(s) < 100 and not s.endswith("."):
        nxt = ORDER.index(m.group(1)) + 1
        heads.append((i, m.group(1)))
assert nxt == len(ORDER), (nxt, ORDER[nxt:nxt + 3])
heads.append((annex_i, "A"))


def sec(code):
    k = [j for j, (i, c) in enumerate(heads) if c == code][0]
    return lines[heads[k][0] + 1:heads[k + 1][0]]


OTHER = {}
for c, t in SUB:
    if t.lower().startswith("other relevant tools"):
        names, cur = [], None
        for l in sec(c):
            s = l.strip()
            if s.startswith("—"):
                if cur: names.append(cur)
                cur = s[1:].strip()
            elif cur and s and not re.match(r"^(\d+|©|BS ISO|ISO 10009|Figure|﻿)", s):
                cur += " " + s
        if cur: names.append(cur)
        if not names:  # one sentence ("Other relevant resources include the balanced scorecard (BSC).")
            names = [re.sub(r"^.*include (the )?", "", " ".join(x.strip() for x in sec(c) if x.strip())).split("[")[0].rstrip(". ")]
        OTHER[c] = [re.sub(r"\[[\d,\- ]+\]|;$|\.$", "", n).strip(" ;.") for n in names]
TABLES, FIGS, REFS = [], [], {}
cur = None
for i in range(body_i, annex_i):
    s = lines[i].strip()
    for code in [c for j, c in heads if j == i]:
        cur = code
    m = re.match(r"^Table (\d+\.\d+) — ", s)
    if m: TABLES.append([m.group(1), cur])
    m = re.match(r"^Figure (\d+) — ", s)
    if m: FIGS.append([m.group(1), cur])
    for r in re.findall(r"\[([\d,\-\s]+)\]", lines[i]):
        for part in r.split(","):
            part = part.strip()
            if not part: continue
            a = part.split("-")
            nums = range(int(a[0]), int(a[-1]) + 1) if a[0].isdigit() and a[-1].isdigit() else []
            for n in nums:
                REFS.setdefault(cur or "intro", set()).add(n)
bib_i = [i for i, l in enumerate(lines) if l.strip() == "Bibliography"][-1]
NBIB = max(int(m.group(1)) for m in (re.match(r"^\[(\d+)\]", l.strip()) for l in lines[bib_i:]) if m)
FB = sorted(set(re.findall(r"Figure (B\.\d) — ", txt)))
TA = sorted(set(re.findall(r"Table (A\.\d) — ", txt)))
c1_i = [i for i, l in enumerate(lines) if re.search(r"Table C\.1 — ", l)][0]
C1 = sorted(set(re.findall(r"^\s{20,}(\d+\.\d+)\s{3,}\S", "\n".join(lines[c1_i:bib_i]), re.M)), key=lambda x: [int(y) for y in x.split(".")])
inv = {"source": os.path.basename(pdf), "edition": "BS ISO 10009:2024 (first edition 2024-06)", "built": "2026-10-16",
       "clauses": CL, "subclauses": SUB, "other": OTHER, "tables": TABLES, "figures": FIGS + [[f, "B"] for f in FB],
       "annex": {"A": TA, "B": FB, "C1": C1}, "bibliography": {"n": NBIB, "cited": {k: sorted(v) for k, v in sorted(REFS.items())}}}
json.dump(inv, open(OUT, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print("clauses", len(CL), "subclauses", len(SUB), "other lists", len(OTHER), "names", sum(len(v) for v in OTHER.values()),
      "tables", len(TABLES), "figures", len(FIGS), "+", len(FB), "annex A", TA, "C.1 rows", len(C1), "bibliography", NBIB)
