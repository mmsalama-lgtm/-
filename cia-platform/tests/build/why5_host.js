/* ===== 5 Whys tool — host logic. Analyses and assessment are stored in this browser only (localStorage, wrapped in try/catch). =====
   Storage key "cia-why5:v1" (this tool only). Schema:
   { records: [ {
       id, title, ref, src: "capa"|"ncr"|"audit"|"cc"|"inc"|"kpi", capa (CAPA record id), pdca (PDCA cycle id), area,
       date (YYYY-MM-DD, analysis date), lead (facilitator),
       prob:   {what, where, when, much}                      problem statement in four parts, from facts
       team:   [ {n, role, work: true|false} ]                work = this person does the work being analysed
       chains: [ {label, whys: [ {a, ev, st: "ok"|"chk"|"no"} ], stop} ]   chains[0] is the main chain; up to two branches
       root,
       test:   {stop: ""|"yes"|"part"|"no", reads: true|false}   "if this cause is removed, does the problem stop?" and the
                                                                  "… therefore …" reading from the root back to the problem
       similar: ""|"exist"|"could"|"none", similarNote,
       cms:    [ {t, owner} ]                                 countermeasures proposed (the action plan itself stays in CAPA)
       review: {by, date, note}                               review by someone outside the team
       created, updated } ],
     assess: { PR1..LK2: 0|1|2 } }
   Other tools' keys are only read, never written: "cia-capa:v1" (CAPA records: preview, prefill, names) and "cia-pdca:v1"
   (PDCA cycle names). Opening a given analysis from CAPA uses the address (?open=, ?capa=) or, inside the hub, the
   sessionStorage hint "cia-nav:five-whys" that this tool reads once and removes; neither holds tool data. */
var LKEY="cia-lang", STORE="cia-why5:v1", CAPA_KEY="cia-capa:v1", PDCA_KEY="cia-pdca:v1", NAV_KEY="cia-nav:five-whys";
var L=(function(){ try{ return localStorage.getItem(LKEY)||"ar"; }catch(e){ return "ar"; } })();
var TABS=["home","explain-std","explain-cl","assess","tools","docs","audit","dash","report","ai"];
var TITLES={ar:"5 Whys | لماذا الخمس — تحليل السبب الجذري — مدثر سلامه",en:"5 Whys | Root cause analysis — مدثر سلامه"};
var STAGES=["problem","chain","root","tested","reviewed"];
var SCOL={problem:"#C2410C",chain:"#3563C9",root:"#1B2A4A",tested:"#C9821A",reviewed:"#3C9A5F"};
var SRCS=["capa","ncr","audit","cc","inc","kpi"];
var CCOL=["#3563C9","#7B5BB8","#1E8C93"];
var MAXW=9, MAXB=2;
var DB=load();
var curTab="home";
var editing=null;   /* deep copy of the analysis open in the form: keeps created between saves */
var CP=null;        /* CAPA preview rows */

