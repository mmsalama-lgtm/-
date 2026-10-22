"""Step 2026-10-17 (PESTLE): the ISO 10009 guide names the PESTLE tool as the dedicated platform tool for 5.2. Edits the guide's sources
(cat_10009.py and qt_host.js); then build_10009.py rebuilds modules/iso10009.html. Every anchor must match once.
    python3 tests/build/patch_10009_pestle.py && python3 tests/build/build_10009.py
- cat_10009.py: 5.2 platform links become [pestle/tools own, str/pestle in] (the "planned" marker goes, PESTLE is live); FILES and NAMES gain
  "pestle". The tool's "own" field stays "" and REC_KEYS is unchanged: a storyboard step on 5.2 does not become linkable to a PESTLE scan, so the
  example's audit, the CSV and the stored state stay identical (tests/pestle/iso10009_regress.py). Linking storyboard steps to PESTLE scans is
  left to the close-out step.
- qt_host.js: the assistant's coverage answer (7 → 8 dedicated tools, 13 → 12 inside platform tools) names PESTLE 5.2.
The hub's qtAd is not touched, so the snapshot the hub reads for the guide stays the same."""
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
    ('     [P("str", "pestle", "in"), P("", "", "plan")],',
     '     [P("pestle", "tools", "own"), P("str", "pestle", "in")],'),
    ('"fmea": "fmea.html", "swot": "swot.html", "str": "strategy-performance.html",',
     '"fmea": "fmea.html", "swot": "swot.html", "pestle": "pestle.html", "str": "strategy-performance.html",'),
    ('"swot": B("دراسة SWOT", "SWOT study"),\n',
     '"swot": B("دراسة SWOT", "SWOT study"), "pestle": B("مسح PESTLE", "PESTLE scan"),\n'),
], 'P("pestle", "tools", "own")')
patch("qt_host.js", [
    ('من الـ 53 أداة: **7 أدوات مستقلة** (SWOT 5.1، وFMEA 7.3،', 'من الـ 53 أداة: **8 أدوات مستقلة** (SWOT 5.1، وPESTLE 5.2، وFMEA 7.3،'),
    ('و**13 داخل أدوات المنصة** (مثل PESTLE في استوديو الاستراتيجية، وSIPOC وRACI', 'و**12 داخل أدوات المنصة** (مثل SIPOC وRACI'),
    ('Of the 53 tools: **7 dedicated tools** (SWOT 5.1, FMEA 7.3,', 'Of the 53 tools: **8 dedicated tools** (SWOT 5.1, PESTLE 5.2, FMEA 7.3,'),
    ('**13 inside platform tools** (such as PESTLE in the strategy studio, SIPOC and RACI', '**12 inside platform tools** (such as SIPOC and RACI'),
], '**8 dedicated tools** (SWOT 5.1, PESTLE 5.2')
