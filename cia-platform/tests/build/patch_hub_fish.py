"""Step 2026-10-11 (Fishbone): link the Fishbone tool in the hub (index.html) from the start. Every anchor must match exactly once.
    python3 tests/build/patch_hub_fish.py index.html
Then serve the platform folder and run tests/build/demo_fish.py, which fills DEMO_RES.fish from the hub's own reading of the
Fishbone example (until then a placeholder with st "none" stands in)."""
import sys, os

HERE = os.path.dirname(os.path.abspath(__file__))
path = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, "..", "..", "index.html")
s = open(path, encoding="utf-8").read()
if 'fish:     "./modules/fishbone.html"' in s:
    print("Fishbone already linked; nothing to do"); sys.exit(0)


def rep(old, new):
    global s
    n = s.count(old)
    assert n == 1, (n, old[:100])
    s = s.replace(old, new)


# 1. URL
rep('  why5:     "./modules/five-whys.html"\n};', '  why5:     "./modules/five-whys.html",\n  fish:     "./modules/fishbone.html"\n};')
# 2. systems: Audit & Improvement row (after 5 Whys)
rep('الأداة الثالثة في صندوق أدوات التحسين"}}', '''الأداة الثالثة في صندوق أدوات التحسين"}},
      {k:"fish",status:"live", name:{en:"Fishbone — Cause and Effect Analysis",ar:"عظمة السمكة — تحليل السبب والنتيجة"}, note:{en:"Effect from facts · categories chosen to fit the process (6M, 4S, 8P or custom) · causes with evidence and a status, ruled out with data · the likely few verified with 5 Whys or data · live diagram · starts from a CAPA record and sends the root cause back · fourth tool of the improvement toolbox", ar:"أثر من الوقائع · فئات تناسب العملية (6M أو 4S أو 8P أو خاصة) · أسباب بدليلها وحالتها، والاستبعاد بالبيانات · التحقق من القليل الأرجح بلماذا الخمس أو بالبيانات · مخطط حي · يبدأ من سجل CAPA ويعيد إليه السبب الجذري · الأداة الرابعة في صندوق أدوات التحسين"}}''')
# 3. toolkit card after 5 Whys; PDCA's card no longer says Fishbone is still to come
rep('extra:{en:"Worked example with three cycles for a fictitious Saudi company; CAPA and 5 Whys are live, and Fishbone and the other toolbox tools follow", ar:"مثال تطبيقي بثلاث دورات لشركة سعودية افتراضية؛ وأداتا CAPA ولماذا الخمس متاحتان، وتتبعهما عظمة السمكة وبقية أدوات الصندوق"}},',
    'extra:{en:"Worked example with three cycles for a fictitious Saudi company; CAPA, 5 Whys and Fishbone are live, and Pareto and the other toolbox tools follow", ar:"مثال تطبيقي بثلاث دورات لشركة سعودية افتراضية؛ وأدوات CAPA ولماذا الخمس وعظمة السمكة متاحة، وتتبعها باريتو وبقية أدوات الصندوق"}},')
