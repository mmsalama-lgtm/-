/* ===== Fishbone tool — host logic. Analyses and assessment are stored in this browser only (localStorage, wrapped in try/catch). =====
   Storage key "cia-fish:v1" (this tool only). Schema:
   { records: [ {
       id, title, ref, src: "capa"|"ncr"|"audit"|"cc"|"inc"|"kpi", capa (CAPA record id), pdca (PDCA cycle id), area,
       date (YYYY-MM-DD, analysis date), lead (facilitator),
       effect: {what, where, when, much}                       the effect at the head of the diagram, in four parts, from facts
       team:   [ {n, role, work: true|false} ]                 work = this person does the work being analysed
       set:    "6m"|"4s"|"8p"|"custom"                         category set chosen for this analysis (prompts, not a fixed list)
       bones:  [ {name, causes: [ CAUSE ] } ]                  up to 8 bones; each bone can be renamed
         CAUSE = {id, t, ev, st: "cand"|"sup"|"out", v: 0..9, sel: true|false,
                  ver: {how: "why5"|"data", w5 (5 Whys analysis id), note, res: ""|"conf"|"no"},
                  subs: [ {id, t, ev, st, v, sel, ver} ] }      one level of sub-causes (two levels in all)
                  st: candidate / supported by evidence / ruled out; v: votes or weight; sel: selected for verification (3 at most)
       root,                                                   root cause statement
       test:   ""|"yes"|"part"|"no"                            "if this cause is removed, does the effect stop?"
       similar: ""|"exist"|"could"|"none", similarNote,
       cms:    [ {t, owner} ]                                  countermeasures proposed (the action plan itself stays in CAPA)
       review: {by, date, note}                                review by someone outside the team
       created, updated } ],
     assess: { EF1..LK2: 0|1|2 } }
   Other tools' keys are only read, never written: "cia-capa:v1" (CAPA records: preview, prefill, names), "cia-why5:v1"
   (5 Whys analyses chosen to verify a selected cause) and "cia-pdca:v1" (PDCA cycle names). Opening a given analysis from CAPA
   uses the address (?open=, ?capa=) or, inside the hub, the sessionStorage hint "cia-nav:fishbone" that this tool reads once and
   removes; "Analyse with 5 Whys" sets the 5 Whys tool's own hint "cia-nav:five-whys" in the same way. Neither holds tool data. */
var LKEY="cia-lang", STORE="cia-fish:v1", CAPA_KEY="cia-capa:v1", WHY5_KEY="cia-why5:v1", PDCA_KEY="cia-pdca:v1", NAV_KEY="cia-nav:fishbone", WHY5_NAV="cia-nav:five-whys";
var L=(function(){ try{ return localStorage.getItem(LKEY)||"ar"; }catch(e){ return "ar"; } })();
var TABS=["home","explain-std","explain-cl","assess","tools","docs","audit","dash","report","ai"];
var TITLES={ar:"Fishbone | عظمة السمكة — تحليل السبب والنتيجة — مدثر سلامه",en:"Fishbone | Cause and effect analysis — مدثر سلامه"};
var STAGES=["effect","causes","selected","verified","reviewed"];
var SCOL={effect:"#C2410C",causes:"#3563C9",selected:"#B8901E",verified:"#1B2A4A",reviewed:"#3C9A5F"};
var SRCS=["capa","ncr","audit","cc","inc","kpi"];
var SETK=["6m","4s","8p","custom"];
var BCOL=["#3563C9","#C2410C","#1E8C93","#7B5BB8","#C9821A","#3C9A5F","#B42318","#1B2A4A"];
var MAXB=8, MAXSEL=3;
var DB=load();
var curTab="home";
var editing=null;   /* deep copy of the analysis open in the form: keeps created between saves */
var CP=null;        /* CAPA preview rows */
var VER={};         /* verification of each cause in the form, by cause id (kept when a cause is unselected and selected again) */
var selKey="";      /* the selected causes drawn in the verification section */

/* category sets: prompts the team starts from, renamed freely; canonical keys let the CAPA prefill place lines on the right bone */
var SETS={
 "6m":{k:["people","method","materials","machines","measurement","environment"]},
 "4s":{k:["surroundings","suppliers","systems","skills"]},
 "8p":{k:["product","price","place","promotion","people","process","physical","productivity"]},
 "custom":{k:["c1","c2","c3","c4"]}
};
var CAT={
 ar:{people:"الأفراد",method:"الطريقة",materials:"المواد",machines:"الآلات والمعدات",measurement:"القياس",environment:"البيئة",surroundings:"المحيط",suppliers:"الموردون",systems:"الأنظمة",skills:"المهارات",
  product:"المنتج",price:"السعر",place:"المكان",promotion:"الترويج",process:"العملية",physical:"الدليل المادي",productivity:"الإنتاجية والجودة",c1:"فئة 1",c2:"فئة 2",c3:"فئة 3",c4:"فئة 4"},
 en:{people:"People",method:"Method",materials:"Materials",machines:"Machines and equipment",measurement:"Measurement",environment:"Environment",surroundings:"Surroundings",suppliers:"Suppliers",systems:"Systems",skills:"Skills",
  product:"Product",price:"Price",place:"Place",promotion:"Promotion",process:"Process",physical:"Physical evidence",productivity:"Productivity and quality",c1:"Category 1",c2:"Category 2",c3:"Category 3",c4:"Category 4"}
};
/* other names a line in a CAPA cause analysis may start with */
var SYN={"المعدات":"machines","الآلات":"machines","المعدة":"machines","equipment":"machines","machines":"machines","machine":"machines","machinery":"machines","man":"people","manpower":"people","الأشخاص":"people","الافراد":"people",
 "المورد":"suppliers","supplier":"suppliers","الموردين":"suppliers","mother nature":"environment","milieu":"environment","materials":"materials","material":"materials","measurements":"measurement","methods":"method","الطرق":"method"};

