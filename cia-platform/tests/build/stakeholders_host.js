/* ===== Stakeholder Analysis tool — host logic. Registers and assessment are stored in this browser only (localStorage, wrapped in try/catch). =====
   Storage key "cia-stakeholders:v1" (this tool only). Schema:
   { records: [ {
       id, ref, title, scope: "org"|"unit"|"project"|"bid"|"site"|"process", decision (the decision or plan the register serves),
       date (date of the analysis, YYYY-MM-DD), facil (facilitator), owner, revBy (next review date, YYYY-MM-DD),
       trig (events that call for a review before that date), src: "swot"|"pestle"|"strat"|"lessons"|"none",
       srcId (the record the register was started from, read only),
       team:  [ {n (name or function), role, ext: "no"|"customer"|"supplier"|"advisor"|"dept"} ]       "ext" other than "no" = outside input
       pts:   [ {id, n (the party, named specifically), ty: "customer"|"regulator"|"employees"|"supplier"|"partner"|"owner"|"community"|"other",
                 io: "ext"|"int", pw: 1..5|null (power or influence), pwr (why), in: 1..5|null (interest), inr (why),
                 own (relationship owner), ch (channel), fq (frequency), sid (id of the record in another tool it came from, read only)} ]
       reqs:  [ {id, p (party id), t (the need or expectation, written as a requirement), so (its source: a contract clause, a regulation,
                 a survey, a meeting record), d (the source's date, YYYY-MM-DD), cl: "yes"|"no"|"" (climate-related),
                 ad: "yes"|"part"|"no"|"" (addressed through the management system, ISO 9001:2026 4.2 c)), why (the reason when partly or not)} ]
       clim:  {dec: "found"|"none"|"", why}       climate-related requirements asked about explicitly (ISO 9001:2026 4.2 NOTE)
       outs:  [ {id, p (party id), to: "swot"|"pestle"|"reg"|"plan"|"iso31000"|"aside", q: "o"|"t"|"" (in SWOT), fac: "p"|"e"|"s"|"t"|"l"|"en"|""
                 (in PESTLE), ref (SWOT study id, PESTLE scan id or the reference in the register or plan), what (the entry), why (why it is set
                 aside), who} ]
       acts:  [ {id, p (party id or ""), what, who, by (YYYY-MM-DD), st: "plan"|"doing"|"done", done (YYYY-MM-DD), ev} ]   actions
       revs:  [ {id, date, trig: "periodic"|"event"|"mgmt"|"other", chg (what changed), add (parties added), rem (parties removed)} ]   reviews
       created, updated } ],
     assess: { IN1..RV3: 0|1|2 } }
   The tool's design: a party is "key" when its power or its interest is 4 or more; the grid places a party with power 4–5 and interest 4–5 in
   "manage closely", power 4–5 only in "keep satisfied", interest 4–5 only in "keep informed", and the rest in "monitor". The stage is computed
   (scoped → team → parties named → requirements with sources and decisions → rated, climate asked → engagement and outcomes → reviewed);
   nothing about it, the quadrants or the key parties is stored.
   Other tools' keys are only read, never written: "cia-swot:v1" (items with the source type "customer" or that name a party, and the studies
   named by an outcome, previewed with the SWOT tool's own rules), "cia-pestle:v1" (items with "who is affected", previewed with the PESTLE tool's
   own rules), "strategy-studio:v1" (it holds no interested-parties register: its SWOT and PESTLE rows that name a party are read) and
   "cia-lessons:v1" (customer lessons and lessons that name a customer or supplier, previewed with the Lessons Learned rules). The other tools
   open through their own requests (?open= or the one-time hints "cia-nav:swot", "cia-nav:pestle", "cia-nav:lessons"; the Strategy Studio and
   the ISO 31000 Risk Studio on a tab). This tool reads its own hint "cia-nav:stakeholders" ({open} | {swot, item} | {pestle, item} | {strat} |
   {lessons}) and its address (?open=, ?swot=ID&item=IID, ?pestle=ID&item=IID, ?strat=ID, ?lessons=ID) once; none of them holds tool data. */
var LKEY="cia-lang", STORE="cia-stakeholders:v1", STR_KEY="strategy-studio:v1", SW_KEY="cia-swot:v1", PE_KEY="cia-pestle:v1", LL_KEY="cia-lessons:v1",
    NAV_KEY="cia-nav:stakeholders", SW_NAV="cia-nav:swot", PE_NAV="cia-nav:pestle", LL_NAV="cia-nav:lessons";
var L=(function(){ try{ return localStorage.getItem(LKEY)||"ar"; }catch(e){ return "ar"; } })();
var TABS=["home","explain-std","explain-cl","assess","tools","docs","audit","dash","report","ai"];
var TITLES={ar:"تحليل الأطراف المعنية | من يهمّ وماذا يحتاج — مدثر سلامه",en:"Stakeholder Analysis | Who matters and what they need — مدثر سلامه"};
var STAGES=["draft","scoped","team","named","reqs","rated","engaged","reviewed"], MAPST=STAGES.slice(1);
var SCOL={draft:"#9AA5B8",scoped:"#7A869E",team:"#1E8C93",named:"#3563C9",reqs:"#7B5BB8",rated:"#1B2A4A",engaged:"#C9821A",reviewed:"#3C9A5F"};
var PTYPES=["customer","regulator","employees","supplier","partner","owner","community","other"];
var TCOL={customer:"#1E8C93",regulator:"#1B2A4A",employees:"#C9821A",supplier:"#7B5BB8",partner:"#3563C9",owner:"#B8901E",community:"#2F7D4B",other:"#7A869E"};
var IOS=["ext","int"], ADS=["yes","part","no"], YN=["yes","no"], CLIMS=["found","none"];
var QUADS=["close","satisfy","inform","monitor"], QCOL={close:"#B42318",satisfy:"#C9821A",inform:"#3563C9",monitor:"#7A869E"}, HI=4;
var SCOPES=["org","unit","project","bid","site","process"];
var SRCS=["swot","pestle","strat","lessons","none"], STSRC=["swot","pestle","strat","lessons"];
var EXTS=["no","customer","supplier","advisor","dept"], TOS=["swot","pestle","reg","plan","iso31000","aside"], OQS=["o","t"], PFS=["p","e","s","t","l","en"];
var ASTS=["plan","doing","done"], RTRIG=["periodic","event","mgmt","other"], WTS=[1,2,3,4,5];
var MAXTEAM=12, MAXPT=30, MAXREQ=60, MAXOUTS=30, MAXACTS=24, MAXREV=10;
var DB=load();
var curTab="home";
var editing=null;   /* deep copy of the register open in the form: keeps created between saves */
var ST=null;        /* rows of the read-only start preview */

