/* ===== ISO 10009 quality tools guide — host logic. Storyboards, answers and calculator inputs are stored in this browser only
   (localStorage, wrapped in try/catch). =====
   Storage key "cia-iso10009:v1" (this tool only). Schema:
   { records: [ {                                                    one storyboard per improvement (ISO 10009 Annex B)
       id, ref, title, ctx: "s"|"p"|"c" (Annex A table: strategy and business planning | process improvement | continual improvement),
       aim: "char"|"prob"|"high"|"eff" (clause 1 a)–d)), owner, fac (facilitator trained for the difficult tools), area,
       start (YYYY-MM-DD), data: "small"|"medium"|"large" (data the team has), team (one person and role per line),
       problem (problem or objective statement), is, isnot (is / is not analysis, 14.6),
       steps: [ {id, ph: "P"|"D"|"C"|"A", tool (catalogue id or "other"), other (name when "other"), why (reason for the choice),
                 out (output or result of the step), who, st: "plan"|"doing"|"done", date (YYYY-MM-DD),
                 rid (id of a record in the toolbox tool that holds this tool, read-only link)} ] (24 at most),
       result (outcome against the aim), std (what was standardized or updated: procedure, control plan, FMEA, risks),
       lessons, review (date the storyboard was reviewed after the last step), created, updated } ],
     assess: { SL1..RV3: 0|1|2 },
     nav: {aim, ctx, ph, who, data, cap, eff, plat},                    the navigator's last choices
     calc: {nps: {p, pa, d}, oee: {a, pf, q}, coq: {pr, ap, inf, exf, sales}} }
   Other tools' keys are only read, never written: "cia-pdca:v1", "cia-capa:v1", "cia-why5:v1", "cia-fish:v1", "cia-pareto:v1",
   "cia-rca:v1", "cia-a3:v1", "cia-dmaic:v1" and "cia-fmea:v1" (records a step can name, and the platform usage on the dashboard). 5 Whys,
   Fishbone, Pareto, RCA, A3, DMAIC and FMEA open on a record through their own requests (?open= or their one-time sessionStorage hints
   "cia-nav:five-whys", "cia-nav:fishbone", "cia-nav:pareto", "cia-nav:rca", "cia-nav:a3", "cia-nav:dmaic", "cia-nav:fmea"); other platform tools open
   on a tab (inside the hub through parent.ciaOpenFile(file, tab), outside it in a new tab). This tool reads its own hint
   "cia-nav:iso10009" ({open} | {tool}) and its address (?open=, ?tool=) once; none of them holds tool data. */
var LKEY="cia-lang", STORE="cia-iso10009:v1", NAV_KEY="cia-nav:iso10009";
var QTC=__CATALOG__;
var TL=QTC.T, BYID={}, BYC={}; TL.forEach(function(x){ BYID[x.id]=x; BYC[x.c]=x; });
var L=(function(){ try{ return localStorage.getItem(LKEY)||"ar"; }catch(e){ return "ar"; } })();
var TABS=["home","explain-std","explain-cl","assess","tools","docs","audit","dash","report","ai"];
var TITLES={ar:"ISO 10009 | دليل أدوات الجودة وتطبيقها — مدثر سلامه",en:"ISO 10009 | Quality tools guide — مدثر سلامه"};
var PH=["P","D","C","A"], STAGES=["draft","P","D","C","A","done","reviewed"];
var PCOL={P:"#3563C9",D:"#C9821A",C:"#1E8C93",A:"#3C9A5F"};
var SCOL={draft:"#9AA5B8",P:"#3563C9",D:"#C9821A",C:"#1E8C93",A:"#3C9A5F",done:"#2F7D4B",reviewed:"#B8901E"};
var LVCOL={own:"#2F7D4B",in:"#3563C9",here:"#B8901E",rel:"#7B5BB8",none:"#C9D2DF"};
var LVS=["own","in","here","rel","none"];
var AIMS=["char","prob","high","eff"], CTXS=["s","p","c"], DATAS=["small","medium","large"], STS=["plan","doing","done"], EFFS=["easy","medium","difficult"];
var DR={small:1,medium:2,large:3,any:0,"":0}, ER={easy:1,medium:2,difficult:3,"":0};
var SECCOL={"5":"#1B2A4A","6":"#1B2A4A","7":"#1B2A4A","8":"#1B2A4A","9":"#1E8C93","10":"#1E8C93","11":"#1E8C93","12":"#1E8C93","13":"#C9821A","14":"#C9821A","15":"#C9821A","16":"#C9821A"};
var MAXSTEPS=24;
var DB=load();
var curTab="home", SUB="nav";
var editing=null;   /* the storyboard open in the form (a deep copy until saved) */
var dirty=false;

