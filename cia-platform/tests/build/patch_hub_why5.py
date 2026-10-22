"""Step 2026-10-11 (5 Whys): link the 5 Whys tool in the hub (index.html) from the start. Every anchor must match exactly once.
    python3 tests/build/patch_hub_why5.py index.html
Then serve the platform folder and run tests/build/demo_why5.py, which fills DEMO_RES.why5 from the hub's own reading of the
5 Whys example (until then a placeholder with st "none" stands in)."""
import sys, os

HERE = os.path.dirname(os.path.abspath(__file__))
path = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, "..", "..", "index.html")
s = open(path, encoding="utf-8").read()
if 'why5:     "./modules/five-whys.html"' in s:
    print("5 Whys already linked; nothing to do"); sys.exit(0)


def rep(old, new):
    global s
    n = s.count(old)
    assert n == 1, (n, old[:100])
    s = s.replace(old, new)


# 1. URL
rep('  capa:     "./modules/capa.html"\n};', '  capa:     "./modules/capa.html",\n  why5:     "./modules/five-whys.html"\n};')
# 2. systems: Audit & Improvement row (after CAPA)
rep('الأداة الثانية في صندوق أدوات التحسين"}}', '''الأداة الثانية في صندوق أدوات التحسين"}},
      {k:"why5",status:"live", name:{en:"5 Whys — Root Cause Analysis",ar:"لماذا الخمس — تحليل السبب الجذري"}, note:{en:"Problem from facts · chain of whys with evidence and up to two branches · root cause test and independent review · starts from a CAPA record and sends the root cause back · third tool of the improvement toolbox", ar:"مشكلة من الوقائع · سلسلة لماذا بالدليل وفرعان كحد أقصى · اختبار السبب الجذري ومراجعة مستقلة · يبدأ من سجل CAPA ويعيد إليه السبب الجذري · الأداة الثالثة في صندوق أدوات التحسين"}}''')
# 3. toolkit card after CAPA's; PDCA's card no longer says 5 Whys is still to come
rep('extra:{en:"Worked example with three cycles for a fictitious Saudi company; CAPA is live, and 5 Whys, Fishbone and the other toolbox tools follow", ar:"مثال تطبيقي بثلاث دورات لشركة سعودية افتراضية؛ وأداة CAPA متاحة، وتتبعها لماذا الخمس وعظمة السمكة وبقية أدوات الصندوق"}},',
    'extra:{en:"Worked example with three cycles for a fictitious Saudi company; CAPA and 5 Whys are live, and Fishbone and the other toolbox tools follow", ar:"مثال تطبيقي بثلاث دورات لشركة سعودية افتراضية؛ وأداتا CAPA ولماذا الخمس متاحتان، وتتبعهما عظمة السمكة وبقية أدوات الصندوق"}},')
