"""Step 2026-10-15 (Root Cause Analysis): link the RCA tool in the hub (index.html) from the start. Every anchor must match once.
    python3 tests/build/patch_hub_rca.py index.html
Then serve the platform folder and run tests/build/demo_rca.py, which fills DEMO_RES.rca from the hub's own reading of the RCA
example (until then a placeholder with st "none" stands in). Also: Pareto's adapter accepts "rca" as a linked next step (the
Pareto tool now does), which changes nothing for data without that value."""
import sys, os

HERE = os.path.dirname(os.path.abspath(__file__))
path = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, "..", "..", "index.html")
s = open(path, encoding="utf-8").read()
if 'rca:      "./modules/rca.html"' in s:
    print("RCA already linked; nothing to do"); sys.exit(0)


def rep(old, new):
    global s
    n = s.count(old)
    assert n == 1, (n, old[:100])
    s = s.replace(old, new)


# 1. URL
rep('  pareto:   "./modules/pareto.html"\n};', '  pareto:   "./modules/pareto.html",\n  rca:      "./modules/rca.html"\n};')
# 2. systems: Audit & Improvement row (after Pareto)
rep('الأداة الخامسة في صندوق أدوات التحسين"}}', '''الأداة الخامسة في صندوق أدوات التحسين"}},
      {k:"rca",status:"live", name:{en:"Root Cause Analysis — Investigation",ar:"تحليل السبب الجذري — التحقيق"}, note:{en:"The problem in four parts with the requirement not met · depth set by severity × likelihood · timeline of facts and assumptions · evidence register · methods chosen from the toolbox (Pareto, Fishbone, 5 Whys, data, barrier analysis) · direct, contributing and root causes, each root cause tested · live cause tree · actions on confirmed causes with a criterion written first · sixth tool of the improvement toolbox", ar:"المشكلة بأجزائها الأربعة مع المتطلب الذي لم يُستوفَ · عمق يحدده الخطر (الخطورة × الاحتمال) · تسلسل أحداث يميّز الواقعة من الافتراض · سجل أدلة · طرق من صندوق الأدوات (باريتو وعظمة السمكة ولماذا الخمس والبيانات وتحليل الحواجز) · أسباب مباشرة ومساهمة وجذرية واختبار لكل سبب جذري · شجرة أسباب حية · إجراءات على أسباب مؤكدة بمعيار يُكتب قبل التنفيذ · الأداة السادسة في صندوق أدوات التحسين"}}''')
# 3. toolkit card after Pareto; PDCA's card no longer says root cause analysis is still to come
rep('extra:{en:"Worked example with three cycles for a fictitious Saudi company; CAPA, 5 Whys, Fishbone and Pareto are live, and root cause analysis and the other toolbox tools follow", ar:"مثال تطبيقي بثلاث دورات لشركة سعودية افتراضية؛ وأدوات CAPA ولماذا الخمس وعظمة السمكة وباريتو متاحة، ويتبعها تحليل السبب الجذري وبقية أدوات الصندوق"}},',
    'extra:{en:"Worked example with three cycles for a fictitious Saudi company; CAPA, 5 Whys, Fishbone, Pareto and root cause analysis are live, and A3 and the other toolbox tools follow", ar:"مثال تطبيقي بثلاث دورات لشركة سعودية افتراضية؛ وأدوات CAPA ولماذا الخمس وعظمة السمكة وباريتو وتحليل السبب الجذري متاحة، ويتبعها A3 وبقية أدوات الصندوق"}},')
