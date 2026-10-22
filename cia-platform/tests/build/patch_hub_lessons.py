"""Step 2026-10-16 (Lessons Learned): link the Lessons Learned tool in the hub (index.html) from the start. Every anchor must match once.
    python3 tests/build/patch_hub_lessons.py index.html
Then serve the platform folder and run tests/build/demo_lessons.py, which fills DEMO_RES.lessons from the hub's own reading of the
Lessons Learned example (until then a placeholder with st "none" stands in). The other adapters (fmeaAd, qtAd …) are left as they are, so
the snapshots the hub reads for the other tools do not change."""
import sys, os

HERE = os.path.dirname(os.path.abspath(__file__))
path = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, "..", "..", "index.html")
s = open(path, encoding="utf-8").read()
if 'lessons:  "./modules/lessons.html"' in s:
    print("Lessons Learned already linked; nothing to do"); sys.exit(0)


def rep(old, new):
    global s
    n = s.count(old)
    assert n == 1, (n, old[:100])
    s = s.replace(old, new)


# 1. URL
rep('  fmea:     "./modules/fmea.html"\n};', '  fmea:     "./modules/fmea.html",\n  lessons:  "./modules/lessons.html"\n};')
# 2. systems: Audit & Improvement row (after FMEA)
rep('البدء من DMAIC أو RCA أو باريتو · ISO 10009:2024 البند 7.3 · الأداة التاسعة في صندوق أدوات التحسين"}}', '''البدء من DMAIC أو RCA أو باريتو · ISO 10009:2024 البند 7.3 · الأداة التاسعة في صندوق أدوات التحسين"}},
      {k:"lessons",status:"live", name:{en:"Lessons Learned Register",ar:"سجل الدروس المستفادة"}, note:{en:"One record per lesson: what happened and the evidence, the cause taken read-only from a real analysis (RCA, 5 Whys, Fishbone, A3, DMAIC, FMEA, CAPA), the lesson written as a rule others can apply (When…, do…, because…) with where it applies · embedding actions that change a procedure, a form, a checklist, a training, an FMEA row or a control plan, with an owner, a date and evidence · verification on the next project and sharing · computed stages, blame-free wording, a search of the register and a read-before-you-start list · starts from RCA, A3, DMAIC, FMEA, CAPA or PDCA · a practice serving ISO 9001:2026 7.1.6 and 10.2.1 · tenth tool of the improvement toolbox", ar:"سجل لكل درس: ما حدث بدليله، والسبب مأخوذ للقراءة فقط من تحليل حقيقي (RCA أو لماذا الخمس أو عظمة السمكة أو A3 أو DMAIC أو FMEA أو CAPA)، والدرس قاعدة يطبقها غيرك (عندما… افعل… لأن…) مع أين تنطبق · إجراءات ترسيخ تغيّر إجراءً أو نموذجاً أو قائمة فحص أو تدريباً أو صفاً في FMEA أو خطة ضبط، بمالك وموعد ودليل · تحقق في المشروع التالي وتعميم · مراحل محسوبة، وصياغة بلا لوم، وبحث في السجل، وقائمة «اقرأ قبل أن تبدأ» · البدء من RCA أو A3 أو DMAIC أو FMEA أو CAPA أو PDCA · ممارسة تخدم ISO 9001:2026 البندين 7.1.6 و10.2.1 · الأداة العاشرة في صندوق أدوات التحسين"}}''')
# 3. toolkit card (before the cockpit); PDCA's card text
rep('CAPA, 5 Whys, Fishbone, Pareto, root cause analysis, A3, DMAIC and FMEA are live, and lessons learned and the other toolbox tools follow", ar:"مثال تطبيقي بثلاث دورات لشركة سعودية افتراضية؛ وأدوات CAPA ولماذا الخمس وعظمة السمكة وباريتو وتحليل السبب الجذري وA3 وDMAIC وFMEA متاحة، ويتبعها الدروس المستفادة وبقية أدوات الصندوق"}},',
    'CAPA, 5 Whys, Fishbone, Pareto, root cause analysis, A3, DMAIC, FMEA and lessons learned are live, and SWOT and the other toolbox tools follow", ar:"مثال تطبيقي بثلاث دورات لشركة سعودية افتراضية؛ وأدوات CAPA ولماذا الخمس وعظمة السمكة وباريتو وتحليل السبب الجذري وA3 وDMAIC وFMEA والدروس المستفادة متاحة، ويتبعها SWOT وبقية أدوات الصندوق"}},')
