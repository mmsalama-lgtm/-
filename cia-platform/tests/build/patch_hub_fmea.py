"""Step 2026-10-16 (FMEA): link the FMEA tool in the hub (index.html) from the start. Every anchor must match once.
    python3 tests/build/patch_hub_fmea.py index.html
Then serve the platform folder and run tests/build/demo_fmea.py, which fills DEMO_RES.fmea from the hub's own reading of the FMEA
example (until then a placeholder with st "none" stands in). The hub's ISO 10009 adapter (qtAd) is left as it is, so the snapshot the hub
reads for the guide does not change."""
import sys, os

HERE = os.path.dirname(os.path.abspath(__file__))
path = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, "..", "..", "index.html")
s = open(path, encoding="utf-8").read()
if 'fmea:     "./modules/fmea.html"' in s:
    print("FMEA already linked; nothing to do"); sys.exit(0)


def rep(old, new):
    global s
    n = s.count(old)
    assert n == 1, (n, old[:100])
    s = s.replace(old, new)


# 1. URL
rep('  iso10009: "./modules/iso10009.html"\n};', '  iso10009: "./modules/iso10009.html",\n  fmea:     "./modules/fmea.html"\n};')
# 2. systems: Audit & Improvement row (after the ISO 10009 guide)
rep('حاسبات NPS وOEE وتكلفة الجودة · تغطية المنصة لأدوات المواصفة"}}', '''حاسبات NPS وOEE وتكلفة الجودة · تغطية المنصة لأدوات المواصفة"}},
      {k:"fmea",status:"live", name:{en:"FMEA — Failure Mode and Effects Analysis",ar:"تحليل أنماط الفشل وآثارها FMEA"}, note:{en:"A structured team look ahead at how each process step or design function can fail · written 1–10 severity, occurrence and detection scales agreed before the rating · failure mode, effect, cause, prevention and detection controls · priority number and action priority computed by a written rule, high severity first · actions with an owner and a date, re-rated with evidence; severity falls only with a design or process change · severity × occurrence heat map before and after · dated reviews after a change, a nonconformity or an audit finding · starts from DMAIC, RCA or Pareto · ISO 10009:2024 7.3 · ninth tool of the improvement toolbox", ar:"نظرة فريق منظمة إلى كيف قد تفشل كل خطوة في العملية أو وظيفة في التصميم · مقاييس مكتوبة من 1 إلى 10 للخطورة والحدوث والكشف تُعتمد قبل التقييم · نمط الفشل والأثر والسبب وضوابط المنع والكشف · رقم الأولوية وأولوية الإجراء محسوبان بقاعدة مكتوبة، والخطورة العالية أولاً · إجراءات بمالك وموعد وإعادة تقييم بالدليل؛ والخطورة لا تنخفض إلا بتغيير في التصميم أو العملية · خريطة حرارة للخطورة × الحدوث قبل الإجراءات وبعدها · مراجعات مؤرخة بعد التغيير وعدم المطابقة وملاحظة التدقيق · البدء من DMAIC أو RCA أو باريتو · ISO 10009:2024 البند 7.3 · الأداة التاسعة في صندوق أدوات التحسين"}}''')
# 3. toolkit card (before the cockpit); PDCA's card text
rep('CAPA, 5 Whys, Fishbone, Pareto, root cause analysis, A3 and DMAIC are live, and FMEA and the other toolbox tools follow", ar:"مثال تطبيقي بثلاث دورات لشركة سعودية افتراضية؛ وأدوات CAPA ولماذا الخمس وعظمة السمكة وباريتو وتحليل السبب الجذري وA3 وDMAIC متاحة، ويتبعها FMEA وبقية أدوات الصندوق"}},',
    'CAPA, 5 Whys, Fishbone, Pareto, root cause analysis, A3, DMAIC and FMEA are live, and lessons learned and the other toolbox tools follow", ar:"مثال تطبيقي بثلاث دورات لشركة سعودية افتراضية؛ وأدوات CAPA ولماذا الخمس وعظمة السمكة وباريتو وتحليل السبب الجذري وA3 وDMAIC وFMEA متاحة، ويتبعها الدروس المستفادة وبقية أدوات الصندوق"}},')
