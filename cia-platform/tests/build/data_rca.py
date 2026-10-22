"""EXPLAIN_RCA — data for the CIA Explain Kit v1.4 in modules/rca.html (build step 2026-10-15, Root Cause Analysis).
Root cause analysis is a discipline that combines methods, not a clause of any standard. The clause guide is built on the
ISO 9001:2026 clauses the investigation serves. Clause numbers and titles checked on 2026-10-15 against the uploaded official
texts only:
  ISO 9001:2026 (ISO_9001_2026en 1.pdf) — 6.1.2 Actions to address risks (actions proportionate to the potential impact),
                                           7.1.6 Organizational knowledge, 7.2 Competence (a)–c)), 8.5.1 Control of production
                                           and service provision g) actions to prevent human error, 9.1.3 Analysis and evaluation
                                           (and its NOTE on statistical techniques), 10.1 Continual improvement (c) correcting,
                                           preventing or reducing undesired effects), 10.2.1 a), b) 1)–3), c)–f) and the sentence
                                           "Corrective actions shall be appropriate to the effects of the nonconformities
                                           encountered", 10.2.2 a)–b), Annex A.10.2 (extent of investigation and methods)
  ISO 9000:2026 (ISO 9000-2026.pdf; scanned, read by OCR)
                                         — 3.5.13 nonconformity, 3.6.2 preventive action (Note 1: more than one cause),
                                           3.6.4 corrective action ("cause(s)"), 3.8.6 objective evidence (Note 1: observation,
                                           measurement, test or other means), 4.2.6 Improvement (4.2.6.3 key benefits: "root cause
                                           investigation and determination"), 4.2.7 Evidence-based decision-making (4.2.7.2 cause
                                           and effect relationships, 4.2.7.4 possible actions). ISO 9000:2026 does not define "root
                                           cause" as a term.
  ISO 19011:2026 (ISO 19011 2026 Standard.pdf) — 6.7 Conducting the audit follow-up (completion and effectiveness of actions
                                           verified)
Not uploaded, so "not verified": ISO 10009 and ISO 10017 (named only in ISO 9001:2026 A.9.1 notes 3 and 4) and any root cause
analysis standard such as IEC 62740.
No text of a standard is reproduced: every "requirement" is an interpretive summary in independent wording.
Items coded GD-n are the author's practical guidance on the method, not clauses. Usage: python3 data_rca.py > explain_rca.js"""
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
    "code": "RCA",
    "name": B("تحليل السبب الجذري — التحقيق", "Root Cause Analysis — Investigation"),
    "edition": B("أداة منهجية تخدم ISO 9001:2026 البند 10.2.1 ب) والملحق A.10.2", "Method tool serving ISO 9001:2026 clause 10.2.1 b) and Annex A.10.2"),
    "status": B("الأداة السادسة في صندوق أدوات التحسين المستمر", "Sixth tool in the Continual Improvement Toolbox"),
    "cert": False,
    "certNote": B("تحليل السبب الجذري منهجية تجمع عدة طرق، وليس مواصفة ولا بنداً. المتطلبات التي يخدمها هي تحديد أسباب عدم المطابقة والتحقق من الحالات المشابهة في البند 10.2.1 ب) من ISO 9001:2026، وأن تكون الإجراءات التصحيحية مناسبة لآثار عدم المطابقة، ويترك الملحق A.10.2 مدى التحقيق والطرق للمنشأة. ولا تعرّف ISO 9000:2026 «السبب الجذري» مصطلحاً.",
                  "Root cause analysis is a discipline that combines methods, not a standard or a clause. The requirements it serves are determining the causes of nonconformities and checking for similar ones in ISO 9001:2026 clause 10.2.1 b), and making corrective actions appropriate to the effects of the nonconformities; Annex A.10.2 leaves the extent of investigation and the methods to the organization. ISO 9000:2026 does not define “root cause” as a term."),
    "verified": B("2026-10-15، من الملفات الرسمية المرفوعة إلى المشروع: ISO_9001_2026en 1.pdf وISO 9000-2026.pdf (ملف ممسوح ضوئياً، قُرئ بالتعرف الضوئي على النص) وISO 19011 2026 Standard.pdf. كل «متطلب» ملخص تفسيري، وليس النص الرسمي. ISO 10009 وISO 10017 وأي مواصفة لتحليل السبب الجذري مثل IEC 62740 غير مرفوعة: «غير متحقق منه».",
                  "2026-10-15, against the official files uploaded to the project: ISO_9001_2026en 1.pdf, ISO 9000-2026.pdf (a scanned file, read with OCR) and ISO 19011 2026 Standard.pdf. Every “requirement” is an interpretive summary, not the official text. ISO 10009, ISO 10017 and any root cause analysis standard such as IEC 62740 are not uploaded: “not verified”.")
}