anchor = '\n  {k:"w8", color:"--c-ai", pre:"CIA", code:"Cockpit"'
assert s.count(anchor) == 1
s = s.replace(anchor, '''
  {k:"lessons", color:"--c-aud", pre:"CIA", code:"LL", ed:{en:"Continual Improvement Toolbox · tool 10", ar:"صندوق أدوات التحسين المستمر · الأداة العاشرة"},
   title:{en:"Lessons Learned Register", ar:"سجل الدروس المستفادة"},
   feat:{en:["Plain-language method guide: a lesson is learned only when a document, a control or a practice has changed and the next project used it and it worked; successes are lessons too; blame-free wording; the register is read before each project or change","Clause guide on the ISO 9001:2026 clauses the practice serves (organizational knowledge 7.1.6, communication 7.4, 8.1 and 8.5.6, 9.1.3, management review 9.3.2, 10.1 and 10.2.1 e) and f)), ISO 9000:2026 good practice and knowledge, ISO 10009:2024 clause 15 and ISO 19011:2026","Twelve-question self-assessment of your lessons-learned practice, with a score for each area","One record per lesson: what happened with its evidence and expected against actual, the cause taken read-only from a linked analysis (a cause written here is flagged \\"not analysed\\" and refused for a severe event), the lesson as a rule (When…, do…, because…) with where it applies and where it does not","Embedding actions (procedure, form, checklist, training, FMEA row, control plan, design standard, contract clause) with an owner, a date and evidence of the change, verification after the actions on the next project, sharing, and seven computed stages","A search of the register and a \\"read before you start\\" list for a process or project type, a chart of lessons by stage and type, starts from RCA, A3, DMAIC, FMEA, CAPA or PDCA (read-only preview), FMEA lists the lessons that name a study, automatic audit, dashboard, HTML report and CSV"],
         ar:["دليل منهجية بلغة بسيطة: الدرس لا يكون مستفاداً حتى تتغير وثيقة أو ضابط أو ممارسة ويستخدمه المشروع التالي وينجح؛ والنجاحات دروس أيضاً؛ وصياغة بلا لوم؛ والسجل يُقرأ قبل كل مشروع أو تغيير","دليل بنود ISO 9001:2026 التي تخدمها الممارسة (المعرفة التنظيمية 7.1.6، والتواصل 7.4، و8.1 و8.5.6، و9.1.3، ومراجعة الإدارة 9.3.2، و10.1، و10.2.1 هـ) و و))، والممارسة الجيدة والمعرفة في ISO 9000:2026، والبند 15 من ISO 10009:2024، وISO 19011:2026","تقييم ذاتي من اثني عشر سؤالاً لممارسة الدروس المستفادة، بنتيجة لكل محور","سجل لكل درس: ما حدث بدليله والمتوقع مقابل الفعلي، والسبب مأخوذ للقراءة فقط من تحليل مرتبط (السبب المكتوب هنا «غير محلل» ولا يُقبل لحدث جسيم)، والدرس قاعدة (عندما… افعل… لأن…) مع أين تنطبق وأين لا تنطبق","إجراءات ترسيخ (إجراء، نموذج، قائمة فحص، تدريب، صف FMEA، خطة ضبط، معيار تصميم، بند عقد) بمالك وموعد ودليل على التغيير، وتحقق بعد الإجراءات في المشروع التالي، وتعميم، وسبع مراحل محسوبة","بحث في السجل وقائمة «اقرأ قبل أن تبدأ» لعملية أو نوع مشروع، ورسم الدروس حسب المرحلة والنوع، والبدء من RCA أو A3 أو DMAIC أو FMEA أو CAPA أو PDCA بمعاينة للقراءة فقط، ودراسة FMEA تعرض الدروس التي تذكرها، وتدقيق آلي، ولوحة مؤشرات، وتقرير HTML وCSV"]},
   extra:{en:"Worked example with three lessons for a fictitious Saudi company: summer concrete (from DM-EX-01 and FM-EX-01: chilled water written into every ready-mix supply contract and the monthly thermometer check; verified on a second project, PRJ-2026-118, and shared), lifting rebar bundles (from RC-EX-02, A3-EX-02 and FM-EX-02: banded bundles and two slings as a company standard and the weight on the bundle tag; a success shared with Tower A), and calibration (from DM-EX-03, CA-EX-02 and FM-EX-03: rental orders that require the certificate; embedded, waiting for verification)", ar:"مثال تطبيقي بثلاثة دروس لشركة سعودية افتراضية: خرسانة الصيف (من DM-EX-01 وFM-EX-01: الماء المبرد في كل عقد توريد خرسانة جاهزة وفحص موازين الحرارة الشهري؛ تُحقق منه في مشروع ثانٍ PRJ-2026-118 وعُمّم)، ورفع حزم الحديد (من RC-EX-02 وA3-EX-02 وFM-EX-02: حزم مربوطة وحبلان معياراً للشركة ووزن الحزمة على بطاقتها؛ نجاح عُمّم على البرج أ)، والمعايرة (من DM-EX-03 وCA-EX-02 وFM-EX-03: أوامر الاستئجار تشترط الشهادة؛ رُسّخ وينتظر التحقق)"}},''' + anchor)
