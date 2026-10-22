"""EXPLAIN_FISH — data for the CIA Explain Kit v1.4 in modules/fishbone.html (build step 2026-10-11, Fishbone).
Fishbone (Ishikawa, cause and effect diagram) is a method, not a clause of any standard. The clause guide is built on the
ISO 9001:2026 clauses the method serves. Clause numbers and titles checked on 2026-10-11 against the uploaded official texts only:
  ISO 9001:2026 (sixth edition, 2026-09)  — 7.1.6 Organizational knowledge, 7.2 Competence, 9.1.3 Analysis and evaluation
                                           (NOTE: methods to analyse data can include statistical techniques),
                                           10.1 Continual improvement (c), 10.2 Nonconformity and corrective action,
                                           10.2.1 b) 1)–3), c), 10.2.2, Annex A.10.2, Annex A.9.1 notes 3 and 4 (they only name
                                           ISO 10009 and ISO 10017, which are not uploaded: "not verified")
  ISO 9000:2026 (fifth edition, 2026-05; scanned, read by OCR)
                                         — 3.5.13 nonconformity, 3.6.4 corrective action, 3.8.6 objective evidence,
                                           4.2.6 Improvement (4.2.6.3 key benefits, 4.2.6.4 possible actions),
                                           4.2.7 Evidence-based decision-making (4.2.7.2 rationale, 4.2.7.4 possible actions)
No text of a standard is reproduced: every "requirement" is an interpretive summary in independent wording.
Items coded GD-n are the author's practical guidance on the method, not clauses. Usage: python3 data_fish.py > explain_fish.js"""
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
    "code": "Fishbone",
    "name": B("عظمة السمكة — تحليل السبب والنتيجة", "Fishbone — Cause and effect analysis"),
    "edition": B("أداة منهجية تخدم ISO 9001:2026 البند 10.2.1 ب)", "Method tool serving ISO 9001:2026 clause 10.2.1 b)"),
    "status": B("الأداة الرابعة في صندوق أدوات التحسين المستمر", "Fourth tool in the Continual Improvement Toolbox"),
    "cert": False,
    "certNote": B("«عظمة السمكة» (إيشيكاوا) طريقة لتنظيم الأسباب المحتملة، وليست مواصفة ولا متطلباً. المتطلب الذي تخدمه هو تحديد أسباب عدم المطابقة في البند 10.2.1 ب) 2) من ISO 9001:2026، والتحقق من الحالات المشابهة في 10.2.1 ب) 3)، ويُدقَّق عليهما ضمن نظام إدارة الجودة.",
                  "Fishbone (Ishikawa) is a way of organising possible causes, not a standard or a requirement. The requirements it serves are determining the causes of the nonconformity in ISO 9001:2026 clause 10.2.1 b) 2) and checking for similar nonconformities in 10.2.1 b) 3), both audited as part of the quality management system."),
    "verified": B("2026-10-11، من الملفات الرسمية المرفوعة إلى المشروع: ISO_9001_2026en 1.pdf وISO 9000-2026.pdf (ملف ممسوح ضوئياً، قُرئ بالتعرف الضوئي على النص). كل «متطلب» ملخص تفسيري، وليس النص الرسمي.",
                  "2026-10-11, against the official files uploaded to the project: ISO_9001_2026en 1.pdf and ISO 9000-2026.pdf (a scanned file, read with OCR). Every “requirement” is an interpretive summary, not the official text.")
}

