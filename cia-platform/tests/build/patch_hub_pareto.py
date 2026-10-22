"""Step 2026-10-11 (Pareto): link the Pareto tool in the hub (index.html) from the start. Every anchor must match exactly once.
    python3 tests/build/patch_hub_pareto.py index.html
Then serve the platform folder and run tests/build/demo_pareto.py, which fills DEMO_RES.pareto from the hub's own reading of the
Pareto example (until then a placeholder with st "none" stands in)."""
import sys, os

HERE = os.path.dirname(os.path.abspath(__file__))
path = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, "..", "..", "index.html")
s = open(path, encoding="utf-8").read()
if 'pareto:   "./modules/pareto.html"' in s:
    print("Pareto already linked; nothing to do"); sys.exit(0)


def rep(old, new):
    global s
    n = s.count(old)
    assert n == 1, (n, old[:100])
    s = s.replace(old, new)


# 1. URL
rep('  fish:     "./modules/fishbone.html"\n};', '  fish:     "./modules/fishbone.html",\n  pareto:   "./modules/pareto.html"\n};')
# 2. systems: Audit & Improvement row (after Fishbone)
rep('الأداة الرابعة في صندوق أدوات التحسين"}}', '''الأداة الرابعة في صندوق أدوات التحسين"}},
      {k:"pareto",status:"live", name:{en:"Pareto — Vital Few Analysis",ar:"باريتو — تحليل القلة الحيوية"}, note:{en:"One question per chart · categories defined in one line · count, cost, time or severity · live chart with the cumulative line and an adjustable cut-off · the vital few confirmed by the team · each linked to Fishbone, 5 Whys or CAPA · before/after check on the same basis · fifth tool of the improvement toolbox", ar:"سؤال واحد لكل مخطط · فئات معرّفة في سطر · عدد أو تكلفة أو وقت أو خطورة · مخطط حي بالنسبة التراكمية وخط قطع قابل للتعديل · قلة حيوية يؤكدها الفريق · وكل فئة منها مربوطة بعظمة السمكة أو لماذا الخمس أو CAPA · تحقق قبل وبعد على الأساس نفسه · الأداة الخامسة في صندوق أدوات التحسين"}}''')
# 3. toolkit card after Fishbone; PDCA's card no longer says Pareto is still to come
rep('extra:{en:"Worked example with three cycles for a fictitious Saudi company; CAPA, 5 Whys and Fishbone are live, and Pareto and the other toolbox tools follow", ar:"مثال تطبيقي بثلاث دورات لشركة سعودية افتراضية؛ وأدوات CAPA ولماذا الخمس وعظمة السمكة متاحة، وتتبعها باريتو وبقية أدوات الصندوق"}},',
    'extra:{en:"Worked example with three cycles for a fictitious Saudi company; CAPA, 5 Whys, Fishbone and Pareto are live, and root cause analysis and the other toolbox tools follow", ar:"مثال تطبيقي بثلاث دورات لشركة سعودية افتراضية؛ وأدوات CAPA ولماذا الخمس وعظمة السمكة وباريتو متاحة، ويتبعها تحليل السبب الجذري وبقية أدوات الصندوق"}},')