rep('dmaic:"aud",iso10009:"aud",fmea:"aud"', 'dmaic:"aud",iso10009:"aud",fmea:"aud",lessons:"aud"')
# 4. grouped "coming soon" toolbox entry: 3 tools left
rep('''{k:"citbox", sys:"aud", pre:"CIA", code:"Toolbox", ed:{en:"4 tools · PDCA, CAPA, 5 Whys, Fishbone, Pareto, RCA, A3, DMAIC and FMEA are live", ar:"4 أدوات · وأدوات PDCA وCAPA ولماذا الخمس وعظمة السمكة وباريتو وتحليل السبب الجذري وA3 وDMAIC وFMEA متاحة الآن"},
   name:{en:"Continual Improvement Toolbox: lessons learned and three more", ar:"صندوق أدوات التحسين المستمر: الدروس المستفادة وثلاث أدوات أخرى"},
   note:{en:"Lessons learned, SWOT, PESTLE and stakeholder analysis, built on the toolbox engine shared by PDCA, CAPA, 5 Whys, Fishbone, Pareto, RCA, A3, DMAIC and FMEA and linked to NCRs and audits.", ar:"الدروس المستفادة، وSWOT، وPESTLE، وتحليل الأطراف المعنية، مبنية على محرك الصندوق المشترك بين PDCA وCAPA ولماذا الخمس وعظمة السمكة وباريتو وتحليل السبب الجذري وA3 وDMAIC وFMEA ومربوطة بعدم المطابقة والتدقيق."}}''',
    '''{k:"citbox", sys:"aud", pre:"CIA", code:"Toolbox", ed:{en:"3 tools · PDCA, CAPA, 5 Whys, Fishbone, Pareto, RCA, A3, DMAIC, FMEA and Lessons Learned are live", ar:"3 أدوات · وأدوات PDCA وCAPA ولماذا الخمس وعظمة السمكة وباريتو وتحليل السبب الجذري وA3 وDMAIC وFMEA والدروس المستفادة متاحة الآن"},
   name:{en:"Continual Improvement Toolbox: SWOT and two more", ar:"صندوق أدوات التحسين المستمر: SWOT وأداتان أخريان"},
   note:{en:"SWOT, PESTLE and stakeholder analysis, built on the toolbox engine shared by PDCA, CAPA, 5 Whys, Fishbone, Pareto, RCA, A3, DMAIC, FMEA and Lessons Learned and linked to the Strategy & Performance Studio.", ar:"SWOT، وPESTLE، وتحليل الأطراف المعنية، مبنية على محرك الصندوق المشترك بين PDCA وCAPA ولماذا الخمس وعظمة السمكة وباريتو وتحليل السبب الجذري وA3 وDMAIC وFMEA والدروس المستفادة ومربوطة باستوديو الاستراتيجية والأداء."}}''')