var UI={
ar:{brand:"أكاديمية التحسين المستمر · مدثر سلامه",toolName:"تحليل الأطراف المعنية — من يهمّ وماذا يحتاج",sgLearn:"التعلّم",sgWork:"العمل",sgOut:"المخرجات",
 nHome:"الرئيسية",nStd:"دليل المنهجية",nCl:"دليل البنود",nAssess:"التقييم الذاتي",nTools:"سجلات الأطراف",nDocs:"السجلات",nAudit:"التدقيق",nDash:"لوحة المؤشرات",nReport:"التقرير",nAi:"المساعد الذكي",soon:"قريباً",
 homeCode:"النطاق · الفريق · الطرف المحدد · المتطلب ومصدره · قرار 4.2 ج) · القوة والاهتمام · المناخ · التعامل · المخرج · المراجعة",homeH1:"تحليل الأطراف المعنية",
 homeLede:"سجل يخدم قراراً أو خطة محددة: أطراف بأسمائها لا «المجتمع» و«العملاء»، ولكل طرف متطلباته مكتوبة بمصدرها وتاريخها، وقرار صريح لكل متطلب: هل يعالجه نظام الإدارة أم لا ولماذا، ثم القوة والاهتمام بسببهما، ومنها طريقة التعامل ومالك العلاقة وقناتها، ثم سؤال صريح عن متطلبات المناخ، ثم يذهب كل طرف رئيسي إلى SWOT أو PESTLE أو سجل المخاطر أو خطة 6.1 أو يُستبعد بسبب، ثم مراجعة دورية وبعد التغيرات الكبيرة.",
 homeNote:"النسخة الحالية تحفظ السجلات في متصفحك فقط. الحفظ على الخادم وتسجيل الدخول يُضافان في مرحلة المنصة المشتركة.",
 prep:"إعداد",authorName:"مدثر سلامه",cycleT:"ما الذي تستطيع فعله هنا",cycleS:"اقرأ دليل المنهجية، ثم قيّم ممارستكم مع الأطراف المعنية، ثم ابدأ سجلاً جديداً، أو من بنود العملاء في دراسة SWOT، أو من «من يتأثر» في مسح PESTLE، أو من درس مستفاد يخص عميلاً أو مورداً.",
 tStd:"متى يكون تحليل الأطراف المعنية مفيداً: النطاق والقرار، والفريق، والطرف المحدد، والمتطلب بمصدره وتاريخه، وقرار 4.2 ج)، والقوة والاهتمام، وطريقة التعامل، ومتطلبات المناخ، والمخرج إلى SWOT وPESTLE والمخاطر، والمراجعة، والفجوات الشائعة وما يطلبه المدقق.",tCl:"بنود ISO 9001:2026 التي يخدمها السجل: الأطراف المعنية 4.2 بملاحظتها والملحق A.4.2، والنطاق 4.3 ب)، والتركيز على العميل 5.1.2، والمخاطر والفرص 6.1.1، ورضا العميل 9.1.2، ومدخلات مراجعة الإدارة 9.3.2 ج)، مع تعريفات ISO 9000:2026 والبنود 5.1 و5.5 و6.5 من ISO 10009:2024.",tAssess:"اثنا عشر سؤالاً تقيس ممارستكم مع الأطراف المعنية، من تكوين الفريق حتى إبلاغ النتيجة.",
 tTools:"سجل لكل قرار: النطاق، والفريق، والأطراف بأسمائها، والمتطلبات بمصادرها وقرار 4.2 ج)، والقوة والاهتمام، ومالك العلاقة وقناتها، وسؤال المناخ، ومخرج لكل طرف رئيسي، والإجراءات، والمراجعة، مع مصفوفة القوة والاهتمام ومصفوفة المتطلبات ورسم الأطراف.",tDocs:"كل السجلات بمرحلتها ونطاقها وتنبيهاتها، وبيانات المثال.",tAudit:"فحص آلي لكل سجل: المرجع والغرض، والفريق، والأطراف المحددة، والمصدر والتاريخ، وقرار 4.2 ج)، والتقييم، والمناخ، والمخرجات، والإجراءات، والمراجعة.",
 tDash:"متطلبات الأطراف الرئيسية بمصدر وقرار، والأطراف الرئيسية التي لها مخرج، والسجلات المراجعة، ورسم الأطراف حسب النوع، والبنود المفتوحة، والتقييم الذاتي.",tReport:"تقرير HTML بكل سجل ومصفوفته وأطرافه ومتطلباته وقراراته ومخرجاته وإجراءاته ومراجعته، ونتائج التدقيق والبنود المفتوحة والتقييم الذاتي، وملف CSV.",tAi:"مساعد يقرأ السجلات وينبّه إلى الأطراف العامة والمتطلبات بلا مصدر. لم يُفعَّل بعد.",
 foot:"المراجع: ISO 9001:2026 البنود 4.2 و4.3 و5.1.2 و6.1.1 و9.1.2 و9.3.2 والملحق A.4.2، وISO 9000:2026 البندان 3.1.4 و4.4.2، وISO 10009:2024 البنود 5.1 و5.5 و6.5 (ملخصات تفسيرية، وليست النص الرسمي). تحليل الأطراف المعنية أسلوب، وليس متطلباً في أي مواصفة. الأمثلة توضيحية وليست بيانات حقيقية.",
 heroTag:"أداة منهجية · الأطراف المعنية ومتطلباتها",langSw:"English",langSwA:"Switch to English",logoAlt:"أكاديمية التحسين المستمر — مدثر سلامه",
 related:"أدوات مرتبطة في الأكاديمية",rel_str:"استوديو الاستراتيجية والأداء",rel_swot:"تحليل SWOT — من المصفوفة إلى القرار",rel_pestle:"تحليل PESTLE — مسح البيئة الخارجية",rel_iso10009:"دليل أدوات الجودة ISO 10009 (5.5 و6.5)",rel_lessons:"سجل الدروس المستفادة",rel_iso31000:"استوديو المخاطر ISO 31000",rel_audit:"مركز التدقيق الذكي",rel_iso9001:"دليل ISO 9001:2026",rel_pdca:"دورة PDCA",rel_capa:"الإجراءات التصحيحية CAPA",
 termT:"هل تحليل الأطراف المعنية متطلب في ISO 9001:2026؟",
 termP1:"لا. تحليل الأطراف المعنية أسلوب، وليس متطلباً في أي مواصفة. تطلب ISO 9001:2026 في البند 4.2 تحديد: أ) الأطراف المعنية ذات الصلة بنظام إدارة الجودة، ب) متطلباتها ذات الصلة، ج) أي هذه المتطلبات سيعالجها النظام، ثم متابعة المعلومات عنها ومراجعتها. وتذكر الملاحظة أن لهذه الأطراف متطلبات قد تتصل بتغير المناخ. ثم تُستخدم هذه المتطلبات في تحديد النطاق (4.3 ب))، وتُراعى في تحديد المخاطر والفرص (6.1.1)، وتُعرض تغيراتها في مراجعة الإدارة (9.3.2 ج)). والسجل طريقة منظمة لتلبية ذلك إن طُبّق جيداً.",
 termP2:"والقاعدة هنا: التحليل مفيد فقط عندما يقود إلى قرارات عن الأطراف التي تهم. الطرف يُسمّى بعينه: «أمانة المنطقة — إدارة رخص البناء» لا «الحكومة»، و«جمعية سكان حي النخيل» لا «المجتمع». واحتياجه يُكتب متطلباً بمصدره (بند عقد، أو نظام، أو استبيان، أو محضر اجتماع) وتاريخه. ولكل متطلب قرار: يعالجه النظام، أو جزئياً، أو لا، مع السبب. وتُقيّم القوة (أو التأثير) والاهتمام بسبب قصير، فتحدد المصفوفة طريقة التعامل: إدارة عن قرب، أو إبقاء راضياً، أو إبقاء مطلعاً، أو متابعة. ولكل طرف مالك للعلاقة وقناة وتكرار.",
 termP3:"ويُسأل صراحة عن متطلبات المناخ (ملاحظة 4.2). والأطراف مصدر للفرص والتهديدات، فيذهب كل طرف رئيسي إلى SWOT أو PESTLE أو سجل المخاطر أو خطة 6.1، أو يُستبعد بسبب مكتوب. ويؤرخ السجل ويُراجع دورياً وبعد التغيرات الكبيرة، وتُعرض تغيراته في مراجعة الإدارة. ومصفوفة القوة والاهتمام وقاعدة «الطرف الرئيسي» تصميم هذه الأداة، لا نص مواصفة.",
 termIs:"ملخص تفسيري بصياغة مستقلة، وليس النص الرسمي. المصادر: ISO 9001:2026 البنود 4.2 (بملاحظتها) و4.3 و5.1.2 و6.1.1 و9.1.2 و9.3.2 والملحق A.4.2 (الملف الرسمي المرفوع، قُرئ بالأداة pdftotext)، وISO 9000:2026 البندان 3.1.4 و4.4.2 (ممسوح ضوئياً، قُرئ بالتعرف الضوئي)، وISO 10009:2024 البنود 5.1 (الجدول 5.1) و5.5 و6.5 (الملف الرسمي المرفوع). لا تسمي ISO 10009 أداة باسم «تحليل الأطراف المعنية». مصفوفة القوة والاهتمام وكتب رسم خرائط الأطراف وAA1000 وISO 26000: «غير متحقق منها». التحقق: 2026-10-17.",
 defs:[["النطاق والقرار","لماذا نحلل","المنشأة أو وحدة أو مشروع أو عطاء أو موقع أو عملية، والقرار أو الخطة التي يخدمها السجل.","#7A869E"],["الطرف المحدد","باسمه · بنوعه","جهة أو فئة مسماة بعينها، داخلية أو خارجية. «المجتمع» و«الجمهور» بلا جهة مسماة يُنبَّه عليهما.","#3563C9"],["المتطلب وقرار 4.2 ج)","مصدر · تاريخ · قرار","الاحتياج يُكتب متطلباً بمصدره وتاريخه، ثم يُقرر: يعالجه النظام، أو جزئياً، أو لا، مع السبب.","#7B5BB8"],["القوة والاهتمام","المصفوفة · التعامل","درجة من 1 إلى 5 لكل منهما بسبب، ومنهما طريقة التعامل ومالك العلاقة وقناتها.","#1B2A4A"],["المخرج والمراجعة","SWOT · PESTLE · المخاطر","كل طرف رئيسي إلى SWOT أو PESTLE أو سجل المخاطر أو خطة 6.1، أو يُستبعد بسبب، ثم مراجعة دورية وبعد التغيرات.","#C9821A"]],
 asT:"التقييم الذاتي لممارسة تحليل الأطراف المعنية",asS:"أجب عن كل سؤال بما يحدث فعلاً عندكم. النتيجة تقيس الممارسة الحالية، وليست شهادة ولا حكماً على الأداء.",asReset:"مسح الإجابات",asSaved:"تم حفظ الإجابة",asAnswered:"أُجيب {n} من 12",
 band0:"يحتاج عملاً",band1:"في طور التطوير",band2:"راسخ",bandNote:"حدود داخلية للتقييم الذاتي من تصميم هذه الأداة، وليست معياراً رسمياً.",as0:"غير موجود",as1:"جزئي",as2:"موجود ومطبّق",
 g_IN:"الفريق والأطراف والمصادر",g_DE:"القرار والتقييم والتعامل",g_OU:"المناخ والمخرجات",g_RV:"المراجعة والإبلاغ",
 tlT:"سجل الأطراف المعنية",tlS:"سجل لكل قرار أو خطة: النطاق، والفريق، والأطراف بأسمائها، والمتطلبات بمصادرها وقراراتها، والقوة والاهتمام، وسؤال المناخ، والتعامل والمخرجات، والإجراءات، والمراجعة. تتحدد المرحلة مما تملؤه.",
 save:"حفظ السجل",newRec:"سجل جديد",savedFail:"تعذّر الحفظ في هذا المتصفح. نزّل التقرير قبل إغلاق الصفحة.",cur:"المرحلة الحالية:",ok_rec:"تم حفظ السجل",
 st_draft:"مسودة",st_scoped:"حُدد النطاق",st_team:"اكتمل الفريق",st_named:"أطراف مسماة",st_reqs:"متطلبات بمصادر وقرارات",st_rated:"قُيّمت",st_engaged:"تعامل ومخرجات",st_reviewed:"روجع",
 mp_scoped:"النطاق والقرار والتاريخ والميسّر",mp_team:"3 أدوار ورأي من الخارج",mp_named:"أطراف بأسمائها لا عامة",mp_reqs:"متطلب لكل طرف، بمصدر وقرار 4.2 ج)",mp_rated:"قوة واهتمام بسبب، وسؤال المناخ",mp_engaged:"مالك وقناة ومخرج لكل طرف رئيسي",mp_reviewed:"مراجعة بعد السجل",
 mapT:"مراحل السجل",mpDone:"مكتملة",mpCur:"قيد العمل",mpTodo:"لم تبدأ",
 sHdrT:"بيانات السجل",sHdrS:"المرجع، والعنوان، والنطاق، والقرار أو الخطة التي يخدمها، وتاريخ التحليل، والميسّر، والمالك، وموعد المراجعة القادمة، والتغيرات التي تستدعي المراجعة قبله، والأداة التي بدأ منها.",
 sTmT:"1 · الفريق",sTmS:"ثلاثة أدوار على الأقل، وواحد على الأقل من خارج الفريق: عميل أو مورد أو مستشار خارجي أو إدارة أخرى. الإدارة وحدها لا ترى كل الأطراف.",
 sPtT:"2 · الأطراف بأسمائها",sPtS:"لكل طرف: اسمه بعينه، ونوعه، وهل هو داخلي أم خارجي، وقوته (أو تأثيره) واهتمامه من 1 إلى 5 مع سبب قصير لكل منهما، ومالك العلاقة، وقناة التواصل وتكرارها. يُنبَّه على الاسم العام مثل «المجتمع» أو «الجمهور».",
 sRqT:"3 · المتطلبات وقرار 4.2 ج)",sRqS:"لكل طرف متطلب واحد على الأقل: الاحتياج مكتوباً متطلباً، ومصدره (بند عقد، أو نظام، أو استبيان، أو محضر اجتماع) وتاريخه، وهل يتصل بالمناخ، ثم القرار: يعالجه نظام الإدارة، أو جزئياً، أو لا، مع السبب عند «جزئياً» أو «لا».",
 sGrT:"4 · مصفوفة القوة والاهتمام والعروض",sGrS:"الطرف الرئيسي: قوته أو اهتمامه 4 أو أكثر (تصميم هذه الأداة). المصفوفة تحدد طريقة التعامل: إدارة عن قرب، أو إبقاء راضياً، أو إبقاء مطلعاً، أو متابعة. ثم مصفوفة المتطلبات ورسم الأطراف حسب النوع والمصدر.",
 sOuT:"5 · مخرج لكل طرف رئيسي",sOuS:"الأطراف مصدر للفرص والتهديدات: كل طرف رئيسي يذهب إلى دراسة SWOT (فرصة أو تهديد)، أو مسح PESTLE (بعامله)، أو سجل المخاطر، أو خطة المخاطر والفرص 6.1، أو استوديو المخاطر، أو يُستبعد بسبب مكتوب.",
 sAcT:"6 · الإجراءات",sAcS:"ما يجب فعله مع الأطراف: إجراء بمالك وموعد وحالة، ودليل التنفيذ.",
 sRvT:"7 · المراجعة",sRvS:"يؤرخ السجل ويُراجع في موعده وبعد أي تغير كبير (عقد جديد، نظام جديد، شكوى كبيرة، مورد جديد): ما الذي تغير، وما الأطراف التي أضيفت أو حذفت. وتُعرض التغيرات في مراجعة الإدارة (9.3.2 ج)).",
 f_title:"عنوان السجل *",f_ref:"المرجع",f_scope:"النطاق",f_decision:"القرار أو الخطة التي يخدمها السجل",f_date:"تاريخ التحليل",f_facil:"الميسّر",f_owner:"المالك",f_revBy:"موعد المراجعة القادمة",f_trig:"تغيرات تستدعي المراجعة قبل الموعد",f_src:"بدأ من",f_srcId:"رقم السجل في الأداة المصدر",
 sc_org:"المنشأة",sc_unit:"وحدة أعمال",sc_project:"مشروع",sc_bid:"عطاء",sc_site:"موقع",sc_process:"عملية",
 src_swot:"دراسة SWOT",src_pestle:"مسح PESTLE",src_strat:"استوديو الاستراتيجية",src_lessons:"درس مستفاد",src_none:"سجل جديد",
 tmN:"الاسم أو الوظيفة",tmRole:"الدور في التحليل",tmExt:"من خارج الفريق؟",tmAdd:"إضافة عضو",tmNone:"لم يُضف أعضاء بعد.",ex_no:"لا — من الفريق",ex_customer:"عميل",ex_supplier:"مورد",ex_advisor:"مستشار خارجي",ex_dept:"إدارة أخرى",
 tmW3:"الفريق أقل من ثلاثة أدوار.",tmWext:"لا رأي من خارج الفريق: أضف عميلاً أو مورداً أو مستشاراً أو إدارة أخرى.",tmSolo:"سجل يعده شخص واحد يرى الأطراف التي يعرفها فقط.",tmDel:"حذف السطر",
 ptAdd:"إضافة طرف",ptDel:"حذف الطرف",ptNone:"لا أطراف بعد.",pt_n:"الطرف (باسمه بعينه)",pt_ty:"النوع",pt_io:"داخلي أم خارجي",pt_pw:"القوة أو التأثير 1–5",pt_pwr:"لماذا هذه القوة",pt_in:"الاهتمام 1–5",pt_inr:"لماذا هذا الاهتمام",pt_own:"مالك العلاقة",pt_ch:"قناة التواصل",pt_fq:"التكرار",pt_sid:"رقم السجل المصدر",
 ty_customer:"عميل",ty_regulator:"جهة تنظيمية",ty_employees:"العاملون",ty_supplier:"مورد",ty_partner:"شريك أو ممول",ty_owner:"المالك أو المساهم",ty_community:"المجتمع المحلي",ty_other:"أخرى",io_ext:"خارجي",io_int:"داخلي",
 genP:"اسم عام: سمِّ الجهة بعينها (مثلاً: جمعية سكان الحي، أو إدارة الرخص في الأمانة).",rateF:"قيّم القوة والاهتمام واكتب سبب كل منهما.",engF:"طرف رئيسي بلا مالك علاقة أو قناة أو تكرار.",noReqF:"لا متطلب لهذا الطرف بعد.",keyB:"رئيسي",
 qd_close:"إدارة عن قرب",qd_satisfy:"إبقاء راضياً",qd_inform:"إبقاء مطلعاً",qd_monitor:"متابعة",qdH_close:"قوة عالية واهتمام عالٍ",qdH_satisfy:"قوة عالية واهتمام أقل",qdH_inform:"اهتمام عالٍ وقوة أقل",qdH_monitor:"قوة أقل واهتمام أقل",
 rqAdd:"إضافة متطلب",rqNone:"لا متطلبات بعد.",rq_p:"الطرف",rq_t:"المتطلب (الاحتياج أو التوقع)",rq_so:"المصدر",rq_d:"تاريخ المصدر",rq_cl:"يتصل بالمناخ؟",rq_ad:"يعالجه النظام؟ (4.2 ج))",rq_why:"السبب عند «جزئياً» أو «لا»",rqPick:"— اختر الطرف —",
 yn_:"—",yn_yes:"نعم",yn_no:"لا",ad_:"— لم يُقرر —",ad_yes:"نعم",ad_part:"جزئياً",ad_no:"لا",
 rqSrcF:"بلا مصدر أو تاريخ.",rqDecF:"لم يُقرر هل يعالجه النظام.",rqWhyF:"اكتب سبب «جزئياً» أو «لا».",rqBadP:"اختر الطرف.",rqW:"{n} طرف بلا متطلب: {c}.",
 clDec:"متطلبات المناخ (ملاحظة 4.2)",cl_:"— لم يُسأل بعد —",cl_found:"سُئلت الأطراف ووُجدت متطلبات تتصل بالمناخ",cl_none:"سُئلت الأطراف ولا متطلبات ذات صلة بالمناخ",clWhy:"ما الذي سُئل ومن سُئل، والنتيجة",clW:"اسأل صراحة عن متطلبات المناخ لدى الأطراف، واكتب ما وجدت.",clWhyW:"اكتب ما الذي سُئل والنتيجة.",clFoundW:"اخترت «وُجدت متطلبات» ولا متطلب معلّم «يتصل بالمناخ».",
 grT:"مصفوفة القوة والاهتمام",grPw:"القوة ↑",grIn:"الاهتمام",grNone:"لا أطراف مقيّمة بعد.",grUn:"بلا تقييم: {c}",grEmpty:"—",
 rmT:"مصفوفة المتطلبات وقرار 4.2 ج)",rmP:"الطرف",rmN:"المتطلبات",rmYes:"يعالجه النظام",rmPart:"جزئياً",rmNo:"لا",rmUnd:"لم يُقرر",rmSrc:"بمصدر وتاريخ",rmCl:"المناخ",rmNone:"لا متطلبات بعد.",
 chT:"الأطراف حسب النوع: متطلباتها بمصدر وتاريخ أم لا",chEmpty:"لا أطراف بعد",chEv:"كل متطلباته بمصدر وتاريخ",chOp:"بلا متطلب أو بلا مصدر",chShare:"{p}% من الأطراف متطلباتها بمصدر وتاريخ، و{o}% بلا متطلب أو بلا مصدر",
 ouAdd:"إضافة مخرج",ouNone:"لا مخرجات بعد.",ou_p:"الطرف",ou_to:"يذهب إلى",ou_q:"في SWOT",ou_fac:"عامل PESTLE",ou_ref:"المرجع (رقم الدراسة أو المسح أو السجل)",ou_what:"المدخل",ou_why:"سبب الاستبعاد",ou_who:"المالك",ouPick:"— اختر الطرف —",ouAuto:"أضف مخرجاً لكل طرف رئيسي بلا مخرج",ouAutoDone:"أضيفت أسطر للأطراف الرئيسية بلا مخرج. اختر الوجهة لكل منها.",
 to_swot:"دراسة SWOT",to_pestle:"مسح PESTLE",to_reg:"سجل المخاطر",to_plan:"خطة المخاطر والفرص 6.1",to_iso31000:"استوديو المخاطر ISO 31000",to_aside:"يُستبعد بسبب مكتوب",oq_:"—",oq_o:"فرصة",oq_t:"تهديد",
 fac_:"—",fac_p:"سياسي",fac_e:"اقتصادي",fac_s:"اجتماعي",fac_t:"تقني",fac_l:"قانوني",fac_en:"بيئي",
 ouBadSw:"اكتب رقم دراسة SWOT واختر: فرصة أم تهديد.",ouBadPe:"اكتب رقم مسح PESTLE واختر العامل.",ouBadRef:"اكتب المرجع في السجل أو الخطة، أو المدخل.",ouBadIso:"اكتب المدخل الذي سيُسجل في الاستوديو.",ouBadWhy:"اكتب سبب الاستبعاد.",ouBadP:"اختر الطرف.",
 uncovW:"{n} طرف رئيسي بلا مخرج: {c}.",noKeyW:"لا طرف رئيسي بعد: قيّم القوة والاهتمام.",swOpen:"افتح في SWOT",peOpen:"افتح في PESTLE",swMiss:"هذه الدراسة غير موجودة في أداة SWOT على هذا المتصفح.",peMiss:"هذا المسح غير موجود في أداة PESTLE على هذا المتصفح.",isoOpen:"افتح استوديو المخاطر",isoNote:"استوديو المخاطر لا يحفظ سجلاً برقم في هذا المتصفح؛ افتحه وأدخل الخطر هناك، واكتب مرجعه هنا.",
 acAdd:"إضافة إجراء",acDel:"حذف الإجراء",acNone:"لا إجراءات بعد.",ac_p:"الطرف",ac_what:"الإجراء",ac_who:"المسؤول",ac_by:"الموعد",ac_st:"الحالة",ac_done:"تاريخ التنفيذ",ac_ev:"الدليل",acPick:"— طرف (اختياري) —",
 as_plan:"مخطط",as_doing:"قيد التنفيذ",as_done:"نُفّذ",ownF:"الإجراء بلا مسؤول أو موعد.",evF:"نُفّذ دون تاريخ أو دليل.",acW:"{n} إجراء بلا مسؤول أو موعد.",
 rvDate:"تاريخ المراجعة",rvTrig:"السبب",rt_periodic:"مراجعة دورية",rt_event:"تغير كبير",rt_mgmt:"مراجعة الإدارة",rt_other:"أخرى",rvChg:"ما الذي تغير",rvAdd:"الأطراف المضافة",rvRem:"الأطراف المحذوفة",rvAddBtn:"إضافة مراجعة",rvNone:"لا مراجعة بعد.",rvEarly:"المراجعة مؤرخة قبل تاريخ التحليل.",revLateW:"موعد المراجعة ({d}) مضى دون مراجعة.",
 stT:"ابدأ من أداة أخرى (قراءة فقط)",stS:"اختر بنداً من دراسة SWOT مصدره «العملاء» أو يسمّي طرفاً، أو بنداً من مسح PESTLE فيه «من يتأثر»، أو بنداً في استوديو الاستراتيجية يسمّي طرفاً، أو درساً مستفاداً يخص عميلاً أو مورداً. يُملأ سجل جديد غير محفوظ بالطرف ومتطلبه ورقم المصدر، ولا يُكتب شيء في الأداة الأخرى. أكمل اسم الطرف بعينه والمصدر والتاريخ والقرار والتقييم.",
 stSrc:"المصدر",ss_swot:"SWOT — بنود العملاء والأطراف",ss_pestle:"PESTLE — «من يتأثر»",ss_strat:"استوديو الاستراتيجية — بنود تسمّي طرفاً",ss_lessons:"الدروس المستفادة — العملاء والموردون",stPrev:"اعرض",stUse:"ابدأ سجلاً منه",stStudy:"كل بنود {id}",stNone:"لا توجد بيانات في هذه الأداة على هذا المتصفح بعد.",stEmpty:"لا توجد سجلات مناسبة بعد.",
 stColId:"الرقم",stColT:"البند",stColG:"النوع المقترح",stColInfo:"القراءة بقاعدة الأداة",stColN:"سجلات منه",stColA:"إجراء",
 stUsed:"مُلئ سجل جديد من {s} {id}. سمِّ الطرف بعينه، وأكمل المصدر والتاريخ والقرار والتقييم، ثم احفظ.",pfT:"الأطراف المعنية — ",
 pvSwI:"{id} · {i} · {q} · الوزن {w} · {t}",pvSw:"{id} · {st} · {t}",pvPeI:"{id} · {i} · {st} · الدرجة {s} · من يتأثر: {w}",pvPe:"{id} · {st} · {t}",pvSs:"{id} · {k} · {t}",pvLl:"{id} · {st} · {t}",
 hmT:"على هذا المتصفح {n} بنداً في SWOT وPESTLE واستوديو الاستراتيجية والدروس المستفادة يمكن أن يبدأ منها سجل.",hmGo:"اعرضها",
 srcHint:"سجل جديد، أو اختر الأداة التي بدأ منها واكتب رقم السجل؛ تظهر هنا معاينة بقاعدة تلك الأداة.",srcOpen:"افتح المصدر",
 e_title:"اكتب عنوان السجل.",e_date:"تاريخ المراجعة لا يسبق تاريخ التحليل.",
 fl_ref:"المرجع أو العنوان ناقص",fl_scope:"القرار ناقص",fl_date:"تاريخ التحليل أو الميسّر ناقص",fl_solo:"سجل شخص واحد",fl_team:"أقل من 3 أدوار",fl_ext:"لا رأي من الخارج",fl_nopt:"لا أطراف",fl_gen:"{n} طرف باسم عام",fl_noreq:"{n} طرف بلا متطلب",fl_src:"{n} متطلب لطرف رئيسي بلا مصدر",fl_srcx:"{n} متطلب آخر بلا مصدر",fl_dec:"{n} متطلب بلا قرار 4.2 ج)",fl_rate:"{n} طرف بلا تقييم بسبب",fl_clim:"لم يُسأل عن المناخ",fl_eng:"{n} طرف رئيسي بلا مالك أو قناة",fl_uncov:"{n} طرف رئيسي بلا مخرج",fl_own:"{n} إجراء بلا مسؤول أو موعد",fl_ev:"{n} إجراء منفذ بلا دليل",fl_revby:"لا موعد مراجعة",fl_late:"موعد المراجعة مضى",fl_norev:"لم يُراجع بعد",fl_revearly:"مراجعة قبل التحليل",fl_trig:"لا تغيرات للمراجعة",
 oi_ref:"أكمل المرجع والعنوان.",oi_scope:"حدد القرار أو الخطة التي يخدمها السجل.",oi_date:"حدد تاريخ التحليل والميسّر.",oi_solo:"سجل شخص واحد: كوّن فريقاً من ثلاثة أدوار على الأقل.",oi_team:"أكمل الفريق إلى ثلاثة أدوار على الأقل.",oi_ext:"أضف رأياً من خارج الفريق (عميل أو مورد أو مستشار أو إدارة أخرى).",oi_nopt:"أضف الأطراف بأسمائها.",oi_gen:"سمِّ {n} طرف بعينه بدل الاسم العام.",oi_noreq:"اكتب متطلباً واحداً على الأقل لـ {n} طرف.",oi_src:"أضف المصدر والتاريخ لـ {n} متطلب لطرف رئيسي.",oi_srcx:"أضف المصدر والتاريخ لـ {n} متطلب آخر.",oi_dec:"قرر هل يعالج النظام {n} متطلب، واكتب السبب عند «جزئياً» أو «لا».",oi_rate:"قيّم القوة والاهتمام بسببهما لـ {n} طرف.",oi_clim:"اسأل الأطراف صراحة عن متطلبات المناخ، واكتب النتيجة.",oi_eng:"حدد مالك العلاقة والقناة والتكرار لـ {n} طرف رئيسي.",oi_uncov:"حدد مخرجاً لـ {n} طرف رئيسي (SWOT أو PESTLE أو المخاطر أو خطة 6.1 أو الاستبعاد بسبب).",oi_own:"حدد المسؤول والموعد لـ {n} إجراء.",oi_ev:"أضف دليل التنفيذ لـ {n} إجراء.",oi_revby:"حدد موعد المراجعة القادمة.",oi_late:"موعد المراجعة مضى: راجع السجل.",oi_norev:"راجع السجل في موعده أو بعد أي تغير كبير.",oi_revearly:"صحح تاريخ المراجعة.",oi_trig:"اكتب التغيرات التي تستدعي المراجعة قبل موعدها.",
 exT:"بيانات المثال",exS:"ثلاثة سجلات توضيحية لشركة الواحة للمقاولات (شركة سعودية افتراضية)، مرتبطة بأمثلة PESTLE وSWOT: سجل الشركة لاستراتيجية 2027 (العميل الحكومي الرئيسي، والأمانة والدفاع المدني جهتين تنظيميتين، وموردا الخرسانة والحديد، وعمال المواقع، والبنك؛ وطريقة العمل في الحر التي يطلبها العميل متطلباً مناخياً؛ دخلت SW-EX-01 وPE-EX-01؛ روجع)، وسجل عطاء المستشفى (هيئة الصحة عميلاً، وجهة اعتماد الغازات الطبية، والبنك الممول؛ إلى SW-EX-02 ومدخل مخاطر العطاء)، وسجل موقع البرج ج (مفتش الأمانة، ومورد الرافعة، وجمعية سكان الحي، والرافعون؛ مخرجات مخططة ولم يُراجع بعد). ليست بيانات حقيقية.",exLoad:"تحميل المثال",exClear:"مسح كل البيانات",exLoaded:"تم تحميل المثال.",exCleared:"تم مسح كل البيانات.",exConfirmClear:"سيُحذف كل ما حُفظ في أداة تحليل الأطراف المعنية على هذا المتصفح (السجلات والتقييم الذاتي). هل تريد المتابعة؟",
 dT:"السجلات",dS:"كل السجلات المحفوظة على هذا المتصفح. افتح سجلاً لتعديله، أو احذفه بضغطتين.",csv:"تصدير CSV",none:"لا توجد سجلات بعد.",open:"فتح",del:"حذف",delArm:"اضغط مرة أخرى للحذف",
 colRef:"السجل",colScope:"النطاق · القرار",colStage:"المرحلة",colPt:"الأطراف",colSrc:"متطلبات الرئيسيين بمصدر وقرار",colOut:"المخرجات · الإجراءات",colFlags:"تنبيهات",colAct:"إجراءات",ptN:"{n} طرفاً · {k} رئيسياً",
 auT:"التدقيق الآلي",auS:"عشرة فحوص لكل سجل. «—» تعني أن الفحص لا ينطبق بعد على مرحلة السجل.",auEmpty:"لا توجد سجلات لتدقيقها.",auRec:"السجلات",auPass:"نسبة الفحوص الناجحة",auFail:"سجلات فيها فحص راسب",auOpen:"بنود مفتوحة",
 k_ref:"المرجع والنطاق والغرض",k_team:"فريق ورأي خارجي",k_named:"أطراف بأسمائها",k_src:"مصدر وتاريخ لمتطلبات الرئيسيين",k_dec:"قرار 4.2 ج) لكل متطلب",k_rate:"القوة والاهتمام مقيّمان",k_clim:"سؤال المناخ",k_outs:"مخرج لكل طرف رئيسي",k_acts:"إجراء بمالك وموعد",k_review:"موعد المراجعة والالتزام به",
 dashT:"لوحة المؤشرات",dashS:"تُحسب من السجلات والتقييم الذاتي المحفوظة على هذا المتصفح.",kTotal:"السجلات",kPt:"الأطراف",kKey:"الأطراف الرئيسية",kSrc:"متطلبات الرئيسيين بمصدر وقرار",kOut:"الأطراف الرئيسية التي لها مخرج",kRev:"سجلات روجعت",kGen:"أطراف بأسماء عامة",kOpen:"بنود مفتوحة",kAud:"نجاح التدقيق",kAs:"التقييم الذاتي",
 byStage:"السجلات حسب المرحلة",byScope:"السجلات حسب النطاق",byType:"الأطراف حسب النوع",byQuad:"الأطراف حسب طريقة التعامل",byTo:"مخرجات الأطراف الرئيسية حسب الوجهة",byAssess:"التقييم الذاتي حسب المحور",openT:"بنود تحتاج متابعة",noData:"لا توجد بيانات بعد.",noOpen:"لا بنود مفتوحة.",
 rpT:"التقرير",rpS:"تقرير HTML جاهز للطباعة أو الحفظ PDF، وملف CSV للأطراف والمتطلبات والمخرجات والإجراءات.",rpHtml:"تنزيل تقرير HTML",rpNote:"التقرير يضم الغلاف والملخص وكل سجل بمصفوفته وأطرافه ومتطلباته وقراراته ومخرجاته وإجراءاته ومراجعته، ثم نتائج التدقيق والبنود المفتوحة والتقييم الذاتي.",rpPrev:"معاينة سريعة",rpEmpty:"لا توجد بيانات للتقرير بعد.",
 rpCover:"سجلات الأطراف المعنية — من يهمّ وماذا يحتاج",rpReg:"السجلات",rpTeam:"الفريق",rpGrid:"مصفوفة القوة والاهتمام",rpRm:"مصفوفة المتطلبات",rpPt:"الأطراف",rpRq:"المتطلبات والقرارات",rpClim:"متطلبات المناخ",rpOut:"مخرجات الأطراف الرئيسية",rpActs:"الإجراءات",rpRev:"المراجعات",rpAu:"نتيجة التدقيق",
 aiT:"المساعد الذكي — قيد الإنشاء",aiS:"سيقرأ المساعد السجلات وينبّه إلى الأطراف العامة والمتطلبات بلا مصدر، ولن يكتب المتطلبات بدلاً من الفريق.",aiList:["ينبّه إلى الأسماء العامة والمتطلبات بلا مصدر","يقترح أسئلة المناخ لكل طرف رئيسي","يذكّر بالمراجعة بعد التغيرات الكبيرة"],
 nxMiss:"هذا الرقم غير موجود في الأداة الأخرى على هذا المتصفح.",nxNoData:"لا توجد بيانات في هذه الأداة على هذا المتصفح بعد.",
 yes:"نعم",no:"لا",langNote:""},
en:{brand:"Continual Improvement Academy · مدثر سلامه",toolName:"Stakeholder Analysis — who matters and what they need",sgLearn:"Learn",sgWork:"Work",sgOut:"Outputs",
 nHome:"Home",nStd:"Method guide",nCl:"Clause guide",nAssess:"Self-assessment",nTools:"Stakeholder registers",nDocs:"Records",nAudit:"Audit",nDash:"Dashboard",nReport:"Report",nAi:"AI Assistant",soon:"Soon",
 homeCode:"Scope · team · named party · requirement and source · 4.2 c) decision · power and interest · climate · engagement · outcome · review",homeH1:"Stakeholder analysis",
 homeLede:"A register that serves a named decision or plan: parties named specifically, not \"the community\" or \"customers\"; each party's requirements written with their source and date; an explicit decision on every requirement — addressed through the management system or not, and why; power and interest rated with a reason, which set the engagement approach, the relationship owner and the channel; an explicit question on climate-related requirements; every key party carried into SWOT, PESTLE, the risk register or the 6.1 plan, or set aside with a reason; then a review on a date and after major changes.",
 homeNote:"This version keeps registers in your browser only. Server storage and sign-in come with the shared platform stage.",
 prep:"Prepared by",authorName:"مدثر سلامه",cycleT:"What you can do here",cycleS:"Read the method guide, assess your practice with interested parties, then start a new register, or start one from the customer items of a SWOT study, the \"who is affected\" of a PESTLE scan, or a lesson about a customer or a supplier.",
 tStd:"When a stakeholder analysis is useful: scope and decision, the team, the specific party, the requirement with its source and date, the 4.2 c) decision, power and interest, the engagement approach, climate-related requirements, outcomes into SWOT, PESTLE and risks, the review, the common gaps and what an auditor asks for.",tCl:"The ISO 9001:2026 clauses the register serves: interested parties 4.2 with its NOTE and Annex A.4.2, scope 4.3 b), customer focus 5.1.2, risks and opportunities 6.1.1, customer satisfaction 9.1.2 and management review inputs 9.3.2 c), with the ISO 9000:2026 terms and ISO 10009:2024 5.1, 5.5 and 6.5.",tAssess:"Twelve questions on your practice with interested parties, from forming the team to communicating the result.",
 tTools:"One register per decision: scope, the team, the parties by name, their requirements with sources and the 4.2 c) decision, power and interest, the relationship owner and channel, the climate question, an outcome for every key party, actions and the review, with the power/interest grid, the requirements matrix and a chart of parties.",tDocs:"All registers with their stage, scope and flags, and the example data.",tAudit:"An automatic check of each register: reference and purpose, team, specific parties, source and date, the 4.2 c) decision, rating, climate, outcomes, actions and review.",
 tDash:"Key-party requirements with a source and a decision, key parties with an outcome, registers reviewed, a chart of parties by type, open items and the self-assessment.",tReport:"An HTML report with each register, its grid, parties, requirements, decisions, outcomes, actions and review, the audit results, open items and the self-assessment, and a CSV file.",tAi:"An assistant that reads the registers and flags generic parties and unsourced requirements. Not active yet.",
 foot:"References: ISO 9001:2026 clauses 4.2, 4.3, 5.1.2, 6.1.1, 9.1.2 and 9.3.2 and Annex A.4.2; ISO 9000:2026 3.1.4 and 4.4.2; ISO 10009:2024 5.1, 5.5 and 6.5 (interpretive summaries, not the official text). Stakeholder analysis is a technique, not a requirement of any standard. Examples are illustrative, not real data.",
 heroTag:"Method tool · interested parties and their requirements",langSw:"العربية",langSwA:"التبديل إلى العربية",logoAlt:"Continual Improvement Academy — مدثر سلامه",
 related:"Related tools in the academy",rel_str:"Strategy & Performance Studio",rel_swot:"SWOT — from the grid to decisions",rel_pestle:"PESTLE — scanning the outside world",rel_iso10009:"ISO 10009 quality tools guide (5.5 and 6.5)",rel_lessons:"Lessons learned register",rel_iso31000:"ISO 31000 Risk Studio",rel_audit:"Smart Audit Center",rel_iso9001:"ISO 9001:2026 guide",rel_pdca:"PDCA cycle",rel_capa:"Corrective action (CAPA)",
 termT:"Is stakeholder analysis required by ISO 9001:2026?",
 termP1:"No. Stakeholder analysis is a technique, not a requirement of any standard. ISO 9001:2026 asks in clause 4.2 to determine a) the interested parties relevant to the quality management system, b) their relevant requirements and c) which of these requirements will be addressed through the system, and to monitor and review information about them. Its NOTE says these parties can have requirements related to climate change. These requirements are then used to set the scope (4.3 b)), considered when determining risks and opportunities (6.1.1), and their changes go to management review (9.3.2 c)). A register is an orderly way to meet this, when it is done well.",
 termP2:"The rule here: the analysis is useful only when it leads to decisions about the parties that matter. A party is named specifically: \"the municipality's building permits department\", not \"the government\"; \"the Al-Nakheel residents' association\", not \"the community\". Its need is written as a requirement with its source (a contract clause, a regulation, a survey, a meeting record) and its date. Every requirement gets a decision: addressed through the system, partly, or not, with the reason. Power (or influence) and interest are rated with a short reason, and the grid sets the engagement approach: manage closely, keep satisfied, keep informed or monitor. Each party has a relationship owner, a channel and a frequency.",
 termP3:"Climate-related requirements are asked about explicitly (the NOTE to 4.2). Parties are sources of opportunities and threats, so every key party goes into SWOT, PESTLE, the risk register or the 6.1 plan, or is set aside with a written reason. The register is dated and reviewed periodically and after major changes, and its changes go to management review. The power/interest grid and the \"key party\" rule are this tool's design, not the text of a standard.",
 termIs:"Interpretive summary in independent wording, not the official text. Sources: ISO 9001:2026 clauses 4.2 (with its NOTE), 4.3, 5.1.2, 6.1.1, 9.1.2 and 9.3.2 and Annex A.4.2 (the uploaded official file, read with pdftotext); ISO 9000:2026 3.1.4 and 4.4.2 (scanned, read with OCR); ISO 10009:2024 5.1 (Table 5.1), 5.5 and 6.5 (the uploaded official file). ISO 10009 names no tool called \"stakeholder analysis\". The power/interest grid, stakeholder-mapping textbooks, AA1000 and ISO 26000: \"not verified\". Checked: 2026-10-17.",
 defs:[["Scope and decision","Why we analyse","The organization, a unit, a project, a bid, a site or a process, and the decision or plan the register serves.","#7A869E"],["The specific party","By name · by type","A body or group named specifically, internal or external. \"The community\" or \"the public\" with no named body is flagged.","#3563C9"],["Requirement and 4.2 c)","Source · date · decision","The need is written as a requirement with its source and date, then decided: addressed through the system, partly, or not, with the reason.","#7B5BB8"],["Power and interest","The grid · engagement","A score of 1 to 5 for each with a reason; together they set the engagement approach, the relationship owner and the channel.","#1B2A4A"],["Outcome and review","SWOT · PESTLE · risks","Every key party into SWOT, PESTLE, the risk register or the 6.1 plan, or set aside with a reason; then a review on a date and after changes.","#C9821A"]],
 asT:"Self-assessment of your stakeholder practice",asS:"Answer each question by what actually happens. The result measures current practice; it is not a certificate or a performance verdict.",asReset:"Clear answers",asSaved:"Answer saved",asAnswered:"{n} of 12 answered",
 band0:"Needs work",band1:"Developing",band2:"Established",bandNote:"Internal self-assessment bands set by this tool, not an official standard.",as0:"Not in place",as1:"Partly",as2:"In place and applied",
 g_IN:"Team, parties and sources",g_DE:"Decision, rating and engagement",g_OU:"Climate and outcomes",g_RV:"Review and communication",
 tlT:"Stakeholder register",tlS:"One register per decision or plan: scope, the team, the parties by name, the requirements with their sources and decisions, power and interest, the climate question, engagement and outcomes, actions and the review. The stage follows from what you fill in.",
 save:"Save register",newRec:"New register",savedFail:"Could not save in this browser. Download the report before closing the page.",cur:"Current stage:",ok_rec:"Register saved",
 st_draft:"Draft",st_scoped:"Scoped",st_team:"Team complete",st_named:"Parties named",st_reqs:"Requirements sourced and decided",st_rated:"Rated",st_engaged:"Engagement and outcomes",st_reviewed:"Reviewed",
 mp_scoped:"Scope, decision, date and facilitator",mp_team:"3 roles and outside input",mp_named:"Parties named, none generic",mp_reqs:"A requirement per party, with a source and the 4.2 c) decision",mp_rated:"Power and interest with reasons; climate asked",mp_engaged:"Owner, channel and outcome for every key party",mp_reviewed:"A review after the register",
 mapT:"Register stages",mpDone:"done",mpCur:"in progress",mpTodo:"not started",
 sHdrT:"Register details",sHdrS:"Reference, title, scope, the decision or plan it serves, the date of the analysis, the facilitator, the owner, the next review date, the changes that call for a review before it, and the tool it started from.",
 sTmT:"1 · The team",sTmS:"At least three roles, and at least one from outside the team: a customer, a supplier, an outside advisor or another department. Management alone does not see every party.",
 sPtT:"2 · The parties, by name",sPtS:"For each party: its specific name, its type, internal or external, its power (or influence) and its interest from 1 to 5 with a short reason for each, the relationship owner, the channel and how often. A generic name such as \"the community\" or \"the public\" is flagged.",
 sRqT:"3 · Requirements and the 4.2 c) decision",sRqS:"At least one requirement per party: the need written as a requirement, its source (a contract clause, a regulation, a survey, a meeting record) and its date, whether it is climate-related, then the decision: addressed through the management system, partly, or not, with the reason when partly or not.",
 sGrT:"4 · The power/interest grid and views",sGrS:"A key party has power or interest of 4 or more (this tool's design). The grid sets the engagement approach: manage closely, keep satisfied, keep informed or monitor. Then the requirements matrix and a chart of parties by type and by source.",
 sOuT:"5 · An outcome for every key party",sOuS:"Parties are sources of opportunities and threats: every key party goes into a SWOT study (an opportunity or a threat), a PESTLE scan (with its factor), the risk register, the risks and opportunities plan 6.1 or the Risk Studio, or is set aside with a written reason.",
 sAcT:"6 · Actions",sAcS:"What must be done with the parties: an action with an owner, a date and a status, and the evidence it was done.",
 sRvT:"7 · Review",sRvS:"The register is dated and reviewed on its date and after any major change (a new contract, a new regulation, a major complaint, a new supplier): what changed, which parties were added or removed. The changes go to management review (9.3.2 c)).",
 f_title:"Register title *",f_ref:"Reference",f_scope:"Scope",f_decision:"The decision or plan the register serves",f_date:"Date of the analysis",f_facil:"Facilitator",f_owner:"Owner",f_revBy:"Next review date",f_trig:"Changes that call for a review before that date",f_src:"Started from",f_srcId:"Record id in the source tool",
 sc_org:"Organization",sc_unit:"Business unit",sc_project:"Project",sc_bid:"Bid",sc_site:"Site",sc_process:"Process",
 src_swot:"SWOT study",src_pestle:"PESTLE scan",src_strat:"Strategy Studio",src_lessons:"Lesson learned",src_none:"New register",
 tmN:"Name or function",tmRole:"Role in the analysis",tmExt:"From outside the team?",tmAdd:"Add a member",tmNone:"No members yet.",ex_no:"No — team member",ex_customer:"Customer",ex_supplier:"Supplier",ex_advisor:"Outside advisor",ex_dept:"Another department",
 tmW3:"The team has fewer than three roles.",tmWext:"No input from outside the team: add a customer, a supplier, an advisor or another department.",tmSolo:"A register made by one person sees only the parties that person knows.",tmDel:"Delete row",
 ptAdd:"Add a party",ptDel:"Delete party",ptNone:"No parties yet.",pt_n:"Party (named specifically)",pt_ty:"Type",pt_io:"Internal or external",pt_pw:"Power or influence 1–5",pt_pwr:"Why this power",pt_in:"Interest 1–5",pt_inr:"Why this interest",pt_own:"Relationship owner",pt_ch:"Channel",pt_fq:"Frequency",pt_sid:"Source record id",
 ty_customer:"Customer",ty_regulator:"Regulator",ty_employees:"Employees",ty_supplier:"Supplier",ty_partner:"Partner or financier",ty_owner:"Owner or shareholder",ty_community:"Local community",ty_other:"Other",io_ext:"External",io_int:"Internal",
 genP:"Generic name: name the specific body (for example the residents' association, or the municipality's permits department).",rateF:"Rate power and interest and write the reason for each.",engF:"Key party with no relationship owner, channel or frequency.",noReqF:"No requirement for this party yet.",keyB:"Key",
 qd_close:"Manage closely",qd_satisfy:"Keep satisfied",qd_inform:"Keep informed",qd_monitor:"Monitor",qdH_close:"High power, high interest",qdH_satisfy:"High power, lower interest",qdH_inform:"High interest, lower power",qdH_monitor:"Lower power, lower interest",
 rqAdd:"Add a requirement",rqNone:"No requirements yet.",rq_p:"Party",rq_t:"Requirement (the need or expectation)",rq_so:"Source",rq_d:"Source date",rq_cl:"Climate-related?",rq_ad:"Addressed through the system? (4.2 c))",rq_why:"Reason when partly or not",rqPick:"— pick the party —",
 yn_:"—",yn_yes:"Yes",yn_no:"No",ad_:"— not decided —",ad_yes:"Yes",ad_part:"Partly",ad_no:"No",
 rqSrcF:"No source or date.",rqDecF:"Not decided whether the system addresses it.",rqWhyF:"Write the reason for partly or not.",rqBadP:"Pick the party.",rqW:"{n} parties with no requirement: {c}.",
 clDec:"Climate-related requirements (NOTE to 4.2)",cl_:"— not asked yet —",cl_found:"Parties asked; climate-related requirements found",cl_none:"Parties asked; no relevant climate-related requirement",clWhy:"What was asked, of whom, and the result",clW:"Ask the parties explicitly about climate-related requirements and write what you found.",clWhyW:"Write what was asked and the result.",clFoundW:"You chose \"requirements found\" but no requirement is marked climate-related.",
 grT:"Power/interest grid",grPw:"Power ↑",grIn:"Interest",grNone:"No rated parties yet.",grUn:"Not rated: {c}",grEmpty:"—",
 rmT:"Requirements matrix and the 4.2 c) decision",rmP:"Party",rmN:"Requirements",rmYes:"Addressed",rmPart:"Partly",rmNo:"Not",rmUnd:"Not decided",rmSrc:"Sourced and dated",rmCl:"Climate",rmNone:"No requirements yet.",
 chT:"Parties by type: requirements sourced and dated or not",chEmpty:"No parties yet",chEv:"All its requirements sourced and dated",chOp:"No requirement or no source",chShare:"{p}% of parties have sourced, dated requirements; {o}% have no requirement or no source",
 ouAdd:"Add an outcome",ouNone:"No outcomes yet.",ou_p:"Party",ou_to:"Goes to",ou_q:"In SWOT",ou_fac:"PESTLE factor",ou_ref:"Reference (study, scan or register id)",ou_what:"Entry",ou_why:"Reason to set aside",ou_who:"Owner",ouPick:"— pick the party —",ouAuto:"Add an outcome for every key party with none",ouAutoDone:"Rows added for key parties with no outcome. Choose the destination for each.",
 to_swot:"SWOT study",to_pestle:"PESTLE scan",to_reg:"Risk register",to_plan:"Risks and opportunities plan 6.1",to_iso31000:"ISO 31000 Risk Studio",to_aside:"Set aside with a written reason",oq_:"—",oq_o:"Opportunity",oq_t:"Threat",
 fac_:"—",fac_p:"Political",fac_e:"Economic",fac_s:"Social",fac_t:"Technological",fac_l:"Legal",fac_en:"Environmental",
 ouBadSw:"Write the SWOT study id and choose opportunity or threat.",ouBadPe:"Write the PESTLE scan id and choose the factor.",ouBadRef:"Write the reference in the register or plan, or the entry.",ouBadIso:"Write the entry to record in the studio.",ouBadWhy:"Write the reason to set it aside.",ouBadP:"Pick the party.",
 uncovW:"{n} key parties with no outcome: {c}.",noKeyW:"No key party yet: rate power and interest.",swOpen:"Open in SWOT",peOpen:"Open in PESTLE",swMiss:"This study is not in the SWOT tool in this browser.",peMiss:"This scan is not in the PESTLE tool in this browser.",isoOpen:"Open the Risk Studio",isoNote:"The Risk Studio keeps no numbered record in this browser; open it, enter the risk there, and write its reference here.",
 acAdd:"Add an action",acDel:"Delete action",acNone:"No actions yet.",ac_p:"Party",ac_what:"Action",ac_who:"Owner",ac_by:"Due",ac_st:"Status",ac_done:"Done on",ac_ev:"Evidence",acPick:"— party (optional) —",
 as_plan:"Planned",as_doing:"In progress",as_done:"Done",ownF:"Action with no owner or due date.",evF:"Done with no date or evidence.",acW:"{n} actions with no owner or due date.",
 rvDate:"Review date",rvTrig:"Reason",rt_periodic:"Periodic review",rt_event:"Major change",rt_mgmt:"Management review",rt_other:"Other",rvChg:"What changed",rvAdd:"Parties added",rvRem:"Parties removed",rvAddBtn:"Add a review",rvNone:"No review yet.",rvEarly:"A review is dated before the analysis.",revLateW:"The review date ({d}) has passed with no review.",
 stT:"Start from another tool (read-only)",stS:"Pick a SWOT item whose source is \"customer\" or that names a party, a PESTLE item with \"who is affected\", a Strategy Studio row that names a party, or a lesson about a customer or a supplier. A new, unsaved register is filled with the party, its requirement and the source id; nothing is written in the other tool. Name the party specifically and complete the source, date, decision and rating.",
 stSrc:"Source",ss_swot:"SWOT — customer and party items",ss_pestle:"PESTLE — \"who is affected\"",ss_strat:"Strategy Studio — rows that name a party",ss_lessons:"Lessons learned — customers and suppliers",stPrev:"Show",stUse:"Start a register",stStudy:"All items of {id}",stNone:"No data in this tool in this browser yet.",stEmpty:"No suitable records yet.",
 stColId:"Id",stColT:"Item",stColG:"Suggested type",stColInfo:"Read with the tool's own rule",stColN:"Registers from it",stColA:"Action",
 stUsed:"A new register was filled from {s} {id}. Name the party specifically, complete the source, date, decision and rating, then save.",pfT:"Stakeholders — ",
 pvSwI:"{id} · {i} · {q} · weight {w} · {t}",pvSw:"{id} · {st} · {t}",pvPeI:"{id} · {i} · {st} · score {s} · affected: {w}",pvPe:"{id} · {st} · {t}",pvSs:"{id} · {k} · {t}",pvLl:"{id} · {st} · {t}",
 hmT:"This browser holds {n} items in SWOT, PESTLE, the Strategy Studio and Lessons Learned a register can start from.",hmGo:"Show them",
 srcHint:"A new register, or pick the tool it started from and type the record id; a preview by that tool's own rule appears here.",srcOpen:"Open the source",
 e_title:"Write the register title.",e_date:"A review cannot be dated before the analysis.",
 fl_ref:"Reference or title missing",fl_scope:"Decision missing",fl_date:"Date or facilitator missing",fl_solo:"One-person register",fl_team:"Fewer than 3 roles",fl_ext:"No outside input",fl_nopt:"No parties",fl_gen:"{n} generic party names",fl_noreq:"{n} parties with no requirement",fl_src:"{n} key-party requirements with no source",fl_srcx:"{n} other requirements with no source",fl_dec:"{n} requirements with no 4.2 c) decision",fl_rate:"{n} parties not rated with reasons",fl_clim:"Climate not asked",fl_eng:"{n} key parties with no owner or channel",fl_uncov:"{n} key parties with no outcome",fl_own:"{n} actions with no owner or date",fl_ev:"{n} done actions with no evidence",fl_revby:"No review date",fl_late:"Review date passed",fl_norev:"Not reviewed yet",fl_revearly:"Review before the analysis",fl_trig:"No review triggers",
 oi_ref:"Complete the reference and title.",oi_scope:"State the decision or plan the register serves.",oi_date:"Set the date of the analysis and the facilitator.",oi_solo:"One-person register: form a team of at least three roles.",oi_team:"Complete the team to at least three roles.",oi_ext:"Add input from outside the team (a customer, a supplier, an advisor or another department).",oi_nopt:"Add the parties by name.",oi_gen:"Name {n} parties specifically instead of a generic name.",oi_noreq:"Write at least one requirement for {n} parties.",oi_src:"Add the source and date to {n} key-party requirements.",oi_srcx:"Add the source and date to {n} other requirements.",oi_dec:"Decide whether the system addresses {n} requirements, with the reason for partly or not.",oi_rate:"Rate power and interest with reasons for {n} parties.",oi_clim:"Ask the parties explicitly about climate-related requirements and write the result.",oi_eng:"Set the relationship owner, channel and frequency for {n} key parties.",oi_uncov:"Set an outcome for {n} key parties (SWOT, PESTLE, risks, the 6.1 plan, or set aside with a reason).",oi_own:"Set the owner and due date for {n} actions.",oi_ev:"Add the evidence for {n} actions.",oi_revby:"Set the next review date.",oi_late:"The review date has passed: review the register.",oi_norev:"Review the register on its date or after any major change.",oi_revearly:"Correct the review date.",oi_trig:"Write the changes that call for a review before its date.",
 exT:"Example data",exS:"Three illustrative registers for Al-Waha Contracting (a fictitious Saudi company), tied to the PESTLE and SWOT examples: the company register behind the 2027 strategy (the main public client, the municipality and civil defence as regulators, the ready-mix and steel suppliers, site workers and the bank; the client's hot-weather method statement as a climate-related requirement; carried into SW-EX-01 and PE-EX-01; reviewed), the hospital bid register (the health authority as client, the medical gas certifier and the financing bank; into SW-EX-02 and the bid risk entry), and the Tower C site register (the municipal inspector, the crane supplier, the residents' association and the riggers; outcomes planned, not reviewed yet). Not real data.",exLoad:"Load example",exClear:"Clear all data",exLoaded:"Example loaded.",exCleared:"All data cleared.",exConfirmClear:"Everything saved in the Stakeholder Analysis tool in this browser (registers and self-assessment) will be deleted. Continue?",
 dT:"Records",dS:"All registers saved in this browser. Open one to edit it, or delete it with two clicks.",csv:"Export CSV",none:"No registers yet.",open:"Open",del:"Delete",delArm:"Click again to delete",
 colRef:"Register",colScope:"Scope · decision",colStage:"Stage",colPt:"Parties",colSrc:"Key-party requirements sourced and decided",colOut:"Outcomes · actions",colFlags:"Flags",colAct:"Actions",ptN:"{n} parties · {k} key",
 auT:"Automatic audit",auS:"Ten checks per register. \"—\" means the check does not apply yet at the register's stage.",auEmpty:"No registers to audit.",auRec:"Registers",auPass:"Checks passed",auFail:"Registers with a failed check",auOpen:"Open items",
 k_ref:"Reference, scope and purpose",k_team:"Team and outside input",k_named:"Parties named specifically",k_src:"Source and date on key-party requirements",k_dec:"4.2 c) decision on every requirement",k_rate:"Power and interest rated",k_clim:"Climate asked",k_outs:"An outcome for every key party",k_acts:"Actions with owner and date",k_review:"Review date set and kept",
 dashT:"Dashboard",dashS:"Computed from the registers and the self-assessment saved in this browser.",kTotal:"Registers",kPt:"Parties",kKey:"Key parties",kSrc:"Key-party requirements sourced and decided",kOut:"Key parties with an outcome",kRev:"Registers reviewed",kGen:"Generic party names",kOpen:"Open items",kAud:"Audit pass",kAs:"Self-assessment",
 byStage:"Registers by stage",byScope:"Registers by scope",byType:"Parties by type",byQuad:"Parties by engagement approach",byTo:"Key-party outcomes by destination",byAssess:"Self-assessment by area",openT:"Items to follow up",noData:"No data yet.",noOpen:"No open items.",
 rpT:"Report",rpS:"An HTML report ready to print or save as PDF, and a CSV file of parties, requirements, outcomes and actions.",rpHtml:"Download HTML report",rpNote:"The report holds the cover, the summary and each register with its grid, parties, requirements, decisions, outcomes, actions and review, then the audit results, open items and the self-assessment.",rpPrev:"Quick preview",rpEmpty:"No data for the report yet.",
 rpCover:"Stakeholder registers — who matters and what they need",rpReg:"The registers",rpTeam:"Team",rpGrid:"Power/interest grid",rpRm:"Requirements matrix",rpPt:"Parties",rpRq:"Requirements and decisions",rpClim:"Climate-related requirements",rpOut:"Key-party outcomes",rpActs:"Actions",rpRev:"Reviews",rpAu:"Audit result",
 aiT:"AI Assistant — under construction",aiS:"The assistant will read the registers and flag generic parties and unsourced requirements; it will not write requirements for the team.",aiList:["Flags generic names and unsourced requirements","Suggests climate questions for each key party","Reminds you to review after major changes"],
 nxMiss:"This id is not in the other tool in this browser.",nxNoData:"No data in this tool in this browser yet.",
 yes:"Yes",no:"No",langNote:""}
};
/* the SWOT, PESTLE and Lessons Learned tools' stage names and SWOT's quadrant names (copied at build time from their host scripts) */
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

