"""EXPLAIN_PARETO — data for the CIA Explain Kit v1.4 in modules/pareto.html (build step 2026-10-11, Pareto).
Pareto analysis (the Pareto chart, the 80/20 rule) is a method, not a clause of any standard. The clause guide is built on the
ISO 9001:2026 clauses the method serves. Clause numbers and titles checked on 2026-10-11 against the uploaded official texts only:
  ISO 9001:2026 (ISO_9001_2026en 1.pdf) — 7.1.6 Organizational knowledge, 9.1.3 Analysis and evaluation (a)–h), and its NOTE:
                                           methods to analyse data can include statistical techniques),
                                           9.3.2 Management review inputs (d) 1) trends in nonconformities and corrective actions,
                                           d) 3) audit results), 10.1 Continual improvement, 10.2.1 b) 2) and 3),
                                           Annex A.9.1 (notes 3 and 4 name ISO 10009 and ISO 10017, which are not uploaded:
                                           "not verified"), Annex A.10.2
  ISO 9000:2026 (ISO 9000-2026.pdf; scanned, read by OCR)
                                         — 3.8.1 data, 3.8.2 dashboard (its EXAMPLE names Pareto charts), 3.8.3 statistical
                                           technique, 3.8.6 objective evidence, 4.2.7 Evidence-based decision-making
                                           (4.2.7.2 rationale, 4.2.7.4 possible actions)
No text of a standard is reproduced: every "requirement" is an interpretive summary in independent wording.
Items coded GD-n are the author's practical guidance on the method, not clauses. Usage: python3 data_pareto.py > explain_pareto.js"""
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
    "code": "Pareto",
    "name": B("باريتو — تحليل القلة الحيوية", "Pareto — Vital few analysis"),
    "edition": B("أداة منهجية تخدم ISO 9001:2026 البندين 9.1.3 و10.2.1 ب)", "Method tool serving ISO 9001:2026 clauses 9.1.3 and 10.2.1 b)"),
    "status": B("الأداة الخامسة في صندوق أدوات التحسين المستمر", "Fifth tool in the Continual Improvement Toolbox"),
    "cert": False,
    "certNote": B("تحليل باريتو (مخطط باريتو وقاعدة 80/20) طريقة لترتيب الفئات بحسب حجم إسهامها، وليس مواصفة ولا متطلباً. المتطلبات التي يخدمها هي تحليل البيانات وتقييمها في البند 9.1.3 من ISO 9001:2026، واختيار المكان الذي تُحدَّد فيه أسباب عدم المطابقة ضمن 10.2.1 ب) 2)، ويُدقَّق عليها ضمن نظام إدارة الجودة.",
                  "Pareto analysis (the Pareto chart and the 80/20 rule) is a way of ranking categories by how much they contribute, not a standard or a requirement. The requirements it serves are analysing and evaluating data in ISO 9001:2026 clause 9.1.3 and choosing where to determine the causes of nonconformities within 10.2.1 b) 2), all audited as part of the quality management system."),
    "verified": B("2026-10-11، من الملفات الرسمية المرفوعة إلى المشروع: ISO_9001_2026en 1.pdf وISO 9000-2026.pdf (ملف ممسوح ضوئياً، قُرئ بالتعرف الضوئي على النص). كل «متطلب» ملخص تفسيري، وليس النص الرسمي. ISO 10009 وISO 10017 غير مرفوعين: «غير متحقق منه».",
                  "2026-10-11, against the official files uploaded to the project: ISO_9001_2026en 1.pdf and ISO 9000-2026.pdf (a scanned file, read with OCR). Every “requirement” is an interpretive summary, not the official text. ISO 10009 and ISO 10017 are not uploaded: “not verified”.")
}