std = {
    "purpose": B("أن يتحول كل عدم مطابقة أو حادث مهم إلى سبب تستطيع المنشأة تغييره وأثبتت صحته، بعمق يناسب خطره، ثم يُبنى الإجراء التصحيحي على هذا السبب ويُقاس أثره بمعيار كُتب قبل التنفيذ.",
                 "To turn every significant nonconformity or incident into a cause the organization can change and has proved, at a depth that fits its risk, then build the corrective action on that cause and measure its effect against a criterion written before the action."),
    "who": B("مديرو الجودة والصحة والسلامة والبيئة، ومهندسو الجودة، ومحققو الحوادث، ومالكو العمليات، ومديرو المشاريع، والمدققون الداخليون، وكل من يملك سجل CAPA أو تقرير عدم مطابقة أو حادث.",
             "Quality and HSE managers, quality engineers, incident investigators, process owners, project managers, internal auditors, and anyone who owns a CAPA record, a nonconformity report or an incident."),
    "rolesSub": B("التحقيق لا ينجح بالطريقة وحدها؛ ينجح بمن يجمع الوقائع، ومن يعرف العمل، ومن يحكم على الدليل. هذا توزيع مقترح للأدوار.",
                  "An investigation does not succeed by method alone; it succeeds through who collects the facts, who knows the work and who judges the evidence. This is a suggested split of roles."),
    "roles": [
        {"n": B("قائد التحقيق", "Investigation lead"), "col": "#1B2A4A", "d": B("يكتب المشكلة من الوقائع، ويحدد العمق بالقاعدة، ويختار الطرق، ويمنع القفز إلى الحل قبل إثبات السبب.", "Writes the problem from facts, sets the depth by the rule, chooses the methods, and stops the jump to a solution before the cause is proved.")},
        {"n": B("من يؤدي العمل", "The people who do the work"), "col": "#C2410C", "d": B("يعرفون ما يحدث فعلاً، لا ما يقوله الإجراء. وجود واحد منهم على الأقل شرط في الأداة.", "They know what really happens, not what the procedure says. At least one of them is required in the tool.")},
        {"n": B("مالك البيانات والأدلة", "Data and evidence owner"), "col": "#3563C9", "d": B("يقدم السجلات والبيانات، ويحفظ الأدلة مع من يحتفظ بها وتاريخها.", "Provides the records and data, and keeps the evidence with who holds it and its date.")},
        {"n": B("مالك العملية", "Process owner"), "col": "#1E8C93", "d": B("يملك الإجراء على كل سبب جذري، وينقل الخطة بتواريخها إلى سجل CAPA.", "Owns the action on each root cause, and carries the plan with its dates into the CAPA record.")},
        {"n": B("المراجِع المستقل", "Independent reviewer"), "col": "#3C9A5F", "d": B("شخص من خارج الفريق يتأكد أن كل سبب جذري مثبت ومختبر، وأن معيار الفعالية كُتب قبل التنفيذ.", "Someone outside the team who checks that every root cause is proved and tested, and that the effectiveness criterion was written before the action.")},
        {"n": B("الإدارة العليا", "Top management"), "col": "#B8901E", "d": B("تحمي التحقيق من البحث عن مذنب، وتوفر الوقت والموارد بقدر الخطر.", "Protects the investigation from the search for someone to blame, and gives time and resources in line with the risk.")}
    ],
    "map": [
        {"no": "1", "t": B("اكتب المشكلة من الوقائع مع المتطلب", "Write the problem from facts, with the requirement"), "d": B("ماذا، وأين، ومتى، وكم، وأي متطلب لم يُستوفَ.", "What, where, when, how much, and which requirement was not met."), "go": "10.2.1 b 1"},
        {"no": "2", "t": B("حدّد العمق بالخطر", "Set the depth by risk"), "d": B("الخطورة واحتمال التكرار يحددان العمق بقاعدة مكتوبة.", "Severity and likelihood of recurrence set the depth by a written rule."), "go": "A.10.2"},
        {"no": "3", "t": B("اجمع الأحداث والأدلة", "Collect the events and the evidence"), "d": B("تسلسل زمني، ومصدر كل معلومة، وواقعة أم افتراض.", "A timeline, the source of each piece of information, fact or assumption."), "go": "GD-1"},
        {"no": "4", "t": B("ضمّ من يؤدي العمل", "Include the people who do the work"), "d": B("الفريق المناسب، ومنهم واحد على الأقل يؤدي العمل نفسه.", "The right team, including at least one person who does the work itself."), "go": "7.2"},
        {"no": "5", "t": B("اختر الطرق من الصندوق", "Choose the methods from the toolbox"), "d": B("باريتو لأين، وعظمة السمكة للرسم، ولماذا الخمس للحفر، والبيانات للإثبات.", "Pareto for where, Fishbone to map, 5 Whys to dig, data to prove."), "go": "GD-2"},
        {"no": "6", "t": B("افرز الأسباب إلى ثلاثة مستويات", "Sort the causes into three levels"), "d": B("مباشر، ومساهم، وجذري؛ وقد يكون للمشكلة أكثر من سبب جذري.", "Direct, contributing and root; a problem can have more than one root cause."), "go": "10.2.1 b 2"},
        {"no": "7", "t": B("لا تقبل «الخطأ البشري» سبباً جذرياً", "Do not accept “human error” as a root cause"), "d": B("اسأل ما الذي في العملية سمح به.", "Ask what in the process allowed it."), "go": "8.5.1 g"},
        {"no": "8", "t": B("اختبر كل سبب جذري وأثبته", "Test and prove every root cause"), "d": B("إذا أُزيل، هل تتوقف المشكلة أو تقل؟ ثم الدليل.", "If removed, does the problem stop or fall? Then the evidence."), "go": "GD-3"},
        {"no": "9", "t": B("ابحث عن الحالات المشابهة", "Look for similar cases"), "d": B("في المواقع والعمليات والمنتجات الأخرى.", "At other sites, in other processes and products."), "go": "10.2.1 b 3"},
        {"no": "10", "t": B("ابنِ الإجراء على السبب المؤكد", "Build the action on the confirmed cause"), "d": B("إجراء بمالك لكل سبب جذري، والخطة في CAPA.", "An action with an owner for each root cause, the plan in CAPA."), "go": "10.2.1 c"},
        {"no": "11", "t": B("اكتب معيار الفعالية قبل التنفيذ", "Write the effectiveness criterion before the action"), "d": B("ما يُقاس، وأين، ولأي مدة.", "What is measured, where and for how long."), "go": "10.2.1 d"},
        {"no": "12", "t": B("شارك الدرس", "Share the lesson"), "d": B("احفظه معرفةً للمنشأة، وانقله إلى الفرق الأخرى.", "Keep it as organizational knowledge and pass it to other teams."), "go": "7.1.6"}
    ],
    "rel": [
        {"code": "CAPA", "n": B("الإجراءات التصحيحية", "Corrective action"), "col": "#C2410C",
         "d": B("يبدأ التحقيق من سجل CAPA أو ينتهي إليه: السبب الجذري المؤكد يُنسخ إلى سجل CAPA من لوحة القراءة فيه، والخطة بتواريخها تبقى هناك؛ والقراءة في الاتجاهين دون كتابة في بيانات الأداة الأخرى.", "The investigation starts from a CAPA record or ends in one: the confirmed root cause is copied into the CAPA record from its read-only panel, and the plan with its dates stays there; both directions read only, with no writing into the other tool's data."), "tool": "./capa.html"},
        {"code": "Pareto", "n": B("باريتو — تحليل القلة الحيوية", "Pareto — vital few analysis"), "col": "#B8901E",
         "d": B("الفئة الحيوية تفتح تحقيقاً جديداً بقيمتها ونسبتها وفترتها، ويمكن أن يقيس تحقق قبل وبعد في باريتو معيار الفعالية.", "A vital-few category opens a new investigation with its value, share and period, and a before/after check in Pareto can measure the effectiveness criterion."), "tool": "./pareto.html"},
        {"code": "Fishbone", "n": B("عظمة السمكة — تحليل السبب والنتيجة", "Fishbone — cause and effect analysis"), "col": "#1E8C93",
         "d": B("عندما تتعدد مسارات الأسباب، ترسمها عظمة السمكة، ويُسجَّل رقم التحليل هنا مع معاينة لمرحلته وسببه الجذري.", "When the causes have several paths, Fishbone maps them, and the analysis id is recorded here with a preview of its stage and root cause."), "tool": "./fishbone.html"},
        {"code": "5 Whys", "n": B("لماذا الخمس — تحليل السبب الجذري", "5 Whys — root cause analysis"), "col": "#3563C9",
         "d": B("لمسار واحد واضح، تحفر سلسلة لماذا الخمس حتى سبب في النظام، ويُسجَّل رقمها هنا.", "For one clear path, a 5 Whys chain digs down to a cause in the system, and its id is recorded here."), "tool": "./five-whys.html"},
        {"code": "AUDIT", "n": B("مركز التدقيق والتحسين الذكي", "Smart audit & improvement center"), "col": "#C9821A",
         "d": B("ملاحظات التدقيق تنتقل إلى CAPA ومنه إلى التحقيق، ويتحقق المدقق في المتابعة من اكتمال الإجراءات وفعاليتها.", "Audit findings move to CAPA and from there to the investigation, and the auditor's follow-up verifies the completion and effectiveness of the actions."), "tool": "./smart-audit-improvement.html"}
    ],
    "comp": [
        {"code": "ISO 9001:2026 §10.2.1 b)", "n": B("تحديد الأسباب والحالات المشابهة", "Determining causes and similar cases"),
         "d": B("المتطلب الذي يخدمه التحقيق: مراجعة عدم المطابقة، وتحديد أسبابها، وتحديد ما إذا كانت حالات مشابهة موجودة أو قد تحدث.", "The requirement the investigation serves: reviewing the nonconformity, determining its causes, and determining whether similar ones exist or could occur.")},
        {"code": "ISO 9001:2026 Annex A.10.2", "n": B("مدى التحقيق والطرق", "Extent of investigation and methods"),
         "d": B("المنشأة تقرر مدى التحقيق والطرق بحسب سياقها، مع مراعاة خطر التكرار والأثر ومتطلبات العملاء والأطراف المعنية.", "The organization decides the extent of investigation and the methods by its context, considering risk of recurrence, impact and the requirements of customers and other interested parties.")},
        {"code": "ISO 9000:2026 §3.6.4 · §4.2.6", "n": B("الإجراء التصحيحي ومبدأ التحسين", "Corrective action and the improvement principle"),
         "d": B("الإجراء التصحيحي يزيل «سبب أو أسباب» عدم المطابقة؛ ومن فوائد مبدأ التحسين تركيز أكبر على التحقيق في السبب الجذري وتحديده. ولا يُعرَّف «السبب الجذري» مصطلحاً.", "Corrective action eliminates the “cause(s)” of a nonconformity; the improvement principle's benefits include an enhanced focus on root cause investigation and determination. “Root cause” is not defined as a term.")},
        {"code": "ISO 19011:2026 §6.7", "n": B("متابعة التدقيق", "Audit follow-up"),
         "d": B("يُتحقق من اكتمال الإجراءات وفعاليتها، وقد يكون ذلك جزءاً من تدقيق لاحق.", "The completion and effectiveness of the actions are verified, possibly as part of a later audit.")},
        {"code": "IEC 62740 · ISO 10009 · ISO 10017", "n": B("مواصفات الطرق والأدوات (غير متحقق منه)", "Method and tool standards (not verified)"),
         "d": B("هذه الوثائق غير مرفوعة إلى المشروع، فمحتواها «غير متحقق منه» هنا. ISO 10009 وISO 10017 تذكرهما ملاحظتا الملحق A.9.1 في ISO 9001:2026 فقط.", "These documents are not uploaded to the project, so their content is “not verified” here. ISO 10009 and ISO 10017 are only named in the notes of Annex A.9.1 of ISO 9001:2026.")}
    ],
    "buy": [],
    "buyNote": B("للنص الرسمي للمواصفات استخدم النسخ المنشورة من المنظمة الدولية للتوحيد القياسي، وليس هذه المنصة.",
                 "For the official text of the standards, use the copies published by the International Organization for Standardization, not this platform.")
}

