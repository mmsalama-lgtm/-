/* ===== Pareto tool — host logic. Analyses and assessment are stored in this browser only (localStorage, wrapped in try/catch). =====
   Storage key "cia-pareto:v1" (this tool only). Schema:
   { records: [ {
       id, title, ref, q (the question the chart answers, one line),
       src: "ncr"|"capa"|"audit"|"cc"|"inc"|"kpi"|"fish"|"other", area, pdca (PDCA cycle id),
       from, to (YYYY-MM-DD, the period of the data), date (analysis date), owner (data owner),
       unit: "count"|"cost"|"hours"|"sev", unitNote                 cost in SAR; for "sev" the weights are written in unitNote
       team:  [ {n, role} ]
       cats:  [ {id, name, def, v, a, vf: ""|"add"|"drop", why, nx: {how: ""|"fish"|"why5"|"capa", ref}} ]
                                                                  up to 15 named categories; v = value in the period, a = value
                                                                  after the action (same unit, same length of period), null when empty;
                                                                  vf = the team's change from the cut-off line, with its reason (why);
                                                                  nx = next step for a vital-few category and the id it was recorded as
       other: {v, a, def}                                         the single "Other" bucket, drawn last and never in the vital few
       cut:   60..90 (default 80)                                 cumulative % that marks the vital few on the chart
       vconf: true|false, vnote                                   the team confirmed the vital few (judgement, not only the line)
       strat                                                      stratification note (by site, shift, supplier or product)
       after: {from, to, verdict: ""|"imp"|"same"|"worse", note}  before/after check on the same categories
       review: {by, date, note}                                   review by someone outside the team
       created, updated } ],
     assess: { QD1..AC3: 0|1|2 } }
   Other tools' keys are only read, never written: "cia-capa:v1" (CAPA records: categories, next steps), "cia-fish:v1" (Fishbone
   causes by category or votes, next steps), "cia-why5:v1" (5 Whys analyses as next steps), "audit-center:v1" (Smart Audit findings
   by clause or department) and "cia-pdca:v1" (PDCA cycle names). "Start in Fishbone" passes the Fishbone tool its address
   (?pareto=ID&cat=CAT) or, inside the hub, its one-time sessionStorage hint "cia-nav:fishbone" = {pareto, cat}; 5 Whys opens through
   its own ?open= / "cia-nav:five-whys". This tool reads its own hint "cia-nav:pareto" ({open}) once and removes it. None holds tool data. */
var LKEY="cia-lang", STORE="cia-pareto:v1", CAPA_KEY="cia-capa:v1", FISH_KEY="cia-fish:v1", WHY5_KEY="cia-why5:v1", AUD_KEY="audit-center:v1", PDCA_KEY="cia-pdca:v1",
    NAV_KEY="cia-nav:pareto", FISH_NAV="cia-nav:fishbone", WHY5_NAV="cia-nav:five-whys";
var L=(function(){ try{ return localStorage.getItem(LKEY)||"ar"; }catch(e){ return "ar"; } })();
var TABS=["home","explain-std","explain-cl","assess","tools","docs","audit","dash","report","ai"];
var TITLES={ar:"Pareto | باريتو — تحليل القلة الحيوية — مدثر سلامه",en:"Pareto | Vital few analysis — مدثر سلامه"};
var STAGES=["question","data","vital","acted","checked","reviewed"];
var SCOL={question:"#C2410C",data:"#3563C9",vital:"#B8901E",acted:"#1B2A4A",checked:"#1E8C93",reviewed:"#3C9A5F"};
var SRCS=["ncr","capa","audit","cc","inc","kpi","fish","other"];
var UNITS=["count","cost","hours","sev"];
var HOWS=["fish","why5","capa"];
var VERDS=["imp","same","worse"];
var MAXC=15, CUT0=80, CUTMIN=60, CUTMAX=90;
var VCOL="#1B2A4A", NCOL="#9AA5B8", OCOL="#C9D3E0", GOLD="#B8901E", ACOL="#3C9A5F";
var DB=load();
var curTab="home";
var editing=null;   /* deep copy of the analysis open in the form: keeps created between saves */
var BD=null;        /* rows of the read-only category builder */