/* ---------- records ---------- */
function blankTm(){ return {n:"",role:"",ext:"no"}; }
function blankPt(id){ return {id:id||"",n:"",ty:"customer",io:"ext",pw:null,pwr:"",in:null,inr:"",own:"",ch:"",fq:"",sid:""}; }
function blankRq(id,p){ return {id:id||"",p:p||"",t:"",so:"",d:"",cl:"",ad:"",why:""}; }
function blankOu(id,p){ return {id:id||"",p:p||"",to:"swot",q:"",fac:"",ref:"",what:"",why:"",who:""}; }
function blankAc(id){ return {id:id||"",p:"",what:"",who:"",by:"",st:"plan",done:"",ev:""}; }
function blankRv(){ return {id:"",date:"",trig:"periodic",chg:"",add:"",rem:""}; }
function blank(){ return {id:"",ref:"",title:"",scope:"org",decision:"",date:"",facil:"",owner:"",revBy:"",trig:"",src:"none",srcId:"",
 team:[],pts:[],reqs:[],clim:{dec:"",why:""},outs:[],acts:[],revs:[],created:"",updated:""}; }
function wt(v){ var n=parseInt(v,10); return (n>=1&&n<=5)?n:null; }
function fixTm(x){ return {n:str(x.n),role:str(x.role),ext:pick(x.ext,EXTS)||"no"}; }
function fixPt(x){ return {id:str(x.id),n:str(x.n),ty:pick(x.ty,PTYPES)||"other",io:pick(x.io,IOS)||"ext",pw:wt(x.pw),pwr:str(x.pwr),in:wt(x.in),inr:str(x.inr),own:str(x.own),ch:str(x.ch),fq:str(x.fq),sid:str(x.sid)}; }
function fixRq(x){ return {id:str(x.id),p:str(x.p),t:str(x.t),so:str(x.so),d:str(x.d),cl:pick(x.cl,YN),ad:pick(x.ad,ADS),why:str(x.why)}; }
function fixOu(x){ return {id:str(x.id),p:str(x.p),to:pick(x.to,TOS)||"swot",q:pick(x.q,OQS),fac:pick(x.fac,PFS),ref:str(x.ref),what:str(x.what),why:str(x.why),who:str(x.who)}; }
function fixAc(x){ return {id:str(x.id),p:str(x.p),what:str(x.what),who:str(x.who),by:str(x.by),st:pick(x.st,ASTS)||"plan",done:str(x.done),ev:str(x.ev)}; }
function fixRv(x){ return {id:str(x.id),date:str(x.date),trig:pick(x.trig,RTRIG)||"periodic",chg:str(x.chg),add:str(x.add),rem:str(x.rem)}; }
function ids(list,pre){ var used={}, n=0, re=new RegExp("^"+pre+"(\\d+)$");
 list.forEach(function(c){ var m=re.exec(c.id); if(m&&!used[c.id]){ used[c.id]=1; n=Math.max(n,+m[1]); } else c.id=""; });
 list.forEach(function(c){ if(!c.id){ n++; c.id=pre+n; used[c.id]=1; } }); }
