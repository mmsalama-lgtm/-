"""Step 15 (2026-10-22), Parts B.2 and C: the follow-up register (index.html, #actions) and the integrated report.
    python3 tests/build/patch_hub_report.py index.html        (after patch_hub_profile.py and patch_hub_map.py)
- Menu item "Follow-up / المتابعة" after the integration map (both menu data blocks).
- The view: every open finding, gap, NCR, risk treatment and action from every tool, read-only (CIAR readers; the hub adapters run record by
  record for the toolbox flags; the adapters' weakest domains for assessment tools with no register), with source, record, owner, due date,
  status, age and overdue flag; filters by system, tool, type, owner, site, overdue and text; each row opens its record in its tool.
- "Issue the integrated report" in #actions, in the dashboard (#dash) and in the Executive Cockpit's panel (window.ciaIntegratedReport): one HTML
  report (A4, page break per section; cover, executive summary, the map, status per system and tool, action plan per tool, consolidated roadmap,
  verification and closure, re-assessment plan, appendix) plus the consolidated action plan as CSV; a snapshot of the numbers is kept in
  cia-org-reports:v1 so the next report shows the change. Dashboard numbers come from the same adapters and the same selection."""
import os, sys
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
path = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, "index.html")
s = open(path, encoding="utf-8").read()
if 'data-view="actions"' in s: print("follow-up register already present; nothing to do"); sys.exit(0)
def rep(old, new, times=1):
    global s
    n = s.count(old); assert n == times, (n, old[:120]); s = s.replace(old, new)
js = open(os.path.join(HERE, "org", "hub_actions.js"), encoding="utf-8").read()
rep('["map","Integration map"],["systems","Systems"]', '["map","Integration map"],["actions","Follow-up"],["systems","Systems"]', 2)
rep('["map","خريطة التكامل"],["systems","المنظومات"]', '["map","خريطة التكامل"],["actions","المتابعة"],["systems","المنظومات"]', 2)
rep('''  <section id="profile" class="band" data-view="profile" hidden''', '''  <section id="actions" class="band" data-view="actions" hidden aria-labelledby="acTitle">
    <div class="wrap">
      <div class="sec-head"><div><h2 id="acTitle"></h2><p id="acSub"></p></div><div class="ac-acts" id="acActs"></div></div>
      <div class="ac-stats" id="acStats"></div>
      <div class="ac-bar" id="acBar"></div>
      <div id="acBody"></div>
    </div>
  </section>

  <section id="profile" class="band" data-view="profile" hidden''')
rep('/* views of step 15:', js.strip() + '\n\n/* views of step 15:')
# the dashboard's actions: one more button
rep('''    <button type="button" class="d-btn" id="dDemoBtn">${esc(DEMO?u.demoOff:u.demo)}</button>`;''',
    '''    <button type="button" class="d-btn" id="dDemoBtn">${esc(DEMO?u.demoOff:u.demo)}</button>
    <button type="button" class="d-btn gold" id="dIssue">${esc(ACU[L].issue)}</button>`;''')
rep('''  $("dCsv").onclick = dCsv;''', '''  $("dCsv").onclick = dCsv;
  $("dIssue").onclick = ()=>ciaIntegratedReport();''')
# a tool closing may have changed the data: the register follows
rep('''  if(typeof renderDash==="function") setTimeout(renderDash, 350);''', '''  if(typeof renderDash==="function") setTimeout(renderDash, 350);
  if(typeof renderOrgViews==="function") setTimeout(renderOrgViews, 380);''')
open(path, "w", encoding="utf-8").write(s)
print("index.html: follow-up register (#actions), integrated report, dashboard button")