# 5. knowledge centre topic (after FMEA)
rep('rel:"FMEA · ISO 10009 §7.3 · ISO 9001 §6.1", guide:{k:"fmea",a:"explain-std"}},', '''rel:"FMEA · ISO 10009 §7.3 · ISO 9001 §6.1", guide:{k:"fmea",a:"explain-std"}},
  {en:["Lessons learned: knowledge that changes the next project","Lessons learned is a practice, not a requirement of any standard, and ISO 10009:2024 does not review it as a tool; the nearest is its clause 15 (improvement). ISO 9001:2026 asks to determine the knowledge needed and to retain, apply and share it (7.1.6), and after a nonconformity to update the risks and make changes to the system if necessary (10.2.1 e) and f)). A lesson records what happened and the evidence, takes its cause from a real analysis (RCA, 5 Whys, Fishbone, A3, DMAIC or FMEA) rather than analysing again, and is written as a rule someone else can apply: When…, do…, because…, with where it applies. It is not learned until a document, a control or a practice has changed and the next project used it and it worked (ISO 9000:2026 defines a good practice as a method proven to work, 3.2.4). Successes are lessons too, the wording is blame-free, and the register is read at the start of each project or change and fed into FMEA rows and control plans."],
   ar:["الدروس المستفادة: معرفة تغيّر المشروع التالي","الدروس المستفادة ممارسة، وليست متطلباً في أي مواصفة، ولا تراجعها ISO 10009:2024 أداةً؛ وأقرب ما فيها البند 15 (التحسين). وتطلب ISO 9001:2026 تحديد المعرفة اللازمة والاحتفاظ بها وتطبيقها ومشاركتها (7.1.6)، وبعد عدم المطابقة تحديث المخاطر وإجراء التغييرات على النظام عند الحاجة (10.2.1 هـ) و و)). يسجّل الدرس ما حدث بدليله، ويأخذ سببه من تحليل حقيقي (RCA أو لماذا الخمس أو عظمة السمكة أو A3 أو DMAIC أو FMEA) دون إعادة التحليل، ويُكتب قاعدة يطبقها غيرك: عندما… افعل… لأن… مع أين تنطبق. ولا يكون مستفاداً حتى تتغير وثيقة أو ضابط أو ممارسة ويستخدمه المشروع التالي وينجح (يعرّف ISO 9000:2026 الممارسة الجيدة بأنها طريقة ثبت أنها تعمل، 3.2.4). والنجاحات دروس أيضاً، والصياغة بلا لوم، والسجل يُقرأ عند بدء كل مشروع أو تغيير وتدخل دروسه صفوف FMEA وخطط الضبط."], rel:"Lessons learned · ISO 9001 §7.1.6 · §10.2.1", guide:{k:"lessons",a:"explain-std"}},''')
# 6. compliance note
rep('''  {k:"oec", name:{en:"Operations Excellence Center",ar:"مركز التميّز التشغيلي"},
   note:{en:"Explanations are written independently''', '''  {k:"lessons", name:{en:"Lessons Learned Register",ar:"سجل الدروس المستفادة"},
   note:{en:"Lessons learned is a practice, not a standard or a requirement, and is not one of the 53 tools of ISO 10009:2024. The guide summarises the ISO 9001:2026 clauses the practice serves (7.1.6 with Annex A.7.1.6, 7.4, 8.1, 8.5.6, 9.1.3, 9.3.2, 10.1 and 10.2.1), ISO 9000:2026 (3.2.3, 3.2.4, 3.10.4, 4.2.4, 4.2.6, 4.2.7 and 4.3.9), ISO 10009:2024 clause 15 and ISO 19011:2026 (5.7, 6.3.2.2 and 6.6), in independent wording; clause references were checked on the build date (2026-10-16) against the uploaded official texts, ISO 10009:2024 included (its text does not use the words \\"lessons learned\\"). ISO 30401 and the PMBOK and PRINCE2 lessons logs are not verified (not uploaded); the stage, audit and blame rules are the tool's own wording. The standards' text remains copyright of ISO. The example lessons are illustrative, not real data.",
         ar:"الدروس المستفادة ممارسة، وليست مواصفة ولا متطلباً، وليست من أدوات ISO 10009:2024 الـ53. يلخص الدليل بنود ISO 9001:2026 التي تخدمها الممارسة (7.1.6 مع الملحق A.7.1.6، و7.4، و8.1، و8.5.6، و9.1.3، و9.3.2، و10.1، و10.2.1)، وISO 9000:2026 (3.2.3 و3.2.4 و3.10.4 و4.2.4 و4.2.6 و4.2.7 و4.3.9)، والبند 15 من ISO 10009:2024، وISO 19011:2026 (5.7 و6.3.2.2 و6.6) بصياغة مستقلة، وقد تُحقق من مراجع البنود في تاريخ البناء (2026-10-16) من النصوص الرسمية المرفوعة ومنها ISO 10009:2024 (ولا ترد فيه عبارة «الدروس المستفادة»). ISO 30401 وسجلات الدروس في PMBOK وPRINCE2 غير متحقق منها (غير مرفوعة)، وقواعد المراحل والتدقيق واللوم صياغة الأداة. وحقوق نصوص المواصفات محفوظة لمنظمة ISO. دروس المثال توضيحية وليست بيانات حقيقية."}},
  {k:"oec", name:{en:"Operations Excellence Center",ar:"مركز التميّز التشغيلي"},
   note:{en:"Explanations are written independently''')
