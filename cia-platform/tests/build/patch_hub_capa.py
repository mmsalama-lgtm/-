"""Step 2026-10-11: link CAPA in the hub (index.html) from the start. Every anchor must match exactly once.
    python3 tests/build/patch_hub_capa.py index.html [demo.json]
demo.json (optional) is the dashboard snapshot of CAPA's example, made by tests/capa/test_capa.py --demo; it becomes
DEMO_RES.capa. Without it the script inserts a placeholder that the test run replaces."""
import sys, os, json

HERE = os.path.dirname(os.path.abspath(__file__))
path = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, "..", "..", "index.html")
s = open(path, encoding="utf-8").read()
if 'capa:     "./modules/capa.html"' in s:
    print("CAPA already linked; nothing to do"); sys.exit(0)


def rep(old, new):
    global s
    n = s.count(old)
    assert n == 1, (n, old[:100])
    s = s.replace(old, new)


# 1. URL
rep('  pdca:     "./modules/pdca.html"\n};', '  pdca:     "./modules/pdca.html",\n  capa:     "./modules/capa.html"\n};')
# 2. systems: Audit & Improvement row
rep('أول أداة في صندوق أدوات التحسين"}}', '''أول أداة في صندوق أدوات التحسين"}},
      {k:"capa",status:"live", name:{en:"CAPA — Corrective Action",ar:"CAPA — الإجراءات التصحيحية"}, note:{en:"One record per nonconformity from reaction to verified closure · read-only import from the Smart Audit center · link to a PDCA cycle · automatic record audit · second tool of the improvement toolbox", ar:"سجل لكل عدم مطابقة من التفاعل حتى الإغلاق بعد التحقق · استيراد للقراءة من مركز التدقيق الذكي · ربط بدورة PDCA · تدقيق آلي للسجلات · الأداة الثانية في صندوق أدوات التحسين"}}''')
# 3. toolkit card (and PDCA's card no longer says CAPA is still to come)
rep('extra:{en:"Worked example with three cycles for a fictitious Saudi company; CAPA, 5 Whys, Fishbone and the other toolbox tools follow", ar:"مثال تطبيقي بثلاث دورات لشركة سعودية افتراضية، وتتبعه CAPA ولماذا الخمس وعظمة السمكة وبقية أدوات الصندوق"}},',
    '''extra:{en:"Worked example with three cycles for a fictitious Saudi company; CAPA is live, and 5 Whys, Fishbone and the other toolbox tools follow", ar:"مثال تطبيقي بثلاث دورات لشركة سعودية افتراضية؛ وأداة CAPA متاحة، وتتبعها لماذا الخمس وعظمة السمكة وبقية أدوات الصندوق"}},
  {k:"capa", color:"--c-aud", pre:"CIA", code:"CAPA", ed:{en:"Continual Improvement Toolbox · tool 2", ar:"صندوق أدوات التحسين المستمر · الأداة الثانية"},
   title:{en:"CAPA — Corrective Action", ar:"CAPA — الإجراءات التصحيحية"},
   feat:{en:["Plain-language method guide and clause guide built on ISO 9001:2026 clause 10.2 and the clauses it works with","Twelve-question self-assessment with a score for each group, from reaction to learning","One record per nonconformity: reaction, cause analysis, action plan, implementation, effectiveness review, updates and closure","Overdue actions and overdue effectiveness reviews flagged; a record whose action was not effective is reopened","Read-only import from the Smart Audit center with a preview, and a link to the PDCA cycle that carries the improvement","Automatic audit of each record, dashboard, HTML report and CSV export"],
         ar:["دليل منهجية ودليل بنود بلغة بسيطة، مبنيان على ISO 9001:2026 البند 10.2 والبنود التي يعمل معها","تقييم ذاتي من اثني عشر سؤالاً بنتيجة لكل مجموعة، من التفاعل حتى التعلّم","سجل لكل عدم مطابقة: التفاعل، وتحليل السبب، وخطة الإجراء، والتنفيذ، ومراجعة الفعالية، والتحديثات، والإغلاق","تنبيه للإجراءات ومراجعات الفعالية المتأخرة، ويُعاد فتح السجل إذا لم يكن الإجراء فعالاً","استيراد للقراءة من مركز التدقيق الذكي بعد المعاينة، وربط بدورة PDCA التي تحمل التحسين","تدقيق آلي لكل سجل، ولوحة مؤشرات، وتقرير HTML وتصدير CSV"]},
   extra:{en:"Worked example with four records for a fictitious Saudi company: closed and effective, waiting for its review, overdue, and reopened", ar:"مثال تطبيقي بأربعة سجلات لشركة سعودية افتراضية: مغلق وفعال، وينتظر المراجعة، ومتأخر، ومعاد فتحه"}},''')
