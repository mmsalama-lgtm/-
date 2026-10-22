"""EXPLAIN_WHY5 — data for the CIA Explain Kit v1.4 in modules/five-whys.html (build step 2026-10-11, 5 Whys).
5 Whys is a questioning method, not a clause of any standard. The clause guide is built on the ISO 9001:2026 clauses the
method serves. Clause numbers and titles checked on 2026-10-11 against the uploaded official texts only:
  ISO 9001:2026 (sixth edition, 2026-09)  — 7.1.6 Organizational knowledge, 7.2 Competence, 9.1.3 Analysis and evaluation,
                                           10.1 Continual improvement (c), 10.2 Nonconformity and corrective action,
                                           10.2.1 b) 1)–3), c), 10.2.2, Annex A.10.2
  ISO 9000:2026 (fifth edition, 2026-05)  — 3.5.13 nonconformity, 3.6.4 corrective action, 3.8.6 objective evidence,
                                           4.2.6 Improvement (4.2.6.3 key benefits), 4.2.7 Evidence-based decision-making
No text of a standard is reproduced: every "requirement" is an interpretive summary in independent wording.
Items coded GD-n are the author's practical guidance on the method, not clauses. Usage: python3 data_why5.py > explain_why5.js"""
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
    "code": "5 Whys",
    "name": B("لماذا الخمس — تحليل السبب الجذري", "5 Whys — Root cause analysis"),
    "edition": B("أداة منهجية تخدم ISO 9001:2026 البند 10.2.1 ب)", "Method tool serving ISO 9001:2026 clause 10.2.1 b)"),
    "status": B("الأداة الثالثة في صندوق أدوات التحسين المستمر", "Third tool in the Continual Improvement Toolbox"),
    "cert": False,
    "certNote": B("«لماذا الخمس» طريقة لطرح الأسئلة، وليست مواصفة ولا متطلباً. المتطلب الذي تخدمه هو تحديد أسباب عدم المطابقة في البند 10.2.1 ب) 2) من ISO 9001:2026، ويُدقَّق عليه ضمن نظام إدارة الجودة.",
                  "5 Whys is a way of asking questions, not a standard or a requirement. The requirement it serves is determining the causes of the nonconformity in ISO 9001:2026 clause 10.2.1 b) 2), which is audited as part of the quality management system."),
    "verified": B("2026-10-11، من الملفات الرسمية المرفوعة إلى المشروع: ISO_9001_2026en 1.pdf وISO 9000-2026.pdf. كل «متطلب» ملخص تفسيري، وليس النص الرسمي.",
                  "2026-10-11, against the official files uploaded to the project: ISO_9001_2026en 1.pdf and ISO 9000-2026.pdf. Every “requirement” is an interpretive summary, not the official text.")
}