rep('''   extra:{en:"Worked example with four records for a fictitious Saudi company: closed and effective, waiting for its review, overdue, and reopened", ar:"مثال تطبيقي بأربعة سجلات لشركة سعودية افتراضية: مغلق وفعال، وينتظر المراجعة، ومتأخر، ومعاد فتحه"}},''',
    '''   extra:{en:"Worked example with four records for a fictitious Saudi company: closed and effective, waiting for its review, overdue, and reopened", ar:"مثال تطبيقي بأربعة سجلات لشركة سعودية افتراضية: مغلق وفعال، وينتظر المراجعة، ومتأخر، ومعاد فتحه"}},
  {k:"why5", color:"--c-aud", pre:"CIA", code:"5 Whys", ed:{en:"Continual Improvement Toolbox · tool 3", ar:"صندوق أدوات التحسين المستمر · الأداة الثالثة"},
   title:{en:"5 Whys — Root Cause Analysis", ar:"لماذا الخمس — تحليل السبب الجذري"},
   feat:{en:["Plain-language method guide: who is in the room, when to stop, when to branch, and why “five” is a rule of thumb","Clause guide on the ISO 9001:2026 clauses the method serves, starting with 10.2.1 b)","Ten-question self-assessment of your root cause practice, with a score for each stage","One analysis per problem: problem in four parts, team, chain of whys with evidence and a check status, up to two branches","Root cause test (does the problem stop?) and the reading back with “therefore”; a root cause that names only a person is flagged","Starts from a CAPA record (read-only preview) and sends the root cause back to it; automatic audit, dashboard, HTML report and CSV"],
         ar:["دليل منهجية بلغة بسيطة: من يحضر الجلسة، ومتى تتوقف، ومتى تفتح فرعاً، ولماذا «الخمس» قاعدة تقريبية","دليل بنود ISO 9001:2026 التي تخدمها الطريقة، وأولها 10.2.1 ب)","تقييم ذاتي من عشرة أسئلة لممارسة تحليل السبب الجذري، بنتيجة لكل مرحلة","تحليل لكل مشكلة: المشكلة بأجزائها الأربعة، والفريق، وسلسلة لماذا بالدليل وحالة التحقق، وفرعان كحد أقصى","اختبار السبب الجذري (هل تتوقف المشكلة؟) والقراءة العكسية بكلمة «لذلك»، وتنبيه عندما يشير السبب إلى شخص فقط","يبدأ من سجل CAPA بمعاينة للقراءة فقط ويعيد إليه السبب الجذري؛ وتدقيق آلي، ولوحة مؤشرات، وتقرير HTML وCSV"]},
   extra:{en:"Worked example with three analyses for a fictitious Saudi company, each linked to a CAPA example record; one has a branch because two causes acted together", ar:"مثال تطبيقي بثلاثة تحليلات لشركة سعودية افتراضية، كل منها مربوط بسجل في مثال CAPA؛ وأحدها بفرع لأن سببين عملا معاً"}},''')
rep('pdca:"aud",capa:"aud",w8:"ai"};', 'pdca:"aud",capa:"aud",why5:"aud",w8:"ai"};')
# 4. grouped "coming soon" toolbox entry: 10 tools left
rep('''{k:"citbox", sys:"aud", pre:"CIA", code:"Toolbox", ed:{en:"11 tools · PDCA and CAPA are live", ar:"11 أداة · وأداتا PDCA وCAPA متاحتان الآن"},
   name:{en:"Continual Improvement Toolbox: 5 Whys, Fishbone, Pareto and eight more", ar:"صندوق أدوات التحسين المستمر: لماذا الخمس وعظمة السمكة وباريتو وثماني أدوات أخرى"},
   note:{en:"5 Whys, Fishbone, Pareto, root cause analysis, A3, DMAIC, FMEA, lessons learned, SWOT, PESTLE and stakeholder analysis, built on the toolbox engine shared by PDCA and CAPA and linked to NCRs and audits.", ar:"لماذا الخمس، وعظمة السمكة، وباريتو، وتحليل السبب الجذري، وA3، وDMAIC، وFMEA، والدروس المستفادة، وSWOT، وPESTLE، وتحليل الأطراف المعنية، مبنية على محرك الصندوق المشترك بين PDCA وCAPA ومربوطة بعدم المطابقة والتدقيق."}}''',
    '''{k:"citbox", sys:"aud", pre:"CIA", code:"Toolbox", ed:{en:"10 tools · PDCA, CAPA and 5 Whys are live", ar:"10 أدوات · وأدوات PDCA وCAPA ولماذا الخمس متاحة الآن"},
   name:{en:"Continual Improvement Toolbox: Fishbone, Pareto, A3 and seven more", ar:"صندوق أدوات التحسين المستمر: عظمة السمكة وباريتو وA3 وسبع أدوات أخرى"},
   note:{en:"Fishbone, Pareto, root cause analysis, A3, DMAIC, FMEA, lessons learned, SWOT, PESTLE and stakeholder analysis, built on the toolbox engine shared by PDCA, CAPA and 5 Whys and linked to NCRs and audits.", ar:"عظمة السمكة، وباريتو، وتحليل السبب الجذري، وA3، وDMAIC، وFMEA، والدروس المستفادة، وSWOT، وPESTLE، وتحليل الأطراف المعنية، مبنية على محرك الصندوق المشترك بين PDCA وCAPA ولماذا الخمس ومربوطة بعدم المطابقة والتدقيق."}}''')
