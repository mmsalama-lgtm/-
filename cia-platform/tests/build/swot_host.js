/* ===== SWOT tool — host logic. Studies and assessment are stored in this browser only (localStorage, wrapped in try/catch). =====
   Storage key "cia-swot:v1" (this tool only). Schema:
   { records: [ {
       id, ref, title, scope: "org"|"unit"|"project"|"process"|"bid"|"product", decision (the decision the study serves),
       date (date of the analysis, YYYY-MM-DD), facil (facilitator), owner, revBy (planned review date, YYYY-MM-DD),
       src: "strat"|"tows"|"pestle"|"lessons"|"pareto"|"fmea"|"none", srcId (the record the study was started from, read only),
       team:  [ {n (name or function), role, ext: "no"|"customer"|"supplier"|"advisor"|"dept"} ]       "ext" other than "no" = outside input
       items: [ {id, q: "s"|"w"|"o"|"t", t (the item), ev (evidence: a figure or a fact), evs (where the evidence comes from), evd (its date),
                 src: "kpi"|"audit"|"customer"|"pestle"|"porter"|"lesson"|"market"|"risk"|"opinion", sid (id of the record in another tool, read only),
                 w: 1..5 | null (weight), rk: 1..n | null (rank inside its quadrant), note (why it sits in this quadrant, when the check doubts it)} ]
       opts:  [ {id, k: "so"|"st"|"wo"|"wt", t (the option), a: [item ids of the first quadrant], b: [item ids of the second]} ]   TOWS options
       acts:  [ {id, opt (option id), what, who, by (YYYY-MM-DD), st: "plan"|"doing"|"done", done (YYYY-MM-DD), ev} ]            actions
       ros:   [ {id, kind: "risk"|"opp", item (item id), what, dest: "reg"|"plan"|"fmea"|"iso31000"|"other", ref, who} ]   risk / opportunity entries
       revs:  [ {id, date, chg (what changed in the context), add (items added), rem (items removed)} ]                         reviews
       created, updated } ],
     assess: { IN1..RV3: 0|1|2 } }
   The stage is computed (scoped → team → quadrants with evidence → ranked → options → actions → reviewed); nothing about it is stored.
   Other tools' keys are only read, never written: "strategy-studio:v1" (the SWOT, TOWS and PESTLE registers of the Strategy & Performance
   Studio), "cia-lessons:v1", "cia-pareto:v1" and "cia-fmea:v1" (start a study from a record, previews with each tool's own rules). The other
   tools open through their own requests (?open= or their one-time sessionStorage hints "cia-nav:lessons", "cia-nav:pareto", "cia-nav:fmea";
   the Strategy Studio and the ISO 31000 Risk Studio on a tab). This tool reads its own hint "cia-nav:swot" ({open} | {strat} | {tows} |
   {pestle} | {lessons} | {pareto, cat} | {fmea}) and its address (?open=, ?strat=, ?tows=, ?pestle=, ?lessons=, ?pareto=&cat=, ?fmea=) once;
   none of them holds tool data. */
var LKEY="cia-lang", STORE="cia-swot:v1", STR_KEY="strategy-studio:v1", LL_KEY="cia-lessons:v1", PARETO_KEY="cia-pareto:v1", FM_KEY="cia-fmea:v1",
    NAV_KEY="cia-nav:swot", LL_NAV="cia-nav:lessons", PARETO_NAV="cia-nav:pareto", FM_NAV="cia-nav:fmea";
var L=(function(){ try{ return localStorage.getItem(LKEY)||"ar"; }catch(e){ return "ar"; } })();
var TABS=["home","explain-std","explain-cl","assess","tools","docs","audit","dash","report","ai"];
var TITLES={ar:"SWOT | من المصفوفة إلى القرار — مدثر سلامه",en:"SWOT | From the grid to decisions — مدثر سلامه"};
var STAGES=["draft","scoped","team","quads","ranked","options","actions","reviewed"], MAPST=STAGES.slice(1);
var SCOL={draft:"#9AA5B8",scoped:"#7A869E",team:"#1E8C93",quads:"#3563C9",ranked:"#1B2A4A",options:"#7B5BB8",actions:"#C9821A",reviewed:"#3C9A5F"};
var QS=["s","w","o","t"], QCOL={s:"#3C9A5F",w:"#C2410C",o:"#3563C9",t:"#B7790F"}, INTQ={s:1,w:1}, EXTQ={o:1,t:1};
var SCOPES=["org","unit","project","process","bid","product"];
var SRCS=["strat","tows","pestle","lessons","pareto","fmea","none"], STSRC=["strat","tows","pestle","lessons","pareto","fmea"];
var ITYPES=["kpi","audit","customer","pestle","porter","lesson","market","risk","opinion"];
var TCOL={kpi:"#1B2A4A",audit:"#7B5BB8",customer:"#1E8C93",pestle:"#3563C9",porter:"#5B6FA8",lesson:"#B8901E",market:"#2F7D4B",risk:"#B42318",opinion:"#9AA5B8"};
var EXTS=["no","customer","supplier","advisor","dept"], TW=["so","st","wo","wt"], TWQ={so:["s","o"],st:["s","t"],wo:["w","o"],wt:["w","t"]};
var ASTS=["plan","doing","done"], RKINDS=["risk","opp"], DESTS=["reg","plan","fmea","iso31000","other"], WTS=[1,2,3,4,5];
var TOP=3, LONG=7, MAXTEAM=12, MAXITEMS=40, MAXOPTS=16, MAXACTS=24, MAXROS=16, MAXREV=10;
var DB=load();
var curTab="home";
var editing=null;   /* deep copy of the study open in the form: keeps created between saves */
var ST=null;        /* rows of the read-only start preview */