anchor = '\n  {k:"w8", color:"--c-ai", pre:"CIA", code:"Cockpit"'
assert s.count(anchor) == 1
s = s.replace(anchor, '''
  {k:"fmea", color:"--c-aud", pre:"CIA", code:"FMEA", ed:{en:"Continual Improvement Toolbox · tool 9", ar:"صندوق أدوات التحسين المستمر · الأداة التاسعة"},
   title:{en:"FMEA — Failure Mode and Effects Analysis", ar:"تحليل أنماط الفشل وآثارها FMEA"},
   feat:{en:["Plain-language method guide: scope and structure first, scales written before the rating, failure mode – effect – cause, prevention and detection controls, severity first and the limits of the priority number, and FMEA as a living document","Clause guide on ISO 10009:2024 subclause 7.3 (with 6.3, 7.1 and Table C.1) and the ISO 9001:2026 clauses the method serves: risks 6.1, controlled conditions 8.5.1 g) preventing human error, control of changes 8.5.6 and corrective action 10.2","Twelve-question self-assessment of your FMEA practice, with a score for each area","One study per process or design function: scope and team, written 1–10 scales agreed before the first rating, 3–15 process steps (taken from a DMAIC SIPOC or written), analysis rows with the priority number and action priority computed by a written rule","Actions with an owner and a date for every high-priority row, re-rating with evidence (severity falls only with a design or process change), flags on \\"human error\\" modes and causes that name a person, dated reviews","Severity × occurrence heat maps before and after the actions and a before/after chart of the top rows, starts from DMAIC, RCA or Pareto (read-only preview), causes from Fishbone, 5 Whys or RCA, links to PDCA and CAPA, automatic audit, dashboard, HTML report with the charts and CSV"],
         ar:["دليل منهجية بلغة بسيطة: النطاق والبنية أولاً، والمقاييس المكتوبة قبل التقييم، ونمط الفشل والأثر والسبب، وضوابط المنع والكشف، والخطورة أولاً وحدود رقم الأولوية، وFMEA وثيقة حية","دليل البند 7.3 من ISO 10009:2024 (مع 6.3 و7.1 والجدول C.1) وبنود ISO 9001:2026 التي يخدمها المنهج: المخاطر 6.1، والضبط 8.5.1 ز) منع الخطأ البشري، وضبط التغييرات 8.5.6، والإجراء التصحيحي 10.2","تقييم ذاتي من اثني عشر سؤالاً لممارسة FMEA، بنتيجة لكل محور","دراسة لكل عملية أو وظيفة: النطاق والفريق، ومقاييس مكتوبة من 1 إلى 10 تُعتمد قبل أول تقييم، و3 إلى 15 خطوة (من SIPOC مشروع DMAIC أو تُكتب)، وصفوف تحليل برقم الأولوية وأولوية الإجراء محسوبين بقاعدة مكتوبة","إجراء بمالك وموعد لكل صف عالي الأولوية، وإعادة تقييم بالدليل (الخطورة لا تنخفض إلا بتغيير في التصميم أو العملية)، وتنبيه على «الخطأ البشري» والأسباب التي تشير إلى شخص، ومراجعات مؤرخة","خريطتا حرارة للخطورة × الحدوث قبل الإجراءات وبعدها ورسم قبل/بعد للصفوف الأعلى، والبدء من DMAIC أو RCA أو باريتو بمعاينة للقراءة فقط، وأسباب من عظمة السمكة أو لماذا الخمس أو RCA، وروابط PDCA وCAPA، وتدقيق آلي، ولوحة مؤشرات، وتقرير HTML بالرسوم وCSV"]},
   extra:{en:"Worked example with three studies for a fictitious Saudi company: concrete receiving and pouring after the DMAIC project (steps from the DM-EX-01 SIPOC, the chilled-water and thermometer rows re-rated after the actions, reviewed; PDCA PD-EX-03), tower-crane lifting of rebar bundles (from RC-EX-02 and A3-EX-02; severity-10 rows acted on first whatever their priority number, one cause still written as a person's inattention), and the calibration process reviewed after the DM-EX-03 hand-over (CAPA CA-EX-02)", ar:"مثال تطبيقي بثلاث دراسات لشركة سعودية افتراضية: استلام الخرسانة وصبها بعد مشروع DMAIC (الخطوات من SIPOC المشروع DM-EX-01، وصفوف الماء المبرد وميزان الحرارة أعيد تقييمها بعد الإجراءات، وروجعت؛ ودورة PD-EX-03)، ورفع حزم الحديد بالرافعة البرجية (من RC-EX-02 وA3-EX-02؛ عولجت صفوف الخطورة 10 أولاً مهما كان رقم أولويتها، وسبب ما زال مكتوباً «عدم انتباه» شخص)، وعملية المعايرة التي روجعت بعد تسليم DM-EX-03 (سجل CAPA CA-EX-02)"}},''' + anchor)