texts = {
    "stdT": B("دليل المنهجية", "Method guide"),
    "stdS": B("كيف يُدار تحقيق صادق في السبب الجذري: المشكلة من الوقائع، والعمق بحسب الخطر، والأحداث والأدلة، واختيار الطرق، والأسباب الثلاثة، ورفض «الخطأ البشري» سبباً جذرياً، واختبار السبب وإثباته، والحالات المشابهة، والإجراء على السبب المؤكد، ومعيار الفعالية قبل التنفيذ.",
              "How to run an honest root cause investigation: the problem from facts, depth by risk, events and evidence, choosing the methods, the three levels of cause, refusing “human error” as a root cause, testing and proving the cause, similar cases, the action on the confirmed cause, and the effectiveness criterion before the action."),
    "clT": B("دليل البنود", "Clause guide"),
    "clS": B("البنود التي يخدمها التحقيق، بأرقامها في ISO 9001:2026، وأولها 10.2.1 ب) والملحق A.10.2. لكل بند ملخص تفسيري ومثال وما يطلبه المدقق. قواعد الطريقة مرقّمة GD وهي إرشاد لا بنود. الأمثلة توضيحية وليست بيانات حقيقية.",
             "The clauses the investigation serves, numbered as in ISO 9001:2026, starting with 10.2.1 b) and Annex A.10.2. Each one has an interpretive summary, an example and what the auditor asks for. The method's rules are coded GD: guidance, not clauses. Examples are illustrative, not real data."),
    "note": B("ما يرد تحت «المتطلب» ملخص تفسيري بصياغة مستقلة، وليس النص الرسمي للمواصفة. وما تحت «كيف تطبقه» و«الفجوات» إرشاد تطبيقي. أرقام البنود وعناوينها متحقق منها من النصوص الرسمية المرفوعة.",
              "Text under “requirement” is an interpretive summary in independent wording, not the official text of the standard. “How to implement” and “common gaps” are practical guidance. Clause numbers and titles were checked against the uploaded official texts."),
    "chgT": B("ما الذي تغيّر", "What changed"),
    "chgS": B("", "")
}

phases = {
    "frame": {"c": "#C2410C", "t": "#FDECE3", "n": B("المشكلة والعمق والوقائع", "Problem, depth and facts")},
    "cause": {"c": "#1B2A4A", "t": "#E8ECF4", "n": B("الأسباب وإثباتها", "Causes and proof")},
    "act": {"c": "#1E8C93", "t": "#E3F4F4", "n": B("الإجراء والفعالية", "Action and effectiveness")},
    "learn": {"c": "#3C9A5F", "t": "#E5F4EA", "n": B("المخاطر والتحسين والتعلّم", "Risk, improvement and learning")}
}

S = []

S.append({"id": "10.2", "grp": "core", "ph": "frame", "col": "#C2410C", "tint": "#FDECE3",
  "t": B("البند 10.2 عدم المطابقة والإجراء التصحيحي", "Clause 10.2 Nonconformity and corrective action"),
  "s": B("المشكلة والعمق والوقائع", "Problem, depth and facts"), "sh": B("10.2 · المشكلة", "10.2 · Problem"),
  "p": B("يبدأ التحقيق هنا: التفاعل مع عدم المطابقة، ثم مراجعتها وكتابتها من الوقائع، ثم اختيار مدى التحقيق بحسب الخطر كما يتركه الملحق A.10.2 للمنشأة، ثم جمع الأحداث والأدلة.",
         "The investigation starts here: reacting to the nonconformity, then reviewing it and writing it from facts, then choosing the extent of investigation by risk as Annex A.10.2 leaves it to the organization, then collecting the events and the evidence."),
  "fl": L(("التفاعل", "React"), ("المشكلة", "Problem"), ("العمق", "Depth"), ("الأحداث", "Timeline"), ("الأدلة", "Evidence")),
  "it": [
    IT("10.2.1 a", "x:tools", B("تفاعل مع عدم المطابقة قبل التحقيق", "React to the nonconformity before the investigation"),
       R(IS, "عندما يقع عدم المطابقة تتفاعل المنشأة معه، وبحسب ما ينطبق: تتخذ إجراء لضبطه وتصحيحه، وتتعامل مع عواقبه. هذا التفاعل لا يغني عن التحقيق في السبب، لكنه يسبقه ويُسجَّل في تسلسل الأحداث.",
         "when a nonconformity occurs the organization reacts to it and, as applicable, takes action to control and correct it and deals with the consequences. This reaction does not replace the investigation of the cause, but it comes first and is recorded in the timeline."),
       R(EX, "أُعيدت الشحنات المرفوضة إلى المورد وطُلبت بدائل، وفُحص الهبوط والحرارة في كل شحنة قبل التفريغ، ثم بدأ التحقيق.",
         "the rejected loads were returned to the supplier and replacements ordered, slump and temperature were checked on every load before unloading, and then the investigation started."),
       L(("سجّل التصحيح والاحتواء بتاريخهما في الأحداث", "Record the correction and containment with their dates in the timeline"), ("لا تعامل التصحيح على أنه إجراء تصحيحي", "Do not treat the correction as a corrective action")),
       L(("سجل التصحيح والاحتواء في CAPA", "The correction and containment record in CAPA"),),
       L(("تحقيق يبدأ قبل احتواء الخطر", "An investigation that starts before the risk is contained"), ("«أُغلق» بعد التصحيح دون تحقيق في السبب", "“Closed” after the correction with no investigation of the cause")),
       B("مالك العملية", "Process owner"), B("الزمن من الاكتشاف إلى الاحتواء", "Time from detection to containment")),
    IT("10.2.1 b 1", "PS1", B("راجع عدم المطابقة واكتبها من الوقائع", "Review the nonconformity and write it from facts"),
       R(IS, "لتقييم الحاجة إلى إجراء يزيل السبب حتى لا تتكرر الحالة أو تقع في مكان آخر، تبدأ المنشأة بمراجعة عدم المطابقة. وعدم المطابقة في ISO 9000:2026 ‏(3.5.13) هو عدم استيفاء متطلب، لذلك تُكتب المشكلة بأجزائها الأربعة مع المتطلب الذي لم يُستوفَ، قبل أي حديث عن الأسباب.",
         "to evaluate the need for action to eliminate the cause so the case does not recur or occur elsewhere, the organization starts by reviewing the nonconformity. In ISO 9000:2026 (3.5.13) a nonconformity is the non-fulfilment of a requirement, so the problem is written in its four parts with the requirement that was not met, before any talk of causes."),
       R(EX, "«رُفضت 35 شحنة من 380 (9.2%) في أبريل ومايو 2026 في المشروع PRJ-2026-112، منها 14 للحرارة فوق 32 °م، والمواصفة تشترط 32 °م حداً أعلى» بدل «المورد سيئ».",
         "“35 of 380 loads (9.2%) were rejected in April and May 2026 on project PRJ-2026-112, 14 of them for temperature above 32 °C, where the specification sets 32 °C as the upper limit” instead of “the supplier is bad”."),
       L(("اكتب ماذا وأين ومتى وكم من السجلات", "Write what, where, when and how much from the records"), ("سمِّ المتطلب: مواصفة أو إجراء أو عقد أو قانون", "Name the requirement: a specification, a procedure, a contract or a law"), ("لا تضع سبباً أو حلاً في بيان المشكلة", "Put no cause or solution in the problem statement")),
       L(("بيان المشكلة بأجزائه والمتطلب", "The problem statement in its parts with the requirement"),),
       L(("مشكلة مكتوبة سبباً («نقص التدريب»)", "A problem written as a cause (“lack of training”)"), ("لا متطلب، فلا يُعرف ما الذي لم يُستوفَ", "No requirement, so nobody knows what was not met")),
       B("قائد التحقيق", "Investigation lead"), B("نسبة التحقيقات ببيان مشكلة كامل", "Share of investigations with a complete problem statement")),
    IT("A.10.2", "PS2", B("اختر مدى التحقيق بحسب الخطر والأثر", "Choose the extent of investigation by risk and impact"),
       R(IS, "يوضح الملحق A.10.2 أن المنشأة تحدد طريقة التعامل مع عدم المطابقة، ومنها مدى التحقيق والطرق المستخدمة، بحسب سياقها واحتياجاتها، وتراعي خطر التكرار والأثر الفعلي أو المحتمل ومتطلبات العملاء والأطراف المعنية عند تقرير تطبيق الإجراء التصحيحي. فالعمق يتبع الخطر، لا العادة.",
         "Annex A.10.2 explains that the organization decides how to address nonconformities, including the extent of investigation and the methods used, based on its context and needs, and considers the risk of recurrence, the potential or actual impact and the requirements of customers and other relevant interested parties when deciding if corrective action will be applied. So depth follows risk, not habit."),
       R(EX, "الحادث الوشيك لسقوط حمولة (خطورة 5) أخذ تحقيقاً كاملاً بطريقتين وتحقق بالبيانات، والمخططات الملغاة (خطورة 2 × احتمال 2) أخذت تحقيقاً خفيفاً.",
         "the dropped-load near miss (severity 5) got a full investigation with two methods and a check with data, while the superseded drawings (severity 2 × likelihood 2) got a light one."),
       L(("اكتب قاعدة العمق: الخطورة × الاحتمال", "Write the depth rule: severity × likelihood"), ("ارفع العمق عند الحاجة، ولا تخفضه إلا بسبب مكتوب", "Raise the depth when needed; lower it only with a written reason")),
       L(("قاعدة العمق المكتوبة وتطبيقها في كل تحقيق", "The written depth rule and its use in each investigation"),),
       L(("تحقيق كامل لكل صغيرة، أو سلسلة لماذا لحادث جسيم", "A full investigation for every small thing, or one chain of whys for a severe incident"), ("عمق مخفوض دون سبب", "Depth lowered with no reason")),
       B("مدير الجودة أو السلامة", "Quality or HSE manager"), B("نسبة التحقيقات التي طابق عمقها القاعدة", "Share of investigations whose depth matched the rule")),
    IT("GD-1", "EV1", B("سجّل تسلسل الأحداث والأدلة", "Record the timeline and the evidence"),
       R(GD, "الذاكرة تتغير بعد الحادث بساعات. سجّل كل حدث بوقته ومصدره، وميّز الواقعة المثبتة من الافتراض الذي لم يُتحقق منه بعد، واحفظ الأدلة في سجل: ما هو، ونوعه، ومن يحتفظ به. والدليل الموضوعي في ISO 9000:2026 ‏(3.8.6) بيانات تدعم وجود شيء أو صحته، وقد يأتي من الملاحظة أو القياس أو الاختبار أو غيرها.",
         "memory changes within hours of an event. Record each event with its time and source, tell proven facts apart from assumptions not yet checked, and keep the evidence in a register: what it is, its type and who holds it. Objective evidence in ISO 9000:2026 (3.8.6) is data supporting the existence or truth of something, and it can come from observation, measurement, test or other means."),
       R(EX, "«قد يكون الحبل متآكلاً» سُجّل افتراضاً، ثم استبعده تقرير فحص الحبل؛ والسبب الحقيقي ظهر في مقطع الكاميرا.",
         "“the sling may have been worn” was recorded as an assumption, then ruled out by the sling inspection report; the real cause showed on the CCTV clip."),
       L(("ابدأ الأحداث في اليوم نفسه", "Start the timeline the same day"), ("لكل حدث مصدر", "A source for every event"), ("احفظ الأدلة قبل أن تضيع: الصور والسجلات والعينات", "Keep the evidence before it is lost: photos, records and samples")),
       L(("تسلسل الأحداث وسجل الأدلة", "The timeline and the evidence register"),),
       L(("تحقيق مبني على رواية واحدة", "An investigation built on one account"), ("افتراض عومل كواقعة", "An assumption treated as a fact")),
       B("قائد التحقيق", "Investigation lead"), B("نسبة الأحداث الموثقة بمصدر", "Share of events documented with a source"))
  ]})

