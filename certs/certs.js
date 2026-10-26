/* ===================== CERTIFICATION FINDER — questionnaire, scoring and the management report (view #certs) =====================
   Uses the hub's helpers ($, esc, L, route, toast, rqOpen, rqData, RQ_FORMS, renderRequest, URLS, ARROW, REDUCED, CIAORG).
   Answers stay in this browser (cia-certs:v1) and follow the account when cloud save is on. */
const CT_KEY = "cia-certs:v1";
const CT_T = {
  ar:{k:"مرشد الشهادات", t:"ما شهادات الأيزو التي تناسب منشأتك؟", s:"أجب عن 15 سؤالاً عن مجالاتك وحجمك وأعمالك، فتحصل على تقرير متكامل يُرفع للإدارة العليا: الشهادات المناسبة، والجاهزية، وخطة التأهيل والتدريب، والمدة حتى الحصول على الشهادة.",
    introT:"تقرير شهاداتك في 3 دقائق", intro:["يغطي أكثر من 80 شهادة واعتماداً ومواصفة إرشادية، منها ما ليس في المنصة: الصحة والمختبرات والتدريب المهني والطاقة والغذاء والسيارات والأجهزة الطبية وغيرها.","يمكنك اختيار حتى 3 مجالات عمل، ويرشّح ISO 9001 أساساً مع مواصفات إرشادية للتدعيم.","ينتهي بتقرير للإدارة العليا: نقاط القوة وفرص التحسين، وخطة التنفيذ والتدريب، والمدة، والمعوقات، والقرار المطلوب."],
    start:"ابدأ الاستبيان", resume:"أكمل من حيث توقفت", restart:"ابدأ من جديد", back:"السابق", next:"التالي", show:"اعرض التقرير", of:(i,n)=>`${i} / ${n}`, multi:"اختر كل ما ينطبق", maxN:n=>`اختر حتى ${n}`,
    repT:"تقرير ترشيح الشهادات وخطة التأهيل", repS:"مرفوع إلى الإدارة العليا لاتخاذ القرار", orgPh:"اكتب اسم منشأتك ليظهر على التقرير", orgL:"المنشأة", date:"التاريخ", fields:"مجالات العمل", sizeL:"عدد العاملين", by:"أُعدّ بواسطة", byV:"مرشد الشهادات — أكاديمية التحسين المستمر",
    s1:"الملخص التنفيذي", s2:"تقييم الجاهزية الحالية", s3:"الشهادات المرشحة", s4:"الاعتمادات والمواصفات الإرشادية", s5:"خطة التنفيذ وخريطة الوصول إلى الشهادة", s6:"خطة التدريب والتأهيل", s7:"المعوقات المتوقعة وكيف نتجاوزها", s8:"القرار المطلوب من الإدارة العليا", s9:"ضوابط قبل التعاقد مع جهة الإشهاد",
    kpi:{n:"شهادات واعتمادات مرشحة", first:"حتى الشهادة الأولى", total:"المدة الكلية للخطة", ready:"الجاهزية الحالية"},
    sum:(o,w1,m1,w2,n,T,R,gaps)=>`نوصي بأن تبدأ ${o} بـ ${w1} خلال ${m1} تقريباً${w2?`، ثم ${w2}`:""}، لتصل إلى ${n} خلال ${T}. الجاهزية الحالية ${R}%${gaps?`، وأبرز فرص التحسين: ${gaps}`:""}.`,
    yourOrg:"منشأتكم", strengths:"نقاط القوة", opps:"فرص التحسين", need:"الاحتياج", readyS:"الجاهزية",
    dims:{q:"الجودة والعمليات",ohs:"السلامة والصحة المهنية",env:"البيئة والطاقة",info:"المعلومات والبيانات",gov:"الحوكمة والامتثال",bc:"الاستمرارية والمرونة",sec:"المتطلبات القطاعية"},
    stH:(d,c)=>`${d}: لديكم أساس قائم${c?` (${c})`:""}`, stLow:d=>`${d}: المخاطر منخفضة ويمكن ضبطها بسهولة`, stMat:"نظام إدارة موثّق ومطبّق يمكن البناء عليه", stPart:"إجراءات وممارسات جزئية تختصر وقت التأهيل", stGoal:g=>`هدف واضح من الشهادة: ${g}`, stIntl:"عملاء دوليون يرفعون قيمة الشهادات وعائدها", stHeld:c=>`شهادات قائمة: ${c}`,
    opH:(d,c)=>`${d}: الاحتياج مرتفع والجاهزية منخفضة${c?`، ونرشّح ${c}`:""}`, opMat:"لا يوجد نظام موثّق بعد: ابدأوا بخريطة العمليات والسياسات الأساسية", opS:d=>`${d}: فجوة محدودة يمكن سدّها ضمن المرحلة القادمة`, opNone:"الجاهزية متقاربة مع الاحتياج في كل المحاور؛ الفرصة الأهم هي التوسع بالأنظمة المرشحة والمواصفات الإرشادية.",
    base:"الأساس", baseHave:"لديكم ISO 9001", baseHaveP:"ابنوا عليها: ادمجوها مع الأنظمة التالية في نظام متكامل واحد بدل أنظمة منفصلة.",
    certs:"شهادات نرشّحها لكم", later:"قد تهمكم لاحقاً", accr:"اعتمادات (Accreditation)", accrP:"تمنحها هيئة الاعتماد الوطنية، وليست شهادة من جهة إشهاد.",
    guides:"مواصفات إرشادية للتدعيم", guidesP:"لا تُمنح عليها شهادة وحدها، لكنها ترفع جودة التطبيق وتسهّل التدقيق.", have:"لديكم",
    why:"لماذا؟", high:"أولوية عالية", rec:"مرشّحة", fit:"الملاءمة", inPlat:"افتح الأداة في المنصة", outPlat:"خارج المنصة حالياً: يمكننا مساعدتك فيها", wave:n=>`المرحلة ${n}`,
    kind:{cert:"شهادة نظام إدارة",service:"شهادة خدمة",scheme:"مخطط إشهاد قطاعي",verify:"تحقق من طرف ثالث",accr:"اعتماد",guide:"مواصفة إرشادية",support:"مواصفة داعمة"},
    pack:"الحزمة الأقرب لنشاطكم", packIn:"ضمن الترشيحات", packHave:"لديكم",
    mx:"مصفوفة الأولوية", mxX:"الجهد المطلوب", mxY:"الأثر والملاءمة", mxQ:["مشاريع استراتيجية","مكاسب سريعة","تحسينات لاحقة","تُدرس لاحقاً"],
    p:["التأسيس","التكامل والتوسّع","التدعيم والتميّز"], acts:["تحليل الفجوات والتخطيط","التدريب والتوعية","التوثيق والتطبيق","التدقيق الداخلي ومراجعة الإدارة","تدقيق الإشهاد (المرحلتان 1 و2)"],
    month:"الشهر", cert:"الشهادة", ganttNote:"مدد تقديرية تختلف بحسب جاهزيتكم وعدد المواقع والموارد المخصصة.", cycle:"بعد الحصول على الشهادة: صلاحيتها 3 سنوات، مع تدقيق مراقبة سنوي، ثم إعادة الإشهاد.",
    phaseOut:["سياسة وأهداف ونطاق معتمد، وخطة مشروع وفريق","نظام متكامل يضم الأنظمة التالية وتدقيق مشترك","تعميق الأداء بالمواصفات الإرشادية والأنظمة المتقدمة"],
    trH:["الفئة المستهدفة","البرنامج","المدة","العدد"], trTop:"الإدارة العليا", trTopC:"إحاطة تنفيذية بمتطلبات الأنظمة ودور القيادة", trAll:"جميع العاملين", trAllC:"توعية بالأنظمة والسياسات والأهداف", trImp:"منسق النظام", trImpC:c=>`تأهيل المطبّق الرئيسي (Lead Implementer) لـ ${c}`, trAud:"المدققون الداخليون", trAudC:c=>`التدقيق الداخلي وفق ISO 19011 على ${c}`, trLead:"قائد فريق التدقيق", trLeadC:"مدقق رئيسي (اختياري للمنشآت الكبيرة)", trSp:"الفرق المعنية",
    d:{half:"نصف يوم",hrs:"2–3 ساعات",d35:"3–5 أيام",d23:"2–3 أيام",d5:"5 أيام",d12:"1–2 يوم"}, everyone:"الكل", ppl:n=>`${n} أشخاص`,
    obH:["المعوّق","الأثر","كيف نتجاوزه"], lvl:{h:"عالٍ",m:"متوسط"},
    dec:"نطلب من الإدارة العليا اعتماد ما يلي:", decs:(w1,m1,team)=>[`اعتماد نطاق المرحلة الأولى: ${w1}، والجدول الزمني للحصول على الشهادة الأولى خلال ${m1}.`,`تعيين ممثل للإدارة يملك المشروع، وفريق تنفيذ من ${team} أشخاص من الإدارات الرئيسية.`,"اعتماد ميزانية تشمل التدريب والاستشارات وأتعاب جهة الإشهاد والتدقيقات السنوية.","اعتماد مراجعة إدارة شهرية لمتابعة التقدم ومعالجة المعوقات."],
    next:"الخطوات خلال 30 يوماً", nexts:["تحليل فجوات مفصّل للمواصفة الأولى (التقييم الذاتي في المنصة)","تشكيل الفريق وإطلاق التوعية","تحديد النطاق والمواقع والاستثناءات","طلب عروض من جهات إشهاد معتمدة لنطاقكم"], selfA:"ابدأ التقييم الذاتي",
    ims:"ادمج هذه الأنظمة في نظام متكامل واحد (IMS) لتوفير الوقت والتكلفة.", imsGo:"منشئ النظام المتكامل",
    bar:{print:"طباعة / PDF", copy:"نسخ الملخص", rq:"اطلب استشارة لهذه الشهادات", edit:"عدّل إجاباتك", again:"ابدأ من جديد"},
    copied:"تم نسخ الملخص", disc:"ترشيحات إرشادية مبنية على إجاباتكم، وليست قراراً نهائياً. تأكدوا من متطلبات العميل أو المناقصة، واختاروا جهة إشهاد معتمدة لنطاقكم من هيئة الاعتماد في بلدكم.",
    sumH:"تقرير ترشيح الشهادات — أكاديمية التحسين المستمر", rqMsg:"نتيجة مرشد الشهادات:", reset:"هل تريد مسح الإجابات والبدء من جديد؟",
    gA:"المرشد", gAT:"اعثر على الأدوات المناسبة لمنشأتك", gAP:"14 سؤالاً، وأدوات المنصة الأنسب لك مع خطة بداية.", gC:"مرشد الشهادات", gCT:"اعرف شهادات الأيزو المناسبة لمنشأتك", gCP:"15 سؤالاً، وتقرير للإدارة العليا بالشهادات والخطة والمدة.",
    qs:{sectors:"المجال",size:"الحجم",cust:"العملاء",goal:"الهدف",prod:"النشاط",data:"البيانات",ai:"الذكاء الاصطناعي",ohs:"السلامة",env:"البيئة",energy:"الطاقة",bc:"الاستمرارية",comp:"الامتثال",assets:"الأصول",mat:"الجاهزية",held:"شهاداتكم"},
    months:n=>n===1?"شهر واحد":n===2?"شهرين":n<=10?`${n} أشهر`:`${n} شهراً`, certsN:n=>n===1?"شهادة واحدة":n===2?"شهادتين":n<=10?`${n} شهادات`:`${n} شهادة`, and:" و", list:a=>a.length<2?a.join(""):a.slice(0,-1).join("، ")+" و"+a[a.length-1]},
  en:{k:"Certification finder", t:"Which ISO certificates fit your organization?", s:"Answer 15 questions about your fields, size and work, and get a complete report for top management: the certificates that fit, your readiness, the implementation and training plan, and the time to certification.",
    introT:"Your certification report in 3 minutes", intro:["Covers more than 80 certificates, accreditations and guidance standards, including ones not on the platform: healthcare, laboratories, vocational training, energy, food, automotive, medical devices and more.","You can choose up to 3 fields of work; ISO 9001 is always the base, with guidance standards to support it.","Ends with a report for top management: strengths and improvement opportunities, the implementation and training plan, the timeline, the obstacles and the decision required."],
    start:"Start the questionnaire", resume:"Continue where you stopped", restart:"Start again", back:"Back", next:"Next", show:"Show the report", of:(i,n)=>`${i} / ${n}`, multi:"Choose all that apply", maxN:n=>`Choose up to ${n}`,
    repT:"Certification recommendation and readiness plan", repS:"Submitted to top management for decision", orgPh:"Type your organization's name to show it on the report", orgL:"Organization", date:"Date", fields:"Fields of work", sizeL:"People", by:"Prepared by", byV:"Certification finder — Continual Improvement Academy",
    s1:"Executive summary", s2:"Current readiness", s3:"Recommended certificates", s4:"Accreditations and guidance standards", s5:"Implementation plan and roadmap to certification", s6:"Training and qualification plan", s7:"Expected obstacles and how to overcome them", s8:"Decision required from top management", s9:"Checks before contracting a certification body",
    kpi:{n:"Certificates and accreditations recommended", first:"To the first certificate", total:"Whole plan", ready:"Current readiness"},
    sum:(o,w1,m1,w2,n,T,R,gaps)=>`We recommend that ${o} starts with ${w1} in about ${m1}${w2?`, then ${w2}`:""}, reaching ${n} within ${T}. Current readiness is ${R}%${gaps?`; the main improvement opportunities: ${gaps}`:""}.`,
    yourOrg:"your organization", strengths:"Strengths", opps:"Improvement opportunities", need:"Need", readyS:"Readiness",
    dims:{q:"Quality and processes",ohs:"Health and safety",env:"Environment and energy",info:"Information and data",gov:"Governance and compliance",bc:"Continuity and resilience",sec:"Sector requirements"},
    stH:(d,c)=>`${d}: a foundation is in place${c?` (${c})`:""}`, stLow:d=>`${d}: low risk, easy to control`, stMat:"A documented, working management system to build on", stPart:"Some procedures and practices that shorten the preparation", stGoal:g=>`A clear goal for certification: ${g}`, stIntl:"International customers raise the value and return of certification", stHeld:c=>`Certificates held: ${c}`,
    opH:(d,c)=>`${d}: high need and low readiness${c?`; we recommend ${c}`:""}`, opMat:"No documented system yet: start with the process map and core policies", opS:d=>`${d}: a limited gap that the next phase can close`, opNone:"Readiness is close to the need in every area; the main opportunity is to extend with the recommended systems and guidance standards.",
    base:"The base", baseHave:"You hold ISO 9001", baseHaveP:"Build on it: integrate it with the next systems into one integrated system instead of separate ones.",
    certs:"Certificates we recommend", later:"Worth a look later", accr:"Accreditations", accrP:"Granted by the national accreditation body, not a certificate from a certification body.",
    guides:"Supporting guidance standards", guidesP:"Not certified on their own, but they raise the quality of implementation and make audits easier.", have:"You hold",
    why:"Why?", high:"High priority", rec:"Recommended", fit:"Fit", inPlat:"Open the tool on the platform", outPlat:"Not on the platform yet: we can help you with it", wave:n=>`Phase ${n}`,
    kind:{cert:"Management system certificate",service:"Service certificate",scheme:"Sector certification scheme",verify:"Third-party verification",accr:"Accreditation",guide:"Guidance standard",support:"Supporting standard"},
    pack:"The package closest to your activity", packIn:"in the recommendations", packHave:"held",
    mx:"Priority matrix", mxX:"Effort required", mxY:"Impact and fit", mxQ:["Strategic projects","Quick wins","Later improvements","Consider later"],
    p:["Foundation","Integrate and extend","Strengthen and excel"], acts:["Gap analysis and planning","Training and awareness","Documentation and implementation","Internal audit and management review","Certification audit (stages 1 and 2)"],
    month:"Month", cert:"Certificate", ganttNote:"Estimated durations; they vary with your readiness, number of sites and the resources assigned.", cycle:"After certification: the certificate is valid for 3 years, with an annual surveillance audit, then recertification.",
    phaseOut:["Approved policy, objectives and scope, a project plan and a team","One integrated system covering the next systems, with a joint audit","Deeper performance through guidance standards and advanced systems"],
    trH:["Audience","Programme","Duration","People"], trTop:"Top management", trTopC:"Executive briefing on the requirements and leadership's role", trAll:"All staff", trAllC:"Awareness of the systems, policies and objectives", trImp:"System coordinator", trImpC:c=>`Lead implementer training for ${c}`, trAud:"Internal auditors", trAudC:c=>`Internal auditing to ISO 19011 on ${c}`, trLead:"Audit team leader", trLeadC:"Lead auditor (optional for large organizations)", trSp:"Teams concerned",
    d:{half:"Half a day",hrs:"2–3 hours",d35:"3–5 days",d23:"2–3 days",d5:"5 days",d12:"1–2 days"}, everyone:"All", ppl:n=>`${n} people`,
    obH:["Obstacle","Impact","How to overcome it"], lvl:{h:"High",m:"Medium"},
    dec:"We ask top management to approve:", decs:(w1,m1,team)=>[`The scope of phase 1: ${w1}, and the timeline to the first certificate within ${m1}.`,`A management representative who owns the project, and an implementation team of ${team} people from the main departments.`,"A budget covering training, consulting, certification body fees and annual audits.","A monthly management review to follow progress and remove obstacles."],
    next:"Next 30 days", nexts:["A detailed gap analysis for the first standard (the platform's self-assessment)","Form the team and launch awareness","Define the scope, sites and exclusions","Ask accredited certification bodies for proposals for your scope"], selfA:"Start the self-assessment",
    ims:"Integrate these systems into one integrated management system (IMS) to save time and cost.", imsGo:"IMS Builder",
    bar:{print:"Print / PDF", copy:"Copy the summary", rq:"Request a consultation for these", edit:"Change my answers", again:"Start again"},
    copied:"Summary copied", disc:"Guidance recommendations based on your answers, not a final decision. Check your customer's or tender's requirements, and choose a certification body accredited for your scope by your country's accreditation body.",
    sumH:"Certification recommendation report — Continual Improvement Academy", rqMsg:"Certification finder result:", reset:"Clear your answers and start again?",
    gA:"Advisor", gAT:"Find the tools that fit your organization", gAP:"14 questions, and the platform tools that fit you best with a starting plan.", gC:"Certification finder", gCT:"Find the ISO certificates that fit your organization", gCP:"15 questions, and a report for top management with the certificates, plan and timeline.",
    qs:{sectors:"Field",size:"Size",cust:"Customers",goal:"Goal",prod:"Activity",data:"Data",ai:"AI",ohs:"Safety",env:"Environment",energy:"Energy",bc:"Continuity",comp:"Compliance",assets:"Assets",mat:"Readiness",held:"Your certificates"},
    months:n=>n===1?"1 month":`${n} months`, certsN:n=>n===1?"1 certificate":`${n} certificates`, and:" and ", list:a=>a.length<2?a.join(""):a.slice(0,-1).join(", ")+" and "+a[a.length-1]}
};
const ctStd = k => CT_STDS.find(s => s.k === k);
const ctBlank = () => ({sectors:[], size:"", held:[], cust:[], goal:"", prod:[], data:"", ai:"", ohs:"", env:"", energy:"", bc:"", comp:"", assets:[], mat:"", org:""});
let CTS = {A:ctBlank(), step:-1, done:false};
try{ const s = JSON.parse(localStorage.getItem(CT_KEY) || "null");
  if(s && s.A){ const A = Object.assign(ctBlank(), s.A); if(!A.sectors.length && s.A.sector) A.sectors = [s.A.sector]; delete A.sector;
    CTS = {A, step:typeof s.step === "number" ? s.step : -1, done:!!s.done}; } }catch(e){}
