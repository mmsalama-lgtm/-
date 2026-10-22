"""Step 2026-10-16 (DMAIC improvement project): link the DMAIC tool in the hub (index.html) from the start. Every anchor must match once.
    python3 tests/build/patch_hub_dmaic.py index.html
Then serve the platform folder and run tests/build/demo_dmaic.py, which fills DEMO_RES.dmaic from the hub's own reading of the DMAIC
example (until then a placeholder with st "none" stands in)."""
import sys, os

HERE = os.path.dirname(os.path.abspath(__file__))
path = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, "..", "..", "index.html")
s = open(path, encoding="utf-8").read()
if 'dmaic:    "./modules/dmaic.html"' in s:
    print("DMAIC already linked; nothing to do"); sys.exit(0)


def rep(old, new):
    global s
    n = s.count(old)
    assert n == 1, (n, old[:100])
    s = s.replace(old, new)


# 1. URL
rep('  a3:       "./modules/a3.html"\n};', '  a3:       "./modules/a3.html",\n  dmaic:    "./modules/dmaic.html"\n};')
# 2. systems: Audit & Improvement row (after A3)
rep('صفحة A3 حية · الأداة السابعة في صندوق أدوات التحسين"}}', '''صفحة A3 حية · الأداة السابعة في صندوق أدوات التحسين"}},
      {k:"dmaic",status:"live", name:{en:"DMAIC Improvement Project",ar:"مشروع التحسين بمنهج DMAIC"}, note:{en:"A data-driven project for a problem whose cause is unknown · five phases, each closed by the sponsor's gate review through questions · charter with CTQs, SIPOC and a goal written before the analysis · operational definition and a measurement check before the baseline · baseline and after-change run charts with mean, median and defect rate · causes from Fishbone, 5 Whys or RCA proved or ruled out with a two-group data check · piloted solutions with the risks of the change · control plan with a reaction plan and the hand-over to the process owner · eighth tool of the improvement toolbox", ar:"مشروع قائم على البيانات لمشكلة سببها غير معروف · خمس مراحل تنتهي كل منها ببوابة يراجعها الراعي بالأسئلة · ميثاق بمتطلبات العميل الحرجة وSIPOC وهدف يُكتب قبل التحليل · تعريف تشغيلي للمقياس وتحقق من الثقة فيه قبل الأساس · رسمان تشغيليان للأساس وما بعد التغيير بالمتوسط والوسيط ونسبة العيوب · أسباب من عظمة السمكة أو لماذا الخمس أو RCA تُثبت أو تُستبعد بمقارنة مجموعتين · حلول مجرّبة مع مخاطر التغيير · خطة ضبط برد فعل وتسليم لمالك العملية · الأداة الثامنة في صندوق أدوات التحسين"}}''')
# 3. toolkit card after A3; PDCA's card text
rep('CAPA, 5 Whys, Fishbone, Pareto, root cause analysis and A3 are live, and DMAIC and the other toolbox tools follow", ar:"مثال تطبيقي بثلاث دورات لشركة سعودية افتراضية؛ وأدوات CAPA ولماذا الخمس وعظمة السمكة وباريتو وتحليل السبب الجذري وA3 متاحة، ويتبعها DMAIC وبقية أدوات الصندوق"}},',
    'CAPA, 5 Whys, Fishbone, Pareto, root cause analysis, A3 and DMAIC are live, and FMEA and the other toolbox tools follow", ar:"مثال تطبيقي بثلاث دورات لشركة سعودية افتراضية؛ وأدوات CAPA ولماذا الخمس وعظمة السمكة وباريتو وتحليل السبب الجذري وA3 وDMAIC متاحة، ويتبعها FMEA وبقية أدوات الصندوق"}},')
