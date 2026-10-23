/* ===================== ORGANIZATION PROFILE (#profile) — step 15, 2026-10-22 =====================
   Register once: the hub is the only place that writes cia-org:v1 (schema in the cia-org-js block). Every tool reads it: report covers,
   "fill the empty fields" on its organization form, and suggestions for site, department and person fields. */
const PFU = {
 ar:{title:"ملف المنشأة", sub:"سجّل منشأتك مرة واحدة: الاسم والشعار والمواقع والإدارات والأشخاص. تظهر هذه البيانات على غلاف كل تقرير، وتقترحها كل أداة عند تعبئة نماذجها.",
  btn:"ملف المنشأة", btnNew:"سجّل منشأتك",
  prompt:"سجّل منشأتك مرة واحدة وستظهر بياناتها في كل أداة وتقرير", promptGo:"سجّل الآن", promptLater:"لاحقاً",
  sId:"الهوية", sLogo:"الشعار واللون", sSites:"المواقع", sDepts:"الإدارات", sPeople:"الأشخاص والتقارير", sScope:"النطاق والشهادات", sSet:"الإعدادات",
  nameAr:"اسم المنشأة (بالعربية)", nameEn:"اسم المنشأة (بالإنجليزية)", legal:"الاسم القانوني", cr:"رقم السجل التجاري", sector:"القطاع", size:"الحجم", country:"الدولة", city:"المدينة",
  logo:"الشعار", logoHint:"PNG أو JPG أو SVG أو WebP. يُصغَّر في متصفحك إلى 512 بكسل كحد أقصى، ويُحفظ بحجم لا يتجاوز 300 كيلوبايت. ملفات SVG تُنظَّف من أي نص برمجي أو روابط خارجية.",
  upload:"اختر ملف الشعار", replace:"استبدال الشعار", remove:"إزالة الشعار", onLight:"على خلفية فاتحة", onDark:"على خلفية داكنة", noLogo:"لا يوجد شعار بعد", brand:"لون الهوية (اختياري)", brandClear:"بلا لون",
  site:"اسم الموقع", siteCity:"المدينة", siteAct:"النشاط", addSite:"أضف موقعاً", del:"حذف", noSites:"لم تُضف مواقع بعد.",
  dept:"اسم الإدارة", addDept:"أضف", noDepts:"لم تُضف إدارات بعد.",
  top:"المدير الأعلى", qhse:"مدير الجودة / الصحة والسلامة والبيئة", prepFor:"يُعدّ التقرير لـ", prepBy:"يُعدّه", email:"البريد الإلكتروني", phone:"الهاتف",
  scopeAr:"بيان النطاق (بالعربية)", scopeEn:"بيان النطاق (بالإنجليزية)", held:"شهادات حاصلة عليها", target:"شهادات مستهدفة",
  fy:"بداية السنة المالية", lang:"اللغة المفضلة للتقارير", langs:[["ar","العربية"],["en","English"]],
  months:["يناير","فبراير","مارس","أبريل","مايو","يونيو","يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر"],
  save:"حفظ الملف", saved:"حُفظ ملف المنشأة", unsaved:"تغييرات لم تُحفظ", lastSaved:"آخر حفظ", never:"لم يُحفظ بعد",
  exp:"تصدير JSON", imp:"استيراد JSON", impW8:"استيراد من منصة القيادة", clear:"مسح الملف", clearQ:"سيُحذف ملف المنشأة من هذا المتصفح، وتعود التقارير بدون غلاف المنشأة. هل تريد المتابعة؟", cleared:"مُسح ملف المنشأة",
  preview:"معاينة غلاف التقارير", prevNone:"اكتب اسم المنشأة لتظهر المعاينة.", where:"أين تظهر هذه البيانات؟",
  whereL:["غلاف كل تقرير HTML وPDF في الأدوات التسع والثلاثين، بجانب شعار الأكاديمية.","زر «املأ الحقول الفارغة» فوق نموذج المنشأة في كل أداة؛ لا يغيّر سجلاً محفوظاً.","اقتراحات المواقع والإدارات والأشخاص في حقولها.","غلاف التقرير الشامل وسجل المتابعة."],
  note:"النسخة الحالية تحفظ الملف في متصفحك فقط؛ الحساب على الخادم وتسجيل الدخول يأتيان مع مرحلة المنصة المشتركة بنفس هذا المخطط.",
  eName:"اكتب اسم المنشأة بالعربية أو بالإنجليزية.", eEmail:"البريد الإلكتروني غير صحيح.", ePhone:"رقم الهاتف غير صحيح (أرقام ومسافات و + - فقط).", eCr:"رقم السجل: أرقام وحروف لاتينية فقط (4 إلى 20).", eLogo:"تعذّرت قراءة الملف أو أنه ليس صورة مدعومة.", eBig:"الشعار أكبر من 300 كيلوبايت حتى بعد التصغير. جرّب ملفاً أبسط.", eJson:"ملف JSON غير صالح لملف المنشأة.",
  impQ:"سيحل هذا الملف محل البيانات الظاهرة في النموذج (لن يُحفظ قبل أن تضغط «حفظ الملف»). متابعة؟", impOk:"استُورد الملف إلى النموذج — راجعه ثم احفظ.",
  w8T:"استيراد بيانات المنشأة من منصة القيادة", w8None:"لا توجد بيانات منشأة محفوظة في منصة القيادة في هذا المتصفح.", w8Apply:"انقل إلى النموذج", w8Cancel:"إلغاء",
  w8Cols:["الحقل","في منصة القيادة","في النموذج بعد النقل"], w8F:{name:"اسم المنشأة",sector:"القطاع (نص)",fy:"السنة المالية",owner:"المالك",notes:"ملاحظات"}, w8Note:"يُنقل الاسم فقط إلى خانته حسب لغته، ويُضاف القطاع والملاحظات إلى بيان النطاق إن كان فارغاً. لا يتغير شيء في منصة القيادة.", w8Ok:"نُقلت بيانات منصة القيادة إلى النموذج — راجعها ثم احفظ.",
  req:"مطلوب", opt:"اختياري", choose:"— اختر —", chips:"اضغط لاختيار المواصفة", dark:"داكن"},
 en:{title:"Organization profile", sub:"Register your organization once: name, logo, sites, departments and people. These details appear on the cover of every report, and every tool suggests them when you fill its forms.",
  btn:"Organization profile", btnNew:"Register your organization",
  prompt:"Register your organization once and its details appear in every tool and report", promptGo:"Register now", promptLater:"Later",
  sId:"Identity", sLogo:"Logo and colour", sSites:"Sites", sDepts:"Departments", sPeople:"People and reports", sScope:"Scope and certifications", sSet:"Settings",
  nameAr:"Organization name (Arabic)", nameEn:"Organization name (English)", legal:"Legal name", cr:"Commercial registration no.", sector:"Sector", size:"Size", country:"Country", city:"City",
  logo:"Logo", logoHint:"PNG, JPG, SVG or WebP. Resized in your browser to 512 px at most and stored at 300 KB or less. SVG files are cleaned of any script or external reference.",
  upload:"Choose a logo file", replace:"Replace the logo", remove:"Remove the logo", onLight:"On a light background", onDark:"On a dark background", noLogo:"No logo yet", brand:"Brand colour (optional)", brandClear:"No colour",
  site:"Site name", siteCity:"City", siteAct:"Activity", addSite:"Add a site", del:"Delete", noSites:"No sites added yet.",
  dept:"Department name", addDept:"Add", noDepts:"No departments added yet.",
  top:"Top manager", qhse:"Quality / QHSE manager", prepFor:"Reports prepared for", prepBy:"Reports prepared by", email:"Email", phone:"Phone",
  scopeAr:"Scope statement (Arabic)", scopeEn:"Scope statement (English)", held:"Certifications held", target:"Certifications targeted",
  fy:"Fiscal year starts in", lang:"Preferred report language", langs:[["ar","العربية"],["en","English"]],
  months:["January","February","March","April","May","June","July","August","September","October","November","December"],
  save:"Save the profile", saved:"Organization profile saved", unsaved:"Unsaved changes", lastSaved:"Last saved", never:"Not saved yet",
  exp:"Export JSON", imp:"Import JSON", impW8:"Import from the Executive Cockpit", clear:"Clear the profile", clearQ:"The organization profile will be deleted from this browser and reports will go back to having no organization cover. Continue?", cleared:"Organization profile cleared",
  preview:"Report cover preview", prevNone:"Type the organization's name to see the preview.", where:"Where do these details appear?",
  whereL:["On the cover of every HTML and PDF report of the 39 tools, next to the academy logo.","As a “Fill the empty fields” button above the organization form of every tool; it never changes a saved record.","As suggestions in site, department and person fields.","On the cover of the integrated report and in the follow-up register."],
  note:"This version keeps the profile in your browser only; a server account and sign-in come with the shared-platform phase, using this same schema.",
  eName:"Type the organization's name in Arabic or English.", eEmail:"The email address is not valid.", ePhone:"The phone number is not valid (digits, spaces, + and - only).", eCr:"Registration no.: digits and Latin letters only (4 to 20).", eLogo:"The file could not be read or is not a supported image.", eBig:"The logo is larger than 300 KB even after resizing. Try a simpler file.", eJson:"Not a valid organization profile JSON file.",
  impQ:"This file will replace what the form shows (nothing is saved until you press “Save the profile”). Continue?", impOk:"File imported into the form — review it, then save.",
  w8T:"Import the organization's details from the Executive Cockpit", w8None:"No organization details are saved in the Executive Cockpit in this browser.", w8Apply:"Move into the form", w8Cancel:"Cancel",
  w8Cols:["Field","In the Executive Cockpit","In the form after the move"], w8F:{name:"Organization name",sector:"Sector (text)",fy:"Fiscal year",owner:"Owner",notes:"Notes"}, w8Note:"The name goes to its own box by its language; the sector and notes are added to the scope statement if it is empty. Nothing changes in the Executive Cockpit.", w8Ok:"The Executive Cockpit's details are in the form — review them, then save.",
  req:"Required", opt:"Optional", choose:"— Choose —", chips:"Press to select the standard", dark:"Dark"}
};
const pfU = () => PFU[L];
const PF_PROMPT = "cia-org-prompt:v1";
let PF = null, PFdirty = false, PFerr = {};
function pfStd(){ /* the hub's standard list: every live ISO / GRC / PMO / excellence tool with its edition name */
  const out = []; SYSTEMS.forEach(s=>s.mods.forEach(m=>{ if(m.status==="live" && /^ISO(\/IEC)? \d{4,5}:\d{4}$/.test(m.name.en) && !/^ISO 10009|^ISO 21500/.test(m.name.en) && !out.some(x=>x.en===m.name.en)) out.push(m.name); })); return out; }