# 7. performance dashboard: labels, breakdown title, adapter, registry
rep('  qtAs:B("Quality tools self-assessment (ISO 10009)","التقييم الذاتي لأدوات الجودة (ISO 10009)"),',
    '  llAs:B("Lessons learned self-assessment","التقييم الذاتي للدروس المستفادة"), llEmb:B("Lessons embedded (a document or control changed, with evidence)","الدروس المرسّخة (تغيّرت وثيقة أو ضابط بدليل)"), llVer:B("Lessons verified as applied and working on a later project","الدروس المتحقق أنها طُبّقت ونجحت في مشروع لاحق"),\n  qtAs:B("Quality tools self-assessment (ISO 10009)","التقييم الذاتي لأدوات الجودة (ISO 10009)"),')
rep('  fmea:B("Open items by type (share of studies)","البنود المفتوحة حسب النوع (نسبة من الدراسات)"),',
    '  fmea:B("Open items by type (share of studies)","البنود المفتوحة حسب النوع (نسبة من الدراسات)"),\n  lessons:B("Open items by type (share of lessons)","البنود المفتوحة حسب النوع (نسبة من الدروس)"),')
rep('''/* ---------- registry ---------- */''', '''/* ---------- Lessons learned register (cia-lessons:v1). "Embedded" (every embedding action owned, done, dated and with evidence of the
   change), "verified" (the latest dated check after the last action names the next project, says "applied and worked" and has evidence),
   the "not analysed" rule and the blame rule are the tool's own rules (modules/lessons.html). ---------- */
function lessonsAd(S){
  if(!S) return finish([],null,false);
  const Q=["CP1","CP2","CP3","RL1","RL2","RL3","EM1","EM2","EM3","VS1","VS2","VS3"], A=(S.assess&&typeof S.assess==="object")?S.assess:{};
  const R=(arr(S.records)||[]).filter(r=>r&&typeof r==="object");
  const ans=Q.filter(q=>num(A[q])!=null), pct=qs=>{ const s=qs.reduce((a,q)=>a+(num(A[q])||0),0); return s/(2*qs.length)*100; };
  const o=x=>(x&&typeof x==="object"&&!Array.isArray(x))?x:{}, tx=v=>String(v==null||typeof v==="object"?"":v).trim(), isD=d=>/^\\d{4}-\\d{2}-\\d{2}$/.test(String(d||""));
  const L2=v=>(Array.isArray(v)?v:[]).filter(x=>x&&typeof x==="object");
  const PERSON=/(خطأ\\s*(بشري|العامل|الموظف|الفني|المشغل|السائق|الشخص|الرافع|المشرف)|إهمال|اهمال|تقصير|عدم\\s*(انتباه|الانتباه|تركيز|التركيز)|سهو|لامبالاة|human\\s*error|operator\\s*error|worker\\s*error|staff\\s*error|employee\\s*error|rigger\\s*error|driver\\s*error|negligen|careless|inattent|not\\s*paying\\s*attention|lack\\s*of\\s*attention|complacen)/i;
  const read=r=>{ const w=o(r.what), c=o(r.cause), l=o(r.lesson), AC=L2(r.acts).filter(a=>tx(a.what));
    const owned=a=>!!tx(a.who)&&isD(a.by), done=a=>a.st==="done"&&isD(a.done)&&!!tx(a.ev);
    const emb=AC.length>0&&AC.every(a=>owned(a)&&done(a));
    const last=AC.map(a=>a.st==="done"?a.done:"").filter(isD).sort().pop()||"";
    const V=L2(r.ver).filter(v=>isD(v.date)).sort((a,b)=>a.date<b.date?-1:(a.date>b.date?1:0)), lv=V.length?V[V.length-1]:null;
    const ver=emb&&!!lv&&(!last||lv.date>=last)&&!!tx(lv.next)&&lv.res==="worked"&&!!tx(lv.ev);
    const shared=L2(r.share).some(x=>isD(x.date)&&tx(x.who)&&tx(x.how));
    const linked=c.how==="link"&&tx(r.src)&&r.src!=="none"&&!!tx(r.srcId), sev=w.sev==="high"&&r.type!=="success";
    return {emb, ver, czBad:!tx(c.t)||(!linked&&sev), blame:[c.t,l.when,l.dothis,l.because].some(x=>PERSON.test(String(x||""))),
            rule:!(tx(l.when)&&tx(l.dothis)&&tx(l.because)&&tx(l.applies)), act:!AC.length||AC.some(a=>!owned(a)), notDone:AC.some(a=>!done(a)),
            notVer:emb&&!ver, notShr:ver&&!shared}; };
  let emb=0, ver=0, cz=0, bl=0, ru=0, ac=0, nd=0, nv=0, ns=0;
  R.forEach(r=>{ const x=read(r); if(x.emb) emb++; if(x.ver) ver++; if(x.czBad) cz++; if(x.blame) bl++; if(x.rule) ru++; if(x.act) ac++; if(x.notDone) nd++; if(x.notVer) nv++; if(x.notShr) ns++; });
  const m=[ M("llAs", ans.length? pct(Q) : null, "perf", ans.length? `${Math.round(pct(Q))}%` : ""),
            M("llEmb", R.length? share(emb,R.length) : null, "perf", R.length? frac(emb,R.length) : ""),
            M("llVer", R.length? share(ver,R.length) : null, "prog", R.length? frac(ver,R.length) : ""),
            M("an", ans.length? share(ans.length,Q.length) : null, "prog", frac(ans.length,Q.length)) ];
  const IT=[[B("Cause missing, or not analysed for a severe event","سبب ناقص، أو غير محلل لحدث جسيم"),cz,"#3563C9"],[B("Wording that blames a person","صياغة تلوم شخصاً"),bl,"#B42318"],
            [B("Lesson not written as a rule with its scope","درس غير مكتوب قاعدة بنطاقها"),ru,"#1B2A4A"],[B("No embedding action with an owner and a date","لا إجراء ترسيخ بمالك وموعد"),ac,"#C9821A"],
            [B("Action not done, or no evidence of the change","إجراء لم يُنفذ أو بلا دليل تغيير"),nd,"#B8901E"],[B("Embedded but not yet verified on a later project","رُسّخ ولم يُتحقق منه في مشروع لاحق"),nv,"#1E8C93"],
            [B("Verified but not shared","تُحقق منه ولم يُعمَّم"),ns,"#3C9A5F"]];
  const bd = R.length ? {t:BDT.lessons, items:IT.map(([l,n,col])=>({l, v:share(n,R.length), t:String(n), col}))} : null;
  return finish(m, bd, ans.length>0 || R.length>0);
}

/* ---------- registry ---------- */''')
rep('  {k:"fmea",    sys:"aud", key:"cia-fmea:v1", code:"FMEA", n:B("FMEA — failure mode and effects analysis","تحليل أنماط الفشل وآثارها FMEA"), f:fmeaAd},',
    '  {k:"fmea",    sys:"aud", key:"cia-fmea:v1", code:"FMEA", n:B("FMEA — failure mode and effects analysis","تحليل أنماط الفشل وآثارها FMEA"), f:fmeaAd},\n  {k:"lessons", sys:"aud", key:"cia-lessons:v1", code:"LL", n:B("Lessons learned register","سجل الدروس المستفادة"), f:lessonsAd},')