rep('''   extra:{en:"Worked example with three analyses for a fictitious Saudi company, each linked to a CAPA example record; one has a branch because two causes acted together", ar:"مثال تطبيقي بثلاثة تحليلات لشركة سعودية افتراضية، كل منها مربوط بسجل في مثال CAPA؛ وأحدها بفرع لأن سببين عملا معاً"}},''',
    '''   extra:{en:"Worked example with three analyses for a fictitious Saudi company, each linked to a CAPA example record; one has a branch because two causes acted together", ar:"مثال تطبيقي بثلاثة تحليلات لشركة سعودية افتراضية، كل منها مربوط بسجل في مثال CAPA؛ وأحدها بفرع لأن سببين عملا معاً"}},
  {k:"fish", color:"--c-aud", pre:"CIA", code:"Fishbone", ed:{en:"Continual Improvement Toolbox · tool 4", ar:"صندوق أدوات التحسين المستمر · الأداة الرابعة"},
   title:{en:"Fishbone — Cause and Effect Analysis", ar:"عظمة السمكة — تحليل السبب والنتيجة"},
   feat:{en:["Plain-language method guide: choosing the categories, writing causes as facts, ruling out with evidence, and why the diagram shows where to look rather than proving the cause","Clause guide on the ISO 9001:2026 clauses the method serves, starting with 10.2.1 b) 2) and 3)","Ten-question self-assessment of your cause and effect practice, with a score for each stage","One analysis per problem: effect in four parts, team, up to eight renamable categories (6M, 4S, 8P or custom), causes and sub-causes with evidence, status and votes","Live fishbone diagram (a list on phones); three selected causes at most, each verified with a linked 5 Whys analysis or with data; a cause that names only a person is flagged","Starts from a CAPA record (read-only preview) and sends the root cause back to it; automatic audit, dashboard, HTML report with the diagram, and CSV"],
         ar:["دليل منهجية بلغة بسيطة: اختيار الفئات، وكتابة الأسباب وقائع، والاستبعاد بالدليل، ولماذا يبيّن المخطط أين تبحث ولا يثبت السبب وحده","دليل بنود ISO 9001:2026 التي تخدمها الطريقة، وأولها 10.2.1 ب) 2) و3)","تقييم ذاتي من عشرة أسئلة لممارسة تحليل السبب والنتيجة، بنتيجة لكل مرحلة","تحليل لكل مشكلة: الأثر بأجزائه الأربعة، والفريق، وحتى ثماني فئات قابلة لإعادة التسمية (6M أو 4S أو 8P أو خاصة)، وأسباب وأسباب فرعية بدليلها وحالتها وأصواتها","مخطط عظمة سمكة حي (قائمة على الهاتف)؛ وثلاثة أسباب مختارة على الأكثر يُتحقق من كل منها بتحليل لماذا الخمس أو بالبيانات؛ وتنبيه عندما يشير السبب إلى شخص فقط","يبدأ من سجل CAPA بمعاينة للقراءة فقط ويعيد إليه السبب الجذري؛ وتدقيق آلي، ولوحة مؤشرات، وتقرير HTML بالمخطط، وCSV"]},
   extra:{en:"Worked example with three analyses for a fictitious Saudi company, each linked to a CAPA example record: one verified with data, one through 5 Whys analysis W5-EX-03, and one on 4S categories waiting for its review", ar:"مثال تطبيقي بثلاثة تحليلات لشركة سعودية افتراضية، كل منها مربوط بسجل في مثال CAPA: أحدها تحقق بالبيانات، وآخر عبر تحليل لماذا الخمس W5-EX-03، وثالث بفئات 4S ينتظر المراجعة"}},''')
rep('pdca:"aud",capa:"aud",why5:"aud",w8:"ai"};', 'pdca:"aud",capa:"aud",why5:"aud",fish:"aud",w8:"ai"};')
# 4. grouped "coming soon" toolbox entry: 9 tools left
rep('''{k:"citbox", sys:"aud", pre:"CIA", code:"Toolbox", ed:{en:"10 tools · PDCA, CAPA and 5 Whys are live", ar:"10 أدوات · وأدوات PDCA وCAPA ولماذا الخمس متاحة الآن"},
   name:{en:"Continual Improvement Toolbox: Fishbone, Pareto, A3 and seven more", ar:"صندوق أدوات التحسين المستمر: عظمة السمكة وباريتو وA3 وسبع أدوات أخرى"},
   note:{en:"Fishbone, Pareto, root cause analysis, A3, DMAIC, FMEA, lessons learned, SWOT, PESTLE and stakeholder analysis, built on the toolbox engine shared by PDCA, CAPA and 5 Whys and linked to NCRs and audits.", ar:"عظمة السمكة، وباريتو، وتحليل السبب الجذري، وA3، وDMAIC، وFMEA، والدروس المستفادة، وSWOT، وPESTLE، وتحليل الأطراف المعنية، مبنية على محرك الصندوق المشترك بين PDCA وCAPA ولماذا الخمس ومربوطة بعدم المطابقة والتدقيق."}}''',
    '''{k:"citbox", sys:"aud", pre:"CIA", code:"Toolbox", ed:{en:"9 tools · PDCA, CAPA, 5 Whys and Fishbone are live", ar:"9 أدوات · وأدوات PDCA وCAPA ولماذا الخمس وعظمة السمكة متاحة الآن"},
   name:{en:"Continual Improvement Toolbox: Pareto, A3, DMAIC and six more", ar:"صندوق أدوات التحسين المستمر: باريتو وA3 وDMAIC وست أدوات أخرى"},
   note:{en:"Pareto, root cause analysis, A3, DMAIC, FMEA, lessons learned, SWOT, PESTLE and stakeholder analysis, built on the toolbox engine shared by PDCA, CAPA, 5 Whys and Fishbone and linked to NCRs and audits.", ar:"باريتو، وتحليل السبب الجذري، وA3، وDMAIC، وFMEA، والدروس المستفادة، وSWOT، وPESTLE، وتحليل الأطراف المعنية، مبنية على محرك الصندوق المشترك بين PDCA وCAPA ولماذا الخمس وعظمة السمكة ومربوطة بعدم المطابقة والتدقيق."}}''')