function pfLoad(){ PF = CIAORG.get(); PFdirty = false; PFerr = {}; }
function pfSet(path, v){ const a = path.split("."); let o = PF; for(let i=0;i<a.length-1;i++) o = o[a[i]]; o[a[a.length-1]] = v; pfDirty(true); }
function pfDirty(on){ PFdirty = on; const s = $("pfState"); if(s) s.innerHTML = pfStateHTML(); pfPreview(); }
function pfStateHTML(){ const u = pfU(), p = CIAORG.get();
  return PFdirty ? `<span class="pf-dot warn"></span>${esc(u.unsaved)}` : `<span class="pf-dot ${p.updated?"ok":""}"></span>${esc(u.lastSaved)}: ${p.updated?`<span dir="ltr">${esc(p.updated.slice(0,16).replace("T"," "))}</span>`:esc(u.never)}`; }
function pfOpts(list, cur){ return `<option value="">${esc(pfU().choose)}</option>`+list.map(([k,t])=>`<option value="${k}"${cur===k?" selected":""}>${esc(t[L])}</option>`).join(""); }
function pfField(id, label, html, opt, err){ return `<div class="pf-f${err?" bad":""}"><label for="${id}">${esc(label)}${opt?` <small>${esc(pfU().opt)}</small>`:""}</label>${html}${err?`<p class="pf-err" id="${id}-e" role="alert">${esc(err)}</p>`:""}</div>`; }
function pfIn(id, path, label, v, attrs, opt){ const e = PFerr[path]; return pfField(id, label, `<input id="${id}" data-pf="${path}" value="${esc(v||"")}" ${attrs||""}${e?` aria-invalid="true" aria-describedby="${id}-e"`:""}>`, opt, e); }
function renderProfile(){
  if(!PF) pfLoad();
  const u = pfU(), p = PF, std = pfStd();
  $("pfTitle").textContent = u.title; $("pfSub").textContent = u.sub;
  const chip = (list, key) => `<div class="pf-chips" role="group" aria-label="${esc(u[key])}">${std.map(s=>{ const on = list.includes(s.en); return `<button type="button" class="pf-chip" data-chip="${key}" data-v="${esc(s.en)}" aria-pressed="${on}">${on?"✓ ":""}<span dir="ltr">${esc(s.en)}</span></button>`; }).join("")}</div>`;
  $("pfForm").innerHTML =
   `<fieldset class="pf-sec"><legend>${esc(u.sId)}</legend><div class="pf-g2">
     ${pfIn("pfNameAr","name.ar",u.nameAr,p.name.ar,'dir="rtl" autocomplete="organization" maxlength="160"')}
     ${pfIn("pfNameEn","name.en",u.nameEn,p.name.en,'dir="ltr" autocomplete="organization" maxlength="160"',1)}
     ${pfIn("pfLegal","legal",u.legal,p.legal,'maxlength="200"',1)}
     ${pfIn("pfCr","cr",u.cr,p.cr,'dir="ltr" inputmode="numeric" maxlength="20"',1)}
     ${pfField("pfSector",u.sector,`<select id="pfSector" data-pf="sector">${pfOpts(RQ_SECTORS,p.sector)}</select>`,1)}
     ${pfField("pfSize",u.size,`<select id="pfSize" data-pf="size">${pfOpts(RQ_SIZES,p.size)}</select>`,1)}
     ${pfField("pfCountry",u.country,`<select id="pfCountry" data-pf="country">${pfOpts(RQ_COUNTRIES,p.country)}</select>`,1)}
     ${pfIn("pfCity","city",u.city,p.city,'maxlength="80"',1)}</div></fieldset>
   <fieldset class="pf-sec"><legend>${esc(u.sLogo)}</legend>
     <div class="pf-logo">
      <div class="pf-lp"><figure class="pf-lb light">${p.logo?`<img src="${esc(p.logo)}" alt="${esc(u.onLight)}">`:`<span>${esc(u.noLogo)}</span>`}<figcaption>${esc(u.onLight)}</figcaption></figure>
       <figure class="pf-lb dark">${p.logo?`<img src="${esc(p.logo)}" alt="${esc(u.onDark)}">`:`<span>${esc(u.noLogo)}</span>`}<figcaption>${esc(u.onDark)}</figcaption></figure></div>
      <div class="pf-lc"><p class="pf-hint" id="pfLogoHint">${esc(u.logoHint)}</p>
       <div class="pf-row"><label class="btn" for="pfLogoIn">${esc(p.logo?u.replace:u.upload)}</label><input id="pfLogoIn" type="file" accept="image/png,image/jpeg,image/svg+xml,image/webp" class="sr" aria-describedby="pfLogoHint">${p.logo?`<button type="button" class="btn" id="pfLogoDel">${esc(u.remove)}</button>`:""}</div>
       ${PFerr.logo?`<p class="pf-err" role="alert">${esc(PFerr.logo)}</p>`:""}
       <div class="pf-row"><label for="pfBrand">${esc(u.brand)}</label><input id="pfBrand" type="color" value="${esc(p.brand||"#B8901E")}" data-pf="brand">${p.brand?`<button type="button" class="op-lnk" id="pfBrandX">${esc(u.brandClear)}</button>`:""}</div></div></div></fieldset>
   <fieldset class="pf-sec"><legend>${esc(u.sSites)}</legend>
     <div class="pf-sites">${p.sites.length?p.sites.map((s,i)=>`<div class="pf-site"><input data-site="${i}" data-k="name" value="${esc(s.name)}" aria-label="${esc(u.site)} ${i+1}" placeholder="${esc(u.site)}"><input data-site="${i}" data-k="city" value="${esc(s.city)}" aria-label="${esc(u.siteCity)} ${i+1}" placeholder="${esc(u.siteCity)}"><input data-site="${i}" data-k="act" value="${esc(s.act)}" aria-label="${esc(u.siteAct)} ${i+1}" placeholder="${esc(u.siteAct)}"><button type="button" class="pf-x" data-sdel="${i}" aria-label="${esc(u.del)} ${esc(s.name)}">✕</button></div>`).join(""):`<p class="pf-hint">${esc(u.noSites)}</p>`}</div>
     <button type="button" class="btn" id="pfSiteAdd">+ ${esc(u.addSite)}</button></fieldset>
   <fieldset class="pf-sec"><legend>${esc(u.sDepts)}</legend>
     <div class="pf-tags">${p.depts.length?p.depts.map((d,i)=>`<span class="pf-tag">${esc(d)}<button type="button" data-ddel="${i}" aria-label="${esc(u.del)} ${esc(d)}">✕</button></span>`).join(""):`<span class="pf-hint">${esc(u.noDepts)}</span>`}</div>
     <div class="pf-row"><input id="pfDeptIn" aria-label="${esc(u.dept)}" placeholder="${esc(u.dept)}" maxlength="120"><button type="button" class="btn" id="pfDeptAdd">${esc(u.addDept)}</button></div></fieldset>
   <fieldset class="pf-sec"><legend>${esc(u.sPeople)}</legend><div class="pf-g2">
     ${pfIn("pfTop","top",u.top,p.top,'autocomplete="name" maxlength="120"',1)}
     ${pfIn("pfQhse","qhse",u.qhse,p.qhse,'maxlength="120"',1)}
     ${pfIn("pfPrepFor","prepFor",u.prepFor,p.prepFor,'maxlength="160"',1)}
     ${pfIn("pfPrepBy","prepBy",u.prepBy,p.prepBy,'maxlength="160"',1)}
     ${pfIn("pfEmail","email",u.email,p.email,'type="email" dir="ltr" autocomplete="email" maxlength="160"',1)}
     ${pfIn("pfPhone","phone",u.phone,p.phone,'type="tel" dir="ltr" autocomplete="tel" maxlength="40"',1)}</div></fieldset>
   <fieldset class="pf-sec"><legend>${esc(u.sScope)}</legend><div class="pf-g2">
     ${pfField("pfScopeAr",u.scopeAr,`<textarea id="pfScopeAr" data-pf="scope.ar" dir="rtl" rows="3" maxlength="1200">${esc(p.scope.ar)}</textarea>`,1)}
     ${pfField("pfScopeEn",u.scopeEn,`<textarea id="pfScopeEn" data-pf="scope.en" dir="ltr" rows="3" maxlength="1200">${esc(p.scope.en)}</textarea>`,1)}</div>
     <p class="pf-lbl">${esc(u.held)}</p>${chip(p.held,"held")}<p class="pf-lbl">${esc(u.target)}</p>${chip(p.target,"target")}</fieldset>
   <fieldset class="pf-sec"><legend>${esc(u.sSet)}</legend><div class="pf-g2">
     ${pfField("pfFy",u.fy,`<select id="pfFy" data-pf="fy">${u.months.map((m,i)=>{ const v=String(i+1).padStart(2,"0"); return `<option value="${v}"${p.fy===v?" selected":""}>${esc(m)}</option>`; }).join("")}</select>`)}
     ${pfField("pfLang",u.lang,`<select id="pfLang" data-pf="lang">${u.langs.map(([k,t])=>`<option value="${k}"${p.lang===k?" selected":""}>${esc(t)}</option>`).join("")}</select>`)}</div></fieldset>`;
  $("pfActs").innerHTML = `<button type="button" class="btn primary" id="pfSave">${esc(u.save)}</button><button type="button" class="btn" id="pfExp">${esc(u.exp)}</button><label class="btn" for="pfImpIn">${esc(u.imp)}</label><input type="file" id="pfImpIn" accept="application/json,.json" class="sr"><button type="button" class="btn" id="pfW8">${esc(u.impW8)}</button><button type="button" class="btn ghost" id="pfClr">${esc(u.clear)}</button>`;
  $("pfSide").innerHTML = `<div class="pf-card"><h3>${esc(u.preview)}</h3><div id="pfPrev" class="pf-prev"></div><p class="pf-state" id="pfState" aria-live="polite">${pfStateHTML()}</p></div>
    <div class="pf-card"><h3>${esc(u.where)}</h3><ul class="pf-ul">${u.whereL.map(x=>`<li>${esc(x)}</li>`).join("")}</ul><p class="pf-note">${esc(u.note)}</p></div>`;
  pfPreview(); pfBind();
}
function pfPreview(){ const b = $("pfPrev"); if(!b) return; const h = CIAORG.coverHTML(L, true, PF); b.innerHTML = h || `<p class="pf-hint">${esc(pfU().prevNone)}</p>`; }
function pfBind(){
  const f = $("pfForm"), u = pfU();
  f.oninput = e=>{ const t = e.target;
    if(t.dataset.pf){ pfSet(t.dataset.pf, t.value); if(PFerr[t.dataset.pf]){ delete PFerr[t.dataset.pf]; t.removeAttribute("aria-invalid"); const w=t.closest(".pf-f"); if(w){ w.classList.remove("bad"); const m=w.querySelector(".pf-err"); if(m) m.remove(); } } }
    else if(t.dataset.site!=null){ PF.sites[+t.dataset.site][t.dataset.k] = t.value; pfDirty(true); } };
  f.onchange = e=>{ const t = e.target; if(t.dataset.pf && t.tagName==="SELECT") pfSet(t.dataset.pf, t.value); };
  f.onclick = e=>{ const b = e.target.closest("button"); if(!b) return;
    if(b.dataset.chip){ const list = PF[b.dataset.chip], v = b.dataset.v, i = list.indexOf(v); if(i<0) list.push(v); else list.splice(i,1); pfDirty(true); renderProfile(); const nb=document.querySelector(`[data-chip="${b.dataset.chip}"][data-v="${CSS.escape(v)}"]`); if(nb) nb.focus(); }
    else if(b.dataset.sdel!=null){ PF.sites.splice(+b.dataset.sdel,1); pfDirty(true); renderProfile(); }
    else if(b.dataset.ddel!=null){ PF.depts.splice(+b.dataset.ddel,1); pfDirty(true); renderProfile(); $("pfDeptIn").focus(); } };
  $("pfSiteAdd").onclick = ()=>{ PF.sites.push({name:"",city:"",act:""}); pfDirty(true); renderProfile(); const x = document.querySelector(`[data-site="${PF.sites.length-1}"][data-k="name"]`); if(x) x.focus(); };
  const addDept = ()=>{ const v = $("pfDeptIn").value.trim(); if(!v) return; if(!PF.depts.includes(v)) PF.depts.push(v); pfDirty(true); renderProfile(); $("pfDeptIn").focus(); };
  $("pfDeptAdd").onclick = addDept; $("pfDeptIn").onkeydown = e=>{ if(e.key==="Enter"){ e.preventDefault(); addDept(); } };
  $("pfLogoIn").onchange = e=>{ const file = e.target.files && e.target.files[0]; if(file) pfLogo(file); e.target.value = ""; };
  if($("pfLogoDel")) $("pfLogoDel").onclick = ()=>{ PF.logo = ""; delete PFerr.logo; pfDirty(true); renderProfile(); };
  if($("pfBrandX")) $("pfBrandX").onclick = ()=>{ PF.brand = ""; pfDirty(true); renderProfile(); };
  $("pfSave").onclick = pfSave;
  $("pfExp").onclick = pfExport;
  $("pfImpIn").onchange = e=>{ const file = e.target.files && e.target.files[0]; if(file) pfImport(file); e.target.value = ""; };
  $("pfW8").onclick = pfFromCockpit;
  $("pfClr").onclick = ()=>{ if(!confirm(u.clearQ)) return; try{ localStorage.removeItem(CIAORG.KEY); }catch(e){} pfLoad(); renderProfile(); renderOrgBtn(); toast(u.cleared); };
}
function pfValidate(){ const u = pfU(), p = PF; PFerr = {};
  if(!p.name.ar.trim() && !p.name.en.trim()) PFerr["name.ar"] = u.eName;
  if(p.email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(p.email.trim())) PFerr.email = u.eEmail;
  if(p.phone && !/^\+?[\d\s()-]{6,20}$/.test(p.phone.trim())) PFerr.phone = u.ePhone;
  if(p.cr && !/^[0-9A-Za-z-]{4,20}$/.test(p.cr.trim())) PFerr.cr = u.eCr;
  return !Object.keys(PFerr).length; }
