/* ===================== HOME v2 + TOOL ADVISOR — logic (2026-10-11) ===================== */
UI.en.nav = [["home","Home"],["advisor","Advisor"],["start","Start here"],["dash","Dashboard"],["tools","Tools"],["systems","Systems"],["learn","Knowledge"],["refs","Official references"],["faq","FAQ"],["request","Request a service"],["about","About"]];
UI.ar.nav = [["home","الرئيسية"],["advisor","المرشد"],["start","ابدأ هنا"],["dash","لوحة الأداء"],["tools","الأدوات"],["systems","المنظومات"],["learn","المعرفة"],["refs","المراجع الرسمية"],["faq","الأسئلة الشائعة"],["request","اطلب خدمة"],["about","من نحن"]];
/* the desktop bar keeps nine items; "Start here" and FAQ stay in the phone menu, the footer and the command search */
UI.en.navTop = UI.en.nav.filter(([h])=>h!=="start" && h!=="faq"); UI.ar.navTop = UI.ar.nav.filter(([h])=>h!=="start" && h!=="faq");
UI.en.fLinks = [["start","Start here"], ...UI.en.fLinks]; UI.ar.fLinks = [["start","ابدأ هنا"], ...UI.ar.fLinks];
UI.en.tour.steps = [["#heroAdv","Find the right tools","Answer 14 short questions and get the tools that fit your organization, with a simple starting plan."], ...UI.en.tour.steps,
  ["#refs .sec-head","Official references","The official sites of the bodies behind the standards and models, checked and grouped in one place."]];
UI.ar.tour.steps = [["#heroAdv","اعثر على الأدوات المناسبة","أجب عن 14 سؤالاً قصيراً لتحصل على الأدوات المناسبة لمنشأتك مع خطة بداية بسيطة."], ...UI.ar.tour.steps,
  ["#refs .sec-head","المراجع الرسمية","المواقع الرسمية للجهات التي تقف خلف المواصفات والنماذج، متحقق منها ومجمّعة في مكان واحد."]];
UI.en.tour.steps[1][1] = "The tool wheel"; UI.ar.tour.steps[1][1] = "عجلة الأدوات";

const H = () => H2[L];
const REDUCED = () => matchMedia("(prefers-reduced-motion:reduce)").matches;
const ovOpen = () => $("modOverlay").classList.contains("on");
const tkOf = k => TOOLKITS.find(t=>t.k===k);
const tName = k => { const t = tkOf(k); return t ? t.title[L] : modLabel(k); };
const tCode = k => { const t = tkOf(k); return t ? `${t.pre} ${t.code}` : k; };
const logoSrc = () => (document.querySelector(".brand img")||{}).src || "";
const refName = id => { const r = REFS.find(x=>x.id===id); return r ? r.n[L].split(" — ")[0] : id; };
const refUrl = r => typeof r.url==="object" ? r.url[L] : r.url;
const SVG = p => `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
const VAL_ICO = [SVG('<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.8 3 2.8 15 0 18M12 3c-2.8 3-2.8 15 0 18"/>'), SVG('<path d="M9 12l2 2 4-4"/><path d="M12 3l7 4v5c0 4.5-3 7.6-7 9-4-1.4-7-4.5-7-9V7z"/>'),
  SVG('<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>'), SVG('<path d="M14 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8z"/><path d="M14 3v5h5M9 13h6M9 17h4"/>'),
  SVG('<rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>'), SVG('<path d="M20 12v8a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-8"/><path d="M2 7h20v5H2zM12 21V7M12 7c-1.5-3-5-3.5-5-1s3 1 5 1zM12 7c1.5-3 5-3.5 5-1s-3 1-5 1z"/>')];
const CHEV_S = d => `<svg class="${d>0?"flip":""}" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true"><path d="${d>0?"m9 6 6 6-6 6":"m15 6-6 6 6 6"}"/></svg>`;

/* ---------- counters: computed from the data (never typed in) ---------- */
function homeCounts(){
  const ks = TOOLKITS.map(t=>t.k).filter(k=>URLS[k] && TOOLINFO[k]);
  return {tools:new Set(SYSTEMS.flatMap(s=>s.mods.filter(m=>m.status==="live").map(m=>URLS[m.k]||m.url||m.name.en))).size,
    systems:SYSTEMS.length, q:ks.reduce((a,k)=>a+(TOOLINFO[k].q||0),0), tpl:ks.reduce((a,k)=>a+(TOOLINFO[k].tpl||0),0), std:COVER_N};
}
let ctrDone = false;
function ctrAnimate(){
  if(ctrDone) return; ctrDone = true;
  const els = [...document.querySelectorAll("#ctrs b[data-n]")];
  if(REDUCED()){ els.forEach(e=>e.textContent = e.dataset.n); return; }
  const t0 = performance.now(), D = 1100;
  const step = t => { const p = Math.min(1,(t-t0)/D), e = 1-Math.pow(1-p,3);
    els.forEach(el=>{ el.textContent = String(Math.round(+el.dataset.n*e)); }); if(p<1) requestAnimationFrame(step); };
  requestAnimationFrame(step);
}