std = {
    "purpose": B("أن تنشر الأسباب الممكنة لأثر وقع على فئات واضحة، فلا يفوت الفريقَ سببٌ مهم، ثم تفصل ما يسنده الدليل عما لا يسنده، وتتحقق من سببين أو ثلاثة هي الأرجح قبل أن يُبنى عليها إجراء تصحيحي.",
                 "To spread the possible causes of an effect across clear categories so the team does not miss an important one, then separate what the evidence supports from what it does not, and verify the two or three most likely causes before a corrective action is built on them."),
    "who": B("مالكو العمليات، ومديرو الجودة والسلامة والبيئة، ومشرفو المواقع والإنتاج، ومهندسو الجودة، والمدققون الداخليون، وكل فريق يُطلب منه تحديد أسباب مشكلة لها أكثر من مسار محتمل.",
             "Process owners, quality, HSE and environment managers, site and production supervisors, quality engineers, internal auditors, and any team asked to find the causes of a problem with more than one possible path."),
    "rolesSub": B("جلسة عظمة السمكة تنجح بتنوع من في الغرفة: كل فئة تحتاج من يعرفها. هذا توزيع مقترح للأدوار.",
                  "A fishbone session works when the room is varied: each category needs someone who knows it. This is a suggested split of roles."),
    "roles": [
        {"n": B("الميسّر", "Facilitator"), "col": "#1E8C93", "d": B("يكتب الأثر في رأس السمكة، ويمرّ على الفئات واحدة واحدة، ويحوّل اللوم إلى وصف للعملية، ويطلب دليلاً لكل سبب.", "Writes the effect at the head, goes through the categories one by one, turns blame into a description of the process and asks for evidence for each cause.")},
        {"n": B("من يؤدي العمل", "Person who does the work"), "col": "#C2410C", "d": B("يعرف ما يحدث فعلاً؛ بدونه تمتلئ العظام بافتراضات من المكتب.", "Knows what really happens; without them the bones fill up with office assumptions.")},
        {"n": B("مالك العملية", "Process owner"), "col": "#1B2A4A", "d": B("يملك الطريقة والنموذج والصلاحية التي تشير إليها الأسباب، ويملك الإجراء بعد ذلك.", "Owns the method, form and authority the causes point to, and owns the action afterwards.")},
        {"n": B("مهندس الجودة أو البيانات", "Quality or data engineer"), "col": "#3563C9", "d": B("يأتي بالسجلات والأرقام التي تثبت السبب أو تستبعده، ويحفظ الأدلة.", "Brings the records and figures that prove or rule out a cause, and keeps the evidence.")},
        {"n": B("المراجِع", "Reviewer"), "col": "#3C9A5F", "d": B("شخص من خارج الفريق يتأكد أن الأسباب المختارة تحقق منها دليل، وأن المستبعدة استُبعدت بدليل.", "Someone outside the team who checks that the selected causes were verified with evidence, and that the ruled-out ones were ruled out with evidence.")},
        {"n": B("المدقق الداخلي", "Internal auditor"), "col": "#7B5BB8", "d": B("يطلب في التدقيق المخطط والأدلة والتحقق، لا قائمة الأسباب وحدها.", "Asks at audit for the diagram, the evidence and the verification, not just the list of causes.")}
    ],
    "map": [
        {"no": "1", "t": B("اكتب الأثر من الوقائع", "Write the effect from facts"), "d": B("ماذا، وأين، ومتى، وكم، في رأس السمكة. بلا سبب ولا اتهام.", "What, where, when and how much, at the head of the fish. No cause and no blame."), "go": "10.2.1 b 1"},
        {"no": "2", "t": B("اجمع الفريق المناسب", "Bring the right team"), "d": B("شخص واحد على الأقل يؤدي العمل نفسه، ومن يعرف كل فئة.", "At least one person who does the work, and people who know each category."), "go": "7.2"},
        {"no": "3", "t": B("اختر الفئات", "Choose the categories"), "d": B("6M أو 4S أو 8P أو فئات خاصة؛ أعد تسميتها بما يناسب العملية.", "6M, 4S, 8P or your own; rename them to fit the process."), "go": "GD-1"},
        {"no": "4", "t": B("اكتب الأسباب وقائع لا لوماً", "Write causes as facts, not blame"), "d": B("ما الذي في العملية يحدث، لا من أخطأ.", "What happens in the process, not who got it wrong."), "go": "GD-2"},
        {"no": "5", "t": B("اربط كل سبب بدليله", "Link each cause to its evidence"), "d": B("مرشّح حتى يسنده دليل يمكن عرضه.", "A candidate until evidence you can show supports it."), "go": "10.2.1 b 2"},
        {"no": "6", "t": B("استبعد بالبيانات", "Rule out with data"), "d": B("اكتب دليل الاستبعاد، وأبقِ السبب على المخطط.", "Write the evidence for ruling out, and keep the cause on the diagram."), "go": "GD-3"},
        {"no": "7", "t": B("اختر القليل الأرجح", "Pick the likely few"), "d": B("ثلاثة أسباب على الأكثر، بالأصوات أو الوزن مع الدليل.", "Three causes at most, by votes or weight, with the evidence."), "go": "GD-4"},
        {"no": "8", "t": B("تحقق بلماذا الخمس أو بالبيانات", "Verify with 5 Whys or data"), "d": B("ثم اختبر: إذا أُزيل السبب، هل يتوقف الأثر؟", "Then test: if the cause is removed, does the effect stop?"), "go": "GD-5"},
        {"no": "9", "t": B("ابحث عن الحالات المشابهة", "Look for similar cases"), "d": B("أين يمكن أن يعمل السبب نفسه؟", "Where could the same cause be at work?"), "go": "10.2.1 b 3"},
        {"no": "10", "t": B("انقل السبب إلى CAPA وشارك الدرس", "Carry the cause into CAPA and share the lesson"), "d": B("الإجراء يُخطط في CAPA، والدرس يصبح معرفة للمنشأة.", "The action is planned in CAPA, and the lesson becomes organizational knowledge."), "go": "10.2.1 c"}
    ],
    "rel": [
        {"code": "CAPA", "n": B("الإجراءات التصحيحية", "Corrective action"), "col": "#C2410C",
         "d": B("التحليل يبدأ من سجل CAPA ويعيد إليه السبب الجذري، والقراءة في الاتجاهين دون كتابة في بيانات الأداة الأخرى.", "The analysis starts from a CAPA record and sends the root cause back to it; both directions read only, with no writing into the other tool's data."), "tool": "./capa.html"},
        {"code": "5 Whys", "n": B("تحليل السبب الجذري", "Root cause analysis"), "col": "#3563C9",
         "d": B("يحفر في كل سبب مختار حتى سبب تستطيع المنشأة تغييره؛ ويُربط التحليل بالسبب المختار هنا.", "Digs into each selected cause until it reaches one the organization can change; the analysis is linked to the selected cause here."), "tool": "./five-whys.html"},
        {"code": "PDCA", "n": B("دورة التحسين المستمر", "Continual improvement cycle"), "col": "#1E8C93",
         "d": B("عندما يحتاج الإجراء تغييراً يُقاس على مراحل، تحمله دورة PDCA ويُسجَّل رقمها في التحليل.", "When the action needs a change measured in stages, a PDCA cycle carries it and its number is written in the analysis."), "tool": "./pdca.html"},
        {"code": "AUDIT", "n": B("مركز التدقيق والتحسين الذكي", "Smart audit & improvement center"), "col": "#C9821A",
         "d": B("ملاحظات التدقيق تصل إلى CAPA بالاستيراد، ومن سجل CAPA يبدأ التحليل هنا.", "Audit findings reach CAPA through its import, and the analysis here starts from the CAPA record."), "tool": "./smart-audit-improvement.html"}
    ],
    "comp": [
        {"code": "ISO 9001:2026 §10.2.1 b)", "n": B("تقييم الحاجة إلى إجراء وتحديد الأسباب", "Evaluating the need for action and determining causes"),
         "d": B("المتطلب الذي تخدمه الطريقة: مراجعة عدم المطابقة، وتحديد أسبابها، والتحقق من الحالات المشابهة.", "The requirement the method serves: review the nonconformity, determine its causes and check for similar cases.")},
        {"code": "ISO 9001:2026 A.10.2", "n": B("مدى التحقيق والطرق المستخدمة", "Extent of investigation and methods used"),
         "d": B("الملحق يترك للمنشأة اختيار الطريقة ومدى التحقيق بحسب سياقها، ولا يسمّي طريقة بعينها.", "The annex leaves the method and the extent of investigation to the organization's context, and names no particular method.")},
        {"code": "ISO 9000:2026 §3.8.6 · §4.2.7", "n": B("الدليل الموضوعي واتخاذ القرار المبني على الدليل", "Objective evidence and evidence-based decision-making"),
         "d": B("يؤكد المبدأ 4.2.7 أهمية فهم علاقات السبب والنتيجة، والدليل هو ما ينقل السبب من مرشّح إلى مدعوم.", "Principle 4.2.7 stresses understanding cause and effect relationships, and evidence is what moves a cause from candidate to supported.")},
        {"code": "ISO 9001:2026 §9.1.3", "n": B("التحليل والتقييم", "Analysis and evaluation"),
         "d": B("البيانات تختار ما يُحلَّل وتستبعد الأسباب؛ وتذكر الملاحظة في البند أن طرق التحليل قد تشمل الأساليب الإحصائية.", "Data chooses what to analyse and rules causes out; the clause's note says analysis methods can include statistical techniques.")},
        {"code": "ISO 9001:2026 A.9.1", "n": B("الرصد والقياس والتحليل والتقييم (الملحق)", "Monitoring, measurement, analysis and evaluation (annex)"),
         "d": B("تشير ملاحظتاه 3 و4 إلى ISO 10009 للإرشاد في أدوات الجودة وISO 10017 للأساليب الإحصائية. هذان الدليلان غير مرفوعين، فمحتواهما «غير متحقق منه» هنا.", "Its notes 3 and 4 point to ISO 10009 for guidance on quality tools and ISO 10017 for statistical techniques. Those two guides are not uploaded, so their content is “not verified” here.")}
    ],
    "buy": [],
    "buyNote": B("للنص الرسمي للمواصفات استخدم النسخ المنشورة من المنظمة الدولية للتوحيد القياسي، وليس هذه المنصة.",
                 "For the official text of the standards, use the copies published by the International Organization for Standardization, not this platform.")
}