# 5. knowledge centre topic (after CAPA's)
rep('rel:"CAPA · ISO 9001 §10.2", guide:{k:"capa",a:"explain-cl"}},', '''rel:"CAPA · ISO 9001 §10.2", guide:{k:"capa",a:"explain-cl"}},
  {en:["Root cause analysis: 5 Whys","5 Whys is a way of asking questions, not a clause of any standard. It serves ISO 9001:2026 clause 10.2.1 b), which asks for the causes of a nonconformity to be determined and for similar cases to be checked. Write the problem from facts, ask “why?” and back each answer with evidence, stop at a cause the organization can change (five is a rule of thumb), branch when two causes acted together, and test the root cause before building an action on it."],
   ar:["تحليل السبب الجذري: لماذا الخمس","«لماذا الخمس» طريقة لطرح الأسئلة، وليست بنداً في أي مواصفة. تخدم البند 10.2.1 ب) من ISO 9001:2026 الذي يطلب تحديد أسباب عدم المطابقة والتحقق من الحالات المشابهة. اكتب المشكلة من الوقائع، واسأل «لماذا؟» وادعم كل جواب بدليل، وتوقّف عند سبب تستطيع المنشأة تغييره (فالخمسة قاعدة تقريبية)، وافتح فرعاً إذا عمل سببان معاً، واختبر السبب الجذري قبل أن تبني عليه إجراءً."], rel:"5 Whys · ISO 9001 §10.2.1 b)", guide:{k:"why5",a:"explain-std"}},''')
# 6. compliance note (after CAPA's)
rep('''  {k:"oec", name:{en:"Operations Excellence Center",ar:"مركز التميّز التشغيلي"},
   note:{en:"Explanations are written independently''', '''  {k:"why5", name:{en:"5 Whys — Root Cause Analysis",ar:"لماذا الخمس — تحليل السبب الجذري"},
   note:{en:"5 Whys is a questioning method, not a standard or a requirement. The guide summarises the ISO 9001:2026 clauses it serves (10.2.1 b) and the clauses it works with) and ISO 9000:2026 terms in independent wording; clause numbers and titles were checked against the official texts on 2026-10-11, and the standards' text remains copyright of ISO. The example analyses are illustrative, not real data.",
         ar:"«لماذا الخمس» طريقة لطرح الأسئلة، وليست مواصفة ولا متطلباً. يلخص الدليل بنود ISO 9001:2026 التي تخدمها (10.2.1 ب) والبنود التي تعمل معها) ومصطلحات ISO 9000:2026 بصياغة مستقلة، وقد تُحقق من أرقام البنود وعناوينها من النصوص الرسمية في 2026-10-11، وحقوق نصوص المواصفات محفوظة لمنظمة ISO. تحليلات المثال توضيحية وليست بيانات حقيقية."}},
  {k:"oec", name:{en:"Operations Excellence Center",ar:"مركز التميّز التشغيلي"},
   note:{en:"Explanations are written independently''')
# 7. performance dashboard: labels, breakdown title, adapter, registry
rep('  caAs:B("CAPA self-assessment","التقييم الذاتي لـ CAPA"), caEff:B("Records closed and effective (of records)","السجلات المغلقة والفعالة من كل السجلات"),',
    '  caAs:B("CAPA self-assessment","التقييم الذاتي لـ CAPA"), caEff:B("Records closed and effective (of records)","السجلات المغلقة والفعالة من كل السجلات"),\n  w5As:B("5 Whys self-assessment","التقييم الذاتي لـ لماذا الخمس"), w5Te:B("Analyses with a tested root cause","التحليلات ذات السبب الجذري المختبر"), w5Ca:B("Analyses linked to a CAPA record","التحليلات المرتبطة بسجل CAPA"),')