rep('dmaic:"aud",iso10009:"aud"', 'dmaic:"aud",iso10009:"aud",fmea:"aud"')
# 4. grouped "coming soon" toolbox entry: 4 tools left
rep('''{k:"citbox", sys:"aud", pre:"CIA", code:"Toolbox", ed:{en:"5 tools · PDCA, CAPA, 5 Whys, Fishbone, Pareto, RCA, A3 and DMAIC are live", ar:"5 أدوات · وأدوات PDCA وCAPA ولماذا الخمس وعظمة السمكة وباريتو وتحليل السبب الجذري وA3 وDMAIC متاحة الآن"},
   name:{en:"Continual Improvement Toolbox: FMEA and four more", ar:"صندوق أدوات التحسين المستمر: FMEA وأربع أدوات أخرى"},
   note:{en:"FMEA, lessons learned, SWOT, PESTLE and stakeholder analysis, built on the toolbox engine shared by PDCA, CAPA, 5 Whys, Fishbone, Pareto, RCA, A3 and DMAIC and linked to NCRs and audits.", ar:"FMEA، والدروس المستفادة، وSWOT، وPESTLE، وتحليل الأطراف المعنية، مبنية على محرك الصندوق المشترك بين PDCA وCAPA ولماذا الخمس وعظمة السمكة وباريتو وتحليل السبب الجذري وA3 وDMAIC ومربوطة بعدم المطابقة والتدقيق."}}''',
    '''{k:"citbox", sys:"aud", pre:"CIA", code:"Toolbox", ed:{en:"4 tools · PDCA, CAPA, 5 Whys, Fishbone, Pareto, RCA, A3, DMAIC and FMEA are live", ar:"4 أدوات · وأدوات PDCA وCAPA ولماذا الخمس وعظمة السمكة وباريتو وتحليل السبب الجذري وA3 وDMAIC وFMEA متاحة الآن"},
   name:{en:"Continual Improvement Toolbox: lessons learned and three more", ar:"صندوق أدوات التحسين المستمر: الدروس المستفادة وثلاث أدوات أخرى"},
   note:{en:"Lessons learned, SWOT, PESTLE and stakeholder analysis, built on the toolbox engine shared by PDCA, CAPA, 5 Whys, Fishbone, Pareto, RCA, A3, DMAIC and FMEA and linked to NCRs and audits.", ar:"الدروس المستفادة، وSWOT، وPESTLE، وتحليل الأطراف المعنية، مبنية على محرك الصندوق المشترك بين PDCA وCAPA ولماذا الخمس وعظمة السمكة وباريتو وتحليل السبب الجذري وA3 وDMAIC وFMEA ومربوطة بعدم المطابقة والتدقيق."}}''')
# 5. knowledge centre topic (after DMAIC)
rep('rel:"DMAIC · ISO 9001 §7.1.5 · §9.1.3", guide:{k:"dmaic",a:"explain-std"}},', '''rel:"DMAIC · ISO 9001 §7.1.5 · §9.1.3", guide:{k:"dmaic",a:"explain-std"}},
  {en:["FMEA: looking at failure before it happens","FMEA (failure mode and effects analysis) is a method, not a requirement of any standard; ISO 10009:2024 reviews it in subclause 7.3. A team looks at each process step (or design function): how it could fail, what the customer or the next step would see, what could cause it, and which controls prevent or detect it. The severity, occurrence and detection scales are written before the rating and kept the same. Severity is rated on the effect and falls only with a design or process change, never with a check. The risk priority number hides big severities, so high severity is treated first whatever the number. \\"Human error\\" is a cause to design out (ISO 9001:2026 8.5.1 g)), not a failure mode to blame. Actions get an owner and a date and are re-rated with evidence, and the study stays alive: reviewed after a change (8.5.6), a nonconformity (10.2) or an audit finding. It uses Pareto, RCA, Fishbone, 5 Whys, DMAIC, A3, CAPA and PDCA rather than replacing them."],
   ar:["FMEA: النظر إلى الفشل قبل وقوعه","FMEA (تحليل أنماط الفشل وآثارها) منهج، وليس متطلباً في أي مواصفة؛ وتراجعه ISO 10009:2024 في البند 7.3. ينظر فريق إلى كل خطوة في العملية (أو وظيفة في التصميم): كيف قد تفشل، وماذا يرى العميل أو الخطوة التالية، وما الذي قد يسبب ذلك، وما الضوابط التي تمنعه أو تكشفه. وتُكتب مقاييس الخطورة والحدوث والكشف قبل التقييم وتبقى نفسها. والخطورة تُقيَّم على الأثر ولا تنخفض إلا بتغيير في التصميم أو العملية، لا بفحص. ورقم الأولوية يخفي الخطورة الكبيرة، فتُعالج الخطورة العالية أولاً مهما كان الرقم. و«الخطأ البشري» سبب يُزال بالتصميم (ISO 9001:2026 البند 8.5.1 ز)، لا نمط فشل يُلام عليه أحد. وللإجراءات مالك وموعد، ويُعاد التقييم بالدليل، وتبقى الدراسة حية: تُراجع بعد التغيير (8.5.6) وعدم المطابقة (10.2) وملاحظة التدقيق. وتستخدم باريتو وRCA وعظمة السمكة ولماذا الخمس وDMAIC وA3 وCAPA وPDCA ولا تحل محلها."], rel:"FMEA · ISO 10009 §7.3 · ISO 9001 §6.1", guide:{k:"fmea",a:"explain-std"}},''')