texts = {
    "stdT": B("دليل المنهجية", "Method guide"),
    "stdS": B("كيف تُدار جلسة عظمة السمكة: اختيار الفئات، وكتابة الأسباب وقائع، والدليل والاستبعاد، واختيار القليل الأرجح، والتحقق قبل الإجراء.", "How to run a fishbone session: choosing the categories, writing causes as facts, evidence and ruling out, picking the likely few, and verifying before acting."),
    "clT": B("دليل البنود", "Clause guide"),
    "clS": B("البنود التي تخدمها الطريقة، بأرقامها في ISO 9001:2026، وأولها 10.2.1 ب). لكل بند ملخص تفسيري ومثال وما يطلبه المدقق. قواعد الطريقة مرقّمة GD وهي إرشاد لا بنود. الأمثلة توضيحية وليست بيانات حقيقية.",
             "The clauses the method serves, numbered as in ISO 9001:2026, starting with 10.2.1 b). Each one has an interpretive summary, an example and what the auditor asks for. The method's rules are coded GD: guidance, not clauses. Examples are illustrative, not real data."),
    "note": B("ما يرد تحت «المتطلب» ملخص تفسيري بصياغة مستقلة، وليس النص الرسمي للمواصفة. وما تحت «كيف تطبقه» و«الفجوات» إرشاد تطبيقي. أرقام البنود وعناوينها متحقق منها من النصوص الرسمية المرفوعة.",
              "Text under “requirement” is an interpretive summary in independent wording, not the official text of the standard. “How to implement” and “common gaps” are practical guidance. Clause numbers and titles were checked against the uploaded official texts."),
    "chgT": B("ما الذي تغيّر", "What changed"),
    "chgS": B("", "")
}

phases = {
    "define": {"c": "#C2410C", "t": "#FDECE3", "n": B("الأثر والفريق", "Effect and team")},
    "map": {"c": "#1E8C93", "t": "#E3F4F4", "n": B("رسم الأسباب والتحقق", "Map and verify causes")},
    "learn": {"c": "#3C9A5F", "t": "#E5F4EA", "n": B("التعلّم والتحسين", "Learn and improve")},
    "check": {"c": "#C9821A", "t": "#FCF1DE", "n": B("التحليل والتقييم", "Analysis and evaluation")}
}

S = []