anchor = '\n  {k:"w8", color:"--c-ai", pre:"CIA", code:"Cockpit"'
assert s.count(anchor) == 1
s = s.replace(anchor, '''
  {k:"dmaic", color:"--c-aud", pre:"CIA", code:"DMAIC", ed:{en:"Continual Improvement Toolbox · tool 8", ar:"صندوق أدوات التحسين المستمر · الأداة الثامنة"},
   title:{en:"DMAIC Improvement Project", ar:"مشروع التحسين بمنهج DMAIC"},
   feat:{en:["Plain-language method guide: when DMAIC fits and when a known solution is just a project, the five phases and the sponsor's gates, trusting the measurement, proving causes with data, and DMAIC as a user of the toolbox","Clause guide on the ISO 9001:2026 clauses the method serves, from the PDCA cycle in the introduction (0.3.2) to objectives 6.2, measuring resources 7.1.5, analysis 9.1.3 and corrective action 10.2","Twelve-question self-assessment of your DMAIC practice, with a score for each phase","One project per problem in five phases with a gate each: charter with CTQs and SIPOC, a dated goal written before the analysis, operational definition and a measurement check before the baseline, baseline run chart with mean, median and defect rate","Causes picked read-only from Fishbone, 5 Whys or RCA by id, proved or ruled out with a two-group data check; solutions tied to proved causes and piloted; control plan with a reaction plan; after-change run chart and the result against the goal","Live phase map, hand-over to the process owner, starts from A3, RCA or Pareto (read-only preview), links to PDCA and CAPA, automatic audit, dashboard, HTML report with the charts and CSV"],
         ar:["دليل منهجية بلغة بسيطة: متى يناسب DMAIC ومتى يكون الحل المعروف مشروع تنفيذ فقط، والمراحل الخمس وبوابات الراعي، والثقة بالقياس، وإثبات الأسباب بالبيانات، وDMAIC مستخدماً لأدوات الصندوق","دليل بنود ISO 9001:2026 التي يخدمها المنهج، من دورة PDCA في المقدمة (0.3.2) إلى الأهداف 6.2 وموارد القياس 7.1.5 والتحليل 9.1.3 والإجراء التصحيحي 10.2","تقييم ذاتي من اثني عشر سؤالاً لممارسة DMAIC، بنتيجة لكل مرحلة","مشروع لكل مشكلة في خمس مراحل ببوابة لكل مرحلة: ميثاق بمتطلبات العميل الحرجة وSIPOC، وهدف مؤرخ قبل التحليل، وتعريف تشغيلي وتحقق من القياس قبل الأساس، ورسم تشغيلي للأساس بالمتوسط والوسيط ونسبة العيوب","أسباب تُختار للقراءة فقط من عظمة السمكة أو لماذا الخمس أو RCA برقمها، وتُثبت أو تُستبعد بمقارنة مجموعتين؛ وحلول مرتبطة بأسباب مثبتة ومجرّبة؛ وخطة ضبط برد فعل؛ ورسم ما بعد التغيير والنتيجة مقابل الهدف","خريطة مراحل حية، وتسليم لمالك العملية، والبدء من A3 أو RCA أو باريتو بمعاينة للقراءة فقط، وروابط PDCA وCAPA، وتدقيق آلي، ولوحة مؤشرات، وتقرير HTML بالرسوم وCSV"]},
   extra:{en:"Worked example with three projects for a fictitious Saudi company: the ready-mix loads still rejected after the A3 (from A3-EX-01 and Pareto PA-EX-02; baseline 6%, chilled-water cause proved by comparing loads, pilot on one plant, 2.4% after the change against a goal below 3%, control cycle PD-EX-03), rework hours in formwork and rebar (from PA-EX-03, still in Analyse, one cause ruled out by data), and overdue calibration (PD-EX-02, closed with the hand-over)", ar:"مثال تطبيقي بثلاثة مشاريع لشركة سعودية افتراضية: ما بقي من رفض شحنات الخرسانة بعد صفحة A3 (من A3-EX-01 وباريتو PA-EX-02؛ الأساس 6%، وإثبات سبب الماء المبرد بمقارنة الشحنات، وتجربة في محطة واحدة، و2.4% بعد التغيير مقابل هدف أقل من 3%، ودورة الضبط PD-EX-03)، وساعات إعادة العمل في القوالب والتسليح (من PA-EX-03، ما زال في التحليل وسبب استُبعد بالبيانات)، وتأخر المعايرة (PD-EX-02، أُغلق بالتسليم)"}},''' + anchor)