std = {
    "purpose": B("أن تصل من عدم مطابقة وقعت إلى سبب تستطيع المنشأة أن تغيّره، بسلسلة أسئلة قصيرة يسند الدليلُ كل جواب فيها، ثم تختبر السبب قبل أن يُبنى عليه إجراء تصحيحي.",
                 "To get from a nonconformity that happened to a cause the organization can change, through a short chain of questions where evidence backs every answer, and then to test that cause before a corrective action is built on it."),
    "who": B("مالكو العمليات، ومديرو الجودة والسلامة والبيئة، ومشرفو المواقع والإنتاج، والمدققون الداخليون، وكل فريق يُطلب منه تحديد سبب عدم مطابقة في سجل CAPA.",
             "Process owners, quality, HSE and environment managers, site and production supervisors, internal auditors, and any team asked to find the cause of a nonconformity in a CAPA record."),
    "rolesSub": B("جلسة «لماذا الخمس» قصيرة، لكنها تحتاج الأشخاص المناسبين في الغرفة. هذا توزيع مقترح للأدوار.",
                  "A 5 Whys session is short, but it needs the right people in the room. This is a suggested split of roles."),
    "roles": [
        {"n": B("الميسّر", "Facilitator"), "col": "#3563C9", "d": B("يدير الجلسة، ويطلب دليلاً لكل جواب، ويوقف اللوم، ويقرر متى يُفتح فرع.", "Runs the session, asks for evidence for every answer, stops blame and decides when to open a branch.")},
        {"n": B("من يؤدي العمل", "Person who does the work"), "col": "#C2410C", "d": B("يعرف ما يحدث فعلاً في الموقع أو الخط؛ بدونه تتحول الأجوبة إلى افتراضات.", "Knows what really happens on site or on the line; without them, answers turn into assumptions.")},
        {"n": B("مالك العملية", "Process owner"), "col": "#1B2A4A", "d": B("يملك الطريقة والنموذج والصلاحية التي يشير إليها السبب، ويملك الإجراء بعد ذلك.", "Owns the method, form and authority the cause points to, and owns the action afterwards.")},
        {"n": B("مسؤول الجودة", "Quality officer"), "col": "#C9821A", "d": B("يحفظ الأدلة، ويربط التحليل بسجل CAPA، ويتابع الحالات المشابهة.", "Keeps the evidence, links the analysis to the CAPA record and follows up similar cases.")},
        {"n": B("المراجِع", "Reviewer"), "col": "#3C9A5F", "d": B("شخص من خارج الفريق يقرأ السلسلة عكسياً ويتحقق أن السبب مدعوم قبل اعتماده.", "Someone outside the team who reads the chain back and checks the cause is supported before it is accepted.")},
        {"n": B("المدقق الداخلي", "Internal auditor"), "col": "#7B5BB8", "d": B("يطلب في التدقيق مخرجات التحليل والدليل على كل جواب، لا الإجراء وحده.", "Asks at audit for the analysis output and the evidence for each answer, not only the action.")}
    ],
    "map": [
        {"no": "1", "t": B("عرّف المشكلة من الوقائع", "Define the problem from facts"), "d": B("ماذا، وأين، ومتى، وكم. بلا تفسير ولا اتهام.", "What, where, when and how much. No explanation and no blame."), "go": "10.2.1 b 1"},
        {"no": "2", "t": B("اجمع الفريق المناسب", "Bring the right team"), "d": B("شخص واحد على الأقل يؤدي العمل نفسه، وميسّر يطلب الدليل.", "At least one person who does the work, and a facilitator who asks for evidence."), "go": "7.2"},
        {"no": "3", "t": B("اسأل لماذا، وادعم كل جواب", "Ask why, and back every answer"), "d": B("لكل جواب دليله وحالة التحقق منه.", "Each answer has its evidence and a check status."), "go": "10.2.1 b 2"},
        {"no": "4", "t": B("توقّف عند سبب قابل للتغيير", "Stop at a cause you can change"), "d": B("خمسة قاعدة تقريبية؛ سجّل لماذا توقفت.", "Five is a rule of thumb; record why you stopped."), "go": "GD-1"},
        {"no": "5", "t": B("افتح فرعاً للسبب الموازي", "Branch for a parallel cause"), "d": B("سبب لكل فرع، بحد أقصى فرعين.", "One cause per branch, two branches at most."), "go": "GD-3"},
        {"no": "6", "t": B("اختبر السبب الجذري", "Test the root cause"), "d": B("إذا أُزيل هل تتوقف المشكلة؟ واقرأ السلسلة عكسياً بـ «لذلك».", "If it is removed, does the problem stop? Read the chain back with “therefore”."), "go": "GD-4"},
        {"no": "7", "t": B("ابحث عن الحالات المشابهة", "Look for similar cases"), "d": B("أين يمكن أن يحدث الشيء نفسه؟", "Where could the same thing happen?"), "go": "10.2.1 b 3"},
        {"no": "8", "t": B("انقل السبب إلى CAPA وشارك الدرس", "Carry the cause into CAPA and share the lesson"), "d": B("الإجراء يُخطط في CAPA، والدرس يصبح معرفة للمنشأة.", "The action is planned in CAPA, and the lesson becomes organizational knowledge."), "go": "10.2.1 c"}
    ],
    "rel": [
        {"code": "CAPA", "n": B("الإجراءات التصحيحية", "Corrective action"), "col": "#C2410C",
         "d": B("التحليل يبدأ من سجل CAPA ويعيد إليه السبب الجذري، والقراءة في الاتجاهين دون كتابة في بيانات الأداة الأخرى.", "The analysis starts from a CAPA record and sends the root cause back to it; both directions read only, with no writing into the other tool's data."), "tool": "./capa.html"},
        {"code": "PDCA", "n": B("دورة التحسين المستمر", "Continual improvement cycle"), "col": "#1E8C93",
         "d": B("عندما يحتاج الإجراء تغييراً يُقاس على مراحل، تحمله دورة PDCA ويُسجَّل رقمها في التحليل.", "When the action needs a change measured in stages, a PDCA cycle carries it and its number is written in the analysis."), "tool": "./pdca.html"},
        {"code": "AUDIT", "n": B("مركز التدقيق والتحسين الذكي", "Smart audit & improvement center"), "col": "#C9821A",
         "d": B("ملاحظات التدقيق تصل إلى CAPA بالاستيراد، ومن سجل CAPA يبدأ التحليل هنا.", "Audit findings reach CAPA through its import, and the analysis here starts from the CAPA record."), "tool": "./smart-audit-improvement.html"},
        {"code": "ISO 9001", "n": B("نظام إدارة الجودة", "Quality management system"), "col": "#1B2A4A",
         "d": B("البند 10.2.1 ب) يطلب تحديد أسباب عدم المطابقة، ويُسأل عنه في كل تدقيق إشهاد.", "Clause 10.2.1 b) requires the causes of the nonconformity to be determined, and it is asked about in every certification audit."), "tool": "./iso9001.html"}
    ],
    "comp": [
        {"code": "ISO 9001:2026 §10.2.1 b)", "n": B("تقييم الحاجة إلى إجراء وتحديد الأسباب", "Evaluating the need for action and determining causes"),
         "d": B("المتطلب الذي تخدمه الطريقة: مراجعة عدم المطابقة، وتحديد أسبابها، والتحقق من الحالات المشابهة.", "The requirement the method serves: review the nonconformity, determine its causes and check for similar cases.")},
        {"code": "ISO 9001:2026 A.10.2", "n": B("مدى التحقيق والطرق المستخدمة", "Extent of investigation and methods used"),
         "d": B("الملحق يترك للمنشأة اختيار الطريقة ومدى التحقيق بحسب سياقها، ولا يسمّي طريقة بعينها.", "The annex leaves the method and the extent of investigation to the organization's context, and names no particular method.")},
        {"code": "ISO 9000:2026 §3.8.6 · §4.2.7", "n": B("الدليل الموضوعي واتخاذ القرار المبني على الدليل", "Objective evidence and evidence-based decision-making"),
         "d": B("الأساس الذي يجعل كل جواب في السلسلة قابلاً للتحقق.", "The basis that makes every answer in the chain verifiable.")}
    ],
    "buy": [],
    "buyNote": B("للنص الرسمي للمواصفات استخدم النسخ المنشورة من المنظمة الدولية للتوحيد القياسي، وليس هذه المنصة.",
                 "For the official text of the standards, use the copies published by the International Organization for Standardization, not this platform.")
}