S.append({"id": "10.2", "grp": "core", "ph": "map", "col": "#1E8C93", "tint": "#E3F4F4",
  "t": B("البند 10.2 عدم المطابقة والإجراء التصحيحي", "Clause 10.2 Nonconformity and corrective action"),
  "s": B("تحديد الأسباب", "Determining causes"), "sh": B("10.2 · تحديد الأسباب", "10.2 · Determining causes"),
  "p": B("هنا تعمل عظمة السمكة: البند 10.2.1 ب) يطلب مراجعة عدم المطابقة وتحديد أسبابها والتحقق من الحالات المشابهة، قبل اختيار الإجراء. وقواعد الطريقة (GD) إرشاد لكيفية فعل ذلك جيداً.",
         "This is where Fishbone works: clause 10.2.1 b) asks for the nonconformity to be reviewed, its causes determined and similar cases checked, before the action is chosen. The method's rules (GD) are guidance on doing that well."),
  "fl": L(("الأثر", "Effect"), ("الفئات", "Categories"), ("الأسباب والدليل", "Causes and evidence"), ("القليل الأرجح", "Likely few"), ("التحقق", "Verify"), ("CAPA", "CAPA")),
  "it": [
    IT("10.2.1 b 1", "EF1", B("راجِع عدم المطابقة واكتب الأثر من الوقائع", "Review the nonconformity and write the effect from facts"),
       R(IS, "من خطوات تقييم الحاجة إلى إجراء يزيل السبب أن تُراجَع عدم المطابقة نفسها. وعدم المطابقة في ISO 9000:2026 (3.5.13) هي عدم استيفاء متطلب؛ فيُكتب الأثر في رأس السمكة كما وقع: أي متطلب لم يُستوفَ، وأين، ومتى، وبأي حجم.",
         "one step in evaluating the need for action on the cause is reviewing the nonconformity itself. ISO 9000:2026 (3.5.13) describes a nonconformity as the non-fulfilment of a requirement, so the effect at the head of the fish is written as it happened: which requirement was not met, where, when and to what extent."),
       R(EX, "«6 من 38 جهاز قياس في الموقعين أ وب تجاوزت موعد المعايرة، واستُخدم اثنان منها في فحص الاستلام»، بدل «الفنيون أهملوا المعايرة».",
         "“6 of 38 measuring devices at sites A and B were past their calibration date, and two were used for receiving inspection”, instead of “the technicians neglected calibration”."),
       L(("اكتب الأجزاء الأربعة: ماذا، وأين، ومتى، وكم", "Write the four parts: what, where, when and how much"),
         ("أثر واحد في كل مخطط؛ إذا كانت هناك مشكلتان فارسم مخططين", "One effect per diagram; if there are two problems, draw two diagrams"),
         ("لا تضع سبباً أو اتهاماً في الأثر", "Put no cause and no blame in the effect")),
       L(("الأثر بأجزائه الأربعة", "The effect in its four parts"), ("المرجع: NCR أو ملاحظة التدقيق أو الشكوى", "The reference: NCR, audit finding or complaint")),
       L(("أثر مكتوب كسبب جاهز", "An effect written as a ready-made cause"), ("أثر عام بلا حجم ولا تاريخ", "A general effect with no size and no date")),
       B("الميسّر", "Facilitator"), B("نسبة التحليلات بأثر مكتمل الأجزاء", "Share of analyses with a complete effect statement")),
    IT("10.2.1 b 2", "CS3", B("حدّد أسباب عدم المطابقة، وادعم كل سبب بدليل", "Determine the causes of the nonconformity, and back each one with evidence"),
       R(IS, "يطلب البند تحديد أسباب عدم المطابقة. لا يسمّي طريقة، وعظمة السمكة إحدى الطرق الممكنة لتنظيم البحث. والسبب على المخطط مرشّح حتى يسنده دليل موضوعي، وهو في ISO 9000:2026 (3.8.6) بيانات تدعم وجود شيء أو صحته.",
         "the clause requires the causes of the nonconformity to be determined. It names no method, and Fishbone is one possible way to organise the search. A cause on the diagram is a candidate until objective evidence supports it, described in ISO 9000:2026 (3.8.6) as data supporting the existence or truth of something."),
       R(EX, "«سجل المعايرة ورقي ولا تنبيه قبل الموعد» — الدليل: السجلان الورقيان في الموقعين بلا عمود للتنبيه. الحالة: مدعوم بالدليل.",
         "“the calibration log is on paper with no reminder” — evidence: the two paper logs have no reminder column. Status: supported by evidence."),
       L(("اكتب الدليل بجانب كل سبب", "Write the evidence next to every cause"),
         ("صنّف كل سبب: مرشّح، أو مدعوم بالدليل، أو مستبعد", "Mark each cause candidate, supported by evidence or ruled out"),
         ("لا تختر للتحقق سبباً بلا دليل إلا إذا لم يبقَ غيره، واكتب ذلك", "Do not pick a cause with no evidence for verification unless nothing else is left, and say so")),
       L(("المخطط بأسبابه وأدلتها وحالاتها", "The diagram with its causes, evidence and statuses"), ("الوثائق والسجلات المشار إليها", "The documents and records referred to")),
       L(("مخطط مليء بآراء بلا دليل", "A diagram full of opinions with no evidence"), ("السبب يُختار قبل الجلسة ثم تُملأ العظام لتبريره", "The cause chosen before the session, then the bones filled to justify it")),
       B("الفريق بقيادة الميسّر", "The team, led by the facilitator"), B("نسبة الأسباب المدعومة التي كُتب دليلها", "Share of supported causes with written evidence")),
    IT("GD-1", "CS1", B("اختر فئات تناسب العملية", "Choose categories that fit the process"),
       R(GD, "الفئات محفّزات تفتح التفكير، لا قائمة ثابتة. 6M (الأفراد، والطريقة، والمواد، والآلات والمعدات، والقياس، والبيئة) تناسب التصنيع والمقاولات، و4S (المحيط، والموردون، والأنظمة، والمهارات) تناسب الخدمات والعمليات المساندة، و8P تناسب التسويق والخدمات. أعد تسمية أي فئة لا تناسب، وأضف ما ينقص.",
         "categories are prompts that open up the thinking, not a fixed list. 6M (people, method, materials, machines and equipment, measurement, environment) fits manufacturing and construction, 4S (surroundings, suppliers, systems, skills) fits services and support processes, and 8P fits marketing and services. Rename any category that does not fit and add what is missing."),
       R(EX, "مشكلة المخططات الملغاة عملية ضبط وثائق مساندة، فاستُخدمت 4S: كانت «الأنظمة» و«المحيط» أغنى الفئات، ولم تكن 6M لتلتقط «الطباعة المحلية في الموقع» بسهولة.",
         "the superseded drawings problem sits in a support process (document control), so 4S was used: “systems” and “surroundings” were the richest categories, and 6M would not easily have caught “local printing on site”."),
       L(("اختر المجموعة قبل الجلسة بحسب نوع العملية", "Pick the set before the session by the kind of process"), ("أعد تسمية الفئة بلغة الموقع (مثلاً «المورد» بدل «المواد»)", "Rename a category in the site's language (for example “supplier” instead of “materials”)")),
       L(("مجموعة الفئات المستخدمة وأسماؤها", "The category set used and its names"),),
       L(("فئات لا تخص العملية فتبقى فارغة", "Categories unrelated to the process that stay empty"), ("فئة واحدة تبتلع كل الأسباب", "One category that swallows every cause")),
       B("الميسّر", "Facilitator"), B("نسبة التحليلات بثلاث فئات على الأقل فيها أسباب", "Share of analyses with three or more categories holding causes")),
    IT("GD-2", "CS2", B("اكتب الأسباب وقائع عن العملية، لا لوماً", "Write causes as facts about the process, not blame"),
       R(GD, "عظمة «الأفراد» ليست مكاناً لأسماء الأشخاص. «خطأ بشري» و«إهمال» وصف لما حدث؛ اكتب بدلاً منه ما في العملية سمح به: نموذج غامض، أو فحص ثانٍ غائب، أو تدريب ناقص، أو عبء عمل. ويحمي هذا من يتكلم بصراحة في الجلسة.",
         "the “people” bone is not a place for names. “Human error” and “negligence” describe what happened; write instead what in the process allowed it: an unclear form, a missing second check, incomplete training, workload. This also protects the people who speak openly in the session."),
       R(EX, "بدل «الفنيون لا يهتمون بالمعايرة» كُتب «لا مسؤول مسمّى لمتابعة المعايرة في كل موقع»، ودليله مصفوفة المسؤوليات.",
         "instead of “technicians do not care about calibration” the team wrote “no named owner follows up calibration at each site”, backed by the responsibility matrix."),
       L(("أعد صياغة أي سبب يلوم شخصاً إلى وصف للعملية", "Rewrite any cause that blames a person as a description of the process"), ("اسأل: لو تغيّر الشخص، هل يبقى السبب؟", "Ask: if the person changed, would the cause stay?")),
       L(("أسباب مكتوبة بلغة العملية", "Causes written in the language of the process"),),
       L(("«خطأ بشري» سبباً مختاراً وإجراء «توعية»", "“Human error” as a selected cause and “awareness” as the action"),),
       B("الميسّر", "Facilitator"), B("نسبة الأسباب المختارة التي تشير إلى شخص فقط", "Share of selected causes that point at a person only")),
    IT("GD-3", "VR1", B("استبعد الأسباب بالبيانات، وأبقِها على المخطط", "Rule causes out with data, and keep them on the diagram"),
       R(GD, "السبب يُستبعد عندما يقول الدليل إنه لم يعمل في هذه الحالة، لا لأن أحداً في الغرفة لا يقتنع به. اكتب دليل الاستبعاد بجانبه، ولا تحذفه: بقاؤه يبيّن للمدقق وللفريق التالي أنكم نظرتم فيه. ويربط المبدأ 4.2.7 في ISO 9000:2026 القرار الجيد بالبيانات وبفهم علاقات السبب والنتيجة.",
         "a cause is ruled out when the evidence says it did not act in this case, not because someone in the room is not convinced. Write the evidence for ruling it out next to it, and do not delete it: keeping it shows the auditor and the next team that you looked at it. Principle 4.2.7 of ISO 9000:2026 ties good decisions to data and to understanding cause and effect relationships."),
       R(EX, "«خلاطات الشاحنات قديمة وتفقد الهبوط» استُبعد: سجل صيانة أسطول المورد يبيّن أن صيانة كل الخلاطات سارية.",
         "“the truck mixers are old and lose slump” was ruled out: the supplier's fleet maintenance log shows every mixer's maintenance is current."),
       L(("اكتب دليل الاستبعاد كما تكتب دليل الدعم", "Write the evidence for ruling out as you write evidence for support"), ("لا تستبعد بالتصويت", "Do not rule out by vote")),
       L(("الأسباب المستبعدة وأدلتها", "The ruled-out causes and their evidence"),),
       L(("أسباب تُحذف من المخطط دون أثر", "Causes deleted from the diagram without a trace"), ("استبعاد بالرأي أو بالأقدمية", "Ruling out by opinion or seniority")),
       B("مهندس الجودة", "Quality engineer"), B("عدد الأسباب المستبعدة بدليل مكتوب", "Causes ruled out with written evidence")),
    IT("GD-4", "VR2", B("ركّز على القليل الأرجح", "Focus on the likely few"),
       R(GD, "المخطط الجيد يحمل أسباباً كثيرة، لكن التحقق يحتاج تركيزاً. اختر سببين أو ثلاثة هي الأرجح: الأصوات أو الوزن تُظهر رأي الفريق، والدليل يرجّح بينها. ما لا يُختار يبقى على المخطط مرشّحاً أو مستبعداً، ويُرجع إليه إذا لم يؤكد التحقق ما اختير.",
         "a good diagram holds many causes, but verification needs focus. Pick the two or three most likely: votes or weight show the team's view, and the evidence decides between them. What is not picked stays on the diagram as a candidate or ruled out, and you go back to it if the verification does not confirm what was picked."),
       R(EX, "في رفض الخرسانة حصل «الصب في ساعات الحرارة» على 6 أصوات و«ماء الخلط غير مبرد» على 5، وكلاهما مدعوم بالدليل، فاختيرا معاً.",
         "for the concrete rejections, “pouring in the hot hours” got 6 votes and “mixing water not chilled” got 5, both supported by evidence, so both were picked."),
       L(("ثلاثة أسباب مختارة على الأكثر", "Three selected causes at most"), ("اختر من المدعوم بالدليل أولاً", "Pick from the causes supported by evidence first")),
       L(("الأسباب المختارة وأصواتها", "The selected causes and their votes"),),
       L(("معالجة كل ما على المخطط بإجراءات متفرقة", "Acting on everything on the diagram with scattered actions"), ("اختيار الأعلى صوتاً دون دليل", "Picking the loudest cause with no evidence")),
       B("الفريق بقيادة الميسّر", "The team, led by the facilitator"), B("متوسط عدد الأسباب المختارة لكل تحليل", "Average number of selected causes per analysis")),
    IT("GD-5", "VR3", B("تحقق من السبب الجذري قبل الإجراء", "Confirm the root cause before acting"),
       R(GD, "المخطط يبيّن أين تبحث، ولا يثبت وحده السبب. لكل سبب مختار تحقق: تحليل «لماذا الخمس» يحفر فيه حتى سبب تستطيع المنشأة تغييره، أو بيانات تقارن ما حدث بما لم يحدث. ثم اختبر السبب الجذري: إذا أُزيل، هل يتوقف الأثر؟ ويذكر المبدأ 4.2.6 في ISO 9000:2026 من فوائد التحسين تركيزاً أكبر على التحقق من السبب الجذري وتحديده.",
         "the diagram shows where to look; on its own it does not prove the cause. Each selected cause gets a verification: a 5 Whys analysis that digs into it until it reaches a cause the organization can change, or data that compares what happened with what did not. Then test the root cause: if it is removed, does the effect stop? Principle 4.2.6 of ISO 9000:2026 lists a sharper focus on root cause investigation and determination among the benefits of improvement."),
       R(EX, "4 من 6 أجهزة متأخرة نُقلت بين الموقعين، مقابل 2 فقط من 32 جهازاً غير متأخر: البيانات أكدت سبب «النقل دون تحديث السجل».",
         "4 of 6 overdue devices had moved between sites, against only 2 of 32 devices that were not overdue: the data confirmed the cause “moving without updating the log”."),
       L(("اربط تحليل «لماذا الخمس» بالسبب المختار، أو اكتب ملاحظة التحقق بالبيانات", "Link a 5 Whys analysis to the selected cause, or write the verification note with data"), ("اكتب النتيجة: مؤكد أو غير مؤكد", "Write the result: confirmed or not confirmed")),
       L(("التحقق ونتيجته لكل سبب مختار", "The verification and its result for each selected cause"), ("نتيجة اختبار السبب الجذري", "The result of the root cause test")),
       L(("إجراء يُبنى على سبب لم يُتحقق منه", "An action built on a cause that was never verified"), ("سبب «غير مؤكد» يبقى سبباً جذرياً", "A “not confirmed” cause kept as the root cause")),
       B("الفريق والمراجِع", "Team and reviewer"), B("نسبة التحليلات التي تحققت أسبابها المختارة", "Share of analyses whose selected causes were verified")),
    IT("10.2.1 b 3", "LK1", B("تحقّق من الحالات المشابهة الموجودة أو المحتملة", "Check for similar nonconformities that exist or could occur"),
       R(IS, "من خطوات التقييم تحديد ما إذا كانت حالات مشابهة موجودة أو قد تحدث. والمخطط يسهّل ذلك: كل سبب مؤكد في نموذج أو إجراء أو مورد مشترك يعني أن كل مكان يستخدمه معرّض.",
         "part of the evaluation is determining whether similar nonconformities exist or could potentially occur. The diagram makes this easier: every confirmed cause in a shared form, procedure or supplier means every place that uses it is exposed."),
       R(EX, "السبب في إجراء ضبط الوثائق المشترك، ففُحص الموقعان أ وج، ووُجدت نسختان ملغاتان في الموقع ج.",
         "the cause was in the shared document control procedure, so sites A and C were checked and two superseded copies were found on site C."),
       L(("لكل سبب مؤكد اسأل: من يستخدم الشيء نفسه؟", "For each confirmed cause, ask who else uses the same thing"), ("سجّل أين فُحص وما النتيجة", "Record where you checked and what you found")),
       L(("نتيجة فحص المواقع أو العمليات المشابهة", "Result of the check on similar sites or processes"),),
       L(("إغلاق الحالة دون النظر خارج مكانها", "Closing the case without looking beyond where it happened"),),
       B("مسؤول الجودة", "Quality officer"), B("نسبة التحليلات التي فُحصت فيها الحالات المشابهة", "Share of analyses where similar cases were checked")),
    IT("10.2.1 c", "LK2", B("ابنِ الإجراء على السبب الجذري، ونفّذه من سجل CAPA", "Build the action on the root cause, and carry it out from the CAPA record"),
       R(IS, "بعد تحديد الأسباب تنفذ المنشأة أي إجراء لازم، وتكون الإجراءات التصحيحية مناسبة لآثار عدم المطابقة. والإجراء التصحيحي في ISO 9000:2026 (3.6.4) يزيل سبب عدم المطابقة ويمنع تكرارها؛ لذلك يُقرأ كل إجراء مقابل سبب مؤكد على المخطط.",
         "once the causes are determined, the organization implements any action needed, and corrective actions are appropriate to the effects of the nonconformities. ISO 9000:2026 (3.6.4) describes corrective action as removing the cause and preventing recurrence, so each action is read against a confirmed cause on the diagram."),
       R(EX, "السبب المؤكد «لا مسؤول مسمّى في كل موقع» صار إجراءً في سجل CA-EX-02: تسمية مسؤول معايرة في كل موقع، بمالك وموعد.",
         "the confirmed cause “no named owner at each site” became an action in record CA-EX-02: name a calibration owner at each site, with an owner and a date."),
       L(("انقل السبب الجذري إلى سجل CAPA بزر «استخدم هذا السبب الجذري»", "Carry the root cause into the CAPA record with “Use this root cause”"), ("لكل إجراء مقترح مالك هنا، وموعده في CAPA", "Each countermeasure has an owner here and a due date in CAPA")),
       L(("ربط التحليل برقم سجل CAPA", "The analysis linked to the CAPA record number"), ("إجراء لكل سبب مؤكد", "An action for each confirmed cause")),
       L(("إجراءات لأسباب لم تُختر أو لم تتأكد", "Actions for causes that were not picked or not confirmed"), ("تحليل لا يصل إلى أي سجل إجراء", "An analysis that never reaches an action record")),
       B("مالك العملية", "Process owner"), B("نسبة التحليلات المرتبطة بسجل CAPA", "Share of analyses linked to a CAPA record")),
    IT("A.10.2", "x:tools", B("اختر مدى التحقيق والطريقة بحسب الخطر والأثر", "Choose the extent of investigation and the method by risk and impact"),
       R(IS, "يوضح الملحق A.10.2 أن المنشأة تحدد طريقة التعامل مع عدم المطابقة، ومنها مدى التحقيق والطرق المستخدمة، بحسب سياقها واحتياجاتها، مع مراعاة خطر التكرار والأثر الفعلي أو المحتمل ومتطلبات العملاء والأطراف المعنية عند تقرير الإجراء التصحيحي.",
         "Annex A.10.2 explains that the organization decides how to address nonconformities, including the extent of investigation and the methods used, based on its context and needs, considering the risk of recurrence, the actual or potential impact and the requirements of customers and other interested parties when deciding on corrective action."),
       R(EX, "مشكلة لها مسار واحد واضح تكفيها «لماذا الخمس». أما رفض الخرسانة المتكرر بأسباب في الطريقة والمواد والمورد فاستحق مخطط عظمة سمكة ثم تحققاً بلماذا الخمس.",
         "a problem with one clear path needs only 5 Whys. Repeated concrete rejections with causes in method, materials and the supplier deserved a fishbone diagram, then verification with 5 Whys."),
       L(("ضع قاعدة: متى يلزم مخطط عظمة سمكة، ومتى تكفي «لماذا الخمس»، ومتى يكفي التصحيح", "Set a rule: when a fishbone diagram is needed, when 5 Whys is enough, and when correction alone is enough"),),
       L(("قاعدة اختيار الطريقة ومدى التحقيق", "The rule for choosing the method and the extent of investigation"),),
       L(("مخطط كامل لكل مشكلة صغيرة", "A full diagram for every small problem"), ("سلسلة واحدة لمشكلة لها أسباب متعددة", "A single chain for a problem with several causes")),
       B("مدير الجودة", "Quality manager"), B("نسبة عدم المطابقة الرئيسية التي حُللت", "Share of major nonconformities analysed")),
    IT("10.2.2", "x:tools", B("احتفظ بالمخطط والتحقق دليلاً", "Keep the diagram and the verification as evidence"),
       R(IS, "تُحفظ معلومات موثقة تبيّن طبيعة عدم المطابقة والإجراءات التي تلتها ونتائج الإجراء التصحيحي. والمخطط بأسبابه وأدلته وتحققه جزء من هذا الدليل، ويطلبه المدقق عادةً.",
         "documented information is kept on the nature of the nonconformities, the actions that followed and the results of corrective action. The diagram, with its causes, evidence and verification, is part of that evidence and auditors usually ask for it."),
       R(EX, "تقرير التحليل FB-EX-01 بمخططه وجدول أسبابه مرفق بسجل CA-EX-02 في نظام الوثائق.",
         "the report of analysis FB-EX-01, with its diagram and cause table, is filed with record CA-EX-02 in the document system."),
       L(("نزّل تقرير HTML واحفظه مع سجل CAPA", "Download the HTML report and file it with the CAPA record"),),
       L(("تقرير التحليل المرفق", "The filed analysis report"),),
       L(("مخطط على سبورة يُمسح بعد الاجتماع", "A whiteboard diagram wiped after the meeting"),),
       B("مسؤول الجودة", "Quality officer"), B("نسبة سجلات CAPA التي يرافقها تحليل محفوظ", "Share of CAPA records with a filed analysis"))
  ]})