i = s.find('  {k:"fish", color:"--c-aud", pre:"CIA", code:"Fishbone"'); assert i > 0 and s.count('  {k:"fish", color:"--c-aud", pre:"CIA", code:"Fishbone"') == 1
j = s.find('\n  {k:"w8", color:"--c-ai"', i); assert j > i
s = s[:j] + '''
  {k:"pareto", color:"--c-aud", pre:"CIA", code:"Pareto", ed:{en:"Continual Improvement Toolbox · tool 5", ar:"صندوق أدوات التحسين المستمر · الأداة الخامسة"},
   title:{en:"Pareto — Vital Few Analysis", ar:"باريتو — تحليل القلة الحيوية"},
   feat:{en:["Plain-language method guide: the question before the data, category definitions, period and unit, “Other”, and why 80/20 is a rule of thumb, not a law","Clause guide on the ISO 9001:2026 clauses the method serves, starting with 9.1.3 and 10.2.1 b) 2)","Ten-question self-assessment of your Pareto practice, with a score for each stage","One analysis per question: up to 15 defined categories plus “Other”, ranked automatically with share and cumulative %, in count, cost, hours or a severity score","Live chart with the cumulative line and a cut-off you can move from 60% to 90% (a ranked table on phones); the team confirms the vital few and writes the reason for any change","Categories built from CAPA records, Fishbone causes or audit findings (read-only preview); each vital-few category linked to Fishbone, 5 Whys or CAPA; before/after chart, automatic audit, dashboard, HTML report and CSV"],
         ar:["دليل منهجية بلغة بسيطة: السؤال قبل البيانات، وتعريف الفئات، والفترة والوحدة، و«أخرى»، ولماذا 80/20 قاعدة تقريبية وليست قانوناً","دليل بنود ISO 9001:2026 التي تخدمها الطريقة، وأولها 9.1.3 و10.2.1 ب) 2)","تقييم ذاتي من عشرة أسئلة لممارسة باريتو، بنتيجة لكل مرحلة","تحليل لكل سؤال: حتى 15 فئة معرّفة مع «أخرى»، مرتبة تلقائياً بالنسبة والنسبة التراكمية، بالعدد أو التكلفة أو الساعات أو درجة الخطورة","مخطط حي بالنسبة التراكمية وخط قطع يتحرك من 60% إلى 90% (جدول مرتب على الهاتف)؛ ويؤكد الفريق القلة الحيوية ويكتب سبب أي تغيير","فئات تُبنى من سجلات CAPA أو أسباب عظمة السمكة أو ملاحظات التدقيق بمعاينة للقراءة فقط؛ وكل فئة حيوية مربوطة بعظمة السمكة أو لماذا الخمس أو CAPA؛ ومخطط قبل وبعد، وتدقيق آلي، ولوحة مؤشرات، وتقرير HTML وCSV"]},
   extra:{en:"Worked example with three analyses for a fictitious Saudi company: nonconformities by category with CA-EX-01, CA-EX-03 and CA-EX-04 in the vital few, rejected concrete loads with a before/after check (Fishbone FB-EX-02, CAPA CA-EX-04), and the same nonconformities ranked by cost", ar:"مثال تطبيقي بثلاثة تحليلات لشركة سعودية افتراضية: عدم المطابقة بحسب الفئة وفي قلتها الحيوية CA-EX-01 وCA-EX-03 وCA-EX-04، وشحنات الخرسانة المرفوضة مع تحقق قبل وبعد (عظمة السمكة FB-EX-02 وCAPA ‏CA-EX-04)، وعدم المطابقة نفسها مرتبة بالتكلفة"}},''' + s[j:]
