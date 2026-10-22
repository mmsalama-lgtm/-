"""Step 2026-10-17 (SWOT): link the SWOT tool in the hub (index.html) from the start. Every anchor must match once.
    python3 tests/build/patch_hub_swot.py index.html
Then serve the platform folder and run tests/build/demo_swot.py, which fills DEMO_RES.swot from the hub's own reading of the SWOT example
(until then a placeholder with st "none" stands in). The other adapters (lessonsAd, qtAd …) are left as they are, so the snapshots the hub
reads for the other tools do not change. SWOT goes into Audit & Improvement with the rest of the toolbox (14 rows there, 37 in all)."""
import sys, os

HERE = os.path.dirname(os.path.abspath(__file__))
path = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, "..", "..", "index.html")
s = open(path, encoding="utf-8").read()
if 'swot:     "./modules/swot.html"' in s:
    print("SWOT already linked; nothing to do"); sys.exit(0)


def rep(old, new):
    global s
    n = s.count(old)
    assert n == 1, (n, old[:100])
    s = s.replace(old, new)


# 1. URL
rep('  lessons:  "./modules/lessons.html"\n};', '  lessons:  "./modules/lessons.html",\n  swot:     "./modules/swot.html"\n};')
# 2. systems: Audit & Improvement row (after Lessons Learned)
rep('الأداة العاشرة في صندوق أدوات التحسين"}}', '''الأداة العاشرة في صندوق أدوات التحسين"}},
      {k:"swot",status:"live", name:{en:"SWOT Analysis",ar:"تحليل SWOT"}, note:{en:"One study per analysis, serving a named decision: a team of at least three roles with outside input · internal strengths and weaknesses backed by a KPI, an audit result or a lesson, external opportunities and threats from PESTLE, Porter's forces and market data, with a placement check and an opinion-only flag · each quadrant weighted and ranked, the grid of top items · TOWS options linking two quadrants, actions with an owner and a date, risk and opportunity entries for the 6.1 plan · a dated review when the context changes · starts read-only from the Strategy Studio's SWOT, TOWS and PESTLE, lessons, Pareto and FMEA · ISO 10009:2024 5.1 · eleventh tool of the improvement toolbox", ar:"دراسة لكل تحليل تخدم قراراً محدداً: فريق من ثلاثة أدوار على الأقل برأي خارجي · قوة وضعف داخليان بدليل من مؤشر أو تدقيق أو درس، وفرص وتهديدات خارجية من PESTLE وقوى بورتر وبيانات السوق، مع فحص الموضع وتنبيه «رأي فقط» · وزن ورتبة لكل ربع، ومصفوفة البنود العليا · خيارات TOWS تربط ربعين، وإجراءات بمالك وموعد، ومداخل مخاطر وفرص لخطة 6.1 · مراجعة مؤرخة عند تغير السياق · البدء للقراءة فقط من SWOT وTOWS وPESTLE في استوديو الاستراتيجية والدروس وباريتو وFMEA · ISO 10009:2024 البند 5.1 · الأداة الحادية عشرة في صندوق أدوات التحسين"}}''')
# 3. toolkit card (before the cockpit); PDCA's card text
rep('CAPA, 5 Whys, Fishbone, Pareto, root cause analysis, A3, DMAIC, FMEA and lessons learned are live, and SWOT and the other toolbox tools follow", ar:"مثال تطبيقي بثلاث دورات لشركة سعودية افتراضية؛ وأدوات CAPA ولماذا الخمس وعظمة السمكة وباريتو وتحليل السبب الجذري وA3 وDMAIC وFMEA والدروس المستفادة متاحة، ويتبعها SWOT وبقية أدوات الصندوق"}},',
    'CAPA, 5 Whys, Fishbone, Pareto, root cause analysis, A3, DMAIC, FMEA, lessons learned and SWOT are live, and PESTLE and stakeholder analysis follow", ar:"مثال تطبيقي بثلاث دورات لشركة سعودية افتراضية؛ وأدوات CAPA ولماذا الخمس وعظمة السمكة وباريتو وتحليل السبب الجذري وA3 وDMAIC وFMEA والدروس المستفادة وSWOT متاحة، ويتبعها PESTLE وتحليل الأطراف المعنية"}},')
