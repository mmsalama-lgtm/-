/* ===== CAPA tool — host logic. Records and assessment are stored in this browser only (localStorage, wrapped in try/catch). =====
   Storage key "cia-capa:v1" (this tool only). Schema:
   { records: [ {
       id, title, ref, src: "ncr"|"ia"|"ea"|"cc"|"kpi"|"sup"|"inc", cls: "maj"|"min"|"obs"|"", raised (YYYY-MM-DD), owner, area, pdca (PDCA cycle id),
       desc, evidence,
       react:  {correction, containment, date, consequences},
       cause:  {method: "why5"|"fish"|"other", analysis, root, similar: ""|"none"|"exist"|"could", similarNote},
       actions:[ {t, owner, due, st: "open"|"ip"|"done", o?: "sa" (row imported from Smart Audit)} ],
       impl:   {evidence, date},
       eff:    {criterion, planned, checked, result: ""|"eff"|"ineff", note},
       upd:    {risks, qms},
       close:  {date, just, approver},
       hist:   [ {d, res, crit, note} ]   earlier effectiveness reviews that were not effective (record reopened)
       origin: null | {tool: "audit-center", f, ca, at}   where an imported record came from
       created, updated } ],
     assess: { RE1..LN2: 0|1|2 },
     imp:    { at, n }   last import from the Smart Audit center }
   Other tools' keys are only read, never written: "audit-center:v1" (Smart Audit, import preview) and "cia-pdca:v1" (PDCA cycle names). */
var LKEY="cia-lang", STORE="cia-capa:v1", AUD_KEY="audit-center:v1", PDCA_KEY="cia-pdca:v1";
var L=(function(){ try{ return localStorage.getItem(LKEY)||"ar"; }catch(e){ return "ar"; } })();
var TABS=["home","explain-std","explain-cl","assess","tools","docs","audit","dash","report","ai"];
var TITLES={ar:"CAPA | الإجراءات التصحيحية — مدثر سلامه",en:"CAPA | Corrective action — مدثر سلامه"};
var STAGES=["react","cause","action","verify","closed","reopened"];
var SCOL={react:"#C2410C",cause:"#3563C9",action:"#1B2A4A",verify:"#C9821A",closed:"#3C9A5F",reopened:"#9A3412"};
var SRCS=["ncr","ia","ea","cc","kpi","sup","inc"];
var DB=load();
var curTab="home";
var editing=null;   /* deep copy of the record open in the form: keeps hist, origin and created between saves */
var IMP=null;       /* import preview rows */