var UI={
ar:{brand:"أكاديمية التحسين المستمر · مدثر سلامه",toolName:"أداة باريتو — تحليل القلة الحيوية",sgLearn:"التعلّم",sgWork:"العمل",sgOut:"المخرجات",
 nHome:"الرئيسية",nStd:"دليل المنهجية",nCl:"دليل البنود",nAssess:"التقييم الذاتي",nTools:"تحليل باريتو",nDocs:"السجلات",nAudit:"التدقيق",nDash:"لوحة المؤشرات",nReport:"التقرير",nAi:"المساعد الذكي",soon:"قريباً",
 homeCode:"اسأل سؤالاً · عرّف الفئات · رتّب البيانات · أكّد القلة الحيوية · تحقّق من الأثر",homeH1:"باريتو — تحليل القلة الحيوية",
 homeLede:"أداة تجيب عن سؤال واحد: أي الفئات تصنع معظم المشكلة؟ تكتب السؤال والفترة ووحدة القياس وتعريف كل فئة، فترتّب الأداة الفئات من الأكبر إلى الأصغر وترسم المخطط مع النسبة التراكمية وخط القطع. ثم يؤكد الفريق القلة الحيوية بحكمه، وتنتقل كل فئة منها إلى تحليل السبب أو إلى سجل CAPA، ويُتحقق من الأثر بمخطط ثانٍ بعد الإجراء.",
 homeNote:"النسخة الحالية تحفظ التحليلات في متصفحك فقط. الحفظ على الخادم وتسجيل الدخول يُضافان في مرحلة المنصة المشتركة.",
 prep:"إعداد",authorName:"مدثر سلامه",cycleT:"ما الذي تستطيع فعله هنا",cycleS:"اقرأ دليل المنهجية، ثم قيّم طريقة استخدامكم لباريتو، ثم ابدأ أول تحليل من بيانات CAPA أو التدقيق أو من سجلاتك.",
 tStd:"كيف تكتب السؤال، وتعرّف الفئات، وتختار الفترة والوحدة، وتقرأ المخطط، ولماذا 80/20 قاعدة تقريبية وليست قانوناً.",tCl:"البنود التي تخدمها الطريقة في ISO 9001:2026، وأولها 9.1.3 و10.2.1 ب) 2): ملخص تفسيري ومثال وما يطلبه المدقق.",tAssess:"عشرة أسئلة تقيس ممارسة باريتو لديكم، من السؤال قبل البيانات حتى عرض المخطط في مراجعة الإدارة.",
 tTools:"تحليل كامل لكل سؤال: الفئات وتعريفاتها وقيمها، والمخطط الحي، والقلة الحيوية وتأكيدها، والخطوة التالية لكل فئة، والتحقق قبل وبعد، والمراجعة.",tDocs:"كل التحليلات بمرحلتها وتنبيهاتها، وبيانات المثال.",tAudit:"فحص آلي لكل تحليل: السؤال، والفترة والوحدة، والتعريفات، و«أخرى»، وتأكيد القلة الحيوية، والخطوات التالية، والتحقق قبل وبعد، والمراجعة.",
 tDash:"التحليلات المؤكدة والمربوطة والمتحقق منها، ونتائج قبل وبعد، والبنود المفتوحة، والتقييم الذاتي، في صفحة واحدة.",tReport:"تقرير HTML يرسم كل تحليل بمخطط باريتو وجدول الترتيب، ومخطط قبل وبعد، وملف CSV.",tAi:"مساعد يقرأ المخطط ويقترح تقسيماً للفئات الكبيرة. لم يُفعَّل بعد.",
 foot:"المراجع: ISO 9001:2026 البنود 7.1.6 و9.1.3 و9.3.2 و10.1 و10.2 والملحقان A.9.1 وA.10.2، ومصطلحات ISO 9000:2026 (ملخصات تفسيرية، وليست النص الرسمي). «باريتو» طريقة عمل وليست متطلباً في أي مواصفة. الأمثلة توضيحية وليست بيانات حقيقية.",
 heroTag:"أداة منهجية · تخدم ISO 9001:2026 البندين 9.1.3 و10.2.1 ب)",langSw:"English",langSwA:"Switch to English",logoAlt:"أكاديمية التحسين المستمر — مدثر سلامه",
 related:"أدوات مرتبطة في الأكاديمية",rel_capa:"الإجراءات التصحيحية",rel_fish:"عظمة السمكة — تحليل السبب والنتيجة",rel_why5:"لماذا الخمس — تحليل السبب الجذري",rel_aud:"مركز التدقيق والتحسين الذكي",
 termT:"هل «باريتو» متطلب في ISO 9001:2026؟",
 termP1:"لا. مخطط باريتو وقاعدة 80/20 طريقة لترتيب الفئات بحسب حجم إسهامها في المشكلة، وليس بنداً في أي مواصفة. المتطلبات التي يخدمها هي تحليل البيانات الناتجة عن الرصد والقياس وتقييمها في البند 9.1.3 من ISO 9001:2026، وتذكر ملاحظته أن طرق التحليل قد تشمل الأساليب الإحصائية؛ واختيار المكان الذي تُحدَّد فيه الأسباب ضمن 10.2.1 ب) 2)، ويترك الملحق A.10.2 للمنشأة أن تقرر مدى التحقيق.",
 termP2:"و80/20 قاعدة تقريبية وليست قانوناً: قد تصنع فئتان 60% فقط، وقد تصنع فئة واحدة 90%. والمخطط لا يكون أفضل من تعريفات فئاته والفترة والوحدة المختارة (عدد، أو تكلفة، أو وقت، أو درجة خطورة). والفئة الكبيرة مكان تحفر فيه، وليست سبباً؛ فالسبب تجده عظمة السمكة أو لماذا الخمس أو البيانات بعد ذلك.",
 termIs:"ملخص تفسيري بصياغة مستقلة، وليس النص الرسمي. المصادر: ISO 9001:2026 البندان 9.1.3 و10.2.1 والملحقان A.9.1 وA.10.2، وISO 9000:2026 المصطلحات المذكورة والمبدأ 4.2.7. التحقق: 2026-10-11.",
 defs:[["البيانات","ISO 9000:2026 · 3.8.1","وقائع عن شيء ما. كل عمود في المخطط عدّ أو مجموع لوقائع مسجلة، لا لانطباعات.","#3563C9"],["لوحة المؤشرات","ISO 9000:2026 · 3.8.2","عرض رقمي ورسومي للأداء واتجاهات النتائج، ومن أمثلته في المصطلح مخططات باريتو.","#B8901E"],["الأسلوب الإحصائي","ISO 9000:2026 · 3.8.3","طريقة لتحليل بيانات كمية مرتبطة بالتباين. ترتيب باريتو أبسط هذه الطرق.","#1E8C93"],["الدليل الموضوعي","ISO 9000:2026 · 3.8.6","بيانات تدعم وجود شيء أو صحته. الفئة الكبيرة تبيّن أين تبحث، والدليل يثبت السبب.","#1B2A4A"]],
 asT:"التقييم الذاتي لممارسة باريتو",asS:"أجب عن كل سؤال بما يحدث فعلاً في تحليلاتكم. النتيجة تقيس الممارسة الحالية، وليست شهادة ولا حكماً على الأداء.",asReset:"مسح الإجابات",asSaved:"تم حفظ الإجابة",asAnswered:"أُجيب {n} من 10",
 band0:"يحتاج عملاً",band1:"في طور التطوير",band2:"راسخ",bandNote:"حدود داخلية للتقييم الذاتي من تصميم هذه الأداة، وليست معياراً رسمياً.",as0:"غير موجود",as1:"جزئي",as2:"موجود ومطبّق",
 g_QD:"السؤال والتعريفات",g_DT:"البيانات",g_VF:"القلة الحيوية",g_AC:"الإجراء والتحقق",
 tlT:"تحليل باريتو",tlS:"تحليل واحد لكل سؤال. اكتب السؤال والفترة والوحدة، وعرّف كل فئة في سطر، وأدخل القيم؛ فترتّب الأداة الفئات وترسم المخطط أثناء الكتابة. ثم أكّد القلة الحيوية، واربط كل فئة منها بخطوتها التالية، وتحقق من الأثر بعد الإجراء. تتحدد المرحلة تلقائياً مما تملؤه.",
 save:"حفظ التحليل",newRec:"تحليل جديد",savedFail:"تعذّر الحفظ في هذا المتصفح. نزّل التقرير قبل إغلاق الصفحة.",cur:"المرحلة الحالية:",ok_rec:"تم حفظ التحليل",
 st_question:"السؤال",st_data:"البيانات",st_vital:"القلة الحيوية",st_acted:"الخطوات التالية",st_checked:"تحقق الأثر",st_reviewed:"روجع التحليل",
 sQT:"السؤال والفترة والوحدة · البند 9.1.3",sQS:"سؤال واحد في سطر يجيب عنه المخطط، ثم الفترة ووحدة القياس. العدد ليس دائماً المقياس الصحيح: التكلفة أو الوقت أو الخطورة قد ترتّب الفئات ترتيباً مختلفاً.",
 sTeamT:"الفريق ومالك البيانات",sTeamS:"من جمع البيانات وصنّفها، ومن يملك مصدرها.",
 sCatT:"الفئات وقيمها",sCatS:"حتى 15 فئة، لكل منها تعريف في سطر يجعل شخصين يصنّفان البند نفسه في الفئة نفسها. و«أخرى» سطر واحد في النهاية، ويجب أن يبقى أصغر من أصغر فئة مسماة.",
 sChartT:"مخطط باريتو",sChartS:"يُرسم مما أدخلته: أعمدة مرتبة من الأكبر، وخط النسبة التراكمية، وخط القطع. على الهاتف يظهر جدولاً مرتباً بأشرطة.",
 sVitalT:"القلة الحيوية",sVitalS:"الخط يقترح الفئات حتى نسبة القطع. الفريق يؤكد بحكمه: يضيف فئة أصغر لكنها حرجة للسلامة أو للعميل، أو يستبعد فئة، ويكتب السبب.",
 sStratT:"التقسيم الطبقي",sStratS:"إذا كانت فئة كبيرة تخفي عدة مشكلات، فقسّمها بحسب الموقع أو الوردية أو المورد أو المنتج، وارسم مخططاً لها.",
 sNextT:"الخطوة التالية لكل فئة حيوية · البند 10.2.1 ب) 2)",sNextS:"الفئة الكبيرة مكان تحفر فيه، وليست سبباً. لكل فئة حيوية خطوة: تحليل عظمة السمكة، أو لماذا الخمس، أو سجل CAPA، ويُسجَّل رقم التحليل أو السجل.",
 sBaT:"التحقق قبل وبعد · البند 10.1",sBaS:"بيانات ثانية للفئات نفسها، بالوحدة نفسها، ولفترة بالطول نفسه بعد الإجراء. ثم يؤكد الفريق الحكم.",
 sRevT:"المراجعة",sRevS:"يراجع التحليلَ شخصٌ من خارج الفريق ويؤرخ مراجعته.",
 f_title:"عنوان مختصر",f_ref:"رقم المرجع (إن وُجد)",f_q:"السؤال الذي يجيب عنه المخطط",f_src:"مصدر البيانات",f_area:"العملية أو الموقع",f_pdca:"دورة PDCA المرتبطة",f_date:"تاريخ التحليل",f_owner:"مالك البيانات",
 f_from:"بداية الفترة",f_to:"نهاية الفترة",f_unit:"وحدة القياس",f_unitNote:"ملاحظة الوحدة (أوزان الخطورة أو أساس التكلفة)",f_cut:"نسبة القطع",f_vconf:"أكّد الفريق القلة الحيوية",f_vnote:"ملاحظة التأكيد",f_strat:"ملاحظة التقسيم الطبقي",
 f_afrom:"بداية فترة ما بعد الإجراء",f_ato:"نهاية فترة ما بعد الإجراء",f_verdict:"حكم الفريق",f_anote:"ملاحظة التحقق",f_rby:"المراجِع (من خارج الفريق)",f_rdate:"تاريخ المراجعة",f_rnote:"ملاحظة المراجعة",
 src_ncr:"سجل عدم المطابقة (NCR)",src_capa:"سجلات CAPA",src_audit:"ملاحظات التدقيق",src_cc:"شكاوى العملاء",src_inc:"الحوادث",src_kpi:"مؤشر أداء",src_fish:"أسباب عظمة السمكة",src_other:"مصدر آخر",
 u_count:"العدد",u_cost:"التكلفة (ريال)",u_hours:"الساعات المفقودة",u_sev:"درجة مرجّحة بالخطورة",us_count:"",us_cost:"ريال",us_hours:"ساعة",us_sev:"نقطة",
 sevHint:"اكتب الأوزان المستخدمة، مثل: رئيسية = 3، ثانوية = 1.",
 v_:"—",v_imp:"تحسّن",v_same:"لا تغيّر واضح",v_worse:"ساء",
 tmN:"الاسم",tmRole:"الدور",tmAdd:"إضافة عضو",tmDel:"حذف العضو",tmNone:"لم يُضف أحد بعد.",
 cN:"الفئة",cDef:"التعريف (سطر واحد)",cV:"القيمة",cDel:"حذف الفئة",cAdd:"إضافة فئة",cMax:"الحد الأقصى 15 فئة؛ ضع الباقي في «أخرى» أو قسّم التحليل.",otherName:"أخرى",otherDef:"ما يدخل في «أخرى»",
 otherBig:"«أخرى» أكبر من فئة مسماة: افحص ما بداخلها وأخرج منه فئة جديدة.",otherTop:"«أخرى» هي الأكبر: المخطط لا يجيب عن السؤال بعد. قسّمها إلى فئات معرّفة.",
 noData:"لا توجد بيانات بعد.",chEmpty:"أدخل قيم فئتين على الأقل ليظهر المخطط.",
 legV:"فئة في القلة الحيوية",legN:"فئة أخرى",legO:"«أخرى»",legC:"النسبة التراكمية",legCut:"خط القطع",legB:"قبل",legA:"بعد",
 axV:"القيمة",axC:"تراكمي %",cutL:"{p}% القطع",
 vRank:"الترتيب",vName:"الفئة",vVal:"القيمة",vShare:"النسبة",vCum:"التراكمي",vLine:"بحسب الخط",vIn:"في القلة الحيوية",vWhy:"سبب التغيير عن الخط",vWhyPh:"مثلاً: أصغر لكنها حرجة للسلامة",
 vCount:"القلة الحيوية: {n} فئة تصنع {p}% من المجموع.",vNone:"لم تُحدَّد القلة الحيوية بعد.",vNeedWhy:"اكتب سبب كل تغيير عن الخط قبل التأكيد.",
 nxHow:"الخطوة التالية",nxRef:"رقم التحليل أو السجل",nxRefPh:"اختر أو اكتب الرقم",how_:"— اختر —",how_fish:"تحليل عظمة السمكة",how_why5:"تحليل لماذا الخمس",how_capa:"سجل CAPA",
 nxStartFish:"ابدأ تحليل عظمة سمكة لهذه الفئة",nxStart5:"افتح أداة لماذا الخمس",nxStartCapa:"افتح أداة CAPA",nxOpen:"افتح المربوط",nxSave:"احفظ التحليل أولاً: أداة عظمة السمكة تقرأ الفئة من التحليل المحفوظ.",nxHub:"داخل المنصة تُفتح الأداة الأخرى مكان هذه الأداة: احفظ التحليل أولاً.",
 nxNone:"أكّد القلة الحيوية أولاً لتظهر فئاتها هنا.",nxMiss:"هذا الرقم غير موجود في الأداة الأخرى على هذا المتصفح.",nxNoData:"لا توجد بيانات في هذه الأداة على هذا المتصفح بعد.",
 pvFish:"{id} · {st} · الأثر: {t}",pvWhy5:"{id} · {st} · السبب الجذري: {t}",pvCapa:"{id} · {ref} · {st} · {t}",pvNo:"لم يُكتب بعد",
 fst_effect:"تعريف الأثر",fst_causes:"رسم الأسباب",fst_selected:"اختيار الأسباب",fst_verified:"تحقق السبب الجذري",fst_reviewed:"روجع التحليل",
 w5st_problem:"تعريف المشكلة",w5st_chain:"سلسلة لماذا",w5st_root:"السبب الجذري",w5st_tested:"اختُبر السبب",w5st_reviewed:"روجع التحليل",
 cst_react:"التفاعل",cst_cause:"تحليل السبب",cst_action:"الإجراء",cst_verify:"التحقق من الفعالية",cst_closed:"مغلق",cst_reopened:"أعيد فتحه",
 baCat:"الفئة",baB:"قبل",baA:"بعد",baD:"الفرق",baP:"التغيّر",baTot:"المجموع",baVit:"القلة الحيوية",baLen:"طول الفترتين: قبل {b} يوماً، بعد {a} يوماً.",baLenW:"طول الفترتين مختلف (قبل {b} يوماً، بعد {a} يوماً): المقارنة لا تصح على الأساس نفسه. عدّل الفترة أو قارن معدلات.",
 baSug:"الحساب يقترح: {v} (القلة الحيوية {p}، المجموع {q}). الحكم للفريق.",baNeed:"أدخل فترة ما بعد الإجراء وقيمة كل فئة لتظهر المقارنة.",baChart:"قبل وبعد",
 cpOpen:"افتح PDCA",pdFound:"دورة PDCA: {t}",pdMiss:"لم يُعثر على هذه الدورة في أداة PDCA على هذا المتصفح.",pdHint:"اكتب رقم الدورة، مثل PD-EX-03، إن وُجدت.",pdOpen:"افتح PDCA",
 bdT:"ابنِ الفئات من بيانات هذا المتصفح (قراءة فقط)",bdS:"تقرأ الأداة سجلات CAPA أو أسباب عظمة السمكة أو ملاحظات مركز التدقيق المحفوظة في هذا المتصفح، وتعدّها بحسب ما تختار ضمن فترة التحليل، وتعرضها للمعاينة قبل أي تعبئة. لا يُكتب أي شيء في الأدوات الأخرى.",
 bdSrc:"المصدر",bdBy:"التجميع بحسب",bdPrev:"اعرض المعاينة",bdUse:"استخدم هذه الفئات في النموذج",
 bs_capa:"سجلات CAPA",bs_fish:"أسباب عظمة السمكة",bs_audit:"ملاحظات مركز التدقيق",
 by_src:"مصدر السجل",by_cls:"درجة عدم المطابقة",by_area:"العملية أو الموقع",by_method:"طريقة تحليل السبب",by_bone:"فئة العظمة (عدد الأسباب)",by_votes:"فئة العظمة (مجموع الأصوات)",by_clause:"البند",by_dept:"الإدارة",
 bdPer:"الفترة المستخدمة: من {f} إلى {t}، من حقلي الفترة في النموذج.",bdAll:"لم تُحدَّد فترة في النموذج: تُعد كل البيانات. اكتب الفترة أولاً لتقصر العدّ عليها.",
 bdNone:"لا توجد بيانات من هذا المصدر في هذا المتصفح.",bdEmpty:"لا توجد بنود من هذا المصدر داخل الفترة.",bdUsed:"عُبّئت {n} فئة في النموذج من {s}. راجع التعريفات واحفظ. لم يُكتب أي شيء في الأداة الأخرى.",bdMore:" دُمجت {n} مجموعة صغيرة في «أخرى».",
 bdColC:"الفئة",bdColV:"القيمة",bdColN:"أمثلة",bdDef:"{s} حيث «{by}» = «{v}»، داخل الفترة.",bdDefF:"أسباب غير مستبعدة على عظمة «{v}» في تحليلات عظمة السمكة داخل الفترة.",bdDefV:"مجموع أصوات الأسباب على عظمة «{v}» داخل الفترة.",bdDefA:"ملاحظات التدقيق (عدا الممارسات الإيجابية) {by} «{v}» داخل الفترة.",bdUnitV:"مجموع أصوات الفريق على أسباب كل فئة",
 cls_maj:"رئيسية",cls_min:"ثانوية",cls_obs:"ملاحظة",cls_:"غير مصنفة",cs_ncr:"تقرير عدم مطابقة",cs_ia:"تدقيق داخلي",cs_ea:"تدقيق خارجي",cs_cc:"شكوى عميل",cs_kpi:"مؤشر عملية",cs_sup:"مورد",cs_inc:"حادث",cm_why5:"لماذا الخمس",cm_fish:"عظمة السمكة",cm_other:"طريقة أخرى",cm_:"لم تُختر",
 dp_tend:"المناقصات والعقود",dp_proc:"المشتريات",dp_proj:"المشاريع والإنشاء",dp_equip:"المعدات واللوجستيات",dp_hse:"الصحة والسلامة والبيئة",dp_it:"تقنية المعلومات",dp_risk:"المخاطر والاستمرارية",dp_comp:"الامتثال",dp_hr:"الموارد البشرية",dp_qa:"الجودة وضبط الوثائق",dp_eng:"الهندسة",dp_fin:"المالية",dp_:"غير محددة",
 hmT:"في هذا المتصفح بيانات يمكن ترتيبها: {c} سجل CAPA، و{f} تحليل عظمة سمكة، و{a} ملاحظة تدقيق.",hmGo:"ابنِ الفئات",
 e_title:"أدخل عنواناً مختصراً للتحليل.",e_q:"اكتب السؤال الذي يجيب عنه المخطط قبل الحفظ.",e_per:"نهاية الفترة لا تسبق بدايتها.",e_aper:"نهاية فترة ما بعد الإجراء لا تسبق بدايتها.",e_rdate:"تاريخ المراجعة لا يسبق تاريخ التحليل.",e_neg:"القيم لا تكون سالبة.",
 exT:"بيانات المثال",exS:"ثلاثة تحليلات توضيحية لشركة سعودية افتراضية (شركة الواحة للمقاولات): عدم المطابقة بحسب الفئة من يناير إلى سبتمبر 2026 (وفي قلتها الحيوية سجلات CAPA ‏CA-EX-01 وCA-EX-03 وCA-EX-04، وأضاف الفريق فئة المعايرة بسبب مكتوب)، وشحنات الخرسانة المرفوضة بحسب السبب مع التحقق قبل وبعد قاعدة الطقس الحار (مربوطة بعظمة السمكة FB-EX-02 وCAPA ‏CA-EX-04)، والبيانات نفسها مرتبة بالتكلفة ليتبيّن كيف يتغير الترتيب، مع إجابات للتقييم الذاتي. البيانات توضيحية وليست حقيقية، وتحميلها يستبدل كل بيانات هذه الأداة في متصفحك.",
 exLoad:"تحميل المثال",exClear:"مسح كل البيانات",exLoaded:"تم تحميل المثال: 3 تحليلات وإجابات التقييم الذاتي.",exCleared:"تم مسح كل بيانات الأداة من هذا المتصفح.",
 exConfirmClear:"سيحذف هذا كل تحليلات باريتو وإجابات التقييم الذاتي من هذا المتصفح، ولا يمكن التراجع عن ذلك.\n\nهل تريد المتابعة؟",
 dT:"تحليلات باريتو",dS:"كل تحليل بمرحلته وتنبيهاته. افتح التحليل لتعديله في «تحليل باريتو».",csv:"تصدير CSV",none:"لا توجد تحليلات بعد. ابدأ من «تحليل باريتو» أو حمّل المثال.",
 colRef:"المرجع والعنوان",colSrc:"المصدر والوحدة",colStage:"المرحلة",colCats:"الفئات",colVital:"القلة الحيوية",colBa:"قبل وبعد",colFlags:"تنبيهات",colAct:"إجراءات",open:"فتح",del:"حذف",delArm:"تأكيد الحذف",
 catsN:"{n} فئة · المجموع {t}",baNone:"لم يُتحقق بعد",
 fl_q:"السؤال لم يُكتب",fl_per:"الفترة أو الوحدة ناقصة",fl_def:"فئات دون تعريف: {n}",fl_few:"أقل من ثلاث فئات بقيم",fl_oth:"«أخرى» أكبر من فئة مسماة",fl_othTop:"«أخرى» هي الأكبر",fl_conf:"القلة الحيوية لم تُؤكَّد",fl_why:"تغيير عن الخط دون سبب",fl_next:"فئات حيوية دون خطوة مربوطة: {n}",fl_ba:"الأثر لم يُتحقق منه",fl_len:"طول الفترتين مختلف",fl_worse:"الحكم: ساء",fl_same:"الحكم: لا تغيّر واضح",fl_wait:"ينتظر المراجعة",fl_rev:"المراجِع من الفريق",
 auT:"التدقيق الآلي للتحليلات",auS:"هذه الفحوص تُطبَّق على كل تحليل وتُظهر الثغرات التي يلاحظها المدقق عادةً. الخانة «—» تعني أن الفحص لا ينطبق بعد على مرحلة التحليل.",
 auRec:"تحليلات مُدقّقة",auPass:"فحوص ناجحة",auFail:"تحليلات بها ثغرات",auOpen:"بنود مفتوحة",auEmpty:"لا توجد تحليلات لتدقيقها.",
 c_ref:"له مرجع",c_q:"السؤال مكتوب",c_pu:"الفترة والوحدة محددتان",c_def:"كل فئة معرّفة",c_three:"ثلاث فئات على الأقل بقيم",c_oth:"«أخرى» ليست الأكبر",c_conf:"القلة الحيوية مؤكدة بسبب لكل تغيير",c_next:"لكل فئة حيوية خطوة مربوطة",c_ba:"قبل وبعد على الأساس نفسه",c_rev:"مراجعة مستقلة مؤرخة",
 dashT:"لوحة المؤشرات",dashS:"أرقام تُحسب من التحليلات والتقييم في هذا المتصفح.",kTotal:"إجمالي التحليلات",kConf:"قلة حيوية مؤكدة",kLinked:"كل فئاتها الحيوية مربوطة",kBa:"تحقق قبل وبعد",kImp:"تحسّن بعد الإجراء",kRev:"روجعت",kCats:"فئات على المخططات",kOpen:"بنود مفتوحة",kAud:"نجاح التدقيق",kAs:"التقييم الذاتي",
 byStage:"توزيع المراحل",byVerdict:"نتيجة التحقق قبل وبعد",byNext:"الخطوات التالية للفئات الحيوية",byAssess:"التقييم الذاتي حسب المجموعة",openT:"بنود تحتاج متابعة",noOpen:"لا توجد بنود مفتوحة.",vd_none:"لم يُتحقق",nx_none:"دون خطوة",
 oi_q:"السؤال لم يُكتب",oi_per:"الفترة أو الوحدة ناقصة (ولدرجة الخطورة: الأوزان)",oi_def:"{n} فئة دون تعريف",oi_oth:"«أخرى» أكبر من فئة مسماة: قسّمها",oi_othTop:"«أخرى» هي الأكبر: المخطط لا يجيب عن السؤال",oi_conf:"البيانات جاهزة والقلة الحيوية لم تُؤكَّد",oi_why:"تغيير عن خط القطع دون سبب مكتوب",oi_next:"{n} فئة حيوية دون خطوة تالية مربوطة",oi_ba:"الخطوات اتُّخذت والأثر لم يُتحقق منه قبل وبعد",oi_len:"فترة ما بعد الإجراء بطول مختلف",oi_worse:"الحكم بعد الإجراء: ساء",oi_same:"الحكم بعد الإجراء: لا تغيّر واضح",oi_wait:"ينتظر مراجعة من خارج الفريق",oi_rev:"المراجِع من أعضاء الفريق",
 rpT:"تقرير باريتو",rpS:"تقرير HTML يُنزَّل إلى جهازك ويُطبع أو يُحفظ PDF من المتصفح، يرسم كل تحليل بمخططه ويعرض جدول الترتيب. وCSV لتحليل البيانات في جدول.",rpHtml:"تنزيل تقرير HTML",rpNote:"التقرير يحمل اسم المُعِد «مدثر سلامه» ويتضمن الغلاف والملخص، وكل تحليل بمخطط باريتو وجدول الترتيب والقلة الحيوية وخطواتها التالية ومخطط قبل وبعد، ونتائج التدقيق، والبنود المفتوحة، والتقييم الذاتي.",rpPrev:"معاينة سريعة",rpEmpty:"لا توجد تحليلات للتصدير بعد.",
 rpCover:"تقرير تحليل باريتو",rpRank:"جدول الترتيب",rpVital:"القلة الحيوية وخطواتها التالية",rpBa:"التحقق قبل وبعد",rpLine:"بالخط",rpAdd:"أضافها الفريق",rpDrop:"استبعدها الفريق",
 aiT:"المساعد الذكي — قيد البناء",aiS:"سيقرأ هذا المساعد المخطط ويقترح تقسيماً للفئات الكبيرة، وينبّه إلى «أخرى» الكبيرة وإلى الفترات غير المتساوية. لن يعمل قبل تهيئة محرك المنصة المشتركة، ولن يُظهر نتائج مزيّفة.",
 aiList:["اقتراح تقسيم طبقي لفئة كبيرة","التنبيه إلى تعريفات متداخلة بين فئتين","مقارنة المخطط بالفترة السابقة"],
 revW:"المراجِع من أعضاء الفريق. اختر شخصاً من خارجه.",yes:"نعم",no:"لا",days:"يوماً"},
en:{brand:"Continual Improvement Academy · مدثر سلامه",toolName:"Pareto tool — Vital few analysis",sgLearn:"Learn",sgWork:"Work",sgOut:"Output",
 nHome:"Home",nStd:"Method guide",nCl:"Clause guide",nAssess:"Self-assessment",nTools:"Pareto analysis",nDocs:"Records",nAudit:"Audit",nDash:"Dashboard",nReport:"Report",nAi:"AI Assistant",soon:"Soon",
 homeCode:"Ask one question · Define the categories · Rank the data · Confirm the vital few · Check the effect",homeH1:"Pareto — Vital few analysis",
 homeLede:"A tool that answers one question: which categories make up most of the problem? You write the question, the period, the unit and a definition for each category; the tool ranks the categories from largest to smallest and draws the chart with the cumulative percentage and the cut-off line. The team then confirms the vital few with its own judgement, each of them moves to cause analysis or a CAPA record, and the effect is checked with a second chart after the action.",
 homeNote:"This version keeps analyses in your browser only. Server storage and sign-in come with the shared platform phase.",
 prep:"Prepared by",authorName:"مدثر سلامه",cycleT:"What you can do here",cycleS:"Read the method guide, assess how you use Pareto today, then start your first analysis from CAPA or audit data, or from your own records.",
 tStd:"How to write the question, define the categories, choose the period and the unit, read the chart, and why 80/20 is a rule of thumb, not a law.",tCl:"The ISO 9001:2026 clauses the method serves, starting with 9.1.3 and 10.2.1 b) 2): interpretive summary, example and what the auditor asks for.",tAssess:"Ten questions on your Pareto practice, from the question before the data to the chart in management review.",
 tTools:"One full analysis per question: categories with definitions and values, the live chart, the vital few and their confirmation, the next step for each, the before/after check and the review.",tDocs:"Every analysis with its stage and flags, and the example data.",tAudit:"Automatic check of each analysis: question, period and unit, definitions, “Other”, the vital few confirmed, next steps, before/after check and review.",
 tDash:"Confirmed, linked and checked analyses, before/after results, open items and the self-assessment on one page.",tReport:"HTML report that draws each analysis as its Pareto chart with the ranked table and the before/after chart, and a CSV file.",tAi:"An assistant that reads the chart and suggests how to split large categories. Not active yet.",
 foot:"References: ISO 9001:2026 clauses 7.1.6, 9.1.3, 9.3.2, 10.1 and 10.2 and Annexes A.9.1 and A.10.2, and ISO 9000:2026 terms (interpretive summaries, not the official text). Pareto is a working method, not a requirement of any standard. Examples are illustrative, not real data.",
 heroTag:"Method tool · Serves ISO 9001:2026 clauses 9.1.3 and 10.2.1 b)",langSw:"العربية",langSwA:"التبديل إلى العربية",logoAlt:"Continual Improvement Academy — مدثر سلامه",
 related:"Related Academy tools",rel_capa:"Corrective action",rel_fish:"Fishbone — cause and effect analysis",rel_why5:"5 Whys — root cause analysis",rel_aud:"Smart audit & improvement center",
 termT:"Is Pareto a requirement of ISO 9001:2026?",
 termP1:"No. The Pareto chart and the 80/20 rule are a way of ranking categories by how much they contribute to a problem, not a clause of any standard. The requirements it serves are analysing and evaluating data from monitoring and measurement in ISO 9001:2026 clause 9.1.3, whose note says methods can include statistical techniques, and choosing where to determine causes within 10.2.1 b) 2); Annex A.10.2 leaves the extent of investigation to the organization.",
 termP2:"80/20 is a rule of thumb, not a law: two categories may make only 60%, and one may make 90%. The chart is only as good as the category definitions, the period and the unit chosen (count, cost, time or severity). A large category is where to dig, not a cause; Fishbone, 5 Whys or data then find the cause.",
 termIs:"Interpretive summary in independent wording, not the official text. Sources: ISO 9001:2026 clauses 9.1.3 and 10.2.1 and Annexes A.9.1 and A.10.2, and ISO 9000:2026, the terms named here and principle 4.2.7. Verified: 2026-10-11.",
 defs:[["Data","ISO 9000:2026 · 3.8.1","Facts about an object. Each bar on the chart counts or adds up recorded facts, not impressions.","#3563C9"],["Dashboard","ISO 9000:2026 · 3.8.2","A numerical and graphical display of performance and trends of results; the term's example names Pareto charts.","#B8901E"],["Statistical technique","ISO 9000:2026 · 3.8.3","A method for analysing quantitative data associated with variation. Pareto ranking is the simplest of them.","#1E8C93"],["Objective evidence","ISO 9000:2026 · 3.8.6","Data supporting the existence or truth of something. The large category shows where to look; evidence proves the cause.","#1B2A4A"]],
 asT:"Self-assessment of your Pareto practice",asS:"Answer each question with what actually happens in your analyses. The score measures current practice; it is not a certificate or a performance rating.",asReset:"Clear answers",asSaved:"Answer saved",asAnswered:"{n} of 10 answered",
 band0:"Needs work",band1:"Developing",band2:"Established",bandNote:"Internal bands for this self-assessment, designed in this tool; not an official scale.",as0:"Not in place",as1:"Partly",as2:"In place and applied",
 g_QD:"Question and definitions",g_DT:"Data",g_VF:"Vital few",g_AC:"Act and check",
 tlT:"Pareto analysis",tlS:"One analysis per question. Write the question, the period and the unit, define each category in one line and enter the values; the tool ranks the categories and draws the chart as you type. Then confirm the vital few, link each to its next step, and check the effect after the action. The stage is set automatically from what you fill in.",
 save:"Save analysis",newRec:"New analysis",savedFail:"Could not save in this browser. Download the report before closing the page.",cur:"Current stage:",ok_rec:"Analysis saved",
 st_question:"Question",st_data:"Data",st_vital:"Vital few",st_acted:"Next steps",st_checked:"Effect checked",st_reviewed:"Reviewed",
 sQT:"Question, period and unit · clause 9.1.3",sQS:"One question in one line that the chart answers, then the period and the unit. Count is not always the right measure: cost, time or severity can rank the categories differently.",
 sTeamT:"Team and data owner",sTeamS:"Who collected and classified the data, and who owns its source.",
 sCatT:"Categories and values",sCatS:"Up to 15 categories, each with a one-line definition so that two people would put the same item in the same category. “Other” is one line at the end and must stay smaller than the smallest named category.",
 sChartT:"Pareto chart",sChartS:"Drawn from what you entered: bars ranked from the largest, the cumulative line and the cut-off line. On a phone it shows as a ranked table with bars.",
 sVitalT:"The vital few",sVitalS:"The line suggests the categories up to the cut-off. The team confirms with judgement: it adds a smaller category that is critical for safety or the customer, or drops one, and writes the reason.",
 sStratT:"Stratification",sStratS:"If a large category hides several problems, split it by site, shift, supplier or product, and chart it on its own.",
 sNextT:"Next step for each vital-few category · clause 10.2.1 b) 2)",sNextS:"A large category is where to dig, not a cause. Each vital-few category gets a step: a Fishbone analysis, a 5 Whys analysis or a CAPA record, and the id of that analysis or record is written here.",
 sBaT:"Before/after check · clause 10.1",sBaS:"A second data set for the same categories, in the same unit, over a period of the same length after the action. The team then confirms the verdict.",
 sRevT:"Review",sRevS:"Someone outside the team reviews the analysis and dates the review.",
 f_title:"Short title",f_ref:"Reference (if any)",f_q:"The question the chart answers",f_src:"Data source",f_area:"Process or site",f_pdca:"Linked PDCA cycle",f_date:"Analysis date",f_owner:"Data owner",
 f_from:"Period start",f_to:"Period end",f_unit:"Unit",f_unitNote:"Unit note (severity weights or cost basis)",f_cut:"Cut-off",f_vconf:"The team confirmed the vital few",f_vnote:"Confirmation note",f_strat:"Stratification note",
 f_afrom:"After-action period start",f_ato:"After-action period end",f_verdict:"Team verdict",f_anote:"Check note",f_rby:"Reviewer (outside the team)",f_rdate:"Review date",f_rnote:"Review note",
 src_ncr:"Nonconformity log (NCR)",src_capa:"CAPA records",src_audit:"Audit findings",src_cc:"Customer complaints",src_inc:"Incidents",src_kpi:"KPI",src_fish:"Fishbone causes",src_other:"Other source",
 u_count:"Count",u_cost:"Cost (SAR)",u_hours:"Hours lost",u_sev:"Severity-weighted score",us_count:"",us_cost:"SAR",us_hours:"h",us_sev:"pts",
 sevHint:"Write the weights used, for example: major = 3, minor = 1.",
 v_:"—",v_imp:"Improved",v_same:"No clear change",v_worse:"Worse",
 tmN:"Name",tmRole:"Role",tmAdd:"Add member",tmDel:"Remove member",tmNone:"No one added yet.",
 cN:"Category",cDef:"Definition (one line)",cV:"Value",cDel:"Remove category",cAdd:"Add a category",cMax:"Fifteen categories at most; put the rest in “Other” or split the analysis.",otherName:"Other",otherDef:"What goes into “Other”",
 otherBig:"“Other” is larger than a named category: look inside it and take a new category out of it.",otherTop:"“Other” is the largest: the chart does not answer the question yet. Split it into defined categories.",
 noData:"No data yet.",chEmpty:"Enter values for at least two categories to draw the chart.",
 legV:"Category in the vital few",legN:"Other category",legO:"“Other”",legC:"Cumulative %",legCut:"Cut-off line",legB:"Before",legA:"After",
 axV:"Value",axC:"Cumulative %",cutL:"{p}% cut-off",
 vRank:"Rank",vName:"Category",vVal:"Value",vShare:"Share",vCum:"Cumulative",vLine:"By the line",vIn:"In the vital few",vWhy:"Reason for the change from the line",vWhyPh:"e.g. smaller but safety-critical",
 vCount:"Vital few: {n} categories make {p}% of the total.",vNone:"The vital few are not set yet.",vNeedWhy:"Write the reason for every change from the line before confirming.",
 nxHow:"Next step",nxRef:"Analysis or record id",nxRefPh:"Pick or type the id",how_:"— choose —",how_fish:"Fishbone analysis",how_why5:"5 Whys analysis",how_capa:"CAPA record",
 nxStartFish:"Start a Fishbone analysis for this category",nxStart5:"Open the 5 Whys tool",nxStartCapa:"Open the CAPA tool",nxOpen:"Open the linked one",nxSave:"Save the analysis first: the Fishbone tool reads the category from the saved analysis.",nxHub:"Inside the platform the other tool opens in place of this one: save the analysis first.",
 nxNone:"Confirm the vital few first; their categories then show here.",nxMiss:"This id is not in the other tool in this browser.",nxNoData:"No data in that tool in this browser yet.",
 pvFish:"{id} · {st} · Effect: {t}",pvWhy5:"{id} · {st} · Root cause: {t}",pvCapa:"{id} · {ref} · {st} · {t}",pvNo:"not written yet",
 fst_effect:"Effect defined",fst_causes:"Causes mapped",fst_selected:"Causes selected",fst_verified:"Root cause verified",fst_reviewed:"Reviewed",
 w5st_problem:"Problem defined",w5st_chain:"Chain of whys",w5st_root:"Root cause",w5st_tested:"Root cause tested",w5st_reviewed:"Reviewed",
 cst_react:"Reaction",cst_cause:"Cause analysis",cst_action:"Action",cst_verify:"Effectiveness check",cst_closed:"Closed",cst_reopened:"Reopened",
 baCat:"Category",baB:"Before",baA:"After",baD:"Difference",baP:"Change",baTot:"Total",baVit:"Vital few",baLen:"Length of the two periods: before {b} days, after {a} days.",baLenW:"The two periods differ in length (before {b} days, after {a} days): the comparison is not on the same basis. Adjust the period or compare rates.",
 baSug:"The figures suggest: {v} (vital few {p}, total {q}). The verdict is the team's.",baNeed:"Enter the after-action period and a value for each category to see the comparison.",baChart:"Before and after",
 cpOpen:"Open PDCA",pdFound:"PDCA cycle: {t}",pdMiss:"This cycle was not found in the PDCA tool in this browser.",pdHint:"Type the cycle number, such as PD-EX-03, if there is one.",pdOpen:"Open PDCA",
 bdT:"Build the categories from data in this browser (read-only)",bdS:"The tool reads the CAPA records, Fishbone causes or audit-centre findings saved in this browser, counts them the way you choose within the analysis period, and shows a preview before anything is filled in. Nothing is written to the other tools.",
 bdSrc:"Source",bdBy:"Group by",bdPrev:"Show the preview",bdUse:"Use these categories in the form",
 bs_capa:"CAPA records",bs_fish:"Fishbone causes",bs_audit:"Audit-centre findings",
 by_src:"Record source",by_cls:"Nonconformity grade",by_area:"Process or site",by_method:"Cause analysis method",by_bone:"Bone (number of causes)",by_votes:"Bone (sum of votes)",by_clause:"Clause",by_dept:"Department",
 bdPer:"Period used: {f} to {t}, from the period fields of the form.",bdAll:"No period in the form: all data is counted. Write the period first to limit the count to it.",
 bdNone:"No data from this source in this browser.",bdEmpty:"No items from this source inside the period.",bdUsed:"{n} categories were filled into the form from {s}. Check the definitions, then save. Nothing was written to the other tool.",bdMore:" {n} small groups were merged into “Other”.",
 bdColC:"Category",bdColV:"Value",bdColN:"Examples",bdDef:"{s} where “{by}” is “{v}”, inside the period.",bdDefF:"Causes not ruled out on the “{v}” bone of Fishbone analyses inside the period.",bdDefV:"Sum of the votes on causes on the “{v}” bone inside the period.",bdDefA:"Audit findings (positive practices excluded) with {by} “{v}” inside the period.",bdUnitV:"Sum of the team's votes on the causes of each category",
 cls_maj:"Major",cls_min:"Minor",cls_obs:"Observation",cls_:"Not graded",cs_ncr:"Nonconformity report",cs_ia:"Internal audit",cs_ea:"External audit",cs_cc:"Customer complaint",cs_kpi:"Process KPI",cs_sup:"Supplier",cs_inc:"Incident",cm_why5:"5 Whys",cm_fish:"Fishbone",cm_other:"Other method",cm_:"Not chosen",
 dp_tend:"Tenders & contracts",dp_proc:"Procurement",dp_proj:"Projects & construction",dp_equip:"Equipment & logistics",dp_hse:"HSE",dp_it:"IT",dp_risk:"Risk & resilience",dp_comp:"Compliance",dp_hr:"HR",dp_qa:"Quality & document control",dp_eng:"Engineering",dp_fin:"Finance",dp_:"Not set",
 hmT:"This browser holds data that can be ranked: {c} CAPA record(s), {f} Fishbone analysis(es) and {a} audit finding(s).",hmGo:"Build the categories",
 e_title:"Enter a short title for the analysis.",e_q:"Write the question the chart answers before saving.",e_per:"The period end cannot be before its start.",e_aper:"The after-action period end cannot be before its start.",e_rdate:"The review date cannot be before the analysis date.",e_neg:"Values cannot be negative.",
 exT:"Example data",exS:"Three illustrative analyses for a fictitious Saudi company (Al-Waha Contracting): nonconformities by category from January to September 2026 (with CAPA records CA-EX-01, CA-EX-03 and CA-EX-04 in the vital few, and the calibration category added by the team with a written reason), rejected ready-mix concrete loads by reason with a before/after check around the hot-weather rule (linked to Fishbone FB-EX-02 and CAPA CA-EX-04), and the same data ranked by cost to show how the order changes, plus self-assessment answers. The data is illustrative, not real, and loading it replaces all of this tool's data in your browser.",
 exLoad:"Load example",exClear:"Clear all data",exLoaded:"Example loaded: 3 analyses and the self-assessment answers.",exCleared:"All of this tool's data was removed from this browser.",
 exConfirmClear:"This deletes every Pareto analysis and the self-assessment answers from this browser, and it cannot be undone.\n\nDo you want to continue?",
 dT:"Pareto analyses",dS:"Every analysis with its stage and flags. Open an analysis to edit it in the Pareto analysis tab.",csv:"Export CSV",none:"No analyses yet. Start from the Pareto analysis tab or load the example.",
 colRef:"Reference and title",colSrc:"Source and unit",colStage:"Stage",colCats:"Categories",colVital:"Vital few",colBa:"Before/after",colFlags:"Flags",colAct:"Actions",open:"Open",del:"Delete",delArm:"Confirm delete",
 catsN:"{n} categories · total {t}",baNone:"Not checked yet",
 fl_q:"Question not written",fl_per:"Period or unit missing",fl_def:"Categories without a definition: {n}",fl_few:"Fewer than three categories with values",fl_oth:"“Other” larger than a named category",fl_othTop:"“Other” is the largest",fl_conf:"Vital few not confirmed",fl_why:"Change from the line without a reason",fl_next:"Vital-few categories without a linked step: {n}",fl_ba:"Effect not checked",fl_len:"Periods differ in length",fl_worse:"Verdict: worse",fl_same:"Verdict: no clear change",fl_wait:"Waiting for review",fl_rev:"Reviewer is in the team",
 auT:"Automatic audit of analyses",auS:"These checks run on every analysis and show the gaps an auditor usually finds. “—” means the check does not apply yet at the analysis's stage.",
 auRec:"Analyses audited",auPass:"Checks passed",auFail:"Analyses with gaps",auOpen:"Open items",auEmpty:"No analyses to audit yet.",
 c_ref:"Has reference",c_q:"Question written",c_pu:"Period and unit stated",c_def:"Every category defined",c_three:"Three categories or more with data",c_oth:"“Other” not the largest",c_conf:"Vital few confirmed, a reason for each change",c_next:"Each vital-few category has a linked step",c_ba:"Before/after on the same basis",c_rev:"Independent dated review",
 dashT:"Dashboard",dashS:"Figures calculated from the analyses and the self-assessment in this browser.",kTotal:"Total analyses",kConf:"Vital few confirmed",kLinked:"All vital few linked",kBa:"Before/after checked",kImp:"Improved after the action",kRev:"Reviewed",kCats:"Categories on the charts",kOpen:"Open items",kAud:"Audit pass rate",kAs:"Self-assessment",
 byStage:"Stage distribution",byVerdict:"Before/after result",byNext:"Next steps of the vital-few categories",byAssess:"Self-assessment by group",openT:"Items that need follow-up",noOpen:"No open items.",vd_none:"Not checked",nx_none:"No step",
 oi_q:"Question not written",oi_per:"Period or unit missing (for severity: the weights)",oi_def:"{n} category(ies) without a definition",oi_oth:"“Other” is larger than a named category: split it",oi_othTop:"“Other” is the largest: the chart does not answer the question",oi_conf:"Data ready but the vital few are not confirmed",oi_why:"Change from the cut-off line without a written reason",oi_next:"{n} vital-few category(ies) without a linked next step",oi_ba:"Steps taken but the effect not checked before/after",oi_len:"The after-action period has a different length",oi_worse:"Verdict after the action: worse",oi_same:"Verdict after the action: no clear change",oi_wait:"Waiting for a review from outside the team",oi_rev:"The reviewer is a team member",
 rpT:"Pareto report",rpS:"HTML report downloaded to your device, which you can print or save as PDF from the browser; it draws each analysis as its chart and shows the ranked table. CSV for analysing the data in a spreadsheet.",rpHtml:"Download HTML report",rpNote:"The report carries the preparer's name “مدثر سلامه” and includes the cover and summary, each analysis with its Pareto chart, ranked table, vital few and their next steps and the before/after chart, audit results, open items and the self-assessment.",rpPrev:"Quick preview",rpEmpty:"No analyses to export yet.",
 rpCover:"Pareto analysis report",rpRank:"Ranked table",rpVital:"Vital few and next steps",rpBa:"Before/after check",rpLine:"By the line",rpAdd:"Added by the team",rpDrop:"Dropped by the team",
 aiT:"AI Assistant — under construction",aiS:"This assistant will read the chart, suggest how to split large categories, and point to a large “Other” or periods of different length. It will not run before the shared platform engine is in place, and it will not show invented results.",
 aiList:["Suggest a stratification for a large category","Point out overlapping definitions between two categories","Compare the chart with the previous period"],
 revW:"The reviewer is a team member. Choose someone from outside the team.",yes:"Yes",no:"No",days:"days"}
};

