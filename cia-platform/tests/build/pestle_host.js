/* ===== PESTLE tool — host logic. Scans and assessment are stored in this browser only (localStorage, wrapped in try/catch). =====
   Storage key "cia-pestle:v1" (this tool only). Schema:
   { records: [ {
       id, ref, title, scope: "org"|"unit"|"market"|"project"|"bid"|"site", decision (the decision or plan the scan serves),
       level: "intl"|"national"|"regional"|"local", date (date of the scan, YYYY-MM-DD), facil (facilitator), owner,
       revBy (next review date, YYYY-MM-DD), trig (events that call for a review before that date),
       src: "strat"|"swot"|"none", srcId (the record the scan was started from, read only),
       team:  [ {n (name or function), role, ext: "no"|"customer"|"supplier"|"advisor"|"dept"} ]       "ext" other than "no" = outside input
       grp:   [ {k: "p"|"e"|"s"|"t"|"l"|"en"|"x1"|"x2"|"x3", n (the factor's name when adjusted; "" = the default name),
                 nr (why nothing in this factor is relevant, when it has no item)} ]       the six PESTLE factors always, in this order, then up to
                                                                                           three factors added for the organization's context
       fac:   [ {id, g (factor key), t (the fact or trend), so (its source), d (the source's date, YYYY-MM-DD), eff: "o"|"t"|"b"|"",
                 sig: 1..5|null (significance), cer: 1..5|null (certainty), hz: "s"|"m"|"lg"|"" (time horizon), who (who is affected),
                 sid (id of the record in another tool it came from, read only)} ]              the items of the scan
       clim:  {dec: "rel"|"not"|"", why}                                                  the climate change decision (ISO 9001:2026 4.1)
       outs:  [ {id, f (item id), to: "swot"|"reg"|"plan"|"iso31000"|"aside", q: "o"|"t"|"" (as an opportunity or a threat in SWOT),
                 ref (SWOT study id or the reference in the register or plan), what (the entry), why (why it is set aside), who} ]
       acts:  [ {id, f (item id or ""), what, who, by (YYYY-MM-DD), st: "plan"|"doing"|"done", done (YYYY-MM-DD), ev} ]   actions
       revs:  [ {id, date, trig: "periodic"|"event"|"mgmt"|"other", chg (what changed), add (items added), rem (items removed)} ]   reviews
       created, updated } ],
     assess: { IN1..RV3: 0|1|2 } }
   The score of an item is significance × certainty; the top items are the six highest scores of 6 or more (ties: significance, then the
   order of entry). The stage is computed (scoped → team → items with sources → climate decided → ranked → outcomes → reviewed); nothing
   about it or about the ranking is stored.
   Other tools' keys are only read, never written: "strategy-studio:v1" (the PESTLE register of the Strategy & Performance Studio, r.pestle)
   and "cia-swot:v1" (SWOT studies: their items with the source type "pestle", and the studies named by an outcome, previewed with the SWOT
   tool's own rules). The other tools open through their own requests (?open= or the one-time hint "cia-nav:swot"; the Strategy Studio and
   the ISO 31000 Risk Studio on a tab). This tool reads its own hint "cia-nav:pestle" ({open} | {strat} | {swot, item}) and its address
   (?open=, ?strat=ID or *, ?swot=ID with &item=IID) once; none of them holds tool data. */
var LKEY="cia-lang", STORE="cia-pestle:v1", STR_KEY="strategy-studio:v1", SW_KEY="cia-swot:v1", NAV_KEY="cia-nav:pestle", SW_NAV="cia-nav:swot";
var L=(function(){ try{ return localStorage.getItem(LKEY)||"ar"; }catch(e){ return "ar"; } })();
var TABS=["home","explain-std","explain-cl","assess","tools","docs","audit","dash","report","ai"];
var TITLES={ar:"PESTLE | مسح البيئة الخارجية — مدثر سلامه",en:"PESTLE | Scanning the outside world — مدثر سلامه"};
var STAGES=["draft","scoped","team","sourced","climate","ranked","outcomes","reviewed"], MAPST=STAGES.slice(1);
var SCOL={draft:"#9AA5B8",scoped:"#7A869E",team:"#1E8C93",sourced:"#3563C9",climate:"#2F7D4B",ranked:"#1B2A4A",outcomes:"#C9821A",reviewed:"#3C9A5F"};
var BASEG=["p","e","s","t","l","en"], XG=["x1","x2","x3"], ALLG=BASEG.concat(XG);
var GCOL={p:"#7B5BB8",e:"#C9821A",s:"#1E8C93",t:"#3563C9",l:"#1B2A4A",en:"#3C9A5F",x1:"#9D4E8A",x2:"#9D4E8A",x3:"#9D4E8A"};
var GC={p:"P",e:"E",s:"S",t:"T",l:"L",en:"EN",x1:"X",x2:"Y",x3:"Z"};
var EFFS=["o","t","b"], ECOL={o:"#3563C9",t:"#B7790F",b:"#7B5BB8"}, HZS=["s","m","lg"];
var SCOPES=["org","unit","market","project","bid","site"], LEVELS=["intl","national","regional","local"];
var SRCS=["strat","swot","none"], STSRC=["strat","swot"];
var EXTS=["no","customer","supplier","advisor","dept"], CLIMS=["rel","not"], TOS=["swot","reg","plan","iso31000","aside"], OQS=["o","t"];
var ASTS=["plan","doing","done"], RTRIG=["periodic","event","mgmt","other"], WTS=[1,2,3,4,5];
var TOPN=6, TOPMIN=6, LONG=12, MAXTEAM=12, MAXFAC=48, MAXOUTS=24, MAXACTS=24, MAXREV=10;
var DB=load();
var curTab="home";
var editing=null;   /* deep copy of the scan open in the form: keeps created between saves */
var ST=null;        /* rows of the read-only start preview */