var UI={
ar:{brand:"أكاديمية التحسين المستمر · مدثر سلامه",toolName:"أداة CAPA — الإجراءات التصحيحية",sgLearn:"التعلّم",sgWork:"العمل",sgOut:"المخرجات",
 nHome:"الرئيسية",nStd:"دليل المنهجية",nCl:"دليل البنود",nAssess:"التقييم الذاتي",nTools:"سجل CAPA",nDocs:"السجلات",nAudit:"التدقيق",nDash:"لوحة المؤشرات",nReport:"التقرير",nAi:"المساعد الذكي",soon:"قريباً",
 homeCode:"تفاعل · حلّل · نفّذ · تحقّق · أغلق",homeH1:"CAPA — الإجراءات التصحيحية",
 homeLede:"أداة تتابع كل عدم مطابقة من لحظة اكتشافها حتى إغلاقها بدليل: التصحيح والاحتواء، ثم السبب الجذري، ثم الإجراء التصحيحي، ثم التحقق من فعاليته. كل سجل يحمل مرجعه (تقرير عدم مطابقة أو ملاحظة تدقيق أو شكوى) ويمكن ربطه بدورة PDCA.",
 homeNote:"النسخة الحالية تحفظ السجلات في متصفحك فقط. الحفظ على الخادم وتسجيل الدخول يُضافان في مرحلة المنصة المشتركة.",
 prep:"إعداد",authorName:"مدثر سلامه",cycleT:"ما الذي تستطيع فعله هنا",cycleS:"اقرأ الدليل، ثم قيّم طريقة عملكم الحالية، ثم سجّل أول إجراء تصحيحي أو استورده من مركز التدقيق.",
 tStd:"ما الإجراء التصحيحي، ومن يقوم بماذا، ولماذا لا يوجد بند للإجراء الوقائي.",tCl:"البند 10.2 والبنود التي يعمل معها: ملخص تفسيري ومثال وما يطلبه المدقق.",tAssess:"اثنا عشر سؤالاً تقيس طريقة تعاملكم مع عدم المطابقة من التفاعل حتى التعلّم.",
 tTools:"سجل كامل لكل عدم مطابقة: التفاعل، والسبب، والإجراءات، والفعالية، والإغلاق.",tDocs:"كل السجلات بمرحلتها وتنبيهاتها، والاستيراد من مركز التدقيق الذكي.",tAudit:"فحص آلي لكل سجل: المرجع، والاحتواء المؤرخ، والسبب، والفعالية قبل الإغلاق.",
 tDash:"السجلات المفتوحة والمتأخرة والمعاد فتحها، والتقييم الذاتي، في صفحة واحدة.",tReport:"تقرير HTML وCSV بالبنية نفسها لتقارير المنصة.",tAi:"مساعد يقرأ سجلاتك ويقترح الخطوة التالية. لم يُفعَّل بعد.",
 foot:"المراجع: ISO 9001:2026 البنود 6.1 و7.5 و8.7 و9.1.3 و9.2.2 و9.3.2 و10.2، ومصطلحات ISO 9000:2026، وISO 19011:2026 البند 6.7 (ملخصات تفسيرية، وليست النص الرسمي). الأمثلة توضيحية وليست بيانات حقيقية.",
 heroTag:"أداة منهجية · المرجع ISO 9001:2026 البند 10.2",langSw:"English",langSwA:"Switch to English",logoAlt:"أكاديمية التحسين المستمر — مدثر سلامه",
 related:"أدوات مرتبطة في الأكاديمية",rel_aud:"مركز التدقيق والتحسين الذكي",rel_pdca:"دورة التحسين المستمر",rel_q:"دليل ISO 9001:2026",rel_ims:"منشئ النظام المتكامل",
 termT:"لماذا نسميها CAPA، والمواصفة لا تذكر «الإجراء الوقائي»؟",
 termP1:"CAPA اختصار شائع في المنشآت لعبارة «الإجراء التصحيحي والوقائي». لكن ISO 9001:2026 لا تحتوي بنداً للإجراء الوقائي: البند 10.2 يتكلم عن عدم المطابقة والتصحيح والإجراء التصحيحي، أما منع المشكلات قبل وقوعها فيتم بالتخطيط للمخاطر والفرص في البند 6.1.",
 termP2:"نحتفظ باسم CAPA لأنه المتداول، ونستخدم داخل الأداة مصطلحات المواصفة كما هي. وعندما يكشف سجل أن المشكلة قد تحدث في مكان آخر، يُعالج ذلك بالحالات المشابهة (10.2.1 ب) وبتحديث المخاطر (6.1)، لا بسجل «وقائي» منفصل.",
 termIs:"ملخص تفسيري بصياغة مستقلة، وليس النص الرسمي. المصادر: ISO 9001:2026 البنود 6.1 و10.1 و10.2 والمصطلح 3.17، وISO 9000:2026 المصطلحات المذكورة. التحقق: 2026-10-11.",
 defs:[["التصحيح","ISO 9000:2026 · 3.6.3","إزالة عدم المطابقة المكتشفة نفسها، مثل إعادة شحنة أو سحب مخطط ملغى.","#C2410C"],["الإجراء التصحيحي","ISO 9000:2026 · 3.6.4","إزالة سبب عدم المطابقة حتى لا تتكرر.","#1B2A4A"],["الإجراء الوقائي","ISO 9000:2026 · 3.6.2","إزالة سبب عدم مطابقة محتملة حتى لا تحدث أصلاً. ليس له بند متطلبات في ISO 9001:2026.","#1E8C93"],["الفعالية","ISO 9000:2026 · 3.7.17","مدى تنفيذ ما خُطط له وتحقيق النتائج المخططة.","#3C9A5F"]],
 asT:"التقييم الذاتي لطريقة التعامل مع عدم المطابقة",asS:"أجب عن كل سؤال بما يصف عملكم فعلاً. النتيجة تقيس الممارسة الحالية، وليست شهادة ولا حكماً على الأداء.",asReset:"مسح الإجابات",asSaved:"تم حفظ الإجابة",asAnswered:"أُجيب {n} من 12",
 band0:"يحتاج عملاً",band1:"في طور التطوير",band2:"راسخ",bandNote:"حدود داخلية للتقييم الذاتي من تصميم هذه الأداة، وليست معياراً رسمياً.",as0:"غير موجود",as1:"جزئي",as2:"موجود ومطبّق",
 g_RE:"التفاعل",g_CA:"تحليل السبب",g_AC:"الإجراء",g_EF:"الفعالية",g_RD:"السجلات",g_LN:"التعلّم",
 tlT:"سجل CAPA",tlS:"سجل واحد لكل عدم مطابقة. املأ الأقسام بالترتيب؛ تتحدد المرحلة تلقائياً من الحقول المكتملة. لا يُغلق السجل قبل أن تثبت مراجعة الفعالية أن الإجراء فعال.",
 save:"حفظ السجل",newRec:"سجل جديد",savedFail:"تعذّر الحفظ في هذا المتصفح. انسخ التقرير قبل إغلاق الصفحة.",cur:"المرحلة الحالية:",ok_rec:"تم حفظ السجل",
 st_react:"التفاعل",st_cause:"تحليل السبب",st_action:"الإجراء",st_verify:"التحقق من الفعالية",st_closed:"مغلق",st_reopened:"أعيد فتحه",
 sDescT:"الوصف والدليل",sDescS:"ماذا حدث، وأين، وما الدليل.",sReactT:"التفاعل · البند 10.2.1 أ",sReactS:"التصحيح والاحتواء بتاريخهما، والتعامل مع العواقب.",
 sCauseT:"تحليل السبب · البند 10.2.1 ب",sCauseS:"الطريقة والسبب الجذري، وهل توجد حالات مشابهة أو قد تحدث.",sActT:"خطة الإجراء التصحيحي · البند 10.2.1 ج",sActS:"إجراءات تزيل السبب، لكل منها مالك وموعد وحالة.",
 sImplT:"التنفيذ",sImplS:"دليل تنفيذ الإجراءات وتاريخه.",sEffT:"مراجعة الفعالية · البند 10.2.1 د",sEffS:"المعيار والموعد والنتيجة. «غير فعال» يعيد فتح السجل.",
 sUpdT:"التحديثات · البند 10.2.1 (هـ) و(و)",sUpdS:"المخاطر والفرص (6.1)، والتغييرات على نظام الإدارة عند الحاجة.",sCloseT:"الإغلاق",sCloseS:"تاريخ الإغلاق وتبريره واسم المعتمد.",
 f_title:"عنوان مختصر",f_ref:"رقم المرجع (NCR أو ملاحظة التدقيق)",f_src:"المصدر",f_cls:"التصنيف",f_raised:"تاريخ الاكتشاف",f_owner:"مالك السجل",f_area:"العملية أو الموقع",f_pdca:"دورة PDCA المرتبطة",
 f_desc:"وصف عدم المطابقة",f_evidence:"الدليل",f_correction:"التصحيح",f_containment:"الاحتواء",f_reactDate:"تاريخ التصحيح أو الاحتواء",f_consequences:"التعامل مع العواقب",
 f_method:"طريقة التحليل",f_analysis:"التحليل (صيغة مختصرة)",f_root:"السبب الجذري",f_similar:"حالات مشابهة",f_similarNote:"أين؟ وماذا فُعل؟",
 f_implEvidence:"دليل التنفيذ",f_implDate:"تاريخ التنفيذ",f_criterion:"معيار الفعالية (ما الذي يثبت أن السبب زال؟)",f_planned:"الموعد المخطط للمراجعة",f_checked:"تاريخ المراجعة الفعلي",f_result:"النتيجة",f_effNote:"ملاحظة المراجعة ومصدر البيانات",
 f_risks:"تحديث المخاطر والفرص (6.1)",f_qms:"تغييرات نظام الإدارة",f_closeDate:"تاريخ الإغلاق",f_just:"تبرير الإغلاق",f_approver:"المعتمد",
 src_ncr:"تقرير عدم مطابقة (NCR)",src_ia:"ملاحظة تدقيق داخلي",src_ea:"تدقيق خارجي",src_cc:"شكوى عميل",src_kpi:"مؤشر عملية",src_sup:"مورد",src_inc:"حادث",
 cls_maj:"رئيسية",cls_min:"ثانوية",cls_obs:"ملاحظة",cls_:"غير مصنفة",
 m_why5:"5 Whys — لماذا الخمس",m_fish:"Fishbone — عظمة السمكة",m_other:"طريقة أخرى",
 sim_:"—",sim_none:"لا توجد",sim_exist:"توجد حالات مشابهة",sim_could:"قد تحدث في مكان آخر",
 a_open:"مفتوح",a_ip:"قيد التنفيذ",a_done:"منفّذ",r_:"لم تُراجع بعد",r_eff:"فعال",r_ineff:"غير فعال — يُعاد فتح السجل",
 aT:"الإجراء",aOwner:"المالك",aDue:"الموعد",aSt:"الحالة",aAdd:"إضافة إجراء",aDel:"حذف الإجراء",aNone:"لا توجد إجراءات بعد. أضف إجراءً لكل سبب.",
 tplBtn:"أدرج قالب الطريقة",tpl_why5:"لماذا 1: \nلماذا 2: \nلماذا 3: \nلماذا 4: \nلماذا 5: ",tpl_fish:"الأفراد: \nالطريقة: \nالمواد: \nالمعدات: \nالقياس: \nالبيئة: ",tpl_other:"الطريقة المستخدمة: \nالنتيجة: ",
 pdOpen:"افتح PDCA",pdFound:"دورة PDCA: {t}",pdMiss:"لم يُعثر على هذه الدورة في أداة PDCA على هذا المتصفح.",pdHint:"اكتب رقم الدورة، مثل PD-EX-03، أو اختره من القائمة.",
 reopenT:"المراجعة أثبتت أن الإجراء غير فعال، فأُعيد فتح السجل. ارجع إلى تحليل السبب وأضف إجراءات جديدة، ثم ابدأ جولة مراجعة جديدة.",newRound:"ابدأ جولة مراجعة جديدة",roundMsg:"نُقلت المراجعة السابقة إلى تاريخ السجل. احفظ السجل لتثبيت الجولة الجديدة.",histT:"مراجعات سابقة غير فعالة",
 e_title:"أدخل عنواناً مختصراً للسجل.",e_ref:"أدخل رقم المرجع (NCR أو ملاحظة التدقيق أو الشكوى).",e_desc:"صِف عدم المطابقة قبل الحفظ.",e_result:"سجّل معيار الفعالية وتاريخ المراجعة الفعلي قبل إدخال النتيجة.",
 e_closeEff:"لا يُغلق السجل قبل أن تثبت مراجعة الفعالية أن الإجراء فعال.",e_closeJ:"الإغلاق يحتاج تبريراً واسم المعتمد.",e_closeDate:"تاريخ الإغلاق لا يسبق تاريخ مراجعة الفعالية.",e_dates:"تاريخ التصحيح لا يسبق تاريخ الاكتشاف.",
 exT:"بيانات المثال",exS:"أربعة سجلات توضيحية لشركة سعودية افتراضية (شركة الواحة للمقاولات): سجل مغلق وفعال، وسجل ينتظر مراجعة الفعالية، وسجل متأخر، وسجل أعيد فتحه لأن الإجراء لم يكن فعالاً، ولكل منها مرجعه، مع إجابات للتقييم الذاتي. البيانات توضيحية وليست حقيقية، وتحميلها يستبدل كل بيانات هذه الأداة في متصفحك.",
 exLoad:"تحميل المثال",exClear:"مسح كل البيانات",exLoaded:"تم تحميل المثال: 4 سجلات وإجابات التقييم الذاتي.",exCleared:"تم مسح كل بيانات الأداة من هذا المتصفح.",
 exConfirmClear:"سيحذف هذا كل سجلات CAPA وإجابات التقييم الذاتي من هذا المتصفح، ولا يمكن التراجع عن ذلك.\n\nهل تريد المتابعة؟",
 impT:"الاستيراد من مركز التدقيق والتحسين الذكي (قراءة فقط)",impS:"تقرأ الأداة الملاحظات والإجراءات التصحيحية المحفوظة في مركز التدقيق على هذا المتصفح، وتعرضها للمعاينة قبل أي تطبيق. لا يُكتب أي شيء في بيانات المركز.",
 impPrev:"معاينة الاستيراد",impAllT:"الكل: بياناتهم",impAllK:"الكل: بياناتي",impApply:"طبّق الاستيراد",impNone:"لا توجد بيانات محفوظة لمركز التدقيق الذكي في هذا المتصفح. افتح المركز وسجّل الملاحظات أو حمّل مثاله أولاً.",
 impEmpty:"لا توجد في المركز ملاحظات عدم مطابقة أو إجراءات تصحيحية للاستيراد.",impDone:"تم استيراد {n} سجل إلى CAPA. لم يُكتب أي شيء في مركز التدقيق.",impNoSel:"لم يُختر أي صف للاستيراد.",
 impTake:"خذ بياناتهم",impKeep:"أبقِ بياناتي",impNew:"جديد",impUpd:"تحديث",impSame:"بلا تغيير",impColSrc:"في المركز",impColF:"الملاحظة",impColSt:"الحالة في المركز",impColState:"في CAPA",impColCh:"الاختيار",
 impHome:"في مركز التدقيق الذكي {n} بنداً يمكن استيراده إلى سجلات CAPA بعد المعاينة.",impGo:"معاينة الاستيراد",impFrom:"مستورد من مركز التدقيق",impLast:"آخر استيراد: {d}",
 sa_open:"مفتوح",sa_ip:"قيد التنفيذ",sa_ver:"بانتظار التحقق",sa_closed:"مغلق",sa_eff:"فعال",sa_ineff:"غير فعال",sa_pend:"لم يُتحقق",sa_none:"لا يوجد إجراء بعد",
 rc_ppl:"فئة السبب في المركز: سلوك أو معرفة الأفراد",rc_des:"فئة السبب في المركز: تصميم الضابط",rc_op:"فئة السبب في المركز: تشغيل الضابط",rc_tp:"فئة السبب في المركز: طرف ثالث",rc_sys:"فئة السبب في المركز: نظام أو تقنية",rc_gov:"فئة السبب في المركز: الإشراف والحوكمة",
 dT:"سجلات CAPA",dS:"كل سجل بمرحلته وتنبيهاته. افتح السجل لتعديله في «سجل CAPA».",csv:"تصدير CSV",none:"لا توجد سجلات بعد. ابدأ من «سجل CAPA» أو من الاستيراد.",
 colRef:"المرجع والعنوان",colSrc:"المصدر",colStage:"المرحلة",colOwner:"المالك",colNext:"الموعد القادم",colFlags:"تنبيهات",colAct:"إجراءات",open:"فتح",del:"حذف",delArm:"تأكيد الحذف",
 fl_actOver:"إجراء متأخر",fl_effOver:"مراجعة فعالية متأخرة",fl_reopen:"أعيد فتحه",fl_reopenN:"أعيد فتحه ×{n}",fl_wait:"ينتظر مراجعة الفعالية",fl_imp:"مستورد",
 auT:"التدقيق الآلي للسجلات",auS:"هذه الفحوص تُطبَّق على كل سجل وتُظهر الثغرات التي يلاحظها المدقق عادةً. الخانة «—» تعني أن الفحص لا ينطبق بعد على مرحلة السجل.",
 auRec:"سجلات مُدقّقة",auPass:"فحوص ناجحة",auFail:"سجلات بها ثغرات",auOver:"سجلات متأخرة",auEmpty:"لا توجد سجلات لتدقيقها.",
 c_ref:"له مرجع",c_cont:"احتواء مؤرخ",c_root:"سبب جذري",c_act:"إجراء بمالك وموعد",c_impl:"دليل التنفيذ",c_effc:"معيار الفعالية ونتيجتها",c_just:"إغلاق مبرَّر",c_effb:"الفعالية قبل الإغلاق",c_time:"غير متأخر",
 dashT:"لوحة المؤشرات",dashS:"أرقام تُحسب من السجلات والتقييم في هذا المتصفح.",kTotal:"إجمالي السجلات",kOpen:"مفتوحة",kClosed:"مغلقة",kEff:"مغلقة وفعالة",kActOver:"بإجراءات متأخرة",kEffOver:"مراجعات فعالية متأخرة",kReopen:"أعيد فتحها",kAud:"نجاح التدقيق",kAs:"التقييم الذاتي",
 byStage:"توزيع المراحل",byLink:"حسب المصدر",byAssess:"التقييم الذاتي حسب المجموعة",openT:"بنود تحتاج متابعة",noData:"لا توجد بيانات بعد.",noOpen:"لا توجد بنود متأخرة أو معاد فتحها.",
 oi_act:"إجراء متأخر: {a} — {o} — {d}",oi_eff:"مراجعة فعالية متأخرة منذ {d}",oi_re:"أعيد فتحه: الإجراء لم يكن فعالاً",oi_wait:"مراجعة الفعالية في {d}",
 rpT:"تقرير CAPA",rpS:"تقرير HTML يُنزَّل إلى جهازك، ويُطبع أو يُحفظ PDF من المتصفح. وCSV لتحليل السجلات في جدول.",rpHtml:"تنزيل تقرير HTML",rpNote:"التقرير يحمل اسم المُعِد «مدثر سلامه» ويتضمن الملخص والسجلات ونتائج التدقيق والبنود المفتوحة والتقييم الذاتي.",rpPrev:"معاينة سريعة",rpEmpty:"لا توجد سجلات بعد لتصديرها.",
 aiT:"المساعد الذكي — قيد البناء",aiS:"سيقرأ هذا المساعد سجلات CAPA والتقييم، ويقترح الخطوة التالية لكل سجل. لن يعمل قبل تهيئة محرك المنصة المشتركة، ولن يُظهر نتائج مزيّفة.",
 aiList:["ترتيب السجلات المفتوحة حسب الخطر والموعد","اقتراح سؤال «لماذا» التالي عندما يكون التحليل ناقصاً","اقتراح معيار فعالية قابل للقياس لكل إجراء"],
 rFormHdr:"سجل CAPA"},
en:{brand:"Continual Improvement Academy · مدثر سلامه",toolName:"CAPA tool — Corrective action",sgLearn:"Learn",sgWork:"Work",sgOut:"Output",
 nHome:"Home",nStd:"Method guide",nCl:"Clause guide",nAssess:"Self-assessment",nTools:"CAPA record",nDocs:"Records",nAudit:"Audit",nDash:"Dashboard",nReport:"Report",nAi:"AI Assistant",soon:"Soon",
 homeCode:"React · Analyse · Act · Verify · Close",homeH1:"CAPA — Corrective action",
 homeLede:"A tool that follows every nonconformity from the moment it is found until it is closed with evidence: correction and containment, then the root cause, then corrective action, then a check that it worked. Each record carries its reference (NCR, audit finding or complaint) and can be linked to a PDCA cycle.",
 homeNote:"This version keeps records in your browser only. Server storage and sign-in come with the shared platform phase.",
 prep:"Prepared by",authorName:"مدثر سلامه",cycleT:"What you can do here",cycleS:"Read the guide, assess how you work today, then record your first corrective action or import it from the audit center.",
 tStd:"What corrective action is, who does what, and why there is no preventive action clause.",tCl:"Clause 10.2 and the clauses it works with: interpretive summary, example and what the auditor asks for.",tAssess:"Twelve questions on how you handle nonconformities, from reaction to learning.",
 tTools:"One full record per nonconformity: reaction, cause, actions, effectiveness and closure.",tDocs:"Every record with its stage and flags, and the import from the Smart Audit center.",tAudit:"Automatic check of each record: reference, dated containment, cause, and effectiveness before closure.",
 tDash:"Open, overdue and reopened records and the self-assessment on one page.",tReport:"HTML and CSV report in the same structure as the platform reports.",tAi:"An assistant that reads your records and suggests the next step. Not active yet.",
 foot:"References: ISO 9001:2026 clauses 6.1, 7.5, 8.7, 9.1.3, 9.2.2, 9.3.2 and 10.2, ISO 9000:2026 terms, and ISO 19011:2026 clause 6.7 (interpretive summaries, not the official text). Examples are illustrative, not real data.",
 heroTag:"Method tool · Reference: ISO 9001:2026 clause 10.2",langSw:"العربية",langSwA:"التبديل إلى العربية",logoAlt:"Continual Improvement Academy — مدثر سلامه",
 related:"Related Academy tools",rel_aud:"Smart audit & improvement center",rel_pdca:"Continual improvement cycle",rel_q:"ISO 9001:2026 guide",rel_ims:"IMS Builder",
 termT:"Why “CAPA”, when the standard has no “preventive action”?",
 termP1:"CAPA is the common industry short form of “corrective and preventive action”. But ISO 9001:2026 has no preventive action clause: clause 10.2 covers nonconformity, correction and corrective action, while preventing problems before they happen is done by planning for risks and opportunities in clause 6.1.",
 termP2:"We keep the name CAPA because people use it, and inside the tool we use the standard's own terms. When a record shows a problem could happen elsewhere, that is handled through similar cases (10.2.1 b) and a risk update (6.1), not through a separate “preventive” record.",
 termIs:"Interpretive summary in independent wording, not the official text. Sources: ISO 9001:2026 clauses 6.1, 10.1 and 10.2 and term 3.17, and the ISO 9000:2026 terms named here. Verified: 2026-10-11.",
 defs:[["Correction","ISO 9000:2026 · 3.6.3","Removing the detected nonconformity itself, such as returning a load or withdrawing a superseded drawing.","#C2410C"],["Corrective action","ISO 9000:2026 · 3.6.4","Removing the cause of the nonconformity so it does not recur.","#1B2A4A"],["Preventive action","ISO 9000:2026 · 3.6.2","Removing the cause of a potential nonconformity so it never happens. It has no requirement clause in ISO 9001:2026.","#1E8C93"],["Effectiveness","ISO 9000:2026 · 3.7.17","How far planned activities are carried out and planned results achieved.","#3C9A5F"]],
 asT:"Self-assessment of how you handle nonconformities",asS:"Answer each question with what your work actually does. The score measures current practice; it is not a certificate or a performance rating.",asReset:"Clear answers",asSaved:"Answer saved",asAnswered:"{n} of 12 answered",
 band0:"Needs work",band1:"Developing",band2:"Established",bandNote:"Internal bands for this self-assessment, designed in this tool; not an official scale.",as0:"Not in place",as1:"Partly",as2:"In place and applied",
 g_RE:"Reaction",g_CA:"Cause analysis",g_AC:"Action",g_EF:"Effectiveness",g_RD:"Records",g_LN:"Learning",
 tlT:"CAPA record",tlS:"One record per nonconformity. Fill the sections in order; the stage is set automatically from the completed fields. A record cannot be closed before the effectiveness review shows the action worked.",
 save:"Save record",newRec:"New record",savedFail:"Could not save in this browser. Copy the report before closing the page.",cur:"Current stage:",ok_rec:"Record saved",
 st_react:"Reaction",st_cause:"Cause analysis",st_action:"Action",st_verify:"Effectiveness check",st_closed:"Closed",st_reopened:"Reopened",
 sDescT:"Description and evidence",sDescS:"What happened, where, and the evidence.",sReactT:"Reaction · clause 10.2.1 a",sReactS:"Correction and containment with their date, and dealing with consequences.",
 sCauseT:"Cause analysis · clause 10.2.1 b",sCauseS:"The method and the root cause, and whether similar cases exist or could occur.",sActT:"Corrective action plan · clause 10.2.1 c",sActS:"Actions that remove the cause, each with an owner, a due date and a status.",
 sImplT:"Implementation",sImplS:"Evidence that the actions were carried out, and when.",sEffT:"Effectiveness review · clause 10.2.1 d",sEffS:"Criterion, date and result. “Not effective” reopens the record.",
 sUpdT:"Updates · clause 10.2.1 e) and f)",sUpdS:"Risks and opportunities (6.1), and changes to the management system where needed.",sCloseT:"Closure",sCloseS:"Closure date, justification and approver.",
 f_title:"Short title",f_ref:"Reference number (NCR or audit finding)",f_src:"Source",f_cls:"Grade",f_raised:"Date found",f_owner:"Record owner",f_area:"Process or site",f_pdca:"Linked PDCA cycle",
 f_desc:"Description of the nonconformity",f_evidence:"Evidence",f_correction:"Correction",f_containment:"Containment",f_reactDate:"Date of correction or containment",f_consequences:"Dealing with consequences",
 f_method:"Analysis method",f_analysis:"Analysis (short form)",f_root:"Root cause",f_similar:"Similar cases",f_similarNote:"Where, and what was done?",
 f_implEvidence:"Implementation evidence",f_implDate:"Implementation date",f_criterion:"Effectiveness criterion (what proves the cause is gone?)",f_planned:"Planned review date",f_checked:"Actual review date",f_result:"Result",f_effNote:"Review note and data source",
 f_risks:"Risks and opportunities update (6.1)",f_qms:"Management system changes",f_closeDate:"Closure date",f_just:"Closure justification",f_approver:"Approver",
 src_ncr:"Nonconformity report (NCR)",src_ia:"Internal audit finding",src_ea:"External audit",src_cc:"Customer complaint",src_kpi:"Process KPI",src_sup:"Supplier",src_inc:"Incident",
 cls_maj:"Major",cls_min:"Minor",cls_obs:"Observation",cls_:"Not graded",
 m_why5:"5 Whys",m_fish:"Fishbone (Ishikawa)",m_other:"Other method",
 sim_:"—",sim_none:"None",sim_exist:"Similar cases exist",sim_could:"Could occur elsewhere",
 a_open:"Open",a_ip:"In progress",a_done:"Done",r_:"Not reviewed yet",r_eff:"Effective",r_ineff:"Not effective — the record is reopened",
 aT:"Action",aOwner:"Owner",aDue:"Due",aSt:"Status",aAdd:"Add action",aDel:"Remove action",aNone:"No actions yet. Add one action per cause.",
 tplBtn:"Insert the method template",tpl_why5:"Why 1: \nWhy 2: \nWhy 3: \nWhy 4: \nWhy 5: ",tpl_fish:"People: \nMethod: \nMaterials: \nEquipment: \nMeasurement: \nEnvironment: ",tpl_other:"Method used: \nResult: ",
 pdOpen:"Open PDCA",pdFound:"PDCA cycle: {t}",pdMiss:"This cycle was not found in the PDCA tool in this browser.",pdHint:"Type the cycle number, such as PD-EX-03, or pick it from the list.",
 reopenT:"The review showed the action was not effective, so the record was reopened. Go back to the cause analysis, add new actions, then start a new review round.",newRound:"Start a new review round",roundMsg:"The earlier review moved to the record's history. Save the record to keep the new round.",histT:"Earlier reviews that were not effective",
 e_title:"Enter a short title for the record.",e_ref:"Enter the reference number (NCR, audit finding or complaint).",e_desc:"Describe the nonconformity before saving.",e_result:"Record the effectiveness criterion and the actual review date before entering a result.",
 e_closeEff:"A record cannot be closed before the effectiveness review shows the action worked.",e_closeJ:"Closure needs a justification and the approver's name.",e_closeDate:"The closure date cannot be before the effectiveness review date.",e_dates:"The correction date cannot be before the date found.",
 exT:"Example data",exS:"Four illustrative records for a fictitious Saudi company (Al-Waha Contracting): one closed and effective, one waiting for its effectiveness review, one overdue, and one reopened because the action was not effective, each with its reference, plus self-assessment answers. The data is illustrative, not real, and loading it replaces all of this tool's data in your browser.",
 exLoad:"Load example",exClear:"Clear all data",exLoaded:"Example loaded: 4 records and the self-assessment answers.",exCleared:"All of this tool's data was removed from this browser.",
 exConfirmClear:"This deletes every CAPA record and the self-assessment answers from this browser, and it cannot be undone.\n\nDo you want to continue?",
 impT:"Import from the Smart Audit & Improvement center (read-only)",impS:"The tool reads the findings and corrective actions saved by the audit center in this browser and shows them for review before anything is applied. Nothing is written to the center's data.",
 impPrev:"Preview import",impAllT:"All: theirs",impAllK:"All: mine",impApply:"Apply import",impNone:"No Smart Audit center data is saved in this browser. Open the center and record findings, or load its example, first.",
 impEmpty:"The center has no nonconformity findings or corrective actions to import.",impDone:"{n} record(s) imported into CAPA. Nothing was written to the audit center.",impNoSel:"No row is selected for import.",
 impTake:"Take theirs",impKeep:"Keep mine",impNew:"New",impUpd:"Update",impSame:"No change",impColSrc:"In the center",impColF:"Finding",impColSt:"Status in the center",impColState:"In CAPA",impColCh:"Choice",
 impHome:"The Smart Audit center has {n} item(s) you can import into CAPA records after a preview.",impGo:"Preview import",impFrom:"Imported from the audit center",impLast:"Last import: {d}",
 sa_open:"Open",sa_ip:"In progress",sa_ver:"Awaiting verification",sa_closed:"Closed",sa_eff:"Effective",sa_ineff:"Not effective",sa_pend:"Not yet checked",sa_none:"No action yet",
 rc_ppl:"Cause category in the center: people's behaviour or knowledge",rc_des:"Cause category in the center: control design",rc_op:"Cause category in the center: control operation",rc_tp:"Cause category in the center: third party",rc_sys:"Cause category in the center: system or technology",rc_gov:"Cause category in the center: oversight and governance",
 dT:"CAPA records",dS:"Every record with its stage and flags. Open a record to edit it in the CAPA record tab.",csv:"Export CSV",none:"No records yet. Start from the CAPA record tab or from the import.",
 colRef:"Reference and title",colSrc:"Source",colStage:"Stage",colOwner:"Owner",colNext:"Next date",colFlags:"Flags",colAct:"Actions",open:"Open",del:"Delete",delArm:"Confirm delete",
 fl_actOver:"Overdue action",fl_effOver:"Overdue effectiveness review",fl_reopen:"Reopened",fl_reopenN:"Reopened ×{n}",fl_wait:"Waiting for effectiveness review",fl_imp:"Imported",
 auT:"Automatic audit of records",auS:"These checks run on every record and show the gaps an auditor usually finds. “—” means the check does not apply yet at the record's stage.",
 auRec:"Records audited",auPass:"Checks passed",auFail:"Records with gaps",auOver:"Overdue records",auEmpty:"No records to audit yet.",
 c_ref:"Has reference",c_cont:"Dated containment",c_root:"Root cause",c_act:"Action with owner and date",c_impl:"Implementation evidence",c_effc:"Effectiveness criterion and result",c_just:"Justified closure",c_effb:"Effectiveness before closure",c_time:"Not overdue",
 dashT:"Dashboard",dashS:"Figures calculated from the records and the self-assessment in this browser.",kTotal:"Total records",kOpen:"Open",kClosed:"Closed",kEff:"Closed and effective",kActOver:"With overdue actions",kEffOver:"Overdue effectiveness reviews",kReopen:"Reopened",kAud:"Audit pass rate",kAs:"Self-assessment",
 byStage:"Stage distribution",byLink:"By source",byAssess:"Self-assessment by group",openT:"Items that need follow-up",noData:"No data yet.",noOpen:"No overdue or reopened items.",
 oi_act:"Overdue action: {a} — {o} — {d}",oi_eff:"Effectiveness review overdue since {d}",oi_re:"Reopened: the action was not effective",oi_wait:"Effectiveness review on {d}",
 rpT:"CAPA report",rpS:"HTML report downloaded to your device, which you can print or save as PDF from the browser. CSV for analysing records in a spreadsheet.",rpHtml:"Download HTML report",rpNote:"The report carries the preparer's name “مدثر سلامه” and includes the summary, records, audit results, open items and the self-assessment.",rpPrev:"Quick preview",rpEmpty:"No records to export yet.",
 aiT:"AI Assistant — under construction",aiS:"This assistant will read your CAPA records and assessment and suggest the next step for each record. It will not run before the shared platform engine is in place, and it will not show invented results.",
 aiList:["Sort open records by risk and due date","Suggest the next “why” when the analysis is incomplete","Suggest a measurable effectiveness criterion for each action"],
 rFormHdr:"CAPA record"}
};

