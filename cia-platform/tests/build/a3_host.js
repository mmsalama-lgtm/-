/* ===== A3 tool — host logic. A3s and assessment are stored in this browser only (localStorage, wrapped in try/catch). =====
   Storage key "cia-a3:v1" (this tool only). Schema:
   { records: [ {
       id, title, ref, src: "rca"|"capa"|"pareto"|"ncr"|"kpi"|"audit"|"idea",
       owner (one person owns the A3), coach (coach or mentor who reviews it through questions), sponsor, area,
       start (YYYY-MM-DD, date the A3 was opened),
       rca (RCA investigation id), capa (CAPA record id), pareto (Pareto analysis id), pcat (its category id), pdca (PDCA cycle id),
       team:    [ {n, role} ]
       bg:      {why: ""|"cust"|"safety"|"cost"|"strat"|"other", text, measure}      1 Background: why it matters and the measure that shows it
       cur:     {measure, unit, base (number|null), period, chart: "bar"|"run",       2 Current condition, from facts: the measure, its baseline and
                 pts: [ {l, v (number|null)} ] (12 at most), pareto, gap}               period, up to 12 data points drawn here (or a Pareto analysis), the gap
       goal:    {measure, from, to (numbers|null), by (YYYY-MM-DD), date (date the     3 Goal: measurable, with a date; written before the analysis (date
                 goal was written), orig (number|null, the first target if changed), why}   on or before andate); a change needs a written reason (why)
       andate:  YYYY-MM-DD                                                             4 Analysis: the date the analysis of causes started
       causes:  [ {id, t, ev, how: "rca"|"fish"|"why5"|"capa"|"data"|"obs", ref, st: "hyp"|"conf"|"out"} ]   root causes with their evidence and
                                                                                        the method that found them (ref = the analysis id in the other tool)
       cms:     [ {id, cause (root cause id), t, eff, test: ""|"yes"|"part"|"plan"|"no"} ]   5 Countermeasures: each tied to a root cause, with the
                                                                                        expected effect and whether it was tested
       plan:    [ {cm (countermeasure id), what, who, when (YYYY-MM-DD), st: "todo"|"doing"|"done"} ]   6 Plan (the corrective actions of a
                                                                                        nonconformity stay in CAPA, named by id in the header)
       fu:      {measure, same: true|false, from, to (YYYY-MM-DD), value (number|null), 7 Follow-up: the same measure over a stated period, the result
                 res: ""|"met"|"part"|"not", std, open, next}                           against the goal, what is standardised, what is left open
       reviews: [ {date, by, q, a} ]                                                   coach reviews: the questions asked and what changed
       created, updated } ],
     assess: { OW1..CK3: 0|1|2 } }
   Other tools' keys are only read, never written: "cia-rca:v1" (start from an investigation, root causes, previews), "cia-capa:v1" (start
   from a CAPA record, previews), "cia-pareto:v1" (start from a vital-few category, the current-condition chart), "cia-fish:v1" and
   "cia-why5:v1" (root causes and previews) and "cia-pdca:v1" (PDCA cycle names). RCA, Fishbone, 5 Whys and Pareto open through their
   own requests (?open=, ?capa=, ?pareto=&cat= or their one-time sessionStorage hints "cia-nav:rca", "cia-nav:fishbone",
   "cia-nav:five-whys", "cia-nav:pareto"). This tool reads its own hint "cia-nav:a3" ({open} | {rca} | {capa} | {pareto, cat}) and its
   address (?open=, ?rca=, ?capa=, ?pareto=&cat=) once; none of them holds tool data. */
var LKEY="cia-lang", STORE="cia-a3:v1", RCA_KEY="cia-rca:v1", CAPA_KEY="cia-capa:v1", PARETO_KEY="cia-pareto:v1", FISH_KEY="cia-fish:v1", WHY5_KEY="cia-why5:v1", PDCA_KEY="cia-pdca:v1",
    NAV_KEY="cia-nav:a3", RCA_NAV="cia-nav:rca", FISH_NAV="cia-nav:fishbone", WHY5_NAV="cia-nav:five-whys", PARETO_NAV="cia-nav:pareto";
var L=(function(){ try{ return localStorage.getItem(LKEY)||"ar"; }catch(e){ return "ar"; } })();
var TABS=["home","explain-std","explain-cl","assess","tools","docs","audit","dash","report","ai"];
var TITLES={ar:"A3 | حل المشكلات بأسلوب A3 — مدثر سلامه",en:"A3 | A3 problem solving — مدثر سلامه"};
var STAGES=["draft","bg","cur","goal","an","cm","plan","fu","rev"];
var SCOL={draft:"#9AA5B8",bg:"#C2410C",cur:"#3563C9",goal:"#B8901E",an:"#1B2A4A",cm:"#C9821A",plan:"#7B5BB8",fu:"#1E8C93",rev:"#3C9A5F"};
var SRCS=["rca","capa","pareto","ncr","kpi","audit","idea"];
var WHYS=["cust","safety","cost","strat","other"], CHARTS=["bar","run"], HOWS=["rca","fish","why5","capa","data","obs"], CST=["hyp","conf","out"],
    TESTS=["yes","part","plan","no"], PST=["todo","doing","done"], RESS=["met","part","not"];
var RCOL={met:"#3C9A5F",part:"#C9821A",not:"#B42318",none:"#9AA5B8"};
var MAXROWS=30, MAXPTS=12;
var DB=load();
var curTab="home";
var editing=null;   /* deep copy of the A3 open in the form: keeps created between saves */
var ST=null;        /* rows of the read-only start preview */