rep('pdca:"aud",w8:"ai"};', 'pdca:"aud",capa:"aud",w8:"ai"};')
# 4. grouped "coming soon" toolbox entry: 11 tools left
rep('''{k:"citbox", sys:"aud", pre:"CIA", code:"Toolbox", ed:{en:"12 tools · PDCA is already live", ar:"12 أداة · وأداة PDCA متاحة الآن"},
   name:{en:"Continual Improvement Toolbox: CAPA, 5 Whys, Fishbone and nine more", ar:"صندوق أدوات التحسين المستمر: CAPA ولماذا الخمس وعظمة السمكة وتسع أدوات أخرى"},
   note:{en:"CAPA, 5 Whys, Fishbone, Pareto, root cause analysis, A3, DMAIC, FMEA, lessons learned, SWOT, PESTLE and stakeholder analysis, built on the PDCA engine and linked to NCRs and audits.", ar:"CAPA، ولماذا الخمس، وعظمة السمكة، وباريتو، وتحليل السبب الجذري، وA3، وDMAIC، وFMEA، والدروس المستفادة، وSWOT، وPESTLE، وتحليل الأطراف المعنية، مبنية على محرك PDCA ومربوطة بعدم المطابقة والتدقيق."}}''',
    '''{k:"citbox", sys:"aud", pre:"CIA", code:"Toolbox", ed:{en:"11 tools · PDCA and CAPA are live", ar:"11 أداة · وأداتا PDCA وCAPA متاحتان الآن"},
   name:{en:"Continual Improvement Toolbox: 5 Whys, Fishbone, Pareto and eight more", ar:"صندوق أدوات التحسين المستمر: لماذا الخمس وعظمة السمكة وباريتو وثماني أدوات أخرى"},
   note:{en:"5 Whys, Fishbone, Pareto, root cause analysis, A3, DMAIC, FMEA, lessons learned, SWOT, PESTLE and stakeholder analysis, built on the toolbox engine shared by PDCA and CAPA and linked to NCRs and audits.", ar:"لماذا الخمس، وعظمة السمكة، وباريتو، وتحليل السبب الجذري، وA3، وDMAIC، وFMEA، والدروس المستفادة، وSWOT، وPESTLE، وتحليل الأطراف المعنية، مبنية على محرك الصندوق المشترك بين PDCA وCAPA ومربوطة بعدم المطابقة والتدقيق."}}''')
# 5. knowledge centre topic
rep('rel:"PDCA", guide:{k:"pdca",a:"explain-cl"}},', '''rel:"PDCA", guide:{k:"pdca",a:"explain-cl"}},
  {en:["Corrective action (ISO 9001:2026 clause 10.2)","When a nonconformity occurs, the organization reacts to it, decides whether action is needed to remove its cause, carries the action out and reviews whether it worked, then updates risks and the system where needed. ISO 9001:2026 has no preventive action clause: prevention is planned through risks and opportunities (6.1). The guide explains each step in plain words and links it to the CAPA self-assessment."],
   ar:["الإجراء التصحيحي (ISO 9001:2026 البند 10.2)","عند وقوع عدم مطابقة تتفاعل المنشأة معها، وتقرر هل يلزم إجراء يزيل سببها، وتنفذه وتراجع فعاليته، ثم تحدّث المخاطر والنظام عند الحاجة. ولا تحتوي ISO 9001:2026 بنداً للإجراء الوقائي، فالمنع يُخطط له عبر المخاطر والفرص (6.1). يشرح الدليل كل خطوة بكلمات بسيطة ويربطها بالتقييم الذاتي في أداة CAPA."], rel:"CAPA · ISO 9001 §10.2", guide:{k:"capa",a:"explain-cl"}},''')
