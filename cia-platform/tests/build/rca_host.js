/* ===== RCA tool — host logic. Investigations and assessment are stored in this browser only (localStorage, wrapped in try/catch). =====
   Storage key "cia-rca:v1" (this tool only). Schema:
   { records: [ {
       id, title, ref, src: "capa"|"ncr"|"audit"|"cc"|"inc"|"near"|"kpi"|"pareto",
       capa (CAPA record id), pdca (PDCA cycle id), pareto (Pareto analysis id), pcat (its category id), area,
       date (YYYY-MM-DD, investigation date), lead (who leads the investigation),
       prob:    {what, where, when, much, req}                    problem in four parts, from facts, and the requirement not met
       risk:    {sev: 0..5, lik: 0..5}                            severity and likelihood of recurrence (0 = not set yet)
       depth:   ""|"light"|"std"|"full", depthWhy                 chosen depth ("" = the depth the grid requires); a depth below
                                                                   the required one needs a written reason (depthWhy)
       team:    [ {n, role, work: true|false} ]                   work = this person does the work being investigated
       tl:      [ {at (YYYY-MM-DDTHH:MM), ev, src, kind: "fact"|"asm"} ]   timeline: event, source of the fact, fact or assumption
       evid:    [ {item, type: "rec"|"photo"|"int"|"data"|"sample", by, date} ]   evidence register; by = who holds it
       methods: [ {how: "pareto"|"fish"|"why5"|"data"|"barrier", ref, note} ]  ref = the analysis id in the other tool
       data:    [ {g, n, k, note} ]                                data analysis done here: group, cases, cases with the problem
       barrier: [ {b, exp, act, res: "held"|"weak"|"failed"|"missing"|"changed"} ]  barrier / change analysis done here
       causes:  [ {id, lvl: "direct"|"contrib"|"root", t, ev, st: "hyp"|"conf"|"out", test: ""|"yes"|"part"|"no", p} ]
                                                                   p = id of the cause this one explains ("" = the problem);
                                                                   test = "if this cause is removed, does the problem stop or fall?"
       similar: ""|"exist"|"could"|"none", similarNote
       acts:    [ {cause (root cause id), t, owner} ]              actions proposed; the plan with dates stays in CAPA
       crit:    {what, where, period, date, before: true|false, pareto}   effectiveness criterion, written (date) before the action;
                                                                   pareto = a Pareto analysis id whose before/after check measures it
       review:  {by, date, note}                                   review by someone outside the team
       created, updated } ],
     assess: { PS1..AC3: 0|1|2 } }
   Other tools' keys are only read, never written: "cia-capa:v1" (start from a CAPA record, previews), "cia-pareto:v1" (start from a
   vital-few category, method and criterion previews), "cia-fish:v1" and "cia-why5:v1" (method previews) and "cia-pdca:v1" (PDCA
   cycle names). Fishbone, 5 Whys and Pareto open through their own requests (?capa=, ?open=, ?pareto=&cat= or their one-time
   sessionStorage hints "cia-nav:fishbone", "cia-nav:five-whys", "cia-nav:pareto"). This tool reads its own hint "cia-nav:rca"
   ({open} | {capa} | {pareto, cat}) and its address (?open=, ?capa=, ?pareto=&cat=) once; none of them holds tool data. */
var LKEY="cia-lang", STORE="cia-rca:v1", CAPA_KEY="cia-capa:v1", PARETO_KEY="cia-pareto:v1", FISH_KEY="cia-fish:v1", WHY5_KEY="cia-why5:v1", PDCA_KEY="cia-pdca:v1",
    NAV_KEY="cia-nav:rca", FISH_NAV="cia-nav:fishbone", WHY5_NAV="cia-nav:five-whys", PARETO_NAV="cia-nav:pareto";
var L=(function(){ try{ return localStorage.getItem(LKEY)||"ar"; }catch(e){ return "ar"; } })();
var TABS=["home","explain-std","explain-cl","assess","tools","docs","audit","dash","report","ai"];
var TITLES={ar:"RCA | تحليل السبب الجذري — التحقيق — مدثر سلامه",en:"RCA | Root cause analysis — investigation — مدثر سلامه"};
var STAGES=["problem","evidence","causes","root","actions","reviewed"];
var SCOL={problem:"#C2410C",evidence:"#3563C9",causes:"#C9821A",root:"#1B2A4A",actions:"#1E8C93",reviewed:"#3C9A5F"};
var SRCS=["capa","ncr","audit","cc","inc","near","kpi","pareto"];
var DEPTHS=["light","std","full"];
var DCOL={light:"#3C9A5F",std:"#C9821A",full:"#B42318"};
var KINDS=["fact","asm"], EVT=["rec","photo","int","data","sample"], HOWS=["pareto","fish","why5","data","barrier"], LVLS=["direct","contrib","root"],
    CST=["hyp","conf","out"], TESTS=["yes","part","no"], BRES=["held","weak","failed","missing","changed"], SIMS=["exist","could","none"];
var LCOL={direct:"#C2410C",contrib:"#C9821A",root:"#1B2A4A"};
var MAXROWS=30;
var DB=load();
var curTab="home";
var editing=null;   /* deep copy of the investigation open in the form: keeps created between saves */
var ST=null;        /* rows of the read-only start preview */