S.append({"id": "10.2.1 b", "grp": "core", "ph": "cause", "col": "#1B2A4A", "tint": "#E8ECF4",
  "t": B("البند 10.2.1 ب) تحديد الأسباب والحالات المشابهة", "Clause 10.2.1 b) Determining causes and similar cases"),
  "s": B("الأسباب وإثباتها", "Causes and proof"), "sh": B("10.2.1 ب · الأسباب", "10.2.1 b · Causes"),
  "p": B("قلب التحقيق: تحديد الأسباب بالطرق المناسبة، وفرزها إلى مباشرة ومساهمة وجذرية، واختبار كل سبب جذري وإثباته، ثم البحث عن الحالات المشابهة. البند لا يسمّي طريقة.",
         "The heart of the investigation: determining the causes with the right methods, sorting them into direct, contributing and root, testing and proving each root cause, then looking for similar cases. The clause names no method."),
  "fl": L(("الطرق", "Methods"), ("ثلاثة مستويات", "Three levels"), ("الاختبار", "Test"), ("الإثبات", "Proof"), ("الحالات المشابهة", "Similar cases")),
  "it": [
    IT("10.2.1 b 2", "AN2", B("حدّد الأسباب: مباشرة ومساهمة وجذرية", "Determine the causes: direct, contributing and root"),
       R(IS, "من خطوات تقييم الحاجة إلى إجراء يزيل السبب أن تُحدَّد أسباب عدم المطابقة. والإجراء التصحيحي في ISO 9000:2026 ‏(3.6.4) إجراء لإزالة «سبب أو أسباب» عدم المطابقة ومنع تكرارها؛ فقد يكون للمشكلة أكثر من سبب جذري، والأسباب المساهمة مهمة. ولا تعرّف ISO 9000:2026 «السبب الجذري» مصطلحاً، لكنها تذكر التحقيق فيه وتحديده ضمن فوائد مبدأ التحسين (4.2.6).",
         "one step in evaluating the need for action on the cause is determining the causes of the nonconformity. Corrective action in ISO 9000:2026 (3.6.4) is action to eliminate the “cause(s)” of a nonconformity and to prevent recurrence; a problem can have more than one root cause, and contributing causes matter. ISO 9000:2026 does not define “root cause” as a term, but it names root cause investigation and determination among the benefits of the improvement principle (4.2.6)."),
       R(EX, "السبب المباشر: الخرسانة وصلت فوق 32 °م. المساهمة: الصب ظهراً، والنقل الطويل، وماء غير مبرّد. الجذرية: لا نافذة صب متفق عليها، ولا بند تبريد في العقد.",
         "direct cause: the concrete arrived above 32 °C. Contributing: pouring at noon, long travel, water not chilled. Root: no agreed pour window, and no chilling clause in the contract."),
       L(("لكل سبب مستوى ودليل وحالة", "Give each cause a level, evidence and a status"), ("اربط كل سبب بالسبب الذي يفسّره في الشجرة", "Link each cause to the one it explains in the tree"), ("اقبل أكثر من سبب جذري عندما يدل الدليل على ذلك", "Accept more than one root cause when the evidence shows it")),
       L(("جدول الأسباب بمستوياتها وشجرة الأسباب", "The causes table by level and the cause tree"),),
       L(("السبب المباشر مكتوب سبباً جذرياً", "The direct cause written as the root cause"), ("سبب واحد فرضاً لأن النموذج فيه خانة واحدة", "One cause because the form has one box")),
       B("قائد التحقيق", "Investigation lead"), B("نسبة التحقيقات بأسباب مفروزة إلى ثلاثة مستويات", "Share of investigations with causes sorted into three levels")),
    IT("GD-2", "AN1", B("اختر الطرق من صندوق الأدوات بحسب المشكلة", "Choose the methods from the toolbox to fit the problem"),
       R(GD, "تحليل السبب الجذري لا يحل محل أدوات الصندوق، بل يختار منها: باريتو ليحدد أين تبحث عندما تكثر الحالات، وعظمة السمكة لترسم الأسباب المحتملة عندما تتعدد المسارات، ولماذا الخمس لتحفر في مسار واحد واضح، والبيانات لتثبت السبب أو تستبعده. وتحليل الحواجز والتغييرات يناسب الحوادث: أي ضابط كان يجب أن يمنع الحدث، وماذا تغيّر عن المعتاد.",
         "root cause analysis does not replace the toolbox methods; it chooses among them: Pareto to choose where to look when there are many cases, Fishbone to map the possible causes when there are several paths, 5 Whys to dig down one clear path, and data to prove a cause or rule it out. Barrier and change analysis fits incidents: which control should have stopped the event, and what changed from normal."),
       R(EX, "رفض الخرسانة: باريتو PA-EX-02 ثم عظمة السمكة FB-EX-02 ثم لماذا الخمس W5-EX-03 ثم مقارنة نسب الرفض. سقوط الحمولة: تحليل الحواجز ثم مقارنة البرجين.",
         "concrete rejection: Pareto PA-EX-02, then Fishbone FB-EX-02, then 5 Whys W5-EX-03, then a comparison of rejection rates. Dropped load: barrier analysis, then a comparison of the two towers."),
       L(("سجّل كل طريقة برقم التحليل", "Record each method with the analysis id"), ("أكثر من طريقة عندما تتعدد المسارات أو يرتفع الخطر", "More than one method when the paths are many or the risk is high")),
       L(("قائمة الطرق بأرقامها ونتائجها", "The list of methods with their ids and findings"),),
       L(("لماذا الخمس وحدها لحادث جسيم متعدد الأسباب", "5 Whys alone for a severe incident with several causes"), ("مخطط عظمة سمكة دون تحقق من أي سبب", "A fishbone diagram with no cause verified")),
       B("قائد التحقيق", "Investigation lead"), B("متوسط عدد الطرق في التحقيقات الكاملة", "Average number of methods in full investigations")),
    IT("GD-3", "VR1", B("اختبر السبب الجذري وأثبته قبل الإجراء", "Test and prove the root cause before acting"),
       R(GD, "السبب الجذري فرضية حتى يثبتها الدليل والاختبار. اسأل: إذا أُزيل، هل تتوقف المشكلة أو تقل؟ ثم أثبته ببيانات تقارن مجموعتين، أو بسجلات، أو بتجربة صغيرة. ويربط مبدأ القرار المبني على الدليل في ISO 9000:2026 ‏(4.2.7) القرار الجيد بفهم علاقات السبب والنتيجة وتحليل البيانات وتقييمها بطرق مناسبة.",
         "a root cause is a hypothesis until evidence and a test confirm it. Ask: if it is removed, does the problem stop or fall? Then prove it with data comparing two groups, with records, or with a small trial. The evidence-based decision-making principle in ISO 9000:2026 (4.2.7) ties good decisions to understanding cause and effect relationships and analysing and evaluating data with suitable methods."),
       R(EX, "نسبة الرفض 20.3% في الصب ظهراً مقابل 4.2% في الساعات الأخرى، و1 من 40 شحنة بماء مبرّد مقابل 34 من 340: إزالة السببين تقلل الرفض.",
         "a rejection rate of 20.3% for noon pours against 4.2% at other hours, and 1 of 40 loads with chilled water against 34 of 340: removing the two causes reduces rejections."),
       L(("لكل سبب جذري حالة: فرضية أو مؤكد أو مستبعد", "Give each root cause a status: hypothesis, confirmed or ruled out"), ("أجب عن اختبار الإزالة واكتب الدليل", "Answer the removal test and write the evidence"), ("استبعد بالدليل لا بالرأي", "Rule out with evidence, not opinion")),
       L(("الدليل واختبار الإزالة لكل سبب جذري", "The evidence and the removal test for each root cause"),),
       L(("إجراء على سبب لم يُثبت", "Action on a cause that was never proved"), ("«اختُبر» دون أي دليل مكتوب", "“Tested” with no written evidence")),
       B("قائد التحقيق والمراجِع", "Investigation lead and reviewer"), B("نسبة الأسباب الجذرية المؤكدة والمختبرة", "Share of root causes confirmed and tested")),
    IT("10.2.1 b 3", "VR2", B("حدّد إن كانت حالات مشابهة موجودة أو قد تحدث", "Determine whether similar cases exist or could occur"),
       R(IS, "من خطوات التقييم أيضاً تحديد ما إذا كانت حالات عدم مطابقة مشابهة موجودة أو قد تحدث، لأن الغرض ألا تتكرر الحالة ولا تقع في مكان آخر. والسبب الجذري المؤكد يدل على أين تبحث: كل مكان يعمل بالنظام نفسه.",
         "part of the evaluation is also determining whether similar nonconformities exist or could potentially occur, because the aim is that the case neither recurs nor occurs elsewhere. A confirmed root cause shows where to look: every place that works with the same system."),
       R(EX, "البرج ج يستخدم نموذج خطة الرفع نفسه، فأُوقف رفع الحزم فيه حتى صدر النموذج الجديد.",
         "Tower C uses the same lift plan template, so its bundle lifts were stopped until the new template was issued."),
       L(("ابحث في المواقع والعمليات التي تعمل بالنظام نفسه", "Look at the sites and processes that work with the same system"), ("سجّل النتيجة: موجودة، أو قد تحدث، أو لا توجد بعد الفحص", "Record the result: exist, could occur, or none after checking")),
       L(("نتيجة فحص الحالات المشابهة", "The result of the similar-cases check"),),
       L(("إجراء في موقع واحد والنظام نفسه في موقعين آخرين", "Action on one site while the same system runs on two others"),),
       B("مالك العملية", "Process owner"), B("نسبة التحقيقات التي فُحصت حالاتها المشابهة", "Share of investigations with similar cases checked"))
  ]})