i = s.find('  {k:"pareto", color:"--c-aud", pre:"CIA", code:"Pareto"'); assert i > 0 and s.count('  {k:"pareto", color:"--c-aud", pre:"CIA", code:"Pareto"') == 1
j = s.find('\n  {k:"w8", color:"--c-ai"', i); assert j > i
s = s[:j] + '''
  {k:"rca", color:"--c-aud", pre:"CIA", code:"RCA", ed:{en:"Continual Improvement Toolbox · tool 6", ar:"صندوق أدوات التحسين المستمر · الأداة السادسة"},
   title:{en:"Root Cause Analysis — Investigation", ar:"تحليل السبب الجذري — التحقيق"},
   feat:{en:["Plain-language method guide: more than one root cause, contributing causes, “human error” as a starting point, a root cause as a hypothesis until tested, and depth by risk","Clause guide on the ISO 9001:2026 clauses the investigation serves, starting with 10.2.1 b) 2) and 3) and Annex A.10.2","Twelve-question self-assessment of your investigation practice, with a score for each stage","One investigation per problem: the problem in four parts with the requirement, a severity × likelihood grid that sets the depth, a timeline that tells facts from assumptions, an evidence register and the team","Methods chosen from the toolbox and linked by id (Pareto, Fishbone, 5 Whys), with data analysis and barrier/change analysis done in the tool; direct, contributing and root causes with evidence, status and the removal test; a flag on causes that name a person only","Live cause tree (an indented list on phones), similar cases, actions with owners on confirmed root causes, a criterion written before the action, starts from CAPA records or Pareto categories (read-only preview), automatic audit, dashboard, HTML report and CSV"],
         ar:["دليل منهجية بلغة بسيطة: أكثر من سبب جذري، والأسباب المساهمة، و«الخطأ البشري» نقطة بداية، والسبب الجذري فرضية حتى يُختبر، والعمق بحسب الخطر","دليل بنود ISO 9001:2026 التي يخدمها التحقيق، وأولها 10.2.1 ب) 2) و3) والملحق A.10.2","تقييم ذاتي من اثني عشر سؤالاً لممارسة التحقيق، بنتيجة لكل مرحلة","تحقيق لكل مشكلة: المشكلة بأجزائها الأربعة مع المتطلب، وشبكة الخطورة × الاحتمال تحدد العمق، وتسلسل أحداث يميّز الواقعة من الافتراض، وسجل أدلة، والفريق","طرق من صندوق الأدوات مربوطة بأرقامها (باريتو وعظمة السمكة ولماذا الخمس)، مع تحليل بالبيانات وتحليل للحواجز والتغييرات داخل الأداة؛ وأسباب مباشرة ومساهمة وجذرية بدليل وحالة واختبار إزالة؛ وتنبيه على الأسباب التي تشير إلى شخص فقط","شجرة أسباب حية (قائمة متدرجة على الهاتف)، والحالات المشابهة، وإجراءات بمالكين على أسباب مؤكدة، ومعيار يُكتب قبل التنفيذ، والبدء من سجلات CAPA أو فئات باريتو بمعاينة للقراءة فقط، وتدقيق آلي، ولوحة مؤشرات، وتقرير HTML وCSV"]},
   extra:{en:"Worked example with three investigations for a fictitious Saudi company: rejected ready-mix concrete (CA-EX-04, from Pareto PA-EX-02, with Fishbone FB-EX-02 and 5 Whys W5-EX-03, two root causes), a dropped-load near miss at full depth with a barrier analysis, and a light investigation of superseded drawings (CA-EX-03)", ar:"مثال تطبيقي بثلاثة تحقيقات لشركة سعودية افتراضية: رفض الخرسانة الجاهزة (CA-EX-04، من باريتو PA-EX-02، بعظمة السمكة FB-EX-02 ولماذا الخمس W5-EX-03، وسببين جذريين)، وحادث وشيك لسقوط حمولة بعمق كامل وتحليل للحواجز، وتحقيق خفيف في المخططات الملغاة (CA-EX-03)"}},''' + s[j:]