/* ---------- hero, counters, value strip, news, tool of the week ---------- */
function renderHero(){
  const h = H(), c = homeCounts();
  document.querySelectorAll("img[data-logo]").forEach(i=>{ if(!i.getAttribute("src")) i.src = logoSrc(); });
  const set = (id,v)=>{ const e=$(id); if(e) e.textContent = v; };
  set("kicker", h.kicker); set("h2Brand", UI[L].brandSub); $("h1").innerHTML = h.h1; set("lede", h.lede);
  set("ctaAdv", h.adv); set("cta1", h.browse); set("cta3", h.consult); set("byLbl", h.by); set("byName", h.author);
  document.documentElement.classList.remove("pre-en");
  const st = $("h2Stage");
  if(st){ const big = innerWidth > 700; st.dataset.big = big ? "1" : "0";
    st.innerHTML = big ? HERO_SHOTS.map(s=>`<div class="h2-fr"><img src="${shotSrc(s)}" alt="" decoding="async" loading="lazy" width="1413" height="882"></div>`).join("") : ""; }
  $("ctrs").innerHTML = h.ctr.map(([k,lab])=>`<div class="ctr"><b data-n="${c[k]}" data-k="${k}">${ctrDone||REDUCED()?c[k]:0}</b><span>${esc(lab)}</span></div>`).join("");
  set("ctrNote", h.ctrNote);
  set("valK", h.valK); set("valT", h.valT);
  $("vals").innerHTML = h.vals.map((v,i)=>`<div class="val"><i>${VAL_ICO[i]||""}</i><div><b>${esc(v[0])}</b><span>${esc(v[1])}</span></div></div>`).join("");
  const news = NEWS.filter(n=>URLS[n.k]).slice().sort((a,b)=>b.d.localeCompare(a.d)).slice(0,5);
  const fmt = d => new Date(d+"T00:00:00").toLocaleDateString(L==="ar"?"ar-EG-u-nu-latn":"en-GB",{day:"numeric",month:"short",year:"numeric"});
  $("nwBox").innerHTML = `<h3><i></i>${esc(h.nwT)}</h3><ul>${news.map(n=>`<li><span class="c">${esc(tCode(n.k))}</span><span>${esc(n.t[L])}</span><time datetime="${n.d}">${esc(fmt(n.d))}</time><a href="${URLS[n.k]}" data-mod="${n.k}" data-modname="${esc(tName(n.k))}">${esc(h.nwOpen)}: ${esc(tName(n.k))}</a></li>`).join("")}</ul>`;
  /* tool of the week: the ISO week number picks one live tool, in TOOLKITS order */
  const live = TOOLKITS.filter(t=>URLS[t.k] && TOOLINFO[t.k]), now = new Date(), d1 = new Date(Date.UTC(now.getFullYear(),0,1));
  const wk = Math.ceil(((now - d1)/864e5 + d1.getUTCDay() + 1)/7), tw = live[(now.getFullYear()*53 + wk) % live.length], ti = TOOLINFO[tw.k];
  const box = $("towBox"); box.style.setProperty("--c", `var(${tw.color})`);
  box.innerHTML = `<h3>${esc(h.towT)}</h3><div class="tw-code">${esc(tw.pre)} ${esc(tw.code)}<small>${esc(tw.title[L])}</small></div><p>${esc(ti.brief[L])} ${esc(ti.why[L])}</p>
    <a class="btn primary" href="${URLS[tw.k]}#${ti.start}" data-mod="${tw.k}" data-anchor="${ti.start}" data-modname="${esc(tw.title[L])}">${esc(h.towOpen)} ${EXT}</a>`;
}
const shotSrc = (key, lang) => `assets/shots/${key}-${lang||L}.webp`;

/* ---------- showcase carousel ---------- */
const CAR = {i:0, user:true, hold:false, seen:false, timer:null, touchT:null};
function carPlaying(){ return CAR.user && !REDUCED(); }
function renderCarousel(){
  const h = H(), N = SHOTS.length, car = $("car");
  $("scK").textContent = h.scK; $("scT").textContent = h.scT; $("scS").textContent = h.scS;
  $("carStage").innerHTML = `<span class="car-tag">${esc(h.scTag)}</span>` + SHOTS.map((s,i)=>{
    const alt = `${tCode(s.k)} — ${tName(s.k)}: ${s.cap[L]}`;
    return `<div class="car-sl" role="group" aria-roledescription="slide" aria-label="${esc(h.slide(i+1,N))}"><img data-src="${shotSrc(s.k+"-"+s.v)}" alt="${esc(alt)}" width="1413" height="882" decoding="async" loading="lazy"></div>`; }).join("");
  $("carDots").innerHTML = SHOTS.map((s,i)=>`<button type="button" aria-label="${esc(h.slide(i+1,N)+" · "+tCode(s.k))}"></button>`).join("");
  $("carDots").querySelectorAll("button").forEach((b,i)=>b.onclick=()=>{ carShow(i); carArm(); });
  const rtl = L==="ar";
  $("carPrev").innerHTML = CHEV_S(-1); $("carNext").innerHTML = CHEV_S(1);
  $("carPrev").setAttribute("aria-label", h.prev); $("carNext").setAttribute("aria-label", h.next);
  $("carPrev").onclick = ()=>{ carShow(CAR.i-1); carArm(); }; $("carNext").onclick = ()=>{ carShow(CAR.i+1); carArm(); };
  carPlayBtn();
  car.setAttribute("aria-label", h.scT);
  carShow(CAR.i, true);
}
function carPlayBtn(){
  const b = $("carPlay"), h = H(), on = carPlaying();
  b.innerHTML = on ? SVG('<path d="M9 5v14M15 5v14"/>') : SVG('<path d="M7 5l12 7-12 7z"/>');
  b.setAttribute("aria-label", on ? h.pause : h.play); b.setAttribute("aria-pressed", String(!on));
  $("car").classList.toggle("play", on);
  b.onclick = ()=>{ CAR.user = !CAR.user; carPlayBtn(); carArm(); };
}
function carLoad(i){ const sl = $("carStage").querySelectorAll(".car-sl")[(i+SHOTS.length)%SHOTS.length]; if(!sl) return; const im = sl.querySelector("img"); if(im && !im.getAttribute("src")) im.src = im.dataset.src; }
function carShow(i, quiet){
  const N = SHOTS.length; CAR.i = ((i%N)+N)%N;
  const sls = $("carStage").querySelectorAll(".car-sl");
  sls.forEach((s,j)=>{ const on = j===CAR.i; s.classList.toggle("on", on); s.setAttribute("aria-hidden", String(!on));
    if(on){ const im = s.querySelector("img"); if(im){ im.style.animation = "none"; void im.offsetWidth; im.style.animation = ""; } } });
  $("carDots").querySelectorAll("button").forEach((b,j)=>b.setAttribute("aria-current", String(j===CAR.i)));
  if(CAR.seen){ carLoad(CAR.i); carLoad(CAR.i+1); }
  const s = SHOTS[CAR.i], h = H(), anchor = s.tab;
  $("carCap").setAttribute("aria-live", quiet ? "off" : "polite");
  $("carCap").innerHTML = `<span class="cc-code">${esc(tCode(s.k))}</span><p><b>${esc(tName(s.k))}.</b> ${esc(s.cap[L])}</p><a class="btn primary" href="${URLS[s.k]}#${anchor}" data-mod="${s.k}" data-anchor="${anchor}" data-modname="${esc(tName(s.k))}">${esc(h.scOpen)} ${EXT}</a>`;
}
function carArm(){
  clearTimeout(CAR.timer);
  if(!carPlaying()) return;
  CAR.timer = setTimeout(()=>{ if(carPlaying() && !CAR.hold && CAR.seen && !document.hidden && curView==="home" && !ovOpen()) carShow(CAR.i+1, true); carArm(); }, 5000);
}
(function carEvents(){
  const car = $("car"); if(!car) return;
  car.addEventListener("mouseenter", ()=>{ CAR.hold = true; });
  car.addEventListener("mouseleave", ()=>{ CAR.hold = false; });
  car.addEventListener("focusin", ()=>{ CAR.hold = true; });
  car.addEventListener("focusout", e=>{ if(!car.contains(e.relatedTarget)) CAR.hold = false; });
  car.addEventListener("touchstart", ()=>{ CAR.hold = true; clearTimeout(CAR.touchT); }, {passive:true});
  car.addEventListener("touchend", ()=>{ clearTimeout(CAR.touchT); CAR.touchT = setTimeout(()=>{ CAR.hold = false; }, 6000); }, {passive:true});
  car.addEventListener("keydown", e=>{
    if(e.target.closest("a,button") && e.target !== car && !e.target.closest(".car-ctl")) return;
    const rtl = document.documentElement.dir==="rtl";
    if(e.key==="ArrowRight"){ e.preventDefault(); carShow(CAR.i + (rtl?-1:1)); carArm(); }
    else if(e.key==="ArrowLeft"){ e.preventDefault(); carShow(CAR.i + (rtl?1:-1)); carArm(); }
  });
  let x0 = null, y0 = null;
  const st = $("carStage");
  st.addEventListener("pointerdown", e=>{ x0 = e.clientX; y0 = e.clientY; });
  st.addEventListener("pointerup", e=>{ if(x0==null) return; const dx = e.clientX-x0, dy = e.clientY-y0; x0 = null;
    if(Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)){ const rtl = document.documentElement.dir==="rtl"; carShow(CAR.i + ((dx<0) !== rtl ? 1 : -1)); carArm(); } });
  st.addEventListener("pointercancel", ()=>{ x0 = null; });
})();

