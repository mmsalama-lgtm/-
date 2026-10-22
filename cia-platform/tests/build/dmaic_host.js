/* ===== DMAIC tool — host logic. Projects and assessment are stored in this browser only (localStorage, wrapped in try/catch). =====
   Storage key "cia-dmaic:v1" (this tool only). Schema:
   { records: [ {
       id, title, ref, src: "a3"|"rca"|"pareto"|"capa"|"kpi"|"audit"|"idea",
       lead (project lead), sponsor (reviews each gate; not the lead), owner (process owner who takes the hand-over), area,
       start (YYYY-MM-DD), a3 (A3 id), rca (RCA investigation id), pareto (Pareto analysis id), pcat (its category id), capa (CAPA record id),
       pdca (PDCA cycle id),
       team:  [ {n, role} ]
       def:   {problem, cost, customer, ctq: [ {t, spec} ] (5 at most), scin, scout,                    D  Define: the charter
               sip: {s, i, steps: [ {t} ] (5–7), o, c}}                                                    SIPOC
       goal:  {measure, from, to (numbers|null), by (YYYY-MM-DD), date (date the goal was written),   the goal is written in Define, before the
               orig (number|null, the first target if changed), why}                                   analysis (date ≤ an.date); a change needs a reason
       meas:  {what, unit, source, sample,                                                             M  Measure: operational definition
               msa: {method: ""|"grr"|"attr"|"ref"|"cal"|"other", res, rule, verdict: ""|"pass"|"part"|"fail", date},   measurement check
               kind: "rate"|"meas", stat: "rate"|"mean"|"median", period, date (date the baseline was fixed; the check comes first),
               lsl, usl (numbers|null, specification limits for measured values), pareto (Pareto analysis id for the baseline),
               pts: [ {l, d, n (rate: defects of units), v (measured value)} ] (24 at most)}
       an:    {date (analysis started), causes: [ {id, t, how: "fish"|"why5"|"rca"|"here", ref, st: "hyp"|"conf"|"out", ev,   A  Analyse
               chk: {kind: ""|"rate"|"mean"|"link", ga, xa, na, sa, gb, xb, nb, sb}} ]}             two-group data check (rate: defects of units;
                                                                                                         mean: mean, n, SD) or a linked analysis
       imp:   {sols: [ {id, cause (cause id), t, where, from, to (pilot dates), val (number|null, pilot   I  Improve: solutions tied to proved
               result on the goal measure), n (pilot sample), risk, ctrl, dec: ""|"roll"|"adapt"|"stop"} ]}   causes, piloted, risks controlled
       ctl:   {plan: [ {m, target, freq, who, react} ], measure, same: true|false, from, to,            C  Control: control plan, after-change data
               pts: [ {l, d, n, v} ] (24 at most), res: ""|"met"|"part"|"not", std, open, next, handTo, hdate}   on the same measure, hand-over
       gates: {D|M|A|I|C: {date, by, q (questions asked), dec: ""|"go"|"rework"|"stop"}}             tollgate reviews by the sponsor
       created, updated } ],
     assess: { DF1..GT1: 0|1|2 } }
   Other tools' keys are only read, never written: "cia-a3:v1" (start from an A3, previews), "cia-rca:v1" (start from an investigation,
   candidate causes), "cia-pareto:v1" (start from a vital-few category, the baseline chart), "cia-fish:v1" and "cia-why5:v1" (candidate
   causes and previews), "cia-capa:v1" (previews) and "cia-pdca:v1" (cycle names). RCA, Fishbone, 5 Whys and Pareto open through their own
   requests (?open=, ?capa=, ?pareto=&cat= or their one-time sessionStorage hints "cia-nav:rca", "cia-nav:fishbone", "cia-nav:five-whys",
   "cia-nav:pareto"); A3 through ?open= or "cia-nav:a3". This tool reads its own hint "cia-nav:dmaic" ({open} | {a3} | {rca} |
   {pareto, cat}) and its address (?open=, ?a3=, ?rca=, ?pareto=&cat=) once; none of them holds tool data. */
var LKEY="cia-lang", STORE="cia-dmaic:v1", A3_KEY="cia-a3:v1", RCA_KEY="cia-rca:v1", CAPA_KEY="cia-capa:v1", PARETO_KEY="cia-pareto:v1", FISH_KEY="cia-fish:v1", WHY5_KEY="cia-why5:v1", PDCA_KEY="cia-pdca:v1",
    NAV_KEY="cia-nav:dmaic", A3_NAV="cia-nav:a3", RCA_NAV="cia-nav:rca", FISH_NAV="cia-nav:fishbone", WHY5_NAV="cia-nav:five-whys", PARETO_NAV="cia-nav:pareto";
var L=(function(){ try{ return localStorage.getItem(LKEY)||"ar"; }catch(e){ return "ar"; } })();
var TABS=["home","explain-std","explain-cl","assess","tools","docs","audit","dash","report","ai"];
var TITLES={ar:"DMAIC | مشروع التحسين بمنهج DMAIC — مدثر سلامه",en:"DMAIC | DMAIC improvement project — مدثر سلامه"};
var PH=["D","M","A","I","C"], STAGES=["D","M","A","I","C","closed","stop"];
var SCOL={D:"#C2410C",M:"#3563C9",A:"#1B2A4A",I:"#C9821A",C:"#1E8C93",closed:"#3C9A5F",stop:"#9AA5B8"};
var SRCS=["a3","rca","pareto","capa","kpi","audit","idea"];
var HOWS=["fish","why5","rca","here"], CST=["hyp","conf","out"], CHKS=["rate","mean","link"], MSAM=["grr","attr","ref","cal","other"], VERD=["pass","part","fail"],
    KINDS=["rate","meas"], STATS=["rate","mean","median"], DECS=["roll","adapt","stop"], GDEC=["go","rework","stop"], RESS=["met","part","not"];
var RCOL={met:"#3C9A5F",part:"#C9821A",not:"#B42318",none:"#9AA5B8"};
var MAXROWS=30, MAXPTS=24, MAXCTQ=5, MAXSTEPS=7, MINPTS=4;
var DB=load();
var curTab="home";
var editing=null;   /* deep copy of the project open in the form: keeps created between saves */
var ST=null;        /* rows of the read-only start preview */