anchor = '\n  {k:"w8", color:"--c-ai", pre:"CIA", code:"Cockpit"'
assert s.count(anchor) == 1
s = s.replace(anchor, '''
  {k:"swot", color:"--c-aud", pre:"CIA", code:"SWOT", ed:{en:"Continual Improvement Toolbox · tool 11", ar:"صندوق أدوات التحسين المستمر · الأداة الحادية عشرة"},
   title:{en:"SWOT Analysis — from the grid to decisions", ar:"تحليل SWOT — من المصفوفة إلى القرار"},
   feat:{en:["Plain-language method guide: a SWOT is useful only when it leads to decisions; one person's SWOT is not a SWOT; internal items need evidence and external ones come from PESTLE, Porter's forces and market data; rank and keep the top items; date the grid and review it when the context changes","Clause guide on the ISO 9001:2026 clauses the analysis serves (context 4.1, interested parties 4.2, risks and opportunities 6.1.1–6.1.3, objectives 6.2, management review inputs 9.3.2, Annex A.4 and A.6.1), ISO 9000:2026 terms and ISO 10009:2024 5.1, 5.2 and 5.3","Twelve-question self-assessment of your SWOT practice, with a score for each area","One study per analysis: scope and the decision it serves, a team with outside input, the four quadrants with evidence, source type, weight and rank, an opinion-only flag, a \\"lack of…\\" flag and a placement check","TOWS options (SO, ST, WO, WT) that link an item from two quadrants, actions with an owner and a date, risk and opportunity entries carried into the risk register, the 6.1 plan or an FMEA study, a dated review, and seven computed stages","The grid of top items, the TOWS matrix and a chart of items by source (evidence against opinion), starts from the Strategy Studio's SWOT, TOWS and PESTLE, lessons, Pareto and FMEA (read-only preview), automatic audit, dashboard, HTML report and CSV"],
         ar:["دليل منهجية بلغة بسيطة: SWOT مفيد فقط عندما يقود إلى قرار؛ وتحليل شخص واحد ليس تحليلاً؛ والبنود الداخلية تحتاج دليلاً والخارجية تأتي من PESTLE وقوى بورتر وبيانات السوق؛ ورتّب واحتفظ بالأهم؛ وأرّخ المصفوفة وراجعها عند تغير السياق","دليل بنود ISO 9001:2026 التي يخدمها التحليل (السياق 4.1، والأطراف المعنية 4.2، والمخاطر والفرص 6.1.1 إلى 6.1.3، والأهداف 6.2، ومدخلات مراجعة الإدارة 9.3.2، والملحق A.4 وA.6.1)، وتعريفات ISO 9000:2026، والبنود 5.1 و5.2 و5.3 من ISO 10009:2024","تقييم ذاتي من اثني عشر سؤالاً لممارسة SWOT، بنتيجة لكل محور","دراسة لكل تحليل: النطاق والقرار الذي تخدمه، وفريق برأي خارجي، والأرباع الأربعة بدليل ونوع مصدر ووزن ورتبة، وتنبيه «رأي فقط» وتنبيه «نقص في…» وفحص الموضع","خيارات TOWS (SO وST وWO وWT) تربط بنداً من ربعين، وإجراءات بمالك وموعد، ومداخل مخاطر وفرص تُنقل إلى سجل المخاطر أو خطة 6.1 أو دراسة FMEA، ومراجعة مؤرخة، وسبع مراحل محسوبة","مصفوفة البنود العليا، ومصفوفة TOWS، ورسم البنود حسب المصدر (الدليل مقابل الرأي)، والبدء من SWOT وTOWS وPESTLE في استوديو الاستراتيجية والدروس وباريتو وFMEA بمعاينة للقراءة فقط، وتدقيق آلي، ولوحة مؤشرات، وتقرير HTML وCSV"]},
   extra:{en:"Worked example with three studies for a fictitious Saudi company: the 2027 company strategy (concrete know-how in hot weather from LL-EX-01, slow drawing approvals with KPI DWG-01, the new thermal insulation requirements and longer heatwaves from PESTLE; five actions, reviewed), a bid decision for a public hospital (high buyer power from Porter's forces; a WT option not to bid below cost), and a process SWOT of site lifting (a strength from LL-EX-02 and threats from the severity-10 rows of FM-EX-02; actions planned, not reviewed yet)", ar:"مثال تطبيقي بثلاث دراسات لشركة سعودية افتراضية: استراتيجية الشركة لعام 2027 (خبرة الخرسانة في الحر من LL-EX-01، وتأخر اعتماد المخططات بالمؤشر DWG-01، ومتطلبات العزل الحراري الجديدة وموجات الحر الأطول من PESTLE؛ خمسة إجراءات، وروجعت)، وقرار عطاء مستشفى حكومي (قوة المشتري مرتفعة من قوى بورتر؛ وخيار WT بعدم التسعير دون التكلفة)، وتحليل عملية الرفع في المواقع (قوة من LL-EX-02 وتهديدات من صفوف الخطورة 10 في FM-EX-02؛ إجراءات مخططة ولم تُراجع بعد)"}},''' + anchor)
