# Build notes (2026-10-11; Fishbone and Pareto steps added; RCA step 2026-10-15; A3, DMAIC, ISO 10009, FMEA, ISO 10009 full explanation (10.1) and Lessons Learned steps 2026-10-16)

Scripts that made the changes in this package. Each edit to an existing file uses an anchor that must match exactly once,
so a script either applies cleanly to the 2026-10-10 package or stops with an error. Run from the platform folder.

## Step 1 — hub home page v2 and Tool Advisor (`home/`)
- `home/apply_hub.py index.html` — inserts the new home sections (`home_sections.html`), styles (`home.css`), data
  (`data.js`: roles, tool facts, screens, references, news; `data2.js`: Advisor questions, rules and texts) and logic
  (`logic.js`, after `patch_logic.py`) into index.html.
- `home/capture.py` + `home/shots.json` — the showcase screenshots (example data loaded, 1280×800 at 1.5×), converted to
  WebP in `assets/shots/`; `home/og.py` — the share image `assets/og-home.jpg`.

## Step 2 — CAPA (modules/capa.html) and the shared toolbox engine
1. `python3 tests/build/patch_pdca_engine.py modules/pdca.html` — adds the engine block (`engine.js`) to PDCA and turns
   PDCA's generic helpers into one-line calls to it. `tests/capa/pdca_engine_regress.py` proves PDCA is unchanged.
2. `python3 tests/build/build_capa.py` — writes modules/capa.html from pdca.html (shell, styles, home button, tour layer
   with its own CFG), the kit template, `capa_body.html`, `capa_host.css`, `capa_host.js` and `data_capa.py`
   (EXPLAIN_CAPA; clause numbers checked against the uploaded ISO 9001:2026, ISO 9000:2026 and ISO 19011:2026).
3. `python3 tests/build/patch_smart_audit.py modules/smart-audit-improvement.html` — the "CAPA ↗" link on each CAPA row.
4. `python3 tests/build/patch_hub_capa.py index.html` then `python3 tests/build/demo_capa.py` (server running) —
   links CAPA in the hub and fills `DEMO_RES.capa` from the hub's own reading of the CAPA example.

## Step 3 — 5 Whys (modules/five-whys.html), linked to CAPA and the hub (2026-10-11)
1. `python3 tests/build/build_why5.py` — writes modules/five-whys.html from pdca.html (shell, base styles, home button), CAPA's
   style additions (`capa_host.css`) plus `why5_host.css`, the kit template, `why5_body.html`, `why5_host.js` and
   `data_why5.py` (EXPLAIN_WHY5; clause numbers checked against the uploaded ISO 9001:2026 and ISO 9000:2026). The tour layer
   is pdca.html's (identical to capa.html's) with its own CFG; the engine block is `engine.js`, unchanged.
2. `python3 tests/build/patch_capa_why5.py modules/capa.html` (after build_capa.py) — the "Open the 5 Whys tool" button, the
   read-only panel of analyses naming the record with "Use this root cause", and the kit's related-tools entry.
3. `python3 tests/build/patch_hub_why5.py index.html` then `python3 tests/build/demo_why5.py` (server running) — links 5 Whys in
   the hub and fills `DEMO_RES.why5` from the hub's own reading of the example.
Smart Audit is unchanged in this step: findings reach 5 Whys through CAPA (import there, then "start from a CAPA record").

## Step 4 — Fishbone (modules/fishbone.html), linked to CAPA, 5 Whys and the hub (2026-10-11)
1. `python3 tests/build/build_fish.py` (after build_why5.py) — writes modules/fishbone.html from five-whys.html (head, PDCA base
   and host styles, home button, tour layer with its own CFG), CAPA's and 5 Whys' style additions plus `fish_host.css`, the kit
   template, `fish_body.html`, `fish_host.js` (with `fish_example.js` in place of `__EXAMPLE__`) and `data_fish.py`
   (EXPLAIN_FISH; clause numbers checked against the uploaded ISO 9001:2026 and ISO 9000:2026). The engine block is `engine.js`,
   unchanged.
2. `python3 tests/build/patch_capa_fish.py modules/capa.html` (after patch_capa_why5.py) — the "Open the Fishbone tool" button and
   the read-only Fishbone panel with "Use this root cause", under the unchanged 5 Whys panel.
