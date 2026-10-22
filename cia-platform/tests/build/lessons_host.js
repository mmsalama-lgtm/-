/* ===== Lessons Learned tool — host logic. Lessons and assessment are stored in this browser only (localStorage, wrapped in try/catch). =====
   Storage key "cia-lessons:v1" (this tool only). Schema:
   { records: [ {
       id, title, ref, type: "problem"|"near"|"success"|"audit"|"closeout"|"customer",
       date (date of the event, YYYY-MM-DD), area, project, owner, reviewers,
       src: "rca"|"why5"|"fish"|"a3"|"dmaic"|"fmea"|"capa"|"pdca"|"pareto"|"none", srcId (id of the record in that tool, read only),
       nc: true|false (a nonconformity is the source: a CAPA record must be linked), capa (CAPA record id),
       tags:   {proc (process), ptype (project type), site}
       what:   {event, ev (evidence), exp (expected), act (what actually happened), impact, sev: "low"|"med"|"high"}
       cause:  {how: "link"|"here", t (one sentence)}          "link": taken from the source analysis (src, srcId); "here": written here,
                                                              flagged "not analysed" (not allowed for a severe event)
       lesson: {when, dothis, because, applies, excl}          the lesson as a rule: "When …, do …, because …", where it applies and where not
       acts:   [ {id, kind: "proc"|"form"|"check"|"train"|"fmea"|"cplan"|"design"|"contract"|"other", what, ref (document or FMEA study id),
                  who, by (YYYY-MM-DD), st: "plan"|"doing"|"done", done (YYYY-MM-DD), ev (evidence of the change)} ]   embedding actions
       ver:    [ {id, date, next (the next project or process that used it), res: "worked"|"part"|"not", ev} ]           verification
       share:  [ {id, date, who (who was told), how} ]                                                                   sharing
       created, updated } ],
     assess: { CP1..VS3: 0|1|2 } }
   The stage is computed (captured → cause linked → lesson written → actions planned → embedded → verified → shared); nothing about it is stored.
   Other tools' keys are only read, never written: "cia-rca:v1", "cia-a3:v1", "cia-dmaic:v1", "cia-fmea:v1", "cia-capa:v1", "cia-pdca:v1"
   (start a lesson from a record, previews with each tool's own stage rule), "cia-fish:v1", "cia-why5:v1" and "cia-pareto:v1" (previews and
   causes). The other tools open through their own requests (?open= or their one-time sessionStorage hints "cia-nav:dmaic", "cia-nav:a3",
   "cia-nav:rca", "cia-nav:fishbone", "cia-nav:five-whys", "cia-nav:pareto", "cia-nav:fmea"). This tool reads its own hint "cia-nav:lessons"
   ({open} | {rca} | {a3} | {dmaic} | {fmea} | {capa} | {pdca}) and its address (?open=, ?rca=, ?a3=, ?dmaic=, ?fmea=, ?capa=, ?pdca=) once;
   none of them holds tool data. */
var LKEY="cia-lang", STORE="cia-lessons:v1", DM_KEY="cia-dmaic:v1", A3_KEY="cia-a3:v1", RCA_KEY="cia-rca:v1", CAPA_KEY="cia-capa:v1", PARETO_KEY="cia-pareto:v1", FISH_KEY="cia-fish:v1", WHY5_KEY="cia-why5:v1", PDCA_KEY="cia-pdca:v1", FM_KEY="cia-fmea:v1",
    NAV_KEY="cia-nav:lessons", DM_NAV="cia-nav:dmaic", A3_NAV="cia-nav:a3", RCA_NAV="cia-nav:rca", FISH_NAV="cia-nav:fishbone", WHY5_NAV="cia-nav:five-whys", PARETO_NAV="cia-nav:pareto", FM_NAV="cia-nav:fmea";
var L=(function(){ try{ return localStorage.getItem(LKEY)||"ar"; }catch(e){ return "ar"; } })();
var TABS=["home","explain-std","explain-cl","assess","tools","docs","audit","dash","report","ai"];
var TITLES={ar:"الدروس المستفادة | سجل الدروس — مدثر سلامه",en:"Lessons Learned | Lessons register — مدثر سلامه"};
var STAGES=["draft","captured","cause","lesson","planned","embedded","verified","shared"], MAPST=STAGES.slice(1);
var SCOL={draft:"#9AA5B8",captured:"#7A869E",cause:"#3563C9",lesson:"#1B2A4A",planned:"#C9821A",embedded:"#B8901E",verified:"#1E8C93",shared:"#3C9A5F"};
var TYPES=["problem","near","success","audit","closeout","customer"];
var TCOL={problem:"#B42318",near:"#C9821A",success:"#3C9A5F",audit:"#7B5BB8",closeout:"#3563C9",customer:"#1E8C93"};
var SRCS=["rca","why5","fish","a3","dmaic","fmea","capa","pdca","pareto","none"], SEVS=["low","med","high"], CHOWS=["link","here"];
var KINDS=["proc","form","check","train","fmea","cplan","design","contract","other"], ASTS=["plan","doing","done"], VRES=["worked","part","not"];
var STSRC=["rca","a3","dmaic","fmea","capa","pdca"];
var MAXACTS=12, MAXVER=10, MAXSH=10;
var DB=load();
var curTab="home";
var editing=null;   /* deep copy of the lesson open in the form: keeps created between saves */
var ST=null;        /* rows of the read-only start preview */
var RB="";          /* the process or project type chosen in "read before you start" (not stored) */