S.append({"id": "10.2.1 c", "grp": "core", "ph": "act", "col": "#1E8C93", "tint": "#E3F4F4",
  "t": B("البند 10.2.1 ج)–و) و10.2.2 الإجراء والفعالية والمعلومات الموثقة", "Clause 10.2.1 c)–f) and 10.2.2 Action, effectiveness and documented information"),
  "s": B("الإجراء والفعالية", "Action and effectiveness"), "sh": B("10.2.1 ج · الإجراء", "10.2.1 c · Action"),
  "p": B("بعد إثبات السبب: إجراء على كل سبب جذري، ومعيار فعالية مكتوب قبل التنفيذ، وتحديث المخاطر والنظام عند الحاجة، ومعلومات موثقة بطبيعة عدم المطابقة والإجراءات ونتائجها.",
         "After the cause is proved: an action on each root cause, an effectiveness criterion written before the action, risks and the system updated when needed, and documented information on the nature of the nonconformity, the actions and their results."),
  "fl": L(("الإجراء", "Action"), ("المعيار", "Criterion"), ("المخاطر", "Risks"), ("السجلات", "Records")),
  "it": [
    IT("10.2.1 c", "AC1", B("ابنِ الإجراء على السبب الجذري المؤكد", "Build the action on the confirmed root cause"),
       R(IS, "تنفذ المنشأة أي إجراء لازم، ويجب أن تكون الإجراءات التصحيحية مناسبة لآثار عدم المطابقة التي وقعت. فالإجراء يُبنى على السبب الجذري المؤكد لا على العَرَض، ويكون بحجم الأثر.",
         "the organization implements any action needed, and corrective actions are to be appropriate to the effects of the nonconformities encountered. So the action is built on the confirmed root cause, not on the symptom, and is sized to the effect."),
       R(EX, "على «لا بند تبريد في العقد» جاء بند في العقد بغرامة، لا «تنبيه المورد» فقط.",
         "for “no chilling clause in the contract” the action was a contract clause with a penalty, not just “remind the supplier”."),
       L(("إجراء واحد على الأقل بمالك لكل سبب جذري", "At least one action with an owner for each root cause"), ("انقل الخطة بتواريخها إلى سجل CAPA", "Carry the plan with its dates into the CAPA record")),
       L(("ربط كل إجراء بسببه الجذري، وسجل CAPA", "Each action linked to its root cause, and the CAPA record"),),
       L(("«إعادة التدريب» على كل سبب", "“Retraining” for every cause"), ("سبب جذري بلا إجراء", "A root cause with no action")),
       B("مالك العملية", "Process owner"), B("نسبة الأسباب الجذرية التي لها إجراء بمالك", "Share of root causes with an action and an owner")),
    IT("10.2.1 d", "AC2", B("اكتب معيار الفعالية قبل التنفيذ", "Write the effectiveness criterion before the action"),
       R(IS, "تراجع المنشأة فعالية أي إجراء تصحيحي تتخذه. ولا تصح المراجعة إلا بمعيار يُكتب قبل التنفيذ: ما يُقاس، وأين، ولأي مدة؛ وإلا كُيّف المعيار مع النتيجة. ويوصي ISO 19011:2026 ‏(6.7) بالتحقق من اكتمال الإجراءات وفعاليتها في متابعة التدقيق.",
         "the organization reviews the effectiveness of any corrective action taken. The review only holds with a criterion written before the action: what is measured, where and for how long; otherwise the criterion gets fitted to the result. ISO 19011:2026 (6.7) recommends verifying the completion and effectiveness of the actions in the audit follow-up."),
       R(EX, "«أقل من 3% شحنات مرفوضة في يوليو وأغسطس 2026 من سجل الاستلام» كُتب في 5 يونيو، قبل بند العقد.",
         "“below 3% rejected loads in July and August 2026 from the receiving log” was written on 5 June, before the contract clause."),
       L(("اكتب ما يُقاس وأين ولأي مدة وتاريخ الكتابة", "Write what is measured, where, for how long and the date written"), ("اربطه بتحقق قبل وبعد في باريتو إن أمكن", "Link it to a Pareto before/after check where you can")),
       L(("معيار الفعالية بتاريخه", "The effectiveness criterion with its date"),),
       L(("«تأكدنا أن الإجراء فعال» دون رقم", "“We confirmed the action is effective” with no figure"), ("معيار كُتب بعد ظهور النتيجة", "A criterion written after the result was known")),
       B("مالك العملية والجودة", "Process owner and quality"), B("نسبة الإجراءات بمعيار مكتوب قبل التنفيذ", "Share of actions with a criterion written before")),
    IT("10.2.1 e", "x:tools", B("حدّث المخاطر والنظام عند الحاجة", "Update the risks and the system when needed"),
       R(IS, "تحدّث المنشأة المخاطر والفرص المحددة أثناء التخطيط إن لزم، وتُجري تغييرات على نظام إدارة الجودة إن لزم. والسبب الجذري المؤكد كثيراً ما يكشف خطراً لم يكن في السجل.",
         "the organization updates the risks and opportunities determined during planning if necessary, and makes changes to the quality management system if necessary. A confirmed root cause often reveals a risk that was not in the register."),
       R(EX, "رُفع خطر «توريد الخرسانة في الصيف» إلى مرتفع، وعُدّل نموذج خطة الرفع.",
         "the risk “concrete supply in summer” was raised to high, and the lift plan template was revised."),
       L(("راجع سجل المخاطر بعد كل تحقيق كامل", "Review the risk register after every full investigation"),),
       L(("تحديث سجل المخاطر أو الإجراءات", "The update to the risk register or the procedures"),),
       L(("سبب جذري في النظام وسجل المخاطر لم يتغير", "A root cause in the system and an unchanged risk register"),),
       B("مدير المخاطر أو الجودة", "Risk or quality manager"), B("نسبة التحقيقات الكاملة التي حدّثت المخاطر", "Share of full investigations that updated the risks")),
    IT("10.2.2", "x:tools", B("احتفظ بالمعلومات الموثقة للتحقيق", "Keep the documented information of the investigation"),
       R(IS, "تتوفر معلومات موثقة دليلاً على طبيعة عدم المطابقة والإجراءات التي اتُّخذت بعدها، وعلى نتائج أي إجراء تصحيحي. وتقرير التحقيق بأحداثه وأدلته وأسبابه واختباراته جزء من هذا الدليل.",
         "documented information is available as evidence of the nature of the nonconformities and any subsequent actions taken, and of the results of any corrective action. The investigation report with its events, evidence, causes and tests is part of that evidence."),
       R(EX, "يُحفظ تقرير التحقيق RC-EX-01 مع سجل CA-EX-04 ونتيجة التحقق من الفعالية.",
         "investigation report RC-EX-01 is kept with record CA-EX-04 and the result of the effectiveness check."),
       L(("نزّل التقرير واحفظه مع سجل CAPA", "Download the report and file it with the CAPA record"),),
       L(("تقرير التحقيق ونتيجة الإجراء", "The investigation report and the result of the action"),),
       L(("سبب جذري بلا سجل يبيّن كيف وُصل إليه", "A root cause with no record of how it was reached"),),
       B("مدير الجودة", "Quality manager"), B("نسبة سجلات CAPA التي معها تقرير تحقيق", "Share of CAPA records with an investigation report"))
  ]})

