"""Step 15 (2026-10-22): the new read-only link of modules/pmo-excellence.html — see tests/build/org/links/pmoexc.js for what it reads and does.
    python3 tests/build/patch_links_pmo_excellence.py        (after patch_org_modules.py)"""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "org"))
import links_common
links_common.apply("pmo-excellence", "pmoexc", data_t="", extra='')