var UI={
ar:{brand:"أكاديمية التحسين المستمر · مدثر سلامه",toolName:"أداة عظمة السمكة — تحليل السبب والنتيجة",sgLearn:"التعلّم",sgWork:"العمل",sgOut:"المخرجات",
 nHome:"الرئيسية",nStd:"دليل المنهجية",nCl:"دليل البنود",nAssess:"التقييم الذاتي",nTools:"تحليل عظمة السمكة",nDocs:"السجلات",nAudit:"التدقيق",nDash:"لوحة المؤشرات",nReport:"التقرير",nAi:"المساعد الذكي",soon:"قريباً",
 homeCode:"عرّف الأثر · ارسم الأسباب · ادعمها بالدليل · تحقّق من القليل الأرجح",homeH1:"عظمة السمكة — تحليل السبب والنتيجة",
 homeLede:"أداة تنظّم جلسة البحث عن الأسباب: أثر يُكتب من الوقائع في رأس السمكة، وفئات تفتح التفكير، وأسباب يُكتب بجانب كل منها دليلها وحالتها، ثم اختيار سببين أو ثلاثة هي الأرجح والتحقق منها بأداة لماذا الخمس أو بالبيانات قبل اعتماد السبب الجذري. كل تحليل يمكن أن يبدأ من سجل CAPA ويُعاد سببه الجذري إليه.",
 homeNote:"النسخة الحالية تحفظ التحليلات في متصفحك فقط. الحفظ على الخادم وتسجيل الدخول يُضافان في مرحلة المنصة المشتركة.",
 prep:"إعداد",authorName:"مدثر سلامه",cycleT:"ما الذي تستطيع فعله هنا",cycleS:"اقرأ دليل المنهجية، ثم قيّم طريقة تحليلكم للأسباب، ثم ابدأ أول تحليل من سجل CAPA أو من مشكلة جديدة.",
 tStd:"كيف تختار الفئات، وتدير الجلسة، وتكتب الأسباب وقائع لا لوماً، وتستبعد بالدليل، وتختار القليل الأرجح للتحقق.",tCl:"البنود التي تخدمها الطريقة في ISO 9001:2026، وأولها 10.2.1 ب) 2) و3): ملخص تفسيري ومثال وما يطلبه المدقق.",tAssess:"عشرة أسئلة تقيس ممارسة تحليل السبب والنتيجة لديكم، من تعريف الأثر حتى نشر الدرس.",
 tTools:"تحليل كامل لكل مشكلة: الأثر، والفريق، والفئات والأسباب بأدلتها، والرسم الحي، والأسباب المختارة والتحقق منها، والسبب الجذري، والمراجعة.",tDocs:"كل التحليلات بمرحلتها وتنبيهاتها، وبيانات المثال.",tAudit:"فحص آلي لكل تحليل: الأثر بأجزائه الأربعة، والدليل، والأسباب المختارة والتحقق منها، واختبار السبب، والمراجعة المستقلة.",
 tDash:"التحليلات المتحقق منها والمراجعة والمرتبطة بـ CAPA، والأسباب المستبعدة، والبنود المفتوحة، والتقييم الذاتي، في صفحة واحدة.",tReport:"تقرير HTML يرسم كل تحليل بمخطط عظمة السمكة وجدول الأسباب وأدلتها، وملف CSV.",tAi:"مساعد يقرأ المخطط ويقترح أسباباً لفئات فارغة. لم يُفعَّل بعد.",
 foot:"المراجع: ISO 9001:2026 البنود 7.1.6 و7.2 و9.1.3 و10.1 و10.2 والملحق A.10.2، ومصطلحات ISO 9000:2026 (ملخصات تفسيرية، وليست النص الرسمي). «عظمة السمكة» طريقة عمل وليست متطلباً في أي مواصفة. الأمثلة توضيحية وليست بيانات حقيقية.",
 heroTag:"أداة منهجية · تخدم ISO 9001:2026 البند 10.2.1 ب)",langSw:"English",langSwA:"Switch to English",logoAlt:"أكاديمية التحسين المستمر — مدثر سلامه",
 related:"أدوات مرتبطة في الأكاديمية",rel_capa:"الإجراءات التصحيحية",rel_why5:"لماذا الخمس — تحليل السبب الجذري",rel_pdca:"دورة التحسين المستمر",rel_aud:"مركز التدقيق والتحسين الذكي",
 termT:"هل «عظمة السمكة» متطلب في ISO 9001:2026؟",
 termP1:"لا. مخطط عظمة السمكة (إيشيكاوا، أو مخطط السبب والنتيجة) طريقة لتنظيم الأسباب المحتملة، وليس بنداً في أي مواصفة. المتطلب الذي يخدمه هو تحديد أسباب عدم المطابقة في البند 10.2.1 ب) 2) من ISO 9001:2026، ومعه التحقق من وجود حالات مشابهة أو احتمال حدوثها في 10.2.1 ب) 3). ويترك الملحق A.10.2 للمنشأة أن تحدد مدى التحقيق والطرق التي تستخدمها بحسب سياقها.",
 termP2:"والفئات (الأفراد، والطريقة، والمواد، والآلات والمعدات، والقياس، والبيئة في 6M، أو 4S و8P للخدمات) محفّزات للتفكير، وليست قائمة ثابتة: أعد تسميتها أو أضف غيرها بما يناسب عمليتك. والسبب على المخطط مرشّح حتى يسنده دليل؛ فالمخطط يبيّن أين تبحث، ثم تؤكد أداة لماذا الخمس أو البيانات السبب الجذري.",
 termIs:"ملخص تفسيري بصياغة مستقلة، وليس النص الرسمي. المصادر: ISO 9001:2026 البند 10.2.1 والملحق A.10.2، وISO 9000:2026 المصطلحات المذكورة والمبدآن 4.2.6 و4.2.7. التحقق: 2026-10-11.",
 defs:[["الأثر (رأس السمكة)","مصطلح في هذه الأداة","المشكلة كما وقعت: ماذا وأين ومتى وكم. في حالة عدم المطابقة هي «عدم استيفاء متطلب» (ISO 9000:2026 · 3.5.13).","#C2410C"],["الدليل الموضوعي","ISO 9000:2026 · 3.8.6","بيانات تدعم وجود شيء أو صحته. السبب لا ينتقل من «مرشّح» إلى «مدعوم» إلا بدليل من هذا النوع.","#3563C9"],["الإجراء التصحيحي","ISO 9000:2026 · 3.6.4","إزالة سبب عدم المطابقة ومنع تكرارها. التحليل يحدد السبب، والإجراء يُخطط له في CAPA.","#1B2A4A"],["السبب الجذري","غير معرَّف كمصطلح","لا تعرّف ISO 9000:2026 «السبب الجذري» مصطلحاً، وتذكر التحقق من السبب الجذري ضمن مبدأ التحسين (4.2.6). في هذه الأداة: السبب الذي إذا أُزيل توقف الأثر.","#3C9A5F"]],
 asT:"التقييم الذاتي لممارسة تحليل السبب والنتيجة",asS:"أجب عن كل سؤال بما يحدث فعلاً في تحليلاتكم. النتيجة تقيس الممارسة الحالية، وليست شهادة ولا حكماً على الأداء.",asReset:"مسح الإجابات",asSaved:"تم حفظ الإجابة",asAnswered:"أُجيب {n} من 10",
 band0:"يحتاج عملاً",band1:"في طور التطوير",band2:"راسخ",bandNote:"حدود داخلية للتقييم الذاتي من تصميم هذه الأداة، وليست معياراً رسمياً.",as0:"غير موجود",as1:"جزئي",as2:"موجود ومطبّق",
 g_EF:"الأثر والفريق",g_CS:"الفئات والأسباب",g_VR:"الاستبعاد والتحقق",g_LK:"الربط والتعلّم",
 tlT:"تحليل عظمة السمكة",tlS:"تحليل واحد لكل مشكلة. اكتب الأثر من الوقائع، واختر فئات تناسب العملية، واكتب الأسباب وقائع بأدلتها، ثم اختر ثلاثة أسباب على الأكثر وتحقق منها قبل اعتماد السبب الجذري. تتحدد المرحلة تلقائياً مما تملؤه، ويُرسم المخطط أثناء الكتابة.",
 save:"حفظ التحليل",newRec:"تحليل جديد",savedFail:"تعذّر الحفظ في هذا المتصفح. نزّل التقرير قبل إغلاق الصفحة.",cur:"المرحلة الحالية:",ok_rec:"تم حفظ التحليل",
 st_effect:"تعريف الأثر",st_causes:"رسم الأسباب",st_selected:"اختيار الأسباب",st_verified:"تحقق السبب الجذري",st_reviewed:"روجع التحليل",
 sEffT:"الأثر (رأس السمكة) · البند 10.2.1 ب) 1)",sEffS:"أربعة أجزاء من الوقائع لا من الآراء: ماذا حدث، وأين، ومتى، وكم.",
 sTeamT:"الفريق",sTeamS:"من حضر الجلسة ودوره. يحتاج الفريق شخصاً واحداً على الأقل ممن يؤدون العمل نفسه.",
 sCauseT:"الفئات والأسباب · البند 10.2.1 ب) 2)",sCauseS:"اختر مجموعة فئات أو أعد تسميتها. اكتب كل سبب واقعةً لا لوماً، ومعه دليله وحالته: مرشّح، أو مدعوم بالدليل، أو مستبعد. الأصوات أو الوزن تساعد على اختيار الأرجح.",
 sDiagT:"المخطط",sDiagS:"يُرسم مما كتبته في الفئات والأسباب. على الهاتف يظهر قائمة مرتبة بالفئات.",
 sSelT:"الأسباب المختارة والتحقق منها",sSelS:"ثلاثة أسباب على الأكثر تُختار من المخطط. لكل منها تحقق: تحليل «لماذا الخمس» مربوط، أو ملاحظة تحقق بالبيانات، ثم النتيجة.",
 sRootT:"السبب الجذري واختباره",sRootS:"اكتب السبب الجذري الذي أكده التحقق، ثم اختبره: إذا أُزيل هذا السبب، هل يتوقف الأثر؟",
 sSimT:"الحالات المشابهة · البند 10.2.1 ب) 3)",sSimS:"هل توجد الحالة نفسها في موقع أو عملية أخرى، أو قد تحدث؟",
 sCmT:"الإجراءات المقترحة",sCmS:"إجراءات تزيل السبب الجذري، لكل منها مالك. خطة الإجراء الكاملة بمواعيدها ومتابعتها تبقى في سجل CAPA.",
 sRevT:"المراجعة",sRevS:"يراجع التحليلَ شخصٌ من خارج الفريق ويؤرخ مراجعته.",
 f_title:"عنوان مختصر",f_ref:"رقم المرجع (CAPA أو NCR أو ملاحظة التدقيق)",f_src:"المصدر",f_capa:"سجل CAPA المرتبط",f_pdca:"دورة PDCA المرتبطة",f_area:"العملية أو الموقع",f_date:"تاريخ التحليل",f_lead:"ميسّر الجلسة",
 f_what:"ماذا حدث؟",f_where:"أين؟",f_when:"متى؟",f_much:"كم؟ (العدد أو النسبة أو الأثر)",f_set:"مجموعة الفئات",f_root:"السبب الجذري",f_test:"إذا أُزيل هذا السبب، هل يتوقف الأثر؟",f_similar:"حالات مشابهة",f_similarNote:"أين؟ وماذا فُعل؟",
 f_rby:"المراجِع (من خارج الفريق)",f_rdate:"تاريخ المراجعة",f_rnote:"ملاحظة المراجعة",
 set_6m:"6M — التصنيع والمقاولات",set_4s:"4S — الخدمات والعمليات المساندة",set_8p:"8P — التسويق والخدمات",set_custom:"فئات خاصة",
 setHint:"الفئات محفّزات للتفكير، لا قائمة ثابتة. تغيير المجموعة يعيد تسمية العظام بالترتيب، ولا يحذف أي سبب مكتوب.",setDone:"طُبّقت أسماء الفئات، وبقيت الأسباب المكتوبة على عظامها.",
 src_capa:"سجل CAPA",src_ncr:"تقرير عدم مطابقة (NCR)",src_audit:"ملاحظة تدقيق",src_cc:"شكوى عميل",src_inc:"حادث",src_kpi:"مؤشر أداء",
 ts_:"—",ts_yes:"نعم، يتوقف",ts_part:"جزئياً فقط",ts_no:"لا",
 sim_:"—",sim_none:"لا توجد",sim_exist:"توجد حالات مشابهة",sim_could:"قد تحدث في مكان آخر",
 cst_cand:"مرشّح",cst_sup:"مدعوم بالدليل",cst_out:"مستبعد",
 tmN:"الاسم",tmRole:"الدور",tmWork:"يؤدي العمل",tmAdd:"إضافة عضو",tmDel:"حذف العضو",tmNone:"لم يُضف أحد بعد.",
 bone:"العظمة {n}",boneName:"اسم الفئة",boneDel:"حذف الفئة",boneAdd:"إضافة فئة",boneMax:"الحد الأقصى ثماني فئات.",boneDelNo:"احذف أسباب هذه الفئة أولاً.",
 cT:"السبب (واقعة لا لوم)",cEv:"الدليل",cSt:"الحالة",cV:"الأصوات",cSel:"اختيار",cAdd:"إضافة سبب",cDel:"حذف السبب",subT:"سبب فرعي",subAdd:"إضافة سبب فرعي",subLbl:"أسباب فرعية لـ: {c}",cNone:"لا أسباب في هذه الفئة بعد.",
 selMax:"ثلاثة أسباب على الأكثر تذهب إلى التحقق. ألغِ اختيار سبب أولاً.",selOut:"السبب المستبعد لا يُختار للتحقق.",selNone:"لم يُختر أي سبب بعد. اختر من الفئات أعلاه السبب أو الأسباب الأرجح (ثلاثة على الأكثر).",
 vHow:"طريقة التحقق",vHow_why5:"تحليل لماذا الخمس",vHow_data:"بيانات وملاحظة",vW5:"تحليل لماذا الخمس المربوط",vW5none:"— اختر تحليلاً —",vNote:"ملاحظة التحقق (البيانات)",vRes:"النتيجة",vRes_:"لم يُحسم",vRes_conf:"مؤكد بالدليل",vRes_no:"غير مؤكد",
 vGo5:"حلّل بأداة لماذا الخمس",vSave:"داخل المنصة تُفتح أداة لماذا الخمس مكان هذه الأداة: احفظ التحليل أولاً.",vOpen5:"افتح في لماذا الخمس",vNo5:"لا توجد تحليلات «لماذا الخمس» في هذا المتصفح بعد. استخدم «حلّل بأداة لماذا الخمس» ثم ارجع واختر التحليل.",
 vPrev:"{id} · {st} · السبب الجذري: {root}",vPrevNo:"لم يُكتب السبب الجذري بعد",vMiss:"هذا التحليل غير موجود في أداة لماذا الخمس على هذا المتصفح.",vFrom:"{bone}",
 w5st_problem:"تعريف المشكلة",w5st_chain:"سلسلة لماذا",w5st_root:"السبب الجذري",w5st_tested:"اختُبر السبب",w5st_reviewed:"روجع التحليل",
 legSel:"سبب مختار للتحقق",legSup:"مدعوم بالدليل",legCand:"مرشّح",legOut:"مستبعد",effL:"الأثر",effEmpty:"اكتب الأثر لتظهر رأس السمكة.",noCauses:"لا أسباب بعد",
 personW:"سبب مختار أو السبب الجذري يشير إلى شخص فقط («خطأ بشري» أو «إهمال»). اسأل: ما الذي في العملية سمح بذلك؟ الطريقة، أو النموذج، أو التدريب، أو عبء العمل، أو التصميم. ثم أعد كتابته سبباً تستطيع المنشأة تغييره.",
 testW:"الاختبار لم يكتمل: إذا لم يتوقف الأثر بإزالة هذا السبب، فهناك سبب آخر. ارجع إلى المخطط واختر سبباً آخر للتحقق.",
 workW:"لا يوجد في الفريق من يؤدي العمل نفسه. أضف شخصاً واحداً على الأقل؛ فهو من يعرف ما يحدث فعلاً.",
 revW:"المراجِع من أعضاء الفريق. اختر شخصاً من خارجه.",
 cmT:"الإجراء المقترح",cmOwner:"المالك",cmAdd:"إضافة إجراء مقترح",cmDel:"حذف الإجراء",cmNone:"لا توجد إجراءات مقترحة بعد.",cmHint:"انقل هذه الإجراءات إلى خطة الإجراء في سجل CAPA لتُتابع بمواعيدها.",
 cpOpen:"افتح CAPA",pdOpen:"افتح PDCA",cpFound:"سجل CAPA: {t}",cpMiss:"لم يُعثر على هذا السجل في أداة CAPA على هذا المتصفح.",cpHint:"اكتب رقم سجل CAPA، مثل CA-EX-02، أو اختره من القائمة.",
 pdFound:"دورة PDCA: {t}",pdMiss:"لم يُعثر على هذه الدورة في أداة PDCA على هذا المتصفح.",pdHint:"اكتب رقم الدورة، مثل PD-EX-02، إن وُجدت.",
 cpT:"ابدأ من سجل CAPA (قراءة فقط)",cpS:"تقرأ الأداة سجلات CAPA المحفوظة في هذا المتصفح وتعرضها للمعاينة. اختر سجلاً لتعبئة المرجع والأثر في تحليل جديد، وتُنقل أسطر تحليل السبب المكتوبة بصيغة «الفئة: السبب» أسباباً مرشحة. لا يُكتب أي شيء في سجلات CAPA.",
 cpPrev:"اعرض سجلات CAPA",cpNone:"لا توجد سجلات CAPA محفوظة في هذا المتصفح. افتح أداة CAPA وسجّل عدم مطابقة أو حمّل مثالها أولاً.",cpEmpty:"أداة CAPA لا تحتوي سجلات بعد.",
 cpUse:"ابدأ تحليلاً من هذا السجل",cpUsed:"عُبّئ نموذج تحليل جديد من سجل CAPA {id}. راجع الأثر على الوقائع ثم احفظ. لم يُكتب أي شيء في CAPA.",cpUsedN:" نُقل {n} سبب مرشّح من تحليل السبب في السجل؛ أضف دليل كل منها.",
 cpColId:"سجل CAPA",cpColT:"المرجع والعنوان",cpColSt:"المرحلة في CAPA",cpColM:"الطريقة",cpColN:"تحليلات هنا",cpColA:"اختيار",
 cst_react:"التفاعل",cst_cause:"تحليل السبب",cst_action:"الإجراء",cst_verify:"التحقق من الفعالية",cst_closed:"مغلق",cst_reopened:"أعيد فتحه",cm_why5:"5 Whys",cm_fish:"Fishbone",cm_other:"طريقة أخرى",
 cpHome:"في أداة CAPA {n} سجلاً طريقته «Fishbone» ولا يوجد له تحليل هنا بعد.",cpGo:"اعرض سجلات CAPA",
 e_title:"أدخل عنواناً مختصراً للتحليل.",e_what:"اكتب الأثر (ماذا حدث) قبل الحفظ.",e_rdate:"تاريخ المراجعة لا يسبق تاريخ التحليل.",
 exT:"بيانات المثال",exS:"ثلاثة تحليلات توضيحية لشركة سعودية افتراضية (شركة الواحة للمقاولات)، كل منها مربوط بسجل CAPA في مثال أداة CAPA: أجهزة قياس تجاوزت موعد المعايرة (تحقق بالبيانات)، وخرسانة جاهزة مرفوضة (سببان مختاران تحققت منهما أداة لماذا الخمس W5-EX-03)، ومخططات ملغاة في الموقع ب (فئات 4S، وينتظر المراجعة)، مع إجابات للتقييم الذاتي. البيانات توضيحية وليست حقيقية، وتحميلها يستبدل كل بيانات هذه الأداة في متصفحك.",
 exLoad:"تحميل المثال",exClear:"مسح كل البيانات",exLoaded:"تم تحميل المثال: 3 تحليلات وإجابات التقييم الذاتي.",exCleared:"تم مسح كل بيانات الأداة من هذا المتصفح.",
 exConfirmClear:"سيحذف هذا كل تحليلات عظمة السمكة وإجابات التقييم الذاتي من هذا المتصفح، ولا يمكن التراجع عن ذلك.\n\nهل تريد المتابعة؟",
 dT:"تحليلات عظمة السمكة",dS:"كل تحليل بمرحلته وتنبيهاته. افتح التحليل لتعديله في «تحليل عظمة السمكة».",csv:"تصدير CSV",none:"لا توجد تحليلات بعد. ابدأ من «تحليل عظمة السمكة» أو حمّل المثال.",
 colRef:"المرجع والعنوان",colSrc:"المصدر",colStage:"المرحلة",colCauses:"الأسباب",colRoot:"السبب الجذري",colFlags:"تنبيهات",colAct:"إجراءات",open:"فتح",del:"حذف",delArm:"تأكيد الحذف",
 causesN:"{n} سبباً على {b} فئات · مستبعد {o} · مختار {s}",
 fl_unver:"لم يُتحقق منه: {n}",fl_notconf:"غير مؤكد: {n}",fl_noev:"مدعوم دون دليل: {n}",fl_person:"سبب يشير إلى شخص فقط",fl_noroot:"السبب الجذري لم يُكتب",fl_part:"الاختبار لم يكتمل",fl_wait:"ينتظر المراجعة",fl_work:"لا أحد ممن يؤدون العمل",fl_cm:"إجراء دون مالك",fl_rev:"المراجِع من الفريق",fl_few:"أقل من ثلاث فئات بأسباب",fl_nosel:"لم يُختر سبب بعد",fl_many:"أكثر من ثلاثة أسباب مختارة",
 auT:"التدقيق الآلي للتحليلات",auS:"هذه الفحوص تُطبَّق على كل تحليل وتُظهر الثغرات التي يلاحظها المدقق عادةً. الخانة «—» تعني أن الفحص لا ينطبق بعد على مرحلة التحليل.",
 auRec:"تحليلات مُدقّقة",auPass:"فحوص ناجحة",auFail:"تحليلات بها ثغرات",auOpen:"بنود مفتوحة",auEmpty:"لا توجد تحليلات لتدقيقها.",
 c_ref:"له مرجع",c_effect:"الأثر بأجزائه الأربعة",c_bones:"ثلاث فئات على الأقل بأسباب",c_ev:"دليل لكل سبب مدعوم",c_max3:"ثلاثة أسباب مختارة على الأكثر",c_ver:"كل سبب مختار متحقق منه",c_person:"السبب المختار ليس شخصاً فقط",c_test:"اختُبر السبب الجذري",c_sim:"نُظر في الحالات المشابهة",c_cm:"إجراء مقترح بمالك",c_rev:"مراجعة مستقلة مؤرخة",
 dashT:"لوحة المؤشرات",dashS:"أرقام تُحسب من التحليلات والتقييم في هذا المتصفح.",kTotal:"إجمالي التحليلات",kRev:"روجعت",kVer:"أسباب مختارة متحقق منها",kCapa:"مرتبطة بسجل CAPA",kCauses:"أسباب على المخططات",kOut:"أسباب استُبعدت بالدليل",kW5:"أسباب تحققت بأداة لماذا الخمس",kPerson:"سبب يشير إلى شخص",kOpen:"بنود مفتوحة",kAud:"نجاح التدقيق",kAs:"التقييم الذاتي",
 byStage:"توزيع المراحل",byCause:"حالة الأسباب على المخططات",byAssess:"التقييم الذاتي حسب المجموعة",openT:"بنود تحتاج متابعة",noData:"لا توجد بيانات بعد.",noOpen:"لا توجد بنود مفتوحة.",
 oi_nosel:"رُسمت الأسباب ولم يُختر سبب للتحقق",oi_unver:"{n} سبب مختار لم يُتحقق منه",oi_notconf:"{n} سبب مختار لم يؤكده التحقق",oi_noev:"{n} سبب مدعوم دون دليل مكتوب",oi_noroot:"السبب الجذري لم يُكتب أو لم يُختبر",oi_part:"الاختبار: إزالة السبب لا توقف الأثر كله",oi_wait:"ينتظر مراجعة من خارج الفريق",oi_person:"سبب مختار أو السبب الجذري يشير إلى شخص فقط",oi_work:"لا يوجد في الفريق من يؤدي العمل",oi_cm:"إجراء مقترح دون مالك",oi_rev:"المراجِع من أعضاء الفريق",oi_many:"أكثر من ثلاثة أسباب مختارة",
 rpT:"تقرير عظمة السمكة",rpS:"تقرير HTML يُنزَّل إلى جهازك ويُطبع أو يُحفظ PDF من المتصفح، يرسم كل تحليل بمخططه ويعرض جدول الأسباب بأدلتها. وCSV لتحليل البيانات في جدول.",rpHtml:"تنزيل تقرير HTML",rpNote:"التقرير يحمل اسم المُعِد «مدثر سلامه» ويتضمن الغلاف والملخص، وكل تحليل بمخططه وجدول الأسباب والأسباب المختارة وتحققها، ونتائج التدقيق، والبنود المفتوحة، والتقييم الذاتي.",rpPrev:"معاينة سريعة",rpEmpty:"لا توجد تحليلات للتصدير بعد.",
 rpCover:"تقرير تحليل السبب والنتيجة",rpBone:"الفئة",rpCause:"السبب",rpLvl:"المستوى",rpMain:"رئيسي",rpSub:"فرعي",rpSelT:"الأسباب المختارة والتحقق",rpHow:"التحقق",
 aiT:"المساعد الذكي — قيد البناء",aiS:"سيقرأ هذا المساعد المخطط ويقترح أسئلة لفئات بلا أسباب، ويشير إلى الأسباب المدعومة دون دليل. لن يعمل قبل تهيئة محرك المنصة المشتركة، ولن يُظهر نتائج مزيّفة.",
 aiList:["اقتراح أسئلة لفئات بلا أسباب","التنبيه إلى سبب مكتوب لوماً لشخص بدل وصف العملية","مقارنة المخطط بتحليلات سابقة لمشكلات مشابهة"],
 rFormHdr:"تحليل عظمة السمكة",yes:"نعم",no:"لا"},
en:{brand:"Continual Improvement Academy · مدثر سلامه",toolName:"Fishbone tool — Cause and effect analysis",sgLearn:"Learn",sgWork:"Work",sgOut:"Output",
 nHome:"Home",nStd:"Method guide",nCl:"Clause guide",nAssess:"Self-assessment",nTools:"Fishbone analysis",nDocs:"Records",nAudit:"Audit",nDash:"Dashboard",nReport:"Report",nAi:"AI Assistant",soon:"Soon",
 homeCode:"Define the effect · Map the causes · Back them with evidence · Verify the likely few",homeH1:"Fishbone — Cause and effect analysis",
 homeLede:"A tool that organises the search for causes: an effect written from facts at the head of the fish, categories that open up the thinking, causes each written with its evidence and status, then two or three of the most likely causes picked and verified with the 5 Whys tool or with data before the root cause is accepted. Each analysis can start from a CAPA record and send its root cause back to it.",
 homeNote:"This version keeps analyses in your browser only. Server storage and sign-in come with the shared platform phase.",
 prep:"Prepared by",authorName:"مدثر سلامه",cycleT:"What you can do here",cycleS:"Read the method guide, assess how you analyse causes today, then start your first analysis from a CAPA record or from a new problem.",
 tStd:"How to choose the categories, run the session, write causes as facts not blame, rule causes out with evidence and pick the likely few to verify.",tCl:"The ISO 9001:2026 clauses the method serves, starting with 10.2.1 b) 2) and 3): interpretive summary, example and what the auditor asks for.",tAssess:"Ten questions on your cause and effect practice, from defining the effect to sharing what was learned.",
 tTools:"One full analysis per problem: effect, team, categories and causes with evidence, the live diagram, the selected causes and their verification, the root cause and the review.",tDocs:"Every analysis with its stage and flags, and the example data.",tAudit:"Automatic check of each analysis: effect in four parts, evidence, selected causes and their verification, root cause test and independent review.",
 tDash:"Verified, reviewed and CAPA-linked analyses, causes ruled out, open items and the self-assessment on one page.",tReport:"HTML report that draws each analysis as its fishbone diagram with the cause table and evidence, and a CSV file.",tAi:"An assistant that reads the diagram and suggests causes for empty categories. Not active yet.",
 foot:"References: ISO 9001:2026 clauses 7.1.6, 7.2, 9.1.3, 10.1 and 10.2 and Annex A.10.2, and ISO 9000:2026 terms (interpretive summaries, not the official text). Fishbone is a working method, not a requirement of any standard. Examples are illustrative, not real data.",
 heroTag:"Method tool · Serves ISO 9001:2026 clause 10.2.1 b)",langSw:"العربية",langSwA:"التبديل إلى العربية",logoAlt:"Continual Improvement Academy — مدثر سلامه",
 related:"Related Academy tools",rel_capa:"Corrective action",rel_why5:"5 Whys — root cause analysis",rel_pdca:"Continual improvement cycle",rel_aud:"Smart audit & improvement center",
 termT:"Is Fishbone a requirement of ISO 9001:2026?",
 termP1:"No. The fishbone diagram (Ishikawa, or cause and effect diagram) is a way of organising possible causes, not a clause of any standard. The requirement it serves is determining the causes of the nonconformity in ISO 9001:2026 clause 10.2.1 b) 2), together with checking whether similar nonconformities exist or could occur in 10.2.1 b) 3). Annex A.10.2 leaves the organization to decide the extent of investigation and the methods it uses, based on its context.",
 termP2:"The categories (people, method, materials, machines and equipment, measurement and environment in the 6M, or 4S and 8P for services) are prompts, not a fixed list: rename them or add others to fit your process. A cause on the diagram is a candidate until evidence supports it; the diagram shows where to look, and the 5 Whys tool or data then confirms the root cause.",
 termIs:"Interpretive summary in independent wording, not the official text. Sources: ISO 9001:2026 clause 10.2.1 and Annex A.10.2, and ISO 9000:2026, the terms named here and principles 4.2.6 and 4.2.7. Verified: 2026-10-11.",
 defs:[["Effect (head of the fish)","A term in this tool","The problem as it happened: what, where, when and how much. For a nonconformity it is the “non-fulfilment of a requirement” (ISO 9000:2026 · 3.5.13).","#C2410C"],["Objective evidence","ISO 9000:2026 · 3.8.6","Data supporting the existence or truth of something. A cause moves from “candidate” to “supported” only with evidence of this kind.","#3563C9"],["Corrective action","ISO 9000:2026 · 3.6.4","Removing the cause of a nonconformity and preventing recurrence. The analysis finds the cause; the action is planned in CAPA.","#1B2A4A"],["Root cause","Not a defined term","ISO 9000:2026 does not define “root cause” as a term; it names root cause investigation under the improvement principle (4.2.6). In this tool: the cause that, once removed, stops the effect.","#3C9A5F"]],
 asT:"Self-assessment of your cause and effect practice",asS:"Answer each question with what actually happens in your analyses. The score measures current practice; it is not a certificate or a performance rating.",asReset:"Clear answers",asSaved:"Answer saved",asAnswered:"{n} of 10 answered",
 band0:"Needs work",band1:"Developing",band2:"Established",bandNote:"Internal bands for this self-assessment, designed in this tool; not an official scale.",as0:"Not in place",as1:"Partly",as2:"In place and applied",
 g_EF:"Effect and team",g_CS:"Categories and causes",g_VR:"Rule out and verify",g_LK:"Link and learn",
 tlT:"Fishbone analysis",tlS:"One analysis per problem. Write the effect from facts, choose categories that fit the process, write causes as facts with their evidence, then pick three causes at most and verify them before accepting the root cause. The stage is set automatically from what you fill in, and the diagram is drawn as you type.",
 save:"Save analysis",newRec:"New analysis",savedFail:"Could not save in this browser. Download the report before closing the page.",cur:"Current stage:",ok_rec:"Analysis saved",
 st_effect:"Effect defined",st_causes:"Causes mapped",st_selected:"Causes selected",st_verified:"Root cause verified",st_reviewed:"Reviewed",
 sEffT:"The effect (head of the fish) · clause 10.2.1 b) 1)",sEffS:"Four parts, from facts and not opinion: what happened, where, when and how much.",
 sTeamT:"Team",sTeamS:"Who took part and their role. The team needs at least one person who does the work itself.",
 sCauseT:"Categories and causes · clause 10.2.1 b) 2)",sCauseS:"Pick a category set or rename the bones. Write each cause as a fact, not blame, with its evidence and status: candidate, supported by evidence or ruled out. Votes or weight help pick the most likely ones.",
 sDiagT:"Diagram",sDiagS:"Drawn from what you wrote in the categories and causes. On a phone it shows as a list grouped by category.",
 sSelT:"Selected causes and their verification",sSelS:"Three causes at most are picked from the diagram. Each one is verified: a linked 5 Whys analysis, or a verification note with data, then the result.",
 sRootT:"Root cause and its test",sRootS:"Write the root cause the verification confirmed, then test it: if this cause is removed, does the effect stop?",
 sSimT:"Similar cases · clause 10.2.1 b) 3)",sSimS:"Does the same thing exist, or could it happen, at another site or in another process?",
 sCmT:"Countermeasures",sCmS:"Actions that remove the root cause, each with an owner. The full action plan with dates and follow-up stays in the CAPA record.",
 sRevT:"Review",sRevS:"Someone outside the team reviews the analysis and dates the review.",
 f_title:"Short title",f_ref:"Reference (CAPA, NCR or audit finding)",f_src:"Source",f_capa:"Linked CAPA record",f_pdca:"Linked PDCA cycle",f_area:"Process or site",f_date:"Analysis date",f_lead:"Facilitator",
 f_what:"What happened?",f_where:"Where?",f_when:"When?",f_much:"How much? (number, rate or effect)",f_set:"Category set",f_root:"Root cause",f_test:"If this cause is removed, does the effect stop?",f_similar:"Similar cases",f_similarNote:"Where, and what was done?",
 f_rby:"Reviewer (outside the team)",f_rdate:"Review date",f_rnote:"Review note",
 set_6m:"6M — manufacturing and construction",set_4s:"4S — services and support processes",set_8p:"8P — marketing and services",set_custom:"Custom categories",
 setHint:"Categories are prompts, not a fixed list. Changing the set renames the bones in order and never deletes a cause you wrote.",setDone:"Category names applied; the causes you wrote stayed on their bones.",
 src_capa:"CAPA record",src_ncr:"Nonconformity report (NCR)",src_audit:"Audit finding",src_cc:"Customer complaint",src_inc:"Incident",src_kpi:"KPI",
 ts_:"—",ts_yes:"Yes, it stops",ts_part:"Only partly",ts_no:"No",
 sim_:"—",sim_none:"None",sim_exist:"Similar cases exist",sim_could:"Could occur elsewhere",
 cst_cand:"Candidate",cst_sup:"Supported by evidence",cst_out:"Ruled out",
 tmN:"Name",tmRole:"Role",tmWork:"Does the work",tmAdd:"Add member",tmDel:"Remove member",tmNone:"No one added yet.",
 bone:"Bone {n}",boneName:"Category name",boneDel:"Remove category",boneAdd:"Add a category",boneMax:"Eight categories at most.",boneDelNo:"Remove this category's causes first.",
 cT:"Cause (a fact, not blame)",cEv:"Evidence",cSt:"Status",cV:"Votes",cSel:"Select",cAdd:"Add a cause",cDel:"Remove cause",subT:"Sub-cause",subAdd:"Add a sub-cause",subLbl:"Sub-causes of: {c}",cNone:"No causes in this category yet.",
 selMax:"Three causes at most go to verification. Unselect one first.",selOut:"A cause that was ruled out is not selected for verification.",selNone:"No cause selected yet. Pick the most likely cause or causes (three at most) in the categories above.",
 vHow:"Verification method",vHow_why5:"5 Whys analysis",vHow_data:"Data and a note",vW5:"Linked 5 Whys analysis",vW5none:"— choose an analysis —",vNote:"Verification note (data)",vRes:"Result",vRes_:"Not decided",vRes_conf:"Confirmed by evidence",vRes_no:"Not confirmed",
 vGo5:"Analyse with 5 Whys",vSave:"Inside the platform the 5 Whys tool opens in place of this one: save the analysis first.",vOpen5:"Open in 5 Whys",vNo5:"No 5 Whys analyses in this browser yet. Use “Analyse with 5 Whys”, then come back and choose the analysis.",
 vPrev:"{id} · {st} · Root cause: {root}",vPrevNo:"Root cause not written yet",vMiss:"This analysis is not in the 5 Whys tool in this browser.",vFrom:"{bone}",
 w5st_problem:"Problem defined",w5st_chain:"Chain of whys",w5st_root:"Root cause",w5st_tested:"Root cause tested",w5st_reviewed:"Reviewed",
 legSel:"Cause selected for verification",legSup:"Supported by evidence",legCand:"Candidate",legOut:"Ruled out",effL:"Effect",effEmpty:"Write the effect to draw the head of the fish.",noCauses:"No causes yet",
 personW:"A selected cause or the root cause points at a person only (“human error”, “negligence”). Ask what in the process allowed it: the method, the form, the training, the workload or the design. Then rewrite it as a cause the organization can change.",
 testW:"The test is not complete: if removing this cause does not stop the effect, another cause is at work. Go back to the diagram and select another cause to verify.",
 workW:"No one in the team does the work itself. Add at least one such person; they know what really happens.",
 revW:"The reviewer is a team member. Choose someone from outside the team.",
 cmT:"Proposed action",cmOwner:"Owner",cmAdd:"Add a countermeasure",cmDel:"Remove countermeasure",cmNone:"No countermeasures yet.",cmHint:"Carry these into the action plan of the CAPA record, where they are followed up with dates.",
 cpOpen:"Open CAPA",pdOpen:"Open PDCA",cpFound:"CAPA record: {t}",cpMiss:"This record was not found in the CAPA tool in this browser.",cpHint:"Type the CAPA record number, such as CA-EX-02, or pick it from the list.",
 pdFound:"PDCA cycle: {t}",pdMiss:"This cycle was not found in the PDCA tool in this browser.",pdHint:"Type the cycle number, such as PD-EX-02, if there is one.",
 cpT:"Start from a CAPA record (read-only)",cpS:"The tool reads the CAPA records saved in this browser and shows them for review. Pick one to fill the reference and the effect of a new analysis; lines of its cause analysis written as “Category: cause” come across as candidate causes. Nothing is written to the CAPA records.",
 cpPrev:"Show CAPA records",cpNone:"No CAPA records are saved in this browser. Open the CAPA tool and record a nonconformity, or load its example, first.",cpEmpty:"The CAPA tool has no records yet.",
 cpUse:"Start an analysis from this record",cpUsed:"A new analysis form was filled from CAPA record {id}. Check the effect against the facts, then save. Nothing was written to CAPA.",cpUsedN:" {n} candidate cause(s) came across from the record's cause analysis; add the evidence for each.",
 cpColId:"CAPA record",cpColT:"Reference and title",cpColSt:"Stage in CAPA",cpColM:"Method",cpColN:"Analyses here",cpColA:"Choice",
 cst_react:"Reaction",cst_cause:"Cause analysis",cst_action:"Action",cst_verify:"Effectiveness check",cst_closed:"Closed",cst_reopened:"Reopened",cm_why5:"5 Whys",cm_fish:"Fishbone",cm_other:"Other method",
 cpHome:"The CAPA tool has {n} record(s) whose method is Fishbone and no analysis here yet.",cpGo:"Show CAPA records",
 e_title:"Enter a short title for the analysis.",e_what:"Write the effect (what happened) before saving.",e_rdate:"The review date cannot be before the analysis date.",
 exT:"Example data",exS:"Three illustrative analyses for a fictitious Saudi company (Al-Waha Contracting), each linked to a record in the CAPA tool's example: measuring devices past their calibration date (verified with data), rejected ready-mix concrete (two selected causes verified by the 5 Whys analysis W5-EX-03), and superseded drawings on site B (4S categories, waiting for review), plus self-assessment answers. The data is illustrative, not real, and loading it replaces all of this tool's data in your browser.",
 exLoad:"Load example",exClear:"Clear all data",exLoaded:"Example loaded: 3 analyses and the self-assessment answers.",exCleared:"All of this tool's data was removed from this browser.",
 exConfirmClear:"This deletes every Fishbone analysis and the self-assessment answers from this browser, and it cannot be undone.\n\nDo you want to continue?",
 dT:"Fishbone analyses",dS:"Every analysis with its stage and flags. Open an analysis to edit it in the Fishbone analysis tab.",csv:"Export CSV",none:"No analyses yet. Start from the Fishbone analysis tab or load the example.",
 colRef:"Reference and title",colSrc:"Source",colStage:"Stage",colCauses:"Causes",colRoot:"Root cause",colFlags:"Flags",colAct:"Actions",open:"Open",del:"Delete",delArm:"Confirm delete",
 causesN:"{n} causes on {b} categories · ruled out {o} · selected {s}",
 fl_unver:"Not verified: {n}",fl_notconf:"Not confirmed: {n}",fl_noev:"Supported without evidence: {n}",fl_person:"A cause names a person only",fl_noroot:"Root cause not written",fl_part:"Test not complete",fl_wait:"Waiting for review",fl_work:"No one who does the work",fl_cm:"Countermeasure without owner",fl_rev:"Reviewer is in the team",fl_few:"Fewer than three categories with causes",fl_nosel:"No cause selected yet",fl_many:"More than three causes selected",
 auT:"Automatic audit of analyses",auS:"These checks run on every analysis and show the gaps an auditor usually finds. “—” means the check does not apply yet at the analysis's stage.",
 auRec:"Analyses audited",auPass:"Checks passed",auFail:"Analyses with gaps",auOpen:"Open items",auEmpty:"No analyses to audit yet.",
 c_ref:"Has reference",c_effect:"Effect in four parts",c_bones:"Three categories or more with causes",c_ev:"Evidence on each supported cause",c_max3:"Three selected causes at most",c_ver:"Every selected cause verified",c_person:"Selected cause is not a person alone",c_test:"Root cause tested",c_sim:"Similar cases considered",c_cm:"Countermeasure with owner",c_rev:"Independent dated review",
 dashT:"Dashboard",dashS:"Figures calculated from the analyses and the self-assessment in this browser.",kTotal:"Total analyses",kRev:"Reviewed",kVer:"Selected causes verified",kCapa:"Linked to a CAPA record",kCauses:"Causes on the diagrams",kOut:"Causes ruled out with evidence",kW5:"Causes verified with 5 Whys",kPerson:"A cause names a person",kOpen:"Open items",kAud:"Audit pass rate",kAs:"Self-assessment",
 byStage:"Stage distribution",byCause:"Status of the causes on the diagrams",byAssess:"Self-assessment by group",openT:"Items that need follow-up",noData:"No data yet.",noOpen:"No open items.",
 oi_nosel:"Causes mapped but none selected for verification",oi_unver:"{n} selected cause(s) not verified",oi_notconf:"{n} selected cause(s) not confirmed by the verification",oi_noev:"{n} supported cause(s) with no written evidence",oi_noroot:"Root cause not written or not tested",oi_part:"Test: removing the cause does not stop the whole effect",oi_wait:"Waiting for a review from outside the team",oi_person:"A selected cause or the root cause points at a person only",oi_work:"No one in the team does the work",oi_cm:"Countermeasure without an owner",oi_rev:"The reviewer is a team member",oi_many:"More than three causes selected",
 rpT:"Fishbone report",rpS:"HTML report downloaded to your device, which you can print or save as PDF from the browser; it draws each analysis as its diagram and shows the cause table with evidence. CSV for analysing the data in a spreadsheet.",rpHtml:"Download HTML report",rpNote:"The report carries the preparer's name “مدثر سلامه” and includes the cover and summary, each analysis with its diagram, cause table, selected causes and their verification, audit results, open items and the self-assessment.",rpPrev:"Quick preview",rpEmpty:"No analyses to export yet.",
 rpCover:"Cause and effect analysis report",rpBone:"Category",rpCause:"Cause",rpLvl:"Level",rpMain:"Main",rpSub:"Sub",rpSelT:"Selected causes and verification",rpHow:"Verification",
 aiT:"AI Assistant — under construction",aiS:"This assistant will read the diagram, suggest questions for categories with no causes, and point to supported causes with no evidence. It will not run before the shared platform engine is in place, and it will not show invented results.",
 aiList:["Suggest questions for categories with no causes","Point out a cause written as blame on a person instead of a description of the process","Compare the diagram with earlier analyses of similar problems"],
 rFormHdr:"Fishbone analysis",yes:"Yes",no:"No"}
};