rep('capa:"aud",why5:"aud",fish:"aud",pareto:"aud",w8:"ai"};', 'capa:"aud",why5:"aud",fish:"aud",pareto:"aud",rca:"aud",w8:"ai"};')
# 4. grouped "coming soon" toolbox entry: 7 tools left
rep('''{k:"citbox", sys:"aud", pre:"CIA", code:"Toolbox", ed:{en:"8 tools · PDCA, CAPA, 5 Whys, Fishbone and Pareto are live", ar:"8 أدوات · وأدوات PDCA وCAPA ولماذا الخمس وعظمة السمكة وباريتو متاحة الآن"},
   name:{en:"Continual Improvement Toolbox: root cause analysis, A3, DMAIC and five more", ar:"صندوق أدوات التحسين المستمر: تحليل السبب الجذري وA3 وDMAIC وخمس أدوات أخرى"},
   note:{en:"Root cause analysis, A3, DMAIC, FMEA, lessons learned, SWOT, PESTLE and stakeholder analysis, built on the toolbox engine shared by PDCA, CAPA, 5 Whys, Fishbone and Pareto and linked to NCRs and audits.", ar:"تحليل السبب الجذري، وA3، وDMAIC، وFMEA، والدروس المستفادة، وSWOT، وPESTLE، وتحليل الأطراف المعنية، مبنية على محرك الصندوق المشترك بين PDCA وCAPA ولماذا الخمس وعظمة السمكة وباريتو ومربوطة بعدم المطابقة والتدقيق."}}''',
    '''{k:"citbox", sys:"aud", pre:"CIA", code:"Toolbox", ed:{en:"7 tools · PDCA, CAPA, 5 Whys, Fishbone, Pareto and RCA are live", ar:"7 أدوات · وأدوات PDCA وCAPA ولماذا الخمس وعظمة السمكة وباريتو وتحليل السبب الجذري متاحة الآن"},
   name:{en:"Continual Improvement Toolbox: A3, DMAIC, FMEA and four more", ar:"صندوق أدوات التحسين المستمر: A3 وDMAIC وFMEA وأربع أدوات أخرى"},
   note:{en:"A3 problem solving, DMAIC, FMEA, lessons learned, SWOT, PESTLE and stakeholder analysis, built on the toolbox engine shared by PDCA, CAPA, 5 Whys, Fishbone, Pareto and RCA and linked to NCRs and audits.", ar:"حل المشكلات بأسلوب A3، وDMAIC، وFMEA، والدروس المستفادة، وSWOT، وPESTLE، وتحليل الأطراف المعنية، مبنية على محرك الصندوق المشترك بين PDCA وCAPA ولماذا الخمس وعظمة السمكة وباريتو وتحليل السبب الجذري ومربوطة بعدم المطابقة والتدقيق."}}''')
# 5. knowledge centre topic (after Pareto)
rep('rel:"Pareto · ISO 9001 §9.1.3", guide:{k:"pareto",a:"explain-std"}},', '''rel:"Pareto · ISO 9001 §9.1.3", guide:{k:"pareto",a:"explain-std"}},
  {en:["Root cause analysis: the investigation","Root cause analysis is a discipline that combines methods, not a clause of any standard: the investigation that turns a problem into a cause the organization can change and has proved. It serves ISO 9001:2026 clause 10.2.1 b) 2) and 3) (determining the causes and whether similar nonconformities exist or could occur), and Annex A.10.2 leaves the extent of investigation and the methods to the organization. ISO 9000:2026 does not define “root cause”; it names root cause investigation among the benefits of the improvement principle (4.2.6). A problem often has more than one root cause; “human error” is a starting point, not a root cause; a root cause is a hypothesis until evidence and a test confirm it; depth follows risk; and the investigation chooses among Pareto, Fishbone, 5 Whys and data rather than replacing them."],
   ar:["تحليل السبب الجذري: التحقيق","تحليل السبب الجذري منهجية تجمع عدة طرق، وليس بنداً في أي مواصفة: هو التحقيق الذي يحوّل المشكلة إلى سبب تستطيع المنشأة تغييره وأثبتت صحته. يخدم البند 10.2.1 ب) 2) و3) من ISO 9001:2026 (تحديد الأسباب، وهل توجد حالات مشابهة أو قد تحدث)، ويترك الملحق A.10.2 مدى التحقيق والطرق للمنشأة. ولا تعرّف ISO 9000:2026 «السبب الجذري»، لكنها تذكر التحقيق فيه ضمن فوائد مبدأ التحسين (4.2.6). وللمشكلة غالباً أكثر من سبب جذري، و«الخطأ البشري» نقطة بداية لا سبب جذري، والسبب الجذري فرضية حتى يثبتها الدليل والاختبار، والعمق يتبع الخطر، والتحقيق يختار من باريتو وعظمة السمكة ولماذا الخمس والبيانات ولا يحل محلها."], rel:"RCA · ISO 9001 §10.2.1 b)", guide:{k:"rca",a:"explain-std"}},''')