function pfSave(){
  const u = pfU();
  PF.sites = PF.sites.filter(s=>String(s.name||"").trim());
  if(!pfValidate()){ renderProfile(); const first = document.querySelector('#pfForm [aria-invalid="true"]'); if(first) first.focus(); return; }
  const o = CIAORG.repair(Object.assign({}, PF, {updated:new Date().toISOString()}));
  try{ localStorage.setItem(CIAORG.KEY, JSON.stringify(o)); }catch(e){ toast(e && e.name==="QuotaExceededError" ? u.eBig : String(e)); return; }
  PF = o; PFdirty = false; renderProfile(); renderOrgBtn(); renderOrgPrompt(); toast(u.saved);
}
function pfDownload(name, text, type){ const blob = new Blob([text], {type}); const a = document.createElement("a"), url = URL.createObjectURL(blob);
  a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(()=>URL.revokeObjectURL(url), 2000); }
function pfExport(){ const o = CIAORG.repair(PF); pfDownload(`cia-organization-profile-${new Date().toISOString().slice(0,10)}.json`, JSON.stringify(o, null, 2), "application/json"); }
function pfImport(file){ const u = pfU(); const r = new FileReader();
  r.onload = ()=>{ let o = null; try{ o = JSON.parse(String(r.result)); }catch(e){} if(!o || typeof o!=="object" || (!o.name && !o.v)){ toast(u.eJson); return; }
    if(!confirm(u.impQ)) return; PF = CIAORG.repair(o); PF.updated = CIAORG.get().updated; pfDirty(true); renderProfile(); toast(u.impOk); };
  r.onerror = ()=>toast(u.eJson); r.readAsText(file); }