const ctSave = () => { try{ localStorage.setItem(CT_KEY, JSON.stringify(CTS)); }catch(e){} };
const ctAnswered = q => { const v = CTS.A[q.q]; return q.t === "multi" ? Array.isArray(v) && v.length > 0 : !!v; };
const ctOpt = (q, v) => (CT_QS.find(x => x.q === q) || {opts:[]}).opts.find(o => o.v === v);
const ctLbl = (q, v) => { const o = ctOpt(q, v); return o ? o.l[L] : v; };
const ctCode = k => (ctStd(k) || {code:k}).code;

/* ---------- scoring ---------- */
function ctScore(A){
  const S = {}, R = {};
  const add = (k, p, q, v) => { if(!p) return; S[k] = (S[k] || 0) + p; if(p > 0) (R[k] = R[k] || []).push([p, q, v]); };
  /* up to three fields: the strongest field counts in full, the others add a third of their points */
  const per = {};
  A.sectors.forEach(sec => Object.entries(CT_SECTOR_PTS[sec] || {}).forEach(([k, p]) => (per[k] = per[k] || []).push([p, sec])));
  Object.entries(per).forEach(([k, list]) => { list.sort((a, b) => b[0] - a[0]); const p = list[0][0] + list.slice(1).reduce((t, x) => t + x[0] / 3, 0);
    S[k] = (S[k] || 0) + p; list.forEach(([pp, sec]) => (R[k] = R[k] || []).push([pp, "sectors", sec])); });
  CT_QS.forEach(q => {
    if(["sectors","size","held"].includes(q.q)) return;
    const vals = q.t === "multi" ? (A[q.q] || []) : [A[q.q]];
    vals.forEach(v => { const o = q.opts.find(x => x.v === v); if(o && o.pts) Object.entries(o.pts).forEach(([k, p]) => add(k, p, q.q, v)); });
  });
  Object.entries(CT_SIZE_PTS[A.size] || {}).forEach(([k, p]) => add(k, p, "size", A.size));
  if(A.held.includes("iso9001")) add("iso9004", 2, "held", "iso9001");
  if(A.held.filter(h => h !== "none").length) add("iso19011", 1, "held", A.held.find(h => h !== "none"));
  Object.keys(S).forEach(k => S[k] = Math.round(S[k] * 10) / 10);
  return {S, R};
}
const CT_COVERS = {iso22000:["iso22000","fssc22000","haccp"]};
/* the effort of a standard (1 light – 5 heavy), for the priority matrix and the timeline */
const CT_EFF = {iso9001:3,iso14001:2.5,iso45001:3,iso50001:3,iso27001:3.5,iso27701:3,iso20000:3.5,iso22301:3,iso37001:3,iso37301:3.5,iso42001:3.5,iso22000:3.5,fssc22000:4,haccp:2,
  iso13485:4.5,iso22716:3.5,iso15378:4,iatf16949:5,as9100:4.5,iso29001:4,iso3834:3,iso17025:4.5,iso15189:4.5,iso17020:4,iso17024:4.5,iso20387:4.5,iso7101:4,iso21001:3,iso29993:2.5,iso29994:2.5,
  iso55001:4,iso41001:3,iso39001:2.5,iso28000:3,iso18788:3,iso20121:2.5,iso46001:2.5,iso30401:3,iso56001:3.5,iso44001:3.5,iso19650:3.5,iso14064:2.5,iso14068:3,iso30301:3,iso30201:3.5,
  iso19770:3.5,iso18295:2.5,iso10012:3,iso16000:3,iso35001:3.5,iso31101:3.5,globalgap:3};
