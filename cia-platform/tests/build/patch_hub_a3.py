"""Step 2026-10-16 (A3 problem solving): link the A3 tool in the hub (index.html) from the start. Every anchor must match once.
    python3 tests/build/patch_hub_a3.py index.html
Then serve the platform folder and run tests/build/demo_a3.py, which fills DEMO_RES.a3 from the hub's own reading of the A3 example
(until then a placeholder with st "none" stands in)."""
import sys, os

HERE = os.path.dirname(os.path.abspath(__file__))
path = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, "..", "..", "index.html")
s = open(path, encoding="utf-8").read()
if 'a3:       "./modules/a3.html"' in s:
    print("A3 already linked; nothing to do"); sys.exit(0)


def rep(old, new):
    global s
    n = s.count(old)
    assert n == 1, (n, old[:100])
    s = s.replace(old, new)


# 1. URL
rep('  rca:      "./modules/rca.html"\n};', '  rca:      "./modules/rca.html",\n  a3:       "./modules/a3.html"\n};')
# 2. systems: Audit & Improvement row (after RCA)
rep('الأداة السادسة في صندوق أدوات التحسين"}}', '''الأداة السادسة في صندوق أدوات التحسين"}},
      {k:"a3",status:"live", name:{en:"A3 Problem Solving",ar:"حل المشكلات بأسلوب A3"}, note:{en:"The whole problem-solving story on one page, on the PDCA cycle · background tied to a measure · current condition from facts with a live chart · a measurable goal written before the causes · proved root causes picked from RCA, Fishbone or 5 Whys · countermeasures tied to causes and tested · plan with owners and dates · follow-up against the goal, then standardise · coach reviews through questions · live A3 page · seventh tool of the improvement toolbox", ar:"قصة حل المشكلة كاملة في صفحة واحدة على دورة PDCA · خلفية مرتبطة بمقياس · وضع حالي بالوقائع ورسم حي · هدف رقمي يُكتب قبل الأسباب · أسباب جذرية مثبتة من RCA أو عظمة السمكة أو لماذا الخمس · إجراءات مضادة مرتبطة بالأسباب ومختبرة · خطة بمسؤولين وتواريخ · متابعة مقابل الهدف ثم التوحيد · مراجعات الموجّه بالأسئلة · صفحة A3 حية · الأداة السابعة في صندوق أدوات التحسين"}}''')
# 3. toolkit card after RCA; PDCA's card text
rep('CAPA, 5 Whys, Fishbone, Pareto and root cause analysis are live, and A3 and the other toolbox tools follow", ar:"مثال تطبيقي بثلاث دورات لشركة سعودية افتراضية؛ وأدوات CAPA ولماذا الخمس وعظمة السمكة وباريتو وتحليل السبب الجذري متاحة، ويتبعها A3 وبقية أدوات الصندوق"}},',
    'CAPA, 5 Whys, Fishbone, Pareto, root cause analysis and A3 are live, and DMAIC and the other toolbox tools follow", ar:"مثال تطبيقي بثلاث دورات لشركة سعودية افتراضية؛ وأدوات CAPA ولماذا الخمس وعظمة السمكة وباريتو وتحليل السبب الجذري وA3 متاحة، ويتبعها DMAIC وبقية أدوات الصندوق"}},')