/* ---------- tools at a glance + pick by role ---------- */
let glRole = "all"; const glOpen = new Set();
function renderGlance(){
  const h = H(), u = UI[L];
  $("glK").textContent = h.glK; $("glT").textContent = h.glT; $("glS").textContent = h.glS;
  const rb = $("roles"); rb.setAttribute("aria-label", h.rolesAria);
  rb.innerHTML = [["all", h.allRoles], ...Object.entries(ROLES).map(([k,v])=>[k, v[L]])].map(([k,t])=>`<button type="button" class="chip" data-r="${k}" aria-pressed="${glRole===k}">${esc(t)}</button>`).join("");
  rb.querySelectorAll(".chip").forEach(b=>b.onclick=()=>{ glRole = b.dataset.r; renderGlance(); });
  const card = t => { const ti = TOOLINFO[t.k] || {}, roles = ti.roles||[], show = glRole==="all" || roles.includes(glRole), open = glOpen.has(t.k);
    const src = (ti.refs||[]).map(id=>`<a href="#ref-${id}">${esc(refName(id))}</a>`).join(" · ");
    return `<article class="gc${open?" open":""}" data-k="${t.k}" data-roles="${roles.join(" ")}" style="--c:var(${t.color})" ${show?"":"hidden"}>
      <div class="gc-h"><div class="gc-code"><span class="pre">${esc(t.pre)}</span>${esc(t.code)}</div><span class="gc-st"><i></i>${esc(h.live)}</span></div>
      <h3>${esc(t.title[L])}</h3><p class="gb">${esc(ti.brief?ti.brief[L]:"")}</p>
      <div class="gc-more" id="gcm-${t.k}"><div><b>${esc(h.why)}</b>${esc(ti.why?ti.why[L]:"")}</div><div><b>${esc(h.gain)}</b>${esc(ti.gain?ti.gain[L]:"")}</div>
        <div><b>${esc(h.who)}</b>${esc(roles.map(r=>ROLES[r][L]).join(" · "))}</div><div><b>${esc(h.time)}</b>${esc(ti.time?ti.time[L]:"")}</div>
        <div><b>${esc(h.start)}</b>${esc(ti.startL?ti.startL[L]:"")}</div>${src?`<div class="src"><b>${esc(h.src)}</b>${src}</div>`:""}</div>
      <div class="gc-f"><a href="${URLS[t.k]}#${ti.start||""}" data-mod="${t.k}" data-anchor="${ti.start||""}" data-modname="${esc(t.title[L])}">${esc(u.open)} ${EXT}</a><button type="button" aria-expanded="${open}" aria-controls="gcm-${t.k}" data-x="${t.k}">${esc(open?h.less:h.more)}</button></div>
    </article>`; };
  const soonCard = x => `<article class="gc soon" style="--c:var(${SYSTEMS.find(s=>s.id===x.sys).color})" aria-disabled="true" ${glRole==="all"?"":"hidden"}>
      <div class="gc-h"><div class="gc-code"><span class="pre">${esc(x.pre)}</span>${esc(x.code)}</div><span class="soon-b">${esc(u.soon)}</span></div>
      <h3>${esc(x.name[L])}</h3><p class="gb">${esc(x.note[L])}</p></article>`;
  let shown = 0; const total = TOOLKITS.filter(t=>URLS[t.k]).length;
  $("glGroups").innerHTML = SYSTEMS.map(s=>{ const tools = TOOLKITS.filter(t=>TK_SYS[t.k]===s.id && URLS[t.k]), soon = soonOf(s.id);
    const vis = tools.filter(t=>glRole==="all" || (TOOLINFO[t.k]||{roles:[]}).roles.includes(glRole)).length; shown += vis;
    const any = vis + (glRole==="all" ? soon.length : 0);
    return `<div class="gl-grp" style="--c:var(${s.color})" ${any?"":"hidden"}><h3 class="gl-gh"><i></i>${esc(s.name[L])} <small>${esc(u.tkCount(tools.length))}</small></h3><div class="gl-cards">${tools.map(card).join("")}${soon.map(soonCard).join("")}</div></div>`; }).join("");
  $("glCount").textContent = h.glCount(shown, total);
  $("glGroups").querySelectorAll("button[data-x]").forEach(b=>b.onclick=()=>{ const k = b.dataset.x, c = b.closest(".gc"), op = !c.classList.contains("open");
    c.classList.toggle("open", op); b.setAttribute("aria-expanded", String(op)); b.textContent = op ? H().less : H().more; if(op) glOpen.add(k); else glOpen.delete(k); });
}
document.addEventListener("click", e=>{ const a = e.target.closest('a[href^="#ref-"]'); if(!a) return;
  const id = a.getAttribute("href").slice(1); setTimeout(()=>{ const c = document.getElementById(id); if(c){ c.classList.add("flash"); setTimeout(()=>c.classList.remove("flash"), 1800); } }, 120); });