var UI={
ar:{brand:"أكاديمية التحسين المستمر · مدثر سلامه",toolName:"أداة الدروس المستفادة — سجل الدروس",sgLearn:"التعلّم",sgWork:"العمل",sgOut:"المخرجات",
 nHome:"الرئيسية",nStd:"دليل المنهجية",nCl:"دليل البنود",nAssess:"التقييم الذاتي",nTools:"سجل الدروس",nDocs:"السجلات",nAudit:"التدقيق",nDash:"لوحة المؤشرات",nReport:"التقرير",nAi:"المساعد الذكي",soon:"قريباً",
 homeCode:"ما حدث · السبب · الدرس · الترسيخ · التحقق · التعميم",homeH1:"الدروس المستفادة",
 homeLede:"سجل للدروس يغيّر المشروع التالي: ما الذي حدث وبأي دليل، وسببه من تحليل حقيقي، والدرس قاعدة يطبقها غيرك «عندما… افعل… لأن…»، ثم إجراء يغيّر إجراءً أو نموذجاً أو تدريباً أو صفاً في FMEA، ثم تحقق أن المشروع التالي طبّقه ونجح، ثم تعميمه. والنجاحات دروس أيضاً.",
 homeNote:"النسخة الحالية تحفظ الدروس في متصفحك فقط. الحفظ على الخادم وتسجيل الدخول يُضافان في مرحلة المنصة المشتركة.",
 prep:"إعداد",authorName:"مدثر سلامه",cycleT:"ما الذي تستطيع فعله هنا",cycleS:"اقرأ دليل المنهجية، ثم قيّم ممارستكم للدروس المستفادة، ثم سجّل أول درس من تحقيق RCA أو صفحة A3 أو مشروع DMAIC أو دراسة FMEA أو سجل CAPA أو دورة PDCA، أو ابحث في السجل قبل بدء مشروع جديد.",
 tStd:"متى يكون الدرس «مستفاداً» فعلاً: الحدث والدليل، والسبب من تحليل حقيقي، والدرس قاعدة، والترسيخ في الوثائق والضوابط، والتحقق في المشروع التالي، والتعميم، والقراءة قبل البدء، والفجوات الشائعة وما يطلبه المدقق.",tCl:"بنود ISO 9001:2026 التي تخدمها الممارسة: المعرفة التنظيمية 7.1.6، والتواصل 7.4، والتخطيط والتغييرات 8.1 و8.5.6، والتحليل 9.1.3، والإجراء التصحيحي 10.2.1 هـ) و و)، والتحسين 10.1، مع ISO 9000:2026 وISO 10009:2024 البند 15 وISO 19011:2026: ملخص تفسيري ومثال وما يطلبه المدقق.",tAssess:"اثنا عشر سؤالاً تقيس ممارسة الدروس المستفادة لديكم، من التسجيل حتى المراجعة الدورية للسجل.",
 tTools:"سجل لكل درس: ما حدث، والسبب، والدرس قاعدة، وإجراءات الترسيخ، والتحقق، والتعميم، مع بحث في السجل وقائمة «اقرأ قبل أن تبدأ» لعملية أو نوع مشروع.",tDocs:"كل الدروس بمرحلتها ونوعها وتنبيهاتها، وبيانات المثال.",tAudit:"فحص آلي لكل درس: المرجع والمالك، والنوع والتاريخ، والدليل، والسبب، والقاعدة، وعدم لوم الأشخاص، وإجراءات الترسيخ، والتنفيذ بدليل، والتحقق بعد الإجراءات، والتعميم، وربط CAPA.",
 tDash:"الدروس المرسّخة والمتحقق منها والمعممة، والمراحل والأنواع والمصادر، ورسم الدروس حسب المرحلة والنوع، والبنود المفتوحة، والتقييم الذاتي.",tReport:"تقرير HTML بالسجل وكل درس بمرحلته وإجراءاته وتحققه، وقائمة «اقرأ قبل أن تبدأ» لعملية، والتدقيق والبنود المفتوحة والتقييم الذاتي، وملف CSV.",tAi:"مساعد يقرأ السجل ويقترح الدروس المناسبة لمشروع جديد. لم يُفعَّل بعد.",
 foot:"المراجع: ISO 9001:2026 البنود 7.1.6 و7.4 و8.1 و8.5.6 و9.1.3 و9.3.2 و10.1 و10.2.1 والملحق A.7.1.6، وISO 9000:2026 البنود 3.2.4 و3.10.4 و4.2.4 و4.2.6 و4.2.7 و4.3.9، وISO 10009:2024 البند 15، وISO 19011:2026 البنود 5.7 و6.3.2.2 و6.6 (ملخصات تفسيرية، وليست النص الرسمي). الدروس المستفادة ممارسة، وليست متطلباً في أي مواصفة. الأمثلة توضيحية وليست بيانات حقيقية.",
 heroTag:"أداة منهجية · معرفة تغيّر المشروع التالي",langSw:"English",langSwA:"Switch to English",logoAlt:"أكاديمية التحسين المستمر — مدثر سلامه",
 related:"أدوات مرتبطة في الأكاديمية",rel_fmea:"تحليل أنماط الفشل وآثارها FMEA",rel_dmaic:"مشروع التحسين بمنهج DMAIC",rel_a3:"حل المشكلات بأسلوب A3",rel_rca:"تحليل السبب الجذري — التحقيق",rel_pareto:"باريتو — تحليل القلة الحيوية",rel_fish:"عظمة السمكة — تحليل السبب والنتيجة",rel_why5:"لماذا الخمس — تحليل السبب الجذري",rel_capa:"الإجراءات التصحيحية",rel_pdca:"دورة PDCA",rel_iso10009:"دليل أدوات الجودة ISO 10009",
 termT:"هل الدروس المستفادة متطلب في ISO 9001:2026؟",
 termP1:"لا. الدروس المستفادة ممارسة، وليست متطلباً في أي مواصفة، ولا تراجعها ISO 10009:2024 أداةً مستقلة؛ وأقرب ما فيها البند 15 (التحسين) وأنظمة الاقتراحات بين الأدوات الأخرى في 15.6 (ولا ترد عبارة «الدروس المستفادة» في نصها)؛ ولوحة القصة في دليل ISO 10009 على المنصة فيها حقل للدروس المستفادة. أما ISO 9001:2026 فتطلب تحديد المعرفة اللازمة لتشغيل العمليات، والاحتفاظ بها وتطبيقها ومشاركتها بالقدر اللازم (7.1.6)، وتحديث المخاطر وإجراء التغييرات على النظام عند الحاجة بعد عدم المطابقة (10.2.1 هـ) و و))، والتحسين المستمر (10.1). والممارسة طريقة منظمة لتحقيق ذلك.",
 termP2:"والقاعدة هنا: الدرس لا يكون «مستفاداً» حتى تتغير وثيقة أو ضابط أو ممارسة، ويستخدمه المشروع التالي وينجح. والنجاح درس كما الفشل. والصياغة بلا لوم: درس يشير إلى شخص يُنبَّه عليه، بالقاعدة نفسها في FMEA وDMAIC وA3 وRCA. وسجل لا يقرؤه أحد فجوة: يُبحث فيه عند بدء كل مشروع أو تغيير (7.1.6 و8.1 و8.5.6)، وتدخل دروسه صفوف FMEA وخطط الضبط.",
 termP3:"والدروس المستفادة تستخدم صندوق الأدوات ولا تحل محله: السبب من RCA أو لماذا الخمس أو عظمة السمكة أو A3 أو DMAIC، والمخاطر من FMEA، والإجراء التصحيحي في CAPA عندما توجد حالة عدم مطابقة، والمتابعة في PDCA. الأداة لا تعيد التحليل؛ تأخذ السبب من التحليل المرتبط للقراءة فقط.",
 termIs:"ملخص تفسيري بصياغة مستقلة، وليس النص الرسمي. المصادر: ISO 9001:2026 البنود 7.1.6 والملحق A.7.1.6 و10.1 و10.2.1، وISO 9000:2026 البنود 3.2.4 و3.10.4 و4.2.4 و4.2.6، وISO 10009:2024 البند 15 و15.6 (من الملف الرسمي المرفوع)، وISO 19011:2026 البنود 5.7 و6.3.2.2 و6.6. أي مرجع لـ ISO 30401 (مذكورة في ملاحظة الملحق A.7.1.6) أو سجلات الدروس في PMBOK أو PRINCE2 غير مرفوع: «غير متحقق منه». التحقق: 2026-10-16.",
 defs:[["الحدث والدليل","ما حدث · الدليل","ما وقع فعلاً (مشكلة، حادث وشيك، نجاح، ملاحظة تدقيق، إغلاق مشروع، ملاحظة عميل)، بدليله، والمتوقع مقابل الفعلي.","#7A869E"],["السبب","من تحليل","جملة واحدة مأخوذة من تحليل حقيقي مرتبط، لا يُعاد التحليل هنا. السبب المكتوب هنا «غير محلل».","#3563C9"],["الدرس قاعدة","عندما · افعل · لأن","قاعدة يطبقها غيرك، مع أين تنطبق وأين لا تنطبق. بلا لوم لأشخاص.","#1B2A4A"],["الترسيخ","وثيقة · ضابط · تدريب","إجراء يغيّر إجراءً أو نموذجاً أو قائمة فحص أو تدريباً أو صفاً في FMEA أو خطة ضبط، بمالك وتاريخ ودليل.","#B8901E"],["التحقق والتعميم","المشروع التالي","تحقق مؤرخ بعد الإجراءات أن المشروع أو العملية التالية طبّقت الدرس ونجحت، ثم إبلاغ من يحتاجه.","#3C9A5F"]],
 asT:"التقييم الذاتي لممارسة الدروس المستفادة",asS:"أجب عن كل سؤال بما يحدث فعلاً عندكم. النتيجة تقيس الممارسة الحالية، وليست شهادة ولا حكماً على الأداء.",asReset:"مسح الإجابات",asSaved:"تم حفظ الإجابة",asAnswered:"أُجيب {n} من 12",
 band0:"يحتاج عملاً",band1:"في طور التطوير",band2:"راسخ",bandNote:"حدود داخلية للتقييم الذاتي من تصميم هذه الأداة، وليست معياراً رسمياً.",as0:"غير موجود",as1:"جزئي",as2:"موجود ومطبّق",
 g_CP:"التسجيل: الحدث والدليل والسبب",g_RL:"الدرس: قاعدة بلا لوم ومالك",g_EM:"الترسيخ والاستخدام",g_VS:"التحقق والتعميم والمراجعة",
 tlT:"سجل الدروس",tlS:"درس لكل حدث: ما حدث بدليله، والسبب من التحليل المرتبط، والدرس قاعدة، وإجراءات الترسيخ، والتحقق في المشروع التالي، والتعميم. تتحدد المرحلة مما تملؤه.",
 save:"حفظ الدرس",newRec:"درس جديد",savedFail:"تعذّر الحفظ في هذا المتصفح. نزّل التقرير قبل إغلاق الصفحة.",cur:"المرحلة الحالية:",ok_rec:"تم حفظ الدرس",
 st_draft:"مسودة",st_captured:"سُجّل الحدث",st_cause:"رُبط السبب",st_lesson:"كُتب الدرس",st_planned:"خُططت الإجراءات",st_embedded:"رُسّخ",st_verified:"تُحقق منه",st_shared:"عُمّم",
 mp_captured:"الحدث والدليل",mp_cause:"السبب من تحليل",mp_lesson:"الدرس قاعدة",mp_planned:"إجراءات بمالك وتاريخ",mp_embedded:"وثيقة أو ضابط تغيّر",mp_verified:"طبّقه المشروع التالي",mp_shared:"أُبلغ من يحتاجه",
 mapT:"مراحل الدرس",mpDone:"مكتملة",mpCur:"قيد العمل",mpTodo:"لم تبدأ",
 sHdrT:"بيانات الدرس",sHdrS:"المرجع، والنوع، وتاريخ الحدث، والمجال أو المشروع، والمالك، والمراجعون، والأداة المصدر ورقم سجلها، والوسوم التي يُبحث بها.",
 sWhT:"1 · ما الذي حدث",sWhS:"الحدث كما وقع، والدليل، والمتوقع مقابل الفعلي، والأثر. اكتب الوقائع لا الآراء.",
 sCzT:"2 · السبب",sCzS:"جملة واحدة. خذها من التحليل المرتبط (للقراءة فقط)، ولا تُعد التحليل هنا. السبب المكتوب هنا يحمل علامة «غير محلل»، ولا يُقبل لحدث جسيم.",
 sLsT:"3 · الدرس",sLsS:"قاعدة يطبقها غيرك: عندما… افعل… لأن… ثم أين تنطبق وأين لا تنطبق.",
 sAcT:"4 · إجراءات الترسيخ",sAcS:"ما الذي يتغيّر حتى لا يعتمد الدرس على الذاكرة: إجراء، نموذج، قائمة فحص، تدريب، صف في FMEA، خطة ضبط، معيار تصميم، بند عقد. لكل إجراء مالك وموعد ودليل على التغيير.",
 sVrT:"5 · التحقق",sVrS:"بعد الإجراءات: هل طبّق المشروع أو العملية التالية الدرس؟ وهل نجح؟ بتاريخ ودليل.",
 sShT:"6 · التعميم",sShS:"من أُبلغ، وكيف، ومتى. الدرس الذي لا يصل إلى من يحتاجه لا يغيّر شيئاً.",
 f_title:"عنوان الدرس *",f_ref:"المرجع (رقم الحدث أو المشروع)",f_type:"نوع الحدث",f_date:"تاريخ الحدث",f_area:"المجال أو الإدارة",f_project:"المشروع",f_owner:"مالك الدرس",f_reviewers:"المراجعون",f_src:"الأداة المصدر",f_srcId:"رقم السجل في الأداة المصدر",f_capa:"سجل CAPA (اختياري)",f_proc:"وسم العملية",f_ptype:"وسم نوع المشروع",f_site:"وسم الموقع",f_nc:"مصدر الدرس حالة عدم مطابقة (يلزم ربط سجل CAPA)",
 ty_problem:"مشكلة",ty_near:"حادث وشيك",ty_success:"نجاح",ty_audit:"ملاحظة تدقيق",ty_closeout:"إغلاق مشروع",ty_customer:"ملاحظة عميل",
 src_rca:"تحقيق RCA",src_why5:"لماذا الخمس",src_fish:"عظمة السمكة",src_a3:"صفحة A3",src_dmaic:"مشروع DMAIC",src_fmea:"دراسة FMEA",src_capa:"سجل CAPA",src_pdca:"دورة PDCA",src_pareto:"باريتو",src_none:"لا أداة (يُكتب هنا)",
 w_event:"الحدث: ما الذي وقع، وأين، ومتى",w_ev:"الدليل (سجلات، تقارير، صور، بيانات)",w_exp:"المتوقع",w_act:"الفعلي",w_impact:"الأثر (تكلفة، وقت، سلامة، عميل)",w_sev:"جسامة الحدث",sv_low:"منخفضة",sv_med:"متوسطة",sv_high:"جسيمة",
 c_how:"مصدر السبب",ch_link:"من التحليل المرتبط (قراءة فقط)",ch_here:"يُكتب هنا (غير محلل)",c_t:"السبب في جملة واحدة",czTake:"خذ السبب من الأداة المصدر",czTook:"أُخذ السبب من {id} (قراءة فقط). راجعه في جملة واحدة.",czNone:"لا سبب مكتوباً في السجل المصدر بعد.",czNoSrc:"اختر الأداة المصدر واكتب رقم السجل أولاً.",czMiss:"السجل غير موجود في تلك الأداة على هذا المتصفح.",
 naF:"السبب مكتوب هنا دون تحليل، والحدث جسيم. حدث جسيم يحتاج تحليلاً حقيقياً (RCA أو لماذا الخمس أو عظمة السمكة أو A3 أو DMAIC أو FMEA) يُربط هنا.",naI:"السبب مكتوب هنا: «غير محلل». مقبول لحدث غير جسيم، والأفضل ربطه بتحليل.",
 l_when:"عندما… (الموقف الذي يتكرر)",l_dothis:"افعل… (الفعل المحدد)",l_because:"لأن… (ما تعلمناه بالدليل)",l_applies:"أين ينطبق (عملية، نوع مشروع، موقع)",l_excl:"أين لا ينطبق",
 sayW:"عندما",sayD:"افعل",sayB:"لأن",sayNone:"اكتب الدرس قاعدة: عندما… افعل… لأن…",
 blameF:"الصياغة تشير إلى شخص (إهمال، عدم انتباه، خطأ فلان). اكتب ما الذي في العملية سمح بالخطأ، لا من أخطأ.",blameW:"في الدرس أو السبب صياغة تلوم شخصاً. لا تكتمل مرحلة «كُتب الدرس» قبل إعادة صياغتها.",
 acAdd:"إضافة إجراء ترسيخ",acDel:"حذف الإجراء",acNone:"لم تُضف إجراءات بعد. الدرس الذي لا يغيّر وثيقة أو ضابطاً يبقى في الذاكرة فقط.",acKind:"ما الذي يتغيّر",acWhat:"الإجراء",acRef:"مرجع الوثيقة أو رقم دراسة FMEA",acWho:"المسؤول",acBy:"الموعد",acSt:"الحالة",acDone:"تاريخ التنفيذ",acEv:"دليل التغيير (إصدار، سجل، تدريب)",
 kd_proc:"إجراء عمل",kd_form:"نموذج",kd_check:"قائمة فحص",kd_train:"تدريب",kd_fmea:"صف في دراسة FMEA",kd_cplan:"خطة ضبط",kd_design:"معيار تصميم",kd_contract:"بند عقد",kd_other:"أخرى",
 as_plan:"مخطط",as_doing:"قيد التنفيذ",as_done:"نُفّذ",ownF:"الإجراء بلا مسؤول أو موعد.",evF:"نُفّذ الإجراء دون دليل على التغيير أو دون تاريخ تنفيذ.",fmOpen:"افتح في FMEA",fmMiss:"هذه الدراسة غير موجودة في أداة FMEA على هذا المتصفح.",fmHint:"رقم دراسة FMEA التي يُضاف إليها الصف أو يُعدّل.",
 vrDate:"تاريخ التحقق",vrNext:"المشروع أو العملية التالية التي طبّقته",vrRes:"النتيجة",vrEv:"الدليل",vrAdd:"إضافة تحقق",vrNone:"لا تحقق بعد.",rs_worked:"طُبّق ونجح",rs_part:"طُبّق جزئياً",rs_not:"لم يُطبّق",
 vrEarly:"التحقق مؤرخ قبل آخر إجراء ({d}). التحقق يأتي بعد الترسيخ.",vrPart:"آخر تحقق: «{r}». خطط إجراءً إضافياً ثم تحقق من جديد.",
 shDate:"التاريخ",shWho:"من أُبلغ",shHow:"كيف",shAdd:"إضافة تعميم",shNone:"لم يُعمَّم بعد.",
 tmDel:"حذف السطر",
 stT:"ابدأ من أداة أخرى (قراءة فقط)",stS:"اختر تحقيق RCA، أو صفحة A3، أو مشروع DMAIC مغلقاً أو موقوفاً، أو دراسة FMEA فيها مراجعة أو صف أعيد تقييمه، أو سجل CAPA، أو دورة PDCA. يُملأ درس جديد غير محفوظ بالحدث والسبب ورقم المصدر، ولا يُكتب شيء في الأداة الأخرى.",
 stSrc:"المصدر",ss_rca:"تحقيق RCA",ss_a3:"صفحة A3",ss_dmaic:"مشروع DMAIC (مغلق أو موقوف)",ss_fmea:"دراسة FMEA (مراجعة أو إعادة تقييم)",ss_capa:"سجل CAPA",ss_pdca:"دورة PDCA",stPrev:"اعرض",stUse:"ابدأ درساً منه",stNone:"لا توجد بيانات في هذه الأداة على هذا المتصفح بعد.",stEmpty:"لا توجد سجلات مناسبة بعد.",
 stColId:"الرقم",stColT:"العنوان",stColSt:"مرحلته",stColCz:"السبب فيه",stColN:"دروس منه",stColA:"إجراء",
 stUsed:"مُلئ درس جديد من {s} {id}: الحدث والسبب ورقم المصدر. أكمل الدليل والدرس، ثم احفظ.",pfT:"درس — ",
 pvDm2:"{id} · {st} · الأسباب المثبتة: {t}",pvFm:"{id} · {st} · {n} صف تحليل · {a} إجراء أعيد تقييمه · آخر مراجعة {d}",pvPd:"{id} · {st} · {t}",
 hmT:"على هذا المتصفح {n} سجلاً في RCA وA3 وDMAIC وFMEA وCAPA وPDCA يمكن أن يبدأ منها درس.",hmGo:"اعرضها",
 srcHint:"اختر الأداة المصدر ثم اكتب رقم السجل؛ تظهر هنا معاينة بقاعدة تلك الأداة.",srcOpen:"افتح المصدر",
 caHint:"رقم سجل CAPA عندما يكون المصدر حالة عدم مطابقة.",caMiss:"هذا الرقم غير موجود في سجلات CAPA على هذا المتصفح.",caOpen:"افتح CAPA",capaW:"مصدر الدرس حالة عدم مطابقة: اربطه بسجل CAPA الذي يحمل الإجراء التصحيحي.",
 fdT:"اقرأ قبل أن تبدأ",fdS:"قبل بدء مشروع أو تغيير: ابحث في السجل، أو اختر العملية أو نوع المشروع لتظهر القواعد التي تنطبق عليه.",
 fq:"بحث في النص",ftype:"النوع",fstage:"المرحلة",fproc:"العملية",fptype:"نوع المشروع",fsite:"الموقع",fAll:"الكل",fRes:"{n} درس مطابق",fNone:"لا دروس مطابقة.",fHint:"في السجل {n} درس. اكتب كلمة أو اختر نوعاً أو مرحلة أو وسماً للبحث.",
 rbT:"الدروس التي تُقرأ قبل البدء",rbSel:"العملية أو نوع المشروع",rbPick:"— اختر —",rbProc:"العملية",rbPtype:"نوع المشروع",rbNone:"لا قواعد مكتوبة لهذا الاختيار بعد.",rbVer:"تُحقق منه: {n}",rbNotVer:"لم يُتحقق منه بعد",rbExcl:"لا ينطبق على: {t}",rbApp:"ينطبق على: {t}",
 chT:"الدروس حسب المرحلة والنوع",chEmpty:"لا دروس بعد",chN:"العدد",
 e_title:"اكتب عنوان الدرس.",e_date:"تاريخ التحقق أو التنفيذ لا يسبق تاريخ الحدث.",
 fl_ref:"المرجع أو المالك ناقص",fl_date:"النوع أو تاريخ الحدث ناقص",fl_evid:"الحدث أو الدليل ناقص",fl_cause:"السبب ناقص",fl_na:"سبب غير محلل لحدث جسيم",fl_naI:"سبب غير محلل",fl_blame:"صياغة تلوم شخصاً",fl_rule:"الدرس غير مكتوب قاعدة بنطاقها",fl_act:"لا إجراء ترسيخ",fl_own:"{n} إجراء بلا مسؤول أو موعد",fl_open:"{n} إجراء لم يُنفَّذ",fl_ev:"{n} إجراء بلا دليل تغيير",fl_verify:"لم يُتحقق منه بعد",fl_vEarly:"تحقق قبل الترسيخ",fl_vPart:"آخر تحقق لم ينجح كاملاً",fl_share:"لم يُعمَّم",fl_capa:"مصدره عدم مطابقة بلا ربط CAPA",
 oi_ref:"أكمل المرجع والمالك.",oi_date:"حدد نوع الحدث وتاريخه.",oi_evid:"اكتب الحدث ودليله.",oi_cause:"اكتب السبب في جملة واحدة أو خذه من التحليل المرتبط.",oi_na:"الحدث جسيم والسبب غير محلل: اربطه بتحليل حقيقي.",oi_naI:"السبب مكتوب هنا دون تحليل.",oi_blame:"أعد صياغة ما يلوم شخصاً في الدرس أو السبب.",oi_rule:"اكتب الدرس قاعدة: عندما… افعل… لأن… وأين ينطبق.",oi_act:"أضف إجراء ترسيخ بمالك وموعد.",oi_own:"حدد المسؤول والموعد لـ {n} إجراء.",oi_open:"تابع تنفيذ {n} إجراء.",oi_ev:"أضف دليل التغيير لـ {n} إجراء منفذ.",oi_verify:"تحقق في المشروع أو العملية التالية أن الدرس طُبّق ونجح.",oi_vEarly:"أعد التحقق بعد آخر إجراء.",oi_vPart:"آخر تحقق لم ينجح كاملاً: خطط إجراءً إضافياً.",oi_share:"عمّم الدرس على من يحتاجه وسجّل ذلك.",oi_capa:"اربط الدرس بسجل CAPA.",
 exT:"بيانات المثال",exS:"ثلاثة دروس توضيحية لشركة الواحة للمقاولات (شركة سعودية افتراضية): خرسانة الصيف (الماء المبرد في عقود التوريد، وتحقق في مشروع ثانٍ)، ورفع حزم الحديد (نجاح عُمّم: حزم مربوطة وحبلان معياراً للشركة، ووزن الحزمة على بطاقتها)، والمعايرة (أوامر الاستئجار تشترط الشهادة؛ ينتظر التحقق). ليست بيانات حقيقية.",exLoad:"تحميل المثال",exClear:"مسح كل البيانات",exLoaded:"تم تحميل المثال.",exCleared:"تم مسح كل البيانات.",exConfirmClear:"سيُحذف كل ما حُفظ في أداة الدروس المستفادة على هذا المتصفح (الدروس والتقييم الذاتي). هل تريد المتابعة؟",
 dT:"السجلات",dS:"كل الدروس المحفوظة على هذا المتصفح. افتح درساً لتعديله، أو احذفه بضغطتين.",csv:"تصدير CSV",none:"لا توجد دروس بعد.",open:"فتح",del:"حذف",delArm:"اضغط مرة أخرى للحذف",
 colRef:"الدرس",colType:"النوع · المصدر",colStage:"المرحلة",colRule:"القاعدة",colActs:"الترسيخ",colVer:"التحقق",colFlags:"تنبيهات",colAct:"إجراءات",actsN:"{d}/{n} نُفّذ",verN:"{d} · {x}",
 auT:"التدقيق الآلي",auS:"أحد عشر فحصاً لكل درس. «—» تعني أن الفحص لا ينطبق بعد على مرحلة الدرس.",auEmpty:"لا توجد دروس لتدقيقها.",auRec:"الدروس",auPass:"نسبة الفحوص الناجحة",auFail:"دروس فيها فحص راسب",auOpen:"بنود مفتوحة",
 k_ref:"المرجع والمالك",k_date:"النوع والتاريخ",k_evid:"الدليل",k_cause:"السبب",k_rule:"قاعدة بنطاقها",k_blame:"بلا لوم",k_act:"إجراء بمالك وموعد",k_embed:"تغيير بدليل",k_verify:"تحقق بعد الإجراءات",k_shared:"التعميم",k_capa:"ربط CAPA",
 dashT:"لوحة المؤشرات",dashS:"تُحسب من الدروس والتقييم الذاتي المحفوظة على هذا المتصفح.",kTotal:"الدروس",kEmb:"رُسّخت (تغيّرت وثيقة أو ضابط)",kVer:"تُحقق منها وطُبّقت ونجحت",kShr:"عُمّمت",kActs:"إجراءات الترسيخ المنفذة",kBlame:"تنبيهات لوم",kOpen:"بنود مفتوحة",kAud:"نجاح التدقيق",kAs:"التقييم الذاتي",
 byStage:"الدروس حسب المرحلة",byType:"الدروس حسب النوع",bySrc:"الدروس حسب الأداة المصدر",byAssess:"التقييم الذاتي حسب المحور",openT:"بنود تحتاج متابعة",noData:"لا توجد بيانات بعد.",noOpen:"لا بنود مفتوحة.",
 rpT:"التقرير",rpS:"تقرير HTML جاهز للطباعة أو الحفظ PDF، وملف CSV للدروس.",rpHtml:"تنزيل تقرير HTML",rpNote:"التقرير يضم الغلاف والملخص والسجل بكل درس ومرحلته وإجراءاته وتحققه، وقائمة «اقرأ قبل أن تبدأ» لعملية، ونتائج التدقيق والبنود المفتوحة والتقييم الذاتي.",rpPrev:"معاينة سريعة",rpEmpty:"لا توجد بيانات للتقرير بعد.",
 rpCover:"سجل الدروس المستفادة",rpReg:"السجل",rpWhat:"ما الذي حدث",rpCz:"السبب",rpLs:"الدرس",rpActs:"إجراءات الترسيخ",rpVer:"التحقق",rpSh:"التعميم",rpAu:"نتيجة التدقيق",rpRb:"اقرأ قبل أن تبدأ — {t}",
 aiT:"المساعد الذكي — قيد الإنشاء",aiS:"سيقرأ المساعد السجل ويقترح الدروس التي تنطبق على مشروع جديد، ولن يكتب الدرس بدلاً من الفريق.",aiList:["يقترح الدروس التي تُقرأ قبل بدء مشروع أو تغيير","ينبّه إلى الدروس التي لم تُرسّخ أو لم يُتحقق منها","يقترح صياغة الدرس قاعدة بلا لوم"],
 yes:"نعم",no:"لا",langNote:""},
en:{brand:"Continual Improvement Academy · مدثر سلامه",toolName:"Lessons Learned tool — lessons register",sgLearn:"Learn",sgWork:"Work",sgOut:"Outputs",
 nHome:"Home",nStd:"Method guide",nCl:"Clause guide",nAssess:"Self-assessment",nTools:"Lessons register",nDocs:"Records",nAudit:"Audit",nDash:"Dashboard",nReport:"Report",nAi:"AI Assistant",soon:"Soon",
 homeCode:"What happened · cause · lesson · embed · verify · share",homeH1:"Lessons learned",
 homeLede:"A register of lessons that changes the next project: what happened and the evidence, its cause from a real analysis, the lesson as a rule someone else can apply — \"When…, do…, because…\" —, then an action that changes a procedure, a form, a training or an FMEA row, then a check that the next project applied it and it worked, then sharing. Successes are lessons too.",
 homeNote:"This version keeps lessons in your browser only. Server storage and sign-in come with the shared platform stage.",
 prep:"Prepared by",authorName:"مدثر سلامه",cycleT:"What you can do here",cycleS:"Read the method guide, assess your lessons-learned practice, then record a first lesson from an RCA investigation, an A3, a DMAIC project, an FMEA study, a CAPA record or a PDCA cycle — or search the register before a new project starts.",
 tStd:"When a lesson is really learned: the event and its evidence, the cause from a real analysis, the lesson as a rule, embedding in documents and controls, verification on the next project, sharing, reading before you start, the common gaps and what an auditor asks for.",tCl:"The ISO 9001:2026 clauses the practice serves: organizational knowledge 7.1.6, communication 7.4, planning and changes 8.1 and 8.5.6, analysis 9.1.3, corrective action 10.2.1 e) and f), improvement 10.1, with ISO 9000:2026, ISO 10009:2024 clause 15 and ISO 19011:2026: an interpretive summary, an example and what the auditor asks for.",tAssess:"Twelve questions on your lessons-learned practice, from capture to the periodic review of the register.",
 tTools:"One record per lesson: what happened, the cause, the lesson as a rule, embedding actions, verification and sharing, with a search of the register and a \"read before you start\" list for a process or a project type.",tDocs:"Every lesson with its stage, type and flags, and the example data.",tAudit:"An automatic check of each lesson: reference and owner, type and date, evidence, cause, the rule, blame-free wording, embedding actions, done with evidence, verification after the actions, sharing and the CAPA link.",
 tDash:"Lessons embedded, verified and shared, stages, types and sources, a chart of lessons by stage and type, open items and the self-assessment.",tReport:"An HTML report with the register and each lesson's stage, actions and verification, the \"read before you start\" list for a process, the audit, open items and the self-assessment, and a CSV file.",tAi:"An assistant that reads the register and suggests the lessons that fit a new project. Not active yet.",
 foot:"Sources: ISO 9001:2026 clauses 7.1.6, 7.4, 8.1, 8.5.6, 9.1.3, 9.3.2, 10.1 and 10.2.1 and Annex A.7.1.6; ISO 9000:2026 3.2.4, 3.10.4, 4.2.4, 4.2.6, 4.2.7 and 4.3.9; ISO 10009:2024 clause 15; ISO 19011:2026 5.7, 6.3.2.2 and 6.6 (interpretive summaries, not the official text). Lessons learned is a practice, not a requirement of any standard. Examples are illustrative, not real data.",
 heroTag:"Method tool · knowledge that changes the next project",langSw:"العربية",langSwA:"التبديل إلى العربية",logoAlt:"Continual Improvement Academy — مدثر سلامه",
 related:"Related tools in the academy",rel_fmea:"FMEA — failure mode and effects analysis",rel_dmaic:"DMAIC improvement project",rel_a3:"A3 problem solving",rel_rca:"Root cause analysis — investigation",rel_pareto:"Pareto — vital few analysis",rel_fish:"Fishbone — cause and effect",rel_why5:"5 Whys — root cause analysis",rel_capa:"Corrective action",rel_pdca:"PDCA cycle",rel_iso10009:"ISO 10009 quality tools guide",
 termT:"Is lessons learned a requirement of ISO 9001:2026?",
 termP1:"No. Lessons learned is a practice, not a requirement of any standard, and ISO 10009:2024 does not review it as a tool of its own; the nearest content is clause 15 (improvement), with suggestion schemes among the other relevant tools in 15.6 (the words \"lessons learned\" do not appear in its text); the storyboard of the platform's ISO 10009 guide has a lessons-learned field. ISO 9001:2026 asks the organization to determine the knowledge needed to operate its processes, and to retain, apply and share it to the extent necessary (7.1.6); to update the risks and make changes to the system, if necessary, after a nonconformity (10.2.1 e) and f)); and to improve continually (10.1). The practice is a structured way to do that.",
 termP2:"The rule here: a lesson is not \"learned\" until a document, a control or a practice has changed and the next project used it and it worked. A success is a lesson as much as a failure. The wording is blame-free: a lesson that names a person is flagged, with the same rule as FMEA, DMAIC, A3 and RCA. A register nobody reads is a gap: it is searched at the start of each project or change (7.1.6, 8.1 and 8.5.6), and its lessons feed FMEA rows and control plans.",
 termP3:"Lessons learned uses the toolbox rather than replacing it: the cause comes from RCA, 5 Whys, Fishbone, A3 or DMAIC, the risk from FMEA, the corrective action from CAPA when a nonconformity is involved, and the follow-up from PDCA. The tool does not analyse again; it takes the cause from the linked analysis, read-only.",
 termIs:"Interpretive summary in independent wording, not the official text. Sources: ISO 9001:2026 clauses 7.1.6, Annex A.7.1.6, 10.1 and 10.2.1; ISO 9000:2026 3.2.4, 3.10.4, 4.2.4 and 4.2.6; ISO 10009:2024 clause 15 and 15.6 (from the uploaded official file); ISO 19011:2026 5.7, 6.3.2.2 and 6.6. Any reference to ISO 30401 (named in a note of Annex A.7.1.6) or to PMBOK or PRINCE2 lessons logs is not uploaded: \"not verified\". Checked: 2026-10-16.",
 defs:[["Event and evidence","What happened · evidence","What actually happened (a problem, a near miss, a success, an audit finding, a project close-out, customer feedback), with its evidence, and expected against actual.","#7A869E"],["Cause","From an analysis","One sentence taken from a real, linked analysis; it is not analysed again here. A cause written here is \"not analysed\".","#3563C9"],["The lesson as a rule","When · do · because","A rule someone else can apply, with where it applies and where it does not. No blame on people.","#1B2A4A"],["Embedding","Document · control · training","An action that changes a procedure, a form, a checklist, a training, an FMEA row or a control plan, with an owner, a date and evidence.","#B8901E"],["Verification and sharing","The next project","A dated check after the actions that the next project or process applied the lesson and it worked, then telling those who need it.","#3C9A5F"]],
 asT:"Self-assessment of lessons-learned practice",asS:"Answer each question with what actually happens in your organization. The score measures current practice; it is not a certificate or a judgement of performance.",asReset:"Clear answers",asSaved:"Answer saved",asAnswered:"{n} of 12 answered",
 band0:"Needs work",band1:"Developing",band2:"Established",bandNote:"Internal self-assessment bands designed for this tool, not an official benchmark.",as0:"Not in place",as1:"Partly",as2:"In place and applied",
 g_CP:"Capture: event, evidence and cause",g_RL:"The lesson: a blame-free rule with an owner",g_EM:"Embedding and use",g_VS:"Verification, sharing and review",
 tlT:"Lessons register",tlS:"One lesson per event: what happened and the evidence, the cause from the linked analysis, the lesson as a rule, embedding actions, verification on the next project, and sharing. The stage is set from what you fill in.",
 save:"Save lesson",newRec:"New lesson",savedFail:"Could not save in this browser. Download the report before closing the page.",cur:"Current stage:",ok_rec:"Lesson saved",
 st_draft:"Draft",st_captured:"Captured",st_cause:"Cause linked",st_lesson:"Lesson written",st_planned:"Actions planned",st_embedded:"Embedded",st_verified:"Verified",st_shared:"Shared",
 mp_captured:"Event and evidence",mp_cause:"Cause from an analysis",mp_lesson:"The lesson as a rule",mp_planned:"Actions with owner and date",mp_embedded:"A document or control changed",mp_verified:"The next project used it",mp_shared:"Told those who need it",
 mapT:"Lesson stages",mpDone:"Complete",mpCur:"In progress",mpTodo:"Not started",
 sHdrT:"Lesson details",sHdrS:"Reference, type, date of the event, area or project, owner, reviewers, the source tool and its record id, and the tags the register is searched by.",
 sWhT:"1 · What happened",sWhS:"The event as it happened, the evidence, expected against actual, and the impact. Write facts, not opinions.",
 sCzT:"2 · Cause",sCzS:"One sentence. Take it from the linked analysis (read-only); do not analyse again here. A cause written here carries a \"not analysed\" flag and is not accepted for a severe event.",
 sLsT:"3 · The lesson",sLsS:"A rule someone else can apply: When…, do…, because… then where it applies and where it does not.",
 sAcT:"4 · Embedding actions",sAcS:"What changes so the lesson does not depend on memory: a procedure, a form, a checklist, a training, an FMEA row, a control plan, a design standard, a contract clause. Each with an owner, a due date and evidence of the change.",
 sVrT:"5 · Verification",sVrS:"After the actions: did the next project or process apply the lesson? Did it work? With a date and evidence.",
 sShT:"6 · Sharing",sShS:"Who was told, how and when. A lesson that does not reach those who need it changes nothing.",
 f_title:"Lesson title *",f_ref:"Reference (event or project number)",f_type:"Type of event",f_date:"Date of the event",f_area:"Area or department",f_project:"Project",f_owner:"Lesson owner",f_reviewers:"Reviewers",f_src:"Source tool",f_srcId:"Record id in the source tool",f_capa:"CAPA record (optional)",f_proc:"Process tag",f_ptype:"Project type tag",f_site:"Site tag",f_nc:"A nonconformity is the source of this lesson (a CAPA record must be linked)",
 ty_problem:"Problem",ty_near:"Near miss",ty_success:"Success",ty_audit:"Audit finding",ty_closeout:"Project close-out",ty_customer:"Customer feedback",
 src_rca:"RCA investigation",src_why5:"5 Whys",src_fish:"Fishbone",src_a3:"A3",src_dmaic:"DMAIC project",src_fmea:"FMEA study",src_capa:"CAPA record",src_pdca:"PDCA cycle",src_pareto:"Pareto",src_none:"No tool (written here)",
 w_event:"The event: what happened, where and when",w_ev:"Evidence (records, reports, photos, data)",w_exp:"Expected",w_act:"Actual",w_impact:"Impact (cost, time, safety, customer)",w_sev:"Severity of the event",sv_low:"Low",sv_med:"Medium",sv_high:"Severe",
 c_how:"Source of the cause",ch_link:"From the linked analysis (read-only)",ch_here:"Written here (not analysed)",c_t:"The cause in one sentence",czTake:"Take the cause from the source tool",czTook:"The cause was taken from {id} (read-only). Review it as one sentence.",czNone:"No cause written in the source record yet.",czNoSrc:"Pick the source tool and enter the record id first.",czMiss:"The record is not in that tool in this browser.",
 naF:"The cause is written here without an analysis, and the event is severe. A severe event needs a real analysis (RCA, 5 Whys, Fishbone, A3, DMAIC or FMEA) linked here.",naI:"The cause is written here: \"not analysed\". Acceptable for an event that is not severe; linking an analysis is better.",
 l_when:"When… (the situation that comes back)",l_dothis:"Do… (the specific action)",l_because:"Because… (what we learned, with evidence)",l_applies:"Where it applies (process, project type, site)",l_excl:"Where it does not apply",
 sayW:"When",sayD:"do",sayB:"because",sayNone:"Write the lesson as a rule: When…, do…, because…",
 blameF:"The wording names a person (negligence, inattention, someone's mistake). Write what in the process allowed the error, not who made it.",blameW:"The lesson or the cause blames a person. The \"lesson written\" stage is not complete until it is rewritten.",
 acAdd:"Add embedding action",acDel:"Delete action",acNone:"No actions yet. A lesson that changes no document or control stays in memory only.",acKind:"What changes",acWhat:"Action",acRef:"Document reference or FMEA study id",acWho:"Owner",acBy:"Due",acSt:"Status",acDone:"Date done",acEv:"Evidence of the change (issue, record, training)",
 kd_proc:"Procedure",kd_form:"Form",kd_check:"Checklist",kd_train:"Training",kd_fmea:"FMEA row",kd_cplan:"Control plan",kd_design:"Design standard",kd_contract:"Contract clause",kd_other:"Other",
 as_plan:"Planned",as_doing:"In progress",as_done:"Done",ownF:"The action has no owner or due date.",evF:"The action is done with no evidence of the change or no date done.",fmOpen:"Open in FMEA",fmMiss:"This study is not in the FMEA tool in this browser.",fmHint:"The FMEA study where the row is added or changed.",
 vrDate:"Date checked",vrNext:"The next project or process that used it",vrRes:"Result",vrEv:"Evidence",vrAdd:"Add verification",vrNone:"No verification yet.",rs_worked:"Applied and worked",rs_part:"Applied, partly",rs_not:"Not applied",
 vrEarly:"The verification is dated before the last action ({d}). Verification comes after the embedding.",vrPart:"Last verification: \"{r}\". Plan a further action, then check again.",
 shDate:"Date",shWho:"Who was told",shHow:"How",shAdd:"Add sharing",shNone:"Not shared yet.",
 tmDel:"Delete row",
 stT:"Start from another tool (read-only)",stS:"Pick an RCA investigation, an A3, a closed or stopped DMAIC project, an FMEA study with a review or a re-rated row, a CAPA record or a PDCA cycle. A new, unsaved lesson is filled with the event, the cause and the source id; nothing is written to the other tool.",
 stSrc:"Source",ss_rca:"RCA investigation",ss_a3:"A3",ss_dmaic:"DMAIC project (closed or stopped)",ss_fmea:"FMEA study (review or re-rating)",ss_capa:"CAPA record",ss_pdca:"PDCA cycle",stPrev:"Show",stUse:"Start a lesson from it",stNone:"No data in that tool in this browser yet.",stEmpty:"No suitable records yet.",
 stColId:"Id",stColT:"Title",stColSt:"Its stage",stColCz:"Its cause",stColN:"Lessons from it",stColA:"Action",
 stUsed:"A new lesson was filled from {s} {id}: the event, the cause and the source id. Complete the evidence and the lesson, then save.",pfT:"Lesson — ",
 pvDm2:"{id} · {st} · proved causes: {t}",pvFm:"{id} · {st} · {n} analysis rows · {a} actions re-rated · last review {d}",pvPd:"{id} · {st} · {t}",
 hmT:"In this browser {n} record(s) in RCA, A3, DMAIC, FMEA, CAPA and PDCA can start a lesson.",hmGo:"Show them",
 srcHint:"Pick the source tool, then enter the record id; a preview by that tool's own rule shows here.",srcOpen:"Open the source",
 caHint:"The CAPA record id when a nonconformity is the source.",caMiss:"This id is not in the CAPA records in this browser.",caOpen:"Open CAPA",capaW:"A nonconformity is the source of this lesson: link it to the CAPA record that carries the corrective action.",
 fdT:"Read before you start",fdS:"Before a project or a change starts: search the register, or pick the process or the project type to see the rules that apply to it.",
 fq:"Search the text",ftype:"Type",fstage:"Stage",fproc:"Process",fptype:"Project type",fsite:"Site",fAll:"All",fRes:"{n} matching lesson(s)",fNone:"No matching lessons.",fHint:"The register holds {n} lesson(s). Type a word or pick a type, a stage or a tag to search.",
 rbT:"Lessons to read before you start",rbSel:"Process or project type",rbPick:"— pick —",rbProc:"Process",rbPtype:"Project type",rbNone:"No rules written for this choice yet.",rbVer:"Verified: {n}",rbNotVer:"Not verified yet",rbExcl:"Does not apply to: {t}",rbApp:"Applies to: {t}",
 chT:"Lessons by stage and type",chEmpty:"No lessons yet",chN:"Count",
 e_title:"Enter the lesson title.",e_date:"A verification or an action date cannot be before the date of the event.",
 fl_ref:"Reference or owner missing",fl_date:"Type or date of the event missing",fl_evid:"Event or evidence missing",fl_cause:"Cause missing",fl_na:"Cause not analysed for a severe event",fl_naI:"Cause not analysed",fl_blame:"Wording blames a person",fl_rule:"Lesson not written as a rule with its scope",fl_act:"No embedding action",fl_own:"{n} action(s) with no owner or date",fl_open:"{n} action(s) not done",fl_ev:"{n} action(s) with no evidence of the change",fl_verify:"Not verified yet",fl_vEarly:"Verified before the embedding",fl_vPart:"Last verification did not fully work",fl_share:"Not shared",fl_capa:"Nonconformity source with no CAPA link",
 oi_ref:"Complete the reference and the owner.",oi_date:"Set the type and the date of the event.",oi_evid:"Write the event and its evidence.",oi_cause:"Write the cause in one sentence, or take it from the linked analysis.",oi_na:"The event is severe and the cause is not analysed: link a real analysis.",oi_naI:"The cause is written here without an analysis.",oi_blame:"Rewrite what blames a person in the lesson or the cause.",oi_rule:"Write the lesson as a rule: When…, do…, because… and where it applies.",oi_act:"Add an embedding action with an owner and a due date.",oi_own:"Name the owner and due date of {n} action(s).",oi_open:"Follow up {n} action(s).",oi_ev:"Add the evidence of the change for {n} completed action(s).",oi_verify:"Check on the next project or process that the lesson was applied and worked.",oi_vEarly:"Check again after the last action.",oi_vPart:"The last verification did not fully work: plan a further action.",oi_share:"Share the lesson with those who need it and record it.",oi_capa:"Link the lesson to a CAPA record.",
 exT:"Example data",exS:"Three illustrative lessons for Al-Waha Contracting (a fictitious Saudi company): summer concrete (chilled water in the supply contracts, verified on a second project), lifting rebar bundles (a success shared: banded bundles and two slings as a company standard, the bundle weight on its tag), and calibration (rental orders that require the certificate; waiting for verification). Not real data.",exLoad:"Load example",exClear:"Clear all data",exLoaded:"Example loaded.",exCleared:"All data cleared.",exConfirmClear:"Everything saved in the Lessons Learned tool in this browser (lessons and self-assessment) will be deleted. Continue?",
 dT:"Records",dS:"Every lesson saved in this browser. Open a lesson to edit it, or delete it with two clicks.",csv:"Export CSV",none:"No lessons yet.",open:"Open",del:"Delete",delArm:"Click again to delete",
 colRef:"Lesson",colType:"Type · source",colStage:"Stage",colRule:"Rule",colActs:"Embedding",colVer:"Verification",colFlags:"Flags",colAct:"Actions",actsN:"{d}/{n} done",verN:"{d} · {x}",
 auT:"Automatic audit",auS:"Eleven checks on each lesson. \"—\" means the check does not apply yet at the lesson's stage.",auEmpty:"No lessons to audit.",auRec:"Lessons",auPass:"Checks passed",auFail:"Lessons with a failed check",auOpen:"Open items",
 k_ref:"Reference and owner",k_date:"Type and date",k_evid:"Evidence",k_cause:"Cause",k_rule:"Rule with its scope",k_blame:"Blame-free",k_act:"Action with owner and date",k_embed:"Change with evidence",k_verify:"Verified after the actions",k_shared:"Shared",k_capa:"CAPA link",
 dashT:"Dashboard",dashS:"Computed from the lessons and the self-assessment saved in this browser.",kTotal:"Lessons",kEmb:"Embedded (a document or control changed)",kVer:"Verified as applied and working",kShr:"Shared",kActs:"Embedding actions done",kBlame:"Blame flags",kOpen:"Open items",kAud:"Audit pass",kAs:"Self-assessment",
 byStage:"Lessons by stage",byType:"Lessons by type",bySrc:"Lessons by source tool",byAssess:"Self-assessment by area",openT:"Items to follow up",noData:"No data yet.",noOpen:"No open items.",
 rpT:"Report",rpS:"An HTML report ready to print or save as PDF, and a CSV file of the lessons.",rpHtml:"Download HTML report",rpNote:"The report has the cover, the summary, the register with each lesson, its stage, actions and verification, the \"read before you start\" list for one process, then the audit results, the open items and the self-assessment.",rpPrev:"Quick preview",rpEmpty:"No data for the report yet.",
 rpCover:"Lessons learned register",rpReg:"The register",rpWhat:"What happened",rpCz:"Cause",rpLs:"The lesson",rpActs:"Embedding actions",rpVer:"Verification",rpSh:"Sharing",rpAu:"Audit result",rpRb:"Read before you start — {t}",
 aiT:"AI Assistant — under construction",aiS:"The assistant will read the register and suggest the lessons that fit a new project; it will not write the lesson on the team's behalf.",aiList:["Suggests the lessons to read before a project or a change starts","Flags lessons that are not embedded or not verified","Suggests blame-free wording of the lesson as a rule"],
 yes:"Yes",no:"No",langNote:""}
};
/* the other tools' stage names and preview wording (copied at build time from tests/build/dmaic_host.js, fmea_host.js and modules/pdca.html) */
/*__TBX_UI__*/
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
function num(v){ if(v===null||v===undefined||String(v).trim()==="") return null; var n=Number(String(v).replace(/,/g,"")); return isFinite(n)?n:null; }
function fmtN(v){ return (v===null||v===undefined||v===""||(typeof v==="number"&&!isFinite(v)))?"—":Number(v).toLocaleString("en-US",{maximumFractionDigits:2}); }
function low(s){ return txt(s).toLowerCase().replace(/\s+/g," "); }
/* search text: lower case, Arabic letter forms folded, diacritics dropped */
function norm(s){ return String(s==null?"":s).replace(/[ً-ْـ]/g,"").replace(/[أإآ]/g,"ا").replace(/ة/g,"ه").replace(/ى/g,"ي").toLowerCase().replace(/\s+/g," ").trim(); }