var UI={
ar:{brand:"أكاديمية التحسين المستمر · مدثر سلامه",toolName:"ISO 10009 — دليل أدوات الجودة وتطبيقها",sgLearn:"التعلّم",sgWork:"العمل",sgOut:"المخرجات",
 nHome:"الرئيسية",nStd:"دليل المواصفة",nCl:"دليل البنود والأدوات",nAssess:"التقييم الذاتي",nTools:"مستكشف الأدوات",nDocs:"السجلات",nAudit:"التدقيق",nDash:"لوحة المؤشرات",nReport:"التقرير",nAi:"المساعد الذكي",soon:"قريباً",
 homeCode:"إدارة الجودة — إرشاد لأدوات الجودة وتطبيقها",homeH1:"دليل أدوات الجودة وتطبيقها",
 homeLede:"شرح كامل لمواصفة ISO 10009:2024 وأدواتها الـ 53، من SWOT وSIPOC وFMEA إلى باريتو وعظمة السمكة وSix Sigma: ما كل أداة، ومتى تُستخدم، وما تحتاجه من فريق وبيانات وكفاءة وجهد، وأين تجدها في المنصة. ومستكشف يقترح الأداة المناسبة لغرضك ومرحلتك، ولوحة قصة تربط خطوات التحسين بسجلات أدوات المنصة.",
 heroTag:"مواصفة إرشادية تساند ISO 9001:2026",
 homeNote:"النسخة الحالية تحفظ لوحات القصة والإجابات في متصفحك فقط. الحفظ على الخادم وتسجيل الدخول يُضافان في مرحلة المنصة المشتركة.",
 prep:"إعداد",authorName:"مدثر سلامه",cycleT:"ما الذي تستطيع فعله هنا",cycleS:"اقرأ دليل المواصفة، ثم ابحث عن الأداة المناسبة في المستكشف، وافتحها في المنصة، وارو التحسين كاملاً في لوحة قصة.",
 tStd:"ما هي ISO 10009، ولمن، والأغراض الأربعة، وترتيب الأدوات، ودورة PDCA، ولوحات القصة، وخصائص الأدوات، والكفاءة، وصلتها بـ ISO 9001:2026.",
 tCl:"البنود 1 إلى 16 والملاحق A وB وC، ولكل أداة من الـ 53: ما تقوله المواصفة، ومثال، والفائدة، ومكانها في المنصة، ومرحلتها في PDCA، والمخرج، ونقاط تُراعى.",
 tAssess:"16 سؤالاً عن ممارسة منشأتك في اختيار الأدوات وتطبيقها، بنتيجة لكل محور.",
 tTools:"مستكشف يقترح الأداة بحسب الغرض والمرحلة والموارد، ومكتبة الأدوات الـ 53، ولوحة قصة على مراحل PDCA مرتبطة بسجلات المنصة، وحاسبات NPS وOEE وتكلفة الجودة.",
 tDocs:"كل لوحات القصة بمرحلتها وخطواتها وروابطها، مع المثال وتصدير CSV.",tAudit:"فحص آلي لكل لوحة قصة: الغرض، والمراحل الأربع، والفريق، والكفاءة، والبيانات، والروابط، والنتيجة، والتوحيد، والمراجعة.",
 tDash:"تغطية المنصة لأدوات المواصفة، ومراحل PDCA في لوحاتك، والأدوات الأكثر استخداماً، وسجلات أدوات المنصة في متصفحك، والتقييم الذاتي، والبنود المفتوحة.",
 tReport:"تقرير HTML بجدول تغطية الأدوات الـ 53 ولوحات القصة بصفحاتها ونتائج التدقيق والتقييم، وتصدير CSV.",tAi:"مساعد يقترح سلسلة الأدوات لكل مشكلة — قيد الإنشاء.",
 foot:"ISO 10009 مواصفة إرشادية لا إشهاد عليها. الشروح ملخصات تفسيرية بصياغة مستقلة، وأرقام البنود وعناوينها وخصائص الأدوات تُحقق منها من النص الرسمي المرفوع، وحقوق نص المواصفة محفوظة لمنظمة ISO.",
 hmT:"في متصفحك {n} سجلاً من أدوات صندوق التحسين يمكن ربطها بلوحة قصة.",hmGo:"ابدأ لوحة قصة",
 covT:"أدوات المواصفة في المنصة",covS:"53 أداة تشرحها ISO 10009 في البنود 5 إلى 16، وأين تجد كلاً منها في المنصة.",covMore:"وتذكر المواصفة أيضاً PDCA (15.6) و8D وA3 (14.7) وبطاقة الأداء المتوازن (8.4) وقوائم التحقق: كلها في المنصة.",
 related:"أدوات المنصة المرتبطة",rel_pareto:"باريتو 13.7",rel_rca:"السبب الجذري 14.1",rel_why5:"لماذا الخمس 14.4",rel_fish:"عظمة السمكة 14.5",rel_dmaic:"Six Sigma 16.1",rel_fmea:"FMEA 7.3",rel_a3:"A3 · 8D 14.7",rel_pdca:"PDCA 15.6",rel_capa:"CAPA 14.7",rel_str:"SWOT · PESTLE 5",rel_oec:"SIPOC · RACI 6",
 logoAlt:"شعار أكاديمية التحسين المستمر",langSw:"English",langSwA:"Switch to English",
 termT:"ما هي ISO 10009؟",
 termP1:"ISO 10009:2024 مواصفة إرشادية أصدرتها اللجنة ISO/TC 176 في يونيو 2024، تعرّف بمجموعة من أدوات الجودة التي يمكن أن تفيد في نظام إدارة الجودة كما تصفه ISO 9001، وتساعد على اختيار الأداة المناسبة للعمل. وتعني «أداة الجودة» فيها «أسلوب الجودة»: طريقة أو إجراء لتنفيذ عملية بهدف تحقيق هدف جودة.",
 termP2:"تشرح المواصفة 53 أداة في البنود 5 إلى 16، مرتبة تقريباً بتسلسل متطلبات ISO 9001 (الاستراتيجية، والعمليات، والمخاطر، والأهداف، والعميل، والأداء، والمخزون، والمنع، وضبط العمليات، والإجراء التصحيحي، والتحسين، والعائلات الكبرى)، ولكل أداة: ما هي، وكيف تُستخدم، وفوائدها ونقاط تُراعى.",
 termP3:"وتضيف ثلاثة ملاحق: A يضع الأدوات على دورة PDCA في ثلاثة سياقات، وB يعرض لوحات قصة تبين استخدام الأدوات معاً، وC يلخص خصائص كل أداة. وتحيل إليها الملاحظة 3 في الملحق A.9.1 من ISO 9001:2026.",
 termIs:"ملخص تفسيري بصياغة مستقلة، وليس النص الرسمي. تُحقق منه من النص المرفوع في 2026-10-16.",
 defs:[["أداة الجودة","3.1","طريقة أو إجراء لتنفيذ عملية بهدف تحقيق هدف جودة؛ ويرادفها «أسلوب الجودة».","#1B2A4A"],["53 أداة","5–16","كل أداة بشرحها واستخدامها وفوائدها ونقاط تُراعى، وأدوات أخرى بالاسم في آخر كل بند.","#3563C9"],["دورة PDCA","A","ثلاثة جداول: الاستراتيجية، وتحسين العمليات، والتحسين المستمر.","#1E8C93"],["لوحة القصة","B","ملخص في صفحة واحدة من المشكلة إلى الإجراء الموحد.","#C9821A"],["الخصائص","C","فريق أو فرد، والبيانات، والكفاءة بالنقاط، والجهد.","#B8901E"]],
 asT:"التقييم الذاتي لممارسة أدوات الجودة",asS:"16 سؤالاً على ستة محاور: الاختيار، والكفاءة، والبيانات، والفريق، والربط بالنظام، والمراجعة. أجب بما يحدث فعلاً اليوم. 0 = لا، 1 = جزئياً، 2 = نعم بدليل.",
 asReset:"مسح الإجابات",asSaved:"حُفظت الإجابة",asAnswered:"{n} من 16 سؤالاً",as0:"لا",as1:"جزئياً",as2:"نعم، وبدليل",
 g_SL:"اختيار الأداة",g_CP:"الكفاءة",g_DT:"البيانات والعرض",g_TM:"الفريق",g_IN:"الربط بنظام الجودة",g_RV:"المراجعة والنتيجة",
 band0:"بداية: الأدوات تُستخدم بالعادة",band1:"نامية: الأدوات تُختار وتُطبق في أغلب الحالات",band2:"متقدمة: الأدوات تُختار بغرضها وتوصل إلى نتائج",
 bandNote:"النتيجة تقيس الممارسة الحالية، وليست شهادة؛ فـ ISO 10009 إرشاد لا يُشهد عليه.",
 subA:"أقسام مستكشف الأدوات",sNav:"اختر الأداة",sLib:"مكتبة الأدوات",sSb:"لوحة القصة",sCalc:"الحاسبات",
 navT:"اختر الأداة المناسبة",navS:"أجب عما تعرفه، واترك الباقي «أي». الاقتراح يقرأ مراحل الملحق A وخصائص الجدول C.1، ويبين سبب كل اقتراح وما ينقصك قبل استخدامه.",
 navPlat:"الأدوات الموجودة في المنصة فقط",navReset:"إعادة الاختيارات",navRes:"الأدوات المقترحة",navResS:"{n} أداة تناسب اختياراتك، مرتبة من الأنسب. تُعرض أول 12.",navNone:"لا توجد أداة تناسب كل الاختيارات. خفف أحد الشروط.",
 f_aim:"الغرض",f_ctx:"السياق (الملحق A)",f_ph:"مرحلة PDCA",f_who:"من يطبقها",f_data:"البيانات المتاحة",f_cap:"كفاءة الفريق في الأدوات",f_eff:"أقصى جهد مقبول",any:"أي",
 aim_char:"وصف عملية أو متغير",aim_prob:"تيسير حل مشكلة",aim_high:"إبراز مجالات التحسين",aim_eff:"تحسين الفعالية",
 ctx_s:"الاستراتيجية وتخطيط الأعمال (A.1)",ctx_p:"تحسين العمليات (A.2)",ctx_c:"التحسين المستمر (A.3)",ctxS_s:"الاستراتيجية",ctxS_p:"تحسين العمليات",ctxS_c:"التحسين المستمر",
 ph_P:"الخطة",ph_D:"التنفيذ",ph_C:"التحقق",ph_A:"التصرف",who_team:"فريق",who_ind:"فرد",
 data_small:"قليلة",data_medium:"متوسطة",data_large:"كبيرة",data_any:"أي حجم",cap1:"• قراءة فقط",cap2:"•• تدريب مخصص",cap3:"••• دورة وخبرة",eff_easy:"سهل",eff_medium:"متوسط",eff_difficult:"صعب",
 fit:"الملاءمة {p}%",r_aim:"تخدم غرض «{a}»",r_ph:"الملحق A يضعها في «{p}» في {c}",r_phR:"ضمن نطاق أدوات «{p}» في {c} (الملحق A)",r_ctx:"لها مكان في جدول {c}",
 r_who:"تناسب من سيطبقها",w_team:"تحتاج فريقاً لا فرداً",r_data:"بياناتك تكفيها",w_data:"تحتاج بيانات {d} على الأقل",r_cap:"كفاءة الفريق تكفيها",
 w_cap2:"تحتاج تدريباً مخصصاً (••)",w_cap3:"تحتاج دورة أطول وخبرة (•••)",w_eff:"جهدها {e}",r_plat:"موجودة في المنصة",
 btnExplain:"اشرح",btnOpen:"افتح في المنصة",btnAdd:"أضف إلى لوحة القصة",added:"أُضيفت «{t}» إلى لوحة القصة في مرحلة {p}.",
 libT:"مكتبة الأدوات الـ 53",libS:"كل أداة بخصائصها من الجدول C.1 ومرحلتها في الملحق A ومكانها في المنصة. افتح التفاصيل للاستخدامات والفوائد ونقاط تُراعى والمثال.",
 libQ:"ابحث باسم الأداة أو مجالها",libSec:"البند",libLv:"مكانها في المنصة",libCnt:"{n} من 53 أداة",allSec:"كل البنود",allLv:"الكل",
 lv_own:"أداة مستقلة في المنصة",lv_in:"جزء من أداة في المنصة",lv_here:"تُطبق في هذا الدليل",lv_rel:"أداة قريبة في المنصة",lv_none:"ليست في المنصة بعد",lv_plan:"مخططة في صندوق الأدوات",
 dUse:"تُستخدم في",dBen:"الفوائد",dNote:"نقاط تُراعى",dEx:"مثال توضيحي",dOut:"المخرج",dPdca:"مرحلتها في الملحق A",dMore:"التفاصيل",
 otherT:"أدوات أخرى ذات صلة (البند {c})",otherNamed:"تذكرها المواصفة بالاسم فقط.",
 t_team:"فريق",t_ind:"فرد",t_both:"فرد أو فريق",t_x:"غير محدد",ps_both:"منتج وخدمة",ps_mfg:"التصنيع",capT:"الكفاءة",annexNone:"لا يضعها الملحق A في جداوله",annexR:"(ضمن نطاق)",
 tlT:"لوحة القصة",tlS:"لوحة قصة لكل تحسين (الملحق B): الغرض والسياق والمشكلة، ثم الأدوات على المراحل الأربع، كل خطوة بمبررها ومخرجها ورابطها بسجل في أداة المنصة، ثم النتيجة والإجراء الموحد والمراجعة.",
 f_title:"عنوان التحسين",f_ref:"المرجع",f_ctx2:"السياق (الملحق A)",f_aim2:"الغرض (البند 1)",f_owner:"المالك",f_fac:"الميسّر المؤهل للأدوات الصعبة",f_area:"العملية أو الموقع",f_start:"تاريخ البدء",f_data2:"البيانات المتاحة",
 f_team:"الفريق (شخص ودوره في كل سطر)",f_problem:"بيان المشكلة أو الهدف",f_is:"ما هو (14.6): ما، وأين، ومتى، وكم",f_isnot:"ما ليس: ما الذي يمكن أن يكون ولم يحدث",
 f_result:"النتيجة مقابل الغرض",f_std:"ما الذي وُحِّد أو حُدِّث (إجراء، خطة ضبط، FMEA، سجل المخاطر)",f_lessons:"الدروس المستفادة",f_review:"تاريخ المراجعة بعد آخر خطوة",
 sel:"— اختر —",laneP:"الغرض والبيانات والنطاق",laneD:"رسم العملية وتحليل الأسباب",laneC:"التحقق بالبيانات قبل وبعد",laneA:"التوحيد وتحديث النظام",
 s_tool:"الأداة",s_other:"اسم الأداة",s_why:"لماذا هذه الأداة",s_out:"المخرج أو النتيجة",s_who:"من",s_st:"الحالة",s_date:"التاريخ",s_rec:"السجل المرتبط في {t}",
 st_plan:"مخطط",st_doing:"جارٍ",st_done:"تم",o_other:"أداة أخرى",recNone:"لا توجد سجلات لهذه الأداة في متصفحك بعد.",recMiss:"السجل {id} غير موجود في هذا المتصفح.",
 recPrev:"{id} · {t}",openRec:"افتح السجل ↗",openPlat:"افتح في المنصة ↗",rmStep:"حذف الخطوة",addStep:"+ خطوة في «{p}»",
 annexHint:"الملحق A يضعها في: {l}",annexOff:"في سياق «{c}» لا يضعها الملحق A في «{p}»؛ لا مانع، لكن اكتب السبب.",notOnPlat:"ليست في المنصة بعد: أرفق مخرجها في خانة «المخرج».",
 maxSteps:"وصلت لوحة القصة إلى 24 خطوة، وهو الحد الأقصى.",
 save:"حفظ لوحة القصة",newRec:"لوحة جديدة",saved:"حُفظت لوحة القصة.",savedFail:"تعذّر الحفظ في هذا المتصفح (التخزين ممتلئ أو محجوب).",
 errTitle:"اكتب عنوان التحسين.",errReview:"تاريخ المراجعة قبل تاريخ البدء.",errStep:"خطوة بلا أداة في مرحلة {p}: اختر الأداة أو احذف الخطوة.",unsaved:"تعديلات غير محفوظة",
 stg_draft:"مسودة",stg_P:"الخطة",stg_D:"التنفيذ",stg_C:"التحقق",stg_A:"التصرف",stg_done:"مكتملة",stg_reviewed:"مكتملة ومراجعة",
 pageT:"صفحة لوحة القصة",pageS:"تتحدث مع كل تعديل: الأدوات على المراحل الأربع كما في أشكال الملحق B.",pageEmpty:"ابدأ بالعنوان والغرض، ثم أضف الأدوات إلى المراحل.",pageNone:"لا أدوات بعد",
 calcT:"الحاسبات",calcS:"ثلاث أدوات من المواصفة لا توجد لها أداة مستقلة في المنصة، تحسبها هنا وتضيف نتيجتها خطوةً في لوحة القصة.",
 npsT:"صافي نقاط الترويج",npsS:"أدخل عدد المروجين (9–10) والمحايدين (7–8) والمنتقدين (0–6).",nps_p:"المروجون",nps_pa:"المحايدون",nps_d:"المنتقدون",
 npsOut:"{n} إجابة · المروجون {pp}% · المنتقدون {dp}% · صافي نقاط الترويج",npsLow:"العينة أقل من 30 إجابة: اقرأ النتيجة بحذر واسأل عن سبب الدرجات المنخفضة.",
 oeeT:"الفعالية الشاملة للمعدات",oeeS:"أدخل الإتاحة والأداء والجودة نسباً مئوية على فترة ممثلة.",oee_a:"الإتاحة %",oee_p:"الأداء %",oee_q:"الجودة %",oeeOut:"الفعالية الشاملة = الإتاحة × الأداء × الجودة",oeeLoss:"الخسارة الأكبر في: {f}",
 coqT:"تكلفة الجودة",coqS:"أدخل تكاليف الفترة نفسها: الوقاية والتقييم والفشل الداخلي والخارجي، والمبيعات.",coq_pr:"الوقاية",coq_ap:"التقييم",coq_in:"الفشل الداخلي",coq_ex:"الفشل الخارجي",coq_sales:"المبيعات",
 coqOut:"تكلفة الجودة {tot} · منها سوء الجودة (فشل داخلي وخارجي) {copq} ({cp}%)",coqShare:"{s}% من المبيعات",
 calcBad:"أدخل أرقاماً صحيحة لا سالبة.",calcBadP:"النسب بين 0 و100.",calcNone:"أدخل القيم لترى النتيجة.",toSb:"أضف النتيجة إلى لوحة القصة",
 exT:"المثال التطبيقي",exS:"ثلاث لوحات قصة توضيحية لشركة الواحة للمقاولات (الشركة الافتراضية في أمثلة صندوق الأدوات): تحسين استلام الخرسانة، وسلامة رفع حزم الحديد، وخطة 2027، وكل خطوة مرتبطة بسجلات أمثلة الأدوات الأخرى.",
 exLoad:"تحميل المثال",exClear:"مسح كل البيانات",exLoaded:"حُمّل المثال. حمّل أمثلة باريتو وعظمة السمكة وDMAIC وغيرها في أدواتها لتعمل روابط السجلات.",exCleared:"مُسحت كل بيانات هذه الأداة.",
 exConfirmClear:"سيُحذف كل ما في هذه الأداة من لوحات قصة وإجابات وحسابات، ولا يمكن التراجع.\n\nهل تريد المتابعة؟",
 dT:"لوحات القصة",dS:"كل لوحة بسياقها وغرضها ومرحلتها وخطواتها وروابطها بالمنصة ونتيجة تدقيقها.",csv:"تصدير CSV",none:"لا توجد لوحات قصة بعد. ابدأ من مستكشف الأدوات أو حمّل المثال.",
 del:"حذف",delArm:"اضغط مرة أخرى للتأكيد",edit:"فتح",colRec:"لوحة القصة",colCtx:"السياق والغرض",colStage:"المرحلة",colSteps:"الخطوات",colAud:"التدقيق",colAct:"إجراء",
 stepsLine:"{n} خطوة · {d} تمت · {k} مرتبطة",
 auT:"التدقيق الآلي على لوحات القصة",auS:"فحوص تُحسب من البيانات: ✓ ناجح، ✗ ثغرة، — لا ينطبق بعد. القواعد من إرشاد الكاتب على أساس البنود 1 و4 والملحقين B وC.",auPass:"نسبة النجاح",auNone:"لا توجد لوحات قصة للتدقيق.",
 c_ref:"المرجع والمالك والسياق",c_aim:"المشكلة أو الهدف",c_pdca:"المراحل الأربع",c_why:"مبرر لكل أداة",c_team:"فريق للأدوات الجماعية",c_comp:"ميسّر للأدوات •••",c_data:"البيانات تكفي",c_link:"روابط السجلات",c_check:"مخرج التحقق",c_result:"النتيجة",c_act:"التوحيد",c_review:"المراجعة",
 oi_ref:"ينقصها المرجع أو المالك أو السياق أو الغرض",oi_aim:"ينقصها بيان المشكلة (وما هو / ما ليس للمشكلات)",oi_pdca:"مرحلة بلا أداة: {p}",oi_why:"خطوة بلا مبرر للاختيار",oi_team:"أداة جماعية والفريق أقل من شخصين",
 oi_comp:"أداة ••• ({t}) بلا ميسّر مؤهل",oi_data:"أداة تحتاج بيانات أكثر مما هو متاح ({t})",oi_link:"خطوة منفذة بلا رابط سجل ({t})",oi_check:"خطوة تحقق منفذة بلا مخرج",oi_result:"كل الخطوات تمت ولم تُكتب النتيجة",
 oi_act:"النتيجة مكتوبة ولم يُذكر ما وُحِّد أو حُدِّث",oi_review:"مكتملة ولم تُراجع بعد آخر خطوة",
 dashT:"لوحة المؤشرات",dashS:"تُحسب من لوحات القصة والتقييم الذاتي ومن سجلات أدوات المنصة في هذا المتصفح (قراءة فقط).",
 kTotal:"لوحات القصة",kAud:"نجاح التدقيق",kAs:"التقييم الذاتي",kLinked:"خطوات مرتبطة بسجل",kTools:"أدوات مختلفة مستخدمة",kClosed:"مكتملة",kCov:"أدوات المواصفة في المنصة",kOpen:"بنود مفتوحة",
 byCov:"تغطية المنصة حسب البند",byCovS:"لكل بند: الأدوات المستقلة، وداخل الأدوات، وفي هذا الدليل، والقريبة، وغير الموجودة بعد.",byPh:"الخطوات حسب مرحلة PDCA",byTool:"الأدوات الأكثر استخداماً في لوحاتك",
 byUse:"سجلات أدوات المنصة في متصفحك",byUseS:"قراءة فقط من أدوات صندوق التحسين، مقابل بند كل أداة في ISO 10009.",useNone:"لا توجد سجلات في أدوات الصندوق في هذا المتصفح بعد.",byAssess:"التقييم الذاتي حسب المحور",
 openT:"بنود تحتاج متابعة",noOpen:"لا توجد بنود مفتوحة.",dNone:"لا بيانات بعد.",
 rpT:"التقرير",rpS:"تقرير HTML بجدول تغطية الأدوات الـ 53، ولوحات القصة بصفحاتها وخطواتها، ونتائج التدقيق، والتقييم الذاتي، والحاسبات.",rpHtml:"تنزيل تقرير HTML",
 rpNote:"يُفتح التقرير في المتصفح ويُطبع إلى PDF. يحمل اسم المُعد وتاريخ اليوم.",rpPrev:"معاينة",rpEmpty:"لا توجد بيانات للتقرير بعد. أنشئ لوحة قصة أو أجب عن التقييم أو حمّل المثال.",
 rpCover:"تقرير أدوات الجودة ولوحات القصة",rpCov:"تغطية المنصة لأدوات ISO 10009",rpSb:"لوحات القصة",rpCalc:"الحاسبات",
 aiT:"المساعد الذكي — قيد الإنشاء",aiS:"سيقرأ هذا المساعد المشكلة وبياناتها ويقترح سلسلة أدوات على مراحل PDCA، وينبه إلى أداة صعبة بلا ميسّر أو بيانات لا تكفي. ولن يعمل قبل اكتمال محرك المنصة المشترك، ولن يعرض نتائج مختلقة.",
 aiList:["اقتراح سلسلة أدوات لكل مشكلة بحسب الملحق B","مراجعة لوحة القصة قبل عرضها على الإدارة","ربط النتائج بسجل المخاطر والأهداف تلقائياً"],
 yes:"نعم",no:"لا"},
en:{brand:"Continual Improvement Academy · مدثر سلامه",toolName:"ISO 10009 — Quality tools guide",sgLearn:"Learn",sgWork:"Work",sgOut:"Outputs",
 nHome:"Home",nStd:"Standard guide",nCl:"Clause and tool guide",nAssess:"Self-assessment",nTools:"Tool navigator",nDocs:"Records",nAudit:"Audit",nDash:"Dashboard",nReport:"Report",nAi:"AI Assistant",soon:"Soon",
 homeCode:"Quality management — Guidance for quality tools and their application",homeH1:"Quality tools and their application",
 homeLede:"A complete guide to ISO 10009:2024 and its 53 tools, from SWOT, SIPOC and FMEA to Pareto, fishbone and Six Sigma: what each tool is, when to use it, the team, data, capability and effort it needs, and where to find it on the platform. A navigator suggests the right tool for your aim and phase, and a storyboard links the steps of an improvement to the records of the platform's tools.",
 heroTag:"Guidance standard supporting ISO 9001:2026",
 homeNote:"This version keeps storyboards and answers in your browser only. Server storage and sign-in come with the shared platform stage.",
 prep:"Prepared by",authorName:"مدثر سلامه",cycleT:"What you can do here",cycleS:"Read the standard guide, find the right tool in the navigator, open it on the platform, and tell the whole improvement in a storyboard.",
 tStd:"What ISO 10009 is, who it is for, the four aims, how the tools are arranged, the PDCA cycle, storyboards, the attributes of the tools, competence, and the link to ISO 9001:2026.",
 tCl:"Clauses 1 to 16 and Annexes A, B and C; for each of the 53 tools: what the standard says, an example, the benefit, where it is on the platform, its PDCA phase, the output and points to note.",
 tAssess:"16 questions on how your organization chooses and applies tools, with a score for each area.",
 tTools:"A navigator that suggests a tool by aim, phase and resources, the library of 53 tools, a PDCA storyboard linked to platform records, and NPS, OEE and cost of quality calculators.",
 tDocs:"Every storyboard with its stage, steps and links, the example and CSV export.",tAudit:"An automatic check of each storyboard: aim, the four phases, team, competence, data, links, result, standard and review.",
 tDash:"Platform coverage of the standard's tools, PDCA phases in your storyboards, the tools you use most, platform records in your browser, the self-assessment and open items.",
 tReport:"An HTML report with the coverage table of the 53 tools, the storyboards with their pages, the audit and self-assessment results, and CSV export.",tAi:"An assistant that suggests the chain of tools for each problem — under construction.",
 foot:"ISO 10009 is guidance and is not certified against. Explanations are interpretive summaries in independent wording; clause numbers, titles and tool attributes were checked against the uploaded official text, and the text of the standard remains copyright of ISO.",
 hmT:"Your browser holds {n} records from the improvement toolbox that a storyboard can link to.",hmGo:"Start a storyboard",
 covT:"The standard's tools on the platform",covS:"The 53 tools ISO 10009 reviews in clauses 5 to 16, and where each one is on the platform.",covMore:"The standard also names PDCA (15.6), 8D and A3 (14.7), the balanced scorecard (8.4) and checklists: all on the platform.",
 related:"Linked platform tools",rel_pareto:"Pareto 13.7",rel_rca:"Root cause 14.1",rel_why5:"5 Whys 14.4",rel_fish:"Fishbone 14.5",rel_dmaic:"Six Sigma 16.1",rel_fmea:"FMEA 7.3",rel_a3:"A3 · 8D 14.7",rel_pdca:"PDCA 15.6",rel_capa:"CAPA 14.7",rel_str:"SWOT · PESTLE 5",rel_oec:"SIPOC · RACI 6",
 logoAlt:"Continual Improvement Academy logo",langSw:"العربية",langSwA:"التبديل إلى العربية",
 termT:"What is ISO 10009?",
 termP1:"ISO 10009:2024 is a guidance standard published by ISO/TC 176 in June 2024. It introduces a range of quality tools that can be useful in a quality management system as described by ISO 9001, and helps select the tool that fits the task. In it, a \"quality tool\" means the same as a \"quality technique\": a method or procedure to perform an operation to achieve a quality objective.",
 termP2:"The standard reviews 53 tools in clauses 5 to 16, arranged approximately in the sequence of ISO 9001 requirements (strategy, processes, risk, objectives, customer, performance, inventory, prevention, process control, corrective action, improvement and the large families), each with what it is, how it is used, its benefits and points to note.",
 termP3:"Three annexes follow: A places the tools on the PDCA cycle in three contexts, B shows storyboards of tools used together, and C summarises the attributes of each tool. NOTE 3 of Annex A.9.1 of ISO 9001:2026 points to it.",
 termIs:"Interpretive summary in independent wording, not the official text. Checked against the uploaded text on 2026-10-16.",
 defs:[["Quality tool","3.1","A method or procedure to perform an operation to achieve a quality objective; also called a quality technique.","#1B2A4A"],["53 tools","5–16","Each with its explanation, use, benefits and points to note, plus other tools named at the end of each clause.","#3563C9"],["PDCA cycle","A","Three tables: strategy, process improvement and continual improvement.","#1E8C93"],["Storyboard","B","A one-page summary from the problem to the standard.","#C9821A"],["Attributes","C","Team or individual, data, capability in dots, and effort.","#B8901E"]],
 asT:"Self-assessment of quality tool practice",asS:"16 questions in six areas: choice, competence, data, team, link to the system and review. Answer for what happens today. 0 = no, 1 = partly, 2 = yes, with evidence.",
 asReset:"Clear answers",asSaved:"Answer saved",asAnswered:"{n} of 16 questions",as0:"No",as1:"Partly",as2:"Yes, with evidence",
 g_SL:"Choosing the tool",g_CP:"Competence",g_DT:"Data and display",g_TM:"Team",g_IN:"Link to the quality system",g_RV:"Review and result",
 band0:"Starting: tools are used by habit",band1:"Developing: tools are chosen and applied in most cases",band2:"Advanced: tools are chosen for their purpose and lead to results",
 bandNote:"The score measures current practice; it is not a certificate, since ISO 10009 is guidance and is not certified against.",
 subA:"Tool navigator sections",sNav:"Pick a tool",sLib:"Tool library",sSb:"Storyboard",sCalc:"Calculators",
 navT:"Pick the right tool",navS:"Answer what you know and leave the rest as \"any\". The suggestion reads the phases of Annex A and the attributes of Table C.1, and shows the reason for each suggestion and what you lack before using it.",
 navPlat:"Only tools that are on the platform",navReset:"Reset the choices",navRes:"Suggested tools",navResS:"{n} tools fit your choices, best fit first. The first 12 are shown.",navNone:"No tool fits every choice. Relax one condition.",
 f_aim:"Aim",f_ctx:"Context (Annex A)",f_ph:"PDCA phase",f_who:"Who applies it",f_data:"Data available",f_cap:"Team's capability with tools",f_eff:"Most effort acceptable",any:"Any",
 aim_char:"Characterize a process or variable",aim_prob:"Facilitate problem solving",aim_high:"Highlight areas for improvement",aim_eff:"Improve effectiveness",
 ctx_s:"Strategy and business planning (A.1)",ctx_p:"Process improvement (A.2)",ctx_c:"Continual improvement (A.3)",ctxS_s:"strategy",ctxS_p:"process improvement",ctxS_c:"continual improvement",
 ph_P:"Plan",ph_D:"Do",ph_C:"Check",ph_A:"Act",who_team:"A team",who_ind:"One person",
 data_small:"small",data_medium:"medium",data_large:"large",data_any:"any size",cap1:"• reading only",cap2:"•• dedicated training",cap3:"••• course and experience",eff_easy:"easy",eff_medium:"medium",eff_difficult:"difficult",
 fit:"Fit {p}%",r_aim:"Serves the aim \"{a}\"",r_ph:"Annex A places it in {p} for {c}",r_phR:"In the range of {p} tools for {c} (Annex A)",r_ctx:"Has a place in the {c} table",
 r_who:"Suits who will apply it",w_team:"Needs a team, not one person",r_data:"Your data are enough",w_data:"Needs at least {d} data",r_cap:"The team's capability is enough",
 w_cap2:"Needs dedicated training (••)",w_cap3:"Needs a longer course and experience (•••)",w_eff:"Its effort is {e}",r_plat:"On the platform",
 btnExplain:"Explain",btnOpen:"Open on the platform",btnAdd:"Add to the storyboard",added:"\"{t}\" was added to the storyboard in {p}.",
 libT:"Library of the 53 tools",libS:"Each tool with its attributes from Table C.1, its phase in Annex A and where it is on the platform. Open the details for uses, benefits, points to note and the example.",
 libQ:"Search by tool name or area",libSec:"Clause",libLv:"Where it is on the platform",libCnt:"{n} of 53 tools",allSec:"All clauses",allLv:"All",
 lv_own:"Dedicated platform tool",lv_in:"Part of a platform tool",lv_here:"Worked in this guide",lv_rel:"Related platform tool",lv_none:"Not on the platform yet",lv_plan:"Planned in the toolbox",
 dUse:"Used for",dBen:"Benefits",dNote:"Points to note",dEx:"Illustrative example",dOut:"Output",dPdca:"Its phase in Annex A",dMore:"Details",
 otherT:"Other relevant tools (clause {c})",otherNamed:"The standard names them only.",
 t_team:"Team",t_ind:"Individual",t_both:"Individual or team",t_x:"Not given",ps_both:"Product and service",ps_mfg:"Manufacturing",capT:"Capability",annexNone:"Annex A does not place it in its tables",annexR:"(in a range)",
 tlT:"Storyboard",tlS:"One storyboard per improvement (Annex B): the aim, context and problem, then the tools on the four phases, each step with its reason, output and link to a record in a platform tool, then the result, the standard and the review.",
 f_title:"Title of the improvement",f_ref:"Reference",f_ctx2:"Context (Annex A)",f_aim2:"Aim (clause 1)",f_owner:"Owner",f_fac:"Facilitator qualified for the difficult tools",f_area:"Process or site",f_start:"Start date",f_data2:"Data available",
 f_team:"Team (one person and role per line)",f_problem:"Problem or objective statement",f_is:"Is (14.6): what, where, when, how much",f_isnot:"Is not: what could be but is not",
 f_result:"Result against the aim",f_std:"What was standardized or updated (procedure, control plan, FMEA, risk register)",f_lessons:"Lessons learned",f_review:"Review date after the last step",
 sel:"— choose —",laneP:"Aim, data and scope",laneD:"Map the process and analyse causes",laneC:"Check with data before and after",laneA:"Standardize and update the system",
 s_tool:"Tool",s_other:"Tool name",s_why:"Why this tool",s_out:"Output or result",s_who:"Who",s_st:"Status",s_date:"Date",s_rec:"Linked record in {t}",
 st_plan:"Planned",st_doing:"Under way",st_done:"Done",o_other:"Another tool",recNone:"No records of this tool in your browser yet.",recMiss:"Record {id} is not in this browser.",
 recPrev:"{id} · {t}",openRec:"Open the record ↗",openPlat:"Open on the platform ↗",rmStep:"Remove the step",addStep:"+ step in {p}",
 annexHint:"Annex A places it in: {l}",annexOff:"For {c}, Annex A does not place it in {p}; that is allowed, but write the reason.",notOnPlat:"Not on the platform yet: put its output in the Output box.",
 maxSteps:"The storyboard has reached 24 steps, the maximum.",
 save:"Save the storyboard",newRec:"New storyboard",saved:"Storyboard saved.",savedFail:"Could not save in this browser (storage full or blocked).",
 errTitle:"Write the title of the improvement.",errReview:"The review date is before the start date.",errStep:"A step with no tool in {p}: choose the tool or remove the step.",unsaved:"Unsaved changes",
 stg_draft:"Draft",stg_P:"Plan",stg_D:"Do",stg_C:"Check",stg_A:"Act",stg_done:"Complete",stg_reviewed:"Complete and reviewed",
 pageT:"Storyboard page",pageS:"Updates with every change: the tools on the four phases, as in the figures of Annex B.",pageEmpty:"Start with the title and the aim, then add tools to the phases.",pageNone:"No tools yet",
 calcT:"Calculators",calcS:"Three of the standard's tools with no dedicated platform tool: compute them here and add the result as a storyboard step.",
 npsT:"Net promoter score",npsS:"Enter the number of promoters (9–10), passives (7–8) and detractors (0–6).",nps_p:"Promoters",nps_pa:"Passives",nps_d:"Detractors",
 npsOut:"{n} answers · promoters {pp}% · detractors {dp}% · net promoter score",npsLow:"Fewer than 30 answers: read the score with care and ask why low scores were given.",
 oeeT:"Overall equipment effectiveness",oeeS:"Enter availability, performance and quality as percentages over a representative period.",oee_a:"Availability %",oee_p:"Performance %",oee_q:"Quality %",oeeOut:"OEE = availability × performance × quality",oeeLoss:"Biggest loss in: {f}",
 coqT:"Cost of quality",coqS:"Enter the costs for the same period: prevention, appraisal, internal and external failure, and sales.",coq_pr:"Prevention",coq_ap:"Appraisal",coq_in:"Internal failure",coq_ex:"External failure",coq_sales:"Sales",
 coqOut:"Cost of quality {tot} · of which poor quality (internal and external failure) {copq} ({cp}%)",coqShare:"{s}% of sales",
 calcBad:"Enter valid, non-negative numbers.",calcBadP:"Percentages run from 0 to 100.",calcNone:"Enter the values to see the result.",toSb:"Add the result to the storyboard",
 exT:"Worked example",exS:"Three illustrative storyboards for Al-Waha Contracting (the fictitious company of the toolbox examples): improving concrete receiving, safe lifting of rebar bundles and the 2027 plan, each step linked to the example records of the other tools.",
 exLoad:"Load example",exClear:"Clear all data",exLoaded:"Example loaded. Load the examples of Pareto, Fishbone, DMAIC and the others in their own tools so the record links work.",exCleared:"All data in this tool was cleared.",
 exConfirmClear:"Every storyboard, answer and calculation in this tool will be deleted, and this cannot be undone.\n\nDo you want to continue?",
 dT:"Storyboards",dS:"Each storyboard with its context, aim, stage, steps, platform links and audit result.",csv:"Export CSV",none:"No storyboards yet. Start from the tool navigator or load the example.",
 del:"Delete",delArm:"Select again to confirm",edit:"Open",colRec:"Storyboard",colCtx:"Context and aim",colStage:"Stage",colSteps:"Steps",colAud:"Audit",colAct:"Action",
 stepsLine:"{n} steps · {d} done · {k} linked",
 auT:"Automatic audit of the storyboards",auS:"Checks computed from the data: ✓ pass, ✗ gap, — does not apply yet. The rules are the author's guidance, based on clauses 1 and 4 and Annexes B and C.",auPass:"Pass rate",auNone:"No storyboards to audit.",
 c_ref:"Reference, owner, context",c_aim:"Problem or objective",c_pdca:"All four phases",c_why:"A reason for each tool",c_team:"A team for team tools",c_comp:"Facilitator for ••• tools",c_data:"Enough data",c_link:"Record links",c_check:"Check output",c_result:"Result",c_act:"Standard",c_review:"Review",
 oi_ref:"Missing reference, owner, context or aim",oi_aim:"Missing problem statement (and is / is not for problems)",oi_pdca:"A phase with no tool: {p}",oi_why:"A step with no reason for the choice",oi_team:"A team tool with fewer than two people",
 oi_comp:"A ••• tool ({t}) with no qualified facilitator",oi_data:"A tool that needs more data than is available ({t})",oi_link:"A completed step with no record link ({t})",oi_check:"A completed Check step with no output",oi_result:"Every step is done and the result is not written",
 oi_act:"The result is written but not what was standardized or updated",oi_review:"Complete and not reviewed after the last step",
 dashT:"Dashboard",dashS:"Computed from the storyboards, the self-assessment and the platform's toolbox records in this browser (read only).",
 kTotal:"Storyboards",kAud:"Audit pass rate",kAs:"Self-assessment",kLinked:"Steps linked to a record",kTools:"Different tools used",kClosed:"Complete",kCov:"Standard's tools on the platform",kOpen:"Open items",
 byCov:"Platform coverage by clause",byCovS:"For each clause: dedicated tools, inside platform tools, in this guide, related, and not yet on the platform.",byPh:"Steps by PDCA phase",byTool:"Tools used most in your storyboards",
 byUse:"Platform tool records in your browser",byUseS:"Read only from the improvement toolbox, against each tool's clause in ISO 10009.",useNone:"No toolbox records in this browser yet.",byAssess:"Self-assessment by area",
 openT:"Items to follow up",noOpen:"No open items.",dNone:"No data yet.",
 rpT:"Report",rpS:"An HTML report with the coverage table of the 53 tools, the storyboards with their pages and steps, the audit results, the self-assessment and the calculators.",rpHtml:"Download HTML report",
 rpNote:"The report opens in the browser and prints to PDF. It carries the author's name and today's date.",rpPrev:"Preview",rpEmpty:"Nothing to report yet. Create a storyboard, answer the self-assessment or load the example.",
 rpCover:"Quality tools and storyboards report",rpCov:"Platform coverage of the ISO 10009 tools",rpSb:"Storyboards",rpCalc:"Calculators",
 aiT:"AI Assistant — under construction",aiS:"This assistant will read the problem and its data and suggest a chain of tools on the PDCA phases, and point out a difficult tool with no facilitator or data that are not enough. It will not run before the shared platform engine is in place, and it will not show invented results.",
 aiList:["Suggest a chain of tools for each problem, as in Annex B","Review the storyboard before it goes to management","Link the results to the risk register and objectives automatically"],
 yes:"Yes",no:"No"}
};
function t(k,v){ var d=UI[L]||UI.ar; var s=(d[k]!==undefined)?d[k]:(UI.ar[k]!==undefined?UI.ar[k]:k); if(v){ for(var x in v){ s=String(s).split("{"+x+"}").join(v[x]); } } return s; }
function esc(s){ return TBX.esc(s); }
function today(){ return TBX.today(); }
function txt(v){ return TBX.txt(v); }
function str(v){ return (v==null||typeof v==="object")?"":String(v); }
function obj(v){ return (v&&typeof v==="object"&&!Array.isArray(v))?v:{}; }
function arr(v){ return Array.isArray(v)?v.filter(function(x){ return x&&typeof x==="object"; }):[]; }
function isD(s){ return /^\d{4}-\d{2}-\d{2}$/.test(String(s||"")); }
function pick(v,list){ return list.indexOf(v)>=0?v:""; }
function short(s,n){ s=txt(s).replace(/\s+/g," "); n=n||90; return s.length>n?s.slice(0,n-1)+"…":s; }
function nm(x){ return x?(x[L]||x.ar||""):""; }
function num(v){ if(v===null||v===undefined||String(v).trim()==="") return null; var n=Number(String(v).replace(/,/g,"")); return isFinite(n)?n:NaN; }
function fmtN(v,d){ return (v===null||v===undefined||!isFinite(v))?"—":Number(v).toLocaleString("en-US",{maximumFractionDigits:d===undefined?1:d}); }
function pct(a,b){ return b?Math.round(a/b*100)+"%":"—"; }
function dots(n){ return n?new Array(n+1).join("•"):"—"; }

