/* ===== FMEA tool — host logic. Studies and assessment are stored in this browser only (localStorage, wrapped in try/catch). =====
   Storage key "cia-fmea:v1" (this tool only). Schema:
   { records: [ {
       id, title, ref, type: "process"|"design",
       src: "dmaic"|"a3"|"rca"|"pareto"|"capa"|"change"|"audit"|"new", nc: true|false (a nonconformity is the source),
       scope, facil (facilitator), owner (process owner), area, start (YYYY-MM-DD),
       dmaic (DMAIC project id), a3 (A3 id), rca (RCA investigation id), pareto (Pareto analysis id), pcat (its category id),
       capa (CAPA record id), pdca (PDCA cycle id),
       team:  [ {n, role} ]
       sc:    {date (date the scales were agreed), S: [10 texts], O: [10 texts], D: [10 texts]}     written 1–10 scales, level 1 first;
       rated (date of the first rating; the scales come first: sc.date ≤ rated)                    kept the same across the study
       steps: [ {id, t} ] (3–15), stepsFrom (DMAIC project the steps were taken from, read only)   the structure
       rows:  [ {id, step (step id), fn (function or requirement), mode (failure mode), eff (effect), s (1–10|null),
                 cause, how: "here"|"fish"|"why5"|"rca", ref (id in that tool), prev (prevention control), o (1–10|null),
                 det (detection control), d (1–10|null), oev (occurrence evidence)} ]               RPN = S × O × D (computed);
                                                                                                    action priority by the written rule
       acts:  [ {id, row (row id), what, kind: "change"|"prevent"|"detect", who, by (YYYY-MM-DD),
                 st: "plan"|"doing"|"done", done (YYYY-MM-DD), ns, no, nd (1–10|null), ev} ]        the ratings again after the action;
                                                                                                    severity falls only with a change
       reviews: [ {date, team, chg (what changed in the process), rows (rows revisited)} ]
       created, updated } ],
     assess: { PP1..LV2: 0|1|2 } }
   Other tools' keys are only read, never written: "cia-dmaic:v1" (start from a project: its stage by DMAIC's own rule, its SIPOC steps
   and its proved causes), "cia-rca:v1" (start from an investigation; candidate causes), "cia-pareto:v1" (start from a vital-few category),
   "cia-fish:v1" and "cia-why5:v1" (candidate causes and previews), "cia-a3:v1" and "cia-capa:v1" (previews) and "cia-pdca:v1" (cycle
   names). The other tools open through their own requests (?open=, ?capa=, ?a3=, ?rca=, ?pareto=&cat= or their one-time sessionStorage
   hints "cia-nav:dmaic", "cia-nav:a3", "cia-nav:rca", "cia-nav:fishbone", "cia-nav:five-whys", "cia-nav:pareto"). This tool reads its own
   hint "cia-nav:fmea" ({open} | {dmaic} | {rca} | {pareto, cat}) and its address (?open=, ?dmaic=, ?rca=, ?pareto=&cat=) once; none of
   them holds tool data. */
var LKEY="cia-lang", STORE="cia-fmea:v1", DM_KEY="cia-dmaic:v1", A3_KEY="cia-a3:v1", RCA_KEY="cia-rca:v1", CAPA_KEY="cia-capa:v1", PARETO_KEY="cia-pareto:v1", FISH_KEY="cia-fish:v1", WHY5_KEY="cia-why5:v1", PDCA_KEY="cia-pdca:v1",
    NAV_KEY="cia-nav:fmea", DM_NAV="cia-nav:dmaic", A3_NAV="cia-nav:a3", RCA_NAV="cia-nav:rca", FISH_NAV="cia-nav:fishbone", WHY5_NAV="cia-nav:five-whys", PARETO_NAV="cia-nav:pareto";
var L=(function(){ try{ return localStorage.getItem(LKEY)||"ar"; }catch(e){ return "ar"; } })();
var TABS=["home","explain-std","explain-cl","assess","tools","docs","audit","dash","report","ai"];
var TITLES={ar:"FMEA | تحليل أنماط الفشل وآثارها — مدثر سلامه",en:"FMEA | Failure mode and effects analysis — مدثر سلامه"};
var STAGES=["draft","scoped","scales","struct","analysed","planned","done","reviewed"], MAPST=STAGES.slice(1);
var SCOL={draft:"#9AA5B8",scoped:"#7A869E",scales:"#B8901E",struct:"#3563C9",analysed:"#1B2A4A",planned:"#C9821A",done:"#1E8C93",reviewed:"#3C9A5F"};
var SRCS=["dmaic","a3","rca","pareto","capa","change","audit","new"], TYPES=["process","design"];
var HOWS=["here","fish","why5","rca"], KINDS=["change","prevent","detect"], ASTS=["plan","doing","done"], RATE=["","1","2","3","4","5","6","7","8","9","10"];
var APCOL={H:"#B42318",M:"#C9821A",L:"#3C9A5F"};
var MAXROWS=40, MAXSTEPS=15, MINSTEPS=3, MAXREV=20;
var DB=load();
var curTab="home";
var editing=null;   /* deep copy of the study open in the form: keeps created between saves */
var ST=null;        /* rows of the read-only start preview */