var UI={
ar:{brand:"أكاديمية التحسين المستمر · مدثر سلامه",toolName:"أداة لماذا الخمس — تحليل السبب الجذري",sgLearn:"التعلّم",sgWork:"العمل",sgOut:"المخرجات",
 nHome:"الرئيسية",nStd:"دليل المنهجية",nCl:"دليل البنود",nAssess:"التقييم الذاتي",nTools:"تحليل لماذا الخمس",nDocs:"السجلات",nAudit:"التدقيق",nDash:"لوحة المؤشرات",nReport:"التقرير",nAi:"المساعد الذكي",soon:"قريباً",
 homeCode:"عرّف المشكلة · اسأل لماذا · ادعم بالدليل · اختبر السبب",homeH1:"لماذا الخمس — تحليل السبب الجذري",
 homeLede:"أداة تقود جلسة تحليل السبب خطوة خطوة: مشكلة تُعرَّف من الوقائع، ثم سلسلة «لماذا» يُدعم كل جواب فيها بدليل، ثم سبب جذري يُختبر قبل اعتماده، ثم مراجعة من خارج الفريق. كل تحليل يمكن أن يبدأ من سجل CAPA ويُعاد سببه الجذري إليه.",
 homeNote:"النسخة الحالية تحفظ التحليلات في متصفحك فقط. الحفظ على الخادم وتسجيل الدخول يُضافان في مرحلة المنصة المشتركة.",
 prep:"إعداد",authorName:"مدثر سلامه",cycleT:"ما الذي تستطيع فعله هنا",cycleS:"اقرأ دليل المنهجية، ثم قيّم طريقة تحليلكم للأسباب، ثم ابدأ أول تحليل من سجل CAPA أو من مشكلة جديدة.",
 tStd:"كيف تُدار الجلسة، ومن يحضرها، ومتى تتوقف، ولماذا «الخمس» قاعدة تقريبية لا رقم ثابت.",tCl:"البنود التي تخدمها الطريقة في ISO 9001:2026، وأولها 10.2.1 ب: ملخص تفسيري ومثال وما يطلبه المدقق.",tAssess:"عشرة أسئلة تقيس ممارسة تحليل السبب الجذري لديكم، من تعريف المشكلة حتى نشر الدرس.",
 tTools:"تحليل كامل لكل مشكلة: التعريف، والفريق، وسلسلة لماذا بالدليل، والفروع، والسبب الجذري واختباره، والمراجعة.",tDocs:"كل التحليلات بمرحلتها وتنبيهاتها، وبيانات المثال.",tAudit:"فحص آلي لكل تحليل: تعريف المشكلة، والدليل، وقاعدة التوقف، واختبار السبب، والمراجعة المستقلة.",
 tDash:"التحليلات المختبرة والمراجعة والمرتبطة بـ CAPA، والبنود المفتوحة، والتقييم الذاتي، في صفحة واحدة.",tReport:"تقرير HTML يرسم كل تحليل سلسلةً بأدلتها، وملف CSV.",tAi:"مساعد يقرأ التحليل ويقترح السؤال التالي. لم يُفعَّل بعد.",
 foot:"المراجع: ISO 9001:2026 البنود 7.1.6 و7.2 و9.1.3 و10.1 و10.2 والملحق A.10.2، ومصطلحات ISO 9000:2026 (ملخصات تفسيرية، وليست النص الرسمي). «لماذا الخمس» طريقة عمل وليست متطلباً في أي مواصفة. الأمثلة توضيحية وليست بيانات حقيقية.",
 heroTag:"أداة منهجية · تخدم ISO 9001:2026 البند 10.2.1 ب",langSw:"English",langSwA:"Switch to English",logoAlt:"أكاديمية التحسين المستمر — مدثر سلامه",
 related:"أدوات مرتبطة في الأكاديمية",rel_capa:"الإجراءات التصحيحية",rel_pdca:"دورة التحسين المستمر",rel_aud:"مركز التدقيق والتحسين الذكي",rel_q:"دليل ISO 9001:2026",
 termT:"هل «لماذا الخمس» متطلب في ISO 9001:2026؟",
 termP1:"لا. «لماذا الخمس» طريقة لطرح الأسئلة، وليست بنداً في أي مواصفة. المتطلب الذي تخدمه هو تحديد أسباب عدم المطابقة في البند 10.2.1 ب) 2) من ISO 9001:2026، ومعه التحقق من وجود حالات مشابهة أو احتمال حدوثها في 10.2.1 ب) 3). ويترك الملحق A.10.2 للمنشأة أن تحدد مدى التحقيق والطرق التي تستخدمها بحسب سياقها.",
 termP2:"والرقم خمسة قاعدة تقريبية وليس شرطاً. توقّف عندما تصل إلى سبب تستطيع المنشأة أن تغيّره ويسنده الدليل؛ قد يحدث ذلك عند السؤال الثالث، وقد يحتاج سبعة. وإذا عملت أسباب مختلفة معاً، فافتح فرعاً لكل منها بدل أن تحشرها في سلسلة واحدة.",
 termIs:"ملخص تفسيري بصياغة مستقلة، وليس النص الرسمي. المصادر: ISO 9001:2026 البند 10.2.1 والملحق A.10.2، وISO 9000:2026 المصطلحات المذكورة والمبدأ 4.2.6. التحقق: 2026-10-11.",
 defs:[["عدم المطابقة","ISO 9000:2026 · 3.5.13","عدم استيفاء متطلب. هي نقطة بداية التحليل، وتُكتب كما وقعت.","#C2410C"],["الإجراء التصحيحي","ISO 9000:2026 · 3.6.4","إزالة سبب عدم المطابقة ومنع تكرارها. التحليل يحدد السبب، والإجراء يُخطط له في CAPA.","#1B2A4A"],["الدليل الموضوعي","ISO 9000:2026 · 3.8.6","بيانات تدعم وجود شيء أو صحته. كل جواب «لأن…» في السلسلة يحتاج دليلاً من هذا النوع.","#3563C9"],["السبب الجذري","غير معرَّف كمصطلح","لا تعرّف ISO 9000:2026 «السبب الجذري» مصطلحاً، وتذكر التحقق من السبب الجذري ضمن مبدأ التحسين (4.2.6). في هذه الأداة: السبب الذي إذا أُزيل توقفت المشكلة.","#3C9A5F"]],
 asT:"التقييم الذاتي لممارسة تحليل السبب الجذري",asS:"أجب عن كل سؤال بما يحدث فعلاً في تحليلاتكم. النتيجة تقيس الممارسة الحالية، وليست شهادة ولا حكماً على الأداء.",asReset:"مسح الإجابات",asSaved:"تم حفظ الإجابة",asAnswered:"أُجيب {n} من 10",
 band0:"يحتاج عملاً",band1:"في طور التطوير",band2:"راسخ",bandNote:"حدود داخلية للتقييم الذاتي من تصميم هذه الأداة، وليست معياراً رسمياً.",as0:"غير موجود",as1:"جزئي",as2:"موجود ومطبّق",
 g_PR:"المشكلة والفريق",g_CH:"سلسلة لماذا",g_RT:"السبب الجذري",g_LK:"الربط والتعلّم",
 tlT:"تحليل لماذا الخمس",tlS:"تحليل واحد لكل مشكلة. اكتب المشكلة من الوقائع، ثم اسأل «لماذا؟» وادعم كل جواب بدليل، وتوقف عند سبب تستطيع المنشأة تغييره. تتحدد المرحلة تلقائياً مما تملؤه.",
 save:"حفظ التحليل",newRec:"تحليل جديد",savedFail:"تعذّر الحفظ في هذا المتصفح. نزّل التقرير قبل إغلاق الصفحة.",cur:"المرحلة الحالية:",ok_rec:"تم حفظ التحليل",
 st_problem:"تعريف المشكلة",st_chain:"سلسلة لماذا",st_root:"السبب الجذري",st_tested:"اختُبر السبب",st_reviewed:"روجع التحليل",
 sProbT:"المشكلة · البند 10.2.1 ب) 1)",sProbS:"أربعة أجزاء من الوقائع لا من الآراء: ماذا حدث، وأين، ومتى، وكم.",
 sTeamT:"الفريق",sTeamS:"من حضر التحليل ودوره. يحتاج الفريق شخصاً واحداً على الأقل ممن يؤدون العمل نفسه.",
 sChainT:"سلسلة لماذا · البند 10.2.1 ب) 2)",sChainS:"سلسلة رئيسية، وفرعان كحد أقصى للأسباب التي عملت معاً. لكل جواب دليله وحالة التحقق منه.",
 sRootT:"السبب الجذري واختباره",sRootS:"اكتب السبب الجذري، ثم اختبره: إذا أُزيل هذا السبب، هل تتوقف المشكلة؟ واقرأ السلسلة عكسياً بكلمة «لذلك».",
 sSimT:"الحالات المشابهة · البند 10.2.1 ب) 3)",sSimS:"هل توجد الحالة نفسها في موقع أو عملية أخرى، أو قد تحدث؟",
 sCmT:"الإجراءات المقترحة",sCmS:"إجراءات تزيل السبب الجذري، لكل منها مالك. خطة الإجراء الكاملة بمواعيدها ومتابعتها تبقى في سجل CAPA.",
 sRevT:"المراجعة",sRevS:"يراجع التحليلَ شخصٌ من خارج الفريق ويؤرخ مراجعته.",
 f_title:"عنوان مختصر",f_ref:"رقم المرجع (CAPA أو NCR أو ملاحظة التدقيق)",f_src:"المصدر",f_capa:"سجل CAPA المرتبط",f_pdca:"دورة PDCA المرتبطة",f_area:"العملية أو الموقع",f_date:"تاريخ التحليل",f_lead:"ميسّر الجلسة",
 f_what:"ماذا حدث؟",f_where:"أين؟",f_when:"متى؟",f_much:"كم؟ (العدد أو النسبة أو الأثر)",f_root:"السبب الجذري",f_tstop:"إذا أُزيل هذا السبب، هل تتوقف المشكلة؟",f_similar:"حالات مشابهة",f_similarNote:"أين؟ وماذا فُعل؟",
 f_rby:"المراجِع (من خارج الفريق)",f_rdate:"تاريخ المراجعة",f_rnote:"ملاحظة المراجعة",
 src_capa:"سجل CAPA",src_ncr:"تقرير عدم مطابقة (NCR)",src_audit:"ملاحظة تدقيق",src_cc:"شكوى عميل",src_inc:"حادث",src_kpi:"مؤشر أداء",
 ts_:"—",ts_yes:"نعم، تتوقف",ts_part:"جزئياً فقط",ts_no:"لا",
 sim_:"—",sim_none:"لا توجد",sim_exist:"توجد حالات مشابهة",sim_could:"قد تحدث في مكان آخر",
 wst_ok:"متحقق منه",wst_chk:"يحتاج تحققاً",wst_no:"غير مدعوم",
 tmN:"الاسم",tmRole:"الدور",tmWork:"يؤدي العمل",tmAdd:"إضافة عضو",tmDel:"حذف العضو",tmNone:"لم يُضف أحد بعد.",
 mainCh:"السلسلة الرئيسية",branch:"فرع {n}",brLabel:"اسم الفرع (السبب الموازي)",brPh:"مثال: ماء الخلط",brDel:"حذف الفرع",brAdd:"إضافة فرع لسبب موازٍ",brMax:"الحد الأقصى فرعان.",
 wAns:"الجواب: لأن…",wEv:"الدليل",wSt:"التحقق",wAdd:"إضافة «لماذا»",wDel:"حذف هذا السؤال",wMax:"الحد الأقصى {n} أسئلة في السلسلة.",
 q0:"لماذا حدث هذا: {p}؟",q0b:"لماذا حدث هذا من مسار آخر؟",qn:"لماذا: {p}؟",stopL:"لماذا توقفنا هنا؟ (السبب الأخير تستطيع المنشأة تغييره، والدليل يسنده)",
 revT:"القراءة العكسية: من السبب الجذري إلى المشكلة",revEmpty:"اكتب أجوبة السلسلة لتظهر القراءة العكسية.",therefore:"لذلك",readsL:"قرأت السلسلة عكسياً بكلمة «لذلك»، وكل خطوة فيها منطقية ومدعومة.",
 personW:"هذا السبب الجذري يشير إلى شخص فقط («خطأ بشري» أو «إهمال»). اسأل: ما الذي في العملية سمح بذلك؟ الطريقة، أو النموذج، أو التدريب، أو عبء العمل، أو التصميم. ثم أعد كتابته سبباً تستطيع المنشأة تغييره.",
 testW:"الاختبار لم يكتمل: إذا لم تتوقف المشكلة بإزالة هذا السبب، فهناك سبب آخر. افتح فرعاً أو أكمل السلسلة.",
 workW:"لا يوجد في الفريق من يؤدي العمل نفسه. أضف شخصاً واحداً على الأقل؛ فهو من يعرف ما يحدث فعلاً.",
 revW:"المراجِع من أعضاء الفريق. اختر شخصاً من خارجه.",
 cmT:"الإجراء المقترح",cmOwner:"المالك",cmAdd:"إضافة إجراء مقترح",cmDel:"حذف الإجراء",cmNone:"لا توجد إجراءات مقترحة بعد.",cmHint:"انقل هذه الإجراءات إلى خطة الإجراء في سجل CAPA لتُتابع بمواعيدها.",
 cpOpen:"افتح CAPA",pdOpen:"افتح PDCA",cpFound:"سجل CAPA: {t}",cpMiss:"لم يُعثر على هذا السجل في أداة CAPA على هذا المتصفح.",cpHint:"اكتب رقم سجل CAPA، مثل CA-EX-01، أو اختره من القائمة.",
 pdFound:"دورة PDCA: {t}",pdMiss:"لم يُعثر على هذه الدورة في أداة PDCA على هذا المتصفح.",pdHint:"اكتب رقم الدورة، مثل PD-EX-03، إن وُجدت.",
 cpT:"ابدأ من سجل CAPA (قراءة فقط)",cpS:"تقرأ الأداة سجلات CAPA المحفوظة في هذا المتصفح وتعرضها للمعاينة. اختر سجلاً لتعبئة المرجع وتعريف المشكلة في تحليل جديد. لا يُكتب أي شيء في سجلات CAPA.",
 cpPrev:"اعرض سجلات CAPA",cpNone:"لا توجد سجلات CAPA محفوظة في هذا المتصفح. افتح أداة CAPA وسجّل عدم مطابقة أو حمّل مثالها أولاً.",cpEmpty:"أداة CAPA لا تحتوي سجلات بعد.",
 cpUse:"ابدأ تحليلاً من هذا السجل",cpUsed:"عُبّئ نموذج تحليل جديد من سجل CAPA {id}. راجع تعريف المشكلة على الوقائع ثم احفظ. لم يُكتب أي شيء في CAPA.",
 cpColId:"سجل CAPA",cpColT:"المرجع والعنوان",cpColSt:"المرحلة في CAPA",cpColM:"الطريقة",cpColN:"تحليلات هنا",cpColA:"اختيار",
 cst_react:"التفاعل",cst_cause:"تحليل السبب",cst_action:"الإجراء",cst_verify:"التحقق من الفعالية",cst_closed:"مغلق",cst_reopened:"أعيد فتحه",cm_why5:"5 Whys",cm_fish:"Fishbone",cm_other:"طريقة أخرى",
 cpHome:"في أداة CAPA {n} سجلاً طريقته «5 Whys» ولا يوجد له تحليل هنا بعد.",cpGo:"اعرض سجلات CAPA",
 e_title:"أدخل عنواناً مختصراً للتحليل.",e_what:"اكتب ماذا حدث قبل الحفظ.",e_rdate:"تاريخ المراجعة لا يسبق تاريخ التحليل.",
 exT:"بيانات المثال",exS:"ثلاثة تحليلات توضيحية لشركة سعودية افتراضية (شركة الواحة للمقاولات)، كل منها مربوط بسجل CAPA في مثال أداة CAPA: حديد دون شهادات المصنع، ومخططات ملغاة في الموقع ب، وخرسانة جاهزة مرفوضة بفرع لسبب ثانٍ عمل مع الأول، مع إجابات للتقييم الذاتي. البيانات توضيحية وليست حقيقية، وتحميلها يستبدل كل بيانات هذه الأداة في متصفحك.",
 exLoad:"تحميل المثال",exClear:"مسح كل البيانات",exLoaded:"تم تحميل المثال: 3 تحليلات وإجابات التقييم الذاتي.",exCleared:"تم مسح كل بيانات الأداة من هذا المتصفح.",
 exConfirmClear:"سيحذف هذا كل تحليلات لماذا الخمس وإجابات التقييم الذاتي من هذا المتصفح، ولا يمكن التراجع عن ذلك.\n\nهل تريد المتابعة؟",
 dT:"تحليلات لماذا الخمس",dS:"كل تحليل بمرحلته وتنبيهاته. افتح التحليل لتعديله في «تحليل لماذا الخمس».",csv:"تصدير CSV",none:"لا توجد تحليلات بعد. ابدأ من «تحليل لماذا الخمس» أو حمّل المثال.",
 colRef:"المرجع والعنوان",colSrc:"المصدر",colStage:"المرحلة",colRoot:"السبب الجذري",colFlags:"تنبيهات",colAct:"إجراءات",open:"فتح",del:"حذف",delArm:"تأكيد الحذف",
 fl_untested:"السبب لم يُختبر",fl_wait:"ينتظر المراجعة",fl_chk:"يحتاج تحققاً: {n}",fl_no:"غير مدعوم: {n}",fl_person:"السبب يشير إلى شخص فقط",fl_work:"لا أحد ممن يؤدون العمل",fl_cm:"إجراء دون مالك",fl_rev:"المراجِع من الفريق",fl_part:"الاختبار لم يكتمل",
 auT:"التدقيق الآلي للتحليلات",auS:"هذه الفحوص تُطبَّق على كل تحليل وتُظهر الثغرات التي يلاحظها المدقق عادةً. الخانة «—» تعني أن الفحص لا ينطبق بعد على مرحلة التحليل.",
 auRec:"تحليلات مُدقّقة",auPass:"فحوص ناجحة",auFail:"تحليلات بها ثغرات",auOpen:"بنود مفتوحة",auEmpty:"لا توجد تحليلات لتدقيقها.",
 c_ref:"له مرجع",c_prob:"المشكلة بأجزائها الأربعة",c_depth:"ثلاثة أسئلة أو سبب للتوقف",c_ev:"دليل لكل جواب",c_sup:"لا جواب غير مدعوم في السلسلة الرئيسية",c_person:"السبب ليس شخصاً فقط",c_test:"اختُبر السبب",c_sim:"نُظر في الحالات المشابهة",c_cm:"إجراء مقترح بمالك",c_rev:"مراجعة مستقلة مؤرخة",
 dashT:"لوحة المؤشرات",dashS:"أرقام تُحسب من التحليلات والتقييم في هذا المتصفح.",kTotal:"إجمالي التحليلات",kRev:"روجعت",kTested:"سبب جذري مختبر",kCapa:"مرتبطة بسجل CAPA",kBranch:"بفروع",kPerson:"سبب يشير إلى شخص",kOpen:"بنود مفتوحة",kAud:"نجاح التدقيق",kAs:"التقييم الذاتي",
 byStage:"توزيع المراحل",byLink:"حسب المصدر",byAssess:"التقييم الذاتي حسب المجموعة",openT:"بنود تحتاج متابعة",noData:"لا توجد بيانات بعد.",noOpen:"لا توجد بنود مفتوحة.",
 oi_untested:"السبب الجذري لم يُختبر بعد",oi_part:"الاختبار: إزالة السبب لا توقف المشكلة كلها",oi_wait:"ينتظر مراجعة من خارج الفريق",oi_chk:"{n} جواب يحتاج تحققاً",oi_no:"{n} جواب غير مدعوم",oi_person:"السبب الجذري يشير إلى شخص فقط",oi_work:"لا يوجد في الفريق من يؤدي العمل",oi_cm:"إجراء مقترح دون مالك",oi_rev:"المراجِع من أعضاء الفريق",
 rpT:"تقرير لماذا الخمس",rpS:"تقرير HTML يُنزَّل إلى جهازك ويُطبع أو يُحفظ PDF من المتصفح، يرسم كل تحليل سلسلةً بأدلتها. وCSV لتحليل البيانات في جدول.",rpHtml:"تنزيل تقرير HTML",rpNote:"التقرير يحمل اسم المُعِد «مدثر سلامه» ويتضمن الملخص، وكل تحليل بسلسلته وأدلته، ونتائج التدقيق، والبنود المفتوحة، والتقييم الذاتي.",rpPrev:"معاينة سريعة",rpEmpty:"لا توجد تحليلات للتصدير بعد.",
 aiT:"المساعد الذكي — قيد البناء",aiS:"سيقرأ هذا المساعد التحليل ويقترح السؤال التالي ويشير إلى الأجوبة التي تحتاج دليلاً. لن يعمل قبل تهيئة محرك المنصة المشتركة، ولن يُظهر نتائج مزيّفة.",
 aiList:["اقتراح سؤال «لماذا» التالي من الجواب الأخير","التنبيه إلى جواب يلوم شخصاً بدل العملية","مقارنة التحليل بتحليلات سابقة لمشكلات مشابهة"],
 rFormHdr:"تحليل لماذا الخمس",yes:"نعم",no:"لا"},
en:{brand:"Continual Improvement Academy · مدثر سلامه",toolName:"5 Whys tool — Root cause analysis",sgLearn:"Learn",sgWork:"Work",sgOut:"Output",
 nHome:"Home",nStd:"Method guide",nCl:"Clause guide",nAssess:"Self-assessment",nTools:"5 Whys analysis",nDocs:"Records",nAudit:"Audit",nDash:"Dashboard",nReport:"Report",nAi:"AI Assistant",soon:"Soon",
 homeCode:"Define the problem · Ask why · Back it with evidence · Test the cause",homeH1:"5 Whys — Root cause analysis",
 homeLede:"A tool that runs a cause analysis session step by step: a problem defined from facts, then a chain of whys with evidence behind every answer, then a root cause that is tested before it is accepted, then a review by someone outside the team. Each analysis can start from a CAPA record and send its root cause back to it.",
 homeNote:"This version keeps analyses in your browser only. Server storage and sign-in come with the shared platform phase.",
 prep:"Prepared by",authorName:"مدثر سلامه",cycleT:"What you can do here",cycleS:"Read the method guide, assess how you analyse causes today, then start your first analysis from a CAPA record or from a new problem.",
 tStd:"How to run the session, who should be in the room, when to stop, and why “five” is a rule of thumb, not a fixed number.",tCl:"The ISO 9001:2026 clauses the method serves, starting with 10.2.1 b): interpretive summary, example and what the auditor asks for.",tAssess:"Ten questions on your root cause practice, from defining the problem to sharing what was learned.",
 tTools:"One full analysis per problem: definition, team, chain of whys with evidence, branches, root cause and its test, and review.",tDocs:"Every analysis with its stage and flags, and the example data.",tAudit:"Automatic check of each analysis: problem statement, evidence, stop rule, root cause test and independent review.",
 tDash:"Tested, reviewed and CAPA-linked analyses, open items and the self-assessment on one page.",tReport:"HTML report that draws each analysis as its chain with evidence, and a CSV file.",tAi:"An assistant that reads the analysis and suggests the next question. Not active yet.",
 foot:"References: ISO 9001:2026 clauses 7.1.6, 7.2, 9.1.3, 10.1 and 10.2 and Annex A.10.2, and ISO 9000:2026 terms (interpretive summaries, not the official text). 5 Whys is a working method, not a requirement of any standard. Examples are illustrative, not real data.",
 heroTag:"Method tool · Serves ISO 9001:2026 clause 10.2.1 b)",langSw:"العربية",langSwA:"التبديل إلى العربية",logoAlt:"Continual Improvement Academy — مدثر سلامه",
 related:"Related Academy tools",rel_capa:"Corrective action",rel_pdca:"Continual improvement cycle",rel_aud:"Smart audit & improvement center",rel_q:"ISO 9001:2026 guide",
 termT:"Is 5 Whys a requirement of ISO 9001:2026?",
 termP1:"No. 5 Whys is a way of asking questions, not a clause of any standard. The requirement it serves is determining the causes of the nonconformity in ISO 9001:2026 clause 10.2.1 b) 2), together with checking whether similar nonconformities exist or could occur in 10.2.1 b) 3). Annex A.10.2 leaves the organization to decide the extent of investigation and the methods it uses, based on its context.",
 termP2:"Five is a rule of thumb, not a condition. Stop when you reach a cause the organization can change and the evidence supports it; that can happen at the third why, or it can take seven. When different causes acted together, open a branch for each one instead of forcing them into one chain.",
 termIs:"Interpretive summary in independent wording, not the official text. Sources: ISO 9001:2026 clause 10.2.1 and Annex A.10.2, and ISO 9000:2026, the terms named here and principle 4.2.6. Verified: 2026-10-11.",
 defs:[["Nonconformity","ISO 9000:2026 · 3.5.13","Non-fulfilment of a requirement. It is where the analysis starts, written as it happened.","#C2410C"],["Corrective action","ISO 9000:2026 · 3.6.4","Removing the cause of a nonconformity and preventing recurrence. The analysis finds the cause; the action is planned in CAPA.","#1B2A4A"],["Objective evidence","ISO 9000:2026 · 3.8.6","Data supporting the existence or truth of something. Every “because…” in the chain needs evidence of this kind.","#3563C9"],["Root cause","Not a defined term","ISO 9000:2026 does not define “root cause” as a term; it names root cause investigation under the improvement principle (4.2.6). In this tool: the cause that, once removed, stops the problem.","#3C9A5F"]],
 asT:"Self-assessment of your root cause practice",asS:"Answer each question with what actually happens in your analyses. The score measures current practice; it is not a certificate or a performance rating.",asReset:"Clear answers",asSaved:"Answer saved",asAnswered:"{n} of 10 answered",
 band0:"Needs work",band1:"Developing",band2:"Established",bandNote:"Internal bands for this self-assessment, designed in this tool; not an official scale.",as0:"Not in place",as1:"Partly",as2:"In place and applied",
 g_PR:"Problem and team",g_CH:"Chain of whys",g_RT:"Root cause",g_LK:"Link and learn",
 tlT:"5 Whys analysis",tlS:"One analysis per problem. Write the problem from facts, ask “why?” and back every answer with evidence, and stop at a cause the organization can change. The stage is set automatically from what you fill in.",
 save:"Save analysis",newRec:"New analysis",savedFail:"Could not save in this browser. Download the report before closing the page.",cur:"Current stage:",ok_rec:"Analysis saved",
 st_problem:"Problem defined",st_chain:"Chain of whys",st_root:"Root cause",st_tested:"Root cause tested",st_reviewed:"Reviewed",
 sProbT:"The problem · clause 10.2.1 b) 1)",sProbS:"Four parts, from facts and not opinion: what happened, where, when and how much.",
 sTeamT:"Team",sTeamS:"Who took part and their role. The team needs at least one person who does the work itself.",
 sChainT:"Chain of whys · clause 10.2.1 b) 2)",sChainS:"One main chain, and at most two branches for causes that acted together. Each answer has its evidence and a check status.",
 sRootT:"Root cause and its test",sRootS:"Write the root cause, then test it: if this cause is removed, does the problem stop? And read the chain back with “therefore”.",
 sSimT:"Similar cases · clause 10.2.1 b) 3)",sSimS:"Does the same thing exist, or could it happen, at another site or in another process?",
 sCmT:"Countermeasures",sCmS:"Actions that remove the root cause, each with an owner. The full action plan with dates and follow-up stays in the CAPA record.",
 sRevT:"Review",sRevS:"Someone outside the team reviews the analysis and dates the review.",
 f_title:"Short title",f_ref:"Reference (CAPA, NCR or audit finding)",f_src:"Source",f_capa:"Linked CAPA record",f_pdca:"Linked PDCA cycle",f_area:"Process or site",f_date:"Analysis date",f_lead:"Facilitator",
 f_what:"What happened?",f_where:"Where?",f_when:"When?",f_much:"How much? (number, rate or effect)",f_root:"Root cause",f_tstop:"If this cause is removed, does the problem stop?",f_similar:"Similar cases",f_similarNote:"Where, and what was done?",
 f_rby:"Reviewer (outside the team)",f_rdate:"Review date",f_rnote:"Review note",
 src_capa:"CAPA record",src_ncr:"Nonconformity report (NCR)",src_audit:"Audit finding",src_cc:"Customer complaint",src_inc:"Incident",src_kpi:"KPI",
 ts_:"—",ts_yes:"Yes, it stops",ts_part:"Only partly",ts_no:"No",
 sim_:"—",sim_none:"None",sim_exist:"Similar cases exist",sim_could:"Could occur elsewhere",
 wst_ok:"Verified",wst_chk:"To check",wst_no:"Not supported",
 tmN:"Name",tmRole:"Role",tmWork:"Does the work",tmAdd:"Add member",tmDel:"Remove member",tmNone:"No one added yet.",
 mainCh:"Main chain",branch:"Branch {n}",brLabel:"Branch name (the parallel cause)",brPh:"Example: mixing water",brDel:"Remove branch",brAdd:"Add a branch for a parallel cause",brMax:"Two branches at most.",
 wAns:"Answer: because…",wEv:"Evidence",wSt:"Check",wAdd:"Add a why",wDel:"Remove this why",wMax:"At most {n} whys in a chain.",
 q0:"Why did this happen: {p}?",q0b:"Why did this happen through another path?",qn:"Why: {p}?",stopL:"Why did we stop here? (the last cause is one the organization can change, and the evidence supports it)",
 revT:"Reading back: from the root cause to the problem",revEmpty:"Fill in the answers of the chain to see the reading back.",therefore:"therefore",readsL:"I read the chain back with “therefore”, and every step holds and is supported.",
 personW:"This root cause points at a person only (“human error”, “negligence”). Ask what in the process allowed it: the method, the form, the training, the workload or the design. Then rewrite it as a cause the organization can change.",
 testW:"The test is not complete: if removing this cause does not stop the problem, another cause is at work. Open a branch or continue the chain.",
 workW:"No one in the team does the work itself. Add at least one such person; they know what really happens.",
 revW:"The reviewer is a team member. Choose someone from outside the team.",
 cmT:"Proposed action",cmOwner:"Owner",cmAdd:"Add a countermeasure",cmDel:"Remove countermeasure",cmNone:"No countermeasures yet.",cmHint:"Carry these into the action plan of the CAPA record, where they are followed up with dates.",
 cpOpen:"Open CAPA",pdOpen:"Open PDCA",cpFound:"CAPA record: {t}",cpMiss:"This record was not found in the CAPA tool in this browser.",cpHint:"Type the CAPA record number, such as CA-EX-01, or pick it from the list.",
 pdFound:"PDCA cycle: {t}",pdMiss:"This cycle was not found in the PDCA tool in this browser.",pdHint:"Type the cycle number, such as PD-EX-03, if there is one.",
 cpT:"Start from a CAPA record (read-only)",cpS:"The tool reads the CAPA records saved in this browser and shows them for review. Pick one to fill the reference and the problem statement of a new analysis. Nothing is written to the CAPA records.",
 cpPrev:"Show CAPA records",cpNone:"No CAPA records are saved in this browser. Open the CAPA tool and record a nonconformity, or load its example, first.",cpEmpty:"The CAPA tool has no records yet.",
 cpUse:"Start an analysis from this record",cpUsed:"A new analysis form was filled from CAPA record {id}. Check the problem statement against the facts, then save. Nothing was written to CAPA.",
 cpColId:"CAPA record",cpColT:"Reference and title",cpColSt:"Stage in CAPA",cpColM:"Method",cpColN:"Analyses here",cpColA:"Choice",
 cst_react:"Reaction",cst_cause:"Cause analysis",cst_action:"Action",cst_verify:"Effectiveness check",cst_closed:"Closed",cst_reopened:"Reopened",cm_why5:"5 Whys",cm_fish:"Fishbone",cm_other:"Other method",
 cpHome:"The CAPA tool has {n} record(s) whose method is 5 Whys and no analysis here yet.",cpGo:"Show CAPA records",
 e_title:"Enter a short title for the analysis.",e_what:"Write what happened before saving.",e_rdate:"The review date cannot be before the analysis date.",
 exT:"Example data",exS:"Three illustrative analyses for a fictitious Saudi company (Al-Waha Contracting), each linked to a record in the CAPA tool's example: steel without mill certificates, superseded drawings on site B, and rejected ready-mix concrete with a branch for a second cause that acted with the first, plus self-assessment answers. The data is illustrative, not real, and loading it replaces all of this tool's data in your browser.",
 exLoad:"Load example",exClear:"Clear all data",exLoaded:"Example loaded: 3 analyses and the self-assessment answers.",exCleared:"All of this tool's data was removed from this browser.",
 exConfirmClear:"This deletes every 5 Whys analysis and the self-assessment answers from this browser, and it cannot be undone.\n\nDo you want to continue?",
 dT:"5 Whys analyses",dS:"Every analysis with its stage and flags. Open an analysis to edit it in the 5 Whys analysis tab.",csv:"Export CSV",none:"No analyses yet. Start from the 5 Whys analysis tab or load the example.",
 colRef:"Reference and title",colSrc:"Source",colStage:"Stage",colRoot:"Root cause",colFlags:"Flags",colAct:"Actions",open:"Open",del:"Delete",delArm:"Confirm delete",
 fl_untested:"Root cause not tested",fl_wait:"Waiting for review",fl_chk:"To check: {n}",fl_no:"Not supported: {n}",fl_person:"Root names a person only",fl_work:"No one who does the work",fl_cm:"Countermeasure without owner",fl_rev:"Reviewer is in the team",fl_part:"Test not complete",
 auT:"Automatic audit of analyses",auS:"These checks run on every analysis and show the gaps an auditor usually finds. “—” means the check does not apply yet at the analysis's stage.",
 auRec:"Analyses audited",auPass:"Checks passed",auFail:"Analyses with gaps",auOpen:"Open items",auEmpty:"No analyses to audit yet.",
 c_ref:"Has reference",c_prob:"Problem in four parts",c_depth:"Three whys or a reason to stop",c_ev:"Evidence for each answer",c_sup:"No unsupported answer in the main chain",c_person:"Root is not a person alone",c_test:"Root cause tested",c_sim:"Similar cases considered",c_cm:"Countermeasure with owner",c_rev:"Independent dated review",
 dashT:"Dashboard",dashS:"Figures calculated from the analyses and the self-assessment in this browser.",kTotal:"Total analyses",kRev:"Reviewed",kTested:"Root cause tested",kCapa:"Linked to a CAPA record",kBranch:"With branches",kPerson:"Root names a person",kOpen:"Open items",kAud:"Audit pass rate",kAs:"Self-assessment",
 byStage:"Stage distribution",byLink:"By source",byAssess:"Self-assessment by group",openT:"Items that need follow-up",noData:"No data yet.",noOpen:"No open items.",
 oi_untested:"Root cause not tested yet",oi_part:"Test: removing the cause does not stop the whole problem",oi_wait:"Waiting for a review from outside the team",oi_chk:"{n} answer(s) to check",oi_no:"{n} answer(s) not supported",oi_person:"Root cause points at a person only",oi_work:"No one in the team does the work",oi_cm:"Countermeasure without an owner",oi_rev:"The reviewer is a team member",
 rpT:"5 Whys report",rpS:"HTML report downloaded to your device, which you can print or save as PDF from the browser; it draws each analysis as its chain with evidence. CSV for analysing the data in a spreadsheet.",rpHtml:"Download HTML report",rpNote:"The report carries the preparer's name “مدثر سلامه” and includes the summary, each analysis with its chain and evidence, audit results, open items and the self-assessment.",rpPrev:"Quick preview",rpEmpty:"No analyses to export yet.",
 aiT:"AI Assistant — under construction",aiS:"This assistant will read the analysis, suggest the next question and point to answers that need evidence. It will not run before the shared platform engine is in place, and it will not show invented results.",
 aiList:["Suggest the next “why” from the last answer","Point out an answer that blames a person instead of the process","Compare the analysis with earlier analyses of similar problems"],
 rFormHdr:"5 Whys analysis",yes:"Yes",no:"No"}
};