3. `python3 tests/build/patch_why5_fish.py modules/five-whys.html` (after build_why5.py) — optional read-only panel in 5 Whys listing
   the Fishbone analyses that verify a selected cause with the analysis open in the form (no change to 5 Whys' stored state).
4. `python3 tests/build/patch_hub_fish.py index.html` then `python3 tests/build/demo_fish.py` (server running) — links Fishbone in
   the hub and fills `DEMO_RES.fish` from the hub's own reading of the example.
Full chain on a fresh copy of the CAPA package: build_capa → patch_capa_why5 → patch_capa_fish; build_why5 → build_fish →
patch_why5_fish; patch_hub_why5 → demo_why5 → patch_hub_fish → demo_fish. Smart Audit is unchanged in this step.

## Step 5 — Pareto (modules/pareto.html), linked to CAPA, Fishbone, 5 Whys, Smart Audit and the hub (2026-10-11)
1. `python3 tests/build/build_pareto.py` (after build_fish.py) — writes modules/pareto.html from fishbone.html (head, PDCA base and host
   styles, home button, tour layer with its own CFG), CAPA's, 5 Whys' and Fishbone's style additions plus `pareto_host.css`, the kit
   template, `pareto_body.html`, `pareto_host.js` (with `pareto_example.js` in place of `__EXAMPLE__`) and `data_pareto.py`
   (EXPLAIN_PARETO; clause numbers checked against the uploaded ISO 9001:2026 and ISO 9000:2026). The engine block is `engine.js`,
   unchanged (the ranking, the cumulative %, the cut-off and the SVG charts are drawn by the tool itself).
2. `python3 tests/build/patch_fish_pareto.py modules/fishbone.html` (after build_fish.py) — Fishbone reads the new request `?pareto=ID&cat=CAT`
   (or `{pareto, cat}` in its existing hint `cia-nav:fishbone`) to fill a new, unsaved analysis, and shows read-only which Pareto analyses
   send a category to the analysis open in the form. No change to Fishbone's stored state.
3. `python3 tests/build/patch_hub_pareto.py index.html` then `python3 tests/build/demo_pareto.py` (server running) — links Pareto in the
   hub and fills `DEMO_RES.pareto` from the hub's own reading of the example.
Full chain on a fresh copy of the Fishbone package: build_why5 → patch_why5_fish; build_fish → build_pareto → patch_fish_pareto;
patch_hub_pareto → demo_pareto. CAPA, 5 Whys and Smart Audit are unchanged in this step (CAPA and 5 Whys are opened through their
existing `?capa=` / `?open=` requests).

## Step 6 — Root Cause Analysis (modules/rca.html), linked to CAPA, Pareto, Fishbone, 5 Whys and the hub (2026-10-15)
1. `python3 tests/build/build_rca.py` (after build_pareto.py) — writes modules/rca.html from pareto.html (head, PDCA base and host styles,
   home button, tour layer with its own CFG), CAPA's, 5 Whys', Fishbone's and Pareto's style additions plus `rca_host.css`, the kit
   template, `rca_body.html`, `rca_host.js` (with `rca_example.js` in place of `__EXAMPLE__`) and `data_rca.py` (EXPLAIN_RCA; clause
   numbers checked against the uploaded ISO 9001:2026, ISO 9000:2026 by OCR and ISO 19011:2026). The engine block is `engine.js`,
   unchanged; the risk grid, the depth rule, the cause tree and the tests are drawn and computed by the tool itself.
2. `python3 tests/build/patch_capa_rca.py modules/capa.html` (after patch_capa_fish.py) — a third read-only panel under the 5 Whys and
   Fishbone panels listing the RCA investigations that name the record, with "Open in RCA" and "Use this root cause". Hidden and empty
   with no RCA data; no change to CAPA's stored state.
3. `python3 tests/build/patch_pareto_rca.py modules/pareto.html` (after build_pareto.py) — "rca" accepted as a next step of a vital-few
   category (preview read from `cia-rca:v1`; "Start an RCA investigation" saves first, then opens `rca.html?pareto=&cat=` or the hint
   `cia-nav:rca`). The stored-state schema only accepts the new value.
4. `python3 tests/build/patch_hub_rca.py index.html` then `python3 tests/build/demo_rca.py` (server running) — links RCA in the hub,
   lets Pareto's adapter count "rca" as a linked step, and fills `DEMO_RES.rca` from the hub's own reading of the example.
Full chain on a fresh copy of the Pareto package (checked 2026-10-15, byte for byte): build_capa → patch_capa_why5 → patch_capa_fish →
patch_capa_rca; build_why5 → patch_why5_fish; build_fish → build_pareto → patch_fish_pareto; build_rca; patch_pareto_rca;
patch_hub_rca → demo_rca. Fishbone, 5 Whys and Smart Audit are unchanged in this step (Fishbone and 5 Whys are opened through their
existing `?capa=` / `?open=` / `?pareto=` requests).

## Step 7 — A3 problem solving (modules/a3.html), linked to RCA, CAPA, Pareto, Fishbone, 5 Whys, PDCA and the hub (2026-10-16)
1. `python3 tests/build/build_a3.py` (after build_rca.py; before or after patch_rca_a3.py) — writes modules/a3.html from rca.html (head,
   PDCA base and host styles, home button, tour layer with its own CFG), CAPA's, 5 Whys', Fishbone's, Pareto's and RCA's style additions
   plus `a3_host.css`, the kit template, `a3_body.html`, `a3_host.js` (with `a3_example.js` in place of `__EXAMPLE__`) and `data_a3.py`
   (EXPLAIN_A3; clause numbers checked against the uploaded ISO 9001:2026 and ISO 9000:2026 by OCR). The engine block is `engine.js`,
   unchanged; the charts, the A3 page, the goal rule and the stage are drawn and computed by the tool itself.
2. `python3 tests/build/patch_rca_a3.py modules/rca.html` (after build_rca.py) — a hidden read-only panel in RCA's actions section listing
   the A3s that name the investigation (read from `cia-a3:v1`), with "Open in A3" (`?open=` or the hint `cia-nav:a3`). No change to RCA's
   stored state.
3. `python3 tests/build/patch_hub_a3.py index.html` then `python3 tests/build/demo_a3.py` (server running) — links A3 in the hub and fills
   `DEMO_RES.a3` from the hub's own reading of the example.
Full chain on a fresh copy of the RCA package (checked 2026-10-16, byte for byte): build_rca (reproduces the uploaded rca.html) →
patch_rca_a3; build_a3; patch_hub_a3 → demo_a3. PDCA, CAPA, Pareto, Fishbone, 5 Whys and Smart Audit are unchanged in this step
(they are opened through their existing `?open=` / `?capa=` / `?pareto=&cat=` requests and `parent.ciaOpenFile`).

## Step 8 — DMAIC improvement project (modules/dmaic.html), linked to A3, RCA, Pareto, Fishbone, 5 Whys, CAPA, PDCA and the hub (2026-10-16)
1. `python3 tests/build/build_dmaic.py` (after build_a3.py; before or after patch_a3_dmaic.py) — writes modules/dmaic.html from a3.html (head,
   PDCA base and host styles, home button, tour layer with its own CFG), CAPA's, 5 Whys', Fishbone's, Pareto's, RCA's and A3's style additions
   plus `dmaic_host.css`, the kit template, `dmaic_body.html`, `dmaic_host.js` (with `dmaic_example.js` in place of `__EXAMPLE__`) and
   `data_dmaic.py` (EXPLAIN_DMAIC; clause numbers checked against the uploaded ISO 9001:2026 and ISO 9000:2026 by OCR). The engine block is
   `engine.js`, unchanged; the phase map, the run charts, the statistics (mean, median, defect rate, the two-group check), the gates and the
   stage are drawn and computed by the tool itself.
2. `python3 tests/build/patch_a3_dmaic.py modules/a3.html` (after build_a3.py) — a hidden read-only panel in A3's follow-up block listing the
   DMAIC projects that name the A3 (read from `cia-dmaic:v1`), with "Open in DMAIC" (`?open=` or the hint `cia-nav:dmaic`). No change to A3's
   stored state.
3. `python3 tests/build/patch_hub_dmaic.py index.html` then `python3 tests/build/demo_dmaic.py` (server running) — links DMAIC in the hub and
   fills `DEMO_RES.dmaic` from the hub's own reading of the example.
Full chain on a fresh copy of the A3 package (checked 2026-10-16, byte for byte, every module and index.html): build_capa → patch_capa_why5 →
patch_capa_fish → patch_capa_rca; build_why5 → build_fish → patch_why5_fish; build_pareto → patch_fish_pareto → patch_pareto_rca; build_rca →
patch_rca_a3; build_a3 → patch_a3_dmaic; build_dmaic; patch_hub_dmaic → demo_dmaic. RCA, PDCA, CAPA, Pareto, Fishbone, 5 Whys and Smart Audit
are unchanged in this step (they are opened through their existing `?open=` / `?capa=` / `?pareto=&cat=` requests and `parent.ciaOpenFile`).

## Step 9 — ISO 10009:2024 quality tools guide (modules/iso10009.html), linked to the toolbox and the hub (2026-10-16)
1. `python3 tests/build/patch_kits_10009.py` (after build_dmaic.py and every earlier patch) — the Explain Kit data of Fishbone, Pareto, RCA, A3 and
   DMAIC said ISO 10009 was not uploaded; each now names the ISO 10009:2024 subclause that reviews its method (14.5, 13.7, 14.1, 14.7, 16.1) and
   points to the guide. Only text inside `<script id="cia-explain-data">` changes (tests/iso10009/kits_regress.py proves every other byte identical).
2. `python3 tests/build/build_10009.py` (after build_dmaic.py) — writes modules/iso10009.html from dmaic.html (head, PDCA base and host styles,
   home button, tour layer with its own CFG), the toolbox style additions plus `qt_host.css`, the kit template, `qt_body.html`, `qt_host.js`
   (with `qt_example.js` in place of `__EXAMPLE__` and the catalogue of `cat_10009.py` in place of `__CATALOG__`) and `data_10009.py`
   (EXPLAIN_10009, built from the same catalogue). The engine block is `engine.js`, unchanged (now in nine files).
   `cat_10009.py` holds the 53 tools of clauses 5–16 with the Table C.1 attributes, the Annex A placements (ranges expanded and marked) and the
   platform links; it was checked against ISO-10009-2024-Quality-Management-Guidance-for-Quality-Tools.pdf.
3. `python3 tests/build/patch_hub_10009.py index.html` then `python3 tests/build/demo_10009.py` (server running) — links the guide in the hub
   (URL, Audit & Improvement row, card, standards covered, knowledge topic, compliance notes, `qtAd`, TOOLINFO / NEWS / request mapping / Advisor
   rules) and lets `ciaOpenFile(file, tab)` name a tab (optional; older callers unchanged); fills `DEMO_RES.iso10009`.
Full chain on a fresh copy of the DMAIC package (checked 2026-10-16): the Step 8 chain (reproduces every uploaded module byte for byte) →
patch_kits_10009 → build_10009 → patch_hub_10009 → demo_10009 reproduces every module and index.html of this package byte for byte.

## Step 10 — FMEA (modules/fmea.html), linked to DMAIC, RCA, Pareto, Fishbone, 5 Whys, A3, CAPA, PDCA, the ISO 10009 guide and the hub (2026-10-16)
1. `python3 tests/build/patch_dmaic_fmea.py modules/dmaic.html` (after build_dmaic.py) — a hidden read-only panel in DMAIC's hand-over block listing
   the FMEA studies that name the project (read from `cia-fmea:v1`), with "Open in FMEA" (`?open=` or the hint `cia-nav:fmea`). No change to
   DMAIC's stored state (tests/fmea/dmaic_regress.py).
2. `python3 tests/build/build_fmea.py` (after build_dmaic.py; before or after patch_dmaic_fmea.py) — writes modules/fmea.html from dmaic.html (head,
   PDCA base and host styles, home button, tour layer with its own CFG), the toolbox style additions (capa … dmaic) plus `fmea_host.css`, the kit
   template, `fmea_body.html`, `fmea_host.js` (with `fmea_example.js` in place of `__EXAMPLE__`) and `data_fmea.py` (EXPLAIN_FMEA). Read-only
   parts are copied at build time from `dmaic_host.js`: the other tools' stage rules and previews, DMAIC's own record repair and stage rule
   (wrapped in `DMR`), and the wording they use. The engine block is `engine.js`, unchanged (now in ten files).
3. `cat_10009.py` makes 7.3 FMEA a dedicated platform tool (`own: "fmea"`; FILES, NAMES, REC_KEYS, NAV) and `qt_host.js` / `data_10009.py` name it;
   then `python3 tests/build/build_10009.py` rebuilds modules/iso10009.html (stored state, example, questions and audit rules unchanged; coverage
   6 dedicated / 14 inside / 3 here / 11 related / 19 not yet).
4. `python3 tests/build/patch_hub_fmea.py index.html` then `python3 tests/build/demo_fmea.py` (server running) — links FMEA in the hub (URL, Audit &
   Improvement row, card, toolbox entry, knowledge topic, compliance note, `fmeaAd`, TOOLINFO / NEWS / request mapping / Advisor rules; the hub's `qtAd`
   is unchanged, so the snapshot it reads for the ISO 10009 guide stays the same) and fills `DEMO_RES.fmea`.
Full chain on a fresh copy of the ISO 10009 package (checked 2026-10-16, byte for byte, every module and index.html): the Step 8 module chain →
patch_kits_10009 → build_10009 → patch_dmaic_fmea → build_fmea; patch_hub_fmea → demo_fmea.

## Step 10.1 — the full explanation of ISO 10009:2024 inside modules/iso10009.html (2026-10-16)
1. `python3 tests/build/inv_10009.py <ISO-10009-2024 PDF>` — inventory of the official PDF (needs pdftotext; the PDF is not in the package) written to
   tests/iso10009/inventory_10009.json: 16 clauses, 70 subclauses, 12 "other relevant tools" lists (49 names), 53 tables, 17 figures + B.1–B.3,
   Annex A tables A.1–A.3, Table C.1 rows (53, TQM listed as 16.3), bibliography (91) and the references each subclause cites. Numbers and titles
   only, no text of the standard. Without a PDF the stored JSON is kept.
2. `cards_10009_a.py`, `_b.py`, `_c.py` (one card per tool: when not to use it, inputs, 5–8 steps, mistakes, what an auditor asks to see, tools
   before/after) and `cards_10009.py` (CLX clause intros, OTX one line per other relevant tool, FRONT clauses 1–4 with the ISO 9000:2026 term
   numbers, ANNEXB, QUIZ 36 questions, PATHS 5); `cat_10009.py` imports them and `merge()` fails if a tool, a chain code or an entry is missing.
3. `qt_explore.js` (the explorer: contents, clauses 1–4, clause pages with mini-map, other tools and self-check, the 53 cards, Annex A matrix,
   Annex B, Annex C table with competence CSV, platform link map, learning paths in `cia-iso10009-paths:v1`, search, copy link, reading path and
   diagram, report appendix) is inserted by `build_10009.py` at `/*__EXPLORE__*/` in `qt_host.js`; the catalogue gains `X` (cards data, Annex A
   cells and inventory numbers). `qt_host.js`: ?tool= / hint {tool} open the card, library cards gain steps, auditor lines and "Full card", six
   assistant answers (card, notuse, auditor, compet, paths, other — the last three computed), `buildReportHTML(appx)` (no argument = unchanged).
   `data_10009.py`: kit tool items carry the steps, auditor asks and common mistakes. Then `python3 tests/build/build_10009.py`.
4. `python3 tests/build/patch_hub_10009_explain.py index.html` (after the Lessons Learned hub step) — knowledge topic rewritten with a second link
   (guide2 → explain-cl, rendered after the first link), TOOLINFO.iso10009 brief/gain/time (16 questions, start tab unchanged), a NEWS item.
   No change to counts, qtAd, DEMO_RES or Advisor rules. Part C of the step (lines in the other toolbox kits) was not applied: no other file changes.

## Step 11 — Lessons Learned Register (modules/lessons.html), linked to RCA, A3, DMAIC, FMEA, CAPA, PDCA and the hub (2026-10-16)
1. `python3 tests/build/patch_fmea_lessons.py` — FMEA shows a read-only panel of the lessons that name the open study (reads `cia-lessons:v1`).
2. `python3 tests/build/build_lessons.py` (after patch_fmea_lessons.py) — writes modules/lessons.html from fmea.html with `lessons_body.html`,
   `lessons_host.css`, `lessons_host.js` (rules of DMAIC, FMEA and PDCA copied read-only at build time), `lessons_example.js` and `data_lessons.py`.
   Engine unchanged (eleven files); tour copied from FMEA with only its CFG line changed.
3. `python3 tests/build/patch_hub_lessons.py index.html` then `python3 tests/build/demo_lessons.py` (server running) — URL, system row, toolkit card,
   SOON citbox, adapter lessonsAd, COMPLIANCE, TOOLINFO, NEWS, TOOL_RQ, Advisor rules, knowledge topic; fills `DEMO_RES.lessons`.
Full chain on a fresh copy of the FMEA package (checked 2026-10-16, byte for byte, every module and index.html): build_10009 → patch_fmea_lessons
→ build_lessons; patch_hub_lessons → demo_lessons → patch_hub_10009_explain.

## Tests
`CIA_ORIG_DIR=<previous package> CIA_NEW_TOOLS=<new module files> CIA_NEW_HUB=<new hub keys> bash tests/platform/run_all.sh` (5 Whys step: `five-whys` / `why5`;
Fishbone step: `fishbone` / `fish`; Pareto step: `pareto` / `pareto`; RCA step: `rca` / `rca`; A3 step: `a3` / `a3`; DMAIC step: `dmaic` / `dmaic`; ISO 10009 step: `iso10009` / `iso10009`; FMEA step: `fmea` / `fmea`; Lessons Learned step: `lessons` / `lessons`) with the package served on 8802 and the previous one on 8801; `tests/hub/test_home_advisor.py` with
`CIA_ALLOWED_CHANGED=pdca.html,capa.html,smart-audit-improvement.html` (5 Whys step, against the CAPA package: `capa.html,five-whys.html`;
Fishbone step, against the 5 Whys package: `capa.html,five-whys.html,fishbone.html`; Pareto step, against the Fishbone package: `fishbone.html,pareto.html`; RCA step, against the Pareto package: `capa.html,pareto.html,rca.html`; A3 step, against the RCA package: `rca.html,a3.html`; DMAIC step, against the A3 package: `a3.html,dmaic.html`; ISO 10009 step, against the DMAIC package: `fishbone.html,pareto.html,rca.html,a3.html,dmaic.html,iso10009.html`; FMEA step, against the ISO 10009 package: `dmaic.html,iso10009.html,fmea.html`). Fishbone's own suites: `tests/fish/test_fish.py`,
`tests/fish/capa_regress.py` (CAPA before/after the link) and `tests/fish/why5_regress.py` (5 Whys before/after the panel). Pareto's own suites: `tests/pareto/test_pareto.py` and `tests/pareto/fish_regress.py` (Fishbone before/after the Pareto link).
RCA's own suites: `tests/rca/test_rca.py`, `tests/rca/capa_regress.py` (CAPA before/after the RCA panel) and `tests/rca/pareto_regress.py` (Pareto before/after the "rca" next step).
A3's own suites: `tests/a3/test_a3.py` and `tests/a3/rca_regress.py` (RCA before/after the A3 panel).
DMAIC's own suites: `tests/dmaic/test_dmaic.py` and `tests/dmaic/a3_regress.py` (A3 before/after the DMAIC panel).
FMEA's own suites: `tests/fmea/test_fmea.py` and `tests/fmea/dmaic_regress.py` (DMAIC before/after the FMEA panel).
ISO 10009 explanation (10.1): `tests/iso10009/test_iso10009_explain.py` and `tests/iso10009/explain_regress.py` (stored state, report without the appendix, CSV and audit identical).
Lessons Learned: `tests/lessons/test_lessons.py` and `tests/lessons/fmea_regress.py` (FMEA before/after the lessons panel). This package: `CIA_NEW_TOOLS=lessons CIA_NEW_HUB=lessons`, advisor `CIA_ALLOWED_CHANGED=iso10009.html,fmea.html,lessons.html`.

## Step 12 — SWOT (modules/swot.html), linked to the Strategy & Performance Studio, Lessons Learned, Pareto, FMEA, the ISO 10009 guide and the hub (2026-10-17)
1. `python3 tests/build/patch_10009_swot.py` then `python3 tests/build/build_10009.py` — the ISO 10009 catalogue names the SWOT tool as the dedicated
   platform tool for 5.1 (`P("swot","tools","own")`, FILES and NAMES gain "swot"; the "planned" marker goes) and the assistant's coverage answer says
   7 dedicated / 13 inside. The tool's `own` field and REC_KEYS are unchanged, so storyboard steps on 5.1 do not become linkable: stored state, CSV,
   audit and self-assessment identical; the default report differs only in the 5.1 coverage row (tests/swot/iso10009_regress.py).
2. `python3 tests/build/build_swot.py` (after build_lessons.py) — writes modules/swot.html from lessons.html with `swot_body.html`, `swot_host.css`,
   `swot_host.js`, `swot_example.js` and `data_swot.py` (EXPLAIN_SWOT). Read-only parts copied at build time: the Strategy Studio's TKV, ids and
   category lists (from modules/strategy-performance.html), Pareto's ranking and stage (from dmaic_host.js), FMEA's rules with its high-priority rows
   (FMR, from fmea_host.js) and the Lessons Learned record repair and stage rule (LLR, from lessons_host.js). Engine unchanged (twelve files); tour
   copied from Lessons Learned with only its CFG line changed.
3. `python3 tests/build/patch_hub_swot.py index.html` then `python3 tests/build/demo_swot.py` (server running) — URL, Audit & Improvement row (14 / 37),
   toolkit card, citbox (2 left), PDCA card text, knowledge topic, compliance note, adapter `swotAd`, TOOLINFO / NEWS / TOOL_RQ / Advisor rules
   (goal kpi 1, goal risk 1, pain kpis 1); fills `DEMO_RES.swot`.
Full chain on a fresh copy of the Lessons Learned package with these sources (checked 2026-10-17, byte for byte, every module and index.html):
patch_10009_swot → build_10009 → build_lessons → build_swot; patch_hub_swot → demo_swot.
Tests: `tests/swot/test_swot.py` and `tests/swot/iso10009_regress.py`. This package: `CIA_NEW_TOOLS=swot CIA_NEW_HUB=swot`, advisor
`CIA_ALLOWED_CHANGED=iso10009.html,swot.html`.

## Step 13 — PESTLE (modules/pestle.html), linked to the Strategy & Performance Studio, SWOT, the ISO 10009 guide and the hub (2026-10-17)
1. `python3 tests/build/patch_10009_pestle.py` then `python3 tests/build/build_10009.py` — the ISO 10009 catalogue names the PESTLE tool as the dedicated
   platform tool for 5.2 (`P("pestle","tools","own")`, FILES and NAMES gain "pestle"; the "planned" marker goes) and the assistant's coverage answer says
   8 dedicated / 12 inside. The `own` field and REC_KEYS are unchanged: stored state, CSV, audit and self-assessment identical; the default report differs
   only in the 5.2 coverage row (tests/pestle/iso10009_regress.py). The hub's qtAd is unchanged.
2. `python3 tests/build/build_pestle.py` (after build_swot.py) — writes modules/pestle.html from swot.html with `pestle_body.html`, `pestle_host.css`,
   `pestle_host.js`, `pestle_example.js` and `data_pestle.py` (EXPLAIN_PESTLE). Read-only parts copied at build time: the Strategy Studio's TKV and its
   pestleF, pestleImp and tf lists (from modules/strategy-performance.html), and the SWOT tool's record repair, stage rule, items, top items and codes
   (SWR, from swot_host.js) with its stage and quadrant names. Engine unchanged (thirteen files); tour copied from SWOT with only its CFG line changed.
3. `python3 tests/build/patch_hub_pestle.py index.html` then `python3 tests/build/demo_pestle.py` (server running) — URL, Audit & Improvement row (15 / 38),
   toolkit card, citbox (1 left: stakeholder analysis), PDCA card text, knowledge topic, compliance note, adapter `pestleAd`, TOOLINFO / NEWS / TOOL_RQ /
   Advisor rules (goal kpi 1, goal risk 1); fills `DEMO_RES.pestle`.
Full chain on a fresh copy of the SWOT package with these sources (checked 2026-10-17, byte for byte, every module and index.html):
patch_10009_swot → patch_10009_pestle → build_10009 → build_lessons → build_swot → build_pestle; patch_hub_swot → demo_swot → patch_hub_pestle → demo_pestle.
SWOT, the Strategy Studio, Lessons Learned, FMEA and the other tools are unchanged (no read-only panel was needed: PESTLE reads them; SWOT's own
"start from PESTLE" would change its source schema, so it was left out).
Tests: `tests/pestle/test_pestle.py` (with CIA_ORIG_DIR it also proves those tools byte-identical) and `tests/pestle/iso10009_regress.py`. This package:
`CIA_NEW_TOOLS=pestle CIA_NEW_HUB=pestle`, advisor `CIA_ALLOWED_CHANGED=iso10009.html,pestle.html`.
