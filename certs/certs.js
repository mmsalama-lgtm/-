/* ===================== CERTIFICATION FINDER — questionnaire, scoring and results (view #certs) =====================
   Uses the hub's helpers ($, esc, L, route, toast, rqOpen, rqData, RQ_FORMS, renderRequest, URLS). Answers stay in this
   browser (cia-certs:v1) and follow the account when cloud save is on. */
const CT_KEY = "cia-certs:v1";
const CT_T = {
  ar:{k:"مرشد الشهادات", t:"ما شهادات الأيزو التي تناسب منشأتك؟", s:"أجب عن 15 سؤالاً عن مجالك وحجمك وأعمالك، فنرشّح لك الشهادات المناسبة، ومواصفات إرشادية تدعمها، وخارطة طريق للبدء.",
    introT:"اعرف شهاداتك في 3 دقائق", intro:["يشمل أكثر من 40 شهادة واعتماداً، منها ما ليس في المنصة: الطاقة والتعليم والسيارات والغذاء والأجهزة الطبية وغيرها.","يرشّح ISO 9001 أساساً، ومعها مواصفات إرشادية للتدعيم.","يحفظ إجاباتك في هذا المتصفح، ويمكنك تعديلها في أي وقت."],
    start:"ابدأ الاستبيان", resume:"أكمل من حيث توقفت", restart:"ابدأ من جديد", back:"السابق", next:"التالي", show:"اعرض الترشيحات", of:(i,n)=>`${i} / ${n}`, multi:"اختر كل ما ينطبق",
    resT:"الشهادات المرشحة لمنشأتك", base:"الأساس", baseHave:"لديكم ISO 9001", baseHaveP:"ابنوا عليها: ادمجوها مع الأنظمة التالية في نظام متكامل واحد بدل أنظمة منفصلة.",
    certs:"شهادات نرشّحها لكم", later:"قد تهمكم لاحقاً", accr:"اعتمادات (Accreditation)", accrP:"تمنحها هيئة الاعتماد الوطنية، وليست شهادة من جهة إشهاد.",
    guides:"مواصفات إرشادية للتدعيم", guidesP:"لا تُمنح عليها شهادة وحدها، لكنها ترفع جودة التطبيق وتسهّل التدقيق.", have:"لديكم",
    why:"لماذا؟", high:"أولوية عالية", rec:"مرشّحة", fit:"الملاءمة", inPlat:"افتح الأداة في المنصة", outPlat:"خارج المنصة حالياً: يمكننا مساعدتك فيها",
    kind:{cert:"شهادة نظام إدارة",scheme:"مخطط إشهاد قطاعي",verify:"تحقق من طرف ثالث",accr:"اعتماد",guide:"مواصفة إرشادية",support:"مواصفة داعمة"},
    road:"خارطة طريق مقترحة", p1:"التأسيس", p2:"التكامل والتوسّع", p3:"التدعيم والتميّز", est:"مدد تقديرية، وتختلف بحسب جاهزيتكم وعدد المواقع.",
    ims:"ادمج هذه الأنظمة في نظام متكامل واحد (IMS) لتوفير الوقت والتكلفة.", imsGo:"منشئ النظام المتكامل",
    dur:{xs:["3–4 أشهر","3–6 أشهر"],s:["3–5 أشهر","4–6 أشهر"],m:["4–6 أشهر","5–8 أشهر"],l:["6–9 أشهر","6–10 أشهر"],xl:["8–12 شهراً","8–12 شهراً"]}, year2:"السنة الثانية",
    acts:{print:"طباعة / PDF", copy:"نسخ الملخص", rq:"اطلب استشارة لهذه الشهادات", edit:"عدّل إجاباتك", again:"ابدأ من جديد"},
    copied:"تم نسخ الملخص", disc:"ترشيحات إرشادية مبنية على إجاباتك، وليست قراراً نهائياً. تأكد من متطلبات عميلك أو المناقصة، واختر جهة إشهاد معتمدة من هيئة الاعتماد في بلدك.",
    sumH:"ملخص ترشيحات الشهادات — أكاديمية التحسين المستمر", rqMsg:"نتيجة مرشد الشهادات:", none:"لا شيء", reset:"هل تريد مسح الإجابات والبدء من جديد؟",
    band:"تحتاج شهادة أيزو؟", bandP:"اعرف أي الشهادات تناسب منشأتك في 15 سؤالاً، مع خارطة طريق للبدء.", bandGo:"ابدأ مرشد الشهادات",
    qs:{sector:"المجال",size:"الحجم",cust:"العملاء",goal:"الهدف",prod:"النشاط",data:"البيانات",ai:"الذكاء الاصطناعي",ohs:"السلامة",env:"البيئة",energy:"الطاقة",bc:"الاستمرارية",comp:"الامتثال",assets:"الأصول",mat:"الجاهزية",held:"شهاداتكم"}},
  en:{k:"Certification finder", t:"Which ISO certificates fit your organization?", s:"Answer 15 questions about your field, size and work, and get the certificates that fit, guidance standards that support them, and a roadmap to start.",
    introT:"Find your certificates in 3 minutes", intro:["Covers more than 40 certificates and accreditations, including ones not on the platform: energy, education, automotive, food, medical devices and more.","Always proposes ISO 9001 as the base, with guidance standards to support it.","Keeps your answers in this browser; you can change them at any time."],
    start:"Start the questionnaire", resume:"Continue where you stopped", restart:"Start again", back:"Back", next:"Next", show:"Show the recommendations", of:(i,n)=>`${i} / ${n}`, multi:"Choose all that apply",
    resT:"Certificates recommended for your organization", base:"The base", baseHave:"You hold ISO 9001", baseHaveP:"Build on it: integrate it with the next systems into one integrated system instead of separate ones.",
    certs:"Certificates we recommend", later:"Worth a look later", accr:"Accreditations", accrP:"Granted by the national accreditation body, not a certificate from a certification body.",
    guides:"Supporting guidance standards", guidesP:"Not certified on their own, but they raise the quality of implementation and make audits easier.", have:"You hold",
    why:"Why?", high:"High priority", rec:"Recommended", fit:"Fit", inPlat:"Open the tool on the platform", outPlat:"Not on the platform yet: we can help you with it",
    kind:{cert:"Management system certificate",scheme:"Sector certification scheme",verify:"Third-party verification",accr:"Accreditation",guide:"Guidance standard",support:"Supporting standard"},
    road:"Suggested roadmap", p1:"Foundation", p2:"Integrate and extend", p3:"Strengthen and excel", est:"Estimated durations; they vary with your readiness and number of sites.",
    ims:"Integrate these systems into one integrated management system (IMS) to save time and cost.", imsGo:"IMS Builder",
    dur:{xs:["3–4 months","3–6 months"],s:["3–5 months","4–6 months"],m:["4–6 months","5–8 months"],l:["6–9 months","6–10 months"],xl:["8–12 months","8–12 months"]}, year2:"Second year",
    acts:{print:"Print / PDF", copy:"Copy the summary", rq:"Request a consultation for these", edit:"Change my answers", again:"Start again"},
    copied:"Summary copied", disc:"Guidance recommendations based on your answers, not a final decision. Check your customer's or tender's requirements, and choose a certification body accredited by your country's accreditation body.",
    sumH:"Certification recommendations — Continual Improvement Academy", rqMsg:"Certification finder result:", none:"None", reset:"Clear your answers and start again?",
    band:"Need an ISO certificate?", bandP:"Find which certificates fit your organization in 15 questions, with a roadmap to start.", bandGo:"Start the certification finder",
    qs:{sector:"Field",size:"Size",cust:"Customers",goal:"Goal",prod:"Activity",data:"Data",ai:"AI",ohs:"Safety",env:"Environment",energy:"Energy",bc:"Continuity",comp:"Compliance",assets:"Assets",mat:"Readiness",held:"Your certificates"}}
};
const ctStd = k => CT_STDS.find(s => s.k === k);
const ctBlank = () => ({sector:"", size:"", held:[], cust:[], goal:"", prod:[], data:"", ai:"", ohs:"", env:"", energy:"", bc:"", comp:"", assets:[], mat:""});
let CTS = {A:ctBlank(), step:-1, done:false};
try{ const s = JSON.parse(localStorage.getItem(CT_KEY) || "null"); if(s && s.A) CTS = {A:Object.assign(ctBlank(), s.A), step:typeof s.step === "number" ? s.step : -1, done:!!s.done}; }catch(e){}
const ctSave = () => { try{ localStorage.setItem(CT_KEY, JSON.stringify(CTS)); }catch(e){} };
const ctAnswered = q => { const v = CTS.A[q.q]; return q.t === "multi" ? Array.isArray(v) && v.length > 0 : !!v; };
const ctOpt = (q, v) => (CT_QS.find(x => x.q === q) || {opts:[]}).opts.find(o => o.v === v);
const ctLbl = (q, v) => { const o = ctOpt(q, v); return o ? o.l[L] : v; };