# 6. compliance note
rep('دورات المثال توضيحية وليست بيانات حقيقية."}},', '''دورات المثال توضيحية وليست بيانات حقيقية."}},
  {k:"capa", name:{en:"CAPA — Corrective Action",ar:"CAPA — الإجراءات التصحيحية"},
   note:{en:"CAPA is a way of working, not a certifiable standard. The guide summarises ISO 9001:2026 clause 10.2 and the clauses it works with, ISO 9000:2026 terms and ISO 19011:2026 clause 6.7 in independent wording, checked against the official texts on 2026-10-11; the standards' text remains copyright of ISO. ISO 9001:2026 has no preventive action clause; prevention is handled through risk planning (6.1). The example records are illustrative, not real data.",
         ar:"CAPA طريقة عمل وليست مواصفة إشهاد. يلخص الدليل البند 10.2 من ISO 9001:2026 والبنود التي يعمل معها، ومصطلحات ISO 9000:2026، والبند 6.7 من ISO 19011:2026 بصياغة مستقلة، بعد التحقق منها من النصوص الرسمية في 2026-10-11، وحقوق نصوص المواصفات محفوظة لمنظمة ISO. ولا تحتوي ISO 9001:2026 بنداً للإجراء الوقائي، فالمنع يتم عبر التخطيط للمخاطر (6.1). سجلات المثال توضيحية وليست بيانات حقيقية."}},''')
# 7. performance dashboard: labels, breakdown title, adapter, registry
rep('pdAs:B("PDCA self-assessment","التقييم الذاتي لدورة PDCA"), pdCl:B("Cycles closed (of cycles recorded)","الدورات المغلقة من الدورات المسجلة"),',
    'pdAs:B("PDCA self-assessment","التقييم الذاتي لدورة PDCA"), pdCl:B("Cycles closed (of cycles recorded)","الدورات المغلقة من الدورات المسجلة"),\n  caAs:B("CAPA self-assessment","التقييم الذاتي لـ CAPA"), caEff:B("Records closed and effective (of records)","السجلات المغلقة والفعالة من كل السجلات"),')
rep('  pdca:B("Self-assessment by PDCA stage","التقييم الذاتي حسب مرحلة PDCA"),',
    '  pdca:B("Self-assessment by PDCA stage","التقييم الذاتي حسب مرحلة PDCA"),\n  capa:B("Open items by type (share of records)","البنود المفتوحة حسب النوع (نسبة من السجلات)"),')
rep('/* ---------- registry ---------- */', '''/* ---------- CAPA — Corrective action (cia-capa:v1). Stage rules are the tool's own (modules/capa.html, stageOf). ---------- */
function capaAd(S){
  if(!S) return finish([],null,false);
  const Q=["RE1","RE2","CA1","CA2","AC1","AC2","EF1","EF2","RD1","RD2","LN1","LN2"], A=(S.assess&&typeof S.assess==="object")?S.assess:{};
  const R=(arr(S.records)||[]).filter(r=>r&&typeof r==="object");
  const ans=Q.filter(q=>num(A[q])!=null), pct=qs=>{ const s=qs.reduce((a,q)=>a+(num(A[q])||0),0); return s/(2*qs.length)*100; };
  const o=x=>(x&&typeof x==="object"&&!Array.isArray(x))?x:{}, tx=v=>String(v==null||typeof v==="object"?"":v).trim(), isD=d=>/^\\d{4}-\\d{2}-\\d{2}$/.test(String(d||""));
  const today=new Date().toISOString().slice(0,10), acts=r=>(Array.isArray(r.actions)?r.actions:[]).filter(a=>a&&typeof a==="object");
  const stage=r=>{ const e=o(r.eff), c=o(r.close), im=o(r.impl), cs=o(r.cause), re=o(r.react), a=acts(r);
    if(e.result==="ineff") return "reopened"; if(tx(c.date)) return "closed";
    if(e.result==="eff"||tx(im.evidence)||(a.length&&a.every(x=>x.st==="done"))) return "verify";
    if(tx(cs.root)) return "action"; if(tx(re.correction)||tx(re.containment)) return "cause"; return "react"; };
  let effC=0, actO=0, effO=0, reo=0, wait=0;
  R.forEach(r=>{ const st=stage(r), e=o(r.eff);
    if(st==="closed"&&e.result==="eff") effC++;
    if(st!=="closed"&&acts(r).some(a=>a.st!=="done"&&isD(a.due)&&a.due<today)) actO++;
    const eo=st!=="closed"&&st!=="reopened"&&isD(e.planned)&&e.planned<today&&!e.result; if(eo) effO++;
    if(st==="reopened") reo++; if(st==="verify"&&!e.result&&!eo) wait++; });
  const m=[ M("caAs", ans.length? pct(Q) : null, "perf", ans.length? `${Math.round(pct(Q))}%` : ""),
            M("caEff", R.length? share(effC,R.length) : null, "perf", R.length? frac(effC,R.length) : ""),
            M("an", ans.length? share(ans.length,Q.length) : null, "prog", frac(ans.length,Q.length)) ];
  const IT=[[B("Overdue actions","إجراءات متأخرة"),actO,"#C2410C"],[B("Overdue effectiveness reviews","مراجعات فعالية متأخرة"),effO,"#B45309"],
            [B("Reopened: action not effective","أعيد فتحها: الإجراء غير فعال"),reo,"#9A3412"],[B("Waiting for effectiveness review","تنتظر مراجعة الفعالية"),wait,"#C9821A"]];
  const bd = R.length ? {t:BDT.capa, items:IT.map(([l,n,col])=>({l, v:share(n,R.length), t:String(n), col}))} : null;
  return finish(m, bd, ans.length>0 || R.length>0);
}

/* ---------- registry ---------- */''')
rep('{k:"pdca",    sys:"aud", key:"cia-pdca:v1", code:"PDCA", n:B("PDCA continual improvement","دورة التحسين المستمر PDCA"), f:pdcaAd},',
    '{k:"pdca",    sys:"aud", key:"cia-pdca:v1", code:"PDCA", n:B("PDCA continual improvement","دورة التحسين المستمر PDCA"), f:pdcaAd},\n  {k:"capa",    sys:"aud", key:"cia-capa:v1", code:"CAPA", n:B("CAPA corrective action","الإجراءات التصحيحية CAPA"), f:capaAd},')
