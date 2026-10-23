"""Step 15 (2026-10-22): the new read-only link of modules/smart-audit-improvement.html — see tests/build/org/links/aud.js for what it reads and does.
    python3 tests/build/patch_links_smart_audit.py        (after patch_org_modules.py)"""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "org"))
import links_common
links_common.apply("smart-audit-improvement", "aud", data_t="", extra='')