/* a register saved with missing or broken parts gets empty ones, so rendering never throws; every party, requirement, outcome, action and review
   gets an id, and a requirement, an outcome or an action never points to a party that is gone */
function fixRec(r){
 ["id","ref","title","scope","decision","date","facil","owner","revBy","trig","src","srcId","created","updated"].forEach(function(k){ r[k]=str(r[k]); });
 if(SCOPES.indexOf(r.scope)<0) r.scope="org"; if(SRCS.indexOf(r.src)<0) r.src="none";
 r.team=arr(r.team).map(fixTm).slice(0,MAXTEAM);
 r.pts=arr(r.pts).map(fixPt).slice(0,MAXPT); ids(r.pts,"p");
 var have={}; r.pts.forEach(function(p){ have[p.id]=1; });
 r.reqs=arr(r.reqs).map(fixRq).slice(0,MAXREQ); ids(r.reqs,"q"); r.reqs.forEach(function(q){ if(!have[q.p]) q.p=""; });
 var c=obj(r.clim); r.clim={dec:pick(c.dec,CLIMS),why:str(c.why)};
 r.outs=arr(r.outs).map(fixOu).slice(0,MAXOUTS); ids(r.outs,"o"); r.outs.forEach(function(o){ if(!have[o.p]) o.p=""; });
 r.acts=arr(r.acts).map(fixAc).slice(0,MAXACTS); ids(r.acts,"a"); r.acts.forEach(function(a){ if(!have[a.p]) a.p=""; });
 r.revs=arr(r.revs).map(fixRv).slice(0,MAXREV); ids(r.revs,"v");
 return r;
}
function load(){ return TBX.load(STORE,function(v){ if(!Array.isArray(v.records)) v.records=[]; v.records=v.records.filter(function(r){ return r&&typeof r==="object"; }); v.records.forEach(fixRec); if(!v.assess||typeof v.assess!=="object") v.assess={}; return v; },function(){ return {records:[],assess:{}}; }); }
function persist(){ return TBX.save(STORE,DB); }

/* ---------- the register's rules ---------- */
function pts(r){ return r.pts.filter(function(p){ return txt(p.n); }); }
function ptById(r,id){ return pts(r).filter(function(p){ return p.id===id; })[0]||null; }
function rqs(r){ return r.reqs.filter(function(q){ return txt(q.t); }); }
function reqsOf(r,p){ return rqs(r).filter(function(q){ return q.p===p.id; }); }
/* a generic party: a group named with a stock word and no named body ("the community", "the public", "customers", "the government") */
var GENP=/^(the\s+)?(public|general public|community|local community|society|customers?|clients?|suppliers?|vendors?|government|authorities|regulators?|stakeholders|people|residents|neighbou?rs|employees|staff|workers|others?|market|الجمهور|المجتمع|المجتمع المحلي|العملاء|العميل|الموردون|الموردين|المورد|الحكومة|الجهات الحكومية|الجهات التنظيمية|الأطراف المعنية|الناس|السكان|الجيران|الموظفون|الموظفين|العاملون|العاملين|العمال|أخرى|السوق)$/i;
function genP(p){ var s=txt(p.n).replace(/[.،,]+$/,""); return !!s&&(GENP.test(s)||s.length<3); }
function srcOk(q){ return !!txt(q.so)&&isD(q.d); }
function decOk(q){ return ADS.indexOf(q.ad)>=0&&(q.ad==="yes"||!!txt(q.why)); }
function rated(p){ return !!(p.pw&&p.in&&txt(p.pwr)&&txt(p.inr)); }
/* the tool's design: power or interest of 4 or more makes a party key; the grid quadrant follows the same threshold */
function quad(p){ if(!(p.pw&&p.in)) return ""; if(p.pw>=HI&&p.in>=HI) return "close"; if(p.pw>=HI) return "satisfy"; if(p.in>=HI) return "inform"; return "monitor"; }
function isKey(p){ return !!((p.pw&&p.pw>=HI)||(p.in&&p.in>=HI)); }
function keys(r){ return pts(r).filter(isKey); }
function keyReqs(r){ var K={}; keys(r).forEach(function(p){ K[p.id]=1; }); return rqs(r).filter(function(q){ return K[q.p]; }); }
function engOk(p){ return !!(txt(p.own)&&txt(p.ch)&&txt(p.fq)); }
function noReq(r){ return pts(r).filter(function(p){ return !reqsOf(r,p).length; }); }
function climOk(r){ return CLIMS.indexOf(r.clim.dec)>=0&&!!txt(r.clim.why)&&(r.clim.dec!=="found"||rqs(r).some(function(q){ return q.cl==="yes"; })); }
/* an outcome is complete when it names its party and: a SWOT study id and its quadrant; a PESTLE scan id and its factor; a reference or an entry in
   the register or the plan; an entry for the Risk Studio; or the reason the party is set aside */
function outMiss(r,o){
 if(!ptById(r,o.p)) return "ouBadP";
 if(o.to==="swot") return (txt(o.ref)&&OQS.indexOf(o.q)>=0)?"":"ouBadSw";
 if(o.to==="pestle") return (txt(o.ref)&&PFS.indexOf(o.fac)>=0)?"":"ouBadPe";
 if(o.to==="reg"||o.to==="plan") return (txt(o.ref)||txt(o.what))?"":"ouBadRef";
 if(o.to==="iso31000") return (txt(o.what)||txt(o.ref))?"":"ouBadIso";
 return txt(o.why)?"":"ouBadWhy";
}
function outOk(r,o){ return !outMiss(r,o); }
function outs(r){ return r.outs.filter(function(o){ return o.p||txt(o.ref)||txt(o.what)||txt(o.why); }); }
function covered(r,p){ return r.outs.some(function(o){ return o.p===p.id&&outOk(r,o); }); }
function uncov(r){ return keys(r).filter(function(p){ return !covered(r,p); }); }
function acts(r){ return r.acts.filter(function(a){ return txt(a.what); }); }
function actOwned(a){ return !!(txt(a.who)&&isD(a.by)); }
function actDone(a){ return a.st==="done"&&isD(a.done)&&!!txt(a.ev); }
function unowned(r){ return acts(r).filter(function(a){ return !actOwned(a); }); }
function noEv(r){ return acts(r).filter(function(a){ return a.st==="done"&&!actDone(a); }); }
function revs(r){ return r.revs.filter(function(v){ return isD(v.date)||txt(v.chg)||txt(v.add)||txt(v.rem); }); }
function lastRev(r){ var V=r.revs.filter(function(v){ return isD(v.date); }).sort(function(a,b){ return a.date<b.date?-1:(a.date>b.date?1:0); }); return V.length?V[V.length-1]:null; }
function revEarly(r){ return r.revs.some(function(v){ return isD(v.date)&&isD(r.date)&&v.date<r.date; }); }
function revGood(r,v){ return !!v&&isD(v.date)&&(!isD(r.date)||v.date>=r.date)&&!!txt(v.chg); }
/* the review date is "kept" while it is still ahead, or when a review was held between the analysis and that date */
function kept(r){ if(!isD(r.revBy)) return false; if(r.revBy>=today()) return true; return r.revs.some(function(v){ return isD(v.date)&&v.date<=r.revBy&&(!isD(r.date)||v.date>=r.date); }); }
function revLate(r){ return isD(r.revBy)&&!kept(r); }
function scopeOk(r){ return !!(txt(r.title)&&txt(r.ref)&&SCOPES.indexOf(r.scope)>=0&&txt(r.decision)&&isD(r.date)&&txt(r.facil)); }
function roles(r){ return r.team.filter(function(m){ return txt(m.n)&&txt(m.role); }); }
function extIn(r){ return roles(r).filter(function(m){ return m.ext!=="no"; }); }
function teamOk(r){ return roles(r).length>=3&&extIn(r).length>0; }
function namedOk(r){ var P=pts(r); return P.length>0&&!P.some(genP); }
function reqsOk(r){ var Q=rqs(r); return !noReq(r).length&&Q.every(decOk)&&keyReqs(r).every(srcOk); }
function ratedOk(r){ return pts(r).every(rated)&&climOk(r); }
function engagedOk(r){ return ratedOk(r)&&keys(r).every(engOk)&&!uncov(r).length&&!unowned(r).length; }
function revOk(r){ return engagedOk(r)&&revGood(r,lastRev(r))&&isD(r.revBy); }
var STOK=[scopeOk,teamOk,namedOk,reqsOk,ratedOk,engagedOk,revOk];
function stageOf(r){ var k=0; while(k<STOK.length&&STOK[k](r)) k++; return STAGES[k]; }
function stageName(s){ return t("st_"+s); }
function stIdx(r){ return STAGES.indexOf(stageOf(r)); }
function atLeast(r,s){ return stIdx(r)>=STAGES.indexOf(s); }
/* display codes: P1 … parties, R1 … requirements, O1 … outcomes, A1 … actions, V1 … reviews, by order of entry */
function codes(r){ var o={}; r.pts.forEach(function(p,i){ o[p.id]="P"+(i+1); }); r.reqs.forEach(function(q,i){ o[q.id]="R"+(i+1); });
 r.outs.forEach(function(x,i){ o[x.id]="O"+(i+1); }); r.acts.forEach(function(a,i){ o[a.id]="A"+(i+1); }); r.revs.forEach(function(v,i){ o[v.id]="V"+(i+1); }); return o; }