# 6. compliance note
rep('''  {k:"oec", name:{en:"Operations Excellence Center",ar:"مركز التميّز التشغيلي"},
   note:{en:"Explanations are written independently''', '''  {k:"fmea", name:{en:"FMEA — Failure Mode and Effects Analysis",ar:"تحليل أنماط الفشل وآثارها FMEA"},
   note:{en:"FMEA is a method, not a standard or a requirement. The guide summarises ISO 10009:2024 subclause 7.3 (with 6.3, 7.1, 7.2, 7.5 and Tables A.3 and C.1; guidance, not requirements) and the ISO 9001:2026 clauses the method serves (6.1.2 with Annex A.6.1.2, 8.1, 8.3.4, 8.5.1 c) and g), 8.5.6, 9.1.3, 10.1 and 10.2.1) with ISO 9000:2026 principles, in independent wording; clause references were checked on the build date (2026-10-16) against the official texts (ISO 10009 through the platform's checked catalogue). IEC 60812, the AIAG-VDA FMEA handbook, ISO 31000 and ISO 31010 are not verified (not uploaded); the default scales and the action priority rule are the tool's own wording. The standards' text remains copyright of ISO. The example studies are illustrative, not real data.",
         ar:"FMEA منهج، وليس مواصفة ولا متطلباً. يلخص الدليل البند 7.3 من ISO 10009:2024 (مع 6.3 و7.1 و7.2 و7.5 والجدولين A.3 وC.1؛ إرشادات لا متطلبات) وبنود ISO 9001:2026 التي يخدمها المنهج (6.1.2 مع الملحق A.6.1.2، و8.1، و8.3.4، و8.5.1 ج) وز)، و8.5.6، و9.1.3، و10.1، و10.2.1) ومبادئ ISO 9000:2026 بصياغة مستقلة، وقد تُحقق من مراجع البنود في تاريخ البناء (2026-10-16) من النصوص الرسمية (ISO 10009 عبر فهرس المنصة المتحقق منه). IEC 60812 ودليل AIAG-VDA FMEA وISO 31000 وISO 31010 غير متحقق منها (غير مرفوعة)، والمقاييس الافتراضية وقاعدة أولوية الإجراء صياغة الأداة. وحقوق نصوص المواصفات محفوظة لمنظمة ISO. دراسات المثال توضيحية وليست بيانات حقيقية."}},
  {k:"oec", name:{en:"Operations Excellence Center",ar:"مركز التميّز التشغيلي"},
   note:{en:"Explanations are written independently''')
# 7. performance dashboard: labels, breakdown title, adapter, registry (qtAd unchanged)
rep('  qtAs:B("Quality tools self-assessment (ISO 10009)","التقييم الذاتي لأدوات الجودة (ISO 10009)"),',
    '  fmAs:B("FMEA self-assessment","التقييم الذاتي لـ FMEA"), fmHigh:B("FMEA studies whose high-priority rows all have an owned action","دراسات FMEA التي لكل صف عالي الأولوية فيها إجراء بمالك"), fmRe:B("FMEA studies re-rated with evidence after all their actions","دراسات FMEA المعاد تقييمها بالدليل بعد كل إجراءاتها"),\n  qtAs:B("Quality tools self-assessment (ISO 10009)","التقييم الذاتي لأدوات الجودة (ISO 10009)"),')
