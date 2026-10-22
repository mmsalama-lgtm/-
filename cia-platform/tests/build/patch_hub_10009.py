"""Step 2026-10-16 (ISO 10009:2024 quality tools guide): link modules/iso10009.html in the hub (index.html) from the start.
Every anchor must match once.   python3 tests/build/patch_hub_10009.py index.html
Then serve the platform folder and run tests/build/demo_10009.py, which fills DEMO_RES.iso10009 from the hub's own reading of the example
(until then a placeholder with st "none" stands in). Also: ciaOpenFile(file, tab) may now name the tab to open (the second argument is
optional, so every existing caller behaves as before), ISO 10009:2024 joins the guidance standards covered, and the compliance notes of
Pareto, RCA and A3 say that ISO 10009 is now checked (their kits were updated by patch_kits_10009.py)."""
import sys, os

HERE = os.path.dirname(os.path.abspath(__file__))
path = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, "..", "..", "index.html")
s = open(path, encoding="utf-8").read()
if 'iso10009: "./modules/iso10009.html"' in s:
    print("ISO 10009 already linked; nothing to do"); sys.exit(0)


def rep(old, new):
    global s
    n = s.count(old)
    assert n == 1, (n, old[:100])
    s = s.replace(old, new)


# 1. URL and the optional tab of ciaOpenFile
rep('  dmaic:    "./modules/dmaic.html"\n};', '  dmaic:    "./modules/dmaic.html",\n  iso10009: "./modules/iso10009.html"\n};')
rep('''window.ciaOpenFile = function(file){
  const k = Object.keys(URLS).find(x=>URLS[x].split("/").pop()===file);
  if(!k) return false; openModule(k); return true;
};''', '''window.ciaOpenFile = function(file, tab){
  const k = Object.keys(URLS).find(x=>URLS[x].split("/").pop()===file);
  if(!k) return false; openModule(k, undefined, typeof tab==="string"?tab:undefined); return true;
};''')
# 2. systems: Audit & Improvement row (after DMAIC)
i = s.find('      {k:"dmaic",status:"live", name:{en:"DMAIC Improvement Project"')
assert i > 0 and s.count('      {k:"dmaic",status:"live", name:{en:"DMAIC Improvement Project"') == 1
j = s.find("\n", i)
assert s[j-2:j] == "}}", s[j-10:j]   # DMAIC is the last row of the system: add the comma
s = s[:j] + ''',
      {k:"iso10009",status:"live", name:{en:"ISO 10009:2024 Quality tools guide",ar:"ISO 10009:2024 دليل أدوات الجودة"}, note:{en:"The guidance standard on quality tools, explained in full · the 53 tools of clauses 5 to 16 with their PDCA phase (Annex A) and attributes (Annex C) · a tool navigator by aim, phase, team, data and capability · a library that opens each tool where it lives on the platform · a PDCA storyboard (Annex B) linked to the records of Pareto, Fishbone, 5 Whys, RCA, DMAIC and PDCA · NPS, OEE and cost of quality calculators · platform coverage of the standard's tools", ar:"المواصفة الإرشادية لأدوات الجودة مشروحة كاملة · الأدوات الـ 53 في البنود 5 إلى 16 بمرحلتها في PDCA (الملحق A) وخصائصها (الملحق C) · مستكشف يقترح الأداة بحسب الغرض والمرحلة والفريق والبيانات والكفاءة · مكتبة تفتح كل أداة حيث توجد في المنصة · لوحة قصة على PDCA (الملحق B) مرتبطة بسجلات باريتو وعظمة السمكة ولماذا الخمس وRCA وDMAIC وPDCA · حاسبات NPS وOEE وتكلفة الجودة · تغطية المنصة لأدوات المواصفة"}}''' + s[j:]