rep('capa:"aud",why5:"aud",fish:"aud",w8:"ai"};', 'capa:"aud",why5:"aud",fish:"aud",pareto:"aud",w8:"ai"};')
# 4. grouped "coming soon" toolbox entry: 8 tools left
rep('''{k:"citbox", sys:"aud", pre:"CIA", code:"Toolbox", ed:{en:"9 tools · PDCA, CAPA, 5 Whys and Fishbone are live", ar:"9 أدوات · وأدوات PDCA وCAPA ولماذا الخمس وعظمة السمكة متاحة الآن"},
   name:{en:"Continual Improvement Toolbox: Pareto, A3, DMAIC and six more", ar:"صندوق أدوات التحسين المستمر: باريتو وA3 وDMAIC وست أدوات أخرى"},
   note:{en:"Pareto, root cause analysis, A3, DMAIC, FMEA, lessons learned, SWOT, PESTLE and stakeholder analysis, built on the toolbox engine shared by PDCA, CAPA, 5 Whys and Fishbone and linked to NCRs and audits.", ar:"باريتو، وتحليل السبب الجذري، وA3، وDMAIC، وFMEA، والدروس المستفادة، وSWOT، وPESTLE، وتحليل الأطراف المعنية، مبنية على محرك الصندوق المشترك بين PDCA وCAPA ولماذا الخمس وعظمة السمكة ومربوطة بعدم المطابقة والتدقيق."}}''',
    '''{k:"citbox", sys:"aud", pre:"CIA", code:"Toolbox", ed:{en:"8 tools · PDCA, CAPA, 5 Whys, Fishbone and Pareto are live", ar:"8 أدوات · وأدوات PDCA وCAPA ولماذا الخمس وعظمة السمكة وباريتو متاحة الآن"},
   name:{en:"Continual Improvement Toolbox: root cause analysis, A3, DMAIC and five more", ar:"صندوق أدوات التحسين المستمر: تحليل السبب الجذري وA3 وDMAIC وخمس أدوات أخرى"},
   note:{en:"Root cause analysis, A3, DMAIC, FMEA, lessons learned, SWOT, PESTLE and stakeholder analysis, built on the toolbox engine shared by PDCA, CAPA, 5 Whys, Fishbone and Pareto and linked to NCRs and audits.", ar:"تحليل السبب الجذري، وA3، وDMAIC، وFMEA، والدروس المستفادة، وSWOT، وPESTLE، وتحليل الأطراف المعنية، مبنية على محرك الصندوق المشترك بين PDCA وCAPA ولماذا الخمس وعظمة السمكة وباريتو ومربوطة بعدم المطابقة والتدقيق."}}''')
# 5. knowledge centre topic (after Fishbone)
rep('rel:"Fishbone · ISO 9001 §10.2.1 b)", guide:{k:"fish",a:"explain-std"}},', '''rel:"Fishbone · ISO 9001 §10.2.1 b)", guide:{k:"fish",a:"explain-std"}},
  {en:["Pareto: the vital few","The Pareto chart is a way of ranking categories by how much they contribute to a problem, not a clause of any standard. It serves ISO 9001:2026 clause 9.1.3 (analysing and evaluating data; its note says methods can include statistical techniques) and helps choose where to determine causes under 10.2.1 b) 2). Write the question first, define each category in one line, pick the period and the unit (count is not always the right one), keep “Other” small, and confirm the vital few with judgement: 80/20 is a rule of thumb, not a law. A large category is where to dig, not a cause; check the effect with a second chart on the same basis."],
   ar:["باريتو: القلة الحيوية","مخطط باريتو طريقة لترتيب الفئات بحسب حجم إسهامها في المشكلة، وليس بنداً في أي مواصفة. يخدم البند 9.1.3 من ISO 9001:2026 (تحليل البيانات وتقييمها، وتذكر ملاحظته الأساليب الإحصائية)، ويساعد على اختيار مكان تحديد الأسباب ضمن 10.2.1 ب) 2). اكتب السؤال أولاً، وعرّف كل فئة في سطر، واختر الفترة والوحدة (العدد ليس دائماً الصحيح)، وأبقِ «أخرى» صغيرة، وأكّد القلة الحيوية بالحكم: 80/20 قاعدة تقريبية وليست قانوناً. والفئة الكبيرة مكان تحفر فيه، وليست سبباً؛ وتحقق من الأثر بمخطط ثانٍ على الأساس نفسه."], rel:"Pareto · ISO 9001 §9.1.3", guide:{k:"pareto",a:"explain-std"}},''')