function t(k,v){ var d=UI[L]||UI.ar; var s=(d[k]!==undefined)?d[k]:(UI.ar[k]!==undefined?UI.ar[k]:k); if(v){ for(var x in v){ s=String(s).split("{"+x+"}").join(v[x]); } } return s; }
function esc(s){ return TBX.esc(s); }
function today(){ return TBX.today(); }
function txt(v){ return TBX.txt(v); }
function obj(v){ return (v&&typeof v==="object"&&!Array.isArray(v))?v:{}; }
function str(v){ return (v==null||typeof v==="object")?"":String(v); }
function isD(s){ return /^\d{4}-\d{2}-\d{2}$/.test(String(s||"")); }
function short(s,n){ s=txt(s).replace(/\s+/g," "); n=n||90; return s.length>n?s.slice(0,n-1)+"…":s; }
function setName(k){ return t("set_"+k); }

/* ---------- store ---------- */
function blankVer(){ return {how:"data",w5:"",note:"",res:""}; }
function blankItem(id){ return {id:id||"",t:"",ev:"",st:"cand",v:0,sel:false,ver:blankVer(),subs:[]}; }
function setBones(k,lang){ var S=SETS[k]||SETS["6m"], C=CAT[lang||L]||CAT.ar; return S.k.map(function(x){ return {name:C[x],causes:[]}; }); }
function blank(){ return {id:"",title:"",ref:"",src:"capa",capa:"",pdca:"",area:"",date:"",lead:"",effect:{what:"",where:"",when:"",much:""},team:[],
 set:"6m",bones:setBones("6m"),root:"",test:"",similar:"",similarNote:"",cms:[],review:{by:"",date:"",note:""},created:"",updated:""}; }
function fixVer(v){ v=obj(v); return {how:v.how==="why5"?"why5":"data",w5:str(v.w5),note:str(v.note),res:["conf","no",""].indexOf(v.res)>=0?v.res:""}; }
function fixItem(c,lvl){
 c=obj(c);
 var o={id:str(c.id),t:str(c.t),ev:str(c.ev),st:["cand","sup","out"].indexOf(c.st)>=0?c.st:"cand",v:Math.max(0,Math.min(9,parseInt(c.v,10)||0)),sel:c.sel===true,ver:fixVer(c.ver)};
 if(!lvl) o.subs=(Array.isArray(c.subs)?c.subs:[]).filter(function(x){ return x&&typeof x==="object"; }).map(function(x){ return fixItem(x,1); });
 return o;
}
/* an analysis saved with missing or broken parts gets empty ones, so rendering never throws; every cause gets an id */
function fixRec(r){
 ["id","title","ref","src","capa","pdca","area","date","lead","root","test","similar","similarNote","created","updated","set"].forEach(function(k){ r[k]=str(r[k]); });
 if(SRCS.indexOf(r.src)<0) r.src="capa";
 if(SETK.indexOf(r.set)<0) r.set="custom";
 var e=obj(r.effect); ["what","where","when","much"].forEach(function(k){ e[k]=str(e[k]); }); r.effect=e;
 r.team=(Array.isArray(r.team)?r.team:[]).filter(function(m){ return m&&typeof m==="object"; }).map(function(m){ return {n:str(m.n),role:str(m.role),work:m.work===true}; });
 r.bones=(Array.isArray(r.bones)?r.bones:[]).filter(function(b){ return b&&typeof b==="object"; }).slice(0,MAXB).map(function(b){
  return {name:str(b.name),causes:(Array.isArray(b.causes)?b.causes:[]).filter(function(c){ return c&&typeof c==="object"; }).map(function(c){ return fixItem(c,0); })};
 });
 var used={}, n=0;
 eachItem(r,function(it){ var m=/^c(\d+)$/.exec(it.id); if(m&&!used[it.id]){ used[it.id]=1; n=Math.max(n,+m[1]); } else it.id=""; });
 eachItem(r,function(it){ if(!it.id){ n++; it.id="c"+n; used[it.id]=1; } });
 if(["yes","part","no",""].indexOf(r.test)<0) r.test="";
 if(["exist","could","none",""].indexOf(r.similar)<0) r.similar="";
 r.cms=(Array.isArray(r.cms)?r.cms:[]).filter(function(c){ return c&&typeof c==="object"; }).map(function(c){ return {t:str(c.t),owner:str(c.owner)}; });
 var rv=obj(r.review); r.review={by:str(rv.by),date:str(rv.date),note:str(rv.note)};
 return r;
}
function load(){ return TBX.load(STORE,function(v){ if(!Array.isArray(v.records)) v.records=[]; v.records=v.records.filter(function(r){ return r&&typeof r==="object"; }); v.records.forEach(fixRec); if(!v.assess||typeof v.assess!=="object") v.assess={}; return v; },function(){ return {records:[],assess:{}}; }); }
function persist(){ return TBX.save(STORE,DB); }