var UI={
ar:{brand:"أكاديمية التحسين المستمر · مدثر سلامه",toolName:"أداة RCA — تحليل السبب الجذري",sgLearn:"التعلّم",sgWork:"العمل",sgOut:"المخرجات",
 nHome:"الرئيسية",nStd:"دليل المنهجية",nCl:"دليل البنود",nAssess:"التقييم الذاتي",nTools:"تحقيق RCA",nDocs:"السجلات",nAudit:"التدقيق",nDash:"لوحة المؤشرات",nReport:"التقرير",nAi:"المساعد الذكي",soon:"قريباً",
 homeCode:"عرّف المشكلة · حدّد العمق · اجمع الوقائع · ابحث عن الأسباب · أثبت السبب الجذري · ابنِ الإجراء عليه",homeH1:"تحليل السبب الجذري — التحقيق",
 homeLede:"أداة تدير التحقيق كاملاً، من المشكلة إلى سبب تستطيع المنشأة تغييره وأثبتت صحته. تكتب المشكلة من الوقائع، ويحدد الخطر عمق التحقيق، ثم تُسجَّل الأحداث والأدلة، وتُختار الطريقة المناسبة من صندوق الأدوات، وتُفرز الأسباب إلى مباشرة ومساهمة وجذرية، ويُختبر كل سبب جذري قبل أن يُبنى عليه إجراء. وتُكتب معايير الفعالية قبل التنفيذ، وتنتقل خطة الإجراء إلى سجل CAPA.",
 homeNote:"النسخة الحالية تحفظ التحقيقات في متصفحك فقط. الحفظ على الخادم وتسجيل الدخول يُضافان في مرحلة المنصة المشتركة.",
 prep:"إعداد",authorName:"مدثر سلامه",cycleT:"ما الذي تستطيع فعله هنا",cycleS:"اقرأ دليل المنهجية، ثم قيّم طريقة التحقيق لديكم، ثم ابدأ أول تحقيق من سجل CAPA أو من فئة حيوية في باريتو أو من الصفر.",
 tStd:"ما التحقيق في السبب الجذري، ولماذا قد يكون للمشكلة أكثر من سبب، ولماذا «الخطأ البشري» نقطة بداية لا سبب جذري، وكيف تختار الطريقة.",tCl:"بنود ISO 9001:2026 التي يخدمها التحقيق، وأولها 10.2.1 ب) 2) و3) والملحق A.10.2: ملخص تفسيري ومثال وما يطلبه المدقق.",tAssess:"اثنا عشر سؤالاً تقيس ممارسة التحقيق لديكم، من كتابة المشكلة من الوقائع حتى مشاركة الدروس.",
 tTools:"تحقيق كامل لكل مشكلة: المشكلة، والخطر والعمق، والأحداث، والأدلة، والفريق، والطرق، والأسباب بمستوياتها الثلاثة، وشجرة الأسباب، والحالات المشابهة، والإجراءات، ومعيار الفعالية، والمراجعة.",tDocs:"كل التحقيقات بمرحلتها وتنبيهاتها، وبيانات المثال.",tAudit:"فحص آلي لكل تحقيق: المشكلة والمتطلب، والعمق، والأحداث والأدلة، والطرق، والأسباب واختبارها، والإجراءات، ومعيار الفعالية، والمراجعة.",
 tDash:"التحقيقات المؤكدة أسبابها، ومعايير الفعالية، والعمق، والطرق المستخدمة، والبنود المفتوحة، والتقييم الذاتي، في صفحة واحدة.",tReport:"تقرير HTML يرسم شجرة الأسباب لكل تحقيق مع الأحداث والأدلة والاختبارات، وملف CSV.",tAi:"مساعد يقرأ التحقيق وينبّه إلى الفجوات. لم يُفعَّل بعد.",
 foot:"المراجع: ISO 9001:2026 البنود 6.1.2 و7.1.6 و7.2 و8.5.1 ز) و9.1.3 و10.1 و10.2 والملحق A.10.2، ومصطلحات ISO 9000:2026 ومبادئها (ملخصات تفسيرية، وليست النص الرسمي). تحليل السبب الجذري منهجية تجمع عدة طرق، وليس بنداً في أي مواصفة. الأمثلة توضيحية وليست بيانات حقيقية.",
 heroTag:"أداة منهجية · تخدم ISO 9001:2026 البند 10.2.1 ب) والملحق A.10.2",langSw:"English",langSwA:"Switch to English",logoAlt:"أكاديمية التحسين المستمر — مدثر سلامه",
 related:"أدوات مرتبطة في الأكاديمية",rel_capa:"الإجراءات التصحيحية",rel_pareto:"باريتو — تحليل القلة الحيوية",rel_fish:"عظمة السمكة — تحليل السبب والنتيجة",rel_why5:"لماذا الخمس — تحليل السبب الجذري",rel_aud:"مركز التدقيق والتحسين الذكي",
 termT:"هل «تحليل السبب الجذري» بند في ISO 9001:2026؟",
 termP1:"لا. تحليل السبب الجذري منهجية تجمع عدة طرق، وليس بنداً في أي مواصفة. هو التحقيق الذي يحوّل المشكلة إلى سبب تستطيع المنشأة تغييره وأثبتت صحته. والمتطلبات التي يخدمها في ISO 9001:2026: تحديد أسباب عدم المطابقة في 10.2.1 ب) 2)، والتحقق من وجود حالات مشابهة في 10.2.1 ب) 3)، وأن تكون الإجراءات التصحيحية مناسبة لآثار عدم المطابقة (10.2.1، ومعلوماتها الموثقة في 10.2.2)، ويترك الملحق A.10.2 للمنشأة أن تقرر مدى التحقيق والطرق المستخدمة. ولا تعرّف ISO 9000:2026 «السبب الجذري» مصطلحاً، لكنها تذكر التحقيق في السبب الجذري وتحديده ضمن فوائد مبدأ التحسين (4.2.6).",
 termP2:"وفي الممارسة: للمشكلة غالباً أكثر من سبب جذري، والأسباب المساهمة مهمة. و«الخطأ البشري» نقطة بداية للسؤال، وليس سبباً جذرياً: اسأل ما الذي في العملية سمح به. والسبب الجذري فرضية حتى يثبتها الدليل والاختبار: إذا أُزيل، هل تتوقف المشكلة أو تقل؟",
 termP3:"وعمق التحقيق يتبع الخطر والأثر، لا العادة. وتحليل السبب الجذري لا يحل محل أدوات الصندوق، بل يختار منها: باريتو ليحدد أين تبحث، وعظمة السمكة لترسم الأسباب، ولماذا الخمس لتحفر في مسار واحد، والبيانات لتثبت.",
 termIs:"ملخص تفسيري بصياغة مستقلة، وليس النص الرسمي. المصادر: ISO 9001:2026 البند 10.2 والملحق A.10.2، وISO 9000:2026 المصطلحات المذكورة والمبدآن 4.2.6 و4.2.7. التحقق: 2026-10-15.",
 defs:[["عدم المطابقة","ISO 9000:2026 · 3.5.13","عدم استيفاء متطلب. لذلك تُكتب المشكلة مع المتطلب الذي لم يُستوفَ.","#C2410C"],["الإجراء التصحيحي","ISO 9000:2026 · 3.6.4","إجراء لإزالة سبب أو أسباب عدم المطابقة ومنع تكرارها. المصطلح نفسه يتحدث عن «سبب أو أسباب».","#1B2A4A"],["الدليل الموضوعي","ISO 9000:2026 · 3.8.6","بيانات تدعم وجود شيء أو صحته. لا يتأكد سبب جذري بلا دليل.","#3563C9"],["مبدأ التحسين","ISO 9000:2026 · 4.2.6","من فوائده المحتملة تركيز أكبر على التحقيق في السبب الجذري وتحديده، يتبعه المنع والإجراء التصحيحي.","#3C9A5F"],["القرار المبني على الدليل","ISO 9000:2026 · 4.2.7","فهم علاقات السبب والنتيجة، وتحليل البيانات وتقييمها بطرق مناسبة قبل القرار.","#B8901E"]],
 asT:"التقييم الذاتي لممارسة التحقيق",asS:"أجب عن كل سؤال بما يحدث فعلاً في تحقيقاتكم. النتيجة تقيس الممارسة الحالية، وليست شهادة ولا حكماً على الأداء.",asReset:"مسح الإجابات",asSaved:"تم حفظ الإجابة",asAnswered:"أُجيب {n} من 12",
 band0:"يحتاج عملاً",band1:"في طور التطوير",band2:"راسخ",bandNote:"حدود داخلية للتقييم الذاتي من تصميم هذه الأداة، وليست معياراً رسمياً.",as0:"غير موجود",as1:"جزئي",as2:"موجود ومطبّق",
 g_PS:"المشكلة والعمق",g_EV:"الوقائع والفريق",g_AN:"الطرق والأسباب",g_VR:"الإثبات والحالات المشابهة",g_AC:"الإجراء والتعلّم",
 tlT:"تحقيق RCA",tlS:"تحقيق واحد لكل مشكلة أو حدث. اكتب المشكلة من الوقائع مع المتطلب الذي لم يُستوفَ، وحدّد الخطورة واحتمال التكرار ليتحدد العمق، ثم سجّل الأحداث والأدلة، واختر الطرق، وافرز الأسباب، واختبر كل سبب جذري، واقترح الإجراء عليه، واكتب معيار الفعالية قبل التنفيذ. تتحدد المرحلة تلقائياً مما تملؤه.",
 save:"حفظ التحقيق",newRec:"تحقيق جديد",savedFail:"تعذّر الحفظ في هذا المتصفح. نزّل التقرير قبل إغلاق الصفحة.",cur:"المرحلة الحالية:",ok_rec:"تم حفظ التحقيق",
 st_problem:"المشكلة",st_evidence:"جُمعت الوقائع",st_causes:"حُددت الأسباب",st_root:"تأكد السبب الجذري",st_actions:"اقتُرحت الإجراءات",st_reviewed:"روجع التحقيق",
 sProbT:"المشكلة بأجزائها الأربعة · البند 10.2.1 ب) 1)",sProbS:"اكتب ما حدث من الوقائع قبل أي سبب: ماذا، وأين، ومتى، وكم. ثم المتطلب الذي لم يُستوفَ، فعدم المطابقة هو عدم استيفاء متطلب.",
 sRiskT:"الخطر وعمق التحقيق · الملحق A.10.2",sRiskS:"اختر الخطورة واحتمال التكرار. الشبكة تحدد العمق المطلوب بقاعدة مكتوبة. يجوز رفع العمق، ولا يجوز خفضه إلا بسبب مكتوب.",
 sTeamT:"الفريق",sTeamS:"من يشارك ودوره. يحتاج الفريق إلى شخص واحد على الأقل يؤدي العمل نفسه، فهو يعرف ما يحدث فعلاً.",
 sTlT:"تسلسل الأحداث",sTlS:"كل حدث في سطر: الوقت، وما حدث، ومصدر المعلومة، وهل هي واقعة مثبتة أم افتراض لم يُتحقق منه بعد.",
 sEvT:"سجل الأدلة · ISO 9000:2026 · 3.8.6",sEvS:"كل دليل في سطر: ما هو، ونوعه، ومن يحتفظ به، وتاريخه. السبب لا يتأكد بلا دليل.",
 sMethT:"الطرق المستخدمة",sMethS:"اختر من صندوق الأدوات بحسب المشكلة: باريتو ليحدد أين تبحث، وعظمة السمكة لترسم الأسباب، ولماذا الخمس لتحفر في مسار واحد. التحليل بالبيانات وتحليل الحواجز والتغييرات يُعملان هنا في جدولين بسيطين.",
 sCauseT:"الأسباب بمستوياتها الثلاثة · البند 10.2.1 ب) 2)",sCauseS:"السبب المباشر هو ما أحدث المشكلة فعلياً، والأسباب المساهمة جعلتها أرجح أو أسوأ، والسبب الجذري هو ما إذا أُزيل توقفت المشكلة أو قلّت. لكل سبب دليل وحالة، ويُختبر كل سبب جذري.",
 sTreeT:"شجرة الأسباب",sTreeS:"تُرسم مما أدخلته: المشكلة، ثم الأسباب المباشرة، ثم المساهمة، ثم الجذرية. على الهاتف تظهر قائمة متدرجة.",
 sSimT:"الحالات المشابهة · البند 10.2.1 ب) 3)",sSimS:"هل توجد الحالة نفسها، أو قد تحدث، في موقع أو عملية أو منتج آخر؟",
 sActT:"الإجراءات المقترحة لكل سبب جذري · البند 10.2.1 ج)",sActS:"إجراء واحد على الأقل بمالك لكل سبب جذري مؤكد. الخطة بتواريخها تبقى في سجل CAPA.",
 sCritT:"معيار الفعالية · البند 10.2.1 د)",sCritS:"اكتب قبل التنفيذ ما سيُقاس، وأين، ولأي مدة، حتى لا يُكيَّف المعيار مع النتيجة. يمكن أن يشير إلى تحقق قبل وبعد في تحليل باريتو.",
 sRevT:"المراجعة",sRevS:"يراجع التحقيقَ شخصٌ من خارج الفريق ويؤرخ مراجعته.",
 f_title:"عنوان مختصر",f_ref:"رقم المرجع (إن وُجد)",f_src:"المصدر",f_capa:"سجل CAPA المرتبط",f_pareto:"تحليل باريتو المرتبط",f_pcat:"الفئة في باريتو",f_pdca:"دورة PDCA المرتبطة",f_date:"تاريخ التحقيق",f_lead:"قائد التحقيق",f_area:"العملية أو الموقع",
 f_what:"ماذا حدث",f_where:"أين",f_when:"متى",f_much:"كم (الحجم أو الأثر)",f_req:"المتطلب الذي لم يُستوفَ",
 f_sev:"الخطورة",f_lik:"احتمال التكرار",f_depth:"العمق المختار",f_depthWhy:"سبب اختيار عمق أقل من المطلوب",
 f_similar:"الحالات المشابهة",f_similarNote:"ملاحظة الحالات المشابهة",
 f_cwhat:"ما الذي سيُقاس",f_cwhere:"أين يُقاس ومن أي مصدر",f_cperiod:"لأي مدة",f_cdate:"تاريخ كتابة المعيار",f_cbefore:"كُتب المعيار قبل بدء تنفيذ الإجراء",f_cpareto:"تحليل باريتو للتحقق قبل وبعد (اختياري)",
 f_rby:"المراجِع (من خارج الفريق)",f_rdate:"تاريخ المراجعة",f_rnote:"ملاحظة المراجعة",
 src_capa:"سجل CAPA",src_ncr:"تقرير عدم مطابقة (NCR)",src_audit:"ملاحظة تدقيق",src_cc:"شكوى عميل",src_inc:"حادث",src_near:"حادث وشيك",src_kpi:"مؤشر أداء",src_pareto:"فئة حيوية في باريتو",
 sev_:"— اختر —",sev_1:"1 · طفيفة",sev_2:"2 · محدودة",sev_3:"3 · متوسطة",sev_4:"4 · كبيرة",sev_5:"5 · جسيمة (سلامة أو عميل أو قانون)",
 lik_:"— اختر —",lik_1:"1 · نادر",lik_2:"2 · غير مرجّح",lik_3:"3 · ممكن",lik_4:"4 · مرجّح",lik_5:"5 · شبه مؤكد",
 dp_:"كما تحدده الشبكة",dp_light:"خفيف",dp_std:"قياسي",dp_full:"كامل",
 dpd_light:"خفيف: تصحيح وتحقق، وسبب مباشر وسبب جذري بدليل.",dpd_std:"قياسي: طريقة واحدة على الأقل بدليل، وأسباب مختبرة.",dpd_full:"كامل: طريقتان أو أكثر، وتحقق بالبيانات، ومراجعة مستقلة.",
 rule:"القاعدة: الدرجة = الخطورة × الاحتمال. <b>كامل</b> عندما تكون الخطورة 5 أو الدرجة 15 فأكثر. <b>قياسي</b> عندما تكون الخطورة 4 أو الدرجة من 6 إلى 14. <b>خفيف</b> لما دون ذلك. هذه قاعدة الأداة، وتستطيع المنشأة أن تكتب قاعدتها.",
 reqL:"العمق المطلوب:",reqNone:"اختر الخطورة والاحتمال",scoreL:"الدرجة {s}",lowW:"اخترت عمقاً أقل من المطلوب. اكتب السبب، وإلا فالتدقيق يسجله ثغرة.",rgSev:"الخطورة →",rgLik:"الاحتمال ↑",
 tmN:"الاسم",tmRole:"الدور",tmWork:"يؤدي العمل",tmAdd:"إضافة عضو",tmDel:"حذف",tmNone:"لم يُضف أحد بعد.",workW:"لا أحد في الفريق يؤدي العمل نفسه. أضف شخصاً واحداً على الأقل.",
 tlAt:"الوقت",tlEv:"ما حدث",tlSrc:"مصدر المعلومة",tlKind:"النوع",k_fact:"واقعة",k_asm:"افتراض",tlAdd:"إضافة حدث",tlSort:"رتّب بحسب الوقت",tlNone:"لا أحداث بعد.",tlFacts:"{f} واقعة و{a} افتراض. الافتراض يُتحقق منه قبل أن يُبنى عليه.",
 evItem:"الدليل",evType:"النوع",evBy:"من يحتفظ به",evDate:"التاريخ",ev_rec:"سجل",ev_photo:"صورة",ev_int:"مقابلة",ev_data:"بيانات",ev_sample:"عينة",evAdd:"إضافة دليل",evNone:"لا أدلة بعد.",
 meHow:"الطريقة",meRef:"رقم التحليل",meNote:"ما أظهرته",how_:"— اختر —",how_pareto:"باريتو (أين نبحث)",how_fish:"عظمة السمكة (رسم الأسباب)",how_why5:"لماذا الخمس (الحفر في مسار)",how_data:"تحليل بالبيانات (هنا)",how_barrier:"تحليل الحواجز والتغييرات (هنا)",
 meAdd:"إضافة طريقة",meNone:"لم تُختر طريقة بعد.",meHere:"يُعمل في الجدول أدناه",meStartFish:"ابدأ تحليل عظمة سمكة",meStart5:"ابدأ تحليل لماذا الخمس",meOpenPa:"افتح أداة باريتو",meOpen:"افتح المربوط",
 meHub:"داخل المنصة تُفتح الأداة الأخرى مكان هذه الأداة: احفظ التحقيق أولاً.",meNeed:"العمق {d} يحتاج {n} طريقة على الأقل{x}. الطرق الصالحة الآن: {m}.",meNeedX:"، منها تحقق بالبيانات (تحليل بيانات هنا أو تحليل باريتو)",meOk:"الطرق تكفي العمق المختار.",
 daT:"التحليل بالبيانات",daS:"قارن المجموعات: عدد الحالات، وعدد ما ظهرت فيه المشكلة، والنسبة. فرق واضح بين مجموعتين يدعم السبب أو يستبعده.",daG:"المجموعة",daN:"الحالات",daK:"فيها المشكلة",daR:"النسبة",daNote:"ملاحظة",daAdd:"إضافة مجموعة",
 baT:"تحليل الحواجز والتغييرات",baS:"لكل حاجز أو ضابط كان يجب أن يمنع المشكلة، أو تغيير عن الوضع المعتاد: ما المتوقع، وما الذي حدث، والنتيجة.",baB:"الحاجز أو التغيير",baExp:"ما كان متوقعاً",baAct:"ما حدث فعلاً",baRes:"النتيجة",br_held:"صمد",br_weak:"ضعيف",br_failed:"فشل",br_missing:"غير موجود",br_changed:"تغيّر عن المعتاد",baAdd:"إضافة حاجز أو تغيير",
 czCode:"الرمز",czLvl:"المستوى",czT:"السبب",czEv:"الدليل",czSt:"الحالة",czTest:"إذا أُزيل، هل تتوقف المشكلة أو تقل؟",czP:"يفسّر",czDel:"حذف السبب",
 lv_direct:"سبب مباشر",lv_contrib:"سبب مساهم",lv_root:"سبب جذري",cs_hyp:"فرضية",cs_conf:"مؤكد بالدليل",cs_out:"مستبعد",ts_:"— لم يُختبر —",ts_yes:"نعم، تتوقف",ts_part:"تقل ولا تتوقف",ts_no:"لا",
 czAddD:"+ سبب مباشر",czAddC:"+ سبب مساهم",czAddR:"+ سبب جذري",czNone:"لا أسباب بعد.",pProb:"المشكلة",
 personF:"يشير إلى شخص فقط. اسأل: ما الذي في العملية سمح بذلك؟",noTest:"اختبار الإزالة لم يُجب عنه.",testNo:"الإزالة لا تغيّر المشكلة: هذا ليس السبب الجذري.",noEv:"دليل مطلوب للتأكيد.",
 personW:"سبب أو أكثر يشير إلى شخص فقط («خطأ بشري» أو «إهمال»). الخطأ البشري نقطة بداية: اسأل ما الذي في العملية سمح به، ثم أعد كتابة السبب بحيث تستطيع المنشأة تغييره.",
 czSum:"{d} مباشر · {c} مساهم · {r} جذري ({ok} مؤكد ومختبر) · {o} مستبعد",
 trEmpty:"اكتب المشكلة وسبباً واحداً على الأقل ليظهر المخطط.",trP:"المشكلة",trD:"الأسباب المباشرة",trC:"الأسباب المساهمة",trR:"الأسباب الجذرية",trLegConf:"مؤكد",trLegHyp:"فرضية",trLegOut:"مستبعد",trLegPf:"يشير إلى شخص",
 sim_:"— اختر —",sim_exist:"توجد حالات مشابهة",sim_could:"قد تحدث في مكان آخر",sim_none:"لا توجد، بعد الفحص",
 acCause:"السبب الجذري",acT:"الإجراء المقترح",acOwner:"المالك",acAdd:"إضافة إجراء",acNone:"لا إجراءات بعد.",acMiss:"سبب جذري دون إجراء بمالك: {c}",acCapa:"افتح أداة CAPA",acCapaN:"لم يُربط سجل CAPA بعد: الخطة بتواريخها ومتابعتها تكون في CAPA.",
 critPv:"تحليل باريتو: {t}",
 cpOpen:"افتح PDCA",pdFound:"دورة PDCA: {t}",pdMiss:"لم يُعثر على هذه الدورة في أداة PDCA على هذا المتصفح.",pdHint:"اكتب رقم الدورة، مثل PD-EX-03، إن وُجدت.",pdOpen:"افتح PDCA",
 caHint:"اكتب رقم سجل CAPA، مثل CA-EX-04، إن وُجد.",caMiss:"لم يُعثر على هذا السجل في أداة CAPA على هذا المتصفح.",caOpen:"افتح CAPA",paHint:"اكتب رقم تحليل باريتو، مثل PA-EX-02، إن وُجد.",paMiss:"لم يُعثر على هذا التحليل في أداة باريتو على هذا المتصفح.",pcat_:"— اختر الفئة —",
 pvCapa:"{id} · {ref} · {st} · {t}",pvPareto:"{id} · {st} · القلة الحيوية: {t}",pvFish:"{id} · {st} · السبب الجذري: {t}",pvWhy5:"{id} · {st} · السبب الجذري: {t}",pvNo:"لم يُكتب بعد",pvCat:"{c}: {v} {u} من {tot} ({s}%) · الفترة {f} → {to}{vf}",pvVf:" · في القلة الحيوية",
 pvBa:"{id} · {st} · قبل وبعد: {v}",baNone:"لم يُتحقق بعد",v_imp:"تحسّن",v_same:"لا تغيّر واضح",v_worse:"ساء",
 nxMiss:"هذا الرقم غير موجود في الأداة الأخرى على هذا المتصفح.",nxNoData:"لا توجد بيانات في هذه الأداة على هذا المتصفح بعد.",
 cst_react:"التفاعل",cst_cause:"تحليل السبب",cst_action:"الإجراء",cst_verify:"التحقق من الفعالية",cst_closed:"مغلق",cst_reopened:"أعيد فتحه",
 pst_question:"السؤال",pst_data:"البيانات",pst_vital:"القلة الحيوية",pst_acted:"الخطوات التالية",pst_checked:"تحقق الأثر",pst_reviewed:"روجع التحليل",
 fst_effect:"تعريف الأثر",fst_causes:"رسم الأسباب",fst_selected:"اختيار الأسباب",fst_verified:"تحقق السبب الجذري",fst_reviewed:"روجع التحليل",
 w5st_problem:"تعريف المشكلة",w5st_chain:"سلسلة لماذا",w5st_root:"السبب الجذري",w5st_tested:"اختُبر السبب",w5st_reviewed:"روجع التحليل",
 pu_count:"",pu_cost:"ريال",pu_hours:"ساعة",pu_sev:"نقطة",
 stT:"ابدأ من سجل CAPA أو من فئة حيوية في باريتو (قراءة فقط)",stS:"تقرأ الأداة سجلات CAPA أو تحليلات باريتو المحفوظة في هذا المتصفح وتعرضها للمعاينة. اختر سجلاً أو فئة لتعبئة تحقيق جديد غير محفوظ. لا يُكتب أي شيء في الأدوات الأخرى.",
 stSrc:"المصدر",stPrev:"اعرض المعاينة",ss_capa:"سجلات CAPA",ss_pareto:"الفئات الحيوية في باريتو",stUse:"ابدأ تحقيقاً منه",
 stNone:"لا توجد بيانات من هذا المصدر في هذا المتصفح.",stEmpty:"لا توجد بنود يمكن البدء منها في هذا المصدر.",
 stColId:"الرقم",stColT:"المرجع والعنوان",stColSt:"المرحلة",stColRoot:"السبب الجذري المكتوب",stColN:"تحقيقات قائمة",stColA:"إجراء",stColCat:"الفئة",stColV:"القيمة والنسبة",stColPer:"الفترة",stColNx:"الخطوة التالية",
 stUsedC:"عُبّئ تحقيق جديد من سجل CAPA {id}. راجع المشكلة على الوقائع ثم احفظ. لم يُكتب أي شيء في CAPA.",stUsedP:"عُبّئ تحقيق جديد من الفئة «{c}» في تحليل باريتو {id}. راجع المشكلة على الوقائع ثم احفظ. لم يُكتب أي شيء في باريتو.",
 pfRoot:"السبب الجذري كما كُتب في سجل CAPA (فرضية حتى يُثبت): {t}",pfRaised:"فُتح سجل CAPA: {t}",pfReact:"التصحيح: {t}",pfMuch:"{v} {u} من {tot} ({s}%) في تحليل باريتو {id}",
 hmT:"في هذا المتصفح ما يمكن البدء منه: {c} سجل CAPA مفتوح، و{p} فئة حيوية في باريتو.",hmGo:"ابدأ تحقيقاً",
 e_title:"أدخل عنواناً مختصراً للتحقيق.",e_rdate:"تاريخ المراجعة لا يسبق تاريخ التحقيق.",e_num:"أعداد الحالات لا تكون سالبة، وما فيه المشكلة لا يزيد على عدد الحالات.",e_cdate:"تاريخ كتابة المعيار لا يأتي بعد تاريخ المراجعة.",
 exT:"بيانات المثال",exS:"ثلاثة تحقيقات توضيحية لشركة سعودية افتراضية (شركة الواحة للمقاولات): رفض شحنات الخرسانة الجاهزة (CA-EX-04، بدءاً من فئة الحرارة في باريتو PA-EX-02، بعظمة السمكة FB-EX-02 ولماذا الخمس W5-EX-03، وسببين جذريين، وبند في العقد، ومعيار «أقل من 3% شحنات مرفوضة في يوليو وأغسطس»)، وحادث وشيك لسقوط حمولة أثناء الرفع بعمق كامل وتحليل للحواجز، وتحقيق خفيف في المخططات الملغاة (CA-EX-03 وFB-EX-03)، مع إجابات للتقييم الذاتي. البيانات توضيحية وليست حقيقية، وتحميلها يستبدل كل بيانات هذه الأداة في متصفحك.",
 exLoad:"تحميل المثال",exClear:"مسح كل البيانات",exLoaded:"تم تحميل المثال: 3 تحقيقات وإجابات التقييم الذاتي.",exCleared:"تم مسح كل بيانات الأداة من هذا المتصفح.",
 exConfirmClear:"سيحذف هذا كل تحقيقات RCA وإجابات التقييم الذاتي من هذا المتصفح، ولا يمكن التراجع عن ذلك.\n\nهل تريد المتابعة؟",
 dT:"تحقيقات السبب الجذري",dS:"كل تحقيق بمرحلته وتنبيهاته. افتح التحقيق لتعديله في «تحقيق RCA».",csv:"تصدير CSV",none:"لا توجد تحقيقات بعد. ابدأ من «تحقيق RCA» أو حمّل المثال.",
 colRef:"المرجع والعنوان",colSrc:"المصدر والعمق",colStage:"المرحلة",colProb:"المشكلة",colRoots:"الأسباب الجذرية",colMeth:"الطرق",colFlags:"تنبيهات",colAct:"إجراءات",open:"فتح",del:"حذف",delArm:"تأكيد الحذف",
 rootsN:"{ok} من {n} مؤكد ومختبر",
 fl_prob:"المشكلة أو المتطلب ناقص",fl_risk:"الخطر لم يُقيَّم",fl_low:"عمق أقل من المطلوب دون سبب",fl_tl:"أقل من واقعتين في الأحداث",fl_ev:"لا أدلة",fl_asm:"افتراضات لم يُتحقق منها: {n}",fl_work:"لا أحد ممن يؤدون العمل",fl_meth:"الطرق أقل مما يحتاجه العمق",fl_cause:"السبب المباشر أو الجذري ناقص",fl_untested:"أسباب جذرية لم تتأكد أو لم تُختبر: {n}",fl_person:"سبب يشير إلى شخص فقط",fl_sim:"الحالات المشابهة لم يُنظر فيها",fl_act:"سبب جذري دون إجراء: {n}",fl_own:"إجراء دون مالك",fl_crit:"معيار الفعالية ناقص",fl_capa:"لم يُربط بسجل CAPA",fl_wait:"ينتظر المراجعة",fl_rev:"المراجِع من الفريق",
 auT:"التدقيق الآلي للتحقيقات",auS:"هذه الفحوص تُطبَّق على كل تحقيق وتُظهر الثغرات التي يلاحظها المدقق عادةً. الخانة «—» تعني أن الفحص لا ينطبق بعد على مرحلة التحقيق أو عمقه.",
 auRec:"تحقيقات مُدقّقة",auPass:"فحوص ناجحة",auFail:"تحقيقات بها ثغرات",auOpen:"بنود مفتوحة",auEmpty:"لا توجد تحقيقات لتدقيقها.",
 c_ref:"له مرجع",c_prob:"المشكلة بأجزائها والمتطلب",c_depth:"العمق محدد ولم يُخفَض دون سبب",c_tl:"واقعتان على الأقل في الأحداث",c_ev:"سجل الأدلة غير فارغ",c_meth:"طرق تكفي العمق",c_cause:"سبب مباشر وسبب جذري",c_root:"كل سبب جذري مؤكد ومختبر",c_person:"لا سبب جذري يشير إلى شخص فقط",c_sim:"نُظر في الحالات المشابهة",c_act:"إجراء بمالك لكل سبب جذري",c_crit:"معيار فعالية كُتب قبل التنفيذ",c_rev:"مراجعة مستقلة مؤرخة",
 dashT:"لوحة المؤشرات",dashS:"أرقام تُحسب من التحقيقات والتقييم في هذا المتصفح.",kTotal:"إجمالي التحقيقات",kRoot:"أسبابها الجذرية مؤكدة ومختبرة",kCrit:"معيار فعالية قبل التنفيذ",kFull:"تحقيقات بعمق كامل",kRev:"روجعت",kPerson:"أسباب تشير إلى شخص",kCapa:"مربوطة بسجل CAPA",kOpen:"بنود مفتوحة",kAud:"نجاح التدقيق",kAs:"التقييم الذاتي",
 byStage:"توزيع المراحل",byDepth:"عمق التحقيق",byMeth:"الطرق المستخدمة",byAssess:"التقييم الذاتي حسب المجموعة",openT:"بنود تحتاج متابعة",noOpen:"لا توجد بنود مفتوحة.",noData:"لا توجد بيانات بعد.",dp_none:"لم يُحدَّد",
 oi_prob:"المشكلة لم تُكتب بأجزائها الأربعة أو دون المتطلب",oi_risk:"الخطورة أو الاحتمال لم يُحددا",oi_low:"العمق أقل من المطلوب دون سبب مكتوب",oi_tl:"أقل من واقعتين مثبتتين في تسلسل الأحداث",oi_ev:"سجل الأدلة فارغ",oi_asm:"{n} افتراض في الأحداث لم يُتحقق منه",oi_work:"لا يوجد في الفريق من يؤدي العمل",oi_meth:"الطرق المستخدمة أقل مما يحتاجه العمق",oi_cause:"لم يُكتب سبب مباشر وسبب جذري",oi_untested:"{n} سبب جذري لم يتأكد بالدليل أو لم يُختبر",oi_person:"سبب يشير إلى شخص فقط: اسأل ما الذي في العملية سمح به",oi_sim:"الحالات المشابهة لم يُنظر فيها",oi_act:"{n} سبب جذري دون إجراء بمالك",oi_own:"إجراء مقترح دون مالك",oi_crit:"معيار الفعالية لم يُكتب كاملاً قبل التنفيذ",oi_capa:"الإجراءات لم تُنقل إلى سجل CAPA بعد",oi_wait:"ينتظر مراجعة من خارج الفريق",oi_rev:"المراجِع من أعضاء الفريق",
 rpT:"تقرير التحقيقات",rpS:"تقرير HTML يُنزَّل إلى جهازك ويُطبع أو يُحفظ PDF من المتصفح، يرسم شجرة الأسباب لكل تحقيق. وCSV لتحليل البيانات في جدول.",rpHtml:"تنزيل تقرير HTML",rpNote:"التقرير يحمل اسم المُعِد «مدثر سلامه» ويتضمن الغلاف والملخص، وكل تحقيق بشجرة أسبابه وتسلسل الأحداث وسجل الأدلة والطرق بأرقامها والأسباب واختباراتها والإجراءات ومعيار الفعالية، ونتائج التدقيق، والبنود المفتوحة، والتقييم الذاتي.",rpPrev:"معاينة سريعة",rpEmpty:"لا توجد تحقيقات للتصدير بعد.",
 rpCover:"تقرير تحقيقات السبب الجذري",rpProb:"المشكلة",rpRisk:"الخطر والعمق",rpTl:"تسلسل الأحداث",rpEv:"سجل الأدلة",rpMeth:"الطرق",rpCz:"الأسباب",rpAct:"الإجراءات المقترحة",rpCrit:"معيار الفعالية",rpAu:"نتيجة التدقيق",rpTree:"شجرة الأسباب",
 aiT:"المساعد الذكي — قيد البناء",aiS:"سيقرأ هذا المساعد التحقيق، وينبّه إلى الافتراضات غير المثبتة والأسباب التي تشير إلى أشخاص والأسباب الجذرية غير المختبرة. لن يعمل قبل تهيئة محرك المنصة المشتركة، ولن يُظهر نتائج مزيّفة.",
 aiList:["اقتراح أسئلة لتحويل «الخطأ البشري» إلى سبب في العملية","التنبيه إلى سبب جذري لا يدعمه دليل","مقارنة التحقيق بتحقيقات سابقة لمشكلات مشابهة"],
 revW:"المراجِع من أعضاء الفريق. اختر شخصاً من خارجه.",yes:"نعم",no:"لا",scoreS:"الدرجة"},
en:{brand:"Continual Improvement Academy · مدثر سلامه",toolName:"RCA tool — Root cause analysis",sgLearn:"Learn",sgWork:"Work",sgOut:"Output",
 nHome:"Home",nStd:"Method guide",nCl:"Clause guide",nAssess:"Self-assessment",nTools:"RCA investigation",nDocs:"Records",nAudit:"Audit",nDash:"Dashboard",nReport:"Report",nAi:"AI Assistant",soon:"Soon",
 homeCode:"Define the problem · Set the depth · Collect the facts · Find the causes · Prove the root cause · Act on it",homeH1:"Root cause analysis — the investigation",
 homeLede:"A tool that runs the whole investigation, from the problem to a cause the organization can change and has proved. You write the problem from facts, the risk sets the depth of the investigation, the events and the evidence are recorded, the right methods are chosen from the toolbox, the causes are sorted into direct, contributing and root, and every root cause is tested before an action is built on it. The effectiveness criterion is written before the action, and the action plan moves to a CAPA record.",
 homeNote:"This version keeps investigations in your browser only. Server storage and sign-in come with the shared platform phase.",
 prep:"Prepared by",authorName:"مدثر سلامه",cycleT:"What you can do here",cycleS:"Read the method guide, assess how you investigate today, then start your first investigation from a CAPA record, a Pareto vital-few category or from scratch.",
 tStd:"What a root cause investigation is, why a problem often has more than one cause, why “human error” is a starting point and not a root cause, and how to choose the method.",tCl:"The ISO 9001:2026 clauses the investigation serves, starting with 10.2.1 b) 2) and 3) and Annex A.10.2: interpretive summary, example and what the auditor asks for.",tAssess:"Twelve questions on your investigation practice, from writing the problem from facts to sharing the lessons.",
 tTools:"One full investigation per problem: the problem, risk and depth, events, evidence, team, methods, causes in three levels, the cause tree, similar cases, actions, the effectiveness criterion and the review.",tDocs:"Every investigation with its stage and flags, and the example data.",tAudit:"Automatic check of each investigation: problem and requirement, depth, events and evidence, methods, causes and their tests, actions, the effectiveness criterion and the review.",
 tDash:"Investigations with confirmed causes, effectiveness criteria, depth, methods used, open items and the self-assessment on one page.",tReport:"HTML report that draws the cause tree of each investigation with its events, evidence and tests, and a CSV file.",tAi:"An assistant that reads the investigation and points out gaps. Not active yet.",
 foot:"References: ISO 9001:2026 clauses 6.1.2, 7.1.6, 7.2, 8.5.1 g), 9.1.3, 10.1 and 10.2 and Annex A.10.2, and ISO 9000:2026 terms and principles (interpretive summaries, not the official text). Root cause analysis is a discipline that combines methods, not a clause of any standard. Examples are illustrative, not real data.",
 heroTag:"Method tool · Serves ISO 9001:2026 clause 10.2.1 b) and Annex A.10.2",langSw:"العربية",langSwA:"التبديل إلى العربية",logoAlt:"Continual Improvement Academy — مدثر سلامه",
 related:"Related Academy tools",rel_capa:"Corrective action",rel_pareto:"Pareto — vital few analysis",rel_fish:"Fishbone — cause and effect analysis",rel_why5:"5 Whys — root cause analysis",rel_aud:"Smart audit & improvement center",
 termT:"Is root cause analysis a clause of ISO 9001:2026?",
 termP1:"No. Root cause analysis is a discipline that combines methods, not a clause of any standard. It is the investigation that turns a problem into a cause the organization can change and has proved. The requirements it serves in ISO 9001:2026 are determining the causes of the nonconformity in 10.2.1 b) 2), determining whether similar nonconformities exist or could occur in 10.2.1 b) 3), and making corrective actions appropriate to the effects of the nonconformities (10.2.1, with its documented information in 10.2.2); Annex A.10.2 leaves the extent of investigation and the methods used to the organization. ISO 9000:2026 does not define “root cause” as a term; it names root cause investigation and determination among the benefits of the improvement principle (4.2.6).",
 termP2:"In practice: a problem often has more than one root cause, and contributing causes matter. “Human error” is a starting point for questions, not a root cause: ask what in the process allowed it. A root cause is a hypothesis until evidence and a test confirm it: if it is removed, does the problem stop or fall?",
 termP3:"The depth of the investigation follows risk and impact, not habit. And root cause analysis does not replace the toolbox methods; it chooses among them: Pareto to choose where to look, Fishbone to map the causes, 5 Whys to dig down one path, and data to verify.",
 termIs:"Interpretive summary in independent wording, not the official text. Sources: ISO 9001:2026 clause 10.2 and Annex A.10.2, and ISO 9000:2026, the terms named here and principles 4.2.6 and 4.2.7. Verified: 2026-10-15.",
 defs:[["Nonconformity","ISO 9000:2026 · 3.5.13","Non-fulfilment of a requirement. That is why the problem is written with the requirement that was not met.","#C2410C"],["Corrective action","ISO 9000:2026 · 3.6.4","Action to eliminate the cause(s) of a nonconformity and to prevent recurrence. The term itself says “cause(s)”.","#1B2A4A"],["Objective evidence","ISO 9000:2026 · 3.8.6","Data supporting the existence or truth of something. No root cause is confirmed without it.","#3563C9"],["Improvement principle","ISO 9000:2026 · 4.2.6","Its potential benefits include an enhanced focus on root cause investigation and determination, followed by prevention and corrective actions.","#3C9A5F"],["Evidence-based decision-making","ISO 9000:2026 · 4.2.7","Understanding cause and effect relationships, and analysing and evaluating data with suitable methods before deciding.","#B8901E"]],
 asT:"Self-assessment of your investigation practice",asS:"Answer each question with what actually happens in your investigations. The score measures current practice; it is not a certificate or a performance rating.",asReset:"Clear answers",asSaved:"Answer saved",asAnswered:"{n} of 12 answered",
 band0:"Needs work",band1:"Developing",band2:"Established",bandNote:"Internal bands for this self-assessment, designed in this tool; not an official scale.",as0:"Not in place",as1:"Partly",as2:"In place and applied",
 g_PS:"Problem and depth",g_EV:"Facts and team",g_AN:"Methods and causes",g_VR:"Proof and similar cases",g_AC:"Act and learn",
 tlT:"RCA investigation",tlS:"One investigation per problem or event. Write the problem from facts with the requirement that was not met, set the severity and likelihood so the depth is set, then record the events and the evidence, choose the methods, sort the causes, test each root cause, propose the action on it, and write the effectiveness criterion before the action. The stage is set automatically from what you fill in.",
 save:"Save investigation",newRec:"New investigation",savedFail:"Could not save in this browser. Download the report before closing the page.",cur:"Current stage:",ok_rec:"Investigation saved",
 st_problem:"Problem",st_evidence:"Facts collected",st_causes:"Causes mapped",st_root:"Root cause confirmed",st_actions:"Actions proposed",st_reviewed:"Reviewed",
 sProbT:"The problem in four parts · clause 10.2.1 b) 1)",sProbS:"Write what happened from facts before any cause: what, where, when and how much. Then the requirement that was not met, since a nonconformity is the non-fulfilment of a requirement.",
 sRiskT:"Risk and depth of investigation · Annex A.10.2",sRiskS:"Choose the severity and the likelihood of recurrence. The grid sets the required depth by a written rule. You may raise the depth; you may lower it only with a written reason.",
 sTeamT:"Team",sTeamS:"Who takes part and their role. The team needs at least one person who does the work itself; they know what really happens.",
 sTlT:"Timeline of events",sTlS:"One event per line: the time, what happened, the source of the information, and whether it is a proven fact or an assumption not yet checked.",
 sEvT:"Evidence register · ISO 9000:2026 · 3.8.6",sEvS:"One item per line: what it is, its type, who holds it and its date. A cause is not confirmed without evidence.",
 sMethT:"Methods used",sMethS:"Choose from the toolbox to fit the problem: Pareto to choose where to look, Fishbone to map the causes, 5 Whys to dig down one path. Data analysis and barrier/change analysis are done here in two simple tables.",
 sCauseT:"Causes in three levels · clause 10.2.1 b) 2)",sCauseS:"The direct cause is what actually produced the problem, contributing causes made it more likely or worse, and the root cause is the one that, if removed, stops the problem or makes it fall. Each cause has evidence and a status, and every root cause is tested.",
 sTreeT:"Cause tree",sTreeS:"Drawn from what you entered: the problem, then the direct causes, then the contributing ones, then the root causes. On a phone it shows as an indented list.",
 sSimT:"Similar cases · clause 10.2.1 b) 3)",sSimS:"Does the same case exist, or could it occur, at another site, in another process or product?",
 sActT:"Actions proposed for each root cause · clause 10.2.1 c)",sActS:"At least one action with an owner for each confirmed root cause. The plan with its dates stays in the CAPA record.",
 sCritT:"Effectiveness criterion · clause 10.2.1 d)",sCritS:"Write before the action what will be measured, where and for how long, so the criterion is not fitted to the result. It can point to a before/after check in a Pareto analysis.",
 sRevT:"Review",sRevS:"Someone outside the team reviews the investigation and dates the review.",
 f_title:"Short title",f_ref:"Reference (if any)",f_src:"Source",f_capa:"Linked CAPA record",f_pareto:"Linked Pareto analysis",f_pcat:"Category in Pareto",f_pdca:"Linked PDCA cycle",f_date:"Investigation date",f_lead:"Investigation lead",f_area:"Process or site",
 f_what:"What happened",f_where:"Where",f_when:"When",f_much:"How much (size or impact)",f_req:"Requirement not met",
 f_sev:"Severity",f_lik:"Likelihood of recurrence",f_depth:"Depth chosen",f_depthWhy:"Reason for a depth below the required one",
 f_similar:"Similar cases",f_similarNote:"Similar cases note",
 f_cwhat:"What will be measured",f_cwhere:"Where it is measured, from which source",f_cperiod:"For how long",f_cdate:"Date the criterion was written",f_cbefore:"The criterion was written before the action started",f_cpareto:"Pareto analysis for the before/after check (optional)",
 f_rby:"Reviewer (outside the team)",f_rdate:"Review date",f_rnote:"Review note",
 src_capa:"CAPA record",src_ncr:"Nonconformity report (NCR)",src_audit:"Audit finding",src_cc:"Customer complaint",src_inc:"Incident",src_near:"Near miss",src_kpi:"KPI",src_pareto:"Pareto vital-few category",
 sev_:"— choose —",sev_1:"1 · Minor",sev_2:"2 · Limited",sev_3:"3 · Moderate",sev_4:"4 · Major",sev_5:"5 · Severe (safety, customer or legal)",
 lik_:"— choose —",lik_1:"1 · Rare",lik_2:"2 · Unlikely",lik_3:"3 · Possible",lik_4:"4 · Likely",lik_5:"5 · Almost certain",
 dp_:"As the grid sets it",dp_light:"Light",dp_std:"Standard",dp_full:"Full",
 dpd_light:"Light: correction and a check, and a direct and a root cause with evidence.",dpd_std:"Standard: at least one method with evidence, and tested causes.",dpd_full:"Full: two methods or more, verification with data, and an independent review.",
 rule:"Rule: score = severity × likelihood. <b>Full</b> when severity is 5 or the score is 15 or more. <b>Standard</b> when severity is 4 or the score is 6 to 14. <b>Light</b> below that. This is the tool's rule; an organization can write its own.",
 reqL:"Required depth:",reqNone:"Choose severity and likelihood",scoreL:"Score {s}",lowW:"You chose a depth below the required one. Write the reason, or the audit records it as a gap.",rgSev:"Severity →",rgLik:"Likelihood ↑",
 tmN:"Name",tmRole:"Role",tmWork:"Does the work",tmAdd:"Add member",tmDel:"Remove",tmNone:"No one added yet.",workW:"No one in the team does the work itself. Add at least one such person.",
 tlAt:"Time",tlEv:"What happened",tlSrc:"Source of the information",tlKind:"Type",k_fact:"Fact",k_asm:"Assumption",tlAdd:"Add event",tlSort:"Sort by time",tlNone:"No events yet.",tlFacts:"{f} fact(s) and {a} assumption(s). Check an assumption before building on it.",
 evItem:"Evidence",evType:"Type",evBy:"Held by",evDate:"Date",ev_rec:"Record",ev_photo:"Photo",ev_int:"Interview",ev_data:"Data",ev_sample:"Sample",evAdd:"Add evidence",evNone:"No evidence yet.",
 meHow:"Method",meRef:"Analysis id",meNote:"What it showed",how_:"— choose —",how_pareto:"Pareto (where to look)",how_fish:"Fishbone (map the causes)",how_why5:"5 Whys (dig down one path)",how_data:"Data analysis (here)",how_barrier:"Barrier and change analysis (here)",
 meAdd:"Add a method",meNone:"No method chosen yet.",meHere:"Done in the table below",meStartFish:"Start a Fishbone analysis",meStart5:"Start a 5 Whys analysis",meOpenPa:"Open the Pareto tool",meOpen:"Open the linked one",
 meHub:"Inside the platform the other tool opens in place of this one: save the investigation first.",meNeed:"A {d} depth needs at least {n} method(s){x}. Valid methods now: {m}.",meNeedX:", one of them a check with data (data analysis here or a Pareto analysis)",meOk:"The methods are enough for the chosen depth.",
 daT:"Data analysis",daS:"Compare groups: the number of cases, how many had the problem, and the rate. A clear difference between two groups supports a cause or rules it out.",daG:"Group",daN:"Cases",daK:"With the problem",daR:"Rate",daNote:"Note",daAdd:"Add a group",
 baT:"Barrier and change analysis",baS:"For each barrier or control that should have prevented the problem, or a change from the usual situation: what was expected, what happened, and the result.",baB:"Barrier or change",baExp:"What was expected",baAct:"What actually happened",baRes:"Result",br_held:"Held",br_weak:"Weak",br_failed:"Failed",br_missing:"Missing",br_changed:"Changed from normal",baAdd:"Add a barrier or change",
 czCode:"Code",czLvl:"Level",czT:"Cause",czEv:"Evidence",czSt:"Status",czTest:"If removed, does the problem stop or fall?",czP:"Explains",czDel:"Remove cause",
 lv_direct:"Direct cause",lv_contrib:"Contributing cause",lv_root:"Root cause",cs_hyp:"Hypothesis",cs_conf:"Confirmed by evidence",cs_out:"Ruled out",ts_:"— not tested —",ts_yes:"Yes, it stops",ts_part:"It falls, does not stop",ts_no:"No",
 czAddD:"+ Direct cause",czAddC:"+ Contributing cause",czAddR:"+ Root cause",czNone:"No causes yet.",pProb:"The problem",
 personF:"Names a person only. Ask what in the process allowed it.",noTest:"The removal test is not answered.",testNo:"Removing it does not change the problem: this is not the root cause.",noEv:"Evidence needed to confirm.",
 personW:"One or more causes point at a person only (“human error”, “negligence”). Human error is a starting point: ask what in the process allowed it, then rewrite the cause so the organization can change it.",
 czSum:"{d} direct · {c} contributing · {r} root ({ok} confirmed and tested) · {o} ruled out",
 trEmpty:"Write the problem and at least one cause to draw the tree.",trP:"Problem",trD:"Direct causes",trC:"Contributing causes",trR:"Root causes",trLegConf:"Confirmed",trLegHyp:"Hypothesis",trLegOut:"Ruled out",trLegPf:"Names a person",
 sim_:"— choose —",sim_exist:"Similar cases exist",sim_could:"Could occur elsewhere",sim_none:"None, after checking",
 acCause:"Root cause",acT:"Action proposed",acOwner:"Owner",acAdd:"Add action",acNone:"No actions yet.",acMiss:"Root cause without an action with an owner: {c}",acCapa:"Open the CAPA tool",acCapaN:"No CAPA record linked yet: the plan with its dates and its follow-up belong in CAPA.",
 critPv:"Pareto analysis: {t}",
 cpOpen:"Open PDCA",pdFound:"PDCA cycle: {t}",pdMiss:"This cycle was not found in the PDCA tool in this browser.",pdHint:"Type the cycle number, such as PD-EX-03, if there is one.",pdOpen:"Open PDCA",
 caHint:"Type the CAPA record number, such as CA-EX-04, if there is one.",caMiss:"This record was not found in the CAPA tool in this browser.",caOpen:"Open CAPA",paHint:"Type the Pareto analysis number, such as PA-EX-02, if there is one.",paMiss:"This analysis was not found in the Pareto tool in this browser.",pcat_:"— choose the category —",
 pvCapa:"{id} · {ref} · {st} · {t}",pvPareto:"{id} · {st} · Vital few: {t}",pvFish:"{id} · {st} · Root cause: {t}",pvWhy5:"{id} · {st} · Root cause: {t}",pvNo:"not written yet",pvCat:"{c}: {v} {u} of {tot} ({s}%) · period {f} → {to}{vf}",pvVf:" · in the vital few",
 pvBa:"{id} · {st} · Before/after: {v}",baNone:"Not checked yet",v_imp:"Improved",v_same:"No clear change",v_worse:"Worse",
 nxMiss:"This id is not in the other tool in this browser.",nxNoData:"No data in that tool in this browser yet.",
 cst_react:"Reaction",cst_cause:"Cause analysis",cst_action:"Action",cst_verify:"Effectiveness check",cst_closed:"Closed",cst_reopened:"Reopened",
 pst_question:"Question",pst_data:"Data",pst_vital:"Vital few",pst_acted:"Next steps",pst_checked:"Effect checked",pst_reviewed:"Reviewed",
 fst_effect:"Effect defined",fst_causes:"Causes mapped",fst_selected:"Causes selected",fst_verified:"Root cause verified",fst_reviewed:"Reviewed",
 w5st_problem:"Problem defined",w5st_chain:"Chain of whys",w5st_root:"Root cause",w5st_tested:"Root cause tested",w5st_reviewed:"Reviewed",
 pu_count:"",pu_cost:"SAR",pu_hours:"hours",pu_sev:"points",
 stT:"Start from a CAPA record or a Pareto vital-few category (read-only)",stS:"The tool reads the CAPA records or Pareto analyses saved in this browser and shows them for review. Pick a record or a category to fill a new, unsaved investigation. Nothing is written to the other tools.",
 stSrc:"Source",stPrev:"Show the preview",ss_capa:"CAPA records",ss_pareto:"Pareto vital-few categories",stUse:"Start an investigation from it",
 stNone:"No data from this source in this browser.",stEmpty:"Nothing to start from in this source.",
 stColId:"Id",stColT:"Reference and title",stColSt:"Stage",stColRoot:"Root cause as written",stColN:"Existing investigations",stColA:"Action",stColCat:"Category",stColV:"Value and share",stColPer:"Period",stColNx:"Next step",
 stUsedC:"A new investigation was filled from CAPA record {id}. Check the problem against the facts, then save. Nothing was written to CAPA.",stUsedP:"A new investigation was filled from the category “{c}” of Pareto analysis {id}. Check the problem against the facts, then save. Nothing was written to Pareto.",
 pfRoot:"Root cause as written in the CAPA record (a hypothesis until proved): {t}",pfRaised:"CAPA record opened: {t}",pfReact:"Correction: {t}",pfMuch:"{v} {u} of {tot} ({s}%) in Pareto analysis {id}",
 hmT:"This browser holds something to start from: {c} open CAPA record(s) and {p} Pareto vital-few category(ies).",hmGo:"Start an investigation",
 e_title:"Enter a short title for the investigation.",e_rdate:"The review date cannot be before the investigation date.",e_num:"Case counts cannot be negative, and those with the problem cannot exceed the cases.",e_cdate:"The date the criterion was written cannot be after the review date.",
 exT:"Example data",exS:"Three illustrative investigations for a fictitious Saudi company (Al-Waha Contracting): rejected ready-mix concrete loads (CA-EX-04, started from the temperature category of Pareto PA-EX-02, with Fishbone FB-EX-02 and 5 Whys W5-EX-03, two root causes, a contract clause, and the criterion “below 3% rejected loads over July–August”), a dropped-load near miss during lifting at full depth with a barrier analysis, and a light investigation of superseded drawings (CA-EX-03 and FB-EX-03), plus self-assessment answers. The data is illustrative, not real, and loading it replaces all of this tool's data in your browser.",
 exLoad:"Load example",exClear:"Clear all data",exLoaded:"Example loaded: 3 investigations and the self-assessment answers.",exCleared:"All of this tool's data was removed from this browser.",
 exConfirmClear:"This deletes every RCA investigation and the self-assessment answers from this browser, and it cannot be undone.\n\nDo you want to continue?",
 dT:"Root cause investigations",dS:"Every investigation with its stage and flags. Open an investigation to edit it in the RCA investigation tab.",csv:"Export CSV",none:"No investigations yet. Start from the RCA investigation tab or load the example.",
 colRef:"Reference and title",colSrc:"Source and depth",colStage:"Stage",colProb:"Problem",colRoots:"Root causes",colMeth:"Methods",colFlags:"Flags",colAct:"Actions",open:"Open",del:"Delete",delArm:"Confirm delete",
 rootsN:"{ok} of {n} confirmed and tested",
 fl_prob:"Problem or requirement missing",fl_risk:"Risk not assessed",fl_low:"Depth below the required one without a reason",fl_tl:"Fewer than two facts in the timeline",fl_ev:"No evidence",fl_asm:"Assumptions not checked: {n}",fl_work:"No one who does the work",fl_meth:"Fewer methods than the depth needs",fl_cause:"Direct or root cause missing",fl_untested:"Root causes not confirmed or not tested: {n}",fl_person:"A cause names a person only",fl_sim:"Similar cases not considered",fl_act:"Root cause without an action: {n}",fl_own:"Action without an owner",fl_crit:"Effectiveness criterion incomplete",fl_capa:"Not linked to a CAPA record",fl_wait:"Waiting for review",fl_rev:"Reviewer is in the team",
 auT:"Automatic audit of investigations",auS:"These checks run on every investigation and show the gaps an auditor usually finds. “—” means the check does not apply yet at the investigation's stage or depth.",
 auRec:"Investigations audited",auPass:"Checks passed",auFail:"Investigations with gaps",auOpen:"Open items",auEmpty:"No investigations to audit yet.",
 c_ref:"Has reference",c_prob:"Problem in four parts with the requirement",c_depth:"Depth set, not lowered without a reason",c_tl:"Two facts or more in the timeline",c_ev:"Evidence register not empty",c_meth:"Methods enough for the depth",c_cause:"A direct and a root cause",c_root:"Every root cause confirmed and tested",c_person:"No root cause names a person only",c_sim:"Similar cases considered",c_act:"An action with an owner for each root cause",c_crit:"Criterion written before the action",c_rev:"Independent dated review",
 dashT:"Dashboard",dashS:"Figures calculated from the investigations and the self-assessment in this browser.",kTotal:"Total investigations",kRoot:"Root causes confirmed and tested",kCrit:"Criterion before the action",kFull:"Full-depth investigations",kRev:"Reviewed",kPerson:"Causes naming a person",kCapa:"Linked to a CAPA record",kOpen:"Open items",kAud:"Audit pass rate",kAs:"Self-assessment",
 byStage:"Stage distribution",byDepth:"Depth of investigation",byMeth:"Methods used",byAssess:"Self-assessment by group",openT:"Items that need follow-up",noOpen:"No open items.",noData:"No data yet.",dp_none:"Not set",
 oi_prob:"The problem is not written in four parts or without the requirement",oi_risk:"Severity or likelihood not set",oi_low:"Depth below the required one without a written reason",oi_tl:"Fewer than two proven facts in the timeline",oi_ev:"The evidence register is empty",oi_asm:"{n} assumption(s) in the timeline not checked",oi_work:"No one in the team does the work",oi_meth:"Fewer methods than the depth needs",oi_cause:"No direct cause and root cause written",oi_untested:"{n} root cause(s) not confirmed by evidence or not tested",oi_person:"A cause names a person only: ask what in the process allowed it",oi_sim:"Similar cases not considered",oi_act:"{n} root cause(s) without an action with an owner",oi_own:"A proposed action has no owner",oi_crit:"The effectiveness criterion is not complete or not written before the action",oi_capa:"The actions are not in a CAPA record yet",oi_wait:"Waiting for a review from outside the team",oi_rev:"The reviewer is a team member",
 rpT:"Investigation report",rpS:"HTML report downloaded to your device, which you can print or save as PDF from the browser; it draws the cause tree of each investigation. CSV for analysing the data in a spreadsheet.",rpHtml:"Download HTML report",rpNote:"The report carries the preparer's name “مدثر سلامه” and includes the cover and summary, each investigation with its cause tree, timeline, evidence register, methods with their ids, causes and tests, actions and effectiveness criterion, audit results, open items and the self-assessment.",rpPrev:"Quick preview",rpEmpty:"No investigations to export yet.",
 rpCover:"Root cause investigation report",rpProb:"Problem",rpRisk:"Risk and depth",rpTl:"Timeline of events",rpEv:"Evidence register",rpMeth:"Methods",rpCz:"Causes",rpAct:"Actions proposed",rpCrit:"Effectiveness criterion",rpAu:"Audit result",rpTree:"Cause tree",
 aiT:"AI Assistant — under construction",aiS:"This assistant will read the investigation and point out assumptions not yet proved, causes that name people and root causes not yet tested. It will not run before the shared platform engine is in place, and it will not show invented results.",
 aiList:["Suggest questions that turn “human error” into a cause in the process","Point out a root cause that no evidence supports","Compare the investigation with earlier ones on similar problems"],
 revW:"The reviewer is a team member. Choose someone from outside the team.",yes:"Yes",no:"No",scoreS:"Score"}
};