anchor = '\n  {k:"w8", color:"--c-ai", pre:"CIA", code:"Cockpit"'
assert s.count(anchor) == 1
s = s.replace(anchor, '''
  {k:"a3", color:"--c-aud", pre:"CIA", code:"A3", ed:{en:"Continual Improvement Toolbox · tool 7", ar:"صندوق أدوات التحسين المستمر · الأداة السابعة"},
   title:{en:"A3 Problem Solving", ar:"حل المشكلات بأسلوب A3"},
   feat:{en:["Plain-language method guide: the one-page limit as a discipline, one owner and a coach who asks, facts not adjectives, the goal before the causes, countermeasures tested, and A3 as a container for the toolbox","Clause guide on the ISO 9001:2026 clauses the method serves, from the PDCA cycle in the introduction (0.3.2) to objectives 6.2, analysis 9.1.3 and corrective action 10.2","Twelve-question self-assessment of your A3 practice, with a score for each stage","One A3 per problem in seven blocks on two halves: background with a measure, current condition with a live bar or run chart (or a Pareto analysis), a dated goal written before the analysis, proved root causes, countermeasures, plan and follow-up","Root causes picked read-only from RCA, Fishbone or 5 Whys by id with previews; countermeasures tied to a proved cause and tested; a flag on causes that name a person only; the result computed against the goal","Live A3 page (stacked on phones) in the report, coach reviews, starts from RCA, CAPA or Pareto (read-only preview), links to PDCA and CAPA, automatic audit, dashboard, HTML report and CSV"],
         ar:["دليل منهجية بلغة بسيطة: حد الصفحة الواحدة انضباط، ومالك واحد وموجّه يسأل، ووقائع لا صفات، والهدف قبل الأسباب، وإجراءات مختبرة، وA3 وعاء لأدوات الصندوق","دليل بنود ISO 9001:2026 التي تخدمها الطريقة، من دورة PDCA في المقدمة (0.3.2) إلى الأهداف 6.2 والتحليل 9.1.3 والإجراء التصحيحي 10.2","تقييم ذاتي من اثني عشر سؤالاً لممارسة A3، بنتيجة لكل مرحلة","صفحة A3 لكل مشكلة بسبع كتل في نصفين: خلفية بمقياس، ووضع حالي برسم حي بالأعمدة أو الخط الزمني (أو تحليل باريتو)، وهدف مؤرخ قبل التحليل، وأسباب جذرية مثبتة، وإجراءات مضادة، وخطة، ومتابعة","أسباب جذرية تُختار للقراءة فقط من RCA أو عظمة السمكة أو لماذا الخمس برقمها مع معاينة؛ وإجراءات مضادة مرتبطة بسبب مثبت ومختبرة؛ وتنبيه على الأسباب التي تشير إلى شخص فقط؛ ونتيجة محسوبة مقابل الهدف","صفحة A3 حية (متتابعة على الهاتف) في التقرير، ومراجعات الموجّه، والبدء من RCA أو CAPA أو باريتو بمعاينة للقراءة فقط، وروابط PDCA وCAPA، وتدقيق آلي، ولوحة مؤشرات، وتقرير HTML وCSV"]},
   extra:{en:"Worked example with three A3s for a fictitious Saudi company: rejected ready-mix concrete (from RCA RC-EX-01 and Pareto PA-EX-02, goal below 3%, follow-up at 6% so partly met, second cycle in PD-EX-03), lifting near misses with countermeasures tested on one tower first, and document control (CA-EX-03, goal met and standardised)", ar:"مثال تطبيقي بثلاث صفحات A3 لشركة سعودية افتراضية: رفض الخرسانة الجاهزة (من RCA ‏RC-EX-01 وباريتو PA-EX-02، الهدف أقل من 3%، والمتابعة 6% فتحقق جزئياً، والدورة الثانية في PD-EX-03)، والحوادث الوشيكة في الرفع بإجراءات جُرّبت في برج واحد أولاً، وضبط الوثائق (CA-EX-03، الهدف تحقق ووُحّد)"}},''' + anchor)