function t(k,v){ var d=UI[L]||UI.ar; var s=(d[k]!==undefined)?d[k]:(UI.ar[k]!==undefined?UI.ar[k]:k); if(v){ for(var x in v){ s=String(s).split("{"+x+"}").join(v[x]); } } return s; }
function esc(s){ return TBX.esc(s); }
function today(){ return TBX.today(); }
function txt(v){ return TBX.txt(v); }
function obj(v){ return (v&&typeof v==="object"&&!Array.isArray(v))?v:{}; }
function str(v){ return (v==null||typeof v==="object")?"":String(v); }
/* a value saved by another tool may be {ar,en}: show it in the current language, never as an object */
function tv(v){ if(v==null) return ""; if(typeof v==="object"&&!Array.isArray(v)){ var a=v[L], b=v[L==="ar"?"en":"ar"]; return String(a!=null&&a!==""?a:(b!=null?b:"")); } if(Array.isArray(v)) return v.map(tv).join(", "); return String(v); }
function isD(s){ return /^\d{4}-\d{2}-\d{2}$/.test(String(s||"")); }

/* ---------- store ---------- */
function blank(){ return {id:"",title:"",ref:"",src:"ncr",cls:"",raised:"",owner:"",area:"",pdca:"",desc:"",evidence:"",
 react:{correction:"",containment:"",date:"",consequences:""},cause:{method:"why5",analysis:"",root:"",similar:"",similarNote:""},actions:[],
 impl:{evidence:"",date:""},eff:{criterion:"",planned:"",checked:"",result:"",note:""},upd:{risks:"",qms:""},close:{date:"",just:"",approver:""},
 hist:[],origin:null,created:"",updated:""}; }
/* a record saved with missing or broken parts gets empty ones, so rendering never throws */
function fixRec(r){
 var b=blank();
 ["id","title","ref","src","cls","raised","owner","area","pdca","desc","evidence","created","updated"].forEach(function(k){ r[k]=str(r[k]); });
 if(SRCS.indexOf(r.src)<0) r.src="ncr";
 if(["maj","min","obs",""].indexOf(r.cls)<0) r.cls="";
 ["react","cause","impl","eff","upd","close"].forEach(function(k){ var o=obj(r[k]); Object.keys(b[k]).forEach(function(f){ o[f]=str(o[f]); }); r[k]=o; });
 if(["why5","fish","other"].indexOf(r.cause.method)<0) r.cause.method="why5";
 if(["eff","ineff",""].indexOf(r.eff.result)<0) r.eff.result="";
 r.actions=(Array.isArray(r.actions)?r.actions:[]).filter(function(a){ return a&&typeof a==="object"; }).map(function(a){ var o={t:str(a.t),owner:str(a.owner),due:str(a.due),st:["open","ip","done"].indexOf(a.st)>=0?a.st:"open"}; if(a.o==="sa") o.o="sa"; return o; });
 r.hist=(Array.isArray(r.hist)?r.hist:[]).filter(function(h){ return h&&typeof h==="object"; }).map(function(h){ return {d:str(h.d),res:str(h.res),crit:str(h.crit),note:str(h.note)}; });
 r.origin=(r.origin&&typeof r.origin==="object")?{tool:str(r.origin.tool),f:str(r.origin.f),ca:str(r.origin.ca),at:str(r.origin.at)}:null;
 return r;
}
function load(){ return TBX.load(STORE,function(v){ if(!Array.isArray(v.records)) v.records=[]; v.records=v.records.filter(function(r){ return r&&typeof r==="object"; }); v.records.forEach(fixRec); if(!v.assess||typeof v.assess!=="object") v.assess={}; if(v.imp&&typeof v.imp!=="object") delete v.imp; return v; },function(){ return {records:[],assess:{}}; }); }
function persist(){ return TBX.save(STORE,DB); }

/* ---------- stage, flags, dates ---------- */
function actsDone(r){ return r.actions.length>0 && r.actions.every(function(a){ return a.st==="done"; }); }
function stageOf(r){
 if(r.eff.result==="ineff") return "reopened";
 if(r.close.date) return "closed";
 if(r.eff.result==="eff" || txt(r.impl.evidence) || actsDone(r)) return "verify";
 if(txt(r.cause.root)) return "action";
 if(txt(r.react.correction)||txt(r.react.containment)) return "cause";
 return "react";
}
function stageName(s){ return t("st_"+s); }
function lateActs(r){ if(stageOf(r)==="closed") return []; var d=today(); return r.actions.filter(function(a){ return a.st!=="done" && isD(a.due) && a.due<d; }); }
function actOver(r){ return lateActs(r).length>0; }
function effOver(r){ var s=stageOf(r); return s!=="closed" && s!=="reopened" && isD(r.eff.planned) && r.eff.planned<today() && !r.eff.result; }
function isOverdue(r){ return actOver(r)||effOver(r); }
function nextDate(r){
 var s=stageOf(r); if(s==="closed") return "";
 var ds=r.actions.filter(function(a){ return a.st!=="done" && isD(a.due); }).map(function(a){ return a.due; }).sort();
 if(ds.length) return ds[0];
 return (isD(r.eff.planned)&&!r.eff.result)?r.eff.planned:"";
}
function flagsOf(r){
 var F=[], s=stageOf(r);
 if(actOver(r)) F.push([t("fl_actOver"),"bad"]);
 if(effOver(r)) F.push([t("fl_effOver"),"bad"]);
 if(s==="reopened") F.push([t("fl_reopen"),"bad"]);
 else if(r.hist.length && s!=="closed") F.push([t("fl_reopenN",{n:r.hist.length}),"warn"]);
 if(s==="verify" && !effOver(r) && !r.eff.result) F.push([t("fl_wait"),"info"]);
 if(r.origin) F.push([t("fl_imp"),"info"]);
 return F;
}
function chip(x){ return '<span class="ca-chip '+x[1]+'">'+esc(x[0])+'</span>'; }
function srcName(k){ return t("src_"+k); }
function clsName(k){ return t("cls_"+(k||"")); }

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
 if(IMP) impPreview(true);
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
/* PDCA cycles saved in this browser (read only) */
function pdcaCycles(){
 var S=TBX.read(PDCA_KEY), R=S&&Array.isArray(S.records)?S.records:[];
 return R.filter(function(r){ return r&&typeof r==="object"&&r.id; }).map(function(r){ return {id:str(r.id),title:str(r.title)}; });
}