# 6. compliance note (after Pareto)
rep('''  {k:"oec", name:{en:"Operations Excellence Center",ar:"مركز التميّز التشغيلي"},
   note:{en:"Explanations are written independently''', '''  {k:"rca", name:{en:"Root Cause Analysis — Investigation",ar:"تحليل السبب الجذري — التحقيق"},
   note:{en:"Root cause analysis is a discipline that combines methods, not a standard or a requirement, and ISO 9000:2026 does not define “root cause” as a term. The guide summarises the ISO 9001:2026 clauses the investigation serves (10.2.1 b) and Annex A.10.2, and the clauses it works with) and ISO 9000:2026 terms and principles in independent wording; clause numbers and titles were checked against the official texts on 2026-10-15, ISO 10009, ISO 10017 and IEC 62740 are not verified (not uploaded), and the standards' text remains copyright of ISO. The example investigations are illustrative, not real data.",
         ar:"تحليل السبب الجذري منهجية تجمع عدة طرق، وليس مواصفة ولا متطلباً، ولا تعرّف ISO 9000:2026 «السبب الجذري» مصطلحاً. يلخص الدليل بنود ISO 9001:2026 التي يخدمها التحقيق (10.2.1 ب) والملحق A.10.2 والبنود التي يعمل معها) ومصطلحات ISO 9000:2026 ومبادئها بصياغة مستقلة، وقد تُحقق من أرقام البنود وعناوينها من النصوص الرسمية في 2026-10-15، وISO 10009 وISO 10017 وIEC 62740 غير متحقق منها (غير مرفوعة)، وحقوق نصوص المواصفات محفوظة لمنظمة ISO. تحقيقات المثال توضيحية وليست بيانات حقيقية."}},
  {k:"oec", name:{en:"Operations Excellence Center",ar:"مركز التميّز التشغيلي"},
   note:{en:"Explanations are written independently''')
# 7. performance dashboard: labels, breakdown title, adapter, registry; Pareto's adapter accepts "rca" as a linked step
rep('  paAs:B("Pareto self-assessment","التقييم الذاتي لـ باريتو"),',
    '  rcAs:B("RCA self-assessment","التقييم الذاتي لـ تحليل السبب الجذري"), rcRo:B("Investigations whose root causes are all confirmed and tested","التحقيقات التي تأكدت كل أسبابها الجذرية واختُبرت"), rcCr:B("Investigations with an effectiveness criterion written before the action","التحقيقات التي كُتب معيار فعاليتها قبل التنفيذ"),\n  paAs:B("Pareto self-assessment","التقييم الذاتي لـ باريتو"),')
rep('  pareto:B("Open items by type (share of analyses)","البنود المفتوحة حسب النوع (نسبة من التحليلات)"),',
    '  pareto:B("Open items by type (share of analyses)","البنود المفتوحة حسب النوع (نسبة من التحليلات)"),\n  rca:B("Open items by type (share of investigations)","البنود المفتوحة حسب النوع (نسبة من التحقيقات)"),')
rep('''  const linked=x=>{ const n=o(x.c.nx); return ["fish","why5","capa"].includes(n.how)&&!!tx(n.ref); };''',
    '''  const linked=x=>{ const n=o(x.c.nx); return ["fish","why5","capa","rca"].includes(n.how)&&!!tx(n.ref); };''')
