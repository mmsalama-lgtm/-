#!/usr/bin/env bash
# Step 15 (2026-10-22): the whole build of the connected platform, from the step-14.1 package. Run from the platform folder:
#   bash tests/build/build_step15.sh
# (tests/build/org/org_labels.py, which reads the ISO toolkits' labels into assets/cia-labels.json and org/iso_meta.json, needs a server
#  on 8802 and is run once before this; its outputs are part of the package.)
set -euo pipefail
cd "$(dirname "$0")/../.."
python3 tests/build/org/build_kit.py                 # templates/org-profile-kit.html
python3 tests/build/patch_org_modules.py             # the organization profile kit in all 39 tools
for f in capa iso31000 ims smart_audit strategy efqm kaqa pmo_excellence cockpit; do python3 tests/build/patch_links_$f.py; done
python3 tests/build/links_inventory.py               # links.json, link_types.json
python3 tests/build/patch_hub_profile.py index.html
python3 tests/build/patch_hub_map.py index.html
python3 tests/build/patch_hub_report.py index.html
python3 tests/build/patch_hub_overlay.py index.html
python3 tests/build/patch_hub_nav.py index.html
python3 tests/build/patch_author_name.py              # the author name in the English texts
python3 tests/build/patch_meta.py                     # share card, description and version stamp
python3 tests/build/patch_hub_a11y.py index.html       # WCAG AA contrast of the muted text
python3 tests/build/patch_a11y_modules.py             # WCAG AA basics in the tools' shell
python3 tests/build/patch_kits_10009_c.py             # ISO 10009 "Part C": PDCA, CAPA, 5 Whys kits name their subclause
