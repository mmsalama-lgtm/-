"""EXPLAIN_DMAIC — data for the CIA Explain Kit v1.4 in modules/dmaic.html (build step 2026-10-16, DMAIC improvement project).
DMAIC is an improvement method (the Six Sigma improvement cycle: Define, Measure, Analyse, Improve, Control), not a clause of any standard.
The clause guide is built on the ISO 9001:2026 clauses the method serves. Clause numbers and titles checked on 2026-10-16 against the
uploaded official texts only:
  ISO 9001:2026 (ISO_9001_2026en 1.pdf) — Introduction 0.3.2 Plan-Do-Check-Act cycle (the introduction explains, it sets no requirement);
                                           6.2 Quality objectives and planning to achieve them (6.2.1 a)–h): measurable, monitored, ...;
                                           6.2.2 a)–e)); 7.1.5 Monitoring and measuring resources (7.1.5.1 General: valid and reliable results,
                                           suitable and maintained resources; 7.1.5.2 Traceability of measurement results a)–c) and the review of
                                           earlier results when equipment is found unfit); Annex A.7.1.5 (monitoring and measurement explained,
                                           non-equipment elements such as defined criteria and the competence of people); 7.1.6 Organizational
                                           knowledge; 8.5 Production and service provision — 8.5.1 Control of production and service provision
                                           (controlled conditions a)–h), including c) monitoring and measurement at appropriate stages and
                                           g) actions to prevent human error), 8.5.6 Control of changes; 9.1 Monitoring, measurement, analysis and
                                           evaluation — 9.1.1 General a)–d), 9.1.3 Analysis and evaluation a)–h) and its NOTE (methods to analyse
                                           data can include statistical techniques); 10.1 Continual improvement (a)–c) and its NOTE on incremental
                                           or breakthrough change); 10.2.1 b) 2), d), f); Annex A.10.2
  ISO 9000:2026 (ISO 9000-2026.pdf; scanned, read by OCR) — 3.3.1 process, 3.7.11 objective, 3.10.2 quality characteristic,
                                           3.11.4 measurement, 3.8.6 objective evidence, 4.2.6 Improvement (4.2.6.3, 4.2.6.4),
                                           4.2.7 Evidence-based decision-making (4.2.7.2, 4.2.7.4)
Not uploaded, so "not verified": any Six Sigma body of knowledge or reference, ISO 13053, ISO 7870, ISO 10017 and ISO 10009 (the last two
named only in the notes of ISO 9001:2026 Annex A.9.1), and any statistics standard.
No text of a standard is reproduced: every "requirement" is an interpretive summary in independent wording.
Items coded GD-n are the author's practical guidance on the method, not clauses. Usage: python3 data_dmaic.py > explain_dmaic.js"""
import json, sys


def B(ar, en):
    return {"ar": ar, "en": en}


def L(*pairs):
    return [B(a, e) for a, e in pairs]


def IT(c, q, t, r, x, h, e, g, owner, kpi):
    return {"c": c, "q": q, "t": t, "r": r, "x": x, "h": h, "e": e, "g": g, "owner": owner, "kpi": kpi}


IS = ("ملخص تفسيري، وليس النص الرسمي: ", "Interpretive summary, not the official text: ")
GD = ("إرشاد تطبيقي من خبرة الكاتب، وليس نصاً معيارياً: ", "Practical guidance from the author's experience, not normative text: ")
EX = ("مثال توضيحي، وليس بيانات حقيقية: ", "Illustrative example, not real data: ")


def R(kind, ar, en):
    return B(kind[0] + ar, kind[1] + en)


meta = {
    "code": "DMAIC",
    "name": B("مشروع التحسين بمنهج DMAIC", "DMAIC Improvement Project"),
    "edition": B("أداة منهجية: مشروع تحسين قائم على البيانات بخمس مراحل وبوابات", "Method tool: a data-driven improvement project in five phases with gates"),
    "status": B("الأداة الثامنة في صندوق أدوات التحسين المستمر", "Eighth tool in the Continual Improvement Toolbox"),
    "cert": False,
    "certNote": B("DMAIC منهج للتحسين (دورة التحسين في Six Sigma)، وليس مواصفة ولا بنداً. تذكر ISO 9001:2026 دورة PDCA في مقدمتها (0.3.2)، وتقول ملاحظة البند 9.1.3 إن طرق تحليل البيانات قد تشمل تقنيات إحصائية؛ والمقدمة والملاحظات شرح لا متطلبات. والمتطلبات التي يخدمها المنهج هي الأهداف القابلة للقياس (6.2)، وموارد القياس التي تعطي نتائج صحيحة وموثوقة (7.1.5)، والرصد والتحليل (9.1)، والضبط وضبط التغييرات (8.5)، والإجراء التصحيحي ومراجعة فعاليته (10.2.1)، والتحسين المستمر (10.1).",
                  "DMAIC is an improvement method (the Six Sigma improvement cycle), not a standard or a clause. ISO 9001:2026 names the PDCA cycle in its introduction (0.3.2), and the note to clause 9.1.3 says that methods to analyse data can include statistical techniques; the introduction and the notes explain, they set no requirements. The requirements the method serves are measurable objectives (6.2), measuring resources that give valid and reliable results (7.1.5), monitoring and analysis (9.1), controlled conditions and the control of changes (8.5), corrective action and the review of its effectiveness (10.2.1), and continual improvement (10.1)."),
    "verified": B("2026-10-16، من الملفات الرسمية المرفوعة إلى المشروع: ISO_9001_2026en 1.pdf وISO 9000-2026.pdf (ملف ممسوح ضوئياً، قُرئ بالتعرف الضوئي على النص). كل «متطلب» ملخص تفسيري، وليس النص الرسمي. أي مرجع لـ Six Sigma، وISO 13053 وISO 7870 وISO 10017 وISO 10009 وأي مواصفة إحصاء، غير مرفوعة: «غير متحقق منه».",
                  "2026-10-16, against the official files uploaded to the project: ISO_9001_2026en 1.pdf and ISO 9000-2026.pdf (a scanned file, read with OCR). Every “requirement” is an interpretive summary, not the official text. Any Six Sigma reference, ISO 13053, ISO 7870, ISO 10017, ISO 10009 and any statistics standard are not uploaded: “not verified”.")
}