/* ---------- causes, stage, checks and flags ---------- */
function eachItem(r,fn){ (r.bones||[]).forEach(function(b,bi){ (b.causes||[]).forEach(function(c){ fn(c,bi,0,null); (c.subs||[]).forEach(function(s){ fn(s,bi,1,c); }); }); }); }
function items(r){ var o=[]; eachItem(r,function(it,bi,lvl,par){ if(txt(it.t)) o.push({it:it,b:bi,lvl:lvl,par:par}); }); return o; }
function selList(r){ return items(r).filter(function(x){ return x.it.sel && x.it.st!=="out"; }); }
function selRaw(r){ return items(r).filter(function(x){ return x.it.sel; }).length; }
function verified(it){ var v=it.ver||{}; return v.res==="conf" && ((v.how==="why5" && !!txt(v.w5)) || (v.how==="data" && !!txt(v.note))); }
function allVer(r){ var S=selList(r); return S.length>0 && S.every(function(x){ return verified(x.it); }); }
function bonesWith(r){ return r.bones.filter(function(b){ return b.causes.some(function(c){ return txt(c.t)||c.subs.some(function(s){ return txt(s.t); }); }); }).length; }
function effDone(r){ return ["what","where","when","much"].every(function(k){ return !!txt(r.effect[k]); }); }
function rootDone(r){ return !!txt(r.root) && r.test==="yes"; }
function stageOf(r){
 var S=selList(r);
 if(allVer(r) && rootDone(r) && txt(r.review.by) && isD(r.review.date)) return "reviewed";
 if(allVer(r) && rootDone(r)) return "verified";
 if(S.length) return "selected";
 if(items(r).length) return "causes";
 return "effect";
}
function stageName(s){ return t("st_"+s); }
function srcName(k){ return t("src_"+k); }
function atLeast(r,s){ return STAGES.indexOf(stageOf(r))>=STAGES.indexOf(s); }
var PERSON=/(خطأ\s*(بشري|العامل|الموظف|الفني|المشغل|السائق|الشخص)|إهمال|اهمال|تقصير|عدم\s*(انتباه|الانتباه|تركيز|التركيز)|سهو|لامبالاة|human\s*error|operator\s*error|worker\s*error|staff\s*error|employee\s*error|negligen|careless|inattent|not\s*paying\s*attention|lack\s*of\s*attention|complacen)/i;
function personOnly(s){ return PERSON.test(String(s||"")); }
function personAny(r){ return personOnly(r.root) || selList(r).some(function(x){ return personOnly(x.it.t); }); }
function hasWorker(r){ return r.team.some(function(m){ return m.work && txt(m.n); }); }
function names(r){ return r.team.map(function(m){ return txt(m.n).toLowerCase(); }).filter(Boolean); }
function revInTeam(r){ var b=txt(r.review.by).toLowerCase(); return !!b && names(r).indexOf(b)>=0; }
function cmNoOwner(r){ return r.cms.some(function(c){ return txt(c.t) && !txt(c.owner); }); }
function nUnver(r){ return selList(r).filter(function(x){ return !verified(x.it) && x.it.ver.res!=="no"; }).length; }
function nNotConf(r){ return selList(r).filter(function(x){ return x.it.ver.res==="no"; }).length; }
function nNoEv(r){ return items(r).filter(function(x){ return x.it.st==="sup" && !txt(x.it.ev); }).length; }
function cnt(r){ var c={all:0,sup:0,cand:0,out:0,sel:0,w5:0}; items(r).forEach(function(x){ c.all++; c[x.it.st]++; if(x.it.sel&&x.it.st!=="out"){ c.sel++; if(x.it.ver.how==="why5"&&txt(x.it.ver.w5)&&verified(x.it)) c.w5++; } }); return c; }
/* one list of what is still open in an analysis; flags (records) and open items (dashboard, report) read it */
function issues(r){
 var o=[], s=stageOf(r), nu=nUnver(r), nn=nNotConf(r), ne=nNoEv(r), S=selList(r);
 if(personAny(r)) o.push(["person","bad",{}]);
 if(nn) o.push(["notconf","bad",{n:nn}]);
 if(selRaw(r)>MAXSEL) o.push(["many","bad",{}]);
 if(ne) o.push(["noev","warn",{n:ne}]);
 if(s==="causes") o.push(["nosel","warn",{}]);
 if(nu) o.push(["unver","warn",{n:nu}]);
 if(s==="selected" && allVer(r)) o.push([r.test==="part"||r.test==="no"?"part":"noroot","warn",{}]);
 if(s==="verified") o.push(["wait","info",{}]);
 if(atLeast(r,"causes") && !hasWorker(r)) o.push(["work","warn",{}]);
 if(cmNoOwner(r)) o.push(["cm","warn",{}]);
 if(revInTeam(r)) o.push(["rev","warn",{}]);
 return o;
}
function flagsOf(r){ var F=issues(r).map(function(x){ return [t("fl_"+x[0],x[2]),x[1]]; }); if(atLeast(r,"causes") && bonesWith(r)<3) F.push([t("fl_few"),"info"]); return F; }
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
 applyLogo(); buildRelated();
 document.title=TITLES[L]||TITLES.ar;
 try{ localStorage.setItem(LKEY,L); }catch(e){}
 if(window.CIAEX && CIAEX.ready){ if(CIAEX.renderStandard) CIAEX.renderStandard(); if(CIAEX.renderClauses) CIAEX.renderClauses(); }
 buildForm(); recToForm(keep||editing||blank(), true);
 if(CP) cpPreview(true);
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
 if(id==="tools"){ autoSizeAll(document.getElementById("boneBox")); autoSizeAll(document.getElementById("selBox")); }
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
/* 5 Whys on a given analysis (q.open) or prefilled from a CAPA record (q.capa): the 5 Whys tool's own address or hint */
function openWhy5(q){
 if(inHub()){ try{ sessionStorage.setItem(WHY5_NAV,JSON.stringify(q)); }catch(e){} try{ if(window.parent.ciaOpenFile("five-whys.html")) return; }catch(e){} try{ sessionStorage.removeItem(WHY5_NAV); }catch(e){} }
 var p=q.open?"?open="+encodeURIComponent(q.open):(q.capa?"?capa="+encodeURIComponent(q.capa):"");
 try{ window.open("./five-whys.html"+p+"#tools","_blank","noopener"); }catch(e){}
}
/* PDCA cycles, CAPA records and 5 Whys analyses saved in this browser (read only) */
function pdcaCycles(){
 var S=TBX.read(PDCA_KEY), R=S&&Array.isArray(S.records)?S.records:[];
 return R.filter(function(r){ return r&&typeof r==="object"&&r.id; }).map(function(r){ return {id:str(r.id),title:str(r.title)}; });
}
function capaRecs(){
 var S=TBX.read(CAPA_KEY); if(!S) return null;
 return (Array.isArray(S.records)?S.records:[]).filter(function(r){ return r&&typeof r==="object"&&str(r.id); });
}
function why5Recs(){
 var S=TBX.read(WHY5_KEY), R=S&&Array.isArray(S.records)?S.records:[];
 return R.filter(function(r){ return r&&typeof r==="object"&&str(r.id); });
}
function why5ById(id){ return why5Recs().filter(function(r){ return str(r.id)===id; })[0]||null; }
/* CAPA's stage, read with CAPA's own rules (modules/capa.html, stageOf) for the preview only */
function capaStage(r){
 var e=obj(r.eff), c=obj(r.close), im=obj(r.impl), cs=obj(r.cause), re=obj(r.react), a=(Array.isArray(r.actions)?r.actions:[]).filter(function(x){ return x&&typeof x==="object"; });
 if(e.result==="ineff") return "reopened"; if(txt(str(c.date))) return "closed";
 if(e.result==="eff"||txt(str(im.evidence))||(a.length&&a.every(function(x){ return x.st==="done"; }))) return "verify";
 if(txt(str(cs.root))) return "action"; if(txt(str(re.correction))||txt(str(re.containment))) return "cause"; return "react";
}
/* 5 Whys stage, read with the 5 Whys tool's own rules (modules/five-whys.html, stageOf) for the preview only */
function why5Stage(w){
 var te=obj(w.test), rv=obj(w.review), ch=(Array.isArray(w.chains)?w.chains:[]).filter(function(c){ return c&&typeof c==="object"; });
 var tested=te.stop==="yes" && te.reads===true;
 if(tested && txt(str(rv.by)) && isD(rv.date)) return "reviewed"; if(tested) return "tested"; if(txt(str(w.root))) return "root";
 var m=ch[0]&&Array.isArray(ch[0].whys)?ch[0].whys:[]; if(m.some(function(x){ return x&&txt(str(x.a)); })) return "chain"; return "problem";
}
function capaById(id){ var R=capaRecs()||[]; return R.filter(function(r){ return str(r.id)===id; })[0]||null; }

/* ---------- the diagram (inline SVG, mirrored for Arabic; the same drawing goes into the report) ---------- */
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
function diagramSVG(r,lang){
 lang=lang||L;
 var rtl=lang==="ar", FS=12.5, CW=6.6, SW=6.0, colW=232, slant=50, headW=196, mx=14, LH=15.5;
 var B=r.bones, n=B.length, cols=Math.max(1,Math.ceil(n/2));
 var selN={}, k=0; selList(r).forEach(function(x){ if(k<9){ k++; selN[x.it.id]=k; } });
 /* rows for each bone: a cause takes up to two lines, a sub-cause one or two smaller lines */
 function rowsOf(b){ var R=[]; b.causes.forEach(function(c){ if(txt(c.t)) R.push({it:c,lvl:0}); c.subs.forEach(function(s){ if(txt(s.t)) R.push({it:s,lvl:1}); }); }); return R; }
 var bx=B.map(function(b){ return rowsOf(b); });
 function nl(x,avail){ return wrapT(x.it.t,Math.max(10,Math.floor(avail/(x.lvl?SW:CW))),x.lvl?2:3).length; }
 function hOf(R,avail){ return R.reduce(function(a,x){ return a+7+LH*nl(x,x.lvl?avail-12:avail); },0); }
 var hTop=40, hBot=40;
 bx.forEach(function(R,i){ var h=hOf(R,colW-slant-36)+12; if(i%2===0) hTop=Math.max(hTop,h); else hBot=Math.max(hBot,h); });
 var topPad=36, botPad=36, spineY=topPad+hTop+16, H=spineY+hBot+16+botPad;
 var xHead=mx+cols*colW+14, W=xHead+headW+mx;
 var X=function(x){ return rtl?W-x:x; };
 var f=function(v){ return Math.round(v*10)/10; };
 var dir=rtl?"rtl":"ltr";
 var o=[];
 o.push('<svg xmlns="http://www.w3.org/2000/svg" class="fb-svg" viewBox="0 0 '+W+' '+H+'" width="'+W+'" height="'+H+'" role="img" aria-label="'+esc((lang==="ar"?"مخطط عظمة السمكة: ":"Fishbone diagram: ")+(txt(r.effect.what)||"…"))+'" font-family="\'IBM Plex Sans Arabic\',\'IBM Plex Sans\',Calibri,Tahoma,sans-serif" direction="'+dir+'">');
 o.push('<rect x="0" y="0" width="'+W+'" height="'+H+'" fill="#FFFFFF"/>');
 /* spine */
 o.push('<line x1="'+f(X(mx))+'" y1="'+spineY+'" x2="'+f(X(xHead))+'" y2="'+spineY+'" stroke="#1B2A4A" stroke-width="4" stroke-linecap="round"/>');
 /* head: the effect */
 var lab=lang==="ar"?"الأثر":"Effect", eff=txt(r.effect.what), el=eff?wrapT(eff,22,7):["…"];
 var hh=Math.max(80,32+el.length*16), hx0=xHead+4, hy0=spineY-hh/2;
 o.push('<path d="M'+f(X(hx0))+' '+f(hy0)+' L'+f(X(hx0+headW-28))+' '+f(hy0)+' Q'+f(X(hx0+headW-4))+' '+spineY+' '+f(X(hx0+headW-28))+' '+f(hy0+hh)+' L'+f(X(hx0))+' '+f(hy0+hh)+' Z" fill="#1B2A4A"/>');
 var hcx=X(hx0+12);
 o.push('<g class="fb-head">'+(eff?'<title>'+esc(eff)+'</title>':'')+'<text x="'+f(hcx)+'" y="'+f(hy0+20)+'" fill="#E9D8A6" font-size="11.5" font-weight="700" text-anchor="start">'+esc(lab)+'</text>');
 el.forEach(function(l,i){ o.push('<text x="'+f(hcx)+'" y="'+f(hy0+39+i*16)+'" fill="#FFFFFF" font-size="12.5" text-anchor="start">'+esc(l)+'</text>'); });
 o.push('</g>');
 /* bones */
 B.forEach(function(b,i){
  var col=Math.floor(i/2), top=i%2===0, xr=mx+(col+1)*colW, xA=xr-12, xB=xA-slant;
  var yB=top?spineY-hTop-10:spineY+hBot+10, c=BCOL[i%BCOL.length];
  o.push('<line x1="'+f(X(xA))+'" y1="'+spineY+'" x2="'+f(X(xB))+'" y2="'+f(yB)+'" stroke="'+c+'" stroke-width="2.6" stroke-linecap="round"/>');
  var nm=txt(b.name)||(lang==="ar"?"فئة "+(i+1):"Category "+(i+1)), nmS=nm.length>28?nm.slice(0,27)+"…":nm, lw=Math.min(colW-20,nmS.length*7+28), ly=top?yB-26:yB+3;
  o.push('<rect x="'+f(X(xB)-lw/2)+'" y="'+f(ly)+'" width="'+f(lw)+'" height="24" rx="12" fill="'+c+'"/>');
  o.push('<text x="'+f(X(xB))+'" y="'+f(ly+16.5)+'" fill="#FFFFFF" font-size="13" font-weight="700" text-anchor="middle">'+esc(nmS)+'<title>'+esc(nm)+'</title></text>');
  var R=bx[i], y=top?yB+20:yB-12;
  if(!R.length){ var ym=top?yB+(spineY-yB)*0.45:yB-(yB-spineY)*0.55, xm=xB+(ym-yB)/(spineY-yB)*(xA-xB);
   o.push('<text x="'+f(X(xm-14))+'" y="'+f(ym+4)+'" fill="#9AA5B8" font-size="12" text-anchor="end">'+esc(lang==="ar"?"لا أسباب بعد":"No causes yet")+'</text>'); }
  /* rows from the outer end towards the spine */
  var rows=top?R:R.slice();
  rows.forEach(function(x){
   var it=x.it, sub=x.lvl===1, fs=sub?11.5:FS, cw=sub?SW:CW;
   var yy=y, xb=xB+(yy-yB)/(spineY-yB)*(xA-xB), gap=sub?30:18, colL=xr-colW+6, avail=Math.max(60,xb-gap-colL);
   var lines=wrapT(it.t,Math.max(10,Math.floor(avail/cw)),sub?2:3), hgt=7+LH*lines.length;
   var fill=it.st==="out"?"#9AA5B8":(it.st==="sup"?"#1B2A4A":"#4B5874"), fw=(it.st==="sup"&&!sub)?"600":"400";
   var ty=top?yy:yy-(lines.length-1)*LH;
   o.push('<line x1="'+f(X(xb-(sub?26:14)))+'" y1="'+f(ty-4)+'" x2="'+f(X(xb))+'" y2="'+f(ty-4)+'" stroke="'+(sub?"#9AA5B8":c)+'" stroke-width="'+(sub?1.2:1.6)+'"'+(it.st==="cand"?' stroke-dasharray="3 2"':'')+'/>');
   lines.forEach(function(l,j){ o.push('<text x="'+f(X(xb-gap))+'" y="'+f(ty+j*LH)+'" fill="'+fill+'" font-size="'+fs+'" font-weight="'+fw+'" text-anchor="end"'+(it.st==="out"?' text-decoration="line-through"':'')+'>'+esc(l)+(j===lines.length-1&&it.v?'<tspan fill="#7A869E" font-size="11"> ('+it.v+')</tspan>':'')+'<title>'+esc(it.t+(it.ev?" — "+it.ev:""))+'</title></text>'); });
   if(selN[it.id]){ o.push('<circle cx="'+f(X(xb))+'" cy="'+f(ty-4)+'" r="9" fill="#B8901E" stroke="#FFFFFF" stroke-width="1.5"/><text x="'+f(X(xb))+'" y="'+f(ty)+'" fill="#FFFFFF" font-size="11" font-weight="700" text-anchor="middle">'+selN[it.id]+'</text>'); }
   y=top?y+hgt:y-hgt;
  });
 });
 o.push('</svg>');
 return o.join("");
}
/* phones: the same content as a list grouped by category */
function stackHTML(r){
 var selN={}, k=0; selList(r).forEach(function(x){ k++; selN[x.it.id]=k; });
 var li=function(it,sub){ return '<li class="'+(sub?"fb-li2 ":"")+(it.st==="out"?"fb-out":"")+'">'+(selN[it.id]?'<span class="fb-star">★'+selN[it.id]+'</span> ':'')+'<span class="fb-lt">'+esc(it.t)+'</span>'+(it.v?' <span class="fb-vote">('+it.v+')</span>':'')+' <span class="ca-chip '+(it.st==="sup"?"ok":(it.st==="out"?"mute":"warn"))+'">'+esc(t("cst_"+it.st))+'</span></li>'; };
 return '<div class="fb-eff"><b>'+esc(t("effL"))+'</b>'+esc(txt(r.effect.what)||t("effEmpty"))+'</div>'+r.bones.map(function(b,i){
  var L2=[]; b.causes.forEach(function(c){ if(txt(c.t)) L2.push(li(c,false)); c.subs.forEach(function(s){ if(txt(s.t)) L2.push(li(s,true)); }); });
  return '<div class="fb-sb" style="--bc:'+BCOL[i%BCOL.length]+'"><h4>'+esc(txt(b.name)||t("bone",{n:i+1}))+'</h4>'+(L2.length?'<ul>'+L2.join("")+'</ul>':'<p class="ca-hint" style="margin:0">'+esc(t("noCauses"))+'</p>')+'</div>'; }).join("");
}
function legendHTML(){ return '<div class="fb-leg"><span><i style="background:#B8901E;border-radius:50%"></i>'+esc(t("legSel"))+'</span><span><i style="background:#1B2A4A"></i>'+esc(t("legSup"))+'</span><span><i style="background:#4B5874;opacity:.6"></i>'+esc(t("legCand"))+'</span><span><i style="background:#9AA5B8"></i>'+esc(t("legOut"))+'</span></div>'; }
function renderDiagram(r){
 var box=document.getElementById("fbDiag"); if(!box) return;
 var svg=diagramSVG(r), m=/width="(\d+)"/.exec(svg), w=m?+m[1]:900;
 box.innerHTML='<div class="fb-svgw">'+svg.replace('<svg ','<svg style="width:100%;min-width:'+Math.round(w*0.85)+'px;max-width:'+w+'px" ')+'</div>'+legendHTML()+'<div class="fb-stack">'+stackHTML(r)+'</div>';
}