rep('lessons:"aud",w8:"ai"};', 'lessons:"aud",swot:"aud",w8:"ai"};')
# 4. grouped "coming soon" toolbox entry: 2 tools left
rep('''{k:"citbox", sys:"aud", pre:"CIA", code:"Toolbox", ed:{en:"3 tools · PDCA, CAPA, 5 Whys, Fishbone, Pareto, RCA, A3, DMAIC, FMEA and Lessons Learned are live", ar:"3 أدوات · وأدوات PDCA وCAPA ولماذا الخمس وعظمة السمكة وباريتو وتحليل السبب الجذري وA3 وDMAIC وFMEA والدروس المستفادة متاحة الآن"},
   name:{en:"Continual Improvement Toolbox: SWOT and two more", ar:"صندوق أدوات التحسين المستمر: SWOT وأداتان أخريان"},
   note:{en:"SWOT, PESTLE and stakeholder analysis, built on the toolbox engine shared by PDCA, CAPA, 5 Whys, Fishbone, Pareto, RCA, A3, DMAIC, FMEA and Lessons Learned and linked to the Strategy & Performance Studio.", ar:"SWOT، وPESTLE، وتحليل الأطراف المعنية، مبنية على محرك الصندوق المشترك بين PDCA وCAPA ولماذا الخمس وعظمة السمكة وباريتو وتحليل السبب الجذري وA3 وDMAIC وFMEA والدروس المستفادة ومربوطة باستوديو الاستراتيجية والأداء."}}''',
    '''{k:"citbox", sys:"aud", pre:"CIA", code:"Toolbox", ed:{en:"2 tools · PDCA, CAPA, 5 Whys, Fishbone, Pareto, RCA, A3, DMAIC, FMEA, Lessons Learned and SWOT are live", ar:"أداتان · وأدوات PDCA وCAPA ولماذا الخمس وعظمة السمكة وباريتو وتحليل السبب الجذري وA3 وDMAIC وFMEA والدروس المستفادة وSWOT متاحة الآن"},
   name:{en:"Continual Improvement Toolbox: PESTLE and stakeholder analysis", ar:"صندوق أدوات التحسين المستمر: PESTLE وتحليل الأطراف المعنية"},
   note:{en:"PESTLE and stakeholder analysis, built on the toolbox engine shared by PDCA, CAPA, 5 Whys, Fishbone, Pareto, RCA, A3, DMAIC, FMEA, Lessons Learned and SWOT and linked to the Strategy & Performance Studio; PESTLE factors will feed SWOT's opportunities and threats.", ar:"PESTLE وتحليل الأطراف المعنية، مبنيتان على محرك الصندوق المشترك بين PDCA وCAPA ولماذا الخمس وعظمة السمكة وباريتو وتحليل السبب الجذري وA3 وDMAIC وFMEA والدروس المستفادة وSWOT ومربوطتان باستوديو الاستراتيجية والأداء؛ وعوامل PESTLE تغذي فرص SWOT وتهديداته."}}''')