std = {
    "purpose": B("أن تُحل المشكلة التي لا يُعرف سببها بمشروع قائم على البيانات: هدف يُكتب قبل التحليل ولا يُحرَّك، ومقياس يُوثق به، وأسباب تُثبت بالبيانات لا بالرأي، وحلول تُجرَّب قبل تعميمها، ثم ضبط يحفظ النتيجة وتسليم لمالك العملية؛ وتنتهي كل مرحلة ببوابة يراجعها الراعي بالأسئلة.",
                 "To solve a problem whose cause is unknown with a data-driven project: a goal written before the analysis and not moved, a measure that can be trusted, causes proved with data rather than opinion, solutions piloted before the roll-out, then a control that holds the result and a hand-over to the process owner; each phase ends with a gate the sponsor reviews through questions."),
    "who": B("قادة مشاريع التحسين، ومالكو العمليات، ومهندسو الجودة، والرعاة من الإدارة، ومحللو البيانات، وكل من يملك مشكلة متكررة قابلة للقياس لم تُحل بالحلول السريعة.",
             "Improvement project leads, process owners, quality engineers, sponsors from management, data analysts, and anyone who owns a recurring, measurable problem that quick fixes have not solved."),
    "rolesSub": B("مشروع DMAIC لا ينجح بالأدوات الإحصائية؛ ينجح بمن يقوده، ومن يراجع بواباته، ومن يملك العملية بعده. هذا توزيع مقترح للأدوار.",
                  "A DMAIC project does not succeed through statistical tools; it succeeds through who leads it, who reviews its gates and who owns the process afterwards. This is a suggested split of roles."),
    "roles": [
        {"n": B("قائد المشروع", "Project lead"), "col": "#1B2A4A", "d": B("يكتب الميثاق، ويجمع البيانات مع الفريق، ويحمل المشروع من التعريف إلى التسليم.", "Writes the charter, collects the data with the team, and carries the project from Define to the hand-over.")},
        {"n": B("الراعي", "Sponsor"), "col": "#B8901E", "d": B("يراجع كل بوابة بالأسئلة، ويزيل العوائق، ويقرر الاجتياز أو إعادة العمل أو الإيقاف؛ ولا يكون قائد المشروع.", "Reviews each gate through questions, removes obstacles, and decides pass, rework or stop; not the project lead.")},
        {"n": B("مالك العملية", "Process owner"), "col": "#1E8C93", "d": B("يتسلّم خطة الضبط والنتيجة بتاريخ، ويحافظ عليهما بعد انتهاء المشروع.", "Takes over the control plan and the result on a date, and keeps them after the project ends.")},
        {"n": B("الفريق", "The team"), "col": "#C2410C", "d": B("من يؤدي العمل فعلاً: يعرفون ما يحدث، ويجمعون البيانات، ويجربون الحلول على نطاق صغير.", "The people who do the work: they know what happens, collect the data and pilot the solutions on a small scale.")},
        {"n": B("مالك البيانات", "Data owner"), "col": "#3563C9", "d": B("يقدم البيانات بالتعريف التشغيلي نفسه قبل التغيير وبعده، حتى تُقارن النتيجة بالهدف بصدق.", "Provides the data on the same operational definition before and after the change, so the result is compared with the goal honestly.")}
    ],
    "map": [
        {"no": "1", "t": B("هل يناسب DMAIC؟", "Does DMAIC fit?"), "d": B("السبب غير معروف، والبيانات ممكنة.", "Cause unknown, data possible."), "go": "GD-1"},
        {"no": "2", "t": B("الميثاق والهدف", "The charter and the goal"), "d": B("مشكلة بتكلفتها، وراعٍ، وهدف رقمي بتاريخ.", "A problem with its cost, a sponsor, a numeric dated goal."), "go": "6.2.1"},
        {"no": "3", "t": B("صوت العميل وSIPOC", "Voice of the customer and SIPOC"), "d": B("متطلبات حرجة، ونطاق داخل وخارج.", "Critical requirements, scope in and out."), "go": "GD-3"},
        {"no": "4", "t": B("عرّف المقياس", "Define the measure"), "d": B("ما يُعدّ، والوحدة، والمصدر، والعينة.", "What is counted, unit, source, sample."), "go": "GD-6"},
        {"no": "5", "t": B("ثق بالقياس", "Trust the measurement"), "d": B("تحقق قبل الأساس، بقاعدة مكتوبة.", "Checked before the baseline, against a written rule."), "go": "7.1.5.1"},
        {"no": "6", "t": B("الأساس", "The baseline"), "d": B("فترة وعينة ورسم تشغيلي.", "A period, a sample and a run chart."), "go": "9.1.1"},
        {"no": "7", "t": B("أثبت الأسباب بالبيانات", "Prove the causes with data"), "d": B("مقارنة مجموعات، لا تصويت.", "A comparison of groups, not a vote."), "go": "9.1.3"},
        {"no": "8", "t": B("جرّب قبل التعميم", "Pilot before the roll-out"), "d": B("النتيجة مقابل الهدف، ومخاطر التغيير.", "Result against the goal, risks of the change."), "go": "8.5.6"},
        {"no": "9", "t": B("اضبط وسلّم", "Control and hand over"), "d": B("خطة ضبط برد فعل، وتسليم مؤرخ.", "A control plan with a reaction, a dated hand-over."), "go": "8.5.1"},
        {"no": "10", "t": B("بوابة لكل مرحلة", "A gate for each phase"), "d": B("الراعي يسأل، ثم يقرر.", "The sponsor asks, then decides."), "go": "GD-2"}
    ],
    "rel": [
        {"code": "A3", "n": B("حل المشكلات بأسلوب A3", "A3 problem solving"), "col": "#B8901E", "d": B("عندما لا تُغلق صفحة A3 الفجوة، يبدأ مشروع DMAIC منها (قراءة فقط) ويحمل رقمها، وتعرض صفحة A3 المشاريع التي تذكرها.", "When an A3 does not close the gap, a DMAIC project starts from it (read-only) and carries its id, and the A3 lists the projects that name it."), "tool": "./a3.html"},
        {"code": "RCA", "n": B("تحليل السبب الجذري — التحقيق", "Root cause analysis — investigation"), "col": "#1B2A4A", "d": B("للتحقيق الكامل في حدث جسيم؛ أسبابه الجذرية المثبتة تدخل مرحلة التحليل مثبتةً بالتحليل المرتبط.", "For a full investigation of a severe event; its proved root causes enter Analyse, proved by the linked analysis."), "tool": "./rca.html"},
        {"code": "Pareto", "n": B("باريتو — تحليل القلة الحيوية", "Pareto — vital few analysis"), "col": "#C9821A", "d": B("يؤطر المشكلة ويقسّم البيانات: الفئة الحيوية تفتح مشروعاً، وقد يكون تحليل باريتو أساس المرحلة الثانية.", "Frames the problem and stratifies the data: a vital-few category opens a project, and a Pareto analysis can serve as the Measure baseline."), "tool": "./pareto.html"},
        {"code": "Fishbone", "n": B("عظمة السمكة", "Fishbone"), "col": "#1E8C93", "d": B("ترسم الأسباب المحتملة؛ يُؤخذ سببها برقم التحليل ثم يُثبت أو يُستبعد بالبيانات.", "Maps the candidate causes; its cause is taken by analysis id, then proved or ruled out with data."), "tool": "./fishbone.html"},
        {"code": "5 Whys", "n": B("لماذا الخمس", "5 Whys"), "col": "#3563C9", "d": B("تحفر في مسار واحد؛ يُؤخذ سببها برقم التحليل.", "Digs down one path; its cause is taken by analysis id."), "tool": "./five-whys.html"},
        {"code": "CAPA", "n": B("الإجراءات التصحيحية", "Corrective action"), "col": "#C2410C", "d": B("عندما توجد حالة عدم مطابقة، تبقى إجراءاتها التصحيحية في سجل CAPA الذي يذكره المشروع برقمه.", "When a nonconformity is involved, its corrective actions stay in the CAPA record the project names by id."), "tool": "./capa.html"},
        {"code": "PDCA", "n": B("دورة PDCA", "PDCA cycle"), "col": "#3C9A5F", "d": B("دورة الضبط بعد التسليم، أو الدورة التالية لما بقي مفتوحاً، تُدار في أداة PDCA وتُذكر برقمها.", "The control cycle after the hand-over, or the next cycle for what is left open, is run in the PDCA tool and named by its id."), "tool": "./pdca.html"}
    ],
    "comp": [
        {"code": "ISO 9001:2026 §0.3.2", "n": B("دورة PDCA (المقدمة)", "The PDCA cycle (introduction)"),
         "d": B("الخطة والتنفيذ والتحقق والتصرف، وتنطبق على كل العمليات وعلى النظام كله. المقدمة شرح وليست متطلبات.", "Plan, Do, Check and Act, applicable to all processes and to the system as a whole. The introduction explains; it sets no requirements.")},
        {"code": "ISO 9001:2026 §7.1.5 · §9.1", "n": B("موارد القياس والرصد والتحليل", "Measuring resources, monitoring and analysis"),
         "d": B("موارد قياس تعطي نتائج صحيحة وموثوقة، وتحديد ما يُرصد ويُقاس وطرقه ومتى، وتحليل البيانات وتقييمها؛ وقد تشمل الطرق تقنيات إحصائية (ملاحظة 9.1.3).", "Measuring resources that give valid and reliable results, deciding what is monitored and measured, how and when, and analysing and evaluating the data; methods can include statistical techniques (note to 9.1.3).")},
        {"code": "ISO 9001:2026 §8.5.1 · §8.5.6 · §10.2.1", "n": B("الضبط وضبط التغييرات والإجراء التصحيحي", "Controlled conditions, control of changes, corrective action"),
         "d": B("ظروف مضبوطة بالرصد في المراحل المناسبة، ومراجعة التغييرات قبل اعتمادها، وتحديد الأسباب ومراجعة فعالية الإجراء.", "Controlled conditions with monitoring at the right stages, changes reviewed before they are adopted, causes determined and the effectiveness of the action reviewed.")},
        {"code": "ISO 9000:2026 §3.10.2 · §3.11.4 · §4.2.7", "n": B("الخاصية النوعية والقياس والقرار المبني على الدليل", "Quality characteristic, measurement, evidence-based decisions"),
         "d": B("الخاصية النوعية مرتبطة بمتطلب، والقياس عملية لتحديد قيمة، والقرار يُبنى على الوقائع وتحليل البيانات.", "A quality characteristic relates to a requirement, measurement is a process to determine a value, and decisions rest on facts and data analysis.")},
        {"code": "Six Sigma · ISO 13053 · ISO 7870 · ISO 10017", "n": B("مراجع المنهج والإحصاء (غير متحقق منه)", "Method and statistics references (not verified)"),
         "d": B("لا يوجد مرجع لـ Six Sigma ولا ISO 13053 ولا ISO 7870 مرفوع إلى المشروع، فما يرد عن المنهج هنا إرشاد تطبيقي «غير متحقق منه» من نص. ISO 10017 تذكرها ملاحظة الملحق A.9.1 فقط.", "No Six Sigma reference, ISO 13053 or ISO 7870 is uploaded to the project, so what is said here about the method is practical guidance, “not verified” against a text. ISO 10017 is only named in a note of Annex A.9.1.")}
    ],
    "buy": [],
    "buyNote": B("للنص الرسمي للمواصفات استخدم النسخ المنشورة من المنظمة الدولية للتوحيد القياسي، وليس هذه المنصة.",
                 "For the official text of the standards, use the copies published by the International Organization for Standardization, not this platform.")
}

texts = {
    "stdT": B("دليل المنهجية", "Method guide"),
    "stdS": B("كيف يُدار مشروع DMAIC صادق: متى يناسب، والميثاق والهدف، وصوت العميل وSIPOC، وتعريف المقياس والثقة فيه، والأساس، وإثبات الأسباب بالبيانات، والتجربة، وخطة الضبط والتسليم، وبوابة الراعي في نهاية كل مرحلة.",
              "How to run an honest DMAIC project: when it fits, the charter and the goal, the voice of the customer and SIPOC, defining and trusting the measure, the baseline, proving causes with data, the pilot, the control plan and hand-over, and the sponsor's gate at the end of each phase."),
    "clT": B("دليل البنود", "Clause guide"),
    "clS": B("البنود التي يخدمها المنهج، بأرقامها في ISO 9001:2026، من دورة PDCA في المقدمة (0.3.2) إلى الأهداف 6.2 وموارد القياس 7.1.5 والتحليل 9.1.3 والإجراء التصحيحي 10.2. لكل بند ملخص تفسيري ومثال وما يطلبه المدقق. قواعد المنهج مرقّمة GD وهي إرشاد لا بنود. الأمثلة توضيحية وليست بيانات حقيقية.",
             "The clauses the method serves, numbered as in ISO 9001:2026, from the PDCA cycle in the introduction (0.3.2) to objectives 6.2, measuring resources 7.1.5, analysis 9.1.3 and corrective action 10.2. Each one has an interpretive summary, an example and what the auditor asks for. The method's rules are coded GD: guidance, not clauses. Examples are illustrative, not real data."),
    "note": B("ما يرد تحت «المتطلب» ملخص تفسيري بصياغة مستقلة، وليس النص الرسمي للمواصفة. وما تحت «كيف تطبقه» و«الفجوات» إرشاد تطبيقي. أرقام البنود وعناوينها متحقق منها من النصوص الرسمية المرفوعة.",
              "Text under “requirement” is an interpretive summary in independent wording, not the official text of the standard. “How to implement” and “common gaps” are practical guidance. Clause numbers and titles were checked against the uploaded official texts."),
    "chgT": B("ما الذي تغيّر", "What changed"),
    "chgS": B("", "")
}