std = {
    "purpose": B("أن تجيب عن سؤال واحد بالبيانات: أي الفئات تصنع معظم المشكلة؟ فيذهب جهد التحليل والإجراء إلى القلة الحيوية بدل توزيعه على كل شيء، ثم يُقاس الأثر على الأساس نفسه بعد الإجراء.",
                 "To answer one question with data: which categories make up most of the problem? Analysis and action then go to the vital few instead of being spread over everything, and the effect is measured on the same basis after the action."),
    "who": B("مديرو الجودة والسلامة والبيئة، ومهندسو الجودة، ومالكو العمليات، ومديرو المشاريع، والمدققون الداخليون، ومن يعدّ مدخلات مراجعة الإدارة، وكل من يملك سجلاً لعدم المطابقة أو الشكاوى أو الحوادث أو الملاحظات.",
             "Quality, HSE and environment managers, quality engineers, process owners, project managers, internal auditors, whoever prepares management review inputs, and anyone who holds a log of nonconformities, complaints, incidents or findings."),
    "rolesSub": B("المخطط يُبنى بسرعة؛ ما يجعله صادقاً هو من يعرّف الفئات ويصنّف البيانات ويحكم على النتيجة. هذا توزيع مقترح للأدوار.",
                  "The chart is quick to build; what makes it honest is who defines the categories, classifies the data and judges the result. This is a suggested split of roles."),
    "roles": [
        {"n": B("مالك البيانات", "Data owner"), "col": "#3563C9", "d": B("يملك السجل الذي تأتي منه البيانات، ويعرف ما يُسجَّل فيه وما لا يُسجَّل والفترة التي يغطيها.", "Owns the log the data comes from, and knows what is and is not recorded in it and the period it covers.")},
        {"n": B("من يصنّف", "Classifier"), "col": "#C2410C", "d": B("يضع كل بند في فئته بحسب التعريف المكتوب؛ وإذا تردد فالتعريف يحتاج تعديلاً.", "Puts each item in its category by the written definition; if they hesitate, the definition needs fixing.")},
        {"n": B("الميسّر", "Facilitator"), "col": "#1E8C93", "d": B("يكتب السؤال قبل البيانات، ويختار الوحدة مع الفريق، ويقود تأكيد القلة الحيوية بالحكم لا بالخط وحده.", "Writes the question before the data, chooses the unit with the team, and leads the confirmation of the vital few by judgement, not by the line alone.")},
        {"n": B("مالك العملية", "Process owner"), "col": "#1B2A4A", "d": B("يأخذ الفئة الحيوية إلى تحليل السبب أو إلى سجل CAPA، ويملك الإجراء بعد ذلك.", "Takes the vital-few category to cause analysis or a CAPA record, and owns the action afterwards.")},
        {"n": B("المراجِع", "Reviewer"), "col": "#3C9A5F", "d": B("شخص من خارج الفريق يتأكد أن قبل وبعد على الأساس نفسه، وأن الحكم يطابق الأرقام.", "Someone outside the team who checks that before and after are on the same basis and that the verdict matches the figures.")},
        {"n": B("الإدارة العليا", "Top management"), "col": "#B8901E", "d": B("ترى المخطط في مراجعة الإدارة اتجاهاً، وتقرر أين يذهب جهد التحسين.", "Sees the chart in management review as a trend, and decides where improvement effort goes.")}
    ],
    "map": [
        {"no": "1", "t": B("اكتب السؤال قبل البيانات", "Write the question before the data"), "d": B("ماذا، وأين، وأي فترة، وأي وحدة.", "What, where, which period and which unit."), "go": "9.1.3"},
        {"no": "2", "t": B("عرّف كل فئة في سطر", "Define each category in one line"), "d": B("بحيث يصنّف شخصان البند نفسه في الفئة نفسها.", "So that two people classify the same item the same way."), "go": "GD-1"},
        {"no": "3", "t": B("اختر الفترة وكمية البيانات", "Choose the period and the amount of data"), "d": B("فترة تمثّل العمل، لا أسبوعاً سيئاً واحداً.", "A period that represents the work, not one bad week."), "go": "GD-2"},
        {"no": "4", "t": B("اختر الوحدة", "Choose the unit"), "d": B("العدد، أو التكلفة، أو الوقت، أو الخطورة؛ والترتيب قد يتغير.", "Count, cost, time or severity; the order may change."), "go": "GD-3"},
        {"no": "5", "t": B("أبقِ «أخرى» صغيرة", "Keep “Other” small"), "d": B("أصغر من أصغر فئة مسماة، وإلا فقسّمها.", "Smaller than the smallest named category, or split it."), "go": "GD-4"},
        {"no": "6", "t": B("اقرأ المخطط وخط القطع", "Read the chart and the cut-off line"), "d": B("80/20 قاعدة تقريبية، والفريق يؤكد القلة الحيوية بحكمه.", "80/20 is a rule of thumb; the team confirms the vital few with judgement."), "go": "GD-6"},
        {"no": "7", "t": B("قسّم الفئة المختلطة", "Split a mixed category"), "d": B("بحسب الموقع أو الوردية أو المورد أو المنتج.", "By site, shift, supplier or product."), "go": "GD-5"},
        {"no": "8", "t": B("انقل كل فئة حيوية إلى تحليل السبب", "Move each vital-few category to cause analysis"), "d": B("عظمة السمكة أو لماذا الخمس أو البيانات أو سجل CAPA؛ الفئة مكان تحفر فيه، وليست سبباً.", "Fishbone, 5 Whys, data or a CAPA record; the category is where to dig, not a cause."), "go": "10.2.1 b 2"},
        {"no": "9", "t": B("تحقق من الأثر قبل وبعد", "Check the effect before and after"), "d": B("الفئات نفسها، والوحدة نفسها، وفترة بالطول نفسه.", "Same categories, same unit, a period of the same length."), "go": "10.1"},
        {"no": "10", "t": B("اعرض المخطط في مراجعة الإدارة", "Show the chart in management review"), "d": B("اتجاه عدم المطابقة والملاحظات، لا رقماً واحداً.", "The trend of nonconformities and findings, not a single number."), "go": "9.3.2 d"}
    ],
    "rel": [
        {"code": "CAPA", "n": B("الإجراءات التصحيحية", "Corrective action"), "col": "#C2410C",
         "d": B("سجلات CAPA تُعدّ هنا بحسب المصدر أو الدرجة أو العملية أو طريقة التحليل، والفئة الحيوية تُربط بسجل CAPA؛ والقراءة في الاتجاهين دون كتابة في بيانات الأداة الأخرى.", "CAPA records are counted here by source, grade, process or analysis method, and a vital-few category is linked to a CAPA record; both directions read only, with no writing into the other tool's data."), "tool": "./capa.html"},
        {"code": "Fishbone", "n": B("عظمة السمكة — تحليل السبب والنتيجة", "Fishbone — cause and effect analysis"), "col": "#1E8C93",
         "d": B("الفئة الحيوية تفتح تحليل عظمة سمكة والأثر معبأ منها؛ وأسباب عظمة السمكة يمكن عدّها هنا بحسب العظمة أو الأصوات.", "A vital-few category opens a Fishbone analysis with the effect filled in from it; Fishbone causes can be counted here by bone or by votes."), "tool": "./fishbone.html"},
        {"code": "5 Whys", "n": B("لماذا الخمس — تحليل السبب الجذري", "5 Whys — root cause analysis"), "col": "#3563C9",
         "d": B("عندما يكون للفئة مسار واحد واضح، تكفيها سلسلة لماذا الخمس، ويُسجَّل رقم التحليل هنا.", "When a category has one clear path, a 5 Whys chain is enough, and its id is written here."), "tool": "./five-whys.html"},
        {"code": "AUDIT", "n": B("مركز التدقيق والتحسين الذكي", "Smart audit & improvement center"), "col": "#C9821A",
         "d": B("ملاحظات التدقيق تُعدّ هنا بحسب البند أو الإدارة، فيظهر أين تتكرر الملاحظات.", "Audit findings are counted here by clause or department, so you see where findings repeat."), "tool": "./smart-audit-improvement.html"}
    ],
    "comp": [
        {"code": "ISO 9001:2026 §9.1.3", "n": B("التحليل والتقييم", "Analysis and evaluation"),
         "d": B("المتطلب الذي تخدمه الطريقة: تحليل بيانات الرصد والقياس وتقييمها؛ وتذكر الملاحظة أن طرق التحليل قد تشمل الأساليب الإحصائية.", "The requirement the method serves: analysing and evaluating monitoring and measurement data; the note says analysis methods can include statistical techniques.")},
        {"code": "ISO 9001:2026 §10.2.1 b)", "n": B("تحديد أسباب عدم المطابقة", "Determining the causes of nonconformities"),
         "d": B("باريتو يختار أين تبدأ تحديد الأسباب؛ ويترك الملحق A.10.2 مدى التحقيق للمنشأة.", "Pareto chooses where to start determining causes; Annex A.10.2 leaves the extent of investigation to the organization.")},
        {"code": "ISO 9000:2026 §3.8.2", "n": B("لوحة المؤشرات", "Dashboard"),
         "d": B("يذكر مثال المصطلح مخططات باريتو بين طرق عرض الأداء واتجاهات النتائج.", "The term's example names Pareto charts among the ways of displaying performance and trends of results.")},
        {"code": "ISO 9000:2026 §3.8.3 · §4.2.7", "n": B("الأسلوب الإحصائي واتخاذ القرار المبني على الدليل", "Statistical technique and evidence-based decision-making"),
         "d": B("الأسلوب الإحصائي يحلل بيانات كمية مرتبطة بالتباين، والمبدأ 4.2.7 يربط القرار الجيد بتحليل البيانات وتقييمها بطرق مناسبة.", "A statistical technique analyses quantitative data associated with variation, and principle 4.2.7 ties good decisions to analysing and evaluating data with suitable methods.")},
        {"code": "ISO 10009 · ISO 10017", "n": B("أدوات الجودة والأساليب الإحصائية (غير متحقق منه)", "Quality tools and statistical techniques (not verified)"),
         "d": B("تشير ملاحظتا الملحق A.9.1 في ISO 9001:2026 إلى هذين الدليلين. لم يُرفعا إلى المشروع، فمحتواهما «غير متحقق منه» هنا.", "Notes 3 and 4 of Annex A.9.1 in ISO 9001:2026 point to these two guides. They are not uploaded to the project, so their content is “not verified” here.")}
    ],
    "buy": [],
    "buyNote": B("للنص الرسمي للمواصفات استخدم النسخ المنشورة من المنظمة الدولية للتوحيد القياسي، وليس هذه المنصة.",
                 "For the official text of the standards, use the copies published by the International Organization for Standardization, not this platform.")
}

