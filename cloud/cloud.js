/* ===================== ACCOUNTS & CLOUD SAVE (optional) =====================
   Off while cloud-config.js is empty: the platform then works exactly as before, everything in this browser.
   On: anyone can still use every tool without an account. A signed-in user's tool data (the browser storage keys the
   tools already write) is copied to their account and back, so their work follows them to any device and survives a
   cleared browser. The tools are not changed: they keep reading and writing localStorage; the hub watches those writes
   (the storage event from the tool frames, and its own writes) and sends the changed keys a moment later.
   "Share your feedback" is stored straight in the database; consultation and training requests keep the e-mail
   flow and a copy is stored for the admin page. */
const CC = window.CIA_CLOUD || {};
const cloudOn = !!(CC.url && CC.key && /^(https:\/\/[^/]+|http:\/\/localhost(:\d+)?)$/.test(String(CC.url).replace(/\/+$/, "")));
const CLOUD_URL = String(CC.url || "").replace(/\/+$/, "");
const CLOUD_LIB = "assets/vendor/supabase-2.117.2.js";
const CLOUD_AUTH = "cia-cloud-auth", CLOUD_META = "cia-cloud:meta", CLOUD_OPEN = "cia-cloud:open", CLOUD_MKT = "cia-cloud:mkt";
/* gate: true opens only the free tools without an account (default ISO 9001); the others ask for a free sign-in */
const cloudGateOn = cloudOn && CC.gate === true;
const cloudFree = () => Array.isArray(CC.free) ? CC.free : ["iso9001"];
const cloudFreeNames = lang => cloudFree().map(k => { for(const sy of SYSTEMS){ const m = sy.mods.find(x => x.k === k); if(m) return m.name[lang]; } return k; }).join(lang === "ar" ? "، " : ", ");
const cloudSkip = k => !k || k.startsWith("cia-cloud") || k.startsWith("sb-");
const cloudMeaningful = k => !cloudSkip(k) && !/^cia-lang$|:lang$|^cia-tour|^cia-rq-contact$/.test(k);
const LSP = Storage.prototype, lsSet = LSP.setItem, lsDel = LSP.removeItem;
const cloudRawSet = (k, v) => lsSet.call(localStorage, k, v);
const cloudRawDel = k => lsDel.call(localStorage, k);
let SB = null, cloudUser = null, cloudLoading = null, cloudSyncing = false, cloudLast = null, cloudErr = false, cloudSent = "";
let cloudDirty = new Set(), cloudTimer = null, cloudPending = null, cloudHold = 0;   /* cloudHold: differing items waiting for the user's choice; nothing is sent meanwhile */
const cloudSynced = new Map();   /* key -> the value the account holds */