/* ---------- records ---------- */
function blankAc(id){ return {id:id||"",kind:"proc",what:"",ref:"",who:"",by:"",st:"plan",done:"",ev:""}; }
function blankVr(){ return {id:"",date:"",next:"",res:"worked",ev:""}; }
function blankSh(){ return {id:"",date:"",who:"",how:""}; }
function blank(){ return {id:"",title:"",ref:"",type:"problem",date:"",area:"",project:"",owner:"",reviewers:"",src:"none",srcId:"",nc:false,capa:"",
 tags:{proc:"",ptype:"",site:""},what:{event:"",ev:"",exp:"",act:"",impact:"",sev:"med"},cause:{how:"here",t:""},
 lesson:{when:"",dothis:"",because:"",applies:"",excl:""},acts:[],ver:[],share:[],created:"",updated:""}; }
function fixAc(x){ return {id:str(x.id),kind:pick(x.kind,KINDS)||"other",what:str(x.what),ref:str(x.ref),who:str(x.who),by:str(x.by),st:pick(x.st,ASTS)||"plan",done:str(x.done),ev:str(x.ev)}; }
function fixVr(x){ return {id:str(x.id),date:str(x.date),next:str(x.next),res:pick(x.res,VRES)||"worked",ev:str(x.ev)}; }
function fixSh(x){ return {id:str(x.id),date:str(x.date),who:str(x.who),how:str(x.how)}; }
function ids(list,pre){ var used={}, n=0, re=new RegExp("^"+pre+"(\\d+)$");
 list.forEach(function(c){ var m=re.exec(c.id); if(m&&!used[c.id]){ used[c.id]=1; n=Math.max(n,+m[1]); } else c.id=""; });
 list.forEach(function(c){ if(!c.id){ n++; c.id=pre+n; used[c.id]=1; } }); }
/* a lesson saved with missing or broken parts gets empty ones, so rendering never throws; every action, check and sharing gets an id */
function fixRec(r){
 ["id","title","ref","type","date","area","project","owner","reviewers","src","srcId","capa","created","updated"].forEach(function(k){ r[k]=str(r[k]); });
 if(TYPES.indexOf(r.type)<0) r.type="problem"; if(SRCS.indexOf(r.src)<0) r.src="none"; r.nc=r.nc===true;
 var tg=obj(r.tags); r.tags={proc:str(tg.proc),ptype:str(tg.ptype),site:str(tg.site)};
 var w=obj(r.what); r.what={event:str(w.event),ev:str(w.ev),exp:str(w.exp),act:str(w.act),impact:str(w.impact),sev:pick(w.sev,SEVS)||"med"};
 var c=obj(r.cause); r.cause={how:pick(c.how,CHOWS)||"here",t:str(c.t)};
 var l=obj(r.lesson); r.lesson={when:str(l.when),dothis:str(l.dothis),because:str(l.because),applies:str(l.applies),excl:str(l.excl)};
 r.acts=arr(r.acts).map(fixAc).slice(0,MAXACTS); ids(r.acts,"e");
 r.ver=arr(r.ver).map(fixVr).slice(0,MAXVER); ids(r.ver,"v");
 r.share=arr(r.share).map(fixSh).slice(0,MAXSH); ids(r.share,"s");
 return r;
}
function load(){ return TBX.load(STORE,function(v){ if(!Array.isArray(v.records)) v.records=[]; v.records=v.records.filter(function(r){ return r&&typeof r==="object"; }); v.records.forEach(fixRec); if(!v.assess||typeof v.assess!=="object") v.assess={}; return v; },function(){ return {records:[],assess:{}}; }); }
function persist(){ return TBX.save(STORE,DB); }