texts = {
    "stdT": B("دليل المنهجية", "Method guide"),
    "stdS": B("كيف يُبنى مخطط باريتو صادق: السؤال قبل البيانات، وتعريف الفئات، والفترة والوحدة، و«أخرى»، وقراءة خط القطع، والتقسيم الطبقي، والانتقال إلى تحليل السبب، والتحقق قبل وبعد.", "How to build an honest Pareto chart: the question before the data, category definitions, period and unit, “Other”, reading the cut-off line, stratification, moving on to cause analysis, and the before/after check."),
    "clT": B("دليل البنود", "Clause guide"),
    "clS": B("البنود التي تخدمها الطريقة، بأرقامها في ISO 9001:2026، وأولها 9.1.3 و10.2.1 ب). لكل بند ملخص تفسيري ومثال وما يطلبه المدقق. قواعد الطريقة مرقّمة GD وهي إرشاد لا بنود. الأمثلة توضيحية وليست بيانات حقيقية.",
             "The clauses the method serves, numbered as in ISO 9001:2026, starting with 9.1.3 and 10.2.1 b). Each one has an interpretive summary, an example and what the auditor asks for. The method's rules are coded GD: guidance, not clauses. Examples are illustrative, not real data."),
    "note": B("ما يرد تحت «المتطلب» ملخص تفسيري بصياغة مستقلة، وليس النص الرسمي للمواصفة. وما تحت «كيف تطبقه» و«الفجوات» إرشاد تطبيقي. أرقام البنود وعناوينها متحقق منها من النصوص الرسمية المرفوعة.",
              "Text under “requirement” is an interpretive summary in independent wording, not the official text of the standard. “How to implement” and “common gaps” are practical guidance. Clause numbers and titles were checked against the uploaded official texts."),
    "chgT": B("ما الذي تغيّر", "What changed"),
    "chgS": B("", "")
}

phases = {
    "data": {"c": "#3563C9", "t": "#E7EEFB", "n": B("البيانات والترتيب", "Data and ranking")},
    "act": {"c": "#1E8C93", "t": "#E3F4F4", "n": B("من الفئة إلى السبب", "From category to cause")},
    "review": {"c": "#B8901E", "t": "#FCF1DE", "n": B("المراجعة والاتجاه", "Review and trend")},
    "learn": {"c": "#3C9A5F", "t": "#E5F4EA", "n": B("التحسين والتعلّم", "Improve and learn")}
}

S = []