/* ---------- records ---------- */
function blankStep(ph){ return {id:"",ph:ph||"P",tool:"",other:"",why:"",out:"",who:"",st:"plan",date:"",rid:""}; }
function blank(){ return {id:"",ref:"",title:"",ctx:"",aim:"",owner:"",fac:"",area:"",start:"",data:"",team:"",problem:"",is:"",isnot:"",steps:[],result:"",std:"",lessons:"",review:"",created:"",updated:""}; }
function fixStep(x){ x=obj(x); return {id:str(x.id),ph:pick(x.ph,PH)||"P",tool:(BYID[x.tool]||x.tool==="other")?x.tool:"",other:str(x.other),why:str(x.why),out:str(x.out),who:str(x.who),st:pick(x.st,STS)||"plan",date:isD(x.date)?x.date:"",rid:str(x.rid)}; }
function fixRec(r){
 r=obj(r); var b=blank();
 ["id","ref","title","owner","fac","area","team","problem","is","isnot","result","std","lessons","created","updated"].forEach(function(k){ b[k]=str(r[k]); });
 b.ctx=pick(r.ctx,CTXS); b.aim=pick(r.aim,AIMS); b.data=pick(r.data,DATAS); b.start=isD(r.start)?r.start:""; b.review=isD(r.review)?r.review:"";
 b.steps=arr(r.steps).slice(0,MAXSTEPS).map(fixStep);
 var seen={}; b.steps.forEach(function(s,i){ if(!s.id||seen[s.id]) s.id="s"+(i+1)+"-"+Math.random().toString(36).slice(2,6); seen[s.id]=1; });
 return b;
}
function fixNav(n){ n=obj(n); return {aim:pick(n.aim,AIMS),ctx:pick(n.ctx,CTXS),ph:pick(n.ph,PH),who:pick(n.who,["team","ind"]),data:pick(n.data,DATAS)||"medium",cap:pick(String(n.cap||""),["1","2","3"])||"2",eff:pick(n.eff,EFFS),plat:n.plat===true}; }
function fixCalc(c){ c=obj(c); var f=function(o,ks){ o=obj(o); var r={}; ks.forEach(function(k){ r[k]=str(o[k]); }); return r; };
 return {nps:f(c.nps,["p","pa","d"]),oee:f(c.oee,["a","pf","q"]),coq:f(c.coq,["pr","ap","inf","exf","sales"])}; }
function norm(v){
 var recs=arr(v.records).map(fixRec).filter(function(r){ return r.id; });
 var A={}, a=obj(v.assess); Object.keys(a).forEach(function(k){ var x=a[k]; if(/^(SL|CP|DT|TM|IN|RV)[1-4]$/.test(k)&&(x===0||x===1||x===2)) A[k]=x; });
 return {records:recs,assess:A,nav:fixNav(v.nav),calc:fixCalc(v.calc)};
}
function load(){ return TBX.load(STORE,norm,function(){ return {records:[],assess:{},nav:fixNav({}),calc:fixCalc({})}; }); }
function persist(){ return TBX.save(STORE,DB); }

/* ---------- tool facts ---------- */
function toolOf(s){ return s&&s.tool&&s.tool!=="other"?BYID[s.tool]:null; }
function stepName(s){ var T0=toolOf(s); return T0?T0.c+" "+nm(T0.n):(s.tool==="other"?(txt(s.other)||t("o_other")):"—"); }
function recKey(T0){ return T0&&T0.own?QTC.REC[T0.own]:""; }
function teamN(r){ return txt(r.team).split(/\n+/).filter(function(x){ return txt(x); }).length; }
function stepsIn(r,ph){ return r.steps.filter(function(s){ return s.ph===ph&&s.tool; }); }
function stageOf(r){
 var S=r.steps.filter(function(s){ return s.tool; }); if(!S.length) return "draft";
 for(var i=0;i<PH.length;i++){ var L1=stepsIn(r,PH[i]); if(!L1.length||L1.some(function(s){ return s.st!=="done"; })) return PH[i]; }
 if(!txt(r.result)) return "A";
 var last=S.map(function(s){ return s.date; }).filter(isD).sort().pop()||"";
 return (isD(r.review)&&(!last||r.review>=last))?"reviewed":"done";
}
function stageName(st){ return t("stg_"+st); }
/* ---------- audit (12 checks; null = does not apply yet) ---------- */
var CHECKS=["ref","aim","pdca","why","team","comp","data","link","check","result","act","review"];
function needData(r){ var n=0, who=null; r.steps.forEach(function(s){ var T0=toolOf(s); if(T0&&(DR[T0.data]||0)>n){ n=DR[T0.data]; who=T0; } }); return {n:n,t:who}; }
function auditRecord(r){
 var S=r.steps.filter(function(s){ return s.tool; }), st=stageOf(r), all=S.length&&S.every(function(s){ return s.st==="done"; });
 var teamTools=S.filter(function(s){ var T0=toolOf(s); return T0&&T0.team==="team"; }), hard=S.filter(function(s){ var T0=toolOf(s); return T0&&T0.cap===3; });
 var nd=needData(r), linkable=S.filter(function(s){ return s.st==="done"&&recKey(toolOf(s)); }), cdone=S.filter(function(s){ return s.ph==="C"&&s.st==="done"; });
 var last=S.map(function(s){ return s.date; }).filter(isD).sort().pop()||"";
 return {
  ref:!!(txt(r.ref)&&txt(r.title)&&txt(r.owner)&&r.ctx&&r.aim),
  aim:!!txt(r.problem)&&(r.aim!=="prob"||(!!txt(r.is)&&!!txt(r.isnot))),
  pdca:S.length?PH.every(function(p){ return stepsIn(r,p).length>0; }):false,
  why:S.length?S.every(function(s){ return !!txt(s.why)&&(s.tool!=="other"||!!txt(s.other)); }):null,
  team:teamTools.length?teamN(r)>=2:null,
  comp:hard.length?!!txt(r.fac):null,
  data:nd.n>=2?((DR[r.data]||0)>=nd.n):null,
  link:linkable.length?linkable.every(function(s){ return !!txt(s.rid); }):null,
  check:cdone.length?cdone.every(function(s){ return !!txt(s.out); }):null,
  result:all?!!txt(r.result):null,
  act:txt(r.result)?!!txt(r.std):null,
  review:(st==="done"||st==="reviewed")?(isD(r.review)&&(!last||r.review>=last)&&(!isD(r.start)||r.review>=r.start)):null
 };
}
function auditSummary(){ var A=TBX.audit(DB.records,auditRecord,CHECKS); return {rate:A.rate,pass:A.pass,applic:A.applic,rows:A.rows}; }
function issues(r){
 var a=auditRecord(r), out=[];
 if(a.ref===false) out.push(["ref","bad",{}]);
 if(a.aim===false) out.push(["aim","bad",{}]);
 if(a.pdca===false){ var miss=PH.filter(function(p){ return !stepsIn(r,p).length; }).map(function(p){ return t("ph_"+p); }); out.push(["pdca","warn",{p:miss.join(L==="ar"?"، ":", ")}]); }
 if(a.why===false) out.push(["why","warn",{}]);
 if(a.team===false) out.push(["team","warn",{}]);
 if(a.comp===false){ var h=r.steps.filter(function(s){ var T0=toolOf(s); return T0&&T0.cap===3; })[0]; out.push(["comp","bad",{t:stepName(h)}]); }
 if(a.data===false){ out.push(["data","warn",{t:nd2(r)}]); }
 if(a.link===false){ var l=r.steps.filter(function(s){ return s.st==="done"&&recKey(toolOf(s))&&!txt(s.rid); })[0]; out.push(["link","info",{t:stepName(l)}]); }
 if(a.check===false) out.push(["check","warn",{}]);
 if(a.result===false) out.push(["result","warn",{}]);
 if(a.act===false) out.push(["act","bad",{}]);
 if(a.review===false) out.push(["review","info",{}]);
 return out;
}
function nd2(r){ var n=needData(r); return n.t?n.t.c+" "+nm(n.t.n):"—"; }
function openItems(){ var out=[]; DB.records.forEach(function(r){ issues(r).forEach(function(x){ out.push({r:r,k:x[1],s:t("oi_"+x[0],x[2])}); }); }); return out; }
function chip(s,k){ return '<span class="ca-chip '+k+'">'+esc(s)+'</span>'; }