var UI={
ar:{brand:"أكاديمية التحسين المستمر · مدثر سلامه",toolName:"أداة FMEA — تحليل أنماط الفشل وآثارها",sgLearn:"التعلّم",sgWork:"العمل",sgOut:"المخرجات",
 nHome:"الرئيسية",nStd:"دليل المنهجية",nCl:"دليل البنود",nAssess:"التقييم الذاتي",nTools:"دراسة FMEA",nDocs:"السجلات",nAudit:"التدقيق",nDash:"لوحة المؤشرات",nReport:"التقرير",nAi:"المساعد الذكي",soon:"قريباً",
 homeCode:"نمط الفشل · الأثر · السبب · الضوابط · الأولوية",homeH1:"تحليل أنماط الفشل وآثارها (FMEA)",
 homeLede:"نظرة منظمة يقوم بها فريق إلى الأمام: كيف يمكن أن تفشل كل خطوة في العملية (أو كل وظيفة في التصميم)، وما أثر ذلك على العميل أو الخطوة التالية، وما الذي قد يسببه، وما الضوابط التي تمنعه أو تكشفه، قبل أن يقع الفشل أو بعد ظهور فشل جديد مباشرة. مقاييس مكتوبة قبل التقييم، والخطورة العالية أولاً مهما كان رقم الأولوية، وإجراءات بمالك وتاريخ، ثم تقييم جديد بالدليل.",
 homeNote:"النسخة الحالية تحفظ الدراسات في متصفحك فقط. الحفظ على الخادم وتسجيل الدخول يُضافان في مرحلة المنصة المشتركة.",
 prep:"إعداد",authorName:"مدثر سلامه",cycleT:"ما الذي تستطيع فعله هنا",cycleS:"اقرأ دليل المنهجية، ثم قيّم ممارستكم لـ FMEA، ثم افتح أول دراسة من مشروع DMAIC أو تحقيق RCA أو فئة حيوية في باريتو أو من الصفر.",
 tStd:"النطاق والبنية أولاً، والمقاييس المكتوبة، ونمط الفشل والأثر والسبب، وضوابط المنع والكشف، والخطورة أولاً وحدود رقم الأولوية، وأولوية الإجراء، والإجراءات وإعادة التقييم، وFMEA وثيقة حية.",tCl:"ISO 10009:2024 البند 7.3 (مع 6.3 و7.1 والجدول C.1) وبنود ISO 9001:2026 التي يخدمها المنهج: المخاطر 6.1، والضبط 8.5.1 ز) منع الخطأ البشري، وضبط التغييرات 8.5.6، والإجراء التصحيحي 10.2: ملخص تفسيري ومثال وما يطلبه المدقق.",tAssess:"اثنا عشر سؤالاً تقيس ممارسة FMEA لديكم، من الفريق والمقاييس حتى المراجعة بعد التغيير.",
 tTools:"دراسة لكل عملية أو وظيفة: النطاق والفريق، والمقاييس المكتوبة، وخطوات العملية، وصفوف التحليل برقم الأولوية وأولوية الإجراء محسوبين، والإجراءات وإعادة التقييم، والمراجعة، مع خريطة حرارة للخطورة × الحدوث.",tDocs:"كل الدراسات بمرحلتها وصفوفها عالية الأولوية وتنبيهاتها، وبيانات المثال.",tAudit:"فحص آلي لكل دراسة: المرجع والميسر ومالك العملية، والفريق، والمقاييس قبل التقييم، والبنية، واكتمال الصفوف، وغياب «الخطأ البشري»، وإجراء لكل صف عالي الأولوية، وقاعدة الخطورة، وإعادة التقييم، والمراجعة، وربط CAPA.",
 tDash:"الدراسات التي عولجت صفوفها عالية الأولوية، والدراسات المعاد تقييمها بعد الإجراءات، والمراحل، والصفوف حسب أولوية الإجراء، والمصادر، وخريطة حرارة لكل الصفوف، والبنود المفتوحة، والتقييم الذاتي.",tReport:"تقرير HTML لكل دراسة بمقاييسها وبنيتها وجدول التحليل وخريطة الحرارة والإجراءات وإعادة التقييم والمراجعة والتدقيق، وملف CSV.",tAi:"مساعد يقرأ الدراسة ويقترح أنماط فشل وأسئلة للفريق. لم يُفعَّل بعد.",
 foot:"المراجع: ISO 10009:2024 البنود 7.3 و6.3 و7.1 و7.2 و7.5 والملحق A (الجدول A.3) والجدول C.1، وISO 9001:2026 المقدمة 0.3.2 والبنود 6.1 و8.1 و8.3.4 و8.5.1 و8.5.6 و9.1.3 و10.1 و10.2 والملحق A.6.1، ومبادئ ISO 9000:2026 (ملخصات تفسيرية، وليست النص الرسمي). FMEA منهج، وليس متطلباً في أي مواصفة. الأمثلة توضيحية وليست بيانات حقيقية.",
 heroTag:"أداة منهجية · نظرة فريق منظمة إلى أنماط الفشل قبل وقوعها",langSw:"English",langSwA:"Switch to English",logoAlt:"أكاديمية التحسين المستمر — مدثر سلامه",
 related:"أدوات مرتبطة في الأكاديمية",rel_dmaic:"مشروع التحسين بمنهج DMAIC",rel_a3:"حل المشكلات بأسلوب A3",rel_rca:"تحليل السبب الجذري — التحقيق",rel_pareto:"باريتو — تحليل القلة الحيوية",rel_fish:"عظمة السمكة — تحليل السبب والنتيجة",rel_why5:"لماذا الخمس — تحليل السبب الجذري",rel_capa:"الإجراءات التصحيحية",rel_pdca:"دورة PDCA",rel_iso10009:"دليل أدوات الجودة ISO 10009",
 termT:"هل FMEA متطلب في ISO 9001:2026؟",
 termP1:"لا. FMEA منهج، وليس متطلباً في أي مواصفة. تراجعه ISO 10009:2024 (إرشادات أدوات الجودة) في البند 7.3 منهجيةً قائمة على المخاطر لتحديد المشكلات المحتملة وتحليلها وترتيبها، وتذكره مدخلاً لخطة الضبط (6.3). أما ISO 9001:2026 فتطلب تحديد المخاطر وتحليلها وتقييمها والتخطيط لمعالجتها (6.1.2) دون أن تفرض طريقة؛ وتوضح في الملحق A.6.1.2 أن التفكير القائم على المخاطر لا يعني بالضرورة إدارة مخاطر رسمية.",
 termP2:"وفي الممارسة: تُكتب مقاييس الخطورة والحدوث والكشف قبل التقييم وتبقى نفسها طوال الدراسة. والخطورة تُقيَّم على الأثر ولا تنخفض بالضوابط، بل بتغيير التصميم أو العملية فقط. ورقم الأولوية (الخطورة × الحدوث × الكشف) يخفي الخطورة الكبيرة، فلا يُرتَّب العمل به وحده: الخطورة العالية تُعالج أولاً مهما كان الرقم. والتقييم من البيانات والفريق لا من شخص واحد. و«الخطأ البشري» سبب يُزال بالتصميم (8.5.1 ز)، لا نمط فشل يُلام عليه أحد. والدراسة وثيقة حية تُراجع عند تغيير العملية وبعد عدم المطابقة وبعد ملاحظة التدقيق.",
 termP3:"وFMEA يستخدم صندوق الأدوات ولا يحل محله: أسلوب «ماذا لو» المنظم أولاً عندما تكون العملية كبيرة (ISO 10009 البند 7.1)، وباريتو وRCA للأعطال التي وقعت فعلاً، وعظمة السمكة ولماذا الخمس للأسباب، وDMAIC وA3 للإجراءات التي تحتاج مشروعاً، وCAPA عندما توجد حالة عدم مطابقة، وPDCA للمتابعة.",
 termIs:"ملخص تفسيري بصياغة مستقلة، وليس النص الرسمي. المصادر: ISO 10009:2024 البنود 7.3 و6.3 و7.1 والجدول C.1، وISO 9001:2026 البنود 6.1.2 و8.5.1 ز) و8.5.6 و10.2.1 والملحق A.6.1.2. أي مرجع لـ IEC 60812 أو دليل AIAG-VDA FMEA أو ISO 31000 أو ISO 31010 غير مرفوع: «غير متحقق منه». التحقق: 2026-10-16.",
 defs:[["نمط الفشل","FMEA · ISO 10009 7.3","الطريقة التي قد تفشل بها الخطوة أو الوظيفة في أداء ما يُنتظر منها. نمط منفرد، لا مركّب.","#B42318"],["الأثر والخطورة","S · 1–10","ما يراه العميل أو الخطوة التالية إذا وقع الفشل. الخطورة تُقيَّم على الأثر ولا تنخفض بالضوابط.","#C2410C"],["السبب والحدوث","O · 1–10","ما قد يؤدي إلى نمط الفشل، وكم مرة يحدث مع ضوابط المنع الحالية.","#3563C9"],["الكشف","D · 1–10","قدرة ضوابط الكشف الحالية على اكتشاف السبب أو النمط قبل أن يصل إلى العميل.","#1E8C93"],["أولوية الإجراء","H · M · L","قاعدة مكتوبة: الخطورة 9 أو 10 تعني «عالية» دائماً، ثم الخطورة × الحدوث، ثم الكشف. رقم الأولوية للعرض فقط.","#1B2A4A"]],
 asT:"التقييم الذاتي لممارسة FMEA",asS:"أجب عن كل سؤال بما يحدث فعلاً في دراسات FMEA لديكم. النتيجة تقيس الممارسة الحالية، وليست شهادة ولا حكماً على الأداء.",asReset:"مسح الإجابات",asSaved:"تم حفظ الإجابة",asAnswered:"أُجيب {n} من 12",
 band0:"يحتاج عملاً",band1:"في طور التطوير",band2:"راسخ",bandNote:"حدود داخلية للتقييم الذاتي من تصميم هذه الأداة، وليست معياراً رسمياً.",as0:"غير موجود",as1:"جزئي",as2:"موجود ومطبّق",
 g_PP:"التحضير: الفريق والمقاييس والبنية",g_AN:"التحليل: الأثر والسبب والضوابط",g_AC:"الأولوية والإجراء وإعادة التقييم",g_LV:"الوثيقة الحية والتعلّم",
 tlT:"دراسة FMEA",tlS:"دراسة لكل عملية (أو وظيفة في التصميم). تُكتب المقاييس قبل أول تقييم، ثم البنية، ثم صفوف التحليل. يُحسب رقم الأولوية وأولوية الإجراء تلقائياً، وتتحدد المرحلة مما تملؤه، وتُرسم خريطة الحرارة وأنت تكتب.",
 save:"حفظ الدراسة",newRec:"دراسة جديدة",savedFail:"تعذّر الحفظ في هذا المتصفح. نزّل التقرير قبل إغلاق الصفحة.",cur:"المرحلة الحالية:",ok_rec:"تم حفظ الدراسة",
 st_draft:"مسودة",st_scoped:"حُدّد النطاق",st_scales:"اعتُمدت المقاييس",st_struct:"رُسمت البنية",st_analysed:"اكتمل التحليل",st_planned:"خُططت الإجراءات",st_done:"نُفذت وأعيد التقييم",st_reviewed:"روجعت",
 mp_scoped:"النطاق والفريق",mp_scales:"مقاييس مكتوبة",mp_struct:"خطوات العملية",mp_analysed:"صفوف التحليل",mp_planned:"إجراءات بمالك وتاريخ",mp_done:"تنفيذ وإعادة تقييم",mp_reviewed:"مراجعة مؤرخة",
 mapT:"مراحل الدراسة",mpDone:"مكتملة",mpCur:"قيد العمل",mpTodo:"لم تبدأ",
 sHdrT:"بيانات الدراسة",sHdrS:"المرجع، والنوع، والنطاق، والميسر، ومالك العملية، والفريق بأدواره، والمصدر، والروابط مع أدوات الصندوق.",
 sScT:"1 · المقاييس المكتوبة",sScS:"لكل درجة من 1 إلى 10 معنى مكتوب للخطورة والحدوث والكشف. تُعتمد بتاريخ قبل أول تقييم، وتبقى نفسها طوال الدراسة.",
 sStT:"2 · بنية العملية",sStS:"خطوات العملية (3 إلى 15) بالترتيب، من SIPOC مشروع DMAIC أو من خريطة العملية. البنية تأتي قبل أنماط الفشل.",
 sAnT:"3 · صفوف التحليل",sAnS:"لكل خطوة: الوظيفة أو المتطلب، ونمط الفشل، وأثره على العميل أو الخطوة التالية، والخطورة، والسبب، وضابط المنع والحدوث، وضابط الكشف والكشف.",
 sAcT:"4 · الإجراءات وإعادة التقييم",sAcS:"إجراء لكل صف عالي الأولوية على الأقل، بمالك وتاريخ. بعد التنفيذ تُقيَّم الدرجات من جديد بالدليل. الخطورة لا تنخفض إلا بتغيير في التصميم أو العملية.",
 sRvT:"5 · مراجعة الدراسة",sRvS:"FMEA وثيقة حية: تُراجع بعد تغيير العملية (8.5.6)، وبعد عدم المطابقة (10.2)، وبعد ملاحظة التدقيق. سجّل التاريخ والفريق وما تغيّر والصفوف التي روجعت.",
 f_title:"عنوان الدراسة *",f_ref:"المرجع (مثل رقم العملية أو التغيير)",f_type:"نوع الدراسة",f_src:"المصدر",f_facil:"الميسر",f_owner:"مالك العملية",f_start:"تاريخ البدء",f_area:"الموقع أو الإدارة",f_scope:"النطاق: من أين تبدأ العملية وأين تنتهي، وما خارجها",
 f_dmaic:"مشروع DMAIC (اختياري)",f_a3:"صفحة A3 (اختياري)",f_rca:"تحقيق RCA (اختياري)",f_pareto:"تحليل باريتو (اختياري)",f_pcat:"فئة باريتو",f_capa:"سجل CAPA (اختياري)",f_pdca:"دورة PDCA (اختياري)",f_nc:"مصدر الدراسة حالة عدم مطابقة (يلزم ربط سجل CAPA)",
 f_sdate:"تاريخ اعتماد المقاييس",f_rated:"تاريخ أول تقييم",
 ty_process:"FMEA عملية",ty_design:"FMEA تصميم (وظيفة منتج أو خدمة)",
 src_dmaic:"مشروع DMAIC",src_a3:"صفحة A3",src_rca:"تحقيق RCA",src_pareto:"باريتو",src_capa:"سجل CAPA",src_change:"تغيير في العملية",src_audit:"ملاحظة تدقيق",src_new:"عملية جديدة",
 tmN:"الاسم أو الوظيفة",tmRole:"الدور في الدراسة",tmAdd:"إضافة عضو",tmDel:"حذف السطر",tmNone:"لم يُضف أعضاء بعد. FMEA نشاط فريق: ثلاثة أدوار على الأقل.",
 scLv:"الدرجة",scS:"الخطورة (الأثر)",scO:"الحدوث (السبب)",scD:"الكشف (الضوابط الحالية)",scFill:"املأ الخانات الفارغة بالمقاييس الافتراضية",scFilled:"مُلئت {n} خانة من المقاييس الافتراضية. راجعها مع الفريق قبل اعتمادها.",scNone:"لا خانات فارغة.",
 scRule:"القاعدة: تُعتمد المقاييس بتاريخ لا يتأخر عن تاريخ أول تقييم، ولكل درجة معنى مكتوب. المقاييس الافتراضية صياغة هذه الأداة، وليست منقولة من دليل منشور (IEC 60812 وAIAG-VDA غير متحقق منهما).",
 scLate:"اعتُمدت المقاييس بعد أول تقييم. المقاييس تُكتب قبل التقييم، وإلا فُصّلت الدرجات على النتيجة.",scMiss:"بعض درجات المقاييس بلا معنى مكتوب ({n}).",ratedMiss:"في الدراسة درجات مُقيّمة دون تاريخ أول تقييم.",
 stpT:"الخطوة",stpAdd:"إضافة خطوة",stpNone:"لم تُضف خطوات بعد.",stpRule:"3 إلى 15 خطوة",stpW:"البنية تحتاج 3 خطوات على الأقل و15 على الأكثر (الآن {n}).",
 stpDm:"خذ الخطوات من SIPOC مشروع DMAIC",stpDmOk:"أُخذت {n} خطوات من SIPOC المشروع {id} (قراءة فقط).",stpDmNo:"اكتب رقم مشروع DMAIC في بيانات الدراسة أولاً.",stpDmMiss:"المشروع غير موجود في أداة DMAIC على هذا المتصفح، أو لا خطوات في SIPOC الخاص به.",stpDmHave:"في الدراسة خطوات مكتوبة. احذفها أولاً إن أردت أخذ خطوات المشروع.",stpFrom:"الخطوات مأخوذة من SIPOC المشروع {id}.",
 rwAdd:"إضافة صف",rwDel:"حذف الصف",rwNone:"لم تُضف صفوف بعد. ابدأ بنمط فشل منفرد لكل وظيفة في الخطوة.",
 rwStep:"الخطوة",rwFn:"الوظيفة أو المتطلب",rwMode:"نمط الفشل",rwEff:"الأثر على العميل أو الخطوة التالية",rwS:"الخطورة S",rwCause:"السبب",rwHow:"مصدر السبب",rwRef:"رقم التحليل",rwPrev:"ضابط المنع الحالي",rwO:"الحدوث O",rwDet:"ضابط الكشف الحالي",rwD:"الكشف D",rwOev:"دليل الحدوث (بيانات، باريتو، سجلات)",
 how_here:"يُكتب هنا",how_fish:"من عظمة السمكة",how_why5:"من لماذا الخمس",how_rca:"من تحقيق RCA",
 rpnL:"رقم الأولوية",apL:"أولوية الإجراء",ap_H:"عالية",ap_M:"متوسطة",ap_L:"منخفضة",ap_:"—",
 humanF:"نمط الفشل مكتوب «خطأ بشري». اكتب ما الذي يفشل في الخطوة، واجعل الخطأ البشري سبباً يُزال بالتصميم (8.5.1 ز).",personF:"السبب يشير إلى شخص فقط. اسأل: لماذا كان الخطأ ممكناً؟ ما الذي في العملية سمح به؟",incF:"الصف ناقص: نمط الفشل والأثر والسبب والدرجات الثلاث.",
 apRule:"قاعدة أولوية الإجراء في هذه الأداة: «عالية» إذا كانت الخطورة 9 أو 10 مهما كان الحدوث والكشف، أو الخطورة × الحدوث 40 فأكثر، أو الخطورة × الحدوث 20 فأكثر مع كشف 7 فأكثر. «متوسطة» إذا كانت الخطورة × الحدوث 20 فأكثر، أو 10 فأكثر مع كشف 6 فأكثر، أو الخطورة 7 فأكثر مع كشف 7 فأكثر. وغير ذلك «منخفضة». رقم الأولوية يُعرض ولا يُرتَّب العمل به.",
 rwSum:"{n} صفاً · عالية {h} · متوسطة {m} · منخفضة {l}",humanW:"في الدراسة نمط فشل مكتوب «خطأ بشري» أو سبب يشير إلى شخص فقط. لا تكتمل مرحلة التحليل قبل إعادة صياغته.",coverW:"خطوات بلا صفوف تحليل: {s}.",
 pkT:"خذ سبباً من تحليل آخر (قراءة فقط): يُضاف صف جديد بهذا السبب، ويكتب الفريق نمط الفشل ويقيّم الدرجات.",pkHow:"التحليل",pk_fish:"عظمة السمكة",pk_why5:"لماذا الخمس",pk_rca:"تحقيق RCA",pkRef:"رقم التحليل",pkUse:"أضف السبب صفاً",
 pkAdded:"أُضيف {n} صف من {id}. اكتب نمط الفشل وقيّم الدرجات.",pkNone:"لا سبب مكتوباً في هذا التحليل بعد.",pkDup:"الأسباب موجودة في الدراسة بالفعل.",
 pkStart:"أو ابدأ تحليلاً جديداً في أداته:",stFish:"ابدأ عظمة سمكة",stWhy5:"ابدأ لماذا الخمس",stRca:"ابدأ تحقيق RCA",stDmaic:"ابدأ مشروع DMAIC",stA3:"ابدأ صفحة A3",pkHub:"داخل المنصة تُفتح الأداة الأخرى مكان هذه: احفظ الدراسة أولاً.",
 chT:"الرسوم",chHeatB:"الخطورة × الحدوث قبل الإجراءات",chHeatA:"الخطورة × الحدوث بعد الإجراءات",chBar:"رقم الأولوية قبل الإجراءات وبعدها (الصفوف الأعلى أولوية)",chS:"الخطورة S",chO:"الحدوث O",chBefore:"قبل",chAfter:"بعد",chEmpty:"لا صفوف مُقيّمة بعد",chAfterEmpty:"لم يُعَد تقييم أي صف بعد",chNote:"لون الخلية من الخطورة × الحدوث وحدهما؛ أولوية الصف نفسه تحسب الكشف أيضاً.",
 acAdd:"إضافة إجراء",acDel:"حذف الإجراء",acNone:"لم تُضف إجراءات بعد.",acRow:"الصف",acWhat:"الإجراء",acKind:"نوع الإجراء",acWho:"المسؤول",acBy:"الموعد",acSt:"الحالة",acDone:"تاريخ التنفيذ",acNs:"S بعد",acNo:"O بعد",acNd:"D بعد",acEv:"الدليل (ما الذي يثبت الدرجات الجديدة)",
 kd_change:"تغيير في التصميم أو العملية",kd_prevent:"ضابط منع (يخفض الحدوث)",kd_detect:"ضابط كشف (يحسن الكشف)",as_plan:"مخطط",as_doing:"قيد التنفيذ",as_done:"نُفّذ",
 sevF:"الخطورة خُفضت دون تغيير في التصميم أو العملية. الضوابط لا تخفض الخطورة؛ أعد الخطورة إلى قيمتها أو غيّر نوع الإجراء إن كان تغييراً فعلاً.",reF:"نُفّذ الإجراء ولم يُعَد التقييم بالدليل بعد.",ownF:"الإجراء بلا مسؤول أو موعد.",
 hiW:"صفوف عالية الأولوية بلا إجراء: {r}.",
 rvDate:"التاريخ",rvTeam:"الفريق",rvChg:"ما الذي تغيّر في العملية",rvRows:"الصفوف التي روجعت",rvAdd:"إضافة مراجعة",rvNone:"لا مراجعات بعد.",rvW:"آخر تغيير في الدراسة بتاريخ {d}، وآخر مراجعة قبله أو لا توجد.",
 stT:"ابدأ من أداة أخرى (قراءة فقط)",stS:"اختر مشروع DMAIC (خطوات SIPOC وأسبابه المثبتة)، أو تحقيق RCA (الفشل نمطاً وأسبابه الجذرية أسباباً)، أو فئة حيوية في باريتو (نمط فشل بدليل حدوثه). تُملأ دراسة جديدة غير محفوظة، ولا يُكتب شيء في الأداة الأخرى، ولا تُنسخ الدرجات: الفريق يقيّمها.",
 stSrc:"المصدر",ss_dmaic:"مشروع DMAIC",ss_rca:"تحقيق RCA",ss_pareto:"فئة حيوية في باريتو",stPrev:"اعرض",stUse:"ابدأ دراسة منه",stNone:"لا توجد بيانات في هذه الأداة على هذا المتصفح بعد.",stEmpty:"لا توجد سجلات مناسبة بعد.",
 stColId:"الرقم",stColT:"العنوان",stColSt:"مرحلته",stColSteps:"خطوات SIPOC",stColCz:"الأسباب المثبتة",stColRoot:"الأسباب الجذرية",stColCat:"الفئة",stColV:"القيمة والنسبة",stColPer:"الفترة",stColN:"دراسات منه",stColA:"إجراء",
 stUsedD:"مُلئت دراسة جديدة من المشروع {id}: {n} خطوات و{c} سبب مثبت. اكتب أنماط الفشل وقيّم الدرجات، ثم احفظ.",stUsedR:"مُلئت دراسة جديدة من التحقيق {id}: الفشل نمطاً وأسبابه الجذرية أسباباً. أضف الخطوات وقيّم الدرجات، ثم احفظ.",stUsedP:"مُلئت دراسة جديدة من الفئة «{c}» في التحليل {id}، ودليل الحدوث منها. أضف الخطوات وقيّم الدرجات، ثم احفظ.",
 pvDm:"{id} · {st} · {n} خطوات في SIPOC · الأسباب المثبتة: {t}",pvOev:"باريتو {id}: {c} {v} {u} ({s}% من الإجمالي) · {f} → {to}",
 hmT:"على هذا المتصفح {d} مشروع DMAIC و{r} تحقيق RCA و{p} فئة حيوية في باريتو يمكن أن تبدأ منها دراسة FMEA.",hmGo:"اعرضها",
 dmHint:"رقم مشروع DMAIC: تُؤخذ خطوات SIPOC منه، ويعرض المشروع الدراسات التي تذكره.",dmMiss:"هذا الرقم غير موجود في أداة DMAIC على هذا المتصفح.",dmOpen:"افتح المشروع",
 a3Hint:"رقم صفحة A3 إن بدأت الدراسة منها.",a3Miss:"هذا الرقم غير موجود في أداة A3 على هذا المتصفح.",a3Open:"افتح A3",
 rcHint:"رقم التحقيق إن كان الفشل قد وقع فعلاً.",rcMiss:"هذا الرقم غير موجود في أداة RCA على هذا المتصفح.",rcOpen:"افتح التحقيق",
 paHint:"رقم تحليل باريتو إن جاء نمط الفشل من فئة حيوية.",paMiss:"هذا الرقم غير موجود في أداة باريتو على هذا المتصفح.",paOpen:"افتح باريتو",pcat_:"— اختر الفئة —",
 caHint:"رقم سجل CAPA عندما توجد حالة عدم مطابقة.",caMiss:"هذا الرقم غير موجود في سجلات CAPA على هذا المتصفح.",caOpen:"افتح CAPA",
 pdHint:"رقم دورة PDCA التي تتابع الدراسة.",pdFound:"الدورة: {t}",pdMiss:"هذا الرقم غير موجود في دورات PDCA على هذا المتصفح.",pdOpen:"افتح PDCA",capaW:"مصدر الدراسة حالة عدم مطابقة: اربطها بسجل CAPA الذي يحمل الإجراء التصحيحي.",
 e_title:"اكتب عنوان الدراسة.",e_date:"تاريخ تنفيذ الإجراء لا يسبق تاريخ أول تقييم.",
 fl_ref:"المرجع أو الميسر أو مالك العملية ناقص",fl_team:"النطاق أو الفريق (3 أدوار) ناقص",fl_scales:"المقاييس غير مكتملة أو غير مؤرخة",fl_scLate:"المقاييس اعتُمدت بعد التقييم",fl_rated:"تاريخ أول تقييم ناقص",fl_steps:"البنية أقل من 3 خطوات",fl_inc:"{n} صف ناقص",fl_cover:"خطوات بلا صفوف ({n})",fl_human:"«خطأ بشري» نمطاً أو سبب يشير إلى شخص",fl_high:"{n} صف عالي الأولوية بلا إجراء",fl_own:"{n} إجراء بلا مسؤول أو موعد",fl_sev:"خطورة خُفضت دون تغيير",fl_rerate:"{n} إجراء نُفّذ بلا إعادة تقييم",fl_open:"{n} إجراء لم يُنفَّذ بعد",fl_review:"لا مراجعة بعد آخر تغيير",fl_capa:"مصدرها عدم مطابقة بلا ربط CAPA",
 oi_ref:"أكمل المرجع والميسر ومالك العملية.",oi_team:"أكمل النطاق وفريقاً بثلاثة أدوار على الأقل.",oi_scales:"اكتب معنى كل درجة في المقاييس واعتمدها بتاريخ.",oi_scLate:"المقاييس اعتُمدت بعد أول تقييم: راجع الدرجات بالمقاييس المعتمدة.",oi_rated:"سجّل تاريخ أول تقييم.",oi_steps:"أكمل بنية العملية (3 خطوات على الأقل).",oi_inc:"أكمل {n} صف تحليل (النمط والأثر والسبب والدرجات).",oi_cover:"{n} خطوة بلا صف تحليل.",oi_human:"أعد صياغة «الخطأ البشري» أو السبب الذي يشير إلى شخص.",oi_high:"خطط إجراءً لـ {n} صف عالي الأولوية.",oi_own:"حدد المسؤول والموعد لـ {n} إجراء.",oi_sev:"خطورة خُفضت دون تغيير في التصميم أو العملية.",oi_rerate:"أعد تقييم {n} إجراء منفذ بالدليل.",oi_open:"تابع تنفيذ {n} إجراء.",oi_review:"راجع الدراسة بعد آخر تغيير وسجّل المراجعة.",oi_capa:"اربط الدراسة بسجل CAPA.",
 exT:"بيانات المثال",exS:"ثلاث دراسات توضيحية لشركة الواحة للمقاولات (شركة سعودية افتراضية): استلام الخرسانة وصبها بعد مشروع DMAIC، ورفع حزم الحديد بالرافعة البرجية (الخطورة العالية أولاً مهما كان رقم الأولوية)، وعملية المعايرة بعد التسليم. ليست بيانات حقيقية.",exLoad:"تحميل المثال",exClear:"مسح كل البيانات",exLoaded:"تم تحميل المثال.",exCleared:"تم مسح كل البيانات.",exConfirmClear:"سيُحذف كل ما حُفظ في أداة FMEA على هذا المتصفح (الدراسات والتقييم الذاتي). هل تريد المتابعة؟",
 dT:"السجلات",dS:"كل الدراسات المحفوظة على هذا المتصفح. افتح دراسة لتعديلها، أو احذفها بضغطتين.",csv:"تصدير CSV",none:"لا توجد دراسات بعد.",open:"فتح",del:"حذف",delArm:"اضغط مرة أخرى للحذف",
 colRef:"الدراسة",colFac:"الميسر · المالك",colStage:"المرحلة",colRows:"الصفوف",colHigh:"عالية الأولوية",colActs:"الإجراءات",colFlags:"تنبيهات",colAct:"إجراءات",rowsN:"{n} صف · {s} خطوة",highN:"{h} · بإجراء {a}",actsN:"{d}/{n} نُفّذ",
 auT:"التدقيق الآلي",auS:"اثنا عشر فحصاً لكل دراسة. «—» تعني أن الفحص لا ينطبق بعد على مرحلة الدراسة.",auEmpty:"لا توجد دراسات لتدقيقها.",auRec:"دراسات",auPass:"نسبة الفحوص الناجحة",auFail:"دراسات فيها فحص راسب",auOpen:"بنود مفتوحة",
 c_ref:"المرجع والميسر والمالك",c_team:"النطاق والفريق",c_scales:"المقاييس قبل التقييم",c_struct:"البنية",c_rows:"اكتمال الصفوف",c_cover:"كل خطوة محللة",c_human:"لا «خطأ بشري»",c_high:"إجراء لكل صف عالٍ",c_sev:"قاعدة الخطورة",c_rerate:"إعادة التقييم",c_review:"المراجعة",c_capa:"ربط CAPA",
 dashT:"لوحة المؤشرات",dashS:"تُحسب من الدراسات والتقييم الذاتي المحفوظة على هذا المتصفح.",kTotal:"الدراسات",kHigh:"عولجت صفوفها العالية",kRe:"أعيد تقييمها بعد الإجراءات",kRows:"صفوف التحليل",kHrows:"صفوف عالية الأولوية",kHopen:"صفوف عالية بلا إجراء",kHuman:"تنبيهات «خطأ بشري»",kOpen:"بنود مفتوحة",kAud:"نجاح التدقيق",kAs:"التقييم الذاتي",
 byStage:"الدراسات حسب المرحلة",byAp:"الصفوف حسب أولوية الإجراء",bySrc:"الدراسات حسب المصدر",byAssess:"التقييم الذاتي حسب المحور",dHeatT:"الخطورة × الحدوث لكل الصفوف (قبل الإجراءات)",openT:"بنود تحتاج متابعة",noData:"لا توجد بيانات بعد.",noOpen:"لا بنود مفتوحة.",
 rpT:"التقرير",rpS:"تقرير HTML جاهز للطباعة أو الحفظ PDF، وملف CSV للدراسات.",rpHtml:"تنزيل تقرير HTML",rpNote:"التقرير يضم الغلاف والملخص وكل دراسة بمقاييسها وبنيتها وجدول التحليل وخريطة الحرارة والإجراءات والمراجعة والتدقيق والبنود المفتوحة والتقييم الذاتي.",rpPrev:"معاينة سريعة",rpEmpty:"لا توجد بيانات للتقرير بعد.",
 rpCover:"دراسات تحليل أنماط الفشل وآثارها",rpStudies:"الدراسات",rpScales:"المقاييس المعتمدة",rpSteps:"بنية العملية",rpRows:"جدول التحليل",rpActs:"الإجراءات وإعادة التقييم",rpRev:"المراجعات",rpAu:"نتيجة التدقيق",
 aiT:"المساعد الذكي — قيد الإنشاء",aiS:"سيقرأ المساعد الدراسة المفتوحة ويقترح أسئلة للفريق، ولن يقيّم الدرجات بدلاً منه.",aiList:["يقترح أنماط فشل منفردة لكل وظيفة في الخطوة","ينبّه إلى الصفوف عالية الخطورة التي لم تُعالج","يقترح أسئلة لإعادة صياغة «الخطأ البشري» سبباً يُزال بالتصميم"],
 yes:"نعم",no:"لا",langNote:""},
en:{brand:"Continual Improvement Academy · مدثر سلامه",toolName:"FMEA tool — failure mode and effects analysis",sgLearn:"Learn",sgWork:"Work",sgOut:"Outputs",
 nHome:"Home",nStd:"Method guide",nCl:"Clause guide",nAssess:"Self-assessment",nTools:"FMEA study",nDocs:"Records",nAudit:"Audit",nDash:"Dashboard",nReport:"Report",nAi:"AI Assistant",soon:"Soon",
 homeCode:"Failure mode · effect · cause · controls · priority",homeH1:"Failure mode and effects analysis (FMEA)",
 homeLede:"A structured, team-based look ahead: how each process step (or design function) can fail, what the effect would be on the customer or the next step, what could cause it, and which controls prevent or detect it — before the failure happens, or right after a new one is found. Scales written before the rating, high severity first whatever the priority number, actions with an owner and a date, then a new rating with evidence.",
 homeNote:"This version keeps studies in your browser only. Server storage and sign-in come with the shared platform stage.",
 prep:"Prepared by",authorName:"مدثر سلامه",cycleT:"What you can do here",cycleS:"Read the method guide, assess your FMEA practice, then open a first study from a DMAIC project, an RCA investigation, a Pareto vital-few category or from scratch.",
 tStd:"Scope and structure first, written scales, failure mode – effect – cause, prevention and detection controls, severity first and the limits of the priority number, action priority, actions and re-rating, and FMEA as a living document.",tCl:"ISO 10009:2024 subclause 7.3 (with 6.3, 7.1 and Table C.1) and the ISO 9001:2026 clauses the method serves: risks 6.1, controlled conditions 8.5.1 g) preventing human error, control of changes 8.5.6 and corrective action 10.2: an interpretive summary, an example and what the auditor asks for.",tAssess:"Twelve questions on your FMEA practice, from the team and the scales to the review after a change.",
 tTools:"One study per process or function: scope and team, written scales, the process steps, analysis rows with the priority number and action priority computed, actions and re-rating, and the review, with a severity × occurrence heat map.",tDocs:"Every study with its stage, high-priority rows and flags, and the example data.",tAudit:"An automatic check of each study: reference, facilitator and process owner, the team, scales before the rating, the structure, complete rows, no \"human error\", an action for every high-priority row, the severity rule, re-rating, the review and the CAPA link.",
 tDash:"Studies whose high-priority rows are acted on, studies re-rated after their actions, stages, rows by action priority, sources, a heat map of all rows, open items and the self-assessment.",tReport:"An HTML report with each study's scales, structure, analysis table, heat map, actions and re-rating, review and audit, and a CSV file.",tAi:"An assistant that reads the study and suggests failure modes and questions for the team. Not active yet.",
 foot:"Sources: ISO 10009:2024 subclauses 7.3, 6.3, 7.1, 7.2 and 7.5, Annex A (Table A.3) and Table C.1; ISO 9001:2026 introduction 0.3.2, clauses 6.1, 8.1, 8.3.4, 8.5.1, 8.5.6, 9.1.3, 10.1 and 10.2 and Annex A.6.1; ISO 9000:2026 principles (interpretive summaries, not the official text). FMEA is a method, not a requirement of any standard. Examples are illustrative, not real data.",
 heroTag:"Method tool · a structured team look at failure modes before they happen",langSw:"العربية",langSwA:"التبديل إلى العربية",logoAlt:"Continual Improvement Academy — مدثر سلامه",
 related:"Related tools in the academy",rel_dmaic:"DMAIC improvement project",rel_a3:"A3 problem solving",rel_rca:"Root cause analysis — investigation",rel_pareto:"Pareto — vital few analysis",rel_fish:"Fishbone — cause and effect",rel_why5:"5 Whys — root cause analysis",rel_capa:"Corrective action",rel_pdca:"PDCA cycle",rel_iso10009:"ISO 10009 quality tools guide",
 termT:"Is FMEA a requirement of ISO 9001:2026?",
 termP1:"No. FMEA is a method, not a requirement of any standard. ISO 10009:2024 (guidance for quality tools) reviews it in subclause 7.3 as a risk-based method to identify, analyse and rank potential problems, and names it as an input to the control plan (6.3). ISO 9001:2026 asks the organization to determine, analyse and evaluate risks and to plan actions to address them (6.1.2) without imposing a method; Annex A.6.1.2 explains that risk-based thinking does not imply formal risk management.",
 termP2:"In practice: the severity, occurrence and detection scales are written before the rating and kept the same across the study. Severity is rated on the effect and is not lowered by a control, only by a design or process change. The risk priority number (severity × occurrence × detection) hides big severities, so it is not a ranking to act on by itself: high severity is treated first whatever the number. Ratings come from data and the team, not from one person. \"Human error\" is a cause to design out (8.5.1 g)), not a failure mode to blame. The study is a living document, reviewed when the process changes, after a nonconformity and after an audit finding.",
 termP3:"FMEA uses the toolbox rather than replacing it: the structured what-if technique first when the process is large (ISO 10009 subclause 7.1), Pareto and RCA for the failures already seen, Fishbone and 5 Whys for the causes, DMAIC and A3 for the actions that need a project, CAPA when a nonconformity is involved, and PDCA for the follow-up.",
 termIs:"Interpretive summary in independent wording, not the official text. Sources: ISO 10009:2024 subclauses 7.3, 6.3, 7.1 and Table C.1; ISO 9001:2026 clauses 6.1.2, 8.5.1 g), 8.5.6, 10.2.1 and Annex A.6.1.2. Any reference to IEC 60812, the AIAG-VDA FMEA handbook, ISO 31000 or ISO 31010 is not uploaded: \"not verified\". Checked: 2026-10-16.",
 defs:[["Failure mode","FMEA · ISO 10009 7.3","The way a step or function could fail to do what is expected of it. A single mode, not a compound one.","#B42318"],["Effect and severity","S · 1–10","What the customer or the next step sees if the failure happens. Severity is rated on the effect and is not lowered by controls.","#C2410C"],["Cause and occurrence","O · 1–10","What could lead to the failure mode, and how often it happens with the current prevention controls.","#3563C9"],["Detection","D · 1–10","How well the current detection controls find the cause or the mode before it reaches the customer.","#1E8C93"],["Action priority","H · M · L","A written rule: severity 9 or 10 is always high, then severity × occurrence, then detection. The priority number is shown only.","#1B2A4A"]],
 asT:"Self-assessment of FMEA practice",asS:"Answer each question with what actually happens in your FMEA studies. The score measures current practice; it is not a certificate or a judgement of performance.",asReset:"Clear answers",asSaved:"Answer saved",asAnswered:"{n} of 12 answered",
 band0:"Needs work",band1:"Developing",band2:"Established",bandNote:"Internal self-assessment bands designed for this tool, not an official benchmark.",as0:"Not in place",as1:"Partly",as2:"In place and applied",
 g_PP:"Preparation: team, scales and structure",g_AN:"Analysis: effect, cause and controls",g_AC:"Priority, action and re-rating",g_LV:"The living document and learning",
 tlT:"FMEA study",tlS:"One study per process (or design function). The scales are written before the first rating, then the structure, then the analysis rows. The priority number and action priority are computed, the stage is set from what you fill in, and the heat map is drawn as you type.",
 save:"Save study",newRec:"New study",savedFail:"Could not save in this browser. Download the report before closing the page.",cur:"Current stage:",ok_rec:"Study saved",
 st_draft:"Draft",st_scoped:"Scoped",st_scales:"Scales agreed",st_struct:"Structure mapped",st_analysed:"Analysed",st_planned:"Actions planned",st_done:"Done and re-rated",st_reviewed:"Reviewed",
 mp_scoped:"Scope and team",mp_scales:"Written scales",mp_struct:"Process steps",mp_analysed:"Analysis rows",mp_planned:"Actions with owner and date",mp_done:"Done and re-rated",mp_reviewed:"Dated review",
 mapT:"Study stages",mpDone:"Complete",mpCur:"In progress",mpTodo:"Not started",
 sHdrT:"Study details",sHdrS:"Reference, type, scope, facilitator, process owner, the team with its roles, the source, and the links to the toolbox tools.",
 sScT:"1 · Written scales",sScS:"Each level from 1 to 10 has a written meaning for severity, occurrence and detection. They are agreed on a date before the first rating and kept the same across the study.",
 sStT:"2 · Process structure",sStS:"The process steps (3 to 15) in order, from a DMAIC SIPOC or the process map. The structure comes before the failure modes.",
 sAnT:"3 · Analysis rows",sAnS:"For each step: the function or requirement, the failure mode, its effect on the customer or the next step, the severity, the cause, the prevention control and occurrence, the detection control and detection.",
 sAcT:"4 · Actions and re-rating",sAcS:"At least one action for every high-priority row, with an owner and a date. After the action the ratings are given again with evidence. Severity falls only with a design or process change.",
 sRvT:"5 · Study review",sRvS:"FMEA is a living document: it is reviewed after a process change (8.5.6), after a nonconformity (10.2) and after an audit finding. Record the date, the team, what changed and the rows revisited.",
 f_title:"Study title *",f_ref:"Reference (such as the process or change number)",f_type:"Study type",f_src:"Source",f_facil:"Facilitator",f_owner:"Process owner",f_start:"Start date",f_area:"Site or department",f_scope:"Scope: where the process starts and stops, and what is outside it",
 f_dmaic:"DMAIC project (optional)",f_a3:"A3 (optional)",f_rca:"RCA investigation (optional)",f_pareto:"Pareto analysis (optional)",f_pcat:"Pareto category",f_capa:"CAPA record (optional)",f_pdca:"PDCA cycle (optional)",f_nc:"A nonconformity is the source of this study (a CAPA record must be linked)",
 f_sdate:"Date the scales were agreed",f_rated:"Date of the first rating",
 ty_process:"Process FMEA",ty_design:"Design FMEA (product or service function)",
 src_dmaic:"DMAIC project",src_a3:"A3",src_rca:"RCA investigation",src_pareto:"Pareto",src_capa:"CAPA record",src_change:"Process change",src_audit:"Audit finding",src_new:"New process",
 tmN:"Name or role",tmRole:"Role in the study",tmAdd:"Add member",tmDel:"Delete row",tmNone:"No members yet. FMEA is a team activity: at least three roles.",
 scLv:"Level",scS:"Severity (effect)",scO:"Occurrence (cause)",scD:"Detection (current controls)",scFill:"Fill the empty cells with the default scales",scFilled:"{n} cells filled from the default scales. Review them with the team before agreeing them.",scNone:"No empty cells.",
 scRule:"Rule: the scales are agreed on a date no later than the first rating, and every level has a written meaning. The default scales are this tool's wording, not copied from a published handbook (IEC 60812 and AIAG-VDA not verified).",
 scLate:"The scales were agreed after the first rating. Scales are written before the rating; otherwise the levels are fitted to the result.",scMiss:"Some scale levels have no written meaning ({n}).",ratedMiss:"The study has ratings but no date of the first rating.",
 stpT:"Step",stpAdd:"Add step",stpNone:"No steps yet.",stpRule:"3 to 15 steps",stpW:"The structure needs at least 3 steps and at most 15 (now {n}).",
 stpDm:"Take the steps from the DMAIC SIPOC",stpDmOk:"{n} steps taken from the SIPOC of project {id} (read-only).",stpDmNo:"Enter the DMAIC project id in the study details first.",stpDmMiss:"The project is not in the DMAIC tool in this browser, or its SIPOC has no steps.",stpDmHave:"The study already has steps. Delete them first if you want the project's steps.",stpFrom:"Steps taken from the SIPOC of project {id}.",
 rwAdd:"Add row",rwDel:"Delete row",rwNone:"No rows yet. Start with one single failure mode for each function of the step.",
 rwStep:"Step",rwFn:"Function or requirement",rwMode:"Failure mode",rwEff:"Effect on the customer or the next step",rwS:"Severity S",rwCause:"Cause",rwHow:"Source of the cause",rwRef:"Analysis id",rwPrev:"Current prevention control",rwO:"Occurrence O",rwDet:"Current detection control",rwD:"Detection D",rwOev:"Occurrence evidence (data, Pareto, records)",
 how_here:"Written here",how_fish:"From a Fishbone",how_why5:"From a 5 Whys",how_rca:"From an RCA investigation",
 rpnL:"Priority number",apL:"Action priority",ap_H:"High",ap_M:"Medium",ap_L:"Low",ap_:"—",
 humanF:"The failure mode is written as \"human error\". Write what fails in the step, and make the human error a cause to design out (8.5.1 g)).",personF:"The cause names a person only. Ask: why was the error possible? What in the process allowed it?",incF:"Incomplete row: failure mode, effect, cause and the three ratings.",
 apRule:"Action priority rule of this tool: \"high\" when severity is 9 or 10 whatever occurrence and detection, or severity × occurrence is 40 or more, or severity × occurrence is 20 or more with detection 7 or more. \"Medium\" when severity × occurrence is 20 or more, or 10 or more with detection 6 or more, or severity 7 or more with detection 7 or more. Otherwise \"low\". The priority number is shown, not used to rank the work.",
 rwSum:"{n} rows · high {h} · medium {m} · low {l}",humanW:"The study has a failure mode written as \"human error\" or a cause that names a person only. The analysis stage is not complete until it is rewritten.",coverW:"Steps with no analysis row: {s}.",
 pkT:"Take a cause from another analysis (read-only): a new row is added with that cause, and the team writes the failure mode and rates it.",pkHow:"Analysis",pk_fish:"Fishbone",pk_why5:"5 Whys",pk_rca:"RCA investigation",pkRef:"Analysis id",pkUse:"Add the cause as a row",
 pkAdded:"{n} row(s) added from {id}. Write the failure mode and rate it.",pkNone:"No cause written in this analysis yet.",pkDup:"These causes are already in the study.",
 pkStart:"Or start a new analysis in its tool:",stFish:"Start a Fishbone",stWhy5:"Start a 5 Whys",stRca:"Start an RCA",stDmaic:"Start a DMAIC project",stA3:"Start an A3",pkHub:"Inside the platform the other tool replaces this one: save the study first.",
 chT:"Charts",chHeatB:"Severity × occurrence before the actions",chHeatA:"Severity × occurrence after the actions",chBar:"Priority number before and after the actions (highest-priority rows)",chS:"Severity S",chO:"Occurrence O",chBefore:"Before",chAfter:"After",chEmpty:"No rated rows yet",chAfterEmpty:"No row re-rated yet",chNote:"Cell colour comes from severity × occurrence only; the row's own priority also counts detection.",
 acAdd:"Add action",acDel:"Delete action",acNone:"No actions yet.",acRow:"Row",acWhat:"Action",acKind:"Type of action",acWho:"Owner",acBy:"Due",acSt:"Status",acDone:"Date done",acNs:"S after",acNo:"O after",acNd:"D after",acEv:"Evidence (what proves the new ratings)",
 kd_change:"Design or process change",kd_prevent:"Prevention control (lowers occurrence)",kd_detect:"Detection control (improves detection)",as_plan:"Planned",as_doing:"In progress",as_done:"Done",
 sevF:"Severity lowered without a design or process change. Controls do not lower severity; put the severity back, or change the type of action if it really is a change.",reF:"The action is done but not yet re-rated with evidence.",ownF:"The action has no owner or due date.",
 hiW:"High-priority rows with no action: {r}.",
 rvDate:"Date",rvTeam:"Team",rvChg:"What changed in the process",rvRows:"Rows revisited",rvAdd:"Add review",rvNone:"No reviews yet.",rvW:"The last change in the study is dated {d}, and the last review is earlier or missing.",
 stT:"Start from another tool (read-only)",stS:"Pick a DMAIC project (its SIPOC steps and proved causes), an RCA investigation (the failure as a mode, its root causes as causes) or a Pareto vital-few category (a failure mode with its occurrence evidence). A new, unsaved study is filled; nothing is written to the other tool, and the ratings are not copied: the team rates them.",
 stSrc:"Source",ss_dmaic:"DMAIC project",ss_rca:"RCA investigation",ss_pareto:"Pareto vital-few category",stPrev:"Show",stUse:"Start a study from it",stNone:"No data in that tool in this browser yet.",stEmpty:"No suitable records yet.",
 stColId:"Id",stColT:"Title",stColSt:"Its stage",stColSteps:"SIPOC steps",stColCz:"Proved causes",stColRoot:"Root causes",stColCat:"Category",stColV:"Value and share",stColPer:"Period",stColN:"Studies from it",stColA:"Action",
 stUsedD:"A new study was filled from project {id}: {n} steps and {c} proved cause(s). Write the failure modes and rate them, then save.",stUsedR:"A new study was filled from investigation {id}: the failure as a mode and its root causes as causes. Add the steps and rate them, then save.",stUsedP:"A new study was filled from the category \"{c}\" in analysis {id}, with its occurrence evidence. Add the steps and rate them, then save.",
 pvDm:"{id} · {st} · {n} SIPOC steps · proved causes: {t}",pvOev:"Pareto {id}: {c} {v} {u} ({s}% of the total) · {f} → {to}",
 hmT:"In this browser {d} DMAIC project(s), {r} RCA investigation(s) and {p} Pareto vital-few category(ies) can start an FMEA study.",hmGo:"Show them",
 dmHint:"DMAIC project id: its SIPOC steps can be taken, and the project lists the studies that name it.",dmMiss:"This id is not in the DMAIC tool in this browser.",dmOpen:"Open the project",
 a3Hint:"The A3 id if the study started from it.",a3Miss:"This id is not in the A3 tool in this browser.",a3Open:"Open the A3",
 rcHint:"The investigation id if the failure has already happened.",rcMiss:"This id is not in the RCA tool in this browser.",rcOpen:"Open the investigation",
 paHint:"The Pareto analysis id if the failure mode came from a vital-few category.",paMiss:"This id is not in the Pareto tool in this browser.",paOpen:"Open Pareto",pcat_:"— pick the category —",
 caHint:"The CAPA record id when a nonconformity is involved.",caMiss:"This id is not in the CAPA records in this browser.",caOpen:"Open CAPA",
 pdHint:"The PDCA cycle that follows the study.",pdFound:"Cycle: {t}",pdMiss:"This id is not in the PDCA cycles in this browser.",pdOpen:"Open PDCA",capaW:"A nonconformity is the source of this study: link it to the CAPA record that carries the corrective action.",
 e_title:"Enter the study title.",e_date:"An action's date done cannot be before the date of the first rating.",
 fl_ref:"Reference, facilitator or process owner missing",fl_team:"Scope or team (3 roles) missing",fl_scales:"Scales incomplete or undated",fl_scLate:"Scales agreed after the rating",fl_rated:"Date of the first rating missing",fl_steps:"Structure under 3 steps",fl_inc:"{n} incomplete row(s)",fl_cover:"Steps with no rows ({n})",fl_human:"\"Human error\" as a mode, or a cause naming a person",fl_high:"{n} high-priority row(s) with no action",fl_own:"{n} action(s) with no owner or date",fl_sev:"Severity lowered without a change",fl_rerate:"{n} action(s) done, not re-rated",fl_open:"{n} action(s) not done yet",fl_review:"No review after the last change",fl_capa:"Nonconformity source with no CAPA link",
 oi_ref:"Complete the reference, the facilitator and the process owner.",oi_team:"Complete the scope and a team of at least three roles.",oi_scales:"Write the meaning of every scale level and agree the scales on a date.",oi_scLate:"The scales were agreed after the first rating: review the ratings against the agreed scales.",oi_rated:"Record the date of the first rating.",oi_steps:"Complete the process structure (at least 3 steps).",oi_inc:"Complete {n} analysis row(s) (mode, effect, cause and ratings).",oi_cover:"{n} step(s) with no analysis row.",oi_human:"Rewrite the \"human error\" or the cause that names a person.",oi_high:"Plan an action for {n} high-priority row(s).",oi_own:"Name the owner and due date of {n} action(s).",oi_sev:"Severity lowered without a design or process change.",oi_rerate:"Re-rate {n} completed action(s) with evidence.",oi_open:"Follow up {n} action(s).",oi_review:"Review the study after the last change and record the review.",oi_capa:"Link the study to a CAPA record.",
 exT:"Example data",exS:"Three illustrative studies for Al-Waha Contracting (a fictitious Saudi company): concrete receiving and pouring after the DMAIC project, tower-crane lifting of rebar bundles (high severity first whatever the priority number), and the calibration process after the hand-over. Not real data.",exLoad:"Load example",exClear:"Clear all data",exLoaded:"Example loaded.",exCleared:"All data cleared.",exConfirmClear:"Everything saved in the FMEA tool in this browser (studies and self-assessment) will be deleted. Continue?",
 dT:"Records",dS:"Every study saved in this browser. Open a study to edit it, or delete it with two clicks.",csv:"Export CSV",none:"No studies yet.",open:"Open",del:"Delete",delArm:"Click again to delete",
 colRef:"Study",colFac:"Facilitator · owner",colStage:"Stage",colRows:"Rows",colHigh:"High priority",colActs:"Actions",colFlags:"Flags",colAct:"Actions",rowsN:"{n} rows · {s} steps",highN:"{h} · with action {a}",actsN:"{d}/{n} done",
 auT:"Automatic audit",auS:"Twelve checks on each study. \"—\" means the check does not apply yet at the study's stage.",auEmpty:"No studies to audit.",auRec:"Studies",auPass:"Checks passed",auFail:"Studies with a failed check",auOpen:"Open items",
 c_ref:"Reference, facilitator, owner",c_team:"Scope and team",c_scales:"Scales before rating",c_struct:"Structure",c_rows:"Complete rows",c_cover:"Every step analysed",c_human:"No \"human error\"",c_high:"Action for every high row",c_sev:"Severity rule",c_rerate:"Re-rating",c_review:"Review",c_capa:"CAPA link",
 dashT:"Dashboard",dashS:"Computed from the studies and the self-assessment saved in this browser.",kTotal:"Studies",kHigh:"High rows all acted on",kRe:"Re-rated after their actions",kRows:"Analysis rows",kHrows:"High-priority rows",kHopen:"High rows with no action",kHuman:"\"Human error\" flags",kOpen:"Open items",kAud:"Audit pass",kAs:"Self-assessment",
 byStage:"Studies by stage",byAp:"Rows by action priority",bySrc:"Studies by source",byAssess:"Self-assessment by area",dHeatT:"Severity × occurrence of all rows (before the actions)",openT:"Items to follow up",noData:"No data yet.",noOpen:"No open items.",
 rpT:"Report",rpS:"An HTML report ready to print or save as PDF, and a CSV file of the studies.",rpHtml:"Download HTML report",rpNote:"The report has the cover, the summary, and each study with its scales, structure, analysis table, heat map, actions, review and audit, then the open items and the self-assessment.",rpPrev:"Quick preview",rpEmpty:"No data for the report yet.",
 rpCover:"Failure mode and effects analysis studies",rpStudies:"The studies",rpScales:"Agreed scales",rpSteps:"Process structure",rpRows:"Analysis table",rpActs:"Actions and re-rating",rpRev:"Reviews",rpAu:"Audit result",
 aiT:"AI Assistant — under construction",aiS:"The assistant will read the open study and suggest questions for the team; it will not rate on the team's behalf.",aiList:["Suggests single failure modes for each function of a step","Flags high-severity rows that are not acted on","Suggests questions to rewrite a \"human error\" as a cause to design out"],
 yes:"Yes",no:"No",langNote:""}
};
/* the other tools' stage names and preview wording, the same as in the DMAIC tool (copied at build time from tests/build/dmaic_host.js) */
/*__DM_UI__*/
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
/* a rating is a whole number from 1 to 10; anything else is "not rated" */
function rate(v){ var n=num(v); return (n!==null&&n>=1&&n<=10&&Math.round(n)===n)?n:null; }