/* ---------- wheel panel (beside the wheel; below it on phones) ---------- */
let wSel = 0, wAuto = true, wAutoHold = false, wInView = false, wTimer = null;
function wSelect(i, user){
  const N = SYSTEMS.length; wSel = ((i%N)+N)%N;
  if(user){ wAuto = false; }
  wpnRender();
}
function wpnRender(){
  const box = $("wpn"); if(!box) return;
  const h = H(), u = UI[L], s = SYSTEMS[wSel], N = SYSTEMS.length, tools = TOOLKITS.filter(t=>TK_SYS[t.k]===s.id && URLS[t.k]), soon = soonOf(s.id);
  const q = tools.reduce((a,t)=>a+((TOOLINFO[t.k]||{}).q||0),0), tp = tools.reduce((a,t)=>a+((TOOLINFO[t.k]||{}).tpl||0),0);
  box.style.setProperty("--c", `var(${s.color})`);
  box.innerHTML = `<div class="wpn-h"><span class="n">${tools.length}</span><div><small>${esc(h.sysOf(wSel+1,N))}</small><h3>${esc(s.name[L])}</h3></div></div>
    <div class="wpn-b"><div class="wpn-st"><div><span>${esc(h.pTools)}</span><b>${tools.length}</b></div><div><span>${esc(h.pQ)}</span><b>${q}</b></div><div><span>${esc(h.pTpl)}</span><b>${tp}</b></div></div>
      <div><b style="font-size:13px;color:var(--muted)">${esc(h.pStd)}</b><div class="wpn-chips" style="margin-top:6px">${tools.map(t=>`<span>${esc(t.pre+" "+t.code)}</span>`).join("")}</div></div>
      <p class="wpn-gain"><b>${esc(h.pGain)}</b>${esc(SYSGAIN[s.id][L])}</p>
      <div><b style="font-size:13px;color:var(--muted)">${esc(h.pList)}</b><ul class="wpn-list" style="margin-top:6px">${tools.map(t=>{ const ti = TOOLINFO[t.k]||{};
        return `<li><b>${esc(t.title[L])}</b><span>${esc(ti.brief?ti.brief[L]:"")}</span><a href="${URLS[t.k]}#${ti.start||""}" data-mod="${t.k}" data-anchor="${ti.start||""}" data-modname="${esc(t.title[L])}">${esc(u.open)}</a></li>`; }).join("")}${soon.map(x=>`<li class="soon"><b>${esc(x.name[L])}</b><span>${esc(x.note[L])}</span><em class="soon-b" style="grid-row:1/3;grid-column:2">${esc(u.soon)}</em></li>`).join("")}</ul></div>
      <div class="wpn-f"><button type="button" class="btn" id="wpnDet">${esc(h.pDet)}</button>${REDUCED()?"":`<button type="button" class="w-auto" id="wAutoBtn" aria-pressed="${wAuto}">${esc(wAuto?h.autoOn:h.autoOff)}</button>`}</div></div>`;
  $("wpnDet").onclick = ()=>sdOpen(wSel);
  const ab = $("wAutoBtn"); if(ab) ab.onclick = ()=>{ wAuto = !wAuto; wpnRender(); };
  document.querySelectorAll("#wheel .wseg").forEach(g=>g.classList.toggle("sel", +g.dataset.i===wSel));
  document.querySelectorAll("#wheelLeg .wl").forEach(b=>b.setAttribute("aria-pressed", String(+b.dataset.i===wSel)));
}
function wAutoTick(){
  if(wAuto && !REDUCED() && wInView && !wAutoHold && !document.hidden && curView==="home" && !ovOpen() && sdI<0) wSelect(wSel+1, false);
}
setInterval(wAutoTick, 4500);
(function(){ const ws = $("wheelSec"); if(!ws) return;
  ws.addEventListener("mouseenter", ()=>{ wAutoHold = true; }); ws.addEventListener("mouseleave", ()=>{ wAutoHold = false; });
  ws.addEventListener("focusin", ()=>{ wAutoHold = true; }); ws.addEventListener("focusout", e=>{ if(!ws.contains(e.relatedTarget)) wAutoHold = false; });
})();

/* ---------- how it works, references, FAQ teaser ---------- */
function renderHowRefs(){
  const h = H(), u = UI[L];
  $("wsK").textContent = h.wsK; $("wheelTitle").textContent = h.wsT; $("wsS").textContent = h.wsS;
  $("howK").textContent = h.howK; $("howT").textContent = h.howT; $("howS").textContent = h.howS;
  $("howSteps").innerHTML = u.steps.map((s,i)=>{ const [k,a] = HOWTOOLS[i]||[]; const ok = k && URLS[k];
    return `<li style="animation-delay:${i*120}ms"><span class="hn" style="animation-delay:${200+i*160}ms">${i+1}</span><b>${esc(s[0])}</b><span>${esc(s[1])}</span>${ok?`<a href="${URLS[k]}#${a}" data-mod="${k}" data-anchor="${a}" data-modname="${esc(tName(k))}">${esc(h.howOpen)}: ${esc(tName(k))}</a>`:""}</li>`; }).join("");
  $("refK").textContent = h.refK; $("refT").textContent = h.refT; $("refS").textContent = h.refS;
  const dt = new Date(REF_CHECKED+"T00:00:00").toLocaleDateString(L==="ar"?"ar-EG-u-nu-latn":"en-GB",{day:"numeric",month:"long",year:"numeric"});
  $("refNote").innerHTML = `${SVG('<path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="9"/>')}${esc(h.refNote(dt))}`;
  const other = L==="ar" ? "en" : "ar";
  $("refGroups").innerHTML = REF_GROUPS.map(([g,gl])=>{ const cards = REFS.filter(r=>r.g===g); if(!cards.length) return "";
    return `<div class="ref-g"><h3>${esc(gl[L])}</h3><div class="ref-cards">${cards.map(r=>{
      const used = TOOLKITS.filter(t=>URLS[t.k] && (TOOLINFO[t.k]||{refs:[]}).refs.includes(r.id));
      return `<article class="rc" id="ref-${r.id}"><span class="ext">${EXT}</span><h4>${esc(r.n[L])}</h4><span class="alt" lang="${other}" dir="${other==="ar"?"rtl":"ltr"}">${esc(r.n[other])}</span><span class="dom">${esc(r.dom)}</span><p>${esc(r.r[L])}</p>
        <div class="lnks"><a href="${esc(refUrl(r))}" target="_blank" rel="noopener">${esc(h.refOpen)}</a>${r.url2?`<a href="${esc(r.url2)}" target="_blank" rel="noopener">${esc(r.l2[L])}</a>`:""}</div>
        ${used.length?`<div class="used" aria-label="${esc(h.refUsed)}">${used.map(t=>`<a href="${URLS[t.k]}" data-mod="${t.k}" data-modname="${esc(t.title[L])}" title="${esc(t.title[L])}">${esc(t.pre+" "+t.code)}</a>`).join("")}</div>`:""}</article>`; }).join("")}</div></div>`; }).join("");
  $("fqtK").textContent = h.fqtK; $("fqtT").textContent = h.fqtT; $("fqtAll").innerHTML = `${esc(h.fqtAll)} ${ARROW}`;
  $("fqtList").innerHTML = u.faq.slice(0,4).map(f=>`<details><summary><span>${esc(f[0])}</span>${CHEV}</summary><p>${esc(f[1])}</p></details>`).join("");
  $("ctaT").textContent = h.ctaT; $("ctaP").textContent = h.ctaP; $("ctaC").textContent = h.ctaC; $("ctaTr").textContent = h.ctaTr;
  document.querySelectorAll("#fqcta [data-rq]").forEach(a=>a.onclick = e=>{ e.preventDefault(); rqOpen(a.dataset.rq); });
  const sb = $("srchBtn"); if(sb){ sb.setAttribute("aria-label", h.search+" (Ctrl K)"); sb.querySelector(".t").textContent = h.search; }
  const tt = $("toTop"); if(tt) tt.setAttribute("aria-label", h.toTop);
}