rep('pareto:"aud",rca:"aud",a3:"aud",w8:"ai"};', 'pareto:"aud",rca:"aud",a3:"aud",dmaic:"aud",w8:"ai"};')
# 4. grouped "coming soon" toolbox entry: 5 tools left
rep('''{k:"citbox", sys:"aud", pre:"CIA", code:"Toolbox", ed:{en:"6 tools · PDCA, CAPA, 5 Whys, Fishbone, Pareto, RCA and A3 are live", ar:"6 أدوات · وأدوات PDCA وCAPA ولماذا الخمس وعظمة السمكة وباريتو وتحليل السبب الجذري وA3 متاحة الآن"},
   name:{en:"Continual Improvement Toolbox: DMAIC, FMEA and four more", ar:"صندوق أدوات التحسين المستمر: DMAIC وFMEA وأربع أدوات أخرى"},
   note:{en:"DMAIC, FMEA, lessons learned, SWOT, PESTLE and stakeholder analysis, built on the toolbox engine shared by PDCA, CAPA, 5 Whys, Fishbone, Pareto, RCA and A3 and linked to NCRs and audits.", ar:"DMAIC، وFMEA، والدروس المستفادة، وSWOT، وPESTLE، وتحليل الأطراف المعنية، مبنية على محرك الصندوق المشترك بين PDCA وCAPA ولماذا الخمس وعظمة السمكة وباريتو وتحليل السبب الجذري وA3 ومربوطة بعدم المطابقة والتدقيق."}}''',
    '''{k:"citbox", sys:"aud", pre:"CIA", code:"Toolbox", ed:{en:"5 tools · PDCA, CAPA, 5 Whys, Fishbone, Pareto, RCA, A3 and DMAIC are live", ar:"5 أدوات · وأدوات PDCA وCAPA ولماذا الخمس وعظمة السمكة وباريتو وتحليل السبب الجذري وA3 وDMAIC متاحة الآن"},
   name:{en:"Continual Improvement Toolbox: FMEA and four more", ar:"صندوق أدوات التحسين المستمر: FMEA وأربع أدوات أخرى"},
   note:{en:"FMEA, lessons learned, SWOT, PESTLE and stakeholder analysis, built on the toolbox engine shared by PDCA, CAPA, 5 Whys, Fishbone, Pareto, RCA, A3 and DMAIC and linked to NCRs and audits.", ar:"FMEA، والدروس المستفادة، وSWOT، وPESTLE، وتحليل الأطراف المعنية، مبنية على محرك الصندوق المشترك بين PDCA وCAPA ولماذا الخمس وعظمة السمكة وباريتو وتحليل السبب الجذري وA3 وDMAIC ومربوطة بعدم المطابقة والتدقيق."}}''')