const CT = {
 ar:{signin:"دخول", account:"حسابي", title:"سجّل الدخول لحفظ عملك", why:["يُحفظ عملك في كل الأدوات تلقائياً في حسابك.","افتحه من أي جهاز: الحاسوب والجوال والجهاز اللوحي.","لا يضيع إذا مُسحت بيانات المتصفح."],
   free:"الحساب اختياري. دون حساب تبقى بياناتك في هذا المتصفح فقط، كما هي الآن.",
   email:"البريد الإلكتروني", consent:"أوافق على حفظ بيانات أدواتي في حسابي لدى أكاديمية التحسين المستمر لتقديم الخدمة، وأستطيع حذفها في أي وقت.",
   mkt:"أرسلوا لي أخبار الأكاديمية وعروضها بالبريد (اختياري، ويمكن إلغاؤه في أي وقت).", privacy:"سياسة الخصوصية", mktAcct:"استلام أخبار الأكاديمية وعروضها بالبريد", mktOn:"سنرسل لك أخبار الأكاديمية.", mktOff:"لن نرسل لك أخبار الأكاديمية.",
   send:"أرسل رابط الدخول", sending:"جارٍ الإرسال…", sent:e=>`أرسلنا رابط الدخول إلى ${e}. افتحه من بريدك على أي جهاز، وتنتهي صلاحيته خلال ساعة.`,
   again:"أرسل الرابط مرة أخرى", code:"أو اكتب رمز الدخول المكوّن من 6 أرقام الموجود في الرسالة", codeL:"رمز الدخول", verify:"دخول", eCode:"الرمز غير صحيح أو انتهت صلاحيته.", eEmail:"اكتب بريداً إلكترونياً صحيحاً.", eConsent:"وافق على الحفظ للمتابعة.", eSend:"تعذّر إرسال الرابط. تحقق من البريد وحاول بعد دقيقة.",
   expired:"انتهت صلاحية رابط الدخول أو استُخدم من قبل. اطلب رابطاً جديداً.",
   signedAs:"مسجّل باسم", status:"حالة الحفظ", saved:t=>`محفوظ في حسابك · ${t}`, saving:"جارٍ الحفظ…", pending:"تغييرات تنتظر الحفظ", offline:"لم يُحفظ بعد: لا يوجد اتصال. سيُحفظ تلقائياً عند الاتصال.",
   items:n=>`${n} من بيانات الأدوات في حسابك`, saveNow:"احفظ الآن", signout:"تسجيل الخروج", clearDev:"امسح بيانات الأدوات من هذا الجهاز عند الخروج (لجهاز مشترك)",
   del:"احذف بياناتي من الحساب", delQ:"سيُحذف كل ما في حسابك من بيانات الأدوات، وتبقى نسخة هذا الجهاز. تأكيد الحذف؟", delYes:"نعم، احذفها", delNo:"إلغاء", deleted:"حُذفت بياناتك من الحساب وسُجّل خروجك.",
   mergeT:"عندك بيانات على هذا الجهاز وفي حسابك", mergeP:n=>`${n} من بيانات الأدوات مختلفة بين هذا الجهاز وحسابك. البيانات الموجودة في مكان واحد فقط تُحفظ في الحالتين. أي نسخة نعتمد عند الاختلاف؟`,
   keepAcc:"اعتمد بيانات حسابي", keepDev:"اعتمد بيانات هذا الجهاز", backup:"نزّل نسخة من بيانات هذا الجهاز أولاً",
   gateT:n=>`سجّل دخولك المجاني لفتح «${n}»`, gateP:()=>`الحساب مجاني وتُحفظ فيه أعمالك. ${cloudFreeNames("ar")} متاحة للتجربة دون حساب.`,
   remote:"وصلت تحديثات من جهاز آخر. أعد فتح الأداة لتراها.", remoteR:"حدّثنا الصفحة بتغييرات من جهاز آخر.", welcome:"تم تسجيل الدخول. عملك يُحفظ في حسابك.", loaded:"نزّلنا عملك من حسابك.", out:"تم تسجيل الخروج.", close:"إغلاق", err:"تعذّر الحفظ. سنحاول مرة أخرى تلقائياً."},
 en:{signin:"Sign in", account:"My account", title:"Sign in to save your work", why:["Your work in every tool is saved to your account automatically.","Open it on any device: computer, phone or tablet.","It is not lost when the browser data is cleared."],
   free:"An account is optional. Without one, your data stays in this browser only, as it does now.",
   email:"Email", consent:"I agree that my tools' data is saved to my account with the Continual Improvement Academy to provide the service, and I can delete it at any time.",
   mkt:"Send me Academy news and offers by email (optional; you can stop it at any time).", privacy:"Privacy policy", mktAcct:"Receive Academy news and offers by email", mktOn:"You will receive Academy news.", mktOff:"You will not receive Academy news.",
   send:"Send the sign-in link", sending:"Sending…", sent:e=>`We sent a sign-in link to ${e}. Open it from your email on any device; it expires within an hour.`,
   again:"Send the link again", code:"Or type the 6-digit sign-in code from the email", codeL:"Sign-in code", verify:"Sign in", eCode:"The code is wrong or has expired.", eEmail:"Enter a valid email address.", eConsent:"Agree to the saving to continue.", eSend:"The link could not be sent. Check the email and try again in a minute.",
   expired:"The sign-in link has expired or was already used. Ask for a new one.",
   signedAs:"Signed in as", status:"Saving", saved:t=>`Saved to your account · ${t}`, saving:"Saving…", pending:"Changes waiting to be saved", offline:"Not saved yet: no connection. It will save automatically when you are back online.",
   items:n=>`${n} tool data items in your account`, saveNow:"Save now", signout:"Sign out", clearDev:"Remove the tools' data from this device when signing out (shared device)",
   del:"Delete my data from the account", delQ:"All tool data in your account will be deleted; this device's copy stays. Delete it?", delYes:"Yes, delete it", delNo:"Cancel", deleted:"Your data was deleted from the account and you are signed out.",
   mergeT:"You have data on this device and in your account", mergeP:n=>`${n} tool data items differ between this device and your account. Data found in only one place is kept either way. Which copy should win where they differ?`,
   keepAcc:"Keep my account's data", keepDev:"Keep this device's data", backup:"Download a copy of this device's data first",
   gateT:n=>`Sign in for free to open “${n}”`, gateP:()=>`The account is free and keeps your work. ${cloudFreeNames("en")} is open to try without an account.`,
   remote:"Changes arrived from another device. Reopen the tool to see them.", remoteR:"The page was refreshed with changes from another device.", welcome:"Signed in. Your work is saved to your account.", loaded:"Your work was loaded from your account.", out:"Signed out.", close:"Close", err:"Saving failed. It will be retried automatically."}
};