function renderHome2(){
  try{ renderHero(); }catch(e){ console.error(e); }
  try{ renderCarousel(); }catch(e){ console.error(e); }
  try{ renderGlance(); }catch(e){ console.error(e); }
  try{ renderHowRefs(); }catch(e){ console.error(e); }
  try{ wpnRender(); }catch(e){ console.error(e); }
  revealObserve(); setTimeout(revealSweep, 30);
}

/* ---------- observers: reveal on scroll, counters, carousel loading, wheel tour, header section highlight ---------- */
let revIO = null, refsInView = false;
function revealObserve(){
  const els = [...document.querySelectorAll(".rv:not(.in), #howSteps:not(.in)")];
  if(!("IntersectionObserver" in window) || REDUCED()){ els.forEach(e=>e.classList.add("in")); return; }
  if(!revIO) revIO = new IntersectionObserver(es=>es.forEach(en=>{ if(en.isIntersecting){ en.target.classList.add("in"); revIO.unobserve(en.target); } }), {rootMargin:"0px 0px -8% 0px", threshold:.08});
  els.forEach(e=>revIO.observe(e));
}
(function(){
  if(!("IntersectionObserver" in window)){ ctrAnimate(); CAR.seen = true; wInView = true; return; }
  new IntersectionObserver((es,o)=>es.forEach(en=>{ if(en.isIntersecting){ ctrAnimate(); o.disconnect(); } }), {threshold:.3}).observe($("ctrs"));
  new IntersectionObserver(es=>es.forEach(en=>{ if(en.isIntersecting && !CAR.seen){ CAR.seen = true; carLoad(CAR.i); carLoad(CAR.i+1); carArm(); } }), {rootMargin:"200px 0px"}).observe($("car"));
  new IntersectionObserver(es=>es.forEach(en=>{ wInView = en.isIntersecting; }), {threshold:.35}).observe($("wheelSec"));
  new IntersectionObserver(es=>es.forEach(en=>{ refsInView = en.isIntersecting; markNav(); }), {threshold:.2}).observe($("refs"));
})();
const _markNav0 = markNav;
markNav = function(){
  _markNav0();
  document.querySelectorAll("#nav a, #mNav a").forEach(a=>{ const hr = a.getAttribute("href");
    if(hr==="#refs") { if(curView==="home" && refsInView) a.setAttribute("aria-current","page"); }
    if(hr==="#home" && curView==="home" && refsInView) a.removeAttribute("aria-current"); });
};
addEventListener("resize", ()=>{ const st = $("h2Stage"); if(st && (innerWidth>700 ? "1":"0") !== st.dataset.big) renderHero(); });

/* ---------- back to top; reveal safety net (anything scrolled into or past view is shown even if an observer was missed) ---------- */
let revT = 0;
function revealSweep(){ document.querySelectorAll(".rv:not(.in), #howSteps:not(.in)").forEach(e=>{ const r = e.getBoundingClientRect(); if(r.height && r.top < innerHeight*0.98) e.classList.add("in"); }); }
addEventListener("scroll", ()=>{ const t = $("toTop"); if(t) t.classList.toggle("on", scrollY > 700); if(!revT) revT = requestAnimationFrame(()=>{ revT = 0; revealSweep(); }); }, {passive:true});
addEventListener("load", ()=>setTimeout(revealSweep, 60));
addEventListener("beforeprint", ()=>document.querySelectorAll(".rv, #howSteps").forEach(e=>e.classList.add("in")));
$("toTop").onclick = ()=>window.scrollTo({top:0, behavior: REDUCED() ? "auto" : "smooth"});

/* ---------- command search (Ctrl/⌘ + K) across tools, knowledge topics, references and pages ---------- */
let cmdSel = 0, cmdItems = [];
function cmdAll(){
  const h = H(), out = [];
  TOOLKITS.filter(t=>URLS[t.k]).forEach(t=>{ const ti = TOOLINFO[t.k]||{};
    out.push({g:"tool", k:t.pre+" "+t.code, t:t.title[L], hay:[t.pre,t.code,t.pre+" "+t.code,t.title.en,t.title.ar,t.ed.en,t.ed.ar,ti.brief?ti.brief.en:"",ti.brief?ti.brief.ar:""].join(" "), go:()=>openModule(t.k)}); });
  KNOW.forEach((k,i)=>out.push({g:"know", k:String(i+1), t:k[L][0], s:h.cmdKnow, hay:[k.en[0],k.ar[0],k.rel].join(" "),
    go:()=>{ if(k.guide && URLS[k.guide.k]) openModule(k.guide.k, undefined, k.guide.a); else { route("#learn"); setTimeout(()=>{ const d = document.querySelectorAll("#kpath details")[i]; if(d){ d.open = true; d.scrollIntoView({block:"center"}); } }, 80); } }}));
  REFS.forEach(r=>out.push({g:"ref", k:r.dom, t:r.n[L], s:h.cmdRef, hay:[r.n.en,r.n.ar,r.dom].join(" "), go:()=>window.open(refUrl(r), "_blank", "noopener")}));
  UI[L].nav.forEach(([hr,t])=>out.push({g:"page", k:"#", t, hay:t+" "+hr, go:()=>route("#"+hr)}));
  return out;
}
function cmdRender(q){
  const h = H(), w = tkNorm(q).split(/\s+/).filter(Boolean), all = cmdAll();
  cmdItems = (w.length ? all.filter(x=>{ const hy = tkNorm(x.hay+" "+x.t+" "+x.k); return w.every(v=>hy.includes(v)); }) : all.filter(x=>x.g!=="know")).slice(0,40);
  cmdSel = Math.min(cmdSel, Math.max(0, cmdItems.length-1));
  const l = $("cmdL"); let g = "", html = "";
  cmdItems.forEach((x,i)=>{ if(x.g!==g){ g = x.g; html += `<li class="grp" role="presentation">${esc(h.cmdG[g])}</li>`; }
    html += `<li class="it" role="option" id="cmd-${i}" data-i="${i}" aria-selected="${i===cmdSel}"><span class="k">${esc(x.k)}</span><span>${esc(x.t)}</span>${x.s?`<small>${esc(x.s)}</small>`:""}</li>`; });
  l.innerHTML = html || `<li class="none">${esc(h.cmdNone)}</li>`;
  $("cmdQ").setAttribute("aria-activedescendant", cmdItems.length ? "cmd-"+cmdSel : "");
  l.querySelectorAll("li.it").forEach(li=>{ li.onmousemove = ()=>{ if(cmdSel!==+li.dataset.i){ cmdSel = +li.dataset.i; cmdMark(); } }; li.onclick = ()=>cmdGo(+li.dataset.i); });
}
function cmdMark(){ document.querySelectorAll("#cmdL li.it").forEach(li=>li.setAttribute("aria-selected", String(+li.dataset.i===cmdSel)));
  const c = $("cmd-"+cmdSel); if(c) c.scrollIntoView({block:"nearest"}); $("cmdQ").setAttribute("aria-activedescendant", c ? c.id : ""); }