/* ---------- language and tabs ---------- */
function applyLang(){
 if(editing) readForm();
 document.documentElement.lang=L; document.documentElement.dir=(L==="ar")?"rtl":"ltr";
 var d=UI[L]||UI.ar;
 document.querySelectorAll("[data-i]").forEach(function(el){ var k=el.getAttribute("data-i"); if(d[k]!==undefined) el.textContent=d[k]; });
 document.querySelectorAll("[data-i-aria]").forEach(function(el){ var k=el.getAttribute("data-i-aria"); if(d[k]!==undefined) el.setAttribute("aria-label",d[k]); });
 var ul=document.querySelector("[data-i-list]"); if(ul){ ul.innerHTML=d.aiList.map(function(x){ return "<li>"+esc(x)+"</li>"; }).join(""); }
 document.getElementById("langLabel").textContent=t("langSw");
 document.getElementById("langBtn").setAttribute("aria-label",t("langSwA"));
 document.getElementById("caDefs").innerHTML=d.defs.map(function(x){ return '<div style="--dc:'+x[3]+'"><b>'+esc(x[0])+'</b><code>'+esc(x[1])+'</code><span>'+esc(x[2])+'</span></div>'; }).join("");
 applyLogo(); buildRelated();
 document.title=TITLES[L]||TITLES.ar;
 try{ localStorage.setItem(LKEY,L); }catch(e){}
 if(window.CIAEX && CIAEX.ready){ if(CIAEX.renderStandard) CIAEX.renderStandard(); if(CIAEX.renderClauses) CIAEX.renderClauses(); }
 buildNavFields(); buildLibFilters(); renderForm(); renderCalcs();
 cbLang(); qxLang();
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
 if(id==="explain-cl") qxRender();
 if(id==="explain-std") qxStd();
 renderAll();
 window.scrollTo(0,0);
}
function setSub(s){
 if(["nav","lib","sb","calc"].indexOf(s)<0) s="nav"; SUB=s;
 document.querySelectorAll("#qtSub [data-sub]").forEach(function(b){ b.setAttribute("aria-pressed",b.getAttribute("data-sub")===s?"true":"false"); });
 document.querySelectorAll(".qt-pane").forEach(function(p){ p.hidden=p.getAttribute("data-pane")!==s; });
 if(s==="sb") renderPage();
}
document.addEventListener("click",function(e){
 var b=e.target.closest("[data-go]"); if(b && !b.closest("#cb")){ go(b.getAttribute("data-go")); }
 var sb=e.target.closest("#qtSub [data-sub]"); if(sb){ setSub(sb.getAttribute("data-sub")); }
});

/* ---------- other platform tools: inside the hub in the overlay, outside it in a new tab ---------- */
function inHub(){ try{ return window.self!==window.top && window.parent && typeof window.parent.ciaOpenFile==="function"; }catch(e){ return false; } }
function openPlat(k,tab){
 if(!k){ go("tools"); setSub(tab==="calc"?"calc":"sb"); return; }
 var f=QTC.FILES[k]; if(!f) return;
 if(inHub()){ try{ if(window.parent.ciaOpenFile(f,tab)) return; }catch(e){} }
 try{ window.open("./"+f+(tab?"#"+tab:""),"_blank","noopener"); }catch(e){}
}
function openRec(k,id){
 var f=QTC.FILES[k], nav=QTC.NAV[k]; if(!f) return;
 if(!nav||!id){ openPlat(k,"tools"); return; }
 if(inHub()){ try{ sessionStorage.setItem(nav,JSON.stringify({open:id})); }catch(e){} try{ if(window.parent.ciaOpenFile(f)) return; }catch(e){} try{ sessionStorage.removeItem(nav); }catch(e){} }
 try{ window.open("./"+f+"?open="+encodeURIComponent(id)+"#tools","_blank","noopener"); }catch(e){}
}
function recsOf(key){ var S=TBX.read(key); if(!S) return null; return (Array.isArray(S.records)?S.records:[]).filter(function(r){ return r&&typeof r==="object"&&str(r.id); }); }
function recList(k){ return (recsOf(QTC.REC[k])||[]).map(function(r){ return {id:str(r.id),t:str(r.title)||str(r.ref)||str(r.id)}; }); }
function explain(code){ if(window.CIAEX&&CIAEX.ensure&&CIAEX.ensure()&&CIAEX.openCode) CIAEX.openCode(code); }

/* ---------- tool card pieces ---------- */
function teamTxt(x){ return x==="team"?t("t_team"):(x==="ind"?t("t_ind"):(x==="both"?t("t_both"):t("t_x"))); }
function attrs(T0){
 return '<div class="qt-attrs"><span>'+esc(nm(QTC.AREAS[T0.area]))+'</span><span>'+esc(teamTxt(T0.team))+'</span>'+(T0.data?'<span>'+esc(t("f_data"))+': '+esc(t("data_"+T0.data))+'</span>':'')+
  '<span class="cap" title="'+esc(t("capT"))+'">'+dots(T0.cap)+'</span>'+(T0.eff?'<span>'+esc(t("eff_"+T0.eff))+'</span>':'')+(T0.ps==="mfg"?'<span>'+esc(t("ps_mfg"))+'</span>':'')+'</div>';
}
function lvBadge(T0){ var plan=T0.plat.some(function(p){ return p.lvl==="plan"; }); return '<span class="qt-lv '+T0.lv+'">'+esc(t("lv_"+T0.lv))+'</span>'+(plan?' <span class="qt-lv here">'+esc(t("lv_plan"))+'</span>':''); }
function pdcaTxt(T0){
 var parts=[]; CTXS.forEach(function(c){ var a=T0.pdca[c]||[]; if(!a.length) return; parts.push(t("ctxS_"+c)+": "+a.map(function(p){ return t("ph_"+p[0])+(p.length>1?" "+t("annexR"):""); }).join(L==="ar"?"، ":", ")); });
 return parts.length?parts.join(L==="ar"?" · ":" · "):t("annexNone");
}
function platBtns(T0){
 return T0.plat.filter(function(p){ return p.lvl!=="plan"; }).map(function(p){ var lab=p.k?nm(QTC.NAMES[p.k]):t(p.tab==="calc"?"sCalc":"sSb"); return '<button class="pd-rowbtn" type="button" data-plat="'+esc(p.k)+'" data-ptab="'+esc(p.tab)+'">'+esc(lab)+' ↗</button>'; }).join("");
}
function cardActs(T0,ph){ return '<div class="qt-acts"><button class="pd-rowbtn" type="button" data-qxopen="'+esc(T0.c)+'">'+esc(qx("xFull"))+'</button><button class="pd-rowbtn" type="button" data-exp="'+esc(T0.c)+'">'+esc(t("btnExplain"))+'</button>'+platBtns(T0)+'<button class="pd-rowbtn" type="button" data-addt="'+esc(T0.id)+'" data-addp="'+esc(ph||"")+'">'+esc(t("btnAdd"))+'</button></div>'; }

/* ---------- navigator ---------- */
function buildNavFields(){
 var box=document.getElementById("navFields"); if(!box) return; var N=DB.nav;
 var sel=function(id,lab,opts,cur,anyOk){ return '<div class="pd-f"><label for="'+id+'">'+esc(t(lab))+'</label><select id="'+id+'">'+(anyOk?'<option value="">'+esc(t("any"))+'</option>':'')+opts.map(function(o){ return '<option value="'+o[0]+'"'+(String(cur)===String(o[0])?" selected":"")+'>'+esc(o[1])+'</option>'; }).join("")+'</select></div>'; };
 box.innerHTML=sel("nAim","f_aim",AIMS.map(function(a){ return [a,t("aim_"+a)]; }),N.aim,true)+
  sel("nCtx","f_ctx",CTXS.map(function(c){ return [c,t("ctx_"+c)]; }),N.ctx,true)+
  sel("nPh","f_ph",PH.map(function(p){ return [p,t("ph_"+p)]; }),N.ph,true)+
  sel("nWho","f_who",[["team",t("who_team")],["ind",t("who_ind")]],N.who,true)+
  sel("nData","f_data",DATAS.map(function(d){ return [d,t("data_"+d)]; }),N.data,false)+
  sel("nCap","f_cap",[["1",t("cap1")],["2",t("cap2")],["3",t("cap3")]],N.cap,false)+
  sel("nEff","f_eff",[["easy",t("eff_easy")],["medium",t("eff_medium")]],N.eff,true);
 document.getElementById("navPlat").checked=!!N.plat;
}
function readNav(){ var g=function(id){ var e=document.getElementById(id); return e?e.value:""; };
 DB.nav=fixNav({aim:g("nAim"),ctx:g("nCtx"),ph:g("nPh"),who:g("nWho"),data:g("nData"),cap:g("nCap"),eff:g("nEff"),plat:!!(document.getElementById("navPlat")||{}).checked}); persist(); }
function fitTool(T0,f){
 var s=0, ok=[], wn=[], max=3;
 if(f.aim){ max+=3; if(T0.aims.indexOf(f.aim)>=0){ s+=3; ok.push(t("r_aim",{a:t("aim_"+f.aim)})); } else s-=1; }
 if(f.ph){ max+=3; var cs=f.ctx?[f.ctx]:CTXS, hit=null;
  cs.forEach(function(c){ if(hit) return; var a=T0.pdca[c]||[]; if(a.indexOf(f.ph)>=0) hit={c:c,r:0}; else if(a.indexOf(f.ph+"*")>=0) hit={c:c,r:1}; });
  if(hit){ s+=hit.r?2:3; ok.push(t(hit.r?"r_phR":"r_ph",{p:t("ph_"+f.ph),c:t("ctxS_"+hit.c)})); } else s-=1; }
 else if(f.ctx){ max+=2; if((T0.pdca[f.ctx]||[]).length){ s+=2; ok.push(t("r_ctx",{c:t("ctxS_"+f.ctx)})); } }
 if(f.who){ max+=1; if(f.who==="ind"&&T0.team==="team"){ s-=2; wn.push(t("w_team")); } else if(T0.team){ s+=1; ok.push(t("r_who")); } }
 var need=DR[T0.data]||0, have=DR[f.data]||0; if(need>have){ s-=2; wn.push(t("w_data",{d:t("data_"+T0.data)})); } else { s+=1; if(need) ok.push(t("r_data")); }
 if(T0.cap>Number(f.cap||1)){ s-=2; wn.push(t("w_cap"+T0.cap)); } else { s+=1; ok.push(t("r_cap")); }
 if(f.eff&&(ER[T0.eff]||0)>(ER[f.eff]||0)){ s-=1; wn.push(t("w_eff",{e:t("eff_"+T0.eff)})); }
 if(["own","in","here"].indexOf(T0.lv)>=0){ s+=1; ok.push(t("r_plat")); }
 return {s:s,ok:ok,wn:wn,fit:Math.max(0,Math.min(100,Math.round(s/max*100)))};
}
function navResults(){
 var f=DB.nav;
 return TL.filter(function(T0){ return !f.plat||["own","in","here"].indexOf(T0.lv)>=0; }).map(function(T0){ var x=fitTool(T0,f); x.T=T0; return x; })
  .filter(function(x){ return x.s>2; }).sort(function(a,b){ return b.s-a.s||a.wn.length-b.wn.length||cmpCode(a.T.c,b.T.c); });
}
function cmpCode(a,b){ var x=a.split(".").map(Number), y=b.split(".").map(Number); return x[0]-y[0]||(x[1]||0)-(y[1]||0); }
function phFor(T0){ var f=DB.nav; if(f.ph) return f.ph; var cs=f.ctx?[f.ctx]:CTXS; for(var i=0;i<cs.length;i++){ var a=T0.pdca[cs[i]]||[]; if(a.length) return a[0][0]; } return "P"; }
function renderNav(){
 var box=document.getElementById("navRes"); if(!box) return;
 var R=navResults();
 document.getElementById("navResS").textContent=R.length?t("navResS",{n:R.length}):"";
 if(!R.length){ box.innerHTML='<div class="pd-empty" style="grid-column:1/-1">'+esc(t("navNone"))+'</div>'; return; }
 box.innerHTML=R.slice(0,12).map(function(x){ var T0=x.T;
  return '<article class="qt-card" style="--qc:'+SECCOL[T0.sec]+'"><h3><code>'+esc(T0.c)+'</code><span>'+esc(nm(T0.n))+'</span><span class="qt-fit">'+esc(t("fit",{p:x.fit}))+'</span></h3>'+lvBadge(T0)+attrs(T0)+
   '<p>'+esc(short(nm(T0.d),170))+'</p><ul class="qt-why">'+x.ok.map(function(o){ return '<li class="ok">'+esc(o)+'</li>'; }).join("")+x.wn.map(function(o){ return '<li class="wn">'+esc(o)+'</li>'; }).join("")+'</ul>'+cardActs(T0,phFor(T0))+'</article>';
 }).join("");
}
document.getElementById("navFields").addEventListener("change",function(){ readNav(); renderNav(); });
document.getElementById("navPlat").addEventListener("change",function(){ readNav(); renderNav(); });
document.getElementById("navReset").addEventListener("click",function(){ DB.nav=fixNav({}); persist(); buildNavFields(); renderNav(); document.getElementById("navMsg").textContent=""; });

/* ---------- library ---------- */
function buildLibFilters(){
 var s=document.getElementById("libSec"), v=document.getElementById("libLv"); if(!s) return; var cs=s.value, cv=v.value;
 s.innerHTML='<option value="">'+esc(t("allSec"))+'</option>'+QTC.CL.map(function(c){ return '<option value="'+c[0]+'">'+esc(c[0]+" "+nm(c[1]))+'</option>'; }).join("");
 v.innerHTML='<option value="">'+esc(t("allLv"))+'</option>'+LVS.map(function(k){ return '<option value="'+k+'">'+esc(t("lv_"+k))+'</option>'; }).join("");
 s.value=cs; v.value=cv; document.getElementById("libQ").placeholder=t("libQ");
}
function libNorm(x){ return String(x||"").replace(/[ً-ْـ]/g,"").replace(/[أإآ]/g,"ا").replace(/ة/g,"ه").replace(/ى/g,"ي").toLowerCase(); }
function libMatch(T0,q){ if(!q) return true; var h=libNorm([T0.c,T0.n.ar,T0.n.en,T0.area?QTC.AREAS[T0.area].ar:"",T0.area?QTC.AREAS[T0.area].en:"",T0.id].join(" ")); return libNorm(q).split(/\s+/).every(function(w){ return h.indexOf(w)>=0; }); }
function renderLib(){
 var box=document.getElementById("libBox"); if(!box) return;
 var q=document.getElementById("libQ").value.trim(), sec=document.getElementById("libSec").value, lv=document.getElementById("libLv").value, n=0, h="";
 QTC.CL.forEach(function(c){ if(sec&&sec!==c[0]) return;
  var ts=TL.filter(function(T0){ return T0.sec===c[0]&&(!lv||T0.lv===lv)&&libMatch(T0,q); }); n+=ts.length;
  var oth=QTC.O.filter(function(o){ return o[0].split(".")[0]===c[0]; });
  if(!ts.length&&(q||lv)) return;
  h+='<div class="qt-sech"><h2>'+esc(c[0]+" · "+nm(c[1]))+'</h2><small>ISO 9001:2026 '+esc(c[2])+'</small></div><div class="qt-grid">'+ts.map(function(T0){
   return '<article class="qt-card" id="lib-'+esc(T0.id)+'" style="--qc:'+SECCOL[T0.sec]+'"><h3><code>'+esc(T0.c)+'</code><span>'+esc(nm(T0.n))+'</span></h3>'+lvBadge(T0)+attrs(T0)+'<p>'+esc(nm(T0.d))+'</p>'+
    '<details><summary>'+esc(t("dMore"))+'</summary><h4>'+esc(t("dUse"))+'</h4><ul>'+T0.use.map(function(u){ return '<li>'+esc(nm(u))+'</li>'; }).join("")+'</ul><h4>'+esc(t("dBen"))+'</h4><ul>'+T0.ben.map(function(u){ return '<li>'+esc(nm(u))+'</li>'; }).join("")+'</ul>'+
    '<h4>'+esc(t("dNote"))+'</h4><ul>'+T0.note.map(function(u){ return '<li>'+esc(nm(u))+'</li>'; }).join("")+'</ul><h4>'+esc(t("dPdca"))+'</h4><p>'+esc(pdcaTxt(T0))+'</p><h4>'+esc(t("dOut"))+'</h4><p>'+esc(nm(T0.out))+'</p><h4>'+esc(t("dEx"))+'</h4><p>'+esc(nm(T0.ex))+'</p>'+
    '<h4>'+esc(qx("xSteps"))+'</h4><ol>'+T0.st.map(function(u){ return '<li>'+esc(nm(u))+'</li>'; }).join("")+'</ol><h4>'+esc(qx("xAud"))+'</h4><ul>'+T0.aud.map(function(u){ return '<li>'+esc(nm(u))+'</li>'; }).join("")+'</ul></details>'+cardActs(T0,phFor(T0))+'</article>';
  }).join("")+'</div>'+(oth.length&&!q&&!lv?'<div class="qt-other"><b>'+esc(t("otherT",{c:oth[0][0]}))+'</b> — '+esc(t("otherNamed"))+'<ul>'+oth.map(function(o){ return '<li>'+esc(nm(o[1]))+(o[2].length?' '+o[2].map(function(p){ return '<button class="pd-rowbtn" type="button" data-plat="'+esc(p.k)+'" data-ptab="'+esc(p.tab)+'">'+esc(nm(QTC.NAMES[p.k]))+' ↗</button>'; }).join(""):'')+'</li>'; }).join("")+'</ul></div>':'');
 });
 box.innerHTML=h||'<div class="pd-empty">'+esc(t("navNone"))+'</div>';
 document.getElementById("libCnt").textContent=t("libCnt",{n:n});
}
["libQ","libSec","libLv"].forEach(function(id){ document.getElementById(id).addEventListener(id==="libQ"?"input":"change",renderLib); });
function focusTool(id){ var T0=BYID[id]||BYC[id]; if(!T0) return false; go("tools"); setSub("lib"); document.getElementById("libQ").value=""; document.getElementById("libSec").value=T0.sec; document.getElementById("libLv").value=""; renderLib();
 var el=document.getElementById("lib-"+T0.id); if(el){ el.scrollIntoView({block:"center"}); el.classList.add("ex-hl"); setTimeout(function(){ el.classList.remove("ex-hl"); },2600); } return true; }