function t(k,v){ var d=UI[L]||UI.ar; var s=(d[k]!==undefined)?d[k]:(UI.ar[k]!==undefined?UI.ar[k]:k); if(v){ for(var x in v){ s=String(s).split("{"+x+"}").join(v[x]); } } return s; }
function esc(s){ return TBX.esc(s); }
function today(){ return TBX.today(); }
function txt(v){ return TBX.txt(v); }
function obj(v){ return (v&&typeof v==="object"&&!Array.isArray(v))?v:{}; }
function str(v){ return (v==null||typeof v==="object")?"":String(v); }
function isD(s){ return /^\d{4}-\d{2}-\d{2}$/.test(String(s||"")); }
function short(s,n){ s=txt(s).replace(/\s+/g," "); n=n||90; return s.length>n?s.slice(0,n-1)+"…":s; }
function arr(v){ return Array.isArray(v)?v.filter(function(x){ return x&&typeof x==="object"; }):[]; }
/* a count: a whole number of zero or more, or null when empty */
function cnt(v){ if(v===null||v===undefined||String(v).trim()==="") return null; var n=Number(String(v).replace(/,/g,"")); return (isFinite(n)&&n>=0)?Math.round(n):null; }
function cntRaw(v){ if(v===null||v===undefined||String(v).trim()==="") return null; var n=Number(String(v).replace(/,/g,"")); return isFinite(n)?n:NaN; }
function lvl15(v){ var n=parseInt(v,10); return (n>=1&&n<=5)?n:0; }
function fmtN(v){ return Number(v).toLocaleString("en-US",{maximumFractionDigits:2}); }
function dt(s){ return String(s||"").replace("T"," "); }

/* ---------- store ---------- */
function blankTm(){ return {n:"",role:"",work:false}; }
function blankTl(){ return {at:"",ev:"",src:"",kind:"fact"}; }
function blankEv(){ return {item:"",type:"rec",by:"",date:""}; }
function blankMe(){ return {how:"",ref:"",note:""}; }
function blankDa(){ return {g:"",n:null,k:null,note:""}; }
function blankBa(){ return {b:"",exp:"",act:"",res:""}; }
function blankCz(id,lvl){ return {id:id||"",lvl:lvl||"direct",t:"",ev:"",st:"hyp",test:"",p:""}; }
function blankAc(){ return {cause:"",t:"",owner:""}; }
function blank(){ return {id:"",title:"",ref:"",src:"ncr",capa:"",pdca:"",pareto:"",pcat:"",area:"",date:"",lead:"",
 prob:{what:"",where:"",when:"",much:"",req:""},risk:{sev:0,lik:0},depth:"",depthWhy:"",team:[],tl:[],evid:[],methods:[],data:[],barrier:[],
 causes:[],similar:"",similarNote:"",acts:[],crit:{what:"",where:"",period:"",date:"",before:false,pareto:""},review:{by:"",date:"",note:""},created:"",updated:""}; }
function pick(v,list){ return list.indexOf(v)>=0?v:""; }
function fixTm(m){ return {n:str(m.n),role:str(m.role),work:m.work===true}; }
function fixTl(x){ return {at:str(x.at),ev:str(x.ev),src:str(x.src),kind:x.kind==="asm"?"asm":"fact"}; }
function fixEv(x){ return {item:str(x.item),type:pick(x.type,EVT)||"rec",by:str(x.by),date:str(x.date)}; }
function fixMe(x){ return {how:pick(x.how,HOWS),ref:str(x.ref),note:str(x.note)}; }
function fixDa(x){ return {g:str(x.g),n:cnt(x.n),k:cnt(x.k),note:str(x.note)}; }
function fixBa(x){ return {b:str(x.b),exp:str(x.exp),act:str(x.act),res:pick(x.res,BRES)}; }
function fixCz(x){ return {id:str(x.id),lvl:pick(x.lvl,LVLS)||"direct",t:str(x.t),ev:str(x.ev),st:pick(x.st,CST)||"hyp",test:pick(x.test,TESTS),p:str(x.p)}; }
function fixAc(x){ return {cause:str(x.cause),t:str(x.t),owner:str(x.owner)}; }
/* an investigation saved with missing or broken parts gets empty ones, so rendering never throws; every cause gets an id */
function fixRec(r){
 ["id","title","ref","src","capa","pdca","pareto","pcat","area","date","lead","depth","depthWhy","similar","similarNote","created","updated"].forEach(function(k){ r[k]=str(r[k]); });
 if(SRCS.indexOf(r.src)<0) r.src="ncr";
 r.depth=pick(r.depth,DEPTHS); r.similar=pick(r.similar,SIMS);
 var p=obj(r.prob); r.prob={what:str(p.what),where:str(p.where),when:str(p.when),much:str(p.much),req:str(p.req)};
 var k=obj(r.risk); r.risk={sev:lvl15(k.sev),lik:lvl15(k.lik)};
 r.team=arr(r.team).map(fixTm); r.tl=arr(r.tl).map(fixTl); r.evid=arr(r.evid).map(fixEv); r.methods=arr(r.methods).map(fixMe);
 r.data=arr(r.data).map(fixDa); r.barrier=arr(r.barrier).map(fixBa); r.causes=arr(r.causes).map(fixCz); r.acts=arr(r.acts).map(fixAc);
 var used={}, n=0;
 r.causes.forEach(function(c){ var m=/^c(\d+)$/.exec(c.id); if(m&&!used[c.id]){ used[c.id]=1; n=Math.max(n,+m[1]); } else c.id=""; });
 r.causes.forEach(function(c){ if(!c.id){ n++; c.id="c"+n; used[c.id]=1; } });
 var c=obj(r.crit); r.crit={what:str(c.what),where:str(c.where),period:str(c.period),date:str(c.date),before:c.before===true,pareto:str(c.pareto)};
 var rv=obj(r.review); r.review={by:str(rv.by),date:str(rv.date),note:str(rv.note)};
 return r;
}
function load(){ return TBX.load(STORE,function(v){ if(!Array.isArray(v.records)) v.records=[]; v.records=v.records.filter(function(r){ return r&&typeof r==="object"; }); v.records.forEach(fixRec); if(!v.assess||typeof v.assess!=="object") v.assess={}; return v; },function(){ return {records:[],assess:{}}; }); }
function persist(){ return TBX.save(STORE,DB); }

/* ---------- the investigation's rules ---------- */
/* depth required by the grid: full when severity is 5 or the score is 15 or more; standard when severity is 4 or the score
   is 6 to 14; light below that. The team may raise the depth; a lower one needs a written reason. */
function reqDepth(r){ var s=r.risk.sev, l=r.risk.lik; if(!s||!l) return ""; var x=s*l; return (s===5||x>=15)?"full":((s===4||x>=6)?"std":"light"); }
function depOf(r){ return r.depth||reqDepth(r); }
function lowered(r){ var q=reqDepth(r); return !!q && !!r.depth && DEPTHS.indexOf(r.depth)<DEPTHS.indexOf(q); }
function depthOk(r){ return !!reqDepth(r) && (!lowered(r) || !!txt(r.depthWhy)); }
function probOk(r){ var p=r.prob; return !!(txt(p.what)&&txt(p.where)&&txt(p.when)&&txt(p.much)&&txt(p.req)); }
function facts(r){ return r.tl.filter(function(x){ return x.kind==="fact"&&txt(x.ev)&&txt(x.src); }).length; }
function asmN(r){ return r.tl.filter(function(x){ return x.kind==="asm"&&txt(x.ev); }).length; }
function evN(r){ return r.evid.filter(function(x){ return txt(x.item); }).length; }
function dataRows(r){ return r.data.filter(function(x){ return txt(x.g)&&x.n!==null&&x.n>0&&x.k!==null&&x.k<=x.n; }); }
function barRows(r){ return r.barrier.filter(function(x){ return txt(x.b)&&!!x.res; }); }
function metValid(m,r){ if(m.how==="data") return dataRows(r).length>0; if(m.how==="barrier") return barRows(r).length>0; return !!m.how&&!!txt(m.ref); }
function methList(r){ var seen={}, o=[]; r.methods.forEach(function(m){ var k=m.how+"|"+(m.how==="data"||m.how==="barrier"?"":txt(m.ref)); if(metValid(m,r)&&!seen[k]){ seen[k]=1; o.push(m); } }); return o; }
function hasData(r){ return methList(r).some(function(m){ return m.how==="data"||m.how==="pareto"; }); }
function needM(d){ return d==="full"?2:(d==="std"?1:0); }
function methOk(r){ var d=depOf(r), M=methList(r); return M.length>=needM(d) && (d!=="full"||hasData(r)); }
function live(r){ return r.causes.filter(function(c){ return txt(c.t)&&c.st!=="out"; }); }
function directs(r){ return live(r).filter(function(c){ return c.lvl==="direct"; }); }
function roots(r){ return live(r).filter(function(c){ return c.lvl==="root"; }); }
function rootOk(c){ return c.st==="conf" && !!txt(c.ev) && (c.test==="yes"||c.test==="part"); }
var PERSON=/(خطأ\s*(بشري|العامل|الموظف|الفني|المشغل|السائق|الشخص|الرافع|المشرف)|إهمال|اهمال|تقصير|عدم\s*(انتباه|الانتباه|تركيز|التركيز)|سهو|لامبالاة|human\s*error|operator\s*error|worker\s*error|staff\s*error|employee\s*error|rigger\s*error|driver\s*error|negligen|careless|inattent|not\s*paying\s*attention|lack\s*of\s*attention|complacen)/i;
function personOnly(s){ return PERSON.test(String(s||"")); }
function personCauses(r){ return live(r).filter(function(c){ return personOnly(c.t); }); }
function rootsOk(r){ var R=roots(r); return R.length>0 && R.every(rootOk) && !R.some(function(c){ return personOnly(c.t); }); }
function hasAct(r,c){ return r.acts.some(function(a){ return a.cause===c.id&&txt(a.t)&&txt(a.owner); }); }
function noAct(r){ return roots(r).filter(function(c){ return !hasAct(r,c); }); }
function critOk(r){ var c=r.crit; return !!(txt(c.what)&&txt(c.where)&&txt(c.period)&&isD(c.date)&&c.before); }
function names(r){ return r.team.map(function(m){ return txt(m.n).toLowerCase(); }).filter(Boolean); }
function revInTeam(r){ var b=txt(r.review.by).toLowerCase(); return !!b && names(r).indexOf(b)>=0; }
/* milestones, in order; the stage is the last one reached */
function stageOf(r){
 if(!(probOk(r)&&depthOk(r)&&facts(r)>=2&&evN(r)>=1)) return "problem";
 if(!(directs(r).length&&roots(r).length)) return "evidence";
 if(!(rootsOk(r)&&methOk(r))) return "causes";
 if(!(noAct(r).length===0&&critOk(r))) return "root";
 if(!(txt(r.review.by)&&isD(r.review.date))) return "actions";
 return "reviewed";
}
function stageName(s){ return t("st_"+s); }
function atLeast(r,s){ return STAGES.indexOf(stageOf(r))>=STAGES.indexOf(s); }
/* codes D1, C1, R1 by level and order, shown in the table, the tree and the report */
function codes(r){ var o={}, n={direct:0,contrib:0,root:0}; r.causes.forEach(function(c){ n[c.lvl]++; o[c.id]={direct:"D",contrib:"C",root:"R"}[c.lvl]+n[c.lvl]; }); return o; }
/* one list of what is still open in an investigation; flags (records) and open items (dashboard, report) read it */
function issues(r){
 var o=[], s=stageOf(r), R=roots(r), un=R.filter(function(c){ return !rootOk(c); }).length, na=noAct(r).length;
 if(!probOk(r)) o.push(["prob","warn",{}]);
 if(!reqDepth(r)) o.push(["risk","warn",{}]);
 if(lowered(r)&&!txt(r.depthWhy)) o.push(["low","bad",{}]);
 if(facts(r)<2) o.push(["tl","warn",{}]);
 if(!evN(r)) o.push(["ev","warn",{}]);
 if(asmN(r)) o.push(["asm","info",{n:asmN(r)}]);
 if(!r.team.some(function(m){ return m.work&&txt(m.n); })) o.push(["work","warn",{}]);
 if(atLeast(r,"evidence")&&reqDepth(r)&&!methOk(r)) o.push(["meth","warn",{}]);
 if(atLeast(r,"problem")&&s!=="problem"&&!(directs(r).length&&R.length)) o.push(["cause","warn",{}]);
 if(un) o.push(["untested","warn",{n:un}]);
 if(personCauses(r).length) o.push(["person","bad",{}]);
 if(atLeast(r,"causes")&&!r.similar) o.push(["sim","warn",{}]);
 if(atLeast(r,"causes")&&R.length&&na) o.push(["act","warn",{n:na}]);
 if(r.acts.some(function(a){ return txt(a.t)&&!txt(a.owner); })) o.push(["own","warn",{}]);
 if(atLeast(r,"causes")&&!critOk(r)) o.push(["crit","warn",{}]);
 if(atLeast(r,"root")&&!txt(r.capa)) o.push(["capa","info",{}]);
 if(s==="actions") o.push(["wait","info",{}]);
 if(revInTeam(r)) o.push(["rev","warn",{}]);
 return o;
}
function flagsOf(r){ return issues(r).map(function(x){ return [t("fl_"+x[0],x[2]),x[1]]; }); }
function openItems(){ var out=[]; DB.records.forEach(function(r){ issues(r).forEach(function(x){ out.push({r:r,k:x[1],s:t("oi_"+x[0],x[2])}); }); }); return out; }
function chip(x){ return '<span class="ca-chip '+x[1]+'">'+esc(x[0])+'</span>'; }

