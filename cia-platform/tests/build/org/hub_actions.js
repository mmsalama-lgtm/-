/* ===================== FOLLOW-UP REGISTER (#actions) AND THE INTEGRATED REPORT — step 15, 2026-10-22 =====================
   Read-only. Items come from CIAR (each tool's open items by its own rules: findings, NCRs, the ISO toolkits' own action plans, risks, actions with
   owners and dates), from the hub adapters record by record (the toolbox tools' open-item flags: the adapter is run on each record alone, so the
   counts add up to the dashboard's), and from the adapters' domain scores for the assessment tools that keep no register. Every row opens its tool. */
const ACU = {
 ar:{title:"المتابعة", sub:"كل ملاحظة وفجوة وعدم مطابقة ومعالجة خطر وإجراء مفتوح في كل الأدوات، في سجل واحد للقراءة. اضغط الصف لفتح السجل في أداته؛ الإغلاق يتم هناك.",
  issue:"أصدر التقرير الشامل", csv:"تصدير CSV", all:"الكل", sys:"المنظومة", tool:"الأداة", owner:"المالك", site:"الموقع", kind:"النوع", lateOnly:"المتأخرة فقط", q:"بحث في البنود",
  cols:["المصدر","السجل","البند","النوع","المالك","الاستحقاق","الحالة","العمر"], open:"مفتوح", late:"متأخر", days:"يوماً", more:"عرض المزيد", none:"لا توجد بنود مفتوحة بهذه التصفية.", empty:"لا توجد بيانات في الأدوات بعد. ابدأ بأي أداة، وستظهر بنودها المفتوحة هنا.",
  tot:"بنود مفتوحة", lateN:"متأخرة", toolsN:"أدوات لها بنود", ownersN:"بلا مالك", openRec:"افتح السجل في أداته", sug:"مقترح",
  K:{gap:"فجوة",ncr:"عدم مطابقة",ofi:"فرصة تحسين",obs:"ملاحظة",risk:"خطر",action:"إجراء",capa:"إجراء تصحيحي",afi:"فرصة تحسين (تميّز)",kpi:"مؤشر دون المستهدف",obligation:"التزام",finding:"بلاغ / تحقيق",project:"مشروع تحسين",flag:"بند للمتابعة",opp:"فرصة"},
  note:"للقراءة فقط: تُقرأ البنود من بيانات الأدوات في هذا المتصفح بقواعد كل أداة، ولا يُكتب شيء في أي أداة."},
 en:{title:"Follow-up", sub:"Every open finding, gap, nonconformity, risk treatment and action from every tool, in one read-only register. Press a row to open the record in its tool; closing happens there.",
  issue:"Issue the integrated report", csv:"Export CSV", all:"All", sys:"System", tool:"Tool", owner:"Owner", site:"Site", kind:"Type", lateOnly:"Overdue only", q:"Search the items",
  cols:["Source","Record","Item","Type","Owner","Due","Status","Age"], open:"Open", late:"Overdue", days:"days", more:"Show more", none:"No open items match these filters.", empty:"No data in the tools yet. Start any tool and its open items appear here.",
  tot:"open items", lateN:"overdue", toolsN:"tools with items", ownersN:"without an owner", openRec:"Open the record in its tool", sug:"Suggested",
  K:{gap:"Gap",ncr:"Nonconformity",ofi:"Opportunity for improvement",obs:"Observation",risk:"Risk",action:"Action",capa:"Corrective action",afi:"Area for improvement",kpi:"KPI below target",obligation:"Obligation",finding:"Report / investigation",project:"Improvement project",flag:"Item to follow up",opp:"Opportunity"},
  note:"Read-only: items are read from the tools' data in this browser by each tool's own rules; nothing is written to any tool."}
};
const acU = () => ACU[L];
const AC_TBX = ["capa","why5","fish","pareto","rca","a3","dmaic","iso10009","fmea","lessons","swot","pestle","stakeholders"];
const AC_DOM = ["iso27701","iso42001","pmo","iso21500","p3o","pmoexc"];
let AC = {f:{sys:"all",tool:"",owner:"",site:"",kind:"",late:false,q:""}, n:80};
function acSev(col){ col = String(col||"").toUpperCase(); return /B42318|C2410C|9A3412/.test(col) ? 3 : (/B45309|3563C9|C9821A/.test(col) ? 2 : 1); }
function acIsStarted(k){ const t = CIADASH.TOOLS.find(x=>x.k===k); return !!(t && CIAR.read(t.key)); }
/* toolbox: the hub adapter run on each record alone → that record's open-item flags (the sum equals the dashboard's counts) */
function acFlags(k){
  const t = CIADASH.TOOLS.find(x=>x.k===k), S = t ? CIAR.read(t.key) : null, out = []; if(!S || !Array.isArray(S.records)) return out;
  S.records.filter(r=>r && typeof r==="object").forEach(r=>{ const res = CIADASH.evalTool(t, Object.assign({}, S, {records:[r], assess:{}}));
    if(!res || !res.bd || !/Open items/.test(res.bd.t.en)) return;
    res.bd.items.forEach(x=>{ const n = parseInt(x.t,10)||0; if(!n) return;
      out.push({t:k, id:String(r.id||""), sub:"", kind:"flag", how:k==="capa"?"capa":"action", title:x.l, det:{ar:String(r.title||""), en:String(r.title||"")}, owner:{ar:String(r.owner||r.lead||""), en:String(r.owner||r.lead||"")},
        due:"", date:String(r.created||"").slice(0,10), sev:acSev(x.col), cl:"", tab:"tools", act:{ar:"",en:""}, sug:{ar:"",en:""}, site:{ar:String(r.area||""),en:String(r.area||"")}, open:true, late:false, flagN:n}); }); });
  return out;
}
/* assessment tools with no register: their weakest domains (the adapter's own breakdown), as gaps */
function acDomGaps(k, R){
  const r = R[k]; if(!r || r.st!=="ok" || !r.bd || !r.bd.items || /Open items/.test(r.bd.t.en)) return [];
  const per5 = /of 5/.test(r.bd.t.en);
  return r.bd.items.filter(x=>x.v!=null && x.v<60).map(x=>({t:k, id:"", sub:"", kind:"gap", how:"iso", title:x.l, det:{ar:"النتيجة "+(x.t||Math.round(x.v)+"%"), en:"Score "+(x.t||Math.round(x.v)+"%")},
    owner:{ar:"",en:""}, due:"", date:"", sev:x.v<40?3:2, cl:"", tab:"results", act:{ar:"",en:""}, sug:{ar:"",en:""}, site:{ar:"",en:""}, open:true, late:false, dom:true, v:x.v, per5}));
}
function acAll(R){
  R = R || CIADASH.evalAll(); const all = CIAR.all(), out = [];
  CIADASH.TOOLS.forEach(t=>{ let I = all[t.k] || [];
    if(AC_TBX.includes(t.k)) I = I.concat(acFlags(t.k));
    if(AC_DOM.includes(t.k)) I = I.concat(acDomGaps(t.k, R));
    I.forEach(x=>{ x.sys = t.sys; x.code = t.code; out.push(x); }); });
  return out;
}
const acTxt = (v)=>v && typeof v==="object" ? String(v[L]||v.ar||v.en||"") : String(v==null?"":v);
function acAge(x){ if(!x.date) return null; const d = Date.parse(x.date.length===7 ? x.date+"-01" : x.date); return isFinite(d) ? Math.max(0, Math.floor((Date.now()-d)/864e5)) : null; }
function acFilter(I){ const f = AC.f, q = f.q.trim().toLowerCase();
  return I.filter(x=>(f.sys==="all"||x.sys===f.sys) && (!f.tool||x.t===f.tool) && (!f.owner||acTxt(x.owner)===f.owner) && (!f.site||acTxt(x.site)===f.site) && (!f.kind||x.kind===f.kind) && (!f.late||x.late)
    && (!q || [CIAR.lab(x,"title",L), acTxt(x.det), x.id, x.code, acTxt(x.owner)].join(" ").toLowerCase().includes(q))); }