/* ---------- record form ---------- */
var HDR=[["title","tx",1],["ref","ltr",0],["src","sel_src",0],["cls","sel_cls",0],["raised","date",0],["owner","tx",0],["area","tx",0],["pdca","pdca",0]];
var SECS=[
 {k:"desc",col:"#7A869E",f:[["desc","ta",1],["evidence","ta",1]]},
 {k:"react",col:"#C2410C",f:[["correction","ta",0],["containment","ta",0],["reactDate","date",0],["consequences","ta",1]]},
 {k:"cause",col:"#3563C9",f:[["method","sel_method",0],["similar","sel_similar",0],["analysis","ta_tpl",1],["root","ta",1],["similarNote","tx",1]]},
 {k:"action",col:"#1B2A4A",acts:true,f:[]},
 {k:"impl",col:"#1E8C93",f:[["implEvidence","ta",1],["implDate","date",0]]},
 {k:"eff",col:"#C9821A",reopen:true,f:[["criterion","ta",1],["planned","date",0],["checked","date",0],["result","sel_result",0],["effNote","ta",1]]},
 {k:"upd",col:"#7B5BB8",f:[["risks","ta",0],["qms","ta",0]]},
 {k:"close",col:"#3C9A5F",f:[["closeDate","date",0],["approver","tx",0],["just","ta",1]]}
];
var STT={desc:["sDescT","sDescS"],react:["sReactT","sReactS"],cause:["sCauseT","sCauseS"],action:["sActT","sActS"],impl:["sImplT","sImplS"],eff:["sEffT","sEffS"],upd:["sUpdT","sUpdS"],close:["sCloseT","sCloseS"]};
var PATH={title:"title",ref:"ref",src:"src",cls:"cls",raised:"raised",owner:"owner",area:"area",pdca:"pdca",desc:"desc",evidence:"evidence",
 correction:"react.correction",containment:"react.containment",reactDate:"react.date",consequences:"react.consequences",
 method:"cause.method",analysis:"cause.analysis",root:"cause.root",similar:"cause.similar",similarNote:"cause.similarNote",
 implEvidence:"impl.evidence",implDate:"impl.date",criterion:"eff.criterion",planned:"eff.planned",checked:"eff.checked",result:"eff.result",effNote:"eff.note",
 risks:"upd.risks",qms:"upd.qms",closeDate:"close.date",just:"close.just",approver:"close.approver"};
function getP(r,p){ var a=p.split("."); return a.length>1?r[a[0]][a[1]]:r[a[0]]; }
function setP(r,p,v){ var a=p.split("."); if(a.length>1) r[a[0]][a[1]]=v; else r[a[0]]=v; }
function opts(list,prefix,cur){ return list.map(function(k){ return '<option value="'+k+'"'+(cur===k?" selected":"")+'>'+esc(t(prefix+k))+'</option>'; }).join(""); }
function fieldHTML(name,kind,wide){
 var id="f-"+name, lab=t("f_"+name), inner="";
 if(kind==="ta"||kind==="ta_tpl") inner='<textarea id="'+id+'" rows="3"></textarea>'+(kind==="ta_tpl"?'<button type="button" class="ca-tpl" id="tplBtn">'+esc(t("tplBtn"))+'</button>':"");
 else if(kind==="date") inner='<input id="'+id+'" type="date">';
 else if(kind==="ltr") inner='<input id="'+id+'" type="text" dir="ltr">';
 else if(kind==="sel_src") inner='<select id="'+id+'">'+opts(SRCS,"src_")+'</select>';
 else if(kind==="sel_cls") inner='<select id="'+id+'">'+opts(["","maj","min","obs"],"cls_")+'</select>';
 else if(kind==="sel_method") inner='<select id="'+id+'">'+opts(["why5","fish","other"],"m_")+'</select>';
 else if(kind==="sel_similar") inner='<select id="'+id+'">'+opts(["","none","exist","could"],"sim_")+'</select>';
 else if(kind==="sel_result") inner='<select id="'+id+'">'+opts(["","eff","ineff"],"r_")+'</select>';
 else if(kind==="pdca") inner='<div class="ca-pd"><input id="'+id+'" type="text" dir="ltr" list="pdcaList" aria-describedby="pdInfo"><button class="pd-btn ghost" type="button" id="pdOpen">'+esc(t("pdOpen"))+'</button></div><datalist id="pdcaList"></datalist><div class="ca-pdinfo" id="pdInfo" aria-live="polite"></div>';
 else inner='<input id="'+id+'" type="text">';
 return '<div class="pd-f'+(wide?" wide":"")+'"><label for="'+id+'">'+esc(lab)+'</label>'+inner+'</div>';
}
function buildForm(){
 document.getElementById("hdrFields").innerHTML=HDR.map(function(f){ return fieldHTML(f[0],f[1],f[2]); }).join("");
 document.getElementById("stages").innerHTML=SECS.map(function(s){
  var h='<div class="pd-stage" id="sec-'+s.k+'" style="--sc:'+s.col+'"><h3>'+esc(t(STT[s.k][0]))+'</h3><p class="pd-sub">'+esc(t(STT[s.k][1]))+'</p>';
  if(s.acts) h+='<div class="ca-actw"><table class="ca-acts"><thead><tr><th>'+esc(t("aT"))+'</th><th>'+esc(t("aOwner"))+'</th><th>'+esc(t("aDue"))+'</th><th>'+esc(t("aSt"))+'</th><th><span class="sr">'+esc(t("aDel"))+'</span></th></tr></thead><tbody id="actRows"></tbody></table></div><p class="ca-hint" id="actNone"></p><button class="pd-btn ghost" type="button" id="actAdd">+ '+esc(t("aAdd"))+'</button>';
  else h+='<div class="pd-fields">'+s.f.map(function(f){ return fieldHTML(f[0],f[1],f[2]); }).join("")+'</div>';
  if(s.reopen) h+='<div id="reopenBox"></div>';
  return h+'</div>';
 }).join("");
 var dl=document.getElementById("pdcaList"); if(dl) dl.innerHTML=pdcaCycles().map(function(c){ return '<option value="'+esc(c.id)+'">'+esc(c.title)+'</option>'; }).join("");
}
function actRowHTML(a,i){
 var late=a.st!=="done"&&isD(a.due)&&a.due<today();
 return '<tr data-row="'+i+'"'+(late?' class="late"':'')+(a.o?' data-o="'+esc(a.o)+'"':'')+'><td><textarea data-k="t" rows="2" aria-label="'+esc(t("aT"))+'">'+esc(a.t)+'</textarea></td><td><input data-k="owner" type="text" value="'+esc(a.owner)+'" aria-label="'+esc(t("aOwner"))+'"></td><td><input data-k="due" type="date" value="'+esc(a.due)+'" aria-label="'+esc(t("aDue"))+'"></td><td><select data-k="st" aria-label="'+esc(t("aSt"))+'">'+opts(["open","ip","done"],"a_",a.st)+'</select></td><td><button type="button" class="ca-x" data-actdel="'+i+'" aria-label="'+esc(t("aDel"))+'" title="'+esc(t("aDel"))+'">✕</button></td></tr>';
}
function renderActs(list){
 document.getElementById("actRows").innerHTML=list.map(actRowHTML).join("");
 document.getElementById("actNone").textContent=list.length?"":t("aNone");
}
function readActs(){
 return [].map.call(document.querySelectorAll("#actRows tr"),function(tr){ var o={}; tr.querySelectorAll("[data-k]").forEach(function(el){ o[el.getAttribute("data-k")]=el.value; }); var a={t:txt(o.t),owner:txt(o.owner),due:txt(o.due),st:o.st||"open"}; if(tr.getAttribute("data-o")) a.o=tr.getAttribute("data-o"); return a; });
}
function formToRec(){
 var r=blank();
 Object.keys(PATH).forEach(function(k){ var el=document.getElementById("f-"+k); if(el) setP(r,PATH[k],txt(el.value)); });
 if(!r.src) r.src="ncr";
 r.actions=readActs().filter(function(a){ return a.t||a.owner||a.due; });
 r.id=document.getElementById("rid").value;
 if(editing&&editing.id===r.id){ r.hist=JSON.parse(JSON.stringify(editing.hist||[])); r.origin=editing.origin?JSON.parse(JSON.stringify(editing.origin)):null; r.created=editing.created||""; }
 return r;
}
function recToForm(r,keepMsg){
 r=fixRec(JSON.parse(JSON.stringify(r)));
 document.getElementById("rid").value=r.id||"";
 Object.keys(PATH).forEach(function(k){ var el=document.getElementById("f-"+k); if(el) el.value=getP(r,PATH[k])||(el.tagName==="SELECT"&&el.options.length?el.options[0].value:""); });
 if(!r.src) document.getElementById("f-src").value="ncr";
 renderActs(r.actions);
 if(!keepMsg){ document.getElementById("recErr").textContent=""; document.getElementById("recOk").textContent=""; }
 refreshForm();
}
function loadRecordIntoForm(r){ editing=fixRec(JSON.parse(JSON.stringify(r))); recToForm(editing); }
function clearForm(){ editing=null; recToForm(blank()); }
function refreshForm(){
 var r=formToRec(), st=stageOf(r);
 var el=document.getElementById("curStage"); if(el) el.textContent=t("cur")+" "+stageName(st);
 var order=["react","cause","action","verify","closed"], ci=order.indexOf(st==="reopened"?"verify":st);
 document.getElementById("caSteps").innerHTML=order.map(function(s,i){ var cls=(st==="reopened"&&s==="verify")?"bad":(i<ci||st==="closed"?"done":(i===ci?"cur":"")); return '<li class="'+cls+'" style="--sc:'+SCOL[s]+'"'+(i===ci?' aria-current="step"':'')+'><i aria-hidden="true"></i>'+esc(stageName(s==="verify"&&st==="reopened"?"reopened":s))+'</li>'; }).join("");
 var rb=document.getElementById("reopenBox");
 if(rb){ var h=""; if(st==="reopened") h+='<div class="ca-reopen" role="note">'+esc(t("reopenT"))+'<br><button class="pd-btn warn" type="button" id="newRound">'+esc(t("newRound"))+'</button></div>';
  if(r.hist.length) h+='<p class="pd-sub" style="margin:12px 0 0;font-weight:700">'+esc(t("histT"))+'</p><ul class="ca-hist">'+r.hist.map(function(x){ return '<li><span dir="ltr">'+esc(x.d||"—")+'</span> · '+esc(x.crit)+(x.note?' — '+esc(x.note):'')+'</li>'; }).join("")+'</ul>';
  rb.innerHTML=h; }
 var info=document.getElementById("pdInfo"), v=txt((document.getElementById("f-pdca")||{}).value);
 if(info){ if(!v) info.textContent=t("pdHint"); else { var c=pdcaCycles().filter(function(x){ return x.id===v; })[0]; info.textContent=c?t("pdFound",{t:c.title||c.id}):t("pdMiss"); } }
 [].forEach.call(document.querySelectorAll("#actRows tr"),function(tr){ var d=tr.querySelector('[data-k="due"]'), s=tr.querySelector('[data-k="st"]'); tr.classList.toggle("late", !!(d&&s&&s.value!=="done"&&isD(d.value)&&d.value<today())); });
}
function validate(r){
 if(!r.title) return t("e_title");
 if(!r.ref) return t("e_ref");
 if(!r.desc) return t("e_desc");
 if(isD(r.raised)&&isD(r.react.date)&&r.react.date<r.raised) return t("e_dates");
 if(r.eff.result && (!r.eff.criterion||!isD(r.eff.checked))) return t("e_result");
 if(r.close.date){
  if(r.eff.result!=="eff") return t("e_closeEff");
  if(!r.close.just||!r.close.approver) return t("e_closeJ");
  if(isD(r.eff.checked)&&r.close.date<r.eff.checked) return t("e_closeDate");
 }
 return "";
}
function newId(r){
 var y=(isD(r.raised)?r.raised:today()).slice(0,4), pre="CA-"+y+"-";
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
function newRound(){
 var r=formToRec(); if(r.eff.result!=="ineff") return;
 if(!editing||editing.id!==r.id){ editing=fixRec(JSON.parse(JSON.stringify(r))); }
 editing.hist.push({d:r.eff.checked||today(),res:"ineff",crit:r.eff.criterion,note:r.eff.note});
 ["f-result","f-checked","f-effNote","f-planned"].forEach(function(id){ var el=document.getElementById(id); if(el) el.value=""; });
 refreshForm();
 document.getElementById("recOk").textContent=t("roundMsg");
}
function insertTemplate(){
 var a=document.getElementById("f-analysis"), m=document.getElementById("f-method").value||"why5"; if(!a) return;
 var tp=t("tpl_"+m); a.value=txt(a.value)?a.value.replace(/\s*$/,"")+"\n"+tp:tp; a.focus(); refreshForm();
}

/* ---------- self-assessment ---------- */
var AQ=[
 ["RE1",{ar:"هل نعزل المخرج غير المطابق ونصحّحه فور اكتشافه، ونسجّل التاريخ؟",en:"Do we contain and correct a nonconforming output as soon as it is found, and record the date?"}],
 ["RE2",{ar:"هل نتعامل مع العواقب (ما سُلّم للعميل، والأعمال المتأثرة) وليس مع الحالة وحدها؟",en:"Do we deal with the consequences (what reached the customer, the work affected), not only the single case?"}],
 ["CA1",{ar:"هل نحلّل السبب الجذري بطريقة معروفة (5 Whys أو Fishbone) وبدليل، قبل اختيار الإجراء؟",en:"Do we analyse the root cause with a known method (5 Whys or Fishbone) and evidence, before choosing an action?"}],
 ["CA2",{ar:"هل نتحقق من وجود حالات مشابهة أو احتمال حدوثها في مواقع أو عمليات أخرى؟",en:"Do we check whether similar nonconformities exist or could occur in other sites or processes?"}],
 ["AC1",{ar:"هل لكل إجراء تصحيحي مالك وموعد وحالة نتابعها؟",en:"Does every corrective action have an owner, a due date and a status we track?"}],
 ["AC2",{ar:"هل يغيّر الإجراء طريقة أو نموذجاً أو صلاحية، بدل الاكتفاء بالتذكير أو التدريب؟",en:"Does the action change a method, a form or an authority, rather than relying on a reminder or training alone?"}],
 ["EF1",{ar:"هل نحدد معيار الفعالية وموعد مراجعتها عند التخطيط للإجراء؟",en:"Do we set the effectiveness criterion and the review date when we plan the action?"}],
 ["EF2",{ar:"هل نعيد فتح السجل إذا لم يكن الإجراء فعالاً، بدل إغلاقه؟",en:"Do we reopen the record when the action was not effective, instead of closing it?"}],
 ["RD1",{ar:"هل نحتفظ بسجل يبيّن طبيعة عدم المطابقة والإجراءات ونتائجها؟",en:"Do we keep a record of the nature of each nonconformity, the actions and their results?"}],
 ["RD2",{ar:"هل يُغلق كل سجل بتبرير وموافقة شخص مخوّل؟",en:"Is every record closed with a justification and the approval of an authorized person?"}],
 ["LN1",{ar:"هل نحدّث سجل المخاطر والفرص ونظام الإدارة عندما يكشف الإجراء حاجة لذلك؟",en:"Do we update the risk register and the management system when an action shows the need?"}],
 ["LN2",{ar:"هل تُعرض اتجاهات عدم المطابقة والإجراءات التصحيحية في مراجعة الإدارة؟",en:"Are trends in nonconformities and corrective actions presented at management review?"}]
];
var AGROUPS=["RE","CA","AC","EF","RD","LN"];
var GCOL={RE:"#C2410C",CA:"#3563C9",AC:"#1B2A4A",EF:"#C9821A",RD:"#7B5BB8",LN:"#1E8C93"};
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
 var cnt=document.getElementById("cntDocs"); if(cnt) cnt.textContent=DB.records.length?String(DB.records.length):"";
 if(!DB.records.length){ box.innerHTML='<div class="pd-empty">'+esc(t("none"))+'</div>'; return; }
 var rows=DB.records.map(function(r){
  var st=stageOf(r), nd=nextDate(r);
  var del=(pendingDelete===r.id)?'<button class="pd-rowbtn arm" type="button" data-del="'+esc(r.id)+'">'+esc(t("delArm"))+'</button>':'<button class="pd-rowbtn" type="button" data-del="'+esc(r.id)+'">'+esc(t("del"))+'</button>';
  var pd=r.pdca?'<button class="pd-rowbtn" type="button" data-pdca="'+esc(r.pdca)+'">PDCA ↗</button>':'';
  return '<tr><td><b dir="ltr">'+esc(r.ref)+'</b><br>'+esc(r.title)+'<br><small dir="ltr" style="color:var(--muted)">'+esc(r.id)+'</small></td><td>'+esc(srcName(r.src))+'<br><small>'+esc(clsName(r.cls))+'</small></td><td><span class="pd-badge" style="background:'+SCOL[st]+';color:#fff">'+esc(stageName(st))+'</span></td><td>'+esc(r.owner)+'</td><td><span dir="ltr">'+esc(nd||"—")+'</span></td><td>'+flagsOf(r).map(chip).join("")+'</td><td><button class="pd-rowbtn" type="button" data-open="'+esc(r.id)+'">'+esc(t("open"))+'</button>'+del+pd+'</td></tr>';
 }).join("");
 box.innerHTML='<table class="pd-tbl"><thead><tr><th>'+esc(t("colRef"))+'</th><th>'+esc(t("colSrc"))+'</th><th>'+esc(t("colStage"))+'</th><th>'+esc(t("colOwner"))+'</th><th>'+esc(t("colNext"))+'</th><th>'+esc(t("colFlags"))+'</th><th>'+esc(t("colAct"))+'</th></tr></thead><tbody>'+rows+'</tbody></table>';
}
document.addEventListener("click",function(e){
 var o=e.target.closest("[data-open]"); if(o){ var r=DB.records.find(function(x){ return x.id===o.getAttribute("data-open"); }); if(r){ loadRecordIntoForm(r); go("tools"); } return; }
 var d=e.target.closest("[data-del]"); if(d){ var id=d.getAttribute("data-del"); if(pendingDelete===id){ DB.records=DB.records.filter(function(x){ return x.id!==id; }); pendingDelete=null; persist(); if(document.getElementById("rid").value===id) clearForm(); renderAll(); } else { pendingDelete=id; renderDocs(); } return; }
 var p=e.target.closest("[data-pdca]"); if(p){ openTool("pdca.html","docs"); return; }
 var x=e.target.closest("[data-actdel]"); if(x){ var list=readActs(); list.splice(Number(x.getAttribute("data-actdel")),1); renderActs(list); refreshForm(); return; }
 if(e.target.closest("#actAdd")){ var l2=readActs(); l2.push({t:"",owner:"",due:"",st:"open"}); renderActs(l2); var last=document.querySelector("#actRows tr:last-child textarea"); if(last) last.focus(); refreshForm(); return; }
 if(e.target.closest("#newRound")){ newRound(); return; }
 if(e.target.closest("#tplBtn")){ insertTemplate(); return; }
 if(e.target.closest("#pdOpen")){ openTool("pdca.html","docs"); return; }
});