rep('rcaAd,a3Ad,dmaicAd,qtAd,fmeaAd}};', 'rcaAd,a3Ad,dmaicAd,qtAd,fmeaAd,lessonsAd}};')
rep('const DEMO_RES = {"fmea": ', 'const DEMO_RES = {"lessons": {"st": "none", "idx": null, "comp": null, "m": [], "bd": null}, "fmea": ')
# 8. home page data: tool facts, news, request mapping, Advisor rules
rep(' fmea: TI(12,0,"tools"', ''' lessons: TI(12,0,"tools",{en:"Lessons register",ar:"سجل الدروس"},["qhse","aud","pmo"],["iso"],
  {en:"Keeps a register of lessons from problems, near misses, audits, project close-outs and successes: the event with its evidence, the cause from a real analysis, the lesson as a rule others can apply, the actions that change documents and controls, a check on the next project, and sharing.", ar:"تحفظ سجلاً للدروس من المشكلات والحوادث الوشيكة والتدقيق وإغلاق المشاريع والنجاحات: الحدث بدليله، والسبب من تحليل حقيقي، والدرس قاعدة يطبقها غيرك، والإجراءات التي تغيّر الوثائق والضوابط، والتحقق في المشروع التالي، والتعميم."},
  {en:"The same mistakes cost again on every project when what one team learned stays with that team. A lesson that changes a procedure, a contract or an FMEA, and is read before the next project starts, stops the repeat.", ar:"الأخطاء نفسها تتكرر تكلفتها في كل مشروع عندما يبقى ما تعلمه فريق عند ذلك الفريق. والدرس الذي يغيّر إجراءً أو عقداً أو FMEA، ويُقرأ قبل بدء المشروع التالي، يوقف التكرار."},
  {en:"A 12-question self-assessment, lessons with computed stages (captured, cause linked, lesson written, actions planned, embedded, verified, shared), the cause taken read-only from RCA, A3, DMAIC, FMEA, CAPA or PDCA, blame flags, embedding actions with evidence, verification and sharing, a search and a read-before-you-start list, an automatic audit, a dashboard, an HTML report and CSV.", ar:"تقييم ذاتي من 12 سؤالاً، ودروس بمراحل محسوبة (سُجّل، رُبط السبب، كُتب الدرس، خُططت الإجراءات، رُسّخ، تُحقق منه، عُمّم)، والسبب مأخوذ للقراءة فقط من RCA أو A3 أو DMAIC أو FMEA أو CAPA أو PDCA، وتنبيه على اللوم، وإجراءات ترسيخ بدليل، وتحقق وتعميم، وبحث وقائمة «اقرأ قبل أن تبدأ»، وتدقيق آلي، ولوحة مؤشرات، وتقرير HTML وCSV."},
  {en:"12 minutes for the self-assessment; 20–30 minutes for each lesson, then a short check on the next project", ar:"12 دقيقة للتقييم الذاتي، و20 إلى 30 دقيقة لكل درس، ثم تحقق قصير في المشروع التالي"}),
 fmea: TI(12,0,"tools"''')