/* ---------- analysis form ---------- */
var HDR=[["title","tx",1],["ref","ltr",0],["src","sel_src",0],["capa","capa",0],["pdca","pdca",0],["area","tx",0],["date","date",0],["lead","tx",0]];
var PATH={title:"title",ref:"ref",src:"src",capa:"capa",pdca:"pdca",area:"area",date:"date",lead:"lead",what:"effect.what",where:"effect.where",when:"effect.when",much:"effect.much",
 set:"set",root:"root",test:"test",similar:"similar",similarNote:"similarNote",rby:"review.by",rdate:"review.date",rnote:"review.note"};
function getP(r,p){ var a=p.split("."); return a.length>1?r[a[0]][a[1]]:r[a[0]]; }
function setP(r,p,v){ var a=p.split("."); if(a.length>1) r[a[0]][a[1]]=v; else r[a[0]]=v; }
function opts(list,prefix,cur){ return list.map(function(k){ return '<option value="'+k+'"'+(cur===k?" selected":"")+'>'+esc(t(prefix+k))+'</option>'; }).join(""); }
function fieldHTML(name,kind,wide){
 var id="f-"+name, lab=t("f_"+name), inner="";
 if(kind==="ta") inner='<textarea id="'+id+'" rows="3"></textarea>';
 else if(kind==="date") inner='<input id="'+id+'" type="date">';
 else if(kind==="ltr") inner='<input id="'+id+'" type="text" dir="ltr">';
 else if(kind==="sel_src") inner='<select id="'+id+'">'+opts(SRCS,"src_")+'</select>';
 else if(kind==="sel_set") inner='<select id="'+id+'">'+opts(SETK,"set_")+'</select>';
 else if(kind==="sel_ts") inner='<select id="'+id+'">'+opts(["","yes","part","no"],"ts_")+'</select>';
 else if(kind==="sel_similar") inner='<select id="'+id+'">'+opts(["","none","exist","could"],"sim_")+'</select>';
 else if(kind==="capa") inner='<div class="ca-pd"><input id="'+id+'" type="text" dir="ltr" list="capaList" aria-describedby="cpInfo"><button class="pd-btn ghost" type="button" id="cpOpen">'+esc(t("cpOpen"))+'</button></div><datalist id="capaList"></datalist><div class="ca-pdinfo" id="cpInfo" aria-live="polite"></div>';
 else if(kind==="pdca") inner='<div class="ca-pd"><input id="'+id+'" type="text" dir="ltr" list="pdcaList" aria-describedby="pdInfo"><button class="pd-btn ghost" type="button" id="pdOpen">'+esc(t("pdOpen"))+'</button></div><datalist id="pdcaList"></datalist><div class="ca-pdinfo" id="pdInfo" aria-live="polite"></div>';
 else inner='<input id="'+id+'" type="text">';
 return '<div class="pd-f'+(wide?" wide":"")+'"><label for="'+id+'">'+esc(lab)+'</label>'+inner+'</div>';
}
function secHTML(k,col,inner){ return '<div class="pd-stage w5-sec" id="sec-'+k+'" style="--sc:'+col+'"><h3>'+esc(t("s"+k+"T"))+'</h3><p class="pd-sub">'+esc(t("s"+k+"S"))+'</p>'+inner+'</div>'; }
function fill(list){ return list.map(function(r){ return '<option value="'+esc(r[0])+'">'+esc(r[1])+'</option>'; }).join(""); }
function buildForm(){
 document.getElementById("hdrFields").innerHTML=HDR.map(function(f){ return fieldHTML(f[0],f[1],f[2]); }).join("");
 document.getElementById("stages").innerHTML=
  secHTML("Eff","#C2410C",'<div class="pd-fields">'+fieldHTML("what","ta",1)+fieldHTML("where","tx",0)+fieldHTML("when","tx",0)+fieldHTML("much","tx",1)+'</div>')+
  secHTML("Team","#7A869E",'<div class="ca-actw"><table class="w5-team"><thead><tr><th>'+esc(t("tmN"))+'</th><th>'+esc(t("tmRole"))+'</th><th>'+esc(t("tmWork"))+'</th><th><span class="sr">'+esc(t("tmDel"))+'</span></th></tr></thead><tbody id="teamRows"></tbody></table></div><p class="ca-hint" id="teamNone"></p><div class="w5-warn" id="workWarn" hidden></div><button class="pd-btn ghost" type="button" id="tmAdd">+ '+esc(t("tmAdd"))+'</button>')+
  secHTML("Cause","#3563C9",'<div class="fb-set">'+fieldHTML("set","sel_set",0)+'<p class="ca-hint">'+esc(t("setHint"))+'</p></div><p class="fb-msg" id="setMsg" role="status"></p><div id="boneBox"></div><div class="fb-badd"><button class="pd-btn ghost" type="button" id="boneAdd">+ '+esc(t("boneAdd"))+'</button><span class="ca-hint" id="boneMax"></span></div><p class="fb-msg" id="pickMsg" role="status"></p>')+
  secHTML("Diag","#1E8C93",'<div class="fb-diagw" id="fbDiag"></div>')+
  secHTML("Sel","#B8901E",'<div id="selBox"></div>')+
  secHTML("Root","#1B2A4A",'<div class="pd-fields">'+fieldHTML("root","ta",1)+'</div><div class="w5-warn w5-bad" id="personWarn" role="note" hidden></div><div class="pd-fields">'+fieldHTML("test","sel_ts",0)+'</div><div class="w5-warn" id="testWarn" role="note" hidden></div>')+
  secHTML("Sim","#7B5BB8",'<div class="pd-fields">'+fieldHTML("similar","sel_similar",0)+fieldHTML("similarNote","tx",1)+'</div>')+
  secHTML("Cm","#1E8C93",'<div class="ca-actw"><table class="ca-acts"><thead><tr><th>'+esc(t("cmT"))+'</th><th>'+esc(t("cmOwner"))+'</th><th><span class="sr">'+esc(t("cmDel"))+'</span></th></tr></thead><tbody id="cmRows"></tbody></table></div><p class="ca-hint" id="cmNone"></p><button class="pd-btn ghost" type="button" id="cmAdd">+ '+esc(t("cmAdd"))+'</button><p class="ca-hint">'+esc(t("cmHint"))+'</p>')+
  secHTML("Rev","#3C9A5F",'<div class="pd-fields">'+fieldHTML("rby","tx",0)+fieldHTML("rdate","date",0)+fieldHTML("rnote","ta",1)+'</div><div class="w5-warn" id="rvWarn" hidden></div>');
 var cl=document.getElementById("capaList"); if(cl) cl.innerHTML=fill((capaRecs()||[]).map(function(r){ return [str(r.id),str(r.ref)+" · "+str(r.title)]; }));
 var dl=document.getElementById("pdcaList"); if(dl) dl.innerHTML=fill(pdcaCycles().map(function(c){ return [c.id,c.title]; }));
 selKey="";
}
function teamRowHTML(m,i){
 return '<tr data-row="'+i+'"><td><input data-k="n" type="text" value="'+esc(m.n)+'" aria-label="'+esc(t("tmN"))+'"></td><td><input data-k="role" type="text" value="'+esc(m.role)+'" aria-label="'+esc(t("tmRole"))+'"></td><td style="text-align:center"><input data-k="work" type="checkbox"'+(m.work?" checked":"")+' aria-label="'+esc(t("tmWork"))+'"></td><td><button type="button" class="ca-x" data-tmdel="'+i+'" aria-label="'+esc(t("tmDel"))+'" title="'+esc(t("tmDel"))+'">✕</button></td></tr>';
}
function renderTeam(list){ document.getElementById("teamRows").innerHTML=list.map(teamRowHTML).join(""); document.getElementById("teamNone").textContent=list.length?"":t("tmNone"); }
function readTeam(){ return [].map.call(document.querySelectorAll("#teamRows tr"),function(tr){ return {n:txt(tr.querySelector('[data-k="n"]').value),role:txt(tr.querySelector('[data-k="role"]').value),work:!!tr.querySelector('[data-k="work"]').checked}; }); }
/* ---- bones and causes ---- */
function itemHTML(it,sub){
 var id="i-"+it.id;
 return '<div class="fb-item'+(sub?" fb-sub":"")+' st-'+it.st+'" data-id="'+esc(it.id)+'" data-lvl="'+(sub?1:0)+'">'+
  '<div><label class="fb-l" for="'+id+'-t">'+esc(sub?t("subT"):t("cT"))+'</label><textarea id="'+id+'-t" data-k="t" rows="2">'+esc(it.t)+'</textarea></div>'+
  '<div><label class="fb-l" for="'+id+'-ev">'+esc(t("cEv"))+'</label><textarea id="'+id+'-ev" data-k="ev" rows="2">'+esc(it.ev)+'</textarea></div>'+
  '<div><label class="fb-l" for="'+id+'-st">'+esc(t("cSt"))+'</label><select id="'+id+'-st" data-k="st">'+opts(["cand","sup","out"],"cst_",it.st)+'</select></div>'+
  '<div><label class="fb-l" for="'+id+'-v">'+esc(t("cV"))+'</label><input id="'+id+'-v" data-k="v" type="number" min="0" max="9" step="1" inputmode="numeric" value="'+(it.v||0)+'"></div>'+
  '<label class="fb-pick" for="'+id+'-sel"><input id="'+id+'-sel" data-k="sel" type="checkbox"'+(it.sel?" checked":"")+'><span>'+esc(t("cSel"))+'</span></label>'+
  '<div><button type="button" class="ca-x" data-idel="'+esc(it.id)+'" aria-label="'+esc((sub?t("subT"):t("cDel")))+'" title="'+esc(sub?t("subT"):t("cDel"))+'">✕</button></div></div>';
}
function causeHTML(c){
 return '<div class="fb-c" data-cid="'+esc(c.id)+'">'+itemHTML(c,false)+'<div class="fb-subs">'+c.subs.map(function(s){ return itemHTML(s,true); }).join("")+'</div>'+
  '<div class="fb-ibtn"><button class="pd-btn ghost" type="button" data-subadd="'+esc(c.id)+'">+ '+esc(t("subAdd"))+'</button></div></div>';
}
function boneHTML(b,i){
 return '<div class="fb-bone" data-bone="'+i+'" style="--bc:'+BCOL[i%BCOL.length]+'"><div class="fb-bhead"><span class="fb-bn" aria-hidden="true">'+(i+1)+'</span><label class="sr" for="b-'+i+'-n">'+esc(t("boneName"))+' '+(i+1)+'</label><input id="b-'+i+'-n" data-bk="name" type="text" value="'+esc(b.name)+'" placeholder="'+esc(t("bone",{n:i+1}))+'"><button class="pd-btn ghost" type="button" data-bdel="'+i+'">'+esc(t("boneDel"))+'</button></div>'+
  '<div class="fb-items">'+b.causes.map(causeHTML).join("")+'</div>'+(b.causes.length?'':'<p class="ca-hint" style="margin:2px 0 0">'+esc(t("cNone"))+'</p>')+
  '<div class="fb-badd"><button class="pd-btn ghost" type="button" data-cadd="'+i+'">+ '+esc(t("cAdd"))+'</button></div></div>';
}
/* text areas grow with their text so a cause is never hidden behind a scroll bar */
function autoSize(el){ if(!el||el.tagName!=="TEXTAREA") return; el.style.height="auto"; if(el.scrollHeight) el.style.height=(el.scrollHeight+2)+"px"; }
function autoSizeAll(root){ if(root) root.querySelectorAll("textarea").forEach(autoSize); }
function renderBones(list){
 document.getElementById("boneBox").innerHTML=list.map(boneHTML).join("");
 autoSizeAll(document.getElementById("boneBox"));
 document.getElementById("boneAdd").hidden=list.length>=MAXB;
 document.getElementById("boneMax").textContent=list.length>=MAXB?t("boneMax"):"";
}
function readItem(el){
 var g=function(k){ var x=el.querySelector('[data-k="'+k+'"]'); return x?x:null; }, id=el.getAttribute("data-id");
 return {id:id,t:txt(g("t").value),ev:txt(g("ev").value),st:g("st").value||"cand",v:Math.max(0,Math.min(9,parseInt(g("v").value,10)||0)),sel:!!g("sel").checked,ver:fixVer(VER[id])};
}
function readBones(){
 return [].map.call(document.querySelectorAll("#boneBox .fb-bone"),function(bel){
  var nm=bel.querySelector('[data-bk="name"]');
  return {name:nm?txt(nm.value):"",causes:[].map.call(bel.querySelectorAll(".fb-c"),function(cel){
   var c=readItem(cel.querySelector('.fb-item[data-lvl="0"]'));
   c.subs=[].map.call(cel.querySelectorAll('.fb-subs .fb-item'),readItem);
   return c; })};
 });
}
function nextId(){ var n=0; document.querySelectorAll("#boneBox .fb-item[data-id]").forEach(function(el){ var m=/^c(\d+)$/.exec(el.getAttribute("data-id")); if(m) n=Math.max(n,+m[1]); }); Object.keys(VER).forEach(function(k){ var m=/^c(\d+)$/.exec(k); if(m) n=Math.max(n,+m[1]); }); return "c"+(n+1); }
/* ---- selected causes: verification ---- */
function w5Options(r,cur){
 var R=why5Recs().slice().sort(function(a,b){ var x=str(a.capa)===r.capa&&r.capa?0:1, y=str(b.capa)===r.capa&&r.capa?0:1; return x-y; });
 var o='<option value="">'+esc(t("vW5none"))+'</option>'+R.map(function(w){ var id=str(w.id); return '<option value="'+esc(id)+'"'+(id===cur?" selected":"")+'>'+esc(id+" · "+str(w.title))+'</option>'; }).join("");
 if(cur && !R.some(function(w){ return str(w.id)===cur; })) o+='<option value="'+esc(cur)+'" selected>'+esc(cur)+'</option>';
 return o;
}
function w5Preview(id){
 if(!id) return why5Recs().length?"":t("vNo5");
 var w=why5ById(id); if(!w) return t("vMiss");
 return t("vPrev",{id:id,st:t("w5st_"+why5Stage(w)),root:short(str(w.root),140)||t("vPrevNo")});
}
function verHTML(x,i,r){
 var it=x.it, v=fixVer(VER[it.id]), id="v-"+it.id, b=r.bones[x.b]||{name:""}, ok=verified(Object.assign({},it,{ver:v}));
 return '<div class="fb-ver'+(ok?" ok":(v.res==="no"?" no":""))+'" data-vid="'+esc(it.id)+'"><h4><span class="fb-no">'+(i+1)+'</span><span>'+esc(it.t)+'<small>'+esc(txt(b.name)||t("bone",{n:x.b+1}))+(x.lvl?" · "+esc(t("subT")):"")+(it.ev?" · "+esc(t("cEv"))+": "+esc(it.ev):"")+'</small></span></h4>'+
  '<div class="fb-vg"><div><label for="'+id+'-how">'+esc(t("vHow"))+'</label><select id="'+id+'-how" data-vk="how">'+opts(["why5","data"],"vHow_",v.how)+'</select></div>'+
  '<div>'+(v.how==="why5"?'<label for="'+id+'-w5">'+esc(t("vW5"))+'</label><select id="'+id+'-w5" data-vk="w5" dir="ltr">'+w5Options(r,v.w5)+'</select><div class="fb-w5p" data-w5p="'+esc(it.id)+'">'+esc(w5Preview(v.w5))+'</div>'+
   '<div class="fb-vb"><button class="pd-btn ghost" type="button" data-w5go="'+esc(it.id)+'">'+esc(t("vGo5"))+' ↗</button>'+(v.w5?'<button class="pd-btn ghost" type="button" data-w5open="'+esc(v.w5)+'">'+esc(t("vOpen5"))+' ↗</button>':'')+'</div>'+(inHub()?'<p class="ca-hint" style="margin:4px 0 0">'+esc(t("vSave"))+'</p>':'')
   :'<label for="'+id+'-note">'+esc(t("vNote"))+'</label><textarea id="'+id+'-note" data-vk="note" rows="2">'+esc(v.note)+'</textarea>')+'</div>'+
  '<div><label for="'+id+'-res">'+esc(t("vRes"))+'</label><select id="'+id+'-res" data-vk="res">'+opts(["","conf","no"],"vRes_",v.res)+'</select></div></div></div>';
}
function renderSel(r,force){
 var box=document.getElementById("selBox"); if(!box) return;
 var S=selList(r), key=L+"|"+S.map(function(x){ var v=fixVer(VER[x.it.id]); return x.it.id+":"+v.how+":"+v.w5+":"+x.it.t.length; }).join(",");
 if(!force && key===selKey){ S.forEach(function(x){ var row=box.querySelector('[data-vid="'+x.it.id+'"]'); if(!row) return; var v=fixVer(VER[x.it.id]); row.classList.toggle("ok",verified(Object.assign({},x.it,{ver:v}))); row.classList.toggle("no",v.res==="no"); }); return; }
 selKey=key;
 box.innerHTML=S.length?S.map(function(x,i){ return verHTML(x,i,r); }).join(""):'<p class="ca-hint" style="margin:0">'+esc(t("selNone"))+'</p>';
 autoSizeAll(box);
}
function readVer(){
 document.querySelectorAll("#selBox .fb-ver[data-vid]").forEach(function(row){
  var id=row.getAttribute("data-vid"), v=fixVer(VER[id]);
  row.querySelectorAll("[data-vk]").forEach(function(el){ v[el.getAttribute("data-vk")]=el.tagName==="TEXTAREA"?el.value:el.value; });
  v.note=String(v.note||""); VER[id]=fixVer(v);
 });
}
function cmRowHTML(c,i){ return '<tr data-row="'+i+'"><td><textarea data-k="t" rows="2" aria-label="'+esc(t("cmT"))+'">'+esc(c.t)+'</textarea></td><td><input data-k="owner" type="text" value="'+esc(c.owner)+'" aria-label="'+esc(t("cmOwner"))+'"></td><td><button type="button" class="ca-x" data-cmdel="'+i+'" aria-label="'+esc(t("cmDel"))+'" title="'+esc(t("cmDel"))+'">✕</button></td></tr>'; }
function renderCms(list){ document.getElementById("cmRows").innerHTML=list.map(cmRowHTML).join(""); document.getElementById("cmNone").textContent=list.length?"":t("cmNone"); }
function readCms(){ return [].map.call(document.querySelectorAll("#cmRows tr"),function(tr){ return {t:txt(tr.querySelector('[data-k="t"]').value),owner:txt(tr.querySelector('[data-k="owner"]').value)}; }); }
/* the record as it would be saved: empty rows dropped, every cause's verification kept with it */
function formToRec(){
 var r=blank();
 Object.keys(PATH).forEach(function(k){ var el=document.getElementById("f-"+k); if(el) setP(r,PATH[k],txt(el.value)); });
 if(!r.src) r.src="capa"; if(SETK.indexOf(r.set)<0) r.set="6m";
 if(document.getElementById("teamRows")) r.team=readTeam().filter(function(m){ return m.n||m.role; });
 if(document.getElementById("boneBox")){ readVer(); r.bones=readBones().map(function(b){ b.causes=b.causes.filter(function(c){ c.subs=c.subs.filter(function(s){ return s.t||s.ev; }); return c.t||c.ev||c.subs.length; }); return b; }); }
 if(document.getElementById("cmRows")) r.cms=readCms().filter(function(c){ return c.t||c.owner; });
 r.id=document.getElementById("rid").value;
 if(editing&&editing.id===r.id){ r.created=editing.created||""; }
 return r;
}
/* the form keeps rows the user is still filling in (empty causes stay on screen until saved) */
function formRaw(){ readVer(); return {bones:readBones()}; }
function recToForm(r,keepMsg){
 r=fixRec(JSON.parse(JSON.stringify(r)));
 document.getElementById("rid").value=r.id||"";
 VER={}; eachItem(r,function(it){ VER[it.id]=fixVer(it.ver); });
 Object.keys(PATH).forEach(function(k){ var el=document.getElementById("f-"+k); if(el) el.value=getP(r,PATH[k])||(el.tagName==="SELECT"&&el.options.length?el.options[0].value:""); });
 if(!r.src) document.getElementById("f-src").value="capa";
 renderTeam(r.team);
 renderBones(r.bones);
 renderCms(r.cms);
 if(!keepMsg){ ["recErr","recOk","setMsg","pickMsg"].forEach(function(id){ var e=document.getElementById(id); if(e) e.textContent=""; }); }
 refreshForm(true);
}
function loadRecordIntoForm(r){ editing=fixRec(JSON.parse(JSON.stringify(r))); recToForm(editing); }
function clearForm(){ editing=null; recToForm(blank()); }
function refreshForm(force){
 var r=formToRec(), raw=formRaw(), st=stageOf(r);
 var el=document.getElementById("curStage"); if(el) el.textContent=t("cur")+" "+stageName(st);
 var ci=STAGES.indexOf(st);
 document.getElementById("caSteps").innerHTML=STAGES.map(function(s,i){ var cls=i<ci?"done":(i===ci?(st==="reviewed"?"done":"cur"):""); return '<li class="'+cls+'" style="--sc:'+SCOL[s]+'"'+(i===ci?' aria-current="step"':'')+'><i aria-hidden="true"></i>'+esc(stageName(s))+'</li>'; }).join("");
 /* status colour on each cause row */
 raw.bones.forEach(function(b){ b.causes.forEach(function(c){ [c].concat(c.subs).forEach(function(it){ var row=document.querySelector('#boneBox .fb-item[data-id="'+it.id+'"]'); if(row){ row.classList.remove("st-cand","st-sup","st-out"); row.classList.add("st-"+it.st); } }); }); });
 renderDiagram(r);
 renderSel(r,force===true);
 var pw=document.getElementById("personWarn"); if(pw){ var po=personAny(r); pw.hidden=!po; pw.textContent=po?t("personW"):""; }
 var tw=document.getElementById("testWarn"); if(tw){ var tb=r.test==="part"||r.test==="no"; tw.hidden=!tb; tw.textContent=tb?t("testW"):""; }
 var ww=document.getElementById("workWarn"); if(ww){ var nw=(readTeam().some(function(m){ return m.n; })||atLeast(r,"causes"))&&!hasWorker(r); ww.hidden=!nw; ww.textContent=nw?t("workW"):""; }
 var vw=document.getElementById("rvWarn"); if(vw){ var ri=revInTeam(r); vw.hidden=!ri; vw.textContent=ri?t("revW"):""; }
 var ci2=document.getElementById("cpInfo"), cv=r.capa;
 if(ci2){ if(!cv) ci2.textContent=t("cpHint"); else { var c=capaById(cv); ci2.textContent=c?t("cpFound",{t:str(c.ref)+" · "+str(c.title)}):t("cpMiss"); } }
 var info=document.getElementById("pdInfo"), v=r.pdca;
 if(info){ if(!v) info.textContent=t("pdHint"); else { var p=pdcaCycles().filter(function(x){ return x.id===v; })[0]; info.textContent=p?t("pdFound",{t:p.title||p.id}):t("pdMiss"); } }
}
function validate(r){
 if(!r.title) return t("e_title");
 if(!r.effect.what) return t("e_what");
 if(isD(r.date)&&isD(r.review.date)&&r.review.date<r.date) return t("e_rdate");
 return "";
}
function newId(r){
 var y=(isD(r.date)?r.date:today()).slice(0,4), pre="FB-"+y+"-";
 var n=DB.records.map(function(x){ return x.id; }).filter(function(id){ return id.indexOf(pre)===0; }).map(function(id){ return parseInt(id.slice(pre.length),10); }).filter(function(x){ return !isNaN(x); });
 return pre+String((n.length?Math.max.apply(null,n):0)+1).replace(/^(\d)$/,"00$1").replace(/^(\d\d)$/,"0$1");
}
function saveRecord(){
 var r=formToRec(), err=validate(r);
 var errEl=document.getElementById("recErr"), okEl=document.getElementById("recOk");
 okEl.textContent="";
 if(err){ errEl.textContent=err; return; }
 errEl.textContent="";
 var now=new Date().toISOString();
 if(!r.id){ r.id=newId(r); r.created=now; DB.records.unshift(r); }
 else { var i=DB.records.findIndex(function(x){ return x.id===r.id; }); if(i>=0){ r.created=DB.records[i].created||r.created||now; DB.records[i]=r; } else { r.created=r.created||now; DB.records.unshift(r); } }
 r.updated=now;
 editing=fixRec(JSON.parse(JSON.stringify(r)));
 document.getElementById("rid").value=r.id;
 if(persist()) okEl.textContent=t("ok_rec")+" · "+r.id; else errEl.textContent=t("savedFail");
 refreshForm(); renderAll();
}
/* a category set renames the bones in order; causes are never deleted, and extra bones are kept while they hold causes */
function applySet(k){
 var bones=readBones(), C=CAT[L]||CAT.ar, names=(SETS[k]||SETS["6m"]).k.map(function(x){ return C[x]; });
 if(k==="custom" && bones.length){ document.getElementById("setMsg").textContent=""; return; }
 names.forEach(function(nm,i){ if(bones[i]) bones[i].name=nm; else bones.push({name:nm,causes:[]}); });
 bones=bones.filter(function(b,i){ return i<names.length || b.causes.length; }).slice(0,MAXB);
 renderBones(bones);
 document.getElementById("setMsg").textContent=t("setDone");
}
/* "Category: cause" lines of the CAPA record's cause analysis become candidate causes on the matching bone */
function catKey(s){
 var n=txt(s).toLowerCase().replace(/[ًٌٍَُِّْـ]/g,"").replace(/\s+/g," ");
 for(var lang in CAT){ for(var k in CAT[lang]){ if(/^c\d$/.test(k)) continue; if(CAT[lang][k].toLowerCase()===n) return k; } }
 return SYN[n]||null;
}
function capaCauses(r,text){
 var n=0;
 String(text||"").split(/\n+/).forEach(function(line){
  var m=/^\s*([^:：\n]{2,28})\s*[:：]\s*(.+)$/.exec(line); if(!m) return;
  var k=catKey(m[1]), c=txt(m[2]); if(!k||!c) return;
  var C=CAT[L]||CAT.ar, i=-1;
  r.bones.forEach(function(b,j){ if(i<0 && catKey(b.name)===k) i=j; });
  if(i<0){ if(r.bones.length>=MAXB) return; r.bones.push({name:C[k],causes:[]}); i=r.bones.length-1; }
  n++; var it=blankItem("c"+(100+n)); it.t=c; r.bones[i].causes.push(it);
 });
 return n;
}
/* a new analysis filled from a CAPA record; the CAPA record is only read */
function prefillFromCapa(id){
 var c=capaById(id); if(!c) return false;
 var r=blank(), cs=obj(c.cause);
 r.title=str(c.title); r.ref=str(c.ref); r.src="capa"; r.capa=str(c.id); r.pdca=str(c.pdca); r.area=str(c.area); r.date=today(); r.lead=str(c.owner);
 r.effect.what=str(c.desc); r.effect.where=str(c.area); r.effect.when=str(c.raised);
 var n=capaCauses(r,str(cs.analysis));
 fixRec(r);
 editing=null; recToForm(r);
 go("tools");
 document.getElementById("recOk").textContent=t("cpUsed",{id:str(c.id)})+(n?t("cpUsedN",{n:n}):"");
 return true;
}