rep('pareto:"aud",rca:"aud",w8:"ai"};', 'pareto:"aud",rca:"aud",a3:"aud",w8:"ai"};')
# 4. grouped "coming soon" toolbox entry: 6 tools left
rep('''{k:"citbox", sys:"aud", pre:"CIA", code:"Toolbox", ed:{en:"7 tools · PDCA, CAPA, 5 Whys, Fishbone, Pareto and RCA are live", ar:"7 أدوات · وأدوات PDCA وCAPA ولماذا الخمس وعظمة السمكة وباريتو وتحليل السبب الجذري متاحة الآن"},
   name:{en:"Continual Improvement Toolbox: A3, DMAIC, FMEA and four more", ar:"صندوق أدوات التحسين المستمر: A3 وDMAIC وFMEA وأربع أدوات أخرى"},
   note:{en:"A3 problem solving, DMAIC, FMEA, lessons learned, SWOT, PESTLE and stakeholder analysis, built on the toolbox engine shared by PDCA, CAPA, 5 Whys, Fishbone, Pareto and RCA and linked to NCRs and audits.", ar:"حل المشكلات بأسلوب A3، وDMAIC، وFMEA، والدروس المستفادة، وSWOT، وPESTLE، وتحليل الأطراف المعنية، مبنية على محرك الصندوق المشترك بين PDCA وCAPA ولماذا الخمس وعظمة السمكة وباريتو وتحليل السبب الجذري ومربوطة بعدم المطابقة والتدقيق."}}''',
    '''{k:"citbox", sys:"aud", pre:"CIA", code:"Toolbox", ed:{en:"6 tools · PDCA, CAPA, 5 Whys, Fishbone, Pareto, RCA and A3 are live", ar:"6 أدوات · وأدوات PDCA وCAPA ولماذا الخمس وعظمة السمكة وباريتو وتحليل السبب الجذري وA3 متاحة الآن"},
   name:{en:"Continual Improvement Toolbox: DMAIC, FMEA and four more", ar:"صندوق أدوات التحسين المستمر: DMAIC وFMEA وأربع أدوات أخرى"},
   note:{en:"DMAIC, FMEA, lessons learned, SWOT, PESTLE and stakeholder analysis, built on the toolbox engine shared by PDCA, CAPA, 5 Whys, Fishbone, Pareto, RCA and A3 and linked to NCRs and audits.", ar:"DMAIC، وFMEA، والدروس المستفادة، وSWOT، وPESTLE، وتحليل الأطراف المعنية، مبنية على محرك الصندوق المشترك بين PDCA وCAPA ولماذا الخمس وعظمة السمكة وباريتو وتحليل السبب الجذري وA3 ومربوطة بعدم المطابقة والتدقيق."}}''')
# 5. knowledge centre topic (after RCA)
rep('rel:"RCA · ISO 9001 §10.2.1 b)", guide:{k:"rca",a:"explain-std"}},', '''rel:"RCA · ISO 9001 §10.2.1 b)", guide:{k:"rca",a:"explain-std"}},
  {en:["A3 problem solving: the one-page story","A3 is a problem-solving method, not a clause of any standard: the whole story on one page, read top to bottom — background, current condition from facts, a measurable goal, proved root causes, countermeasures tied to them, the plan, and the follow-up against the goal, then standardise or start again. It runs on the PDCA cycle that ISO 9001:2026 describes in its introduction (0.3.2), and serves objectives (6.2), analysis (9.1.3) and corrective action (10.2.1). The page limit is a discipline, not a format; one person owns the A3 and a coach reviews it through questions; the goal is set before the causes and not changed to fit the result; countermeasures are tested, not assumed; and the A3 uses Pareto, Fishbone, 5 Whys, RCA, PDCA and CAPA rather than replacing them."],
   ar:["حل المشكلات بأسلوب A3: القصة في صفحة واحدة","A3 طريقة لحل المشكلات، وليست بنداً في أي مواصفة: القصة كاملة في صفحة واحدة تُقرأ من أعلى إلى أسفل — الخلفية، والوضع الحالي بالوقائع، وهدف قابل للقياس، وأسباب جذرية مثبتة، وإجراءات مضادة مرتبطة بها، والخطة، والمتابعة مقابل الهدف، ثم التوحيد أو البدء من جديد. وتسير على دورة PDCA التي تصفها ISO 9001:2026 في مقدمتها (0.3.2)، وتخدم الأهداف (6.2) والتحليل (9.1.3) والإجراء التصحيحي (10.2.1). وحد الصفحة انضباط لا شكل، ويملكها شخص واحد ويراجعها موجّه بالأسئلة، ويُكتب الهدف قبل الأسباب ولا يُعدَّل ليناسب النتيجة، وتُختبر الإجراءات ولا تُفترض، وتستخدم باريتو وعظمة السمكة ولماذا الخمس وRCA وPDCA وCAPA ولا تحل محلها."], rel:"A3 · ISO 9001 §0.3.2 · §6.2", guide:{k:"a3",a:"explain-std"}},''')