phases = {
    "frame": {"c": "#7A869E", "t": "#EEF1F6", "n": B("المنهج والبوابات", "The method and its gates")},
    "define": {"c": "#C2410C", "t": "#FDECE3", "n": B("التعريف", "Define")},
    "measure": {"c": "#3563C9", "t": "#E7EEFB", "n": B("القياس والتحليل", "Measure and Analyse")},
    "control": {"c": "#1E8C93", "t": "#E3F4F4", "n": B("التحسين والضبط", "Improve and Control")},
    "learn": {"c": "#3C9A5F", "t": "#E5F4EA", "n": B("التحسين المستمر والتعلّم", "Continual improvement and learning")}
}

S = []

S.append({"id": "0.3.2", "grp": "core", "ph": "frame", "col": "#7A869E", "tint": "#EEF1F6",
  "t": B("المقدمة 0.3.2 دورة PDCA", "Introduction 0.3.2 Plan-Do-Check-Act cycle"),
  "s": B("المنهج والبوابات", "The method and its gates"), "sh": B("0.3.2 · PDCA", "0.3.2 · PDCA"),
  "p": B("DMAIC مشروع تحسين يسير على منطق دورة PDCA بخمس مراحل: التعريف والقياس والتحليل خطة مفصلة، والتحسين تنفيذ وتحقق، والضبط تصرف يحفظ النتيجة. وتنتهي كل مرحلة ببوابة.",
         "DMAIC is an improvement project that follows the logic of the PDCA cycle in five phases: Define, Measure and Analyse are a detailed Plan, Improve is Do and Check, and Control is the Act that holds the result. Each phase ends with a gate."),
  "fl": L(("التعريف", "Define"), ("القياس", "Measure"), ("التحليل", "Analyse"), ("التحسين", "Improve"), ("الضبط", "Control")),
  "it": [
    IT("0.3.2", "x:tools", B("DMAIC على دورة PDCA", "DMAIC on the PDCA cycle"),
       R(IS, "تصف مقدمة ISO 9001:2026 دورة PDCA: الخطة تضع أهداف النظام وعملياته والموارد اللازمة وتحدد المخاطر والفرص وتعالجها، والتنفيذ ينفذ ما خُطط له، والتحقق يرصد العمليات والمنتجات والخدمات ويقيسها حيث ينطبق مقابل السياسات والأهداف والمتطلبات ويبلغ النتائج، والتصرف يتخذ إجراءات لتحسين الأداء. وتنطبق على كل العمليات وعلى النظام كله. والمقدمة شرح، وليست متطلبات. وDMAIC ليس بنداً فيها، بل طريقة منظمة لتطبيق هذا المنطق على مشكلة سببها غير معروف.",
         "the introduction of ISO 9001:2026 describes the PDCA cycle: Plan establishes the objectives of the system and its processes and the resources needed, and determines and addresses risks and opportunities; Do implements what was planned; Check monitors and, as applicable, measures processes, products and services against policies, objectives and requirements and reports the results; Act takes actions to improve performance. It applies to all processes and to the system as a whole. The introduction explains; it sets no requirements. DMAIC is not a clause in it, but a structured way to apply this logic to a problem whose cause is unknown."),
       R(EX, "في مشروع الخرسانة: التعريف والقياس والتحليل من 1 إلى 6 سبتمبر (الخطة)، والتجربة في محطة واحدة من 7 إلى 13 سبتمبر (التنفيذ والتحقق)، وخطة الضبط ثم دورة PD-EX-03 (التصرف).",
         "on the concrete project: Define, Measure and Analyse from 1 to 6 September (Plan), the pilot on one plant from 7 to 13 September (Do and Check), and the control plan, then cycle PD-EX-03 (Act)."),
       L(("اقرأ المراحل الخمس كقصة واحدة من المشكلة إلى التسليم", "Read the five phases as one story from the problem to the hand-over"), ("لا تقفز إلى الحل قبل أن يكتمل التحليل", "Do not jump to the solution before the analysis is complete")),
       L(("مشروع بمراحله الخمس وبواباته", "A project with its five phases and gates"),),
       L(("مشروع يبدأ بالحل", "A project that starts with the solution"), ("مشروع يتوقف عند التحسين ولا يصل إلى الضبط", "A project that stops at Improve and never reaches Control")),
       B("قائد المشروع", "Project lead"), B("نسبة المشاريع التي وصلت إلى الضبط", "Share of projects that reached Control")),
    IT("GD-1", "x:tools", B("متى يناسب DMAIC، ومتى لا يناسب", "When DMAIC fits, and when it does not"),
       R(GD, "DMAIC للمشكلة التي لا يُعرف سببها وعمليتها قابلة للقياس والبيانات عنها ممكنة الجمع. أما الحل المعروف فمشروع تنفيذ، يُنفذ ويُتابع بخطة لا بـ DMAIC. والمشكلة الصغيرة يحلها لماذا الخمس أو صفحة A3، والحدث الجسيم لمرة واحدة يبدأ بتحقيق RCA. ويستخدم DMAIC صندوق الأدوات ولا يحل محله: باريتو للتأطير والتقسيم، وعظمة السمكة ولماذا الخمس للأسباب المحتملة، وRCA للتحقيق الكامل، وA3 لرواية القصة، وPDCA لدورة الضبط، وCAPA عند عدم المطابقة.",
         "DMAIC is for a problem whose cause is unknown, whose process can be measured and whose data can be collected. A known solution is an implementation project, run and followed with a plan, not a DMAIC. A small problem is solved with a 5 Whys or an A3, and a severe one-off event starts with an RCA investigation. DMAIC uses the toolbox rather than replacing it: Pareto to frame and stratify, Fishbone and 5 Whys for candidate causes, RCA for a full investigation, A3 to tell the story, PDCA for the control cycle, and CAPA when a nonconformity is involved."),
       R(EX, "بعد صفحة A3 بقي رفض الخرسانة عند 6% وسببه غير واضح، فبدأ مشروع DMAIC؛ أما تأخر اعتماد المخططات فحله معروف (قائمة أولوية ومراجع ثانٍ)، فأُدير دورة PDCA لا مشروع DMAIC.",
         "after the A3, concrete rejections stayed at 6% with an unclear cause, so a DMAIC project started; the delay in drawing approvals had a known fix (a priority list and a second reviewer), so it was run as a PDCA cycle, not a DMAIC."),
       L(("اسأل في بوابة التعريف: هل نعرف الحل مسبقاً؟", "Ask at the Define gate: do we already know the solution?"), ("أوقف المشروع عند البوابة إذا كان الجواب نعم", "Stop the project at the gate if the answer is yes")),
       L(("قرار بوابة التعريف وأسئلتها", "The Define gate decision and its questions"),),
       L(("DMAIC لتنفيذ حل معروف", "A DMAIC to implement a known solution"), ("مشروع بلا بيانات يمكن جمعها", "A project with no data that can be collected")),
       B("الراعي", "Sponsor"), B("نسبة المشاريع التي اجتازت بوابة التعريف", "Share of projects that passed the Define gate")),
    IT("GD-2", "GT1", B("المراحل وبواباتها", "The phases and their gates"),
       R(GD, "تنتهي كل مرحلة ببوابة يراجعها الراعي بالأسئلة لا بالتوقيع، ويقرر: اجتياز، أو إعادة عمل، أو إيقاف. ولا تبدأ المرحلة التالية قبل الاجتياز. ومن أسئلة البوابات: هل السبب فعلاً غير معروف؟ هل الهدف مكتوب قبل التحليل؟ هل نثق بالقياس؟ ما الفرق بين المجموعتين وهل يكفي حجم العينة؟ هل بلغت التجربة الهدف؟ من يملك خطة الضبط الآن؟ والإيقاف عند بوابة قرار سليم وليس فشلاً.",
         "each phase ends with a gate the sponsor reviews through questions, not a signature, and decides: pass, rework or stop. The next phase does not start before the pass. Gate questions include: is the cause really unknown? Was the goal written before the analysis? Can we trust the measurement? What is the difference between the groups, and is the sample large enough? Did the pilot reach the goal? Who owns the control plan now? Stopping at a gate is a sound decision, not a failure."),
       R(EX, "في بوابة التحليل سأل مدير المشاريع: «ما الفرق بين الشحنات بماء مبرد ودونه، وهل يكفي حجم العينة؟»، فأُضيفت مقارنة الانتظار عند البوابة واستُبعدت بالبيانات.",
         "at the Analyse gate the projects director asked: “what is the difference between loads with and without chilled water, and is the sample large enough?”, and the gate-wait comparison was added and ruled out with data."),
       L(("سجّل لكل بوابة التاريخ والمراجع والأسئلة والقرار", "Record each gate's date, reviewer, questions and decision"), ("لا تجعل قائد المشروع يراجع بوابته", "Do not let the project lead review their own gate")),
       L(("سجل البوابات المؤرخة بالأسئلة والقرارات", "The dated record of gates with questions and decisions"),),
       L(("بوابات بالتوقيع فقط", "Gates by signature only"), ("مرحلة تبدأ قبل اجتياز بوابة سابقتها", "A phase that starts before the previous gate is passed")),
       B("الراعي", "Sponsor"), B("نسبة المراحل المكتملة التي اجتازت بوابتها", "Share of completed phases passed at their gate"))
  ]})