/* ---------- language and tabs ---------- */
function applyLang(){
 var keep=document.getElementById("hdrFields")&&document.getElementById("hdrFields").firstChild?formToRec():null;
 document.documentElement.lang=L; document.documentElement.dir=(L==="ar")?"rtl":"ltr";
 var d=UI[L]||UI.ar;
 document.querySelectorAll("[data-i]").forEach(function(el){ var k=el.getAttribute("data-i"); if(d[k]!==undefined) el.textContent=d[k]; });
 var ul=document.querySelector("[data-i-list]"); if(ul){ ul.innerHTML=d.aiList.map(function(x){ return "<li>"+esc(x)+"</li>"; }).join(""); }
 document.getElementById("langLabel").textContent=t("langSw");
 document.getElementById("langBtn").setAttribute("aria-label",t("langSwA"));
 document.getElementById("caDefs").innerHTML=d.defs.map(function(x){ return '<div style="--dc:'+x[3]+'"><b>'+esc(x[0])+'</b><code>'+esc(x[1])+'</code><span>'+esc(x[2])+'</span></div>'; }).join("");
 document.getElementById("caSteps").setAttribute("aria-label",t("colStage"));
 applyLogo(); buildRelated(); stSelects();
 document.title=TITLES[L]||TITLES.ar;
 try{ localStorage.setItem(LKEY,L); }catch(e){}
 if(window.CIAEX && CIAEX.ready){ if(CIAEX.renderStandard) CIAEX.renderStandard(); if(CIAEX.renderClauses) CIAEX.renderClauses(); }
 buildForm(); recToForm(keep||editing||blank(), true);
 if(ST) stPreview(true);
 cbLang();
 renderAll();
}
function switchLang(){ L=(L==="ar")?"en":"ar"; applyLang(); }
function go(id){
 if(TABS.indexOf(id)<0) id="home";
 curTab=id;
 document.querySelectorAll(".tabpane").forEach(function(p){ p.classList.toggle("on", p.getAttribute("data-tab")===id); });
 document.querySelectorAll("#side button[data-go]").forEach(function(b){ b.setAttribute("aria-selected", b.getAttribute("data-go")===id?"true":"false"); });
 if(location.hash!=="#"+id){ try{ history.replaceState(null,"","#"+id); }catch(e){} }
 if(id==="explain-std" && window.CIAEX && CIAEX.renderStandard) CIAEX.renderStandard();
 if(id==="explain-cl" && window.CIAEX && CIAEX.renderClauses) CIAEX.renderClauses();
 renderAll();
 if(id==="tools") autoSizeAll(document.getElementById("stages"));
 window.scrollTo(0,0);
}
document.addEventListener("click",function(e){
 var b=e.target.closest("[data-go]"); if(b && !b.closest("#cb")){ go(b.getAttribute("data-go")); }
});

/* ---------- other platform tools: inside the hub they open in the overlay, outside it in a new tab ---------- */
function inHub(){ try{ return window.self!==window.top && window.parent && typeof window.parent.ciaOpenFile==="function"; }catch(e){ return false; } }
function openTool(file,tab){
 if(inHub()){ try{ if(window.parent.ciaOpenFile(file)) return true; }catch(e){} }
 try{ window.open("./"+file+(tab?"#"+tab:""),"_blank","noopener"); }catch(e){}
 return false;
}
/* another tool on a given request: its own address outside the hub, its own one-time hint inside it */
function openWith(file,navKey,q,qs){
 if(inHub()){ try{ sessionStorage.setItem(navKey,JSON.stringify(q)); }catch(e){} try{ if(window.parent.ciaOpenFile(file)) return; }catch(e){} try{ sessionStorage.removeItem(navKey); }catch(e){} }
 try{ window.open("./"+file+(qs||"")+"#tools","_blank","noopener"); }catch(e){}
}
function qsOf(q){ return q.open?"?open="+encodeURIComponent(q.open):(q.capa?"?capa="+encodeURIComponent(q.capa):(q.pareto?"?pareto="+encodeURIComponent(q.pareto)+"&cat="+encodeURIComponent(q.cat||""):"")); }
function openFish(q){ openWith("fishbone.html",FISH_NAV,q,qsOf(q)); }
function openWhy5(q){ openWith("five-whys.html",WHY5_NAV,q,qsOf(q)); }
function openPareto(q){ openWith("pareto.html",PARETO_NAV,q,q.open?"?open="+encodeURIComponent(q.open):""); }
/* other tools' records saved in this browser (read only) */
function recsOf(key){ var S=TBX.read(key); if(!S) return null; return (Array.isArray(S.records)?S.records:[]).filter(function(r){ return r&&typeof r==="object"&&str(r.id); }); }
function pdcaCycles(){ return (recsOf(PDCA_KEY)||[]).map(function(r){ return {id:str(r.id),title:str(r.title)}; }); }
function byIdIn(key,id){ return (recsOf(key)||[]).filter(function(r){ return str(r.id)===id; })[0]||null; }
/* stages of the other tools, read with their own rules (capa.html, pareto.html, fishbone.html, five-whys.html: stageOf), for previews only */
function capaStage(r){
 var e=obj(r.eff), c=obj(r.close), im=obj(r.impl), cs=obj(r.cause), re=obj(r.react), a=(Array.isArray(r.actions)?r.actions:[]).filter(function(x){ return x&&typeof x==="object"; });
 if(e.result==="ineff") return "reopened"; if(txt(str(c.date))) return "closed";
 if(e.result==="eff"||txt(str(im.evidence))||(a.length&&a.every(function(x){ return x.st==="done"; }))) return "verify";
 if(txt(str(cs.root))) return "action"; if(txt(str(re.correction))||txt(str(re.containment))) return "cause"; return "react";
}
function why5Stage(w){
 var te=obj(w.test), rv=obj(w.review), ch=(Array.isArray(w.chains)?w.chains:[]).filter(function(c){ return c&&typeof c==="object"; });
 var tested=te.stop==="yes" && te.reads===true;
 if(tested && txt(str(rv.by)) && isD(rv.date)) return "reviewed"; if(tested) return "tested"; if(txt(str(w.root))) return "root";
 var m=ch[0]&&Array.isArray(ch[0].whys)?ch[0].whys:[]; if(m.some(function(x){ return x&&txt(str(x.a)); })) return "chain"; return "problem";
}
function fishItems(f){ var o=[]; (Array.isArray(f.bones)?f.bones:[]).forEach(function(b,bi){ (b&&Array.isArray(b.causes)?b.causes:[]).forEach(function(c){ if(!c||typeof c!=="object") return; [c].concat(Array.isArray(c.subs)?c.subs:[]).forEach(function(x){ if(x&&typeof x==="object"&&txt(str(x.t))) o.push({it:x,b:bi}); }); }); }); return o; }
function fishStage(f){
 var I=fishItems(f), S=I.filter(function(x){ return x.it.sel===true&&x.it.st!=="out"; }), rv=obj(f.review);
 var ver=function(x){ var v=obj(x.it.ver); return v.res==="conf" && ((v.how==="why5"&&!!txt(str(v.w5)))||(v.how!=="why5"&&!!txt(str(v.note)))); };
 var all=S.length>0&&S.every(ver), root=!!txt(str(f.root))&&f.test==="yes";
 if(all&&root&&txt(str(rv.by))&&isD(rv.date)) return "reviewed"; if(all&&root) return "verified"; if(S.length) return "selected"; if(I.length) return "causes"; return "effect";
}
/* Pareto's ranking and stage (pareto.html: ranked, isVital, stageOf): largest first, ties in entry order; a named category is on
   the line while the share before it is below the cut-off; the team's vf changes it; "Other" never joins the vital few */
function paNum(v){ var n=typeof v==="number"?v:parseFloat(v); return (isFinite(n)&&n>=0)?n:null; }
function paRank(p){
 var C=arr(p.cats), cut=Math.max(60,Math.min(90,parseInt(p.cut,10)||80)), rows=[];
 C.forEach(function(c,i){ var v=paNum(c.v); if(txt(str(c.name))||v!==null) rows.push({c:c,i:i,v:v===null?0:v}); });
 rows.sort(function(a,b){ return (b.v-a.v)||(a.i-b.i); });
 var ov=paNum(obj(p.other).v)||0, tot=rows.reduce(function(a,x){ return a+x.v; },0)+ov, cum=0;
 rows.forEach(function(x){ x.share=tot?x.v/tot*100:0; x.line=x.v>0&&tot>0&&cum/tot*100<cut-1e-9; cum+=x.v; x.vit=x.v>0&&(x.c.vf==="add"?true:(x.c.vf==="drop"?false:x.line)); });
 return {rows:rows,total:tot,ov:ov};
}
function paStage(p){
 var K=paRank(p), V=K.rows.filter(function(x){ return x.vit; }), af=obj(p.after), rv=obj(p.review);
 var withData=K.rows.filter(function(x){ return paNum(x.c.v)!==null&&paNum(x.c.v)>0; }).length;
 if(!txt(str(p.q))||withData<2) return "question";
 var why=K.rows.some(function(x){ return x.v>0&&((x.c.vf==="add"&&!x.line)||(x.c.vf==="drop"&&x.line))&&!txt(str(x.c.why)); });
 if(!(p.vconf===true&&V.length&&!why)) return "data";
 var lk=function(x){ var n=obj(x.c.nx); return ["fish","why5","capa","rca"].indexOf(n.how)>=0&&!!txt(str(n.ref)); };
 if(!V.every(lk)) return "vital";
 var vals=K.rows.filter(function(x){ return x.v>0; }).every(function(x){ return paNum(x.c.a)!==null; })&&(K.ov>0?paNum(obj(p.other).a)!==null:true);
 if(!(isD(af.from)&&isD(af.to)&&af.from<=af.to&&vals&&["imp","same","worse"].indexOf(af.verdict)>=0)) return "acted";
 if(!(txt(str(rv.by))&&isD(rv.date))) return "checked";
 return "reviewed";
}
function puName(u){ return t("pu_"+(["count","cost","hours","sev"].indexOf(u)>=0?u:"count")); }
function paCatInfo(pid,cid){
 var p=byIdIn(PARETO_KEY,pid); if(!p) return null;
 var K=paRank(p), x=K.rows.filter(function(z){ return str(z.c.id)===cid; })[0]; if(!x) return null;
 return {p:p,x:x,txt:t("pvCat",{c:str(x.c.name),v:fmtN(x.v),u:puName(p.unit),tot:fmtN(K.total),s:(Math.round(x.share*10)/10).toFixed(1),f:str(p.from)||"—",to:str(p.to)||"—",vf:x.vit?t("pvVf"):""}).replace("  "," ")};
}
function keyOf(how){ return how==="pareto"?PARETO_KEY:(how==="fish"?FISH_KEY:(how==="why5"?WHY5_KEY:CAPA_KEY)); }
function preview(how,id){
 if(how==="data"||how==="barrier") return t("meHere");
 if(HOWS.indexOf(how)<0) return "";
 var R=recsOf(keyOf(how));
 if(!id) return (R&&R.length)?"":t("nxNoData");
 var r=byIdIn(keyOf(how),id); if(!r) return t("nxMiss");
 if(how==="pareto"){ var V=paRank(r).rows.filter(function(x){ return x.vit; }).map(function(x){ return str(x.c.name); }); return t("pvPareto",{id:id,st:t("pst_"+paStage(r)),t:short(V.join(" · "),120)||t("pvNo")}); }
 if(how==="fish") return t("pvFish",{id:id,st:t("fst_"+fishStage(r)),t:short(str(r.root),110)||t("pvNo")});
 return t("pvWhy5",{id:id,st:t("w5st_"+why5Stage(r)),t:short(str(r.root),110)||t("pvNo")});
}
function capaPreview(id){ var c=byIdIn(CAPA_KEY,id); return c?t("pvCapa",{id:id,ref:str(c.ref)||"—",st:t("cst_"+capaStage(c)),t:short(str(c.title),90)}):null; }
function baPreview(id){ var p=byIdIn(PARETO_KEY,id); if(!p) return null; var af=obj(p.after), st=paStage(p);
 return t("pvBa",{id:id,st:t("pst_"+st),v:(["imp","same","worse"].indexOf(af.verdict)>=0&&(st==="checked"||st==="reviewed"))?t("v_"+af.verdict):t("baNone")}); }

/* ---------- the cause tree (inline SVG, mirrored for Arabic; the same drawing goes into the report) ---------- */
function wrapT(s,max,lines){
 var w=txt(s).replace(/\s+/g," ").split(" "), out=[], cur="";
 for(var i=0;i<w.length;i++){
  var x=w[i]; if(!x) continue;
  if(x.length>max) x=x.slice(0,max-1)+"…";
  if(!cur) cur=x; else if((cur+" "+x).length<=max) cur+=" "+x; else { out.push(cur); cur=x; if(out.length===lines) break; }
 }
 if(cur && out.length<lines) out.push(cur);
 var used=out.join(" ").replace(/…$/,"").length;
 if(out.length && used<txt(s).replace(/\s+/g," ").length-1 && !/…$/.test(out[out.length-1])){ var l=out[out.length-1]; out[out.length-1]=(l.length>=max?l.slice(0,max-1):l)+"…"; }
 return out;
}
/* the tree: the problem, then direct causes, then contributing, then root causes. A cause hangs under the cause it explains
   (field p); a contributing or root cause whose p is missing hangs under the first direct cause, or under the problem. */
function treeModel(r){
 var C=r.causes.filter(function(c){ return txt(c.t); }), by={}, D=C.filter(function(c){ return c.lvl==="direct"; });
 C.forEach(function(c){ by[c.id]=c; });
 var hasK=C.some(function(c){ return c.lvl==="contrib"; });
 var par=function(c){ if(c.lvl==="direct") return "P"; var p=by[c.p];
  if(c.lvl==="contrib") return (p&&p.lvl==="direct")?p.id:(D[0]?D[0].id:"P");
  return (p&&(p.lvl==="direct"||p.lvl==="contrib"))?p.id:(D[0]?D[0].id:"P"); };
 var kids={P:[]}; C.forEach(function(c){ kids[c.id]=[]; }); C.forEach(function(c){ kids[par(c)].push(c.id); });
 var order=function(a,b){ return LVLS.indexOf(by[a].lvl)-LVLS.indexOf(by[b].lvl); };
 Object.keys(kids).forEach(function(k){ kids[k].sort(order); });
 var colOf=function(id){ if(id==="P") return 0; var l=by[id].lvl; return l==="direct"?1:(l==="contrib"?2:(hasK?3:2)); };
 var nodes={}, slot=0;
 (function place(id){ var K=kids[id]||[]; K.forEach(place);
  var y=K.length?(nodes[K[0]].y+nodes[K[K.length-1]].y)/2:(slot++);
  nodes[id]={id:id,c:by[id]||null,col:colOf(id),y:y,kids:K}; })("P");
 return {nodes:nodes,slots:Math.max(1,slot),cols:hasK?4:3,n:C.length};
}
var FONT="font-family=\"'IBM Plex Sans Arabic','IBM Plex Sans',Calibri,Tahoma,sans-serif\"";
function stTag(c,lang){
 var a=lang==="ar";
 var s=c.st==="conf"?(a?"✓ مؤكد":"✓ confirmed"):(c.st==="out"?(a?"✗ مستبعد":"✗ ruled out"):(a?"؟ فرضية":"? hypothesis"));
 if(c.lvl==="root"&&c.st!=="out") s+=" · "+(a?"الاختبار: ":"test: ")+(c.test==="yes"?(a?"تتوقف":"stops"):(c.test==="part"?(a?"تقل":"falls"):(c.test==="no"?(a?"لا":"no"):"—")));
 return s;
}
function treeSVG(r,lang){
 lang=lang||L;
 var rtl=lang==="ar", M=treeModel(r), CD=codes(r);
 var bw=196, bh=74, gx=48, gy=14, m=14, top=36, rowH=bh+gy;
 var W=m*2+M.cols*bw+(M.cols-1)*gx, H=top+M.slots*rowH+6;
 var X=function(x){ return rtl?W-x:x; }, f=function(v){ return Math.round(v*10)/10; };
 var bx=function(n){ return m+n.col*(bw+gx); }, cy=function(n){ return top+n.y*rowH+bh/2; };
 var heads=[lang==="ar"?"المشكلة":"Problem",lang==="ar"?"الأسباب المباشرة":"Direct causes"].concat(M.cols===4?[lang==="ar"?"الأسباب المساهمة":"Contributing causes"]:[]).concat([lang==="ar"?"الأسباب الجذرية":"Root causes"]);
 var o=[];
 o.push('<svg xmlns="http://www.w3.org/2000/svg" class="rc-svg" viewBox="0 0 '+W+' '+H+'" width="'+W+'" height="'+H+'" role="img" aria-label="'+esc((lang==="ar"?"شجرة الأسباب: ":"Cause tree: ")+(txt(r.title)||"…"))+'" '+FONT+' direction="'+(rtl?"rtl":"ltr")+'">');
 o.push('<rect x="0" y="0" width="'+W+'" height="'+H+'" fill="#FFFFFF"/>');
 heads.forEach(function(h,i){ var x=m+i*(bw+gx)+bw/2; o.push('<text x="'+f(X(x))+'" y="20" fill="#4B5874" font-size="12" font-weight="700" text-anchor="middle">'+esc(h)+'</text>'); });
 if(!M.n){ o.push('<text x="'+f(W/2)+'" y="'+f(top+bh+10)+'" fill="#7A869E" font-size="13" text-anchor="middle">'+esc(lang==="ar"?"اكتب المشكلة وسبباً واحداً على الأقل ليظهر المخطط.":"Write the problem and at least one cause to draw the tree.")+'</text>'); }
 /* edges first, so the boxes sit on top */
 Object.keys(M.nodes).forEach(function(id){ var n=M.nodes[id]; n.kids.forEach(function(k){ var c=M.nodes[k], x1=bx(n)+bw, y1=cy(n), x2=bx(c), y2=cy(c), mx=x1+gx/2;
  var dash=c.c&&c.c.st==="out"?' stroke-dasharray="5 4"':'';
  o.push('<path d="M'+f(X(x1))+' '+f(y1)+' C'+f(X(mx))+' '+f(y1)+' '+f(X(x2-gx/2))+' '+f(y2)+' '+f(X(x2))+' '+f(y2)+'" fill="none" stroke="#9AA5B8" stroke-width="1.6"'+dash+'/>'); }); });
 Object.keys(M.nodes).forEach(function(id){
  var n=M.nodes[id], x=bx(n), y=cy(n)-bh/2, rx=rtl?W-x-bw:x, c=n.c;
  var lines, col, fill="#FFFFFF", tc="#1B2A4A", sw=2, dash="", tag="";
  if(id==="P"){ lines=wrapT(txt(r.prob.what)||txt(r.title)||"…",28,3); col="#1B2A4A"; fill="#1B2A4A"; tc="#FFFFFF"; tag=lang==="ar"?"المشكلة":"Problem"; }
  else { lines=wrapT(c.t,28,3); col=LCOL[c.lvl]; tag=(CD[c.id]||"")+" · "+stTag(c,lang);
   if(c.lvl==="root"){ sw=3; if(c.st==="conf"&&rootOk(c)) fill="#EEF6F1"; }
   if(c.st==="out"){ col="#9AA5B8"; fill="#F7F9FC"; tc="#7A869E"; dash=' stroke-dasharray="5 4"'; }
   if(personOnly(c.t)&&c.st!=="out"){ col="#B42318"; tag+=" · ⚠"; } }
  o.push('<g class="rc-node"><title>'+esc((id==="P"?(txt(r.prob.what)||r.title):((CD[c.id]||"")+" — "+c.t+(c.ev?" — "+c.ev:"")))||"")+'</title><rect x="'+f(rx)+'" y="'+f(y)+'" width="'+bw+'" height="'+bh+'" rx="9" fill="'+fill+'" stroke="'+col+'" stroke-width="'+sw+'"'+dash+'/>');
  var ty=y+16-(lines.length>2?2:0)+(3-lines.length)*6;
  lines.forEach(function(l,j){ o.push('<text x="'+f(rx+bw/2)+'" y="'+f(ty+j*15)+'" fill="'+tc+'" font-size="12" font-weight="'+(id==="P"||(c&&c.lvl==="root")?"700":"400")+'" text-anchor="middle">'+esc(l)+'</text>'); });
  o.push('<text x="'+f(rx+bw/2)+'" y="'+f(y+bh-8)+'" fill="'+(id==="P"?"#E9D8A6":(c.st==="conf"?"#2F7D4B":(c.st==="out"?"#7A869E":"#86520F")))+'" font-size="10.5" text-anchor="middle">'+esc(tag)+'</text></g>');
 });
 o.push('</svg>');
 return o.join("");
}
/* phones: the same tree as an indented list */
function treeListHTML(r){
 var M=treeModel(r), CD=codes(r);
 if(!M.n) return '<li><span class="nd pb"><small>'+esc(t("trP"))+'</small>'+esc(txt(r.prob.what)||txt(r.title)||"…")+'</span><p class="ca-hint" style="margin:6px 0 0">'+esc(t("trEmpty"))+'</p></li>';
 var item=function(id){ var n=M.nodes[id], c=n.c, inner;
  if(id==="P") inner='<span class="nd pb"><small>'+esc(t("trP"))+'</small>'+esc(txt(r.prob.what)||txt(r.title)||"…")+'</span>';
  else inner='<span class="nd '+c.lvl+(c.st==="out"?" out":"")+(c.st==="conf"?" conf":"")+'"><small><b dir="ltr">'+esc(CD[c.id]||"")+'</b> · '+esc(t("lv_"+c.lvl))+' · '+esc(stTag(c,L))+(personOnly(c.t)&&c.st!=="out"?' · ⚠':'')+'</small>'+esc(c.t)+'</span>';
  return '<li>'+inner+(n.kids.length?'<ul>'+n.kids.map(item).join("")+'</ul>':'')+'</li>'; };
 return item("P");
}
function legendHTML(){ return '<div class="rc-leg"><span><i style="border-color:#1B2A4A;background:#1B2A4A"></i>'+esc(t("trP"))+'</span><span><i style="border-color:#C2410C"></i>'+esc(t("lv_direct"))+'</span><span><i style="border-color:#C9821A"></i>'+esc(t("lv_contrib"))+'</span><span><i style="border-color:#1B2A4A;border-width:3px;background:#EEF6F1"></i>'+esc(t("lv_root"))+' · '+esc(t("trLegConf"))+'</span><span><i style="border-style:dashed"></i>'+esc(t("trLegOut"))+'</span><span><i style="border-color:#B42318"></i>'+esc(t("trLegPf"))+'</span></div>'; }
function renderTree(r){ var box=document.getElementById("rcTree"); if(!box) return; box.innerHTML='<div class="rc-svgw">'+treeSVG(r)+'</div>'+legendHTML()+'<ul class="rc-list">'+treeListHTML(r)+'</ul>'; }

/* ---------- risk grid ---------- */
function gridHTML(r){
 var o='<div><div class="rc-rg" role="img" aria-label="'+esc(t("f_sev")+" × "+t("f_lik"))+'">';
 for(var l=5;l>=1;l--){ o+='<span class="ax">'+l+'</span>';
  for(var s=1;s<=5;s++){ var q=reqDepth({risk:{sev:s,lik:l}}), on=r.risk.sev===s&&r.risk.lik===l; o+='<span class="'+({light:"rl",std:"rs",full:"rf"}[q])+(on?" on":"")+'" title="'+esc(t("f_sev")+" "+s+" × "+t("f_lik")+" "+l+" = "+(s*l)+" · "+t("dp_"+q))+'">'+(s*l)+'</span>'; } }
 o+='<span class="ax"></span>'; for(var s2=1;s2<=5;s2++) o+='<span class="ax">'+s2+'</span>';
 return o+'</div><p class="rc-rgcap">'+esc(t("rgSev"))+' · '+esc(t("rgLik"))+'</p></div>';
}

/* ---------- investigation form ---------- */
var HDR=[["title","tx",1],["ref","ltr",0],["src","sel_src",0],["capa","capa",0],["pareto","pareto",0],["pcat","pcat",0],["pdca","pdca",0],["date","date",0],["lead","tx",0],["area","tx",0]];
var PATH={title:"title",ref:"ref",src:"src",capa:"capa",pareto:"pareto",pcat:"pcat",pdca:"pdca",date:"date",lead:"lead",area:"area",
 what:"prob.what",where:"prob.where",when:"prob.when",much:"prob.much",req:"prob.req",sev:"risk.sev",lik:"risk.lik",depth:"depth",depthWhy:"depthWhy",
 similar:"similar",similarNote:"similarNote",cwhat:"crit.what",cwhere:"crit.where",cperiod:"crit.period",cdate:"crit.date",cpareto:"crit.pareto",rby:"review.by",rdate:"review.date",rnote:"review.note"};
