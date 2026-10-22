"""Apply the home v2 + Advisor changes to index.html. Every edit uses an anchor that must match exactly once."""
import re, sys, os
B = os.path.dirname(os.path.abspath(__file__))   # sources: home.css, home_sections.html, data.js, data2.js, logic.js
path = sys.argv[1]
s = open(path, encoding="utf-8").read()
def once(old, new, label):
    global s
    n = s.count(old)
    assert n == 1, f"{label}: anchor found {n} times"
    s = s.replace(old, new)
def once_re(pat, new, label):
    global s
    m = list(re.finditer(pat, s, flags=re.S))
    assert len(m) == 1, f"{label}: pattern found {len(m)} times"
    s = s[:m[0].start()] + new + s[m[0].end():]
rd = lambda f: open(os.path.join(B, f), encoding="utf-8").read()

# 1. head: description, Open Graph, non-blocking fonts
DESC_AR = "أدوات تفاعلية ثنائية اللغة لأنظمة الإدارة ISO والحوكمة والمخاطر وإدارة المشاريع والتميّز المؤسسي، مع مرشد يقترح الأدوات المناسبة لمنشأتك وخطة بداية. إعداد مدثر سلامه."
once('<meta name="description" content="أدوات تفاعلية ثنائية اللغة لأنظمة الإدارة ISO والحوكمة والمخاطر والتميّز المؤسسي: تقييم ذاتي، وخطط عمل، ولوحة أداء موحدة. إعداد مدثر سلامه.">',
     f'<meta name="description" content="{DESC_AR}">', "meta description")
once('<meta property="og:description" content="أدوات تفاعلية ثنائية اللغة لأنظمة الإدارة ISO والحوكمة والمخاطر والتميّز المؤسسي: تقييم ذاتي، وخطط عمل، ولوحة أداء موحدة. إعداد مدثر سلامه.">',
     f'<meta property="og:description" content="{DESC_AR}">\n<meta property="og:image:alt" content="أكاديمية التحسين المستمر — من الامتثال إلى الأداء">', "og description")
once('<meta property="og:image" content="assets/cia-share.jpg">', '<meta property="og:image" content="assets/og-home.jpg">', "og image")
once('<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&family=IBM+Plex+Sans:wght@400;500;600;700&family=Noto+Kufi+Arabic:wght@500;700;800&family=Fraunces:opsz,wght@9..144,600;9..144,700&display=swap" rel="stylesheet">',
     '<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&family=IBM+Plex+Sans:wght@400;500;600;700&family=Noto+Kufi+Arabic:wght@500;700;800&family=Fraunces:opsz,wght@9..144,600;9..144,700&display=swap" rel="stylesheet" media="print" onload="this.media=\'all\'">\n<noscript><link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&family=IBM+Plex+Sans:wght@400;500;600;700&family=Noto+Kufi+Arabic:wght@500;700;800&family=Fraunces:opsz,wght@9..144,600;9..144,700&display=swap" rel="stylesheet"></noscript>', "fonts")

# 1b. the hero carries its Arabic text in the HTML (readable before the script runs); an English visitor's saved
#     language hides it until the script has put the English text in place
once('<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">',
     '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n<script>try{var cl=new URLSearchParams(location.search).get("lang")||localStorage.getItem("cia-lang");if(cl==="en"){document.documentElement.lang="en";document.documentElement.dir="ltr";document.documentElement.classList.add("pre-en");}}catch(e){}</script>', "early language")

# 2. styles
once('html.pdash .dc.soon{display:none}\n</style>', 'html.pdash .dc.soon{display:none}\n' + rd("home.css") + '</style>', "css")

# 3. header search button
once('      <a class="trainBtn" id="trainBtn" target="_blank" rel="noopener" hidden>',
     '      <button class="srchBtn" id="srchBtn" type="button"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg><span class="t"></span><kbd>Ctrl K</kbd></button>\n      <a class="trainBtn" id="trainBtn" target="_blank" rel="noopener" hidden>', "search button")