function t(k,v){ var d=UI[L]||UI.ar; var s=(d[k]!==undefined)?d[k]:(UI.ar[k]!==undefined?UI.ar[k]:k); if(v){ for(var x in v){ s=String(s).split("{"+x+"}").join(v[x]); } } return s; }
function esc(s){ return TBX.esc(s); }
function today(){ return TBX.today(); }
function txt(v){ return TBX.txt(v); }
function obj(v){ return (v&&typeof v==="object"&&!Array.isArray(v))?v:{}; }
function str(v){ return (v==null||typeof v==="object")?"":String(v); }
function tv(v){ return (v&&typeof v==="object"&&!Array.isArray(v))?str(v[L]!=null?v[L]:(v.ar!=null?v.ar:v.en)):str(v); }
function isD(s){ return /^\d{4}-\d{2}-\d{2}$/.test(String(s||"")); }
function short(s,n){ s=txt(s).replace(/\s+/g," "); n=n||90; return s.length>n?s.slice(0,n-1)+"…":s; }
/* a value: a finite number of zero or more, or null when empty */
function num(v){ if(v===null||v===undefined||v==="") return null; var n=typeof v==="number"?v:parseFloat(String(v).replace(/,/g,"")); return (isFinite(n)&&n>=0)?Math.round(n*100)/100:null; }
function numRaw(v){ if(v===null||v===undefined||String(v).trim()==="") return null; var n=parseFloat(String(v).replace(/,/g,"")); return isFinite(n)?n:NaN; }
function fmt(v,u){ if(v===null||v===undefined||!isFinite(v)) return "—"; var d=(u==="cost"||u==="hours"||u==="sev")&&Math.round(v)!==v?1:0; return Number(v).toLocaleString("en-US",{minimumFractionDigits:d,maximumFractionDigits:d===0?0:2}); }
function fmtU(v,u){ var s=fmt(v,u), w=t("us_"+(u||"count")); return w?s+" "+w:s; }
function p1(x){ return (Math.round(x*10)/10).toFixed(1); }
function days(a,b){ if(!isD(a)||!isD(b)) return null; return Math.round((Date.UTC(+b.slice(0,4),+b.slice(5,7)-1,+b.slice(8,10))-Date.UTC(+a.slice(0,4),+a.slice(5,7)-1,+a.slice(8,10)))/864e5)+1; }

/* ---------- store ---------- */
function blankNx(){ return {how:"",ref:""}; }
function blankCat(id){ return {id:id||"",name:"",def:"",v:null,a:null,vf:"",why:"",nx:blankNx()}; }
function blank(){ return {id:"",title:"",ref:"",q:"",src:"ncr",area:"",pdca:"",from:"",to:"",date:"",owner:"",unit:"count",unitNote:"",team:[],
 cats:[blankCat("k1"),blankCat("k2"),blankCat("k3")],other:{v:null,a:null,def:""},cut:CUT0,vconf:false,vnote:"",strat:"",after:{from:"",to:"",verdict:"",note:""},review:{by:"",date:"",note:""},created:"",updated:""}; }
function fixNx(n){ n=obj(n); return {how:HOWS.indexOf(n.how)>=0?n.how:"",ref:str(n.ref)}; }
function fixCat(c){ c=obj(c); return {id:str(c.id),name:str(c.name),def:str(c.def),v:num(c.v),a:num(c.a),vf:(c.vf==="add"||c.vf==="drop")?c.vf:"",why:str(c.why),nx:fixNx(c.nx)}; }
/* an analysis saved with missing or broken parts gets empty ones, so rendering never throws; every category gets an id */
function fixRec(r){
 ["id","title","ref","q","src","area","pdca","from","to","date","owner","unit","unitNote","vnote","strat","created","updated"].forEach(function(k){ r[k]=str(r[k]); });
 if(SRCS.indexOf(r.src)<0) r.src="other";
 if(UNITS.indexOf(r.unit)<0) r.unit="count";
 r.team=(Array.isArray(r.team)?r.team:[]).filter(function(m){ return m&&typeof m==="object"; }).map(function(m){ return {n:str(m.n),role:str(m.role)}; });
 r.cats=(Array.isArray(r.cats)?r.cats:[]).filter(function(c){ return c&&typeof c==="object"; }).slice(0,MAXC).map(fixCat);
 var used={}, n=0;
 r.cats.forEach(function(c){ var m=/^k(\d+)$/.exec(c.id); if(m&&!used[c.id]){ used[c.id]=1; n=Math.max(n,+m[1]); } else c.id=""; });
 r.cats.forEach(function(c){ if(!c.id){ n++; c.id="k"+n; used[c.id]=1; } });
 var o=obj(r.other); r.other={v:num(o.v),a:num(o.a),def:str(o.def)};
 var cu=parseInt(r.cut,10); r.cut=isFinite(cu)?Math.max(CUTMIN,Math.min(CUTMAX,cu)):CUT0;
 r.vconf=r.vconf===true;
 var af=obj(r.after); r.after={from:str(af.from),to:str(af.to),verdict:VERDS.indexOf(af.verdict)>=0?af.verdict:"",note:str(af.note)};
 var rv=obj(r.review); r.review={by:str(rv.by),date:str(rv.date),note:str(rv.note)};
 return r;
}
function load(){ return TBX.load(STORE,function(v){ if(!Array.isArray(v.records)) v.records=[]; v.records=v.records.filter(function(r){ return r&&typeof r==="object"; }); v.records.forEach(fixRec); if(!v.assess||typeof v.assess!=="object") v.assess={}; return v; },function(){ return {records:[],assess:{}}; }); }
function persist(){ return TBX.save(STORE,DB); }

/* ---------- ranking: sort, share, cumulative %, the cut-off line and the team's vital few ---------- */
/* Categories with a name or a value are ranked from the largest value down; ties keep the order in which they were entered.
   "Other" is always drawn last. A named category is on the line's vital few when the cumulative share of the categories
   before it is below the cut-off, so the category that crosses the line is included. "Other" is never in the vital few. */