function cmdGo(i){ const x = cmdItems[i]; if(!x) return; $("cmdk").close(); x.go(); }
function cmdOpen(){
  if(ovOpen()) return; closeMenu();
  const d = $("cmdk"), q = $("cmdQ"); q.placeholder = H().cmdPh; q.setAttribute("aria-label", H().cmdPh); q.value = ""; cmdSel = 0; cmdRender("");
  if(typeof d.showModal==="function"){ if(!d.open) d.showModal(); } else d.setAttribute("open",""); setTimeout(()=>q.focus(), 30);
}
$("cmdQ").addEventListener("input", e=>{ cmdSel = 0; cmdRender(e.target.value); });
$("cmdQ").addEventListener("keydown", e=>{
  if(e.key==="ArrowDown"){ e.preventDefault(); cmdSel = Math.min(cmdItems.length-1, cmdSel+1); cmdMark(); }
  else if(e.key==="ArrowUp"){ e.preventDefault(); cmdSel = Math.max(0, cmdSel-1); cmdMark(); }
  else if(e.key==="Enter"){ e.preventDefault(); cmdGo(cmdSel); }
  else if(e.key==="Escape"){ e.preventDefault(); $("cmdk").close(); }
});
$("cmdk").addEventListener("click", e=>{ if(e.target===$("cmdk")) $("cmdk").close(); });
$("srchBtn").onclick = cmdOpen;
document.addEventListener("keydown", e=>{ if((e.ctrlKey||e.metaKey) && !e.altKey && e.key && e.key.toLowerCase()==="k"){ e.preventDefault(); cmdOpen(); } });