# 5. knowledge centre topic (after A3)
rep('rel:"A3 · ISO 9001 §0.3.2 · §6.2", guide:{k:"a3",a:"explain-std"}},', '''rel:"A3 · ISO 9001 §0.3.2 · §6.2", guide:{k:"a3",a:"explain-std"}},
  {en:["DMAIC: the data-driven improvement project","DMAIC (Define, Measure, Analyse, Improve, Control) is an improvement method, the Six Sigma improvement cycle, not a clause of any standard. It fits a problem whose cause is unknown and whose process can be measured; a known solution is an implementation project, not a DMAIC. The goal is written in Define, before the analysis, and is not moved; the measurement is checked before the baseline, because a measure that cannot be trusted makes every later phase unreliable; causes are proved with data, never by vote; solutions are piloted and the risks of the change checked; a control plan with a reaction plan holds the result and the project is handed over to the process owner. Each phase ends with a gate review by the sponsor, through questions. Statistics serve the decision and simple tools are usually enough. It serves ISO 9001:2026 objectives (6.2), measuring resources (7.1.5), analysis (9.1.3, whose note names statistical techniques) and corrective action (10.2.1), and uses Pareto, Fishbone, 5 Whys, RCA, A3, PDCA and CAPA rather than replacing them."],
   ar:["DMAIC: مشروع التحسين القائم على البيانات","DMAIC (التعريف، والقياس، والتحليل، والتحسين، والضبط) منهج للتحسين، هو دورة التحسين في Six Sigma، وليس بنداً في أي مواصفة. يناسب المشكلة التي لا يُعرف سببها وعمليتها قابلة للقياس؛ أما الحل المعروف فمشروع تنفيذ لا DMAIC. يُكتب الهدف في التعريف قبل التحليل ولا يُحرَّك، ويُتحقق من القياس قبل الأساس لأن المقياس الذي لا يُوثق به يجعل كل مرحلة بعده غير موثوقة، وتُثبت الأسباب بالبيانات لا بالتصويت، وتُجرَّب الحلول وتُفحص مخاطر التغيير، ثم تحفظ خطة ضبط برد فعل النتيجة ويُسلَّم المشروع لمالك العملية. وتنتهي كل مرحلة ببوابة يراجعها الراعي بالأسئلة. والإحصاء يخدم القرار، والأدوات البسيطة تكفي غالباً. ويخدم أهداف ISO 9001:2026 (6.2) وموارد القياس (7.1.5) والتحليل (9.1.3 وملاحظته عن التقنيات الإحصائية) والإجراء التصحيحي (10.2.1)، ويستخدم باريتو وعظمة السمكة ولماذا الخمس وRCA وA3 وPDCA وCAPA ولا يحل محلها."], rel:"DMAIC · ISO 9001 §7.1.5 · §9.1.3", guide:{k:"dmaic",a:"explain-std"}},''')
# 6. compliance note
rep('''  {k:"oec", name:{en:"Operations Excellence Center",ar:"مركز التميّز التشغيلي"},
   note:{en:"Explanations are written independently''', '''  {k:"dmaic", name:{en:"DMAIC Improvement Project",ar:"مشروع التحسين بمنهج DMAIC"},
   note:{en:"DMAIC is an improvement method (the Six Sigma improvement cycle), not a standard or a requirement. The guide summarises the ISO 9001:2026 clauses the method serves (the PDCA cycle in introduction 0.3.2, which sets no requirement, and 6.2, 7.1.5, 7.1.6, 8.5.1, 8.5.6, 9.1.1, 9.1.3, 10.1 and 10.2 with Annexes A.7.1.5 and A.10.2) and ISO 9000:2026 terms and principles in independent wording; clause numbers and titles were checked against the official texts on 2026-10-16, any Six Sigma reference, ISO 13053, ISO 7870 and ISO 10017 are not verified (not uploaded), and the standards' text remains copyright of ISO. The example projects are illustrative, not real data.",
         ar:"DMAIC منهج للتحسين (دورة التحسين في Six Sigma)، وليس مواصفة ولا متطلباً. يلخص الدليل بنود ISO 9001:2026 التي يخدمها المنهج (دورة PDCA في المقدمة 0.3.2، وهي لا تضع متطلبات، والبنود 6.2 و7.1.5 و7.1.6 و8.5.1 و8.5.6 و9.1.1 و9.1.3 و10.1 و10.2 والملحقان A.7.1.5 وA.10.2) ومصطلحات ISO 9000:2026 ومبادئها بصياغة مستقلة، وقد تُحقق من أرقام البنود وعناوينها من النصوص الرسمية في 2026-10-16، وأي مرجع لـ Six Sigma وISO 13053 وISO 7870 وISO 10017 غير متحقق منها (غير مرفوعة)، وحقوق نصوص المواصفات محفوظة لمنظمة ISO. مشاريع المثال توضيحية وليست بيانات حقيقية."}},
  {k:"oec", name:{en:"Operations Excellence Center",ar:"مركز التميّز التشغيلي"},
   note:{en:"Explanations are written independently''')