rep('  iso10009:B("Open items by type (share of storyboards)","البنود المفتوحة حسب النوع (نسبة من لوحات القصة)"),',
    '  iso10009:B("Open items by type (share of storyboards)","البنود المفتوحة حسب النوع (نسبة من لوحات القصة)"),\n  fmea:B("Open items by type (share of studies)","البنود المفتوحة حسب النوع (نسبة من الدراسات)"),')
rep('''/* ---------- registry ---------- */''', '''/* ---------- FMEA — failure mode and effects analysis (cia-fmea:v1). The written scales, the action priority rule (severity first, then
   severity × occurrence, then detection), the severity rule and the re-rating are the tool's own rules (modules/fmea.html). ---------- */
function fmeaAd(S){
  if(!S) return finish([],null,false);
  const Q=["PP1","PP2","PP3","AN1","AN2","AN3","AC1","AC2","AC3","AC4","LV1","LV2"], A=(S.assess&&typeof S.assess==="object")?S.assess:{};
  const R=(arr(S.records)||[]).filter(r=>r&&typeof r==="object");
  const ans=Q.filter(q=>num(A[q])!=null), pct=qs=>{ const s=qs.reduce((a,q)=>a+(num(A[q])||0),0); return s/(2*qs.length)*100; };
  const o=x=>(x&&typeof x==="object"&&!Array.isArray(x))?x:{}, tx=v=>String(v==null||typeof v==="object"?"":v).trim(), isD=d=>/^\\d{4}-\\d{2}-\\d{2}$/.test(String(d||""));
  const L2=v=>(Array.isArray(v)?v:[]).filter(x=>x&&typeof x==="object"), rt=v=>{ const n=Number(v); return (v!==null&&v!==""&&v!==undefined&&isFinite(n)&&n>=1&&n<=10&&Math.round(n)===n)?n:null; };
  const HUMAN=/(خطأ\\s*(بشري|العامل|الموظف|الفني|المشغل|السائق|الرافع)|human\\s*error|operator\\s*error|worker\\s*error|staff\\s*error|employee\\s*error|rigger\\s*error|driver\\s*error|mistake\\s*by)/i;
  const PERSON=/(خطأ\\s*(بشري|العامل|الموظف|الفني|المشغل|السائق|الشخص|الرافع|المشرف)|إهمال|اهمال|تقصير|عدم\\s*(انتباه|الانتباه|تركيز|التركيز)|سهو|لامبالاة|human\\s*error|operator\\s*error|worker\\s*error|staff\\s*error|employee\\s*error|rigger\\s*error|driver\\s*error|negligen|careless|inattent|not\\s*paying\\s*attention|lack\\s*of\\s*attention|complacen)/i;
  const ap=(s,oc,d)=>{ if(!s||!oc||!d) return ""; const so=s*oc; if(s>=9||so>=40||(so>=20&&d>=7)) return "H"; if(so>=20||(so>=10&&d>=6)||(s>=7&&d>=7)) return "M"; return "L"; };
  const read=r=>{ const sc=o(r.sc), W=L2(r.rows).filter(w=>tx(w.mode)||tx(w.cause)||tx(w.eff)||rt(w.s)||rt(w.o)||rt(w.d)), AC=L2(r.acts).filter(a=>tx(a.what));
    const full=["S","O","D"].every(k=>Array.isArray(sc[k])&&sc[k].length>=10&&sc[k].slice(0,10).every(x=>tx(x))), rated=W.some(w=>rt(w.s)||rt(w.o)||rt(w.d));
    const scBad=!full||!isD(sc.date)||(rated&&!isD(r.rated))||(isD(sc.date)&&isD(r.rated)&&sc.date>r.rated);
    const owned=a=>!!tx(a.who)&&isD(a.by), byRow=id=>AC.filter(a=>String(a.row)===String(id));
    const H=W.filter(w=>ap(rt(w.s),rt(w.o),rt(w.d))==="H"), hOpen=H.filter(w=>!byRow(w.id).some(owned)).length;
    const human=W.some(w=>HUMAN.test(String(w.mode))||PERSON.test(String(w.cause)));
    const sevBad=AC.some(a=>{ const w=W.filter(x=>String(x.id)===String(a.row))[0]; return w&&rt(w.s)&&rt(a.ns)&&rt(a.ns)<rt(w.s)&&a.kind!=="change"; });
    const re=a=>a.st==="done"&&isD(a.done)&&!!(rt(a.ns)&&rt(a.no)&&rt(a.nd))&&!!tx(a.ev), allRe=AC.length>0&&AC.every(re);
    const last=[r.rated].concat(AC.map(a=>a.st==="done"?a.done:"")).filter(isD).sort().pop()||"";
    const lr=L2(r.reviews).filter(v=>isD(v.date)&&tx(v.team)).map(v=>v.date).sort().pop()||"";
    const reBad=AC.some(a=>a.st==="done"&&!re(a))||(allRe&&!(lr&&(!last||lr>=last)));
    return {hi:W.length>0&&!hOpen, re:allRe, scBad, hBad:hOpen>0, human, sevBad, reBad}; };
  let hi=0, re=0, sb=0, hb=0, hm=0, sv=0, rb=0;
  R.forEach(r=>{ const x=read(r); if(x.hi) hi++; if(x.re) re++; if(x.scBad) sb++; if(x.hBad) hb++; if(x.human) hm++; if(x.sevBad) sv++; if(x.reBad) rb++; });
  const m=[ M("fmAs", ans.length? pct(Q) : null, "perf", ans.length? `${Math.round(pct(Q))}%` : ""),
            M("fmHigh", R.length? share(hi,R.length) : null, "perf", R.length? frac(hi,R.length) : ""),
            M("fmRe", R.length? share(re,R.length) : null, "prog", R.length? frac(re,R.length) : ""),
            M("an", ans.length? share(ans.length,Q.length) : null, "prog", frac(ans.length,Q.length)) ];
  const IT=[[B("Scales incomplete, undated or agreed after the rating","مقاييس ناقصة أو غير مؤرخة أو اعتُمدت بعد التقييم"),sb,"#B8901E"],[B("High-priority row with no owned action","صف عالي الأولوية بلا إجراء بمالك"),hb,"#B42318"],
            [B("\\"Human error\\" as a mode, or a cause that names a person","«خطأ بشري» نمطاً أو سبب يشير إلى شخص"),hm,"#C2410C"],[B("Severity lowered without a design or process change","خطورة خُفضت دون تغيير في التصميم أو العملية"),sv,"#7B5BB8"],
            [B("Action done but not re-rated, or no review after the last change","إجراء نُفّذ دون إعادة تقييم، أو لا مراجعة بعد آخر تغيير"),rb,"#C9821A"]];
  const bd = R.length ? {t:BDT.fmea, items:IT.map(([l,n,col])=>({l, v:share(n,R.length), t:String(n), col}))} : null;
  return finish(m, bd, ans.length>0 || R.length>0);
}

/* ---------- registry ---------- */''')
rep('  {k:"iso10009", sys:"aud", key:"cia-iso10009:v1", code:"10009", n:B("ISO 10009 quality tools guide","دليل أدوات الجودة ISO 10009"), f:qtAd},',
    '  {k:"iso10009", sys:"aud", key:"cia-iso10009:v1", code:"10009", n:B("ISO 10009 quality tools guide","دليل أدوات الجودة ISO 10009"), f:qtAd},\n  {k:"fmea",    sys:"aud", key:"cia-fmea:v1", code:"FMEA", n:B("FMEA — failure mode and effects analysis","تحليل أنماط الفشل وآثارها FMEA"), f:fmeaAd},')