rep('  capa:B("Open items by type (share of records)","البنود المفتوحة حسب النوع (نسبة من السجلات)"),',
    '  capa:B("Open items by type (share of records)","البنود المفتوحة حسب النوع (نسبة من السجلات)"),\n  why5:B("Open items by type (share of analyses)","البنود المفتوحة حسب النوع (نسبة من التحليلات)"),')
rep('''/* ---------- registry ---------- */''', '''/* ---------- 5 Whys — Root cause analysis (cia-why5:v1). Stage and checks are the tool's own (modules/five-whys.html). ---------- */
function why5Ad(S){
  if(!S) return finish([],null,false);
  const Q=["PR1","PR2","CH1","CH2","CH3","CH4","RT1","RT2","LK1","LK2"], A=(S.assess&&typeof S.assess==="object")?S.assess:{};
  const R=(arr(S.records)||[]).filter(r=>r&&typeof r==="object");
  const ans=Q.filter(q=>num(A[q])!=null), pct=qs=>{ const s=qs.reduce((a,q)=>a+(num(A[q])||0),0); return s/(2*qs.length)*100; };
  const o=x=>(x&&typeof x==="object"&&!Array.isArray(x))?x:{}, tx=v=>String(v==null||typeof v==="object"?"":v).trim(), isD=d=>/^\\d{4}-\\d{2}-\\d{2}$/.test(String(d||""));
  const PERSON=/(خطأ\\s*(بشري|العامل|الموظف|الفني|المشغل|السائق|الشخص)|إهمال|اهمال|تقصير|عدم\\s*(انتباه|الانتباه|تركيز|التركيز)|سهو|لامبالاة|human\\s*error|operator\\s*error|worker\\s*error|staff\\s*error|employee\\s*error|negligen|careless|inattent|not\\s*paying\\s*attention|lack\\s*of\\s*attention|complacen)/i;
  const chains=r=>(Array.isArray(r.chains)?r.chains:[]).filter(c=>c&&typeof c==="object"), whys=c=>(Array.isArray(c.whys)?c.whys:[]).filter(w=>w&&typeof w==="object"&&tx(w.a));
  const tested=r=>{ const t=o(r.test); return t.stop==="yes"&&t.reads===true; };
  let te=0, ca=0, unt=0, unsup=0, per=0, wait=0;
  R.forEach(r=>{ const rv=o(r.review), t=tested(r), root=tx(r.root);
    if(t) te++; if(tx(r.capa)) ca++;
    if(root&&!t) unt++;
    if(chains(r).some(c=>whys(c).some(w=>w.st==="no"||w.st==="chk"))) unsup++;
    if(PERSON.test(root)) per++;
    if(t&&!(tx(rv.by)&&isD(rv.date))) wait++; });
  const m=[ M("w5As", ans.length? pct(Q) : null, "perf", ans.length? `${Math.round(pct(Q))}%` : ""),
            M("w5Te", R.length? share(te,R.length) : null, "perf", R.length? frac(te,R.length) : ""),
            M("w5Ca", R.length? share(ca,R.length) : null, "prog", R.length? frac(ca,R.length) : ""),
            M("an", ans.length? share(ans.length,Q.length) : null, "prog", frac(ans.length,Q.length)) ];
  const IT=[[B("Root cause not tested","سبب جذري لم يُختبر"),unt,"#C2410C"],[B("Answers to check or not supported","أجوبة تحتاج تحققاً أو غير مدعومة"),unsup,"#B45309"],
            [B("Root cause names a person only","سبب يشير إلى شخص فقط"),per,"#9A3412"],[B("Waiting for independent review","تنتظر مراجعة مستقلة"),wait,"#C9821A"]];
  const bd = R.length ? {t:BDT.why5, items:IT.map(([l,n,col])=>({l, v:share(n,R.length), t:String(n), col}))} : null;
  return finish(m, bd, ans.length>0 || R.length>0);
}

/* ---------- registry ---------- */''')
rep('  {k:"capa",    sys:"aud", key:"cia-capa:v1", code:"CAPA", n:B("CAPA corrective action","الإجراءات التصحيحية CAPA"), f:capaAd},',
    '  {k:"capa",    sys:"aud", key:"cia-capa:v1", code:"CAPA", n:B("CAPA corrective action","الإجراءات التصحيحية CAPA"), f:capaAd},\n  {k:"why5",    sys:"aud", key:"cia-why5:v1", code:"5 Whys", n:B("5 Whys root cause analysis","لماذا الخمس — تحليل السبب الجذري"), f:why5Ad},')