# 6. compliance note (after Fishbone)
rep('''  {k:"oec", name:{en:"Operations Excellence Center",ar:"مركز التميّز التشغيلي"},
   note:{en:"Explanations are written independently''', '''  {k:"pareto", name:{en:"Pareto — Vital Few Analysis",ar:"باريتو — تحليل القلة الحيوية"},
   note:{en:"Pareto analysis is a method for ranking categories, not a standard or a requirement; 80/20 is a rule of thumb. The guide summarises the ISO 9001:2026 clauses it serves (9.1.3 and 10.2.1 b) and the clauses it works with) and ISO 9000:2026 terms and principles in independent wording; clause numbers and titles were checked against the official texts on 2026-10-11, ISO 10009 and ISO 10017 are not verified (not uploaded), and the standards' text remains copyright of ISO. The example analyses are illustrative, not real data.",
         ar:"تحليل باريتو طريقة لترتيب الفئات، وليس مواصفة ولا متطلباً، و80/20 قاعدة تقريبية. يلخص الدليل بنود ISO 9001:2026 التي يخدمها (9.1.3 و10.2.1 ب) والبنود التي يعمل معها) ومصطلحات ISO 9000:2026 ومبادئها بصياغة مستقلة، وقد تُحقق من أرقام البنود وعناوينها من النصوص الرسمية في 2026-10-11، وISO 10009 وISO 10017 غير متحقق منهما (غير مرفوعين)، وحقوق نصوص المواصفات محفوظة لمنظمة ISO. تحليلات المثال توضيحية وليست بيانات حقيقية."}},
  {k:"oec", name:{en:"Operations Excellence Center",ar:"مركز التميّز التشغيلي"},
   note:{en:"Explanations are written independently''')
# 7. performance dashboard: labels, breakdown title, adapter, registry
rep('  fbAs:B("Fishbone self-assessment","التقييم الذاتي لـ عظمة السمكة"),',
    '  paAs:B("Pareto self-assessment","التقييم الذاتي لـ باريتو"), paLk:B("Analyses whose vital few all have a linked next step","التحليلات التي رُبطت كل فئاتها الحيوية بخطوة تالية"), paIm:B("Analyses improved on a before/after check","التحليلات التي تحسنت في التحقق قبل وبعد"),\n  fbAs:B("Fishbone self-assessment","التقييم الذاتي لـ عظمة السمكة"),')
rep('  fish:B("Open items by type (share of analyses)","البنود المفتوحة حسب النوع (نسبة من التحليلات)"),',
    '  fish:B("Open items by type (share of analyses)","البنود المفتوحة حسب النوع (نسبة من التحليلات)"),\n  pareto:B("Open items by type (share of analyses)","البنود المفتوحة حسب النوع (نسبة من التحليلات)"),')