function getP(r,p){ var a=p.split("."); return a.length>1?r[a[0]][a[1]]:r[a[0]]; }
function setP(r,p,v){ var a=p.split("."); if(a.length>1) r[a[0]][a[1]]=v; else r[a[0]]=v; }
function opts(list,prefix,cur){ return list.map(function(k){ return '<option value="'+k+'"'+(cur===k?" selected":"")+'>'+esc(t(prefix+k))+'</option>'; }).join(""); }
function fill(list){ return list.map(function(r){ return '<option value="'+esc(r[0])+'">'+esc(r[1])+'</option>'; }).join(""); }
function fieldHTML(name,kind,wide){
 var id="f-"+name, lab=t("f_"+name), inner="";
 if(kind==="ta") inner='<textarea id="'+id+'" rows="2"></textarea>';
 else if(kind==="date") inner='<input id="'+id+'" type="date">';
 else if(kind==="ltr") inner='<input id="'+id+'" type="text" dir="ltr">';
 else if(kind==="sel_src") inner='<select id="'+id+'">'+opts(SRCS,"src_")+'</select>';
 else if(kind==="sel_sev") inner='<select id="'+id+'">'+opts(["","1","2","3","4","5"],"sev_")+'</select>';
 else if(kind==="sel_lik") inner='<select id="'+id+'">'+opts(["","1","2","3","4","5"],"lik_")+'</select>';
 else if(kind==="sel_depth") inner='<select id="'+id+'">'+opts(["","light","std","full"],"dp_")+'</select>';
 else if(kind==="sel_sim") inner='<select id="'+id+'">'+opts(["","exist","could","none"],"sim_")+'</select>';
 else if(kind==="pdca") inner='<div class="ca-pd"><input id="'+id+'" type="text" dir="ltr" list="pdcaList" aria-describedby="pdInfo"><button class="pd-btn ghost" type="button" id="pdOpen">'+esc(t("pdOpen"))+'</button></div><datalist id="pdcaList"></datalist><div class="ca-pdinfo" id="pdInfo" aria-live="polite"></div>';
 else if(kind==="capa") inner='<div class="ca-pd"><input id="'+id+'" type="text" dir="ltr" list="capaList" aria-describedby="caInfo"><button class="pd-btn ghost" type="button" id="caOpen">'+esc(t("caOpen"))+'</button></div><datalist id="capaList"></datalist><div class="ca-pdinfo" id="caInfo" aria-live="polite"></div>';
 else if(kind==="pareto") inner='<input id="'+id+'" type="text" dir="ltr" list="paList" aria-describedby="paInfo"><datalist id="paList"></datalist><div class="ca-pdinfo" id="paInfo" aria-live="polite"></div>';
 else if(kind==="pcat") inner='<select id="'+id+'" aria-describedby="pcInfo"><option value="">'+esc(t("pcat_"))+'</option></select><div class="ca-pdinfo" id="pcInfo" aria-live="polite"></div>';
 else if(kind==="crpa") inner='<input id="'+id+'" type="text" dir="ltr" list="paList" aria-describedby="crInfo"><div class="ca-pdinfo" id="crInfo" aria-live="polite"></div>';
 else inner='<input id="'+id+'" type="text">';
 return '<div class="pd-f'+(wide?" wide":"")+'"><label for="'+id+'">'+esc(lab)+'</label>'+inner+'</div>';
}
function secHTML(k,col,inner){ return '<div class="pd-stage w5-sec" id="sec-'+k+'" style="--sc:'+col+'"><h3>'+esc(t("s"+k+"T"))+'</h3><p class="pd-sub">'+esc(t("s"+k+"S"))+'</p>'+inner+'</div>'; }
function tblHTML(name,cls,heads){ return '<div class="ca-actw"><table class="rc-tbl '+cls+'"><thead><tr>'+heads.map(function(h){ return '<th>'+(h?esc(h):'')+'</th>'; }).join("")+'</tr></thead><tbody id="'+name+'Rows"></tbody></table></div>'; }
function addBtn(name,lbl){ return '<button class="pd-btn ghost" type="button" data-add="'+name+'">+ '+esc(lbl)+'</button>'; }
function buildForm(){
 document.getElementById("hdrFields").innerHTML=HDR.map(function(f){ return fieldHTML(f[0],f[1],f[2]); }).join("");
 document.getElementById("stages").innerHTML=
  secHTML("Prob","#C2410C",'<div class="pd-fields">'+fieldHTML("what","ta",1)+fieldHTML("where","ta",0)+fieldHTML("when","ta",0)+fieldHTML("much","tx",1)+fieldHTML("req","ta",1)+'</div>')+
  secHTML("Risk","#B42318",'<div class="rc-grid"><div id="rcGrid"></div><div style="flex:1 1 300px"><div class="pd-fields">'+fieldHTML("sev","sel_sev",0)+fieldHTML("lik","sel_lik",0)+'</div><p style="margin:8px 0"><span id="reqBadge"></span> <span class="ca-hint" id="reqScore"></span></p><p class="ca-hint" id="reqDesc"></p><div class="pd-fields">'+fieldHTML("depth","sel_depth",0)+fieldHTML("depthWhy","tx",1)+'</div><div class="w5-warn w5-bad" id="lowWarn" role="note" hidden></div></div><p class="rc-rule" id="rcRule"></p></div>')+
  secHTML("Team","#7A869E",'<div class="ca-actw"><table class="w5-team"><thead><tr><th>'+esc(t("tmN"))+'</th><th>'+esc(t("tmRole"))+'</th><th>'+esc(t("tmWork"))+'</th><th><span class="sr">'+esc(t("tmDel"))+'</span></th></tr></thead><tbody id="teamRows"></tbody></table></div><p class="ca-hint" id="teamNone"></p><div class="w5-warn" id="workWarn" role="note" hidden></div><div class="rc-add">'+addBtn("team",t("tmAdd"))+'</div>')+
  secHTML("Tl","#3563C9",tblHTML("tl","rc-tl",[t("tlAt"),t("tlEv"),t("tlSrc"),t("tlKind"),""])+'<p class="ca-hint" id="tlNone"></p><div class="rc-add">'+addBtn("tl",t("tlAdd"))+'<button class="pd-btn ghost" type="button" id="tlSort">'+esc(t("tlSort"))+'</button><span class="ca-hint" id="tlSum"></span></div>')+
  secHTML("Ev","#3563C9",tblHTML("ev","rc-ev",[t("evItem"),t("evType"),t("evBy"),t("evDate"),""])+'<p class="ca-hint" id="evNone"></p><div class="rc-add">'+addBtn("ev",t("evAdd"))+'</div>')+
  secHTML("Meth","#1E8C93",tblHTML("me","rc-me",[t("meHow"),t("meRef"),t("meNote"),""])+'<p class="ca-hint" id="meNone"></p><div class="rc-add">'+addBtn("me",t("meAdd"))+'</div><p class="pa-sug" id="meSum"></p><p class="ca-hint" id="meHub" hidden></p>'+
   '<div id="daBox"><p class="rc-sub">'+esc(t("daT"))+'</p><p class="ca-hint" style="margin:0 0 4px">'+esc(t("daS"))+'</p>'+tblHTML("da","rc-da",[t("daG"),t("daN"),t("daK"),t("daR"),t("daNote"),""])+'<div class="rc-add">'+addBtn("da",t("daAdd"))+'</div></div>'+
   '<div id="baBox"><p class="rc-sub">'+esc(t("baT"))+'</p><p class="ca-hint" style="margin:0 0 4px">'+esc(t("baS"))+'</p>'+tblHTML("ba","rc-ba",[t("baB"),t("baExp"),t("baAct"),t("baRes"),""])+'<div class="rc-add">'+addBtn("ba",t("baAdd"))+'</div></div>')+
  secHTML("Cause","#1B2A4A",'<div class="rc-czl" id="czRows"></div>'+'<p class="ca-hint" id="czNone"></p><div class="rc-add"><button class="pd-btn ghost" type="button" data-czadd="direct">'+esc(t("czAddD"))+'</button><button class="pd-btn ghost" type="button" data-czadd="contrib">'+esc(t("czAddC"))+'</button><button class="pd-btn ghost" type="button" data-czadd="root">'+esc(t("czAddR"))+'</button></div><p class="pa-sug" id="czSum"></p><div class="w5-warn w5-bad" id="personWarn" role="note" hidden></div>')+
  secHTML("Tree","#B8901E",'<div class="rc-treew" id="rcTree"></div>')+
  secHTML("Sim","#7B5BB8",'<div class="pd-fields">'+fieldHTML("similar","sel_sim",0)+fieldHTML("similarNote","ta",1)+'</div>')+
  secHTML("Act","#C2410C",tblHTML("ac","rc-ac",[t("acCause"),t("acT"),t("acOwner"),""])+'<p class="ca-hint" id="acNone"></p><div class="rc-add">'+addBtn("ac",t("acAdd"))+'<button class="pd-btn ghost" type="button" id="acCapa">'+esc(t("acCapa"))+' ↗</button></div><div class="w5-warn" id="acWarn" role="note" hidden></div><p class="ca-hint" id="acCapaN" hidden></p>')+
  secHTML("Crit","#3C9A5F",'<div class="pd-fields">'+fieldHTML("cwhat","ta",1)+fieldHTML("cwhere","tx",0)+fieldHTML("cperiod","tx",0)+fieldHTML("cdate","date",0)+fieldHTML("cpareto","crpa",0)+'</div><label class="w5-chk rc-crit" for="f-cbefore"><input id="f-cbefore" type="checkbox"><span>'+esc(t("f_cbefore"))+'</span></label>')+
  secHTML("Rev","#3C9A5F",'<div class="pd-fields">'+fieldHTML("rby","tx",0)+fieldHTML("rdate","date",0)+fieldHTML("rnote","ta",1)+'</div><div class="w5-warn" id="rvWarn" hidden></div>');
 document.getElementById("rcRule").innerHTML=t("rule");
 fillLists();
}
function fillLists(){
 var dl=document.getElementById("pdcaList"); if(dl) dl.innerHTML=fill(pdcaCycles().map(function(c){ return [c.id,c.title]; }));
 var cl=document.getElementById("capaList"); if(cl) cl.innerHTML=fill((recsOf(CAPA_KEY)||[]).map(function(c){ return [str(c.id),str(c.ref)+" · "+str(c.title)]; }));
 var pl=document.getElementById("paList"); if(pl) pl.innerHTML=fill((recsOf(PARETO_KEY)||[]).map(function(p){ return [str(p.id),str(p.ref)+" · "+str(p.title)]; }));
}
/* ---- row tables: each field is [key, kind, label key]; kinds: tx, ta, num, dt, date, chk, sel:<LIST>:<prefix> ---- */
var LISTS={KINDS:KINDS,EVT:EVT,HOWS:[""].concat(HOWS),LVLS:LVLS,CST:CST,TESTS:[""].concat(TESTS),BRES:[""].concat(BRES)};
var TB={
 team:{blank:blankTm,f:[["n","tx","tmN"],["role","tx","tmRole"],["work","chk","tmWork"]]},
 tl:{key:"tl",blank:blankTl,f:[["at","dt","tlAt"],["ev","ta","tlEv"],["src","tx","tlSrc"],["kind","sel:KINDS:k_","tlKind"]]},
 ev:{key:"evid",blank:blankEv,f:[["item","ta","evItem"],["type","sel:EVT:ev_","evType"],["by","tx","evBy"],["date","date","evDate"]]},
 me:{key:"methods",blank:blankMe,f:[["how","sel:HOWS:how_","meHow"],["ref","ref","meRef"],["note","ta","meNote"]]},
 da:{key:"data",blank:blankDa,f:[["g","tx","daG"],["n","num","daN"],["k","num","daK"],["rate","rate","daR"],["note","tx","daNote"]]},
 ba:{key:"barrier",blank:blankBa,f:[["b","ta","baB"],["exp","ta","baExp"],["act","ta","baAct"],["res","sel:BRES:br_","baRes"]]},
 cz:{key:"causes",f:[["code","code","czCode"],["lvl","sel:LVLS:lv_","czLvl"],["t","ta","czT"],["ev","ta","czEv"],["st","sel:CST:cs_","czSt"],["test","sel:TESTS:ts_","czTest"],["p","par","czP"]]},
 ac:{key:"acts",blank:blankAc,f:[["cause","acause","acCause"],["t","ta","acT"],["owner","tx","acOwner"]]}
};
function vstr(v){ return v===null||v===undefined?"":String(v); }
function cellHTML(tb,f,row,i,r){
 var k=f[0], kind=f[1], lab=t(f[2])+" "+(i+1), id="r-"+tb+"-"+i+"-"+k, v=row[k], a=' id="'+id+'" data-k="'+k+'" aria-label="'+esc(lab)+'"';
 if(kind==="tx") return '<td'+(tb==="tl"?' class="rc-s"':(tb==="ac"?' class="rc-o"':(tb==="da"&&k==="g"?' class="rc-g"':'')))+'><input type="text"'+a+' value="'+esc(v)+'"></td>';
 if(kind==="ta") return '<td><textarea rows="1"'+a+'>'+esc(v)+'</textarea>'+(tb==="cz"&&k==="t"?'<span class="rc-flag" data-flag></span>':'')+'</td>';
 if(kind==="num") return '<td class="rc-n"><input type="number" min="0" step="1" inputmode="numeric"'+a+' value="'+esc(vstr(v))+'"></td>';
 if(kind==="dt") return '<td class="rc-t"><input type="datetime-local"'+a+' value="'+esc(v)+'"></td>';
 if(kind==="date") return '<td class="rc-d"><input type="date"'+a+' value="'+esc(v)+'"></td>';
 if(kind==="chk") return '<td style="text-align:center"><input type="checkbox"'+a+(v?" checked":"")+'></td>';
 if(kind==="rate") return '<td class="c" data-rate>'+esc(rateTxt(row))+'</td>';
 if(kind==="code") return '<td class="c" data-code dir="ltr"></td>';
 if(kind==="ref"){ var dis=row.how==="data"||row.how==="barrier"||!row.how; return '<td class="rc-r"><input type="text" dir="ltr"'+a+' list="'+id+'-l" value="'+esc(v)+'"'+(dis?" disabled":"")+'><datalist id="'+id+'-l">'+(row.how&&!dis?fill((recsOf(keyOf(row.how))||[]).map(function(z){ return [str(z.id),str(z.ref||"")+" · "+str(z.title)]; })):"")+'</datalist><div class="rc-pv" data-pv>'+esc(row.how?preview(row.how,txt(v)):"")+'</div><div class="rc-mb" data-mb></div></td>'; }
 if(kind==="par"||kind==="acause") return '<td class="'+(kind==="acause"?"rc-k":"rc-p")+'"><select'+a+' data-cur="'+esc(v)+'"></select></td>';
 var m=/^sel:(\w+):(\w+)$/.exec(kind); if(m){ var cls=(tb==="tl"||tb==="ev"||tb==="ba"||tb==="me")?' class="rc-k"':(tb==="cz"&&k==="lvl"?' class="rc-l"':(tb==="cz"?' class="rc-k"':''));
  return '<td'+cls+'><select'+a+'>'+opts(LISTS[m[1]],m[2],v)+'</select></td>'; }
 return '<td></td>';
}
function czRowHTML(row,i,r){
 var c=function(k){ var f=TB.cz.f.filter(function(x){ return x[0]===k; })[0]; return cellHTML("cz",f,row,i,r).replace(/^<td[^>]*>/,"").replace(/<\/td>$/,""); };
 var lab=function(k,key){ return '<label class="rc-l" for="r-cz-'+i+'-'+k+'">'+esc(t(key))+'</label>'; };
 return '<div class="rc-czr'+(row.st==="out"?" st-out":"")+'" data-row="'+i+'" data-cid="'+esc(row.id)+'" data-lvl="'+esc(row.lvl)+'"><div class="rc-cc" data-code dir="ltr"></div>'+
  '<div>'+lab("lvl","czLvl")+c("lvl")+'</div><div>'+lab("t","czT")+c("t")+'</div><div>'+lab("ev","czEv")+c("ev")+'</div>'+
  '<div class="rc-x"><button type="button" class="ca-x" data-rdel="cz:'+i+'" aria-label="'+esc(t("czDel"))+'" title="'+esc(t("czDel"))+'">✕</button></div>'+
  '<div class="rc-czm"><div>'+lab("st","czSt")+c("st")+'</div><div>'+lab("test","czTest")+c("test")+'</div><div>'+lab("p","czP")+c("p")+'</div></div></div>';
}
function rowHTML(tb,row,i,r){
 if(tb==="cz") return czRowHTML(row,i,r);
 var extra=tb==="cz"?' data-cid="'+esc(row.id)+'" data-lvl="'+esc(row.lvl)+'"'+(row.st==="out"?' class="st-out"':''):(tb==="tl"?' class="'+row.kind+'"':'');
 return '<tr data-row="'+i+'"'+extra+'>'+TB[tb].f.map(function(f){ return cellHTML(tb,f,row,i,r); }).join("")+'<td class="rc-x"><button type="button" class="ca-x" data-rdel="'+tb+':'+i+'" aria-label="'+esc(t(tb==="cz"?"czDel":"tmDel"))+'" title="'+esc(t(tb==="cz"?"czDel":"tmDel"))+'">✕</button></td></tr>';
}
function renderTbl(tb,list,r){
 var box=document.getElementById(tb==="team"?"teamRows":tb+"Rows"); if(!box) return;
 if(tb==="team"){ box.innerHTML=list.map(function(m,i){ return '<tr data-row="'+i+'"><td><input data-k="n" type="text" value="'+esc(m.n)+'" aria-label="'+esc(t("tmN"))+'"></td><td><input data-k="role" type="text" value="'+esc(m.role)+'" aria-label="'+esc(t("tmRole"))+'"></td><td style="text-align:center"><input data-k="work" type="checkbox"'+(m.work?" checked":"")+' aria-label="'+esc(t("tmWork"))+'"></td><td><button type="button" class="ca-x" data-rdel="team:'+i+'" aria-label="'+esc(t("tmDel"))+'" title="'+esc(t("tmDel"))+'">✕</button></td></tr>'; }).join(""); }
 else box.innerHTML=list.map(function(x,i){ return rowHTML(tb,x,i,r); }).join("");
 var none={team:"teamNone",tl:"tlNone",ev:"evNone",me:"meNone",cz:"czNone",ac:"acNone"}[tb], nl={team:"tmNone",tl:"tlNone",ev:"evNone",me:"meNone",cz:"czNone",ac:"acNone"}[tb];
 if(none){ var ne=document.getElementById(none); if(ne) ne.textContent=list.length?"":t(nl); }
 autoSizeAll(box);
}
function readTbl(tb){
 var box=document.getElementById(tb==="team"?"teamRows":tb+"Rows"); if(!box) return [];
 return [].map.call(box.querySelectorAll("[data-row]"),function(tr){
  var o=tb==="cz"?{id:tr.getAttribute("data-cid")}:{};
  TB[tb].f.forEach(function(f){ var k=f[0], el=tr.querySelector('[data-k="'+k+'"]'); if(!el) return;
   if(f[1]==="chk") o[k]=!!el.checked; else if(f[1]==="num") o[k]=cnt(el.value); else if(el.tagName==="SELECT"&&(f[1]==="par"||f[1]==="acause")) o[k]=el.value||el.getAttribute("data-cur")||""; else o[k]=txt(el.value); });
  return o;
 });
}
function rateTxt(x){ var n=cnt(x.n), k=cnt(x.k); return (n&&k!==null&&k<=n)?(Math.round(k/n*1000)/10).toFixed(1)+"%":"—"; }
function autoSize(el){ if(!el||el.tagName!=="TEXTAREA") return; el.style.height="auto"; if(el.scrollHeight) el.style.height=(el.scrollHeight+2)+"px"; }
function autoSizeAll(root){ if(root) root.querySelectorAll("textarea").forEach(autoSize); }
var KEYTB={team:"team",tl:"tl",ev:"evid",me:"methods",da:"data",ba:"barrier",cz:"causes",ac:"acts"};
function negInput(){ return [].some.call(document.querySelectorAll('#daRows [data-k="n"], #daRows [data-k="k"]'),function(e){ var n=cntRaw(e.value); return n!==null && (isNaN(n)||n<0); })||
 [].some.call(document.querySelectorAll("#daRows tr[data-row]"),function(tr){ var n=cnt(tr.querySelector('[data-k="n"]').value), k=cnt(tr.querySelector('[data-k="k"]').value); return n!==null&&k!==null&&k>n; }); }
/* the record as it would be saved: empty rows dropped */
function formToRec(){
 var r=blank();
 Object.keys(PATH).forEach(function(k){ var el=document.getElementById("f-"+k); if(el) setP(r,PATH[k],txt(el.value)); });
 r.risk.sev=lvl15(r.risk.sev); r.risk.lik=lvl15(r.risk.lik);
 var cb=document.getElementById("f-cbefore"); r.crit.before=!!(cb&&cb.checked);
 if(document.getElementById("teamRows")){
  r.team=readTbl("team").map(fixTm).filter(function(m){ return m.n||m.role; });
  r.tl=readTbl("tl").map(fixTl).filter(function(x){ return x.at||x.ev||x.src; });
  r.evid=readTbl("ev").map(fixEv).filter(function(x){ return x.item||x.by||x.date; });
  r.methods=readTbl("me").map(fixMe).filter(function(x){ return x.how||x.ref||x.note; });
  r.data=readTbl("da").map(fixDa).filter(function(x){ return x.g||x.n!==null||x.k!==null||x.note; });
  r.barrier=readTbl("ba").map(fixBa).filter(function(x){ return x.b||x.exp||x.act||x.res; });
  r.causes=readTbl("cz").map(fixCz).filter(function(x){ return x.t||x.ev; });
  r.acts=readTbl("ac").map(fixAc).filter(function(x){ return x.t||x.owner; });
 }
 r.id=document.getElementById("rid").value;
 if(editing&&editing.id===r.id){ r.created=editing.created||""; }
 fixRec(r);
 return r;
}
/* while typing, the record keeps every row (even empty ones) so the tables keep their shape */
function formRaw(){
 var o={}; Object.keys(KEYTB).forEach(function(tb){ o[tb]=readTbl(tb); }); return o;
}
function recToForm(r,keepMsg){
 r=fixRec(JSON.parse(JSON.stringify(r)));
 document.getElementById("rid").value=r.id||"";
 Object.keys(PATH).forEach(function(k){ var el=document.getElementById("f-"+k); if(!el) return; var v=getP(r,PATH[k]); v=(v===0||v===null||v===undefined)?"":String(v);
  if(k==="pcat"){ pcatOptions(r.pareto,v); return; } el.value=v||(el.tagName==="SELECT"&&el.options.length?el.options[0].value:""); });
 document.getElementById("f-cbefore").checked=r.crit.before;
 renderTbl("team",r.team); renderTbl("tl",r.tl,r); renderTbl("ev",r.evid,r); renderTbl("me",r.methods,r); renderTbl("da",r.data,r); renderTbl("ba",r.barrier,r); renderTbl("cz",r.causes,r); renderTbl("ac",r.acts,r);
 if(!keepMsg){ ["recErr","recOk"].forEach(function(id){ var e=document.getElementById(id); if(e) e.textContent=""; }); }
 refreshForm();
}
function loadRecordIntoForm(r){ editing=fixRec(JSON.parse(JSON.stringify(r))); recToForm(editing); }
function clearForm(){ editing=null; recToForm(blank()); }
function pcatOptions(pid,cur){
 var el=document.getElementById("f-pcat"); if(!el) return;
 var p=pid?byIdIn(PARETO_KEY,pid):null, K=p?paRank(p).rows:[], sig=(pid||"")+"|"+K.map(function(x){ return str(x.c.id)+":"+str(x.c.name)+":"+(x.vit?1:0); }).join(",");
 if(cur===undefined) cur=el.value||el.getAttribute("data-cur")||"";
 if(el.getAttribute("data-sig")!==sig){
  el.innerHTML='<option value="">'+esc(t("pcat_"))+'</option>'+K.map(function(x){ return '<option value="'+esc(str(x.c.id))+'">'+esc((x.vit?"★ ":"")+str(x.c.name))+'</option>'; }).join("")+(cur&&!K.some(function(x){ return str(x.c.id)===cur; })?'<option value="'+esc(cur)+'">'+esc(cur)+'</option>':'');
  el.setAttribute("data-sig",sig);
 }
 el.value=cur; el.setAttribute("data-cur",cur);
}
/* the parts that depend on other rows are updated in place, so typing never loses focus */
function selOptions(el,list){ var cur=el.getAttribute("data-sig")?el.value:(el.getAttribute("data-cur")||""), sig=JSON.stringify(list); if(el.getAttribute("data-sig")!==sig){ el.innerHTML=list.map(function(o){ return '<option value="'+esc(o[0])+'">'+esc(o[1])+'</option>'; }).join(""); el.setAttribute("data-sig",sig); }
 if(list.some(function(o){ return o[0]===cur; })) el.value=cur; else { el.value=list.length?list[0][0]:""; } el.setAttribute("data-cur",el.value); }