var UI={
ar:{brand:"أكاديمية التحسين المستمر · مدثر سلامه",toolName:"أداة PESTLE — مسح البيئة الخارجية",sgLearn:"التعلّم",sgWork:"العمل",sgOut:"المخرجات",
 nHome:"الرئيسية",nStd:"دليل المنهجية",nCl:"دليل البنود",nAssess:"التقييم الذاتي",nTools:"مسوح PESTLE",nDocs:"السجلات",nAudit:"التدقيق",nDash:"لوحة المؤشرات",nReport:"التقرير",nAi:"المساعد الذكي",soon:"قريباً",
 homeCode:"النطاق · الفريق · الواقعة والمصدر · المناخ · الترتيب · المخرج · المراجعة",homeH1:"تحليل PESTLE",
 homeLede:"مسح للبيئة الخارجية يخدم قراراً أو خطة محددة: فريق فيه رأي من خارجه، وستة عوامل (سياسي واقتصادي واجتماعي وتقني وقانوني وبيئي)، ولكل بند واقعة محددة بمصدرها وتاريخها وأثرها على المنشأة، ثم قرار صريح في تغير المناخ، ثم ترتيب بالأهمية × اليقين، ثم يذهب كل بند أعلى إلى SWOT أو سجل المخاطر أو خطة 6.1 أو يُستبعد بسبب مكتوب، ثم مراجعة دورية وبعد الأحداث الكبرى.",
 homeNote:"النسخة الحالية تحفظ المسوح في متصفحك فقط. الحفظ على الخادم وتسجيل الدخول يُضافان في مرحلة المنصة المشتركة.",
 prep:"إعداد",authorName:"مدثر سلامه",cycleT:"ما الذي تستطيع فعله هنا",cycleS:"اقرأ دليل المنهجية، ثم قيّم ممارستكم لتحليل PESTLE، ثم ابدأ مسحاً جديداً، أو من سجل PESTLE في استوديو الاستراتيجية، أو من بنود PESTLE في دراسة SWOT.",
 tStd:"متى يكون PESTLE مفيداً: النطاق والقرار، والفريق، والبند المحدد بمصدره وتاريخه، والأثر والأهمية، واليقين والأفق، وتغير المناخ، والترتيب، والمخرج إلى SWOT والمخاطر، والمراجعة، والفجوات الشائعة وما يطلبه المدقق.",tCl:"بنود ISO 9001:2026 التي يخدمها المسح: السياق 4.1 بملاحظاته، والملحق A.4.1، والأطراف المعنية 4.2، والمخاطر والفرص 6.1.1 و6.1.2 و6.1.3، ومدخلات مراجعة الإدارة 9.3.2، مع تعريفات ISO 9000:2026 والبنود 5.1 و5.2 و5.3 من ISO 10009:2024: ملخص تفسيري ومثال وما يطلبه المدقق.",tAssess:"اثنا عشر سؤالاً تقيس ممارسة PESTLE لديكم، من تكوين الفريق حتى إبلاغ النتيجة.",
 tTools:"مسح لكل قرار: النطاق والمستوى، والفريق، والعوامل الستة ببنود محددة ومصادرها، وقرار تغير المناخ، والترتيب، ومخرج لكل بند أعلى، والإجراءات، والمراجعة، مع اللوحة ومصفوفة الأهمية × اليقين والأفق الزمني ورسم المصادر.",tDocs:"كل المسوح بمرحلتها ونطاقها وتنبيهاتها، وبيانات المثال.",tAudit:"فحص آلي لكل مسح: المرجع والغرض، والفريق، والعوامل الستة، والمصدر والتاريخ، والبنود العامة، وتغير المناخ، والترتيب، والمخرجات، والإجراءات، والمراجعة.",
 tDash:"البنود العليا بمصدر وتاريخ، والبنود العليا التي لها مخرج، والمسوح المراجعة، ورسم البنود حسب العامل، والبنود المفتوحة، والتقييم الذاتي.",tReport:"تقرير HTML بكل مسح ولوحته ومصفوفته وبنوده العليا ومخرجاتها والإجراءات والمراجعة، ونتائج التدقيق والبنود المفتوحة والتقييم الذاتي، وملف CSV.",tAi:"مساعد يقرأ المسوح وينبّه إلى البنود العامة والعوامل التي لم تُدرس. لم يُفعَّل بعد.",
 foot:"المراجع: ISO 9001:2026 البنود 4.1 و4.2 و6.1.1 و6.1.2 و6.1.3 و9.3.2 والملحق A.4.1، وISO 9000:2026 البنود 3.1.2 و3.7.2 و4.4.1، وISO 10009:2024 البنود 5.1 و5.2 و5.3 و7.2 والملحقان A وC (ملخصات تفسيرية، وليست النص الرسمي). PESTLE أسلوب، وليس متطلباً في أي مواصفة. الأمثلة توضيحية وليست بيانات حقيقية.",
 heroTag:"أداة منهجية · مسح البيئة الخارجية",langSw:"English",langSwA:"Switch to English",logoAlt:"أكاديمية التحسين المستمر — مدثر سلامه",
 related:"أدوات مرتبطة في الأكاديمية",rel_str:"استوديو الاستراتيجية والأداء (سجل PESTLE)",rel_swot:"تحليل SWOT — من المصفوفة إلى القرار",rel_iso10009:"دليل أدوات الجودة ISO 10009 (5.2)",rel_lessons:"سجل الدروس المستفادة",rel_iso31000:"استوديو المخاطر ISO 31000",rel_fmea:"تحليل أنماط الفشل وآثارها FMEA",rel_pareto:"باريتو — تحليل القلة الحيوية",rel_rca:"تحليل السبب الجذري — التحقيق",rel_a3:"حل المشكلات بأسلوب A3",rel_pdca:"دورة PDCA",
 termT:"هل تحليل PESTLE متطلب في ISO 9001:2026؟",
 termP1:"لا. PESTLE أسلوب، وليس متطلباً في أي مواصفة. تطلب ISO 9001:2026 في البند 4.1 تحديد القضايا الخارجية والداخلية ذات الصلة بغرض المنشأة وتوجهها الاستراتيجي، وتحديد ما إذا كان تغير المناخ قضية ذات صلة، ومتابعة المعلومات عن هذه القضايا ومراجعتها، وتذكر الملاحظة 2 القضايا القانونية والتقنية والتنافسية والسوقية والثقافية والسياسية والاجتماعية والاقتصادية والبيئية على المستوى الدولي أو الوطني أو الإقليمي أو المحلي. ثم تطلب مراعاتها عند تحديد المخاطر والفرص (6.1.1)، ومراجعة تغيراتها في مراجعة الإدارة (9.3.2 ب)). وتراجع ISO 10009:2024 أسلوب PESTLE في البند 5.2. وPESTLE طريقة منظمة لتلبية الجانب الخارجي من ذلك إن طُبّق جيداً.",
 termP2:"والقاعدة هنا: PESTLE مفيد فقط عندما تكون بنوده محددة وبمصدر وتاريخ وتقود إلى شيء. البند واقعة أو اتجاه خارجي: نظام وتاريخ سريانه، أو رقم منشور، أو توقع باسم صاحبه، لا رأي. ولكل بند أثره على المنشأة (فرصة أو تهديد أو كلاهما)، وأهميته، ودرجة اليقين منه، وأفقه الزمني. ويُنبَّه على البند العام مثل «الاقتصاد غير مستقر». والقائمة الطويلة بلا ترتيب فجوة: يُرتب بالأهمية × اليقين ويُحتفظ بالأهم. ويُقرر تغير المناخ صراحة: ذو صلة أم لا، ولماذا.",
 termP3:"وكل بند أعلى يذهب إلى مكان: إلى SWOT فرصة أو تهديداً، أو إلى سجل المخاطر أو خطة 6.1، أو يُستبعد بسبب مكتوب. ويؤرخ المسح ويُراجع دورياً وبعد الأحداث الكبرى، كما تنبّه ISO 10009:2024 في نقاط الانتباه للبند 5.2. وPESTLE يغذي SWOT وقوى بورتر ولا يحل محلهما: الأداة تقرأ سجل PESTLE في استوديو الاستراتيجية ودراسات SWOT للقراءة فقط.",
 termIs:"ملخص تفسيري بصياغة مستقلة، وليس النص الرسمي. المصادر: ISO 9001:2026 البنود 4.1 (بملاحظاته الثلاث) و4.2 و6.1.1 و6.1.2 و6.1.3 و9.3.2 والملحق A.4.1 (الملف الرسمي المرفوع، قُرئ بالأداة pdftotext)، وISO 9000:2026 البنود 3.1.2 و3.7.2 و4.4.1 (ممسوح ضوئياً، قُرئ بالتعرف الضوئي)، وISO 10009:2024 البنود 5.1 و5.2 و5.3 و7.2 والجدول A.1 والجدول C.1 (الملف الرسمي المرفوع في هذه الخطوة). أي كتاب في PESTLE أو PESTEL، وأساليب السيناريوهات ومسح الأفق، وISO 31000: «غير متحقق منه». التحقق: 2026-10-17.",
 defs:[["النطاق والقرار","لماذا نمسح","المنشأة أو وحدة أو سوق أو مشروع أو عطاء أو موقع، والمستوى (دولي أو وطني أو إقليمي أو محلي)، والقرار أو الخطة التي يخدمها المسح.","#7A869E"],["الواقعة والمصدر","محدد · مؤرخ","البند واقعة أو اتجاه خارجي بمصدر وتاريخ: نظام وتاريخ سريانه، أو رقم منشور، أو توقع باسم صاحبه. البند العام يُنبَّه عليه.","#3563C9"],["الأثر والترتيب","الأهمية × اليقين","لكل بند أثره (فرصة أو تهديد أو كلاهما) وأهميته ويقينه وأفقه. الدرجة تحدد البنود العليا.","#1B2A4A"],["تغير المناخ","قرار صريح","ذو صلة أم لا، مع السبب. البند 4.1 من ISO 9001:2026 يطلب هذا القرار.","#2F7D4B"],["المخرج والمراجعة","SWOT · المخاطر · المراجعة","كل بند أعلى إلى SWOT أو سجل المخاطر أو خطة 6.1، أو يُستبعد بسبب، ثم مراجعة دورية وبعد الأحداث الكبرى.","#C9821A"]],
 asT:"التقييم الذاتي لممارسة PESTLE",asS:"أجب عن كل سؤال بما يحدث فعلاً عندكم. النتيجة تقيس الممارسة الحالية، وليست شهادة ولا حكماً على الأداء.",asReset:"مسح الإجابات",asSaved:"تم حفظ الإجابة",asAnswered:"أُجيب {n} من 12",
 band0:"يحتاج عملاً",band1:"في طور التطوير",band2:"راسخ",bandNote:"حدود داخلية للتقييم الذاتي من تصميم هذه الأداة، وليست معياراً رسمياً.",as0:"غير موجود",as1:"جزئي",as2:"موجود ومطبّق",
 g_IN:"الفريق والبنود",g_EV:"الأثر والتقييم والترتيب",g_OU:"المناخ والمخرجات",g_RV:"المراجعة والإبلاغ",
 tlT:"مسح PESTLE",tlS:"مسح لكل قرار أو خطة: النطاق والمستوى، والفريق، والعوامل الستة ببنود محددة، وقرار تغير المناخ، والترتيب، ومخرج لكل بند أعلى، والإجراءات، والمراجعة. تتحدد المرحلة مما تملؤه.",
 save:"حفظ المسح",newRec:"مسح جديد",savedFail:"تعذّر الحفظ في هذا المتصفح. نزّل التقرير قبل إغلاق الصفحة.",cur:"المرحلة الحالية:",ok_rec:"تم حفظ المسح",
 st_draft:"مسودة",st_scoped:"حُدد النطاق",st_team:"اكتمل الفريق",st_sourced:"بنود بمصادر",st_climate:"قُرر المناخ",st_ranked:"رُتّبت",st_outcomes:"مخرجات",st_reviewed:"روجع",
 mp_scoped:"النطاق والمستوى والقرار والتاريخ",mp_team:"3 أدوار ورأي من الخارج",mp_sourced:"العوامل الستة مدروسة وكل بند بمصدر وتاريخ",mp_climate:"قرار تغير المناخ بسببه",mp_ranked:"أثر وأهمية ويقين وأفق لكل بند",mp_outcomes:"مخرج لكل بند أعلى",mp_reviewed:"مراجعة بعد المسح",
 mapT:"مراحل المسح",mpDone:"مكتملة",mpCur:"قيد العمل",mpTodo:"لم تبدأ",
 sHdrT:"بيانات المسح",sHdrS:"المرجع، والعنوان، والنطاق، والمستوى، والقرار أو الخطة التي يخدمها، وتاريخ المسح، والميسّر، والمالك، وموعد المراجعة القادمة، والأحداث التي تستدعي المراجعة قبله، والأداة التي بدأ منها.",
 sTmT:"1 · الفريق",sTmS:"ثلاثة أدوار على الأقل، وواحد على الأقل من خارج الفريق: عميل أو مورد أو مستشار خارجي أو إدارة أخرى.",
 sFaT:"2 · العوامل الستة وبنودها",sFaS:"لكل عامل بنوده: الواقعة أو الاتجاه بصياغة محددة، ومصدرها وتاريخه، وأثرها على المنشأة، وأهميتها، ويقينها، وأفقها الزمني، ومن يتأثر بها. العامل الذي لا شيء فيه ذو صلة يُكتب سببه. ويمكن تعديل اسم العامل أو إضافة عامل يخص سياقكم (ISO 10009:2024، نقاط الانتباه للبند 5.2).",
 sClT:"3 · قرار تغير المناخ",sClS:"تطلب ISO 9001:2026 في البند 4.1 تحديد ما إذا كان تغير المناخ قضية ذات صلة. اكتب القرار وسببه، ولو كان «ليس ذا صلة».",
 sRkT:"4 · الترتيب والعروض",sRkS:"الدرجة = الأهمية × اليقين. البنود العليا: أعلى ست درجات من 6 فأكثر، وعند التساوي الأهمية ثم ترتيب الإدخال. ثم اللوحة، ومصفوفة الأهمية × اليقين، والأفق الزمني، ورسم المصادر.",
 sOuT:"5 · مخرج لكل بند أعلى",sOuS:"كل بند أعلى يذهب إلى مكان: دراسة SWOT فرصةً أو تهديداً (برقم الدراسة)، أو سجل المخاطر، أو خطة المخاطر والفرص 6.1، أو استوديو المخاطر، أو يُستبعد بسبب مكتوب.",
 sAcT:"6 · الإجراءات",sAcS:"ما يجب فعله بسبب البنود: إجراء بمالك وموعد وحالة، ودليل التنفيذ.",
 sRvT:"7 · المراجعة",sRvS:"يؤرخ المسح ويُراجع في موعده وبعد أي حدث كبير (نظام جديد، أزمة، تغير في السوق): ما الذي تغير، وما البنود التي أضيفت أو حذفت.",
 f_title:"عنوان المسح *",f_ref:"المرجع",f_scope:"النطاق",f_level:"المستوى",f_decision:"القرار أو الخطة التي يخدمها المسح",f_date:"تاريخ المسح",f_facil:"الميسّر",f_owner:"المالك",f_revBy:"موعد المراجعة القادمة",f_trig:"أحداث تستدعي المراجعة قبل الموعد",f_src:"بدأ من",f_srcId:"رقم السجل في الأداة المصدر",
 sc_org:"المنشأة",sc_unit:"وحدة أعمال",sc_market:"سوق",sc_project:"مشروع",sc_bid:"عطاء",sc_site:"موقع",
 lv_intl:"دولي",lv_national:"وطني",lv_regional:"إقليمي",lv_local:"محلي",
 src_strat:"PESTLE في استوديو الاستراتيجية",src_swot:"دراسة SWOT",src_none:"مسح جديد",
 tmN:"الاسم أو الوظيفة",tmRole:"الدور في المسح",tmExt:"من خارج الفريق؟",tmAdd:"إضافة عضو",tmNone:"لم يُضف أعضاء بعد.",ex_no:"لا — من الفريق",ex_customer:"عميل",ex_supplier:"مورد",ex_advisor:"مستشار خارجي",ex_dept:"إدارة أخرى",
 tmW3:"الفريق أقل من ثلاثة أدوار.",tmWext:"لا رأي من خارج الفريق: أضف عميلاً أو مورداً أو مستشاراً أو إدارة أخرى.",tmSolo:"مسح يعده شخص واحد يرى ما يعرفه فقط.",tmDel:"حذف السطر",
 gr_p:"سياسي",gr_e:"اقتصادي",gr_s:"اجتماعي",gr_t:"تقني",gr_l:"قانوني",gr_en:"بيئي",gr_x:"عامل إضافي",
 grH_p:"البرامج الحكومية، والسياسات، والإنفاق العام، والاستقرار.",grH_e:"الأسعار، والتمويل، والطلب، والعملة، والتضخم.",grH_s:"القوى العاملة، والسكان، والتوقعات، والثقافة.",grH_t:"التقنيات الجديدة، والأتمتة، والرقمنة، والمعايير التقنية.",grH_l:"الأنظمة واللوائح والأكواد وتواريخ سريانها، والعقود.",grH_en:"الطقس والمناخ، والموارد، والانبعاثات، والاشتراطات البيئية.",grH_x:"عامل يخص سياقكم (مثلاً: التنافسي أو السوقي أو الثقافي).",
 grName:"اسم العامل (يمكن تعديله)",grNr:"لا شيء ذو صلة — السبب",grAdd:"إضافة عامل يخص سياقكم",grDel:"حذف العامل الإضافي",grNoneW:"لم يُدرس هذا العامل: أضف بنداً، أو اكتب لماذا لا شيء فيه ذو صلة.",grMax:"ثلاثة عوامل إضافية على الأكثر.",
 faAdd:"إضافة بند",faDel:"حذف البند",faNone:"لا بنود بعد.",fa_t:"الواقعة أو الاتجاه (محدد: رقم أو نظام أو تاريخ)",fa_so:"المصدر",fa_d:"تاريخ المصدر",fa_eff:"الأثر على المنشأة",fa_sig:"الأهمية 1–5",fa_cer:"اليقين 1–5",fa_hz:"الأفق الزمني",fa_who:"من يتأثر",fa_sid:"رقم السجل المصدر",
 eff_:"— الأثر —",eff_o:"فرصة",eff_t:"تهديد",eff_b:"فرصة وتهديد",hz_:"— الأفق —",hz_s:"قصير (حتى سنة)",hz_m:"متوسط (1–3 سنوات)",hz_lg:"طويل (أكثر من 3 سنوات)",
 genF:"بند عام: ما الرقم أو النظام أو التاريخ الذي يجعله محدداً؟",srcF:"بلا مصدر أو تاريخ: هذا رأي حتى يُعرف مصدره.",topB:"أعلى",scoreL:"الدرجة {s}",unrB:"بلا تقييم",rankL:"الرتبة {n}",
 longW:"القائمة طويلة ({n} بنداً) وفيها بنود بلا تقييم: قيّم واحتفظ بالأهم.",
 clDec:"قرار تغير المناخ",cl_:"— لم يُقرر بعد —",cl_rel:"قضية ذات صلة",cl_not:"ليست قضية ذات صلة",clWhy:"السبب",clW:"قرر صراحة هل تغير المناخ قضية ذات صلة، واكتب السبب.",clWhyW:"اكتب سبب القرار.",
 rkInfo:"الدرجة = الأهمية × اليقين. البنود العليا: أعلى ست درجات من 6 فأكثر.",rkColC:"البند",rkColT:"الواقعة",rkColS:"الأهمية × اليقين",rkColR:"الرتبة",rkNone:"لا بنود مقيّمة بعد.",
 boardT:"اللوحة: العوامل وأعلى بنودها",boardEmpty:"لا بنود",boardNr:"لا شيء ذو صلة: {r}",boardMore:"و{n} غيرها",
 mxT:"مصفوفة الأهمية × اليقين",mxSig:"الأهمية",mxCer:"اليقين",mxNone:"{n} بند بلا تقييم",
 tlnT:"الأفق الزمني",tlnNone:"لا بنود",tlnNo:"بلا أفق",
 chT:"البنود حسب العامل: بمصدر وتاريخ أم بلا مصدر",chEmpty:"لا بنود بعد",chEv:"بمصدر وتاريخ",chOp:"بلا مصدر أو تاريخ",chShare:"{p}% من البنود بمصدر وتاريخ، و{o}% بلا مصدر أو تاريخ",
 ouAdd:"إضافة مخرج",ouNone:"لا مخرجات بعد.",ou_f:"البند",ou_to:"يذهب إلى",ou_q:"في SWOT بوصفه",ou_ref:"المرجع (رقم دراسة SWOT أو السجل)",ou_what:"المدخل",ou_why:"سبب الاستبعاد",ou_who:"المالك",ouPick:"— اختر البند —",ouAuto:"أضف مخرجاً لكل بند أعلى بلا مخرج",ouAutoDone:"أضيفت أسطر للبنود العليا بلا مخرج. اختر الوجهة لكل منها.",
 to_swot:"دراسة SWOT",to_reg:"سجل المخاطر",to_plan:"خطة المخاطر والفرص 6.1",to_iso31000:"استوديو المخاطر ISO 31000",to_aside:"يُستبعد بسبب مكتوب",oq_:"—",oq_o:"فرصة",oq_t:"تهديد",
 ouBadSw:"اكتب رقم دراسة SWOT واختر: فرصة أم تهديد.",ouBadRef:"اكتب المرجع في السجل أو الخطة، أو المدخل.",ouBadIso:"اكتب المدخل الذي سيُسجل في الاستوديو.",ouBadWhy:"اكتب سبب الاستبعاد.",ouBadF:"اختر البند.",
 uncovW:"{n} بند أعلى بلا مخرج: {c}.",noTopW:"لا بند بلغ الدرجة 6 بعد: قيّم الأهمية واليقين.",swOpen:"افتح في SWOT",swMiss:"هذه الدراسة غير موجودة في أداة SWOT على هذا المتصفح.",isoOpen:"افتح استوديو المخاطر",isoNote:"استوديو المخاطر لا يحفظ سجلاً برقم في هذا المتصفح؛ افتحه وأدخل الخطر هناك، واكتب مرجعه هنا.",
 acAdd:"إضافة إجراء",acDel:"حذف الإجراء",acNone:"لا إجراءات بعد.",ac_f:"البند",ac_what:"الإجراء",ac_who:"المسؤول",ac_by:"الموعد",ac_st:"الحالة",ac_done:"تاريخ التنفيذ",ac_ev:"الدليل",acPick:"— بند (اختياري) —",
 as_plan:"مخطط",as_doing:"قيد التنفيذ",as_done:"نُفّذ",ownF:"الإجراء بلا مسؤول أو موعد.",evF:"نُفّذ دون تاريخ أو دليل.",acW:"{n} إجراء بلا مسؤول أو موعد.",
 rvDate:"تاريخ المراجعة",rvTrig:"السبب",rt_periodic:"مراجعة دورية",rt_event:"حدث كبير",rt_mgmt:"مراجعة الإدارة",rt_other:"أخرى",rvChg:"ما الذي تغير",rvAdd:"البنود المضافة",rvRem:"البنود المحذوفة",rvAddBtn:"إضافة مراجعة",rvNone:"لا مراجعة بعد.",rvEarly:"المراجعة مؤرخة قبل تاريخ المسح.",revLateW:"موعد المراجعة ({d}) مضى دون مراجعة.",
 stT:"ابدأ من أداة أخرى (قراءة فقط)",stS:"اختر بنوداً من سجل PESTLE في استوديو الاستراتيجية (بنداً أو السجل كله)، أو بنداً من دراسة SWOT نوع مصدره PESTLE. يُملأ مسح جديد غير محفوظ بالبند ورقمه، ولا يُكتب شيء في الأداة الأخرى. أكمل المصدر والتاريخ واليقين: لا يحملها السجل الأصلي دائماً.",
 stSrc:"المصدر",ss_strat:"PESTLE — استوديو الاستراتيجية",ss_swot:"SWOT — بنود مصدرها PESTLE",stPrev:"اعرض",stUse:"ابدأ مسحاً منه",stAll:"ابدأ مسحاً من السجل كله ({n} بنداً)",stStudy:"كل بنود {id}",stNone:"لا توجد بيانات في هذه الأداة على هذا المتصفح بعد.",stEmpty:"لا توجد سجلات مناسبة بعد.",
 stColId:"الرقم",stColT:"البند",stColG:"العامل",stColInfo:"القراءة بقاعدة الأداة",stColN:"مسوح منه",stColA:"إجراء",
 stUsed:"مُلئ مسح جديد من {s} {id}. أكمل النطاق والفريق والمصدر والتاريخ واليقين، ثم احفظ.",pfT:"PESTLE — ",
 pvPe:"{id} · {f} · {i} · الأهمية {w} · {h}",pvSwI:"{id} · {i} · {q} · الوزن {w} · {t}",pvSw:"{id} · {st} · {n} بند مصدره PESTLE · {t}",
 hmT:"على هذا المتصفح {n} بنداً في استوديو الاستراتيجية ودراسات SWOT يمكن أن يبدأ منها مسح.",hmGo:"اعرضها",
 srcHint:"مسح جديد، أو اختر الأداة التي بدأ منها واكتب رقم السجل؛ تظهر هنا معاينة بقاعدة تلك الأداة.",srcOpen:"افتح المصدر",
 e_title:"اكتب عنوان المسح.",e_date:"تاريخ المراجعة لا يسبق تاريخ المسح.",
 fl_ref:"المرجع أو العنوان ناقص",fl_scope:"القرار أو المستوى ناقص",fl_date:"تاريخ المسح أو الميسّر ناقص",fl_solo:"مسح شخص واحد",fl_team:"أقل من 3 أدوار",fl_ext:"لا رأي من الخارج",fl_nofac:"لا بنود",fl_grp:"{n} عامل لم يُدرس",fl_src:"{n} بند بلا مصدر أو تاريخ",fl_gen:"{n} بند عام بين البنود العليا",fl_genx:"{n} بند عام",fl_clim:"لم يُقرر المناخ",fl_long:"قائمة طويلة بلا تقييم",fl_rate:"{n} بند بلا تقييم كامل",fl_notop:"لا بند أعلى",fl_uncov:"{n} بند أعلى بلا مخرج",fl_own:"{n} إجراء بلا مسؤول أو موعد",fl_ev:"{n} إجراء منفذ بلا دليل",fl_revby:"لا موعد مراجعة",fl_late:"موعد المراجعة مضى",fl_norev:"لم يُراجع بعد",fl_revearly:"مراجعة قبل المسح",fl_trig:"لا أحداث للمراجعة",
 oi_ref:"أكمل المرجع والعنوان.",oi_scope:"حدد القرار أو الخطة التي يخدمها المسح ومستواه.",oi_date:"حدد تاريخ المسح والميسّر.",oi_solo:"مسح شخص واحد: كوّن فريقاً من ثلاثة أدوار على الأقل.",oi_team:"أكمل الفريق إلى ثلاثة أدوار على الأقل.",oi_ext:"أضف رأياً من خارج الفريق (عميل أو مورد أو مستشار أو إدارة أخرى).",oi_nofac:"أضف بنود العوامل الستة.",oi_grp:"ادرس {n} عامل: أضف بنداً أو اكتب لماذا لا شيء فيه ذو صلة.",oi_src:"أضف المصدر والتاريخ لـ {n} بند.",oi_gen:"اكتب {n} بنداً أعلى بصياغة محددة (رقم أو نظام أو تاريخ).",oi_genx:"{n} بند عام: اجعله محدداً أو احذفه.",oi_clim:"قرر هل تغير المناخ قضية ذات صلة، واكتب السبب.",oi_long:"قائمة طويلة: قيّم واحتفظ بالأهم.",oi_rate:"أكمل الأثر والأهمية واليقين والأفق لـ {n} بند.",oi_notop:"لا بند بلغ الدرجة 6: راجع التقييم.",oi_uncov:"حدد مخرجاً لـ {n} بند أعلى (SWOT أو المخاطر أو خطة 6.1 أو الاستبعاد بسبب).",oi_own:"حدد المسؤول والموعد لـ {n} إجراء.",oi_ev:"أضف دليل التنفيذ لـ {n} إجراء.",oi_revby:"حدد موعد المراجعة القادمة.",oi_late:"موعد المراجعة مضى: راجع المسح.",oi_norev:"راجع المسح في موعده أو بعد أي حدث كبير.",oi_revearly:"صحح تاريخ المراجعة.",oi_trig:"اكتب الأحداث التي تستدعي المراجعة قبل موعدها.",
 exT:"بيانات المثال",exS:"ثلاثة مسوح توضيحية لشركة الواحة للمقاولات (شركة سعودية افتراضية): المسح الوطني الذي بُنيت عليه دراسة SWOT لعام 2027 (متطلبات العزل الحراري الجديدة وبدؤها في 2027، وموجات الحر الأطول من سجل الطقس في المواقع، وتقلب أسعار الحديد؛ قُرر أن تغير المناخ ذو صلة؛ دخلت البنود في فرص SW-EX-01 وتهديداتها؛ روجع)، ومسح إقليمي لعطاء مستشفى حكومي (برنامج المستشفيات، وتكلفة التمويل؛ إلى SW-EX-02 ومدخل مخاطر العطاء)، ومسح موقع البرج ج (توفر العمالة، وأنظمة مراقبة الحمل، واشتراطات الرفع؛ مخرجات مخططة ولم يُراجع بعد). ليست بيانات حقيقية.",exLoad:"تحميل المثال",exClear:"مسح كل البيانات",exLoaded:"تم تحميل المثال.",exCleared:"تم مسح كل البيانات.",exConfirmClear:"سيُحذف كل ما حُفظ في أداة PESTLE على هذا المتصفح (المسوح والتقييم الذاتي). هل تريد المتابعة؟",
 dT:"السجلات",dS:"كل المسوح المحفوظة على هذا المتصفح. افتح مسحاً لتعديله، أو احذفه بضغطتين.",csv:"تصدير CSV",none:"لا توجد مسوح بعد.",open:"فتح",del:"حذف",delArm:"اضغط مرة أخرى للحذف",
 colRef:"المسح",colScope:"النطاق · المستوى · القرار",colStage:"المرحلة",colFac:"البنود",colTop:"البنود العليا بمصدر",colOut:"المخرجات · الإجراءات",colFlags:"تنبيهات",colAct:"إجراءات",facN:"{n} بنداً · {g} عوامل",
 auT:"التدقيق الآلي",auS:"عشرة فحوص لكل مسح. «—» تعني أن الفحص لا ينطبق بعد على مرحلة المسح.",auEmpty:"لا توجد مسوح لتدقيقها.",auRec:"المسوح",auPass:"نسبة الفحوص الناجحة",auFail:"مسوح فيها فحص راسب",auOpen:"بنود مفتوحة",
 k_ref:"المرجع والنطاق والغرض",k_team:"فريق ورأي خارجي",k_groups:"العوامل الستة مدروسة",k_src:"مصدر وتاريخ للبنود العليا",k_gen:"لا بند عام بين العليا",k_clim:"قرار تغير المناخ",k_rank:"الترتيب",k_outs:"مخرج لكل بند أعلى",k_acts:"إجراء بمالك وموعد",k_review:"موعد المراجعة والالتزام به",
 dashT:"لوحة المؤشرات",dashS:"تُحسب من المسوح والتقييم الذاتي المحفوظة على هذا المتصفح.",kTotal:"المسوح",kSrc:"البنود العليا بمصدر وتاريخ",kOut:"البنود العليا التي لها مخرج",kRev:"مسوح روجعت",kGen:"بنود عامة",kFac:"البنود",kOpen:"بنود مفتوحة",kAud:"نجاح التدقيق",kAs:"التقييم الذاتي",
 byStage:"المسوح حسب المرحلة",byScope:"المسوح حسب النطاق",byGrp:"البنود حسب العامل",byTo:"مخرجات البنود العليا حسب الوجهة",byAssess:"التقييم الذاتي حسب المحور",openT:"بنود تحتاج متابعة",noData:"لا توجد بيانات بعد.",noOpen:"لا بنود مفتوحة.",
 rpT:"التقرير",rpS:"تقرير HTML جاهز للطباعة أو الحفظ PDF، وملف CSV للبنود والمخرجات والإجراءات.",rpHtml:"تنزيل تقرير HTML",rpNote:"التقرير يضم الغلاف والملخص وكل مسح بلوحته ومصفوفته وأفقه الزمني وبنوده العليا ومخرجاتها والإجراءات والمراجعة، ثم نتائج التدقيق والبنود المفتوحة والتقييم الذاتي.",rpPrev:"معاينة سريعة",rpEmpty:"لا توجد بيانات للتقرير بعد.",
 rpCover:"مسوح PESTLE — من البيئة الخارجية إلى القرار",rpReg:"المسوح",rpTeam:"الفريق",rpBoard:"اللوحة",rpMx:"مصفوفة الأهمية × اليقين",rpTl:"الأفق الزمني",rpFac:"البنود",rpTop:"البنود العليا",rpClim:"قرار تغير المناخ",rpOut:"مخرجات البنود العليا",rpActs:"الإجراءات",rpRev:"المراجعات",rpAu:"نتيجة التدقيق",
 aiT:"المساعد الذكي — قيد الإنشاء",aiS:"سيقرأ المساعد المسوح وينبّه إلى البنود العامة والعوامل التي لم تُدرس، ولن يكتب البنود بدلاً من الفريق.",aiList:["ينبّه إلى البنود العامة وغير المؤرخة","يقترح أسئلة لكل عامل لم يُدرس","يذكّر بالمراجعة بعد الأحداث الكبرى"],
 nxMiss:"هذا الرقم غير موجود في الأداة الأخرى على هذا المتصفح.",nxNoData:"لا توجد بيانات في هذه الأداة على هذا المتصفح بعد.",
 yes:"نعم",no:"لا",langNote:""},
en:{brand:"Continual Improvement Academy · مدثر سلامه",toolName:"PESTLE tool — scanning the outside world",sgLearn:"Learn",sgWork:"Work",sgOut:"Outputs",
 nHome:"Home",nStd:"Method guide",nCl:"Clause guide",nAssess:"Self-assessment",nTools:"PESTLE scans",nDocs:"Records",nAudit:"Audit",nDash:"Dashboard",nReport:"Report",nAi:"AI Assistant",soon:"Soon",
 homeCode:"Scope · team · fact and source · climate · ranking · outcome · review",homeH1:"PESTLE analysis",
 homeLede:"A scan of the outside world that serves a named decision or plan: a team with outside input, six factors (political, economic, social, technological, legal and environmental), each item a specific fact with its source, its date and its effect on the organization, then an explicit climate change decision, then a ranking by significance × certainty, then every top item goes into SWOT, the risk register or the 6.1 plan, or is set aside with a reason, then a review on a set date and after major events.",
 homeNote:"This version keeps scans in your browser only. Server storage and sign-in come with the shared platform stage.",
 prep:"Prepared by",authorName:"مدثر سلامه",cycleT:"What you can do here",cycleS:"Read the method guide, assess your PESTLE practice, then start a scan — new, from the Strategy Studio's PESTLE register, or from the PESTLE items of a SWOT study.",
 tStd:"When a PESTLE is useful: scope and decision, the team, specific items with a source and a date, effect and significance, certainty and horizon, climate change, ranking, outcomes into SWOT and risks, the review, the common gaps and what an auditor asks for.",tCl:"The ISO 9001:2026 clauses the scan serves: context 4.1 with its notes, Annex A.4.1, interested parties 4.2, risks and opportunities 6.1.1, 6.1.2 and 6.1.3 and management review inputs 9.3.2, with the ISO 9000:2026 terms and ISO 10009:2024 5.1, 5.2 and 5.3: an interpretive summary, an example and what the auditor asks for.",tAssess:"Twelve questions on your PESTLE practice, from forming the team to communicating the result.",
 tTools:"One scan per decision: scope and level, the team, the six factors with specific items and their sources, the climate change decision, the ranking, an outcome for every top item, actions and the review, with the board, the significance × certainty matrix, the time horizon and a chart of sources.",tDocs:"Every scan with its stage, scope and flags, and the example data.",tAudit:"An automatic check of each scan: reference and purpose, the team, the six factors, sources and dates, generic items, climate change, ranking, outcomes, actions and the review.",
 tDash:"Top items with a source and a date, top items with an outcome, scans reviewed, a chart of items by factor, open items and the self-assessment.",tReport:"An HTML report with each scan, its board, matrix, top items, their outcomes, actions and review, the audit results, open items and the self-assessment, and a CSV file.",tAi:"An assistant that reads the scans and flags generic items and factors not yet looked at. Not active yet.",
 foot:"Sources: ISO 9001:2026 clauses 4.1, 4.2, 6.1.1, 6.1.2, 6.1.3 and 9.3.2 and Annex A.4.1; ISO 9000:2026 3.1.2, 3.7.2 and 4.4.1; ISO 10009:2024 5.1, 5.2, 5.3 and 7.2 and Annexes A and C (interpretive summaries, not the official text). PESTLE is a technique, not a requirement of any standard. Examples are illustrative, not real data.",
 heroTag:"Method tool · scanning the outside world",langSw:"العربية",langSwA:"التبديل إلى العربية",logoAlt:"Continual Improvement Academy — مدثر سلامه",
 related:"Related tools in the academy",rel_str:"Strategy & Performance Studio (PESTLE register)",rel_swot:"SWOT analysis — from the grid to decisions",rel_iso10009:"ISO 10009 quality tools guide (5.2)",rel_lessons:"Lessons learned register",rel_iso31000:"ISO 31000 Risk Studio",rel_fmea:"FMEA — failure mode and effects analysis",rel_pareto:"Pareto — vital few analysis",rel_rca:"Root cause analysis — investigation",rel_a3:"A3 problem solving",rel_pdca:"PDCA cycle",
 termT:"Is a PESTLE analysis a requirement of ISO 9001:2026?",
 termP1:"No. PESTLE is a technique, not a requirement of any standard. ISO 9001:2026 clause 4.1 asks the organization to determine the external and internal issues relevant to its purpose and strategic direction, to determine whether climate change is a relevant issue, and to monitor and review information about these issues; its NOTE 2 lists legal, technological, competitive, market, cultural, political, social, economic and environmental issues at the international, national, regional or local level. It then asks to consider them when determining risks and opportunities (6.1.1) and to review their changes at management review (9.3.2 b)). ISO 10009:2024 reviews PESTLE in 5.2. A PESTLE done well is a structured way to meet the external side of those requirements.",
 termP2:"The rule here: a PESTLE is useful only when its items are specific, sourced and dated and lead to something. An item is an external fact or trend: a regulation and its effective date, a published figure, a forecast with its author — not an opinion. Each item names its effect on the organization (an opportunity, a threat or both), its significance, its certainty and its time horizon. A generic item such as \"the economy is uncertain\" is flagged. A long unranked list is a gap: rank by significance × certainty and keep the most important. Climate change is decided explicitly: relevant or not, and why.",
 termP3:"Every top item goes somewhere: into SWOT as an opportunity or a threat, into the risk register or the 6.1 plan, or it is set aside with a written reason. The scan is dated and reviewed periodically and after major events, as ISO 10009:2024 notes for 5.2. PESTLE feeds SWOT and Porter's forces rather than replacing them: the tool reads the Strategy Studio's PESTLE register and the SWOT studies read-only.",
 termIs:"Interpretive summary in independent wording, not the official text. Sources: ISO 9001:2026 clauses 4.1 (with its three notes), 4.2, 6.1.1, 6.1.2, 6.1.3 and 9.3.2 and Annex A.4.1 (the uploaded official file, read with pdftotext); ISO 9000:2026 3.1.2, 3.7.2 and 4.4.1 (scanned, read with OCR); ISO 10009:2024 5.1, 5.2, 5.3 and 7.2, Table A.1 and Table C.1 (the official file, uploaded in this step). Any PESTLE or PESTEL textbook, scenario-planning and horizon-scanning methods, and ISO 31000: \"not verified\". Checked: 2026-10-17.",
 defs:[["Scope and decision","Why we scan","The organization, a business unit, a market, a project, a bid or a site, the level (international, national, regional or local), and the decision or plan the scan serves.","#7A869E"],["Fact and source","Specific · dated","An item is an external fact or trend with a source and a date: a regulation and its effective date, a published figure, a forecast with its author. A generic item is flagged.","#3563C9"],["Effect and ranking","Significance × certainty","Each item names its effect (opportunity, threat or both), its significance, certainty and horizon. The score sets the top items.","#1B2A4A"],["Climate change","An explicit decision","Relevant or not, with the reason. ISO 9001:2026 clause 4.1 asks for this decision.","#2F7D4B"],["Outcome and review","SWOT · risks · review","Every top item into SWOT, the risk register or the 6.1 plan, or set aside with a reason, then a periodic review and one after major events.","#C9821A"]],
 asT:"Self-assessment of PESTLE practice",asS:"Answer each question with what actually happens in your organization. The score measures current practice; it is not a certificate or a judgement of performance.",asReset:"Clear answers",asSaved:"Answer saved",asAnswered:"{n} of 12 answered",
 band0:"Needs work",band1:"Developing",band2:"Established",bandNote:"Internal self-assessment bands designed for this tool, not an official benchmark.",as0:"Not in place",as1:"Partly",as2:"In place and applied",
 g_IN:"Team and items",g_EV:"Effect, rating and ranking",g_OU:"Climate and outcomes",g_RV:"Review and communication",
 tlT:"PESTLE scan",tlS:"One scan per decision or plan: scope and level, the team, the six factors with specific items, the climate change decision, the ranking, an outcome for every top item, actions and the review. The stage is set from what you fill in.",
 save:"Save scan",newRec:"New scan",savedFail:"Could not save in this browser. Download the report before closing the page.",cur:"Current stage:",ok_rec:"Scan saved",
 st_draft:"Draft",st_scoped:"Scoped",st_team:"Team complete",st_sourced:"Items with sources",st_climate:"Climate decided",st_ranked:"Ranked",st_outcomes:"Outcomes",st_reviewed:"Reviewed",
 mp_scoped:"Scope, level, decision and date",mp_team:"3 roles and outside input",mp_sourced:"Six factors looked at, every item sourced and dated",mp_climate:"Climate change decided, with the reason",mp_ranked:"Effect, significance, certainty and horizon for every item",mp_outcomes:"An outcome for every top item",mp_reviewed:"A review after the scan",
 mapT:"Scan stages",mpDone:"Complete",mpCur:"In progress",mpTodo:"Not started",
 sHdrT:"Scan details",sHdrS:"Reference, title, scope, level, the decision or plan it serves, date of the scan, facilitator, owner, the next review date, the events that call for a review before it, and the tool it was started from.",
 sTmT:"1 · The team",sTmS:"At least three roles, and at least one input from outside the team: a customer, a supplier, an external advisor or another department.",
 sFaT:"2 · The six factors and their items",sFaS:"Each factor gets its items: the fact or trend in specific words, its source and date, its effect on the organization, its significance, its certainty, its time horizon and who is affected. A factor with nothing relevant gets the reason written. A factor's name can be adjusted, or a factor added for your context (ISO 10009:2024, points to note for 5.2).",
 sClT:"3 · The climate change decision",sClS:"ISO 9001:2026 clause 4.1 asks to determine whether climate change is a relevant issue. Write the decision and its reason, even when it is \"not relevant\".",
 sRkT:"4 · Ranking and views",sRkS:"Score = significance × certainty. The top items are the six highest scores of 6 or more; ties go by significance, then by order of entry. Then the board, the significance × certainty matrix, the time horizon and the chart of sources.",
 sOuT:"5 · An outcome for every top item",sOuS:"Every top item goes somewhere: into a SWOT study as an opportunity or a threat (by its study id), the risk register, the risks and opportunities plan 6.1 or the Risk Studio — or it is set aside with a written reason.",
 sAcT:"6 · Actions",sAcS:"What must be done because of the items: an action with an owner, a due date and a status, and the evidence it was done.",
 sRvT:"7 · Review",sRvS:"The scan is dated and reviewed on its date and after any major event (a new regulation, a crisis, a market shift): what changed, and which items were added or removed.",
 f_title:"Scan title *",f_ref:"Reference",f_scope:"Scope",f_level:"Level",f_decision:"The decision or plan the scan serves",f_date:"Date of the scan",f_facil:"Facilitator",f_owner:"Owner",f_revBy:"Next review date",f_trig:"Events that call for a review before that date",f_src:"Started from",f_srcId:"Record id in the source tool",
 sc_org:"Organization",sc_unit:"Business unit",sc_market:"Market",sc_project:"Project",sc_bid:"Bid",sc_site:"Site",
 lv_intl:"International",lv_national:"National",lv_regional:"Regional",lv_local:"Local",
 src_strat:"Strategy Studio PESTLE",src_swot:"SWOT study",src_none:"New scan",
 tmN:"Name or function",tmRole:"Role in the scan",tmExt:"From outside the team?",tmAdd:"Add member",tmNone:"No members yet.",ex_no:"No — team member",ex_customer:"Customer",ex_supplier:"Supplier",ex_advisor:"External advisor",ex_dept:"Another department",
 tmW3:"The team has fewer than three roles.",tmWext:"No input from outside the team: add a customer, a supplier, an advisor or another department.",tmSolo:"A scan by one person sees only what that person knows.",tmDel:"Delete row",
 gr_p:"Political",gr_e:"Economic",gr_s:"Social",gr_t:"Technological",gr_l:"Legal",gr_en:"Environmental",gr_x:"Added factor",
 grH_p:"Government programmes, policies, public spending, stability.",grH_e:"Prices, financing, demand, currency, inflation.",grH_s:"Workforce, population, expectations, culture.",grH_t:"New technologies, automation, digitalisation, technical standards.",grH_l:"Laws, regulations and codes with their effective dates; contracts.",grH_en:"Weather and climate, resources, emissions, environmental conditions.",grH_x:"A factor for your context (for example competitive, market or cultural).",
 grName:"Factor name (can be adjusted)",grNr:"Nothing relevant — the reason",grAdd:"Add a factor for your context",grDel:"Delete the added factor",grNoneW:"This factor has not been looked at: add an item, or write why nothing in it is relevant.",grMax:"Three added factors at most.",
 faAdd:"Add item",faDel:"Delete item",faNone:"No items yet.",fa_t:"The fact or trend (specific: a figure, a regulation or a date)",fa_so:"Source",fa_d:"Source date",fa_eff:"Effect on the organization",fa_sig:"Significance 1–5",fa_cer:"Certainty 1–5",fa_hz:"Time horizon",fa_who:"Who is affected",fa_sid:"Source record id",
 eff_:"— effect —",eff_o:"Opportunity",eff_t:"Threat",eff_b:"Opportunity and threat",hz_:"— horizon —",hz_s:"Short (up to a year)",hz_m:"Medium (1–3 years)",hz_lg:"Long (over 3 years)",
 genF:"Generic item: what figure, regulation or date makes it specific?",srcF:"No source or date: this is an opinion until its source is known.",topB:"Top",scoreL:"Score {s}",unrB:"Not rated",rankL:"Rank {n}",
 longW:"The list is long ({n} items) and some are not rated: rate them and keep the most important.",
 clDec:"Climate change decision",cl_:"— not decided yet —",cl_rel:"A relevant issue",cl_not:"Not a relevant issue",clWhy:"Reason",clW:"Decide explicitly whether climate change is a relevant issue, and write the reason.",clWhyW:"Write the reason for the decision.",
 rkInfo:"Score = significance × certainty. Top items: the six highest scores of 6 or more.",rkColC:"Item",rkColT:"Fact",rkColS:"Significance × certainty",rkColR:"Rank",rkNone:"No rated items yet.",
 boardT:"The board: factors and their top items",boardEmpty:"No items",boardNr:"Nothing relevant: {r}",boardMore:"and {n} more",
 mxT:"Significance × certainty matrix",mxSig:"Significance",mxCer:"Certainty",mxNone:"{n} item(s) not rated",
 tlnT:"Time horizon",tlnNone:"No items",tlnNo:"No horizon",
 chT:"Items by factor: with a source and a date, or without",chEmpty:"No items yet",chEv:"With a source and a date",chOp:"No source or date",chShare:"{p}% of items have a source and a date, {o}% have none",
 ouAdd:"Add outcome",ouNone:"No outcomes yet.",ou_f:"Item",ou_to:"Goes to",ou_q:"In SWOT as",ou_ref:"Reference (SWOT study id or register id)",ou_what:"Entry",ou_why:"Reason it is set aside",ou_who:"Owner",ouPick:"— pick the item —",ouAuto:"Add an outcome row for each top item with none",ouAutoDone:"Rows added for the top items with no outcome. Pick the destination of each.",
 to_swot:"SWOT study",to_reg:"Risk register",to_plan:"Risks and opportunities plan 6.1",to_iso31000:"ISO 31000 Risk Studio",to_aside:"Set aside with a reason",oq_:"—",oq_o:"Opportunity",oq_t:"Threat",
 ouBadSw:"Enter the SWOT study id and choose: opportunity or threat.",ouBadRef:"Enter the reference in the register or plan, or the entry.",ouBadIso:"Enter the entry to record in the Risk Studio.",ouBadWhy:"Write why it is set aside.",ouBadF:"Pick the item.",
 uncovW:"{n} top item(s) with no outcome: {c}.",noTopW:"No item has reached a score of 6 yet: rate significance and certainty.",swOpen:"Open in SWOT",swMiss:"This study is not in the SWOT tool in this browser.",isoOpen:"Open the Risk Studio",isoNote:"The Risk Studio keeps no register by record id in this browser; open it, enter the risk there, and write its reference here.",
 acAdd:"Add action",acDel:"Delete action",acNone:"No actions yet.",ac_f:"Item",ac_what:"Action",ac_who:"Owner",ac_by:"Due",ac_st:"Status",ac_done:"Date done",ac_ev:"Evidence",acPick:"— item (optional) —",
 as_plan:"Planned",as_doing:"In progress",as_done:"Done",ownF:"The action has no owner or due date.",evF:"Done with no date or evidence.",acW:"{n} action(s) with no owner or due date.",
 rvDate:"Review date",rvTrig:"Reason",rt_periodic:"Periodic review",rt_event:"Major event",rt_mgmt:"Management review",rt_other:"Other",rvChg:"What changed",rvAdd:"Items added",rvRem:"Items removed",rvAddBtn:"Add review",rvNone:"No review yet.",rvEarly:"The review is dated before the scan.",revLateW:"The review date ({d}) has passed with no review.",
 stT:"Start from another tool (read-only)",stS:"Pick items from the Strategy Studio's PESTLE register (one item or the whole register), or an item of a SWOT study whose source type is PESTLE. A new, unsaved scan is filled with the item and its id; nothing is written to the other tool. Complete the source, the date and the certainty: the original record does not always carry them.",
 stSrc:"Source",ss_strat:"PESTLE — Strategy Studio",ss_swot:"SWOT — items from PESTLE",stPrev:"Show",stUse:"Start a scan from it",stAll:"Start a scan from the whole register ({n} items)",stStudy:"All items of {id}",stNone:"No data in that tool in this browser yet.",stEmpty:"No suitable records yet.",
 stColId:"Id",stColT:"Item",stColG:"Factor",stColInfo:"Read by that tool's rule",stColN:"Scans from it",stColA:"Action",
 stUsed:"A new scan was filled from {s} {id}. Complete the scope, the team, the sources, the dates and the certainty, then save.",pfT:"PESTLE — ",
 pvPe:"{id} · {f} · {i} · significance {w} · {h}",pvSwI:"{id} · {i} · {q} · weight {w} · {t}",pvSw:"{id} · {st} · {n} item(s) from PESTLE · {t}",
 hmT:"In this browser {n} item(s) in the Strategy Studio and SWOT studies can start a scan.",hmGo:"Show them",
 srcHint:"A new scan, or pick the tool it was started from and enter the record id; a preview by that tool's own rule shows here.",srcOpen:"Open the source",
 e_title:"Enter the scan title.",e_date:"A review date cannot be before the date of the scan.",
 fl_ref:"Reference or title missing",fl_scope:"Decision or level missing",fl_date:"Date or facilitator missing",fl_solo:"One person's scan",fl_team:"Fewer than 3 roles",fl_ext:"No outside input",fl_nofac:"No items",fl_grp:"{n} factor(s) not looked at",fl_src:"{n} item(s) with no source or date",fl_gen:"{n} generic item(s) among the top",fl_genx:"{n} generic item(s)",fl_clim:"Climate not decided",fl_long:"Long list not rated",fl_rate:"{n} item(s) not fully rated",fl_notop:"No top item",fl_uncov:"{n} top item(s) with no outcome",fl_own:"{n} action(s) with no owner or date",fl_ev:"{n} done action(s) with no evidence",fl_revby:"No review date",fl_late:"Review date passed",fl_norev:"Not reviewed yet",fl_revearly:"Review before the scan",fl_trig:"No review triggers",
 oi_ref:"Complete the reference and the title.",oi_scope:"Set the decision or plan the scan serves, and its level.",oi_date:"Set the date of the scan and the facilitator.",oi_solo:"One person's scan: form a team of at least three roles.",oi_team:"Complete the team to at least three roles.",oi_ext:"Add input from outside the team (a customer, a supplier, an advisor or another department).",oi_nofac:"Add the items of the six factors.",oi_grp:"Look at {n} factor(s): add an item or write why nothing in it is relevant.",oi_src:"Add the source and date of {n} item(s).",oi_gen:"Write {n} top item(s) in specific words (a figure, a regulation or a date).",oi_genx:"{n} generic item(s): make them specific or drop them.",oi_clim:"Decide whether climate change is a relevant issue, and write the reason.",oi_long:"Long list: rate it and keep the most important.",oi_rate:"Complete the effect, significance, certainty and horizon of {n} item(s).",oi_notop:"No item reaches a score of 6: check the ratings.",oi_uncov:"Set an outcome for {n} top item(s) (SWOT, risks, the 6.1 plan, or set aside with a reason).",oi_own:"Name the owner and due date of {n} action(s).",oi_ev:"Add the evidence for {n} done action(s).",oi_revby:"Set the next review date.",oi_late:"The review date has passed: review the scan.",oi_norev:"Review the scan on its date or after any major event.",oi_revearly:"Correct the review date.",oi_trig:"Write the events that call for a review before its date.",
 exT:"Example data",exS:"Three illustrative scans for Al-Waha Contracting (a fictitious Saudi company): the national scan behind the 2027 SWOT study (the new thermal insulation requirements and their 2027 start, longer heatwaves from the site weather log, steel price volatility; climate change decided relevant; carried into the opportunities and threats of SW-EX-01; reviewed), a regional scan for a public hospital bid (the health programme, the cost of finance; into SW-EX-02 and the bid risk entry), and a site scan for Tower C (workforce availability, load-monitoring retrofits, lifting regulations; outcomes planned, not reviewed yet). Not real data.",exLoad:"Load example",exClear:"Clear all data",exLoaded:"Example loaded.",exCleared:"All data cleared.",exConfirmClear:"Everything saved in the PESTLE tool in this browser (scans and self-assessment) will be deleted. Continue?",
 dT:"Records",dS:"Every scan saved in this browser. Open a scan to edit it, or delete it with two clicks.",csv:"Export CSV",none:"No scans yet.",open:"Open",del:"Delete",delArm:"Click again to delete",
 colRef:"Scan",colScope:"Scope · level · decision",colStage:"Stage",colFac:"Items",colTop:"Top items with a source",colOut:"Outcomes · actions",colFlags:"Flags",colAct:"Actions",facN:"{n} items · {g} factors",
 auT:"Automatic audit",auS:"Ten checks on each scan. \"—\" means the check does not apply yet at the scan's stage.",auEmpty:"No scans to audit.",auRec:"Scans",auPass:"Checks passed",auFail:"Scans with a failed check",auOpen:"Open items",
 k_ref:"Reference, scope and purpose",k_team:"Team with outside input",k_groups:"All six factors looked at",k_src:"Source and date on the top items",k_gen:"No generic item among the top",k_clim:"Climate change decided",k_rank:"Ranking",k_outs:"An outcome for every top item",k_acts:"Actions with owner and date",k_review:"Review date set and kept",
 dashT:"Dashboard",dashS:"Computed from the scans and the self-assessment saved in this browser.",kTotal:"Scans",kSrc:"Top items with a source and a date",kOut:"Top items with an outcome",kRev:"Scans reviewed",kGen:"Generic items",kFac:"Items",kOpen:"Open items",kAud:"Audit pass",kAs:"Self-assessment",
 byStage:"Scans by stage",byScope:"Scans by scope",byGrp:"Items by factor",byTo:"Outcomes of the top items by destination",byAssess:"Self-assessment by area",openT:"Items to follow up",noData:"No data yet.",noOpen:"No open items.",
 rpT:"Report",rpS:"An HTML report ready to print or save as PDF, and a CSV file of the items, outcomes and actions.",rpHtml:"Download HTML report",rpNote:"The report has the cover, the summary, each scan with its board, matrix, time horizon, top items, their outcomes, actions and review, then the audit results, the open items and the self-assessment.",rpPrev:"Quick preview",rpEmpty:"No data for the report yet.",
 rpCover:"PESTLE scans — from the outside world to decisions",rpReg:"The scans",rpTeam:"Team",rpBoard:"The board",rpMx:"Significance × certainty matrix",rpTl:"Time horizon",rpFac:"Items",rpTop:"Top items",rpClim:"Climate change decision",rpOut:"Outcomes of the top items",rpActs:"Actions",rpRev:"Reviews",rpAu:"Audit result",
 aiT:"AI Assistant — under construction",aiS:"The assistant will read the scans and flag generic items and factors not yet looked at; it will not write the items on the team's behalf.",aiList:["Flags generic and undated items","Suggests questions for every factor not yet looked at","Reminds you to review after major events"],
 nxMiss:"This id is not in the other tool in this browser.",nxNoData:"No data in that tool in this browser yet.",
 yes:"Yes",no:"No",langNote:""}
};
/* the SWOT tool's stage names (copied at build time from tests/build/swot_host.js) */
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