/* ---------- start from a CAPA record (read only, preview first) ---------- */
function cpPreview(keep){
 var msg=document.getElementById("cpMsg"), box=document.getElementById("cpTable"), R=capaRecs();
 if(!R){ CP=null; box.hidden=true; msg.textContent=t("cpNone"); return; }
 if(!R.length){ CP=null; box.hidden=true; msg.textContent=t("cpEmpty"); return; }
 CP=R; if(!keep) msg.textContent="";
 box.hidden=false;
 box.innerHTML='<table class="pd-tbl"><thead><tr><th>'+esc(t("cpColId"))+'</th><th>'+esc(t("cpColT"))+'</th><th>'+esc(t("cpColSt"))+'</th><th>'+esc(t("cpColM"))+'</th><th>'+esc(t("cpColN"))+'</th><th>'+esc(t("cpColA"))+'</th></tr></thead><tbody>'+
  R.map(function(c){ var id=str(c.id), n=DB.records.filter(function(r){ return r.capa===id; }).length, m=str(obj(c.cause).method);
   return '<tr><td><b dir="ltr">'+esc(id)+'</b></td><td><b dir="ltr">'+esc(str(c.ref))+'</b><br>'+esc(str(c.title))+'</td><td>'+esc(t("cst_"+capaStage(c)))+'</td><td>'+esc(["why5","fish","other"].indexOf(m)>=0?t("cm_"+m):"—")+'</td><td>'+n+'</td><td><button class="pd-rowbtn" type="button" data-cpuse="'+esc(id)+'">'+esc(t("cpUse"))+'</button></td></tr>'; }).join("")+'</tbody></table>';
}
function cpPending(){ var R=capaRecs()||[]; return R.filter(function(c){ return str(obj(c.cause).method)==="fish" && capaStage(c)!=="closed" && !DB.records.some(function(r){ return r.capa===str(c.id); }); }).length; }
function renderHomeCp(){
 var box=document.getElementById("homeImp"); if(!box) return;
 var n=cpPending(); box.hidden=!n; if(n) document.getElementById("homeImpT").textContent=t("cpHome",{n:n});
}
document.getElementById("cpPrev").addEventListener("click",function(){ cpPreview(false); });
document.getElementById("cpTable").addEventListener("click",function(e){ var b=e.target.closest("[data-cpuse]"); if(b) prefillFromCapa(b.getAttribute("data-cpuse")); });
document.getElementById("homeImpGo").addEventListener("click",function(){ go("tools"); cpPreview(false); var b=document.getElementById("cpBox"); if(b&&b.scrollIntoView) b.scrollIntoView({block:"start"}); });

/* ---------- self-assessment ---------- */
var AQ=[
 ["EF1",{ar:"هل نكتب الأثر من الوقائع بأجزائه الأربعة (ماذا وأين ومتى وكم) قبل أن نبحث عن الأسباب؟",en:"Do we write the effect from facts, in its four parts (what, where, when, how much), before we look for causes?"}],
 ["EF2",{ar:"هل يحضر الجلسةَ الأشخاصُ المناسبون، ومنهم واحد على الأقل يؤدي العمل نفسه؟",en:"Are the right people in the session, including at least one person who does the work itself?"}],
 ["CS1",{ar:"هل نختار الفئات بما يناسب العملية (6M أو 4S أو 8P أو فئات خاصة)، ونعيد تسميتها بدل التقيد بقائمة ثابتة؟",en:"Do we choose categories that fit the process (6M, 4S, 8P or our own), and rename them rather than stick to a fixed list?"}],
 ["CS2",{ar:"هل نكتب كل سبب واقعةً تصف ما يحدث في العملية، لا لوماً لشخص أو قسم؟",en:"Do we write each cause as a fact that describes what happens in the process, not as blame on a person or a department?"}],
 ["CS3",{ar:"هل نكتب بجانب كل سبب الدليل الذي يسنده، ونميّز المرشّح من المدعوم بالدليل؟",en:"Do we write next to each cause the evidence behind it, and tell candidates apart from causes supported by evidence?"}],
 ["VR1",{ar:"هل نستبعد الأسباب بالبيانات والدليل، ونكتب سبب الاستبعاد، لا بالرأي أو بالأقدمية؟",en:"Do we rule causes out with data and evidence, and write why, rather than by opinion or seniority?"}],
 ["VR2",{ar:"هل نركّز على سببين أو ثلاثة هي الأرجح (بالتصويت أو الوزن مع الدليل) بدل معالجة كل ما على المخطط؟",en:"Do we focus on the two or three most likely causes (by votes or weight, with the evidence) instead of acting on everything on the diagram?"}],
 ["VR3",{ar:"هل نتحقق من السبب الجذري قبل اتخاذ الإجراء، بأداة لماذا الخمس أو بالبيانات، ونختبر أن إزالته توقف الأثر؟",en:"Do we confirm the root cause before acting, with 5 Whys or with data, and test that removing it stops the effect?"}],
 ["LK1",{ar:"هل نبحث عن الحالات المشابهة الموجودة أو المحتملة في مواقع وعمليات أخرى؟",en:"Do we look for similar cases that exist or could occur at other sites and in other processes?"}],
 ["LK2",{ar:"هل يُنقل السبب الجذري إلى سجل الإجراء التصحيحي ويُبنى الإجراء عليه، ونشارك الدرس مع الفرق الأخرى؟",en:"Is the root cause carried into the corrective action record and the action built on it, and do we share the lesson with other teams?"}]
];
var AGROUPS=["EF","CS","VR","LK"];
var GCOL={EF:"#C2410C",CS:"#3563C9",VR:"#B8901E",LK:"#3C9A5F"};
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
function causesLine(r){ var c=cnt(r); return t("causesN",{n:c.all,b:bonesWith(r),o:c.out,s:c.sel}); }
function renderDocs(){
 var box=document.getElementById("docsBox"); if(!box) return;
 var cnt0=document.getElementById("cntDocs"); if(cnt0) cnt0.textContent=DB.records.length?String(DB.records.length):"";
 if(!DB.records.length){ box.innerHTML='<div class="pd-empty">'+esc(t("none"))+'</div>'; return; }
 var rows=DB.records.map(function(r){
  var st=stageOf(r);
  var del=(pendingDelete===r.id)?'<button class="pd-rowbtn arm" type="button" data-del="'+esc(r.id)+'">'+esc(t("delArm"))+'</button>':'<button class="pd-rowbtn" type="button" data-del="'+esc(r.id)+'">'+esc(t("del"))+'</button>';
  var cp=r.capa?'<button class="pd-rowbtn" type="button" data-capa="'+esc(r.capa)+'">CAPA ↗</button>':'';
  var pd=r.pdca?'<button class="pd-rowbtn" type="button" data-pdca="'+esc(r.pdca)+'">PDCA ↗</button>':'';
  return '<tr><td><b dir="ltr">'+esc(r.ref||"—")+'</b><br>'+esc(r.title)+'<br><small dir="ltr" style="color:var(--muted)">'+esc(r.id)+'</small></td><td>'+esc(srcName(r.src))+(r.capa?'<br><small dir="ltr">'+esc(r.capa)+'</small>':'')+'</td><td><span class="pd-badge" style="background:'+SCOL[st]+';color:#fff">'+esc(stageName(st))+'</span></td><td><small>'+esc(setName(r.set))+'</small><br>'+esc(causesLine(r))+'</td><td>'+esc(short(r.root,120)||"—")+'</td><td>'+flagsOf(r).map(chip).join("")+'</td><td><button class="pd-rowbtn" type="button" data-open="'+esc(r.id)+'">'+esc(t("open"))+'</button>'+del+cp+pd+'</td></tr>';
 }).join("");
 box.innerHTML='<table class="pd-tbl"><thead><tr><th>'+esc(t("colRef"))+'</th><th>'+esc(t("colSrc"))+'</th><th>'+esc(t("colStage"))+'</th><th>'+esc(t("colCauses"))+'</th><th>'+esc(t("colRoot"))+'</th><th>'+esc(t("colFlags"))+'</th><th>'+esc(t("colAct"))+'</th></tr></thead><tbody>'+rows+'</tbody></table>';
}
function pickMsg(s){ var m=document.getElementById("pickMsg"); if(m) m.textContent=s||""; }
document.addEventListener("click",function(e){
 if(e.target.closest("#cb")) return;
 var o=e.target.closest("[data-open]"); if(o){ var r=DB.records.find(function(x){ return x.id===o.getAttribute("data-open"); }); if(r){ loadRecordIntoForm(r); go("tools"); } return; }
 var d=e.target.closest("[data-del]"); if(d){ var id=d.getAttribute("data-del"); if(pendingDelete===id){ DB.records=DB.records.filter(function(x){ return x.id!==id; }); pendingDelete=null; persist(); if(document.getElementById("rid").value===id) clearForm(); renderAll(); } else { pendingDelete=id; renderDocs(); } return; }
 if(e.target.closest("[data-capa]")||e.target.closest("#cpOpen")){ openTool("capa.html","docs"); return; }
 if(e.target.closest("[data-pdca]")||e.target.closest("#pdOpen")){ openTool("pdca.html","docs"); return; }
 var w5o=e.target.closest("[data-w5open]"); if(w5o){ openWhy5({open:w5o.getAttribute("data-w5open")}); return; }
 if(e.target.closest("[data-w5go]")){ var cv=txt((document.getElementById("f-capa")||{}).value); openWhy5(cv?{capa:cv}:{}); return; }
 var x=e.target.closest("[data-tmdel]"); if(x){ var tl=readTeam(); tl.splice(Number(x.getAttribute("data-tmdel")),1); renderTeam(tl); refreshForm(); return; }
 if(e.target.closest("#tmAdd")){ var t2=readTeam(); t2.push({n:"",role:"",work:false}); renderTeam(t2); var lt=document.querySelector("#teamRows tr:last-child input"); if(lt) lt.focus(); refreshForm(); return; }
 if(e.target.closest("#boneAdd")){ var b0=readBones(); if(b0.length<MAXB){ b0.push({name:"",causes:[]}); renderBones(b0); var nb=document.getElementById("b-"+(b0.length-1)+"-n"); if(nb) nb.focus(); } refreshForm(); return; }
 var bd=e.target.closest("[data-bdel]"); if(bd){ var b1=readBones(), bi=Number(bd.getAttribute("data-bdel")); if(b1[bi]&&b1[bi].causes.some(function(c){ return c.t||c.ev||c.subs.length; })){ pickMsg(t("boneDelNo")); return; } b1.splice(bi,1); renderBones(b1); pickMsg(""); refreshForm(); return; }
 var ca=e.target.closest("[data-cadd]"); if(ca){ var b2=readBones(), i2=Number(ca.getAttribute("data-cadd")), nid=nextId(); b2[i2].causes.push(blankItem(nid)); VER[nid]=blankVer(); renderBones(b2); var f=document.getElementById("i-"+nid+"-t"); if(f) f.focus(); refreshForm(); return; }
 var sa=e.target.closest("[data-subadd]"); if(sa){ var b3=readBones(), pid=sa.getAttribute("data-subadd"), sid=nextId(); b3.forEach(function(b){ b.causes.forEach(function(c){ if(c.id===pid){ var s=blankItem(sid); delete s.subs; c.subs.push(s); } }); }); VER[sid]=blankVer(); renderBones(b3); var f2=document.getElementById("i-"+sid+"-t"); if(f2) f2.focus(); refreshForm(); return; }
 var idl=e.target.closest("[data-idel]"); if(idl){ var b4=readBones(), did=idl.getAttribute("data-idel"); b4.forEach(function(b){ b.causes=b.causes.filter(function(c){ c.subs=c.subs.filter(function(s){ return s.id!==did; }); return c.id!==did; }); }); renderBones(b4); refreshForm(); return; }
 var cx=e.target.closest("[data-cmdel]"); if(cx){ var cl=readCms(); cl.splice(Number(cx.getAttribute("data-cmdel")),1); renderCms(cl); refreshForm(); return; }
 if(e.target.closest("#cmAdd")){ var c2=readCms(); c2.push({t:"",owner:""}); renderCms(c2); var lc=document.querySelector("#cmRows tr:last-child textarea"); if(lc) lc.focus(); refreshForm(); return; }
});
/* selecting a cause: three at most, never one that was ruled out; a cause ruled out leaves the selection.
   Capture phase: the limit applies before the form redraws the diagram and the verification section. */