rep('''/* ---------- registry ---------- */''', '''/* ---------- RCA — Root cause analysis investigation (cia-rca:v1). Depth rule, methods, cause tests and stage are the tool's own (modules/rca.html). ---------- */
function rcaAd(S){
  if(!S) return finish([],null,false);
  const Q=["PS1","PS2","EV1","EV2","AN1","AN2","AN3","VR1","VR2","AC1","AC2","AC3"], A=(S.assess&&typeof S.assess==="object")?S.assess:{};
  const R=(arr(S.records)||[]).filter(r=>r&&typeof r==="object");
  const ans=Q.filter(q=>num(A[q])!=null), pct=qs=>{ const s=qs.reduce((a,q)=>a+(num(A[q])||0),0); return s/(2*qs.length)*100; };
  const o=x=>(x&&typeof x==="object"&&!Array.isArray(x))?x:{}, tx=v=>String(v==null||typeof v==="object"?"":v).trim(), isD=d=>/^\\d{4}-\\d{2}-\\d{2}$/.test(String(d||""));
  const L2=v=>(Array.isArray(v)?v:[]).filter(x=>x&&typeof x==="object"), D=["light","std","full"];
  const PERSON=/(خطأ\\s*(بشري|العامل|الموظف|الفني|المشغل|السائق|الشخص|الرافع|المشرف)|إهمال|اهمال|تقصير|عدم\\s*(انتباه|الانتباه|تركيز|التركيز)|سهو|لامبالاة|human\\s*error|operator\\s*error|worker\\s*error|staff\\s*error|employee\\s*error|rigger\\s*error|driver\\s*error|negligen|careless|inattent|not\\s*paying\\s*attention|lack\\s*of\\s*attention|complacen)/i;
  /* the tool's rules: depth from severity × likelihood, methods enough for the depth, every root cause confirmed, with evidence and the removal test */
  const read=r=>{ const p=o(r.prob), k=o(r.risk), cr=o(r.crit), rv=o(r.review), sev=parseInt(k.sev,10)||0, lik=parseInt(k.lik,10)||0;
    const q=(!sev||!lik)?"":((sev===5||sev*lik>=15)?"full":((sev===4||sev*lik>=6)?"std":"light")), dep=D.includes(r.depth)?r.depth:q, low=!!q&&D.includes(r.depth)&&D.indexOf(r.depth)<D.indexOf(q);
    const probOk=["what","where","when","much","req"].every(f=>!!tx(p[f])), depthOk=!!q&&(!low||!!tx(r.depthWhy));
    const facts=L2(r.tl).filter(x=>x.kind!=="asm"&&tx(x.ev)&&tx(x.src)).length, ev=L2(r.evid).filter(x=>tx(x.item)).length;
    const C=L2(r.causes).filter(c=>tx(c.t)&&c.st!=="out"), dir=C.filter(c=>c.lvl!=="contrib"&&c.lvl!=="root"), RT=C.filter(c=>c.lvl==="root");
    const nd=v=>{ const n=Number(v); return (v!==null&&v!==""&&isFinite(n))?n:null; };
    const dat=L2(r.data).filter(x=>{ const n=nd(x.n), kk=nd(x.k); return tx(x.g)&&n!==null&&n>0&&kk!==null&&kk>=0&&kk<=n; }).length, bar=L2(r.barrier).filter(x=>tx(x.b)&&!!x.res).length;
    const seen={}, M2=L2(r.methods).filter(m=>{ const ok=m.how==="data"?dat>0:(m.how==="barrier"?bar>0:(["pareto","fish","why5"].includes(m.how)&&!!tx(m.ref))); const kk=m.how+"|"+(m.how==="data"||m.how==="barrier"?"":tx(m.ref)); if(!ok||seen[kk]) return false; seen[kk]=1; return true; });
    const methOk=M2.length>=(dep==="full"?2:(dep==="std"?1:0))&&(dep!=="full"||M2.some(m=>m.how==="data"||m.how==="pareto"));
    const rootOk=c=>c.st==="conf"&&!!tx(c.ev)&&(c.test==="yes"||c.test==="part");
    const rootsOk=RT.length>0&&RT.every(rootOk)&&!RT.some(c=>PERSON.test(String(c.t)));
    const acts=L2(r.acts), noAct=RT.filter(c=>!acts.some(x=>x.cause===c.id&&tx(x.t)&&tx(x.owner))).length;
    const critOk=!!(tx(cr.what)&&tx(cr.where)&&tx(cr.period)&&isD(cr.date)&&cr.before===true);
    let st="problem"; if(probOk&&depthOk&&facts>=2&&ev>=1){ st="evidence"; if(dir.length&&RT.length){ st="causes"; if(rootsOk&&methOk){ st="root"; if(noAct===0&&critOk){ st="actions"; if(tx(rv.by)&&isD(rv.date)) st="reviewed"; } } } }
    return {st, q, low:low&&!tx(r.depthWhy), methOk, RT, rootsOk, un:RT.length>0&&!RT.every(rootOk), pf:C.some(c=>PERSON.test(String(c.t))), noAct, critOk}; };
  let ro=0, cr=0, un=0, pf=0, md=0, na=0, wt=0;
  R.forEach(r=>{ const x=read(r), past=["evidence","causes","root","actions","reviewed"].includes(x.st);
    if(x.rootsOk) ro++; if(x.critOk) cr++; if(x.un) un++; if(x.pf) pf++;
    if(x.low||(past&&x.q&&!x.methOk)) md++; if(x.RT.length&&x.noAct) na++; if(x.st==="actions") wt++; });
  const m=[ M("rcAs", ans.length? pct(Q) : null, "perf", ans.length? `${Math.round(pct(Q))}%` : ""),
            M("rcRo", R.length? share(ro,R.length) : null, "perf", R.length? frac(ro,R.length) : ""),
            M("rcCr", R.length? share(cr,R.length) : null, "prog", R.length? frac(cr,R.length) : ""),
            M("an", ans.length? share(ans.length,Q.length) : null, "prog", frac(ans.length,Q.length)) ];
  const IT=[[B("Root cause not confirmed or not tested","سبب جذري لم يتأكد أو لم يُختبر"),un,"#C2410C"],[B("Cause that names a person only","سبب يشير إلى شخص فقط"),pf,"#B42318"],
            [B("Depth lowered without a reason, or methods short of it","عمق مخفوض دون سبب، أو طرق أقل منه"),md,"#B45309"],[B("Root cause without an action and owner","سبب جذري دون إجراء ومالك"),na,"#9A3412"],[B("Waiting for independent review","تنتظر مراجعة مستقلة"),wt,"#C9821A"]];
  const bd = R.length ? {t:BDT.rca, items:IT.map(([l,n,col])=>({l, v:share(n,R.length), t:String(n), col}))} : null;
  return finish(m, bd, ans.length>0 || R.length>0);
}

/* ---------- registry ---------- */''')
rep('  {k:"pareto",  sys:"aud", key:"cia-pareto:v1", code:"Pareto", n:B("Pareto vital few analysis","باريتو — تحليل القلة الحيوية"), f:paretoAd},',
    '  {k:"pareto",  sys:"aud", key:"cia-pareto:v1", code:"Pareto", n:B("Pareto vital few analysis","باريتو — تحليل القلة الحيوية"), f:paretoAd},\n  {k:"rca",     sys:"aud", key:"cia-rca:v1", code:"RCA", n:B("Root cause analysis investigation","تحليل السبب الجذري — التحقيق"), f:rcaAd},')
