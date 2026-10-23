"""Step 15 (2026-10-22): the new read-only link of modules/ims-builder.html — see tests/build/org/links/ims.js for what it reads and does.
    python3 tests/build/patch_links_ims.py        (after patch_org_modules.py)"""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "org"))
import links_common
links_common.apply("ims-builder", "ims", data_t="", extra='')