/* ---------- scoring ---------- */
function ctScore(A){
  const S = {}, R = {};
  const add = (k, p, q, v) => { if(!p) return; S[k] = (S[k] || 0) + p; if(p > 0) (R[k] = R[k] || []).push([p, q, v]); };
  Object.entries(CT_SECTOR_PTS[A.sector] || {}).forEach(([k, p]) => add(k, p, "sector", A.sector));
  CT_QS.forEach(q => {
    if(q.q === "sector" || q.q === "size" || q.q === "held") return;
    const vals = q.t === "multi" ? (A[q.q] || []) : [A[q.q]];
    vals.forEach(v => { const o = q.opts.find(x => x.v === v); if(o && o.pts) Object.entries(o.pts).forEach(([k, p]) => add(k, p, q.q, v)); });
  });
  Object.entries(CT_SIZE_PTS[A.size] || {}).forEach(([k, p]) => add(k, p, "size", A.size));
  if(A.held.includes("iso9001")) add("iso9004", 2, "held", "iso9001");
  if(A.held.filter(h => h !== "none").length) add("iso19011", 1, "held", A.held[0]);
  return {S, R};
}
const CT_COVERS = {iso22000:["iso22000","fssc22000","haccp"]};
function ctResult(A){
  const {S, R} = ctScore(A), held = new Set(A.held.filter(h => h !== "none").flatMap(h => CT_COVERS[h] || [h]));
  const ok = s => !CT_NEED[s.k] || CT_NEED[s.k](A);
  const rows = CT_STDS.filter(s => s.k !== "iso9001" && ok(s)).map(s => ({s, sc:Math.round((S[s.k] || 0) * 10) / 10, why:(R[s.k] || []).sort((a, b) => b[0] - a[0])}));
  const certRows = rows.filter(r => ["cert","scheme","verify"].includes(r.s.kind) && !held.has(r.s.k)).sort((a, b) => b.sc - a.sc);
  const certs = certRows.filter(r => r.sc >= 3).slice(0, 6);
  const later = certRows.filter(r => r.sc >= 1.5 && !certs.includes(r)).slice(0, 4);
  const accr = rows.filter(r => r.s.kind === "accr" && r.sc >= 3 && !held.has(r.s.k)).sort((a, b) => b.sc - a.sc);
  let guides = rows.filter(r => ["guide","support"].includes(r.s.kind) && r.sc >= 1).sort((a, b) => b.sc - a.sc).slice(0, 3);
  if(guides.length === 3 && guides[2].sc < 1.5) guides = guides.slice(0, 2);
  ["iso19011","iso31000"].forEach(k => { if(guides.length < 2 && !guides.some(g => g.s.k === k)) guides.push(rows.find(r => r.s.k === k)); });
  return {S, held, certs, later, accr, guides:guides.filter(Boolean), base:held.has("iso9001") ? "have" : "need"};
}