texts = {
    "stdT": B("دليل المنهجية", "Method guide"),
    "stdS": B("كيف تُدار جلسة «لماذا الخمس»، ومن يحضرها، ومتى تتوقف، ومتى تفتح فرعاً، وكيف تختبر السبب.", "How to run a 5 Whys session, who should be there, when to stop, when to branch and how to test the cause."),
    "clT": B("دليل البنود", "Clause guide"),
    "clS": B("البنود التي تخدمها الطريقة، بأرقامها في ISO 9001:2026، وأولها 10.2.1 ب). لكل بند ملخص تفسيري ومثال وما يطلبه المدقق. قواعد الطريقة مرقّمة GD وهي إرشاد لا بنود. الأمثلة توضيحية وليست بيانات حقيقية.",
             "The clauses the method serves, numbered as in ISO 9001:2026, starting with 10.2.1 b). Each one has an interpretive summary, an example and what the auditor asks for. The method's rules are coded GD: guidance, not clauses. Examples are illustrative, not real data."),
    "note": B("ما يرد تحت «المتطلب» ملخص تفسيري بصياغة مستقلة، وليس النص الرسمي للمواصفة. وما تحت «كيف تطبقه» و«الفجوات» إرشاد تطبيقي. أرقام البنود وعناوينها متحقق منها من النصوص الرسمية المرفوعة.",
              "Text under “requirement” is an interpretive summary in independent wording, not the official text of the standard. “How to implement” and “common gaps” are practical guidance. Clause numbers and titles were checked against the uploaded official texts."),
    "chgT": B("ما الذي تغيّر", "What changed"),
    "chgS": B("", "")
}

phases = {
    "define": {"c": "#C2410C", "t": "#FDECE3", "n": B("تعريف المشكلة والفريق", "Define the problem and the team")},
    "ask": {"c": "#3563C9", "t": "#E7EEFB", "n": B("السؤال والدليل", "Ask and evidence")},
    "learn": {"c": "#3C9A5F", "t": "#E5F4EA", "n": B("التعلّم والتحسين", "Learn and improve")},
    "check": {"c": "#C9821A", "t": "#FCF1DE", "n": B("التحليل والتقييم", "Analysis and evaluation")}
}

S = []