/* shared card actions */
document.addEventListener("click",function(e){
 var x=e.target.closest("[data-exp]"); if(x){ explain(x.getAttribute("data-exp")); return; }
 var f=e.target.closest("[data-qxopen]"); if(f){ qxTool(f.getAttribute("data-qxopen")); return; }
 var p=e.target.closest("[data-plat]"); if(p){ openPlat(p.getAttribute("data-plat"),p.getAttribute("data-ptab")); return; }
 var a=e.target.closest("[data-addt]"); if(a){ addToSb(a.getAttribute("data-addt"),a.getAttribute("data-addp")||"P"); return; }
});

/* ---------- storyboard form ---------- */
function newEditing(){ editing=blank(); dirty=false; }
var HDR=[["title","tx",1],["ref","ltr",0],["ctx","sel:CTX",0],["aim","sel:AIM",0],["owner","tx",0],["fac","tx",0],["area","tx",0],["start","date",0],["data","sel:DATA",0],["team","ta",0],["problem","ta",1],["is","ta",0],["isnot","ta",0]];
var LAB={title:"f_title",ref:"f_ref",ctx:"f_ctx2",aim:"f_aim2",owner:"f_owner",fac:"f_fac",area:"f_area",start:"f_start",data:"f_data2",team:"f_team",problem:"f_problem",is:"f_is",isnot:"f_isnot",result:"f_result",std:"f_std",lessons:"f_lessons",review:"f_review"};
var END=[["result","ta",0],["std","ta",0],["lessons","ta",0],["review","date",0]];
function optList(kind){ if(kind==="CTX") return CTXS.map(function(c){ return [c,t("ctx_"+c)]; }); if(kind==="AIM") return AIMS.map(function(a){ return [a,t("aim_"+a)]; }); return DATAS.map(function(d){ return [d,t("data_"+d)]; }); }
function fieldHTML(f,r){
 var k=f[0], ty=f[1], id="f-"+k, v=str(r[k]), lab='<label for="'+id+'">'+esc(t(LAB[k]))+'</label>', w=f[2]?' wide':'';
 if(ty==="ta") return '<div class="pd-f'+w+'">'+lab+'<textarea id="'+id+'" data-f="'+k+'">'+esc(v)+'</textarea></div>';
 if(ty==="date") return '<div class="pd-f'+w+'">'+lab+'<input type="date" id="'+id+'" data-f="'+k+'" dir="ltr" value="'+esc(v)+'"></div>';
 if(ty.indexOf("sel:")===0) return '<div class="pd-f'+w+'">'+lab+'<select id="'+id+'" data-f="'+k+'"><option value="">'+esc(t("sel"))+'</option>'+optList(ty.slice(4)).map(function(o){ return '<option value="'+o[0]+'"'+(v===o[0]?" selected":"")+'>'+esc(o[1])+'</option>'; }).join("")+'</select></div>';
 return '<div class="pd-f'+w+'">'+lab+'<input type="text" id="'+id+'" data-f="'+k+'"'+(ty==="ltr"?' dir="ltr"':'')+' value="'+esc(v)+'"></div>';
}
function toolOpts(cur){
 return '<option value="">'+esc(t("sel"))+'</option>'+QTC.CL.map(function(c){ return '<optgroup label="'+esc(c[0]+" "+nm(c[1]))+'">'+TL.filter(function(T0){ return T0.sec===c[0]; }).map(function(T0){ return '<option value="'+T0.id+'"'+(cur===T0.id?" selected":"")+'>'+esc(T0.c+" "+nm(T0.n))+'</option>'; }).join("")+'</optgroup>'; }).join("")+
  '<option value="other"'+(cur==="other"?" selected":"")+'>'+esc(t("o_other"))+'</option>';
}
function linkHTML(s,i){
 var T0=toolOf(s); if(!T0) return "";
 var k=T0.own;
 if(k){ var L1=recList(k), opts='<option value="">'+esc(t("sel"))+'</option>'+L1.map(function(r){ return '<option value="'+esc(r.id)+'"'+(s.rid===r.id?" selected":"")+'>'+esc(short(r.id+" · "+r.t,70))+'</option>'; }).join("");
  var found=s.rid?L1.filter(function(r){ return r.id===s.rid; })[0]:null;
  if(s.rid&&!found) opts+='<option value="'+esc(s.rid)+'" selected>'+esc(s.rid)+'</option>';
  var prev=s.rid?(found?'<div class="qt-prev">'+esc(t("recPrev",{id:found.id,t:short(found.t,90)}))+'</div>':'<div class="qt-prev miss">'+esc(t("recMiss",{id:s.rid}))+'</div>'):(L1.length?"":'<p class="qt-hint">'+esc(t("recNone"))+'</p>');
  return '<div class="pd-f"><label for="st-'+i+'-rid">'+esc(t("s_rec",{t:nm(QTC.NAMES[k])}))+'</label><select id="st-'+i+'-rid" data-s="'+i+'" data-k="rid">'+opts+'</select></div>'+prev+
   '<div class="qt-acts"><button class="pd-rowbtn" type="button" data-orec="'+esc(k)+'" data-oid="'+esc(s.rid)+'">'+esc(s.rid?t("openRec"):t("openPlat"))+'</button></div>';
 }
 var pb=platBtns(T0); return pb?'<div class="qt-acts">'+pb+'</div>':'<p class="qt-hint">'+esc(t("notOnPlat"))+'</p>';
}
function annexNote(s){
 var T0=toolOf(s); if(!T0) return "";
 var c=editing.ctx, a=c?(T0.pdca[c]||[]):[];
 if(c&&a.length&&!a.some(function(p){ return p[0]===s.ph; })) return '<p class="qt-hint wn">'+esc(t("annexOff",{c:t("ctxS_"+c),p:t("ph_"+s.ph)}))+'</p>';
 return '<p class="qt-hint">'+esc(t("annexHint",{l:pdcaTxt(T0)}))+'</p>';
}
function stepHTML(s,i){
 var id="st-"+i, T0=toolOf(s);
 return '<div class="qt-step" data-step="'+i+'"><div class="pd-f"><label for="'+id+'-tool">'+esc(t("s_tool"))+'</label><select id="'+id+'-tool" data-s="'+i+'" data-k="tool">'+toolOpts(s.tool)+'</select></div>'+
  (s.tool==="other"?'<div class="pd-f"><label for="'+id+'-other">'+esc(t("s_other"))+'</label><input type="text" id="'+id+'-other" data-s="'+i+'" data-k="other" value="'+esc(s.other)+'"></div>':'')+
  annexNote(s)+
  '<div class="pd-f"><label for="'+id+'-why">'+esc(t("s_why"))+'</label><textarea id="'+id+'-why" data-s="'+i+'" data-k="why">'+esc(s.why)+'</textarea></div>'+
  '<div class="pd-f"><label for="'+id+'-out">'+esc(t("s_out"))+'</label><textarea id="'+id+'-out" data-s="'+i+'" data-k="out">'+esc(s.out)+'</textarea></div>'+
  '<div class="qt-row2"><div class="pd-f"><label for="'+id+'-who">'+esc(t("s_who"))+'</label><input type="text" id="'+id+'-who" data-s="'+i+'" data-k="who" value="'+esc(s.who)+'"></div>'+
  '<div class="pd-f"><label for="'+id+'-st">'+esc(t("s_st"))+'</label><select id="'+id+'-st" data-s="'+i+'" data-k="st">'+STS.map(function(x){ return '<option value="'+x+'"'+(s.st===x?" selected":"")+'>'+esc(t("st_"+x))+'</option>'; }).join("")+'</select></div></div>'+
  '<div class="pd-f"><label for="'+id+'-date">'+esc(t("s_date"))+'</label><input type="date" id="'+id+'-date" dir="ltr" data-s="'+i+'" data-k="date" value="'+esc(s.date)+'"></div>'+
  linkHTML(s,i)+'<div class="qt-acts"><button class="pd-rowbtn arm" type="button" data-rm="'+i+'">'+esc(t("rmStep"))+'</button>'+(T0?'<button class="pd-rowbtn" type="button" data-exp="'+esc(T0.c)+'">'+esc(t("btnExplain"))+'</button>':'')+'</div></div>';
}
function renderForm(){
 if(!editing) newEditing();
 var r=editing;
 document.getElementById("rid").value=r.id;
 document.getElementById("hdrFields").innerHTML=HDR.map(function(f){ return fieldHTML(f,r); }).join("");
 document.getElementById("endFields").innerHTML=END.map(function(f){ return fieldHTML(f,r); }).join("");
 renderLanes(); refreshForm();
}
function renderLanes(){
 var r=editing, box=document.getElementById("lanes");
 box.innerHTML=PH.map(function(p){ var idx=[]; r.steps.forEach(function(s,i){ if(s.ph===p) idx.push(i); });
  return '<section class="qt-lane" style="--pc:'+PCOL[p]+'" aria-label="'+esc(t("ph_"+p))+'"><h3><i>'+p+'</i>'+esc(t("ph_"+p))+'</h3><p>'+esc(t("lane"+p))+'</p>'+idx.map(function(i){ return stepHTML(r.steps[i],i); }).join("")+
   '<button class="qt-add" type="button" data-addph="'+p+'">'+esc(t("addStep",{p:t("ph_"+p)}))+'</button></section>'; }).join("");
}
function readForm(){
 if(!editing) return;
 document.querySelectorAll("#rec-form [data-f]").forEach(function(el){ editing[el.getAttribute("data-f")]=el.value; });
 document.querySelectorAll("#rec-form [data-s]").forEach(function(el){ var i=Number(el.getAttribute("data-s")), k=el.getAttribute("data-k"); if(editing.steps[i]) editing.steps[i][k]=el.value; });
}
function refreshForm(){
 if(!editing) return;
 var st=stageOf(editing), b=document.getElementById("curStage");
 if(b){ b.textContent=stageName(st)+(dirty?" · "+t("unsaved"):""); b.style.background=SCOL[st]; b.style.color="#fff"; }
 if(SUB==="sb") renderPage();
}
var pgT=null;
document.getElementById("rec-form").addEventListener("input",function(e){ readForm(); dirty=true; clearTimeout(pgT); pgT=setTimeout(refreshForm,120); document.getElementById("recOk").textContent=""; });
document.getElementById("rec-form").addEventListener("change",function(e){
 readForm(); dirty=true;
 var k=e.target.getAttribute("data-k"), f=e.target.getAttribute("data-f");
 if(k==="tool"){ var i=Number(e.target.getAttribute("data-s")); editing.steps[i].rid=""; renderLanes(); var n=document.getElementById("st-"+i+"-tool"); if(n) n.focus(); }
 else if(k==="rid"){ renderLanes(); }
 else if(f==="ctx"){ renderLanes(); }
 refreshForm();
});
document.getElementById("rec-form").addEventListener("click",function(e){
 var a=e.target.closest("[data-addph]"); if(a){ readForm(); addStep(a.getAttribute("data-addph"),""); return; }
 var r=e.target.closest("[data-rm]"); if(r){ readForm(); editing.steps.splice(Number(r.getAttribute("data-rm")),1); dirty=true; renderLanes(); refreshForm(); return; }
 var o=e.target.closest("[data-orec]"); if(o){ openRec(o.getAttribute("data-orec"),o.getAttribute("data-oid")); return; }
});
function addStep(ph,tool,out){
 if(editing.steps.length>=MAXSTEPS){ document.getElementById("recErr").textContent=t("maxSteps"); return false; }
 var s=blankStep(ph); s.tool=tool||""; s.out=out||""; s.id="s"+Date.now().toString(36)+Math.random().toString(36).slice(2,5);
 editing.steps.push(s); dirty=true; renderLanes(); refreshForm();
 var i=editing.steps.length-1, n=document.getElementById("st-"+i+"-tool"); if(n&&!tool) n.focus();
 return true;
}
function addToSb(id,ph,out){
 var T0=BYID[id]; if(!T0) return;
 if(!editing) newEditing(); else readForm();
 go("tools"); setSub("sb");
 if(addStep(pick(ph,PH)||"P",id,out)){ var m=document.getElementById("recOk"); m.textContent=t("added",{t:T0.c+" "+nm(T0.n),p:t("ph_"+(pick(ph,PH)||"P"))}); var el=document.querySelector('[data-step="'+(editing.steps.length-1)+'"]'); if(el&&el.scrollIntoView) el.scrollIntoView({block:"center"}); }
}
function validate(r){
 if(!txt(r.title)) return t("errTitle");
 if(isD(r.start)&&isD(r.review)&&r.review<r.start) return t("errReview");
 var bad=r.steps.filter(function(s){ return !s.tool; })[0]; if(bad) return t("errStep",{p:t("ph_"+bad.ph)});
 return "";
}
function newId(){ var n=DB.records.length+1, id; do{ id="QT-"+String(n).padStart(3,"0"); n++; }while(DB.records.some(function(r){ return r.id===id; })); return id; }
function saveRecord(){
 readForm(); var r=fixRec(JSON.parse(JSON.stringify(editing))), err=validate(editing), box=document.getElementById("recErr"), ok=document.getElementById("recOk");
 box.textContent=err; ok.textContent=""; if(err) return;
 if(!r.id) r.id=newId(); r.created=editing.created||today(); r.updated=today();
 var i=DB.records.findIndex(function(x){ return x.id===r.id; }); if(i>=0) DB.records[i]=r; else DB.records.push(r);
 var saved=persist(); editing=JSON.parse(JSON.stringify(r)); dirty=false;
 document.getElementById("rid").value=r.id; ok.textContent=saved?t("saved"):t("savedFail");
 renderAll(); refreshForm();
}
function loadRecordIntoForm(r){ editing=JSON.parse(JSON.stringify(r)); dirty=false; document.getElementById("recErr").textContent=""; document.getElementById("recOk").textContent=""; renderForm(); }
function clearForm(){ newEditing(); document.getElementById("recErr").textContent=""; document.getElementById("recOk").textContent=""; renderForm(); }
document.getElementById("rec-form").addEventListener("submit",function(e){ e.preventDefault(); saveRecord(); });
document.getElementById("newBtn").addEventListener("click",function(){ clearForm(); });

/* storyboard page: one page, four quadrants (Annex B) */
function pageHTML(r,forReport){
 var steps=r.steps.filter(function(s){ return s.tool; });
 if(!txt(r.title)&&!steps.length&&!forReport) return '<p class="pd-sub" style="color:var(--ink-soft)">'+esc(t("pageEmpty"))+'</p>';
 var q=function(p){ var S=r.steps.filter(function(s){ return s.ph===p&&s.tool; });
  return '<div class="qt-q" style="--pc:'+PCOL[p]+'"><h4>'+p+' · '+esc(t("ph_"+p))+'</h4>'+(S.length?'<ol>'+S.map(function(s){ return '<li><b>'+esc(stepName(s))+'</b> <small>('+esc(t("st_"+s.st))+(s.rid?' · '+esc(s.rid):'')+')</small>'+(txt(s.out)?'<br><small>'+esc(short(s.out,140))+'</small>':'')+'</li>'; }).join("")+'</ol>':'<p class="none">'+esc(t("pageNone"))+'</p>')+'</div>'; };
 return '<div class="qt-page"><header><b>'+esc(r.title||"—")+'</b> <span dir="ltr">'+esc(r.ref||"")+'</span><p>'+esc(r.ctx?t("ctx_"+r.ctx):"—")+' · '+esc(r.aim?t("aim_"+r.aim):"—")+(r.owner?' · '+esc(r.owner):'')+'</p>'+(txt(r.problem)?'<p>'+esc(short(r.problem,240))+'</p>':'')+'</header>'+
  q("P")+q("D")+q("C")+q("A")+(txt(r.result)||txt(r.std)?'<footer>'+(txt(r.result)?'<b>'+esc(t("f_result"))+':</b> '+esc(r.result)+'<br>':'')+(txt(r.std)?'<b>'+esc(t("c_act"))+':</b> '+esc(r.std):'')+'</footer>':'')+'</div>';
}
function renderPage(){
 var box=document.getElementById("sbPage"); if(!box||!editing) return;
 box.innerHTML=pageHTML(editing,false);
 var fl=document.getElementById("sbFlags"); var I=(txt(editing.title)||editing.steps.length)?issues(editing):[];
 fl.innerHTML=I.length?'<div style="margin-top:10px">'+I.map(function(x){ return chip(t("oi_"+x[0],x[2]),x[1]); }).join("")+'</div>':"";
}