# 5. knowledge centre topic (after Lessons Learned)
rep('guide:{k:"lessons",a:"explain-std"}},', '''guide:{k:"lessons",a:"explain-std"}},
  {en:["SWOT: from a grid to decisions","SWOT is a technique, not a requirement of any standard; ISO 10009:2024 reviews it in 5.1, with PESTLE in 5.2 and Porter's forces in 5.3. ISO 9001:2026 asks to determine and monitor the external and internal issues relevant to the organization's purpose and strategic direction (4.1) and the interested parties' requirements (4.2), to consider them when determining risks and opportunities (6.1.1) and planning actions (6.1.2 and 6.1.3), and to review their changes at management review (9.3.2). A useful SWOT serves a named decision and is run by a team with outside input, not by one person. Strengths and weaknesses are internal and need evidence (a KPI, an audit result, a lesson); opportunities and threats are external and come from PESTLE, Porter's forces and market data, not opinion. Each quadrant is ranked and the top items kept; each top item becomes a TOWS option (SO, ST, WO, WT) and then an action with an owner and a date, or a risk or opportunity entry in the 6.1 plan; the grid is dated and reviewed when the context changes."],
   ar:["تحليل SWOT: من المصفوفة إلى القرار","SWOT أسلوب، وليس متطلباً في أي مواصفة؛ وتراجعه ISO 10009:2024 في البند 5.1 مع PESTLE في 5.2 وقوى بورتر في 5.3. وتطلب ISO 9001:2026 تحديد القضايا الخارجية والداخلية ذات الصلة بغرض المنشأة وتوجهها الاستراتيجي ومتابعتها (4.1) ومتطلبات الأطراف المعنية (4.2)، ومراعاتها عند تحديد المخاطر والفرص (6.1.1) والتخطيط للإجراءات (6.1.2 و6.1.3)، ومراجعة تغيراتها في مراجعة الإدارة (9.3.2). وSWOT المفيد يخدم قراراً محدداً ويعده فريق برأي خارجي، لا شخص واحد. القوة والضعف داخليان ويحتاجان دليلاً (مؤشر أو نتيجة تدقيق أو درس)، والفرص والتهديدات خارجية من PESTLE وقوى بورتر وبيانات السوق، لا من الرأي. ويُرتب كل ربع ويُحتفظ بالأهم، ثم يصير كل بند أعلى خياراً من خيارات TOWS (SO وST وWO وWT) ثم إجراءً بمالك وموعد، أو مدخل خطر أو فرصة في خطة 6.1؛ وتؤرخ المصفوفة وتُراجع عند تغير السياق."], rel:"SWOT · ISO 10009 §5.1 · ISO 9001 §4.1 · §6.1", guide:{k:"swot",a:"explain-std"}},''')
# 6. compliance note
rep('''  {k:"oec", name:{en:"Operations Excellence Center",ar:"مركز التميّز التشغيلي"},
   note:{en:"Explanations are written independently''', '''  {k:"swot", name:{en:"SWOT Analysis",ar:"تحليل SWOT"},
   note:{en:"SWOT is a technique, not a standard or a requirement. The guide summarises the ISO 9001:2026 clauses the analysis serves (4.1, 4.2, 6.1.1, 6.1.2, 6.1.3, 6.2 and 9.3.2, with Annex A.4.1, A.4.2 and A.6.1), ISO 9000:2026 (3.1.2, 3.1.4, 3.7.2, 4.2.7, 4.3.8, 4.4.1 and 4.4.2; it has no term entry for opportunity) and ISO 10009:2024 5.1, 5.2 and 5.3, in independent wording; clause references were checked on the build date (2026-10-17) against the uploaded official texts, ISO 10009:2024 through the platform's catalogue checked against its official file on 2026-10-16. The TOWS matrix as a named method, strategy textbooks, the Balanced Scorecard and ISO 31000 are not verified (not uploaded); the stage, audit, evidence and placement rules are the tool's own wording. The standards' text remains copyright of ISO. The example studies are illustrative, not real data.",
         ar:"SWOT أسلوب، وليس مواصفة ولا متطلباً. يلخص الدليل بنود ISO 9001:2026 التي يخدمها التحليل (4.1 و4.2 و6.1.1 و6.1.2 و6.1.3 و6.2 و9.3.2 مع الملحق A.4.1 وA.4.2 وA.6.1)، وISO 9000:2026 (3.1.2 و3.1.4 و3.7.2 و4.2.7 و4.3.8 و4.4.1 و4.4.2؛ ولا يعرّف «الفرصة» مصطلحاً)، والبنود 5.1 و5.2 و5.3 من ISO 10009:2024 بصياغة مستقلة، وقد تُحقق من مراجع البنود في تاريخ البناء (2026-10-17) من النصوص الرسمية المرفوعة، وISO 10009:2024 عبر فهرس المنصة المتحقق منه من ملفه الرسمي في 2026-10-16. ومصفوفة TOWS بوصفها طريقة مسماة، وكتب الاستراتيجية، وبطاقة الأداء المتوازن، وISO 31000 غير متحقق منها (غير مرفوعة)، وقواعد المراحل والتدقيق والدليل والموضع صياغة الأداة. وحقوق نصوص المواصفات محفوظة لمنظمة ISO. دراسات المثال توضيحية وليست بيانات حقيقية."}},
  {k:"oec", name:{en:"Operations Excellence Center",ar:"مركز التميّز التشغيلي"},
   note:{en:"Explanations are written independently''')