const ctEff = (k, A) => Math.min(5, (CT_EFF[k] || 3) + ({l:.25, xl:.5}[A.size] || 0));

function ctResult(A){
  const {S, R} = ctScore(A), held = new Set(A.held.filter(h => h !== "none").flatMap(h => CT_COVERS[h] || [h]));
  const ok = s => !CT_NEED[s.k] || CT_NEED[s.k](A);
  const rows = CT_STDS.filter(s => s.k !== "iso9001" && ok(s)).map(s => ({s, sc:S[s.k] || 0, why:(R[s.k] || []).sort((a, b) => b[0] - a[0])}));
  const certRows = rows.filter(r => ["cert","service","scheme","verify"].includes(r.s.kind) && !held.has(r.s.k)).sort((a, b) => b.sc - a.sc);
  const certs = certRows.filter(r => r.sc >= 3).slice(0, 6);
  const later = certRows.filter(r => r.sc >= 1.5 && !certs.includes(r)).slice(0, 4);
  const accr = rows.filter(r => r.s.kind === "accr" && r.sc >= 3 && !held.has(r.s.k)).sort((a, b) => b.sc - a.sc);
  let guides = rows.filter(r => ["guide","support"].includes(r.s.kind) && r.sc >= 1).sort((a, b) => b.sc - a.sc).slice(0, 3);
  if(guides.length === 3 && guides[2].sc < 1.5) guides = guides.slice(0, 2);
  ["iso19011","iso31000"].forEach(k => { if(guides.length < 2 && !guides.some(g => g.s.k === k)) guides.push(rows.find(r => r.s.k === k)); });
  const res = {A, S, held, certs, later, accr, guides:guides.filter(Boolean), base:held.has("iso9001") ? "have" : "need"};
  res.waves = ctWaves(res); res.plan = ctPlan(res); res.ready = ctReady(res); res.pack = ctPack(res);
  return res;
}