rep('rcaAd,a3Ad,dmaicAd,qtAd}};', 'rcaAd,a3Ad,dmaicAd,qtAd,fmeaAd}};')
rep('const DEMO_RES = {"iso10009": ', 'const DEMO_RES = {"fmea": {"st": "none", "idx": null, "comp": null, "m": [], "bd": null}, "iso10009": ')
# 8. home page data: tool facts, news, request mapping, Advisor rules
rep(' iso10009: TI(16,0,"tools"', ''' fmea: TI(12,0,"tools",{en:"FMEA study",ar:"دراسة FMEA"},["qhse","aud","exc"],["iso"],
  {en:"Runs a team FMEA of a process or a design function: written scales agreed before the rating, failure modes with their effects and causes, prevention and detection controls, the action priority with high severity first, actions with an owner and a date, and a new rating with evidence.", ar:"تدير دراسة FMEA بفريق لعملية أو وظيفة في التصميم: مقاييس مكتوبة تُعتمد قبل التقييم، وأنماط فشل بآثارها وأسبابها، وضوابط المنع والكشف، وأولوية إجراء تبدأ بالخطورة العالية، وإجراءات بمالك وموعد، وتقييم جديد بالدليل."},
  {en:"Failures that hurt people or customers are cheaper to prevent than to investigate. A study that ranks by severity first, not by a single number, and stays alive after each change or failure keeps the worst ones from happening.", ar:"الأعطال التي تؤذي الناس أو العملاء أرخص في منعها من التحقيق فيها. دراسة ترتب بالخطورة أولاً لا برقم واحد، وتبقى حية بعد كل تغيير أو فشل، تمنع الأخطر من الوقوع."},
  {en:"A 12-question self-assessment, written 1–10 scales, 3–15 process steps from a DMAIC SIPOC, analysis rows with the priority number and action priority computed, flags on \\"human error\\", actions and re-rating with the severity rule, dated reviews, severity × occurrence heat maps before and after, starts from DMAIC, RCA or Pareto, an automatic audit, a dashboard, an HTML report and CSV.", ar:"تقييم ذاتي من 12 سؤالاً، ومقاييس مكتوبة من 1 إلى 10، و3 إلى 15 خطوة من SIPOC مشروع DMAIC، وصفوف تحليل برقم الأولوية وأولوية الإجراء محسوبين، وتنبيه على «الخطأ البشري»، وإجراءات وإعادة تقييم بقاعدة الخطورة، ومراجعات مؤرخة، وخريطتا حرارة قبل الإجراءات وبعدها، والبدء من DMAIC أو RCA أو باريتو، وتدقيق آلي، ولوحة مؤشرات، وتقرير HTML وCSV."},
  {en:"12 minutes for the self-assessment; 2–3 hours with the team for a first study of a short process, then a review after each change", ar:"12 دقيقة للتقييم الذاتي، وساعتان إلى ثلاث مع الفريق لأول دراسة لعملية قصيرة، ثم مراجعة بعد كل تغيير"}),
 iso10009: TI(16,0,"tools"''')