# 6. compliance note
rep('''  {k:"oec", name:{en:"Operations Excellence Center",ar:"مركز التميّز التشغيلي"},
   note:{en:"Explanations are written independently''', '''  {k:"a3", name:{en:"A3 Problem Solving",ar:"حل المشكلات بأسلوب A3"},
   note:{en:"A3 is a problem-solving method, not a standard or a requirement. The guide summarises the ISO 9001:2026 clauses the method serves (the PDCA cycle in introduction 0.3.2, which sets no requirement, and 6.2, 7.1.6, 7.3, 9.1.3, 10.1 and 10.2 with Annex A.10.2) and ISO 9000:2026 terms and principles in independent wording; clause numbers and titles were checked against the official texts on 2026-10-16, any A3 or lean reference, ISO 10009 and ISO 10017 are not verified (not uploaded), and the standards' text remains copyright of ISO. The example A3s are illustrative, not real data.",
         ar:"A3 طريقة لحل المشكلات، وليست مواصفة ولا متطلباً. يلخص الدليل بنود ISO 9001:2026 التي تخدمها الطريقة (دورة PDCA في المقدمة 0.3.2، وهي لا تضع متطلبات، والبنود 6.2 و7.1.6 و7.3 و9.1.3 و10.1 و10.2 والملحق A.10.2) ومصطلحات ISO 9000:2026 ومبادئها بصياغة مستقلة، وقد تُحقق من أرقام البنود وعناوينها من النصوص الرسمية في 2026-10-16، وأي مرجع لمنهج A3 أو الإنتاج الرشيق وISO 10009 وISO 10017 غير متحقق منها (غير مرفوعة)، وحقوق نصوص المواصفات محفوظة لمنظمة ISO. صفحات المثال توضيحية وليست بيانات حقيقية."}},
  {k:"oec", name:{en:"Operations Excellence Center",ar:"مركز التميّز التشغيلي"},
   note:{en:"Explanations are written independently''')
# 7. performance dashboard: labels, breakdown title, adapter, registry
rep('  rcAs:B("RCA self-assessment","التقييم الذاتي لـ تحليل السبب الجذري"),',
    '  a3As:B("A3 self-assessment","التقييم الذاتي لـ A3"), a3Met:B("A3s whose goal is met or partly met on a follow-up","صفحات A3 التي تحقق هدفها كلياً أو جزئياً في المتابعة"), a3Tie:B("A3s with every countermeasure tied to a proved root cause","صفحات A3 التي ارتبطت كل إجراءاتها المضادة بسبب جذري مثبت"),\n  rcAs:B("RCA self-assessment","التقييم الذاتي لـ تحليل السبب الجذري"),')
rep('  rca:B("Open items by type (share of investigations)","البنود المفتوحة حسب النوع (نسبة من التحقيقات)"),',
    '  rca:B("Open items by type (share of investigations)","البنود المفتوحة حسب النوع (نسبة من التحقيقات)"),\n  a3:B("Open items by type (share of A3s)","البنود المفتوحة حسب النوع (نسبة من صفحات A3)"),')