/* ---------- texts that promised "nothing leaves the browser" now describe the optional account ---------- */
if(cloudOn){
  try{
    UI.ar.faq[0][1] = "في متصفحك على جهازك. وإذا سجّلت الدخول تُحفظ نسخة منها في حسابك، فتفتحها من أي جهاز ولا تضيع عند مسح المتصفح، ويمكنك حذفها من حسابك في أي وقت. دون حساب تبقى في هذا المتصفح فقط، فاحتفظ بنسخة احتياطية.";
    UI.en.faq[0][1] = "In your browser on your device. If you sign in, a copy is saved to your account, so you can open it on any device and it is not lost when the browser is cleared; you can delete it from your account at any time. Without an account it stays in this browser only, so keep a backup.";
    const v = (o, i, t) => { const a = o && o.vals; if(a && a[i]) a[i] = [a[i][0], t]; };
    v(H2.ar, 4, "تبقى في متصفحك، ولا تُحفظ في حسابك إلا إذا سجّلت الدخول."); v(H2.en, 4, "It stays in your browser, and goes to your account only if you sign in.");
    if(cloudGateOn){ const c = (o, t, d) => { const a = o && o.vals; if(a && a[5]) a[5] = [t, d]; };
      c(H2.ar, "جرّبها مجاناً", `${cloudFreeNames("ar")} دون تسجيل، وكل الأدوات بحساب مجاني.`);
      c(H2.en, "Try it free", `${cloudFreeNames("en")} without signing up, and every tool with a free account.`); }
    PFU.ar.note = "يُحفظ الملف في متصفحك، وفي حسابك أيضاً إذا سجّلت الدخول."; PFU.en.note = "The profile is saved in your browser, and in your account too if you sign in.";
    Object.assign(RQ.ar, {sentPF:"وصل رأيك إلى الأكاديمية. شكراً لأنك تساعدنا على تطوير المنصة.", sideF:[["1","الإرسال","يصل رأيك مباشرة بضغطة واحدة."],["2","القراءة","يقرأ مدثر سلامه كل ملاحظة بنفسه."],["3","التطوير","تدخل الطلبات المتكررة في التحديثات القادمة للمنصة."]]});
    Object.assign(RQ.en, {sentPF:"Your feedback has reached the Academy. Thank you for helping us improve the platform.", sideF:[["1","Send","Your feedback arrives directly with one click."],["2","Read","مدثر سلامه reads every note personally."],["3","Build","Recurring requests go into the next updates of the platform."]]});
  }catch(e){}
}

/* ---------- local state ---------- */
function cloudMeta(){ try{ return JSON.parse(localStorage.getItem(CLOUD_META) || "{}") || {}; }catch(e){ return {}; } }
function cloudMetaSave(m){ try{ cloudRawSet(CLOUD_META, JSON.stringify(m)); }catch(e){} }
function cloudKeys(){ const out = []; for(let i = 0; i < localStorage.length; i++){ const k = localStorage.key(i); if(!cloudSkip(k)) out.push(k); } return out; }
function cloudMark(k){
  if(!cloudUser) return;
  if(k === null){ cloudKeys().forEach(x => cloudDirty.add(x)); }
  else if(cloudSkip(k)) return;
  else cloudDirty.add(k);
  cloudMetaSave({...cloudMeta(), dirty:[...cloudDirty]});
  clearTimeout(cloudTimer); cloudTimer = setTimeout(cloudPush, 1500);
  cloudText();
}
if(cloudOn){
  LSP.setItem = function(k, v){ lsSet.call(this, k, v); if(this === localStorage) cloudMark(String(k)); };
  LSP.removeItem = function(k){ lsDel.call(this, k); if(this === localStorage) cloudMark(String(k)); };
  addEventListener("storage", e => { if(e.storageArea === localStorage) cloudMark(e.key); });
  addEventListener("online", () => { if(cloudDirty.size) cloudPush(); });
  const flush = () => { if(cloudDirty.size) cloudPush(); };
  addEventListener("pagehide", flush);
  document.addEventListener("visibilitychange", () => { if(document.visibilityState === "hidden") flush(); else cloudRefresh(); });
}