function refreshForm(){
 var r=formToRec(), st=stageOf(r), raw=formRaw();
 var el=document.getElementById("curStage"); if(el) el.textContent=t("cur")+" "+stageName(st);
 var ci=STAGES.indexOf(st);
 document.getElementById("caSteps").innerHTML=STAGES.map(function(s,i){ var cls=i<ci?"done":(i===ci?(st==="reviewed"?"done":"cur"):""); return '<li class="'+cls+'" style="--sc:'+SCOL[s]+'"'+(i===ci?' aria-current="step"':'')+'><i aria-hidden="true"></i>'+esc(stageName(s))+'</li>'; }).join("");
 /* risk and depth */
 document.getElementById("rcGrid").innerHTML=gridHTML(r);
 var q=reqDepth(r), b=document.getElementById("reqBadge");
 b.className="rc-req "+(q||"none"); b.textContent=t("reqL")+" "+(q?t("dp_"+q):t("reqNone"));
 document.getElementById("reqScore").textContent=q?t("scoreL",{s:r.risk.sev*r.risk.lik}):"";
 document.getElementById("reqDesc").textContent=depOf(r)?t("dpd_"+depOf(r)):"";
 var low=lowered(r), lw=document.getElementById("lowWarn"); lw.hidden=!(low&&!txt(r.depthWhy)); lw.textContent=(low&&!txt(r.depthWhy))?t("lowW"):"";
 var dw=document.getElementById("f-depthWhy"); if(dw) dw.closest(".pd-f").style.display=(low||txt(r.depthWhy))?"":"none";
 /* team */
 var ww=document.getElementById("workWarn"), nowork=r.team.length>0&&!r.team.some(function(m){ return m.work&&txt(m.n); }); ww.hidden=!nowork; ww.textContent=nowork?t("workW"):"";
 /* timeline */
 document.querySelectorAll("#tlRows tr[data-row]").forEach(function(tr){ var k=tr.querySelector('[data-k="kind"]'); tr.className=k?k.value:""; });
 document.getElementById("tlSum").textContent=r.tl.length?t("tlFacts",{f:facts(r),a:asmN(r)}):"";
 /* methods: previews and buttons per row */
 var hub=inHub();
 document.querySelectorAll("#meRows tr[data-row]").forEach(function(tr){ var how=tr.querySelector('[data-k="how"]').value, ref=txt(tr.querySelector('[data-k="ref"]').value), pv=tr.querySelector("[data-pv]"), mb=tr.querySelector("[data-mb]"), i=tr.getAttribute("data-row");
  if(pv) pv.textContent=how?preview(how,ref):"";
  if(mb){ var h="";
   if(how==="fish") h=(ref?'':'<button class="pd-btn ghost" type="button" data-mestart="fish">'+esc(t("meStartFish"))+' ↗</button>');
   else if(how==="why5") h=(ref?'':'<button class="pd-btn ghost" type="button" data-mestart="why5">'+esc(t("meStart5"))+' ↗</button>');
   else if(how==="pareto") h=(ref?'':'<button class="pd-btn ghost" type="button" data-mestart="pareto">'+esc(t("meOpenPa"))+' ↗</button>');
   if(ref&&(how==="fish"||how==="why5"||how==="pareto")) h+='<button class="pd-btn ghost" type="button" data-meopen="'+esc(how)+'" data-ref="'+esc(ref)+'">'+esc(t("meOpen"))+' ↗</button>';
   if(mb.getAttribute("data-h")!==h){ mb.innerHTML=h; mb.setAttribute("data-h",h); } } });
 var mh=document.getElementById("meHub"); if(mh){ mh.hidden=!hub; mh.textContent=hub?t("meHub"):""; }
 var d=depOf(r), M=methList(r), ms=document.getElementById("meSum");
 if(ms) ms.textContent=d?(methOk(r)?t("meOk"):t("meNeed",{d:t("dp_"+d),n:needM(d),x:d==="full"?t("meNeedX"):"",m:M.length})):"";
 var hasHow=function(h){ return raw.me.some(function(x){ return x.how===h; }); };
 document.getElementById("daBox").hidden=!(hasHow("data")||raw.da.length);
 document.getElementById("baBox").hidden=!(hasHow("barrier")||raw.ba.length);
 document.querySelectorAll("#daRows tr[data-row]").forEach(function(tr){ var c=tr.querySelector("[data-rate]"); if(c) c.textContent=rateTxt({n:tr.querySelector('[data-k="n"]').value,k:tr.querySelector('[data-k="k"]').value}); });
 /* causes: codes, parent lists, flags */
 var CD={}, cn={direct:0,contrib:0,root:0}, rows=[].slice.call(document.querySelectorAll("#czRows [data-row]"));
 var info=rows.map(function(tr){ var lv=tr.querySelector('[data-k="lvl"]').value; cn[lv]++; var code={direct:"D",contrib:"C",root:"R"}[lv]+cn[lv], id=tr.getAttribute("data-cid"); CD[id]=code;
  return {tr:tr,id:id,lvl:lv,code:code,t:txt(tr.querySelector('[data-k="t"]').value),st:tr.querySelector('[data-k="st"]').value,test:tr.querySelector('[data-k="test"]').value,ev:txt(tr.querySelector('[data-k="ev"]').value)}; });
 info.forEach(function(x){
  x.tr.setAttribute("data-lvl",x.lvl); x.tr.classList.toggle("st-out",x.st==="out");
  var cc=x.tr.querySelector("[data-code]"); if(cc) cc.textContent=x.code;
  var ps=x.tr.querySelector('[data-k="p"]');
  if(ps){ var cand=x.lvl==="direct"?[["",t("pProb")]]:info.filter(function(y){ return y.id!==x.id&&(y.lvl==="direct"||(x.lvl==="root"&&y.lvl==="contrib")); }).map(function(y){ return [y.id,y.code+" · "+short(y.t,40)]; });
   if(x.lvl!=="direct"&&!cand.length) cand=[["",t("pProb")]];
   selOptions(ps,cand); ps.disabled=x.lvl==="direct"; }
  var ts=x.tr.querySelector('[data-k="test"]'); if(ts) ts.disabled=x.lvl!=="root";
  var fl=x.tr.querySelector("[data-flag]"), msg=[];
  if(x.t&&x.st!=="out"&&personOnly(x.t)) msg.push(t("personF"));
  if(x.lvl==="root"&&x.t&&x.st!=="out"){ if(x.st==="conf"&&!x.ev) msg.push(t("noEv")); if(!x.test) msg.push(t("noTest")); else if(x.test==="no") msg.push(t("testNo")); }
  if(fl) fl.textContent=msg.join(" ");
  x.tr.classList.toggle("rc-pf",!!x.t&&x.st!=="out"&&personOnly(x.t));
 });
 var R=roots(r);
 document.getElementById("czSum").textContent=r.causes.length?t("czSum",{d:directs(r).length,c:live(r).filter(function(c){ return c.lvl==="contrib"; }).length,r:R.length,ok:R.filter(rootOk).length,o:r.causes.filter(function(c){ return c.st==="out"; }).length}):"";
 var pc=personCauses(r).length, pw=document.getElementById("personWarn"); pw.hidden=!pc; pw.textContent=pc?t("personW"):"";
 renderTree(r);
 /* actions: the root-cause list of each row */
 var rootOpts=info.filter(function(x){ return x.lvl==="root"&&x.t&&x.st!=="out"; }).map(function(x){ return [x.id,x.code+" · "+short(x.t,50)]; });
 document.querySelectorAll('#acRows [data-k="cause"]').forEach(function(s){ selOptions(s,[["","—"]].concat(rootOpts)); });
 var na=noAct(r), aw=document.getElementById("acWarn"); aw.hidden=!(na.length&&R.length); aw.textContent=(na.length&&R.length)?t("acMiss",{c:na.map(function(c){ return CD[c.id]||c.id; }).join("، ")}):"";
 var an=document.getElementById("acCapaN"); an.hidden=!!txt(r.capa)||!r.acts.length; an.textContent=an.hidden?"":t("acCapaN");
 /* criterion and review */
 var cri=document.getElementById("crInfo"); if(cri){ cri.textContent=r.crit.pareto?(baPreview(r.crit.pareto)||t("paMiss")):""; }
 var vw=document.getElementById("rvWarn"); if(vw){ var ri=revInTeam(r); vw.hidden=!ri; vw.textContent=ri?t("revW"):""; }
 /* links in the header */
 var pi=document.getElementById("pdInfo"); if(pi){ if(!r.pdca) pi.textContent=t("pdHint"); else { var p=pdcaCycles().filter(function(x){ return x.id===r.pdca; })[0]; pi.textContent=p?t("pdFound",{t:p.title||p.id}):t("pdMiss"); } }
 var ca=document.getElementById("caInfo"); if(ca){ ca.textContent=r.capa?(capaPreview(r.capa)||t("caMiss")):t("caHint"); }
 pcatOptions(r.pareto);
 var pa=document.getElementById("paInfo"); if(pa){ var pp=r.pareto?byIdIn(PARETO_KEY,r.pareto):null; pa.textContent=r.pareto?(pp?preview("pareto",r.pareto):t("paMiss")):t("paHint"); }
 var pcI=document.getElementById("pcInfo"); if(pcI){ var ci2=(r.pareto&&r.pcat)?paCatInfo(r.pareto,r.pcat):null; pcI.textContent=ci2?ci2.txt:""; }
}
function validate(r){
 if(!r.title) return t("e_title");
 if(negInput()) return t("e_num");
 if(isD(r.date)&&isD(r.review.date)&&r.review.date<r.date) return t("e_rdate");
 if(isD(r.crit.date)&&isD(r.review.date)&&r.crit.date>r.review.date) return t("e_cdate");
 return "";
}
function newId(r){
 var y=(isD(r.date)?r.date:today()).slice(0,4), pre="RC-"+y+"-";
 var n=DB.records.map(function(x){ return x.id; }).filter(function(id){ return id.indexOf(pre)===0; }).map(function(id){ return parseInt(id.slice(pre.length),10); }).filter(function(x){ return !isNaN(x); });
 return pre+String((n.length?Math.max.apply(null,n):0)+1).replace(/^(\d)$/,"00$1").replace(/^(\d\d)$/,"0$1");
}
function saveRecord(){
 var r=formToRec(), err=validate(r);
 var errEl=document.getElementById("recErr"), okEl=document.getElementById("recOk");
 okEl.textContent="";
 if(err){ errEl.textContent=err; return false; }
 errEl.textContent="";
 var now=new Date().toISOString();
 if(!r.id){ r.id=newId(r); r.created=now; DB.records.unshift(r); }
 else { var i=DB.records.findIndex(function(x){ return x.id===r.id; }); if(i>=0){ r.created=DB.records[i].created||r.created||now; DB.records[i]=r; } else { r.created=r.created||now; DB.records.unshift(r); } }
 r.updated=now;
 editing=fixRec(JSON.parse(JSON.stringify(r)));
 document.getElementById("rid").value=r.id;
 var ok=persist();
 if(ok) okEl.textContent=t("ok_rec")+" · "+r.id; else errEl.textContent=t("savedFail");
 renderAll();
 return ok;
}

/* ---------- start from a CAPA record or a Pareto vital-few category (read only, preview first) ---------- */
function stSelects(){ var s=document.getElementById("stSrc"); if(!s) return; var cur=s.value||"capa"; s.innerHTML=opts(["capa","pareto"],"ss_",cur); }
function stRows(src){
 if(src==="capa"){ var C=recsOf(CAPA_KEY); if(!C) return null; return C.map(function(c){ return {k:"capa",c:c}; }); }
 var P=recsOf(PARETO_KEY); if(!P) return null; var o=[];
 P.forEach(function(p){ var K=paRank(p); K.rows.filter(function(x){ return x.vit; }).forEach(function(x){ o.push({k:"pareto",p:p,x:x,tot:K.total}); }); });
 return o;
}
function stPreview(keep){
 var src=document.getElementById("stSrc").value||"capa", msg=document.getElementById("stMsg"), box=document.getElementById("stTable"), R=stRows(src);
 if(!R){ ST=null; box.hidden=true; msg.textContent=t("stNone"); return; }
 if(!R.length){ ST=null; box.hidden=true; msg.textContent=t("stEmpty"); return; }
 ST={src:src}; if(!keep) msg.textContent="";
 box.hidden=false;
 if(src==="capa") box.innerHTML='<table class="pd-tbl"><thead><tr><th>'+esc(t("stColId"))+'</th><th>'+esc(t("stColT"))+'</th><th>'+esc(t("stColSt"))+'</th><th>'+esc(t("stColRoot"))+'</th><th>'+esc(t("stColN"))+'</th><th>'+esc(t("stColA"))+'</th></tr></thead><tbody>'+
  R.map(function(x){ var c=x.c, id=str(c.id), n=DB.records.filter(function(r){ return r.capa===id; }).length;
   return '<tr><td><b dir="ltr">'+esc(id)+'</b></td><td><b dir="ltr">'+esc(str(c.ref))+'</b><br>'+esc(str(c.title))+'</td><td>'+esc(t("cst_"+capaStage(c)))+'</td><td>'+esc(short(str(obj(c.cause).root),90)||"—")+'</td><td>'+n+'</td><td><button class="pd-rowbtn" type="button" data-stcapa="'+esc(id)+'">'+esc(t("stUse"))+'</button></td></tr>'; }).join("")+'</tbody></table>';
 else box.innerHTML='<table class="pd-tbl"><thead><tr><th>'+esc(t("stColId"))+'</th><th>'+esc(t("stColCat"))+'</th><th>'+esc(t("stColV"))+'</th><th>'+esc(t("stColPer"))+'</th><th>'+esc(t("stColNx"))+'</th><th>'+esc(t("stColN"))+'</th><th>'+esc(t("stColA"))+'</th></tr></thead><tbody>'+
  R.map(function(z){ var p=z.p, x=z.x, id=str(p.id), cid=str(x.c.id), nx=obj(x.c.nx), n=DB.records.filter(function(r){ return r.pareto===id&&r.pcat===cid; }).length;
   return '<tr><td><b dir="ltr">'+esc(id)+'</b><br><small>'+esc(short(str(p.title),70))+'</small></td><td>'+esc(str(x.c.name))+'</td><td dir="ltr">'+esc(fmtN(x.v)+(puName(p.unit)?" "+puName(p.unit):"")+" · "+(Math.round(x.share*10)/10).toFixed(1)+"%")+'</td><td dir="ltr">'+esc((str(p.from)||"—")+" → "+(str(p.to)||"—"))+'</td><td dir="ltr">'+esc(nx.how?(str(nx.how)+" "+str(nx.ref)).trim():"—")+'</td><td>'+n+'</td><td><button class="pd-rowbtn" type="button" data-stpa="'+esc(id)+'" data-cat="'+esc(cid)+'">'+esc(t("stUse"))+'</button></td></tr>'; }).join("")+'</tbody></table>';
}
/* a new investigation filled from a CAPA record; the CAPA record is only read */
function prefillFromCapa(id){
 var c=byIdIn(CAPA_KEY,id); if(!c) return false;
 var r=blank(), cs=obj(c.cause), re=obj(c.react);
 r.title=str(c.title); r.ref=str(c.ref); r.src="capa"; r.capa=str(c.id); r.pdca=str(c.pdca); r.area=str(c.area); r.date=today(); r.lead=str(c.owner);
 r.prob.what=str(c.desc); r.prob.where=str(c.area); r.prob.when=str(c.raised);
 if(isD(str(c.raised))) r.tl.push({at:str(c.raised)+"T08:00",ev:t("pfRaised",{t:str(c.title)}),src:"CAPA "+str(c.id),kind:"fact"});
 if(txt(str(re.correction))) r.tl.push({at:isD(str(re.date))?str(re.date)+"T09:00":"",ev:t("pfReact",{t:str(re.correction)}),src:"CAPA "+str(c.id),kind:"fact"});
 if(txt(str(c.evidence))) r.evid.push({item:str(c.evidence),type:"rec",by:str(c.owner),date:str(c.raised)});
 if(txt(str(cs.root))) r.causes.push({id:"c1",lvl:"root",t:str(cs.root),ev:"",st:"hyp",test:"",p:""});
 if(["exist","could","none"].indexOf(cs.similar)>=0){ r.similar=cs.similar; r.similarNote=str(cs.similarNote); }
 fixRec(r);
 editing=null; recToForm(r);
 go("tools");
 document.getElementById("recOk").textContent=t("stUsedC",{id:str(c.id)});
 return true;
}
/* a new investigation filled from a Pareto category; the Pareto analysis is only read */
function prefillFromPareto(pid,cid){
 var I=paCatInfo(pid,cid); if(!I) return false;
 var p=I.p, x=I.x, r=blank(), tot=paRank(p).total;
 r.title=short(str(x.c.name)+" — "+str(p.title),120); r.ref=str(p.ref)||str(p.id); r.src="pareto"; r.pareto=str(p.id); r.pcat=str(x.c.id); r.pdca=str(p.pdca); r.area=str(p.area); r.date=today();
 r.prob.what=str(x.c.name)+(txt(str(x.c.def))?": "+str(x.c.def):""); r.prob.where=str(p.area);
 r.prob.when=(isD(p.from)&&isD(p.to))?str(p.from)+" → "+str(p.to):"";
 r.prob.much=t("pfMuch",{v:fmtN(x.v),u:puName(p.unit),tot:fmtN(tot),s:(Math.round(x.share*10)/10).toFixed(1),id:str(p.id)}).replace("  "," ");
 r.methods.push({how:"pareto",ref:str(p.id),note:""});
 var nx=obj(x.c.nx); if(nx.how==="fish"||nx.how==="why5") r.methods.push({how:nx.how,ref:str(nx.ref),note:""});
 if(nx.how==="capa") r.capa=str(nx.ref);
 fixRec(r);
 editing=null; recToForm(r);
 go("tools");
 document.getElementById("recOk").textContent=t("stUsedP",{id:str(p.id),c:str(x.c.name)});
 return true;
}
document.getElementById("stSrc").addEventListener("change",function(){ ST=null; document.getElementById("stTable").hidden=true; document.getElementById("stMsg").textContent=""; });
document.getElementById("stPrev").addEventListener("click",function(){ stPreview(false); });
document.getElementById("stTable").addEventListener("click",function(e){ var b=e.target.closest("[data-stcapa]"); if(b){ prefillFromCapa(b.getAttribute("data-stcapa")); return; } var p=e.target.closest("[data-stpa]"); if(p) prefillFromPareto(p.getAttribute("data-stpa"),p.getAttribute("data-cat")); });
function homeCounts(){ var C=recsOf(CAPA_KEY)||[], c=C.filter(function(x){ return capaStage(x)!=="closed"; }).length, n=0; (recsOf(PARETO_KEY)||[]).forEach(function(p){ n+=paRank(p).rows.filter(function(x){ return x.vit; }).length; }); return {c:c,p:n}; }
function renderHomeSt(){
 var box=document.getElementById("homeImp"); if(!box) return;
 var h=homeCounts(), n=h.c+h.p; box.hidden=!n || DB.records.length>0; if(n) document.getElementById("homeImpT").textContent=t("hmT",h);
}
document.getElementById("homeImpGo").addEventListener("click",function(){ go("tools"); var s=document.getElementById("stSrc"); if(s&&!homeCounts().c&&homeCounts().p) s.value="pareto"; stPreview(false); var b=document.getElementById("stBox"); if(b&&b.scrollIntoView) b.scrollIntoView({block:"start"}); });

/* ---------- self-assessment ---------- */
var AQ=[
 ["PS1",{ar:"هل نكتب المشكلة من الوقائع (ماذا وأين ومتى وكم) مع المتطلب الذي لم يُستوفَ، قبل أن نتحدث عن الأسباب؟",en:"Do we write the problem from facts (what, where, when, how much) with the requirement that was not met, before we talk about causes?"}],
 ["PS2",{ar:"هل يحدد الخطر والأثر عمق التحقيق بقاعدة مكتوبة، ونكتب السبب عندما نختار عمقاً أقل؟",en:"Do risk and impact set the depth of the investigation by a written rule, and do we write the reason when we choose less depth?"}],
 ["EV1",{ar:"هل نسجّل تسلسل الأحداث ونحتفظ بسجل للأدلة، ونميّز الواقعة المثبتة من الافتراض؟",en:"Do we record the timeline of events and keep an evidence register, telling proven facts apart from assumptions?"}],
 ["EV2",{ar:"هل يضم فريق التحقيق الأشخاص المناسبين، ومنهم واحد على الأقل يؤدي العمل نفسه؟",en:"Does the investigation team have the right people, including at least one person who does the work itself?"}],
 ["AN1",{ar:"هل نستخدم أكثر من طريقة عندما يكون للمشكلة عدة مسارات (باريتو وعظمة السمكة ولماذا الخمس والبيانات)؟",en:"Do we use more than one method when the problem has several paths (Pareto, Fishbone, 5 Whys and data)?"}],
 ["AN2",{ar:"هل نفرّق بين السبب المباشر والأسباب المساهمة والسبب الجذري، ونقبل أن يكون للمشكلة أكثر من سبب جذري؟",en:"Do we tell the direct cause, contributing causes and root causes apart, and accept that a problem can have more than one root cause?"}],
 ["AN3",{ar:"هل نرفض «الخطأ البشري» سبباً جذرياً، ونسأل ما الذي في العملية سمح به؟",en:"Do we refuse “human error” as a root cause, and ask what in the process allowed it?"}],
 ["VR1",{ar:"هل نختبر كل سبب جذري ونثبته بالبيانات أو الدليل (إذا أُزيل، هل تتوقف المشكلة أو تقل؟) قبل أن نتصرف؟",en:"Do we test every root cause and verify it with data or evidence (if removed, does the problem stop or fall?) before we act?"}],
 ["VR2",{ar:"هل نبحث عن الحالات المشابهة الموجودة أو المحتملة في مواقع وعمليات أخرى؟",en:"Do we look for similar cases that exist or could occur at other sites and in other processes?"}],
 ["AC1",{ar:"هل تُبنى الإجراءات على أسباب جذرية مؤكدة، لكل سبب إجراء بمالك، وتنتقل خطتها إلى سجل CAPA؟",en:"Are the actions built on confirmed root causes, each with an action and an owner, with the plan carried in a CAPA record?"}],
 ["AC2",{ar:"هل نكتب معيار الفعالية (ما يُقاس، وأين، ولأي مدة) قبل بدء التنفيذ؟",en:"Do we write the effectiveness criterion (what is measured, where, for how long) before the action starts?"}],
 ["AC3",{ar:"هل نشارك الدروس المستفادة من التحقيقات مع الفرق والمواقع الأخرى ونحفظها معرفةً للمنشأة؟",en:"Do we share the lessons from investigations with other teams and sites and keep them as organizational knowledge?"}]
];
var AGROUPS=["PS","EV","AN","VR","AC"];
var GCOL={PS:"#C2410C",EV:"#3563C9",AN:"#C9821A",VR:"#1B2A4A",AC:"#3C9A5F"};
function assessScore(g){ return TBX.score(AQ,DB.assess,g?function(q){ return q[0].slice(0,2)===g; }:null); }
function assessAnswered(){ return TBX.answered(AQ,DB.assess); }
function bandOf(p){ return TBX.band(p,[t("band0"),t("band1"),t("band2")]); }
function renderAssess(){
 var list=document.getElementById("asList"); if(!list) return;
 list.innerHTML=AGROUPS.map(function(g){
  return '<h3 class="pd-sub" style="margin:14px 0 2px;font-weight:700;color:'+GCOL[g]+'">'+esc(t("g_"+g))+'</h3>'+AQ.filter(function(q){ return q[0].slice(0,2)===g; }).map(function(q){
   var cur=DB.assess[q[0]];
   var o=[0,1,2].map(function(v){ var id="as-"+q[0]+"-"+v; return '<label class="opt" for="'+id+'"><input type="radio" name="as-'+q[0]+'" value="'+v+'" id="'+id+'"'+(cur===v?" checked":"")+'><span>'+esc(t("as"+v))+'</span></label>'; }).join("");
   return '<div class="pd-q ex-aq" id="as-'+q[0]+'" data-id="'+q[0]+'"><fieldset><legend data-ex-head><span class="pd-badge">'+q[0]+'</span> '+esc(q[1][L]||q[1].ar)+'</legend><div class="pd-opts">'+o+'</div></fieldset></div>';
  }).join("");
 }).join("");
 var p=assessScore();
 document.getElementById("asPct").textContent=p+"%";
 document.getElementById("asGauge").style.setProperty("--p",p);
 document.getElementById("asGauge").setAttribute("aria-label",p+"%");
 document.getElementById("asStages").innerHTML=AGROUPS.map(function(g){ var sp=assessScore(g); return TBX.bar(t("g_"+g),sp+"%",sp,GCOL[g]); }).join("")+
  '<p class="pd-sub" style="margin:10px 0 0;font-size:14px;color:var(--ink-soft)">'+esc(bandOf(p))+' · '+esc(t("asAnswered",{n:assessAnswered()}))+'</p><p class="pd-sub" style="font-size:12.5px;color:var(--muted);margin:6px 0 0">'+esc(t("bandNote"))+'</p>';
}
document.addEventListener("change",function(e){
 var el=e.target; if(!el.name || el.name.indexOf("as-")!==0) return;
 DB.assess[el.name.slice(3)]=Number(el.value); persist();
 document.getElementById("asMsg").textContent=t("asSaved");
 renderAssess(); renderDash();
});
document.getElementById("asReset").addEventListener("click",function(){ DB.assess={}; persist(); renderAssess(); renderDash(); document.getElementById("asMsg").textContent=""; });

/* ---------- records ---------- */
var pendingDelete=null;
function methCodes(r){ return methList(r).map(function(m){ return (m.how==="data"||m.how==="barrier")?t("how_"+m.how).replace(/\s*\(.*\)$/,""):m.how==="pareto"?"Pareto "+m.ref:(m.how==="fish"?"Fishbone ":"5 Whys ")+m.ref; }); }
function renderDocs(){
 var box=document.getElementById("docsBox"); if(!box) return;
 var cnt0=document.getElementById("cntDocs"); if(cnt0) cnt0.textContent=DB.records.length?String(DB.records.length):"";
 if(!DB.records.length){ box.innerHTML='<div class="pd-empty">'+esc(t("none"))+'</div>'; return; }
 var rows=DB.records.map(function(r){
  var st=stageOf(r), R=roots(r), d=depOf(r);
  var del=(pendingDelete===r.id)?'<button class="pd-rowbtn arm" type="button" data-del="'+esc(r.id)+'">'+esc(t("delArm"))+'</button>':'<button class="pd-rowbtn" type="button" data-del="'+esc(r.id)+'">'+esc(t("del"))+'</button>';
  var pd=r.pdca?'<button class="pd-rowbtn" type="button" data-pdca="'+esc(r.pdca)+'">PDCA ↗</button>':'';
  var ca=r.capa?'<button class="pd-rowbtn" type="button" data-capa="'+esc(r.capa)+'">CAPA ↗</button>':'';
  return '<tr><td><b dir="ltr">'+esc(r.ref||"—")+'</b><br>'+esc(r.title)+'<br><small dir="ltr" style="color:var(--muted)">'+esc(r.id)+'</small></td><td>'+esc(t("src_"+r.src))+'<br><small>'+esc(d?t("dp_"+d):t("dp_none"))+(r.capa?' · <span dir="ltr">'+esc(r.capa)+'</span>':'')+'</small></td><td><span class="pd-badge" style="background:'+SCOL[st]+';color:#fff">'+esc(stageName(st))+'</span></td><td>'+esc(short(r.prob.what,90)||"—")+'</td><td>'+(R.length?esc(t("rootsN",{ok:R.filter(rootOk).length,n:R.length})):"—")+'</td><td>'+esc(methCodes(r).join("، ")||"—")+'</td><td>'+flagsOf(r).map(chip).join("")+'</td><td><button class="pd-rowbtn" type="button" data-open="'+esc(r.id)+'">'+esc(t("open"))+'</button>'+del+pd+ca+'</td></tr>';
 }).join("");
 box.innerHTML='<table class="pd-tbl"><thead><tr><th>'+esc(t("colRef"))+'</th><th>'+esc(t("colSrc"))+'</th><th>'+esc(t("colStage"))+'</th><th>'+esc(t("colProb"))+'</th><th>'+esc(t("colRoots"))+'</th><th>'+esc(t("colMeth"))+'</th><th>'+esc(t("colFlags"))+'</th><th>'+esc(t("colAct"))+'</th></tr></thead><tbody>'+rows+'</tbody></table>';
}
/* a method row asks to start an analysis in another tool: Fishbone and 5 Whys get the CAPA record or the Pareto category of this
   investigation through their own existing requests; nothing is written to them here */