rep('''/* ---------- registry ---------- */''', '''/* ---------- A3 — problem solving on one page (cia-a3:v1). Stage, goal rule, cause proof, ties and follow-up are the tool's own (modules/a3.html). ---------- */
function a3Ad(S){
  if(!S) return finish([],null,false);
  const Q=["OW1","OW2","PL1","PL2","PL3","AN1","AN2","DO1","DO2","CK1","CK2","CK3"], A=(S.assess&&typeof S.assess==="object")?S.assess:{};
  const R=(arr(S.records)||[]).filter(r=>r&&typeof r==="object");
  const ans=Q.filter(q=>num(A[q])!=null), pct=qs=>{ const s=qs.reduce((a,q)=>a+(num(A[q])||0),0); return s/(2*qs.length)*100; };
  const o=x=>(x&&typeof x==="object"&&!Array.isArray(x))?x:{}, tx=v=>String(v==null||typeof v==="object"?"":v).trim(), isD=d=>/^\\d{4}-\\d{2}-\\d{2}$/.test(String(d||""));
  const L2=v=>(Array.isArray(v)?v:[]).filter(x=>x&&typeof x==="object"), nv=v=>{ if(v===null||v===undefined||String(v).trim()==="") return null; const n=Number(v); return isFinite(n)?n:null; }, lw=v=>tx(v).toLowerCase().replace(/\\s+/g," ");
  const PERSON=/(خطأ\\s*(بشري|العامل|الموظف|الفني|المشغل|السائق|الشخص|الرافع|المشرف)|إهمال|اهمال|تقصير|عدم\\s*(انتباه|الانتباه|تركيز|التركيز)|سهو|لامبالاة|human\\s*error|operator\\s*error|worker\\s*error|staff\\s*error|employee\\s*error|rigger\\s*error|driver\\s*error|negligen|careless|inattent|not\\s*paying\\s*attention|lack\\s*of\\s*attention|complacen)/i;
  const read=r=>{ const b=o(r.bg), c=o(r.cur), g=o(r.goal), f=o(r.fu), own=lw(r.owner);
    const bgOk=!!(tx(b.why)&&tx(b.text)&&tx(b.measure));
    const pts=L2(c.pts).filter(p=>tx(p.l)&&nv(p.v)!==null).length, curOk=!!(tx(c.measure)&&nv(c.base)!==null&&tx(c.period)&&(pts>=2||!!tx(c.pareto))&&tx(c.gap));
    const from=nv(g.from), to=nv(g.to), orig=nv(g.orig), live=L2(r.causes).filter(x=>tx(x.t)&&x.st!=="out");
    const late=isD(g.date)&&isD(r.andate)&&g.date>r.andate, chg=orig!==null&&to!==null&&orig!==to&&!tx(g.why);
    const goalOk=!!(tx(g.measure)&&from!==null&&to!==null&&from!==to&&isD(g.by)&&isD(g.date))&&(live.length?(isD(r.andate)&&!late):!late)&&!chg;
    const P=live.filter(x=>x.st==="conf"&&!!tx(x.ev)), pids=P.map(x=>String(x.id)), pf=live.some(x=>PERSON.test(String(x.t)));
    const anOk=P.length>0&&!pf, M=L2(r.cms).filter(m=>tx(m.t));
    const untied=M.filter(m=>pids.indexOf(String(m.cause))<0).length, untested=M.filter(m=>!m.test||m.test==="no").length, untreat=P.filter(x=>!M.some(m=>String(m.cause)===String(x.id))).length;
    const cmOk=M.length>0&&!untied&&!untreat&&!untested&&M.every(m=>!!tx(m.eff));
    const PL=L2(r.plan), unpl=M.filter(m=>!PL.some(p=>String(p.cm)===String(m.id)&&tx(p.what)&&tx(p.who)&&isD(p.when))).length, planOk=M.length>0&&!unpl;
    const fuOk=!!(tx(f.measure)&&f.same===true&&isD(f.from)&&isD(f.to)&&f.from<=f.to&&nv(f.value)!==null&&["met","part","not"].includes(f.res));
    const revOk=L2(r.reviews).some(v=>isD(v.date)&&tx(v.by)&&lw(v.by)!==own&&(!isD(f.to)||v.date>=f.to));
    const steps=[bgOk,curOk,goalOk,anOk,cmOk,planOk,fuOk,revOk], ST=["draft","bg","cur","goal","an","cm","plan","fu","rev"]; let k=0; while(k<steps.length&&steps[k]) k++;
    return {st:ST[k], k, goalBad:late||chg, causeBad:pf||(k>=3&&!P.length), cmBad:untied>0||untested>0, planBad:k>=5&&unpl>0, wait:ST[k]==="plan"||ST[k]==="fu", met:fuOk&&(f.res==="met"||f.res==="part"), tie:M.length>0&&!untied}; };
  let met=0, tie=0, gb=0, cb=0, mb=0, pb=0, wt=0;
  R.forEach(r=>{ const x=read(r); if(x.met) met++; if(x.tie) tie++; if(x.goalBad) gb++; if(x.causeBad) cb++; if(x.cmBad) mb++; if(x.planBad) pb++; if(x.wait) wt++; });
  const m=[ M("a3As", ans.length? pct(Q) : null, "perf", ans.length? `${Math.round(pct(Q))}%` : ""),
            M("a3Met", R.length? share(met,R.length) : null, "perf", R.length? frac(met,R.length) : ""),
            M("a3Tie", R.length? share(tie,R.length) : null, "prog", R.length? frac(tie,R.length) : ""),
            M("an", ans.length? share(ans.length,Q.length) : null, "prog", frac(ans.length,Q.length)) ];
  const IT=[[B("Goal written after the analysis, or changed without a reason","هدف كُتب بعد التحليل أو عُدّل دون سبب"),gb,"#B42318"],[B("No proved root cause, or a cause that names a person","لا سبب جذري مثبت، أو سبب يشير إلى شخص"),cb,"#C2410C"],
            [B("Countermeasure not tied to a proved cause, or not tested","إجراء مضاد غير مرتبط بسبب مثبت أو لم يُختبر"),mb,"#B45309"],[B("Countermeasure without an owner and a date in the plan","إجراء مضاد دون مسؤول وتاريخ في الخطة"),pb,"#9A3412"],[B("Waiting for the follow-up or the coach's review","تنتظر المتابعة أو مراجعة الموجّه"),wt,"#C9821A"]];
  const bd = R.length ? {t:BDT.a3, items:IT.map(([l,n,col])=>({l, v:share(n,R.length), t:String(n), col}))} : null;
  return finish(m, bd, ans.length>0 || R.length>0);
}

/* ---------- registry ---------- */''')
rep('  {k:"rca",     sys:"aud", key:"cia-rca:v1", code:"RCA", n:B("Root cause analysis investigation","تحليل السبب الجذري — التحقيق"), f:rcaAd},',
    '  {k:"rca",     sys:"aud", key:"cia-rca:v1", code:"RCA", n:B("Root cause analysis investigation","تحليل السبب الجذري — التحقيق"), f:rcaAd},\n  {k:"a3",      sys:"aud", key:"cia-a3:v1", code:"A3", n:B("A3 problem solving","حل المشكلات بأسلوب A3"), f:a3Ad},')