S.append({"id": "7.2", "grp": "core", "ph": "frame", "col": "#3563C9", "tint": "#E7EEFB",
  "t": B("البند 7.2 الكفاءة", "Clause 7.2 Competence"),
  "s": B("الفريق المناسب", "The right team"), "sh": B("7.2 · الكفاءة", "7.2 · Competence"),
  "p": B("التحقيق يحتاج كفاءة في الطريقة، ومعرفة بالعمل نفسه. فيُبنى الفريق ممن يعرف الطريقة وممن يؤدي العمل.",
         "An investigation needs competence in the method and knowledge of the work itself. So the team is built from people who know the method and people who do the work."),
  "fl": L(("الطريقة", "Method"), ("العمل", "The work"), ("الاستقلال", "Independence")),
  "it": [
    IT("7.2", "EV2", B("ضمّ من يعرف الطريقة ومن يؤدي العمل", "Include people who know the method and people who do the work"),
       R(IS, "تحدد المنشأة الكفاءة اللازمة لمن يعمل تحت سيطرتها ويؤثر في أداء نظام الجودة، وتضمن كفاءتهم بالتعليم أو التدريب أو الخبرة، وتتخذ عند الحاجة إجراءات لاكتسابها وتقيّم فعاليتها، وتتوفر معلومات موثقة دليلاً على الكفاءة. وفي التحقيق: قائد يعرف الطريقة، وشخص واحد على الأقل يؤدي العمل.",
         "the organization determines the competence needed by people doing work under its control that affects the performance of the quality system, ensures they are competent through education, training or experience, takes action to acquire it where applicable and evaluates its effectiveness, and keeps documented information as evidence. In an investigation: a lead who knows the method, and at least one person who does the work."),
       R(EX, "في تحقيق سقوط الحمولة شارك فني الحبال ومشغّل الرافعة، فظهر أن الفحص يُعطى باللاسلكي عادةً، وهو ما لا يقوله الإجراء.",
         "in the dropped-load investigation the rigger and the crane operator took part, which showed that the check is usually given by radio, something the procedure does not say."),
       L(("درّب قادة التحقيق على الطرق الأساسية", "Train investigation leads in the basic methods"), ("ضع في الفريق من يؤدي العمل", "Put someone who does the work on the team"), ("المراجِع من خارج الفريق", "The reviewer comes from outside the team")),
       L(("سجل تدريب قادة التحقيق وقائمة الفريق", "The training record of investigation leads and the team list"),),
       L(("تحقيق يُكتب في المكتب دون من يؤدي العمل", "An investigation written in the office without the people who do the work"),),
       B("مدير الجودة والموارد البشرية", "Quality and HR managers"), B("نسبة التحقيقات التي ضمّت من يؤدي العمل", "Share of investigations that included someone who does the work"))
  ]})