# 7. performance dashboard: labels, breakdown title, adapter, registry
rep('  a3As:B("A3 self-assessment","التقييم الذاتي لـ A3"),',
    '  dmAs:B("DMAIC self-assessment","التقييم الذاتي لـ DMAIC"), dmMet:B("DMAIC projects whose goal is met or partly met after the change","مشاريع DMAIC التي تحقق هدفها كلياً أو جزئياً بعد التغيير"), dmGate:B("DMAIC projects with every completed phase passed at its gate","مشاريع DMAIC التي اجتازت كل مرحلة مكتملة فيها بوابتها"),\n  a3As:B("A3 self-assessment","التقييم الذاتي لـ A3"),')
rep('  a3:B("Open items by type (share of A3s)","البنود المفتوحة حسب النوع (نسبة من صفحات A3)"),',
    '  a3:B("Open items by type (share of A3s)","البنود المفتوحة حسب النوع (نسبة من صفحات A3)"),\n  dmaic:B("Open items by type (share of projects)","البنود المفتوحة حسب النوع (نسبة من المشاريع)"),')
rep('''/* ---------- registry ---------- */''', '''/* ---------- DMAIC — data-driven improvement project (cia-dmaic:v1). Phase content, gates, measurement check, cause proof and the after-change
   result are the tool's own rules (modules/dmaic.html). ---------- */
function dmaicAd(S){
  if(!S) return finish([],null,false);
  const Q=["DF1","DF2","DF3","ME1","ME2","ME3","AN1","IM1","CT1","CT2","CT3","GT1"], A=(S.assess&&typeof S.assess==="object")?S.assess:{};
  const R=(arr(S.records)||[]).filter(r=>r&&typeof r==="object");
  const ans=Q.filter(q=>num(A[q])!=null), pct=qs=>{ const s=qs.reduce((a,q)=>a+(num(A[q])||0),0); return s/(2*qs.length)*100; };
  const o=x=>(x&&typeof x==="object"&&!Array.isArray(x))?x:{}, tx=v=>String(v==null||typeof v==="object"?"":v).trim(), isD=d=>/^\\d{4}-\\d{2}-\\d{2}$/.test(String(d||""));
  const L2=v=>(Array.isArray(v)?v:[]).filter(x=>x&&typeof x==="object"), nv=v=>{ if(v===null||v===undefined||String(v).trim()==="") return null; const n=Number(String(v).replace(/,/g,"")); return isFinite(n)?n:null; }, lw=v=>tx(v).toLowerCase().replace(/\\s+/g," ");
  const PERSON=/(خطأ\\s*(بشري|العامل|الموظف|الفني|المشغل|السائق|الشخص|الرافع|المشرف)|إهمال|اهمال|تقصير|عدم\\s*(انتباه|الانتباه|تركيز|التركيز)|سهو|لامبالاة|human\\s*error|operator\\s*error|worker\\s*error|staff\\s*error|employee\\s*error|rigger\\s*error|driver\\s*error|negligen|careless|inattent|not\\s*paying\\s*attention|lack\\s*of\\s*attention|complacen)/i;
  const PH=["D","M","A","I","C"];
  const read=r=>{ const d=o(r.def), sp=o(d.sip), g=o(r.goal), m=o(r.meas), ms=o(m.msa), an=o(r.an), c=o(r.ctl), G=o(r.gates), kind=m.kind==="meas"?"meas":"rate";
    const ser=list=>L2(list).filter(p=>tx(p.l)&&(kind==="rate"?(nv(p.n)!==null&&nv(p.n)>0&&nv(p.d)!==null&&nv(p.d)>=0&&nv(p.d)<=nv(p.n)):nv(p.v)!==null)).length;
    const lead=tx(r.lead), leadOk=!!lead&&!!tx(r.sponsor)&&lw(r.sponsor)!==lw(lead);
    const nst=L2(sp.steps).filter(x=>tx(x.t)).length, probOk=!!(tx(d.problem)&&tx(d.cost)&&L2(d.ctq).some(x=>tx(x.t)));
    const scopeOk=!!(tx(d.scin)&&tx(d.scout)&&tx(sp.s)&&tx(sp.i)&&tx(sp.o)&&tx(sp.c))&&nst>=5&&nst<=7;
    const from=nv(g.from), to=nv(g.to), orig=nv(g.orig), C=L2(an.causes).filter(x=>tx(x.t)&&x.st!=="out");
    const late=isD(g.date)&&isD(an.date)&&g.date>an.date, chg=orig!==null&&to!==null&&orig!==to&&!tx(g.why);
    const goalOk=!!(tx(g.measure)&&from!==null&&to!==null&&from!==to&&isD(g.by)&&isD(g.date))&&(C.length?(isD(an.date)&&!late):!late)&&!chg;
    const defOk=leadOk&&probOk&&scopeOk&&goalOk;
    const msaDone=!!(["grr","attr","ref","cal","other"].includes(ms.method)&&tx(ms.res)&&tx(ms.rule)&&["pass","part","fail"].includes(ms.verdict)&&isD(ms.date));
    const msaLate=isD(ms.date)&&isD(m.date)&&ms.date>m.date, msaFail=msaDone&&ms.verdict==="fail";
    const msaOk=!!(tx(m.what)&&tx(m.unit)&&tx(m.source)&&tx(m.sample))&&msaDone&&!msaFail&&isD(m.date)&&!msaLate;
    const measOk=msaOk&&!!tx(m.period)&&isD(m.date)&&(ser(m.pts)>=4||!!tx(m.pareto));
    const ck=x=>{ const k=o(x.chk), xa=nv(k.xa), na=nv(k.na), xb=nv(k.xb), nb=nv(k.nb);
      if(k.kind==="rate") return !!(tx(k.ga)&&tx(k.gb))&&na>0&&nb>0&&xa!==null&&xb!==null&&xa>=0&&xb>=0&&xa<=na&&xb<=nb;
      if(k.kind==="mean") return !!(tx(k.ga)&&tx(k.gb))&&na>=2&&nb>=2&&xa!==null&&xb!==null;
      if(k.kind==="link") return ["fish","why5","rca"].includes(x.how)&&!!tx(x.ref); return false; };
    const P=C.filter(x=>x.st==="conf"&&ck(x)), pids=P.map(x=>String(x.id)), pf=C.some(x=>PERSON.test(String(x.t)));
    const anOk=isD(an.date)&&P.length>0&&!pf;
    const SO=L2(o(r.imp).sols).filter(x=>tx(x.t)), pil=x=>isD(x.from)&&isD(x.to)&&x.from<=x.to&&nv(x.val)!==null&&!!tx(x.where);
    const untied=SO.filter(x=>!pids.includes(String(x.cause))).length, unpil=SO.filter(x=>!pil(x)).length;
    const impOk=SO.length>0&&!untied&&!unpil&&SO.every(x=>tx(x.risk)&&tx(x.ctrl)&&["roll","adapt","stop"].includes(x.dec))&&SO.some(x=>x.dec==="roll"||x.dec==="adapt");
    const CP=L2(c.plan).filter(x=>tx(x.m)), cpOk=CP.length>0&&CP.every(x=>tx(x.freq)&&tx(x.who)&&tx(x.react));
    const afterOk=!!(tx(c.measure)&&c.same===true&&isD(c.from)&&isD(c.to)&&c.from<=c.to&&ser(c.pts)>=4&&["met","part","not"].includes(c.res));
    const stdOk=!!tx(c.std)||(c.res==="not"&&!!tx(c.open)), handOk=!!tx(c.handTo)&&isD(c.hdate);
    const ctlOk=cpOk&&afterOk&&stdOk&&handOk;
    const OK={D:defOk,M:measOk,A:anOk,I:impOk,C:ctlOk};
    const gp=p=>{ const x=o(G[p]); return x.dec==="go"&&isD(x.date)&&!!tx(x.by)&&!!tx(x.q)&&!(lead&&lw(x.by)===lw(lead)); };
    const stopped=PH.some(p=>{ const x=o(G[p]); return x.dec==="stop"&&isD(x.date); });
    let k=0; while(k<PH.length&&OK[PH[k]]&&gp(PH[k])) k++;
    const done=PH.filter(p=>OK[p]);
    return {gates:done.length>0&&done.every(gp), met:afterOk&&(c.res==="met"||c.res==="part"),
      goalBad:late||chg, msaBad:k>=1&&!stopped&&(!msaDone||msaFail||msaLate), causeBad:pf||(k>=2&&!stopped&&!P.length), solBad:untied>0||unpil>0,
      wait:!stopped&&((k===4&&!(afterOk&&handOk))||(k<5&&OK[PH[k]]&&!gp(PH[k])))}; };
  let met=0, gt=0, gb=0, mb=0, cb=0, sb=0, wt=0;
  R.forEach(r=>{ const x=read(r); if(x.met) met++; if(x.gates) gt++; if(x.goalBad) gb++; if(x.msaBad) mb++; if(x.causeBad) cb++; if(x.solBad) sb++; if(x.wait) wt++; });
  const m=[ M("dmAs", ans.length? pct(Q) : null, "perf", ans.length? `${Math.round(pct(Q))}%` : ""),
            M("dmMet", R.length? share(met,R.length) : null, "perf", R.length? frac(met,R.length) : ""),
            M("dmGate", R.length? share(gt,R.length) : null, "prog", R.length? frac(gt,R.length) : ""),
            M("an", ans.length? share(ans.length,Q.length) : null, "prog", frac(ans.length,Q.length)) ];
  const IT=[[B("Goal written after the analysis, or moved without a reason","هدف كُتب بعد التحليل أو حُرّك دون سبب"),gb,"#B42318"],[B("Measurement not checked, not trusted or checked after the baseline","قياس لم يُتحقق منه أو لا يُوثق به أو تحقق بعد الأساس"),mb,"#3563C9"],
            [B("No cause proved with data, or a cause that names a person","لا سبب مثبت بالبيانات، أو سبب يشير إلى شخص"),cb,"#C2410C"],[B("Solution not tied to a proved cause, or not piloted","حل غير مرتبط بسبب مثبت أو لم يُجرَّب"),sb,"#B45309"],[B("Waiting for a gate review, after-change data or the hand-over","ينتظر بوابة أو بيانات ما بعد التغيير أو التسليم"),wt,"#C9821A"]];
  const bd = R.length ? {t:BDT.dmaic, items:IT.map(([l,n,col])=>({l, v:share(n,R.length), t:String(n), col}))} : null;
  return finish(m, bd, ans.length>0 || R.length>0);
}

/* ---------- registry ---------- */''')
rep('  {k:"a3",      sys:"aud", key:"cia-a3:v1", code:"A3", n:B("A3 problem solving","حل المشكلات بأسلوب A3"), f:a3Ad},',
    '  {k:"a3",      sys:"aud", key:"cia-a3:v1", code:"A3", n:B("A3 problem solving","حل المشكلات بأسلوب A3"), f:a3Ad},\n  {k:"dmaic",   sys:"aud", key:"cia-dmaic:v1", code:"DMAIC", n:B("DMAIC improvement project","مشروع التحسين بمنهج DMAIC"), f:dmaicAd},')