S.append({"id": "10.2", "grp": "core", "ph": "ask", "col": "#3563C9", "tint": "#E7EEFB",
  "t": B("البند 10.2 عدم المطابقة والإجراء التصحيحي", "Clause 10.2 Nonconformity and corrective action"),
  "s": B("تحديد الأسباب", "Determining causes"), "sh": B("10.2 · تحديد الأسباب", "10.2 · Determining causes"),
  "p": B("هنا تعمل «لماذا الخمس»: البند 10.2.1 ب) يطلب مراجعة عدم المطابقة وتحديد أسبابها والتحقق من الحالات المشابهة، قبل اختيار الإجراء. وقواعد الطريقة (GD) إرشاد لكيفية فعل ذلك جيداً.",
         "This is where 5 Whys works: clause 10.2.1 b) asks for the nonconformity to be reviewed, its causes determined and similar cases checked, before the action is chosen. The method's rules (GD) are guidance on doing that well."),
  "fl": L(("راجِع", "Review"), ("اسأل لماذا", "Ask why"), ("اختبر", "Test"), ("عمّم", "Look wider"), ("انقل إلى CAPA", "Carry into CAPA")),
  "it": [
    IT("10.2.1 b 1", "PR1", B("راجِع عدم المطابقة واكتب المشكلة من الوقائع", "Review the nonconformity and write the problem from facts"),
       R(IS, "من خطوات تقييم الحاجة إلى إجراء يزيل السبب أن تُراجَع عدم المطابقة نفسها. وعدم المطابقة في ISO 9000:2026 (3.5.13) هي عدم استيفاء متطلب؛ فتُكتب كما وقعت: أي متطلب لم يُستوفَ، وأين، ومتى، وبأي حجم.",
         "one step in evaluating the need for action on the cause is reviewing the nonconformity itself. ISO 9000:2026 (3.5.13) describes a nonconformity as the non-fulfilment of a requirement, so it is written as it happened: which requirement was not met, where, when and to what extent."),
       R(EX, "«استُلمت شحنة حديد 38 طناً في مستودع المشروع يوم 2026-04-08 دون شهادات المصنع التي تشترطها المواصفات الفنية»، بدل «المورد أهمل الشهادات».",
         "“a 38-tonne steel delivery was received at the project store on 2026-04-08 without the mill certificates the specification requires”, instead of “the supplier neglected the certificates”."),
       L(("اكتب الأجزاء الأربعة: ماذا، وأين، ومتى، وكم", "Write the four parts: what, where, when and how much"),
         ("استخدم أرقاماً ومراجع (رقم الشحنة، رقم التقرير)", "Use numbers and references (delivery number, report number)"),
         ("لا تضع سبباً أو اتهاماً في تعريف المشكلة", "Put no cause and no blame in the problem statement")),
       L(("تعريف المشكلة بأجزائه الأربعة", "The problem statement in its four parts"), ("المرجع: NCR أو ملاحظة التدقيق أو الشكوى", "The reference: NCR, audit finding or complaint")),
       L(("مشكلة مكتوبة كرأي أو اتهام", "A problem written as an opinion or an accusation"), ("مشكلة بلا حجم أو تاريخ", "A problem with no size or date")),
       B("الميسّر", "Facilitator"), B("نسبة التحليلات بتعريف مشكلة مكتمل", "Share of analyses with a complete problem statement")),
    IT("10.2.1 b 2", "CH1", B("حدّد أسباب عدم المطابقة بالدليل", "Determine the causes of the nonconformity, with evidence"),
       R(IS, "يطلب البند تحديد أسباب عدم المطابقة. لا يسمّي طريقة، و«لماذا الخمس» إحدى الطرق الممكنة. وما يجعل الجواب سبباً لا رأياً هو الدليل الموضوعي، وهو في ISO 9000:2026 (3.8.6) بيانات تدعم وجود شيء أو صحته.",
         "the clause requires the causes of the nonconformity to be determined. It names no method, and 5 Whys is one possible way. What makes an answer a cause rather than an opinion is objective evidence, described in ISO 9000:2026 (3.8.6) as data supporting the existence or truth of something."),
       R(EX, "«لأن أمر الشراء لم يطلب الشهادات» — الدليل: أمر الشراء PO-2026-0331 لا يحتوي بند الشهادات. الحالة: متحقق منه.",
         "“because the purchase order did not ask for the certificates” — evidence: purchase order PO-2026-0331 has no certificate clause. Status: verified."),
       L(("اكتب الدليل بجانب كل جواب", "Write the evidence next to every answer"),
         ("صنّف الجواب: متحقق منه، أو يحتاج تحققاً، أو غير مدعوم", "Mark each answer verified, to check or not supported"),
         ("لا تعتمد سبباً جذرياً يقوم على جواب غير مدعوم", "Do not accept a root cause that rests on an unsupported answer")),
       L(("سلسلة لماذا بأدلتها", "The chain of whys with its evidence"), ("الوثائق والسجلات المشار إليها", "The documents and records referred to")),
       L(("أجوبة بلا دليل", "Answers with no evidence"), ("السبب يُختار قبل التحليل ثم تُكتب السلسلة لتبريره", "The cause chosen first, then the chain written to justify it")),
       B("الفريق بقيادة الميسّر", "The team, led by the facilitator"), B("نسبة الأجوبة المتحقق منها", "Share of answers verified")),
    IT("GD-1", "CH2", B("توقّف عند سبب تستطيع المنشأة تغييره", "Stop at a cause the organization can change"),
       R(GD, "الرقم خمسة قاعدة تقريبية. توقّف عندما يكون السبب شيئاً تملكه المنشأة (طريقة، أو نموذج، أو صلاحية، أو تصميم)، ويسنده الدليل، وإزالته توقف المشكلة. وإذا وصلت إلى ما لا تملكه (الطقس، أو قرار جهة خارجية) فارجع خطوة.",
         "five is a rule of thumb. Stop when the cause is something the organization owns (a method, a form, an authority, a design), the evidence supports it, and removing it stops the problem. If you reach something you do not own (the weather, an outside party's decision), step back one why."),
       R(EX, "تحليل الحديد توقف عند السؤال الرابع: نموذج أمر الشراء ومراجعته بيد المنشأة. السؤال الخامس كان سيعود إلى قرارات 2023 دون إجراء جديد.",
         "the steel analysis stopped at the fourth why: the purchase order form and its review are in the company's hands. A fifth why would have gone back to 2023 decisions with no new action."),
       L(("سجّل لماذا توقفت في كل سلسلة", "Record why you stopped in every chain"), ("إن توقفت قبل السؤال الثالث فاكتب السبب صراحة", "If you stop before the third why, say why explicitly")),
       L(("سبب التوقف مكتوباً", "The stop reason, written down"),),
       L(("التوقف عند العَرَض", "Stopping at the symptom"), ("الاستمرار حتى سبب خارج السيطرة", "Going on until the cause is out of control")),
       B("الميسّر", "Facilitator"), B("نسبة السلاسل بسبب توقف مكتوب", "Share of chains with a written stop reason")),
    IT("GD-2", "CH3", B("اسأل عن العملية لا عن الشخص", "Ask about the process, not the person"),
       R(GD, "«خطأ بشري» و«إهمال» وصف لما حدث وليس سبباً جذرياً. السؤال التالي دائماً: ما الذي في العملية سمح بالخطأ؟ نموذج غامض، أو فحص ثانٍ غائب، أو تدريب ناقص، أو عبء عمل، أو تصميم يسهّل الخطأ.",
         "“human error” and “negligence” describe what happened; they are not root causes. The next question is always what in the process allowed the mistake: an unclear form, a missing second check, incomplete training, workload, or a design that makes the error easy."),
       R(EX, "الجواب الأول كان «أمين المستودع لم ينتبه للشهادات». السؤال التالي: لماذا لم تكن الشهادات شرطاً في إجراء الاستلام؟ فظهر السبب في النموذج.",
         "the first answer was “the storekeeper did not notice the certificates”. The next question: why were certificates not a condition in the receiving procedure? The cause then showed in the form."),
       L(("أعد صياغة أي جواب يلوم شخصاً إلى سؤال عن العملية", "Turn any answer that blames a person into a question about the process"), ("احمِ من يتكلم بصراحة في الجلسة", "Protect people who speak openly in the session")),
       L(("سبب جذري لا يشير إلى شخص فقط", "A root cause that does not point at a person only"),),
       L(("سبب جذري «خطأ بشري» وإجراء «توعية»", "Root cause “human error” and action “awareness”"),),
       B("الميسّر", "Facilitator"), B("نسبة الأسباب التي تشير إلى شخص فقط", "Share of root causes that point at a person only")),
    IT("GD-3", "CH4", B("افتح فرعاً عندما تعمل أسباب مختلفة معاً", "Branch when different causes acted together"),
       R(GD, "سلسلة واحدة تناسب مشكلة لها مسار واحد. عندما يعمل سببان معاً، يُفتح فرع لكل منهما بأسئلته وأدلته، ثم يُكتب سبب جذري يجمعهما. وإذا كثرت الأسباب فطريقة Fishbone أنسب.",
         "one chain fits a problem with one path. When two causes acted together, each gets a branch with its own whys and evidence, and the root cause brings them together. When causes are many, Fishbone fits better."),
       R(EX, "رفض الخرسانة: السلسلة الرئيسية وصلت إلى غياب قاعدة الطقس الحار، وفرع «ماء الخلط» وصل إلى غياب شرط تعاقدي يلزم المورد بالتبريد.",
         "concrete rejections: the main chain reached the missing hot-weather rule, and the “mixing water” branch reached the missing contract clause on chilling."),
       L(("سمِّ كل فرع باسم السبب الموازي", "Name each branch after the parallel cause"), ("فرعان كحد أقصى في هذه الأداة", "Two branches at most in this tool")),
       L(("الفروع بأدلتها وسبب توقف كل منها", "The branches with their evidence and stop reasons"),),
       L(("سببان محشوران في جواب واحد", "Two causes squeezed into one answer"), ("إجراء يعالج سبباً واحداً فتتكرر المشكلة", "An action on one cause, so the problem recurs")),
       B("الميسّر", "Facilitator"), B("عدد التحليلات بفروع", "Analyses with branches")),
    IT("GD-4", "RT1", B("اختبر السبب الجذري قبل اعتماده", "Test the root cause before accepting it"),
       R(GD, "اختباران بسيطان: الأول «إذا أُزيل هذا السبب، هل تتوقف المشكلة؟»، والثاني قراءة السلسلة عكسياً من السبب إلى المشكلة بكلمة «لذلك». إذا لم تصح القراءة في خطوة، فالسلسلة فيها قفزة. ويؤكد مبدأ اتخاذ القرار المبني على الدليل في ISO 9000:2026 (4.2.7) أهمية فهم علاقة السبب بالنتيجة.",
         "two simple tests: first, “if this cause is removed, does the problem stop?”; second, read the chain back from the cause to the problem with “therefore”. If one step does not hold, the chain has a jump. The evidence-based decision-making principle in ISO 9000:2026 (4.2.7) stresses understanding cause and effect."),
       R(EX, "«لا يشترط النموذج الشهادات، لذلك لم يطلبها أمر الشراء، لذلك لم يرسلها المورد، لذلك استُلمت الشحنة دونها». كل خطوة صحيحة.",
         "“the form does not require certificates, therefore the purchase order did not ask for them, therefore the supplier did not send them, therefore the load was received without them.” Every step holds."),
       L(("اقرأ السلسلة عكسياً بصوت مسموع أمام الفريق", "Read the chain back aloud to the team"), ("إذا كانت إزالة السبب توقف المشكلة جزئياً فقط، فابحث عن فرع", "If removing the cause only partly stops the problem, look for a branch")),
       L(("نتيجة الاختبارين", "The result of both tests"),),
       L(("سبب جذري لا يُختبر", "A root cause that is never tested"), ("قفزة منطقية بين جوابين", "A logical jump between two answers")),
       B("الفريق والمراجِع", "Team and reviewer"), B("نسبة الأسباب الجذرية المختبرة", "Share of root causes tested")),
    IT("10.2.1 b 3", "RT2", B("تحقّق من الحالات المشابهة الموجودة أو المحتملة", "Check for similar nonconformities that exist or could occur"),
       R(IS, "من خطوات التقييم تحديد ما إذا كانت حالات مشابهة موجودة أو قد تحدث. والسبب الجذري يسهّل ذلك: إذا كان السبب في نموذج أو إجراء مشترك، فكل مكان يستخدمه معرّض.",
         "part of the evaluation is determining whether similar nonconformities exist or could potentially occur. The root cause makes this easier: if the cause is in a shared form or procedure, every place that uses it is exposed."),
       R(EX, "السبب في إجراء ضبط الوثائق المشترك، ففُحص الموقعان أ وج، ووُجدت نسختان ملغاتان في الموقع ج.",
         "the cause was in the shared document control procedure, so sites A and C were checked and two superseded copies were found on site C."),
       L(("اسأل: من يستخدم الطريقة أو النموذج نفسه؟", "Ask who else uses the same method or form"), ("سجّل أين فُحص وما النتيجة", "Record where you checked and what you found")),
       L(("نتيجة فحص المواقع أو العمليات المشابهة", "Result of the check on similar sites or processes"),),
       L(("إغلاق الحالة دون النظر خارج مكانها", "Closing the case without looking beyond where it happened"),),
       B("مسؤول الجودة", "Quality officer"), B("نسبة التحليلات التي فُحصت فيها الحالات المشابهة", "Share of analyses where similar cases were checked")),
    IT("10.2.1 c", "LK1", B("ابنِ الإجراء على السبب الجذري، ونفّذه من سجل CAPA", "Build the action on the root cause, and carry it out from the CAPA record"),
       R(IS, "بعد تحديد الأسباب تنفذ المنشأة أي إجراء لازم، وتكون الإجراءات التصحيحية مناسبة لآثار عدم المطابقة. والإجراء التصحيحي في ISO 9000:2026 (3.6.4) يزيل سبب عدم المطابقة ويمنع تكرارها؛ لذلك يُقرأ الإجراء مقابل السبب الجذري.",
         "once the causes are determined, the organization implements any action needed, and corrective actions are appropriate to the effects of the nonconformities. ISO 9000:2026 (3.6.4) describes corrective action as removing the cause and preventing recurrence, so the action is read against the root cause."),
       R(EX, "السبب: «النموذج لا يشترط الشهادات». الإجراء في سجل CA-EX-01: إضافة بند الشهادات إلى النموذج، بمالك وموعد.",
         "cause: “the form does not require certificates”. Action in record CA-EX-01: add the certificate clause to the form, with an owner and a date."),
       L(("انقل السبب الجذري إلى سجل CAPA بزر «استخدم هذا السبب الجذري»", "Carry the root cause into the CAPA record with “Use this root cause”"), ("لكل إجراء مقترح مالك هنا، وموعده في CAPA", "Each countermeasure has an owner here and a due date in CAPA")),
       L(("ربط التحليل برقم سجل CAPA", "The analysis linked to the CAPA record number"), ("الإجراء الذي يزيل السبب", "The action that removes the cause")),
       L(("إجراء لا علاقة له بالسبب الجذري", "An action unrelated to the root cause"), ("تحليل لا يصل إلى أي سجل إجراء", "An analysis that never reaches an action record")),
       B("مالك العملية", "Process owner"), B("نسبة التحليلات المرتبطة بسجل CAPA", "Share of analyses linked to a CAPA record")),
    IT("A.10.2", "x:tools", B("اختر مدى التحقيق بحسب الخطر والأثر", "Choose the extent of investigation by risk and impact"),
       R(IS, "يوضح الملحق A.10.2 أن المنشأة تحدد طريقة التعامل مع عدم المطابقة، ومنها مدى التحقيق والطرق المستخدمة، بحسب سياقها واحتياجاتها، مع مراعاة خطر التكرار والأثر الفعلي أو المحتمل ومتطلبات العملاء والأطراف المعنية عند تقرير الإجراء التصحيحي.",
         "Annex A.10.2 explains that the organization decides how to address nonconformities, including the extent of investigation and the methods used, based on its context and needs, considering the risk of recurrence, the actual or potential impact and the requirements of customers and other interested parties when deciding on corrective action."),
       R(EX, "خطأ إملائي في نموذج داخلي يُصحح دون تحليل. أما رفض الخرسانة المتكرر فيستحق تحليلاً بفرعين ومراجعة مستقلة.",
         "a typo in an internal form is corrected without analysis. Repeated concrete rejections deserve an analysis with two branches and an independent review."),
       L(("ضع قاعدة: متى يلزم تحليل لماذا الخمس، ومتى يكفي التصحيح", "Set a rule: when a 5 Whys is needed, and when correction is enough"),),
       L(("قاعدة اختيار الطريقة ومدى التحقيق", "The rule for choosing the method and the extent of investigation"),),
       L(("تحليل لكل شيء فلا يُحلل شيء جيداً", "An analysis for everything, so nothing is analysed well"), ("لا تحليل لمشكلة تكررت ووصلت للعميل", "No analysis of a repeated problem that reached the customer")),
       B("مدير الجودة", "Quality manager"), B("نسبة عدم المطابقة الرئيسية التي حُللت", "Share of major nonconformities analysed")),
    IT("10.2.2", "x:tools", B("احتفظ بالتحليل دليلاً", "Keep the analysis as evidence"),
       R(IS, "تُحفظ معلومات موثقة تبيّن طبيعة عدم المطابقة والإجراءات التي تلتها ونتائج الإجراء التصحيحي. والتحليل بسلسلته وأدلته جزء من هذا الدليل، ويطلبه المدقق عادةً.",
         "documented information is kept on the nature of the nonconformities, the actions that followed and the results of corrective action. The analysis, with its chain and evidence, is part of that evidence and auditors usually ask for it."),
       R(EX, "تقرير التحليل W5-EX-01 مرفق بسجل CA-EX-01 في نظام الوثائق.",
         "the report of analysis W5-EX-01 is filed with record CA-EX-01 in the document system."),
       L(("نزّل تقرير HTML واحفظه مع سجل CAPA", "Download the HTML report and file it with the CAPA record"),),
       L(("تقرير التحليل المرفق", "The filed analysis report"),),
       L(("تحليل شفهي في اجتماع دون سجل", "A spoken analysis in a meeting with no record"),),
       B("مسؤول الجودة", "Quality officer"), B("نسبة سجلات CAPA التي يرافقها تحليل محفوظ", "Share of CAPA records with a filed analysis"))
  ]})