rep('pdcaAd,capaAd,why5Ad,fishAd,paretoAd}};', 'pdcaAd,capaAd,why5Ad,fishAd,paretoAd,rcaAd}};')
rep('const DEMO_RES = {"pareto": ', 'const DEMO_RES = {"rca": {"st": "none", "idx": null, "comp": null, "m": [], "bd": null}, "pareto": ')
# 8. home page data: tool facts, news, request mapping, Advisor rules
rep(' w8: TI(0,7,"modreg"', ''' rca: TI(12,0,"tools",{en:"RCA investigation",ar:"تحقيق RCA"},["qhse","aud"],["iso"],
  {en:"Runs a root cause investigation from the problem to a cause the organization can change and has proved, at a depth set by risk, and builds the corrective action on it with a criterion written first.", ar:"تدير التحقيق في السبب الجذري من المشكلة إلى سبب تستطيع المنشأة تغييره وأثبتت صحته، بعمق يحدده الخطر، وتبني الإجراء التصحيحي عليه بمعيار يُكتب أولاً."},
  {en:"Without a real investigation, “human error” and the first plausible cause get written down, the action treats the symptom, and the same nonconformity comes back.", ar:"بلا تحقيق حقيقي، يُكتب «الخطأ البشري» أو أول سبب مقنع، فيعالج الإجراء العَرَض، ويعود عدم المطابقة نفسه."},
  {en:"A 12-question self-assessment, a severity × likelihood grid for depth, a timeline and evidence register, methods linked to Pareto, Fishbone and 5 Whys, data and barrier analysis, causes in three levels with tests, a live cause tree, starts from CAPA or Pareto, an automatic audit, a dashboard, an HTML report and CSV.", ar:"تقييم ذاتي من 12 سؤالاً، وشبكة الخطورة × الاحتمال للعمق، وتسلسل أحداث وسجل أدلة، وطرق مربوطة بباريتو وعظمة السمكة ولماذا الخمس، وتحليل بالبيانات وللحواجز، وأسباب بثلاثة مستويات مع اختباراتها، وشجرة أسباب حية، والبدء من CAPA أو باريتو، وتدقيق آلي، ولوحة مؤشرات، وتقرير HTML وCSV."},
  {en:"12 minutes for the self-assessment; 45–90 minutes per investigation, by depth", ar:"12 دقيقة للتقييم الذاتي، و45–90 دقيقة لكل تحقيق بحسب عمقه"}),
 w8: TI(0,7,"modreg"''')