function ranked(r,key){
 key=key||"v";
 var rows=[];
 r.cats.forEach(function(c,i){ var v=num(c[key]); if(txt(c.name)||v!==null) rows.push({c:c,i:i,v:v===null?0:v,other:false}); });
 rows.sort(function(a,b){ return (b.v-a.v)||(a.i-b.i); });
 var ov=num(r.other[key]);
 if(ov!==null && ov>0 || (key==="v" && txt(r.other.def))) rows.push({c:{id:"other",name:t("otherName"),def:r.other.def},i:999,v:ov===null?0:ov,other:true});
 var tot=rows.reduce(function(a,x){ return a+x.v; },0), cum=0;
 rows.forEach(function(x,k){ x.rank=k+1; x.before=tot?cum/tot*100:0; cum+=x.v; x.share=tot?x.v/tot*100:0; x.cum=tot?cum/tot*100:0; x.line=!x.other&&x.v>0&&tot>0&&x.before<r.cut-1e-9; });
 return {rows:rows,total:tot};
}
function withData(r){ return r.cats.filter(function(c){ return c.v!==null && c.v>0; }).length; }
function isVital(x){ if(x.other||x.v<=0) return false; var f=x.c.vf; return f==="add"?true:(f==="drop"?false:x.line); }
function vitalRows(r){ return ranked(r).rows.filter(isVital); }
function changes(r){ return ranked(r).rows.filter(function(x){ return !x.other && x.v>0 && ((x.c.vf==="add"&&!x.line)||(x.c.vf==="drop"&&x.line)); }); }
function whyMissing(r){ return changes(r).filter(function(x){ return !txt(x.c.why); }).length; }
function otherState(r){ var R=ranked(r).rows, o=R.filter(function(x){ return x.other; })[0], N=R.filter(function(x){ return !x.other && x.v>0; });
 if(!o||o.v<=0||!N.length) return ""; if(N.every(function(x){ return o.v>=x.v; })) return "top"; if(N.some(function(x){ return o.v>x.v; })) return "big"; return ""; }
function undefinedCats(r){ return r.cats.filter(function(c){ return (txt(c.name)||c.v!==null) && !txt(c.def); }).length; }
function unitOk(r){ return UNITS.indexOf(r.unit)>=0 && (r.unit!=="sev" || !!txt(r.unitNote)); }
function perOk(r){ return isD(r.from)&&isD(r.to)&&r.from<=r.to; }
function linked(x){ var n=x.c.nx||{}; return !!n.how && !!txt(n.ref); }
function nUnlinked(r){ return vitalRows(r).filter(function(x){ return !linked(x); }).length; }
function lenB(r){ return days(r.from,r.to); }
function lenA(r){ return days(r.after.from,r.after.to); }
function sameLen(r){ var b=lenB(r), a=lenA(r); return b!==null && a!==null && a>0 && Math.abs(a-b)<=Math.max(3,Math.round(b*0.1)); }
function afterVals(r){ return ranked(r).rows.filter(function(x){ return x.v>0; }).every(function(x){ return num(x.other?r.other.a:x.c.a)!==null; }); }
function afterDone(r){ return isD(r.after.from)&&isD(r.after.to)&&r.after.from<=r.after.to&&afterVals(r)&&!!r.after.verdict; }
function sumKey(rows,r,key){ return rows.reduce(function(a,x){ var v=num(x.other?r.other[key]:x.c[key]); return a+(v===null?0:v); },0); }
/* the figures' suggestion for the verdict: change of the vital few total; the team decides */
function suggest(r){
 var V=vitalRows(r), R=ranked(r).rows, vb=sumKey(V,r,"v"), va=sumKey(V,r,"a"), tb=sumKey(R,r,"v"), ta=sumKey(R,r,"a");
 var pv=vb?(va-vb)/vb*100:0, pt=tb?(ta-tb)/tb*100:0;
 return {v:pv<=-10?"imp":(pv>=10?"worse":"same"),pv:pv,pt:pt,vb:vb,va:va,tb:tb,ta:ta};
}
function stageOf(r){
 if(!txt(r.q) || withData(r)<2) return "question";
 var V=vitalRows(r);
 if(!(r.vconf && V.length && !whyMissing(r))) return "data";
 if(!V.every(linked)) return "vital";
 if(!afterDone(r)) return "acted";
 if(!(txt(r.review.by)&&isD(r.review.date))) return "checked";
 return "reviewed";
}
function stageName(s){ return t("st_"+s); }
function srcName(k){ return t("src_"+k); }
function atLeast(r,s){ return STAGES.indexOf(stageOf(r))>=STAGES.indexOf(s); }
function names(r){ return r.team.map(function(m){ return txt(m.n).toLowerCase(); }).filter(Boolean); }
function revInTeam(r){ var b=txt(r.review.by).toLowerCase(); return !!b && names(r).indexOf(b)>=0; }
/* one list of what is still open in an analysis; flags (records) and open items (dashboard, report) read it */
function issues(r){
 var o=[], s=stageOf(r), os=otherState(r), nd=undefinedCats(r), nn=nUnlinked(r);
 if(!txt(r.q)) o.push(["q","warn",{}]);
 if(!perOk(r)||!unitOk(r)) o.push(["per","warn",{}]);
 if(nd) o.push(["def","warn",{n:nd}]);
 if(os==="top") o.push(["othTop","bad",{}]); else if(os==="big") o.push(["oth","warn",{}]);
 if(whyMissing(r)) o.push(["why","bad",{}]);
 if(s==="data" && !whyMissing(r)) o.push(["conf","warn",{}]);
 if(atLeast(r,"vital") && nn) o.push(["next","warn",{n:nn}]);
 if(s==="acted") o.push(["ba","info",{}]);
 if(isD(r.after.from)&&isD(r.after.to)&&!sameLen(r)) o.push(["len","warn",{}]);
 if(r.after.verdict==="worse") o.push(["worse","bad",{}]); else if(r.after.verdict==="same") o.push(["same","warn",{}]);
 if(s==="checked") o.push(["wait","info",{}]);
 if(revInTeam(r)) o.push(["rev","warn",{}]);
 return o;
}
function flagsOf(r){ var F=issues(r).map(function(x){ return [t("fl_"+x[0],x[2]),x[1]]; }); if(withData(r)>0 && withData(r)<3) F.push([t("fl_few"),"info"]); return F; }
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
 applyLogo(); buildRelated(); bdSelects();
 document.title=TITLES[L]||TITLES.ar;
 try{ localStorage.setItem(LKEY,L); }catch(e){}
 if(window.CIAEX && CIAEX.ready){ if(CIAEX.renderStandard) CIAEX.renderStandard(); if(CIAEX.renderClauses) CIAEX.renderClauses(); }
 buildForm(); recToForm(keep||editing||blank(), true);
 if(BD) bdPreview(true);
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
 if(id==="tools") autoSizeAll(document.getElementById("catRows"));
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
function openFish(q){ openWith("fishbone.html",FISH_NAV,q,q.open?"?open="+encodeURIComponent(q.open):(q.pareto?"?pareto="+encodeURIComponent(q.pareto)+"&cat="+encodeURIComponent(q.cat||""):"")); }
function openWhy5(q){ openWith("five-whys.html",WHY5_NAV,q,q.open?"?open="+encodeURIComponent(q.open):""); }
/* other tools' records saved in this browser (read only) */
function recsOf(key){ var S=TBX.read(key); if(!S) return null; return (Array.isArray(S.records)?S.records:[]).filter(function(r){ return r&&typeof r==="object"&&str(r.id); }); }
function pdcaCycles(){ return (recsOf(PDCA_KEY)||[]).map(function(r){ return {id:str(r.id),title:str(r.title)}; }); }
function audState(){ var S=TBX.read(AUD_KEY); if(!S||!S.r||typeof S.r!=="object") return null;
 return {fnd:Array.isArray(S.r.fnd)?S.r.fnd.filter(function(x){ return x&&typeof x==="object"; }):[],univ:Array.isArray(S.r.univ)?S.r.univ.filter(function(x){ return x&&typeof x==="object"; }):[]}; }
/* stages of the other tools, read with their own rules (capa.html, fishbone.html, five-whys.html: stageOf) for previews only */
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
function storeOf(how){ return how==="fish"?FISH_KEY:(how==="why5"?WHY5_KEY:CAPA_KEY); }
function byId(how,id){ return (recsOf(storeOf(how))||[]).filter(function(r){ return str(r.id)===id; })[0]||null; }
function preview(how,id){
 var R=recsOf(storeOf(how));
 if(!id) return (R&&R.length)?"":t("nxNoData");
 var r=byId(how,id); if(!r) return t("nxMiss");
 if(how==="fish") return t("pvFish",{id:id,st:t("fst_"+fishStage(r)),t:short(str(obj(r.effect).what),110)||t("pvNo")});
 if(how==="why5") return t("pvWhy5",{id:id,st:t("w5st_"+why5Stage(r)),t:short(str(r.root),110)||t("pvNo")});
 return t("pvCapa",{id:id,ref:str(r.ref)||"—",st:t("cst_"+capaStage(r)),t:short(str(r.title),90)});
}

/* ---------- the charts (inline SVG, mirrored for Arabic; the same drawings go into the report) ---------- */
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
/* the value axis: four steps of a round size with room above the tallest bar; whole steps for counts */
function nice(max,unit){ if(!(max>0)) return 4; var raw=max*1.08/4, p=Math.pow(10,Math.floor(Math.log10(raw))), st=10*p;
 [1,1.2,1.5,2,2.5,3,4,5,6,8,10].some(function(m){ if(m*p>=raw-1e-9){ st=m*p; return true; } return false; });
 if(unit!=="cost" && unit!=="hours" && unit!=="sev") st=Math.max(1,Math.ceil(st)); return st*4; }
var FONT="font-family=\"'IBM Plex Sans Arabic','IBM Plex Sans',Calibri,Tahoma,sans-serif\"";
function paretoSVG(r,lang){
 lang=lang||L;
 var rtl=lang==="ar", RK=ranked(r), R=RK.rows.filter(function(x){ return x.v>0||!x.other; }), n=R.length, tot=RK.total;
 var W=Math.max(560,Math.min(980,120+n*64)), H=372, mx=58, mr=52, top=44, bot=78, x0=mx, x1=W-mr, y0=top, y1=H-bot, pw=x1-x0, ph=y1-y0;
 var X=function(x){ return rtl?W-x:x; }, f=function(v){ return Math.round(v*10)/10; };
 var maxV=R.reduce(function(a,x){ return Math.max(a,x.v); },0), top0=nice(maxV,r.unit), slot=n?pw/n:pw, bw=Math.min(54,slot*0.68);
 var yV=function(v){ return y1-(v/top0)*ph; }, yC=function(p){ return y1-(p/100)*ph; };
 var o=[];
 o.push('<svg xmlns="http://www.w3.org/2000/svg" class="pa-svg" viewBox="0 0 '+W+' '+H+'" width="'+W+'" height="'+H+'" role="img" aria-label="'+esc((lang==="ar"?"مخطط باريتو: ":"Pareto chart: ")+(txt(r.q)||txt(r.title)||"…"))+'" '+FONT+' direction="'+(rtl?"rtl":"ltr")+'">');
 o.push('<rect x="0" y="0" width="'+W+'" height="'+H+'" fill="#FFFFFF"/>');
 if(n<2||!tot){ o.push('<text x="'+f(W/2)+'" y="'+f(H/2)+'" fill="#7A869E" font-size="14" text-anchor="middle">'+esc(lang==="ar"?"أدخل قيم فئتين على الأقل ليظهر المخطط.":"Enter values for at least two categories to draw the chart.")+'</text></svg>'); return o.join(""); }
 /* grid and axes: values on the start side, cumulative % on the end side */
 for(var g=0;g<=4;g++){ var gy=y1-ph*g/4; o.push('<line x1="'+f(X(x0))+'" y1="'+f(gy)+'" x2="'+f(X(x1))+'" y2="'+f(gy)+'" stroke="#E6EBF2" stroke-width="1"/>');
  o.push('<text x="'+f(X(x0-8))+'" y="'+f(gy+4)+'" fill="#4B5874" font-size="11" text-anchor="'+(rtl?"start":"end")+'" direction="ltr">'+esc(fmt(top0*g/4,r.unit))+'</text>');
  o.push('<text x="'+f(X(x1+8))+'" y="'+f(gy+4)+'" fill="#86520F" font-size="11" text-anchor="'+(rtl?"end":"start")+'" direction="ltr">'+(25*g)+'%</text>'); }
 o.push('<line x1="'+f(X(x0))+'" y1="'+f(y1)+'" x2="'+f(X(x1))+'" y2="'+f(y1)+'" stroke="#1B2A4A" stroke-width="1.5"/>');
 var ul=t("u_"+r.unit);
 o.push('<text x="'+f(X(x0-8))+'" y="16" fill="#4B5874" font-size="11" font-weight="700" text-anchor="'+(rtl?"start":"end")+'">'+esc(ul)+'</text>');
 o.push('<text x="'+f(X(x1+8))+'" y="16" fill="#86520F" font-size="11" font-weight="700" text-anchor="'+(rtl?"end":"start")+'">'+esc(lang==="ar"?"تراكمي %":"Cumulative %")+'</text>');
 /* bars */
 var pts=[];
 R.forEach(function(x,k){
  var cx=x0+slot*(k+0.5), bx=cx-bw/2, by=yV(x.v), hh=y1-by, vit=isVital(x);
  var fill=x.other?OCOL:(vit?VCOL:NCOL), big=x.other&&otherState(r);
  o.push('<g class="pa-bar"><title>'+esc(x.c.name+" — "+fmtU(x.v,r.unit)+" · "+p1(x.share)+"% · "+p1(x.cum)+"%"+(x.c.def?" — "+x.c.def:""))+'</title><rect x="'+f(X(rtl?bx+bw:bx))+'" y="'+f(by)+'" width="'+f(bw)+'" height="'+f(Math.max(0,hh))+'" rx="3" fill="'+fill+'"'+(x.other?' stroke="'+(big?"#C2410C":"#9AA5B8")+'" stroke-dasharray="4 3" stroke-width="1.5"':'')+'/></g>');
  o.push('<text x="'+f(X(cx))+'" y="'+f(by-6)+'" fill="#1B2A4A" font-size="11.5" font-weight="700" text-anchor="middle" direction="ltr">'+esc(fmt(x.v,r.unit))+'</text>');
  var lines=wrapT(x.c.name||"#"+x.rank,Math.max(6,Math.floor(slot/6.6)),2);
  lines.forEach(function(l,j){ o.push('<text x="'+f(X(cx))+'" y="'+f(y1+16+j*13)+'" fill="'+(vit?"#1B2A4A":"#4B5874")+'" font-size="11" font-weight="'+(vit?"700":"400")+'" text-anchor="middle">'+esc(l)+'</text>'); });
  o.push('<text x="'+f(X(cx))+'" y="'+f(y1+16+lines.length*13+2)+'" fill="#7A869E" font-size="10.5" text-anchor="middle" direction="ltr">'+p1(x.share)+'%</text>');
  pts.push([X(x0+slot*(k+1)),yC(x.cum),x.cum]);
 });
 /* cut-off line on the cumulative axis */
 var cy=yC(r.cut);
 o.push('<line x1="'+f(X(x0))+'" y1="'+f(cy)+'" x2="'+f(X(x1))+'" y2="'+f(cy)+'" stroke="#C2410C" stroke-width="1.4" stroke-dasharray="6 4"/>');
 o.push('<text x="'+f(X(x0+6))+'" y="'+f(cy-5)+'" fill="#C2410C" font-size="11" font-weight="700" text-anchor="'+(rtl?"end":"start")+'">'+esc(lang==="ar"?r.cut+"% القطع":r.cut+"% cut-off")+'</text>');
 /* cumulative line */
 var path=[[X(x0),y1]].concat(pts).map(function(p,i){ return (i?"L":"M")+f(p[0])+" "+f(p[1]); }).join(" ");
 o.push('<path d="'+path+'" fill="none" stroke="'+GOLD+'" stroke-width="2.4" stroke-linejoin="round"/>');
 pts.forEach(function(p,i){ o.push('<circle cx="'+f(p[0])+'" cy="'+f(p[1])+'" r="3.6" fill="'+GOLD+'" stroke="#FFFFFF" stroke-width="1.2"/>');
  if(p[2]<99.95 && (n<=12||i%2===1)) o.push('<text x="'+f(p[0])+'" y="'+f(p[1]-8)+'" fill="#86520F" font-size="10.5" text-anchor="middle" direction="ltr">'+Math.round(p[2])+'%</text>'); });
 o.push('</svg>');
 return o.join("");
}
/* before/after: two bars per category in the order of the first chart */
function baSVG(r,lang){
 lang=lang||L;
 var rtl=lang==="ar", R=ranked(r).rows.filter(function(x){ return x.v>0; }), n=R.length;
 var W=Math.max(560,Math.min(980,120+n*70)), H=330, mx=58, mr=22, top=34, bot=64, x0=mx, x1=W-mr, y1=H-bot, ph=y1-top, pw=x1-x0;
 var X=function(x){ return rtl?W-x:x; }, f=function(v){ return Math.round(v*10)/10; };
 var av=function(x){ var v=num(x.other?r.other.a:x.c.a); return v===null?0:v; };
 var maxV=R.reduce(function(a,x){ return Math.max(a,x.v,av(x)); },0), top0=nice(maxV,r.unit), slot=n?pw/n:pw, bw=Math.min(26,slot*0.34);
 var yV=function(v){ return y1-(v/top0)*ph; };
 var o=[];
 o.push('<svg xmlns="http://www.w3.org/2000/svg" class="pa-svg" viewBox="0 0 '+W+' '+H+'" width="'+W+'" height="'+H+'" role="img" aria-label="'+esc((lang==="ar"?"قبل وبعد: ":"Before and after: ")+(txt(r.title)||"…"))+'" '+FONT+' direction="'+(rtl?"rtl":"ltr")+'">');
 o.push('<rect x="0" y="0" width="'+W+'" height="'+H+'" fill="#FFFFFF"/>');
 for(var g=0;g<=4;g++){ var gy=y1-ph*g/4; o.push('<line x1="'+f(X(x0))+'" y1="'+f(gy)+'" x2="'+f(X(x1))+'" y2="'+f(gy)+'" stroke="#E6EBF2" stroke-width="1"/><text x="'+f(X(x0-8))+'" y="'+f(gy+4)+'" fill="#4B5874" font-size="11" text-anchor="'+(rtl?"start":"end")+'" direction="ltr">'+esc(fmt(top0*g/4,r.unit))+'</text>'); }
 o.push('<line x1="'+f(X(x0))+'" y1="'+f(y1)+'" x2="'+f(X(x1))+'" y2="'+f(y1)+'" stroke="#1B2A4A" stroke-width="1.5"/>');
 var lg=[[NCOL,lang==="ar"?"قبل":"Before"],[ACOL,lang==="ar"?"بعد":"After"]];
 lg.forEach(function(l,i){ var lx=x0+i*90; o.push('<rect x="'+f(X(rtl?lx+12:lx))+'" y="10" width="12" height="12" rx="2" fill="'+l[0]+'"/><text x="'+f(X(lx+18))+'" y="20" fill="#1B2A4A" font-size="11.5" text-anchor="'+(rtl?"end":"start")+'">'+esc(l[1])+'</text>'); });
 R.forEach(function(x,k){
  var cx=x0+slot*(k+0.5), a=av(x), vals=[[x.v,NCOL,-1],[a,ACOL,1]];
  vals.forEach(function(v){ var bx=cx+(v[2]<0?-bw-2:2), by=yV(v[0]); o.push('<rect x="'+f(X(rtl?bx+bw:bx))+'" y="'+f(by)+'" width="'+f(bw)+'" height="'+f(Math.max(0,y1-by))+'" rx="2" fill="'+v[1]+'"><title>'+esc(x.c.name+": "+fmtU(v[0],r.unit))+'</title></rect>');
   o.push('<text x="'+f(X(bx+bw/2))+'" y="'+f(by-5)+'" fill="#1B2A4A" font-size="10.5" text-anchor="middle" direction="ltr">'+esc(fmt(v[0],r.unit))+'</text>'); });
  wrapT(x.c.name,Math.max(6,Math.floor(slot/6.6)),2).forEach(function(l,j){ o.push('<text x="'+f(X(cx))+'" y="'+f(y1+16+j*13)+'" fill="#1B2A4A" font-size="11" text-anchor="middle">'+esc(l)+'</text>'); });
 });
 o.push('</svg>');
 return o.join("");
}
/* phones: the same ranking as a table with bars */
function rankHTML(r){
 var RK=ranked(r), R=RK.rows.filter(function(x){ return x.v>0; }), mx=R.reduce(function(a,x){ return Math.max(a,x.v); },0)||1;
 if(R.length<2) return '<li><span></span><span class="sm">'+esc(t("chEmpty"))+'</span></li>';
 return R.map(function(x){ var vit=isVital(x);
  return '<li class="'+(vit?"vf":"")+(x.other?" oth":"")+'"><span class="rk">'+x.rank+'</span><span class="nm">'+esc(x.c.name)+(vit?' ★':'')+'</span><span class="nb">'+esc(fmt(x.v,r.unit))+'</span><span class="tr"><i style="width:'+Math.round(x.v/mx*100)+'%"></i></span><span class="sm">'+esc(t("vShare"))+' '+p1(x.share)+'% · '+esc(t("vCum"))+' <b dir="ltr">'+p1(x.cum)+'%</b></span></li>'; }).join("")+
  '<li><span></span><span class="sm">'+esc(t("cutL",{p:r.cut}))+' · '+esc(t("u_"+r.unit))+' · '+esc(fmt(RK.total,r.unit))+'</span></li>';
}
function legendHTML(){ return '<div class="pa-leg"><span><i style="background:'+VCOL+'"></i>'+esc(t("legV"))+'</span><span><i style="background:'+NCOL+'"></i>'+esc(t("legN"))+'</span><span><i style="background:'+OCOL+';outline:1px dashed #9AA5B8"></i>'+esc(t("legO"))+'</span><span><i class="ln" style="background:'+GOLD+'"></i>'+esc(t("legC"))+'</span><span><i class="ln" style="background:#C2410C"></i>'+esc(t("legCut"))+'</span></div>'; }
function renderChart(r){
 var box=document.getElementById("paChart"); if(!box) return;
 box.innerHTML='<div class="pa-svgw">'+paretoSVG(r)+'</div>'+legendHTML()+'<ul class="pa-rank">'+rankHTML(r)+'</ul>';
}