function startMethod(how){
 var r=formToRec();
 if(how==="fish"){ openFish(r.capa?{capa:r.capa}:(r.pareto&&r.pcat?{pareto:r.pareto,cat:r.pcat}:{})); return; }
 if(how==="why5"){ openWhy5(r.capa?{capa:r.capa}:{}); return; }
 openPareto({});
}
document.addEventListener("click",function(e){
 if(e.target.closest("#cb")) return;
 var o=e.target.closest("[data-open]"); if(o){ var r=DB.records.find(function(x){ return x.id===o.getAttribute("data-open"); }); if(r){ loadRecordIntoForm(r); go("tools"); } return; }
 var d=e.target.closest("[data-del]"); if(d){ var id=d.getAttribute("data-del"); if(pendingDelete===id){ DB.records=DB.records.filter(function(x){ return x.id!==id; }); pendingDelete=null; persist(); if(document.getElementById("rid").value===id) clearForm(); renderAll(); } else { pendingDelete=id; renderDocs(); } return; }
 if(e.target.closest("[data-pdca]")||e.target.closest("#pdOpen")){ openTool("pdca.html","docs"); return; }
 if(e.target.closest("[data-capa]")||e.target.closest("#caOpen")||e.target.closest("#acCapa")){ openTool("capa.html","docs"); return; }
 var ms=e.target.closest("[data-mestart]"); if(ms){ startMethod(ms.getAttribute("data-mestart")); return; }
 var mo=e.target.closest("[data-meopen]"); if(mo){ var how=mo.getAttribute("data-meopen"), ref=mo.getAttribute("data-ref"); if(how==="fish") openFish({open:ref}); else if(how==="why5") openWhy5({open:ref}); else openPareto({open:ref}); return; }
 var ad=e.target.closest("[data-add]"); if(ad){ var tb=ad.getAttribute("data-add"), raw=formRaw()[tb]; if(raw.length<MAXROWS){ raw.push(TB[tb].blank()); renderTbl(tb,raw,formToRec()); var box=document.getElementById(tb==="team"?"teamRows":tb+"Rows"), lt=box&&box.querySelector("tr:last-child input:not([disabled]), tr:last-child textarea, tr:last-child select"); if(lt) lt.focus(); } refreshForm(); return; }
 var cz=e.target.closest("[data-czadd]"); if(cz){ var lv=cz.getAttribute("data-czadd"), list=formRaw().cz, n=0; list.concat(editing?editing.causes:[]).forEach(function(c){ var m=/^c(\d+)$/.exec(c.id||""); if(m) n=Math.max(n,+m[1]); });
  var nc=blankCz("c"+(n+1),lv); if(lv!=="direct"){ var D=list.filter(function(c){ return c.lvl==="direct"; }); nc.p=D.length?D[D.length-1].id:""; } list.push(nc); renderTbl("cz",list,formToRec());
  var nt=document.querySelector('#czRows [data-cid="'+nc.id+'"] [data-k="t"]'); if(nt) nt.focus(); refreshForm(); return; }
 var rd=e.target.closest("[data-rdel]"); if(rd){ var a=rd.getAttribute("data-rdel").split(":"), l2=formRaw()[a[0]]; l2.splice(Number(a[1]),1); renderTbl(a[0],l2,formToRec()); refreshForm(); return; }
 if(e.target.closest("#tlSort")){ var tl=formRaw().tl; tl.sort(function(x,y){ return (x.at||"9999")<(y.at||"9999")?-1:((x.at||"9999")>(y.at||"9999")?1:0); }); renderTbl("tl",tl,formToRec()); refreshForm(); return; }
});
/* a new method clears the id recorded for the old one, and the row is redrawn with the right list of ids */
document.addEventListener("change",function(e){
 var el=e.target; if(!el||!el.closest) return;
 if(el.closest("#meRows")&&el.getAttribute("data-k")==="how"){ var raw=formRaw().me, i=Number(el.closest("tr").getAttribute("data-row")); if(raw[i]){ raw[i].ref=""; raw[i].how=el.value; } renderTbl("me",raw,formToRec()); refreshForm(); var s=document.querySelector('#meRows tr[data-row="'+i+'"] [data-k="how"]'); if(s) s.focus(); }
 if(el.closest("#czRows")&&el.getAttribute("data-k")==="lvl"){ var tr=el.closest("[data-row]"), p=tr.querySelector('[data-k="p"]'); if(p){ p.setAttribute("data-cur",""); p.removeAttribute("data-sig"); } if(el.value!=="root"){ var ts=tr.querySelector('[data-k="test"]'); if(ts) ts.value=""; } }
 if(el.matches&&(el.matches('#czRows [data-k="p"]')||el.matches('#acRows [data-k="cause"]'))) el.setAttribute("data-cur",el.value);
 if(el.id==="f-pareto"){ var pc=document.getElementById("f-pcat"); if(pc){ pc.setAttribute("data-cur",""); pc.value=""; } }
},true);

/* ---------- automatic audit of investigations ---------- */
var CHECKS=["ref","prob","depth","tl","ev","meth","cause","root","person","sim","act","crit","rev"];
function auditRecord(r){
 var ev=atLeast(r,"evidence"), ca=atLeast(r,"causes"), ro=atLeast(r,"root"), ac=atLeast(r,"actions"), d=depOf(r), R=roots(r), res={};
 res.ref=!!txt(r.ref);
 res.prob=probOk(r);
 res.depth=depthOk(r);
 res.tl=facts(r)>=2;
 res.ev=evN(r)>=1;
 res.meth=(ev&&d&&d!=="light")?methOk(r):null;
 res.cause=ev?(directs(r).length>0&&R.length>0):null;
 res.root=ca?R.every(rootOk):null;
 res.person=R.length?!R.some(function(c){ return personOnly(c.t); }):null;
 res.sim=ca?!!r.similar:null;
 res.act=ro?noAct(r).length===0:null;
 res.crit=ro?critOk(r):null;
 res.rev=ac?(!!txt(r.review.by)&&isD(r.review.date)&&!revInTeam(r)):null;
 return res;
}
function auditSummary(){ var A=TBX.audit(DB.records,auditRecord,CHECKS); return {pass:A.pass,applic:A.applic,rate:A.rate,failRec:A.failRec}; }
function renderAudit(){
 var box=document.getElementById("auBox"), kp=document.getElementById("auKpis"); if(!box) return;
 if(!DB.records.length){ box.innerHTML='<div class="pd-empty">'+esc(t("auEmpty"))+'</div>'; kp.innerHTML=""; return; }
 var A=TBX.audit(DB.records,auditRecord,CHECKS);
 var rows=A.rows.map(function(x){ return '<tr><td>'+esc(x.r.title)+'<br><small dir="ltr">'+esc(x.r.ref||x.r.id)+'</small></td>'+TBX.cells(x.res,CHECKS)+'</tr>'; }).join("");
 box.innerHTML='<table class="pd-tbl"><thead><tr><th>'+esc(t("colRef"))+'</th>'+CHECKS.map(function(k){ return '<th>'+esc(t("c_"+k))+'</th>'; }).join("")+'</tr></thead><tbody>'+rows+'</tbody></table>';
 kp.innerHTML=TBX.kpi(DB.records.length,t("auRec"))+TBX.kpi(A.rate===null?"—":A.rate+"%",t("auPass"))+TBX.kpi(A.failRec,t("auFail"))+TBX.kpi(openItems().length,t("auOpen"));
}

/* ---------- dashboard ---------- */
function counts(){
 var R=DB.records, c={n:R.length,root:0,crit:0,full:0,rev:0,person:0,capa:0,dep:{light:0,std:0,full:0,none:0},me:{pareto:0,fish:0,why5:0,data:0,barrier:0}};
 R.forEach(function(r){ var d=depOf(r);
  if(rootsOk(r)) c.root++; if(critOk(r)) c.crit++; if(d==="full") c.full++; if(stageOf(r)==="reviewed") c.rev++; if(txt(r.capa)) c.capa++;
  c.person+=personCauses(r).length; c.dep[d||"none"]++;
  methList(r).forEach(function(m){ c.me[m.how]++; });
 });
 return c;
}
function pct(a,n){ return n?Math.round(a/n*100)+"%":"—"; }
function renderDash(){
 var box=document.getElementById("dKpis"); if(!box) return;
 var c=counts(), au=auditSummary(), as=assessScore(), n=c.n, oi=openItems();
 box.innerHTML=TBX.kpi(n,t("kTotal"))+TBX.kpi(pct(c.root,n),t("kRoot"))+TBX.kpi(pct(c.crit,n),t("kCrit"))+TBX.kpi(c.full,t("kFull"))+TBX.kpi(c.rev,t("kRev"))+TBX.kpi(c.capa,t("kCapa"))+TBX.kpi(c.person,t("kPerson"))+TBX.kpi(oi.length,t("kOpen"))+TBX.kpi(au.rate===null?"—":au.rate+"%",t("kAud"))+TBX.kpi(as+"%",t("kAs"));
 var nd='<p class="pd-sub" style="color:var(--ink-soft)">'+esc(t("noData"))+'</p>';
 document.getElementById("dStage").innerHTML=n?TBX.dist(STAGES,n,function(s){ return DB.records.filter(function(r){ return stageOf(r)===s; }).length; },stageName,function(s){ return SCOL[s]; }):nd;
 document.getElementById("dDepth").innerHTML=n?TBX.dist(["light","std","full","none"],n,function(k){ return c.dep[k]; },function(k){ return k==="none"?t("dp_none"):t("dp_"+k); },function(k){ return k==="none"?"#9AA5B8":DCOL[k]; }):nd;
 document.getElementById("dMeth").innerHTML=n?TBX.dist(HOWS,n,function(k){ return c.me[k]; },function(k){ return t("how_"+k); },function(k){ return {pareto:"#B8901E",fish:"#1E8C93",why5:"#3563C9",data:"#1B2A4A",barrier:"#7B5BB8"}[k]; }):nd;
 document.getElementById("dAssess").innerHTML=AGROUPS.map(function(g){ var p=assessScore(g); return TBX.bar(t("g_"+g),p+"%",p,GCOL[g]); }).join("")+'<p class="pd-sub" style="font-size:12.5px;color:var(--muted);margin:10px 0 0">'+esc(t("bandNote"))+'</p>';
 document.getElementById("dOpen").innerHTML=oi.length?oi.map(function(x){ return '<li><b>'+esc(x.r.ref||x.r.id)+'</b>'+chip([x.r.id,"info"])+'<span>'+esc(x.s)+'</span></li>'; }).join(""):'<li>'+esc(n?t("noOpen"):t("noData"))+'</li>';
}

/* ---------- report and CSV ---------- */
function buildCSV(){
 var head=["id","ref","title","source","capa","pareto","paretoCategory","pdca","area","date","lead","stage","what","where","when","howMuch","requirementNotMet","severity","likelihood","requiredDepth","depthChosen","depthReason","team","timeline","evidence","methods","dataAnalysis","barrierAnalysis","causes","similar","similarNote","actions","criterion","criterionWhere","criterionPeriod","criterionDate","criterionBeforeAction","criterionPareto","reviewer","reviewDate"];
 return TBX.csv(head,DB.records.map(function(r){
  var CD=codes(r);
  var tm=r.team.map(function(m){ return m.n+(m.role?" ("+m.role+")":"")+(m.work?" [does the work]":""); }).join(" | ");
  var tl=r.tl.map(function(x){ return dt(x.at)+" "+x.ev+" — "+x.src+" ["+x.kind+"]"; }).join(" | ");
  var ev=r.evid.map(function(x){ return x.item+" ["+x.type+"] "+x.by+" "+x.date; }).join(" | ");
  var me=r.methods.map(function(m){ return m.how+(m.ref?" "+m.ref:"")+(m.note?": "+m.note:""); }).join(" | ");
  var da=r.data.map(function(x){ return x.g+": "+(x.k===null?"—":x.k)+"/"+(x.n===null?"—":x.n)+" = "+rateTxt(x); }).join(" | ");
  var ba=r.barrier.map(function(x){ return x.b+": "+x.res+(x.act?" — "+x.act:""); }).join(" | ");
  var cz=r.causes.map(function(c){ return (CD[c.id]||"")+" "+c.lvl+" ["+c.st+(c.lvl==="root"?", test "+(c.test||"—"):"")+"] "+c.t+(c.ev?" — "+c.ev:"")+(c.p&&CD[c.p]?" (explains "+CD[c.p]+")":""); }).join(" | ");
  var ac=r.acts.map(function(a){ return (CD[a.cause]||"—")+": "+a.t+" — "+a.owner; }).join(" | ");
  return [r.id,r.ref,r.title,r.src,r.capa,r.pareto,r.pcat,r.pdca,r.area,r.date,r.lead,stageOf(r),r.prob.what,r.prob.where,r.prob.when,r.prob.much,r.prob.req,r.risk.sev||"",r.risk.lik||"",reqDepth(r),r.depth,r.depthWhy,tm,tl,ev,me,da,ba,cz,r.similar,r.similarNote,ac,r.crit.what,r.crit.where,r.crit.period,r.crit.date,r.crit.before?"yes":"no",r.crit.pareto,r.review.by,r.review.date]; }));
}
function recReport(r){
 var s=stageOf(r), CD=codes(r), q=reqDepth(r), d=depOf(r), A=auditRecord(r);
 var row=function(k,v){ return '<tr><th>'+esc(k)+'</th><td>'+esc(v||"—")+'</td></tr>'; };
 var tl=r.tl.slice().sort(function(x,y){ return (x.at||"9999")<(y.at||"9999")?-1:((x.at||"9999")>(y.at||"9999")?1:0); });
 var mark=function(v){ return v===null?'<td class="na">—</td>':(v?'<td class="ok">✓</td>':'<td class="bad">✗</td>'); };
 return '<section class="an"><h3><span dir="ltr">'+esc(r.id)+'</span> · <span dir="ltr">'+esc(r.ref||"—")+'</span> — '+esc(r.title)+'</h3>'+
  '<p class="meta">'+esc(t("colStage"))+': <b>'+esc(stageName(s))+'</b> · '+esc(t("src_"+r.src))+(r.capa?' · CAPA <span dir="ltr">'+esc(r.capa)+'</span>':'')+(r.pareto?' · Pareto <span dir="ltr">'+esc(r.pareto+(r.pcat?" / "+r.pcat:""))+'</span>':'')+(r.pdca?' · PDCA <span dir="ltr">'+esc(r.pdca)+'</span>':'')+(r.date?' · <span dir="ltr">'+esc(r.date)+'</span>':'')+(r.lead?' · '+esc(r.lead):'')+'</p>'+
  '<h4>'+esc(t("rpProb"))+'</h4><table><tbody>'+row(t("f_what"),r.prob.what)+row(t("f_where"),r.prob.where)+row(t("f_when"),r.prob.when)+row(t("f_much"),r.prob.much)+row(t("f_req"),r.prob.req)+row(t("f_area"),r.area)+'</tbody></table>'+
  '<h4>'+esc(t("rpRisk"))+'</h4><p>'+esc(t("f_sev"))+': <b>'+(r.risk.sev||"—")+'</b> · '+esc(t("f_lik"))+': <b>'+(r.risk.lik||"—")+'</b>'+(q?' · '+esc(t("scoreS"))+' '+(r.risk.sev*r.risk.lik)+' · '+esc(t("reqL"))+' <b>'+esc(t("dp_"+q))+'</b>':'')+(d?' · '+esc(t("f_depth"))+': <b>'+esc(t("dp_"+d))+'</b>':'')+(r.depthWhy?' — '+esc(r.depthWhy):'')+'</p>'+
  '<p><b>'+esc(t("sTeamT"))+':</b> '+esc(r.team.map(function(m){ return m.n+(m.role?" ("+m.role+")":"")+(m.work?" ★":""); }).join("، ")||"—")+'</p>'+
  '<h4>'+esc(t("rpTree"))+'</h4><div class="dg">'+treeSVG(r)+'</div>'+
  (tl.length?'<h4>'+esc(t("rpTl"))+'</h4><table><thead><tr><th>'+esc(t("tlAt"))+'</th><th>'+esc(t("tlEv"))+'</th><th>'+esc(t("tlSrc"))+'</th><th>'+esc(t("tlKind"))+'</th></tr></thead><tbody>'+tl.map(function(x){ return '<tr><td dir="ltr">'+esc(dt(x.at)||"—")+'</td><td>'+esc(x.ev)+'</td><td>'+esc(x.src||"—")+'</td><td class="'+(x.kind==="asm"?"warn":"")+'">'+esc(t("k_"+x.kind))+'</td></tr>'; }).join("")+'</tbody></table>':'')+
  (r.evid.length?'<h4>'+esc(t("rpEv"))+'</h4><table><thead><tr><th>'+esc(t("evItem"))+'</th><th>'+esc(t("evType"))+'</th><th>'+esc(t("evBy"))+'</th><th>'+esc(t("evDate"))+'</th></tr></thead><tbody>'+r.evid.map(function(x){ return '<tr><td>'+esc(x.item)+'</td><td>'+esc(t("ev_"+x.type))+'</td><td>'+esc(x.by||"—")+'</td><td dir="ltr">'+esc(x.date||"—")+'</td></tr>'; }).join("")+'</tbody></table>':'')+
  (r.methods.length?'<h4>'+esc(t("rpMeth"))+'</h4><table><thead><tr><th>'+esc(t("meHow"))+'</th><th>'+esc(t("meRef"))+'</th><th>'+esc(t("meNote"))+'</th></tr></thead><tbody>'+r.methods.map(function(m){ return '<tr><td>'+esc(m.how?t("how_"+m.how):"—")+'</td><td dir="ltr">'+esc(m.ref||"—")+'</td><td>'+esc(m.note||"—")+'</td></tr>'; }).join("")+'</tbody></table>':'')+
  (r.data.length?'<p class="meta">'+esc(t("daT"))+'</p><table><thead><tr><th>'+esc(t("daG"))+'</th><th>'+esc(t("daN"))+'</th><th>'+esc(t("daK"))+'</th><th>'+esc(t("daR"))+'</th><th>'+esc(t("daNote"))+'</th></tr></thead><tbody>'+r.data.map(function(x){ return '<tr><td>'+esc(x.g)+'</td><td class="n">'+esc(x.n===null?"—":x.n)+'</td><td class="n">'+esc(x.k===null?"—":x.k)+'</td><td class="n">'+esc(rateTxt(x))+'</td><td>'+esc(x.note||"—")+'</td></tr>'; }).join("")+'</tbody></table>':'')+
  (r.barrier.length?'<p class="meta">'+esc(t("baT"))+'</p><table><thead><tr><th>'+esc(t("baB"))+'</th><th>'+esc(t("baExp"))+'</th><th>'+esc(t("baAct"))+'</th><th>'+esc(t("baRes"))+'</th></tr></thead><tbody>'+r.barrier.map(function(x){ return '<tr><td>'+esc(x.b)+'</td><td>'+esc(x.exp||"—")+'</td><td>'+esc(x.act||"—")+'</td><td>'+esc(x.res?t("br_"+x.res):"—")+'</td></tr>'; }).join("")+'</tbody></table>':'')+
  (r.causes.length?'<h4>'+esc(t("rpCz"))+'</h4><table class="cs"><thead><tr><th>'+esc(t("czCode"))+'</th><th>'+esc(t("czLvl"))+'</th><th>'+esc(t("czT"))+'</th><th>'+esc(t("czEv"))+'</th><th>'+esc(t("czSt"))+'</th><th>'+esc(t("czTest"))+'</th></tr></thead><tbody>'+r.causes.map(function(c){ return '<tr'+(c.lvl==="root"?' class="vf"':'')+'><td dir="ltr">'+esc(CD[c.id]||"")+'</td><td>'+esc(t("lv_"+c.lvl))+'</td><td>'+esc(c.t)+(personOnly(c.t)&&c.st!=="out"?' <span class="bad">⚠ '+esc(t("trLegPf"))+'</span>':'')+'</td><td>'+esc(c.ev||"—")+'</td><td>'+esc(t("cs_"+c.st))+'</td><td>'+esc(c.lvl==="root"?t("ts_"+c.test):"—")+'</td></tr>'; }).join("")+'</tbody></table>':'')+
  '<p><b>'+esc(t("sSimT"))+':</b> '+esc(r.similar?t("sim_"+r.similar):"—")+(r.similarNote?' — '+esc(r.similarNote):'')+'</p>'+
  (r.acts.length?'<h4>'+esc(t("rpAct"))+'</h4><table><thead><tr><th>'+esc(t("acCause"))+'</th><th>'+esc(t("acT"))+'</th><th>'+esc(t("acOwner"))+'</th></tr></thead><tbody>'+r.acts.map(function(a){ return '<tr><td dir="ltr">'+esc(CD[a.cause]||"—")+'</td><td>'+esc(a.t)+'</td><td>'+esc(a.owner||"—")+'</td></tr>'; }).join("")+'</tbody></table>':'')+
  '<h4>'+esc(t("rpCrit"))+'</h4><table><tbody>'+row(t("f_cwhat"),r.crit.what)+row(t("f_cwhere"),r.crit.where)+row(t("f_cperiod"),r.crit.period)+row(t("f_cdate"),r.crit.date)+row(t("f_cbefore"),r.crit.before?t("yes"):t("no"))+row(t("f_cpareto"),r.crit.pareto)+'</tbody></table>'+
  '<p><b>'+esc(t("sRevT"))+':</b> '+esc(r.review.by||"—")+(r.review.date?' · <span dir="ltr">'+esc(r.review.date)+'</span>':'')+(r.review.note?' — '+esc(r.review.note):'')+'</p>'+
  '<h4>'+esc(t("rpAu"))+'</h4><table><thead><tr>'+CHECKS.map(function(k){ return '<th>'+esc(t("c_"+k))+'</th>'; }).join("")+'</tr></thead><tbody><tr>'+CHECKS.map(function(k){ return mark(A[k]); }).join("")+'</tr></tbody></table></section>';
}
function buildReportHTML(){
 var c=counts(), au=auditSummary(), as=assessScore(), d=today(), n=c.n, A=TBX.audit(DB.records,auditRecord,CHECKS), oi=openItems();
 var mark=function(v){ return v===null?'<td class="na">—</td>':(v?'<td class="ok">✓</td>':'<td class="bad">✗</td>'); };
 var grpRows=AGROUPS.map(function(g){ return '<tr><td>'+esc(t("g_"+g))+' — '+g+'</td><td>'+assessScore(g)+'%</td></tr>'; }).join("");
 var auRows=A.rows.map(function(x){ return '<tr><td dir="ltr">'+esc(x.r.id)+'</td>'+CHECKS.map(function(k){ return mark(x.res[k]); }).join("")+'</tr>'; }).join("");
 var body='<div class="cover"><p class="kick">Continual Improvement Academy · CIA Toolbox</p><h1>Root Cause Analysis — Investigation / تحليل السبب الجذري</h1><p class="sub">'+esc(t("rpCover"))+'</p>'+
  '<p class="meta">'+esc(t("prep"))+': <bdi><strong>مدثر سلامه</strong></bdi> · <bdi dir="ltr">'+esc(d)+'</bdi> · <bdi>'+esc(t("kTotal"))+': '+n+'</bdi></p></div>'+
  '<h2>Summary / الملخص</h2><div class="k">'+
   '<div><b>'+n+'</b>'+esc(t("kTotal"))+'</div><div><b>'+pct(c.root,n)+'</b>'+esc(t("kRoot"))+'</div><div><b>'+pct(c.crit,n)+'</b>'+esc(t("kCrit"))+'</div><div><b>'+c.full+'</b>'+esc(t("kFull"))+'</div><div><b>'+c.rev+'</b>'+esc(t("kRev"))+'</div><div><b>'+c.person+'</b>'+esc(t("kPerson"))+'</div><div><b>'+oi.length+'</b>'+esc(t("kOpen"))+'</div><div><b>'+(au.rate===null?"—":au.rate+"%")+'</b>'+esc(t("kAud"))+'</div><div><b>'+as+'%</b>'+esc(t("kAs"))+'</div></div>'+
  '<h2>Investigations / التحقيقات</h2>'+(n?DB.records.map(recReport).join(""):'<p class="meta">'+esc(t("rpEmpty"))+'</p>')+
  '<h2>Audit results / نتائج التدقيق</h2>'+(n?'<p>'+esc(t("auPass"))+': '+(au.rate===null?"—":au.rate+"% ("+au.pass+"/"+au.applic+")")+'</p><table><thead><tr><th>ID</th>'+CHECKS.map(function(k){ return '<th>'+esc(t("c_"+k))+'</th>'; }).join("")+'</tr></thead><tbody>'+auRows+'</tbody></table>':'<p class="meta">—</p>')+
  '<h2>Open items / بنود تحتاج متابعة</h2>'+(oi.length?'<ul>'+oi.map(function(x){ return '<li><span dir="ltr">'+esc(x.r.id)+' · '+esc(x.r.ref||"—")+'</span> — '+esc(x.s)+'</li>'; }).join("")+'</ul>':'<p class="meta">'+esc(n?t("noOpen"):"—")+'</p>')+
  '<h2>Self-assessment / التقييم الذاتي</h2><table><thead><tr><th>Group / المجموعة</th><th>Score / النتيجة</th></tr></thead><tbody>'+grpRows+'<tr><td><b>'+esc(t("kAs"))+'</b></td><td><b>'+as+'%</b></td></tr></tbody></table><p class="meta">'+esc(t("bandNote"))+'</p>'+
  '<footer>Prepared by / أعدّه: مدثر سلامه · Root cause analysis is a discipline that combines methods, not a clause of any standard; a root cause is a hypothesis until evidence and a test confirm it, and “human error” is a starting point, not a root cause. Sources / المراجع: ISO 9001:2026 clauses 6.1.2, 7.1.6, 7.2, 8.5.1 g), 9.1.3, 10.1 and 10.2 and Annex A.10.2; ISO 9000:2026 3.5.13, 3.6.4, 3.8.6, 4.2.6 and 4.2.7 (interpretive summaries, not the official text) · Examples are illustrative.</footer>';
 return TBX.reportDoc(L,'RCA Report — مدثر سلامه',body,'.ok{color:#2F7D4B;font-weight:700;text-align:center}.bad{color:#B42318;font-weight:700}td.bad{text-align:center}.na{color:#7A869E;text-align:center}td.warn{color:#86520F;font-weight:700}ul{padding-inline-start:20px}h3{font-family:Georgia,serif;margin:22px 0 4px;font-size:17px}h4{margin:14px 0 4px;font-size:14.5px}.an{border-top:1px solid #DCE4EE;padding-top:6px;break-inside:auto}.an th{background:#F3F7FB;color:#1B2A4A}.an tbody th{width:30%}.dg{margin:12px 0;border:1px solid #DCE4EE;border-radius:10px;padding:6px;overflow-x:auto;break-inside:avoid}.dg svg{display:block;max-width:100%;height:auto;margin:auto}.cs td{font-size:13px}td.n{direction:ltr;text-align:end;font-family:Georgia,serif;white-space:nowrap}tr.vf td{background:#F3F6FB}.cover{border-bottom:4px solid #B8901E;padding:18px 0 14px;margin-bottom:8px}.cover h1{border:0;margin:6px 0}.cover .kick{color:#B8901E;font-weight:700;letter-spacing:.04em;margin:0}.cover .sub{font-size:18px;margin:4px 0}@media print{.dg{page-break-inside:avoid}}');
}
function stamp(){ return today(); }
function renderReport(){
 var prev=document.getElementById("rpPrev"); if(!prev) return;
 if(!DB.records.length){ prev.innerHTML='<p class="pd-sub" style="color:var(--ink-soft)">'+esc(t("rpEmpty"))+'</p>'; return; }
 var c=counts(), au=auditSummary();
 prev.innerHTML='<div class="pd-kpis">'+TBX.kpi(c.n,t("kTotal"))+TBX.kpi(pct(c.root,c.n),t("kRoot"))+TBX.kpi(openItems().length,t("kOpen"))+TBX.kpi(au.rate===null?"—":au.rate+"%",t("kAud"))+'</div>';
}
document.getElementById("rpHtml").addEventListener("click",function(){
 var err=document.getElementById("rpErr"); err.textContent="";
 if(!DB.records.length && !Object.keys(DB.assess).length){ err.textContent=t("rpEmpty"); return; }
 TBX.download("RCA-report-"+stamp()+".html","text/html;charset=utf-8",buildReportHTML());
});
document.getElementById("rpCsv").addEventListener("click",function(){ var err=document.getElementById("rpErr"); err.textContent=""; if(!DB.records.length){ err.textContent=t("rpEmpty"); return; } TBX.download("RCA-investigations-"+stamp()+".csv","text/csv;charset=utf-8",buildCSV()); });
document.getElementById("dCsv").addEventListener("click",function(){ if(!DB.records.length) return; TBX.download("RCA-investigations-"+stamp()+".csv","text/csv;charset=utf-8",buildCSV()); });