S.append({"id": "9.1.3", "grp": "core", "ph": "data", "col": "#3563C9", "tint": "#E7EEFB",
  "t": B("البند 9.1.3 التحليل والتقييم", "Clause 9.1.3 Analysis and evaluation"),
  "s": B("تحليل البيانات وتقييمها", "Analysing and evaluating data"), "sh": B("9.1.3 · التحليل", "9.1.3 · Analysis"),
  "p": B("هنا يعمل باريتو: البند 9.1.3 يطلب تحليل البيانات الناتجة عن الرصد والقياس وتقييمها واستخدام النتائج، وتذكر ملاحظته الأساليب الإحصائية. وقواعد الطريقة (GD) إرشاد لبناء مخطط يجيب فعلاً عن السؤال.",
         "This is where Pareto works: clause 9.1.3 asks for data from monitoring and measurement to be analysed and evaluated and the results used, and its note names statistical techniques. The method's rules (GD) are guidance on building a chart that really answers the question."),
  "fl": L(("السؤال", "Question"), ("التعريفات", "Definitions"), ("الفترة والوحدة", "Period and unit"), ("«أخرى»", "“Other”"), ("خط القطع", "Cut-off"), ("التقسيم", "Stratify")),
  "it": [
    IT("9.1.3", "QD1", B("حلّل بيانات الرصد والقياس وقيّمها: ابدأ بسؤال", "Analyse and evaluate monitoring and measurement data: start with a question"),
       R(IS, "تحلل المنشأة البيانات والمعلومات الناتجة عن الرصد والقياس وتقيّمها، وتستخدم النتائج لتقييم أمور منها مطابقة المنتجات والخدمات، ورضا العملاء، وأداء النظام وفعاليته، وأداء الموردين، والحاجة إلى التحسين. وتذكر الملاحظة في البند أن طرق التحليل قد تشمل الأساليب الإحصائية. ومخطط باريتو أحد هذه الطرق، ويبدأ بسؤال يحدد ما يُقيَّم.",
         "the organization analyses and evaluates data and information from monitoring and measurement, and uses the results to evaluate, among other things, product and service conformity, customer satisfaction, system performance and effectiveness, external provider performance and the need for improvement. The clause's note says analysis methods can include statistical techniques. The Pareto chart is one of them, and it starts with a question that sets what is being evaluated."),
       R(EX, "«أي فئات عدم المطابقة تصنع معظم تقارير NCR في مشاريع الشركة من يناير إلى سبتمبر 2026؟» بدل «لنرَ ما في سجل NCR».",
         "“Which nonconformity categories make up most of the NCRs on the company's projects from January to September 2026?” instead of “let's see what is in the NCR log”."),
       L(("اكتب السؤال في سطر: ماذا، وأين، وأي فترة، وأي وحدة", "Write the question in one line: what, where, which period, which unit"),
         ("سؤال واحد لكل مخطط؛ سؤالان يحتاجان مخططين", "One question per chart; two questions need two charts"),
         ("اكتب مصدر البيانات ومالكها", "Write the data source and its owner")),
       L(("السؤال مكتوباً فوق المخطط", "The question written above the chart"), ("مصدر البيانات والفترة", "The data source and the period")),
       L(("مخطط بلا سؤال يُعرض لأن البيانات متاحة", "A chart with no question, shown because the data was there"), ("أعمدة لا يعرف أحد ماذا تعدّ", "Bars nobody can say what they count")),
       B("الميسّر", "Facilitator"), B("نسبة المخططات التي يسبقها سؤال مكتوب", "Share of charts with a written question")),
    IT("GD-1", "QD2", B("عرّف كل فئة في سطر", "Define each category in one line"),
       R(GD, "المخطط لا يكون أفضل من تعريفات فئاته. اكتب لكل فئة سطراً يجعل شخصين يضعان البند نفسه في الفئة نفسها، ولا تترك فئتين تتداخلان. وإذا تردد من يصنّف في بند، فالتعريف يحتاج تعديلاً لا البند.",
         "a chart is only as good as its category definitions. Write one line for each category so that two people would put the same item in the same category, and do not let two categories overlap. If the person classifying hesitates over an item, fix the definition, not the item."),
       R(EX, "«خرسانة جاهزة مرفوضة عند الاستلام: شحنة رُفضت عند نقطة الاستلام لخروج الهبوط أو الحرارة أو زمن الخلط عن الحدود»؛ فلا تُحسب هنا خرسانة رُفضت بعد الصب.",
         "“Ready-mix concrete rejected at delivery: a load rejected at the receiving point because slump, temperature or time since batching was out of limits”; concrete rejected after the pour is not counted here."),
       L(("اكتب التعريف قبل التصنيف", "Write the definition before classifying"), ("جرّب التعريف على عشرة بنود مع شخصين", "Try the definition on ten items with two people")),
       L(("تعريف مكتوب لكل فئة", "A written definition for every category"),),
       L(("فئات بأسماء عامة مثل «جودة» أو «أخرى»", "Categories with general names such as “quality” or “miscellaneous”"), ("فئتان تتداخلان فيُحسب البند مرتين", "Two overlapping categories, so an item is counted twice")),
       B("من يصنّف", "Classifier"), B("نسبة الفئات المعرّفة", "Share of categories with a definition")),
    IT("GD-2", "DT1", B("اختر فترة تمثّل العمل وبيانات كافية", "Choose a representative period and enough data"),
       R(GD, "فترة قصيرة أو أسبوع سيئ واحد يرسم مخططاً يتغير في الأسبوع التالي. اختر فترة تغطي دورة العمل (موسم، أو مرحلة مشروع، أو ربعاً كاملاً)، واكتبها على المخطط. وعندما تكون البنود قليلة جداً، فاقرأ الترتيب بحذر.",
         "a short period or one bad week draws a chart that changes the following week. Choose a period that covers the work cycle (a season, a project phase or a full quarter), and write it on the chart. When there are very few items, read the order with care."),
       R(EX, "تسعة أشهر من سجل NCR (71 تقريراً) بدل شهر واحد كان فيه حادث خرسانة واحد كبير.",
         "nine months of the NCR log (71 reports) instead of one month in which a single large concrete incident happened."),
       L(("اكتب بداية الفترة ونهايتها", "Write the start and end of the period"), ("قارن بفترة سابقة بالطول نفسه", "Compare with an earlier period of the same length")),
       L(("الفترة على المخطط وعدد البنود", "The period on the chart and the number of items"),),
       L(("مخطط لأسبوع واحد يُبنى عليه قرار سنوي", "A one-week chart used for a yearly decision"),),
       B("مالك البيانات", "Data owner"), B("متوسط عدد البنود في كل مخطط", "Average number of items per chart")),
    IT("GD-3", "DT2", B("اختر الوحدة التي تناسب السؤال", "Choose the unit that fits the question"),
       R(GD, "العدد ليس دائماً المقياس الصحيح. العدد يبيّن أين يتكرر الخلل، والتكلفة أو الوقت المفقود يبيّن أين يوجع، ودرجة الخطورة المرجّحة تبيّن أين الخطر. الترتيب قد يتغير بتغير الوحدة؛ فاختر الوحدة من السؤال، واكتب أوزان الخطورة إن استخدمتها.",
         "count is not always the right measure. Count shows where the failure repeats, cost or time lost shows where it hurts, and a severity-weighted score shows where the risk is. The order may change with the unit, so pick the unit from the question, and write the severity weights if you use them."),
       R(EX, "بالعدد تتصدر «المواد دون شهادات» (24 تقريراً)، وبالتكلفة تتراجع إلى المرتبة الخامسة وتتقدم الخرسانة المرفوضة (386,500 ريال) والإعادة في التنفيذ.",
         "by count “materials without certificates” leads (24 reports); by cost it drops to fifth place, and rejected concrete (SAR 386,500) and rework lead."),
       L(("اسأل: هل السؤال عن التكرار أم عن الأثر؟", "Ask: is the question about frequency or about impact?"), ("ارسم المخطط بوحدتين عندما يختلف الترتيب", "Draw the chart in two units when the order differs")),
       L(("الوحدة وأساس حسابها", "The unit and how it was calculated"),),
       L(("قرار إنفاق مبني على مخطط بالعدد", "A spending decision based on a count chart"), ("أوزان خطورة غير مكتوبة", "Severity weights that are not written down")),
       B("الميسّر ومالك البيانات", "Facilitator and data owner"), B("نسبة المخططات التي ذُكرت وحدتها وأساسها", "Share of charts with the unit and its basis stated")),
    IT("GD-4", "DT3", B("أبقِ «أخرى» صغيرة", "Keep “Other” small"),
       R(GD, "«أخرى» سطر واحد يُرسم آخراً مهما كان حجمه، ولا يدخل القلة الحيوية. يجب أن يبقى أصغر من أصغر فئة مسماة؛ فإذا كبر فهو يخفي فئة لم تُعرَّف بعد، وإذا صار الأكبر فالمخطط لا يجيب عن السؤال.",
         "“Other” is one line drawn last whatever its size, and it never joins the vital few. It must stay smaller than the smallest named category; if it grows it hides a category not yet defined, and if it becomes the largest the chart does not answer the question."),
       R(EX, "في رفض الخرسانة بقيت «أخرى» شحنة واحدة (انفصال حبيبات ظاهر)، أي بحجم أصغر فئة مسماة لا أكبر منها.",
         "in the concrete rejections “Other” stayed at one load (visible segregation), the same size as the smallest named category, not larger."),
       L(("افتح «أخرى» عندما تقترب من أصغر فئة", "Open “Other” when it nears the smallest category"), ("اكتب ما يدخل فيها", "Write what goes into it")),
       L(("محتوى «أخرى» مكتوباً", "What “Other” contains, written down"),),
       L(("«أخرى» أكبر عمود في المخطط", "“Other” as the largest bar on the chart"),),
       B("من يصنّف", "Classifier"), B("نسبة المخططات التي «أخرى» فيها أصغر من أصغر فئة", "Share of charts where “Other” is smaller than the smallest category")),
    IT("GD-5", "VF1", B("قسّم الفئة التي تخفي عدة مشكلات", "Stratify a category that hides several problems"),
       R(GD, "فئة كبيرة قد تكون خليطاً من مشكلات مختلفة: موردان مختلفان، أو ورديتان، أو منتجان. قسّمها بحسب الموقع أو الوردية أو المورد أو المنتج، وارسم مخططاً لها وحدها؛ فتظهر الفئة الحقيقية التي تستحق التحليل.",
         "a large category can be a mix of different problems: two different suppliers, two shifts or two products. Split it by site, shift, supplier or product and chart it on its own; the real category that deserves analysis then shows."),
       R(EX, "«مواد دون شهادات» قُسّمت بحسب المورد: موردان يصنعان 17 من 24 تقريراً، فذهب الإجراء إليهما لا إلى كل الموردين.",
         "“materials without certificates” was split by supplier: two suppliers made 17 of the 24 reports, so the action went to them, not to every supplier."),
       L(("اسأل عن كل فئة كبيرة: هل هي مشكلة واحدة؟", "Ask of every large category: is it one problem?"), ("سجّل البعد الذي قُسّمت به", "Record the dimension used for the split")),
       L(("ملاحظة التقسيم والمخطط الفرعي", "The stratification note and the sub-chart"),),
       L(("إجراء عام على فئة مختلطة", "A general action on a mixed category"),),
       B("مهندس الجودة", "Quality engineer"), B("عدد الفئات التي قُسّمت قبل التحليل", "Categories stratified before analysis")),
    IT("GD-6", "VF2", B("80/20 قاعدة تقريبية: أكّد القلة الحيوية بالحكم", "80/20 is a rule of thumb: confirm the vital few with judgement"),
       R(GD, "قاعدة 80/20 ليست قانوناً: قد تصنع فئتان 60% فقط، وقد تصنع فئة واحدة 90%. خط القطع يقترح القلة الحيوية، والفريق يؤكدها بحكمه: يضيف فئة أصغر لكنها حرجة للسلامة أو للعميل أو للقانون، أو يستبعد فئة يعالجها إجراء قائم، ويكتب السبب. ويربط المبدأ 4.2.7 في ISO 9000:2026 القرار بالدليل مع موازنته بالخبرة.",
         "the 80/20 rule is not a law: two categories may make only 60%, and one may make 90%. The cut-off line suggests the vital few, and the team confirms them with judgement: it adds a smaller category that is critical for safety, the customer or the law, or drops one already covered by an action, and writes the reason. Principle 4.2.7 of ISO 9000:2026 ties decisions to evidence, balanced with experience."),
       R(EX, "الخط اقترح ثلاث فئات، وأضاف الفريق «أجهزة قياس تجاوزت موعد المعايرة» (4 تقارير فقط) لأن كل نتيجة فحص أُخذت بجهاز متأخر موضع شك.",
         "the line suggested three categories, and the team added “measuring devices past their calibration date” (only 4 reports) because every test result taken with an overdue device is in doubt."),
       L(("اقرأ الخط، ثم اسأل عن أثر كل فئة لا عن حجمها فقط", "Read the line, then ask about each category's impact, not only its size"), ("اكتب سبب كل إضافة أو استبعاد", "Write the reason for every addition or removal")),
       L(("القلة الحيوية المؤكدة وأسباب التغيير", "The confirmed vital few and the reasons for changes"),),
       L(("القلة الحيوية = ما فوق 80% دون نقاش", "Vital few = whatever is above 80%, with no discussion"), ("إضافة فئة دون سبب مكتوب", "A category added with no written reason")),
       B("الميسّر والفريق", "Facilitator and team"), B("نسبة التحليلات التي أُكدت قلتها الحيوية", "Share of analyses with confirmed vital few")),
    IT("A.9.1", "x:tools", B("أدوات الجودة والأساليب الإحصائية", "Quality tools and statistical techniques"),
       R(IS, "يوضح الملحق A.9.1 أن الرصد والقياس يقدمان بيانات ومعلومات تُستخدم في التحليل والتقييم. وتشير ملاحظتاه 3 و4 إلى ISO 10009 للإرشاد في أدوات الجودة وتطبيقها، وإلى ISO 10017 للإرشاد في الأساليب الإحصائية. والدليلان غير مرفوعين إلى المشروع، فمحتواهما «غير متحقق منه» هنا، ويُذكران كما سمّتهما الملاحظتان فقط.",
         "Annex A.9.1 explains that monitoring and measurement provide data and information used for analysis and evaluation. Its notes 3 and 4 point to ISO 10009 for guidance on quality tools and their application, and to ISO 10017 for guidance on statistical techniques. The two guides are not uploaded to the project, so their content is “not verified” here; they are named only as the notes name them."),
       R(EX, "يُرتَّب سجل NCR بمخطط باريتو كل ربع سنة لأنه أبسط أدوات الجودة، وتُستخدم مخططات الضبط لبيانات القياس المستمرة.",
         "the NCR log is ranked with a Pareto chart every quarter because it is the simplest of the quality tools, and control charts are used for continuous measurement data."),
       L(("ضع باريتو في قائمة أدوات التحليل المعتمدة لديكم", "Put Pareto in your list of approved analysis tools"), ("درّب من يعدّ التقارير على الأدوات الأساسية", "Train those who prepare reports in the basic tools")),
       L(("قائمة أدوات التحليل وسجل التدريب عليها", "The list of analysis tools and the training record"),),
       L(("تحليل بأداة لا يعرفها أحد في الفريق", "An analysis with a tool nobody in the team knows"),),
       B("مدير الجودة", "Quality manager"), B("عدد من دُرّبوا على أدوات الجودة الأساسية", "People trained in the basic quality tools"))
  ]})

