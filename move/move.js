/* ===================== MOVING TO THE NEW ADDRESS =====================
   The browser keeps each visitor's work per address, so a new domain starts empty. This moves it:
   - on the old address (the copy kept by the service worker keeps opening there after GitHub redirects it):
       before the new address answers: a slim notice ("we are moving soon, sign in to keep your work");
       once it answers: "we have moved", with one button that opens the new address and hands it this browser's data,
       then removes the old copy (service worker and caches) so later visits go straight to the new address;
   - on the new address (opened with #move-in by the old one): receives the data, keeps anything already there,
       and confirms. Data only ever goes from the exact old origin to the exact new origin. */
const MOVE = /*MOVE_CONFIG*/{to:"", fromHosts:[], fromOrigins:[]}/*END*/;
const MV_T = {
  ar:{soon:h=>`قريباً تنتقل المنصة إلى عنوانها الجديد ${h}. سجّل دخولك المجاني ليبقى عملك محفوظاً في حسابك وينتقل معك.`, signin:"سجّل الدخول", close:"إغلاق",
    movedT:"انتقلنا إلى عنواننا الجديد", movedP:h=>`أصبحت المنصة على ${h}. عملك المحفوظ في هذا المتصفح ما زال هنا، وننقله معك بضغطة واحدة.`, movedP0:h=>`أصبحت المنصة على ${h}.`,
    go:"انقل عملي وافتح العنوان الجديد", open:"افتح العنوان الجديد", later:"لاحقاً", wait:"جارٍ النقل…", blocked:"اسمح بالنوافذ المنبثقة لهذا الموقع ثم أعد المحاولة.", fail:"لم يكتمل النقل. أعد المحاولة، أو سجّل دخولك هنا ليُحفظ عملك في حسابك.",
    done:n=>`تم نقل ${n} من بياناتك من العنوان القديم.`, install:"إذا كنت ثبّت التطبيق على جهازك، فاحذفه وثبّته من العنوان الجديد."},
  en:{soon:h=>`The platform is moving to its new address ${h}. Sign in for free so your work is kept in your account and moves with you.`, signin:"Sign in", close:"Close",
    movedT:"We have moved to our new address", movedP:h=>`The platform is now at ${h}. The work saved in this browser is still here, and we move it with you in one click.`, movedP0:h=>`The platform is now at ${h}.`,
    go:"Move my work and open the new address", open:"Open the new address", later:"Later", wait:"Moving…", blocked:"Allow pop-ups for this site, then try again.", fail:"The move did not finish. Try again, or sign in here so your work is kept in your account.",
    done:n=>`${n} items of your data were moved from the old address.`, install:"If you installed the app on your device, remove it and install it from the new address."}
};
/* everything the tools keep, except the sign-in and the cloud bookkeeping (those belong to one address) */
const mvSkip = k => !k || k === "cia-cloud-auth" || k.startsWith("cia-cloud:") || k.startsWith("sb-") || k.startsWith("mv-");
function mvData(){ const d = {}; for(let i = 0; i < localStorage.length; i++){ const k = localStorage.key(i); if(!mvSkip(k)) d[k] = localStorage.getItem(k); } return d; }
const mvHost = () => { try{ return new URL(MOVE.to).host; }catch(e){ return MOVE.to; } };
const mvT = () => MV_T[typeof L !== "undefined" && L === "en" ? "en" : "ar"];

/* ---------- old address ---------- */
/* the new address is live when it serves our small marker image (an image loads across addresses without special headers,
   and a parked domain or an error page has no such file) */