rep('pdcaAd,capaAd,why5Ad,fishAd,paretoAd,rcaAd}};', 'pdcaAd,capaAd,why5Ad,fishAd,paretoAd,rcaAd,a3Ad}};')
rep('const DEMO_RES = {"rca": ', 'const DEMO_RES = {"a3": {"st": "none", "idx": null, "comp": null, "m": [], "bd": null}, "rca": ')
# 8. home page data: tool facts, news, request mapping, Advisor rules
rep(' w8: TI(0,7,"modreg"', ''' a3: TI(12,0,"tools",{en:"A3 sheet",ar:"صفحة A3"},["qhse","aud","exc"],["iso"],
  {en:"Puts the whole problem-solving story on one page — background, current condition in numbers, a dated goal, proved causes, countermeasures, plan and follow-up — owned by one person and reviewed by a coach.", ar:"تضع قصة حل المشكلة كاملة في صفحة واحدة — الخلفية، والوضع الحالي بالأرقام، وهدف مؤرخ، وأسباب مثبتة، وإجراءات مضادة، وخطة، ومتابعة — يملكها شخص واحد ويراجعها موجّه."},
  {en:"Without one clear page, improvement work turns into slides and meetings: the goal moves to fit the result, the actions are not tied to any cause, and nobody checks whether the number changed.", ar:"بلا صفحة واحدة واضحة، يتحول التحسين إلى عروض واجتماعات: يتحرك الهدف ليناسب النتيجة، ولا ترتبط الإجراءات بأي سبب، ولا يتحقق أحد هل تغيّر الرقم."},
  {en:"A 12-question self-assessment, seven blocks on two halves, a live current-condition chart, a goal rule, root causes picked from RCA, Fishbone or 5 Whys, countermeasures tied and tested, a computed result against the goal, coach reviews, a live A3 page, starts from RCA, CAPA or Pareto, an automatic audit, a dashboard, an HTML report and CSV.", ar:"تقييم ذاتي من 12 سؤالاً، وسبع كتل في نصفين، ورسم حي للوضع الحالي، وقاعدة للهدف، وأسباب جذرية من RCA أو عظمة السمكة أو لماذا الخمس، وإجراءات مضادة مرتبطة ومختبرة، ونتيجة محسوبة مقابل الهدف، ومراجعات الموجّه، وصفحة A3 حية، والبدء من RCA أو CAPA أو باريتو، وتدقيق آلي، ولوحة مؤشرات، وتقرير HTML وCSV."},
  {en:"12 minutes for the self-assessment; 60–90 minutes for a first A3, then updates as the work moves", ar:"12 دقيقة للتقييم الذاتي، و60–90 دقيقة لأول صفحة، ثم تحديثها مع سير العمل"}),
 w8: TI(0,7,"modreg"''')
