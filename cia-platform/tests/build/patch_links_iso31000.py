"""Step 15 (2026-10-22): the new read-only link of modules/iso31000-risk-studio.html — see tests/build/org/links/iso31000.js for what it reads and does.
    python3 tests/build/patch_links_iso31000.py        (after patch_org_modules.py)"""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "org"))
import links_common
links_common.apply("iso31000-risk-studio", "iso31000", data_t="", extra='')