var UI={
ar:{brand:"أكاديمية التحسين المستمر · مدثر سلامه",toolName:"أداة SWOT — من المصفوفة إلى القرار",sgLearn:"التعلّم",sgWork:"العمل",sgOut:"المخرجات",
 nHome:"الرئيسية",nStd:"دليل المنهجية",nCl:"دليل البنود",nAssess:"التقييم الذاتي",nTools:"دراسات SWOT",nDocs:"السجلات",nAudit:"التدقيق",nDash:"لوحة المؤشرات",nReport:"التقرير",nAi:"المساعد الذكي",soon:"قريباً",
 homeCode:"النطاق · الفريق · الدليل · الترتيب · TOWS · الإجراء · المراجعة",homeH1:"تحليل SWOT",
 homeLede:"تحليل SWOT يخدم قراراً محدداً: فريق فيه رأي من خارجه، وقوة وضعف داخليان بدليل من مؤشر أو تدقيق أو درس، وفرص وتهديدات خارجية من PESTLE وقوى بورتر وبيانات السوق، ثم ترتيب كل ربع، ثم خيارات TOWS، ثم إجراءات بمالك وموعد، ومخاطر وفرص تدخل خطة 6.1، ثم مراجعة عند تغير السياق.",
 homeNote:"النسخة الحالية تحفظ الدراسات في متصفحك فقط. الحفظ على الخادم وتسجيل الدخول يُضافان في مرحلة المنصة المشتركة.",
 prep:"إعداد",authorName:"مدثر سلامه",cycleT:"ما الذي تستطيع فعله هنا",cycleS:"اقرأ دليل المنهجية، ثم قيّم ممارستكم لتحليل SWOT، ثم ابدأ دراسة جديدة أو من مصفوفة استوديو الاستراتيجية أو عوامل PESTLE أو درس مستفاد أو فئات باريتو أو صفوف FMEA عالية الأولوية.",
 tStd:"متى يكون SWOT مفيداً: النطاق والقرار، والفريق، والدليل، والداخلي مقابل الخارجي، والترتيب، وخيارات TOWS، والإجراءات والمخاطر، والمراجعة، والفجوات الشائعة وما يطلبه المدقق.",tCl:"بنود ISO 9001:2026 التي يخدمها التحليل: السياق 4.1، والأطراف المعنية 4.2، والمخاطر والفرص 6.1.1 و6.1.2 و6.1.3، والأهداف 6.2، ومدخلات مراجعة الإدارة 9.3.2، مع تعريفات ISO 9000:2026 والبنود 5.1 و5.2 و5.3 من ISO 10009:2024: ملخص تفسيري ومثال وما يطلبه المدقق.",tAssess:"اثنا عشر سؤالاً تقيس ممارسة SWOT لديكم، من تكوين الفريق حتى إبلاغ النتيجة.",
 tTools:"دراسة لكل تحليل: النطاق والقرار، والفريق، والأرباع الأربعة بدليل وترتيب، وخيارات TOWS، والإجراءات ومداخل المخاطر والفرص، والمراجعة، مع المصفوفة ومصفوفة TOWS ورسم مصادر البنود.",tDocs:"كل الدراسات بمرحلتها ونطاقها وتنبيهاتها، وبيانات المثال.",tAudit:"فحص آلي لكل دراسة: المرجع والنطاق والقرار، والفريق، والأرباع، والدليل، وموضع البنود، والترتيب، وخيارات TOWS، والإجراءات، ومداخل المخاطر، والمراجعة.",
 tDash:"البنود العليا بدليل، والدراسات التي خرجت منها إجراءات، والدراسات المراجعة، ورسم البنود حسب المصدر، والبنود المفتوحة، والتقييم الذاتي.",tReport:"تقرير HTML بكل دراسة ومصفوفتها وخيارات TOWS والإجراءات والمراجعة، ونتائج التدقيق والبنود المفتوحة والتقييم الذاتي، وملف CSV.",tAi:"مساعد يقرأ الدراسات ويقترح خيارات TOWS والأسئلة الناقصة. لم يُفعَّل بعد.",
 foot:"المراجع: ISO 9001:2026 البنود 4.1 و4.2 و6.1.1 و6.1.2 و6.1.3 و6.2 و9.3.2 والملحق A.4.1 وA.4.2 وA.6.1، وISO 9000:2026 البنود 3.1.2 و3.1.4 و3.7.2 و4.3.8 و4.4.1 و4.4.2، وISO 10009:2024 البنود 5.1 و5.2 و5.3 (ملخصات تفسيرية، وليست النص الرسمي). SWOT أسلوب، وليس متطلباً في أي مواصفة. الأمثلة توضيحية وليست بيانات حقيقية.",
 heroTag:"أداة منهجية · من المصفوفة إلى القرار",langSw:"English",langSwA:"Switch to English",logoAlt:"أكاديمية التحسين المستمر — مدثر سلامه",
 related:"أدوات مرتبطة في الأكاديمية",rel_str:"استوديو الاستراتيجية والأداء (SWOT وTOWS وPESTLE)",rel_iso10009:"دليل أدوات الجودة ISO 10009 (5.1)",rel_lessons:"سجل الدروس المستفادة",rel_fmea:"تحليل أنماط الفشل وآثارها FMEA",rel_pareto:"باريتو — تحليل القلة الحيوية",rel_rca:"تحليل السبب الجذري — التحقيق",rel_a3:"حل المشكلات بأسلوب A3",rel_dmaic:"مشروع التحسين بمنهج DMAIC",rel_capa:"الإجراءات التصحيحية",rel_pdca:"دورة PDCA",
 termT:"هل تحليل SWOT متطلب في ISO 9001:2026؟",
 termP1:"لا. SWOT أسلوب، وليس متطلباً في أي مواصفة. تطلب ISO 9001:2026 تحديد القضايا الخارجية والداخلية ذات الصلة بالغرض والتوجه الاستراتيجي ومتابعتها (4.1)، وتحديد الأطراف المعنية ومتطلباتها (4.2)، ثم مراعاتها عند تحديد المخاطر والفرص (6.1.1) والتخطيط للتعامل معها (6.1.2 و6.1.3)، ومراجعة تغيراتها في مراجعة الإدارة (9.3.2 ب) وج)). وتراجع ISO 10009:2024 أسلوب SWOT في البند 5.1 مع PESTLE في 5.2 وقوى بورتر في 5.3. وSWOT طريقة منظمة لتلبية ذلك إن طُبّقت جيداً.",
 termP2:"والقاعدة هنا: SWOT مفيد فقط عندما يقود إلى قرار. القوة والضعف داخليان ويحتاجان دليلاً (رقم، أو نتيجة تدقيق، أو مؤشر، أو درس)، والفرص والتهديدات خارجية تأتي من PESTLE وقوى بورتر وبيانات السوق والعملاء، لا من الرأي. وتحليل شخص واحد ليس تحليلاً: فريق فيه رأي من الخارج. والقوائم الطويلة بلا ترتيب فجوة: يُرتب كل ربع ويُحتفظ بالأهم. ويُنبَّه على الضعف المكتوب «نقص في…» بلا دليل.",
 termP3:"وكل بند أعلى يصبح خياراً (SO أو ST أو WO أو WT) ثم إجراءً بمالك وموعد، أو مدخلاً في سجل المخاطر أو خطة 6.1. وتؤرخ المصفوفة وتُراجع عند تغير السياق. وSWOT يستخدم PESTLE وقوى بورتر وسجل المخاطر والدروس المستفادة، ولا يحل محلها: الأداة تقرأ بنود استوديو الاستراتيجية وPESTLE والدروس وباريتو وFMEA للقراءة فقط.",
 termIs:"ملخص تفسيري بصياغة مستقلة، وليس النص الرسمي. المصادر: ISO 9001:2026 البنود 4.1 و4.2 و6.1.1 و6.1.2 و6.1.3 و6.2 و9.3.2 والملحق A.4.1 وA.4.2 وA.6.1 (الملف الرسمي المرفوع)، وISO 9000:2026 البنود 3.1.2 و3.1.4 و3.7.2 و4.3.8 و4.4.1 و4.4.2 (ممسوح ضوئياً، قُرئ بالتعرف الضوئي؛ لا يعرّف «الفرصة» مصطلحاً)، وISO 10009:2024 البنود 5.1 و5.2 و5.3 (من فهرس المنصة المتحقق منه من الملف الرسمي في 2026-10-16؛ الملف غير مرفق في هذه الخطوة). مصفوفة TOWS وأي كتاب في الاستراتيجية أو بطاقة الأداء المتوازن أو ISO 31000: «غير متحقق منه». التحقق: 2026-10-17.",
 defs:[["النطاق والقرار","لماذا نحلل","المنشأة أو الوحدة أو المشروع أو العملية أو العطاء أو المنتج، والقرار الذي تخدمه الدراسة.","#7A869E"],["الفريق","ثلاثة أدوار على الأقل","فريق فيه رأي من خارجه: عميل أو مورد أو مستشار أو إدارة أخرى. تحليل شخص واحد ليس تحليلاً.","#1E8C93"],["الدليل","داخلي · خارجي","القوة والضعف داخليان بدليل من مؤشر أو تدقيق أو درس؛ والفرص والتهديدات خارجية من PESTLE وبورتر والسوق.","#3563C9"],["الترتيب","الأهم أولاً","وزن من 1 إلى 5 ورتبة لكل بند في ربعه؛ يُحتفظ بأعلى ثلاثة.","#1B2A4A"],["TOWS والإجراء","SO · ST · WO · WT","كل خيار يربط بنداً من ربعين، ثم إجراء بمالك وموعد، أو مدخل في خطة المخاطر والفرص.","#C9821A"]],
 asT:"التقييم الذاتي لممارسة SWOT",asS:"أجب عن كل سؤال بما يحدث فعلاً عندكم. النتيجة تقيس الممارسة الحالية، وليست شهادة ولا حكماً على الأداء.",asReset:"مسح الإجابات",asSaved:"تم حفظ الإجابة",asAnswered:"أُجيب {n} من 12",
 band0:"يحتاج عملاً",band1:"في طور التطوير",band2:"راسخ",bandNote:"حدود داخلية للتقييم الذاتي من تصميم هذه الأداة، وليست معياراً رسمياً.",as0:"غير موجود",as1:"جزئي",as2:"موجود ومطبّق",
 g_IN:"المدخلات والفريق",g_EV:"الدليل والموضع والترتيب",g_DE:"من المصفوفة إلى القرار",g_RV:"المراجعة والإبلاغ",
 tlT:"دراسة SWOT",tlS:"دراسة لكل تحليل: النطاق والقرار، والفريق، والأرباع الأربعة بدليل ووزن ورتبة، وخيارات TOWS، والإجراءات ومداخل المخاطر والفرص، والمراجعة. تتحدد المرحلة مما تملؤه.",
 save:"حفظ الدراسة",newRec:"دراسة جديدة",savedFail:"تعذّر الحفظ في هذا المتصفح. نزّل التقرير قبل إغلاق الصفحة.",cur:"المرحلة الحالية:",ok_rec:"تم حفظ الدراسة",
 st_draft:"مسودة",st_scoped:"حُدد النطاق",st_team:"اكتمل الفريق",st_quads:"أرباع بدليل",st_ranked:"رُتّبت",st_options:"خيارات TOWS",st_actions:"إجراءات ومخاطر",st_reviewed:"روجعت",
 mp_scoped:"النطاق والقرار والتاريخ",mp_team:"3 أدوار ورأي من الخارج",mp_quads:"أربعة أرباع والأعلى بدليل",mp_ranked:"وزن ورتبة لكل بند",mp_options:"كل بند أعلى في خيار",mp_actions:"مالك وموعد ومدخل خطر",mp_reviewed:"مراجعة بعد تغير السياق",
 mapT:"مراحل الدراسة",mpDone:"مكتملة",mpCur:"قيد العمل",mpTodo:"لم تبدأ",
 sHdrT:"بيانات الدراسة",sHdrS:"المرجع، والعنوان، والنطاق، والقرار الذي تخدمه، وتاريخ التحليل، والميسّر، والمالك، وموعد المراجعة القادمة، والأداة التي بدأت منها.",
 sTmT:"1 · الفريق",sTmS:"ثلاثة أدوار على الأقل، وواحد على الأقل من خارج الفريق: عميل أو مورد أو مستشار خارجي أو إدارة أخرى.",
 sInT:"2 · الداخلي: القوة والضعف",sInS:"ما في يد المنشأة: الموارد والكفاءة والعمليات والأداء. لكل بند دليل: رقم أو مؤشر أو نتيجة تدقيق أو درس مستفاد.",
 sExT:"3 · الخارجي: الفرص والتهديدات",sExS:"ما خارج سيطرة المنشأة: السوق والعملاء والمنافسون والأنظمة والبيئة. المصدر PESTLE أو قوى بورتر أو بيانات السوق، لا الرأي.",
 sRkT:"4 · الترتيب والمصفوفة",sRkS:"وزن من 1 إلى 5 ورتبة لكل بند داخل ربعه. أعلى ثلاثة في كل ربع هي البنود العليا التي تُبنى عليها الخيارات.",
 sOpT:"5 · خيارات TOWS",sOpS:"لكل خيار نوعه وبند على الأقل من كل ربع من ربعيه: SO قوة لاقتناص فرصة، وST قوة لمواجهة تهديد، وWO علاج ضعف بفرصة، وWT تقليل ضعف أمام تهديد.",
 sAcT:"6 · الإجراءات ومداخل المخاطر والفرص",sAcS:"لكل خيار إجراء بمالك وموعد. ولكل تهديد أعلى مدخل خطر يُنقل إلى سجل المخاطر أو خطة 6.1 أو دراسة FMEA.",
 sRvT:"7 · المراجعة",sRvS:"تؤرخ المصفوفة وتُراجع عند تغير السياق أو في الموعد المحدد: ما الذي تغير، وما البنود التي أضيفت أو حذفت.",
 f_title:"عنوان الدراسة *",f_ref:"المرجع",f_scope:"النطاق",f_decision:"القرار الذي تخدمه الدراسة",f_date:"تاريخ التحليل",f_facil:"الميسّر",f_owner:"المالك",f_revBy:"موعد المراجعة القادمة",f_src:"بدأت من",f_srcId:"رقم السجل في الأداة المصدر",
 sc_org:"المنشأة",sc_unit:"وحدة أعمال",sc_project:"مشروع",sc_process:"عملية",sc_bid:"عطاء",sc_product:"منتج أو خدمة",
 src_strat:"SWOT في استوديو الاستراتيجية",src_tows:"TOWS في استوديو الاستراتيجية",src_pestle:"PESTLE في استوديو الاستراتيجية",src_lessons:"درس مستفاد",src_pareto:"فئة باريتو",src_fmea:"صف FMEA",src_none:"دراسة جديدة",
 tmN:"الاسم أو الوظيفة",tmRole:"الدور في التحليل",tmExt:"من خارج الفريق؟",tmAdd:"إضافة عضو",tmNone:"لم يُضف أعضاء بعد.",ex_no:"لا — من الفريق",ex_customer:"عميل",ex_supplier:"مورد",ex_advisor:"مستشار خارجي",ex_dept:"إدارة أخرى",
 tmW3:"الفريق أقل من ثلاثة أدوار.",tmWext:"لا رأي من خارج الفريق: أضف عميلاً أو مورداً أو مستشاراً أو إدارة أخرى.",tmSolo:"تحليل شخص واحد ليس تحليلاً SWOT.",
 q_s:"نقاط القوة",q_w:"نقاط الضعف",q_o:"الفرص",q_t:"التهديدات",q1_s:"قوة",q1_w:"ضعف",q1_o:"فرصة",q1_t:"تهديد",
 itAdd_s:"إضافة قوة",itAdd_w:"إضافة ضعف",itAdd_o:"إضافة فرصة",itAdd_t:"إضافة تهديد",itDel:"حذف البند",itNone:"لا بنود بعد.",
 it_t:"البند",it_ev:"الدليل (رقم أو واقعة)",it_evs:"مصدر الدليل",it_evd:"تاريخه",it_src:"نوع المصدر",it_sid:"رقم السجل المصدر",it_w:"الوزن 1–5",it_rk:"الرتبة",it_note:"لماذا هو في هذا الربع (عند التنبيه)",
 ty_kpi:"مؤشر أداء أو بيانات",ty_audit:"نتيجة تدقيق",ty_customer:"العميل",ty_pestle:"عامل PESTLE",ty_porter:"قوة من قوى بورتر",ty_lesson:"درس مستفاد",ty_market:"بيانات السوق",ty_risk:"تحليل مخاطر (FMEA أو سجل)",ty_opinion:"رأي فقط",
 opF:"رأي فقط: لا دليل.",lackF:"صياغة «نقص في…» بلا دليل: ما الرقم أو الواقعة التي تثبته؟",misI:"يبدو خارجياً (سوق أو منافس أو نظام) وهو في ربع داخلي. انقله أو اكتب لماذا هو هنا.",misE:"يبدو داخلياً (مؤشر أو تدقيق أو درس أو موارد المنشأة) وهو في ربع خارجي. انقله أو اكتب لماذا هو هنا.",topB:"أعلى",wMiss:"بلا وزن",rkMiss:"بلا رتبة",rkDup:"رتبة مكررة",
 rkBtn:"رتّب بالوزن",rkDone:"رُتّبت البنود بالوزن داخل كل ربع. راجع الترتيب.",longW:"في هذا الربع أكثر من {n} بنود: رتّب واحتفظ بالأهم.",rkW:"الرتبة تخالف الوزن في {n} بند.",
 gridT:"المصفوفة: أعلى البنود في كل ربع",gridEmpty:"لا بنود بعد",gridMore:"و{n} غيرها",gridInt:"داخلي",gridExt:"خارجي",gridPos:"مفيد",gridNeg:"ضار",
 opAdd:"إضافة خيار",opDel:"حذف الخيار",opNone:"لا خيارات بعد. المصفوفة التي لا تصل إلى خيار لا تغيّر شيئاً.",op_k:"نوع الخيار",op_t:"الخيار",op_a:"بنود {q}",op_b:"بنود {q}",opBad:"اربط بنداً على الأقل من كل ربع.",opNoIt:"لا بنود في هذا الربع بعد.",
 tw_so:"SO — قوة تقتنص فرصة",tw_st:"ST — قوة تواجه تهديداً",tw_wo:"WO — فرصة تعالج ضعفاً",tw_wt:"WT — تقليل ضعف أمام تهديد",
 towsT:"مصفوفة TOWS",twEmpty:"لا خيارات",uncovW:"{n} بند أعلى لم يدخل خياراً ولا مدخل خطر أو فرصة: {c}.",
 acAdd:"إضافة إجراء",acDel:"حذف الإجراء",acNone:"لا إجراءات بعد.",ac_opt:"الخيار",ac_what:"الإجراء",ac_who:"المسؤول",ac_by:"الموعد",ac_st:"الحالة",ac_done:"تاريخ التنفيذ",ac_ev:"الدليل",acPick:"— اختر الخيار —",
 as_plan:"مخطط",as_doing:"قيد التنفيذ",as_done:"نُفّذ",ownF:"الإجراء بلا مسؤول أو موعد.",evF:"نُفّذ دون تاريخ أو دليل.",optNoActW:"خيارات بلا إجراء بمالك وموعد: {c}.",
 roAdd:"إضافة مدخل خطر أو فرصة",roNone:"لا مداخل بعد.",ro_kind:"النوع",ro_item:"البند",ro_what:"المدخل (الخطر أو الفرصة)",ro_dest:"يُنقل إلى",ro_ref:"المرجع في الوجهة",ro_who:"المالك",roPick:"— اختر البند —",
 rk_risk:"خطر",rk_opp:"فرصة",de_reg:"سجل المخاطر",de_plan:"خطة المخاطر والفرص 6.1",de_fmea:"دراسة FMEA",de_iso31000:"استوديو المخاطر ISO 31000",de_other:"أخرى",
 roW:"تهديدات عليا بلا مدخل خطر: {c}.",fmOpen:"افتح في FMEA",fmMiss:"هذه الدراسة غير موجودة في أداة FMEA على هذا المتصفح.",isoOpen:"افتح استوديو المخاطر",isoNote:"استوديو المخاطر لا يحفظ سجلاً برقم في هذا المتصفح؛ افتحه وأدخل الخطر هناك، واكتب مرجعه هنا.",
 rvDate:"تاريخ المراجعة",rvChg:"ما الذي تغير في السياق",rvAdd:"البنود المضافة",rvRem:"البنود المحذوفة",rvAddBtn:"إضافة مراجعة",rvNone:"لا مراجعة بعد.",rvEarly:"المراجعة مؤرخة قبل تاريخ التحليل.",revLateW:"موعد المراجعة ({d}) مضى دون مراجعة.",
 tmDel:"حذف السطر",
 stT:"ابدأ من أداة أخرى (قراءة فقط)",stS:"اختر بنود SWOT أو خيارات TOWS أو عوامل PESTLE في استوديو الاستراتيجية، أو درساً مستفاداً، أو فئة من القلة الحيوية في باريتو، أو صفاً عالي الأولوية في FMEA. تُملأ دراسة جديدة غير محفوظة بالبند ومصدره، ولا يُكتب شيء في الأداة الأخرى.",
 stSrc:"المصدر",ss_strat:"SWOT — استوديو الاستراتيجية",ss_tows:"TOWS — استوديو الاستراتيجية",ss_pestle:"PESTLE — استوديو الاستراتيجية",ss_lessons:"الدروس المستفادة",ss_pareto:"باريتو — القلة الحيوية",ss_fmea:"FMEA — صفوف عالية الأولوية",stPrev:"اعرض",stUse:"ابدأ دراسة منه",stAll:"ابدأ دراسة من المصفوفة كلها ({n} بنداً)",stNone:"لا توجد بيانات في هذه الأداة على هذا المتصفح بعد.",stEmpty:"لا توجد سجلات مناسبة بعد.",
 stColId:"الرقم",stColT:"البند أو العنوان",stColQ:"يدخل ربع",stColInfo:"القراءة بقاعدة الأداة",stColN:"دراسات منه",stColA:"إجراء",
 stUsed:"مُلئت دراسة جديدة من {s} {id}. أكمل النطاق والفريق والدليل، ثم احفظ.",pfT:"SWOT — ",
 pvSs:"{id} · {q} · الأثر {w} · {t}",pvTw:"{id} · {q} · {n} مرجع SWOT · {t}",pvPe:"{id} · {f} · {i} · الأهمية {w}",pvLl:"{id} · {st} · {t}",pvPa:"{id} · {st} · {c}: {v} {u} من {tot} ({s}%)",pvFm:"{id} · {st} · {n} صف عالي الأولوية · {t}",
 hmT:"على هذا المتصفح {n} بنداً في استوديو الاستراتيجية والدروس وباريتو وFMEA يمكن أن تبدأ منها دراسة.",hmGo:"اعرضها",
 srcHint:"دراسة جديدة، أو اختر الأداة التي بدأت منها واكتب رقم السجل؛ تظهر هنا معاينة بقاعدة تلك الأداة.",srcOpen:"افتح المصدر",
 chT:"البنود حسب نوع المصدر",chEmpty:"لا بنود بعد",chEv:"بدليل",chOp:"رأي فقط",chShare:"{p}% من البنود بدليل، و{o}% رأي فقط",
 e_title:"اكتب عنوان الدراسة.",e_date:"تاريخ المراجعة لا يسبق تاريخ التحليل.",
 fl_ref:"المرجع أو العنوان ناقص",fl_scope:"النطاق أو القرار ناقص",fl_date:"تاريخ التحليل أو الميسّر ناقص",fl_solo:"تحليل شخص واحد",fl_team:"أقل من 3 أدوار",fl_ext:"لا رأي من الخارج",fl_quad:"{n} ربع فارغ",fl_evid:"{n} بند أعلى بلا دليل",fl_opin:"{n} بند رأي فقط",fl_lack:"{n} بند «نقص في…» بلا دليل",fl_mis:"{n} بند في غير ربعه",fl_long:"ربع طويل بلا ترتيب",fl_rank:"{n} بند بلا وزن أو رتبة",fl_dup:"رتب مكررة",fl_rkw:"الرتبة تخالف الوزن",fl_noopt:"لا خيار TOWS",fl_badopt:"{n} خيار ناقص الربط",fl_uncov:"{n} بند أعلى بلا خيار",fl_optact:"{n} خيار بلا إجراء",fl_own:"{n} إجراء بلا مسؤول أو موعد",fl_ev:"{n} إجراء منفذ بلا دليل",fl_ro:"{n} تهديد أعلى بلا مدخل خطر",fl_revby:"لا موعد مراجعة",fl_late:"موعد المراجعة مضى",fl_norev:"لم تُراجع بعد",fl_revearly:"مراجعة قبل التحليل",
 oi_ref:"أكمل المرجع والعنوان.",oi_scope:"حدد النطاق والقرار الذي تخدمه الدراسة.",oi_date:"حدد تاريخ التحليل والميسّر.",oi_solo:"تحليل شخص واحد: كوّن فريقاً من ثلاثة أدوار على الأقل.",oi_team:"أكمل الفريق إلى ثلاثة أدوار على الأقل.",oi_ext:"أضف رأياً من خارج الفريق (عميل أو مورد أو مستشار أو إدارة أخرى).",oi_quad:"املأ {n} ربع فارغ.",oi_evid:"أضف دليلاً لـ {n} بند أعلى.",oi_opin:"{n} بند رأي فقط: ابحث عن دليل أو احذفه.",oi_lack:"أثبت {n} بند «نقص في…» برقم أو واقعة.",oi_mis:"راجع موضع {n} بند (داخلي أم خارجي).",oi_long:"قائمة طويلة: رتّب واحتفظ بالأهم.",oi_rank:"ضع وزناً ورتبة لـ {n} بند.",oi_dup:"صحح الرتب المكررة.",oi_rkw:"راجع الرتب التي تخالف الأوزان.",oi_noopt:"حوّل البنود العليا إلى خيارات TOWS.",oi_badopt:"اربط {n} خيار ببند من كل ربع.",oi_uncov:"أدخل {n} بنداً أعلى في خيار أو مدخل خطر أو فرصة.",oi_optact:"أضف إجراءً بمالك وموعد لـ {n} خيار.",oi_own:"حدد المسؤول والموعد لـ {n} إجراء.",oi_ev:"أضف دليل التنفيذ لـ {n} إجراء.",oi_ro:"انقل {n} تهديداً أعلى إلى سجل المخاطر أو خطة 6.1.",oi_revby:"حدد موعد المراجعة القادمة.",oi_late:"موعد المراجعة مضى: راجع المصفوفة.",oi_norev:"راجع المصفوفة عند تغير السياق أو في موعدها.",oi_revearly:"صحح تاريخ المراجعة.",
 exT:"بيانات المثال",exS:"ثلاث دراسات توضيحية لشركة الواحة للمقاولات (شركة سعودية افتراضية): استراتيجية الشركة لعام 2027 (خبرة الخرسانة في الحر، وتأخر اعتماد المخططات بمؤشره، وكود العزل الحراري الجديد، وموجات الحر الأطول؛ روجعت)، وقرار عطاء مستشفى حكومي (قوة المشتري مرتفعة من قوى بورتر، وخيار WT بعدم التسعير دون التكلفة)، وتحليل عملية الرفع في المواقع (قوة من الدرس LL-EX-02، وتهديدات من صفوف الخطورة 10 في FM-EX-02؛ إجراءات مخططة ولم تُراجع بعد). ليست بيانات حقيقية.",exLoad:"تحميل المثال",exClear:"مسح كل البيانات",exLoaded:"تم تحميل المثال.",exCleared:"تم مسح كل البيانات.",exConfirmClear:"سيُحذف كل ما حُفظ في أداة SWOT على هذا المتصفح (الدراسات والتقييم الذاتي). هل تريد المتابعة؟",
 dT:"السجلات",dS:"كل الدراسات المحفوظة على هذا المتصفح. افتح دراسة لتعديلها، أو احذفها بضغطتين.",csv:"تصدير CSV",none:"لا توجد دراسات بعد.",open:"فتح",del:"حذف",delArm:"اضغط مرة أخرى للحذف",
 colRef:"الدراسة",colScope:"النطاق · القرار",colStage:"المرحلة",colItems:"البنود",colTop:"البنود العليا بدليل",colOpts:"الخيارات · الإجراءات",colFlags:"تنبيهات",colAct:"إجراءات",itemsN:"ق{s} ض{w} ف{o} ت{t}",
 auT:"التدقيق الآلي",auS:"عشرة فحوص لكل دراسة. «—» تعني أن الفحص لا ينطبق بعد على مرحلة الدراسة.",auEmpty:"لا توجد دراسات لتدقيقها.",auRec:"الدراسات",auPass:"نسبة الفحوص الناجحة",auFail:"دراسات فيها فحص راسب",auOpen:"بنود مفتوحة",
 k_ref:"المرجع والنطاق والقرار",k_team:"فريق ورأي خارجي",k_quad:"الأرباع الأربعة",k_evid:"دليل للبنود العليا",k_place:"موضع البنود",k_rank:"الترتيب",k_tows:"خيارات TOWS",k_acts:"إجراء بمالك وموعد",k_ro:"مدخل للتهديدات العليا",k_review:"موعد المراجعة والالتزام به",
 dashT:"لوحة المؤشرات",dashS:"تُحسب من الدراسات والتقييم الذاتي المحفوظة على هذا المتصفح.",kTotal:"الدراسات",kEvid:"البنود العليا بدليل",kActs:"دراسات خرجت منها إجراءات بمالك وموعد",kRev:"دراسات روجعت",kOpin:"بنود رأي فقط",kOpts:"خيارات TOWS",kOpen:"بنود مفتوحة",kAud:"نجاح التدقيق",kAs:"التقييم الذاتي",
 byStage:"الدراسات حسب المرحلة",byScope:"الدراسات حسب النطاق",bySrc:"البنود حسب نوع المصدر",byAssess:"التقييم الذاتي حسب المحور",openT:"بنود تحتاج متابعة",noData:"لا توجد بيانات بعد.",noOpen:"لا بنود مفتوحة.",
 rpT:"التقرير",rpS:"تقرير HTML جاهز للطباعة أو الحفظ PDF، وملف CSV للبنود والخيارات والإجراءات.",rpHtml:"تنزيل تقرير HTML",rpNote:"التقرير يضم الغلاف والملخص وكل دراسة بمصفوفتها وبنودها وخيارات TOWS والإجراءات ومداخل المخاطر والمراجعة، ثم نتائج التدقيق والبنود المفتوحة والتقييم الذاتي.",rpPrev:"معاينة سريعة",rpEmpty:"لا توجد بيانات للتقرير بعد.",
 rpCover:"دراسات SWOT — من المصفوفة إلى القرار",rpReg:"الدراسات",rpTeam:"الفريق",rpGrid:"المصفوفة",rpItems:"البنود",rpTows:"خيارات TOWS",rpActs:"الإجراءات",rpRo:"مداخل المخاطر والفرص",rpRev:"المراجعات",rpAu:"نتيجة التدقيق",
 aiT:"المساعد الذكي — قيد الإنشاء",aiS:"سيقرأ المساعد الدراسات ويقترح خيارات TOWS والأسئلة التي لم تُطرح، ولن يكتب المصفوفة بدلاً من الفريق.",aiList:["يقترح خيارات TOWS من البنود العليا","ينبّه إلى البنود التي بلا دليل أو في غير ربعها","يقترح عوامل PESTLE وقوى بورتر التي لم تُراجع"],
 yes:"نعم",no:"لا",langNote:""},
en:{brand:"Continual Improvement Academy · مدثر سلامه",toolName:"SWOT tool — from the grid to decisions",sgLearn:"Learn",sgWork:"Work",sgOut:"Outputs",
 nHome:"Home",nStd:"Method guide",nCl:"Clause guide",nAssess:"Self-assessment",nTools:"SWOT studies",nDocs:"Records",nAudit:"Audit",nDash:"Dashboard",nReport:"Report",nAi:"AI Assistant",soon:"Soon",
 homeCode:"Scope · team · evidence · ranking · TOWS · action · review",homeH1:"SWOT analysis",
 homeLede:"A SWOT that serves a named decision: a team with outside input, internal strengths and weaknesses backed by a KPI, an audit result or a lesson, external opportunities and threats taken from PESTLE, Porter's forces and market data, then each quadrant ranked, then TOWS options, then actions with an owner and a date, and risks and opportunities carried into the 6.1 plan, then a review when the context changes.",
 homeNote:"This version keeps studies in your browser only. Server storage and sign-in come with the shared platform stage.",
 prep:"Prepared by",authorName:"مدثر سلامه",cycleT:"What you can do here",cycleS:"Read the method guide, assess your SWOT practice, then start a study — new, or from the Strategy Studio's grid, its PESTLE factors, a lesson learned, Pareto categories or high-priority FMEA rows.",
 tStd:"When a SWOT is useful: scope and decision, the team, evidence, internal against external, ranking, TOWS options, actions and risks, review, the common gaps and what an auditor asks for.",tCl:"The ISO 9001:2026 clauses the analysis serves: context 4.1, interested parties 4.2, risks and opportunities 6.1.1, 6.1.2 and 6.1.3, objectives 6.2 and management review inputs 9.3.2, with the ISO 9000:2026 terms and ISO 10009:2024 5.1, 5.2 and 5.3: an interpretive summary, an example and what the auditor asks for.",tAssess:"Twelve questions on your SWOT practice, from forming the team to communicating the result.",
 tTools:"One study per analysis: scope and decision, the team, the four quadrants with evidence and ranking, TOWS options, actions and risk/opportunity entries, and the review, with the grid, the TOWS matrix and a chart of where items come from.",tDocs:"Every study with its stage, scope and flags, and the example data.",tAudit:"An automatic check of each study: reference, scope and decision, the team, the quadrants, evidence, placement, ranking, TOWS options, actions, risk entries and the review.",
 tDash:"Top items with evidence, studies that led to actions, studies reviewed, a chart of items by source, open items and the self-assessment.",tReport:"An HTML report with each study, its grid, TOWS options, actions and review, the audit results, open items and the self-assessment, and a CSV file.",tAi:"An assistant that reads the studies and suggests TOWS options and the questions not yet asked. Not active yet.",
 foot:"Sources: ISO 9001:2026 clauses 4.1, 4.2, 6.1.1, 6.1.2, 6.1.3, 6.2 and 9.3.2 and Annex A.4.1, A.4.2 and A.6.1; ISO 9000:2026 3.1.2, 3.1.4, 3.7.2, 4.3.8, 4.4.1 and 4.4.2; ISO 10009:2024 5.1, 5.2 and 5.3 (interpretive summaries, not the official text). SWOT is a technique, not a requirement of any standard. Examples are illustrative, not real data.",
 heroTag:"Method tool · from the grid to decisions",langSw:"العربية",langSwA:"التبديل إلى العربية",logoAlt:"Continual Improvement Academy — مدثر سلامه",
 related:"Related tools in the academy",rel_str:"Strategy & Performance Studio (SWOT, TOWS, PESTLE)",rel_iso10009:"ISO 10009 quality tools guide (5.1)",rel_lessons:"Lessons learned register",rel_fmea:"FMEA — failure mode and effects analysis",rel_pareto:"Pareto — vital few analysis",rel_rca:"Root cause analysis — investigation",rel_a3:"A3 problem solving",rel_dmaic:"DMAIC improvement project",rel_capa:"Corrective action",rel_pdca:"PDCA cycle",
 termT:"Is a SWOT analysis a requirement of ISO 9001:2026?",
 termP1:"No. SWOT is a technique, not a requirement of any standard. ISO 9001:2026 asks the organization to determine the external and internal issues relevant to its purpose and strategic direction and to monitor them (4.1), to determine the relevant interested parties and their requirements (4.2), then to consider them when determining risks and opportunities (6.1.1) and planning actions on them (6.1.2 and 6.1.3), and to review their changes at management review (9.3.2 b) and c)). ISO 10009:2024 reviews SWOT in 5.1, with PESTLE in 5.2 and Porter's forces in 5.3. A SWOT done well is a structured way to meet those requirements.",
 termP2:"The rule here: a SWOT is useful only when it leads to decisions. Strengths and weaknesses are internal and need evidence (a figure, an audit result, a KPI, a lesson); opportunities and threats are external and come from PESTLE, Porter's forces, market and customer data, not from opinion. One person's SWOT is not a SWOT: it takes a team with outside input. Long unranked lists are a gap: each quadrant is ranked and the top items are kept. A weakness written as \"lack of…\" with no evidence is flagged.",
 termP3:"Each top item becomes an option (SO, ST, WO or WT) and then an action with an owner and a date, or an entry in the risk register or the 6.1 plan. The grid is dated and reviewed when the context changes. SWOT uses PESTLE, Porter's forces, the risk register and lessons learned rather than replacing them: the tool reads the Strategy Studio's items, PESTLE, lessons, Pareto and FMEA read-only.",
 termIs:"Interpretive summary in independent wording, not the official text. Sources: ISO 9001:2026 clauses 4.1, 4.2, 6.1.1, 6.1.2, 6.1.3, 6.2 and 9.3.2 and Annex A.4.1, A.4.2 and A.6.1 (the uploaded official file); ISO 9000:2026 3.1.2, 3.1.4, 3.7.2, 4.3.8, 4.4.1 and 4.4.2 (scanned, read with OCR; it has no term entry for \"opportunity\"); ISO 10009:2024 5.1, 5.2 and 5.3 (from the platform's catalogue checked against the official file on 2026-10-16; the file is not attached in this step). The TOWS matrix and any strategy textbook, Balanced Scorecard source or ISO 31000: \"not verified\". Checked: 2026-10-17.",
 defs:[["Scope and decision","Why we analyse","The organization, a business unit, a project, a process, a bid or a product, and the decision the study serves.","#7A869E"],["The team","At least three roles","A team with outside input: a customer, a supplier, an advisor or another department. One person's SWOT is not a SWOT.","#1E8C93"],["Evidence","Internal · external","Strengths and weaknesses are internal, backed by a KPI, an audit or a lesson; opportunities and threats are external, from PESTLE, Porter and the market.","#3563C9"],["Ranking","First things first","A weight from 1 to 5 and a rank for each item in its quadrant; the top three are kept.","#1B2A4A"],["TOWS and action","SO · ST · WO · WT","Each option links an item from two quadrants, then an action with an owner and a date, or an entry in the risks and opportunities plan.","#C9821A"]],
 asT:"Self-assessment of SWOT practice",asS:"Answer each question with what actually happens in your organization. The score measures current practice; it is not a certificate or a judgement of performance.",asReset:"Clear answers",asSaved:"Answer saved",asAnswered:"{n} of 12 answered",
 band0:"Needs work",band1:"Developing",band2:"Established",bandNote:"Internal self-assessment bands designed for this tool, not an official benchmark.",as0:"Not in place",as1:"Partly",as2:"In place and applied",
 g_IN:"Inputs and team",g_EV:"Evidence, placement and ranking",g_DE:"From the grid to decisions",g_RV:"Review and communication",
 tlT:"SWOT study",tlS:"One study per analysis: scope and decision, the team, the four quadrants with evidence, weight and rank, TOWS options, actions and risk/opportunity entries, and the review. The stage is set from what you fill in.",
 save:"Save study",newRec:"New study",savedFail:"Could not save in this browser. Download the report before closing the page.",cur:"Current stage:",ok_rec:"Study saved",
 st_draft:"Draft",st_scoped:"Scoped",st_team:"Team complete",st_quads:"Quadrants with evidence",st_ranked:"Ranked",st_options:"TOWS options",st_actions:"Actions and risks",st_reviewed:"Reviewed",
 mp_scoped:"Scope, decision and date",mp_team:"3 roles and outside input",mp_quads:"Four quadrants, top items with evidence",mp_ranked:"Weight and rank for every item",mp_options:"Every top item in an option",mp_actions:"Owner, date and risk entry",mp_reviewed:"A review after the context changed",
 mapT:"Study stages",mpDone:"Complete",mpCur:"In progress",mpTodo:"Not started",
 sHdrT:"Study details",sHdrS:"Reference, title, scope, the decision it serves, date of the analysis, facilitator, owner, the next review date, and the tool it was started from.",
 sTmT:"1 · The team",sTmS:"At least three roles, and at least one input from outside the team: a customer, a supplier, an external advisor or another department.",
 sInT:"2 · Internal: strengths and weaknesses",sInS:"What the organization controls: resources, competence, processes and performance. Each item needs evidence: a figure, a KPI, an audit result or a lesson learned.",
 sExT:"3 · External: opportunities and threats",sExS:"What the organization does not control: the market, customers, competitors, regulation and the environment. The source is PESTLE, Porter's forces or market data, not opinion.",
 sRkT:"4 · Ranking and the grid",sRkS:"A weight from 1 to 5 and a rank for each item inside its quadrant. The top three of each quadrant are the top items the options are built on.",
 sOpT:"5 · TOWS options",sOpS:"Each option has its type and at least one item from each of its two quadrants: SO uses a strength to seize an opportunity, ST a strength to meet a threat, WO an opportunity to fix a weakness, WT reduces a weakness in front of a threat.",
 sAcT:"6 · Actions and risk/opportunity entries",sAcS:"Each option gets an action with an owner and a date. Each top threat gets a risk entry carried into the risk register, the 6.1 plan or an FMEA study.",
 sRvT:"7 · Review",sRvS:"The grid is dated and reviewed when the context changes or on the set date: what changed, and which items were added or removed.",
 f_title:"Study title *",f_ref:"Reference",f_scope:"Scope",f_decision:"The decision the study serves",f_date:"Date of the analysis",f_facil:"Facilitator",f_owner:"Owner",f_revBy:"Next review date",f_src:"Started from",f_srcId:"Record id in the source tool",
 sc_org:"Organization",sc_unit:"Business unit",sc_project:"Project",sc_process:"Process",sc_bid:"Bid",sc_product:"Product or service",
 src_strat:"Strategy Studio SWOT",src_tows:"Strategy Studio TOWS",src_pestle:"Strategy Studio PESTLE",src_lessons:"Lesson learned",src_pareto:"Pareto category",src_fmea:"FMEA row",src_none:"New study",
 tmN:"Name or function",tmRole:"Role in the analysis",tmExt:"From outside the team?",tmAdd:"Add member",tmNone:"No members yet.",ex_no:"No — team member",ex_customer:"Customer",ex_supplier:"Supplier",ex_advisor:"External advisor",ex_dept:"Another department",
 tmW3:"The team has fewer than three roles.",tmWext:"No input from outside the team: add a customer, a supplier, an advisor or another department.",tmSolo:"One person's SWOT is not a SWOT.",
 q_s:"Strengths",q_w:"Weaknesses",q_o:"Opportunities",q_t:"Threats",q1_s:"Strength",q1_w:"Weakness",q1_o:"Opportunity",q1_t:"Threat",
 itAdd_s:"Add strength",itAdd_w:"Add weakness",itAdd_o:"Add opportunity",itAdd_t:"Add threat",itDel:"Delete item",itNone:"No items yet.",
 it_t:"Item",it_ev:"Evidence (a figure or a fact)",it_evs:"Source of the evidence",it_evd:"Its date",it_src:"Source type",it_sid:"Source record id",it_w:"Weight 1–5",it_rk:"Rank",it_note:"Why it sits in this quadrant (when flagged)",
 ty_kpi:"KPI or data",ty_audit:"Audit result",ty_customer:"Customer",ty_pestle:"PESTLE factor",ty_porter:"Porter force",ty_lesson:"Lesson learned",ty_market:"Market data",ty_risk:"Risk analysis (FMEA or register)",ty_opinion:"Opinion only",
 opF:"Opinion only: no evidence.",lackF:"\"Lack of…\" with no evidence: what figure or fact shows it?",misI:"Looks external (market, competitor, regulation) but sits in an internal quadrant. Move it, or say why it belongs here.",misE:"Looks internal (a KPI, an audit, a lesson or the organization's own resources) but sits in an external quadrant. Move it, or say why it belongs here.",topB:"Top",wMiss:"No weight",rkMiss:"No rank",rkDup:"Rank repeated",
 rkBtn:"Rank by weight",rkDone:"Items ranked by weight inside each quadrant. Check the order.",longW:"This quadrant has more than {n} items: rank them and keep the most important.",rkW:"The rank goes against the weight for {n} item(s).",
 gridT:"The grid: top items in each quadrant",gridEmpty:"No items yet",gridMore:"and {n} more",gridInt:"Internal",gridExt:"External",gridPos:"Helpful",gridNeg:"Harmful",
 opAdd:"Add option",opDel:"Delete option",opNone:"No options yet. A grid that leads to no option changes nothing.",op_k:"Option type",op_t:"Option",op_a:"{q} items",op_b:"{q} items",opBad:"Link at least one item from each quadrant.",opNoIt:"No items in this quadrant yet.",
 tw_so:"SO — a strength seizes an opportunity",tw_st:"ST — a strength meets a threat",tw_wo:"WO — an opportunity fixes a weakness",tw_wt:"WT — reduce a weakness in front of a threat",
 towsT:"TOWS matrix",twEmpty:"No options",uncovW:"{n} top item(s) in no option and no risk/opportunity entry: {c}.",
 acAdd:"Add action",acDel:"Delete action",acNone:"No actions yet.",ac_opt:"Option",ac_what:"Action",ac_who:"Owner",ac_by:"Due",ac_st:"Status",ac_done:"Date done",ac_ev:"Evidence",acPick:"— pick the option —",
 as_plan:"Planned",as_doing:"In progress",as_done:"Done",ownF:"The action has no owner or due date.",evF:"Done with no date or evidence.",optNoActW:"Options with no action that has an owner and a date: {c}.",
 roAdd:"Add risk or opportunity entry",roNone:"No entries yet.",ro_kind:"Type",ro_item:"Item",ro_what:"Entry (the risk or the opportunity)",ro_dest:"Carried into",ro_ref:"Reference there",ro_who:"Owner",roPick:"— pick the item —",
 rk_risk:"Risk",rk_opp:"Opportunity",de_reg:"Risk register",de_plan:"Risks and opportunities plan 6.1",de_fmea:"FMEA study",de_iso31000:"ISO 31000 Risk Studio",de_other:"Other",
 roW:"Top threats with no risk entry: {c}.",fmOpen:"Open in FMEA",fmMiss:"This study is not in the FMEA tool in this browser.",isoOpen:"Open the Risk Studio",isoNote:"The Risk Studio keeps no register by record id in this browser; open it, enter the risk there, and write its reference here.",
 rvDate:"Review date",rvChg:"What changed in the context",rvAdd:"Items added",rvRem:"Items removed",rvAddBtn:"Add review",rvNone:"No review yet.",rvEarly:"The review is dated before the analysis.",revLateW:"The review date ({d}) has passed with no review.",
 tmDel:"Delete row",
 stT:"Start from another tool (read-only)",stS:"Pick SWOT items, TOWS options or PESTLE factors in the Strategy Studio, a lesson learned, a vital-few Pareto category or a high-priority FMEA row. A new, unsaved study is filled with the item and its source; nothing is written to the other tool.",
 stSrc:"Source",ss_strat:"SWOT — Strategy Studio",ss_tows:"TOWS — Strategy Studio",ss_pestle:"PESTLE — Strategy Studio",ss_lessons:"Lessons learned",ss_pareto:"Pareto — vital few",ss_fmea:"FMEA — high-priority rows",stPrev:"Show",stUse:"Start a study from it",stAll:"Start a study from the whole grid ({n} items)",stNone:"No data in that tool in this browser yet.",stEmpty:"No suitable records yet.",
 stColId:"Id",stColT:"Item or title",stColQ:"Goes to quadrant",stColInfo:"Read by that tool's rule",stColN:"Studies from it",stColA:"Action",
 stUsed:"A new study was filled from {s} {id}. Complete the scope, the team and the evidence, then save.",pfT:"SWOT — ",
 pvSs:"{id} · {q} · impact {w} · {t}",pvTw:"{id} · {q} · {n} SWOT ref(s) · {t}",pvPe:"{id} · {f} · {i} · significance {w}",pvLl:"{id} · {st} · {t}",pvPa:"{id} · {st} · {c}: {v} {u} of {tot} ({s}%)",pvFm:"{id} · {st} · {n} high-priority row(s) · {t}",
 hmT:"In this browser {n} item(s) in the Strategy Studio, lessons, Pareto and FMEA can start a study.",hmGo:"Show them",
 srcHint:"A new study, or pick the tool it was started from and enter the record id; a preview by that tool's own rule shows here.",srcOpen:"Open the source",
 chT:"Items by source type",chEmpty:"No items yet",chEv:"With evidence",chOp:"Opinion only",chShare:"{p}% of items have evidence, {o}% are opinion only",
 e_title:"Enter the study title.",e_date:"A review date cannot be before the date of the analysis.",
 fl_ref:"Reference or title missing",fl_scope:"Scope or decision missing",fl_date:"Date or facilitator missing",fl_solo:"One person's SWOT",fl_team:"Fewer than 3 roles",fl_ext:"No outside input",fl_quad:"{n} empty quadrant(s)",fl_evid:"{n} top item(s) with no evidence",fl_opin:"{n} opinion-only item(s)",fl_lack:"{n} \"lack of…\" item(s) with no evidence",fl_mis:"{n} item(s) in the wrong quadrant",fl_long:"Long unranked quadrant",fl_rank:"{n} item(s) with no weight or rank",fl_dup:"Repeated ranks",fl_rkw:"Rank against weight",fl_noopt:"No TOWS option",fl_badopt:"{n} option(s) not linked on both sides",fl_uncov:"{n} top item(s) with no option",fl_optact:"{n} option(s) with no action",fl_own:"{n} action(s) with no owner or date",fl_ev:"{n} done action(s) with no evidence",fl_ro:"{n} top threat(s) with no risk entry",fl_revby:"No review date",fl_late:"Review date passed",fl_norev:"Not reviewed yet",fl_revearly:"Review before the analysis",
 oi_ref:"Complete the reference and the title.",oi_scope:"Set the scope and the decision the study serves.",oi_date:"Set the date of the analysis and the facilitator.",oi_solo:"One person's SWOT: form a team of at least three roles.",oi_team:"Complete the team to at least three roles.",oi_ext:"Add input from outside the team (a customer, a supplier, an advisor or another department).",oi_quad:"Fill {n} empty quadrant(s).",oi_evid:"Add evidence for {n} top item(s).",oi_opin:"{n} opinion-only item(s): find evidence or drop them.",oi_lack:"Back {n} \"lack of…\" item(s) with a figure or a fact.",oi_mis:"Check the quadrant of {n} item(s) (internal or external).",oi_long:"Long list: rank it and keep the most important.",oi_rank:"Give a weight and a rank to {n} item(s).",oi_dup:"Fix the repeated ranks.",oi_rkw:"Check the ranks that go against the weights.",oi_noopt:"Turn the top items into TOWS options.",oi_badopt:"Link {n} option(s) to an item from each quadrant.",oi_uncov:"Put {n} top item(s) into an option or a risk/opportunity entry.",oi_optact:"Add an action with an owner and a date to {n} option(s).",oi_own:"Name the owner and due date of {n} action(s).",oi_ev:"Add the evidence for {n} done action(s).",oi_ro:"Carry {n} top threat(s) into the risk register or the 6.1 plan.",oi_revby:"Set the next review date.",oi_late:"The review date has passed: review the grid.",oi_norev:"Review the grid when the context changes or on its date.",oi_revearly:"Correct the review date.",
 exT:"Example data",exS:"Three illustrative studies for Al-Waha Contracting (a fictitious Saudi company): the 2027 company strategy (concrete know-how in hot weather, slow drawing approvals with its KPI, the new thermal insulation code, longer heatwaves; reviewed), a bid decision for a public hospital (buyer power high from Porter's forces, and a WT option not to bid below cost), and a process SWOT for site lifting (a strength from lesson LL-EX-02 and threats from the severity-10 rows of FM-EX-02; actions planned, not reviewed yet). Not real data.",exLoad:"Load example",exClear:"Clear all data",exLoaded:"Example loaded.",exCleared:"All data cleared.",exConfirmClear:"Everything saved in the SWOT tool in this browser (studies and self-assessment) will be deleted. Continue?",
 dT:"Records",dS:"Every study saved in this browser. Open a study to edit it, or delete it with two clicks.",csv:"Export CSV",none:"No studies yet.",open:"Open",del:"Delete",delArm:"Click again to delete",
 colRef:"Study",colScope:"Scope · decision",colStage:"Stage",colItems:"Items",colTop:"Top items with evidence",colOpts:"Options · actions",colFlags:"Flags",colAct:"Actions",itemsN:"S{s} W{w} O{o} T{t}",
 auT:"Automatic audit",auS:"Ten checks on each study. \"—\" means the check does not apply yet at the study's stage.",auEmpty:"No studies to audit.",auRec:"Studies",auPass:"Checks passed",auFail:"Studies with a failed check",auOpen:"Open items",
 k_ref:"Reference, scope and decision",k_team:"Team with outside input",k_quad:"All four quadrants",k_evid:"Evidence on the top items",k_place:"Placement of items",k_rank:"Ranking",k_tows:"TOWS options",k_acts:"Action with owner and date",k_ro:"Entries for the top threats",k_review:"Review date set and kept",
 dashT:"Dashboard",dashS:"Computed from the studies and the self-assessment saved in this browser.",kTotal:"Studies",kEvid:"Top items with evidence",kActs:"Studies with actions that have an owner and a date",kRev:"Studies reviewed",kOpin:"Opinion-only items",kOpts:"TOWS options",kOpen:"Open items",kAud:"Audit pass",kAs:"Self-assessment",
 byStage:"Studies by stage",byScope:"Studies by scope",bySrc:"Items by source type",byAssess:"Self-assessment by area",openT:"Items to follow up",noData:"No data yet.",noOpen:"No open items.",
 rpT:"Report",rpS:"An HTML report ready to print or save as PDF, and a CSV file of the items, options and actions.",rpHtml:"Download HTML report",rpNote:"The report has the cover, the summary, each study with its grid, items, TOWS options, actions, risk entries and reviews, then the audit results, the open items and the self-assessment.",rpPrev:"Quick preview",rpEmpty:"No data for the report yet.",
 rpCover:"SWOT studies — from the grid to decisions",rpReg:"The studies",rpTeam:"Team",rpGrid:"The grid",rpItems:"Items",rpTows:"TOWS options",rpActs:"Actions",rpRo:"Risk and opportunity entries",rpRev:"Reviews",rpAu:"Audit result",
 aiT:"AI Assistant — under construction",aiS:"The assistant will read the studies and suggest TOWS options and the questions not yet asked; it will not write the grid on the team's behalf.",aiList:["Suggests TOWS options from the top items","Flags items with no evidence or in the wrong quadrant","Suggests PESTLE factors and Porter forces not yet reviewed"],
 yes:"Yes",no:"No",langNote:""}
};
/* the other tools' stage names and preview wording (copied at build time from tests/build/dmaic_host.js, fmea_host.js and lessons_host.js) */
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