/* ===================== TOOL ADVISOR ===================== */
let ADV = {i:0, a:{}, done:false, restored:false};
try{ const raw = localStorage.getItem(ADV_KEY); if(raw){ const p = JSON.parse(raw); if(p && p.v===1 && p.a && typeof p.a==="object"){ ADV = {i:Math.max(0, Math.min(+p.i||0, ADV_Q.length-1)), a:p.a, done:!!p.done, restored:Object.keys(p.a).length>0}; } } }catch(e){}
function advSave(){ try{ localStorage.setItem(ADV_KEY, JSON.stringify({v:1, i:ADV.i, a:ADV.a, done:ADV.done, saved:new Date().toISOString().slice(0,10)})); }catch(e){} }
const advOpts = q => typeof q.opts==="function" ? q.opts() : q.opts;
const advLabel = (qid, a) => { if(qid==="certs" && a==="multi") return ADV_UI[L].multiCert; const q = ADV_Q.find(x=>x.id===qid), o = q && advOpts(q).find(x=>x[0]===a); return o ? o[1][L] : a; };
const advHas = q => { const v = ADV.a[q.id]; return q.t==="multi" ? Array.isArray(v) && v.length>0 : !!v; };
function advScore(){
  const tot = {}, why = {};
  const add = (q,a,w) => { for(const k in w){ if(!URLS[k] || !TOOLINFO[k]) continue; tot[k] = (tot[k]||0) + w[k]; (why[k] = why[k]||[]).push({q, a, w:w[k]}); } };
  ADV_Q.forEach(q=>{ const v = ADV.a[q.id], sel = q.t==="multi" ? (Array.isArray(v)?v:[]) : (v?[v]:[]);
    sel.forEach(a=>ADVISOR_RULES.forEach(r=>{ if(r[0]===q.id && r[1]===a) add(q.id, a, r[2]); }));
    if(q.id==="certs" && sel.filter(x=>x!=="none" && x!=="other").length>=2) ADVISOR_RULES.forEach(r=>{ if(r[0]==="certs" && r[1]==="multi") add("certs","multi",r[2]); });
  });
  const order = TOOLKITS.map(t=>t.k);
  const ranked = Object.keys(tot).filter(k=>tot[k]>0).sort((a,b)=>tot[b]-tot[a] || why[b].length-why[a].length || order.indexOf(a)-order.indexOf(b));
  const top = ranked.slice(0,5), best = top.length ? tot[top[0]] : 1;
  return {top:top.map(k=>({k, s:tot[k], fit:Math.round(100*tot[k]/best), why:why[k].slice().sort((x,y)=>y.w-x.w)})), tot};
}
function advStages(R){
  const t = R.top.map(x=>x.k), S = [[t[0]], t.slice(1,3), t.slice(3,5)];
  return S.map((list,i)=>({list:list.filter(Boolean), re: i===2 && t[0] ? t[0] : null}));
}
function renderAdvisor(){
  const u = ADV_UI[L];
  $("advK").textContent = u.k; $("advT").textContent = u.t; $("advS").textContent = u.s(ADV_Q.length); $("advNote").textContent = u.note;
  $("advTopActs").innerHTML = "";
  if(!ADV.done) advWizard(); else advResults();
}
function advWizard(){
  const u = ADV_UI[L], N = ADV_Q.length, q = ADV_Q[ADV.i], v = ADV.a[q.id], multi = q.t==="multi", sel = multi ? (Array.isArray(v)?v:[]) : (v?[v]:[]);
  const answered = ADV_Q.filter(advHas).length;
  $("advBody").innerHTML = `<div class="adv-card">${ADV.restored && ADV.i>0 ? `<p class="adv-note" style="margin:0 0 14px">${esc(u.restored)}</p>` : ""}
    <div class="adv-prog"><div class="bar" role="progressbar" aria-valuemin="0" aria-valuemax="${N}" aria-valuenow="${answered}" aria-label="${esc(u.of(ADV.i+1,N))}"><i style="width:${(answered/N*100).toFixed(1)}%"></i></div><span id="advOf">${esc(u.of(ADV.i+1,N))}</span></div>
    <div class="adv-q"><h3 id="advQ">${esc(q.q[L])}</h3><p class="hint">${esc(multi ? u.multi(q.max) : u.one)}</p>
      <div class="adv-opts" role="group" aria-labelledby="advQ">${advOpts(q).map(([k,l])=>`<button type="button" class="adv-opt${multi?" multi":""}" data-v="${esc(k)}" aria-pressed="${sel.includes(k)}"><span class="mk" aria-hidden="true"></span><span>${esc(l[L])}</span></button>`).join("")}</div></div>
    <div class="adv-nav"><button type="button" class="btn" id="advBack" ${ADV.i===0?"disabled":""}>${esc(u.back)}</button><span class="sp"></span>
      ${ADV.restored||answered ? `<button type="button" class="d-btn" id="advReset">${esc(u.restart)}</button>` : ""}
      <button type="button" class="btn primary" id="advNext" ${advHas(q)?"":"disabled"}>${esc(ADV.i===N-1?u.finish:u.next)} ${ARROW}</button></div></div>`;
  $("advBody").querySelectorAll(".adv-opt").forEach(b=>b.onclick=()=>{
    const k = b.dataset.v;
    if(multi){ let cur = Array.isArray(ADV.a[q.id]) ? ADV.a[q.id].slice() : [];
      if(cur.includes(k)) cur = cur.filter(x=>x!==k);
      else { if(q.excl && k===q.excl) cur = [k]; else { cur = cur.filter(x=>x!==q.excl); if(cur.length < q.max) cur.push(k); else { cur.shift(); cur.push(k); } } }
      ADV.a[q.id] = cur; }
    else ADV.a[q.id] = k;
    advSave(); advWizard(); const nb = $("advBody").querySelector(`.adv-opt[data-v="${CSS.escape(k)}"]`); if(nb) nb.focus({preventScroll:true});
  });
  $("advBack").onclick = ()=>{ if(ADV.i>0){ ADV.i--; advSave(); advWizard(); } };
  $("advNext").onclick = ()=>{ if(!advHas(q)) return; if(ADV.i < N-1){ ADV.i++; advSave(); advWizard(); $("advQ").focus && setTimeout(()=>{ const f = $("advBody").querySelector(".adv-opt"); if(f) f.focus({preventScroll:true}); }, 20); }
    else { ADV.done = true; advSave(); renderAdvisor(); window.scrollTo({top:0, behavior:"instant"}); } };
  const rs = $("advReset"); if(rs) rs.onclick = advRestart;
}
function advRestart(){ if(!confirm(ADV_UI[L].restartQ)) return; ADV = {i:0, a:{}, done:false, restored:false}; try{ localStorage.removeItem(ADV_KEY); }catch(e){} renderAdvisor(); }
function advResults(){
  const u = ADV_UI[L], R = advScore(), uo = UI[L];
  if(!R.top.length){ $("advBody").innerHTML = `<div class="adv-card"><p>${esc(u.none)}</p><div class="adv-nav"><button type="button" class="btn" id="advEdit">${esc(u.edit)}</button></div></div>`;
    $("advEdit").onclick = ()=>{ ADV.done = false; ADV.i = 0; advSave(); renderAdvisor(); }; return; }
  const card = (x,i) => { const t = tkOf(x.k), ti = TOOLINFO[x.k];
    return `<article class="ar" data-k="${x.k}" style="--c:var(${t.color})"><span class="rk">${i+1}</span><h4>${esc(t.title[L])}<span class="cd">${esc(t.pre+" "+t.code)}</span></h4>
      <div class="fit"><b>${x.fit}%</b><small>${esc(u.fit)} · ${esc(u.pts(x.s))}</small><i><em style="width:${x.fit}%"></em></i></div>
      <p class="why">${esc(ti.brief[L])} ${esc(ti.why[L])}</p>
      <ul aria-label="${esc(u.because)}">${x.why.map(r=>`<li class="${r.w<0?"neg":""}">${esc(u.because)}: ${esc(advLabel(r.q,r.a))} <em>${r.w>0?"+":""}${r.w}</em></li>`).join("")}</ul>
      <div class="acts"><a class="btn primary" href="${URLS[x.k]}#${ti.start}" data-mod="${x.k}" data-anchor="${ti.start}" data-modname="${esc(t.title[L])}">${esc(u.open)} ${EXT}</a><span class="btn" style="cursor:default">${esc(u.startAt)}: ${esc(ti.startL[L])}</span></div></article>`; };
  const S = advStages(R), first = R.top[0], fti = TOOLINFO[first.k];
  const stage = (s,i) => `<div class="adv-stage"><span class="d">${esc(u.st[i][0])}</span><h4>${esc(u.st[i][1])}</h4>
    <ul>${s.list.map(k=>`<li>${esc(u.doTool(tName(k), TOOLINFO[k].startL[L]))}</li>`).join("")}${s.re?`<li>${esc(u.reassess(tName(s.re)))}</li>`:""}</ul>
    ${s.list.length?`<div class="out"><b>${esc(u.outputs)}:</b> ${s.list.map(k=>esc(TOOLINFO[k].gain[L])).join(" ")}</div>`:""}</div>`;
  const roles = [...new Set(R.top.flatMap(x=>TOOLINFO[x.k].roles))];
  const notes = ["time","team","budget"].map(k=>ADV.a[k] && ADV_NOTES[k][ADV.a[k]] ? ADV_NOTES[k][ADV.a[k]][L] : null).filter(Boolean);
  const qLab = id => (ADV_Q.find(q=>q.id===id)||{q:{en:id,ar:id}}).q[L];
  $("advBody").innerHTML = `<div class="adv-res">
    <div class="sec-head" style="margin-bottom:0"><div><h2 style="font-size:clamp(22px,2.6vw,28px)">${esc(u.resT)}</h2><p>${esc(u.resS)}</p></div>
      <div class="adv-acts"><button type="button" class="d-btn gold" id="advPrint">${ICO_PRINT}${esc(u.print)}</button><button type="button" class="d-btn" id="advCopy">${esc(u.copy)}</button><button type="button" class="d-btn" id="advConsult">${esc(u.consult)}</button><button type="button" class="d-btn" id="advEdit">${esc(u.edit)}</button><button type="button" class="d-btn" id="advReset">${esc(u.restart)}</button></div></div>
    <div class="adv-top" id="advTop">${R.top.map(card).join("")}</div>
    <div class="adv-plan" id="advPlan"><h3>${esc(u.planT)}</h3>
      <div class="adv-start"><b>${esc(u.first)}</b><span>${esc(u.firstTxt(tName(first.k), fti.startL[L]))}</span><a class="btn" href="${URLS[first.k]}#${fti.start}" data-mod="${first.k}" data-anchor="${fti.start}" data-modname="${esc(tName(first.k))}" id="advStartGo">${esc(u.open)} ${EXT}</a></div>
      <div class="adv-stages">${S.map(stage).join("")}</div>
      <div class="adv-who"><div><b>${esc(u.who)}</b><ul><li>${esc(u.sponsor)}</li>${roles.map(r=>`<li>${esc(ROLES[r][L])}</li>`).join("")}</ul></div>
        <div><b>${esc(u.notes)}</b><ul>${notes.map(n=>`<li>${esc(n)}</li>`).join("")}</ul></div></div></div>
    <p class="adv-note">${esc(u.note)}</p>
    <details class="adv-rules"><summary>${esc(u.how)}</summary><p style="color:var(--ink-soft);font-size:14px">${esc(u.howP)}</p>
      <div class="table-scroll"><table><thead><tr>${u.ruleH.map(x=>`<th>${esc(x)}</th>`).join("")}</tr></thead><tbody>${ADVISOR_RULES.map(r=>`<tr><td>${esc(qLab(r[0]))}</td><td>${esc(advLabel(r[0],r[1]))}</td><td class="w">${Object.entries(r[2]).map(([k,w])=>`${esc(tCode(k))} ${w>0?"+":""}${w}`).join(" · ")}</td></tr>`).join("")}</tbody></table></div></details>
  </div>`;
  $("advPrint").onclick = advPrint; $("advCopy").onclick = advCopy; $("advConsult").onclick = advConsult; $("advReset").onclick = advRestart;
  $("advEdit").onclick = ()=>{ ADV.done = false; ADV.i = 0; advSave(); renderAdvisor(); };
}
function advSummary(){
  const u = ADV_UI[L], R = advScore(), S = advStages(R), d = new Date().toISOString().slice(0,10);
  const lines = [`${u.sumHead} — ${d}`, "", u.resT+":"];
  R.top.forEach((x,i)=>lines.push(`${i+1}. ${tCode(x.k)} — ${tName(x.k)} — ${u.fit} ${x.fit}% (${u.pts(x.s)})`, `   ${u.because}: ${x.why.map(r=>advLabel(r.q,r.a)+" "+(r.w>0?"+":"")+r.w).join("; ")}`));
  lines.push("", u.planT+":", `${u.first}: ${u.firstTxt(tName(R.top[0].k), TOOLINFO[R.top[0].k].startL[L])}`);
  S.forEach((s,i)=>{ lines.push(`${u.st[i][0]} — ${u.st[i][1]}: ${[...s.list.map(k=>u.doTool(tName(k), TOOLINFO[k].startL[L])), ...(s.re?[u.reassess(tName(s.re))]:[])].join("; ")}`); });
  lines.push("", u.disclaimer);
  return lines.join("\n");
}
async function advCopy(){
  const t = advSummary();
  try{ await navigator.clipboard.writeText(t); toast(ADV_UI[L].copied); }
  catch(e){ const ta = document.createElement("textarea"); ta.value = t; ta.style.position = "fixed"; ta.style.opacity = "0"; document.body.appendChild(ta); ta.select(); try{ document.execCommand("copy"); toast(ADV_UI[L].copied); }catch(x){} ta.remove(); }
}
function advPrint(){
  const u = ADV_UI[L], root = document.documentElement, d = new Date();
  const ds = d.toLocaleDateString(L==="ar"?"ar-EG-u-nu-latn":"en-GB",{year:"numeric",month:"long",day:"numeric"});
  $("advPrintH").innerHTML = `<img src="${logoSrc()}" alt=""><div><b>${esc(UI[L].brand)} — ${esc(u.printT)}</b><span>${esc(u.printed)}: ${esc(ds)} · ${esc(H().by)} ${esc(H().author)}</span><span>${esc(u.disclaimer)}</span></div>`;
  document.querySelectorAll("#advisor details").forEach(x=>x.open = false);
  const prevTheme = root.getAttribute("data-theme");
  root.classList.add("padv"); root.setAttribute("data-theme","light");
  const done = ()=>{ root.classList.remove("padv"); if(prevTheme==null) root.removeAttribute("data-theme"); else root.setAttribute("data-theme",prevTheme); removeEventListener("afterprint", done); };
  addEventListener("afterprint", done);
  setTimeout(()=>{ try{ window.print(); }catch(e){ done(); } }, 80);
}
function advConsult(){
  const u = ADV_UI[L], R = advScore();
  rqCollect();
  rqKind = "consult";
  const d = rqData.consult, svc = new Set(Array.isArray(d.services)?d.services:[]), std = new Set(Array.isArray(d.stds)?d.stds:[]);
  R.top.forEach(x=>{ const m = TOOL_RQ[x.k]; if(m){ if(m[0]) svc.add(m[0]); if(m[1]) std.add(m[1]); } });
  d.services = [...svc]; d.stds = [...std];
  if(ADV.a.sector && !d.sector) d.sector = ADV.a.sector;
  if(ADV.a.size && !d.size) d.size = ADV.a.size;
  const when = {t3:"q", t6:"h", t12:"x", flex:"x"}[ADV.a.time], status = {scratch:"new", some:"some", doc:"some", mature:"certd"}[ADV.a.mat];
  if(when && !d.when) d.when = when; if(status && !d.status) d.status = status;
  const goals = (ADV.a.goal||[]).map(a=>advLabel("goal",a)), pains = (ADV.a.pain||[]).map(a=>advLabel("pain",a));
  const msg = [u.msgHead, `${u.msgTools}: ${R.top.map((x,i)=>`${i+1}) ${tCode(x.k)} — ${tName(x.k)} (${x.fit}%)`).join("; ")}`,
    goals.length?`${u.msgGoal}: ${goals.join("; ")}`:"", pains.length?`${u.msgPain}: ${pains.join("; ")}`:"", ADV.a.time?`${u.msgTime}: ${advLabel("time",ADV.a.time)}`:""].filter(Boolean).join("\n");
  d.msg = d.msg && !d.msg.includes(u.msgHead) ? d.msg + "\n\n" + msg : msg;
  rqLast = null; $("rqDone").hidden = true; document.querySelector(".rq-grid").hidden = false; renderRequest(); route("#request");
}