# 3. toolkit card after DMAIC, and its system
anchor = '\n  {k:"w8", color:"--c-ai", pre:"CIA", code:"Cockpit"'
assert s.count(anchor) == 1
s = s.replace(anchor, '''
  {k:"iso10009", color:"--c-aud", pre:"ISO", code:"10009", ed:{en:"2024 · guidance standard for the toolbox", ar:"2024 · مواصفة إرشادية لصندوق الأدوات"},
   title:{en:"ISO 10009 Quality Tools Guide", ar:"دليل أدوات الجودة ISO 10009"},
   feat:{en:["Standard guide: what ISO 10009:2024 is, the four aims of its scope, how the tools follow the ISO 9001 sequence, the PDCA tables of Annex A, the storyboards of Annex B and the attributes of Annex C","Clause and tool guide: every one of the 53 tools of clauses 5 to 16 with an interpretive summary, an example, its benefit, its Annex A phase, its output, points to note and the ISO 9001:2026 clauses it serves","Tool navigator: pick a tool by aim, PDCA phase, context, team, data, capability and effort, with the reason for each suggestion and what you lack","Library of the 53 tools with their Table C.1 attributes, each opening where it lives on the platform (Pareto, RCA, 5 Whys, Fishbone, DMAIC, strategy, operations, risk, audit)","PDCA storyboard (Annex B): each step with its reason, output and a read-only link to a record of Pareto, Fishbone, 5 Whys, RCA, DMAIC or PDCA","Sixteen-question self-assessment of how tools are chosen and used, NPS, OEE and cost of quality calculators, automatic audit, dashboard, HTML report and CSV"],
         ar:["دليل المواصفة: ما ISO 10009:2024، والأغراض الأربعة لمجالها، وترتيب الأدوات بتسلسل ISO 9001، وجداول PDCA في الملحق A، ولوحات القصة في الملحق B، وخصائص الأدوات في الملحق C","دليل البنود والأدوات: كل أداة من الـ 53 في البنود 5 إلى 16 بملخص تفسيري ومثال وفائدتها ومرحلتها في الملحق A ومخرجها ونقاط تُراعى وبنود ISO 9001:2026 التي تخدمها","مستكشف الأدوات: اختر الأداة بالغرض ومرحلة PDCA والسياق والفريق والبيانات والكفاءة والجهد، مع سبب كل اقتراح وما ينقصك","مكتبة الأدوات الـ 53 بخصائصها من الجدول C.1، تفتح كل أداة حيث توجد في المنصة (باريتو، RCA، لماذا الخمس، عظمة السمكة، DMAIC، الاستراتيجية، العمليات، المخاطر، التدقيق)","لوحة قصة على PDCA (الملحق B): كل خطوة بمبررها ومخرجها ورابط قراءة فقط بسجل في باريتو أو عظمة السمكة أو لماذا الخمس أو RCA أو DMAIC أو PDCA","تقييم ذاتي من ستة عشر سؤالاً لاختيار الأدوات واستخدامها، وحاسبات NPS وOEE وتكلفة الجودة، وتدقيق آلي، ولوحة مؤشرات، وتقرير HTML وCSV"]},
   extra:{en:"Worked example with three storyboards for a fictitious Saudi company: cutting rejected ready-mix loads (process improvement, from is/is not and Pareto PA-EX-02 to DMAIC DM-EX-01 and the control plan; 6.0% to 2.4%), preventing dropped loads in rebar lifting (continual improvement, FMEA and RCA RC-EX-02, error proofing under trial), and the 2027 plan (strategy: SWOT, PESTLE, mission, objectives, cost of quality and NPS)", ar:"مثال تطبيقي بثلاث لوحات قصة لشركة سعودية افتراضية: خفض شحنات الخرسانة المرفوضة (تحسين العمليات، من «ما هو / ما ليس» وباريتو PA-EX-02 إلى DMAIC DM-EX-01 وخطة الضبط؛ من 6.0% إلى 2.4%)، ومنع سقوط الحمولات في رفع الحديد (تحسين مستمر، FMEA وRCA RC-EX-02، ومنع الخطأ قيد التجربة)، وخطة 2027 (استراتيجية: SWOT وPESTLE والرسالة والأهداف وتكلفة الجودة وNPS)"}},''' + anchor)
