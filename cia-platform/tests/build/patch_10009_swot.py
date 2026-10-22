"""Step 2026-10-17 (SWOT): the ISO 10009 guide names the SWOT tool as the dedicated platform tool for 5.1. Edits the guide's sources
(cat_10009.py and qt_host.js); then build_10009.py rebuilds modules/iso10009.html. Every anchor must match once.
    python3 tests/build/patch_10009_swot.py && python3 tests/build/build_10009.py
- cat_10009.py: 5.1 platform links become [swot/tools own, str/swot in, str/tows in] (the "planned" marker goes, SWOT is live); FILES and NAMES
  gain "swot". The tool's "own" field stays "" and REC_KEYS is unchanged: a storyboard step on 5.1 does not become linkable to a SWOT study, so the
  example's audit, the CSV and the stored state stay identical (tests/swot/iso10009_regress.py). Linking storyboard steps to SWOT studies is left
  to the close-out step.
- qt_host.js: the assistant's coverage answer (6 → 7 dedicated tools, 14 → 13 inside platform tools) names SWOT 5.1."""
import os, sys
HERE = os.path.dirname(os.path.abspath(__file__))


def patch(name, edits, done_mark):
    p = os.path.join(HERE, name); s = open(p, encoding="utf-8").read()
    if done_mark in s:
        print(name, "already patched"); return
    for a, b in edits:
        n = s.count(a); assert n == 1, (name, n, a[:90]); s = s.replace(a, b)
    open(p, "w", encoding="utf-8").write(s); print(name, "patched:", len(edits), "edits")


patch("cat_10009.py", [
    ('     [P("str", "swot", "in"), P("str", "tows", "in"), P("", "", "plan")],',
     '     [P("swot", "tools", "own"), P("str", "swot", "in"), P("str", "tows", "in")],'),
    ('"a3": "a3.html", "dmaic": "dmaic.html", "fmea": "fmea.html", "str": "strategy-performance.html",',
     '"a3": "a3.html", "dmaic": "dmaic.html", "fmea": "fmea.html", "swot": "swot.html", "str": "strategy-performance.html",'),
    ('"fmea": B("دراسة FMEA", "FMEA study"),\n',
     '"fmea": B("دراسة FMEA", "FMEA study"), "swot": B("دراسة SWOT", "SWOT study"),\n'),
], 'P("swot", "tools", "own")')
patch("qt_host.js", [
    ('من الـ 53 أداة: **6 أدوات مستقلة** (FMEA 7.3، وباريتو 13.7،', 'من الـ 53 أداة: **7 أدوات مستقلة** (SWOT 5.1، وFMEA 7.3، وباريتو 13.7،'),
    ('و**14 داخل أدوات المنصة** (مثل SWOT وPESTLE في استوديو الاستراتيجية،', 'و**13 داخل أدوات المنصة** (مثل PESTLE في استوديو الاستراتيجية،'),
    ('Of the 53 tools: **6 dedicated tools** (FMEA 7.3, Pareto 13.7,', 'Of the 53 tools: **7 dedicated tools** (SWOT 5.1, FMEA 7.3, Pareto 13.7,'),
    ('**14 inside platform tools** (such as SWOT and PESTLE in the strategy studio,', '**13 inside platform tools** (such as PESTLE in the strategy studio,'),
], '**7 dedicated tools** (SWOT 5.1')