S.append({"id": "6.2", "grp": "core", "ph": "define", "col": "#C2410C", "tint": "#FDECE3",
  "t": B("البند 6.2 أهداف الجودة والتخطيط لتحقيقها", "Clause 6.2 Quality objectives and planning to achieve them"),
  "s": B("التعريف: الميثاق والهدف", "Define: the charter and the goal"), "sh": B("6.2 · الهدف", "6.2 · Goal"),
  "p": B("الميثاق يقول ما المشكلة وكم تكلف، ومن العميل وما متطلباته الحرجة، وأين يبدأ النطاق وأين ينتهي، وما الهدف بتاريخه. ويُكتب الهدف قبل التحليل.",
         "The charter says what the problem is and what it costs, who the customer is and what is critical to them, where the scope starts and stops, and what the goal is, with its date. The goal is written before the analysis."),
  "fl": L(("المشكلة", "Problem"), ("CTQ", "CTQ"), ("SIPOC", "SIPOC"), ("الهدف", "Goal")),
  "it": [
    IT("6.2.1", "DF1", B("ميثاق براعٍ وهدف رقمي بتاريخ", "A charter with a sponsor and a numeric dated goal"),
       R(IS, "تضع المنشأة أهداف جودة للوظائف والمستويات والعمليات المعنية، وتكون الأهداف متسقة مع السياسة، وقابلة للقياس، وتراعي المتطلبات المنطبقة، ومرصودة، ومُبلَّغة، ومحدّثة عند الحاجة، ومتاحة معلومات موثقة. ويعرّف ISO 9000:2026 الهدف (3.7.11) بأنه نتيجة يراد تحقيقها، ويذكر أن من أسمائه الغاية والمستهدف. لذلك يُكتب هدف المشروع رقماً من وإلى بموعد، ويُسجَّل تاريخ كتابته.",
         "the organization sets quality objectives for the relevant functions, levels and processes; they are consistent with the policy, measurable, take account of applicable requirements, monitored, communicated, updated as needed and available as documented information. ISO 9000:2026 defines an objective (3.7.11) as a result to be achieved, and notes it can also be called an aim, a goal or a target. That is why a project goal is written as a number from and to with a deadline, and the date it was written is recorded."),
       R(EX, "«نسبة الشحنات المرفوضة من 6% إلى أقل من 3% بحلول 31 أكتوبر 2026»، كُتب في 1 سبتمبر، وبدأ التحليل في 4 سبتمبر.",
         "“rejected loads from 6% to below 3% of loads by 31 October 2026”, written on 1 September; the analysis started on 4 September."),
       L(("سمِّ الراعي وقائد المشروع شخصين مختلفين", "Name the sponsor and the project lead as two different people"), ("اكتب الهدف رقماً بموعد وتاريخ كتابة", "Write the goal as a number, with a deadline and the date it was written")),
       L(("ميثاق المشروع بالهدف وتاريخه", "The project charter with the goal and its date"),),
       L(("هدف بالصفات: «تحسين الجودة»", "A goal in adjectives: “improve quality”"), ("راعٍ هو قائد المشروع نفسه", "A sponsor who is the project lead")),
       B("الراعي", "Sponsor"), B("نسبة المشاريع بهدف رقمي مؤرخ", "Share of projects with a numeric dated goal")),
    IT("GD-3", "DF2", B("صوت العميل ومتطلباته الحرجة (CTQ)", "The voice of the customer and the CTQs"),
       R(GD, "يُترجم صوت العميل إلى متطلبات حرجة للجودة (CTQ) قابلة للقياس، بحدّ أو مواصفة لكل منها، قبل اختيار مقياس المشروع. ويعرّف ISO 9000:2026 الخاصية النوعية (3.10.2) بأنها خاصية متأصلة مرتبطة بمتطلب، والعميل (3.9.1) قد يكون داخلياً يتسلم ناتج عملية أخرى. خمسة متطلبات على الأكثر تكفي؛ الكثرة تشتت المشروع.",
         "the voice of the customer is turned into measurable critical-to-quality requirements (CTQs), each with a limit or specification, before the project measure is chosen. ISO 9000:2026 defines a quality characteristic (3.10.2) as an inherent characteristic related to a requirement, and a customer (3.9.1) can be internal, receiving the output of another process. Five requirements at most are enough; more scatter the project."),
       R(EX, "العميل الداخلي هو الفريق الإنشائي: حرارة الخرسانة 32 °م أو أقل، والهبوط ضمن مدى الخلطة، و90 دقيقة أو أقل من الخلط إلى التفريغ.",
         "the internal customer is the structural team: concrete at 32 °C or less, slump within the mix range, and 90 minutes or less from batching to discharge."),
       L(("اسأل العميل ما الذي يجعل الناتج مقبولاً", "Ask the customer what makes the output acceptable"), ("اكتب لكل CTQ حداً قابلاً للقياس", "Give each CTQ a measurable limit")),
       L(("قائمة CTQ بحدودها في الميثاق", "The CTQ list with limits in the charter"),),
       L(("CTQ بلا حد", "A CTQ with no limit"), ("مقياس المشروع لا يرتبط بأي CTQ", "A project measure tied to no CTQ")),
       B("قائد المشروع", "Project lead"), B("نسبة المشاريع بـ CTQ مكتوب بحده", "Share of projects with a CTQ and its limit")),
    IT("GD-4", "DF3", B("SIPOC والنطاق", "SIPOC and the scope"),
       R(GD, "يرسم SIPOC العملية على مستوى عالٍ: الموردون، والمدخلات، وخطوات العملية من 5 إلى 7، والمخرجات، والعملاء. ويعرّف ISO 9000:2026 العملية (3.3.1) بأنها أنشطة مترابطة تستخدم المدخلات أو تحولها لتعطي نتيجة. ويُكتب ما داخل النطاق وما خارجه صراحةً، فلا يتسع المشروع أثناء العمل.",
         "a SIPOC maps the process at a high level: suppliers, inputs, 5 to 7 process steps, outputs and customers. ISO 9000:2026 defines a process (3.3.1) as interrelated or interacting activities that use or transform inputs to deliver a result. What is in and out of scope is written plainly, so the project does not grow on the way."),
       R(EX, "داخل النطاق: الشحنات من المحطتين من الخلط حتى القبول. خارج النطاق: تصميم الخلطة واختبارات المكعبات. وسبع خطوات من طلب الشحنة إلى التفريغ.",
         "in scope: loads from both plants from batching to acceptance. Out of scope: the mix design and cube tests. Seven steps from ordering the load to discharge."),
       L(("ارسم SIPOC مع الفريق في جلسة واحدة", "Map the SIPOC with the team in one session"), ("اكتب ما خارج النطاق بالقدر نفسه من الوضوح", "Write what is out of scope just as clearly")),
       L(("SIPOC من 5 إلى 7 خطوات ونطاق مكتوب", "A SIPOC of 5 to 7 steps and a written scope"),),
       L(("عشرون خطوة في SIPOC", "Twenty steps in a SIPOC"), ("نطاق بلا حدود", "A scope with no boundaries")),
       B("قائد المشروع", "Project lead"), B("نسبة المشاريع بنطاق وSIPOC مكتملين", "Share of projects with a complete scope and SIPOC")),
    IT("GD-5", "x:tools", B("الهدف قبل التحليل، ولا يُحرَّك", "The goal before the analysis, and not moved"),
       R(GD, "يُكتب الهدف في مرحلة التعريف قبل بدء التحليل، أي أن تاريخ كتابته لا يأتي بعد تاريخ بدء التحليل. الهدف الذي يُكتب بعد معرفة الأسباب يُكيَّف مع ما نعرف أننا نستطيع فعله، لا مع ما تحتاجه المشكلة. وإذا عُدّل لسبب حقيقي (تغيّر المتطلب، أو ظهر خطأ في الأساس)، يبقى الهدف الأول مكتوباً ومعه السبب.",
         "the goal is written in Define, before the analysis starts, so the date it was written is not after the date the analysis started. A goal written after the causes are known gets fitted to what we know we can do, not to what the problem needs. If it is changed for a real reason (the requirement changed, or the baseline was wrong), the first target stays written with the reason."),
       R(EX, "في مشروع القوالب كُتب الهدف (من 7.1% إلى 3.5%) في 5 أكتوبر، وبدأ التحليل في 9 أكتوبر.",
         "in the formwork project the goal (from 7.1% to 3.5%) was written on 5 October and the analysis started on 9 October."),
       L(("سجّل تاريخ كتابة الهدف وتاريخ بدء التحليل", "Record the date the goal was written and the date the analysis started"),),
       L(("الهدف الأول وسبب تعديله إن عُدّل", "The first target and the reason, if it was changed"),),
       L(("هدف يُعاد كتابته ليناسب النتيجة", "A goal rewritten to fit the result"),),
       B("الراعي", "Sponsor"), B("نسبة الأهداف المكتوبة قبل التحليل", "Share of goals written before the analysis")),
    IT("6.2.2", "x:tools", B("خطة المشروع: ماذا ومن ومتى", "The project plan: what, who and when"),
       R(IS, "عند التخطيط لتحقيق الأهداف تحدد المنشأة ما سيُعمل، والموارد اللازمة، والمسؤول، وموعد الإنجاز، وكيف تُقيَّم النتائج. وفي مشروع DMAIC يحدد الميثاق القائد والراعي والفريق والمراحل والبوابات، ويحدد الضبط طريقة تقييم النتيجة بالمقياس نفسه.",
         "when planning how to achieve objectives, the organization decides what will be done, the resources needed, who is responsible, when it will be completed and how results will be evaluated. In a DMAIC project the charter sets the lead, sponsor, team, phases and gates, and Control sets how the result is evaluated on the same measure."),
       R(EX, "مشروع المعايرة: القائد مهندس الجودة، والراعي مدير الجودة، والفريق مشرفا الموقعين ومدير المعدات، والبوابات من 30 يوليو إلى 14 أكتوبر.",
         "the calibration project: the lead is the quality engineer, the sponsor the quality manager, the team the two site supervisors and the equipment manager, the gates from 30 July to 14 October."),
       L(("ضع في الميثاق موعداً تقريبياً لكل بوابة", "Put an approximate date for each gate in the charter"),),
       L(("الميثاق بأدواره ومواعيده", "The charter with its roles and dates"),),
       L(("مشروع بلا موعد ولا راعٍ", "A project with no date and no sponsor"),),
       B("قائد المشروع", "Project lead"), B("نسبة البوابات في موعدها", "Share of gates on time"))
  ]})