/* ---------- analysis form ---------- */
var HDR=[["title","tx",1],["ref","ltr",0],["src","sel_src",0],["area","tx",0],["pdca","pdca",0],["date","date",0],["owner","tx",0]];
var PATH={title:"title",ref:"ref",q:"q",src:"src",area:"area",pdca:"pdca",date:"date",owner:"owner",from:"from",to:"to",unit:"unit",unitNote:"unitNote",
 vnote:"vnote",strat:"strat",afrom:"after.from",ato:"after.to",verdict:"after.verdict",anote:"after.note",rby:"review.by",rdate:"review.date",rnote:"review.note"};
function getP(r,p){ var a=p.split("."); return a.length>1?r[a[0]][a[1]]:r[a[0]]; }
function setP(r,p,v){ var a=p.split("."); if(a.length>1) r[a[0]][a[1]]=v; else r[a[0]]=v; }
function opts(list,prefix,cur){ return list.map(function(k){ return '<option value="'+k+'"'+(cur===k?" selected":"")+'>'+esc(t(prefix+k))+'</option>'; }).join(""); }
function fieldHTML(name,kind,wide){
 var id="f-"+name, lab=t("f_"+name), inner="";
 if(kind==="ta") inner='<textarea id="'+id+'" rows="2"></textarea>';
 else if(kind==="date") inner='<input id="'+id+'" type="date">';
 else if(kind==="ltr") inner='<input id="'+id+'" type="text" dir="ltr">';
 else if(kind==="sel_src") inner='<select id="'+id+'">'+opts(SRCS,"src_")+'</select>';
 else if(kind==="sel_unit") inner='<select id="'+id+'">'+opts(UNITS,"u_")+'</select>';
 else if(kind==="sel_verdict") inner='<select id="'+id+'">'+opts(["","imp","same","worse"],"v_")+'</select>';
 else if(kind==="pdca") inner='<div class="ca-pd"><input id="'+id+'" type="text" dir="ltr" list="pdcaList" aria-describedby="pdInfo"><button class="pd-btn ghost" type="button" id="pdOpen">'+esc(t("pdOpen"))+'</button></div><datalist id="pdcaList"></datalist><div class="ca-pdinfo" id="pdInfo" aria-live="polite"></div>';
 else inner='<input id="'+id+'" type="text">';
 return '<div class="pd-f'+(wide?" wide":"")+'"><label for="'+id+'">'+esc(lab)+'</label>'+inner+'</div>';
}
function secHTML(k,col,inner){ return '<div class="pd-stage w5-sec" id="sec-'+k+'" style="--sc:'+col+'"><h3>'+esc(t("s"+k+"T"))+'</h3><p class="pd-sub">'+esc(t("s"+k+"S"))+'</p>'+inner+'</div>'; }
function fill(list){ return list.map(function(r){ return '<option value="'+esc(r[0])+'">'+esc(r[1])+'</option>'; }).join(""); }
function buildForm(){
 document.getElementById("hdrFields").innerHTML=HDR.map(function(f){ return fieldHTML(f[0],f[1],f[2]); }).join("");
 document.getElementById("stages").innerHTML=
  secHTML("Q","#C2410C",'<div class="pd-fields">'+fieldHTML("q","ta",1)+fieldHTML("from","date",0)+fieldHTML("to","date",0)+fieldHTML("unit","sel_unit",0)+fieldHTML("unitNote","tx",0)+'</div><p class="ca-hint" id="sevHint" hidden></p>')+
  secHTML("Team","#7A869E",'<div class="ca-actw"><table class="w5-team"><thead><tr><th>'+esc(t("tmN"))+'</th><th>'+esc(t("tmRole"))+'</th><th><span class="sr">'+esc(t("tmDel"))+'</span></th></tr></thead><tbody id="teamRows"></tbody></table></div><p class="ca-hint" id="teamNone"></p><button class="pd-btn ghost" type="button" id="tmAdd">+ '+esc(t("tmAdd"))+'</button>')+
  secHTML("Cat","#3563C9",'<div class="ca-actw"><table class="pa-cats"><thead><tr><th>#</th><th>'+esc(t("cN"))+'</th><th>'+esc(t("cDef"))+'</th><th>'+esc(t("cV"))+'</th><th><span class="sr">'+esc(t("cDel"))+'</span></th></tr></thead><tbody id="catRows"></tbody></table></div>'+
   '<div class="fb-badd"><button class="pd-btn ghost" type="button" id="catAdd">+ '+esc(t("cAdd"))+'</button><span class="ca-hint" id="catMax"></span></div><div class="w5-warn" id="othWarn" role="note" hidden></div><p class="fb-msg" id="catMsg" role="status"></p>')+
  secHTML("Chart","#B8901E",'<div class="pa-cut"><label for="f-cut">'+esc(t("f_cut"))+'</label><input id="f-cut" type="range" min="'+CUTMIN+'" max="'+CUTMAX+'" step="5" value="'+CUT0+'"><output id="cutOut" for="f-cut" dir="ltr">'+CUT0+'%</output></div><div class="pa-chartw" id="paChart"></div>')+
  secHTML("Vital","#1B2A4A",'<div class="ca-actw" id="vfBox"></div><p class="pa-sug" id="vfSum"></p><label class="w5-chk" for="f-vconf"><input id="f-vconf" type="checkbox"><span>'+esc(t("f_vconf"))+'</span></label><div class="w5-warn w5-bad" id="whyWarn" role="note" hidden></div><div class="pd-fields" style="margin-top:8px">'+fieldHTML("vnote","tx",1)+'</div>')+
  secHTML("Strat","#7B5BB8",'<div class="pd-fields">'+fieldHTML("strat","ta",1)+'</div>')+
  secHTML("Next","#1E8C93",'<div id="nxBox"></div>')+
  secHTML("Ba","#3C9A5F",'<div class="pd-fields">'+fieldHTML("afrom","date",0)+fieldHTML("ato","date",0)+'</div><div class="w5-warn" id="lenWarn" role="note" hidden></div><div class="ca-actw" id="baBox"></div><p class="pa-sug" id="baSug"></p><div class="pa-chartw" id="baChart" hidden></div><div class="pd-fields" style="margin-top:8px">'+fieldHTML("verdict","sel_verdict",0)+fieldHTML("anote","tx",1)+'</div>')+
  secHTML("Rev","#3C9A5F",'<div class="pd-fields">'+fieldHTML("rby","tx",0)+fieldHTML("rdate","date",0)+fieldHTML("rnote","ta",1)+'</div><div class="w5-warn" id="rvWarn" hidden></div>');
 var dl=document.getElementById("pdcaList"); if(dl) dl.innerHTML=fill(pdcaCycles().map(function(c){ return [c.id,c.title]; }));
}
function teamRowHTML(m,i){
 return '<tr data-row="'+i+'"><td><input data-k="n" type="text" value="'+esc(m.n)+'" aria-label="'+esc(t("tmN"))+'"></td><td><input data-k="role" type="text" value="'+esc(m.role)+'" aria-label="'+esc(t("tmRole"))+'"></td><td><button type="button" class="ca-x" data-tmdel="'+i+'" aria-label="'+esc(t("tmDel"))+'" title="'+esc(t("tmDel"))+'">✕</button></td></tr>';
}
function renderTeam(list){ document.getElementById("teamRows").innerHTML=list.map(teamRowHTML).join(""); document.getElementById("teamNone").textContent=list.length?"":t("tmNone"); }
function readTeam(){ return [].map.call(document.querySelectorAll("#teamRows tr"),function(tr){ return {n:txt(tr.querySelector('[data-k="n"]').value),role:txt(tr.querySelector('[data-k="role"]').value)}; }); }
/* ---- categories: the rows keep what the vital-few and next-step sections hold for them (CX, by category id) ---- */
var CX={};
function vstr(v){ return v===null||v===undefined?"":String(v); }
function catRowHTML(c,i){
 var id="c-"+c.id;
 return '<tr data-cid="'+esc(c.id)+'"><td class="pa-n">'+(i+1)+'</td><td><label class="sr" for="'+id+'-n">'+esc(t("cN"))+' '+(i+1)+'</label><input id="'+id+'-n" data-k="name" type="text" value="'+esc(c.name)+'"></td>'+
  '<td><label class="sr" for="'+id+'-d">'+esc(t("cDef"))+'</label><textarea id="'+id+'-d" data-k="def" rows="1">'+esc(c.def)+'</textarea></td>'+
  '<td class="pa-v"><label class="sr" for="'+id+'-v">'+esc(t("cV"))+'</label><input id="'+id+'-v" data-k="v" type="number" min="0" step="any" inputmode="decimal" value="'+esc(vstr(c.v))+'"></td>'+
  '<td class="pa-x"><button type="button" class="ca-x" data-cdel="'+esc(c.id)+'" aria-label="'+esc(t("cDel"))+'" title="'+esc(t("cDel"))+'">✕</button></td></tr>';
}
function otherRowHTML(o){
 return '<tr class="pa-oth" data-cid="other"><td class="pa-n">…</td><td><b>'+esc(t("otherName"))+'</b></td><td><label class="sr" for="c-other-d">'+esc(t("otherDef"))+'</label><textarea id="c-other-d" data-k="def" rows="1" placeholder="'+esc(t("otherDef"))+'">'+esc(o.def)+'</textarea></td>'+
  '<td class="pa-v"><label class="sr" for="c-other-v">'+esc(t("otherName"))+'</label><input id="c-other-v" data-k="v" type="number" min="0" step="any" inputmode="decimal" value="'+esc(vstr(o.v))+'"></td><td></td></tr>';
}
function autoSize(el){ if(!el||el.tagName!=="TEXTAREA") return; el.style.height="auto"; if(el.scrollHeight) el.style.height=(el.scrollHeight+2)+"px"; }
function autoSizeAll(root){ if(root) root.querySelectorAll("textarea").forEach(autoSize); }
function renderCats(list,other){
 document.getElementById("catRows").innerHTML=list.map(catRowHTML).join("")+otherRowHTML(other);
 autoSizeAll(document.getElementById("catRows"));
 document.getElementById("catAdd").hidden=list.length>=MAXC;
 document.getElementById("catMax").textContent=list.length>=MAXC?t("cMax"):"";
}
function readCats(){
 return [].map.call(document.querySelectorAll('#catRows tr[data-cid]:not([data-cid="other"])'),function(tr){
  var id=tr.getAttribute("data-cid"), x=CX[id]||{}, g=function(k){ var e=tr.querySelector('[data-k="'+k+'"]'); return e?e.value:""; };
  return {id:id,name:txt(g("name")),def:txt(g("def")),v:num(g("v")),a:num(x.a),vf:x.vf||"",why:str(x.why),nx:fixNx(x.nx)};
 });
}
function readOther(){ var tr=document.querySelector('#catRows tr[data-cid="other"]'), x=CX.other||{}; if(!tr) return {v:null,a:null,def:""}; return {v:num(tr.querySelector('[data-k="v"]').value),a:num(x.a),def:txt(tr.querySelector('[data-k="def"]').value)}; }
function negInput(){ return [].some.call(document.querySelectorAll('#catRows [data-k="v"], #baBox [data-ba]'),function(e){ var n=numRaw(e.value); return n!==null && (isNaN(n)||n<0); }); }
function nextCid(){ var n=0; document.querySelectorAll("#catRows tr[data-cid]").forEach(function(tr){ var m=/^k(\d+)$/.exec(tr.getAttribute("data-cid")); if(m) n=Math.max(n,+m[1]); }); Object.keys(CX).forEach(function(k){ var m=/^k(\d+)$/.exec(k); if(m) n=Math.max(n,+m[1]); }); return "k"+(n+1); }
/* the sections below the chart read the state held in CX: vital-few changes, next steps, after values */
function readSide(){
 document.querySelectorAll("#vfBox tr[data-vid]").forEach(function(tr){ var id=tr.getAttribute("data-vid"), x=CX[id]=CX[id]||{}; var w=tr.querySelector('[data-k="why"]'); if(w) x.why=w.value; });
 document.querySelectorAll("#nxBox .pa-nx[data-nid]").forEach(function(el){ var id=el.getAttribute("data-nid"), x=CX[id]=CX[id]||{}; x.nx=fixNx({how:el.querySelector('[data-nk="how"]').value,ref:txt(el.querySelector('[data-nk="ref"]').value)}); });
 document.querySelectorAll("#baBox [data-ba]").forEach(function(e){ var id=e.getAttribute("data-ba"), x=CX[id]=CX[id]||{}; x.a=num(e.value); });
}
var sideKey="";
function vfHTML(r){
 var RK=ranked(r), R=RK.rows.filter(function(x){ return x.v>0; });
 if(R.length<2) return '<p class="ca-hint" style="margin:0">'+esc(t("chEmpty"))+'</p>';
 return '<table class="pa-vf"><thead><tr><th>'+esc(t("vRank"))+'</th><th>'+esc(t("vName"))+'</th><th>'+esc(t("vVal"))+'</th><th>'+esc(t("vShare"))+'</th><th>'+esc(t("vCum"))+'</th><th>'+esc(t("vLine"))+'</th><th>'+esc(t("vIn"))+'</th><th>'+esc(t("vWhy"))+'</th></tr></thead><tbody>'+
  R.map(function(x){ var vit=isVital(x), chg=!x.other&&((x.c.vf==="add"&&!x.line)||(x.c.vf==="drop"&&x.line)), id="vf-"+x.c.id;
   return '<tr data-vid="'+esc(x.c.id)+'"'+(chg?' class="chg"':'')+'><td class="c">'+x.rank+'</td><td>'+esc(x.c.name)+(x.other?' <span class="ca-chip mute">'+esc(t("legO"))+'</span>':'')+'</td><td class="c">'+esc(fmt(x.v,r.unit))+'</td><td class="c">'+p1(x.share)+'%</td><td class="c">'+p1(x.cum)+'%</td><td class="c">'+(x.line?"✓":"—")+'</td>'+
    '<td class="c">'+(x.other?"—":'<label class="sr" for="'+id+'">'+esc(t("vIn"))+' '+esc(x.c.name)+'</label><input id="'+id+'" type="checkbox" data-vin="'+esc(x.c.id)+'"'+(vit?" checked":"")+'>')+'</td>'+
    '<td>'+(chg?'<label class="sr" for="'+id+'-w">'+esc(t("vWhy"))+'</label><input id="'+id+'-w" type="text" data-k="why" value="'+esc(x.c.why)+'" placeholder="'+esc(t("vWhyPh"))+'">':'')+'</td></tr>'; }).join("")+'</tbody></table>';
}
function nxHTML(r){
 var V=vitalRows(r);
 if(!r.vconf||!V.length) return '<p class="ca-hint" style="margin:0">'+esc(t("nxNone"))+'</p>';
 var hub=inHub();
 return V.map(function(x,i){ var n=fixNx(x.c.nx), id="nx-"+x.c.id, ok=linked(x);
  var list=n.how?(recsOf(storeOf(n.how))||[]):[];
  var start=n.how==="fish"?'<button class="pd-btn ghost" type="button" data-nxfish="'+esc(x.c.id)+'">'+esc(t("nxStartFish"))+' ↗</button>':(n.how==="why5"?'<button class="pd-btn ghost" type="button" data-nx5="'+esc(x.c.id)+'">'+esc(t("nxStart5"))+' ↗</button>':(n.how==="capa"?'<button class="pd-btn ghost" type="button" data-nxcapa="'+esc(x.c.id)+'">'+esc(t("nxStartCapa"))+' ↗</button>':''));
  return '<div class="pa-nx'+(ok?" ok":"")+'" data-nid="'+esc(x.c.id)+'"><h4><span class="pa-no">'+(i+1)+'</span><span>'+esc(x.c.name)+'<small>'+esc(fmtU(x.v,r.unit))+' · '+p1(x.share)+'%'+(x.c.def?' · '+esc(x.c.def):'')+'</small></span></h4>'+
   '<div class="pa-ng"><div><label for="'+id+'-h">'+esc(t("nxHow"))+'</label><select id="'+id+'-h" data-nk="how">'+opts(["","fish","why5","capa"],"how_",n.how)+'</select></div>'+
   '<div><label for="'+id+'-r">'+esc(t("nxRef"))+'</label><input id="'+id+'-r" data-nk="ref" type="text" dir="ltr" list="'+id+'-l" value="'+esc(n.ref)+'" placeholder="'+esc(t("nxRefPh"))+'"'+(n.how?'':' disabled')+'><datalist id="'+id+'-l">'+fill(list.map(function(z){ return [str(z.id),str(z.ref||"")+" · "+str(z.title)]; }))+'</datalist>'+
   '<div class="pa-pv" data-pv="'+esc(x.c.id)+'">'+esc(n.how?preview(n.how,n.ref):"")+'</div></div></div>'+
   '<div class="pa-nb">'+start+(n.ref&&n.how?'<button class="pd-btn ghost" type="button" data-nxopen="'+esc(x.c.id)+'">'+esc(t("nxOpen"))+' ↗</button>':'')+'</div>'+
   (n.how==="fish"?'<p class="ca-hint" style="margin:4px 0 0">'+esc(t("nxSave"))+'</p>':(hub&&n.how?'<p class="ca-hint" style="margin:4px 0 0">'+esc(t("nxHub"))+'</p>':''))+'</div>'; }).join("");
}
function baHTML(r){
 var R=ranked(r).rows.filter(function(x){ return x.v>0; });
 if(R.length<2) return "";
 var rows=R.map(function(x){ var a=num(x.other?r.other.a:x.c.a), d=a===null?null:a-x.v, p=(a===null||!x.v)?null:d/x.v*100, id="ba-"+x.c.id;
  return '<tr data-bar="'+esc(x.c.id)+'"><td>'+esc(x.c.name)+(isVital(x)?' ★':'')+'</td><td class="c">'+esc(fmt(x.v,r.unit))+'</td><td><label class="sr" for="'+id+'">'+esc(t("baA"))+' '+esc(x.c.name)+'</label><input id="'+id+'" type="number" min="0" step="any" inputmode="decimal" data-ba="'+esc(x.c.id)+'" value="'+esc(vstr(a))+'"></td>'+baDiff(x.v,a,r.unit)+'</tr>'; }).join("");
 var s=suggest(r), V=vitalRows(r);
 var tot=function(lbl,b,a){ return '<tr><td>'+esc(lbl)+'</td><td class="c">'+esc(fmt(b,r.unit))+'</td><td class="c">'+esc(fmt(a,r.unit))+'</td>'+baDiff(b,a,r.unit)+'</tr>'; };
 return '<table class="pa-ba"><thead><tr><th>'+esc(t("baCat"))+'</th><th>'+esc(t("baB"))+'</th><th>'+esc(t("baA"))+'</th><th>'+esc(t("baD"))+'</th><th>'+esc(t("baP"))+'</th></tr></thead><tbody>'+rows+'</tbody><tfoot>'+(V.length?tot(t("baVit"),s.vb,s.va):'')+tot(t("baTot"),s.tb,s.ta)+'</tfoot></table>';
}
function baDiff(b,a,u){ var d=a===null?null:a-b, p=(a===null||!b)?null:d/b*100;
 return '<td class="c '+(d===null?"":(d<0?"dn":(d>0?"up":"")))+'">'+(d===null?"—":(d>0?"+":"")+esc(fmt(d,u)))+'</td><td class="c">'+(p===null?"—":(p>0?"+":"")+p1(p)+"%")+'</td>'; }