rep('a3:"aud",dmaic:"aud",w8:"ai"};', 'a3:"aud",dmaic:"aud",iso10009:"aud",w8:"ai"};')
# 4. standards covered
rep('items:["ISO 31000:2018","ISO 37000:2021","ISO 19011:2026",', 'items:["ISO 31000:2018","ISO 37000:2021","ISO 19011:2026","ISO 10009:2024",')
# 5. knowledge centre topic (after DMAIC)
i = s.find('  {en:["DMAIC: the data-driven improvement project"'); assert i > 0
j = s.find('guide:{k:"dmaic",a:"explain-std"}},', i); assert j > i
j += len('guide:{k:"dmaic",a:"explain-std"}},')
s = s[:j] + '''
  {en:["ISO 10009: choosing the right quality tool","ISO 10009:2024 is the guidance standard on quality tools and their application. It reviews 53 tools in clauses 5 to 16, arranged approximately in the sequence of ISO 9001 (strategy, process, risk, objectives, customer, process performance, inventory, prevention, process control, corrective action, improvement and the Six Sigma and TQM families), each with what it is, how it is used, its benefits and points to note. Annex A places the tools on the PDCA cycle for strategy, process improvement and continual improvement; Annex B shows one-page storyboards; Annex C gives each tool's demands: team or individual, data, capability and effort. It is guidance, not certified against; NOTE 3 of Annex A.9.1 of ISO 9001:2026 points to it. Choose a tool for its aim and phase, not by habit, and train people before the difficult ones."],
   ar:["ISO 10009: اختيار أداة الجودة المناسبة","ISO 10009:2024 المواصفة الإرشادية لأدوات الجودة وتطبيقها. تشرح 53 أداة في البنود 5 إلى 16، مرتبة تقريباً بتسلسل ISO 9001 (الاستراتيجية، والعمليات، والمخاطر، والأهداف، والعميل، وأداء العمليات، والمخزون، والمنع، وضبط العمليات، والإجراء التصحيحي، والتحسين، وعائلتا Six Sigma وإدارة الجودة الشاملة)، ولكل أداة: ما هي، وكيف تُستخدم، وفوائدها، ونقاط تُراعى. ويضع الملحق A الأدوات على دورة PDCA في الاستراتيجية وتحسين العمليات والتحسين المستمر، ويعرض الملحق B لوحات قصة في صفحة واحدة، ويبين الملحق C ما تحتاجه كل أداة: فريق أم فرد، والبيانات، والكفاءة، والجهد. وهي إرشاد لا يُشهد عليه، وتحيل إليها الملاحظة 3 في الملحق A.9.1 من ISO 9001:2026. اختر الأداة بغرضها ومرحلتها لا بالعادة، ودرّب الأفراد قبل الأدوات الصعبة."], rel:"ISO 10009:2024 · ISO 9001 §A.9.1", guide:{k:"iso10009",a:"explain-std"}},''' + s[j:]
# 6. compliance note, and the notes of Pareto, RCA and A3 that said ISO 10009 was not verified
rep('''  {k:"oec", name:{en:"Operations Excellence Center",ar:"مركز التميّز التشغيلي"},
   note:{en:"Explanations are written independently''', '''  {k:"iso10009", name:{en:"ISO 10009:2024 Quality tools guide",ar:"ISO 10009:2024 دليل أدوات الجودة"},
   note:{en:"ISO 10009:2024 is a guidance standard, not a certifiable one. The guide summarises its clauses 1 to 16 and Annexes A to C, and each of its 53 tools, in independent wording; clause numbers, tool names, the attributes of Table C.1 and the placements of Tables A.1 to A.3 were checked against the official text on 2026-10-16, and ISO 9001:2026 references against the official text. The link of each clause to ISO 9001:2026 is the author's. ISO 10017 and the other standards ISO 10009 names are not verified (not uploaded), and the standards' text remains copyright of ISO. The example storyboards are illustrative, not real data.",
         ar:"ISO 10009:2024 مواصفة إرشادية، وليست مواصفة إشهاد. يلخص الدليل بنودها من 1 إلى 16 وملاحقها A إلى C وكل أداة من أدواتها الـ 53 بصياغة مستقلة، وقد تُحقق من أرقام البنود وأسماء الأدوات وخصائص الجدول C.1 ومواقع الجداول A.1 إلى A.3 من النص الرسمي في 2026-10-16، ومن مراجع ISO 9001:2026 من نصها الرسمي. وربط كل بند بـ ISO 9001:2026 من الكاتب. وISO 10017 وبقية المواصفات التي تذكرها ISO 10009 غير متحقق منها (غير مرفوعة)، وحقوق نصوص المواصفات محفوظة لمنظمة ISO. لوحات القصة في المثال توضيحية وليست بيانات حقيقية."}},
  {k:"oec", name:{en:"Operations Excellence Center",ar:"مركز التميّز التشغيلي"},
   note:{en:"Explanations are written independently''')
