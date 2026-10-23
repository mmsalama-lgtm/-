/* ===================== INTEGRATION MAP (#map) — step 15, 2026-10-22 =====================
   Built from data, not from memory: CIA_LINKS is tests/build/links.json (tests/build/links_inventory.py scans every tool for the other tools'
   storage keys and the link panels' configurations) with the type of each link. Centre: the organization profile; around it the cycle
   Profile → Assess → Analyse → Improve → Monitor → Re-assess; seven branches (the seven systems) with every tool as a node. */
__CIA_LINKS__
const MAPU = {
 ar:{title:"خريطة التكامل", sub:"كيف تُكمل الأدوات التسع والثلاثون بعضها حول منشأة واحدة. مرّر المؤشر على أداة (أو المسها) لترى ما تقرؤه وما يقرؤها، واضغط لفتحها.",
  org:"ملف المنشأة", orgSub:"الاسم · الشعار · المواقع · النطاق", cycle:["الملف","التقييم","التحليل","التحسين","المتابعة","إعادة التقييم"],
  types:{start:["ابدأ من","يبدأ سجلاً جديداً هنا من سجل في الأداة الأخرى"],panel:["لوحة","يعرض سجلات الأداة الأخرى للقراءة فقط"],outcome:["مُخرَج","الأداة الأخرى ترسل مخرجاً إلى هنا"],reads:["يقرأ النتائج","يقرأ نتائج الأداة الأخرى بقواعدها"]},
  legend:"دليل أنواع الروابط", profile:"ملف المنشأة يصل إلى كل أداة: غلاف التقارير وتعبئة بيانات المنشأة والاقتراحات.",
  feeds:"تغذّي هذه الأداة ←", fedBy:"تتغذى هذه الأداة من →", none:"لا روابط بعد.", open:"افتح الأداة", pick:"اختر أداة من الخريطة لترى روابطها.",
  stats:(l,t,i)=>[[l,"رابط للقراءة فقط"],[t,"أداة"],[i,"أداة بلا رابط"]], phone:"على الهاتف تظهر الخريطة فروعاً قابلة للطي.", links:"روابط"},
 en:{title:"Integration map", sub:"How the 39 tools complete each other around one organization. Hover over a tool (or tap it) to see what it reads and what reads it; click to open it.",
  org:"Organization profile", orgSub:"name · logo · sites · scope", cycle:["Profile","Assess","Analyse","Improve","Monitor","Re-assess"],
  types:{start:["Start from","starts a new record here from a record in the other tool"],panel:["Panel","shows the other tool's records, read-only"],outcome:["Outcome","the other tool sends an outcome here"],reads:["Reads results","reads the other tool's results by its own rules"]},
  legend:"Link types", profile:"The organization profile reaches every tool: report covers, filling the organization's details, suggestions.",
  feeds:"This tool feeds →", fedBy:"This tool is fed by ←", none:"No links yet.", open:"Open the tool", pick:"Pick a tool on the map to see its links.",
  stats:(l,t,i)=>[[l,"read-only links"],[t,"tools"],[i,"tools with no link"]], phone:"On a phone the map shows as collapsible branches.", links:"links"}
};
const mapU = () => MAPU[L];
const MAP_COL = {iso:"#1E8C93", grc:"#7B5BB8", pmo:"#3563C9", exc:"#B8901E", str:"#3C9A5F", aud:"#C9821A", ai:"#C2410C"};
const MAP_DASH = {start:"", panel:"7 5", outcome:"2 5", reads:"1 0"};
let mapSel = null;
function mapEdges(){ const out = []; Object.keys(CIA_LINKS).forEach(t=>CIA_LINKS[t].forEach(([s,ty])=>out.push({s, t, ty}))); return out; }
function mapRel(k){ const E = mapEdges(); return {feeds:E.filter(e=>e.s===k), fed:E.filter(e=>e.t===k)}; }
function mapLayout(){
  const W = 1200, H = 1060, cx = W/2, cy = H/2, sys = SYSTEMS.map(s=>({id:s.id, tools:CIADASH.TOOLS.filter(t=>t.sys===s.id)})).filter(s=>s.tools.length);
  const wsum = sys.reduce((a,s)=>a+s.tools.length+1.6,0); let a0 = -Math.PI/2 - (sys[0].tools.length+1.6)/wsum*Math.PI;
  const P = {}, S = [];
  sys.forEach(s=>{ const span = (s.tools.length+1.6)/wsum*2*Math.PI, mid = a0+span/2;
    S.push({id:s.id, a:mid, a0, a1:a0+span, x:cx+Math.cos(mid)*262, y:cy+Math.sin(mid)*262});
    const n = s.tools.length, two = n>5;
    s.tools.forEach((t,i)=>{ const f = n===1 ? .5 : (i+.5)/n, ang = a0+span*(.06+.88*f), r = two ? (i%2 ? 488 : 400) : 430;
      P[t.k] = {k:t.k, sys:s.id, a:ang, x:cx+Math.cos(ang)*r, y:cy+Math.sin(ang)*r}; });
    a0 += span; });
  return {W, H, cx, cy, P, S};
}
/* the SVG, mirrored for Arabic; opts.static → plain colours for the report, opts.used → the tools that hold data */
function mapSVG(opts){
  opts = opts || {}; const u = mapU(), G = mapLayout(), rtl = L==="ar", X = x=>rtl ? G.W-x : x, st = !!opts.static;
  const col = s=>st ? MAP_COL[s] : `var(${(SYSTEMS.find(x=>x.id===s)||{}).color||"--c-iso"})`;
  const ink = st ? "#1B2A4A" : "var(--ink)", soft = st ? "#4B5874" : "var(--ink-soft)", surf = st ? "#FFFFFF" : "var(--surface)", line = st ? "#DCE4EE" : "var(--line)";
  let g = `<svg class="mp-svg" viewBox="0 0 ${G.W} ${G.H}" role="group" aria-labelledby="mpCap" ${st?'width="100%" style="max-width:100%;height:auto;font-family:inherit"':""} xmlns="http://www.w3.org/2000/svg">`;
  g += `<defs>${["start","panel","outcome","reads"].map(ty=>`<marker id="mpA-${ty}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="${ty==="outcome"?"#C2410C":ink}" opacity=".7"/></marker>`).join("")}</defs>`;
  /* branches */
  G.S.forEach(s=>{ g += `<path d="M${X(G.cx)} ${G.cy} L${X(s.x)} ${s.y}" stroke="${col(s.id)}" stroke-width="5" stroke-linecap="round" opacity=".28"/>`; });
  G.S.forEach(s=>{ const T = CIADASH.TOOLS.filter(t=>t.sys===s.id); T.forEach(t=>{ const p = G.P[t.k]; g += `<path d="M${X(s.x)} ${s.y} Q${X((s.x+p.x)/2)} ${(s.y+p.y)/2} ${X(p.x)} ${p.y}" stroke="${col(s.id)}" stroke-width="2" fill="none" opacity=".25"/>`; }); });
  /* links */
  const used = opts.used || null;
  g += `<g class="mp-edges">` + mapEdges().map(e=>{ const a = G.P[e.s], b = G.P[e.t]; if(!a||!b) return "";
     if(used && !(used.has(e.s) && used.has(e.t))) return "";
     const mx = (a.x+b.x)/2, my = (a.y+b.y)/2, qx = G.cx+(mx-G.cx)*.32, qy = G.cy+(my-G.cy)*.32;
     return `<path class="mp-e" data-s="${e.s}" data-t="${e.t}" data-ty="${e.ty}" d="M${X(a.x)} ${a.y} Q${X(qx)} ${qy} ${X(b.x)} ${b.y}" fill="none" stroke="${col(a.sys)}" stroke-width="${e.ty==="outcome"?2.6:(e.ty==="reads"?1.2:1.8)}" ${MAP_DASH[e.ty]&&e.ty!=="reads"?`stroke-dasharray="${MAP_DASH[e.ty]}"`:""} marker-end="url(#mpA-${e.ty})" opacity="${st?.45:.16}"/>`; }).join("") + `</g>`;
  /* centre: the organization and the cycle */
  const has = CIAORG.has(), p = CIAORG.get(), nm = has ? CIAORG.name(L) : u.org;
  g += `<circle cx="${G.cx}" cy="${G.cy}" r="150" fill="none" stroke="${st?"#B8901E":"var(--gold)"}" stroke-width="1.5" stroke-dasharray="3 6" opacity=".7"/>`;
  u.cycle.forEach((c,i)=>{ const ang = -Math.PI/2 + i*Math.PI/3, x = G.cx+Math.cos(ang)*150, y = G.cy+Math.sin(ang)*150;
    g += `<g class="mp-cy"><rect x="${X(x)-52}" y="${y-14}" width="104" height="28" rx="14" fill="${surf}" stroke="${st?"#B8901E":"var(--gold)"}"/><text x="${X(x)}" y="${y+5}" text-anchor="middle" font-size="13" font-weight="700" fill="${ink}">${esc(c)}</text></g>`; });
  g += `<circle cx="${G.cx}" cy="${G.cy}" r="94" fill="${st?"#1B2A4A":"var(--navy)"}"/>`;
  if(has && p.logo) g += `<image href="${esc(p.logo)}" x="${G.cx-32}" y="${G.cy-66}" width="64" height="64" preserveAspectRatio="xMidYMid meet"/>`;
  else g += `<path transform="translate(${G.cx-17} ${G.cy-62}) scale(1.45)" d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-4h6v4" stroke="#E6CF8A" stroke-width="2" fill="none"/>`;
  const nml = nm.length>26 ? nm.slice(0,25)+"…" : nm;
  g += `<text x="${G.cx}" y="${G.cy+20}" text-anchor="middle" font-size="15" font-weight="700" fill="#fff">${esc(nml)}</text><text x="${G.cx}" y="${G.cy+42}" text-anchor="middle" font-size="11.5" fill="#D9E1EE">${esc(has?u.org:u.orgSub)}</text>`;
  /* system labels */
  G.S.forEach(s=>{ const sy = SYSTEMS.find(x=>x.id===s.id), t = sy.short[L].join(" "), w = Math.max(96, t.length*(L==="ar"?8:7.4)+26);
    g += `<g class="mp-sys"><rect x="${X(s.x)-w/2}" y="${s.y-17}" width="${w}" height="34" rx="17" fill="${col(s.id)}"/><text x="${X(s.x)}" y="${s.y+5}" text-anchor="middle" font-size="13.5" font-weight="700" fill="#fff">${esc(t)}</text></g>`; });
  /* tool nodes */
  CIADASH.TOOLS.forEach(t=>{ const q = G.P[t.k]; if(!q) return; const code = String(t.code), w = Math.max(64, code.length*8.6+24), nmx = t.n[L].length>22 ? t.n[L].slice(0,21)+"…" : t.n[L];
    const dim = used && !used.has(t.k);
    g += `<g class="mp-n${dim?" dim":""}" data-k="${t.k}" ${st?"":`tabindex="0" role="link" aria-label="${esc(t.code+" — "+t.n[L])}"`} opacity="${dim?.38:1}"><title>${esc(t.code+" — "+t.n[L])}</title>`+
      `<rect x="${X(q.x)-w/2}" y="${q.y-15}" width="${w}" height="30" rx="9" fill="${surf}" stroke="${col(q.sys)}" stroke-width="2.4"/>`+
      `<text x="${X(q.x)}" y="${q.y+5}" text-anchor="middle" font-size="13" font-weight="800" fill="${col(q.sys)}" style="direction:ltr">${esc(code)}</text>`+
      `<text x="${X(q.x)}" y="${q.y+31}" text-anchor="middle" font-size="11" fill="${soft}">${esc(nmx)}</text></g>`; });
  return g + `</svg>`;
}
function mapSide(k){
  const u = mapU(), box = $("mpSide"); if(!box) return;
  if(!k){ box.innerHTML = `<p class="mp-pick">${esc(u.pick)}</p>`; return; }
  const t = CIADASH.TOOLS.find(x=>x.k===k), R = mapRel(k), nm = x=>{ const z = CIADASH.TOOLS.find(y=>y.k===x); return z ? z.code+" · "+z.n[L] : x; };
  const li = (e, other)=>`<li><span class="mp-ty ${e.ty}">${esc(u.types[e.ty][0])}</span><a href="${URLS[other]}" data-mod="${other}">${esc(nm(other))}</a></li>`;
  box.innerHTML = `<h3><span class="dc-code">${esc(t.code)}</span> ${esc(t.n[L])}</h3><a class="btn primary" href="${URLS[k]}" data-mod="${k}">${esc(u.open)}</a>`+
    `<h4>${esc(u.feeds)} <small>${R.feeds.length}</small></h4>${R.feeds.length?`<ul>${R.feeds.map(e=>li(e,e.t)).join("")}</ul>`:`<p class="mp-pick">${esc(u.none)}</p>`}`+
    `<h4>${esc(u.fedBy)} <small>${R.fed.length}</small></h4>${R.fed.length?`<ul>${R.fed.map(e=>li(e,e.s)).join("")}</ul>`:`<p class="mp-pick">${esc(u.none)}</p>`}`;
}
function mapHi(k){
  const svg = document.querySelector("#mpWrap svg"); if(!svg) return;
  svg.classList.toggle("act", !!k);
  const rel = new Set(k ? [k] : []);
  svg.querySelectorAll(".mp-e").forEach(e=>{ const on = !!k && (e.dataset.s===k || e.dataset.t===k); e.classList.toggle("on", on); if(on){ rel.add(e.dataset.s); rel.add(e.dataset.t); } });
  svg.querySelectorAll(".mp-n").forEach(n=>n.classList.toggle("on", rel.has(n.dataset.k)));
  mapSide(k);
}
let mapPtr = "mouse";
function renderMap(){
  const u = mapU(), E = mapEdges(), iso = CIADASH.TOOLS.filter(t=>!E.some(e=>e.s===t.k||e.t===t.k)).length;
  $("mpTitle").textContent = u.title; $("mpSub").textContent = u.sub;
  $("mpStats").innerHTML = u.stats(E.length, CIADASH.TOOLS.length, iso).map(([n,t])=>`<span><b>${n}</b> ${esc(t)}</span>`).join("");
  $("mpWrap").innerHTML = mapSVG() + `<p class="sr" id="mpCap">${esc(u.title)}</p>`;
  $("mpLeg").innerHTML = `<h4>${esc(u.legend)}</h4><ul>${Object.keys(u.types).map(ty=>`<li><svg width="46" height="12" aria-hidden="true"><path d="M2 6H40" stroke="var(--ink)" stroke-width="${ty==="outcome"?2.6:(ty==="reads"?1.2:1.8)}" ${MAP_DASH[ty]&&ty!=="reads"?`stroke-dasharray="${MAP_DASH[ty]}"`:""}/><path d="M38 2L44 6L38 10z" fill="var(--ink)"/></svg><b>${esc(u.types[ty][0])}</b><span>${esc(u.types[ty][1])}</span></li>`).join("")}<li><i class="mp-org-ic" aria-hidden="true"></i><span>${esc(u.profile)}</span></li></ul>`;
  /* phones: collapsible branches */
  $("mpList").innerHTML = `<p class="mp-pick">${esc(u.phone)}</p>` + SYSTEMS.filter(s=>CIADASH.TOOLS.some(t=>t.sys===s.id)).map(s=>`<details class="mp-br" style="--c:var(${s.color})"><summary><i></i>${esc(s.name[L])} <small>${CIADASH.TOOLS.filter(t=>t.sys===s.id).length}</small></summary><ul>${CIADASH.TOOLS.filter(t=>t.sys===s.id).map(t=>{ const R = mapRel(t.k);
      return `<li><details class="mp-tl"><summary><span class="dc-code">${esc(t.code)}</span> ${esc(t.n[L])} <small>${R.feeds.length+R.fed.length} ${esc(u.links)}</small></summary><div class="mp-tlb" data-k="${t.k}"></div></details></li>`; }).join("")}</ul></details>`).join("");
  $("mpList").querySelectorAll("details.mp-tl").forEach(d=>d.ontoggle = ()=>{ if(!d.open) return; const b = d.querySelector(".mp-tlb"), k = b.dataset.k, R = mapRel(k), nm = x=>{ const z = CIADASH.TOOLS.find(y=>y.k===x); return z ? z.code+" · "+z.n[L] : x; };
    b.innerHTML = `<a class="btn primary" href="${URLS[k]}" data-mod="${k}">${esc(u.open)}</a><h4>${esc(u.feeds)}</h4>${R.feeds.length?`<ul>${R.feeds.map(e=>`<li><span class="mp-ty ${e.ty}">${esc(u.types[e.ty][0])}</span>${esc(nm(e.t))}</li>`).join("")}</ul>`:`<p class="mp-pick">${esc(u.none)}</p>`}<h4>${esc(u.fedBy)}</h4>${R.fed.length?`<ul>${R.fed.map(e=>`<li><span class="mp-ty ${e.ty}">${esc(u.types[e.ty][0])}</span>${esc(nm(e.s))}</li>`).join("")}</ul>`:`<p class="mp-pick">${esc(u.none)}</p>`}`; });
  const svg = document.querySelector("#mpWrap svg");
  svg.addEventListener("pointerdown", e=>{ mapPtr = e.pointerType||"mouse"; });
  svg.querySelectorAll(".mp-n").forEach(n=>{ const k = n.dataset.k;
    n.addEventListener("mouseenter", ()=>{ if(mapPtr==="mouse") mapHi(k); });
    n.addEventListener("focus", ()=>mapHi(k));
    n.addEventListener("click", ()=>{ if(mapPtr!=="mouse" && mapSel!==k){ mapSel = k; mapHi(k); return; } openModule(k); });
    n.addEventListener("keydown", e=>{ if(e.key==="Enter"||e.key===" "){ e.preventDefault(); openModule(k); } }); });
  svg.addEventListener("mouseleave", ()=>{ if(mapPtr==="mouse") mapHi(mapSel); });
  mapHi(mapSel);
}