rep('pdcaAd,capaAd}};', 'pdcaAd,capaAd,why5Ad}};')
rep('const DEMO_RES = {"capa": ', 'const DEMO_RES = {"why5": {"st": "none", "idx": null, "comp": null, "m": [], "bd": null}, "capa": ')
# 8. home page data: tool facts, news, request mapping, Advisor rules
rep(' w8: TI(0,7,"modreg"', ''' why5: TI(10,0,"tools",{en:"5 Whys analysis",ar:"تحليل لماذا الخمس"},["qhse","aud"],["iso"],
  {en:"Runs a root cause session step by step: a problem from facts, a chain of whys with evidence behind every answer, and a root cause tested before an action is built on it.", ar:"تقود جلسة تحليل السبب خطوة خطوة: مشكلة من الوقائع، وسلسلة «لماذا» يسند الدليل كل جواب فيها، وسبب جذري يُختبر قبل أن يُبنى عليه إجراء."},
  {en:"Repeated findings usually mean the cause was never found: the chain stopped at “human error” or at an answer nobody checked.", ar:"تكرار الملاحظات يعني غالباً أن السبب لم يُعرف أصلاً: توقفت السلسلة عند «خطأ بشري» أو عند جواب لم يتحقق منه أحد."},
  {en:"A 10-question self-assessment, analyses with up to two branches and an automatic audit, a start from a CAPA record and the root cause sent back, a dashboard, an HTML report and CSV.", ar:"تقييم ذاتي من 10 أسئلة، وتحليلات بفرعين كحد أقصى وتدقيق آلي، وبداية من سجل CAPA وإعادة السبب الجذري إليه، ولوحة مؤشرات، وتقرير HTML وCSV."},
  {en:"10 minutes for the self-assessment; 30–45 minutes per analysis session", ar:"10 دقائق للتقييم الذاتي، و30–45 دقيقة لكل جلسة تحليل"}),
 w8: TI(0,7,"modreg"''')
rep('const NEWS = [\n', '''const NEWS = [
  {k:"why5", d:"2026-10-11", t:{en:"New: 5 Whys root cause analysis — evidence for every answer, branches, a root cause test, and a two-way link with CAPA.", ar:"جديد: أداة لماذا الخمس لتحليل السبب الجذري — دليل لكل جواب، وفروع، واختبار للسبب الجذري، وربط في الاتجاهين مع CAPA."}},
''')
rep('pdca:["iac",null],capa:["iac",null],w8:["cockpit",null]};', 'pdca:["iac",null],capa:["iac",null],why5:["iac",null],w8:["cockpit",null]};')
rep('["goal","audit",{aud:4,pdca:3,capa:3,ims:1}],', '["goal","audit",{aud:4,pdca:3,capa:3,why5:2,ims:1}],')
rep('["pain","repeat",{aud:2,pdca:2,capa:2}],', '["pain","repeat",{aud:2,pdca:2,capa:2,why5:3}],')
open(path, "w", encoding="utf-8").write(s)
print("index.html: 5 Whys linked (URL, system row, toolkit card, toolbox entry, knowledge topic, compliance note, dashboard adapter, home data)")