/* ---------- records ---------- */
function blankTm(){ return {n:"",role:"",ext:"no"}; }
function blankFa(id,g){ return {id:id||"",g:g||"p",t:"",so:"",d:"",eff:"",sig:null,cer:null,hz:"",who:"",sid:""}; }
function blankOu(id,f){ return {id:id||"",f:f||"",to:"swot",q:"",ref:"",what:"",why:"",who:""}; }
function blankAc(id){ return {id:id||"",f:"",what:"",who:"",by:"",st:"plan",done:"",ev:""}; }
function blankRv(){ return {id:"",date:"",trig:"periodic",chg:"",add:"",rem:""}; }
function baseGrp(){ return BASEG.map(function(k){ return {k:k,n:"",nr:""}; }); }
function blank(){ return {id:"",ref:"",title:"",scope:"org",decision:"",level:"national",date:"",facil:"",owner:"",revBy:"",trig:"",src:"none",srcId:"",
 team:[],grp:baseGrp(),fac:[],clim:{dec:"",why:""},outs:[],acts:[],revs:[],created:"",updated:""}; }
function wt(v){ var n=parseInt(v,10); return (n>=1&&n<=5)?n:null; }
function fixTm(x){ return {n:str(x.n),role:str(x.role),ext:pick(x.ext,EXTS)||"no"}; }
function fixFa(x){ return {id:str(x.id),g:pick(x.g,ALLG)||"p",t:str(x.t),so:str(x.so),d:str(x.d),eff:pick(x.eff,EFFS),sig:wt(x.sig),cer:wt(x.cer),hz:pick(x.hz,HZS),who:str(x.who),sid:str(x.sid)}; }
function fixOu(x){ return {id:str(x.id),f:str(x.f),to:pick(x.to,TOS)||"swot",q:pick(x.q,OQS),ref:str(x.ref),what:str(x.what),why:str(x.why),who:str(x.who)}; }
function fixAc(x){ return {id:str(x.id),f:str(x.f),what:str(x.what),who:str(x.who),by:str(x.by),st:pick(x.st,ASTS)||"plan",done:str(x.done),ev:str(x.ev)}; }
function fixRv(x){ return {id:str(x.id),date:str(x.date),trig:pick(x.trig,RTRIG)||"periodic",chg:str(x.chg),add:str(x.add),rem:str(x.rem)}; }
/* the six PESTLE factors always, in their order, with an adjusted name or a "nothing relevant" reason; then up to three added factors that have
   a name or items */
function fixGrp(list,fac){
 var by={}; arr(list).forEach(function(g){ var k=pick(g.k,ALLG); if(k&&!by[k]) by[k]={k:k,n:str(g.n),nr:str(g.nr)}; });
 var out=BASEG.map(function(k){ return by[k]||{k:k,n:"",nr:""}; });
 XG.forEach(function(k){ var used=fac.some(function(f){ return f.g===k; }); if(by[k]||used) out.push(by[k]||{k:k,n:"",nr:""}); });
 return out;
}
function ids(list,pre){ var used={}, n=0, re=new RegExp("^"+pre+"(\\d+)$");
 list.forEach(function(c){ var m=re.exec(c.id); if(m&&!used[c.id]){ used[c.id]=1; n=Math.max(n,+m[1]); } else c.id=""; });
 list.forEach(function(c){ if(!c.id){ n++; c.id=pre+n; used[c.id]=1; } }); }
/* a scan saved with missing or broken parts gets empty ones, so rendering never throws; every item, outcome, action and review gets an id,
   and an outcome or an action never points to an item that is gone */