document.addEventListener("change",function(e){
 var el=e.target; if(!el.closest || !el.closest("#boneBox")) return;
 var row=el.closest(".fb-item"); if(!row) return;
 var k=el.getAttribute("data-k"), sel=row.querySelector('[data-k="sel"]');
 if(k==="sel" && el.checked){
  if(row.querySelector('[data-k="st"]').value==="out"){ el.checked=false; pickMsg(t("selOut")); return; }
  var n=document.querySelectorAll('#boneBox [data-k="sel"]:checked').length;
  if(n>MAXSEL){ el.checked=false; pickMsg(t("selMax")); return; }
  pickMsg("");
 }
 if(k==="st" && el.value==="out" && sel && sel.checked){ sel.checked=false; pickMsg(t("selOut")); }
 if(k==="sel" && !el.checked) pickMsg("");
},true);
document.addEventListener("change",function(e){
 var el=e.target; if(!el.closest) return;
 if(el.id==="f-set") applySet(el.value);
 if(el.closest("#selBox")) readVer();
},true);

/* ---------- automatic audit of analyses ---------- */
var CHECKS=["ref","effect","bones","ev","max3","ver","person","test","sim","cm","rev"];
function auditRecord(r){
 var ca=atLeast(r,"causes"), se=atLeast(r,"selected"), ve=atLeast(r,"verified"), res={};
 res.ref=!!txt(r.ref);
 res.effect=effDone(r);
 res.bones=ca?bonesWith(r)>=3:null;
 res.ev=ca?nNoEv(r)===0:null;
 res.max3=se?selRaw(r)<=MAXSEL:null;
 res.ver=se?allVer(r):null;
 res.person=se?!personAny(r):null;
 res.test=se?rootDone(r):null;
 res.sim=se?!!r.similar:null;
 res.cm=se?(r.cms.length>0&&r.cms.every(function(c){ return txt(c.t)&&txt(c.owner); })):null;
 res.rev=ve?(!!txt(r.review.by)&&isD(r.review.date)&&!revInTeam(r)):null;
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
 var R=DB.records, c={n:R.length,rev:0,ver:0,capa:0,causes:0,out:0,w5:0,person:0,sup:0,cand:0};
 R.forEach(function(r){ var s=stageOf(r), k=cnt(r); if(s==="reviewed") c.rev++; if(allVer(r)) c.ver++; if(r.capa) c.capa++; c.causes+=k.all; c.out+=k.out; c.sup+=k.sup; c.cand+=k.cand; c.w5+=k.w5; if(personAny(r)) c.person++; });
 return c;
}
function pct(a,n){ return n?Math.round(a/n*100)+"%":"—"; }
function renderDash(){
 var box=document.getElementById("dKpis"); if(!box) return;
 var c=counts(), au=auditSummary(), as=assessScore(), n=c.n, oi=openItems();
 box.innerHTML=TBX.kpi(n,t("kTotal"))+TBX.kpi(c.rev,t("kRev"))+TBX.kpi(pct(c.ver,n),t("kVer"))+TBX.kpi(pct(c.capa,n),t("kCapa"))+TBX.kpi(c.causes,t("kCauses"))+TBX.kpi(c.out,t("kOut"))+TBX.kpi(c.w5,t("kW5"))+TBX.kpi(c.person,t("kPerson"))+TBX.kpi(oi.length,t("kOpen"))+TBX.kpi(au.rate===null?"—":au.rate+"%",t("kAud"))+TBX.kpi(as+"%",t("kAs"));
 var nd='<p class="pd-sub" style="color:var(--ink-soft)">'+esc(t("noData"))+'</p>';
 document.getElementById("dStage").innerHTML=n?TBX.dist(STAGES,n,function(s){ return DB.records.filter(function(r){ return stageOf(r)===s; }).length; },stageName,function(s){ return SCOL[s]; }):nd;
 document.getElementById("dCause").innerHTML=c.causes?TBX.dist(["sup","cand","out"],c.causes,function(k){ return c[k]; },function(k){ return t("cst_"+k); },function(k){ return {sup:"#3C9A5F",cand:"#C9821A",out:"#9AA5B8"}[k]; }):nd;
 document.getElementById("dAssess").innerHTML=AGROUPS.map(function(g){ var p=assessScore(g); return TBX.bar(t("g_"+g),p+"%",p,GCOL[g]); }).join("")+'<p class="pd-sub" style="font-size:12.5px;color:var(--muted);margin:10px 0 0">'+esc(t("bandNote"))+'</p>';
 document.getElementById("dOpen").innerHTML=oi.length?oi.map(function(x){ return '<li><b>'+esc(x.r.ref||x.r.id)+'</b>'+chip([x.r.id,"info"])+'<span>'+esc(x.s)+'</span></li>'; }).join(""):'<li>'+esc(n?t("noOpen"):t("noData"))+'</li>';
}

/* ---------- report and CSV ---------- */
function buildCSV(){
 var head=["id","ref","title","source","capa","pdca","area","date","lead","stage","what","where","when","howMuch","team","categorySet","categories","causes","selectedCauses","root","personOnly","test","similar","similarNote","countermeasures","reviewer","reviewDate"];
 return TBX.csv(head,DB.records.map(function(r){
  var cs=items(r).map(function(x){ return (r.bones[x.b].name||"#"+(x.b+1))+" > "+(x.lvl?"– ":"")+x.it.t+(x.it.ev?" ["+x.it.ev+"]":"")+" ("+x.it.st+(x.it.v?", "+x.it.v:"")+")"; }).join(" | ");
  var sl=selList(r).map(function(x,i){ return (i+1)+". "+x.it.t+" — "+(x.it.ver.how==="why5"?"5 Whys "+(x.it.ver.w5||"—"):"data: "+(x.it.ver.note||"—"))+" — "+(x.it.ver.res||"open"); }).join(" | ");
  return [r.id,r.ref,r.title,r.src,r.capa,r.pdca,r.area,r.date,r.lead,stageOf(r),r.effect.what,r.effect.where,r.effect.when,r.effect.much,
  r.team.map(function(m){ return m.n+(m.role?" ("+m.role+")":"")+(m.work?" *":""); }).join("; "),r.set,r.bones.map(function(b){ return b.name+": "+b.causes.length; }).join("; "),cs,sl,r.root,personAny(r)?"yes":"no",r.test,r.similar,r.similarNote,
  r.cms.map(function(c){ return c.t+" — "+c.owner; }).join(" | "),r.review.by,r.review.date]; }));
}
var STC={sup:"#2F7D4B",cand:"#86520F",out:"#7A869E"};
function recReport(r){
 var S=selList(r), rows=items(r).map(function(x){ var sn=S.findIndex(function(y){ return y.it.id===x.it.id; });
  return '<tr><td>'+esc(r.bones[x.b].name||"#"+(x.b+1))+'</td><td>'+(x.lvl?'<span style="color:#7A869E">– </span>':'')+(sn>=0?'<b style="color:#B8901E">★'+(sn+1)+'</b> ':'')+esc(x.it.t)+'</td><td>'+esc(x.lvl?t("rpSub"):t("rpMain"))+'</td><td>'+esc(x.it.ev||"—")+'</td><td style="color:'+STC[x.it.st]+'">'+esc(t("cst_"+x.it.st))+'</td><td style="text-align:center">'+(x.it.v||"")+'</td></tr>'; }).join("");
 return '<section class="an"><h3><span dir="ltr">'+esc(r.id)+'</span> · <span dir="ltr">'+esc(r.ref||"—")+'</span> — '+esc(r.title)+'</h3>'+
  '<p class="meta">'+esc(t("colStage"))+': <b>'+esc(stageName(stageOf(r)))+'</b> · '+esc(srcName(r.src))+(r.capa?' · CAPA <span dir="ltr">'+esc(r.capa)+'</span>':'')+(r.pdca?' · PDCA <span dir="ltr">'+esc(r.pdca)+'</span>':'')+(r.date?' · <span dir="ltr">'+esc(r.date)+'</span>':'')+' · '+esc(setName(r.set))+'</p>'+
  '<table><tbody><tr><th>'+esc(t("f_what"))+'</th><td>'+esc(r.effect.what||"—")+'</td></tr><tr><th>'+esc(t("f_where"))+'</th><td>'+esc(r.effect.where||"—")+'</td></tr><tr><th>'+esc(t("f_when"))+'</th><td>'+esc(r.effect.when||"—")+'</td></tr><tr><th>'+esc(t("f_much"))+'</th><td>'+esc(r.effect.much||"—")+'</td></tr><tr><th>'+esc(t("sTeamT"))+'</th><td>'+esc(r.team.map(function(m){ return m.n+(m.role?" ("+m.role+")":"")+(m.work?" ✱":""); }).join("، ")||"—")+'</td></tr></tbody></table>'+
  '<div class="dg">'+diagramSVG(r)+'</div>'+
  (rows?'<table class="cs"><thead><tr><th>'+esc(t("rpBone"))+'</th><th>'+esc(t("rpCause"))+'</th><th>'+esc(t("rpLvl"))+'</th><th>'+esc(t("cEv"))+'</th><th>'+esc(t("cSt"))+'</th><th>'+esc(t("cV"))+'</th></tr></thead><tbody>'+rows+'</tbody></table>':'')+
  '<h4>'+esc(t("rpSelT"))+'</h4>'+(S.length?'<table><thead><tr><th>#</th><th>'+esc(t("rpCause"))+'</th><th>'+esc(t("rpHow"))+'</th><th>'+esc(t("vRes"))+'</th></tr></thead><tbody>'+S.map(function(x,i){ var v=x.it.ver;
   return '<tr><td>'+(i+1)+'</td><td>'+esc(x.it.t)+'</td><td>'+(v.how==="why5"?esc(t("vHow_why5"))+': <span dir="ltr">'+esc(v.w5||"—")+'</span>':esc(t("vHow_data"))+': '+esc(v.note||"—"))+'</td><td class="'+(verified(x.it)?"ok":(v.res==="no"?"bad":"na"))+'">'+esc(t("vRes_"+v.res))+'</td></tr>'; }).join("")+'</tbody></table>':'<p class="meta">'+esc(t("selNone"))+'</p>')+
  '<p><b>'+esc(t("f_root"))+':</b> '+esc(r.root||"—")+(personAny(r)?' <span class="bad">('+esc(t("fl_person"))+')</span>':'')+'</p>'+
  '<p><b>'+esc(t("f_test"))+'</b> '+esc(t("ts_"+r.test))+'</p>'+
  '<p><b>'+esc(t("f_similar"))+':</b> '+esc(t("sim_"+r.similar))+(r.similarNote?' — '+esc(r.similarNote):'')+'</p>'+
  (r.cms.length?'<p><b>'+esc(t("sCmT"))+':</b></p><ul>'+r.cms.map(function(c){ return '<li>'+esc(c.t)+' — '+esc(c.owner||"—")+'</li>'; }).join("")+'</ul>':'')+
  '<p><b>'+esc(t("sRevT"))+':</b> '+esc(r.review.by||"—")+(r.review.date?' · <span dir="ltr">'+esc(r.review.date)+'</span>':'')+(r.review.note?' — '+esc(r.review.note):'')+'</p></section>';
}
function buildReportHTML(){
 var c=counts(), au=auditSummary(), as=assessScore(), d=today(), n=c.n, A=TBX.audit(DB.records,auditRecord,CHECKS), oi=openItems();
 var mark=function(v){ return v===null?'<td class="na">—</td>':(v?'<td class="ok">✓</td>':'<td class="bad">✗</td>'); };
 var grpRows=AGROUPS.map(function(g){ return '<tr><td>'+esc(t("g_"+g))+' — '+g+'</td><td>'+assessScore(g)+'%</td></tr>'; }).join("");
 var auRows=A.rows.map(function(x){ return '<tr><td dir="ltr">'+esc(x.r.id)+'</td>'+CHECKS.map(function(k){ return mark(x.res[k]); }).join("")+'</tr>'; }).join("");
 var body='<div class="cover"><p class="kick">Continual Improvement Academy · CIA Toolbox</p><h1>Fishbone — Cause and effect analysis / تحليل عظمة السمكة</h1><p class="sub">'+esc(t("rpCover"))+'</p>'+
  '<p class="meta">'+esc(t("prep"))+': <bdi><strong>مدثر سلامه</strong></bdi> · <bdi dir="ltr">'+esc(d)+'</bdi> · <bdi>'+esc(t("kTotal"))+': '+n+'</bdi></p></div>'+
  '<h2>Summary / الملخص</h2><div class="k">'+
   '<div><b>'+n+'</b>'+esc(t("kTotal"))+'</div><div><b>'+c.rev+'</b>'+esc(t("kRev"))+'</div><div><b>'+pct(c.ver,n)+'</b>'+esc(t("kVer"))+'</div><div><b>'+pct(c.capa,n)+'</b>'+esc(t("kCapa"))+'</div><div><b>'+c.causes+'</b>'+esc(t("kCauses"))+'</div><div><b>'+c.out+'</b>'+esc(t("kOut"))+'</div><div><b>'+oi.length+'</b>'+esc(t("kOpen"))+'</div><div><b>'+(au.rate===null?"—":au.rate+"%")+'</b>'+esc(t("kAud"))+'</div><div><b>'+as+'%</b>'+esc(t("kAs"))+'</div></div>'+
  '<h2>Analyses / التحليلات</h2>'+(n?DB.records.map(recReport).join(""):'<p class="meta">'+esc(t("rpEmpty"))+'</p>')+
  '<h2>Audit results / نتائج التدقيق</h2>'+(n?'<p>'+esc(t("auPass"))+': '+(au.rate===null?"—":au.rate+"% ("+au.pass+"/"+au.applic+")")+'</p><table><thead><tr><th>ID</th>'+CHECKS.map(function(k){ return '<th>'+esc(t("c_"+k))+'</th>'; }).join("")+'</tr></thead><tbody>'+auRows+'</tbody></table>':'<p class="meta">—</p>')+
  '<h2>Open items / بنود تحتاج متابعة</h2>'+(oi.length?'<ul>'+oi.map(function(x){ return '<li><span dir="ltr">'+esc(x.r.id)+' · '+esc(x.r.ref||"—")+'</span> — '+esc(x.s)+'</li>'; }).join("")+'</ul>':'<p class="meta">'+esc(n?t("noOpen"):"—")+'</p>')+
  '<h2>Self-assessment / التقييم الذاتي</h2><table><thead><tr><th>Group / المجموعة</th><th>Score / النتيجة</th></tr></thead><tbody>'+grpRows+'<tr><td><b>'+esc(t("kAs"))+'</b></td><td><b>'+as+'%</b></td></tr></tbody></table><p class="meta">'+esc(t("bandNote"))+'</p>'+
  '<footer>Prepared by / أعدّه: مدثر سلامه · Fishbone (Ishikawa) is a working method, not a requirement of any standard; the categories are prompts and a cause on the diagram is a candidate until evidence supports it. Sources / المراجع: ISO 9001:2026 clauses 7.1.6, 7.2, 9.1.3, 10.1 and 10.2 and Annex A.10.2; ISO 9000:2026 3.5.13, 3.6.4, 3.8.6, 4.2.6 and 4.2.7 (interpretive summaries, not the official text) · Examples are illustrative.</footer>';
 return TBX.reportDoc(L,'Fishbone Report — مدثر سلامه',body,'.ok{color:#2F7D4B;font-weight:700;text-align:center}.bad{color:#B42318;font-weight:700}td.bad{text-align:center}.na{color:#7A869E;text-align:center}ul{padding-inline-start:20px}h3{font-family:Georgia,serif;margin:22px 0 4px;font-size:17px}h4{margin:14px 0 4px;font-size:14.5px}.an{border-top:1px solid #DCE4EE;padding-top:6px;break-inside:auto}.an th{background:#F3F7FB;color:#1B2A4A}.an tbody th{width:30%}.dg{margin:12px 0;border:1px solid #DCE4EE;border-radius:10px;padding:6px;overflow-x:auto;break-inside:avoid}.dg svg{display:block;max-width:100%;height:auto;margin:auto}.cs td{font-size:13px}.cover{border-bottom:4px solid #B8901E;padding:18px 0 14px;margin-bottom:8px}.cover h1{border:0;margin:6px 0}.cover .kick{color:#B8901E;font-weight:700;letter-spacing:.04em;margin:0}.cover .sub{font-size:18px;margin:4px 0}@media print{.dg{page-break-inside:avoid}}');
}
function stamp(){ return today(); }
function renderReport(){
 var prev=document.getElementById("rpPrev"); if(!prev) return;
 if(!DB.records.length){ prev.innerHTML='<p class="pd-sub" style="color:var(--ink-soft)">'+esc(t("rpEmpty"))+'</p>'; return; }
 var c=counts(), au=auditSummary();
 prev.innerHTML='<div class="pd-kpis">'+TBX.kpi(c.n,t("kTotal"))+TBX.kpi(c.rev,t("kRev"))+TBX.kpi(openItems().length,t("kOpen"))+TBX.kpi(au.rate===null?"—":au.rate+"%",t("kAud"))+'</div>';
}
document.getElementById("rpHtml").addEventListener("click",function(){
 var err=document.getElementById("rpErr"); err.textContent="";
 if(!DB.records.length && !Object.keys(DB.assess).length){ err.textContent=t("rpEmpty"); return; }
 TBX.download("Fishbone-report-"+stamp()+".html","text/html;charset=utf-8",buildReportHTML());
});
document.getElementById("rpCsv").addEventListener("click",function(){ var err=document.getElementById("rpErr"); err.textContent=""; if(!DB.records.length){ err.textContent=t("rpEmpty"); return; } TBX.download("Fishbone-analyses-"+stamp()+".csv","text/csv;charset=utf-8",buildCSV()); });
document.getElementById("dCsv").addEventListener("click",function(){ if(!DB.records.length) return; TBX.download("Fishbone-analyses-"+stamp()+".csv","text/csv;charset=utf-8",buildCSV()); });