/* ---------- calculators (9.2 NPS, 10.7 OEE, 12.3 COQ) ---------- */
var CALC=[
 {k:"nps",tool:"nps",c:"9.2",col:"#1E8C93",f:["p","pa","d"],lab:["nps_p","nps_pa","nps_d"]},
 {k:"oee",tool:"oee",c:"10.7",col:"#1E8C93",f:["a","pf","q"],lab:["oee_a","oee_p","oee_q"]},
 {k:"coq",tool:"coq",c:"12.3",col:"#1E8C93",f:["pr","ap","inf","exf","sales"],lab:["coq_pr","coq_ap","coq_in","coq_ex","coq_sales"]}
];
function calcOut(k){
 var v=DB.calc[k], n=function(x){ return num(v[x]); };
 if(k==="nps"){ var p=n("p"),pa=n("pa"),d=n("d"); if(p===null&&pa===null&&d===null) return null; if([p,pa,d].some(function(x){ return x!==null&&(isNaN(x)||x<0); })) return {bad:t("calcBad")};
  p=p||0; pa=pa||0; d=d||0; var tot=p+pa+d; if(!tot) return null; var pp=p/tot*100, dp=d/tot*100, s=Math.round(pp-dp);
  return {v:(s>0?"+":"")+s,line:t("npsOut",{n:tot,pp:fmtN(pp,0),dp:fmtN(dp,0)}),warn:tot<30?t("npsLow"):"",txt:t("npsOut",{n:tot,pp:fmtN(pp,0),dp:fmtN(dp,0)})+" "+(s>0?"+":"")+s}; }
 if(k==="oee"){ var a=n("a"),pf=n("pf"),q=n("q"); if(a===null||pf===null||q===null) return null; if([a,pf,q].some(function(x){ return isNaN(x)||x<0||x>100; })) return {bad:t("calcBadP")};
  var o=a*pf*q/10000, low=[["oee_a",a],["oee_p",pf],["oee_q",q]].sort(function(x,y){ return x[1]-y[1]; })[0];
  return {v:fmtN(o,1)+"%",line:t("oeeOut")+" = "+fmtN(a,1)+"% × "+fmtN(pf,1)+"% × "+fmtN(q,1)+"%",warn:t("oeeLoss",{f:t(low[0]).replace(" %","").replace("%","")}),txt:"OEE "+fmtN(o,1)+"% ("+fmtN(a,1)+" × "+fmtN(pf,1)+" × "+fmtN(q,1)+")"}; }
 var pr=n("pr"),ap=n("ap"),inf=n("inf"),exf=n("exf"),sa=n("sales"); if([pr,ap,inf,exf].every(function(x){ return x===null; })) return null;
 if([pr,ap,inf,exf,sa].some(function(x){ return x!==null&&(isNaN(x)||x<0); })) return {bad:t("calcBad")};
 pr=pr||0; ap=ap||0; inf=inf||0; exf=exf||0; var tot2=pr+ap+inf+exf; if(!tot2) return null; var copq=inf+exf;
 var line=t("coqOut",{tot:fmtN(tot2,0),copq:fmtN(copq,0),cp:fmtN(copq/tot2*100,0)});
 return {v:fmtN(tot2,0),line:line,warn:sa?t("coqShare",{s:fmtN(tot2/sa*100,1)}):"",txt:line+(sa?" · "+t("coqShare",{s:fmtN(tot2/sa*100,1)}):"")};
}
function renderCalcs(){
 var box=document.getElementById("calcBox"); if(!box) return;
 box.innerHTML=CALC.map(function(C1){ var v=DB.calc[C1.k];
  return '<section class="qt-calc" style="--qc:'+C1.col+'" aria-labelledby="calc-'+C1.k+'-t"><h3 id="calc-'+C1.k+'-t"><code>'+C1.c+'</code>'+esc(t(C1.k+"T"))+'</h3><p>'+esc(t(C1.k+"S"))+'</p><div class="pd-fields">'+
   C1.f.map(function(f,j){ var id="cl-"+C1.k+"-"+f; return '<div class="pd-f"><label for="'+id+'">'+esc(t(C1.lab[j]))+'</label><input type="number" inputmode="decimal" min="0" step="any" dir="ltr" id="'+id+'" data-ck="'+C1.k+'" data-cf="'+f+'" value="'+esc(v[f])+'"></div>'; }).join("")+
   '</div><div class="qt-out" id="calc-'+C1.k+'-o" role="status" aria-live="polite"></div><div class="qt-acts"><button class="pd-rowbtn" type="button" data-cto="'+C1.k+'">'+esc(t("toSb"))+'</button><button class="pd-rowbtn" type="button" data-exp="'+C1.c+'">'+esc(t("btnExplain"))+'</button></div></section>'; }).join("");
 CALC.forEach(function(C1){ showCalc(C1.k); });
}
function showCalc(k){ var o=calcOut(k), el=document.getElementById("calc-"+k+"-o"); if(!el) return;
 el.className="qt-out"+(o&&o.bad?" wn":"");
 el.innerHTML=!o?esc(t("calcNone")):(o.bad?esc(o.bad):'<b>'+esc(o.v)+'</b><br>'+esc(o.line)+(o.warn?'<br><small>'+esc(o.warn)+'</small>':'')); }
document.getElementById("calcBox").addEventListener("input",function(e){ var k=e.target.getAttribute("data-ck"); if(!k) return; DB.calc[k][e.target.getAttribute("data-cf")]=e.target.value; persist(); showCalc(k); });
document.getElementById("calcBox").addEventListener("click",function(e){ var b=e.target.closest("[data-cto]"); if(!b) return; var k=b.getAttribute("data-cto"), o=calcOut(k); if(!o||o.bad){ showCalc(k); return; } addToSb(k,"C",o.txt); });

/* ---------- home ---------- */
function covCounts(list){ var c={own:0,in:0,here:0,rel:0,none:0}; list.forEach(function(T0){ c[T0.lv]++; }); return c; }
function covBar(c,n){ return '<div class="qt-covbar" role="img" aria-label="'+esc(LVS.map(function(k){ return t("lv_"+k)+" "+c[k]; }).join(", "))+'">'+LVS.map(function(k){ return c[k]?'<i style="width:'+(c[k]/n*100)+'%;background:'+LVCOL[k]+'"></i>':''; }).join("")+'</div>'; }
function covLegend(c){ return '<ul class="qt-leg">'+LVS.map(function(k){ return '<li><i style="background:'+LVCOL[k]+'"></i>'+esc(t("lv_"+k))+' <b>'+c[k]+'</b></li>'; }).join("")+'</ul>'; }
function renderHome(){
 var box=document.getElementById("homeCovBox"); if(box){ var c=covCounts(TL); box.innerHTML=covBar(c,TL.length)+covLegend(c)+'<p class="pd-sub" style="margin:10px 0 0;font-size:13.5px">'+esc(t("covMore"))+'</p>'; }
 var n=0; Object.keys(QTC.REC).forEach(function(k){ n+=(recsOf(QTC.REC[k])||[]).length; });
 var h=document.getElementById("homeImp"); if(h){ h.hidden=!n||DB.records.length>0; if(n) document.getElementById("homeImpT").textContent=t("hmT",{n:n}); }
}
document.getElementById("homeImpGo").addEventListener("click",function(){ go("tools"); setSub("sb"); });

/* ---------- self-assessment ---------- */
var AQ=[
 ["SL1",{ar:"هل نختار أداة الجودة بغرضها ومرحلة العمل في دورة PDCA (كما في الملحق A)، لا بالعادة؟",en:"Do we choose a quality tool for its purpose and the PDCA phase of the work (as in Annex A), not out of habit?"}],
 ["SL2",{ar:"قبل استخدام أداة، هل نراجع ما تحتاجه: فريق أم فرد، وكم من البيانات، وأي كفاءة، وكم من الجهد (الملحق C)؟",en:"Before using a tool, do we check what it needs: a team or one person, how much data, what capability, how much effort (Annex C)?"}],
 ["SL3",{ar:"هل لدينا مجموعة أدوات معتمدة لعملياتنا، مكتوبة في الإجراءات أو دليل داخلي، مع أمثلة من عملنا؟",en:"Do we have an agreed set of tools for our processes, written into procedures or an in-house guide, with examples from our work?"}],
 ["CP1",{ar:"هل نعرف الأدوات التي تحتاج تدريباً أو خبرة (•• و•••)، وندرّب من يقودها قبل استخدامها؟",en:"Do we know which tools need training or experience (•• and •••), and train those who lead them before they are used?"}],
 ["CP2",{ar:"هل يقود الأدوات الجماعية (FMEA والعصف الذهني وعظمة السمكة وSWOT) ميسّر مدرب بحضور الوظائف المعنية؟",en:"Are team tools (FMEA, brainstorming, fishbone, SWOT) led by a trained facilitator with the functions concerned present?"}],
 ["DT1",{ar:"هل نتحقق من كفاية البيانات ومن أن القياس يُوثق به (المعايرة أو دراسة القياس) قبل التحليل؟",en:"Do we check that the data are enough and that the measurement can be trusted (calibration or a measurement study) before analysing?"}],
 ["DT2",{ar:"هل يبدأ كل حل لمشكلة ببيان مشكلة واضح يتفق عليه الفريق (ما هو / ما ليس)؟",en:"Does every problem solving start with a clear problem statement the team agrees (is / is not)?"}],
 ["DT3",{ar:"هل رسومنا صادقة وسهلة القراءة: فترة ومصدر معلنان، وأرقام بجانب الألوان، ولا مقاييس مضللة؟",en:"Are our charts honest and readable: a stated period and source, numbers next to colours, no misleading scales?"}],
 ["TM1",{ar:"هل تشرك الأدوات الجماعية من يؤدون العمل فعلاً، والعميل حين يفيد؟",en:"Do team tools actually involve the people who do the work, and the customer where useful?"}],
 ["TM2",{ar:"هل ندعو وجهات نظر مختلفة (أشخاص من خارج المجال، القبعات الست) حتى لا تكون النتيجة رأي شخص واحد؟",en:"Do we invite different views (people from outside the area, six thinking hats) so the result is not one person's opinion?"}],
 ["IN1",{ar:"هل تصل نتائج الأدوات إلى نظام الجودة: المخاطر والفرص (6.1)، والأهداف (6.2)، والإجراءات؟",en:"Do the results of tools reach the quality system: risks and opportunities (6.1), objectives (6.2) and procedures?"}],
 ["IN2",{ar:"بعد الإجراء التصحيحي، هل تُحدَّث FMEA وخطط الضبط ومخططات التدفق والمخاطر (10.2.1 هـ و)؟",en:"After corrective action, are FMEA, control plans, flow charts and risks updated (10.2.1 e–f)?"}],
 ["IN3",{ar:"هل نروي كل تحسين في لوحة قصة من صفحة واحدة تبين الأدوات من المشكلة إلى الإجراء الموحد (الملحق B)؟",en:"Do we tell each improvement as a one-page storyboard showing the tools from the problem to the standard (Annex B)?"}],
 ["RV1",{ar:"هل تُراجع الأدوات «الحية» (SWOT وPESTLE وسجل المخاطر وFMEA وخطة الضبط) بجدول محدد أو بعد التغيير؟",en:"Are the \"living\" tools (SWOT, PESTLE, risk register, FMEA, control plan) reviewed on a set schedule or after change?"}],
 ["RV2",{ar:"هل نتحقق من أن الأداة أوصلت إلى نتيجة (حُلت المشكلة أو تحقق الهدف)، لا أنها عُبئت فقط؟",en:"Do we check that a tool led to a result (the problem solved, the objective met), not just that it was filled in?"}],
 ["RV3",{ar:"هل تصل مخرجات الأدوات (الاتجاهات وباريتو وتكلفة الجودة وNPS) مدخلاتٍ إلى مراجعة الإدارة (9.3.2)؟",en:"Do tool outputs (trends, Pareto, cost of quality, NPS) go into management review as inputs (9.3.2)?"}]
];
var AGROUPS=["SL","CP","DT","TM","IN","RV"];
var GCOL={SL:"#1B2A4A",CP:"#B8901E",DT:"#3563C9",TM:"#1E8C93",IN:"#C2410C",RV:"#3C9A5F"};
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

/* ---------- records list ---------- */
var pendingDelete=null;
function linkedN(r){ return r.steps.filter(function(s){ return s.tool&&txt(s.rid); }).length; }
function renderDocs(){
 var box=document.getElementById("docsBox"); if(!box) return;
 var c0=document.getElementById("cntDocs"); if(c0) c0.textContent=DB.records.length?String(DB.records.length):"";
 if(!DB.records.length){ box.innerHTML='<div class="pd-empty">'+esc(t("none"))+'</div>'; return; }
 box.innerHTML='<table class="qt-tbl"><thead><tr><th>'+esc(t("colRec"))+'</th><th>'+esc(t("colCtx"))+'</th><th>'+esc(t("colStage"))+'</th><th>'+esc(t("colSteps"))+'</th><th>'+esc(t("colAud"))+'</th><th>'+esc(t("colAct"))+'</th></tr></thead><tbody>'+DB.records.map(function(r){
  var st=stageOf(r), a=auditRecord(r), ap=CHECKS.filter(function(k){ return a[k]!==null; }), ps=ap.filter(function(k){ return a[k]; }).length, S=r.steps.filter(function(s){ return s.tool; });
  var del=(pendingDelete===r.id)?'<button class="pd-rowbtn arm" type="button" data-del="'+esc(r.id)+'">'+esc(t("delArm"))+'</button>':'<button class="pd-rowbtn" type="button" data-del="'+esc(r.id)+'">'+esc(t("del"))+'</button>';
  return '<tr><td><b dir="ltr">'+esc(r.ref||"—")+'</b><br>'+esc(r.title)+'<br><small dir="ltr" style="color:var(--muted)">'+esc(r.id)+'</small></td><td>'+esc(r.ctx?t("ctxS_"+r.ctx):"—")+'<br><small>'+esc(r.aim?t("aim_"+r.aim):"—")+'</small></td>'+
   '<td><span class="pd-badge" style="background:'+SCOL[st]+';color:#fff">'+esc(stageName(st))+'</span></td><td>'+esc(t("stepsLine",{n:S.length,d:S.filter(function(s){ return s.st==="done"; }).length,k:linkedN(r)}))+'</td>'+
   '<td dir="ltr">'+(ap.length?ps+"/"+ap.length:"—")+'</td><td><button class="pd-rowbtn" type="button" data-edit="'+esc(r.id)+'">'+esc(t("edit"))+'</button>'+del+'</td></tr>';
 }).join("")+'</tbody></table>';
}
document.getElementById("docsBox").addEventListener("click",function(e){
 var ed=e.target.closest("[data-edit]"); if(ed){ var r=DB.records.filter(function(x){ return x.id===ed.getAttribute("data-edit"); })[0]; if(r){ loadRecordIntoForm(r); go("tools"); setSub("sb"); } return; }
 var d=e.target.closest("[data-del]"); if(d){ var id=d.getAttribute("data-del");
  if(pendingDelete===id){ DB.records=DB.records.filter(function(x){ return x.id!==id; }); pendingDelete=null; persist(); if(editing&&editing.id===id) clearForm(); renderAll(); }
  else { pendingDelete=id; renderDocs(); } }
});

/* ---------- audit ---------- */
function renderAudit(){
 var box=document.getElementById("auBox"); if(!box) return;
 var A=auditSummary();
 document.getElementById("auKpis").innerHTML=TBX.kpi(DB.records.length,t("kTotal"))+TBX.kpi(A.rate===null?"—":A.rate+"%",t("auPass"))+TBX.kpi(openItems().length,t("kOpen"));
 if(!DB.records.length){ box.innerHTML='<div class="pd-empty">'+esc(t("auNone"))+'</div>'; return; }
 box.innerHTML='<table class="pd-tbl"><thead><tr><th>'+esc(t("colRec"))+'</th>'+CHECKS.map(function(k){ return '<th>'+esc(t("c_"+k))+'</th>'; }).join("")+'</tr></thead><tbody>'+
  A.rows.map(function(x){ return '<tr><td><b dir="ltr">'+esc(x.r.ref||x.r.id)+'</b><br><small>'+esc(short(x.r.title,50))+'</small></td>'+TBX.cells(x.res,CHECKS)+'</tr>'; }).join("")+'</tbody></table>';
}

/* ---------- dashboard ---------- */
var USE_C={pdca:"15.6",capa:"14.7",why5:"14.4",fish:"14.5",pareto:"13.7",rca:"14.1",a3:"14.7",dmaic:"16.1",fmea:"7.3"};
function counts(){
 var R=DB.records, steps=[], used={};
 R.forEach(function(r){ r.steps.forEach(function(s){ if(s.tool){ steps.push(s); used[s.tool]=(used[s.tool]||0)+1; } }); });
 return {n:R.length,steps:steps,used:used,linked:steps.filter(function(s){ return txt(s.rid); }).length,linkable:steps.filter(function(s){ return recKey(toolOf(s)); }).length,
  closed:R.filter(function(r){ var s=stageOf(r); return s==="done"||s==="reviewed"; }).length};
}
function renderDash(){
 var k=document.getElementById("dKpis"); if(!k) return;
 var c=counts(), A=auditSummary(), cv=covCounts(TL), onP=cv.own+cv.in+cv.here;
 k.innerHTML=TBX.kpi(c.n,t("kTotal"))+TBX.kpi(A.rate===null?"—":A.rate+"%",t("kAud"))+TBX.kpi(assessScore()+"%",t("kAs"))+TBX.kpi(c.linkable?pct(c.linked,c.linkable):"—",t("kLinked"))+
  TBX.kpi(Object.keys(c.used).length,t("kTools"))+TBX.kpi(c.closed,t("kClosed"))+TBX.kpi(onP+"/"+TL.length,t("kCov"))+TBX.kpi(openItems().length,t("kOpen"));
 document.getElementById("dCov").innerHTML=QTC.CL.map(function(cl){ var ts=TL.filter(function(T0){ return T0.sec===cl[0]; }), cc=covCounts(ts), on=cc.own+cc.in+cc.here;
  return '<div class="qt-covrow"><span>'+esc(cl[0]+" "+nm(cl[1]))+'</span>'+covBar(cc,ts.length)+'<span class="n">'+on+'/'+ts.length+'</span></div>'; }).join("")+covLegend(cv);
 var ns=c.steps.length;
 document.getElementById("dPh").innerHTML=ns?TBX.dist(PH,ns,function(p){ return c.steps.filter(function(s){ return s.ph===p; }).length; },function(p){ return t("ph_"+p); },function(p){ return PCOL[p]; }):'<p class="pd-sub">'+esc(t("dNone"))+'</p>';
 var top=Object.keys(c.used).sort(function(a,b){ return c.used[b]-c.used[a]||(a==="other"?1:0)-(b==="other"?1:0); }).slice(0,8), mx=top.length?c.used[top[0]]:1;
 document.getElementById("dTool").innerHTML=top.length?top.map(function(id){ var T0=BYID[id]; return TBX.bar(T0?T0.c+" "+nm(T0.n):t("o_other"),c.used[id],Math.round(c.used[id]/mx*100),T0?SECCOL[T0.sec]:"#7A869E"); }).join(""):'<p class="pd-sub">'+esc(t("dNone"))+'</p>';
 var U=Object.keys(QTC.REC).map(function(kk){ return [kk,(recsOf(QTC.REC[kk])||[]).length]; }), um=Math.max.apply(null,U.map(function(x){ return x[1]; }).concat([1]));
 document.getElementById("dUse").innerHTML=U.some(function(x){ return x[1]; })?U.map(function(x){ return TBX.bar(USE_C[x[0]]+" "+nm(QTC.NAMES[x[0]]),x[1],Math.round(x[1]/um*100),"#3563C9"); }).join(""):'<p class="pd-sub">'+esc(t("useNone"))+'</p>';
 document.getElementById("dAssess").innerHTML=AGROUPS.map(function(g){ var sp=assessScore(g); return TBX.bar(t("g_"+g),sp+"%",sp,GCOL[g]); }).join("");
 var O=openItems();
 document.getElementById("dOpen").innerHTML=O.length?O.map(function(x){ return '<li><b>'+esc(x.r.ref||x.r.id)+'</b> '+chip(x.s,x.k)+'</li>'; }).join(""):'<li>'+esc(t("noOpen"))+'</li>';
}