# 5. knowledge centre topic (after 5 Whys)
rep('rel:"5 Whys · ISO 9001 §10.2.1 b)", guide:{k:"why5",a:"explain-std"}},', '''rel:"5 Whys · ISO 9001 §10.2.1 b)", guide:{k:"why5",a:"explain-std"}},
  {en:["Cause and effect: Fishbone (Ishikawa)","The fishbone diagram is a way of organising possible causes, not a clause of any standard. It serves ISO 9001:2026 clause 10.2.1 b) 2) and 3): determining the causes of a nonconformity and checking for similar cases. Write the effect from facts at the head, choose categories that fit the process (6M, 4S or 8P are prompts, not a fixed list), write each cause as a fact with its evidence, rule causes out with data, then verify the two or three most likely with 5 Whys or data before acting."],
   ar:["السبب والنتيجة: عظمة السمكة (إيشيكاوا)","مخطط عظمة السمكة طريقة لتنظيم الأسباب المحتملة، وليس بنداً في أي مواصفة. يخدم البند 10.2.1 ب) 2) و3) من ISO 9001:2026: تحديد أسباب عدم المطابقة والتحقق من الحالات المشابهة. اكتب الأثر من الوقائع في رأس السمكة، واختر فئات تناسب العملية (6M و4S و8P محفّزات لا قائمة ثابتة)، واكتب كل سبب واقعةً بدليلها، واستبعد بالبيانات، ثم تحقق من السببين أو الثلاثة الأرجح بلماذا الخمس أو بالبيانات قبل الإجراء."], rel:"Fishbone · ISO 9001 §10.2.1 b)", guide:{k:"fish",a:"explain-std"}},''')
# 6. compliance note (after 5 Whys)
rep('''  {k:"oec", name:{en:"Operations Excellence Center",ar:"مركز التميّز التشغيلي"},
   note:{en:"Explanations are written independently''', '''  {k:"fish", name:{en:"Fishbone — Cause and Effect Analysis",ar:"عظمة السمكة — تحليل السبب والنتيجة"},
   note:{en:"Fishbone (Ishikawa) is a method for organising possible causes, not a standard or a requirement; its categories are prompts. The guide summarises the ISO 9001:2026 clauses it serves (10.2.1 b) and the clauses it works with) and ISO 9000:2026 terms and principles in independent wording; clause numbers and titles were checked against the official texts on 2026-10-11, and the standards' text remains copyright of ISO. The example analyses are illustrative, not real data.",
         ar:"«عظمة السمكة» (إيشيكاوا) طريقة لتنظيم الأسباب المحتملة، وليست مواصفة ولا متطلباً، وفئاتها محفّزات للتفكير. يلخص الدليل بنود ISO 9001:2026 التي تخدمها (10.2.1 ب) والبنود التي تعمل معها) ومصطلحات ISO 9000:2026 ومبادئها بصياغة مستقلة، وقد تُحقق من أرقام البنود وعناوينها من النصوص الرسمية في 2026-10-11، وحقوق نصوص المواصفات محفوظة لمنظمة ISO. تحليلات المثال توضيحية وليست بيانات حقيقية."}},
  {k:"oec", name:{en:"Operations Excellence Center",ar:"مركز التميّز التشغيلي"},
   note:{en:"Explanations are written independently''')
# 7. performance dashboard: labels, breakdown title, adapter, registry
rep('  w5As:B("5 Whys self-assessment","التقييم الذاتي لـ لماذا الخمس"),',
    '  fbAs:B("Fishbone self-assessment","التقييم الذاتي لـ عظمة السمكة"), fbVe:B("Analyses with verified selected causes","التحليلات التي تحققت أسبابها المختارة"), fbCa:B("Analyses linked to a CAPA record","التحليلات المرتبطة بسجل CAPA"),\n  w5As:B("5 Whys self-assessment","التقييم الذاتي لـ لماذا الخمس"),')