rep('''/* ---------- registry ---------- */''', '''/* ---------- Pareto — Vital few analysis (cia-pareto:v1). Ranking, cut-off line, vital few and stage are the tool's own (modules/pareto.html). ---------- */
function paretoAd(S){
  if(!S) return finish([],null,false);
  const Q=["QD1","QD2","DT1","DT2","DT3","VF1","VF2","AC1","AC2","AC3"], A=(S.assess&&typeof S.assess==="object")?S.assess:{};
  const R=(arr(S.records)||[]).filter(r=>r&&typeof r==="object");
  const ans=Q.filter(q=>num(A[q])!=null), pct=qs=>{ const s=qs.reduce((a,q)=>a+(num(A[q])||0),0); return s/(2*qs.length)*100; };
  const o=x=>(x&&typeof x==="object"&&!Array.isArray(x))?x:{}, tx=v=>String(v==null||typeof v==="object"?"":v).trim(), isD=d=>/^\\d{4}-\\d{2}-\\d{2}$/.test(String(d||""));
  const val=v=>{ const n=typeof v==="number"?v:parseFloat(v); return (isFinite(n)&&n>=0)?n:null; };
  /* the tool's ranking: largest first, ties in entry order; a named category is on the line while the share before it is below the cut-off */
  const rank=r=>{ const C=(arr(r.cats)||[]).filter(c=>c&&typeof c==="object"), cut=Math.max(60,Math.min(90,parseInt(r.cut,10)||80));
    const rows=C.map((c,i)=>({c,i,v:val(c.v)||0})).filter(x=>tx(x.c.name)||val(x.c.v)!=null).sort((a,b)=>(b.v-a.v)||(a.i-b.i));
    const ov=val(o(r.other).v)||0, tot=rows.reduce((a,x)=>a+x.v,0)+ov; let cum=0;
    rows.forEach(x=>{ x.line=x.v>0&&tot>0&&cum/tot*100<cut-1e-9; cum+=x.v; x.vit=x.v>0&&(x.c.vf==="add"?true:(x.c.vf==="drop"?false:x.line)); });
    const named=rows.filter(x=>x.v>0);
    return {rows, V:rows.filter(x=>x.vit), ov, named, other:ov>0&&named.length&&named.some(x=>ov>x.v)}; };
  const linked=x=>{ const n=o(x.c.nx); return ["fish","why5","capa"].includes(n.how)&&!!tx(n.ref); };
  const done=r=>{ const K=rank(r), af=o(r.after); if(!(isD(af.from)&&isD(af.to)&&af.from<=af.to&&["imp","same","worse"].includes(af.verdict))) return false;
    return K.named.every(x=>val(x.c.a)!=null) && (K.ov>0 ? val(o(r.other).a)!=null : true); };
  let lk=0, im=0, nc=0, nl=0, nb=0, ot=0, wt=0;
  R.forEach(r=>{ const K=rank(r), why=K.rows.some(x=>x.v>0&&((x.c.vf==="add"&&!x.line)||(x.c.vf==="drop"&&x.line))&&!tx(x.c.why));
    const data=!!tx(r.q)&&K.named.length>=2, conf=data&&r.vconf===true&&K.V.length>0&&!why, all=conf&&K.V.every(linked), ba=all&&done(r), rv=o(r.review);
    if(all) lk++; if(done(r)&&o(r.after).verdict==="imp") im++;
    if(data&&!conf) nc++; if(conf&&!all) nl++; if(all&&!ba) nb++; if(K.other) ot++; if(ba&&!(tx(rv.by)&&isD(rv.date))) wt++; });
  const m=[ M("paAs", ans.length? pct(Q) : null, "perf", ans.length? `${Math.round(pct(Q))}%` : ""),
            M("paLk", R.length? share(lk,R.length) : null, "perf", R.length? frac(lk,R.length) : ""),
            M("paIm", R.length? share(im,R.length) : null, "prog", R.length? frac(im,R.length) : ""),
            M("an", ans.length? share(ans.length,Q.length) : null, "prog", frac(ans.length,Q.length)) ];
  const IT=[[B("Vital few not confirmed","القلة الحيوية لم تُؤكَّد"),nc,"#C2410C"],[B("Vital-few category without a linked step","فئة حيوية دون خطوة مربوطة"),nl,"#B45309"],
            [B("Effect not checked before/after","الأثر لم يُتحقق منه قبل وبعد"),nb,"#9A3412"],[B("“Other” larger than a named category","«أخرى» أكبر من فئة مسماة"),ot,"#7A869E"],[B("Waiting for independent review","تنتظر مراجعة مستقلة"),wt,"#C9821A"]];
  const bd = R.length ? {t:BDT.pareto, items:IT.map(([l,n,col])=>({l, v:share(n,R.length), t:String(n), col}))} : null;
  return finish(m, bd, ans.length>0 || R.length>0);
}

/* ---------- registry ---------- */''')
rep('  {k:"fish",    sys:"aud", key:"cia-fish:v1", code:"Fishbone", n:B("Fishbone cause and effect analysis","عظمة السمكة — تحليل السبب والنتيجة"), f:fishAd},',
    '  {k:"fish",    sys:"aud", key:"cia-fish:v1", code:"Fishbone", n:B("Fishbone cause and effect analysis","عظمة السمكة — تحليل السبب والنتيجة"), f:fishAd},\n  {k:"pareto",  sys:"aud", key:"cia-pareto:v1", code:"Pareto", n:B("Pareto vital few analysis","باريتو — تحليل القلة الحيوية"), f:paretoAd},')