rep("tles were checked against the official texts on 2026-10-11, ISO 10009 and ISO 10017 are not verified (not uploaded),",
    "tles were checked against the official texts on 2026-10-11 (ISO 10009:2024 13.7 on 2026-10-16), ISO 10017 is not verified (not uploaded),")
rep("من النصوص الرسمية في 2026-10-11، وISO 10009 وISO 10017 غير متحقق منهما (غير مرفوعين)،",
    "من النصوص الرسمية في 2026-10-11 (وISO 10009:2024 البند 13.7 في 2026-10-16)، وISO 10017 غير متحقق منها (غير مرفوعة)،")
rep("tles were checked against the official texts on 2026-10-15, ISO 10009, ISO 10017 and IEC 62740 are not verified (not uploaded),",
    "tles were checked against the official texts on 2026-10-15 (ISO 10009:2024 14.1 on 2026-10-16), ISO 10017 and IEC 62740 are not verified (not uploaded),")
rep("من النصوص الرسمية في 2026-10-15، وISO 10009 وISO 10017 وIEC 62740 غير متحقق منها (غير مرفوعة)،",
    "من النصوص الرسمية في 2026-10-15 (وISO 10009:2024 البند 14.1 في 2026-10-16)، وISO 10017 وIEC 62740 غير متحقق منهما (غير مرفوعتين)،")
rep("the official texts on 2026-10-16, any A3 or lean reference, ISO 10009 and ISO 10017 are not verified (not uploaded),",
    "the official texts on 2026-10-16 (ISO 10009:2024 14.7 included), any A3 or lean reference and ISO 10017 are not verified (not uploaded),")
rep("مرجع لمنهج A3 أو الإنتاج الرشيق وISO 10009 وISO 10017 غير متحقق منها (غير مرفوعة)،",
    "مرجع لمنهج A3 أو الإنتاج الرشيق وISO 10017 غير متحقق منها (غير مرفوعة)، وISO 10009:2024 البند 14.7 متحقق منها،")
# 7. performance dashboard: labels, breakdown title, adapter, registry
rep('  dmAs:B("DMAIC self-assessment","التقييم الذاتي لـ DMAIC"),',
    '  qtAs:B("Quality tools self-assessment (ISO 10009)","التقييم الذاتي لأدوات الجودة (ISO 10009)"), qtFull:B("Storyboards with tools in all four PDCA phases","لوحات القصة التي فيها أدوات في مراحل PDCA الأربع"), qtLink:B("Completed toolbox steps linked to a record","خطوات الصندوق المنفذة المرتبطة بسجل"),\n  dmAs:B("DMAIC self-assessment","التقييم الذاتي لـ DMAIC"),')
rep('  dmaic:B("Open items by type (share of projects)","البنود المفتوحة حسب النوع (نسبة من المشاريع)"),',
    '  dmaic:B("Open items by type (share of projects)","البنود المفتوحة حسب النوع (نسبة من المشاريع)"),\n  iso10009:B("Open items by type (share of storyboards)","البنود المفتوحة حسب النوع (نسبة من لوحات القصة)"),')