rep('const NEWS = [\n', '''const NEWS = [
  {k:"fmea", d:"2026-10-16", t:{en:"New: FMEA — failure mode and effects analysis. Written scales before the rating, high severity first whatever the priority number, actions re-rated with evidence, a severity × occurrence heat map, and studies that start from DMAIC, RCA or Pareto.", ar:"جديد: تحليل أنماط الفشل وآثارها FMEA — مقاييس مكتوبة قبل التقييم، والخطورة العالية أولاً مهما كان رقم الأولوية، وإجراءات يُعاد تقييمها بالدليل، وخريطة حرارة للخطورة × الحدوث، ودراسات تبدأ من DMAIC أو RCA أو باريتو."}},
''')
rep('dmaic:["iac",null],iso10009:["iac",null],w8:["cockpit",null]};', 'dmaic:["iac",null],iso10009:["iac",null],fmea:["iac",null],w8:["cockpit",null]};')
rep('["goal","risk",{iso31000:4,iso22301:2,w8:1}],', '["goal","risk",{iso31000:4,iso22301:2,w8:1,fmea:1}],')
rep('["goal","audit",{aud:4,pdca:3,capa:3,why5:2,fish:2,pareto:2,rca:2,a3:2,dmaic:1,iso10009:1,ims:1}],', '["goal","audit",{aud:4,pdca:3,capa:3,why5:2,fish:2,pareto:2,rca:2,a3:2,dmaic:1,iso10009:1,fmea:1,ims:1}],')
rep('["pain","repeat",{aud:2,pdca:2,capa:2,why5:3,fish:2,pareto:2,rca:2,a3:1,dmaic:2,iso10009:1}],', '["pain","repeat",{aud:2,pdca:2,capa:2,why5:3,fish:2,pareto:2,rca:2,a3:1,dmaic:2,iso10009:1,fmea:1}],')
rep('["pain","risks",{iso31000:2}],', '["pain","risks",{iso31000:2,fmea:1}],')
open(path, "w", encoding="utf-8").write(s)
print("index.html: FMEA linked (URL, system row, toolkit card, toolbox entry, knowledge topic, compliance note, dashboard adapter, home data)")