/* ---------- the lesson's rules ---------- */
/* wording that blames a person (the same rule as the FMEA, DMAIC, A3 and RCA tools) */
var PERSON=/(خطأ\s*(بشري|العامل|الموظف|الفني|المشغل|السائق|الشخص|الرافع|المشرف)|إهمال|اهمال|تقصير|عدم\s*(انتباه|الانتباه|تركيز|التركيز)|سهو|لامبالاة|human\s*error|operator\s*error|worker\s*error|staff\s*error|employee\s*error|rigger\s*error|driver\s*error|negligen|careless|inattent|not\s*paying\s*attention|lack\s*of\s*attention|complacen)/i;
function personOnly(s){ return PERSON.test(String(s||"")); }
function capOk(r){ return !!(txt(r.title)&&TYPES.indexOf(r.type)>=0&&isD(r.date)&&txt(r.owner)&&txt(r.what.event)&&txt(r.what.ev)); }
/* a severe event that is not a success needs a real, linked analysis */
function severe(r){ return r.what.sev==="high"&&r.type!=="success"; }
function linked(r){ return r.cause.how==="link"&&r.src!=="none"&&!!txt(r.srcId); }
function notAnalysed(r){ return !!txt(r.cause.t)&&!linked(r); }
function naBad(r){ return notAnalysed(r)&&severe(r); }
function causeOk(r){ return !!txt(r.cause.t)&&!personOnly(r.cause.t)&&(linked(r)||!severe(r)); }
function ruleOk(r){ var x=r.lesson; return !!(txt(x.when)&&txt(x.dothis)&&txt(x.because)&&txt(x.applies)); }
/* the parts of the lesson (and its cause) that blame a person */
var BLAMEK=["t","when","dothis","because"];
function blameOf(r){ return BLAMEK.filter(function(k){ return personOnly(k==="t"?r.cause.t:r.lesson[k]); }); }
function lessonOk(r){ return ruleOk(r)&&!blameOf(r).length; }
function acts(r){ return r.acts.filter(function(a){ return txt(a.what); }); }
function actOwned(a){ return !!(txt(a.who)&&isD(a.by)); }
function actDone(a){ return a.st==="done"&&isD(a.done)&&!!txt(a.ev); }
function unowned(r){ return acts(r).filter(function(a){ return !actOwned(a); }); }
function notDone(r){ return acts(r).filter(function(a){ return a.st!=="done"; }); }
function noEv(r){ return acts(r).filter(function(a){ return a.st==="done"&&!actDone(a); }); }
function planOk(r){ return acts(r).length>0&&!unowned(r).length; }
function embedOk(r){ return planOk(r)&&acts(r).every(actDone); }
function lastAct(r){ var d=acts(r).map(function(a){ return a.st==="done"?a.done:""; }).filter(isD).sort(); return d.length?d[d.length-1]:""; }
function vers(r){ return r.ver.filter(function(v){ return isD(v.date)||txt(v.next)||txt(v.ev); }); }
function lastVer(r){ var V=r.ver.filter(function(v){ return isD(v.date); }).sort(function(a,b){ return a.date<b.date?-1:(a.date>b.date?1:0); }); return V.length?V[V.length-1]:null; }
/* verified: the latest dated check is after the last action, names the next project or process, says "applied and worked" and has evidence */
function verGood(r,v){ var la=lastAct(r); return !!v&&isD(v.date)&&(!la||v.date>=la)&&!!txt(v.next)&&v.res==="worked"&&!!txt(v.ev); }
function verOk(r){ return embedOk(r)&&verGood(r,lastVer(r)); }
function vEarly(r){ var v=lastVer(r), la=lastAct(r); return !!v&&!!la&&v.date<la; }
function vPart(r){ var v=lastVer(r); return !!v&&v.res!=="worked"; }
function shares(r){ return r.share.filter(function(s){ return isD(s.date)&&txt(s.who)&&txt(s.how); }); }
function shareOk(r){ return verOk(r)&&shares(r).length>0; }
function capaNeed(r){ return r.nc||r.src==="capa"; }
var STOK=[capOk,causeOk,lessonOk,planOk,embedOk,verOk,shareOk];
function stageOf(r){ var k=0; while(k<STOK.length&&STOK[k](r)) k++; return STAGES[k]; }
function stageName(s){ return t("st_"+s); }
function stIdx(r){ return STAGES.indexOf(stageOf(r)); }
function atLeast(r,s){ return stIdx(r)>=STAGES.indexOf(s); }
function codes(r){ var o={}; r.acts.forEach(function(a,i){ o[a.id]="E"+(i+1); }); r.ver.forEach(function(v,i){ o[v.id]="V"+(i+1); }); r.share.forEach(function(s,i){ o[s.id]="S"+(i+1); }); return o; }
/* the lesson as one sentence, in the reader's language */
function ruleSay(r,lang){ var x=r.lesson, tt=function(k){ return (UI[lang||L]||UI.ar)[k]; }; if(!txt(x.when)&&!txt(x.dothis)&&!txt(x.because)) return "";
 var en=(lang||L)==="en"; return tt("sayW")+" "+txt(x.when)+": "+txt(x.dothis)+(en?", ":"، ")+tt("sayB")+" "+txt(x.because)+"."; }
/* one list of what is still open in a lesson; flags (records) and open items (dashboard, report) read it */
function issues(r){
 var o=[];
 if(!(txt(r.ref)&&txt(r.owner))) o.push(["ref","warn",{}]);
 if(!isD(r.date)) o.push(["date","warn",{}]);
 if(!(txt(r.what.event)&&txt(r.what.ev))) o.push(["evid","warn",{}]);
 if(!txt(r.cause.t)) o.push(["cause","warn",{}]);
 else if(naBad(r)) o.push(["na","bad",{}]);
 else if(notAnalysed(r)) o.push(["naI","info",{}]);
 if(blameOf(r).length) o.push(["blame","bad",{}]);
 if(!ruleOk(r)) o.push(["rule","warn",{}]);
 if(atLeast(r,"lesson")&&!acts(r).length) o.push(["act","warn",{}]);
 var uo=unowned(r).length; if(uo) o.push(["own","warn",{n:uo}]);
 var nd=notDone(r).length; if(nd) o.push(["open","info",{n:nd}]);
 var ne=noEv(r).length; if(ne) o.push(["ev","warn",{n:ne}]);
 if(embedOk(r)&&!lastVer(r)) o.push(["verify","info",{}]);
 if(embedOk(r)&&vEarly(r)) o.push(["vEarly","warn",{}]);
 if(embedOk(r)&&!vEarly(r)&&vPart(r)) o.push(["vPart","warn",{}]);
 if(verOk(r)&&!shares(r).length) o.push(["share","info",{}]);
 if(capaNeed(r)&&!txt(r.capa)) o.push(["capa","warn",{}]);
 return o;
}
function flagsOf(r){ return issues(r).map(function(x){ return [t("fl_"+x[0],x[2]),x[1]]; }); }
function openItems(){ var out=[]; DB.records.forEach(function(r){ issues(r).forEach(function(x){ out.push({r:r,k:x[1],s:t("oi_"+x[0],x[2])}); }); }); return out; }
function chip(x){ return '<span class="ca-chip '+x[1]+'">'+esc(x[0])+'</span>'; }
function stChip(s){ return '<span class="pd-badge" style="background:'+SCOL[s]+';color:#fff">'+esc(stageName(s))+'</span>'; }

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
 document.getElementById("caSteps").setAttribute("aria-label",t("mapT"));
 applyLogo(); buildRelated(); stSelects(); buildFind();
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
 if(inHub()){ try{ if(window.parent.ciaOpenFile(file,tab)) return true; }catch(e){} }
 try{ window.open("./"+file+(tab?"#"+tab:""),"_blank","noopener"); }catch(e){}
 return false;
}
/* another tool on a given request: its own address outside the hub, its own one-time hint inside it */
function openWith(file,navKey,q,qs){
 if(inHub()){ try{ sessionStorage.setItem(navKey,JSON.stringify(q)); }catch(e){} try{ if(window.parent.ciaOpenFile(file)) return; }catch(e){} try{ sessionStorage.removeItem(navKey); }catch(e){} }
 try{ window.open("./"+file+(qs||"")+"#tools","_blank","noopener"); }catch(e){}
}
function qsOf(q){ var k=Object.keys(q); if(!k.length) return ""; return "?"+k.map(function(x){ return x+"="+encodeURIComponent(q[x]); }).join("&"); }
var OPENERS={rca:["rca.html",RCA_NAV],a3:["a3.html",A3_NAV],dmaic:["dmaic.html",DM_NAV],fmea:["fmea.html",FM_NAV],fish:["fishbone.html",FISH_NAV],why5:["five-whys.html",WHY5_NAV],pareto:["pareto.html",PARETO_NAV]};
function openSrc(src,id){
 if(src==="capa"){ openTool("capa.html","docs"); return; }
 if(src==="pdca"){ openTool("pdca.html","docs"); return; }
 var o=OPENERS[src]; if(!o) return; var q=id?{open:id}:{}; openWith(o[0],o[1],q,qsOf(q));
}
/* other tools' records saved in this browser (read only) */
function recsOf(key){ var S=TBX.read(key); if(!S) return null; return (Array.isArray(S.records)?S.records:[]).filter(function(r){ return r&&typeof r==="object"&&str(r.id); }); }
function byIdIn(key,id){ return (recsOf(key)||[]).filter(function(r){ return str(r.id)===id; })[0]||null; }
/*__TBX_STAGES__*/
/* DMAIC projects, read with the DMAIC tool's own rules (copied at build time from tests/build/dmaic_host.js), for previews and starts only */
/*__DM_RULES__*/
/* FMEA studies, read with the FMEA tool's own rules (copied at build time from tests/build/fmea_host.js), for previews and starts only */
/*__FM_RULES__*/
/* PDCA cycles, read with the PDCA tool's own stage rule (copied at build time from modules/pdca.html) */
/*__PD_RULES__*/
function dmRec(id){ var d=byIdIn(DM_KEY,id); return d?DMR.fix(JSON.parse(JSON.stringify(d))):null; }
function fmRec(id){ var f=byIdIn(FM_KEY,id); return f?FMR.fix(JSON.parse(JSON.stringify(f))):null; }
function fmReRows(f){ return FMR.rows(f).filter(function(w){ return !!FMR.rowAfter(f,w); }); }
function dmPreview(id){ var d=dmRec(id); if(!d) return t("nxMiss"); return t("pvDm2",{id:id,st:t("dst_"+DMR.stage(d)),t:short(DMR.proved(d).map(function(c){ return c.t; }).join(" · "),140)||t("pvNo")}); }
function fmPreview(id){ var f=fmRec(id); if(!f) return t("nxMiss"); return t("pvFm",{id:id,st:t("fmst_"+FMR.stage(f)),n:FMR.rows(f).length,a:FMR.acts(f).filter(FMR.reRated).length,d:FMR.lastRev(f)||"—"}); }
function pdPreview(id){ var p=byIdIn(PDCA_KEY,id); if(!p) return t("nxMiss"); return t("pvPd",{id:id,st:t("pdst_"+pdcaStage(p)),t:short(str(p.title),100)}); }
var KEYS={rca:RCA_KEY,a3:A3_KEY,dmaic:DM_KEY,fmea:FM_KEY,capa:CAPA_KEY,pdca:PDCA_KEY,fish:FISH_KEY,why5:WHY5_KEY,pareto:PARETO_KEY};
function srcPreview(src,id){
 if(src==="none"||!KEYS[src]) return "";
 if(!id) return (recsOf(KEYS[src])||[]).length?"":t("nxNoData");
 if(src==="dmaic") return dmPreview(id); if(src==="fmea") return fmPreview(id); if(src==="pdca") return pdPreview(id);
 return preview(src,id);
}
/* the cause another tool holds for a record (read only); a cause that tool proved comes first */
function causeOf(src,id){
 var k=KEYS[src]; if(!k) return null; var r=byIdIn(k,id); if(!r) return null;
 if(src==="rca") return rcaRoots(r).map(function(c){ return str(c.t); }).join(L==="ar"?"؛ ":"; ");
 if(src==="a3") return arr(r.causes).filter(function(c){ return c.st==="conf"&&txt(str(c.t)); }).map(function(c){ return str(c.t); }).join(L==="ar"?"؛ ":"; ");
 if(src==="dmaic"){ var d=DMR.fix(JSON.parse(JSON.stringify(r))); return DMR.proved(d).map(function(c){ return c.t; }).join(L==="ar"?"؛ ":"; "); }
 if(src==="fmea"){ var f=FMR.fix(JSON.parse(JSON.stringify(r))), W=fmReRows(f); return (W.length?W:FMR.rows(f).slice(0,1)).map(function(w){ return str(w.cause); }).filter(function(x){ return txt(x); }).join(L==="ar"?"؛ ":"; "); }
 if(src==="capa") return str(obj(r.cause).root);
 if(src==="pdca") return str(obj(r.plan).causes);
 if(src==="fish"||src==="why5") return str(r.root);
 return "";
}

/* ---------- charts (inline SVG, mirrored for Arabic; the same drawing goes into the report) ---------- */
var FONT="font-family=\"'IBM Plex Sans Arabic','IBM Plex Sans',Calibri,Tahoma,sans-serif\"";
function chartW(){ try{ return window.innerWidth<640?340:560; }catch(e){ return 560; } }
/* lessons by stage (one bar per stage) and by type (the segments of each bar) */
function stTypeSVG(list,o){
 o=o||{}; var lang=o.lang||L, rtl=lang==="ar", W=o.W||560, tt=function(k){ return (UI[lang]||UI.ar)[k]; }, f=function(v){ return Math.round(v*10)/10; };
 var lw=W<420?96:128, m={l:lw,r:34,t:10,b:10}, rowH=24, H=m.t+STAGES.length*rowH+8+Math.ceil(TYPES.length/(W<420?2:3))*18+m.b;
 var cnt={}; STAGES.forEach(function(s){ cnt[s]={}; TYPES.forEach(function(ty){ cnt[s][ty]=0; }); });
 list.forEach(function(r){ cnt[stageOf(r)][r.type]++; });
 var mx=Math.max.apply(null,STAGES.map(function(s){ return TYPES.reduce(function(a,ty){ return a+cnt[s][ty]; },0); }).concat([1])), iw=W-m.l-m.r;
 var out=['<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 '+W+' '+H+'" width="'+W+'" height="'+H+'" role="img" aria-label="'+esc(tt("chT"))+'" '+FONT+'>','<rect width="'+W+'" height="'+H+'" fill="#FFFFFF"/>'];
 STAGES.forEach(function(s,i){ var y=m.t+i*rowH, x0=0, tot=0;
  out.push('<text x="'+f(rtl?W-6:6)+'" y="'+f(y+15)+'" fill="'+SCOL[s]+'" font-size="11" font-weight="700" text-anchor="'+(rtl?"end":"start")+'">'+esc(tt("st_"+s))+'</text>');
  out.push('<rect x="'+f(rtl?m.r:m.l)+'" y="'+f(y+4)+'" width="'+f(iw)+'" height="14" rx="3" fill="#F3F6FA"/>');
  TYPES.forEach(function(ty){ var n=cnt[s][ty]; if(!n) return; var w=n/mx*iw, x=rtl?W-m.l-x0-w:m.l+x0;
   out.push('<rect x="'+f(x)+'" y="'+f(y+4)+'" width="'+f(w)+'" height="14" rx="3" fill="'+TCOL[ty]+'"><title>'+esc(tt("st_"+s)+" · "+tt("ty_"+ty)+" · "+n)+'</title></rect>'); x0+=w; tot+=n; });
  out.push('<text x="'+f(rtl?W-m.l-x0-4:m.l+x0+4)+'" y="'+f(y+15)+'" fill="#4B5874" font-size="10.5" text-anchor="'+(rtl?"end":"start")+'" direction="ltr">'+(tot||"")+'</text>'); });
 var per=W<420?2:3, cw=(W-12)/per, ly=m.t+STAGES.length*rowH+8;
 TYPES.forEach(function(ty,i){ var cx=6+(i%per)*cw, cy=ly+Math.floor(i/per)*18, x=rtl?W-cx-10:cx;
  out.push('<rect x="'+f(x)+'" y="'+f(cy)+'" width="10" height="10" rx="2" fill="'+TCOL[ty]+'"/><text x="'+f(rtl?x-4:x+14)+'" y="'+f(cy+9)+'" fill="#4B5874" font-size="10.5" text-anchor="'+(rtl?"end":"start")+'">'+esc(tt("ty_"+ty))+'</text>'); });
 if(!list.length) out.push('<text x="'+f(W/2)+'" y="'+f(m.t+STAGES.length*rowH/2)+'" fill="#7A869E" font-size="12" text-anchor="middle">'+esc(tt("chEmpty"))+'</text>');
 out.push('</svg>'); return out.join("");
}
/* stage map: seven stages; the same markup goes into the report */
function mapHTML(r,lang){
 var tt=function(k){ return (UI[lang||L]||UI.ar)[k]; }, k=stIdx(r);
 return '<ol class="dm-map ll-map" aria-label="'+esc(tt("mapT"))+'">'+MAPST.map(function(s,i){ var st=(i+1<=k)?"done":(i+1===k+1?"cur":"todo");
  return '<li class="'+st+'" style="--pc:'+SCOL[s]+'"'+(st==="cur"?' aria-current="step"':'')+'><i aria-hidden="true">'+(i+1)+'</i><span><b>'+esc(tt("st_"+s))+'</b><small>'+esc(tt("mp_"+s))+' · '+esc(tt(st==="done"?"mpDone":(st==="cur"?"mpCur":"mpTodo")))+'</small></span></li>'; }).join("")+'</ol>';
}

/* ---------- search and "read before you start" (live views of the register; nothing is stored) ---------- */
function hay(r){ return norm([r.id,r.ref,r.title,r.area,r.project,r.owner,r.what.event,r.what.ev,r.what.exp,r.what.act,r.what.impact,r.cause.t,r.lesson.when,r.lesson.dothis,r.lesson.because,r.lesson.applies,r.lesson.excl,r.tags.proc,r.tags.ptype,r.tags.site].join(" | ")); }
function tagVals(k){ var o={}; DB.records.forEach(function(r){ var v=txt(r.tags[k]); if(v) o[norm(v)]=o[norm(v)]||v; }); return Object.keys(o).map(function(x){ return o[x]; }).sort(); }
function findLessons(f){
 var q=norm(f.q||"").split(" ").filter(function(x){ return x; });
 return DB.records.filter(function(r){ var h=hay(r);
  if(q.some(function(w){ return h.indexOf(w)<0; })) return false;
  if(f.type&&r.type!==f.type) return false; if(f.stage&&stageOf(r)!==f.stage) return false;
  if(f.proc&&norm(r.tags.proc)!==norm(f.proc)) return false; if(f.ptype&&norm(r.tags.ptype)!==norm(f.ptype)) return false; if(f.site&&norm(r.tags.site)!==norm(f.site)) return false;
  return true; });
}
/* the rules to read before a project or change starts: lessons written as rules whose process or project type is the one chosen */
function readBefore(sel){
 if(!sel) return []; var p=sel.split("|"), k=p[0], v=norm(p.slice(1).join("|"));
 return DB.records.filter(function(r){ return atLeast(r,"lesson")&&norm(r.tags[k])===v; }).sort(function(a,b){ return (stIdx(b)-stIdx(a))||(a.id<b.id?-1:1); });
}
function rbLabel(sel){ if(!sel) return ""; var p=sel.split("|"); return t(p[0]==="proc"?"rbProc":"rbPtype")+": "+p.slice(1).join("|"); }
function rbHTML(list,lang){
 var tt=function(k,v){ var s=(UI[lang||L]||UI.ar)[k]; if(v){ for(var x in v) s=String(s).split("{"+x+"}").join(v[x]); } return s; };
 return list.map(function(r){ var vg=verOk(r)?lastVer(r):null;
  return '<li><p class="ll-say">'+esc(ruleSay(r,lang))+'</p><p class="ll-rbm">'+(txt(r.lesson.applies)?esc(tt("rbApp",{t:r.lesson.applies})):"")+(txt(r.lesson.excl)?' · '+esc(tt("rbExcl",{t:r.lesson.excl})):"")+'</p>'+
   '<p class="ll-rbm"><b dir="ltr">'+esc(r.id)+'</b> · '+esc(tt("ty_"+r.type))+' · '+esc(tt("st_"+stageOf(r)))+' · '+(vg?esc(tt("rbVer",{n:vg.next})):esc(tt("rbNotVer")))+'</p></li>'; }).join("");
}
function fval(id){ var e=document.getElementById(id); return e?e.value:""; }
function optList(vals,cur){ return '<option value="">'+esc(t("fAll"))+'</option>'+vals.map(function(v){ return '<option value="'+esc(v)+'"'+(v===cur?" selected":"")+'>'+esc(v)+'</option>'; }).join(""); }
function buildFind(){
 var box=document.getElementById("findF"); if(!box) return;
 var keep={q:fval("fq"),type:fval("ftype"),stage:fval("fstage"),proc:fval("fproc"),ptype:fval("fptype"),site:fval("fsite")};
 box.innerHTML='<div class="pd-f wide"><label for="fq">'+esc(t("fq"))+'</label><input id="fq" type="search"></div>'+
  '<div class="pd-f"><label for="ftype">'+esc(t("ftype"))+'</label><select id="ftype"><option value="">'+esc(t("fAll"))+'</option>'+opts(TYPES,"ty_")+'</select></div>'+
  '<div class="pd-f"><label for="fstage">'+esc(t("fstage"))+'</label><select id="fstage"><option value="">'+esc(t("fAll"))+'</option>'+opts(STAGES,"st_")+'</select></div>'+
  '<div class="pd-f"><label for="fproc">'+esc(t("fproc"))+'</label><select id="fproc"></select></div>'+
  '<div class="pd-f"><label for="fptype">'+esc(t("fptype"))+'</label><select id="fptype"></select></div>'+
  '<div class="pd-f"><label for="fsite">'+esc(t("fsite"))+'</label><select id="fsite"></select></div>';
 document.getElementById("fq").value=keep.q; document.getElementById("ftype").value=keep.type; document.getElementById("fstage").value=keep.stage;
 findTags(keep);
}
function findTags(keep){
 keep=keep||{proc:fval("fproc"),ptype:fval("fptype"),site:fval("fsite")};
 ["proc","ptype","site"].forEach(function(k){ var el=document.getElementById("f"+k); if(!el) return; var V=tagVals(k), sig=JSON.stringify(V)+L; if(el.getAttribute("data-sig")!==sig){ el.innerHTML=optList(V,keep[k]); el.setAttribute("data-sig",sig); } el.value=V.indexOf(keep[k])>=0?keep[k]:""; });
 var rb=document.getElementById("rbSel"); if(rb){ var P=tagVals("proc"), T2=tagVals("ptype"), sig2=JSON.stringify([P,T2])+L;
  if(rb.getAttribute("data-sig")!==sig2){ rb.innerHTML='<option value="">'+esc(t("rbPick"))+'</option>'+(P.length?'<optgroup label="'+esc(t("rbProc"))+'">'+P.map(function(v){ return '<option value="proc|'+esc(v)+'">'+esc(v)+'</option>'; }).join("")+'</optgroup>':'')+(T2.length?'<optgroup label="'+esc(t("rbPtype"))+'">'+T2.map(function(v){ return '<option value="ptype|'+esc(v)+'">'+esc(v)+'</option>'; }).join("")+'</optgroup>':''); rb.setAttribute("data-sig",sig2); }
  rb.value=[].some.call(rb.options,function(o){ return o.value===RB; })?RB:""; RB=rb.value; }
}
function renderFind(){
 var res=document.getElementById("fRes"); if(!res) return;
 findTags();
 var f={q:fval("fq"),type:fval("ftype"),stage:fval("fstage"),proc:fval("fproc"),ptype:fval("fptype"),site:fval("fsite")}, on=Object.keys(f).some(function(k){ return !!txt(f[k]); });
 var F=on?findLessons(f):[];
 document.getElementById("fCnt").textContent=DB.records.length?(on?(F.length?t("fRes",{n:F.length}):t("fNone")):t("fHint",{n:DB.records.length})):"";
 res.innerHTML=F.length?'<ul class="ll-find">'+F.map(function(r){ return '<li><span>'+stChip(stageOf(r))+' <b dir="ltr">'+esc(r.id)+'</b> '+esc(r.title)+'</span><small>'+esc(t("ty_"+r.type))+(r.tags.proc?' · '+esc(r.tags.proc):'')+(r.tags.ptype?' · '+esc(r.tags.ptype):'')+(r.tags.site?' · '+esc(r.tags.site):'')+'</small>'+(ruleSay(r)?'<q>'+esc(short(ruleSay(r),220))+'</q>':'')+'<button class="pd-rowbtn" type="button" data-open="'+esc(r.id)+'">'+esc(t("open"))+'</button></li>'; }).join("")+'</ul>':"";
 var rl=document.getElementById("rbList"); if(rl){ var R=readBefore(RB); rl.innerHTML=RB?(R.length?rbHTML(R):'<li>'+esc(t("rbNone"))+'</li>'):""; }
}
document.addEventListener("input",function(e){ if(e.target&&e.target.id==="fq") renderFind(); });
document.addEventListener("change",function(e){ var id=e.target&&e.target.id; if(["ftype","fstage","fproc","fptype","fsite"].indexOf(id)>=0) renderFind(); if(id==="rbSel"){ RB=e.target.value; renderFind(); } });