/* ---------- records ---------- */
function blankTm(){ return {n:"",role:""}; }
function blankStp(id){ return {id:id||"",t:""}; }
function blankRw(id){ return {id:id||"",step:"",fn:"",mode:"",eff:"",s:null,cause:"",how:"here",ref:"",prev:"",o:null,det:"",d:null,oev:""}; }
function blankAc(id){ return {id:id||"",row:"",what:"",kind:"prevent",who:"",by:"",st:"plan",done:"",ns:null,no:null,nd:null,ev:""}; }
function blankRv(){ return {date:"",team:"",chg:"",rows:""}; }
function blankSc(){ var e=function(){ return ["","","","","","","","","",""]; }; return {date:"",S:e(),O:e(),D:e()}; }
function blank(){ return {id:"",title:"",ref:"",type:"process",src:"new",nc:false,scope:"",facil:"",owner:"",area:"",start:"",dmaic:"",a3:"",rca:"",pareto:"",pcat:"",capa:"",pdca:"",
 team:[],sc:blankSc(),rated:"",steps:[],stepsFrom:"",rows:[],acts:[],reviews:[],created:"",updated:""}; }
function fixTm(m){ return {n:str(m.n),role:str(m.role)}; }
function fixStp(x){ return {id:str(x.id),t:str(x.t)}; }
function fixRw(x){ return {id:str(x.id),step:str(x.step),fn:str(x.fn),mode:str(x.mode),eff:str(x.eff),s:rate(x.s),cause:str(x.cause),how:pick(x.how,HOWS)||"here",ref:str(x.ref),prev:str(x.prev),o:rate(x.o),det:str(x.det),d:rate(x.d),oev:str(x.oev)}; }
function fixAc(x){ return {id:str(x.id),row:str(x.row),what:str(x.what),kind:pick(x.kind,KINDS)||"prevent",who:str(x.who),by:str(x.by),st:pick(x.st,ASTS)||"plan",done:str(x.done),ns:rate(x.ns),no:rate(x.no),nd:rate(x.nd),ev:str(x.ev)}; }
function fixRv(x){ return {date:str(x.date),team:str(x.team),chg:str(x.chg),rows:str(x.rows)}; }
function fixSc(x){ x=obj(x); var f=function(a){ var o=(Array.isArray(a)?a:[]).slice(0,10).map(str); while(o.length<10) o.push(""); return o; }; return {date:str(x.date),S:f(x.S),O:f(x.O),D:f(x.D)}; }
function ids(list,pre){ var used={}, n=0, re=new RegExp("^"+pre+"(\\d+)$");
 list.forEach(function(c){ var m=re.exec(c.id); if(m&&!used[c.id]){ used[c.id]=1; n=Math.max(n,+m[1]); } else c.id=""; });
 list.forEach(function(c){ if(!c.id){ n++; c.id=pre+n; used[c.id]=1; } }); }
/* a study saved with missing or broken parts gets empty ones, so rendering never throws; every step, row and action gets an id */
function fixRec(r){
 ["id","title","ref","type","src","scope","facil","owner","area","start","dmaic","a3","rca","pareto","pcat","capa","pdca","rated","stepsFrom","created","updated"].forEach(function(k){ r[k]=str(r[k]); });
 if(TYPES.indexOf(r.type)<0) r.type="process"; if(SRCS.indexOf(r.src)<0) r.src="new"; r.nc=r.nc===true;
 r.team=arr(r.team).map(fixTm); r.sc=fixSc(r.sc);
 r.steps=arr(r.steps).map(fixStp).slice(0,MAXSTEPS); ids(r.steps,"p");
 r.rows=arr(r.rows).map(fixRw).slice(0,MAXROWS); ids(r.rows,"r");
 r.acts=arr(r.acts).map(fixAc).slice(0,MAXROWS); ids(r.acts,"a");
 r.reviews=arr(r.reviews).map(fixRv).slice(0,MAXREV);
 return r;
}
function load(){ return TBX.load(STORE,function(v){ if(!Array.isArray(v.records)) v.records=[]; v.records=v.records.filter(function(r){ return r&&typeof r==="object"; }); v.records.forEach(fixRec); if(!v.assess||typeof v.assess!=="object") v.assess={}; return v; },function(){ return {records:[],assess:{}}; }); }
function persist(){ return TBX.save(STORE,DB); }

/* ---------- default scales: this tool's own wording, for the team to edit before agreeing them ---------- */
var DEFSC={
 ar:{S:["لا أثر ملحوظ","أثر طفيف جداً يلاحظه قليلون ولا يؤثر في الاستخدام","أثر بسيط: إزعاج للخطوة التالية يُعالج في مكانه","أثر منخفض: إعادة عمل لجزء من المخرج أقل من ساعة","أثر متوسط: إعادة عمل لجزء من المخرج خارج الخط وتأخير بسيط","أثر كبير: جزء من المخرج غير صالح، وإعادة عمل أو إصلاح بتأخير على العميل","أثر عالٍ: المخرج غير صالح أو مرفوض، وتعطل كبير أو شكوى عميل","أثر عالٍ جداً: فقدان الوظيفة الأساسية، وعدم مطابقة يصل إلى العميل","خطر على السلامة أو مخالفة نظامية مع إنذار مسبق","خطر على السلامة أو مخالفة نظامية دون إنذار"],
  O:["شبه مستحيل: مُنع بالتصميم (منع الخطأ)","نادر جداً: لا حدوث مسجل في عمليات مماثلة","منخفض جداً: حالات معزولة (أقل من 1 في 10,000)","منخفض: نحو 1 في 2,000","متوسط عرضي: نحو 1 في 500","متوسط: نحو 1 في 100","عالٍ: نحو 1 في 50","عالٍ متكرر: نحو 1 في 20","عالٍ جداً: نحو 1 في 10","شبه مؤكد: 1 في 3 أو أكثر، أو في كل دفعة"],
  D:["شبه مؤكد: منع الخطأ يمنع الخلل أو يكشفه آلياً 100%","عالٍ جداً: قياس آلي في الخطوة نفسها","عالٍ: فحص بالقياس لكل وحدة في الخطوة","عالٍ نسبياً: فحص بالقياس على عينة بعد الخطوة بقاعدة إيقاف","متوسط: فحص بالقياس على عينة مع تسجيل","منخفض: فحص بصري أو متغير على عينة","منخفض جداً: فحص بصري فقط دون تسجيل","بعيد: فحوص غير مباشرة أو عشوائية","بعيد جداً: يوجد فحص لكنه لا يكتشفه غالباً","شبه مستحيل: لا ضابط، أو لا يمكن الكشف"]},
 en:{S:["No noticeable effect","Very slight effect, noticed by few, no effect on use","Minor: a nuisance for the next step, handled on the spot","Low: rework of part of the output, under an hour","Moderate: rework of part of the output off-line, small delay","Significant: part of the output unusable; rework or repair with a delay to the customer","High: output unusable or rejected; major disruption or customer complaint","Very high: loss of the primary function; a nonconformity reaches the customer","Hazard to safety or regulatory breach, with warning","Hazard to safety or regulatory breach, without warning"],
  O:["Almost impossible: prevented by design (error-proofing)","Remote: no occurrence on record in similar processes","Very low: isolated cases (under 1 in 10,000)","Low: about 1 in 2,000","Moderate, occasional: about 1 in 500","Moderate: about 1 in 100","High: about 1 in 50","High, frequent: about 1 in 20","Very high: about 1 in 10","Almost certain: 1 in 3 or more, or every batch"],
  D:["Almost certain: error-proofing prevents or detects it automatically, 100%","Very high: automatic gauging at the step","High: measured check of every unit at the step","Moderately high: measured check on a sample after the step, with a stop rule","Moderate: measured check on a sample, recorded","Low: visual or variable check on a sample","Very low: visual check only, not recorded","Remote: indirect or random checks","Very remote: a check exists but rarely catches it","Almost impossible: no control, or cannot be detected"]}
};

