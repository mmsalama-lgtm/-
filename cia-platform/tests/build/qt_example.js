/* three illustrative storyboards for Al-Waha Contracting, the fictitious company of the PDCA, CAPA, 5 Whys, Fishbone, Pareto, RCA, A3 and
   DMAIC examples; the record ids (PA-EX-02, FB-EX-02, W5-EX-03, RC-EX-01, RC-EX-02, DM-EX-01, PA-EX-03) are those examples' ids */
function exQt(lang){
 var T=function(a,e){ return lang==="ar"?a:e; };
 var S=function(id,ph,tool,why,out,who,st,date,rid,other){ return {id:id,ph:ph,tool:tool,other:other||"",why:why,out:out,who:who,st:st,date:date,rid:rid||""}; };
 var PM=T("مدير المشروع","Project manager"), QC=T("فني الجودة","QC technician"), QM=T("مدير الجودة","Quality manager"), HSE=T("مدير السلامة","HSE manager");
 return [
 {id:"QT-EX-01",ref:"NCR-2026-044",title:T("خفض شحنات الخرسانة الجاهزة المرفوضة عند الاستلام","Cut the ready-mix concrete loads rejected at delivery"),ctx:"p",aim:"prob",
  owner:PM,fac:T("مدير الجودة (مدرب على FMEA وSix Sigma)","Quality manager (trained in FMEA and Six Sigma)"),area:T("المشروع PRJ-2026-112 · استلام الخرسانة","Project PRJ-2026-112 · concrete receiving"),
  start:"2026-06-01",data:"large",
  team:T("مدير المشروع — المالك\nفني الجودة — البيانات والفحص\nمهندس الموقع — العملية\nممثل المحطة — المورد","Project manager — owner\nQC technician — data and checks\nSite engineer — the process\nPlant representative — supplier"),
  problem:T("ارتفعت الشحنات المرفوضة عند بوابة الموقع إلى 6.0% في يوليو وأغسطس 2026 (20 من 335 شحنة)، وأغلبها لتجاوز الحرارة 32 °م.","Ready-mix loads rejected at the site gate rose to 6.0 % in July and August 2026 (20 of 335 loads), most of them above the 32 °C temperature limit."),
  is:T("شحنات المحطة 2، وصب ما بعد الظهر، من يونيو إلى أغسطس، والرفض للحرارة (14 من 35 شحنة مرفوضة في PA-EX-02).","Plant 2 loads, afternoon pours, June to August, rejections for temperature (14 of 35 rejected loads in PA-EX-02)."),
  isnot:T("ليست شحنات المحطة 1، ولا صب الصباح، ولا رفض الهبوط أو مقاومة المكعبات.","Not plant 1 loads, not morning pours, not slump or cube-strength failures."),
  steps:[
   S("e1a","P","isnot",T("لتعريف المشكلة قبل أي تحليل","To define the problem before any analysis"),T("جدول «ما هو / ما ليس» أعلاه؛ ضاق البحث إلى المحطة 2 والانتظار بعد الظهر","The is/is-not table above; the search narrowed to plant 2 and afternoon waiting"),QC,"done","2026-06-02"),
   S("e1b","P","pareto",T("لتحديد القلة الحيوية من أسباب الرفض","To find the vital few reasons for rejection"),T("الحرارة 14 من 35 شحنة مرفوضة (40%)، وهي القلة الحيوية","Temperature: 14 of 35 rejected loads (40 %), the vital few"),QC,"done","2026-06-03","PA-EX-02"),
   S("e1c","D","fish",T("لجمع الأسباب المحتملة حسب الفئات","To gather candidate causes by category"),T("الماء غير المبرد والانتظار عند البوابة أقوى المرشحين","Water not chilled and waiting at the gate are the main candidates"),T("الفريق","The team"),"done","2026-06-05","FB-EX-02"),
   S("e1d","D","why5",T("للحفر في مسار الانتظار ومسار عدم الاكتشاف","To dig into the waiting path and the non-detection path"),T("لا مكان لوقوف الشاحنات؛ وفحص المحطة لا يسجل الحرارة","No truck standing area; the plant check does not record temperature"),T("مهندس الموقع","Site engineer"),"done","2026-06-06","W5-EX-03"),
   S("e1e","D","rca",T("خطورة الرفض المتكرر تستدعي تحقيقاً كاملاً","Repeated rejections call for a full investigation"),T("أسباب مثبتة: الماء غير مبرد في المحطة 2، ولا مظلة لانتظار الشاحنات","Proved causes: water not chilled at plant 2, and no shade for waiting trucks"),PM,"done","2026-06-12","RC-EX-01"),
   S("e1f","D","sipoc",T("للاتفاق على بداية استلام الخرسانة ونهايته","To agree where concrete receiving starts and ends"),T("SIPOC من ست خطوات من المحطة إلى الصب","A six-step SIPOC from the plant to the pour"),T("الفريق","The team"),"done","2026-09-01"),
   S("e1g","C","grr",T("للثقة بموازين الحرارة قبل تثبيت الأساس","To trust the thermometers before the baseline is fixed"),T("ميزان يقرأ أقل بدرجتين استُبدل؛ 19 من 20 قراءة متطابقة مع المجس المعاير","One thermometer reading 2 °C low was replaced; 19 of 20 readings matched the calibrated probe"),QC,"done","2026-09-02","DM-EX-01"),
   S("e1h","C","sixsigma",T("بقي السبب غير واضح بعد A3 والعملية قابلة للقياس","The cause stayed unclear after the A3 and the process can be measured"),T("الماء المبرد 1.9% مقابل 7.9% رفضاً (z = 2.15)، وتجربة في المحطة 2","Chilled water 1.9 % against 7.9 % rejections (z = 2.15), and a pilot at plant 2"),PM,"done","2026-09-20","DM-EX-01"),
   S("e1i","A","cplan",T("لحفظ النتيجة","To hold the gain"),T("حرارة كل شحنة عند البوابة، وإيقاف الصب فوق 32 °م وإبلاغ المحطة","Temperature of every load at the gate; stop the pour above 32 °C and call the plant"),QC,"done","2026-10-05","DM-EX-01"),
   S("e1j","A","visual",T("فرق متعددة اللغات عند البوابة","Multilingual crews at the gate"),T("لوحة مصورة للمقبول والمرفوض في الهبوط والحرارة","A picture board of accepted and rejected slump and temperature"),QC,"done","2026-10-06"),
   S("e1k","A","riskreg",T("لإبقاء خطر تعطل المبرد تحت النظر","To keep the chiller failure risk in view"),T("أُضيف خطر «تعطل مبرد المحطة» بمالك وخطة طوارئ (محطة بديلة)","\"Plant chiller fails\" added with an owner and a contingency (a back-up plant)"),PM,"done","2026-10-07")
  ],
  result:T("الشحنات المرفوضة 2.4% بعد التغيير (21 سبتمبر إلى 10 أكتوبر) مقابل هدف أقل من 3%: تحقق.","Rejected loads 2.4 % after the change (21 September to 10 October) against a goal below 3 %: met."),
  std:T("إجراء الخرسانة في الطقس الحار CON-PR-07 الإصدار 3، وخطة الضبط، وسجل المخاطر؛ وتتابع الدورة PD-EX-03 الضبط.","Hot-weather concrete procedure CON-PR-07 rev. 3, the control plan and the risk register; cycle PD-EX-03 follows the control."),
  lessons:T("تقسيم باريتو حسب المحطة ووقت الصب كشف السبب أسرع من العصف الذهني الأول.","Splitting the Pareto by plant and time of pour found the cause faster than the first brainstorm."),
  review:"2026-10-12",created:"2026-06-01",updated:"2026-10-12"},
 {id:"QT-EX-02",ref:"NM-2026-031",title:T("منع سقوط الحمولات في رفع حزم الحديد بالرافعة البرجية","Prevent dropped loads when lifting rebar bundles with the tower cranes"),ctx:"c",aim:"prob",
  owner:T("مدير الإنشاءات","Construction manager"),fac:T("مدير السلامة (ميسّر FMEA)","HSE manager (FMEA facilitator)"),area:T("البرج ب · رفع الرافعة البرجية","Tower B · tower crane lifts"),start:"2026-07-20",data:"medium",
  team:T("مدير السلامة — الميسّر\nمشرف الرفع — العملية\nرئيس عمال الربط — الحبال والربط\nمشغل الرافعة — المعدة","HSE manager — facilitator\nLifting supervisor — the process\nRigger foreman — slings and ties\nCrane operator — the equipment"),
  problem:T("انزلقت حزمة حديد من الحبال في البرج ب (حادث وشيك NM-2026-031)، وسبقته حالتان مشابهتان في الربع الأخير.","A rebar bundle slipped from the sling at Tower B (near miss NM-2026-031), after two similar slips in the last quarter."),
  is:T("حزم قضبان 12 م، وحبال بفرعين، ورفع فوق 20 م، والوردية المسائية.","12 m bar bundles, two-leg slings, lifts above 20 m, the evening shift."),
  isnot:T("ليست ألواح الشبك، ولا الرفع بأربعة فروع، ولا الوردية الصباحية.","Not mesh panels, not four-leg lifts, not the morning shift."),
  steps:[
   S("e2a","P","isnot",T("لتحديد نطاق المشكلة","To set the scope of the problem"),T("ضاق النطاق إلى رفع حزم 12 م بحبال بفرعين","Narrowed to two-leg sling lifts of 12 m bundles"),HSE,"done","2026-07-21"),
   S("e2b","P","brain",T("لجمع كل طرق فشل الرفع من الطاقم","To gather every way a lift can fail from the crew"),T("27 فكرة من طاقم الرفع، جُمعت في ست مجموعات","27 ideas from the lifting crew, grouped in six sets"),HSE,"done","2026-07-22"),
   S("e2c","D","fmea",T("FMEA عملية لخطوات الرفع، والخطورة العالية أولاً","A process FMEA of the lift steps, high severity first"),T("«انزلاق الحزمة من الحبال» خطورته 9، فعولج أولاً بغض النظر عن رقم الأولوية","\"Bundle slips from the sling\" has severity 9, so it was acted on first whatever its priority number"),HSE,"done","2026-08-05"),
   S("e2d","D","rca",T("للتحقيق في الحادث الوشيك نفسه","To investigate the near miss itself"),T("الأسباب الجذرية: لا قاعدة لربط الحزم بعقدة خانقة، وقائمة فحص الربط لا تشمل ربط الحزمة","Root causes: no choke-hitch rule for bundles, and the rigging checklist does not cover bundle ties"),HSE,"done","2026-08-10","RC-EX-02"),
   S("e2e","C","dtree",T("قرار موحد لعامل الربط إذا لم تُربط الحزمة مرتين","A standard decision for the rigger when a bundle is not tied twice"),T("مسودة شجرة القرار في إجراء الرفع","Draft decision tree in the lifting procedure"),T("مشرف الرفع","Lifting supervisor"),"doing","2026-10-01"),
   S("e2f","A","poka",T("إزالة الانزلاق بالتصميم بدل الاعتماد على الانتباه (8.5.1 ز)","Design the slip out instead of relying on attention (8.5.1 g)"),T("تجربة قفل الخطاف ومشبك الحزمة في البرج ب","Trial of the hook latch and bundle clamp at Tower B"),T("مشرف الرفع","Lifting supervisor"),"doing","2026-10-14"),
   S("e2g","A","visual","",T("لوحة ربط مصورة عند منطقة التحميل","A rigging picture chart at the loading area"),HSE,"plan","")
  ],
  result:"",std:"",lessons:"",review:"",created:"2026-07-20",updated:"2026-10-14"},
 {id:"QT-EX-03",ref:"STR-2027",title:T("خطة 2027 وأهداف الجودة","The 2027 plan and quality objectives"),ctx:"s",aim:"high",
  owner:T("المدير العام","General manager"),fac:"",area:T("المنشأة كلها","Company-wide"),start:"2026-09-15",data:"medium",
  team:T("المدير العام\nمدير المشاريع\nمدير الجودة\nالمدير المالي\nمدير تطوير الأعمال","General manager\nProjects director\nQuality manager\nFinance manager\nBusiness development manager"),
  problem:T("تحديد اتجاه 2027 وأهداف الجودة من سياق المنشأة ونتائج 2026.","Set the 2027 direction and quality objectives from the context of the organization and the 2026 results."),is:"",isnot:"",
  steps:[
   S("e3a","P","swot",T("لمراجعة العوامل الداخلية والخارجية قبل الخطة","To review internal and external factors before the plan"),T("«تأخر اعتماد المخططات» أبرز نقاط الضعف، و«مشاريع البنية التحتية» أبرز الفرص","\"Slow drawing approvals\" is the main weakness and \"infrastructure projects\" the main opportunity"),T("فريق الإدارة","Management team"),"done","2026-09-20"),
   S("e3b","P","pestle",T("لالتقاط القضايا الخارجية","To capture the external issues"),T("كود العزل الحراري الجديد (قانوني)، وموجات حر أطول (بيئي)","New thermal insulation code (legal), longer heatwaves (environmental)"),QM,"done","2026-09-22"),
   S("e3c","P","bench",T("لمقارنة نسبة الرفض بمقاولين آخرين","To compare the rejection rate with other contractors"),"",QM,"doing","2026-10-05"),
   S("e3d","D","vision",T("لتوحيد الرسالة قبل الأهداف","To agree the mission before the objectives"),T("الرسالة: منشآت آمنة تُسلَّم في موعدها بجودة يثق بها المالك","Mission: safe facilities, delivered on time, at a quality the owner trusts"),T("المدير العام","General manager"),"done","2026-09-30"),
   S("e3e","D","mbo",T("لتحويل الاتجاه إلى أهداف SMART متسلسلة","To turn the direction into cascaded SMART objectives"),T("مسودة: رفض أقل من 3% في كل مشروع، واعتماد المخططات خلال 5 أيام","Draft: rejections below 3 % on every project, drawing approval within 5 days"),QM,"doing","2026-10-10"),
   S("e3f","C","coq",T("لمعرفة أكبر تكاليف الفشل قبل وضع الأهداف","To know the largest failure costs before setting objectives"),T("من باريتو PA-EX-03: إعادة أعمال القوالب والحديد أكبر تكلفة فشل","From Pareto PA-EX-03: formwork and rebar rework is the largest failure cost"),T("المدير المالي","Finance manager"),"done","2026-10-01"),
   S("e3g","C","nps",T("لقياس ولاء الملاك بعد التسليم","To measure owners' loyalty after handover"),T("صافي نقاط الترويج +60 من 20 مالكاً (14 / 4 / 2)","Net promoter score +60 from 20 owners (14 / 4 / 2)"),T("مدير تطوير الأعمال","Business development manager"),"done","2026-10-02"),
   S("e3h","A","riskreg",T("لنقل المخاطر الاستراتيجية إلى السجل","To carry the strategic risks into the register"),"",QM,"plan",""),
   S("e3i","A","raci",T("لتحديد المسؤول عن كل هدف","To set who is accountable for each objective"),"",T("المدير العام","General manager"),"plan","")
  ],
  result:"",std:"",lessons:"",review:"",created:"2026-09-15",updated:"2026-10-10"}
 ];
}
var EXAMPLE_AS={SL1:2,SL2:1,SL3:1,CP1:1,CP2:2,DT1:2,DT2:2,DT3:1,TM1:2,TM2:1,IN1:1,IN2:2,IN3:1,RV1:1,RV2:2,RV3:1};
var EXAMPLE_CALC={nps:{p:"14",pa:"4",d:"2"},oee:{a:"85",pf:"90",q:"98"},coq:{pr:"180000",ap:"260000",inf:"940000",exf:"310000",sales:"48000000"}};