/* ---------- lesson form ---------- */
var HDR=[["title","tx",1],["ref","ltr",0],["type","sel:TYPES:ty_",0],["date","date",0],["area","tx",0],["project","tx",0],["owner","tx",0],["reviewers","tx",0],
 ["src","sel:SRCS:src_",0],["srcId","srcid",0],["capa","capa",0],["proc","tag:procL",0],["ptype","tag:ptypeL",0],["site","tag:siteL",0]];
var PATH={title:"title",ref:"ref",type:"type",date:"date",area:"area",project:"project",owner:"owner",reviewers:"reviewers",src:"src",srcId:"srcId",capa:"capa",proc:"tags.proc",ptype:"tags.ptype",site:"tags.site",
 event:"what.event",ev:"what.ev",exp:"what.exp",act:"what.act",impact:"what.impact",sev:"what.sev",chow:"cause.how",ct:"cause.t",
 when:"lesson.when",dothis:"lesson.dothis",because:"lesson.because",applies:"lesson.applies",excl:"lesson.excl"};
var LISTS={TYPES:TYPES,SRCS:SRCS,SEVS:SEVS,CHOWS:CHOWS,KINDS:KINDS,ASTS:ASTS,VRES:VRES};
function getP(r,p){ var a=p.split("."), o=r; for(var i=0;i<a.length;i++){ if(o==null) return ""; o=o[a[i]]; } return o; }
function setP(r,p,v){ var a=p.split("."), o=r; for(var i=0;i<a.length-1;i++){ if(!o[a[i]]||typeof o[a[i]]!=="object") o[a[i]]={}; o=o[a[i]]; } o[a[a.length-1]]=v; }
function opts(list,prefix,cur){ return list.map(function(k){ return '<option value="'+k+'"'+(cur===k?" selected":"")+'>'+esc(t(prefix+k))+'</option>'; }).join(""); }
function fill(list){ return list.map(function(r){ return '<option value="'+esc(r[0])+'">'+esc(r[1])+'</option>'; }).join(""); }
function link(id,list,info,btn,bl){ return '<div class="ca-pd"><input id="'+id+'" type="text" dir="ltr" list="'+list+'" aria-describedby="'+info+'">'+(btn?'<button class="pd-btn ghost" type="button" id="'+btn+'">'+esc(t(bl))+'</button>':'')+'</div><datalist id="'+list+'"></datalist><div class="ca-pdinfo" id="'+info+'" aria-live="polite"></div>'; }
function fieldHTML(name,kind,wide,lab){
 var id="f-"+name, lb=lab||t("f_"+name), inner="", m=/^sel:(\w+):(\w+)$/.exec(kind), tg=/^tag:(\w+)$/.exec(kind);
 if(kind==="ta") inner='<textarea id="'+id+'" rows="2"></textarea>';
 else if(kind==="date") inner='<input id="'+id+'" type="date">';
 else if(kind==="ltr") inner='<input id="'+id+'" type="text" dir="ltr">';
 else if(m) inner='<select id="'+id+'">'+opts(LISTS[m[1]],m[2])+'</select>';
 else if(tg) inner='<input id="'+id+'" type="text" list="'+tg[1]+'"><datalist id="'+tg[1]+'"></datalist>';
 else if(kind==="srcid") inner=link(id,"srcList","srcInfo","srcOpen","srcOpen");
 else if(kind==="capa") inner=link(id,"capaList","caInfo","caOpen","caOpen");
 else inner='<input id="'+id+'" type="text">';
 return '<div class="pd-f'+(wide?" wide":"")+'" id="w-'+name+'"><label for="'+id+'">'+esc(lb)+'</label>'+inner+'</div>';
}
function tblHTML(name,cls,heads){ return '<div class="ca-actw" id="'+name+'W"><table class="a3-tbl '+cls+'"><thead><tr>'+heads.map(function(h){ return '<th>'+(h?esc(h):'<span class="sr">—</span>')+'</th>'; }).join("")+'</tr></thead><tbody id="'+name+'Rows"></tbody></table></div>'; }
function addBtn(name,lbl){ return '<button class="pd-btn ghost" type="button" data-add="'+name+'">+ '+esc(lbl)+'</button>'; }
function secHTML(k,col,inner){ return '<section class="dm-ph ll-sec" id="sec-'+k+'" style="--pc:'+col+'" aria-labelledby="sct-'+k+'"><h3 class="dm-pht" id="sct-'+k+'">'+esc(t("s"+k+"T"))+'</h3><p class="dm-phs">'+esc(t("s"+k+"S"))+'</p>'+inner+'</section>'; }
function buildForm(){
 document.getElementById("hdrFields").innerHTML=HDR.map(function(f){ return fieldHTML(f[0],f[1],f[2]); }).join("")+
  '<label class="w5-chk wide" for="f-nc"><input id="f-nc" type="checkbox"><span>'+esc(t("f_nc"))+'</span></label><div class="w5-warn wide" id="capaWarn" role="note" hidden></div>';
 var S1='<div class="pd-fields">'+fieldHTML("event","ta",1,t("w_event"))+fieldHTML("ev","ta",1,t("w_ev"))+fieldHTML("exp","ta",0,t("w_exp"))+fieldHTML("act","ta",0,t("w_act"))+fieldHTML("impact","ta",1,t("w_impact"))+fieldHTML("sev","sel:SEVS:sv_",0,t("w_sev"))+'</div>';
 var S2='<div class="pd-fields">'+fieldHTML("chow","sel:CHOWS:ch_",0,t("c_how"))+fieldHTML("ct","ta",1,t("c_t"))+'</div><div class="a3-add"><button class="pd-btn ghost" type="button" id="czTake">'+esc(t("czTake"))+'</button><span class="pd-ok" id="czMsg" role="status"></span></div><p class="a3-pkpv" id="czPv" aria-live="polite"></p><div class="w5-warn w5-bad" id="naWarn" role="note" hidden></div><div class="w5-warn" id="naInfo" role="note" hidden></div>';
 var S3='<div class="pd-fields">'+fieldHTML("when","ta",1,t("l_when"))+fieldHTML("dothis","ta",1,t("l_dothis"))+fieldHTML("because","ta",1,t("l_because"))+fieldHTML("applies","ta",0,t("l_applies"))+fieldHTML("excl","ta",0,t("l_excl"))+'</div><p class="ll-say" id="ruleSay" aria-live="polite"></p><div class="w5-warn w5-bad" id="blameWarn" role="note" hidden></div>';
 var S4='<div id="acCards" class="dm-cards ll-cards"></div><p class="ca-hint" id="acNone"></p><div class="a3-add">'+addBtn("ac",t("acAdd"))+'</div>';
 var S5=tblHTML("vr","ll-vr",[t("vrDate"),t("vrNext"),t("vrRes"),t("vrEv"),""])+'<p class="ca-hint" id="vrNone"></p><div class="a3-add">'+addBtn("vr",t("vrAdd"))+'</div><div class="w5-warn" id="vrWarn" role="note" hidden></div>';
 var S6=tblHTML("sh","ll-sh",[t("shDate"),t("shWho"),t("shHow"),""])+'<p class="ca-hint" id="shNone"></p><div class="a3-add">'+addBtn("sh",t("shAdd"))+'</div>';
 document.getElementById("stages").innerHTML=secHTML("Wh","#7A869E",S1)+secHTML("Cz","#3563C9",S2)+secHTML("Ls","#1B2A4A",S3)+secHTML("Ac","#B8901E",S4)+secHTML("Vr","#1E8C93",S5)+secHTML("Sh","#3C9A5F",S6);
 fillLists();
}
function fillLists(){
 var put=function(id,list){ var dl=document.getElementById(id); if(dl) dl.innerHTML=fill(list); };
 put("capaList",(recsOf(CAPA_KEY)||[]).map(function(c){ return [str(c.id),str(c.ref)+" · "+str(c.title)]; }));
 var s=document.getElementById("f-src"); put("srcList",s&&KEYS[s.value]?(recsOf(KEYS[s.value])||[]).map(function(c){ return [str(c.id),(str(c.ref)?str(c.ref)+" · ":"")+str(c.title)]; }):[]);
 put("fmList",(recsOf(FM_KEY)||[]).map(function(c){ return [str(c.id),str(c.ref)+" · "+str(c.title)]; }));
 ["proc","ptype","site"].forEach(function(k){ put(k+"L",tagVals(k).map(function(v){ return [v,v]; })); });
}
/* ---- small tables: verification and sharing ---- */
var TB={
 vr:{key:"ver",blank:blankVr,pre:"v",f:[["date","date","vrDate"],["next","tx","vrNext"],["res","sel:VRES:rs_","vrRes"],["ev","ta","vrEv"]],max:MAXVER},
 sh:{key:"share",blank:blankSh,pre:"s",f:[["date","date","shDate"],["who","tx","shWho"],["how","tx","shHow"]],max:MAXSH}
};
function cellHTML(tb,f,row,i){
 var k=f[0], kind=f[1], lb=t(f[2])+" "+(i+1), id="r-"+tb+"-"+i+"-"+k, v=row[k], a=' id="'+id+'" data-k="'+k+'" aria-label="'+esc(lb)+'"', m=/^sel:(\w+):(\w+)$/.exec(kind);
 if(kind==="tx") return '<td><input type="text"'+a+' value="'+esc(v)+'"></td>';
 if(kind==="ta") return '<td><textarea rows="1"'+a+'>'+esc(v)+'</textarea></td>';
 if(kind==="date") return '<td class="a3-d"><input type="date"'+a+' value="'+esc(v)+'"></td>';
 if(m) return '<td><select'+a+'>'+opts(LISTS[m[1]],m[2],v)+'</select></td>';
 return '<td></td>';
}
function rowHTML(tb,row,i){ return '<tr data-row="'+i+'" data-cid="'+esc(row.id||"")+'">'+TB[tb].f.map(function(f){ return cellHTML(tb,f,row,i); }).join("")+'<td class="a3-x"><button type="button" class="ca-x" data-rdel="'+tb+':'+i+'" aria-label="'+esc(t("tmDel"))+'" title="'+esc(t("tmDel"))+'">✕</button></td></tr>'; }
var NONE={vr:"vrNone",sh:"shNone",ac:"acNone"};
function renderTbl(tb,list){
 var box=document.getElementById(tb+"Rows"); if(!box) return;
 box.innerHTML=list.map(function(x,i){ return rowHTML(tb,x,i); }).join("");
 var ne=document.getElementById(NONE[tb]); if(ne) ne.textContent=list.length?"":t(NONE[tb]);
 autoSizeAll(box);
}
function readTbl(tb){
 var box=document.getElementById(tb+"Rows"); if(!box) return [];
 return [].map.call(box.querySelectorAll("tr[data-row]"),function(tr){ var o={id:tr.getAttribute("data-cid")||""}; TB[tb].f.forEach(function(f){ var el=tr.querySelector('[data-k="'+f[0]+'"]'); if(el) o[f[0]]=txt(el.value); }); return o; });
}
/* ---- embedding action cards ---- */
function cf(i,k,kind,labHTML,wide){
 var id="r-ac-"+i+"-"+k, a=' id="'+id+'" data-k="'+k+'"', m=/^sel:(\w+):(\w+)$/.exec(kind), inner;
 if(kind==="ta") inner='<textarea rows="1"'+a+'></textarea>';
 else if(kind==="date") inner='<input type="date"'+a+'>';
 else if(kind==="ref") inner='<div class="ca-pd"><input type="text" dir="ltr" list="fmList"'+a+'><button class="pd-btn ghost" type="button" data-fmo hidden>'+esc(t("fmOpen"))+' ↗</button></div><div class="a3-pv" data-pv></div>';
 else if(m) inner='<select'+a+'>'+opts(LISTS[m[1]],m[2])+'</select>';
 else inner='<input type="text"'+a+'>';
 return '<div class="pd-f'+(wide?" wide":"")+' ll-f-'+k+'"><label for="'+id+'">'+labHTML+'</label>'+inner+'</div>';
}
function L1(k){ return esc(t(k)); }
function acCardHTML(a,i){
 return '<div class="dm-card ll-ac" data-row="'+i+'" data-cid="'+esc(a.id)+'">'+
  '<div class="dm-ch"><b class="dm-code" data-code dir="ltr"></b><span data-stc></span><button type="button" class="ca-x" data-rdel="ac:'+i+'" aria-label="'+esc(t("acDel"))+'" title="'+esc(t("acDel"))+'">✕</button></div>'+
  '<div class="pd-fields">'+cf(i,"kind","sel:KINDS:kd_",L1("acKind"))+cf(i,"what","ta",L1("acWhat"),1)+cf(i,"ref","ref",L1("acRef"))+cf(i,"who","tx",L1("acWho"))+cf(i,"by","date",L1("acBy"))+cf(i,"st","sel:ASTS:as_",L1("acSt"))+cf(i,"done","date",L1("acDone"))+cf(i,"ev","ta",L1("acEv"),1)+'</div><span class="a3-flag" data-flag></span></div>';
}
var ACK=["kind","what","ref","who","by","st","done","ev"];
function setVal(el,v){ if(!el) return; if(el.tagName==="SELECT"){ if([].some.call(el.options,function(o){ return o.value===String(v==null?"":v); })) el.value=String(v==null?"":v); } else el.value=v==null?"":String(v); }
function renderCards(list){
 var box=document.getElementById("acCards"); if(!box) return;
 box.innerHTML=list.map(function(x,i){ return acCardHTML(x,i); }).join("");
 [].forEach.call(box.querySelectorAll(".dm-card"),function(card,i){ var x=list[i]; ACK.forEach(function(k){ setVal(card.querySelector('[data-k="'+k+'"]'),x[k]); }); });
 var ne=document.getElementById("acNone"); if(ne) ne.textContent=list.length?"":t("acNone");
 autoSizeAll(box);
}
function readCards(){
 var box=document.getElementById("acCards"); if(!box) return [];
 return [].map.call(box.querySelectorAll(".dm-card"),function(card){ var o={id:card.getAttribute("data-cid")}; ACK.forEach(function(k){ var el=card.querySelector('[data-k="'+k+'"]'); o[k]=el?txt(el.value):""; }); return o; });
}
function autoSize(el){ if(!el||el.tagName!=="TEXTAREA") return; el.style.height="auto"; if(el.scrollHeight) el.style.height=(el.scrollHeight+2)+"px"; }
function autoSizeAll(root){ if(root) root.querySelectorAll("textarea").forEach(autoSize); }
/* the lesson as it would be saved: empty rows dropped */
function formToRec(){
 var r=blank();
 Object.keys(PATH).forEach(function(k){ var el=document.getElementById("f-"+k); if(el) setP(r,PATH[k],txt(el.value)); });
 var nc=document.getElementById("f-nc"); r.nc=!!(nc&&nc.checked);
 if(document.getElementById("acCards")){
  r.acts=readCards().map(fixAc).filter(function(x){ return x.what||x.who||x.ev||x.ref; });
  r.ver=readTbl("vr").map(fixVr).filter(function(x){ return x.date||x.next||x.ev; });
  r.share=readTbl("sh").map(fixSh).filter(function(x){ return x.date||x.who||x.how; });
 }
 r.id=document.getElementById("rid").value;
 if(editing&&editing.id===r.id){ r.created=editing.created||""; }
 fixRec(r);
 return r;
}
/* while typing, the lesson keeps every row (even empty ones) so the tables keep their shape */
function formRaw(){ return {vr:readTbl("vr"),sh:readTbl("sh"),ac:readCards()}; }
function recToForm(r,keepMsg){
 r=fixRec(JSON.parse(JSON.stringify(r)));
 document.getElementById("rid").value=r.id||"";
 Object.keys(PATH).forEach(function(k){ var el=document.getElementById("f-"+k); if(!el) return; var v=getP(r,PATH[k]); v=(v===null||v===undefined)?"":String(v); el.value=v||(el.tagName==="SELECT"&&el.options.length?el.options[0].value:""); });
 document.getElementById("f-nc").checked=r.nc;
 fillLists();
 renderCards(r.acts); renderTbl("vr",r.ver); renderTbl("sh",r.share);
 if(!keepMsg){ ["recErr","recOk","czMsg"].forEach(function(id){ var e=document.getElementById(id); if(e) e.textContent=""; }); }
 refreshForm();
 autoSizeAll(document.getElementById("stages")); autoSizeAll(document.getElementById("hdrFields"));
}
function loadRecordIntoForm(r){ editing=fixRec(JSON.parse(JSON.stringify(r))); recToForm(editing); }
function clearForm(){ editing=null; recToForm(blank()); }
function setW(id,on,msg){ var w=document.getElementById(id); if(!w) return; w.hidden=!on; w.textContent=on?msg:""; }
/* the parts that depend on other fields are updated in place, so typing never loses focus */
function refreshForm(){
 var r=formToRec(), st=stageOf(r), CD=codes(r), raw=formRaw();
 var el=document.getElementById("curStage"); if(el) el.textContent=t("cur")+" "+stageName(st);
 document.getElementById("caSteps").innerHTML=mapHTML(r);
 setW("capaWarn",capaNeed(r)&&!txt(r.capa),t("capaW"));
 /* source and cause */
 var si=document.getElementById("srcInfo"); if(si) si.textContent=r.src==="none"?t("srcHint"):(r.srcId?srcPreview(r.src,r.srcId):(srcPreview(r.src,"")||t("srcHint")));
 var so=document.getElementById("srcOpen"); if(so) so.disabled=r.src==="none"||!OPENERS[r.src]&&r.src!=="capa"&&r.src!=="pdca";
 var ca=document.getElementById("caInfo"); if(ca) ca.textContent=r.capa?(byIdIn(CAPA_KEY,r.capa)?preview("capa",r.capa):t("caMiss")):t("caHint");
 var ct=document.getElementById("f-ct"); if(ct) ct.readOnly=r.cause.how==="link";
 var tk=document.getElementById("czTake"); if(tk) tk.hidden=r.cause.how!=="link";
 var cp=document.getElementById("czPv"); if(cp) cp.textContent=r.cause.how==="link"&&r.src!=="none"&&r.srcId?srcPreview(r.src,r.srcId):"";
 setW("naWarn",naBad(r),t("naF")); setW("naInfo",notAnalysed(r)&&!naBad(r),t("naI"));
 /* the rule */
 var rs=document.getElementById("ruleSay"); if(rs) rs.textContent=ruleSay(r)||t("sayNone");
 setW("blameWarn",blameOf(r).length>0,t("blameW"));
 ["ct","when","dothis","because"].forEach(function(k){ var f=document.getElementById("f-"+k); if(f) f.classList.toggle("ll-bad",personOnly(f.value)); });
 /* embedding actions */
 document.querySelectorAll("#acCards .dm-card").forEach(function(card,i){
  var a=fixAc(raw.ac[i]||{}); card.querySelector("[data-code]").textContent="E"+(i+1);
  card.querySelector("[data-stc]").innerHTML=txt(a.what)?'<span class="ca-chip '+(actDone(a)?"ok":(a.st==="done"?"warn":"info"))+'">'+esc(t("as_"+a.st))+'</span>':"";
  var isF=a.kind==="fmea", pvb=card.querySelector("[data-pv]"), fo=card.querySelector("[data-fmo]");
  if(pvb) pvb.textContent=isF?(a.ref?fmPreview(a.ref):t("fmHint")):""; if(fo) fo.hidden=!(isF&&a.ref);
  var msg=[]; if(txt(a.what)&&!actOwned(a)) msg.push(t("ownF")); if(a.st==="done"&&txt(a.what)&&!actDone(a)) msg.push(t("evF"));
  card.querySelector("[data-flag]").textContent=msg.join(" "); card.classList.toggle("a3-pf",a.st==="done"&&txt(a.what)&&!actDone(a)); });
 var ab=document.querySelector('[data-add="ac"]'); if(ab) ab.disabled=raw.ac.length>=MAXACTS;
 /* verification */
 var w=""; if(embedOk(r)&&vEarly(r)) w=t("vrEarly",{d:lastAct(r)}); else if(lastVer(r)&&vPart(r)) w=t("vrPart",{r:t("rs_"+lastVer(r).res)});
 setW("vrWarn",!!w,w);
 var vb=document.querySelector('[data-add="vr"]'); if(vb) vb.disabled=raw.vr.length>=MAXVER;
 var sb=document.querySelector('[data-add="sh"]'); if(sb) sb.disabled=raw.sh.length>=MAXSH;
}
function validate(r){
 if(!r.title) return t("e_title");
 if(isD(r.date)&&(r.ver.some(function(v){ return isD(v.date)&&v.date<r.date; })||acts(r).some(function(a){ return isD(a.done)&&a.done<r.date; }))) return t("e_date");
 return "";
}
function newId(r){
 var y=(isD(r.date)?r.date:today()).slice(0,4), pre="LL-"+y+"-";
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
 recToForm(editing,true);
 var ok=persist();
 if(ok) okEl.textContent=t("ok_rec")+" · "+r.id; else errEl.textContent=t("savedFail");
 renderAll();
 return ok;
}
function nextId(list,pre,saved){ var n=0, re=new RegExp("^"+pre+"(\\d+)$"); list.concat(saved||[]).forEach(function(c){ var m=re.exec(c.id||""); if(m) n=Math.max(n,+m[1]); }); return pre+(n+1); }
/* take the cause from the source tool (read only) */
function takeCause(){
 var r=formToRec(), msg=document.getElementById("czMsg");
 if(r.src==="none"||!r.srcId){ msg.textContent=t("czNoSrc"); return; }
 var c=causeOf(r.src,r.srcId); if(c===null){ msg.textContent=t("czMiss"); return; }
 if(!txt(c)){ msg.textContent=t("czNone"); return; }
 var el=document.getElementById("f-ct"); el.value=c; autoSize(el); refreshForm(); msg.textContent=t("czTook",{id:r.srcId});
}

