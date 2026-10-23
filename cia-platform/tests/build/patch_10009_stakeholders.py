"""Step 2026-10-17 (Stakeholder Analysis): the ISO 10009 guide names the stakeholder tool as a related platform link ("rel") for 6.5 (RACI: the
consulted and informed interested parties) and for the 5.5 "other relevant tools" entry on the context of the organization (COTO) log. Edits the
guide's catalogue only (cat_10009.py); then build_10009.py rebuilds modules/iso10009.html. Every anchor must match once.
    python3 tests/build/patch_10009_stakeholders.py && python3 tests/build/build_10009.py
- 6.5 keeps its level ("in", through the Operations Excellence Center's RACI); a "rel" link adds a platform name to the card and the report row only.
- The 5.5 COTO entry is an "other relevant tool", not one of the 53 tools: it gains a related link, the coverage counts do not change.
- FILES and NAMES gain "stakeholders". The tool's "own" field stays "" and REC_KEYS is unchanged: no storyboard step becomes linkable to a
  stakeholder register, so the example's stored state, CSV, audit and self-assessment stay identical (tests/stakeholders/iso10009_regress.py).
- The assistant's coverage answer (qt_host.js) is unchanged: 8 dedicated / 12 inside. The hub's qtAd is not touched."""
import os
HERE = os.path.dirname(os.path.abspath(__file__))


def patch(name, edits, done_mark):
    p = os.path.join(HERE, name); s = open(p, encoding="utf-8").read()
    if done_mark in s:
        print(name, "already patched"); return
    for a, b in edits:
        n = s.count(a); assert n == 1, (name, n, a[:90]); s = s.replace(a, b)
    open(p, "w", encoding="utf-8").write(s); print(name, "patched:", len(edits), "edits")


patch("cat_10009.py", [
    ('     [P("oec", "raci", "in")],', '     [P("oec", "raci", "in"), P("stakeholders", "tools", "rel")],'),
    ('("5.5", B("مخطط/مصفوفة/سجل سياق المنشأة (COTO)", "Context of the organization (COTO) diagram/matrix/log"), []),',
     '("5.5", B("مخطط/مصفوفة/سجل سياق المنشأة (COTO)", "Context of the organization (COTO) diagram/matrix/log"), [P("stakeholders", "tools", "rel")]),'),
    ('"swot": "swot.html", "pestle": "pestle.html",', '"swot": "swot.html", "pestle": "pestle.html", "stakeholders": "stakeholders.html",'),
    ('"pestle": B("مسح PESTLE", "PESTLE scan"),\n', '"pestle": B("مسح PESTLE", "PESTLE scan"), "stakeholders": B("سجل الأطراف المعنية", "Stakeholder register"),\n'),
], 'P("stakeholders", "tools", "rel")')