/* ---------- report and CSV ---------- */
function buildCSV(){
 var head=["storyboard_id","reference","title","context","aim","stage","phase","tool_clause","tool","reason","output","who","status","date","linked_tool","record_id"];
 var rows=[]; DB.records.forEach(function(r){ var st=stageOf(r); var S=r.steps.length?r.steps:[null];
  S.forEach(function(s){ var T0=s?toolOf(s):null; rows.push([r.id,r.ref,r.title,r.ctx,r.aim,st,s?s.ph:"",T0?T0.c:"",s?stepName(s):"",s?s.why:"",s?s.out:"",s?s.who:"",s?s.st:"",s?s.date:"",T0&&T0.own?T0.own:"",s?s.rid:""]); }); });
 return TBX.csv(head,rows);
}
var RP_CSS='.qt-page{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:8px 0}.qt-page>header,.qt-page>footer{grid-column:1/-1;border:1px solid #DCE4EE;border-radius:10px;padding:8px 12px}.qt-page>footer{background:#F3F7FB;font-size:13px}.qt-page>header p{margin:2px 0;font-size:13px;color:#4B5874}.qt-q{border:1px solid #DCE4EE;border-top:4px solid var(--pc);border-radius:10px;padding:8px 10px}.qt-q h4{margin:0 0 4px;color:var(--pc)}.qt-q ol{margin:0;padding-inline-start:18px;font-size:13px}.qt-q .none{color:#7A869E;font-size:12.5px;margin:0}small{color:#4B5874}.ok{color:#2F7D4B;font-weight:700;text-align:center}.bad{color:#B42318;font-weight:700;text-align:center}.na{color:#7A869E;text-align:center}code{font-family:Georgia,serif}h3{font-family:Georgia,serif;margin:22px 0 4px;font-size:17px}.lv{font-size:12px;font-weight:700}@media print{.qt-page{break-inside:avoid}}';
function buildReportHTML(appx){
 var c=counts(), A=auditSummary(), as=assessScore(), d=today(), cv=covCounts(TL), oi=openItems();
 var mark=function(v){ return v===null?'<td class="na">—</td>':(v?'<td class="ok">✓</td>':'<td class="bad">✗</td>'); };
 var cov=TL.map(function(T0){ var pl=T0.plat.filter(function(p){ return p.k; }).map(function(p){ return nm(QTC.NAMES[p.k]); }).join(" · "); return '<tr><td><code>'+esc(T0.c)+'</code></td><td>'+esc(nm(T0.n))+'</td><td>'+esc(nm(QTC.AREAS[T0.area]))+'</td><td>'+esc(teamTxt(T0.team))+'</td><td>'+esc(T0.data?t("data_"+T0.data):"—")+'</td><td>'+dots(T0.cap)+'</td><td>'+esc(T0.eff?t("eff_"+T0.eff):"—")+'</td><td>'+esc(pdcaTxt(T0))+'</td><td><span class="lv" style="color:'+(T0.lv==="none"?"#4B5874":LVCOL[T0.lv])+'">'+esc(t("lv_"+T0.lv))+'</span>'+(pl?'<br><small>'+esc(pl)+'</small>':'')+'</td></tr>'; }).join("");
 var sb=DB.records.map(function(r){ var a=auditRecord(r);
  return '<h3>'+esc((r.ref?r.ref+" · ":"")+r.title)+' <small dir="ltr">'+esc(r.id)+'</small></h3><p class="meta">'+esc(stageName(stageOf(r)))+' · '+esc(r.owner||"—")+(r.fac?' · '+esc(t("f_fac"))+': '+esc(r.fac):'')+(isD(r.start)?' · '+esc(r.start):'')+'</p>'+pageHTML(r,true)+
   '<table><thead><tr><th>PDCA</th><th>'+esc(t("s_tool"))+'</th><th>'+esc(t("s_why"))+'</th><th>'+esc(t("s_out"))+'</th><th>'+esc(t("s_st"))+'</th><th>'+esc(t("s_date"))+'</th></tr></thead><tbody>'+
   r.steps.map(function(s){ return '<tr><td>'+esc(s.ph)+'</td><td>'+esc(stepName(s))+(s.rid?'<br><small dir="ltr">'+esc(s.rid)+'</small>':'')+'</td><td>'+esc(s.why)+'</td><td>'+esc(s.out)+'</td><td>'+esc(t("st_"+s.st))+'</td><td dir="ltr">'+esc(s.date||"—")+'</td></tr>'; }).join("")+'</tbody></table>'+
   (txt(r.lessons)?'<p><b>'+esc(t("f_lessons"))+':</b> '+esc(r.lessons)+'</p>':'')+
   '<table><thead><tr>'+CHECKS.map(function(k){ return '<th>'+esc(t("c_"+k))+'</th>'; }).join("")+'</tr></thead><tbody><tr>'+CHECKS.map(function(k){ return mark(a[k]); }).join("")+'</tr></tbody></table>'; }).join("");
 var grp=AGROUPS.map(function(g){ return '<tr><td>'+esc(t("g_"+g))+' — '+g+'</td><td>'+assessScore(g)+'%</td></tr>'; }).join("");
 var calc=CALC.map(function(C1){ var o=calcOut(C1.k); return o&&!o.bad?'<tr><td><code>'+C1.c+'</code> '+esc(t(C1.k+"T"))+'</td><td>'+esc(o.txt)+'</td></tr>':''; }).join("");
 var body='<div class="cover"><p class="kick">Continual Improvement Academy · CIA</p><h1>ISO 10009:2024 — Quality tools / أدوات الجودة</h1><p class="sub">'+esc(t("rpCover"))+'</p>'+
  '<p class="meta">'+esc(t("prep"))+': <bdi><strong>مدثر سلامه</strong></bdi> · <bdi dir="ltr">'+esc(d)+'</bdi> · <bdi>'+esc(t("kTotal"))+': '+c.n+'</bdi></p></div>'+
  '<h2>Summary / الملخص</h2><div class="k"><div><b>'+c.n+'</b>'+esc(t("kTotal"))+'</div><div><b>'+(A.rate===null?"—":A.rate+"%")+'</b>'+esc(t("kAud"))+'</div><div><b>'+as+'%</b>'+esc(t("kAs"))+'</div><div><b>'+(c.linkable?pct(c.linked,c.linkable):"—")+'</b>'+esc(t("kLinked"))+'</div><div><b>'+Object.keys(c.used).length+'</b>'+esc(t("kTools"))+'</div><div><b>'+c.closed+'</b>'+esc(t("kClosed"))+'</div><div><b>'+(cv.own+cv.in+cv.here)+'/'+TL.length+'</b>'+esc(t("kCov"))+'</div><div><b>'+oi.length+'</b>'+esc(t("kOpen"))+'</div></div>'+
  '<h2>'+esc(t("rpCov"))+'</h2><table><thead><tr><th>#</th><th>'+esc(t("s_tool"))+'</th><th>'+esc(t("libSec"))+' / Area</th><th>'+esc(t("f_who"))+'</th><th>'+esc(t("f_data"))+'</th><th>'+esc(t("capT"))+'</th><th>'+esc(t("f_eff"))+'</th><th>'+esc(t("dPdca"))+'</th><th>'+esc(t("libLv"))+'</th></tr></thead><tbody>'+cov+'</tbody></table>'+
  '<h2>'+esc(t("rpSb"))+'</h2>'+(c.n?sb:'<p class="meta">'+esc(t("none"))+'</p>')+
  '<h2>Open items / بنود تحتاج متابعة</h2>'+(oi.length?'<ul>'+oi.map(function(x){ return '<li><span dir="ltr">'+esc(x.r.ref||x.r.id)+'</span> — '+esc(x.s)+'</li>'; }).join("")+'</ul>':'<p class="meta">'+esc(c.n?t("noOpen"):"—")+'</p>')+
  '<h2>Self-assessment / التقييم الذاتي</h2><table><thead><tr><th>Area / المحور</th><th>Score / النتيجة</th></tr></thead><tbody>'+grp+'<tr><td><b>'+esc(t("kAs"))+'</b></td><td><b>'+as+'%</b></td></tr></tbody></table><p class="meta">'+esc(t("bandNote"))+'</p>'+
  (calc?'<h2>'+esc(t("rpCalc"))+'</h2><table><tbody>'+calc+'</tbody></table>':'')+
  (appx?reportAppendix():'')+
  '<footer>Prepared by / أعدّه: مدثر سلامه · ISO 10009:2024 is guidance (Quality management — Guidance for quality tools and their application), not a certifiable standard. Tool names, clause numbers, the attributes of Table C.1 and the placements of Annex A were checked against the uploaded text on 2026-10-16; descriptions are interpretive summaries, not the official text; the link of each clause to ISO 9001:2026 is the author\'s. ISO 10017 and the other standards ISO 10009 names are not verified (not uploaded). Example storyboards are illustrative, not real data.</footer>';
 return TBX.reportDoc(L,'ISO 10009 Report — مدثر سلامه',body,RP_CSS);
}
function renderReport(){
 var prev=document.getElementById("rpPrev"); if(!prev) return;
 var c=counts(), A=auditSummary(), cv=covCounts(TL);
 prev.innerHTML='<div class="pd-kpis">'+TBX.kpi(c.n,t("kTotal"))+TBX.kpi(A.rate===null?"—":A.rate+"%",t("kAud"))+TBX.kpi(assessScore()+"%",t("kAs"))+TBX.kpi((cv.own+cv.in+cv.here)+"/"+TL.length,t("kCov"))+'</div>';
}
document.getElementById("rpHtml").addEventListener("click",function(){
 var err=document.getElementById("rpErr"); err.textContent="";
 if(!DB.records.length && !Object.keys(DB.assess).length){ err.textContent=t("rpEmpty"); return; }
 var ax=document.getElementById("rpAppx"); TBX.download("ISO10009-report-"+today()+".html","text/html;charset=utf-8",(ax&&ax.checked)?buildReportHTML(true):buildReportHTML());
});
document.getElementById("rpCsv").addEventListener("click",function(){ var err=document.getElementById("rpErr"); err.textContent=""; if(!DB.records.length){ err.textContent=t("rpEmpty"); return; } TBX.download("ISO10009-storyboards-"+today()+".csv","text/csv;charset=utf-8",buildCSV()); });
document.getElementById("dCsv").addEventListener("click",function(){ if(!DB.records.length) return; TBX.download("ISO10009-storyboards-"+today()+".csv","text/csv;charset=utf-8",buildCSV()); });

/* ---------- platform identity: academy logo and related tools ---------- */
var LOGO="__LOGO__";
function applyLogo(){ document.querySelectorAll("img[data-logo]").forEach(function(i){ if(i.src!==LOGO) i.src=LOGO; i.alt=t("logoAlt"); }); }
var RELATED=[["pareto","Pareto","./pareto.html","#C9821A"],["rca","RCA","./rca.html","#1B2A4A"],["why5","5 Whys","./five-whys.html","#3563C9"],["fish","Fishbone","./fishbone.html","#1E8C93"],["dmaic","DMAIC","./dmaic.html","#1B2A4A"],["fmea","FMEA","./fmea.html","#B42318"],["a3","A3","./a3.html","#B8901E"],["pdca","PDCA","./pdca.html","#3C9A5F"],["capa","CAPA","./capa.html","#C2410C"],["str","Strategy","./strategy-performance.html","#3563C9"],["oec","Operations","./operations-excellence.html","#1E8C93"]];
function buildRelated(){
 var box=document.getElementById("homeStd"); if(!box) return;
 box.innerHTML='<p class="hs-t">'+esc(t("related"))+'</p>'+RELATED.map(function(r){ return '<a class="hs on" href="'+r[2]+'" target="_blank" rel="noopener" data-rel="'+r[0]+'" style="--c:'+r[3]+';--t:'+r[3]+'14"><b dir="ltr">'+r[1]+'</b><span>'+esc(t("rel_"+r[0]))+'</span><em>↗</em></a>'; }).join("");
}
document.getElementById("homeStd").addEventListener("click",function(e){ var a=e.target.closest("a[data-rel]"); if(!a||!inHub()) return; e.preventDefault(); openPlat(a.getAttribute("data-rel"),""); });

/* ---------- example data (illustrative, fictitious Saudi company) and clear all ---------- */
__EXAMPLE__
function loadExample(){
 DB={records:exQt(L).map(fixRec),assess:JSON.parse(JSON.stringify(EXAMPLE_AS)),nav:fixNav({aim:"prob",ctx:"p",ph:"D",who:"team",data:"medium",cap:"2"}),calc:fixCalc(EXAMPLE_CALC)};
 pendingDelete=null; var ok=persist(); clearForm(); buildNavFields(); renderCalcs(); renderAll();
 var m=document.getElementById("exMsg"); if(m) m.textContent=ok?t("exLoaded"):t("savedFail");
}
function clearAll(){
 DB={records:[],assess:{},nav:fixNav({}),calc:fixCalc({})}; pendingDelete=null;
 TBX.drop(STORE);
 clearForm(); buildNavFields(); renderCalcs(); renderAll();
 var m=document.getElementById("exMsg"); if(m) m.textContent=t("exCleared");
 var a=document.getElementById("asMsg"); if(a) a.textContent="";
}
/* the tour layer asks for confirmation before the example replaces data (guard "pfEx": "all"); clearing asks here */
document.getElementById("pfEx").addEventListener("click",function(){ loadExample(); });
document.getElementById("pfReset").addEventListener("click",function(){ var ok=true; try{ ok=window.confirm(t("exConfirmClear")); }catch(e){ ok=true; } if(ok) clearAll(); });