function cList(r,list){ var CD=codes(r); return list.map(function(x){ return CD[x.id]||x.id; }).join(", "); }
/* one list of what is still open in a register; flags (records) and open items (dashboard, report) read it */
function issues(r){
 var o=[], R=roles(r), P=pts(r), Q=rqs(r), KQ=keyReqs(r);
 if(!(txt(r.ref)&&txt(r.title))) o.push(["ref","warn",{}]);
 if(!txt(r.decision)) o.push(["scope","warn",{}]);
 if(!(isD(r.date)&&txt(r.facil))) o.push(["date","warn",{}]);
 if(R.length<=1&&(R.length||P.length)) o.push(["solo","bad",{}]);
 else if(R.length<3) o.push(["team","warn",{}]);
 if(R.length&&!extIn(r).length) o.push(["ext","warn",{}]);
 if(!P.length&&R.length) o.push(["nopt","warn",{}]);
 var ng=P.filter(genP).length; if(ng) o.push(["gen","warn",{n:ng}]);
 var nr=noReq(r).length; if(P.length&&nr) o.push(["noreq","warn",{n:nr}]);
 var ns=KQ.filter(function(q){ return !srcOk(q); }).length; if(ns) o.push(["src","warn",{n:ns}]);
 var nx=Q.filter(function(q){ return !srcOk(q)&&KQ.indexOf(q)<0; }).length; if(nx) o.push(["srcx","info",{n:nx}]);
 var nd=Q.filter(function(q){ return !decOk(q); }).length; if(nd) o.push(["dec","warn",{n:nd}]);
 var nu=P.filter(function(p){ return !rated(p); }).length; if(nu) o.push(["rate","warn",{n:nu}]);
 if(P.length&&!climOk(r)) o.push(["clim","warn",{}]);
 var ne=keys(r).filter(function(p){ return !engOk(p); }).length; if(ne) o.push(["eng","warn",{n:ne}]);
 var uc=uncov(r).length; if(uc&&(outs(r).length||atLeast(r,"rated"))) o.push(["uncov","warn",{n:uc}]);
 var uo=unowned(r).length; if(uo) o.push(["own","warn",{n:uo}]);
 var nv=noEv(r).length; if(nv) o.push(["ev","warn",{n:nv}]);
 if(!isD(r.revBy)&&P.length) o.push(["revby","warn",{}]);
 if(revLate(r)) o.push(["late","bad",{}]);
 if(revEarly(r)) o.push(["revearly","warn",{}]);
 if(P.length&&!txt(r.trig)) o.push(["trig","info",{}]);
 if(engagedOk(r)&&!revGood(r,lastRev(r))) o.push(["norev","info",{}]);
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
function openIn(file,nav,id){ var q=id?{open:id}:{}; openWith(file,nav,q,id?"?open="+encodeURIComponent(id):""); }
function openSrc(src,id){
 var x=String(id||"").split("/")[0];
 if(src==="strat"){ openTool("strategy-performance.html",String(id||"").indexOf("PE")===0?"pestle":"swot"); return; }
 if(src==="swot"){ openIn("swot.html",SW_NAV,x); return; }
 if(src==="pestle"){ openIn("pestle.html",PE_NAV,x); return; }
 if(src==="lessons"){ openIn("lessons.html",LL_NAV,x); }
}
/* other tools' records saved in this browser (read only) */
function recsOf(key){ var S=TBX.read(key); if(!S) return null; return (Array.isArray(S.records)?S.records:[]).filter(function(r){ return r&&typeof r==="object"&&str(r.id); }); }
function byIdIn(key,id){ return (recsOf(key)||[]).filter(function(r){ return str(r.id)===id; })[0]||null; }
/* the Strategy & Performance Studio, read with its own value reader (copied at build time from modules/strategy-performance.html); it holds no
   interested-parties register, so its SWOT and PESTLE rows whose statement names a party are read */
/*__SS_RULES__*/
/* the SWOT tool's own record repair, stage rule, items and codes (copied at build time from tests/build/swot_host.js) */
/*__SW_RULES__*/
/* the PESTLE tool's own record repair, stage rule, items, top items and codes (copied at build time from tests/build/pestle_host.js) */
/*__PE_RULES__*/
/* the Lessons Learned record repair and stage rule (copied at build time from tests/build/lessons_host.js) */
/*__LL_RULES__*/
/* words that name a party in another tool's text, and the type they suggest */
var PKW=[["regulator",/(أمانة|بلدية|الدفاع المدني|هيئة|وزارة|مفتش|ترخيص|رخص|municipal|civil defen[cs]e|authority|ministry|inspector|regulator|permit)/i],
 ["customer",/(عميل|العملاء|المالك المستفيد|client|customer|employer'?s representative)/i],["supplier",/(مورد|موردي|مقاول الباطن|خرسانة جاهزة|supplier|vendor|subcontract|ready-?mix)/i],
 ["employees",/(عمال|العمال|موظف|الموظفين|الرافعين|رافعين|فرق|مشغل|workers|staff|employees|riggers|crews?|operators?)/i],["partner",/(بنك|البنك|تمويل|ممول|شريك|جهة اعتماد|bank|lender|financ|partner|certif)/i],
 ["community",/(سكان|جيران|جمعية|المجتمع|residents|neighbou?rs|association|community)/i],["owner",/(مساهم|مجلس الإدارة|shareholder|the board|investor)/i]];
function guessT(s){ s=String(s||""); for(var i=0;i<PKW.length;i++){ if(PKW[i][1].test(s)) return PKW[i][0]; } return ""; }
function namesParty(s){ return !!guessT(s); }
/* Strategy Studio rows (SWOT and PESTLE registers) that name a party */
function ssRegs(){ var S=TBX.read(STR_KEY); return (S&&S.r&&typeof S.r==="object")?S.r:null; }
function ssRows(){ var R=ssRegs(); if(!R) return null; var out=[]; ["swot","pestle"].forEach(function(k){ (Array.isArray(R[k])?R[k]:[]).forEach(function(x){ if(x&&typeof x==="object"&&txt(ssTKV(x.id))&&namesParty(ssTKV(x.text))) out.push({k:k,x:x}); }); }); return out; }
function ssRow(id){ return (ssRows()||[]).filter(function(z){ return txt(ssTKV(z.x.id))===id; })[0]||null; }
/* SWOT studies, PESTLE scans and lessons, each repaired with its own tool's rules */
function swRec(id){ var r=byIdIn(SW_KEY,id); return r?SWR.fix(JSON.parse(JSON.stringify(r))):null; }
function swPt(r){ return SWR.items(r).filter(function(i){ return i.src==="customer"||((i.q==="o"||i.q==="t")&&namesParty(i.t+" "+i.evs)); }); }
function peRec(id){ var r=byIdIn(PE_KEY,id); return r?PER.fix(JSON.parse(JSON.stringify(r))):null; }
function pePt(r){ return PER.items(r).filter(function(f){ return !!txt(f.who); }); }
function llRec(id){ var r=byIdIn(LL_KEY,id); return r?LLR.fix(JSON.parse(JSON.stringify(r))):null; }
function llPt(c){ return LLR.stage(c)!=="draft"&&(c.type==="customer"||/(عميل|مورد|customer|client|supplier|vendor)/i.test(c.title+" "+(c.what&&c.what.event||""))); }
/* previews, each by the other tool's own rule */
function pvSwStudy(id){ var r=swRec(id); if(!r) return t("swMiss"); return t("pvSw",{id:id,st:t("swst_"+SWR.stage(r)),t:short(r.title,90)}); }
function pvSwItem(r,i){ var CD=SWR.codes(r); return t("pvSwI",{id:str(r.id),i:CD[i.id]||i.id,q:t("swq_"+i.q),w:i.w||"—",t:short(i.ev||i.t,90)}); }
function pvPeScan(id){ var r=peRec(id); if(!r) return t("peMiss"); return t("pvPe",{id:id,st:t("pest_"+PER.stage(r)),t:short(r.title,90)}); }
function pvPeItem(r,f){ var CD=PER.codes(r); return t("pvPeI",{id:str(r.id),i:CD[f.id]||f.id,st:t("pest_"+PER.stage(r)),s:PER.score(f)||"—",w:short(f.who,60)}); }
function pvSs(z){ return t("pvSs",{id:txt(ssTKV(z.x.id)),k:z.k==="pestle"?"PESTLE":"SWOT",t:short(ssTKV(z.x.text),90)}); }
function pvLesson(id){ var r=llRec(id); if(!r) return t("nxMiss"); return t("pvLl",{id:id,st:t("llst_"+LLR.stage(r)),t:short(r.title,110)}); }
function srcPreview(src,id){
 if(src==="none") return "";
 var x=String(id||"").split("/");
 if(src==="swot"){ if(!(recsOf(SW_KEY)||[]).length) return t("nxNoData"); if(!id) return ""; var r=swRec(x[0]); if(!r) return t("nxMiss"); var it=x[1]?SWR.items(r).filter(function(i){ return i.id===x[1]; })[0]:null; return it?pvSwItem(r,it):pvSwStudy(x[0]); }
 if(src==="pestle"){ if(!(recsOf(PE_KEY)||[]).length) return t("nxNoData"); if(!id) return ""; var s=peRec(x[0]); if(!s) return t("nxMiss"); var f=x[1]?PER.items(s).filter(function(z){ return z.id===x[1]; })[0]:null; return f?pvPeItem(s,f):pvPeScan(x[0]); }
 if(src==="strat"){ if(!ssRegs()) return t("nxNoData"); if(!id) return ""; var z=ssRow(id); return z?pvSs(z):t("nxMiss"); }
 if(src==="lessons"){ if(!(recsOf(LL_KEY)||[]).length) return t("nxNoData"); if(!id) return ""; return pvLesson(x[0]); }
 return "";
}
/* the record a party names (its source id): a SWOT item STUDY/ITEM, a PESTLE item SCAN/ITEM, a Strategy Studio row, or a lesson */
function sidPreview(sid){
 if(!txt(sid)) return "";
 var p=String(sid).split("/");
 var s=swRec(p[0]); if(s){ var it=SWR.items(s).filter(function(i){ return i.id===p[1]; })[0]; return it?pvSwItem(s,it):pvSwStudy(p[0]); }
 var e=peRec(p[0]); if(e){ var f=PER.items(e).filter(function(z){ return z.id===p[1]; })[0]; return f?pvPeItem(e,f):pvPeScan(p[0]); }
 var z=ssRow(sid); if(z) return pvSs(z);
 if(llRec(p[0])) return pvLesson(p[0]);
 return "";
}

/* ---------- live views: the power/interest grid, the requirements matrix and the chart of parties (the same markup goes into the report) ---------- */
function tt0(lang){ return function(k,v){ var s=(UI[lang||L]||UI.ar)[k]; if(s===undefined) s=UI.ar[k]; if(v){ for(var x in v) s=String(s).split("{"+x+"}").join(v[x]); } return s; }; }
/* the 2 × 2 grid: power on the vertical axis (high on top), interest on the horizontal axis; the columns follow the page direction, so the grid is
   mirrored in Arabic (high interest on the left) */
function gridHTML(r,lang){
 var tt=tt0(lang), CD=codes(r), P=pts(r), un=P.filter(function(p){ return !quad(p); });
 var cell=function(q){ var Q=P.filter(function(p){ return quad(p)===q; });
  return '<section class="sk-q sk-q-'+q+'" style="--qc:'+QCOL[q]+'"><h5><b>'+esc(tt("qd_"+q))+'</b><small>'+esc(tt("qdH_"+q))+'</small></h5>'+
   (Q.length?'<ul>'+Q.map(function(p){ return '<li style="--tc:'+TCOL[p.ty]+'"><code dir="ltr">'+esc(CD[p.id])+'</code><span>'+esc(short(p.n,46))+'</span><em dir="ltr">'+p.pw+'·'+p.in+'</em></li>'; }).join("")+'</ul>':'<p class="sk-none">'+esc(tt("grEmpty"))+'</p>')+'</section>'; };
 return '<div class="sk-gridw" role="group" aria-label="'+esc(tt("grT"))+'"><div class="sk-ax-y" aria-hidden="true">'+esc(tt("grPw"))+'</div><div class="sk-grid">'+
  cell("satisfy")+cell("close")+cell("monitor")+cell("inform")+'</div><div class="sk-ax-x" aria-hidden="true">'+esc(tt("grIn"))+' '+((lang||L)==="ar"?"←":"→")+'</div></div>'+
  (un.length?'<p class="sk-none">'+esc(tt("grUn",{c:un.map(function(p){ return CD[p.id]; }).join(", ")}))+'</p>':'');
}
function rmHTML(r,lang){
 var tt=tt0(lang), CD=codes(r), P=pts(r);
 if(!rqs(r).length&&!P.length) return '<p class="sk-none">'+esc(tt("rmNone"))+'</p>';
 var tot={n:0,yes:0,part:0,no:0,und:0,src:0,cl:0};
 var rows=P.map(function(p){ var Q=reqsOf(r,p), c={n:Q.length,yes:0,part:0,no:0,und:0,src:Q.filter(srcOk).length,cl:Q.filter(function(q){ return q.cl==="yes"; }).length};
  Q.forEach(function(q){ if(q.ad) c[q.ad]++; else c.und++; }); for(var k in tot) tot[k]+=c[k];
  var z=function(v,cls){ return '<td class="'+(v?cls:"z")+'">'+(v||"·")+'</td>'; };
  return '<tr'+(isKey(p)?' class="key"':'')+'><th scope="row"><code dir="ltr">'+esc(CD[p.id])+'</code> '+esc(short(p.n,40))+(isKey(p)?' ★':'')+'</th><td>'+c.n+'</td>'+z(c.yes,"y")+z(c.part,"p")+z(c.no,"n")+z(c.und,"u")+'<td>'+(c.n?c.src+"/"+c.n:"—")+'</td><td>'+(c.cl||"·")+'</td></tr>'; }).join("");
 return '<div class="pd-tw"><table class="sk-rm"><thead><tr><th>'+esc(tt("rmP"))+'</th><th>'+esc(tt("rmN"))+'</th><th>'+esc(tt("rmYes"))+'</th><th>'+esc(tt("rmPart"))+'</th><th>'+esc(tt("rmNo"))+'</th><th>'+esc(tt("rmUnd"))+'</th><th>'+esc(tt("rmSrc"))+'</th><th>'+esc(tt("rmCl"))+'</th></tr></thead><tbody>'+rows+
  '</tbody><tfoot><tr><th>Σ</th><td>'+tot.n+'</td><td>'+tot.yes+'</td><td>'+tot.part+'</td><td>'+tot.no+'</td><td>'+tot.und+'</td><td>'+(tot.n?tot.src+"/"+tot.n:"—")+'</td><td>'+tot.cl+'</td></tr></tfoot></table></div>';
}
var FONT="font-family=\"'IBM Plex Sans Arabic','IBM Plex Sans',Calibri,Tahoma,sans-serif\"";
function chartW(){ try{ return window.innerWidth<640?340:560; }catch(e){ return 560; } }
/* a party is "sourced" when it has at least one requirement and every one of them has a source and a date */
function ptSourced(r,p){ var Q=reqsOf(r,p); return Q.length>0&&Q.every(srcOk); }
function srcSVG(list,o){
 o=o||{}; var lang=o.lang||L, rtl=lang==="ar", W=o.W||560, tt=tt0(lang), f=function(v){ return Math.round(v*10)/10; };
 var I=[]; list.forEach(function(r){ pts(r).forEach(function(p){ I.push({p:p,ok:ptSourced(r,p)}); }); });
 var lw=W<420?110:150, m={l:lw,r:34,t:10,b:10}, rowH=24, H=m.t+PTYPES.length*rowH+30+m.b, iw=W-m.l-m.r;
 var cnt={}; PTYPES.forEach(function(k){ cnt[k]={e:0,n:0}; }); I.forEach(function(x){ cnt[x.p.ty][x.ok?"e":"n"]++; });
 var mx=Math.max.apply(null,PTYPES.map(function(k){ return cnt[k].e+cnt[k].n; }).concat([1]));
 var out=['<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 '+W+' '+H+'" width="'+W+'" height="'+H+'" role="img" aria-label="'+esc(tt("chT"))+'" direction="ltr" '+FONT+'>','<rect width="'+W+'" height="'+H+'" fill="#FFFFFF"/>'];
 PTYPES.forEach(function(k,i){ var y=m.t+i*rowH, c=cnt[k], we=c.e/mx*iw, wn=c.n/mx*iw, x0=rtl?W-m.l:m.l, col=TCOL[k], lab=tt("ty_"+k);
  out.push('<text x="'+f(rtl?W-6:6)+'" y="'+f(y+15)+'" fill="'+col+'" font-size="11" font-weight="700" text-anchor="'+(rtl?"end":"start")+'">'+esc(lab)+'</text>');
  out.push('<rect x="'+f(rtl?m.r:m.l)+'" y="'+f(y+4)+'" width="'+f(iw)+'" height="14" rx="3" fill="#F3F6FA"/>');
  if(c.e) out.push('<rect x="'+f(rtl?x0-we:x0)+'" y="'+f(y+4)+'" width="'+f(we)+'" height="14" rx="3" fill="#2F7D4B"><title>'+esc(lab+" · "+tt("chEv")+" · "+c.e)+'</title></rect>');
  if(c.n) out.push('<rect x="'+f(rtl?x0-we-wn:x0+we)+'" y="'+f(y+4)+'" width="'+f(wn)+'" height="14" rx="3" fill="#C9D2DF"><title>'+esc(lab+" · "+tt("chOp")+" · "+c.n)+'</title></rect>');
  var tot=c.e+c.n; out.push('<text x="'+f(rtl?x0-we-wn-4:x0+we+wn+4)+'" y="'+f(y+15)+'" fill="#4B5874" font-size="10.5" text-anchor="'+(rtl?"end":"start")+'" direction="ltr">'+(tot||"")+'</text>'); });
 var ly=m.t+PTYPES.length*rowH+10, lx=rtl?W-16:6;
 out.push('<rect x="'+f(lx)+'" y="'+f(ly)+'" width="10" height="10" rx="2" fill="#2F7D4B"/><text x="'+f(rtl?lx-4:lx+14)+'" y="'+f(ly+9)+'" fill="#4B5874" font-size="10.5" text-anchor="'+(rtl?"end":"start")+'">'+esc(tt("chEv"))+'</text>');
 var lx2=rtl?W-190:186; out.push('<rect x="'+f(lx2)+'" y="'+f(ly)+'" width="10" height="10" rx="2" fill="#C9D2DF"/><text x="'+f(rtl?lx2-4:lx2+14)+'" y="'+f(ly+9)+'" fill="#4B5874" font-size="10.5" text-anchor="'+(rtl?"end":"start")+'">'+esc(tt("chOp"))+'</text>');
 if(!I.length) out.push('<text x="'+f(W/2)+'" y="'+f(m.t+PTYPES.length*rowH/2)+'" fill="#7A869E" font-size="12" text-anchor="middle">'+esc(tt("chEmpty"))+'</text>');
 out.push('</svg>'); return out.join("");
}
function shareLine(list,lang){ var n=0, e=0; list.forEach(function(r){ pts(r).forEach(function(p){ n++; if(ptSourced(r,p)) e++; }); }); if(!n) return ""; var p=Math.round(e/n*100); return tt0(lang)("chShare",{p:p,o:100-p}); }
/* stage map: seven stages; the same markup goes into the report */
function mapHTML(r,lang){
 var tt=tt0(lang), k=stIdx(r);
 return '<ol class="dm-map sk-map" aria-label="'+esc(tt("mapT"))+'">'+MAPST.map(function(s,i){ var st=(i+1<=k)?"done":(i+1===k+1?"cur":"todo");
  return '<li class="'+st+'" style="--pc:'+SCOL[s]+'"'+(st==="cur"?' aria-current="step"':'')+'><i aria-hidden="true">'+(i+1)+'</i><span><b>'+esc(tt("st_"+s))+'</b><small>'+esc(tt("mp_"+s))+' · '+esc(tt(st==="done"?"mpDone":(st==="cur"?"mpCur":"mpTodo")))+'</small></span></li>'; }).join("")+'</ol>';
}

/* ---------- register form ---------- */
var HDR=[["title","tx",1],["ref","ltr",0],["scope","sel:SCOPES:sc_",0],["date","date",0],["facil","tx",0],["owner","tx",0],["revBy","date",0],["src","sel:SRCS:src_",0],["srcId","srcid",0],["decision","ta",1],["trig","ta",1]];
var PATH={title:"title",ref:"ref",scope:"scope",date:"date",facil:"facil",owner:"owner",revBy:"revBy",trig:"trig",src:"src",srcId:"srcId",decision:"decision"};
var LISTS={SCOPES:SCOPES,SRCS:SRCS,EXTS:EXTS,PTYPES:PTYPES,IOS:IOS,YN0:[""].concat(YN),ADS0:[""].concat(ADS),CLIMS0:[""].concat(CLIMS),TOS:TOS,OQS0:[""].concat(OQS),PFS0:[""].concat(PFS),ASTS:ASTS,RTRIG:RTRIG};
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
function secHTML(k,col,inner){ return '<section class="dm-ph sk-sec" id="sec-'+k+'" style="--pc:'+col+'" aria-labelledby="sct-'+k+'"><h3 class="dm-pht" id="sct-'+k+'">'+esc(t("s"+k+"T"))+'</h3><p class="dm-phs">'+esc(t("s"+k+"S"))+'</p>'+inner+'</section>'; }
function buildForm(){
 document.getElementById("hdrFields").innerHTML=HDR.map(function(f){ return fieldHTML(f[0],f[1],f[2]); }).join("");
 var S1=tblHTML("tm","sk-tm",[t("tmN"),t("tmRole"),t("tmExt"),""])+'<p class="ca-hint" id="tmNone"></p><div class="a3-add">'+addBtn("tm",t("tmAdd"))+'</div><div class="w5-warn w5-bad" id="tmWarn" role="note" hidden></div>';
 var S2='<div id="ptCards" class="dm-cards sk-pcards"></div><p class="ca-hint" id="ptNone"></p><div class="a3-add">'+addBtn("pt",t("ptAdd"))+'</div><div class="w5-warn" id="ptWarn" role="note" hidden></div>';
 var S3=tblHTML("rq","sk-rq",[t("rq_p"),t("rq_t"),t("rq_so"),t("rq_d"),t("rq_cl"),t("rq_ad"),t("rq_why"),""])+'<p class="ca-hint" id="rqNone"></p><div class="a3-add">'+addBtn("rq",t("rqAdd"))+'</div><div class="w5-warn" id="rqWarn" role="note" hidden></div>'+
  '<div class="pd-fields sk-clim"><div class="pd-f"><label for="f-clDec">'+esc(t("clDec"))+'</label><select id="f-clDec">'+opts1(LISTS.CLIMS0,"cl_")+'</select></div><div class="pd-f wide"><label for="f-clWhy">'+esc(t("clWhy"))+'</label><textarea id="f-clWhy" rows="2"></textarea></div></div><div class="w5-warn" id="clWarn" role="note" hidden></div>';
 var S4='<div class="w5-warn" id="grWarn" role="note" hidden></div><h4 class="sk-vh">'+esc(t("grT"))+'</h4><div id="skGrid" aria-live="polite"></div>'+
  '<h4 class="sk-vh">'+esc(t("rmT"))+'</h4><div id="skRm"></div><h4 class="sk-vh">'+esc(t("chT"))+'</h4><div class="sk-chartw" id="skChart"></div><p class="ca-hint" id="skShare"></p>';
 var S5='<div class="a3-add"><button class="pd-btn ghost" type="button" id="ouAuto">'+esc(t("ouAuto"))+'</button><span class="pd-ok" id="ouMsg" role="status"></span></div>'+
  tblHTML("ou","sk-ou",[t("ou_p"),t("ou_to"),t("ou_q"),t("ou_fac"),t("ou_ref"),t("ou_what"),t("ou_why"),t("ou_who"),""])+'<p class="ca-hint" id="ouNone"></p><div class="a3-add">'+addBtn("ou",t("ouAdd"))+'</div><div class="w5-warn" id="ouWarn" role="note" hidden></div>';
 var S6='<div id="acCards" class="dm-cards sk-acards"></div><p class="ca-hint" id="acNone"></p><div class="a3-add">'+addBtn("ac",t("acAdd"))+'</div><div class="w5-warn" id="acWarn" role="note" hidden></div>';
 var S7=tblHTML("rv","sk-rv",[t("rvDate"),t("rvTrig"),t("rvChg"),t("rvAdd"),t("rvRem"),""])+'<p class="ca-hint" id="rvNone"></p><div class="a3-add">'+addBtn("rv",t("rvAddBtn"))+'</div><div class="w5-warn" id="rvWarn" role="note" hidden></div>';
 document.getElementById("stages").innerHTML=secHTML("Tm","#1E8C93",S1)+secHTML("Pt","#3563C9",S2)+secHTML("Rq","#7B5BB8",S3)+secHTML("Gr","#1B2A4A",S4)+secHTML("Ou","#C9821A",S5)+secHTML("Ac","#C2410C",S6)+secHTML("Rv","#3C9A5F",S7);
 fillLists();
}
function fill(list){ return list.map(function(r){ return '<option value="'+esc(r[0])+'">'+esc(r[1])+'</option>'; }).join(""); }
function srcIds(src){
 if(src==="swot") return (recsOf(SW_KEY)||[]).map(function(c){ return [str(c.id),(str(c.ref)?str(c.ref)+" · ":"")+str(c.title)]; });
 if(src==="pestle") return (recsOf(PE_KEY)||[]).map(function(c){ return [str(c.id),(str(c.ref)?str(c.ref)+" · ":"")+str(c.title)]; });
 if(src==="strat") return (ssRows()||[]).map(function(z){ return [txt(ssTKV(z.x.id)),short(ssTKV(z.x.text),80)]; });
 if(src==="lessons") return (recsOf(LL_KEY)||[]).map(function(c){ return [str(c.id),str(c.title)]; });
 return [];
}
function fillLists(){
 var put=function(id,list){ var dl=document.getElementById(id); if(dl) dl.innerHTML=fill(list); };
 var s=document.getElementById("f-src"); put("srcList",s?srcIds(s.value):[]);
 put("swList",srcIds("swot")); put("peList",srcIds("pestle"));
}
/* ---- small tables: team, requirements, outcomes, reviews ---- */
var TB={
 tm:{key:"team",blank:blankTm,pre:"",f:[["n","tx","tmN"],["role","tx","tmRole"],["ext","sel:EXTS:ex_","tmExt"]],max:MAXTEAM},
 rq:{key:"reqs",blank:blankRq,pre:"q",f:[["p","fsel","rq_p"],["t","ta","rq_t"],["so","tx","rq_so"],["d","date","rq_d"],["cl","sel:YN0:yn_","rq_cl"],["ad","sel:ADS0:ad_","rq_ad"],["why","ta","rq_why"]],max:MAXREQ},
 ou:{key:"outs",blank:blankOu,pre:"o",f:[["p","fsel","ou_p"],["to","sel:TOS:to_","ou_to"],["q","sel:OQS0:oq_","ou_q"],["fac","sel:PFS0:fac_","ou_fac"],["ref","ref","ou_ref"],["what","ta","ou_what"],["why","ta","ou_why"],["who","tx","ou_who"]],max:MAXOUTS},
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
var NONE={tm:"tmNone",rq:"rqNone",ou:"ouNone",rv:"rvNone",ac:"acNone",pt:"ptNone"};
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
/* ---- cards: parties, actions ---- */
function cf(pre,i,k,kind,labHTML,wide){
 var id="r-"+pre+"-"+i+"-"+k, a=' id="'+id+'" data-k="'+k+'"', m=/^sel:(\w+):(\w+)$/.exec(kind), inner;
 if(kind==="ta") inner='<textarea rows="1"'+a+'></textarea>';
 else if(kind==="date") inner='<input type="date"'+a+'>';
 else if(kind==="ltr") inner='<input type="text" dir="ltr"'+a+'>';
 else if(kind==="w") inner='<select'+a+'><option value="">—</option>'+WTS.map(function(x){ return '<option value="'+x+'">'+x+'</option>'; }).join("")+'</select>';
 else if(kind==="fsel") inner='<select'+a+' data-fsel></select>';
 else if(m) inner='<select'+a+'>'+opts1(LISTS[m[1]],m[2])+'</select>';
 else inner='<input type="text"'+a+'>';
 return '<div class="pd-f'+(wide?" wide":"")+' sk-f-'+k+'"><label for="'+id+'">'+labHTML+'</label>'+inner+'</div>';
}
function L1(k,v){ return esc(t(k,v)); }
var PTK=["n","ty","io","pw","pwr","in","inr","own","ch","fq","sid"], ACK=["p","what","who","by","st","done","ev"];
function ptCardHTML(x,i){
 return '<div class="dm-card sk-pt" data-row="'+i+'" data-cid="'+esc(x.id)+'">'+
  '<div class="dm-ch"><b class="dm-code" data-code dir="ltr"></b><span data-stc></span><button type="button" class="ca-x" data-rdel="pt:'+i+'" aria-label="'+esc(t("ptDel"))+'" title="'+esc(t("ptDel"))+'">✕</button></div>'+
  '<div class="pd-fields">'+cf("pt",i,"n","tx",L1("pt_n"),1)+cf("pt",i,"ty","sel:PTYPES:ty_",L1("pt_ty"))+cf("pt",i,"io","sel:IOS:io_",L1("pt_io"))+
  cf("pt",i,"pw","w",L1("pt_pw"))+cf("pt",i,"pwr","tx",L1("pt_pwr"))+cf("pt",i,"in","w",L1("pt_in"))+cf("pt",i,"inr","tx",L1("pt_inr"))+
  cf("pt",i,"own","tx",L1("pt_own"))+cf("pt",i,"ch","tx",L1("pt_ch"))+cf("pt",i,"fq","tx",L1("pt_fq"))+cf("pt",i,"sid","ltr",L1("pt_sid"))+'</div><p class="a3-pv" data-pv></p><span class="a3-flag" data-flag></span></div>';
}
function acCardHTML(x,i){
 return '<div class="dm-card sk-ac" data-row="'+i+'" data-cid="'+esc(x.id)+'">'+
  '<div class="dm-ch"><b class="dm-code" data-code dir="ltr"></b><span data-stc></span><button type="button" class="ca-x" data-rdel="ac:'+i+'" aria-label="'+esc(t("acDel"))+'" title="'+esc(t("acDel"))+'">✕</button></div>'+
  '<div class="pd-fields">'+cf("ac",i,"p","fsel",L1("ac_p"))+cf("ac",i,"what","ta",L1("ac_what"),1)+cf("ac",i,"who","tx",L1("ac_who"))+cf("ac",i,"by","date",L1("ac_by"))+cf("ac",i,"st","sel:ASTS:as_",L1("ac_st"))+cf("ac",i,"done","date",L1("ac_done"))+cf("ac",i,"ev","ta",L1("ac_ev"),1)+'</div><span class="a3-flag" data-flag></span></div>';
}
function setVal(el,v){ if(!el) return; if(el.tagName==="SELECT"){ if([].some.call(el.options,function(o){ return o.value===String(v==null?"":v); })) el.value=String(v==null?"":v); else el.setAttribute("data-v",String(v==null?"":v)); } else el.value=v==null?"":String(v); }
function renderPts(list){
 var box=document.getElementById("ptCards"); if(!box) return;
 box.innerHTML=list.map(function(x,i){ return ptCardHTML(x,i); }).join("");
 [].forEach.call(box.querySelectorAll(".dm-card"),function(card,i){ var x=list[i]; PTK.forEach(function(k){ setVal(card.querySelector('[data-k="'+k+'"]'),x[k]); }); });
 var ne=document.getElementById("ptNone"); if(ne) ne.textContent=list.length?"":t("ptNone"); autoSizeAll(box);
}
function readPts(){
 var box=document.getElementById("ptCards"); if(!box) return [];
 return [].map.call(box.querySelectorAll(".dm-card"),function(card){ var o={id:card.getAttribute("data-cid")}; PTK.forEach(function(k){ var el=card.querySelector('[data-k="'+k+'"]'); o[k]=el?txt(el.value):""; }); return o; });
}
function renderActs(list){
 var box=document.getElementById("acCards"); if(!box) return;
 box.innerHTML=list.map(function(x,i){ return acCardHTML(x,i); }).join("");
 [].forEach.call(box.querySelectorAll(".dm-card"),function(card,i){ var x=list[i]; ACK.forEach(function(k){ var el=card.querySelector('[data-k="'+k+'"]'); if(k==="p"&&el){ el.setAttribute("data-v",x.p); } else setVal(el,x[k]); }); });
 var ne=document.getElementById("acNone"); if(ne) ne.textContent=list.length?"":t("acNone"); autoSizeAll(box);
}
function readActs(){
 var box=document.getElementById("acCards"); if(!box) return [];
 return [].map.call(box.querySelectorAll(".dm-card"),function(card){ var o={id:card.getAttribute("data-cid")}; ACK.forEach(function(k){ var el=card.querySelector('[data-k="'+k+'"]'); o[k]=el?((k==="p"&&!el.options.length)?(el.getAttribute("data-v")||""):txt(el.value)):""; }); return o; });
}
function autoSize(el){ if(!el||el.tagName!=="TEXTAREA") return; el.style.height="auto"; if(el.scrollHeight) el.style.height=(el.scrollHeight+2)+"px"; }
function autoSizeAll(root){ if(root) root.querySelectorAll("textarea").forEach(autoSize); }
/* the register as it would be saved: empty rows dropped */
function formToRec(){
 var r=blank();
 Object.keys(PATH).forEach(function(k){ var el=document.getElementById("f-"+k); if(el) r[PATH[k]]=txt(el.value); });
 if(document.getElementById("ptCards")){
  r.team=readTbl("tm").map(fixTm).filter(function(x){ return x.n||x.role; });
  r.pts=readPts().filter(function(x){ return x.n||x.pwr||x.inr||x.own||x.ch; });
  r.reqs=readTbl("rq").filter(function(x){ return x.p||x.t||x.so||x.d||x.why; });
  var cd=document.getElementById("f-clDec"), cw=document.getElementById("f-clWhy"); r.clim={dec:cd?cd.value:"",why:cw?txt(cw.value):""};
  r.outs=readTbl("ou").filter(function(x){ return x.p||x.ref||x.what||x.why||x.who; });
  r.acts=readActs().filter(function(x){ return x.what||x.who||x.ev; });
  r.revs=readTbl("rv").filter(function(x){ return x.date||x.chg||x.add||x.rem; });
 }
 r.id=document.getElementById("rid").value;
 if(editing&&editing.id===r.id){ r.created=editing.created||""; }
 fixRec(r);
 return r;
}
/* while typing, the register keeps every row (even empty ones) so the cards and tables keep their shape */
function formRaw(){ return {tm:readTbl("tm"),rq:readTbl("rq"),ou:readTbl("ou"),rv:readTbl("rv"),pt:readPts(),ac:readActs()}; }
function recToForm(r,keepMsg){
 r=fixRec(JSON.parse(JSON.stringify(r)));
 document.getElementById("rid").value=r.id||"";
 Object.keys(PATH).forEach(function(k){ var el=document.getElementById("f-"+k); if(!el) return; var v=r[PATH[k]]; v=(v===null||v===undefined)?"":String(v); el.value=v||(el.tagName==="SELECT"&&el.options.length?el.options[0].value:""); });
 fillLists();
 renderTbl("tm",r.team); renderPts(r.pts); renderTbl("rq",r.reqs);
 var cd=document.getElementById("f-clDec"), cw=document.getElementById("f-clWhy"); if(cd) cd.value=r.clim.dec; if(cw) cw.value=r.clim.why;
 renderTbl("ou",r.outs); renderActs(r.acts); renderTbl("rv",r.revs);
 if(!keepMsg){ ["recErr","recOk","ouMsg"].forEach(function(id){ var e=document.getElementById(id); if(e) e.textContent=""; }); }
 refreshForm();
 autoSizeAll(document.getElementById("stages")); autoSizeAll(document.getElementById("hdrFields"));
}
function loadRecordIntoForm(r){ editing=fixRec(JSON.parse(JSON.stringify(r))); recToForm(editing); }
function clearForm(){ editing=null; recToForm(blank()); }
function setW(id,on,msg){ var w=document.getElementById(id); if(!w) return; w.hidden=!on; w.textContent=on?msg:""; }
/* the party lists inside requirement and outcome rows and action cards follow the form; they are rebuilt only when the parties have changed, so
   typing never loses focus */
function ptLabel(CD,p){ return CD[p.id]+" · "+short(p.n,60); }
function syncSelects(r,CD){
 var sig=JSON.stringify(r.pts.map(function(p){ return [p.id,ptLabel(CD,p)]; }))+L;
 document.querySelectorAll("#rqRows select[data-fsel], #ouRows select[data-fsel], #acCards select[data-fsel]").forEach(function(el){ if(el.getAttribute("data-sig")===sig) return; var cur=el.options.length?el.value:(el.getAttribute("data-v")||"");
  var first=el.closest("#acCards")?t("acPick"):(el.closest("#rqRows")?t("rqPick"):t("ouPick"));
  el.innerHTML='<option value="">'+esc(first)+'</option>'+pts(r).map(function(p){ return '<option value="'+esc(p.id)+'">'+esc(ptLabel(CD,p))+'</option>'; }).join("");
  el.value=pts(r).some(function(p){ return p.id===cur; })?cur:""; el.setAttribute("data-sig",sig); });
}
function refreshForm(){
 var r=formToRec(), st=stageOf(r), CD=codes(r), raw=formRaw(), K=keys(r);
 var el=document.getElementById("curStage"); if(el) el.textContent=t("cur")+" "+stageName(st);
 document.getElementById("caSteps").innerHTML=mapHTML(r);
 /* source */
 var si=document.getElementById("srcInfo"); if(si) si.textContent=r.src==="none"?t("srcHint"):(r.srcId?srcPreview(r.src,r.srcId):(srcPreview(r.src,"")||t("srcHint")));
 var so=document.getElementById("srcOpen"); if(so) so.disabled=r.src==="none";
 /* team */
 var R=roles(r), tw=[]; if(R.length<=1&&(R.length||pts(r).length)) tw.push(t("tmSolo")); else if(R.length&&R.length<3) tw.push(t("tmW3")); if(R.length&&!extIn(r).length) tw.push(t("tmWext"));
 setW("tmWarn",tw.length>0,tw.join(" ")); var tb=document.querySelector('[data-add="tm"]'); if(tb) tb.disabled=raw.tm.length>=MAXTEAM;
 /* parties */
 var byId={}; r.pts.forEach(function(p){ byId[p.id]=p; });
 document.querySelectorAll("#ptCards .dm-card").forEach(function(card,i){ var x=fixPt(raw.pt[i]||{}), p=byId[x.id]||null;
  card.querySelector("[data-code]").textContent=p&&txt(p.n)?CD[p.id]:"P·";
  card.style.setProperty("--tc",TCOL[x.ty]);
  var ch=[]; var q=quad(x); if(q) ch.push('<span class="ca-chip info" style="border-color:'+QCOL[q]+';color:'+QCOL[q]+'">'+esc(t("qd_"+q))+'</span>'); if(isKey(x)) ch.push('<span class="ca-chip ok">'+esc(t("keyB"))+'</span>');
  card.querySelector("[data-stc]").innerHTML=ch.join(" ");
  var msg=[]; if(txt(x.n)&&genP(x)) msg.push(t("genP")); if(txt(x.n)&&!rated(x)) msg.push(t("rateF")); if(txt(x.n)&&isKey(x)&&!engOk(x)) msg.push(t("engF")); if(p&&txt(p.n)&&!reqsOf(r,p).length) msg.push(t("noReqF"));
  card.querySelector("[data-flag]").textContent=msg.join(" "); card.classList.toggle("a3-pf",msg.length>0);
  var pv=card.querySelector("[data-pv]"); if(pv) pv.textContent=x.sid?sidPreview(x.sid):""; });
 var ng=pts(r).filter(genP).length; setW("ptWarn",ng>0,t("oi_gen",{n:ng}));
 var pb=document.querySelector('[data-add="pt"]'); if(pb) pb.disabled=raw.pt.length>=MAXPT;
 /* requirements, the 4.2 c) decision and climate */
 syncSelects(r,CD);
 document.querySelectorAll("#rqRows tr[data-row]").forEach(function(tr,i){ var q=fixRq(raw.rq[i]||{}), on=!!(q.p||txt(q.t)||txt(q.so)||txt(q.why)), msg=[];
  if(on){ if(!ptById(r,q.p)) msg.push(t("rqBadP")); if(!srcOk(q)) msg.push(t("rqSrcF")); if(!q.ad) msg.push(t("rqDecF")); else if(!decOk(q)) msg.push(t("rqWhyF")); }
  tr.classList.toggle("a3-pf",msg.length>0); tr.title=msg.join(" "); });
 var nr=noReq(r); setW("rqWarn",nr.length>0&&pts(r).length>0,t("rqW",{n:nr.length,c:cList(r,nr)}));
 var rb=document.querySelector('[data-add="rq"]'); if(rb) rb.disabled=raw.rq.length>=MAXREQ;
 var cw=""; if(pts(r).length&&!r.clim.dec) cw=t("clW"); else if(r.clim.dec&&!txt(r.clim.why)) cw=t("clWhyW"); else if(r.clim.dec==="found"&&!rqs(r).some(function(q){ return q.cl==="yes"; })) cw=t("clFoundW"); setW("clWarn",!!cw,cw);
 /* grid and views */
 var un=pts(r).filter(function(p){ return !rated(p); }).length; setW("grWarn",un>0,t("oi_rate",{n:un}));
 var put=function(id,h){ var e=document.getElementById(id); if(e) e.innerHTML=h; };
 put("skGrid",gridHTML(r)); put("skRm",rmHTML(r)); put("skChart",srcSVG([r],{lang:L,W:chartW()}));
 var sh=document.getElementById("skShare"); if(sh) sh.textContent=shareLine([r]);
 /* outcomes */
 document.querySelectorAll("#ouRows tr[data-row]").forEach(function(tr,i){ var o=fixOu(raw.ou[i]||{}), b=tr.querySelector("[data-ouo]"), pv=tr.querySelector("[data-pv]"), ref=txt(o.ref), inp=tr.querySelector('[data-k="ref"]');
  if(inp) inp.setAttribute("list",o.to==="pestle"?"peList":"swList");
  if(b){ b.hidden=!(o.to==="iso31000"||((o.to==="swot"||o.to==="pestle")&&ref)); b.textContent=o.to==="iso31000"?t("isoOpen")+" ↗":(o.to==="pestle"?t("peOpen"):t("swOpen"))+" ↗"; }
  var miss=(o.p||ref||txt(o.what)||txt(o.why))?outMiss(r,o):"";
  if(pv) pv.textContent=(o.to==="swot"&&ref?pvSwStudy(ref):(o.to==="pestle"&&ref?pvPeScan(ref):(o.to==="iso31000"?t("isoNote"):"")))+(miss?(" "+t(miss)).replace(/^ /,""):"");
  tr.classList.toggle("a3-pf",!!miss); });
 var uc=uncov(r), ow=""; if(K.length&&uc.length) ow=t("uncovW",{n:uc.length,c:cList(r,uc)}); else if(pts(r).length&&!un&&!K.length) ow=t("noKeyW");
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
 var y=(isD(r.date)?r.date:today()).slice(0,4), pre="ST-"+y+"-";
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
/* one outcome row for each key party that has none yet; the destination is left to the team */
function autoOutcomes(){
 var r=formToRec(), F=formRaw(), U=uncov(r).filter(function(p){ return !F.ou.some(function(o){ return o.p===p.id; }); });
 U.forEach(function(p){ if(F.ou.length<MAXOUTS) F.ou.push(blankOu(nextId(F.ou,"o",editing?editing.outs:[]),p.id)); });
 renderTbl("ou",F.ou); refreshForm(); var m=document.getElementById("ouMsg"); if(m) m.textContent=U.length?t("ouAutoDone"):"";
}

/* ---------- start from SWOT, PESTLE, the Strategy Studio or a lesson (read only, preview first) ---------- */
function stSelects(){ var s=document.getElementById("stSrc"); if(!s) return; var cur=s.value||"swot"; s.innerHTML=opts1(STSRC,"ss_",cur); }
function nFrom(src,id){ return DB.records.filter(function(r){ return (r.src===src&&(r.srcId===id||r.srcId.split("/")[0]===id))||r.pts.some(function(p){ return p.sid===id||p.sid.split("/")[0]===id; }); }).length; }
/* the rows a register can start from, each as {id, x (row inside the record), t, ty, info} */
function stRows(src){
 if(src==="swot"){ var S=recsOf(SW_KEY); if(!S) return null; var out=[]; S.forEach(function(c){ var r=SWR.fix(JSON.parse(JSON.stringify(c))); swPt(r).forEach(function(i){ out.push({id:str(r.id),x:i.id,t:i.t,ty:guessT(i.t+" "+i.evs)||"customer",info:pvSwItem(r,i)}); }); }); return out; }
 if(src==="pestle"){ var P=recsOf(PE_KEY); if(!P) return null; var o2=[]; P.forEach(function(c){ var r=PER.fix(JSON.parse(JSON.stringify(c))); pePt(r).forEach(function(f){ o2.push({id:str(r.id),x:f.id,t:f.who+" — "+f.t,ty:guessT(f.who)||"other",info:pvPeItem(r,f)}); }); }); return o2; }
 if(src==="strat"){ var R=ssRows(); if(!R) return null; return R.map(function(z){ return {id:txt(ssTKV(z.x.id)),x:"",t:ssTKV(z.x.text),ty:guessT(ssTKV(z.x.text))||"other",info:pvSs(z)}; }); }
 if(src==="lessons"){ var LR=recsOf(LL_KEY); if(!LR) return null; return LR.map(function(c){ return LLR.fix(JSON.parse(JSON.stringify(c))); }).filter(llPt).map(function(c){ return {id:str(c.id),x:"",t:c.title,ty:/(مورد|supplier|vendor)/i.test(c.title+" "+(c.what.event||""))?"supplier":"customer",info:pvLesson(str(c.id))}; }); }
 return null;
}
function th(keys){ return '<thead><tr>'+keys.map(function(k){ return '<th>'+esc(t(k))+'</th>'; }).join("")+'</tr></thead>'; }
function stPreview(keep){
 var src=document.getElementById("stSrc").value||"swot", msg=document.getElementById("stMsg"), box=document.getElementById("stTable"), R=stRows(src);
 if(!R){ ST=null; box.hidden=true; msg.textContent=t("stNone"); return; }
 if(!R.length){ ST=null; box.hidden=true; msg.textContent=t("stEmpty"); return; }
 ST={src:src}; if(!keep) msg.textContent="";
 box.hidden=false;
 var studies=[]; if(src==="swot"||src==="pestle") R.forEach(function(c){ if(studies.indexOf(c.id)<0) studies.push(c.id); });
 box.innerHTML=(studies.length?'<div class="pd-btns" style="margin:0 0 8px">'+studies.map(function(id){ return '<button class="pd-btn ghost" type="button" data-stsrc="'+src+'" data-stid="'+esc(id)+'" data-stx="">'+esc(t("stStudy",{id:id}))+'</button>'; }).join("")+'</div>':'')+
  '<table class="pd-tbl">'+th(["stColId","stColT","stColG","stColInfo","stColN","stColA"])+'<tbody>'+R.map(function(c){
  return '<tr><td><b dir="ltr">'+esc(c.id)+'</b>'+(c.x?'<br><small dir="ltr">'+esc(c.x)+'</small>':'')+'</td><td>'+esc(short(c.t,140))+'</td><td>'+esc(t("ty_"+c.ty))+'</td><td><small>'+esc(c.info)+'</small></td><td>'+nFrom(src,c.id)+'</td><td><button class="pd-rowbtn" type="button" data-stsrc="'+src+'" data-stid="'+esc(c.id)+'" data-stx="'+esc(c.x||"-")+'">'+esc(t("stUse"))+'</button></td></tr>'; }).join("")+'</tbody></table>';
}
function prefilled(r,src,id){ fixRec(r); editing=null; recToForm(r); go("tools"); document.getElementById("recOk").textContent=t("stUsed",{s:t("src_"+src),id:id}); return true; }
/* a new register filled from another tool's record; that record is only read. The party (its name as the source names it, to be made specific),
   its suggested type, one requirement with what the source says, the source's date and the source id are filled; the power, the interest, the
   4.2 c) decision, the team, the climate question and the outcomes are left to the team. */
function addPt(r,name,ty,sid,reqT,so,d,cl){ var k=r.pts.length+1, p=blankPt("p"+k); p.n=short(name,80); p.ty=pick(ty,PTYPES)||"other"; p.sid=sid; r.pts.push(p);
 var q=blankRq("q"+(r.reqs.length+1),p.id); q.t=reqT; q.so=so||""; q.d=isD(d)?d:""; q.cl=cl||""; r.reqs.push(q); }
function prefillFrom(src,id,x){
 if(STSRC.indexOf(src)<0) return false;
 var r=blank(); r.src=src; r.srcId=id; r.date="";
 if(src==="swot"){ var s=swRec(id); if(!s) return false; var I=swPt(s).filter(function(i){ return !x||x==="-"||i.id===x; }); if(!I.length) return false;
  I.forEach(function(i){ addPt(r,txt(i.evs)||i.t,guessT(i.t+" "+i.evs)||"customer",str(s.id)+"/"+i.id,txt(i.t)+(txt(i.ev)?" — "+txt(i.ev):""),i.evs,i.evd,""); });
  r.title=t("pfT")+short(s.title,80); r.scope=pick(s.scope,SCOPES)||"org"; if(x&&x!=="-") r.srcId=id+"/"+x; return prefilled(r,src,id); }
 if(src==="pestle"){ var e=peRec(id); if(!e) return false; var F=pePt(e).filter(function(f){ return !x||x==="-"||f.id===x; }); if(!F.length) return false;
  F.forEach(function(f){ addPt(r,f.who,guessT(f.who)||"other",str(e.id)+"/"+f.id,f.t,f.so,f.d,f.g==="en"?"yes":""); });
  r.title=t("pfT")+short(e.title,80); r.scope=pick(e.scope,SCOPES)||"org"; if(x&&x!=="-") r.srcId=id+"/"+x; return prefilled(r,src,id); }
 if(src==="strat"){ var z=ssRow(id); if(!z) return false; var tx=ssTKV(z.x.text);
  addPt(r,tx,guessT(tx)||"other",id,tx,t("src_strat")+" "+id,"",""); r.title=t("pfT")+short(tx,80); return prefilled(r,src,id); }
 if(src==="lessons"){ var c=llRec(id); if(!c||!llPt(c)) return false; var sup=/(مورد|supplier|vendor)/i.test(c.title+" "+(c.what.event||""));
  addPt(r,c.title,sup?"supplier":"customer",id,txt(c.lesson.dothis)?c.lesson.dothis:c.title,t("src_lessons")+" "+id,c.date,""); r.title=t("pfT")+short(c.title,80); return prefilled(r,src,id); }
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
 ["IN1",{ar:"هل يُعدّ تحليل الأطراف المعنية فريق من ثلاثة أدوار على الأقل، وفيه رأي من خارجه (عميل أو مورد أو مستشار أو إدارة أخرى)، لا شخص واحد؟",en:"Is the stakeholder analysis prepared by a team of at least three roles with input from outside it (a customer, a supplier, an advisor or another department), not by one person?"}],
 ["IN2",{ar:"هل تُسمّى الأطراف بعينها (جهة أو فئة محددة)، لا «المجتمع» أو «العملاء» أو «الحكومة» بلا جهة مسماة؟",en:"Are the parties named specifically (a named body or group), not \"the community\", \"customers\" or \"the government\" with no named body?"}],
 ["IN3",{ar:"هل تُكتب احتياجات كل طرف متطلبات بمصدرها (بند عقد، أو نظام، أو استبيان، أو محضر اجتماع) وتاريخها؟",en:"Are each party's needs written as requirements with their source (a contract clause, a regulation, a survey, a meeting record) and their date?"}],
 ["DE1",{ar:"هل يُقرر لكل متطلب هل يعالجه نظام الإدارة أم لا، ويُكتب السبب عندما لا يعالجه أو يعالجه جزئياً (ISO 9001:2026 البند 4.2 ج))؟",en:"Is it decided for every requirement whether the management system addresses it, with the reason when it does not or only partly (ISO 9001:2026 clause 4.2 c))?"}],
 ["DE2",{ar:"هل تُقيّم قوة كل طرف (أو تأثيره) واهتمامه بسبب قصير، لا بانطباع؟",en:"Are each party's power (or influence) and interest rated with a short reason, not by impression?"}],
 ["DE3",{ar:"هل لكل طرف رئيسي طريقة تعامل محددة، ومالك للعلاقة، وقناة تواصل وتكرارها؟",en:"Does every key party have a defined engagement approach, a relationship owner, a channel and a frequency?"}],
 ["OU1",{ar:"هل تُسأل الأطراف صراحة عن متطلباتها المتصلة بتغير المناخ (ملاحظة البند 4.2)، وتُسجل النتيجة؟",en:"Are the parties asked explicitly about their climate-related requirements (the NOTE to clause 4.2), with the result recorded?"}],
 ["OU2",{ar:"هل تدخل الأطراف الرئيسية في تحليل SWOT أو مسح PESTLE مصدراً للفرص والتهديدات؟",en:"Do the key parties go into the SWOT analysis or the PESTLE scan as sources of opportunities and threats?"}],
 ["OU3",{ar:"هل تدخل الأطراف الرئيسية في سجل المخاطر أو خطة المخاطر والفرص (6.1)، أو تُستبعد بسبب مكتوب؟",en:"Do the key parties go into the risk register or the risks and opportunities plan (6.1), or are they set aside with a written reason?"}],
 ["RV1",{ar:"هل يؤرخ السجل ويُحدد موعد مراجعته، ويُراجع دورياً وبعد التغيرات الكبيرة (عقد جديد، نظام جديد، شكوى كبيرة)؟",en:"Is the register dated with a review date set, and reviewed periodically and after major changes (a new contract, a new regulation, a major complaint)?"}],
 ["RV2",{ar:"هل تُعرض تغيرات احتياجات الأطراف وتوقعاتها في مراجعة الإدارة (ISO 9001:2026 البند 9.3.2 ج))؟",en:"Are the changes in the parties' needs and expectations presented at management review (ISO 9001:2026 clause 9.3.2 c))?"}],
 ["RV3",{ar:"هل تُبلَّغ نتيجة التحليل والقرارات التي خرجت منه إلى مالكي العلاقات ومن يحتاجها؟",en:"Are the result of the analysis and the decisions taken from it communicated to the relationship owners and those who need them?"}]
];
var AGROUPS=["IN","DE","OU","RV"];
var GCOL2={IN:"#3563C9",DE:"#7B5BB8",OU:"#2F7D4B",RV:"#3C9A5F"};
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
  var st=stageOf(r), K=keys(r), KQ=keyReqs(r), A=acts(r), P=pts(r);
  var del=(pendingDelete===r.id)?'<button class="pd-rowbtn arm" type="button" data-del="'+esc(r.id)+'">'+esc(t("delArm"))+'</button>':'<button class="pd-rowbtn" type="button" data-del="'+esc(r.id)+'">'+esc(t("del"))+'</button>';
  var lk=(r.src!=="none"&&r.srcId?'<button class="pd-rowbtn" type="button" data-osrc="'+esc(r.src)+'" data-oid="'+esc(r.srcId)+'">'+esc(t("src_"+r.src))+' ↗</button>':'');
  return '<tr><td><b dir="ltr">'+esc(r.ref||"—")+'</b><br>'+esc(r.title)+'<br><small dir="ltr" style="color:var(--muted)">'+esc(r.id)+(isD(r.date)?' · '+esc(r.date):'')+'</small></td><td>'+esc(t("sc_"+r.scope))+'<br><small>'+esc(short(r.decision,120)||"—")+'</small></td><td>'+stChip(st)+'</td><td>'+esc(t("ptN",{n:P.length,k:K.length}))+'</td><td>'+(KQ.length?KQ.filter(function(q){ return srcOk(q)&&decOk(q); }).length+"/"+KQ.length:"—")+'</td><td>'+(K.length?K.filter(function(p){ return covered(r,p); }).length+"/"+K.length:"—")+' · '+(A.length?A.filter(actOwned).length+"/"+A.length:"—")+'</td><td>'+flagsOf(r).map(chip).join("")+'</td><td><button class="pd-rowbtn" type="button" data-open="'+esc(r.id)+'">'+esc(t("open"))+'</button>'+del+lk+'</td></tr>';
 }).join("");
 box.innerHTML='<table class="pd-tbl">'+th(["colRef","colScope","colStage","colPt","colSrc","colOut","colFlags","colAct"])+'<tbody>'+rows+'</tbody></table>';
}
function openOutcome(tr){ var dv=(tr.querySelector('[data-k="to"]')||{}).value, rf=txt((tr.querySelector('[data-k="ref"]')||{}).value); if(dv==="iso31000") openTool("iso31000-risk-studio.html"); else if(dv==="pestle"&&rf) openIn("pestle.html",PE_NAV,rf); else if(rf) openIn("swot.html",SW_NAV,rf); }
document.addEventListener("click",function(e){
 if(e.target.closest("#cb")) return;
 var o=e.target.closest("[data-open]"); if(o){ var r=DB.records.find(function(x){ return x.id===o.getAttribute("data-open"); }); if(r){ loadRecordIntoForm(r); go("tools"); } return; }
 var d=e.target.closest("[data-del]"); if(d){ var id=d.getAttribute("data-del"); if(pendingDelete===id){ DB.records=DB.records.filter(function(x){ return x.id!==id; }); pendingDelete=null; persist(); if(document.getElementById("rid").value===id) clearForm(); renderAll(); } else { pendingDelete=id; renderDocs(); } return; }
 var os=e.target.closest("[data-osrc]"); if(os){ openSrc(os.getAttribute("data-osrc"),os.getAttribute("data-oid")); return; }
 if(e.target.closest("#srcOpen")){ var r2=formToRec(); openSrc(r2.src,r2.srcId); return; }
 if(e.target.closest("#ouAuto")){ autoOutcomes(); return; }
 var ou=e.target.closest("[data-ouo]"); if(ou){ openOutcome(ou.closest("tr")); return; }
 var rel=e.target.closest("[data-rel]"); if(rel){ e.preventDefault(); var R0=RELATED.filter(function(x){ return x[0]===rel.getAttribute("data-rel"); })[0]; if(R0) openTool(R0[2].replace("./","").split("#")[0],R0[4]||undefined); return; }
 var ad=e.target.closest("[data-add]"); if(ad){ var tb=ad.getAttribute("data-add"), F=formRaw();
  if(tb==="pt"){ if(F.pt.length<MAXPT){ F.pt.push(blankPt(nextId(F.pt,"p",editing?editing.pts:[]))); renderPts(F.pt.map(fixPt)); var bp=document.getElementById("ptCards"), lp=bp&&bp.querySelector(".dm-card:last-child input"); if(lp) lp.focus(); } refreshForm(); return; }
  if(tb==="ac"){ if(F.ac.length<MAXACTS){ F.ac.push(blankAc(nextId(F.ac,"a",editing?editing.acts:[]))); renderActs(F.ac.map(fixAc)); var ba=document.getElementById("acCards"), la=ba&&ba.querySelector(".dm-card:last-child textarea"); if(la) la.focus(); } refreshForm(); return; }
  var list=F[tb]; if(list.length<TB[tb].max){ var nb=TB[tb].blank(); if(TB[tb].pre) nb.id=nextId(list,TB[tb].pre,editing?editing[TB[tb].key]:[]); list.push(nb); renderTbl(tb,list); var box=document.getElementById(tb+"Rows"), lt2=box&&box.querySelector("tr:last-child input, tr:last-child select, tr:last-child textarea"); if(lt2) lt2.focus(); } refreshForm(); return; }
 var rd=e.target.closest("[data-rdel]"); if(rd){ var a=rd.getAttribute("data-rdel").split(":"), F2=formRaw(), l2=F2[a[0]]; l2.splice(Number(a[1]),1);
  if(a[0]==="ac") renderActs(l2.map(fixAc)); else if(a[0]==="pt") renderPts(l2.map(fixPt)); else renderTbl(a[0],l2); refreshForm(); return; }
});
/* a new source tool clears the record id of the old one, and the list of ids follows the tool */
document.addEventListener("change",function(e){
 var el=e.target; if(!el) return;
 if(el.id==="f-src"){ var s=document.getElementById("f-srcId"); if(s) s.value=""; fillLists(); refreshForm(); }
},true);

/* ---------- automatic audit of registers ---------- */
var CHECKS=["ref","team","named","src","dec","rate","clim","outs","acts","review"];
function auditRecord(r){
 var P=pts(r), Q=rqs(r), KQ=keyReqs(r), K=keys(r);
 return {
  ref:!!(txt(r.ref)&&txt(r.title)&&txt(r.decision)&&SCOPES.indexOf(r.scope)>=0),
  team:teamOk(r),
  named:P.length?!P.some(genP):false,
  src:KQ.length?KQ.every(srcOk):null,
  dec:Q.length?Q.every(decOk):null,
  rate:P.length?P.every(rated):null,
  clim:P.length?climOk(r):null,
  outs:K.length?!uncov(r).length:null,
  acts:(acts(r).length||atLeast(r,"rated"))?(acts(r).length>0&&!unowned(r).length):null,
  review:(isD(r.revBy)||atLeast(r,"engaged"))?kept(r):null
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
 var R=DB.records, c={n:R.length,pt:0,key:0,kq:0,kqOk:0,keyOut:0,rev:0,gen:0,scope:{},ty:{},qd:{},to:{}};
 SCOPES.forEach(function(k){ c.scope[k]=0; }); PTYPES.forEach(function(k){ c.ty[k]=0; }); QUADS.concat([""]).forEach(function(k){ c.qd[k]=0; }); TOS.forEach(function(k){ c.to[k]=0; });
 R.forEach(function(r){ var K=keys(r), KQ=keyReqs(r); c.key+=K.length; c.kq+=KQ.length; c.kqOk+=KQ.filter(function(q){ return srcOk(q)&&decOk(q); }).length; c.keyOut+=K.filter(function(p){ return covered(r,p); }).length; if(revGood(r,lastRev(r))) c.rev++;
  c.scope[r.scope]++; pts(r).forEach(function(p){ c.pt++; c.ty[p.ty]++; c.qd[quad(p)]++; if(genP(p)) c.gen++; });
  r.outs.forEach(function(o){ var p=ptById(r,o.p); if(p&&isKey(p)&&outOk(r,o)) c.to[o.to]++; }); });
 c.outs=TOS.reduce(function(a,k){ return a+c.to[k]; },0);
 return c;
}
function pct(a,n){ return n?Math.round(a/n*100)+"%":"—"; }
function renderDash(){
 var box=document.getElementById("dKpis"); if(!box) return;
 var c=counts(), au=auditSummary(), as=assessScore(), n=c.n, oi=openItems();
 box.innerHTML=TBX.kpi(n,t("kTotal"))+TBX.kpi(c.pt,t("kPt"))+TBX.kpi(c.key,t("kKey"))+TBX.kpi(c.kq?c.kqOk+"/"+c.kq:"—",t("kSrc"))+TBX.kpi(c.key?c.keyOut+"/"+c.key:"—",t("kOut"))+TBX.kpi(pct(c.rev,n),t("kRev"))+TBX.kpi(c.gen,t("kGen"))+TBX.kpi(oi.length,t("kOpen"))+TBX.kpi(au.rate===null?"—":au.rate+"%",t("kAud"))+TBX.kpi(as+"%",t("kAs"));
 var nd='<p class="pd-sub" style="color:var(--ink-soft)">'+esc(t("noData"))+'</p>';
 document.getElementById("dStage").innerHTML=n?TBX.dist(STAGES,n,function(s){ return DB.records.filter(function(r){ return stageOf(r)===s; }).length; },stageName,function(s){ return SCOL[s]; }):nd;
 document.getElementById("dScope").innerHTML=n?TBX.dist(SCOPES,n,function(k){ return c.scope[k]; },function(k){ return t("sc_"+k); },function(){ return "#1B2A4A"; }):nd;
 document.getElementById("dType").innerHTML=c.pt?TBX.dist(PTYPES,c.pt,function(k){ return c.ty[k]; },function(k){ return t("ty_"+k); },function(k){ return TCOL[k]; }):nd;
 document.getElementById("dQuad").innerHTML=c.pt?TBX.dist(QUADS,c.pt,function(k){ return c.qd[k]; },function(k){ return t("qd_"+k); },function(k){ return QCOL[k]; }):nd;
 document.getElementById("dTo").innerHTML=c.outs?TBX.dist(TOS,c.outs,function(k){ return c.to[k]; },function(k){ return t("to_"+k); },function(){ return "#C9821A"; }):nd;
 document.getElementById("dAssess").innerHTML=AGROUPS.map(function(g){ var p=assessScore(g); return TBX.bar(t("g_"+g),p+"%",p,GCOL2[g]); }).join("")+'<p class="pd-sub" style="font-size:12.5px;color:var(--muted);margin:10px 0 0">'+esc(t("bandNote"))+'</p>';
 var dc=document.getElementById("dChart"); if(dc) dc.innerHTML=srcSVG(DB.records,{lang:L,W:chartW()});
 var ds=document.getElementById("dShare"); if(ds) ds.textContent=shareLine(DB.records);
 document.getElementById("dOpen").innerHTML=oi.length?oi.map(function(x){ return '<li><b>'+esc(x.r.ref||x.r.id)+'</b>'+chip([x.r.id,"info"])+'<span>'+esc(x.s)+'</span></li>'; }).join(""):'<li>'+esc(n?t("noOpen"):t("noData"))+'</li>';
}

/* ---------- report and CSV ---------- */
function buildCSV(){
 var head=["id","ref","title","scope","decision","date","facilitator","owner","nextReview","reviewTriggers","source","sourceId","stage","team","parties","requirements","climate","outcomes","actions","reviews","lastReview"];
 return TBX.csv(head,DB.records.map(function(r){
  var CD=codes(r), lr=lastRev(r);
  var tm=r.team.map(function(m){ return m.n+" ("+m.role+(m.ext!=="no"?", "+m.ext:"")+")"; }).join(" | ");
  var pt=r.pts.map(function(p){ return CD[p.id]+" "+p.n+" ["+p.ty+", "+p.io+"] power "+(p.pw||"-")+(p.pwr?" ("+p.pwr+")":"")+", interest "+(p.in||"-")+(p.inr?" ("+p.inr+")":"")+" → "+(quad(p)||"-")+(isKey(p)?" key":"")+(p.own?" — owner: "+p.own:"")+(p.ch?" — channel: "+p.ch:"")+(p.fq?" "+p.fq:"")+(p.sid?" — "+p.sid:""); }).join(" | ");
  var rq=r.reqs.map(function(q){ return CD[q.id]+" ("+(CD[q.p]||"-")+") "+q.t+(q.so?" ("+q.so+(q.d?" "+q.d:"")+")":"")+" — climate "+(q.cl||"-")+" — addressed "+(q.ad||"-")+(q.why?" — why: "+q.why:""); }).join(" | ");
  var ou=r.outs.map(function(o){ return CD[o.id]+" ("+(CD[o.p]||"-")+") → "+o.to+(o.q?" ["+o.q+"]":"")+(o.fac?" ["+o.fac+"]":"")+(o.ref?" "+o.ref:"")+(o.what?" — "+o.what:"")+(o.why?" — why: "+o.why:"")+(o.who?" — "+o.who:""); }).join(" | ");
  var ac=r.acts.map(function(a){ return CD[a.id]+" ("+(CD[a.p]||"-")+") "+a.what+" — "+a.who+" by "+a.by+" — "+a.st+(a.done?" "+a.done:"")+(a.ev?" — "+a.ev:""); }).join(" | ");
  var rv=r.revs.map(function(v){ return CD[v.id]+" "+v.date+" ["+v.trig+"] — "+v.chg+(v.add?" — added: "+v.add:"")+(v.rem?" — removed: "+v.rem:""); }).join(" | ");
  return [r.id,r.ref,r.title,r.scope,r.decision,r.date,r.facil,r.owner,r.revBy,r.trig,r.src,r.srcId,stageOf(r),tm,pt,rq,(r.clim.dec||"-")+(r.clim.why?" — "+r.clim.why:""),ou,ac,rv,lr?lr.date:""]; }));
}
function recReport(r){
 var CD=codes(r), A=auditRecord(r);
 var row=function(k,v){ return '<tr><th>'+esc(k)+'</th><td>'+esc(v===null||v===undefined||v===""?"—":v)+'</td></tr>'; };
 var mark=function(v){ return v===null?'<td class="na">—</td>':(v?'<td class="ok">✓</td>':'<td class="bad">✗</td>'); };
 var tbl=function(list,heads,cells){ return list.length?'<table><thead><tr>'+heads.map(function(h){ return '<th>'+esc(t(h))+'</th>'; }).join("")+'</tr></thead><tbody>'+list.map(function(x){ return '<tr>'+cells(x).map(function(c){ return '<td>'+esc(c===""||c===null?"—":c)+'</td>'; }).join("")+'</tr>'; }).join("")+'</tbody></table>':'<p class="meta">—</p>'; };
 return '<section class="an"><h3><span dir="ltr">'+esc(r.id)+'</span> · <span dir="ltr">'+esc(r.ref||"—")+'</span> — '+esc(r.title)+'</h3>'+
  '<p class="meta">'+esc(t("colStage"))+': <b>'+esc(stageName(stageOf(r)))+'</b> · '+esc(t("sc_"+r.scope))+' · '+esc(t("src_"+r.src))+(r.srcId?' <span dir="ltr">'+esc(r.srcId)+'</span>':'')+'</p>'+
  mapHTML(r)+
  '<table><tbody>'+row(t("f_decision"),r.decision)+row(t("f_date"),r.date)+row(t("f_facil"),r.facil)+row(t("f_owner"),r.owner)+row(t("f_revBy"),r.revBy)+row(t("f_trig"),r.trig)+'</tbody></table>'+
  '<h4>'+esc(t("rpTeam"))+'</h4>'+tbl(r.team,["tmN","tmRole","tmExt"],function(m){ return [m.n,m.role,t("ex_"+m.ext)]; })+
  '<h4>'+esc(t("rpGrid"))+'</h4>'+gridHTML(r)+
  '<h4>'+esc(t("rpPt"))+'</h4>'+tbl(r.pts,["pt_n","pt_ty","pt_pw","pt_in","pt_own","pt_ch","pt_fq"],function(p){ var q=quad(p); return [CD[p.id]+" · "+p.n+(isKey(p)?" ★":"")+(genP(p)?" ⚠":"")+(q?" — "+t("qd_"+q):""),t("ty_"+p.ty)+" · "+t("io_"+p.io),(p.pw||"")+(p.pwr?" — "+p.pwr:""),(p.in||"")+(p.inr?" — "+p.inr:""),p.own,p.ch,p.fq]; })+
  '<h4>'+esc(t("rpRm"))+'</h4>'+rmHTML(r)+
  '<h4>'+esc(t("rpRq"))+'</h4>'+tbl(r.reqs,["rq_p","rq_t","rq_so","rq_cl","rq_ad","rq_why"],function(q){ return [(CD[q.id]||"")+" · "+(CD[q.p]||"—"),q.t,(q.so||t("rqSrcF"))+(q.d?" · "+q.d:""),q.cl?t("yn_"+q.cl):"",q.ad?t("ad_"+q.ad):t("ad_"),q.why]; })+
  '<h4>'+esc(t("rpClim"))+'</h4><p>'+esc(r.clim.dec?t("cl_"+r.clim.dec):t("cl_"))+(r.clim.why?' — '+esc(r.clim.why):'')+'</p>'+
  '<h4>'+esc(t("rpOut"))+'</h4>'+tbl(r.outs,["ou_p","ou_to","ou_q","ou_ref","ou_what","ou_why","ou_who"],function(o){ return [(CD[o.id]||"")+" · "+(CD[o.p]||"—"),t("to_"+o.to),o.q?t("oq_"+o.q):(o.fac?t("fac_"+o.fac):""),o.ref,o.what,o.why,o.who]; })+
  '<h4>'+esc(t("rpActs"))+'</h4>'+tbl(r.acts,["ac_p","ac_what","ac_who","ac_by","ac_st","ac_done","ac_ev"],function(a){ return [(CD[a.id]||"")+" · "+(CD[a.p]||"—"),a.what,a.who,a.by,t("as_"+a.st),a.done,a.ev]; })+
  '<h4>'+esc(t("rpRev"))+'</h4>'+tbl(r.revs,["rvDate","rvTrig","rvChg","rvAdd","rvRem"],function(v){ return [v.date,t("rt_"+v.trig),v.chg,v.add,v.rem]; })+
  '<h4>'+esc(t("rpAu"))+'</h4><table><thead><tr>'+CHECKS.map(function(k){ return '<th>'+esc(t("k_"+k))+'</th>'; }).join("")+'</tr></thead><tbody><tr>'+CHECKS.map(function(k){ return mark(A[k]); }).join("")+'</tr></tbody></table></section>';
}
var MAP_CSS=".dm-map{list-style:none;margin:8px 0 12px;padding:0;display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:6px}.dm-map li{display:flex;gap:6px;align-items:center;border:1px solid #DCE4EE;border-radius:10px;padding:6px 7px;background:#fff;min-width:0}.dm-map li i{font-style:normal;flex:none;display:inline-grid;place-items:center;width:24px;height:24px;border-radius:50%;background:#EEF1F6;color:#4B5874;font-family:Georgia,serif;font-weight:700;font-size:12px}.dm-map li span{display:flex;flex-direction:column;min-width:0}.dm-map li b{font-size:12px}.dm-map li small{font-size:10.5px;color:#4B5874}.dm-map li.done i,.dm-map li.cur i{background:var(--pc);color:#fff}.dm-map li.done{border-color:var(--pc)}.dm-map li.cur{border:2px solid var(--pc)}.dm-map li.todo{opacity:.72}@media (max-width:760px){.dm-map{grid-template-columns:1fr}}";
var VIEW_CSS=".sk-gridw{display:grid;grid-template-columns:22px minmax(0,1fr);grid-template-rows:auto auto;gap:4px;margin:6px 0}.sk-ax-y{grid-row:1;writing-mode:vertical-rl;transform:rotate(180deg);font-size:11.5px;color:#4B5874;font-weight:700;text-align:center}.sk-ax-x{grid-column:2;font-size:11.5px;color:#4B5874;font-weight:700;text-align:center}.sk-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px;min-width:0}.sk-q{border:1px solid #DCE4EE;border-top:4px solid var(--qc);border-radius:10px;padding:6px 8px;min-width:0;background:#fff}.sk-q h5{margin:0 0 4px;display:flex;flex-direction:column;gap:1px;font-size:12.5px;color:var(--qc)}.sk-q h5 small{color:#4B5874;font-weight:400;font-size:11px}.sk-q ul{margin:0;padding:0;list-style:none;display:grid;gap:3px}.sk-q li{display:flex;gap:5px;align-items:baseline;font-size:12px;overflow-wrap:anywhere;min-width:0;border-inline-start:3px solid var(--tc);padding-inline-start:4px}.sk-q li span{flex:1;min-width:0}.sk-q code{font-family:Georgia,serif;font-weight:700;color:var(--tc)}.sk-q em{font-style:normal;color:#4B5874;font-size:11px;white-space:nowrap}.sk-none{margin:2px 0;color:#7A869E;font-size:12.5px}.sk-rm{border-collapse:collapse;width:100%;font-size:12.5px}.sk-rm th,.sk-rm td{border:1px solid #DCE4EE;padding:4px 6px;text-align:center}.sk-rm th[scope=row]{text-align:start;font-weight:600}.sk-rm tr.key th[scope=row]{color:#1B2A4A}.sk-rm td.y{background:#E5F4EA}.sk-rm td.p{background:#FBEBCB}.sk-rm td.n{background:#F6D5D2}.sk-rm td.u{background:#EEF1F6}.sk-rm td.z{color:#9AA5B8}.sk-rm code{font-family:Georgia,serif;font-weight:700}";
function buildReportHTML(){
 var c=counts(), au=auditSummary(), as=assessScore(), d=today(), n=c.n, A=TBX.audit(DB.records,auditRecord,CHECKS), oi=openItems();
 var mark=function(v){ return v===null?'<td class="na">—</td>':(v?'<td class="ok">✓</td>':'<td class="bad">✗</td>'); };
 var grpRows=AGROUPS.map(function(g){ return '<tr><td>'+esc(t("g_"+g))+' — '+g+'</td><td>'+assessScore(g)+'%</td></tr>'; }).join("");
 var auRows=A.rows.map(function(x){ return '<tr><td dir="ltr">'+esc(x.r.id)+'</td>'+CHECKS.map(function(k){ return mark(x.res[k]); }).join("")+'</tr>'; }).join("");
 var body='<div class="cover"><p class="kick">Continual Improvement Academy · CIA Toolbox</p><h1>Stakeholder Analysis / تحليل الأطراف المعنية</h1><p class="sub">'+esc(t("rpCover"))+'</p>'+
  '<p class="meta">'+esc(t("prep"))+': <bdi><strong>مدثر سلامه</strong></bdi> · <bdi dir="ltr">'+esc(d)+'</bdi> · <bdi>'+esc(t("kTotal"))+': '+n+'</bdi></p></div>'+
  '<h2>Summary / الملخص</h2><div class="k">'+
   '<div><b>'+n+'</b>'+esc(t("kTotal"))+'</div><div><b>'+c.pt+'</b>'+esc(t("kPt"))+'</div><div><b>'+c.key+'</b>'+esc(t("kKey"))+'</div><div><b>'+(c.kq?c.kqOk+"/"+c.kq:"—")+'</b>'+esc(t("kSrc"))+'</div><div><b>'+(c.key?c.keyOut+"/"+c.key:"—")+'</b>'+esc(t("kOut"))+'</div><div><b>'+pct(c.rev,n)+'</b>'+esc(t("kRev"))+'</div><div><b>'+c.gen+'</b>'+esc(t("kGen"))+'</div><div><b>'+oi.length+'</b>'+esc(t("kOpen"))+'</div><div><b>'+(au.rate===null?"—":au.rate+"%")+'</b>'+esc(t("kAud"))+'</div><div><b>'+as+'%</b>'+esc(t("kAs"))+'</div></div>'+
  '<div class="chart"><p class="meta">'+esc(t("chT"))+(shareLine(DB.records)?' · '+esc(shareLine(DB.records)):'')+'</p>'+srcSVG(DB.records,{lang:L,W:560})+'</div>'+
  '<h2>'+esc(t("rpReg"))+' / The registers</h2>'+(n?DB.records.map(recReport).join(""):'<p class="meta">'+esc(t("rpEmpty"))+'</p>')+
  '<h2>Audit results / نتائج التدقيق</h2>'+(n?'<p>'+esc(t("auPass"))+': '+(au.rate===null?"—":au.rate+"% ("+au.pass+"/"+au.applic+")")+'</p><table><thead><tr><th>ID</th>'+CHECKS.map(function(k){ return '<th>'+esc(t("k_"+k))+'</th>'; }).join("")+'</tr></thead><tbody>'+auRows+'</tbody></table>':'<p class="meta">—</p>')+
  '<h2>Open items / بنود تحتاج متابعة</h2>'+(oi.length?'<ul>'+oi.map(function(x){ return '<li><span dir="ltr">'+esc(x.r.id)+' · '+esc(x.r.ref||"—")+'</span> — '+esc(x.s)+'</li>'; }).join("")+'</ul>':'<p class="meta">'+esc(n?t("noOpen"):"—")+'</p>')+
  '<h2>Self-assessment / التقييم الذاتي</h2><table><thead><tr><th>Area / المحور</th><th>Score / النتيجة</th></tr></thead><tbody>'+grpRows+'<tr><td><b>'+esc(t("kAs"))+'</b></td><td><b>'+as+'%</b></td></tr></tbody></table><p class="meta">'+esc(t("bandNote"))+'</p>'+
  '<footer>Prepared by / أعدّه: مدثر سلامه · Stakeholder analysis is a technique, not a requirement of any standard: it is useful only when it leads to decisions about the parties that matter; parties are named specifically; their needs are written as requirements with a source and a date; every requirement gets the 4.2 c) decision, with the reason when it is not addressed; power and interest are rated with a reason and set the engagement approach; each party has an owner and a channel; climate-related requirements are asked about; every key party goes into SWOT, PESTLE, the risk register or the 6.1 plan, or is set aside with a reason; the register is dated, reviewed and its changes go to management review. A key party has power or interest of 4 or more (this tool\'s design). Sources / المراجع: ISO 9001:2026 clauses 4.2, 4.3, 5.1.2, 6.1.1, 9.1.2 and 9.3.2 and Annex A.4.2; ISO 9000:2026 3.1.4 and 4.4.2; ISO 10009:2024 5.1, 5.5 and 6.5 (interpretive summaries, not the official text); the power/interest grid, stakeholder-mapping textbooks, AA1000 and ISO 26000 not verified (not uploaded) · Examples are illustrative.</footer>';
 return TBX.reportDoc(L,'Stakeholder Analysis Report — مدثر سلامه',body,MAP_CSS+VIEW_CSS+'.ok{color:#2F7D4B;font-weight:700;text-align:center}.bad{color:#B42318;font-weight:700}td.bad{text-align:center}.na{color:#7A869E;text-align:center}ul{padding-inline-start:20px}h3{font-family:Georgia,serif;margin:22px 0 4px;font-size:17px}h4{margin:14px 0 4px;font-size:14.5px}.an{border-top:1px solid #DCE4EE;padding-top:6px;break-inside:auto}.an th{background:#F3F7FB;color:#1B2A4A}.an tbody th{width:30%}.an .sk-rm th{width:auto}.chart{margin:8px 0}.chart svg{max-width:100%;height:auto}.cover{border-bottom:4px solid #B8901E;padding:18px 0 14px;margin-bottom:8px}.cover h1{border:0;margin:6px 0}.cover .kick{color:#B8901E;font-weight:700;letter-spacing:.04em;margin:0}.cover .sub{font-size:18px;margin:4px 0}@media print{.an{page-break-before:always}}');
}
function stamp(){ return today(); }
function renderReport(){
 var prev=document.getElementById("rpPrev"); if(!prev) return;
 if(!DB.records.length){ prev.innerHTML='<p class="pd-sub" style="color:var(--ink-soft)">'+esc(t("rpEmpty"))+'</p>'; return; }
 var c=counts(), au=auditSummary();
 prev.innerHTML='<div class="pd-kpis">'+TBX.kpi(c.n,t("kTotal"))+TBX.kpi(c.key,t("kKey"))+TBX.kpi(c.kq?c.kqOk+"/"+c.kq:"—",t("kSrc"))+TBX.kpi(c.key?c.keyOut+"/"+c.key:"—",t("kOut"))+TBX.kpi(openItems().length,t("kOpen"))+TBX.kpi(au.rate===null?"—":au.rate+"%",t("kAud"))+'</div>';
}
document.getElementById("rpHtml").addEventListener("click",function(){
 var err=document.getElementById("rpErr"); err.textContent="";
 if(!DB.records.length && !Object.keys(DB.assess).length){ err.textContent=t("rpEmpty"); return; }
 TBX.download("Stakeholders-report-"+stamp()+".html","text/html;charset=utf-8",buildReportHTML());
});
document.getElementById("rpCsv").addEventListener("click",function(){ var err=document.getElementById("rpErr"); err.textContent=""; if(!DB.records.length){ err.textContent=t("rpEmpty"); return; } TBX.download("Stakeholders-registers-"+stamp()+".csv","text/csv;charset=utf-8",buildCSV()); });
document.getElementById("dCsv").addEventListener("click",function(){ if(!DB.records.length) return; TBX.download("Stakeholders-registers-"+stamp()+".csv","text/csv;charset=utf-8",buildCSV()); });

/* ---------- platform identity: academy logo and related tools ---------- */
var LOGO="__LOGO__";
function applyLogo(){ document.querySelectorAll("img[data-logo]").forEach(function(i){ if(i.src!==LOGO) i.src=LOGO; i.alt=t("logoAlt"); }); }
var RELATED=[["str","Strategy","./strategy-performance.html","#3563C9"],["swot","SWOT","./swot.html","#3C9A5F"],["pestle","PESTLE","./pestle.html","#3563C9"],["iso10009","ISO 10009","./iso10009.html#explain-cl","#7B5BB8","explain-cl"],["lessons","Lessons","./lessons.html","#B8901E"],["iso31000","ISO 31000","./iso31000-risk-studio.html","#1B2A4A"],["audit","Smart Audit","./smart-audit-improvement.html","#C2410C"],["iso9001","ISO 9001","./iso9001.html","#1B2A4A"],["pdca","PDCA","./pdca.html","#3C9A5F"],["capa","CAPA","./capa.html","#B42318"]];
function buildRelated(){
 var box=document.getElementById("homeStd"); if(!box) return;
 box.innerHTML='<p class="hs-t">'+esc(t("related"))+'</p>'+RELATED.map(function(r){ return '<a class="hs on" href="'+r[2]+'" target="_blank" rel="noopener" data-rel="'+r[0]+'" style="--c:'+r[3]+';--t:'+r[3]+'14"><b dir="ltr">'+r[1]+'</b><span>'+esc(t("rel_"+r[0]))+'</span><em>↗</em></a>'; }).join("");
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

/* ---------- assistant: answers from the tool's own guide and your registers (rule-based, no AI service) ---------- */
var CONTACT_EMAIL="moddathersalama.eng@gmail.com";
var CB={
 ar:{fab:"اسأل عن الأطراف المعنية",title:"مساعد الأطراف المعنية",sub:"إجابات فورية من دليل الأداة وسجلاتك",new:"محادثة جديدة",close:"إغلاق",ph:"اكتب سؤالك…",send:"إرسال",inL:"سؤالك",
  hello:"مرحباً. أجيب عن أسئلة تحليل الأطراف المعنية من دليل الأداة ومن سجلاتك المحفوظة في هذا المتصفح. اختر سؤالاً أو اكتب سؤالك.",
  miss:"لم أجد إجابة جاهزة لهذا السؤال. جرّب أحد الأسئلة المقترحة، أو اسأل عن: ما الذي يجعل التحليل مفيداً، أو الفرق بينه وبين PESTLE وSWOT، أو قرار 4.2 ج)، أو مصفوفة القوة والاهتمام، أو متطلبات المناخ، أو المراجعة. وللاستشارة راسل المُعِد على البريد أدناه.",
  instant:"إجابة فورية",foot:"المساعد يعمل في متصفحك ولا يرسل بياناتك. للتواصل:",
  op0:"لا توجد بنود مفتوحة في سجلاتك الآن.",st0:"لا توجد سجلات بعد. ابدأ من [[tab:tools]] أو حمّل المثال من [[tab:docs]]."},
 en:{fab:"Ask about stakeholders",title:"Stakeholder assistant",sub:"Instant answers from the tool's guide and your registers",new:"New chat",close:"Close",ph:"Type your question…",send:"Send",inL:"Your question",
  hello:"Hello. I answer questions on stakeholder analysis from the tool's guide and from your registers saved in this browser. Pick a question or type your own.",
  miss:"I have no ready answer for that. Try one of the suggested questions, or ask what makes the analysis useful, how it differs from PESTLE and SWOT, the 4.2 c) decision, the power/interest grid, climate-related requirements, or the review. For advice, email the author at the address below.",
  instant:"Instant answer",foot:"The assistant runs in your browser and sends no data. Contact:",
  op0:"No open items in your registers right now.",st0:"No registers yet. Start from the [[tab:tools]] or load the example in [[tab:docs]]."}
};
var KB=[
 {id:"useful",k:["مفيد","مفيدا","مفيداً","يفيد","useful","worth","فائدة","value","good analysis"],q:{ar:"ما الذي يجعل تحليل الأطراف المعنية مفيداً؟",en:"What makes a stakeholder analysis useful?"},
  a:{ar:"**أن يقود إلى قرارات عن الأطراف التي تهم.** قائمة «العملاء، الموظفون، الحكومة، المجتمع» لا تغيّر شيئاً. لذلك تحسب الأداة المرحلة: **حُدد النطاق** (والقرار الذي يخدمه السجل)، ثم **اكتمل الفريق** (ثلاثة أدوار ورأي من الخارج)، ثم **أطراف مسماة** (بأسمائها لا عامة)، ثم **متطلبات بمصادر وقرارات** (لكل طرف متطلب، ولكل متطلب قرار 4.2 ج) وسببه، ومتطلبات الأطراف الرئيسية بمصدر وتاريخ)، ثم **قُيّمت** (قوة واهتمام بسبب، وسؤال المناخ)، ثم **تعامل ومخرجات** (مالك وقناة ومخرج لكل طرف رئيسي)، ثم **روجع**. في المثال: «طريقة العمل في الحر» متطلب من العميل الحكومي بمصدره (بند في العقد)، قُرر أن النظام يعالجه، ودخل دراسة SW-EX-01 تهديداً.",
   en:"**It leads to decisions about the parties that matter.** A list of \"customers, employees, government, community\" changes nothing. So the tool computes the stage: **scoped** (with the decision the register serves), **team complete** (three roles and outside input), **parties named** (specifically, none generic), **requirements sourced and decided** (a requirement for each party, the 4.2 c) decision on each with its reason, key-party requirements with a source and a date), **rated** (power and interest with reasons, and the climate question), **engagement and outcomes** (an owner, a channel and an outcome for every key party), then **reviewed**. In the example, the \"hot-weather method statement\" is a requirement of the public client with its source (a contract clause), decided as addressed by the system, and carried into SW-EX-01 as a threat."}},
 {id:"which",k:["pestle","swot","الفرق","difference","which","versus","vs","أيها","ايها","أيهما","ايهما"],q:{ar:"الأطراف المعنية أم PESTLE أم SWOT: أيها أستخدم؟",en:"Stakeholders, PESTLE or SWOT — which one?"},
  a:{ar:"ليست بدائل؛ تعمل معاً. **سجل الأطراف المعنية** يجيب عن البند 4.2: من يهمّ، وما متطلباته، وأيها يعالجه النظام. و**PESTLE** يمسح البيئة العامة (الأنظمة والاقتصاد والمجتمع والتقنية والقانون والبيئة) للبند 4.1، وقد يسمّي «من يتأثر». و**SWOT** يضع الفرص والتهديدات الخارجية أمام القوة والضعف الداخليين ويحوّلها إلى خيارات. والأطراف مصدر للفرص والتهديدات: عميل يطلب شيئاً جديداً فرصة، وجهة تنظيمية تشدد اشتراطاً تهديد. لذلك يذهب كل طرف رئيسي هنا إلى SWOT أو PESTLE أو سجل المخاطر. وتذكر ISO 10009:2024 في الجدول 5.1 أن المراجعة الخارجية في SWOT تشمل الأطراف المعنية كالمنافسين والعملاء.",
   en:"They are not alternatives; they work together. **The stakeholder register** answers clause 4.2: who matters, what they require, and which of it the system addresses. **PESTLE** scans the general environment (policy, the economy, society, technology, law and the environment) for clause 4.1, and may name \"who is affected\". **SWOT** sets the external opportunities and threats against the internal strengths and weaknesses and turns them into options. Parties are sources of opportunities and threats: a client asking for something new is an opportunity, a regulator tightening a condition is a threat. So every key party here goes into SWOT, PESTLE or the risk register. ISO 10009:2024 Table 5.1 says the external review in SWOT includes interested parties such as competitors and customers."}},
 {id:"req",k:["متطلب","مطلوب","iso 9001","4.2","requirement","required","shall","مواصفة","4.2 c","ج)"],q:{ar:"ما الذي يطلبه البند 4.2 بالضبط؟",en:"What exactly does clause 4.2 ask for?"},
  a:{ar:"تطلب ISO 9001:2026 في **4.2** تحديد: **أ)** الأطراف المعنية ذات الصلة بنظام إدارة الجودة، **ب)** متطلباتها ذات الصلة، **ج)** أي هذه المتطلبات سيعالجها النظام؛ ثم **متابعة المعلومات عنها ومراجعتها**. وتذكر **الملاحظة** أن لهذه الأطراف متطلبات قد تتصل بتغير المناخ. ثم تُستخدم هذه المتطلبات في تحديد **النطاق** (4.3 ب))، وتُراعى في **المخاطر والفرص** (6.1.1)، وتُعرض **تغيراتها في مراجعة الإدارة** (9.3.2 ج)). ويوضح الملحق A.4.2 أن الأطراف ومتطلباتها تتغير مع الوقت، وأن توقعات المناخ قد تؤثر في الامتثال التنظيمي ومتطلبات العملاء والتزامات المنشأة. التحليل نفسه أسلوب، لا متطلب.",
   en:"ISO 9001:2026 asks in **4.2** to determine **a)** the interested parties relevant to the quality management system, **b)** their relevant requirements and **c)** which of these requirements will be addressed through the system, and to **monitor and review information about them**. Its **NOTE** says these parties can have requirements related to climate change. These requirements are then used to set the **scope** (4.3 b)), considered for **risks and opportunities** (6.1.1), and their **changes go to management review** (9.3.2 c)). Annex A.4.2 explains that parties and their requirements change over time, and that climate expectations can influence regulatory compliance, customer requirements and organizational commitments. The analysis itself is a technique, not a requirement."}},
 {id:"grid",k:["قوة","اهتمام","مصفوفة","power","interest","grid","quadrant","تعامل","engagement","رئيسي","key party"],q:{ar:"كيف أستخدم مصفوفة القوة والاهتمام؟",en:"How do I use the power/interest grid?"},
  a:{ar:"قيّم لكل طرف **القوة أو التأثير** (قدرته على تغيير قراراتك أو إيقاف عملك) و**الاهتمام** (مدى تأثره بما تفعل) من 1 إلى 5، واكتب **سبباً قصيراً** لكل درجة. ثم تضع الأداة الطرف في مربع: **إدارة عن قرب** (قوة واهتمام 4 أو أكثر)، أو **إبقاء راضياً** (قوة عالية فقط)، أو **إبقاء مطلعاً** (اهتمام عالٍ فقط)، أو **متابعة**. والطرف **الرئيسي** قوته أو اهتمامه 4 أو أكثر، وله مالك علاقة وقناة وتكرار ومخرج. هذه القاعدة تصميم الأداة، لا نص مواصفة. في المثال: الدفاع المدني قوة 5 واهتمام 3 «إبقاء راضياً»، وجمعية سكان الحي قوة 3 واهتمام 5 «إبقاء مطلعاً».",
   en:"Rate each party's **power or influence** (its ability to change your decisions or stop your work) and **interest** (how much what you do affects it) from 1 to 5, with **a short reason** for each score. The tool then places the party: **manage closely** (power and interest 4 or more), **keep satisfied** (high power only), **keep informed** (high interest only) or **monitor**. A **key** party has power or interest of 4 or more and gets a relationship owner, a channel, a frequency and an outcome. This rule is the tool's design, not the text of a standard. In the example, civil defence has power 5 and interest 3 (keep satisfied), and the residents' association power 3 and interest 5 (keep informed)."}},
 {id:"climate",k:["مناخ","المناخ","climate","حرارة","heat","انبعاثات","emissions"],q:{ar:"كيف أسأل عن متطلبات المناخ؟",en:"How do I ask about climate-related requirements?"},
  a:{ar:"اسأل كل طرف رئيسي صراحة: هل لديكم **متطلب يتصل بتغير المناخ**؟ مثلاً: عميل يطلب طريقة عمل في الحر أو تقرير انبعاثات، أو جهة تنظيمية تشترط عزلاً حرارياً، أو بنك يربط التمويل بمعايير بيئية. ثم علّم المتطلب «يتصل بالمناخ» واكتب في سؤال المناخ **ما الذي سُئل ومن سُئل والنتيجة**، ولو كانت «لا متطلبات ذات صلة». تذكر ملاحظة 4.2 في ISO 9001:2026 أن للأطراف متطلبات قد تتصل بتغير المناخ، ويذكر الملحق A.4.2 أثرها في الامتثال التنظيمي ومتطلبات العملاء.",
   en:"Ask each key party explicitly: do you have **a requirement related to climate change**? For example, a client asking for a hot-weather method statement or an emissions report, a regulator requiring thermal insulation, or a bank tying finance to environmental criteria. Then mark the requirement \"climate-related\" and write in the climate question **what was asked, of whom, and the result**, even when it is \"no relevant requirement\". The NOTE to 4.2 in ISO 9001:2026 says parties can have climate-related requirements, and Annex A.4.2 names their effect on regulatory compliance and customer requirements."}},
 {id:"review",k:["مراجعة","متى","review","update","تحديث","تغير","change","دوري","periodic","9.3.2"],q:{ar:"متى أراجع السجل؟",en:"When do I review the register?"},
  a:{ar:"**في موعد محدد، وبعد أي تغير كبير**: عقد جديد، أو نظام جديد، أو شكوى كبيرة، أو مورد رئيسي جديد. تطلب ISO 9001:2026 متابعة المعلومات عن الأطراف ومتطلباتها ومراجعتها (4.2)، وعرض تغيرات احتياجاتها وتوقعاتها في مراجعة الإدارة (9.3.2 ج)). لذلك يحمل السجل **موعد المراجعة القادمة** و**التغيرات التي تستدعي مراجعة قبله**، وفي المراجعة اكتب ما الذي تغير والأطراف المضافة والمحذوفة. في المثال روجع سجل الشركة في 9 أكتوبر 2026 بعد ترسية عقد جديد.",
   en:"**On a set date, and after any major change**: a new contract, a new regulation, a major complaint or a new key supplier. ISO 9001:2026 asks to monitor and review information about the parties and their requirements (4.2) and to bring changes in their needs and expectations to management review (9.3.2 c)). So the register carries **the next review date** and **the changes that call for a review before it**; at the review, write what changed and the parties added or removed. In the example, the company register was reviewed on 9 October 2026 after a new contract award."}},
 {id:"open",dyn:"open",k:["مفتوح","مفتوحة","متابعة","open items","follow"],q:{ar:"ما البنود المفتوحة في سجلاتي؟",en:"What is still open in my registers?"}},
 {id:"status",dyn:"status",k:["وضع","حالة","ملخص","status","summary","where do we stand"],q:{ar:"ما وضع سجلات الأطراف المعنية الآن؟",en:"Where do my registers stand?"}}
];
var CB_SUG=["useful","which","grid","climate","status"];
function kbDyn(id){
 var u=CB[L]||CB.ar;
 if(id==="open"){ var O=openItems(); if(!O.length) return u.op0+"\n\n[[tab:dash]]"; return O.map(function(x){ return "- **"+(x.r.ref||x.r.id)+"** — "+x.s; }).join("\n")+"\n\n[[tab:docs]] · [[tab:dash]]"; }
 if(id==="status"){ var c=counts(); if(!c.n) return u.st0; return "- "+t("kTotal")+": **"+c.n+"**\n- "+t("kKey")+": **"+c.key+"**\n- "+t("kSrc")+": **"+(c.kq?c.kqOk+"/"+c.kq:"—")+"**\n- "+t("kOut")+": **"+(c.key?c.keyOut+"/"+c.key:"—")+"**\n- "+t("kRev")+": **"+pct(c.rev,c.n)+"**\n- "+t("kOpen")+": **"+openItems().length+"**\n- "+t("kAs")+": **"+assessScore()+"%**\n\n[[tab:dash]] · [[tab:audit]]"; }
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
window.addEventListener("storage",function(e){ if([STR_KEY,SW_KEY,PE_KEY,LL_KEY].indexOf(e.key)>=0){ renderHomeSt(); fillLists(); if(ST) stPreview(true); refreshForm(); } });
var rzT=null, rzW=chartW(); window.addEventListener("resize",function(){ clearTimeout(rzT); rzT=setTimeout(function(){ if(chartW()!==rzW){ rzW=chartW(); renderDash(); refreshForm(); } },150); });

/* ---------- boot ---------- */
/* a link from the hub may ask to open a register (?open=ID); a request may also start one from a SWOT item (?swot=ID with &item=IID), a PESTLE
   item (?pestle=ID with &item=IID), a Strategy Studio row (?strat=ID) or a lesson (?lessons=ID); inside the hub the same request arrives as a
   one-time hint */
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
 for(var i=0;i<STSRC.length;i++){ var s=STSRC[i]; if(q[s]&&prefillFrom(s,q[s],(s==="swot"||s==="pestle")?(q.item||""):"")) return; }
 go((location.hash||"#home").slice(1));
})();