S.append({"id": "10.2", "grp": "core", "ph": "act", "col": "#1E8C93", "tint": "#E3F4F4",
  "t": B("البند 10.2 عدم المطابقة والإجراء التصحيحي", "Clause 10.2 Nonconformity and corrective action"),
  "s": B("من الفئة إلى السبب", "From category to cause"), "sh": B("10.2 · الأسباب", "10.2 · Causes"),
  "p": B("الفئة الحيوية مكان تحفر فيه، وليست سبباً. البند 10.2.1 ب) يطلب تحديد الأسباب والتحقق من الحالات المشابهة، ويترك الملحق A.10.2 مدى التحقيق للمنشأة.",
         "A vital-few category is where to dig, not a cause. Clause 10.2.1 b) asks for the causes to be determined and similar cases checked, and Annex A.10.2 leaves the extent of investigation to the organization."),
  "fl": L(("القلة الحيوية", "Vital few"), ("عظمة السمكة", "Fishbone"), ("لماذا الخمس", "5 Whys"), ("CAPA", "CAPA")),
  "it": [
    IT("10.2.1 b 2", "AC1", B("انقل كل فئة حيوية إلى تحديد الأسباب", "Take each vital-few category to determining causes"),
       R(IS, "من خطوات تقييم الحاجة إلى إجراء يزيل السبب أن تُحدَّد أسباب عدم المطابقة. لا يسمّي البند طريقة، وباريتو يختار أين تبدأ: الفئة الحيوية تنتقل إلى تحليل عظمة سمكة أو لماذا الخمس أو تحقق بالبيانات، أو إلى سجل CAPA يحمل ذلك.",
         "one step in evaluating the need for action on the cause is determining the causes of the nonconformity. The clause names no method; Pareto chooses where to start: the vital-few category moves to a Fishbone or 5 Whys analysis or a check with data, or to a CAPA record that carries it."),
       R(EX, "«حرارة الخرسانة فوق الحد» انتقلت إلى تحليل عظمة السمكة FB-EX-02، و«الهبوط خارج الحدود» إلى لماذا الخمس W5-EX-03، و«زمن الخلط» إلى سجل CA-EX-04.",
         "“concrete temperature above the limit” moved to Fishbone analysis FB-EX-02, “slump out of range” to 5 Whys W5-EX-03, and “time since batching” to record CA-EX-04."),
       L(("لكل فئة حيوية خطوة واحدة على الأقل برقم مسجل", "At least one step with a recorded id for each vital-few category"), ("لا تكتب اسم الفئة سبباً جذرياً", "Do not write the category name as a root cause")),
       L(("ربط الفئة برقم التحليل أو السجل", "The category linked to the analysis or record id"),),
       L(("«السبب الجذري: الخرسانة» بعد مخطط باريتو", "“Root cause: concrete” after a Pareto chart"), ("فئة حيوية بلا أي خطوة", "A vital-few category with no step")),
       B("مالك العملية", "Process owner"), B("نسبة الفئات الحيوية المربوطة بخطوة", "Share of vital-few categories linked to a step")),
    IT("10.2.1 b 3", "x:tools", B("ابحث عن الحالات المشابهة بالتقسيم", "Look for similar cases by stratifying"),
       R(IS, "من خطوات التقييم أيضاً تحديد ما إذا كانت حالات مشابهة موجودة أو قد تحدث. وتقسيم الفئة بحسب الموقع أو المورد يبيّن أين توجد الحالة نفسها وأين لم تظهر بعد.",
         "part of the evaluation is also determining whether similar nonconformities exist or could potentially occur. Splitting the category by site or supplier shows where the same case exists and where it has not shown yet."),
       R(EX, "تقسيم رفض الخرسانة بحسب المشروع أظهر أن المشروعين الآخرين لم يبدآ الصب الصيفي بعد، فأُضيفت قاعدة الطقس الحار إليهما قبل الموسم.",
         "splitting concrete rejections by project showed the two other projects had not started summer pours yet, so the hot-weather rule was added to them before the season."),
       L(("قسّم الفئة الحيوية بحسب الموقع أو المورد", "Split the vital-few category by site or supplier"), ("سجّل أين وُجدت الحالة وأين قد تحدث", "Record where the case exists and where it could occur")),
       L(("مخطط التقسيم ونتيجة الفحص", "The stratified chart and the result of the check"),),
       L(("إجراء في موقع واحد والفئة نفسها في موقعين آخرين", "An action on one site while the same category sits on two others"),),
       B("مسؤول الجودة", "Quality officer"), B("نسبة الفئات الحيوية التي فُحصت حالاتها المشابهة", "Share of vital-few categories checked for similar cases")),
    IT("A.10.2", "x:tools", B("اختر مدى التحقيق بحسب الخطر والأثر", "Choose the extent of investigation by risk and impact"),
       R(IS, "يوضح الملحق A.10.2 أن المنشأة تحدد طريقة التعامل مع عدم المطابقة، ومنها مدى التحقيق والطرق المستخدمة، بحسب سياقها واحتياجاتها، مع مراعاة خطر التكرار والأثر الفعلي أو المحتمل ومتطلبات العملاء والأطراف المعنية. وباريتو يساعد على هذا القرار: الفئات الحيوية تستحق تحقيقاً أعمق.",
         "Annex A.10.2 explains that the organization decides how to address nonconformities, including the extent of investigation and the methods used, based on its context and needs, considering the risk of recurrence, the actual or potential impact and the requirements of customers and other interested parties. Pareto helps with that decision: the vital few deserve deeper investigation."),
       R(EX, "فئات القلة الحيوية فُتح لها تحليل سبب، أما «تلف أثناء التخزين» (3 تقارير) فكفاه التصحيح ومتابعته في السجل.",
         "the vital-few categories each got a cause analysis, while “damage in storage” (3 reports) needed only correction and follow-up in the log."),
       L(("ضع قاعدة: الفئات الحيوية تحليل سبب، والباقي تصحيح ومتابعة", "Set a rule: vital few get cause analysis, the rest correction and follow-up"),),
       L(("قاعدة اختيار مدى التحقيق", "The rule for choosing the extent of investigation"),),
       L(("تحليل كامل لكل فئة مهما صغرت", "A full analysis for every category however small"),),
       B("مدير الجودة", "Quality manager"), B("نسبة الفئات الحيوية التي حُللت", "Share of vital-few categories analysed"))
  ]})