S.append({"id": "7.2", "grp": "core", "ph": "define", "col": "#C2410C", "tint": "#FDECE3",
  "t": B("البند 7.2 الكفاءة", "Clause 7.2 Competence"),
  "s": B("الكفاءة", "Competence"), "sh": B("7.2 · الكفاءة", "7.2 · Competence"),
  "p": B("جودة التحليل من جودة من في الغرفة: ميسّر يعرف الطريقة، وشخص يعرف العمل كما يحدث فعلاً.",
         "An analysis is as good as the people in the room: a facilitator who knows the method, and someone who knows the work as it really happens."),
  "fl": L(("حدّد الكفاءة", "Set the competence"), ("اختر الفريق", "Pick the team"), ("درّب الميسّرين", "Train facilitators")),
  "it": [
    IT("7.2", "PR2", B("اختر فريقاً كفؤاً يضم من يؤدي العمل", "Pick a competent team that includes someone who does the work"),
       R(IS, "تحدد المنشأة الكفاءة اللازمة للأشخاص الذين يؤثر عملهم في أداء نظام الجودة، وتتأكد من كفاءتهم بالتعليم أو التدريب أو الخبرة، وتتخذ إجراءات لاكتسابها عند الحاجة، مع الاحتفاظ بدليل عليها. وتحليل الأسباب عمل يؤثر في الأداء، فيحتاج ميسّراً مدرباً وخبرة ميدانية.",
         "the organization determines the competence needed by people whose work affects quality system performance, makes sure they are competent through education, training or experience, acts to gain it where needed, and keeps evidence of it. Cause analysis is work that affects performance, so it needs a trained facilitator and field experience."),
       R(EX, "في تحليل الحديد حضر أمين المستودع الذي يستلم المواد يومياً، وهو من بيّن أن النموذج لا يذكر الشهادات.",
         "in the steel analysis the storekeeper who receives materials every day took part; he was the one who showed the form never mentions certificates."),
       L(("ضع في كل فريق شخصاً واحداً على الأقل يؤدي العمل نفسه", "Put at least one person who does the work in every team"), ("درّب ميسّرين على الطريقة واحفظ سجل التدريب", "Train facilitators in the method and keep the training record")),
       L(("قائمة الفريق وأدوارهم", "The team list and roles"), ("سجل تدريب الميسّرين", "Facilitator training records")),
       L(("فريق من المكتب فقط", "A team from the office only"), ("ميسّر يجيب بدل الفريق", "A facilitator who answers for the team")),
       B("مدير الجودة", "Quality manager"), B("نسبة التحليلات التي ضمّت من يؤدي العمل", "Share of analyses that included someone doing the work"))
  ]})