function acOpenRec(x){
  const i = CIAR.info(x.t); if(!i) return;
  if(x.id && ["capa","why5","fish","pareto","rca","a3","dmaic","iso10009","fmea","lessons","swot","pestle","stakeholders","pdca"].includes(x.t)){ try{ sessionStorage.setItem("cia-nav:"+i.file, JSON.stringify({open:x.id})); }catch(e){}
    const f = $("modFrame"); if(f && f.dataset.k===x.t) f.dataset.k = ""; }
  openModule(x.t, undefined, x.tab || undefined);
}
function renderActions(){
  const u = acU(), R = CIADASH.evalAll(), I = acAll(R).sort((a,b)=>(b.late-a.late)||(b.sev-a.sev)||String(a.due||"9").localeCompare(String(b.due||"9")));
  $("acTitle").textContent = u.title; $("acSub").textContent = u.sub;
  $("acActs").innerHTML = `<button type="button" class="btn primary" id="acIssue">${esc(u.issue)}</button><button type="button" class="btn" id="acCsv">${esc(u.csv)}</button>`;
  $("acIssue").onclick = ()=>ciaIntegratedReport(); $("acCsv").onclick = ()=>acCsv(I);
  if(!I.length){ $("acBody").innerHTML = `<div class="ac-empty"><p>${esc(u.empty)}</p></div>`; $("acStats").innerHTML = ""; $("acBar").innerHTML = ""; return; }
  const F = acFilter(I), tools = [...new Set(I.map(x=>x.t))], owners = [...new Set(I.map(x=>acTxt(x.owner)).filter(Boolean))].sort(), sites = [...new Set(I.map(x=>acTxt(x.site)).filter(Boolean))].sort(), kinds = [...new Set(I.map(x=>x.kind))];
  $("acStats").innerHTML = [[F.length,u.tot],[F.filter(x=>x.late).length,u.lateN,"late"],[new Set(F.map(x=>x.t)).size,u.toolsN],[F.filter(x=>!acTxt(x.owner)).length,u.ownersN]].map(([n,t,c])=>`<div class="ac-st ${c||""}"><b>${n}</b><span>${esc(t)}</span></div>`).join("");
  const sel = (id, lab, list, cur) => `<label class="ac-sel"><span>${esc(lab)}</span><select id="${id}"><option value="">${esc(u.all)}</option>${list.map(([v,t])=>`<option value="${esc(v)}"${cur===v?" selected":""}>${esc(t)}</option>`).join("")}</select></label>`;
  $("acBar").innerHTML = `<div class="filters" role="group" aria-label="${esc(u.sys)}">${[["all",u.all]].concat(SYSTEMS.filter(s=>I.some(x=>x.sys===s.id)).map(s=>[s.id,s.short[L].join(" ")])).map(([k,t])=>`<button type="button" class="chip" data-sy="${k}" aria-pressed="${AC.f.sys===k}">${k!=="all"?`<span class="dot" style="background:var(${SYSTEMS.find(s=>s.id===k).color})"></span>`:""}${esc(t)}</button>`).join("")}</div>
    <div class="ac-fl">${sel("acTool",u.tool,tools.map(k=>{ const t = CIADASH.TOOLS.find(x=>x.k===k); return [k, t.code+" · "+t.n[L]]; }),AC.f.tool)}${sel("acKind",u.kind,kinds.map(k=>[k,u.K[k]||k]),AC.f.kind)}${sel("acOwner",u.owner,owners.map(o=>[o,o]),AC.f.owner)}${sites.length?sel("acSite",u.site,sites.map(o=>[o,o]),AC.f.site):""}
     <label class="ac-chk"><input type="checkbox" id="acLate" ${AC.f.late?"checked":""}> ${esc(u.lateOnly)}</label><label class="tk-search ac-q"><input id="acQ" type="search" value="${esc(AC.f.q)}" placeholder="${esc(u.q)}" aria-label="${esc(u.q)}"></label></div>`;
  $("acBar").querySelectorAll("[data-sy]").forEach(b=>b.onclick = ()=>{ AC.f.sys = b.dataset.sy; AC.n = 80; renderActions(); });
  [["acTool","tool"],["acKind","kind"],["acOwner","owner"],["acSite","site"]].forEach(([id,k])=>{ const e = $(id); if(e) e.onchange = ()=>{ AC.f[k] = e.value; AC.n = 80; renderActions(); }; });
  $("acLate").onchange = e=>{ AC.f.late = e.target.checked; AC.n = 80; renderActions(); };
  let qT; $("acQ").oninput = e=>{ clearTimeout(qT); qT = setTimeout(()=>{ AC.f.q = e.target.value; AC.n = 80; renderActions(); const q = $("acQ"); if(q){ q.focus(); q.setSelectionRange(q.value.length, q.value.length); } }, 250); };
  if(!F.length){ $("acBody").innerHTML = `<p class="ac-none">${esc(u.none)}</p>`; return; }
  const rows = F.slice(0, AC.n).map((x,i)=>{ const t = CIADASH.TOOLS.find(y=>y.k===x.t), age = acAge(x), title = CIAR.lab(x,"title",L), det = acTxt(x.det), sug = CIAR.lab(x,"sug",L);
    return `<tr data-i="${i}" tabindex="0" class="${x.late?"late":""}" title="${esc(u.openRec)}"><td><span class="ac-src" style="--c:var(${SYSTEMS.find(s=>s.id===x.sys).color})"><b dir="ltr">${esc(t.code)}</b><small>${esc(t.n[L])}</small></span></td>
      <td dir="ltr">${esc(x.id)}${x.sub?`<small>/${esc(x.sub)}</small>`:""}</td><td><span class="ac-sev s${x.sev}" aria-hidden="true"></span>${esc(title.length>180?title.slice(0,179)+"…":title)}${det&&det!==title?`<small>${esc(det.length>160?det.slice(0,159)+"…":det)}</small>`:""}${x.plan&&sug?`<small>${esc(u.sug)}: ${esc(sug)}</small>`:""}</td>
      <td>${esc(u.K[x.kind]||x.kind)}</td><td>${esc(acTxt(x.owner))||"—"}</td><td dir="ltr">${esc(x.due)||"—"}</td><td><span class="ac-b ${x.late?"late":"open"}">${esc(x.late?u.late:u.open)}</span></td><td>${age==null?"—":age+" "+esc(u.days)}</td></tr>`; }).join("");
  $("acBody").innerHTML = `<div class="ac-tw"><table class="ac-t"><caption class="sr">${esc(u.title)}</caption><thead><tr>${u.cols.map(c=>`<th scope="col">${esc(c)}</th>`).join("")}</tr></thead><tbody>${rows}</tbody></table></div>`+
    (F.length>AC.n?`<button type="button" class="btn" id="acMore">${esc(u.more)} (${F.length-AC.n})</button>`:"")+`<p class="ac-note">${esc(u.note)}</p>`;
  const go = tr=>acOpenRec(F[+tr.dataset.i]);
  $("acBody").querySelectorAll("tbody tr").forEach(tr=>{ tr.onclick = ()=>go(tr); tr.onkeydown = e=>{ if(e.key==="Enter"){ e.preventDefault(); go(tr); } }; });
  if($("acMore")) $("acMore").onclick = ()=>{ AC.n += 120; renderActions(); };
}
function acCell(v){ v = String(v==null?"":v).replace(/\r?\n/g," "); return /[",;]/.test(v) ? `"${v.replace(/"/g,'""')}"` : v; }
function acCsv(I){ const u = acU();
  const rows = [[u.cols[0], u.sys, u.cols[1], u.cols[2], L==="ar"?"التفاصيل":"Detail", u.cols[3], u.cols[4], u.cols[5], u.cols[6], u.cols[7]]].concat(acFilter(I).map(x=>{ const t = CIADASH.TOOLS.find(y=>y.k===x.t), a = acAge(x);
    return [t.code+" "+t.n[L], SYSTEMS.find(s=>s.id===x.sys).name[L], x.id+(x.sub?"/"+x.sub:""), CIAR.lab(x,"title",L), acTxt(x.det), u.K[x.kind]||x.kind, acTxt(x.owner), x.due, x.late?u.late:u.open, a==null?"":a]; }));
  pfDownload(`CIA-follow-up-register-${new Date().toISOString().slice(0,10)}.csv`, "﻿"+rows.map(r=>r.map(acCell).join(",")).join("\r\n"), "text/csv;charset=utf-8"); }

/* ===================== THE INTEGRATED REPORT ===================== */
const RP_STORE = "cia-org-reports:v1";
const RPU = {
 ar:{title:"التقرير الشامل", tag:"منصة أكاديمية التحسين المستمر — إعداد مدثر سلامه", date:"تاريخ التقرير", scope:"النطاق", pf:"أُعدّ لـ", pb:"أعدّه", noOrg:"لم يُسجَّل ملف المنشأة بعد — سجّله من «ملف المنشأة» في المنصة ليظهر اسمها وشعارها هنا.",
  print:"طباعة / حفظ PDF", dl:"تنزيل HTML", csv:"خطة العمل CSV",
  s1:"الملخص التنفيذي", s2:"خريطة التكامل", s3:"الوضع الحالي لكل منظومة وأداة", s4:"خطة العمل لكل أداة", s5:"خارطة الطريق الموحدة", s6:"كيف تُتحقق كل ملاحظة وتُغلق", s7:"خطة إعادة التقييم", s8:"الملحق",
  overall:"المؤشر العام", comp:"اكتمال البيانات", toolsUsed:"أدوات مستخدمة", of:"من", sysT:"المنظومة", score:"النتيجة", used:"الأدوات المستخدمة", change:"التغير عن التقرير السابق",
  strong:"أقوى خمس نقاط", gaps:"أكبر عشر فجوات", risks:"أعلى المخاطر", overdue:"إجراءات متأخرة", decide:"ثلاثة قرارات مطلوبة من الإدارة", none:"لا يوجد.",
  mapNote:"الأدوات التي تحمل بيانات بلون كامل، والروابط بينها مرسومة بنوعها. ملف المنشأة في المركز يصل إلى كل الأدوات.",
  tool:"الأداة", idx:"المؤشر", band:"المستوى", data:"تاريخ البيانات", strengths:"نقاط القوة", tgaps:"الفجوات", openN:"بنود مفتوحة", assessed:"ما قُيِّم",
  own:"إجراءات الأداة", sugT:"خطة مقترحة — يعتمدها المالك", item:"البند", owner:"المالك", due:"الاستحقاق", status:"الحالة", evidence:"الدليل", more:n=>`و${n} بنداً آخر في ملف CSV.`,
  phases:[["0–30 يوماً","مكاسب سريعة"],["31–90 يوماً","التأسيس"],["3–6 أشهر","التوحيد"],["6–12 شهراً","التحسين"]], prio:"الأولوية", tools:"الأدوات التي يغلقها", cross:"مشترك بين عدة أدوات",
  vCols:["نوع الملاحظة","الدليل المطلوب","طريقة التحقق","من يتحقق (مستقل عن المالك)","موعد فحص الفعالية","معيار الإغلاق","المرجع"],
  vList:"الملاحظات المفتوحة وموعد التحقق", vDue:"موعد التحقق", vWhere:"تُغلق في",
  reCols:["الأداة","متى يُعاد التشغيل","ما الذي سيقارنه التقرير القادم"], reNote:"تُحفظ أرقام هذا التقرير في المتصفح ليعرض التقرير القادم التغير.",
  apUsed:"أدوات مستخدمة", apNot:"أدوات لم تُستخدم بعد", method:"ملاحظات المنهجية", sources:"المصادر", standing:"ملخصات تفسيرية وليست النص الرسمي؛ الأمثلة توضيحية.",
  methodL:["المؤشر العام ومؤشر كل أداة هما ما تحسبه لوحة أداء المنصة بالقواعد نفسها (متوسط مؤشرات الأدوات المختارة في المؤشر).","نتائج كل أداة تُقرأ عبر قارئ المنصة لتلك الأداة دون إعادة حساب بقاعدة مختلفة.","البنود المفتوحة تُقرأ بقواعد كل أداة: خطة العمل في أدوات الأيزو، والإجراءات بمالك وموعد وحالة، وبنود المتابعة في صندوق الأدوات.","ترتيب خارطة الطريق = الشدة × التأخر × عدد المنظومات التي يمسها البند؛ البند المشترك بين عدة أدوات يظهر مرة واحدة مع كل أداة يغلقها."],
  dec:{sys:(s,v)=>`اعتماد برنامج تحسين لمنظومة «${s}» (المؤشر ${v}) بمالك وميزانية وخطة 90 يوماً.`, late:n=>`تكليف ملاك ${n} إجراءً متأخراً بمواعيد جديدة واقعية، ومتابعتها في مراجعة الإدارة القادمة.`, cross:(c,n)=>`اعتماد إجراء موحد للبند ${c} الذي يظهر في ${n} أدوات بدلاً من معالجته في كل أداة منفصلة.`, risk:r=>`اتخاذ قرار المعالجة للخطر «${r}» وتحديد المستوى المقبول ومالك المعالجة.`, data:n=>`تكليف ملاك ${n} أدوات لم تُستخدم بعد بإدخال بياناتها قبل التقرير القادم.`},
  decNote:"قرارات مقترحة من البيانات، تعتمدها الإدارة.", bands:["منخفض","مقبول","جيد","متميز"], na:"—", page:"صفحة"},
 en:{title:"Integrated report", tag:"Continual Improvement Academy platform — prepared by مدثر سلامه", date:"Report date", scope:"Scope", pf:"Prepared for", pb:"Prepared by", noOrg:"No organization profile yet — register it under “Organization profile” in the platform and its name and logo appear here.",
  print:"Print / save as PDF", dl:"Download HTML", csv:"Action plan CSV",
  s1:"Executive summary", s2:"Integration map", s3:"Current status by system and tool", s4:"Action plan by tool", s5:"Consolidated roadmap", s6:"How each finding is verified and closed", s7:"Re-assessment plan", s8:"Appendix",
  overall:"Overall index", comp:"Data completeness", toolsUsed:"Tools used", of:"of", sysT:"System", score:"Score", used:"Tools used", change:"Change since the last report",
  strong:"The five strongest points", gaps:"The ten largest gaps", risks:"Top risks", overdue:"Overdue actions", decide:"Three decisions management must take", none:"None.",
  mapNote:"Tools that hold data are drawn in full colour and the links between them by type. The organization profile at the centre reaches every tool.",
  tool:"Tool", idx:"Index", band:"Level", data:"Data date", strengths:"Strengths", tgaps:"Gaps", openN:"Open items", assessed:"What was assessed",
  own:"The tool's own actions", sugT:"Suggested plan — approved by the owner", item:"Item", owner:"Owner", due:"Due", status:"Status", evidence:"Evidence", more:n=>`and ${n} more items in the CSV file.`,
  phases:[["0–30 days","Quick wins"],["31–90 days","Foundation"],["3–6 months","Standardisation"],["6–12 months","Optimisation"]], prio:"Priority", tools:"Tools it closes", cross:"Shared by several tools",
  vCols:["Finding type","Evidence required","Verification method","Who verifies (independent of the owner)","Effectiveness check","Closure criteria","Reference"],
  vList:"Open findings and their verification dates", vDue:"Verification due", vWhere:"Closed in",
  reCols:["Tool","When it is re-run","What the next report will compare"], reNote:"This report's numbers are kept in the browser so that the next report shows the change.",
  apUsed:"Tools used", apNot:"Tools not used yet", method:"Method notes", sources:"Sources", standing:"Interpretive summaries, not the official text; examples illustrative.",
  methodL:["The overall index and each tool's index are what the platform dashboard computes, by the same rules (the mean of the indices of the tools selected for the index).","Each tool's results are read through the platform's reader for that tool, never recomputed by a different rule.","Open items are read by each tool's own rules: the ISO toolkits' action plans, actions with an owner, date and status, and the toolbox tools' follow-up flags.","Roadmap order = severity × overdue × number of systems the item touches; an item shared by several tools appears once with every tool it closes."],
  dec:{sys:(s,v)=>`Approve an improvement programme for “${s}” (index ${v}) with an owner, a budget and a 90-day plan.`, late:n=>`Give the owners of ${n} overdue actions realistic new dates and follow them up at the next management review.`, cross:(c,n)=>`Approve one shared action for clause ${c}, which appears in ${n} tools, instead of treating it separately in each tool.`, risk:r=>`Decide the treatment of the risk “${r}”, the acceptable level and the treatment owner.`, data:n=>`Ask the owners of ${n} unused tools to enter their data before the next report.`},
  decNote:"Decisions proposed from the data, for management to approve.", bands:["Low","Fair","Good","Leading"], na:"—", page:"Page"}
};
const rpU = () => RPU[L];
function rpDataDate(S){ if(!S) return ""; let m = "", s = ""; try{ s = JSON.stringify(S); }catch(e){} const rx = /"(?:updated|at|created|start|date|dt|raised)":"(\d{4}-\d{2}-\d{2})/g; let x; while((x = rx.exec(s))) if(x[1]>m && x[1]<=new Date().toISOString().slice(0,10)) m = x[1]; return m; }
function rpSel(k){ return typeof isSel==="function" ? isSel(k) : true; }
function rpOverall(R){ const S = CIADASH.TOOLS.filter(t=>rpSel(t.k) && R[t.k] && R[t.k].st==="ok" && R[t.k].idx!=null), mean = a=>{ a = a.filter(v=>v!=null&&isFinite(v)); return a.length ? a.reduce((s,v)=>s+v,0)/a.length : null; };
  return {idx:mean(S.map(t=>R[t.k].idx)), comp:mean(S.map(t=>R[t.k].comp)), n:S.length, started:CIADASH.TOOLS.filter(t=>R[t.k]&&R[t.k].st==="ok").length,
    sys:Object.fromEntries(SYSTEMS.map(s=>{ const T = CIADASH.TOOLS.filter(t=>t.sys===s.id); return [s.id, {idx:mean(T.filter(t=>R[t.k]&&R[t.k].st==="ok"&&rpSel(t.k)).map(t=>R[t.k].idx)), used:T.filter(t=>R[t.k]&&R[t.k].st==="ok").length, all:T.length}]; }))}; }
function rpPhase(x){ /* the tool's own phase for the ISO plans; otherwise severity and lateness */
  if(x.plan && x.ph) return Math.max(0, Math.min(3, x.ph-1 - (x.sev>=3 && x.ph>1 ? 1 : 0)));
  if(x.late && x.sev>=2) return 0; if(x.sev>=3) return x.kind==="ncr"||x.kind==="risk" ? 0 : 1; if(x.sev===2) return 2; return 3; }
function rpRoadmap(I){
  /* the same clause in several ISO toolkits is one shared issue */
  const groups = {}, rows = [];
  I.forEach(x=>{ const iso = CIAR.QM[x.t] && (x.kind==="gap"||x.kind==="ncr") && x.cl, key = iso ? x.kind+"|"+String(x.cl).split(/[ /]/)[0].split(".").slice(0,2).join(".") : null;
    if(key){ (groups[key] = groups[key] || []).push(x); } else rows.push({x, tools:[x.t], sys:[x.sys]}); });
  Object.values(groups).forEach(g=>{ g.sort((a,b)=>b.sev-a.sev); const tools = [...new Set(g.map(y=>y.t))];
    if(tools.length>1) rows.push({x:g[0], tools, sys:[...new Set(g.map(y=>y.sys))], cross:true, cl:String(g[0].cl).split(/[ /]/)[0].split(".").slice(0,2).join("."), all:g});
    else g.forEach(y=>rows.push({x:y, tools:[y.t], sys:[y.sys]})); });
  rows.forEach(r=>{ r.score = r.x.sev * (r.x.late ? 2 : 1) * (r.tools.length>1 ? 1+r.tools.length/2 : 1) * Math.max(1, r.sys.length); r.ph = rpPhase(r.x); if(r.cross && r.ph>1) r.ph = 1; });
  return rows.sort((a,b)=>a.ph-b.ph || b.score-a.score);
}
const RP_VER = [
 ["iso", {ar:"فجوة في أداة أيزو (تقييم ذاتي)", en:"ISO toolkit gap (self-assessment)"}, {ar:"معلومات موثقة تثبت تطبيق المتطلب (إجراء، سجل، محضر)", en:"Documented information showing the requirement is met (procedure, record, minutes)"}, {ar:"إعادة الإجابة في الأداة مع الدليل، ومراجعة السجلات", en:"Re-answer in the toolkit with the evidence, and review the records"}, {ar:"مدقق داخلي ضمن برنامج التدقيق الداخلي", en:"An internal auditor within the internal audit programme"}, {ar:"التدقيق الداخلي التالي، أو بعد 3 أشهر من الإغلاق", en:"The next internal audit, or 3 months after closure"}, {ar:"إجابة 3 أو 4 من 4 بدليل قائم", en:"An answer of 3 or 4 of 4 with evidence in place"}, "ISO 9001:2026 9.1.3, 9.2.2"],
 ["ncr", {ar:"عدم مطابقة من التدقيق", en:"Audit nonconformity"}, {ar:"التصحيح، وتحديد السبب، والإجراء التصحيحي، ونتائجه (معلومات موثقة)", en:"The correction, the cause, the corrective action and its results (documented information)"}, {ar:"متابعة تدقيق أو مراجعة سجلات للتحقق من الإكمال والفعالية", en:"An audit follow-up or record review to verify completion and effectiveness"}, {ar:"المدقق أو مدير برنامج التدقيق، لا الجهة المدققة", en:"The auditor or the audit programme manager, not the auditee"}, {ar:"بعد 90 يوماً من موعد الإجراء", en:"90 days after the action's due date"}, {ar:"الإجراء نُفِّذ وثبتت فعاليته ولم تتكرر الحالة في فترة الفحص", en:"The action is done, shown effective, and the case did not recur in the check period"}, "ISO 9001:2026 10.2.1 d), 10.2.2; ISO 19011:2026 6.7"],
 ["obs", {ar:"ملاحظة / فرصة تحسين", en:"Observation / opportunity for improvement"}, {ar:"قرار موثق: تُعتمد الفرصة أو لا، ولماذا", en:"A recorded decision: the opportunity is adopted or not, and why"}, {ar:"مراجعة في التدقيق التالي أو في مراجعة الإدارة", en:"Review at the next audit or management review"}, {ar:"مدير برنامج التدقيق", en:"The audit programme manager"}, {ar:"مراجعة الإدارة التالية", en:"The next management review"}, {ar:"القرار مسجل والمعتمد منه مُنفَّذ", en:"The decision is recorded and what was adopted is done"}, "ISO 9001:2026 9.3.2, 10.1; ISO 19011:2026 6.7"],
 ["risk", {ar:"خطر فوق الشهية أو معالجة متأخرة", en:"Risk above appetite or late treatment"}, {ar:"إجراءات المعالجة منفذة، وتقييم متبقٍّ محدَّث", en:"Treatment actions done and the residual rating updated"}, {ar:"إعادة التقييم في استوديو المخاطر ومتابعة مؤشر الخطر", en:"Re-rating in the Risk Studio and the key risk indicator trend"}, {ar:"وظيفة المخاطر أو رئيس مالك الخطر", en:"The risk function or the risk owner's manager"}, {ar:"مراجعة المخاطر الربعية التالية", en:"The next quarterly risk review"}, {ar:"الخطر المتبقي ضمن الشهية المعتمدة", en:"The residual risk within the approved appetite"}, "ISO 9001:2026 6.1.2"],
 ["capa", {ar:"إجراء تصحيحي (CAPA)", en:"Corrective action (CAPA)"}, {ar:"دليل التنفيذ وبيانات معيار الفعالية", en:"Implementation evidence and the data of the effectiveness criterion"}, {ar:"مراجعة الفعالية في موعدها المخطط في أداة CAPA", en:"The effectiveness review on its planned date in the CAPA tool"}, {ar:"المعتمِد أو مراجع مستقل عن مالك السجل", en:"The approver or a reviewer independent of the record owner"}, {ar:"الموعد المخطط لمراجعة الفعالية في السجل", en:"The planned effectiveness review date in the record"}, {ar:"المعيار تحقق، والنتيجة «فعال» مسجلة", en:"The criterion is met and the result “effective” is recorded"}, "ISO 9001:2026 10.2.1 d); ISO 9000:2026 3.7.17"],
 ["kpi", {ar:"مؤشر أداء دون المستهدف", en:"KPI below target"}, {ar:"قيم المؤشر لعدة فترات", en:"The KPI's values over several periods"}, {ar:"اتجاه المؤشر في استوديو الاستراتيجية", en:"The KPI trend in the Strategy Studio"}, {ar:"وظيفة الأداء والاستراتيجية", en:"The performance and strategy function"}, {ar:"بعد ثلاث فترات قياس", en:"After three measurement periods"}, {ar:"المستهدف محقق ثلاث فترات متتالية", en:"The target met for three consecutive periods"}, "ISO 9001:2026 6.2.2, 9.1.3"],
 ["afi", {ar:"فرصة تحسين في تقييم التميّز", en:"Excellence area for improvement"}, {ar:"أدلة النهج والتطبيق والتقييم وفق RADAR", en:"Evidence of approach, deployment and assessment by RADAR"}, {ar:"إعادة التقييم في أداة التميّز", en:"Re-assessment in the excellence tool"}, {ar:"مقيِّم مستقل عن مالك المعيار", en:"An assessor independent of the criterion owner"}, {ar:"دورة التقييم الذاتي التالية (سنوية)", en:"The next self-assessment cycle (annual)"}, {ar:"تحسن نتيجة المعيار وزوال الفرصة", en:"The criterion score improved and the area resolved"}, "EFQM Model 2025, ch. 3 (RADAR)"],
 ["action", {ar:"إجراء بمالك وموعد", en:"Action with an owner and a date"}, {ar:"دليل الإكمال", en:"Evidence of completion"}, {ar:"مراجعة السجل", en:"Record review"}, {ar:"رئيس المالك أو مالك العملية", en:"The owner's manager or the process owner"}, {ar:"بعد 30 يوماً من الموعد", en:"30 days after the due date"}, {ar:"منفذ بدليل", en:"Done, with evidence"}, "ISO 9001:2026 10.2.2"]];
function rpVerDue(x){ const add = (d, n)=>{ const t = Date.parse(d.length===7 ? d+"-01" : d); if(!isFinite(t)) return ""; return new Date(t+n*864e5).toISOString().slice(0,10); };
  const base = x.due || x.date || ""; if(!base) return ""; return add(base, x.how==="ncr" ? 90 : (x.how==="risk" ? 90 : 30)); }
function rpRerun(k){ const t = CIADASH.TOOLS.find(x=>x.k===k), s = t.sys;
  const A = {ar:{iso:"كل 6 أشهر وقبل تدقيق الإشهاد أو المراقبة", grc:"كل ربع سنة للمخاطر، وسنوياً للحوكمة والامتثال", pmo:"سنوياً", exc:"سنوياً مع دورة التقييم", str:"كل فترة قياس (ربع سنوية)", aud:"عند موعد مراجعة كل سجل، ومع برنامج التدقيق", ai:"كل ربع سنة"},
   en:{iso:"Every 6 months and before the certification or surveillance audit", grc:"Quarterly for risk, annually for governance and compliance", pmo:"Annually", exc:"Annually, with the assessment cycle", str:"Every measurement period (quarterly)", aud:"At each record's review date, and with the audit programme", ai:"Quarterly"}};
  return A[L][s]; }
function rpSnap(R, o, I){ return {d:new Date().toISOString().slice(0,16).replace("T"," "), o:o.idx==null?null:Math.round(o.idx*10)/10, c:o.comp==null?null:Math.round(o.comp*10)/10,
  sys:Object.fromEntries(Object.entries(o.sys).map(([k,v])=>[k, v.idx==null?null:Math.round(v.idx*10)/10])), t:Object.fromEntries(CIADASH.TOOLS.map(t=>[t.k, R[t.k]&&R[t.k].idx!=null?Math.round(R[t.k].idx*10)/10:null])),
  open:I.length, late:I.filter(x=>x.late).length}; }
function rpBand(v){ return v==null ? -1 : v<50 ? 0 : v<70 ? 1 : v<85 ? 2 : 3; }
function buildIntegratedReport(){
  const u = rpU(), lg = L, R = CIADASH.evalAll(), o = rpOverall(R), I = acAll(R), p = CIAORG.get(), has = CIAORG.has(), today = new Date().toISOString().slice(0,10);
  let prev = null; try{ const st = JSON.parse(localStorage.getItem(RP_STORE)||"null"); if(st && Array.isArray(st.list) && st.list.length) prev = st.list[st.list.length-1]; }catch(e){}
  const pc = v=>v==null ? u.na : Math.round(v)+"%", dv = (a,b)=>a==null||b==null ? "" : `<span class="dl ${a-b>=0?"up":"dn"}">${a-b>=0?"+":""}${(a-b).toFixed(1)}</span>`;
  const T = k=>CIADASH.TOOLS.find(x=>x.k===k), used = new Set(CIADASH.TOOLS.filter(t=>R[t.k]&&R[t.k].st==="ok").map(t=>t.k));
  const acad = (document.querySelector(".brand img")||{}).src || "";
  const tx = acTxt, lab = (x,f)=>CIAR.lab(x,f,lg);
  /* ---- strengths and gaps from the adapters' own breakdowns ---- */
  const doms = []; CIADASH.TOOLS.forEach(t=>{ const r = R[t.k]; if(!r||r.st!=="ok"||!r.bd||!r.bd.items||/Open items/.test(r.bd.t.en)) return; r.bd.items.forEach(x=>{ if(x.v!=null) doms.push({t, l:tx(x.l), v:x.v, d:x.t||Math.round(x.v)+"%"}); }); });
  const strong = doms.filter(d=>d.v>=70).sort((a,b)=>b.v-a.v).slice(0,5), gaps = doms.filter(d=>d.v<70).sort((a,b)=>a.v-b.v).slice(0,10);
  if(strong.length<5) CIADASH.TOOLS.filter(t=>used.has(t.k)&&R[t.k].idx!=null&&R[t.k].idx>=70&&!strong.some(s=>s.t.k===t.k)).sort((a,b)=>R[b.k].idx-R[a.k].idx).slice(0,5-strong.length).forEach(t=>strong.push({t, l:t.n[lg], v:R[t.k].idx, d:pc(R[t.k].idx)}));
  const risks = I.filter(x=>x.kind==="risk").sort((a,b)=>b.sev-a.sev||(b.late-a.late)).slice(0,6), late = I.filter(x=>x.late);
  const RM = rpRoadmap(I);
  /* ---- three decisions ---- */
  const sysS = SYSTEMS.map(s=>({s, v:o.sys[s.id].idx})).filter(x=>x.v!=null).sort((a,b)=>a.v-b.v), dec = [];
  if(sysS.length) dec.push(u.dec.sys(sysS[0].s.name[lg], pc(sysS[0].v)));
  if(late.length) dec.push(u.dec.late(late.length));
  const cr = RM.find(r=>r.cross); if(cr) dec.push(u.dec.cross(cr.cl, cr.tools.length));
  if(dec.length<3 && risks.length) dec.push(u.dec.risk(lab(risks[0],"title")));
  const unused = CIADASH.TOOLS.filter(t=>!used.has(t.k)); if(dec.length<3 && unused.length) dec.push(u.dec.data(unused.length));
  /* ---- html ---- */
  const E = esc, th = a=>`<tr>${a.map(c=>`<th>${E(c)}</th>`).join("")}</tr>`;
  const cover = `<section class="cover"><div class="cv-logos">${has&&p.logo?`<img class="org" src="${E(p.logo)}" alt="">`:""}${acad?`<img class="acad" src="${E(acad)}" alt="">`:""}</div>
    <h1>${E(u.title)}</h1><p class="org-n">${has?E(CIAORG.name(lg)):E(u.noOrg)}</p>${has&&p.legal?`<p class="sm">${E(p.legal)}${p.cr?` · <span dir="ltr">${E(p.cr)}</span>`:""}</p>`:""}
    <dl class="cv-dl"><div><dt>${E(u.date)}</dt><dd dir="ltr">${today}</dd></div>${has&&(p.scope.ar||p.scope.en)?`<div><dt>${E(u.scope)}</dt><dd>${E(CIAORG.txt(p.scope,lg))}</dd></div>`:""}${has&&p.prepFor?`<div><dt>${E(u.pf)}</dt><dd>${E(p.prepFor)}</dd></div>`:""}${has&&p.prepBy?`<div><dt>${E(u.pb)}</dt><dd>${E(p.prepBy)}</dd></div>`:""}</dl>
    <p class="cv-tag">${E(u.tag)}</p></section>`;
  const exec = `<section><h2>1. ${E(u.s1)}</h2><div class="kp"><div><b>${pc(o.idx)}</b><span>${E(u.overall)}</span>${prev?dv(o.idx,prev.o):""}</div><div><b>${pc(o.comp)}</b><span>${E(u.comp)}</span></div><div><b>${o.started} / ${CIADASH.TOOLS.length}</b><span>${E(u.toolsUsed)}</span></div><div><b>${I.length}</b><span>${E(acU().tot)}</span>${prev?dv(I.length,prev.open).replace(/class="dl (up|dn)"/,(m,a)=>`class="dl ${a==="up"?"dn":"up"}"`):""}</div><div><b>${late.length}</b><span>${E(u.overdue)}</span></div></div>
    <table>${th([u.sysT,u.score,u.used].concat(prev?[u.change]:[]))}${SYSTEMS.map(s=>{ const x = o.sys[s.id]; return `<tr><td><i class="sw" style="background:${MAP_COL[s.id]}"></i>${E(s.name[lg])}</td><td>${pc(x.idx)}</td><td>${x.used} ${E(u.of)} ${x.all}</td>${prev?`<td>${prev.sys&&prev.sys[s.id]!=null&&x.idx!=null?dv(x.idx,prev.sys[s.id]):u.na}</td>`:""}</tr>`; }).join("")}</table>
    <div class="two"><div><h3>${E(u.strong)}</h3>${strong.length?`<ol>${strong.map(d=>`<li><b>${E(d.t.code)}</b> · ${E(d.l)} — ${E(d.d)}</li>`).join("")}</ol>`:`<p>${E(u.none)}</p>`}</div>
     <div><h3>${E(u.gaps)}</h3>${gaps.length?`<ol>${gaps.map(d=>`<li><b>${E(d.t.code)}</b> · ${E(d.l)} — ${E(d.d)}</li>`).join("")}</ol>`:`<p>${E(u.none)}</p>`}</div></div>
    <div class="two"><div><h3>${E(u.risks)}</h3>${risks.length?`<ul>${risks.map(x=>`<li><b>${E(x.code)}</b> ${E(x.id)} — ${E(lab(x,"title"))}${x.late?` <em class="late">${E(acU().late)}</em>`:""}</li>`).join("")}</ul>`:`<p>${E(u.none)}</p>`}</div>
     <div><h3>${E(u.overdue)} (${late.length})</h3>${late.length?`<ul>${late.slice(0,8).map(x=>`<li><b>${E(x.code)}</b> ${E(x.id)} — ${E(lab(x,"title"))} · <span dir="ltr">${E(x.due)}</span>${tx(x.owner)?" · "+E(tx(x.owner)):""}</li>`).join("")}</ul>`:`<p>${E(u.none)}</p>`}</div></div>
    <div class="dec"><h3>${E(u.decide)}</h3><ol>${dec.slice(0,3).map(d=>`<li>${E(d)}</li>`).join("")}</ol><p class="sm">${E(u.decNote)}</p></div></section>`;
  const map = `<section><h2>2. ${E(u.s2)}</h2><div class="mapw">${mapSVG({static:true, used})}</div><p class="sm">${E(u.mapNote)}</p></section>`;
  const status = `<section><h2>3. ${E(u.s3)}</h2>${SYSTEMS.map(s=>{ const TT = CIADASH.TOOLS.filter(t=>t.sys===s.id); if(!TT.length) return "";
     return `<h3><i class="sw" style="background:${MAP_COL[s.id]}"></i>${E(s.name[lg])} — ${pc(o.sys[s.id].idx)}</h3><table>${th([u.tool,u.idx,u.band,u.comp,u.data,u.strengths,u.tgaps,u.openN])}${TT.map(t=>{ const r = R[t.k], ok = r&&r.st==="ok";
       const bd = ok&&r.bd&&r.bd.items&&!/Open items/.test(r.bd.t.en) ? r.bd.items.filter(x=>x.v!=null) : [], st = bd.slice().sort((a,b)=>b.v-a.v).slice(0,2), gp = bd.slice().sort((a,b)=>a.v-b.v).filter(x=>x.v<70).slice(0,2);
       const fl = ok&&r.bd&&/Open items/.test(r.bd.t.en) ? r.bd.items.filter(x=>parseInt(x.t,10)>0).map(x=>`${tx(x.l)} (${x.t})`) : [];
       const n = I.filter(x=>x.t===t.k).length, b = rpBand(ok?r.idx:null);
       return `<tr class="${ok?"":"off"}"><td><b>${E(t.code)}</b> ${E(t.n[lg])}</td><td>${ok?pc(r.idx):u.na}</td><td>${b>=0?E(u.bands[b]):u.na}</td><td>${ok?pc(r.comp):u.na}</td><td dir="ltr">${E(rpDataDate(CIAR.read(t.key)))||u.na}</td><td>${st.map(x=>E(tx(x.l))+" "+(x.t||Math.round(x.v)+"%")).join("<br>")||u.na}</td><td>${(gp.map(x=>E(tx(x.l))+" "+(x.t||Math.round(x.v)+"%")).concat(fl.map(E))).join("<br>")||u.na}</td><td>${ok?n:u.na}</td></tr>`; }).join("")}</table>`; }).join("")}</section>`;
  const csvN = 25;
  const plan = `<section><h2>4. ${E(u.s4)}</h2>${CIADASH.TOOLS.filter(t=>used.has(t.k)).map(t=>{ const X = I.filter(x=>x.t===t.k), own = X.filter(x=>!x.dom), sug = X.filter(x=>x.dom);
     if(!X.length) return "";
     const row = x=>`<tr${x.late?' class="late"':""}><td dir="ltr">${E(x.id)}${x.sub?"/"+E(x.sub):""}</td><td>${E(lab(x,"title"))}${x.plan&&lab(x,"act")?`<br><small>${E(lab(x,"act"))}</small>`:""}</td><td>${E(tx(x.owner)||(x.plan?lab(x,"sug"):""))||u.na}</td><td dir="ltr">${E(x.due)||u.na}</td><td>${E(x.late?acU().late:acU().open)}</td><td>${E(acU().K[x.kind]||x.kind)}</td></tr>`;
     return `<h3><b>${E(t.code)}</b> ${E(t.n[lg])}</h3>`+(own.length?`<p class="lbl">${E(u.own)}</p><table>${th(["#",u.item,u.owner,u.due,u.status,acU().cols[3]])}${own.slice(0,csvN).map(row).join("")}</table>${own.length>csvN?`<p class="sm">${E(u.more(own.length-csvN))}</p>`:""}`:"")+
       (sug.length?`<p class="lbl sug">${E(u.sugT)}</p><table>${th([u.item,u.score,u.owner,u.due])}${sug.map(x=>`<tr><td>${E(lg==="ar"?"رفع «"+tx(x.title)+"»":"Raise “"+tx(x.title)+"”")}</td><td>${E(tx(x.det))}</td><td>${E(u.na)}</td><td>${E(lg==="ar"?"خلال 90 يوماً":"within 90 days")}</td></tr>`).join("")}</table>`:"");
   }).join("")}</section>`;
  const road = `<section><h2>5. ${E(u.s5)}</h2>${u.phases.map((ph,pi)=>{ const X = RM.filter(r=>r.ph===pi); if(!X.length) return `<h3>${E(ph[0])} — ${E(ph[1])}</h3><p class="sm">${E(u.none)}</p>`;
     return `<h3>${E(ph[0])} — ${E(ph[1])} <small>(${X.length})</small></h3><table>${th([u.prio,u.item,u.tools,u.owner,u.due])}${X.slice(0,40).map(r=>`<tr${r.x.late?' class="late"':""}><td>${Math.round(r.score*10)/10}</td><td>${r.cross?`<em class="cross">${E(u.cross)}</em> `:""}${E(lab(r.x,"title"))}</td><td>${r.tools.map(k=>E(T(k).code)).join(" · ")}</td><td>${E(tx(r.x.owner)||(r.x.plan?lab(r.x,"sug"):""))||u.na}</td><td dir="ltr">${E(r.x.due)||u.na}</td></tr>`).join("")}</table>${X.length>40?`<p class="sm">${E(u.more(X.length-40))}</p>`:""}`; }).join("")}</section>`;
  const vf = I.filter(x=>x.kind!=="flag").slice().sort((a,b)=>String(rpVerDue(a)||"9").localeCompare(String(rpVerDue(b)||"9")));
  const ver = `<section><h2>6. ${E(u.s6)}</h2><table class="vt">${th(u.vCols)}${RP_VER.map(v=>`<tr><td><b>${E(v[1][lg])}</b></td><td>${E(v[2][lg])}</td><td>${E(v[3][lg])}</td><td>${E(v[4][lg])}</td><td>${E(v[5][lg])}</td><td>${E(v[6][lg])}</td><td dir="ltr">${E(v[7])}</td></tr>`).join("")}</table>
    <h3>${E(u.vList)}</h3><table>${th(["#",u.item,acU().cols[3],u.vDue,u.vWhere])}${vf.slice(0,60).map(x=>`<tr${x.late?' class="late"':""}><td dir="ltr">${E(x.id)}</td><td>${E(lab(x,"title"))}</td><td>${E(acU().K[x.kind]||x.kind)}</td><td dir="ltr">${E(rpVerDue(x))||u.na}</td><td>${E(x.code)} · ${E(T(x.t).n[lg])}</td></tr>`).join("")}</table>${vf.length>60?`<p class="sm">${E(u.more(vf.length-60))}</p>`:""}</section>`;
  const re = `<section><h2>7. ${E(u.s7)}</h2><table>${th(u.reCols)}${CIADASH.TOOLS.filter(t=>used.has(t.k)).map(t=>`<tr><td><b>${E(t.code)}</b> ${E(t.n[lg])}</td><td>${E(rpRerun(t.k))}</td><td>${E(lg==="ar"?`المؤشر (${pc(R[t.k].idx)}) والبنود المفتوحة (${I.filter(x=>x.t===t.k).length}) مقابل هذا التقرير`:`Index (${pc(R[t.k].idx)}) and open items (${I.filter(x=>x.t===t.k).length}) against this report`)}</td></tr>`).join("")}</table><p class="sm">${E(u.reNote)}</p></section>`;
  const app = `<section><h2>8. ${E(u.s8)}</h2><div class="two"><div><h3>${E(u.apUsed)} (${used.size})</h3><ul>${CIADASH.TOOLS.filter(t=>used.has(t.k)).map(t=>`<li><b>${E(t.code)}</b> ${E(t.n[lg])} — <span dir="ltr">${E(rpDataDate(CIAR.read(t.key)))||u.na}</span></li>`).join("")}</ul></div><div><h3>${E(u.apNot)} (${unused.length})</h3><ul>${unused.map(t=>`<li><b>${E(t.code)}</b> ${E(t.n[lg])}</li>`).join("")}</ul></div></div>
    <h3>${E(u.method)}</h3><ul>${u.methodL.map(m=>`<li>${E(m)}</li>`).join("")}</ul><h3>${E(u.sources)}</h3><p>ISO 9001:2026; ISO 9000:2026; ISO 19011:2026; ISO 10009:2024; EFQM Model 2025; P3M3 — ${E(lg==="ar"?"النصوص الرسمية المرفوعة إلى المنصة، والأدوات نفسها لكل مواصفة أخرى.":"the official texts uploaded to the platform, and the tools themselves for every other standard.")}</p><p class="standing">${E(u.standing)}</p></section>`;
  const dir = lg==="ar" ? "rtl" : "ltr", font = lg==="ar" ? `"IBM Plex Sans Arabic","Segoe UI",Tahoma,sans-serif` : `Calibri,Aptos,"Segoe UI",Arial,sans-serif`;
  const css = `@page{size:A4;margin:14mm 12mm}*{box-sizing:border-box}body{margin:0;background:#F3F5F9;color:#1B2A4A;font-family:${font};font-size:13px;line-height:1.6}
.bar{position:sticky;top:0;z-index:2;display:flex;gap:8px;flex-wrap:wrap;justify-content:center;padding:10px;background:#1B2A4A}.bar button{font:inherit;font-weight:700;border:0;border-radius:999px;padding:7px 16px;background:#E6CF8A;color:#1B2A4A;cursor:pointer}.bar button.g{background:#fff}
.doc{max-width:210mm;margin:16px auto;background:#fff;padding:14mm 12mm;box-shadow:0 4px 30px rgba(27,42,74,.12)}
section{page-break-before:always;break-before:page}section.cover{page-break-before:avoid;break-before:avoid;min-height:250mm;display:flex;flex-direction:column;justify-content:center;gap:10px;border-inline-start:8px solid #B8901E;padding-inline-start:18px}
.cv-logos{display:flex;gap:18px;align-items:center}.cv-logos img.org{max-width:140px;max-height:110px;object-fit:contain}.cv-logos img.acad{width:84px;height:84px;border-radius:50%}
h1{font-family:Georgia,serif;font-size:34px;margin:10px 0 0;color:#1B2A4A}.org-n{font-size:22px;font-weight:700;margin:0}.cv-dl{display:grid;gap:6px;margin:18px 0}.cv-dl div{display:flex;gap:10px}.cv-dl dt{min-width:110px;color:#7A5E10;font-weight:700}.cv-dl dd{margin:0}
.cv-tag{margin-top:auto;color:#4B5874;font-size:12px;border-top:2px solid #B8901E;padding-top:8px}
h2{font-family:Georgia,serif;font-size:21px;border-bottom:3px solid #B8901E;padding-bottom:6px;margin:0 0 12px}h3{font-size:15px;margin:16px 0 6px;display:flex;align-items:center;gap:6px}
table{width:100%;border-collapse:collapse;margin:6px 0 10px;font-size:11.5px}th{background:#1B2A4A;color:#fff;text-align:start;padding:6px;vertical-align:top}td{border-bottom:1px solid #DCE4EE;padding:5px 6px;vertical-align:top}tr{break-inside:avoid;page-break-inside:avoid}
tr.late td{background:#FDF0EA}tr.off td{color:#8C98AE}.late{color:#B42318;font-style:normal;font-weight:700}.sw{display:inline-block;width:10px;height:10px;border-radius:50%;margin-inline-end:6px}
.kp{display:grid;grid-template-columns:repeat(5,1fr);gap:8px;margin:0 0 12px}.kp div{border:1px solid #DCE4EE;border-top:4px solid #B8901E;border-radius:10px;padding:8px;display:grid;gap:2px}.kp b{font-family:Georgia,serif;font-size:22px}.kp span{font-size:11.5px;color:#4B5874}
.dl{font-size:11px;font-weight:700}.dl.up{color:#2F7D4B}.dl.dn{color:#B42318}.two{display:grid;grid-template-columns:1fr 1fr;gap:14px}.dec{background:#FBF4DF;border:1px solid #E6CF8A;border-radius:12px;padding:6px 14px;margin-top:10px}
.sm{font-size:11.5px;color:#4B5874}.lbl{font-weight:700;margin:6px 0 2px}.lbl.sug{color:#7A5E10}.cross{font-style:normal;background:#EFEAF8;color:#5B3FA0;border-radius:6px;padding:0 6px;font-size:11px}
.mapw svg{width:100%;height:auto}.vt td{font-size:11px}.standing{font-weight:700;border-top:1px solid #DCE4EE;padding-top:8px}ol,ul{margin:4px 0;padding-inline-start:20px}
@media print{body{background:#fff}.bar{display:none}.doc{margin:0;box-shadow:none;padding:0;max-width:none}}@media (max-width:700px){.kp{grid-template-columns:repeat(2,1fr)}.two{grid-template-columns:1fr}.doc{padding:16px}}`;
  const html = `<!DOCTYPE html><html lang="${lg}" dir="${dir}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${E(u.title)} — ${E(has?CIAORG.name(lg):"CIA")} — ${today}</title><style>${css}</style></head><body>
<div class="bar"><button type="button" onclick="window.print()">${E(u.print)}</button></div><main class="doc">${cover}${exec}${map}${status}${plan}${road}${ver}${re}${app}</main></body></html>`;
  return {html, I, RM, R, o};
}
function rpCsv(RM){ const u = rpU(), a = acU(); const rows = [[L==="ar"?"المرحلة":"Phase", u.prio, u.tools, a.cols[1], u.item, a.cols[3], u.owner, u.due, u.status, L==="ar"?"عدد المنظومات":"Systems touched", L==="ar"?"مقترح":"Suggested"]];
  RM.forEach(r=>rows.push([u.phases[r.ph][0]+" "+u.phases[r.ph][1], Math.round(r.score*10)/10, r.tools.map(k=>CIADASH.TOOLS.find(t=>t.k===k).code).join(" "), r.x.id+(r.x.sub?"/"+r.x.sub:""), CIAR.lab(r.x,"title",L), a.K[r.x.kind]||r.x.kind, acTxt(r.x.owner)||(r.x.plan?CIAR.lab(r.x,"sug",L):""), r.x.due, r.x.late?a.late:a.open, r.sys.length, r.x.dom||r.x.plan?"✓":""]));
  return "﻿"+rows.map(r=>r.map(acCell).join(",")).join("\r\n"); }
function ciaIntegratedReport(opts){
  opts = opts || {};
  const done = ()=>{ const B = buildIntegratedReport(), u = rpU(), stamp = new Date().toISOString().slice(0,10);
    try{ const st = JSON.parse(localStorage.getItem(RP_STORE)||"null") || {v:1, list:[]}; if(!Array.isArray(st.list)) st.list = [];
      st.list.push(rpSnap(B.R, B.o, B.I)); st.list = st.list.slice(-12); st.v = 1; localStorage.setItem(RP_STORE, JSON.stringify(st)); }catch(e){}
    window.__ciaLastReport = B;
    if(opts.noOpen) return B;
    const url = URL.createObjectURL(new Blob([B.html], {type:"text/html;charset=utf-8"})); let w = null;
    try{ w = window.open(url, "_blank"); }catch(e){}
    if(!w) pfDownload(`CIA-integrated-report-${stamp}.html`, B.html, "text/html;charset=utf-8");
    pfDownload(`CIA-consolidated-action-plan-${stamp}.csv`, rpCsv(B.RM), "text/csv;charset=utf-8");
    setTimeout(()=>URL.revokeObjectURL(url), 60000); toast(L==="ar"?"صدر التقرير الشامل وخطة العمل الموحدة":"The integrated report and the consolidated action plan are ready");
    return B; };
  return CIAR.loadLabels("assets/cia-labels.json").then(done, done);
}
window.ciaIntegratedReport = ciaIntegratedReport;