rep('const NEWS = [\n', '''const NEWS = [
  {k:"lessons", d:"2026-10-16", t:{en:"New: the Lessons Learned Register. A lesson counts only when a document or control has changed and the next project used it and it worked; causes come from a real analysis, the wording is blame-free, and a read-before-you-start list serves each new project.", ar:"جديد: سجل الدروس المستفادة. الدرس لا يُحسب حتى تتغير وثيقة أو ضابط ويستخدمه المشروع التالي وينجح؛ والسبب من تحليل حقيقي، والصياغة بلا لوم، وقائمة «اقرأ قبل أن تبدأ» لكل مشروع جديد."}},
''')
rep('fmea:["iac",null],w8:["cockpit",null]};', 'fmea:["iac",null],lessons:["iac",null],w8:["cockpit",null]};')
rep('["goal","proj",{pmoexc:4,pmo:3,iso21500:2,p3o:2}],', '["goal","proj",{pmoexc:4,pmo:3,iso21500:2,p3o:2,lessons:1}],')
rep('["goal","audit",{aud:4,pdca:3,capa:3,why5:2,fish:2,pareto:2,rca:2,a3:2,dmaic:1,iso10009:1,fmea:1,ims:1}],', '["goal","audit",{aud:4,pdca:3,capa:3,why5:2,fish:2,pareto:2,rca:2,a3:2,dmaic:1,iso10009:1,fmea:1,lessons:1,ims:1}],')
rep('["pain","repeat",{aud:2,pdca:2,capa:2,why5:3,fish:2,pareto:2,rca:2,a3:1,dmaic:2,iso10009:1,fmea:1}],', '["pain","repeat",{aud:2,pdca:2,capa:2,why5:3,fish:2,pareto:2,rca:2,a3:1,dmaic:2,iso10009:1,fmea:1,lessons:2}],')
rep('["pain","skills",{oec:2,iso10009:1}],', '["pain","skills",{oec:2,iso10009:1,lessons:2}],')
open(path, "w", encoding="utf-8").write(s)
print("index.html: Lessons Learned linked (URL, system row, toolkit card, toolbox entry, knowledge topic, compliance note, dashboard adapter, home data)")