S.append({"id": "7.1.6", "grp": "core", "ph": "learn", "col": "#3C9A5F", "tint": "#E5F4EA",
  "t": B("البند 7.1.6 المعرفة التنظيمية", "Clause 7.1.6 Organizational knowledge"),
  "s": B("المعرفة التنظيمية", "Organizational knowledge"), "sh": B("7.1.6 · المعرفة", "7.1.6 · Knowledge"),
  "p": B("كل تحليل جيد درس يمكن أن يمنع المشكلة في موقع آخر، إذا حُفظ وشورك.",
         "Every good analysis is a lesson that can prevent the problem elsewhere, if it is kept and shared."),
  "fl": L(("تعلّم", "Learn"), ("احفظ", "Keep"), ("شارك", "Share")),
  "it": [
    IT("7.1.6", "LK2", B("احفظ ما تعلمته وشاركه", "Keep and share what you learned"),
       R(IS, "تحدد المنشأة المعرفة اللازمة لتشغيل عملياتها وتحقيق نتائج نظام الجودة، وتحتفظ بها وتطبقها وتشاركها بالقدر اللازم. ومن أشكالها المعرفة المكتسبة من الخبرة والمعرفة المضمّنة في الطرق والعمليات.",
         "the organization determines the knowledge needed to operate its processes and achieve quality system results, and retains, applies and shares it to the extent necessary. Its forms include knowledge gained from experience and knowledge built into methods and processes."),
       R(EX, "نُشر ملخص تحليل الخرسانة (الفرعان والسبب الجذري) لمديري المشروعين الآخرين قبل صيف 2027.",
         "a summary of the concrete analysis (both branches and the root cause) was sent to the managers of the other two projects before summer 2027."),
       L(("انشر ملخصاً من صفحة واحدة لكل تحليل مراجَع", "Share a one-page summary of every reviewed analysis"), ("اجعل السبب الجذري جزءاً من الطريقة أو النموذج المعدّل", "Make the root cause part of the revised method or form")),
       L(("ملخصات التحليلات المنشورة", "The shared analysis summaries"),),
       L(("الدرس يبقى في رأس من حضر", "The lesson stays in the heads of those who attended"),),
       B("مدير الجودة", "Quality manager"), B("عدد ملخصات التحليل المنشورة", "Analysis summaries shared"))
  ]})