/* ---------- start from RCA, A3, DMAIC, FMEA, CAPA or PDCA (read only, preview first) ---------- */
function stSelects(){ var s=document.getElementById("stSrc"); if(!s) return; var cur=s.value||"rca"; s.innerHTML=opts(STSRC,"ss_",cur); }
function nFrom(src,id){ return DB.records.filter(function(r){ return r.src===src&&r.srcId===id; }).length; }
function stRows(src){
 var R=recsOf(KEYS[src]); if(!R) return null;
 if(src==="dmaic") return R.filter(function(c){ var d=DMR.fix(JSON.parse(JSON.stringify(c))), s=DMR.stage(d); return s==="closed"||s==="stop"; });
 if(src==="fmea") return R.filter(function(c){ var f=FMR.fix(JSON.parse(JSON.stringify(c))); return FMR.revs(f).length>0||fmReRows(f).length>0; });
 return R;
}
function stStage(src,c){
 if(src==="rca") return t("rst_"+rcaStage(c)); if(src==="a3") return t("a3st_"+a3Stage(c)); if(src==="capa") return t("cst_"+capaStage(c));
 if(src==="pdca") return t("pdst_"+pdcaStage(c)); if(src==="dmaic") return t("dst_"+DMR.stage(DMR.fix(JSON.parse(JSON.stringify(c)))));
 return t("fmst_"+FMR.stage(FMR.fix(JSON.parse(JSON.stringify(c)))));
}
function th(keys){ return '<thead><tr>'+keys.map(function(k){ return '<th>'+esc(t(k))+'</th>'; }).join("")+'</tr></thead>'; }
function stPreview(keep){
 var src=document.getElementById("stSrc").value||"rca", msg=document.getElementById("stMsg"), box=document.getElementById("stTable"), R=stRows(src);
 if(!R){ ST=null; box.hidden=true; msg.textContent=t("stNone"); return; }
 if(!R.length){ ST=null; box.hidden=true; msg.textContent=t("stEmpty"); return; }
 ST={src:src}; if(!keep) msg.textContent="";
 box.hidden=false;
 box.innerHTML='<table class="pd-tbl">'+th(["stColId","stColT","stColSt","stColCz","stColN","stColA"])+'<tbody>'+R.map(function(c){ var id=str(c.id);
  return '<tr><td><b dir="ltr">'+esc(id)+'</b></td><td>'+(str(c.ref)?'<b dir="ltr">'+esc(str(c.ref))+'</b><br>':'')+esc(str(c.title))+'</td><td>'+esc(stStage(src,c))+'</td><td>'+esc(short(causeOf(src,id)||"",140)||"—")+'</td><td>'+nFrom(src,id)+'</td><td><button class="pd-rowbtn" type="button" data-stsrc="'+src+'" data-stid="'+esc(id)+'">'+esc(t("stUse"))+'</button></td></tr>'; }).join("")+'</tbody></table>';
}
function prefilled(r,src,id){ fixRec(r); editing=null; recToForm(r); go("tools"); document.getElementById("recOk").textContent=t("stUsed",{s:t("src_"+src),id:id}); return true; }
/* a new lesson filled from another tool's record; that record is only read. The event, the cause (from the analysis) and the source id are
   filled; the evidence, the lesson, the actions, the verification and the sharing are left to the team. */
function prefillFrom(src,id){
 var c=byIdIn(KEYS[src]||"",id); if(!c||STSRC.indexOf(src)<0) return false;
 var r=blank(), cz=causeOf(src,id)||"", jn=L==="ar"?"؛ ":"; ";
 r.src=src; r.srcId=str(c.id); r.title=t("pfT")+str(c.title); r.ref=str(c.ref); r.area=str(c.area); r.cause={how:"link",t:cz};
 if(src==="rca"){ var p=obj(c.prob), k=obj(c.risk), sv=parseInt(k.sev,10)||0; r.date=isD(c.date)?c.date:""; r.owner=str(c.lead); r.capa=str(c.capa); r.nc=!!txt(str(c.capa));
  r.type={near:"near",audit:"audit",cc:"customer"}[str(c.src)]||"problem"; r.what.event=[str(p.what),str(p.where),str(p.when)].filter(function(x){ return txt(x); }).join(" · ");
  r.what.ev=arr(c.evid).map(function(x){ return str(x.item); }).filter(function(x){ return txt(x); }).join(jn); r.what.exp=str(p.req); r.what.impact=str(p.much); r.what.sev=sv>=4?"high":(sv>=3?"med":(sv?"low":"med")); }
 else if(src==="a3"){ var b=obj(c.bg), cu=obj(c.cur), g=obj(c.goal); r.date=isD(c.start)?c.start:""; r.owner=str(c.owner); r.capa=str(c.capa); r.nc=!!txt(str(c.capa));
  r.what.event=str(b.text); r.what.ev=[str(cu.measure),str(cu.period)].filter(function(x){ return txt(x); }).join(" · "); r.what.exp=txt(str(g.measure))?str(g.measure)+": "+(g.to==null?"—":String(g.to)):""; r.what.act=str(cu.gap); r.what.impact=str(b.why); }
 else if(src==="dmaic"){ var d=DMR.fix(JSON.parse(JSON.stringify(c))); r.date=isD(d.start)?d.start:""; r.owner=str(d.owner)||str(d.lead); r.capa=str(d.capa); r.nc=!!txt(str(d.capa));
  r.what.event=str(d.def.problem); r.what.ev=[str(d.meas.source),str(d.meas.period)].filter(function(x){ return txt(x); }).join(" · "); r.what.exp=txt(d.goal.measure)?d.goal.measure+": "+(d.goal.from==null?"—":String(d.goal.from))+" → "+(d.goal.to==null?"—":String(d.goal.to)):""; r.what.act=str(d.ctl.std); r.what.impact=str(d.def.cost); }
 else if(src==="fmea"){ var f=FMR.fix(JSON.parse(JSON.stringify(c))), W=fmReRows(f), A=FMR.acts(f).filter(FMR.reRated), V=FMR.revs(f); r.date=V.length?V.map(function(v){ return v.date; }).sort().pop():(isD(f.start)?f.start:""); r.owner=str(f.owner); r.capa=str(f.capa); r.nc=f.nc===true;
  r.what.event=(V.length?str(V[V.length-1].chg):"")||W.map(function(w){ return str(w.mode); }).join(jn); r.what.ev=A.map(function(a){ return str(a.ev); }).filter(function(x){ return txt(x); }).join(jn); r.what.sev=W.some(function(w){ return w.s>=9; })?"high":"med"; }
 else if(src==="capa"){ r.date=isD(c.raised)?c.raised:""; r.owner=str(c.owner); r.capa=str(c.id); r.nc=true; r.type={ia:"audit",ea:"audit",cc:"customer"}[str(c.src)]||"problem";
  r.what.event=str(c.desc)||str(c.title); r.what.ev=str(c.evidence); r.what.sev=str(c.cls)==="maj"?"high":"med"; }
 else if(src==="pdca"){ var pl=obj(c.plan), ck=obj(c.check), ac=obj(c.act); r.date=isD(c.start)?c.start:""; r.owner=str(c.owner);
  r.what.event=str(pl.problem); r.what.exp=str(pl.target); r.what.act=str(ck.result); r.what.ev=str(pl.baseline); r.lesson.dothis=str(ac.lessons); }
 return prefilled(r,src,str(c.id));
}
document.getElementById("stSrc").addEventListener("change",function(){ ST=null; document.getElementById("stTable").hidden=true; document.getElementById("stMsg").textContent=""; });
document.getElementById("stPrev").addEventListener("click",function(){ stPreview(false); });
document.getElementById("stTable").addEventListener("click",function(e){ var a=e.target.closest("[data-stid]"); if(a) prefillFrom(a.getAttribute("data-stsrc"),a.getAttribute("data-stid")); });
function homeCount(){ var n=0; STSRC.forEach(function(s){ var R=stRows(s); if(R) n+=R.length; }); return n; }
function renderHomeSt(){
 var box=document.getElementById("homeImp"); if(!box) return;
 var n=homeCount(); box.hidden=!n || DB.records.length>0; if(n) document.getElementById("homeImpT").textContent=t("hmT",{n:n});
}
document.getElementById("homeImpGo").addEventListener("click",function(){ go("tools"); var s=document.getElementById("stSrc"); if(s){ var f=STSRC.filter(function(x){ var R=stRows(x); return R&&R.length; })[0]; if(f) s.value=f; } stPreview(false); var b=document.getElementById("stBox"); if(b&&b.scrollIntoView) b.scrollIntoView({block:"start"}); });

/* ---------- self-assessment ---------- */
var AQ=[
 ["CP1",{ar:"هل تُسجَّل الدروس من المشكلات والحوادث الوشيكة ومن النجاحات أيضاً، لا من الأعطال الكبيرة وحدها؟",en:"Are lessons captured from problems and near misses, and from successes too, not only from big failures?"}],
 ["CP2",{ar:"هل يُرفق بكل درس دليل (سجلات، بيانات، تقارير) والمتوقع مقابل ما حدث فعلاً؟",en:"Does every lesson carry evidence (records, data, reports) and what was expected against what actually happened?"}],
 ["CP3",{ar:"هل يُؤخذ سبب الدرس من تحليل حقيقي (RCA أو لماذا الخمس أو عظمة السمكة أو A3 أو DMAIC أو FMEA)، لا من رأي؟",en:"Is the cause of a lesson taken from a real analysis (RCA, 5 Whys, Fishbone, A3, DMAIC or FMEA), not from an opinion?"}],
 ["RL1",{ar:"هل يُكتب الدرس قاعدة يطبقها شخص آخر («عندما… افعل… لأن…») مع أين تنطبق وأين لا تنطبق؟",en:"Is the lesson written as a rule someone else can apply (\"When…, do…, because…\"), with where it applies and where it does not?"}],
 ["RL2",{ar:"هل تُكتب الدروس بلا لوم لأشخاص، فتصف ما في العملية سمح بالخطأ لا من أخطأ؟",en:"Are lessons written without blaming people, describing what in the process allowed the error rather than who made it?"}],
 ["RL3",{ar:"هل لكل إجراء ترسيخ مالك وموعد، ويُتابع حتى التنفيذ؟",en:"Does every embedding action have an owner and a due date, and is it followed until it is done?"}],
 ["EM1",{ar:"هل تتغير فعلاً وثيقة أو ضابط أو ممارسة (إجراء، نموذج، قائمة فحص، تدريب) بعد كل درس، بدليل على التغيير؟",en:"Does a document, a control or a practice (procedure, form, checklist, training) actually change after each lesson, with evidence of the change?"}],
 ["EM2",{ar:"هل تدخل الدروس صفوف FMEA وخطط الضبط ومعايير التصميم وبنود العقود؟",en:"Do lessons feed FMEA rows, control plans, design standards and contract clauses?"}],
 ["EM3",{ar:"هل يُبحث في سجل الدروس عند بدء كل مشروع أو تغيير، وتُقرأ القواعد التي تنطبق عليه؟",en:"Is the lessons register searched at the start of each project or change, and are the rules that apply read?"}],
 ["VS1",{ar:"هل يُتحقق لاحقاً، بتاريخ ودليل، أن المشروع أو العملية التالية طبّقت الدرس ونجح؟",en:"Is it checked later, with a date and evidence, that the next project or process applied the lesson and it worked?"}],
 ["VS2",{ar:"هل تُعمَّم الدروس على المواقع والمشاريع الأخرى ومن يحتاجها، ويُسجَّل ذلك؟",en:"Are lessons shared with other sites, projects and the people who need them, and is it recorded?"}],
 ["VS3",{ar:"هل يُراجع سجل الدروس دورياً (مثلاً في مراجعة الإدارة) لإغلاق ما لم يُرسَّخ أو يُتحقق منه؟",en:"Is the register reviewed periodically (for example in management review) to close what is not embedded or verified?"}]
];
var AGROUPS=["CP","RL","EM","VS"];
var GCOL={CP:"#7A869E",RL:"#1B2A4A",EM:"#B8901E",VS:"#3C9A5F"};
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
function renderDocs(){
 var box=document.getElementById("docsBox"); if(!box) return;
 var c0=document.getElementById("cntDocs"); if(c0) c0.textContent=DB.records.length?String(DB.records.length):"";
 if(!DB.records.length){ box.innerHTML='<div class="pd-empty">'+esc(t("none"))+'</div>'; return; }
 var rows=DB.records.map(function(r){
  var st=stageOf(r), A=acts(r), lv=lastVer(r);
  var del=(pendingDelete===r.id)?'<button class="pd-rowbtn arm" type="button" data-del="'+esc(r.id)+'">'+esc(t("delArm"))+'</button>':'<button class="pd-rowbtn" type="button" data-del="'+esc(r.id)+'">'+esc(t("del"))+'</button>';
  var lk=(r.src!=="none"&&r.srcId?'<button class="pd-rowbtn" type="button" data-osrc="'+esc(r.src)+'" data-oid="'+esc(r.srcId)+'">'+esc(r.src.toUpperCase()==="WHY5"?"5 Whys":(r.src==="fish"?"Fishbone":(r.src==="pareto"?"Pareto":r.src.toUpperCase())))+' ↗</button>':'')+(r.capa&&r.src!=="capa"?'<button class="pd-rowbtn" type="button" data-osrc="capa" data-oid="'+esc(r.capa)+'">CAPA ↗</button>':'');
  return '<tr><td><b dir="ltr">'+esc(r.ref||"—")+'</b><br>'+esc(r.title)+'<br><small dir="ltr" style="color:var(--muted)">'+esc(r.id)+'</small></td><td>'+esc(t("ty_"+r.type))+'<br><small>'+esc(t("src_"+r.src))+(r.srcId?' <span dir="ltr">'+esc(r.srcId)+'</span>':'')+'</small></td><td>'+stChip(st)+'</td><td><small>'+esc(short(ruleSay(r),160)||"—")+'</small></td><td>'+(A.length?esc(t("actsN",{d:A.filter(actDone).length,n:A.length})):"—")+'</td><td>'+(lv?esc(t("verN",{d:lv.date,x:t("rs_"+lv.res)})):"—")+'</td><td>'+flagsOf(r).map(chip).join("")+'</td><td><button class="pd-rowbtn" type="button" data-open="'+esc(r.id)+'">'+esc(t("open"))+'</button>'+del+lk+'</td></tr>';
 }).join("");
 box.innerHTML='<table class="pd-tbl">'+th(["colRef","colType","colStage","colRule","colActs","colVer","colFlags","colAct"])+'<tbody>'+rows+'</tbody></table>';
}
document.addEventListener("click",function(e){
 if(e.target.closest("#cb")) return;
 var o=e.target.closest("[data-open]"); if(o){ var r=DB.records.find(function(x){ return x.id===o.getAttribute("data-open"); }); if(r){ loadRecordIntoForm(r); go("tools"); } return; }
 var d=e.target.closest("[data-del]"); if(d){ var id=d.getAttribute("data-del"); if(pendingDelete===id){ DB.records=DB.records.filter(function(x){ return x.id!==id; }); pendingDelete=null; persist(); if(document.getElementById("rid").value===id) clearForm(); renderAll(); } else { pendingDelete=id; renderDocs(); } return; }
 var os=e.target.closest("[data-osrc]"); if(os){ openSrc(os.getAttribute("data-osrc"),os.getAttribute("data-oid")); return; }
 if(e.target.closest("#srcOpen")){ var r2=formToRec(); openSrc(r2.src,r2.srcId); return; }
 if(e.target.closest("#caOpen")){ openTool("capa.html","docs"); return; }
 if(e.target.closest("#czTake")){ takeCause(); return; }
 var fo=e.target.closest("[data-fmo]"); if(fo){ var inp=fo.parentNode.querySelector("input"), v=inp?txt(inp.value):""; if(v) openSrc("fmea",v); return; }
 var rel=e.target.closest("[data-qt]"); if(rel){ e.preventDefault(); openTool("iso10009.html","explain-cl"); return; }
 var ad=e.target.closest("[data-add]"); if(ad){ var tb=ad.getAttribute("data-add"), raw=formRaw()[tb];
  if(tb==="ac"){ if(raw.length<MAXACTS){ raw.push(blankAc(nextId(raw,"e",editing?editing.acts:[]))); renderCards(raw.map(fixAc)); var bx=document.getElementById("acCards"), lt=bx&&bx.querySelector(".dm-card:last-child textarea"); if(lt) lt.focus(); } refreshForm(); return; }
  if(raw.length<TB[tb].max){ var nb=TB[tb].blank(); nb.id=nextId(raw,TB[tb].pre,editing?editing[TB[tb].key]:[]); raw.push(nb); renderTbl(tb,raw); var box=document.getElementById(tb+"Rows"), lt2=box&&box.querySelector("tr:last-child input, tr:last-child textarea"); if(lt2) lt2.focus(); } refreshForm(); return; }
 var rd=e.target.closest("[data-rdel]"); if(rd){ var a=rd.getAttribute("data-rdel").split(":"), l2=formRaw()[a[0]]; l2.splice(Number(a[1]),1); if(a[0]==="ac") renderCards(l2.map(fixAc)); else renderTbl(a[0],l2); refreshForm(); return; }
});
/* a new source tool clears the record id of the old one, and the list of ids follows the tool */
document.addEventListener("change",function(e){
 var el=e.target; if(!el) return;
 if(el.id==="f-src"){ var s=document.getElementById("f-srcId"); if(s) s.value=""; fillLists(); refreshForm(); }
 if(el.id==="f-chow"&&el.value==="here"){ var ct=document.getElementById("f-ct"); if(ct) ct.readOnly=false; }
},true);