var UI={
ar:{brand:"أكاديمية التحسين المستمر · مدثر سلامه",toolName:"أداة A3 — حل المشكلات في صفحة واحدة",sgLearn:"التعلّم",sgWork:"العمل",sgOut:"المخرجات",
 nHome:"الرئيسية",nStd:"دليل المنهجية",nCl:"دليل البنود",nAssess:"التقييم الذاتي",nTools:"صفحة A3",nDocs:"السجلات",nAudit:"التدقيق",nDash:"لوحة المؤشرات",nReport:"التقرير",nAi:"المساعد الذكي",soon:"قريباً",
 homeCode:"الخلفية · الوضع الحالي · الهدف · التحليل · الإجراءات المضادة · الخطة · المتابعة",homeH1:"حل المشكلات بأسلوب A3",
 homeLede:"قصة حل المشكلة كاملة في صفحة واحدة تُقرأ من أعلى إلى أسفل: لماذا تهم المشكلة، والوضع الحالي بالأرقام، والهدف وتاريخه، والأسباب الجذرية المثبتة، والإجراءات المضادة المرتبطة بها، والخطة، ثم التحقق من الأثر مقابل الهدف. يملك الصفحة شخص واحد، ويراجعها موجّه بالأسئلة. وتستخدم الأداة صندوق الأدوات ولا تحل محله: باريتو لتأطير الفجوة، وعظمة السمكة ولماذا الخمس وRCA للأسباب، وPDCA للدورة، وCAPA عندما توجد حالة عدم مطابقة.",
 homeNote:"النسخة الحالية تحفظ صفحات A3 في متصفحك فقط. الحفظ على الخادم وتسجيل الدخول يُضافان في مرحلة المنصة المشتركة.",
 prep:"إعداد",authorName:"مدثر سلامه",cycleT:"ما الذي تستطيع فعله هنا",cycleS:"اقرأ دليل المنهجية، ثم قيّم ممارسة A3 لديكم، ثم افتح أول صفحة من تحقيق RCA أو سجل CAPA أو فئة حيوية في باريتو أو من الصفر.",
 tStd:"ما صفحة A3، ولماذا حدّ الصفحة الواحدة انضباط في التفكير لا شكل، ولماذا يُكتب الهدف قبل معرفة الأسباب، ودور الموجّه، وكيف تستخدم A3 بقية أدوات الصندوق.",tCl:"بنود ISO 9001:2026 التي تخدمها الطريقة، من دورة PDCA في المقدمة (0.3.2) إلى الأهداف 6.2 والتحليل 9.1.3 والإجراء التصحيحي 10.2: ملخص تفسيري ومثال وما يطلبه المدقق.",tAssess:"اثنا عشر سؤالاً تقيس ممارسة A3 لديكم، من الملكية والتوجيه حتى توحيد النتيجة ومشاركة الدروس.",
 tTools:"صفحة A3 لكل مشكلة بكتلها السبع: الخلفية، والوضع الحالي برسم بياني، والهدف، والتحليل، والإجراءات المضادة، والخطة، والمتابعة، مع مراجعات الموجّه وصفحة A3 حية.",tDocs:"كل صفحات A3 بمرحلتها ونتيجتها وتنبيهاتها، وبيانات المثال.",tAudit:"فحص آلي لكل صفحة: المرجع والمالك، والموجّه، والخلفية، والوضع الحالي، والهدف وتاريخه، والأسباب، وربط الإجراءات بالأسباب واختبارها، والخطة، والمتابعة، والتوحيد، ومراجعة الموجّه.",
 tDash:"الأهداف المحققة، والإجراءات المرتبطة بأسباب مثبتة، والأهداف المكتوبة قبل التحليل، والمراحل، والنتائج، والمصادر، والبنود المفتوحة، والتقييم الذاتي، في صفحة واحدة.",tReport:"تقرير HTML يضع كل مشكلة في صفحتها الواحدة ثم تفاصيل كل كتلة، وملف CSV.",tAi:"مساعد يقرأ الصفحة ويقترح أسئلة الموجّه. لم يُفعَّل بعد.",
 foot:"المراجع: ISO 9001:2026 المقدمة 0.3.2 والبنود 6.2 و7.1.6 و7.3 و9.1.3 و10.1 و10.2 والملحق A.10.2، ومصطلحات ISO 9000:2026 ومبادئها (ملخصات تفسيرية، وليست النص الرسمي). A3 طريقة لحل المشكلات، وليست بنداً في أي مواصفة. الأمثلة توضيحية وليست بيانات حقيقية.",
 heroTag:"أداة منهجية · قصة حل المشكلة على دورة PDCA (ISO 9001:2026 المقدمة 0.3.2)",langSw:"English",langSwA:"Switch to English",logoAlt:"أكاديمية التحسين المستمر — مدثر سلامه",
 related:"أدوات مرتبطة في الأكاديمية",rel_pdca:"دورة PDCA",rel_rca:"تحليل السبب الجذري — التحقيق",rel_capa:"الإجراءات التصحيحية",rel_pareto:"باريتو — تحليل القلة الحيوية",rel_fish:"عظمة السمكة — تحليل السبب والنتيجة",rel_why5:"لماذا الخمس — تحليل السبب الجذري",
 termT:"هل A3 بند في ISO 9001:2026؟",
 termP1:"لا. A3 طريقة لحل المشكلات، وليست بنداً في أي مواصفة. هي قصة حل المشكلة كاملة في صفحة واحدة تُقرأ من أعلى إلى أسفل: الخلفية (لماذا تهم)، والوضع الحالي (وقائع وبيانات مرسومة)، والهدف (رقم وتاريخ)، وتحليل الأسباب الجذرية (أسباب مثبتة لا آراء)، والإجراءات المضادة (كل إجراء مرتبط بسبب جذري)، والخطة (من وماذا ومتى)، والمتابعة (قياس الأثر مقابل الهدف ثم التوحيد أو البدء من جديد). وتسير على دورة PDCA التي تصفها ISO 9001:2026 في المقدمة (0.3.2): الخطة تضع الأهداف والموارد وتعالج المخاطر والفرص، والتنفيذ ينفذ ما خُطط له، والتحقق يرصد ويقيس مقابل الأهداف والمتطلبات ويبلغ النتائج، والتصرف يتخذ إجراءات لتحسين الأداء. والمقدمة شرح وليست متطلبات.",
 termP2:"وفي الممارسة: حدّ الصفحة الواحدة انضباط لا شكل؛ هو ما يجبر التفكير على الوضوح. ويملك الصفحة شخص واحد، ويراجعها موجّه بالأسئلة لا بالتوقيع. ويُعرض الوضع الحالي بالوقائع (رسم أو خريطة أو أرقام) لا بالصفات. ويُكتب الهدف قبل معرفة الأسباب، ولا يُعدَّل ليناسب النتيجة. وتُختبر الإجراءات المضادة ولا تُفترض.",
 termP3:"وA3 وعاء يستخدم صندوق الأدوات ولا يحل محله: باريتو لتأطير الفجوة، وعظمة السمكة ولماذا الخمس للبحث عن الأسباب، وRCA للتحقيق الكامل، وPDCA للدورة، وCAPA عندما توجد حالة عدم مطابقة؛ فالإجراءات التصحيحية لعدم المطابقة تبقى في سجل CAPA.",
 termIs:"ملخص تفسيري بصياغة مستقلة، وليس النص الرسمي. المصادر: ISO 9001:2026 المقدمة 0.3.2 والبنود 6.2 و9.1.3 و10.2 والملحق A.10.2، وISO 9000:2026 المصطلحات المذكورة والمبدآن 4.2.6 و4.2.7. التحقق: 2026-10-16.",
 defs:[["الهدف","ISO 9000:2026 · 3.7.11","نتيجة يراد تحقيقها. ومن طرق التعبير عنه «الغاية» أو «المستهدف». لذلك يُكتب الهدف رقماً وتاريخاً.","#B8901E"],["الفعالية","ISO 9000:2026 · 3.7.17","مدى تنفيذ الأنشطة المخطط لها وتحقيق النتائج المخطط لها. المتابعة تقيسها مقابل الهدف.","#1E8C93"],["التحسين","ISO 9000:2026 · 3.2.3","نشاط لتعزيز الأداء، وقد يكون متكرراً أو منفرداً.","#3C9A5F"],["الدليل الموضوعي","ISO 9000:2026 · 3.8.6","بيانات تدعم وجود شيء أو صحته. السبب الجذري يُثبت بدليل.","#3563C9"],["القرار المبني على الدليل","ISO 9000:2026 · 4.2.7","فهم علاقات السبب والنتيجة، والوقائع والأدلة وتحليل البيانات تعطي القرار موضوعية وثقة.","#1B2A4A"]],
 asT:"التقييم الذاتي لممارسة A3",asS:"أجب عن كل سؤال بما يحدث فعلاً في صفحات A3 لديكم. النتيجة تقيس الممارسة الحالية، وليست شهادة ولا حكماً على الأداء.",asReset:"مسح الإجابات",asSaved:"تم حفظ الإجابة",asAnswered:"أُجيب {n} من 12",
 band0:"يحتاج عملاً",band1:"في طور التطوير",band2:"راسخ",bandNote:"حدود داخلية للتقييم الذاتي من تصميم هذه الأداة، وليست معياراً رسمياً.",as0:"غير موجود",as1:"جزئي",as2:"موجود ومطبّق",
 g_OW:"الملكية والتوجيه",g_PL:"الخطة: الخلفية والوضع والهدف",g_AN:"التحليل",g_DO:"الإجراءات والخطة",g_CK:"التحقق والتوحيد",
 tlT:"صفحة A3",tlS:"صفحة واحدة لكل مشكلة، تُقرأ من أعلى إلى أسفل. النصف الأول هو الخطة: الخلفية، والوضع الحالي، والهدف، والتحليل. والنصف الثاني هو التنفيذ والتحقق والتصرف: الإجراءات المضادة، والخطة، والمتابعة. تتحدد المرحلة تلقائياً مما تملؤه، وتُرسم صفحة A3 في الأسفل وأنت تكتب.",
 save:"حفظ صفحة A3",newRec:"صفحة A3 جديدة",savedFail:"تعذّر الحفظ في هذا المتصفح. نزّل التقرير قبل إغلاق الصفحة.",cur:"المرحلة الحالية:",ok_rec:"تم حفظ صفحة A3",
 st_draft:"مسودة",st_bg:"كُتبت الخلفية",st_cur:"عُرض الوضع الحالي",st_goal:"حُدد الهدف",st_an:"أُثبتت الأسباب",st_cm:"اختيرت الإجراءات المضادة",st_plan:"وُضعت الخطة",st_fu:"تحقق الأثر",st_rev:"روجعت مع الموجّه",
 hPlan:"النصف الأول · الخطة",hPlanS:"لماذا تهم المشكلة، وأين نحن الآن بالأرقام، وإلى أين نريد أن نصل، ولماذا يحدث ذلك.",hDo:"النصف الثاني · التنفيذ والتحقق والتصرف",hDoS:"ماذا سنغيّر، ومن يفعل ماذا ومتى، وهل وصلنا إلى الهدف، وما الذي نوحّده.",
 sHdrT:"بيانات الصفحة",sHdrS:"المرجع، ومالك الصفحة، والموجّه الذي يراجعها، والراعي، والفريق، والمصدر، والروابط مع أدوات الصندوق.",
 sBgT:"الخلفية: لماذا تهم المشكلة",sBgS:"فقرة قصيرة: أثر المشكلة على العميل أو السلامة أو التكلفة أو الاستراتيجية، والمقياس الذي يُظهر هذا الأثر.",
 sCurT:"الوضع الحالي: وقائع لا صفات · البند 9.1.3",sCurS:"المقياس وقيمته الأساسية وفترته، ورسم بسيط من نقاط البيانات (حتى 12 نقطة) أو تحليل باريتو تختاره برقمه، ثم الفجوة في سطر واحد.",
 sGoalT:"الهدف: رقم وتاريخ · البند 6.2",sGoalS:"المقياس، والقيمة من وإلى، والموعد. يُكتب الهدف قبل معرفة الأسباب، ولا يُغيَّر إلا بسبب مكتوب.",
 sAnT:"التحليل: أسباب جذرية مثبتة · البند 10.2.1 ب) 2)",sAnS:"كل سبب جذري بدليله والطريقة التي وجدته. اختره من تحقيق RCA أو تحليل عظمة السمكة أو لماذا الخمس برقمه، أو اكتبه هنا.",
 sCmT:"الإجراءات المضادة",sCmS:"كل إجراء مضاد مرتبط بسبب جذري مثبت، مع الأثر المتوقع، وهل اختُبر على نطاق صغير قبل تعميمه.",
 sPlanT:"الخطة: من يفعل ماذا ومتى · البند 6.2.2",sPlanS:"سطر واحد على الأقل لكل إجراء مضاد: ماذا، ومن، ومتى، والحالة. الإجراءات التصحيحية لحالة عدم المطابقة تبقى في سجل CAPA المذكور في بيانات الصفحة.",
 sFuT:"المتابعة: الأثر مقابل الهدف · البند 10.2.1 د)",sFuS:"المقياس نفسه بالطريقة نفسها، لفترة محددة، والنتيجة مقابل الهدف، ثم ما وُحّد وما بقي مفتوحاً لصفحة A3 تالية أو دورة PDCA.",
 sRevT:"مراجعات الموجّه",sRevS:"الموجّه يراجع بالأسئلة لا بالموافقة: ما الأسئلة التي طُرحت، وما الذي تغيّر في الصفحة بعدها.",
 sPageT:"صفحة A3",sPageS:"تُرسم مما أدخلته، بنسبة صفحة A3 أفقية، والكتل السبع في نصفين. على الهاتف تظهر الكتل واحدة تحت الأخرى بالترتيب نفسه. الصفحة نفسها تدخل التقرير.",
 f_title:"عنوان المشكلة",f_ref:"رقم المرجع (إن وُجد)",f_src:"المصدر",f_owner:"مالك الصفحة (شخص واحد)",f_coach:"الموجّه",f_sponsor:"الراعي",f_start:"تاريخ فتح الصفحة",f_area:"العملية أو الموقع",
 f_rca:"تحقيق RCA المرتبط",f_capa:"سجل CAPA المرتبط",f_pareto:"تحليل باريتو المرتبط",f_pcat:"الفئة في باريتو",f_pdca:"دورة PDCA المرتبطة",
 f_why:"لماذا تهم",f_bgtext:"الخلفية في فقرة قصيرة",f_bgmeasure:"المقياس الذي يُظهر الأثر",
 f_cmeasure:"المقياس",f_cunit:"الوحدة",f_cbase:"القيمة الأساسية",f_cperiod:"الفترة",f_cchart:"نوع الرسم",f_cpareto:"أو تحليل باريتو للرسم",f_cgap:"الفجوة في سطر واحد",
 f_gmeasure:"مقياس الهدف",f_gfrom:"من",f_gto:"إلى",f_gby:"الموعد",f_gdate:"تاريخ كتابة الهدف",f_gorig:"الهدف الأول (إن عُدّل)",f_gwhy:"سبب تعديل الهدف",
 f_andate:"تاريخ بدء تحليل الأسباب",
 f_fmeasure:"المقياس في المتابعة",f_fsame:"المقياس نفسه وبالطريقة نفسها التي قيست بها القيمة الأساسية",f_ffrom:"المتابعة من",f_fto:"إلى",f_fvalue:"القيمة بعد الإجراءات",f_fres:"النتيجة مقابل الهدف",f_fstd:"ما الذي وُحّد",f_fopen:"ما بقي مفتوحاً",f_fnext:"الخطوة التالية (صفحة A3 أو دورة PDCA)",
 src_rca:"تحقيق RCA",src_capa:"سجل CAPA",src_pareto:"فئة حيوية في باريتو",src_ncr:"تقرير عدم مطابقة (NCR)",src_kpi:"مؤشر أداء",src_audit:"ملاحظة تدقيق",src_idea:"فكرة تحسين",
 why_:"— اختر —",why_cust:"العميل",why_safety:"السلامة",why_cost:"التكلفة",why_strat:"الاستراتيجية",why_other:"أخرى",
 ch_bar:"أعمدة",ch_run:"خط زمني",
 ptL:"النقطة (فترة أو مجموعة)",ptV:"القيمة",ptAdd:"إضافة نقطة",ptNone:"لا نقاط بيانات بعد.",ptMax:"12 نقطة على الأكثر.",
 chEmpty:"أدخل نقطتي بيانات على الأقل، أو اختر تحليل باريتو، ليظهر الرسم.",chTarget:"الهدف",chBase:"الأساس",chResult:"بعد الإجراءات",chFrom:"من تحليل باريتو {id}",
 gapHint:"الفجوة المحسوبة: {d} {u} (من {f} إلى {to}).",
 goalRule:"القاعدة: يُكتب الهدف قبل أن تُعرف الأسباب، أي أن تاريخ كتابته لا يأتي بعد تاريخ بدء التحليل، ولا يُعدَّل ليناسب النتيجة. إن عُدّل لسبب حقيقي، يبقى الهدف الأول مكتوباً ومعه سبب التعديل.",
 lateW:"كُتب الهدف بعد بدء تحليل الأسباب. الهدف يُكتب قبل معرفة الأسباب، وإلا صار يُكيَّف مع ما وجدناه.",chgW:"عُدّل الهدف دون سبب مكتوب. اكتب السبب، وإلا فالتدقيق يسجله ثغرة.",dirDown:"المطلوب خفض القيمة",dirUp:"المطلوب رفع القيمة",
 tmN:"الاسم",tmRole:"الدور",tmAdd:"إضافة عضو",tmDel:"حذف",tmNone:"لم يُضف أحد بعد.",coachW:"الموجّه هو المالك نفسه. الموجّه شخص آخر يراجع الصفحة بالأسئلة.",
 pkT:"اختر الأسباب من أداة أخرى (قراءة فقط)",pkHow:"الأداة",pkRef:"رقم التحليل",pkUse:"استخدم أسبابه الجذرية",pk_rca:"تحقيق RCA",pk_fish:"عظمة السمكة",pk_why5:"لماذا الخمس",
 pkStart:"ابدأ في أداة أخرى:",stRca:"ابدأ تحقيق RCA",stFish:"ابدأ تحليل عظمة سمكة",stWhy5:"ابدأ تحليل لماذا الخمس",pkHub:"داخل المنصة تُفتح الأداة الأخرى مكان هذه الأداة: احفظ الصفحة أولاً.",
 pkAdded:"أُضيف {n} سبب جذري من {id}. راجع الدليل والحالة ثم احفظ. لم يُكتب أي شيء في الأداة الأخرى.",pkNone:"لا يوجد في هذا التحليل سبب جذري مكتوب بعد.",pkDup:"الأسباب الجذرية في هذا التحليل موجودة في الصفحة.",
 pkEvFish:"تحقق في عظمة السمكة {id} ({st})",pkEvWhy5:"اختُبر في لماذا الخمس {id} ({st})",
 czCode:"الرمز",czT:"السبب الجذري",czEv:"الدليل",czHow:"الطريقة التي وجدته",czRef:"رقم التحليل",czSt:"الحالة",czDel:"حذف السبب",czAdd:"إضافة سبب جذري",czNone:"لا أسباب بعد.",
 how_:"— اختر —",how_rca:"تحقيق RCA",how_fish:"عظمة السمكة",how_why5:"لماذا الخمس",how_capa:"كما كُتب في CAPA",how_data:"تحليل بيانات",how_obs:"ملاحظة في الموقع (هنا)",
 cs_hyp:"فرضية",cs_conf:"مثبت بالدليل",cs_out:"مستبعد",personF:"يشير إلى شخص فقط. اسأل: ما الذي في العملية سمح بذلك؟",noEv:"دليل مطلوب للإثبات.",
 personW:"سبب أو أكثر يشير إلى شخص فقط («خطأ بشري» أو «إهمال»). الخطأ البشري نقطة بداية للسؤال: ما الذي في العملية سمح به؟ ثم أعد كتابة السبب بحيث تستطيع المنشأة تغييره.",
 czSum:"{p} مثبت · {h} فرضية · {o} مستبعد",
 cmCode:"الرمز",cmCause:"السبب الجذري",cmT:"الإجراء المضاد",cmEff:"الأثر المتوقع",cmTest:"هل اختُبر؟",cmAdd:"إضافة إجراء مضاد",cmNone:"لا إجراءات مضادة بعد.",cmDel:"حذف الإجراء",
 ts_:"— اختر —",ts_yes:"اختُبر ونجح",ts_part:"اختُبر ونجح جزئياً",ts_plan:"الاختبار مخطط",ts_no:"لم يُختبر",
 untiedF:"غير مرتبط بسبب جذري مثبت.",untestF:"لم يُختبر: الإجراء المضاد يُختبر ولا يُفترض.",untreatW:"سبب جذري مثبت دون إجراء مضاد: {c}",
 plCm:"الإجراء المضاد",plWhat:"ماذا",plWho:"من",plWhen:"متى",plSt:"الحالة",plAdd:"إضافة سطر",plNone:"لا خطة بعد.",ps_todo:"لم يبدأ",ps_doing:"قيد التنفيذ",ps_done:"تم",
 planW:"إجراء مضاد دون سطر في الخطة بمسؤول وتاريخ: {c}",capaN:"توجد حالة عدم مطابقة؟ الإجراءات التصحيحية ومتابعتها تكون في سجل CAPA. اكتب رقمه في بيانات الصفحة.",
 fuSugg:"النتيجة المحسوبة من القيم: {r}",fuNoSugg:"أدخل الهدف (من وإلى) وقيمة المتابعة لتظهر النتيجة المحسوبة.",res_:"— اختر —",res_met:"تحقق الهدف",res_part:"تحقق جزئياً",res_not:"لم يتحقق",
 sameW:"مقياس المتابعة يختلف عن مقياس الهدف. قارن الشيء نفسه بالطريقة نفسها.",stdW:"اكتب ما الذي وُحّد (إجراء، نموذج، تدريب، عقد)، أو ما بقي مفتوحاً إن لم يتحقق الهدف.",
 rvDate:"التاريخ",rvBy:"الموجّه",rvQ:"الأسئلة التي طُرحت",rvA:"ما الذي تغيّر بعدها",rvAdd:"إضافة مراجعة",rvNone:"لا مراجعات بعد.",rvOwnW:"المراجعة مسجلة باسم المالك. مراجعة الموجّه يجريها شخص آخر.",
 pgOwner:"المالك",pgCoach:"الموجّه",pgSponsor:"الراعي",pgStart:"فُتحت",pgStage:"المرحلة",pgNo:"لم يُكتب بعد",pgMeasure:"المقياس",pgBase:"الأساس",pgGap:"الفجوة",pgBy:"بحلول",pgWritten:"كُتب في",pgOrig:"الهدف الأول",pgFu:"المتابعة",pgStd:"وُحّد",pgOpen:"مفتوح",pgNext:"التالي",pgLast:"آخر مراجعة",
 pgGoal:"من {f} إلى {to} {u} بحلول {by}",
 cpOpen:"افتح PDCA",pdFound:"دورة PDCA: {t}",pdMiss:"لم يُعثر على هذه الدورة في أداة PDCA على هذا المتصفح.",pdHint:"اكتب رقم الدورة، مثل PD-EX-03، إن وُجدت.",pdOpen:"افتح PDCA",
 caHint:"اكتب رقم سجل CAPA، مثل CA-EX-04، إن وُجد.",caMiss:"لم يُعثر على هذا السجل في أداة CAPA على هذا المتصفح.",caOpen:"افتح CAPA",
 rcHint:"اكتب رقم تحقيق RCA، مثل RC-EX-01، إن وُجد.",rcMiss:"لم يُعثر على هذا التحقيق في أداة RCA على هذا المتصفح.",rcOpen:"افتح RCA",
 paHint:"اكتب رقم تحليل باريتو، مثل PA-EX-02، إن وُجد.",paMiss:"لم يُعثر على هذا التحليل في أداة باريتو على هذا المتصفح.",paOpen:"افتح باريتو",pcat_:"— اختر الفئة —",
 pvCapa:"{id} · {ref} · {st} · {t}",pvRca:"{id} · {st} · الأسباب الجذرية: {t}",pvFish:"{id} · {st} · السبب الجذري: {t}",pvWhy5:"{id} · {st} · السبب الجذري: {t}",pvPareto:"{id} · {st} · القلة الحيوية: {t}",pvNo:"لم يُكتب بعد",
 pvCat:"{c}: {v} {u} من {tot} ({s}%) · الفترة {f} → {to}{vf}",pvVf:" · في القلة الحيوية",pvCrit:"معيار الفعالية في التحقيق: {t}",
 nxMiss:"هذا الرقم غير موجود في الأداة الأخرى على هذا المتصفح.",nxNoData:"لا توجد بيانات في هذه الأداة على هذا المتصفح بعد.",
 cst_react:"التفاعل",cst_cause:"تحليل السبب",cst_action:"الإجراء",cst_verify:"التحقق من الفعالية",cst_closed:"مغلق",cst_reopened:"أعيد فتحه",
 rst_problem:"المشكلة",rst_evidence:"جُمعت الوقائع",rst_causes:"حُددت الأسباب",rst_root:"تأكد السبب الجذري",rst_actions:"اقتُرحت الإجراءات",rst_reviewed:"روجع التحقيق",
 pst_question:"السؤال",pst_data:"البيانات",pst_vital:"القلة الحيوية",pst_acted:"الخطوات التالية",pst_checked:"تحقق الأثر",pst_reviewed:"روجع التحليل",
 fst_effect:"تعريف الأثر",fst_causes:"رسم الأسباب",fst_selected:"اختيار الأسباب",fst_verified:"تحقق السبب الجذري",fst_reviewed:"روجع التحليل",
 w5st_problem:"تعريف المشكلة",w5st_chain:"سلسلة لماذا",w5st_root:"السبب الجذري",w5st_tested:"اختُبر السبب",w5st_reviewed:"روجع التحليل",
 pu_count:"",pu_cost:"ريال",pu_hours:"ساعة",pu_sev:"نقطة",
 stT:"ابدأ من تحقيق RCA أو سجل CAPA أو فئة حيوية في باريتو (قراءة فقط)",stS:"تقرأ الأداة ما حُفظ في هذا المتصفح من تحقيقات RCA أو سجلات CAPA أو تحليلات باريتو وتعرضه للمعاينة. اختر بنداً لتعبئة صفحة A3 جديدة غير محفوظة. لا يُكتب أي شيء في الأدوات الأخرى، والهدف تكتبه أنت بتاريخه.",
 stSrc:"المصدر",stPrev:"اعرض المعاينة",ss_rca:"تحقيقات RCA",ss_capa:"سجلات CAPA",ss_pareto:"الفئات الحيوية في باريتو",stUse:"افتح صفحة A3 منه",
 stNone:"لا توجد بيانات من هذا المصدر في هذا المتصفح.",stEmpty:"لا توجد بنود يمكن البدء منها في هذا المصدر.",
 stColId:"الرقم",stColT:"المرجع والعنوان",stColSt:"المرحلة",stColRoot:"الأسباب الجذرية",stColCrit:"معيار الفعالية",stColN:"صفحات A3 قائمة",stColA:"إجراء",stColCat:"الفئة",stColV:"القيمة والنسبة",stColPer:"الفترة",
 stUsedR:"عُبّئت صفحة A3 جديدة من تحقيق RCA ‏{id}. اكتب الوضع الحالي بالأرقام والهدف بتاريخه، ثم احفظ. لم يُكتب أي شيء في RCA.",stUsedC:"عُبّئت صفحة A3 جديدة من سجل CAPA ‏{id}. اكتب الوضع الحالي بالأرقام والهدف بتاريخه، ثم احفظ. لم يُكتب أي شيء في CAPA.",stUsedP:"عُبّئت صفحة A3 جديدة من الفئة «{c}» في تحليل باريتو {id}. اكتب الهدف بتاريخه، ثم احفظ. لم يُكتب أي شيء في باريتو.",
 pfBgR:"المتطلب الذي لم يُستوفَ: {req}. الحجم: {much}",pfCritR:"معيار الفعالية في التحقيق {id}: {t}. اكتب هدف الصفحة بنفسك بتاريخ اليوم.",pfCurP:"{c} في تحليل باريتو {id}",
 hmT:"في هذا المتصفح ما يمكن البدء منه: {r} تحقيق RCA، و{c} سجل CAPA مفتوح، و{p} فئة حيوية في باريتو.",hmGo:"افتح صفحة A3",
 e_title:"أدخل عنواناً مختصراً للمشكلة.",e_num:"القيم الرقمية يجب أن تكون أرقاماً.",e_fdate:"بداية فترة المتابعة لا تأتي بعد نهايتها.",e_rdate:"تاريخ مراجعة الموجّه لا يسبق تاريخ فتح الصفحة.",
 exT:"بيانات المثال",exS:"ثلاث صفحات A3 توضيحية لشركة سعودية افتراضية (شركة الواحة للمقاولات): رفض شحنات الخرسانة الجاهزة (من تحقيق RCA ‏RC-EX-01 وباريتو PA-EX-02 وCAPA ‏CA-EX-04؛ الهدف أقل من 3% من الشحنات، والمتابعة في يوليو وأغسطس 6% فتحقق جزئياً، والدورة الثانية في PDCA ‏PD-EX-03)، والحوادث الوشيكة في رفع الحزم (من RC-EX-02، والإجراءات اختُبرت في برج واحد قبل البقية، والمتابعة جارية)، وصفحة قصيرة لضبط الوثائق (CA-EX-03، الهدف تحقق ووُحّد)، مع إجابات للتقييم الذاتي. البيانات توضيحية وليست حقيقية، وتحميلها يستبدل كل بيانات هذه الأداة في متصفحك.",
 exLoad:"تحميل المثال",exClear:"مسح كل البيانات",exLoaded:"تم تحميل المثال: 3 صفحات A3 وإجابات التقييم الذاتي.",exCleared:"تم مسح كل بيانات الأداة من هذا المتصفح.",
 exConfirmClear:"سيحذف هذا كل صفحات A3 وإجابات التقييم الذاتي من هذا المتصفح، ولا يمكن التراجع عن ذلك.\n\nهل تريد المتابعة؟",
 dT:"صفحات A3",dS:"كل صفحة بمرحلتها ونتيجتها وتنبيهاتها. افتح الصفحة لتعديلها في «صفحة A3».",csv:"تصدير CSV",none:"لا توجد صفحات A3 بعد. ابدأ من «صفحة A3» أو حمّل المثال.",
 colRef:"المرجع والعنوان",colOwn:"المالك والموجّه",colStage:"المرحلة",colGoal:"الهدف",colRes:"النتيجة",colCz:"الأسباب",colFlags:"تنبيهات",colAct:"إجراءات",open:"فتح",del:"حذف",delArm:"تأكيد الحذف",
 czN:"{p} مثبت من {n}",resPend:"لم يُتحقق بعد",
 fl_owner:"لا مالك",fl_coach:"لا موجّه",fl_coachOwn:"الموجّه هو المالك",fl_bg:"الخلفية أو مقياسها ناقص",fl_cur:"الوضع الحالي ناقص",fl_goal:"الهدف ليس رقماً بتاريخ",fl_late:"الهدف كُتب بعد التحليل",fl_chg:"الهدف عُدّل دون سبب",fl_cause:"لا سبب جذري مثبت",fl_hyp:"فرضيات لم تُثبت: {n}",fl_person:"سبب يشير إلى شخص فقط",
 fl_untied:"إجراءات غير مرتبطة بسبب مثبت: {n}",fl_untreat:"سبب مثبت دون إجراء: {n}",fl_untested:"إجراءات لم تُختبر: {n}",fl_plan:"إجراء دون مسؤول وتاريخ: {n}",fl_capa:"لم يُربط بسجل CAPA",fl_fu:"تنتظر المتابعة",fl_same:"المقياس لم يُؤكد أنه نفسه",fl_std:"لم يُكتب ما وُحّد",fl_next:"الهدف لم يتحقق ولا خطوة تالية",fl_rev:"تنتظر مراجعة الموجّه",fl_revOwn:"مراجعة باسم المالك",
 auT:"التدقيق الآلي لصفحات A3",auS:"هذه الفحوص تُطبَّق على كل صفحة وتُظهر الثغرات التي يلاحظها المدقق أو الموجّه عادةً. الخانة «—» تعني أن الفحص لا ينطبق بعد على مرحلة الصفحة.",
 auRec:"صفحات مُدقّقة",auPass:"فحوص ناجحة",auFail:"صفحات بها ثغرات",auOpen:"بنود مفتوحة",auEmpty:"لا توجد صفحات لتدقيقها.",
 c_ref:"مرجع ومالك",c_coach:"موجّه غير المالك",c_bg:"خلفية بمقياس",c_cur:"وضع حالي بأساس وفترة وبيانات",c_goal:"هدف رقمي بتاريخ كُتب قبل التحليل",c_cause:"سبب جذري مثبت ولا سبب يشير إلى شخص",c_tie:"كل إجراء مرتبط بسبب جذري",c_test:"كل إجراء اختُبر أو خُطط اختباره",c_plan:"سطر خطة بمسؤول وتاريخ لكل إجراء",c_fu:"متابعة بالمقياس نفسه لفترة محددة ونتيجة",c_std:"ما وُحّد مكتوب",c_rev:"مراجعة موجّه مؤرخة",
 dashT:"لوحة المؤشرات",dashS:"أرقام تُحسب من صفحات A3 والتقييم في هذا المتصفح.",kTotal:"إجمالي صفحات A3",kMet:"تحقق هدفها كلياً أو جزئياً في المتابعة",kTie:"كل إجراءاتها مرتبطة بسبب مثبت",kBefore:"هدف كُتب قبل التحليل",kRev:"روجعت مع الموجّه بعد المتابعة",kRca:"مربوطة بتحقيق RCA",kPerson:"أسباب تشير إلى شخص",kOpen:"بنود مفتوحة",kAud:"نجاح التدقيق",kAs:"التقييم الذاتي",
 byStage:"توزيع المراحل",byRes:"النتيجة مقابل الهدف",bySrc:"مصدر المشكلة",byAssess:"التقييم الذاتي حسب المرحلة",openT:"بنود تحتاج متابعة",noOpen:"لا توجد بنود مفتوحة.",noData:"لا توجد بيانات بعد.",
 oi_owner:"لم يُحدد مالك واحد للصفحة",oi_coach:"لم يُحدد موجّه يراجع الصفحة",oi_coachOwn:"الموجّه هو المالك نفسه",oi_bg:"الخلفية أو المقياس الذي يُظهر الأثر لم يُكتب",oi_cur:"الوضع الحالي بلا قيمة أساسية أو فترة أو بيانات أو فجوة",oi_goal:"الهدف لم يُكتب رقماً من وإلى بموعد وتاريخ كتابة",oi_late:"الهدف كُتب بعد بدء تحليل الأسباب",oi_chg:"الهدف عُدّل دون سبب مكتوب",
 oi_cause:"لا يوجد سبب جذري مثبت بدليل",oi_hyp:"{n} سبب ما زال فرضية",oi_person:"سبب يشير إلى شخص فقط: اسأل ما الذي في العملية سمح به",oi_untied:"{n} إجراء مضاد غير مرتبط بسبب جذري مثبت",oi_untreat:"{n} سبب جذري مثبت دون إجراء مضاد",oi_untested:"{n} إجراء مضاد لم يُختبر",oi_plan:"{n} إجراء مضاد دون سطر خطة بمسؤول وتاريخ",
 oi_capa:"المشكلة من حالة عدم مطابقة ولم يُربط سجل CAPA",oi_fu:"تنتظر فترة المتابعة ونتيجتها",oi_same:"لم يُؤكد أن مقياس المتابعة هو نفسه مقياس الأساس",oi_std:"لم يُكتب ما الذي وُحّد",oi_next:"الهدف لم يتحقق ولم تُكتب خطوة تالية",oi_rev:"تنتظر مراجعة الموجّه بعد المتابعة",oi_revOwn:"مراجعة مسجلة باسم المالك",
 rpT:"تقرير صفحات A3",rpS:"تقرير HTML يُنزَّل إلى جهازك ويُطبع أو يُحفظ PDF من المتصفح؛ كل مشكلة في صفحتها الواحدة ثم تفاصيل كتلها. وCSV لتحليل البيانات في جدول.",rpHtml:"تنزيل تقرير HTML",rpNote:"التقرير يحمل اسم المُعِد «مدثر سلامه» ويتضمن الغلاف والملخص، وكل مشكلة في صفحة A3 الخاصة بها، ثم تفاصيل كل كتلة، ونتائج التدقيق، والبنود المفتوحة، والتقييم الذاتي.",rpPrev:"معاينة سريعة",rpEmpty:"لا توجد صفحات للتصدير بعد.",
 rpCover:"تقرير صفحات A3 لحل المشكلات",rpSheets:"الصفحات",rpDetail:"تفاصيل الكتل",rpAu:"نتيجة التدقيق",
 aiT:"المساعد الذكي — قيد البناء",aiS:"سيقرأ هذا المساعد صفحة A3 ويقترح أسئلة الموجّه، وينبّه إلى الهدف المكتوب بعد الأسباب والإجراءات غير المرتبطة بسبب. لن يعمل قبل تهيئة محرك المنصة المشتركة، ولن يُظهر نتائج مزيّفة.",
 aiList:["اقتراح أسئلة الموجّه لكل كتلة","التنبيه إلى وضع حالي مكتوب بالصفات لا بالأرقام","مقارنة الصفحة بصفحات سابقة لمشكلات مشابهة"],
 yes:"نعم",no:"لا"},
en:{brand:"Continual Improvement Academy · مدثر سلامه",toolName:"A3 tool — problem solving on one page",sgLearn:"Learn",sgWork:"Work",sgOut:"Output",
 nHome:"Home",nStd:"Method guide",nCl:"Clause guide",nAssess:"Self-assessment",nTools:"A3 sheet",nDocs:"Records",nAudit:"Audit",nDash:"Dashboard",nReport:"Report",nAi:"AI Assistant",soon:"Soon",
 homeCode:"Background · Current condition · Goal · Analysis · Countermeasures · Plan · Follow-up",homeH1:"A3 problem solving",
 homeLede:"The whole problem-solving story on one page, read top to bottom: why the problem matters, the current condition in numbers, the goal and its date, the proved root causes, the countermeasures tied to them, the plan, then the effect checked against the goal. One person owns the page and a coach reviews it through questions. The tool uses the toolbox rather than replacing it: Pareto to frame the gap, Fishbone, 5 Whys and RCA for the causes, PDCA for the cycle, and CAPA when a nonconformity is involved.",
 homeNote:"This version keeps A3s in your browser only. Server storage and sign-in come with the shared platform phase.",
 prep:"Prepared by",authorName:"مدثر سلامه",cycleT:"What you can do here",cycleS:"Read the method guide, assess your A3 practice, then open your first A3 from an RCA investigation, a CAPA record, a Pareto vital-few category or from scratch.",
 tStd:"What an A3 is, why the one-page limit is a discipline of thinking rather than a format, why the goal is written before the causes are known, the coach's role, and how an A3 uses the other toolbox tools.",tCl:"The ISO 9001:2026 clauses the method serves, from the PDCA cycle in the introduction (0.3.2) to objectives 6.2, analysis 9.1.3 and corrective action 10.2: interpretive summary, example and what the auditor asks for.",tAssess:"Twelve questions on your A3 practice, from ownership and coaching to standardising the result and sharing the lessons.",
 tTools:"One A3 per problem in its seven blocks: background, current condition with a chart, goal, analysis, countermeasures, plan and follow-up, with the coach's reviews and a live A3 page.",tDocs:"Every A3 with its stage, result and flags, and the example data.",tAudit:"Automatic check of each A3: reference and owner, coach, background, current condition, the goal and its date, causes, countermeasures tied to causes and tested, plan, follow-up, standardisation and the coach's review.",
 tDash:"Goals met, countermeasures tied to proved causes, goals written before the analysis, stages, results, sources, open items and the self-assessment on one page.",tReport:"HTML report that puts each problem on its own one-page sheet, then the detail of each block, and a CSV file.",tAi:"An assistant that reads the page and suggests the coach's questions. Not active yet.",
 foot:"References: ISO 9001:2026 introduction 0.3.2 and clauses 6.2, 7.1.6, 7.3, 9.1.3, 10.1 and 10.2 and Annex A.10.2, and ISO 9000:2026 terms and principles (interpretive summaries, not the official text). A3 is a problem-solving method, not a clause of any standard. Examples are illustrative, not real data.",
 heroTag:"Method tool · The problem-solving story on the PDCA cycle (ISO 9001:2026 introduction 0.3.2)",langSw:"العربية",langSwA:"التبديل إلى العربية",logoAlt:"Continual Improvement Academy — مدثر سلامه",
 related:"Related Academy tools",rel_pdca:"PDCA cycle",rel_rca:"Root cause analysis — investigation",rel_capa:"Corrective action",rel_pareto:"Pareto — vital few analysis",rel_fish:"Fishbone — cause and effect analysis",rel_why5:"5 Whys — root cause analysis",
 termT:"Is A3 a clause of ISO 9001:2026?",
 termP1:"No. A3 is a problem-solving method, not a clause of any standard. It is the whole problem-solving story on one page, read top to bottom: background (why it matters), current condition (facts and data, drawn), goal (a number and a date), root cause analysis (proved causes, not opinions), countermeasures (each tied to a root cause), plan (who, what, when) and follow-up (the effect checked against the goal, then standardise or start again). It runs on the PDCA cycle that ISO 9001:2026 describes in its introduction (0.3.2): Plan sets the objectives and resources and addresses risks and opportunities, Do implements what was planned, Check monitors and measures against objectives and requirements and reports the results, and Act takes actions to improve performance. The introduction explains; it does not set requirements.",
 termP2:"In practice: the one-page limit is a discipline, not a format; it is what forces the thinking to be clear. One person owns the page, and a coach or mentor reviews it through questions, not approvals. The current condition is shown with facts (a chart, a map, numbers), not adjectives. The goal is written before the causes are known and is not changed to fit the result. Countermeasures are tested, not assumed.",
 termP3:"And an A3 is a container that uses the toolbox rather than replacing it: Pareto to frame the gap, Fishbone and 5 Whys to find the causes, RCA for a full investigation, PDCA for the cycle, and CAPA when a nonconformity is involved; the corrective actions of a nonconformity stay in the CAPA record.",
 termIs:"Interpretive summary in independent wording, not the official text. Sources: ISO 9001:2026 introduction 0.3.2, clauses 6.2, 9.1.3 and 10.2 and Annex A.10.2, and ISO 9000:2026, the terms named here and principles 4.2.6 and 4.2.7. Verified: 2026-10-16.",
 defs:[["Objective","ISO 9000:2026 · 3.7.11","A result to be achieved. It can also be called an aim, a goal or a target. That is why the goal is written as a number and a date.","#B8901E"],["Effectiveness","ISO 9000:2026 · 3.7.17","The extent to which planned activities are realized and planned results are achieved. The follow-up measures it against the goal.","#1E8C93"],["Improvement","ISO 9000:2026 · 3.2.3","An activity to enhance performance; it can be recurring or singular.","#3C9A5F"],["Objective evidence","ISO 9000:2026 · 3.8.6","Data supporting the existence or truth of something. A root cause is proved with it.","#3563C9"],["Evidence-based decision-making","ISO 9000:2026 · 4.2.7","Understanding cause and effect; facts, evidence and data analysis give decisions objectivity and confidence.","#1B2A4A"]],
 asT:"Self-assessment of your A3 practice",asS:"Answer each question with what actually happens in your A3s. The score measures current practice; it is not a certificate or a performance rating.",asReset:"Clear answers",asSaved:"Answer saved",asAnswered:"{n} of 12 answered",
 band0:"Needs work",band1:"Developing",band2:"Established",bandNote:"Internal bands for this self-assessment, designed in this tool; not an official scale.",as0:"Not in place",as1:"Partly",as2:"In place and applied",
 g_OW:"Ownership and coaching",g_PL:"Plan: background, condition, goal",g_AN:"Analysis",g_DO:"Countermeasures and plan",g_CK:"Check and standardise",
 tlT:"A3 sheet",tlS:"One page per problem, read top to bottom. The first half is the Plan: background, current condition, goal and analysis. The second half is Do, Check and Act: countermeasures, plan and follow-up. The stage is set automatically from what you fill in, and the A3 page is drawn below as you type.",
 save:"Save A3",newRec:"New A3",savedFail:"Could not save in this browser. Download the report before closing the page.",cur:"Current stage:",ok_rec:"A3 saved",
 st_draft:"Draft",st_bg:"Background written",st_cur:"Current condition shown",st_goal:"Goal set",st_an:"Causes proved",st_cm:"Countermeasures chosen",st_plan:"Plan set",st_fu:"Effect checked",st_rev:"Reviewed with the coach",
 hPlan:"First half · Plan",hPlanS:"Why the problem matters, where we are now in numbers, where we want to be, and why it happens.",hDo:"Second half · Do, Check, Act",hDoS:"What we will change, who does what and when, whether we reached the goal, and what we standardise.",
 sHdrT:"About this A3",sHdrS:"Reference, the owner of the page, the coach who reviews it, the sponsor, the team, the source and the links to the toolbox tools.",
 sBgT:"Background: why it matters",sBgS:"A short paragraph: the effect of the problem on the customer, safety, cost or strategy, and the measure that shows it.",
 sCurT:"Current condition: facts, not adjectives · clause 9.1.3",sCurS:"The measure, its baseline value and period, a simple chart from the data points (12 at most) or a Pareto analysis picked by id, then the gap in one line.",
 sGoalT:"Goal: a number and a date · clause 6.2",sGoalS:"The measure, the value from and to, and by when. The goal is written before the causes are known and changed only with a written reason.",
 sAnT:"Analysis: proved root causes · clause 10.2.1 b) 2)",sAnS:"Each root cause with its evidence and the method that found it. Pick it from an RCA investigation, a Fishbone or a 5 Whys analysis by id, or write it here.",
 sCmT:"Countermeasures",sCmS:"Each countermeasure tied to a proved root cause, with the expected effect, and whether it was tested on a small scale before it is rolled out.",
 sPlanT:"Plan: who does what, and when · clause 6.2.2",sPlanS:"At least one line per countermeasure: what, who, when and status. The corrective actions of a nonconformity stay in the CAPA record named in the header.",
 sFuT:"Follow-up: the effect against the goal · clause 10.2.1 d)",sFuS:"The same measure, measured the same way, over a stated period, and the result against the goal; then what is standardised and what is left open for a next A3 or PDCA cycle.",
 sRevT:"Coach reviews",sRevS:"The coach reviews through questions, not approvals: which questions were asked, and what changed on the page afterwards.",
 sPageT:"The A3 page",sPageS:"Drawn from what you entered, in A3 landscape proportions, the seven blocks in two halves. On a phone the blocks stack in the same order. The same page goes into the report.",
 f_title:"Problem title",f_ref:"Reference (if any)",f_src:"Source",f_owner:"Owner of the A3 (one person)",f_coach:"Coach or mentor",f_sponsor:"Sponsor",f_start:"Date the A3 was opened",f_area:"Process or site",
 f_rca:"Linked RCA investigation",f_capa:"Linked CAPA record",f_pareto:"Linked Pareto analysis",f_pcat:"Category in Pareto",f_pdca:"Linked PDCA cycle",
 f_why:"Why it matters",f_bgtext:"Background in a short paragraph",f_bgmeasure:"The measure that shows the effect",
 f_cmeasure:"Measure",f_cunit:"Unit",f_cbase:"Baseline value",f_cperiod:"Period",f_cchart:"Chart type",f_cpareto:"Or a Pareto analysis for the chart",f_cgap:"The gap in one line",
 f_gmeasure:"Goal measure",f_gfrom:"From",f_gto:"To",f_gby:"By",f_gdate:"Date the goal was written",f_gorig:"First target (if changed)",f_gwhy:"Reason the goal was changed",
 f_andate:"Date the analysis of causes started",
 f_fmeasure:"Measure in the follow-up",f_fsame:"The same measure, measured the same way as the baseline",f_ffrom:"Follow-up from",f_fto:"To",f_fvalue:"Value after the countermeasures",f_fres:"Result against the goal",f_fstd:"What is standardised",f_fopen:"What is left open",f_fnext:"Next step (an A3 or a PDCA cycle)",
 src_rca:"RCA investigation",src_capa:"CAPA record",src_pareto:"Pareto vital-few category",src_ncr:"Nonconformity report (NCR)",src_kpi:"KPI",src_audit:"Audit finding",src_idea:"Improvement idea",
 why_:"— choose —",why_cust:"Customer",why_safety:"Safety",why_cost:"Cost",why_strat:"Strategy",why_other:"Other",
 ch_bar:"Bars",ch_run:"Run chart",
 ptL:"Point (period or group)",ptV:"Value",ptAdd:"Add a point",ptNone:"No data points yet.",ptMax:"12 points at most.",
 chEmpty:"Enter at least two data points, or pick a Pareto analysis, to draw the chart.",chTarget:"Goal",chBase:"Baseline",chResult:"After",chFrom:"From Pareto analysis {id}",
 gapHint:"Computed gap: {d} {u} (from {f} to {to}).",
 goalRule:"Rule: the goal is written before the causes are known, so the date it was written is not after the date the analysis started, and it is not changed to fit the result. If it is changed for a real reason, the first target stays written with the reason.",
 lateW:"The goal was written after the analysis of causes started. The goal is written before the causes are known; otherwise it gets fitted to what was found.",chgW:"The goal was changed with no written reason. Write the reason, or the audit records it as a gap.",dirDown:"The value has to go down",dirUp:"The value has to go up",
 tmN:"Name",tmRole:"Role",tmAdd:"Add member",tmDel:"Remove",tmNone:"No one added yet.",coachW:"The coach is the owner. The coach is someone else who reviews the page through questions.",
 pkT:"Pick the causes from another tool (read-only)",pkHow:"Tool",pkRef:"Analysis id",pkUse:"Use its root causes",pk_rca:"RCA investigation",pk_fish:"Fishbone",pk_why5:"5 Whys",
 pkStart:"Start in another tool:",stRca:"Start an RCA investigation",stFish:"Start a Fishbone analysis",stWhy5:"Start a 5 Whys analysis",pkHub:"Inside the platform the other tool opens in place of this one: save the A3 first.",
 pkAdded:"{n} root cause(s) added from {id}. Check the evidence and status, then save. Nothing was written to the other tool.",pkNone:"This analysis has no root cause written yet.",pkDup:"The root causes of this analysis are already on the page.",
 pkEvFish:"Verified in Fishbone {id} ({st})",pkEvWhy5:"Tested in 5 Whys {id} ({st})",
 czCode:"Code",czT:"Root cause",czEv:"Evidence",czHow:"Method that found it",czRef:"Analysis id",czSt:"Status",czDel:"Remove cause",czAdd:"Add a root cause",czNone:"No causes yet.",
 how_:"— choose —",how_rca:"RCA investigation",how_fish:"Fishbone",how_why5:"5 Whys",how_capa:"As written in CAPA",how_data:"Data analysis",how_obs:"Observation on site (here)",
 cs_hyp:"Hypothesis",cs_conf:"Proved by evidence",cs_out:"Ruled out",personF:"Names a person only. Ask what in the process allowed it.",noEv:"Evidence needed to prove it.",
 personW:"One or more causes point at a person only (“human error”, “negligence”). Human error is a starting point for a question: what in the process allowed it? Then rewrite the cause so the organization can change it.",
 czSum:"{p} proved · {h} hypothesis · {o} ruled out",
 cmCode:"Code",cmCause:"Root cause",cmT:"Countermeasure",cmEff:"Expected effect",cmTest:"Tested?",cmAdd:"Add a countermeasure",cmNone:"No countermeasures yet.",cmDel:"Remove countermeasure",
 ts_:"— choose —",ts_yes:"Tested, it worked",ts_part:"Tested, it partly worked",ts_plan:"Test planned",ts_no:"Not tested",
 untiedF:"Not tied to a proved root cause.",untestF:"Not tested: a countermeasure is tested, not assumed.",untreatW:"Proved root cause with no countermeasure: {c}",
 plCm:"Countermeasure",plWhat:"What",plWho:"Who",plWhen:"When",plSt:"Status",plAdd:"Add a line",plNone:"No plan yet.",ps_todo:"Not started",ps_doing:"In progress",ps_done:"Done",
 planW:"Countermeasure with no plan line with an owner and a date: {c}",capaN:"Is a nonconformity involved? Its corrective actions and their follow-up belong in a CAPA record. Name it in the header.",
 fuSugg:"Result computed from the values: {r}",fuNoSugg:"Enter the goal (from and to) and the follow-up value to see the computed result.",res_:"— choose —",res_met:"Goal met",res_part:"Partly met",res_not:"Not met",
 sameW:"The follow-up measure differs from the goal measure. Compare the same thing, measured the same way.",stdW:"Write what is standardised (a procedure, a form, training, a contract), or what is left open if the goal was not met.",
 rvDate:"Date",rvBy:"Coach",rvQ:"Questions asked",rvA:"What changed afterwards",rvAdd:"Add a review",rvNone:"No reviews yet.",rvOwnW:"A review is recorded under the owner's name. A coach review is done by someone else.",
 pgOwner:"Owner",pgCoach:"Coach",pgSponsor:"Sponsor",pgStart:"Opened",pgStage:"Stage",pgNo:"not written yet",pgMeasure:"Measure",pgBase:"Baseline",pgGap:"Gap",pgBy:"by",pgWritten:"written",pgOrig:"First target",pgFu:"Follow-up",pgStd:"Standardised",pgOpen:"Open",pgNext:"Next",pgLast:"Last review",
 pgGoal:"From {f} to {to} {u} by {by}",
 cpOpen:"Open PDCA",pdFound:"PDCA cycle: {t}",pdMiss:"This cycle was not found in the PDCA tool in this browser.",pdHint:"Type the cycle number, such as PD-EX-03, if there is one.",pdOpen:"Open PDCA",
 caHint:"Type the CAPA record number, such as CA-EX-04, if there is one.",caMiss:"This record was not found in the CAPA tool in this browser.",caOpen:"Open CAPA",
 rcHint:"Type the RCA investigation number, such as RC-EX-01, if there is one.",rcMiss:"This investigation was not found in the RCA tool in this browser.",rcOpen:"Open RCA",
 paHint:"Type the Pareto analysis number, such as PA-EX-02, if there is one.",paMiss:"This analysis was not found in the Pareto tool in this browser.",paOpen:"Open Pareto",pcat_:"— choose the category —",
 pvCapa:"{id} · {ref} · {st} · {t}",pvRca:"{id} · {st} · Root causes: {t}",pvFish:"{id} · {st} · Root cause: {t}",pvWhy5:"{id} · {st} · Root cause: {t}",pvPareto:"{id} · {st} · Vital few: {t}",pvNo:"not written yet",
 pvCat:"{c}: {v} {u} of {tot} ({s}%) · period {f} → {to}{vf}",pvVf:" · in the vital few",pvCrit:"Effectiveness criterion in the investigation: {t}",
 nxMiss:"This id is not in the other tool in this browser.",nxNoData:"No data in that tool in this browser yet.",
 cst_react:"Reaction",cst_cause:"Cause analysis",cst_action:"Action",cst_verify:"Effectiveness check",cst_closed:"Closed",cst_reopened:"Reopened",
 rst_problem:"Problem",rst_evidence:"Facts collected",rst_causes:"Causes mapped",rst_root:"Root cause confirmed",rst_actions:"Actions proposed",rst_reviewed:"Reviewed",
 pst_question:"Question",pst_data:"Data",pst_vital:"Vital few",pst_acted:"Next steps",pst_checked:"Effect checked",pst_reviewed:"Reviewed",
 fst_effect:"Effect defined",fst_causes:"Causes mapped",fst_selected:"Causes selected",fst_verified:"Root cause verified",fst_reviewed:"Reviewed",
 w5st_problem:"Problem defined",w5st_chain:"Chain of whys",w5st_root:"Root cause",w5st_tested:"Root cause tested",w5st_reviewed:"Reviewed",
 pu_count:"",pu_cost:"SAR",pu_hours:"hours",pu_sev:"points",
 stT:"Start from an RCA investigation, a CAPA record or a Pareto vital-few category (read-only)",stS:"The tool reads the RCA investigations, CAPA records or Pareto analyses saved in this browser and shows them for review. Pick one to fill a new, unsaved A3. Nothing is written to the other tools, and you write the goal yourself, with its date.",
 stSrc:"Source",stPrev:"Show the preview",ss_rca:"RCA investigations",ss_capa:"CAPA records",ss_pareto:"Pareto vital-few categories",stUse:"Open an A3 from it",
 stNone:"No data from this source in this browser.",stEmpty:"Nothing to start from in this source.",
 stColId:"Id",stColT:"Reference and title",stColSt:"Stage",stColRoot:"Root causes",stColCrit:"Effectiveness criterion",stColN:"Existing A3s",stColA:"Action",stColCat:"Category",stColV:"Value and share",stColPer:"Period",
 stUsedR:"A new A3 was filled from RCA investigation {id}. Write the current condition in numbers and the goal with its date, then save. Nothing was written to RCA.",stUsedC:"A new A3 was filled from CAPA record {id}. Write the current condition in numbers and the goal with its date, then save. Nothing was written to CAPA.",stUsedP:"A new A3 was filled from the category “{c}” of Pareto analysis {id}. Write the goal with its date, then save. Nothing was written to Pareto.",
 pfBgR:"Requirement not met: {req}. Size: {much}",pfCritR:"Effectiveness criterion in investigation {id}: {t}. Write this page's goal yourself, dated today.",pfCurP:"{c} in Pareto analysis {id}",
 hmT:"This browser holds something to start from: {r} RCA investigation(s), {c} open CAPA record(s) and {p} Pareto vital-few category(ies).",hmGo:"Open an A3",
 e_title:"Enter a short title for the problem.",e_num:"Numeric values must be numbers.",e_fdate:"The follow-up start cannot be after its end.",e_rdate:"A coach review date cannot be before the date the A3 was opened.",
 exT:"Example data",exS:"Three illustrative A3s for a fictitious Saudi company (Al-Waha Contracting): rejected ready-mix concrete loads (from RCA RC-EX-01, Pareto PA-EX-02 and CAPA CA-EX-04; goal below 3% of loads, follow-up over July–August at 6% so partly met, the second cycle in PDCA PD-EX-03), lifting near misses with bundled loads (from RC-EX-02, countermeasures tested on one tower before the others, follow-up running), and a short A3 on document control (CA-EX-03, goal met and standardised), plus self-assessment answers. The data is illustrative, not real, and loading it replaces all of this tool's data in your browser.",
 exLoad:"Load example",exClear:"Clear all data",exLoaded:"Example loaded: 3 A3s and the self-assessment answers.",exCleared:"All of this tool's data was removed from this browser.",
 exConfirmClear:"This deletes every A3 and the self-assessment answers from this browser, and it cannot be undone.\n\nDo you want to continue?",
 dT:"A3s",dS:"Every A3 with its stage, result and flags. Open an A3 to edit it in the A3 sheet tab.",csv:"Export CSV",none:"No A3s yet. Start from the A3 sheet tab or load the example.",
 colRef:"Reference and title",colOwn:"Owner and coach",colStage:"Stage",colGoal:"Goal",colRes:"Result",colCz:"Causes",colFlags:"Flags",colAct:"Actions",open:"Open",del:"Delete",delArm:"Confirm delete",
 czN:"{p} of {n} proved",resPend:"Not checked yet",
 fl_owner:"No owner",fl_coach:"No coach",fl_coachOwn:"Coach is the owner",fl_bg:"Background or its measure missing",fl_cur:"Current condition incomplete",fl_goal:"Goal is not a number with a date",fl_late:"Goal written after the analysis",fl_chg:"Goal changed without a reason",fl_cause:"No proved root cause",fl_hyp:"Hypotheses not proved: {n}",fl_person:"A cause names a person only",
 fl_untied:"Countermeasures not tied to a proved cause: {n}",fl_untreat:"Proved cause without a countermeasure: {n}",fl_untested:"Countermeasures not tested: {n}",fl_plan:"Countermeasure without owner and date: {n}",fl_capa:"Not linked to a CAPA record",fl_fu:"Waiting for the follow-up",fl_same:"Same measure not confirmed",fl_std:"Nothing written as standardised",fl_next:"Goal not met and no next step",fl_rev:"Waiting for the coach's review",fl_revOwn:"Review under the owner's name",
 auT:"Automatic audit of A3s",auS:"These checks run on every A3 and show the gaps an auditor or a coach usually finds. “—” means the check does not apply yet at the A3's stage.",
 auRec:"A3s audited",auPass:"Checks passed",auFail:"A3s with gaps",auOpen:"Open items",auEmpty:"No A3s to audit yet.",
 c_ref:"Reference and owner",c_coach:"Coach other than the owner",c_bg:"Background with a measure",c_cur:"Current condition with baseline, period and data",c_goal:"Measurable dated goal written before the analysis",c_cause:"A proved root cause, none naming a person only",c_tie:"Every countermeasure tied to a root cause",c_test:"Every countermeasure tested or its test planned",c_plan:"A plan line with owner and date per countermeasure",c_fu:"Follow-up on the same measure, stated period and result",c_std:"What is standardised is written",c_rev:"Dated coach review",
 dashT:"Dashboard",dashS:"Figures calculated from the A3s and the self-assessment in this browser.",kTotal:"Total A3s",kMet:"Goal met or partly met on a follow-up",kTie:"Every countermeasure tied to a proved cause",kBefore:"Goal written before the analysis",kRev:"Reviewed with the coach after the follow-up",kRca:"Linked to an RCA investigation",kPerson:"Causes naming a person",kOpen:"Open items",kAud:"Audit pass rate",kAs:"Self-assessment",
 byStage:"Stage distribution",byRes:"Result against the goal",bySrc:"Source of the problem",byAssess:"Self-assessment by stage",openT:"Items that need follow-up",noOpen:"No open items.",noData:"No data yet.",
 oi_owner:"No single owner named for the A3",oi_coach:"No coach named to review the A3",oi_coachOwn:"The coach is the owner",oi_bg:"The background or the measure that shows the effect is not written",oi_cur:"The current condition has no baseline, period, data or gap",oi_goal:"The goal is not written as a number from and to with a date and the date it was written",oi_late:"The goal was written after the analysis of causes started",oi_chg:"The goal was changed without a written reason",
 oi_cause:"No root cause proved by evidence",oi_hyp:"{n} cause(s) still a hypothesis",oi_person:"A cause names a person only: ask what in the process allowed it",oi_untied:"{n} countermeasure(s) not tied to a proved root cause",oi_untreat:"{n} proved root cause(s) with no countermeasure",oi_untested:"{n} countermeasure(s) not tested",oi_plan:"{n} countermeasure(s) with no plan line with an owner and a date",
 oi_capa:"The problem comes from a nonconformity and no CAPA record is linked",oi_fu:"Waiting for the follow-up period and its result",oi_same:"The follow-up measure is not confirmed as the baseline measure",oi_std:"What is standardised is not written",oi_next:"The goal was not met and no next step is written",oi_rev:"Waiting for the coach's review after the follow-up",oi_revOwn:"A review is recorded under the owner's name",
 rpT:"A3 report",rpS:"HTML report downloaded to your device, which you can print or save as PDF from the browser; each problem on its own one-page sheet, then the detail of its blocks. CSV for analysing the data in a spreadsheet.",rpHtml:"Download HTML report",rpNote:"The report carries the preparer's name “مدثر سلامه” and includes the cover and summary, each problem on its A3 sheet, then the detail of each block, audit results, open items and the self-assessment.",rpPrev:"Quick preview",rpEmpty:"No A3s to export yet.",
 rpCover:"A3 problem-solving report",rpSheets:"The sheets",rpDetail:"Detail of the blocks",rpAu:"Audit result",
 aiT:"AI Assistant — under construction",aiS:"This assistant will read the A3 and suggest the coach's questions, and point out a goal written after the causes or countermeasures not tied to a cause. It will not run before the shared platform engine is in place, and it will not show invented results.",
 aiList:["Suggest the coach's questions for each block","Point out a current condition written in adjectives instead of numbers","Compare the A3 with earlier ones on similar problems"],
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
function fmtN(v){ return (v===null||v===undefined||v==="")?"—":Number(v).toLocaleString("en-US",{maximumFractionDigits:2}); }
function vstr(v){ return v===null||v===undefined?"":String(v); }
function low(s){ return txt(s).toLowerCase().replace(/\s+/g," "); }

/* ---------- records ---------- */
function blankTm(){ return {n:"",role:""}; }
function blankPt(){ return {l:"",v:null}; }
function blankCz(id){ return {id:id||"",t:"",ev:"",how:"",ref:"",st:"hyp"}; }
function blankCm(id){ return {id:id||"",cause:"",t:"",eff:"",test:""}; }
function blankPl(){ return {cm:"",what:"",who:"",when:"",st:"todo"}; }
function blankRv(){ return {date:"",by:"",q:"",a:""}; }
function blank(){ return {id:"",title:"",ref:"",src:"ncr",owner:"",coach:"",sponsor:"",area:"",start:"",rca:"",capa:"",pareto:"",pcat:"",pdca:"",team:[],
 bg:{why:"",text:"",measure:""},cur:{measure:"",unit:"",base:null,period:"",chart:"bar",pts:[],pareto:"",gap:""},
 goal:{measure:"",from:null,to:null,by:"",date:"",orig:null,why:""},andate:"",causes:[],cms:[],plan:[],
 fu:{measure:"",same:false,from:"",to:"",value:null,res:"",std:"",open:"",next:""},reviews:[],created:"",updated:""}; }
function fixTm(m){ return {n:str(m.n),role:str(m.role)}; }
function fixPt(x){ return {l:str(x.l),v:num(x.v)}; }
function fixCz(x){ return {id:str(x.id),t:str(x.t),ev:str(x.ev),how:pick(x.how,HOWS),ref:str(x.ref),st:pick(x.st,CST)||"hyp"}; }
function fixCm(x){ return {id:str(x.id),cause:str(x.cause),t:str(x.t),eff:str(x.eff),test:pick(x.test,TESTS)}; }
function fixPl(x){ return {cm:str(x.cm),what:str(x.what),who:str(x.who),when:str(x.when),st:pick(x.st,PST)||"todo"}; }
function fixRv(x){ return {date:str(x.date),by:str(x.by),q:str(x.q),a:str(x.a)}; }
function ids(list,pre){ var used={}, n=0, re=new RegExp("^"+pre+"(\\d+)$");
 list.forEach(function(c){ var m=re.exec(c.id); if(m&&!used[c.id]){ used[c.id]=1; n=Math.max(n,+m[1]); } else c.id=""; });
 list.forEach(function(c){ if(!c.id){ n++; c.id=pre+n; used[c.id]=1; } }); }
/* an A3 saved with missing or broken parts gets empty ones, so rendering never throws; every cause and countermeasure gets an id */
function fixRec(r){
 ["id","title","ref","src","owner","coach","sponsor","area","start","rca","capa","pareto","pcat","pdca","andate","created","updated"].forEach(function(k){ r[k]=str(r[k]); });
 if(SRCS.indexOf(r.src)<0) r.src="ncr";
 r.team=arr(r.team).map(fixTm);
 var b=obj(r.bg); r.bg={why:pick(b.why,WHYS),text:str(b.text),measure:str(b.measure)};
 var c=obj(r.cur); r.cur={measure:str(c.measure),unit:str(c.unit),base:num(c.base),period:str(c.period),chart:pick(c.chart,CHARTS)||"bar",pts:arr(c.pts).map(fixPt).slice(0,MAXPTS),pareto:str(c.pareto),gap:str(c.gap)};
 var g=obj(r.goal); r.goal={measure:str(g.measure),from:num(g.from),to:num(g.to),by:str(g.by),date:str(g.date),orig:num(g.orig),why:str(g.why)};
 r.causes=arr(r.causes).map(fixCz); r.cms=arr(r.cms).map(fixCm); r.plan=arr(r.plan).map(fixPl); r.reviews=arr(r.reviews).map(fixRv);
 ids(r.causes,"c"); ids(r.cms,"k");
 var f=obj(r.fu); r.fu={measure:str(f.measure),same:f.same===true,from:str(f.from),to:str(f.to),value:num(f.value),res:pick(f.res,RESS),std:str(f.std),open:str(f.open),next:str(f.next)};
 return r;
}
function load(){ return TBX.load(STORE,function(v){ if(!Array.isArray(v.records)) v.records=[]; v.records=v.records.filter(function(r){ return r&&typeof r==="object"; }); v.records.forEach(fixRec); if(!v.assess||typeof v.assess!=="object") v.assess={}; return v; },function(){ return {records:[],assess:{}}; }); }
function persist(){ return TBX.save(STORE,DB); }

/* ---------- the A3's rules ---------- */
var PERSON=/(خطأ\s*(بشري|العامل|الموظف|الفني|المشغل|السائق|الشخص|الرافع|المشرف)|إهمال|اهمال|تقصير|عدم\s*(انتباه|الانتباه|تركيز|التركيز)|سهو|لامبالاة|human\s*error|operator\s*error|worker\s*error|staff\s*error|employee\s*error|rigger\s*error|driver\s*error|negligen|careless|inattent|not\s*paying\s*attention|lack\s*of\s*attention|complacen)/i;
function personOnly(s){ return PERSON.test(String(s||"")); }
function pts(r){ return r.cur.pts.filter(function(p){ return txt(p.l)&&p.v!==null; }); }
function bgOk(r){ return !!(r.bg.why&&txt(r.bg.text)&&txt(r.bg.measure)); }
function curData(r){ return pts(r).length>=2||!!txt(r.cur.pareto); }
function curOk(r){ var c=r.cur; return !!(txt(c.measure)&&c.base!==null&&txt(c.period)&&curData(r)&&txt(c.gap)); }
function goalNum(r){ var g=r.goal; return !!(txt(g.measure)&&g.from!==null&&g.to!==null&&g.from!==g.to&&isD(g.by)&&isD(g.date)); }
function changed(r){ return r.goal.orig!==null&&r.goal.to!==null&&r.goal.orig!==r.goal.to; }
/* the goal is written before the analysis: its date is not after the date the analysis started */
function late(r){ return isD(r.goal.date)&&isD(r.andate)&&r.goal.date>r.andate; }
function goalBefore(r){ return isD(r.goal.date)&&(live(r).length?(isD(r.andate)&&!late(r)):!late(r)); }
function goalOk(r){ return goalNum(r)&&goalBefore(r)&&!(changed(r)&&!txt(r.goal.why)); }
function live(r){ return r.causes.filter(function(c){ return txt(c.t)&&c.st!=="out"; }); }
function proved(r){ return live(r).filter(function(c){ return c.st==="conf"&&!!txt(c.ev); }); }
function hyps(r){ return live(r).filter(function(c){ return c.st!=="conf"||!txt(c.ev); }); }
function personCauses(r){ return live(r).filter(function(c){ return personOnly(c.t); }); }
function anOk(r){ return proved(r).length>0&&!personCauses(r).length; }
function cmsOf(r){ return r.cms.filter(function(m){ return txt(m.t); }); }
function provedIds(r){ var o={}; proved(r).forEach(function(c){ o[c.id]=1; }); return o; }
function untied(r){ var P=provedIds(r); return cmsOf(r).filter(function(m){ return !P[m.cause]; }); }
function untreated(r){ var M=cmsOf(r); return proved(r).filter(function(c){ return !M.some(function(m){ return m.cause===c.id; }); }); }
function untested(r){ return cmsOf(r).filter(function(m){ return !m.test||m.test==="no"; }); }
function cmOk(r){ var M=cmsOf(r); return M.length>0&&!untied(r).length&&!untreated(r).length&&!untested(r).length&&M.every(function(m){ return !!txt(m.eff); }); }
function planned(r,m){ return r.plan.some(function(p){ return p.cm===m.id&&txt(p.what)&&txt(p.who)&&isD(p.when); }); }
function unplanned(r){ return cmsOf(r).filter(function(m){ return !planned(r,m); }); }
function planOk(r){ return cmsOf(r).length>0&&!unplanned(r).length; }
function fuOk(r){ var f=r.fu; return !!(txt(f.measure)&&f.same&&isD(f.from)&&isD(f.to)&&f.from<=f.to&&f.value!==null&&f.res); }
function stdOk(r){ var f=r.fu; return !!txt(f.std)||(f.res==="not"&&!!txt(f.open)); }
function owner(r){ return low(r.owner); }
function coachOwn(r){ return !!owner(r)&&low(r.coach)===owner(r); }
function revs(r){ return r.reviews.filter(function(v){ return isD(v.date)&&txt(v.by); }); }
function revOwn(r){ return !!owner(r)&&r.reviews.some(function(v){ return low(v.by)===owner(r); }); }
/* the coach's review after the follow-up: dated, by someone other than the owner, on or after the end of the follow-up period */
function revOk(r){ return revs(r).some(function(v){ return low(v.by)!==owner(r)&&(!isD(r.fu.to)||v.date>=r.fu.to); }); }
/* the computed result: met when the value reaches the target, partly when it moved from the start towards it */
function suggest(r){ var g=r.goal, v=r.fu.value; if(g.from===null||g.to===null||g.from===g.to||v===null) return "";
 var down=g.to<g.from; if(down?v<=g.to:v>=g.to) return "met"; if(down?v<g.from:v>g.from) return "part"; return "not"; }
/* milestones, in order; the stage is the last one reached */
function stageOf(r){
 if(!bgOk(r)) return "draft";
 if(!curOk(r)) return "bg";
 if(!goalOk(r)) return "cur";
 if(!anOk(r)) return "goal";
 if(!cmOk(r)) return "an";
 if(!planOk(r)) return "cm";
 if(!fuOk(r)) return "plan";
 if(!revOk(r)) return "fu";
 return "rev";
}
function stageName(s){ return t("st_"+s); }
function atLeast(r,s){ return STAGES.indexOf(stageOf(r))>=STAGES.indexOf(s); }
function codes(r){ var o={}; r.causes.forEach(function(c,i){ o[c.id]="R"+(i+1); }); r.cms.forEach(function(m,i){ o[m.id]="CM"+(i+1); }); return o; }
/* one list of what is still open in an A3; flags (records) and open items (dashboard, report) read it */
function issues(r){
 var o=[], s=stageOf(r);
 if(!txt(r.owner)) o.push(["owner","warn",{}]);
 if(!txt(r.coach)) o.push(["coach","warn",{}]);
 if(coachOwn(r)) o.push(["coachOwn","bad",{}]);
 if(!bgOk(r)) o.push(["bg","warn",{}]);
 if(atLeast(r,"bg")&&!curOk(r)) o.push(["cur","warn",{}]);
 if(atLeast(r,"cur")&&!goalNum(r)) o.push(["goal","warn",{}]);
 if(late(r)) o.push(["late","bad",{}]);
 if(changed(r)&&!txt(r.goal.why)) o.push(["chg","bad",{}]);
 if(atLeast(r,"goal")&&!proved(r).length) o.push(["cause","warn",{}]);
 if(hyps(r).length) o.push(["hyp","info",{n:hyps(r).length}]);
 if(personCauses(r).length) o.push(["person","bad",{}]);
 if(untied(r).length) o.push(["untied","warn",{n:untied(r).length}]);
 if(atLeast(r,"an")&&untreated(r).length) o.push(["untreat","warn",{n:untreated(r).length}]);
 if(untested(r).length) o.push(["untested","warn",{n:untested(r).length}]);
 if(atLeast(r,"cm")&&unplanned(r).length) o.push(["plan","warn",{n:unplanned(r).length}]);
 if(["capa","ncr","audit"].indexOf(r.src)>=0&&!txt(r.capa)) o.push(["capa","info",{}]);
 if(s==="plan") o.push(["fu","info",{}]);
 if(isD(r.fu.from)&&!r.fu.same&&(txt(r.fu.measure)||r.fu.value!==null)) o.push(["same","warn",{}]);
 if(atLeast(r,"fu")&&!stdOk(r)) o.push(["std","warn",{}]);
 if(r.fu.res==="not"&&!txt(r.fu.next)) o.push(["next","info",{}]);
 if(s==="fu") o.push(["rev","info",{}]);
 if(revOwn(r)) o.push(["revOwn","warn",{}]);
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
/* other tools' records saved in this browser (read only) */
function recsOf(key){ var S=TBX.read(key); if(!S) return null; return (Array.isArray(S.records)?S.records:[]).filter(function(r){ return r&&typeof r==="object"&&str(r.id); }); }
function pdcaCycles(){ return (recsOf(PDCA_KEY)||[]).map(function(r){ return {id:str(r.id),title:str(r.title)}; }); }
function byIdIn(key,id){ return (recsOf(key)||[]).filter(function(r){ return str(r.id)===id; })[0]||null; }
/* stages of the other tools, read with their own rules (capa.html, rca.html, pareto.html, fishbone.html, five-whys.html: stageOf), for previews only */
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
 var probOk=["what","where","when","much","req"].every(function(f){ return !!txt(str(p[f])); }), depthOk=!!q&&(!lw||!!txt(str(r.depthWhy)));
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
 if(!(probOk&&depthOk&&facts>=2&&ev>=1)) return "problem"; if(!(dir.length&&RT.length)) return "evidence"; if(!(rootsOk&&methOk)) return "causes";
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
 var p=byIdIn(PARETO_KEY,pid); if(!p) return null;
 var K=paRank(p), x=K.rows.filter(function(z){ return str(z.c.id)===cid; })[0]; if(!x) return null;
 return {p:p,x:x,txt:t("pvCat",{c:str(x.c.name),v:fmtN(x.v),u:puName(p.unit),tot:fmtN(K.total),s:(Math.round(x.share*10)/10).toFixed(1),f:str(p.from)||"—",to:str(p.to)||"—",vf:x.vit?t("pvVf"):""}).replace("  "," ")};
}
function keyOf(how){ return {rca:RCA_KEY,fish:FISH_KEY,why5:WHY5_KEY,capa:CAPA_KEY,pareto:PARETO_KEY}[how]||""; }
function preview(how,id){
 if(["rca","fish","why5","capa","pareto"].indexOf(how)<0) return "";
 var R=recsOf(keyOf(how));
 if(!id) return (R&&R.length)?"":t("nxNoData");
 var r=byIdIn(keyOf(how),id); if(!r) return t("nxMiss");
 if(how==="rca") return t("pvRca",{id:id,st:t("rst_"+rcaStage(r)),t:short(rcaRoots(r).map(function(c){ return str(c.t); }).join(" · "),140)||t("pvNo")});
 if(how==="fish") return t("pvFish",{id:id,st:t("fst_"+fishStage(r)),t:short(str(r.root),110)||t("pvNo")});
 if(how==="why5") return t("pvWhy5",{id:id,st:t("w5st_"+why5Stage(r)),t:short(str(r.root),110)||t("pvNo")});
 if(how==="pareto"){ var V=paRank(r).rows.filter(function(x){ return x.vit; }).map(function(x){ return str(x.c.name); }); return t("pvPareto",{id:id,st:t("pst_"+paStage(r)),t:short(V.join(" · "),120)||t("pvNo")}); }
 return t("pvCapa",{id:id,ref:str(r.ref)||"—",st:t("cst_"+capaStage(r)),t:short(str(r.title),90)});
}
/* the root causes another analysis holds, as rows for this A3 (read only) */
function rootsFrom(how,id){
 var r=byIdIn(keyOf(how),id); if(!r) return null;
 if(how==="rca") return rcaRoots(r).map(function(c){ return {t:str(c.t),ev:str(c.ev),how:"rca",ref:id,st:c.st==="conf"&&txt(str(c.ev))?"conf":"hyp"}; });
 if(how==="fish"){ var fs=fishStage(r); return txt(str(r.root))?[{t:str(r.root),ev:(fs==="verified"||fs==="reviewed")?t("pkEvFish",{id:id,st:t("fst_"+fs)}):"",how:"fish",ref:id,st:(fs==="verified"||fs==="reviewed")?"conf":"hyp"}]:[]; }
 var ws=why5Stage(r); return txt(str(r.root))?[{t:str(r.root),ev:(ws==="tested"||ws==="reviewed")?t("pkEvWhy5",{id:id,st:t("w5st_"+ws)}):"",how:"why5",ref:id,st:(ws==="tested"||ws==="reviewed")?"conf":"hyp"}]:[];
}

/* ---------- charts (inline SVG, mirrored for Arabic; the same drawings go into the A3 page and the report) ---------- */
var FONT="font-family=\"'IBM Plex Sans Arabic','IBM Plex Sans',Calibri,Tahoma,sans-serif\"";
function chartPts(r){ var P=pts(r); if(P.length) return {p:P,src:""};
 if(txt(r.cur.pareto)){ var pa=byIdIn(PARETO_KEY,r.cur.pareto); if(pa){ var K=paRank(pa); return {p:K.rows.filter(function(x){ return x.v>0; }).slice(0,MAXPTS).map(function(x){ return {l:str(x.c.name),v:x.v,vit:x.vit}; }),src:r.cur.pareto}; } }
 return {p:[],src:""}; }
function lab(s,n){ s=txt(s); return s.length>n?s.slice(0,n-1)+"…":s; }
function curSVG(r,lang){
 lang=lang||L; var rtl=lang==="ar", C=chartPts(r), P=C.p, W=560, H=210, m={l:44,r:14,t:16,b:44}, f=function(v){ return Math.round(v*10)/10; };
 var o=['<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 '+W+' '+H+'" width="'+W+'" height="'+H+'" role="img" aria-label="'+esc((lang==="ar"?"الوضع الحالي: ":"Current condition: ")+(txt(r.cur.measure)||"…"))+'" '+FONT+'>','<rect width="'+W+'" height="'+H+'" fill="#FFFFFF"/>'];
 if(P.length<2&&!C.src){ o.push('<text x="'+W/2+'" y="'+H/2+'" fill="#7A869E" font-size="13" text-anchor="middle">'+esc(lang==="ar"?"أدخل نقطتي بيانات على الأقل، أو اختر تحليل باريتو، ليظهر الرسم.":"Enter at least two data points, or pick a Pareto analysis, to draw the chart.")+'</text></svg>'); return o.join(""); }
 var tg=r.goal.to, mx=Math.max.apply(null,P.map(function(p){ return p.v; }).concat([tg!==null?tg:0,r.cur.base!==null?r.cur.base:0,0]))*1.15||1;
 var iw=W-m.l-m.r, ih=H-m.t-m.b, n=P.length, slot=iw/n, X=function(x){ return rtl?W-x:x; }, Y=function(v){ return m.t+ih-(v/mx)*ih; };
 o.push('<line x1="'+f(X(m.l))+'" y1="'+f(m.t+ih)+'" x2="'+f(X(m.l+iw))+'" y2="'+f(m.t+ih)+'" stroke="#9AA5B8"/>');
 [0,0.5,1].forEach(function(k){ var v=mx/1.15*k; o.push('<text x="'+f(rtl?W-m.l+6:m.l-6)+'" y="'+f(Y(v)+4)+'" fill="#7A869E" font-size="10" text-anchor="'+(rtl?"start":"end")+'" direction="ltr">'+esc(fmtN(Math.round(v*10)/10))+'</text>'); });
 var cx=function(i){ return m.l+slot*i+slot/2; };
 if((r.cur.chart==="run")&&!C.src){ var d=P.map(function(p,i){ return (i?"L":"M")+f(X(cx(i)))+" "+f(Y(p.v)); }).join(" "); o.push('<path d="'+d+'" fill="none" stroke="#3563C9" stroke-width="2.2"/>');
  P.forEach(function(p,i){ o.push('<circle cx="'+f(X(cx(i)))+'" cy="'+f(Y(p.v))+'" r="3.6" fill="#3563C9"/><text x="'+f(X(cx(i)))+'" y="'+f(Y(p.v)-8)+'" fill="#1B2A4A" font-size="10.5" text-anchor="middle" direction="ltr">'+esc(fmtN(p.v))+'</text>'); }); }
 else P.forEach(function(p,i){ var bw=Math.min(46,slot*0.62), x=cx(i)-bw/2, y=Y(p.v); o.push('<rect x="'+f(rtl?W-x-bw:x)+'" y="'+f(y)+'" width="'+f(bw)+'" height="'+f(m.t+ih-y)+'" rx="3" fill="'+(p.vit===false?"#9AA5B8":"#3563C9")+'"/><text x="'+f(X(cx(i)))+'" y="'+f(y-5)+'" fill="#1B2A4A" font-size="10.5" text-anchor="middle" direction="ltr">'+esc(fmtN(p.v))+'</text>'); });
 P.forEach(function(p,i){ o.push('<text x="'+f(X(cx(i)))+'" y="'+f(m.t+ih+14)+'" fill="#4B5874" font-size="10" text-anchor="middle">'+esc(lab(p.l,n>8?8:14))+'</text>'); });
 if(tg!==null){ o.push('<line x1="'+f(X(m.l))+'" y1="'+f(Y(tg))+'" x2="'+f(X(m.l+iw))+'" y2="'+f(Y(tg))+'" stroke="#3C9A5F" stroke-width="1.6" stroke-dasharray="6 4"/><text x="'+f(X(m.l+iw-2))+'" y="'+f(Y(tg)-4)+'" fill="#2F7D4B" font-size="10.5" font-weight="700" text-anchor="'+(rtl?"start":"end")+'">'+esc((lang==="ar"?"الهدف ":"Goal ")+fmtN(tg))+'</text>'); }
 if(C.src) o.push('<text x="'+f(X(m.l))+'" y="'+f(H-6)+'" fill="#7A869E" font-size="10" text-anchor="'+(rtl?"end":"start")+'">'+esc((lang==="ar"?"من تحليل باريتو ":"From Pareto analysis ")+C.src)+'</text>');
 o.push('</svg>'); return o.join("");
}
/* follow-up: baseline, goal and the value after the countermeasures */
function fuSVG(r,lang){
 lang=lang||L; var rtl=lang==="ar", B=[[lang==="ar"?"الأساس":"Baseline",r.cur.base!==null?r.cur.base:r.goal.from,"#9AA5B8"],[lang==="ar"?"الهدف":"Goal",r.goal.to,"#3C9A5F"],[lang==="ar"?"بعد الإجراءات":"After",r.fu.value,RCOL[r.fu.res||suggest(r)||"none"]]];
 if(B.some(function(b){ return b[1]===null; })) return "";
 var W=300, H=150, m=26, mx=Math.max(B[0][1],B[1][1],B[2][1],0)*1.2||1, slot=(W-2*m)/3, f=function(v){ return Math.round(v*10)/10; }, o=['<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 '+W+' '+H+'" width="'+W+'" height="'+H+'" role="img" aria-label="'+esc(lang==="ar"?"المتابعة مقابل الهدف":"Follow-up against the goal")+'" '+FONT+'><rect width="'+W+'" height="'+H+'" fill="#FFFFFF"/>'];
 B.forEach(function(b,i){ var bw=48, x=m+slot*i+slot/2-bw/2, h=(b[1]/mx)*(H-56), y=H-30-h; x=rtl?W-x-bw:x;
  o.push('<rect x="'+f(x)+'" y="'+f(y)+'" width="'+bw+'" height="'+f(h)+'" rx="3" fill="'+b[2]+'"/><text x="'+f(x+bw/2)+'" y="'+f(y-5)+'" font-size="11" fill="#1B2A4A" text-anchor="middle" direction="ltr">'+esc(fmtN(b[1]))+'</text><text x="'+f(x+bw/2)+'" y="'+(H-12)+'" font-size="10.5" fill="#4B5874" text-anchor="middle">'+esc(b[0])+'</text>'); });
 o.push('<line x1="10" y1="'+(H-30)+'" x2="'+(W-10)+'" y2="'+(H-30)+'" stroke="#9AA5B8"/></svg>'); return o.join("");
}

/* ---------- the live A3 page (print-ready HTML on A3 landscape proportions; the halves follow the page direction) ---------- */
function goalLine(r){ var g=r.goal; return t("pgGoal",{f:fmtN(g.from),to:fmtN(g.to),u:txt(r.cur.unit),by:g.by||"—"}).replace(/\s+/g," "); }
function pageHTML(r){
 var CD=codes(r), s=stageOf(r), no='<span class="mt">'+esc(t("pgNo"))+'</span>', P=function(v){ return txt(v)?esc(v):no; };
 var blk=function(n,col,title,inner){ return '<div class="a3p-b" style="--bc:'+col+'"><h5><i>'+n+'</i>'+esc(title)+'</h5>'+inner+'</div>'; };
 var last=revs(r).slice().sort(function(a,b){ return a.date<b.date?1:-1; })[0];
 var cz=r.causes.filter(function(c){ return txt(c.t); });
 var b1='<p>'+(r.bg.why?'<b>'+esc(t("why_"+r.bg.why))+':</b> ':'')+P(r.bg.text)+'</p><p><small>'+esc(t("pgMeasure"))+': '+P(r.bg.measure)+'</small></p>';
 var b2='<p><small>'+esc(t("pgMeasure"))+':</small> '+P(r.cur.measure)+' · <small>'+esc(t("pgBase"))+':</small> <b dir="ltr">'+esc(fmtN(r.cur.base))+(txt(r.cur.unit)?" "+esc(r.cur.unit):"")+'</b> · '+P(r.cur.period)+'</p>'+((chartPts(r).p.length>=2||chartPts(r).src)?curSVG(r):"")+'<p><small>'+esc(t("pgGap"))+':</small> '+P(r.cur.gap)+'</p>';
 var b3='<p><b>'+P(r.goal.measure)+'</b></p><p>'+esc(goalLine(r))+'</p><p><small>'+esc(t("pgWritten"))+' <span dir="ltr">'+esc(r.goal.date||"—")+'</span>'+(late(r)?' · <span class="bad">'+esc(t("fl_late"))+'</span>':'')+'</small></p>'+(changed(r)?'<p><small>'+esc(t("pgOrig"))+': '+esc(fmtN(r.goal.orig))+' — '+P(r.goal.why)+'</small></p>':'');
 var b4=cz.length?'<ul>'+cz.map(function(c){ var ok=c.st==="conf"&&txt(c.ev); return '<li><b dir="ltr">'+esc(CD[c.id])+'</b> <span class="'+(c.st==="out"?"mt":(ok?"ok":"warn"))+'">'+(c.st==="out"?"✗":(ok?"✓":"?"))+'</span> '+esc(c.t)+(personOnly(c.t)&&c.st!=="out"?' <span class="bad">⚠</span>':'')+'<br><small>'+esc(c.how?t("how_"+c.how):"—")+(c.ref?' <span dir="ltr">'+esc(c.ref)+'</span>':'')+(c.ev?' · '+esc(short(c.ev,90)):'')+'</small></li>'; }).join("")+'</ul>':no;
 var M=cmsOf(r);
 var b5=M.length?'<table><tbody>'+M.map(function(m){ return '<tr><td dir="ltr"><b>'+esc(CD[m.id])+'</b></td><td dir="ltr">'+esc(CD[m.cause]||"—")+'</td><td>'+esc(m.t)+(m.eff?'<br><small>'+esc(m.eff)+'</small>':'')+'</td><td class="'+(m.test==="yes"?"ok":(m.test==="part"||m.test==="plan"?"warn":"bad"))+'">'+esc(t("ts_"+m.test))+'</td></tr>'; }).join("")+'</tbody></table>':no;
 var PL=r.plan.filter(function(p){ return txt(p.what); });
 var b6=PL.length?'<table><thead><tr><th>'+esc(t("plWhat"))+'</th><th>'+esc(t("plWho"))+'</th><th>'+esc(t("plWhen"))+'</th><th>'+esc(t("plSt"))+'</th></tr></thead><tbody>'+PL.map(function(p){ return '<tr><td><span dir="ltr">'+esc(CD[p.cm]||"")+'</span> '+esc(p.what)+'</td><td>'+esc(p.who||"—")+'</td><td dir="ltr">'+esc(p.when||"—")+'</td><td class="'+(p.st==="done"?"ok":"")+'">'+esc(t("ps_"+p.st))+'</td></tr>'; }).join("")+'</tbody></table>':no;
 var f=r.fu, res=f.res;
 var b7=(isD(f.from)||f.value!==null)?'<p><small>'+esc(t("pgFu"))+':</small> <span dir="ltr">'+esc((f.from||"—")+" → "+(f.to||"—"))+'</span> · <b dir="ltr">'+esc(fmtN(f.value))+(txt(r.cur.unit)?" "+esc(r.cur.unit):"")+'</b>'+(res?' · <span class="'+(res==="met"?"ok":(res==="part"?"warn":"bad"))+'">'+esc(t("res_"+res))+'</span>':'')+'</p>'+fuSVG(r)+'<p><small>'+esc(t("pgStd"))+':</small> '+P(f.std)+'</p>'+(txt(f.open)?'<p><small>'+esc(t("pgOpen"))+':</small> '+esc(f.open)+'</p>':'')+(txt(f.next)?'<p><small>'+esc(t("pgNext"))+':</small> <span dir="ltr">'+esc(f.next)+'</span></p>':''):no;
 if(last) b7+='<p><small>'+esc(t("pgLast"))+': <span dir="ltr">'+esc(last.date)+'</span> · '+esc(last.by)+(last.q?' — '+esc(short(last.q,120)):'')+'</small></p>';
 return '<div class="a3p" dir="'+(L==="ar"?"rtl":"ltr")+'" role="region" aria-label="'+esc(t("sPageT"))+'">'+
  '<div class="a3p-h"><b>'+esc(txt(r.title)||"…")+'</b><span dir="ltr">'+esc((r.id||"—")+(r.ref?" · "+r.ref:""))+'</span><span>'+esc(t("pgOwner"))+': '+esc(r.owner||"—")+'</span><span>'+esc(t("pgCoach"))+': '+esc(r.coach||"—")+'</span>'+(r.sponsor?'<span>'+esc(t("pgSponsor"))+': '+esc(r.sponsor)+'</span>':'')+'<span>'+esc(t("pgStart"))+': <bdi dir="ltr">'+esc(r.start||"—")+'</bdi></span><span>'+esc(t("pgStage"))+': '+esc(stageName(s))+'</span></div>'+
  '<div class="a3p-g"><div class="a3p-c"><div class="a3p-ht">Plan</div>'+blk(1,"#C2410C",t("sBgT"),b1)+blk(2,"#3563C9",t("sCurT").split(" · ")[0],b2)+blk(3,"#B8901E",t("sGoalT").split(" · ")[0],b3)+blk(4,"#1B2A4A",t("sAnT").split(" · ")[0],b4)+'</div>'+
  '<div class="a3p-c"><div class="a3p-ht">Do · Check · Act</div>'+blk(5,"#C9821A",t("sCmT"),b5)+blk(6,"#7B5BB8",t("sPlanT").split(" · ")[0],b6)+blk(7,"#1E8C93",t("sFuT").split(" · ")[0],b7)+'</div></div></div>';
}

/* ---------- A3 form ---------- */
var HDR=[["title","tx",1],["ref","ltr",0],["src","sel_src",0],["owner","tx",0],["coach","tx",0],["sponsor","tx",0],["start","date",0],["area","tx",0],["rca","rca",0],["capa","capa",0],["pareto","pareto",0],["pcat","pcat",0],["pdca","pdca",0]];
var PATH={title:"title",ref:"ref",src:"src",owner:"owner",coach:"coach",sponsor:"sponsor",start:"start",area:"area",rca:"rca",capa:"capa",pareto:"pareto",pcat:"pcat",pdca:"pdca",
 why:"bg.why",bgtext:"bg.text",bgmeasure:"bg.measure",cmeasure:"cur.measure",cunit:"cur.unit",cbase:"cur.base",cperiod:"cur.period",cchart:"cur.chart",cpareto:"cur.pareto",cgap:"cur.gap",
 gmeasure:"goal.measure",gfrom:"goal.from",gto:"goal.to",gby:"goal.by",gdate:"goal.date",gorig:"goal.orig",gwhy:"goal.why",andate:"andate",
 fmeasure:"fu.measure",ffrom:"fu.from",fto:"fu.to",fvalue:"fu.value",fres:"fu.res",fstd:"fu.std",fopen:"fu.open",fnext:"fu.next"};
var NUMF={cbase:1,gfrom:1,gto:1,gorig:1,fvalue:1};
function getP(r,p){ var a=p.split("."); return a.length>1?r[a[0]][a[1]]:r[a[0]]; }
function setP(r,p,v){ var a=p.split("."); if(a.length>1) r[a[0]][a[1]]=v; else r[a[0]]=v; }
function opts(list,prefix,cur){ return list.map(function(k){ return '<option value="'+k+'"'+(cur===k?" selected":"")+'>'+esc(t(prefix+k))+'</option>'; }).join(""); }
function fill(list){ return list.map(function(r){ return '<option value="'+esc(r[0])+'">'+esc(r[1])+'</option>'; }).join(""); }
function link(id,list,info,btn,bl){ return '<div class="ca-pd"><input id="'+id+'" type="text" dir="ltr" list="'+list+'" aria-describedby="'+info+'">'+(btn?'<button class="pd-btn ghost" type="button" id="'+btn+'">'+esc(t(bl))+'</button>':'')+'</div><datalist id="'+list+'"></datalist><div class="ca-pdinfo" id="'+info+'" aria-live="polite"></div>'; }
function fieldHTML(name,kind,wide){
 var id="f-"+name, lab=t("f_"+name), inner="";
 if(kind==="ta") inner='<textarea id="'+id+'" rows="2"></textarea>';
 else if(kind==="date") inner='<input id="'+id+'" type="date">';
 else if(kind==="ltr") inner='<input id="'+id+'" type="text" dir="ltr">';
 else if(kind==="num") inner='<input id="'+id+'" type="number" step="any" inputmode="decimal" dir="ltr">';
 else if(kind==="sel_src") inner='<select id="'+id+'">'+opts(SRCS,"src_")+'</select>';
 else if(kind==="sel_why") inner='<select id="'+id+'">'+opts([""].concat(WHYS),"why_")+'</select>';
 else if(kind==="sel_chart") inner='<select id="'+id+'">'+opts(CHARTS,"ch_")+'</select>';
 else if(kind==="sel_res") inner='<select id="'+id+'">'+opts([""].concat(RESS),"res_")+'</select>';
 else if(kind==="rca") inner=link(id,"rcaList","rcInfo","rcOpen","rcOpen");
 else if(kind==="capa") inner=link(id,"capaList","caInfo","caOpen","caOpen");
 else if(kind==="pareto") inner=link(id,"paList","paInfo","paOpen","paOpen");
 else if(kind==="pdca") inner=link(id,"pdcaList","pdInfo","pdOpen","pdOpen");
 else if(kind==="pcat") inner='<select id="'+id+'" aria-describedby="pcInfo"><option value="">'+esc(t("pcat_"))+'</option></select><div class="ca-pdinfo" id="pcInfo" aria-live="polite"></div>';
 else if(kind==="cpa") inner='<input id="'+id+'" type="text" dir="ltr" list="paList" aria-describedby="cpInfo"><div class="ca-pdinfo" id="cpInfo" aria-live="polite"></div>';
 else inner='<input id="'+id+'" type="text">';
 return '<div class="pd-f'+(wide?" wide":"")+'"><label for="'+id+'">'+esc(lab)+'</label>'+inner+'</div>';
}
function secHTML(k,n,col,inner){ return '<div class="pd-stage w5-sec" id="sec-'+k+'" style="--sc:'+col+'"><h3>'+(n?'<span class="a3-bn" aria-hidden="true">'+n+'</span>':'')+esc(t("s"+k+"T"))+'</h3><p class="pd-sub">'+esc(t("s"+k+"S"))+'</p>'+inner+'</div>'; }
function tblHTML(name,cls,heads){ return '<div class="ca-actw"><table class="a3-tbl '+cls+'"><thead><tr>'+heads.map(function(h){ return '<th>'+(h?esc(h):'<span class="sr">—</span>')+'</th>'; }).join("")+'</tr></thead><tbody id="'+name+'Rows"></tbody></table></div>'; }
function addBtn(name,lbl){ return '<button class="pd-btn ghost" type="button" data-add="'+name+'">+ '+esc(lbl)+'</button>'; }
function buildForm(){
 document.getElementById("hdrFields").innerHTML=HDR.map(function(f){ return fieldHTML(f[0],f[1],f[2]); }).join("");
 var hdr=secHTML("Hdr",0,"#7A869E",tblHTML("tm","a3-tm",[t("tmN"),t("tmRole"),""])+'<p class="ca-hint" id="tmNone"></p><div class="a3-add">'+addBtn("tm",t("tmAdd"))+'</div><div class="w5-warn w5-bad" id="coachWarn" role="note" hidden></div>');
 var s1=secHTML("Bg",1,"#C2410C",'<div class="pd-fields">'+fieldHTML("why","sel_why",0)+fieldHTML("bgmeasure","tx",0)+fieldHTML("bgtext","ta",1)+'</div>');
 var s2=secHTML("Cur",2,"#3563C9",'<div class="pd-fields">'+fieldHTML("cmeasure","tx",1)+fieldHTML("cbase","num",0)+fieldHTML("cunit","tx",0)+fieldHTML("cperiod","tx",0)+fieldHTML("cchart","sel_chart",0)+fieldHTML("cpareto","cpa",0)+'</div>'+
  '<p class="a3-sub">'+esc(t("ptL"))+'</p>'+tblHTML("pt","a3-pts",[t("ptL"),t("ptV"),""])+'<p class="ca-hint" id="ptNone"></p><div class="a3-add">'+addBtn("pt",t("ptAdd"))+'<span class="ca-hint">'+esc(t("ptMax"))+'</span></div>'+
  '<div class="a3-chartw" id="curChart"></div><div class="pd-fields" style="margin-top:10px">'+fieldHTML("cgap","tx",1)+'</div><p class="ca-hint" id="gapHint"></p>');
 var s3=secHTML("Goal",3,"#B8901E",'<div class="pd-fields">'+fieldHTML("gmeasure","tx",1)+fieldHTML("gfrom","num",0)+fieldHTML("gto","num",0)+fieldHTML("gby","date",0)+fieldHTML("gdate","date",0)+fieldHTML("gorig","num",0)+fieldHTML("gwhy","tx",1)+'</div><p class="ca-hint" id="goalDir"></p><p class="a3-rule" id="goalRule"></p><div class="w5-warn w5-bad" id="lateWarn" role="note" hidden></div><div class="w5-warn w5-bad" id="chgWarn" role="note" hidden></div>');
 var s4=secHTML("An",4,"#1B2A4A",'<div class="pd-fields">'+fieldHTML("andate","date",0)+'</div>'+
  '<div class="a3-pick" id="pickBox"><p class="a3-sub" style="margin:0;flex:1 1 100%">'+esc(t("pkT"))+'</p><div class="pd-f"><label for="pkHow">'+esc(t("pkHow"))+'</label><select id="pkHow">'+opts(["rca","fish","why5"],"pk_")+'</select></div><div class="pd-f"><label for="pkRef">'+esc(t("pkRef"))+'</label><input id="pkRef" type="text" dir="ltr" list="pkList"><datalist id="pkList"></datalist></div><div class="pd-btns"><button class="pd-btn ghost" type="button" id="pkUse">'+esc(t("pkUse"))+'</button></div><p class="a3-pkpv" id="pkPv" aria-live="polite"></p>'+
  '<p class="a3-pkpv" style="display:block"><span>'+esc(t("pkStart"))+'</span> <button class="pd-btn ghost" type="button" data-start="rca">'+esc(t("stRca"))+' ↗</button> <button class="pd-btn ghost" type="button" data-start="fish">'+esc(t("stFish"))+' ↗</button> <button class="pd-btn ghost" type="button" data-start="why5">'+esc(t("stWhy5"))+' ↗</button></p><p class="a3-pkpv" id="pkHub" hidden></p><p class="pd-ok a3-pkpv" id="pkMsg" role="status"></p></div>'+
  tblHTML("cz","a3-cz",[t("czCode"),t("czT"),t("czEv"),t("czHow"),t("czRef"),t("czSt"),""])+'<p class="ca-hint" id="czNone"></p><div class="a3-add">'+addBtn("cz",t("czAdd"))+'</div><p class="pa-sug" id="czSum"></p><div class="w5-warn w5-bad" id="personWarn" role="note" hidden></div>');
 var s5=secHTML("Cm",5,"#C9821A",tblHTML("cm","a3-cm",[t("cmCode"),t("cmCause"),t("cmT"),t("cmEff"),t("cmTest"),""])+'<p class="ca-hint" id="cmNone"></p><div class="a3-add">'+addBtn("cm",t("cmAdd"))+'</div><div class="w5-warn" id="treatWarn" role="note" hidden></div>');
 var s6=secHTML("Plan",6,"#7B5BB8",tblHTML("pl","a3-pl",[t("plCm"),t("plWhat"),t("plWho"),t("plWhen"),t("plSt"),""])+'<p class="ca-hint" id="plNone"></p><div class="a3-add">'+addBtn("pl",t("plAdd"))+'<button class="pd-btn ghost" type="button" id="plCapa">'+esc(t("caOpen"))+' ↗</button></div><div class="w5-warn" id="planWarn" role="note" hidden></div><p class="ca-hint" id="capaN" hidden></p>');
 var s7=secHTML("Fu",7,"#1E8C93",'<div class="pd-fields">'+fieldHTML("fmeasure","tx",1)+'</div><label class="w5-chk" for="f-fsame"><input id="f-fsame" type="checkbox"><span>'+esc(t("f_fsame"))+'</span></label><div class="w5-warn" id="sameWarn" role="note" hidden></div>'+
  '<div class="pd-fields" style="margin-top:10px">'+fieldHTML("ffrom","date",0)+fieldHTML("fto","date",0)+fieldHTML("fvalue","num",0)+fieldHTML("fres","sel_res",0)+'</div><p><span class="a3-sugg" id="fuSugg"></span></p><div class="a3-chartw" id="fuChart" hidden></div>'+
  '<div class="pd-fields" style="margin-top:10px">'+fieldHTML("fstd","ta",1)+fieldHTML("fopen","ta",1)+fieldHTML("fnext","ltr",0)+'</div><div class="w5-warn" id="stdWarn" role="note" hidden></div>');
 var rv=secHTML("Rev",0,"#3C9A5F",tblHTML("rv","a3-rv",[t("rvDate"),t("rvBy"),t("rvQ"),t("rvA"),""])+'<p class="ca-hint" id="rvNone"></p><div class="a3-add">'+addBtn("rv",t("rvAdd"))+'</div><div class="w5-warn" id="rvWarn" role="note" hidden></div>');
 var pg=secHTML("Page",0,"#B8901E",'<div class="a3pw" id="a3Page"></div>');
 document.getElementById("stages").innerHTML=hdr+'<div class="a3-halves"><section class="a3-half" style="--hc:#1B2A4A" aria-labelledby="hPlanT"><h3 class="a3-ht" id="hPlanT"><i>P</i>'+esc(t("hPlan"))+'</h3><p class="a3-hs">'+esc(t("hPlanS"))+'</p>'+s1+s2+s3+s4+'</section>'+
  '<section class="a3-half" style="--hc:#1E8C93" aria-labelledby="hDoT"><h3 class="a3-ht" id="hDoT"><i>D · C · A</i>'+esc(t("hDo"))+'</h3><p class="a3-hs">'+esc(t("hDoS"))+'</p>'+s5+s6+s7+'</section></div>'+rv+pg;
 document.getElementById("goalRule").textContent=t("goalRule");
 fillLists();
}
function fillLists(){
 var put=function(id,list){ var dl=document.getElementById(id); if(dl) dl.innerHTML=fill(list); };
 put("pdcaList",pdcaCycles().map(function(c){ return [c.id,c.title]; }));
 put("capaList",(recsOf(CAPA_KEY)||[]).map(function(c){ return [str(c.id),str(c.ref)+" · "+str(c.title)]; }));
 put("rcaList",(recsOf(RCA_KEY)||[]).map(function(c){ return [str(c.id),str(c.ref)+" · "+str(c.title)]; }));
 put("paList",(recsOf(PARETO_KEY)||[]).map(function(p){ return [str(p.id),str(p.ref)+" · "+str(p.title)]; }));
 var h=document.getElementById("pkHow"); put("pkList",(recsOf(keyOf(h?h.value:"rca"))||[]).map(function(p){ return [str(p.id),str(p.ref||"")+" · "+str(p.title)]; }));
}
/* ---- row tables: each field is [key, kind, label key]; kinds: tx, ta, num, date, sel:<LIST>:<prefix>, code, cause, cm, ref ---- */
var LISTS={HOWS:[""].concat(HOWS),CST:CST,TESTS:[""].concat(TESTS),PST:PST};
var TB={
 tm:{key:"team",blank:blankTm,f:[["n","tx","tmN"],["role","tx","tmRole"]]},
 pt:{key:"cur.pts",blank:blankPt,f:[["l","tx","ptL"],["v","num","ptV"]],max:MAXPTS},
 cz:{key:"causes",f:[["code","code","czCode"],["t","ta","czT"],["ev","ta","czEv"],["how","sel:HOWS:how_","czHow"],["ref","ref","czRef"],["st","sel:CST:cs_","czSt"]]},
 cm:{key:"cms",f:[["code","code","cmCode"],["cause","cause","cmCause"],["t","ta","cmT"],["eff","ta","cmEff"],["test","sel:TESTS:ts_","cmTest"]]},
 pl:{key:"plan",blank:blankPl,f:[["cm","cm","plCm"],["what","ta","plWhat"],["who","tx","plWho"],["when","date","plWhen"],["st","sel:PST:ps_","plSt"]]},
 rv:{key:"reviews",blank:blankRv,f:[["date","date","rvDate"],["by","tx","rvBy"],["q","ta","rvQ"],["a","ta","rvA"]]}
};
function cellHTML(tb,f,row,i){
 var k=f[0], kind=f[1], lab=t(f[2])+" "+(i+1), id="r-"+tb+"-"+i+"-"+k, v=row[k], a=' id="'+id+'" data-k="'+k+'" aria-label="'+esc(lab)+'"';
 if(kind==="tx") return '<td'+((tb==="pl"||tb==="rv")&&k!=="what"?' class="a3-o"':'')+'><input type="text"'+a+' value="'+esc(v)+'"></td>';
 if(kind==="ta") return '<td><textarea rows="1"'+a+'>'+esc(v)+'</textarea>'+(tb==="cz"&&k==="t"||tb==="cm"&&k==="t"?'<span class="a3-flag" data-flag></span>':'')+'</td>';
 if(kind==="num") return '<td class="a3-n"><input type="number" step="any" inputmode="decimal"'+a+' value="'+esc(vstr(v))+'"></td>';
 if(kind==="date") return '<td class="a3-d"><input type="date"'+a+' value="'+esc(v)+'"></td>';
 if(kind==="code") return '<td class="c" data-code dir="ltr"></td>';
 if(kind==="ref"){ var dis=["rca","fish","why5","capa"].indexOf(row.how)<0; return '<td class="a3-r"><input type="text" dir="ltr"'+a+' list="'+id+'-l" value="'+esc(v)+'"><datalist id="'+id+'-l">'+(!dis?fill((recsOf(keyOf(row.how))||[]).map(function(z){ return [str(z.id),str(z.ref||"")+" · "+str(z.title)]; })):"")+'</datalist><div class="a3-pv" data-pv>'+esc(!dis&&txt(v)?preview(row.how,txt(v)):"")+'</div></td>'; }
 if(kind==="cause"||kind==="cm") return '<td class="a3-k"><select'+a+' data-cur="'+esc(v)+'"></select></td>';
 var m=/^sel:(\w+):(\w+)$/.exec(kind); if(m) return '<td class="a3-k"><select'+a+'>'+opts(LISTS[m[1]],m[2],v)+'</select></td>';
 return '<td></td>';
}
function rowHTML(tb,row,i){
 var extra=(tb==="cz"||tb==="cm")?' data-cid="'+esc(row.id)+'"'+(row.st==="out"?' class="st-out"':''):'';
 return '<tr data-row="'+i+'"'+extra+'>'+TB[tb].f.map(function(f){ return cellHTML(tb,f,row,i); }).join("")+'<td class="a3-x"><button type="button" class="ca-x" data-rdel="'+tb+':'+i+'" aria-label="'+esc(t(tb==="cz"?"czDel":(tb==="cm"?"cmDel":"tmDel")))+'" title="'+esc(t(tb==="cz"?"czDel":(tb==="cm"?"cmDel":"tmDel")))+'">✕</button></td></tr>';
}
var NONE={tm:"tmNone",pt:"ptNone",cz:"czNone",cm:"cmNone",pl:"plNone",rv:"rvNone"};
function renderTbl(tb,list){
 var box=document.getElementById(tb+"Rows"); if(!box) return;
 box.innerHTML=list.map(function(x,i){ return rowHTML(tb,x,i); }).join("");
 var ne=document.getElementById(NONE[tb]); if(ne) ne.textContent=list.length?"":t(NONE[tb]);
 autoSizeAll(box);
}
function readTbl(tb){
 var box=document.getElementById(tb+"Rows"); if(!box) return [];
 return [].map.call(box.querySelectorAll("tr[data-row]"),function(tr){
  var o=(tb==="cz"||tb==="cm")?{id:tr.getAttribute("data-cid")}:{};
  TB[tb].f.forEach(function(f){ var k=f[0], el=tr.querySelector('[data-k="'+k+'"]'); if(!el) return;
   if(f[1]==="num") o[k]=num(el.value); else if(el.tagName==="SELECT"&&(f[1]==="cause"||f[1]==="cm")) o[k]=el.value||el.getAttribute("data-cur")||""; else o[k]=txt(el.value); });
  return o;
 });
}
function autoSize(el){ if(!el||el.tagName!=="TEXTAREA") return; el.style.height="auto"; if(el.scrollHeight) el.style.height=(el.scrollHeight+2)+"px"; }
function autoSizeAll(root){ if(root) root.querySelectorAll("textarea").forEach(autoSize); }
function badNum(){ var bad=false; Object.keys(NUMF).forEach(function(k){ var el=document.getElementById("f-"+k); if(el&&el.value!==""&&isNaN(numRaw(el.value))) bad=true; if(el&&el.validity&&el.validity.badInput) bad=true; });
 document.querySelectorAll('#ptRows [data-k="v"]').forEach(function(el){ if((el.value!==""&&isNaN(numRaw(el.value)))||(el.validity&&el.validity.badInput)) bad=true; }); return bad; }
/* the record as it would be saved: empty rows dropped */
function formToRec(){
 var r=blank();
 Object.keys(PATH).forEach(function(k){ var el=document.getElementById("f-"+k); if(el) setP(r,PATH[k],NUMF[k]?num(el.value):txt(el.value)); });
 var fs=document.getElementById("f-fsame"); r.fu.same=!!(fs&&fs.checked);
 if(document.getElementById("tmRows")){
  r.team=readTbl("tm").map(fixTm).filter(function(m){ return m.n||m.role; });
  r.cur.pts=readTbl("pt").map(fixPt).filter(function(x){ return x.l||x.v!==null; });
  r.causes=readTbl("cz").map(fixCz).filter(function(x){ return x.t||x.ev; });
  r.cms=readTbl("cm").map(fixCm).filter(function(x){ return x.t||x.eff; });
  r.plan=readTbl("pl").map(fixPl).filter(function(x){ return x.what||x.who||x.when; });
  r.reviews=readTbl("rv").map(fixRv).filter(function(x){ return x.date||x.by||x.q||x.a; });
 }
 r.id=document.getElementById("rid").value;
 if(editing&&editing.id===r.id){ r.created=editing.created||""; }
 fixRec(r);
 return r;
}
/* while typing, the record keeps every row (even empty ones) so the tables keep their shape */
function formRaw(){ var o={}; Object.keys(TB).forEach(function(tb){ o[tb]=readTbl(tb); }); return o; }
function recToForm(r,keepMsg){
 r=fixRec(JSON.parse(JSON.stringify(r)));
 document.getElementById("rid").value=r.id||"";
 Object.keys(PATH).forEach(function(k){ var el=document.getElementById("f-"+k); if(!el) return; var v=getP(r,PATH[k]); v=(v===null||v===undefined)?"":String(v);
  if(k==="pcat"){ pcatOptions(r.pareto,v); return; } el.value=v||(el.tagName==="SELECT"&&el.options.length?el.options[0].value:""); });
 document.getElementById("f-fsame").checked=r.fu.same;
 renderTbl("tm",r.team); renderTbl("pt",r.cur.pts); renderTbl("cz",r.causes); renderTbl("cm",r.cms); renderTbl("pl",r.plan); renderTbl("rv",r.reviews);
 if(!keepMsg){ ["recErr","recOk","pkMsg"].forEach(function(id){ var e=document.getElementById(id); if(e) e.textContent=""; }); }
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
function selOptions(el,list){ var cur=el.getAttribute("data-sig")?el.value:(el.getAttribute("data-cur")||""), sig=JSON.stringify(list); if(el.getAttribute("data-sig")!==sig){ el.innerHTML=list.map(function(o){ return '<option value="'+esc(o[0])+'">'+esc(o[1])+'</option>'; }).join(""); el.setAttribute("data-sig",sig); }
 if(list.some(function(o){ return o[0]===cur; })) el.value=cur; else { el.value=list.length?list[0][0]:""; } el.setAttribute("data-cur",el.value); }
function setW(id,on,msg){ var w=document.getElementById(id); if(!w) return; w.hidden=!on; w.textContent=on?msg:""; }
/* the parts that depend on other rows are updated in place, so typing never loses focus */
function refreshForm(){
 var r=formToRec(), st=stageOf(r), CD=codes(r);
 var el=document.getElementById("curStage"); if(el) el.textContent=t("cur")+" "+stageName(st);
 var ci=STAGES.indexOf(st);
 document.getElementById("caSteps").innerHTML=STAGES.slice(1).map(function(s,i){ var j=i+1, cls=j<=ci?"done":(j===ci+1?"cur":""); return '<li class="'+cls+'" style="--sc:'+SCOL[s]+'"'+(j===ci+1||(st==="rev"&&s==="rev")?' aria-current="step"':'')+'><i aria-hidden="true"></i>'+esc(stageName(s))+'</li>'; }).join("");
 setW("coachWarn",coachOwn(r),t("coachW"));
 /* current condition: chart and gap */
 var cc=document.getElementById("curChart"); if(cc) cc.innerHTML=curSVG(r);
 var cp=document.getElementById("cpInfo"); if(cp) cp.textContent=r.cur.pareto?(byIdIn(PARETO_KEY,r.cur.pareto)?preview("pareto",r.cur.pareto):t("paMiss")):"";
 var gh=document.getElementById("gapHint"), b0=r.cur.base!==null?r.cur.base:r.goal.from;
 if(gh) gh.textContent=(b0!==null&&r.goal.to!==null)?t("gapHint",{d:fmtN(Math.round(Math.abs(b0-r.goal.to)*100)/100),u:txt(r.cur.unit),f:fmtN(b0),to:fmtN(r.goal.to)}).replace(/\s+/g," "):"";
 document.querySelectorAll("#ptRows tr").forEach(function(){});
 var addPt=document.querySelector('[data-add="pt"]'); if(addPt) addPt.disabled=formRaw().pt.length>=MAXPTS;
 /* goal */
 var gd=document.getElementById("goalDir"); if(gd) gd.textContent=(r.goal.from!==null&&r.goal.to!==null&&r.goal.from!==r.goal.to)?(r.goal.to<r.goal.from?t("dirDown"):t("dirUp")):"";
 setW("lateWarn",late(r),t("lateW")); setW("chgWarn",changed(r)&&!txt(r.goal.why),t("chgW"));
 var gw=document.getElementById("f-gwhy"); if(gw) gw.closest(".pd-f").style.display=(r.goal.orig!==null||txt(r.goal.why))?"":"none";
 /* analysis: picker preview, codes, previews, flags */
 var how=document.getElementById("pkHow").value, ref=txt(document.getElementById("pkRef").value);
 document.getElementById("pkPv").textContent=preview(how,ref);
 var hub=inHub(), ph=document.getElementById("pkHub"); if(ph){ ph.hidden=!hub; ph.textContent=hub?t("pkHub"):""; }
 document.querySelectorAll("#czRows tr[data-row]").forEach(function(tr,i){
  var id=tr.getAttribute("data-cid"), tt=txt(tr.querySelector('[data-k="t"]').value), evv=txt(tr.querySelector('[data-k="ev"]').value), s=tr.querySelector('[data-k="st"]').value, hw=tr.querySelector('[data-k="how"]').value, rf=tr.querySelector('[data-k="ref"]'), pv=tr.querySelector("[data-pv]");
  tr.querySelector("[data-code]").textContent="R"+(i+1);
  tr.classList.toggle("st-out",s==="out");
  var linked=["rca","fish","why5","capa"].indexOf(hw)>=0; if(rf){ rf.disabled=!linked; if(pv) pv.textContent=linked&&txt(rf.value)?preview(hw,txt(rf.value)):""; }
  var msg=[]; if(tt&&s!=="out"&&personOnly(tt)) msg.push(t("personF")); if(tt&&s==="conf"&&!evv) msg.push(t("noEv"));
  tr.querySelector("[data-flag]").textContent=msg.join(" "); tr.classList.toggle("a3-pf",!!tt&&s!=="out"&&personOnly(tt)); });
 document.getElementById("czSum").textContent=r.causes.length?t("czSum",{p:proved(r).length,h:hyps(r).length,o:r.causes.filter(function(c){ return c.st==="out"; }).length}):"";
 setW("personWarn",personCauses(r).length>0,t("personW"));
 /* countermeasures: the proved root causes they can be tied to */
 var P=provedIds(r), rows=[].slice.call(document.querySelectorAll("#czRows tr[data-row]")).map(function(tr,i){ return {id:tr.getAttribute("data-cid"),code:"R"+(i+1),t:txt(tr.querySelector('[data-k="t"]').value),st:tr.querySelector('[data-k="st"]').value}; });
 var cOpts=[["","—"]].concat(rows.filter(function(x){ return x.t&&x.st!=="out"; }).map(function(x){ return [x.id,x.code+(P[x.id]?" ✓ ":" ? ")+short(x.t,50)]; }));
 document.querySelectorAll("#cmRows tr[data-row]").forEach(function(tr,i){
  tr.querySelector("[data-code]").textContent="CM"+(i+1);
  var s=tr.querySelector('[data-k="cause"]'); selOptions(s,cOpts);
  var tt=txt(tr.querySelector('[data-k="t"]').value), ts=tr.querySelector('[data-k="test"]').value, msg=[];
  if(tt&&!P[s.value]) msg.push(t("untiedF")); if(tt&&(!ts||ts==="no")) msg.push(t("untestF"));
  tr.querySelector("[data-flag]").textContent=msg.join(" "); });
 var un=untreated(r); setW("treatWarn",un.length>0&&cmsOf(r).length>0,t("untreatW",{c:un.map(function(c){ return CD[c.id]; }).join("، ")}));
 /* plan */
 var mOpts=[["","—"]].concat([].slice.call(document.querySelectorAll("#cmRows tr[data-row]")).map(function(tr,i){ var tt=txt(tr.querySelector('[data-k="t"]').value); return tt?[tr.getAttribute("data-cid"),"CM"+(i+1)+" · "+short(tt,50)]:null; }).filter(Boolean));
 document.querySelectorAll('#plRows [data-k="cm"]').forEach(function(s){ selOptions(s,mOpts); });
 var up=unplanned(r); setW("planWarn",up.length>0&&r.plan.length>0,t("planW",{c:up.map(function(m){ return CD[m.id]; }).join("، ")}));
 var cn=document.getElementById("capaN"); if(cn){ cn.hidden=!!txt(r.capa)||["capa","ncr","audit"].indexOf(r.src)<0; cn.textContent=cn.hidden?"":t("capaN"); }
 /* follow-up */
 var sg=suggest(r), su=document.getElementById("fuSugg"); su.className="a3-sugg"+(sg?" "+sg:""); su.textContent=sg?t("fuSugg",{r:t("res_"+sg)}):t("fuNoSugg");
 var fc=document.getElementById("fuChart"), fh=fuSVG(r); fc.hidden=!fh; fc.innerHTML=fh;
 setW("sameWarn",!!txt(r.fu.measure)&&!!txt(r.goal.measure)&&low(r.fu.measure)!==low(r.goal.measure),t("sameW"));
 setW("stdWarn",fuOk(r)&&!stdOk(r),t("stdW"));
 setW("rvWarn",revOwn(r),t("rvOwnW"));
 /* header links */
 var pi=document.getElementById("pdInfo"); if(pi){ if(!r.pdca) pi.textContent=t("pdHint"); else { var p=pdcaCycles().filter(function(x){ return x.id===r.pdca; })[0]; pi.textContent=p?t("pdFound",{t:p.title||p.id}):t("pdMiss"); } }
 var ca=document.getElementById("caInfo"); if(ca) ca.textContent=r.capa?(byIdIn(CAPA_KEY,r.capa)?preview("capa",r.capa):t("caMiss")):t("caHint");
 var rc=document.getElementById("rcInfo"); if(rc){ var rr=r.rca?byIdIn(RCA_KEY,r.rca):null; rc.textContent=r.rca?(rr?preview("rca",r.rca)+(txt(str(obj(rr.crit).what))?" · "+t("pvCrit",{t:short(str(obj(rr.crit).what),80)}):""):t("rcMiss")):t("rcHint"); }
 pcatOptions(r.pareto);
 var pa=document.getElementById("paInfo"); if(pa) pa.textContent=r.pareto?(byIdIn(PARETO_KEY,r.pareto)?preview("pareto",r.pareto):t("paMiss")):t("paHint");
 var pcI=document.getElementById("pcInfo"); if(pcI){ var c2=(r.pareto&&r.pcat)?paCatInfo(r.pareto,r.pcat):null; pcI.textContent=c2?c2.txt:""; }
 /* the A3 page */
 var pgb=document.getElementById("a3Page"); if(pgb) pgb.innerHTML=pageHTML(r);
}
function validate(r){
 if(!r.title) return t("e_title");
 if(badNum()) return t("e_num");
 if(isD(r.fu.from)&&isD(r.fu.to)&&r.fu.from>r.fu.to) return t("e_fdate");
 if(isD(r.start)&&r.reviews.some(function(v){ return isD(v.date)&&v.date<r.start; })) return t("e_rdate");
 return "";
}
function newId(r){
 var y=(isD(r.start)?r.start:today()).slice(0,4), pre="A3-"+y+"-";
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

/* ---------- pick root causes from RCA, Fishbone or 5 Whys (read only) ---------- */
function pickRoots(){
 var how=document.getElementById("pkHow").value, id=txt(document.getElementById("pkRef").value), msg=document.getElementById("pkMsg");
 if(!id){ msg.textContent=t("nxNoData"); return; }
 var R=rootsFrom(how,id); if(R===null){ msg.textContent=t("nxMiss"); return; }
 if(!R.length){ msg.textContent=t("pkNone"); return; }
 var list=formRaw().cz, n=0, have=list.map(function(c){ return low(c.t); }), mx=0;
 list.concat(editing?editing.causes:[]).forEach(function(c){ var m=/^c(\d+)$/.exec(c.id||""); if(m) mx=Math.max(mx,+m[1]); });
 R.forEach(function(x){ if(have.indexOf(low(x.t))>=0||list.length>=MAXROWS) return; mx++; list.push({id:"c"+mx,t:x.t,ev:x.ev,how:x.how,ref:x.ref,st:x.st}); n++; });
 if(!n){ msg.textContent=t("pkDup"); return; }
 if(!document.getElementById("f-andate").value) document.getElementById("f-andate").value=today();
 renderTbl("cz",list); refreshForm(); msg.textContent=t("pkAdded",{n:n,id:id});
}
function startIn(how){
 var r=formToRec();
 if(how==="rca"){ openRca(r.capa?{capa:r.capa}:(r.pareto&&r.pcat?{pareto:r.pareto,cat:r.pcat}:{})); return; }
 if(how==="fish"){ openFish(r.capa?{capa:r.capa}:(r.pareto&&r.pcat?{pareto:r.pareto,cat:r.pcat}:{})); return; }
 openWhy5(r.capa?{capa:r.capa}:{});
}

/* ---------- start from an RCA investigation, a CAPA record or a Pareto vital-few category (read only, preview first) ---------- */
function stSelects(){ var s=document.getElementById("stSrc"); if(!s) return; var cur=s.value||"rca"; s.innerHTML=opts(["rca","capa","pareto"],"ss_",cur); }
function stRows(src){
 if(src==="rca"){ var R=recsOf(RCA_KEY); return R?R.map(function(c){ return {k:"rca",c:c}; }):null; }
 if(src==="capa"){ var C=recsOf(CAPA_KEY); return C?C.map(function(c){ return {k:"capa",c:c}; }):null; }
 var P=recsOf(PARETO_KEY); if(!P) return null; var o=[];
 P.forEach(function(p){ var K=paRank(p); K.rows.filter(function(x){ return x.vit; }).forEach(function(x){ o.push({k:"pareto",p:p,x:x,tot:K.total}); }); });
 return o;
}
function th(keys){ return '<thead><tr>'+keys.map(function(k){ return '<th>'+esc(t(k))+'</th>'; }).join("")+'</tr></thead>'; }
function stPreview(keep){
 var src=document.getElementById("stSrc").value||"rca", msg=document.getElementById("stMsg"), box=document.getElementById("stTable"), R=stRows(src);
 if(!R){ ST=null; box.hidden=true; msg.textContent=t("stNone"); return; }
 if(!R.length){ ST=null; box.hidden=true; msg.textContent=t("stEmpty"); return; }
 ST={src:src}; if(!keep) msg.textContent="";
 box.hidden=false;
 if(src==="rca") box.innerHTML='<table class="pd-tbl">'+th(["stColId","stColT","stColSt","stColRoot","stColCrit","stColN","stColA"])+'<tbody>'+
  R.map(function(x){ var c=x.c, id=str(c.id), n=DB.records.filter(function(r){ return r.rca===id; }).length;
   return '<tr><td><b dir="ltr">'+esc(id)+'</b></td><td><b dir="ltr">'+esc(str(c.ref))+'</b><br>'+esc(str(c.title))+'</td><td>'+esc(t("rst_"+rcaStage(c)))+'</td><td>'+esc(short(rcaRoots(c).map(function(z){ return str(z.t); }).join(" · "),120)||"—")+'</td><td>'+esc(short(str(obj(c.crit).what),80)||"—")+'</td><td>'+n+'</td><td><button class="pd-rowbtn" type="button" data-strca="'+esc(id)+'">'+esc(t("stUse"))+'</button></td></tr>'; }).join("")+'</tbody></table>';
 else if(src==="capa") box.innerHTML='<table class="pd-tbl">'+th(["stColId","stColT","stColSt","stColRoot","stColN","stColA"])+'<tbody>'+
  R.map(function(x){ var c=x.c, id=str(c.id), n=DB.records.filter(function(r){ return r.capa===id; }).length;
   return '<tr><td><b dir="ltr">'+esc(id)+'</b></td><td><b dir="ltr">'+esc(str(c.ref))+'</b><br>'+esc(str(c.title))+'</td><td>'+esc(t("cst_"+capaStage(c)))+'</td><td>'+esc(short(str(obj(c.cause).root),90)||"—")+'</td><td>'+n+'</td><td><button class="pd-rowbtn" type="button" data-stcapa="'+esc(id)+'">'+esc(t("stUse"))+'</button></td></tr>'; }).join("")+'</tbody></table>';
 else box.innerHTML='<table class="pd-tbl">'+th(["stColId","stColCat","stColV","stColPer","stColN","stColA"])+'<tbody>'+
  R.map(function(z){ var p=z.p, x=z.x, id=str(p.id), cid=str(x.c.id), n=DB.records.filter(function(r){ return r.pareto===id&&r.pcat===cid; }).length;
   return '<tr><td><b dir="ltr">'+esc(id)+'</b><br><small>'+esc(short(str(p.title),70))+'</small></td><td>'+esc(str(x.c.name))+'</td><td dir="ltr">'+esc(fmtN(x.v)+(puName(p.unit)?" "+puName(p.unit):"")+" · "+(Math.round(x.share*10)/10).toFixed(1)+"%")+'</td><td dir="ltr">'+esc((str(p.from)||"—")+" → "+(str(p.to)||"—"))+'</td><td>'+n+'</td><td><button class="pd-rowbtn" type="button" data-stpa="'+esc(id)+'" data-cat="'+esc(cid)+'">'+esc(t("stUse"))+'</button></td></tr>'; }).join("")+'</tbody></table>';
}
function prefilled(r,msgKey,v){ fixRec(r); editing=null; recToForm(r); go("tools"); document.getElementById("recOk").textContent=t(msgKey,v); return true; }
/* a new A3 filled from an RCA investigation; the investigation is only read. The goal is not copied: the owner writes it, dated. */
function prefillFromRca(id){
 var c=byIdIn(RCA_KEY,id); if(!c) return false;
 var r=blank(), p=obj(c.prob), cr=obj(c.crit);
 r.title=str(c.title); r.ref=str(c.ref); r.src="rca"; r.rca=str(c.id); r.capa=str(c.capa); r.pareto=str(c.pareto); r.pcat=str(c.pcat); r.pdca=str(c.pdca); r.area=str(c.area); r.owner=str(c.lead); r.start=today();
 r.team=arr(c.team).map(function(m){ return {n:str(m.n),role:str(m.role)}; });
 r.bg.text=txt(str(p.what)); r.bg.measure=""; if(txt(str(p.req))) r.bg.text+=(r.bg.text?" ":"")+t("pfBgR",{req:str(p.req),much:str(p.much)||"—"});
 r.cur.pareto=str(c.pareto); r.cur.period=str(p.when);
 r.causes=rcaRoots(c).map(function(z,i){ return {id:"c"+(i+1),t:str(z.t),ev:str(z.ev),how:"rca",ref:str(c.id),st:z.st==="conf"&&txt(str(z.ev))?"conf":"hyp"}; });
 r.andate=isD(str(c.date))?str(c.date):"";
 prefilled(r,"stUsedR",{id:str(c.id)});
 if(txt(str(cr.what))) document.getElementById("recOk").textContent+=" "+t("pfCritR",{id:str(c.id),t:str(cr.what)});
 return true;
}
/* a new A3 filled from a CAPA record; the CAPA record is only read */
function prefillFromCapa(id){
 var c=byIdIn(CAPA_KEY,id); if(!c) return false;
 var r=blank(), cs=obj(c.cause);
 r.title=str(c.title); r.ref=str(c.ref); r.src="capa"; r.capa=str(c.id); r.pdca=str(c.pdca); r.area=str(c.area); r.owner=str(c.owner); r.start=today();
 r.bg.text=str(c.desc);
 if(txt(str(cs.root))) r.causes.push({id:"c1",t:str(cs.root),ev:"",how:"capa",ref:str(c.id),st:"hyp"});
 return prefilled(r,"stUsedC",{id:str(c.id)});
}
/* a new A3 filled from a Pareto category: the ranked categories become the current-condition chart; the analysis is only read */
function prefillFromPareto(pid,cid){
 var I=paCatInfo(pid,cid); if(!I) return false;
 var p=I.p, x=I.x, r=blank(), K=paRank(p);
 r.title=short(str(x.c.name)+" — "+str(p.title),120); r.ref=str(p.ref)||str(p.id); r.src="pareto"; r.pareto=str(p.id); r.pcat=str(x.c.id); r.pdca=str(p.pdca); r.area=str(p.area); r.start=today();
 r.cur.measure=t("pfCurP",{c:str(x.c.name),id:str(p.id)}); r.cur.unit=puName(p.unit); r.cur.base=x.v; r.cur.period=(isD(p.from)&&isD(p.to))?str(p.from)+" → "+str(p.to):""; r.cur.pareto=str(p.id); r.cur.chart="bar";
 r.cur.pts=K.rows.filter(function(z){ return z.v>0; }).slice(0,MAXPTS).map(function(z){ return {l:str(z.c.name),v:z.v}; });
 r.bg.measure=r.cur.measure;
 var nx=obj(x.c.nx); if(nx.how==="capa") r.capa=str(nx.ref); if(nx.how==="rca") r.rca=str(nx.ref);
 return prefilled(r,"stUsedP",{id:str(p.id),c:str(x.c.name)});
}
document.getElementById("stSrc").addEventListener("change",function(){ ST=null; document.getElementById("stTable").hidden=true; document.getElementById("stMsg").textContent=""; });
document.getElementById("stPrev").addEventListener("click",function(){ stPreview(false); });
document.getElementById("stTable").addEventListener("click",function(e){ var a=e.target.closest("[data-strca]"); if(a){ prefillFromRca(a.getAttribute("data-strca")); return; } var b=e.target.closest("[data-stcapa]"); if(b){ prefillFromCapa(b.getAttribute("data-stcapa")); return; } var p=e.target.closest("[data-stpa]"); if(p) prefillFromPareto(p.getAttribute("data-stpa"),p.getAttribute("data-cat")); });
function homeCounts(){ var n=0; (recsOf(PARETO_KEY)||[]).forEach(function(p){ n+=paRank(p).rows.filter(function(x){ return x.vit; }).length; });
 return {r:(recsOf(RCA_KEY)||[]).length,c:(recsOf(CAPA_KEY)||[]).filter(function(x){ return capaStage(x)!=="closed"; }).length,p:n}; }
function renderHomeSt(){
 var box=document.getElementById("homeImp"); if(!box) return;
 var h=homeCounts(), n=h.r+h.c+h.p; box.hidden=!n || DB.records.length>0; if(n) document.getElementById("homeImpT").textContent=t("hmT",h);
}
document.getElementById("homeImpGo").addEventListener("click",function(){ go("tools"); var s=document.getElementById("stSrc"), h=homeCounts(); if(s) s.value=h.r?"rca":(h.c?"capa":"pareto"); stPreview(false); var b=document.getElementById("stBox"); if(b&&b.scrollIntoView) b.scrollIntoView({block:"start"}); });

/* ---------- self-assessment ---------- */
var AQ=[
 ["OW1",{ar:"هل لكل صفحة A3 مالك واحد يكتبها بنفسه، وموجّه أو مرشد غير المالك يراجعها؟",en:"Does every A3 have one owner who writes it, and a coach or mentor other than the owner who reviews it?"}],
 ["OW2",{ar:"هل تُستخدم صفحة A3 في محادثات توجيه يسأل فيها الموجّه ولا يملي الحلول، فيتعلم المالك طريقة التفكير؟",en:"Is the A3 used for coaching conversations where the coach asks rather than dictates solutions, so the owner learns the way of thinking?"}],
 ["PL1",{ar:"هل ترتبط الخلفية بمقياس يهم العميل أو السلامة أو التكلفة أو الاستراتيجية، لا بانطباع عام؟",en:"Is the background tied to a measure that matters to the customer, safety, cost or strategy, not to a general impression?"}],
 ["PL2",{ar:"هل يُعرض الوضع الحالي بالوقائع والبيانات مرسومة (رسم أو خريطة أو أرقام)، مع قيمة أساسية وفترتها؟",en:"Is the current condition shown with facts and data, drawn (a chart, a map, numbers), with a baseline value and its period?"}],
 ["PL3",{ar:"هل يُكتب الهدف رقماً بموعد قبل معرفة الأسباب، ولا يُعدَّل إلا بسبب مكتوب؟",en:"Is the goal written as a number with a date before the causes are known, and changed only with a written reason?"}],
 ["AN1",{ar:"هل تُثبت الأسباب الجذرية بالدليل قبل اختيار الإجراءات، ونرفض «الخطأ البشري» سبباً جذرياً؟",en:"Are the root causes proved with evidence before countermeasures are chosen, and do we refuse “human error” as a root cause?"}],
 ["AN2",{ar:"هل نستخدم طرق الصندوق المناسبة (باريتو وعظمة السمكة ولماذا الخمس وRCA والبيانات) بدل الرأي؟",en:"Do we use the right toolbox methods (Pareto, Fishbone, 5 Whys, RCA and data) instead of opinion?"}],
 ["DO1",{ar:"هل يرتبط كل إجراء مضاد بسبب جذري مثبت، ويُختبر على نطاق صغير قبل تعميمه؟",en:"Is every countermeasure tied to a proved root cause, and tested on a small scale before it is rolled out?"}],
 ["DO2",{ar:"هل للخطة مالك وتاريخ لكل خطوة، وتنتقل الإجراءات التصحيحية لعدم المطابقة إلى سجل CAPA؟",en:"Does the plan have an owner and a date for every step, with the corrective actions of a nonconformity carried in a CAPA record?"}],
 ["CK1",{ar:"هل نقيس الأثر بالمقياس نفسه لفترة محددة ونقارنه بالهدف قبل الحكم بالنجاح؟",en:"Do we measure the effect on the same measure over a stated period and compare it with the goal before we call it a success?"}],
 ["CK2",{ar:"هل نوحّد ما نجح (إجراء أو نموذج أو تدريب)، أو نبدأ صفحة أو دورة جديدة عندما لا يتحقق الهدف؟",en:"Do we standardise what worked (a procedure, a form, training), or start a new A3 or cycle when the goal is not met?"}],
 ["CK3",{ar:"هل نشارك الدروس من صفحات A3 مع الفرق والمواقع الأخرى ونحفظها معرفةً للمنشأة؟",en:"Do we share the lessons from A3s with other teams and sites and keep them as organizational knowledge?"}]
];
var AGROUPS=["OW","PL","AN","DO","CK"];
var GCOL={OW:"#7A869E",PL:"#C2410C",AN:"#1B2A4A",DO:"#C9821A",CK:"#3C9A5F"};
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
function resOf(r){ return fuOk(r)?r.fu.res:""; }
function renderDocs(){
 var box=document.getElementById("docsBox"); if(!box) return;
 var c0=document.getElementById("cntDocs"); if(c0) c0.textContent=DB.records.length?String(DB.records.length):"";
 if(!DB.records.length){ box.innerHTML='<div class="pd-empty">'+esc(t("none"))+'</div>'; return; }
 var rows=DB.records.map(function(r){
  var st=stageOf(r), res=resOf(r), L2=live(r);
  var del=(pendingDelete===r.id)?'<button class="pd-rowbtn arm" type="button" data-del="'+esc(r.id)+'">'+esc(t("delArm"))+'</button>':'<button class="pd-rowbtn" type="button" data-del="'+esc(r.id)+'">'+esc(t("del"))+'</button>';
  var lk=(r.rca?'<button class="pd-rowbtn" type="button" data-orca="'+esc(r.rca)+'">RCA ↗</button>':'')+(r.capa?'<button class="pd-rowbtn" type="button" data-capa="'+esc(r.capa)+'">CAPA ↗</button>':'')+(r.pdca?'<button class="pd-rowbtn" type="button" data-pdca="'+esc(r.pdca)+'">PDCA ↗</button>':'');
  return '<tr><td><b dir="ltr">'+esc(r.ref||"—")+'</b><br>'+esc(r.title)+'<br><small dir="ltr" style="color:var(--muted)">'+esc(r.id)+'</small></td><td>'+esc(r.owner||"—")+'<br><small>'+esc(r.coach||"—")+'</small></td><td><span class="pd-badge" style="background:'+SCOL[st]+';color:#fff">'+esc(stageName(st))+'</span><br><small>'+esc(t("src_"+r.src))+'</small></td><td>'+esc(txt(r.goal.measure)?short(r.goal.measure,60)+" · "+goalLine(r):"—")+'</td><td>'+(res?'<span class="ca-chip '+(res==="met"?"ok":(res==="part"?"warn":"bad"))+'">'+esc(t("res_"+res))+'</span>':esc(t("resPend")))+'</td><td>'+(L2.length?esc(t("czN",{p:proved(r).length,n:L2.length})):"—")+'</td><td>'+flagsOf(r).map(chip).join("")+'</td><td><button class="pd-rowbtn" type="button" data-open="'+esc(r.id)+'">'+esc(t("open"))+'</button>'+del+lk+'</td></tr>';
 }).join("");
 box.innerHTML='<table class="pd-tbl">'+th(["colRef","colOwn","colStage","colGoal","colRes","colCz","colFlags","colAct"])+'<tbody>'+rows+'</tbody></table>';
}
document.addEventListener("click",function(e){
 if(e.target.closest("#cb")) return;
 var o=e.target.closest("[data-open]"); if(o){ var r=DB.records.find(function(x){ return x.id===o.getAttribute("data-open"); }); if(r){ loadRecordIntoForm(r); go("tools"); } return; }
 var d=e.target.closest("[data-del]"); if(d){ var id=d.getAttribute("data-del"); if(pendingDelete===id){ DB.records=DB.records.filter(function(x){ return x.id!==id; }); pendingDelete=null; persist(); if(document.getElementById("rid").value===id) clearForm(); renderAll(); } else { pendingDelete=id; renderDocs(); } return; }
 if(e.target.closest("[data-pdca]")||e.target.closest("#pdOpen")){ openTool("pdca.html","docs"); return; }
 if(e.target.closest("[data-capa]")||e.target.closest("#caOpen")||e.target.closest("#plCapa")){ openTool("capa.html","docs"); return; }
 var oc=e.target.closest("[data-orca]"); if(oc){ openRca({open:oc.getAttribute("data-orca")}); return; }
 if(e.target.closest("#rcOpen")){ var rv=txt(document.getElementById("f-rca").value); openRca(rv?{open:rv}:{}); return; }
 if(e.target.closest("#paOpen")){ var pv=txt(document.getElementById("f-pareto").value); openPareto(pv?{open:pv}:{}); return; }
 if(e.target.closest("#pkUse")){ pickRoots(); return; }
 var sb=e.target.closest("[data-start]"); if(sb){ startIn(sb.getAttribute("data-start")); return; }
 var ad=e.target.closest("[data-add]"); if(ad){ var tb=ad.getAttribute("data-add"), raw=formRaw()[tb], mx=TB[tb].max||MAXROWS; if(raw.length<mx){
   if(tb==="cz"||tb==="cm"){ var pre=tb==="cz"?"c":"k", n=0, re=new RegExp("^"+pre+"(\\d+)$"); raw.concat(editing?(tb==="cz"?editing.causes:editing.cms):[]).forEach(function(c){ var m=re.exec(c.id||""); if(m) n=Math.max(n,+m[1]); }); raw.push(tb==="cz"?blankCz("c"+(n+1)):blankCm("k"+(n+1))); }
   else raw.push(TB[tb].blank());
   renderTbl(tb,raw); var box=document.getElementById(tb+"Rows"), lt=box&&box.querySelector("tr:last-child textarea, tr:last-child input:not([disabled]), tr:last-child select"); if(lt) lt.focus(); } refreshForm(); return; }
 var rd=e.target.closest("[data-rdel]"); if(rd){ var a=rd.getAttribute("data-rdel").split(":"), l2=formRaw()[a[0]]; l2.splice(Number(a[1]),1); renderTbl(a[0],l2); refreshForm(); return; }
});
/* a new method clears the id recorded for the old one, and the row is redrawn with the right list of ids */
document.addEventListener("change",function(e){
 var el=e.target; if(!el||!el.closest) return;
 if(el.closest("#czRows")&&el.getAttribute("data-k")==="how"){ var raw=formRaw().cz, i=Number(el.closest("tr").getAttribute("data-row")); if(raw[i]){ raw[i].ref=""; raw[i].how=el.value; } renderTbl("cz",raw); refreshForm(); var s=document.querySelector('#czRows tr[data-row="'+i+'"] [data-k="how"]'); if(s) s.focus(); }
 if(el.matches&&(el.matches('#cmRows [data-k="cause"]')||el.matches('#plRows [data-k="cm"]'))) el.setAttribute("data-cur",el.value);
 if(el.id==="f-pareto"){ var pc=document.getElementById("f-pcat"); if(pc){ pc.setAttribute("data-cur",""); pc.value=""; } }
 if(el.id==="pkHow"){ document.getElementById("pkRef").value=""; fillLists(); }
},true);

/* ---------- automatic audit of A3s ---------- */
var CHECKS=["ref","coach","bg","cur","goal","cause","tie","test","plan","fu","std","rev"];
function auditRecord(r){
 var res={}, M=cmsOf(r);
 res.ref=!!txt(r.ref)&&!!txt(r.owner);
 res.coach=!!txt(r.coach)&&!coachOwn(r);
 res.bg=bgOk(r);
 res.cur=atLeast(r,"bg")?curOk(r):null;
 res.goal=atLeast(r,"cur")?goalOk(r):null;
 res.cause=atLeast(r,"goal")?anOk(r):null;
 res.tie=M.length?!untied(r).length:null;
 res.test=M.length?!untested(r).length:null;
 res.plan=atLeast(r,"cm")?!unplanned(r).length:null;
 res.fu=atLeast(r,"plan")&&((isD(r.fu.to)&&r.fu.to<=today())||r.fu.value!==null||!!r.fu.res)?fuOk(r):null;   /* applies once the follow-up period has ended or a result is entered */
 res.std=atLeast(r,"fu")?stdOk(r):null;
 res.rev=atLeast(r,"fu")?revOk(r):null;
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
function tiedAll(r){ return cmsOf(r).length>0&&!untied(r).length; }
function counts(){
 var R=DB.records, c={n:R.length,met:0,tie:0,before:0,rev:0,rca:0,person:0,res:{met:0,part:0,not:0,none:0},src:{}};
 SRCS.forEach(function(s){ c.src[s]=0; });
 R.forEach(function(r){ var x=resOf(r);
  if(x==="met"||x==="part") c.met++; if(tiedAll(r)) c.tie++; if(goalNum(r)&&goalBefore(r)) c.before++; if(stageOf(r)==="rev") c.rev++; if(txt(r.rca)) c.rca++;
  c.person+=personCauses(r).length; c.res[x||"none"]++; c.src[r.src]++; });
 return c;
}
function pct(a,n){ return n?Math.round(a/n*100)+"%":"—"; }
function renderDash(){
 var box=document.getElementById("dKpis"); if(!box) return;
 var c=counts(), au=auditSummary(), as=assessScore(), n=c.n, oi=openItems();
 box.innerHTML=TBX.kpi(n,t("kTotal"))+TBX.kpi(pct(c.met,n),t("kMet"))+TBX.kpi(pct(c.tie,n),t("kTie"))+TBX.kpi(pct(c.before,n),t("kBefore"))+TBX.kpi(c.rev,t("kRev"))+TBX.kpi(c.rca,t("kRca"))+TBX.kpi(c.person,t("kPerson"))+TBX.kpi(oi.length,t("kOpen"))+TBX.kpi(au.rate===null?"—":au.rate+"%",t("kAud"))+TBX.kpi(as+"%",t("kAs"));
 var nd='<p class="pd-sub" style="color:var(--ink-soft)">'+esc(t("noData"))+'</p>';
 document.getElementById("dStage").innerHTML=n?TBX.dist(STAGES,n,function(s){ return DB.records.filter(function(r){ return stageOf(r)===s; }).length; },stageName,function(s){ return SCOL[s]; }):nd;
 document.getElementById("dRes").innerHTML=n?TBX.dist(["met","part","not","none"],n,function(k){ return c.res[k]; },function(k){ return k==="none"?t("resPend"):t("res_"+k); },function(k){ return RCOL[k]; }):nd;
 document.getElementById("dSrc").innerHTML=n?TBX.dist(SRCS,n,function(k){ return c.src[k]; },function(k){ return t("src_"+k); },function(){ return "#1B2A4A"; }):nd;
 document.getElementById("dAssess").innerHTML=AGROUPS.map(function(g){ var p=assessScore(g); return TBX.bar(t("g_"+g),p+"%",p,GCOL[g]); }).join("")+'<p class="pd-sub" style="font-size:12.5px;color:var(--muted);margin:10px 0 0">'+esc(t("bandNote"))+'</p>';
 document.getElementById("dOpen").innerHTML=oi.length?oi.map(function(x){ return '<li><b>'+esc(x.r.ref||x.r.id)+'</b>'+chip([x.r.id,"info"])+'<span>'+esc(x.s)+'</span></li>'; }).join(""):'<li>'+esc(n?t("noOpen"):t("noData"))+'</li>';
}

/* ---------- report and CSV ---------- */
function buildCSV(){
 var head=["id","ref","title","source","owner","coach","sponsor","area","start","rca","capa","pareto","paretoCategory","pdca","stage","team","whyItMatters","background","backgroundMeasure",
  "currentMeasure","unit","baseline","period","chart","dataPoints","currentPareto","gap","goalMeasure","goalFrom","goalTo","goalBy","goalWritten","goalFirstTarget","goalChangeReason","analysisStarted",
  "rootCauses","countermeasures","plan","followUpMeasure","sameMeasure","followUpFrom","followUpTo","followUpValue","result","computedResult","standardised","leftOpen","nextStep","coachReviews"];
 return TBX.csv(head,DB.records.map(function(r){
  var CD=codes(r);
  var cz=r.causes.map(function(c){ return CD[c.id]+" ["+c.st+"] "+c.t+(c.ev?" — "+c.ev:"")+(c.how?" ("+c.how+(c.ref?" "+c.ref:"")+")":""); }).join(" | ");
  var cm=r.cms.map(function(m){ return CD[m.id]+" → "+(CD[m.cause]||"—")+": "+m.t+(m.eff?" — "+m.eff:"")+" [test "+(m.test||"—")+"]"; }).join(" | ");
  var pl=r.plan.map(function(p){ return (CD[p.cm]||"—")+": "+p.what+" — "+p.who+" "+p.when+" ["+p.st+"]"; }).join(" | ");
  var rv=r.reviews.map(function(v){ return v.date+" "+v.by+": "+v.q+(v.a?" → "+v.a:""); }).join(" | ");
  return [r.id,r.ref,r.title,r.src,r.owner,r.coach,r.sponsor,r.area,r.start,r.rca,r.capa,r.pareto,r.pcat,r.pdca,stageOf(r),r.team.map(function(m){ return m.n+(m.role?" ("+m.role+")":""); }).join(" | "),r.bg.why,r.bg.text,r.bg.measure,
   r.cur.measure,r.cur.unit,vstr(r.cur.base),r.cur.period,r.cur.chart,r.cur.pts.map(function(p){ return p.l+": "+vstr(p.v); }).join(" | "),r.cur.pareto,r.cur.gap,r.goal.measure,vstr(r.goal.from),vstr(r.goal.to),r.goal.by,r.goal.date,vstr(r.goal.orig),r.goal.why,r.andate,
   cz,cm,pl,r.fu.measure,r.fu.same?"yes":"no",r.fu.from,r.fu.to,vstr(r.fu.value),r.fu.res,suggest(r),r.fu.std,r.fu.open,r.fu.next,rv]; }));
}
function recReport(r){
 var CD=codes(r), A=auditRecord(r);
 var row=function(k,v){ return '<tr><th>'+esc(k)+'</th><td>'+esc(v===null||v===undefined||v===""?"—":v)+'</td></tr>'; };
 var mark=function(v){ return v===null?'<td class="na">—</td>':(v?'<td class="ok">✓</td>':'<td class="bad">✗</td>'); };
 var tbl=function(list,heads,cells){ return list.length?'<table><thead><tr>'+heads.map(function(h){ return '<th>'+esc(t(h))+'</th>'; }).join("")+'</tr></thead><tbody>'+list.map(function(x){ return '<tr>'+cells(x).map(function(c){ return '<td>'+esc(c===""||c===null?"—":c)+'</td>'; }).join("")+'</tr>'; }).join("")+'</tbody></table>':'<p class="meta">—</p>'; };
 return '<section class="an"><h3><span dir="ltr">'+esc(r.id)+'</span> · <span dir="ltr">'+esc(r.ref||"—")+'</span> — '+esc(r.title)+'</h3>'+
  '<p class="meta">'+esc(t("colStage"))+': <b>'+esc(stageName(stageOf(r)))+'</b> · '+esc(t("src_"+r.src))+(r.rca?' · RCA <span dir="ltr">'+esc(r.rca)+'</span>':'')+(r.capa?' · CAPA <span dir="ltr">'+esc(r.capa)+'</span>':'')+(r.pareto?' · Pareto <span dir="ltr">'+esc(r.pareto+(r.pcat?" / "+r.pcat:""))+'</span>':'')+(r.pdca?' · PDCA <span dir="ltr">'+esc(r.pdca)+'</span>':'')+'</p>'+
  '<table><tbody>'+row(t("f_owner"),r.owner)+row(t("f_coach"),r.coach)+row(t("f_sponsor"),r.sponsor)+row(t("f_start"),r.start)+row(t("f_area"),r.area)+row(t("sHdrT"),r.team.map(function(m){ return m.n+(m.role?" ("+m.role+")":""); }).join("، "))+'</tbody></table>'+
  '<h4>1 · '+esc(t("sBgT"))+'</h4><table><tbody>'+row(t("f_why"),r.bg.why?t("why_"+r.bg.why):"")+row(t("f_bgtext"),r.bg.text)+row(t("f_bgmeasure"),r.bg.measure)+'</tbody></table>'+
  '<h4>2 · '+esc(t("sCurT"))+'</h4><table><tbody>'+row(t("f_cmeasure"),r.cur.measure)+row(t("f_cbase"),r.cur.base===null?"":fmtN(r.cur.base)+" "+r.cur.unit)+row(t("f_cperiod"),r.cur.period)+row(t("f_cpareto"),r.cur.pareto)+row(t("f_cgap"),r.cur.gap)+'</tbody></table>'+
  tbl(r.cur.pts,["ptL","ptV"],function(p){ return [p.l,fmtN(p.v)]; })+
  '<h4>3 · '+esc(t("sGoalT"))+'</h4><table><tbody>'+row(t("f_gmeasure"),r.goal.measure)+row(t("colGoal"),goalLine(r))+row(t("f_gdate"),r.goal.date)+row(t("f_andate"),r.andate)+(changed(r)?row(t("f_gorig"),fmtN(r.goal.orig))+row(t("f_gwhy"),r.goal.why):"")+'</tbody></table>'+
  '<h4>4 · '+esc(t("sAnT"))+'</h4>'+tbl(r.causes,["czCode","czT","czEv","czHow","czRef","czSt"],function(c){ return [CD[c.id],c.t+(personOnly(c.t)&&c.st!=="out"?" ⚠":""),c.ev,c.how?t("how_"+c.how):"",c.ref,t("cs_"+c.st)]; })+
  '<h4>5 · '+esc(t("sCmT"))+'</h4>'+tbl(r.cms,["cmCode","cmCause","cmT","cmEff","cmTest"],function(m){ return [CD[m.id],CD[m.cause]||"",m.t,m.eff,m.test?t("ts_"+m.test):""]; })+
  '<h4>6 · '+esc(t("sPlanT"))+'</h4>'+tbl(r.plan,["plCm","plWhat","plWho","plWhen","plSt"],function(p){ return [CD[p.cm]||"",p.what,p.who,p.when,t("ps_"+p.st)]; })+
  '<h4>7 · '+esc(t("sFuT"))+'</h4><table><tbody>'+row(t("f_fmeasure"),r.fu.measure)+row(t("f_fsame"),r.fu.same?t("yes"):t("no"))+row(t("f_ffrom"),(r.fu.from||"—")+" → "+(r.fu.to||"—"))+row(t("f_fvalue"),r.fu.value===null?"":fmtN(r.fu.value)+" "+r.cur.unit)+row(t("f_fres"),r.fu.res?t("res_"+r.fu.res):"")+row(t("fuSugg",{r:""}).replace(/[:：]\s*$/,""),suggest(r)?t("res_"+suggest(r)):"")+row(t("f_fstd"),r.fu.std)+row(t("f_fopen"),r.fu.open)+row(t("f_fnext"),r.fu.next)+'</tbody></table>'+
  '<h4>'+esc(t("sRevT"))+'</h4>'+tbl(r.reviews,["rvDate","rvBy","rvQ","rvA"],function(v){ return [v.date,v.by,v.q,v.a]; })+
  '<h4>'+esc(t("rpAu"))+'</h4><table><thead><tr>'+CHECKS.map(function(k){ return '<th>'+esc(t("c_"+k))+'</th>'; }).join("")+'</tr></thead><tbody><tr>'+CHECKS.map(function(k){ return mark(A[k]); }).join("")+'</tr></tbody></table></section>';
}
var PAGE_CSS=".a3p{border:2px solid #1B2A4A;border-radius:6px;background:#fff;color:#1B2A4A;font-size:11.5px;line-height:1.45;aspect-ratio:1.414/1;display:flex;flex-direction:column;margin:10px 0 18px;break-inside:avoid;page-break-inside:avoid}.a3p .a3p-h{display:flex;flex-wrap:wrap;gap:4px 14px;align-items:baseline;background:#1B2A4A;color:#fff;padding:6px 10px}.a3p .a3p-h b{font-family:Georgia,serif;font-size:14px}.a3p .a3p-h span{font-size:11px;color:#E9D8A6}.a3p .a3p-g{flex:1;display:grid;grid-template-columns:1fr 1fr}.a3p .a3p-c{display:flex;flex-direction:column;min-width:0;border-inline-start:1px solid #DCE4EE}.a3p .a3p-c:first-child{border-inline-start:0}.a3p .a3p-ht{font-size:10px;font-weight:700;letter-spacing:.04em;color:#B8901E;padding:4px 8px 0;text-transform:uppercase}.a3p .a3p-b{border-top:1px solid #DCE4EE;padding:4px 8px 6px;flex:1 1 auto}.a3p .a3p-b h5{margin:0 0 2px;font-size:11.5px;display:flex;gap:6px;align-items:center}.a3p .a3p-b h5 i{font-style:normal;display:inline-grid;place-items:center;width:17px;height:17px;border-radius:50%;background:var(--bc,#1B2A4A);color:#fff;font-size:10px}.a3p .a3p-b p{margin:0 0 2px}.a3p .a3p-b ul{margin:0;padding-inline-start:16px}.a3p .a3p-b small{color:#4B5874}.a3p .mt{color:#7A869E;font-style:italic}.a3p svg{display:block;max-width:100%;height:auto;max-height:118px}.a3p table{margin:0;font-size:10.5px}.a3p th{background:none;color:#4B5874;padding:1px 4px}.a3p td{padding:1px 4px;border-bottom:1px solid #EEF2F7}.a3p td[dir=ltr]{white-space:nowrap}@media (max-width:640px){.a3p{aspect-ratio:auto}.a3p .a3p-g{grid-template-columns:1fr}}@media print{@page{size:A3 landscape;margin:10mm}.a3p{page-break-after:always}}";
function buildReportHTML(){
 var c=counts(), au=auditSummary(), as=assessScore(), d=today(), n=c.n, A=TBX.audit(DB.records,auditRecord,CHECKS), oi=openItems();
 var mark=function(v){ return v===null?'<td class="na">—</td>':(v?'<td class="ok">✓</td>':'<td class="bad">✗</td>'); };
 var grpRows=AGROUPS.map(function(g){ return '<tr><td>'+esc(t("g_"+g))+' — '+g+'</td><td>'+assessScore(g)+'%</td></tr>'; }).join("");
 var auRows=A.rows.map(function(x){ return '<tr><td dir="ltr">'+esc(x.r.id)+'</td>'+CHECKS.map(function(k){ return mark(x.res[k]); }).join("")+'</tr>'; }).join("");
 var body='<div class="cover"><p class="kick">Continual Improvement Academy · CIA Toolbox</p><h1>A3 Problem Solving / حل المشكلات بأسلوب A3</h1><p class="sub">'+esc(t("rpCover"))+'</p>'+
  '<p class="meta">'+esc(t("prep"))+': <bdi><strong>مدثر سلامه</strong></bdi> · <bdi dir="ltr">'+esc(d)+'</bdi> · <bdi>'+esc(t("kTotal"))+': '+n+'</bdi></p></div>'+
  '<h2>Summary / الملخص</h2><div class="k">'+
   '<div><b>'+n+'</b>'+esc(t("kTotal"))+'</div><div><b>'+pct(c.met,n)+'</b>'+esc(t("kMet"))+'</div><div><b>'+pct(c.tie,n)+'</b>'+esc(t("kTie"))+'</div><div><b>'+pct(c.before,n)+'</b>'+esc(t("kBefore"))+'</div><div><b>'+c.rev+'</b>'+esc(t("kRev"))+'</div><div><b>'+c.person+'</b>'+esc(t("kPerson"))+'</div><div><b>'+oi.length+'</b>'+esc(t("kOpen"))+'</div><div><b>'+(au.rate===null?"—":au.rate+"%")+'</b>'+esc(t("kAud"))+'</div><div><b>'+as+'%</b>'+esc(t("kAs"))+'</div></div>'+
  '<h2>'+esc(t("rpSheets"))+' / The sheets</h2>'+(n?DB.records.map(pageHTML).join(""):'<p class="meta">'+esc(t("rpEmpty"))+'</p>')+
  '<h2>'+esc(t("rpDetail"))+' / Detail of the blocks</h2>'+(n?DB.records.map(recReport).join(""):'<p class="meta">—</p>')+
  '<h2>Audit results / نتائج التدقيق</h2>'+(n?'<p>'+esc(t("auPass"))+': '+(au.rate===null?"—":au.rate+"% ("+au.pass+"/"+au.applic+")")+'</p><table><thead><tr><th>ID</th>'+CHECKS.map(function(k){ return '<th>'+esc(t("c_"+k))+'</th>'; }).join("")+'</tr></thead><tbody>'+auRows+'</tbody></table>':'<p class="meta">—</p>')+
  '<h2>Open items / بنود تحتاج متابعة</h2>'+(oi.length?'<ul>'+oi.map(function(x){ return '<li><span dir="ltr">'+esc(x.r.id)+' · '+esc(x.r.ref||"—")+'</span> — '+esc(x.s)+'</li>'; }).join("")+'</ul>':'<p class="meta">'+esc(n?t("noOpen"):"—")+'</p>')+
  '<h2>Self-assessment / التقييم الذاتي</h2><table><thead><tr><th>Stage / المرحلة</th><th>Score / النتيجة</th></tr></thead><tbody>'+grpRows+'<tr><td><b>'+esc(t("kAs"))+'</b></td><td><b>'+as+'%</b></td></tr></tbody></table><p class="meta">'+esc(t("bandNote"))+'</p>'+
  '<footer>Prepared by / أعدّه: مدثر سلامه · A3 is a problem-solving method, not a clause of any standard: the one-page limit is a discipline, the goal is written before the causes are known, countermeasures are tied to proved causes and tested, and the effect is checked against the goal. Sources / المراجع: ISO 9001:2026 introduction 0.3.2, clauses 6.2, 7.1.6, 7.3, 9.1.3, 10.1 and 10.2 and Annex A.10.2; ISO 9000:2026 3.2.3, 3.7.11, 3.7.17, 3.8.6, 4.2.6 and 4.2.7 (interpretive summaries, not the official text) · Examples are illustrative.</footer>';
 return TBX.reportDoc(L,'A3 Report — مدثر سلامه',body,PAGE_CSS+'.ok{color:#2F7D4B;font-weight:700;text-align:center}.bad{color:#B42318;font-weight:700}td.bad{text-align:center}.na{color:#7A869E;text-align:center}.warn{color:#86520F;font-weight:700}ul{padding-inline-start:20px}h3{font-family:Georgia,serif;margin:22px 0 4px;font-size:17px}h4{margin:14px 0 4px;font-size:14.5px}.an{border-top:1px solid #DCE4EE;padding-top:6px}.an th{background:#F3F7FB;color:#1B2A4A}.an tbody th{width:30%}.cover{border-bottom:4px solid #B8901E;padding:18px 0 14px;margin-bottom:8px}.cover h1{border:0;margin:6px 0}.cover .kick{color:#B8901E;font-weight:700;letter-spacing:.04em;margin:0}.cover .sub{font-size:18px;margin:4px 0}');
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
 TBX.download("A3-report-"+stamp()+".html","text/html;charset=utf-8",buildReportHTML());
});
document.getElementById("rpCsv").addEventListener("click",function(){ var err=document.getElementById("rpErr"); err.textContent=""; if(!DB.records.length){ err.textContent=t("rpEmpty"); return; } TBX.download("A3-sheets-"+stamp()+".csv","text/csv;charset=utf-8",buildCSV()); });
document.getElementById("dCsv").addEventListener("click",function(){ if(!DB.records.length) return; TBX.download("A3-sheets-"+stamp()+".csv","text/csv;charset=utf-8",buildCSV()); });

/* ---------- platform identity: academy logo and related tools ---------- */
var LOGO="__LOGO__";
function applyLogo(){ document.querySelectorAll("img[data-logo]").forEach(function(i){ if(i.src!==LOGO) i.src=LOGO; i.alt=t("logoAlt"); }); }
var RELATED=[["pdca","PDCA","./pdca.html","#1E8C93"],["rca","RCA","./rca.html","#1B2A4A"],["capa","CAPA","./capa.html","#C2410C"],["pareto","Pareto","./pareto.html","#B8901E"],["fish","Fishbone","./fishbone.html","#1E8C93"],["why5","5 Whys","./five-whys.html","#3563C9"]];
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

/* ---------- assistant: answers from the tool's own guide and your A3s (rule-based, no AI service) ---------- */
var CONTACT_EMAIL="moddathersalama.eng@gmail.com";
var CB={
 ar:{fab:"اسأل عن A3",title:"مساعد A3",sub:"إجابات فورية من دليل الأداة وصفحاتك",new:"محادثة جديدة",close:"إغلاق",ph:"اكتب سؤالك…",send:"إرسال",inL:"سؤالك",
  hello:"مرحباً. أجيب عن أسئلة حل المشكلات بأسلوب A3 من دليل الأداة ومن صفحاتك المحفوظة في هذا المتصفح. اختر سؤالاً أو اكتب سؤالك.",
  miss:"لم أجد إجابة جاهزة لهذا السؤال. جرّب أحد الأسئلة المقترحة، أو اسأل عن: هل A3 نموذج فقط، أو الفرق بين A3 وRCA وPDCA، أو الهدف قبل الأسباب، أو دور الموجّه، أو تعديل الهدف، أو الهدف الذي لم يتحقق. وللاستشارة راسل المُعِد على البريد أدناه.",
  instant:"إجابة فورية",foot:"المساعد يعمل في متصفحك ولا يرسل بياناتك. للتواصل:",
  op0:"لا توجد بنود مفتوحة في صفحاتك الآن.",st0:"لا توجد صفحات A3 بعد. ابدأ من [[tab:tools]] أو حمّل المثال من [[tab:docs]]."},
 en:{fab:"Ask about A3",title:"A3 assistant",sub:"Instant answers from the tool's guide and your A3s",new:"New chat",close:"Close",ph:"Type your question…",send:"Send",inL:"Your question",
  hello:"Hello. I answer A3 problem-solving questions from the tool's guide and from your A3s saved in this browser. Pick a question or type your own.",
  miss:"I have no ready answer for that. Try one of the suggested questions, or ask whether an A3 is just a form, A3 against RCA and PDCA, the goal before the causes, the coach's role, changing the goal, or a goal that was not met. For advice, email the author at the address below.",
  instant:"Instant answer",foot:"The assistant runs in your browser and sends no data. Contact:",
  op0:"No open items in your A3s right now.",st0:"No A3s yet. Start from the [[tab:tools]] or load the example in [[tab:docs]]."}
};
var KB=[
 {id:"form",k:["نموذج","استمارة","ورقة","شكل","form","template","just a form","paper","one page","صفحة واحدة"],q:{ar:"هل A3 مجرد نموذج؟",en:"Is an A3 just a form?"},
  a:{ar:"لا. **حدّ الصفحة الواحدة انضباط، لا شكل**: يجبرك على أن تقول القصة كلها بوضوح، من لماذا تهم المشكلة إلى هل وصلنا إلى الهدف. الصفحة التي تُملأ لتُرفع إلى الإدارة لا تحل شيئاً. ما يجعلها A3 حقيقية: مالك واحد يكتبها بنفسه، ووضع حالي بالأرقام لا بالصفات، وهدف مكتوب قبل معرفة الأسباب، وأسباب مثبتة، وإجراءات مرتبطة بها ومختبرة، ومتابعة بالمقياس نفسه، وموجّه يراجعها بالأسئلة. التفاصيل في [[tab:explain-std]].",
   en:"No. **The one-page limit is a discipline, not a format**: it makes you tell the whole story clearly, from why the problem matters to whether you reached the goal. A page filled in to send up to management solves nothing. What makes it a real A3: one owner who writes it, a current condition in numbers rather than adjectives, a goal written before the causes are known, proved causes, countermeasures tied to them and tested, a follow-up on the same measure, and a coach who reviews it through questions. Details in the [[tab:explain-std]]."}},
 {id:"which",k:["rca","pdca","أيها","ايها","أيهما","ايهما","الفرق","difference","which","versus","vs","بدل"],q:{ar:"A3 أم RCA أم PDCA: أيها أستخدم؟",en:"A3, RCA or PDCA — which one?"},
  a:{ar:"هي ليست بدائل. **PDCA هي الدورة**: خطط، نفّذ، تحقق، تصرف. و**A3 هي قصة دورة واحدة على صفحة واحدة** لمشكلة محددة، يملكها شخص ويوجّهه موجّه. و**RCA هو التحقيق الكامل في الأسباب** عندما تكون المشكلة جسيمة أو معقدة؛ تأخذ صفحة A3 أسبابه الجذرية المثبتة إلى كتلة التحليل. وباريتو يؤطر الفجوة، وعظمة السمكة ولماذا الخمس تبحثان عن الأسباب، وCAPA يحمل الإجراءات التصحيحية عندما توجد حالة عدم مطابقة. اختر الأسباب برقم التحليل في [[tab:tools]].",
   en:"They are not alternatives. **PDCA is the cycle**: plan, do, check, act. **An A3 is the story of one cycle on one page** for a given problem, owned by one person and coached. **RCA is the full investigation of causes** when the problem is severe or complex; the A3 takes its proved root causes into the analysis block. Pareto frames the gap, Fishbone and 5 Whys look for the causes, and CAPA carries the corrective actions when a nonconformity is involved. Pick the causes by analysis id in the [[tab:tools]]."}},
 {id:"goal",k:["الهدف قبل","قبل الأسباب","لماذا الهدف","goal before","before the causes","why the goal","target first","المستهدف"],q:{ar:"لماذا يُكتب الهدف قبل الأسباب؟",en:"Why set the goal before the causes?"},
  a:{ar:"لأن الهدف المكتوب بعد معرفة الأسباب يُكيَّف مع ما نعرف أننا نستطيع فعله، لا مع ما تحتاجه المشكلة. الهدف يقول ما **يجب** أن يحدث (أقل من 3% شحنات مرفوضة بحلول 31 أغسطس)، والتحليل يقول **لماذا** لا يحدث. لذلك تقارن الأداة تاريخ كتابة الهدف بتاريخ بدء التحليل، وتنبّه إذا جاء الهدف بعده. وISO 9001:2026 تطلب في 6.2.1 أن تكون الأهداف قابلة للقياس ومرصودة.",
   en:"Because a goal written after the causes are known gets fitted to what we know we can do, not to what the problem needs. The goal says what **must** happen (below 3% rejected loads by 31 August); the analysis says **why** it does not. That is why the tool compares the date the goal was written with the date the analysis started, and warns when the goal came later. ISO 9001:2026 6.2.1 asks for objectives that are measurable and monitored."}},
 {id:"coach",k:["موجه","موجّه","المرشد","مرشد","coach","mentor","review","مراجعة"],q:{ar:"ما دور الموجّه في A3؟",en:"What does the coach do?"},
  a:{ar:"الموجّه **يسأل ولا يوقّع**. لا يكتب الصفحة ولا يملي الحل، بل يسأل حتى يرى المالك الفجوة بنفسه: ما الذي يقوله الرقم؟ كيف تعرف أن هذا هو السبب؟ أي سبب يعالجه هذا الإجراء؟ كيف ستعرف أنه نجح؟ وتسجّل الأداة كل مراجعة بتاريخها والأسئلة وما تغيّر بعدها، وتطلب أن يكون الموجّه غير المالك، ومراجعة بعد المتابعة. هذا يبني الوعي الذي يذكره البند 7.3 من ISO 9001:2026.",
   en:"The coach **asks, and does not sign off**. The coach does not write the page or dictate the solution, but asks until the owner sees the gap: what does the number say? How do you know this is the cause? Which cause does this countermeasure address? How will you know it worked? The tool records each review with its date, the questions and what changed afterwards, requires the coach to be someone other than the owner, and a review after the follow-up. This builds the awareness ISO 9001:2026 clause 7.3 speaks of."}},
 {id:"change",k:["تعديل الهدف","أغير الهدف","اغير الهدف","change the goal","changing the goal","move the target","adjust"],q:{ar:"هل يمكن تعديل الهدف؟",en:"Can I change the goal?"},
  a:{ar:"نعم، لسبب حقيقي فقط (تغيّر المتطلب أو العميل أو ظهر خطأ في القياس الأساسي)، ولا يُعدَّل ليناسب النتيجة. في الأداة يبقى الهدف الأول مكتوباً في «الهدف الأول (إن عُدّل)» ومعه سبب التعديل؛ وتعديل دون سبب يُسجَّل ثغرة في [[tab:audit]].",
   en:"Yes, for a real reason only (the requirement or the customer changed, or the baseline was measured wrongly); it is not changed to fit the result. In the tool the first target stays written under “First target (if changed)” with the reason; a change with no reason is recorded as a gap in the [[tab:audit]]."}},
 {id:"notmet",k:["لم يتحقق","لم يتحقق الهدف","جزئي","فشل","not met","partly","failed","did not work"],q:{ar:"ماذا لو لم يتحقق الهدف؟",en:"What if the goal is not met?"},
  a:{ar:"هذه نتيجة صادقة، وليست فشلاً للصفحة. سجّل النتيجة كما هي (تحقق جزئياً أو لم يتحقق)، ووحّد ما نجح، واكتب ما بقي مفتوحاً، ثم ابدأ صفحة A3 تالية أو دورة PDCA بالمقياس نفسه. في مثال الخرسانة انخفض الرفض من 9.2% إلى 6% والهدف أقل من 3%: وُحّدت نافذة الصب، وانتقل شرط تبريد الماء إلى الدورة الثانية في PD-EX-03.",
   en:"That is an honest result, not a failure of the page. Record the result as it is (partly met or not met), standardise what worked, write what is left open, then start a next A3 or PDCA cycle on the same measure. In the concrete example rejections fell from 9.2% to 6% against a goal below 3%: the pour window was standardised, and the chilled-water clause moved to the second cycle in PD-EX-03."}},
 {id:"open",dyn:"open",k:["مفتوح","مفتوحة","متابعة","open items","follow"],q:{ar:"ما البنود المفتوحة في صفحاتي؟",en:"What is still open in my A3s?"}},
 {id:"status",dyn:"status",k:["وضع","حالة","ملخص","status","summary","where do we stand"],q:{ar:"ما وضع صفحاتي الآن؟",en:"Where do my A3s stand?"}}
];
var CB_SUG=["form","which","goal","coach","status"];
function kbDyn(id){
 var u=CB[L]||CB.ar;
 if(id==="open"){ var O=openItems(); if(!O.length) return u.op0+"\n\n[[tab:dash]]"; return O.map(function(x){ return "- **"+(x.r.ref||x.r.id)+"** — "+x.s; }).join("\n")+"\n\n[[tab:docs]] · [[tab:dash]]"; }
 if(id==="status"){ var c=counts(); if(!c.n) return u.st0; return "- "+t("kTotal")+": **"+c.n+"**\n- "+t("kMet")+": **"+c.met+"**\n- "+t("kTie")+": **"+c.tie+"**\n- "+t("kRev")+": **"+c.rev+"**\n- "+t("kOpen")+": **"+openItems().length+"**\n- "+t("kAs")+": **"+assessScore()+"%**\n\n[[tab:dash]] · [[tab:audit]]"; }
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
window.addEventListener("storage",function(e){ if([PDCA_KEY,CAPA_KEY,PARETO_KEY,FISH_KEY,WHY5_KEY,RCA_KEY].indexOf(e.key)>=0){ renderHomeSt(); fillLists(); if(ST) stPreview(true); refreshForm(); } });

/* ---------- boot ---------- */
/* a link from RCA may ask to open an A3 (?open=ID); a request may also start one from an RCA investigation (?rca=ID), a CAPA record
   (?capa=ID) or a Pareto category (?pareto=ID&cat=CAT); inside the hub the same request arrives as a one-time sessionStorage hint */
function navRequest(){
 var q={}; try{ var u=new URLSearchParams(location.search); if(u.get("open")) q.open=u.get("open"); if(u.get("rca")) q.rca=u.get("rca"); if(u.get("capa")) q.capa=u.get("capa"); if(u.get("pareto")){ q.pareto=u.get("pareto"); q.cat=u.get("cat")||""; } }catch(e){}
 try{ var h=JSON.parse(sessionStorage.getItem(NAV_KEY)||"null"); sessionStorage.removeItem(NAV_KEY); if(h&&typeof h==="object"){ if(h.open) q.open=String(h.open); if(h.rca) q.rca=String(h.rca); if(h.capa) q.capa=String(h.capa); if(h.pareto){ q.pareto=String(h.pareto); q.cat=String(h.cat||""); } } }catch(e){}
 return q;
}
applyLang();
(function(){
 var q=navRequest(), r=q.open?DB.records.filter(function(x){ return x.id===q.open; })[0]:null;
 if(r){ loadRecordIntoForm(r); go("tools"); return; }
 if(q.rca && prefillFromRca(q.rca)) return;
 if(q.capa && prefillFromCapa(q.capa)) return;
 if(q.pareto && prefillFromPareto(q.pareto,q.cat)) return;
 go((location.hash||"#home").slice(1));
})();