# 7. performance dashboard: labels, breakdown title, adapter, registry
rep('  llAs:B("Lessons learned self-assessment","التقييم الذاتي للدروس المستفادة"),',
    '  swAs:B("SWOT self-assessment","التقييم الذاتي لممارسة SWOT"), swEv:B("Top SWOT items backed by evidence","البنود العليا في SWOT بدليل"), swAct:B("SWOT studies that led to actions with an owner and a date","دراسات SWOT التي خرجت منها إجراءات بمالك وموعد"), swRev:B("SWOT studies reviewed after the analysis","دراسات SWOT التي روجعت بعد التحليل"),\n  llAs:B("Lessons learned self-assessment","التقييم الذاتي للدروس المستفادة"),')
rep('  lessons:B("Open items by type (share of lessons)","البنود المفتوحة حسب النوع (نسبة من الدروس)"),',
    '  lessons:B("Open items by type (share of lessons)","البنود المفتوحة حسب النوع (نسبة من الدروس)"),\n  swot:B("Open items by type (share of studies)","البنود المفتوحة حسب النوع (نسبة من الدراسات)"),')
rep('''/* ---------- registry ---------- */''', '''/* ---------- SWOT studies (cia-swot:v1). The top items (the three heaviest in each quadrant, then by rank, then by order of entry), the
   evidence rule (a figure or a fact from a source other than opinion), the placement rule (PESTLE, Porter and market data are external; KPIs,
   audits and lessons are internal; a note accepts the item), the TOWS links and the review rule are the tool's own rules (modules/swot.html). ---------- */
function swotAd(S){
  if(!S) return finish([],null,false);
  const Q=["IN1","IN2","IN3","EV1","EV2","EV3","DE1","DE2","DE3","RV1","RV2","RV3"], A=(S.assess&&typeof S.assess==="object")?S.assess:{};
  const R=(arr(S.records)||[]).filter(r=>r&&typeof r==="object");
  const ans=Q.filter(q=>num(A[q])!=null), pct=qs=>{ const s=qs.reduce((a,q)=>a+(num(A[q])||0),0); return s/(2*qs.length)*100; };
  const tx=v=>String(v==null||typeof v==="object"?"":v).trim(), isD=d=>/^\\d{4}-\\d{2}-\\d{2}$/.test(String(d||""));
  const L2=v=>(Array.isArray(v)?v:[]).filter(x=>x&&typeof x==="object"), QS=["s","w","o","t"], TWQ={so:["s","o"],st:["s","t"],wo:["w","o"],wt:["w","t"]};
  const W=v=>{ const n=parseInt(v,10); return n>=1&&n<=5?n:0; }, RK=v=>{ const n=parseInt(v,10); return n>=1&&n<=99?n:0; };
  const EXT={pestle:1,porter:1,market:1}, INT={kpi:1,audit:1,lesson:1};
  const read=r=>{ const I=L2(r.items).filter(i=>tx(i.t)), by={}; I.forEach(i=>{ by[tx(i.id)]=i; });
    const top=q=>I.filter(i=>i.q===q).map((x,k)=>[x,k]).sort((a,b)=>(W(b[0].w)-W(a[0].w))||((RK(a[0].rk)||999)-(RK(b[0].rk)||999))||(a[1]-b[1])).slice(0,3).map(x=>x[0]);
    const T=[].concat(...QS.map(top)), ev=i=>!!tx(i.ev)&&i.src!=="opinion";
    const team=L2(r.team).filter(m=>tx(m.n)&&tx(m.role)), mis=I.some(i=>!tx(i.note)&&(((i.q==="s"||i.q==="w")&&EXT[i.src])||((i.q==="o"||i.q==="t")&&INT[i.src])));
    const unr=I.some(i=>!W(i.w)||!RK(i.rk));
    const O=L2(r.opts).filter(o=>tx(o.t)), side=(o,k,n)=>(Array.isArray(o[k])?o[k]:[]).some(id=>by[tx(id)]&&by[tx(id)].q===(TWQ[o.k]||TWQ.so)[n]);
    const okO=O.filter(o=>side(o,"a",0)&&side(o,"b",1)), AC=L2(r.acts).filter(a=>tx(a.what)), own=a=>!!tx(a.who)&&isD(a.by);
    const RO=L2(r.ros).filter(x=>tx(x.what)), V=L2(r.revs).filter(v=>isD(v.date)).sort((a,b)=>a.date<b.date?-1:(a.date>b.date?1:0)), lv=V.length?V[V.length-1]:null;
    return {top:T.length, topEv:T.filter(ev).length, act:AC.some(own), rev:!!lv&&(!isD(r.date)||lv.date>=r.date)&&!!tx(lv.chg),
            team:team.length<3||!team.some(m=>m.ext&&m.ext!=="no"), ev:T.some(i=>!ev(i)), mis, unr:I.length>0&&unr, noOpt:!okO.length||okO.length<O.length,
            optAct:O.some(o=>!AC.some(a=>tx(a.opt)===tx(o.id)&&own(a))), ro:top("t").some(i=>!RO.some(x=>tx(x.item)===tx(i.id)&&x.kind==="risk"))}; };
  let top=0, topEv=0, act=0, rev=0, tm=0, ev=0, mi=0, un=0, no=0, oa=0, ro=0;
  R.forEach(r=>{ const x=read(r); top+=x.top; topEv+=x.topEv; if(x.act) act++; if(x.rev) rev++; if(x.team) tm++; if(x.ev) ev++; if(x.mis) mi++; if(x.unr) un++; if(x.noOpt) no++; if(x.optAct) oa++; if(x.ro) ro++; });
  const m=[ M("swAs", ans.length? pct(Q) : null, "perf", ans.length? `${Math.round(pct(Q))}%` : ""),
            M("swEv", top? share(topEv,top) : null, "perf", top? frac(topEv,top) : ""),
            M("swAct", R.length? share(act,R.length) : null, "prog", R.length? frac(act,R.length) : ""),
            M("swRev", R.length? share(rev,R.length) : null, "prog", R.length? frac(rev,R.length) : ""),
            M("an", ans.length? share(ans.length,Q.length) : null, "prog", frac(ans.length,Q.length)) ];
  const IT=[[B("Team under three roles or with no outside input","فريق أقل من ثلاثة أدوار أو بلا رأي خارجي"),tm,"#1E8C93"],[B("Top items with no evidence","بنود عليا بلا دليل"),ev,"#3563C9"],
            [B("Items in the wrong quadrant","بنود في غير ربعها"),mi,"#B7790F"],[B("Items with no weight or rank","بنود بلا وزن أو رتبة"),un,"#1B2A4A"],
            [B("No valid TOWS option, or an option not linked on both sides","لا خيار TOWS صالح، أو خيار ناقص الربط"),no,"#7B5BB8"],[B("Options with no action that has an owner and a date","خيارات بلا إجراء بمالك وموعد"),oa,"#C9821A"],
            [B("Top threats with no risk entry","تهديدات عليا بلا مدخل خطر"),ro,"#B42318"]];
  const bd = R.length ? {t:BDT.swot, items:IT.map(([l,n,col])=>({l, v:share(n,R.length), t:String(n), col}))} : null;
  return finish(m, bd, ans.length>0 || R.length>0);
}

/* ---------- registry ---------- */''')
rep('  {k:"lessons", sys:"aud", key:"cia-lessons:v1", code:"LL", n:B("Lessons learned register","سجل الدروس المستفادة"), f:lessonsAd},',
    '  {k:"lessons", sys:"aud", key:"cia-lessons:v1", code:"LL", n:B("Lessons learned register","سجل الدروس المستفادة"), f:lessonsAd},\n  {k:"swot",    sys:"aud", key:"cia-swot:v1", code:"SWOT", n:B("SWOT analysis","تحليل SWOT"), f:swotAd},')