S.append({"id": "7.1.5", "grp": "core", "ph": "measure", "col": "#3563C9", "tint": "#E7EEFB",
  "t": B("البند 7.1.5 موارد الرصد والقياس", "Clause 7.1.5 Monitoring and measuring resources"),
  "s": B("القياس: تعريف المقياس والثقة فيه", "Measure: define the measure and trust it"), "sh": B("7.1.5 · القياس", "7.1.5 · Measurement"),
  "p": B("قبل أي أساس: ما الذي يُعدّ بالضبط، وهل القياس يُوثق به؟ مقياس لا يُوثق به يجعل كل مرحلة بعده غير موثوقة.",
         "Before any baseline: exactly what is counted, and can the measurement be trusted? A measure that cannot be trusted makes every later phase unreliable."),
  "fl": L(("التعريف", "Definition"), ("التحقق", "Check"), ("القاعدة", "Rule"), ("الحكم", "Verdict")),
  "it": [
    IT("GD-6", "ME1", B("التعريف التشغيلي للمقياس", "The operational definition of the measure"),
       R(GD, "التعريف التشغيلي يقول ما الذي يُعدّ أو يُقاس بالضبط، وبأي وحدة، ومن أي مصدر، وعلى أي عينة؛ حتى يحصل شخصان مختلفان على الرقم نفسه من الواقع نفسه. ويعرّف ISO 9000:2026 القياس (3.11.4) بأنه عملية لتحديد قيمة. وبلا تعريف تشغيلي لا يمكن مقارنة ما قبل التغيير بما بعده.",
         "the operational definition says exactly what is counted or measured, in which unit, from which source and on which sample, so that two different people get the same number from the same reality. ISO 9000:2026 defines measurement (3.11.4) as a process to determine a value. Without an operational definition, before and after the change cannot be compared."),
       R(EX, "«الشحنات المرفوضة عند نقطة الاستلام لأي سبب، مقسومة على كل الشحنات المستلمة، لكل أسبوع، من سجل الاستلام QF-CON-11».",
         "“loads rejected at the receiving point for any reason, divided by all loads received, per week, from receiving log QF-CON-11”."),
       L(("اكتب ما يُعدّ وما لا يُعدّ بمثال لكل منهما", "Write what counts and what does not, with an example of each"), ("استخدم التعريف نفسه قبل التغيير وبعده", "Use the same definition before and after the change")),
       L(("التعريف التشغيلي المكتوب في الميثاق", "The operational definition written in the charter"),),
       L(("مقياس يتغير تعريفه بين الأساس والنتيجة", "A measure whose definition changes between baseline and result"),),
       B("مالك البيانات", "Data owner"), B("نسبة المشاريع بتعريف تشغيلي كامل", "Share of projects with a complete operational definition")),
    IT("7.1.5.1", "ME2", B("التحقق من أن القياس يُوثق به قبل الأساس", "Checking the measurement can be trusted before the baseline"),
       R(IS, "تحدد المنشأة الموارد اللازمة لنتائج رصد وقياس صحيحة وموثوقة، وتتأكد أنها مناسبة لنوع القياس ومصانة لتبقى صالحة، وتحتفظ بما يثبت صلاحيتها. ويوضح الملحق A.7.1.5 أن موارد القياس قد تشمل عناصر غير الأجهزة، مثل معايير التقييم المحددة وكفاءة الأشخاص. لذلك يُتحقق من القياس قبل الأساس: تكرار وإعادة إنتاج للقياسات المتكررة، أو اتفاق المقيّمين للبيانات المصنفة، أو مقارنة بمرجع معاير، بقاعدة قبول مكتوبة.",
         "the organization determines the resources needed for valid and reliable monitoring and measurement results, makes sure they suit the type of measurement and are maintained to stay fit, and keeps evidence of their fitness. Annex A.7.1.5 explains that measuring resources can include non-equipment elements, such as defined evaluation criteria and the competence of people. That is why the measurement is checked before the baseline: repeatability and reproducibility for repeated measurements, attribute agreement for classification data, or a comparison with a calibrated reference, against a written acceptance rule."),
       R(EX, "مشروع القوالب: صنّف مهندسان 30 سطراً من سجلات الدوام، فاتفقا في 87% (القاعدة: 90% مقبول، 80–90% جزئي)؛ صدر دليل ترميز قبل تثبيت الأساس.",
         "the formwork project: two engineers classified 30 timesheet lines and agreed on 87% (rule: 90% pass, 80–90% partly); a coding guide was issued before the baseline was fixed."),
       L(("اكتب قاعدة القبول قبل إجراء الفحص", "Write the acceptance rule before running the check"), ("أصلح القياس إذا لم يُوثق به، ثم أعد الفحص", "Fix the measurement if it cannot be trusted, then check again")),
       L(("نتيجة التحقق وتاريخه قبل تاريخ تثبيت الأساس", "The check's result and date, before the date the baseline was fixed"),),
       L(("أساس من بيانات لم يُتحقق منها", "A baseline from data never checked"), ("فحص بلا قاعدة مكتوبة", "A check with no written rule")),
       B("مالك البيانات", "Data owner"), B("نسبة المشاريع بقياس موثوق قبل الأساس", "Share of projects with a trusted measurement before the baseline")),
    IT("7.1.5.2", "x:tools", B("أجهزة القياس وإمكانية التتبع", "Measuring equipment and traceability"),
       R(IS, "عندما يكون تتبع نتائج القياس مطلوباً أو أساسياً للثقة بها، تُعاير أجهزة القياس أو يُتحقق منها على فترات محددة أو قبل الاستخدام مقابل مراجع قابلة للتتبع، وتُعرَّف حالتها، وتُحمى مما يفسد نتائجها. وإذا وُجد جهاز غير صالح، تحدد المنشأة هل تأثرت صحة النتائج السابقة وتتخذ الإجراء المناسب.",
         "when traceability of measurement results is required or essential for confidence in them, measuring equipment is calibrated or verified at set intervals or before use against traceable standards, its status is identified, and it is protected from what would spoil its results. When a device is found unfit, the organization determines whether earlier results were affected and acts as needed."),
       R(EX, "خطة ضبط مشروع المعايرة: الجهاز المتجاوز موعده يُسحب في اليوم نفسه، وتُراجع الاختبارات المأخوذة به منذ موعده.",
         "the calibration project's control plan: a device past its due date is withdrawn the same day, and the tests taken with it since that date are reviewed."),
       L(("اربط كل جهاز في المشروع بشهادة معايرة سارية", "Tie every device in the project to a valid calibration certificate"),),
       L(("سجل المعايرة وملصق الحالة", "The calibration register and the status label"),),
       L(("جهاز متأخر دون مراجعة نتائجه السابقة", "An overdue device with no review of its earlier results"),),
       B("مدير المعدات", "Equipment manager"), B("الأجهزة المتجاوزة موعدها", "Devices past their due date"))
  ]})

S.append({"id": "9.1", "grp": "core", "ph": "measure", "col": "#1B2A4A", "tint": "#E8ECF4",
  "t": B("البند 9.1 الرصد والقياس والتحليل والتقييم", "Clause 9.1 Monitoring, measurement, analysis and evaluation"),
  "s": B("الأساس والتحليل بالبيانات", "The baseline and analysis with data"), "sh": B("9.1 · البيانات", "9.1 · Data"),
  "p": B("الأساس رقم بفترته وعينته ورسم تشغيلي، والسبب يُثبت أو يُستبعد بمقارنة بيانات، لا بالتصويت. والإحصاء يخدم القرار، والأدوات البسيطة تكفي غالباً.",
         "The baseline is a number with its period, sample and a run chart, and a cause is proved or ruled out by comparing data, not by vote. Statistics serve the decision, and simple tools are usually enough."),
  "fl": L(("الأساس", "Baseline"), ("المقارنة", "Comparison"), ("الدليل", "Evidence"), ("القرار", "Decision")),
  "it": [
    IT("9.1.1", "ME3", B("الأساس بفترته وعينته", "The baseline with its period and sample"),
       R(IS, "تحدد المنشأة ما يحتاج إلى رصد وقياس، وطرق الرصد والقياس والتحليل والتقييم التي تضمن نتائج صحيحة، ومتى يُرصد ويُقاس، ومتى تُحلَّل النتائج وتُقيَّم. وفي المشروع: الأساس يُثبَّت بتاريخ، بفترة وعينة معلومتين، ويُرسم رسماً تشغيلياً بنقاطه ووسيطه، لا رقماً واحداً من الذاكرة.",
         "the organization decides what needs to be monitored and measured, the methods for monitoring, measurement, analysis and evaluation that ensure valid results, when monitoring and measuring take place, and when the results are analysed and evaluated. In the project: the baseline is fixed on a date, with a known period and sample, and drawn as a run chart with its points and median, not one number from memory."),
       R(EX, "أساس الخرسانة: تسعة أسابيع (27 إلى 35)، 20 شحنة مرفوضة من 335 (6.0%)، ثُبّت في 3 سبتمبر بعد التحقق من الموازين في 2 سبتمبر.",
         "the concrete baseline: nine weeks (27 to 35), 20 of 335 loads rejected (6.0%), fixed on 3 September after the thermometer check on 2 September."),
       L(("ارسم الأساس رسماً تشغيلياً قبل أي حساب", "Draw the baseline as a run chart before any calculation"), ("اكتب الفترة وحجم العينة بجانب الرقم", "Write the period and sample size next to the number")),
       L(("رسم الأساس ونقاطه وتاريخ تثبيته", "The baseline chart, its points and the date it was fixed"),),
       L(("أساس بلا فترة ولا عينة", "A baseline with no period and no sample"),),
       B("مالك البيانات", "Data owner"), B("نسبة المشاريع بأساس مكتمل", "Share of projects with a complete baseline")),
    IT("9.1.3", "AN1", B("إثبات الأسباب بالبيانات", "Proving causes with data"),
       R(IS, "تحلل المنشأة البيانات والمعلومات الناتجة عن الرصد والقياس وتقيّمها، وتستخدم النتائج لتقييم المطابقة ورضا العملاء وأداء النظام وفعالية الإجراءات والحاجة إلى التحسين. وتقول ملاحظة البند إن طرق تحليل البيانات قد تشمل تقنيات إحصائية. وفي المشروع يُثبت السبب أو يُستبعد بمقارنة مجموعتين (نسبتين أو متوسطين)، أو باريتو مقسّم، أو قبل وبعد، أو تحليل مرتبط؛ والتصويت لا يثبت سبباً.",
         "the organization analyses and evaluates the data and information from monitoring and measurement, and uses the results to evaluate conformity, customer satisfaction, the system's performance, the effectiveness of actions and the need for improvement. The note to the clause says methods to analyse data can include statistical techniques. In the project a cause is proved or ruled out by comparing two groups (two rates or two means), a stratified Pareto, a before/after or a linked analysis; a vote proves nothing."),
       R(EX, "دون ماء مبرد رُفضت 18 من 229 شحنة (7.9%)، وبماء مبرد 2 من 106 (1.9%): فرق 6 نقاط، و|z| = 2.15، فأُثبت السبب. وانتظار الشاحنات عند البوابة: 5.9% مقابل 6.0%، فاستُبعد.",
         "without chilled water 18 of 229 loads were rejected (7.9%), with chilled water 2 of 106 (1.9%): a 6-point difference and |z| = 2.15, so the cause was proved. Gate waiting time: 5.9% against 6.0%, so it was ruled out."),
       L(("اكتب لكل سبب مقارنة البيانات التي تثبته أو تستبعده", "Write for each cause the data comparison that proves or rules it out"), ("استخدم أبسط أداة تكفي للقرار", "Use the simplest tool that is enough for the decision")),
       L(("فحص البيانات لكل سبب ونتيجته", "The data check for each cause and its result"),),
       L(("سبب «مثبت» بالإجماع", "A cause “proved” by consensus"), ("«الخطأ البشري» سبباً", "“Human error” as the cause")),
       B("قائد المشروع", "Project lead"), B("نسبة الأسباب المثبتة بالبيانات", "Share of causes proved with data")),
    IT("4.2.7", "x:tools", B("ISO 9000:2026 · 4.2.7 القرار المبني على الدليل", "ISO 9000:2026 · 4.2.7 Evidence-based decision-making"),
       R(IS, "القرارات المبنية على تحليل البيانات والمعلومات وتقييمها أرجح أن تحقق النتائج المرجوة. والمهم فهم علاقات السبب والنتيجة والعواقب غير المقصودة، والوقائع والأدلة وتحليل البيانات تعطي القرار موضوعية وثقة. ومن الإجراءات الممكنة: التأكد من أن البيانات دقيقة وموثوقة بما يكفي، وتحليلها بطرق مناسبة، واتخاذ القرار على الدليل مع الخبرة والحدس.",
         "decisions based on the analysis and evaluation of data and information are more likely to produce the desired results. What matters is understanding cause and effect and unintended consequences; facts, evidence and data analysis give decisions objectivity and confidence. Possible actions include making sure data are accurate and reliable enough, analysing them with suitable methods, and deciding on evidence balanced with experience and intuition."),
       R(EX, "اقترح الفريق أن الفريق الجديد سبب إعادة العمل؛ قارنت البيانات 7.3% بـ 7.0% (|z| = 0.66)، فاستُبعد ولم يُتخذ قرار تدريب لا يغيّر النتيجة.",
         "the team suggested the new crew caused the rework; the data compared 7.3% with 7.0% (|z| = 0.66), so it was ruled out and no training decision was taken that would not change the result."),
       L(("اعرض البيانات قبل الرأي في كل بوابة", "Show the data before opinions at every gate"),),
       L(("القرارات المسجلة في البوابات بأدلتها", "The decisions recorded at the gates with their evidence"),),
       L(("قرار يُتخذ ثم تُبحث له بيانات", "A decision taken first, with data found for it later"),),
       B("الراعي", "Sponsor"), B("نسبة القرارات المسندة ببيانات", "Share of decisions backed by data"))
  ]})