/* ---------- import from the Smart Audit & Improvement center (read only, preview first) ---------- */
function audState(){ var S=TBX.read(AUD_KEY); if(!S||!S.r||typeof S.r!=="object") return null; return {fnd:Array.isArray(S.r.fnd)?S.r.fnd.filter(function(x){ return x&&typeof x==="object"; }):[],capa:Array.isArray(S.r.capa)?S.r.capa.filter(function(x){ return x&&typeof x==="object"; }):[]}; }
function saSt(c){ if(!c) return t("sa_none"); var s=["open","ip","ver","closed"].indexOf(c.st)>=0?t("sa_"+c.st):tv(c.st); var e=["eff","ineff","pend"].indexOf(c.eff)>=0?t("sa_"+c.eff):""; return s+(e?" · "+e:""); }
function fromAudit(f,c){
 var r=blank(), id=c?str(c.id):str(f&&f.id);
 r.id="SA-"+id;
 if(f){ r.title=tv(f.desc).slice(0,90); r.ref=str(f.id)+(f.ia?" / "+str(f.ia):""); r.cls=f.cls==="maj"?"maj":(f.cls==="min"?"min":"obs"); r.raised=isD(f.dt)?f.dt:""; r.desc=tv(f.desc); r.evidence=tv(f.evid);
  r.area=[tv(f.site),f.std?"ISO "+str(f.std)+(f.cl?" "+tv(f.cl):""):""].filter(Boolean).join(" · "); }
 else { r.title=tv(c.ca).slice(0,90); r.ref=str(c.f); r.desc=tv(c.ca); }
 r.src="ia";
 if(c){
  r.owner=tv(c.own); r.react.correction=tv(c.corr); r.react.containment=tv(c.cont);
  r.cause.method="other"; r.cause.analysis=["ppl","des","op","tp","sys","gov"].indexOf(c.rc)>=0?t("rc_"+c.rc):""; r.cause.root=tv(c.rcd);
  if(txt(tv(c.ca))) r.actions=[{t:tv(c.ca),owner:tv(c.own),due:isD(c.due)?c.due:"",st:(c.st==="closed"||c.st==="ver")?"done":(c.st==="ip"?"ip":"open"),o:"sa"}];
  r.eff.checked=isD(c.effDt)?c.effDt:""; r.eff.result=c.eff==="eff"?"eff":(c.eff==="ineff"?"ineff":"");
  r.close.date=(c.st==="closed"&&isD(c.cl))?c.cl:"";
 }
 r.origin={tool:"audit-center",f:f?str(f.id):str(c&&c.f),ca:c?str(c.id):"",at:today()};
 return fixRec(r);
}
/* "take theirs" on an existing record replaces only what the center provides; fields the center does not have stay as they are */
function mergeImport(cur,inc){
 var m=fixRec(JSON.parse(JSON.stringify(cur)));
 ["title","ref","src","cls","raised","owner","area","desc","evidence"].forEach(function(k){ if(inc[k]) m[k]=inc[k]; });
 ["correction","containment"].forEach(function(k){ if(inc.react[k]) m.react[k]=inc.react[k]; });
 if(inc.cause.root) m.cause.root=inc.cause.root;
 if(inc.cause.analysis && !m.cause.analysis) m.cause.analysis=inc.cause.analysis;
 m.actions=m.actions.filter(function(a){ return a.o!=="sa"; }).concat(inc.actions.filter(function(a){ return a.o==="sa"; }));
 if(inc.eff.checked) m.eff.checked=inc.eff.checked; if(inc.eff.result) m.eff.result=inc.eff.result;
 if(inc.close.date) m.close.date=inc.close.date;
 m.origin=inc.origin; return m;
}
function sameRec(a,b){ var x=JSON.parse(JSON.stringify(a)), y=JSON.parse(JSON.stringify(b)); [x,y].forEach(function(o){ delete o.updated; delete o.created; if(o.origin) delete o.origin.at; }); return JSON.stringify(x)===JSON.stringify(y); }
function importRows(){
 var S=audState(); if(!S) return null;
 var rows=[], seenF={};
 S.capa.forEach(function(c){ var f=S.fnd.filter(function(x){ return str(x.id)===str(c.f); })[0]||null; if(f) seenF[str(f.id)]=1; rows.push({f:f,c:c}); });
 S.fnd.forEach(function(f){ if(!seenF[str(f.id)] && (f.cls==="maj"||f.cls==="min")) rows.push({f:f,c:null}); });
 return rows.map(function(x){
  var inc=fromAudit(x.f,x.c), cur=DB.records.filter(function(r){ return r.id===inc.id; })[0]||null, merged=cur?mergeImport(cur,inc):inc;
  return {id:inc.id,f:x.f,c:x.c,inc:merged,cur:cur,state:cur?(sameRec(cur,merged)?"same":"upd"):"new"};
 });
}
function impPreview(keepChoices){
 var msg=document.getElementById("impMsg"), box=document.getElementById("impTable"), prev={};
 if(keepChoices&&IMP) IMP.forEach(function(r){ prev[r.id]=r.ch; });
 var rows=importRows();
 ["impAllT","impAllK","impApply"].forEach(function(id){ document.getElementById(id).hidden=!(rows&&rows.length); });
 if(!rows){ IMP=null; box.hidden=true; msg.textContent=t("impNone"); return; }
 if(!rows.length){ IMP=null; box.hidden=true; msg.textContent=t("impEmpty"); return; }
 rows.forEach(function(r){ r.ch=prev[r.id]||(r.state==="new"?"take":"keep"); });
 IMP=rows; if(!keepChoices) msg.textContent=DB.imp&&DB.imp.at?t("impLast",{d:DB.imp.at}):"";
 renderImp();
}
function renderImp(){
 var box=document.getElementById("impTable"); if(!IMP){ box.hidden=true; return; }
 box.hidden=false;
 box.innerHTML='<table class="pd-tbl"><thead><tr><th>'+esc(t("impColSrc"))+'</th><th>'+esc(t("impColF"))+'</th><th>'+esc(t("impColSt"))+'</th><th>'+esc(t("impColState"))+'</th><th>'+esc(t("impColCh"))+'</th></tr></thead><tbody>'+
  IMP.map(function(r,i){
   var stl=r.state==="new"?[t("impNew"),"info"]:(r.state==="upd"?[t("impUpd"),"warn"]:[t("impSame"),"ok"]);
   var ch=r.state==="same"?'<span class="ca-chip ok">'+esc(t("impSame"))+'</span>':'<span class="ca-ch" role="group"><button type="button" data-impch="'+i+'" data-v="take" aria-pressed="'+(r.ch==="take")+'">'+esc(t("impTake"))+'</button><button type="button" data-impch="'+i+'" data-v="keep" aria-pressed="'+(r.ch==="keep")+'">'+esc(t("impKeep"))+'</button></span>';
   return '<tr><td><b dir="ltr">'+esc(r.c?str(r.c.id):"—")+'</b><br><small dir="ltr">'+esc(r.f?str(r.f.id):str(r.c&&r.c.f))+'</small></td><td>'+esc(r.f?tv(r.f.desc):tv(r.c&&r.c.ca))+(r.f?'<br><small>'+esc(clsName(r.inc.cls))+' · '+esc(r.inc.area)+'</small>':'')+'</td><td>'+esc(saSt(r.c))+'</td><td>'+chip(stl)+(r.cur?'<br><small>'+esc(stageName(stageOf(r.cur)))+' → '+esc(stageName(stageOf(r.inc)))+'</small>':'<br><small>'+esc(stageName(stageOf(r.inc)))+'</small>')+'</td><td>'+ch+'</td></tr>';
  }).join("")+'</tbody></table>';
}
function impApply(){
 if(!IMP) return; var n=0;
 IMP.forEach(function(r){ if(r.state==="same"||r.ch!=="take") return; var rec=fixRec(JSON.parse(JSON.stringify(r.inc))); rec.updated=new Date().toISOString(); if(!rec.created) rec.created=rec.updated;
  var i=DB.records.findIndex(function(x){ return x.id===rec.id; }); if(i>=0) DB.records[i]=rec; else DB.records.push(rec); n++; });
 var msg=document.getElementById("impMsg");
 if(!n){ msg.textContent=t("impNoSel"); return; }
 DB.imp={at:today(),n:n}; persist();
 impPreview(false); msg.textContent=t("impDone",{n:n}); renderAll();
}
document.getElementById("impPrev").addEventListener("click",function(){ impPreview(false); });
document.getElementById("impAllT").addEventListener("click",function(){ if(IMP){ IMP.forEach(function(r){ r.ch="take"; }); renderImp(); } });
document.getElementById("impAllK").addEventListener("click",function(){ if(IMP){ IMP.forEach(function(r){ r.ch="keep"; }); renderImp(); } });
document.getElementById("impApply").addEventListener("click",impApply);
document.getElementById("impTable").addEventListener("click",function(e){ var b=e.target.closest("[data-impch]"); if(!b||!IMP) return; IMP[Number(b.getAttribute("data-impch"))].ch=b.getAttribute("data-v"); renderImp(); });
function renderHomeImp(){
 var box=document.getElementById("homeImp"); if(!box) return;
 var rows=importRows()||[], n=rows.filter(function(r){ return r.state==="new"; }).length;
 box.hidden=!n; if(n) document.getElementById("homeImpT").textContent=t("impHome",{n:n});
}
document.getElementById("homeImpGo").addEventListener("click",function(){ go("docs"); impPreview(false); var b=document.getElementById("impBox"); if(b&&b.scrollIntoView) b.scrollIntoView({block:"start"}); });

/* ---------- automatic audit of records ---------- */
var CHECKS=["ref","cont","root","act","impl","effc","just","effb","time"];
function auditRecord(r){
 var st=stageOf(r), res={}, late=["action","verify","closed","reopened"].indexOf(st)>=0, after=["verify","closed","reopened"].indexOf(st)>=0, closed=st==="closed";
 res.ref=!!txt(r.ref);
 res.cont=!!((txt(r.react.correction)||txt(r.react.containment))&&isD(r.react.date));
 res.root=late?!!txt(r.cause.root):null;
 res.act=late?(r.actions.length>0&&r.actions.every(function(a){ return txt(a.t)&&txt(a.owner)&&isD(a.due); })):null;
 res.impl=after?!!txt(r.impl.evidence):null;
 res.effc=after?!!(txt(r.eff.criterion)&&(st==="verify"?(isD(r.eff.planned)||!!r.eff.result):!!r.eff.result)):null;
 res.just=closed?!!(txt(r.close.just)&&txt(r.close.approver)):null;
 res.effb=closed?(r.eff.result==="eff"&&isD(r.eff.checked)&&(!isD(r.close.date)||r.eff.checked<=r.close.date)):null;
 res.time=!isOverdue(r);
 return res;
}
function auditSummary(){ var A=TBX.audit(DB.records,auditRecord,CHECKS); return {pass:A.pass,applic:A.applic,rate:A.rate,failRec:A.failRec}; }
function renderAudit(){
 var box=document.getElementById("auBox"), kp=document.getElementById("auKpis"); if(!box) return;
 if(!DB.records.length){ box.innerHTML='<div class="pd-empty">'+esc(t("auEmpty"))+'</div>'; kp.innerHTML=""; return; }
 var A=TBX.audit(DB.records,auditRecord,CHECKS), over=0;
 var rows=A.rows.map(function(x){ if(x.res.time===false) over++; return '<tr><td>'+esc(x.r.title)+'<br><small dir="ltr">'+esc(x.r.ref)+'</small></td>'+TBX.cells(x.res,CHECKS)+'</tr>'; }).join("");
 box.innerHTML='<table class="pd-tbl"><thead><tr><th>'+esc(t("colRef"))+'</th>'+CHECKS.map(function(k){ return '<th>'+esc(t("c_"+k))+'</th>'; }).join("")+'</tr></thead><tbody>'+rows+'</tbody></table>';
 kp.innerHTML=TBX.kpi(DB.records.length,t("auRec"))+TBX.kpi(A.rate===null?"—":A.rate+"%",t("auPass"))+TBX.kpi(A.failRec,t("auFail"))+TBX.kpi(over,t("auOver"));
}