/* ---------- assistant: answers from the guide and your storyboards (rule-based, no AI service) ---------- */
var CONTACT_EMAIL="moddathersalama.eng@gmail.com";
var CB={
 ar:{fab:"اسأل عن أدوات الجودة",title:"مساعد ISO 10009",sub:"إجابات فورية من دليل المواصفة ولوحات قصتك",new:"محادثة جديدة",close:"إغلاق",ph:"اكتب سؤالك…",send:"إرسال",inL:"سؤالك",
  hello:"مرحباً. أجيب عن أسئلة ISO 10009 وأدوات الجودة من دليل المواصفة ومن لوحات القصة المحفوظة في هذا المتصفح. اختر سؤالاً أو اكتب سؤالك.",
  miss:"لم أجد إجابة جاهزة لهذا السؤال. جرّب أحد الأسئلة المقترحة، أو اسأل عن: هل ISO 10009 قابلة للإشهاد، أو أي أداة أستخدم، أو الأدوات على دورة PDCA، أو لوحة القصة، أو معنى النقاط في الملحق C، أو الأدوات الموجودة في المنصة. وللاستشارة راسل المُعِد على البريد أدناه.",
  instant:"إجابة فورية",foot:"المساعد يعمل في متصفحك ولا يرسل بياناتك. للتواصل:",
  op0:"لا توجد بنود مفتوحة في لوحات قصتك الآن.",st0:"لا توجد لوحات قصة بعد. ابدأ من [[tab:tools]] أو حمّل المثال من [[tab:docs]]."},
 en:{fab:"Ask about quality tools",title:"ISO 10009 assistant",sub:"Instant answers from the standard guide and your storyboards",new:"New chat",close:"Close",ph:"Type your question…",send:"Send",inL:"Your question",
  hello:"Hello. I answer questions on ISO 10009 and quality tools from the standard guide and from the storyboards saved in this browser. Pick a question or type your own.",
  miss:"I have no ready answer for that. Try one of the suggested questions, or ask whether ISO 10009 is certifiable, which tool to use, the tools on the PDCA cycle, the storyboard, what the dots in Annex C mean, or which tools are on the platform. For advice, email the author at the address below.",
  instant:"Instant answer",foot:"The assistant runs in your browser and sends no data. Contact:",
  op0:"No open items in your storyboards right now.",st0:"No storyboards yet. Start from the [[tab:tools]] or load the example in [[tab:docs]]."}
};
var KB=[
 {id:"what",k:["إشهاد","شهادة","certif","certifiable","مطابقة","تدقيق","audit against","ما هي","what is","iso 10009","10009"],q:{ar:"ما ISO 10009، وهل يُشهد عليها؟",en:"What is ISO 10009, and can you be certified to it?"},
  a:{ar:"**ISO 10009:2024 دليل إرشادي، وليست مواصفة إشهاد.** تعرّف بـ 53 أداة جودة يمكن أن تفيد في نظام إدارة الجودة كما تصفه ISO 9001، وتساعد على اختيار الأداة المناسبة. لا يُمنح عليها شهادة ولا يدقق عليها المدقق؛ ما يُدقق هو ما تطلبه ISO 9001:2026، مثل تحليل البيانات وتقييمها (9.1.3) وتحديد أسباب عدم المطابقة (10.2.1). وتحيل إليها الملاحظة 3 في الملحق A.9.1 من ISO 9001:2026. التفاصيل في [[tab:explain-std]].",
   en:"**ISO 10009:2024 is guidance, not a certification standard.** It introduces 53 quality tools that can be useful in a quality management system as described by ISO 9001, and helps pick the right one. No certificate is issued against it and auditors do not audit against it; what is audited is what ISO 9001:2026 requires, such as analysing and evaluating data (9.1.3) and determining the causes of nonconformities (10.2.1). NOTE 3 of Annex A.9.1 of ISO 9001:2026 points to it. Details in the [[tab:explain-std]]."}},
 {id:"which",k:["أي أداة","اي اداة","أختار","اختار","which tool","choose","pick","select","أنسب","مناسبة","suitable"],q:{ar:"أي أداة أستخدم لمشكلتي؟",en:"Which tool should I use for my problem?"},
  a:{ar:"ابدأ بثلاثة أسئلة: **ما الغرض** (وصف عملية، أو حل مشكلة، أو إبراز تحسين، أو فعالية)؟ **وأين أنت في الدورة** (خطة، تنفيذ، تحقق، تصرف) وفي أي سياق؟ **وما الذي تملكه** من فريق وبيانات وكفاءة وجهد؟ أدخل الإجابات في [[tab:tools]] فيقترح المستكشف الأدوات ويبين سبب كل اقتراح وما ينقصك. ولمشكلة لها بيانات: باريتو ليحدد القلة الحيوية، ثم «ما هو / ما ليس» لبيان المشكلة، ثم عظمة السمكة ولماذا الخمس للأسباب، ثم DMAIC إن كان السبب غامضاً والعملية قابلة للقياس.",
   en:"Start with three questions: **what is the aim** (characterize a process, solve a problem, highlight improvement, effectiveness)? **Where are you in the cycle** (Plan, Do, Check, Act) and in which context? **What do you have** in team, data, capability and effort? Enter the answers in the [[tab:tools]] and the navigator suggests tools, with the reason for each and what you lack. For a problem with data: Pareto for the vital few, then is/is not for the problem statement, then fishbone and five whys for the causes, then DMAIC if the cause stays unclear and the process can be measured."}},
 {id:"pdca",k:["pdca","دورة","الملحق a","annex a","plan do","خطة تنفيذ","مرحلة","phase"],q:{ar:"كيف توزع المواصفة الأدوات على دورة PDCA؟",en:"How does the standard place the tools on PDCA?"},
  a:{ar:"**الملحق A ثلاثة جداول** تضع الأدوات على الخطة والتنفيذ والتحقق والتصرف في ثلاثة سياقات: الاستراتيجية وتخطيط الأعمال (A.1)، وتحسين العمليات (A.2)، والتحسين المستمر (A.3). مثلاً في تحسين العمليات: العصف الذهني و«ما هو / ما ليس» في الخطة، وSIPOC وعظمة السمكة ولماذا الخمس في التنفيذ، وSix Sigma وأدوات 13.1 إلى 13.6 في التحقق، وسجل المخاطر والوسائل المرئية في التصرف. وقد تظهر الأداة في أكثر من مرحلة. كل أداة في [[tab:explain-cl]] تذكر مرحلتها.",
   en:"**Annex A is three tables** that place the tools on Plan, Do, Check and Act in three contexts: strategy and business planning (A.1), process improvement (A.2) and continual improvement (A.3). In process improvement, for example: brainstorming and is/is not in Plan; SIPOC, fishbone and five whys in Do; Six Sigma and tools 13.1 to 13.6 in Check; the risk register and visual aids in Act. A tool can appear in more than one phase. Each tool in the [[tab:explain-cl]] gives its phase."}},
 {id:"story",k:["لوحة القصة","storyboard","story","الملحق b","annex b","صفحة واحدة","one page"],q:{ar:"ما لوحة القصة، ولماذا أستخدمها؟",en:"What is a storyboard, and why use one?"},
  a:{ar:"**لوحة القصة ملخص مرئي في صفحة واحدة** لحل قضية من بيان المشكلة: الأدوات التي أوصلت إلى السبب الجذري، ثم التصحيح والإجراء التصحيحي والتحقق، وتحديث المخاطر والفرص، وتغيير العملية (الملحق B). فائدتها أن الإدارة والمدقق يقرآن التحسين كاملاً في دقائق، وأن الأدوات تُرى سلسلة واحدة لا أوراقاً منفصلة. ابنِ لوحتك في [[tab:tools]] واربط كل خطوة بسجلها في أداة المنصة.",
   en:"**A storyboard is a one-page visual summary** of resolving an issue from the problem statement: the tools that reached the root cause, then correction, corrective action and validation, the update of risks and opportunities, and the change to the process (Annex B). Management and auditors read the whole improvement in minutes, and the tools are seen as one chain rather than separate sheets. Build yours in the [[tab:tools]] and link each step to its record in the platform tool."}},
 {id:"dots",k:["نقاط","النقاط","dots","•","الملحق c","annex c","كفاءة","capability","تدريب","training","صعوبة"],q:{ar:"ماذا تعني النقاط في الملحق C؟",en:"What do the dots in Annex C mean?"},
  a:{ar:"هي **مستوى الكفاءة اللازم** لتطبيق الأداة: **•** يمكن تطبيقها بعد قراءة المعلومات الموثقة (مثل SWOT وSIPOC وباريتو)، و**••** بعد تدريب مخصص (مثل PESTLE وعظمة السمكة وOEE)، و**•••** يُنصح فيها بدورة أطول وخبرة قبل التطبيق (مثل FMEA وQFD وGR&R وSix Sigma). ويضيف الجدول: فريق أم فرد، وأقل كمية بيانات، والجهد. وهذا يترجم إلى البند 7.2 الكفاءة في ISO 9001:2026: ضع أدوات •• و••• في مصفوفة الكفاءة.",
   en:"They are **the level of capability needed** to apply the tool: **•** can be applied after reading documented information (such as SWOT, SIPOC, Pareto), **••** after dedicated training (such as PESTLE, fishbone, OEE), and **•••** calls for a longer course and experience before applying (such as FMEA, QFD, GR&R, Six Sigma). The table adds team or individual, minimum data and effort. This maps onto ISO 9001:2026 clause 7.2 Competence: put the •• and ••• tools in your competence matrix."}},
 {id:"plat",k:["المنصة","platform","موجودة","available","أين أجد","where","أدوات المنصة"],q:{ar:"أي أدوات المواصفة موجودة في المنصة؟",en:"Which of the standard's tools are on the platform?"},
  a:{ar:"من الـ 53 أداة: **8 أدوات مستقلة** (SWOT 5.1، وPESTLE 5.2، وFMEA 7.3، وباريتو 13.7، وتحليل السبب الجذري 14.1، ولماذا الخمس 14.4، وعظمة السمكة 14.5، وSix Sigma عبر مشروع DMAIC 16.1)، و**12 داخل أدوات المنصة** (مثل SIPOC وRACI في مركز التميز التشغيلي، وسجل المخاطر وخريطة الحرارة في ISO 31000، وخطة الضبط وCTQ وGR&R في DMAIC)، و**3 تُطبق في هذا الدليل** (NPS وOEE و«ما هو / ما ليس»). وتذكر المواصفة أيضاً PDCA وA3 و8D وبطاقة الأداء المتوازن: كلها في المنصة. انظر [[tab:dash]] أو المكتبة في [[tab:tools]].",
   en:"Of the 53 tools: **8 dedicated tools** (SWOT 5.1, PESTLE 5.2, FMEA 7.3, Pareto 13.7, root cause analysis 14.1, five whys 14.4, fishbone 14.5, and Six Sigma through the DMAIC project 16.1), **12 inside platform tools** (such as SIPOC and RACI in the operations center, the risk register and heat map in ISO 31000, the control plan, CTQs and GR&R in DMAIC), and **3 worked in this guide** (NPS, OEE and is/is not). The standard also names PDCA, A3, 8D and the balanced scorecard: all on the platform. See the [[tab:dash]] or the library in the [[tab:tools]]."}},
 {id:"card",k:["بطاقة الأداة","خطوات","كيف أطبق","كيف اطبق","how to apply","steps","tool card","طريقة تطبيق"],q:{ar:"كيف أطبق أداة خطوة بخطوة؟",en:"How do I apply a tool step by step?"},
  a:{ar:"افتح **بطاقة الأداة** في [[tab:explain-cl]]: فيها ما هي، ومتى تُستخدم ومتى لا، والمدخلات، و**خطوات التطبيق** (5 إلى 8 خطوات)، والمخرج والسجل، وسماتها في الجدول C.1، ومكانها في PDCA، ومثال الواحة، والأخطاء الشائعة، وما يطلبه المدقق، والأدوات قبلها وبعدها. وفي آخرها أزرار تفتح الأداة في المنصة أو تضيفها خطوة إلى لوحة قصتك. ويمكنك نسخ رابط البطاقة لمشاركتها.",
   en:"Open the **tool card** in the [[tab:explain-cl]]: what it is, when to use it and when not, inputs, **how to apply it** (5 to 8 steps), output and record, its Table C.1 attributes, its place on PDCA, the Al-Waha example, common mistakes, what an auditor asks to see, and the tools before and after it. At the end, buttons open the tool on the platform or add it as a step to your storyboard. You can copy the card's link to share it."}},
 {id:"notuse",k:["متى لا","لا تستخدم","لا أستخدم","when not","avoid","not use","خطأ شائع","common mistake"],q:{ar:"متى لا أستخدم أداة معينة؟",en:"When should I not use a tool?"},
  a:{ar:"لكل أداة في [[tab:explain-cl]] قسم **متى لا تُستخدم** وقسم **أخطاء شائعة**. القاعدة العامة: لا تختر الأداة لأنها مألوفة؛ فمثلاً لا يغني باريتو عن تحليل السبب، ولا يغني SWOT عن بيانات السوق، ولا تُستخدم FMEA لمشكلة وقعت فعلاً (هنا RCA). وإن لم تتأكد فابدأ من [[tab:tools]] بالغرض والمرحلة.",
   en:"Each tool in the [[tab:explain-cl]] has a **when not to use it** section and a **common mistakes** section. The general rule: do not pick a tool because it is familiar; Pareto does not replace cause analysis, SWOT does not replace market data, and FMEA is not for a problem that has already happened (that is RCA). If unsure, start from the [[tab:tools]] with your aim and phase."}},
 {id:"auditor",k:["المدقق","يطلب المدقق","ماذا يسأل","auditor","auditors","ask to see","دليل الاستخدام","evidence of use"],q:{ar:"ماذا يطلب المدقق عندما أستخدم أداة؟",en:"What does an auditor ask to see when I use a tool?"},
  a:{ar:"المدقق لا يدقق على ISO 10009 نفسها، بل على ما تطلبه ISO 9001:2026، مثل تحليل البيانات وتقييمها (9.1.3) وتحديد أسباب عدم المطابقة (10.2.1) والكفاءة (7.2). لذلك يطلب **مخرج الأداة مؤرخاً** بأسماء من شارك، و**الصلة بين المخرج والإجراء** الذي اتُّخذ، و**دليل الكفاءة** لمن طبّق أدوات •• و•••. وفي كل بطاقة في [[tab:explain-cl]] قسم «ما يطلبه المدقق» لتلك الأداة.",
   en:"Auditors do not audit against ISO 10009 itself but against what ISO 9001:2026 requires, such as analysing and evaluating data (9.1.3), determining the causes of nonconformities (10.2.1) and competence (7.2). So they ask for **the tool's output, dated**, with the names of those who took part, **the link between the output and the action** taken, and **evidence of competence** for whoever applied •• and ••• tools. Each card in the [[tab:explain-cl]] has a \"what an auditor asks to see\" section for that tool."}},
 {id:"compet",dyn:"compet",k:["مصفوفة الكفاءة","مصفوفة","خطة الكفاءة","خطة التدريب","competence matrix","matrix","competence plan","training plan","7.2"],q:{ar:"أي الأدوات تحتاج تدريباً في خطة الكفاءة؟",en:"Which tools need training in the competence plan?"}},
 {id:"paths",dyn:"paths",k:["مسار","مسارات","مسار التعلم","learning path","paths","تقدمي","progress","أين أبدأ التعلم"],q:{ar:"ما مسارات التعلم وأين وصلت فيها؟",en:"What are the learning paths and how far am I?"}},
 {id:"other",dyn:"other",k:["أدوات أخرى","الأدوات الأخرى","ذات الصلة","اخرى ذات صلة","other relevant","other tools","named only","بالاسم فقط"],q:{ar:"ما «الأدوات الأخرى ذات الصلة» في آخر كل بند؟",en:"What are the \"other relevant tools\" at the end of each clause?"}},
 {id:"open",dyn:"open",k:["مفتوح","مفتوحة","متابعة","open items","follow"],q:{ar:"ما البنود المفتوحة في لوحات قصتي؟",en:"What is still open in my storyboards?"}},
 {id:"status",dyn:"status",k:["وضع","حالة","ملخص","status","summary","where do we stand"],q:{ar:"ما وضع لوحات قصتي الآن؟",en:"Where do my storyboards stand?"}}
];
var CB_SUG=["what","which","plat","dots","status"];
function kbDyn(id){
 var u=CB[L]||CB.ar;
 if(id==="open"){ var O=openItems(); if(!O.length) return u.op0+"\n\n[[tab:dash]]"; return O.map(function(x){ return "- **"+(x.r.ref||x.r.id)+"** — "+x.s; }).join("\n")+"\n\n[[tab:docs]] · [[tab:dash]]"; }
 if(id==="status"){ var c=counts(), A=auditSummary(); if(!c.n) return u.st0; return "- "+t("kTotal")+": **"+c.n+"**\n- "+t("kClosed")+": **"+c.closed+"**\n- "+t("kAud")+": **"+(A.rate===null?"—":A.rate+"%")+"**\n- "+t("kLinked")+": **"+(c.linkable?pct(c.linked,c.linkable):"—")+"**\n- "+t("kOpen")+": **"+openItems().length+"**\n- "+t("kAs")+": **"+assessScore()+"%**\n\n[[tab:dash]] · [[tab:audit]]"; }
 if(id==="compet"){ var c2=TL.filter(function(T0){ return T0.cap===2; }), c3=TL.filter(function(T0){ return T0.cap===3; }), lst=function(a){ return a.map(function(T0){ return T0.c; }).join(L==="ar"?"، ":", "); };
  return (L==="ar"?"من الـ "+TL.length+" أداة: **"+c2.length+" تحتاج تدريباً مخصصاً (••)** و**"+c3.length+" تحتاج دورة أطول وخبرة (•••)** حسب الجدول C.1.\n- ••: "+lst(c2)+"\n- •••: "+lst(c3)+"\n\nضعها في خطة الكفاءة حسب ISO 9001:2026 البند 7.2. صدّر المصفوفة من الملحق C في [[tab:explain-cl]].":"Of the "+TL.length+" tools: **"+c2.length+" need dedicated training (••)** and **"+c3.length+" need a longer course and experience (•••)**, per Table C.1.\n- ••: "+lst(c2)+"\n- •••: "+lst(c3)+"\n\nPut them in your competence plan under ISO 9001:2026 clause 7.2. Export the matrix from Annex C in the [[tab:explain-cl]]."); }
 if(id==="paths"){ var S0=pRead(); return QX.PATHS.map(function(p){ var d=p.c.filter(function(c){ return S0.indexOf(c)>=0; }).length; return "- **"+nm(p.n)+"** — "+qx("xProg",{a:d,n:p.c.length})+" ("+p.c.join(" → ")+")"; }).join("\n")+"\n\n"+(L==="ar"?"افتح «مسارات التعلم» في [[tab:explain-cl]] وعلّم كل أداة كمدروسة من بطاقتها.":"Open \"Learning paths\" in the [[tab:explain-cl]] and mark each tool as studied from its card."); }
 if(id==="other"){ var on=QTC.O.filter(function(o){ return o[2].length; }).length, n=QX.INV.n;
  return L==="ar"?"يختم كل بند من 5 إلى 16 بقائمة «أدوات أخرى ذات صلة» تذكرها المواصفة **بالاسم فقط دون شرح**: "+n.names+" اسماً في "+n.lists+" قائمة، جمعها الدليل في "+QTC.O.length+" بنداً لكل منها سطر يشرحها. منها **"+on+"** لها مكان في المنصة (مثل PDCA وA3 و8D وبطاقة الأداء المتوازن)، والباقي ليس في المنصة. تجدها في صفحة كل بند في [[tab:explain-cl]].":"Each clause 5 to 16 ends with a list of \"other relevant tools\" the standard **names without explaining**: "+n.names+" names in "+n.lists+" lists, grouped by this guide into "+QTC.O.length+" entries with a line explaining each. **"+on+"** of them have a place on the platform (such as PDCA, A3, 8D and the balanced scorecard); the rest are not on the platform. Find them on each clause page in the [[tab:explain-cl]]."; }
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

/*__EXPLORE__*/

/* ---------- render and wiring ---------- */
function renderAll(){ renderHome(); renderNav(); renderLib(); renderDocs(); renderAudit(); renderDash(); renderReport(); renderAssess(); refreshForm(); }
document.getElementById("langBtn").addEventListener("click",function(){ switchLang(); });
window.addEventListener("hashchange",function(){ var h=location.hash.slice(1); if(h!==curTab) go(h); });
window.addEventListener("storage",function(e){ if(Object.keys(QTC.REC).some(function(k){ return QTC.REC[k]===e.key; })){ renderHome(); renderDash(); if(editing&&SUB==="sb"){ readForm(); renderLanes(); refreshForm(); } } });

/* ---------- boot ---------- */
/* a link may ask to open a storyboard (?open=ID) or the card of a tool in the clause guide (?tool=ID or a clause number such as 13.7);
   inside the hub the same request arrives as the one-time sessionStorage hint "cia-nav:iso10009" */
function navRequest(){
 var q={}; try{ var u=new URLSearchParams(location.search); if(u.get("open")) q.open=u.get("open"); if(u.get("tool")) q.tool=u.get("tool"); }catch(e){}
 try{ var h=JSON.parse(sessionStorage.getItem(NAV_KEY)||"null"); sessionStorage.removeItem(NAV_KEY); if(h&&typeof h==="object"){ if(h.open) q.open=String(h.open); if(h.tool) q.tool=String(h.tool); } }catch(e){}
 return q;
}
newEditing();
applyLang();
setSub("nav");
(function(){
 var q=navRequest(), r=q.open?DB.records.filter(function(x){ return x.id===q.open; })[0]:null;
 if(r){ loadRecordIntoForm(r); go("tools"); setSub("sb"); return; }
 if(q.tool && qxTool(q.tool)) return;
 go((location.hash||"#home").slice(1));
})();