/* while the after values are typed, only the difference cells and the totals are redrawn */
function baCells(r){
 var box=document.getElementById("baBox"); if(!box||!box.querySelector("table")) return;
 ranked(r).rows.filter(function(x){ return x.v>0; }).forEach(function(x){ var tr=box.querySelector('tr[data-bar="'+x.c.id+'"]'); if(!tr) return; var a=num(x.other?r.other.a:x.c.a), c=tr.querySelectorAll("td");
  if(c.length>=5){ var tmp=document.createElement("tr"); tmp.innerHTML=baDiff(x.v,a,r.unit); c[3].className=tmp.children[0].className; c[3].textContent=tmp.children[0].textContent; c[4].textContent=tmp.children[1].textContent; } });
 var tf=box.querySelector("tfoot"), s=suggest(r), V=vitalRows(r);
 var tot=function(lbl,b,a){ return '<tr><td>'+esc(lbl)+'</td><td class="c">'+esc(fmt(b,r.unit))+'</td><td class="c">'+esc(fmt(a,r.unit))+'</td>'+baDiff(b,a,r.unit)+'</tr>'; };
 if(tf) tf.innerHTML=(V.length?tot(t("baVit"),s.vb,s.va):'')+tot(t("baTot"),s.tb,s.ta);
}
/* the record as it would be saved: empty category rows dropped, each row keeps its side state */
function formToRec(){
 var r=blank();
 Object.keys(PATH).forEach(function(k){ var el=document.getElementById("f-"+k); if(el) setP(r,PATH[k],txt(el.value)); });
 if(SRCS.indexOf(r.src)<0) r.src="ncr"; if(UNITS.indexOf(r.unit)<0) r.unit="count";
 var cu=document.getElementById("f-cut"); r.cut=cu?Math.max(CUTMIN,Math.min(CUTMAX,parseInt(cu.value,10)||CUT0)):CUT0;
 var vc=document.getElementById("f-vconf"); r.vconf=!!(vc&&vc.checked);
 if(document.getElementById("teamRows")) r.team=readTeam().filter(function(m){ return m.n||m.role; });
 if(document.getElementById("catRows")){ readSide(); r.cats=readCats().filter(function(c){ return c.name||c.def||c.v!==null; }); r.other=readOther(); }
 r.id=document.getElementById("rid").value;
 if(editing&&editing.id===r.id){ r.created=editing.created||""; }
 if(VERDS.indexOf(r.after.verdict)<0) r.after.verdict="";
 return r;
}
function recToForm(r,keepMsg){
 r=fixRec(JSON.parse(JSON.stringify(r)));
 document.getElementById("rid").value=r.id||"";
 CX={}; r.cats.forEach(function(c){ CX[c.id]={a:c.a,vf:c.vf,why:c.why,nx:fixNx(c.nx)}; }); CX.other={a:r.other.a};
 Object.keys(PATH).forEach(function(k){ var el=document.getElementById("f-"+k); if(el) el.value=getP(r,PATH[k])||(el.tagName==="SELECT"&&el.options.length?el.options[0].value:""); });
 document.getElementById("f-cut").value=r.cut; document.getElementById("f-vconf").checked=r.vconf;
 renderTeam(r.team);
 renderCats(r.cats,r.other);
 if(!keepMsg){ ["recErr","recOk","catMsg"].forEach(function(id){ var e=document.getElementById(id); if(e) e.textContent=""; }); }
 sideKey="";
 refreshForm(true);
}
function loadRecordIntoForm(r){ editing=fixRec(JSON.parse(JSON.stringify(r))); recToForm(editing); }
function clearForm(){ editing=null; recToForm(blank()); }
/* the sections that hold inputs are redrawn only when their shape changes, so typing never loses focus */
function refreshForm(force){
 var r=formToRec(), st=stageOf(r);
 var el=document.getElementById("curStage"); if(el) el.textContent=t("cur")+" "+stageName(st);
 var ci=STAGES.indexOf(st);
 document.getElementById("caSteps").innerHTML=STAGES.map(function(s,i){ var cls=i<ci?"done":(i===ci?(st==="reviewed"?"done":"cur"):""); return '<li class="'+cls+'" style="--sc:'+SCOL[s]+'"'+(i===ci?' aria-current="step"':'')+'><i aria-hidden="true"></i>'+esc(stageName(s))+'</li>'; }).join("");
 document.getElementById("cutOut").textContent=r.cut+"%";
 var sh=document.getElementById("sevHint"); if(sh){ sh.hidden=r.unit!=="sev"; sh.textContent=r.unit==="sev"?t("sevHint"):""; }
 var os=otherState(r), ow=document.getElementById("othWarn"); if(ow){ ow.hidden=!os; ow.className="w5-warn"+(os==="top"?" w5-bad":""); ow.textContent=os==="top"?t("otherTop"):(os==="big"?t("otherBig"):""); }
 document.querySelectorAll("#catRows tr.pa-oth").forEach(function(tr){ tr.classList.toggle("pa-big",!!os); });
 renderChart(r);
 var RK=ranked(r), V=vitalRows(r);
 var key=L+"|"+r.unit+"|"+r.cut+"|"+r.vconf+"|"+(inHub()?1:0)+"|"+RK.rows.map(function(x){ return x.c.id+":"+x.v+":"+x.c.name+":"+(isVital(x)?1:0)+":"+(x.c.vf||"")+":"+fixNx(x.c.nx).how; }).join(",");
 if(force===true || key!==sideKey){
  sideKey=key;
  document.getElementById("vfBox").innerHTML=vfHTML(r);
  document.getElementById("nxBox").innerHTML=nxHTML(r);
  document.getElementById("baBox").innerHTML=baHTML(r);
 } else baCells(r);
 document.getElementById("vfSum").textContent=V.length?t("vCount",{n:V.length,p:p1(V.reduce(function(a,x){ return a+x.share; },0))}):t("vNone");
 var wm=whyMissing(r), ww=document.getElementById("whyWarn"); if(ww){ ww.hidden=!wm; ww.textContent=wm?t("vNeedWhy"):""; }
 document.querySelectorAll("#nxBox .pa-nx[data-nid]").forEach(function(box){ var id=box.getAttribute("data-nid"), x=CX[id]||{}, n=fixNx(x.nx); box.classList.toggle("ok",!!n.how&&!!n.ref); var pv=box.querySelector("[data-pv]"); if(pv) pv.textContent=n.how?preview(n.how,n.ref):""; });
 var aDone=isD(r.after.from)&&isD(r.after.to), lw=document.getElementById("lenWarn");
 if(lw){ var lb=lenB(r), la=lenA(r); lw.hidden=!(aDone&&lb!==null); lw.className="w5-warn"+(aDone&&!sameLen(r)?" w5-bad":""); lw.textContent=(aDone&&lb!==null)?(sameLen(r)?t("baLen",{b:lb,a:la}):t("baLenW",{b:lb,a:la})):""; }
 var sg=document.getElementById("baSug"), bc=document.getElementById("baChart"), have=afterVals(r)&&withData(r)>=2;
 if(sg){ if(have){ var s=suggest(r); sg.textContent=t("baSug",{v:t("v_"+s.v),p:(s.pv>0?"+":"")+p1(s.pv)+"%",q:(s.pt>0?"+":"")+p1(s.pt)+"%"}); } else sg.textContent=withData(r)>=2?t("baNeed"):""; }
 if(bc){ bc.hidden=!have; bc.innerHTML=have?'<div class="pa-svgw">'+baSVG(r)+'</div>':""; }
 var vw=document.getElementById("rvWarn"); if(vw){ var ri=revInTeam(r); vw.hidden=!ri; vw.textContent=ri?t("revW"):""; }
 var info=document.getElementById("pdInfo"), v=r.pdca;
 if(info){ if(!v) info.textContent=t("pdHint"); else { var p=pdcaCycles().filter(function(x){ return x.id===v; })[0]; info.textContent=p?t("pdFound",{t:p.title||p.id}):t("pdMiss"); } }
}
function validate(r){
 if(!r.title) return t("e_title");
 if(!r.q) return t("e_q");
 if(negInput()) return t("e_neg");
 if(isD(r.from)&&isD(r.to)&&r.to<r.from) return t("e_per");
 if(isD(r.after.from)&&isD(r.after.to)&&r.after.to<r.after.from) return t("e_aper");
 if(isD(r.date)&&isD(r.review.date)&&r.review.date<r.date) return t("e_rdate");
 return "";
}
function newId(r){
 var y=(isD(r.date)?r.date:today()).slice(0,4), pre="PA-"+y+"-";
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
 refreshForm(); renderAll();
 return ok;
}
/* saved and unchanged: what the other tool will read is what the form shows */
function savedSame(){ var r=formToRec(); if(!r.id) return false; var s=DB.records.filter(function(x){ return x.id===r.id; })[0]; if(!s) return false;
 var a=JSON.parse(JSON.stringify(s)), b=JSON.parse(JSON.stringify(fixRec(r))); [a,b].forEach(function(o){ delete o.created; delete o.updated; }); return JSON.stringify(a)===JSON.stringify(b); }

/* ---------- build the categories from other tools' data (read only, preview first) ---------- */
var BYS={capa:["src","cls","area","method"],fish:["bone","votes"],audit:["clause","dept"]};
function bdSelects(){
 var s=document.getElementById("bdSrc"), b=document.getElementById("bdBy"); if(!s||!b) return;
 var cs=s.value||"capa", cb=b.value;
 s.innerHTML=opts(["capa","fish","audit"],"bs_",cs);
 b.innerHTML=opts(BYS[cs],"by_",BYS[cs].indexOf(cb)>=0?cb:BYS[cs][0]);
}
function inPer(d,r){ if(!perOk(r)) return true; return isD(d) && d>=r.from && d<=r.to; }
function bdCollect(src,by,r){
 var G={}, ord=[], add=function(k,lbl,v,id){ if(!G[k]){ G[k]={k:k,l:lbl,v:0,ids:[]}; ord.push(k); } G[k].v+=v; if(id&&G[k].ids.indexOf(id)<0) G[k].ids.push(id); };
 if(src==="capa"){
  var C=recsOf(CAPA_KEY); if(!C) return null;
  C.forEach(function(c){ if(!inPer(str(c.raised),r)) return; var id=str(c.id), k, l;
   if(by==="src"){ k=str(c.src)||"-"; l=k==="-"?"—":t("cs_"+k); } else if(by==="cls"){ k=["maj","min","obs"].indexOf(c.cls)>=0?c.cls:""; l=t("cls_"+k); }
   else if(by==="method"){ var m=str(obj(c.cause).method); k=["why5","fish","other"].indexOf(m)>=0?m:""; l=t("cm_"+k); }
   else { l=txt(str(c.area))||"—"; k=l.toLowerCase(); }
   add(k,l,1,id); });
 } else if(src==="fish"){
  var F=recsOf(FISH_KEY); if(!F) return null;
  F.forEach(function(f){ if(!inPer(str(f.date),r)) return; var B=Array.isArray(f.bones)?f.bones:[];
   fishItems(f).forEach(function(x){ if(x.it.st==="out") return; var b=B[x.b]||{}, l=txt(str(b.name))||"#"+(x.b+1), k=l.toLowerCase().replace(/\s+/g," ");
    add(k,l,by==="votes"?Math.max(0,Math.min(9,parseInt(x.it.v,10)||0)):1,str(f.id)); }); });
 } else {
  var A=audState(); if(!A) return null;
  A.fnd.forEach(function(f){ if(f.cls==="pos" || !inPer(str(f.dt),r)) return; var k,l;
   if(by==="dept"){ var u=A.univ.filter(function(x){ return str(x.id)===str(f.au); })[0], dk=u?str(u.dept):""; k=dk; l=t("dp_"+dk)!=="dp_"+dk?t("dp_"+dk):(dk||t("dp_")); }
   else { l=(f.std?"ISO "+str(f.std)+" ":"")+(tv(f.cl)||"—"); k=l.toLowerCase(); }
   add(k,l,1,str(f.id)); });
 }
 var rows=ord.map(function(k){ return G[k]; }).filter(function(g){ return g.v>0; });
 rows.sort(function(a,b){ return b.v-a.v; });
 return rows;
}
function bdPreview(keep){
 var src=document.getElementById("bdSrc").value, by=document.getElementById("bdBy").value, msg=document.getElementById("bdMsg"), box=document.getElementById("bdTable"), use=document.getElementById("bdUse"), r=formToRec();
 document.getElementById("bdPer").textContent=perOk(r)?t("bdPer",{f:r.from,t:r.to}):t("bdAll");
 var rows=bdCollect(src,by,r);
 if(!rows||!rows.length){ BD=null; box.hidden=true; use.hidden=true; msg.textContent=rows?t("bdEmpty"):t("bdNone"); return; }
 BD={src:src,by:by,rows:rows}; if(!keep) msg.textContent="";
 box.hidden=false; use.hidden=false;
 box.innerHTML='<table class="pd-tbl"><thead><tr><th>'+esc(t("bdColC"))+'</th><th>'+esc(t("bdColV"))+'</th><th>'+esc(t("bdColN"))+'</th></tr></thead><tbody>'+
  rows.map(function(g){ return '<tr><td>'+esc(g.l)+'</td><td dir="ltr" style="text-align:end;font-family:Georgia,serif;font-weight:700">'+esc(fmt(g.v))+'</td><td><small dir="ltr">'+esc(g.ids.slice(0,4).join(", ")+(g.ids.length>4?" …":""))+'</small></td></tr>'; }).join("")+'</tbody></table>';
}
function bdUse(){
 if(!BD) return;
 var r=formToRec(), extra=0, ov=0, src=BD.src, by=BD.by, byL=t("by_"+by);
 var named=BD.rows.slice(0,MAXC), rest=BD.rows.slice(MAXC);
 rest.forEach(function(g){ ov+=g.v; extra++; });
 CX={};
 r.cats=named.map(function(g,i){ var c=blankCat("k"+(i+1)); c.name=g.l; c.v=g.v;
  c.def=src==="capa"?t("bdDef",{s:t("bs_capa"),by:byL,v:g.l}):(src==="fish"?(by==="votes"?t("bdDefV",{v:g.l}):t("bdDefF",{v:g.l})):t("bdDefA",{by:byL,v:g.l}));
  return c; });
 r.other={v:ov?ov:null,a:null,def:""};
 r.src=src==="capa"?"capa":(src==="fish"?"fish":"audit"); r.unit="count"; if(src==="fish"&&by==="votes") r.unitNote=t("bdUnitV");
 r.vconf=false;
 recToForm(r,true);
 document.getElementById("recOk").textContent=t("bdUsed",{n:named.length,s:t("bs_"+src)})+(extra?t("bdMore",{n:extra}):"");
 document.getElementById("catMsg").textContent="";
 var sec=document.getElementById("sec-Cat"); if(sec&&sec.scrollIntoView) sec.scrollIntoView({block:"start"});
}
document.getElementById("bdSrc").addEventListener("change",function(){ bdSelects(); BD=null; document.getElementById("bdTable").hidden=true; document.getElementById("bdUse").hidden=true; document.getElementById("bdMsg").textContent=""; });
document.getElementById("bdBy").addEventListener("change",function(){ if(BD) bdPreview(false); });
document.getElementById("bdPrev").addEventListener("click",function(){ bdPreview(false); });
document.getElementById("bdUse").addEventListener("click",function(){ bdUse(); });
function homeCounts(){ var c=(recsOf(CAPA_KEY)||[]).length, f=(recsOf(FISH_KEY)||[]).length, A=audState(), a=A?A.fnd.filter(function(x){ return x.cls!=="pos"; }).length:0; return {c:c,f:f,a:a}; }
function renderHomeBd(){
 var box=document.getElementById("homeImp"); if(!box) return;
 var h=homeCounts(), n=h.c+h.f+h.a; box.hidden=!n || DB.records.length>0; if(n) document.getElementById("homeImpT").textContent=t("hmT",h);
}
document.getElementById("homeImpGo").addEventListener("click",function(){ go("tools"); var b=document.getElementById("bdBox"); if(b&&b.scrollIntoView) b.scrollIntoView({block:"start"}); });