/* ---------- records ---------- */
function blankTm(){ return {n:"",role:"",ext:"no"}; }
function blankIt(id,q){ return {id:id||"",q:q||"s",t:"",ev:"",evs:"",evd:"",src:"opinion",sid:"",w:null,rk:null,note:""}; }
function blankOp(id){ return {id:id||"",k:"so",t:"",a:[],b:[]}; }
function blankAc(id){ return {id:id||"",opt:"",what:"",who:"",by:"",st:"plan",done:"",ev:""}; }
function blankRo(){ return {id:"",kind:"risk",item:"",what:"",dest:"reg",ref:"",who:""}; }
function blankRv(){ return {id:"",date:"",chg:"",add:"",rem:""}; }
function blank(){ return {id:"",ref:"",title:"",scope:"org",decision:"",date:"",facil:"",owner:"",revBy:"",src:"none",srcId:"",
 team:[],items:[],opts:[],acts:[],ros:[],revs:[],created:"",updated:""}; }
function wt(v){ var n=parseInt(v,10); return (n>=1&&n<=5)?n:null; }
function rkv(v){ var n=parseInt(v,10); return (n>=1&&n<=99)?n:null; }
function idl(v){ return (Array.isArray(v)?v:[]).map(str).filter(function(x){ return !!x; }); }
function fixTm(x){ return {n:str(x.n),role:str(x.role),ext:pick(x.ext,EXTS)||"no"}; }
function fixIt(x){ return {id:str(x.id),q:pick(x.q,QS)||"s",t:str(x.t),ev:str(x.ev),evs:str(x.evs),evd:str(x.evd),src:pick(x.src,ITYPES)||"opinion",sid:str(x.sid),w:wt(x.w),rk:rkv(x.rk),note:str(x.note)}; }
function fixOp(x){ return {id:str(x.id),k:pick(x.k,TW)||"so",t:str(x.t),a:idl(x.a),b:idl(x.b)}; }
function fixAc(x){ return {id:str(x.id),opt:str(x.opt),what:str(x.what),who:str(x.who),by:str(x.by),st:pick(x.st,ASTS)||"plan",done:str(x.done),ev:str(x.ev)}; }
function fixRo(x){ return {id:str(x.id),kind:pick(x.kind,RKINDS)||"risk",item:str(x.item),what:str(x.what),dest:pick(x.dest,DESTS)||"reg",ref:str(x.ref),who:str(x.who)}; }
function fixRv(x){ return {id:str(x.id),date:str(x.date),chg:str(x.chg),add:str(x.add),rem:str(x.rem)}; }
function ids(list,pre){ var used={}, n=0, re=new RegExp("^"+pre+"(\\d+)$");
 list.forEach(function(c){ var m=re.exec(c.id); if(m&&!used[c.id]){ used[c.id]=1; n=Math.max(n,+m[1]); } else c.id=""; });
 list.forEach(function(c){ if(!c.id){ n++; c.id=pre+n; used[c.id]=1; } }); }
/* a study saved with missing or broken parts gets empty ones, so rendering never throws; every item, option, action, entry and review gets an id,
   and an option or an entry never points to an item that is gone */
function fixRec(r){
 ["id","ref","title","scope","decision","date","facil","owner","revBy","src","srcId","created","updated"].forEach(function(k){ r[k]=str(r[k]); });
 if(SCOPES.indexOf(r.scope)<0) r.scope="org"; if(SRCS.indexOf(r.src)<0) r.src="none";
 r.team=arr(r.team).map(fixTm).slice(0,MAXTEAM);
 r.items=arr(r.items).map(fixIt).slice(0,MAXITEMS); ids(r.items,"i");
 var have={}; r.items.forEach(function(i){ have[i.id]=1; });
 r.opts=arr(r.opts).map(fixOp).slice(0,MAXOPTS); ids(r.opts,"p");
 r.opts.forEach(function(o){ o.a=o.a.filter(function(x){ return have[x]; }); o.b=o.b.filter(function(x){ return have[x]; }); });
 var hop={}; r.opts.forEach(function(o){ hop[o.id]=1; });
 r.acts=arr(r.acts).map(fixAc).slice(0,MAXACTS); ids(r.acts,"a"); r.acts.forEach(function(a){ if(!hop[a.opt]) a.opt=""; });
 r.ros=arr(r.ros).map(fixRo).slice(0,MAXROS); ids(r.ros,"r"); r.ros.forEach(function(x){ if(!have[x.item]) x.item=""; });
 r.revs=arr(r.revs).map(fixRv).slice(0,MAXREV); ids(r.revs,"v");
 return r;
}
function load(){ return TBX.load(STORE,function(v){ if(!Array.isArray(v.records)) v.records=[]; v.records=v.records.filter(function(r){ return r&&typeof r==="object"; }); v.records.forEach(fixRec); if(!v.assess||typeof v.assess!=="object") v.assess={}; return v; },function(){ return {records:[],assess:{}}; }); }
function persist(){ return TBX.save(STORE,DB); }