/* ---------- the study's rules ---------- */
/* "human error" written as the failure mode itself */
var HUMAN=/(خطأ\s*(بشري|العامل|الموظف|الفني|المشغل|السائق|الرافع)|human\s*error|operator\s*error|worker\s*error|staff\s*error|employee\s*error|rigger\s*error|driver\s*error|mistake\s*by)/i;
/* a cause that names a person only (the same wording rule as the DMAIC, A3 and RCA tools) */
var PERSON=/(خطأ\s*(بشري|العامل|الموظف|الفني|المشغل|السائق|الشخص|الرافع|المشرف)|إهمال|اهمال|تقصير|عدم\s*(انتباه|الانتباه|تركيز|التركيز)|سهو|لامبالاة|human\s*error|operator\s*error|worker\s*error|staff\s*error|employee\s*error|rigger\s*error|driver\s*error|negligen|careless|inattent|not\s*paying\s*attention|lack\s*of\s*attention|complacen)/i;
function humanMode(s){ return HUMAN.test(String(s||"")); }
function personOnly(s){ return PERSON.test(String(s||"")); }
function rpn(s,o,d){ return (s&&o&&d)?s*o*d:null; }
/* action priority — the tool's written rule: severity first, then severity × occurrence, then detection */
function apOf(s,o,d){
 if(!s||!o||!d) return "";
 var so=s*o;
 if(s>=9||so>=40||(so>=20&&d>=7)) return "H";
 if(so>=20||(so>=10&&d>=6)||(s>=7&&d>=7)) return "M";
 return "L";
}
function zoneOf(s,o){ var so=s*o; return (s>=9||so>=40)?"H":(so>=20?"M":"L"); }
function rowAp(w){ return apOf(w.s,w.o,w.d); }
function rowRpn(w){ return rpn(w.s,w.o,w.d); }
function rowsOf(r){ return r.rows.filter(function(w){ return txt(w.mode)||txt(w.cause)||txt(w.eff)||w.s||w.o||w.d; }); }
function rowDone(w){ return !!(txt(w.mode)&&txt(w.eff)&&txt(w.cause)&&w.s&&w.o&&w.d&&txt(w.step)); }
function anyRated(r){ return r.rows.some(function(w){ return w.s||w.o||w.d; }); }
function steps(r){ return r.steps.filter(function(x){ return txt(x.t); }); }
function stepIds(r){ var o={}; steps(r).forEach(function(x){ o[x.id]=1; }); return o; }
function teamRoles(r){ return r.team.filter(function(m){ return txt(m.n)&&txt(m.role); }).length; }
function refOk(r){ return !!(txt(r.ref)&&txt(r.facil)&&txt(r.owner)); }
function scopeOk(r){ return !!(txt(r.title)&&txt(r.scope)&&txt(r.facil)&&txt(r.owner))&&teamRoles(r)>=3; }
function scMissing(r){ var n=0; ["S","O","D"].forEach(function(k){ r.sc[k].forEach(function(x){ if(!txt(x)) n++; }); }); return n; }
function scLate(r){ return isD(r.sc.date)&&isD(r.rated)&&r.sc.date>r.rated; }
function ratedMiss(r){ return anyRated(r)&&!isD(r.rated); }
function scalesOk(r){ return !scMissing(r)&&isD(r.sc.date)&&!scLate(r)&&!ratedMiss(r); }
function structOk(r){ var n=steps(r).length; return n>=MINSTEPS&&n<=MAXSTEPS; }
function incRows(r){ var P=stepIds(r); return rowsOf(r).filter(function(w){ return !rowDone(w)||!P[w.step]; }); }
function uncovered(r){ var R=rowsOf(r); return steps(r).filter(function(p){ return !R.some(function(w){ return w.step===p.id; }); }); }
function humanRows(r){ return rowsOf(r).filter(function(w){ return humanMode(w.mode)||personOnly(w.cause); }); }
function anaOk(r){ var R=rowsOf(r); return R.length>0&&!incRows(r).length&&!uncovered(r).length&&!humanRows(r).length; }
function acts(r){ return r.acts.filter(function(a){ return txt(a.what); }); }
function actsFor(r,id){ return acts(r).filter(function(a){ return a.row===id; }); }
function actOwned(a){ return !!(txt(a.who)&&isD(a.by)); }
function hiRows(r){ return rowsOf(r).filter(function(w){ return rowAp(w)==="H"; }); }
function hiOpen(r){ return hiRows(r).filter(function(w){ return !actsFor(r,w.id).some(actOwned); }); }
function unowned(r){ return acts(r).filter(function(a){ return !actOwned(a); }); }
function planOk(r){ return anaOk(r)&&!hiOpen(r).length&&!unowned(r).length; }
function rowById(r,id){ return r.rows.filter(function(w){ return w.id===id; })[0]||null; }
/* severity falls only with a design or process change */
function sevBad(r,a){ var w=rowById(r,a.row); return !!(w&&w.s&&a.ns&&a.ns<w.s&&a.kind!=="change"); }
function sevBads(r){ return acts(r).filter(function(a){ return sevBad(r,a); }); }
function reRated(a){ return a.st==="done"&&isD(a.done)&&!!(a.ns&&a.no&&a.nd)&&!!txt(a.ev); }
function doneNotRe(r){ return acts(r).filter(function(a){ return a.st==="done"&&!reRated(a); }); }
function notDone(r){ return acts(r).filter(function(a){ return a.st!=="done"; }); }
function doneOk(r){ return planOk(r)&&!notDone(r).length&&!doneNotRe(r).length&&!sevBads(r).length; }
/* the last change in the study: the first rating or an action done */
function lastChange(r){ var d=[r.rated].concat(acts(r).map(function(a){ return a.st==="done"?a.done:""; })).filter(isD).sort(); return d.length?d[d.length-1]:""; }
function revs(r){ return r.reviews.filter(function(v){ return isD(v.date)&&txt(v.team); }); }
function lastRev(r){ var d=revs(r).map(function(v){ return v.date; }).sort(); return d.length?d[d.length-1]:""; }
function revOk(r){ var lc=lastChange(r), lr=lastRev(r); return !!lr&&(!lc||lr>=lc); }
function capaNeed(r){ return r.nc||r.src==="capa"||r.src==="audit"; }
var STOK=[scopeOk,scalesOk,structOk,anaOk,planOk,doneOk,function(r){ return doneOk(r)&&revOk(r); }];
function stageOf(r){ var k=0; while(k<STOK.length&&STOK[k](r)) k++; return STAGES[k]; }
function stageName(s){ return t("st_"+s); }
function atLeast(r,s){ return STAGES.indexOf(stageOf(r))>=STAGES.indexOf(s); }
/* ratings after the action: the latest re-rated action of the row */
function rowAfter(r,w){ var A=actsFor(r,w.id).filter(reRated).sort(function(a,b){ return a.done<b.done?-1:(a.done>b.done?1:0); }); if(!A.length) return null; var a=A[A.length-1]; return {s:a.ns,o:a.no,d:a.nd}; }
function codes(r){ var o={}; r.steps.forEach(function(p,i){ o[p.id]="P"+(i+1); }); r.rows.forEach(function(w,i){ o[w.id]="R"+(i+1); }); r.acts.forEach(function(a,i){ o[a.id]="A"+(i+1); }); return o; }
function apCounts(r){ var c={H:0,M:0,L:0}; rowsOf(r).forEach(function(w){ var a=rowAp(w); if(a) c[a]++; }); return c; }
/* one list of what is still open in a study; flags (records) and open items (dashboard, report) read it */
function issues(r){
 var o=[];
 if(!refOk(r)) o.push(["ref","warn",{}]);
 if(!scopeOk(r)) o.push(["team","warn",{}]);
 if(scMissing(r)||!isD(r.sc.date)) o.push(["scales","warn",{}]);
 if(scLate(r)) o.push(["scLate","bad",{}]);
 if(ratedMiss(r)) o.push(["rated","warn",{}]);
 if(atLeast(r,"scales")&&!structOk(r)) o.push(["steps","warn",{}]);
 var ic=incRows(r).length; if(ic) o.push(["inc","warn",{n:ic}]);
 var uc=rowsOf(r).length?uncovered(r).length:0; if(uc) o.push(["cover","warn",{n:uc}]);
 if(humanRows(r).length) o.push(["human","bad",{}]);
 var ho=hiOpen(r).length; if(ho) o.push(["high","bad",{n:ho}]);
 var uo=unowned(r).length; if(uo) o.push(["own","warn",{n:uo}]);
 if(sevBads(r).length) o.push(["sev","bad",{}]);
 var dn=doneNotRe(r).length; if(dn) o.push(["rerate","warn",{n:dn}]);
 var nd=notDone(r).length; if(nd) o.push(["open","info",{n:nd}]);
 if(doneOk(r)&&!revOk(r)) o.push(["review","info",{}]);
 if(capaNeed(r)&&!txt(r.capa)) o.push(["capa","warn",{}]);
 return o;
}
function flagsOf(r){ return issues(r).map(function(x){ return [t("fl_"+x[0],x[2]),x[1]]; }); }
function openItems(){ var out=[]; DB.records.forEach(function(r){ issues(r).forEach(function(x){ out.push({r:r,k:x[1],s:t("oi_"+x[0],x[2])}); }); }); return out; }
function chip(x){ return '<span class="ca-chip '+x[1]+'">'+esc(x[0])+'</span>'; }
function apChip(a){ return a?'<span class="fm-ap ap-'+a+'">'+esc(t("ap_"+a))+'</span>':'<span class="fm-ap">—</span>'; }

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
function qsOf(q){ var k=Object.keys(q); if(!k.length) return ""; return "?"+k.map(function(x){ return x+"="+encodeURIComponent(q[x]); }).join("&"); }
function openRca(q){ openWith("rca.html",RCA_NAV,q,qsOf(q)); }
function openFish(q){ openWith("fishbone.html",FISH_NAV,q,qsOf(q)); }
function openWhy5(q){ openWith("five-whys.html",WHY5_NAV,q,qsOf(q)); }
function openPareto(q){ openWith("pareto.html",PARETO_NAV,q,qsOf(q)); }
function openA3(q){ openWith("a3.html",A3_NAV,q,qsOf(q)); }
function openDm(q){ openWith("dmaic.html",DM_NAV,q,qsOf(q)); }
/* other tools' records saved in this browser (read only) */
function recsOf(key){ var S=TBX.read(key); if(!S) return null; return (Array.isArray(S.records)?S.records:[]).filter(function(r){ return r&&typeof r==="object"&&str(r.id); }); }
function pdcaCycles(){ return (recsOf(PDCA_KEY)||[]).map(function(r){ return {id:str(r.id),title:str(r.title)}; }); }
function byIdIn(key,id){ return (recsOf(key)||[]).filter(function(r){ return str(r.id)===id; })[0]||null; }
/*__TBX_STAGES__*/
/* DMAIC projects, read with the DMAIC tool's own rules (copied at build time from tests/build/dmaic_host.js), for previews and starts only */
/*__DM_RULES__*/
function dmRec(id){ var d=byIdIn(DM_KEY,id); return d?DMR.fix(JSON.parse(JSON.stringify(d))):null; }
function dmPreview(id){ var d=dmRec(id); if(!d) return t("dmMiss"); return t("pvDm",{id:id,st:t("dst_"+DMR.stage(d)),n:DMR.steps(d).length,t:short(DMR.proved(d).map(function(c){ return c.t; }).join(" · "),140)||t("pvNo")}); }
function pv(how,id){ if(how==="dmaic") return id?dmPreview(id):((recsOf(DM_KEY)||[]).length?"":t("nxNoData")); return preview(how,id); }

/* ---------- charts (inline SVG, mirrored for Arabic; the same drawings go into the report) ---------- */
var FONT="font-family=\"'IBM Plex Sans Arabic','IBM Plex Sans',Calibri,Tahoma,sans-serif\"";
function chartW(){ try{ return window.innerWidth<640?340:520; }catch(e){ return 520; } }
var ZFILL={H:"#F8DCD5",M:"#FBEBCB",L:"#E3F2E8"}, ZDARK={H:"#B42318",M:"#B7791F",L:"#2F7D4B"};
/* severity × occurrence: a 10 × 10 grid, severity 10 at the top, occurrence 1 → 10 (right to left in Arabic), the count of rows in each cell */
function heatSVG(pts,o){
 o=o||{}; var lang=o.lang||L, rtl=lang==="ar", W=o.W||520, tt=function(k){ return (UI[lang]||UI.ar)[k]; }, f=function(v){ return Math.round(v*10)/10; };
 var m={l:40,r:12,t:12,b:40}, cell=Math.floor((W-m.l-m.r)/10), gw=cell*10, H=m.t+gw+m.b;
 var out=['<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 '+W+' '+H+'" width="'+W+'" height="'+H+'" role="img" aria-label="'+esc(o.title||"")+'" '+FONT+'>','<rect width="'+W+'" height="'+H+'" fill="#FFFFFF"/>'];
 var cnt={}; pts.forEach(function(p){ var k=p.s+"|"+p.o; cnt[k]=(cnt[k]||0)+1; });
 var X=function(oi){ var x=m.l+(oi-1)*cell; return rtl?W-x-cell:x; }, Y=function(s){ return m.t+(10-s)*cell; };
 for(var s=10;s>=1;s--){ for(var oc=1;oc<=10;oc++){ var z=zoneOf(s,oc), n=cnt[s+"|"+oc]||0;
  out.push('<rect x="'+f(X(oc)+1)+'" y="'+f(Y(s)+1)+'" width="'+(cell-2)+'" height="'+(cell-2)+'" rx="3" fill="'+(n?ZDARK[z]:ZFILL[z])+'"><title>'+esc("S "+s+" · O "+oc+(n?" · "+n:""))+'</title></rect>');
  if(n) out.push('<text x="'+f(X(oc)+cell/2)+'" y="'+f(Y(s)+cell/2+4)+'" fill="#FFFFFF" font-size="'+(cell<26?11:12.5)+'" font-weight="700" text-anchor="middle" direction="ltr">'+n+'</text>'); } }
 for(var i=1;i<=10;i++){
  out.push('<text x="'+f(rtl?W-m.l+6:m.l-6)+'" y="'+f(Y(i)+cell/2+4)+'" fill="#4B5874" font-size="10.5" text-anchor="'+(rtl?"start":"end")+'" direction="ltr">'+i+'</text>');
  out.push('<text x="'+f(X(i)+cell/2)+'" y="'+f(m.t+gw+14)+'" fill="#4B5874" font-size="10.5" text-anchor="middle" direction="ltr">'+i+'</text>'); }
 out.push('<text x="'+f(W/2)+'" y="'+f(H-6)+'" fill="#1B2A4A" font-size="11" font-weight="700" text-anchor="middle">'+esc(tt("chO"))+(rtl?" ←":" →")+'</text>');
 out.push('<text x="'+f(rtl?W-12:12)+'" y="'+f(m.t+gw/2)+'" fill="#1B2A4A" font-size="11" font-weight="700" text-anchor="middle" transform="rotate('+(rtl?90:-90)+' '+f(rtl?W-12:12)+' '+f(m.t+gw/2)+')">'+esc(tt("chS"))+' ↑</text>');
 if(!pts.length) out.push('<rect x="'+f(W/2-90)+'" y="'+f(m.t+gw/2-14)+'" width="180" height="26" rx="6" fill="#FFFFFF" opacity=".92"/><text x="'+f(W/2)+'" y="'+f(m.t+gw/2+4)+'" fill="#4B5874" font-size="12" text-anchor="middle">'+esc(o.empty||tt("chEmpty"))+'</text>');
 out.push('</svg>'); return out.join("");
}
function beforePts(r){ return rowsOf(r).filter(function(w){ return w.s&&w.o; }).map(function(w){ return {s:w.s,o:w.o}; }); }
function afterPts(r){ var o=[]; rowsOf(r).forEach(function(w){ var a=rowAfter(r,w); if(a&&a.s&&a.o) o.push({s:a.s,o:a.o}); }); return o; }
/* the highest-priority rows (high first, then the priority number) with their priority number before and after the action */
var APR={H:0,M:1,L:2,"":3};
function topRows(r,n){ return rowsOf(r).filter(function(w){ return rowRpn(w)!==null; }).sort(function(a,b){ return (APR[rowAp(a)]-APR[rowAp(b)])||(rowRpn(b)-rowRpn(a))||(b.s-a.s); }).slice(0,n||8); }
function barSVG(r,o){
 o=o||{}; var lang=o.lang||L, rtl=lang==="ar", W=o.W||520, tt=function(k){ return (UI[lang]||UI.ar)[k]; }, f=function(v){ return Math.round(v*10)/10; }, CD=codes(r);
 var T=topRows(r,8), rowH=30, m={l:46,r:46,t:26,b:10}, H=m.t+Math.max(1,T.length)*rowH+m.b;
 var out=['<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 '+W+' '+H+'" width="'+W+'" height="'+H+'" role="img" aria-label="'+esc(tt("chBar"))+'" '+FONT+'>','<rect width="'+W+'" height="'+H+'" fill="#FFFFFF"/>'];
 if(!T.length){ out.push('<text x="'+f(W/2)+'" y="'+f(H/2+4)+'" fill="#7A869E" font-size="12" text-anchor="middle">'+esc(tt("chEmpty"))+'</text></svg>'); return out.join(""); }
 var mx=Math.max.apply(null,T.map(function(w){ return rowRpn(w); }).concat([1])), iw=W-m.l-m.r, bx=function(x,wd){ return rtl?W-m.l-x-wd:m.l+x; };
 out.push('<rect x="'+f(rtl?W-m.l-10:m.l)+'" y="6" width="10" height="10" fill="#9AA5B8"/><text x="'+f(rtl?W-m.l-14:m.l+14)+'" y="15" fill="#4B5874" font-size="10.5" text-anchor="'+(rtl?"end":"start")+'" direction="ltr">'+esc(tt("chBefore"))+'</text>'+
  '<rect x="'+f(rtl?W-m.l-90:m.l+80)+'" y="6" width="10" height="10" fill="#1E8C93"/><text x="'+f(rtl?W-m.l-94:m.l+94)+'" y="15" fill="#4B5874" font-size="10.5" text-anchor="'+(rtl?"end":"start")+'" direction="ltr">'+esc(tt("chAfter"))+'</text>');
 T.forEach(function(w,i){ var y=m.t+i*rowH, b=rowRpn(w), a=rowAfter(r,w), av=a?rpn(a.s,a.o,a.d):null, ap=rowAp(w), wb=b/mx*iw, wa=av!==null?av/mx*iw:0;
  out.push('<text x="'+f(rtl?W-6:6)+'" y="'+f(y+16)+'" fill="'+APCOL[ap]+'" font-size="11" font-weight="700" text-anchor="'+(rtl?"end":"start")+'" direction="ltr">'+esc(CD[w.id]+" "+ap)+'</text>');
  out.push('<rect x="'+f(bx(0,wb))+'" y="'+f(y+3)+'" width="'+f(wb)+'" height="11" rx="2" fill="#9AA5B8"><title>'+esc(CD[w.id]+" · "+b)+'</title></rect><text x="'+f(rtl?W-m.l-wb-4:m.l+wb+4)+'" y="'+f(y+12)+'" fill="#4B5874" font-size="10" text-anchor="'+(rtl?"end":"start")+'" direction="ltr">'+b+'</text>');
  if(av!==null) out.push('<rect x="'+f(bx(0,Math.max(wa,1)))+'" y="'+f(y+15)+'" width="'+f(Math.max(wa,1))+'" height="11" rx="2" fill="#1E8C93"><title>'+esc(CD[w.id]+" · "+av)+'</title></rect><text x="'+f(rtl?W-m.l-wa-4:m.l+wa+4)+'" y="'+f(y+24)+'" fill="#1E8C93" font-size="10" font-weight="700" text-anchor="'+(rtl?"end":"start")+'" direction="ltr">'+av+'</text>'); });
 out.push('</svg>'); return out.join("");
}
/* stage map: seven stages; the same markup goes into the report */
function mapHTML(r,lang){
 var tt=function(k){ return (UI[lang||L]||UI.ar)[k]; }, k=STAGES.indexOf(stageOf(r));
 return '<ol class="dm-map fm-map" aria-label="'+esc(tt("mapT"))+'">'+MAPST.map(function(s,i){ var st=(i+1<=k)?"done":(i+1===k+1?"cur":"todo");
  return '<li class="'+st+'" style="--pc:'+SCOL[s]+'"'+(st==="cur"?' aria-current="step"':'')+'><i aria-hidden="true">'+(i+1)+'</i><span><b>'+esc(tt("st_"+s))+'</b><small>'+esc(tt("mp_"+s))+' · '+esc(tt(st==="done"?"mpDone":(st==="cur"?"mpCur":"mpTodo")))+'</small></span></li>'; }).join("")+'</ol>';
}