/* ---------- self-assessment ---------- */
var AQ=[
 ["QD1",{ar:"هل نكتب السؤال الذي يجيب عنه المخطط (ماذا، وأين، وأي فترة، وأي وحدة) قبل أن نجمع البيانات؟",en:"Do we write the question the chart must answer (what, where, which period, which unit) before we collect the data?"}],
 ["QD2",{ar:"هل نكتب لكل فئة تعريفاً في سطر، حتى يضع شخصان البند نفسه في الفئة نفسها؟",en:"Do we write a one-line definition for every category, so that two people would put the same item in the same category?"}],
 ["DT1",{ar:"هل نختار فترة طويلة بما يكفي وبيانات كافية (لا أسبوعاً سيئاً واحداً)، ونكتب الفترة على المخطط؟",en:"Do we choose a period long enough and with enough data (not one bad week), and write the period on the chart?"}],
 ["DT2",{ar:"هل نختار الوحدة التي تناسب السؤال (عدد، أو تكلفة، أو وقت مفقود، أو خطورة)، ونعرف أن العدد ليس دائماً المقياس الصحيح؟",en:"Do we choose the unit that fits the question (count, cost, time lost or severity), knowing that count is not always the right measure?"}],
 ["DT3",{ar:"هل نُبقي «أخرى» أصغر من أصغر فئة مسماة، ونقسّمها عندما تكبر؟",en:"Do we keep “Other” smaller than the smallest named category, and split it when it grows?"}],
 ["VF1",{ar:"هل نقسّم الفئة تقسيماً طبقياً (بحسب الموقع أو الوردية أو المورد أو المنتج) عندما تخفي عدة مشكلات مختلفة؟",en:"Do we stratify a category (by site, shift, supplier or product) when it hides several different problems?"}],
 ["VF2",{ar:"هل نؤكد القلة الحيوية بالحكم (أثر السلامة أو العميل أو القانون)، ونكتب السبب عندما نبتعد عن خط 80%؟",en:"Do we confirm the vital few with judgement (safety, customer or legal impact), and write the reason when we move away from the 80% line?"}],
 ["AC1",{ar:"هل تنتقل كل فئة حيوية إلى تحليل السبب (عظمة السمكة أو لماذا الخمس أو البيانات) أو إلى سجل CAPA، ويُسجَّل الربط؟",en:"Does each vital-few category move to cause analysis (Fishbone, 5 Whys or data) or to a CAPA record, with the link recorded?"}],
 ["AC2",{ar:"هل نتحقق من الأثر بمخطط ثانٍ للفئات نفسها وبالوحدة نفسها ولفترة بالطول نفسه بعد الإجراء؟",en:"Do we check the effect with a second chart on the same categories, unit and length of period after the action?"}],
 ["AC3",{ar:"هل تُعرض مخططات باريتو لعدم المطابقة والملاحظات والشكاوى في مراجعة الإدارة بوصفها اتجاهات؟",en:"Are Pareto charts of nonconformities, findings and complaints shown in management review as trends?"}]
];
var AGROUPS=["QD","DT","VF","AC"];
var GCOL={QD:"#C2410C",DT:"#3563C9",VF:"#B8901E",AC:"#3C9A5F"};
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
function baLine(r){ if(!afterDone(r)) return t("baNone"); var s=suggest(r); return t("v_"+r.after.verdict)+" · "+(s.pt>0?"+":"")+p1(s.pt)+"%"; }
function renderDocs(){
 var box=document.getElementById("docsBox"); if(!box) return;
 var cnt0=document.getElementById("cntDocs"); if(cnt0) cnt0.textContent=DB.records.length?String(DB.records.length):"";
 if(!DB.records.length){ box.innerHTML='<div class="pd-empty">'+esc(t("none"))+'</div>'; return; }
 var rows=DB.records.map(function(r){
  var st=stageOf(r), RK=ranked(r), V=vitalRows(r);
  var del=(pendingDelete===r.id)?'<button class="pd-rowbtn arm" type="button" data-del="'+esc(r.id)+'">'+esc(t("delArm"))+'</button>':'<button class="pd-rowbtn" type="button" data-del="'+esc(r.id)+'">'+esc(t("del"))+'</button>';
  var pd=r.pdca?'<button class="pd-rowbtn" type="button" data-pdca="'+esc(r.pdca)+'">PDCA ↗</button>':'';
  return '<tr><td><b dir="ltr">'+esc(r.ref||"—")+'</b><br>'+esc(r.title)+'<br><small dir="ltr" style="color:var(--muted)">'+esc(r.id)+'</small></td><td>'+esc(srcName(r.src))+'<br><small>'+esc(t("u_"+r.unit))+(perOk(r)?' · <span dir="ltr">'+esc(r.from+" → "+r.to)+'</span>':'')+'</small></td><td><span class="pd-badge" style="background:'+SCOL[st]+';color:#fff">'+esc(stageName(st))+'</span></td><td>'+esc(t("catsN",{n:RK.rows.filter(function(x){ return !x.other; }).length,t:fmtU(RK.total,r.unit)}))+'</td><td>'+(V.length?esc(V.map(function(x){ return x.c.name; }).join("، ")):"—")+'</td><td>'+esc(baLine(r))+'</td><td>'+flagsOf(r).map(chip).join("")+'</td><td><button class="pd-rowbtn" type="button" data-open="'+esc(r.id)+'">'+esc(t("open"))+'</button>'+del+pd+'</td></tr>';
 }).join("");
 box.innerHTML='<table class="pd-tbl"><thead><tr><th>'+esc(t("colRef"))+'</th><th>'+esc(t("colSrc"))+'</th><th>'+esc(t("colStage"))+'</th><th>'+esc(t("colCats"))+'</th><th>'+esc(t("colVital"))+'</th><th>'+esc(t("colBa"))+'</th><th>'+esc(t("colFlags"))+'</th><th>'+esc(t("colAct"))+'</th></tr></thead><tbody>'+rows+'</tbody></table>';
}
function catMsg(s){ var m=document.getElementById("catMsg"); if(m) m.textContent=s||""; }
function startStep(cid,how){
 var r=formToRec(), x=ranked(r).rows.filter(function(z){ return z.c.id===cid; })[0];
 if(how==="fish"){
  if(!savedSame()){ if(!saveRecord()) return; r=formToRec(); }
  openFish({pareto:r.id,cat:cid}); return;
 }
 if(how==="why5"){ openWhy5({}); return; }
 openTool("capa.html","tools");
 return x;
}
document.addEventListener("click",function(e){
 if(e.target.closest("#cb")) return;
 var o=e.target.closest("[data-open]"); if(o){ var r=DB.records.find(function(x){ return x.id===o.getAttribute("data-open"); }); if(r){ loadRecordIntoForm(r); go("tools"); } return; }
 var d=e.target.closest("[data-del]"); if(d){ var id=d.getAttribute("data-del"); if(pendingDelete===id){ DB.records=DB.records.filter(function(x){ return x.id!==id; }); pendingDelete=null; persist(); if(document.getElementById("rid").value===id) clearForm(); renderAll(); } else { pendingDelete=id; renderDocs(); } return; }
 if(e.target.closest("[data-pdca]")||e.target.closest("#pdOpen")){ openTool("pdca.html","docs"); return; }
 var nf=e.target.closest("[data-nxfish]"); if(nf){ startStep(nf.getAttribute("data-nxfish"),"fish"); return; }
 var n5=e.target.closest("[data-nx5]"); if(n5){ startStep(n5.getAttribute("data-nx5"),"why5"); return; }
 var nc=e.target.closest("[data-nxcapa]"); if(nc){ startStep(nc.getAttribute("data-nxcapa"),"capa"); return; }
 var no=e.target.closest("[data-nxopen]"); if(no){ readSide(); var x=CX[no.getAttribute("data-nxopen")]||{}, n=fixNx(x.nx); if(n.how==="fish") openFish({open:n.ref}); else if(n.how==="why5") openWhy5({open:n.ref}); else openTool("capa.html","docs"); return; }
 var tx=e.target.closest("[data-tmdel]"); if(tx){ var tl=readTeam(); tl.splice(Number(tx.getAttribute("data-tmdel")),1); renderTeam(tl); refreshForm(); return; }
 if(e.target.closest("#tmAdd")){ var t2=readTeam(); t2.push({n:"",role:""}); renderTeam(t2); var lt=document.querySelector("#teamRows tr:last-child input"); if(lt) lt.focus(); refreshForm(); return; }
 if(e.target.closest("#catAdd")){ var c0=readCats(), o0=readOther(); if(c0.length<MAXC){ var nid=nextCid(); c0.push(blankCat(nid)); CX[nid]={}; renderCats(c0,o0); var nf2=document.getElementById("c-"+nid+"-n"); if(nf2) nf2.focus(); } else catMsg(t("cMax")); refreshForm(); return; }
 var cd=e.target.closest("[data-cdel]"); if(cd){ var c1=readCats(), o1=readOther(), did=cd.getAttribute("data-cdel"); c1=c1.filter(function(c){ return c.id!==did; }); delete CX[did]; renderCats(c1,o1); catMsg(""); refreshForm(); return; }
});
/* the vital-few check boxes: a change from the line is recorded with its reason; the next-step method redraws its row */
document.addEventListener("change",function(e){
 var el=e.target; if(!el.closest) return;
 if(el.matches("[data-vin]")){ readSide(); var id=el.getAttribute("data-vin"), r=formToRec(), x=ranked(r).rows.filter(function(z){ return z.c.id===id; })[0]; if(!x) return;
  var c=CX[id]=CX[id]||{}; c.vf=(el.checked===x.line)?"":(el.checked?"add":"drop"); if(!c.vf) c.why=""; }
 if(el.matches('[data-nk="how"]')) howChanged(el);
},true);
/* a new method for a next step clears the id recorded for the old one (select boxes fire "input" before "change") */
function howChanged(el){ var box=el.closest("[data-nid]"); if(!box||!document.body.contains(box)) return; var id2=box.getAttribute("data-nid"), c2=CX[id2]=CX[id2]||{}, n=fixNx(c2.nx);
 if(n.how===el.value) return; var rf=box.querySelector('[data-nk="ref"]'); if(rf) rf.value=""; readSide(); c2.nx=fixNx({how:el.value,ref:""}); }
document.addEventListener("input",function(e){ var el=e.target; if(el&&el.matches&&el.matches('[data-nk="how"]')) howChanged(el); },true);

/* ---------- automatic audit of analyses ---------- */
var CHECKS=["ref","q","pu","def","three","oth","conf","next","ba","rev"];
function auditRecord(r){
 var da=withData(r)>=2, vi=atLeast(r,"vital"), ac=atLeast(r,"acted"), ch=atLeast(r,"checked"), res={};
 res.ref=!!txt(r.ref);
 res.q=!!txt(r.q);
 res.pu=perOk(r)&&unitOk(r);
 res.def=da?undefinedCats(r)===0:null;
 res.three=da?withData(r)>=3:null;
 res.oth=da?otherState(r)!=="top":null;
 res.conf=(da&&txt(r.q))?(r.vconf&&vitalRows(r).length>0&&!whyMissing(r)):null;
 res.next=vi?nUnlinked(r)===0:null;
 res.ba=ac?(afterDone(r)&&sameLen(r)):null;
 res.rev=ch?(!!txt(r.review.by)&&isD(r.review.date)&&!revInTeam(r)):null;
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
 var R=DB.records, c={n:R.length,conf:0,linked:0,ba:0,imp:0,same:0,worse:0,rev:0,cats:0,nx:{fish:0,why5:0,capa:0,none:0}};
 R.forEach(function(r){ var V=vitalRows(r);
  if(atLeast(r,"vital")) c.conf++; if(V.length&&V.every(linked)) c.linked++;
  if(afterDone(r)){ c.ba++; c[r.after.verdict]++; }
  if(stageOf(r)==="reviewed") c.rev++;
  c.cats+=ranked(r).rows.filter(function(x){ return !x.other&&x.v>0; }).length;
  if(r.vconf) V.forEach(function(x){ var n=fixNx(x.c.nx); if(linked(x)) c.nx[n.how]++; else c.nx.none++; });
 });
 return c;
}
function pct(a,n){ return n?Math.round(a/n*100)+"%":"—"; }
function renderDash(){
 var box=document.getElementById("dKpis"); if(!box) return;
 var c=counts(), au=auditSummary(), as=assessScore(), n=c.n, oi=openItems();
 box.innerHTML=TBX.kpi(n,t("kTotal"))+TBX.kpi(c.conf,t("kConf"))+TBX.kpi(pct(c.linked,n),t("kLinked"))+TBX.kpi(c.ba,t("kBa"))+TBX.kpi(pct(c.imp,n),t("kImp"))+TBX.kpi(c.rev,t("kRev"))+TBX.kpi(c.cats,t("kCats"))+TBX.kpi(oi.length,t("kOpen"))+TBX.kpi(au.rate===null?"—":au.rate+"%",t("kAud"))+TBX.kpi(as+"%",t("kAs"));
 var nd='<p class="pd-sub" style="color:var(--ink-soft)">'+esc(t("noData"))+'</p>';
 document.getElementById("dStage").innerHTML=n?TBX.dist(STAGES,n,function(s){ return DB.records.filter(function(r){ return stageOf(r)===s; }).length; },stageName,function(s){ return SCOL[s]; }):nd;
 document.getElementById("dVerdict").innerHTML=n?TBX.dist(["imp","same","worse","none"],n,function(k){ return k==="none"?n-c.ba:c[k]; },function(k){ return k==="none"?t("vd_none"):t("v_"+k); },function(k){ return {imp:"#3C9A5F",same:"#C9821A",worse:"#B42318",none:"#9AA5B8"}[k]; }):nd;
 var nn=c.nx.fish+c.nx.why5+c.nx.capa+c.nx.none;
 document.getElementById("dNext").innerHTML=nn?TBX.dist(["fish","why5","capa","none"],nn,function(k){ return c.nx[k]; },function(k){ return k==="none"?t("nx_none"):t("how_"+k); },function(k){ return {fish:"#1E8C93",why5:"#3563C9",capa:"#C2410C",none:"#9AA5B8"}[k]; }):nd;
 document.getElementById("dAssess").innerHTML=AGROUPS.map(function(g){ var p=assessScore(g); return TBX.bar(t("g_"+g),p+"%",p,GCOL[g]); }).join("")+'<p class="pd-sub" style="font-size:12.5px;color:var(--muted);margin:10px 0 0">'+esc(t("bandNote"))+'</p>';
 document.getElementById("dOpen").innerHTML=oi.length?oi.map(function(x){ return '<li><b>'+esc(x.r.ref||x.r.id)+'</b>'+chip([x.r.id,"info"])+'<span>'+esc(x.s)+'</span></li>'; }).join(""):'<li>'+esc(n?t("noOpen"):t("noData"))+'</li>';
}

/* ---------- report and CSV ---------- */
function buildCSV(){
 var head=["id","ref","title","question","source","area","pdca","from","to","date","dataOwner","unit","unitNote","stage","cutoff","total","categories","vitalFew","vitalConfirmed","changesFromLine","nextSteps","stratification","afterFrom","afterTo","afterValues","verdict","verdictNote","reviewer","reviewDate"];
 return TBX.csv(head,DB.records.map(function(r){
  var RK=ranked(r), V=vitalRows(r);
  var cs=RK.rows.map(function(x){ return x.rank+". "+x.c.name+" = "+fmt(x.v,r.unit)+" ("+p1(x.share)+"%, cum "+p1(x.cum)+"%)"+(x.c.def?" ["+x.c.def+"]":""); }).join(" | ");
  var ch=changes(r).map(function(x){ return x.c.name+": "+x.c.vf+(x.c.why?" — "+x.c.why:""); }).join(" | ");
  var nx=V.map(function(x){ var n=fixNx(x.c.nx); return x.c.name+" → "+(n.how||"—")+(n.ref?" "+n.ref:""); }).join(" | ");
  var av=RK.rows.filter(function(x){ return x.v>0; }).map(function(x){ var a=num(x.other?r.other.a:x.c.a); return x.c.name+" = "+(a===null?"—":fmt(a,r.unit)); }).join(" | ");
  return [r.id,r.ref,r.title,r.q,r.src,r.area,r.pdca,r.from,r.to,r.date,r.owner,r.unit,r.unitNote,stageOf(r),r.cut,RK.total,cs,V.map(function(x){ return x.c.name; }).join(" | "),r.vconf?"yes":"no",ch,nx,r.strat,r.after.from,r.after.to,av,r.after.verdict,r.after.note,r.review.by,r.review.date]; }));
}
function recReport(r){
 var RK=ranked(r), V=vitalRows(r), s=stageOf(r);
 var rk=RK.rows.map(function(x){ var vit=isVital(x), how=x.other?"":(x.c.vf==="add"&&!x.line?t("rpAdd"):(x.c.vf==="drop"&&x.line?t("rpDrop"):(x.line?t("rpLine"):"")));
  return '<tr'+(vit?' class="vf"':'')+'><td style="text-align:center">'+x.rank+'</td><td>'+(vit?'<b>★ ':'')+esc(x.c.name)+(vit?'</b>':'')+'</td><td>'+esc(x.c.def||"—")+'</td><td class="n">'+esc(fmt(x.v,r.unit))+'</td><td class="n">'+p1(x.share)+'%</td><td class="n">'+p1(x.cum)+'%</td><td>'+esc(how)+(x.c.why&&how&&how!==t("rpLine")?' — '+esc(x.c.why):'')+'</td></tr>'; }).join("");
 var nx=V.map(function(x,i){ var n=fixNx(x.c.nx); return '<tr><td>'+(i+1)+'</td><td>'+esc(x.c.name)+'</td><td>'+esc(n.how?t("how_"+n.how):"—")+'</td><td dir="ltr">'+esc(n.ref||"—")+'</td><td class="'+(linked(x)?"ok":"bad")+'">'+(linked(x)?"✓":"✗")+'</td></tr>'; }).join("");
 var ba="";
 if(afterVals(r)&&withData(r)>=2&&(isD(r.after.from)||isD(r.after.to))){ var sg=suggest(r);
  ba='<h4>'+esc(t("rpBa"))+'</h4><p class="meta"><span dir="ltr">'+esc(r.from+" → "+r.to)+'</span> · <span dir="ltr">'+esc(r.after.from+" → "+r.after.to)+'</span>'+(sameLen(r)?'':' · <span class="bad">'+esc(t("fl_len"))+'</span>')+'</p><div class="dg">'+baSVG(r)+'</div>'+
   '<p><b>'+esc(t("f_verdict"))+':</b> '+esc(t("v_"+r.after.verdict))+' · '+esc(t("baSug",{v:t("v_"+sg.v),p:(sg.pv>0?"+":"")+p1(sg.pv)+"%",q:(sg.pt>0?"+":"")+p1(sg.pt)+"%"}))+(r.after.note?' — '+esc(r.after.note):'')+'</p>'; }
 return '<section class="an"><h3><span dir="ltr">'+esc(r.id)+'</span> · <span dir="ltr">'+esc(r.ref||"—")+'</span> — '+esc(r.title)+'</h3>'+
  '<p class="meta">'+esc(t("colStage"))+': <b>'+esc(stageName(s))+'</b> · '+esc(srcName(r.src))+' · '+esc(t("u_"+r.unit))+(r.unitNote?' ('+esc(r.unitNote)+')':'')+(perOk(r)?' · <span dir="ltr">'+esc(r.from+" → "+r.to)+'</span>':'')+(r.pdca?' · PDCA <span dir="ltr">'+esc(r.pdca)+'</span>':'')+' · '+esc(t("f_cut"))+' '+r.cut+'%</p>'+
  '<table><tbody><tr><th>'+esc(t("f_q"))+'</th><td>'+esc(r.q||"—")+'</td></tr><tr><th>'+esc(t("f_area"))+'</th><td>'+esc(r.area||"—")+'</td></tr><tr><th>'+esc(t("sTeamT"))+'</th><td>'+esc((r.owner?r.owner+" · ":"")+(r.team.map(function(m){ return m.n+(m.role?" ("+m.role+")":""); }).join("، ")||"—"))+'</td></tr></tbody></table>'+
  '<div class="dg">'+paretoSVG(r)+'</div>'+
  (rk?'<h4>'+esc(t("rpRank"))+'</h4><table class="cs"><thead><tr><th>#</th><th>'+esc(t("cN"))+'</th><th>'+esc(t("cDef"))+'</th><th>'+esc(t("cV"))+'</th><th>'+esc(t("vShare"))+'</th><th>'+esc(t("vCum"))+'</th><th>'+esc(t("vIn"))+'</th></tr></thead><tbody>'+rk+'</tbody></table>':'')+
  '<h4>'+esc(t("rpVital"))+'</h4><p class="meta">'+esc(V.length?t("vCount",{n:V.length,p:p1(V.reduce(function(a,x){ return a+x.share; },0))}):t("vNone"))+' · '+esc(t("f_vconf"))+': '+esc(r.vconf?t("yes"):t("no"))+(r.vnote?' — '+esc(r.vnote):'')+'</p>'+
  (nx?'<table><thead><tr><th>#</th><th>'+esc(t("cN"))+'</th><th>'+esc(t("nxHow"))+'</th><th>'+esc(t("nxRef"))+'</th><th>✓</th></tr></thead><tbody>'+nx+'</tbody></table>':'')+
  (r.strat?'<p><b>'+esc(t("sStratT"))+':</b> '+esc(r.strat)+'</p>':'')+ba+
  '<p><b>'+esc(t("sRevT"))+':</b> '+esc(r.review.by||"—")+(r.review.date?' · <span dir="ltr">'+esc(r.review.date)+'</span>':'')+(r.review.note?' — '+esc(r.review.note):'')+'</p></section>';
}
function buildReportHTML(){
 var c=counts(), au=auditSummary(), as=assessScore(), d=today(), n=c.n, A=TBX.audit(DB.records,auditRecord,CHECKS), oi=openItems();
 var mark=function(v){ return v===null?'<td class="na">—</td>':(v?'<td class="ok">✓</td>':'<td class="bad">✗</td>'); };
 var grpRows=AGROUPS.map(function(g){ return '<tr><td>'+esc(t("g_"+g))+' — '+g+'</td><td>'+assessScore(g)+'%</td></tr>'; }).join("");
 var auRows=A.rows.map(function(x){ return '<tr><td dir="ltr">'+esc(x.r.id)+'</td>'+CHECKS.map(function(k){ return mark(x.res[k]); }).join("")+'</tr>'; }).join("");
 var body='<div class="cover"><p class="kick">Continual Improvement Academy · CIA Toolbox</p><h1>Pareto — Vital few analysis / تحليل باريتو</h1><p class="sub">'+esc(t("rpCover"))+'</p>'+
  '<p class="meta">'+esc(t("prep"))+': <bdi><strong>مدثر سلامه</strong></bdi> · <bdi dir="ltr">'+esc(d)+'</bdi> · <bdi>'+esc(t("kTotal"))+': '+n+'</bdi></p></div>'+
  '<h2>Summary / الملخص</h2><div class="k">'+
   '<div><b>'+n+'</b>'+esc(t("kTotal"))+'</div><div><b>'+c.conf+'</b>'+esc(t("kConf"))+'</div><div><b>'+pct(c.linked,n)+'</b>'+esc(t("kLinked"))+'</div><div><b>'+c.ba+'</b>'+esc(t("kBa"))+'</div><div><b>'+pct(c.imp,n)+'</b>'+esc(t("kImp"))+'</div><div><b>'+c.rev+'</b>'+esc(t("kRev"))+'</div><div><b>'+oi.length+'</b>'+esc(t("kOpen"))+'</div><div><b>'+(au.rate===null?"—":au.rate+"%")+'</b>'+esc(t("kAud"))+'</div><div><b>'+as+'%</b>'+esc(t("kAs"))+'</div></div>'+
  '<h2>Analyses / التحليلات</h2>'+(n?DB.records.map(recReport).join(""):'<p class="meta">'+esc(t("rpEmpty"))+'</p>')+
  '<h2>Audit results / نتائج التدقيق</h2>'+(n?'<p>'+esc(t("auPass"))+': '+(au.rate===null?"—":au.rate+"% ("+au.pass+"/"+au.applic+")")+'</p><table><thead><tr><th>ID</th>'+CHECKS.map(function(k){ return '<th>'+esc(t("c_"+k))+'</th>'; }).join("")+'</tr></thead><tbody>'+auRows+'</tbody></table>':'<p class="meta">—</p>')+
  '<h2>Open items / بنود تحتاج متابعة</h2>'+(oi.length?'<ul>'+oi.map(function(x){ return '<li><span dir="ltr">'+esc(x.r.id)+' · '+esc(x.r.ref||"—")+'</span> — '+esc(x.s)+'</li>'; }).join("")+'</ul>':'<p class="meta">'+esc(n?t("noOpen"):"—")+'</p>')+
  '<h2>Self-assessment / التقييم الذاتي</h2><table><thead><tr><th>Group / المجموعة</th><th>Score / النتيجة</th></tr></thead><tbody>'+grpRows+'<tr><td><b>'+esc(t("kAs"))+'</b></td><td><b>'+as+'%</b></td></tr></tbody></table><p class="meta">'+esc(t("bandNote"))+'</p>'+
  '<footer>Prepared by / أعدّه: مدثر سلامه · Pareto analysis is a working method, not a requirement of any standard; 80/20 is a rule of thumb, and a vital-few category is where to dig, not a cause. Sources / المراجع: ISO 9001:2026 clauses 7.1.6, 9.1.3, 9.3.2, 10.1 and 10.2 and Annexes A.9.1 and A.10.2; ISO 9000:2026 3.8.1, 3.8.2, 3.8.3, 3.8.6 and 4.2.7 (interpretive summaries, not the official text) · Examples are illustrative.</footer>';
 return TBX.reportDoc(L,'Pareto Report — مدثر سلامه',body,'.ok{color:#2F7D4B;font-weight:700;text-align:center}.bad{color:#B42318;font-weight:700}td.bad{text-align:center}.na{color:#7A869E;text-align:center}ul{padding-inline-start:20px}h3{font-family:Georgia,serif;margin:22px 0 4px;font-size:17px}h4{margin:14px 0 4px;font-size:14.5px}.an{border-top:1px solid #DCE4EE;padding-top:6px;break-inside:auto}.an th{background:#F3F7FB;color:#1B2A4A}.an tbody th{width:30%}.dg{margin:12px 0;border:1px solid #DCE4EE;border-radius:10px;padding:6px;overflow-x:auto;break-inside:avoid}.dg svg{display:block;max-width:100%;height:auto;margin:auto}.cs td{font-size:13px}td.n{direction:ltr;text-align:end;font-family:Georgia,serif;white-space:nowrap}tr.vf td{background:#FBF6E8}.cover{border-bottom:4px solid #B8901E;padding:18px 0 14px;margin-bottom:8px}.cover h1{border:0;margin:6px 0}.cover .kick{color:#B8901E;font-weight:700;letter-spacing:.04em;margin:0}.cover .sub{font-size:18px;margin:4px 0}@media print{.dg{page-break-inside:avoid}}');
}
function stamp(){ return today(); }
function renderReport(){
 var prev=document.getElementById("rpPrev"); if(!prev) return;
 if(!DB.records.length){ prev.innerHTML='<p class="pd-sub" style="color:var(--ink-soft)">'+esc(t("rpEmpty"))+'</p>'; return; }
 var c=counts(), au=auditSummary();
 prev.innerHTML='<div class="pd-kpis">'+TBX.kpi(c.n,t("kTotal"))+TBX.kpi(c.conf,t("kConf"))+TBX.kpi(openItems().length,t("kOpen"))+TBX.kpi(au.rate===null?"—":au.rate+"%",t("kAud"))+'</div>';
}
document.getElementById("rpHtml").addEventListener("click",function(){
 var err=document.getElementById("rpErr"); err.textContent="";
 if(!DB.records.length && !Object.keys(DB.assess).length){ err.textContent=t("rpEmpty"); return; }
 TBX.download("Pareto-report-"+stamp()+".html","text/html;charset=utf-8",buildReportHTML());
});
document.getElementById("rpCsv").addEventListener("click",function(){ var err=document.getElementById("rpErr"); err.textContent=""; if(!DB.records.length){ err.textContent=t("rpEmpty"); return; } TBX.download("Pareto-analyses-"+stamp()+".csv","text/csv;charset=utf-8",buildCSV()); });
document.getElementById("dCsv").addEventListener("click",function(){ if(!DB.records.length) return; TBX.download("Pareto-analyses-"+stamp()+".csv","text/csv;charset=utf-8",buildCSV()); });