rep('  why5:B("Open items by type (share of analyses)","البنود المفتوحة حسب النوع (نسبة من التحليلات)"),',
    '  why5:B("Open items by type (share of analyses)","البنود المفتوحة حسب النوع (نسبة من التحليلات)"),\n  fish:B("Open items by type (share of analyses)","البنود المفتوحة حسب النوع (نسبة من التحليلات)"),')
rep('''/* ---------- registry ---------- */''', '''/* ---------- Fishbone — Cause and effect analysis (cia-fish:v1). Selection, verification and stage are the tool's own (modules/fishbone.html). ---------- */
function fishAd(S){
  if(!S) return finish([],null,false);
  const Q=["EF1","EF2","CS1","CS2","CS3","VR1","VR2","VR3","LK1","LK2"], A=(S.assess&&typeof S.assess==="object")?S.assess:{};
  const R=(arr(S.records)||[]).filter(r=>r&&typeof r==="object");
  const ans=Q.filter(q=>num(A[q])!=null), pct=qs=>{ const s=qs.reduce((a,q)=>a+(num(A[q])||0),0); return s/(2*qs.length)*100; };
  const o=x=>(x&&typeof x==="object"&&!Array.isArray(x))?x:{}, tx=v=>String(v==null||typeof v==="object"?"":v).trim(), isD=d=>/^\\d{4}-\\d{2}-\\d{2}$/.test(String(d||""));
  const PERSON=/(خطأ\\s*(بشري|العامل|الموظف|الفني|المشغل|السائق|الشخص)|إهمال|اهمال|تقصير|عدم\\s*(انتباه|الانتباه|تركيز|التركيز)|سهو|لامبالاة|human\\s*error|operator\\s*error|worker\\s*error|staff\\s*error|employee\\s*error|negligen|careless|inattent|not\\s*paying\\s*attention|lack\\s*of\\s*attention|complacen)/i;
  const items=r=>{ const out=[]; (Array.isArray(r.bones)?r.bones:[]).forEach(b=>{ (b&&Array.isArray(b.causes)?b.causes:[]).forEach(c=>{ if(!c||typeof c!=="object") return; [c].concat(Array.isArray(c.subs)?c.subs:[]).forEach(x=>{ if(x&&typeof x==="object"&&tx(x.t)) out.push(x); }); }); }); return out; };
  const ver=x=>{ const v=o(x.ver); return v.res==="conf" && ((v.how==="why5"&&!!tx(v.w5)) || (v.how!=="why5"&&!!tx(v.note))); };
  let ve=0, ca=0, unv=0, nosel=0, per=0, wait=0;
  R.forEach(r=>{ const I=items(r), sel=I.filter(x=>x.sel===true&&x.st!=="out"), all=sel.length>0&&sel.every(ver), rv=o(r.review), done=all&&!!tx(r.root)&&r.test==="yes";
    if(all) ve++; if(tx(r.capa)) ca++;
    if(sel.length&&!all) unv++;
    if(I.length&&!sel.length) nosel++;
    if(PERSON.test(tx(r.root))||sel.some(x=>PERSON.test(tx(x.t)))) per++;
    if(done&&!(tx(rv.by)&&isD(rv.date))) wait++; });
  const m=[ M("fbAs", ans.length? pct(Q) : null, "perf", ans.length? `${Math.round(pct(Q))}%` : ""),
            M("fbVe", R.length? share(ve,R.length) : null, "perf", R.length? frac(ve,R.length) : ""),
            M("fbCa", R.length? share(ca,R.length) : null, "prog", R.length? frac(ca,R.length) : ""),
            M("an", ans.length? share(ans.length,Q.length) : null, "prog", frac(ans.length,Q.length)) ];
  const IT=[[B("Selected causes not verified","أسباب مختارة لم يُتحقق منها"),unv,"#C2410C"],[B("Causes mapped, none selected","أسباب مرسومة دون اختيار"),nosel,"#B45309"],
            [B("A cause names a person only","سبب يشير إلى شخص فقط"),per,"#9A3412"],[B("Waiting for independent review","تنتظر مراجعة مستقلة"),wait,"#C9821A"]];
  const bd = R.length ? {t:BDT.fish, items:IT.map(([l,n,col])=>({l, v:share(n,R.length), t:String(n), col}))} : null;
  return finish(m, bd, ans.length>0 || R.length>0);
}

/* ---------- registry ---------- */''')
rep('  {k:"why5",    sys:"aud", key:"cia-why5:v1", code:"5 Whys", n:B("5 Whys root cause analysis","لماذا الخمس — تحليل السبب الجذري"), f:why5Ad},',
    '  {k:"why5",    sys:"aud", key:"cia-why5:v1", code:"5 Whys", n:B("5 Whys root cause analysis","لماذا الخمس — تحليل السبب الجذري"), f:why5Ad},\n  {k:"fish",    sys:"aud", key:"cia-fish:v1", code:"Fishbone", n:B("Fishbone cause and effect analysis","عظمة السمكة — تحليل السبب والنتيجة"), f:fishAd},')