/* ---------- platform identity: academy logo and related tools ---------- */
var LOGO="__LOGO__";
function applyLogo(){ document.querySelectorAll("img[data-logo]").forEach(function(i){ if(i.src!==LOGO) i.src=LOGO; i.alt=t("logoAlt"); }); }
var RELATED=[["capa","CAPA","./capa.html","#C2410C"],["pareto","Pareto","./pareto.html","#B8901E"],["fish","Fishbone","./fishbone.html","#1E8C93"],["why5","5 Whys","./five-whys.html","#3563C9"],["aud","ISO 19011","./smart-audit-improvement.html","#C9821A"]];
function buildRelated(){
 var box=document.getElementById("homeStd"); if(!box) return;
 box.innerHTML='<p class="hs-t">'+esc(t("related"))+'</p>'+RELATED.map(function(r){ return '<a class="hs on" href="'+r[2]+'" target="_blank" rel="noopener" style="--c:'+r[3]+';--t:'+r[3]+'14"><b dir="ltr">'+r[1]+'</b><span>'+esc(t("rel_"+r[0]))+'</span><em>↗</em></a>'; }).join("");
}

/* ---------- example data (illustrative, fictitious Saudi company) and clear all ---------- */
__EXAMPLE__
function loadExample(){
 DB={records:JSON.parse(JSON.stringify(EXAMPLE[L]||EXAMPLE.ar)),assess:JSON.parse(JSON.stringify(EXAMPLE_AS))};
 pendingDelete=null; var ok=persist(); clearForm(); renderAll();
 var m=document.getElementById("exMsg"); if(m) m.textContent=ok?t("exLoaded"):t("savedFail");
}
function clearAll(){
 DB={records:[],assess:{}}; pendingDelete=null; ST=null;
 TBX.drop(STORE);
 clearForm(); renderAll();
 document.getElementById("stTable").hidden=true; document.getElementById("stMsg").textContent="";
 var m=document.getElementById("exMsg"); if(m) m.textContent=t("exCleared");
 var a=document.getElementById("asMsg"); if(a) a.textContent="";
}
/* the tour layer asks for confirmation before the example replaces data (guard "pfEx": "all"); clearing asks here */
document.getElementById("pfEx").addEventListener("click",function(){ loadExample(); });
document.getElementById("pfReset").addEventListener("click",function(){ var ok=true; try{ ok=window.confirm(t("exConfirmClear")); }catch(e){ ok=true; } if(ok) clearAll(); });

/* ---------- assistant: answers from the tool's own guide and your investigations (rule-based, no AI service) ---------- */
var CONTACT_EMAIL="moddathersalama.eng@gmail.com";
var CB={
 ar:{fab:"اسأل عن تحليل السبب الجذري",title:"مساعد RCA",sub:"إجابات فورية من دليل الأداة وتحقيقاتك",new:"محادثة جديدة",close:"إغلاق",ph:"اكتب سؤالك…",send:"إرسال",inL:"سؤالك",
  hello:"مرحباً. أجيب عن أسئلة تحليل السبب الجذري من دليل الأداة ومن تحقيقاتك المحفوظة في هذا المتصفح. اختر سؤالاً أو اكتب سؤالك.",
  miss:"لم أجد إجابة جاهزة لهذا السؤال. جرّب أحد الأسئلة المقترحة، أو اسأل عن: عدد الأسباب الجذرية، أو اختيار الطريقة، أو الخطأ البشري، أو عمق التحقيق، أو اختبار السبب الجذري، أو السبب المساهم. وللاستشارة راسل المُعِد على البريد أدناه.",
  instant:"إجابة فورية",foot:"المساعد يعمل في متصفحك ولا يرسل بياناتك. للتواصل:",
  op0:"لا توجد بنود مفتوحة في تحقيقاتك الآن.",st0:"لا توجد تحقيقات بعد. ابدأ من [[tab:tools]] أو حمّل المثال من [[tab:docs]]."},
 en:{fab:"Ask about root cause analysis",title:"RCA assistant",sub:"Instant answers from the tool's guide and your investigations",new:"New chat",close:"Close",ph:"Type your question…",send:"Send",inL:"Your question",
  hello:"Hello. I answer root cause analysis questions from the tool's guide and from your investigations saved in this browser. Pick a question or type your own.",
  miss:"I have no ready answer for that. Try one of the suggested questions, or ask about the number of root causes, choosing the method, human error, the depth of investigation, testing a root cause or contributing causes. For advice, email the author at the address below.",
  instant:"Instant answer",foot:"The assistant runs in your browser and sends no data. Contact:",
  op0:"No open items in your investigations right now.",st0:"No investigations yet. Start from the [[tab:tools]] or load the example in [[tab:docs]]."}
};
var KB=[
 {id:"one",k:["سبب واحد","سبب جذري واحد","دائما","دائماً","اكثر من سبب","أكثر من سبب","one root","single","always one","more than one","multiple"],q:{ar:"هل يوجد دائماً سبب جذري واحد؟",en:"Is there always one root cause?"},
  a:{ar:"لا. **للمشكلة غالباً أكثر من سبب جذري**، والأسباب المساهمة مهمة أيضاً. تعريف «الإجراء التصحيحي» في ISO 9000:2026 ‏(3.6.4) نفسه يتحدث عن إزالة «سبب أو أسباب» عدم المطابقة. في مثال الخرسانة سببان جذريان معاً: الصب في ساعات الحر بلا نافذة متفق عليها، وعقد لا يطلب تبريد ماء الخلط. إزالة أحدهما تقلل الرفض ولا توقفه. لذلك تسمح الأداة بأكثر من سبب جذري، ويُطلب لكل منها دليل واختبار وإجراء بمالك. التفاصيل في [[tab:explain-std]].",
   en:"No. **A problem often has more than one root cause**, and contributing causes matter too. The ISO 9000:2026 term “corrective action” (3.6.4) itself speaks of eliminating the “cause(s)” of a nonconformity. In the concrete example there are two root causes together: pouring in the hot hours with no agreed window, and a contract that does not require chilled mixing water. Removing one of them reduces rejections but does not stop them. That is why the tool allows more than one root cause, each with its own evidence, test and action with an owner. Details in the [[tab:explain-std]]."}},
 {id:"which",k:["أيهما","ايهما","أي طريقة","اي طريقة","5 whys","لماذا الخمس","fishbone","عظمة السمكة","which","method","طريقة","choose","اختار"],q:{ar:"RCA أم لماذا الخمس أم عظمة السمكة: أيها أستخدم؟",en:"RCA, 5 Whys or Fishbone — which one?"},
  a:{ar:"هي ليست بدائل. **تحليل السبب الجذري هو التحقيق كله**، ويختار من أدوات الصندوق ما يناسب المشكلة: **باريتو** ليحدد أين تبحث عندما تكثر الحالات، و**عظمة السمكة** لترسم الأسباب المحتملة عندما تتعدد المسارات، و**لماذا الخمس** لتحفر في مسار واحد واضح، و**البيانات** لتثبت السبب أو تستبعده. المشكلة البسيطة ذات المسار الواحد تكفيها سلسلة لماذا الخمس بعمق خفيف، والمشكلة الجسيمة تحتاج طريقتين على الأقل وتحققاً بالبيانات. سجّل كل طريقة برقمها في «الطرق المستخدمة» في [[tab:tools]].",
   en:"They are not alternatives. **Root cause analysis is the whole investigation**, and it picks from the toolbox what fits the problem: **Pareto** to choose where to look when there are many cases, **Fishbone** to map the possible causes when there are several paths, **5 Whys** to dig down one clear path, and **data** to prove a cause or rule it out. A simple problem with one path needs only a 5 Whys chain at light depth; a severe problem needs at least two methods and a check with data. Record each method with its id under “Methods used” in the [[tab:tools]]."}},
 {id:"human",k:["خطأ بشري","الخطأ البشري","إهمال","اهمال","human error","human","operator","negligence","blame","لوم"],q:{ar:"هل «الخطأ البشري» سبب جذري؟",en:"Is “human error” a root cause?"},
  a:{ar:"لا. **الخطأ البشري نقطة بداية للسؤال، وليس سبباً جذرياً.** اسأل: ما الذي في العملية سمح بالخطأ أو جعله سهلاً؟ الطريقة، أو النموذج، أو التصميم، أو التدريب، أو عبء العمل، أو الضابط الذي لم يمنعه. ويطلب البند 8.5.1 ز) من ISO 9001:2026 تنفيذ إجراءات لمنع الخطأ البشري، أي أن المنع يُبنى في العملية. تنبّه الأداة عندما يشير سبب إلى شخص فقط، ويفشل فحص «لا سبب جذري يشير إلى شخص فقط» في [[tab:audit]].",
   en:"No. **Human error is a starting point for questions, not a root cause.** Ask what in the process allowed the error or made it easy: the method, the form, the design, the training, the workload or the control that did not stop it. ISO 9001:2026 clause 8.5.1 g) requires actions to prevent human error, which means prevention is built into the process. The tool warns when a cause points at a person only, and the check “No root cause names a person only” fails in the [[tab:audit]]."}},
 {id:"depth",k:["عمق","depth","how deep","مدى التحقيق","extent","خفيف","كامل","light","full"],q:{ar:"إلى أي عمق يجب أن يذهب التحقيق؟",en:"How deep should the investigation go?"},
  a:{ar:"بحسب **الخطر والأثر، لا العادة**. يترك الملحق A.10.2 للمنشأة أن تقرر مدى التحقيق والطرق، مع مراعاة خطر التكرار والأثر ومتطلبات العملاء. في الأداة تختار الخطورة واحتمال التكرار، فتحدد الشبكة العمق: **خفيف** (تصحيح وتحقق)، أو **قياسي** (طريقة واحدة بدليل)، أو **كامل** (طريقتان أو أكثر وتحقق بالبيانات ومراجعة مستقلة). يجوز رفع العمق، ولا يجوز خفضه إلا بسبب مكتوب.",
   en:"By **risk and impact, not habit**. Annex A.10.2 leaves the extent of investigation and the methods to the organization, considering the risk of recurrence, the impact and customer requirements. In the tool you choose the severity and the likelihood of recurrence, and the grid sets the depth: **light** (correction and a check), **standard** (one method with evidence) or **full** (two methods or more, verification with data and an independent review). You may raise the depth; you may lower it only with a written reason."}},
 {id:"test",k:["اختبار","اختبر","أثبت","اثبت","test","verify","prove","confirm","تأكيد","فرضية","hypothesis"],q:{ar:"كيف أختبر السبب الجذري؟",en:"How do I test a root cause?"},
  a:{ar:"**السبب الجذري فرضية حتى يثبتها الدليل والاختبار.** اسأل: إذا أُزيل هذا السبب، هل تتوقف المشكلة أو تقل؟ ثم ابحث عن دليل: بيانات تقارن مجموعتين (مثل نسبة الرفض في الصب ظهراً مقابل المساء)، أو سجلات، أو تجربة صغيرة. في الأداة، لكل سبب جذري حالة (فرضية، مؤكد، مستبعد)، ودليل، وجواب لاختبار الإزالة. ولا تتجاوز المرحلة «حُددت الأسباب» قبل أن يكون كل سبب جذري مؤكداً ومختبراً.",
   en:"**A root cause is a hypothesis until evidence and a test confirm it.** Ask: if this cause is removed, does the problem stop or fall? Then look for evidence: data comparing two groups (such as the rejection rate for noon pours against evening pours), records, or a small trial. In the tool, each root cause has a status (hypothesis, confirmed, ruled out), its evidence, and an answer to the removal test. The stage does not move past “Causes mapped” until every root cause is confirmed and tested."}},
 {id:"contrib",k:["مساهم","مساهمة","مباشر","contributing","direct cause","direct","levels","مستويات"],q:{ar:"ما الفرق بين السبب المباشر والمساهم والجذري؟",en:"Direct, contributing and root cause: what is the difference?"},
  a:{ar:"**السبب المباشر** هو ما أحدث المشكلة فعلياً (وصلت الخرسانة بحرارة فوق الحد). **السبب المساهم** جعلها أرجح أو أسوأ (الصب بين الظهر والرابعة، ومدة النقل الطويلة). **السبب الجذري** هو ما في النظام إذا أُزيل توقفت المشكلة أو قلّت (لا نافذة صب متفق عليها في الصيف، ولا بند في العقد يطلب تبريد الماء). شجرة الأسباب في [[tab:tools]] ترسمها بهذا الترتيب.",
   en:"The **direct cause** is what actually produced the problem (the concrete arrived above the temperature limit). A **contributing cause** made it more likely or worse (pours between noon and 4 pm, long travel time). The **root cause** is what in the system, if removed, stops the problem or makes it fall (no agreed summer pour window, and no contract clause requiring chilled water). The cause tree in the [[tab:tools]] draws them in that order."}},
 {id:"open",dyn:"open",k:["مفتوح","مفتوحة","متابعة","open items","follow"],q:{ar:"ما البنود المفتوحة في تحقيقاتي؟",en:"What is still open in my investigations?"}},
 {id:"status",dyn:"status",k:["وضع","حالة","ملخص","status","summary","where do we stand"],q:{ar:"ما وضع تحقيقاتي الآن؟",en:"Where do my investigations stand?"}}
];
var CB_SUG=["one","which","human","depth","status"];
function kbDyn(id){
 var u=CB[L]||CB.ar;
 if(id==="open"){ var O=openItems(); if(!O.length) return u.op0+"\n\n[[tab:dash]]"; return O.map(function(x){ return "- **"+(x.r.ref||x.r.id)+"** — "+x.s; }).join("\n")+"\n\n[[tab:docs]] · [[tab:dash]]"; }
 if(id==="status"){ var c=counts(); if(!c.n) return u.st0; return "- "+t("kTotal")+": **"+c.n+"**\n- "+t("kRoot")+": **"+c.root+"**\n- "+t("kCrit")+": **"+c.crit+"**\n- "+t("kRev")+": **"+c.rev+"**\n- "+t("kOpen")+": **"+openItems().length+"**\n- "+t("kAs")+": **"+assessScore()+"%**\n\n[[tab:dash]] · [[tab:audit]]"; }
 return "";
}
function cbNorm(s){ return String(s).replace(/[ً-ْـ]/g,"").replace(/[أإآ]/g,"ا").replace(/ة/g,"ه").replace(/ى/g,"ي").toLowerCase(); }
function cbFind(text){ var q=cbNorm(text), best=null, bs=0; KB.forEach(function(f){ var s=0; f.k.forEach(function(k){ var nk=cbNorm(k); if(nk.length<3){ if(new RegExp("(^|[^a-z0-9])"+nk.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")+"([^a-z0-9]|$)").test(q)) s+=1; } else if(q.indexOf(nk)>=0) s+=k.length>4?2:1; }); if(cbNorm(f.q.ar)===q||cbNorm(f.q.en)===q) s+=10; if(s>bs){ bs=s; best=f; } }); return bs>0?best:null; }
function cbInline(s){ s=esc(s).replace(/\*\*([^*]+)\*\*/g,"<b>$1</b>"); return s.replace(/\[\[tab:([a-z-]+)\]\]/g,function(m,id){ var b=document.querySelector('#side button[data-go="'+id+'"] .tl'); return b?'<button type="button" class="cl" data-cbgo="'+id+'">'+esc(b.textContent)+'</button>':""; }); }
function cbMd(text){ var h="", list=false; String(text).split("\n").forEach(function(line){ var x=line.trim(), m; if(!x){ if(list){ h+="</ul>"; list=false; } return; } if((m=x.match(/^[-•]\s+(.*)$/))){ if(!list){ h+="<ul>"; list=true; } h+="<li>"+cbInline(m[1])+"</li>"; return; } if(list){ h+="</ul>"; list=false; } h+="<p>"+cbInline(x)+"</p>"; }); if(list) h+="</ul>"; return h; }
var cbTurns=[];
function cbAdd(kind,html){ var b=document.getElementById("cbBody"), d=document.createElement("div"); d.className="cb-msg "+kind; d.innerHTML=html; b.appendChild(d); b.scrollTop=b.scrollHeight; return d; }
function cbRender(){ var b=document.getElementById("cbBody"); b.innerHTML=""; cbAdd("bot",cbMd((CB[L]||CB.ar).hello)); cbTurns.forEach(function(x){ cbAdd(x.k,x.h); }); document.getElementById("cbSug").style.display=cbTurns.length?"none":""; }
function cbAnswer(f){ var u=CB[L]||CB.ar; return f?'<span class="kb-tag">'+esc(u.instant)+'</span>'+cbMd(f.dyn?kbDyn(f.dyn):f.a[L]):cbMd(u.miss); }
function cbSend(text,id){
 text=String(text||"").trim(); if(!text) return;
 var inp=document.getElementById("cbIn"); inp.value=""; inp.style.height="";
 document.getElementById("cbSug").style.display="none";
 var me=esc(text); cbAdd("me",me); cbTurns.push({k:"me",h:me});
 var f=id?KB.filter(function(x){ return x.id===id; })[0]:cbFind(text), h=cbAnswer(f);
 cbAdd("bot",h); cbTurns.push({k:"bot",h:h});
}
function cbLang(){
 var u=CB[L]||CB.ar, set=function(id,v){ var e=document.getElementById(id); if(e) e.textContent=v; };
 set("cbFabLbl",u.fab); set("cbTitle",u.title); set("cbSub",u.sub); set("cbNew",u.new); set("cbSend",u.send); set("cbInL",u.inL);
 document.getElementById("cbClose").setAttribute("aria-label",u.close); document.getElementById("cbFab").setAttribute("aria-label",u.fab);
 document.getElementById("cbIn").placeholder=u.ph;
 document.getElementById("cbFoot").innerHTML=esc(u.foot)+' <a href="mailto:'+CONTACT_EMAIL+'">'+CONTACT_EMAIL+'</a>';
 document.getElementById("cbSug").innerHTML=CB_SUG.map(function(id){ var f=KB.filter(function(x){ return x.id===id; })[0]; return '<button type="button" data-sid="'+id+'">'+esc(f.q[L])+'</button>'; }).join("");
 cbTurns=[]; cbRender();
}
function cbOpen(on){ var p=document.getElementById("cb"), f=document.getElementById("cbFab"); p.hidden=!on; f.setAttribute("aria-expanded",on?"true":"false"); if(on){ setTimeout(function(){ document.getElementById("cbIn").focus(); },60); } else f.focus(); }
document.getElementById("cbFab").addEventListener("click",function(){ cbOpen(true); });
document.getElementById("cbClose").addEventListener("click",function(){ cbOpen(false); });
document.getElementById("cbNew").addEventListener("click",function(){ cbTurns=[]; cbRender(); });
document.getElementById("cbForm").addEventListener("submit",function(e){ e.preventDefault(); cbSend(document.getElementById("cbIn").value); });
document.getElementById("cbIn").addEventListener("keydown",function(e){ if(e.key==="Enter"&&!e.shiftKey&&!e.isComposing){ e.preventDefault(); cbSend(this.value); } });
document.getElementById("cb").addEventListener("click",function(e){
 var s=e.target.closest("[data-sid]"); if(s){ cbSend(s.textContent,s.getAttribute("data-sid")); return; }
 var g=e.target.closest("[data-cbgo]"); if(g){ go(g.getAttribute("data-cbgo")); if(window.innerWidth<560) cbOpen(false); }
});
document.addEventListener("keydown",function(e){ if(e.key==="Escape"&&!document.getElementById("cb").hidden&&!(window.CIAEX&&document.querySelector("#ex-drawer.on"))) cbOpen(false); });

/* ---------- render and wiring ---------- */
function renderAll(){ renderDocs(); renderAudit(); renderDash(); renderReport(); renderAssess(); renderHomeSt(); refreshForm(); }
document.getElementById("rec-form").addEventListener("submit",function(e){ e.preventDefault(); saveRecord(); });
document.getElementById("rec-form").addEventListener("input",function(e){ if(e.target&&e.target.tagName==="TEXTAREA") autoSize(e.target); refreshForm(); });
document.getElementById("rec-form").addEventListener("change",function(){ refreshForm(); });
document.getElementById("newBtn").addEventListener("click",function(){ clearForm(); });
document.getElementById("langBtn").addEventListener("click",function(){ switchLang(); });
window.addEventListener("hashchange",function(){ var h=location.hash.slice(1); if(h!==curTab) go(h); });
window.addEventListener("storage",function(e){ if([PDCA_KEY,CAPA_KEY,PARETO_KEY,FISH_KEY,WHY5_KEY].indexOf(e.key)>=0){ renderHomeSt(); fillLists(); if(ST) stPreview(true); refreshForm(); } });

/* ---------- boot ---------- */
/* a link from CAPA or Pareto may ask to open an investigation (?open=ID), to start one from a CAPA record (?capa=ID) or from a Pareto
   category (?pareto=ID&cat=CAT); inside the hub the same request arrives as a one-time sessionStorage hint */
function navRequest(){
 var q={}; try{ var u=new URLSearchParams(location.search); if(u.get("open")) q.open=u.get("open"); if(u.get("capa")) q.capa=u.get("capa"); if(u.get("pareto")){ q.pareto=u.get("pareto"); q.cat=u.get("cat")||""; } }catch(e){}
 try{ var h=JSON.parse(sessionStorage.getItem(NAV_KEY)||"null"); sessionStorage.removeItem(NAV_KEY); if(h&&typeof h==="object"){ if(h.open) q.open=String(h.open); if(h.capa) q.capa=String(h.capa); if(h.pareto){ q.pareto=String(h.pareto); q.cat=String(h.cat||""); } } }catch(e){}
 return q;
}
applyLang();
(function(){
 var q=navRequest(), r=q.open?DB.records.filter(function(x){ return x.id===q.open; })[0]:null;
 if(r){ loadRecordIntoForm(r); go("tools"); return; }
 if(q.capa && prefillFromCapa(q.capa)) return;
 if(q.pareto && prefillFromPareto(q.pareto,q.cat)) return;
 go((location.hash||"#home").slice(1));
})();