/* ---------- platform identity: academy logo and related tools ---------- */
var LOGO="__LOGO__";
function applyLogo(){ document.querySelectorAll("img[data-logo]").forEach(function(i){ if(i.src!==LOGO) i.src=LOGO; i.alt=t("logoAlt"); }); }
var RELATED=[["capa","CAPA","./capa.html","#C2410C"],["fish","Fishbone","./fishbone.html","#1E8C93"],["why5","5 Whys","./five-whys.html","#3563C9"],["aud","ISO 19011","./smart-audit-improvement.html","#C9821A"]];
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
 DB={records:[],assess:{}}; pendingDelete=null; BD=null;
 TBX.drop(STORE);
 clearForm(); renderAll();
 document.getElementById("bdTable").hidden=true; document.getElementById("bdUse").hidden=true; document.getElementById("bdMsg").textContent="";
 var m=document.getElementById("exMsg"); if(m) m.textContent=t("exCleared");
 var a=document.getElementById("asMsg"); if(a) a.textContent="";
}
/* the tour layer asks for confirmation before the example replaces data (guard "pfEx": "all"); clearing asks here */
document.getElementById("pfEx").addEventListener("click",function(){ loadExample(); });
document.getElementById("pfReset").addEventListener("click",function(){ var ok=true; try{ ok=window.confirm(t("exConfirmClear")); }catch(e){ ok=true; } if(ok) clearAll(); });

/* ---------- assistant: answers from the tool's own guide and your analyses (rule-based, no AI service) ---------- */
var CONTACT_EMAIL="moddathersalama.eng@gmail.com";
var CB={
 ar:{fab:"اسأل عن باريتو",title:"مساعد باريتو",sub:"إجابات فورية من دليل الأداة وتحليلاتك",new:"محادثة جديدة",close:"إغلاق",ph:"اكتب سؤالك…",send:"إرسال",inL:"سؤالك",
  hello:"مرحباً. أجيب عن أسئلة «باريتو» من دليل الأداة ومن تحليلاتك المحفوظة في هذا المتصفح. اختر سؤالاً أو اكتب سؤالك.",
  miss:"لم أجد إجابة جاهزة لهذا السؤال. جرّب أحد الأسئلة المقترحة، أو اسأل عن: قاعدة 80/20، أو الترتيب مع عظمة السمكة، أو الوحدة، أو «أخرى»، أو التقسيم الطبقي، أو التحقق قبل وبعد. وللاستشارة راسل المُعِد على البريد أدناه.",
  instant:"إجابة فورية",foot:"المساعد يعمل في متصفحك ولا يرسل بياناتك. للتواصل:",
  op0:"لا توجد بنود مفتوحة في تحليلاتك الآن.",st0:"لا توجد تحليلات بعد. ابدأ من [[tab:tools]] أو حمّل المثال من [[tab:docs]]."},
 en:{fab:"Ask about Pareto",title:"Pareto assistant",sub:"Instant answers from the tool's guide and your analyses",new:"New chat",close:"Close",ph:"Type your question…",send:"Send",inL:"Your question",
  hello:"Hello. I answer Pareto questions from the tool's guide and from your analyses saved in this browser. Pick a question or type your own.",
  miss:"I have no ready answer for that. Try one of the suggested questions, or ask about the 80/20 rule, the order with Fishbone, the unit, “Other”, stratification or the before/after check. For advice, email the author at the address below.",
  instant:"Instant answer",foot:"The assistant runs in your browser and sends no data. Contact:",
  op0:"No open items in your analyses right now.",st0:"No analyses yet. Start from the [[tab:tools]] or load the example in [[tab:docs]]."}
};
var KB=[
 {id:"8020",k:["80/20","80 20","8020","ثمانين","80%","دائما","دائماً","always","rule","قاعدة","قانون","law"],q:{ar:"هل هي دائماً 80/20؟",en:"Is it always 80/20?"},
  a:{ar:"لا. **80/20 قاعدة تقريبية، وليست قانوناً.** قد تصنع فئتان 60% فقط من المشكلة، وقد تصنع فئة واحدة 90%. لذلك تقترح الأداة القلة الحيوية بخط قطع تستطيع تغييره بين 60% و90%، ثم **يؤكد الفريق** بحكمه: يضيف فئة صغيرة لكنها حرجة للسلامة أو للعميل، أو يستبعد فئة، ويكتب السبب. وإذا جاء المخطط مستوياً بلا فئات بارزة، فالفئات غالباً معرّفة بطريقة لا تفصل المشكلة: أعد تعريفها أو جرّب وحدة أخرى. التفاصيل في [[tab:explain-std]].",
   en:"No. **80/20 is a rule of thumb, not a law.** Two categories may make only 60% of the problem, and one may make 90%. That is why the tool suggests the vital few with a cut-off line you can move between 60% and 90%, and then **the team confirms** with its judgement: it adds a small category that is critical for safety or the customer, or drops one, and writes the reason. If the chart comes out flat with no stand-out categories, the categories are usually defined in a way that does not separate the problem: redefine them or try another unit. Details in the [[tab:explain-std]]."}},
 {id:"pf",k:["عظمة السمكة","fishbone","ishikawa","أولاً","اولا","first","before","order","ترتيب","أيهما","which"],q:{ar:"باريتو أم عظمة السمكة أولاً؟",en:"Pareto or Fishbone first?"},
  a:{ar:"عادةً **باريتو أولاً**. باريتو يختار **أين تحفر**: الفئة التي تصنع معظم المشكلة. ثم تبحث **عظمة السمكة** في أسباب تلك الفئة، و**لماذا الخمس** أو البيانات تؤكد السبب. ومن الفئة الحيوية في [[tab:tools]] يفتح زر «ابدأ تحليل عظمة سمكة لهذه الفئة» أداة عظمة السمكة والأثر معبأ من الفئة. ويجوز العكس: بعد جلسة عظمة سمكة يمكنك عدّ الأسباب بحسب العظمة أو مجموع الأصوات من «ابنِ الفئات من بيانات هذا المتصفح».",
   en:"Usually **Pareto first**. Pareto chooses **where to dig**: the category that makes up most of the problem. **Fishbone** then searches for the causes of that category, and **5 Whys** or data confirm the cause. From a vital-few category in the [[tab:tools]], “Start a Fishbone analysis for this category” opens Fishbone with the effect filled in from the category. The reverse also works: after a fishbone session you can count the causes by bone or by votes from “Build the categories from data in this browser”."}},
 {id:"unit",k:["وحدة","عدد","تكلفة","تكلفه","وقت","خطورة","unit","count","cost","time","severity","weight","أوزان"],q:{ar:"هل أرتّب بالعدد أم بالتكلفة؟",en:"Should I rank by count or by cost?"},
  a:{ar:"بحسب **السؤال**. العدد يبيّن أين يتكرر الخلل، والتكلفة أو الوقت المفقود يبيّن أين يوجع، ودرجة الخطورة تبيّن أين الخطر. والترتيب يتغير: في المثال، أكثر عدم المطابقة عدداً هي المواد دون شهادات، لكن الخرسانة المرفوضة والإعادة في التنفيذ تتصدران بالتكلفة. إذا استخدمت درجة الخطورة فاكتب الأوزان في «ملاحظة الوحدة»، وإلا فشل فحص «الفترة والوحدة محددتان» في [[tab:audit]].",
   en:"It depends on **the question**. Count shows where the failure repeats, cost or time lost shows where it hurts, and a severity score shows where the risk is. The order changes: in the example, the most frequent nonconformities are materials without certificates, but rejected concrete and rework lead by cost. If you use a severity score, write the weights in the “Unit note”, or the check “Period and unit stated” fails in the [[tab:audit]]."}},
 {id:"other",k:["أخرى","اخرى","other","misc","متفرقات"],q:{ar:"ماذا أفعل بـ«أخرى»؟",en:"What do I do with “Other”?"},
  a:{ar:"«أخرى» سطر واحد في النهاية، ويُرسم آخر عمود مهما كان حجمه، ولا يدخل القلة الحيوية. يجب أن يبقى **أصغر من أصغر فئة مسماة**. إذا كبر فالأداة تنبّه، وإذا صار الأكبر يفشل فحص «أخرى ليست الأكبر»: افتح ما بداخله، وأخرج منه فئة جديدة بتعريف واضح.",
   en:"“Other” is one line at the end; it is drawn as the last bar whatever its size, and it never joins the vital few. It must stay **smaller than the smallest named category**. When it grows the tool warns you, and when it becomes the largest the check “Other not the largest” fails: open it up and take a new, clearly defined category out of it."}},
 {id:"strat",k:["تقسيم","طبقي","طبقات","stratif","split","site","shift","supplier","موقع","وردية","مورد"],q:{ar:"متى أقسّم الفئة تقسيماً طبقياً؟",en:"When do I stratify a category?"},
  a:{ar:"عندما تكون الفئة الكبيرة **خليطاً** من مشكلات مختلفة، مثل «مواد دون شهادات» تأتي من موردين مختلفين، أو رفض خرسانة في وردية الظهر فقط. قسّم بحسب الموقع أو الوردية أو المورد أو المنتج، وارسم مخططاً جديداً للفئة وحدها، واكتب ذلك في «ملاحظة التقسيم الطبقي». الفئة بعد التقسيم أوضح مكاناً للتحليل.",
   en:"When a large category is **a mix** of different problems, such as “materials without certificates” coming from several suppliers, or concrete rejected on the afternoon shift only. Split it by site, shift, supplier or product, draw a new chart for that category alone, and note it in the “Stratification note”. The split category is a clearer place for analysis."}},
 {id:"ba",k:["قبل","بعد","before","after","effect","أثر","تحقق","check","verify","فعالية"],q:{ar:"كيف أتحقق من الأثر بعد الإجراء؟",en:"How do I check the effect after the action?"},
  a:{ar:"اجمع البيانات مرة ثانية **للفئات نفسها، بالوحدة نفسها، ولفترة بالطول نفسه** بعد الإجراء، وأدخلها في «التحقق قبل وبعد». تحسب الأداة الفرق لكل فئة وللمجموع وللقلة الحيوية، وترسم المخططين جنباً إلى جنب، وتقترح حكماً، لكن **الحكم للفريق**. إذا اختلف طول الفترتين تنبّه الأداة ويفشل فحص «قبل وبعد على الأساس نفسه».",
   en:"Collect the data again **for the same categories, in the same unit, over a period of the same length** after the action, and enter it in “Before/after check”. The tool works out the change for each category, the total and the vital few, draws the two side by side and suggests a verdict, but **the verdict is the team's**. If the two periods differ in length the tool warns you and the check “Before/after on the same basis” fails."}},
 {id:"open",dyn:"open",k:["مفتوح","مفتوحة","متابعة","open items","follow"],q:{ar:"ما البنود المفتوحة في تحليلاتي؟",en:"What is still open in my analyses?"}},
 {id:"status",dyn:"status",k:["وضع","حالة","ملخص","status","summary","where do we stand"],q:{ar:"ما وضع تحليلاتي الآن؟",en:"Where do my analyses stand?"}}
];
var CB_SUG=["8020","pf","unit","other","status"];
function kbDyn(id){
 var u=CB[L]||CB.ar;
 if(id==="open"){ var O=openItems(); if(!O.length) return u.op0+"\n\n[[tab:dash]]"; return O.map(function(x){ return "- **"+(x.r.ref||x.r.id)+"** — "+x.s; }).join("\n")+"\n\n[[tab:docs]] · [[tab:dash]]"; }
 if(id==="status"){ var c=counts(); if(!c.n) return u.st0; return "- "+t("kTotal")+": **"+c.n+"**\n- "+t("kConf")+": **"+c.conf+"**\n- "+t("kLinked")+": **"+c.linked+"**\n- "+t("kBa")+": **"+c.ba+"**\n- "+t("kRev")+": **"+c.rev+"**\n- "+t("kOpen")+": **"+openItems().length+"**\n- "+t("kAs")+": **"+assessScore()+"%**\n\n[[tab:dash]] · [[tab:audit]]"; }
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
function renderAll(){ renderDocs(); renderAudit(); renderDash(); renderReport(); renderAssess(); renderHomeBd(); refreshForm(); }
document.getElementById("rec-form").addEventListener("submit",function(e){ e.preventDefault(); saveRecord(); });
document.getElementById("rec-form").addEventListener("input",function(e){ if(e.target.closest&&(e.target.closest("#vfBox")||e.target.closest("#nxBox")||e.target.closest("#baBox"))) readSide(); if(e.target.closest&&e.target.closest("#catRows")) autoSize(e.target); refreshForm(); });
document.getElementById("rec-form").addEventListener("change",function(){ refreshForm(); });
document.getElementById("newBtn").addEventListener("click",function(){ clearForm(); });
document.getElementById("langBtn").addEventListener("click",function(){ switchLang(); });
window.addEventListener("hashchange",function(){ var h=location.hash.slice(1); if(h!==curTab) go(h); });
window.addEventListener("storage",function(e){ if([PDCA_KEY,CAPA_KEY,FISH_KEY,WHY5_KEY,AUD_KEY].indexOf(e.key)>=0){ renderHomeBd(); var dl=document.getElementById("pdcaList"); if(dl) dl.innerHTML=fill(pdcaCycles().map(function(c){ return [c.id,c.title]; })); if(BD) bdPreview(true); sideKey=""; refreshForm(); } });

/* ---------- boot ---------- */
/* a link from Fishbone may ask to open an analysis (?open=ID); inside the hub the same request arrives as a one-time sessionStorage hint */
function navRequest(){
 var q={}; try{ var u=new URLSearchParams(location.search); if(u.get("open")) q.open=u.get("open"); }catch(e){}
 try{ var h=JSON.parse(sessionStorage.getItem(NAV_KEY)||"null"); sessionStorage.removeItem(NAV_KEY); if(h&&typeof h==="object"&&h.open) q.open=String(h.open); }catch(e){}
 return q;
}
applyLang();
(function(){
 var q=navRequest(), r=q.open?DB.records.filter(function(x){ return x.id===q.open; })[0]:null;
 if(r){ loadRecordIntoForm(r); go("tools"); return; }
 go((location.hash||"#home").slice(1));
})();
