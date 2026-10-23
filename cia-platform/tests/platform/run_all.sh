#!/usr/bin/env bash
# CIA platform test suite (2026-10-10; step 15 — organization profile, links, map, follow-up, integrated report — 2026-10-22; ISO 10009 guide and its full explanation (10.1), FMEA and Lessons Learned 2026-10-16; SWOT and PESTLE 2026-10-17; 5 Whys, Fishbone and Pareto added 2026-10-11; RCA 2026-10-15; A3 and DMAIC 2026-10-16). Run from the platform folder:
#   python3 -m http.server 8802 --directory .            # this package
#   python3 -m http.server 8801 --directory <previous>   # previous release, for the regression test
#   CIA_ORIG_DIR=<previous> bash tests/platform/run_all.sh
# Results: tests/platform/results/*.json (one file per test, every check listed) and summary.txt.
set -u
cd "$(dirname "$0")"
J=${CIA_JOBS:-2}   # parallel shards for the long sweeps
run_sharded () { local t=$1; for ((i=0;i<J;i++)); do python3 "$t" $i $J > "results/${t%.py}-$i.log" 2>&1 & done; wait; }
mkdir -p results
python3 t_static.py      | tee results/static.log
run_sharded t_sweep.py
run_sharded t_kit.py
run_sharded t_tour.py
python3 t_hub.py         > results/hub.log 2>&1
python3 t_example.py     > results/example.log 2>&1
run_sharded t_regress.py
python3 t_regress.py hub > results/regress-hub.log 2>&1
for r in 1 2 3; do python3 ../pdca/test_pdca.py > "results/pdca-run$r.log" 2>&1; done
for r in 1 2 3; do python3 ../capa/test_capa.py > "results/capa-run$r.log" 2>&1; done
for r in 1 2 3; do python3 ../why5/test_why5.py > "results/why5-run$r.log" 2>&1; done
for r in 1 2 3; do python3 ../fish/test_fish.py > "results/fish-run$r.log" 2>&1; done
for r in 1 2 3; do python3 ../pareto/test_pareto.py > "results/pareto-run$r.log" 2>&1; done
for r in 1 2 3; do python3 ../rca/test_rca.py > "results/rca-run$r.log" 2>&1; done
for r in 1 2 3; do python3 ../a3/test_a3.py > "results/a3-run$r.log" 2>&1; done
for r in 1 2 3; do python3 ../dmaic/test_dmaic.py > "results/dmaic-run$r.log" 2>&1; done
for r in 1 2 3; do python3 ../iso10009/test_iso10009.py > "results/iso10009-run$r.log" 2>&1; done
for r in 1 2 3; do python3 ../iso10009/test_iso10009_explain.py > "results/iso10009-explain-run$r.log" 2>&1; done   # step 10.1: the full explanation
for r in 1 2 3; do python3 ../fmea/test_fmea.py > "results/fmea-run$r.log" 2>&1; done
for r in 1 2 3; do python3 ../lessons/test_lessons.py > "results/lessons-run$r.log" 2>&1; done
for r in 1 2 3; do python3 ../swot/test_swot.py > "results/swot-run$r.log" 2>&1; done
for r in 1 2 3; do python3 ../pestle/test_pestle.py > "results/pestle-run$r.log" 2>&1; done
for r in 1 2 3; do python3 ../stakeholders/test_stakeholders.py > "results/stakeholders-run$r.log" 2>&1; done
# this step (Stakeholder Analysis) changes the ISO 10009 guide only (6.5 and the 5.5 COTO entry gain a related link): the guide before/after, against the PESTLE package
# python3 ../stakeholders/iso10009_regress.py   (belongs to the Stakeholder step: run it against the PESTLE package)   # stored state, CSV, audit, coverage identical; report differs in the 6.5 row only
# this step (PESTLE) changes the ISO 10009 guide only (5.2 becomes a dedicated platform tool): the guide before/after, against the SWOT package
# python3 ../pestle/iso10009_regress.py   (belongs to the PESTLE step: run it against the SWOT package)   # stored state, CSV, audit identical; report differs in the 5.2 row only
# tests/swot/iso10009_regress.py belongs to the SWOT step (run it against the Lessons Learned package). SWOT, the Strategy Studio, Lessons and FMEA are
# unchanged in this step: test_pestle.py proves them byte-identical to the SWOT package when CIA_ORIG_DIR is set.
# ../iso10009/kits_regress.py belongs to the ISO 10009 step (run it against the DMAIC package).
# this step (Lessons Learned) changes FMEA only (read-only lessons panel): FMEA before/after the panel, against the FMEA package
python3 ../lessons/fmea_regress.py > "results/fmea-lessons-regress-run1.log" 2>&1   # FMEA identical before/after the lessons panel
# the FMEA step's checks: DMAIC is unchanged in this step (old and new copies identical), so dmaic_regress still proves the FMEA panel in DMAIC;
# tests/fmea/iso10009_regress.py belongs to the FMEA step (run it against the ISO 10009 package: it expects the 7.3 change, which is already in both copies here)
python3 ../fmea/dmaic_regress.py > "results/dmaic-fmea-regress-run1.log" 2>&1   # DMAIC: FMEA panel still listed; with no FMEA data identical
python3 ../capa/pdca_engine_regress.py > "results/pdca-engine-run1.log" 2>&1   # PDCA identical before/after the engine move
# tests/why5/capa_regress.py and tests/fish/*_regress.py belong to earlier steps (run them against the package of their step);
# this step (RCA) compares CAPA and Pareto against the Pareto package; Fishbone is unchanged, so its Pareto-step check still applies:
python3 ../rca/capa_regress.py > "results/capa-rca-regress-run1.log" 2>&1     # CAPA identical before/after the RCA panel
# this step (A3) changes RCA only (read-only A3 panel): RCA before/after the panel; CAPA and Pareto are unchanged in this step, so their RCA-step
# checks run against the RCA package (CIA_ORIG: old and new copies of CAPA and Pareto are identical)
# this step (DMAIC) changes A3 only (read-only DMAIC panel): A3 before/after the panel. RCA is unchanged in this step, so its A3-step check runs
# against the A3 package (old and new copies of RCA are identical) and still proves the A3 panel in RCA.
python3 ../dmaic/a3_regress.py > "results/a3-dmaic-regress-run1.log" 2>&1   # A3 identical before/after the DMAIC panel (A3 unchanged since; old and new copies identical)
python3 ../a3/rca_regress.py > "results/rca-a3-regress-run1.log" 2>&1        # RCA identical before/after the A3 panel
python3 ../rca/pareto_regress.py > "results/pareto-rca-regress-run1.log" 2>&1 # Pareto identical before/after the "rca" next step, apart from the new option
python3 ../pareto/fish_regress.py > "results/fish-pareto-regress-run1.log" 2>&1   # Fishbone: unchanged in this step (old and new identical), Pareto panel still works
python3 ../iso10009/explain_regress.py > "results/iso10009-explain-regress-run1.log" 2>&1   # step 10.1: ISO 10009 stored state, report (no appendix), CSV and audit identical
CIA_ALLOWED_CHANGED=${CIA_ALLOWED_CHANGED:-$(cd ../../modules && ls *.html | paste -sd, -)} python3 ../hub/test_home_advisor.py > "results/hub-advisor-run1.log" 2>&1   # hub home page and Tool Advisor (three profiles)
python3 ../hub/test_guides.py > "results/guides-run1.log" 2>&1   # 2026-10-22: Guides center (#guides), every guide link opens its tab
# ---- step 15 (2026-10-22): every module carries the organization profile kit, nine carry a link panel (CIA_ALLOWED_CHANGED: all 39 tools)
run_sharded t_org.py        # profile kit in every tool: no profile → report and text unchanged; with a profile → cover, fill bar, suggestions
python3 t_links.py > results/links.log 2>&1                         # one regression per new link: source tools byte-identical
python3 ../hub/test_profile.py > results/hub-profile.log 2>&1       # #profile: form, validation, logo resize/clean, export/import, cockpit import
python3 ../hub/test_map.py > results/hub-map.log 2>&1               # #map: every node opens its tool; highlights equal link_types.json; mirrored
python3 ../hub/test_actions.py > results/hub-actions.log 2>&1       # #actions: counts equal each tool's own open items; every row opens its record
python3 ../hub/test_integrated_report.py > results/hub-report.log 2>&1   # integrated report: numbers equal #dash; sections; cover; CSV; snapshot
python3 ../hub/test_overlay.py > results/hub-overlay.log 2>&1               # overlay: asks before replacing a tool with unsaved edits
python3 summary.py | tee results/summary.txt