/* ---------- the gate: locked tools ask for a sign-in, then open by themselves ---------- */
function cloudLocked(key){ return cloudGateOn && !cloudFree().includes(key) && !cloudUser && !localStorage.getItem(CLOUD_AUTH); }
if(cloudGateOn && typeof openModule === "function"){
  const open0 = openModule;
  openModule = function(key, push, anchor){
    if(cloudLocked(key)){
      try{ cloudRawSet(CLOUD_OPEN, JSON.stringify({key, anchor:anchor || "", at:Date.now()})); }catch(e){}
      if(/^#m=/.test(location.hash)) try{ history.replaceState(null, "", location.pathname + location.search + "#home"); }catch(e){}
      cloudDialog("signin", "", key);
      return;
    }
    return open0(key, push, anchor);
  };
}
function cloudOpenPending(){
  let p = null; try{ p = JSON.parse(localStorage.getItem(CLOUD_OPEN) || "null"); }catch(e){}
  if(!p) return;
  cloudRawDel(CLOUD_OPEN);
  if(Date.now() - p.at < 36e5 && URLS[p.key]) setTimeout(() => openModule(p.key, undefined, p.anchor || undefined), 300);
}

/* ---------- the library loads only for people who sign in ---------- */
function cloudLoad(){
  if(cloudLoading) return cloudLoading;
  cloudLoading = new Promise((res, rej) => {
    const s = document.createElement("script"); s.src = CLOUD_LIB; s.async = true;
    s.onload = () => {
      try{
        SB = window.supabase.createClient(CLOUD_URL, CC.key, {auth:{storageKey:CLOUD_AUTH, persistSession:true, autoRefreshToken:true, detectSessionInUrl:true, flowType:"implicit"}});
        SB.auth.onAuthStateChange((ev, session) => {
          if(session && session.user && (!cloudUser || cloudUser.id !== session.user.id)) setTimeout(() => cloudSignedIn(session.user), 0);
          if(ev === "SIGNED_OUT"){ cloudUser = null; cloudText(); }
        });
        res(SB);
      }catch(e){ rej(e); }
    };
    s.onerror = () => { cloudLoading = null; rej(new Error("lib")); };
    document.head.appendChild(s);
  });
  return cloudLoading;
}

/* ---------- sync ---------- */
async function cloudFetch(){
  const {data, error} = await SB.from("user_data").select("key,value,updated_at");
  if(error) throw error;
  return data || [];
}
async function cloudSignedIn(user){
  if(cloudUser && cloudUser.id === user.id) return;
  cloudUser = user; cloudErr = false; cloudText();
  SB.from("profiles").update({last_seen:new Date().toISOString()}).eq("id", user.id).then(() => {}, () => {});
  /* the news consent ticked in the sign-in window (the link may open in another tab, so it waits in this browser) */
  if(localStorage.getItem(CLOUD_MKT) === "1")
    SB.from("profiles").update({marketing:true, marketing_at:new Date().toISOString()}).eq("id", user.id)
      .then(r => { if(r && !r.error) cloudRawDel(CLOUD_MKT); }, () => {});
  let rows;
  try{ rows = await cloudFetch(); }catch(e){ cloudErr = true; cloudText(); return; }
  cloudSynced.clear(); rows.forEach(r => cloudSynced.set(r.key, r.value));
  const meta = cloudMeta();
  if(meta.uid === user.id){
    /* this device already follows this account: take the account's newer copies, send what changed here */
    const dirty = new Set(meta.dirty || []); let applied = 0;
    rows.forEach(r => { if(localStorage.getItem(r.key) !== r.value && !dirty.has(r.key)){ cloudRawSet(r.key, r.value); applied++; } });
    cloudKeys().forEach(k => { if(!cloudSynced.has(k)) dirty.add(k); });
    cloudDirty = dirty; await cloudPush();
    if(applied) cloudReload("loaded"); else cloudOpenPending();
    return;
  }
  const differ = cloudKeys().filter(cloudMeaningful).filter(k => cloudSynced.has(k) && cloudSynced.get(k) !== localStorage.getItem(k));
  if(differ.length){ cloudHold = differ.length; cloudText(); cloudAskMerge(differ.length); }
  else cloudMerge("device");
}
async function cloudMerge(winner){
  cloudHold = 0; let applied = 0;
  cloudSynced.forEach((v, k) => { const lv = localStorage.getItem(k); if(lv === null || (lv !== v && winner === "account")){ cloudRawSet(k, v); applied++; } });
  cloudDirty = new Set(cloudKeys().filter(k => localStorage.getItem(k) !== cloudSynced.get(k)));
  cloudMetaSave({uid:cloudUser.id, dirty:[...cloudDirty]});
  await cloudPush();
  if(applied) cloudReload("loaded"); else { toast(CT[L].welcome); cloudText(); cloudOpenPending(); }
}
/* back on the page: take what another device saved meanwhile (updates only; a deletion elsewhere never empties this device) */
let cloudRefreshAt = 0;
async function cloudRefresh(){
  if(!cloudUser || !SB || cloudHold || cloudSyncing || Date.now() - cloudRefreshAt < 30000) return;
  cloudRefreshAt = Date.now();
  let rows; try{ rows = await cloudFetch(); }catch(e){ return; }
  let applied = 0;
  rows.forEach(r => {
    if(r.value === cloudSynced.get(r.key) || cloudDirty.has(r.key)) return;
    cloudSynced.set(r.key, r.value);
    if(localStorage.getItem(r.key) !== r.value){ cloudRawSet(r.key, r.value); applied++; }
  });
  if(!applied) return;
  if($("modOverlay").classList.contains("on")) toast(CT[L].remote); else cloudReload("remoteR");
}
function cloudReload(why){ try{ sessionStorage.setItem("cia-cloud-toast", why); }catch(e){} location.reload(); }
async function cloudPush(){
  if(!cloudUser || !SB || cloudHold) return;
  if(cloudSyncing){ cloudPending = true; return; }
  clearTimeout(cloudTimer); cloudSyncing = true; cloudText();
  const keys = [...cloudDirty], up = [], del = [], now = new Date().toISOString();
  keys.forEach(k => { const v = localStorage.getItem(k);
    if(v === null){ if(cloudSynced.has(k)) del.push(k); }
    else if(v !== cloudSynced.get(k)) up.push({user_id:cloudUser.id, key:k, value:v, updated_at:now}); });
  try{
    /* batches of about 2 MB, so one large tool does not hit the request size limit together with the others */
    const batches = []; let cur = [], size = 0;
    up.forEach(r => { if(cur.length && size + r.value.length > 2e6){ batches.push(cur); cur = []; size = 0; } cur.push(r); size += r.value.length; });
    if(cur.length) batches.push(cur);
    for(const b of batches){
      const {error} = await SB.from("user_data").upsert(b, {onConflict:"user_id,key"}); if(error) throw error;
      b.forEach(r => cloudSynced.set(r.key, r.value));
    }
    if(del.length){ const {error} = await SB.from("user_data").delete().eq("user_id", cloudUser.id).in("key", del); if(error) throw error; del.forEach(k => cloudSynced.delete(k)); }
    keys.forEach(k => { if(localStorage.getItem(k) === (cloudSynced.has(k) ? cloudSynced.get(k) : null)) cloudDirty.delete(k); });
    cloudLast = new Date(); cloudErr = false;
  }catch(e){ cloudErr = true; clearTimeout(cloudTimer); cloudTimer = setTimeout(cloudPush, 30000); }
  cloudMetaSave({...cloudMeta(), uid:cloudUser.id, dirty:[...cloudDirty]});
  cloudSyncing = false; cloudText();
  if(cloudPending){ cloudPending = false; if(cloudDirty.size) cloudPush(); }
}

/* ---------- feedback and requests to the database ---------- */
async function cloudSubmit(m){
  if(!cloudOn) return false;
  const d = rqData[rqKind], F = RQ_FORMS[rqKind];
  const val = f => { const v = d[f.k]; if(f.t === "chips") return (v || []).map(x => rqOptLabel(f, x)).join(", "); if(f.t === "select") return v ? rqOptLabel(f, v) : ""; return v || ""; };
  let table, row;
  if(rqKind === "feedback"){
    table = "feedback";
    row = {ref:m.ref, tool:d.tool, rating:+d.rate || null, recommend:d.rec || null, role:d.frole || null, useful:d.useful || null, improve:d.improve, name:d.name || null, email:d.email || null, lang:L};
  } else {
    table = "service_requests"; const payload = {};
    F.fields.forEach(f => { const v = val(f); if(v) payload[f.k] = v; });
    row = {kind:rqKind, ref:m.ref, payload, lang:L};
  }
  let token = null;
  if(cloudUser && SB){ try{ token = (await SB.auth.getSession()).data.session.access_token; }catch(e){} }
  /* the publishable key goes in apikey only; Authorization carries a signed-in user's token, so the row is linked to them */
  const headers = {apikey:CC.key, "Content-Type":"application/json", Prefer:"return=minimal"};
  if(token) headers.Authorization = "Bearer " + token;
  const req = fetch(`${CLOUD_URL}/rest/v1/${table}`, {method:"POST", keepalive:true, headers, body:JSON.stringify(row)});
  if(rqKind !== "feedback"){ req.catch(() => {}); return false; }
  const btn = $("rqSubmit"); btn.disabled = true; btn.textContent = RQ[L].sending;
  try{ const r = await req; if(r.ok){ rqLast.sent = true; rqShowDone(rqLast); return true; } }catch(e){}
  btn.disabled = false; return false;
}

/* ---------- interface ---------- */
function cloudWhen(d){ return d.toLocaleTimeString(L === "ar" ? "ar-EG-u-nu-latn" : "en-GB", {hour:"2-digit", minute:"2-digit"}); }
function cloudStatus(){
  const u = CT[L];
  if(cloudSyncing) return u.saving;
  if(cloudErr) return navigator.onLine ? u.err : u.offline;
  if(cloudDirty.size) return u.pending;
  return u.saved(cloudWhen(cloudLast || new Date()));
}
function cloudText(){
  const b = $("acctBtn"); if(!b) return;
  if(!cloudOn){ b.hidden = true; return; }
  const u = CT[L]; b.hidden = false;
  b.classList.toggle("on", !!cloudUser); b.classList.toggle("warn", !!cloudUser && (cloudErr || (cloudDirty.size > 0 && !cloudSyncing)));
  $("acctLabel").textContent = cloudUser ? u.account : u.signin;
  const t = cloudUser ? `${u.account} · ${cloudUser.email} · ${cloudStatus()}` : u.title;
  b.title = t; b.setAttribute("aria-label", t);
  const dlg = $("acctDlg"); if(dlg && dlg.open && dlg.dataset.view === "acct") cloudDialog("acct");
}
function cloudDialog(view, arg, tool){
  const u = CT[L], dlg = $("acctDlg"); dlg.dataset.view = view;
  const head = t => `<div class="ddlg-h" style="--c:var(--gold)"><h3 id="acctDlgT">${esc(t)}</h3><button type="button" class="ddlg-x" data-x aria-label="${esc(u.close)}">×</button></div>`;
  let body = "";
  if(view === "signin"){
    body = `${head(tool ? u.gateT(modLabel(tool)) : u.title)}<form class="ddlg-b acct" id="acctForm" novalidate>
      ${tool ? `<p class="acct-ok">${esc(u.gateP())}</p>` : ""}
      <ul class="acct-why">${u.why.map(x => `<li>${esc(x)}</li>`).join("")}</ul>
      <label class="acct-f"><span>${esc(u.email)}</span><input id="acctEmail" type="email" dir="ltr" autocomplete="email" required value="${esc(arg || "")}"></label>
      <label class="acct-c"><input type="checkbox" id="acctOk"><span>${esc(u.consent)} <a href="privacy.html" target="_blank" rel="noopener">${esc(u.privacy)}</a></span></label>
      <label class="acct-c"><input type="checkbox" id="acctMkt"><span>${esc(u.mkt)}</span></label>
      <p class="acct-err" id="acctErr" role="alert" hidden></p>
      <div class="acct-row"><button class="btn primary" type="submit" id="acctSend">${esc(u.send)}</button></div>
      ${tool ? "" : `<p class="acct-note">${esc(cloudGateOn ? u.gateP() : u.free)}</p>`}</form>`;
  } else if(view === "sent"){
    body = `${head(u.title)}<form class="ddlg-b acct" id="acctCodeForm" novalidate><p class="acct-ok">${esc(u.sent(arg))}</p>
      ${CC.code ? `<p class="acct-note">${esc(u.code)}</p>
      <div class="acct-row"><label class="acct-f acct-code"><span class="sr">${esc(u.codeL)}</span><input id="acctCode" inputmode="numeric" autocomplete="one-time-code" maxlength="10" dir="ltr" placeholder="••••••"></label><button class="btn primary" type="submit" id="acctVerify">${esc(u.verify)}</button></div>
      <p class="acct-err" id="acctErr" role="alert" hidden></p>` : ""}
      <div class="acct-row"><button class="btn" type="button" id="acctAgain">${esc(u.again)}</button></div></form>`;
  } else if(view === "expired"){
    body = `${head(u.title)}<div class="ddlg-b acct"><p class="acct-err">${esc(u.expired)}</p><div class="acct-row"><button class="btn primary" type="button" id="acctAgain">${esc(u.send)}</button></div></div>`;
  } else if(view === "acct"){
    body = `${head(u.account)}<div class="ddlg-b acct">
      <dl class="acct-dl"><div><dt>${esc(u.signedAs)}</dt><dd class="ltr">${esc(cloudUser.email)}</dd></div>
        <div><dt>${esc(u.status)}</dt><dd>${esc(cloudStatus())}</dd></div>
        <div><dt></dt><dd>${esc(u.items(cloudSynced.size))}</dd></div></dl>
      <div class="acct-row"><button class="btn primary" type="button" id="acctSave">${esc(u.saveNow)}</button><button class="btn" type="button" id="acctOut">${esc(u.signout)}</button></div>
      <label class="acct-c" id="acctMktRow" hidden><input type="checkbox" id="acctMktOn"><span>${esc(u.mktAcct)}</span></label>
      <label class="acct-c"><input type="checkbox" id="acctClear"><span>${esc(u.clearDev)}</span></label>
      <p class="acct-note"><a href="privacy.html" target="_blank" rel="noopener">${esc(u.privacy)}</a></p>
      <div class="acct-del" id="acctDelBox"><button class="btn danger" type="button" id="acctDel">${esc(u.del)}</button></div></div>`;
  } else if(view === "merge"){
    body = `${head(u.mergeT)}<div class="ddlg-b acct"><p>${esc(u.mergeP(arg))}</p>
      <div class="acct-row"><button class="btn primary" type="button" id="acctKeepAcc">${esc(u.keepAcc)}</button><button class="btn" type="button" id="acctKeepDev">${esc(u.keepDev)}</button></div>
      <p><a href="#" id="acctBackup">${esc(u.backup)}</a></p></div>`;
  }
  dlg.innerHTML = body;
  dlg.querySelectorAll("[data-x]").forEach(x => x.onclick = () => dlg.close());
  if(view === "signin"){
    $("acctForm").onsubmit = async e => {
      e.preventDefault();
      const em = $("acctEmail").value.trim(), err = $("acctErr");
      const bad = t => { err.textContent = t; err.hidden = false; };
      if(!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(em)) return bad(u.eEmail);
      if(!$("acctOk").checked) return bad(u.eConsent);
      try{ if($("acctMkt").checked) cloudRawSet(CLOUD_MKT, "1"); else cloudRawDel(CLOUD_MKT); }catch(e){}
      const btn = $("acctSend"); btn.disabled = true; btn.textContent = u.sending; err.hidden = true;
      try{
        await cloudLoad();
        const {error} = await SB.auth.signInWithOtp({email:em, options:{emailRedirectTo:location.origin + location.pathname, shouldCreateUser:true}});
        if(error) throw error;
        cloudSent = em; cloudDialog("sent", em);
      }catch(x){ btn.disabled = false; btn.textContent = u.send;
        /* the server's own reason (e.g. an SMTP or rate-limit message) is shown under the general text, to fix it quickly */
        const why = x && (x.message || x.msg || x.error_description) ? ` (${String(x.message || x.msg || x.error_description).slice(0, 200)}${x.status ? " · " + x.status : ""})` : "";
        bad(u.eSend + why); }
    };
    setTimeout(() => $("acctEmail").focus(), 60);
  }
  if($("acctAgain")) $("acctAgain").onclick = () => cloudDialog("signin", cloudSent);
  if(view === "sent" && CC.code){
    $("acctCodeForm").onsubmit = async e => {
      e.preventDefault();
      const code = $("acctCode").value.replace(/\D/g, ""), err = $("acctErr"), btn = $("acctVerify");
      if(code.length < 6){ err.textContent = u.eCode; err.hidden = false; return; }
      btn.disabled = true; err.hidden = true;
      try{ const {data, error} = await SB.auth.verifyOtp({email:arg, token:code, type:"email"}); if(error) throw error;
        dlg.close(); if(data && data.user) cloudSignedIn(data.user); }
      catch(x){ btn.disabled = false; err.textContent = u.eCode; err.hidden = false; }
    };
  }
  if(view === "acct"){
    /* the news choice lives in the profile; the row stays hidden if the profile has no such column yet */
    SB.from("profiles").select("marketing").eq("id", cloudUser.id).single().then(r => {
      if(!r || r.error || !r.data || typeof r.data.marketing !== "boolean" || !$("acctMktRow")) return;
      $("acctMktOn").checked = r.data.marketing; $("acctMktRow").hidden = false;
      $("acctMktOn").onchange = async e => {
        const on = e.target.checked;
        const {error} = await SB.from("profiles").update({marketing:on, marketing_at:new Date().toISOString()}).eq("id", cloudUser.id);
        if(error){ e.target.checked = !on; toast(u.err); } else toast(on ? u.mktOn : u.mktOff);
      };
    }, () => {});
    $("acctSave").onclick = () => { cloudKeys().forEach(k => { if(localStorage.getItem(k) !== cloudSynced.get(k)) cloudDirty.add(k); }); cloudPush(); };
    $("acctOut").onclick = async () => {
      const wipe = $("acctClear").checked;
      await cloudPush(); try{ await SB.auth.signOut(); }catch(e){}
      cloudUser = null; cloudDirty.clear();
      if(wipe){ cloudKeys().forEach(cloudRawDel); cloudRawDel(CLOUD_META); cloudReload("out"); return; }
      dlg.close(); toast(u.out); cloudText();
    };
    $("acctDel").onclick = () => {
      $("acctDelBox").innerHTML = `<p>${esc(u.delQ)}</p><div class="acct-row"><button class="btn danger" type="button" id="acctDelYes">${esc(u.delYes)}</button><button class="btn" type="button" id="acctDelNo">${esc(u.delNo)}</button></div>`;
      $("acctDelNo").onclick = () => cloudDialog("acct");
      $("acctDelYes").onclick = async () => {
        const {error} = await SB.from("user_data").delete().eq("user_id", cloudUser.id);
        if(error){ toast(u.err); return; }
        clearTimeout(cloudTimer); cloudDirty.clear(); cloudSynced.clear();
        try{ await SB.auth.signOut(); }catch(e){}
        cloudUser = null; cloudMetaSave({}); dlg.close(); toast(u.deleted); cloudText();
      };
    };
  }
  if(view === "merge"){
    $("acctKeepAcc").onclick = () => { dlg.close(); cloudMerge("account"); };
    $("acctKeepDev").onclick = () => { dlg.close(); cloudMerge("device"); };
    $("acctBackup").onclick = e => {
      e.preventDefault();
      const data = {}; cloudKeys().forEach(k => data[k] = localStorage.getItem(k));
      const blob = new Blob([JSON.stringify({format:"cia-device-backup", version:1, created:new Date().toISOString(), data}, null, 1)], {type:"application/json"});
      const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `cia-device-backup-${new Date().toISOString().slice(0,10)}.json`;
      document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
    };
  }
  if(!dlg.open) dlg.showModal();
}
function cloudAskMerge(n){ cloudDialog("merge", n); }
function cloudFooter(){
  const f = $("fLinks"); if(!f || f.querySelector("[data-privacy]")) return;
  const a = document.createElement("a"); a.href = "privacy.html"; a.dataset.privacy = "1"; a.textContent = CT[L].privacy;
  const mail = f.querySelector('a[href^="mailto:"]'); f.insertBefore(a, mail);
}
$("acctBtn").onclick = () => cloudDialog(cloudHold ? "merge" : cloudUser ? "acct" : "signin", cloudHold || undefined);

/* ---------- start: only a returning signed-in user (or a sign-in link) loads the library ---------- */
if(cloudOn){
  const h = location.hash;
  if(/error_description=|error_code=/.test(h)){
    try{ history.replaceState(null, "", location.pathname + location.search + "#home"); }catch(e){}
    setTimeout(() => cloudDialog("expired"), 400);
  } else if(localStorage.getItem(CLOUD_AUTH) || /access_token=/.test(h)){
    cloudLoad().then(() => SB.auth.getSession()).then(({data}) => {
      if(/access_token=/.test(location.hash)) try{ history.replaceState(null, "", location.pathname + location.search + "#home"); }catch(e){}
      if(data && data.session && !cloudUser) cloudSignedIn(data.session.user);
    }).catch(() => {});
  }
  try{ const t = sessionStorage.getItem("cia-cloud-toast"); if(t){ sessionStorage.removeItem("cia-cloud-toast"); setTimeout(() => toast(CT[L][t] || ""), 600); } }catch(e){}
}
