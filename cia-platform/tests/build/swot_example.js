/* three illustrative SWOT studies for Al-Waha Contracting, the fictitious company of the PDCA, CAPA, 5 Whys, Fishbone, Pareto, RCA, A3, DMAIC, FMEA and Lessons Learned examples */
function exSw(lang){
 var T=function(a,e){ return lang==="ar"?a:e; };
 var TM=function(n,role,ext){ return {n:n,role:role,ext:ext||"no"}; };
 var IT=function(id,q,t,ev,evs,evd,src,sid,w,rk){ return {id:id,q:q,t:t,ev:ev,evs:evs,evd:evd,src:src,sid:sid,w:w,rk:rk,note:""}; };
 var OP=function(id,k,t,a,b){ return {id:id,k:k,t:t,a:a,b:b}; };
 var AC=function(id,opt,what,who,by,st,done,ev){ return {id:id,opt:opt,what:what,who:who,by:by,st:st,done:done,ev:ev}; };
 var RO=function(id,kind,item,what,dest,ref,who){ return {id:id,kind:kind,item:item,what:what,dest:dest,ref:ref,who:who}; };
 var RV=function(id,date,chg,add,rem){ return {id:id,date:date,chg:chg,add:add,rem:rem}; };
 var CEO=T("الرئيس التنفيذي","Chief executive"), OD=T("مدير العمليات","Operations director"), FM=T("المدير المالي","Finance manager"), QM=T("مدير الجودة","Quality manager"),
     BD=T("مدير تطوير الأعمال","Business development manager"), PD=T("مدير المشاريع","Projects director"), HR=T("مدير الموارد البشرية","HR manager"), HSE=T("مدير الصحة والسلامة والبيئة","HSE manager"),
     TDM=T("مدير العطاءات","Tender manager"), EST=T("مهندس التسعير","Estimating engineer"), PRC=T("مدير المشتريات","Procurement manager"), OM=T("مدير العمليات الميدانية","Operations manager"),
     LS=T("مشرف الرفع","Lifting supervisor"), CO=T("مشغل الرافعة","Crane operator"), RF=T("رئيس الرافعين","Rigger foreman");
 return [
 fixRec({id:"SW-EX-01",ref:"STR-2027",title:T("استراتيجية شركة الواحة للمقاولات لعام 2027","Al-Waha Contracting strategy for 2027"),scope:"org",
  decision:T("اختيار المحاور الاستراتيجية الثلاثة لعام 2027 وتركيز العطاءات، لعرضها على مجلس الإدارة في 30 سبتمبر 2026.","Choose the three strategic themes for 2027 and the bidding focus, for the board on 30 September 2026."),
  date:"2026-09-15",facil:QM,owner:CEO,revBy:"2027-03-31",src:"none",srcId:"",
  team:[TM(CEO,T("الإدارة العليا","Top management")),TM(OD,T("التنفيذ في المواقع","Site delivery")),TM(FM,T("التكلفة والتمويل","Cost and finance")),TM(QM,T("الميسّر والجودة","Facilitator, quality")),
   TM(T("ممثل العميل الرئيسي (هيئة حكومية)","Main client's representative (public authority)"),T("صوت العميل","Voice of the customer"),"customer"),TM(T("مستشار استراتيجي خارجي","External strategy advisor"),T("نظرة من خارج القطاع","A view from outside the sector"),"advisor")],
  items:[
   IT("i1","s",T("خبرة الخرسانة في الحر","Concrete know-how in hot weather"),T("صيف 2026: 1.9% من الشحنات رُفضت مع الماء المبرد مقابل 7.9% دونه، والقاعدة في كل عقد توريد خرسانة جاهزة","Summer 2026: 1.9% of loads rejected with chilled water against 7.9% without, and the rule is in every ready-mix supply contract"),T("سجل الدروس LL-EX-01 · مشروع DMAIC DM-EX-01","Lessons register LL-EX-01 · DMAIC project DM-EX-01"),"2026-09-12","lesson","LL-EX-01",5,1),
   IT("i2","s",T("نظام إدارة معتمد بلا ملاحظات كبرى","A certified management system with no major findings"),T("تدقيق المراقبة 2026: صفر ملاحظات كبرى وملاحظتان صغيرتان","2026 surveillance audit: no major and two minor findings"),T("تقرير جهة المنح","Certification body report"),"2026-05-20","audit","",4,2),
   IT("i3","s",T("سجل سلامة جيد في أعمال الرفع","A good safety record in lifting work"),T("معدل الإصابات المضيعة للوقت 0.21 لكل 200 ألف ساعة في 2026 حتى أغسطس","Lost-time injury rate 0.21 per 200,000 hours in 2026 to August"),T("لوحة مؤشرات السلامة","HSE KPI dashboard"),"2026-08-31","kpi","",3,3),
   IT("i4","w",T("تأخر اعتماد المخططات","Slow drawing approvals"),T("دورة اعتماد المخططات 21 يوماً في المتوسط مقابل 10 أيام في العقود","Drawing approval cycle 21 days on average against 10 days in the contracts"),T("مؤشر DWG-01 — الربع الثالث 2026","KPI DWG-01 — Q3 2026"),"2026-09-10","kpi","",5,1),
   IT("i5","w",T("مصاريف المواقع أعلى من المنافسين في المشاريع الصغيرة","Site overheads above competitors on small projects"),T("مصاريف الموقع 14% من قيمة العقد مقابل 11% في آخر عطاءين خسرناهما","Site overheads 14% of contract value against 11% in the last two lost bids"),T("جلسة مراجعة العطاءات الخاسرة","Lost-bid debrief"),"2026-08-20","kpi","",4,2),
   IT("i6","w",T("نقص منسقي نمذجة معلومات البناء BIM","Lack of BIM coordinators"),T("منسقان مدربان لتسعة مشاريع جارية","Two trained coordinators for nine live projects"),T("سجل الموارد البشرية","HR record"),"2026-08-31","kpi","",3,3),
   IT("i7","o",T("متطلبات العزل الحراري الجديدة في كود البناء","The new thermal insulation requirements of the building code"),T("إلزامية لتراخيص البناء الجديدة من 2027 (عامل قانوني في PESTLE)","Mandatory for new building permits from 2027 (a legal factor in PESTLE)"),T("PESTLE — قانوني","PESTLE — legal"),"2026-09-01","pestle","",5,1),
   IT("i8","o",T("مشاريع البنية التحتية والصحة الحكومية في المنطقة","Public infrastructure and healthcare projects in the region"),T("14 مشروعاً معلناً في الربع الثالث 2026","14 projects announced in Q3 2026"),T("نشرة المنافسات الحكومية","Public tenders bulletin"),"2026-09-05","market","",4,2),
   IT("i9","t",T("موجات حر أطول في الصيف","Longer summer heatwaves"),T("38 يوماً فوق 45 °م في المواقع في 2026 مقابل 24 يوماً في 2023","38 days above 45 °C on site in 2026 against 24 days in 2023"),T("PESTLE — بيئي · سجلات الطقس في المواقع","PESTLE — environmental · site weather logs"),"2026-09-01","pestle","",5,1),
   IT("i10","t",T("مقاولون إقليميون جدد في العطاءات الحكومية","New regional contractors in public tenders"),T("5 متقدمين جدد في آخر 8 منافسات حكومية","5 new bidders in the last 8 public tenders"),T("قوى بورتر — تهديد الداخلين الجدد","Porter's forces — threat of new entrants"),"2026-09-05","porter","",3,2)],
  opts:[OP("p1","so",T("التقدم لمباني حكومية تتطلب العزل الجديد، اعتماداً على سجلنا في الخرسانة الحارة ونظامنا المعتمد","Bid for public buildings under the new insulation code, on the strength of our hot-weather concrete record and certified system"),["i1","i2"],["i7","i8"]),
   OP("p2","st",T("تحويل قاعدة الخرسانة الصيفية إلى خطة أعمال صيفية لكل مشروع: ساعات العمل، والماء المبرد، والمعالجة","Turn the summer concrete rule into a summer works plan for every project: shift hours, chilled water, curing"),["i1","i3"],["i9"]),
   OP("p3","wo",T("مسار اعتماد إلكتروني للمخططات مع الاستشاريين، وفريق BIM يكبر مع مشاريع البنية التحتية","An electronic drawing approval route with the consultants, and a BIM team that grows with the infrastructure pipeline"),["i4","i6"],["i8"]),
   OP("p4","wt",T("خفض مصاريف المواقع في المشاريع الصغيرة قبل منافسة الداخلين الجدد","Cut site overheads on small projects before competing with the new entrants"),["i5"],["i10"])],
  acts:[AC("a1","p1",T("إعداد ملف تأهيل لمباني العزل الحراري الحكومية","Prepare a pre-qualification pack for public buildings under the insulation code"),BD,"2026-11-30","doing","",""),
   AC("a2","p2",T("إصدار نموذج خطة الأعمال الصيفية SW-PLN-01","Issue the summer works plan template SW-PLN-01"),OD,"2027-03-31","plan","",""),
   AC("a3","p3",T("تجربة الاعتماد الإلكتروني مع استشاريين اثنين","Pilot the electronic approval route with two consultants"),PD,"2026-12-31","plan","",""),
   AC("a4","p4",T("مراجعة تجهيز المواقع الصغيرة وتكاليفها","Review the set-up and cost of small sites"),FM,"2026-12-15","plan","",""),
   AC("a5","p3",T("تدريب أربعة منسقي BIM إضافيين","Train four more BIM coordinators"),HR,"2027-02-28","plan","","")],
  ros:[RO("r1","risk","i9",T("إجهاد حراري وجودة الخرسانة في صبات الصيف","Heat stress and concrete quality on summer pours"),"reg","RR-2026-07",HSE),
   RO("r2","risk","i10",T("تآكل الهامش أمام الداخلين الجدد","Margin erosion against new entrants"),"plan",T("خطة 6.1 — البند 4","6.1 plan — item 4"),FM),
   RO("r3","opp","i7",T("أعمال كود العزل الحراري","Thermal insulation code work"),"plan",T("خطة 6.1 — البند 5","6.1 plan — item 5"),BD)],
  revs:[RV("v1","2026-10-08",T("صدرت متطلبات العزل بموعد بدء في 2027؛ ثُبّت وزن الفرصة على 5 وقُدّم إجراء ملف التأهيل.","The insulation requirements came out with a 2027 start date; the opportunity's weight was confirmed at 5 and the pre-qualification action brought forward."),"—","—")],
  created:"2026-09-15T08:00:00.000Z",updated:"2026-10-08T10:00:00.000Z"}),
 fixRec({id:"SW-EX-02",ref:"BID-HOSP-300",title:T("قرار عطاء مستشفى حكومي بسعة 300 سرير","Bid decision for a 300-bed public hospital"),scope:"bid",
  decision:T("نتقدم أم لا لمنافسة المستشفى (التسليم 20 نوفمبر 2026)، وبأي سعر أدنى.","Bid or not for the hospital tender (submission 20 November 2026), and at what floor price."),
  date:"2026-10-05",facil:TDM,owner:PD,revBy:"2026-11-10",src:"none",srcId:"",
  team:[TM(TDM,T("الميسّر والعطاء","Facilitator, the bid")),TM(EST,T("التكلفة","Cost estimate")),TM(PD,T("التنفيذ","Delivery")),TM(FM,T("الهامش والتمويل","Margin and finance")),
   TM(T("مقاول الأعمال الكهروميكانيكية (مورد)","MEP subcontractor (supplier)"),T("أسعار وتجربة المستشفيات","Prices and hospital experience"),"supplier")],
  items:[
   IT("i1","s",T("خبرة في تنسيق الخرسانة والأعمال الكهروميكانيكية للمستشفيات","Experience coordinating concrete and MEP works for hospitals"),T("مشروعان صحيان سُلّما في 2023 و2025 في موعدهما","Two healthcare projects handed over on time in 2023 and 2025"),T("تقارير إغلاق المشاريع","Project close-out reports"),"2025-12-15","kpi","",4,1),
   IT("i2","s",T("علاقة راسخة مع مقاول الأعمال الكهروميكانيكية","An established relationship with the MEP subcontractor"),T("اتفاقية إطارية منذ 2022 وستة مشاريع مشتركة","A framework agreement since 2022 and six joint projects"),T("سجل الموردين","Supplier register"),"2026-09-30","kpi","",3,2),
   IT("i3","w",T("مصاريف المواقع أعلى من المنافسين","Site overheads above competitors"),T("14% من قيمة العقد مقابل 11% لدى الفائز في آخر عطاءين","14% of contract value against 11% for the winner of the last two bids"),T("جلسة مراجعة العطاءات الخاسرة","Lost-bid debrief"),"2026-08-20","kpi","",5,1),
   IT("i4","w",T("فريق التشغيل التجريبي للمستشفيات صغير","A thin hospital commissioning team"),T("مهندس تشغيل واحد بخبرة مستشفيات","One commissioning engineer with hospital experience"),T("سجل الموارد البشرية","HR record"),"2026-09-30","kpi","",3,2),
   IT("i5","w",T("مراجع صحية قليلة في مكتبة العطاءات","Few healthcare references in the bid library"),T("مرجعان مقابل ثلاثة تطلبها المنافسة","Two references against the three the tender asks for"),T("شروط المنافسة","Tender conditions"),"2026-10-01","kpi","",3,3),
   IT("i6","w",T("سمعة ضعيفة في القطاع الصحي","A weak name in the health sector"),"","","","opinion","",2,4),
   IT("i7","o",T("برنامج حكومي لمستشفيات مماثلة","A public programme of similar hospitals"),T("أربعة مستشفيات مماثلة الحجم مخطط لها حتى 2028","Four hospitals of similar size planned to 2028"),T("إعلان البرنامج الحكومي","Public programme announcement"),"2026-06-01","market","",4,1),
   IT("i8","t",T("قوة المشتري مرتفعة","High buyer power"),T("عميل حكومي واحد، والترسية بأقل سعر، و9 متقدمين مؤهلين","One public client, award at the lowest price, and 9 pre-qualified bidders"),T("قوى بورتر — القوة التفاوضية للمشترين","Porter's forces — bargaining power of buyers"),"2026-10-01","porter","",5,1),
   IT("i9","t",T("تقلب أسعار الحديد والكابلات","Steel and cable price volatility"),T("سعر حديد التسليح زاد 12% في ستة أشهر","Rebar price up 12% in six months"),T("عروض الموردين — PESTLE اقتصادي","Supplier quotes — PESTLE economic"),"2026-09-30","pestle","",4,2)],
  opts:[OP("p1","so",T("التقدم بالعطاء وقيادة العرض الفني بمراجعنا الصحية ومقاول الأعمال الكهروميكانيكية","Bid, with the healthcare references and the MEP subcontractor leading the technical offer"),["i1","i2"],["i7"]),
   OP("p2","wt",T("لا نسعّر دون التكلفة: سعر أدنى من تقدير التكلفة مع احتياطي المخاطر يُعتمد قبل التقديم","Do not bid below cost: a floor price from the cost estimate plus a risk allowance, approved before submission"),["i3"],["i8","i9"]),
   OP("p3","wo",T("توظيف قائد تشغيل تجريبي للمستشفيات لهذا العطاء والعطاءات التالية، وبناء مكتبة المراجع","Hire a hospital commissioning lead for this and the next tenders, and build the reference library"),["i4","i5"],["i7"])],
  acts:[AC("a1","p2",T("اعتماد السعر الأدنى (تقدير التكلفة + 4% مخاطر) في لجنة العطاءات","Approve the floor price (cost estimate + 4% risk) at the bid committee"),FM,"2026-11-05","plan","",""),
   AC("a2","p1",T("إعداد العرض الفني بقيادة المراجع الصحية","Prepare the technical offer led by the healthcare references"),TDM,"2026-11-15","doing","",""),
   AC("a3","p3",T("الإعلان عن وظيفة قائد التشغيل التجريبي","Advertise the commissioning lead role"),HR,"2026-11-30","plan","","")],
  ros:[RO("r1","risk","i8",T("ترسية بسعر خاسر","An award at a loss-making price"),"plan",T("خطة 6.1 — مخاطر العطاءات","6.1 plan — bid risks"),FM),
   RO("r2","risk","i9",T("ارتفاع أسعار المواد بعد الترسية","Material prices rising after the award"),"reg","RR-2026-11",PRC)],
  revs:[],created:"2026-10-05T08:00:00.000Z",updated:"2026-10-07T13:00:00.000Z"}),
 fixRec({id:"SW-EX-03",ref:"PRC-LFT-2027",title:T("تحليل SWOT لعملية الرفع في المواقع","Process SWOT of site lifting"),scope:"process",
  decision:T("أي تحسينات الرفع تدخل خطة الصحة والسلامة لعام 2027 في الأبراج أ وب وج.","Which lifting improvements go into the 2027 site HSE plan for Towers A, B and C."),
  date:"2026-10-12",facil:HSE,owner:OM,revBy:"2027-01-15",src:"lessons",srcId:"LL-EX-02",
  team:[TM(HSE,T("الميسّر","Facilitator")),TM(LS,T("خطط الرفع","Lift plans")),TM(CO,T("الرفع والدوران","Lifting and slewing")),TM(RF,T("الحبال والربط","Slings and rigging")),
   TM(T("شركة تأجير الرافعات (مورد)","Crane rental company (supplier)"),T("المعدات وأنظمة الأمان","Equipment and safety systems"),"supplier")],
  items:[
   IT("i1","s",T("حزم مربوطة وحبلان معياراً للشركة","Banded bundles and two slings as a company standard"),T("لم تنزلق أي حزمة في 46 رفعة مراقبة بعد التغيير","No bundle slipped in 46 observed lifts after the change"),T("سجل الدروس LL-EX-02","Lessons register LL-EX-02"),"2026-09-12","lesson","LL-EX-02",5,1),
   IT("i2","s",T("مخططو رفع مدربون في كل برج","Trained lift planners on every tower"),T("التدقيق الداخلي IA-2026-09: خطط الرفع مكتملة في 18 من 18 رفعة في العينة","Internal audit IA-2026-09: lift plans complete on 18 of 18 lifts sampled"),T("تقرير التدقيق الداخلي","Internal audit report"),"2026-09-25","audit","",3,2),
   IT("i3","w",T("قراءة الرياح قبل كل رفعة لا تُسجل","The wind reading before each lift is not recorded"),T("4 حالات تأرجح في سجل الموقع في أغسطس ولا قراءة رياح مسجلة","4 swinging incidents in the site log in August and no wind reading recorded"),T("سجل الموقع · FM-EX-02 الصف R3","Site log · FM-EX-02 row R3"),"2026-08-31","audit","FM-EX-02",4,1),
   IT("i4","w",T("توجيه الحمولة باليد عند الإنزال","Guiding the load by hand when landing"),T("الخطورة 8 والحدوث 4 والكشف 7 في FM-EX-02","Severity 8, occurrence 4, detection 7 in FM-EX-02"),T("دراسة FMEA FM-EX-02 الصف R4","FMEA study FM-EX-02 row R4"),"2026-08-12","risk","FM-EX-02",3,2),
   IT("i5","o",T("المورد يعرض تركيب نظام منع التصادم ومراقبة الحمل","The supplier offers an anti-collision and load-monitoring retrofit"),T("عرض سعر Q-2026-311 للرافعتين TC-1 وTC-2","Quotation Q-2026-311 for cranes TC-1 and TC-2"),T("عرض المورد","Supplier quotation"),"2026-09-20","market","",3,1),
   IT("i6","t",T("انزلاق الحزمة من الحبال","The bundle slips from the sling"),T("الخطورة 10، الأولوية عالية؛ حادثان وشيكان NM-2026-031 وNM-2026-019 في ستة أشهر","Severity 10, high action priority; near misses NM-2026-031 and NM-2026-019 in six months"),T("دراسة FMEA FM-EX-02 الصف R1","FMEA study FM-EX-02 row R1"),"2026-08-12","risk","FM-EX-02",5,1),
   IT("i7","t",T("استخدام حبل تالف في الرفع","A damaged sling is put in service"),T("الخطورة 10، الأولوية عالية","Severity 10, high action priority"),T("دراسة FMEA FM-EX-02 الصف R2","FMEA study FM-EX-02 row R2"),"2026-08-12","risk","FM-EX-02",5,2),
   IT("i8","t",T("تقدير وزن الحزمة بأقل من الحقيقة","The bundle weight is underestimated"),T("الخطورة 10، الأولوية عالية: حمل زائد وخطر انقلاب","Severity 10, high action priority: overload and a risk of overturning"),T("دراسة FMEA FM-EX-02 الصف R5","FMEA study FM-EX-02 row R5"),"2026-08-12","risk","FM-EX-02",4,3)],
  opts:[OP("p1","so",T("تركيب نظام مراقبة الحمل، وتطبيق معيار الحزم المربوطة في البرج ج من أول يوم","Fit the load-monitoring retrofit, and apply the banded-bundle standard on Tower C from day one"),["i1","i2"],["i5"]),
   OP("p2","st",T("تعميم معيار الحزم المربوطة والحبلين على كل الحمولات المحزومة (أنابيب، شدات) وتدقيقه شهرياً","Extend the banded-bundle and two-sling standard to all bundled loads (pipes, formwork) and audit it monthly"),["i1","i2"],["i6","i7"]),
   OP("p3","wt",T("تسجيل قراءة الرياح وحبال التوجيه في كل رفعة، ومنع التوجيه باليد، والوزن من بطاقة الحزمة","Record the wind reading and use tag lines on every lift, ban hand guiding, and take the weight from the bundle tag"),["i3","i4"],["i6","i8"])],
  acts:[AC("a1","p2",T("تدقيق شهري لرفع الحمولات المحزومة","A monthly audit of bundled-load lifts"),HSE,"2026-11-15","plan","",""),
   AC("a2","p1",T("اعتماد عرض نظام مراقبة الحمل للرافعتين","Approve the load-monitoring quotation for both cranes"),OM,"2026-12-01","plan","",""),
   AC("a3","p3",T("إضافة قراءة الرياح وفحص حبال التوجيه إلى تصريح الرفع","Add the wind reading and the tag-line check to the lift permit"),LS,"2026-10-30","doing","","")],
  ros:[RO("r1","risk","i6",T("إعادة تقييم الصف R1 بعد التدقيقات الشهرية","Re-rate row R1 after the monthly audits"),"fmea","FM-EX-02",HSE),
   RO("r2","risk","i7",T("إعادة تقييم الصف R2 بعد تدقيق الترميز اللوني","Re-rate row R2 after the colour-code audit"),"fmea","FM-EX-02",RF),
   RO("r3","risk","i8",T("خطر الحمل الزائد على الرافعة","Crane overload risk"),"reg","RR-LFT-03",LS)],
  revs:[],created:"2026-10-12T08:00:00.000Z",updated:"2026-10-14T09:30:00.000Z"})
 ];
}
var EXAMPLE={ar:exSw("ar"),en:exSw("en")};
var EXAMPLE_AS={IN1:2,IN2:1,IN3:2,EV1:2,EV2:2,EV3:1,DE1:2,DE2:2,DE3:1,RV1:1,RV2:1,RV3:0};