function t(k,v){ var d=UI[L]||UI.ar; var s=(d[k]!==undefined)?d[k]:(UI.ar[k]!==undefined?UI.ar[k]:k); if(v){ for(var x in v){ s=String(s).split("{"+x+"}").join(v[x]); } } return s; }
function esc(s){ return TBX.esc(s); }
function today(){ return TBX.today(); }
function txt(v){ return TBX.txt(v); }
function obj(v){ return (v&&typeof v==="object"&&!Array.isArray(v))?v:{}; }
function str(v){ return (v==null||typeof v==="object")?"":String(v); }
function isD(s){ return /^\d{4}-\d{2}-\d{2}$/.test(String(s||"")); }
function short(s,n){ s=txt(s).replace(/\s+/g," "); n=n||90; return s.length>n?s.slice(0,n-1)+"…":s; }
/* a sentence used inside a question: no closing full stop before the question mark */
function clip(s,n){ return short(s,n).replace(/[\s.。!؟?،,:;…]+$/,""); }

/* ---------- store ---------- */
function blankChain(){ return {label:"",whys:[],stop:""}; }
function blank(){ return {id:"",title:"",ref:"",src:"capa",capa:"",pdca:"",area:"",date:"",lead:"",prob:{what:"",where:"",when:"",much:""},team:[],
 chains:[blankChain()],root:"",test:{stop:"",reads:false},similar:"",similarNote:"",cms:[],review:{by:"",date:"",note:""},created:"",updated:""}; }
/* an analysis saved with missing or broken parts gets empty ones, so rendering never throws */
function fixRec(r){
 ["id","title","ref","src","capa","pdca","area","date","lead","root","similar","similarNote","created","updated"].forEach(function(k){ r[k]=str(r[k]); });
 if(SRCS.indexOf(r.src)<0) r.src="capa";
 var p=obj(r.prob); ["what","where","when","much"].forEach(function(k){ p[k]=str(p[k]); }); r.prob=p;
 r.team=(Array.isArray(r.team)?r.team:[]).filter(function(m){ return m&&typeof m==="object"; }).map(function(m){ return {n:str(m.n),role:str(m.role),work:m.work===true}; });
 r.chains=(Array.isArray(r.chains)?r.chains:[]).filter(function(c){ return c&&typeof c==="object"; }).slice(0,1+MAXB).map(function(c){
  return {label:str(c.label),stop:str(c.stop),whys:(Array.isArray(c.whys)?c.whys:[]).filter(function(w){ return w&&typeof w==="object"; }).slice(0,MAXW).map(function(w){ return {a:str(w.a),ev:str(w.ev),st:["ok","chk","no"].indexOf(w.st)>=0?w.st:"chk"}; })};
 });
 if(!r.chains.length) r.chains=[blankChain()];
 var te=obj(r.test); r.test={stop:["yes","part","no",""].indexOf(te.stop)>=0?te.stop:"",reads:te.reads===true};
 if(["exist","could","none",""].indexOf(r.similar)<0) r.similar="";
 r.cms=(Array.isArray(r.cms)?r.cms:[]).filter(function(c){ return c&&typeof c==="object"; }).map(function(c){ return {t:str(c.t),owner:str(c.owner)}; });
 var rv=obj(r.review); r.review={by:str(rv.by),date:str(rv.date),note:str(rv.note)};
 return r;
}
function load(){ return TBX.load(STORE,function(v){ if(!Array.isArray(v.records)) v.records=[]; v.records=v.records.filter(function(r){ return r&&typeof r==="object"; }); v.records.forEach(fixRec); if(!v.assess||typeof v.assess!=="object") v.assess={}; return v; },function(){ return {records:[],assess:{}}; }); }
function persist(){ return TBX.save(STORE,DB); }