rep('pdcaAd,capaAd,why5Ad}};', 'pdcaAd,capaAd,why5Ad,fishAd}};')
rep('const DEMO_RES = {"why5": ', 'const DEMO_RES = {"fish": {"st": "none", "idx": null, "comp": null, "m": [], "bd": null}, "why5": ')
# 8. home page data: tool facts, news, request mapping, Advisor rules
rep(' w8: TI(0,7,"modreg"', ''' fish: TI(10,0,"tools",{en:"Fishbone analysis",ar:"تحليل عظمة السمكة"},["qhse","aud"],["iso"],
  {en:"Maps the possible causes of a problem on categories that fit the process, keeps the evidence next to each cause, and verifies the likely few before an action is built on them.", ar:"تنشر الأسباب المحتملة لمشكلة على فئات تناسب العملية، وتحفظ الدليل بجانب كل سبب، وتتحقق من القليل الأرجح قبل أن يُبنى عليه إجراء."},
  {en:"When a problem has several possible causes, teams often fix the one that was mentioned first; the others come back as repeated findings.", ar:"عندما تتعدد الأسباب المحتملة لمشكلة، يعالج الفريق غالباً أول سبب ذُكر، فتعود الأسباب الأخرى ملاحظاتٍ متكررة."},
  {en:"A 10-question self-assessment, a live diagram on up to eight categories, causes with evidence and status, three verified causes at most (5 Whys or data), an automatic audit, a two-way link with CAPA, a dashboard, an HTML report and CSV.", ar:"تقييم ذاتي من 10 أسئلة، ومخطط حي على ثماني فئات كحد أقصى، وأسباب بدليلها وحالتها، وثلاثة أسباب متحقق منها على الأكثر (لماذا الخمس أو البيانات)، وتدقيق آلي، وربط في الاتجاهين مع CAPA، ولوحة مؤشرات، وتقرير HTML وCSV."},
  {en:"10 minutes for the self-assessment; 45–60 minutes per analysis session", ar:"10 دقائق للتقييم الذاتي، و45–60 دقيقة لكل جلسة تحليل"}),
 w8: TI(0,7,"modreg"''')
rep('const NEWS = [\n', '''const NEWS = [
  {k:"fish", d:"2026-10-11", t:{en:"New: Fishbone cause and effect analysis — categories that fit the process, evidence for every cause, the likely few verified with 5 Whys or data, and a two-way link with CAPA.", ar:"جديد: أداة عظمة السمكة لتحليل السبب والنتيجة — فئات تناسب العملية، ودليل لكل سبب، والتحقق من القليل الأرجح بلماذا الخمس أو بالبيانات، وربط في الاتجاهين مع CAPA."}},
''')
rep('pdca:["iac",null],capa:["iac",null],why5:["iac",null],w8:["cockpit",null]};', 'pdca:["iac",null],capa:["iac",null],why5:["iac",null],fish:["iac",null],w8:["cockpit",null]};')
rep('["goal","audit",{aud:4,pdca:3,capa:3,why5:2,ims:1}],', '["goal","audit",{aud:4,pdca:3,capa:3,why5:2,fish:2,ims:1}],')
rep('["pain","repeat",{aud:2,pdca:2,capa:2,why5:3}],', '["pain","repeat",{aud:2,pdca:2,capa:2,why5:3,fish:2}],')
open(path, "w", encoding="utf-8").write(s)
print("index.html: Fishbone linked (URL, system row, toolkit card, toolbox entry, knowledge topic, compliance note, dashboard adapter, home data)")