S.append({"id": "10.1", "grp": "core", "ph": "learn", "col": "#3C9A5F", "tint": "#E5F4EA",
  "t": B("البند 10.1 التحسين المستمر", "Clause 10.1 Continual improvement"),
  "s": B("التحقق من الأثر", "Checking the effect"), "sh": B("10.1 · التحسين", "10.1 · Improvement"),
  "p": B("مخطط ثانٍ بعد الإجراء على الأساس نفسه يبيّن هل تحسن شيء فعلاً، ويجعل نتائج التحليل مدخلاً لفرص التحسين.",
         "A second chart after the action, on the same basis, shows whether anything really improved, and turns the results of analysis into an input to improvement opportunities."),
  "fl": L(("قبل", "Before"), ("الإجراء", "Action"), ("بعد", "After"), ("الحكم", "Verdict")),
  "it": [
    IT("10.1", "AC2", B("تحقق من الأثر بمخطط ثانٍ على الأساس نفسه", "Check the effect with a second chart on the same basis"),
       R(IS, "تحسّن المنشأة باستمرار ملاءمة نظام الجودة وكفايته وفعاليته، وتنظر في نتائج الرصد والقياس والتحليل والتقييم ونتائج مراجعة الإدارة لتحديد الفرص. ومن إجراءات التحسين تصحيح الآثار غير المرغوبة أو منعها أو تقليلها؛ ومخطط بعد الإجراء يبيّن هل قلّت فعلاً.",
         "the organization continually improves the suitability, adequacy and effectiveness of its quality system, and considers the results of monitoring, measurement, analysis and evaluation and of management review to determine opportunities. Improvement actions include correcting, preventing or reducing undesired effects; a chart after the action shows whether they really fell."),
       R(EX, "شحنات الخرسانة المرفوضة: 35 في أبريل ومايو، و20 في يوليو وأغسطس (61 يوماً مقابل 62)، بالفئات والوحدة نفسها. الحكم «تحسّن»، لكن الحرارة ما زالت أكبر سبب.",
         "rejected concrete loads: 35 in April and May and 20 in July and August (61 days against 62), with the same categories and unit. Verdict “improved”, but temperature is still the largest reason."),
       L(("الفئات نفسها، والوحدة نفسها، وفترة بالطول نفسه", "Same categories, same unit, a period of the same length"), ("اقرأ القلة الحيوية والمجموع معاً", "Read the vital few and the total together"), ("الحكم للفريق، والأرقام تقترح", "The team gives the verdict; the figures suggest")),
       L(("مخطط قبل وبعد والحكم المؤكد", "The before/after chart and the confirmed verdict"),),
       L(("مقارنة شهر بثلاثة أشهر", "One month compared with three"), ("تغيير تعريف الفئات بين المخططين", "Category definitions changed between the two charts")),
       B("مالك العملية والمراجِع", "Process owner and reviewer"), B("نسبة التحليلات التي تُحقق من أثرها", "Share of analyses whose effect was checked"))
  ]})