/* ---------- the study's rules ---------- */
function items(r){ return r.items.filter(function(i){ return txt(i.t); }); }
function inQ(r,q){ return items(r).filter(function(i){ return i.q===q; }); }
/* the order inside a quadrant: weight first, then rank, then the order of entry */
function order(list){ return list.map(function(x,k){ return [x,k]; }).sort(function(a,b){ var wa=a[0].w||0, wb=b[0].w||0; if(wb!==wa) return wb-wa; var ra=a[0].rk||999, rb=b[0].rk||999; return (ra-rb)||(a[1]-b[1]); }).map(function(x){ return x[0]; }); }
function topOf(r,q){ return order(inQ(r,q)).slice(0,TOP); }
function tops(r){ var o=[]; QS.forEach(function(q){ o=o.concat(topOf(r,q)); }); return o; }
function isTop(r,it){ return topOf(r,it.q).indexOf(it)>=0; }
/* evidence: a figure or a fact, from a source other than opinion */
function evOk(i){ return !!txt(i.ev)&&i.src!=="opinion"; }
function opinions(r){ return items(r).filter(function(i){ return !evOk(i); }); }
/* "lack of …" written as a weakness, with no evidence */
var LACK=/^\s*(lack\s+of|no\s|absence\s+of|insufficient|limited|not\s+enough|نقص|عدم\s+وجود|غياب|قلة|ضعف\s+في|لا\s+يوجد|لا\s+توجد|عدم\s+كفاية)/i;
function lackOf(i){ return i.q==="w"&&LACK.test(String(i.t||""))&&!evOk(i); }
function lacks(r){ return items(r).filter(lackOf); }
/* placement: PESTLE, Porter and market data are external; KPIs, audits and lessons are internal. A note on why it sits there accepts it. */
var EXT_SRC={pestle:1,porter:1,market:1}, INT_SRC={kpi:1,audit:1,lesson:1};
function misOf(i){ if(txt(i.note)) return ""; if(INTQ[i.q]&&EXT_SRC[i.src]) return "int"; if(EXTQ[i.q]&&INT_SRC[i.src]) return "ext"; return ""; }
function misplaced(r){ return items(r).filter(function(i){ return !!misOf(i); }); }
function emptyQ(r){ return QS.filter(function(q){ return !inQ(r,q).length; }); }
function longQ(r){ return QS.filter(function(q){ var L2=inQ(r,q); return L2.length>LONG&&L2.some(function(i){ return !i.rk; }); }); }
function unranked(r){ return items(r).filter(function(i){ return !i.w||!i.rk; }); }
function dupRank(r){ return QS.some(function(q){ var seen={}; return inQ(r,q).some(function(i){ if(!i.rk) return false; if(seen[i.rk]) return true; seen[i.rk]=1; return false; }); }); }
function rankAgainst(r){ return items(r).filter(function(i){ return i.w&&i.rk&&inQ(r,i.q).some(function(j){ return j!==i&&j.w&&j.rk&&j.w<i.w&&j.rk<i.rk; }); }); }
function rkOk(r){ return items(r).length>0&&!unranked(r).length&&!dupRank(r); }
function opts(r){ return r.opts.filter(function(o){ return txt(o.t); }); }
function itById(r,id){ return items(r).filter(function(i){ return i.id===id; })[0]||null; }
function optSides(r,o){ var qq=TWQ[o.k]; return [o.a.filter(function(id){ var i=itById(r,id); return !!i&&i.q===qq[0]; }), o.b.filter(function(id){ var i=itById(r,id); return !!i&&i.q===qq[1]; })]; }
function optOk(r,o){ var s=optSides(r,o); return !!txt(o.t)&&s[0].length>0&&s[1].length>0; }
function badOpts(r){ return opts(r).filter(function(o){ return !optOk(r,o); }); }
function ros(r){ return r.ros.filter(function(x){ return txt(x.what); }); }
function covered(r,it){ return opts(r).some(function(o){ if(!optOk(r,o)) return false; var s=optSides(r,o); return s[0].indexOf(it.id)>=0||s[1].indexOf(it.id)>=0; })||ros(r).some(function(x){ return x.item===it.id; }); }
function uncov(r){ return tops(r).filter(function(i){ return !covered(r,i); }); }
function optsOk(r){ return opts(r).length>0&&!badOpts(r).length&&!uncov(r).length; }
function acts(r){ return r.acts.filter(function(a){ return txt(a.what); }); }
function actOwned(a){ return !!(txt(a.who)&&isD(a.by)); }
function actDone(a){ return a.st==="done"&&isD(a.done)&&!!txt(a.ev); }
function unowned(r){ return acts(r).filter(function(a){ return !actOwned(a); }); }
function noEv(r){ return acts(r).filter(function(a){ return a.st==="done"&&!actDone(a); }); }
function optNoAct(r){ return opts(r).filter(function(o){ return !acts(r).some(function(a){ return a.opt===o.id&&actOwned(a); }); }); }
/* every top threat is carried into the risk register, the 6.1 plan or an FMEA study as a risk entry */
function roMiss(r){ return topOf(r,"t").filter(function(i){ return !ros(r).some(function(x){ return x.item===i.id&&x.kind==="risk"; }); }); }
function actsOk(r){ return optsOk(r)&&!optNoAct(r).length&&!unowned(r).length&&!roMiss(r).length; }
function revs(r){ return r.revs.filter(function(v){ return isD(v.date)||txt(v.chg)||txt(v.add)||txt(v.rem); }); }
function lastRev(r){ var V=r.revs.filter(function(v){ return isD(v.date); }).sort(function(a,b){ return a.date<b.date?-1:(a.date>b.date?1:0); }); return V.length?V[V.length-1]:null; }
function revEarly(r){ return r.revs.some(function(v){ return isD(v.date)&&isD(r.date)&&v.date<r.date; }); }
function revGood(r,v){ return !!v&&isD(v.date)&&(!isD(r.date)||v.date>=r.date)&&!!txt(v.chg); }
/* the review date is "kept" while it is still ahead, or when a review was held between the analysis and that date */
function kept(r){ if(!isD(r.revBy)) return false; if(r.revBy>=today()) return true; return r.revs.some(function(v){ return isD(v.date)&&v.date<=r.revBy&&(!isD(r.date)||v.date>=r.date); }); }
function revLate(r){ return isD(r.revBy)&&!kept(r); }
function revOk(r){ return actsOk(r)&&revGood(r,lastRev(r))&&isD(r.revBy); }
function scopeOk(r){ return !!(txt(r.title)&&txt(r.ref)&&SCOPES.indexOf(r.scope)>=0&&txt(r.decision)&&isD(r.date)&&txt(r.facil)); }
function roles(r){ return r.team.filter(function(m){ return txt(m.n)&&txt(m.role); }); }
function extIn(r){ return roles(r).filter(function(m){ return m.ext!=="no"; }); }
function teamOk(r){ return roles(r).length>=3&&extIn(r).length>0; }
function quadsOk(r){ return !emptyQ(r).length&&tops(r).every(evOk)&&!misplaced(r).length; }
var STOK=[scopeOk,teamOk,quadsOk,rkOk,optsOk,actsOk,revOk];
function stageOf(r){ var k=0; while(k<STOK.length&&STOK[k](r)) k++; return STAGES[k]; }
function stageName(s){ return t("st_"+s); }
function stIdx(r){ return STAGES.indexOf(stageOf(r)); }
function atLeast(r,s){ return stIdx(r)>=STAGES.indexOf(s); }
/* display codes: S1, W2 … by order of entry in each quadrant; SO1, WT1 … by option type; A1 … actions; R1 … entries; V1 … reviews */
function codes(r){ var o={}, n={}; r.items.forEach(function(i){ n[i.q]=(n[i.q]||0)+1; o[i.id]=i.q.toUpperCase()+n[i.q]; });
 var m={}; r.opts.forEach(function(p){ m[p.k]=(m[p.k]||0)+1; o[p.id]=p.k.toUpperCase()+m[p.k]; });
 r.acts.forEach(function(a,i){ o[a.id]="A"+(i+1); }); r.ros.forEach(function(x,i){ o[x.id]="R"+(i+1); }); r.revs.forEach(function(v,i){ o[v.id]="V"+(i+1); }); return o; }