function fixRec(r){
 ["id","ref","title","scope","decision","level","date","facil","owner","revBy","trig","src","srcId","created","updated"].forEach(function(k){ r[k]=str(r[k]); });
 if(SCOPES.indexOf(r.scope)<0) r.scope="org"; if(LEVELS.indexOf(r.level)<0) r.level=""; if(SRCS.indexOf(r.src)<0) r.src="none";
 r.team=arr(r.team).map(fixTm).slice(0,MAXTEAM);
 r.fac=arr(r.fac).map(fixFa).slice(0,MAXFAC); ids(r.fac,"f");
 r.grp=fixGrp(r.grp,r.fac);
 var c=obj(r.clim); r.clim={dec:pick(c.dec,CLIMS),why:str(c.why)};
 var have={}; r.fac.forEach(function(f){ have[f.id]=1; });
 r.outs=arr(r.outs).map(fixOu).slice(0,MAXOUTS); ids(r.outs,"o"); r.outs.forEach(function(o){ if(!have[o.f]) o.f=""; });
 r.acts=arr(r.acts).map(fixAc).slice(0,MAXACTS); ids(r.acts,"a"); r.acts.forEach(function(a){ if(!have[a.f]) a.f=""; });
 r.revs=arr(r.revs).map(fixRv).slice(0,MAXREV); ids(r.revs,"v");
 return r;
}
function load(){ return TBX.load(STORE,function(v){ if(!Array.isArray(v.records)) v.records=[]; v.records=v.records.filter(function(r){ return r&&typeof r==="object"; }); v.records.forEach(fixRec); if(!v.assess||typeof v.assess!=="object") v.assess={}; return v; },function(){ return {records:[],assess:{}}; }); }
function persist(){ return TBX.save(STORE,DB); }

/* ---------- the scan's rules ---------- */
function facs(r){ return r.fac.filter(function(f){ return txt(f.t); }); }
function inG(r,k){ return facs(r).filter(function(f){ return f.g===k; }); }
function grpOf(r,k){ return r.grp.filter(function(g){ return g.k===k; })[0]||{k:k,n:"",nr:""}; }
function gName(r,k,lang){ var g=grpOf(r,k); if(txt(g.n)) return txt(g.n); var d=UI[lang||L]||UI.ar; return XG.indexOf(k)>=0?d.gr_x+" "+(XG.indexOf(k)+1):d["gr_"+k]; }
/* a factor is looked at when it has an item, or when the reason nothing in it is relevant is written */
function considered(r,k){ return inG(r,k).length>0||!!txt(grpOf(r,k).nr); }
function notConsidered(r){ return BASEG.filter(function(k){ return !considered(r,k); }); }
/* an item is sourced when it names its source and the source's date */
function srcOk(f){ return !!txt(f.so)&&isD(f.d); }
/* a generic item: no figure, regulation number or date in it, and either a stock phrase or fewer than four words */
var GEN=/(uncertain|uncertainty|unstable|instability|volatil|fluctuat|changing|competition is|economic (conditions|situation)|the economy|market conditions|غير مستقر|عدم ال?يقين|عدم ال?استقرار|متغير|تقلب|تذبذب|الظروف الاقتصادية|الوضع الاقتصادي|المنافسة|تغيرات)/i;
function hasFig(s){ return /[0-9٠-٩]/.test(String(s||"")); }
function genOf(f){ var s=txt(f.t); if(!s||hasFig(s)) return false; return GEN.test(s)||s.split(/\s+/).length<4; }
function rated(f){ return !!(f.sig&&f.cer&&f.eff&&f.hz); }
function score(f){ return (f.sig&&f.cer)?f.sig*f.cer:0; }
/* the order: score first, then significance, then the order of entry */
function order(list){ return list.map(function(x,k){ return [x,k]; }).sort(function(a,b){ var d=score(b[0])-score(a[0]); if(d) return d; d=(b[0].sig||0)-(a[0].sig||0); return d||(a[1]-b[1]); }).map(function(x){ return x[0]; }); }
function rankedF(r){ return order(facs(r).filter(function(f){ return score(f)>0; })); }
function topList(r){ return rankedF(r).filter(function(f){ return score(f)>=TOPMIN; }).slice(0,TOPN); }
function isTop(r,f){ return topList(r).indexOf(f)>=0; }
function rankOf(r,f){ return rankedF(r).indexOf(f)+1; }
function unrated(r){ return facs(r).filter(function(f){ return !rated(f); }); }
function facById(r,id){ return facs(r).filter(function(f){ return f.id===id; })[0]||null; }
function climOk(r){ return CLIMS.indexOf(r.clim.dec)>=0&&!!txt(r.clim.why); }
/* an outcome is complete when it names its item and: a SWOT study id and its quadrant; a reference or an entry in the register or the plan;
   an entry for the Risk Studio; or the reason the item is set aside */
function outMiss(r,o){
 if(!facById(r,o.f)) return "ouBadF";
 if(o.to==="swot") return (txt(o.ref)&&OQS.indexOf(o.q)>=0)?"":"ouBadSw";
 if(o.to==="reg"||o.to==="plan") return (txt(o.ref)||txt(o.what))?"":"ouBadRef";
 if(o.to==="iso31000") return (txt(o.what)||txt(o.ref))?"":"ouBadIso";
 return txt(o.why)?"":"ouBadWhy";
}
function outOk(r,o){ return !outMiss(r,o); }
function outs(r){ return r.outs.filter(function(o){ return o.f||txt(o.ref)||txt(o.what)||txt(o.why); }); }
function badOuts(r){ return outs(r).filter(function(o){ return !outOk(r,o); }); }
function covered(r,f){ return r.outs.some(function(o){ return o.f===f.id&&outOk(r,o); }); }
function uncov(r){ return topList(r).filter(function(f){ return !covered(r,f); }); }
function acts(r){ return r.acts.filter(function(a){ return txt(a.what); }); }
function actOwned(a){ return !!(txt(a.who)&&isD(a.by)); }
function actDone(a){ return a.st==="done"&&isD(a.done)&&!!txt(a.ev); }
function unowned(r){ return acts(r).filter(function(a){ return !actOwned(a); }); }
function noEv(r){ return acts(r).filter(function(a){ return a.st==="done"&&!actDone(a); }); }
function revs(r){ return r.revs.filter(function(v){ return isD(v.date)||txt(v.chg)||txt(v.add)||txt(v.rem); }); }
function lastRev(r){ var V=r.revs.filter(function(v){ return isD(v.date); }).sort(function(a,b){ return a.date<b.date?-1:(a.date>b.date?1:0); }); return V.length?V[V.length-1]:null; }
function revEarly(r){ return r.revs.some(function(v){ return isD(v.date)&&isD(r.date)&&v.date<r.date; }); }
function revGood(r,v){ return !!v&&isD(v.date)&&(!isD(r.date)||v.date>=r.date)&&!!txt(v.chg); }
/* the review date is "kept" while it is still ahead, or when a review was held between the scan and that date */
function kept(r){ if(!isD(r.revBy)) return false; if(r.revBy>=today()) return true; return r.revs.some(function(v){ return isD(v.date)&&v.date<=r.revBy&&(!isD(r.date)||v.date>=r.date); }); }
function revLate(r){ return isD(r.revBy)&&!kept(r); }
function scopeOk(r){ return !!(txt(r.title)&&txt(r.ref)&&SCOPES.indexOf(r.scope)>=0&&LEVELS.indexOf(r.level)>=0&&txt(r.decision)&&isD(r.date)&&txt(r.facil)); }
function roles(r){ return r.team.filter(function(m){ return txt(m.n)&&txt(m.role); }); }
function extIn(r){ return roles(r).filter(function(m){ return m.ext!=="no"; }); }
function teamOk(r){ return roles(r).length>=3&&extIn(r).length>0; }
function sourcedOk(r){ var F=facs(r); return F.length>0&&!notConsidered(r).length&&F.every(srcOk); }
function rankOk(r){ var T=topList(r); return !unrated(r).length&&T.length>0&&!T.some(genOf); }
function outsOk(r){ return rankOk(r)&&!uncov(r).length&&!unowned(r).length; }
function revOk(r){ return outsOk(r)&&revGood(r,lastRev(r))&&isD(r.revBy); }
var STOK=[scopeOk,teamOk,sourcedOk,climOk,rankOk,outsOk,revOk];
function stageOf(r){ var k=0; while(k<STOK.length&&STOK[k](r)) k++; return STAGES[k]; }
function stageName(s){ return t("st_"+s); }
function stIdx(r){ return STAGES.indexOf(stageOf(r)); }
function atLeast(r,s){ return stIdx(r)>=STAGES.indexOf(s); }
/* display codes: P1, E2, S1, T1, L1, EN1 (X, Y, Z for added factors) by order of entry in each factor; O1 … outcomes; A1 … actions; V1 … reviews */
function codes(r){ var o={}, n={}; r.fac.forEach(function(f){ n[f.g]=(n[f.g]||0)+1; o[f.id]=GC[f.g]+n[f.g]; });
 r.outs.forEach(function(x,i){ o[x.id]="O"+(i+1); }); r.acts.forEach(function(a,i){ o[a.id]="A"+(i+1); }); r.revs.forEach(function(v,i){ o[v.id]="V"+(i+1); }); return o; }