rep('''/* ---------- registry ---------- */''', '''/* ---------- ISO 10009 — quality tools guide and storyboards (cia-iso10009:v1). The four phases, the step reasons, the record links and the
   result / standard / review rules are the tool's own (modules/iso10009.html). ---------- */
function qtAd(S){
  if(!S) return finish([],null,false);
  const Q=["SL1","SL2","SL3","CP1","CP2","DT1","DT2","DT3","TM1","TM2","IN1","IN2","IN3","RV1","RV2","RV3"], A=(S.assess&&typeof S.assess==="object")?S.assess:{};
  const R=(arr(S.records)||[]).filter(r=>r&&typeof r==="object");
  const ans=Q.filter(q=>num(A[q])!=null), pct=qs=>{ const s=qs.reduce((a,q)=>a+(num(A[q])||0),0); return s/(2*qs.length)*100; };
  const tx=v=>String(v==null||typeof v==="object"?"":v).trim(), isD=d=>/^\\d{4}-\\d{2}-\\d{2}$/.test(String(d||""));
  const LINK=["cplan","kaizen","ctq","pareto","grr","rca","why5","fish","sixsigma"];
  let full=0, lk=0, ln=0, ph=0, why=0, res=0, std=0, rev=0;
  R.forEach(r=>{ const st=(Array.isArray(r.steps)?r.steps:[]).filter(x=>x&&typeof x==="object"&&tx(x.tool));
    const has=p=>st.some(x=>x.ph===p), four=["P","D","C","A"].every(has); if(four) full++; else if(st.length) ph++;
    if(st.some(x=>!tx(x.why))) why++;
    st.forEach(x=>{ if(x.st==="done"&&LINK.includes(x.tool)){ ln++; if(tx(x.rid)) lk++; } });
    const all=st.length&&st.every(x=>x.st==="done");
    if(all&&!tx(r.result)) res++;
    if(tx(r.result)&&!tx(r.std)) std++;
    const last=st.map(x=>x.date).filter(isD).sort().pop()||"";
    if(four&&all&&tx(r.result)&&!(isD(r.review)&&(!last||r.review>=last))) rev++; });
  const m=[ M("qtAs", ans.length? pct(Q) : null, "perf", ans.length? `${Math.round(pct(Q))}%` : ""),
            M("qtFull", R.length? share(full,R.length) : null, "prog", R.length? frac(full,R.length) : ""),
            M("qtLink", ln? share(lk,ln) : null, "prog", ln? frac(lk,ln) : ""),
            M("an", ans.length? share(ans.length,Q.length) : null, "prog", frac(ans.length,Q.length)) ];
  const IT=[[B("A PDCA phase with no tool","مرحلة PDCA بلا أداة"),ph,"#3563C9"],[B("A step with no reason for the choice","خطوة بلا مبرر للاختيار"),why,"#C9821A"],
            [B("Every step done and no result written","كل الخطوات تمت ولم تُكتب النتيجة"),res,"#B42318"],[B("A result with nothing standardized or updated","نتيجة دون توحيد أو تحديث"),std,"#C2410C"],[B("Complete and not reviewed","مكتملة ولم تُراجع"),rev,"#7A869E"]];
  const bd = R.length ? {t:BDT.iso10009, items:IT.map(([l,n,col])=>({l, v:share(n,R.length), t:String(n), col}))} : null;
  return finish(m, bd, ans.length>0 || R.length>0);
}

/* ---------- registry ---------- */''')
rep('  {k:"dmaic",   sys:"aud", key:"cia-dmaic:v1", code:"DMAIC", n:B("DMAIC improvement project","مشروع التحسين بمنهج DMAIC"), f:dmaicAd},',
    '  {k:"dmaic",   sys:"aud", key:"cia-dmaic:v1", code:"DMAIC", n:B("DMAIC improvement project","مشروع التحسين بمنهج DMAIC"), f:dmaicAd},\n  {k:"iso10009", sys:"aud", key:"cia-iso10009:v1", code:"10009", n:B("ISO 10009 quality tools guide","دليل أدوات الجودة ISO 10009"), f:qtAd},')