rep('pdcaAd,capaAd,why5Ad,fishAd,paretoAd,rcaAd,a3Ad}};', 'pdcaAd,capaAd,why5Ad,fishAd,paretoAd,rcaAd,a3Ad,dmaicAd}};')
rep('const DEMO_RES = {"a3": ', 'const DEMO_RES = {"dmaic": {"st": "none", "idx": null, "comp": null, "m": [], "bd": null}, "a3": ')
# 8. home page data: tool facts, news, request mapping, Advisor rules
rep(' w8: TI(0,7,"modreg"', ''' dmaic: TI(12,0,"tools",{en:"DMAIC project",ar:"مشروع DMAIC"},["qhse","aud","exc"],["iso"],
  {en:"Runs a data-driven improvement project for a problem whose cause is unknown: a charter and a dated goal, a measure you can trust, causes proved with data, piloted solutions and a control plan, with the sponsor's gate at the end of each phase.", ar:"تدير مشروع تحسين قائماً على البيانات لمشكلة سببها غير معروف: ميثاق وهدف مؤرخ، ومقياس يُوثق به، وأسباب مثبتة بالبيانات، وحلول مجرّبة، وخطة ضبط، مع بوابة الراعي في نهاية كل مرحلة."},
  {en:"Problems that survive quick fixes come back because the cause was guessed, the measure was never checked and the gain was never held. A project with gates, data and a hand-over keeps the result in place.", ar:"المشكلات التي تتجاوز الحلول السريعة تعود لأن السبب خُمّن، والمقياس لم يُتحقق منه، والمكسب لم يُحفظ. مشروع ببوابات وبيانات وتسليم يُبقي النتيجة في مكانها."},
  {en:"A 12-question self-assessment, five phases with a gate each, a live phase map, SIPOC, a measurement check before the baseline, baseline and after-change run charts with mean, median and defect rate, causes from Fishbone, 5 Whys or RCA with a two-group data check, piloted solutions, a control plan, starts from A3, RCA or Pareto, an automatic audit, a dashboard, an HTML report and CSV.", ar:"تقييم ذاتي من 12 سؤالاً، وخمس مراحل ببوابة لكل مرحلة، وخريطة مراحل حية، وSIPOC، وتحقق من القياس قبل الأساس، ورسمان تشغيليان للأساس وما بعد التغيير بالمتوسط والوسيط ونسبة العيوب، وأسباب من عظمة السمكة أو لماذا الخمس أو RCA بمقارنة مجموعتين، وحلول مجرّبة، وخطة ضبط، والبدء من A3 أو RCA أو باريتو، وتدقيق آلي، ولوحة مؤشرات، وتقرير HTML وCSV."},
  {en:"12 minutes for the self-assessment; 2–3 hours to set up a first project, then updates at each gate", ar:"12 دقيقة للتقييم الذاتي، وساعتان إلى ثلاث لإعداد أول مشروع، ثم تحديثه عند كل بوابة"}),
 w8: TI(0,7,"modreg"''')