/* ---------- automatic audit of lessons ---------- */
var CHECKS=["ref","date","evid","cause","rule","blame","act","embed","verify","shared","capa"];
function auditRecord(r){
 var A=acts(r), wrote=!!(txt(r.cause.t)||txt(r.lesson.when)||txt(r.lesson.dothis)||txt(r.lesson.because));
 return {
  ref:!!(txt(r.ref)&&txt(r.owner)),
  date:TYPES.indexOf(r.type)>=0&&isD(r.date),
  evid:!!txt(r.what.ev),
  cause:causeOk(r),
  rule:ruleOk(r),
  blame:wrote?!blameOf(r).length:null,
  act:(A.length||ruleOk(r))?planOk(r):null,
  embed:A.length?A.every(actDone):null,
  verify:(embedOk(r)||vers(r).length)?verOk(r):null,
  shared:(verOk(r)||r.share.length)?shareOk(r):null,
  capa:capaNeed(r)?!!txt(r.capa):null
 };
}
function auditSummary(){ var A=TBX.audit(DB.records,auditRecord,CHECKS); return {pass:A.pass,applic:A.applic,rate:A.rate,failRec:A.failRec}; }
function renderAudit(){
 var box=document.getElementById("auBox"), kp=document.getElementById("auKpis"); if(!box) return;
 if(!DB.records.length){ box.innerHTML='<div class="pd-empty">'+esc(t("auEmpty"))+'</div>'; kp.innerHTML=""; return; }
 var A=TBX.audit(DB.records,auditRecord,CHECKS);
 var rows=A.rows.map(function(x){ return '<tr><td>'+esc(x.r.title)+'<br><small dir="ltr">'+esc(x.r.ref||x.r.id)+'</small></td>'+TBX.cells(x.res,CHECKS)+'</tr>'; }).join("");
 box.innerHTML='<table class="pd-tbl"><thead><tr><th>'+esc(t("colRef"))+'</th>'+CHECKS.map(function(k){ return '<th>'+esc(t("k_"+k))+'</th>'; }).join("")+'</tr></thead><tbody>'+rows+'</tbody></table>';
 kp.innerHTML=TBX.kpi(DB.records.length,t("auRec"))+TBX.kpi(A.rate===null?"—":A.rate+"%",t("auPass"))+TBX.kpi(A.failRec,t("auFail"))+TBX.kpi(openItems().length,t("auOpen"));
}

/* ---------- dashboard ---------- */
function counts(){
 var R=DB.records, c={n:R.length,emb:0,ver:0,shr:0,ad:0,an:0,blame:0,type:{},src:{}};
 TYPES.forEach(function(k){ c.type[k]=0; }); SRCS.forEach(function(k){ c.src[k]=0; });
 R.forEach(function(r){ if(embedOk(r)) c.emb++; if(verOk(r)) c.ver++; if(shareOk(r)) c.shr++; var A=acts(r); c.an+=A.length; c.ad+=A.filter(actDone).length; if(blameOf(r).length) c.blame++; c.type[r.type]++; c.src[r.src]++; });
 return c;
}
function pct(a,n){ return n?Math.round(a/n*100)+"%":"—"; }
function renderDash(){
 var box=document.getElementById("dKpis"); if(!box) return;
 var c=counts(), au=auditSummary(), as=assessScore(), n=c.n, oi=openItems();
 box.innerHTML=TBX.kpi(n,t("kTotal"))+TBX.kpi(pct(c.emb,n),t("kEmb"))+TBX.kpi(pct(c.ver,n),t("kVer"))+TBX.kpi(pct(c.shr,n),t("kShr"))+TBX.kpi(c.an?c.ad+"/"+c.an:"—",t("kActs"))+TBX.kpi(c.blame,t("kBlame"))+TBX.kpi(oi.length,t("kOpen"))+TBX.kpi(au.rate===null?"—":au.rate+"%",t("kAud"))+TBX.kpi(as+"%",t("kAs"));
 var nd='<p class="pd-sub" style="color:var(--ink-soft)">'+esc(t("noData"))+'</p>';
 document.getElementById("dStage").innerHTML=n?TBX.dist(STAGES,n,function(s){ return DB.records.filter(function(r){ return stageOf(r)===s; }).length; },stageName,function(s){ return SCOL[s]; }):nd;
 document.getElementById("dType").innerHTML=n?TBX.dist(TYPES,n,function(k){ return c.type[k]; },function(k){ return t("ty_"+k); },function(k){ return TCOL[k]; }):nd;
 document.getElementById("dSrc").innerHTML=n?TBX.dist(SRCS,n,function(k){ return c.src[k]; },function(k){ return t("src_"+k); },function(){ return "#1B2A4A"; }):nd;
 document.getElementById("dAssess").innerHTML=AGROUPS.map(function(g){ var p=assessScore(g); return TBX.bar(t("g_"+g),p+"%",p,GCOL[g]); }).join("")+'<p class="pd-sub" style="font-size:12.5px;color:var(--muted);margin:10px 0 0">'+esc(t("bandNote"))+'</p>';
 var dc=document.getElementById("dChart"); if(dc) dc.innerHTML=stTypeSVG(DB.records,{lang:L,W:chartW()});
 document.getElementById("dOpen").innerHTML=oi.length?oi.map(function(x){ return '<li><b>'+esc(x.r.ref||x.r.id)+'</b>'+chip([x.r.id,"info"])+'<span>'+esc(x.s)+'</span></li>'; }).join(""):'<li>'+esc(n?t("noOpen"):t("noData"))+'</li>';
}

/* ---------- report and CSV ---------- */
function buildCSV(){
 var head=["id","ref","title","type","eventDate","area","project","owner","reviewers","source","sourceId","nonconformitySource","capa","process","projectType","site","stage",
  "event","evidence","expected","actual","impact","severity","causeSource","cause","when","do","because","appliesTo","doesNotApplyTo","embeddingActions","verification","sharing","lastActionDone","lastVerification"];
 return TBX.csv(head,DB.records.map(function(r){
  var CD=codes(r), lv=lastVer(r);
  var ac=r.acts.map(function(a){ return CD[a.id]+" ["+a.kind+"] "+a.what+(a.ref?" ("+a.ref+")":"")+" — "+a.who+" by "+a.by+" — "+a.st+(a.done?" "+a.done:"")+(a.ev?" — "+a.ev:""); }).join(" | ");
  var vr=r.ver.map(function(v){ return CD[v.id]+" "+v.date+" — "+v.next+" — "+v.res+(v.ev?" — "+v.ev:""); }).join(" | ");
  var sh=r.share.map(function(s){ return CD[s.id]+" "+s.date+" — "+s.who+" — "+s.how; }).join(" | ");
  return [r.id,r.ref,r.title,r.type,r.date,r.area,r.project,r.owner,r.reviewers,r.src,r.srcId,r.nc?"yes":"no",r.capa,r.tags.proc,r.tags.ptype,r.tags.site,stageOf(r),
   r.what.event,r.what.ev,r.what.exp,r.what.act,r.what.impact,r.what.sev,r.cause.how==="link"?"linked":"written here (not analysed)",r.cause.t,r.lesson.when,r.lesson.dothis,r.lesson.because,r.lesson.applies,r.lesson.excl,ac,vr,sh,lastAct(r),lv?lv.date:""]; }));
}
function recReport(r){
 var CD=codes(r), A=auditRecord(r);
 var row=function(k,v){ return '<tr><th>'+esc(k)+'</th><td>'+esc(v===null||v===undefined||v===""?"—":v)+'</td></tr>'; };
 var mark=function(v){ return v===null?'<td class="na">—</td>':(v?'<td class="ok">✓</td>':'<td class="bad">✗</td>'); };
 var tbl=function(list,heads,cells){ return list.length?'<table><thead><tr>'+heads.map(function(h){ return '<th>'+esc(t(h))+'</th>'; }).join("")+'</tr></thead><tbody>'+list.map(function(x){ return '<tr>'+cells(x).map(function(c){ return '<td>'+esc(c===""||c===null?"—":c)+'</td>'; }).join("")+'</tr>'; }).join("")+'</tbody></table>':'<p class="meta">—</p>'; };
 return '<section class="an"><h3><span dir="ltr">'+esc(r.id)+'</span> · <span dir="ltr">'+esc(r.ref||"—")+'</span> — '+esc(r.title)+'</h3>'+
  '<p class="meta">'+esc(t("colStage"))+': <b>'+esc(stageName(stageOf(r)))+'</b> · '+esc(t("ty_"+r.type))+' · '+esc(t("src_"+r.src))+(r.srcId?' <span dir="ltr">'+esc(r.srcId)+'</span>':'')+(r.capa?' · CAPA <span dir="ltr">'+esc(r.capa)+'</span>':'')+'</p>'+
  mapHTML(r)+
  '<table><tbody>'+row(t("f_date"),r.date)+row(t("f_owner"),r.owner)+row(t("f_reviewers"),r.reviewers)+row(t("f_area"),r.area)+row(t("f_project"),r.project)+row(t("f_proc"),r.tags.proc)+row(t("f_ptype"),r.tags.ptype)+row(t("f_site"),r.tags.site)+'</tbody></table>'+
  '<h4>'+esc(t("rpWhat"))+'</h4><table><tbody>'+row(t("w_event"),r.what.event)+row(t("w_ev"),r.what.ev)+row(t("w_exp"),r.what.exp)+row(t("w_act"),r.what.act)+row(t("w_impact"),r.what.impact)+row(t("w_sev"),t("sv_"+r.what.sev))+'</tbody></table>'+
  '<h4>'+esc(t("rpCz"))+'</h4><p>'+esc(r.cause.t||"—")+(personOnly(r.cause.t)?" ⚠":"")+'</p><p class="meta">'+esc(t("ch_"+r.cause.how))+(naBad(r)?' · ⚠ '+esc(t("fl_na")):'')+'</p>'+
  '<h4>'+esc(t("rpLs"))+'</h4><p class="say">'+esc(ruleSay(r)||"—")+(blameOf(r).length?" ⚠":"")+'</p><table><tbody>'+row(t("l_applies"),r.lesson.applies)+row(t("l_excl"),r.lesson.excl)+'</tbody></table>'+
  '<h4>'+esc(t("rpActs"))+'</h4>'+tbl(r.acts,["acKind","acWhat","acRef","acWho","acBy","acSt","acDone","acEv"],function(a){ return [CD[a.id]+" · "+t("kd_"+a.kind),a.what,a.ref,a.who,a.by,t("as_"+a.st),a.done,a.ev]; })+
  '<h4>'+esc(t("rpVer"))+'</h4>'+tbl(r.ver,["vrDate","vrNext","vrRes","vrEv"],function(v){ return [v.date,v.next,t("rs_"+v.res),v.ev]; })+
  '<h4>'+esc(t("rpSh"))+'</h4>'+tbl(r.share,["shDate","shWho","shHow"],function(s){ return [s.date,s.who,s.how]; })+
  '<h4>'+esc(t("rpAu"))+'</h4><table><thead><tr>'+CHECKS.map(function(k){ return '<th>'+esc(t("k_"+k))+'</th>'; }).join("")+'</tr></thead><tbody><tr>'+CHECKS.map(function(k){ return mark(A[k]); }).join("")+'</tr></tbody></table></section>';
}
/* the process shown in the report's "read before you start": the one chosen on the page, or the process tag with the most lessons */
function rbForReport(){ if(RB) return RB; var cnt={}; DB.records.forEach(function(r){ var v=txt(r.tags.proc); if(v&&atLeast(r,"lesson")) cnt[v]=(cnt[v]||0)+1; }); var k=Object.keys(cnt).sort(function(a,b){ return (cnt[b]-cnt[a])||(a<b?-1:1); }); return k.length?"proc|"+k[0]:""; }
var MAP_CSS=".dm-map{list-style:none;margin:8px 0 12px;padding:0;display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:6px}.dm-map li{display:flex;gap:6px;align-items:center;border:1px solid #DCE4EE;border-radius:10px;padding:6px 7px;background:#fff;min-width:0}.dm-map li i{font-style:normal;flex:none;display:inline-grid;place-items:center;width:24px;height:24px;border-radius:50%;background:#EEF1F6;color:#4B5874;font-family:Georgia,serif;font-weight:700;font-size:12px}.dm-map li span{display:flex;flex-direction:column;min-width:0}.dm-map li b{font-size:12px}.dm-map li small{font-size:10.5px;color:#4B5874}.dm-map li.done i,.dm-map li.cur i{background:var(--pc);color:#fff}.dm-map li.done{border-color:var(--pc)}.dm-map li.cur{border:2px solid var(--pc)}.dm-map li.todo{opacity:.72}@media (max-width:760px){.dm-map{grid-template-columns:1fr}}";
function buildReportHTML(){
 var c=counts(), au=auditSummary(), as=assessScore(), d=today(), n=c.n, A=TBX.audit(DB.records,auditRecord,CHECKS), oi=openItems(), rb=rbForReport(), RBL=readBefore(rb);
 var mark=function(v){ return v===null?'<td class="na">—</td>':(v?'<td class="ok">✓</td>':'<td class="bad">✗</td>'); };
 var grpRows=AGROUPS.map(function(g){ return '<tr><td>'+esc(t("g_"+g))+' — '+g+'</td><td>'+assessScore(g)+'%</td></tr>'; }).join("");
 var auRows=A.rows.map(function(x){ return '<tr><td dir="ltr">'+esc(x.r.id)+'</td>'+CHECKS.map(function(k){ return mark(x.res[k]); }).join("")+'</tr>'; }).join("");
 var body='<div class="cover"><p class="kick">Continual Improvement Academy · CIA Toolbox</p><h1>Lessons Learned Register / سجل الدروس المستفادة</h1><p class="sub">'+esc(t("rpCover"))+'</p>'+
  '<p class="meta">'+esc(t("prep"))+': <bdi><strong>مدثر سلامه</strong></bdi> · <bdi dir="ltr">'+esc(d)+'</bdi> · <bdi>'+esc(t("kTotal"))+': '+n+'</bdi></p></div>'+
  '<h2>Summary / الملخص</h2><div class="k">'+
   '<div><b>'+n+'</b>'+esc(t("kTotal"))+'</div><div><b>'+pct(c.emb,n)+'</b>'+esc(t("kEmb"))+'</div><div><b>'+pct(c.ver,n)+'</b>'+esc(t("kVer"))+'</div><div><b>'+pct(c.shr,n)+'</b>'+esc(t("kShr"))+'</div><div><b>'+(c.an?c.ad+"/"+c.an:"—")+'</b>'+esc(t("kActs"))+'</div><div><b>'+c.blame+'</b>'+esc(t("kBlame"))+'</div><div><b>'+oi.length+'</b>'+esc(t("kOpen"))+'</div><div><b>'+(au.rate===null?"—":au.rate+"%")+'</b>'+esc(t("kAud"))+'</div><div><b>'+as+'%</b>'+esc(t("kAs"))+'</div></div>'+
  '<div class="chart"><p class="meta">'+esc(t("chT"))+'</p>'+stTypeSVG(DB.records,{lang:L,W:560})+'</div>'+
  (rb?'<h2>'+esc(t("rpRb",{t:rbLabel(rb)}))+'</h2>'+(RBL.length?'<ul class="rb">'+rbHTML(RBL)+'</ul>':'<p class="meta">'+esc(t("rbNone"))+'</p>'):'')+
  '<h2>'+esc(t("rpReg"))+' / The register</h2>'+(n?DB.records.map(recReport).join(""):'<p class="meta">'+esc(t("rpEmpty"))+'</p>')+
  '<h2>Audit results / نتائج التدقيق</h2>'+(n?'<p>'+esc(t("auPass"))+': '+(au.rate===null?"—":au.rate+"% ("+au.pass+"/"+au.applic+")")+'</p><table><thead><tr><th>ID</th>'+CHECKS.map(function(k){ return '<th>'+esc(t("k_"+k))+'</th>'; }).join("")+'</tr></thead><tbody>'+auRows+'</tbody></table>':'<p class="meta">—</p>')+
  '<h2>Open items / بنود تحتاج متابعة</h2>'+(oi.length?'<ul>'+oi.map(function(x){ return '<li><span dir="ltr">'+esc(x.r.id)+' · '+esc(x.r.ref||"—")+'</span> — '+esc(x.s)+'</li>'; }).join("")+'</ul>':'<p class="meta">'+esc(n?t("noOpen"):"—")+'</p>')+
  '<h2>Self-assessment / التقييم الذاتي</h2><table><thead><tr><th>Area / المحور</th><th>Score / النتيجة</th></tr></thead><tbody>'+grpRows+'<tr><td><b>'+esc(t("kAs"))+'</b></td><td><b>'+as+'%</b></td></tr></tbody></table><p class="meta">'+esc(t("bandNote"))+'</p>'+
  '<footer>Prepared by / أعدّه: مدثر سلامه · Lessons learned is a practice, not a requirement of any standard: a lesson is not learned until a document, a control or a practice has changed and the next project used it and it worked; successes are lessons too; the wording is blame-free; the register is read at the start of each project or change. Sources / المراجع: ISO 9001:2026 clauses 7.1.6, 7.4, 8.1, 8.5.6, 9.1.3, 9.3.2, 10.1 and 10.2.1 and Annex A.7.1.6; ISO 9000:2026 3.2.4, 3.10.4, 4.2.4, 4.2.6, 4.2.7 and 4.3.9; ISO 10009:2024 clause 15 (15.6); ISO 19011:2026 5.7, 6.3.2.2 and 6.6 (interpretive summaries, not the official text); ISO 30401, PMBOK and PRINCE2 not verified (not uploaded) · Examples are illustrative.</footer>';
 return TBX.reportDoc(L,'Lessons Learned Report — مدثر سلامه',body,MAP_CSS+'.ok{color:#2F7D4B;font-weight:700;text-align:center}.bad{color:#B42318;font-weight:700}td.bad{text-align:center}.na{color:#7A869E;text-align:center}ul{padding-inline-start:20px}h3{font-family:Georgia,serif;margin:22px 0 4px;font-size:17px}h4{margin:14px 0 4px;font-size:14.5px}.an{border-top:1px solid #DCE4EE;padding-top:6px;break-inside:auto}.an th{background:#F3F7FB;color:#1B2A4A}.an tbody th{width:30%}.say,.ll-say{font-weight:700;color:#1B2A4A;border-inline-start:4px solid #B8901E;padding-inline-start:10px}.ll-rbm{margin:2px 0;color:#4B5874;font-size:13px}ul.rb li{margin-bottom:10px}.chart{margin:8px 0}.chart svg{max-width:100%;height:auto}.cover{border-bottom:4px solid #B8901E;padding:18px 0 14px;margin-bottom:8px}.cover h1{border:0;margin:6px 0}.cover .kick{color:#B8901E;font-weight:700;letter-spacing:.04em;margin:0}.cover .sub{font-size:18px;margin:4px 0}@media print{.an{page-break-before:always}}');
}
function stamp(){ return today(); }
function renderReport(){
 var prev=document.getElementById("rpPrev"); if(!prev) return;
 if(!DB.records.length){ prev.innerHTML='<p class="pd-sub" style="color:var(--ink-soft)">'+esc(t("rpEmpty"))+'</p>'; return; }
 var c=counts(), au=auditSummary();
 prev.innerHTML='<div class="pd-kpis">'+TBX.kpi(c.n,t("kTotal"))+TBX.kpi(pct(c.emb,c.n),t("kEmb"))+TBX.kpi(pct(c.ver,c.n),t("kVer"))+TBX.kpi(openItems().length,t("kOpen"))+TBX.kpi(au.rate===null?"—":au.rate+"%",t("kAud"))+'</div>';
}
document.getElementById("rpHtml").addEventListener("click",function(){
 var err=document.getElementById("rpErr"); err.textContent="";
 if(!DB.records.length && !Object.keys(DB.assess).length){ err.textContent=t("rpEmpty"); return; }
 TBX.download("Lessons-learned-report-"+stamp()+".html","text/html;charset=utf-8",buildReportHTML());
});
document.getElementById("rpCsv").addEventListener("click",function(){ var err=document.getElementById("rpErr"); err.textContent=""; if(!DB.records.length){ err.textContent=t("rpEmpty"); return; } TBX.download("Lessons-learned-"+stamp()+".csv","text/csv;charset=utf-8",buildCSV()); });
document.getElementById("dCsv").addEventListener("click",function(){ if(!DB.records.length) return; TBX.download("Lessons-learned-"+stamp()+".csv","text/csv;charset=utf-8",buildCSV()); });