/* ---------- view ---------- */
function ctRender(){
  const box = $("ctBody"); if(!box) return;
  const t = CT_T[L];
  $("ctK").textContent = t.k; $("ctTitle").textContent = t.t; $("ctSub").textContent = t.s;
  ctBand();
  if(CTS.done && CT_QS.every(ctAnswered)) return ctResults(box);
  if(CTS.step < 0) return ctIntro(box);
  ctQuestion(box);
}
function ctIntro(box){
  const t = CT_T[L], begun = CT_QS.some(ctAnswered);
  box.innerHTML = `<div class="adv-card ct-intro"><div><h3>${esc(t.introT)}</h3><ul>${t.intro.map(x => `<li>${esc(x)}</li>`).join("")}</ul></div>
    <div class="ct-introacts"><button type="button" class="btn primary" id="ctGo">${esc(begun ? t.resume : t.start)} ${ARROW}</button>${begun ? `<button type="button" class="btn" id="ctNew">${esc(t.restart)}</button>` : ""}</div></div>`;
  $("ctGo").onclick = () => { CTS.step = begun ? Math.max(0, CT_QS.findIndex(q => !ctAnswered(q))) : 0; if(CTS.step < 0) CTS.step = 0; ctSave(); ctRender(); ctFocus(); };
  if(begun) $("ctNew").onclick = ctReset;
}
function ctQuestion(box){
  const t = CT_T[L], n = CT_QS.length, i = Math.min(CTS.step, n - 1), q = CT_QS[i], v = CTS.A[q.q];
  const sel = o => q.t === "multi" ? (v || []).includes(o.v) : v === o.v;
  box.innerHTML = `<div class="adv-card ct-q">
    <div class="adv-prog"><div class="bar"><i style="width:${Math.round((i / n) * 100)}%"></i></div><span>${esc(t.of(i + 1, n))}</span></div>
    <div class="adv-q"><span class="ct-grp">${esc(CT_GROUPS[q.grp][L])}</span><h3 id="ctQh" tabindex="-1">${esc(q.l[L])}</h3>${q.h || q.t === "multi" ? `<p class="hint">${esc([q.h ? q.h[L] : "", q.t === "multi" ? t.multi : ""].filter(Boolean).join(" · "))}</p>` : ""}
      <div class="adv-opts${q.grid ? " ct-grid" : ""}" role="group" aria-labelledby="ctQh">${q.opts.map(o => `<button type="button" class="adv-opt${q.t === "multi" ? " multi" : ""}" aria-pressed="${sel(o)}" data-v="${esc(o.v)}"><span class="mk" aria-hidden="true"></span><span>${esc(o.l[L])}</span></button>`).join("")}</div></div>
    <div class="adv-nav"><button type="button" class="btn" id="ctBack">${esc(t.back)}</button><span class="sp"></span><button type="button" class="btn primary" id="ctNext" ${ctAnswered(q) ? "" : "disabled"}>${esc(i === n - 1 ? t.show : t.next)} ${ARROW}</button></div></div>`;
  box.querySelectorAll(".adv-opt").forEach(b => b.onclick = () => {
    const val = b.dataset.v;
    if(q.t === "multi"){
      let a = (CTS.A[q.q] || []).slice();
      if(val === q.none) a = a.includes(val) ? [] : [val];
      else { a = a.filter(x => x !== q.none); a = a.includes(val) ? a.filter(x => x !== val) : [...a, val]; }
      CTS.A[q.q] = a; ctSave(); ctRender();
      const again = box.querySelector(`.adv-opt[data-v="${CSS.escape(val)}"]`); if(again) again.focus();
    } else {
      CTS.A[q.q] = val; ctSave(); ctRender();
      setTimeout(() => { if(CTS.step === i && CT_QS[i] === q) ctNext(); }, REDUCED() ? 0 : 220);
    }
  });
  $("ctBack").onclick = () => { CTS.step = i - 1; ctSave(); ctRender(); ctFocus(); };
  $("ctNext").onclick = ctNext;
}
function ctNext(){
  const n = CT_QS.length, i = Math.min(CTS.step, n - 1);
  if(!ctAnswered(CT_QS[i])) return;
  if(i === n - 1){ CTS.done = true; CTS.step = n - 1; } else CTS.step = i + 1;
  ctSave(); ctRender(); ctFocus();
}
function ctFocus(){ const h = $("ctQh") || $("ctResH") || $("ctGo"); if(h) h.focus({preventScroll:true}); const s = $("certs"); if(s) s.scrollIntoView({block:"start", behavior:REDUCED() ? "auto" : "smooth"}); }
function ctReset(){ if(!confirm(CT_T[L].reset)) return; CTS = {A:ctBlank(), step:0, done:false}; ctSave(); ctRender(); ctFocus(); }

