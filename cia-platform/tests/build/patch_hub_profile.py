"""Step 15 (2026-10-22), Part A: one registration place — the organization profile in the hub (index.html).
    python3 tests/build/patch_hub_profile.py index.html        (after tests/build/org/build_kit.py)
- The shared blocks cia-org-css, cia-org-js and cia-readers-js (byte-identical to templates/org-profile-kit.html) before the hub's main script.
- Header button (logo or initials + "Organization profile"), a first-visit prompt in the home hero, the view #profile (identity, logo upload with
  in-browser resizing and SVG cleaning, sites, departments, people, scope, certifications, settings; save, export/import JSON, import from the
  Executive Cockpit with a preview, clear), its styles (org/hub_org.css) and its script (org/hub_profile.js, org/hub_glue.js).
- showView() and renderAll() call the step's views. No tool, adapter, snapshot or count changes; the only key written is cia-org:v1 (and the
  prompt's "later" choice, cia-org-prompt:v1)."""
import os, sys
HERE = os.path.dirname(os.path.abspath(__file__)); ORG = os.path.join(HERE, "org"); ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
path = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, "index.html")
s = open(path, encoding="utf-8").read()
if 'id="cia-org-js"' in s: print("organization profile already present; nothing to do"); sys.exit(0)
def rep(old, new, times=1):
    global s
    n = s.count(old); assert n == times, (n, old[:120]); s = s.replace(old, new)
def block(t, tag, id_):
    i = t.find('<%s id="%s">' % (tag, id_)); j = t.find('</%s>' % tag, i); return t[i:j + len(tag) + 3]
tpl = open(os.path.join(ROOT, "templates", "org-profile-kit.html"), encoding="utf-8").read()
kit = block(tpl, "style", "cia-org-css") + "\n" + block(tpl, "script", "cia-org-js") + "\n" + block(tpl, "script", "cia-readers-js") + "\n"
rd = lambda f: open(os.path.join(ORG, f), encoding="utf-8").read()
# 1. shared blocks before the main script
rep('<script>\n/* ===================== CONFIG ===================== */', kit + '<script>\n/* ===================== CONFIG ===================== */')
# 2. styles
rep('}\n</style>\n</head>', '}\n' + rd("hub_org.css").strip() + '\n</style>\n</head>')
# 3. header button
rep('      <button class="menuBtn" id="menuBtn"', '      <button class="orgBtn" id="orgBtn" type="button" onclick="route(\'#profile\')"><span class="ob-av" id="orgAv" aria-hidden="true"></span><span class="ob-t" id="orgLbl"></span></button>\n      <button class="menuBtn" id="menuBtn"')
# 4. first-visit prompt in the hero
rep('<p class="h2-by"><span id="byLbl" data-pre-ar>إعداد</span><strong id="byName">مدثر سلامه</strong></p>',
    '<p class="h2-by"><span id="byLbl" data-pre-ar>إعداد</span><strong id="byName">مدثر سلامه</strong></p>\n        <div class="org-prompt" id="orgPrompt" role="note" hidden></div>')
# 5. the view and its dialog
rep('''  <section id="systems" data-view="systems" hidden>''', '''  <section id="profile" class="band" data-view="profile" hidden aria-labelledby="pfTitle">
    <div class="wrap">
      <div class="sec-head"><div><h2 id="pfTitle"></h2><p id="pfSub"></p></div><div class="pf-acts" id="pfActs"></div></div>
      <div class="pf-grid"><form class="pf-form" id="pfForm" novalidate onsubmit="return false"></form><aside class="pf-side" id="pfSide"></aside></div>
    </div>
  </section>

  <section id="systems" data-view="systems" hidden>''')
rep('<dialog class="ddlg" id="hDlg" aria-labelledby="hDlgT"></dialog>', '<dialog class="ddlg" id="hDlg" aria-labelledby="hDlgT"></dialog>\n<dialog class="ddlg" id="pfDlg" aria-labelledby="pfDlgT"></dialog>')
# 6. script (before the init block, so the views exist when the first route runs)
rep('/* init */\n(function(){', rd("hub_profile.js").strip() + "\n" + rd("hub_glue.js").strip() + '\n\n/* init */\n(function(){')
# 7. showView and renderAll call the step's views
rep('  document.documentElement.dataset.view = v;\n  markNav();\n}', '  document.documentElement.dataset.view = v;\n  markNav();\n  if(typeof orgView==="function") orgView(v);\n}')
rep('renderAdvisor(); renderDash(); if(tourI>=0) tourShow(); }', 'renderAdvisor(); renderDash(); renderOrgViews(); if(tourI>=0) tourShow(); }')
open(path, "w", encoding="utf-8").write(s)
print("index.html: organization profile (#profile), header button, first-visit prompt; shared blocks carried")