/* ---------- stage, checks and flags ---------- */
var PERSON=/(خطأ\s*(بشري|العامل|الموظف|الفني|المشغل|السائق|الشخص)|إهمال|اهمال|تقصير|عدم\s*(انتباه|الانتباه|تركيز|التركيز)|سهو|لامبالاة|human\s*error|operator\s*error|worker\s*error|staff\s*error|employee\s*error|negligen|careless|inattent|not\s*paying\s*attention|lack\s*of\s*attention|complacen)/i;
function personOnly(s){ return PERSON.test(String(s||"")); }
function ans(c){ return (c&&c.whys||[]).filter(function(w){ return txt(w.a); }); }
function probDone(r){ return ["what","where","when","much"].every(function(k){ return !!txt(r.prob[k]); }); }
function tested(r){ return r.test.stop==="yes" && r.test.reads===true; }
function stageOf(r){
 if(tested(r) && txt(r.review.by) && isD(r.review.date)) return "reviewed";
 if(tested(r)) return "tested";
 if(txt(r.root)) return "root";
 if(ans(r.chains[0]).length) return "chain";
 return "problem";
}
function stageName(s){ return t("st_"+s); }
function srcName(k){ return t("src_"+k); }
function cnt(r,st){ var n=0; r.chains.forEach(function(c){ ans(c).forEach(function(w){ if(w.st===st) n++; }); }); return n; }
function hasWorker(r){ return r.team.some(function(m){ return m.work && txt(m.n); }); }
function names(r){ return r.team.map(function(m){ return txt(m.n).toLowerCase(); }).filter(Boolean); }
function revInTeam(r){ var b=txt(r.review.by).toLowerCase(); return !!b && names(r).indexOf(b)>=0; }
function cmNoOwner(r){ return r.cms.some(function(c){ return txt(c.t) && !txt(c.owner); }); }
function atLeast(r,s){ return STAGES.indexOf(stageOf(r))>=STAGES.indexOf(s); }
function flagsOf(r){
 var F=[], s=stageOf(r), nc=cnt(r,"chk"), nn=cnt(r,"no");
 if(personOnly(r.root)) F.push([t("fl_person"),"bad"]);
 if(nn) F.push([t("fl_no",{n:nn}),"bad"]);
 if(nc) F.push([t("fl_chk",{n:nc}),"warn"]);
 if(s==="root") F.push([r.test.stop==="part"||r.test.stop==="no"?t("fl_part"):t("fl_untested"),"warn"]);
 if(s==="tested") F.push([t("fl_wait"),"info"]);
 if(atLeast(r,"chain") && !hasWorker(r)) F.push([t("fl_work"),"warn"]);
 if(cmNoOwner(r)) F.push([t("fl_cm"),"warn"]);
 if(revInTeam(r)) F.push([t("fl_rev"),"warn"]);
 return F;
}
function openItems(){
 var out=[];
 DB.records.forEach(function(r){
  var s=stageOf(r), nc=cnt(r,"chk"), nn=cnt(r,"no");
  if(personOnly(r.root)) out.push({r:r,k:"bad",s:t("oi_person")});
  if(nn) out.push({r:r,k:"bad",s:t("oi_no",{n:nn})});
  if(nc) out.push({r:r,k:"warn",s:t("oi_chk",{n:nc})});
  if(s==="root") out.push({r:r,k:"warn",s:(r.test.stop==="part"||r.test.stop==="no")?t("oi_part"):t("oi_untested")});
  if(s==="tested") out.push({r:r,k:"info",s:t("oi_wait")});
  if(atLeast(r,"chain") && !hasWorker(r)) out.push({r:r,k:"warn",s:t("oi_work")});
  if(cmNoOwner(r)) out.push({r:r,k:"warn",s:t("oi_cm")});
  if(revInTeam(r)) out.push({r:r,k:"warn",s:t("oi_rev")});
 });
 return out;
}
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
/* PDCA cycles and CAPA records saved in this browser (read only) */
function pdcaCycles(){
 var S=TBX.read(PDCA_KEY), R=S&&Array.isArray(S.records)?S.records:[];
 return R.filter(function(r){ return r&&typeof r==="object"&&r.id; }).map(function(r){ return {id:str(r.id),title:str(r.title)}; });
}
function capaRecs(){
 var S=TBX.read(CAPA_KEY); if(!S) return null;
 return (Array.isArray(S.records)?S.records:[]).filter(function(r){ return r&&typeof r==="object"&&str(r.id); });
}
/* CAPA's stage, read with CAPA's own rules (modules/capa.html, stageOf) for the preview only */
function capaStage(r){
 var e=obj(r.eff), c=obj(r.close), im=obj(r.impl), cs=obj(r.cause), re=obj(r.react), a=(Array.isArray(r.actions)?r.actions:[]).filter(function(x){ return x&&typeof x==="object"; });
 if(e.result==="ineff") return "reopened"; if(txt(str(c.date))) return "closed";
 if(e.result==="eff"||txt(str(im.evidence))||(a.length&&a.every(function(x){ return x.st==="done"; }))) return "verify";
 if(txt(str(cs.root))) return "action"; if(txt(str(re.correction))||txt(str(re.containment))) return "cause"; return "react";
}
function capaById(id){ var R=capaRecs()||[]; return R.filter(function(r){ return str(r.id)===id; })[0]||null; }

/* ---------- analysis form ---------- */
var HDR=[["title","tx",1],["ref","ltr",0],["src","sel_src",0],["capa","capa",0],["pdca","pdca",0],["area","tx",0],["date","date",0],["lead","tx",0]];
var PATH={title:"title",ref:"ref",src:"src",capa:"capa",pdca:"pdca",area:"area",date:"date",lead:"lead",what:"prob.what",where:"prob.where",when:"prob.when",much:"prob.much",
 root:"root",tstop:"test.stop",similar:"similar",similarNote:"similarNote",rby:"review.by",rdate:"review.date",rnote:"review.note"};