rep('pdcaAd,capaAd,why5Ad,fishAd}};', 'pdcaAd,capaAd,why5Ad,fishAd,paretoAd}};')
rep('const DEMO_RES = {"fish": ', 'const DEMO_RES = {"pareto": {"st": "none", "idx": null, "comp": null, "m": [], "bd": null}, "fish": ')
# 8. home page data: tool facts, news, request mapping, Advisor rules
rep(' w8: TI(0,7,"modreg"', ''' pareto: TI(10,0,"tools",{en:"Pareto analysis",ar:"تحليل باريتو"},["qhse","aud"],["iso"],
  {en:"Ranks the categories of a problem by how much they contribute, so analysis and action go to the vital few, and checks the effect on the same basis after the action.", ar:"ترتّب فئات المشكلة بحسب حجم إسهامها، فيذهب التحليل والإجراء إلى القلة الحيوية، وتتحقق من الأثر على الأساس نفسه بعد الإجراء."},
  {en:"Without a ranking, effort spreads over every finding at once, or goes to the one that caught attention; the large categories keep coming back.", ar:"بلا ترتيب، يتوزع الجهد على كل الملاحظات معاً، أو يذهب إلى ما لفت الانتباه، فتعود الفئات الكبيرة مرة بعد مرة."},
  {en:"A 10-question self-assessment, a live Pareto chart with an adjustable cut-off, the vital few confirmed by the team, categories built from CAPA, Fishbone or audit data, links to Fishbone, 5 Whys and CAPA, a before/after check, an automatic audit, a dashboard, an HTML report and CSV.", ar:"تقييم ذاتي من 10 أسئلة، ومخطط باريتو حي بخط قطع قابل للتعديل، وقلة حيوية يؤكدها الفريق، وفئات تُبنى من بيانات CAPA أو عظمة السمكة أو التدقيق، وربط بعظمة السمكة ولماذا الخمس وCAPA، وتحقق قبل وبعد، وتدقيق آلي، ولوحة مؤشرات، وتقرير HTML وCSV."},
  {en:"10 minutes for the self-assessment; 30–45 minutes per analysis once the data is ready", ar:"10 دقائق للتقييم الذاتي، و30–45 دقيقة لكل تحليل عندما تكون البيانات جاهزة"}),
 w8: TI(0,7,"modreg"''')
rep('const NEWS = [\n', '''const NEWS = [
  {k:"pareto", d:"2026-10-11", t:{en:"New: Pareto vital few analysis — one question per chart, defined categories, an adjustable cut-off, the vital few linked to Fishbone, 5 Whys or CAPA, and a before/after check.", ar:"جديد: أداة باريتو لتحليل القلة الحيوية — سؤال واحد لكل مخطط، وفئات معرّفة، وخط قطع قابل للتعديل، وقلة حيوية مربوطة بعظمة السمكة أو لماذا الخمس أو CAPA، وتحقق قبل وبعد."}},
''')
rep('why5:["iac",null],fish:["iac",null],w8:["cockpit",null]};', 'why5:["iac",null],fish:["iac",null],pareto:["iac",null],w8:["cockpit",null]};')
rep('["goal","audit",{aud:4,pdca:3,capa:3,why5:2,fish:2,ims:1}],', '["goal","audit",{aud:4,pdca:3,capa:3,why5:2,fish:2,pareto:2,ims:1}],')
rep('["pain","repeat",{aud:2,pdca:2,capa:2,why5:3,fish:2}],', '["pain","repeat",{aud:2,pdca:2,capa:2,why5:3,fish:2,pareto:2}],')
rep('["pain","view",{w8:3}],', '["pain","view",{w8:3,pareto:1}],')
open(path, "w", encoding="utf-8").write(s)
print("index.html: Pareto linked (URL, system row, toolkit card, toolbox entry, knowledge topic, compliance note, dashboard adapter, home data)")