S.append({"id": "7.2", "grp": "core", "ph": "define", "col": "#C2410C", "tint": "#FDECE3",
  "t": B("البند 7.2 الكفاءة", "Clause 7.2 Competence"),
  "s": B("الكفاءة", "Competence"), "sh": B("7.2 · الكفاءة", "7.2 · Competence"),
  "p": B("جودة المخطط من جودة من في الغرفة: ميسّر يعرف الطريقة، وأشخاص يعرفون كل فئة كما تحدث فعلاً.",
         "A diagram is as good as the people in the room: a facilitator who knows the method, and people who know each category as it really happens."),
  "fl": L(("حدّد الكفاءة", "Set the competence"), ("اختر الفريق", "Pick the team"), ("درّب الميسّرين", "Train facilitators")),
  "it": [
    IT("7.2", "EF2", B("اختر فريقاً كفؤاً يضم من يؤدي العمل", "Pick a competent team that includes someone who does the work"),
       R(IS, "تحدد المنشأة الكفاءة اللازمة للأشخاص الذين يؤثر عملهم في أداء نظام الجودة، وتتأكد من كفاءتهم بالتعليم أو التدريب أو الخبرة، وتتخذ إجراءات لاكتسابها عند الحاجة وتقيّم فعالية تلك الإجراءات، مع الاحتفاظ بدليل عليها. وتحليل الأسباب عمل يؤثر في الأداء، فيحتاج ميسّراً مدرباً وخبرة ميدانية في كل فئة.",
         "the organization determines the competence needed by people whose work affects quality system performance, makes sure they are competent through education, training or experience, acts to gain it where needed and evaluates whether those actions worked, and keeps evidence of it. Cause analysis is work that affects performance, so it needs a trained facilitator and field experience in each category."),
       R(EX, "في تحليل الخرسانة حضر ممثل المورد المسؤول عن الخلط في المصنع، وهو من أكد أن ماء الخلط لم يُبرّد في شحنات المساء.",
         "in the concrete analysis the supplier's batching representative took part; he was the one who confirmed the mixing water was not chilled on evening loads."),
       L(("ضع في كل فريق شخصاً واحداً على الأقل يؤدي العمل نفسه", "Put at least one person who does the work in every team"), ("ادعُ من يعرف الفئات التي تخص المشكلة (المورد، المعدات، القياس)", "Invite people who know the categories that matter (supplier, equipment, measurement)"), ("درّب ميسّرين على الطريقة واحفظ سجل التدريب", "Train facilitators in the method and keep the training record")),
       L(("قائمة الفريق وأدوارهم", "The team list and roles"), ("سجل تدريب الميسّرين", "Facilitator training records")),
       L(("فريق من المكتب فقط", "A team from the office only"), ("ميسّر يملأ العظام وحده", "A facilitator who fills the bones alone")),
       B("مدير الجودة", "Quality manager"), B("نسبة التحليلات التي ضمّت من يؤدي العمل", "Share of analyses that included someone doing the work"))
  ]})