# 4. home sections: replace the wheel-only opening and the brief with the new home page and add the Advisor view
once_re(r'  <section class="home" id="home" data-view="home" aria-labelledby="wheelTitle">.*?</section>\n\n  <section class="brief band" id="brief" data-view="home" aria-labelledby="h1">.*?</section>\n\n  <section id="start"',
        rd("home_sections.html") + '\n  <section id="start"', "home sections")

# 5. the about logo reuses the header logo (one embedded copy instead of two)
once_re(r'<img src="data:image/webp;base64,[A-Za-z0-9+/=]+" alt="Continual Improvement Academy logo">', '<img data-logo alt="Continual Improvement Academy logo" width="180" height="180">', "about logo")

# 6. back-to-top button and command search dialog
once('<div class="toast" id="toast" role="status" aria-live="polite"></div>',
     '<button class="toTop" id="toTop" type="button"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true"><path d="M12 19V5M6 11l6-6 6 6"/></svg></button>\n'
     '<dialog class="cmdk" id="cmdk" aria-label="Search"><div class="cmdk-in"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg><input id="cmdQ" type="search" autocomplete="off" spellcheck="false" role="combobox" aria-expanded="true" aria-controls="cmdL" aria-autocomplete="list"><kbd>Esc</kbd></div><ul class="cmdk-l" id="cmdL" role="listbox"></ul></dialog>\n'
     '<div class="toast" id="toast" role="status" aria-live="polite"></div>', "toTop + cmdk")

# 7. renderText: the brief's facts box is gone (counters replace it)
once('  $("facts").innerHTML = f.map(([b,s])=>', '  if($("facts")) $("facts").innerHTML = f.map(([b,s])=>', "facts guard")

# 7b. desktop navigation uses a shorter list (navTop); the phone menu keeps every item
once('  $("nav").innerHTML = navHTML; $("mNav").innerHTML = navHTML; markNav();',
     '  $("nav").innerHTML = (u.navTop||u.nav).map(([h,t])=>`<a href="#${h}">${esc(t)}</a>`).join(""); $("mNav").innerHTML = navHTML; markNav();', "nav top")

# 8. wheel: selecting a system fills the side panel; the drawer with your scores opens from the panel
once('    el.addEventListener("click",()=>sdOpen(i));\n    el.addEventListener("keydown",e=>{ if(e.key==="Enter"||e.key===" "){ e.preventDefault(); sdOpen(i); } });',
     '    el.addEventListener("click",()=>wSelect(i, true));\n    el.addEventListener("keydown",e=>{ if(e.key==="Enter"||e.key===" "){ e.preventDefault(); wSelect(i, true); } });', "wheel click")
once('  leg.querySelectorAll(".wl").forEach(el=>bind(el, +el.dataset.i));\n  if(sdI>=0) sdRender();\n}',
     '  leg.querySelectorAll(".wl").forEach(el=>bind(el, +el.dataset.i));\n  if(sdI>=0) sdRender();\n  if(typeof wpnRender==="function") wpnRender();\n}', "wheel end")

# 9. renderAll renders the new home and the Advisor
once('renderCompliance(); renderFooter(); renderDash(); if(tourI>=0) tourShow(); }',
     'renderCompliance(); renderFooter(); renderHome2(); renderAdvisor(); renderDash(); if(tourI>=0) tourShow(); }', "renderAll")

# 10. data and logic, before init
once('/* init */\n(function(){', rd("data.js") + "\n" + rd("data2.js") + "\n" + rd("logic.js") + '\n/* init */\n(function(){', "data + logic")

# 11. view comment
once('/* ===================== VIEWS =====================\n   The home page shows the wheel and the brief only; each menu item opens its own section. */',
     '/* ===================== VIEWS =====================\n   The home page opens on the hero and showcase, with the tool wheel lower down; each menu item opens its own section\n   (the Advisor is its own view, #advisor). */', "views comment")
open(path, "w", encoding="utf-8").write(s)
print("applied:", path, len(s))