/* ---------- dashboard ---------- */
function counts(){
 var R=DB.records, c={n:R.length,closed:0,eff:0,actOver:0,effOver:0,reopen:0,wait:0};
 R.forEach(function(r){ var s=stageOf(r); if(s==="closed"){ c.closed++; if(r.eff.result==="eff") c.eff++; } if(actOver(r)) c.actOver++; if(effOver(r)) c.effOver++; if(s==="reopened") c.reopen++; if(s==="verify"&&!r.eff.result&&!effOver(r)) c.wait++; });
 return c;
}
function openItems(){
 var out=[];
 DB.records.forEach(function(r){
  lateActs(r).forEach(function(a){ out.push({r:r,k:"bad",s:t("oi_act",{a:a.t||"—",o:a.owner||"—",d:a.due})}); });
  if(effOver(r)) out.push({r:r,k:"bad",s:t("oi_eff",{d:r.eff.planned})});
  if(stageOf(r)==="reopened") out.push({r:r,k:"bad",s:t("oi_re")});
  if(stageOf(r)==="verify"&&!r.eff.result&&!effOver(r)&&isD(r.eff.planned)) out.push({r:r,k:"info",s:t("oi_wait",{d:r.eff.planned})});
 });
 return out;
}
function renderDash(){
 var box=document.getElementById("dKpis"); if(!box) return;
 var c=counts(), au=auditSummary(), as=assessScore(), n=c.n;
 box.innerHTML=TBX.kpi(n,t("kTotal"))+TBX.kpi(n-c.closed,t("kOpen"))+TBX.kpi(c.closed,t("kClosed"))+TBX.kpi(n?Math.round(c.eff/n*100)+"%":"—",t("kEff"))+TBX.kpi(c.actOver,t("kActOver"))+TBX.kpi(c.effOver,t("kEffOver"))+TBX.kpi(c.reopen,t("kReopen"))+TBX.kpi(au.rate===null?"—":au.rate+"%",t("kAud"))+TBX.kpi(as+"%",t("kAs"));
 var nd='<p class="pd-sub" style="color:var(--ink-soft)">'+esc(t("noData"))+'</p>';
 document.getElementById("dStage").innerHTML=n?TBX.dist(STAGES,n,function(s){ return DB.records.filter(function(r){ return stageOf(r)===s; }).length; },stageName,function(s){ return SCOL[s]; }):nd;
 document.getElementById("dLink").innerHTML=n?TBX.dist(SRCS,n,function(k){ return DB.records.filter(function(r){ return r.src===k; }).length; },srcName,function(){ return "#3563C9"; }):nd;
 document.getElementById("dAssess").innerHTML=AGROUPS.map(function(g){ var p=assessScore(g); return TBX.bar(t("g_"+g),p+"%",p,GCOL[g]); }).join("")+'<p class="pd-sub" style="font-size:12.5px;color:var(--muted);margin:10px 0 0">'+esc(t("bandNote"))+'</p>';
 var oi=openItems();
 document.getElementById("dOpen").innerHTML=oi.length?oi.map(function(x){ return '<li><b>'+esc(x.r.ref)+'</b>'+chip([x.r.id,"info"])+'<span>'+esc(x.s)+'</span></li>'; }).join(""):'<li>'+esc(n?t("noOpen"):t("noData"))+'</li>';
}

/* ---------- report and CSV ---------- */
function buildCSV(){
 var head=["id","ref","title","source","class","raised","owner","area","stage","overdue","correction","containment","reactDate","method","rootCause","similar","actions","actionsOpen","implEvidence","criterion","planned","checked","result","closeDate","approver","pdca","origin"];
 return TBX.csv(head,DB.records.map(function(r){ return [r.id,r.ref,r.title,r.src,r.cls,r.raised,r.owner,r.area,stageOf(r),isOverdue(r)?"yes":"no",r.react.correction,r.react.containment,r.react.date,r.cause.method,r.cause.root,r.cause.similar,
  r.actions.map(function(a){ return [a.t,a.owner,a.due,a.st].join(" — "); }).join(" | "),r.actions.filter(function(a){ return a.st!=="done"; }).length,r.impl.evidence,r.eff.criterion,r.eff.planned,r.eff.checked,r.eff.result,r.close.date,r.close.approver,r.pdca,r.origin?(r.origin.tool+" "+r.origin.ca+" "+r.origin.f).trim():""]; }));
}
function buildReportHTML(){
 var c=counts(), au=auditSummary(), as=assessScore(), d=today(), n=c.n, A=TBX.audit(DB.records,auditRecord,CHECKS);
 var mark=function(v){ return v===null?'<td class="na">—</td>':(v?'<td class="ok">✓</td>':'<td class="bad">✗</td>'); };
 var grpRows=AGROUPS.map(function(g){ return '<tr><td>'+esc(t("g_"+g))+' — '+g+'</td><td>'+assessScore(g)+'%</td></tr>'; }).join("");
 var recRows=DB.records.map(function(r){ var dn=r.actions.filter(function(a){ return a.st==="done"; }).length; return '<tr><td dir="ltr">'+esc(r.id)+'</td><td dir="ltr">'+esc(r.ref)+'</td><td>'+esc(r.title)+'</td><td>'+esc(srcName(r.src))+'</td><td>'+esc(stageName(stageOf(r)))+'</td><td>'+esc(r.owner)+'</td><td>'+esc(r.cause.root)+'</td><td>'+dn+'/'+r.actions.length+'</td><td>'+esc(t("r_"+r.eff.result))+'</td></tr>'; }).join("");
 var auRows=A.rows.map(function(x){ return '<tr><td dir="ltr">'+esc(x.r.id)+'</td>'+CHECKS.map(function(k){ return mark(x.res[k]); }).join("")+'</tr>'; }).join("");
 var oi=openItems();
 var body='<h1>CAPA — Corrective action / تقرير الإجراءات التصحيحية</h1>'+
  '<p class="meta">'+esc(t("prep"))+': <strong>مدثر سلامه</strong> · '+esc(d)+' · Continual Improvement Academy</p>'+
  '<h2>Summary / الملخص</h2><div class="k">'+
   '<div><b>'+n+'</b>'+esc(t("kTotal"))+'</div><div><b>'+(n-c.closed)+'</b>'+esc(t("kOpen"))+'</div><div><b>'+c.eff+'</b>'+esc(t("kEff"))+'</div><div><b>'+c.actOver+'</b>'+esc(t("kActOver"))+'</div><div><b>'+c.effOver+'</b>'+esc(t("kEffOver"))+'</div><div><b>'+c.reopen+'</b>'+esc(t("kReopen"))+'</div><div><b>'+(au.rate===null?"—":au.rate+"%")+'</b>'+esc(t("kAud"))+'</div><div><b>'+as+'%</b>'+esc(t("kAs"))+'</div></div>'+
  '<h2>Records / السجلات</h2>'+(n?'<table><thead><tr><th>ID</th><th>Reference / المرجع</th><th>Title / العنوان</th><th>Source / المصدر</th><th>Stage / المرحلة</th><th>Owner / المالك</th><th>Root cause / السبب الجذري</th><th>Actions done / الإجراءات المنفذة</th><th>Effectiveness / الفعالية</th></tr></thead><tbody>'+recRows+'</tbody></table>':'<p class="meta">'+esc(t("rpEmpty"))+'</p>')+
  '<h2>Audit results / نتائج التدقيق</h2>'+(n?'<p>'+esc(t("auPass"))+': '+(au.rate===null?"—":au.rate+"% ("+au.pass+"/"+au.applic+")")+'</p><table><thead><tr><th>ID</th>'+CHECKS.map(function(k){ return '<th>'+esc(t("c_"+k))+'</th>'; }).join("")+'</tr></thead><tbody>'+auRows+'</tbody></table>':'<p class="meta">—</p>')+
  '<h2>Open items / بنود تحتاج متابعة</h2>'+(oi.length?'<ul>'+oi.map(function(x){ return '<li><span dir="ltr">'+esc(x.r.id)+' · '+esc(x.r.ref)+'</span> — '+esc(x.s)+'</li>'; }).join("")+'</ul>':'<p class="meta">'+esc(n?t("noOpen"):"—")+'</p>')+
  '<h2>Self-assessment / التقييم الذاتي</h2><table><thead><tr><th>Group / المجموعة</th><th>Score / النتيجة</th></tr></thead><tbody>'+grpRows+'<tr><td><b>'+esc(t("kAs"))+'</b></td><td><b>'+as+'%</b></td></tr></tbody></table><p class="meta">'+esc(t("bandNote"))+'</p>'+
  '<footer>Prepared by / أعدّه: مدثر سلامه · Sources / المراجع: ISO 9001:2026 clauses 6.1, 7.5, 8.7, 9.1.3, 9.2.2, 9.3.2 and 10.2; ISO 9000:2026 3.6.2–3.6.4 and 3.7.17; ISO 19011:2026 6.7 (interpretive summaries, not the official text) · Examples are illustrative.</footer>';
 return TBX.reportDoc(L,'CAPA Report — مدثر سلامه',body,'.ok{color:#2F7D4B;font-weight:700;text-align:center}.bad{color:#B42318;font-weight:700;text-align:center}.na{color:#7A869E;text-align:center}ul{padding-inline-start:20px}');
}
function stamp(){ return today(); }
function renderReport(){
 var prev=document.getElementById("rpPrev"); if(!prev) return;
 if(!DB.records.length){ prev.innerHTML='<p class="pd-sub" style="color:var(--ink-soft)">'+esc(t("rpEmpty"))+'</p>'; return; }
 var c=counts(), au=auditSummary();
 prev.innerHTML='<div class="pd-kpis">'+TBX.kpi(c.n,t("kTotal"))+TBX.kpi(c.n-c.closed,t("kOpen"))+TBX.kpi(c.actOver+c.effOver,t("auOver"))+TBX.kpi(au.rate===null?"—":au.rate+"%",t("kAud"))+'</div>';
}
document.getElementById("rpHtml").addEventListener("click",function(){
 var err=document.getElementById("rpErr"); err.textContent="";
 if(!DB.records.length && !Object.keys(DB.assess).length){ err.textContent=t("rpEmpty"); return; }
 TBX.download("CAPA-report-"+stamp()+".html","text/html;charset=utf-8",buildReportHTML());
});
document.getElementById("rpCsv").addEventListener("click",function(){ var err=document.getElementById("rpErr"); err.textContent=""; if(!DB.records.length){ err.textContent=t("rpEmpty"); return; } TBX.download("CAPA-records-"+stamp()+".csv","text/csv;charset=utf-8",buildCSV()); });
document.getElementById("dCsv").addEventListener("click",function(){ if(!DB.records.length) return; TBX.download("CAPA-records-"+stamp()+".csv","text/csv;charset=utf-8",buildCSV()); });

/* ---------- platform identity: academy logo and related tools ---------- */
var LOGO="__LOGO__";
function applyLogo(){ document.querySelectorAll("img[data-logo]").forEach(function(i){ if(i.src!==LOGO) i.src=LOGO; i.alt=t("logoAlt"); }); }
var RELATED=[["aud","ISO 19011","./smart-audit-improvement.html","#C9821A"],["pdca","PDCA","./pdca.html","#1E8C93"],["q","ISO 9001","./iso9001.html","#1B2A4A"],["ims","IMS","./ims-builder.html","#3C9A5F"]];
function buildRelated(){
 var box=document.getElementById("homeStd"); if(!box) return;
 box.innerHTML='<p class="hs-t">'+esc(t("related"))+'</p>'+RELATED.map(function(r){ return '<a class="hs on" href="'+r[2]+'" target="_blank" rel="noopener" style="--c:'+r[3]+';--t:'+r[3]+'14"><b dir="ltr">'+r[1]+'</b><span>'+esc(t("rel_"+r[0]))+'</span><em>↗</em></a>'; }).join("");
}