rep('rcaAd,a3Ad,dmaicAd,qtAd,fmeaAd,lessonsAd}};', 'rcaAd,a3Ad,dmaicAd,qtAd,fmeaAd,lessonsAd,swotAd}};')
rep('const DEMO_RES = {"lessons": ', 'const DEMO_RES = {"swot": {"st": "none", "idx": null, "comp": null, "m": [], "bd": null}, "lessons": ')
# 8. home page data: tool facts, news, request mapping, Advisor rules
rep(' lessons: TI(12,0,"tools"', ''' swot: TI(12,0,"tools",{en:"SWOT studies",ar:"دراسات SWOT"},["ceo","exc","qhse","grc"],["iso"],
  {en:"Runs a SWOT that serves a named decision: a team with outside input, internal strengths and weaknesses backed by evidence, external opportunities and threats from PESTLE, Porter's forces and market data, ranked quadrants, TOWS options, actions with an owner and a date, risk and opportunity entries, and a review when the context changes.", ar:"تجري تحليل SWOT يخدم قراراً محدداً: فريق برأي خارجي، وقوة وضعف داخليان بدليل، وفرص وتهديدات خارجية من PESTLE وقوى بورتر وبيانات السوق، وأرباع مرتبة، وخيارات TOWS، وإجراءات بمالك وموعد، ومداخل مخاطر وفرص، ومراجعة عند تغير السياق."},
  {en:"Most SWOTs end as a grid on a slide: long lists of opinions, internal and external mixed, and nothing decided. Evidence, ranking and TOWS options turn the same meeting into decisions that reach the risk register and the 6.1 plan, as ISO 9001:2026 4.1 and 6.1 expect.", ar:"أغلب تحليلات SWOT تنتهي مصفوفة في شريحة: قوائم طويلة من الآراء، وخلط الداخلي بالخارجي، ولا قرار. والدليل والترتيب وخيارات TOWS تحوّل الاجتماع نفسه إلى قرارات تصل إلى سجل المخاطر وخطة 6.1، كما يتوقع البندان 4.1 و6.1 من ISO 9001:2026."},
  {en:"A 12-question self-assessment, studies with computed stages (scoped, team complete, quadrants with evidence, ranked, TOWS options, actions and risks, reviewed), evidence, opinion-only, \\"lack of…\\" and placement checks, the grid of top items, the TOWS matrix, a chart of sources, starts from the Strategy Studio, lessons, Pareto and FMEA (read-only), an automatic audit, a dashboard, an HTML report and CSV.", ar:"تقييم ذاتي من 12 سؤالاً، ودراسات بمراحل محسوبة (حُدد النطاق، اكتمل الفريق، أرباع بدليل، رُتّبت، خيارات TOWS، إجراءات ومخاطر، روجعت)، وفحوص الدليل و«رأي فقط» و«نقص في…» والموضع، ومصفوفة البنود العليا، ومصفوفة TOWS، ورسم المصادر، والبدء من استوديو الاستراتيجية والدروس وباريتو وFMEA للقراءة فقط، وتدقيق آلي، ولوحة مؤشرات، وتقرير HTML وCSV."},
  {en:"12 minutes for the self-assessment; a 60–90 minute team session for each study, then a short review when the context changes", ar:"12 دقيقة للتقييم الذاتي، وجلسة فريق من 60 إلى 90 دقيقة لكل دراسة، ثم مراجعة قصيرة عند تغير السياق"}),
 lessons: TI(12,0,"tools"''')