function getP(r,p){ var a=p.split("."); return a.length>1?r[a[0]][a[1]]:r[a[0]]; }
function setP(r,p,v){ var a=p.split("."); if(a.length>1) r[a[0]][a[1]]=v; else r[a[0]]=v; }
function opts(list,prefix,cur){ return list.map(function(k){ return '<option value="'+k+'"'+(cur===k?" selected":"")+'>'+esc(t(prefix+k))+'</option>'; }).join(""); }
function fieldHTML(name,kind,wide){
 var id="f-"+name, lab=t("f_"+name), inner="";
 if(kind==="ta") inner='<textarea id="'+id+'" rows="3"></textarea>';
 else if(kind==="date") inner='<input id="'+id+'" type="date">';
 else if(kind==="ltr") inner='<input id="'+id+'" type="text" dir="ltr">';
 else if(kind==="sel_src") inner='<select id="'+id+'">'+opts(SRCS,"src_")+'</select>';
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
  secHTML("Prob","#C2410C",'<div class="pd-fields">'+fieldHTML("what","ta",1)+fieldHTML("where","tx",0)+fieldHTML("when","tx",0)+fieldHTML("much","tx",1)+'</div>')+
  secHTML("Team","#7A869E",'<div class="ca-actw"><table class="w5-team"><thead><tr><th>'+esc(t("tmN"))+'</th><th>'+esc(t("tmRole"))+'</th><th>'+esc(t("tmWork"))+'</th><th><span class="sr">'+esc(t("tmDel"))+'</span></th></tr></thead><tbody id="teamRows"></tbody></table></div><p class="ca-hint" id="teamNone"></p><div class="w5-warn" id="workWarn" hidden></div><button class="pd-btn ghost" type="button" id="tmAdd">+ '+esc(t("tmAdd"))+'</button>')+
  secHTML("Chain","#3563C9",'<div id="chainBox"></div><div class="w5-cbtn"><button class="pd-btn ghost" type="button" id="chAdd">+ '+esc(t("brAdd"))+'</button><span class="ca-hint" id="chMax"></span></div>')+
  secHTML("Root","#1B2A4A",'<div class="pd-fields">'+fieldHTML("root","ta",1)+'</div><div class="w5-warn w5-bad" id="personWarn" role="note" hidden></div><div class="pd-fields">'+fieldHTML("tstop","sel_ts",0)+'</div><div class="w5-warn" id="testWarn" role="note" hidden></div><div class="w5-rev" id="revBox"></div><label class="w5-chk" for="f-reads"><input type="checkbox" id="f-reads"><span>'+esc(t("readsL"))+'</span></label>')+
  secHTML("Sim","#7B5BB8",'<div class="pd-fields">'+fieldHTML("similar","sel_similar",0)+fieldHTML("similarNote","tx",1)+'</div>')+
  secHTML("Cm","#1E8C93",'<div class="ca-actw"><table class="ca-acts"><thead><tr><th>'+esc(t("cmT"))+'</th><th>'+esc(t("cmOwner"))+'</th><th><span class="sr">'+esc(t("cmDel"))+'</span></th></tr></thead><tbody id="cmRows"></tbody></table></div><p class="ca-hint" id="cmNone"></p><button class="pd-btn ghost" type="button" id="cmAdd">+ '+esc(t("cmAdd"))+'</button><p class="ca-hint">'+esc(t("cmHint"))+'</p>')+
  secHTML("Rev","#3C9A5F",'<div class="pd-fields">'+fieldHTML("rby","tx",0)+fieldHTML("rdate","date",0)+fieldHTML("rnote","ta",1)+'</div><div class="w5-warn" id="rvWarn" hidden></div>');
 var cl=document.getElementById("capaList"); if(cl) cl.innerHTML=fill((capaRecs()||[]).map(function(r){ return [str(r.id),str(r.ref)+" · "+str(r.title)]; }));
 var dl=document.getElementById("pdcaList"); if(dl) dl.innerHTML=fill(pdcaCycles().map(function(c){ return [c.id,c.title]; }));
}
function teamRowHTML(m,i){
 return '<tr data-row="'+i+'"><td><input data-k="n" type="text" value="'+esc(m.n)+'" aria-label="'+esc(t("tmN"))+'"></td><td><input data-k="role" type="text" value="'+esc(m.role)+'" aria-label="'+esc(t("tmRole"))+'"></td><td style="text-align:center"><input data-k="work" type="checkbox"'+(m.work?" checked":"")+' aria-label="'+esc(t("tmWork"))+'"></td><td><button type="button" class="ca-x" data-tmdel="'+i+'" aria-label="'+esc(t("tmDel"))+'" title="'+esc(t("tmDel"))+'">✕</button></td></tr>';
}
function renderTeam(list){ document.getElementById("teamRows").innerHTML=list.map(teamRowHTML).join(""); document.getElementById("teamNone").textContent=list.length?"":t("tmNone"); }
function readTeam(){ return [].map.call(document.querySelectorAll("#teamRows tr"),function(tr){ return {n:txt(tr.querySelector('[data-k="n"]').value),role:txt(tr.querySelector('[data-k="role"]').value),work:!!tr.querySelector('[data-k="work"]').checked}; }); }
function whyHTML(w,i,j){
 var id="w-"+i+"-"+j;
 return '<div class="w5-why st-'+w.st+'" data-w="'+j+'"><span class="w5-n" aria-hidden="true">'+(j+1)+'</span><div><p class="w5-q" id="'+id+'-q"></p><div class="w5-g">'+
  '<div><label class="w5-lbl" for="'+id+'-a">'+esc(t("wAns"))+'</label><textarea id="'+id+'-a" data-k="a" rows="2" aria-describedby="'+id+'-q">'+esc(w.a)+'</textarea></div>'+
  '<div><label class="w5-lbl" for="'+id+'-ev">'+esc(t("wEv"))+'</label><input id="'+id+'-ev" data-k="ev" type="text" value="'+esc(w.ev)+'"></div>'+
  '<div><label class="w5-lbl" for="'+id+'-st">'+esc(t("wSt"))+'</label><select id="'+id+'-st" data-k="st">'+opts(["ok","chk","no"],"wst_",w.st)+'</select></div>'+
  '<div><span class="w5-lbl" aria-hidden="true">&nbsp;</span><button type="button" class="ca-x" data-wdel="'+i+':'+j+'" aria-label="'+esc(t("wDel"))+' '+(j+1)+'" title="'+esc(t("wDel"))+'">✕</button></div></div></div></div>';
}
function chainHTML(c,i){
 var head=i===0?'<b>'+esc(t("mainCh"))+'</b>':'<b>'+esc(t("branch",{n:i}))+'</b><label class="sr" for="ch-'+i+'-l">'+esc(t("brLabel"))+'</label><input id="ch-'+i+'-l" data-ck="label" type="text" value="'+esc(c.label)+'" placeholder="'+esc(t("brPh"))+'"><button class="pd-btn ghost" type="button" data-chdel="'+i+'">'+esc(t("brDel"))+'</button>';
 return '<div class="w5-chain" data-chain="'+i+'" style="--cc:'+CCOL[i]+'"><div class="w5-chead">'+head+'</div><div class="w5-whys">'+c.whys.map(function(w,j){ return whyHTML(w,i,j); }).join("")+'</div>'+
  '<div class="w5-cbtn"><button class="pd-btn ghost" type="button" data-wadd="'+i+'">+ '+esc(t("wAdd"))+'</button><span class="ca-hint" data-wmax="'+i+'"></span></div>'+
  '<div class="w5-stop"><label for="ch-'+i+'-s">'+esc(t("stopL"))+'</label><textarea id="ch-'+i+'-s" data-ck="stop" rows="2">'+esc(c.stop)+'</textarea></div></div>';
}
function renderChains(list){
 document.getElementById("chainBox").innerHTML=list.map(chainHTML).join("");
 document.getElementById("chAdd").hidden=list.length>MAXB;
 document.getElementById("chMax").textContent=list.length>MAXB?t("brMax"):"";
}
function readChains(){
 return [].map.call(document.querySelectorAll("#chainBox .w5-chain"),function(el){
  var l=el.querySelector('[data-ck="label"]'), s=el.querySelector('[data-ck="stop"]');
  return {label:l?txt(l.value):"",stop:s?txt(s.value):"",whys:[].map.call(el.querySelectorAll(".w5-why"),function(w){ return {a:txt(w.querySelector('[data-k="a"]').value),ev:txt(w.querySelector('[data-k="ev"]').value),st:w.querySelector('[data-k="st"]').value||"chk"}; })};
 });
}
function cmRowHTML(c,i){ return '<tr data-row="'+i+'"><td><textarea data-k="t" rows="2" aria-label="'+esc(t("cmT"))+'">'+esc(c.t)+'</textarea></td><td><input data-k="owner" type="text" value="'+esc(c.owner)+'" aria-label="'+esc(t("cmOwner"))+'"></td><td><button type="button" class="ca-x" data-cmdel="'+i+'" aria-label="'+esc(t("cmDel"))+'" title="'+esc(t("cmDel"))+'">✕</button></td></tr>'; }
function renderCms(list){ document.getElementById("cmRows").innerHTML=list.map(cmRowHTML).join(""); document.getElementById("cmNone").textContent=list.length?"":t("cmNone"); }
function readCms(){ return [].map.call(document.querySelectorAll("#cmRows tr"),function(tr){ return {t:txt(tr.querySelector('[data-k="t"]').value),owner:txt(tr.querySelector('[data-k="owner"]').value)}; }); }
function formToRec(){
 var r=blank();
 Object.keys(PATH).forEach(function(k){ var el=document.getElementById("f-"+k); if(el) setP(r,PATH[k],txt(el.value)); });
 if(!r.src) r.src="capa";
 var rd=document.getElementById("f-reads"); r.test.reads=!!(rd&&rd.checked);
 if(document.getElementById("teamRows")) r.team=readTeam().filter(function(m){ return m.n||m.role; });
 if(document.getElementById("chainBox")){ var ch=readChains(); r.chains=ch.length?ch.map(function(c){ c.whys=c.whys.filter(function(w){ return w.a||w.ev; }); return c; }):[blankChain()]; }
 if(document.getElementById("cmRows")) r.cms=readCms().filter(function(c){ return c.t||c.owner; });
 r.id=document.getElementById("rid").value;
 if(editing&&editing.id===r.id){ r.created=editing.created||""; }
 return r;
}
/* the form keeps rows the user is still filling in (empty whys stay on screen until saved) */
function formRaw(){ return {team:readTeam(),chains:readChains(),cms:readCms()}; }
function recToForm(r,keepMsg){
 r=fixRec(JSON.parse(JSON.stringify(r)));
 document.getElementById("rid").value=r.id||"";
 Object.keys(PATH).forEach(function(k){ var el=document.getElementById("f-"+k); if(el) el.value=getP(r,PATH[k])||(el.tagName==="SELECT"&&el.options.length?el.options[0].value:""); });
 if(!r.src) document.getElementById("f-src").value="capa";
 document.getElementById("f-reads").checked=!!r.test.reads;
 renderTeam(r.team);
 var ch=r.chains.map(function(c){ return {label:c.label,stop:c.stop,whys:c.whys.length?c.whys:[{a:"",ev:"",st:"chk"}]}; });
 renderChains(ch);
 renderCms(r.cms);
 if(!keepMsg){ document.getElementById("recErr").textContent=""; document.getElementById("recOk").textContent=""; }
 refreshForm();
}
function loadRecordIntoForm(r){ editing=fixRec(JSON.parse(JSON.stringify(r))); recToForm(editing); }
function clearForm(){ editing=null; recToForm(blank()); }
function reverseHTML(r){
 var lists=r.chains.map(function(c,i){ var a=ans(c); if(!a.length) return ""; var steps=a.slice().reverse().map(function(w){ return w.a; }); steps.push(r.prob.what||"…");
  return '<ol>'+steps.map(function(s,k){ return '<li>'+(k?'<span>'+esc(t("therefore"))+'</span>':'')+esc(short(s,160))+'</li>'; }).join("")+'</ol>'+(r.chains.length>1?'<small style="color:var(--muted)">'+esc(i?t("branch",{n:i})+(c.label?" · "+c.label:""):t("mainCh"))+'</small>':''); }).filter(Boolean);
 return '<b>'+esc(t("revT"))+'</b>'+(lists.length?lists.join(""):'<p class="ca-hint" style="margin:4px 0 0">'+esc(t("revEmpty"))+'</p>');
}
function refreshForm(){
 var r=formToRec(), st=stageOf(r), raw=formRaw();
 var el=document.getElementById("curStage"); if(el) el.textContent=t("cur")+" "+stageName(st);
 var ci=STAGES.indexOf(st);
 document.getElementById("caSteps").innerHTML=STAGES.map(function(s,i){ var cls=i<ci?"done":(i===ci?(st==="reviewed"?"done":"cur"):""); return '<li class="'+cls+'" style="--sc:'+SCOL[s]+'"'+(i===ci?' aria-current="step"':'')+'><i aria-hidden="true"></i>'+esc(stageName(s))+'</li>'; }).join("");
 /* prompts above each why: the problem for the first one, the previous answer for the next ones */
 raw.chains.forEach(function(c,i){ c.whys.forEach(function(w,j){ var q=document.getElementById("w-"+i+"-"+j+"-q"); if(!q) return;
   q.textContent=j===0?(i===0?t("q0",{p:clip(r.prob.what,90)||"…"}):t("q0b")):t("qn",{p:clip(c.whys[j-1].a,90)||"…"});
   var row=q.closest(".w5-why"); if(row){ row.classList.remove("st-ok","st-chk","st-no"); row.classList.add("st-"+(w.st||"chk")); } });
  var mx=document.querySelector('[data-wmax="'+i+'"]'), ad=document.querySelector('[data-wadd="'+i+'"]');
  if(mx) mx.textContent=c.whys.length>=MAXW?t("wMax",{n:MAXW}):""; if(ad) ad.hidden=c.whys.length>=MAXW; });
 var pw=document.getElementById("personWarn"); if(pw){ var po=personOnly(r.root); pw.hidden=!po; pw.textContent=po?t("personW"):""; }
 var tw=document.getElementById("testWarn"); if(tw){ var tb=r.test.stop==="part"||r.test.stop==="no"; tw.hidden=!tb; tw.textContent=tb?t("testW"):""; }
 var rb=document.getElementById("revBox"); if(rb) rb.innerHTML=reverseHTML(r);
 var ww=document.getElementById("workWarn"); if(ww){ var nw=(raw.team.some(function(m){ return m.n; })||atLeast(r,"chain"))&&!hasWorker(r); ww.hidden=!nw; ww.textContent=nw?t("workW"):""; }
 var vw=document.getElementById("rvWarn"); if(vw){ var ri=revInTeam(r); vw.hidden=!ri; vw.textContent=ri?t("revW"):""; }
 var ci2=document.getElementById("cpInfo"), cv=r.capa;
 if(ci2){ if(!cv) ci2.textContent=t("cpHint"); else { var c=capaById(cv); ci2.textContent=c?t("cpFound",{t:str(c.ref)+" · "+str(c.title)}):t("cpMiss"); } }
 var info=document.getElementById("pdInfo"), v=r.pdca;
 if(info){ if(!v) info.textContent=t("pdHint"); else { var p=pdcaCycles().filter(function(x){ return x.id===v; })[0]; info.textContent=p?t("pdFound",{t:p.title||p.id}):t("pdMiss"); } }
}
function validate(r){
 if(!r.title) return t("e_title");
 if(!r.prob.what) return t("e_what");
 if(isD(r.date)&&isD(r.review.date)&&r.review.date<r.date) return t("e_rdate");
 return "";
}
function newId(r){
 var y=(isD(r.date)?r.date:today()).slice(0,4), pre="W5-"+y+"-";
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
/* a new analysis filled from a CAPA record; the CAPA record is only read */
function prefillFromCapa(id){
 var c=capaById(id); if(!c) return false;
 var r=blank(), cs=obj(c.cause);
 r.title=str(c.title); r.ref=str(c.ref); r.src="capa"; r.capa=str(c.id); r.pdca=str(c.pdca); r.area=str(c.area); r.date=today(); r.lead=str(c.owner);
 r.prob.what=str(c.desc); r.prob.where=str(c.area); r.prob.when=str(c.raised);
 editing=null; recToForm(r);
 go("tools");
 document.getElementById("recOk").textContent=t("cpUsed",{id:str(c.id)});
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
function cpPending(){ var R=capaRecs()||[]; return R.filter(function(c){ return str(obj(c.cause).method)==="why5" && capaStage(c)!=="closed" && !DB.records.some(function(r){ return r.capa===str(c.id); }); }).length; }
function renderHomeCp(){
 var box=document.getElementById("homeImp"); if(!box) return;
 var n=cpPending(); box.hidden=!n; if(n) document.getElementById("homeImpT").textContent=t("cpHome",{n:n});
}
document.getElementById("cpPrev").addEventListener("click",function(){ cpPreview(false); });
document.getElementById("cpTable").addEventListener("click",function(e){ var b=e.target.closest("[data-cpuse]"); if(b) prefillFromCapa(b.getAttribute("data-cpuse")); });
document.getElementById("homeImpGo").addEventListener("click",function(){ go("tools"); cpPreview(false); var b=document.getElementById("cpBox"); if(b&&b.scrollIntoView) b.scrollIntoView({block:"start"}); });

/* ---------- self-assessment ---------- */
var AQ=[
 ["PR1",{ar:"هل نكتب المشكلة من الوقائع بأجزائها الأربعة (ماذا وأين ومتى وكم) قبل أن نسأل «لماذا»؟",en:"Do we write the problem from facts, in its four parts (what, where, when, how much), before asking “why”?"}],
 ["PR2",{ar:"هل يحضر التحليلَ الأشخاصُ المناسبون، ومنهم واحد على الأقل يؤدي العمل نفسه؟",en:"Are the right people in the analysis, including at least one person who does the work itself?"}],
 ["CH1",{ar:"هل ندعم كل جواب «لأن…» بدليل نستطيع عرضه، ونميّز ما تحققنا منه عما يحتاج تحققاً؟",en:"Do we back every “because…” with evidence we can show, and mark what is verified apart from what still needs checking?"}],
 ["CH2",{ar:"هل نتوقف عند سبب تستطيع المنشأة تغييره ويسنده الدليل، لا عند السؤال الخامس بالضرورة؟",en:"Do we stop at a cause the organization can change and the evidence supports, not necessarily at the fifth why?"}],
 ["CH3",{ar:"هل نتجنب أن يكون الجواب لوماً لشخص، ونسأل عما في العملية سمح بالخطأ؟",en:"Do we avoid answers that blame a person, and ask what in the process allowed the mistake?"}],
 ["CH4",{ar:"عندما تعمل أسباب مختلفة معاً، هل نفتح فرعاً لكل سبب بدل حشرها في سلسلة واحدة؟",en:"When different causes acted together, do we open a branch for each instead of forcing them into one chain?"}],
 ["RT1",{ar:"هل نختبر السبب الجذري قبل اعتماده: إذا أُزيل هل تتوقف المشكلة؟ وهل تصح القراءة العكسية بكلمة «لذلك»؟",en:"Do we test the root cause before accepting it: if it is removed, does the problem stop? Does the reading back with “therefore” hold?"}],
 ["RT2",{ar:"هل نبحث عن الحالات المشابهة الموجودة أو المحتملة في مواقع وعمليات أخرى؟",en:"Do we look for similar cases that exist or could occur at other sites and in other processes?"}],
 ["LK1",{ar:"هل يُنقل السبب الجذري إلى سجل الإجراء التصحيحي، ويُبنى الإجراء عليه؟",en:"Is the root cause carried into the corrective action record, and is the action built on it?"}],
 ["LK2",{ar:"هل نشارك ما تعلمناه من التحليل مع المواقع والفرق الأخرى ونحفظه معرفةً للمنشأة؟",en:"Do we share what the analysis taught us with other sites and teams, and keep it as organizational knowledge?"}]
];
var AGROUPS=["PR","CH","RT","LK"];
var GCOL={PR:"#C2410C",CH:"#3563C9",RT:"#1B2A4A",LK:"#3C9A5F"};
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
 var cnt0=document.getElementById("cntDocs"); if(cnt0) cnt0.textContent=DB.records.length?String(DB.records.length):"";
 if(!DB.records.length){ box.innerHTML='<div class="pd-empty">'+esc(t("none"))+'</div>'; return; }
 var rows=DB.records.map(function(r){
  var st=stageOf(r);
  var del=(pendingDelete===r.id)?'<button class="pd-rowbtn arm" type="button" data-del="'+esc(r.id)+'">'+esc(t("delArm"))+'</button>':'<button class="pd-rowbtn" type="button" data-del="'+esc(r.id)+'">'+esc(t("del"))+'</button>';
  var cp=r.capa?'<button class="pd-rowbtn" type="button" data-capa="'+esc(r.capa)+'">CAPA ↗</button>':'';
  var pd=r.pdca?'<button class="pd-rowbtn" type="button" data-pdca="'+esc(r.pdca)+'">PDCA ↗</button>':'';
  return '<tr><td><b dir="ltr">'+esc(r.ref||"—")+'</b><br>'+esc(r.title)+'<br><small dir="ltr" style="color:var(--muted)">'+esc(r.id)+'</small></td><td>'+esc(srcName(r.src))+(r.capa?'<br><small dir="ltr">'+esc(r.capa)+'</small>':'')+'</td><td><span class="pd-badge" style="background:'+SCOL[st]+';color:#fff">'+esc(stageName(st))+'</span></td><td>'+esc(short(r.root,120)||"—")+'</td><td>'+flagsOf(r).map(chip).join("")+'</td><td><button class="pd-rowbtn" type="button" data-open="'+esc(r.id)+'">'+esc(t("open"))+'</button>'+del+cp+pd+'</td></tr>';
 }).join("");
 box.innerHTML='<table class="pd-tbl"><thead><tr><th>'+esc(t("colRef"))+'</th><th>'+esc(t("colSrc"))+'</th><th>'+esc(t("colStage"))+'</th><th>'+esc(t("colRoot"))+'</th><th>'+esc(t("colFlags"))+'</th><th>'+esc(t("colAct"))+'</th></tr></thead><tbody>'+rows+'</tbody></table>';
}
document.addEventListener("click",function(e){
 if(e.target.closest("#cb")) return;
 var o=e.target.closest("[data-open]"); if(o){ var r=DB.records.find(function(x){ return x.id===o.getAttribute("data-open"); }); if(r){ loadRecordIntoForm(r); go("tools"); } return; }
 var d=e.target.closest("[data-del]"); if(d){ var id=d.getAttribute("data-del"); if(pendingDelete===id){ DB.records=DB.records.filter(function(x){ return x.id!==id; }); pendingDelete=null; persist(); if(document.getElementById("rid").value===id) clearForm(); renderAll(); } else { pendingDelete=id; renderDocs(); } return; }
 if(e.target.closest("[data-capa]")||e.target.closest("#cpOpen")){ openTool("capa.html","docs"); return; }
 if(e.target.closest("[data-pdca]")||e.target.closest("#pdOpen")){ openTool("pdca.html","docs"); return; }
 var x=e.target.closest("[data-tmdel]"); if(x){ var tl=readTeam(); tl.splice(Number(x.getAttribute("data-tmdel")),1); renderTeam(tl); refreshForm(); return; }
 if(e.target.closest("#tmAdd")){ var t2=readTeam(); t2.push({n:"",role:"",work:false}); renderTeam(t2); var lt=document.querySelector("#teamRows tr:last-child input"); if(lt) lt.focus(); refreshForm(); return; }
 var wd=e.target.closest("[data-wdel]"); if(wd){ var pr=wd.getAttribute("data-wdel").split(":"), ch=readChains(), ci=Number(pr[0]); ch[ci].whys.splice(Number(pr[1]),1); if(!ch[ci].whys.length) ch[ci].whys.push({a:"",ev:"",st:"chk"}); renderChains(ch); refreshForm(); return; }
 var wa=e.target.closest("[data-wadd]"); if(wa){ var ch2=readChains(), i2=Number(wa.getAttribute("data-wadd")); if(ch2[i2].whys.length<MAXW){ ch2[i2].whys.push({a:"",ev:"",st:"chk"}); renderChains(ch2); var f=document.getElementById("w-"+i2+"-"+(ch2[i2].whys.length-1)+"-a"); if(f) f.focus(); } refreshForm(); return; }
 var cd=e.target.closest("[data-chdel]"); if(cd){ var ch3=readChains(); ch3.splice(Number(cd.getAttribute("data-chdel")),1); renderChains(ch3); refreshForm(); return; }
 if(e.target.closest("#chAdd")){ var ch4=readChains(); if(ch4.length<=MAXB){ ch4.push({label:"",stop:"",whys:[{a:"",ev:"",st:"chk"}]}); renderChains(ch4); var lb=document.getElementById("ch-"+(ch4.length-1)+"-l"); if(lb) lb.focus(); } refreshForm(); return; }
 var cx=e.target.closest("[data-cmdel]"); if(cx){ var cl=readCms(); cl.splice(Number(cx.getAttribute("data-cmdel")),1); renderCms(cl); refreshForm(); return; }
 if(e.target.closest("#cmAdd")){ var c2=readCms(); c2.push({t:"",owner:""}); renderCms(c2); var lc=document.querySelector("#cmRows tr:last-child textarea"); if(lc) lc.focus(); refreshForm(); return; }
});

/* ---------- automatic audit of analyses ---------- */
var CHECKS=["ref","prob","depth","ev","sup","person","test","sim","cm","rev"];
function auditRecord(r){
 var ch=atLeast(r,"chain"), rt=atLeast(r,"root"), te=atLeast(r,"tested"), m=ans(r.chains[0]), res={};
 res.ref=!!txt(r.ref);
 res.prob=probDone(r);
 res.depth=ch?(m.length>=3||!!txt(r.chains[0].stop)):null;
 res.ev=ch?r.chains.every(function(c){ return ans(c).every(function(w){ return !!txt(w.ev); }); }):null;
 res.sup=ch?m.every(function(w){ return w.st!=="no"; }):null;
 res.person=rt?!personOnly(r.root):null;
 res.test=rt?tested(r):null;
 res.sim=rt?!!r.similar:null;
 res.cm=rt?(r.cms.length>0&&r.cms.every(function(c){ return txt(c.t)&&txt(c.owner); })):null;
 res.rev=te?(!!txt(r.review.by)&&isD(r.review.date)&&!revInTeam(r)):null;
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
 var R=DB.records, c={n:R.length,rev:0,tested:0,capa:0,branch:0,person:0};
 R.forEach(function(r){ var s=stageOf(r); if(s==="reviewed") c.rev++; if(s==="tested"||s==="reviewed") c.tested++; if(r.capa) c.capa++; if(r.chains.length>1&&r.chains.slice(1).some(function(x){ return ans(x).length; })) c.branch++; if(personOnly(r.root)) c.person++; });
 return c;
}
function pct(a,n){ return n?Math.round(a/n*100)+"%":"—"; }
function renderDash(){
 var box=document.getElementById("dKpis"); if(!box) return;
 var c=counts(), au=auditSummary(), as=assessScore(), n=c.n, oi=openItems();
 box.innerHTML=TBX.kpi(n,t("kTotal"))+TBX.kpi(c.rev,t("kRev"))+TBX.kpi(pct(c.tested,n),t("kTested"))+TBX.kpi(pct(c.capa,n),t("kCapa"))+TBX.kpi(c.branch,t("kBranch"))+TBX.kpi(c.person,t("kPerson"))+TBX.kpi(oi.length,t("kOpen"))+TBX.kpi(au.rate===null?"—":au.rate+"%",t("kAud"))+TBX.kpi(as+"%",t("kAs"));
 var nd='<p class="pd-sub" style="color:var(--ink-soft)">'+esc(t("noData"))+'</p>';
 document.getElementById("dStage").innerHTML=n?TBX.dist(STAGES,n,function(s){ return DB.records.filter(function(r){ return stageOf(r)===s; }).length; },stageName,function(s){ return SCOL[s]; }):nd;
 document.getElementById("dLink").innerHTML=n?TBX.dist(SRCS,n,function(k){ return DB.records.filter(function(r){ return r.src===k; }).length; },srcName,function(){ return "#3563C9"; }):nd;
 document.getElementById("dAssess").innerHTML=AGROUPS.map(function(g){ var p=assessScore(g); return TBX.bar(t("g_"+g),p+"%",p,GCOL[g]); }).join("")+'<p class="pd-sub" style="font-size:12.5px;color:var(--muted);margin:10px 0 0">'+esc(t("bandNote"))+'</p>';
 document.getElementById("dOpen").innerHTML=oi.length?oi.map(function(x){ return '<li><b>'+esc(x.r.ref||x.r.id)+'</b>'+chip([x.r.id,"info"])+'<span>'+esc(x.s)+'</span></li>'; }).join(""):'<li>'+esc(n?t("noOpen"):t("noData"))+'</li>';
}

/* ---------- report and CSV ---------- */
function chainText(c){ return ans(c).map(function(w,i){ return "W"+(i+1)+": "+w.a+(w.ev?" ["+w.ev+"]":"")+" ("+w.st+")"; }).join(" | "); }
function buildCSV(){
 var head=["id","ref","title","source","capa","pdca","area","date","lead","stage","what","where","when","howMuch","team","mainChain","mainStop","branches","root","personOnly","testStop","testReads","similar","similarNote","countermeasures","reviewer","reviewDate"];
 return TBX.csv(head,DB.records.map(function(r){ return [r.id,r.ref,r.title,r.src,r.capa,r.pdca,r.area,r.date,r.lead,stageOf(r),r.prob.what,r.prob.where,r.prob.when,r.prob.much,
  r.team.map(function(m){ return m.n+(m.role?" ("+m.role+")":"")+(m.work?" *":""); }).join("; "),chainText(r.chains[0]),r.chains[0].stop,
  r.chains.slice(1).map(function(c){ return (c.label?c.label+": ":"")+chainText(c)+(c.stop?" / stop: "+c.stop:""); }).join(" || "),r.root,personOnly(r.root)?"yes":"no",r.test.stop,r.test.reads?"yes":"no",r.similar,r.similarNote,
  r.cms.map(function(c){ return c.t+" — "+c.owner; }).join(" | "),r.review.by,r.review.date]; }));
}
var WSTC={ok:"#2F7D4B",chk:"#86520F",no:"#B42318"};
function chainReport(c,i){
 var a=ans(c); if(!a.length && !c.stop) return "";
 return '<div class="ch" style="border-color:'+CCOL[i]+'"><b>'+esc(i?t("branch",{n:i})+(c.label?" · "+c.label:""):t("mainCh"))+'</b><ol>'+a.map(function(w){ return '<li><span class="a">'+esc(w.a)+'</span><br><small>'+esc(t("wEv"))+': '+esc(w.ev||"—")+' · <span style="color:'+WSTC[w.st]+'">'+esc(t("wst_"+w.st))+'</span></small></li>'; }).join("")+'</ol>'+(c.stop?'<p class="meta">'+esc(t("stopL").split("(")[0].trim())+' '+esc(c.stop)+'</p>':'')+'</div>';
}
function recReport(r){
 var rv=r.chains.map(function(c){ var a=ans(c); if(!a.length) return ""; var s=a.slice().reverse().map(function(w){ return w.a; }); s.push(r.prob.what); return s.map(esc).join(' → <i>'+esc(t("therefore"))+'</i> → '); }).filter(Boolean);
 return '<section class="an"><h3><span dir="ltr">'+esc(r.id)+'</span> · <span dir="ltr">'+esc(r.ref||"—")+'</span> — '+esc(r.title)+'</h3>'+
  '<p class="meta">'+esc(t("colStage"))+': <b>'+esc(stageName(stageOf(r)))+'</b> · '+esc(srcName(r.src))+(r.capa?' · CAPA <span dir="ltr">'+esc(r.capa)+'</span>':'')+(r.pdca?' · PDCA <span dir="ltr">'+esc(r.pdca)+'</span>':'')+(r.date?' · <span dir="ltr">'+esc(r.date)+'</span>':'')+'</p>'+
  '<table><tbody><tr><th>'+esc(t("f_what"))+'</th><td>'+esc(r.prob.what||"—")+'</td></tr><tr><th>'+esc(t("f_where"))+'</th><td>'+esc(r.prob.where||"—")+'</td></tr><tr><th>'+esc(t("f_when"))+'</th><td>'+esc(r.prob.when||"—")+'</td></tr><tr><th>'+esc(t("f_much"))+'</th><td>'+esc(r.prob.much||"—")+'</td></tr><tr><th>'+esc(t("sTeamT"))+'</th><td>'+esc(r.team.map(function(m){ return m.n+(m.role?" ("+m.role+")":"")+(m.work?" ✱":""); }).join("، ")||"—")+'</td></tr></tbody></table>'+
  r.chains.map(chainReport).join("")+
  '<p><b>'+esc(t("f_root"))+':</b> '+esc(r.root||"—")+(personOnly(r.root)?' <span class="bad">('+esc(t("fl_person"))+')</span>':'')+'</p>'+
  '<p><b>'+esc(t("f_tstop"))+'</b> '+esc(t("ts_"+r.test.stop))+' · '+esc(r.test.reads?t("yes"):t("no"))+'</p>'+
  (rv.length?'<p class="rev"><b>'+esc(t("revT"))+':</b><br>'+rv.join("<br>")+'</p>':'')+
  '<p><b>'+esc(t("f_similar"))+':</b> '+esc(t("sim_"+r.similar))+(r.similarNote?' — '+esc(r.similarNote):'')+'</p>'+
  (r.cms.length?'<p><b>'+esc(t("sCmT"))+':</b></p><ul>'+r.cms.map(function(c){ return '<li>'+esc(c.t)+' — '+esc(c.owner||"—")+'</li>'; }).join("")+'</ul>':'')+
  '<p><b>'+esc(t("sRevT"))+':</b> '+esc(r.review.by||"—")+(r.review.date?' · <span dir="ltr">'+esc(r.review.date)+'</span>':'')+(r.review.note?' — '+esc(r.review.note):'')+'</p></section>';
}
function buildReportHTML(){
 var c=counts(), au=auditSummary(), as=assessScore(), d=today(), n=c.n, A=TBX.audit(DB.records,auditRecord,CHECKS), oi=openItems();
 var mark=function(v){ return v===null?'<td class="na">—</td>':(v?'<td class="ok">✓</td>':'<td class="bad">✗</td>'); };
 var grpRows=AGROUPS.map(function(g){ return '<tr><td>'+esc(t("g_"+g))+' — '+g+'</td><td>'+assessScore(g)+'%</td></tr>'; }).join("");
 var auRows=A.rows.map(function(x){ return '<tr><td dir="ltr">'+esc(x.r.id)+'</td>'+CHECKS.map(function(k){ return mark(x.res[k]); }).join("")+'</tr>'; }).join("");
 var body='<h1>5 Whys — Root cause analysis / تقرير لماذا الخمس</h1>'+
  '<p class="meta">'+esc(t("prep"))+': <strong>مدثر سلامه</strong> · '+esc(d)+' · Continual Improvement Academy</p>'+
  '<h2>Summary / الملخص</h2><div class="k">'+
   '<div><b>'+n+'</b>'+esc(t("kTotal"))+'</div><div><b>'+c.rev+'</b>'+esc(t("kRev"))+'</div><div><b>'+pct(c.tested,n)+'</b>'+esc(t("kTested"))+'</div><div><b>'+pct(c.capa,n)+'</b>'+esc(t("kCapa"))+'</div><div><b>'+c.branch+'</b>'+esc(t("kBranch"))+'</div><div><b>'+oi.length+'</b>'+esc(t("kOpen"))+'</div><div><b>'+(au.rate===null?"—":au.rate+"%")+'</b>'+esc(t("kAud"))+'</div><div><b>'+as+'%</b>'+esc(t("kAs"))+'</div></div>'+
  '<h2>Analyses / التحليلات</h2>'+(n?DB.records.map(recReport).join(""):'<p class="meta">'+esc(t("rpEmpty"))+'</p>')+
  '<h2>Audit results / نتائج التدقيق</h2>'+(n?'<p>'+esc(t("auPass"))+': '+(au.rate===null?"—":au.rate+"% ("+au.pass+"/"+au.applic+")")+'</p><table><thead><tr><th>ID</th>'+CHECKS.map(function(k){ return '<th>'+esc(t("c_"+k))+'</th>'; }).join("")+'</tr></thead><tbody>'+auRows+'</tbody></table>':'<p class="meta">—</p>')+
  '<h2>Open items / بنود تحتاج متابعة</h2>'+(oi.length?'<ul>'+oi.map(function(x){ return '<li><span dir="ltr">'+esc(x.r.id)+' · '+esc(x.r.ref||"—")+'</span> — '+esc(x.s)+'</li>'; }).join("")+'</ul>':'<p class="meta">'+esc(n?t("noOpen"):"—")+'</p>')+
  '<h2>Self-assessment / التقييم الذاتي</h2><table><thead><tr><th>Group / المجموعة</th><th>Score / النتيجة</th></tr></thead><tbody>'+grpRows+'<tr><td><b>'+esc(t("kAs"))+'</b></td><td><b>'+as+'%</b></td></tr></tbody></table><p class="meta">'+esc(t("bandNote"))+'</p>'+
  '<footer>Prepared by / أعدّه: مدثر سلامه · 5 Whys is a working method, not a requirement of any standard. Sources / المراجع: ISO 9001:2026 clauses 7.1.6, 7.2, 9.1.3, 10.1 and 10.2 and Annex A.10.2; ISO 9000:2026 3.5.13, 3.6.4, 3.8.6 and 4.2.6 (interpretive summaries, not the official text) · Examples are illustrative.</footer>';
 return TBX.reportDoc(L,'5 Whys Report — مدثر سلامه',body,'.ok{color:#2F7D4B;font-weight:700;text-align:center}.bad{color:#B42318;font-weight:700}td.bad{text-align:center}.na{color:#7A869E;text-align:center}ul{padding-inline-start:20px}h3{font-family:Georgia,serif;margin:22px 0 4px;font-size:17px}.an{border-top:1px solid #DCE4EE;padding-top:6px}.an th{width:30%;background:#F3F7FB;color:#1B2A4A}.ch{border-inline-start:4px solid;padding:4px 12px;margin:10px 0;background:#FAFCFE}.ch ol{margin:6px 0;padding-inline-start:22px}.ch li{margin:4px 0}.ch .a{font-weight:600}.rev{background:#F3F7FB;border-radius:8px;padding:8px 12px}');
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
 TBX.download("5Whys-report-"+stamp()+".html","text/html;charset=utf-8",buildReportHTML());
});
document.getElementById("rpCsv").addEventListener("click",function(){ var err=document.getElementById("rpErr"); err.textContent=""; if(!DB.records.length){ err.textContent=t("rpEmpty"); return; } TBX.download("5Whys-analyses-"+stamp()+".csv","text/csv;charset=utf-8",buildCSV()); });
document.getElementById("dCsv").addEventListener("click",function(){ if(!DB.records.length) return; TBX.download("5Whys-analyses-"+stamp()+".csv","text/csv;charset=utf-8",buildCSV()); });