S.append({"id": "9.1.3", "grp": "core", "ph": "check", "col": "#C9821A", "tint": "#FCF1DE",
  "t": B("البند 9.1.3 التحليل والتقييم", "Clause 9.1.3 Analysis and evaluation"),
  "s": B("التحليل والتقييم", "Analysis"), "sh": B("9.1.3 · التحليل", "9.1.3 · Analysis"),
  "p": B("البيانات تختار أين يُطبق «لماذا الخمس»: المشكلة المتكررة أو الأعلى أثراً أولاً.",
         "Data chooses where to apply 5 Whys: the repeated problem, or the one with the most impact, first."),
  "fl": L(("بيانات", "Data"), ("أولوية", "Priority"), ("تحليل", "Analysis")),
  "it": [
    IT("9.1.3", "x:tools", B("استخدم البيانات لاختيار ما يُحلَّل", "Use data to choose what to analyse"),
       R(IS, "تحلل المنشأة البيانات والمعلومات الناتجة عن الرصد والقياس وتقيّمها، وتستخدم النتائج لتقييم أمور منها مطابقة المنتجات والخدمات وأداء النظام وأداء الموردين والحاجة إلى التحسين. وهذه النتائج تبيّن أي المشكلات تستحق تحليلاً أعمق.",
         "the organization analyses and evaluates data and information from monitoring and measurement, and uses the results to evaluate, among other things, product and service conformity, system performance, external provider performance and the need for improvement. These results show which problems deserve a deeper analysis."),
       R(EX, "سجل الاستلام أظهر أن الخرسانة أعلى أسباب الرفض في الربع الثاني، فبدأ بها التحليل.",
         "the delivery log showed concrete was the top reason for rejection in the second quarter, so the analysis started there."),
       L(("رتّب المشكلات بحسب التكرار والأثر قبل اختيار ما يُحلل", "Rank problems by frequency and impact before choosing what to analyse"),),
       L(("بيانات الاختيار (سجل أو مؤشر)", "The data behind the choice (a log or a KPI)"),),
       L(("تحليل ما يلفت الانتباه لا ما تقوله البيانات", "Analysing what catches attention, not what the data says"),),
       B("مسؤول الجودة", "Quality officer"), B("نسبة التحليلات التي بدأت من بيانات", "Share of analyses that started from data"))
  ]})