/* ---------- example data (illustrative, fictitious Saudi company) and clear all ---------- */
function EXR(o){ var r=fixRec(o); return r; }
function A3(t1,o1,d1,s1){ return {t:t1,owner:o1,due:d1,st:s1}; }
var EXAMPLE={
ar:[
 EXR({id:"CA-EX-01",title:"حديد تسليح استُلم دون شهادات المصنع",ref:"NCR-2026-018",src:"ncr",cls:"maj",raised:"2026-04-08",owner:"مدير المشتريات",area:"المشتريات · مستودع المشروع PRJ-2026-112",pdca:"",
  desc:"استُلمت شحنة 38 طناً من حديد التسليح قطر 16 و20 ملم في مستودع المشروع دون شهادات المصنع التي تشترطها المواصفات الفنية للمشروع.",
  evidence:"إشعار الاستلام GRN-4471، وصور الشحنة، وتقرير الفحص عند الاستلام.",
  react:{correction:"طُلبت الشهادات من المورد ووصلت بعد خمسة أيام وطابقت المواصفات، فأُفرج عن الشحنة.",containment:"عُزلت الشحنة ببطاقة «موقوف» ومُنع صرفها للموقع حتى وصول الشهادات.",date:"2026-04-08",consequences:"لم يُصرف أي جزء من الشحنة. فُحصت آخر ثلاث شحنات حديد ووُجدت شهاداتها كاملة."},
  cause:{method:"why5",analysis:"لماذا وصلت دون شهادات؟ لأن المورد لم يرسلها.\nلماذا لم يرسلها؟ لأن أمر الشراء لم يطلبها.\nلماذا لم يطلبها؟ لأن نموذج أمر الشراء لا يحتوي بند الشهادات للمواد الإنشائية.\nلماذا؟ لأن النموذج صُمم للمشتريات العامة ولم يُراجع منذ 2023.",root:"نموذج أمر الشراء لا يشترط شهادات المصنع للمواد الإنشائية.",similar:"could",similarNote:"قد يتكرر مع الخرسانة الجاهزة والكابلات؛ أُضيف البند لها أيضاً."},
  actions:[A3("إضافة بند «شهادات المصنع شرط للاستلام» إلى نموذج أمر الشراء للمواد الإنشائية","مدير المشتريات","2026-04-30","done"),A3("تحديث إجراء الاستلام: لا تُستلم مادة إنشائية دون شهاداتها","مدير الجودة","2026-05-10","done"),A3("توعية أمناء المستودعات بالبند الجديد","مدير المستودعات","2026-05-15","done")],
  impl:{evidence:"نموذج أمر الشراء PO-F-02 الإصدار 5، وإجراء الاستلام QP-08 الإصدار 4، وسجل حضور التوعية.",date:"2026-05-15"},
  eff:{criterion:"صفر شحنات مواد إنشائية تُستلم دون شهادات خلال 90 يوماً بعد التنفيذ (من سجل الاستلام).",planned:"2026-08-15",checked:"2026-08-17",result:"eff",note:"راجع مسؤول الجودة 64 إشعار استلام بين 16 مايو و15 أغسطس، وكلها بشهاداتها."},
  upd:{risks:"أُضيف خطر «مواد إنشائية دون شهادات» إلى سجل مخاطر المشتريات بضابط جديد.",qms:"تعديل PO-F-02 وQP-08."},
  close:{date:"2026-08-20",just:"فعال: صفر حالات في 90 يوماً من سجل الاستلام، والوثائق محدّثة.",approver:"مدير الجودة"},hist:[],origin:null,created:"2026-04-08T07:30:00.000Z",updated:"2026-08-20T10:00:00.000Z"}),
 EXR({id:"CA-EX-02",title:"أجهزة قياس تجاوزت موعد المعايرة",ref:"IA-2026-07 / F-03",src:"ia",cls:"min",raised:"2026-07-28",owner:"مدير الجودة",area:"الموقعان أ وب",pdca:"PD-EX-02",
  desc:"وجد التدقيق الداخلي IA-2026-07 أن 6 من 38 جهاز قياس في موقعين تجاوزت موعد المعايرة، واستُخدم اثنان منها في فحص الاستلام.",
  evidence:"قائمة الأجهزة وملصقاتها، وسجلات المعايرة الورقية في الموقعين.",
  react:{correction:"أُرسلت الأجهزة الستة للمعايرة وعادت ضمن الحدود.",containment:"أُوقف استخدام الأجهزة الستة فوراً ووُضعت عليها بطاقة «خارج الخدمة».",date:"2026-07-29",consequences:"أُعيد فحص نتائج الاستلام التي استُخدم فيها الجهازان، وبقيت ضمن الحدود بعد المعايرة."},
  cause:{method:"fish",analysis:"الأفراد: لا مسؤول محدد للمعايرة في كل موقع.\nالطريقة: سجل ورقي في كل موقع ولا تنبيه قبل الموعد.\nالمعدات: أجهزة تنتقل بين المواقع دون تحديث السجل.\nالقياس: لا مراجعة شهرية لحالة المعايرة.",root:"لا يوجد سجل معايرة موحد بتنبيه مسبق، والأجهزة تنتقل بين المواقع دون تحديثه.",similar:"exist",similarNote:"فُحص الموقع ج: جهازان قريبان من الموعد، وأُضيفا إلى السجل الموحد."},
  actions:[A3("سجل معايرة موحد بتنبيه قبل 30 يوماً","مدير الجودة","2026-08-20","done"),A3("ملصق حالة المعايرة على كل جهاز","مشرفو المواقع","2026-08-31","done"),A3("نموذج نقل الأجهزة بين المواقع","مدير المعدات","2026-09-10","done")],
  impl:{evidence:"السجل الموحد، وصور الملصقات في الموقعين، وأربعة نماذج نقل مكتملة.",date:"2026-09-12"},
  eff:{criterion:"صفر أجهزة مستخدمة تجاوزت موعد المعايرة في ثلاثة فحوص شهرية متتالية.",planned:"2026-11-20",checked:"",result:"",note:""},
  upd:{risks:"خطر الأجهزة المستأجرة التي تتأخر شهاداتها مضاف إلى سجل المخاطر.",qms:"إجراء ضبط أجهزة القياس QP-11 قيد التحديث."},
  close:{date:"",just:"",approver:""},hist:[],origin:null,created:"2026-07-30T08:00:00.000Z",updated:"2026-09-12T12:00:00.000Z"}),
 EXR({id:"CA-EX-03",title:"مخططات ملغاة مستخدمة في الموقع ب",ref:"EA-2026-02 / NC-2",src:"ea",cls:"min",raised:"2026-08-12",owner:"مدير المشروع",area:"الموقع ب · الأعمال الإنشائية",pdca:"",
  desc:"في تدقيق المراقبة الخارجي وُجدت ثلاث نسخ من مخططات إنشائية ملغاة (الإصدار C) في مكتب الموقع ب، والإصدار الساري هو E.",
  evidence:"صور النسخ الثلاث، وسجل الوثائق الذي يبيّن الإصدار E، وتقرير التدقيق EA-2026-02.",
  react:{correction:"سُحبت النسخ الملغاة وأُتلفت، ووُزّع الإصدار E بتوقيع استلام.",containment:"راجع مهندس الموقع الأعمال المنفذة خلال أسبوعين، ووجد أنها نُفذت وفق الإصدار E.",date:"2026-08-12",consequences:"لم يُنفذ أي عمل على الإصدار الملغى."},
  cause:{method:"why5",analysis:"لماذا بقيت النسخ؟ لأن أحداً لم يسحبها عند صدور الإصدار الجديد.\nلماذا؟ لأن التوزيع بالبريد ولا يُطلب سحب القديم.\nلماذا؟ لأن إجراء ضبط الوثائق لا يحدد مسؤولاً عن السحب في الموقع.",root:"إجراء ضبط الوثائق لا يحدد مسؤولاً عن سحب النسخ الملغاة في الموقع.",similar:"exist",similarNote:"وُجدت نسختان ملغاتان في الموقع ج، وسُحبتا."},
  actions:[A3("تعديل إجراء ضبط الوثائق: منسق وثائق مسؤول عن السحب في كل موقع","مدير الجودة","2026-09-15","ip"),A3("قائمة توزيع موقّعة لكل إصدار جديد","منسق الوثائق","2026-09-30","open"),A3("فحص شهري للنسخ في مكاتب المواقع","مدير المشروع","2026-10-31","open")],
  impl:{evidence:"",date:""},eff:{criterion:"صفر نسخ ملغاة في فحصين شهريين متتاليين لمكاتب المواقع الثلاثة.",planned:"2026-12-15",checked:"",result:"",note:""},
  upd:{risks:"",qms:""},close:{date:"",just:"",approver:""},hist:[],origin:null,created:"2026-08-13T09:00:00.000Z",updated:"2026-09-20T09:00:00.000Z"}),
 EXR({id:"CA-EX-04",title:"شحنات خرسانة جاهزة مرفوضة عند الاستلام",ref:"NCR-2026-044",src:"sup",cls:"maj",raised:"2026-05-06",owner:"مدير المشروع",area:"المشروع PRJ-2026-112 · الخرسانة",pdca:"PD-EX-03",
  desc:"رُفضت 9% من شحنات الخرسانة الجاهزة في أبريل 2026 عند الاستلام بسبب الهبوط ودرجة الحرارة، فتأخر الصب في ثلاثة أيام.",
  evidence:"سجل الاستلام لشهر أبريل، وتقارير الرفض الموقّعة.",
  react:{correction:"أُعيدت الشحنات المرفوضة إلى المورد وطُلبت بدائل.",containment:"فحص الهبوط والحرارة لكل شحنة قبل التفريغ.",date:"2026-05-06",consequences:"أُعيدت جدولة الصب المتأثر."},
  cause:{method:"fish",analysis:"الطريقة: النقل في ساعات الذروة ولا اتفاق على وقت الصب.\nالبيئة: حرارة الصيف تتجاوز 45 درجة.\nالمواد: ماء الخلط غير مبرد.\nالمورد: لا شرط تعاقدي للتبريد.\nبعد مراجعة الفعالية (سبتمبر): لم يلتزم المورد بتبريد الماء في ثلاث شحنات، والجدولة وحدها لا تكفي.",root:"سببان معاً: الصب في ساعات الحرارة، وعدم وجود شرط تعاقدي يلزم المورد بتبريد ماء الخلط.",similar:"could",similarNote:"قد يتكرر في المشروعين الآخرين صيفاً."},
  actions:[A3("جدولة الصب بعد السادسة مساءً في الصيف","مدير المشروع","2026-05-20","done"),A3("بند تبريد ماء الخلط في أمر الشراء","المشتريات","2026-05-25","done"),A3("شرط تعاقدي بغرامة وفحص حرارة في المصنع قبل الشحن","مدير المشتريات","2026-10-30","ip")],
  impl:{evidence:"جدول الصب المعدّل، وأمر الشراء المعدّل.",date:"2026-06-01"},
  eff:{criterion:"أقل من 3% شحنات مرفوضة في يوليو وأغسطس 2026 (من سجل الاستلام).",planned:"2026-09-01",checked:"2026-09-02",result:"ineff",note:"النسبة 6%: انخفضت لكن الهدف لم يتحقق. أُعيد فتح السجل وأُضيف الإجراء الثالث، وتحمله دورة PDCA رقم PD-EX-03."},
  upd:{risks:"رُفع تقدير خطر «توريد الخرسانة صيفاً» إلى مرتفع.",qms:""},close:{date:"",just:"",approver:""},hist:[],origin:null,created:"2026-05-06T06:45:00.000Z",updated:"2026-09-03T10:15:00.000Z"})
],
en:[
 EXR({id:"CA-EX-01",title:"Reinforcing steel received without mill certificates",ref:"NCR-2026-018",src:"ncr",cls:"maj",raised:"2026-04-08",owner:"Procurement manager",area:"Procurement · PRJ-2026-112 site store",pdca:"",
  desc:"A 38-tonne delivery of 16 mm and 20 mm reinforcing steel was received at the project store without the mill certificates the project specification requires.",
  evidence:"Goods received note GRN-4471, photos of the load and the receiving inspection report.",
  react:{correction:"The certificates were requested from the supplier, arrived five days later and matched the specification, so the load was released.",containment:"The load was tagged “on hold” and not issued to site until the certificates arrived.",date:"2026-04-08",consequences:"No part of the load was used. The last three steel deliveries were checked and their certificates were complete."},
  cause:{method:"why5",analysis:"Why no certificates? The supplier did not send them.\nWhy? The purchase order did not ask for them.\nWhy? The purchase order form has no certificate clause for structural materials.\nWhy? The form was designed for general purchasing and has not been reviewed since 2023.",root:"The purchase order form does not require mill certificates for structural materials.",similar:"could",similarNote:"Could recur with ready-mix concrete and cables; the clause was added for them too."},
  actions:[A3("Add “mill certificates are a condition of receipt” to the purchase order form for structural materials","Procurement manager","2026-04-30","done"),A3("Update the receiving procedure: no structural material is received without its certificates","Quality manager","2026-05-10","done"),A3("Brief the storekeepers on the new clause","Stores manager","2026-05-15","done")],
  impl:{evidence:"Purchase order form PO-F-02 revision 5, receiving procedure QP-08 revision 4 and the briefing attendance sheet.",date:"2026-05-15"},
  eff:{criterion:"No structural material received without certificates in the 90 days after implementation (from the receiving log).",planned:"2026-08-15",checked:"2026-08-17",result:"eff",note:"The quality officer reviewed 64 goods received notes from 16 May to 15 August; all had their certificates."},
  upd:{risks:"The risk “structural materials without certificates” was added to the procurement risk register with a new control.",qms:"PO-F-02 and QP-08 revised."},
  close:{date:"2026-08-20",just:"Effective: zero cases in 90 days from the receiving log, and the documents are updated.",approver:"Quality manager"},hist:[],origin:null,created:"2026-04-08T07:30:00.000Z",updated:"2026-08-20T10:00:00.000Z"}),
 EXR({id:"CA-EX-02",title:"Measuring devices past their calibration date",ref:"IA-2026-07 / F-03",src:"ia",cls:"min",raised:"2026-07-28",owner:"Quality manager",area:"Sites A and B",pdca:"PD-EX-02",
  desc:"Internal audit IA-2026-07 found 6 of 38 measuring devices at two sites past their calibration date; two had been used for receiving inspection.",
  evidence:"The device list and labels, and the paper calibration logs at both sites.",
  react:{correction:"The six devices were sent for calibration and came back within limits.",containment:"The six devices were taken out of use at once and tagged “out of service”.",date:"2026-07-29",consequences:"Receiving results taken with the two devices were rechecked; they stayed within limits after calibration."},
  cause:{method:"fish",analysis:"People: no named calibration owner at each site.\nMethod: a paper log at each site and no reminder before the due date.\nEquipment: devices move between sites without the log being updated.\nMeasurement: no monthly check of calibration status.",root:"There is no single calibration register with an advance reminder, and devices move between sites without it being updated.",similar:"exist",similarNote:"Site C was checked: two devices were close to their date and were added to the single register."},
  actions:[A3("One calibration register with a 30-day reminder","Quality manager","2026-08-20","done"),A3("Calibration status label on every device","Site supervisors","2026-08-31","done"),A3("Device transfer form between sites","Equipment manager","2026-09-10","done")],
  impl:{evidence:"The single register, photos of the labels at both sites and four completed transfer forms.",date:"2026-09-12"},
  eff:{criterion:"Zero devices in use past their calibration date in three monthly checks in a row.",planned:"2026-11-20",checked:"",result:"",note:""},
  upd:{risks:"The risk of rented devices with late certificates is in the risk register.",qms:"Measuring equipment procedure QP-11 is being updated."},
  close:{date:"",just:"",approver:""},hist:[],origin:null,created:"2026-07-30T08:00:00.000Z",updated:"2026-09-12T12:00:00.000Z"}),
 EXR({id:"CA-EX-03",title:"Superseded drawings in use on site B",ref:"EA-2026-02 / NC-2",src:"ea",cls:"min",raised:"2026-08-12",owner:"Project manager",area:"Site B · structural works",pdca:"",
  desc:"At the external surveillance audit, three superseded structural drawings (revision C) were found in the site B office; the current revision is E.",
  evidence:"Photos of the three copies, the document register showing revision E, and audit report EA-2026-02.",
  react:{correction:"The superseded copies were withdrawn and destroyed, and revision E was issued against a signed receipt.",containment:"The site engineer reviewed the work done over two weeks and found it was built to revision E.",date:"2026-08-12",consequences:"No work was built to the superseded revision."},
  cause:{method:"why5",analysis:"Why did the copies stay? Nobody withdrew them when the new revision came.\nWhy? Distribution is by email and nobody is asked to withdraw old copies.\nWhy? The document control procedure names no one responsible for withdrawal on site.",root:"The document control procedure names no one responsible for withdrawing superseded copies on site.",similar:"exist",similarNote:"Two superseded copies were found on site C and withdrawn."},
  actions:[A3("Revise the document control procedure: a document controller on each site is responsible for withdrawal","Quality manager","2026-09-15","ip"),A3("A signed distribution list for every new revision","Document controller","2026-09-30","open"),A3("Monthly check of copies in site offices","Project manager","2026-10-31","open")],
  impl:{evidence:"",date:""},eff:{criterion:"Zero superseded copies in two monthly checks in a row of the three site offices.",planned:"2026-12-15",checked:"",result:"",note:""},
  upd:{risks:"",qms:""},close:{date:"",just:"",approver:""},hist:[],origin:null,created:"2026-08-13T09:00:00.000Z",updated:"2026-09-20T09:00:00.000Z"}),
 EXR({id:"CA-EX-04",title:"Ready-mix concrete loads rejected at delivery",ref:"NCR-2026-044",src:"sup",cls:"maj",raised:"2026-05-06",owner:"Project manager",area:"Project PRJ-2026-112 · concrete",pdca:"PD-EX-03",
  desc:"9% of ready-mix concrete loads were rejected at delivery in April 2026 for slump and temperature, delaying pours on three days.",
  evidence:"The April delivery log and the signed rejection reports.",
  react:{correction:"Rejected loads were returned to the supplier and replacements ordered.",containment:"Slump and temperature checked on every load before unloading.",date:"2026-05-06",consequences:"The affected pours were rescheduled."},
  cause:{method:"fish",analysis:"Method: transport at peak hours and no agreed pour time.\nEnvironment: summer heat above 45 °C.\nMaterials: mixing water not chilled.\nSupplier: no contract clause on chilling.\nAfter the effectiveness review (September): the supplier did not chill the water on three loads; rescheduling alone is not enough.",root:"Two causes together: pouring in the hot hours, and no contract clause requiring the supplier to chill the mixing water.",similar:"could",similarNote:"Could recur on the other two projects in summer."},
  actions:[A3("Schedule summer pours after 6 pm","Project manager","2026-05-20","done"),A3("Chilled mixing water clause in the purchase order","Procurement","2026-05-25","done"),A3("Contract clause with a penalty, and a temperature check at the plant before dispatch","Procurement manager","2026-10-30","ip")],
  impl:{evidence:"The revised pour schedule and the revised purchase order.",date:"2026-06-01"},
  eff:{criterion:"Under 3% of loads rejected in July and August 2026 (from the delivery log).",planned:"2026-09-01",checked:"2026-09-02",result:"ineff",note:"6%: lower, but the target was not met. The record was reopened, a third action was added, and PDCA cycle PD-EX-03 carries it."},
  upd:{risks:"The risk “concrete supply in summer” was raised to high.",qms:""},close:{date:"",just:"",approver:""},hist:[],origin:null,created:"2026-05-06T06:45:00.000Z",updated:"2026-09-03T10:15:00.000Z"})
]};
var EXAMPLE_AS={RE1:2,RE2:1,CA1:2,CA2:1,AC1:2,AC2:1,EF1:1,EF2:2,RD1:2,RD2:1,LN1:1,LN2:0};
function loadExample(){
 DB={records:JSON.parse(JSON.stringify(EXAMPLE[L]||EXAMPLE.ar)),assess:JSON.parse(JSON.stringify(EXAMPLE_AS))};
 pendingDelete=null; IMP=null; var ok=persist(); clearForm(); renderAll();
 var m=document.getElementById("exMsg"); if(m) m.textContent=ok?t("exLoaded"):t("savedFail");
}
function clearAll(){
 DB={records:[],assess:{}}; pendingDelete=null; IMP=null;
 TBX.drop(STORE);
 clearForm(); renderAll();
 document.getElementById("impTable").hidden=true; ["impAllT","impAllK","impApply"].forEach(function(id){ document.getElementById(id).hidden=true; }); document.getElementById("impMsg").textContent="";
 var m=document.getElementById("exMsg"); if(m) m.textContent=t("exCleared");
 var a=document.getElementById("asMsg"); if(a) a.textContent="";
}
/* the tour layer asks for confirmation before the example replaces data (guard "pfEx": "all"); clearing asks here */
document.getElementById("pfEx").addEventListener("click",function(){ loadExample(); });
document.getElementById("pfReset").addEventListener("click",function(){ var ok=true; try{ ok=window.confirm(t("exConfirmClear")); }catch(e){ ok=true; } if(ok) clearAll(); });