/* ---------- study form ---------- */
var HDR=[["title","tx",1],["ref","ltr",0],["type","sel:TYPES:ty_",0],["src","sel:SRCS:src_",0],["facil","tx",0],["owner","tx",0],["start","date",0],["area","tx",0],["scope","ta",1],["dmaic","dmaic",0],["a3","a3",0],["rca","rca",0],["pareto","pareto",0],["pcat","pcat",0],["capa","capa",0],["pdca","pdca",0]];
var PATH={title:"title",ref:"ref",type:"type",src:"src",facil:"facil",owner:"owner",start:"start",area:"area",scope:"scope",dmaic:"dmaic",a3:"a3",rca:"rca",pareto:"pareto",pcat:"pcat",capa:"capa",pdca:"pdca",sdate:"sc.date",rated:"rated"};
var LISTS={TYPES:TYPES,SRCS:SRCS,HOWS:HOWS,KINDS:KINDS,ASTS:ASTS};
function getP(r,p){ var a=p.split("."), o=r; for(var i=0;i<a.length;i++){ if(o==null) return ""; o=o[a[i]]; } return o; }
function setP(r,p,v){ var a=p.split("."), o=r; for(var i=0;i<a.length-1;i++){ if(!o[a[i]]||typeof o[a[i]]!=="object") o[a[i]]={}; o=o[a[i]]; } o[a[a.length-1]]=v; }
function opts(list,prefix,cur){ return list.map(function(k){ return '<option value="'+k+'"'+(cur===k?" selected":"")+'>'+esc(t(prefix+k))+'</option>'; }).join(""); }
function rateOpts(){ return RATE.map(function(k){ return '<option value="'+k+'">'+(k||"—")+'</option>'; }).join(""); }
function fill(list){ return list.map(function(r){ return '<option value="'+esc(r[0])+'">'+esc(r[1])+'</option>'; }).join(""); }
function link(id,list,info,btn,bl){ return '<div class="ca-pd"><input id="'+id+'" type="text" dir="ltr" list="'+list+'" aria-describedby="'+info+'">'+(btn?'<button class="pd-btn ghost" type="button" id="'+btn+'">'+esc(t(bl))+'</button>':'')+'</div><datalist id="'+list+'"></datalist><div class="ca-pdinfo" id="'+info+'" aria-live="polite"></div>'; }
function fieldHTML(name,kind,wide){
 var id="f-"+name, lb=t("f_"+name), inner="", m=/^sel:(\w+):(\w+)$/.exec(kind);
 if(kind==="ta") inner='<textarea id="'+id+'" rows="2"></textarea>';
 else if(kind==="date") inner='<input id="'+id+'" type="date">';
 else if(kind==="ltr") inner='<input id="'+id+'" type="text" dir="ltr">';
 else if(m) inner='<select id="'+id+'">'+opts(LISTS[m[1]],m[2])+'</select>';
 else if(kind==="dmaic") inner=link(id,"dmList","dmInfo","dmOpen","dmOpen");
 else if(kind==="a3") inner=link(id,"a3List","a3Info","a3Open","a3Open");
 else if(kind==="rca") inner=link(id,"rcaList","rcInfo","rcOpen","rcOpen");
 else if(kind==="capa") inner=link(id,"capaList","caInfo","caOpen","caOpen");
 else if(kind==="pareto") inner=link(id,"paList","paInfo","paOpen","paOpen");
 else if(kind==="pdca") inner=link(id,"pdcaList","pdInfo","pdOpen","pdOpen");
 else if(kind==="pcat") inner='<select id="'+id+'" aria-describedby="pcInfo"><option value="">'+esc(t("pcat_"))+'</option></select><div class="ca-pdinfo" id="pcInfo" aria-live="polite"></div>';
 else inner='<input id="'+id+'" type="text">';
 return '<div class="pd-f'+(wide?" wide":"")+'" id="w-'+name+'"><label for="'+id+'">'+esc(lb)+'</label>'+inner+'</div>';
}
function tblHTML(name,cls,heads){ return '<div class="ca-actw" id="'+name+'W"><table class="a3-tbl '+cls+'"><thead><tr>'+heads.map(function(h){ return '<th'+(h[1]?' class="'+h[1]+'"':'')+'>'+(h[0]?esc(h[0]):'<span class="sr">—</span>')+'</th>'; }).join("")+'</tr></thead><tbody id="'+name+'Rows"></tbody></table></div>'; }
function addBtn(name,lbl){ return '<button class="pd-btn ghost" type="button" data-add="'+name+'">+ '+esc(lbl)+'</button>'; }
function secHTML(k,col,inner){ return '<section class="dm-ph fm-sec" id="sec-'+k+'" style="--pc:'+col+'" aria-labelledby="sct-'+k+'"><h3 class="dm-pht" id="sct-'+k+'">'+esc(t("s"+k+"T"))+'</h3><p class="dm-phs">'+esc(t("s"+k+"S"))+'</p>'+inner+'</section>'; }
function buildForm(){
 document.getElementById("hdrFields").innerHTML=HDR.map(function(f){ return fieldHTML(f[0],f[1],f[2]); }).join("")+
  '<label class="w5-chk wide" for="f-nc"><input id="f-nc" type="checkbox"><span>'+esc(t("f_nc"))+'</span></label>';
 var hdr='<div class="pd-stage w5-sec" id="sec-Hdr" style="--sc:#7A869E"><h3>'+esc(t("sHdrT"))+'</h3><p class="pd-sub">'+esc(t("sHdrS"))+'</p>'+tblHTML("tm","a3-tm",[[t("tmN")],[t("tmRole")],[""]])+'<p class="ca-hint" id="tmNone"></p><div class="a3-add">'+addBtn("tm",t("tmAdd"))+'</div><div class="w5-warn" id="capaWarn" role="note" hidden></div></div>';
 var S1='<p class="a3-rule" id="scRule"></p><div class="pd-fields">'+fieldHTML("sdate","date",0)+fieldHTML("rated","date",0)+'</div>'+
  '<div class="ca-actw" id="scW"><table class="a3-tbl fm-sc"><thead><tr><th class="fm-lv">'+esc(t("scLv"))+'</th><th>'+esc(t("scS"))+'</th><th>'+esc(t("scO"))+'</th><th>'+esc(t("scD"))+'</th></tr></thead><tbody id="scRows"></tbody></table></div>'+
  '<div class="a3-add"><button class="pd-btn ghost" type="button" id="scFill">'+esc(t("scFill"))+'</button><span class="pd-ok" id="scMsg" role="status"></span></div><div class="w5-warn w5-bad" id="scLateW" role="note" hidden></div><div class="w5-warn" id="scMissW" role="note" hidden></div>';
 var S2=tblHTML("stp","fm-stp",[[""],[t("stpT")],[""]])+'<p class="ca-hint" id="stpNone"></p><div class="a3-add">'+addBtn("stp",t("stpAdd"))+'<span class="ca-hint">'+esc(t("stpRule"))+'</span> <button class="pd-btn ghost" type="button" id="stpDm">'+esc(t("stpDm"))+'</button></div><p class="ca-hint" id="stpFrom"></p><p class="pd-ok" id="stpMsg" role="status"></p><div class="w5-warn" id="stpWarn" role="note" hidden></div>';
 var S3='<p class="a3-rule" id="apRule"></p>'+
  '<div class="a3-pick" id="pickBox"><p class="a3-sub" style="margin:0;flex:1 1 100%">'+esc(t("pkT"))+'</p><div class="pd-f"><label for="pkHow">'+esc(t("pkHow"))+'</label><select id="pkHow">'+opts(["fish","why5","rca"],"pk_")+'</select></div><div class="pd-f"><label for="pkRef">'+esc(t("pkRef"))+'</label><input id="pkRef" type="text" dir="ltr" list="pkList"><datalist id="pkList"></datalist></div><div class="pd-btns"><button class="pd-btn ghost" type="button" id="pkUse">'+esc(t("pkUse"))+'</button></div><p class="a3-pkpv" id="pkPv" aria-live="polite"></p>'+
  '<p class="a3-pkpv" style="display:block"><span>'+esc(t("pkStart"))+'</span> <button class="pd-btn ghost" type="button" data-start="fish">'+esc(t("stFish"))+' ↗</button> <button class="pd-btn ghost" type="button" data-start="why5">'+esc(t("stWhy5"))+' ↗</button> <button class="pd-btn ghost" type="button" data-start="rca">'+esc(t("stRca"))+' ↗</button> <button class="pd-btn ghost" type="button" data-start="dmaic">'+esc(t("stDmaic"))+' ↗</button> <button class="pd-btn ghost" type="button" data-start="a3">'+esc(t("stA3"))+' ↗</button></p><p class="a3-pkpv" id="pkHub" hidden></p><p class="pd-ok a3-pkpv" id="pkMsg" role="status"></p></div>'+
  '<div id="rwCards" class="dm-cards fm-cards"></div><p class="ca-hint" id="rwNone"></p><div class="a3-add">'+addBtn("rw",t("rwAdd"))+'</div><p class="pa-sug" id="rwSum"></p><div class="w5-warn w5-bad" id="humanWarn" role="note" hidden></div><div class="w5-warn" id="coverWarn" role="note" hidden></div>'+
  '<div class="dm-blk"><h4>'+esc(t("chT"))+'</h4><div class="fm-charts"><figure class="fm-fig"><figcaption>'+esc(t("chHeatB"))+'</figcaption><div class="fm-chartw" id="heatB"></div></figure><figure class="fm-fig"><figcaption>'+esc(t("chHeatA"))+'</figcaption><div class="fm-chartw" id="heatA"></div></figure></div><p class="ca-hint">'+esc(t("chNote"))+'</p><figure class="fm-fig wide"><figcaption>'+esc(t("chBar"))+'</figcaption><div class="fm-chartw" id="barC"></div></figure></div>';
 var S4='<div id="acCards" class="dm-cards fm-cards"></div><p class="ca-hint" id="acNone"></p><div class="a3-add">'+addBtn("ac",t("acAdd"))+'</div><div class="w5-warn w5-bad" id="hiWarn" role="note" hidden></div>';
 var S5=tblHTML("rv","fm-rv",[[t("rvDate")],[t("rvTeam")],[t("rvChg")],[t("rvRows")],[""]])+'<p class="ca-hint" id="rvNone"></p><div class="a3-add">'+addBtn("rv",t("rvAdd"))+'</div><div class="w5-warn" id="rvWarn" role="note" hidden></div>';
 document.getElementById("stages").innerHTML=hdr+secHTML("Sc","#B8901E",S1)+secHTML("St","#3563C9",S2)+secHTML("An","#1B2A4A",S3)+secHTML("Ac","#C9821A",S4)+secHTML("Rv","#3C9A5F",S5);
 document.getElementById("scRule").textContent=t("scRule");
 document.getElementById("apRule").textContent=t("apRule");
 fillLists();
}
function fillLists(){
 var put=function(id,list){ var dl=document.getElementById(id); if(dl) dl.innerHTML=fill(list); };
 put("pdcaList",pdcaCycles().map(function(c){ return [c.id,c.title]; }));
 put("capaList",(recsOf(CAPA_KEY)||[]).map(function(c){ return [str(c.id),str(c.ref)+" · "+str(c.title)]; }));
 put("rcaList",(recsOf(RCA_KEY)||[]).map(function(c){ return [str(c.id),str(c.ref)+" · "+str(c.title)]; }));
 put("a3List",(recsOf(A3_KEY)||[]).map(function(c){ return [str(c.id),str(c.ref)+" · "+str(c.title)]; }));
 put("dmList",(recsOf(DM_KEY)||[]).map(function(c){ return [str(c.id),str(c.ref)+" · "+str(c.title)]; }));
 put("paList",(recsOf(PARETO_KEY)||[]).map(function(p){ return [str(p.id),str(p.ref)+" · "+str(p.title)]; }));
 var h=document.getElementById("pkHow"); put("pkList",(recsOf(keyOf(h?h.value:"fish"))||[]).map(function(p){ return [str(p.id),str(p.ref||"")+" · "+str(p.title)]; }));
}
/* ---- small tables: team, steps, reviews ---- */
var TB={
 tm:{key:"team",blank:blankTm,f:[["n","tx","tmN"],["role","tx","tmRole"]]},
 stp:{key:"steps",blank:function(){ return blankStp(""); },f:[["code","code",""],["t","tx","stpT"]],max:MAXSTEPS},
 rv:{key:"reviews",blank:blankRv,f:[["date","date","rvDate"],["team","tx","rvTeam"],["chg","ta","rvChg"],["rows","tx","rvRows"]],max:MAXREV}
};
function cellHTML(tb,f,row,i){
 var k=f[0], kind=f[1], lb=t(f[2])+" "+(i+1), id="r-"+tb+"-"+i+"-"+k, v=row[k], a=' id="'+id+'" data-k="'+k+'" aria-label="'+esc(lb)+'"';
 if(kind==="tx") return '<td><input type="text"'+a+' value="'+esc(v)+'"></td>';
 if(kind==="ta") return '<td><textarea rows="1"'+a+'>'+esc(v)+'</textarea></td>';
 if(kind==="date") return '<td class="a3-d"><input type="date"'+a+' value="'+esc(v)+'"></td>';
 if(kind==="code") return '<td class="fm-code" dir="ltr">P'+(i+1)+'</td>';
 return '<td></td>';
}
function rowHTML(tb,row,i){
 return '<tr data-row="'+i+'"'+(tb==="stp"?' data-cid="'+esc(row.id||"")+'"':'')+'>'+TB[tb].f.map(function(f){ return cellHTML(tb,f,row,i); }).join("")+'<td class="a3-x"><button type="button" class="ca-x" data-rdel="'+tb+':'+i+'" aria-label="'+esc(t("tmDel"))+'" title="'+esc(t("tmDel"))+'">✕</button></td></tr>';
}
var NONE={tm:"tmNone",stp:"stpNone",rv:"rvNone",rw:"rwNone",ac:"acNone"};
function renderTbl(tb,list){
 var box=document.getElementById(tb+"Rows"); if(!box) return;
 box.innerHTML=list.map(function(x,i){ return rowHTML(tb,x,i); }).join("");
 var ne=document.getElementById(NONE[tb]); if(ne) ne.textContent=list.length?"":t(NONE[tb]);
 autoSizeAll(box);
}
function readTbl(tb){
 var box=document.getElementById(tb+"Rows"); if(!box) return [];
 return [].map.call(box.querySelectorAll("tr[data-row]"),function(tr){
  var o={}; TB[tb].f.forEach(function(f){ var el=tr.querySelector('[data-k="'+f[0]+'"]'); if(el) o[f[0]]=txt(el.value); });
  if(tb==="stp") o.id=tr.getAttribute("data-cid")||"";
  return o;
 });
}
/* ---- the scales table: ten levels × severity, occurrence, detection ---- */
function renderScales(sc){
 var box=document.getElementById("scRows"); if(!box) return;
 var h=""; for(var i=9;i>=0;i--){ h+='<tr><td class="fm-lv" dir="ltr">'+(i+1)+'</td>'+["S","O","D"].map(function(k){ return '<td><textarea rows="1" id="sc-'+k+'-'+i+'" data-sc="'+k+'" data-lv="'+i+'" aria-label="'+esc(t("sc"+k)+" "+(i+1))+'">'+esc(sc[k][i])+'</textarea></td>'; }).join("")+'</tr>'; }
 box.innerHTML=h; autoSizeAll(box);
}
function readScales(){ var o={S:[],O:[],D:[]}; ["S","O","D"].forEach(function(k){ for(var i=0;i<10;i++){ var el=document.getElementById("sc-"+k+"-"+i); o[k].push(el?txt(el.value):""); } }); return o; }
function fillScales(){
 var D=DEFSC[L]||DEFSC.ar, n=0;
 ["S","O","D"].forEach(function(k){ for(var i=0;i<10;i++){ var el=document.getElementById("sc-"+k+"-"+i); if(el&&!txt(el.value)){ el.value=D[k][i]; n++; } } });
 autoSizeAll(document.getElementById("scRows"));
 document.getElementById("scMsg").textContent=n?t("scFilled",{n:n}):t("scNone"); refreshForm();
}
/* ---- cards: analysis rows and actions ---- */
function cf(tb,i,k,kind,labHTML,wide){
 var id="r-"+tb+"-"+i+"-"+k, a=' id="'+id+'" data-k="'+k+'"', m=/^sel:(\w+):(\w+)$/.exec(kind), inner;
 if(kind==="ta") inner='<textarea rows="1"'+a+'></textarea>';
 else if(kind==="date") inner='<input type="date"'+a+'>';
 else if(kind==="rate") inner='<select class="fm-rate"'+a+'>'+rateOpts()+'</select><small class="fm-sx" data-sx="'+k+'"></small>';
 else if(kind==="ref") inner='<input type="text" dir="ltr" list="'+id+'-l"'+a+'><datalist id="'+id+'-l"></datalist><div class="a3-pv" data-pv></div>';
 else if(kind==="sel") inner='<select'+a+'></select>';
 else if(m) inner='<select'+a+'>'+opts(LISTS[m[1]],m[2])+'</select>';
 else inner='<input type="text"'+a+'>';
 return '<div class="pd-f'+(wide?" wide":"")+' fm-f-'+k+'"><label for="'+id+'">'+labHTML+'</label>'+inner+'</div>';
}
function L1(k){ return esc(t(k)); }
function rwCardHTML(w,i){
 return '<div class="dm-card fm-rw" data-row="'+i+'" data-cid="'+esc(w.id)+'">'+
  '<div class="dm-ch"><b class="dm-code" data-code dir="ltr"></b><span class="fm-calc" data-calc dir="ltr"></span><span data-ap></span><button type="button" class="ca-x" data-rdel="rw:'+i+'" aria-label="'+esc(t("rwDel"))+'" title="'+esc(t("rwDel"))+'">✕</button></div>'+
  '<div class="pd-fields">'+cf("rw",i,"step","sel",L1("rwStep"))+cf("rw",i,"fn","tx",L1("rwFn"))+cf("rw",i,"mode","ta",L1("rwMode"),1)+cf("rw",i,"eff","ta",L1("rwEff"),1)+cf("rw",i,"s","rate",L1("rwS"))+'</div>'+
  '<div class="pd-fields">'+cf("rw",i,"cause","ta",L1("rwCause"),1)+cf("rw",i,"how","sel:HOWS:how_",L1("rwHow"))+cf("rw",i,"ref","ref",L1("rwRef"))+cf("rw",i,"prev","ta",L1("rwPrev"),1)+cf("rw",i,"o","rate",L1("rwO"))+cf("rw",i,"oev","ta",L1("rwOev"),1)+'</div>'+
  '<div class="pd-fields">'+cf("rw",i,"det","ta",L1("rwDet"),1)+cf("rw",i,"d","rate",L1("rwD"))+'</div><span class="a3-flag" data-flag></span></div>';
}
function acCardHTML(a,i){
 return '<div class="dm-card fm-ac" data-row="'+i+'" data-cid="'+esc(a.id)+'">'+
  '<div class="dm-ch"><b class="dm-code" data-code dir="ltr"></b><span class="fm-calc" data-calc dir="ltr"></span><button type="button" class="ca-x" data-rdel="ac:'+i+'" aria-label="'+esc(t("acDel"))+'" title="'+esc(t("acDel"))+'">✕</button></div>'+
  '<div class="pd-fields">'+cf("ac",i,"row","sel",L1("acRow"))+cf("ac",i,"kind","sel:KINDS:kd_",L1("acKind"))+cf("ac",i,"what","ta",L1("acWhat"),1)+cf("ac",i,"who","tx",L1("acWho"))+cf("ac",i,"by","date",L1("acBy"))+cf("ac",i,"st","sel:ASTS:as_",L1("acSt"))+cf("ac",i,"done","date",L1("acDone"))+'</div>'+
  '<div class="pd-fields">'+cf("ac",i,"ns","rate",L1("acNs"))+cf("ac",i,"no","rate",L1("acNo"))+cf("ac",i,"nd","rate",L1("acNd"))+cf("ac",i,"ev","ta",L1("acEv"),1)+'</div><span class="a3-flag" data-flag></span></div>';
}
var RWK=["step","fn","mode","eff","s","cause","how","ref","prev","o","det","d","oev"], ACK=["row","what","kind","who","by","st","done","ns","no","nd","ev"], RATEK={s:1,o:1,d:1,ns:1,no:1,nd:1};
function setVal(el,v){ if(!el) return; if(el.tagName==="SELECT"){ el.setAttribute("data-cur",v==null?"":String(v)); if([].some.call(el.options,function(o){ return o.value===String(v==null?"":v); })) el.value=String(v==null?"":v); } else el.value=v==null?"":String(v); }
function renderCards(tb,list){
 var box=document.getElementById(tb+"Cards"); if(!box) return;
 box.innerHTML=list.map(function(x,i){ return tb==="rw"?rwCardHTML(x,i):acCardHTML(x,i); }).join("");
 [].forEach.call(box.querySelectorAll(".dm-card"),function(card,i){ var x=list[i];
  (tb==="rw"?RWK:ACK).forEach(function(k){ setVal(card.querySelector('[data-k="'+k+'"]'),x[k]); });
  if(tb==="rw"){ var dl=card.querySelector("datalist"); if(dl&&["fish","why5","rca"].indexOf(x.how)>=0) dl.innerHTML=fill((recsOf(keyOf(x.how))||[]).map(function(z){ return [str(z.id),str(z.ref||"")+" · "+str(z.title)]; })); } });
 var ne=document.getElementById(NONE[tb]); if(ne) ne.textContent=list.length?"":t(NONE[tb]);
 autoSizeAll(box);
}
function readCards(tb){
 var box=document.getElementById(tb+"Cards"); if(!box) return [];
 var v=function(card,k){ var el=card.querySelector('[data-k="'+k+'"]'); if(!el) return ""; if(el.tagName==="SELECT"&&(k==="step"||k==="row")) return el.value||el.getAttribute("data-cur")||""; return RATEK[k]?rate(el.value):txt(el.value); };
 return [].map.call(box.querySelectorAll(".dm-card"),function(card){ var o={id:card.getAttribute("data-cid")}; (tb==="rw"?RWK:ACK).forEach(function(k){ o[k]=v(card,k); }); return o; });
}
function autoSize(el){ if(!el||el.tagName!=="TEXTAREA") return; el.style.height="auto"; if(el.scrollHeight) el.style.height=(el.scrollHeight+2)+"px"; }
function autoSizeAll(root){ if(root) root.querySelectorAll("textarea").forEach(autoSize); }
/* the study as it would be saved: empty rows dropped */
function formToRec(){
 var r=blank();
 Object.keys(PATH).forEach(function(k){ var el=document.getElementById("f-"+k); if(el) setP(r,PATH[k],txt(el.value)); });
 var nc=document.getElementById("f-nc"); r.nc=!!(nc&&nc.checked);
 if(document.getElementById("tmRows")){
  r.team=readTbl("tm").map(fixTm).filter(function(m){ return m.n||m.role; });
  var sc=readScales(); r.sc.S=sc.S; r.sc.O=sc.O; r.sc.D=sc.D;
  r.steps=readTbl("stp").map(fixStp).filter(function(x){ return x.t; });
  r.rows=readCards("rw").map(fixRw).filter(function(x){ return x.mode||x.cause||x.eff||x.fn||x.s||x.o||x.d; });
  r.acts=readCards("ac").map(fixAc).filter(function(x){ return x.what||x.who||x.ev; });
  r.reviews=readTbl("rv").map(fixRv).filter(function(x){ return x.date||x.team||x.chg||x.rows; });
 }
 r.stepsFrom=document.getElementById("stpFromV")?document.getElementById("stpFromV").value:(editing?editing.stepsFrom:"");
 r.id=document.getElementById("rid").value;
 if(editing&&editing.id===r.id){ r.created=editing.created||""; }
 fixRec(r);
 return r;
}
/* while typing, the study keeps every row (even empty ones) so the tables keep their shape */
function formRaw(){ var o={}; Object.keys(TB).forEach(function(tb){ o[tb]=readTbl(tb); }); o.rw=readCards("rw"); o.ac=readCards("ac"); return o; }
function recToForm(r,keepMsg){
 r=fixRec(JSON.parse(JSON.stringify(r)));
 document.getElementById("rid").value=r.id||"";
 Object.keys(PATH).forEach(function(k){ var el=document.getElementById("f-"+k); if(!el) return; var v=getP(r,PATH[k]); v=(v===null||v===undefined)?"":String(v);
  if(k==="pcat"){ pcatOptions(r.pareto,v); return; } el.value=v||(el.tagName==="SELECT"&&el.options.length?el.options[0].value:""); });
 document.getElementById("f-nc").checked=r.nc;
 var sf=document.getElementById("stpFromV"); if(!sf){ sf=document.createElement("input"); sf.type="hidden"; sf.id="stpFromV"; document.getElementById("rec-form").appendChild(sf); } sf.value=r.stepsFrom||"";
 renderTbl("tm",r.team); renderScales(r.sc); renderTbl("stp",r.steps); renderTbl("rv",r.reviews);
 renderCards("rw",r.rows); renderCards("ac",r.acts);
 if(!keepMsg){ ["recErr","recOk","pkMsg","stpMsg","scMsg"].forEach(function(id){ var e=document.getElementById(id); if(e) e.textContent=""; }); }
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
function scText(r,k,v){ var K={s:"S",o:"O",d:"D",ns:"S",no:"O",nd:"D"}[k]; return (v&&r.sc[K])?txt(r.sc[K][v-1]):""; }
/* the parts that depend on other rows are updated in place, so typing never loses focus */
function refreshForm(){
 var r=formToRec(), st=stageOf(r), CD=codes(r), W=chartW(), raw=formRaw();
 var el=document.getElementById("curStage"); if(el) el.textContent=t("cur")+" "+stageName(st);
 document.getElementById("caSteps").innerHTML=mapHTML(r);
 setW("capaWarn",capaNeed(r)&&!txt(r.capa),t("capaW"));
 /* scales */
 setW("scLateW",scLate(r),t("scLate")); var mi=scMissing(r);
 setW("scMissW",(mi>0&&mi<30)||ratedMiss(r),(mi>0&&mi<30?t("scMiss",{n:mi}):"")+(ratedMiss(r)?" "+t("ratedMiss"):""));
 /* structure */
 var nst=raw.stp.filter(function(x){ return txt(x.t); }).length;
 setW("stpWarn",nst>0&&(nst<MINSTEPS||nst>MAXSTEPS),t("stpW",{n:nst}));
 var sb=document.querySelector('[data-add="stp"]'); if(sb) sb.disabled=raw.stp.length>=MAXSTEPS;
 var sf=document.getElementById("stpFrom"); if(sf) sf.textContent=r.stepsFrom?t("stpFrom",{id:r.stepsFrom}):"";
 /* analysis rows: the steps they can name, the computed number and priority, the flags */
 var stOpts=[["","—"]].concat(raw.stp.map(function(p,i){ return txt(p.t)?[p.id||("new"+i),"P"+(i+1)+" · "+short(p.t,40)]:null; }).filter(function(x){ return x&&x[0].indexOf("new")!==0; }));
 document.querySelectorAll("#rwCards .dm-card").forEach(function(card,i){
  var w=fixRw(raw.rw[i]||{}); card.querySelector("[data-code]").textContent="R"+(i+1);
  selOptions(card.querySelector('[data-k="step"]'),stOpts);
  var n=rowRpn(w), ap=rowAp(w);
  card.querySelector("[data-calc]").textContent=t("rpnL")+" "+(n===null?"—":n);
  card.querySelector("[data-ap]").innerHTML=apChip(ap); card.setAttribute("data-apv",ap);
  ["s","o","d"].forEach(function(k){ var sx=card.querySelector('[data-sx="'+k+'"]'); if(sx) sx.textContent=scText(r,k,w[k]); });
  var rf=card.querySelector('[data-k="ref"]'), pvb=card.querySelector("[data-pv]"), linked=["fish","why5","rca"].indexOf(w.how)>=0;
  if(rf){ rf.disabled=!linked; if(pvb) pvb.textContent=linked&&txt(rf.value)?pv(w.how,txt(rf.value)):""; }
  var msg=[]; if(humanMode(w.mode)) msg.push(t("humanF")); if(personOnly(w.cause)) msg.push(t("personF")); if((w.mode||w.cause||w.eff)&&!rowDone(w)) msg.push(t("incF"));
  card.querySelector("[data-flag]").textContent=msg.join(" "); card.classList.toggle("a3-pf",humanMode(w.mode)||personOnly(w.cause)); });
 var ac=apCounts(r); document.getElementById("rwSum").textContent=rowsOf(r).length?t("rwSum",{n:rowsOf(r).length,h:ac.H,m:ac.M,l:ac.L}):"";
 setW("humanWarn",humanRows(r).length>0,t("humanW"));
 var uc=rowsOf(r).length?uncovered(r):[]; setW("coverWarn",uc.length>0,t("coverW",{s:uc.map(function(p){ return CD[p.id]; }).join(L==="ar"?"، ":", ")}));
 var rb=document.querySelector('[data-add="rw"]'); if(rb) rb.disabled=raw.rw.length>=MAXROWS;
 /* picker preview */
 var how=document.getElementById("pkHow").value, ref=txt(document.getElementById("pkRef").value);
 document.getElementById("pkPv").textContent=pv(how,ref);
 var hub=inHub(), ph=document.getElementById("pkHub"); if(ph){ ph.hidden=!hub; ph.textContent=hub?t("pkHub"):""; }
 /* charts */
 document.getElementById("heatB").innerHTML=heatSVG(beforePts(r),{lang:L,W:W,title:t("chHeatB")});
 document.getElementById("heatA").innerHTML=heatSVG(afterPts(r),{lang:L,W:W,title:t("chHeatA"),empty:t("chAfterEmpty")});
 document.getElementById("barC").innerHTML=barSVG(r,{lang:L,W:W});
 /* actions: the rows they can name, the severity rule, re-rating */
 var rOpts=[["","—"]].concat(r.rows.map(function(w){ return [w.id,CD[w.id]+" · "+(rowAp(w)?t("ap_"+rowAp(w))+" · ":"")+short(w.mode||w.cause,44)]; }));
 document.querySelectorAll("#acCards .dm-card").forEach(function(card,i){
  var a=fixAc(raw.ac[i]||{}); card.querySelector("[data-code]").textContent="A"+(i+1);
  var rs=card.querySelector('[data-k="row"]'); selOptions(rs,rOpts); a.row=rs.value;
  var w=rowById(r,a.row), n=(a.ns&&a.no&&a.nd)?rpn(a.ns,a.no,a.nd):null;
  card.querySelector("[data-calc]").textContent=w&&rowRpn(w)!==null?t("rpnL")+" "+rowRpn(w)+(n!==null?" → "+n:""):"";
  ["ns","no","nd"].forEach(function(k){ var sx=card.querySelector('[data-sx="'+k+'"]'); if(sx) sx.textContent=scText(r,k,a[k]); });
  var msg=[]; if(txt(a.what)&&!actOwned(a)) msg.push(t("ownF")); if(sevBad(r,a)) msg.push(t("sevF")); if(a.st==="done"&&txt(a.what)&&!reRated(a)) msg.push(t("reF"));
  card.querySelector("[data-flag]").textContent=msg.join(" "); card.classList.toggle("a3-pf",sevBad(r,a)); });
 var ho=hiOpen(r); setW("hiWarn",ho.length>0,t("hiW",{r:ho.map(function(w){ return CD[w.id]; }).join(L==="ar"?"، ":", ")}));
 /* review */
 setW("rvWarn",doneOk(r)&&!revOk(r)&&!!lastChange(r),t("rvW",{d:lastChange(r)}));
 /* header links */
 var pi=document.getElementById("pdInfo"); if(pi){ if(!r.pdca) pi.textContent=t("pdHint"); else { var pc=pdcaCycles().filter(function(x){ return x.id===r.pdca; })[0]; pi.textContent=pc?t("pdFound",{t:pc.title||pc.id}):t("pdMiss"); } }
 var ca=document.getElementById("caInfo"); if(ca) ca.textContent=r.capa?(byIdIn(CAPA_KEY,r.capa)?preview("capa",r.capa):t("caMiss")):t("caHint");
 var rc=document.getElementById("rcInfo"); if(rc) rc.textContent=r.rca?(byIdIn(RCA_KEY,r.rca)?preview("rca",r.rca):t("rcMiss")):t("rcHint");
 var a3i=document.getElementById("a3Info"); if(a3i) a3i.textContent=r.a3?(byIdIn(A3_KEY,r.a3)?preview("a3",r.a3):t("a3Miss")):t("a3Hint");
 var dmi=document.getElementById("dmInfo"); if(dmi) dmi.textContent=r.dmaic?dmPreview(r.dmaic):t("dmHint");
 pcatOptions(r.pareto);
 var pa=document.getElementById("paInfo"); if(pa) pa.textContent=r.pareto?(byIdIn(PARETO_KEY,r.pareto)?preview("pareto",r.pareto):t("paMiss")):t("paHint");
 var pcI=document.getElementById("pcInfo"); if(pcI){ var c2=(r.pareto&&r.pcat)?paCatInfo(r.pareto,r.pcat):null; pcI.textContent=c2?c2.txt:""; }
}
function validate(r){
 if(!r.title) return t("e_title");
 if(isD(r.rated)&&acts(r).some(function(a){ return isD(a.done)&&a.done<r.rated; })) return t("e_date");
 return "";
}
function newId(r){
 var y=(isD(r.start)?r.start:today()).slice(0,4), pre="FM-"+y+"-";
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
/* new ids for rows typed in the form: the highest number used so far, in the form or in the saved study */
function nextId(list,pre,saved){ var n=0, re=new RegExp("^"+pre+"(\\d+)$"); list.concat(saved||[]).forEach(function(c){ var m=re.exec(c.id||""); if(m) n=Math.max(n,+m[1]); }); return pre+(n+1); }

/* ---------- steps from a DMAIC SIPOC (read only) ---------- */
function stepsFromDm(){
 var r=formToRec(), msg=document.getElementById("stpMsg");
 if(!r.dmaic){ msg.textContent=t("stpDmNo"); return; }
 if(formRaw().stp.some(function(x){ return txt(x.t); })){ msg.textContent=t("stpDmHave"); return; }
 var d=dmRec(r.dmaic), S=d?DMR.steps(d):[]; if(!S.length){ msg.textContent=t("stpDmMiss"); return; }
 renderTbl("stp",S.map(function(x,i){ return {id:"p"+(i+1),t:x.t}; })); document.getElementById("stpFromV").value=r.dmaic;
 refreshForm(); msg.textContent=t("stpDmOk",{n:S.length,id:r.dmaic});
}
/* ---------- pick causes from Fishbone, 5 Whys or RCA (read only): each becomes a new row for the team to complete ---------- */
function pickCauses(){
 var how=document.getElementById("pkHow").value, id=txt(document.getElementById("pkRef").value), msg=document.getElementById("pkMsg");
 if(!id){ msg.textContent=t("nxNoData"); return; }
 var R=causesFrom(how,id); if(R===null){ msg.textContent=t("nxMiss"); return; }
 if(!R.length){ msg.textContent=t("pkNone"); return; }
 var list=formRaw().rw, n=0, have=list.map(function(w){ return low(w.cause); });
 R.forEach(function(x){ if(have.indexOf(low(x.t))>=0||list.length>=MAXROWS) return; var w=blankRw(nextId(list,"r",editing?editing.rows:[])); w.cause=x.t; w.how=x.how; w.ref=x.ref; list.push(w); n++; });
 if(!n){ msg.textContent=t("pkDup"); return; }
 renderCards("rw",list.map(fixRw)); refreshForm(); msg.textContent=t("pkAdded",{n:n,id:id});
}
function startIn(how){
 var r=formToRec();
 if(how==="rca"){ openRca(r.capa?{capa:r.capa}:(r.pareto&&r.pcat?{pareto:r.pareto,cat:r.pcat}:{})); return; }
 if(how==="fish"){ openFish(r.capa?{capa:r.capa}:{}); return; }
 if(how==="why5"){ openWhy5(r.capa?{capa:r.capa}:{}); return; }
 if(how==="dmaic"){ openDm(r.rca?{rca:r.rca}:(r.pareto&&r.pcat?{pareto:r.pareto,cat:r.pcat}:(r.a3?{a3:r.a3}:{}))); return; }
 openA3(r.rca?{rca:r.rca}:(r.capa?{capa:r.capa}:(r.pareto&&r.pcat?{pareto:r.pareto,cat:r.pcat}:{})));
}

/* ---------- start from a DMAIC project, an RCA investigation or a Pareto vital-few category (read only, preview first) ---------- */
function stSelects(){ var s=document.getElementById("stSrc"); if(!s) return; var cur=s.value||"dmaic"; s.innerHTML=opts(["dmaic","rca","pareto"],"ss_",cur); }
function stRows(src){
 if(src==="dmaic"){ var D=recsOf(DM_KEY); return D?D.map(function(c){ return {k:"dmaic",c:c}; }):null; }
 if(src==="rca"){ var R=recsOf(RCA_KEY); return R?R.map(function(c){ return {k:"rca",c:c}; }):null; }
 var P=recsOf(PARETO_KEY); if(!P) return null; var o=[];
 P.forEach(function(p){ var K=paRank(p); K.rows.filter(function(x){ return x.vit; }).forEach(function(x){ o.push({k:"pareto",p:p,x:x,tot:K.total}); }); });
 return o;
}
function th(keys){ return '<thead><tr>'+keys.map(function(k){ return '<th>'+esc(t(k))+'</th>'; }).join("")+'</tr></thead>'; }
function stPreview(keep){
 var src=document.getElementById("stSrc").value||"dmaic", msg=document.getElementById("stMsg"), box=document.getElementById("stTable"), R=stRows(src);
 if(!R){ ST=null; box.hidden=true; msg.textContent=t("stNone"); return; }
 if(!R.length){ ST=null; box.hidden=true; msg.textContent=t("stEmpty"); return; }
 ST={src:src}; if(!keep) msg.textContent="";
 box.hidden=false;
 if(src==="dmaic") box.innerHTML='<table class="pd-tbl">'+th(["stColId","stColT","stColSt","stColSteps","stColCz","stColN","stColA"])+'<tbody>'+
  R.map(function(x){ var id=str(x.c.id), d=dmRec(id), n=DB.records.filter(function(r){ return r.dmaic===id; }).length;
   return '<tr><td><b dir="ltr">'+esc(id)+'</b></td><td><b dir="ltr">'+esc(str(x.c.ref))+'</b><br>'+esc(str(x.c.title))+'</td><td>'+esc(t("dst_"+DMR.stage(d)))+'</td><td>'+esc(short(DMR.steps(d).map(function(p){ return p.t; }).join(" → "),140)||"—")+'</td><td>'+esc(short(DMR.proved(d).map(function(c){ return c.t; }).join(" · "),120)||"—")+'</td><td>'+n+'</td><td><button class="pd-rowbtn" type="button" data-stdm="'+esc(id)+'">'+esc(t("stUse"))+'</button></td></tr>'; }).join("")+'</tbody></table>';
 else if(src==="rca") box.innerHTML='<table class="pd-tbl">'+th(["stColId","stColT","stColSt","stColRoot","stColN","stColA"])+'<tbody>'+
  R.map(function(x){ var c=x.c, id=str(c.id), n=DB.records.filter(function(r){ return r.rca===id; }).length;
   return '<tr><td><b dir="ltr">'+esc(id)+'</b></td><td><b dir="ltr">'+esc(str(c.ref))+'</b><br>'+esc(str(c.title))+'</td><td>'+esc(t("rst_"+rcaStage(c)))+'</td><td>'+esc(short(rcaRoots(c).map(function(z){ return str(z.t); }).join(" · "),120)||"—")+'</td><td>'+n+'</td><td><button class="pd-rowbtn" type="button" data-strca="'+esc(id)+'">'+esc(t("stUse"))+'</button></td></tr>'; }).join("")+'</tbody></table>';
 else box.innerHTML='<table class="pd-tbl">'+th(["stColId","stColCat","stColV","stColPer","stColN","stColA"])+'<tbody>'+
  R.map(function(z){ var p=z.p, x=z.x, id=str(p.id), cid=str(x.c.id), n=DB.records.filter(function(r){ return r.pareto===id&&r.pcat===cid; }).length;
   return '<tr><td><b dir="ltr">'+esc(id)+'</b><br><small>'+esc(short(str(p.title),70))+'</small></td><td>'+esc(str(x.c.name))+'</td><td dir="ltr">'+esc(fmtN(x.v)+(puName(p.unit)?" "+puName(p.unit):"")+" · "+(Math.round(x.share*10)/10).toFixed(1)+"%")+'</td><td dir="ltr">'+esc((str(p.from)||"—")+" → "+(str(p.to)||"—"))+'</td><td>'+n+'</td><td><button class="pd-rowbtn" type="button" data-stpa="'+esc(id)+'" data-cat="'+esc(cid)+'">'+esc(t("stUse"))+'</button></td></tr>'; }).join("")+'</tbody></table>';
}
function prefilled(r,msgKey,v){ fixRec(r); editing=null; recToForm(r); go("tools"); document.getElementById("recOk").textContent=t(msgKey,v); return true; }
/* a new study filled from a DMAIC project; the project is only read. Its SIPOC steps become the structure and its proved causes become
   causes of rows; the failure modes and the ratings are left to the team. */
function prefillFromDm(id){
 var d=dmRec(id); if(!d) return false;
 var r=blank(), S=DMR.steps(d), P=DMR.proved(d);
 r.title="FMEA — "+str(d.title); r.ref=str(d.ref); r.type="process"; r.src="dmaic"; r.dmaic=str(d.id); r.a3=str(d.a3); r.rca=str(d.rca); r.pareto=str(d.pareto); r.pcat=str(d.pcat); r.capa=str(d.capa); r.pdca=str(d.pdca);
 r.area=str(d.area); r.facil=str(d.lead); r.owner=str(d.owner); r.start=today(); r.scope=str(d.def.scin);
 r.team=arr(d.team).map(function(m){ return {n:str(m.n),role:str(m.role)}; });
 r.steps=S.map(function(x,i){ return {id:"p"+(i+1),t:x.t}; }); r.stepsFrom=str(d.id);
 r.rows=P.map(function(c,i){ var w=blankRw("r"+(i+1)); w.cause=c.t; w.how=["fish","why5","rca"].indexOf(c.how)>=0?c.how:"here"; w.ref=w.how==="here"?"":c.ref; w.oev=c.ev; return w; });
 return prefilled(r,"stUsedD",{id:str(d.id),n:S.length,c:P.length});
}
/* a new study filled from an RCA investigation; the failure becomes the mode of each row, its root causes the causes */
function prefillFromRca(id){
 var c=byIdIn(RCA_KEY,id); if(!c) return false;
 var r=blank(), p=obj(c.prob), RT=rcaRoots(c);
 r.title="FMEA — "+str(c.title); r.ref=str(c.ref); r.type="process"; r.src="rca"; r.rca=str(c.id); r.capa=str(c.capa); r.pareto=str(c.pareto); r.pcat=str(c.pcat); r.pdca=str(c.pdca); r.area=str(c.area); r.facil=str(c.lead); r.start=today();
 r.team=arr(c.team).map(function(m){ return {n:str(m.n),role:str(m.role)}; });
 r.scope=str(p.where);
 r.rows=(RT.length?RT:[{t:""}]).map(function(z,i){ var w=blankRw("r"+(i+1)); w.mode=short(str(p.what),240); w.eff=str(p.much); w.cause=str(z.t); w.how=z.t?"rca":"here"; w.ref=z.t?str(c.id):""; return w; });
 return prefilled(r,"stUsedR",{id:str(c.id)});
}
/* a new study filled from a Pareto category: the category becomes a failure mode, with its value and share as occurrence evidence */
function prefillFromPareto(pid,cid){
 var I=paCatInfo(pid,cid); if(!I) return false;
 var p=I.p, x=I.x, r=blank(), w=blankRw("r1");
 r.title="FMEA — "+short(str(x.c.name)+" · "+str(p.title),110); r.ref=str(p.ref)||str(p.id); r.type="process"; r.src="pareto"; r.pareto=str(p.id); r.pcat=str(x.c.id); r.pdca=str(p.pdca); r.area=str(p.area); r.start=today();
 w.mode=str(x.c.name)+(txt(str(x.c.def))?": "+str(x.c.def):"");
 w.oev=t("pvOev",{id:str(p.id),c:str(x.c.name),v:fmtN(x.v),u:puName(p.unit),s:(Math.round(x.share*10)/10).toFixed(1),f:str(p.from)||"—",to:str(p.to)||"—"}).replace(/\s+/g," ");
 r.rows=[w];
 var nx=obj(x.c.nx); if(nx.how==="capa") r.capa=str(nx.ref); if(nx.how==="rca") r.rca=str(nx.ref);
 return prefilled(r,"stUsedP",{id:str(p.id),c:str(x.c.name)});
}
document.getElementById("stSrc").addEventListener("change",function(){ ST=null; document.getElementById("stTable").hidden=true; document.getElementById("stMsg").textContent=""; });
document.getElementById("stPrev").addEventListener("click",function(){ stPreview(false); });
document.getElementById("stTable").addEventListener("click",function(e){ var a=e.target.closest("[data-stdm]"); if(a){ prefillFromDm(a.getAttribute("data-stdm")); return; } var b=e.target.closest("[data-strca]"); if(b){ prefillFromRca(b.getAttribute("data-strca")); return; } var p=e.target.closest("[data-stpa]"); if(p) prefillFromPareto(p.getAttribute("data-stpa"),p.getAttribute("data-cat")); });
function homeCounts(){ var n=0; (recsOf(PARETO_KEY)||[]).forEach(function(p){ n+=paRank(p).rows.filter(function(x){ return x.vit; }).length; });
 return {d:(recsOf(DM_KEY)||[]).length,r:(recsOf(RCA_KEY)||[]).length,p:n}; }
function renderHomeSt(){
 var box=document.getElementById("homeImp"); if(!box) return;
 var h=homeCounts(), n=h.d+h.r+h.p; box.hidden=!n || DB.records.length>0; if(n) document.getElementById("homeImpT").textContent=t("hmT",h);
}
document.getElementById("homeImpGo").addEventListener("click",function(){ go("tools"); var s=document.getElementById("stSrc"), h=homeCounts(); if(s) s.value=h.d?"dmaic":(h.r?"rca":"pareto"); stPreview(false); var b=document.getElementById("stBox"); if(b&&b.scrollIntoView) b.scrollIntoView({block:"start"}); });

/* ---------- self-assessment ---------- */
var AQ=[
 ["PP1",{ar:"هل تُجرى دراسة FMEA بفريق من الوظائف المعنية بميسر مؤهل، لا بشخص واحد على مكتبه؟",en:"Is each FMEA run by a cross-functional team with a competent facilitator, not by one person at a desk?"}],
 ["PP2",{ar:"هل تُكتب مقاييس الخطورة والحدوث والكشف بمعنى لكل درجة وتُعتمد قبل أول تقييم، وتبقى نفسها طوال الدراسة؟",en:"Are the severity, occurrence and detection scales written with a meaning for each level and agreed before the first rating, and kept the same across the study?"}],
 ["PP3",{ar:"هل تُرسم بنية العملية (الخطوات بالترتيب، من SIPOC أو مخطط التدفق) قبل كتابة أنماط الفشل؟",en:"Is the process structure (the steps in order, from a SIPOC or a flow chart) mapped before the failure modes are written?"}],
 ["AN1",{ar:"هل يُوصف الأثر كما يراه العميل أو الخطوة التالية، وتُقيَّم الخطورة على هذا الأثر؟",en:"Is the effect described as the customer or the next step would see it, and the severity rated on that effect?"}],
 ["AN2",{ar:"هل تُكتب الأسباب أشياء يمكن العمل عليها في العملية أو التصميم، لا «خطأ بشري» ولا اسم شخص؟",en:"Are causes written as things that can be acted on in the process or the design, not as \"human error\" or a person's name?"}],
 ["AN3",{ar:"هل تُفصل ضوابط المنع (التي تخفض الحدوث) عن ضوابط الكشف (التي تكتشف قبل العميل) في كل صف؟",en:"Are prevention controls (which lower occurrence) kept apart from detection controls (which find it before the customer) in every row?"}],
 ["AC1",{ar:"هل تُعالج الخطورة العالية أولاً مهما كان رقم الأولوية، بدل ترتيب العمل برقم الأولوية وحده؟",en:"Is high severity treated first whatever the priority number, rather than ranking the work by the priority number alone?"}],
 ["AC2",{ar:"هل لكل إجراء مسؤول وموعد، ويُتابع حتى التنفيذ؟",en:"Does every action have an owner and a due date, and is it followed until it is done?"}],
 ["AC3",{ar:"هل يُعاد تقييم الدرجات بعد تنفيذ الإجراء بدليل مكتوب (بيانات، ملاحظة، سجلات)؟",en:"Are the ratings given again after the action is done, with written evidence (data, observation, records)?"}],
 ["AC4",{ar:"هل تنخفض الخطورة فقط بتغيير في التصميم أو العملية، لا بإضافة فحص أو ضابط؟",en:"Is severity lowered only by a design or process change, never by adding a check or a control?"}],
 ["LV1",{ar:"هل تُراجع الدراسة بعد تغيير العملية، وبعد كل عدم مطابقة، وبعد ملاحظة التدقيق؟",en:"Is the study reviewed after a process change, after each nonconformity and after an audit finding?"}],
 ["LV2",{ar:"هل تنتقل نتائج FMEA إلى خطط الضبط والإجراءات وتعليمات العمل ودروس المشاريع التالية؟",en:"Do FMEA results feed the control plans, procedures, work instructions and the lessons for the next projects?"}]
];
var AGROUPS=["PP","AN","AC","LV"];
var GCOL={PP:"#B8901E",AN:"#1B2A4A",AC:"#C9821A",LV:"#3C9A5F"};
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
  var st=stageOf(r), H=hiRows(r), A=acts(r);
  var del=(pendingDelete===r.id)?'<button class="pd-rowbtn arm" type="button" data-del="'+esc(r.id)+'">'+esc(t("delArm"))+'</button>':'<button class="pd-rowbtn" type="button" data-del="'+esc(r.id)+'">'+esc(t("del"))+'</button>';
  var lk=(r.dmaic?'<button class="pd-rowbtn" type="button" data-odm="'+esc(r.dmaic)+'">DMAIC ↗</button>':'')+(r.rca?'<button class="pd-rowbtn" type="button" data-orca="'+esc(r.rca)+'">RCA ↗</button>':'')+(r.a3?'<button class="pd-rowbtn" type="button" data-oa3="'+esc(r.a3)+'">A3 ↗</button>':'')+(r.capa?'<button class="pd-rowbtn" type="button" data-capa="'+esc(r.capa)+'">CAPA ↗</button>':'')+(r.pdca?'<button class="pd-rowbtn" type="button" data-pdca="'+esc(r.pdca)+'">PDCA ↗</button>':'');
  return '<tr><td><b dir="ltr">'+esc(r.ref||"—")+'</b><br>'+esc(r.title)+'<br><small dir="ltr" style="color:var(--muted)">'+esc(r.id)+'</small></td><td>'+esc(r.facil||"—")+'<br><small>'+esc(r.owner||"—")+'</small></td><td><span class="pd-badge" style="background:'+SCOL[st]+';color:#fff">'+esc(stageName(st))+'</span><br><small>'+esc(t("ty_"+r.type))+' · '+esc(t("src_"+r.src))+'</small></td><td>'+esc(t("rowsN",{n:rowsOf(r).length,s:steps(r).length}))+'</td><td>'+esc(t("highN",{h:H.length,a:H.length-hiOpen(r).length}))+'</td><td>'+(A.length?esc(t("actsN",{d:A.filter(function(a){ return a.st==="done"; }).length,n:A.length})):"—")+'</td><td>'+flagsOf(r).map(chip).join("")+'</td><td><button class="pd-rowbtn" type="button" data-open="'+esc(r.id)+'">'+esc(t("open"))+'</button>'+del+lk+'</td></tr>';
 }).join("");
 box.innerHTML='<table class="pd-tbl">'+th(["colRef","colFac","colStage","colRows","colHigh","colActs","colFlags","colAct"])+'<tbody>'+rows+'</tbody></table>';
}
document.addEventListener("click",function(e){
 if(e.target.closest("#cb")) return;
 var o=e.target.closest("[data-open]"); if(o){ var r=DB.records.find(function(x){ return x.id===o.getAttribute("data-open"); }); if(r){ loadRecordIntoForm(r); go("tools"); } return; }
 var d=e.target.closest("[data-del]"); if(d){ var id=d.getAttribute("data-del"); if(pendingDelete===id){ DB.records=DB.records.filter(function(x){ return x.id!==id; }); pendingDelete=null; persist(); if(document.getElementById("rid").value===id) clearForm(); renderAll(); } else { pendingDelete=id; renderDocs(); } return; }
 if(e.target.closest("[data-pdca]")||e.target.closest("#pdOpen")){ openTool("pdca.html","docs"); return; }
 if(e.target.closest("[data-capa]")||e.target.closest("#caOpen")){ openTool("capa.html","docs"); return; }
 var od=e.target.closest("[data-odm]"); if(od){ openDm({open:od.getAttribute("data-odm")}); return; }
 var oc=e.target.closest("[data-orca]"); if(oc){ openRca({open:oc.getAttribute("data-orca")}); return; }
 var oa=e.target.closest("[data-oa3]"); if(oa){ openA3({open:oa.getAttribute("data-oa3")}); return; }
 if(e.target.closest("#dmOpen")){ var dv=txt(document.getElementById("f-dmaic").value); openDm(dv?{open:dv}:{}); return; }
 if(e.target.closest("#rcOpen")){ var rv=txt(document.getElementById("f-rca").value); openRca(rv?{open:rv}:{}); return; }
 if(e.target.closest("#a3Open")){ var av=txt(document.getElementById("f-a3").value); openA3(av?{open:av}:{}); return; }
 if(e.target.closest("#paOpen")){ var pv0=txt(document.getElementById("f-pareto").value); openPareto(pv0?{open:pv0}:{}); return; }
 if(e.target.closest("#pkUse")){ pickCauses(); return; }
 if(e.target.closest("#stpDm")){ stepsFromDm(); return; }
 if(e.target.closest("#scFill")){ fillScales(); return; }
 var sb=e.target.closest("[data-start]"); if(sb){ startIn(sb.getAttribute("data-start")); return; }
 var ad=e.target.closest("[data-add]"); if(ad){ var tb=ad.getAttribute("data-add"), all=formRaw(), raw=all[tb];
  if(tb==="rw"||tb==="ac"){ if(raw.length<MAXROWS){ raw.push(tb==="rw"?blankRw(nextId(raw,"r",editing?editing.rows:[])):blankAc(nextId(raw,"a",editing?editing.acts:[]))); renderCards(tb,raw.map(tb==="rw"?fixRw:fixAc)); var bx=document.getElementById(tb+"Cards"), lt=bx&&bx.querySelector(".dm-card:last-child textarea"); if(lt) lt.focus(); } refreshForm(); return; }
  if(raw.length<(TB[tb].max||MAXROWS)){ var nb=TB[tb].blank(); if(tb==="stp") nb.id=nextId(raw,"p",editing?editing.steps:[]); raw.push(nb); renderTbl(tb,raw); var box=document.getElementById(tb+"Rows"), lt2=box&&box.querySelector("tr:last-child textarea, tr:last-child input"); if(lt2) lt2.focus(); } refreshForm(); return; }
 var rd=e.target.closest("[data-rdel]"); if(rd){ var a=rd.getAttribute("data-rdel").split(":"), l2=formRaw()[a[0]]; l2.splice(Number(a[1]),1); if(a[0]==="rw"||a[0]==="ac") renderCards(a[0],l2.map(a[0]==="rw"?fixRw:fixAc)); else renderTbl(a[0],l2); refreshForm(); return; }
});
/* a new source of a cause clears the id recorded for the old one, and the card is redrawn with the right list of ids */
document.addEventListener("change",function(e){
 var el=e.target; if(!el||!el.closest) return;
 if(el.closest("#rwCards")&&el.getAttribute("data-k")==="how"){ var raw=formRaw().rw, i=Number(el.closest(".dm-card").getAttribute("data-row")); if(raw[i]){ raw[i].ref=""; raw[i].how=el.value; } renderCards("rw",raw.map(fixRw)); refreshForm(); var s=document.querySelector('#rwCards .dm-card[data-row="'+i+'"] [data-k="how"]'); if(s) s.focus(); }
 if(el.matches&&(el.matches('#rwCards [data-k="step"]')||el.matches('#acCards [data-k="row"]'))) el.setAttribute("data-cur",el.value);
 if(el.id==="f-pareto"){ var pc=document.getElementById("f-pcat"); if(pc){ pc.setAttribute("data-cur",""); pc.value=""; } }
 if(el.id==="pkHow"){ document.getElementById("pkRef").value=""; fillLists(); }
},true);

