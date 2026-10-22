/* three illustrative PESTLE scans for Al-Waha Contracting, the fictitious company of the PDCA, CAPA, 5 Whys, Fishbone, Pareto, RCA, A3, DMAIC, FMEA, Lessons Learned and SWOT examples */
function exPe(lang){
 var T=function(a,e){ return lang==="ar"?a:e; };
 var TM=function(n,role,ext){ return {n:n,role:role,ext:ext||"no"}; };
 var G=function(nr){ var o=BASEG.map(function(k){ return {k:k,n:"",nr:""}; }); for(var k in (nr||{})) o[BASEG.indexOf(k)].nr=nr[k]; return o; };
 var FA=function(id,g,t,so,d,eff,sig,cer,hz,who){ return {id:id,g:g,t:t,so:so,d:d,eff:eff,sig:sig,cer:cer,hz:hz,who:who,sid:""}; };
 var OU=function(id,f,to,q,ref,what,why,who){ return {id:id,f:f,to:to,q:q,ref:ref,what:what,why:why,who:who}; };
 var AC=function(id,f,what,who,by,st,done,ev){ return {id:id,f:f,what:what,who:who,by:by,st:st,done:done,ev:ev}; };
 var RV=function(id,date,trig,chg,add,rem){ return {id:id,date:date,trig:trig,chg:chg,add:add,rem:rem}; };
 var CEO=T("الرئيس التنفيذي","Chief executive"), OD=T("مدير العمليات","Operations director"), FM=T("المدير المالي","Finance manager"), QM=T("مدير الجودة","Quality manager"),
     BD=T("مدير تطوير الأعمال","Business development manager"), PD=T("مدير المشاريع","Projects director"), HR=T("مدير الموارد البشرية","HR manager"), HSE=T("مدير الصحة والسلامة والبيئة","HSE manager"),
     TDM=T("مدير العطاءات","Tender manager"), EST=T("مهندس التسعير","Estimating engineer"), PRC=T("مدير المشتريات","Procurement manager"), OM=T("مدير العمليات الميدانية","Operations manager"),
     LS=T("مشرف الرفع","Lifting supervisor"), CO=T("مشغل الرافعة","Crane operator"), PC=T("مراقب تكاليف المشروع","Project cost controller");
 return [
 fixRec({id:"PE-EX-01",ref:"PST-2027",title:T("مسح PESTLE الوطني لاستراتيجية 2027","National PESTLE scan for the 2027 strategy"),scope:"org",level:"national",
  decision:T("تحديد القضايا الخارجية لاستراتيجية 2027 ولدراسة SWOT رقم SW-EX-01، قبل عرضها على مجلس الإدارة في 30 سبتمبر 2026.","Set the external issues for the 2027 strategy and SWOT study SW-EX-01, before the board meeting on 30 September 2026."),
  date:"2026-09-01",facil:QM,owner:CEO,revBy:"2027-03-01",trig:T("تعديل جديد في كود البناء، أو تغير سعر الحديد بأكثر من 10% في ربع، أو تغير خطط الإنفاق العام.","A new building code amendment, a rebar price change of more than 10% in a quarter, or a change in public spending plans."),src:"none",srcId:"",
  team:[TM(CEO,T("الإدارة العليا","Top management")),TM(OD,T("التنفيذ في المواقع","Site delivery")),TM(FM,T("التكلفة والتمويل","Cost and finance")),TM(QM,T("الميسّر والجودة","Facilitator, quality")),
   TM(T("مستشار استراتيجي خارجي","External strategy advisor"),T("نظرة من خارج القطاع","A view from outside the sector"),"advisor"),TM(T("ممثل العميل الرئيسي (هيئة حكومية)","Main client's representative (public authority)"),T("صوت العميل","Voice of the customer"),"customer")],
  grp:G(),
  fac:[
   FA("f1","p",T("برنامج حكومي للبنية التحتية والصحة: 11 مشروعاً معلناً في المنطقة بين يوليو وأغسطس 2026","Public infrastructure and healthcare programme: 11 projects announced in the region from July to August 2026"),T("نشرة المنافسات الحكومية","Public tenders bulletin"),"2026-08-28","o",4,4,"m",T("تطوير الأعمال والتسعير","Business development, estimating")),
   FA("f2","e",T("سعر حديد التسليح زاد 9% بين مارس وأغسطس 2026","Rebar price up 9% from March to August 2026"),T("عروض ثلاثة موردين","Quotes from three suppliers"),"2026-08-31","t",4,4,"s",T("المشتريات والتسعير","Procurement, estimating")),
   FA("f3","e",T("تمويل رأس المال العامل بنسبة 7.1% مقابل 5.6% قبل عام","Working capital finance at 7.1% against 5.6% a year earlier"),T("خطاب عرض البنك","Bank offer letter"),"2026-08-20","t",3,5,"s",T("الإدارة المالية","Finance")),
   FA("f4","s",T("شروط المنافسات الصادرة في يوليو 2026 ترفع نسبة الكوادر الوطنية في المواقع الحكومية إلى 30% من 2027","Tender conditions issued in July 2026 raise the national staff share on public sites to 30% from 2027"),T("شروط المنافسات الحكومية","Public tender conditions"),"2026-07-15","b",3,4,"m",T("الموارد البشرية ومديرو المواقع","HR, site managers")),
   FA("f5","t",T("تسليمات نمذجة معلومات البناء BIM مطلوبة في 6 من آخر 8 منافسات حكومية","BIM deliverables required in 6 of the last 8 public tenders"),T("سجل وثائق المنافسات","Tender documents register"),"2026-08-25","b",3,4,"m",T("الهندسة ومنسقو BIM","Engineering, BIM coordinators")),
   FA("f6","l",T("متطلبات العزل الحراري الجديدة في كود البناء، إلزامية لتراخيص البناء الجديدة من 2027","The new thermal insulation requirements of the building code, mandatory for new building permits from 2027"),T("إشعار تعديل كود البناء","Building code amendment notice"),"2026-06-30","o",5,5,"s",T("التسعير وتنسيق التصميم وموردو العزل","Estimating, design coordination, insulation suppliers")),
   FA("f7","en",T("موجات حر أطول: 38 يوماً فوق 45 °م في المواقع في 2026 مقابل 24 يوماً في 2023","Longer heatwaves: 38 days above 45 °C on site in 2026 against 24 days in 2023"),T("سجلات الطقس في المواقع 2023–2026","Site weather logs 2023–2026"),"2026-08-31","t",5,5,"lg",T("فرق الخرسانة والسلامة والتخطيط","Concrete crews, HSE, planning"))],
  clim:{dec:"rel",why:T("موجات الحر تمس صب الخرسانة ومعالجتها والإجهاد الحراري لفرق المواقع، وعطاءات العميل لعام 2027 تطلب طريقة عمل للصب في الحر.","Heatwaves affect concrete pours and curing and the heat stress of site crews, and the client's 2027 tenders ask for a hot-weather method statement.")},
  outs:[OU("o1","f6","swot","o","SW-EX-01",T("فرصة: متطلبات العزل الحراري الجديدة (البند i7)","Opportunity: the new thermal insulation requirements (item i7)"),"",BD),
   OU("o2","f7","swot","t","SW-EX-01",T("تهديد: موجات الحر الأطول (البند i9)","Threat: longer summer heatwaves (item i9)"),"",OD),
   OU("o3","f1","swot","o","SW-EX-01",T("فرصة: مشاريع البنية التحتية والصحة الحكومية (البند i8)","Opportunity: public infrastructure and healthcare projects (item i8)"),"",BD),
   OU("o4","f2","plan","",T("خطة 6.1 — R-2027-03 تصاعد الأسعار","6.1 plan — R-2027-03 price escalation"),T("بند تعديل الأسعار في كل عطاء لعام 2027","A price adjustment clause in every 2027 bid"),"",PRC),
   OU("o5","f3","reg","","RR-2026-08",T("خطر تكلفة رأس المال العامل","Working capital cost risk"),"",FM),
   OU("o6","f4","aside","","","",T("مغطى في خطة القوى العاملة لعام 2027 (HR-2027)؛ لا يغيّر قرار الاستراتيجية.","Covered by the 2027 workforce plan (HR-2027); it does not change the strategy decision."),HR)],
  acts:[AC("a1","f7",T("خطة صب في الحر (ماء مبرد وصب ليلي) في كل عطاء لعام 2027","A hot-weather pour plan (chilled water, night pours) in every 2027 bid"),OD,"2026-11-30","doing","",""),
   AC("a2","f6",T("تسعير نطاق العزل مع موردَين قبل أول منافسة في 2027","Price the insulation scope with two suppliers before the first 2027 tender"),EST,"2026-12-15","plan","",""),
   AC("a3","f2",T("إضافة بند تعديل الأسعار إلى نموذج العطاء","Add the price adjustment clause to the bid template"),PRC,"2026-10-31","done","2026-10-12",T("نموذج العطاء BT-07 الإصدار 3","Bid template BT-07 revision 3"))],
  revs:[RV("v1","2026-10-08","event",T("تأكد موعد سريان تعديل كود العزل في 2027، وبلغت زيادة سعر الحديد 12% في ستة أشهر (عروض الموردين 2026-09-30).","The insulation code amendment's 2027 effective date was confirmed, and the rebar price rise reached 12% in six months (supplier quotes, 2026-09-30)."),"",T("—","—"))],
  created:"2026-09-01T08:00:00.000Z",updated:"2026-10-08T10:00:00.000Z"}),
 fixRec({id:"PE-EX-02",ref:"BID-HOSP-300-PE",title:T("مسح PESTLE لعطاء مستشفى حكومي بسعة 300 سرير","PESTLE scan for the 300-bed public hospital bid"),scope:"bid",level:"regional",
  decision:T("تغذية قرار التقدم للعطاء والسعر الأدنى (دراسة SWOT رقم SW-EX-02) قبل 20 نوفمبر 2026.","Feed the bid / no-bid decision and the floor price (SWOT study SW-EX-02) before 20 November 2026."),
  date:"2026-10-02",facil:TDM,owner:PD,revBy:"2026-11-10",trig:T("تغير وثائق المنافسة أو شروط الدفع أو عرض التمويل.","A change in the tender documents, the payment terms or the financing offer."),src:"none",srcId:"",
  team:[TM(TDM,T("الميسّر وإدارة العطاء","Facilitator, bid management")),TM(EST,T("التكلفة والكميات","Cost and quantities")),TM(PRC,T("المواد والموردون","Materials and suppliers")),TM(FM,T("التمويل وشروط الدفع","Financing and payment terms")),
   TM(T("مدير مبيعات مورد الحديد","Steel supplier's sales manager"),T("الأسعار والتوريد","Prices and supply"),"supplier")],
  grp:G({en:T("الموقع داخل مدينة طبية قائمة بتصريح بيئي ساري؛ لم يظهر شرط بيئي جديد لهذا العطاء.","The site is inside an existing medical city with a valid environmental permit; no new environmental condition was found for this bid.")}),
  fac:[
   FA("f1","p",T("برنامج الصحة الحكومي: أربعة مستشفيات بحجم مماثل مخطط لها حتى 2028","Public health programme: four hospitals of similar size planned to 2028"),T("إعلان البرنامج الحكومي","Public programme announcement"),"2026-06-01","o",4,4,"m",T("فريق العطاءات وتطوير الأعمال","Bid team, business development")),
   FA("f2","e",T("تمويل رأس المال العامل بنسبة 7.1% مع شروط دفع 90 يوماً في المنافسة","Working capital finance at 7.1% with 90-day payment terms in the tender"),T("عرض البنك ووثائق المنافسة","Bank offer and tender documents"),"2026-09-28","t",4,5,"s",T("الإدارة المالية","Finance")),
   FA("f3","e",T("سعر حديد التسليح زاد 12% في ستة أشهر","Rebar price up 12% in six months"),T("عروض الموردين","Supplier quotes"),"2026-09-30","t",4,4,"s",T("المشتريات والتسعير","Procurement, estimating")),
   FA("f4","s",T("فنيو الأعمال الكهروميكانيكية: 3 من 5 مقاولين باطن في المنطقة محجوزون حتى منتصف 2027","MEP technicians: 3 of 5 regional subcontractors fully booked to mid-2027"),T("مسح مقاولي الباطن","Subcontractor survey"),"2026-09-25","t",3,3,"s",PD),
   FA("f5","t",T("أنظمة الغازات الطبية وإدارة المبنى تحتاج مركّبين معتمدين: شركتان معتمدتان فقط في المنطقة","Medical gas and building management systems need certified installers: only 2 certified firms in the region"),T("قائمة تأهيل الموردين","Supplier pre-qualification list"),"2026-09-22","t",3,4,"s",PRC),
   FA("f6","l",T("شروط المنافسة: غرامات تأخير حتى 10% من قيمة العقد","Tender conditions: delay penalties up to 10% of the contract value"),T("وثائق المنافسة — القسم 7","Tender documents — section 7"),"2026-09-28","t",4,5,"s",T("مدير المشاريع والشؤون القانونية","Projects director, legal"))],
  clim:{dec:"not",why:T("لقرار العطاء نفسه: معظم الأعمال تشطيبات داخلية، وخطة الصب في الحر المقررة في PE-EX-01 تغطي أعمال الهيكل.","For the bid decision itself: most of the work is indoor fit-out, and the hot-weather pour plan decided in PE-EX-01 covers the structure works.")},
  outs:[OU("o1","f1","swot","o","SW-EX-02",T("فرصة: برنامج المستشفيات (البند i7)","Opportunity: the hospitals programme (item i7)"),"",BD),
   OU("o2","f2","plan","",T("خطة 6.1 — مخاطر العطاءات","6.1 plan — bid risks"),T("تكلفة التمويل وشروط الدفع داخل السعر الأدنى","Cost of finance and payment terms built into the floor price"),"",FM),
   OU("o3","f3","swot","t","SW-EX-02",T("تهديد: تقلب أسعار الحديد والكابلات (البند i9)","Threat: steel and cable price volatility (item i9)"),"",PRC),
   OU("o4","f6","reg","","RR-2026-12",T("التعرض لغرامات التأخير","Exposure to delay penalties"),"",PD),
   OU("o5","f5","reg","","RR-2026-13",T("توفر مركّبين معتمدين للغازات الطبية","Availability of certified medical gas installers"),"",PRC),
   OU("o6","f4","aside","","","",T("تُغطى في حزمة مقاولي الباطن الكهروميكانيكية؛ قدرتهم تُفحص عند التأهيل لا عند قرار العطاء.","Covered by the MEP subcontract package; their capacity is checked at pre-qualification, not at the bid decision."),PD)],
  acts:[AC("a1","f2",T("تشغيل نموذج السعر الأدنى بتمويل 7.1% وشروط دفع 90 يوماً","Run the floor-price model with 7.1% finance and 90-day payment terms"),FM,"2026-10-20","doing","",""),
   AC("a2","f3",T("طلب سعر ثابت للحديد لستة أشهر من موردَين","Ask two suppliers for a six-month fixed rebar price"),PRC,"2026-10-25","plan","","")],
  revs:[],created:"2026-10-02T08:00:00.000Z",updated:"2026-10-06T12:00:00.000Z"}),
 fixRec({id:"PE-EX-03",ref:"SITE-TC-PE",title:T("مسح PESTLE لموقع البرج ج — أعمال الرفع","Site PESTLE for Tower C — lifting works"),scope:"site",level:"local",
  decision:T("تحديد الظروف الخارجية التي يجب أن تغطيها خطة الرفع في البرج ج وخطة السلامة للموقع لعام 2027 (دراسة SWOT رقم SW-EX-03).","Which external conditions the Tower C lift plan and the 2027 site HSE plan must cover (SWOT study SW-EX-03)."),
  date:"2026-10-10",facil:HSE,owner:OM,revBy:"2027-01-15",trig:T("تعميم بلدي جديد، أو حادث رافعة في أي موقع، أو تغيير مورد الرافعات.","A new municipal circular, a crane incident on any site, or a change of crane supplier."),src:"none",srcId:"",
  team:[TM(OM,T("مالك خطة الموقع","Site plan owner")),TM(LS,T("خطط الرفع","Lift plans")),TM(HSE,T("الميسّر والسلامة","Facilitator, safety")),TM(CO,T("خبرة التشغيل","Operating experience")),
   TM(T("مهندس خدمة مورد الرافعات","Crane supplier's service engineer"),T("الأنظمة والفحص","Systems and inspection"),"supplier")],
  grp:G({p:T("لا عامل سياسي يخص هذا الموقع؛ العوامل الوطنية في المسح PE-EX-01.","No political factor specific to this site; the national ones are in scan PE-EX-01.")}),
  fac:[
   FA("f1","s",T("الرافعون المعتمدون: 4 من 9 مطلوبين متاحون في سوق العمل المحلي من يناير إلى يونيو 2027","Certified riggers: 4 of the 9 needed are available in the local labour pool for January–June 2027"),T("خطاب وكالة التوظيف","Manpower agency letter"),"2026-10-06","t",4,4,"s",T("مشرف الرفع والموارد البشرية","Lifting supervisor, HR")),
   FA("f2","t",T("عرض تركيب نظام منع التصادم ومراقبة الحمل للرافعتين TC-1 وTC-2 (العرض Q-2026-311)","Anti-collision and load-monitoring retrofit offered for cranes TC-1 and TC-2 (quotation Q-2026-311)"),T("عرض المورد","Supplier quotation"),"2026-09-20","o",4,5,"s",T("مدير العمليات ومشغلو الرافعات","Operations manager, crane operators")),
   FA("f3","l",T("تعميم بلدي: فحص طرف ثالث للرافعات كل 6 أشهر من 1 يناير 2027","Municipal circular: third-party crane inspection every 6 months from 1 January 2027"),T("التعميم البلدي","Municipal circular"),"2026-09-15","t",4,5,"s",T("السلامة ومورد الرافعات","HSE, crane supplier")),
   FA("f4","en",T("هبات رياح فوق 38 كم/س بعد الظهر في 11 يوماً من سبتمبر 2026 في البرج ج","Afternoon gusts above 38 km/h on 11 days in September 2026 at Tower C"),T("سجل مقياس الرياح في الموقع","Site anemometer log"),"2026-09-30","t",4,4,"s",T("مشرف الرفع والرافعون","Lifting supervisor, riggers")),
   FA("f5","e",T("أسعار استئجار الرافعات زادت 8% لعقود 2027","Crane rental rates up 8% for 2027 contracts"),T("عروض الاستئجار","Rental quotes"),"2026-10-02","t",2,4,"s",PC)],
  clim:{dec:"rel",why:T("الإجهاد الحراري لمشغلي الرافعات والرافعين في صيف 2027، وهبات الرياح الأقوى بعد الظهر؛ امتداد لقرار المسح PE-EX-01.","Heat stress for crane operators and riggers in the 2027 summer, and stronger afternoon gusts; follows the decision in scan PE-EX-01.")},
  outs:[OU("o1","f2","swot","o","SW-EX-03",T("فرصة: عرض نظام مراقبة الحمل (البند i5)","Opportunity: the load-monitoring retrofit offer (item i5)"),"",OM),
   OU("o2","f3","reg","","RR-LFT-04",T("فحص متأخر يوقف تصريح الرفع","An overdue inspection stops the lifting permit"),"",HSE),
   OU("o3","f4","plan","",T("خطة 6.1 — الرفع في المواقع","6.1 plan — site lifting"),T("حد رياح 38 كم/س مع حبال التوجيه في خطة الرفع","A 38 km/h wind limit with tag lines in the lift plan"),"",LS),
   OU("o4","f1","iso31000","","",T("خطر نقص الرافعين المعتمدين من يناير إلى يونيو 2027","Shortage of certified riggers for January–June 2027"),"",OM),
   OU("o5","f5","aside","","","",T("ضمن احتياطي تكلفة المشروع؛ لا يغيّر خطة الرفع.","Within the project's cost contingency; it does not change the lift plan."),PC)],
  acts:[AC("a1","f3",T("حجز فحص الطرف الثالث للرافعتين TC-1 وTC-2 في ديسمبر 2026","Book the third-party inspection of TC-1 and TC-2 for December 2026"),HSE,"2026-11-30","plan","",""),
   AC("a2","f1",T("بدء اعتماد 5 عمال من الموقع رافعين","Start rigger certification for 5 site labourers"),LS,"2026-12-15","plan","","")],
  revs:[],created:"2026-10-10T08:00:00.000Z",updated:"2026-10-12T09:30:00.000Z"})
 ];
}
var EXAMPLE={ar:exPe("ar"),en:exPe("en")};
var EXAMPLE_AS={IN1:2,IN2:2,IN3:1,EV1:2,EV2:2,EV3:1,OU1:2,OU2:2,OU3:1,RV1:1,RV2:1,RV3:1};