function ctWhy(r){
  const t = CT_T[L], seen = new Set();
  return r.why.filter(([, q, v]) => { const k = q + v; if(seen.has(k)) return false; seen.add(k); return true; }).slice(0, 3)
    .map(([, q, v]) => `<li>${esc(t.qs[q] || q)}: ${esc(q === "held" ? (ctStd(v) || {code:v}).code : ctLbl(q, v))}</li>`).join("");
}
function ctToolLink(s){
  const t = CT_T[L];
  return s.tool && URLS[s.tool] ? `<a class="btn" href="${URLS[s.tool]}" data-mod="${s.tool}" data-modname="${esc(s.code)}">${esc(t.inPlat)}</a>` : `<span class="ct-out">${esc(t.outPlat)}</span>`;
}
function ctCard(r, i){
  const t = CT_T[L], s = r.s, pr = r.sc >= 5.5 ? "high" : "rec";
  return `<article class="ar ct-ar" style="--c:${pr === "high" ? "var(--gold)" : "var(--c-iso)"}"><span class="rk">${i + 1}</span>
    <div><h4>${esc(s.n[L])} <span class="cd">${esc(s.code)}</span></h4><span class="ct-kind">${esc(t.kind[s.kind])}</span></div>
    <div class="fit"><b class="ct-pr ${pr}">${esc(pr === "high" ? t.high : t.rec)}</b><i aria-hidden="true"><em style="width:${Math.min(100, Math.round(r.sc / 8 * 100))}%"></em></i><small>${esc(t.fit)}</small></div>
    <p class="why">${esc(s.d[L])}${s.note ? ` <span class="ct-note">${esc(s.note[L])}</span>` : ""}</p>
    ${r.why.length ? `<ul aria-label="${esc(t.why)}">${ctWhy(r)}</ul>` : ""}
    <div class="acts">${ctToolLink(s)}</div></article>`;
}
function ctResults(box){
  const t = CT_T[L], A = CTS.A, res = ctResult(A), s9 = ctStd("iso9001");
  const heldList = A.held.filter(h => h !== "none");
  const head = `<div class="ct-sum"><div><h3 id="ctResH" tabindex="-1">${esc(t.resT)}</h3><p>${esc(ctLbl("sector", A.sector))} · ${esc(t.qs.size)}: ${esc(ctLbl("size", A.size))}${heldList.length ? ` · ${esc(t.have)}: ${esc(heldList.map(h => (ctStd(h) || {code:h}).code).join("، "))}` : ""}</p></div>
    <div class="d-acts ct-acts"><button type="button" class="btn" id="ctPrint">${esc(t.acts.print)}</button><button type="button" class="btn" id="ctCopy">${esc(t.acts.copy)}</button><button type="button" class="btn gold" id="ctRq">${esc(t.acts.rq)}</button></div></div>`;
  const base = res.base === "have"
    ? `<div class="ct-base have"><span class="ct-badge">${esc(t.base)}</span><div><h4>${esc(t.baseHave)} ✓</h4><p>${esc(t.baseHaveP)}</p></div><a class="btn" href="${URLS.ims}" data-mod="ims" data-modname="${esc(t.imsGo)}">${esc(t.imsGo)}</a></div>`
    : `<div class="ct-base"><span class="ct-badge">${esc(t.base)}</span><div><h4>${esc(s9.n[L])} <span class="cd">${esc(s9.code)}</span></h4><p>${esc(s9.d[L])}</p></div>${ctToolLink(s9)}</div>`;
  const sec = (title, sub, body) => body ? `<section class="ct-sec"><h3>${esc(title)}</h3>${sub ? `<p class="ct-secp">${esc(sub)}</p>` : ""}${body}</section>` : "";
  const certs = res.certs.length ? `<div class="adv-top">${res.certs.map(ctCard).join("")}</div>` : "";
  const later = res.later.length ? `<div class="ct-chips">${res.later.map(r => `<span title="${esc(r.s.d[L])}"><b>${esc(r.s.code)}</b> ${esc(r.s.n[L])}</span>`).join("")}</div>` : "";
  const accr = res.accr.length ? `<div class="adv-top">${res.accr.map(ctCard).join("")}</div>` : "";
  const guides = `<div class="ct-guides">${res.guides.map(r => `<article><span class="ct-kind">${esc(t.kind[r.s.kind])}</span><h4>${esc(r.s.n[L])} <span class="cd">${esc(r.s.code)}</span></h4><p>${esc(r.s.d[L])}</p>${r.s.tool && URLS[r.s.tool] ? `<a href="${URLS[r.s.tool]}" data-mod="${r.s.tool}" data-modname="${esc(r.s.code)}">${esc(t.inPlat)} ${ARROW}</a>` : ""}</article>`).join("")}</div>`;
  box.innerHTML = `<div class="ct-res"><div class="adv-print-h ct-printh" aria-hidden="true">${esc(t.sumH)} · ${esc(new Date().toLocaleDateString(L === "ar" ? "ar-EG-u-nu-latn" : "en-GB"))}</div>${head}${base}
    ${sec(t.certs, "", certs)}${sec(t.accr, t.accrP, accr)}${sec(t.later, "", later)}${sec(t.guides, t.guidesP, guides)}${ctRoad(res)}
    <p class="adv-note">${esc(t.disc)}</p>
    <div class="adv-nav ct-acts"><button type="button" class="btn" id="ctEdit">${esc(t.acts.edit)}</button><span class="sp"></span><button type="button" class="btn" id="ctAgain">${esc(t.acts.again)}</button></div></div>`;
  $("ctPrint").onclick = () => {
    const root = document.documentElement, prev = root.getAttribute("data-theme");
    root.classList.add("pct"); root.setAttribute("data-theme", "light");
    const done = () => { root.classList.remove("pct"); if(prev == null) root.removeAttribute("data-theme"); else root.setAttribute("data-theme", prev); removeEventListener("afterprint", done); };
    addEventListener("afterprint", done); window.print();
  };
  $("ctCopy").onclick = async () => { const txt = ctSummary(res); try{ await navigator.clipboard.writeText(txt); toast(t.copied); }catch(e){ prompt("", txt); } };
  $("ctRq").onclick = () => ctRequest(res);
  $("ctEdit").onclick = () => { CTS.done = false; CTS.step = 0; ctSave(); ctRender(); ctFocus(); };
  $("ctAgain").onclick = ctReset;
}
function ctRoad(res){
  const t = CT_T[L], A = CTS.A, d = t.dur[A.size] || t.dur.m;
  const QMS_BASED = ["iatf16949","as9100","iso13485","iso29001","iso15378","iso22716","iso22000","fssc22000","haccp","iso7101","iso21001"];
  const p1 = res.base === "need" ? ["iso9001"] : [], p2 = [], p3 = [];
  res.certs.forEach(r => { if(QMS_BASED.includes(r.s.k) && r.sc >= 5 && p1.length < 3) p1.push(r.s.k); else if(r.sc >= 4.5 && p2.length < 3) p2.push(r.s.k); else p3.push(r.s.k); });
  if(!p1.length && p2.length) p1.push(p2.shift());
  res.accr.forEach(r => p2.length < 4 ? p2.push(r.s.k) : p3.push(r.s.k));
  res.guides.forEach(r => p3.push(r.s.k));
  const trio = ["iso9001","iso14001","iso45001"].filter(k => !res.held.has(k) && (k === "iso9001" ? res.base === "need" : res.certs.some(r => r.s.k === k)));
  const imsN = trio.length + ["iso9001","iso14001","iso45001"].filter(k => res.held.has(k)).length;
  const li = k => { const s = ctStd(k); return `<li><b dir="ltr">${esc(s.code)}</b> — ${esc(s.n[L])}</li>`; };
  const stage = (no, title, dur, ks) => ks.length ? `<div class="adv-stage"><span class="d">${esc(dur)}</span><h4>${no}. ${esc(title)}</h4><ul>${ks.map(li).join("")}</ul></div>` : "";
  return `<section class="adv-plan ct-road"><h3>${esc(t.road)}</h3>
    ${imsN >= 2 ? `<div class="adv-start"><b>IMS</b><span>${esc(t.ims)}</span><a class="btn" href="${URLS.ims}" data-mod="ims" data-modname="${esc(t.imsGo)}">${esc(t.imsGo)}</a></div>` : ""}
    <div class="adv-stages">${stage(1, t.p1, d[0], p1)}${stage(2, t.p2, d[1], p2)}${stage(3, t.p3, t.year2, p3)}</div><p class="ct-est">${esc(t.est)}</p></section>`;
}
function ctSummary(res){
  const t = CT_T[L], A = CTS.A, line = r => `- ${r.s.code} — ${r.s.n[L]}`;
  return [t.sumH, `${t.qs.sector}: ${ctLbl("sector", A.sector)} · ${t.qs.size}: ${ctLbl("size", A.size)}`, "",
    `${t.base}: ${res.base === "have" ? t.baseHave : "ISO 9001 — " + ctStd("iso9001").n[L]}`,
    res.certs.length ? `${t.certs}:\n${res.certs.map(line).join("\n")}` : "", res.accr.length ? `${t.accr}:\n${res.accr.map(line).join("\n")}` : "",
    res.later.length ? `${t.later}:\n${res.later.map(line).join("\n")}` : "", `${t.guides}:\n${res.guides.map(line).join("\n")}`, "", t.disc].filter(x => x !== "").join("\n");
}
/* the consultation request opens pre-filled: service, standards, sector, size, status and the summary */
const CT_RQ_SECTOR = {ene:"ene",og:"og",con:"con",eng:"con",man:"man",chem:"man",auto:"man",aero:"man",med:"man",pharma:"man",mine:"og",food:"food",hosp:"food",agri:"food",gov:"gov",hlth:"hlth",lab:"hlth",it:"it",fin:"fin",log:"log",edu:"edu",trn:"edu"};
const CT_RQ_SIZE = {xs:"s",s:"s",m:"m",l:"l",xl:"xl"};
function ctRequest(res){
  rqOpen("consult");
  const d = rqData.consult, A = CTS.A, F = RQ_FORMS.consult.fields, optsOf = k => ((F.find(f => f.k === k) || {}).opts || []).map(o => o[0]);
  const codes = [res.base === "need" ? "ISO 9001" : null, ...res.certs.map(r => r.s.code), ...res.accr.map(r => r.s.code)].filter(Boolean);
  if(optsOf("services").includes("cert")) d.services = [...new Set([...(d.services || []), "cert"])];
  const so = optsOf("stds"); d.stds = [...new Set([...(d.stds || []), ...codes.filter(c => so.includes(c))])];
  if(!d.sector) d.sector = CT_RQ_SECTOR[A.sector] || (optsOf("sector").includes("svc") ? "svc" : "ot");
  if(!d.size) d.size = CT_RQ_SIZE[A.size] || "";
  if(!d.status) d.status = A.held.some(h => h !== "none") ? "certd" : A.mat === "none" ? "new" : "some";
  const t = CT_T[L];
  if(!d.msg || d.msg.startsWith(t.rqMsg)) d.msg = `${t.rqMsg}\n${ctSummary(res)}`;
  renderRequest();
}
/* the band on the home page that leads here */
function ctBand(){
  const b = $("ctBand"); if(!b) return; const t = CT_T[L];
  b.innerHTML = `<div class="wrap"><div class="ct-band"><span class="ct-bi" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="9" r="6"/><path d="m9 14.5-1.5 7L12 19l4.5 2.5-1.5-7"/><path d="m9.5 9 1.8 1.8L15 7.5"/></svg></span>
    <div><b>${esc(t.band)}</b><p>${esc(t.bandP)}</p></div><a class="btn gold" href="#certs">${esc(t.bandGo)} ${ARROW}</a></div></div>`;
}
/* the menu entry, right after the Advisor, and a re-render with the rest of the page */
[UI.ar, UI.en].forEach((u, i) => { if(!u.nav.some(([h]) => h === "certs")){ const at = u.nav.findIndex(([h]) => h === "advisor"); u.nav.splice(at + 1, 0, ["certs", i ? "Certification finder" : "مرشد الشهادات"]); } });
const ctRenderAll0 = renderAll;
renderAll = function(){ ctRenderAll0.apply(this, arguments); try{ ctRender(); }catch(e){ console.error(e); } };