/* ---------- phases, timeline, readiness ---------- */
const CT_QMS_BASED = ["iatf16949","as9100","iso13485","iso29001","iso15378","iso22716","iso22000","fssc22000","haccp","iso7101","iso21001","iso29993","iso15189","iso17025"];
function ctWaves(res){
  const p1 = res.base === "need" ? ["iso9001"] : [], p2 = [], p3 = [];
  [...res.certs, ...res.accr].sort((a, b) => b.sc - a.sc).forEach(r => {
    const k = r.s.k;
    if(CT_QMS_BASED.includes(k) && r.sc >= 5 && p1.length < 3) p1.push(k);
    else if(r.sc >= 4.5 && p2.length < 3) p2.push(k); else p3.push(k);
  });
  if(!p1.length && p2.length) p1.push(p2.shift());
  if(!p1.length && p3.length) p1.push(p3.shift());
  return [p1, p2, p3];
}
function ctPlan(res){
  const A = res.A, base = {xs:3, s:4, m:5, l:6, xl:8}[A.size] || 5, mat = {none:2, part:0, mature:-1}[A.mat] || 0;
  const len = (ks, i) => { if(!ks.length) return 0; const heavy = Math.max(...ks.map(k => ctEff(k, A)));
    return Math.max(3, Math.min(15, Math.round(base + mat + .75 * (ks.length - 1) + Math.max(0, heavy - 3.5) * 1.5 - (i ? 1 : 0)))); };
  const out = []; let start = 1;
  res.waves.forEach((ks, i) => { const n = len(ks, i); if(!n) return;
    if(out.length){ const p = out[out.length - 1]; start = p.start + Math.max(2, Math.round(p.len * .6)); }
    out.push({i, ks, start, len:n, end:start + n - 1}); });
  const frac = [[0,.15],[.08,.3],[.2,.75],[.7,.86],[.84,1]];
  out.forEach(w => w.acts = frac.map(([a, b]) => { const s = w.start + Math.floor(a * w.len), e = Math.max(s, w.start + Math.ceil(b * w.len) - 1); return [s, Math.min(e, w.end)]; }));
  return {waves:out, first:out.length ? out[0].len : 0, total:out.length ? Math.max(...out.map(w => w.end)) : 0};
}
const CT_LVL = {high:90, med:60, low:25};
function ctReady(res){
  const A = res.A, heldAll = A.held.filter(h => h !== "none"), mat = {none:20, part:45, mature:65}[A.mat] || 30, culture = heldAll.length ? 5 : 0;
  const lv = v => CT_LVL[v] || 25, sectorNeed = [...res.certs, ...res.accr].some(r => CT_QMS_BASED.includes(r.s.k) && r.s.k !== "iso9001") ? 85 : 30;
  const D = [
    ["q", 80, ["iso9001"]], ["ohs", lv(A.ohs), ["iso45001"]], ["env", Math.max(lv(A.env), lv(A.energy)), ["iso14001","iso50001"]],
    ["info", Math.max(lv(A.data), {dev:85, use:60}[A.ai] || 15), ["iso27001"]], ["gov", Math.max(lv(A.comp), A.cust.includes("gov") ? 60 : 0), []],
    ["bc", lv(A.bc), ["iso22301"]], ["sec", sectorNeed, ["iso22000","iso13485","iatf16949"]]
  ].map(([k, need, hk]) => { const h = hk.filter(x => heldAll.includes(x)); return {k, need, have:h.length ? 85 : Math.min(80, mat + culture), held:h}; });
  const overall = Math.round(D.reduce((t, d) => t + d.have * d.need, 0) / D.reduce((t, d) => t + d.need, 0));
  /* strengths and improvement opportunities, from the answers */
  const t = CT_T[L], st = [], op = [], recFor = {q:"iso9001", ohs:"iso45001", env:"iso14001", info:"iso27001", gov:"iso37001", bc:"iso22301"};
  const recOk = k => k && (k === "iso9001" ? res.base === "need" : [...res.certs].some(r => r.s.k === k));
  D.forEach(d => { if(d.held.length) st.push(t.stH(t.dims[d.k], d.held.map(ctCode).join(L === "ar" ? "، " : ", "))); });
  if(A.mat === "mature") st.push(t.stMat); else if(A.mat === "part") st.push(t.stPart);
  if(A.goal) st.push(t.stGoal(ctLbl("goal", A.goal)));
  if(A.cust.includes("intl")) st.push(t.stIntl);
  D.filter(d => d.need <= 25 && d.k !== "q").slice(0, 2).forEach(d => st.push(t.stLow(t.dims[d.k])));
  D.map(d => ({d, gap:d.need - d.have})).filter(x => x.gap >= 25).sort((a, b) => b.gap - a.gap).forEach(({d}) => {
    let c = recOk(recFor[d.k]) ? ctCode(recFor[d.k]) : "";
    if(d.k === "sec"){ const r = [...res.certs, ...res.accr].find(r => CT_QMS_BASED.includes(r.s.k)); c = r ? r.s.code : ""; }
    if(d.k === "env" && !c){ const r = res.certs.find(r => ["iso14001","iso50001"].includes(r.s.k)); c = r ? r.s.code : ""; }
    if(d.k === "gov" && !c){ const r = res.certs.find(r => ["iso37001","iso37301"].includes(r.s.k)); c = r ? r.s.code : ""; }
    op.push({k:d.k, txt:t.opH(t.dims[d.k], c)}); });
  if(A.mat === "none") op.push({k:"mat", txt:t.opMat});
  /* no large gap: show the smaller ones, or say the plan is about extending */
  if(!op.length) D.map(d => ({d, gap:d.need - d.have})).filter(x => x.gap >= 8).sort((a, b) => b.gap - a.gap).slice(0, 3).forEach(({d}) => op.push({k:d.k, txt:t.opS(t.dims[d.k])}));
  if(!op.length) op.push({k:"ext", txt:t.opNone});
  return {D, overall, st:st.slice(0, 5), op:op.slice(0, 5)};
}
function ctPack(res){
  /* the package for the organization's fields (a general one otherwise) that shares the most components, beyond ISO 9001, with the result */
  const A = res.A, inRec = new Set(["iso9001", ...res.certs.map(r => r.s.k), ...res.accr.map(r => r.s.k)]);
  const has = k => inRec.has(k) || res.held.has(k);
  let best = null, bestN = 0;
  CT_PACKS.filter(p => !p.sec || p.sec.some(x => A.sectors.includes(x))).filter(p => !p.big || ["l","xl"].includes(A.size)).forEach(p => {
    const n = p.ks.filter(k => k !== "iso9001" && has(k)).length + (p.sec ? .5 : 0);
    if(n > bestN){ best = p; bestN = n; } });
  if(!best || bestN < 1) best = CT_PACKS[0];
  return {p:best, inRec, held:res.held};
}
/* ---------- view ---------- */
function ctRender(){
  const box = $("ctBody"); if(!box) return;
  const t = CT_T[L];
  $("ctK").textContent = t.k; $("ctTitle").textContent = t.t; $("ctSub").textContent = t.s;
  ctGuides();
  if(CTS.done && CT_QS.every(ctAnswered)) return ctReport(box);
  if(CTS.step < 0) return ctIntro(box);
  ctQuestion(box);
}
function ctIntro(box){
  const t = CT_T[L], begun = CT_QS.some(ctAnswered);
  box.innerHTML = `<div class="adv-card ct-intro"><div><h3>${esc(t.introT)}</h3><ul>${t.intro.map(x => `<li>${esc(x)}</li>`).join("")}</ul></div>
    <div class="ct-introacts"><button type="button" class="btn primary" id="ctGo">${esc(begun ? t.resume : t.start)} ${ARROW}</button>${begun ? `<button type="button" class="btn" id="ctNew">${esc(t.restart)}</button>` : ""}</div></div>`;
  $("ctGo").onclick = () => { CTS.step = begun ? Math.max(0, CT_QS.findIndex(q => !ctAnswered(q))) : 0; ctSave(); ctRender(); ctFocus(); };
  if(begun) $("ctNew").onclick = ctReset;
}
function ctQuestion(box){
  const t = CT_T[L], n = CT_QS.length, i = Math.min(CTS.step, n - 1), q = CT_QS[i], v = CTS.A[q.q];
  const sel = o => q.t === "multi" ? (v || []).includes(o.v) : v === o.v;
  const full = q.max && (v || []).length >= q.max;
  const hint = [q.h ? q.h[L] : "", q.t === "multi" && !q.max ? t.multi : ""].filter(Boolean).join(" · ");
  box.innerHTML = `<div class="adv-card ct-q">
    <div class="adv-prog"><div class="bar"><i style="width:${Math.round((i / n) * 100)}%"></i></div><span>${esc(t.of(i + 1, n))}</span></div>
    <div class="adv-q"><span class="ct-grp">${esc(CT_GROUPS[q.grp][L])}</span><h3 id="ctQh" tabindex="-1">${esc(q.l[L])}</h3>${hint ? `<p class="hint">${esc(hint)}${q.max ? ` <b class="ct-cnt">${(v || []).length} / ${q.max}</b>` : ""}</p>` : ""}
      <div class="adv-opts${q.grid ? " ct-grid" : ""}" role="group" aria-labelledby="ctQh">${q.opts.map(o => { const on = sel(o);
        return `<button type="button" class="adv-opt${q.t === "multi" ? " multi" : ""}" aria-pressed="${on}" data-v="${esc(o.v)}" ${full && !on ? "disabled" : ""}><span class="mk" aria-hidden="true"></span><span>${esc(o.l[L])}</span>${q.max && on ? `<em class="ct-ord">${(v || []).indexOf(o.v) + 1}</em>` : ""}</button>`; }).join("")}</div></div>
    <div class="adv-nav"><button type="button" class="btn" id="ctBack">${esc(t.back)}</button><span class="sp"></span><button type="button" class="btn primary" id="ctNext" ${ctAnswered(q) ? "" : "disabled"}>${esc(i === n - 1 ? t.show : t.next)} ${ARROW}</button></div></div>`;
  box.querySelectorAll(".adv-opt").forEach(b => b.onclick = () => {
    const val = b.dataset.v;
    if(q.t === "multi"){
      let a = (CTS.A[q.q] || []).slice();
      if(val === q.none) a = a.includes(val) ? [] : [val];
      else { a = a.filter(x => x !== q.none); a = a.includes(val) ? a.filter(x => x !== val) : (q.max && a.length >= q.max ? a : [...a, val]); }
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

/* ---------- the report ---------- */
function ctWhy(r){
  const t = CT_T[L], seen = new Set();
  return r.why.filter(([, q, v]) => { const k = q + v; if(seen.has(k)) return false; seen.add(k); return true; }).slice(0, 3)
    .map(([, q, v]) => `<li>${esc(t.qs[q] || q)}: ${esc(q === "held" ? ctCode(v) : ctLbl(q, v))}</li>`).join("");
}
function ctToolLink(s){
  const t = CT_T[L];
  return s.tool && URLS[s.tool] ? `<a class="btn" href="${URLS[s.tool]}" data-mod="${s.tool}" data-modname="${esc(s.code)}">${esc(t.inPlat)}</a>` : `<span class="ct-out">${esc(t.outPlat)}</span>`;
}
const ctWaveOf = (res, k) => { const w = res.plan.waves.find(w => w.ks.includes(k)); return w ? w.i + 1 : 0; };
function ctCard(r, i, res){
  const t = CT_T[L], s = r.s, pr = r.sc >= 5.5 ? "high" : "rec", w = ctWaveOf(res, s.k);
  return `<article class="ar ct-ar" style="--c:${pr === "high" ? "var(--gold)" : "var(--c-iso)"}"><span class="rk">${i + 1}</span>
    <div><h4>${esc(s.n[L])} <span class="cd">${esc(s.code)}</span></h4><span class="ct-kind">${esc(t.kind[s.kind])}${w ? ` · ${esc(t.wave(w))}` : ""}</span></div>
    <div class="fit"><b class="ct-pr ${pr}">${esc(pr === "high" ? t.high : t.rec)}</b><i aria-hidden="true"><em style="width:${Math.min(100, Math.round(r.sc / 8 * 100))}%"></em></i><small>${esc(t.fit)}</small></div>
    <p class="why">${esc(s.d[L])}${s.note ? ` <span class="ct-note">${esc(s.note[L])}</span>` : ""}</p>
    ${r.why.length ? `<ul aria-label="${esc(t.why)}">${ctWhy(r)}</ul>` : ""}
    <div class="acts">${ctToolLink(s)}</div></article>`;
}
function ctOrg(){
  try{ if(typeof CIAORG !== "undefined" && CIAORG.has()){ const n = CIAORG.name(L); if(n) return {name:n, logo:CIAORG.logo() || "", prof:true}; } }catch(e){}
  return {name:CTS.A.org || "", logo:"", prof:false};
}
function ctReport(box){
  const t = CT_T[L], A = CTS.A, res = ctResult(A), s9 = ctStd("iso9001"), org = ctOrg(), P = res.plan, Rd = res.ready;
  const sectors = A.sectors.map(v => ctLbl("sectors", v));
  const heldList = A.held.filter(h => h !== "none");
  const nRec = (res.base === "need" ? 1 : 0) + res.certs.length + res.accr.length;
  const w1 = P.waves[0] ? t.list(P.waves[0].ks.map(ctCode)) : "", w2 = P.waves[1] ? t.list(P.waves[1].ks.map(ctCode)) : "";
  const gaps = Rd.op.filter(o => o.k !== "mat").slice(0, 2).map(o => t.dims[o.k]);
  const date = new Date().toLocaleDateString(L === "ar" ? "ar-EG-u-nu-latn" : "en-GB", {day:"numeric", month:"long", year:"numeric"});
  const team = {xs:"2–3", s:"3–4", m:"4–6", l:"6–8", xl:"8–12"}[A.size] || "4–6";
  const sec = (no, title, body, cls) => `<section class="ct-sec ct-rs${cls ? " " + cls : ""}"><h3><span class="ct-no">${no}</span>${esc(title)}</h3>${body}</section>`;

  const cover = `<header class="ct-cover"><div class="ct-cv-top">${org.logo ? `<img src="${esc(org.logo)}" alt="" class="ct-cv-logo">` : `<span class="ct-cv-mark" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="9" r="6"/><path d="m9 14.5-1.5 7L12 19l4.5 2.5-1.5-7"/><path d="m9.5 9 1.8 1.8L15 7.5"/></svg></span>`}
      <div><span class="ct-cv-k">${esc(t.repS)}</span><h3 id="ctResH" tabindex="-1">${esc(t.repT)}</h3>
      ${org.prof ? `<b class="ct-cv-org">${esc(org.name)}</b>` : `<label class="ct-cv-in"><span class="sr">${esc(t.orgL)}</span><input id="ctOrg" value="${esc(org.name)}" placeholder="${esc(t.orgPh)}" maxlength="120"></label>`}</div></div>
    <dl class="ct-cv-meta"><div><dt>${esc(t.fields)}</dt><dd>${esc(sectors.join(L === "ar" ? "، " : ", "))}</dd></div><div><dt>${esc(t.sizeL)}</dt><dd>${esc(ctLbl("size", A.size))}</dd></div>${heldList.length ? `<div><dt>${esc(t.have)}</dt><dd dir="ltr">${esc(heldList.map(ctCode).join(", "))}</dd></div>` : ""}<div><dt>${esc(t.date)}</dt><dd>${esc(date)}</dd></div><div><dt>${esc(t.by)}</dt><dd>${esc(t.byV)}</dd></div></dl>
    <div class="ct-acts ct-bar"><button type="button" class="btn" id="ctPrint">${esc(t.bar.print)}</button><button type="button" class="btn" id="ctCopy">${esc(t.bar.copy)}</button><button type="button" class="btn gold" id="ctRq">${esc(t.bar.rq)}</button></div></header>`;

  const kpis = `<div class="ct-kpis"><div><b>${nRec}</b><span>${esc(t.kpi.n)}</span></div><div><b>${esc(t.months(P.first))}</b><span>${esc(t.kpi.first)}</span></div><div><b>${esc(t.months(P.total))}</b><span>${esc(t.kpi.total)}</span></div><div class="ct-kg">${ctGauge(Rd.overall)}<span>${esc(t.kpi.ready)}</span></div></div>`;
  const s1 = sec(1, t.s1, `${kpis}<p class="ct-lead">${esc(t.sum(org.name || t.yourOrg, w1, t.months(P.first), w2, t.certsN(nRec), t.months(P.total), Rd.overall, t.list(gaps)))}</p>`);

  const s2 = sec(2, t.s2, `<div class="ct-two"><figure class="ct-fig">${ctRadar(Rd.D)}<figcaption><i class="ct-lg need"></i>${esc(t.need)} <i class="ct-lg have"></i>${esc(t.readyS)}</figcaption></figure>
    <div class="ct-so"><div class="ct-so-b st"><h4>${esc(t.strengths)}</h4><ul>${Rd.st.map(x => `<li>${esc(x)}</li>`).join("")}</ul></div>
    <div class="ct-so-b op"><h4>${esc(t.opps)}</h4><ul>${Rd.op.map(x => `<li>${esc(x.txt)}</li>`).join("")}</ul></div></div></div>`);

  const base = res.base === "have"
    ? `<div class="ct-base have"><span class="ct-badge">${esc(t.base)}</span><div><h4>${esc(t.baseHave)} ✓</h4><p>${esc(t.baseHaveP)}</p></div><a class="btn" href="${URLS.ims}" data-mod="ims" data-modname="${esc(t.imsGo)}">${esc(t.imsGo)}</a></div>`
    : `<div class="ct-base"><span class="ct-badge">${esc(t.base)}</span><div><h4>${esc(s9.n[L])} <span class="cd">${esc(s9.code)}</span></h4><p>${esc(s9.d[L])}</p></div>${ctToolLink(s9)}</div>`;
  const pack = res.pack ? `<div class="ct-pack"><span class="ct-pack-k">${esc(t.pack)}</span><b>${esc(res.pack.p.n[L])}</b><div class="ct-pack-ks">${res.pack.p.ks.map(k => { const inr = res.pack.inRec.has(k), h = res.pack.held.has(k);
      return `<span class="${h ? "h" : inr ? "in" : ""}" title="${esc(h ? t.packHave : inr ? t.packIn : "")}">${h || inr ? "✓ " : ""}${esc(ctCode(k))}</span>`; }).join("")}</div><p>${esc(res.pack.p.v[L])}</p></div>` : "";
  const mxRows = [...(res.base === "need" ? [{s:s9, sc:6}] : []), ...res.certs, ...res.accr];
  const s3 = sec(3, t.s3, `${base}${res.certs.length ? `<h4 class="ct-h4">${esc(t.certs)}</h4><div class="adv-top">${res.certs.map((r, i) => ctCard(r, i, res)).join("")}</div>` : ""}
    <div class="ct-two ct-mxw">${mxRows.length > 1 ? `<figure class="ct-fig"><h4 class="ct-h4">${esc(t.mx)}</h4>${ctMatrix(mxRows, A)}</figure>` : ""}${pack}</div>`);

  const later = res.later.length ? `<h4 class="ct-h4">${esc(t.later)}</h4><div class="ct-chips">${res.later.map(r => `<span title="${esc(r.s.d[L])}"><b>${esc(r.s.code)}</b> ${esc(r.s.n[L])}</span>`).join("")}</div>` : "";
  const accr = res.accr.length ? `<h4 class="ct-h4">${esc(t.accr)}</h4><p class="ct-secp">${esc(t.accrP)}</p><div class="adv-top">${res.accr.map((r, i) => ctCard(r, i, res)).join("")}</div>` : "";
  const guides = `<h4 class="ct-h4">${esc(t.guides)}</h4><p class="ct-secp">${esc(t.guidesP)}</p><div class="ct-guides">${res.guides.map(r => `<article><span class="ct-kind">${esc(t.kind[r.s.kind])}</span><h4>${esc(r.s.n[L])} <span class="cd">${esc(r.s.code)}</span></h4><p>${esc(r.s.d[L])}</p>${r.s.tool && URLS[r.s.tool] ? `<a href="${URLS[r.s.tool]}" data-mod="${r.s.tool}" data-modname="${esc(r.s.code)}">${esc(t.inPlat)} ${ARROW}</a>` : ""}</article>`).join("")}</div>`;
  const s4 = sec(4, t.s4, accr + guides + later);

  const trio = ["iso9001","iso14001","iso45001"].filter(k => res.held.has(k) || (k === "iso9001" ? res.base === "need" : res.certs.some(r => r.s.k === k)));
  const phases = `<div class="adv-stages">${P.waves.map(w => `<div class="adv-stage"><span class="d">${esc(t.month)} ${w.start}–${w.end}</span><h4>${w.i + 1}. ${esc(t.p[w.i])}</h4><ul>${w.ks.map(k => `<li><b dir="ltr">${esc(ctCode(k))}</b> — ${esc(ctStd(k).n[L])}</li>`).join("")}</ul><p class="out">${esc(t.phaseOut[w.i])}</p></div>`).join("")}</div>`;
  const s5 = sec(5, t.s5, `${trio.length >= 2 ? `<div class="adv-start"><b>IMS</b><span>${esc(t.ims)}</span><a class="btn" href="${URLS.ims}" data-mod="ims" data-modname="${esc(t.imsGo)}">${esc(t.imsGo)}</a></div>` : ""}
    ${ctGantt(P)}${phases}<p class="ct-est">${esc(t.ganttNote)}</p><p class="ct-cycle">${esc(t.cycle)}</p>`, "ct-pb");

  const s6 = sec(6, t.s6, ctTraining(res));
  const s7 = sec(7, t.s7, ctObstacles(res));
  const first = P.waves[0] ? P.waves[0].ks[0] : "iso9001", firstTool = (ctStd(first) || {}).tool;
  const s8 = sec(8, t.s8, `<div class="ct-dec"><p>${esc(t.dec)}</p><ol>${t.decs(w1, t.months(P.first), team).map(x => `<li>${esc(x)}</li>`).join("")}</ol></div>
    <div class="ct-next"><h4>${esc(t.next)}</h4><ol>${t.nexts.map(x => `<li>${esc(x)}</li>`).join("")}</ol>${firstTool && URLS[firstTool] ? `<a class="btn primary" href="${URLS[firstTool]}" data-mod="${firstTool}" data-modname="${esc(ctCode(first))}">${esc(t.selfA)}: ${esc(ctCode(first))}</a>` : ""}</div>`, "ct-pb");
  const s9b = sec(9, t.s9, `<ol class="ct-checks">${CT_CHECKS.map(c => `<li><b>${esc(c[L][0])}</b><span>${esc(c[L][1])}</span></li>`).join("")}</ol>`);

  box.innerHTML = `<div class="ct-res ct-report">${cover}${s1}${s2}${s3}${s4}${s5}${s6}${s7}${s8}${s9b}
    <p class="adv-note">${esc(t.disc)}</p>
    <div class="adv-nav ct-acts"><button type="button" class="btn" id="ctEdit">${esc(t.bar.edit)}</button><span class="sp"></span><button type="button" class="btn" id="ctAgain">${esc(t.bar.again)}</button></div></div>`;
  ctSend(res);
  const oi = $("ctOrg"); if(oi) oi.onchange = () => { CTS.A.org = oi.value.trim(); ctSave(); ctRender(); };
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

/* a short copy of the report goes to the academy's dashboard (when accounts are on), once per set of answers */
function ctSend(res){
  if(typeof cloudFinder !== "function") return;
  const A = res.A, P = res.plan, row = {sectors:A.sectors, sector_names:A.sectors.map(v => (ctOpt("sectors", v) || {l:{ar:v}}).l.ar).join("، "), size:A.size,
    held:A.held.filter(h => h !== "none"), goal:A.goal, recs:[...(res.base === "need" ? ["ISO 9001"] : []), ...res.certs.map(r => r.s.code)], accr:res.accr.map(r => r.s.code),
    ready:res.ready.overall, months_first:P.first, months_total:P.total, org:(A.org || "").slice(0, 120) || null, lang:L};
  const key = JSON.stringify([row.sectors, row.size, row.held, row.goal, row.recs, row.accr, A.prod, A.mat]);
  let h = 0; for(let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) | 0;
  row.h = String(h >>> 0);
  try{ if(localStorage.getItem("cia-cloud:finder-sent") === row.h) return; }catch(e){}
  cloudFinder(row).then(ok => { if(ok) try{ localStorage.setItem("cia-cloud:finder-sent", row.h); }catch(e){} });
}

/* ---------- charts (inline SVG, readable in print) ---------- */
function ctGauge(v){
  const r = 34, c = 2 * Math.PI * r, col = v >= 60 ? "var(--live)" : v >= 35 ? "var(--gold)" : "#C2410C";
  return `<svg class="ct-gauge" viewBox="0 0 90 90" role="img" aria-label="${v}%"><circle cx="45" cy="45" r="${r}" fill="none" stroke="var(--line)" stroke-width="9"/><circle cx="45" cy="45" r="${r}" fill="none" stroke="${col}" stroke-width="9" stroke-linecap="round" stroke-dasharray="${(v / 100 * c).toFixed(1)} ${c.toFixed(1)}" transform="rotate(-90 45 45)"/><text x="45" y="51" text-anchor="middle" font-size="19" font-weight="800" fill="var(--ink)" direction="ltr">${v}%</text></svg>`;
}
function ctRadar(D){
  const t = CT_T[L], W = 600, H = 380, cx = W / 2, cy = H / 2 + 4, R = 125, n = D.length;
  const pt = (i, v) => { const a = -Math.PI / 2 + i * 2 * Math.PI / n; return [cx + Math.cos(a) * R * v / 100, cy + Math.sin(a) * R * v / 100]; };
  const poly = key => D.map((d, i) => pt(i, d[key]).map(x => x.toFixed(1)).join(",")).join(" ");
  const rings = [25, 50, 75, 100].map(v => `<polygon points="${D.map((d, i) => pt(i, v).map(x => x.toFixed(1)).join(",")).join(" ")}" fill="none" stroke="var(--line)"/>`).join("");
  const axes = D.map((d, i) => { const [x, y] = pt(i, 100); return `<line x1="${cx}" y1="${cy}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}" stroke="var(--line)"/>`; }).join("");
  const labels = D.map((d, i) => { const [x, y] = pt(i, 118), anc = Math.abs(x - cx) < 8 ? "middle" : x > cx ? "start" : "end";
    return `<text x="${x.toFixed(1)}" y="${(y + 4).toFixed(1)}" text-anchor="${anc}" font-size="12.5" fill="var(--ink-soft)">${esc(t.dims[d.k])}</text>`; }).join("");
  return `<svg class="ct-radar" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(t.s2)}" direction="ltr">${rings}${axes}
    <polygon points="${poly("need")}" fill="rgba(194,65,12,.10)" stroke="#C2410C" stroke-width="2" stroke-dasharray="5 4"/>
    <polygon points="${poly("have")}" fill="color-mix(in srgb,var(--c-iso) 22%,transparent)" stroke="var(--c-iso)" stroke-width="2.4"/>${labels}</svg>`;
}
function ctMatrix(rows, A){
  const t = CT_T[L], W = 420, H = 320, pad = {l:44, r:16, t:16, b:40}, iw = W - pad.l - pad.r, ih = H - pad.t - pad.b;
  const scs = rows.map(r => r.sc), lo = Math.min(...scs), hi = Math.max(...scs), span = Math.max(1.5, hi - lo);
  /* impact is shown relative to this result: the best fit sits high, the weakest low */
  const X = e => pad.l + 12 + Math.max(0, Math.min(1, (e - 2) / 3)) * (iw - 24), Y = s => pad.t + 26 + (1 - Math.max(0, Math.min(1, (s - lo) / span))) * (ih - 52);
  const q = [[pad.l + iw / 2, pad.t, t.mxQ[0]], [pad.l, pad.t, t.mxQ[1]], [pad.l, pad.t + ih / 2, t.mxQ[2]], [pad.l + iw / 2, pad.t + ih / 2, t.mxQ[3]]];
  const fills = ["rgba(184,144,30,.10)", "rgba(47,138,85,.10)", "rgba(122,134,158,.08)", "rgba(122,134,158,.05)"];
  const quads = q.map(([x, y, l], i) => `<rect x="${x}" y="${y}" width="${iw / 2}" height="${ih / 2}" fill="${fills[i]}"/><text x="${x + iw / 4}" y="${i < 2 ? y + 16 : y + ih / 2 - 8}" text-anchor="middle" font-size="11.5" font-weight="700" fill="var(--muted)">${esc(l)}</text>`).join("");
  const placed = [];
  const dots = rows.map(r => { let x = X(ctEff(r.s.k, A)), y = Y(r.sc);
    while(placed.some(([px, py]) => Math.abs(px - x) < 64 && Math.abs(py - y) < 15)) y += 16; placed.push([x, y]);
    const k = r.s.k === "iso9001" || r.sc >= 5.5;
    return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${k ? 7 : 5.5}" fill="${k ? "var(--gold)" : "var(--c-iso)"}" stroke="#fff" stroke-width="1.5"/><text x="${(x + 10).toFixed(1)}" y="${(y + 4).toFixed(1)}" font-size="11" font-weight="700" fill="var(--ink)">${esc(r.s.code.replace("ISO/IEC ", "").replace("ISO ", ""))}</text>`; }).join("");
  return `<svg class="ct-mx" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(t.mx)}" direction="ltr">${quads}
    <rect x="${pad.l}" y="${pad.t}" width="${iw}" height="${ih}" fill="none" stroke="var(--line)"/>
    <text x="${pad.l + iw / 2}" y="${H - 8}" text-anchor="middle" font-size="12" fill="var(--ink-soft)">${esc(t.mxX)} →</text>
    <text x="14" y="${pad.t + ih / 2}" text-anchor="middle" font-size="12" fill="var(--ink-soft)" transform="rotate(-90 14 ${pad.t + ih / 2})">${esc(t.mxY)} →</text>${dots}</svg>`;
}
function ctGantt(P){
  const t = CT_T[L], T = Math.max(6, P.total), cols = `minmax(150px,210px) repeat(${T},minmax(16px,1fr))`;
  const head = `<div class="ct-g-l ct-g-h"></div>${Array.from({length:T}, (_, i) => `<div class="ct-g-m">${i + 1}</div>`).join("")}`;
  const cell = (s, e, cls, lbl) => `<div class="ct-g-bar ${cls}" style="grid-column:${s + 1} / ${e + 2}" title="${esc(lbl)}"></div>`;
  const rows = P.waves.map(w => `<div class="ct-g-l ct-g-w">${esc(t.wave(w.i + 1))}: ${esc(t.p[w.i])}<small dir="ltr">${esc(w.ks.map(ctCode).join(" · "))}</small></div>${cell(w.start, w.end, "w" + w.i, t.p[w.i])}
    ${w.acts.map(([s, e], j) => `<div class="ct-g-l">${esc(t.acts[j])}</div>${cell(s, e, "a w" + w.i, t.acts[j])}${j === 4 ? `<div class="ct-g-ms" style="grid-column:${e + 1} / ${e + 2}" title="${esc(t.cert)}">◆</div>` : ""}`).join("")}`).join("");
  return `<div class="ct-gwrap" role="img" aria-label="${esc(t.s5)}"><div class="ct-gantt" style="grid-template-columns:${cols}">${head}${rows}</div><p class="ct-g-cap">${esc(t.month)} → · ◆ ${esc(t.cert)}</p></div>`;
}

/* ---------- training plan and obstacles ---------- */
const CT_TRAIN = {
  iso22000:{ar:"سلامة الغذاء وHACCP وبرامج المتطلبات الأساسية",en:"Food safety, HACCP and prerequisite programmes"}, fssc22000:{ar:"متطلبات مخطط FSSC 22000 الإضافية",en:"FSSC 22000 additional requirements"},
  iso45001:{ar:"تقييم المخاطر المهنية والتحقيق في الحوادث",en:"Occupational risk assessment and incident investigation"}, iso14001:{ar:"تحديد الجوانب البيئية والالتزامات",en:"Environmental aspects and compliance obligations"},
  iso27001:{ar:"تقييم مخاطر أمن المعلومات وتوعية العاملين",en:"Information security risk assessment and staff awareness"}, iso27701:{ar:"حماية البيانات الشخصية وحقوق أصحابها",en:"Personal data protection and data subject rights"},
  iso50001:{ar:"إدارة الطاقة وخط الأساس ومؤشرات الأداء",en:"Energy management, baseline and performance indicators"}, iso22301:{ar:"تحليل أثر الأعمال وتمارين الاستمرارية",en:"Business impact analysis and continuity exercises"},
  iso37001:{ar:"العناية الواجبة ومكافحة الرشوة",en:"Due diligence and anti-bribery"}, iso37301:{ar:"سجل الالتزامات وضوابط الامتثال",en:"Obligations register and compliance controls"},
  iatf16949:{ar:"الأدوات الأساسية لقطاع السيارات (APQP وPPAP وFMEA وMSA وSPC)",en:"Automotive core tools (APQP, PPAP, FMEA, MSA, SPC)"}, as9100:{ar:"متطلبات الطيران: إدارة التهيئة وسلامة المنتج",en:"Aviation requirements: configuration management and product safety"},
  iso13485:{ar:"إدارة مخاطر الأجهزة الطبية (ISO 14971) والمتطلبات النظامية",en:"Medical device risk management (ISO 14971) and regulatory requirements"}, iso7101:{ar:"جودة الرعاية وسلامة المرضى ومؤشرات الأداء السريري",en:"Care quality, patient safety and clinical indicators"},
  iso15189:{ar:"عدم اليقين في القياس والتحقق من طرق الفحص",en:"Measurement uncertainty and method verification"}, iso17025:{ar:"عدم اليقين في القياس والتحقق من الطرق",en:"Measurement uncertainty and method validation"},
  iso21001:{ar:"تصميم البرامج التدريبية وقياس أثرها",en:"Designing training programmes and measuring their impact"}, iso29993:{ar:"تقييم احتياجات المتعلمين وجودة خدمات التدريب",en:"Learner needs analysis and quality of training services"},
  iso17024:{ar:"بناء مخطط شهادات الأشخاص وإعداد الاختبارات",en:"Building a personnel certification scheme and exams"}, iso42001:{ar:"حوكمة الذكاء الاصطناعي وتقييم الأثر",en:"AI governance and impact assessment"},
  iso55001:{ar:"إدارة الأصول وتخطيط الصيانة",en:"Asset management and maintenance planning"}, iso39001:{ar:"السلامة المرورية وإدارة الأسطول",en:"Road safety and fleet management"},
  iso35001:{ar:"تقييم المخاطر البيولوجية والسلامة الحيوية",en:"Biorisk assessment and biosafety"}, iso20000:{ar:"إدارة خدمات تقنية المعلومات ومستويات الخدمة",en:"IT service management and service levels"}
};
function ctTraining(res){
  const t = CT_T[L], A = res.A, P = res.plan, w1 = P.waves[0] ? P.waves[0].ks : ["iso9001"];
  const all = [...new Set([...P.waves.flatMap(w => w.ks)])], aud = {xs:"1–2", s:"2–3", m:"3–5", l:"5–8", xl:"8–12"}[A.size] || "3–5";
  const rows = [[t.trTop, t.trTopC, t.d.half, t.everyone], [t.trAll, t.trAllC, t.d.hrs, t.everyone],
    [t.trImp, t.trImpC(t.list(w1.map(ctCode))), t.d.d35, "1–2"], [t.trAud, t.trAudC(t.list(all.slice(0, 4).map(ctCode))), t.d.d23, aud]];
  if(["l","xl"].includes(A.size)) rows.push([t.trLead, t.trLeadC, t.d.d5, "1–2"]);
  all.filter(k => CT_TRAIN[k]).slice(0, 5).forEach(k => rows.push([t.trSp, CT_TRAIN[k][L], t.d.d12, "—"]));
  return `<div class="tw ct-tw"><table class="ct-table"><thead><tr>${t.trH.map(h => `<th>${esc(h)}</th>`).join("")}</tr></thead><tbody>${rows.map(r => `<tr>${r.map((c, i) => `<td${i === 3 ? ' dir="ltr"' : ""}>${esc(c)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
}
const CT_OBS = [
  {w:A => true, lv:"h", ar:["انشغال الفريق بالتشغيل اليومي","عيّنوا منسقاً بوقت مخصص، وساعات أسبوعية ثابتة للمشروع، ومتابعة شهرية من الإدارة."], en:["The team is busy with day-to-day operations","Assign a coordinator with protected time, fixed weekly hours and a monthly management review."]},
  {w:A => A.mat === "none", lv:"h", ar:["غياب التوثيق والإجراءات","ابدأوا بخريطة العمليات والسياسات الأساسية، واستخدموا نماذج المنصة الجاهزة."], en:["No documentation or procedures","Start with the process map and core policies, using the platform's ready templates."]},
  {w:A => ["xs","s"].includes(A.size), lv:"h", ar:["محدودية الموارد والميزانية","التطبيق على مراحل، ونظام متكامل واحد، والاستفادة من أدوات المنصة."], en:["Limited resources and budget","Phase the work, use one integrated system and the platform's tools."]},
  {w:A => ["l","xl"].includes(A.size) || A.sectors.length >= 2, lv:"m", ar:["تعدد المواقع والأنشطة يعقّد النطاق","حددوا النطاق بدقة، وابدأوا بموقع أو نشاط تجريبي ثم عمّموا."], en:["Several sites and activities complicate the scope","Define the scope precisely, pilot one site or activity, then roll out."]},
  {w:(A, res) => res.certs.length >= 4, lv:"m", ar:["تزامن أكثر من نظام في وقت واحد","نظام متكامل واحد بسياسة وتدقيق داخلي ومراجعة إدارة مشتركة."], en:["Several systems at once","One integrated system with a shared policy, internal audit and management review."]},
  {w:(A, res) => [...res.certs, ...res.accr].some(r => r.s.note && /محدود|limited|تحقق من|check/i.test(r.s.note[L])), lv:"m", ar:["قلة جهات الإشهاد المعتمدة لبعض المواصفات","تحققوا مبكراً من جهة إشهاد معتمدة لنطاقكم قبل بدء التطبيق."], en:["Few accredited certification bodies for some standards","Confirm an accredited certification body for your scope before you start."]},
  {w:A => A.sectors.some(s => ["hlth","med","pharma","lab","food"].includes(s)) || A.prod.some(p => ["med","mlab","food","cos","pack"].includes(p)), lv:"h", ar:["متطلبات رقابية إضافية (مثل SFDA أو CBAHI أو البلدية)","اربطوا الخطة بمتطلبات الجهة الرقابية من البداية، ولا تخلطوا بين الترخيص والشهادة."], en:["Extra regulatory requirements (such as SFDA, CBAHI or the municipality)","Tie the plan to the regulator's requirements from the start; do not confuse licensing with certification."]},
  {w:A => A.data === "high", lv:"m", ar:["ضعف ضوابط أمن المعلومات الحالية","ابدأوا بتقييم مخاطر سريع وضوابط أساسية (الصلاحيات والنسخ الاحتياطي والتوعية)."], en:["Weak information security controls today","Start with a quick risk assessment and basic controls (access, backups, awareness)."]},
  {w:A => A.ohs === "high", lv:"m", ar:["ثقافة السلامة ومقاومة التغيير في الميدان","أشركوا العاملين، واعتمدوا مؤشرات قيادية، ونفّذوا جولات سلامة للقيادة."], en:["Safety culture and resistance in the field","Involve workers, use leading indicators and run leadership safety walks."]},
  {w:A => A.energy === "high", lv:"m", ar:["عدم توفر بيانات استهلاك دقيقة","ركّبوا عدادات فرعية وحددوا خط الأساس قبل وضع الأهداف."], en:["No accurate consumption data","Install sub-meters and set the baseline before targets."]},
  {w:A => true, lv:"m", ar:["مقاومة التغيير لدى العاملين","تواصل مبكر، وتوعية، وإبراز المكاسب، وإشراك رؤساء الأقسام."], en:["Staff resistance to change","Early communication, awareness, visible benefits and involving department heads."]}
];
function ctObstacles(res){
  const t = CT_T[L], list = CT_OBS.filter(o => o.w(res.A, res)).sort((a, b) => (a.lv === "h" ? 0 : 1) - (b.lv === "h" ? 0 : 1)).slice(0, 6);
  return `<div class="tw ct-tw"><table class="ct-table ct-obs"><thead><tr>${t.obH.map(h => `<th>${esc(h)}</th>`).join("")}</tr></thead><tbody>${list.map(o => `<tr><td><b>${esc(o[L][0])}</b></td><td><span class="ct-lv ${o.lv}">${esc(t.lvl[o.lv])}</span></td><td>${esc(o[L][1])}</td></tr>`).join("")}</tbody></table></div>`;
}
function ctSummary(res){
  const t = CT_T[L], A = res.A, line = r => `- ${r.s.code} — ${r.s.n[L]}`, P = res.plan;
  return [t.sumH, `${t.fields}: ${A.sectors.map(v => ctLbl("sectors", v)).join(L === "ar" ? "، " : ", ")} · ${t.sizeL}: ${ctLbl("size", A.size)}`, "",
    `${t.base}: ${res.base === "have" ? t.baseHave : "ISO 9001 — " + ctStd("iso9001").n[L]}`,
    res.certs.length ? `${t.certs}:\n${res.certs.map(line).join("\n")}` : "", res.accr.length ? `${t.accr}:\n${res.accr.map(line).join("\n")}` : "",
    `${t.guides}:\n${res.guides.map(line).join("\n")}`,
    `${t.s5}:\n${P.waves.map(w => `${t.wave(w.i + 1)} (${t.month} ${w.start}–${w.end}): ${w.ks.map(ctCode).join(", ")}`).join("\n")}`,
    `${t.kpi.first}: ${t.months(P.first)} · ${t.kpi.total}: ${t.months(P.total)} · ${t.kpi.ready}: ${res.ready.overall}%`, "", t.disc].filter(x => x !== "").join("\n");
}
/* the consultation request opens pre-filled: service, standards, sector, size, status and the summary */
const CT_RQ_SECTOR = {ene:"ene",og:"og",con:"con",eng:"con",man:"man",chem:"man",auto:"man",aero:"man",med:"man",pharma:"man",mine:"og",food:"food",hosp:"food",agri:"food",gov:"gov",hlth:"hlth",lab:"hlth",it:"it",fin:"fin",log:"log",edu:"edu",trn:"edu",voc:"edu"};
const CT_RQ_SIZE = {xs:"s",s:"s",m:"m",l:"l",xl:"xl"};
function ctRequest(res){
  rqOpen("consult");
  const d = rqData.consult, A = CTS.A, F = RQ_FORMS.consult.fields, optsOf = k => ((F.find(f => f.k === k) || {}).opts || []).map(o => o[0]);
  const codes = [res.base === "need" ? "ISO 9001" : null, ...res.certs.map(r => r.s.code), ...res.accr.map(r => r.s.code)].filter(Boolean);
  if(optsOf("services").includes("cert")) d.services = [...new Set([...(d.services || []), "cert"])];
  const so = optsOf("stds"); d.stds = [...new Set([...(d.stds || []), ...codes.filter(c => so.includes(c))])];
  if(!d.sector) d.sector = CT_RQ_SECTOR[A.sectors[0]] || (optsOf("sector").includes("svc") ? "svc" : "ot");
  if(!d.size) d.size = CT_RQ_SIZE[A.size] || "";
  if(!d.status) d.status = A.held.some(h => h !== "none") ? "certd" : A.mat === "none" ? "new" : "some";
  if(!d.org && A.org) d.org = A.org;
  const t = CT_T[L];
  if(!d.msg || d.msg.startsWith(t.rqMsg)) d.msg = `${t.rqMsg}\n${ctSummary(res)}`;
  renderRequest();
}
/* the two guides, right under the main buttons of the home page */
function ctGuides(){
  const b = $("ctGuides"); if(!b) return; const t = CT_T[L];
  const card = (href, k, ti, p, ic) => `<a class="ct-gd" href="${href}"><span class="ct-gd-i" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ic}</svg></span><span class="ct-gd-t"><small>${esc(k)}</small><b>${esc(ti)}</b><em>${esc(p)}</em></span>${ARROW}</a>`;
  b.innerHTML = card("#advisor", t.gA, t.gAT, t.gAP, '<circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5-5 2 2-5z"/>') +
    card("#certs", t.gC, t.gCT, t.gCP, '<circle cx="12" cy="9" r="6"/><path d="m9 14.5-1.5 7L12 19l4.5 2.5-1.5-7"/><path d="m9.5 9 1.8 1.8L15 7.5"/>');
}
/* the menu entry, right after the Advisor, and a re-render with the rest of the page */
[UI.ar, UI.en].forEach((u, i) => { if(!u.nav.some(([h]) => h === "certs")){ const at = u.nav.findIndex(([h]) => h === "advisor"); u.nav.splice(at + 1, 0, ["certs", i ? "Certification finder" : "مرشد الشهادات"]); } });
const ctRenderAll0 = renderAll;
renderAll = function(){ ctRenderAll0.apply(this, arguments); try{ ctRender(); }catch(e){ console.error(e); } };