/* logo: raster images are drawn on a canvas at 512 px at most (PNG keeps transparency; WebP if PNG is too large); SVG is cleaned and kept as vector */
function pfSvgClean(t){
  const doc = new DOMParser().parseFromString(t, "image/svg+xml"), svg = doc.documentElement;
  if(!svg || svg.nodeName.toLowerCase()!=="svg" || doc.querySelector("parsererror")) return null;
  svg.querySelectorAll("script,foreignObject,iframe,object,embed,audio,video,a").forEach(n=>n.remove());
  const walk = el=>{ [...el.attributes].forEach(a=>{ const n = a.name.toLowerCase(), v = a.value.trim();
      if(n.startsWith("on")) el.removeAttribute(a.name);
      else if((n==="href"||n==="xlink:href"||n==="src") && !/^#/.test(v) && !/^data:image\/(png|jpeg|webp|gif);base64,/i.test(v)) el.removeAttribute(a.name);
      else if(/url\(\s*['"]?(?!#)/i.test(v) || /expression\s*\(|javascript:/i.test(v)) el.removeAttribute(a.name); });
    [...el.children].forEach(walk); };
  walk(svg);
  svg.querySelectorAll("style").forEach(s=>{ s.textContent = s.textContent.replace(/@import[^;]*;?/gi,"").replace(/url\(\s*['"]?(?!#)[^)]*\)/gi,"none"); });
  return new XMLSerializer().serializeToString(svg);
}
function pfLogo(file){
  const u = pfU(), fail = m=>{ PFerr.logo = m; renderProfile(); };
  if(!/^image\/(png|jpeg|svg\+xml|webp)$/.test(file.type)) return fail(u.eLogo);
  const r = new FileReader();
  if(file.type==="image/svg+xml"){
    r.onload = ()=>{ const clean = pfSvgClean(String(r.result)); if(!clean) return fail(u.eLogo);
      const url = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(clean))); if(url.length > 300*1024*4/3 + 64) return fail(u.eBig);
      PF.logo = url; delete PFerr.logo; pfDirty(true); renderProfile(); };
    r.onerror = ()=>fail(u.eLogo); r.readAsText(file); return; }
  r.onload = ()=>{ const img = new Image();
    img.onload = ()=>{ const out = sz=>{ const k = Math.min(1, sz/Math.max(img.naturalWidth, img.naturalHeight)), c = document.createElement("canvas");
        c.width = Math.max(1, Math.round(img.naturalWidth*k)); c.height = Math.max(1, Math.round(img.naturalHeight*k)); c.getContext("2d").drawImage(img, 0, 0, c.width, c.height); return c; };
      const lim = 300*1024*4/3; let url = "";
      for(const sz of [512, 384, 256]){ const c = out(sz); url = c.toDataURL("image/png"); if(url.length <= lim) break; url = c.toDataURL("image/webp", .9); if(url.startsWith("data:image/webp") && url.length <= lim) break; url = ""; }
      if(!url) return fail(u.eBig);
      PF.logo = url; delete PFerr.logo; pfDirty(true); renderProfile(); };
    img.onerror = ()=>fail(u.eLogo); img.src = String(r.result); };
  r.onerror = ()=>fail(u.eLogo); r.readAsDataURL(file);
}
/* the Executive Cockpit kept its own organization fields (cia-workspace:v1 → org); move them into the form once, on request, after a preview */
function pfFromCockpit(){
  const u = pfU(), dlg = $("pfDlg"); let w = null; try{ w = JSON.parse(localStorage.getItem("cia-workspace:v1")||"null"); }catch(e){}
  const o = w && w.org && typeof w.org==="object" ? w.org : null, tv = v=>v && typeof v==="object" ? (v[L]||v.ar||v.en||"") : String(v==null?"":v);
  const has = o && ["name","sector","fy","owner","notes"].some(k=>tv(o[k]).trim());
  const nm = has ? tv(o.name).trim() : "", ar = /[؀-ۿ]/.test(nm);
  const next = has ? {name: ar ? nm : (PF.name.ar||""), nameEn: ar ? (PF.name.en||"") : nm} : null;
  const scope = has && !(PF.scope.ar||PF.scope.en) ? [tv(o.sector), tv(o.notes)].filter(x=>x.trim()).join(" — ") : "";
  dlg.innerHTML = `<div class="ddlg-h" style="--c:var(--c-ai)"><h3 id="pfDlgT">${esc(u.w8T)}</h3><button type="button" class="ddlg-x" id="pfDlgX" aria-label="${esc(u.w8Cancel)}">×</button></div><div class="ddlg-b">`+
    (has ? `<table class="pf-tbl"><thead><tr>${u.w8Cols.map(c=>`<th>${esc(c)}</th>`).join("")}</tr></thead><tbody>`+
      `<tr><td>${esc(u.w8F.name)}</td><td>${esc(nm)||"—"}</td><td>${esc(ar?u.nameAr:u.nameEn)}: ${esc(nm)||"—"}</td></tr>`+
      ["sector","fy","owner","notes"].map(k=>`<tr><td>${esc(u.w8F[k])}</td><td>${esc(tv(o[k]))||"—"}</td><td>${k==="sector"||k==="notes"?(scope?esc(u.scopeAr):"—"):"—"}</td></tr>`).join("")+
      `</tbody></table><p class="pf-hint">${esc(u.w8Note)}</p><div class="dd-f"><button type="button" class="d-btn" id="pfDlgC">${esc(u.w8Cancel)}</button><button type="button" class="btn primary" id="pfDlgOk">${esc(u.w8Apply)}</button></div>`
     : `<p>${esc(u.w8None)}</p><div class="dd-f"><button type="button" class="btn primary" id="pfDlgC">${esc(u.w8Cancel)}</button></div>`)+`</div>`;
  $("pfDlgX").onclick = $("pfDlgC").onclick = ()=>dlg.close();
  if($("pfDlgOk")) $("pfDlgOk").onclick = ()=>{ PF.name.ar = next.name; PF.name.en = next.nameEn; if(scope) PF.scope.ar = scope; pfDirty(true); dlg.close(); renderProfile(); toast(u.w8Ok); };
  if(typeof dlg.showModal==="function"){ if(!dlg.open) dlg.showModal(); } else dlg.setAttribute("open","");
}
/* header button and the first-visit prompt on the home page */
function renderOrgBtn(){ const b = $("orgBtn"); if(!b) return; const u = pfU(), p = CIAORG.get(), has = CIAORG.has(), nm = CIAORG.name(L);
  const ini = (nm||"").trim().split(/\s+/).slice(0,2).map(w=>w[0]||"").join("").toUpperCase();
  $("orgAv").innerHTML = p.logo ? `<img src="${esc(p.logo)}" alt="">` : (has ? esc(ini) : `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-4h6v4M9 10h.01M15 10h.01M9 14h.01M15 14h.01"/></svg>`);
  $("orgLbl").textContent = has ? nm : u.btnNew; b.title = u.btn; b.setAttribute("aria-label", u.btn + (has ? ": " + nm : "")); b.classList.toggle("has", has); }
function renderOrgPrompt(){ const x = $("orgPrompt"); if(!x) return; let off = false; try{ off = localStorage.getItem(PF_PROMPT)==="later"; }catch(e){}
  const u = pfU(); x.hidden = CIAORG.has() || off; if(x.hidden) return;
  x.innerHTML = `<span class="op-ic" aria-hidden="true"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-4h6v4"/></svg></span><p>${esc(u.prompt)}</p><a class="btn primary" href="#profile">${esc(u.promptGo)}</a><button type="button" class="op-lnk" id="orgLater">${esc(u.promptLater)}</button>`;
  $("orgLater").onclick = ()=>{ try{ localStorage.setItem(PF_PROMPT,"later"); }catch(e){} x.hidden = true; }; }
CIAORG.on(()=>{ if(!PFdirty) pfLoad(); renderOrgBtn(); renderOrgPrompt(); if(curView==="profile" && !PFdirty) renderProfile(); });
window.addEventListener("beforeunload", e=>{ if(PFdirty){ e.preventDefault(); e.returnValue = ""; } });