S.append({"id": "9.3", "grp": "core", "ph": "review", "col": "#B8901E", "tint": "#FCF1DE",
  "t": B("البند 9.3 مراجعة الإدارة", "Clause 9.3 Management review"),
  "s": B("الاتجاه في مراجعة الإدارة", "Trends in management review"), "sh": B("9.3 · المراجعة", "9.3 · Review"),
  "p": B("مراجعة الإدارة تحتاج اتجاهات لا قوائم. مخطط باريتو لعدم المطابقة أو ملاحظات التدقيق، مقارنةً بالفترة السابقة، يجعل الاتجاه واضحاً في صفحة.",
         "Management review needs trends, not lists. A Pareto chart of nonconformities or audit findings, compared with the previous period, makes the trend clear on one page."),
  "fl": L(("مدخلات", "Inputs"), ("اتجاهات", "Trends"), ("قرار", "Decision")),
  "it": [
    IT("9.3.2 d", "AC3", B("اعرض المخطط في مراجعة الإدارة اتجاهاً", "Show the chart in management review as a trend"),
       R(IS, "من مدخلات مراجعة الإدارة معلومات عن أداء نظام الجودة، ومنها الاتجاهات في عدم المطابقة والإجراءات التصحيحية، ونتائج الرصد والقياس، ونتائج التدقيق. وتُبنى على المراجعة قرارات فرص التحسين المستمر. ومخطط باريتو بفترتين يعرض هذه الاتجاهات بوضوح.",
         "management review inputs include information on quality system performance, including trends in nonconformities and corrective actions, monitoring and measurement results and audit results. Decisions on continual improvement opportunities are built on the review. A two-period Pareto chart shows these trends clearly."),
       R(EX, "عُرض في مراجعة الإدارة مخطط عدم المطابقة لتسعة أشهر بالعدد وبالتكلفة، فقررت الإدارة أولوية الخرسانة صيفاً والإعادة في التنفيذ.",
         "management review was shown the nine-month nonconformity chart by count and by cost, and decided to prioritise summer concrete and construction rework."),
       L(("ضع مخطط عدم المطابقة والملاحظات في كل مراجعة", "Put the nonconformity and findings chart in every review"), ("قارن بالفترة السابقة بالطول نفسه", "Compare with the previous period of the same length")),
       L(("محضر المراجعة والمخطط المرفق والقرار", "The review minutes, the attached chart and the decision"),),
       L(("قائمة بكل تقارير NCR بدل الاتجاه", "A list of every NCR instead of the trend"),),
       B("الإدارة العليا", "Top management"), B("عدد المراجعات التي عُرض فيها مخطط باريتو", "Reviews in which a Pareto chart was shown"))
  ]})