S.append({"id": "8.5", "grp": "core", "ph": "control", "col": "#C9821A", "tint": "#FCF1DE",
  "t": B("البند 8.5 الإنتاج وتقديم الخدمة", "Clause 8.5 Production and service provision"),
  "s": B("التحسين والضبط", "Improve and Control"), "sh": B("8.5 · الضبط", "8.5 · Control"),
  "p": B("الحل يُجرَّب على نطاق صغير وتُفحص مخاطر تغييره قبل التعميم، ثم تحفظ خطة الضبط النتيجة في ظروف مضبوطة: ما يُقاس، وكم مرة، ومن يقيس، وما رد الفعل عند الانحراف.",
         "A solution is piloted on a small scale and the risks of the change are checked before the roll-out; then the control plan holds the result under controlled conditions: what is measured, how often, by whom, and the reaction when it drifts."),
  "fl": L(("التجربة", "Pilot"), ("المخاطر", "Risks"), ("الضبط", "Control"), ("رد الفعل", "Reaction")),
  "it": [
    IT("8.5.6", "IM1", B("الحلول تُجرَّب، ومخاطر التغيير تُفحص", "Solutions are piloted, and the risks of the change checked"),
       R(IS, "تراجع المنشأة التغييرات في الإنتاج أو تقديم الخدمة وتضبطها بالقدر اللازم لاستمرار المطابقة للمتطلبات، وتحتفظ بمعلومات موثقة بنتائج المراجعة، ومن اعتمد التغيير، وأي إجراءات لازمة. وفي المشروع: كل حل مرتبط بسبب مثبت، ويُجرَّب في مكان واحد لفترة محددة وتُقارن نتيجته بالهدف، وتُكتب مخاطر التغيير وضبطها، ثم يُقرر التعميم.",
         "the organization reviews and controls changes for production or service provision to the extent needed for continuing conformity to requirements, and keeps documented information on the results of the review, who authorized the change and any actions needed. In the project: each solution is tied to a proved cause, piloted in one place over a stated period with its result compared with the goal, the risks of the change and their control written, and then the roll-out decided."),
       R(EX, "تجربة الماء المبرد وفحص الحرارة في المحطة 2 من 7 إلى 13 سبتمبر: شحنة واحدة مرفوضة من 52 (1.9%) مقابل هدف أقل من 3%؛ المخاطرة سعة المبرد، والضبط فحص يومي وخط تبريد ثانٍ.",
         "the chilled-water and plant-temperature pilot at plant 2 from 7 to 13 September: 1 of 52 loads rejected (1.9%) against a goal below 3%; the risk was chiller capacity, the control a daily check and a second chiller line."),
       L(("جرّب في مكان واحد قبل الكل", "Pilot in one place before all of them"), ("اكتب ما قد يفشل عند التعميم وكيف تمنعه", "Write what may fail at the roll-out and how to prevent it")),
       L(("نتيجة التجربة وقرار التعميم ومن اعتمده", "The pilot result, the roll-out decision and who authorized it"),),
       L(("حل يُعمَّم دون تجربة", "A solution rolled out with no pilot"), ("حل لا يرتبط بسبب مثبت", "A solution tied to no proved cause")),
       B("الراعي", "Sponsor"), B("نسبة الحلول المجرّبة قبل التعميم", "Share of solutions piloted before the roll-out")),
    IT("8.5.1", "CT1", B("خطة الضبط برد فعل عند الانحراف", "A control plan with a reaction when it drifts"),
       R(IS, "تنفذ المنشأة الإنتاج وتقديم الخدمة في ظروف مضبوطة تشمل، حيث ينطبق: معلومات موثقة بالخصائص والأنشطة والنتائج المطلوبة، وموارد رصد وقياس مناسبة، وتنفيذ الرصد والقياس في المراحل المناسبة للتحقق من معايير الضبط والقبول، وبنية تحتية وبيئة مناسبتين، وأشخاصاً أكفاء، والتحقق من قدرة العمليات حين لا يمكن التحقق من الناتج لاحقاً، وإجراءات تمنع الخطأ البشري، وأنشطة الإفراج والتسليم. وخطة الضبط في المشروع هي الصورة العملية لهذه الظروف: المقياس، والمستهدف، والتكرار، والمسؤول، ورد الفعل.",
         "the organization carries out production and service provision under controlled conditions that include, as applicable: documented information on the characteristics, activities and results required; suitable monitoring and measuring resources; monitoring and measurement at appropriate stages to verify control and acceptance criteria; suitable infrastructure and environment; competent persons; validation of process capability where the output cannot be verified later; actions to prevent human error; and release and delivery activities. The project's control plan is the practical form of these conditions: the measure, the target, the frequency, the owner and the reaction."),
       R(EX, "«الشحنات المرفوضة أسبوعياً، أقل من 3%، مهندس الجودة؛ أسبوعان متتاليان عند 3% أو أكثر: اتصال بجودة المورد ومراجعة سجل المبرد، وسجل CAPA إن تكرر».",
         "“rejected loads weekly, below 3%, the quality engineer; two weeks in a row at 3% or more: call the supplier's QA and check the chiller log, and a CAPA record if it happens again”."),
       L(("اكتب رد فعل محدداً لكل مقياس", "Write a specific reaction for each measure"), ("ضع إجراءً يمنع الخطأ البشري بدل اللوم", "Put in an action that prevents human error instead of blame")),
       L(("خطة الضبط بمسؤوليها وتكرارها", "The control plan with its owners and frequency"),),
       L(("خطة ضبط بلا رد فعل", "A control plan with no reaction"), ("مقياس بلا مسؤول", "A measure with no owner")),
       B("مالك العملية", "Process owner"), B("نسبة أسطر خطة الضبط المكتملة", "Share of complete control plan lines"))
  ]})

