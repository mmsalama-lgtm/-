/* ---------- the menu: every section in three groups, with an icon each (sections added later land in the last group) ---------- */
const UI_GROUPS = {
  ar:[["ابدأ", ["home","advisor","start"]], ["اعمل على منشأتك", ["dash","tools","guides","map","actions","systems"]], ["تعلّم وتواصل", ["learn","refs","faq","request","about"]]],
  en:[["Start", ["home","advisor","start"]], ["Work on your organization", ["dash","tools","guides","map","actions","systems"]], ["Learn and contact", ["learn","refs","faq","request","about"]]]
};
const UI_ICONS = {
  home:'<path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"/>',
  advisor:'<circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5-5 2 2-5z"/>',
  start:'<path d="M5 21V4h11l-2 4 2 4H5"/>',
  dash:'<path d="M4 19v-7M10 19V5M16 19v-5M3 21h18"/>',
  tools:'<rect x="3.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.5"/>',
  guides:'<path d="M4 19V5a2 2 0 0 1 2-2h14v14H6a2 2 0 0 0-2 2 2 2 0 0 0 2 2h14"/>',
  map:'<circle cx="6" cy="6" r="2.5"/><circle cx="18" cy="6" r="2.5"/><circle cx="12" cy="18" r="2.5"/><path d="M8 7.5l3 8M16 7.5l-3 8M8.5 6h7"/>',
  actions:'<path d="M10 6h10M10 12h10M10 18h10M4 6l1.2 1.2L7.5 5M4 12l1.2 1.2 2.3-2.2M4 18l1.2 1.2 2.3-2.2"/>',
  systems:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3"/><path d="M12 3v6M12 15v6M3 12h6M15 12h6"/>',
  learn:'<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10.5c.7.7 1 1.5 1 2.5h6c0-1 .3-1.8 1-2.5A6 6 0 0 0 12 3z"/>',
  refs:'<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
  faq:'<circle cx="12" cy="12" r="9"/><path d="M9.5 9.2a2.5 2.5 0 1 1 3.4 2.3c-.6.3-.9.8-.9 1.5v.5M12 17h.01"/>',
  request:'<path d="M4 5h16v11H9l-5 4z"/>',
  about:'<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  _:'<circle cx="12" cy="12" r="3"/>'
};
function uiMenu(){
  const m = $("mNav"); if(!m) return;
  const nav = UI[L].nav, names = new Map(nav);
  const groups = UI_GROUPS[L].map(([t, ks]) => [t, ks.filter(k => names.has(k))]);
  const rest = nav.map(([h]) => h).filter(h => !groups.some(g => g[1].includes(h)));
  groups[groups.length - 1][1].push(...rest);
  m.innerHTML = groups.filter(g => g[1].length).map(([t, ks]) => `<div class="mg" role="group" aria-label="${esc(t)}"><p class="mg-t" aria-hidden="true">${esc(t)}</p>${ks.map(k =>
    `<a href="#${k}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${UI_ICONS[k] || UI_ICONS._}</svg><span>${esc(names.get(k))}</span></a>`).join("")}</div>`).join("");
  markNav();
}
const uiRenderText0 = renderText;
renderText = function(){ uiRenderText0.apply(this, arguments); uiMenu(); };

/* ---------- home: each tool group and each group of references shows its first row; the rest opens on request ---------- */
const UI_T = {ar:{all:n=>`عرض الكل (${n})`, less:"عرض أقل"}, en:{all:n=>`Show all (${n})`, less:"Show less"}};
const uiOpenRows = new Set();
function uiClipGroups(root, gridSel, kind){
  if(!root) return;
  [...root.children].forEach((g, i) => {
    const grid = g.querySelector(gridSel); if(!grid) return;
    const key = kind + i, cards = [...grid.children].filter(c => !c.hidden);
    let btn = g.querySelector(":scope > .ui-more");
    const cols = grid.offsetWidth ? getComputedStyle(grid).gridTemplateColumns.split(" ").filter(Boolean).length : 0;
    /* the phone layout of the tool cards is already a single swipeable row, and a filtered list is short */
    const free = !cols || getComputedStyle(grid).gridAutoFlow.startsWith("column") || (kind === "gl" && glRole !== "all");
    const open = uiOpenRows.has(key);
    cards.forEach((c, j) => c.classList.toggle("ui-x", !free && !open && j >= cols));
    if(free || cards.length <= cols){ if(btn) btn.remove(); return; }
    if(!btn){ btn = document.createElement("button"); btn.type = "button"; btn.className = "ui-more"; g.appendChild(btn); }
    btn.setAttribute("aria-expanded", String(open));
    btn.innerHTML = `<span>${esc(open ? UI_T[L].less : UI_T[L].all(cards.length))}</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>`;
    btn.onclick = () => {
      if(open) uiOpenRows.delete(key); else uiOpenRows.add(key);
      uiClipHome();
      if(open) g.scrollIntoView({block:"nearest", behavior:REDUCED() ? "auto" : "smooth"});
    };
  });
}
/* a reference used by many tools lists six of them, then "+N" opens the rest */
const UI_CHIPS = 6;
function uiClipChips(){
  document.querySelectorAll("#refGroups .rc .used").forEach(u => {
    const links = [...u.querySelectorAll(":scope > a")], extra = links.length - UI_CHIPS;
    if(extra <= 0 || u.dataset.open) return;
    links.forEach((a, j) => a.classList.toggle("ui-x", j >= UI_CHIPS));
    let b = u.querySelector(":scope > .ui-chips");
    if(!b){ b = document.createElement("button"); b.type = "button"; b.className = "ui-chips"; u.appendChild(b); }
    b.textContent = "+" + extra; b.dir = "ltr"; b.setAttribute("aria-label", UI_T[L].all(links.length));
    b.onclick = () => { u.dataset.open = "1"; links.forEach(a => a.classList.remove("ui-x")); b.remove(); };
  });
}
function uiClipHome(){ uiClipChips(); uiClipGroups($("glGroups"), ".gl-cards", "gl"); uiClipGroups($("refGroups"), ".ref-cards", "rf"); }
function uiOpenRef(id){
  const c = document.getElementById(id), g = c && c.closest("#refGroups > *"); if(!g) return;
  const i = [...g.parentNode.children].indexOf(g); if(!uiOpenRows.has("rf" + i)){ uiOpenRows.add("rf" + i); uiClipHome(); }
}
const uiRenderGlance0 = renderGlance;
renderGlance = function(){ uiRenderGlance0.apply(this, arguments); uiClipHome(); };
const uiRenderHowRefs0 = renderHowRefs;
renderHowRefs = function(){ uiRenderHowRefs0.apply(this, arguments); uiClipHome(); };
const uiShowView0 = showView;
showView = function(){ uiShowView0.apply(this, arguments); uiClipHome(); };
/* a "source" link on a tool card, or an address ending in #ref-…, opens that card's group first so it can be reached */
document.addEventListener("click", e => { const a = e.target.closest('a[href^="#ref-"]'); if(a) uiOpenRef(a.getAttribute("href").slice(1)); }, true);
addEventListener("hashchange", () => { if(location.hash.startsWith("#ref-")) uiOpenRef(location.hash.slice(1)); });
let uiRz = 0; addEventListener("resize", () => { cancelAnimationFrame(uiRz); uiRz = requestAnimationFrame(uiClipHome); });