S.append({"id": "7.1.6", "grp": "core", "ph": "learn", "col": "#1B2A4A", "tint": "#E8ECF4",
  "t": B("البند 7.1.6 المعرفة التنظيمية", "Clause 7.1.6 Organizational knowledge"),
  "s": B("المعرفة التنظيمية", "Organizational knowledge"), "sh": B("7.1.6 · المعرفة", "7.1.6 · Knowledge"),
  "p": B("تعريفات الفئات المجرّبة ومخططات الفترات السابقة معرفة جاهزة: تجعل المخطط التالي أسرع وأصدق، إذا حُفظت وشوركت.",
         "Tested category definitions and earlier charts are ready knowledge: they make the next chart faster and more honest, if they are kept and shared."),
  "fl": L(("احفظ", "Keep"), ("طبّق", "Apply"), ("شارك", "Share")),
  "it": [
    IT("7.1.6", "x:tools", B("احفظ تعريفات الفئات والمخططات وشاركها", "Keep and share the category definitions and the charts"),
       R(IS, "تحدد المنشأة المعرفة اللازمة لتشغيل عملياتها وتحقيق نتائج نظام الجودة، وتحتفظ بها وتطبقها وتشاركها بالقدر اللازم. ومن أشكالها المعرفة المضمّنة في الطرق والعمليات والمعرفة الممثّلة في المعلومات الموثقة.",
         "the organization determines the knowledge needed to operate its processes and achieve quality system results, and retains, applies and shares it to the extent necessary. Its forms include knowledge built into methods and processes and knowledge held in documented information."),
       R(EX, "أصبحت تعريفات فئات عدم المطابقة الست قائمة ثابتة في سجل NCR، فصار التصنيف عند التسجيل لا عند التحليل.",
         "the six nonconformity category definitions became a fixed list in the NCR log, so classification now happens at recording, not at analysis."),
       L(("ضع تعريفات الفئات في نموذج التسجيل نفسه", "Put the category definitions in the recording form itself"), ("احفظ تقرير كل مخطط مع مصدر بياناته", "Keep the report of each chart with its data source")),
       L(("قائمة الفئات المعتمدة والتقارير المحفوظة", "The approved category list and the filed reports"),),
       L(("تعريفات تتغير مع كل من يعدّ المخطط", "Definitions that change with whoever prepares the chart"),),
       B("مدير الجودة", "Quality manager"), B("نسبة السجلات المصنفة عند التسجيل", "Share of records classified when recorded"))
  ]})

legend = [[p["c"], p["n"]] for p in phases.values()]

DATA = {
    "meta": meta, "std": std, "texts": texts, "phases": phases, "flags": {}, "legend": legend,
    "diagram": {"type": "cycle", "centre": B("باريتو", "Pareto")},
    "matrix": {"tab": "", "d": B("", ""), "btn": B("", "")},
    "sections": S, "paths": [],
    "edges": [["9.1.3", "GD-1"], ["GD-1", "GD-2"], ["GD-2", "GD-3"], ["GD-3", "GD-4"], ["GD-4", "GD-6"], ["GD-6", "GD-5"],
              ["GD-6", "10.2.1 b 2"], ["GD-5", "10.2.1 b 3"], ["A.10.2", "10.2.1 b 2"], ["10.2.1 b 2", "10.1"], ["10.1", "9.3.2 d"],
              ["A.9.1", "9.1.3"], ["9.3.2 d", "7.1.6"]],
    "changes": {"note": B("", ""), "tlT": B("", ""), "tlS": B("", ""), "tlCols": 4, "tl": [], "cardsT": B("", ""), "cardsS": B("", ""), "cards": [],
                "corr": {"t": B("", ""), "s": B("", ""), "h": [], "rows": []}, "steps": {"t": B("", ""), "s": B("", ""), "l": B("", "")}},
    "ui": {
        "ar": {"roles": "من يعمل على المخطط", "wheelT": "عجلة البنود", "purpose": "الغرض من الأداة", "smap": "خطوات تحليل باريتو",
               "smapSub": "كل خطوة في سطر. اضغط «اشرح» لفتح البند أو القاعدة التي تخدمها.", "rel": "علاقتها بأدوات المنصة", "comp": "المراجع المساندة",
               "assess": "قيّم هذا في التقييم الذاتي", "assessC": "قيّم هذا في التقييم الذاتي",
               "assessOff": "هذا البند خارج أسئلة التقييم الذاتي، ويُطبَّق مباشرة في تحليل باريتو.", "offGo": "افتح تحليل باريتو",
               "actCtx": "يفتح السؤال {s}", "explainA": "اشرح {c} في دليل البنود"},
        "en": {"roles": "Who works on the chart", "wheelT": "Clause wheel", "purpose": "What the tool is for", "smap": "Steps of a Pareto analysis",
               "smapSub": "One line per step. Select “Explain” to open the clause or rule it serves.", "rel": "How it connects to the platform's tools", "comp": "Supporting references",
               "assess": "Assess this in the self-assessment", "assessC": "Assess this in the self-assessment",
               "assessOff": "This clause is outside the self-assessment questions; it is applied directly in the Pareto analysis.", "offGo": "Open the Pareto analysis",
               "actCtx": "Opens question {s}", "explainA": "Explain {c} in the clause guide"}
    }
}

if __name__ == "__main__":
    js = ("/* Pareto explanation data for the CIA Explain Kit v1.4. Pareto analysis is a method, not a clause. Clause numbers and\n"
          "   titles checked on 2026-10-11 against the uploaded ISO 9001:2026 and ISO 9000:2026 texts. Requirements are interpretive\n"
          "   summaries, not the official text; ISO 10009 and ISO 10017 are not uploaded (\"not verified\"). */\n"
          "const EXPLAIN_PARETO=" + json.dumps(DATA, ensure_ascii=False, indent=1) + ";\n")
    sys.stdout.write(js)