/* ---------- platform identity: academy logo and related tools ---------- */
var LOGO="__LOGO__";
function applyLogo(){ document.querySelectorAll("img[data-logo]").forEach(function(i){ if(i.src!==LOGO) i.src=LOGO; i.alt=t("logoAlt"); }); }
var RELATED=[["capa","CAPA","./capa.html","#C2410C"],["pdca","PDCA","./pdca.html","#1E8C93"],["aud","ISO 19011","./smart-audit-improvement.html","#C9821A"],["q","ISO 9001","./iso9001.html","#1B2A4A"]];
function buildRelated(){
 var box=document.getElementById("homeStd"); if(!box) return;
 box.innerHTML='<p class="hs-t">'+esc(t("related"))+'</p>'+RELATED.map(function(r){ return '<a class="hs on" href="'+r[2]+'" target="_blank" rel="noopener" style="--c:'+r[3]+';--t:'+r[3]+'14"><b dir="ltr">'+r[1]+'</b><span>'+esc(t("rel_"+r[0]))+'</span><em>↗</em></a>'; }).join("");
}

/* ---------- example data (illustrative, fictitious Saudi company) and clear all ---------- */
function W(a,ev,st){ return {a:a,ev:ev,st:st||"ok"}; }
function M(n,role,work){ return {n:n,role:role,work:!!work}; }
function C(t1,o1){ return {t:t1,owner:o1}; }
var EXAMPLE={
ar:[
 fixRec({id:"W5-EX-01",title:"حديد تسليح استُلم دون شهادات المصنع",ref:"NCR-2026-018",src:"capa",capa:"CA-EX-01",pdca:"",area:"المشتريات · مستودع المشروع PRJ-2026-112",date:"2026-04-12",lead:"مدير الجودة",
  prob:{what:"استُلمت شحنة حديد تسليح قطر 16 و20 ملم دون شهادات المصنع التي تشترطها المواصفات الفنية للمشروع.",where:"مستودع المشروع PRJ-2026-112، عند فحص الاستلام.",when:"2026-04-08، عند وصول الشحنة.",much:"شحنة واحدة وزنها 38 طناً (100% منها دون شهادات)، ولم يُصرف منها شيء للموقع."},
  team:[M("مدير الجودة","ميسّر الجلسة",false),M("أمين المستودع","يستلم المواد ويفحصها",true),M("مسؤول المشتريات","يصدر أوامر الشراء",true),M("مهندس الموقع","يستخدم المادة في الموقع",false)],
  chains:[{label:"",whys:[
   W("لأن المورد لم يرسل الشهادات مع الشحنة.","إشعار الاستلام GRN-4471 ومذكرة التسليم لا تذكران أي شهادة."),
   W("لأن أمر الشراء لم يطلب الشهادات.","أمر الشراء PO-2026-0331: لا يوجد فيه بند للشهادات."),
   W("لأن نموذج أمر الشراء لا يحتوي بند الشهادات للمواد الإنشائية.","النموذج PO-F-02 الإصدار 4."),
   W("لأن النموذج صُمم للمشتريات العامة ولم يُراجع على مواصفات المشاريع منذ 2023، ولا أحد مكلف بهذه المراجعة.","سجل الوثائق: آخر مراجعة للنموذج في فبراير 2023، ولا مالك محدد لمراجعته.")
  ],stop:"النموذج ومراجعته تحت سيطرة المنشأة، والدليل يسند كل خطوة. السؤال التالي يعود إلى قرارات 2023 ولا يضيف إجراءً جديداً."}],
  root:"نموذج أمر الشراء لا يشترط شهادات المصنع للمواد الإنشائية، ولا أحد مكلف بمراجعة نماذج المشتريات على مواصفات المشاريع.",test:{stop:"yes",reads:true},
  similar:"could",similarNote:"قد يتكرر مع الخرسانة الجاهزة والكابلات؛ أُضيف البند لها أيضاً، وفُحصت آخر ثلاث شحنات حديد ووُجدت شهاداتها كاملة.",
  cms:[C("إضافة بند «شهادات المصنع شرط للاستلام» إلى نموذج أمر الشراء للمواد الإنشائية","مدير المشتريات"),C("تكليف مدير الجودة بمراجعة نماذج المشتريات سنوياً على مواصفات المشاريع","مدير الجودة"),C("تحديث إجراء الاستلام: لا تُستلم مادة إنشائية دون شهاداتها","مدير الجودة")],
  review:{by:"مدير المشروع PRJ-2026-115",date:"2026-04-14",note:"السلسلة مدعومة بالدليل، والسبب يقع في نموذج يمكن تغييره. أُضيف إلى السبب غياب مالك المراجعة."},created:"2026-04-12T08:00:00.000Z",updated:"2026-04-14T10:00:00.000Z"}),
 fixRec({id:"W5-EX-02",title:"مخططات ملغاة مستخدمة في الموقع ب",ref:"EA-2026-02 / NC-2",src:"capa",capa:"CA-EX-03",pdca:"",area:"الموقع ب · الأعمال الإنشائية",date:"2026-08-18",lead:"مدير الجودة",
  prob:{what:"وُجدت نسخ ورقية من مخططات إنشائية ملغاة (الإصدار C) في مكتب الموقع ب، والإصدار الساري هو E.",where:"مكتب الموقع ب.",when:"2026-08-12، في تدقيق المراقبة الخارجي.",much:"ثلاث نسخ لثلاثة مخططات. لم يُنفذ أي عمل عليها في الأسبوعين السابقين."},
  team:[M("مدير الجودة","ميسّر الجلسة",false),M("مهندس الموقع ب","يستخدم المخططات يومياً",true),M("منسق الوثائق","يوزّع الإصدارات",true)],
  chains:[{label:"",whys:[
   W("لأن أحداً لم يسحب النسخ القديمة عند صدور الإصدار E.","صور مكتب الموقع، ولا يوجد سجل سحب للإصدار C."),
   W("لأن الإصدارات تُرسل بالبريد ولا يُطلب من أحد سحب النسخ الورقية القديمة.","رسالة إرسال الإصدار E بتاريخ 2026-06-30، دون أي تعليمات سحب."),
   W("لأن إجراء ضبط الوثائق لا يحدد مسؤولاً عن السحب في الموقع.","الإجراء QP-03 الإصدار 2، القسم 5."),
   W("لأن الإجراء كُتب للمكتب الرئيسي حين كانت المخططات إلكترونية فقط، وبدأت الطباعة في المواقع لاحقاً.","مقابلة منسق الوثائق؛ يحتاج تأكيداً من تاريخ بدء الطباعة في المواقع.","chk")
  ],stop:"الإجراء تحت سيطرة المنشأة ويمكن تعديله. الجواب الرابع ينتظر تأكيداً لكنه لا يغيّر السبب الجذري."}],
  root:"إجراء ضبط الوثائق لا يحدد مسؤولاً عن سحب النسخ الورقية الملغاة في المواقع.",test:{stop:"yes",reads:true},
  similar:"exist",similarNote:"فُحص الموقعان أ وج: وُجدت نسختان ملغاتان في الموقع ج وسُحبتا.",
  cms:[C("تعديل إجراء ضبط الوثائق: منسق وثائق مسؤول عن السحب في كل موقع","مدير الجودة"),C("قائمة توزيع موقّعة لكل إصدار جديد","منسق الوثائق"),C("فحص شهري للنسخ في مكاتب المواقع","مدير المشروع")],
  review:{by:"",date:"",note:""},created:"2026-08-18T09:00:00.000Z",updated:"2026-08-20T09:00:00.000Z"}),
 fixRec({id:"W5-EX-03",title:"شحنات خرسانة جاهزة مرفوضة عند الاستلام",ref:"NCR-2026-044",src:"capa",capa:"CA-EX-04",pdca:"PD-EX-03",area:"المشروع PRJ-2026-112 · الخرسانة",date:"2026-09-04",lead:"مدير المشروع",
  prob:{what:"تُرفض شحنات خرسانة جاهزة عند الاستلام بسبب الهبوط ودرجة الحرارة.",where:"المشروع PRJ-2026-112، نقطة الاستلام قبل الصب.",when:"أبريل 2026، ثم يوليو وأغسطس 2026 بعد الإجراءات الأولى.",much:"9% من الشحنات في أبريل، و6% في يوليو وأغسطس؛ تأخر الصب ثلاثة أيام في أبريل."},
  team:[M("مدير المشروع","ميسّر الجلسة",false),M("مشرف الصب","يستلم الشحنات ويفحصها",true),M("مسؤول المشتريات","يتعامل مع المورد",false),M("مهندس الجودة","يحلل سجل الاستلام",false)],
  chains:[{label:"",whys:[
   W("لأن حرارة الخرسانة عند الوصول تجاوزت حد 32 درجة، وفقدت الهبوط المطلوب.","تقارير الرفض لشهر أبريل: الحرارة بين 33 و36 درجة."),
   W("لأن الشحنات تتحرك في ساعات الذروة وتنتظر في الموقع تحت حرارة الظهيرة.","سجل الاستلام: الوصول بين 12:00 و16:00، والانتظار من 40 إلى 70 دقيقة."),
   W("لأن الصب يُخطط في وردية النهار دون وقت متفق عليه مع المورد.","جدول الصب لشهر أبريل."),
   W("لأن إجراء تخطيط الصب لا يحتوي قاعدة للصب في الطقس الحار.","الإجراء QP-14 الإصدار 1.")
  ],stop:"قاعدة الطقس الحار تحت سيطرة المنشأة، والدليل يسند كل خطوة."},
  {label:"ماء الخلط عند المورد",whys:[
   W("لأن ماء الخلط لم يُبرَّد في ثلاث شحنات بعد نقل الصب إلى المساء.","تذاكر الخلط في المصنع لشهر يوليو، وتأكيد المورد كتابةً."),
   W("لأن المورد غير ملزم تعاقدياً بالتبريد، وبند أمر الشراء بلا فحص ولا غرامة.","أمر الشراء المعدّل في مايو، والعقد الإطاري مع المورد."),
   W("لأن تقييم المورد لا يشمل ضوابط الطقس الحار.","نموذج تقييم الموردين SE-01؛ يحتاج تأكيداً من إدارة المشتريات.","chk")
  ],stop:"العقد وتقييم المورد تحت سيطرة المنشأة."}],
  root:"سببان عملا معاً: الصب يُخطط في ساعات الحرارة دون قاعدة للطقس الحار، ولا يوجد شرط تعاقدي أو فحص يلزم المورد بتبريد ماء الخلط.",test:{stop:"yes",reads:true},
  similar:"could",similarNote:"قد يتكرر في المشروعين الآخرين صيفاً؛ أُبلغ مديرا المشروعين.",
  cms:[C("قاعدة الصب في الطقس الحار في الإجراء QP-14: الصب بعد السادسة مساءً من مايو إلى سبتمبر","مدير المشروع"),C("شرط تعاقدي بغرامة وفحص حرارة في المصنع قبل الشحن","مدير المشتريات"),C("إضافة ضوابط الطقس الحار إلى تقييم الموردين","مدير الجودة")],
  review:{by:"مدير الجودة",date:"2026-09-10",note:"الفرع الثاني يفسر استمرار الرفض بعد الإجراءات الأولى. الاختبار: لو طُبق السببان معاً لانخفض الرفض تحت 3%."},created:"2026-09-04T07:00:00.000Z",updated:"2026-09-10T11:00:00.000Z"})
],
en:[
 fixRec({id:"W5-EX-01",title:"Reinforcing steel received without mill certificates",ref:"NCR-2026-018",src:"capa",capa:"CA-EX-01",pdca:"",area:"Procurement · PRJ-2026-112 site store",date:"2026-04-12",lead:"Quality manager",
  prob:{what:"A delivery of 16 mm and 20 mm reinforcing steel was received without the mill certificates the project specification requires.",where:"PRJ-2026-112 site store, at receiving inspection.",when:"2026-04-08, when the load arrived.",much:"One 38-tonne delivery (100% of it without certificates); none of it was issued to site."},
  team:[M("Quality manager","Facilitator",false),M("Storekeeper","Receives and inspects materials",true),M("Procurement officer","Issues purchase orders",true),M("Site engineer","Uses the material on site",false)],
  chains:[{label:"",whys:[
   W("The supplier did not send the certificates with the load.","Goods received note GRN-4471 and the delivery note list no certificate."),
   W("The purchase order did not ask for the certificates.","Purchase order PO-2026-0331 has no certificate clause."),
   W("The purchase order form has no certificate clause for structural materials.","Form PO-F-02 revision 4."),
   W("The form was designed for general purchasing and has not been reviewed against project specifications since 2023; no one is assigned to that review.","Document register: last review of the form in February 2023, no review owner named.")
  ],stop:"The form and its review are under the company's control, and evidence supports every step. The next why goes back to 2023 decisions and adds no new action."}],
  root:"The purchase order form does not require mill certificates for structural materials, and no one is assigned to review procurement forms against project specifications.",test:{stop:"yes",reads:true},
  similar:"could",similarNote:"Could recur with ready-mix concrete and cables; the clause was added for them too, and the last three steel deliveries were checked and had full certificates.",
  cms:[C("Add “mill certificates are a condition of receipt” to the purchase order form for structural materials","Procurement manager"),C("Assign the quality manager to review procurement forms against project specifications every year","Quality manager"),C("Update the receiving procedure: no structural material is received without its certificates","Quality manager")],
  review:{by:"Project manager PRJ-2026-115",date:"2026-04-14",note:"The chain is backed by evidence and the cause sits in a form that can be changed. The missing review owner was added to the cause."},created:"2026-04-12T08:00:00.000Z",updated:"2026-04-14T10:00:00.000Z"}),
 fixRec({id:"W5-EX-02",title:"Superseded drawings in use on site B",ref:"EA-2026-02 / NC-2",src:"capa",capa:"CA-EX-03",pdca:"",area:"Site B · structural works",date:"2026-08-18",lead:"Quality manager",
  prob:{what:"Paper copies of superseded structural drawings (revision C) were found in the site B office; the current revision is E.",where:"Site B office.",when:"2026-08-12, at the external surveillance audit.",much:"Three copies of three drawings. No work was built from them in the previous two weeks."},
  team:[M("Quality manager","Facilitator",false),M("Site B engineer","Uses the drawings every day",true),M("Document controller","Issues the revisions",true)],
  chains:[{label:"",whys:[
   W("Nobody withdrew the old copies when revision E was issued.","Photos of the site office; no withdrawal record for revision C."),
   W("Revisions are sent by email and no one is asked to withdraw old paper copies.","Transmittal email for revision E dated 2026-06-30, with no withdrawal instruction."),
   W("The document control procedure names no one responsible for withdrawal on site.","Procedure QP-03 revision 2, section 5."),
   W("The procedure was written for head office when drawings were only electronic; printing on site started later.","Interview with the document controller; the date printing started on site still needs confirming.","chk")
  ],stop:"The procedure is under the company's control and can be changed. The fourth answer is still to be confirmed but does not change the root cause."}],
  root:"The document control procedure names no one responsible for withdrawing superseded paper copies on site.",test:{stop:"yes",reads:true},
  similar:"exist",similarNote:"Sites A and C were checked: two superseded copies were found on site C and withdrawn.",
  cms:[C("Revise the document control procedure: a document controller on each site is responsible for withdrawal","Quality manager"),C("A signed distribution list for every new revision","Document controller"),C("Monthly check of copies in site offices","Project manager")],
  review:{by:"",date:"",note:""},created:"2026-08-18T09:00:00.000Z",updated:"2026-08-20T09:00:00.000Z"}),
 fixRec({id:"W5-EX-03",title:"Ready-mix concrete loads rejected at delivery",ref:"NCR-2026-044",src:"capa",capa:"CA-EX-04",pdca:"PD-EX-03",area:"Project PRJ-2026-112 · concrete",date:"2026-09-04",lead:"Project manager",
  prob:{what:"Ready-mix concrete loads are rejected at delivery for slump and temperature.",where:"Project PRJ-2026-112, the receiving point before the pour.",when:"April 2026, then July and August 2026 after the first actions.",much:"9% of loads in April and 6% in July and August; pours delayed on three days in April."},
  team:[M("Project manager","Facilitator",false),M("Pour supervisor","Receives and checks the loads",true),M("Procurement officer","Deals with the supplier",false),M("Quality engineer","Analyses the delivery log",false)],
  chains:[{label:"",whys:[
   W("The concrete was above the 32 °C limit on arrival and had lost the required slump.","April rejection reports: temperatures between 33 and 36 °C."),
   W("Loads travel at peak hours and wait on site in the midday heat.","Delivery log: arrivals between 12:00 and 16:00, waits of 40 to 70 minutes."),
   W("Pours are planned in the day shift with no agreed time with the supplier.","April pour schedule."),
   W("The pour planning procedure has no hot-weather rule.","Procedure QP-14 revision 1.")
  ],stop:"The hot-weather rule is under the company's control, and evidence supports every step."},
  {label:"Mixing water at the supplier",whys:[
   W("The mixing water was not chilled on three loads after pours moved to the evening.","July batch tickets from the plant, and the supplier's written confirmation."),
   W("The supplier has no contractual duty to chill, and the purchase order clause has no check or penalty.","The purchase order revised in May, and the framework contract with the supplier."),
   W("Supplier evaluation does not cover hot-weather controls.","Supplier evaluation form SE-01; to be confirmed with procurement.","chk")
  ],stop:"The contract and the supplier evaluation are under the company's control."}],
  root:"Two causes acted together: pours are planned in the hot hours with no hot-weather rule, and there is no contract clause or check that obliges the supplier to chill the mixing water.",test:{stop:"yes",reads:true},
  similar:"could",similarNote:"Could recur on the other two projects in summer; both project managers were told.",
  cms:[C("Hot-weather pour rule in procedure QP-14: pours after 6 pm from May to September","Project manager"),C("Contract clause with a penalty, and a temperature check at the plant before dispatch","Procurement manager"),C("Add hot-weather controls to the supplier evaluation","Quality manager")],
  review:{by:"Quality manager",date:"2026-09-10",note:"The second branch explains why rejections continued after the first actions. Test: with both causes removed, rejections would fall below 3%."},created:"2026-09-04T07:00:00.000Z",updated:"2026-09-10T11:00:00.000Z"})
]};
var EXAMPLE_AS={PR1:2,PR2:1,CH1:2,CH2:2,CH3:1,CH4:1,RT1:1,RT2:2,LK1:2,LK2:0};
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
 ar:{fab:"اسأل عن لماذا الخمس",title:"مساعد لماذا الخمس",sub:"إجابات فورية من دليل الأداة وتحليلاتك",new:"محادثة جديدة",close:"إغلاق",ph:"اكتب سؤالك…",send:"إرسال",inL:"سؤالك",
  hello:"مرحباً. أجيب عن أسئلة «لماذا الخمس» من دليل الأداة ومن تحليلاتك المحفوظة في هذا المتصفح. اختر سؤالاً أو اكتب سؤالك.",
  miss:"لم أجد إجابة جاهزة لهذا السؤال. جرّب أحد الأسئلة المقترحة، أو اسأل عن: متى أتوقف، أو الخطأ البشري، أو الفروع، أو الدليل، أو CAPA. وللاستشارة راسل المُعِد على البريد أدناه.",
  instant:"إجابة فورية",foot:"المساعد يعمل في متصفحك ولا يرسل بياناتك. للتواصل:",
  op0:"لا توجد بنود مفتوحة في تحليلاتك الآن.",st0:"لا توجد تحليلات بعد. ابدأ من [[tab:tools]] أو حمّل المثال من [[tab:docs]]."},
 en:{fab:"Ask about 5 Whys",title:"5 Whys assistant",sub:"Instant answers from the tool's guide and your analyses",new:"New chat",close:"Close",ph:"Type your question…",send:"Send",inL:"Your question",
  hello:"Hello. I answer 5 Whys questions from the tool's guide and from your analyses saved in this browser. Pick a question or type your own.",
  miss:"I have no ready answer for that. Try one of the suggested questions, or ask about when to stop, human error, branches, evidence or CAPA. For advice, email the author at the address below.",
  instant:"Instant answer",foot:"The assistant runs in your browser and sends no data. Contact:",
  op0:"No open items in your analyses right now.",st0:"No analyses yet. Start from the [[tab:tools]] or load the example in [[tab:docs]]."}
};
var KB=[
 {id:"five",k:["خمس","خمسة","5","five","rule","قاعدة","عدد"],q:{ar:"هل يجب أن أسأل «لماذا» خمس مرات بالضبط؟",en:"Must I ask “why” exactly five times?"},
  a:{ar:"لا. **خمسة قاعدة تقريبية**. توقّف عندما تصل إلى سبب تستطيع المنشأة تغييره **ويسنده الدليل**؛ قد يكون عند السؤال الثالث، وقد يحتاج سبعة. سجّل سبب التوقف في حقل «لماذا توقفنا هنا؟». الطريقة نفسها ليست متطلباً في ISO 9001:2026؛ المتطلب هو تحديد أسباب عدم المطابقة (10.2.1 ب) 2)). التفاصيل في [[tab:explain-std]].",en:"No. **Five is a rule of thumb.** Stop when you reach a cause the organization can change **and the evidence supports it**; that can be the third why, or it can take seven. Record the reason in “Why did we stop here?”. The method itself is not an ISO 9001:2026 requirement; the requirement is determining the causes of the nonconformity (10.2.1 b) 2)). Details in the [[tab:explain-std]]."}},
 {id:"stop",k:["توقف","أتوقف","اتوقف","stop","when to stop","متى"],q:{ar:"متى أتوقف عن السؤال؟",en:"When do I stop asking?"},
  a:{ar:"توقّف عندما تتحقق ثلاثة أمور: السبب **تستطيع المنشأة تغييره** (طريقة أو نموذج أو صلاحية أو تصميم)، و**الدليل يسنده**، و**إزالته توقف المشكلة**. إذا وصلت إلى سبب خارج سيطرتكم (الطقس، أو قرار جهة حكومية) فارجع خطوة واسأل: ما الذي كان بأيدينا؟",en:"Stop when three things hold: the cause is **one the organization can change** (a method, form, authority or design), **evidence supports it**, and **removing it stops the problem**. If you reach a cause outside your control (the weather, a regulator's decision), step back and ask what was in your hands."}},
 {id:"human",k:["خطأ بشري","بشري","إهمال","اهمال","human","blame","negligence","لوم"],q:{ar:"ماذا أفعل إذا كان الجواب «خطأ بشري»؟",en:"What if the answer is “human error”?"},
  a:{ar:"«خطأ بشري» وصف لما حدث، وليس سبباً جذرياً. اسأل «لماذا» مرة أخرى: ما الذي في العملية سمح بالخطأ؟ نموذج غامض؟ لا فحص ثانٍ؟ تدريب ناقص؟ عبء عمل؟ تنبّه الأداة عندما يشير السبب الجذري إلى شخص فقط، ويفشل فحص «السبب ليس شخصاً فقط» في [[tab:audit]].",en:"“Human error” describes what happened; it is not a root cause. Ask “why” again: what in the process allowed the mistake? An unclear form? No second check? Missing training? Workload? The tool warns when the root cause points at a person only, and the check “root is not a person alone” fails in the [[tab:audit]]."}},
 {id:"branch",k:["فرع","فروع","سببان","أسباب","branch","several causes","parallel"],q:{ar:"ماذا لو كان هناك أكثر من سبب؟",en:"What if there is more than one cause?"},
  a:{ar:"افتح **فرعاً** لكل سبب عمل مع الأول، بحد أقصى فرعين. لكل فرع اسمه وأسئلته وأدلته وسبب توقفه، ثم اكتب سبباً جذرياً يجمع الفروع. مثال المثال W5-EX-03: الصب في ساعات الحرارة، وماء خلط غير مبرد عند المورد. وإذا تعددت الأسباب كثيراً فـ Fishbone أنسب.",en:"Open a **branch** for each cause that acted with the first, two at most. Each branch has its name, whys, evidence and stop reason; then write a root cause that brings the branches together. Example W5-EX-03: pouring in the hot hours, and mixing water not chilled at the supplier. When causes are many, Fishbone fits better."}},
 {id:"evid",k:["دليل","أدلة","evidence","proof","تحقق"],q:{ar:"ما الدليل المطلوب لكل جواب؟",en:"What evidence does each answer need?"},
  a:{ar:"دليل يمكن عرضه: سجل، أو صورة، أو وثيقة بإصدارها، أو بيانات، أو مقابلة مع من يؤدي العمل. صنّف كل جواب: **متحقق منه**، أو **يحتاج تحققاً**، أو **غير مدعوم**. الجواب غير المدعوم في السلسلة الرئيسية يعني أن السبب الجذري لم يثبت بعد.",en:"Evidence you can show: a record, a photo, a document with its revision, data, or an interview with the person who does the work. Mark each answer **verified**, **to check** or **not supported**. An unsupported answer in the main chain means the root cause is not proven yet."}},
 {id:"capa",k:["capa","إجراء تصحيحي","تصحيحي","corrective","ربط","link"],q:{ar:"كيف يرتبط التحليل بسجل CAPA؟",en:"How does the analysis link to a CAPA record?"},
  a:{ar:"ابدأ من [[tab:tools]] ← «ابدأ من سجل CAPA»: تقرأ الأداة سجلات CAPA وتعبّئ المرجع وتعريف المشكلة، دون أن تكتب شيئاً في CAPA. وفي أداة CAPA يظهر في قسم تحليل السبب كل تحليل يذكر السجل، مع زر «استخدم هذا السبب الجذري» الذي ينسخ النص إلى حقل السجل عندما تضغطه وتحفظ.",en:"Start in the [[tab:tools]] → “Start from a CAPA record”: the tool reads the CAPA records and fills the reference and the problem statement, writing nothing to CAPA. In the CAPA tool, the cause analysis section lists every analysis that names the record, with “Use this root cause”, which copies the text into the record's field when you click it and save."}},
 {id:"data",k:["بياناتي","حفظ","تحفظ","data","stored","privacy","متصفح","browser"],q:{ar:"أين تُحفظ بياناتي؟",en:"Where is my data stored?"},
  a:{ar:"في **هذا المتصفح فقط** تحت المفتاح cia-why5:v1، ولا تُرسل إلى أي خادم. تقرأ بوابة الأكاديمية ملخصاً منها للوحة الأداء. صدّر التقرير أو CSV للاحتفاظ بنسخة من [[tab:report]].",en:"In **this browser only**, under the key cia-why5:v1; nothing is sent to a server. The Academy hub reads a summary for its performance dashboard. Export the report or CSV from the [[tab:report]] to keep a copy."}},
 {id:"open",dyn:"open",k:["مفتوح","مفتوحة","متابعة","open items","follow"],q:{ar:"ما البنود المفتوحة في تحليلاتي؟",en:"What is still open in my analyses?"}},
 {id:"status",dyn:"status",k:["وضع","حالة","ملخص","status","summary","where do we stand"],q:{ar:"ما وضع تحليلاتي الآن؟",en:"Where do my analyses stand?"}}
];
var CB_SUG=["five","stop","human","branch","status"];
function kbDyn(id){
 var u=CB[L]||CB.ar;
 if(id==="open"){ var O=openItems(); if(!O.length) return u.op0+"\n\n[[tab:dash]]"; return O.map(function(x){ return "- **"+(x.r.ref||x.r.id)+"** — "+x.s; }).join("\n")+"\n\n[[tab:docs]] · [[tab:dash]]"; }
 if(id==="status"){ var c=counts(); if(!c.n) return u.st0; return "- "+t("kTotal")+": **"+c.n+"**\n- "+t("kTested")+": **"+c.tested+"**\n- "+t("kRev")+": **"+c.rev+"**\n- "+t("kCapa")+": **"+c.capa+"**\n- "+t("kOpen")+": **"+openItems().length+"**\n- "+t("kAs")+": **"+assessScore()+"%**\n\n[[tab:dash]] · [[tab:audit]]"; }
 return "";
}
function cbNorm(s){ return String(s).replace(/[ً-ْـ]/g,"").replace(/[أإآ]/g,"ا").replace(/ة/g,"ه").replace(/ى/g,"ي").toLowerCase(); }
function cbFind(text){ var q=cbNorm(text), best=null, bs=0; KB.forEach(function(f){ var s=0; f.k.forEach(function(k){ if(q.indexOf(cbNorm(k))>=0) s+=k.length>4?2:1; }); if(cbNorm(f.q.ar)===q||cbNorm(f.q.en)===q) s+=10; if(s>bs){ bs=s; best=f; } }); return bs>0?best:null; }
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
document.getElementById("rec-form").addEventListener("input",function(){ refreshForm(); });
document.getElementById("rec-form").addEventListener("change",function(){ refreshForm(); });
document.getElementById("newBtn").addEventListener("click",function(){ clearForm(); });
document.getElementById("langBtn").addEventListener("click",function(){ switchLang(); });
window.addEventListener("hashchange",function(){ var h=location.hash.slice(1); if(h!==curTab) go(h); });
window.addEventListener("storage",function(e){ if(e.key===PDCA_KEY||e.key===CAPA_KEY){ renderHomeCp(); var cl=document.getElementById("capaList"); if(cl) cl.innerHTML=fill((capaRecs()||[]).map(function(r){ return [str(r.id),str(r.ref)+" · "+str(r.title)]; })); var dl=document.getElementById("pdcaList"); if(dl) dl.innerHTML=fill(pdcaCycles().map(function(c){ return [c.id,c.title]; })); if(CP) cpPreview(true); refreshForm(); } });

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