rep('const NEWS = [\n', '''const NEWS = [
  {k:"dmaic", d:"2026-10-16", t:{en:"New: DMAIC improvement project — five phases with the sponsor's gate each, a measurement check before the baseline, causes proved with a two-group data check, piloted solutions, run charts before and after the change, and the hand-over to the process owner.", ar:"جديد: مشروع التحسين بمنهج DMAIC — خمس مراحل ببوابة للراعي في نهاية كل منها، وتحقق من القياس قبل الأساس، وأسباب تُثبت بمقارنة مجموعتين، وحلول مجرّبة، ورسمان تشغيليان قبل التغيير وبعده، وتسليم لمالك العملية."}},
''')
rep('rca:["iac",null],a3:["iac",null],w8:["cockpit",null]};', 'rca:["iac",null],a3:["iac",null],dmaic:["iac",null],w8:["cockpit",null]};')
rep('["goal","audit",{aud:4,pdca:3,capa:3,why5:2,fish:2,pareto:2,rca:2,a3:2,ims:1}],', '["goal","audit",{aud:4,pdca:3,capa:3,why5:2,fish:2,pareto:2,rca:2,a3:2,dmaic:1,ims:1}],')
rep('["goal","kpi",{str:4,w8:2,exc:1,a3:1}],', '["goal","kpi",{str:4,w8:2,exc:1,a3:1,dmaic:1}],')
rep('["pain","repeat",{aud:2,pdca:2,capa:2,why5:3,fish:2,pareto:2,rca:2,a3:1}],', '["pain","repeat",{aud:2,pdca:2,capa:2,why5:3,fish:2,pareto:2,rca:2,a3:1,dmaic:2}],')
rep('["pain","view",{w8:3,pareto:1,a3:1}],', '["pain","view",{w8:3,pareto:1,a3:1,dmaic:1}],')
open(path, "w", encoding="utf-8").write(s)
print("index.html: DMAIC linked (URL, system row, toolkit card, toolbox entry, knowledge topic, compliance note, dashboard adapter, home data)")