function cList(r,list){ var CD=codes(r); return list.map(function(x){ return CD[x.id]||x.id; }).join(", "); }
/* one list of what is still open in a scan; flags (records) and open items (dashboard, report) read it */
function issues(r){
 var o=[], R=roles(r), F=facs(r), T=topList(r);
 if(!(txt(r.ref)&&txt(r.title))) o.push(["ref","warn",{}]);
 if(!(txt(r.decision)&&LEVELS.indexOf(r.level)>=0)) o.push(["scope","warn",{}]);
 if(!(isD(r.date)&&txt(r.facil))) o.push(["date","warn",{}]);
 if(R.length<=1&&(R.length||F.length)) o.push(["solo","bad",{}]);
 else if(R.length<3) o.push(["team","warn",{}]);
 if(R.length&&!extIn(r).length) o.push(["ext","warn",{}]);
 if(!F.length&&R.length) o.push(["nofac","warn",{}]);
 var nc=notConsidered(r).length; if(F.length&&nc) o.push(["grp","warn",{n:nc}]);
 var ns=F.filter(function(f){ return !srcOk(f); }).length; if(ns) o.push(["src","warn",{n:ns}]);
 var gt=T.filter(genOf).length; if(gt) o.push(["gen","warn",{n:gt}]);
 var gx=F.filter(function(f){ return genOf(f)&&T.indexOf(f)<0; }).length; if(gx) o.push(["genx","info",{n:gx}]);
 if(F.length&&!climOk(r)) o.push(["clim","warn",{}]);
 var ur=unrated(r).length; if(F.length>LONG&&ur) o.push(["long","info",{}]);
 if(ur) o.push(["rate","warn",{n:ur}]);
 if(F.length&&!ur&&!T.length) o.push(["notop","warn",{}]);
 var uc=uncov(r).length; if(T.length&&uc&&(outs(r).length||atLeast(r,"ranked"))) o.push(["uncov","warn",{n:uc}]);
 var uo=unowned(r).length; if(uo) o.push(["own","warn",{n:uo}]);
 var ne=noEv(r).length; if(ne) o.push(["ev","warn",{n:ne}]);
 if(!isD(r.revBy)&&F.length) o.push(["revby","warn",{}]);
 if(revLate(r)) o.push(["late","bad",{}]);
 if(revEarly(r)) o.push(["revearly","warn",{}]);
 if(F.length&&!txt(r.trig)) o.push(["trig","info",{}]);
 if(outsOk(r)&&!revGood(r,lastRev(r))) o.push(["norev","info",{}]);
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
function openSwot(id){ var q=id?{open:id}:{}; openWith("swot.html",SW_NAV,q,id?"?open="+encodeURIComponent(id):""); }
function openSrc(src,id){
 if(src==="strat"){ openTool("strategy-performance.html","pestle"); return; }
 if(src==="swot"){ openSwot(String(id||"").split("/")[0]); }
}
/* other tools' records saved in this browser (read only) */
function recsOf(key){ var S=TBX.read(key); if(!S) return null; return (Array.isArray(S.records)?S.records:[]).filter(function(r){ return r&&typeof r==="object"&&str(r.id); }); }
function byIdIn(key,id){ return (recsOf(key)||[]).filter(function(r){ return str(r.id)===id; })[0]||null; }
/* the Strategy & Performance Studio, read with its own value reader and category names (copied at build time from
   modules/strategy-performance.html); its PESTLE register (r.pestle) is only read */
/*__SS_RULES__*/
function ssRegs(){ var S=TBX.read(STR_KEY); return (S&&S.r&&typeof S.r==="object")?S.r:null; }
function ssRows(){ var R=ssRegs(); if(!R) return null; return (Array.isArray(R.pestle)?R.pestle:[]).filter(function(x){ return x&&typeof x==="object"&&!!txt(ssTKV(x.id)); }); }
function ssRow(id){ return (ssRows()||[]).filter(function(x){ return txt(ssTKV(x.id))===id; })[0]||null; }
function ssName(list,k){ var o=(SSO[list]||[]).filter(function(x){ return x[0]===k; })[0]; return o?(o[1][L]||o[1].ar):String(k==null?"":k); }
/* the Studio's factor keys are the same six as here; its timeframe keys s, m and lg match this tool's horizon */
function ssG(f){ return BASEG.indexOf(f)>=0?f:"p"; }
/* SWOT studies, read with the SWOT tool's own record repair, stage rule and top items (copied at build time from tests/build/swot_host.js) */
/*__SW_RULES__*/
function swRec(id){ var r=byIdIn(SW_KEY,id); return r?SWR.fix(JSON.parse(JSON.stringify(r))):null; }
function swPe(r){ return SWR.items(r).filter(function(i){ return i.src==="pestle"&&(i.q==="o"||i.q==="t"); }); }
/* the factor a SWOT item names in its evidence source ("PESTLE — legal" …); otherwise political */
var GKW=[["en",/(بيئي|environment)/i],["l",/(قانوني|legal|law|regulat)/i],["t",/(تقني|technolog)/i],["s",/(اجتماعي|social)/i],["e",/(اقتصادي|econom)/i],["p",/(سياسي|politic)/i]];
function guessG(s){ s=String(s||""); for(var i=0;i<GKW.length;i++){ if(GKW[i][1].test(s)) return GKW[i][0]; } return "p"; }
/* previews, each by the other tool's own rule */
function pvPestle(row){ return t("pvPe",{id:txt(ssTKV(row.id)),f:ssName("pestleF",row.f),i:ssName("pestleImp",row.imp),w:str(ssTKV(row.sig))||"—",h:ssName("tf",row.tf)||"—"}); }
function pvSwStudy(id){ var r=swRec(id); if(!r) return t("swMiss"); return t("pvSw",{id:id,st:t("swst_"+SWR.stage(r)),n:swPe(r).length,t:short(r.title,90)}); }
function pvSwItem(r,i){ var CD=SWR.codes(r); return t("pvSwI",{id:str(r.id),i:CD[i.id]||i.id,q:t("swq_"+i.q),w:i.w||"—",t:short(i.ev||i.t,90)}); }
function srcPreview(src,id){
 if(src==="none") return "";
 if(src==="strat"){ var R=ssRows(); if(!R) return t("nxNoData"); if(!id) return ""; var row=ssRow(id); return row?pvPestle(row):t("nxMiss"); }
 if(src==="swot"){ if(!(recsOf(SW_KEY)||[]).length) return t("nxNoData"); if(!id) return ""; return pvSwStudy(String(id).split("/")[0]); }
 return "";
}
/* the record an item names (its source id): a Strategy Studio PESTLE row, or a SWOT study item written as STUDY/ITEM */
function sidPreview(sid){
 if(!txt(sid)) return "";
 var a=ssRow(sid); if(a) return pvPestle(a);
 var p=String(sid).split("/"), r=swRec(p[0]); if(r){ var it=SWR.items(r).filter(function(i){ return i.id===p[1]; })[0]; return it?pvSwItem(r,it):pvSwStudy(p[0]); }
 return "";
}

/* ---------- live views: the board, the matrix, the time horizon and the chart of sources (the same markup goes into the report) ---------- */
function tt0(lang){ return function(k,v){ var s=(UI[lang||L]||UI.ar)[k]; if(s===undefined) s=UI.ar[k]; if(v){ for(var x in v) s=String(s).split("{"+x+"}").join(v[x]); } return s; }; }
function effCode(e,lang){ return e?tt0(lang)("eff_"+e).split(" ")[0]:"—"; }
function shownG(r){ return r.grp.filter(function(g){ return BASEG.indexOf(g.k)>=0||txt(g.n)||inG(r,g.k).length; }); }
function boardHTML(r,lang){
 var tt=tt0(lang), CD=codes(r), T=topList(r);
 return '<div class="pe-board" role="group" aria-label="'+esc(tt("boardT"))+'">'+shownG(r).map(function(g){ var L2=order(inG(r,g.k)), T2=L2.slice(0,3), nr=txt(grpOf(r,g.k).nr);
  return '<section class="pe-g" style="--gc:'+GCOL[g.k]+'"><h4><b dir="ltr">'+GC[g.k]+'</b><span>'+esc(gName(r,g.k,lang))+'</span><small>'+L2.length+'</small></h4>'+
   (T2.length?'<ol>'+T2.map(function(f){ var top=T.indexOf(f)>=0; return '<li'+(top?' class="top"':'')+'><code dir="ltr">'+esc(CD[f.id])+'</code><span>'+esc(short(f.t,110))+'</span><em dir="ltr">'+(top?"★ ":"")+(score(f)||"—")+'</em></li>'; }).join("")+'</ol>':
    '<p class="pe-none">'+esc(nr?tt("boardNr",{r:short(nr,90)}):tt("boardEmpty"))+'</p>')+
   (L2.length>3?'<p class="pe-more">'+esc(tt("boardMore",{n:L2.length-3}))+'</p>':'')+'</section>'; }).join("")+'</div>';
}
function heat(s){ return s>=15?"hi":(s>=8?"md":"lo"); }
function matrixHTML(r,lang){
 var tt=tt0(lang), CD=codes(r), F=facs(r), T=topList(r), un=F.filter(function(f){ return !score(f); }).length, rows=[];
 for(var sg=5;sg>=1;sg--){ var cells=[]; for(var c=1;c<=5;c++){ var here=F.filter(function(f){ return f.sig===sg&&f.cer===c; });
   cells.push('<td class="'+heat(sg*c)+'" title="'+sg+' × '+c+' = '+(sg*c)+'">'+here.map(function(f){ return '<span class="pe-mc'+(T.indexOf(f)>=0?" top":"")+'" style="--gc:'+GCOL[f.g]+'" dir="ltr">'+esc(CD[f.id])+'</span>'; }).join("")+'</td>'); }
  rows.push('<tr><th scope="row" dir="ltr">'+sg+'</th>'+cells.join("")+'</tr>'); }
 return '<div class="pe-mxw"><table class="pe-mx" aria-label="'+esc(tt("mxT"))+'"><caption>'+esc(tt("mxSig"))+' ↑ · '+esc(tt("mxCer"))+' '+((lang||L)==="ar"?"←":"→")+'</caption><tbody>'+rows.join("")+
  '<tr class="ax"><th></th>'+[1,2,3,4,5].map(function(c){ return '<th scope="col" dir="ltr">'+c+'</th>'; }).join("")+'</tr></tbody></table>'+
  (un?'<p class="pe-none">'+esc(tt("mxNone",{n:un}))+'</p>':'')+'</div>';
}
function timelineHTML(r,lang){
 var tt=tt0(lang), CD=codes(r), F=order(facs(r)), T=topList(r), no=F.filter(function(f){ return !f.hz; });
 return '<div class="pe-tl" role="group" aria-label="'+esc(tt("tlnT"))+'">'+HZS.map(function(h){ var H=F.filter(function(f){ return f.hz===h; });
  return '<section><h5>'+esc(tt("hz_"+h))+'</h5>'+(H.length?'<ul>'+H.map(function(f){ return '<li'+(T.indexOf(f)>=0?' class="top"':'')+' style="--gc:'+GCOL[f.g]+'"><code dir="ltr">'+esc(CD[f.id])+'</code><span>'+esc(short(f.t,70))+'</span></li>'; }).join("")+'</ul>':'<p class="pe-none">'+esc(tt("tlnNone"))+'</p>')+'</section>'; }).join("")+
  '</div>'+(no.length?'<p class="pe-none">'+esc(tt("tlnNo"))+': <span dir="ltr">'+esc(no.map(function(f){ return CD[f.id]; }).join(", "))+'</span></p>':'');
}
function rankHTML(r){
 var CD=codes(r), R=rankedF(r), T=topList(r);
 if(!R.length) return '<p class="ca-hint">'+esc(t("rkNone"))+'</p>';
 return '<div class="pd-tw"><table class="pd-tbl pe-rk"><thead><tr><th>'+esc(t("rkColR"))+'</th><th>'+esc(t("rkColC"))+'</th><th>'+esc(t("rkColT"))+'</th><th>'+esc(t("rkColS"))+'</th></tr></thead><tbody>'+
  R.map(function(f,i){ var top=T.indexOf(f)>=0; return '<tr'+(top?' class="top"':'')+'><td dir="ltr">'+(i+1)+'</td><td><b dir="ltr">'+esc(CD[f.id])+'</b>'+(top?' <span class="ca-chip ok">'+esc(t("topB"))+'</span>':'')+'</td><td>'+esc(short(f.t,120))+'</td><td dir="ltr">'+f.sig+' × '+f.cer+' = <b>'+score(f)+'</b></td></tr>'; }).join("")+'</tbody></table></div>';
}
var FONT="font-family=\"'IBM Plex Sans Arabic','IBM Plex Sans',Calibri,Tahoma,sans-serif\"";
function chartW(){ try{ return window.innerWidth<640?340:560; }catch(e){ return 560; } }
/* items by factor: one bar per factor (added factors together), the part with a source and a date and the part without */
var CHG=BASEG.concat(["x"]);
function srcSVG(list,o){
 o=o||{}; var lang=o.lang||L, rtl=lang==="ar", W=o.W||560, tt=tt0(lang), f=function(v){ return Math.round(v*10)/10; };
 var I=[]; list.forEach(function(r){ I=I.concat(facs(r)); });
 var lw=W<420?104:140, m={l:lw,r:34,t:10,b:10}, rowH=24, H=m.t+CHG.length*rowH+30+m.b, iw=W-m.l-m.r;
 var cnt={}; CHG.forEach(function(k){ cnt[k]={e:0,n:0}; }); I.forEach(function(x){ var k=XG.indexOf(x.g)>=0?"x":x.g; cnt[k][srcOk(x)?"e":"n"]++; });
 var mx=Math.max.apply(null,CHG.map(function(k){ return cnt[k].e+cnt[k].n; }).concat([1]));
 var out=['<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 '+W+' '+H+'" width="'+W+'" height="'+H+'" role="img" aria-label="'+esc(tt("chT"))+'" direction="ltr" '+FONT+'>','<rect width="'+W+'" height="'+H+'" fill="#FFFFFF"/>'];
 CHG.forEach(function(k,i){ var y=m.t+i*rowH, c=cnt[k], we=c.e/mx*iw, wn=c.n/mx*iw, x0=rtl?W-m.l:m.l, col=GCOL[k==="x"?"x1":k], lab=tt("gr_"+k);
  out.push('<text x="'+f(rtl?W-6:6)+'" y="'+f(y+15)+'" fill="'+col+'" font-size="11" font-weight="700" text-anchor="'+(rtl?"end":"start")+'">'+esc(lab)+'</text>');
  out.push('<rect x="'+f(rtl?m.r:m.l)+'" y="'+f(y+4)+'" width="'+f(iw)+'" height="14" rx="3" fill="#F3F6FA"/>');
  if(c.e) out.push('<rect x="'+f(rtl?x0-we:x0)+'" y="'+f(y+4)+'" width="'+f(we)+'" height="14" rx="3" fill="#2F7D4B"><title>'+esc(lab+" · "+tt("chEv")+" · "+c.e)+'</title></rect>');
  if(c.n) out.push('<rect x="'+f(rtl?x0-we-wn:x0+we)+'" y="'+f(y+4)+'" width="'+f(wn)+'" height="14" rx="3" fill="#C9D2DF"><title>'+esc(lab+" · "+tt("chOp")+" · "+c.n)+'</title></rect>');
  var tot=c.e+c.n; out.push('<text x="'+f(rtl?x0-we-wn-4:x0+we+wn+4)+'" y="'+f(y+15)+'" fill="#4B5874" font-size="10.5" text-anchor="'+(rtl?"end":"start")+'" direction="ltr">'+(tot||"")+'</text>'); });
 var ly=m.t+CHG.length*rowH+10, lx=rtl?W-16:6;
 out.push('<rect x="'+f(lx)+'" y="'+f(ly)+'" width="10" height="10" rx="2" fill="#2F7D4B"/><text x="'+f(rtl?lx-4:lx+14)+'" y="'+f(ly+9)+'" fill="#4B5874" font-size="10.5" text-anchor="'+(rtl?"end":"start")+'">'+esc(tt("chEv"))+'</text>');
 var lx2=rtl?W-176:166; out.push('<rect x="'+f(lx2)+'" y="'+f(ly)+'" width="10" height="10" rx="2" fill="#C9D2DF"/><text x="'+f(rtl?lx2-4:lx2+14)+'" y="'+f(ly+9)+'" fill="#4B5874" font-size="10.5" text-anchor="'+(rtl?"end":"start")+'">'+esc(tt("chOp"))+'</text>');
 if(!I.length) out.push('<text x="'+f(W/2)+'" y="'+f(m.t+CHG.length*rowH/2)+'" fill="#7A869E" font-size="12" text-anchor="middle">'+esc(tt("chEmpty"))+'</text>');
 out.push('</svg>'); return out.join("");
}
function shareLine(list,lang){ var I=[]; list.forEach(function(r){ I=I.concat(facs(r)); }); if(!I.length) return ""; var e=I.filter(srcOk).length, p=Math.round(e/I.length*100); return tt0(lang)("chShare",{p:p,o:100-p}); }
/* stage map: seven stages; the same markup goes into the report */
function mapHTML(r,lang){
 var tt=tt0(lang), k=stIdx(r);
 return '<ol class="dm-map pe-map" aria-label="'+esc(tt("mapT"))+'">'+MAPST.map(function(s,i){ var st=(i+1<=k)?"done":(i+1===k+1?"cur":"todo");
  return '<li class="'+st+'" style="--pc:'+SCOL[s]+'"'+(st==="cur"?' aria-current="step"':'')+'><i aria-hidden="true">'+(i+1)+'</i><span><b>'+esc(tt("st_"+s))+'</b><small>'+esc(tt("mp_"+s))+' · '+esc(tt(st==="done"?"mpDone":(st==="cur"?"mpCur":"mpTodo")))+'</small></span></li>'; }).join("")+'</ol>';
}

/* ---------- scan form ---------- */
var HDR=[["title","tx",1],["ref","ltr",0],["scope","sel:SCOPES:sc_",0],["level","sel:LEVELS:lv_",0],["date","date",0],["facil","tx",0],["owner","tx",0],["revBy","date",0],["src","sel:SRCS:src_",0],["srcId","srcid",0],["decision","ta",1],["trig","ta",1]];
var PATH={title:"title",ref:"ref",scope:"scope",level:"level",date:"date",facil:"facil",owner:"owner",revBy:"revBy",trig:"trig",src:"src",srcId:"srcId",decision:"decision"};
var LISTS={SCOPES:SCOPES,LEVELS:LEVELS,SRCS:SRCS,EXTS:EXTS,EFFS0:[""].concat(EFFS),HZS0:[""].concat(HZS),CLIMS0:[""].concat(CLIMS),TOS:TOS,OQS0:[""].concat(OQS),ASTS:ASTS,RTRIG:RTRIG};
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
function secHTML(k,col,inner){ return '<section class="dm-ph pe-sec" id="sec-'+k+'" style="--pc:'+col+'" aria-labelledby="sct-'+k+'"><h3 class="dm-pht" id="sct-'+k+'">'+esc(t("s"+k+"T"))+'</h3><p class="dm-phs">'+esc(t("s"+k+"S"))+'</p>'+inner+'</section>'; }
/* one box per factor: its name (can be adjusted), the "nothing relevant" reason, and its items */
function gboxHTML(g){
 var k=g.k, x=XG.indexOf(k)>=0, hk=x?"x":k;
 return '<div class="pe-gbox" data-g="'+k+'" style="--gc:'+GCOL[k]+'"><div class="pe-gh"><b dir="ltr">'+GC[k]+'</b><span data-gname></span>'+(x?'<button type="button" class="ca-x" data-gdel="'+k+'" aria-label="'+esc(t("grDel"))+'" title="'+esc(t("grDel"))+'">✕</button>':'')+'</div>'+
  '<p class="pe-gd">'+esc(t("grH_"+hk))+'</p><div class="pd-fields pe-gm"><div class="pd-f"><label for="g-'+k+'-n">'+esc(t("grName"))+'</label><input type="text" id="g-'+k+'-n" data-gk="n" placeholder="'+esc(t(x?"gr_x":"gr_"+k))+'"></div>'+
  '<div class="pd-f"><label for="g-'+k+'-nr">'+esc(t("grNr"))+'</label><input type="text" id="g-'+k+'-nr" data-gk="nr"></div></div>'+
  '<div class="dm-cards pe-cards" id="faC-'+k+'" data-g="'+k+'"></div><p class="ca-hint" id="faN-'+k+'"></p><div class="w5-warn" id="faW-'+k+'" role="note" hidden></div><div class="a3-add">'+addBtn("fa:"+k,t("faAdd"))+'</div></div>';
}
function buildForm(){
 document.getElementById("hdrFields").innerHTML=HDR.map(function(f){ return fieldHTML(f[0],f[1],f[2]); }).join("");
 var S1=tblHTML("tm","pe-tm",[t("tmN"),t("tmRole"),t("tmExt"),""])+'<p class="ca-hint" id="tmNone"></p><div class="a3-add">'+addBtn("tm",t("tmAdd"))+'</div><div class="w5-warn w5-bad" id="tmWarn" role="note" hidden></div>';
 var S2='<div class="pe-gboxes" id="gBoxes"></div><div class="a3-add"><button class="pd-btn ghost" type="button" id="grAdd">+ '+esc(t("grAdd"))+'</button><span class="ca-hint" id="grMsg"></span></div>';
 var S3='<div class="pd-fields"><div class="pd-f"><label for="f-clDec">'+esc(t("clDec"))+'</label><select id="f-clDec">'+opts1(LISTS.CLIMS0,"cl_")+'</select></div><div class="pd-f wide"><label for="f-clWhy">'+esc(t("clWhy"))+'</label><textarea id="f-clWhy" rows="2"></textarea></div></div><div class="w5-warn" id="clWarn" role="note" hidden></div>';
 var S4='<p class="ca-hint">'+esc(t("rkInfo"))+'</p><div class="w5-warn" id="rkWarn" role="note" hidden></div><div id="peRank" aria-live="polite"></div>'+
  '<h4 class="pe-vh">'+esc(t("boardT"))+'</h4><div id="peBoard"></div><div class="pe-two"><div><h4 class="pe-vh">'+esc(t("mxT"))+'</h4><div id="peMx"></div></div><div><h4 class="pe-vh">'+esc(t("tlnT"))+'</h4><div id="peTl"></div></div></div>'+
  '<h4 class="pe-vh">'+esc(t("chT"))+'</h4><div class="pe-chartw" id="peChart"></div><p class="ca-hint" id="peShare"></p>';
 var S5='<div class="a3-add"><button class="pd-btn ghost" type="button" id="ouAuto">'+esc(t("ouAuto"))+'</button><span class="pd-ok" id="ouMsg" role="status"></span></div>'+
  tblHTML("ou","pe-ou",[t("ou_f"),t("ou_to"),t("ou_q"),t("ou_ref"),t("ou_what"),t("ou_why"),t("ou_who"),""])+'<p class="ca-hint" id="ouNone"></p><div class="a3-add">'+addBtn("ou",t("ouAdd"))+'</div><div class="w5-warn" id="ouWarn" role="note" hidden></div>';
 var S6='<div id="acCards" class="dm-cards pe-acards"></div><p class="ca-hint" id="acNone"></p><div class="a3-add">'+addBtn("ac",t("acAdd"))+'</div><div class="w5-warn" id="acWarn" role="note" hidden></div>';
 var S7=tblHTML("rv","pe-rv",[t("rvDate"),t("rvTrig"),t("rvChg"),t("rvAdd"),t("rvRem"),""])+'<p class="ca-hint" id="rvNone"></p><div class="a3-add">'+addBtn("rv",t("rvAddBtn"))+'</div><div class="w5-warn" id="rvWarn" role="note" hidden></div>';
 document.getElementById("stages").innerHTML=secHTML("Tm","#1E8C93",S1)+secHTML("Fa","#3563C9",S2)+secHTML("Cl","#2F7D4B",S3)+secHTML("Rk","#1B2A4A",S4)+secHTML("Ou","#C9821A",S5)+secHTML("Ac","#C2410C",S6)+secHTML("Rv","#3C9A5F",S7);
 fillLists();
}
function fill(list){ return list.map(function(r){ return '<option value="'+esc(r[0])+'">'+esc(r[1])+'</option>'; }).join(""); }
function srcIds(src){
 if(src==="strat") return (ssRows()||[]).map(function(x){ return [txt(ssTKV(x.id)),short(ssTKV(x.text),80)]; });
 if(src==="swot") return (recsOf(SW_KEY)||[]).map(function(c){ return [str(c.id),(str(c.ref)?str(c.ref)+" · ":"")+str(c.title)]; });
 return [];
}
function fillLists(){
 var put=function(id,list){ var dl=document.getElementById(id); if(dl) dl.innerHTML=fill(list); };
 var s=document.getElementById("f-src"); put("srcList",s?srcIds(s.value):[]);
 put("swList",srcIds("swot"));
}
/* ---- small tables: team, outcomes, reviews ---- */
var TB={
 tm:{key:"team",blank:blankTm,pre:"",f:[["n","tx","tmN"],["role","tx","tmRole"],["ext","sel:EXTS:ex_","tmExt"]],max:MAXTEAM},
 ou:{key:"outs",blank:blankOu,pre:"o",f:[["f","fsel","ou_f"],["to","sel:TOS:to_","ou_to"],["q","sel:OQS0:oq_","ou_q"],["ref","ref","ou_ref"],["what","ta","ou_what"],["why","ta","ou_why"],["who","tx","ou_who"]],max:MAXOUTS},
 rv:{key:"revs",blank:blankRv,pre:"v",f:[["date","date","rvDate"],["trig","sel:RTRIG:rt_","rvTrig"],["chg","ta","rvChg"],["add","tx","rvAdd"],["rem","tx","rvRem"]],max:MAXREV}
};
function cellHTML(tb,f,row,i){
 var k=f[0], kind=f[1], lb=t(f[2])+" "+(i+1), id="r-"+tb+"-"+i+"-"+k, v=row[k], a=' id="'+id+'" data-k="'+k+'" aria-label="'+esc(lb)+'"', m=/^sel:(\w+):(\w+)$/.exec(kind);
 if(kind==="tx") return '<td><input type="text"'+a+' value="'+esc(v)+'"></td>';
 if(kind==="ta") return '<td><textarea rows="1"'+a+'>'+esc(v)+'</textarea></td>';
 if(kind==="date") return '<td class="a3-d"><input type="date"'+a+' value="'+esc(v)+'"></td>';
 if(kind==="fsel") return '<td><select'+a+' data-fsel data-v="'+esc(v)+'"></select></td>';
 if(kind==="ref") return '<td><div class="ca-pd"><input type="text" dir="auto" list="swList"'+a+' value="'+esc(v)+'"><button class="pd-btn ghost" type="button" data-ouo hidden></button></div><div class="a3-pv" data-pv></div></td>';
 if(m) return '<td><select'+a+'>'+opts1(LISTS[m[1]],m[2],v)+'</select></td>';
 return '<td></td>';
}
function rowHTML(tb,row,i){ return '<tr data-row="'+i+'" data-cid="'+esc(row.id||"")+'">'+TB[tb].f.map(function(f){ return cellHTML(tb,f,row,i); }).join("")+'<td class="a3-x"><button type="button" class="ca-x" data-rdel="'+tb+':'+i+'" aria-label="'+esc(t("tmDel"))+'" title="'+esc(t("tmDel"))+'">✕</button></td></tr>'; }
var NONE={tm:"tmNone",ou:"ouNone",rv:"rvNone",ac:"acNone"};
function renderTbl(tb,list){
 var box=document.getElementById(tb+"Rows"); if(!box) return;
 box.innerHTML=list.map(function(x,i){ return rowHTML(tb,x,i); }).join("");
 var ne=document.getElementById(NONE[tb]); if(ne) ne.textContent=list.length?"":t(NONE[tb]);
 autoSizeAll(box);
}
function readTbl(tb){
 var box=document.getElementById(tb+"Rows"); if(!box) return [];
 return [].map.call(box.querySelectorAll("tr[data-row]"),function(tr){ var o={id:tr.getAttribute("data-cid")||""}; TB[tb].f.forEach(function(f){ var el=tr.querySelector('[data-k="'+f[0]+'"]'); if(el) o[f[0]]=(el.tagName==="SELECT"&&el.hasAttribute("data-fsel")&&!el.options.length)?(el.getAttribute("data-v")||""):txt(el.value); }); return o; });
}
/* ---- cards: items, actions ---- */
function cf(pre,i,k,kind,labHTML,wide){
 var id="r-"+pre+"-"+i+"-"+k, a=' id="'+id+'" data-k="'+k+'"', m=/^sel:(\w+):(\w+)$/.exec(kind), inner;
 if(kind==="ta") inner='<textarea rows="1"'+a+'></textarea>';
 else if(kind==="date") inner='<input type="date"'+a+'>';
 else if(kind==="ltr") inner='<input type="text" dir="ltr"'+a+'>';
 else if(kind==="w") inner='<select'+a+'><option value="">—</option>'+WTS.map(function(x){ return '<option value="'+x+'">'+x+'</option>'; }).join("")+'</select>';
 else if(kind==="fsel") inner='<select'+a+' data-fsel></select>';
 else if(m) inner='<select'+a+'>'+opts1(LISTS[m[1]],m[2])+'</select>';
 else inner='<input type="text"'+a+'>';
 return '<div class="pd-f'+(wide?" wide":"")+' pe-f-'+k+'"><label for="'+id+'">'+labHTML+'</label>'+inner+'</div>';
}
function L1(k,v){ return esc(t(k,v)); }
var FAK=["t","so","d","eff","sig","cer","hz","who","sid"], ACK=["f","what","who","by","st","done","ev"];
function faCardHTML(x,i){
 var p="fa"+x.g;
 return '<div class="dm-card pe-fa" data-row="'+i+'" data-cid="'+esc(x.id)+'" data-g="'+x.g+'" style="--gc:'+GCOL[x.g]+'">'+
  '<div class="dm-ch"><b class="dm-code" data-code dir="ltr"></b><span data-stc></span><button type="button" class="ca-x" data-fdel="'+esc(x.id)+'" data-fg="'+x.g+'" data-fi="'+i+'" aria-label="'+esc(t("faDel"))+'" title="'+esc(t("faDel"))+'">✕</button></div>'+
  '<div class="pd-fields">'+cf(p,i,"t","ta",L1("fa_t"),1)+cf(p,i,"so","tx",L1("fa_so"),1)+cf(p,i,"d","date",L1("fa_d"))+cf(p,i,"eff","sel:EFFS0:eff_",L1("fa_eff"))+cf(p,i,"hz","sel:HZS0:hz_",L1("fa_hz"))+cf(p,i,"sig","w",L1("fa_sig"))+cf(p,i,"cer","w",L1("fa_cer"))+cf(p,i,"who","tx",L1("fa_who"))+cf(p,i,"sid","ltr",L1("fa_sid"))+'</div><p class="a3-pv" data-pv></p><span class="a3-flag" data-flag></span></div>';
}
function acCardHTML(x,i){
 return '<div class="dm-card pe-ac" data-row="'+i+'" data-cid="'+esc(x.id)+'">'+
  '<div class="dm-ch"><b class="dm-code" data-code dir="ltr"></b><span data-stc></span><button type="button" class="ca-x" data-rdel="ac:'+i+'" aria-label="'+esc(t("acDel"))+'" title="'+esc(t("acDel"))+'">✕</button></div>'+
  '<div class="pd-fields">'+cf("ac",i,"f","fsel",L1("ac_f"))+cf("ac",i,"what","ta",L1("ac_what"),1)+cf("ac",i,"who","tx",L1("ac_who"))+cf("ac",i,"by","date",L1("ac_by"))+cf("ac",i,"st","sel:ASTS:as_",L1("ac_st"))+cf("ac",i,"done","date",L1("ac_done"))+cf("ac",i,"ev","ta",L1("ac_ev"),1)+'</div><span class="a3-flag" data-flag></span></div>';
}
function setVal(el,v){ if(!el) return; if(el.tagName==="SELECT"){ if([].some.call(el.options,function(o){ return o.value===String(v==null?"":v); })) el.value=String(v==null?"":v); else el.setAttribute("data-v",String(v==null?"":v)); } else el.value=v==null?"":String(v); }
/* the factor boxes, with the items inside each */
function renderGroups(grp,fac){
 var box=document.getElementById("gBoxes"); if(!box) return;
 box.innerHTML=grp.map(gboxHTML).join("");
 grp.forEach(function(g){ var b=box.querySelector('.pe-gbox[data-g="'+g.k+'"]'); b.querySelector('[data-gk="n"]').value=g.n||""; b.querySelector('[data-gk="nr"]').value=g.nr||""; });
 renderFac(fac);
 var ga=document.getElementById("grAdd"); if(ga) ga.disabled=grp.filter(function(g){ return XG.indexOf(g.k)>=0; }).length>=XG.length;
}
function renderFac(list){
 document.querySelectorAll("#gBoxes .pe-cards").forEach(function(box){ var g=box.getAttribute("data-g"), L2=list.filter(function(x){ return x.g===g; });
  box.innerHTML=L2.map(function(x,i){ return faCardHTML(x,i); }).join("");
  [].forEach.call(box.querySelectorAll(".dm-card"),function(card,i){ var x=L2[i]; FAK.forEach(function(k){ setVal(card.querySelector('[data-k="'+k+'"]'),x[k]); }); });
  var ne=document.getElementById("faN-"+g); if(ne) ne.textContent=L2.length?"":t("faNone"); autoSizeAll(box); });
}
function readGrp(){ return [].map.call(document.querySelectorAll("#gBoxes .pe-gbox"),function(b){ return {k:b.getAttribute("data-g"),n:txt(b.querySelector('[data-gk="n"]').value),nr:txt(b.querySelector('[data-gk="nr"]').value)}; }); }
function readFac(){ var o=[]; document.querySelectorAll("#gBoxes .pe-cards").forEach(function(box){ var g=box.getAttribute("data-g");
 [].forEach.call(box.querySelectorAll(".dm-card"),function(card){ var x={id:card.getAttribute("data-cid"),g:g}; FAK.forEach(function(k){ var el=card.querySelector('[data-k="'+k+'"]'); x[k]=el?txt(el.value):""; }); o.push(x); }); }); return o; }
function renderActs(list){
 var box=document.getElementById("acCards"); if(!box) return;
 box.innerHTML=list.map(function(x,i){ return acCardHTML(x,i); }).join("");
 [].forEach.call(box.querySelectorAll(".dm-card"),function(card,i){ var x=list[i]; ACK.forEach(function(k){ var el=card.querySelector('[data-k="'+k+'"]'); if(k==="f"&&el){ el.setAttribute("data-v",x.f); } else setVal(el,x[k]); }); });
 var ne=document.getElementById("acNone"); if(ne) ne.textContent=list.length?"":t("acNone"); autoSizeAll(box);
}
function readActs(){
 var box=document.getElementById("acCards"); if(!box) return [];
 return [].map.call(box.querySelectorAll(".dm-card"),function(card){ var o={id:card.getAttribute("data-cid")}; ACK.forEach(function(k){ var el=card.querySelector('[data-k="'+k+'"]'); o[k]=el?((k==="f"&&!el.options.length)?(el.getAttribute("data-v")||""):txt(el.value)):""; }); return o; });
}
function autoSize(el){ if(!el||el.tagName!=="TEXTAREA") return; el.style.height="auto"; if(el.scrollHeight) el.style.height=(el.scrollHeight+2)+"px"; }
function autoSizeAll(root){ if(root) root.querySelectorAll("textarea").forEach(autoSize); }
/* the scan as it would be saved: empty rows dropped */
function formToRec(){
 var r=blank();
 Object.keys(PATH).forEach(function(k){ var el=document.getElementById("f-"+k); if(el) r[PATH[k]]=txt(el.value); });
 if(document.getElementById("gBoxes")){
  r.team=readTbl("tm").map(fixTm).filter(function(x){ return x.n||x.role; });
  r.grp=readGrp();
  r.fac=readFac().filter(function(x){ return x.t||x.so||x.d; });
  var cd=document.getElementById("f-clDec"), cw=document.getElementById("f-clWhy"); r.clim={dec:cd?cd.value:"",why:cw?txt(cw.value):""};
  r.outs=readTbl("ou").filter(function(x){ return x.f||x.ref||x.what||x.why||x.who; });
  r.acts=readActs().filter(function(x){ return x.what||x.who||x.ev; });
  r.revs=readTbl("rv").filter(function(x){ return x.date||x.chg||x.add||x.rem; });
 }
 r.id=document.getElementById("rid").value;
 if(editing&&editing.id===r.id){ r.created=editing.created||""; }
 fixRec(r);
 return r;
}
/* while typing, the scan keeps every row (even empty ones) so the cards and tables keep their shape */
function formRaw(){ return {tm:readTbl("tm"),ou:readTbl("ou"),rv:readTbl("rv"),fa:readFac(),gr:readGrp(),ac:readActs()}; }
function recToForm(r,keepMsg){
 r=fixRec(JSON.parse(JSON.stringify(r)));
 document.getElementById("rid").value=r.id||"";
 Object.keys(PATH).forEach(function(k){ var el=document.getElementById("f-"+k); if(!el) return; var v=r[PATH[k]]; v=(v===null||v===undefined)?"":String(v); el.value=v||(el.tagName==="SELECT"&&el.options.length?el.options[0].value:""); });
 fillLists();
 renderTbl("tm",r.team); renderGroups(r.grp,r.fac);
 var cd=document.getElementById("f-clDec"), cw=document.getElementById("f-clWhy"); if(cd) cd.value=r.clim.dec; if(cw) cw.value=r.clim.why;
 renderTbl("ou",r.outs); renderActs(r.acts); renderTbl("rv",r.revs);
 if(!keepMsg){ ["recErr","recOk","ouMsg","grMsg"].forEach(function(id){ var e=document.getElementById(id); if(e) e.textContent=""; }); }
 refreshForm();
 autoSizeAll(document.getElementById("stages")); autoSizeAll(document.getElementById("hdrFields"));
}
function loadRecordIntoForm(r){ editing=fixRec(JSON.parse(JSON.stringify(r))); recToForm(editing); }
function clearForm(){ editing=null; recToForm(blank()); }
function setW(id,on,msg){ var w=document.getElementById(id); if(!w) return; w.hidden=!on; w.textContent=on?msg:""; }
/* the item lists inside outcome rows and action cards follow the form; they are rebuilt only when the items have changed, so typing never
   loses focus */
function itemLabel(r,CD,f){ return CD[f.id]+" · "+short(f.t,60); }
function syncSelects(r,CD){
 var sig=JSON.stringify(r.fac.map(function(f){ return [f.id,itemLabel(r,CD,f)]; }))+JSON.stringify(r.grp.map(function(g){ return g.n; }))+L;
 document.querySelectorAll("#ouRows select[data-fsel], #acCards select[data-fsel]").forEach(function(el){ if(el.getAttribute("data-sig")===sig) return; var cur=el.options.length?el.value:(el.getAttribute("data-v")||"");
  var first=el.closest("#acCards")?t("acPick"):t("ouPick");
  el.innerHTML='<option value="">'+esc(first)+'</option>'+shownG(r).map(function(g){ var F=r.fac.filter(function(f){ return f.g===g.k&&txt(f.t); }); return F.length?'<optgroup label="'+esc(gName(r,g.k))+'">'+F.map(function(f){ return '<option value="'+esc(f.id)+'">'+esc(itemLabel(r,CD,f))+'</option>'; }).join("")+'</optgroup>':""; }).join("");
  el.value=r.fac.some(function(f){ return f.id===cur&&txt(f.t); })?cur:""; el.setAttribute("data-sig",sig); });
}
function refreshForm(){
 var r=formToRec(), st=stageOf(r), CD=codes(r), raw=formRaw(), T=topList(r);
 var el=document.getElementById("curStage"); if(el) el.textContent=t("cur")+" "+stageName(st);
 document.getElementById("caSteps").innerHTML=mapHTML(r);
 /* source */
 var si=document.getElementById("srcInfo"); if(si) si.textContent=r.src==="none"?t("srcHint"):(r.srcId?srcPreview(r.src,r.srcId):(srcPreview(r.src,"")||t("srcHint")));
 var so=document.getElementById("srcOpen"); if(so) so.disabled=r.src==="none";
 /* team */
 var R=roles(r), tw=[]; if(R.length<=1&&(R.length||facs(r).length)) tw.push(t("tmSolo")); else if(R.length&&R.length<3) tw.push(t("tmW3")); if(R.length&&!extIn(r).length) tw.push(t("tmWext"));
 setW("tmWarn",tw.length>0,tw.join(" ")); var tb=document.querySelector('[data-add="tm"]'); if(tb) tb.disabled=raw.tm.length>=MAXTEAM;
 /* factors and items */
 var byId={}; r.fac.forEach(function(f){ byId[f.id]=f; });
 document.querySelectorAll("#gBoxes .pe-gbox").forEach(function(b){ var k=b.getAttribute("data-g"), nm=b.querySelector("[data-gname]"); if(nm) nm.textContent=gName(r,k);
  [].forEach.call(b.querySelectorAll(".pe-cards .dm-card"),function(card){ var x=fixFa(raw.fa.filter(function(z){ return z.id===card.getAttribute("data-cid"); })[0]||{g:k}), f=byId[x.id]||null;
   card.querySelector("[data-code]").textContent=f&&txt(f.t)?CD[f.id]:GC[k]+"·";
   var ch=[]; if(f&&isTop(r,f)) ch.push('<span class="ca-chip ok">'+esc(t("topB"))+'</span>'); if(f&&score(f)) ch.push('<span class="ca-chip info" dir="ltr">'+esc(t("scoreL",{s:score(f)}))+'</span>'); if(f&&txt(f.t)&&!rated(f)) ch.push('<span class="ca-chip info">'+esc(t("unrB"))+'</span>');
   card.querySelector("[data-stc]").innerHTML=ch.join(" ");
   var msg=[]; if(txt(x.t)&&genOf(x)) msg.push(t("genF")); if(txt(x.t)&&!srcOk(x)) msg.push(t("srcF"));
   card.querySelector("[data-flag]").textContent=msg.join(" "); card.classList.toggle("a3-pf",msg.length>0);
   var pv=card.querySelector("[data-pv]"); if(pv) pv.textContent=x.sid?sidPreview(x.sid):""; });
  setW("faW-"+k,BASEG.indexOf(k)>=0&&!considered(r,k)&&(facs(r).length>0||roles(r).length>0),t("grNoneW"));
  var ab=b.querySelector('[data-add="fa:'+k+'"]'); if(ab) ab.disabled=raw.fa.length>=MAXFAC; });
 var ga=document.getElementById("grAdd"); if(ga) ga.disabled=raw.gr.filter(function(g){ return XG.indexOf(g.k)>=0; }).length>=XG.length;
 /* climate change */
 var cw=""; if(facs(r).length&&!r.clim.dec) cw=t("clW"); else if(r.clim.dec&&!txt(r.clim.why)) cw=t("clWhyW"); setW("clWarn",!!cw,cw);
 /* ranking and the live views */
 var rw=[], ur=unrated(r).length; if(facs(r).length>LONG&&ur) rw.push(t("longW",{n:facs(r).length})); else if(ur) rw.push(t("oi_rate",{n:ur}));
 var gt=T.filter(genOf); if(gt.length) rw.push(t("oi_gen",{n:gt.length}));
 setW("rkWarn",rw.length>0,rw.join(" "));
 var put=function(id,h){ var e=document.getElementById(id); if(e) e.innerHTML=h; };
 put("peRank",rankHTML(r)); put("peBoard",boardHTML(r)); put("peMx",matrixHTML(r)); put("peTl",timelineHTML(r)); put("peChart",srcSVG([r],{lang:L,W:chartW()}));
 var sh=document.getElementById("peShare"); if(sh) sh.textContent=shareLine([r]);
 /* outcomes */
 syncSelects(r,CD);
 document.querySelectorAll("#ouRows tr[data-row]").forEach(function(tr,i){ var o=fixOu(raw.ou[i]||{}), b=tr.querySelector("[data-ouo]"), pv=tr.querySelector("[data-pv]"), ref=txt(o.ref);
  if(b){ b.hidden=!(o.to==="iso31000"||(o.to==="swot"&&ref)); b.textContent=o.to==="iso31000"?t("isoOpen")+" ↗":t("swOpen")+" ↗"; }
  var miss=(o.f||ref||txt(o.what)||txt(o.why))?outMiss(r,o):"";
  if(pv) pv.textContent=(o.to==="swot"&&ref?pvSwStudy(ref):(o.to==="iso31000"?t("isoNote"):""))+(miss?(" "+t(miss)).replace(/^ /,""):"");
  tr.classList.toggle("a3-pf",!!miss); });
 var uc=uncov(r), ow=""; if(T.length&&uc.length) ow=t("uncovW",{n:uc.length,c:cList(r,uc)}); else if(facs(r).length&&!unrated(r).length&&!T.length) ow=t("noTopW");
 setW("ouWarn",!!ow,ow);
 var oa=document.getElementById("ouAuto"); if(oa) oa.disabled=!uc.length||raw.ou.length>=MAXOUTS;
 var ob=document.querySelector('[data-add="ou"]'); if(ob) ob.disabled=raw.ou.length>=MAXOUTS;
 /* actions */
 document.querySelectorAll("#acCards .dm-card").forEach(function(card,i){ var a=fixAc(raw.ac[i]||{}); card.querySelector("[data-code]").textContent="A"+(i+1);
  card.querySelector("[data-stc]").innerHTML=txt(a.what)?'<span class="ca-chip '+(actDone(a)?"ok":(a.st==="done"?"warn":"info"))+'">'+esc(t("as_"+a.st))+'</span>':"";
  var msg=[]; if(txt(a.what)&&!actOwned(a)) msg.push(t("ownF")); if(a.st==="done"&&txt(a.what)&&!actDone(a)) msg.push(t("evF"));
  card.querySelector("[data-flag]").textContent=msg.join(" "); card.classList.toggle("a3-pf",msg.length>0); });
 var uo=unowned(r).length; setW("acWarn",uo>0,t("acW",{n:uo}));
 var acb=document.querySelector('[data-add="ac"]'); if(acb) acb.disabled=raw.ac.length>=MAXACTS;
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
 var y=(isD(r.date)?r.date:today()).slice(0,4), pre="PE-"+y+"-";
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
/* one outcome row for each top item that has none yet; the destination is left to the team */
function autoOutcomes(){
 var r=formToRec(), F=formRaw(), U=uncov(r).filter(function(f){ return !F.ou.some(function(o){ return o.f===f.id; }); });
 U.forEach(function(f){ if(F.ou.length<MAXOUTS) F.ou.push(blankOu(nextId(F.ou,"o",editing?editing.outs:[]),f.id)); });
 renderTbl("ou",F.ou); refreshForm(); var m=document.getElementById("ouMsg"); if(m) m.textContent=U.length?t("ouAutoDone"):"";
}

/* ---------- start from the Strategy Studio or a SWOT study (read only, preview first) ---------- */
function stSelects(){ var s=document.getElementById("stSrc"); if(!s) return; var cur=s.value||"strat"; s.innerHTML=opts1(STSRC,"ss_",cur); }
function nFrom(src,id){ return DB.records.filter(function(r){ return (r.src===src&&r.srcId===id)||r.fac.some(function(f){ return f.sid===id||f.sid.split("/")[0]===id; }); }).length; }
/* the rows a scan can start from, each as {id, x (row inside the record), t, g, info} */
function stRows(src){
 if(src==="strat"){ var R=ssRows(); if(!R) return null; return R.map(function(x){ return {id:txt(ssTKV(x.id)),x:"",t:ssTKV(x.text),g:ssG(x.f),info:pvPestle(x)}; }); }
 if(src==="swot"){ var S=recsOf(SW_KEY); if(!S) return null; var out=[]; S.forEach(function(c){ var r=SWR.fix(JSON.parse(JSON.stringify(c))); swPe(r).forEach(function(i){ out.push({id:str(r.id),x:i.id,t:i.t,g:guessG(i.evs+" "+i.ev),info:pvSwItem(r,i)}); }); }); return out; }
 return null;
}
function th(keys){ return '<thead><tr>'+keys.map(function(k){ return '<th>'+esc(t(k))+'</th>'; }).join("")+'</tr></thead>'; }
function stPreview(keep){
 var src=document.getElementById("stSrc").value||"strat", msg=document.getElementById("stMsg"), box=document.getElementById("stTable"), R=stRows(src);
 if(!R){ ST=null; box.hidden=true; msg.textContent=t("stNone"); return; }
 if(!R.length){ ST=null; box.hidden=true; msg.textContent=t("stEmpty"); return; }
 ST={src:src}; if(!keep) msg.textContent="";
 box.hidden=false;
 var studies=[]; if(src==="swot") R.forEach(function(c){ if(studies.indexOf(c.id)<0) studies.push(c.id); });
 box.innerHTML=(src==="strat"?'<div class="pd-btns" style="margin:0 0 8px"><button class="pd-btn" type="button" data-stsrc="strat" data-stid="*">'+esc(t("stAll",{n:R.length}))+'</button></div>':
   '<div class="pd-btns" style="margin:0 0 8px">'+studies.map(function(id){ return '<button class="pd-btn ghost" type="button" data-stsrc="swot" data-stid="'+esc(id)+'" data-stx="">'+esc(t("stStudy",{id:id}))+'</button>'; }).join("")+'</div>')+
  '<table class="pd-tbl">'+th(["stColId","stColT","stColG","stColInfo","stColN","stColA"])+'<tbody>'+R.map(function(c){
  return '<tr><td><b dir="ltr">'+esc(c.id)+'</b>'+(c.x?'<br><small dir="ltr">'+esc(c.x)+'</small>':'')+'</td><td>'+esc(short(c.t,140))+'</td><td>'+esc(t("gr_"+c.g))+'</td><td><small>'+esc(c.info)+'</small></td><td>'+nFrom(src,c.id)+'</td><td><button class="pd-rowbtn" type="button" data-stsrc="'+src+'" data-stid="'+esc(c.id)+'" data-stx="'+esc(c.x||"-")+'">'+esc(t("stUse"))+'</button></td></tr>'; }).join("")+'</tbody></table>';
}
function prefilled(r,src,id){ fixRec(r); editing=null; recToForm(r); go("tools"); document.getElementById("recOk").textContent=t("stUsed",{s:t("src_"+src),id:id}); return true; }
/* a new scan filled from another tool's record; that record is only read. The item (or items), its factor, its effect, its significance and
   its id are filled; the source, its date, the certainty, the team, the climate decision and the outcomes are left to the team. */
function prefillFrom(src,id,x){
 if(STSRC.indexOf(src)<0) return false;
 var r=blank(); r.src=src; r.srcId=id; r.date="";
 if(src==="strat"){ var SR=ssRows(); if(!SR) return false; var rows=id==="*"?SR:SR.filter(function(z){ return txt(ssTKV(z.id))===id; }); if(!rows.length) return false;
  rows.forEach(function(z,k){ var f=blankFa("f"+(k+1),ssG(z.f)); f.t=ssTKV(z.text); f.eff=pick(z.imp,EFFS); f.sig=wt(ssTKV(z.sig)); f.hz=pick(z.tf,HZS); f.who=ssTKV(z.owner); f.sid=txt(ssTKV(z.id)); r.fac.push(f); });
  r.title=t("pfT")+(id==="*"?t("src_strat"):short(ssTKV(rows[0].text),80)); r.scope="org"; if(id==="*") r.srcId=""; return prefilled(r,src,id==="*"?"":id); }
 if(src==="swot"){ var s=swRec(id); if(!s) return false; var I=swPe(s).filter(function(i){ return !x||x==="-"||i.id===x; }); if(!I.length) return false;
  I.forEach(function(i,k){ var f=blankFa("f"+(k+1),guessG(i.evs+" "+i.ev)); f.t=txt(i.t)+(txt(i.ev)?" — "+txt(i.ev):""); f.so=i.evs; f.d=isD(i.evd)?i.evd:""; f.eff=i.q==="o"?"o":"t"; f.sig=i.w; f.sid=str(s.id)+"/"+i.id; r.fac.push(f); });
  r.title=t("pfT")+short(s.title,80); r.scope=s.scope==="bid"?"bid":(s.scope==="project"?"project":(s.scope==="unit"?"unit":"org")); return prefilled(r,src,id); }
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
 ["IN1",{ar:"هل يُعدّ المسح فريق من ثلاثة أدوار على الأقل، وفيه رأي من خارجه (عميل أو مورد أو مستشار أو إدارة أخرى)، لا شخص واحد؟",en:"Is the scan prepared by a team of at least three roles with input from outside it (a customer, a supplier, an advisor or another department), not by one person?"}],
 ["IN2",{ar:"هل لكل بند مصدر معروف وتاريخ: نظام وتاريخ سريانه، أو رقم منشور، أو توقع باسم صاحبه؟",en:"Does every item have a known source and a date: a regulation and its effective date, a published figure, or a forecast with its author?"}],
 ["IN3",{ar:"هل البنود محددة لا عامة (لا «الاقتصاد غير مستقر»)، ويُنبَّه على البند العام حتى يُصاغ برقم أو نظام أو تاريخ؟",en:"Are the items specific rather than generic (not \"the economy is uncertain\"), and is a generic item flagged until it carries a figure, a regulation or a date?"}],
 ["EV1",{ar:"هل يُسمّى أثر كل بند على المنشأة: فرصة أو تهديد أو كلاهما، ومن يتأثر به؟",en:"Is the effect of each item on the organization named — an opportunity, a threat or both — with who is affected?"}],
 ["EV2",{ar:"هل تُقيّم أهمية كل بند ودرجة اليقين منه وأفقه الزمني؟",en:"Are the significance, the certainty and the time horizon of each item rated?"}],
 ["EV3",{ar:"هل تُرتب البنود بالأهمية × اليقين ويُحتفظ بالبنود العليا، بدل القائمة الطويلة بلا ترتيب؟",en:"Are the items ranked by significance × certainty and the top items kept, instead of a long unranked list?"}],
 ["OU1",{ar:"هل يُقرر صراحة هل تغير المناخ قضية ذات صلة، مع السبب (ISO 9001:2026 البند 4.1)؟",en:"Is it decided explicitly whether climate change is a relevant issue, with the reason (ISO 9001:2026 clause 4.1)?"}],
 ["OU2",{ar:"هل تدخل البنود العليا في تحليل SWOT فرصاً أو تهديدات؟",en:"Do the top items go into the SWOT analysis as opportunities or threats?"}],
 ["OU3",{ar:"هل تدخل البنود العليا في سجل المخاطر أو خطة المخاطر والفرص (6.1)، أو تُستبعد بسبب مكتوب؟",en:"Do the top items go into the risk register or the risks and opportunities plan (6.1), or are they set aside with a written reason?"}],
 ["RV1",{ar:"هل يؤرخ المسح ويُحدد موعد مراجعته، ويُراجع دورياً وبعد الأحداث الكبرى (نظام جديد، أزمة، تغير في السوق)؟",en:"Is the scan dated with a review date set, and reviewed periodically and after major events (a new regulation, a crisis, a market shift)?"}],
 ["RV2",{ar:"هل تُعرض تغيرات القضايا الخارجية في مراجعة الإدارة (ISO 9001:2026 البند 9.3.2 ب))؟",en:"Are the changes in external issues presented at management review (ISO 9001:2026 clause 9.3.2 b))?"}],
 ["RV3",{ar:"هل تُبلَّغ نتيجة المسح والقرارات التي خرجت منه إلى من يحتاجها؟",en:"Are the result of the scan and the decisions taken from it communicated to those who need them?"}]
];
var AGROUPS=["IN","EV","OU","RV"];
var GCOL2={IN:"#1E8C93",EV:"#1B2A4A",OU:"#2F7D4B",RV:"#3C9A5F"};
function assessScore(g){ return TBX.score(AQ,DB.assess,g?function(q){ return q[0].slice(0,2)===g; }:null); }
function assessAnswered(){ return TBX.answered(AQ,DB.assess); }
function bandOf(p){ return TBX.band(p,[t("band0"),t("band1"),t("band2")]); }
function renderAssess(){
 var list=document.getElementById("asList"); if(!list) return;
 list.innerHTML=AGROUPS.map(function(g){
  return '<h3 class="pd-sub" style="margin:14px 0 2px;font-weight:700;color:'+GCOL2[g]+'">'+esc(t("g_"+g))+'</h3>'+AQ.filter(function(q){ return q[0].slice(0,2)===g; }).map(function(q){
   var cur=DB.assess[q[0]];
   var o=[0,1,2].map(function(v){ var id="as-"+q[0]+"-"+v; return '<label class="opt" for="'+id+'"><input type="radio" name="as-'+q[0]+'" value="'+v+'" id="'+id+'"'+(cur===v?" checked":"")+'><span>'+esc(t("as"+v))+'</span></label>'; }).join("");
   return '<div class="pd-q ex-aq" id="as-'+q[0]+'" data-id="'+q[0]+'"><fieldset><legend data-ex-head><span class="pd-badge">'+q[0]+'</span> '+esc(q[1][L]||q[1].ar)+'</legend><div class="pd-opts">'+o+'</div></fieldset></div>';
  }).join("");
 }).join("");
 var p=assessScore();
 document.getElementById("asPct").textContent=p+"%";
 document.getElementById("asGauge").style.setProperty("--p",p);
 document.getElementById("asGauge").setAttribute("aria-label",p+"%");
 document.getElementById("asStages").innerHTML=AGROUPS.map(function(g){ var sp=assessScore(g); return TBX.bar(t("g_"+g),sp+"%",sp,GCOL2[g]); }).join("")+
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
  var st=stageOf(r), T=topList(r), A=acts(r), F=facs(r), ng=shownG(r).filter(function(g){ return inG(r,g.k).length; }).length;
  var del=(pendingDelete===r.id)?'<button class="pd-rowbtn arm" type="button" data-del="'+esc(r.id)+'">'+esc(t("delArm"))+'</button>':'<button class="pd-rowbtn" type="button" data-del="'+esc(r.id)+'">'+esc(t("del"))+'</button>';
  var lk=(r.src!=="none"&&(r.srcId||r.src==="strat")?'<button class="pd-rowbtn" type="button" data-osrc="'+esc(r.src)+'" data-oid="'+esc(r.srcId)+'">'+esc(t("src_"+r.src))+' ↗</button>':'');
  return '<tr><td><b dir="ltr">'+esc(r.ref||"—")+'</b><br>'+esc(r.title)+'<br><small dir="ltr" style="color:var(--muted)">'+esc(r.id)+(isD(r.date)?' · '+esc(r.date):'')+'</small></td><td>'+esc(t("sc_"+r.scope))+(r.level?' · '+esc(t("lv_"+r.level)):'')+'<br><small>'+esc(short(r.decision,120)||"—")+'</small></td><td>'+stChip(st)+'</td><td>'+esc(t("facN",{n:F.length,g:ng}))+'</td><td>'+(T.length?T.filter(srcOk).length+"/"+T.length:"—")+'</td><td>'+(T.length?T.filter(function(f){ return covered(r,f); }).length+"/"+T.length:"—")+' · '+(A.length?A.filter(actOwned).length+"/"+A.length:"—")+'</td><td>'+flagsOf(r).map(chip).join("")+'</td><td><button class="pd-rowbtn" type="button" data-open="'+esc(r.id)+'">'+esc(t("open"))+'</button>'+del+lk+'</td></tr>';
 }).join("");
 box.innerHTML='<table class="pd-tbl">'+th(["colRef","colScope","colStage","colFac","colTop","colOut","colFlags","colAct"])+'<tbody>'+rows+'</tbody></table>';
}
document.addEventListener("click",function(e){
 if(e.target.closest("#cb")) return;
 var o=e.target.closest("[data-open]"); if(o){ var r=DB.records.find(function(x){ return x.id===o.getAttribute("data-open"); }); if(r){ loadRecordIntoForm(r); go("tools"); } return; }
 var d=e.target.closest("[data-del]"); if(d){ var id=d.getAttribute("data-del"); if(pendingDelete===id){ DB.records=DB.records.filter(function(x){ return x.id!==id; }); pendingDelete=null; persist(); if(document.getElementById("rid").value===id) clearForm(); renderAll(); } else { pendingDelete=id; renderDocs(); } return; }
 var os=e.target.closest("[data-osrc]"); if(os){ openSrc(os.getAttribute("data-osrc"),os.getAttribute("data-oid")); return; }
 if(e.target.closest("#srcOpen")){ var r2=formToRec(); openSrc(r2.src,r2.srcId); return; }
 if(e.target.closest("#ouAuto")){ autoOutcomes(); return; }
 if(e.target.closest("#grAdd")){ var G=formRaw(), used=G.gr.map(function(g){ return g.k; }), nx=XG.filter(function(k){ return used.indexOf(k)<0; })[0]; if(nx){ var keepF=G.fa; G.gr.push({k:nx,n:"",nr:""}); renderGroups(G.gr,keepF.map(fixFa)); var ni=document.getElementById("g-"+nx+"-n"); if(ni) ni.focus(); } else { var gm=document.getElementById("grMsg"); if(gm) gm.textContent=t("grMax"); } refreshForm(); return; }
 var gd=e.target.closest("[data-gdel]"); if(gd){ var G2=formRaw(), k2=gd.getAttribute("data-gdel"); renderGroups(G2.gr.filter(function(g){ return g.k!==k2; }),G2.fa.filter(function(f){ return f.g!==k2; }).map(fixFa)); refreshForm(); return; }
 var ou=e.target.closest("[data-ouo]"); if(ou){ var tr=ou.closest("tr"), dv=(tr.querySelector('[data-k="to"]')||{}).value, rf=txt((tr.querySelector('[data-k="ref"]')||{}).value); if(dv==="iso31000") openTool("iso31000-risk-studio.html"); else if(rf) openSwot(rf); return; }
 var rel=e.target.closest("[data-rel]"); if(rel){ e.preventDefault(); var R0=RELATED.filter(function(x){ return x[0]===rel.getAttribute("data-rel"); })[0]; if(R0) openTool(R0[2].replace("./","").split("#")[0],R0[4]||undefined); return; }
 var df=e.target.closest("[data-fdel]"); if(df){ var raw=formRaw(), g=df.getAttribute("data-fg"), ii=Number(df.getAttribute("data-fi")), gi=-1;
  raw.fa=raw.fa.filter(function(x){ if(x.g!==g) return true; gi++; return gi!==ii; });
  renderFac(raw.fa.map(fixFa)); refreshForm(); return; }
 var ad=e.target.closest("[data-add]"); if(ad){ var tb=ad.getAttribute("data-add"), F=formRaw();
  if(tb.indexOf("fa:")===0){ var gg=tb.slice(3); if(F.fa.length<MAXFAC){ F.fa.push(blankFa(nextId(F.fa,"f",editing?editing.fac:[]),gg)); renderFac(F.fa.map(fixFa)); var bx=document.getElementById("faC-"+gg), lt=bx&&bx.querySelector(".dm-card:last-child textarea"); if(lt) lt.focus(); } refreshForm(); return; }
  if(tb==="ac"){ if(F.ac.length<MAXACTS){ F.ac.push(blankAc(nextId(F.ac,"a",editing?editing.acts:[]))); renderActs(F.ac.map(fixAc)); var ba=document.getElementById("acCards"), la=ba&&ba.querySelector(".dm-card:last-child textarea"); if(la) la.focus(); } refreshForm(); return; }
  var list=F[tb]; if(list.length<TB[tb].max){ var nb=TB[tb].blank(); if(TB[tb].pre) nb.id=nextId(list,TB[tb].pre,editing?editing[TB[tb].key]:[]); list.push(nb); renderTbl(tb,list); var box=document.getElementById(tb+"Rows"), lt2=box&&box.querySelector("tr:last-child input, tr:last-child select, tr:last-child textarea"); if(lt2) lt2.focus(); } refreshForm(); return; }
 var rd=e.target.closest("[data-rdel]"); if(rd){ var a=rd.getAttribute("data-rdel").split(":"), F2=formRaw(), l2=F2[a[0]]; l2.splice(Number(a[1]),1);
  if(a[0]==="ac") renderActs(l2.map(fixAc)); else renderTbl(a[0],l2); refreshForm(); return; }
});
/* a new source tool clears the record id of the old one, and the list of ids follows the tool */
document.addEventListener("change",function(e){
 var el=e.target; if(!el) return;
 if(el.id==="f-src"){ var s=document.getElementById("f-srcId"); if(s) s.value=""; fillLists(); refreshForm(); }
},true);