/* ---------- platform identity: academy logo and related tools ---------- */
var LOGO="__LOGO__";
function applyLogo(){ document.querySelectorAll("img[data-logo]").forEach(function(i){ if(i.src!==LOGO) i.src=LOGO; i.alt=t("logoAlt"); }); }
var RELATED=[["fmea","FMEA","./fmea.html","#B42318"],["dmaic","DMAIC","./dmaic.html","#1B2A4A"],["a3","A3","./a3.html","#B8901E"],["rca","RCA","./rca.html","#1B2A4A"],["pareto","Pareto","./pareto.html","#C9821A"],["fish","Fishbone","./fishbone.html","#1E8C93"],["why5","5 Whys","./five-whys.html","#3563C9"],["capa","CAPA","./capa.html","#C2410C"],["pdca","PDCA","./pdca.html","#3C9A5F"],["iso10009","ISO 10009","./iso10009.html#explain-cl","#7B5BB8"]];
function buildRelated(){
 var box=document.getElementById("homeStd"); if(!box) return;
 box.innerHTML='<p class="hs-t">'+esc(t("related"))+'</p>'+RELATED.map(function(r){ return '<a class="hs on" href="'+r[2]+'" target="_blank" rel="noopener"'+(r[0]==="iso10009"?' data-qt="1"':'')+' style="--c:'+r[3]+';--t:'+r[3]+'14"><b dir="ltr">'+r[1]+'</b><span>'+esc(t("rel_"+r[0]))+'</span><em>↗</em></a>'; }).join("");
}

/* ---------- example data (illustrative, fictitious Saudi company) and clear all ---------- */
__EXAMPLE__
function loadExample(){
 DB={records:JSON.parse(JSON.stringify(EXAMPLE[L]||EXAMPLE.ar)),assess:JSON.parse(JSON.stringify(EXAMPLE_AS))};
 pendingDelete=null; RB=""; var ok=persist(); clearForm(); renderAll();
 var m=document.getElementById("exMsg"); if(m) m.textContent=ok?t("exLoaded"):t("savedFail");
}
function clearAll(){
 DB={records:[],assess:{}}; pendingDelete=null; ST=null; RB="";
 TBX.drop(STORE);
 clearForm(); renderAll();
 document.getElementById("stTable").hidden=true; document.getElementById("stMsg").textContent="";
 var m=document.getElementById("exMsg"); if(m) m.textContent=t("exCleared");
 var a=document.getElementById("asMsg"); if(a) a.textContent="";
}
/* the tour layer asks for confirmation before the example replaces data (guard "pfEx": "all"); clearing asks here */
document.getElementById("pfEx").addEventListener("click",function(){ loadExample(); });
document.getElementById("pfReset").addEventListener("click",function(){ var ok=true; try{ ok=window.confirm(t("exConfirmClear")); }catch(e){ ok=true; } if(ok) clearAll(); });

/* ---------- assistant: answers from the tool's own guide and your lessons (rule-based, no AI service) ---------- */
var CONTACT_EMAIL="moddathersalama.eng@gmail.com";
var CB={
 ar:{fab:"اسأل عن الدروس المستفادة",title:"مساعد الدروس المستفادة",sub:"إجابات فورية من دليل الأداة ودروسك",new:"محادثة جديدة",close:"إغلاق",ph:"اكتب سؤالك…",send:"إرسال",inL:"سؤالك",
  hello:"مرحباً. أجيب عن أسئلة الدروس المستفادة من دليل الأداة ومن دروسك المحفوظة في هذا المتصفح. اختر سؤالاً أو اكتب سؤالك.",
  miss:"لم أجد إجابة جاهزة لهذا السؤال. جرّب أحد الأسئلة المقترحة، أو اسأل عن: متى يكون الدرس مستفاداً، أو الفرق بين الدروس وCAPA وFMEA، أو صياغة الدرس، أو اللوم، أو القراءة قبل بدء المشروع. وللاستشارة راسل المُعِد على البريد أدناه.",
  instant:"إجابة فورية",foot:"المساعد يعمل في متصفحك ولا يرسل بياناتك. للتواصل:",
  op0:"لا توجد بنود مفتوحة في دروسك الآن.",st0:"لا توجد دروس بعد. ابدأ من [[tab:tools]] أو حمّل المثال من [[tab:docs]]."},
 en:{fab:"Ask about lessons learned",title:"Lessons learned assistant",sub:"Instant answers from the tool's guide and your lessons",new:"New chat",close:"Close",ph:"Type your question…",send:"Send",inL:"Your question",
  hello:"Hello. I answer questions on lessons learned from the tool's guide and from your lessons saved in this browser. Pick a question or type your own.",
  miss:"I have no ready answer for that. Try one of the suggested questions, or ask when a lesson is learned, lessons against CAPA and FMEA, how to write a lesson, blame, or reading before a project starts. For advice, email the author at the address below.",
  instant:"Instant answer",foot:"The assistant runs in your browser and sends no data. Contact:",
  op0:"No open items in your lessons right now.",st0:"No lessons yet. Start from the [[tab:tools]] or load the example in [[tab:docs]]."}
};
var KB=[
 {id:"learned",k:["مستفاد","متى يكون","learned","really","فعلا","فعلاً","تعلمنا","learnt"],q:{ar:"متى يكون الدرس «مستفاداً» فعلاً؟",en:"When is a lesson really learned?"},
  a:{ar:"**عندما تتغير وثيقة أو ضابط أو ممارسة، ويستخدمه المشروع التالي وينجح.** كتابة الدرس في محضر اجتماع ليست تعلماً. لذلك تحسب الأداة المرحلة: سُجّل الحدث، ثم رُبط السبب، ثم كُتب الدرس قاعدة، ثم خُططت الإجراءات، ثم **رُسّخ** (نُفذت الإجراءات بدليل التغيير)، ثم **تُحقق منه** (تحقق مؤرخ بعد الإجراءات أن مشروعاً تالياً طبّقه ونجح)، ثم عُمّم. ويعرّف ISO 9000:2026 الممارسة الجيدة (3.2.4) بأنها طريقة ثبت أنها تعمل وتُعتمد نموذجاً بعد اختبارها. في المثال: درس خرسانة الصيف لم يُعدّ مستفاداً إلا بعد أن رُفضت شحنة واحدة من 64 في المشروع الثاني.",
   en:"**When a document, a control or a practice has changed, and the next project used it and it worked.** Writing the lesson in meeting minutes is not learning. So the tool computes the stage: captured, cause linked, lesson written as a rule, actions planned, then **embedded** (the actions done with evidence of the change), then **verified** (a dated check after the actions that a later project applied it and it worked), then shared. ISO 9000:2026 defines a good practice (3.2.4) as a method proven to work and adopted as a model after testing. In the example, the summer concrete lesson counted as learned only after one load in 64 was rejected on the second project."}},
 {id:"which",k:["capa","fmea","الفرق","difference","which","versus","vs","أيها","ايها","أيهما","ايهما","بدل"],q:{ar:"الدروس المستفادة أم CAPA أم FMEA: أيها أستخدم؟",en:"Lessons learned, CAPA or FMEA — which one?"},
  a:{ar:"ليست بدائل. **CAPA** للتعامل مع حالة عدم مطابقة محددة: التصحيح والسبب والإجراء التصحيحي وفعاليته (10.2). و**FMEA** نظرة إلى الأمام في عملية: كيف قد تفشل وما الأولوية. و**الدروس المستفادة** تحمل ما تعلمته من حدث (فشل أو نجاح) إلى **المشاريع والعمليات الأخرى**: قاعدة، ثم ترسيخ، ثم تحقق في المشروع التالي. وتعمل معاً: يُؤخذ السبب من CAPA أو RCA، ويصبح الدرس صفاً في FMEA أو بنداً في خطة ضبط، وتُسجّل الحالة في CAPA عندما يكون المصدر عدم مطابقة.",
   en:"They are not alternatives. **CAPA** deals with one nonconformity: correction, cause, corrective action and its effectiveness (10.2). **FMEA** looks ahead in a process: how it could fail and what comes first. **Lessons learned** carries what you learned from an event (a failure or a success) to **other projects and processes**: a rule, then embedding, then a check on the next project. They work together: the cause comes from CAPA or RCA, the lesson becomes an FMEA row or a control-plan item, and the case stays in CAPA when a nonconformity is the source."}},
 {id:"req",k:["متطلب","مطلوب","iso 9001","7.1.6","requirement","required","shall","مواصفة"],q:{ar:"هل الدروس المستفادة متطلب في ISO 9001:2026؟",en:"Is lessons learned required by ISO 9001:2026?"},
  a:{ar:"لا، بهذا الاسم. الدروس المستفادة **ممارسة** وليست متطلباً. لكن ISO 9001:2026 تطلب في **7.1.6** تحديد المعرفة اللازمة لتشغيل العمليات والاحتفاظ بها وتطبيقها ومشاركتها بالقدر اللازم، وفي **10.2.1 هـ) و و)** تحديث المخاطر والفرص وإجراء التغييرات على النظام عند الحاجة بعد عدم المطابقة، وفي **10.1** التحسين المستمر. والسجل طريقة منظمة لإثبات ذلك. ولا تراجع ISO 10009:2024 الدروس المستفادة أداةً؛ أقرب ما فيها البند 15 وأنظمة الاقتراحات في 15.6. وملاحظة 7.1.6 في إصدار 2026 تذكر أشكال المعرفة (خبرة الأشخاص، والتعلم من الآخرين، والمعرفة المضمنة في الطرق والعمليات، والمعلومات الموثقة).",
   en:"Not by that name. Lessons learned is **a practice**, not a requirement. But ISO 9001:2026 asks in **7.1.6** to determine the knowledge needed to operate the processes and to retain, apply and share it to the extent necessary; in **10.2.1 e) and f)** to update the risks and opportunities and make changes to the system, if necessary, after a nonconformity; and in **10.1** to improve continually. A register is a structured way to show it. ISO 10009:2024 does not review lessons learned as a tool; the nearest is clause 15, with suggestion schemes in 15.6. The NOTE of 7.1.6 in the 2026 edition lists the forms knowledge can take (experience held by people, learning from others, knowledge embedded in methods and processes, documented information)."}},
 {id:"write",k:["اكتب","صياغة","كيف أكتب","rule","write","wording","قاعدة","when","عندما"],q:{ar:"كيف أكتب درساً يستفيد منه غيري؟",en:"How do I write a lesson others can use?"},
  a:{ar:"اكتبه **قاعدة**: «**عندما** (الموقف الذي يتكرر)، **افعل** (فعلاً محدداً)، **لأن** (ما تعلمناه بالدليل)»، ثم **أين تنطبق** وأين **لا تنطبق**. مثال: «عندما نطلب خرسانة جاهزة لصبات بين مايو وسبتمبر، اكتب الماء المبرد في عقد التوريد وافحص كل شحنة بميزان حرارة معاير عند البوابة، لأن الرفض بلا ماء مبرد كان أعلى أربع مرات». والنجاح يُكتب بالطريقة نفسها: ما الذي نجح، ولماذا، وأين يُكرر. وابحث بالوسوم (العملية، نوع المشروع، الموقع) حتى يجده من يحتاجه.",
   en:"Write it as **a rule**: \"**When** (the situation that comes back), **do** (a specific action), **because** (what we learned, with evidence)\", then **where it applies** and **where it does not**. For example: \"When ordering ready-mix concrete for pours between May and September, write chilled water into the supply contract and check every load with a calibrated thermometer at the gate, because rejections without chilled water were four times higher.\" A success is written the same way: what worked, why, and where to repeat it. Tag it (process, project type, site) so whoever needs it can find it."}},
 {id:"blame",k:["لوم","يلوم","شخص","blame","person","إهمال","negligen","name","اسم"],q:{ar:"لماذا يجب أن يكون الدرس بلا لوم؟",en:"Why must a lesson be blame-free?"},
  a:{ar:"لأن **الدرس الذي يلوم شخصاً لا يغيّر العملية**، ويجعل الناس يخفون الأخطاء والحوادث الوشيكة فيضيع التعلم. اكتب ما في العملية سمح بالخطأ: قالب بلا طريقة ربط، فحص يُعطى بالراديو، عقد لا يطلب الشهادة. ويذكر ISO 9000:2026 في مبدأ مشاركة الناس (4.2.4) تسهيل النقاش المفتوح وتبادل المعرفة والخبرة وتمكين الناس من المبادرة دون خوف. وتنبّه الأداة على الصياغة التي تشير إلى شخص (إهمال، عدم انتباه، خطأ فلان) بالقاعدة نفسها في FMEA وDMAIC وA3 وRCA، ولا تكتمل مرحلة «كُتب الدرس» قبل إعادة الصياغة.",
   en:"Because **a lesson that blames a person does not change the process**, and it makes people hide errors and near misses, so the learning is lost. Write what in the process allowed the error: a template with no rigging method, a check given by radio, a contract that does not ask for the certificate. ISO 9000:2026, in the engagement of people principle (4.2.4), speaks of open discussion, sharing knowledge and experience, and letting people take initiatives without fear. The tool flags wording that names a person (negligence, inattention, someone's mistake) with the same rule as FMEA, DMAIC, A3 and RCA, and the \"lesson written\" stage is not complete until it is rewritten."}},
 {id:"start",k:["قبل البدء","قبل أن","مشروع جديد","start","before","new project","بحث","search","اقرأ","read"],q:{ar:"كيف نستخدم السجل عند بدء مشروع جديد؟",en:"How do we use the register when a new project starts?"},
  a:{ar:"افتح [[tab:tools]] واختر في «اقرأ قبل أن تبدأ» العملية أو نوع المشروع: تظهر القواعد المكتوبة التي تنطبق عليه، ومن تحقق منها وأين. أو ابحث بالنص والنوع والمرحلة والوسوم. ثم اجعل القراءة خطوة في بدء المشروع (التخطيط 8.1 وضبط التغييرات 8.5.6): دقائق في اجتماع البدء، وصفوف في FMEA، وبنود في خطة الضبط. ويذكر ISO 19011:2026 الدروس المستفادة مدخلاً في تخطيط التدقيق (6.3.2.2) وفي تحسين برنامج التدقيق (5.7). سجل لا يقرؤه أحد فجوة.",
   en:"Open the [[tab:tools]] and pick the process or the project type in \"read before you start\": the written rules that apply show up, with who verified them and where. Or search by text, type, stage and tags. Then make reading a step of starting a project (planning 8.1 and control of changes 8.5.6): a few minutes in the kick-off meeting, rows in the FMEA, items in the control plan. ISO 19011:2026 names lessons learned as an input to audit planning (6.3.2.2) and to improving the audit programme (5.7). A register nobody reads is a gap."}},
 {id:"open",dyn:"open",k:["مفتوح","مفتوحة","متابعة","open items","follow"],q:{ar:"ما البنود المفتوحة في دروسي؟",en:"What is still open in my lessons?"}},
 {id:"status",dyn:"status",k:["وضع","حالة","ملخص","status","summary","where do we stand"],q:{ar:"ما وضع سجل الدروس الآن؟",en:"Where does my register stand?"}}
];
var CB_SUG=["learned","which","write","start","status"];
function kbDyn(id){
 var u=CB[L]||CB.ar;
 if(id==="open"){ var O=openItems(); if(!O.length) return u.op0+"\n\n[[tab:dash]]"; return O.map(function(x){ return "- **"+(x.r.ref||x.r.id)+"** — "+x.s; }).join("\n")+"\n\n[[tab:docs]] · [[tab:dash]]"; }
 if(id==="status"){ var c=counts(); if(!c.n) return u.st0; return "- "+t("kTotal")+": **"+c.n+"**\n- "+t("kEmb")+": **"+pct(c.emb,c.n)+"**\n- "+t("kVer")+": **"+pct(c.ver,c.n)+"**\n- "+t("kShr")+": **"+pct(c.shr,c.n)+"**\n- "+t("kOpen")+": **"+openItems().length+"**\n- "+t("kAs")+": **"+assessScore()+"%**\n\n[[tab:dash]] · [[tab:audit]]"; }
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
function renderAll(){ renderDocs(); renderAudit(); renderDash(); renderReport(); renderAssess(); renderHomeSt(); renderFind(); fillLists(); refreshForm(); }
document.getElementById("rec-form").addEventListener("submit",function(e){ e.preventDefault(); saveRecord(); });
document.getElementById("rec-form").addEventListener("input",function(e){ if(e.target&&e.target.tagName==="TEXTAREA") autoSize(e.target); refreshForm(); });
document.getElementById("rec-form").addEventListener("change",function(){ refreshForm(); });
document.getElementById("newBtn").addEventListener("click",function(){ clearForm(); });
document.getElementById("langBtn").addEventListener("click",function(){ switchLang(); });
window.addEventListener("hashchange",function(){ var h=location.hash.slice(1); if(h!==curTab) go(h); });
window.addEventListener("storage",function(e){ if([PDCA_KEY,CAPA_KEY,PARETO_KEY,FISH_KEY,WHY5_KEY,RCA_KEY,A3_KEY,DM_KEY,FM_KEY].indexOf(e.key)>=0){ renderHomeSt(); fillLists(); if(ST) stPreview(true); refreshForm(); } });
var rzT=null, rzW=chartW(); window.addEventListener("resize",function(){ clearTimeout(rzT); rzT=setTimeout(function(){ if(chartW()!==rzW){ rzW=chartW(); renderDash(); } },150); });

/* ---------- boot ---------- */
/* a link from FMEA or the hub may ask to open a lesson (?open=ID); a request may also start one from an RCA investigation (?rca=ID), an A3
   (?a3=ID), a DMAIC project (?dmaic=ID), an FMEA study (?fmea=ID), a CAPA record (?capa=ID) or a PDCA cycle (?pdca=ID); inside the hub the same
   request arrives as a one-time hint */
function navRequest(){
 var q={}, K=["open"].concat(STSRC);
 try{ var u=new URLSearchParams(location.search); K.forEach(function(k){ if(u.get(k)) q[k]=u.get(k); }); }catch(e){}
 try{ var h=JSON.parse(sessionStorage.getItem(NAV_KEY)||"null"); sessionStorage.removeItem(NAV_KEY); if(h&&typeof h==="object"){ K.forEach(function(k){ if(h[k]) q[k]=String(h[k]); }); } }catch(e){}
 return q;
}
applyLang();
(function(){
 var q=navRequest(), r=q.open?DB.records.filter(function(x){ return x.id===q.open; })[0]:null;
 if(r){ loadRecordIntoForm(r); go("tools"); return; }
 for(var i=0;i<STSRC.length;i++){ if(q[STSRC[i]]&&prefillFrom(STSRC[i],q[STSRC[i]])) return; }
 go((location.hash||"#home").slice(1));
})();