S.append({"id": "10.2", "grp": "core", "ph": "control", "col": "#1E8C93", "tint": "#E3F4F4",
  "t": B("البند 10.2 عدم المطابقة والإجراء التصحيحي", "Clause 10.2 Nonconformity and corrective action"),
  "s": B("الأسباب والنتيجة والتوحيد", "Causes, result and standardisation"), "sh": B("10.2 · الفعالية", "10.2 · Effectiveness"),
  "p": B("عندما يتعلق المشروع بحالة عدم مطابقة: تُحدد أسبابها، ثم تُراجع فعالية الإجراء بالمقياس نفسه بعد التغيير، ويُعدَّل النظام بما وُحّد.",
         "When the project concerns a nonconformity: its causes are determined, then the effectiveness of the action is reviewed on the same measure after the change, and the system is changed by what is standardised."),
  "fl": L(("الأسباب", "Causes"), ("الفعالية", "Effectiveness"), ("التوحيد", "Standardise")),
  "it": [
    IT("10.2.1 b 2", "x:tools", B("تحديد أسباب عدم المطابقة", "Determining the causes of the nonconformity"),
       R(IS, "عند وقوع عدم مطابقة تقيّم المنشأة الحاجة إلى إجراء يزيل أسبابها حتى لا تتكرر، ومن ذلك تحديد أسبابها (10.2.1 ب) 2)). ومرحلة التحليل في DMAIC طريقة منظمة لذلك بالبيانات، والإجراءات التصحيحية نفسها ومتابعتها تبقى في سجل CAPA الذي يذكره المشروع.",
         "when a nonconformity occurs the organization evaluates the need for action to remove its causes so it does not recur, including determining its causes (10.2.1 b) 2)). The Analyse phase of DMAIC is a structured way to do that with data; the corrective actions themselves and their follow-up stay in the CAPA record the project names."),
       R(EX, "مشروع الخرسانة يذكر سجل CAPA ‏CA-EX-04، ويأخذ من تحقيق RC-EX-01 سبب غياب فحص الحرارة في المحطة مثبتاً بالتحليل المرتبط.",
         "the concrete project names CAPA record CA-EX-04, and takes from investigation RC-EX-01 the missing plant temperature check, proved by the linked analysis."),
       L(("اذكر رقم سجل CAPA في بيانات المشروع", "Name the CAPA record in the project header"),),
       L(("ربط المشروع بسجل CAPA", "The link between the project and the CAPA record"),),
       L(("إجراءات تصحيحية خارج سجل CAPA لا يتابعها أحد", "Corrective actions outside the CAPA record that nobody follows"),),
       B("مهندس الجودة", "Quality engineer"), B("نسبة المشاريع المرتبطة بسجل CAPA عند عدم المطابقة", "Share of projects linked to a CAPA record when a nonconformity is involved")),
    IT("10.2.1 d", "CT2", B("النتيجة بعد التغيير مقابل الهدف", "The result after the change against the goal"),
       R(IS, "تراجع المنشأة فعالية أي إجراء تصحيحي اتُّخذ (10.2.1 د)). وفي المشروع: يُقاس المقياس نفسه بالتعريف التشغيلي نفسه بعد التغيير لفترة محددة، ويُرسم رسماً تشغيلياً مع وسيط الأساس، وتُقارن النتيجة بالهدف: تحقق، أو تحقق جزئياً، أو لم يتحقق.",
         "the organization reviews the effectiveness of any corrective action taken (10.2.1 d)). In the project: the same measure, on the same operational definition, is measured after the change over a stated period, drawn as a run chart with the baseline median, and the result compared with the goal: met, partly met or not met."),
       R(EX, "بعد التغيير (14 سبتمبر إلى 11 أكتوبر): 4 شحنات مرفوضة من 164 (2.4%) مقابل هدف أقل من 3%: تحقق الهدف.",
         "after the change (14 September to 11 October): 4 of 164 loads rejected (2.4%) against a goal below 3%: goal met."),
       L(("قِس بالطريقة نفسها التي قيس بها الأساس", "Measure the same way the baseline was measured"), ("اقرأ الرسم التشغيلي قبل إعلان النجاح", "Read the run chart before calling it a success")),
       L(("رسم ما بعد التغيير ونتيجته مقابل الهدف", "The after-change chart and its result against the goal"),),
       L(("نجاح يُعلن بمقياس آخر", "Success declared on another measure"), ("فترة قصيرة لا تكفي للحكم", "A period too short to judge")),
       B("الراعي", "Sponsor"), B("نسبة المشاريع التي تحقق هدفها بعد التغيير", "Share of projects meeting their goal after the change")),
    IT("10.2.1 f", "CT3", B("التوحيد والتسليم لمالك العملية", "Standardise and hand over to the process owner"),
       R(IS, "تُجري المنشأة تغييرات على نظام الجودة عند الحاجة (10.2.1 و)). وفي المشروع: ما نجح يدخل النظام (إجراء، نموذج، عقد، تدريب)، ويُسلَّم المشروع لمالك العملية بتاريخ ومعه خطة الضبط، وما بقي مفتوحاً ينتقل إلى دورة PDCA أو مشروع تالٍ.",
         "the organization makes changes to the quality system if necessary (10.2.1 f)). In the project: what worked goes into the system (a procedure, a form, a contract, training), the project is handed over to the process owner on a date with the control plan, and what is left open moves to a PDCA cycle or a next project."),
       R(EX, "مشروع المعايرة: السجل الموحد ومذكرة النقل في الإجراء QP-12 الإصدار 4، وسُلّم لمدير المعدات في 13 أكتوبر، وبقيت الأجهزة المستأجرة في دورة PD-EX-02.",
         "the calibration project: the unified register and the transfer note in procedure QP-12 rev 4, handed over to the equipment manager on 13 October, with rented devices left in cycle PD-EX-02."),
       L(("سلّم المشروع في اجتماع قصير مع مالك العملية", "Hand the project over in a short meeting with the process owner"), ("حدّث الوثائق قبل إغلاق المشروع", "Update the documents before the project closes")),
       L(("الوثائق المعدلة وتاريخ التسليم", "The revised documents and the hand-over date"),),
       L(("مشروع يُغلق ولا يملك أحد نتيجته", "A project that closes with nobody owning its result"),),
       B("مالك العملية", "Process owner"), B("نسبة المشاريع المسلَّمة بتاريخ", "Share of projects handed over on a date")),
    IT("A.10.2", "x:tools", B("حجم التحقيق والطرق بحسب السياق", "The extent of investigation and the methods by context"),
       R(IS, "يوضح الملحق A.10.2 أن المنشأة تحدد طريقة معالجة عدم المطابقة، ومنها مدى التحقيق والطرق المستخدمة، بحسب سياقها واحتياجاتها، وتنظر في خطر التكرار والأثر ومتطلبات العملاء والأطراف المعنية. فمشروع DMAIC واحد من الطرق، يُختار حين يبرر حجم المشكلة وغموض سببها جهده.",
         "Annex A.10.2 explains that the organization decides how to address nonconformities, including the extent of investigation and the methods used, based on its context and needs, and considers the risk of recurrence, the impact and the requirements of customers and interested parties. A DMAIC project is one of these methods, chosen when the size of the problem and the uncertainty of its cause justify the effort."),
       R(EX, "رفض الخرسانة المتكرر (38,000 ريال في شهرين) برر مشروع DMAIC؛ أما مخطط ملغى واحد في موقع فكفاه لماذا الخمس وسجل CAPA.",
         "repeated concrete rejections (SAR 38,000 in two months) justified a DMAIC project; a single superseded drawing on one site needed only a 5 Whys and a CAPA record."),
       L(("اختر الطريقة بحسب الخطر والأثر", "Choose the method by risk and impact"),),
       L(("سبب اختيار DMAIC في الميثاق", "The reason for choosing DMAIC in the charter"),),
       L(("DMAIC لكل مشكلة صغيرة", "A DMAIC for every small problem"),),
       B("مدير الجودة", "Quality manager"), B("نسبة المشاريع التي برر حجمها المنهج", "Share of projects whose size justified the method"))
  ]})

S.append({"id": "10.1", "grp": "core", "ph": "learn", "col": "#3C9A5F", "tint": "#E5F4EA",
  "t": B("البند 10.1 التحسين المستمر", "Clause 10.1 Continual improvement"),
  "s": B("التحسين المستمر", "Continual improvement"), "sh": B("10.1 · التحسين", "10.1 · Improvement"),
  "p": B("مشاريع DMAIC جزء من التحسين المستمر: تُختار من نتائج التحليل ومراجعة الإدارة، وتُراجع معاً لاكتشاف الأنماط.",
         "DMAIC projects are part of continual improvement: they are chosen from analysis results and management review, and reviewed together to find patterns."),
  "fl": L(("النتائج", "Results"), ("الفرص", "Opportunities"), ("المشاريع", "Projects")),
  "it": [
    IT("10.1", "x:tools", B("مشاريع تُختار من النتائج", "Projects chosen from the results"),
       R(IS, "تحسّن المنشأة باستمرار ملاءمة نظام الجودة وكفايته وفعاليته، وتنظر في نتائج الرصد والقياس والتحليل والتقييم ونتائج مراجعة الإدارة لتحديد الفرص وتعالجها. ومن الإجراءات تحسين العمليات والمنتجات والخدمات، ومعالجة الاحتياجات المستقبلية، وتصحيح الآثار غير المرغوبة أو منعها أو تقليلها. وتذكر ملاحظة البند أن التحسين قد يكون تدريجياً أو اختراقياً.",
         "the organization continually improves the suitability, adequacy and effectiveness of the quality system, and considers the results of monitoring, measurement, analysis and evaluation and of management review to determine and address opportunities. Actions include improving processes, products and services, addressing future needs, and correcting, preventing or reducing undesired effects. The note to the clause says improvement can be incremental or a breakthrough."),
       R(EX, "مشروع القوالب اختير من باريتو تكلفة الجودة الرديئة PA-EX-03، حيث كانت إعادة العمل ثاني أكبر فئة (214,000 ريال).",
         "the formwork project was chosen from the cost-of-poor-quality Pareto PA-EX-03, where rework was the second largest category (SAR 214,000)."),
       L(("اختر المشاريع من باريتو ومراجعة الإدارة", "Choose projects from Pareto and management review"),),
       L(("قائمة المشاريع ومصادرها في مراجعة الإدارة", "The list of projects and their sources in management review"),),
       L(("مشاريع تُختار بالحماس لا بالبيانات", "Projects chosen by enthusiasm, not data"),),
       B("مدير الجودة", "Quality manager"), B("نسبة المشاريع المختارة من البيانات", "Share of projects chosen from data")),
    IT("4.2.6", "x:tools", B("ISO 9000:2026 · 4.2.6 التحسين", "ISO 9000:2026 · 4.2.6 Improvement"),
       R(IS, "تركز المنشآت الناجحة على التحسين باستمرار. ومن فوائده المذكورة: تعزيز التركيز على البحث في السبب الجذري وتحديده ثم الإجراءات الوقائية والتصحيحية، والنظر في التحسين التدريجي والاختراقي. ومن الإجراءات الممكنة: تعليم الناس أدوات التحسين ومناهجه الأساسية، ونشر عمليات لتنفيذ مشاريع التحسين، وتتبع تخطيط إجراءات التحسين وتنفيذها وإكمالها ونتائجها ومراجعتها وتدقيقها.",
         "successful organizations have an ongoing focus on improvement. Benefits named include a stronger focus on root cause investigation and determination followed by prevention and corrective actions, and considering both incremental and breakthrough improvement. Possible actions include teaching people the basic tools and methods of improvement, deploying processes to run improvement projects, and tracking, reviewing and auditing the planning, implementation, completion and results of improvement actions."),
       R(EX, "لوحة مؤشرات الأداة تتبع المشاريع ومراحلها وبواباتها ونتائجها، وتدقيقها الآلي يراجع كل مشروع.",
         "the tool's dashboard tracks projects, their phases, gates and results, and its automatic audit reviews each project."),
       L(("درّب قادة المشاريع على الأدوات البسيطة أولاً", "Train project leads on the simple tools first"),),
       L(("سجل المشاريع ونتائجها", "The register of projects and their results"),),
       L(("مشاريع لا يتابع أحد نتائجها", "Projects whose results nobody follows"),),
       B("مدير الجودة", "Quality manager"), B("عدد المشاريع المغلقة بالتسليم", "Projects closed with the hand-over"))
  ]})