/* ---------- assistant: answers from the tool's own guide and your records (rule-based, no AI service) ---------- */
var CONTACT_EMAIL="moddathersalama.eng@gmail.com";
var CB={
 ar:{fab:"اسأل عن CAPA",title:"مساعد CAPA",sub:"إجابات فورية من دليل الأداة وسجلاتك",new:"محادثة جديدة",close:"إغلاق",ph:"اكتب سؤالك…",send:"إرسال",inL:"سؤالك",
  hello:"مرحباً. أجيب عن أسئلة CAPA من دليل الأداة ومن سجلاتك المحفوظة في هذا المتصفح. اختر سؤالاً أو اكتب سؤالك.",
  miss:"لم أجد إجابة جاهزة لهذا السؤال. جرّب أحد الأسئلة المقترحة، أو اسأل عن: الفعالية، أو الاستيراد، أو الإجراء الوقائي، أو PDCA. وللاستشارة راسل المُعِد على البريد أدناه.",
  instant:"إجابة فورية",foot:"المساعد يعمل في متصفحك ولا يرسل بياناتك. للتواصل:",
  od0:"لا توجد سجلات متأخرة الآن.",st0:"لا توجد سجلات بعد. ابدأ من [[tab:tools]] أو حمّل المثال من [[tab:docs]]."},
 en:{fab:"Ask about CAPA",title:"CAPA assistant",sub:"Instant answers from the tool's guide and your records",new:"New chat",close:"Close",ph:"Type your question…",send:"Send",inL:"Your question",
  hello:"Hello. I answer CAPA questions from the tool's guide and from your records saved in this browser. Pick a question or type your own.",
  miss:"I have no ready answer for that. Try one of the suggested questions, or ask about effectiveness, import, preventive action or PDCA. For advice, email the author at the address below.",
  instant:"Instant answer",foot:"The assistant runs in your browser and sends no data. Contact:",
  od0:"No records are overdue right now.",st0:"No records yet. Start from the [[tab:tools]] or load the example in [[tab:docs]]."}
};
var KB=[
 {id:"diff",k:["فرق","التصحيح","تصحيحي","correction","corrective","difference"],q:{ar:"ما الفرق بين التصحيح والإجراء التصحيحي؟",en:"What is the difference between correction and corrective action?"},
  a:{ar:"**التصحيح** يزيل عدم المطابقة المكتشفة نفسها، مثل إعادة شحنة أو سحب مخطط ملغى (ISO 9000:2026، 3.6.3).\n\n**الإجراء التصحيحي** يزيل سببها حتى لا تتكرر (3.6.4).\n\nفي السجل: الأول في قسم «التفاعل»، والثاني في «خطة الإجراء التصحيحي» في [[tab:tools]].",en:"**Correction** removes the detected nonconformity itself, such as returning a load or withdrawing a superseded drawing (ISO 9000:2026, 3.6.3).\n\n**Corrective action** removes its cause so it does not recur (3.6.4).\n\nIn the record, the first goes under “Reaction” and the second under “Corrective action plan” in the [[tab:tools]]."}},
 {id:"prev",k:["وقائي","الوقائي","preventive","prevent","prevention"],q:{ar:"لماذا لا يوجد إجراء وقائي في ISO 9001:2026؟",en:"Why is there no preventive action in ISO 9001:2026?"},
  a:{ar:"المواصفة لا تحتوي بنداً للإجراء الوقائي. منع المشكلات قبل وقوعها يتم بالتخطيط للمخاطر والفرص في **البند 6.1**، ويذكر البند 10.1 ج منع الآثار غير المرغوبة ضمن التحسين. نحتفظ باسم **CAPA** لأنه المتداول. التفاصيل في [[tab:explain-std]].",en:"The standard has no preventive action clause. Preventing problems before they happen is done by planning for risks and opportunities in **clause 6.1**, and clause 10.1 c) names preventing undesired effects as part of improvement. We keep the name **CAPA** because people use it. Details in the [[tab:explain-std]]."}},
 {id:"eff",k:["فعالية","الفعالية","effective","effectiveness","review"],q:{ar:"متى أراجع فعالية الإجراء؟",en:"When do I review effectiveness?"},
  a:{ar:"حدّد **معيار الفعالية** و**موعد المراجعة** عند التخطيط للإجراء، واترك مدة تسمح بظهور التكرار إن وُجد (غالباً 60 إلى 90 يوماً). راجع من بيانات جديدة مثل سجل الاستلام أو الفحص. لا يُغلق السجل قبل نتيجة «فعال».",en:"Set the **effectiveness criterion** and the **review date** when you plan the action, and leave enough time for a recurrence to show (often 60 to 90 days). Review from new data such as the receiving or inspection log. A record is not closed before an “effective” result."}},
 {id:"reopen",k:["غير فعال","اعادة فتح","إعادة فتح","reopen","not effective","ineffective"],q:{ar:"ماذا أفعل إذا لم يكن الإجراء فعالاً؟",en:"What if the action was not effective?"},
  a:{ar:"اختر النتيجة «غير فعال» واحفظ، فيصبح السجل **أعيد فتحه**. ارجع إلى تحليل السبب وابحث عما لم يُعالج، وأضف إجراءات جديدة، ثم اضغط «ابدأ جولة مراجعة جديدة». تبقى المراجعة السابقة في تاريخ السجل.",en:"Choose the result “not effective” and save: the record becomes **reopened**. Go back to the cause analysis, find what was missed, add new actions, then select “Start a new review round”. The earlier review stays in the record's history."}},
 {id:"import",k:["استيراد","استورد","import","smart audit","مركز التدقيق"],q:{ar:"كيف أستورد من مركز التدقيق الذكي؟",en:"How do I import from the Smart Audit center?"},
  a:{ar:"في [[tab:docs]] ← «الاستيراد من مركز التدقيق»: اضغط «معاينة الاستيراد»، ثم اختر لكل صف «خذ بياناتهم» أو «أبقِ بياناتي»، ثم «طبّق الاستيراد». الأداة تقرأ فقط، ولا يُكتب أي شيء في بيانات المركز.",en:"In the [[tab:docs]] → “Import from the audit center”: select “Preview import”, choose “Take theirs” or “Keep mine” for each row, then “Apply import”. The tool only reads; nothing is written to the center's data."}},
 {id:"pdca",k:["pdca","دورة","cycle","ربط","link"],q:{ar:"متى أربط السجل بدورة PDCA؟",en:"When do I link a record to a PDCA cycle?"},
  a:{ar:"عندما يحتاج الإجراء تغييراً يُقاس على مراحل (هدف وخط أساس ونتيجة)، افتح دورة في أداة PDCA واكتب رقمها في حقل «دورة PDCA المرتبطة». زر «افتح PDCA» يفتح الأداة داخل المنصة.",en:"When the action needs a change measured in stages (target, baseline, result), open a cycle in the PDCA tool and write its number in the “Linked PDCA cycle” field. The “Open PDCA” button opens the tool inside the platform."}},
 {id:"data",k:["بياناتي","حفظ","تحفظ","data","stored","privacy","متصفح","browser"],q:{ar:"أين تُحفظ بياناتي؟",en:"Where is my data stored?"},
  a:{ar:"في **هذا المتصفح فقط** تحت المفتاح cia-capa:v1، ولا تُرسل إلى أي خادم. تقرأ بوابة الأكاديمية ملخصاً منها للوحة الأداء. صدّر التقرير أو CSV للاحتفاظ بنسخة من [[tab:report]].",en:"In **this browser only**, under the key cia-capa:v1; nothing is sent to a server. The Academy hub reads a summary for its performance dashboard. Export the report or CSV from the [[tab:report]] to keep a copy."}},
 {id:"od",dyn:"od",k:["متأخر","متأخرة","المتأخرة","overdue","late"],q:{ar:"ما السجلات المتأخرة الآن؟",en:"Which records are overdue now?"}},
 {id:"status",dyn:"status",k:["وضع","حالة","ملخص","status","summary","where do we stand"],q:{ar:"ما وضع سجلاتي الآن؟",en:"Where do my records stand?"}}
];
var CB_SUG=["diff","prev","eff","od","status"];
function kbDyn(id){
 var u=CB[L]||CB.ar;
 if(id==="od"){ var R=DB.records.filter(isOverdue); if(!R.length) return u.od0+"\n\n[[tab:dash]]"; return R.map(function(r){ var a=lateActs(r); return "- **"+r.ref+"** — "+r.title+(a.length?" · "+a.map(function(x){ return (x.owner||"—")+" "+x.due; }).join("، "):"")+(effOver(r)?" · "+t("fl_effOver"):""); }).join("\n")+"\n\n[[tab:docs]] · [[tab:dash]]"; }
 if(id==="status"){ var c=counts(); if(!c.n) return u.st0; return "- "+t("kTotal")+": **"+c.n+"**\n- "+t("kOpen")+": **"+(c.n-c.closed)+"**\n- "+t("kEff")+": **"+c.eff+"**\n- "+t("kActOver")+": **"+c.actOver+"**\n- "+t("kEffOver")+": **"+c.effOver+"**\n- "+t("kReopen")+": **"+c.reopen+"**\n- "+t("kAs")+": **"+assessScore()+"%**\n\n[[tab:dash]] · [[tab:audit]]"; }
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
function renderAll(){ renderDocs(); renderAudit(); renderDash(); renderReport(); renderAssess(); renderHomeImp(); refreshForm(); }
document.getElementById("rec-form").addEventListener("submit",function(e){ e.preventDefault(); saveRecord(); });
document.getElementById("rec-form").addEventListener("input",function(){ refreshForm(); });
document.getElementById("rec-form").addEventListener("change",function(){ refreshForm(); });
document.getElementById("newBtn").addEventListener("click",function(){ clearForm(); });
document.getElementById("langBtn").addEventListener("click",function(){ switchLang(); });
window.addEventListener("hashchange",function(){ var h=location.hash.slice(1); if(h!==curTab) go(h); });
window.addEventListener("storage",function(e){ if(e.key===PDCA_KEY||e.key===AUD_KEY){ renderHomeImp(); var dl=document.getElementById("pdcaList"); if(dl) dl.innerHTML=pdcaCycles().map(function(c){ return '<option value="'+esc(c.id)+'">'+esc(c.title)+'</option>'; }).join(""); refreshForm(); } });

/* ---------- boot ---------- */
applyLang();
go((location.hash||"#home").slice(1));