S.append({"id": "7.1.6", "grp": "core", "ph": "learn", "col": "#3C9A5F", "tint": "#E5F4EA",
  "t": B("البند 7.1.6 المعرفة التنظيمية", "Clause 7.1.6 Organizational knowledge"),
  "s": B("المعرفة التنظيمية", "Organizational knowledge"), "sh": B("7.1.6 · المعرفة", "7.1.6 · Knowledge"),
  "p": B("المخطط المراجَع درس جاهز: أسبابه المؤكدة والمستبعدة توفر على الفريق التالي جلسة كاملة، إذا حُفظ وشورك.",
         "A reviewed diagram is a ready lesson: its confirmed and ruled-out causes save the next team a whole session, if it is kept and shared."),
  "fl": L(("تعلّم", "Learn"), ("احفظ", "Keep"), ("شارك", "Share")),
  "it": [
    IT("7.1.6", "x:tools", B("احفظ ما تعلمته من المخطط وشاركه", "Keep and share what the diagram taught you"),
       R(IS, "تحدد المنشأة المعرفة اللازمة لتشغيل عملياتها وتحقيق نتائج نظام الجودة، وتحتفظ بها وتطبقها وتشاركها بالقدر اللازم. ومن أشكالها المعرفة المكتسبة من الخبرة والمعرفة المضمّنة في الطرق والعمليات.",
         "the organization determines the knowledge needed to operate its processes and achieve quality system results, and retains, applies and shares it to the extent necessary. Its forms include knowledge gained from experience and knowledge built into methods and processes."),
       R(EX, "أصبح مخطط رفض الخرسانة بفئاته المؤكدة والمستبعدة نقطة بداية لأي مشروع يصب في الصيف.",
         "the concrete rejection diagram, with its confirmed and ruled-out causes, became the starting point for any project pouring in summer."),
       L(("انشر ملخصاً من صفحة واحدة لكل مخطط مراجَع", "Share a one-page summary of every reviewed diagram"), ("ابدأ المشكلة المشابهة من المخطط السابق بدل صفحة فارغة", "Start a similar problem from the earlier diagram instead of a blank page")),
       L(("ملخصات التحليلات المنشورة", "The shared analysis summaries"),),
       L(("المخطط يبقى في ملف من حضر الجلسة", "The diagram stays in the file of whoever attended"),),
       B("مدير الجودة", "Quality manager"), B("عدد ملخصات التحليل المنشورة", "Analysis summaries shared"))
  ]})