rep('const NEWS = [\n', '''const NEWS = [
  {k:"a3", d:"2026-10-16", t:{en:"New: A3 problem solving — the whole story on one page: current condition in numbers, a goal written before the causes, proved root causes from RCA, Fishbone or 5 Whys, tested countermeasures, and the follow-up against the goal.", ar:"جديد: حل المشكلات بأسلوب A3 — القصة كاملة في صفحة واحدة: الوضع الحالي بالأرقام، وهدف يُكتب قبل الأسباب، وأسباب جذرية مثبتة من RCA أو عظمة السمكة أو لماذا الخمس، وإجراءات مضادة مختبرة، ومتابعة مقابل الهدف."}},
''')
rep('rca:["iac",null],w8:["cockpit",null]};', 'rca:["iac",null],a3:["iac",null],w8:["cockpit",null]};')
rep('["goal","audit",{aud:4,pdca:3,capa:3,why5:2,fish:2,pareto:2,rca:2,ims:1}],', '["goal","audit",{aud:4,pdca:3,capa:3,why5:2,fish:2,pareto:2,rca:2,a3:2,ims:1}],')
rep('["goal","kpi",{str:4,w8:2,exc:1}],', '["goal","kpi",{str:4,w8:2,exc:1,a3:1}],')
rep('["pain","repeat",{aud:2,pdca:2,capa:2,why5:3,fish:2,pareto:2,rca:2}],', '["pain","repeat",{aud:2,pdca:2,capa:2,why5:3,fish:2,pareto:2,rca:2,a3:1}],')
rep('["pain","view",{w8:3,pareto:1}],', '["pain","view",{w8:3,pareto:1,a3:1}],')
open(path, "w", encoding="utf-8").write(s)
print("index.html: A3 linked (URL, system row, toolkit card, toolbox entry, knowledge topic, compliance note, dashboard adapter, home data)")