function mvLive(){
  return new Promise(res => { const i = new Image(), t = setTimeout(() => res(false), 8000);
    i.onload = () => { clearTimeout(t); res(i.naturalWidth === 1); }; i.onerror = () => { clearTimeout(t); res(false); };
    i.src = MOVE.to.replace(/\/$/, "") + "/move-ping.png?" + Date.now(); });
}
function mvNotice(){
  if(document.getElementById("mvBar")) return;
  try{ const t = +localStorage.getItem("mv-hide") || 0; if(Date.now() - t < 3 * 864e5) return; }catch(e){}
  const t = mvT(), b = document.createElement("div");
  b.id = "mvBar"; b.className = "mv-bar"; b.setAttribute("role", "status");
  b.innerHTML = `<span>${esc(t.soon(mvHost()))}</span>${document.getElementById("acctBtn") ? `<button type="button" class="mv-in">${esc(t.signin)}</button>` : ""}<button type="button" class="mv-x" aria-label="${esc(t.close)}">×</button>`;
  document.body.prepend(b);
  const si = b.querySelector(".mv-in"); if(si) si.onclick = () => document.getElementById("acctBtn").click();
  b.querySelector(".mv-x").onclick = () => { try{ localStorage.setItem("mv-hide", String(Date.now())); }catch(e){} b.remove(); };
}
function mvMoved(){
  if(document.getElementById("mvDlg")) return;
  const t = mvT(), n = Object.keys(mvData()).filter(k => k !== "cia-lang").length, d = document.createElement("dialog");
  d.id = "mvDlg"; d.className = "ddlg mv-dlg"; d.setAttribute("aria-labelledby", "mvT");
  d.innerHTML = `<div class="mv-in-box"><h2 id="mvT">${esc(t.movedT)}</h2><p>${esc(n ? t.movedP(mvHost()) : t.movedP0(mvHost()))}</p><p class="mv-note">${esc(t.install)}</p><p class="mv-err" id="mvErr" hidden></p>
    <div class="mv-acts"><button type="button" class="btn primary" id="mvGo">${esc(n ? t.go : t.open)}</button><button type="button" class="btn" id="mvLater">${esc(t.later)}</button></div></div>`;
  document.body.appendChild(d); d.showModal();
  d.querySelector("#mvLater").onclick = () => d.close();
  d.querySelector("#mvGo").onclick = () => n ? mvSend() : mvLeave();
}
async function mvLeave(){
  try{ const regs = await navigator.serviceWorker.getRegistrations(); await Promise.all(regs.map(r => r.unregister())); }catch(e){}
  try{ const ks = await caches.keys(); await Promise.all(ks.map(k => caches.delete(k))); }catch(e){}
  location.replace(MOVE.to.replace(/\/$/, "") + "/#home");
}
function mvSend(){
  const t = mvT(), btn = document.getElementById("mvGo"), err = document.getElementById("mvErr");
  const to = new URL(MOVE.to).origin, w = window.open(MOVE.to.replace(/\/$/, "") + "/#move-in", "cia-move");
  if(!w){ err.textContent = t.blocked; err.hidden = false; return; }
  btn.disabled = true; btn.textContent = t.wait; err.hidden = true;
  let sent = false;
  const fail = () => { removeEventListener("message", on); btn.disabled = false; btn.textContent = t.go; err.textContent = t.fail; err.hidden = false; };
  const timer = setTimeout(fail, 30000);
  function on(e){
    if(e.origin !== to || !e.data || typeof e.data !== "object") return;
    if(e.data.t === "cia-move-ready" && !sent){ sent = true; w.postMessage({t:"cia-move-data", data:mvData()}, to); }
    if(e.data.t === "cia-move-done"){ clearTimeout(timer); removeEventListener("message", on); try{ w.close(); }catch(x){} mvLeave(); }
  }
  addEventListener("message", on);
}

/* ---------- new address ---------- */
function mvReceive(){
  if(location.hash !== "#move-in" || !window.opener) return;
  const ok = new Set(MOVE.fromOrigins);
  let got = false;
  addEventListener("message", e => {
    if(got || !ok.has(e.origin) || !e.data || e.data.t !== "cia-move-data" || typeof e.data.data !== "object") return;
    got = true; let n = 0;
    Object.entries(e.data.data).forEach(([k, v]) => {
      if(mvSkip(k) || typeof v !== "string") return;
      try{ if(localStorage.getItem(k) === null){ localStorage.setItem(k, v); if(k !== "cia-lang") n++; } }catch(x){}
    });
    try{ localStorage.setItem("mv-done", String(n)); }catch(x){}
    e.source.postMessage({t:"cia-move-done", n}, e.origin);
  });
  MOVE.fromOrigins.forEach(o => { try{ window.opener.postMessage({t:"cia-move-ready"}, o); }catch(e){} });
}
function mvWelcome(){
  let n = null; try{ n = localStorage.getItem("mv-done"); if(n !== null) localStorage.removeItem("mv-done"); }catch(e){}
  if(n !== null && +n > 0 && typeof toast === "function") setTimeout(() => toast(mvT().done(+n)), 900);
}

/* ---------- start ---------- */
if(MOVE.to){
  if(MOVE.fromHosts.includes(location.host)){
    addEventListener("load", async () => { if(await mvLive()) mvMoved(); else mvNotice(); });
  } else { mvReceive(); addEventListener("load", mvWelcome); }
}