var UI={
ar:{brand:"أكاديمية التحسين المستمر · مدثر سلامه",toolName:"أداة DMAIC — مشروع تحسين قائم على البيانات",sgLearn:"التعلّم",sgWork:"العمل",sgOut:"المخرجات",
 nHome:"الرئيسية",nStd:"دليل المنهجية",nCl:"دليل البنود",nAssess:"التقييم الذاتي",nTools:"مشروع DMAIC",nDocs:"السجلات",nAudit:"التدقيق",nDash:"لوحة المؤشرات",nReport:"التقرير",nAi:"المساعد الذكي",soon:"قريباً",
 homeCode:"التعريف · القياس · التحليل · التحسين · الضبط",homeH1:"مشروع التحسين بمنهج DMAIC",
 homeLede:"مشروع تحسين قائم على البيانات لمشكلة سببها غير معروف وعمليتها قابلة للقياس، في خمس مراحل تنتهي كل منها ببوابة مراجعة يجريها الراعي بالأسئلة: التعريف (الميثاق والهدف)، والقياس (تعريف المقياس والتحقق من الثقة فيه والأساس)، والتحليل (أسباب مثبتة بالبيانات)، والتحسين (حلول مجرّبة)، والضبط (خطة ضبط وتسليم لمالك العملية). وتستخدم الأداة صندوق الأدوات ولا تحل محله.",
 homeNote:"النسخة الحالية تحفظ المشاريع في متصفحك فقط. الحفظ على الخادم وتسجيل الدخول يُضافان في مرحلة المنصة المشتركة.",
 prep:"إعداد",authorName:"مدثر سلامه",cycleT:"ما الذي تستطيع فعله هنا",cycleS:"اقرأ دليل المنهجية، ثم قيّم ممارستكم لمنهج DMAIC، ثم افتح أول مشروع من صفحة A3 أو تحقيق RCA أو فئة حيوية في باريتو أو من الصفر.",
 tStd:"متى يناسب DMAIC ومتى لا يناسب، والمراحل الخمس وبواباتها، والميثاق ومتطلبات العميل الحرجة، وتعريف المقياس والثقة فيه، وإثبات الأسباب بالبيانات، والتجربة، وخطة الضبط والتسليم.",tCl:"بنود ISO 9001:2026 التي يخدمها المنهج، من دورة PDCA في المقدمة (0.3.2) إلى الأهداف 6.2 وموارد القياس 7.1.5 والتحليل 9.1.3 والإجراء التصحيحي 10.2: ملخص تفسيري ومثال وما يطلبه المدقق.",tAssess:"اثنا عشر سؤالاً تقيس ممارسة DMAIC لديكم، من الميثاق والهدف حتى التسليم ومراجعات البوابات.",
 tTools:"مشروع لكل مشكلة في خمس مراحل ببوابة لكل مرحلة: الميثاق وSIPOC والهدف، والمقياس والتحقق منه والأساس برسم تشغيلي، والأسباب وفحصها بالبيانات، والحلول وتجربتها، وخطة الضبط والنتيجة بعد التغيير.",tDocs:"كل المشاريع بمرحلتها ونتيجتها وتنبيهاتها، وبيانات المثال.",tAudit:"فحص آلي لكل مشروع: الميثاق، والنطاق وSIPOC، والهدف وتاريخه، والتحقق من المقياس قبل الأساس، والأساس، والأسباب المثبتة، والحلول المجرّبة، وخطة الضبط، والنتيجة، والتسليم، والبوابات.",
 tDash:"الأهداف المحققة بعد التغيير، والمراحل المجتازة ببواباتها، والمقاييس الموثوقة، والأسباب المثبتة، والمراحل، والنتائج، والمصادر، والبنود المفتوحة، والتقييم الذاتي.",tReport:"تقرير HTML لكل مشروع بخريطة مراحله وميثاقه وSIPOC ورسمي الأساس وما بعد التغيير وفحص الأسباب والتجربة وخطة الضبط والبوابات، وملف CSV.",tAi:"مساعد يقرأ المشروع ويقترح أسئلة البوابة. لم يُفعَّل بعد.",
 foot:"المراجع: ISO 9001:2026 المقدمة 0.3.2 والبنود 6.2 و7.1.5 و7.1.6 و8.5.1 و8.5.6 و9.1.1 و9.1.3 و10.1 و10.2 والملحقان A.7.1.5 وA.10.2، ومصطلحات ISO 9000:2026 ومبادئها (ملخصات تفسيرية، وليست النص الرسمي). DMAIC منهج للتحسين، وليس بنداً في أي مواصفة. الأمثلة توضيحية وليست بيانات حقيقية.",
 heroTag:"أداة منهجية · مشروع تحسين قائم على البيانات بخمس مراحل وبوابات",langSw:"English",langSwA:"Switch to English",logoAlt:"أكاديمية التحسين المستمر — مدثر سلامه",
 related:"أدوات مرتبطة في الأكاديمية",rel_a3:"حل المشكلات بأسلوب A3",rel_rca:"تحليل السبب الجذري — التحقيق",rel_pareto:"باريتو — تحليل القلة الحيوية",rel_fish:"عظمة السمكة — تحليل السبب والنتيجة",rel_why5:"لماذا الخمس — تحليل السبب الجذري",rel_capa:"الإجراءات التصحيحية",rel_pdca:"دورة PDCA",
 termT:"هل DMAIC بند في ISO 9001:2026؟",
 termP1:"لا. DMAIC منهج للتحسين (دورة التحسين في Six Sigma: التعريف، والقياس، والتحليل، والتحسين، والضبط)، وليس بنداً في أي مواصفة. هو مشروع قائم على البيانات لمشكلة سببها غير معروف وعمليتها قابلة للقياس. وتذكر ISO 9001:2026 دورة PDCA في مقدمتها (0.3.2)، وتقول ملاحظة البند 9.1.3 إن طرق تحليل البيانات قد تشمل تقنيات إحصائية؛ والمقدمة والملاحظات شرح وليست متطلبات.",
 termP2:"وفي الممارسة: DMAIC للمشكلة التي لا يُعرف سببها ويمكن جمع بياناتها؛ أما الحل المعروف فمشروع تنفيذ لا DMAIC. ويُكتب الهدف في مرحلة التعريف قبل التحليل ولا يُحرَّك. والمقياس الذي لا يُوثق به يجعل كل مرحلة بعده غير موثوقة، لذلك يُتحقق منه قبل الأساس. والإحصاء يخدم القرار، والأدوات البسيطة تكفي في أغلب الحالات. وتنتهي كل مرحلة ببوابة مراجعة يجريها الراعي بالأسئلة.",
 termP3:"وDMAIC يستخدم صندوق الأدوات ولا يحل محله: باريتو لتأطير المشكلة وتقسيم البيانات، وعظمة السمكة ولماذا الخمس للأسباب المحتملة، وRCA للتحقيق الكامل، وA3 لرواية القصة في صفحة واحدة، وPDCA لدورة الضبط، وCAPA عندما توجد حالة عدم مطابقة.",
 termIs:"ملخص تفسيري بصياغة مستقلة، وليس النص الرسمي. المصادر: ISO 9001:2026 المقدمة 0.3.2 والبنود 6.2 و7.1.5 و9.1.3 و10.2، وISO 9000:2026 المصطلحات المذكورة والمبدأ 4.2.7. أي مرجع لـ Six Sigma أو ISO 13053 أو مواصفات الإحصاء غير مرفوع: «غير متحقق منه». التحقق: 2026-10-16.",
 defs:[["الخاصية النوعية","ISO 9000:2026 · 3.10.2","خاصية متأصلة في الشيء ومرتبطة بمتطلب. منها تُشتق متطلبات العميل الحرجة (CTQ).","#C2410C"],["العملية","ISO 9000:2026 · 3.3.1","أنشطة مترابطة تستخدم المدخلات أو تحولها لتعطي نتيجة. وهذا ما يرسمه SIPOC.","#7A869E"],["القياس","ISO 9000:2026 · 3.11.4","عملية لتحديد قيمة. لذلك يُعرَّف المقياس ويُتحقق منه قبل الأساس.","#3563C9"],["الهدف","ISO 9000:2026 · 3.7.11","نتيجة يراد تحقيقها. يُكتب رقماً وتاريخاً في مرحلة التعريف.","#B8901E"],["القرار المبني على الدليل","ISO 9000:2026 · 4.2.7","فهم علاقات السبب والنتيجة، والوقائع وتحليل البيانات تعطي القرار موضوعية وثقة.","#1B2A4A"]],
 asT:"التقييم الذاتي لممارسة DMAIC",asS:"أجب عن كل سؤال بما يحدث فعلاً في مشاريع التحسين لديكم. النتيجة تقيس الممارسة الحالية، وليست شهادة ولا حكماً على الأداء.",asReset:"مسح الإجابات",asSaved:"تم حفظ الإجابة",asAnswered:"أُجيب {n} من 12",
 band0:"يحتاج عملاً",band1:"في طور التطوير",band2:"راسخ",bandNote:"حدود داخلية للتقييم الذاتي من تصميم هذه الأداة، وليست معياراً رسمياً.",as0:"غير موجود",as1:"جزئي",as2:"موجود ومطبّق",
 g_DF:"التعريف",g_ME:"القياس",g_AN:"التحليل",g_IM:"التحسين",g_CT:"الضبط والتسليم",g_GT:"البوابات",
 tlT:"مشروع DMAIC",tlS:"مشروع لكل مشكلة في خمس مراحل. لا تُحسب المرحلة التالية إلا بعد اجتياز بوابة المرحلة السابقة عند الراعي. تتحدد المرحلة تلقائياً مما تملؤه، وتُرسم خريطة المراحل والرسوم وأنت تكتب.",
 save:"حفظ المشروع",newRec:"مشروع جديد",savedFail:"تعذّر الحفظ في هذا المتصفح. نزّل التقرير قبل إغلاق الصفحة.",cur:"المرحلة الحالية:",ok_rec:"تم حفظ المشروع",
 st_D:"التعريف",st_M:"القياس",st_A:"التحليل",st_I:"التحسين",st_C:"الضبط",st_closed:"أُغلق بالتسليم",st_stop:"أُوقف عند بوابة",
 ph_D:"التعريف",ph_M:"القياس",ph_A:"التحليل",ph_I:"التحسين",ph_C:"الضبط",
 phS_D:"ميثاق المشروع: المشكلة وتكلفتها، والعميل ومتطلباته الحرجة، والنطاق، وSIPOC، والهدف بتاريخه.",phS_M:"تعريف المقياس، والتحقق من أن القياس يُوثق به، ثم الأساس بفترته وعينته.",phS_A:"أسباب محتملة من عظمة السمكة أو لماذا الخمس أو RCA، تُثبت أو تُستبعد بالبيانات لا بالتصويت.",phS_I:"حلول مرتبطة بأسباب مثبتة، تُجرَّب على نطاق صغير، وتُفحص مخاطر التغيير قبل التعميم.",phS_C:"خطة ضبط بردّ فعل عند الانحراف، والمقياس نفسه بعد التغيير، والنتيجة مقابل الهدف، ثم التسليم لمالك العملية.",
 mapT:"خريطة المراحل",mp_done:"اجتيزت البوابة",mp_cur:"قيد العمل",mp_todo:"لم تبدأ",mp_wait:"مكتملة وتنتظر البوابة",mp_stop:"أُوقف المشروع",mp_rework:"البوابة: إعادة عمل",
 sHdrT:"بيانات المشروع",sHdrS:"المرجع، وقائد المشروع، والراعي الذي يراجع البوابات، ومالك العملية الذي يتسلّم النتيجة، والفريق، والمصدر، والروابط مع أدوات الصندوق.",
 bProbT:"المشكلة والعميل",bScopeT:"النطاق وSIPOC",bGoalT:"الهدف · البند 6.2",bOpT:"التعريف التشغيلي للمقياس · البند 9.1.1",bMsaT:"هل يُوثق بالقياس؟ · البند 7.1.5",bBaseT:"الأساس · البند 9.1.3",bCzT:"الأسباب وفحصها بالبيانات · البند 10.2.1 ب) 2)",bSolT:"الحلول والتجربة · البند 8.5.6",bCpT:"خطة الضبط · البند 8.5.1",bAfT:"بعد التغيير: النتيجة مقابل الهدف · البند 10.2.1 د)",bHandT:"التوحيد والتسليم · البند 10.2.1 و)",
 f_title:"عنوان المشروع",f_ref:"رقم المرجع (إن وُجد)",f_src:"المصدر",f_lead:"قائد المشروع",f_sponsor:"الراعي (يراجع البوابات)",f_owner:"مالك العملية",f_start:"تاريخ بدء المشروع",f_area:"العملية أو الموقع",
 f_a3:"صفحة A3 المرتبطة",f_rca:"تحقيق RCA المرتبط",f_pareto:"تحليل باريتو المرتبط",f_pcat:"الفئة في باريتو",f_capa:"سجل CAPA المرتبط",f_pdca:"دورة PDCA المرتبطة",
 f_problem:"المشكلة كما تحدث",f_cost:"تكلفتها أو أثرها",f_customer:"العميل (داخلي أو خارجي)",f_scin:"داخل النطاق",f_scout:"خارج النطاق",f_sips:"الموردون (S)",f_sipi:"المدخلات (I)",f_sipo:"المخرجات (O)",f_sipc:"العملاء (C)",
 f_gmeasure:"مقياس الهدف",f_gfrom:"من",f_gto:"إلى",f_gby:"الموعد",f_gdate:"تاريخ كتابة الهدف",f_gorig:"الهدف الأول (إن عُدّل)",f_gwhy:"سبب تعديل الهدف",
 f_what:"ما الذي يُعدّ أو يُقاس بالضبط",f_unit:"الوحدة",f_source:"مصدر البيانات",f_sample:"العينة",f_mmethod:"طريقة التحقق من القياس",f_mres:"النتيجة",f_mrule:"قاعدة القبول المكتوبة",f_mverd:"الحكم",f_mdate:"تاريخ التحقق",
 f_kind:"نوع البيانات",f_stat:"الرقم الذي يقيسه الهدف",f_bperiod:"فترة الأساس",f_bdate:"تاريخ تثبيت الأساس",f_lsl:"الحد الأدنى للمواصفة",f_usl:"الحد الأعلى للمواصفة",f_bpareto:"أو تحليل باريتو للأساس",
 f_andate:"تاريخ بدء التحليل",
 f_ameasure:"المقياس بعد التغيير",f_asame:"المقياس نفسه وبالطريقة نفسها التي قيس بها الأساس",f_afrom:"الفترة من",f_ato:"إلى",f_ares:"النتيجة مقابل الهدف",f_astd:"ما الذي وُحّد (إجراء، نموذج، عقد، تدريب)",f_aopen:"ما بقي مفتوحاً",f_anext:"الخطوة التالية (دورة PDCA أو مشروع)",f_handto:"سُلّم إلى (مالك العملية)",f_hdate:"تاريخ التسليم",
 src_a3:"صفحة A3",src_rca:"تحقيق RCA",src_pareto:"فئة حيوية في باريتو",src_capa:"سجل CAPA",src_kpi:"مؤشر أداء",src_audit:"ملاحظة تدقيق",src_idea:"فكرة تحسين",
 mm_:"— اختر —",mm_grr:"تكرار وإعادة إنتاج (قياس متكرر)",mm_attr:"اتفاق المقيّمين (بيانات تصنيف)",mm_ref:"مقارنة بمرجع معاير",mm_cal:"معايرة الأجهزة",mm_other:"طريقة أخرى",
 vd_:"— اختر —",vd_pass:"يُوثق به",vd_part:"يُوثق به جزئياً",vd_fail:"لا يُوثق به",
 kd_rate:"نسبة عيوب (عيوب من وحدات)",kd_meas:"قيم مقاسة",sx_rate:"نسبة العيوب أو الخروج عن المواصفة",sx_mean:"المتوسط",sx_median:"الوسيط",
 tmN:"الاسم",tmRole:"الدور",tmAdd:"إضافة عضو",tmDel:"حذف",tmNone:"لم يُضف أحد بعد.",
 ctqT:"المتطلب الحرج للعميل (CTQ)",ctqSpec:"الحد أو المواصفة",ctqAdd:"إضافة متطلب",ctqNone:"لا متطلبات بعد.",ctqMax:"خمسة متطلبات على الأكثر.",
 stpT:"خطوة العملية (P)",stpAdd:"إضافة خطوة",stpNone:"لا خطوات بعد.",stpRule:"SIPOC: من 5 إلى 7 خطوات للعملية، من البداية إلى النهاية.",stpW:"خطوات العملية {n}: المطلوب من 5 إلى 7.",sipH:"SIPOC",
 ptL:"النقطة (فترة أو مجموعة)",ptD:"العيوب",ptN:"الوحدات",ptV:"القيمة",ptR:"النسبة %",ptAdd:"إضافة نقطة",ptNone:"لا نقاط بيانات بعد.",ptMax:"24 نقطة على الأكثر.",
 chEmpty:"أدخل 4 نقاط بيانات على الأقل، أو اختر تحليل باريتو، ليظهر الرسم.",chGoal:"الهدف",chMed:"الوسيط",chBase:"وسيط الأساس",chFrom:"من تحليل باريتو {id}",chBaseT:"رسم تشغيلي للأساس",chAfterT:"رسم تشغيلي بعد التغيير",
 sMean:"المتوسط",sMed:"الوسيط",sRate:"نسبة العيوب",sOut:"خارج المواصفة",sDpmo:"عيب في المليون",sCpk:"Cpk (استرشادي)",sN:"النقاط",sOf:"{d} من {n}",sNote:"Cpk استرشادي: يفترض عملية مستقرة وبيانات طبيعية التوزيع، ويُحسب من 10 نقاط أو أكثر بحدّي مواصفة أو حدّ واحد.",sFew:"الرسم التشغيلي يُقرأ أفضل بعشر نقاط أو أكثر.",
 sPa:"الأساس من تحليل باريتو {id}: {t}. أدخل نقاطاً زمنية لحساب المتوسط والوسيط.",sKey:"الرقم الذي يقيسه الهدف في الأساس: {v} {u}",goalVs:"قيمة «من» في الهدف {g} والأساس المحسوب {b}. إن ظهر فرق كبير فاكتب سببه، ولا تحرّك الهدف ليقترب من النتيجة.",
 msaRule:"القاعدة: يُتحقق من أن القياس يُوثق به قبل تثبيت الأساس. مقياس لا يُوثق به يجعل كل مرحلة بعده غير موثوقة.",msaFailW:"القياس لا يُوثق به. أصلح طريقة القياس وأعد التحقق قبل الأساس؛ فلا تحليل على بيانات لا نثق بها.",msaLateW:"تاريخ التحقق من القياس بعد تاريخ تثبيت الأساس. التحقق يأتي أولاً.",
 goalRule:"القاعدة: يُكتب الهدف في مرحلة التعريف، قبل بدء التحليل، أي أن تاريخ كتابته لا يأتي بعد تاريخ بدء التحليل، ولا يُحرَّك ليناسب النتيجة. إن عُدّل لسبب حقيقي، يبقى الهدف الأول مكتوباً ومعه السبب.",
 lateW:"كُتب الهدف بعد بدء التحليل. الهدف يُكتب في التعريف، وإلا صار يُكيَّف مع ما وجدناه.",chgW:"عُدّل الهدف دون سبب مكتوب. اكتب السبب، وإلا فالتدقيق يسجله ثغرة.",dirDown:"المطلوب خفض القيمة",dirUp:"المطلوب رفع القيمة",
 spW:"الراعي هو قائد المشروع نفسه. الراعي شخص آخر يراجع البوابات ويزيل العوائق.",
 pkT:"اختر أسباباً محتملة من أداة أخرى (قراءة فقط)",pkHow:"الأداة",pkRef:"رقم التحليل",pkUse:"أضف أسبابه",pk_fish:"عظمة السمكة",pk_why5:"لماذا الخمس",pk_rca:"تحقيق RCA",
 pkStart:"ابدأ في أداة أخرى:",stFish:"ابدأ تحليل عظمة سمكة",stWhy5:"ابدأ تحليل لماذا الخمس",stRca:"ابدأ تحقيق RCA",pkHub:"داخل المنصة تُفتح الأداة الأخرى مكان هذه الأداة: احفظ المشروع أولاً.",
 pkAdded:"أُضيف {n} سبب من {id}: ما تحقق منه ذلك التحليل يدخل مثبتاً بالتحليل المرتبط، والباقي فرضيات تُثبت أو تُستبعد بفحص بيانات. راجعها ثم احفظ. لم يُكتب أي شيء في الأداة الأخرى.",pkEvFish:"تحقق في عظمة السمكة {id} ({st})",pkEvWhy5:"اختُبر في لماذا الخمس {id} ({st})",pkNone:"لا يوجد في هذا التحليل سبب مكتوب بعد.",pkDup:"أسباب هذا التحليل موجودة في المشروع.",
 czCode:"الرمز",czT:"السبب المحتمل",czHow:"من أين جاء",czRef:"رقم التحليل",czSt:"الحالة",czEv:"الدليل أو الملاحظة",czDel:"حذف السبب",czAdd:"إضافة سبب",czNone:"لا أسباب بعد.",
 how_fish:"عظمة السمكة",how_why5:"لماذا الخمس",how_rca:"تحقيق RCA",how_here:"هنا (من الفريق)",cs_hyp:"فرضية",cs_conf:"مثبت",cs_out:"مستبعد",
 ckT:"فحص البيانات",ck_:"— لا فحص بعد —",ck_rate:"مقارنة نسبتين (مجموعتان)",ck_mean:"مقارنة متوسطين (مجموعتان)",ck_link:"تحليل مرتبط يثبته",
 ckGa:"المجموعة أ",ckGb:"المجموعة ب",ckX_r:"العيوب",ckN_r:"الوحدات",ckX_m:"المتوسط",ckN_m:"العدد",ckS_m:"الانحراف المعياري (اختياري)",
 ckRate:"أ: {a}% · ب: {b}% · الفرق {d} نقطة مئوية",ckMean:"أ: {a} · ب: {b} · الفرق {d}",ckZ:" · z = {z}",ckStrong:"فرق يصعب أن يكون مصادفة (|z| ≥ 2).",ckWeak:"قد يكون الفرق مصادفة (|z| < 2): اجمع بيانات أكثر أو استبعد السبب.",ckNoZ:"أدخل الانحراف المعياري للمجموعتين لتقدير ما إذا كان الفرق مصادفة.",
 ckLink:"يثبته التحليل المرتبط {id}.",ckLinkMiss:"اختر الأداة ورقم التحليل الذي يثبت السبب.",ckInc:"أكمل بيانات المجموعتين ليظهر الفرق.",ckOut:"استُبعد بالبيانات.",
 personF:"يشير إلى شخص فقط. اسأل: ما الذي في العملية سمح بذلك؟",noChkF:"«مثبت» دون فحص بيانات أو تحليل مرتبط. التصويت لا يثبت سبباً.",
 personW:"سبب أو أكثر يشير إلى شخص فقط («خطأ بشري» أو «إهمال»). الخطأ البشري نقطة بداية للسؤال: ما الذي في العملية سمح به؟ ويطلب البند 8.5.1 ز) إجراءات تمنع الخطأ البشري.",
 czSum:"{p} مثبت بالبيانات · {h} فرضية · {o} مستبعد",
 soCode:"الرمز",soCause:"السبب المثبت",soT:"الحل",soWhere:"أين جُرّب",soFrom:"التجربة من",soTo:"إلى",soVal:"النتيجة في التجربة",soN:"عينة التجربة",soRisk:"مخاطر التغيير",soCtrl:"ضبط المخاطر",soDec:"قرار التعميم",soAdd:"إضافة حل",soNone:"لا حلول بعد.",soDel:"حذف الحل",
 dc_:"— اختر —",dc_roll:"يُعمّم",dc_adapt:"يُعدّل ثم يُعمّم",dc_stop:"لا يُعمّم",
 untiedF:"غير مرتبط بسبب مثبت.",unpilotF:"لم يُجرَّب: الحل يُجرَّب على نطاق صغير قبل التعميم.",riskF:"اكتب مخاطر التغيير وضبطها.",pilotRes:"نتيجة التجربة مقابل الهدف: {r}",untreatW:"سبب مثبت دون حل: {c}",
 cpM:"المقياس",cpTarget:"المستهدف",cpFreq:"التكرار",cpWho:"المسؤول",cpReact:"رد الفعل عند الانحراف",cpAdd:"إضافة سطر",cpNone:"لا خطة ضبط بعد.",cpW:"سطر في خطة الضبط دون مسؤول أو تكرار أو رد فعل: {n}",
 sameW:"مقياس ما بعد التغيير يختلف عن مقياس الهدف. قارن الشيء نفسه بالطريقة نفسها.",stdW:"اكتب ما الذي وُحّد، أو ما بقي مفتوحاً إن لم يتحقق الهدف.",
 aSugg:"النتيجة المحسوبة من القيم: {r}",aNoSugg:"أدخل الهدف وأربع نقاط بعد التغيير لتظهر النتيجة المحسوبة.",res_:"— اختر —",res_met:"تحقق الهدف",res_part:"تحقق جزئياً",res_not:"لم يتحقق",
 runInfo:"{b} من {n} نقاط أفضل من وسيط الأساس ({m})، وأطول تتابع في الجهة الأفضل {k}.",runSig:"ست نقاط متتالية أو أكثر في جهة واحدة من الوسيط إشارة إلى تغيّر حقيقي.",runFew:"أقل من 6 نقاط بعد التغيير: اقرأ الرسم بحذر وواصل القياس.",
 gtT:"بوابة المرحلة",gtS:"يراجع الراعي المرحلة بالأسئلة لا بالتوقيع: ما الأسئلة التي طُرحت، وما القرار.",gDate:"التاريخ",gBy:"المراجِع (الراعي)",gQ:"الأسئلة التي طُرحت",gDec:"القرار",gd_:"— اختر —",gd_go:"اجتياز: انتقل إلى المرحلة التالية",gd_rework:"إعادة عمل في هذه المرحلة",gd_stop:"إيقاف المشروع",
 gLeadW:"البوابة مسجلة باسم قائد المشروع، فلا تُحسب. يراجعها الراعي.",gPend:"المرحلة مكتملة وتنتظر بوابة الراعي.",gNotYet:"أكمل المرحلة قبل البوابة.",gStopW:"أُوقف المشروع عند هذه البوابة. هذا قرار مشروع إذا ظهر أن الحل معروف أو أن المشكلة لا تستحق المشروع.",
 cpOpen:"افتح PDCA",pdFound:"دورة PDCA: {t}",pdMiss:"لم يُعثر على هذه الدورة في أداة PDCA على هذا المتصفح.",pdHint:"اكتب رقم الدورة، مثل PD-EX-03، إن وُجدت.",pdOpen:"افتح PDCA",
 caHint:"اكتب رقم سجل CAPA، مثل CA-EX-04، إن وُجد.",caMiss:"لم يُعثر على هذا السجل في أداة CAPA على هذا المتصفح.",caOpen:"افتح CAPA",
 rcHint:"اكتب رقم تحقيق RCA، مثل RC-EX-01، إن وُجد.",rcMiss:"لم يُعثر على هذا التحقيق في أداة RCA على هذا المتصفح.",rcOpen:"افتح RCA",
 paHint:"اكتب رقم تحليل باريتو، مثل PA-EX-02، إن وُجد.",paMiss:"لم يُعثر على هذا التحليل في أداة باريتو على هذا المتصفح.",paOpen:"افتح باريتو",pcat_:"— اختر الفئة —",
 a3Hint:"اكتب رقم صفحة A3، مثل A3-EX-01، إن وُجدت.",a3Miss:"لم يُعثر على هذه الصفحة في أداة A3 على هذا المتصفح.",a3Open:"افتح A3",
 pvCapa:"{id} · {ref} · {st} · {t}",pvRca:"{id} · {st} · الأسباب الجذرية: {t}",pvFish:"{id} · {st} · السبب الجذري: {t}",pvWhy5:"{id} · {st} · السبب الجذري: {t}",pvPareto:"{id} · {st} · القلة الحيوية: {t}",pvA3:"{id} · {st} · الهدف: {g} · النتيجة: {r}",pvNo:"لم يُكتب بعد",
 pvCat:"{c}: {v} {u} من {tot} ({s}%) · الفترة {f} → {to}{vf}",pvVf:" · في القلة الحيوية",pvA3Cur:"الوضع الحالي في A3: {m} · {b} {u} · {p}",
 nxMiss:"هذا الرقم غير موجود في الأداة الأخرى على هذا المتصفح.",nxNoData:"لا توجد بيانات في هذه الأداة على هذا المتصفح بعد.",
 cst_react:"التفاعل",cst_cause:"تحليل السبب",cst_action:"الإجراء",cst_verify:"التحقق من الفعالية",cst_closed:"مغلق",cst_reopened:"أعيد فتحه",
 rst_problem:"المشكلة",rst_evidence:"جُمعت الوقائع",rst_causes:"حُددت الأسباب",rst_root:"تأكد السبب الجذري",rst_actions:"اقتُرحت الإجراءات",rst_reviewed:"روجع التحقيق",
 pst_question:"السؤال",pst_data:"البيانات",pst_vital:"القلة الحيوية",pst_acted:"الخطوات التالية",pst_checked:"تحقق الأثر",pst_reviewed:"روجع التحليل",
 fst_effect:"تعريف الأثر",fst_causes:"رسم الأسباب",fst_selected:"اختيار الأسباب",fst_verified:"تحقق السبب الجذري",fst_reviewed:"روجع التحليل",
 w5st_problem:"تعريف المشكلة",w5st_chain:"سلسلة لماذا",w5st_root:"السبب الجذري",w5st_tested:"اختُبر السبب",w5st_reviewed:"روجع التحليل",
 a3st_draft:"مسودة",a3st_bg:"كُتبت الخلفية",a3st_cur:"عُرض الوضع الحالي",a3st_goal:"حُدد الهدف",a3st_an:"أُثبتت الأسباب",a3st_cm:"اختيرت الإجراءات المضادة",a3st_plan:"وُضعت الخطة",a3st_fu:"تحقق الأثر",a3st_rev:"روجعت مع الموجّه",
 pu_count:"",pu_cost:"ريال",pu_hours:"ساعة",pu_sev:"نقطة",
 stT:"ابدأ من صفحة A3 أو تحقيق RCA أو فئة حيوية في باريتو (قراءة فقط)",stS:"تقرأ الأداة ما حُفظ في هذا المتصفح من صفحات A3 أو تحقيقات RCA أو تحليلات باريتو وتعرضه للمعاينة. اختر بنداً لتعبئة مشروع جديد غير محفوظ. لا يُكتب أي شيء في الأدوات الأخرى، والهدف يكتبه قائد المشروع بتاريخه.",
 stSrc:"المصدر",stPrev:"اعرض المعاينة",ss_a3:"صفحات A3",ss_rca:"تحقيقات RCA",ss_pareto:"الفئات الحيوية في باريتو",stUse:"افتح مشروعاً منه",
 stNone:"لا توجد بيانات من هذا المصدر في هذا المتصفح.",stEmpty:"لا توجد بنود يمكن البدء منها في هذا المصدر.",
 stColId:"الرقم",stColT:"المرجع والعنوان",stColSt:"المرحلة",stColGoal:"الهدف والنتيجة",stColCur:"الوضع الحالي",stColRoot:"الأسباب الجذرية",stColN:"مشاريع قائمة",stColA:"إجراء",stColCat:"الفئة",stColV:"القيمة والنسبة",stColPer:"الفترة",
 stUsedA:"عُبّئ مشروع جديد من صفحة A3 ‏{id}. الهدف لم يُنسخ: اكتبه بتاريخ اليوم، ثم عرّف المقياس وتحقق منه قبل الأساس. لم يُكتب أي شيء في A3.",stUsedR:"عُبّئ مشروع جديد من تحقيق RCA ‏{id}، وأسبابه الجذرية مثبتة بالتحليل المرتبط. اكتب الهدف بتاريخه، ثم احفظ. لم يُكتب أي شيء في RCA.",stUsedP:"عُبّئ مشروع جديد من الفئة «{c}» في تحليل باريتو {id}. اكتب الهدف بتاريخه، ثم احفظ. لم يُكتب أي شيء في باريتو.",
 pfA3:"في صفحة A3 ‏{id}: الهدف {g} · النتيجة {r}.",pfA3Prob:"{t} — من صفحة A3 ‏{id}: {open}",
 hmT:"في هذا المتصفح ما يمكن البدء منه: {a} صفحة A3، و{r} تحقيق RCA، و{p} فئة حيوية في باريتو.",hmGo:"افتح مشروع DMAIC",
 e_title:"أدخل عنواناً مختصراً للمشروع.",e_num:"القيم الرقمية يجب أن تكون أرقاماً.",e_adate:"بداية فترة ما بعد التغيير لا تأتي بعد نهايتها.",e_pdate:"بداية التجربة لا تأتي بعد نهايتها.",e_ck:"في فحص البيانات: العيوب لا تزيد على الوحدات، والقيم لا تكون سالبة.",
 exT:"بيانات المثال",exS:"ثلاثة مشاريع توضيحية لشركة سعودية افتراضية (شركة الواحة للمقاولات): ما بقي من رفض شحنات الخرسانة بعد صفحة A3 (من A3-EX-01 وباريتو PA-EX-02؛ الأساس 6% في يوليو وأغسطس، والتحقق من موازين الحرارة، وإثبات سبب الماء المبرد بمقارنة الشحنات، وتجربة في محطة واحدة، والنتيجة 2.4% مقابل هدف أقل من 3%، ودورة الضبط PD-EX-03)، وساعات إعادة العمل في القوالب والتسليح (من باريتو PA-EX-03، ما زال في التحليل وسبب استُبعد بالبيانات)، ومشروع قصير لتأخر معايرة الأجهزة (PD-EX-02، أُغلق بالتسليم)، مع إجابات للتقييم الذاتي. البيانات توضيحية وليست حقيقية، وتحميلها يستبدل كل بيانات هذه الأداة في متصفحك.",
 exLoad:"تحميل المثال",exClear:"مسح كل البيانات",exLoaded:"تم تحميل المثال: 3 مشاريع وإجابات التقييم الذاتي.",exCleared:"تم مسح كل بيانات الأداة من هذا المتصفح.",
 exConfirmClear:"سيحذف هذا كل مشاريع DMAIC وإجابات التقييم الذاتي من هذا المتصفح، ولا يمكن التراجع عن ذلك.\n\nهل تريد المتابعة؟",
 dT:"مشاريع DMAIC",dS:"كل مشروع بمرحلته ونتيجته وتنبيهاته. افتح المشروع لتعديله في «مشروع DMAIC».",csv:"تصدير CSV",none:"لا توجد مشاريع بعد. ابدأ من «مشروع DMAIC» أو حمّل المثال.",
 colRef:"المرجع والعنوان",colLead:"القائد والراعي",colStage:"المرحلة",colGoal:"الهدف",colRes:"النتيجة",colCz:"الأسباب",colFlags:"تنبيهات",colAct:"إجراءات",open:"فتح",del:"حذف",delArm:"تأكيد الحذف",
 czN:"{p} مثبت من {n}",resPend:"لم يُقس بعد التغيير",
 fl_lead:"لا قائد",fl_sponsor:"لا راعٍ",fl_spLead:"الراعي هو القائد",fl_prob:"المشكلة أو تكلفتها أو CTQ ناقصة",fl_scope:"النطاق أو SIPOC ناقص",fl_goal:"الهدف ليس رقماً بتاريخ",fl_late:"الهدف كُتب بعد التحليل",fl_chg:"الهدف عُدّل دون سبب",
 fl_opdef:"تعريف المقياس ناقص",fl_msa:"لم يُتحقق من القياس",fl_msaFail:"القياس لا يُوثق به",fl_msaLate:"التحقق بعد الأساس",fl_base:"الأساس ناقص",fl_cause:"لا سبب مثبت بالبيانات",fl_hyp:"فرضيات لم تُفحص: {n}",fl_unchk:"«مثبت» دون فحص: {n}",fl_person:"سبب يشير إلى شخص فقط",
 fl_untied:"حلول غير مرتبطة بسبب مثبت: {n}",fl_unpilot:"حلول لم تُجرَّب: {n}",fl_risk:"حلول دون مخاطر وضبط: {n}",fl_cplan:"خطة الضبط ناقصة",fl_after:"تنتظر بيانات ما بعد التغيير",fl_same:"المقياس لم يُؤكد أنه نفسه",fl_std:"لم يُكتب ما وُحّد",fl_next:"الهدف لم يتحقق ولا خطوة تالية",fl_hand:"ينتظر التسليم",fl_gate:"ينتظر بوابة {p}",fl_gateLead:"بوابة باسم القائد",fl_rework:"إعادة عمل عند بوابة {p}",fl_stop:"أُوقف عند بوابة {p}",
 auT:"التدقيق الآلي لمشاريع DMAIC",auS:"هذه الفحوص تُطبَّق على كل مشروع وتُظهر الثغرات التي يلاحظها المدقق أو الراعي عادةً. الخانة «—» تعني أن الفحص لا ينطبق بعد على مرحلة المشروع.",
 auRec:"مشاريع مُدقّقة",auPass:"فحوص ناجحة",auFail:"مشاريع بها ثغرات",auOpen:"بنود مفتوحة",auEmpty:"لا توجد مشاريع لتدقيقها.",
 c_ref:"مرجع وقائد وراعٍ غير القائد",c_prob:"مشكلة بتكلفتها وCTQ",c_scope:"نطاق داخل وخارج وSIPOC من 5–7 خطوات",c_goal:"هدف رقمي بتاريخ كُتب قبل التحليل",c_msa:"تعريف المقياس وتحقق ناجح قبل الأساس",c_base:"أساس بفترة وبيانات",c_cause:"سبب مثبت بالبيانات ولا سبب يشير إلى شخص",c_sol:"كل حل مرتبط بسبب مثبت ومُجرَّب",c_cplan:"خطة ضبط بمسؤول وتكرار ورد فعل",c_after:"بيانات بعد التغيير بالمقياس نفسه ونتيجة",c_hand:"تسليم مؤرخ",c_gates:"بوابة لكل مرحلة مكتملة",
 dashT:"لوحة المؤشرات",dashS:"أرقام تُحسب من المشاريع والتقييم في هذا المتصفح.",kTotal:"إجمالي المشاريع",kMet:"تحقق هدفها كلياً أو جزئياً بعد التغيير",kGates:"كل مرحلة مكتملة اجتازت بوابتها",kMsa:"قياس موثوق قبل الأساس",kProved:"سبب مثبت بالبيانات",kClosed:"أُغلقت بالتسليم",kPerson:"أسباب تشير إلى شخص",kOpen:"بنود مفتوحة",kAud:"نجاح التدقيق",kAs:"التقييم الذاتي",
 byStage:"توزيع المراحل",byRes:"النتيجة مقابل الهدف",bySrc:"مصدر المشروع",byAssess:"التقييم الذاتي حسب المرحلة",openT:"بنود تحتاج متابعة",noOpen:"لا توجد بنود مفتوحة.",noData:"لا توجد بيانات بعد.",
 oi_lead:"لم يُسمَّ قائد للمشروع",oi_sponsor:"لم يُسمَّ راعٍ يراجع البوابات",oi_spLead:"الراعي هو قائد المشروع نفسه",oi_prob:"المشكلة أو تكلفتها أو متطلب حرج للعميل لم يُكتب",oi_scope:"النطاق داخل وخارج أو SIPOC من 5 إلى 7 خطوات لم يكتمل",oi_goal:"الهدف لم يُكتب رقماً من وإلى بموعد وتاريخ كتابة",oi_late:"الهدف كُتب بعد بدء التحليل",oi_chg:"الهدف عُدّل دون سبب مكتوب",
 oi_opdef:"التعريف التشغيلي للمقياس ناقص (ما يُعدّ، والوحدة، والمصدر، والعينة)",oi_msa:"لم يُتحقق من أن القياس يُوثق به",oi_msaFail:"التحقق يقول إن القياس لا يُوثق به: لا تحليل قبل إصلاحه",oi_msaLate:"التحقق من القياس جاء بعد تثبيت الأساس",oi_base:"الأساس بلا فترة أو تاريخ تثبيت أو بيانات كافية",
 oi_cause:"لا سبب مثبت بفحص بيانات أو تحليل مرتبط",oi_hyp:"{n} سبب ما زال فرضية",oi_unchk:"{n} سبب «مثبت» دون فحص بيانات",oi_person:"سبب يشير إلى شخص فقط: اسأل ما الذي في العملية سمح به",oi_untied:"{n} حل غير مرتبط بسبب مثبت",oi_unpilot:"{n} حل لم يُجرَّب قبل التعميم",oi_risk:"{n} حل دون مخاطر التغيير وضبطها",
 oi_cplan:"خطة الضبط بلا سطر كامل (مسؤول وتكرار ورد فعل)",oi_after:"تنتظر بيانات ما بعد التغيير بالمقياس نفسه ونتيجتها",oi_same:"لم يُؤكد أن مقياس ما بعد التغيير هو مقياس الأساس",oi_std:"لم يُكتب ما الذي وُحّد",oi_next:"الهدف لم يتحقق ولم تُكتب خطوة تالية",oi_hand:"ينتظر التسليم المؤرخ لمالك العملية",oi_gate:"المرحلة {p} مكتملة وتنتظر بوابة الراعي",oi_gateLead:"بوابة مسجلة باسم قائد المشروع",oi_rework:"البوابة {p}: إعادة عمل مطلوبة",oi_stop:"أُوقف المشروع عند بوابة {p}",
 rpT:"تقرير مشاريع DMAIC",rpS:"تقرير HTML يُنزَّل إلى جهازك ويُطبع أو يُحفظ PDF من المتصفح؛ لكل مشروع خريطة مراحله ورسوماته. وCSV لتحليل البيانات في جدول.",rpHtml:"تنزيل تقرير HTML",rpNote:"التقرير يحمل اسم المُعِد «مدثر سلامه» ويتضمن الغلاف والملخص، ولكل مشروع خريطة المراحل والميثاق وSIPOC ورسمي الأساس وما بعد التغيير والأسباب وفحصها والحلول والتجربة وخطة الضبط والبوابات، ثم نتائج التدقيق والبنود المفتوحة والتقييم الذاتي.",rpPrev:"معاينة سريعة",rpEmpty:"لا توجد مشاريع للتصدير بعد.",
 rpCover:"تقرير مشاريع التحسين بمنهج DMAIC",rpProjects:"المشاريع",rpAu:"نتيجة التدقيق",rpGates:"مراجعات البوابات",
 aiT:"المساعد الذكي — قيد البناء",aiS:"سيقرأ هذا المساعد المشروع ويقترح أسئلة البوابة لكل مرحلة، وينبّه إلى هدف كُتب بعد التحليل أو أساس قبل التحقق من القياس أو سبب «مثبت» بلا بيانات. لن يعمل قبل تهيئة محرك المنصة المشتركة، ولن يُظهر نتائج مزيّفة.",
 aiList:["اقتراح أسئلة البوابة لكل مرحلة","اقتراح فحص البيانات المناسب لكل سبب","مقارنة المشروع بمشاريع سابقة لمشكلات مشابهة"],
 yes:"نعم",no:"لا"},
en:{brand:"Continual Improvement Academy · مدثر سلامه",toolName:"DMAIC tool — a data-driven improvement project",sgLearn:"Learn",sgWork:"Work",sgOut:"Output",
 nHome:"Home",nStd:"Method guide",nCl:"Clause guide",nAssess:"Self-assessment",nTools:"DMAIC project",nDocs:"Records",nAudit:"Audit",nDash:"Dashboard",nReport:"Report",nAi:"AI Assistant",soon:"Soon",
 homeCode:"Define · Measure · Analyse · Improve · Control",homeH1:"DMAIC improvement project",
 homeLede:"A data-driven improvement project for a problem whose cause is not known and whose process can be measured, in five phases that each end with a gate review by the sponsor, through questions: Define (the charter and the goal), Measure (the operational definition, a check that the measurement can be trusted, and the baseline), Analyse (causes proved with data), Improve (piloted solutions) and Control (a control plan and the hand-over to the process owner). The tool uses the toolbox rather than replacing it.",
 homeNote:"This version keeps projects in your browser only. Server storage and sign-in come with the shared platform phase.",
 prep:"Prepared by",authorName:"مدثر سلامه",cycleT:"What you can do here",cycleS:"Read the method guide, assess your DMAIC practice, then open your first project from an A3, an RCA investigation, a Pareto vital-few category or from scratch.",
 tStd:"When DMAIC fits and when it does not, the five phases and their gates, the charter and the customer's critical-to-quality requirements, the operational definition and trusting the measurement, proving causes with data, piloting, and the control plan and hand-over.",tCl:"The ISO 9001:2026 clauses the method serves, from the PDCA cycle in the introduction (0.3.2) to objectives 6.2, measuring resources 7.1.5, analysis 9.1.3 and corrective action 10.2: interpretive summary, example and what the auditor asks for.",tAssess:"Twelve questions on your DMAIC practice, from the charter and the goal to the hand-over and the gate reviews.",
 tTools:"One project per problem in five phases with a gate each: charter, SIPOC and goal; the measure, its check and the baseline with a run chart; causes checked with data; solutions and their pilot; the control plan and the result after the change.",tDocs:"Every project with its phase, result and flags, and the example data.",tAudit:"Automatic check of each project: charter, scope and SIPOC, the goal and its date, the measurement check before the baseline, the baseline, proved causes, piloted solutions, the control plan, the result, the hand-over and the gates.",
 tDash:"Goals met after the change, phases passed at their gates, trusted measurements, proved causes, phases, results, sources, open items and the self-assessment on one page.",tReport:"HTML report with each project's phase map, charter, SIPOC, baseline and after-change run charts, cause checks, pilot, control plan and gates, and a CSV file.",tAi:"An assistant that reads the project and suggests the gate questions. Not active yet.",
 foot:"References: ISO 9001:2026 introduction 0.3.2 and clauses 6.2, 7.1.5, 7.1.6, 8.5.1, 8.5.6, 9.1.1, 9.1.3, 10.1 and 10.2 and Annexes A.7.1.5 and A.10.2, and ISO 9000:2026 terms and principles (interpretive summaries, not the official text). DMAIC is an improvement method, not a clause of any standard. Examples are illustrative, not real data.",
 heroTag:"Method tool · A data-driven improvement project in five phases with gates",langSw:"العربية",langSwA:"التبديل إلى العربية",logoAlt:"Continual Improvement Academy — مدثر سلامه",
 related:"Related Academy tools",rel_a3:"A3 problem solving",rel_rca:"Root cause analysis — investigation",rel_pareto:"Pareto — vital few analysis",rel_fish:"Fishbone — cause and effect analysis",rel_why5:"5 Whys — root cause analysis",rel_capa:"Corrective action",rel_pdca:"PDCA cycle",
 termT:"Is DMAIC a clause of ISO 9001:2026?",
 termP1:"No. DMAIC is an improvement method (the Six Sigma improvement cycle: Define, Measure, Analyse, Improve, Control), not a clause of any standard. It is a data-driven project for a problem whose cause is not known and whose process can be measured. ISO 9001:2026 names the PDCA cycle in its introduction (0.3.2), and the note to clause 9.1.3 says that methods to analyse data can include statistical techniques; the introduction and the notes explain, they set no requirements.",
 termP2:"In practice: DMAIC is for a problem whose cause is unknown and whose data can be collected; a known solution is an implementation project, not a DMAIC. The goal is written in Define, before the analysis, and is not moved. A measure that cannot be trusted makes every later phase unreliable, so it is checked before the baseline. Statistics serve the decision, and simple tools are enough most of the time. Each phase ends with a gate review by the sponsor, through questions.",
 termP3:"And DMAIC uses the toolbox rather than replacing it: Pareto to frame and stratify, Fishbone and 5 Whys for candidate causes, RCA for a full investigation, A3 to tell the story on one page, PDCA for the control cycle, and CAPA when a nonconformity is involved.",
 termIs:"Interpretive summary in independent wording, not the official text. Sources: ISO 9001:2026 introduction 0.3.2 and clauses 6.2, 7.1.5, 9.1.3 and 10.2, and ISO 9000:2026, the terms named here and principle 4.2.7. Any Six Sigma reference, ISO 13053 or statistics standard is not uploaded: “not verified”. Verified: 2026-10-16.",
 defs:[["Quality characteristic","ISO 9000:2026 · 3.10.2","An inherent characteristic of an object related to a requirement. The customer's critical-to-quality requirements (CTQs) come from it.","#C2410C"],["Process","ISO 9000:2026 · 3.3.1","Interrelated or interacting activities that use or transform inputs to deliver a result. This is what a SIPOC maps.","#7A869E"],["Measurement","ISO 9000:2026 · 3.11.4","A process to determine a value. That is why the measure is defined and checked before the baseline.","#3563C9"],["Objective","ISO 9000:2026 · 3.7.11","A result to be achieved. It is written as a number and a date in Define.","#B8901E"],["Evidence-based decision-making","ISO 9000:2026 · 4.2.7","Understanding cause and effect; facts and data analysis give decisions objectivity and confidence.","#1B2A4A"]],
 asT:"Self-assessment of your DMAIC practice",asS:"Answer each question with what actually happens in your improvement projects. The score measures current practice; it is not a certificate or a performance rating.",asReset:"Clear answers",asSaved:"Answer saved",asAnswered:"{n} of 12 answered",
 band0:"Needs work",band1:"Developing",band2:"Established",bandNote:"Internal bands for this self-assessment, designed in this tool; not an official scale.",as0:"Not in place",as1:"Partly",as2:"In place and applied",
 g_DF:"Define",g_ME:"Measure",g_AN:"Analyse",g_IM:"Improve",g_CT:"Control and hand-over",g_GT:"Gates",
 tlT:"DMAIC project",tlS:"One project per problem in five phases. The next phase counts only after the sponsor has passed the gate of the one before. The stage is set automatically from what you fill in, and the phase map and the charts are drawn as you type.",
 save:"Save project",newRec:"New project",savedFail:"Could not save in this browser. Download the report before closing the page.",cur:"Current stage:",ok_rec:"Project saved",
 st_D:"Define",st_M:"Measure",st_A:"Analyse",st_I:"Improve",st_C:"Control",st_closed:"Closed with the hand-over",st_stop:"Stopped at a gate",
 ph_D:"Define",ph_M:"Measure",ph_A:"Analyse",ph_I:"Improve",ph_C:"Control",
 phS_D:"The project charter: the problem and its cost, the customer and the critical-to-quality requirements, the scope, a SIPOC, and the goal with its date.",phS_M:"The operational definition of the measure, a check that the measurement can be trusted, then the baseline with its period and sample.",phS_A:"Candidate causes from Fishbone, 5 Whys or RCA, proved or ruled out with data, never by vote.",phS_I:"Solutions tied to proved causes, piloted on a small scale, with the risks of the change checked before the roll-out.",phS_C:"A control plan with a reaction when it drifts, the same measure after the change, the result against the goal, then the hand-over to the process owner.",
 mapT:"Phase map",mp_done:"Gate passed",mp_cur:"In progress",mp_todo:"Not started",mp_wait:"Complete, waiting for the gate",mp_stop:"Project stopped",mp_rework:"Gate: rework",
 sHdrT:"About this project",sHdrS:"Reference, the project lead, the sponsor who reviews the gates, the process owner who takes over the result, the team, the source and the links to the toolbox tools.",
 bProbT:"The problem and the customer",bScopeT:"Scope and SIPOC",bGoalT:"Goal · clause 6.2",bOpT:"Operational definition of the measure · clause 9.1.1",bMsaT:"Can the measurement be trusted? · clause 7.1.5",bBaseT:"Baseline · clause 9.1.3",bCzT:"Causes and their data check · clause 10.2.1 b) 2)",bSolT:"Solutions and the pilot · clause 8.5.6",bCpT:"Control plan · clause 8.5.1",bAfT:"After the change: the result against the goal · clause 10.2.1 d)",bHandT:"Standardise and hand over · clause 10.2.1 f)",
 f_title:"Project title",f_ref:"Reference (if any)",f_src:"Source",f_lead:"Project lead",f_sponsor:"Sponsor (reviews the gates)",f_owner:"Process owner",f_start:"Project start date",f_area:"Process or site",
 f_a3:"Linked A3",f_rca:"Linked RCA investigation",f_pareto:"Linked Pareto analysis",f_pcat:"Category in Pareto",f_capa:"Linked CAPA record",f_pdca:"Linked PDCA cycle",
 f_problem:"The problem as it happens",f_cost:"Its cost or effect",f_customer:"Customer (internal or external)",f_scin:"In scope",f_scout:"Out of scope",f_sips:"Suppliers (S)",f_sipi:"Inputs (I)",f_sipo:"Outputs (O)",f_sipc:"Customers (C)",
 f_gmeasure:"Goal measure",f_gfrom:"From",f_gto:"To",f_gby:"By",f_gdate:"Date the goal was written",f_gorig:"First target (if changed)",f_gwhy:"Reason the goal was changed",
 f_what:"What exactly is counted or measured",f_unit:"Unit",f_source:"Data source",f_sample:"Sample",f_mmethod:"How the measurement was checked",f_mres:"Result",f_mrule:"Written acceptance rule",f_mverd:"Verdict",f_mdate:"Date of the check",
 f_kind:"Type of data",f_stat:"The figure the goal is about",f_bperiod:"Baseline period",f_bdate:"Date the baseline was fixed",f_lsl:"Lower specification limit",f_usl:"Upper specification limit",f_bpareto:"Or a Pareto analysis for the baseline",
 f_andate:"Date the analysis started",
 f_ameasure:"Measure after the change",f_asame:"The same measure, measured the same way as the baseline",f_afrom:"Period from",f_ato:"To",f_ares:"Result against the goal",f_astd:"What is standardised (procedure, form, contract, training)",f_aopen:"What is left open",f_anext:"Next step (a PDCA cycle or a project)",f_handto:"Handed over to (process owner)",f_hdate:"Hand-over date",
 src_a3:"A3",src_rca:"RCA investigation",src_pareto:"Pareto vital-few category",src_capa:"CAPA record",src_kpi:"KPI",src_audit:"Audit finding",src_idea:"Improvement idea",
 mm_:"— choose —",mm_grr:"Repeatability and reproducibility (repeat measurements)",mm_attr:"Attribute agreement (classification data)",mm_ref:"Comparison with a calibrated reference",mm_cal:"Calibration of the devices",mm_other:"Another method",
 vd_:"— choose —",vd_pass:"Can be trusted",vd_part:"Partly trusted",vd_fail:"Cannot be trusted",
 kd_rate:"Defect rate (defects of units)",kd_meas:"Measured values",sx_rate:"Defect rate or share out of specification",sx_mean:"Mean",sx_median:"Median",
 tmN:"Name",tmRole:"Role",tmAdd:"Add member",tmDel:"Remove",tmNone:"No one added yet.",
 ctqT:"Customer's critical-to-quality requirement (CTQ)",ctqSpec:"Limit or specification",ctqAdd:"Add a requirement",ctqNone:"No requirements yet.",ctqMax:"Five requirements at most.",
 stpT:"Process step (P)",stpAdd:"Add a step",stpNone:"No steps yet.",stpRule:"SIPOC: 5 to 7 process steps, from start to end.",stpW:"{n} process steps: 5 to 7 are needed.",sipH:"SIPOC",
 ptL:"Point (period or group)",ptD:"Defects",ptN:"Units",ptV:"Value",ptR:"Rate %",ptAdd:"Add a point",ptNone:"No data points yet.",ptMax:"24 points at most.",
 chEmpty:"Enter at least 4 data points, or pick a Pareto analysis, to draw the chart.",chGoal:"Goal",chMed:"Median",chBase:"Baseline median",chFrom:"From Pareto analysis {id}",chBaseT:"Baseline run chart",chAfterT:"After-change run chart",
 sMean:"Mean",sMed:"Median",sRate:"Defect rate",sOut:"Out of specification",sDpmo:"defects per million",sCpk:"Cpk (indicative)",sN:"Points",sOf:"{d} of {n}",sNote:"Cpk is indicative: it assumes a stable process and normally distributed data, and is computed from 10 points or more with one or two specification limits.",sFew:"A run chart reads better with 10 points or more.",
 sPa:"Baseline from Pareto analysis {id}: {t}. Enter points over time to compute the mean and the median.",sKey:"The figure the goal is about, at baseline: {v} {u}",goalVs:"The goal's “from” value is {g} and the computed baseline is {b}. If they differ much, write why; do not move the goal towards the result.",
 msaRule:"Rule: the measurement is checked before the baseline is fixed. A measure that cannot be trusted makes every later phase unreliable.",msaFailW:"The measurement cannot be trusted. Fix the way it is measured and check it again before the baseline; no analysis on data we do not trust.",msaLateW:"The measurement check is dated after the baseline was fixed. The check comes first.",
 goalRule:"Rule: the goal is written in Define, before the analysis starts, so the date it was written is not after the date the analysis started, and it is not moved to fit the result. If it is changed for a real reason, the first target stays written with the reason.",
 lateW:"The goal was written after the analysis started. The goal is written in Define; otherwise it gets fitted to what was found.",chgW:"The goal was changed with no written reason. Write the reason, or the audit records it as a gap.",dirDown:"The value has to go down",dirUp:"The value has to go up",
 spW:"The sponsor is the project lead. The sponsor is someone else who reviews the gates and removes obstacles.",
 pkT:"Pick candidate causes from another tool (read-only)",pkHow:"Tool",pkRef:"Analysis id",pkUse:"Add its causes",pk_fish:"Fishbone",pk_why5:"5 Whys",pk_rca:"RCA investigation",
 pkStart:"Start in another tool:",stFish:"Start a Fishbone analysis",stWhy5:"Start a 5 Whys analysis",stRca:"Start an RCA investigation",pkHub:"Inside the platform the other tool opens in place of this one: save the project first.",
 pkAdded:"{n} cause(s) added from {id}: a cause that analysis verified comes in as proved by the linked analysis, the others as hypotheses to prove or rule out with a data check. Check them, then save. Nothing was written to the other tool.",pkEvFish:"Verified in Fishbone {id} ({st})",pkEvWhy5:"Tested in 5 Whys {id} ({st})",pkNone:"This analysis has no cause written yet.",pkDup:"The causes of this analysis are already in the project.",
 czCode:"Code",czT:"Candidate cause",czHow:"Where it came from",czRef:"Analysis id",czSt:"Status",czEv:"Evidence or note",czDel:"Remove cause",czAdd:"Add a cause",czNone:"No causes yet.",
 how_fish:"Fishbone",how_why5:"5 Whys",how_rca:"RCA investigation",how_here:"Here (from the team)",cs_hyp:"Hypothesis",cs_conf:"Proved",cs_out:"Ruled out",
 ckT:"Data check",ck_:"— no check yet —",ck_rate:"Compare two rates (two groups)",ck_mean:"Compare two means (two groups)",ck_link:"A linked analysis proves it",
 ckGa:"Group A",ckGb:"Group B",ckX_r:"Defects",ckN_r:"Units",ckX_m:"Mean",ckN_m:"Count",ckS_m:"Standard deviation (optional)",
 ckRate:"A: {a}% · B: {b}% · difference {d} percentage points",ckMean:"A: {a} · B: {b} · difference {d}",ckZ:" · z = {z}",ckStrong:"A difference unlikely to be chance (|z| ≥ 2).",ckWeak:"The difference may be chance (|z| < 2): collect more data or rule the cause out.",ckNoZ:"Enter the standard deviation of both groups to judge whether the difference may be chance.",
 ckLink:"Proved by the linked analysis {id}.",ckLinkMiss:"Choose the tool and the id of the analysis that proves the cause.",ckInc:"Complete both groups to see the difference.",ckOut:"Ruled out by the data.",
 personF:"Names a person only. Ask what in the process allowed it.",noChkF:"“Proved” with no data check or linked analysis. A vote does not prove a cause.",
 personW:"One or more causes point at a person only (“human error”, “negligence”). Human error is a starting point for a question: what in the process allowed it? Clause 8.5.1 g) asks for actions to prevent human error.",
 czSum:"{p} proved with data · {h} hypothesis · {o} ruled out",
 soCode:"Code",soCause:"Proved cause",soT:"Solution",soWhere:"Where it was piloted",soFrom:"Pilot from",soTo:"To",soVal:"Result in the pilot",soN:"Pilot sample",soRisk:"Risks of the change",soCtrl:"Control of the risks",soDec:"Roll-out decision",soAdd:"Add a solution",soNone:"No solutions yet.",soDel:"Remove solution",
 dc_:"— choose —",dc_roll:"Roll out",dc_adapt:"Adapt, then roll out",dc_stop:"Do not roll out",
 untiedF:"Not tied to a proved cause.",unpilotF:"Not piloted: a solution is piloted on a small scale before the roll-out.",riskF:"Write the risks of the change and their control.",pilotRes:"Pilot result against the goal: {r}",untreatW:"Proved cause with no solution: {c}",
 cpM:"Measure",cpTarget:"Target",cpFreq:"Frequency",cpWho:"Owner",cpReact:"Reaction when it drifts",cpAdd:"Add a line",cpNone:"No control plan yet.",cpW:"Control plan lines without an owner, a frequency or a reaction: {n}",
 sameW:"The after-change measure differs from the goal measure. Compare the same thing, measured the same way.",stdW:"Write what is standardised, or what is left open if the goal was not met.",
 aSugg:"Result computed from the values: {r}",aNoSugg:"Enter the goal and four points after the change to see the computed result.",res_:"— choose —",res_met:"Goal met",res_part:"Partly met",res_not:"Not met",
 runInfo:"{b} of {n} points are better than the baseline median ({m}); the longest run on the better side is {k}.",runSig:"Six or more points in a row on one side of the median signal a real shift.",runFew:"Fewer than 6 points after the change: read the chart with care and keep measuring.",
 gtT:"Phase gate",gtS:"The sponsor reviews the phase through questions, not a signature: which questions were asked, and the decision.",gDate:"Date",gBy:"Reviewer (sponsor)",gQ:"Questions asked",gDec:"Decision",gd_:"— choose —",gd_go:"Pass: go to the next phase",gd_rework:"Rework in this phase",gd_stop:"Stop the project",
 gLeadW:"The gate is recorded under the project lead's name, so it does not count. The sponsor reviews it.",gPend:"The phase is complete and waits for the sponsor's gate.",gNotYet:"Complete the phase before the gate.",gStopW:"The project was stopped at this gate. That is a sound decision when the solution turns out to be known or the problem does not deserve a project.",
 cpOpen:"Open PDCA",pdFound:"PDCA cycle: {t}",pdMiss:"This cycle was not found in the PDCA tool in this browser.",pdHint:"Type the cycle number, such as PD-EX-03, if there is one.",pdOpen:"Open PDCA",
 caHint:"Type the CAPA record number, such as CA-EX-04, if there is one.",caMiss:"This record was not found in the CAPA tool in this browser.",caOpen:"Open CAPA",
 rcHint:"Type the RCA investigation number, such as RC-EX-01, if there is one.",rcMiss:"This investigation was not found in the RCA tool in this browser.",rcOpen:"Open RCA",
 paHint:"Type the Pareto analysis number, such as PA-EX-02, if there is one.",paMiss:"This analysis was not found in the Pareto tool in this browser.",paOpen:"Open Pareto",pcat_:"— choose the category —",
 a3Hint:"Type the A3 number, such as A3-EX-01, if there is one.",a3Miss:"This A3 was not found in the A3 tool in this browser.",a3Open:"Open A3",
 pvCapa:"{id} · {ref} · {st} · {t}",pvRca:"{id} · {st} · Root causes: {t}",pvFish:"{id} · {st} · Root cause: {t}",pvWhy5:"{id} · {st} · Root cause: {t}",pvPareto:"{id} · {st} · Vital few: {t}",pvA3:"{id} · {st} · Goal: {g} · Result: {r}",pvNo:"not written yet",
 pvCat:"{c}: {v} {u} of {tot} ({s}%) · period {f} → {to}{vf}",pvVf:" · in the vital few",pvA3Cur:"Current condition in the A3: {m} · {b} {u} · {p}",
 nxMiss:"This id is not in the other tool in this browser.",nxNoData:"No data in that tool in this browser yet.",
 cst_react:"Reaction",cst_cause:"Cause analysis",cst_action:"Action",cst_verify:"Effectiveness check",cst_closed:"Closed",cst_reopened:"Reopened",
 rst_problem:"Problem",rst_evidence:"Facts collected",rst_causes:"Causes mapped",rst_root:"Root cause confirmed",rst_actions:"Actions proposed",rst_reviewed:"Reviewed",
 pst_question:"Question",pst_data:"Data",pst_vital:"Vital few",pst_acted:"Next steps",pst_checked:"Effect checked",pst_reviewed:"Reviewed",
 fst_effect:"Effect defined",fst_causes:"Causes mapped",fst_selected:"Causes selected",fst_verified:"Root cause verified",fst_reviewed:"Reviewed",
 w5st_problem:"Problem defined",w5st_chain:"Chain of whys",w5st_root:"Root cause",w5st_tested:"Root cause tested",w5st_reviewed:"Reviewed",
 a3st_draft:"Draft",a3st_bg:"Background written",a3st_cur:"Current condition shown",a3st_goal:"Goal set",a3st_an:"Causes proved",a3st_cm:"Countermeasures chosen",a3st_plan:"Plan set",a3st_fu:"Effect checked",a3st_rev:"Reviewed with the coach",
 pu_count:"",pu_cost:"SAR",pu_hours:"hours",pu_sev:"points",
 stT:"Start from an A3, an RCA investigation or a Pareto vital-few category (read-only)",stS:"The tool reads the A3s, RCA investigations or Pareto analyses saved in this browser and shows them for review. Pick one to fill a new, unsaved project. Nothing is written to the other tools, and the project lead writes the goal, with its date.",
 stSrc:"Source",stPrev:"Show the preview",ss_a3:"A3s",ss_rca:"RCA investigations",ss_pareto:"Pareto vital-few categories",stUse:"Open a project from it",
 stNone:"No data from this source in this browser.",stEmpty:"Nothing to start from in this source.",
 stColId:"Id",stColT:"Reference and title",stColSt:"Stage",stColGoal:"Goal and result",stColCur:"Current condition",stColRoot:"Root causes",stColN:"Existing projects",stColA:"Action",stColCat:"Category",stColV:"Value and share",stColPer:"Period",
 stUsedA:"A new project was filled from A3 {id}. The goal was not copied: write it with today's date, then define the measure and check it before the baseline. Nothing was written to A3.",stUsedR:"A new project was filled from RCA investigation {id}; its root causes are proved by the linked analysis. Write the goal with its date, then save. Nothing was written to RCA.",stUsedP:"A new project was filled from the category “{c}” of Pareto analysis {id}. Write the goal with its date, then save. Nothing was written to Pareto.",
 pfA3:"In A3 {id}: goal {g} · result {r}.",pfA3Prob:"{t} — from A3 {id}: {open}",
 hmT:"This browser holds something to start from: {a} A3(s), {r} RCA investigation(s) and {p} Pareto vital-few category(ies).",hmGo:"Open a DMAIC project",
 e_title:"Enter a short title for the project.",e_num:"Numeric values must be numbers.",e_adate:"The after-change period cannot start after it ends.",e_pdate:"A pilot cannot start after it ends.",e_ck:"In a data check, defects cannot exceed units and values cannot be negative.",
 exT:"Example data",exS:"Three illustrative projects for a fictitious Saudi company (Al-Waha Contracting): the ready-mix loads still rejected after the A3 (from A3-EX-01 and Pareto PA-EX-02; baseline 6% over July–August, a check of the receiving thermometers, the chilled-water cause proved by comparing loads, a pilot on one plant, a result of 2.4% against a goal below 3%, and the control cycle PD-EX-03), rework hours in formwork and rebar (from Pareto PA-EX-03, still in Analyse, with one cause ruled out by data), and a short project on overdue calibration (PD-EX-02, closed with the hand-over), plus self-assessment answers. The data is illustrative, not real, and loading it replaces all of this tool's data in your browser.",
 exLoad:"Load example",exClear:"Clear all data",exLoaded:"Example loaded: 3 projects and the self-assessment answers.",exCleared:"All of this tool's data was removed from this browser.",
 exConfirmClear:"This deletes every DMAIC project and the self-assessment answers from this browser, and it cannot be undone.\n\nDo you want to continue?",
 dT:"DMAIC projects",dS:"Every project with its phase, result and flags. Open a project to edit it in the DMAIC project tab.",csv:"Export CSV",none:"No projects yet. Start from the DMAIC project tab or load the example.",
 colRef:"Reference and title",colLead:"Lead and sponsor",colStage:"Stage",colGoal:"Goal",colRes:"Result",colCz:"Causes",colFlags:"Flags",colAct:"Actions",open:"Open",del:"Delete",delArm:"Confirm delete",
 czN:"{p} of {n} proved",resPend:"Not measured after the change yet",
 fl_lead:"No lead",fl_sponsor:"No sponsor",fl_spLead:"Sponsor is the lead",fl_prob:"Problem, cost or CTQ missing",fl_scope:"Scope or SIPOC incomplete",fl_goal:"Goal is not a number with a date",fl_late:"Goal written after the analysis",fl_chg:"Goal changed without a reason",
 fl_opdef:"Operational definition incomplete",fl_msa:"Measurement not checked",fl_msaFail:"Measurement cannot be trusted",fl_msaLate:"Check after the baseline",fl_base:"Baseline incomplete",fl_cause:"No cause proved with data",fl_hyp:"Hypotheses not checked: {n}",fl_unchk:"“Proved” without a check: {n}",fl_person:"A cause names a person only",
 fl_untied:"Solutions not tied to a proved cause: {n}",fl_unpilot:"Solutions not piloted: {n}",fl_risk:"Solutions without risks and control: {n}",fl_cplan:"Control plan incomplete",fl_after:"Waiting for after-change data",fl_same:"Same measure not confirmed",fl_std:"Nothing written as standardised",fl_next:"Goal not met and no next step",fl_hand:"Waiting for the hand-over",fl_gate:"Waiting for gate {p}",fl_gateLead:"Gate under the lead's name",fl_rework:"Rework at gate {p}",fl_stop:"Stopped at gate {p}",
 auT:"Automatic audit of DMAIC projects",auS:"These checks run on every project and show the gaps an auditor or a sponsor usually finds. “—” means the check does not apply yet at the project's stage.",
 auRec:"Projects audited",auPass:"Checks passed",auFail:"Projects with gaps",auOpen:"Open items",auEmpty:"No projects to audit yet.",
 c_ref:"Reference, lead and a sponsor other than the lead",c_prob:"Problem with its cost and a CTQ",c_scope:"Scope in and out and a SIPOC of 5–7 steps",c_goal:"Measurable dated goal written before the analysis",c_msa:"Operational definition and a passed check before the baseline",c_base:"Baseline with period and data",c_cause:"A cause proved with data, none naming a person only",c_sol:"Every solution tied to a proved cause and piloted",c_cplan:"Control plan with owner, frequency and reaction",c_after:"After-change data on the same measure with a result",c_hand:"Dated hand-over",c_gates:"A gate for each completed phase",
 dashT:"Dashboard",dashS:"Figures calculated from the projects and the self-assessment in this browser.",kTotal:"Total projects",kMet:"Goal met or partly met after the change",kGates:"Every completed phase passed at its gate",kMsa:"Measurement trusted before the baseline",kProved:"A cause proved with data",kClosed:"Closed with the hand-over",kPerson:"Causes naming a person",kOpen:"Open items",kAud:"Audit pass rate",kAs:"Self-assessment",
 byStage:"Stage distribution",byRes:"Result against the goal",bySrc:"Source of the project",byAssess:"Self-assessment by phase",openT:"Items that need follow-up",noOpen:"No open items.",noData:"No data yet.",
 oi_lead:"No project lead named",oi_sponsor:"No sponsor named to review the gates",oi_spLead:"The sponsor is the project lead",oi_prob:"The problem, its cost or a customer's critical-to-quality requirement is not written",oi_scope:"The scope in and out or a SIPOC of 5 to 7 steps is not complete",oi_goal:"The goal is not written as a number from and to with a date and the date it was written",oi_late:"The goal was written after the analysis started",oi_chg:"The goal was changed without a written reason",
 oi_opdef:"The operational definition of the measure is incomplete (what is counted, unit, source, sample)",oi_msa:"The measurement has not been checked",oi_msaFail:"The check says the measurement cannot be trusted: no analysis until it is fixed",oi_msaLate:"The measurement check came after the baseline was fixed",oi_base:"The baseline has no period, no date it was fixed or not enough data",
 oi_cause:"No cause proved with a data check or a linked analysis",oi_hyp:"{n} cause(s) still a hypothesis",oi_unchk:"{n} cause(s) marked proved with no data check",oi_person:"A cause names a person only: ask what in the process allowed it",oi_untied:"{n} solution(s) not tied to a proved cause",oi_unpilot:"{n} solution(s) not piloted before the roll-out",oi_risk:"{n} solution(s) without the risks of the change and their control",
 oi_cplan:"The control plan has no complete line (owner, frequency and reaction)",oi_after:"Waiting for after-change data on the same measure and its result",oi_same:"The after-change measure is not confirmed as the baseline measure",oi_std:"What is standardised is not written",oi_next:"The goal was not met and no next step is written",oi_hand:"Waiting for the dated hand-over to the process owner",oi_gate:"Phase {p} is complete and waits for the sponsor's gate",oi_gateLead:"A gate is recorded under the project lead's name",oi_rework:"Gate {p}: rework asked for",oi_stop:"The project was stopped at gate {p}",
 rpT:"DMAIC report",rpS:"HTML report downloaded to your device, which you can print or save as PDF from the browser; each project with its phase map and charts. CSV for analysing the data in a spreadsheet.",rpHtml:"Download HTML report",rpNote:"The report carries the preparer's name “مدثر سلامه” and includes the cover and summary, then for each project the phase map, charter, SIPOC, baseline and after-change run charts, causes and their checks, solutions and pilot, control plan and gates, then the audit results, open items and the self-assessment.",rpPrev:"Quick preview",rpEmpty:"No projects to export yet.",
 rpCover:"DMAIC improvement projects report",rpProjects:"The projects",rpAu:"Audit result",rpGates:"Gate reviews",
 aiT:"AI Assistant — under construction",aiS:"This assistant will read the project and suggest the gate questions for each phase, and point out a goal written after the analysis, a baseline taken before the measurement check, or a cause “proved” without data. It will not run before the shared platform engine is in place, and it will not show invented results.",
 aiList:["Suggest the gate questions for each phase","Suggest the right data check for each cause","Compare the project with earlier ones on similar problems"],
 yes:"Yes",no:"No"}
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
function pick(v,list){ return list.indexOf(v)>=0?v:""; }
/* numbers: decimals allowed; empty is null; text that is not a number is NaN (validation stops the save) */
function num(v){ if(v===null||v===undefined||String(v).trim()==="") return null; var n=Number(String(v).replace(/,/g,"")); return isFinite(n)?n:null; }
function numRaw(v){ if(v===null||v===undefined||String(v).trim()==="") return null; var n=Number(String(v).replace(/,/g,"")); return isFinite(n)?n:NaN; }
function fmtN(v){ return (v===null||v===undefined||v===""||(typeof v==="number"&&!isFinite(v)))?"—":Number(v).toLocaleString("en-US",{maximumFractionDigits:2}); }
function fmt1(v){ return (v===null||v===undefined||!isFinite(v))?"—":(Math.round(v*10)/10).toLocaleString("en-US",{minimumFractionDigits:1,maximumFractionDigits:1}); }
function vstr(v){ return v===null||v===undefined?"":String(v); }
function low(s){ return txt(s).toLowerCase().replace(/\s+/g," "); }

/* ---------- records ---------- */
function blankTm(){ return {n:"",role:""}; }
function blankCtq(){ return {t:"",spec:""}; }
function blankStp(){ return {t:""}; }
function blankPt(){ return {l:"",d:null,n:null,v:null}; }
function blankChk(){ return {kind:"",ga:"",xa:null,na:null,sa:null,gb:"",xb:null,nb:null,sb:null}; }
function blankCz(id){ return {id:id||"",t:"",how:"here",ref:"",st:"hyp",ev:"",chk:blankChk()}; }
function blankSo(id){ return {id:id||"",cause:"",t:"",where:"",from:"",to:"",val:null,n:"",risk:"",ctrl:"",dec:""}; }
function blankCp(){ return {m:"",target:"",freq:"",who:"",react:""}; }
function blankGate(){ return {date:"",by:"",q:"",dec:""}; }
function blank(){ var g={}; PH.forEach(function(p){ g[p]=blankGate(); });
 return {id:"",title:"",ref:"",src:"idea",lead:"",sponsor:"",owner:"",area:"",start:"",a3:"",rca:"",pareto:"",pcat:"",capa:"",pdca:"",team:[],
 def:{problem:"",cost:"",customer:"",ctq:[],scin:"",scout:"",sip:{s:"",i:"",steps:[],o:"",c:""}},
 goal:{measure:"",from:null,to:null,by:"",date:"",orig:null,why:""},
 meas:{what:"",unit:"",source:"",sample:"",msa:{method:"",res:"",rule:"",verdict:"",date:""},kind:"rate",stat:"rate",period:"",date:"",lsl:null,usl:null,pareto:"",pts:[]},
 an:{date:"",causes:[]},imp:{sols:[]},
 ctl:{plan:[],measure:"",same:false,from:"",to:"",pts:[],res:"",std:"",open:"",next:"",handTo:"",hdate:""},
 gates:g,created:"",updated:""}; }
function fixTm(m){ return {n:str(m.n),role:str(m.role)}; }
function fixCtq(x){ return {t:str(x.t),spec:str(x.spec)}; }
function fixStp(x){ return {t:str(x.t)}; }
function fixPt(x){ return {l:str(x.l),d:num(x.d),n:num(x.n),v:num(x.v)}; }
function fixChk(k){ k=obj(k); return {kind:pick(k.kind,CHKS),ga:str(k.ga),xa:num(k.xa),na:num(k.na),sa:num(k.sa),gb:str(k.gb),xb:num(k.xb),nb:num(k.nb),sb:num(k.sb)}; }
function fixCz(x){ return {id:str(x.id),t:str(x.t),how:pick(x.how,HOWS)||"here",ref:str(x.ref),st:pick(x.st,CST)||"hyp",ev:str(x.ev),chk:fixChk(x.chk)}; }
function fixSo(x){ return {id:str(x.id),cause:str(x.cause),t:str(x.t),where:str(x.where),from:str(x.from),to:str(x.to),val:num(x.val),n:str(x.n),risk:str(x.risk),ctrl:str(x.ctrl),dec:pick(x.dec,DECS)}; }
function fixCp(x){ return {m:str(x.m),target:str(x.target),freq:str(x.freq),who:str(x.who),react:str(x.react)}; }
function fixGate(x){ x=obj(x); return {date:str(x.date),by:str(x.by),q:str(x.q),dec:pick(x.dec,GDEC)}; }
function ids(list,pre){ var used={}, n=0, re=new RegExp("^"+pre+"(\\d+)$");
 list.forEach(function(c){ var m=re.exec(c.id); if(m&&!used[c.id]){ used[c.id]=1; n=Math.max(n,+m[1]); } else c.id=""; });
 list.forEach(function(c){ if(!c.id){ n++; c.id=pre+n; used[c.id]=1; } }); }
/* a project saved with missing or broken parts gets empty ones, so rendering never throws; every cause and solution gets an id */
function fixRec(r){
 ["id","title","ref","src","lead","sponsor","owner","area","start","a3","rca","pareto","pcat","capa","pdca","created","updated"].forEach(function(k){ r[k]=str(r[k]); });
 if(SRCS.indexOf(r.src)<0) r.src="idea";
 r.team=arr(r.team).map(fixTm);
 var d=obj(r.def), sp=obj(d.sip);
 r.def={problem:str(d.problem),cost:str(d.cost),customer:str(d.customer),ctq:arr(d.ctq).map(fixCtq).slice(0,MAXCTQ),scin:str(d.scin),scout:str(d.scout),
  sip:{s:str(sp.s),i:str(sp.i),steps:arr(sp.steps).map(fixStp).slice(0,MAXSTEPS),o:str(sp.o),c:str(sp.c)}};
 var g=obj(r.goal); r.goal={measure:str(g.measure),from:num(g.from),to:num(g.to),by:str(g.by),date:str(g.date),orig:num(g.orig),why:str(g.why)};
 var m=obj(r.meas), ms=obj(m.msa);
 r.meas={what:str(m.what),unit:str(m.unit),source:str(m.source),sample:str(m.sample),msa:{method:pick(ms.method,MSAM),res:str(ms.res),rule:str(ms.rule),verdict:pick(ms.verdict,VERD),date:str(ms.date)},
  kind:pick(m.kind,KINDS)||"rate",stat:pick(m.stat,STATS)||"rate",period:str(m.period),date:str(m.date),lsl:num(m.lsl),usl:num(m.usl),pareto:str(m.pareto),pts:arr(m.pts).map(fixPt).slice(0,MAXPTS)};
 var a=obj(r.an); r.an={date:str(a.date),causes:arr(a.causes).map(fixCz)}; ids(r.an.causes,"c");
 var im=obj(r.imp); r.imp={sols:arr(im.sols).map(fixSo)}; ids(r.imp.sols,"s");
 var c=obj(r.ctl); r.ctl={plan:arr(c.plan).map(fixCp),measure:str(c.measure),same:c.same===true,from:str(c.from),to:str(c.to),pts:arr(c.pts).map(fixPt).slice(0,MAXPTS),res:pick(c.res,RESS),std:str(c.std),open:str(c.open),next:str(c.next),handTo:str(c.handTo),hdate:str(c.hdate)};
 var G=obj(r.gates); r.gates={}; PH.forEach(function(p){ r.gates[p]=fixGate(G[p]); });
 return r;
}
function load(){ return TBX.load(STORE,function(v){ if(!Array.isArray(v.records)) v.records=[]; v.records=v.records.filter(function(r){ return r&&typeof r==="object"; }); v.records.forEach(fixRec); if(!v.assess||typeof v.assess!=="object") v.assess={}; return v; },function(){ return {records:[],assess:{}}; }); }
function persist(){ return TBX.save(STORE,DB); }

/* ---------- simple statistics: they serve the decision; nothing here needs more than a mean, a median and a rate ---------- */
function ptVal(p,kind){ if(kind==="rate") return (p.n!==null&&p.n>0&&p.d!==null&&p.d>=0&&p.d<=p.n)?p.d/p.n*100:null; return p.v; }
function series(list,kind){ return list.filter(function(p){ return txt(p.l)&&ptVal(p,kind)!==null; }).map(function(p){ return {l:p.l,v:ptVal(p,kind),d:p.d,n:p.n}; }); }
function meanOf(a){ return a.length?a.reduce(function(x,y){ return x+y; },0)/a.length:null; }
function medianOf(a){ var s=a.slice().sort(function(x,y){ return x-y; }), n=s.length; return n?(n%2?s[(n-1)/2]:(s[n/2-1]+s[n/2])/2):null; }
function sdOf(a){ if(a.length<2) return null; var m=meanOf(a); return Math.sqrt(a.reduce(function(s,x){ return s+(x-m)*(x-m); },0)/(a.length-1)); }
function statsOf(list,kind,lsl,usl){
 var S=series(list,kind), V=S.map(function(x){ return x.v; }), o={n:S.length,S:S,mean:meanOf(V),median:medianOf(V),sd:sdOf(V),rate:null,dpmo:null,out:null,cpk:null,defects:0,units:0};
 if(kind==="rate"){ S.forEach(function(x){ o.defects+=x.d; o.units+=x.n; }); if(o.units>0){ o.rate=o.defects/o.units*100; o.dpmo=Math.round(o.defects/o.units*1e6); } }
 else { if(S.length&&(lsl!==null||usl!==null)){ var k=V.filter(function(v){ return (lsl!==null&&v<lsl)||(usl!==null&&v>usl); }).length; o.out=k/V.length*100; o.rate=o.out; }
  if(o.sd&&o.sd>0&&S.length>=10&&(lsl!==null||usl!==null)){ var c=[]; if(usl!==null) c.push((usl-o.mean)/(3*o.sd)); if(lsl!==null) c.push((o.mean-lsl)/(3*o.sd)); o.cpk=Math.min.apply(null,c); } }
 return o;
}
function keyStat(o,stat){ return stat==="mean"?o.mean:(stat==="median"?o.median:o.rate); }
function baseStats(r){ return statsOf(r.meas.pts,r.meas.kind,r.meas.lsl,r.meas.usl); }
function afterStats(r){ return statsOf(r.ctl.pts,r.meas.kind,r.meas.lsl,r.meas.usl); }
function baseKey(r){ var b=baseStats(r); if(b.n) return keyStat(b,r.meas.stat); var I=paBase(r); return I?I.x.v:null; }
function afterKey(r){ var a=afterStats(r); return a.n>=MINPTS?keyStat(a,r.meas.stat):null; }
function paBase(r){ if(!txt(r.meas.pareto)) return null; return paCatInfo(r.meas.pareto,r.pcat)||(function(){ var p=byIdIn(PARETO_KEY,r.meas.pareto); if(!p) return null; var K=paRank(p); return {p:p,x:{v:K.total,c:{name:str(p.title),id:""},share:100,vit:false},txt:str(p.title)}; })(); }
/* result against the goal: met when the value reaches the target, partly when it moved from the start towards it */
function cmpGoal(r,v){ var g=r.goal; if(g.from===null||g.to===null||g.from===g.to||v===null||v===undefined) return "";
 var down=g.to<g.from; if(down?v<=g.to:v>=g.to) return "met"; if(down?v<g.from:v>g.from) return "part"; return "not"; }
function suggest(r){ return cmpGoal(r,afterKey(r)); }
/* run chart reading after the change: points on the better side of the baseline median and the longest run there */
function runRead(r){ var A=afterStats(r).S, bm=baseStats(r).median, g=r.goal; if(!A.length||bm===null||g.from===null||g.to===null||g.from===g.to) return null;
 var down=g.to<g.from, b=0, k=0, run=0; A.forEach(function(x){ var ok=down?x.v<bm:x.v>bm; if(ok){ b++; run++; k=Math.max(k,run); } else run=0; }); return {b:b,n:A.length,k:k,m:bm}; }

/* ---------- two-group data check of a cause (rates or means) or a linked analysis ---------- */
function chkRes(c){ var k=c.chk, o={ok:false,kind:k.kind,z:null};
 if(k.kind==="rate"){ if(txt(k.ga)&&txt(k.gb)&&k.na>0&&k.nb>0&&k.xa!==null&&k.xb!==null&&k.xa>=0&&k.xb>=0&&k.xa<=k.na&&k.xb<=k.nb){
   o.ok=true; o.a=k.xa/k.na*100; o.b=k.xb/k.nb*100; o.d=o.a-o.b; var p=(k.xa+k.xb)/(k.na+k.nb), se=Math.sqrt(p*(1-p)*(1/k.na+1/k.nb)); o.z=se>0?(k.xa/k.na-k.xb/k.nb)/se:null; } }
 else if(k.kind==="mean"){ if(txt(k.ga)&&txt(k.gb)&&k.na>=2&&k.nb>=2&&k.xa!==null&&k.xb!==null){
   o.ok=true; o.a=k.xa; o.b=k.xb; o.d=k.xa-k.xb; if(k.sa!==null&&k.sb!==null&&(k.sa>0||k.sb>0)){ var s2=Math.sqrt(k.sa*k.sa/k.na+k.sb*k.sb/k.nb); o.z=s2>0?o.d/s2:null; } } }
 else if(k.kind==="link"){ o.ok=["fish","why5","rca"].indexOf(c.how)>=0&&!!txt(c.ref); }
 return o; }
function chkText(c){ var o=chkRes(c), k=c.chk; if(!k.kind) return "";
 if(k.kind==="link") return o.ok?t("ckLink",{id:c.ref}):t("ckLinkMiss");
 if(!o.ok) return t("ckInc");
 var s=k.kind==="rate"?t("ckRate",{a:fmt1(o.a),b:fmt1(o.b),d:fmt1(o.d)}):t("ckMean",{a:fmtN(o.a),b:fmtN(o.b),d:fmtN(Math.round(o.d*100)/100)});
 if(o.z!==null) s+=t("ckZ",{z:fmtN(Math.round(o.z*100)/100)})+" — "+(Math.abs(o.z)>=2?t("ckStrong"):(c.st==="out"?t("ckOut"):t("ckWeak"))); else if(k.kind==="mean"&&c.st!=="out") s+=" — "+t("ckNoZ");
 if(c.st==="out"&&!(o.z!==null&&Math.abs(o.z)<2)) s+=" "+t("ckOut");
 return s; }

/* ---------- the project's rules ---------- */
var PERSON=/(خطأ\s*(بشري|العامل|الموظف|الفني|المشغل|السائق|الشخص|الرافع|المشرف)|إهمال|اهمال|تقصير|عدم\s*(انتباه|الانتباه|تركيز|التركيز)|سهو|لامبالاة|human\s*error|operator\s*error|worker\s*error|staff\s*error|employee\s*error|rigger\s*error|driver\s*error|negligen|careless|inattent|not\s*paying\s*attention|lack\s*of\s*attention|complacen)/i;
function personOnly(s){ return PERSON.test(String(s||"")); }
function leadOk(r){ return !!txt(r.lead)&&!!txt(r.sponsor)&&low(r.sponsor)!==low(r.lead); }
function spLead(r){ return !!txt(r.lead)&&low(r.sponsor)===low(r.lead); }
function ctqs(r){ return r.def.ctq.filter(function(x){ return txt(x.t); }); }
function steps(r){ return r.def.sip.steps.filter(function(x){ return txt(x.t); }); }
function probOk(r){ return !!(txt(r.def.problem)&&txt(r.def.cost)&&ctqs(r).length); }
function sipOk(r){ var s=r.def.sip, n=steps(r).length; return !!(txt(s.s)&&txt(s.i)&&txt(s.o)&&txt(s.c))&&n>=5&&n<=MAXSTEPS; }
function scopeOk(r){ return !!(txt(r.def.scin)&&txt(r.def.scout))&&sipOk(r); }
function goalNum(r){ var g=r.goal; return !!(txt(g.measure)&&g.from!==null&&g.to!==null&&g.from!==g.to&&isD(g.by)&&isD(g.date)); }
function changed(r){ return r.goal.orig!==null&&r.goal.to!==null&&r.goal.orig!==r.goal.to; }
/* the goal is written in Define, before the analysis: its date is not after the date the analysis started */
function late(r){ return isD(r.goal.date)&&isD(r.an.date)&&r.goal.date>r.an.date; }
function goalBefore(r){ return isD(r.goal.date)&&(live(r).length?(isD(r.an.date)&&!late(r)):!late(r)); }
function goalOk(r){ return goalNum(r)&&goalBefore(r)&&!(changed(r)&&!txt(r.goal.why)); }
function defOk(r){ return leadOk(r)&&probOk(r)&&scopeOk(r)&&goalOk(r); }
function opdefOk(r){ var m=r.meas; return !!(txt(m.what)&&txt(m.unit)&&txt(m.source)&&txt(m.sample)); }
function msaDone(r){ var s=r.meas.msa; return !!(s.method&&txt(s.res)&&txt(s.rule)&&s.verdict&&isD(s.date)); }
function msaTrust(r){ return msaDone(r)&&(r.meas.msa.verdict==="pass"||r.meas.msa.verdict==="part"); }
function msaLate(r){ return isD(r.meas.msa.date)&&isD(r.meas.date)&&r.meas.msa.date>r.meas.date; }
function msaOk(r){ return opdefOk(r)&&msaTrust(r)&&isD(r.meas.date)&&!msaLate(r); }
function baseData(r){ return baseStats(r).n>=MINPTS||!!txt(r.meas.pareto); }
function baseOk(r){ return !!txt(r.meas.period)&&isD(r.meas.date)&&baseData(r); }
function measOk(r){ return msaOk(r)&&baseOk(r); }
function live(r){ return r.an.causes.filter(function(c){ return txt(c.t)&&c.st!=="out"; }); }
function proved(r){ return live(r).filter(function(c){ return c.st==="conf"&&chkRes(c).ok; }); }
function hyps(r){ return live(r).filter(function(c){ return c.st!=="conf"; }); }
function unchk(r){ return live(r).filter(function(c){ return c.st==="conf"&&!chkRes(c).ok; }); }
function personCauses(r){ return live(r).filter(function(c){ return personOnly(c.t); }); }
function anOk(r){ return isD(r.an.date)&&proved(r).length>0&&!personCauses(r).length; }
function sols(r){ return r.imp.sols.filter(function(s){ return txt(s.t); }); }
function provedIds(r){ var o={}; proved(r).forEach(function(c){ o[c.id]=1; }); return o; }
function untied(r){ var P=provedIds(r); return sols(r).filter(function(s){ return !P[s.cause]; }); }
function piloted(s){ return isD(s.from)&&isD(s.to)&&s.from<=s.to&&s.val!==null&&!!txt(s.where); }
function unpiloted(r){ return sols(r).filter(function(s){ return !piloted(s); }); }
function unrisk(r){ return sols(r).filter(function(s){ return !txt(s.risk)||!txt(s.ctrl); }); }
function untreated(r){ var S=sols(r); return proved(r).filter(function(c){ return !S.some(function(s){ return s.cause===c.id; }); }); }
function impOk(r){ var S=sols(r); return S.length>0&&!untied(r).length&&!unpiloted(r).length&&!unrisk(r).length&&S.every(function(s){ return !!s.dec; })&&S.some(function(s){ return s.dec==="roll"||s.dec==="adapt"; }); }
function cpRows(r){ return r.ctl.plan.filter(function(x){ return txt(x.m); }); }
function cpBad(r){ return cpRows(r).filter(function(x){ return !txt(x.freq)||!txt(x.who)||!txt(x.react); }); }
function cplanOk(r){ return cpRows(r).length>0&&!cpBad(r).length; }
function afterOk(r){ var c=r.ctl; return !!(txt(c.measure)&&c.same&&isD(c.from)&&isD(c.to)&&c.from<=c.to&&afterStats(r).n>=MINPTS&&c.res); }
function stdOk(r){ var c=r.ctl; return !!txt(c.std)||(c.res==="not"&&!!txt(c.open)); }
function handOk(r){ return !!txt(r.ctl.handTo)&&isD(r.ctl.hdate); }
function ctlOk(r){ return cplanOk(r)&&afterOk(r)&&stdOk(r)&&handOk(r); }
var PHOK={D:defOk,M:measOk,A:anOk,I:impOk,C:ctlOk};
/* a gate is passed when the sponsor's review is dated, names a reviewer other than the project lead, records the questions and decides "go" */
function gatePass(r,p){ var g=r.gates[p]; return g.dec==="go"&&isD(g.date)&&!!txt(g.by)&&!!txt(g.q)&&!(txt(r.lead)&&low(g.by)===low(r.lead)); }
function stopAt(r){ for(var i=0;i<PH.length;i++){ var g=r.gates[PH[i]]; if(g.dec==="stop"&&isD(g.date)) return PH[i]; } return ""; }
function stageOf(r){
 var s=stopAt(r); if(s) return "stop";
 for(var i=0;i<PH.length;i++){ var p=PH[i]; if(!(PHOK[p](r)&&gatePass(r,p))) return p; }
 return "closed";
}
function stageName(s){ return t("st_"+s); }
function idxOf(r){ var s=stageOf(r); return s==="stop"?PH.indexOf(stopAt(r)):STAGES.indexOf(s); }
function atLeast(r,p){ return idxOf(r)>=STAGES.indexOf(p); }
/* phases whose content is complete, whether or not their gate was passed */
function doneContent(r){ return PH.filter(function(p){ return PHOK[p](r); }); }
function gatesAll(r){ var C=doneContent(r); return C.length>0&&C.every(function(p){ return gatePass(r,p); }); }
function waitGate(r){ var s=stageOf(r); return PH.indexOf(s)>=0&&PHOK[s](r)&&!gatePass(r,s)?s:""; }
function gateLead(r){ return !!txt(r.lead)&&PH.some(function(p){ return txt(r.gates[p].by)&&low(r.gates[p].by)===low(r.lead); }); }
function reworkAt(r){ var s=stageOf(r); return PH.indexOf(s)>=0&&r.gates[s].dec==="rework"?s:""; }
function codes(r){ var o={}; r.an.causes.forEach(function(c,i){ o[c.id]="R"+(i+1); }); r.imp.sols.forEach(function(s,i){ o[s.id]="S"+(i+1); }); return o; }
/* one list of what is still open in a project; flags (records) and open items (dashboard, report) read it */
function issues(r){
 var o=[], s=stageOf(r);
 if(!txt(r.lead)) o.push(["lead","warn",{}]);
 if(!txt(r.sponsor)) o.push(["sponsor","warn",{}]);
 if(spLead(r)) o.push(["spLead","bad",{}]);
 if(!probOk(r)) o.push(["prob","warn",{}]);
 if(!scopeOk(r)) o.push(["scope","warn",{}]);
 if(!goalNum(r)) o.push(["goal","warn",{}]);
 if(late(r)) o.push(["late","bad",{}]);
 if(changed(r)&&!txt(r.goal.why)) o.push(["chg","bad",{}]);
 if(atLeast(r,"M")){
  if(!opdefOk(r)) o.push(["opdef","warn",{}]);
  if(!msaDone(r)) o.push(["msa","warn",{}]);
 }
 if(msaDone(r)&&r.meas.msa.verdict==="fail") o.push(["msaFail","bad",{}]);
 if(msaLate(r)) o.push(["msaLate","bad",{}]);
 if(atLeast(r,"M")&&!baseOk(r)) o.push(["base","warn",{}]);
 if(atLeast(r,"A")&&!proved(r).length) o.push(["cause","warn",{}]);
 if(hyps(r).length) o.push(["hyp","info",{n:hyps(r).length}]);
 if(unchk(r).length) o.push(["unchk","warn",{n:unchk(r).length}]);
 if(personCauses(r).length) o.push(["person","bad",{}]);
 if(untied(r).length) o.push(["untied","warn",{n:untied(r).length}]);
 if(unpiloted(r).length) o.push(["unpilot","warn",{n:unpiloted(r).length}]);
 if(unrisk(r).length) o.push(["risk","warn",{n:unrisk(r).length}]);
 if(atLeast(r,"C")&&!cplanOk(r)) o.push(["cplan","warn",{}]);
 if(s==="C"&&!afterOk(r)) o.push(["after","info",{}]);
 if((isD(r.ctl.from)||afterStats(r).n)&&!r.ctl.same&&(txt(r.ctl.measure)||afterStats(r).n)) o.push(["same","warn",{}]);
 if(afterOk(r)&&!stdOk(r)) o.push(["std","warn",{}]);
 if(r.ctl.res==="not"&&!txt(r.ctl.next)) o.push(["next","info",{}]);
 if(s==="C"&&afterOk(r)&&!handOk(r)) o.push(["hand","info",{}]);
 var w=waitGate(r); if(w) o.push(["gate","info",{p:t("ph_"+w)}]);
 var rw=reworkAt(r); if(rw) o.push(["rework","info",{p:t("ph_"+rw)}]);
 if(gateLead(r)) o.push(["gateLead","warn",{}]);
 if(s==="stop") o.push(["stop","info",{p:t("ph_"+stopAt(r))}]);
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
function openRca(q){ openWith("rca.html",RCA_NAV,q,qsOf(q)); }
function openFish(q){ openWith("fishbone.html",FISH_NAV,q,qsOf(q)); }
function openWhy5(q){ openWith("five-whys.html",WHY5_NAV,q,qsOf(q)); }
function openPareto(q){ openWith("pareto.html",PARETO_NAV,q,q.open?"?open="+encodeURIComponent(q.open):""); }
function openA3(q){ openWith("a3.html",A3_NAV,q,q.open?"?open="+encodeURIComponent(q.open):""); }
/* other tools' records saved in this browser (read only) */
function recsOf(key){ var S=TBX.read(key); if(!S) return null; return (Array.isArray(S.records)?S.records:[]).filter(function(r){ return r&&typeof r==="object"&&str(r.id); }); }
function pdcaCycles(){ return (recsOf(PDCA_KEY)||[]).map(function(r){ return {id:str(r.id),title:str(r.title)}; }); }
function byIdIn(key,id){ return (recsOf(key)||[]).filter(function(r){ return str(r.id)===id; })[0]||null; }
/* stages of the other tools, read with their own rules (capa.html, rca.html, pareto.html, fishbone.html, five-whys.html, a3.html: stageOf), for previews only */
function capaStage(r){
 var e=obj(r.eff), c=obj(r.close), im=obj(r.impl), cs=obj(r.cause), re=obj(r.react), a=(Array.isArray(r.actions)?r.actions:[]).filter(function(x){ return x&&typeof x==="object"; });
 if(e.result==="ineff") return "reopened"; if(txt(str(c.date))) return "closed";
 if(e.result==="eff"||txt(str(im.evidence))||(a.length&&a.every(function(x){ return x.st==="done"; }))) return "verify";
 if(txt(str(cs.root))) return "action"; if(txt(str(re.correction))||txt(str(re.containment))) return "cause"; return "react";
}
/* RCA (rca.html stageOf): depth from severity × likelihood, methods enough for the depth, every root cause confirmed with evidence and the removal test */
function rcaStage(r){
 var p=obj(r.prob), k=obj(r.risk), cr=obj(r.crit), rv=obj(r.review), sev=parseInt(k.sev,10)||0, lik=parseInt(k.lik,10)||0, D=["light","std","full"];
 var q=(!sev||!lik)?"":((sev===5||sev*lik>=15)?"full":((sev===4||sev*lik>=6)?"std":"light")), dep=D.indexOf(r.depth)>=0?r.depth:q, lw=!!q&&D.indexOf(r.depth)>=0&&D.indexOf(r.depth)<D.indexOf(q);
 var probOk2=["what","where","when","much","req"].every(function(f){ return !!txt(str(p[f])); }), depthOk=!!q&&(!lw||!!txt(str(r.depthWhy)));
 var facts=arr(r.tl).filter(function(x){ return x.kind!=="asm"&&txt(str(x.ev))&&txt(str(x.src)); }).length, ev=arr(r.evid).filter(function(x){ return txt(str(x.item)); }).length;
 var C=arr(r.causes).filter(function(c){ return txt(str(c.t))&&c.st!=="out"; }), dir=C.filter(function(c){ return c.lvl!=="contrib"&&c.lvl!=="root"; }), RT=C.filter(function(c){ return c.lvl==="root"; });
 var nd=function(v){ var n=Number(v); return (v!==null&&v!==""&&v!==undefined&&isFinite(n))?n:null; };
 var dat=arr(r.data).filter(function(x){ var n=nd(x.n), kk=nd(x.k); return txt(str(x.g))&&n!==null&&n>0&&kk!==null&&kk>=0&&kk<=n; }).length, bar=arr(r.barrier).filter(function(x){ return txt(str(x.b))&&!!x.res; }).length;
 var seen={}, M=arr(r.methods).filter(function(m){ var ok=m.how==="data"?dat>0:(m.how==="barrier"?bar>0:(["pareto","fish","why5"].indexOf(m.how)>=0&&!!txt(str(m.ref)))); var kk=m.how+"|"+(m.how==="data"||m.how==="barrier"?"":txt(str(m.ref))); if(!ok||seen[kk]) return false; seen[kk]=1; return true; });
 var methOk=M.length>=(dep==="full"?2:(dep==="std"?1:0))&&(dep!=="full"||M.some(function(m){ return m.how==="data"||m.how==="pareto"; }));
 var rOk=function(c){ return c.st==="conf"&&!!txt(str(c.ev))&&(c.test==="yes"||c.test==="part"); };
 var rootsOk=RT.length>0&&RT.every(rOk)&&!RT.some(function(c){ return PERSON.test(String(c.t)); });
 var acts=arr(r.acts), noAct=RT.filter(function(c){ return !acts.some(function(x){ return x.cause===c.id&&txt(str(x.t))&&txt(str(x.owner)); }); }).length;
 var critOk=!!(txt(str(cr.what))&&txt(str(cr.where))&&txt(str(cr.period))&&isD(cr.date)&&cr.before===true);
 if(!(probOk2&&depthOk&&facts>=2&&ev>=1)) return "problem"; if(!(dir.length&&RT.length)) return "evidence"; if(!(rootsOk&&methOk)) return "causes";
 if(!(noAct===0&&critOk)) return "root"; if(!(txt(str(rv.by))&&isD(rv.date))) return "actions"; return "reviewed";
}
function rcaRoots(r){ return arr(r.causes).filter(function(c){ return c.lvl==="root"&&c.st!=="out"&&txt(str(c.t)); }); }
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
/* A3 (a3.html stageOf): background, current condition, goal before the analysis, proved causes, tied and tested countermeasures, plan, follow-up, coach review */
function a3Stage(r){
 var b=obj(r.bg), c=obj(r.cur), g=obj(r.goal), f=obj(r.fu), own=low(str(r.owner)), nv=function(v){ return num(v); };
 var bgOk=!!(txt(str(b.why))&&txt(str(b.text))&&txt(str(b.measure)));
 var P0=arr(c.pts).filter(function(p){ return txt(str(p.l))&&nv(p.v)!==null; }).length, curOk=!!(txt(str(c.measure))&&nv(c.base)!==null&&txt(str(c.period))&&(P0>=2||!!txt(str(c.pareto)))&&txt(str(c.gap)));
 var from=nv(g.from), to=nv(g.to), orig=nv(g.orig), lv=arr(r.causes).filter(function(x){ return txt(str(x.t))&&x.st!=="out"; });
 var lt=isD(g.date)&&isD(r.andate)&&g.date>r.andate, chg=orig!==null&&to!==null&&orig!==to&&!txt(str(g.why));
 var gOk=!!(txt(str(g.measure))&&from!==null&&to!==null&&from!==to&&isD(g.by)&&isD(g.date))&&(lv.length?(isD(r.andate)&&!lt):!lt)&&!chg;
 var Pr=lv.filter(function(x){ return x.st==="conf"&&!!txt(str(x.ev)); }), pid=Pr.map(function(x){ return str(x.id); }), pf=lv.some(function(x){ return PERSON.test(String(x.t)); });
 var aOk=Pr.length>0&&!pf, M=arr(r.cms).filter(function(m){ return txt(str(m.t)); });
 var ut=M.filter(function(m){ return pid.indexOf(str(m.cause))<0; }).length, un=M.filter(function(m){ return !m.test||m.test==="no"; }).length, utr=Pr.filter(function(x){ return !M.some(function(m){ return str(m.cause)===str(x.id); }); }).length;
 var cOk=M.length>0&&!ut&&!utr&&!un&&M.every(function(m){ return !!txt(str(m.eff)); });
 var PL=arr(r.plan), up=M.filter(function(m){ return !PL.some(function(p){ return str(p.cm)===str(m.id)&&txt(str(p.what))&&txt(str(p.who))&&isD(p.when); }); }).length, pOk=M.length>0&&!up;
 var fOk=!!(txt(str(f.measure))&&f.same===true&&isD(f.from)&&isD(f.to)&&f.from<=f.to&&nv(f.value)!==null&&["met","part","not"].indexOf(f.res)>=0);
 var rOk=arr(r.reviews).some(function(v){ return isD(v.date)&&txt(str(v.by))&&low(str(v.by))!==own&&(!isD(f.to)||v.date>=f.to); });
 var S=[bgOk,curOk,gOk,aOk,cOk,pOk,fOk,rOk], ST2=["draft","bg","cur","goal","an","cm","plan","fu","rev"], k=0; while(k<S.length&&S[k]) k++; return ST2[k];
}
function a3Goal(a){ var g=obj(a.goal), c=obj(a.cur); return txt(str(g.measure))?(g.from==null?"—":String(g.from))+" → "+(g.to==null?"—":String(g.to))+(txt(str(c.unit))?" "+str(c.unit):"")+(isD(g.by)?" · "+g.by:""):t("pvNo"); }
function a3Res(a){ var f=obj(a.fu); return ["met","part","not"].indexOf(f.res)>=0?t("res_"+f.res)+(f.value!=null?" ("+String(f.value)+(txt(str(obj(a.cur).unit))?" "+str(obj(a.cur).unit):"")+")":""):t("resPend"); }
/* Pareto's ranking and stage (pareto.html: ranked, isVital, stageOf) */
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
 var p=byIdIn(PARETO_KEY,pid); if(!p||!cid) return null;
 var K=paRank(p), x=K.rows.filter(function(z){ return str(z.c.id)===cid; })[0]; if(!x) return null;
 return {p:p,x:x,txt:t("pvCat",{c:str(x.c.name),v:fmtN(x.v),u:puName(p.unit),tot:fmtN(K.total),s:(Math.round(x.share*10)/10).toFixed(1),f:str(p.from)||"—",to:str(p.to)||"—",vf:x.vit?t("pvVf"):""}).replace("  "," ")};
}
function keyOf(how){ return {rca:RCA_KEY,fish:FISH_KEY,why5:WHY5_KEY,capa:CAPA_KEY,pareto:PARETO_KEY,a3:A3_KEY}[how]||""; }
function preview(how,id){
 if(["rca","fish","why5","capa","pareto","a3"].indexOf(how)<0) return "";
 var R=recsOf(keyOf(how));
 if(!id) return (R&&R.length)?"":t("nxNoData");
 var r=byIdIn(keyOf(how),id); if(!r) return t("nxMiss");
 if(how==="rca") return t("pvRca",{id:id,st:t("rst_"+rcaStage(r)),t:short(rcaRoots(r).map(function(c){ return str(c.t); }).join(" · "),140)||t("pvNo")});
 if(how==="fish") return t("pvFish",{id:id,st:t("fst_"+fishStage(r)),t:short(str(r.root),110)||t("pvNo")});
 if(how==="why5") return t("pvWhy5",{id:id,st:t("w5st_"+why5Stage(r)),t:short(str(r.root),110)||t("pvNo")});
 if(how==="a3") return t("pvA3",{id:id,st:t("a3st_"+a3Stage(r)),g:a3Goal(r),r:a3Res(r)});
 if(how==="pareto"){ var V=paRank(r).rows.filter(function(x){ return x.vit; }).map(function(x){ return str(x.c.name); }); return t("pvPareto",{id:id,st:t("pst_"+paStage(r)),t:short(V.join(" · "),120)||t("pvNo")}); }
 return t("pvCapa",{id:id,ref:str(r.ref)||"—",st:t("cst_"+capaStage(r)),t:short(str(r.title),90)});
}
/* candidate causes another analysis holds, as rows for this project (read only): a cause the other analysis verified comes in as proved by that
   linked analysis; the others come in as hypotheses, to be proved or ruled out with a data check here */
function causesFrom(how,id){
 var r=byIdIn(keyOf(how),id); if(!r) return null;
 if(how==="rca") return rcaRoots(r).map(function(c){ var ok=c.st==="conf"&&txt(str(c.ev)); return {t:str(c.t),how:"rca",ref:id,st:ok?"conf":"hyp",ev:str(c.ev),chk:ok?{kind:"link"}:{}}; });
 if(how==="fish"){ var fs=fishStage(r), ok1=fs==="verified"||fs==="reviewed"; return txt(str(r.root))?[{t:str(r.root),how:"fish",ref:id,st:ok1?"conf":"hyp",ev:ok1?t("pkEvFish",{id:id,st:t("fst_"+fs)}):"",chk:ok1?{kind:"link"}:{}}]:[]; }
 var ws=why5Stage(r), ok2=ws==="tested"||ws==="reviewed"; return txt(str(r.root))?[{t:str(r.root),how:"why5",ref:id,st:ok2?"conf":"hyp",ev:ok2?t("pkEvWhy5",{id:id,st:t("w5st_"+ws)}):"",chk:ok2?{kind:"link"}:{}}]:[];
}

/* ---------- charts (inline SVG, mirrored for Arabic; the same drawings go into the report) ---------- */
var FONT="font-family=\"'IBM Plex Sans Arabic','IBM Plex Sans',Calibri,Tahoma,sans-serif\"";
function lab(s,n){ s=txt(s); return s.length>n?s.slice(0,n-1)+"…":s; }
function chartW(){ try{ return window.innerWidth<640?360:560; }catch(e){ return 560; } }
/* run chart: the points in time order, their median, the goal and (after the change) the baseline median */
function runSVG(S,o){
 o=o||{}; var lang=o.lang||L, rtl=lang==="ar", W=o.W||560, H=W<480?210:220, m={l:46,r:34,t:18,b:42}, f=function(v){ return Math.round(v*10)/10; };
 var out=['<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 '+W+' '+H+'" width="'+W+'" height="'+H+'" role="img" aria-label="'+esc(o.title||"")+'" '+FONT+'>','<rect width="'+W+'" height="'+H+'" fill="#FFFFFF"/>'];
 if(S.length<MINPTS){ out.push('<text x="'+W/2+'" y="'+H/2+'" fill="#7A869E" font-size="12.5" text-anchor="middle">'+esc(lang==="ar"?UI.ar.chEmpty:UI.en.chEmpty)+'</text></svg>'); return out.join(""); }
 var V=S.map(function(x){ return x.v; }), lines=[], med=medianOf(V);
 if(o.goal!==null&&o.goal!==undefined) lines.push(o.goal); if(o.ref!==null&&o.ref!==undefined) lines.push(o.ref);
 var hi=Math.max.apply(null,V.concat(lines)), lo=Math.min.apply(null,V.concat(lines).concat([0])), span=(hi-lo)||1; hi=hi+span*0.12;
 var iw=W-m.l-m.r, ih=H-m.t-m.b, n=S.length, X=function(x){ return rtl?W-x:x; }, cx=function(i){ return m.l+(n===1?iw/2:iw*i/(n-1)); }, Y=function(v){ return m.t+ih-(v-lo)/(hi-lo)*ih; };
 out.push('<line x1="'+f(X(m.l))+'" y1="'+f(m.t+ih)+'" x2="'+f(X(m.l+iw))+'" y2="'+f(m.t+ih)+'" stroke="#9AA5B8"/>');
 [lo,(lo+hi)/2,hi].forEach(function(v){ out.push('<text x="'+f(rtl?W-m.l+6:m.l-6)+'" y="'+f(Y(v)+4)+'" fill="#7A869E" font-size="10" text-anchor="'+(rtl?"start":"end")+'" direction="ltr">'+esc(fmtN(Math.round(v*10)/10))+'</text>'); });
 var hl=function(v,col,dash,label,w,near){ out.push('<line x1="'+f(X(m.l))+'" y1="'+f(Y(v))+'" x2="'+f(X(m.l+iw))+'" y2="'+f(Y(v))+'" stroke="'+col+'" stroke-width="'+(w||1.5)+'"'+(dash?' stroke-dasharray="'+dash+'"':'')+'/><text x="'+f(X(near?m.l+4:m.l+iw-2))+'" y="'+f(Y(v)-4)+'" fill="'+col+'" font-size="10.5" font-weight="700" text-anchor="'+(near?"start":"end")+'">'+esc(label+" "+fmtN(Math.round(v*100)/100))+'</text>'); };
 if(o.ref!==null&&o.ref!==undefined) hl(o.ref,"#C9821A","2 3",lang==="ar"?UI.ar.chBase:UI.en.chBase);
 hl(med,"#7A869E","5 3",lang==="ar"?UI.ar.chMed:UI.en.chMed,1.2,true);
 if(o.goal!==null&&o.goal!==undefined) hl(o.goal,"#3C9A5F","7 4",lang==="ar"?UI.ar.chGoal:UI.en.chGoal,1.6);
 out.push('<path d="'+S.map(function(x,i){ return (i?"L":"M")+f(X(cx(i)))+" "+f(Y(x.v)); }).join(" ")+'" fill="none" stroke="'+(o.col||"#3563C9")+'" stroke-width="2.2"/>');
 var every=Math.max(1,Math.ceil(n/(W<480?6:10)));
 S.forEach(function(x,i){ out.push('<circle cx="'+f(X(cx(i)))+'" cy="'+f(Y(x.v))+'" r="3.6" fill="'+(o.col||"#3563C9")+'"><title>'+esc(x.l+": "+fmtN(Math.round(x.v*100)/100))+'</title></circle>');
  if(n<=12||i%every===0) out.push('<text x="'+f(X(cx(i)))+'" y="'+f(Y(x.v)-8)+'" fill="#1B2A4A" font-size="10" text-anchor="middle" direction="ltr">'+esc(fmtN(Math.round(x.v*10)/10))+'</text>');
  if(i%every===0||i===n-1) out.push('<text x="'+f(X(cx(i)))+'" y="'+f(m.t+ih+15)+'" fill="#4B5874" font-size="10" text-anchor="middle">'+esc(lab(x.l,W<480?8:10))+'</text>'); });
 out.push('</svg>'); return out.join("");
}
/* baseline from a Pareto analysis: the ranked categories as bars (read from the Pareto tool) */
function paretoSVG(I,o){
 o=o||{}; var lang=o.lang||L, rtl=lang==="ar", W=o.W||560, H=200, m={l:14,r:14,t:18,b:40}, f=function(v){ return Math.round(v*10)/10; };
 var K=paRank(I.p), R=K.rows.filter(function(x){ return x.v>0; }).slice(0,10), mx=Math.max.apply(null,R.map(function(x){ return x.v; }).concat([1]))*1.15;
 var iw=W-m.l-m.r, ih=H-m.t-m.b, slot=iw/Math.max(1,R.length), out=['<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 '+W+' '+H+'" width="'+W+'" height="'+H+'" role="img" aria-label="'+esc(t("chFrom",{id:str(I.p.id)}))+'" '+FONT+'><rect width="'+W+'" height="'+H+'" fill="#FFFFFF"/>'];
 R.forEach(function(x,i){ var bw=Math.min(44,slot*0.6), cxx=m.l+slot*i+slot/2, h=x.v/mx*ih, xx=cxx-bw/2, y=m.t+ih-h, sel=str(x.c.id)===str(I.x.c.id);
  out.push('<rect x="'+f(rtl?W-xx-bw:xx)+'" y="'+f(y)+'" width="'+f(bw)+'" height="'+f(h)+'" rx="3" fill="'+(sel?"#C2410C":(x.vit?"#3563C9":"#9AA5B8"))+'"/><text x="'+f(rtl?W-cxx:cxx)+'" y="'+f(y-5)+'" fill="#1B2A4A" font-size="10" text-anchor="middle" direction="ltr">'+esc(fmtN(x.v))+'</text><text x="'+f(rtl?W-cxx:cxx)+'" y="'+f(m.t+ih+15)+'" fill="#4B5874" font-size="9.5" text-anchor="middle">'+esc(lab(str(x.c.name),W<480?6:9))+'</text>'); });
 out.push('<line x1="'+m.l+'" y1="'+f(m.t+ih)+'" x2="'+(W-m.r)+'" y2="'+f(m.t+ih)+'" stroke="#9AA5B8"/><text x="'+f(rtl?W-m.l:m.l)+'" y="'+(H-6)+'" fill="#7A869E" font-size="10" text-anchor="start">'+esc(t("chFrom",{id:str(I.p.id)}))+'</text></svg>');
 return out.join("");
}
function baseSVG(r,lang,W){ var S=baseStats(r).S; if(S.length<MINPTS){ var I=paBase(r); if(I) return paretoSVG(I,{lang:lang,W:W}); }
 return runSVG(S,{lang:lang,W:W,goal:r.goal.to,title:(lang||L)==="ar"?UI.ar.chBaseT:UI.en.chBaseT}); }
function afterSVG(r,lang,W){ return runSVG(afterStats(r).S,{lang:lang,W:W,goal:r.goal.to,ref:baseStats(r).median,col:"#1E8C93",title:(lang||L)==="ar"?UI.ar.chAfterT:UI.en.chAfterT}); }
/* phase map: five phases with their gate; the same markup goes into the report */
function phaseState(r,p){
 var s=stageOf(r), i=PH.indexOf(p), si=idxOf(r), sp=stopAt(r);
 if(s==="stop"&&p===sp) return "stop"; if(s==="closed"||i<si) return "done"; if(i>si||s==="stop") return "todo";
 if(PHOK[p](r)&&!gatePass(r,p)) return r.gates[p].dec==="rework"?"rework":"wait"; return "cur";
}
function mapHTML(r,lang){
 var tt=function(k){ return (UI[lang||L]||UI.ar)[k]; };
 return '<ol class="dm-map" aria-label="'+esc(tt("mapT"))+'">'+PH.map(function(p){ var st=phaseState(r,p), g=r.gates[p];
  return '<li class="'+st+'" style="--pc:'+SCOL[p]+'"'+(st==="cur"||st==="wait"||st==="rework"?' aria-current="step"':'')+'><i aria-hidden="true">'+p+'</i><span><b>'+esc(tt("ph_"+p))+'</b><small>'+esc(tt("mp_"+st))+(isD(g.date)&&g.dec?' · <bdi dir="ltr">'+esc(g.date)+'</bdi>':'')+'</small></span><em class="dm-gd '+(gatePass(r,p)?"ok":(g.dec==="stop"?"no":""))+'" aria-hidden="true">◆</em></li>'; }).join("")+'</ol>';
}

/* ---------- project form ---------- */
var HDR=[["title","tx",1],["ref","ltr",0],["src","sel:SRC:src_",0],["lead","tx",0],["sponsor","tx",0],["owner","tx",0],["start","date",0],["area","tx",0],["a3","a3",0],["rca","rca",0],["pareto","pareto",0],["pcat","pcat",0],["capa","capa",0],["pdca","pdca",0]];
var PATH={title:"title",ref:"ref",src:"src",lead:"lead",sponsor:"sponsor",owner:"owner",start:"start",area:"area",a3:"a3",rca:"rca",pareto:"pareto",pcat:"pcat",capa:"capa",pdca:"pdca",
 problem:"def.problem",cost:"def.cost",customer:"def.customer",scin:"def.scin",scout:"def.scout",sips:"def.sip.s",sipi:"def.sip.i",sipo:"def.sip.o",sipc:"def.sip.c",
 gmeasure:"goal.measure",gfrom:"goal.from",gto:"goal.to",gby:"goal.by",gdate:"goal.date",gorig:"goal.orig",gwhy:"goal.why",
 what:"meas.what",unit:"meas.unit",source:"meas.source",sample:"meas.sample",mmethod:"meas.msa.method",mres:"meas.msa.res",mrule:"meas.msa.rule",mverd:"meas.msa.verdict",mdate:"meas.msa.date",
 kind:"meas.kind",stat:"meas.stat",bperiod:"meas.period",bdate:"meas.date",lsl:"meas.lsl",usl:"meas.usl",bpareto:"meas.pareto",andate:"an.date",
 ameasure:"ctl.measure",afrom:"ctl.from",ato:"ctl.to",ares:"ctl.res",astd:"ctl.std",aopen:"ctl.open",anext:"ctl.next",handto:"ctl.handTo",hdate:"ctl.hdate"};
var NUMF={gfrom:1,gto:1,gorig:1,lsl:1,usl:1};
var LISTS={SRC:SRCS,MSAM:[""].concat(MSAM),VERD:[""].concat(VERD),KINDS:KINDS,STATS:STATS,RESS:[""].concat(RESS),GDEC:[""].concat(GDEC),HOWS:HOWS,CST:CST,CHKS:[""].concat(CHKS),DECS:[""].concat(DECS)};
function getP(r,p){ var a=p.split("."), o=r; for(var i=0;i<a.length;i++){ if(o==null) return ""; o=o[a[i]]; } return o; }
function setP(r,p,v){ var a=p.split("."), o=r; for(var i=0;i<a.length-1;i++){ if(!o[a[i]]||typeof o[a[i]]!=="object") o[a[i]]={}; o=o[a[i]]; } o[a[a.length-1]]=v; }
function opts(list,prefix,cur){ return list.map(function(k){ return '<option value="'+k+'"'+(cur===k?" selected":"")+'>'+esc(t(prefix+k))+'</option>'; }).join(""); }
function fill(list){ return list.map(function(r){ return '<option value="'+esc(r[0])+'">'+esc(r[1])+'</option>'; }).join(""); }
function link(id,list,info,btn,bl){ return '<div class="ca-pd"><input id="'+id+'" type="text" dir="ltr" list="'+list+'" aria-describedby="'+info+'">'+(btn?'<button class="pd-btn ghost" type="button" id="'+btn+'">'+esc(t(bl))+'</button>':'')+'</div><datalist id="'+list+'"></datalist><div class="ca-pdinfo" id="'+info+'" aria-live="polite"></div>'; }
function fieldHTML(name,kind,wide){
 var id="f-"+name, lb=t("f_"+name), inner="", m=/^sel:(\w+):(\w+)$/.exec(kind);
 if(kind==="ta") inner='<textarea id="'+id+'" rows="2"></textarea>';
 else if(kind==="date") inner='<input id="'+id+'" type="date">';
 else if(kind==="ltr") inner='<input id="'+id+'" type="text" dir="ltr">';
 else if(kind==="num") inner='<input id="'+id+'" type="number" step="any" inputmode="decimal" dir="ltr">';
 else if(m) inner='<select id="'+id+'">'+opts(LISTS[m[1]],m[2])+'</select>';
 else if(kind==="a3") inner=link(id,"a3List","a3Info","a3Open","a3Open");
 else if(kind==="rca") inner=link(id,"rcaList","rcInfo","rcOpen","rcOpen");
 else if(kind==="capa") inner=link(id,"capaList","caInfo","caOpen","caOpen");
 else if(kind==="pareto") inner=link(id,"paList","paInfo","paOpen","paOpen");
 else if(kind==="pdca") inner=link(id,"pdcaList","pdInfo","pdOpen","pdOpen");
 else if(kind==="pcat") inner='<select id="'+id+'" aria-describedby="pcInfo"><option value="">'+esc(t("pcat_"))+'</option></select><div class="ca-pdinfo" id="pcInfo" aria-live="polite"></div>';
 else if(kind==="cpa") inner='<input id="'+id+'" type="text" dir="ltr" list="paList" aria-describedby="bpInfo"><div class="ca-pdinfo" id="bpInfo" aria-live="polite"></div>';
 else inner='<input id="'+id+'" type="text">';
 return '<div class="pd-f'+(wide?" wide":"")+'" id="w-'+name+'"><label for="'+id+'">'+esc(lb)+'</label>'+inner+'</div>';
}
function blkHTML(k,inner){ return '<div class="dm-blk" id="blk-'+k+'"><h4>'+esc(t("b"+k+"T"))+'</h4>'+inner+'</div>'; }
function tblHTML(name,cls,heads){ return '<div class="ca-actw" id="'+name+'W"><table class="a3-tbl '+cls+'"><thead><tr>'+heads.map(function(h){ return '<th'+(h[1]?' class="'+h[1]+'"':'')+'>'+(h[0]?esc(h[0]):'<span class="sr">—</span>')+'</th>'; }).join("")+'</tr></thead><tbody id="'+name+'Rows"></tbody></table></div>'; }
function addBtn(name,lbl){ return '<button class="pd-btn ghost" type="button" data-add="'+name+'">+ '+esc(lbl)+'</button>'; }
function gateHTML(p){
 var id=function(k){ return "g-"+p+"-"+k; };
 return '<div class="dm-gate" id="gate-'+p+'"><h4><span class="dm-gd" aria-hidden="true">◆</span>'+esc(t("gtT"))+' · '+esc(t("ph_"+p))+'</h4><p class="pd-sub">'+esc(t("gtS"))+'</p><div class="pd-fields">'+
  '<div class="pd-f"><label for="'+id("date")+'">'+esc(t("gDate"))+'</label><input id="'+id("date")+'" type="date"></div>'+
  '<div class="pd-f"><label for="'+id("by")+'">'+esc(t("gBy"))+'</label><input id="'+id("by")+'" type="text"></div>'+
  '<div class="pd-f"><label for="'+id("dec")+'">'+esc(t("gDec"))+'</label><select id="'+id("dec")+'">'+opts(LISTS.GDEC,"gd_")+'</select></div>'+
  '<div class="pd-f wide"><label for="'+id("q")+'">'+esc(t("gQ"))+'</label><textarea id="'+id("q")+'" rows="2"></textarea></div></div><p class="dm-gnote" id="gn-'+p+'" aria-live="polite"></p></div>';
}
function phaseHTML(p,inner){ return '<section class="dm-ph" id="ph-'+p+'" style="--pc:'+SCOL[p]+'" aria-labelledby="pht-'+p+'"><h3 class="dm-pht" id="pht-'+p+'"><i aria-hidden="true">'+p+'</i>'+esc(t("ph_"+p))+'</h3><p class="dm-phs">'+esc(t("phS_"+p))+'</p>'+inner+gateHTML(p)+'</section>'; }
var PTH=function(){ return [[t("ptL")],[t("ptD"),"dm-r"],[t("ptN"),"dm-r"],[t("ptV"),"dm-m"],[t("ptR"),"dm-r"],[""]]; };
function buildForm(){
 document.getElementById("hdrFields").innerHTML=HDR.map(function(f){ return fieldHTML(f[0],f[1],f[2]); }).join("");
 var hdr='<div class="pd-stage w5-sec" id="sec-Hdr" style="--sc:#7A869E"><h3>'+esc(t("sHdrT"))+'</h3><p class="pd-sub">'+esc(t("sHdrS"))+'</p>'+tblHTML("tm","a3-tm",[[t("tmN")],[t("tmRole")],[""]])+'<p class="ca-hint" id="tmNone"></p><div class="a3-add">'+addBtn("tm",t("tmAdd"))+'</div><div class="w5-warn w5-bad" id="spWarn" role="note" hidden></div></div>';
 var D=blkHTML("Prob",'<div class="pd-fields">'+fieldHTML("problem","ta",1)+fieldHTML("cost","ta",1)+fieldHTML("customer","tx",1)+'</div>'+tblHTML("ctq","dm-ctq",[[t("ctqT")],[t("ctqSpec")],[""]])+'<p class="ca-hint" id="ctqNone"></p><div class="a3-add">'+addBtn("ctq",t("ctqAdd"))+'<span class="ca-hint">'+esc(t("ctqMax"))+'</span></div>')+
  blkHTML("Scope",'<div class="pd-fields">'+fieldHTML("scin","ta",0)+fieldHTML("scout","ta",0)+'</div><p class="a3-sub">'+esc(t("sipH"))+'</p><div class="pd-fields">'+fieldHTML("sips","ta",0)+fieldHTML("sipi","ta",0)+'</div>'+
   tblHTML("stp","dm-stp",[[t("stpT")],[""]])+'<p class="ca-hint" id="stpNone"></p><div class="a3-add">'+addBtn("stp",t("stpAdd"))+'<span class="ca-hint">'+esc(t("stpRule"))+'</span></div><div class="w5-warn" id="stpWarn" role="note" hidden></div>'+
   '<div class="pd-fields" style="margin-top:8px">'+fieldHTML("sipo","ta",0)+fieldHTML("sipc","ta",0)+'</div><div class="dm-sipw" id="sipPrev"></div>')+
  blkHTML("Goal",'<div class="pd-fields">'+fieldHTML("gmeasure","tx",1)+fieldHTML("gfrom","num",0)+fieldHTML("gto","num",0)+fieldHTML("gby","date",0)+fieldHTML("gdate","date",0)+fieldHTML("gorig","num",0)+fieldHTML("gwhy","tx",1)+'</div><p class="ca-hint" id="goalDir"></p><p class="a3-rule" id="goalRule"></p><div class="w5-warn w5-bad" id="lateWarn" role="note" hidden></div><div class="w5-warn w5-bad" id="chgWarn" role="note" hidden></div>');
 var M=blkHTML("Op",'<div class="pd-fields">'+fieldHTML("what","ta",1)+fieldHTML("unit","tx",0)+fieldHTML("source","tx",0)+fieldHTML("sample","tx",1)+'</div>')+
  blkHTML("Msa",'<p class="a3-rule" id="msaRule"></p><div class="pd-fields">'+fieldHTML("mmethod","sel:MSAM:mm_",0)+fieldHTML("mdate","date",0)+fieldHTML("mres","ta",1)+fieldHTML("mrule","tx",1)+fieldHTML("mverd","sel:VERD:vd_",0)+'</div><div class="w5-warn w5-bad" id="msaFailW" role="note" hidden></div><div class="w5-warn w5-bad" id="msaLateW" role="note" hidden></div>')+
  blkHTML("Base",'<div class="pd-fields">'+fieldHTML("kind","sel:KINDS:kd_",0)+fieldHTML("stat","sel:STATS:sx_",0)+fieldHTML("bperiod","tx",0)+fieldHTML("bdate","date",0)+fieldHTML("lsl","num",0)+fieldHTML("usl","num",0)+fieldHTML("bpareto","cpa",0)+'</div>'+
   '<p class="a3-sub">'+esc(t("ptL"))+'</p>'+tblHTML("bp","dm-pts",PTH())+'<p class="ca-hint" id="bpNone"></p><div class="a3-add">'+addBtn("bp",t("ptAdd"))+'<span class="ca-hint">'+esc(t("ptMax"))+'</span></div>'+
   '<div class="dm-stats" id="bStats" aria-live="polite"></div><div class="a3-chartw" id="bChart"></div><p class="ca-hint" id="goalVs"></p>');
 var A='<div class="pd-fields">'+fieldHTML("andate","date",0)+'</div>'+
  '<div class="a3-pick" id="pickBox"><p class="a3-sub" style="margin:0;flex:1 1 100%">'+esc(t("pkT"))+'</p><div class="pd-f"><label for="pkHow">'+esc(t("pkHow"))+'</label><select id="pkHow">'+opts(["fish","why5","rca"],"pk_")+'</select></div><div class="pd-f"><label for="pkRef">'+esc(t("pkRef"))+'</label><input id="pkRef" type="text" dir="ltr" list="pkList"><datalist id="pkList"></datalist></div><div class="pd-btns"><button class="pd-btn ghost" type="button" id="pkUse">'+esc(t("pkUse"))+'</button></div><p class="a3-pkpv" id="pkPv" aria-live="polite"></p>'+
  '<p class="a3-pkpv" style="display:block"><span>'+esc(t("pkStart"))+'</span> <button class="pd-btn ghost" type="button" data-start="fish">'+esc(t("stFish"))+' ↗</button> <button class="pd-btn ghost" type="button" data-start="why5">'+esc(t("stWhy5"))+' ↗</button> <button class="pd-btn ghost" type="button" data-start="rca">'+esc(t("stRca"))+' ↗</button></p><p class="a3-pkpv" id="pkHub" hidden></p><p class="pd-ok a3-pkpv" id="pkMsg" role="status"></p></div>'+
  blkHTML("Cz",'<div id="czCards" class="dm-cards"></div><p class="ca-hint" id="czNone"></p><div class="a3-add">'+addBtn("cz",t("czAdd"))+'</div><p class="pa-sug" id="czSum"></p><div class="w5-warn w5-bad" id="personWarn" role="note" hidden></div>');
 var I=blkHTML("Sol",'<div id="soCards" class="dm-cards"></div><p class="ca-hint" id="soNone"></p><div class="a3-add">'+addBtn("so",t("soAdd"))+'</div><div class="w5-warn" id="treatWarn" role="note" hidden></div>');
 var C=blkHTML("Cp",tblHTML("cp","dm-cp",[[t("cpM")],[t("cpTarget")],[t("cpFreq")],[t("cpWho")],[t("cpReact")],[""]])+'<p class="ca-hint" id="cpNone"></p><div class="a3-add">'+addBtn("cp",t("cpAdd"))+'</div><div class="w5-warn" id="cpWarn" role="note" hidden></div>')+
  blkHTML("Af",'<div class="pd-fields">'+fieldHTML("ameasure","tx",1)+'</div><label class="w5-chk" for="f-asame"><input id="f-asame" type="checkbox"><span>'+esc(t("f_asame"))+'</span></label><div class="w5-warn" id="sameWarn" role="note" hidden></div>'+
   '<div class="pd-fields" style="margin-top:10px">'+fieldHTML("afrom","date",0)+fieldHTML("ato","date",0)+'</div><p class="a3-sub">'+esc(t("ptL"))+'</p>'+tblHTML("ap","dm-pts",PTH())+'<p class="ca-hint" id="apNone"></p><div class="a3-add">'+addBtn("ap",t("ptAdd"))+'</div>'+
   '<div class="dm-stats" id="aStats" aria-live="polite"></div><div class="a3-chartw" id="aChart"></div><p class="ca-hint" id="runInfo"></p><div class="pd-fields">'+fieldHTML("ares","sel:RESS:res_",0)+'</div><p><span class="a3-sugg" id="aSugg"></span></p>')+
  blkHTML("Hand",'<div class="pd-fields">'+fieldHTML("astd","ta",1)+fieldHTML("aopen","ta",1)+fieldHTML("anext","ltr",0)+fieldHTML("handto","tx",0)+fieldHTML("hdate","date",0)+'</div><div class="w5-warn" id="stdWarn" role="note" hidden></div>');
 document.getElementById("stages").innerHTML=hdr+phaseHTML("D",D)+phaseHTML("M",M)+phaseHTML("A",A)+phaseHTML("I",I)+phaseHTML("C",C);
 document.getElementById("goalRule").textContent=t("goalRule");
 document.getElementById("msaRule").textContent=t("msaRule");
 fillLists();
}
function fillLists(){
 var put=function(id,list){ var dl=document.getElementById(id); if(dl) dl.innerHTML=fill(list); };
 put("pdcaList",pdcaCycles().map(function(c){ return [c.id,c.title]; }));
 put("capaList",(recsOf(CAPA_KEY)||[]).map(function(c){ return [str(c.id),str(c.ref)+" · "+str(c.title)]; }));
 put("rcaList",(recsOf(RCA_KEY)||[]).map(function(c){ return [str(c.id),str(c.ref)+" · "+str(c.title)]; }));
 put("a3List",(recsOf(A3_KEY)||[]).map(function(c){ return [str(c.id),str(c.ref)+" · "+str(c.title)]; }));
 put("paList",(recsOf(PARETO_KEY)||[]).map(function(p){ return [str(p.id),str(p.ref)+" · "+str(p.title)]; }));
 var h=document.getElementById("pkHow"); put("pkList",(recsOf(keyOf(h?h.value:"fish"))||[]).map(function(p){ return [str(p.id),str(p.ref||"")+" · "+str(p.title)]; }));
}
/* ---- row tables: each field is [key, kind, label key]; kinds: tx, ta, num, numr (rate data), numm (measured value), date, calc ---- */
var TB={
 tm:{key:"team",blank:blankTm,f:[["n","tx","tmN"],["role","tx","tmRole"]]},
 ctq:{key:"def.ctq",blank:blankCtq,f:[["t","tx","ctqT"],["spec","tx","ctqSpec"]],max:MAXCTQ},
 stp:{key:"def.sip.steps",blank:blankStp,f:[["t","tx","stpT"]],max:MAXSTEPS},
 bp:{key:"meas.pts",blank:blankPt,f:[["l","tx","ptL"],["d","numr","ptD"],["n","numr","ptN"],["v","numm","ptV"],["r","calc","ptR"]],max:MAXPTS},
 cp:{key:"ctl.plan",blank:blankCp,f:[["m","ta","cpM"],["target","tx","cpTarget"],["freq","tx","cpFreq"],["who","tx","cpWho"],["react","ta","cpReact"]]},
 ap:{key:"ctl.pts",blank:blankPt,f:[["l","tx","ptL"],["d","numr","ptD"],["n","numr","ptN"],["v","numm","ptV"],["r","calc","ptR"]],max:MAXPTS}
};
function cellHTML(tb,f,row,i){
 var k=f[0], kind=f[1], lb=t(f[2])+" "+(i+1), id="r-"+tb+"-"+i+"-"+k, v=row[k], a=' id="'+id+'" data-k="'+k+'" aria-label="'+esc(lb)+'"';
 if(kind==="tx") return '<td><input type="text"'+a+' value="'+esc(v)+'"></td>';
 if(kind==="ta") return '<td><textarea rows="1"'+a+'>'+esc(v)+'</textarea></td>';
 if(kind==="numr"||kind==="numm") return '<td class="a3-n '+(kind==="numr"?"dm-r":"dm-m")+'"><input type="number" step="any" inputmode="decimal"'+a+' value="'+esc(vstr(v))+'"></td>';
 if(kind==="calc") return '<td class="dm-r dm-calc" data-calc dir="ltr"></td>';
 if(kind==="date") return '<td class="a3-d"><input type="date"'+a+' value="'+esc(v)+'"></td>';
 return '<td></td>';
}
function rowHTML(tb,row,i){
 return '<tr data-row="'+i+'">'+TB[tb].f.map(function(f){ return cellHTML(tb,f,row,i); }).join("")+'<td class="a3-x"><button type="button" class="ca-x" data-rdel="'+tb+':'+i+'" aria-label="'+esc(t("tmDel"))+'" title="'+esc(t("tmDel"))+'">✕</button></td></tr>';
}
var NONE={tm:"tmNone",ctq:"ctqNone",stp:"stpNone",bp:"ptNone",cp:"cpNone",ap:"ptNone",cz:"czNone",so:"soNone"};
var NONEID={tm:"tmNone",ctq:"ctqNone",stp:"stpNone",bp:"bpNone",cp:"cpNone",ap:"apNone",cz:"czNone",so:"soNone"};
function renderTbl(tb,list){
 var box=document.getElementById(tb+"Rows"); if(!box) return;
 box.innerHTML=list.map(function(x,i){ return rowHTML(tb,x,i); }).join("");
 var ne=document.getElementById(NONEID[tb]); if(ne) ne.textContent=list.length?"":t(NONE[tb]);
 autoSizeAll(box);
}
function readTbl(tb){
 var box=document.getElementById(tb+"Rows"); if(!box) return [];
 return [].map.call(box.querySelectorAll("tr[data-row]"),function(tr){
  var o={}; TB[tb].f.forEach(function(f){ var k=f[0], el=tr.querySelector('[data-k="'+k+'"]'); if(!el) return; o[k]=(f[1]==="numr"||f[1]==="numm")?num(el.value):txt(el.value); });
  return o;
 });
}
/* ---- cards: causes (with their data check) and solutions (with their pilot) ---- */
function cf(tb,i,k,kind,labHTML,wide){
 var id="r-"+tb+"-"+i+"-"+k, a=' id="'+id+'" data-k="'+k+'"', m=/^sel:(\w+):(\w+)$/.exec(kind), inner;
 if(kind==="ta") inner='<textarea rows="1"'+a+'></textarea>';
 else if(kind==="num") inner='<input type="number" step="any" inputmode="decimal" dir="ltr"'+a+'>';
 else if(kind==="date") inner='<input type="date"'+a+'>';
 else if(kind==="ref") inner='<input type="text" dir="ltr" list="'+id+'-l"'+a+'><datalist id="'+id+'-l"></datalist><div class="a3-pv" data-pv></div>';
 else if(kind==="sel") inner='<select'+a+'></select>';
 else if(m) inner='<select'+a+'>'+opts(LISTS[m[1]],m[2])+'</select>';
 else inner='<input type="text"'+a+'>';
 return '<div class="pd-f'+(wide?" wide":"")+' dm-f-'+k+'"><label for="'+id+'">'+labHTML+'</label>'+inner+'</div>';
}
function L1(k){ return esc(t(k)); }
function czCardHTML(c,i){
 return '<div class="dm-card dm-cz" data-row="'+i+'" data-cid="'+esc(c.id)+'" data-kind="'+esc(c.chk.kind)+'">'+
  '<div class="dm-ch"><b class="dm-code" data-code dir="ltr"></b><span class="dm-cres" data-cres></span><button type="button" class="ca-x" data-rdel="cz:'+i+'" aria-label="'+esc(t("czDel"))+'" title="'+esc(t("czDel"))+'">✕</button></div>'+
  '<div class="pd-fields">'+cf("cz",i,"t","ta",L1("czT"),1)+cf("cz",i,"how","sel:HOWS:how_",L1("czHow"))+cf("cz",i,"ref","ref",L1("czRef"))+cf("cz",i,"st","sel:CST:cs_",L1("czSt"))+cf("cz",i,"ev","ta",L1("czEv"),1)+'</div>'+
  '<div class="dm-chk"><div class="pd-fields">'+cf("cz",i,"kind","sel:CHKS:ck_",L1("ckT"))+'</div><div class="pd-fields dm-grp">'+
   cf("cz",i,"ga","tx",L1("ckGa"))+cf("cz",i,"xa","num",'<span class="k-r">'+L1("ckX_r")+'</span><span class="k-m">'+L1("ckX_m")+'</span>')+cf("cz",i,"na","num",'<span class="k-r">'+L1("ckN_r")+'</span><span class="k-m">'+L1("ckN_m")+'</span>')+cf("cz",i,"sa","num",L1("ckS_m"))+
   cf("cz",i,"gb","tx",L1("ckGb"))+cf("cz",i,"xb","num",'<span class="k-r">'+L1("ckX_r")+'</span><span class="k-m">'+L1("ckX_m")+'</span>')+cf("cz",i,"nb","num",'<span class="k-r">'+L1("ckN_r")+'</span><span class="k-m">'+L1("ckN_m")+'</span>')+cf("cz",i,"sb","num",L1("ckS_m"))+
  '</div><p class="dm-ckres" data-ckres aria-live="polite"></p></div><span class="a3-flag" data-flag></span></div>';
}
function soCardHTML(s,i){
 return '<div class="dm-card dm-so" data-row="'+i+'" data-cid="'+esc(s.id)+'">'+
  '<div class="dm-ch"><b class="dm-code" data-code dir="ltr"></b><span class="a3-sugg" data-pres></span><button type="button" class="ca-x" data-rdel="so:'+i+'" aria-label="'+esc(t("soDel"))+'" title="'+esc(t("soDel"))+'">✕</button></div>'+
  '<div class="pd-fields">'+cf("so",i,"cause","sel",L1("soCause"))+cf("so",i,"t","ta",L1("soT"),1)+cf("so",i,"where","tx",L1("soWhere"))+cf("so",i,"from","date",L1("soFrom"))+cf("so",i,"to","date",L1("soTo"))+cf("so",i,"val","num",L1("soVal"))+cf("so",i,"n","tx",L1("soN"))+
  cf("so",i,"risk","ta",L1("soRisk"),1)+cf("so",i,"ctrl","ta",L1("soCtrl"),1)+cf("so",i,"dec","sel:DECS:dc_",L1("soDec"))+'</div><span class="a3-flag" data-flag></span></div>';
}
var CZK=["t","how","ref","st","ev"], CKK=["kind","ga","xa","na","sa","gb","xb","nb","sb"], SOK=["cause","t","where","from","to","val","n","risk","ctrl","dec"];
function setVal(el,v){ if(!el) return; if(el.tagName==="SELECT"){ el.setAttribute("data-cur",v==null?"":String(v)); if([].some.call(el.options,function(o){ return o.value===String(v==null?"":v); })) el.value=String(v==null?"":v); } else el.value=v==null?"":String(v); }
function renderCards(tb,list){
 var box=document.getElementById(tb+"Cards"); if(!box) return;
 box.innerHTML=list.map(function(x,i){ return tb==="cz"?czCardHTML(x,i):soCardHTML(x,i); }).join("");
 [].forEach.call(box.querySelectorAll(".dm-card"),function(card,i){ var x=list[i];
  if(tb==="cz"){ CZK.forEach(function(k){ setVal(card.querySelector('[data-k="'+k+'"]'),x[k]); }); CKK.forEach(function(k){ setVal(card.querySelector('[data-k="'+k+'"]'),x.chk[k]); });
   var dl=card.querySelector("datalist"); if(dl&&["fish","why5","rca"].indexOf(x.how)>=0) dl.innerHTML=fill((recsOf(keyOf(x.how))||[]).map(function(z){ return [str(z.id),str(z.ref||"")+" · "+str(z.title)]; })); }
  else SOK.forEach(function(k){ setVal(card.querySelector('[data-k="'+k+'"]'),x[k]); }); });
 var ne=document.getElementById(NONEID[tb]); if(ne) ne.textContent=list.length?"":t(NONE[tb]);
 autoSizeAll(box);
}
function readCards(tb){
 var box=document.getElementById(tb+"Cards"); if(!box) return [];
 var v=function(card,k){ var el=card.querySelector('[data-k="'+k+'"]'); if(!el) return ""; if(el.tagName==="SELECT"&&k==="cause") return el.value||el.getAttribute("data-cur")||""; return el.type==="number"?num(el.value):txt(el.value); };
 return [].map.call(box.querySelectorAll(".dm-card"),function(card){
  var o={id:card.getAttribute("data-cid")};
  if(tb==="cz"){ CZK.forEach(function(k){ o[k]=v(card,k); }); o.chk={}; CKK.forEach(function(k){ o.chk[k]=v(card,k); }); }
  else SOK.forEach(function(k){ o[k]=v(card,k); });
  return o; });
}
function autoSize(el){ if(!el||el.tagName!=="TEXTAREA") return; el.style.height="auto"; if(el.scrollHeight) el.style.height=(el.scrollHeight+2)+"px"; }
function autoSizeAll(root){ if(root) root.querySelectorAll("textarea").forEach(autoSize); }
function badNum(){ var bad=false; Object.keys(NUMF).forEach(function(k){ var el=document.getElementById("f-"+k); if(el&&el.value!==""&&isNaN(numRaw(el.value))) bad=true; if(el&&el.validity&&el.validity.badInput) bad=true; });
 document.querySelectorAll('#stages input[type="number"]').forEach(function(el){ if((el.value!==""&&isNaN(numRaw(el.value)))||(el.validity&&el.validity.badInput)) bad=true; }); return bad; }
/* the project as it would be saved: empty rows dropped */
function formToRec(){
 var r=blank();
 Object.keys(PATH).forEach(function(k){ var el=document.getElementById("f-"+k); if(el) setP(r,PATH[k],NUMF[k]?num(el.value):txt(el.value)); });
 var fs=document.getElementById("f-asame"); r.ctl.same=!!(fs&&fs.checked);
 if(document.getElementById("tmRows")){
  r.team=readTbl("tm").map(fixTm).filter(function(m){ return m.n||m.role; });
  r.def.ctq=readTbl("ctq").map(fixCtq).filter(function(x){ return x.t||x.spec; });
  r.def.sip.steps=readTbl("stp").map(fixStp).filter(function(x){ return x.t; });
  r.meas.pts=readTbl("bp").map(fixPt).filter(function(x){ return x.l||x.d!==null||x.n!==null||x.v!==null; });
  r.ctl.plan=readTbl("cp").map(fixCp).filter(function(x){ return x.m||x.target||x.freq||x.who||x.react; });
  r.ctl.pts=readTbl("ap").map(fixPt).filter(function(x){ return x.l||x.d!==null||x.n!==null||x.v!==null; });
  r.an.causes=readCards("cz").map(fixCz).filter(function(x){ return x.t||x.ev; });
  r.imp.sols=readCards("so").map(fixSo).filter(function(x){ return x.t||x.risk; });
  PH.forEach(function(p){ var g={}; ["date","by","q","dec"].forEach(function(k){ var el=document.getElementById("g-"+p+"-"+k); g[k]=el?txt(el.value):""; }); r.gates[p]=fixGate(g); });
 }
 r.id=document.getElementById("rid").value;
 if(editing&&editing.id===r.id){ r.created=editing.created||""; }
 fixRec(r);
 return r;
}
/* while typing, the project keeps every row (even empty ones) so the tables keep their shape */
function formRaw(){ var o={}; Object.keys(TB).forEach(function(tb){ o[tb]=readTbl(tb); }); o.cz=readCards("cz"); o.so=readCards("so"); return o; }
function recToForm(r,keepMsg){
 r=fixRec(JSON.parse(JSON.stringify(r)));
 document.getElementById("rid").value=r.id||"";
 Object.keys(PATH).forEach(function(k){ var el=document.getElementById("f-"+k); if(!el) return; var v=getP(r,PATH[k]); v=(v===null||v===undefined)?"":String(v);
  if(k==="pcat"){ pcatOptions(r.pareto,v); return; } el.value=v||(el.tagName==="SELECT"&&el.options.length?el.options[0].value:""); });
 document.getElementById("f-asame").checked=r.ctl.same;
 renderTbl("tm",r.team); renderTbl("ctq",r.def.ctq); renderTbl("stp",r.def.sip.steps); renderTbl("bp",r.meas.pts); renderTbl("cp",r.ctl.plan); renderTbl("ap",r.ctl.pts);
 renderCards("cz",r.an.causes); renderCards("so",r.imp.sols);
 PH.forEach(function(p){ ["date","by","q","dec"].forEach(function(k){ var el=document.getElementById("g-"+p+"-"+k); if(el) el.value=r.gates[p][k]||""; }); });
 if(!keepMsg){ ["recErr","recOk","pkMsg"].forEach(function(id){ var e=document.getElementById(id); if(e) e.textContent=""; }); }
 refreshForm();
 autoSizeAll(document.getElementById("stages"));
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
function selOptions(el,list){ var cur=el.getAttribute("data-sig")?el.value:(el.getAttribute("data-cur")||""), sig=JSON.stringify(list); if(el.getAttribute("data-sig")!==sig){ el.innerHTML=list.map(function(o){ return '<option value="'+esc(o[0])+'">'+esc(o[1])+'</option>'; }).join(""); el.setAttribute("data-sig",sig); }
 if(list.some(function(o){ return o[0]===cur; })) el.value=cur; else { el.value=list.length?list[0][0]:""; } el.setAttribute("data-cur",el.value); }
function setW(id,on,msg){ var w=document.getElementById(id); if(!w) return; w.hidden=!on; w.textContent=on?msg:""; }
function statsHTML(o,r){
 var u=txt(r.meas.unit), items=[[t("sN"),String(o.n)],[t("sMean"),fmtN(o.mean===null?null:Math.round(o.mean*100)/100)],[t("sMed"),fmtN(o.median===null?null:Math.round(o.median*100)/100)]];
 if(r.meas.kind==="rate"){ items.push([t("sRate"),o.rate===null?"—":fmt1(o.rate)+"% ("+t("sOf",{d:fmtN(o.defects),n:fmtN(o.units)})+")"]); if(o.dpmo!==null) items.push([t("sDpmo"),fmtN(o.dpmo)]); }
 else { if(o.out!==null) items.push([t("sOut"),fmt1(o.out)+"%"]); if(o.cpk!==null) items.push([t("sCpk"),fmtN(Math.round(o.cpk*100)/100)]); }
 return '<div class="dm-st">'+items.map(function(x){ return '<span><small>'+esc(x[0])+'</small><b>'+esc(x[1])+'</b></span>'; }).join("")+'</div>'+(o.cpk!==null?'<p class="ca-hint">'+esc(t("sNote"))+'</p>':'')+(o.n>=MINPTS&&o.n<10?'<p class="ca-hint">'+esc(t("sFew"))+'</p>':'')+(u?'':'');
}
/* the parts that depend on other rows are updated in place, so typing never loses focus */
function refreshForm(){
 var r=formToRec(), st=stageOf(r), CD=codes(r), W=chartW();
 var el=document.getElementById("curStage"); if(el) el.textContent=t("cur")+" "+(st==="stop"?stageName(st)+" "+t("ph_"+stopAt(r)):stageName(st));
 document.getElementById("caSteps").innerHTML=mapHTML(r);
 setW("spWarn",spLead(r),t("spW"));
 /* Define */
 var raw=formRaw(), nst=raw.stp.filter(function(x){ return txt(x.t); }).length;
 setW("stpWarn",nst>0&&(nst<5||nst>MAXSTEPS),t("stpW",{n:nst}));
 var ad=function(tb){ var b=document.querySelector('[data-add="'+tb+'"]'); if(b) b.disabled=raw[tb].length>=(TB[tb].max||MAXROWS); }; ["ctq","stp","bp","ap"].forEach(ad);
 var sp=document.getElementById("sipPrev"); if(sp){ var S=r.def.sip; sp.innerHTML=(txt(S.s)||txt(S.i)||steps(r).length||txt(S.o)||txt(S.c))?sipocHTML(r):""; }
 var gd=document.getElementById("goalDir"); if(gd) gd.textContent=(r.goal.from!==null&&r.goal.to!==null&&r.goal.from!==r.goal.to)?(r.goal.to<r.goal.from?t("dirDown"):t("dirUp")):"";
 setW("lateWarn",late(r),t("lateW")); setW("chgWarn",changed(r)&&!txt(r.goal.why),t("chgW"));
 var gw=document.getElementById("w-gwhy"); if(gw) gw.style.display=(r.goal.orig!==null||txt(r.goal.why))?"":"none";
 /* Measure */
 var kind=r.meas.kind; ["bpW","apW"].forEach(function(id){ var w=document.getElementById(id); if(w){ w.classList.toggle("k-rate",kind==="rate"); w.classList.toggle("k-meas",kind!=="rate"); } });
 ["lsl","usl"].forEach(function(k){ var w=document.getElementById("w-"+k); if(w) w.style.display=kind==="rate"?"none":""; });
 ["bpRows","apRows"].forEach(function(id){ document.querySelectorAll("#"+id+" tr[data-row]").forEach(function(tr){ var d=num(tr.querySelector('[data-k="d"]').value), n=num(tr.querySelector('[data-k="n"]').value), c=tr.querySelector("[data-calc]"); if(c) c.textContent=(n!==null&&n>0&&d!==null&&d>=0&&d<=n)?fmt1(d/n*100):"—"; }); });
 setW("msaFailW",msaDone(r)&&r.meas.msa.verdict==="fail",t("msaFailW")); setW("msaLateW",msaLate(r),t("msaLateW"));
 var bs=baseStats(r), bI=bs.n<MINPTS?paBase(r):null, bsx=document.getElementById("bStats");
 if(bsx) bsx.innerHTML=bs.n?statsHTML(bs,r)+(baseKey(r)!==null?'<p class="ca-hint">'+esc(t("sKey",{v:fmtN(Math.round(baseKey(r)*100)/100),u:txt(r.meas.unit)}))+'</p>':''):(bI?'<p class="ca-hint">'+esc(t("sPa",{id:str(bI.p.id),t:bI.txt}))+'</p>':"");
 var bc=document.getElementById("bChart"); if(bc) bc.innerHTML=baseSVG(r,L,W);
 var bk=baseKey(r), gv=document.getElementById("goalVs"); if(gv) gv.textContent=(bk!==null&&r.goal.from!==null&&Math.abs(bk-r.goal.from)>Math.max(0.5,Math.abs(r.goal.from)*0.1))?t("goalVs",{g:fmtN(r.goal.from),b:fmtN(Math.round(bk*100)/100)}):"";
 var bpi=document.getElementById("bpInfo"); if(bpi) bpi.textContent=r.meas.pareto?(byIdIn(PARETO_KEY,r.meas.pareto)?preview("pareto",r.meas.pareto):t("paMiss")):"";
 /* Analyse: picker preview, cards */
 var how=document.getElementById("pkHow").value, ref=txt(document.getElementById("pkRef").value);
 document.getElementById("pkPv").textContent=preview(how,ref);
 var hub=inHub(), ph=document.getElementById("pkHub"); if(ph){ ph.hidden=!hub; ph.textContent=hub?t("pkHub"):""; }
 var czRaw=raw.cz;
 document.querySelectorAll("#czCards .dm-card").forEach(function(card,i){
  var c=fixCz(JSON.parse(JSON.stringify(czRaw[i]||{}))); c.id=card.getAttribute("data-cid");
  card.querySelector("[data-code]").textContent="R"+(i+1);
  card.setAttribute("data-kind",c.chk.kind); card.classList.toggle("st-out",c.st==="out");
  var rf=card.querySelector('[data-k="ref"]'), pv=card.querySelector("[data-pv]"), linked=["fish","why5","rca"].indexOf(c.how)>=0;
  if(rf){ rf.disabled=!linked; if(pv) pv.textContent=linked&&txt(rf.value)?preview(c.how,txt(rf.value)):""; }
  card.querySelector("[data-ckres]").textContent=chkText(c);
  var ok=c.st==="conf"&&chkRes(c).ok, cr=card.querySelector("[data-cres]"); cr.className="dm-cres ca-chip "+(c.st==="out"?"info":(ok?"ok":(c.st==="conf"?"bad":"warn"))); cr.textContent=c.t?t("cs_"+c.st):"";
  var msg=[]; if(c.t&&c.st!=="out"&&personOnly(c.t)) msg.push(t("personF")); if(c.t&&c.st==="conf"&&!chkRes(c).ok) msg.push(t("noChkF"));
  card.querySelector("[data-flag]").textContent=msg.join(" "); card.classList.toggle("a3-pf",!!c.t&&c.st!=="out"&&personOnly(c.t)); });
 document.getElementById("czSum").textContent=r.an.causes.length?t("czSum",{p:proved(r).length,h:hyps(r).length,o:r.an.causes.filter(function(c){ return c.st==="out"; }).length}):"";
 setW("personWarn",personCauses(r).length>0,t("personW"));
 /* Improve: the proved causes a solution can be tied to */
 var P=provedIds(r), cOpts=[["","—"]].concat(r.an.causes.map(function(c,i){ return c.t&&c.st!=="out"?[c.id,"R"+(i+1)+(P[c.id]?" ✓ ":" ? ")+short(c.t,50)]:null; }).filter(Boolean));
 document.querySelectorAll("#soCards .dm-card").forEach(function(card,i){
  card.querySelector("[data-code]").textContent="S"+(i+1);
  var s=card.querySelector('[data-k="cause"]'); selOptions(s,cOpts);
  var so=fixSo(raw.so[i]||{}), msg=[], pr=card.querySelector("[data-pres]"), pres=piloted(so)?cmpGoal(r,so.val):"";
  if(so.t&&!P[s.value]) msg.push(t("untiedF")); if(so.t&&!piloted(so)) msg.push(t("unpilotF")); if(so.t&&(!txt(so.risk)||!txt(so.ctrl))) msg.push(t("riskF"));
  card.querySelector("[data-flag]").textContent=msg.join(" ");
  pr.className="a3-sugg"+(pres?" "+pres:""); pr.textContent=pres?t("pilotRes",{r:t("res_"+pres)}):""; });
 var un=untreated(r); setW("treatWarn",un.length>0&&sols(r).length>0,t("untreatW",{c:un.map(function(c){ return CD[c.id]; }).join("، ")}));
 /* Control */
 setW("cpWarn",cpBad(r).length>0,t("cpW",{n:cpBad(r).length}));
 setW("sameWarn",!!txt(r.ctl.measure)&&!!txt(r.goal.measure)&&low(r.ctl.measure)!==low(r.goal.measure),t("sameW"));
 var as=afterStats(r), asx=document.getElementById("aStats"); if(asx) asx.innerHTML=as.n?statsHTML(as,r):"";
 var ac=document.getElementById("aChart"); if(ac) ac.innerHTML=afterSVG(r,L,W);
 var rr=runRead(r), ri=document.getElementById("runInfo"); if(ri) ri.textContent=rr?t("runInfo",{b:rr.b,n:rr.n,m:fmtN(Math.round(rr.m*100)/100),k:rr.k})+" "+(rr.n<6?t("runFew"):t("runSig")):"";
 var sg=suggest(r), su=document.getElementById("aSugg"); su.className="a3-sugg"+(sg?" "+sg:""); su.textContent=sg?t("aSugg",{r:t("res_"+sg)}):t("aNoSugg");
 setW("stdWarn",afterOk(r)&&!stdOk(r),t("stdW"));
 /* gates */
 PH.forEach(function(p){ var n=document.getElementById("gn-"+p); if(!n) return; var g=r.gates[p], m=[];
  if(g.dec==="stop"&&isD(g.date)) m.push(t("gStopW")); else if(PHOK[p](r)&&!gatePass(r,p)) m.push(t("gPend")); else if(!PHOK[p](r)&&!g.dec) m.push(t("gNotYet"));
  if(txt(g.by)&&txt(r.lead)&&low(g.by)===low(r.lead)) m.push(t("gLeadW"));
  n.textContent=m.join(" "); n.className="dm-gnote"+(gatePass(r,p)?" ok":"");
  var gb=document.getElementById("gate-"+p); if(gb) gb.classList.toggle("passed",gatePass(r,p)); });
 /* header links */
 var pi=document.getElementById("pdInfo"); if(pi){ if(!r.pdca) pi.textContent=t("pdHint"); else { var pc=pdcaCycles().filter(function(x){ return x.id===r.pdca; })[0]; pi.textContent=pc?t("pdFound",{t:pc.title||pc.id}):t("pdMiss"); } }
 var ca=document.getElementById("caInfo"); if(ca) ca.textContent=r.capa?(byIdIn(CAPA_KEY,r.capa)?preview("capa",r.capa):t("caMiss")):t("caHint");
 var rc=document.getElementById("rcInfo"); if(rc) rc.textContent=r.rca?(byIdIn(RCA_KEY,r.rca)?preview("rca",r.rca):t("rcMiss")):t("rcHint");
 var a3i=document.getElementById("a3Info"); if(a3i){ var a3r=r.a3?byIdIn(A3_KEY,r.a3):null, cu=a3r?obj(a3r.cur):{}; a3i.textContent=r.a3?(a3r?preview("a3",r.a3)+(txt(str(cu.measure))?" · "+t("pvA3Cur",{m:short(str(cu.measure),60),b:cu.base==null?"—":String(cu.base),u:str(cu.unit),p:short(str(cu.period),40)}):""):t("a3Miss")):t("a3Hint"); }
 pcatOptions(r.pareto);
 var pa=document.getElementById("paInfo"); if(pa) pa.textContent=r.pareto?(byIdIn(PARETO_KEY,r.pareto)?preview("pareto",r.pareto):t("paMiss")):t("paHint");
 var pcI=document.getElementById("pcInfo"); if(pcI){ var c2=(r.pareto&&r.pcat)?paCatInfo(r.pareto,r.pcat):null; pcI.textContent=c2?c2.txt:""; }
}
function sipocHTML(r,lang){
 var tt=function(k){ return (UI[lang||L]||UI.ar)[k]; }, S=r.def.sip, cell=function(v){ return '<td>'+(txt(v)?esc(v):'<span class="mt">—</span>')+'</td>'; };
 return '<table class="dm-sip"><thead><tr><th>S</th><th>I</th><th>P</th><th>O</th><th>C</th></tr><tr class="dm-sipl"><td>'+esc(tt("f_sips"))+'</td><td>'+esc(tt("f_sipi"))+'</td><td>'+esc(tt("stpT"))+'</td><td>'+esc(tt("f_sipo"))+'</td><td>'+esc(tt("f_sipc"))+'</td></tr></thead><tbody><tr>'+cell(S.s)+cell(S.i)+'<td>'+(steps(r).length?'<ol>'+steps(r).map(function(x){ return '<li>'+esc(x.t)+'</li>'; }).join("")+'</ol>':'<span class="mt">—</span>')+'</td>'+cell(S.o)+cell(S.c)+'</tr></tbody></table>';
}
function validate(r){
 if(!r.title) return t("e_title");
 if(badNum()) return t("e_num");
 if(isD(r.ctl.from)&&isD(r.ctl.to)&&r.ctl.from>r.ctl.to) return t("e_adate");
 if(r.imp.sols.some(function(s){ return isD(s.from)&&isD(s.to)&&s.from>s.to; })) return t("e_pdate");
 var badPt=function(p){ return (p.d!==null&&p.d<0)||(p.n!==null&&p.n<0)||(p.d!==null&&p.n!==null&&p.d>p.n); };
 if(r.meas.kind==="rate"&&(r.meas.pts.some(badPt)||r.ctl.pts.some(badPt))) return t("e_ck");
 if(r.an.causes.some(function(c){ var k=c.chk; return k.kind==="rate"&&((k.xa!==null&&k.na!==null&&k.xa>k.na)||(k.xb!==null&&k.nb!==null&&k.xb>k.nb)||k.xa<0||k.xb<0||k.na<0||k.nb<0); })) return t("e_ck");
 return "";
}
function newId(r){
 var y=(isD(r.start)?r.start:today()).slice(0,4), pre="DM-"+y+"-";
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

/* ---------- pick candidate causes from Fishbone, 5 Whys or RCA (read only) ---------- */
function pickCauses(){
 var how=document.getElementById("pkHow").value, id=txt(document.getElementById("pkRef").value), msg=document.getElementById("pkMsg");
 if(!id){ msg.textContent=t("nxNoData"); return; }
 var R=causesFrom(how,id); if(R===null){ msg.textContent=t("nxMiss"); return; }
 if(!R.length){ msg.textContent=t("pkNone"); return; }
 var list=formRaw().cz, n=0, have=list.map(function(c){ return low(c.t); }), mx=0;
 list.concat(editing?editing.an.causes:[]).forEach(function(c){ var m=/^c(\d+)$/.exec(c.id||""); if(m) mx=Math.max(mx,+m[1]); });
 R.forEach(function(x){ if(have.indexOf(low(x.t))>=0||list.length>=MAXROWS) return; mx++; var c=fixCz({id:"c"+mx,t:x.t,how:x.how,ref:x.ref,st:x.st,ev:x.ev,chk:x.chk}); list.push(c); n++; });
 if(!n){ msg.textContent=t("pkDup"); return; }
 if(!document.getElementById("f-andate").value) document.getElementById("f-andate").value=today();
 renderCards("cz",list.map(function(c){ return fixCz(c); })); refreshForm(); msg.textContent=t("pkAdded",{n:n,id:id});
}
function startIn(how){
 var r=formToRec();
 if(how==="rca"){ openRca(r.capa?{capa:r.capa}:(r.pareto&&r.pcat?{pareto:r.pareto,cat:r.pcat}:{})); return; }
 if(how==="fish"){ openFish(r.capa?{capa:r.capa}:(r.pareto&&r.pcat?{pareto:r.pareto,cat:r.pcat}:{})); return; }
 openWhy5(r.capa?{capa:r.capa}:{});
}

/* ---------- start from an A3, an RCA investigation or a Pareto vital-few category (read only, preview first) ---------- */
function stSelects(){ var s=document.getElementById("stSrc"); if(!s) return; var cur=s.value||"a3"; s.innerHTML=opts(["a3","rca","pareto"],"ss_",cur); }
function stRows(src){
 if(src==="a3"){ var A=recsOf(A3_KEY); return A?A.map(function(c){ return {k:"a3",c:c}; }):null; }
 if(src==="rca"){ var R=recsOf(RCA_KEY); return R?R.map(function(c){ return {k:"rca",c:c}; }):null; }
 var P=recsOf(PARETO_KEY); if(!P) return null; var o=[];
 P.forEach(function(p){ var K=paRank(p); K.rows.filter(function(x){ return x.vit; }).forEach(function(x){ o.push({k:"pareto",p:p,x:x,tot:K.total}); }); });
 return o;
}
function th(keys){ return '<thead><tr>'+keys.map(function(k){ return '<th>'+esc(t(k))+'</th>'; }).join("")+'</tr></thead>'; }
function stPreview(keep){
 var src=document.getElementById("stSrc").value||"a3", msg=document.getElementById("stMsg"), box=document.getElementById("stTable"), R=stRows(src);
 if(!R){ ST=null; box.hidden=true; msg.textContent=t("stNone"); return; }
 if(!R.length){ ST=null; box.hidden=true; msg.textContent=t("stEmpty"); return; }
 ST={src:src}; if(!keep) msg.textContent="";
 box.hidden=false;
 if(src==="a3") box.innerHTML='<table class="pd-tbl">'+th(["stColId","stColT","stColSt","stColGoal","stColCur","stColN","stColA"])+'<tbody>'+
  R.map(function(x){ var c=x.c, id=str(c.id), cu=obj(c.cur), n=DB.records.filter(function(r){ return r.a3===id; }).length;
   return '<tr><td><b dir="ltr">'+esc(id)+'</b></td><td><b dir="ltr">'+esc(str(c.ref))+'</b><br>'+esc(str(c.title))+'</td><td>'+esc(t("a3st_"+a3Stage(c)))+'</td><td>'+esc(a3Goal(c))+'<br><small>'+esc(a3Res(c))+'</small></td><td>'+esc(short(str(cu.measure),60)||"—")+(cu.base!=null?' <b dir="ltr">'+esc(String(cu.base)+(str(cu.unit)?" "+str(cu.unit):""))+'</b>':'')+'</td><td>'+n+'</td><td><button class="pd-rowbtn" type="button" data-sta3="'+esc(id)+'">'+esc(t("stUse"))+'</button></td></tr>'; }).join("")+'</tbody></table>';
 else if(src==="rca") box.innerHTML='<table class="pd-tbl">'+th(["stColId","stColT","stColSt","stColRoot","stColN","stColA"])+'<tbody>'+
  R.map(function(x){ var c=x.c, id=str(c.id), n=DB.records.filter(function(r){ return r.rca===id; }).length;
   return '<tr><td><b dir="ltr">'+esc(id)+'</b></td><td><b dir="ltr">'+esc(str(c.ref))+'</b><br>'+esc(str(c.title))+'</td><td>'+esc(t("rst_"+rcaStage(c)))+'</td><td>'+esc(short(rcaRoots(c).map(function(z){ return str(z.t); }).join(" · "),120)||"—")+'</td><td>'+n+'</td><td><button class="pd-rowbtn" type="button" data-strca="'+esc(id)+'">'+esc(t("stUse"))+'</button></td></tr>'; }).join("")+'</tbody></table>';
 else box.innerHTML='<table class="pd-tbl">'+th(["stColId","stColCat","stColV","stColPer","stColN","stColA"])+'<tbody>'+
  R.map(function(z){ var p=z.p, x=z.x, id=str(p.id), cid=str(x.c.id), n=DB.records.filter(function(r){ return r.pareto===id&&r.pcat===cid; }).length;
   return '<tr><td><b dir="ltr">'+esc(id)+'</b><br><small>'+esc(short(str(p.title),70))+'</small></td><td>'+esc(str(x.c.name))+'</td><td dir="ltr">'+esc(fmtN(x.v)+(puName(p.unit)?" "+puName(p.unit):"")+" · "+(Math.round(x.share*10)/10).toFixed(1)+"%")+'</td><td dir="ltr">'+esc((str(p.from)||"—")+" → "+(str(p.to)||"—"))+'</td><td>'+n+'</td><td><button class="pd-rowbtn" type="button" data-stpa="'+esc(id)+'" data-cat="'+esc(cid)+'">'+esc(t("stUse"))+'</button></td></tr>'; }).join("")+'</tbody></table>';
}
function prefilled(r,msgKey,v){ fixRec(r); editing=null; recToForm(r); go("tools"); document.getElementById("recOk").textContent=t(msgKey,v); return true; }
/* a new project filled from an A3; the A3 is only read. The goal is not copied: the lead writes it, dated. */
function prefillFromA3(id){
 var a=byIdIn(A3_KEY,id); if(!a) return false;
 var r=blank(), b=obj(a.bg), cu=obj(a.cur), f=obj(a.fu);
 r.title=str(a.title); r.ref=str(a.ref); r.src="a3"; r.a3=str(a.id); r.rca=str(a.rca); r.capa=str(a.capa); r.pareto=str(a.pareto); r.pcat=str(a.pcat); r.pdca=str(a.pdca); r.area=str(a.area); r.lead=str(a.owner); r.sponsor=str(a.sponsor); r.owner=""; r.start=today();
 r.team=arr(a.team).map(function(m){ return {n:str(m.n),role:str(m.role)}; });
 r.def.problem=txt(str(b.text))+(txt(str(f.open))?" "+txt(str(f.open)):"");
 r.meas.what=str(f.measure)||str(cu.measure); r.meas.unit=str(cu.unit);
 prefilled(r,"stUsedA",{id:str(a.id)});
 document.getElementById("recOk").textContent+=" "+t("pfA3",{id:str(a.id),g:a3Goal(a),r:a3Res(a)});
 return true;
}
/* a new project filled from an RCA investigation; the investigation is only read */
function prefillFromRca(id){
 var c=byIdIn(RCA_KEY,id); if(!c) return false;
 var r=blank(), p=obj(c.prob);
 r.title=str(c.title); r.ref=str(c.ref); r.src="rca"; r.rca=str(c.id); r.capa=str(c.capa); r.pareto=str(c.pareto); r.pcat=str(c.pcat); r.pdca=str(c.pdca); r.area=str(c.area); r.lead=str(c.lead); r.start=today();
 r.team=arr(c.team).map(function(m){ return {n:str(m.n),role:str(m.role)}; });
 r.def.problem=txt(str(p.what))+(txt(str(p.req))?" ("+str(p.req)+")":""); r.def.cost=str(p.much);
 r.an.causes=rcaRoots(c).map(function(z,i){ var ok=z.st==="conf"&&txt(str(z.ev)); return {id:"c"+(i+1),t:str(z.t),how:"rca",ref:str(c.id),st:ok?"conf":"hyp",ev:str(z.ev),chk:ok?{kind:"link"}:{}}; });
 return prefilled(r,"stUsedR",{id:str(c.id)});
}
/* a new project filled from a Pareto category: the analysis gives the baseline chart until points over time are entered; it is only read */
function prefillFromPareto(pid,cid){
 var I=paCatInfo(pid,cid); if(!I) return false;
 var p=I.p, x=I.x, r=blank();
 r.title=short(str(x.c.name)+" — "+str(p.title),120); r.ref=str(p.ref)||str(p.id); r.src="pareto"; r.pareto=str(p.id); r.pcat=str(x.c.id); r.pdca=str(p.pdca); r.area=str(p.area); r.start=today();
 r.def.problem=str(x.c.name)+(txt(str(x.c.def))?": "+str(x.c.def):"");
 r.meas.what=str(x.c.name); r.meas.unit=puName(p.unit); r.meas.period=(isD(p.from)&&isD(p.to))?str(p.from)+" → "+str(p.to):""; r.meas.pareto=str(p.id); r.meas.kind="meas"; r.meas.stat="mean";
 var nx=obj(x.c.nx); if(nx.how==="capa") r.capa=str(nx.ref); if(nx.how==="rca") r.rca=str(nx.ref);
 prefilled(r,"stUsedP",{id:str(p.id),c:str(x.c.name)});
 document.getElementById("recOk").textContent+=" "+I.txt;
 return true;
}
document.getElementById("stSrc").addEventListener("change",function(){ ST=null; document.getElementById("stTable").hidden=true; document.getElementById("stMsg").textContent=""; });
document.getElementById("stPrev").addEventListener("click",function(){ stPreview(false); });
document.getElementById("stTable").addEventListener("click",function(e){ var a=e.target.closest("[data-sta3]"); if(a){ prefillFromA3(a.getAttribute("data-sta3")); return; } var b=e.target.closest("[data-strca]"); if(b){ prefillFromRca(b.getAttribute("data-strca")); return; } var p=e.target.closest("[data-stpa]"); if(p) prefillFromPareto(p.getAttribute("data-stpa"),p.getAttribute("data-cat")); });
function homeCounts(){ var n=0; (recsOf(PARETO_KEY)||[]).forEach(function(p){ n+=paRank(p).rows.filter(function(x){ return x.vit; }).length; });
 return {a:(recsOf(A3_KEY)||[]).length,r:(recsOf(RCA_KEY)||[]).length,p:n}; }
function renderHomeSt(){
 var box=document.getElementById("homeImp"); if(!box) return;
 var h=homeCounts(), n=h.a+h.r+h.p; box.hidden=!n || DB.records.length>0; if(n) document.getElementById("homeImpT").textContent=t("hmT",h);
}
document.getElementById("homeImpGo").addEventListener("click",function(){ go("tools"); var s=document.getElementById("stSrc"), h=homeCounts(); if(s) s.value=h.a?"a3":(h.r?"rca":"pareto"); stPreview(false); var b=document.getElementById("stBox"); if(b&&b.scrollIntoView) b.scrollIntoView({block:"start"}); });

/* ---------- self-assessment ---------- */
var AQ=[
 ["DF1",{ar:"هل لكل مشروع ميثاق مكتوب براعٍ غير قائده، وهدف رقمي بتاريخ يُكتب في مرحلة التعريف؟",en:"Does every project have a written charter with a sponsor other than its lead, and a numeric, dated goal written in Define?"}],
 ["DF2",{ar:"هل نترجم صوت العميل إلى متطلبات حرجة (CTQ) قابلة للقياس قبل اختيار المقياس؟",en:"Do we turn the voice of the customer into measurable critical-to-quality requirements (CTQs) before choosing the measure?"}],
 ["DF3",{ar:"هل نرسم SIPOC للعملية ونكتب ما داخل النطاق وما خارجه، فلا يتسع المشروع أثناء العمل؟",en:"Do we map a SIPOC of the process and write what is in and out of scope, so the project does not grow on the way?"}],
 ["ME1",{ar:"هل لكل مقياس تعريف تشغيلي: ما الذي يُعدّ بالضبط، والوحدة، ومصدر البيانات، والعينة؟",en:"Does every measure have an operational definition: exactly what is counted, the unit, the data source and the sample?"}],
 ["ME2",{ar:"هل نتحقق من أن القياس يُوثق به (تكرار وإعادة إنتاج، أو اتفاق المقيّمين، أو مرجع معاير) قبل تثبيت الأساس؟",en:"Do we check that the measurement can be trusted (repeatability and reproducibility, attribute agreement or a calibrated reference) before the baseline is fixed?"}],
 ["ME3",{ar:"هل يُثبَّت الأساس بفترته وحجم عينته ويُرسم رسماً تشغيلياً، لا رقماً واحداً من الذاكرة؟",en:"Is the baseline fixed with its period and sample size and drawn as a run chart, not one number from memory?"}],
 ["AN1",{ar:"هل تُثبت الأسباب أو تُستبعد بالبيانات (مقارنة مجموعات، أو باريتو مقسّم، أو قبل وبعد) لا بالتصويت؟",en:"Are causes proved or ruled out with data (a comparison of groups, a stratified Pareto, a before/after) rather than by vote?"}],
 ["IM1",{ar:"هل تُجرَّب الحلول على نطاق صغير وتُقارن نتيجتها بالهدف وتُفحص مخاطر التغيير قبل التعميم؟",en:"Are solutions piloted on a small scale, their result compared with the goal and the risks of the change checked before the roll-out?"}],
 ["CT1",{ar:"هل لكل مشروع خطة ضبط: ما يُقاس، وكم مرة، ومن يقيس، وما رد الفعل عند الانحراف؟",en:"Does every project have a control plan: what is measured, how often, by whom, and the reaction when it drifts?"}],
 ["CT2",{ar:"هل نقيس بالمقياس نفسه بعد التغيير لفترة محددة ونقارن النتيجة بالهدف قبل إعلان النجاح؟",en:"Do we measure on the same measure after the change over a stated period and compare the result with the goal before we call it a success?"}],
 ["CT3",{ar:"هل يُسلَّم المشروع لمالك العملية بتاريخ، وتُحدَّث الإجراءات والنماذج التي تغيّرت؟",en:"Is the project handed over to the process owner on a date, with the procedures and forms that changed updated?"}],
 ["GT1",{ar:"هل تنتهي كل مرحلة ببوابة يراجعها الراعي بالأسئلة، ولا تبدأ المرحلة التالية قبل اجتيازها؟",en:"Does each phase end with a gate the sponsor reviews through questions, with the next phase starting only after it is passed?"}]
];
var AGROUPS=["DF","ME","AN","IM","CT","GT"];
var GCOL={DF:"#C2410C",ME:"#3563C9",AN:"#1B2A4A",IM:"#C9821A",CT:"#1E8C93",GT:"#B8901E"};
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
function resOf(r){ return afterOk(r)?r.ctl.res:""; }
function goalLine(r){ var g=r.goal; return txt(g.measure)?(g.from===null?"—":fmtN(g.from))+" → "+(g.to===null?"—":fmtN(g.to))+(txt(r.meas.unit)?" "+txt(r.meas.unit):"")+(isD(g.by)?" · "+g.by:""):"—"; }
function renderDocs(){
 var box=document.getElementById("docsBox"); if(!box) return;
 var c0=document.getElementById("cntDocs"); if(c0) c0.textContent=DB.records.length?String(DB.records.length):"";
 if(!DB.records.length){ box.innerHTML='<div class="pd-empty">'+esc(t("none"))+'</div>'; return; }
 var rows=DB.records.map(function(r){
  var st=stageOf(r), res=resOf(r), L2=live(r);
  var del=(pendingDelete===r.id)?'<button class="pd-rowbtn arm" type="button" data-del="'+esc(r.id)+'">'+esc(t("delArm"))+'</button>':'<button class="pd-rowbtn" type="button" data-del="'+esc(r.id)+'">'+esc(t("del"))+'</button>';
  var lk=(r.a3?'<button class="pd-rowbtn" type="button" data-oa3="'+esc(r.a3)+'">A3 ↗</button>':'')+(r.rca?'<button class="pd-rowbtn" type="button" data-orca="'+esc(r.rca)+'">RCA ↗</button>':'')+(r.capa?'<button class="pd-rowbtn" type="button" data-capa="'+esc(r.capa)+'">CAPA ↗</button>':'')+(r.pdca?'<button class="pd-rowbtn" type="button" data-pdca="'+esc(r.pdca)+'">PDCA ↗</button>':'');
  return '<tr><td><b dir="ltr">'+esc(r.ref||"—")+'</b><br>'+esc(r.title)+'<br><small dir="ltr" style="color:var(--muted)">'+esc(r.id)+'</small></td><td>'+esc(r.lead||"—")+'<br><small>'+esc(r.sponsor||"—")+'</small></td><td><span class="pd-badge" style="background:'+SCOL[st]+';color:#fff">'+esc(stageName(st))+'</span><br><small>'+esc(t("src_"+r.src))+'</small></td><td>'+esc(txt(r.goal.measure)?short(r.goal.measure,60)+" · "+goalLine(r):"—")+'</td><td>'+(res?'<span class="ca-chip '+(res==="met"?"ok":(res==="part"?"warn":"bad"))+'">'+esc(t("res_"+res))+'</span>':esc(t("resPend")))+'</td><td>'+(L2.length?esc(t("czN",{p:proved(r).length,n:L2.length})):"—")+'</td><td>'+flagsOf(r).map(chip).join("")+'</td><td><button class="pd-rowbtn" type="button" data-open="'+esc(r.id)+'">'+esc(t("open"))+'</button>'+del+lk+'</td></tr>';
 }).join("");
 box.innerHTML='<table class="pd-tbl">'+th(["colRef","colLead","colStage","colGoal","colRes","colCz","colFlags","colAct"])+'<tbody>'+rows+'</tbody></table>';
}
function newCardId(tb,raw){ var pre=tb==="cz"?"c":"s", n=0, re=new RegExp("^"+pre+"(\\d+)$"); raw.concat(editing?(tb==="cz"?editing.an.causes:editing.imp.sols):[]).forEach(function(c){ var m=re.exec(c.id||""); if(m) n=Math.max(n,+m[1]); }); return pre+(n+1); }
document.addEventListener("click",function(e){
 if(e.target.closest("#cb")) return;
 var o=e.target.closest("[data-open]"); if(o){ var r=DB.records.find(function(x){ return x.id===o.getAttribute("data-open"); }); if(r){ loadRecordIntoForm(r); go("tools"); } return; }
 var d=e.target.closest("[data-del]"); if(d){ var id=d.getAttribute("data-del"); if(pendingDelete===id){ DB.records=DB.records.filter(function(x){ return x.id!==id; }); pendingDelete=null; persist(); if(document.getElementById("rid").value===id) clearForm(); renderAll(); } else { pendingDelete=id; renderDocs(); } return; }
 if(e.target.closest("[data-pdca]")||e.target.closest("#pdOpen")){ openTool("pdca.html","docs"); return; }
 if(e.target.closest("[data-capa]")||e.target.closest("#caOpen")){ openTool("capa.html","docs"); return; }
 var oc=e.target.closest("[data-orca]"); if(oc){ openRca({open:oc.getAttribute("data-orca")}); return; }
 var oa=e.target.closest("[data-oa3]"); if(oa){ openA3({open:oa.getAttribute("data-oa3")}); return; }
 if(e.target.closest("#rcOpen")){ var rv=txt(document.getElementById("f-rca").value); openRca(rv?{open:rv}:{}); return; }
 if(e.target.closest("#a3Open")){ var av=txt(document.getElementById("f-a3").value); openA3(av?{open:av}:{}); return; }
 if(e.target.closest("#paOpen")){ var pv=txt(document.getElementById("f-pareto").value); openPareto(pv?{open:pv}:{}); return; }
 if(e.target.closest("#pkUse")){ pickCauses(); return; }
 var sb=e.target.closest("[data-start]"); if(sb){ startIn(sb.getAttribute("data-start")); return; }
 var ad=e.target.closest("[data-add]"); if(ad){ var tb=ad.getAttribute("data-add"), all=formRaw(), raw=all[tb];
  if(tb==="cz"||tb==="so"){ if(raw.length<MAXROWS){ raw.push(tb==="cz"?blankCz(newCardId(tb,raw)):blankSo(newCardId(tb,raw))); renderCards(tb,raw.map(tb==="cz"?fixCz:fixSo)); var bx=document.getElementById(tb+"Cards"), lt=bx&&bx.querySelector(".dm-card:last-child textarea"); if(lt) lt.focus(); } refreshForm(); return; }
  if(raw.length<(TB[tb].max||MAXROWS)){ raw.push(TB[tb].blank()); renderTbl(tb,raw); var box=document.getElementById(tb+"Rows"), lt2=box&&box.querySelector("tr:last-child textarea, tr:last-child input"); if(lt2) lt2.focus(); } refreshForm(); return; }
 var rd=e.target.closest("[data-rdel]"); if(rd){ var a=rd.getAttribute("data-rdel").split(":"), l2=formRaw()[a[0]]; l2.splice(Number(a[1]),1); if(a[0]==="cz"||a[0]==="so") renderCards(a[0],l2.map(a[0]==="cz"?fixCz:fixSo)); else renderTbl(a[0],l2); refreshForm(); return; }
});
/* a new source of a cause clears the id recorded for the old one, and the card is redrawn with the right list of ids */
document.addEventListener("change",function(e){
 var el=e.target; if(!el||!el.closest) return;
 if(el.closest("#czCards")&&el.getAttribute("data-k")==="how"){ var raw=formRaw().cz, i=Number(el.closest(".dm-card").getAttribute("data-row")); if(raw[i]){ raw[i].ref=""; raw[i].how=el.value; if(raw[i].chk.kind==="link"&&el.value==="here") raw[i].chk.kind=""; } renderCards("cz",raw.map(fixCz)); refreshForm(); var s=document.querySelector('#czCards .dm-card[data-row="'+i+'"] [data-k="how"]'); if(s) s.focus(); }
 if(el.matches&&el.matches('#soCards [data-k="cause"]')) el.setAttribute("data-cur",el.value);
 if(el.id==="f-pareto"){ var pc=document.getElementById("f-pcat"); if(pc){ pc.setAttribute("data-cur",""); pc.value=""; } }
 if(el.id==="pkHow"){ document.getElementById("pkRef").value=""; fillLists(); }
},true);

/* ---------- automatic audit of projects ---------- */
var CHECKS=["ref","prob","scope","goal","msa","base","cause","sol","cplan","after","hand","gates"];
function auditRecord(r){
 var res={}, S=sols(r);
 res.ref=!!txt(r.ref)&&leadOk(r);
 res.prob=probOk(r);
 res.scope=scopeOk(r);
 res.goal=goalOk(r);
 res.msa=atLeast(r,"M")?msaOk(r):null;
 res.base=atLeast(r,"M")?baseOk(r):null;
 res.cause=atLeast(r,"A")?anOk(r):null;
 res.sol=S.length?(!untied(r).length&&!unpiloted(r).length):(atLeast(r,"I")?false:null);
 res.cplan=atLeast(r,"C")?cplanOk(r):null;
 res.after=atLeast(r,"C")&&((isD(r.ctl.to)&&r.ctl.to<=today())||afterStats(r).n>0||!!r.ctl.res)?afterOk(r):null;   /* applies once the period has ended or data is entered */
 res.hand=(stageOf(r)==="closed"||(atLeast(r,"C")&&afterOk(r)))?handOk(r):null;
 res.gates=doneContent(r).length?gatesAll(r):null;
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
 var R=DB.records, c={n:R.length,met:0,gates:0,msa:0,prov:0,closed:0,person:0,res:{met:0,part:0,not:0,none:0},src:{}};
 SRCS.forEach(function(s){ c.src[s]=0; });
 R.forEach(function(r){ var x=resOf(r);
  if(x==="met"||x==="part") c.met++; if(gatesAll(r)) c.gates++; if(msaOk(r)) c.msa++; if(proved(r).length) c.prov++; if(stageOf(r)==="closed") c.closed++;
  c.person+=personCauses(r).length; c.res[x||"none"]++; c.src[r.src]++; });
 return c;
}
function pct(a,n){ return n?Math.round(a/n*100)+"%":"—"; }
function renderDash(){
 var box=document.getElementById("dKpis"); if(!box) return;
 var c=counts(), au=auditSummary(), as=assessScore(), n=c.n, oi=openItems();
 box.innerHTML=TBX.kpi(n,t("kTotal"))+TBX.kpi(pct(c.met,n),t("kMet"))+TBX.kpi(pct(c.gates,n),t("kGates"))+TBX.kpi(pct(c.msa,n),t("kMsa"))+TBX.kpi(pct(c.prov,n),t("kProved"))+TBX.kpi(c.closed,t("kClosed"))+TBX.kpi(c.person,t("kPerson"))+TBX.kpi(oi.length,t("kOpen"))+TBX.kpi(au.rate===null?"—":au.rate+"%",t("kAud"))+TBX.kpi(as+"%",t("kAs"));
 var nd='<p class="pd-sub" style="color:var(--ink-soft)">'+esc(t("noData"))+'</p>';
 document.getElementById("dStage").innerHTML=n?TBX.dist(STAGES,n,function(s){ return DB.records.filter(function(r){ return stageOf(r)===s; }).length; },stageName,function(s){ return SCOL[s]; }):nd;
 document.getElementById("dRes").innerHTML=n?TBX.dist(["met","part","not","none"],n,function(k){ return c.res[k]; },function(k){ return k==="none"?t("resPend"):t("res_"+k); },function(k){ return RCOL[k]; }):nd;
 document.getElementById("dSrc").innerHTML=n?TBX.dist(SRCS,n,function(k){ return c.src[k]; },function(k){ return t("src_"+k); },function(){ return "#1B2A4A"; }):nd;
 document.getElementById("dAssess").innerHTML=AGROUPS.map(function(g){ var p=assessScore(g); return TBX.bar(t("g_"+g),p+"%",p,GCOL[g]); }).join("")+'<p class="pd-sub" style="font-size:12.5px;color:var(--muted);margin:10px 0 0">'+esc(t("bandNote"))+'</p>';
 document.getElementById("dOpen").innerHTML=oi.length?oi.map(function(x){ return '<li><b>'+esc(x.r.ref||x.r.id)+'</b>'+chip([x.r.id,"info"])+'<span>'+esc(x.s)+'</span></li>'; }).join(""):'<li>'+esc(n?t("noOpen"):t("noData"))+'</li>';
}

/* ---------- report and CSV ---------- */
function ptsCsv(list,kind){ return list.map(function(p){ return p.l+": "+(kind==="rate"?vstr(p.d)+"/"+vstr(p.n):vstr(p.v)); }).join(" | "); }
function r2(v){ return v===null||v===undefined?"":String(Math.round(v*100)/100); }
function buildCSV(){
 var head=["id","ref","title","source","lead","sponsor","processOwner","area","start","a3","rca","pareto","paretoCategory","capa","pdca","stage","team","problem","cost","customer","ctq","scopeIn","scopeOut","suppliers","inputs","processSteps","outputs","customers",
  "goalMeasure","goalFrom","goalTo","goalBy","goalWritten","goalFirstTarget","goalChangeReason","whatIsCounted","unit","dataSource","sample","checkMethod","checkResult","checkRule","checkVerdict","checkDate",
  "dataType","goalFigure","baselinePeriod","baselineFixed","lsl","usl","baselinePareto","baselinePoints","baselineMean","baselineMedian","baselineRate","analysisStarted","causes","solutions","controlPlan",
  "afterMeasure","sameMeasure","afterFrom","afterTo","afterPoints","afterMean","afterMedian","afterRate","result","computedResult","standardised","leftOpen","nextStep","handedOverTo","handOverDate","gates"];
 return TBX.csv(head,DB.records.map(function(r){
  var CD=codes(r), b=baseStats(r), a=afterStats(r), m=r.meas, ms=m.msa;
  var cz=r.an.causes.map(function(c){ return CD[c.id]+" ["+c.st+"] "+c.t+" ("+c.how+(c.ref?" "+c.ref:"")+")"+(c.chk.kind?" check "+c.chk.kind+": "+chkText(c):"")+(c.ev?" — "+c.ev:""); }).join(" | ");
  var so=r.imp.sols.map(function(s){ return CD[s.id]+" → "+(CD[s.cause]||"—")+": "+s.t+" — pilot "+s.where+" "+s.from+"→"+s.to+" = "+vstr(s.val)+(s.n?" ("+s.n+")":"")+" [risk: "+s.risk+" / control: "+s.ctrl+"] "+(s.dec||"—"); }).join(" | ");
  var cp=r.ctl.plan.map(function(x){ return x.m+" — "+x.target+" — "+x.freq+" — "+x.who+" — "+x.react; }).join(" | ");
  var gt=PH.map(function(p){ var g=r.gates[p]; return p+": "+(g.dec||"—")+" "+g.date+" "+g.by+(g.q?" — "+g.q:""); }).join(" | ");
  return [r.id,r.ref,r.title,r.src,r.lead,r.sponsor,r.owner,r.area,r.start,r.a3,r.rca,r.pareto,r.pcat,r.capa,r.pdca,stageOf(r),r.team.map(function(x){ return x.n+(x.role?" ("+x.role+")":""); }).join(" | "),r.def.problem,r.def.cost,r.def.customer,
   r.def.ctq.map(function(x){ return x.t+(x.spec?" ["+x.spec+"]":""); }).join(" | "),r.def.scin,r.def.scout,r.def.sip.s,r.def.sip.i,r.def.sip.steps.map(function(x){ return x.t; }).join(" → "),r.def.sip.o,r.def.sip.c,
   r.goal.measure,vstr(r.goal.from),vstr(r.goal.to),r.goal.by,r.goal.date,vstr(r.goal.orig),r.goal.why,m.what,m.unit,m.source,m.sample,ms.method,ms.res,ms.rule,ms.verdict,ms.date,
   m.kind,m.stat,m.period,m.date,vstr(m.lsl),vstr(m.usl),m.pareto,ptsCsv(m.pts,m.kind),r2(b.mean),r2(b.median),r2(b.rate),r.an.date,cz,so,cp,
   r.ctl.measure,r.ctl.same?"yes":"no",r.ctl.from,r.ctl.to,ptsCsv(r.ctl.pts,m.kind),r2(a.mean),r2(a.median),r2(a.rate),r.ctl.res,suggest(r),r.ctl.std,r.ctl.open,r.ctl.next,r.ctl.handTo,r.ctl.hdate,gt]; }));
}
function recReport(r){
 var CD=codes(r), A=auditRecord(r), b=baseStats(r), a=afterStats(r), m=r.meas;
 var row=function(k,v){ return '<tr><th>'+esc(k)+'</th><td>'+esc(v===null||v===undefined||v===""?"—":v)+'</td></tr>'; };
 var mark=function(v){ return v===null?'<td class="na">—</td>':(v?'<td class="ok">✓</td>':'<td class="bad">✗</td>'); };
 var tbl=function(list,heads,cells){ return list.length?'<table><thead><tr>'+heads.map(function(h){ return '<th>'+esc(t(h))+'</th>'; }).join("")+'</tr></thead><tbody>'+list.map(function(x){ return '<tr>'+cells(x).map(function(c){ return '<td>'+esc(c===""||c===null?"—":c)+'</td>'; }).join("")+'</tr>'; }).join("")+'</tbody></table>':'<p class="meta">—</p>'; };
 var stl=function(o){ return t("sMean")+" "+fmtN(o.mean===null?null:Math.round(o.mean*100)/100)+" · "+t("sMed")+" "+fmtN(o.median===null?null:Math.round(o.median*100)/100)+(o.rate!==null?" · "+(m.kind==="rate"?t("sRate"):t("sOut"))+" "+fmt1(o.rate)+"%":"")+(m.kind==="rate"&&o.units?" ("+t("sOf",{d:fmtN(o.defects),n:fmtN(o.units)})+")":"")+" · "+t("sN")+" "+o.n; };
 var ph=function(p){ return '<h4><span class="ph" style="background:'+SCOL[p]+'">'+p+'</span> '+esc(t("ph_"+p))+'</h4>'; };
 return '<section class="an"><h3><span dir="ltr">'+esc(r.id)+'</span> · <span dir="ltr">'+esc(r.ref||"—")+'</span> — '+esc(r.title)+'</h3>'+
  '<p class="meta">'+esc(t("colStage"))+': <b>'+esc(stageName(stageOf(r)))+'</b> · '+esc(t("src_"+r.src))+(r.a3?' · A3 <span dir="ltr">'+esc(r.a3)+'</span>':'')+(r.rca?' · RCA <span dir="ltr">'+esc(r.rca)+'</span>':'')+(r.pareto?' · Pareto <span dir="ltr">'+esc(r.pareto+(r.pcat?" / "+r.pcat:""))+'</span>':'')+(r.capa?' · CAPA <span dir="ltr">'+esc(r.capa)+'</span>':'')+(r.pdca?' · PDCA <span dir="ltr">'+esc(r.pdca)+'</span>':'')+'</p>'+
  mapHTML(r)+
  '<table><tbody>'+row(t("f_lead"),r.lead)+row(t("f_sponsor"),r.sponsor)+row(t("f_owner"),r.owner)+row(t("f_start"),r.start)+row(t("f_area"),r.area)+row(t("sHdrT"),r.team.map(function(x){ return x.n+(x.role?" ("+x.role+")":""); }).join("، "))+'</tbody></table>'+
  ph("D")+'<table><tbody>'+row(t("f_problem"),r.def.problem)+row(t("f_cost"),r.def.cost)+row(t("f_customer"),r.def.customer)+row(t("f_scin"),r.def.scin)+row(t("f_scout"),r.def.scout)+'</tbody></table>'+
  tbl(r.def.ctq,["ctqT","ctqSpec"],function(x){ return [x.t,x.spec]; })+sipocHTML(r)+
  '<table><tbody>'+row(t("f_gmeasure"),r.goal.measure)+row(t("colGoal"),goalLine(r))+row(t("f_gdate"),r.goal.date)+row(t("f_andate"),r.an.date)+(changed(r)?row(t("f_gorig"),fmtN(r.goal.orig))+row(t("f_gwhy"),r.goal.why):"")+'</tbody></table>'+
  ph("M")+'<table><tbody>'+row(t("f_what"),m.what)+row(t("f_unit"),m.unit)+row(t("f_source"),m.source)+row(t("f_sample"),m.sample)+row(t("f_mmethod"),m.msa.method?t("mm_"+m.msa.method):"")+row(t("f_mres"),m.msa.res)+row(t("f_mrule"),m.msa.rule)+row(t("f_mverd"),m.msa.verdict?t("vd_"+m.msa.verdict):"")+row(t("f_mdate"),m.msa.date)+row(t("f_bperiod"),m.period)+row(t("f_bdate"),m.date)+row(t("chBaseT"),b.n?stl(b):(m.pareto?t("chFrom",{id:m.pareto}):""))+'</tbody></table>'+
  '<div class="chart">'+baseSVG(r,L,560)+'</div>'+
  ph("A")+tbl(r.an.causes,["czCode","czT","czHow","czSt","ckT","czEv"],function(c){ return [CD[c.id],c.t+(personOnly(c.t)&&c.st!=="out"?" ⚠":""),t("how_"+c.how)+(c.ref?" "+c.ref:""),t("cs_"+c.st),c.chk.kind?t("ck_"+c.chk.kind)+" — "+chkText(c):"",c.ev]; })+
  ph("I")+tbl(r.imp.sols,["soCode","soCause","soT","soWhere","soVal","soRisk","soDec"],function(s){ return [CD[s.id],CD[s.cause]||"",s.t,s.where+(isD(s.from)?" · "+s.from+" → "+s.to:""),s.val===null?"":fmtN(s.val)+(s.n?" ("+s.n+")":"")+(piloted(s)&&cmpGoal(r,s.val)?" — "+t("res_"+cmpGoal(r,s.val)):""),s.risk+(s.ctrl?" / "+s.ctrl:""),s.dec?t("dc_"+s.dec):""]; })+
  ph("C")+tbl(r.ctl.plan,["cpM","cpTarget","cpFreq","cpWho","cpReact"],function(x){ return [x.m,x.target,x.freq,x.who,x.react]; })+
  '<table><tbody>'+row(t("f_ameasure"),r.ctl.measure)+row(t("f_asame"),r.ctl.same?t("yes"):t("no"))+row(t("f_afrom"),(r.ctl.from||"—")+" → "+(r.ctl.to||"—"))+row(t("chAfterT"),a.n?stl(a):"")+row(t("f_ares"),r.ctl.res?t("res_"+r.ctl.res):"")+row(t("aSugg",{r:""}).replace(/[:：]\s*$/,""),suggest(r)?t("res_"+suggest(r)):"")+row(t("f_astd"),r.ctl.std)+row(t("f_aopen"),r.ctl.open)+row(t("f_anext"),r.ctl.next)+row(t("f_handto"),r.ctl.handTo)+row(t("f_hdate"),r.ctl.hdate)+'</tbody></table>'+
  (a.n?'<div class="chart">'+afterSVG(r,L,560)+'</div>':'')+
  '<h4>'+esc(t("rpGates"))+'</h4>'+tbl(PH.filter(function(p){ return r.gates[p].dec||r.gates[p].date; }),["gtT","gDate","gBy","gQ","gDec"],function(p){ var g=r.gates[p]; return [p+" · "+t("ph_"+p),g.date,g.by,g.q,g.dec?t("gd_"+g.dec):""]; })+
  '<h4>'+esc(t("rpAu"))+'</h4><table><thead><tr>'+CHECKS.map(function(k){ return '<th>'+esc(t("c_"+k))+'</th>'; }).join("")+'</tr></thead><tbody><tr>'+CHECKS.map(function(k){ return mark(A[k]); }).join("")+'</tr></tbody></table></section>';
}
var MAP_CSS=".dm-map{list-style:none;margin:8px 0 12px;padding:0;display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:6px}.dm-map li{display:flex;gap:8px;align-items:center;border:1px solid #DCE4EE;border-radius:10px;padding:7px 9px;background:#fff;position:relative;min-width:0}.dm-map li i{font-style:normal;flex:none;display:inline-grid;place-items:center;width:28px;height:28px;border-radius:50%;background:#EEF1F6;color:#4B5874;font-family:Georgia,serif;font-weight:700}.dm-map li span{display:flex;flex-direction:column;min-width:0}.dm-map li b{font-size:13px}.dm-map li small{font-size:11px;color:#4B5874}.dm-map li em{font-style:normal;margin-inline-start:auto;color:#C9D2DF;font-size:13px}.dm-map li em.ok{color:#3C9A5F}.dm-map li em.no{color:#B42318}.dm-map li.done i,.dm-map li.cur i,.dm-map li.wait i,.dm-map li.rework i{background:var(--pc);color:#fff}.dm-map li.done{border-color:var(--pc)}.dm-map li.cur,.dm-map li.wait,.dm-map li.rework{border:2px solid var(--pc);box-shadow:0 0 0 3px #F5EBD6}.dm-map li.stop{border-color:#B42318;background:#FDECE3}.dm-map li.todo{opacity:.72}@media (max-width:640px){.dm-map{grid-template-columns:1fr}}";
function buildReportHTML(){
 var c=counts(), au=auditSummary(), as=assessScore(), d=today(), n=c.n, A=TBX.audit(DB.records,auditRecord,CHECKS), oi=openItems();
 var mark=function(v){ return v===null?'<td class="na">—</td>':(v?'<td class="ok">✓</td>':'<td class="bad">✗</td>'); };
 var grpRows=AGROUPS.map(function(g){ return '<tr><td>'+esc(t("g_"+g))+' — '+g+'</td><td>'+assessScore(g)+'%</td></tr>'; }).join("");
 var auRows=A.rows.map(function(x){ return '<tr><td dir="ltr">'+esc(x.r.id)+'</td>'+CHECKS.map(function(k){ return mark(x.res[k]); }).join("")+'</tr>'; }).join("");
 var body='<div class="cover"><p class="kick">Continual Improvement Academy · CIA Toolbox</p><h1>DMAIC Improvement Projects / مشاريع التحسين بمنهج DMAIC</h1><p class="sub">'+esc(t("rpCover"))+'</p>'+
  '<p class="meta">'+esc(t("prep"))+': <bdi><strong>مدثر سلامه</strong></bdi> · <bdi dir="ltr">'+esc(d)+'</bdi> · <bdi>'+esc(t("kTotal"))+': '+n+'</bdi></p></div>'+
  '<h2>Summary / الملخص</h2><div class="k">'+
   '<div><b>'+n+'</b>'+esc(t("kTotal"))+'</div><div><b>'+pct(c.met,n)+'</b>'+esc(t("kMet"))+'</div><div><b>'+pct(c.gates,n)+'</b>'+esc(t("kGates"))+'</div><div><b>'+pct(c.msa,n)+'</b>'+esc(t("kMsa"))+'</div><div><b>'+pct(c.prov,n)+'</b>'+esc(t("kProved"))+'</div><div><b>'+c.closed+'</b>'+esc(t("kClosed"))+'</div><div><b>'+c.person+'</b>'+esc(t("kPerson"))+'</div><div><b>'+oi.length+'</b>'+esc(t("kOpen"))+'</div><div><b>'+(au.rate===null?"—":au.rate+"%")+'</b>'+esc(t("kAud"))+'</div><div><b>'+as+'%</b>'+esc(t("kAs"))+'</div></div>'+
  '<h2>'+esc(t("rpProjects"))+' / The projects</h2>'+(n?DB.records.map(recReport).join(""):'<p class="meta">'+esc(t("rpEmpty"))+'</p>')+
  '<h2>Audit results / نتائج التدقيق</h2>'+(n?'<p>'+esc(t("auPass"))+': '+(au.rate===null?"—":au.rate+"% ("+au.pass+"/"+au.applic+")")+'</p><table><thead><tr><th>ID</th>'+CHECKS.map(function(k){ return '<th>'+esc(t("c_"+k))+'</th>'; }).join("")+'</tr></thead><tbody>'+auRows+'</tbody></table>':'<p class="meta">—</p>')+
  '<h2>Open items / بنود تحتاج متابعة</h2>'+(oi.length?'<ul>'+oi.map(function(x){ return '<li><span dir="ltr">'+esc(x.r.id)+' · '+esc(x.r.ref||"—")+'</span> — '+esc(x.s)+'</li>'; }).join("")+'</ul>':'<p class="meta">'+esc(n?t("noOpen"):"—")+'</p>')+
  '<h2>Self-assessment / التقييم الذاتي</h2><table><thead><tr><th>Phase / المرحلة</th><th>Score / النتيجة</th></tr></thead><tbody>'+grpRows+'<tr><td><b>'+esc(t("kAs"))+'</b></td><td><b>'+as+'%</b></td></tr></tbody></table><p class="meta">'+esc(t("bandNote"))+'</p>'+
  '<footer>Prepared by / أعدّه: مدثر سلامه · DMAIC is an improvement method, not a clause of any standard: it fits a problem whose cause is unknown and whose process can be measured; the goal is set in Define and not moved; the measurement is checked before the baseline; causes are proved with data; solutions are piloted; each phase ends with a gate review by the sponsor. Sources / المراجع: ISO 9001:2026 introduction 0.3.2, clauses 6.2, 7.1.5, 7.1.6, 8.5.1, 8.5.6, 9.1.1, 9.1.3, 10.1 and 10.2 and Annexes A.7.1.5 and A.10.2; ISO 9000:2026 3.3.1, 3.7.11, 3.10.2, 3.11.4, 4.2.6 and 4.2.7 (interpretive summaries, not the official text); Six Sigma references and ISO 13053 not verified (not uploaded) · Examples are illustrative.</footer>';
 return TBX.reportDoc(L,'DMAIC Report — مدثر سلامه',body,MAP_CSS+'.ok{color:#2F7D4B;font-weight:700;text-align:center}.bad{color:#B42318;font-weight:700}td.bad{text-align:center}.na{color:#7A869E;text-align:center}.warn{color:#86520F;font-weight:700}ul{padding-inline-start:20px}h3{font-family:Georgia,serif;margin:22px 0 4px;font-size:17px}h4{margin:14px 0 4px;font-size:14.5px}h4 .ph{display:inline-grid;place-items:center;width:22px;height:22px;border-radius:50%;color:#fff;font-family:Georgia,serif;font-size:12px}.an{border-top:1px solid #DCE4EE;padding-top:6px;break-inside:auto}.an th{background:#F3F7FB;color:#1B2A4A}.an tbody th{width:30%}.chart{margin:8px 0}.chart svg{max-width:100%;height:auto}.dm-sip td{vertical-align:top}.dm-sip ol{margin:0;padding-inline-start:18px}.dm-sip .dm-sipl td{font-size:11.5px;color:#4B5874;background:#F7F9FC}.mt{color:#7A869E}.cover{border-bottom:4px solid #B8901E;padding:18px 0 14px;margin-bottom:8px}.cover h1{border:0;margin:6px 0}.cover .kick{color:#B8901E;font-weight:700;letter-spacing:.04em;margin:0}.cover .sub{font-size:18px;margin:4px 0}@media print{.an{page-break-before:always}}');
}
function stamp(){ return today(); }
function renderReport(){
 var prev=document.getElementById("rpPrev"); if(!prev) return;
 if(!DB.records.length){ prev.innerHTML='<p class="pd-sub" style="color:var(--ink-soft)">'+esc(t("rpEmpty"))+'</p>'; return; }
 var c=counts(), au=auditSummary();
 prev.innerHTML='<div class="pd-kpis">'+TBX.kpi(c.n,t("kTotal"))+TBX.kpi(pct(c.met,c.n),t("kMet"))+TBX.kpi(openItems().length,t("kOpen"))+TBX.kpi(au.rate===null?"—":au.rate+"%",t("kAud"))+'</div>';
}
document.getElementById("rpHtml").addEventListener("click",function(){
 var err=document.getElementById("rpErr"); err.textContent="";
 if(!DB.records.length && !Object.keys(DB.assess).length){ err.textContent=t("rpEmpty"); return; }
 TBX.download("DMAIC-report-"+stamp()+".html","text/html;charset=utf-8",buildReportHTML());
});
document.getElementById("rpCsv").addEventListener("click",function(){ var err=document.getElementById("rpErr"); err.textContent=""; if(!DB.records.length){ err.textContent=t("rpEmpty"); return; } TBX.download("DMAIC-projects-"+stamp()+".csv","text/csv;charset=utf-8",buildCSV()); });
document.getElementById("dCsv").addEventListener("click",function(){ if(!DB.records.length) return; TBX.download("DMAIC-projects-"+stamp()+".csv","text/csv;charset=utf-8",buildCSV()); });

/* ---------- platform identity: academy logo and related tools ---------- */
var LOGO="__LOGO__";
function applyLogo(){ document.querySelectorAll("img[data-logo]").forEach(function(i){ if(i.src!==LOGO) i.src=LOGO; i.alt=t("logoAlt"); }); }
var RELATED=[["a3","A3","./a3.html","#B8901E"],["rca","RCA","./rca.html","#1B2A4A"],["pareto","Pareto","./pareto.html","#C9821A"],["fish","Fishbone","./fishbone.html","#1E8C93"],["why5","5 Whys","./five-whys.html","#3563C9"],["capa","CAPA","./capa.html","#C2410C"],["pdca","PDCA","./pdca.html","#3C9A5F"]];
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

/* ---------- assistant: answers from the tool's own guide and your projects (rule-based, no AI service) ---------- */
var CONTACT_EMAIL="moddathersalama.eng@gmail.com";
var CB={
 ar:{fab:"اسأل عن DMAIC",title:"مساعد DMAIC",sub:"إجابات فورية من دليل الأداة ومشاريعك",new:"محادثة جديدة",close:"إغلاق",ph:"اكتب سؤالك…",send:"إرسال",inL:"سؤالك",
  hello:"مرحباً. أجيب عن أسئلة مشاريع التحسين بمنهج DMAIC من دليل الأداة ومن مشاريعك المحفوظة في هذا المتصفح. اختر سؤالاً أو اكتب سؤالك.",
  miss:"لم أجد إجابة جاهزة لهذا السؤال. جرّب أحد الأسئلة المقترحة، أو اسأل عن: هل DMAIC لخبراء Six Sigma فقط، أو الفرق بين DMAIC وA3 وPDCA، أو متى لا يناسب DMAIC، أو التحقق من القياس، أو البوابات، أو الإحصاء. وللاستشارة راسل المُعِد على البريد أدناه.",
  instant:"إجابة فورية",foot:"المساعد يعمل في متصفحك ولا يرسل بياناتك. للتواصل:",
  op0:"لا توجد بنود مفتوحة في مشاريعك الآن.",st0:"لا توجد مشاريع بعد. ابدأ من [[tab:tools]] أو حمّل المثال من [[tab:docs]]."},
 en:{fab:"Ask about DMAIC",title:"DMAIC assistant",sub:"Instant answers from the tool's guide and your projects",new:"New chat",close:"Close",ph:"Type your question…",send:"Send",inL:"Your question",
  hello:"Hello. I answer questions on DMAIC improvement projects from the tool's guide and from your projects saved in this browser. Pick a question or type your own.",
  miss:"I have no ready answer for that. Try one of the suggested questions, or ask whether DMAIC is only for Six Sigma experts, DMAIC against A3 and PDCA, when DMAIC is the wrong choice, checking the measurement, the gates, or statistics. For advice, email the author at the address below.",
  instant:"Instant answer",foot:"The assistant runs in your browser and sends no data. Contact:",
  op0:"No open items in your projects right now.",st0:"No projects yet. Start from the [[tab:tools]] or load the example in [[tab:docs]]."}
};
var KB=[
 {id:"six",k:["six sigma","سيكس سيجما","حزام","belt","خبير","خبراء","expert","experts","معقد","complicated","only for"],q:{ar:"هل DMAIC لخبراء Six Sigma فقط؟",en:"Is DMAIC only for Six Sigma experts?"},
  a:{ar:"لا. **DMAIC طريقة تفكير منظمة قبل أن يكون أدوات إحصائية**: عرّف المشكلة وهدفها، ثق بالقياس، أثبت السبب بالبيانات، جرّب الحل، ثم اضبطه وسلّمه. وفي أغلب المشاريع تكفي أدوات بسيطة: رسم تشغيلي، ومتوسط ووسيط، ونسبة عيوب، ومقارنة مجموعتين، وباريتو مقسّم. الأحزمة والشهادات تنظيم للتدريب وليست شرطاً للمنهج. ما لا غنى عنه: مشكلة سببها غير معروف، وبيانات يمكن جمعها، وراعٍ يراجع البوابات. التفاصيل في [[tab:explain-std]].",
   en:"No. **DMAIC is a structured way of thinking before it is a set of statistical tools**: define the problem and its goal, trust the measurement, prove the cause with data, pilot the solution, then control it and hand it over. Most projects need only simple tools: a run chart, a mean and a median, a defect rate, a two-group comparison and a stratified Pareto. Belts and certificates organise training; they are not a condition of the method. What cannot be skipped: a problem whose cause is unknown, data that can be collected, and a sponsor who reviews the gates. Details in the [[tab:explain-std]]."}},
 {id:"which",k:["a3","pdca","أيها","ايها","أيهما","ايهما","الفرق","difference","which","versus","vs","بدل"],q:{ar:"DMAIC أم A3 أم PDCA: أيها أستخدم؟",en:"DMAIC, A3 or PDCA — which one?"},
  a:{ar:"هي ليست بدائل. **PDCA هي الدورة** العامة للتحسين. و**A3 قصة دورة واحدة على صفحة واحدة** يملكها شخص ويوجّهه موجّه، وتناسب أغلب المشكلات اليومية. و**DMAIC مشروع أكبر قائم على البيانات** لمشكلة سببها غير معروف وعمليتها قابلة للقياس، بمراحل وبوابات وراعٍ وتحقق من القياس. فإذا لم تُغلق صفحة A3 الفجوة (كما في مثال الخرسانة: 6% مقابل هدف أقل من 3%)، يبدأ DMAIC من حيث انتهت، ثم تتابع دورة PDCA الضبط. وCAPA يحمل الإجراءات التصحيحية عندما توجد حالة عدم مطابقة.",
   en:"They are not alternatives. **PDCA is the general cycle** of improvement. **An A3 is the story of one cycle on one page**, owned by one person and coached, and it suits most everyday problems. **DMAIC is a larger data-driven project** for a problem whose cause is unknown and whose process can be measured, with phases, gates, a sponsor and a measurement check. When an A3 does not close the gap (as in the concrete example: 6% against a goal below 3%), DMAIC starts where it stopped, and a PDCA cycle then follows the control. CAPA carries the corrective actions when a nonconformity is involved."}},
 {id:"when",k:["متى لا","غير مناسب","الحل معروف","known solution","wrong choice","not fit","when not","مشروع تنفيذ","just do it"],q:{ar:"متى لا يكون DMAIC هو الاختيار الصحيح؟",en:"When is DMAIC the wrong choice?"},
  a:{ar:"عندما يكون **الحل معروفاً**: هذا مشروع تنفيذ، نفّذه وتابعه بخطة. وعندما **لا يمكن جمع بيانات** عن المشكلة، أو كانت المشكلة صغيرة ويحلها لماذا الخمس أو صفحة A3 في أيام. وعندما يكون الحدث جسيماً لمرة واحدة ويحتاج تحقيقاً كاملاً، فابدأ بتحقيق RCA. لذلك تسأل بوابة التعريف أولاً: هل نعرف الحل مسبقاً؟ وإن كان الجواب نعم، فالقرار الصحيح «إيقاف المشروع» عند البوابة.",
   en:"When **the solution is known**: that is an implementation project; do it and follow it with a plan. When **no data can be collected** on the problem, or the problem is small and a 5 Whys or an A3 solves it in days. When the event is severe and one-off and needs a full investigation, start with an RCA. That is why the Define gate asks first: do we already know the solution? If the answer is yes, the right decision is to stop the project at the gate."}},
 {id:"msa",k:["قياس","القياس","موثوق","التحقق من القياس","msa","measurement","trust","gauge","r&r","agreement","معايرة"],q:{ar:"لماذا نتحقق من القياس قبل الأساس؟",en:"Why check the measurement before the baseline?"},
  a:{ar:"لأن **مقياساً لا يُوثق به يجعل كل مرحلة بعده غير موثوقة**: الأساس والأسباب والنتيجة. في مثال الخرسانة قورنت موازين الحرارة بمجس معاير، فوُجد ميزان يقرأ أقل بدرجتين واستُبدل قبل تثبيت الأساس. وفي البيانات المصنفة (عيب أو لا) يكفي غالباً فحص اتفاق المقيّمين: شخصان يصنفان العينة نفسها، والقاعدة مكتوبة مسبقاً (مثلاً 90% اتفاق). ويطلب البند 7.1.5 من ISO 9001:2026 موارد قياس تعطي نتائج صحيحة وموثوقة.",
   en:"Because **a measure that cannot be trusted makes every later phase unreliable**: the baseline, the causes and the result. In the concrete example the thermometers were compared with a calibrated probe; one read 2 °C low and was replaced before the baseline was fixed. For classification data (defect or not), an attribute agreement check is usually enough: two people classify the same sample against a rule written beforehand (for example 90% agreement). ISO 9001:2026 clause 7.1.5 asks for measuring resources that give valid and reliable results."}},
 {id:"gate",k:["بوابة","البوابة","البوابات","gate","tollgate","sponsor","راعي","الراعي"],q:{ar:"ماذا يحدث في بوابة المرحلة؟",en:"What happens at a gate review?"},
  a:{ar:"في نهاية كل مرحلة **يراجعها الراعي بالأسئلة لا بالتوقيع**: هل السبب فعلاً غير معروف؟ هل نثق بالقياس؟ ما الفرق بين المجموعتين، وهل يكفي حجم العينة؟ هل بلغت التجربة الهدف؟ من يملك خطة الضبط الآن؟ ويكون القرار اجتيازاً أو إعادة عمل أو إيقافاً. وفي الأداة لا تُحسب المرحلة التالية إلا بعد اجتياز البوابة بتاريخ واسم المراجع والأسئلة، وتنبّه إذا سُجلت البوابة باسم قائد المشروع.",
   en:"At the end of each phase **the sponsor reviews it through questions, not a signature**: is the cause really unknown? Can we trust the measurement? What is the difference between the two groups, and is the sample large enough? Did the pilot reach the goal? Who owns the control plan now? The decision is pass, rework or stop. In the tool the next phase counts only after the gate is passed with a date, the reviewer's name and the questions, and it warns when a gate is recorded under the project lead's name."}},
 {id:"stats",k:["إحصاء","احصاء","statistics","statistical","z","p-value","انحراف","sd","cpk","minitab"],q:{ar:"هل أحتاج إحصاءً متقدماً؟",en:"Do I need advanced statistics?"},
  a:{ar:"غالباً لا. **الإحصاء يخدم القرار**، والأدوات البسيطة تكفي في أغلب المشاريع: رسم تشغيلي بالوسيط، ونسبة عيوب، ومقارنة نسبتين أو متوسطين. تحسب الأداة الفرق بين المجموعتين، وتقدّر z بطريقة مبسطة: |z| ≥ 2 يعني أن الفرق يصعب أن يكون مصادفة. وCpk يظهر استرشادياً فقط عند عشر نقاط أو أكثر وحد مواصفة. وتقول ملاحظة البند 9.1.3 إن طرق التحليل قد تشمل تقنيات إحصائية؛ أي أنها وسيلة وليست شرطاً.",
   en:"Usually not. **Statistics serve the decision**, and simple tools are enough in most projects: a run chart with its median, a defect rate, and a comparison of two rates or two means. The tool computes the difference between the two groups and a simple z estimate: |z| ≥ 2 means the difference is unlikely to be chance. Cpk shows, as indicative only, with ten points or more and a specification limit. The note to clause 9.1.3 says analysis methods can include statistical techniques; a means, not a condition."}},
 {id:"open",dyn:"open",k:["مفتوح","مفتوحة","متابعة","open items","follow"],q:{ar:"ما البنود المفتوحة في مشاريعي؟",en:"What is still open in my projects?"}},
 {id:"status",dyn:"status",k:["وضع","حالة","ملخص","status","summary","where do we stand"],q:{ar:"ما وضع مشاريعي الآن؟",en:"Where do my projects stand?"}}
];
var CB_SUG=["six","which","when","msa","status"];
function kbDyn(id){
 var u=CB[L]||CB.ar;
 if(id==="open"){ var O=openItems(); if(!O.length) return u.op0+"\n\n[[tab:dash]]"; return O.map(function(x){ return "- **"+(x.r.ref||x.r.id)+"** — "+x.s; }).join("\n")+"\n\n[[tab:docs]] · [[tab:dash]]"; }
 if(id==="status"){ var c=counts(); if(!c.n) return u.st0; return "- "+t("kTotal")+": **"+c.n+"**\n- "+t("kMet")+": **"+c.met+"**\n- "+t("kGates")+": **"+c.gates+"**\n- "+t("kClosed")+": **"+c.closed+"**\n- "+t("kOpen")+": **"+openItems().length+"**\n- "+t("kAs")+": **"+assessScore()+"%**\n\n[[tab:dash]] · [[tab:audit]]"; }
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
window.addEventListener("storage",function(e){ if([PDCA_KEY,CAPA_KEY,PARETO_KEY,FISH_KEY,WHY5_KEY,RCA_KEY,A3_KEY].indexOf(e.key)>=0){ renderHomeSt(); fillLists(); if(ST) stPreview(true); refreshForm(); } });
var rzT=null, rzW=chartW(); window.addEventListener("resize",function(){ clearTimeout(rzT); rzT=setTimeout(function(){ if(chartW()!==rzW){ rzW=chartW(); refreshForm(); } },150); });

/* ---------- boot ---------- */
/* a link from A3 may ask to open a project (?open=ID); a request may also start one from an A3 (?a3=ID), an RCA investigation (?rca=ID)
   or a Pareto category (?pareto=ID&cat=CAT); inside the hub the same request arrives as a one-time sessionStorage hint */
function navRequest(){
 var q={}; try{ var u=new URLSearchParams(location.search); if(u.get("open")) q.open=u.get("open"); if(u.get("a3")) q.a3=u.get("a3"); if(u.get("rca")) q.rca=u.get("rca"); if(u.get("pareto")){ q.pareto=u.get("pareto"); q.cat=u.get("cat")||""; } }catch(e){}
 try{ var h=JSON.parse(sessionStorage.getItem(NAV_KEY)||"null"); sessionStorage.removeItem(NAV_KEY); if(h&&typeof h==="object"){ if(h.open) q.open=String(h.open); if(h.a3) q.a3=String(h.a3); if(h.rca) q.rca=String(h.rca); if(h.pareto){ q.pareto=String(h.pareto); q.cat=String(h.cat||""); } } }catch(e){}
 return q;
}
applyLang();
(function(){
 var q=navRequest(), r=q.open?DB.records.filter(function(x){ return x.id===q.open; })[0]:null;
 if(r){ loadRecordIntoForm(r); go("tools"); return; }
 if(q.a3 && prefillFromA3(q.a3)) return;
 if(q.rca && prefillFromRca(q.rca)) return;
 if(q.pareto && prefillFromPareto(q.pareto,q.cat)) return;
 go((location.hash||"#home").slice(1));
})();