S.append({"id": "8.5.1", "grp": "core", "ph": "cause", "col": "#B42318", "tint": "#FDECE3",
  "t": B("البند 8.5.1 ضبط الإنتاج وتقديم الخدمة", "Clause 8.5.1 Control of production and service provision"),
  "s": B("الخطأ البشري", "Human error"), "sh": B("8.5.1 · الخطأ البشري", "8.5.1 · Human error"),
  "p": B("«الخطأ البشري» نقطة بداية للسؤال، وليس سبباً جذرياً. والمواصفة نفسها تطلب أن تتضمن الظروف المضبوطة إجراءات لمنع الخطأ البشري، أي أن المنع يُبنى في العملية.",
         "“Human error” is a starting point for questions, not a root cause. The standard itself asks that controlled conditions include actions to prevent human error, which means prevention is built into the process."),
  "fl": L(("الخطأ", "Error"), ("العملية", "Process"), ("المنع", "Prevention")),
  "it": [
    IT("8.5.1 g", "AN3", B("لا تقبل «الخطأ البشري» سبباً جذرياً", "Do not accept “human error” as a root cause"),
       R(IS, "تتضمن الظروف المضبوطة للإنتاج وتقديم الخدمة، بحسب ما ينطبق، تنفيذ إجراءات لمنع الخطأ البشري. فإذا ظهر خطأ بشري في التحقيق، فالسؤال: ما الذي في العملية سمح به أو جعله سهلاً؟ الطريقة، أو النموذج، أو التصميم، أو التدريب، أو عبء العمل، أو الضابط الذي لم يمنعه.",
         "controlled conditions for production and service provision include, as applicable, the implementation of actions to prevent human error. So when human error shows up in an investigation, the question is what in the process allowed it or made it easy: the method, the form, the design, the training, the workload or the control that did not stop it."),
       R(EX, "«فني الحبال أخطأ» أصبح «نموذج خطة الرفع لا يحدد طريقة ربط الحزم، فيختار كل فريق طريقته»، والدليل 31 من 46 رفعة في برج مقابل 0 من 38 في برج آخر.",
         "“the rigger made a mistake” became “the lift plan template has no rigging method for bundled loads, so each crew chooses its own”, with the evidence of 31 of 46 lifts on one tower against 0 of 38 on another."),
       L(("أعد كتابة كل سبب يشير إلى شخص بحيث تستطيع المنشأة تغييره", "Rewrite every cause that points at a person so the organization can change it"), ("ابحث عن الضابط الذي كان يجب أن يمنع الخطأ", "Look for the control that should have prevented the error")),
       L(("أسباب جذرية مكتوبة في العملية لا في الأشخاص", "Root causes written in the process, not in people"),),
       L(("«خطأ بشري» أو «إهمال» سبباً جذرياً", "“Human error” or “negligence” as the root cause"), ("«إنذار للموظف» إجراءً تصحيحياً", "“A warning to the employee” as the corrective action")),
       B("قائد التحقيق", "Investigation lead"), B("عدد الأسباب الجذرية التي تشير إلى أشخاص (الهدف صفر)", "Root causes pointing at people (target zero)"))
  ]})

S.append({"id": "9.1.3", "grp": "core", "ph": "cause", "col": "#3563C9", "tint": "#E7EEFB",
  "t": B("البند 9.1.3 التحليل والتقييم", "Clause 9.1.3 Analysis and evaluation"),
  "s": B("البيانات في التحقيق", "Data in the investigation"), "sh": B("9.1.3 · البيانات", "9.1.3 · Data"),
  "p": B("التحليل بالبيانات هو ما يحوّل الفرضية إلى سبب مثبت. والبند 9.1.3 يطلب تحليل بيانات الرصد والقياس وتقييمها، وتذكر ملاحظته الأساليب الإحصائية.",
         "Analysis with data is what turns a hypothesis into a proved cause. Clause 9.1.3 asks for monitoring and measurement data to be analysed and evaluated, and its note names statistical techniques."),
  "fl": L(("المجموعات", "Groups"), ("النسب", "Rates"), ("المقارنة", "Comparison")),
  "it": [
    IT("9.1.3", "x:tools", B("أثبت السبب ببيانات الرصد والقياس", "Prove the cause with monitoring and measurement data"),
       R(IS, "تحلل المنشأة البيانات والمعلومات الناتجة عن الرصد والقياس وتقيّمها، وتستخدم النتائج لتقييم أمور منها مطابقة المنتجات والخدمات وفعالية الإجراءات والحاجة إلى التحسين. وتذكر الملاحظة أن طرق التحليل قد تشمل الأساليب الإحصائية. وأبسطها في التحقيق: مقارنة نسبة المشكلة بين مجموعتين.",
         "the organization analyses and evaluates data and information from monitoring and measurement, and uses the results to evaluate, among other things, the conformity of products and services, the effectiveness of actions and the need for improvement. The note says analysis methods can include statistical techniques. The simplest in an investigation: comparing the rate of the problem between two groups."),
       R(EX, "مقارنة 24 من 118 شحنة ظهراً (20.3%) بـ11 من 262 في الساعات الأخرى (4.2%) أثبتت أثر وقت الصب.",
         "comparing 24 of 118 noon loads (20.3%) with 11 of 262 at other hours (4.2%) proved the effect of pour time."),
       L(("اكتب لكل مجموعة عدد الحالات وما فيه المشكلة", "Write the cases and those with the problem for each group"), ("قارن مجموعتين بالحجم الكافي", "Compare two groups of enough size")),
       L(("جدول التحليل بالبيانات ومصدره", "The data analysis table and its source"),),
       L(("«واضح أن الحرارة هي السبب» دون أرقام", "“Clearly the heat is the cause” with no figures"),),
       B("مهندس الجودة", "Quality engineer"), B("نسبة التحقيقات الكاملة بتحقق بالبيانات", "Share of full investigations with a check by data"))
  ]})

S.append({"id": "6.1", "grp": "core", "ph": "learn", "col": "#B8901E", "tint": "#FCF1DE",
  "t": B("البند 6.1 الإجراءات لمعالجة المخاطر والفرص", "Clause 6.1 Actions to address risks and opportunities"),
  "s": B("التناسب مع الأثر", "Proportionate to impact"), "sh": B("6.1 · المخاطر", "6.1 · Risks"),
  "p": B("الإجراءات لمعالجة المخاطر تكون متناسبة مع أثرها المحتمل. والقاعدة نفسها تصلح لعمق التحقيق ولحجم الإجراء.",
         "Actions to address risks are proportionate to their potential impact. The same rule fits the depth of the investigation and the size of the action."),
  "fl": L(("الخطر", "Risk"), ("التناسب", "Proportion")),
  "it": [
    IT("6.1.2", "x:tools", B("اجعل العمق والإجراء متناسبين مع الأثر", "Keep the depth and the action proportionate to the impact"),
       R(IS, "تحدد المنشأة المخاطر التي قد يكون لها أثر غير مرغوب وتحللها وتقيّمها، وتخطط الإجراءات لمعالجتها وطريقة دمجها وتقييم فعاليتها، وتكون الإجراءات متناسبة مع الأثر المحتمل للمخاطر على النتائج المقصودة لنظام الجودة. وشبكة الخطورة والاحتمال في الأداة تطبيق لهذا التناسب على التحقيق.",
         "the organization determines, analyses and evaluates risks that can have an undesired effect, plans actions to address them, how to integrate them and how to evaluate their effectiveness, and keeps the actions proportionate to the potential impact of the risks on the intended results of the quality system. The severity and likelihood grid in the tool applies that proportion to the investigation."),
       R(EX, "خطورة 5 لسقوط حمولة تعني تحقيقاً كاملاً مهما كان الاحتمال، وخطورة 2 لمخطط ملغى تكفيها مراجعة خفيفة.",
         "severity 5 for a dropped load means a full investigation whatever the likelihood, while severity 2 for a superseded drawing needs a light review."),
       L(("استخدم مقياس الخطورة نفسه في سجل المخاطر والتحقيقات", "Use the same severity scale in the risk register and the investigations"),),
       L(("قاعدة العمق مربوطة بمقياس المخاطر", "The depth rule tied to the risk scale"),),
       L(("مقياسان مختلفان للخطورة في المنشأة نفسها", "Two different severity scales in the same organization"),),
       B("مدير المخاطر", "Risk manager"), B("نسبة التحقيقات المصنفة بالمقياس نفسه", "Share of investigations rated on the same scale"))
  ]})