S.append({"id": "9.1.3", "grp": "core", "ph": "check", "col": "#C9821A", "tint": "#FCF1DE",
  "t": B("البند 9.1.3 التحليل والتقييم", "Clause 9.1.3 Analysis and evaluation"),
  "s": B("التحليل والتقييم", "Analysis"), "sh": B("9.1.3 · التحليل", "9.1.3 · Analysis"),
  "p": B("البيانات تعمل في طرفي المخطط: تختار المشكلة التي تستحق الجلسة، ثم تثبت الأسباب أو تستبعدها.",
         "Data works at both ends of the diagram: it chooses the problem that deserves the session, then proves or rules out the causes."),
  "fl": L(("بيانات", "Data"), ("أولوية", "Priority"), ("دليل", "Evidence")),
  "it": [
    IT("9.1.3", "x:tools", B("استخدم البيانات لاختيار المشكلة وللتحقق من الأسباب", "Use data to choose the problem and to verify the causes"),
       R(IS, "تحلل المنشأة البيانات والمعلومات الناتجة عن الرصد والقياس وتقيّمها، وتستخدم النتائج لتقييم أمور منها مطابقة المنتجات والخدمات وأداء النظام وأداء الموردين والحاجة إلى التحسين. وتذكر الملاحظة في البند أن طرق تحليل البيانات قد تشمل الأساليب الإحصائية، ومنها ما يثبت السبب أو يستبعده.",
         "the organization analyses and evaluates data and information from monitoring and measurement, and uses the results to evaluate, among other things, product and service conformity, system performance, external provider performance and the need for improvement. The clause's note says methods to analyse data can include statistical techniques, some of which prove or rule out a cause."),
       R(EX, "مقارنة الأجهزة المتأخرة بغير المتأخرة (4 من 6 مقابل 2 من 32 نُقلت بين المواقع) كانت التحقق من سبب النقل.",
         "comparing overdue devices with the rest (4 of 6 against 2 of 32 had moved between sites) was the verification of the moving cause."),
       L(("رتّب المشكلات بحسب التكرار والأثر قبل اختيار ما يُحلَّل", "Rank problems by frequency and impact before choosing what to analyse"), ("قارن ما حدث بما لم يحدث للتحقق من السبب", "Compare what happened with what did not to verify a cause")),
       L(("بيانات الاختيار والتحقق", "The data behind the choice and the verification"),),
       L(("مخطط لمشكلة اختيرت لأنها لفتت الانتباه", "A diagram for a problem chosen because it caught attention"),),
       B("مهندس الجودة", "Quality engineer"), B("نسبة الأسباب المختارة المتحقق منها بالبيانات", "Share of selected causes verified with data"))
  ]})