/* ---------- automatic audit of studies ---------- */
var CHECKS=["ref","team","scales","struct","rows","cover","human","high","sev","rerate","review","capa"];
function auditRecord(r){
 var R=rowsOf(r), A=acts(r), D=A.filter(function(a){ return a.st==="done"; }), lowered=A.filter(function(a){ var w=rowById(r,a.row); return w&&w.s&&a.ns&&a.ns<w.s; });
 return {
  ref:refOk(r),
  team:scopeOk(r),
  scales:anyRated(r)||isD(r.sc.date)?scalesOk(r):null,
  struct:structOk(r),
  rows:R.length?!incRows(r).length:null,
  cover:R.length?!uncovered(r).length:null,
  human:R.length?!humanRows(r).length:null,
  high:hiRows(r).length?!hiOpen(r).length:null,
  sev:lowered.length?!sevBads(r).length:null,
  rerate:D.length?!doneNotRe(r).length:null,
  review:(doneOk(r)||revs(r).length)?revOk(r):null,
  capa:capaNeed(r)?!!txt(r.capa):null
 };
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
/* a study counts as "high rows acted on" when it has analysis rows and every high-priority row has an owned action;
   "re-rated" when it has actions and every one is done and re-rated with evidence */
function hiActed(r){ return rowsOf(r).length>0&&!hiOpen(r).length; }
function allRe(r){ var A=acts(r); return A.length>0&&A.every(reRated); }
function counts(){
 var R=DB.records, c={n:R.length,hi:0,re:0,rows:0,hr:0,ho:0,human:0,ap:{H:0,M:0,L:0},src:{}};
 SRCS.forEach(function(s){ c.src[s]=0; });
 R.forEach(function(r){ var a=apCounts(r); if(hiActed(r)) c.hi++; if(allRe(r)) c.re++; c.rows+=rowsOf(r).length; c.hr+=hiRows(r).length; c.ho+=hiOpen(r).length; c.human+=humanRows(r).length;
  c.ap.H+=a.H; c.ap.M+=a.M; c.ap.L+=a.L; c.src[r.src]++; });
 return c;
}
function pct(a,n){ return n?Math.round(a/n*100)+"%":"—"; }
function allBefore(){ var o=[]; DB.records.forEach(function(r){ o=o.concat(beforePts(r)); }); return o; }
function renderDash(){
 var box=document.getElementById("dKpis"); if(!box) return;
 var c=counts(), au=auditSummary(), as=assessScore(), n=c.n, oi=openItems(), nr=c.ap.H+c.ap.M+c.ap.L;
 box.innerHTML=TBX.kpi(n,t("kTotal"))+TBX.kpi(pct(c.hi,n),t("kHigh"))+TBX.kpi(pct(c.re,n),t("kRe"))+TBX.kpi(c.rows,t("kRows"))+TBX.kpi(c.hr,t("kHrows"))+TBX.kpi(c.ho,t("kHopen"))+TBX.kpi(c.human,t("kHuman"))+TBX.kpi(oi.length,t("kOpen"))+TBX.kpi(au.rate===null?"—":au.rate+"%",t("kAud"))+TBX.kpi(as+"%",t("kAs"));
 var nd='<p class="pd-sub" style="color:var(--ink-soft)">'+esc(t("noData"))+'</p>';
 document.getElementById("dStage").innerHTML=n?TBX.dist(STAGES,n,function(s){ return DB.records.filter(function(r){ return stageOf(r)===s; }).length; },stageName,function(s){ return SCOL[s]; }):nd;
 document.getElementById("dAp").innerHTML=nr?TBX.dist(["H","M","L"],nr,function(k){ return c.ap[k]; },function(k){ return t("ap_"+k); },function(k){ return APCOL[k]; }):nd;
 document.getElementById("dSrc").innerHTML=n?TBX.dist(SRCS,n,function(k){ return c.src[k]; },function(k){ return t("src_"+k); },function(){ return "#1B2A4A"; }):nd;
 document.getElementById("dAssess").innerHTML=AGROUPS.map(function(g){ var p=assessScore(g); return TBX.bar(t("g_"+g),p+"%",p,GCOL[g]); }).join("")+'<p class="pd-sub" style="font-size:12.5px;color:var(--muted);margin:10px 0 0">'+esc(t("bandNote"))+'</p>';
 var dh=document.getElementById("dHeat"); if(dh) dh.innerHTML=heatSVG(allBefore(),{lang:L,W:chartW(),title:t("dHeatT")});
 document.getElementById("dOpen").innerHTML=oi.length?oi.map(function(x){ return '<li><b>'+esc(x.r.ref||x.r.id)+'</b>'+chip([x.r.id,"info"])+'<span>'+esc(x.s)+'</span></li>'; }).join(""):'<li>'+esc(n?t("noOpen"):t("noData"))+'</li>';
}

/* ---------- report and CSV ---------- */
function vs(v){ return v===null||v===undefined?"":String(v); }
function buildCSV(){
 var head=["id","ref","title","type","source","nonconformitySource","facilitator","processOwner","area","start","scope","dmaic","a3","rca","pareto","paretoCategory","capa","pdca","stage","team",
  "scalesAgreed","firstRating","scaleS","scaleO","scaleD","stepsFrom","steps","rows","highRows","highRowsWithoutAction","actions","reviews","lastChange","lastReview"];
 return TBX.csv(head,DB.records.map(function(r){
  var CD=codes(r), sc=function(k){ return r.sc[k].map(function(x,i){ return (i+1)+": "+x; }).join(" | "); };
  var rw=r.rows.map(function(w){ var a=rowAfter(r,w); return CD[w.id]+" ["+(CD[w.step]||"—")+"] "+w.fn+" / mode: "+w.mode+" / effect: "+w.eff+" / S"+vs(w.s)+" / cause: "+w.cause+(w.how!=="here"?" ("+w.how+" "+w.ref+")":"")+" / prevention: "+w.prev+" / O"+vs(w.o)+" / detection: "+w.det+" / D"+vs(w.d)+" / RPN "+vs(rowRpn(w))+" / AP "+(rowAp(w)||"—")+(a?" / after S"+a.s+" O"+a.o+" D"+a.d+" RPN "+rpn(a.s,a.o,a.d)+" AP "+apOf(a.s,a.o,a.d):"")+(w.oev?" / evidence: "+w.oev:""); }).join(" | ");
  var ac=r.acts.map(function(a){ return CD[a.id]+" → "+(CD[a.row]||"—")+" ["+a.kind+"] "+a.what+" — "+a.who+" by "+a.by+" — "+a.st+(a.done?" "+a.done:"")+(a.ns?" — new S"+a.ns+" O"+vs(a.no)+" D"+vs(a.nd):"")+(a.ev?" — "+a.ev:""); }).join(" | ");
  var rv=r.reviews.map(function(v){ return v.date+" — "+v.team+" — "+v.chg+" — "+v.rows; }).join(" | ");
  return [r.id,r.ref,r.title,r.type,r.src,r.nc?"yes":"no",r.facil,r.owner,r.area,r.start,r.scope,r.dmaic,r.a3,r.rca,r.pareto,r.pcat,r.capa,r.pdca,stageOf(r),r.team.map(function(x){ return x.n+(x.role?" ("+x.role+")":""); }).join(" | "),
   r.sc.date,r.rated,sc("S"),sc("O"),sc("D"),r.stepsFrom,steps(r).map(function(p){ return CD[p.id]+" "+p.t; }).join(" → "),rw,hiRows(r).map(function(w){ return CD[w.id]; }).join(" "),hiOpen(r).map(function(w){ return CD[w.id]; }).join(" "),ac,rv,lastChange(r),lastRev(r)]; }));
}
function recReport(r){
 var CD=codes(r), A=auditRecord(r), W=560;
 var row=function(k,v){ return '<tr><th>'+esc(k)+'</th><td>'+esc(v===null||v===undefined||v===""?"—":v)+'</td></tr>'; };
 var mark=function(v){ return v===null?'<td class="na">—</td>':(v?'<td class="ok">✓</td>':'<td class="bad">✗</td>'); };
 var tbl=function(list,heads,cells){ return list.length?'<table><thead><tr>'+heads.map(function(h){ return '<th>'+esc(t(h))+'</th>'; }).join("")+'</tr></thead><tbody>'+list.map(function(x){ return '<tr>'+cells(x).map(function(c){ return '<td>'+esc(c===""||c===null?"—":c)+'</td>'; }).join("")+'</tr>'; }).join("")+'</tbody></table>':'<p class="meta">—</p>'; };
 var scRows=[]; for(var i=9;i>=0;i--) scRows.push(i);
 return '<section class="an"><h3><span dir="ltr">'+esc(r.id)+'</span> · <span dir="ltr">'+esc(r.ref||"—")+'</span> — '+esc(r.title)+'</h3>'+
  '<p class="meta">'+esc(t("colStage"))+': <b>'+esc(stageName(stageOf(r)))+'</b> · '+esc(t("ty_"+r.type))+' · '+esc(t("src_"+r.src))+(r.dmaic?' · DMAIC <span dir="ltr">'+esc(r.dmaic)+'</span>':'')+(r.a3?' · A3 <span dir="ltr">'+esc(r.a3)+'</span>':'')+(r.rca?' · RCA <span dir="ltr">'+esc(r.rca)+'</span>':'')+(r.pareto?' · Pareto <span dir="ltr">'+esc(r.pareto+(r.pcat?" / "+r.pcat:""))+'</span>':'')+(r.capa?' · CAPA <span dir="ltr">'+esc(r.capa)+'</span>':'')+(r.pdca?' · PDCA <span dir="ltr">'+esc(r.pdca)+'</span>':'')+'</p>'+
  mapHTML(r)+
  '<table><tbody>'+row(t("f_facil"),r.facil)+row(t("f_owner"),r.owner)+row(t("f_start"),r.start)+row(t("f_area"),r.area)+row(t("f_scope"),r.scope)+row(t("sHdrT"),r.team.map(function(x){ return x.n+(x.role?" ("+x.role+")":""); }).join("، "))+'</tbody></table>'+
  '<h4>'+esc(t("rpScales"))+'</h4><p class="meta">'+esc(t("f_sdate"))+': <bdi dir="ltr">'+esc(r.sc.date||"—")+'</bdi> · '+esc(t("f_rated"))+': <bdi dir="ltr">'+esc(r.rated||"—")+'</bdi></p>'+
  '<table class="sc"><thead><tr><th>'+esc(t("scLv"))+'</th><th>'+esc(t("scS"))+'</th><th>'+esc(t("scO"))+'</th><th>'+esc(t("scD"))+'</th></tr></thead><tbody>'+scRows.map(function(i){ return '<tr><td class="lv">'+(i+1)+'</td><td>'+esc(r.sc.S[i]||"—")+'</td><td>'+esc(r.sc.O[i]||"—")+'</td><td>'+esc(r.sc.D[i]||"—")+'</td></tr>'; }).join("")+'</tbody></table>'+
  '<h4>'+esc(t("rpSteps"))+'</h4>'+(steps(r).length?'<ol class="stp">'+steps(r).map(function(p){ return '<li>'+esc(p.t)+'</li>'; }).join("")+'</ol>':'<p class="meta">—</p>')+(r.stepsFrom?'<p class="meta">'+esc(t("stpFrom",{id:r.stepsFrom}))+'</p>':'')+
  '<h4>'+esc(t("rpRows"))+'</h4>'+tbl(r.rows,["rwStep","rwFn","rwMode","rwEff","rwS","rwCause","rwPrev","rwO","rwDet","rwD","rpnL","apL"],function(w){ return [CD[w.step]||"",w.fn,w.mode+(humanMode(w.mode)?" ⚠":""),w.eff,vs(w.s),w.cause+(personOnly(w.cause)?" ⚠":"")+(w.how!=="here"&&w.ref?" ("+t("how_"+w.how)+" "+w.ref+")":""),w.prev,vs(w.o),w.det,vs(w.d),vs(rowRpn(w)),rowAp(w)?t("ap_"+rowAp(w)):""]; }).replace('<table>','<table class="rows">')+
  '<div class="charts"><figure><figcaption>'+esc(t("chHeatB"))+'</figcaption>'+heatSVG(beforePts(r),{lang:L,W:340,title:t("chHeatB")})+'</figure><figure><figcaption>'+esc(t("chHeatA"))+'</figcaption>'+heatSVG(afterPts(r),{lang:L,W:340,title:t("chHeatA"),empty:t("chAfterEmpty")})+'</figure></div>'+
  '<div class="chart"><p class="meta">'+esc(t("chBar"))+'</p>'+barSVG(r,{lang:L,W:W})+'</div>'+
  '<h4>'+esc(t("rpActs"))+'</h4>'+tbl(r.acts,["acRow","acWhat","acKind","acWho","acBy","acSt","acDone","acNs","acNo","acNd","rpnL","acEv"],function(a){ var w=rowById(r,a.row), n=(a.ns&&a.no&&a.nd)?rpn(a.ns,a.no,a.nd):null; return [CD[a.row]||"",a.what,t("kd_"+a.kind),a.who,a.by,t("as_"+a.st),a.done,vs(a.ns)+(sevBad(r,a)?" ⚠":""),vs(a.no),vs(a.nd),(w&&rowRpn(w)!==null?rowRpn(w):"—")+(n!==null?" → "+n+" ("+t("ap_"+apOf(a.ns,a.no,a.nd))+")":""),a.ev]; })+
  '<h4>'+esc(t("rpRev"))+'</h4>'+tbl(r.reviews,["rvDate","rvTeam","rvChg","rvRows"],function(v){ return [v.date,v.team,v.chg,v.rows]; })+
  '<h4>'+esc(t("rpAu"))+'</h4><table><thead><tr>'+CHECKS.map(function(k){ return '<th>'+esc(t("c_"+k))+'</th>'; }).join("")+'</tr></thead><tbody><tr>'+CHECKS.map(function(k){ return mark(A[k]); }).join("")+'</tr></tbody></table></section>';
}
var MAP_CSS=".dm-map{list-style:none;margin:8px 0 12px;padding:0;display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:6px}.dm-map li{display:flex;gap:6px;align-items:center;border:1px solid #DCE4EE;border-radius:10px;padding:6px 7px;background:#fff;min-width:0}.dm-map li i{font-style:normal;flex:none;display:inline-grid;place-items:center;width:24px;height:24px;border-radius:50%;background:#EEF1F6;color:#4B5874;font-family:Georgia,serif;font-weight:700;font-size:12px}.dm-map li span{display:flex;flex-direction:column;min-width:0}.dm-map li b{font-size:12px}.dm-map li small{font-size:10.5px;color:#4B5874}.dm-map li.done i,.dm-map li.cur i{background:var(--pc);color:#fff}.dm-map li.done{border-color:var(--pc)}.dm-map li.cur{border:2px solid var(--pc)}.dm-map li.todo{opacity:.72}@media (max-width:760px){.dm-map{grid-template-columns:1fr}}";
function buildReportHTML(){
 var c=counts(), au=auditSummary(), as=assessScore(), d=today(), n=c.n, A=TBX.audit(DB.records,auditRecord,CHECKS), oi=openItems();
 var mark=function(v){ return v===null?'<td class="na">—</td>':(v?'<td class="ok">✓</td>':'<td class="bad">✗</td>'); };
 var grpRows=AGROUPS.map(function(g){ return '<tr><td>'+esc(t("g_"+g))+' — '+g+'</td><td>'+assessScore(g)+'%</td></tr>'; }).join("");
 var auRows=A.rows.map(function(x){ return '<tr><td dir="ltr">'+esc(x.r.id)+'</td>'+CHECKS.map(function(k){ return mark(x.res[k]); }).join("")+'</tr>'; }).join("");
 var body='<div class="cover"><p class="kick">Continual Improvement Academy · CIA Toolbox</p><h1>FMEA Studies / دراسات تحليل أنماط الفشل وآثارها</h1><p class="sub">'+esc(t("rpCover"))+'</p>'+
  '<p class="meta">'+esc(t("prep"))+': <bdi><strong>مدثر سلامه</strong></bdi> · <bdi dir="ltr">'+esc(d)+'</bdi> · <bdi>'+esc(t("kTotal"))+': '+n+'</bdi></p></div>'+
  '<h2>Summary / الملخص</h2><div class="k">'+
   '<div><b>'+n+'</b>'+esc(t("kTotal"))+'</div><div><b>'+pct(c.hi,n)+'</b>'+esc(t("kHigh"))+'</div><div><b>'+pct(c.re,n)+'</b>'+esc(t("kRe"))+'</div><div><b>'+c.rows+'</b>'+esc(t("kRows"))+'</div><div><b>'+c.hr+'</b>'+esc(t("kHrows"))+'</div><div><b>'+c.ho+'</b>'+esc(t("kHopen"))+'</div><div><b>'+c.human+'</b>'+esc(t("kHuman"))+'</div><div><b>'+oi.length+'</b>'+esc(t("kOpen"))+'</div><div><b>'+(au.rate===null?"—":au.rate+"%")+'</b>'+esc(t("kAud"))+'</div><div><b>'+as+'%</b>'+esc(t("kAs"))+'</div></div>'+
  '<p class="meta">'+esc(t("apRule"))+'</p>'+
  '<h2>'+esc(t("rpStudies"))+' / The studies</h2>'+(n?DB.records.map(recReport).join(""):'<p class="meta">'+esc(t("rpEmpty"))+'</p>')+
  '<h2>Audit results / نتائج التدقيق</h2>'+(n?'<p>'+esc(t("auPass"))+': '+(au.rate===null?"—":au.rate+"% ("+au.pass+"/"+au.applic+")")+'</p><table><thead><tr><th>ID</th>'+CHECKS.map(function(k){ return '<th>'+esc(t("c_"+k))+'</th>'; }).join("")+'</tr></thead><tbody>'+auRows+'</tbody></table>':'<p class="meta">—</p>')+
  '<h2>Open items / بنود تحتاج متابعة</h2>'+(oi.length?'<ul>'+oi.map(function(x){ return '<li><span dir="ltr">'+esc(x.r.id)+' · '+esc(x.r.ref||"—")+'</span> — '+esc(x.s)+'</li>'; }).join("")+'</ul>':'<p class="meta">'+esc(n?t("noOpen"):"—")+'</p>')+
  '<h2>Self-assessment / التقييم الذاتي</h2><table><thead><tr><th>Area / المحور</th><th>Score / النتيجة</th></tr></thead><tbody>'+grpRows+'<tr><td><b>'+esc(t("kAs"))+'</b></td><td><b>'+as+'%</b></td></tr></tbody></table><p class="meta">'+esc(t("bandNote"))+'</p>'+
  '<footer>Prepared by / أعدّه: مدثر سلامه · FMEA is a method, not a requirement of any standard: scales are written before the rating and kept the same; severity is rated on the effect and falls only with a design or process change; the priority number is not a ranking to act on by itself — high severity is treated first; "human error" is a cause to design out; the study is a living document. Sources / المراجع: ISO 10009:2024 subclauses 7.3, 6.3, 7.1, 7.2 and 7.5, Annex A Table A.3 and Table C.1; ISO 9001:2026 introduction 0.3.2, clauses 6.1.2, 8.1, 8.3.4, 8.5.1 g), 8.5.6, 9.1.3, 10.1 and 10.2.1 and Annex A.6.1.2; ISO 9000:2026 4.2.6 and 4.2.7 (interpretive summaries, not the official text); IEC 60812, AIAG-VDA FMEA, ISO 31000 and ISO 31010 not verified (not uploaded) · Examples are illustrative.</footer>';
 return TBX.reportDoc(L,'FMEA Report — مدثر سلامه',body,MAP_CSS+'.ok{color:#2F7D4B;font-weight:700;text-align:center}.bad{color:#B42318;font-weight:700}td.bad{text-align:center}.na{color:#7A869E;text-align:center}ul{padding-inline-start:20px}h3{font-family:Georgia,serif;margin:22px 0 4px;font-size:17px}h4{margin:14px 0 4px;font-size:14.5px}.an{border-top:1px solid #DCE4EE;padding-top:6px;break-inside:auto}.an th{background:#F3F7FB;color:#1B2A4A}.an tbody th{width:30%}table.rows,table.sc{font-size:12px}table.rows th,table.sc th{width:auto}td.lv{text-align:center;font-family:Georgia,serif;font-weight:700}.stp{margin:4px 0;padding-inline-start:22px}.charts{display:flex;flex-wrap:wrap;gap:12px;margin:8px 0}.charts figure{margin:0}.charts figcaption{font-size:12.5px;color:#4B5874;margin-bottom:4px}.chart{margin:8px 0}.chart svg,.charts svg{max-width:100%;height:auto}.cover{border-bottom:4px solid #B8901E;padding:18px 0 14px;margin-bottom:8px}.cover h1{border:0;margin:6px 0}.cover .kick{color:#B8901E;font-weight:700;letter-spacing:.04em;margin:0}.cover .sub{font-size:18px;margin:4px 0}@media print{.an{page-break-before:always}}');
}
function stamp(){ return today(); }
function renderReport(){
 var prev=document.getElementById("rpPrev"); if(!prev) return;
 if(!DB.records.length){ prev.innerHTML='<p class="pd-sub" style="color:var(--ink-soft)">'+esc(t("rpEmpty"))+'</p>'; return; }
 var c=counts(), au=auditSummary();
 prev.innerHTML='<div class="pd-kpis">'+TBX.kpi(c.n,t("kTotal"))+TBX.kpi(pct(c.hi,c.n),t("kHigh"))+TBX.kpi(openItems().length,t("kOpen"))+TBX.kpi(au.rate===null?"—":au.rate+"%",t("kAud"))+'</div>';
}
document.getElementById("rpHtml").addEventListener("click",function(){
 var err=document.getElementById("rpErr"); err.textContent="";
 if(!DB.records.length && !Object.keys(DB.assess).length){ err.textContent=t("rpEmpty"); return; }
 TBX.download("FMEA-report-"+stamp()+".html","text/html;charset=utf-8",buildReportHTML());
});
document.getElementById("rpCsv").addEventListener("click",function(){ var err=document.getElementById("rpErr"); err.textContent=""; if(!DB.records.length){ err.textContent=t("rpEmpty"); return; } TBX.download("FMEA-studies-"+stamp()+".csv","text/csv;charset=utf-8",buildCSV()); });
document.getElementById("dCsv").addEventListener("click",function(){ if(!DB.records.length) return; TBX.download("FMEA-studies-"+stamp()+".csv","text/csv;charset=utf-8",buildCSV()); });

/* ---------- platform identity: academy logo and related tools ---------- */
var LOGO="__LOGO__";
function applyLogo(){ document.querySelectorAll("img[data-logo]").forEach(function(i){ if(i.src!==LOGO) i.src=LOGO; i.alt=t("logoAlt"); }); }
var RELATED=[["dmaic","DMAIC","./dmaic.html","#1B2A4A"],["a3","A3","./a3.html","#B8901E"],["rca","RCA","./rca.html","#1B2A4A"],["pareto","Pareto","./pareto.html","#C9821A"],["fish","Fishbone","./fishbone.html","#1E8C93"],["why5","5 Whys","./five-whys.html","#3563C9"],["capa","CAPA","./capa.html","#C2410C"],["pdca","PDCA","./pdca.html","#3C9A5F"],["iso10009","ISO 10009","./iso10009.html","#7B5BB8"]];
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

/* ---------- assistant: answers from the tool's own guide and your studies (rule-based, no AI service) ---------- */
var CONTACT_EMAIL="moddathersalama.eng@gmail.com";
var CB={
 ar:{fab:"اسأل عن FMEA",title:"مساعد FMEA",sub:"إجابات فورية من دليل الأداة ودراساتك",new:"محادثة جديدة",close:"إغلاق",ph:"اكتب سؤالك…",send:"إرسال",inL:"سؤالك",
  hello:"مرحباً. أجيب عن أسئلة تحليل أنماط الفشل وآثارها من دليل الأداة ومن دراساتك المحفوظة في هذا المتصفح. اختر سؤالاً أو اكتب سؤالك.",
  miss:"لم أجد إجابة جاهزة لهذا السؤال. جرّب أحد الأسئلة المقترحة، أو اسأل عن: رقم الأولوية، أو الفرق بين FMEA وRCA وDMAIC، أو المقاييس، أو الخطورة، أو الخطأ البشري، أو متى تُراجع الدراسة. وللاستشارة راسل المُعِد على البريد أدناه.",
  instant:"إجابة فورية",foot:"المساعد يعمل في متصفحك ولا يرسل بياناتك. للتواصل:",
  op0:"لا توجد بنود مفتوحة في دراساتك الآن.",st0:"لا توجد دراسات بعد. ابدأ من [[tab:tools]] أو حمّل المثال من [[tab:docs]]."},
 en:{fab:"Ask about FMEA",title:"FMEA assistant",sub:"Instant answers from the tool's guide and your studies",new:"New chat",close:"Close",ph:"Type your question…",send:"Send",inL:"Your question",
  hello:"Hello. I answer questions on failure mode and effects analysis from the tool's guide and from your studies saved in this browser. Pick a question or type your own.",
  miss:"I have no ready answer for that. Try one of the suggested questions, or ask about the priority number, FMEA against RCA and DMAIC, the scales, severity, human error, or when to review the study. For advice, email the author at the address below.",
  instant:"Instant answer",foot:"The assistant runs in your browser and sends no data. Contact:",
  op0:"No open items in your studies right now.",st0:"No studies yet. Start from the [[tab:tools]] or load the example in [[tab:docs]]."}
};
var KB=[
 {id:"rpn",k:["rpn","رقم الأولوية","رقم الاولوية","priority number","يكفي","enough","ترتيب","rank","s×o×d","s x o x d"],q:{ar:"هل يكفي رقم الأولوية لتقرير ما نعالجه؟",en:"Is the RPN enough to decide what to fix?"},
  a:{ar:"لا. **رقم الأولوية (الخطورة × الحدوث × الكشف) يخفي الخطورة الكبيرة**: صف خطورته 10 وحدوثه 2 وكشفه 5 رقمه 100، وصف خطورته 6 وحدوثه 6 وكشفه 7 رقمه 252؛ والأول قد يقتل والثاني يؤخر. لذلك تعالج الأداة **الخطورة العالية أولاً** بقاعدة مكتوبة: الخطورة 9 أو 10 «عالية» دائماً، ثم الخطورة × الحدوث، ثم الكشف. وهذا ما في مثال الرافعة البرجية: نمط «انزلاق الحزمة» عولج أولاً مهما كان رقمه. ويذكر ISO 10009 البند 7.3 أن الأولوية لخفض الحدوث وإزالة أنماط الفشل عالية الخطورة بالتصميم ما أمكن. التفاصيل في [[tab:explain-std]].",
   en:"No. **The risk priority number (severity × occurrence × detection) hides big severities**: a row with severity 10, occurrence 2 and detection 5 scores 100, while severity 6, occurrence 6 and detection 7 scores 252; the first can kill, the second causes a delay. So the tool treats **high severity first** with a written rule: severity 9 or 10 is always \"high\", then severity × occurrence, then detection. That is the tower-crane example: \"bundle slips from the sling\" was acted on first whatever its number. ISO 10009 subclause 7.3 puts the priority on reducing occurrence and designing out high-severity failure modes where possible. Details in the [[tab:explain-std]]."}},
 {id:"which",k:["rca","dmaic","أيها","ايها","أيهما","ايهما","الفرق","difference","which","versus","vs","بدل"],q:{ar:"FMEA أم RCA أم DMAIC: أيها أستخدم؟",en:"FMEA, RCA or DMAIC — which one?"},
  a:{ar:"هي ليست بدائل. **FMEA نظرة إلى الأمام**: كيف يمكن أن تفشل العملية قبل أن تفشل. و**RCA نظرة إلى الخلف**: لماذا فشلت فعلاً. و**DMAIC مشروع** لمشكلة قائمة سببها غير معروف وعمليتها قابلة للقياس. وتعمل معاً: يبدأ FMEA من خطوات SIPOC مشروع DMAIC وأسبابه المثبتة، أو من الفشل الذي حققت فيه RCA وأسبابه الجذرية، ثم تذهب الإجراءات التي تحتاج مشروعاً إلى DMAIC أو A3، وتذهب حالة عدم المطابقة إلى CAPA. والدراسة تُراجع بعد كل فشل جديد.",
   en:"They are not alternatives. **FMEA looks ahead**: how the process could fail before it fails. **RCA looks back**: why it actually failed. **DMAIC is a project** for an existing problem whose cause is unknown and whose process can be measured. They work together: an FMEA starts from a DMAIC project's SIPOC steps and proved causes, or from the failure an RCA investigated and its root causes; the actions that need a project go to DMAIC or A3, and a nonconformity goes to CAPA. The study is reviewed after each new failure."}},
 {id:"scales",k:["مقياس","المقاييس","مقاييس","scale","scales","درجة","درجات","criteria","معيار"],q:{ar:"لماذا تُكتب المقاييس قبل التقييم؟",en:"Why write the scales before the rating?"},
  a:{ar:"لأن **المقياس الذي يُكتب بعد التقييم يُفصَّل على النتيجة**. ويطلب ISO 10009 البند 7.3 معياراً واضحاً لكل درجة، ولا حافز لخفض الدرجات تجنباً للإجراء. لذلك تطلب الأداة معنى مكتوباً لكل درجة من 1 إلى 10 للخطورة والحدوث والكشف، وتاريخ اعتماد لا يتأخر عن أول تقييم، وتنبّه إذا تأخر. المقاييس الافتراضية في الأداة صياغتها هي، فعدّلها مع الفريق لتناسب عمليتكم قبل اعتمادها.",
   en:"Because **a scale written after the rating is fitted to the result**. ISO 10009 subclause 7.3 asks for clear criteria for each point of the scale, and for nobody to gain by scoring low to avoid action. So the tool asks for a written meaning for each level from 1 to 10 for severity, occurrence and detection, and a date agreed no later than the first rating, and it warns when it is later. The default scales are the tool's own wording: edit them with the team to fit your process before agreeing them."}},
 {id:"sev",k:["خطورة","الخطورة","severity","تخفيض","lower","reduce","تنخفض"],q:{ar:"هل يمكن خفض الخطورة بإضافة فحص؟",en:"Can a new check lower the severity?"},
  a:{ar:"لا. **الخطورة تُقيَّم على الأثر**، والفحص لا يغير أثر الفشل إذا وقع؛ هو يحسن الكشف. ولا تنخفض الخطورة إلا **بتغيير في التصميم أو العملية** يزيل الأثر أو يخففه. ويقول ISO 10009 البند 7.3 إن الخطورة لا تنخفض، بل تُزال بالتصميم. لذلك تنبّه الأداة إذا خُفضت الخطورة في إعادة التقييم ونوع الإجراء «ضابط منع» أو «ضابط كشف». في مثال الرافعة: حبال الدليل جعلت يد الرافع بعيدة عن الحمولة، فانخفضت الخطورة من 8 إلى 6 لأن العملية تغيرت.",
   en:"No. **Severity is rated on the effect**, and a check does not change the effect of a failure if it happens; it improves detection. Severity falls only with **a design or process change** that removes or reduces the effect. ISO 10009 subclause 7.3 says severity cannot be reduced; it can only be designed out. So the tool warns when severity is lowered in a re-rating while the action is a prevention or a detection control. In the crane example, tag lines kept the rigger's hands away from the load, so severity fell from 8 to 6 because the process changed."}},
 {id:"human",k:["خطأ بشري","human error","بشري","عدم انتباه","operator","إهمال","attention"],q:{ar:"ماذا أفعل إذا كان السبب «خطأ بشري»؟",en:"What if the cause is \"human error\"?"},
  a:{ar:"«الخطأ البشري» **سبب يُزال بالتصميم، وليس نمط فشل ولا اسماً يُلام**. يطلب البند 8.5.1 ز) من ISO 9001:2026 تطبيق إجراءات لمنع الخطأ البشري. فاسأل: لماذا كان الخطأ ممكناً؟ ما الذي في العملية سمح به؟ ثم صمم ضابطاً يمنعه أو يكشفه (منع الخطأ، قائمة فحص، حد آلي). وتنبّه الأداة عندما يُكتب نمط الفشل «خطأ بشري» أو يشير السبب إلى شخص فقط، ولا تكتمل مرحلة التحليل قبل إعادة الصياغة.",
   en:"\"Human error\" is **a cause to design out, not a failure mode and not a name to blame**. ISO 9001:2026 clause 8.5.1 g) asks for actions to prevent human error. So ask: why was the error possible? What in the process allowed it? Then design a control that prevents or detects it (error-proofing, a checklist, an automatic limit). The tool flags a failure mode written as \"human error\" or a cause that names a person only, and the analysis stage is not complete until it is rewritten."}},
 {id:"live",k:["وثيقة حية","living","مراجعة","review","تحديث","update","متى أراجع","when"],q:{ar:"متى تُراجع دراسة FMEA؟",en:"When is an FMEA study reviewed?"},
  a:{ar:"FMEA **وثيقة حية**: تُراجع عند تغيير العملية (ضبط التغييرات 8.5.6)، وبعد كل حالة عدم مطابقة (10.2؛ وتطلب 10.2.1 ب) 3) تحديد ما إذا كانت حالات مماثلة قد توجد أو قد تحدث)، وبعد ملاحظة التدقيق، وعند ظهور مشكلة غير متوقعة كما يذكر ISO 10009 البند 7.3. ويذكر البند 6.3 منه أن مخططات التدفق وFMEA وخطط الضبط تُراجع عند حدوث عدم مطابقة. وفي الأداة: تكتمل الدراسة بمراجعة مؤرخة بعد آخر تغيير فيها.",
   en:"FMEA is **a living document**: it is reviewed when the process changes (control of changes 8.5.6), after each nonconformity (10.2; 10.2.1 b) 3) asks whether similar nonconformities exist or could occur), after an audit finding, and when an unexpected issue arises, as ISO 10009 subclause 7.3 says. Its subclause 6.3 says flows, FMEA and control plans are reviewed when nonconformities occur. In the tool, a study is complete with a dated review after its last change."}},
 {id:"open",dyn:"open",k:["مفتوح","مفتوحة","متابعة","open items","follow"],q:{ar:"ما البنود المفتوحة في دراساتي؟",en:"What is still open in my studies?"}},
 {id:"status",dyn:"status",k:["وضع","حالة","ملخص","status","summary","where do we stand"],q:{ar:"ما وضع دراساتي الآن؟",en:"Where do my studies stand?"}}
];
var CB_SUG=["rpn","which","scales","sev","status"];
function kbDyn(id){
 var u=CB[L]||CB.ar;
 if(id==="open"){ var O=openItems(); if(!O.length) return u.op0+"\n\n[[tab:dash]]"; return O.map(function(x){ return "- **"+(x.r.ref||x.r.id)+"** — "+x.s; }).join("\n")+"\n\n[[tab:docs]] · [[tab:dash]]"; }
 if(id==="status"){ var c=counts(); if(!c.n) return u.st0; return "- "+t("kTotal")+": **"+c.n+"**\n- "+t("kHrows")+": **"+c.hr+"**\n- "+t("kHopen")+": **"+c.ho+"**\n- "+t("kHigh")+": **"+c.hi+"**\n- "+t("kRe")+": **"+c.re+"**\n- "+t("kOpen")+": **"+openItems().length+"**\n- "+t("kAs")+": **"+assessScore()+"%**\n\n[[tab:dash]] · [[tab:audit]]"; }
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
window.addEventListener("storage",function(e){ if([PDCA_KEY,CAPA_KEY,PARETO_KEY,FISH_KEY,WHY5_KEY,RCA_KEY,A3_KEY,DM_KEY].indexOf(e.key)>=0){ renderHomeSt(); fillLists(); if(ST) stPreview(true); refreshForm(); } });
var rzT=null, rzW=chartW(); window.addEventListener("resize",function(){ clearTimeout(rzT); rzT=setTimeout(function(){ if(chartW()!==rzW){ rzW=chartW(); refreshForm(); renderDash(); } },150); });

/* ---------- boot ---------- */
/* a link from DMAIC or the ISO 10009 guide may ask to open a study (?open=ID); a request may also start one from a DMAIC project (?dmaic=ID),
   an RCA investigation (?rca=ID) or a Pareto category (?pareto=ID&cat=CAT); inside the hub the same request arrives as a one-time hint */
function navRequest(){
 var q={}; try{ var u=new URLSearchParams(location.search); if(u.get("open")) q.open=u.get("open"); if(u.get("dmaic")) q.dmaic=u.get("dmaic"); if(u.get("rca")) q.rca=u.get("rca"); if(u.get("pareto")){ q.pareto=u.get("pareto"); q.cat=u.get("cat")||""; } }catch(e){}
 try{ var h=JSON.parse(sessionStorage.getItem(NAV_KEY)||"null"); sessionStorage.removeItem(NAV_KEY); if(h&&typeof h==="object"){ if(h.open) q.open=String(h.open); if(h.dmaic) q.dmaic=String(h.dmaic); if(h.rca) q.rca=String(h.rca); if(h.pareto){ q.pareto=String(h.pareto); q.cat=String(h.cat||""); } } }catch(e){}
 return q;
}
applyLang();
(function(){
 var q=navRequest(), r=q.open?DB.records.filter(function(x){ return x.id===q.open; })[0]:null;
 if(r){ loadRecordIntoForm(r); go("tools"); return; }
 if(q.dmaic && prefillFromDm(q.dmaic)) return;
 if(q.rca && prefillFromRca(q.rca)) return;
 if(q.pareto && prefillFromPareto(q.pareto,q.cat)) return;
 go((location.hash||"#home").slice(1));
})();