S.append({"id": "10.1", "grp": "core", "ph": "learn", "col": "#3C9A5F", "tint": "#E5F4EA",
  "t": B("البند 10.1 التحسين المستمر", "Clause 10.1 Continual improvement"),
  "s": B("من التحقيق إلى التحسين", "From investigation to improvement"), "sh": B("10.1 · التحسين", "10.1 · Improvement"),
  "p": B("نتائج التحقيقات مدخل لفرص التحسين: ما يتكرر في الأسباب الجذرية عبر التحقيقات يدل على نقطة ضعف في النظام.",
         "The results of investigations are an input to improvement opportunities: what repeats in root causes across investigations points at a weakness in the system."),
  "fl": L(("الأنماط", "Patterns"), ("الفرص", "Opportunities")),
  "it": [
    IT("10.1", "x:tools", B("ابحث عن الأنماط عبر التحقيقات", "Look for patterns across investigations"),
       R(IS, "تحسّن المنشأة باستمرار ملاءمة نظام الجودة وكفايته وفعاليته، وتنظر في نتائج الرصد والقياس والتحليل والتقييم ونتائج مراجعة الإدارة لتحديد الفرص. ومن الإجراءات تصحيح الآثار غير المرغوبة أو منعها أو تقليلها.",
         "the organization continually improves the suitability, adequacy and effectiveness of the quality system, and considers the results of monitoring, measurement, analysis and evaluation and of management review to determine opportunities. Actions include correcting, preventing or reducing undesired effects."),
       R(EX, "ثلاثة تحقيقات في سنة انتهت إلى «النموذج لا يحدد الطريقة»، فصار تحديث النماذج مبادرة تحسين واحدة.",
         "three investigations in a year ended at “the template does not set the method”, so updating the templates became one improvement initiative."),
       L(("راجع الأسباب الجذرية كل ربع سنة بحثاً عن تكرار", "Review the root causes every quarter for repetition"),),
       L(("ملخص الأسباب الجذرية في مراجعة الإدارة", "The summary of root causes in management review"),),
       L(("كل تحقيق يُغلق وحده ولا يُقارن بغيره", "Each investigation closed on its own and never compared"),),
       B("مدير الجودة", "Quality manager"), B("عدد الأنماط المتكررة المعالجة بمبادرة", "Repeated patterns addressed by an initiative"))
  ]})

S.append({"id": "7.1.6", "grp": "core", "ph": "learn", "col": "#1B2A4A", "tint": "#E8ECF4",
  "t": B("البند 7.1.6 المعرفة التنظيمية", "Clause 7.1.6 Organizational knowledge"),
  "s": B("الدروس المستفادة", "Lessons learned"), "sh": B("7.1.6 · المعرفة", "7.1.6 · Knowledge"),
  "p": B("الدرس الذي يبقى في تقرير لا يقرؤه أحد لا يمنع التكرار. المعرفة تُحفظ وتُطبّق وتُشارك.",
         "A lesson that stays in a report nobody reads does not prevent recurrence. Knowledge is retained, applied and shared."),
  "fl": L(("الحفظ", "Retain"), ("المشاركة", "Share"), ("التطبيق", "Apply")),
  "it": [
    IT("7.1.6", "AC3", B("احفظ الدرس وشاركه", "Keep the lesson and share it"),
       R(IS, "تحدد المنشأة المعرفة اللازمة لتشغيل عملياتها وتحقيق نتائج نظام الجودة، وتحتفظ بها وتطبقها وتشاركها بالقدر اللازم. ومن أشكالها المعرفة المبنية على الخبرة، والمعرفة المضمّنة في الطرق والعمليات، والمعرفة الممثّلة في المعلومات الموثقة.",
         "the organization determines the knowledge needed to operate its processes and achieve quality system results, and retains, applies and shares it to the extent necessary. Its forms include experience-based knowledge, knowledge built into methods and processes, and knowledge held in documented information."),
       R(EX, "دخل رسم ربط الحزم في نموذج خطة الرفع لكل الأبراج، وعُرض الحادث الوشيك في حديث السلامة الأسبوعي.",
         "the bundle rigging sketch went into the lift plan template for all towers, and the near miss was presented at the weekly toolbox talk."),
       L(("ضع الدرس في الطريقة أو النموذج نفسه", "Put the lesson into the method or the form itself"), ("شارك ملخصاً قصيراً مع المواقع الأخرى", "Share a short summary with the other sites")),
       L(("سجل الدروس المستفادة والنماذج المعدلة", "The lessons register and the revised forms"),),
       L(("درس في تقرير مؤرشف ولم يتغير شيء", "A lesson in an archived report and nothing changed"),),
       B("مدير الجودة", "Quality manager"), B("نسبة التحقيقات التي شوركت دروسها", "Share of investigations whose lessons were shared"))
  ]})

legend = [[p["c"], p["n"]] for p in phases.values()]

DATA = {
    "meta": meta, "std": std, "texts": texts, "phases": phases, "flags": {}, "legend": legend,
    "diagram": {"type": "cycle", "centre": B("RCA", "RCA")},
    "matrix": {"tab": "", "d": B("", ""), "btn": B("", "")},
    "sections": S, "paths": [],
    "edges": [["10.2.1 a", "10.2.1 b 1"], ["10.2.1 b 1", "A.10.2"], ["A.10.2", "GD-1"], ["GD-1", "7.2"], ["7.2", "GD-2"], ["GD-2", "10.2.1 b 2"],
              ["10.2.1 b 2", "8.5.1 g"], ["10.2.1 b 2", "GD-3"], ["9.1.3", "GD-3"], ["GD-3", "10.2.1 b 3"], ["10.2.1 b 3", "10.2.1 c"],
              ["10.2.1 c", "10.2.1 d"], ["10.2.1 d", "10.2.1 e"], ["10.2.1 e", "6.1.2"], ["10.2.1 d", "10.2.2"], ["10.2.2", "10.1"], ["10.1", "7.1.6"]],
    "changes": {"note": B("", ""), "tlT": B("", ""), "tlS": B("", ""), "tlCols": 4, "tl": [], "cardsT": B("", ""), "cardsS": B("", ""), "cards": [],
                "corr": {"t": B("", ""), "s": B("", ""), "h": [], "rows": []}, "steps": {"t": B("", ""), "s": B("", ""), "l": B("", "")}},
    "ui": {
        "ar": {"roles": "من يعمل على التحقيق", "wheelT": "عجلة البنود", "purpose": "الغرض من الأداة", "smap": "خطوات التحقيق في السبب الجذري",
               "smapSub": "كل خطوة في سطر. اضغط «اشرح» لفتح البند أو القاعدة التي تخدمها.", "rel": "علاقتها بأدوات المنصة", "comp": "المراجع المساندة",
               "assess": "قيّم هذا في التقييم الذاتي", "assessC": "قيّم هذا في التقييم الذاتي",
               "assessOff": "هذا البند خارج أسئلة التقييم الذاتي، ويُطبَّق مباشرة في تحقيق RCA.", "offGo": "افتح تحقيق RCA",
               "actCtx": "يفتح السؤال {s}", "explainA": "اشرح {c} في دليل البنود"},
        "en": {"roles": "Who works on the investigation", "wheelT": "Clause wheel", "purpose": "What the tool is for", "smap": "Steps of a root cause investigation",
               "smapSub": "One line per step. Select “Explain” to open the clause or rule it serves.", "rel": "How it connects to the platform's tools", "comp": "Supporting references",
               "assess": "Assess this in the self-assessment", "assessC": "Assess this in the self-assessment",
               "assessOff": "This clause is outside the self-assessment questions; it is applied directly in the RCA investigation.", "offGo": "Open the RCA investigation",
               "actCtx": "Opens question {s}", "explainA": "Explain {c} in the clause guide"}
    }
}

if __name__ == "__main__":
    js = ("/* RCA explanation data for the CIA Explain Kit v1.4. Root cause analysis is a discipline that combines methods, not a clause.\n"
          "   Clause numbers and titles checked on 2026-10-15 against the uploaded ISO 9001:2026, ISO 9000:2026 and ISO 19011:2026 texts.\n"
          "   Requirements are interpretive summaries, not the official text; ISO 10009, ISO 10017 and IEC 62740 are not uploaded (\"not verified\"). */\n"
          "const EXPLAIN_RCA=" + json.dumps(DATA, ensure_ascii=False, indent=1) + ";\n")
    sys.stdout.write(js)