rep('rcaAd,a3Ad,dmaicAd}};', 'rcaAd,a3Ad,dmaicAd,qtAd}};')
rep('const DEMO_RES = {"dmaic": ', 'const DEMO_RES = {"iso10009": {"st": "none", "idx": null, "comp": null, "m": [], "bd": null}, "dmaic": ')
# 8. home page data: tool facts, news, request mapping, Advisor rules
rep(' w8: TI(0,7,"modreg"', ''' iso10009: TI(16,0,"tools",{en:"Tool navigator",ar:"مستكشف الأدوات"},["qhse","aud","exc"],["iso"],
  {en:"Explains ISO 10009:2024 and its 53 quality tools, suggests the right tool for your aim, PDCA phase and resources, opens it where it lives on the platform, and tells the whole improvement as a one-page storyboard linked to the toolbox records.", ar:"تشرح ISO 10009:2024 وأدواتها الـ 53، وتقترح الأداة المناسبة لغرضك ومرحلتك ومواردك، وتفتحها حيث توجد في المنصة، وتروي التحسين كاملاً في لوحة قصة من صفحة واحدة مرتبطة بسجلات صندوق الأدوات."},
  {en:"Teams reach for the tool they know, not the one the work needs: a difficult tool with nobody trained, an analysis on too little data, a fishbone where a Pareto was needed. Picking by aim, phase and demands, and telling the story on one page, turns tools into results.", ar:"تلجأ الفرق إلى الأداة التي تعرفها لا التي يحتاجها العمل: أداة صعبة بلا شخص مدرب، وتحليل على بيانات قليلة، وعظمة سمكة حيث يلزم باريتو. الاختيار بالغرض والمرحلة والمتطلبات، ورواية القصة في صفحة، يحولان الأدوات إلى نتائج."},
  {en:"A standard guide, a clause guide of the 53 tools, a 16-question self-assessment, a tool navigator, a library with platform links, a PDCA storyboard linked to Pareto, Fishbone, 5 Whys, RCA, DMAIC and PDCA records, NPS, OEE and cost of quality calculators, an automatic audit, a dashboard of platform coverage, an HTML report and CSV.", ar:"دليل للمواصفة، ودليل للأدوات الـ 53، وتقييم ذاتي من 16 سؤالاً، ومستكشف أدوات، ومكتبة بروابط المنصة، ولوحة قصة على PDCA مرتبطة بسجلات باريتو وعظمة السمكة ولماذا الخمس وRCA وDMAIC وPDCA، وحاسبات NPS وOEE وتكلفة الجودة، وتدقيق آلي، ولوحة لتغطية المنصة، وتقرير HTML وCSV."},
  {en:"15 minutes for the self-assessment; 10 minutes to pick a tool; 1 hour to set up a first storyboard", ar:"15 دقيقة للتقييم الذاتي، و10 دقائق لاختيار أداة، وساعة لإعداد أول لوحة قصة"}),
 w8: TI(0,7,"modreg"''')
rep('const NEWS = [\n', '''const NEWS = [
  {k:"iso10009", d:"2026-10-16", t:{en:"New: ISO 10009:2024 quality tools guide — the 53 tools explained with their PDCA phase and attributes, a navigator that picks the right tool, a library that opens each tool on the platform, and a PDCA storyboard linked to the toolbox records.", ar:"جديد: دليل أدوات الجودة ISO 10009:2024 — الأدوات الـ 53 مشروحة بمرحلتها في PDCA وخصائصها، ومستكشف يختار الأداة المناسبة، ومكتبة تفتح كل أداة في المنصة، ولوحة قصة على PDCA مرتبطة بسجلات صندوق الأدوات."}},
''')
rep('a3:["iac",null],dmaic:["iac",null],w8:["cockpit",null]};', 'a3:["iac",null],dmaic:["iac",null],iso10009:["iac",null],w8:["cockpit",null]};')
rep('["goal","audit",{aud:4,pdca:3,capa:3,why5:2,fish:2,pareto:2,rca:2,a3:2,dmaic:1,ims:1}],', '["goal","audit",{aud:4,pdca:3,capa:3,why5:2,fish:2,pareto:2,rca:2,a3:2,dmaic:1,iso10009:1,ims:1}],')
rep('["pain","repeat",{aud:2,pdca:2,capa:2,why5:3,fish:2,pareto:2,rca:2,a3:1,dmaic:2}],', '["pain","repeat",{aud:2,pdca:2,capa:2,why5:3,fish:2,pareto:2,rca:2,a3:1,dmaic:2,iso10009:1}],')
rep('["pain","skills",{oec:2}],', '["pain","skills",{oec:2,iso10009:1}],')
open(path, "w", encoding="utf-8").write(s)
print("index.html: ISO 10009 linked (URL, ciaOpenFile tab, system row, toolkit card, standards covered, knowledge topic, compliance notes, dashboard adapter, home data)")