rep('w8Ad,pdcaAd}};', 'w8Ad,pdcaAd,capaAd}};')
demo = json.load(open(sys.argv[2], encoding="utf-8")) if len(sys.argv) > 2 else {"st": "none", "idx": None, "comp": None, "m": [], "bd": None}
rep('const DEMO_RES = {', 'const DEMO_RES = {"capa": ' + json.dumps(demo, ensure_ascii=False) + ', ')
# 8. home page data (step 1 of 2026-10-11): tool facts, news, request mapping, Advisor rules
rep(' w8: TI(0,7,"modreg"', ''' capa: TI(12,0,"assess",{en:"Self-assessment",ar:"التقييم الذاتي"},["qhse","aud","ceo"],["iso"],
  {en:"Follows every nonconformity from reaction to a closure backed by an effectiveness check, each record linked to its NCR or audit finding.", ar:"تتابع كل عدم مطابقة من التفاعل حتى إغلاق يسنده التحقق من الفعالية، وكل سجل مربوط بتقرير عدم المطابقة أو ملاحظة التدقيق."},
  {en:"Auditors ask whether the cause was removed and whether the fix worked, not only whether the case was corrected; many records close without that proof.", ar:"يسأل المدقق: هل أُزيل السبب؟ وهل نجح الإجراء؟ وليس فقط هل صُحّحت الحالة؛ وكثير من السجلات تُغلق دون هذا الدليل."},
  {en:"A 12-question self-assessment, CAPA records with an automatic audit, read-only import from the Smart Audit center, a dashboard, an HTML report and CSV.", ar:"تقييم ذاتي من 12 سؤالاً، وسجلات CAPA بتدقيق آلي، واستيراد للقراءة من مركز التدقيق الذكي، ولوحة مؤشرات، وتقرير HTML وCSV."},
  {en:"10 minutes for the self-assessment; 20–30 minutes per record", ar:"10 دقائق للتقييم الذاتي، و20–30 دقيقة لكل سجل"}),
 w8: TI(0,7,"modreg"''')
rep('const NEWS = [\n', '''const NEWS = [
  {k:"capa", d:"2026-10-11", t:{en:"New: CAPA corrective action tool — records from reaction to verified closure, import from the Smart Audit center and a link to PDCA.", ar:"جديد: أداة CAPA للإجراءات التصحيحية — سجلات من التفاعل حتى الإغلاق بعد التحقق، واستيراد من مركز التدقيق الذكي، وربط بدورة PDCA."}},
''')
rep('pdca:["iac",null],w8:["cockpit",null]};', 'pdca:["iac",null],capa:["iac",null],w8:["cockpit",null]};')
rep('["goal","audit",{aud:4,pdca:3,ims:1}],', '["goal","audit",{aud:4,pdca:3,capa:3,ims:1}],')
rep('["pain","repeat",{aud:2,pdca:2}],', '["pain","repeat",{aud:2,pdca:2,capa:2}],')
open(path, "w", encoding="utf-8").write(s)
print("index.html: CAPA linked (URL, system row, toolkit card, toolbox entry, knowledge topic, compliance note, dashboard adapter, home data)")