/* ---------- automatic audit of scans ---------- */
var CHECKS=["ref","team","groups","src","gen","clim","rank","outs","acts","review"];
function auditRecord(r){
 var F=facs(r), T=topList(r);
 return {
  ref:!!(txt(r.ref)&&txt(r.title)&&txt(r.decision)&&SCOPES.indexOf(r.scope)>=0&&LEVELS.indexOf(r.level)>=0),
  team:teamOk(r),
  groups:!notConsidered(r).length,
  src:T.length?T.every(srcOk):null,
  gen:T.length?!T.some(genOf):null,
  clim:climOk(r),
  rank:F.length?!unrated(r).length:null,
  outs:T.length?!uncov(r).length:null,
  acts:(acts(r).length||atLeast(r,"ranked"))?(acts(r).length>0&&!unowned(r).length):null,
  review:(isD(r.revBy)||atLeast(r,"outcomes"))?kept(r):null
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
 var R=DB.records, c={n:R.length,top:0,topSrc:0,topOut:0,rev:0,gen:0,fac:0,scope:{},grp:{},to:{}};
 SCOPES.forEach(function(k){ c.scope[k]=0; }); CHG.forEach(function(k){ c.grp[k]=0; }); TOS.forEach(function(k){ c.to[k]=0; });
 R.forEach(function(r){ var T=topList(r); c.top+=T.length; c.topSrc+=T.filter(srcOk).length; c.topOut+=T.filter(function(f){ return covered(r,f); }).length; if(revGood(r,lastRev(r))) c.rev++;
  c.scope[r.scope]++; facs(r).forEach(function(f){ c.fac++; c.grp[XG.indexOf(f.g)>=0?"x":f.g]++; if(genOf(f)) c.gen++; });
  r.outs.forEach(function(o){ var f=facById(r,o.f); if(f&&T.indexOf(f)>=0&&outOk(r,o)) c.to[o.to]++; }); });
 c.outs=TOS.reduce(function(a,k){ return a+c.to[k]; },0);
 return c;
}
function pct(a,n){ return n?Math.round(a/n*100)+"%":"—"; }
function renderDash(){
 var box=document.getElementById("dKpis"); if(!box) return;
 var c=counts(), au=auditSummary(), as=assessScore(), n=c.n, oi=openItems();
 box.innerHTML=TBX.kpi(n,t("kTotal"))+TBX.kpi(c.top?c.topSrc+"/"+c.top:"—",t("kSrc"))+TBX.kpi(c.top?c.topOut+"/"+c.top:"—",t("kOut"))+TBX.kpi(pct(c.rev,n),t("kRev"))+TBX.kpi(c.fac,t("kFac"))+TBX.kpi(c.gen,t("kGen"))+TBX.kpi(oi.length,t("kOpen"))+TBX.kpi(au.rate===null?"—":au.rate+"%",t("kAud"))+TBX.kpi(as+"%",t("kAs"));
 var nd='<p class="pd-sub" style="color:var(--ink-soft)">'+esc(t("noData"))+'</p>';
 document.getElementById("dStage").innerHTML=n?TBX.dist(STAGES,n,function(s){ return DB.records.filter(function(r){ return stageOf(r)===s; }).length; },stageName,function(s){ return SCOL[s]; }):nd;
 document.getElementById("dScope").innerHTML=n?TBX.dist(SCOPES,n,function(k){ return c.scope[k]; },function(k){ return t("sc_"+k); },function(){ return "#1B2A4A"; }):nd;
 document.getElementById("dGrp").innerHTML=c.fac?TBX.dist(CHG,c.fac,function(k){ return c.grp[k]; },function(k){ return t("gr_"+k); },function(k){ return GCOL[k==="x"?"x1":k]; }):nd;
 document.getElementById("dTo").innerHTML=c.outs?TBX.dist(TOS,c.outs,function(k){ return c.to[k]; },function(k){ return t("to_"+k); },function(){ return "#C9821A"; }):nd;
 document.getElementById("dAssess").innerHTML=AGROUPS.map(function(g){ var p=assessScore(g); return TBX.bar(t("g_"+g),p+"%",p,GCOL2[g]); }).join("")+'<p class="pd-sub" style="font-size:12.5px;color:var(--muted);margin:10px 0 0">'+esc(t("bandNote"))+'</p>';
 var dc=document.getElementById("dChart"); if(dc) dc.innerHTML=srcSVG(DB.records,{lang:L,W:chartW()});
 var ds=document.getElementById("dShare"); if(ds) ds.textContent=shareLine(DB.records);
 document.getElementById("dOpen").innerHTML=oi.length?oi.map(function(x){ return '<li><b>'+esc(x.r.ref||x.r.id)+'</b>'+chip([x.r.id,"info"])+'<span>'+esc(x.s)+'</span></li>'; }).join(""):'<li>'+esc(n?t("noOpen"):t("noData"))+'</li>';
}

/* ---------- report and CSV ---------- */
function buildCSV(){
 var head=["id","ref","title","scope","level","decision","date","facilitator","owner","nextReview","reviewTriggers","source","sourceId","stage","team","factorsNotRelevant","political","economic","social","technological","legal","environmental","addedFactors","climateChange","topItems","outcomes","actions","reviews","lastReview"];
 return TBX.csv(head,DB.records.map(function(r){
  var CD=codes(r), T=topList(r), lr=lastRev(r);
  var tm=r.team.map(function(m){ return m.n+" ("+m.role+(m.ext!=="no"?", "+m.ext:"")+")"; }).join(" | ");
  var it=function(f){ return CD[f.id]+" ["+(f.eff||"-")+"] "+f.t+(f.so?" ("+f.so+(f.d?" "+f.d:"")+")":"")+" — s"+(f.sig||"-")+" c"+(f.cer||"-")+" "+(f.hz||"-")+(f.who?" — "+f.who:"")+(f.sid?" — "+f.sid:""); };
  var g=function(k){ return r.fac.filter(function(f){ return f.g===k; }).map(it).join(" | "); };
  var nr=r.grp.filter(function(x){ return txt(x.nr); }).map(function(x){ return GC[x.k]+": "+x.nr; }).join(" | ");
  var xg=r.grp.filter(function(x){ return XG.indexOf(x.k)>=0; }).map(function(x){ return gName(r,x.k,"en")+": "+r.fac.filter(function(f){ return f.g===x.k; }).map(it).join(" ; "); }).join(" | ");
  var ou=r.outs.map(function(o){ return CD[o.id]+" ("+(CD[o.f]||"-")+") → "+o.to+(o.q?" ["+o.q+"]":"")+(o.ref?" "+o.ref:"")+(o.what?" — "+o.what:"")+(o.why?" — why: "+o.why:"")+(o.who?" — "+o.who:""); }).join(" | ");
  var ac=r.acts.map(function(a){ return CD[a.id]+" ("+(CD[a.f]||"-")+") "+a.what+" — "+a.who+" by "+a.by+" — "+a.st+(a.done?" "+a.done:"")+(a.ev?" — "+a.ev:""); }).join(" | ");
  var rv=r.revs.map(function(v){ return CD[v.id]+" "+v.date+" ["+v.trig+"] — "+v.chg+(v.add?" — added: "+v.add:"")+(v.rem?" — removed: "+v.rem:""); }).join(" | ");
  return [r.id,r.ref,r.title,r.scope,r.level,r.decision,r.date,r.facil,r.owner,r.revBy,r.trig,r.src,r.srcId,stageOf(r),tm,nr,g("p"),g("e"),g("s"),g("t"),g("l"),g("en"),xg,(r.clim.dec||"-")+(r.clim.why?" — "+r.clim.why:""),T.map(function(f){ return CD[f.id]+" "+score(f); }).join(" | "),ou,ac,rv,lr?lr.date:""]; }));
}
function recReport(r){
 var CD=codes(r), A=auditRecord(r), T=topList(r);
 var row=function(k,v){ return '<tr><th>'+esc(k)+'</th><td>'+esc(v===null||v===undefined||v===""?"—":v)+'</td></tr>'; };
 var mark=function(v){ return v===null?'<td class="na">—</td>':(v?'<td class="ok">✓</td>':'<td class="bad">✗</td>'); };
 var tbl=function(list,heads,cells){ return list.length?'<table><thead><tr>'+heads.map(function(h){ return '<th>'+esc(t(h))+'</th>'; }).join("")+'</tr></thead><tbody>'+list.map(function(x){ return '<tr>'+cells(x).map(function(c){ return '<td>'+esc(c===""||c===null?"—":c)+'</td>'; }).join("")+'</tr>'; }).join("")+'</tbody></table>':'<p class="meta">—</p>'; };
 var F2=r.fac.slice().sort(function(a,b){ return ALLG.indexOf(a.g)-ALLG.indexOf(b.g); });
 return '<section class="an"><h3><span dir="ltr">'+esc(r.id)+'</span> · <span dir="ltr">'+esc(r.ref||"—")+'</span> — '+esc(r.title)+'</h3>'+
  '<p class="meta">'+esc(t("colStage"))+': <b>'+esc(stageName(stageOf(r)))+'</b> · '+esc(t("sc_"+r.scope))+(r.level?' · '+esc(t("lv_"+r.level)):'')+' · '+esc(t("src_"+r.src))+(r.srcId?' <span dir="ltr">'+esc(r.srcId)+'</span>':'')+'</p>'+
  mapHTML(r)+
  '<table><tbody>'+row(t("f_decision"),r.decision)+row(t("f_date"),r.date)+row(t("f_facil"),r.facil)+row(t("f_owner"),r.owner)+row(t("f_revBy"),r.revBy)+row(t("f_trig"),r.trig)+'</tbody></table>'+
  '<h4>'+esc(t("rpTeam"))+'</h4>'+tbl(r.team,["tmN","tmRole","tmExt"],function(m){ return [m.n,m.role,t("ex_"+m.ext)]; })+
  '<h4>'+esc(t("rpBoard"))+'</h4>'+boardHTML(r)+
  '<div class="pe-two"><div><h4>'+esc(t("rpMx"))+'</h4>'+matrixHTML(r)+'</div><div><h4>'+esc(t("rpTl"))+'</h4>'+timelineHTML(r)+'</div></div>'+
  '<h4>'+esc(t("rpClim"))+'</h4><p>'+esc(r.clim.dec?t("cl_"+r.clim.dec):t("cl_"))+(r.clim.why?' — '+esc(r.clim.why):'')+'</p>'+
  '<h4>'+esc(t("rpFac"))+'</h4>'+tbl(F2,["fa_t","fa_so","fa_eff","fa_sig","fa_cer","fa_hz","fa_who"],function(f){ return [CD[f.id]+" · "+f.t+(T.indexOf(f)>=0?" ★":"")+(genOf(f)?" ⚠":""),(f.so||t("srcF"))+(f.d?" · "+f.d:"")+(f.sid?" · "+f.sid:""),f.eff?t("eff_"+f.eff):"",f.sig||"",f.cer||"",f.hz?t("hz_"+f.hz):"",f.who]; })+
  '<h4>'+esc(t("rpOut"))+'</h4>'+tbl(r.outs,["ou_f","ou_to","ou_q","ou_ref","ou_what","ou_why","ou_who"],function(o){ return [(CD[o.id]||"")+" · "+(CD[o.f]||"—"),t("to_"+o.to),o.q?t("oq_"+o.q):"",o.ref,o.what,o.why,o.who]; })+
  '<h4>'+esc(t("rpActs"))+'</h4>'+tbl(r.acts,["ac_f","ac_what","ac_who","ac_by","ac_st","ac_done","ac_ev"],function(a){ return [(CD[a.id]||"")+" · "+(CD[a.f]||"—"),a.what,a.who,a.by,t("as_"+a.st),a.done,a.ev]; })+
  '<h4>'+esc(t("rpRev"))+'</h4>'+tbl(r.revs,["rvDate","rvTrig","rvChg","rvAdd","rvRem"],function(v){ return [v.date,t("rt_"+v.trig),v.chg,v.add,v.rem]; })+
  '<h4>'+esc(t("rpAu"))+'</h4><table><thead><tr>'+CHECKS.map(function(k){ return '<th>'+esc(t("k_"+k))+'</th>'; }).join("")+'</tr></thead><tbody><tr>'+CHECKS.map(function(k){ return mark(A[k]); }).join("")+'</tr></tbody></table></section>';
}
var MAP_CSS=".dm-map{list-style:none;margin:8px 0 12px;padding:0;display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:6px}.dm-map li{display:flex;gap:6px;align-items:center;border:1px solid #DCE4EE;border-radius:10px;padding:6px 7px;background:#fff;min-width:0}.dm-map li i{font-style:normal;flex:none;display:inline-grid;place-items:center;width:24px;height:24px;border-radius:50%;background:#EEF1F6;color:#4B5874;font-family:Georgia,serif;font-weight:700;font-size:12px}.dm-map li span{display:flex;flex-direction:column;min-width:0}.dm-map li b{font-size:12px}.dm-map li small{font-size:10.5px;color:#4B5874}.dm-map li.done i,.dm-map li.cur i{background:var(--pc);color:#fff}.dm-map li.done{border-color:var(--pc)}.dm-map li.cur{border:2px solid var(--pc)}.dm-map li.todo{opacity:.72}@media (max-width:760px){.dm-map{grid-template-columns:1fr}}";
var VIEW_CSS=".pe-board{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin:8px 0}.pe-g{border:1px solid #DCE4EE;border-top:4px solid var(--gc);border-radius:10px;padding:8px 10px;min-width:0;background:#fff}.pe-g h4{margin:0 0 4px;display:flex;flex-wrap:wrap;gap:4px 8px;align-items:baseline;color:var(--gc)}.pe-g h4 b{font-family:Georgia,serif}.pe-g h4 small{color:#4B5874;font-weight:400;font-size:11.5px}.pe-g ol{margin:0;padding:0;list-style:none;display:grid;gap:4px}.pe-g li{display:flex;gap:6px;align-items:baseline;font-size:13px;overflow-wrap:anywhere;min-width:0}.pe-g li span{flex:1;min-width:0}.pe-g li.top span{font-weight:600}.pe-g code{font-family:Georgia,serif;font-weight:700;color:var(--gc)}.pe-g em{font-style:normal;color:#4B5874;font-size:11.5px;white-space:nowrap}.pe-none,.pe-more{margin:2px 0;color:#7A869E;font-size:12.5px}.pe-two{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.pe-mx{border-collapse:separate;border-spacing:3px;width:100%;table-layout:fixed}.pe-mx caption{caption-side:top;text-align:start;font-size:12px;color:#4B5874;padding:0 0 4px}.pe-mx th{font-size:11.5px;color:#4B5874;font-weight:700;width:22px}.pe-mx td{height:44px;border-radius:6px;vertical-align:middle;text-align:center;padding:2px}.pe-mx td.lo{background:#E5F4EA}.pe-mx td.md{background:#FBEBCB}.pe-mx td.hi{background:#F6D5D2}.pe-mc{display:inline-block;margin:1px;padding:0 4px;border-radius:4px;background:#fff;border:1px solid var(--gc);color:var(--gc);font-size:10.5px;font-weight:700;font-family:Georgia,serif}.pe-mc.top{background:var(--gc);color:#fff}.pe-tl{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}.pe-tl section{border:1px solid #DCE4EE;border-radius:10px;padding:6px 8px;min-width:0;background:#fff}.pe-tl h5{margin:0 0 4px;font-size:12.5px;color:#1B2A4A}.pe-tl ul{margin:0;padding:0;list-style:none;display:grid;gap:3px}.pe-tl li{font-size:12px;display:flex;gap:5px;align-items:baseline;overflow-wrap:anywhere;min-width:0}.pe-tl li span{flex:1;min-width:0}.pe-tl li code{font-family:Georgia,serif;font-weight:700;color:var(--gc)}.pe-tl li.top span{font-weight:600}";
function buildReportHTML(){
 var c=counts(), au=auditSummary(), as=assessScore(), d=today(), n=c.n, A=TBX.audit(DB.records,auditRecord,CHECKS), oi=openItems();
 var mark=function(v){ return v===null?'<td class="na">—</td>':(v?'<td class="ok">✓</td>':'<td class="bad">✗</td>'); };
 var grpRows=AGROUPS.map(function(g){ return '<tr><td>'+esc(t("g_"+g))+' — '+g+'</td><td>'+assessScore(g)+'%</td></tr>'; }).join("");
 var auRows=A.rows.map(function(x){ return '<tr><td dir="ltr">'+esc(x.r.id)+'</td>'+CHECKS.map(function(k){ return mark(x.res[k]); }).join("")+'</tr>'; }).join("");
 var body='<div class="cover"><p class="kick">Continual Improvement Academy · CIA Toolbox</p><h1>PESTLE Analysis / تحليل PESTLE</h1><p class="sub">'+esc(t("rpCover"))+'</p>'+
  '<p class="meta">'+esc(t("prep"))+': <bdi><strong>مدثر سلامه</strong></bdi> · <bdi dir="ltr">'+esc(d)+'</bdi> · <bdi>'+esc(t("kTotal"))+': '+n+'</bdi></p></div>'+
  '<h2>Summary / الملخص</h2><div class="k">'+
   '<div><b>'+n+'</b>'+esc(t("kTotal"))+'</div><div><b>'+(c.top?c.topSrc+"/"+c.top:"—")+'</b>'+esc(t("kSrc"))+'</div><div><b>'+(c.top?c.topOut+"/"+c.top:"—")+'</b>'+esc(t("kOut"))+'</div><div><b>'+pct(c.rev,n)+'</b>'+esc(t("kRev"))+'</div><div><b>'+c.fac+'</b>'+esc(t("kFac"))+'</div><div><b>'+c.gen+'</b>'+esc(t("kGen"))+'</div><div><b>'+oi.length+'</b>'+esc(t("kOpen"))+'</div><div><b>'+(au.rate===null?"—":au.rate+"%")+'</b>'+esc(t("kAud"))+'</div><div><b>'+as+'%</b>'+esc(t("kAs"))+'</div></div>'+
  '<div class="chart"><p class="meta">'+esc(t("chT"))+(shareLine(DB.records)?' · '+esc(shareLine(DB.records)):'')+'</p>'+srcSVG(DB.records,{lang:L,W:560})+'</div>'+
  '<h2>'+esc(t("rpReg"))+' / The scans</h2>'+(n?DB.records.map(recReport).join(""):'<p class="meta">'+esc(t("rpEmpty"))+'</p>')+
  '<h2>Audit results / نتائج التدقيق</h2>'+(n?'<p>'+esc(t("auPass"))+': '+(au.rate===null?"—":au.rate+"% ("+au.pass+"/"+au.applic+")")+'</p><table><thead><tr><th>ID</th>'+CHECKS.map(function(k){ return '<th>'+esc(t("k_"+k))+'</th>'; }).join("")+'</tr></thead><tbody>'+auRows+'</tbody></table>':'<p class="meta">—</p>')+
  '<h2>Open items / بنود تحتاج متابعة</h2>'+(oi.length?'<ul>'+oi.map(function(x){ return '<li><span dir="ltr">'+esc(x.r.id)+' · '+esc(x.r.ref||"—")+'</span> — '+esc(x.s)+'</li>'; }).join("")+'</ul>':'<p class="meta">'+esc(n?t("noOpen"):"—")+'</p>')+
  '<h2>Self-assessment / التقييم الذاتي</h2><table><thead><tr><th>Area / المحور</th><th>Score / النتيجة</th></tr></thead><tbody>'+grpRows+'<tr><td><b>'+esc(t("kAs"))+'</b></td><td><b>'+as+'%</b></td></tr></tbody></table><p class="meta">'+esc(t("bandNote"))+'</p>'+
  '<footer>Prepared by / أعدّه: مدثر سلامه · PESTLE is a technique, not a requirement of any standard: it is useful only when its items are specific, sourced and dated and lead to something; each item names its effect, significance, certainty and horizon; generic items are flagged; the list is ranked by significance × certainty; climate change is decided explicitly; every top item goes into SWOT, the risk register or the 6.1 plan, or is set aside with a reason; the scan is dated and reviewed periodically and after major events. Sources / المراجع: ISO 9001:2026 clauses 4.1, 4.2, 6.1.1, 6.1.2, 6.1.3 and 9.3.2 and Annex A.4.1; ISO 9000:2026 3.1.2, 3.7.2 and 4.4.1; ISO 10009:2024 5.1, 5.2, 5.3 and 7.2, Tables A.1 and C.1 (interpretive summaries, not the official text); PESTLE textbooks, scenario planning, horizon scanning and ISO 31000 not verified (not uploaded) · Examples are illustrative.</footer>';
 return TBX.reportDoc(L,'PESTLE Report — مدثر سلامه',body,MAP_CSS+VIEW_CSS+'.ok{color:#2F7D4B;font-weight:700;text-align:center}.bad{color:#B42318;font-weight:700}td.bad{text-align:center}.na{color:#7A869E;text-align:center}ul{padding-inline-start:20px}h3{font-family:Georgia,serif;margin:22px 0 4px;font-size:17px}h4{margin:14px 0 4px;font-size:14.5px}.an{border-top:1px solid #DCE4EE;padding-top:6px;break-inside:auto}.an th{background:#F3F7FB;color:#1B2A4A}.an tbody th{width:30%}.an .pe-mx th{background:none;width:22px}.chart{margin:8px 0}.chart svg{max-width:100%;height:auto}.cover{border-bottom:4px solid #B8901E;padding:18px 0 14px;margin-bottom:8px}.cover h1{border:0;margin:6px 0}.cover .kick{color:#B8901E;font-weight:700;letter-spacing:.04em;margin:0}.cover .sub{font-size:18px;margin:4px 0}@media print{.an{page-break-before:always}}');
}
function stamp(){ return today(); }
function renderReport(){
 var prev=document.getElementById("rpPrev"); if(!prev) return;
 if(!DB.records.length){ prev.innerHTML='<p class="pd-sub" style="color:var(--ink-soft)">'+esc(t("rpEmpty"))+'</p>'; return; }
 var c=counts(), au=auditSummary();
 prev.innerHTML='<div class="pd-kpis">'+TBX.kpi(c.n,t("kTotal"))+TBX.kpi(c.top?c.topSrc+"/"+c.top:"—",t("kSrc"))+TBX.kpi(c.top?c.topOut+"/"+c.top:"—",t("kOut"))+TBX.kpi(openItems().length,t("kOpen"))+TBX.kpi(au.rate===null?"—":au.rate+"%",t("kAud"))+'</div>';
}
document.getElementById("rpHtml").addEventListener("click",function(){
 var err=document.getElementById("rpErr"); err.textContent="";
 if(!DB.records.length && !Object.keys(DB.assess).length){ err.textContent=t("rpEmpty"); return; }
 TBX.download("PESTLE-report-"+stamp()+".html","text/html;charset=utf-8",buildReportHTML());
});
document.getElementById("rpCsv").addEventListener("click",function(){ var err=document.getElementById("rpErr"); err.textContent=""; if(!DB.records.length){ err.textContent=t("rpEmpty"); return; } TBX.download("PESTLE-scans-"+stamp()+".csv","text/csv;charset=utf-8",buildCSV()); });
document.getElementById("dCsv").addEventListener("click",function(){ if(!DB.records.length) return; TBX.download("PESTLE-scans-"+stamp()+".csv","text/csv;charset=utf-8",buildCSV()); });

/* ---------- platform identity: academy logo and related tools ---------- */
var LOGO="__LOGO__";
function applyLogo(){ document.querySelectorAll("img[data-logo]").forEach(function(i){ if(i.src!==LOGO) i.src=LOGO; i.alt=t("logoAlt"); }); }
var RELATED=[["str","Strategy","./strategy-performance.html#pestle","#3563C9","pestle"],["swot","SWOT","./swot.html","#3C9A5F"],["iso10009","ISO 10009","./iso10009.html#explain-cl","#7B5BB8","explain-cl"],["lessons","Lessons","./lessons.html","#B8901E"],["iso31000","ISO 31000","./iso31000-risk-studio.html","#1B2A4A"],["fmea","FMEA","./fmea.html","#B42318"],["pareto","Pareto","./pareto.html","#C9821A"],["rca","RCA","./rca.html","#1B2A4A"],["a3","A3","./a3.html","#B8901E"],["pdca","PDCA","./pdca.html","#3C9A5F"]];
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

/* ---------- assistant: answers from the tool's own guide and your scans (rule-based, no AI service) ---------- */
var CONTACT_EMAIL="moddathersalama.eng@gmail.com";
var CB={
 ar:{fab:"اسأل عن PESTLE",title:"مساعد PESTLE",sub:"إجابات فورية من دليل الأداة ومسوحك",new:"محادثة جديدة",close:"إغلاق",ph:"اكتب سؤالك…",send:"إرسال",inL:"سؤالك",
  hello:"مرحباً. أجيب عن أسئلة تحليل PESTLE من دليل الأداة ومن مسوحك المحفوظة في هذا المتصفح. اختر سؤالاً أو اكتب سؤالك.",
  miss:"لم أجد إجابة جاهزة لهذا السؤال. جرّب أحد الأسئلة المقترحة، أو اسأل عن: ما الذي يجعل PESTLE مفيداً، أو الفرق بين PESTLE وSWOT وقوى بورتر، أو تغير المناخ، أو البند المحدد، أو المراجعة. وللاستشارة راسل المُعِد على البريد أدناه.",
  instant:"إجابة فورية",foot:"المساعد يعمل في متصفحك ولا يرسل بياناتك. للتواصل:",
  op0:"لا توجد بنود مفتوحة في مسوحك الآن.",st0:"لا توجد مسوح بعد. ابدأ من [[tab:tools]] أو حمّل المثال من [[tab:docs]]."},
 en:{fab:"Ask about PESTLE",title:"PESTLE assistant",sub:"Instant answers from the tool's guide and your scans",new:"New chat",close:"Close",ph:"Type your question…",send:"Send",inL:"Your question",
  hello:"Hello. I answer questions on PESTLE analysis from the tool's guide and from your scans saved in this browser. Pick a question or type your own.",
  miss:"I have no ready answer for that. Try one of the suggested questions, or ask what makes a PESTLE useful, PESTLE against SWOT and Porter's forces, climate change, a specific item, or the review. For advice, email the author at the address below.",
  instant:"Instant answer",foot:"The assistant runs in your browser and sends no data. Contact:",
  op0:"No open items in your scans right now.",st0:"No scans yet. Start from the [[tab:tools]] or load the example in [[tab:docs]]."}
};
var KB=[
 {id:"useful",k:["مفيد","مفيدا","مفيداً","يفيد","useful","worth","good pestle","فائدة","value"],q:{ar:"ما الذي يجعل تحليل PESTLE مفيداً؟",en:"What makes a PESTLE useful?"},
  a:{ar:"**بنود محددة بمصدر وتاريخ تقود إلى شيء.** قائمة من ستة عناوين لا تغيّر قراراً. لذلك تحسب الأداة المرحلة: **حُدد النطاق** (والمستوى والقرار الذي يخدمه المسح)، ثم **اكتمل الفريق** (ثلاثة أدوار ورأي من الخارج)، ثم **بنود بمصادر** (العوامل الستة مدروسة، وكل بند بمصدره وتاريخه)، ثم **قُرر المناخ**، ثم **رُتّبت** (أثر وأهمية ويقين وأفق لكل بند، ولا بند عام بين العليا)، ثم **مخرجات** (كل بند أعلى إلى SWOT أو سجل المخاطر أو خطة 6.1 أو يُستبعد بسبب)، ثم **روجع**. في المثال: «متطلبات العزل الحراري الجديدة، إلزامية من 2027» بند قانوني بمصدره، دخل دراسة SW-EX-01 فرصةً.",
   en:"**Specific items, with a source and a date, that lead to something.** A list of six headings changes no decision. So the tool computes the stage: **scoped** (with the level and the decision the scan serves), **team complete** (three roles and outside input), **items with sources** (all six factors looked at, every item with its source and date), **climate decided**, **ranked** (effect, significance, certainty and horizon for every item, no generic item among the top), **outcomes** (every top item into SWOT, the risk register or the 6.1 plan, or set aside with a reason), then **reviewed**. In the example, \"the new thermal insulation requirements, mandatory from 2027\" is a legal item with its source that went into study SW-EX-01 as an opportunity."}},
 {id:"which",k:["swot","بورتر","porter","الفرق","difference","which","versus","vs","أيها","ايها","أيهما","ايهما","forces","قوى"],q:{ar:"PESTLE أم SWOT أم قوى بورتر: أيها أستخدم؟",en:"PESTLE, SWOT or Porter — which one?"},
  a:{ar:"ليست بدائل؛ تعمل معاً بالترتيب. **PESTLE** (ISO 10009 البند 5.2) يمسح البيئة العامة: الأنظمة والاقتصاد والمجتمع والتقنية والقانون والبيئة. و**قوى بورتر** (5.3) تقرأ القطاع نفسه: المشترين والموردين والداخلين الجدد والبدائل والمنافسة والمكمِّلين. ومنهما تأتي **الفرص والتهديدات**. ثم **SWOT** (5.1) يضعها أمام القوة والضعف الداخليين بدليل، ويحوّل الأهم إلى خيارات وإجراءات. وتذكر ISO 10009 في البند 7.2 أن مدخلات **سجل المخاطر** قد تأتي من SWOT وPESTLE وFMEA. فالترتيب العملي: PESTLE وبورتر، ثم SWOT، ثم سجل المخاطر وخطة 6.1.",
   en:"They are not alternatives; they work together, in order. **PESTLE** (ISO 10009 5.2) scans the general environment: policy, the economy, society, technology, law and the environment. **Porter's forces** (5.3) read the sector itself: buyers, suppliers, new entrants, substitutes, rivalry and complementors. **Opportunities and threats** come from both. **SWOT** (5.1) then sets them against the internal strengths and weaknesses, with evidence, and turns the most important into options and actions. ISO 10009 says in 7.2 that inputs to the **risk register** may come from SWOT, PESTLE or FMEA. The working order: PESTLE and Porter, then SWOT, then the risk register and the 6.1 plan."}},
 {id:"req",k:["متطلب","مطلوب","iso 9001","4.1","requirement","required","shall","مواصفة","note 2","الملاحظة"],q:{ar:"هل PESTLE متطلب في ISO 9001:2026؟",en:"Is PESTLE required by ISO 9001:2026?"},
  a:{ar:"لا. PESTLE **أسلوب** وليس متطلباً. تطلب ISO 9001:2026 في **4.1** تحديد القضايا الخارجية والداخلية ذات الصلة بالغرض والتوجه الاستراتيجي، وتحديد ما إذا كان تغير المناخ قضية ذات صلة، ومتابعة هذه القضايا ومراجعتها. وتذكر **الملاحظة 2** القضايا القانونية والتقنية والتنافسية والسوقية والثقافية والسياسية والاجتماعية والاقتصادية والبيئية على المستوى الدولي أو الوطني أو الإقليمي أو المحلي، فيغطي PESTLE معظمها، ويبقى التنافسي والسوقي لقوى بورتر وبيانات السوق. ثم **6.1.1** تطلب مراعاة القضايا عند تحديد المخاطر والفرص، و**9.3.2 ب)** مراجعة تغيراتها في مراجعة الإدارة.",
   en:"No. PESTLE is **a technique**, not a requirement. ISO 9001:2026 asks in **4.1** to determine the external and internal issues relevant to purpose and strategic direction, to determine whether climate change is a relevant issue, and to monitor and review those issues. Its **NOTE 2** lists legal, technological, competitive, market, cultural, political, social, economic and environmental issues at the international, national, regional or local level: PESTLE covers most of them, and the competitive and market ones are better read with Porter's forces and market data. Then **6.1.1** asks to consider the issues when determining risks and opportunities, and **9.3.2 b)** to review their changes at management review."}},
 {id:"climate",k:["مناخ","المناخ","climate","حرارة","heat","تغير المناخ","climate change"],q:{ar:"كيف أقرر هل تغير المناخ قضية ذات صلة؟",en:"How do I decide whether climate change is relevant?"},
  a:{ar:"اسأل: هل يمس تغير المناخ **قدرة النظام على تحقيق نتائجه** أو **متطلبات الأطراف المعنية**؟ مثلاً: موجات الحر تمس صب الخرسانة وسلامة العمال، أو العميل يطلب تقرير انبعاثات، أو نظام جديد يشترط عزلاً حرارياً. ثم اكتب **القرار وسببه**: «ذو صلة لأن…» أو «ليس ذا صلة لأن…». تطلب ISO 9001:2026 في 4.1 هذا القرار صراحة، وتذكر ملاحظة 4.2 أن للأطراف المعنية متطلبات قد تتصل بتغير المناخ. ولا تكتمل مرحلة «قُرر المناخ» في الأداة بلا قرار وسبب. في المثال: موجات الحر 38 يوماً فوق 45 °م في 2026 مقابل 24 في 2023، فتقرر أنه ذو صلة.",
   en:"Ask: does climate change affect **the system's ability to achieve its intended results**, or **the requirements of interested parties**? For example: heatwaves affect concrete pours and workers' safety, a client asks for an emissions report, or a new regulation requires thermal insulation. Then write **the decision and its reason**: \"relevant because…\" or \"not relevant because…\". ISO 9001:2026 asks for this decision in 4.1, and the NOTE to 4.2 says interested parties can have requirements related to climate change. The \"climate decided\" stage needs both a decision and a reason. In the example, heatwaves reached 38 days above 45 °C in 2026 against 24 in 2023, so it was decided relevant."}},
 {id:"specific",k:["محدد","عام","generic","specific","مصدر","source","تاريخ","date","دليل","evidence","رأي","opinion"],q:{ar:"كيف أكتب بنداً محدداً بمصدر وتاريخ؟",en:"How do I write a specific item with a source and a date?"},
  a:{ar:"البند **واقعة أو اتجاه خارجي** فيه ما يُقاس أو يُتحقق منه: نظام وتاريخ سريانه، أو رقم منشور، أو توقع باسم صاحبه. اكتب «سعر حديد التسليح زاد 9% بين مارس وأغسطس 2026 (عروض الموردين، 2026-08-31)» بدل «تقلب الأسعار». ولكل بند **مصدره** و**تاريخ المصدر**، و**أثره** (فرصة أو تهديد أو كلاهما)، و**من يتأثر**. وتنبّه الأداة على البند العام (بلا رقم أو تاريخ، أو بعبارة جاهزة مثل «الاقتصاد غير مستقر»)، ولا يصح أن يكون بين البنود العليا.",
   en:"An item is **an external fact or trend** with something that can be measured or checked: a regulation and its effective date, a published figure, or a forecast with its author. Write \"rebar price up 9% from March to August 2026 (supplier quotes, 2026-08-31)\" rather than \"price volatility\". Each item has **its source** and **the source's date**, **its effect** (an opportunity, a threat or both) and **who is affected**. The tool flags a generic item (no figure or date, or a stock phrase such as \"the economy is uncertain\"), and a generic item cannot be among the top items."}},
 {id:"review",k:["مراجعة","متى","review","update","تحديث","حدث","event","دوري","periodic"],q:{ar:"متى أراجع المسح؟",en:"When do I review the scan?"},
  a:{ar:"**في موعد محدد، وبعد أي حدث كبير.** تنبّه ISO 10009:2024 في نقاط الانتباه للبند 5.2 إلى تحديث معلومات PESTLE دورياً لتعكس أحداثاً مثل الأوبئة والأوضاع الأمنية، وتطلب ISO 9001:2026 متابعة القضايا ومراجعتها (4.1) وعرض تغيراتها في مراجعة الإدارة (9.3.2 ب)). لذلك يحمل المسح **موعد المراجعة القادمة** و**الأحداث التي تستدعي مراجعة قبله** (نظام جديد، أزمة، تغير كبير في الأسعار). وفي المراجعة اكتب: ما الذي تغير، وما البنود التي أضيفت أو حذفت. في المثال روجع المسح الوطني في 8 أكتوبر 2026 بعد تأكيد موعد سريان كود العزل.",
   en:"**On a set date, and after any major event.** ISO 10009:2024, in the points to note for 5.2, says to update the PESTLE information periodically to reflect incidents such as an epidemic or a security situation, and ISO 9001:2026 asks to monitor and review the issues (4.1) and to bring their changes to management review (9.3.2 b)). So a scan carries **the next review date** and **the events that call for a review before it** (a new regulation, a crisis, a large price change). At the review, write what changed and which items were added or removed. In the example, the national scan was reviewed on 8 October 2026 after the insulation code's effective date was confirmed."}},
 {id:"open",dyn:"open",k:["مفتوح","مفتوحة","متابعة","open items","follow"],q:{ar:"ما البنود المفتوحة في مسوحي؟",en:"What is still open in my scans?"}},
 {id:"status",dyn:"status",k:["وضع","حالة","ملخص","status","summary","where do we stand"],q:{ar:"ما وضع مسوح PESTLE الآن؟",en:"Where do my scans stand?"}}
];
var CB_SUG=["useful","which","specific","climate","status"];
function kbDyn(id){
 var u=CB[L]||CB.ar;
 if(id==="open"){ var O=openItems(); if(!O.length) return u.op0+"\n\n[[tab:dash]]"; return O.map(function(x){ return "- **"+(x.r.ref||x.r.id)+"** — "+x.s; }).join("\n")+"\n\n[[tab:docs]] · [[tab:dash]]"; }
 if(id==="status"){ var c=counts(); if(!c.n) return u.st0; return "- "+t("kTotal")+": **"+c.n+"**\n- "+t("kSrc")+": **"+(c.top?c.topSrc+"/"+c.top:"—")+"**\n- "+t("kOut")+": **"+(c.top?c.topOut+"/"+c.top:"—")+"**\n- "+t("kRev")+": **"+pct(c.rev,c.n)+"**\n- "+t("kOpen")+": **"+openItems().length+"**\n- "+t("kAs")+": **"+assessScore()+"%**\n\n[[tab:dash]] · [[tab:audit]]"; }
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
window.addEventListener("storage",function(e){ if([STR_KEY,SW_KEY].indexOf(e.key)>=0){ renderHomeSt(); fillLists(); if(ST) stPreview(true); refreshForm(); } });
var rzT=null, rzW=chartW(); window.addEventListener("resize",function(){ clearTimeout(rzT); rzT=setTimeout(function(){ if(chartW()!==rzW){ rzW=chartW(); renderDash(); refreshForm(); } },150); });

/* ---------- boot ---------- */
/* a link from the hub may ask to open a scan (?open=ID); a request may also start one from the Strategy Studio's PESTLE register (?strat=ID, or
   ?strat=* for the whole register) or from the PESTLE items of a SWOT study (?swot=ID, with &item=IID for one item); inside the hub the same
   request arrives as a one-time hint */
function navRequest(){
 var q={}, K=["open","item"].concat(STSRC);
 try{ var u=new URLSearchParams(location.search); K.forEach(function(k){ if(u.get(k)) q[k]=u.get(k); }); }catch(e){}
 try{ var h=JSON.parse(sessionStorage.getItem(NAV_KEY)||"null"); sessionStorage.removeItem(NAV_KEY); if(h&&typeof h==="object"){ K.forEach(function(k){ if(h[k]) q[k]=String(h[k]); }); } }catch(e){}
 return q;
}
applyLang();
(function(){
 var q=navRequest(), r=q.open?DB.records.filter(function(x){ return x.id===q.open; })[0]:null;
 if(r){ loadRecordIntoForm(r); go("tools"); return; }
 for(var i=0;i<STSRC.length;i++){ var s=STSRC[i]; if(q[s]&&prefillFrom(s,q[s],s==="swot"?(q.item||""):"")) return; }
 go((location.hash||"#home").slice(1));
})();