function cList(r,list){ var CD=codes(r); return list.map(function(x){ return CD[x.id]||x.id; }).join(", "); }
/* one list of what is still open in a study; flags (records) and open items (dashboard, report) read it */
function issues(r){
 var o=[], R=roles(r), I=items(r);
 if(!(txt(r.ref)&&txt(r.title))) o.push(["ref","warn",{}]);
 if(!txt(r.decision)) o.push(["scope","warn",{}]);
 if(!(isD(r.date)&&txt(r.facil))) o.push(["date","warn",{}]);
 if(R.length<=1&&(R.length||I.length)) o.push(["solo","bad",{}]);
 else if(R.length<3) o.push(["team","warn",{}]);
 if(R.length&&!extIn(r).length) o.push(["ext","warn",{}]);
 var eq=emptyQ(r).length; if(I.length&&eq) o.push(["quad","warn",{n:eq}]);
 var te=tops(r).filter(function(i){ return !evOk(i); }).length; if(te) o.push(["evid","warn",{n:te}]);
 var op=opinions(r).length-te; if(op>0) o.push(["opin","info",{n:op}]);
 var lk=lacks(r).length; if(lk) o.push(["lack","warn",{n:lk}]);
 var ms=misplaced(r).length; if(ms) o.push(["mis","warn",{n:ms}]);
 if(longQ(r).length) o.push(["long","info",{}]);
 var ur=unranked(r).length; if(I.length&&ur) o.push(["rank","warn",{n:ur}]);
 if(dupRank(r)) o.push(["dup","warn",{}]);
 if(rankAgainst(r).length) o.push(["rkw","info",{}]);
 if(atLeast(r,"ranked")&&!opts(r).length) o.push(["noopt","warn",{}]);
 var bo=badOpts(r).length; if(bo) o.push(["badopt","warn",{n:bo}]);
 var uc=uncov(r).length; if(opts(r).length&&uc) o.push(["uncov","warn",{n:uc}]);
 var na=optNoAct(r).length; if(na) o.push(["optact","warn",{n:na}]);
 var uo=unowned(r).length; if(uo) o.push(["own","warn",{n:uo}]);
 var ne=noEv(r).length; if(ne) o.push(["ev","warn",{n:ne}]);
 var rm=roMiss(r).length; if(rm&&(opts(r).length||atLeast(r,"ranked"))) o.push(["ro","warn",{n:rm}]);
 if(!isD(r.revBy)&&I.length) o.push(["revby","warn",{}]);
 if(revLate(r)) o.push(["late","bad",{}]);
 if(revEarly(r)) o.push(["revearly","warn",{}]);
 if(actsOk(r)&&!revGood(r,lastRev(r))) o.push(["norev","info",{}]);
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
var OPENERS={lessons:["lessons.html",LL_NAV],pareto:["pareto.html",PARETO_NAV],fmea:["fmea.html",FM_NAV]};
var STTAB={strat:"swot",tows:"tows",pestle:"pestle"};
function openSrc(src,id){
 if(STTAB[src]){ openTool("strategy-performance.html",STTAB[src]); return; }
 var o=OPENERS[src]; if(!o) return; var q=id?{open:id}:{}; openWith(o[0],o[1],q,qsOf(q));
}
/* other tools' records saved in this browser (read only) */
function recsOf(key){ var S=TBX.read(key); if(!S) return null; return (Array.isArray(S.records)?S.records:[]).filter(function(r){ return r&&typeof r==="object"&&str(r.id); }); }
function byIdIn(key,id){ return (recsOf(key)||[]).filter(function(r){ return str(r.id)===id; })[0]||null; }
/* the Strategy & Performance Studio, read with its own value reader, reference parser and category names (copied at build time from
   modules/strategy-performance.html); its registers are only read */
/*__SS_RULES__*/
function ssRegs(){ var S=TBX.read(STR_KEY); return (S&&S.r&&typeof S.r==="object")?S.r:null; }
function ssRows(k){ var R=ssRegs(); if(!R) return null; return (Array.isArray(R[k])?R[k]:[]).filter(function(x){ return x&&typeof x==="object"&&!!txt(ssTKV(x.id)); }); }
function ssRow(k,id){ return (ssRows(k)||[]).filter(function(x){ return txt(ssTKV(x.id))===id; })[0]||null; }
function ssName(list,k){ var o=(SSO[list]||[]).filter(function(x){ return x[0]===k; })[0]; return o?(o[1][L]||o[1].ar):String(k==null?"":k); }
function ssQ(cat){ return QS.indexOf(cat)>=0?cat:"s"; }
/* Pareto's ranking and stage (copied at build time from tests/build/dmaic_host.js, which took them from pareto.html) */
/*__PA_RULES__*/
/* FMEA studies, read with the FMEA tool's own rules (copied at build time from tests/build/fmea_host.js), for previews and starts only */
/*__FM_RULES__*/
/* lessons, read with the Lessons Learned tool's own record repair and stage rule (copied at build time from tests/build/lessons_host.js) */
/*__LL_RULES__*/
function llRec(id){ var r=byIdIn(LL_KEY,id); return r?LLR.fix(JSON.parse(JSON.stringify(r))):null; }
function fmRec(id){ var f=byIdIn(FM_KEY,id); return f?FMR.fix(JSON.parse(JSON.stringify(f))):null; }
function puName(u){ return t("pu_"+(["count","cost","hours","sev"].indexOf(u)>=0?u:"count")); }
/* previews, each by the other tool's own rule */
function pvStrat(row){ return t("pvSs",{id:txt(ssTKV(row.id)),q:ssName("swotCat",row.cat),w:str(ssTKV(row.impact))||"—",t:short(ssTKV(row.text),110)}); }
function pvTows(row){ return t("pvTw",{id:txt(ssTKV(row.id)),q:ssName("towsQ",row.q),n:ssIds(row.link).length,t:short(ssTKV(row.text),110)}); }
function pvPestle(row){ return t("pvPe",{id:txt(ssTKV(row.id)),f:ssName("pestleF",row.f),i:ssName("pestleImp",row.imp),w:str(ssTKV(row.sig))||"—"}); }
function pvLesson(id){ var r=llRec(id); if(!r) return t("nxMiss"); return t("pvLl",{id:id,st:t("llst_"+LLR.stage(r)),t:short(r.title,110)}); }
function pvPareto(id){ var p=byIdIn(PARETO_KEY,id); if(!p) return t("nxMiss"); var V=paRank(p).rows.filter(function(x){ return x.vit; }).map(function(x){ return str(x.c.name); }); return t("pvPareto",{id:id,st:t("pst_"+paStage(p)),t:short(V.join(" · "),120)||t("pvNo")}); }
function pvPaCat(p,x){ var K=paRank(p); return t("pvPa",{id:str(p.id),st:t("pst_"+paStage(p)),c:str(x.c.name),v:fmtN(x.v),u:puName(p.unit),tot:fmtN(K.total),s:(Math.round(x.share*10)/10).toFixed(1)}); }
function pvFmea(id){ var f=fmRec(id); if(!f) return t("nxMiss"); var H=FMR.hi(f); return t("pvFm",{id:id,st:t("fmst_"+FMR.stage(f)),n:H.length,t:short(H.map(function(w){ return str(w.mode); }).join(" · "),110)||t("pvNo")}); }
function srcPreview(src,id){
 if(src==="none") return "";
 if(src==="strat"||src==="tows"||src==="pestle"){ var R=ssRows(src==="strat"?"swot":src); if(!R) return t("nxNoData"); if(!id) return ""; var row=ssRow(src==="strat"?"swot":src,id); if(!row) return t("nxMiss"); return src==="strat"?pvStrat(row):(src==="tows"?pvTows(row):pvPestle(row)); }
 var key={lessons:LL_KEY,pareto:PARETO_KEY,fmea:FM_KEY}[src]; if(!key) return "";
 if(!id) return (recsOf(key)||[]).length?"":t("nxNoData");
 return src==="lessons"?pvLesson(id):(src==="pareto"?pvPareto(id):pvFmea(id));
}
/* the record an item names (its source id), wherever it is: a lesson, an FMEA study, a Pareto analysis or a Strategy Studio row */
function sidPreview(sid){
 if(!txt(sid)) return "";
 if(byIdIn(LL_KEY,sid)) return pvLesson(sid); if(byIdIn(FM_KEY,sid)) return pvFmea(sid); if(byIdIn(PARETO_KEY,sid)) return pvPareto(sid);
 var a=ssRow("swot",sid); if(a) return pvStrat(a); var b=ssRow("pestle",sid); if(b) return pvPestle(b); var c=ssRow("tows",sid); if(c) return pvTows(c);
 return "";
}
function sidSrc(sid){ if(byIdIn(LL_KEY,sid)) return "lessons"; if(byIdIn(FM_KEY,sid)) return "fmea"; if(byIdIn(PARETO_KEY,sid)) return "pareto"; if(ssRow("swot",sid)) return "strat"; if(ssRow("pestle",sid)) return "pestle"; if(ssRow("tows",sid)) return "tows"; return ""; }

/* ---------- live views: the grid, the TOWS matrix and the chart of sources (the same markup goes into the report) ---------- */
function tt0(lang){ return function(k,v){ var s=(UI[lang||L]||UI.ar)[k]; if(s===undefined) s=UI.ar[k]; if(v){ for(var x in v) s=String(s).split("{"+x+"}").join(v[x]); } return s; }; }
function gridHTML(r,lang){
 var tt=tt0(lang), CD=codes(r), SUB={s:"gridInt",w:"gridInt",o:"gridExt",t:"gridExt"}, POS={s:"gridPos",w:"gridNeg",o:"gridPos",t:"gridNeg"};
 return '<div class="sw-grid" role="group" aria-label="'+esc(tt("gridT"))+'">'+QS.map(function(q){ var L2=order(inQ(r,q)), T2=L2.slice(0,TOP);
  return '<section class="sw-q sw-'+q+'" style="--qc:'+QCOL[q]+'"><h4><b>'+esc(tt("q_"+q))+'</b><small>'+esc(tt(SUB[q]))+' · '+esc(tt(POS[q]))+' · '+L2.length+'</small></h4>'+
   (T2.length?'<ol>'+T2.map(function(i){ return '<li><code dir="ltr">'+esc(CD[i.id])+'</code><span>'+esc(short(i.t,120))+'</span><em dir="ltr">'+(i.w?"w"+i.w:"—")+(evOk(i)?"":" · ⚠")+'</em></li>'; }).join("")+'</ol>':'<p class="sw-none">'+esc(tt("gridEmpty"))+'</p>')+
   (L2.length>TOP?'<p class="sw-more">'+esc(tt("gridMore",{n:L2.length-TOP}))+'</p>':'')+'</section>'; }).join("")+'</div>';
}
function towsHTML(r,lang){
 var tt=tt0(lang), CD=codes(r);
 return '<div class="sw-tows" role="group" aria-label="'+esc(tt("towsT"))+'">'+TW.map(function(k){ var O=opts(r).filter(function(o){ return o.k===k; });
  return '<section class="sw-tw"><h4 dir="ltr">'+k.toUpperCase()+'</h4><p class="sw-twd">'+esc(tt("tw_"+k))+'</p>'+(O.length?'<ul>'+O.map(function(o){ var s=optSides(r,o), ok=optOk(r,o);
   return '<li'+(ok?'':' class="bad"')+'><code dir="ltr">'+esc(CD[o.id])+'</code> '+esc(short(o.t,140))+' <small dir="ltr">'+esc(s[0].concat(s[1]).map(function(x){ return CD[x]; }).join(", ")||"—")+'</small></li>'; }).join("")+'</ul>':'<p class="sw-none">'+esc(tt("twEmpty"))+'</p>')+'</section>'; }).join("")+'</div>';
}
var FONT="font-family=\"'IBM Plex Sans Arabic','IBM Plex Sans',Calibri,Tahoma,sans-serif\"";
function chartW(){ try{ return window.innerWidth<640?340:560; }catch(e){ return 560; } }
/* items by source type: one bar per type, the part with evidence and the part without */
function srcSVG(list,o){
 o=o||{}; var lang=o.lang||L, rtl=lang==="ar", W=o.W||560, tt=tt0(lang), f=function(v){ return Math.round(v*10)/10; };
 var I=[]; list.forEach(function(r){ I=I.concat(items(r)); });
 var lw=W<420?112:150, m={l:lw,r:34,t:10,b:10}, rowH=24, H=m.t+ITYPES.length*rowH+30+m.b, iw=W-m.l-m.r;
 var cnt={}; ITYPES.forEach(function(k){ cnt[k]={e:0,n:0}; }); I.forEach(function(i){ cnt[i.src][evOk(i)?"e":"n"]++; });
 var mx=Math.max.apply(null,ITYPES.map(function(k){ return cnt[k].e+cnt[k].n; }).concat([1]));
 var out=['<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 '+W+' '+H+'" width="'+W+'" height="'+H+'" role="img" aria-label="'+esc(tt("chT"))+'" direction="ltr" '+FONT+'>','<rect width="'+W+'" height="'+H+'" fill="#FFFFFF"/>'];
 ITYPES.forEach(function(k,i){ var y=m.t+i*rowH, c=cnt[k], we=c.e/mx*iw, wn=c.n/mx*iw, x0=rtl?W-m.l:m.l;
  out.push('<text x="'+f(rtl?W-6:6)+'" y="'+f(y+15)+'" fill="'+TCOL[k]+'" font-size="11" font-weight="700" text-anchor="'+(rtl?"end":"start")+'">'+esc(tt("ty_"+k))+'</text>');
  out.push('<rect x="'+f(rtl?m.r:m.l)+'" y="'+f(y+4)+'" width="'+f(iw)+'" height="14" rx="3" fill="#F3F6FA"/>');
  if(c.e) out.push('<rect x="'+f(rtl?x0-we:x0)+'" y="'+f(y+4)+'" width="'+f(we)+'" height="14" rx="3" fill="#2F7D4B"><title>'+esc(tt("ty_"+k)+" · "+tt("chEv")+" · "+c.e)+'</title></rect>');
  if(c.n) out.push('<rect x="'+f(rtl?x0-we-wn:x0+we)+'" y="'+f(y+4)+'" width="'+f(wn)+'" height="14" rx="3" fill="#C9D2DF"><title>'+esc(tt("ty_"+k)+" · "+tt("chOp")+" · "+c.n)+'</title></rect>');
  var tot=c.e+c.n; out.push('<text x="'+f(rtl?x0-we-wn-4:x0+we+wn+4)+'" y="'+f(y+15)+'" fill="#4B5874" font-size="10.5" text-anchor="'+(rtl?"end":"start")+'" direction="ltr">'+(tot||"")+'</text>'); });
 var ly=m.t+ITYPES.length*rowH+10, lx=rtl?W-16:6;
 out.push('<rect x="'+f(lx)+'" y="'+f(ly)+'" width="10" height="10" rx="2" fill="#2F7D4B"/><text x="'+f(rtl?lx-4:lx+14)+'" y="'+f(ly+9)+'" fill="#4B5874" font-size="10.5" text-anchor="'+(rtl?"end":"start")+'">'+esc(tt("chEv"))+'</text>');
 var lx2=rtl?W-136:126; out.push('<rect x="'+f(lx2)+'" y="'+f(ly)+'" width="10" height="10" rx="2" fill="#C9D2DF"/><text x="'+f(rtl?lx2-4:lx2+14)+'" y="'+f(ly+9)+'" fill="#4B5874" font-size="10.5" text-anchor="'+(rtl?"end":"start")+'">'+esc(tt("chOp"))+'</text>');
 if(!I.length) out.push('<text x="'+f(W/2)+'" y="'+f(m.t+ITYPES.length*rowH/2)+'" fill="#7A869E" font-size="12" text-anchor="middle">'+esc(tt("chEmpty"))+'</text>');
 out.push('</svg>'); return out.join("");
}
function shareLine(list,lang){ var I=[]; list.forEach(function(r){ I=I.concat(items(r)); }); if(!I.length) return ""; var e=I.filter(evOk).length, p=Math.round(e/I.length*100); return tt0(lang)("chShare",{p:p,o:100-p}); }
/* stage map: seven stages; the same markup goes into the report */
function mapHTML(r,lang){
 var tt=tt0(lang), k=stIdx(r);
 return '<ol class="dm-map sw-map" aria-label="'+esc(tt("mapT"))+'">'+MAPST.map(function(s,i){ var st=(i+1<=k)?"done":(i+1===k+1?"cur":"todo");
  return '<li class="'+st+'" style="--pc:'+SCOL[s]+'"'+(st==="cur"?' aria-current="step"':'')+'><i aria-hidden="true">'+(i+1)+'</i><span><b>'+esc(tt("st_"+s))+'</b><small>'+esc(tt("mp_"+s))+' · '+esc(tt(st==="done"?"mpDone":(st==="cur"?"mpCur":"mpTodo")))+'</small></span></li>'; }).join("")+'</ol>';
}

/* ---------- study form ---------- */
var HDR=[["title","tx",1],["ref","ltr",0],["scope","sel:SCOPES:sc_",0],["date","date",0],["facil","tx",0],["owner","tx",0],["revBy","date",0],["src","sel:SRCS:src_",0],["srcId","srcid",0],["decision","ta",1]];
var PATH={title:"title",ref:"ref",scope:"scope",date:"date",facil:"facil",owner:"owner",revBy:"revBy",src:"src",srcId:"srcId",decision:"decision"};
var LISTS={SCOPES:SCOPES,SRCS:SRCS,EXTS:EXTS,ITYPES:ITYPES,TW:TW,ASTS:ASTS,RKINDS:RKINDS,DESTS:DESTS};
function opts1(list,prefix,cur){ return list.map(function(k){ return '<option value="'+k+'"'+(cur===k?" selected":"")+'>'+esc(t(prefix+k))+'</option>'; }).join(""); }
function link(id,list,info,btn,bl){ return '<div class="ca-pd"><input id="'+id+'" type="text" dir="ltr" list="'+list+'" aria-describedby="'+info+'">'+(btn?'<button class="pd-btn ghost" type="button" id="'+btn+'">'+esc(t(bl))+'</button>':'')+'</div><datalist id="'+list+'"></datalist><div class="ca-pdinfo" id="'+info+'" aria-live="polite"></div>'; }
function fieldHTML(name,kind,wide,lab){
 var id="f-"+name, lb=lab||t("f_"+name), inner="", m=/^sel:(\w+):(\w+)$/.exec(kind);
 if(kind==="ta") inner='<textarea id="'+id+'" rows="2"></textarea>';
 else if(kind==="date") inner='<input id="'+id+'" type="date">';
 else if(kind==="ltr") inner='<input id="'+id+'" type="text" dir="ltr">';
 else if(m) inner='<select id="'+id+'">'+opts1(LISTS[m[1]],m[2])+'</select>';
 else if(kind==="srcid") inner=link(id,"srcList","srcInfo","srcOpen","srcOpen");
 else inner='<input id="'+id+'" type="text">';
 return '<div class="pd-f'+(wide?" wide":"")+'" id="w-'+name+'"><label for="'+id+'">'+esc(lb)+'</label>'+inner+'</div>';
}
function tblHTML(name,cls,heads){ return '<div class="ca-actw" id="'+name+'W"><table class="a3-tbl '+cls+'"><thead><tr>'+heads.map(function(h){ return '<th>'+(h?esc(h):'<span class="sr">—</span>')+'</th>'; }).join("")+'</tr></thead><tbody id="'+name+'Rows"></tbody></table></div>'; }
function addBtn(name,lbl){ return '<button class="pd-btn ghost" type="button" data-add="'+name+'">+ '+esc(lbl)+'</button>'; }
function secHTML(k,col,inner){ return '<section class="dm-ph sw-sec" id="sec-'+k+'" style="--pc:'+col+'" aria-labelledby="sct-'+k+'"><h3 class="dm-pht" id="sct-'+k+'">'+esc(t("s"+k+"T"))+'</h3><p class="dm-phs">'+esc(t("s"+k+"S"))+'</p>'+inner+'</section>'; }
function quadHTML(q){ return '<div class="sw-qbox" style="--qc:'+QCOL[q]+'"><h4 class="sw-qh">'+esc(t("q_"+q))+'</h4><div class="dm-cards sw-cards" id="itC-'+q+'" data-q="'+q+'"></div><p class="ca-hint" id="itN-'+q+'"></p><div class="w5-warn" id="itW-'+q+'" role="note" hidden></div><div class="a3-add">'+addBtn("it:"+q,t("itAdd_"+q))+'</div></div>'; }
function buildForm(){
 document.getElementById("hdrFields").innerHTML=HDR.map(function(f){ return fieldHTML(f[0],f[1],f[2]); }).join("");
 var S1=tblHTML("tm","sw-tm",[t("tmN"),t("tmRole"),t("tmExt"),""])+'<p class="ca-hint" id="tmNone"></p><div class="a3-add">'+addBtn("tm",t("tmAdd"))+'</div><div class="w5-warn w5-bad" id="tmWarn" role="note" hidden></div>';
 var S2='<div class="sw-two">'+quadHTML("s")+quadHTML("w")+'</div>';
 var S3='<div class="sw-two">'+quadHTML("o")+quadHTML("t")+'</div>';
 var S4='<div class="a3-add"><button class="pd-btn ghost" type="button" id="rkBtn">'+esc(t("rkBtn"))+'</button><span class="pd-ok" id="rkMsg" role="status"></span></div><div class="w5-warn" id="rkWarn" role="note" hidden></div><h4 class="sw-vh">'+esc(t("gridT"))+'</h4><div id="swGrid" aria-live="polite"></div><h4 class="sw-vh">'+esc(t("chT"))+'</h4><div class="sw-chartw" id="swChart"></div><p class="ca-hint" id="swShare"></p>';
 var S5='<div id="opCards" class="dm-cards sw-ocards"></div><p class="ca-hint" id="opNone"></p><div class="a3-add">'+addBtn("op",t("opAdd"))+'</div><div class="w5-warn" id="opWarn" role="note" hidden></div><h4 class="sw-vh">'+esc(t("towsT"))+'</h4><div id="swTows" aria-live="polite"></div>';
 var S6='<div id="acCards" class="dm-cards sw-acards"></div><p class="ca-hint" id="acNone"></p><div class="a3-add">'+addBtn("ac",t("acAdd"))+'</div><div class="w5-warn" id="acWarn" role="note" hidden></div>'+
  tblHTML("ro","sw-ro",[t("ro_kind"),t("ro_item"),t("ro_what"),t("ro_dest"),t("ro_ref"),t("ro_who"),""])+'<p class="ca-hint" id="roNone"></p><div class="a3-add">'+addBtn("ro",t("roAdd"))+'</div><div class="w5-warn" id="roWarn" role="note" hidden></div>';
 var S7=tblHTML("rv","sw-rv",[t("rvDate"),t("rvChg"),t("rvAdd"),t("rvRem"),""])+'<p class="ca-hint" id="rvNone"></p><div class="a3-add">'+addBtn("rv",t("rvAddBtn"))+'</div><div class="w5-warn" id="rvWarn" role="note" hidden></div>';
 document.getElementById("stages").innerHTML=secHTML("Tm","#1E8C93",S1)+secHTML("In","#3C9A5F",S2)+secHTML("Ex","#3563C9",S3)+secHTML("Rk","#1B2A4A",S4)+secHTML("Op","#7B5BB8",S5)+secHTML("Ac","#C9821A",S6)+secHTML("Rv","#3C9A5F",S7);
 fillLists();
}
function fill(list){ return list.map(function(r){ return '<option value="'+esc(r[0])+'">'+esc(r[1])+'</option>'; }).join(""); }
function srcIds(src){
 if(src==="strat"||src==="tows"||src==="pestle") return (ssRows(src==="strat"?"swot":src)||[]).map(function(x){ return [txt(ssTKV(x.id)),short(ssTKV(x.text),80)]; });
 var key={lessons:LL_KEY,pareto:PARETO_KEY,fmea:FM_KEY}[src]; return key?(recsOf(key)||[]).map(function(c){ return [str(c.id),(str(c.ref)?str(c.ref)+" · ":"")+str(c.title||c.q)]; }):[];
}
function fillLists(){
 var put=function(id,list){ var dl=document.getElementById(id); if(dl) dl.innerHTML=fill(list); };
 var s=document.getElementById("f-src"); put("srcList",s?srcIds(s.value):[]);
 put("fmList",(recsOf(FM_KEY)||[]).map(function(c){ return [str(c.id),str(c.ref)+" · "+str(c.title)]; }));
}
/* ---- small tables: team, risk/opportunity entries, reviews ---- */
var TB={
 tm:{key:"team",blank:blankTm,pre:"",f:[["n","tx","tmN"],["role","tx","tmRole"],["ext","sel:EXTS:ex_","tmExt"]],max:MAXTEAM},
 ro:{key:"ros",blank:blankRo,pre:"r",f:[["kind","sel:RKINDS:rk_","ro_kind"],["item","item","ro_item"],["what","ta","ro_what"],["dest","sel:DESTS:de_","ro_dest"],["ref","ref","ro_ref"],["who","tx","ro_who"]],max:MAXROS},
 rv:{key:"revs",blank:blankRv,pre:"v",f:[["date","date","rvDate"],["chg","ta","rvChg"],["add","tx","rvAdd"],["rem","tx","rvRem"]],max:MAXREV}
};
function cellHTML(tb,f,row,i){
 var k=f[0], kind=f[1], lb=t(f[2])+" "+(i+1), id="r-"+tb+"-"+i+"-"+k, v=row[k], a=' id="'+id+'" data-k="'+k+'" aria-label="'+esc(lb)+'"', m=/^sel:(\w+):(\w+)$/.exec(kind);
 if(kind==="tx") return '<td><input type="text"'+a+' value="'+esc(v)+'"></td>';
 if(kind==="ta") return '<td><textarea rows="1"'+a+'>'+esc(v)+'</textarea></td>';
 if(kind==="date") return '<td class="a3-d"><input type="date"'+a+' value="'+esc(v)+'"></td>';
 if(kind==="item") return '<td><select'+a+' data-isel data-v="'+esc(v)+'"></select></td>';
 if(kind==="ref") return '<td><div class="ca-pd"><input type="text" dir="ltr" list="fmList"'+a+' value="'+esc(v)+'"><button class="pd-btn ghost" type="button" data-roo hidden></button></div><div class="a3-pv" data-pv></div></td>';
 if(m) return '<td><select'+a+'>'+opts1(LISTS[m[1]],m[2],v)+'</select></td>';
 return '<td></td>';
}
function rowHTML(tb,row,i){ return '<tr data-row="'+i+'" data-cid="'+esc(row.id||"")+'">'+TB[tb].f.map(function(f){ return cellHTML(tb,f,row,i); }).join("")+'<td class="a3-x"><button type="button" class="ca-x" data-rdel="'+tb+':'+i+'" aria-label="'+esc(t("tmDel"))+'" title="'+esc(t("tmDel"))+'">✕</button></td></tr>'; }
var NONE={tm:"tmNone",ro:"roNone",rv:"rvNone",ac:"acNone",op:"opNone"};
function renderTbl(tb,list){
 var box=document.getElementById(tb+"Rows"); if(!box) return;
 box.innerHTML=list.map(function(x,i){ return rowHTML(tb,x,i); }).join("");
 var ne=document.getElementById(NONE[tb]); if(ne) ne.textContent=list.length?"":t(NONE[tb]);
 autoSizeAll(box);
}
function readTbl(tb){
 var box=document.getElementById(tb+"Rows"); if(!box) return [];
 return [].map.call(box.querySelectorAll("tr[data-row]"),function(tr){ var o={id:tr.getAttribute("data-cid")||""}; TB[tb].f.forEach(function(f){ var el=tr.querySelector('[data-k="'+f[0]+'"]'); if(el) o[f[0]]=(el.tagName==="SELECT"&&el.hasAttribute("data-isel")&&!el.options.length)?(el.getAttribute("data-v")||""):txt(el.value); }); return o; });
}
/* ---- cards: items, options, actions ---- */
function cf(pre,i,k,kind,labHTML,wide){
 var id="r-"+pre+"-"+i+"-"+k, a=' id="'+id+'" data-k="'+k+'"', m=/^sel:(\w+):(\w+)$/.exec(kind), inner;
 if(kind==="ta") inner='<textarea rows="1"'+a+'></textarea>';
 else if(kind==="date") inner='<input type="date"'+a+'>';
 else if(kind==="ltr") inner='<input type="text" dir="ltr"'+a+'>';
 else if(kind==="w") inner='<select'+a+'><option value="">—</option>'+WTS.map(function(x){ return '<option value="'+x+'">'+x+'</option>'; }).join("")+'</select>';
 else if(kind==="rk") inner='<input type="number" min="1" max="99" step="1" inputmode="numeric" dir="ltr"'+a+'>';
 else if(kind==="opt") inner='<select'+a+' data-osel></select>';
 else if(m) inner='<select'+a+'>'+opts1(LISTS[m[1]],m[2])+'</select>';
 else inner='<input type="text"'+a+'>';
 return '<div class="pd-f'+(wide?" wide":"")+' sw-f-'+k+'"><label for="'+id+'">'+labHTML+'</label>'+inner+'</div>';
}
function L1(k,v){ return esc(t(k,v)); }
var ITK=["t","ev","evs","evd","src","sid","w","rk","note"], OPK=["k","t"], ACK=["opt","what","who","by","st","done","ev"];
function itCardHTML(x,i){
 var p="it"+x.q;
 return '<div class="dm-card sw-it" data-row="'+i+'" data-cid="'+esc(x.id)+'" data-q="'+x.q+'" style="--qc:'+QCOL[x.q]+'">'+
  '<div class="dm-ch"><b class="dm-code" data-code dir="ltr"></b><span data-stc></span><button type="button" class="ca-x" data-idel="'+esc(x.id)+'" data-iq="'+x.q+'" data-ii="'+i+'" aria-label="'+esc(t("itDel"))+'" title="'+esc(t("itDel"))+'">✕</button></div>'+
  '<div class="pd-fields">'+cf(p,i,"t","ta",L1("it_t"),1)+cf(p,i,"ev","ta",L1("it_ev"),1)+cf(p,i,"evs","tx",L1("it_evs"))+cf(p,i,"evd","date",L1("it_evd"))+cf(p,i,"src","sel:ITYPES:ty_",L1("it_src"))+cf(p,i,"sid","ltr",L1("it_sid"))+cf(p,i,"w","w",L1("it_w"))+cf(p,i,"rk","rk",L1("it_rk"))+cf(p,i,"note","tx",L1("it_note"),1)+'</div><p class="a3-pv" data-pv></p><span class="a3-flag" data-flag></span></div>';
}
function opCardHTML(x,i){
 return '<div class="dm-card sw-op" data-row="'+i+'" data-cid="'+esc(x.id)+'">'+
  '<div class="dm-ch"><b class="dm-code" data-code dir="ltr"></b><span data-stc></span><button type="button" class="ca-x" data-rdel="op:'+i+'" aria-label="'+esc(t("opDel"))+'" title="'+esc(t("opDel"))+'">✕</button></div>'+
  '<div class="pd-fields">'+cf("op",i,"k","sel:TW:tw_",L1("op_k"))+cf("op",i,"t","ta",L1("op_t"),1)+'</div><div class="sw-links"><fieldset data-side="a"><legend></legend><div data-lk></div></fieldset><fieldset data-side="b"><legend></legend><div data-lk></div></fieldset></div><span class="a3-flag" data-flag></span></div>';
}
function acCardHTML(x,i){
 return '<div class="dm-card sw-ac" data-row="'+i+'" data-cid="'+esc(x.id)+'">'+
  '<div class="dm-ch"><b class="dm-code" data-code dir="ltr"></b><span data-stc></span><button type="button" class="ca-x" data-rdel="ac:'+i+'" aria-label="'+esc(t("acDel"))+'" title="'+esc(t("acDel"))+'">✕</button></div>'+
  '<div class="pd-fields">'+cf("ac",i,"opt","opt",L1("ac_opt"))+cf("ac",i,"what","ta",L1("ac_what"),1)+cf("ac",i,"who","tx",L1("ac_who"))+cf("ac",i,"by","date",L1("ac_by"))+cf("ac",i,"st","sel:ASTS:as_",L1("ac_st"))+cf("ac",i,"done","date",L1("ac_done"))+cf("ac",i,"ev","ta",L1("ac_ev"),1)+'</div><span class="a3-flag" data-flag></span></div>';
}
function setVal(el,v){ if(!el) return; if(el.tagName==="SELECT"){ if([].some.call(el.options,function(o){ return o.value===String(v==null?"":v); })) el.value=String(v==null?"":v); else el.setAttribute("data-v",String(v==null?"":v)); } else el.value=v==null?"":String(v); }
function renderItems(list){
 QS.forEach(function(q){ var box=document.getElementById("itC-"+q); if(!box) return; var L2=list.filter(function(x){ return x.q===q; });
  box.innerHTML=L2.map(function(x,i){ return itCardHTML(x,i); }).join("");
  [].forEach.call(box.querySelectorAll(".dm-card"),function(card,i){ var x=L2[i]; ITK.forEach(function(k){ setVal(card.querySelector('[data-k="'+k+'"]'),x[k]); }); });
  var ne=document.getElementById("itN-"+q); if(ne) ne.textContent=L2.length?"":t("itNone"); autoSizeAll(box); });
}
function readItems(){ var o=[]; QS.forEach(function(q){ var box=document.getElementById("itC-"+q); if(!box) return;
 [].forEach.call(box.querySelectorAll(".dm-card"),function(card){ var x={id:card.getAttribute("data-cid"),q:q}; ITK.forEach(function(k){ var el=card.querySelector('[data-k="'+k+'"]'); x[k]=el?txt(el.value):""; }); o.push(x); }); }); return o; }
function renderOpts(list){
 var box=document.getElementById("opCards"); if(!box) return;
 box.innerHTML=list.map(function(x,i){ return opCardHTML(x,i); }).join("");
 [].forEach.call(box.querySelectorAll(".dm-card"),function(card,i){ var x=list[i]; OPK.forEach(function(k){ setVal(card.querySelector('[data-k="'+k+'"]'),x[k]); }); card.setAttribute("data-a",JSON.stringify(x.a)); card.setAttribute("data-b",JSON.stringify(x.b)); card.removeAttribute("data-sig"); });
 var ne=document.getElementById("opNone"); if(ne) ne.textContent=list.length?"":t("opNone"); autoSizeAll(box);
}
/* the items ticked on one side of an option card; before the lists are drawn, the ids the card was rendered with */
function sideSel(card,side){ if(card.hasAttribute("data-"+side)){ try{ return idl(JSON.parse(card.getAttribute("data-"+side))); }catch(e){ return []; } }
 var fs=card.querySelector('fieldset[data-side="'+side+'"]'); if(!fs) return [];
 return [].filter.call(fs.querySelectorAll("input[data-iid]"),function(c){ return c.checked; }).map(function(c){ return c.getAttribute("data-iid"); }); }
function readOpts(){
 var box=document.getElementById("opCards"); if(!box) return [];
 return [].map.call(box.querySelectorAll(".dm-card"),function(card){ var o={id:card.getAttribute("data-cid"),a:[],b:[]}; OPK.forEach(function(k){ var el=card.querySelector('[data-k="'+k+'"]'); o[k]=el?txt(el.value):""; });
  o.a=sideSel(card,"a"); o.b=sideSel(card,"b"); return o; });
}
function renderActs(list){
 var box=document.getElementById("acCards"); if(!box) return;
 box.innerHTML=list.map(function(x,i){ return acCardHTML(x,i); }).join("");
 [].forEach.call(box.querySelectorAll(".dm-card"),function(card,i){ var x=list[i]; ACK.forEach(function(k){ var el=card.querySelector('[data-k="'+k+'"]'); if(k==="opt"&&el){ el.setAttribute("data-v",x.opt); } else setVal(el,x[k]); }); });
 var ne=document.getElementById("acNone"); if(ne) ne.textContent=list.length?"":t("acNone"); autoSizeAll(box);
}
function readActs(){
 var box=document.getElementById("acCards"); if(!box) return [];
 return [].map.call(box.querySelectorAll(".dm-card"),function(card){ var o={id:card.getAttribute("data-cid")}; ACK.forEach(function(k){ var el=card.querySelector('[data-k="'+k+'"]'); o[k]=el?((k==="opt"&&!el.options.length)?(el.getAttribute("data-v")||""):txt(el.value)):""; }); return o; });
}
function autoSize(el){ if(!el||el.tagName!=="TEXTAREA") return; el.style.height="auto"; if(el.scrollHeight) el.style.height=(el.scrollHeight+2)+"px"; }
function autoSizeAll(root){ if(root) root.querySelectorAll("textarea").forEach(autoSize); }
/* the study as it would be saved: empty rows dropped */
function formToRec(){
 var r=blank();
 Object.keys(PATH).forEach(function(k){ var el=document.getElementById("f-"+k); if(el) setPath(r,PATH[k],txt(el.value)); });
 if(document.getElementById("opCards")){
  r.team=readTbl("tm").map(fixTm).filter(function(x){ return x.n||x.role; });
  r.items=readItems().filter(function(x){ return x.t||x.ev||x.evs; });
  r.opts=readOpts().filter(function(x){ return x.t||x.a.length; });
  r.acts=readActs().filter(function(x){ return x.what||x.who||x.ev; });
  r.ros=readTbl("ro").filter(function(x){ return x.what||x.ref||x.who; });
  r.revs=readTbl("rv").filter(function(x){ return x.date||x.chg||x.add||x.rem; });
 }
 r.id=document.getElementById("rid").value;
 if(editing&&editing.id===r.id){ r.created=editing.created||""; }
 fixRec(r);
 return r;
}
function setPath(r,p,v){ r[p]=v; }
/* while typing, the study keeps every row (even empty ones) so the cards and tables keep their shape */
function formRaw(){ return {tm:readTbl("tm"),ro:readTbl("ro"),rv:readTbl("rv"),it:readItems(),op:readOpts(),ac:readActs()}; }
function recToForm(r,keepMsg){
 r=fixRec(JSON.parse(JSON.stringify(r)));
 document.getElementById("rid").value=r.id||"";
 Object.keys(PATH).forEach(function(k){ var el=document.getElementById("f-"+k); if(!el) return; var v=r[PATH[k]]; v=(v===null||v===undefined)?"":String(v); el.value=v||(el.tagName==="SELECT"&&el.options.length?el.options[0].value:""); });
 fillLists();
 renderTbl("tm",r.team); renderItems(r.items); renderOpts(r.opts); renderActs(r.acts); renderTbl("ro",r.ros); renderTbl("rv",r.revs);
 if(!keepMsg){ ["recErr","recOk","rkMsg"].forEach(function(id){ var e=document.getElementById(id); if(e) e.textContent=""; }); }
 refreshForm();
 autoSizeAll(document.getElementById("stages")); autoSizeAll(document.getElementById("hdrFields"));
}
function loadRecordIntoForm(r){ editing=fixRec(JSON.parse(JSON.stringify(r))); recToForm(editing); }
function clearForm(){ editing=null; recToForm(blank()); }
function setW(id,on,msg){ var w=document.getElementById(id); if(!w) return; w.hidden=!on; w.textContent=on?msg:""; }
/* the item lists inside option cards, the option lists inside action cards and the item lists inside entries follow the form;
   they are rebuilt only when what they list has changed, so typing never loses focus */
function itemLabel(CD,i){ return CD[i.id]+" · "+short(i.t,60); }
function syncOptCards(r,CD){
 document.querySelectorAll("#opCards .dm-card").forEach(function(card){
  var k=(card.querySelector('[data-k="k"]')||{}).value||"so", qq=TWQ[k]||TWQ.so, sig=k+"|"+QS.map(function(q){ return items(r).filter(function(i){ return i.q===q; }).map(function(i){ return i.id+":"+itemLabel(CD,i); }).join(","); }).join("/")+"|"+L;
  if(card.getAttribute("data-sig")===sig) return;
  var sel=sideSel(card,"a").concat(sideSel(card,"b"));
  [].forEach.call(card.querySelectorAll("fieldset[data-side]"),function(fs){ var q=qq[fs.getAttribute("data-side")==="a"?0:1], I=items(r).filter(function(i){ return i.q===q; }), cid=card.getAttribute("data-cid");
   fs.querySelector("legend").textContent=t(fs.getAttribute("data-side")==="a"?"op_a":"op_b",{q:t("q_"+q)});
   fs.querySelector("[data-lk]").innerHTML=I.length?I.map(function(i){ var id="lk-"+cid+"-"+i.id; return '<label class="sw-lk" for="'+id+'"><input type="checkbox" id="'+id+'" data-iid="'+esc(i.id)+'"'+(sel.indexOf(i.id)>=0?" checked":"")+'><span>'+esc(itemLabel(CD,i))+'</span></label>'; }).join(""):'<p class="ca-hint">'+esc(t("opNoIt"))+'</p>'; });
  card.setAttribute("data-sig",sig); card.removeAttribute("data-a"); card.removeAttribute("data-b"); });
}
function syncSelects(r,CD){
 var oSig=JSON.stringify(r.opts.map(function(o){ return [o.id,CD[o.id],short(o.t,50)]; }))+L;
 document.querySelectorAll("#acCards select[data-osel]").forEach(function(el){ if(el.getAttribute("data-sig")===oSig) return; var cur=el.options.length?el.value:(el.getAttribute("data-v")||"");
  el.innerHTML='<option value="">'+esc(t("acPick"))+'</option>'+r.opts.map(function(o){ return '<option value="'+esc(o.id)+'">'+esc(CD[o.id]+" · "+short(o.t,50))+'</option>'; }).join("");
  el.value=r.opts.some(function(o){ return o.id===cur; })?cur:""; el.setAttribute("data-sig",oSig); });
 var iSig=JSON.stringify(r.items.map(function(i){ return [i.id,itemLabel(CD,i)]; }))+L;
 document.querySelectorAll("#roRows select[data-isel]").forEach(function(el){ if(el.getAttribute("data-sig")===iSig) return; var cur=el.options.length?el.value:(el.getAttribute("data-v")||"");
  el.innerHTML='<option value="">'+esc(t("roPick"))+'</option>'+QS.map(function(q){ var I=r.items.filter(function(i){ return i.q===q; }); return I.length?'<optgroup label="'+esc(t("q_"+q))+'">'+I.map(function(i){ return '<option value="'+esc(i.id)+'">'+esc(itemLabel(CD,i))+'</option>'; }).join("")+'</optgroup>':""; }).join("");
  el.value=r.items.some(function(i){ return i.id===cur; })?cur:""; el.setAttribute("data-sig",iSig); });
}
function refreshForm(){
 var r=formToRec(), st=stageOf(r), CD=codes(r), raw=formRaw();
 var el=document.getElementById("curStage"); if(el) el.textContent=t("cur")+" "+stageName(st);
 document.getElementById("caSteps").innerHTML=mapHTML(r);
 /* source */
 var si=document.getElementById("srcInfo"); if(si) si.textContent=r.src==="none"?t("srcHint"):(r.srcId?srcPreview(r.src,r.srcId):(srcPreview(r.src,"")||t("srcHint")));
 var so=document.getElementById("srcOpen"); if(so) so.disabled=r.src==="none";
 /* team */
 var R=roles(r), tw=[]; if(R.length<=1&&(R.length||items(r).length)) tw.push(t("tmSolo")); else if(R.length&&R.length<3) tw.push(t("tmW3")); if(R.length&&!extIn(r).length) tw.push(t("tmWext"));
 setW("tmWarn",tw.length>0,tw.join(" ")); var tb=document.querySelector('[data-add="tm"]'); if(tb) tb.disabled=raw.tm.length>=MAXTEAM;
 /* items */
 var all=raw.it.map(fixIt), byId={}; r.items.forEach(function(i){ byId[i.id]=i; });
 QS.forEach(function(q){ var box=document.getElementById("itC-"+q); if(!box) return;
  [].forEach.call(box.querySelectorAll(".dm-card"),function(card){ var x=fixIt(raw.it.filter(function(z){ return z.id===card.getAttribute("data-cid"); })[0]||{q:q}), it=byId[x.id]||null;
   card.querySelector("[data-code]").textContent=it?CD[it.id]:q.toUpperCase()+"·";
   var ch=[]; if(it&&isTop(r,it)) ch.push('<span class="ca-chip ok">'+esc(t("topB"))+'</span>'); if(it&&!x.w) ch.push('<span class="ca-chip info">'+esc(t("wMiss"))+'</span>'); if(it&&!x.rk) ch.push('<span class="ca-chip info">'+esc(t("rkMiss"))+'</span>');
   card.querySelector("[data-stc]").innerHTML=ch.join(" ");
   var msg=[]; if(txt(x.t)&&!evOk(x)) msg.push(t("opF")); if(txt(x.t)&&lackOf(x)) msg.push(t("lackF")); var mo=txt(x.t)?misOf(x):""; if(mo) msg.push(t(mo==="int"?"misI":"misE"));
   card.querySelector("[data-flag]").textContent=msg.join(" "); card.classList.toggle("a3-pf",!!mo||(txt(x.t)&&lackOf(x)));
   var pv=card.querySelector("[data-pv]"); if(pv) pv.textContent=x.sid?sidPreview(x.sid):""; });
  var w=[]; if(inQ(r,q).length>LONG) w.push(t("longW",{n:LONG})); setW("itW-"+q,w.length>0,w.join(" "));
  var ab=document.querySelector('[data-add="it:'+q+'"]'); if(ab) ab.disabled=all.length>=MAXITEMS; });
 /* ranking and the live views */
 var rw=[]; if(dupRank(r)) rw.push(t("fl_dup")+"."); var ra=rankAgainst(r).length; if(ra) rw.push(t("rkW",{n:ra})); var ur=unranked(r).length; if(items(r).length&&ur) rw.push(t("oi_rank",{n:ur}));
 setW("rkWarn",rw.length>0,rw.join(" "));
 var g=document.getElementById("swGrid"); if(g) g.innerHTML=gridHTML(r);
 var c=document.getElementById("swChart"); if(c) c.innerHTML=srcSVG([r],{lang:L,W:chartW()}); var sh=document.getElementById("swShare"); if(sh) sh.textContent=shareLine([r]);
 /* options */
 syncOptCards(r,CD);
 document.querySelectorAll("#opCards .dm-card").forEach(function(card){ var o=r.opts.filter(function(p){ return p.id===card.getAttribute("data-cid"); })[0];
  card.querySelector("[data-code]").textContent=o?CD[o.id]:"·"; var bad=!!o&&txt(o.t)&&!optOk(r,o);
  card.querySelector("[data-stc]").innerHTML=o&&txt(o.t)?'<span class="ca-chip '+(bad?"warn":"ok")+'">'+esc(t("tw_"+o.k).split(" ")[0])+'</span>':"";
  card.querySelector("[data-flag]").textContent=bad?t("opBad"):""; card.classList.toggle("a3-pf",bad); });
 var ow=[]; var uc=uncov(r); if(opts(r).length&&uc.length) ow.push(t("uncovW",{n:uc.length,c:cList(r,uc)})); setW("opWarn",ow.length>0,ow.join(" "));
 var ob=document.querySelector('[data-add="op"]'); if(ob) ob.disabled=raw.op.length>=MAXOPTS;
 var tv=document.getElementById("swTows"); if(tv) tv.innerHTML=towsHTML(r);
 /* actions and entries */
 syncSelects(r,CD);
 document.querySelectorAll("#acCards .dm-card").forEach(function(card,i){ var a=fixAc(raw.ac[i]||{}); card.querySelector("[data-code]").textContent="A"+(i+1);
  card.querySelector("[data-stc]").innerHTML=txt(a.what)?'<span class="ca-chip '+(actDone(a)?"ok":(a.st==="done"?"warn":"info"))+'">'+esc(t("as_"+a.st))+'</span>':"";
  var msg=[]; if(txt(a.what)&&!actOwned(a)) msg.push(t("ownF")); if(a.st==="done"&&txt(a.what)&&!actDone(a)) msg.push(t("evF"));
  card.querySelector("[data-flag]").textContent=msg.join(" "); card.classList.toggle("a3-pf",msg.length>0); });
 var na=optNoAct(r); setW("acWarn",na.length>0,t("optNoActW",{c:cList(r,na)}));
 var acb=document.querySelector('[data-add="ac"]'); if(acb) acb.disabled=raw.ac.length>=MAXACTS;
 document.querySelectorAll("#roRows tr[data-row]").forEach(function(tr){ var d=(tr.querySelector('[data-k="dest"]')||{}).value, ref=txt((tr.querySelector('[data-k="ref"]')||{}).value), b=tr.querySelector("[data-roo]"), pv=tr.querySelector("[data-pv]");
  if(b){ b.hidden=!(d==="iso31000"||(d==="fmea"&&ref)); b.textContent=d==="iso31000"?t("isoOpen")+" ↗":t("fmOpen")+" ↗"; }
  if(pv) pv.textContent=d==="fmea"?(ref?(byIdIn(FM_KEY,ref)?pvFmea(ref):t("fmMiss")):""):(d==="iso31000"?t("isoNote"):""); });
 var rm=roMiss(r); setW("roWarn",rm.length>0&&(opts(r).length>0||atLeast(r,"ranked")),t("roW",{c:cList(r,rm)}));
 var rob=document.querySelector('[data-add="ro"]'); if(rob) rob.disabled=raw.ro.length>=MAXROS;
 /* review */
 var vw=""; if(revEarly(r)) vw=t("rvEarly"); else if(revLate(r)) vw=t("revLateW",{d:r.revBy}); setW("rvWarn",!!vw,vw);
 var vb=document.querySelector('[data-add="rv"]'); if(vb) vb.disabled=raw.rv.length>=MAXREV;
}
function validate(r){
 if(!r.title) return t("e_title");
 if(isD(r.date)&&r.revs.some(function(v){ return isD(v.date)&&v.date<r.date; })) return t("e_date");
 return "";
}
function newId(r){
 var y=(isD(r.date)?r.date:today()).slice(0,4), pre="SW-"+y+"-";
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
/* rank by weight: inside each quadrant, the heavier item first; equal weights keep their order of entry */
function rankByWeight(){
 var raw=formRaw().it;
 QS.forEach(function(q){ var L2=raw.filter(function(x){ return x.q===q&&txt(x.t); }); L2.map(function(x,k){ return [x,k]; }).sort(function(a,b){ return ((wt(b[0].w)||0)-(wt(a[0].w)||0))||(a[1]-b[1]); }).forEach(function(p,k){ p[0].rk=k+1; }); });
 renderItems(raw.map(fixIt)); refreshForm(); document.getElementById("rkMsg").textContent=t("rkDone");
}

/* ---------- start from the Strategy Studio, a lesson, Pareto or FMEA (read only, preview first) ---------- */
function stSelects(){ var s=document.getElementById("stSrc"); if(!s) return; var cur=s.value||"strat"; s.innerHTML=opts1(STSRC,"ss_",cur); }
function nFrom(src,id){ return DB.records.filter(function(r){ return (r.src===src&&r.srcId===id)||r.items.some(function(i){ return i.sid===id; }); }).length; }
/* the rows a study can start from, each as {id, x (row inside the record), t, q, info} */
function stRows(src){
 if(src==="strat"||src==="tows"||src==="pestle"){ var R=ssRows(src==="strat"?"swot":src); if(!R) return null;
  return R.map(function(x){ var id=txt(ssTKV(x.id)); return {id:id,x:"",t:ssTKV(x.text),q:src==="strat"?ssQ(x.cat):(src==="pestle"?(x.imp==="t"?"t":"o"):(TWQ[x.q]?x.q.toUpperCase():"SO")),info:src==="strat"?pvStrat(x):(src==="tows"?pvTows(x):pvPestle(x))}; }); }
 if(src==="lessons"){ var LR=recsOf(LL_KEY); if(!LR) return null; return LR.map(function(c){ return LLR.fix(JSON.parse(JSON.stringify(c))); }).filter(function(c){ return LLR.stage(c)!=="draft"; }).map(function(c){ return {id:str(c.id),x:"",t:c.title,q:c.type==="success"?"s":"w",info:pvLesson(str(c.id))}; }); }
 if(src==="pareto"){ var PR=recsOf(PARETO_KEY); if(!PR) return null; var out=[]; PR.forEach(function(p){ paRank(p).rows.filter(function(x){ return x.vit; }).forEach(function(x){ out.push({id:str(p.id),x:str(x.c.id),t:str(x.c.name),q:"w",info:pvPaCat(p,x)}); }); }); return out; }
 if(src==="fmea"){ var FR=recsOf(FM_KEY); if(!FR) return null; var o2=[]; FR.forEach(function(c){ var f=FMR.fix(JSON.parse(JSON.stringify(c))); FMR.hi(f).forEach(function(w){ o2.push({id:str(f.id),x:str(w.id),t:str(w.mode)+(txt(w.eff)?" → "+str(w.eff):""),q:"t",info:str(f.id)+" · "+t("fmst_"+FMR.stage(f))+" · S"+(w.s||"—")+" O"+(w.o||"—")+" D"+(w.d||"—")}); }); }); return o2; }
 return null;
}
function th(keys){ return '<thead><tr>'+keys.map(function(k){ return '<th>'+esc(t(k))+'</th>'; }).join("")+'</tr></thead>'; }
function stPreview(keep){
 var src=document.getElementById("stSrc").value||"strat", msg=document.getElementById("stMsg"), box=document.getElementById("stTable"), R=stRows(src);
 if(!R){ ST=null; box.hidden=true; msg.textContent=t("stNone"); return; }
 if(!R.length){ ST=null; box.hidden=true; msg.textContent=t("stEmpty"); return; }
 ST={src:src}; if(!keep) msg.textContent="";
 box.hidden=false;
 var qn=function(q){ return QS.indexOf(q)>=0?t("q1_"+q):q; };
 box.innerHTML=(src==="strat"?'<div class="pd-btns" style="margin:0 0 8px"><button class="pd-btn" type="button" data-stsrc="strat" data-stid="*">'+esc(t("stAll",{n:R.length}))+'</button></div>':'')+
  '<table class="pd-tbl">'+th(["stColId","stColT","stColQ","stColInfo","stColN","stColA"])+'<tbody>'+R.map(function(c){
  return '<tr><td><b dir="ltr">'+esc(c.id)+'</b>'+(c.x?'<br><small dir="ltr">'+esc(c.x)+'</small>':'')+'</td><td>'+esc(short(c.t,140))+'</td><td>'+esc(qn(c.q))+'</td><td><small>'+esc(c.info)+'</small></td><td>'+nFrom(src,c.id)+'</td><td><button class="pd-rowbtn" type="button" data-stsrc="'+src+'" data-stid="'+esc(c.id)+'" data-stx="'+esc(c.x)+'">'+esc(t("stUse"))+'</button></td></tr>'; }).join("")+'</tbody></table>';
}
function prefilled(r,src,id){ fixRec(r); editing=null; recToForm(r); go("tools"); document.getElementById("recOk").textContent=t("stUsed",{s:t("src_"+src),id:id}); return true; }
/* a new study filled from another tool's record; that record is only read. The item (or items), its quadrant, its source and its id are filled;
   the scope, the decision, the team, the evidence, the ranking, the options and the actions are left to the team. */
function prefillFrom(src,id,x){
 if(STSRC.indexOf(src)<0) return false;
 var r=blank(); r.src=src; r.srcId=id; r.date="";
 if(src==="strat"){ var SR=ssRows("swot"); if(!SR) return false; var rows=id==="*"?SR:SR.filter(function(z){ return txt(ssTKV(z.id))===id; }); if(!rows.length) return false;
  rows.forEach(function(z,k){ var it=blankIt("i"+(k+1),ssQ(z.cat)); it.t=ssTKV(z.text); it.w=wt(ssTKV(z.impact)); it.sid=txt(ssTKV(z.id)); it.evs=t("src_strat")+" "+it.sid; r.items.push(it); });
  r.title=t("pfT")+(id==="*"?t("src_strat"):short(ssTKV(rows[0].text),80)); r.scope="org"; if(id==="*") r.srcId=""; return prefilled(r,src,id==="*"?"":id); }
 if(src==="tows"){ var tw=ssRow("tows",id); if(!tw) return false; var k2=TWQ[tw.q]?tw.q:"so", qq=TWQ[k2], op=blankOp("p1"); op.k=k2; op.t=ssTKV(tw.text); var n=0;
  ssIds(tw.link).forEach(function(ref){ var z=ssRow("swot",ref); if(!z) return; n++; var it=blankIt("i"+n,ssQ(z.cat)); it.t=ssTKV(z.text); it.w=wt(ssTKV(z.impact)); it.sid=ref; it.evs=t("src_strat")+" "+ref; r.items.push(it);
   if(it.q===qq[0]) op.a.push(it.id); if(it.q===qq[1]) op.b.push(it.id); });
  r.opts.push(op); r.title=t("pfT")+short(op.t,80); r.scope="org"; return prefilled(r,src,id); }
 if(src==="pestle"){ var pe=ssRow("pestle",id); if(!pe) return false; var ip=blankIt("i1",pe.imp==="t"?"t":"o"); ip.t=ssTKV(pe.text); ip.src="pestle"; ip.w=wt(ssTKV(pe.sig)); ip.sid=id; ip.evs="PESTLE "+id+" · "+ssName("pestleF",pe.f);
  r.items.push(ip); r.title=t("pfT")+short(ip.t,80); r.scope="org"; return prefilled(r,src,id); }
 if(src==="lessons"){ var c=llRec(id); if(!c||LLR.stage(c)==="draft") return false; var il=blankIt("i1",c.type==="success"?"s":"w"); il.t=c.title; il.ev=c.what.ev; il.evd=isD(c.date)?c.date:""; il.src="lesson"; il.sid=id; il.evs=t("src_lessons")+" "+id;
  r.items.push(il); r.title=t("pfT")+short(c.title,80); r.scope="process"; return prefilled(r,src,id); }
 if(src==="pareto"){ var p=byIdIn(PARETO_KEY,id); if(!p) return false; var K=paRank(p), xs=K.rows.filter(function(z){ return z.vit&&(!x||str(z.c.id)===x); }); if(!xs.length) return false;
  xs.forEach(function(z,k){ var ia=blankIt("i"+(k+1),"w"); ia.t=str(z.c.name); ia.ev=fmtN(z.v)+" "+puName(p.unit)+" / "+fmtN(K.total)+" ("+(Math.round(z.share*10)/10).toFixed(1)+"%)"+(str(p.from)||str(p.to)?" · "+(str(p.from)||"—")+" → "+(str(p.to)||"—"):""); ia.evd=isD(p.to)?p.to:""; ia.src="kpi"; ia.sid=id; ia.evs="Pareto "+id; r.items.push(ia); });
  r.title=t("pfT")+short(str(p.title)||str(p.q),80); r.scope="process"; return prefilled(r,src,id); }
 if(src==="fmea"){ var f=fmRec(id); if(!f) return false; var H=FMR.hi(f).filter(function(w){ return !x||w.id===x; }); if(!H.length) return false;
  H.forEach(function(w,k){ var ifm=blankIt("i"+(k+1),"t"); ifm.t=str(w.mode)+(txt(w.eff)?" → "+str(w.eff):""); ifm.ev="S"+(w.s||"—")+" O"+(w.o||"—")+" D"+(w.d||"—")+" · AP "+(FMR.ap(w)||"—")+(txt(w.oev)?" · "+str(w.oev):""); ifm.src="risk"; ifm.sid=id; ifm.evs="FMEA "+id; ifm.w=w.s>=9?5:4; r.items.push(ifm); });
  r.title=t("pfT")+short(f.title,80); r.scope="process"; return prefilled(r,src,id); }
 return false;
}
document.getElementById("stSrc").addEventListener("change",function(){ ST=null; document.getElementById("stTable").hidden=true; document.getElementById("stMsg").textContent=""; });
document.getElementById("stPrev").addEventListener("click",function(){ stPreview(false); });
document.getElementById("stTable").addEventListener("click",function(e){ var a=e.target.closest("[data-stid]"); if(a) prefillFrom(a.getAttribute("data-stsrc"),a.getAttribute("data-stid"),a.getAttribute("data-stx")||""); });
function homeCount(){ var n=0; STSRC.forEach(function(s){ var R=stRows(s); if(R) n+=R.length; }); return n; }
function renderHomeSt(){
 var box=document.getElementById("homeImp"); if(!box) return;
 var n=homeCount(); box.hidden=!n || DB.records.length>0; if(n) document.getElementById("homeImpT").textContent=t("hmT",{n:n});
}
document.getElementById("homeImpGo").addEventListener("click",function(){ go("tools"); var s=document.getElementById("stSrc"); if(s){ var f=STSRC.filter(function(x){ var R=stRows(x); return R&&R.length; })[0]; if(f) s.value=f; } stPreview(false); var b=document.getElementById("stBox"); if(b&&b.scrollIntoView) b.scrollIntoView({block:"start"}); });

/* ---------- self-assessment ---------- */
var AQ=[
 ["IN1",{ar:"هل يُعدّ SWOT فريق من ثلاثة أدوار على الأقل، وفيه رأي من خارجه (عميل أو مورد أو مستشار أو إدارة أخرى)، لا شخص واحد؟",en:"Is the SWOT prepared by a team of at least three roles with input from outside it (a customer, a supplier, an advisor or another department), not by one person?"}],
 ["IN2",{ar:"هل تأتي الفرص والتهديدات من تحليل PESTLE وقوى بورتر وبيانات السوق والعملاء، لا من الانطباع؟",en:"Do opportunities and threats come from a PESTLE analysis, Porter's forces and market and customer data, not from impressions?"}],
 ["IN3",{ar:"هل تأتي نقاط القوة والضعف من مؤشرات الأداء ونتائج التدقيق والدروس المستفادة؟",en:"Do strengths and weaknesses come from KPIs, audit results and lessons learned?"}],
 ["EV1",{ar:"هل لكل بند دليل مكتوب (رقم أو واقعة، ومصدرها وتاريخها)، ويُنبَّه على البند الذي هو رأي فقط؟",en:"Does every item carry written evidence (a figure or a fact, with its source and date), and is an opinion-only item flagged?"}],
 ["EV2",{ar:"هل يُفصل الداخلي (القوة والضعف) عن الخارجي (الفرص والتهديدات) فصلاً واضحاً، ويُصحح البند الموضوع في غير ربعه؟",en:"Are internal items (strengths, weaknesses) kept clearly apart from external ones (opportunities, threats), and is an item in the wrong quadrant corrected?"}],
 ["EV3",{ar:"هل يُرتب كل ربع بالأهمية ويُحتفظ بالبنود العليا، بدل القوائم الطويلة؟",en:"Is each quadrant ranked by importance and the top items kept, instead of long lists?"}],
 ["DE1",{ar:"هل تتحول البنود العليا إلى خيارات (SO وST وWO وWT) يربط كل منها بنداً من ربعين؟",en:"Are the top items turned into options (SO, ST, WO, WT), each linking an item from two quadrants?"}],
 ["DE2",{ar:"هل لكل خيار مختار إجراء بمالك وموعد، ويُتابع حتى التنفيذ؟",en:"Does every option chosen get an action with an owner and a due date, followed until it is done?"}],
 ["DE3",{ar:"هل تُنقل التهديدات والفرص العليا إلى سجل المخاطر أو خطة المخاطر والفرص (6.1)؟",en:"Are the top threats and opportunities carried into the risk register or the risks and opportunities plan (6.1)?"}],
 ["RV1",{ar:"هل تؤرخ المصفوفة ويُحدد موعد مراجعتها، وتُراجع عند تغير السياق الداخلي أو الخارجي؟",en:"Is the grid dated with a review date set, and reviewed when the internal or external context changes?"}],
 ["RV2",{ar:"هل تُعرض نتائج SWOT وتغيرات القضايا الداخلية والخارجية في مراجعة الإدارة (9.3.2)؟",en:"Are the SWOT results and the changes in internal and external issues presented at management review (9.3.2)?"}],
 ["RV3",{ar:"هل تُبلَّغ نتيجة التحليل والقرارات التي خرجت منه إلى من يحتاجها؟",en:"Are the result of the analysis and the decisions taken from it communicated to those who need them?"}]
];
var AGROUPS=["IN","EV","DE","RV"];
var GCOL={IN:"#1E8C93",EV:"#3563C9",DE:"#C9821A",RV:"#3C9A5F"};
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
function qCount(r){ var c={}; QS.forEach(function(q){ c[q]=inQ(r,q).length; }); return c; }
function renderDocs(){
 var box=document.getElementById("docsBox"); if(!box) return;
 var c0=document.getElementById("cntDocs"); if(c0) c0.textContent=DB.records.length?String(DB.records.length):"";
 if(!DB.records.length){ box.innerHTML='<div class="pd-empty">'+esc(t("none"))+'</div>'; return; }
 var rows=DB.records.map(function(r){
  var st=stageOf(r), T2=tops(r), A=acts(r), qc=qCount(r);
  var del=(pendingDelete===r.id)?'<button class="pd-rowbtn arm" type="button" data-del="'+esc(r.id)+'">'+esc(t("delArm"))+'</button>':'<button class="pd-rowbtn" type="button" data-del="'+esc(r.id)+'">'+esc(t("del"))+'</button>';
  var lk=(r.src!=="none"&&(r.srcId||STTAB[r.src])?'<button class="pd-rowbtn" type="button" data-osrc="'+esc(r.src)+'" data-oid="'+esc(r.srcId)+'">'+esc(t("src_"+r.src))+' ↗</button>':'');
  return '<tr><td><b dir="ltr">'+esc(r.ref||"—")+'</b><br>'+esc(r.title)+'<br><small dir="ltr" style="color:var(--muted)">'+esc(r.id)+(isD(r.date)?' · '+esc(r.date):'')+'</small></td><td>'+esc(t("sc_"+r.scope))+'<br><small>'+esc(short(r.decision,120)||"—")+'</small></td><td>'+stChip(st)+'</td><td dir="ltr">'+esc(t("itemsN",qc))+'</td><td>'+(T2.length?T2.filter(evOk).length+"/"+T2.length:"—")+'</td><td>'+opts(r).length+' · '+(A.length?A.filter(actOwned).length+"/"+A.length:"—")+'</td><td>'+flagsOf(r).map(chip).join("")+'</td><td><button class="pd-rowbtn" type="button" data-open="'+esc(r.id)+'">'+esc(t("open"))+'</button>'+del+lk+'</td></tr>';
 }).join("");
 box.innerHTML='<table class="pd-tbl">'+th(["colRef","colScope","colStage","colItems","colTop","colOpts","colFlags","colAct"])+'<tbody>'+rows+'</tbody></table>';
}
document.addEventListener("click",function(e){
 if(e.target.closest("#cb")) return;
 var o=e.target.closest("[data-open]"); if(o){ var r=DB.records.find(function(x){ return x.id===o.getAttribute("data-open"); }); if(r){ loadRecordIntoForm(r); go("tools"); } return; }
 var d=e.target.closest("[data-del]"); if(d){ var id=d.getAttribute("data-del"); if(pendingDelete===id){ DB.records=DB.records.filter(function(x){ return x.id!==id; }); pendingDelete=null; persist(); if(document.getElementById("rid").value===id) clearForm(); renderAll(); } else { pendingDelete=id; renderDocs(); } return; }
 var os=e.target.closest("[data-osrc]"); if(os){ openSrc(os.getAttribute("data-osrc"),os.getAttribute("data-oid")); return; }
 if(e.target.closest("#srcOpen")){ var r2=formToRec(); openSrc(r2.src,r2.srcId); return; }
 if(e.target.closest("#rkBtn")){ rankByWeight(); return; }
 var ro=e.target.closest("[data-roo]"); if(ro){ var tr=ro.closest("tr"), dv=(tr.querySelector('[data-k="dest"]')||{}).value, rf=txt((tr.querySelector('[data-k="ref"]')||{}).value); if(dv==="iso31000") openTool("iso31000-risk-studio.html"); else if(rf) openSrc("fmea",rf); return; }
 var rel=e.target.closest("[data-rel]"); if(rel){ e.preventDefault(); var R0=RELATED.filter(function(x){ return x[0]===rel.getAttribute("data-rel"); })[0]; if(R0) openTool(R0[2].replace("./","").split("#")[0],R0[4]||undefined); return; }
 var di=e.target.closest("[data-idel]"); if(di){ var raw=formRaw(), iid=di.getAttribute("data-idel"), q=di.getAttribute("data-iq"), ii=Number(di.getAttribute("data-ii")), qi=-1;
  raw.it=raw.it.filter(function(x){ if(x.q!==q) return true; qi++; return qi!==ii; });
  renderItems(raw.it.map(fixIt)); refreshForm(); return; }
 var ad=e.target.closest("[data-add]"); if(ad){ var tb=ad.getAttribute("data-add"), F=formRaw();
  if(tb.indexOf("it:")===0){ var qq=tb.slice(3); if(F.it.length<MAXITEMS){ F.it.push(blankIt(nextId(F.it,"i",editing?editing.items:[]),qq)); renderItems(F.it.map(fixIt)); var bx=document.getElementById("itC-"+qq), lt=bx&&bx.querySelector(".dm-card:last-child textarea"); if(lt) lt.focus(); } refreshForm(); return; }
  if(tb==="op"){ if(F.op.length<MAXOPTS){ F.op.push(blankOp(nextId(F.op,"p",editing?editing.opts:[]))); renderOpts(F.op.map(fixOp)); var bo=document.getElementById("opCards"), lo=bo&&bo.querySelector(".dm-card:last-child textarea"); if(lo) lo.focus(); } refreshForm(); return; }
  if(tb==="ac"){ if(F.ac.length<MAXACTS){ F.ac.push(blankAc(nextId(F.ac,"a",editing?editing.acts:[]))); renderActs(F.ac.map(fixAc)); var ba=document.getElementById("acCards"), la=ba&&ba.querySelector(".dm-card:last-child textarea"); if(la) la.focus(); } refreshForm(); return; }
  var list=F[tb]; if(list.length<TB[tb].max){ var nb=TB[tb].blank(); if(TB[tb].pre) nb.id=nextId(list,TB[tb].pre,editing?editing[TB[tb].key]:[]); list.push(nb); renderTbl(tb,list); var box=document.getElementById(tb+"Rows"), lt2=box&&box.querySelector("tr:last-child input, tr:last-child textarea"); if(lt2) lt2.focus(); } refreshForm(); return; }
 var rd=e.target.closest("[data-rdel]"); if(rd){ var a=rd.getAttribute("data-rdel").split(":"), F2=formRaw(), l2=F2[a[0]]; l2.splice(Number(a[1]),1);
  if(a[0]==="op") renderOpts(l2.map(fixOp)); else if(a[0]==="ac") renderActs(l2.map(fixAc)); else renderTbl(a[0],l2); refreshForm(); return; }
});
/* a new source tool clears the record id of the old one, and the list of ids follows the tool; a new option type redraws its item lists */
document.addEventListener("change",function(e){
 var el=e.target; if(!el) return;
 if(el.id==="f-src"){ var s=document.getElementById("f-srcId"); if(s) s.value=""; fillLists(); refreshForm(); }
},true);

/* ---------- automatic audit of studies ---------- */
var CHECKS=["ref","team","quad","evid","place","rank","tows","acts","ro","review"];
function auditRecord(r){
 var I=items(r), O=opts(r);
 return {
  ref:!!(txt(r.ref)&&txt(r.title)&&txt(r.decision)&&SCOPES.indexOf(r.scope)>=0),
  team:teamOk(r),
  quad:!emptyQ(r).length,
  evid:I.length?tops(r).every(evOk):null,
  place:I.length?!misplaced(r).length:null,
  rank:I.length?rkOk(r):null,
  tows:(O.length||rkOk(r))?(O.length>0&&!badOpts(r).length):null,
  acts:O.length?(!optNoAct(r).length&&!unowned(r).length):null,
  ro:topOf(r,"t").length?!roMiss(r).length:null,
  review:(isD(r.revBy)||atLeast(r,"options"))?kept(r):null
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
 var R=DB.records, c={n:R.length,top:0,topEv:0,acts:0,rev:0,opin:0,opts:0,items:0,scope:{},src:{}};
 SCOPES.forEach(function(k){ c.scope[k]=0; }); ITYPES.forEach(function(k){ c.src[k]=0; });
 R.forEach(function(r){ var T2=tops(r); c.top+=T2.length; c.topEv+=T2.filter(evOk).length; if(acts(r).some(actOwned)) c.acts++; if(revGood(r,lastRev(r))) c.rev++;
  c.opin+=opinions(r).length; c.opts+=opts(r).length; c.scope[r.scope]++; items(r).forEach(function(i){ c.items++; c.src[i.src]++; }); });
 return c;
}
function pct(a,n){ return n?Math.round(a/n*100)+"%":"—"; }
function renderDash(){
 var box=document.getElementById("dKpis"); if(!box) return;
 var c=counts(), au=auditSummary(), as=assessScore(), n=c.n, oi=openItems();
 box.innerHTML=TBX.kpi(n,t("kTotal"))+TBX.kpi(c.top?c.topEv+"/"+c.top:"—",t("kEvid"))+TBX.kpi(pct(c.acts,n),t("kActs"))+TBX.kpi(pct(c.rev,n),t("kRev"))+TBX.kpi(c.opin,t("kOpin"))+TBX.kpi(c.opts,t("kOpts"))+TBX.kpi(oi.length,t("kOpen"))+TBX.kpi(au.rate===null?"—":au.rate+"%",t("kAud"))+TBX.kpi(as+"%",t("kAs"));
 var nd='<p class="pd-sub" style="color:var(--ink-soft)">'+esc(t("noData"))+'</p>';
 document.getElementById("dStage").innerHTML=n?TBX.dist(STAGES,n,function(s){ return DB.records.filter(function(r){ return stageOf(r)===s; }).length; },stageName,function(s){ return SCOL[s]; }):nd;
 document.getElementById("dScope").innerHTML=n?TBX.dist(SCOPES,n,function(k){ return c.scope[k]; },function(k){ return t("sc_"+k); },function(){ return "#1B2A4A"; }):nd;
 document.getElementById("dSrc").innerHTML=c.items?TBX.dist(ITYPES,c.items,function(k){ return c.src[k]; },function(k){ return t("ty_"+k); },function(k){ return TCOL[k]; }):nd;
 document.getElementById("dAssess").innerHTML=AGROUPS.map(function(g){ var p=assessScore(g); return TBX.bar(t("g_"+g),p+"%",p,GCOL[g]); }).join("")+'<p class="pd-sub" style="font-size:12.5px;color:var(--muted);margin:10px 0 0">'+esc(t("bandNote"))+'</p>';
 var dc=document.getElementById("dChart"); if(dc) dc.innerHTML=srcSVG(DB.records,{lang:L,W:chartW()});
 var ds=document.getElementById("dShare"); if(ds) ds.textContent=shareLine(DB.records);
 document.getElementById("dOpen").innerHTML=oi.length?oi.map(function(x){ return '<li><b>'+esc(x.r.ref||x.r.id)+'</b>'+chip([x.r.id,"info"])+'<span>'+esc(x.s)+'</span></li>'; }).join(""):'<li>'+esc(n?t("noOpen"):t("noData"))+'</li>';
}

/* ---------- report and CSV ---------- */
function buildCSV(){
 var head=["id","ref","title","scope","decision","date","facilitator","owner","nextReview","source","sourceId","stage","team","strengths","weaknesses","opportunities","threats","topItemsWithEvidence","towsOptions","actions","riskOpportunityEntries","reviews","lastReview"];
 return TBX.csv(head,DB.records.map(function(r){
  var CD=codes(r), T2=tops(r), lr=lastRev(r);
  var tm=r.team.map(function(m){ return m.n+" ("+m.role+(m.ext!=="no"?", "+m.ext:"")+")"; }).join(" | ");
  var it=function(q){ return r.items.filter(function(i){ return i.q===q; }).map(function(i){ return CD[i.id]+" ["+i.src+"] "+i.t+(i.ev?" — "+i.ev:"")+(i.evs?" ("+i.evs+(i.evd?" "+i.evd:"")+")":"")+" — w"+(i.w||"-")+" r"+(i.rk||"-")+(i.sid?" — "+i.sid:"")+(i.note?" — note: "+i.note:""); }).join(" | "); };
  var op=r.opts.map(function(o){ var s=optSides(r,o); return CD[o.id]+" "+o.t+" ["+s[0].concat(s[1]).map(function(x){ return CD[x]; }).join(", ")+"]"; }).join(" | ");
  var ac=r.acts.map(function(a){ return CD[a.id]+" ("+(CD[a.opt]||"-")+") "+a.what+" — "+a.who+" by "+a.by+" — "+a.st+(a.done?" "+a.done:"")+(a.ev?" — "+a.ev:""); }).join(" | ");
  var ro=r.ros.map(function(x){ return CD[x.id]+" ["+x.kind+"] ("+(CD[x.item]||"-")+") "+x.what+" → "+x.dest+(x.ref?" "+x.ref:"")+(x.who?" — "+x.who:""); }).join(" | ");
  var rv=r.revs.map(function(v){ return CD[v.id]+" "+v.date+" — "+v.chg+(v.add?" — added: "+v.add:"")+(v.rem?" — removed: "+v.rem:""); }).join(" | ");
  return [r.id,r.ref,r.title,r.scope,r.decision,r.date,r.facil,r.owner,r.revBy,r.src,r.srcId,stageOf(r),tm,it("s"),it("w"),it("o"),it("t"),T2.filter(evOk).length+"/"+T2.length,op,ac,ro,rv,lr?lr.date:""]; }));
}
function recReport(r){
 var CD=codes(r), A=auditRecord(r);
 var row=function(k,v){ return '<tr><th>'+esc(k)+'</th><td>'+esc(v===null||v===undefined||v===""?"—":v)+'</td></tr>'; };
 var mark=function(v){ return v===null?'<td class="na">—</td>':(v?'<td class="ok">✓</td>':'<td class="bad">✗</td>'); };
 var tbl=function(list,heads,cells){ return list.length?'<table><thead><tr>'+heads.map(function(h){ return '<th>'+esc(t(h))+'</th>'; }).join("")+'</tr></thead><tbody>'+list.map(function(x){ return '<tr>'+cells(x).map(function(c){ return '<td>'+esc(c===""||c===null?"—":c)+'</td>'; }).join("")+'</tr>'; }).join("")+'</tbody></table>':'<p class="meta">—</p>'; };
 var I2=r.items.slice().sort(function(a,b){ return QS.indexOf(a.q)-QS.indexOf(b.q); });
 return '<section class="an"><h3><span dir="ltr">'+esc(r.id)+'</span> · <span dir="ltr">'+esc(r.ref||"—")+'</span> — '+esc(r.title)+'</h3>'+
  '<p class="meta">'+esc(t("colStage"))+': <b>'+esc(stageName(stageOf(r)))+'</b> · '+esc(t("sc_"+r.scope))+' · '+esc(t("src_"+r.src))+(r.srcId?' <span dir="ltr">'+esc(r.srcId)+'</span>':'')+'</p>'+
  mapHTML(r)+
  '<table><tbody>'+row(t("f_decision"),r.decision)+row(t("f_date"),r.date)+row(t("f_facil"),r.facil)+row(t("f_owner"),r.owner)+row(t("f_revBy"),r.revBy)+'</tbody></table>'+
  '<h4>'+esc(t("rpTeam"))+'</h4>'+tbl(r.team,["tmN","tmRole","tmExt"],function(m){ return [m.n,m.role,t("ex_"+m.ext)]; })+
  '<h4>'+esc(t("rpGrid"))+'</h4>'+gridHTML(r)+
  '<h4>'+esc(t("rpItems"))+'</h4>'+tbl(I2,["it_t","it_ev","it_evs","it_src","it_w","it_rk"],function(i){ return [CD[i.id]+" · "+i.t+(isTop(r,i)?" ★":"")+(misOf(i)?" ⚠":""),i.ev||t("opF"),(i.evs||"")+(i.evd?" · "+i.evd:"")+(i.sid?" · "+i.sid:""),t("ty_"+i.src),i.w||"",i.rk||""]; })+
  '<h4>'+esc(t("rpTows"))+'</h4>'+towsHTML(r)+
  '<h4>'+esc(t("rpActs"))+'</h4>'+tbl(r.acts,["ac_opt","ac_what","ac_who","ac_by","ac_st","ac_done","ac_ev"],function(a){ return [(CD[a.id]||"")+" · "+(CD[a.opt]||"—"),a.what,a.who,a.by,t("as_"+a.st),a.done,a.ev]; })+
  '<h4>'+esc(t("rpRo"))+'</h4>'+tbl(r.ros,["ro_kind","ro_item","ro_what","ro_dest","ro_ref","ro_who"],function(x){ return [(CD[x.id]||"")+" · "+t("rk_"+x.kind),CD[x.item]||"—",x.what,t("de_"+x.dest),x.ref,x.who]; })+
  '<h4>'+esc(t("rpRev"))+'</h4>'+tbl(r.revs,["rvDate","rvChg","rvAdd","rvRem"],function(v){ return [v.date,v.chg,v.add,v.rem]; })+
  '<h4>'+esc(t("rpAu"))+'</h4><table><thead><tr>'+CHECKS.map(function(k){ return '<th>'+esc(t("k_"+k))+'</th>'; }).join("")+'</tr></thead><tbody><tr>'+CHECKS.map(function(k){ return mark(A[k]); }).join("")+'</tr></tbody></table></section>';
}
var MAP_CSS=".dm-map{list-style:none;margin:8px 0 12px;padding:0;display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:6px}.dm-map li{display:flex;gap:6px;align-items:center;border:1px solid #DCE4EE;border-radius:10px;padding:6px 7px;background:#fff;min-width:0}.dm-map li i{font-style:normal;flex:none;display:inline-grid;place-items:center;width:24px;height:24px;border-radius:50%;background:#EEF1F6;color:#4B5874;font-family:Georgia,serif;font-weight:700;font-size:12px}.dm-map li span{display:flex;flex-direction:column;min-width:0}.dm-map li b{font-size:12px}.dm-map li small{font-size:10.5px;color:#4B5874}.dm-map li.done i,.dm-map li.cur i{background:var(--pc);color:#fff}.dm-map li.done{border-color:var(--pc)}.dm-map li.cur{border:2px solid var(--pc)}.dm-map li.todo{opacity:.72}@media (max-width:760px){.dm-map{grid-template-columns:1fr}}";
var VIEW_CSS=".sw-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin:8px 0}.sw-q{border:1px solid #DCE4EE;border-top:4px solid var(--qc);border-radius:10px;padding:8px 10px;min-width:0;background:#fff}.sw-q h4{margin:0 0 4px;display:flex;flex-wrap:wrap;gap:4px 8px;align-items:baseline;color:var(--qc)}.sw-q h4 small{color:#4B5874;font-weight:400;font-size:11.5px}.sw-q ol{margin:0;padding:0;list-style:none;display:grid;gap:4px}.sw-q li{display:flex;gap:6px;align-items:baseline;font-size:13px;overflow-wrap:anywhere;min-width:0}.sw-q li span{flex:1;min-width:0}.sw-q code{font-family:Georgia,serif;font-weight:700;color:var(--qc)}.sw-q em{font-style:normal;color:#4B5874;font-size:11.5px;white-space:nowrap}.sw-none,.sw-more{margin:2px 0;color:#7A869E;font-size:12.5px}.sw-tows{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin:8px 0}.sw-tw{border:1px solid #DCE4EE;border-radius:10px;padding:8px 10px;min-width:0}.sw-tw h4{margin:0;font-family:Georgia,serif;color:#7B5BB8}.sw-twd{margin:0 0 4px;font-size:12px;color:#4B5874}.sw-tw ul{margin:0;padding-inline-start:16px;font-size:13px;overflow-wrap:anywhere}.sw-tw li.bad{color:#B42318}.sw-tw code{font-family:Georgia,serif;font-weight:700}.sw-tw small{color:#4B5874}";
function buildReportHTML(){
 var c=counts(), au=auditSummary(), as=assessScore(), d=today(), n=c.n, A=TBX.audit(DB.records,auditRecord,CHECKS), oi=openItems();
 var mark=function(v){ return v===null?'<td class="na">—</td>':(v?'<td class="ok">✓</td>':'<td class="bad">✗</td>'); };
 var grpRows=AGROUPS.map(function(g){ return '<tr><td>'+esc(t("g_"+g))+' — '+g+'</td><td>'+assessScore(g)+'%</td></tr>'; }).join("");
 var auRows=A.rows.map(function(x){ return '<tr><td dir="ltr">'+esc(x.r.id)+'</td>'+CHECKS.map(function(k){ return mark(x.res[k]); }).join("")+'</tr>'; }).join("");
 var body='<div class="cover"><p class="kick">Continual Improvement Academy · CIA Toolbox</p><h1>SWOT Analysis / تحليل SWOT</h1><p class="sub">'+esc(t("rpCover"))+'</p>'+
  '<p class="meta">'+esc(t("prep"))+': <bdi><strong>مدثر سلامه</strong></bdi> · <bdi dir="ltr">'+esc(d)+'</bdi> · <bdi>'+esc(t("kTotal"))+': '+n+'</bdi></p></div>'+
  '<h2>Summary / الملخص</h2><div class="k">'+
   '<div><b>'+n+'</b>'+esc(t("kTotal"))+'</div><div><b>'+(c.top?c.topEv+"/"+c.top:"—")+'</b>'+esc(t("kEvid"))+'</div><div><b>'+pct(c.acts,n)+'</b>'+esc(t("kActs"))+'</div><div><b>'+pct(c.rev,n)+'</b>'+esc(t("kRev"))+'</div><div><b>'+c.opin+'</b>'+esc(t("kOpin"))+'</div><div><b>'+c.opts+'</b>'+esc(t("kOpts"))+'</div><div><b>'+oi.length+'</b>'+esc(t("kOpen"))+'</div><div><b>'+(au.rate===null?"—":au.rate+"%")+'</b>'+esc(t("kAud"))+'</div><div><b>'+as+'%</b>'+esc(t("kAs"))+'</div></div>'+
  '<div class="chart"><p class="meta">'+esc(t("chT"))+(shareLine(DB.records)?' · '+esc(shareLine(DB.records)):'')+'</p>'+srcSVG(DB.records,{lang:L,W:560})+'</div>'+
  '<h2>'+esc(t("rpReg"))+' / The studies</h2>'+(n?DB.records.map(recReport).join(""):'<p class="meta">'+esc(t("rpEmpty"))+'</p>')+
  '<h2>Audit results / نتائج التدقيق</h2>'+(n?'<p>'+esc(t("auPass"))+': '+(au.rate===null?"—":au.rate+"% ("+au.pass+"/"+au.applic+")")+'</p><table><thead><tr><th>ID</th>'+CHECKS.map(function(k){ return '<th>'+esc(t("k_"+k))+'</th>'; }).join("")+'</tr></thead><tbody>'+auRows+'</tbody></table>':'<p class="meta">—</p>')+
  '<h2>Open items / بنود تحتاج متابعة</h2>'+(oi.length?'<ul>'+oi.map(function(x){ return '<li><span dir="ltr">'+esc(x.r.id)+' · '+esc(x.r.ref||"—")+'</span> — '+esc(x.s)+'</li>'; }).join("")+'</ul>':'<p class="meta">'+esc(n?t("noOpen"):"—")+'</p>')+
  '<h2>Self-assessment / التقييم الذاتي</h2><table><thead><tr><th>Area / المحور</th><th>Score / النتيجة</th></tr></thead><tbody>'+grpRows+'<tr><td><b>'+esc(t("kAs"))+'</b></td><td><b>'+as+'%</b></td></tr></tbody></table><p class="meta">'+esc(t("bandNote"))+'</p>'+
  '<footer>Prepared by / أعدّه: مدثر سلامه · SWOT is a technique, not a requirement of any standard: it is useful only when it leads to decisions; strengths and weaknesses are internal and need evidence, opportunities and threats are external and come from PESTLE, Porter\'s forces and market data; a team with outside input; each quadrant ranked; top items become TOWS options, actions with an owner and a date, or risk and opportunity entries; the grid is dated and reviewed when the context changes. Sources / المراجع: ISO 9001:2026 clauses 4.1, 4.2, 6.1.1, 6.1.2, 6.1.3, 6.2 and 9.3.2 and Annex A.4.1, A.4.2 and A.6.1; ISO 9000:2026 3.1.2, 3.1.4, 3.7.2, 4.3.8, 4.4.1 and 4.4.2; ISO 10009:2024 5.1, 5.2 and 5.3 (interpretive summaries, not the official text); the TOWS matrix, strategy textbooks and ISO 31000 not verified (not uploaded) · Examples are illustrative.</footer>';
 return TBX.reportDoc(L,'SWOT Report — مدثر سلامه',body,MAP_CSS+VIEW_CSS+'.ok{color:#2F7D4B;font-weight:700;text-align:center}.bad{color:#B42318;font-weight:700}td.bad{text-align:center}.na{color:#7A869E;text-align:center}ul{padding-inline-start:20px}h3{font-family:Georgia,serif;margin:22px 0 4px;font-size:17px}h4{margin:14px 0 4px;font-size:14.5px}.an{border-top:1px solid #DCE4EE;padding-top:6px;break-inside:auto}.an th{background:#F3F7FB;color:#1B2A4A}.an tbody th{width:30%}.chart{margin:8px 0}.chart svg{max-width:100%;height:auto}.cover{border-bottom:4px solid #B8901E;padding:18px 0 14px;margin-bottom:8px}.cover h1{border:0;margin:6px 0}.cover .kick{color:#B8901E;font-weight:700;letter-spacing:.04em;margin:0}.cover .sub{font-size:18px;margin:4px 0}@media print{.an{page-break-before:always}}');
}
function stamp(){ return today(); }
function renderReport(){
 var prev=document.getElementById("rpPrev"); if(!prev) return;
 if(!DB.records.length){ prev.innerHTML='<p class="pd-sub" style="color:var(--ink-soft)">'+esc(t("rpEmpty"))+'</p>'; return; }
 var c=counts(), au=auditSummary();
 prev.innerHTML='<div class="pd-kpis">'+TBX.kpi(c.n,t("kTotal"))+TBX.kpi(c.top?c.topEv+"/"+c.top:"—",t("kEvid"))+TBX.kpi(pct(c.acts,c.n),t("kActs"))+TBX.kpi(openItems().length,t("kOpen"))+TBX.kpi(au.rate===null?"—":au.rate+"%",t("kAud"))+'</div>';
}
document.getElementById("rpHtml").addEventListener("click",function(){
 var err=document.getElementById("rpErr"); err.textContent="";
 if(!DB.records.length && !Object.keys(DB.assess).length){ err.textContent=t("rpEmpty"); return; }
 TBX.download("SWOT-report-"+stamp()+".html","text/html;charset=utf-8",buildReportHTML());
});
document.getElementById("rpCsv").addEventListener("click",function(){ var err=document.getElementById("rpErr"); err.textContent=""; if(!DB.records.length){ err.textContent=t("rpEmpty"); return; } TBX.download("SWOT-studies-"+stamp()+".csv","text/csv;charset=utf-8",buildCSV()); });
document.getElementById("dCsv").addEventListener("click",function(){ if(!DB.records.length) return; TBX.download("SWOT-studies-"+stamp()+".csv","text/csv;charset=utf-8",buildCSV()); });

/* ---------- platform identity: academy logo and related tools ---------- */
var LOGO="__LOGO__";
function applyLogo(){ document.querySelectorAll("img[data-logo]").forEach(function(i){ if(i.src!==LOGO) i.src=LOGO; i.alt=t("logoAlt"); }); }
var RELATED=[["str","Strategy","./strategy-performance.html#swot","#3563C9","swot"],["iso10009","ISO 10009","./iso10009.html#explain-cl","#7B5BB8","explain-cl"],["lessons","Lessons","./lessons.html","#B8901E"],["fmea","FMEA","./fmea.html","#B42318"],["pareto","Pareto","./pareto.html","#C9821A"],["rca","RCA","./rca.html","#1B2A4A"],["a3","A3","./a3.html","#B8901E"],["dmaic","DMAIC","./dmaic.html","#1B2A4A"],["capa","CAPA","./capa.html","#C2410C"],["pdca","PDCA","./pdca.html","#3C9A5F"]];
function buildRelated(){
 var box=document.getElementById("homeStd"); if(!box) return;
 box.innerHTML='<p class="hs-t">'+esc(t("related"))+'</p>'+RELATED.map(function(r){ return '<a class="hs on" href="'+r[2]+'" target="_blank" rel="noopener"'+(r[4]?' data-rel="'+r[0]+'"':'')+' style="--c:'+r[3]+';--t:'+r[3]+'14"><b dir="ltr">'+r[1]+'</b><span>'+esc(t("rel_"+r[0]))+'</span><em>↗</em></a>'; }).join("");
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
 ar:{fab:"اسأل عن SWOT",title:"مساعد SWOT",sub:"إجابات فورية من دليل الأداة ودراساتك",new:"محادثة جديدة",close:"إغلاق",ph:"اكتب سؤالك…",send:"إرسال",inL:"سؤالك",
  hello:"مرحباً. أجيب عن أسئلة تحليل SWOT من دليل الأداة ومن دراساتك المحفوظة في هذا المتصفح. اختر سؤالاً أو اكتب سؤالك.",
  miss:"لم أجد إجابة جاهزة لهذا السؤال. جرّب أحد الأسئلة المقترحة، أو اسأل عن: ما الذي يجعل SWOT مفيداً، أو الفرق بين SWOT وPESTLE وسجل المخاطر، أو الدليل، أو الفريق، أو خيارات TOWS. وللاستشارة راسل المُعِد على البريد أدناه.",
  instant:"إجابة فورية",foot:"المساعد يعمل في متصفحك ولا يرسل بياناتك. للتواصل:",
  op0:"لا توجد بنود مفتوحة في دراساتك الآن.",st0:"لا توجد دراسات بعد. ابدأ من [[tab:tools]] أو حمّل المثال من [[tab:docs]]."},
 en:{fab:"Ask about SWOT",title:"SWOT assistant",sub:"Instant answers from the tool's guide and your studies",new:"New chat",close:"Close",ph:"Type your question…",send:"Send",inL:"Your question",
  hello:"Hello. I answer questions on SWOT analysis from the tool's guide and from your studies saved in this browser. Pick a question or type your own.",
  miss:"I have no ready answer for that. Try one of the suggested questions, or ask what makes a SWOT useful, SWOT against PESTLE and the risk register, evidence, the team, or TOWS options. For advice, email the author at the address below.",
  instant:"Instant answer",foot:"The assistant runs in your browser and sends no data. Contact:",
  op0:"No open items in your studies right now.",st0:"No studies yet. Start from the [[tab:tools]] or load the example in [[tab:docs]]."}
};
var KB=[
 {id:"useful",k:["مفيد","مفيدا","مفيداً","يفيد","useful","worth","good swot","فائدة","value"],q:{ar:"ما الذي يجعل تحليل SWOT مفيداً؟",en:"What makes a SWOT useful?"},
  a:{ar:"**أن يقود إلى قرار.** المصفوفة التي تُعلّق على الحائط لا تغيّر شيئاً. لذلك تحسب الأداة المرحلة: **حُدد النطاق** (والقرار الذي تخدمه الدراسة)، ثم **اكتمل الفريق** (ثلاثة أدوار ورأي من الخارج)، ثم **أرباع بدليل** (القوة والضعف بدليل داخلي، والفرص والتهديدات من PESTLE وبورتر والسوق، ولا بند في غير ربعه)، ثم **رُتّبت**، ثم **خيارات TOWS** تغطي كل بند أعلى، ثم **إجراءات بمالك وموعد** ومدخل خطر لكل تهديد أعلى، ثم **روجعت** عند تغير السياق. في المثال: دراسة استراتيجية 2027 خرجت بخمسة إجراءات وروجعت بعد صدور كود العزل الحراري.",
   en:"**It leads to a decision.** A grid pinned on the wall changes nothing. So the tool computes the stage: **scoped** (with the decision the study serves), **team complete** (three roles and outside input), **quadrants with evidence** (strengths and weaknesses with internal evidence, opportunities and threats from PESTLE, Porter and the market, no item in the wrong quadrant), **ranked**, **TOWS options** that cover every top item, **actions with an owner and a date** and a risk entry for each top threat, then **reviewed** when the context changes. In the example, the 2027 strategy study led to five actions and was reviewed after the thermal insulation code came out."}},
 {id:"which",k:["pestle","سجل المخاطر","risk register","الفرق","difference","which","versus","vs","أيها","ايها","أيهما","ايهما","بورتر","porter"],q:{ar:"SWOT أم PESTLE أم سجل المخاطر: أيها أستخدم؟",en:"SWOT, PESTLE or risk register — which one?"},
  a:{ar:"ليست بدائل؛ تعمل معاً. **PESTLE** (ISO 10009 البند 5.2) يمسح البيئة الخارجية بستة عوامل، و**قوى بورتر** (5.3) تقرأ القطاع: المشترون والموردون والداخلون الجدد والبدائل والمنافسة. ومنهما تأتي **الفرص والتهديدات**. و**SWOT** (5.1) يضعها أمام **القوة والضعف** الداخليين بدليل، ويرتب، ثم يحوّل الأهم إلى خيارات وإجراءات. و**سجل المخاطر** (7.2) يحمل ما خرج من التهديدات بعد ذلك: الاحتمال والأثر والمالك والإجراء والمتابعة، وهو ما تطلبه ISO 9001:2026 في 6.1.2. فالترتيب العملي: PESTLE وبورتر، ثم SWOT، ثم سجل المخاطر وخطة 6.1.",
   en:"They are not alternatives; they work together. **PESTLE** (ISO 10009 5.2) scans the external environment through six factors, and **Porter's forces** (5.3) read the sector: buyers, suppliers, new entrants, substitutes and rivalry. **Opportunities and threats** come from them. **SWOT** (5.1) sets those against the internal **strengths and weaknesses**, with evidence, ranks them, and turns the most important into options and actions. The **risk register** (7.2) then carries what came out of the threats: likelihood, impact, owner, action and follow-up, which is what ISO 9001:2026 asks in 6.1.2. The working order: PESTLE and Porter, then SWOT, then the risk register and the 6.1 plan."}},
 {id:"req",k:["متطلب","مطلوب","iso 9001","4.1","requirement","required","shall","مواصفة","6.1"],q:{ar:"هل SWOT متطلب في ISO 9001:2026؟",en:"Is SWOT required by ISO 9001:2026?"},
  a:{ar:"لا. SWOT **أسلوب** وليس متطلباً. تطلب ISO 9001:2026 في **4.1** تحديد القضايا الخارجية والداخلية ذات الصلة بالغرض والتوجه الاستراتيجي ومتابعتها، وتحديد ما إذا كان تغير المناخ قضية ذات صلة، وفي **4.2** الأطراف المعنية ومتطلباتها، وفي **6.1.1** مراعاتها عند تحديد المخاطر والفرص، وفي **6.1.2 و6.1.3** التخطيط للتعامل معها، وفي **9.3.2 ب) وج)** مراجعة تغيراتها في مراجعة الإدارة. وSWOT طريقة منظمة لإثبات ذلك، وتذكر ملاحظة البند 4.1 أن القضايا قد تكون عوامل إيجابية أو سلبية.",
   en:"No. SWOT is **a technique**, not a requirement. ISO 9001:2026 asks in **4.1** to determine the external and internal issues relevant to the purpose and strategic direction and to monitor them, including whether climate change is a relevant issue; in **4.2** the interested parties and their requirements; in **6.1.1** to consider them when determining risks and opportunities; in **6.1.2 and 6.1.3** to plan actions on them; and in **9.3.2 b) and c)** to review their changes at management review. A SWOT is a structured way to show it, and NOTE 1 of 4.1 says issues can be positive or negative factors."}},
 {id:"evid",k:["دليل","إثبات","evidence","proof","رأي","opinion","نقص","lack"],q:{ar:"كيف أثبت بند SWOT بدليل؟",en:"How do I back a SWOT item with evidence?"},
  a:{ar:"لكل بند ثلاثة أشياء: **رقم أو واقعة**، و**مصدرها**، و**تاريخها**. القوة والضعف من مؤشرات الأداء ونتائج التدقيق والدروس المستفادة: «اعتماد المخططات يستغرق 21 يوماً في المتوسط مقابل 10 في العقد (مؤشر DWG-01، الربع الثالث 2026)» بدل «بطء الاعتماد». والفرص والتهديدات من PESTLE وقوى بورتر وبيانات السوق. وتنبّه الأداة على البند الذي هو **رأي فقط**، وعلى الضعف المكتوب «نقص في…» بلا دليل، ولا تكتمل مرحلة «أرباع بدليل» حتى يكون لكل بند أعلى دليل.",
   en:"Each item needs three things: **a figure or a fact**, **its source**, and **its date**. Strengths and weaknesses come from KPIs, audit results and lessons learned: \"drawing approval takes 21 days on average against 10 in the contract (KPI DWG-01, Q3 2026)\" rather than \"slow approvals\". Opportunities and threats come from PESTLE, Porter's forces and market data. The tool flags an **opinion-only** item, and a weakness written as \"lack of…\" with no evidence, and the \"quadrants with evidence\" stage is not complete until every top item has evidence."}},
 {id:"tows",k:["tows","خيار","خيارات","option","options","so","wt","قرار","decision"],q:{ar:"كيف أحوّل المصفوفة إلى خيارات وقرارات؟",en:"How do I turn the grid into options and decisions?"},
  a:{ar:"بمصفوفة **TOWS**: لكل خيار بند من ربعين. **SO** قوة تقتنص فرصة، و**ST** قوة تواجه تهديداً، و**WO** فرصة تعالج ضعفاً، و**WT** تقليل ضعف أمام تهديد. ابدأ بالبنود العليا (أعلى ثلاثة في كل ربع): كل بند أعلى يدخل خياراً، أو مدخلاً في سجل المخاطر أو خطة 6.1. ثم لكل خيار **إجراء بمالك وموعد**. في مثال العطاء: «قوة المشتري مرتفعة» (تهديد من بورتر) مع «تكلفة إدارة الموقع أعلى من المنافسين» (ضعف) أنتجت خيار WT: لا نسعّر دون التكلفة، ونحدد سعراً أدنى قبل التقديم.",
   en:"With a **TOWS** matrix: each option takes an item from two quadrants. **SO** uses a strength to seize an opportunity, **ST** a strength to meet a threat, **WO** an opportunity to fix a weakness, and **WT** reduces a weakness in front of a threat. Start with the top items (the top three of each quadrant): each one goes into an option, or into an entry in the risk register or the 6.1 plan. Then each option gets **an action with an owner and a date**. In the bid example, \"high buyer power\" (a threat from Porter) with \"site overheads above competitors\" (a weakness) gave a WT option: do not bid below cost, and set a floor price before submitting."}},
 {id:"team",k:["فريق","من يشارك","team","who","participants","شخص واحد","one person","خارج"],q:{ar:"من يجب أن يشارك في تحليل SWOT؟",en:"Who should take part in a SWOT?"},
  a:{ar:"**فريق، لا شخص واحد.** ثلاثة أدوار على الأقل (مثلاً الإدارة والعمليات والمالية أو الجودة)، و**رأي من خارج الفريق**: عميل أو مورد أو مستشار خارجي أو إدارة أخرى. وتذكر ISO 10009:2024 في نقاط الانتباه للبند 5.1 أن تنوع وجهات النظر شرط، وأن التحليل يجريه فريق القيادة بمدخلات من خارجه. وتنبّه الأداة على تحليل الشخص الواحد، ولا تكتمل مرحلة «اكتمل الفريق» بلا رأي خارجي. ويحتاج التحليل ميسّراً يمنع أن يطغى رأي الأعلى منصباً.",
   en:"**A team, not one person.** At least three roles (for example management, operations and finance or quality), and **input from outside the team**: a customer, a supplier, an external advisor or another department. ISO 10009:2024, in the points to note of 5.1, says diversity of views is a condition and that the leadership team runs the analysis with outside input. The tool flags a one-person SWOT, and the \"team complete\" stage needs outside input. A facilitator keeps the most senior voice from taking over."}},
 {id:"open",dyn:"open",k:["مفتوح","مفتوحة","متابعة","open items","follow"],q:{ar:"ما البنود المفتوحة في دراساتي؟",en:"What is still open in my studies?"}},
 {id:"status",dyn:"status",k:["وضع","حالة","ملخص","status","summary","where do we stand"],q:{ar:"ما وضع دراسات SWOT الآن؟",en:"Where do my studies stand?"}}
];
var CB_SUG=["useful","which","tows","team","status"];
function kbDyn(id){
 var u=CB[L]||CB.ar;
 if(id==="open"){ var O=openItems(); if(!O.length) return u.op0+"\n\n[[tab:dash]]"; return O.map(function(x){ return "- **"+(x.r.ref||x.r.id)+"** — "+x.s; }).join("\n")+"\n\n[[tab:docs]] · [[tab:dash]]"; }
 if(id==="status"){ var c=counts(); if(!c.n) return u.st0; return "- "+t("kTotal")+": **"+c.n+"**\n- "+t("kEvid")+": **"+(c.top?c.topEv+"/"+c.top:"—")+"**\n- "+t("kActs")+": **"+pct(c.acts,c.n)+"**\n- "+t("kRev")+": **"+pct(c.rev,c.n)+"**\n- "+t("kOpen")+": **"+openItems().length+"**\n- "+t("kAs")+": **"+assessScore()+"%**\n\n[[tab:dash]] · [[tab:audit]]"; }
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
function renderAll(){ renderDocs(); renderAudit(); renderDash(); renderReport(); renderAssess(); renderHomeSt(); fillLists(); refreshForm(); }
document.getElementById("rec-form").addEventListener("submit",function(e){ e.preventDefault(); saveRecord(); });
document.getElementById("rec-form").addEventListener("input",function(e){ if(e.target&&e.target.tagName==="TEXTAREA") autoSize(e.target); refreshForm(); });
document.getElementById("rec-form").addEventListener("change",function(){ refreshForm(); });
document.getElementById("newBtn").addEventListener("click",function(){ clearForm(); });
document.getElementById("langBtn").addEventListener("click",function(){ switchLang(); });
window.addEventListener("hashchange",function(){ var h=location.hash.slice(1); if(h!==curTab) go(h); });
window.addEventListener("storage",function(e){ if([STR_KEY,LL_KEY,PARETO_KEY,FM_KEY].indexOf(e.key)>=0){ renderHomeSt(); fillLists(); if(ST) stPreview(true); refreshForm(); } });
var rzT=null, rzW=chartW(); window.addEventListener("resize",function(){ clearTimeout(rzT); rzT=setTimeout(function(){ if(chartW()!==rzW){ rzW=chartW(); renderDash(); refreshForm(); } },150); });

/* ---------- boot ---------- */
/* a link from the hub may ask to open a study (?open=ID); a request may also start one from the Strategy Studio's SWOT (?strat=ID, or
   ?strat=* for the whole grid), TOWS (?tows=ID) or PESTLE (?pestle=ID), a lesson (?lessons=ID), a Pareto category (?pareto=ID&cat=CID) or an
   FMEA study (?fmea=ID, with &row=RID for one row); inside the hub the same request arrives as a one-time hint */
function navRequest(){
 var q={}, K=["open","cat","row"].concat(STSRC);
 try{ var u=new URLSearchParams(location.search); K.forEach(function(k){ if(u.get(k)) q[k]=u.get(k); }); }catch(e){}
 try{ var h=JSON.parse(sessionStorage.getItem(NAV_KEY)||"null"); sessionStorage.removeItem(NAV_KEY); if(h&&typeof h==="object"){ K.forEach(function(k){ if(h[k]) q[k]=String(h[k]); }); } }catch(e){}
 return q;
}
applyLang();
(function(){
 var q=navRequest(), r=q.open?DB.records.filter(function(x){ return x.id===q.open; })[0]:null;
 if(r){ loadRecordIntoForm(r); go("tools"); return; }
 for(var i=0;i<STSRC.length;i++){ var s=STSRC[i]; if(q[s]&&prefillFrom(s,q[s],s==="pareto"?(q.cat||""):(s==="fmea"?(q.row||""):""))) return; }
 go((location.hash||"#home").slice(1));
})();
