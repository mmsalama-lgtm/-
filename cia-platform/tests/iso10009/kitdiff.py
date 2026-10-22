"""Helper for the older before/after scripts: drops the tab-text lines that come from the ISO 10009 step's kit text update
(tests/build/patch_kits_10009.py), so those scripts keep checking everything else exactly."""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "build"))
import patch_kits_10009 as P  # noqa: E402
_PIECES = set()
for edits in P.EDITS.values():
    for a, b in edits:
        for s in (a, b):
            s = s.strip('"')
            _PIECES.add(s[:28]); _PIECES.add(s[-28:])
def kit_line(x):
    t = x[1:] if x[:1] in "+-" else x
    return "10009" in t or any(p and p in t for p in _PIECES)
def strip(diffs):
    return {k: v for k, v in ((k, [x for x in v if not kit_line(x)]) for k, v in diffs.items()) if v}