rep('const NEWS = [\n', '''const NEWS = [
  {k:"rca", d:"2026-10-15", t:{en:"New: Root cause analysis — the full investigation: depth by risk, timeline and evidence, methods from the toolbox, direct, contributing and root causes with tests, a live cause tree, and actions on confirmed causes.", ar:"جديد: تحليل السبب الجذري — التحقيق كاملاً: عمق بحسب الخطر، وتسلسل أحداث وأدلة، وطرق من صندوق الأدوات، وأسباب مباشرة ومساهمة وجذرية مع اختباراتها، وشجرة أسباب حية، وإجراءات على أسباب مؤكدة."}},
''')
rep('fish:["iac",null],pareto:["iac",null],w8:["cockpit",null]};', 'fish:["iac",null],pareto:["iac",null],rca:["iac",null],w8:["cockpit",null]};')
rep('["goal","audit",{aud:4,pdca:3,capa:3,why5:2,fish:2,pareto:2,ims:1}],', '["goal","audit",{aud:4,pdca:3,capa:3,why5:2,fish:2,pareto:2,rca:2,ims:1}],')
rep('["pain","repeat",{aud:2,pdca:2,capa:2,why5:3,fish:2,pareto:2}],', '["pain","repeat",{aud:2,pdca:2,capa:2,why5:3,fish:2,pareto:2,rca:2}],')
rep('["sector","ene",{iso45001:2,iso14001:1,oec:2,iso9001:1,iso22301:1}],', '["sector","ene",{iso45001:2,iso14001:1,oec:2,iso9001:1,iso22301:1,rca:1}],')
rep('["sector","og",{iso45001:2,iso14001:2,oec:2,iso9001:1}],', '["sector","og",{iso45001:2,iso14001:2,oec:2,iso9001:1,rca:1}],')
rep('["sector","con",{iso45001:2,oec:2,iso9001:1,iso14001:1}],', '["sector","con",{iso45001:2,oec:2,iso9001:1,iso14001:1,rca:1}],')
open(path, "w", encoding="utf-8").write(s)
print("index.html: RCA linked (URL, system row, toolkit card, toolbox entry, knowledge topic, compliance note, dashboard adapter, home data)")