S.append({"id": "7.1.6", "grp": "core", "ph": "learn", "col": "#1B2A4A", "tint": "#E8ECF4",
  "t": B("البند 7.1.6 المعرفة التنظيمية", "Clause 7.1.6 Organizational knowledge"),
  "s": B("الدروس والفجوات الشائعة", "Lessons and common gaps"), "sh": B("7.1.6 · المعرفة", "7.1.6 · Knowledge"),
  "p": B("ما تعلمه المشروع عن العملية يُحفظ ويُشارك: لماذا يحدث العيب، وما الذي يمنعه، وكيف يُقاس.", "What the project learnt about the process is kept and shared: why the defect happens, what prevents it and how it is measured."),
  "fl": L(("الحفظ", "Retain"), ("المشاركة", "Share"), ("التطبيق", "Apply")),
  "it": [
    IT("7.1.6", "x:tools", B("احفظ ما تعلمه المشروع وشاركه", "Keep and share what the project learnt"),
       R(IS, "تحدد المنشأة المعرفة اللازمة لتشغيل عملياتها وتحقيق نتائج نظام الجودة، وتحتفظ بها وتطبقها وتشاركها بالقدر اللازم. ومن أشكالها المعرفة المبنية على الخبرة، والمعرفة المضمّنة في الطرق والعمليات، والمعرفة الممثّلة في المعلومات الموثقة والأنظمة الرقمية.",
         "the organization determines the knowledge needed to operate its processes and achieve quality system results, and retains, applies and shares it to the extent necessary. Its forms include experience-based knowledge, knowledge built into methods and processes, and knowledge held in documented information and digital systems."),
       R(EX, "دليل ترميز إعادة العمل صار جزءاً من تعليمات سجلات الدوام في كل المشاريع، لا في مشروع القوالب فقط.",
         "the rework coding guide became part of the timesheet instructions on every project, not only the formwork project."),
       L(("اعرض المشروع في عشر دقائق على الفرق الأخرى", "Present the project in ten minutes to other teams"), ("ضع الدرس في الطريقة نفسها", "Put the lesson into the method itself")),
       L(("سجل المشاريع المشاركة ودروسها", "The register of shared projects and their lessons"),),
       L(("تقرير مشروع في ملف لا يفتحه أحد", "A project report in a file nobody opens"),),
       B("مدير الجودة", "Quality manager"), B("نسبة المشاريع التي شوركت دروسها", "Share of projects whose lessons were shared")),
    IT("GD-7", "x:tools", B("الفجوات الشائعة وما يطلبه المدقق", "Common gaps and what an auditor asks for"),
       R(GD, "أكثر ما يضعف مشروع DMAIC: البدء بحل معروف، وهدف يُكتب بعد التحليل أو يتحرك، وأساس من بيانات لم يُتحقق منها، وأسباب «مثبتة» بالتصويت، و«الخطأ البشري» سبباً، وحلول تُعمَّم دون تجربة، ونتيجة بمقياس آخر، ومشروع يُغلق دون تسليم، وبوابات بالتوقيع فقط. ويطلب المدقق عادةً: الميثاق والهدف وتاريخه، ونتيجة التحقق من القياس قبل الأساس، والبيانات التي أثبتت كل سبب، ونتيجة التجربة، وخطة الضبط ورد فعلها، والنتيجة بعد التغيير بالمقياس نفسه، والوثائق المعدلة، وسجل البوابات. الأداة تفحص هذا آلياً في تبويب التدقيق.",
         "what weakens a DMAIC project most: starting from a known solution, a goal written after the analysis or moved, a baseline from data never checked, causes “proved” by vote, “human error” as a cause, solutions rolled out with no pilot, a result on another measure, a project closed with no hand-over, and gates by signature only. An auditor usually asks for: the charter, the goal and its date, the measurement check before the baseline, the data that proved each cause, the pilot result, the control plan and its reaction, the result after the change on the same measure, the revised documents and the gate record. The tool checks this automatically in the Audit tab."),
       R(EX, "التدقيق الآلي على مشروع القوالب: كل الفحوص ناجحة حتى الأساس، وفحص «سبب مثبت بالبيانات» ما زال ثغرة لأن المشروع في التحليل.",
         "the automatic audit on the formwork project: every check passes up to the baseline, and “a cause proved with data” is still a gap because the project is in Analyse."),
       L(("راجع تبويب التدقيق قبل كل بوابة", "Check the Audit tab before each gate"),),
       L(("نتيجة التدقيق الآلي لكل مشروع", "The automatic audit result for each project"),),
       L(("مشروع جميل العرض بلا بيانات", "A project with good slides and no data"),),
       B("المدقق الداخلي", "Internal auditor"), B("نسبة الفحوص الناجحة", "Audit pass rate"))
  ]})

# a section whose id is also an item code opens on that item, so the item that carries the section's number comes first
for sec in S:
    sec["it"].sort(key=lambda x: 0 if x["c"] == sec["id"] else 1)

legend = [[p["c"], p["n"]] for p in phases.values()]

DATA = {
    "meta": meta, "std": std, "texts": texts, "phases": phases, "flags": {}, "legend": legend,
    "diagram": {"type": "cycle", "centre": B("DMAIC", "DMAIC")},
    "matrix": {"tab": "", "d": B("", ""), "btn": B("", "")},
    "sections": S, "paths": [],
    "edges": [["0.3.2", "GD-1"], ["GD-1", "GD-2"], ["GD-1", "6.2.1"], ["6.2.1", "GD-3"], ["GD-3", "GD-4"], ["6.2.1", "GD-5"], ["6.2.1", "6.2.2"],
              ["GD-5", "GD-6"], ["GD-6", "7.1.5.1"], ["7.1.5.1", "7.1.5.2"], ["7.1.5.1", "9.1.1"], ["9.1.1", "9.1.3"], ["4.2.7", "9.1.3"],
              ["9.1.3", "10.2.1 b 2"], ["9.1.3", "8.5.6"], ["8.5.6", "8.5.1"], ["8.5.1", "10.2.1 d"], ["10.2.1 d", "10.2.1 f"], ["A.10.2", "10.2.1 b 2"],
              ["10.2.1 f", "10.1"], ["10.1", "4.2.6"], ["10.1", "7.1.6"], ["7.1.6", "GD-7"], ["GD-2", "GD-7"]],
    "changes": {"note": B("", ""), "tlT": B("", ""), "tlS": B("", ""), "tlCols": 4, "tl": [], "cardsT": B("", ""), "cardsS": B("", ""), "cards": [],
                "corr": {"t": B("", ""), "s": B("", ""), "h": [], "rows": []}, "steps": {"t": B("", ""), "s": B("", ""), "l": B("", "")}},
    "ui": {
        "ar": {"roles": "من يعمل في مشروع DMAIC", "wheelT": "عجلة البنود", "purpose": "الغرض من الأداة", "smap": "خطوات مشروع DMAIC",
               "smapSub": "كل خطوة في سطر. اضغط «اشرح» لفتح البند أو القاعدة التي تخدمها.", "rel": "علاقتها بأدوات المنصة", "comp": "المراجع المساندة",
               "assess": "قيّم هذا في التقييم الذاتي", "assessC": "قيّم هذا في التقييم الذاتي",
               "assessOff": "هذا البند خارج أسئلة التقييم الذاتي، ويُطبَّق مباشرة في مشروع DMAIC.", "offGo": "افتح مشروع DMAIC",
               "actCtx": "يفتح السؤال {s}", "explainA": "اشرح {c} في دليل البنود"},
        "en": {"roles": "Who works on a DMAIC project", "wheelT": "Clause wheel", "purpose": "What the tool is for", "smap": "Steps of a DMAIC project",
               "smapSub": "One line per step. Select “Explain” to open the clause or rule it serves.", "rel": "How it connects to the platform's tools", "comp": "Supporting references",
               "assess": "Assess this in the self-assessment", "assessC": "Assess this in the self-assessment",
               "assessOff": "This clause is outside the self-assessment questions; it is applied directly in the DMAIC project.", "offGo": "Open the DMAIC project",
               "actCtx": "Opens question {s}", "explainA": "Explain {c} in the clause guide"}
    }
}

if __name__ == "__main__":
    js = ("/* DMAIC explanation data for the CIA Explain Kit v1.4. DMAIC is an improvement method, not a clause of any standard.\n"
          "   Clause numbers and titles checked on 2026-10-16 against the uploaded ISO 9001:2026 and ISO 9000:2026 texts.\n"
          "   Requirements are interpretive summaries, not the official text; Six Sigma references, ISO 13053, ISO 7870 and ISO 10017 are not uploaded (\"not verified\"). */\n"
          "const EXPLAIN_DMAIC=" + json.dumps(DATA, ensure_ascii=False, indent=1) + ";\n")
    sys.stdout.write(js)