S.append({"id": "10.1", "grp": "core", "ph": "learn", "col": "#1B2A4A", "tint": "#E8ECF4",
  "t": B("البند 10.1 التحسين المستمر", "Clause 10.1 Continual improvement"),
  "s": B("التحسين المستمر", "Continual improvement"), "sh": B("10.1 · التحسين", "10.1 · Improvement"),
  "p": B("التحليل الذي يغيّر طريقة أو نموذجاً أو شرطاً تعاقدياً يحسّن النظام، لا الحالة وحدها.",
         "An analysis that changes a method, a form or a contract clause improves the system, not only the case."),
  "fl": L(("سبب", "Cause"), ("تغيير", "Change"), ("تحسين", "Improvement")),
  "it": [
    IT("10.1 c", "x:tools", B("اجعل الأسباب المؤكدة مدخلاً للتحسين", "Make the confirmed causes an input to improvement"),
       R(IS, "تحسّن المنشأة باستمرار ملاءمة نظام الجودة وكفايته وفعاليته، ومن إجراءات التحسين تصحيح الآثار غير المرغوبة أو منعها أو تقليلها. ويذكر مبدأ التحسين في ISO 9000:2026 (4.2.6) من الإجراءات الممكنة تدريب الناس على تطبيق الأدوات والطرق الأساسية لتحقيق أهداف التحسين.",
         "the organization continually improves the suitability, adequacy and effectiveness of its quality system, and improvement actions include correcting, preventing or reducing undesired effects. The improvement principle in ISO 9000:2026 (4.2.6) lists, among possible actions, training people to apply basic tools and methodologies to achieve improvement objectives."),
       R(EX, "شرط تبريد ماء الخلط أصبح جزءاً من عقود الخرسانة في كل المشاريع، لا في المشروع الذي وقعت فيه المشكلة فقط.",
         "the chilled mixing water clause became part of the concrete contracts on every project, not only on the project where the problem happened."),
       L(("اسأل بعد كل تحليل: هل يستحق السبب تغييراً في النظام كله؟", "After every analysis, ask whether the cause deserves a change across the system"), ("افتح دورة PDCA عندما يحتاج التغيير قياساً على مراحل", "Open a PDCA cycle when the change needs measuring in stages")),
       L(("التغيير في النظام ومرجعه في التحليل", "The system change and its reference in the analysis"),),
       L(("السبب يُعالج في مكان واحد فقط", "The cause fixed in one place only"),),
       B("الإدارة العليا", "Top management"), B("عدد التغييرات في النظام الناتجة عن التحليلات", "System changes triggered by analyses"))
  ]})

legend = [[p["c"], p["n"]] for p in phases.values()]

DATA = {
    "meta": meta, "std": std, "texts": texts, "phases": phases, "flags": {}, "legend": legend,
    "diagram": {"type": "cycle", "centre": B("عظمة السمكة", "Fishbone")},
    "matrix": {"tab": "", "d": B("", ""), "btn": B("", "")},
    "sections": S, "paths": [],
    "edges": [["10.2.1 b 1", "GD-1"], ["7.2", "GD-1"], ["GD-1", "GD-2"], ["GD-2", "10.2.1 b 2"], ["10.2.1 b 2", "GD-3"], ["GD-3", "GD-4"],
              ["GD-4", "GD-5"], ["GD-5", "10.2.1 b 3"], ["GD-5", "10.2.1 c"], ["10.2.1 c", "10.2.2"], ["10.2.1 c", "7.1.6"],
              ["9.1.3", "GD-3"], ["A.10.2", "10.2.1 b 1"], ["7.1.6", "10.1 c"]],
    "changes": {"note": B("", ""), "tlT": B("", ""), "tlS": B("", ""), "tlCols": 4, "tl": [], "cardsT": B("", ""), "cardsS": B("", ""), "cards": [],
                "corr": {"t": B("", ""), "s": B("", ""), "h": [], "rows": []}, "steps": {"t": B("", ""), "s": B("", ""), "l": B("", "")}},
    "ui": {
        "ar": {"roles": "من يحضر الجلسة", "wheelT": "عجلة البنود", "purpose": "الغرض من الأداة", "smap": "خطوات تحليل عظمة السمكة",
               "smapSub": "كل خطوة في سطر. اضغط «اشرح» لفتح البند أو القاعدة التي تخدمها.", "rel": "علاقتها بأدوات المنصة", "comp": "المراجع المساندة",
               "assess": "قيّم هذا في التقييم الذاتي", "assessC": "قيّم هذا في التقييم الذاتي",
               "assessOff": "هذا البند خارج أسئلة التقييم الذاتي، ويُطبَّق مباشرة في تحليل عظمة السمكة.", "offGo": "افتح تحليل عظمة السمكة",
               "actCtx": "يفتح السؤال {s}", "explainA": "اشرح {c} في دليل البنود"},
        "en": {"roles": "Who is in the session", "wheelT": "Clause wheel", "purpose": "What the tool is for", "smap": "Steps of a Fishbone analysis",
               "smapSub": "One line per step. Select “Explain” to open the clause or rule it serves.", "rel": "How it connects to the platform's tools", "comp": "Supporting references",
               "assess": "Assess this in the self-assessment", "assessC": "Assess this in the self-assessment",
               "assessOff": "This clause is outside the self-assessment questions; it is applied directly in the Fishbone analysis.", "offGo": "Open the Fishbone analysis",
               "actCtx": "Opens question {s}", "explainA": "Explain {c} in the clause guide"}
    }
}

if __name__ == "__main__":
    js = ("/* Fishbone explanation data for the CIA Explain Kit v1.4. Fishbone (Ishikawa) is a method, not a clause. Clause numbers and\n"
          "   titles checked on 2026-10-11 against the uploaded ISO 9001:2026 and ISO 9000:2026 texts. Requirements are interpretive\n"
          "   summaries, not the official text. */\n"
          "const EXPLAIN_FISH=" + json.dumps(DATA, ensure_ascii=False, indent=1) + ";\n")
    sys.stdout.write(js)