rep('const NEWS = [\n', '''const NEWS = [
  {k:"swot", d:"2026-10-17", t:{en:"New: the SWOT tool. A study serves a named decision, is run by a team with outside input, backs every top item with evidence, ranks each quadrant, and turns the top items into TOWS options, actions with an owner and a date, and risk entries for the 6.1 plan.", ar:"جديد: أداة SWOT. الدراسة تخدم قراراً محدداً، ويعدها فريق برأي خارجي، ولكل بند أعلى دليل، ويُرتب كل ربع، وتتحول البنود العليا إلى خيارات TOWS وإجراءات بمالك وموعد ومداخل خطر لخطة 6.1."}},
''')
rep('lessons:["iac",null],w8:["cockpit",null]};', 'lessons:["iac",null],swot:["iac",null],w8:["cockpit",null]};')
rep('["goal","kpi",{str:4,w8:2,exc:1,a3:1,dmaic:1}],', '["goal","kpi",{str:4,w8:2,exc:1,a3:1,dmaic:1,swot:1}],')
rep('["goal","risk",{iso31000:4,iso22301:2,w8:1,fmea:1}],', '["goal","risk",{iso31000:4,iso22301:2,w8:1,fmea:1,swot:1}],')
rep('["pain","kpis",{str:3}],', '["pain","kpis",{str:3,swot:1}],')
open(path, "w", encoding="utf-8").write(s)
print("index.html: SWOT linked (URL, system row, toolkit card, toolbox entry, knowledge topic, compliance note, dashboard adapter, home data)")