/* ---------- platform identity: academy logo and related tools ---------- */
var LOGO="__LOGO__";
function applyLogo(){ document.querySelectorAll("img[data-logo]").forEach(function(i){ if(i.src!==LOGO) i.src=LOGO; i.alt=t("logoAlt"); }); }
var RELATED=[["capa","CAPA","./capa.html","#C2410C"],["why5","5 Whys","./five-whys.html","#3563C9"],["pdca","PDCA","./pdca.html","#1E8C93"],["aud","ISO 19011","./smart-audit-improvement.html","#C9821A"]];
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
 DB={records:[],assess:{}}; pendingDelete=null; CP=null;
 TBX.drop(STORE);
 clearForm(); renderAll();
 document.getElementById("cpTable").hidden=true; document.getElementById("cpMsg").textContent="";
 var m=document.getElementById("exMsg"); if(m) m.textContent=t("exCleared");
 var a=document.getElementById("asMsg"); if(a) a.textContent="";
}
/* the tour layer asks for confirmation before the example replaces data (guard "pfEx": "all"); clearing asks here */
document.getElementById("pfEx").addEventListener("click",function(){ loadExample(); });
document.getElementById("pfReset").addEventListener("click",function(){ var ok=true; try{ ok=window.confirm(t("exConfirmClear")); }catch(e){ ok=true; } if(ok) clearAll(); });

/* ---------- assistant: answers from the tool's own guide and your analyses (rule-based, no AI service) ---------- */
var CONTACT_EMAIL="moddathersalama.eng@gmail.com";
var CB={
 ar:{fab:"اسأل عن عظمة السمكة",title:"مساعد عظمة السمكة",sub:"إجابات فورية من دليل الأداة وتحليلاتك",new:"محادثة جديدة",close:"إغلاق",ph:"اكتب سؤالك…",send:"إرسال",inL:"سؤالك",
  hello:"مرحباً. أجيب عن أسئلة «عظمة السمكة» من دليل الأداة ومن تحليلاتك المحفوظة في هذا المتصفح. اختر سؤالاً أو اكتب سؤالك.",
  miss:"لم أجد إجابة جاهزة لهذا السؤال. جرّب أحد الأسئلة المقترحة، أو اسأل عن: الفرق مع لماذا الخمس، أو الفئات، أو الدليل، أو اختيار الأسباب، أو الخطأ البشري، أو CAPA. وللاستشارة راسل المُعِد على البريد أدناه.",
  instant:"إجابة فورية",foot:"المساعد يعمل في متصفحك ولا يرسل بياناتك. للتواصل:",
  op0:"لا توجد بنود مفتوحة في تحليلاتك الآن.",st0:"لا توجد تحليلات بعد. ابدأ من [[tab:tools]] أو حمّل المثال من [[tab:docs]]."},
 en:{fab:"Ask about Fishbone",title:"Fishbone assistant",sub:"Instant answers from the tool's guide and your analyses",new:"New chat",close:"Close",ph:"Type your question…",send:"Send",inL:"Your question",
  hello:"Hello. I answer Fishbone questions from the tool's guide and from your analyses saved in this browser. Pick a question or type your own.",
  miss:"I have no ready answer for that. Try one of the suggested questions, or ask about Fishbone versus 5 Whys, categories, evidence, picking causes, human error or CAPA. For advice, email the author at the address below.",
  instant:"Instant answer",foot:"The assistant runs in your browser and sends no data. Contact:",
  op0:"No open items in your analyses right now.",st0:"No analyses yet. Start from the [[tab:tools]] or load the example in [[tab:docs]]."}
};
var KB=[
 {id:"fb5",k:["لماذا الخمس","5 whys","five whys","5whys","الفرق","difference","أيهما","which","or"],q:{ar:"عظمة السمكة أم لماذا الخمس؟",en:"Fishbone or 5 Whys?"},
  a:{ar:"تعملان معاً. **عظمة السمكة** تنشر الأسباب الممكنة على فئات عندما تكون كثيرة أو غير واضحة، فتبيّن **أين تبحث**. و**لماذا الخمس** تحفر في سبب واحد حتى تصل إلى سبب تستطيع المنشأة تغييره. الترتيب المعتاد: ارسم الأسباب هنا، واختر سببين أو ثلاثة هي الأرجح، ثم تحقق من كل منها بزر «حلّل بأداة لماذا الخمس» أو بالبيانات. وإذا كان للمشكلة مسار واحد واضح فابدأ مباشرة بلماذا الخمس. التفاصيل في [[tab:explain-std]].",
   en:"They work together. **Fishbone** spreads the possible causes across categories when they are many or unclear, so it shows **where to look**. **5 Whys** digs into one cause until it reaches a cause the organization can change. The usual order: map the causes here, pick the two or three most likely, then verify each with “Analyse with 5 Whys” or with data. If the problem has one clear path, start with 5 Whys directly. Details in the [[tab:explain-std]]."}},
 {id:"cats",k:["فئة","فئات","6m","4s","8p","category","categories","bones","عظام","عظمة"],q:{ar:"أي الفئات أستخدم؟",en:"Which categories should I use?"},
  a:{ar:"الفئات **محفّزات** للتفكير، لا قائمة ثابتة. **6M** (الأفراد، والطريقة، والمواد، والآلات والمعدات، والقياس، والبيئة) تناسب التصنيع والمقاولات. **4S** (المحيط، والموردون، والأنظمة، والمهارات) تناسب الخدمات والعمليات المساندة. **8P** تناسب التسويق والخدمات. أعد تسمية أي فئة أو أضف فئة حتى ثماني. تغيير المجموعة لا يحذف أي سبب مكتوب.",
   en:"Categories are **prompts**, not a fixed list. **6M** (people, method, materials, machines and equipment, measurement, environment) fits manufacturing and construction. **4S** (surroundings, suppliers, systems, skills) fits services and support processes. **8P** fits marketing and services. Rename any category or add one, up to eight. Changing the set never deletes a cause you wrote."}},
 {id:"evid",k:["دليل","أدلة","مرشح","مدعوم","مستبعد","evidence","candidate","supported","ruled out","rule out","استبعاد"],q:{ar:"متى يصبح السبب مدعوماً، ومتى أستبعده؟",en:"When is a cause supported, and when do I rule it out?"},
  a:{ar:"كل سبب يبدأ **مرشّحاً**. يصبح **مدعوماً بالدليل** عندما تكتب بجانبه دليلاً يمكن عرضه: سجل، أو صورة، أو وثيقة بإصدارها، أو بيانات. و**تستبعده** عندما يقول الدليل إنه لم يعمل (مثلاً: شهادة المعايرة سارية)، واكتب الدليل نفسه بجانبه. لا تحذف السبب المستبعد: بقاؤه على المخطط يبيّن للمدقق أنكم نظرتم فيه.",
   en:"Every cause starts as a **candidate**. It becomes **supported by evidence** when you write next to it evidence you can show: a record, a photo, a document with its revision, or data. You **rule it out** when the evidence says it did not act (for example: the calibration certificate is valid), and you write that evidence next to it. Do not delete a ruled-out cause: keeping it on the diagram shows the auditor you looked at it."}},
 {id:"pick",k:["اختيار","أختار","اختار","تصويت","أصوات","وزن","ثلاثة","pick","select","vote","votes","weight","three","how many"],q:{ar:"كم سبباً أختار للتحقق، وكيف؟",en:"How many causes do I pick to verify, and how?"},
  a:{ar:"**ثلاثة على الأكثر**. استخدم الأصوات أو الوزن ليظهر رأي الفريق، لكن اختر من بين الأسباب **المدعومة بالدليل** أولاً. لكل سبب مختار تحقق واحد: تحليل «لماذا الخمس» مربوط، أو ملاحظة بالبيانات، ثم النتيجة «مؤكد» أو «غير مؤكد». إذا لم يؤكد التحقق سبباً فارجع إلى المخطط واختر غيره.",
   en:"**Three at most.** Use votes or weight to show the team's view, but pick from the causes **supported by evidence** first. Each selected cause gets one verification: a linked 5 Whys analysis, or a note with data, then the result “confirmed” or “not confirmed”. If the verification does not confirm a cause, go back to the diagram and pick another."}},
 {id:"human",k:["خطأ بشري","بشري","إهمال","اهمال","لوم","human","blame","negligence","people"],q:{ar:"ماذا أفعل إذا كتب الفريق «خطأ بشري» على عظمة الأفراد؟",en:"What if the team writes “human error” on the people bone?"},
  a:{ar:"«خطأ بشري» وصف لما حدث، وليس سبباً. اكتب بدلاً منه ما في العملية سمح بالخطأ: نموذج غامض، أو فحص ثانٍ غائب، أو تدريب ناقص، أو عبء عمل، أو تصميم يسهّل الخطأ. تنبّه الأداة عندما يشير سبب مختار أو السبب الجذري إلى شخص فقط، ويفشل فحص «السبب المختار ليس شخصاً فقط» في [[tab:audit]].",
   en:"“Human error” describes what happened; it is not a cause. Write instead what in the process allowed the mistake: an unclear form, a missing second check, incomplete training, workload, or a design that makes the error easy. The tool warns when a selected cause or the root cause points at a person only, and the check “selected cause is not a person alone” fails in the [[tab:audit]]."}},
 {id:"capa",k:["capa","إجراء تصحيحي","تصحيحي","corrective","ربط","link"],q:{ar:"كيف يرتبط التحليل بسجل CAPA؟",en:"How does the analysis link to a CAPA record?"},
  a:{ar:"ابدأ من [[tab:tools]] ← «ابدأ من سجل CAPA»: تقرأ الأداة سجلات CAPA وتعبّئ المرجع والأثر، وتنقل أسطر تحليل السبب المكتوبة بصيغة «الفئة: السبب» أسباباً مرشحة، دون أن تكتب شيئاً في CAPA. وفي أداة CAPA يظهر في قسم تحليل السبب كل تحليل عظمة سمكة يذكر السجل، مع زر «استخدم هذا السبب الجذري» الذي ينسخ النص إلى حقل السجل عندما تضغطه وتحفظ. البيانات تبقى في هذا المتصفح تحت المفتاح cia-fish:v1.",
   en:"Start in the [[tab:tools]] → “Start from a CAPA record”: the tool reads the CAPA records, fills the reference and the effect, and brings lines of the cause analysis written as “Category: cause” across as candidate causes, writing nothing to CAPA. In the CAPA tool, the cause analysis section lists every Fishbone analysis that names the record, with “Use this root cause”, which copies the text into the record's field when you click it and save. The data stays in this browser under the key cia-fish:v1."}},
 {id:"open",dyn:"open",k:["مفتوح","مفتوحة","متابعة","open items","follow"],q:{ar:"ما البنود المفتوحة في تحليلاتي؟",en:"What is still open in my analyses?"}},
 {id:"status",dyn:"status",k:["وضع","حالة","ملخص","status","summary","where do we stand"],q:{ar:"ما وضع تحليلاتي الآن؟",en:"Where do my analyses stand?"}}
];
var CB_SUG=["fb5","cats","pick","human","status"];
function kbDyn(id){
 var u=CB[L]||CB.ar;
 if(id==="open"){ var O=openItems(); if(!O.length) return u.op0+"\n\n[[tab:dash]]"; return O.map(function(x){ return "- **"+(x.r.ref||x.r.id)+"** — "+x.s; }).join("\n")+"\n\n[[tab:docs]] · [[tab:dash]]"; }
 if(id==="status"){ var c=counts(); if(!c.n) return u.st0; return "- "+t("kTotal")+": **"+c.n+"**\n- "+t("kVer")+": **"+c.ver+"**\n- "+t("kRev")+": **"+c.rev+"**\n- "+t("kCapa")+": **"+c.capa+"**\n- "+t("kCauses")+": **"+c.causes+"**\n- "+t("kOpen")+": **"+openItems().length+"**\n- "+t("kAs")+": **"+assessScore()+"%**\n\n[[tab:dash]] · [[tab:audit]]"; }
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
function renderAll(){ renderDocs(); renderAudit(); renderDash(); renderReport(); renderAssess(); renderHomeCp(); refreshForm(); }
document.getElementById("rec-form").addEventListener("submit",function(e){ e.preventDefault(); saveRecord(); });
document.getElementById("rec-form").addEventListener("input",function(e){ if(e.target.closest&&e.target.closest("#selBox")) readVer(); if(e.target.closest&&(e.target.closest("#boneBox")||e.target.closest("#selBox"))) autoSize(e.target); refreshForm(); });
document.getElementById("rec-form").addEventListener("change",function(){ refreshForm(); });
document.getElementById("newBtn").addEventListener("click",function(){ clearForm(); });
document.getElementById("langBtn").addEventListener("click",function(){ switchLang(); });
window.addEventListener("hashchange",function(){ var h=location.hash.slice(1); if(h!==curTab) go(h); });
window.addEventListener("storage",function(e){ if(e.key===PDCA_KEY||e.key===CAPA_KEY||e.key===WHY5_KEY){ renderHomeCp(); var cl=document.getElementById("capaList"); if(cl) cl.innerHTML=fill((capaRecs()||[]).map(function(r){ return [str(r.id),str(r.ref)+" · "+str(r.title)]; })); var dl=document.getElementById("pdcaList"); if(dl) dl.innerHTML=fill(pdcaCycles().map(function(c){ return [c.id,c.title]; })); if(CP) cpPreview(true); refreshForm(e.key===WHY5_KEY); } });

/* ---------- boot ---------- */
/* a link from CAPA may ask to open an analysis (?open=ID) or to start one from a CAPA record (?capa=ID);
   inside the hub the same request arrives as a one-time sessionStorage hint */
function navRequest(){
 var q={}; try{ var u=new URLSearchParams(location.search); if(u.get("open")) q.open=u.get("open"); if(u.get("capa")) q.capa=u.get("capa"); }catch(e){}
 try{ var h=JSON.parse(sessionStorage.getItem(NAV_KEY)||"null"); sessionStorage.removeItem(NAV_KEY); if(h&&typeof h==="object"){ if(h.open) q.open=String(h.open); if(h.capa) q.capa=String(h.capa); } }catch(e){}
 return q;
}
applyLang();
(function(){
 var q=navRequest(), r=q.open?DB.records.filter(function(x){ return x.id===q.open; })[0]:null;
 if(r){ loadRecordIntoForm(r); go("tools"); return; }
 if(q.capa && prefillFromCapa(q.capa)) return;
 go((location.hash||"#home").slice(1));
})();