S.append({"id": "10.1", "grp": "core", "ph": "learn", "col": "#1E8C93", "tint": "#E3F4F4",
  "t": B("البند 10.1 التحسين المستمر", "Clause 10.1 Continual improvement"),
  "s": B("التحسين المستمر", "Continual improvement"), "sh": B("10.1 · التحسين", "10.1 · Improvement"),
  "p": B("التحليل الذي يغيّر طريقة أو نموذجاً يحسّن النظام، لا الحالة وحدها.",
         "An analysis that changes a method or a form improves the system, not only the case."),
  "fl": L(("سبب", "Cause"), ("تغيير", "Change"), ("تحسين", "Improvement")),
  "it": [
    IT("10.1 c", "x:tools", B("اجعل السبب الجذري مدخلاً للتحسين", "Make the root cause an input to improvement"),
       R(IS, "تحسّن المنشأة باستمرار ملاءمة نظام الجودة وكفايته وفعاليته، ومن إجراءات التحسين تصحيح الآثار غير المرغوبة أو منعها أو تقليلها. ويذكر مبدأ التحسين في ISO 9000:2026 (4.2.6) من فوائده تركيزاً أكبر على التحقق من السبب الجذري وتحديده.",
         "the organization continually improves the suitability, adequacy and effectiveness of its quality system, and improvement actions include correcting, preventing or reducing undesired effects. The improvement principle in ISO 9000:2026 (4.2.6) names a sharper focus on root cause investigation among its benefits."),
       R(EX, "قاعدة الطقس الحار في إجراء الصب أصبحت جزءاً من النظام في كل المشاريع، لا في المشروع الذي وقعت فيه المشكلة فقط.",
         "the hot-weather pour rule became part of the system on every project, not only on the project where the problem happened."),
       L(("اسأل بعد كل تحليل: هل يستحق السبب تغييراً في النظام كله؟", "After every analysis, ask whether the cause deserves a change across the system"), ("افتح دورة PDCA عندما يحتاج التغيير قياساً على مراحل", "Open a PDCA cycle when the change needs measuring in stages")),
       L(("التغيير في النظام ومرجعه في التحليل", "The system change and its reference in the analysis"),),
       L(("السبب يُعالج في مكان واحد فقط", "The cause fixed in one place only"),),
       B("الإدارة العليا", "Top management"), B("عدد التغييرات في النظام الناتجة عن التحليلات", "System changes triggered by analyses"))
  ]})

legend = [[p["c"], p["n"]] for p in phases.values()]

DATA = {
    "meta": meta, "std": std, "texts": texts, "phases": phases, "flags": {}, "legend": legend,
    "diagram": {"type": "cycle", "centre": B("لماذا الخمس", "5 Whys")},
    "matrix": {"tab": "", "d": B("", ""), "btn": B("", "")},
    "sections": S, "paths": [],
    "edges": [["10.2.1 b 1", "10.2.1 b 2"], ["7.2", "10.2.1 b 2"], ["10.2.1 b 2", "GD-1"], ["10.2.1 b 2", "GD-2"], ["10.2.1 b 2", "GD-3"],
              ["GD-1", "GD-4"], ["GD-3", "GD-4"], ["GD-4", "10.2.1 b 3"], ["GD-4", "10.2.1 c"], ["10.2.1 c", "10.2.2"], ["10.2.1 c", "7.1.6"],
              ["9.1.3", "A.10.2"], ["A.10.2", "10.2.1 b 1"], ["7.1.6", "10.1 c"]],
    "changes": {"note": B("", ""), "tlT": B("", ""), "tlS": B("", ""), "tlCols": 4, "tl": [], "cardsT": B("", ""), "cardsS": B("", ""), "cards": [],
                "corr": {"t": B("", ""), "s": B("", ""), "h": [], "rows": []}, "steps": {"t": B("", ""), "s": B("", ""), "l": B("", "")}},
    "ui": {
        "ar": {"roles": "من يحضر الجلسة", "wheelT": "عجلة البنود", "purpose": "الغرض من الأداة", "smap": "خطوات تحليل لماذا الخمس",
               "smapSub": "كل خطوة في سطر. اضغط «اشرح» لفتح البند أو القاعدة التي تخدمها.", "rel": "علاقتها بأدوات المنصة", "comp": "المراجع المساندة",
               "assess": "قيّم هذا في التقييم الذاتي", "assessC": "قيّم هذا في التقييم الذاتي",
               "assessOff": "هذا البند خارج أسئلة التقييم الذاتي، ويُطبَّق مباشرة في تحليل لماذا الخمس.", "offGo": "افتح تحليل لماذا الخمس",
               "actCtx": "يفتح السؤال {s}", "explainA": "اشرح {c} في دليل البنود"},
        "en": {"roles": "Who is in the session", "wheelT": "Clause wheel", "purpose": "What the tool is for", "smap": "Steps of a 5 Whys analysis",
               "smapSub": "One line per step. Select “Explain” to open the clause or rule it serves.", "rel": "How it connects to the platform's tools", "comp": "Supporting references",
               "assess": "Assess this in the self-assessment", "assessC": "Assess this in the self-assessment",
               "assessOff": "This clause is outside the self-assessment questions; it is applied directly in the 5 Whys analysis.", "offGo": "Open the 5 Whys analysis",
               "actCtx": "Opens question {s}", "explainA": "Explain {c} in the clause guide"}
    }
}

if __name__ == "__main__":
    js = ("/* 5 Whys explanation data for the CIA Explain Kit v1.4. 5 Whys is a method, not a clause. Clause numbers and titles checked on\n"
          "   2026-10-11 against the uploaded ISO 9001:2026 and ISO 9000:2026 texts. Requirements are interpretive\n"
          "   summaries, not the official text. */\n"
          "const EXPLAIN_WHY5=" + json.dumps(DATA, ensure_ascii=False, indent=1) + ";\n")
    sys.stdout.write(js)
