"""EXPLAIN_A3 — data for the CIA Explain Kit v1.4 in modules/a3.html (build step 2026-10-16, A3 problem solving).
A3 problem solving is a method (the whole problem-solving story on one page, on the PDCA cycle), not a clause of any standard.
The clause guide is built on the ISO 9001:2026 clauses the method serves. Clause numbers and titles checked on 2026-10-16 against
the uploaded official texts only:
  ISO 9001:2026 (ISO_9001_2026en 1.pdf) — Introduction 0.3.2 Plan-Do-Check-Act cycle (Plan: establish the objectives and resources and
                                           determine and address risks and opportunities; Do: implement what was planned; Check: monitor
                                           and, as applicable, measure against policies, objectives, requirements and planned activities and
                                           report the results; Act: take actions to improve performance; applicable to all processes and the
                                           QMS as a whole) — the introduction explains, it sets no requirement;
                                           6.2 Quality objectives and planning to achieve them (6.2.1 a)–h): measurable, monitored, ...;
                                           6.2.2 a)–e): what, resources, who, when, how results are evaluated), 7.1.6 Organizational knowledge,
                                           7.3 Awareness (a)–e)), 9.1.3 Analysis and evaluation (and its NOTE on statistical techniques),
                                           10.1 Continual improvement (a)–c)), 10.2.1 b) 2), d), f), Annex A.7.3, A.10.2
  ISO 9000:2026 (ISO 9000-2026.pdf; scanned, read by OCR) — 3.2.3 improvement, 3.7.11 objective (Note 3: aim, goal, target),
                                           3.7.17 effectiveness, 3.8.6 objective evidence, 4.2.6 Improvement (4.2.6.3, 4.2.6.4),
                                           4.2.7 Evidence-based decision-making (4.2.7.2 cause and effect relationships)
Not uploaded, so "not verified": any lean or A3 reference, ISO 10009 and ISO 10017 (named only in ISO 9001:2026 A.9.1 notes).
No text of a standard is reproduced: every "requirement" is an interpretive summary in independent wording.
Items coded GD-n are the author's practical guidance on the method, not clauses. Usage: python3 data_a3.py > explain_a3.js"""
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
    "code": "A3",
    "name": B("حل المشكلات بأسلوب A3", "A3 Problem Solving"),
    "edition": B("أداة منهجية: قصة حل المشكلة على دورة PDCA (ISO 9001:2026 المقدمة 0.3.2)", "Method tool: the problem-solving story on the PDCA cycle (ISO 9001:2026 introduction 0.3.2)"),
    "status": B("الأداة السابعة في صندوق أدوات التحسين المستمر", "Seventh tool in the Continual Improvement Toolbox"),
    "cert": False,
    "certNote": B("A3 طريقة لحل المشكلات، وليست مواصفة ولا بنداً. تسير على دورة PDCA التي تصفها ISO 9001:2026 في مقدمتها (0.3.2)، والمقدمة شرح لا متطلبات. والمتطلبات التي تخدمها الطريقة هي الأهداف القابلة للقياس والتخطيط لتحقيقها (6.2)، والتحليل والتقييم (9.1.3)، والإجراء التصحيحي ومراجعة فعاليته (10.2.1)، والتحسين المستمر (10.1).",
                  "A3 is a problem-solving method, not a standard or a clause. It runs on the PDCA cycle that ISO 9001:2026 describes in its introduction (0.3.2); the introduction explains and sets no requirement. The requirements the method serves are measurable objectives and planning to achieve them (6.2), analysis and evaluation (9.1.3), corrective action and the review of its effectiveness (10.2.1), and continual improvement (10.1)."),
    "verified": B("2026-10-16، من الملفات الرسمية المرفوعة إلى المشروع: ISO_9001_2026en 1.pdf وISO 9000-2026.pdf (ملف ممسوح ضوئياً، قُرئ بالتعرف الضوئي على النص). كل «متطلب» ملخص تفسيري، وليس النص الرسمي. أي مرجع لمنهج A3 أو الإنتاج الرشيق، وISO 10009 وISO 10017، غير مرفوعة: «غير متحقق منه».",
                  "2026-10-16, against the official files uploaded to the project: ISO_9001_2026en 1.pdf and ISO 9000-2026.pdf (a scanned file, read with OCR). Every “requirement” is an interpretive summary, not the official text. Any A3 or lean reference, ISO 10009 and ISO 10017 are not uploaded: “not verified”.")
}

std = {
    "purpose": B("أن تُحل كل مشكلة مهمة بقصة واحدة واضحة تُقرأ في دقائق: لماذا تهم، وأين نحن بالأرقام، وإلى أين نريد بحلول متى، ولماذا يحدث ذلك بالدليل، وماذا نغيّر، ومن يفعل ماذا، وهل وصلنا؛ ثم يُوحَّد ما نجح وتبدأ دورة جديدة لما بقي.",
                 "To solve every important problem with one clear story that can be read in minutes: why it matters, where we are in numbers, where we want to be and by when, why it happens with evidence, what we change, who does what, and whether we got there; then what worked is standardised and a new cycle starts for what is left."),
    "who": B("مالكو العمليات، ومديرو المشاريع والمواقع، ومهندسو الجودة والسلامة، وقادة الفرق، والموجّهون والمرشدون، وكل من يملك مشكلة تتكرر أو فجوة في مؤشر أداء.",
             "Process owners, project and site managers, quality and safety engineers, team leaders, coaches and mentors, and anyone who owns a recurring problem or a gap in a KPI."),
    "rolesSub": B("صفحة A3 لا تنجح بالنموذج؛ تنجح بمن يملكها، ومن يسأل عنها، ومن يقدم الوقائع. هذا توزيع مقترح للأدوار.",
                  "An A3 does not succeed by its template; it succeeds through who owns it, who asks about it and who brings the facts. This is a suggested split of roles."),
    "roles": [
        {"n": B("مالك الصفحة", "A3 owner"), "col": "#1B2A4A", "d": B("شخص واحد يكتب الصفحة بنفسه، ويذهب إلى مكان العمل ليرى، ويحمل القصة من الخلفية إلى المتابعة.", "One person who writes the page, goes to the workplace to see, and carries the story from the background to the follow-up.")},
        {"n": B("الموجّه أو المرشد", "Coach or mentor"), "col": "#B8901E", "d": B("يراجع بالأسئلة لا بالتوقيع، ولا يكتب الحل؛ ويكون شخصاً غير المالك.", "Reviews through questions, not approvals, and does not write the solution; someone other than the owner.")},
        {"n": B("الراعي", "Sponsor"), "col": "#3C9A5F", "d": B("يوفر الوقت والموارد، ويزيل العوائق التي لا يستطيع المالك إزالتها.", "Gives time and resources, and removes obstacles the owner cannot.")},
        {"n": B("من يؤدي العمل", "The people who do the work"), "col": "#C2410C", "d": B("يعرفون ما يحدث فعلاً، ويختبرون الإجراءات المضادة في الواقع قبل تعميمها.", "They know what really happens, and test the countermeasures for real before they are rolled out.")},
        {"n": B("مالك البيانات", "Data owner"), "col": "#3563C9", "d": B("يقدم القيمة الأساسية وبيانات المتابعة بالطريقة نفسها، حتى تُقارن النتيجة بالهدف بصدق.", "Provides the baseline and the follow-up data measured the same way, so the result is compared with the goal honestly.")}
    ],
    "map": [
        {"no": "1", "t": B("مالك واحد وموجّه", "One owner and a coach"), "d": B("المالك يكتب، والموجّه يسأل.", "The owner writes; the coach asks."), "go": "GD-1"},
        {"no": "2", "t": B("الخلفية بمقياس يهم", "Background with a measure that matters"), "d": B("العميل أو السلامة أو التكلفة أو الاستراتيجية.", "Customer, safety, cost or strategy."), "go": "GD-3"},
        {"no": "3", "t": B("الوضع الحالي بالوقائع مرسوماً", "The current condition from facts, drawn"), "d": B("قيمة أساسية وفترة ورسم وفجوة في سطر.", "A baseline, a period, a chart and the gap in one line."), "go": "9.1.3"},
        {"no": "4", "t": B("الهدف رقماً بتاريخ قبل الأسباب", "The goal as a number and a date, before the causes"), "d": B("ولا يُعدَّل ليناسب النتيجة.", "And not changed to fit the result."), "go": "GD-4"},
        {"no": "5", "t": B("الأسباب الجذرية مثبتة", "Root causes proved"), "d": B("من RCA أو عظمة السمكة أو لماذا الخمس أو البيانات.", "From RCA, Fishbone, 5 Whys or data."), "go": "10.2.1 b 2"},
        {"no": "6", "t": B("إجراء مضاد لكل سبب، مختبر", "A tested countermeasure for each cause"), "d": B("صغيراً أولاً، ثم التعميم.", "Small first, then the roll-out."), "go": "GD-5"},
        {"no": "7", "t": B("الخطة: ماذا ومن ومتى", "The plan: what, who, when"), "d": B("والإجراءات التصحيحية لعدم المطابقة في CAPA.", "With the corrective actions of a nonconformity in CAPA."), "go": "6.2.2"},
        {"no": "8", "t": B("المتابعة مقابل الهدف", "Follow-up against the goal"), "d": B("المقياس نفسه، لفترة محددة.", "The same measure, over a stated period."), "go": "10.2.1 d"},
        {"no": "9", "t": B("وحّد أو ابدأ من جديد", "Standardise, or start again"), "d": B("ما نجح يدخل النظام، وما بقي يبدأ دورة جديدة.", "What worked goes into the system; what is left starts a new cycle."), "go": "10.2.1 f"},
        {"no": "10", "t": B("شارك الدرس", "Share the lesson"), "d": B("معرفة للمنشأة، لا تقرير في أرشيف.", "Knowledge for the organization, not a report in an archive."), "go": "7.1.6"}
    ],
    "rel": [
        {"code": "PDCA", "n": B("دورة PDCA", "PDCA cycle"), "col": "#1E8C93", "d": B("صفحة A3 قصة دورة واحدة؛ والدورة الثانية لما بقي مفتوحاً تُدار في أداة PDCA وتُذكر برقمها في المتابعة.", "An A3 is the story of one cycle; the second cycle for what is left open is run in the PDCA tool and named by its id in the follow-up."), "tool": "./pdca.html"},
        {"code": "RCA", "n": B("تحليل السبب الجذري — التحقيق", "Root cause analysis — investigation"), "col": "#1B2A4A", "d": B("للمشكلة الجسيمة أو المعقدة، تأخذ كتلة التحليل الأسباب الجذرية المثبتة من التحقيق برقمه (قراءة فقط)، ويعرض التحقيق صفحات A3 التي تذكره.", "For a severe or complex problem, the analysis block takes the proved root causes from the investigation by its id (read-only), and the investigation lists the A3s that name it."), "tool": "./rca.html"},
        {"code": "CAPA", "n": B("الإجراءات التصحيحية", "Corrective action"), "col": "#C2410C", "d": B("عندما توجد حالة عدم مطابقة، تبقى الإجراءات التصحيحية ومتابعتها وإغلاقها في سجل CAPA الذي تذكره الصفحة برقمه.", "When a nonconformity is involved, its corrective actions, their follow-up and closure stay in the CAPA record the page names by id."), "tool": "./capa.html"},
        {"code": "Pareto", "n": B("باريتو — تحليل القلة الحيوية", "Pareto — vital few analysis"), "col": "#B8901E", "d": B("يؤطر الفجوة: الفئة الحيوية تفتح صفحة A3 بقيمتها وفترتها، وترسم فئاتها الوضع الحالي.", "Frames the gap: a vital-few category opens an A3 with its value and period, and its categories draw the current condition."), "tool": "./pareto.html"},
        {"code": "Fishbone", "n": B("عظمة السمكة", "Fishbone"), "col": "#1E8C93", "d": B("ترسم الأسباب المحتملة عندما تتعدد المسارات، ويُؤخذ سببها الجذري المتحقق منه برقم التحليل.", "Maps the possible causes when there are several paths; its verified root cause is taken by analysis id."), "tool": "./fishbone.html"},
        {"code": "5 Whys", "n": B("لماذا الخمس", "5 Whys"), "col": "#3563C9", "d": B("تحفر في مسار واحد واضح، ويُؤخذ سببها الجذري المختبر برقم التحليل.", "Digs down one clear path; its tested root cause is taken by analysis id."), "tool": "./five-whys.html"}
    ],
    "comp": [
        {"code": "ISO 9001:2026 §0.3.2", "n": B("دورة PDCA (المقدمة)", "The PDCA cycle (introduction)"),
         "d": B("الخطة والتنفيذ والتحقق والتصرف، وتنطبق على كل العمليات وعلى النظام كله. المقدمة شرح وليست متطلبات.", "Plan, Do, Check and Act, applicable to all processes and to the system as a whole. The introduction explains; it sets no requirements.")},
        {"code": "ISO 9001:2026 §6.2", "n": B("الأهداف والتخطيط لتحقيقها", "Objectives and planning to achieve them"),
         "d": B("أهداف قابلة للقياس ومرصودة، وخطة تحدد ما سيُعمل والموارد والمسؤول والموعد وطريقة تقييم النتائج.", "Measurable, monitored objectives, and a plan that sets what will be done, resources, who, when and how results are evaluated.")},
        {"code": "ISO 9001:2026 §10.2.1", "n": B("الإجراء التصحيحي ومراجعة فعاليته", "Corrective action and the review of its effectiveness"),
         "d": B("تحديد الأسباب، وتنفيذ الإجراء، ومراجعة فعاليته، وتعديل النظام عند الحاجة.", "Determining the causes, implementing the action, reviewing its effectiveness, and changing the system if necessary.")},
        {"code": "ISO 9000:2026 §3.7.11 · §3.7.17 · §4.2.7", "n": B("الهدف والفعالية والقرار المبني على الدليل", "Objective, effectiveness and evidence-based decisions"),
         "d": B("الهدف نتيجة يراد تحقيقها، والفعالية مدى تحقيق النتائج المخطط لها، والقرار يُبنى على الوقائع وتحليل البيانات.", "An objective is a result to be achieved, effectiveness is the extent planned results are achieved, and decisions rest on facts and data analysis.")},
        {"code": "A3 · Lean · ISO 10009 · ISO 10017", "n": B("مراجع المنهج والأدوات (غير متحقق منه)", "Method and tool references (not verified)"),
         "d": B("لا يوجد مرجع لمنهج A3 أو الإنتاج الرشيق مرفوع إلى المشروع، فما يرد عن المنهج هنا إرشاد تطبيقي «غير متحقق منه» من نص. ISO 10009 وISO 10017 تذكرهما ملاحظتا الملحق A.9.1 فقط.", "No A3 or lean reference is uploaded to the project, so what is said here about the method is practical guidance, “not verified” against a text. ISO 10009 and ISO 10017 are only named in the notes of Annex A.9.1.")}
    ],
    "buy": [],
    "buyNote": B("للنص الرسمي للمواصفات استخدم النسخ المنشورة من المنظمة الدولية للتوحيد القياسي، وليس هذه المنصة.",
                 "For the official text of the standards, use the copies published by the International Organization for Standardization, not this platform.")
}

texts = {
    "stdT": B("دليل المنهجية", "Method guide"),
    "stdS": B("كيف تُكتب صفحة A3 صادقة: مالك واحد وموجّه، وخلفية بمقياس، ووضع حالي بالوقائع، وهدف قبل الأسباب، وأسباب مثبتة، وإجراءات مضادة مرتبطة بها ومختبرة، وخطة، ومتابعة مقابل الهدف، ثم التوحيد أو دورة جديدة.",
              "How to write an honest A3: one owner and a coach, a background with a measure, a current condition from facts, the goal before the causes, proved causes, countermeasures tied to them and tested, a plan, a follow-up against the goal, then standardise or start a new cycle."),
    "clT": B("دليل البنود", "Clause guide"),
    "clS": B("البنود التي تخدمها الطريقة، بأرقامها في ISO 9001:2026، من دورة PDCA في المقدمة (0.3.2) إلى الأهداف 6.2 والإجراء التصحيحي 10.2. لكل بند ملخص تفسيري ومثال وما يطلبه المدقق. قواعد الطريقة مرقّمة GD وهي إرشاد لا بنود. الأمثلة توضيحية وليست بيانات حقيقية.",
             "The clauses the method serves, numbered as in ISO 9001:2026, from the PDCA cycle in the introduction (0.3.2) to objectives 6.2 and corrective action 10.2. Each one has an interpretive summary, an example and what the auditor asks for. The method's rules are coded GD: guidance, not clauses. Examples are illustrative, not real data."),
    "note": B("ما يرد تحت «المتطلب» ملخص تفسيري بصياغة مستقلة، وليس النص الرسمي للمواصفة. وما تحت «كيف تطبقه» و«الفجوات» إرشاد تطبيقي. أرقام البنود وعناوينها متحقق منها من النصوص الرسمية المرفوعة.",
              "Text under “requirement” is an interpretive summary in independent wording, not the official text of the standard. “How to implement” and “common gaps” are practical guidance. Clause numbers and titles were checked against the uploaded official texts."),
    "chgT": B("ما الذي تغيّر", "What changed"),
    "chgS": B("", "")
}

phases = {
    "frame": {"c": "#7A869E", "t": "#EEF1F6", "n": B("الدورة والملكية", "The cycle and ownership")},
    "plan": {"c": "#C2410C", "t": "#FDECE3", "n": B("الخطة: الوضع والهدف", "Plan: condition and goal")},
    "cause": {"c": "#1B2A4A", "t": "#E8ECF4", "n": B("الأسباب والإجراءات", "Causes and countermeasures")},
    "learn": {"c": "#3C9A5F", "t": "#E5F4EA", "n": B("التحقق والتوحيد والتعلّم", "Check, standardise and learn")}
}

S = []

S.append({"id": "0.3.2", "grp": "core", "ph": "frame", "col": "#1E8C93", "tint": "#E3F4F4",
  "t": B("المقدمة 0.3.2 دورة PDCA", "Introduction 0.3.2 Plan-Do-Check-Act cycle"),
  "s": B("الدورة والملكية", "The cycle and ownership"), "sh": B("0.3.2 · PDCA", "0.3.2 · PDCA"),
  "p": B("صفحة A3 قصة دورة PDCA واحدة لمشكلة واحدة. النصف الأول هو الخطة، والنصف الثاني هو التنفيذ والتحقق والتصرف. ويملكها شخص واحد ويراجعها موجّه.",
         "An A3 is the story of one PDCA cycle for one problem. The first half is the Plan; the second half is Do, Check and Act. One person owns it and a coach reviews it."),
  "fl": L(("الخطة", "Plan"), ("التنفيذ", "Do"), ("التحقق", "Check"), ("التصرف", "Act")),
  "it": [
    IT("0.3.2", "x:tools", B("الصفحة على دورة PDCA", "The page on the PDCA cycle"),
       R(IS, "تصف مقدمة ISO 9001:2026 دورة PDCA: الخطة تضع أهداف النظام وعملياته والموارد اللازمة وتحدد المخاطر والفرص وتعالجها، والتنفيذ ينفذ ما خُطط له، والتحقق يرصد العمليات والمنتجات والخدمات ويقيسها حيث ينطبق مقابل السياسات والأهداف والمتطلبات والأنشطة المخطط لها ويبلغ النتائج، والتصرف يتخذ إجراءات لتحسين أداء النظام. وتنطبق الدورة على كل العمليات وعلى النظام كله. والمقدمة شرح، وليست متطلبات.",
         "the introduction of ISO 9001:2026 describes the PDCA cycle: Plan establishes the objectives of the system and its processes and the resources needed, and determines and addresses risks and opportunities; Do implements what was planned; Check monitors and, as applicable, measures processes, products and services against policies, objectives, requirements and planned activities and reports the results; Act takes actions to improve the system's performance. The cycle applies to all processes and to the system as a whole. The introduction explains; it sets no requirements."),
       R(EX, "في صفحة الخرسانة: الكتل 1 إلى 4 (الخلفية والوضع والهدف والتحليل) هي الخطة، والكتلتان 5 و6 التنفيذ، والكتلة 7 التحقق والتصرف.",
         "on the concrete A3: blocks 1 to 4 (background, condition, goal, analysis) are the Plan, blocks 5 and 6 the Do, and block 7 the Check and Act."),
       L(("اقرأ الصفحة من أعلى إلى أسفل كقصة واحدة", "Read the page top to bottom as one story"), ("لا تنتقل إلى الإجراءات قبل أن تكتمل الخطة", "Do not move to countermeasures before the Plan is complete")),
       L(("صفحة A3 كاملة بكتلها السبع", "A complete A3 with its seven blocks"),),
       L(("صفحة تبدأ بالحل", "A page that starts with the solution"), ("الدورة تتوقف عند التنفيذ ولا تصل إلى التحقق", "The cycle stops at Do and never reaches Check")),
       B("مالك الصفحة", "A3 owner"), B("نسبة الصفحات التي وصلت إلى المتابعة", "Share of A3s that reached the follow-up")),
    IT("GD-1", "OW1", B("مالك واحد وموجّه", "One owner and a coach"),
       R(GD, "يملك صفحة A3 شخص واحد يكتبها بنفسه ويذهب إلى مكان العمل ليرى. والموجّه أو المرشد شخص آخر يراجعها. الصفحة التي يكتبها فريق كامل أو مستشار لا يتعلم منها أحد.",
         "an A3 is owned by one person who writes it and goes to the workplace to see. The coach or mentor is someone else who reviews it. A page written by a whole team or a consultant teaches no one."),
       R(EX, "مالك صفحة الخرسانة مدير المشروع، والموجّه مدير الجودة، والراعي مدير المشاريع.",
         "the owner of the concrete A3 is the project manager, the coach is the quality manager and the sponsor is the projects director."),
       L(("سمِّ المالك والموجّه في رأس الصفحة", "Name the owner and the coach at the top of the page"), ("لا يكون الموجّه هو المالك", "The coach is not the owner")),
       L(("رأس الصفحة بالمالك والموجّه والراعي", "The page header with owner, coach and sponsor"),),
       L(("«الفريق» مالكاً", "“The team” as the owner"), ("المدير يكتب الصفحة عن المالك", "The manager writes the page for the owner")),
       B("الراعي", "Sponsor"), B("نسبة الصفحات بمالك واحد وموجّه غيره", "Share of A3s with one owner and a different coach")),
    IT("GD-2", "x:tools", B("أسئلة الموجّه", "The coach's questions"),
       R(GD, "يراجع الموجّه بالأسئلة لا بالتوقيع: ما الذي يقوله الرقم؟ ما المقياس؟ كيف تعرف أن هذا هو السبب؟ أي سبب يعالجه هذا الإجراء؟ هل جرّبته؟ كيف ستعرف أنه نجح؟ ما الذي ستوحّده؟ وتُسجَّل كل مراجعة بتاريخها والأسئلة وما تغيّر بعدها.",
         "the coach reviews through questions, not approvals: what does the number say? what is the measure? how do you know this is the cause? which cause does this countermeasure address? did you try it? how will you know it worked? what will you standardise? Each review is recorded with its date, the questions and what changed afterwards."),
       R(EX, "سأل الموجّه بعد المتابعة: «انخفض الرفض إلى 6% والهدف أقل من 3%: أي سبب جذري ما زال يعمل؟»، فانتقل شرط تبريد الماء إلى الدورة الثانية.",
         "after the follow-up the coach asked: “rejections fell to 6% against a goal below 3%: which root cause is still at work?”, and the chilled-water clause moved to the second cycle."),
       L(("اسأل ولا تملِ الحل", "Ask; do not dictate the solution"), ("سجّل ما تغيّر في الصفحة بعد كل مراجعة", "Record what changed on the page after each review"), ("راجع بعد المتابعة لا قبلها فقط", "Review after the follow-up, not only before it")),
       L(("سجل مراجعات الموجّه المؤرخة", "The dated record of the coach's reviews"),),
       L(("توقيع «موافق» بلا سؤال", "A signature “approved” with no question"), ("موجّه يكتب الإجراءات بنفسه", "A coach who writes the countermeasures himself")),
       B("الموجّه", "Coach"), B("عدد المراجعات المؤرخة لكل صفحة", "Dated reviews per A3"))
  ]})

S.append({"id": "7.3", "grp": "core", "ph": "frame", "col": "#7A869E", "tint": "#EEF1F6",
  "t": B("البند 7.3 الوعي", "Clause 7.3 Awareness"),
  "s": B("التوجيه يبني الوعي", "Coaching builds awareness"), "sh": B("7.3 · الوعي", "7.3 · Awareness"),
  "p": B("محادثة التوجيه حول صفحة A3 هي حيث يرى الشخص كيف يسهم عمله في الأهداف، وماذا يفعل عندما لا تتحقق النتائج.",
         "The coaching conversation around an A3 is where a person sees how their work contributes to the objectives, and what to do when results are not achieved."),
  "fl": L(("الإسهام", "Contribution"), ("الأهداف", "Objectives"), ("التصرف", "Action")),
  "it": [
    IT("7.3", "OW2", B("صفحة A3 في محادثات التوجيه", "The A3 in coaching conversations"),
       R(IS, "تتأكد المنشأة أن من يعملون تحت سيطرتها واعون بسياسة الجودة، وبإسهامهم في فعالية النظام وفوائد تحسين الأداء، وبعواقب عدم المطابقة، وبأهداف الجودة ذات الصلة، وبثقافة الجودة والسلوك الأخلاقي. ويوضح الملحق A.7.3 أن الوعي يظهر في العمل اليومي عندما يعرف الشخص هل يستوفي عمله المتطلبات، ويتصرف عندما لا تحقق العمليات النتائج المقصودة.",
         "the organization ensures that persons doing work under its control are aware of the quality policy, their contribution to the system's effectiveness and the benefits of improved performance, the implications of not conforming, relevant quality objectives, and the quality culture and ethical behaviour. Annex A.7.3 explains that awareness shows in daily work when people recognize whether their work meets requirements and act when processes do not achieve intended results."),
       R(EX, "في مراجعة صفحة الرفع سأل الموجّه مشرف الرفع «لماذا وُقّع تصريحان بعد الرفع؟»، فأضاف المشرف بنفسه شرطاً ألا يرفع المشغل دون توقيع.",
         "in the lifting A3 review the coach asked the lifting supervisor “why were two permits signed after the lift?”, and the supervisor himself added a rule that the operator does not lift without a signature."),
       L(("اجعل المالك يقدم صفحته لا مديره", "Have the owner present the page, not their manager"), ("اسأل حتى يرى المالك الفجوة بنفسه", "Ask until the owner sees the gap")),
       L(("مراجعات مؤرخة بالأسئلة وما تغيّر", "Dated reviews with the questions and what changed"),),
       L(("الصفحة تُرسل بالبريد ولا تُناقش", "The page is emailed and never discussed"),),
       B("الموجّه", "Coach"), B("نسبة الصفحات التي روجعت في محادثة", "Share of A3s reviewed in a conversation"))
  ]})

S.append({"id": "9.1.3", "grp": "core", "ph": "plan", "col": "#3563C9", "tint": "#E7EEFB",
  "t": B("البند 9.1.3 التحليل والتقييم", "Clause 9.1.3 Analysis and evaluation"),
  "s": B("الخلفية والوضع الحالي بالوقائع", "Background and the current condition from facts"), "sh": B("9.1.3 · الوقائع", "9.1.3 · Facts"),
  "p": B("الخلفية تقول لماذا تهم المشكلة بمقياس، والوضع الحالي يقول أين نحن بالأرقام: قيمة أساسية وفترة ورسم وفجوة في سطر.",
         "The background says why the problem matters with a measure; the current condition says where we are in numbers: a baseline, a period, a chart and the gap in one line."),
  "fl": L(("المقياس", "Measure"), ("الأساس", "Baseline"), ("الرسم", "Chart"), ("الفجوة", "Gap")),
  "it": [
    IT("GD-3", "PL1", B("خلفية بمقياس يهم", "A background with a measure that matters"),
       R(GD, "تبدأ الصفحة بلماذا: أثر المشكلة على العميل أو السلامة أو التكلفة أو الاستراتيجية، في فقرة قصيرة، مع المقياس الذي يُظهر هذا الأثر. مشكلة لا يُعرف أثرها لا تستحق صفحة.",
         "the page starts with why: the effect of the problem on the customer, safety, cost or strategy, in a short paragraph, with the measure that shows the effect. A problem whose effect is unknown does not deserve a page."),
       R(EX, "«كل شحنة مرفوضة تؤخر الصب، وتأخر صب البلاطات ثلاثة أيام على المسار الحرج» مع مقياس «نسبة الشحنات المرفوضة».",
         "“every rejected load delays the pour, and slab pours slipped three days on the critical path”, with the measure “share of loads rejected”."),
       L(("اربط الخلفية بمقياس واحد", "Tie the background to one measure"), ("اكتبها في فقرة قصيرة", "Write it in a short paragraph")),
       L(("الخلفية والمقياس في الكتلة 1", "The background and measure in block 1"),),
       L(("خلفية بلا رقم ولا أثر", "A background with no number and no effect"),),
       B("مالك الصفحة", "A3 owner"), B("نسبة الصفحات بخلفية ومقياس", "Share of A3s with a background and a measure")),
    IT("9.1.3", "PL2", B("الوضع الحالي بالوقائع والبيانات", "The current condition from facts and data"),
       R(IS, "تحلل المنشأة البيانات والمعلومات الناتجة عن الرصد والقياس وتقيّمها، وتستخدم النتائج لتقييم المطابقة ورضا العملاء وأداء النظام وفعاليته والحاجة إلى التحسين، وقد تشمل الطرق تقنيات إحصائية. ويقول مبدأ القرار المبني على الدليل في ISO 9000:2026 ‏(4.2.7) إن الوقائع والأدلة وتحليل البيانات تعطي القرار موضوعية. لذلك يُكتب الوضع الحالي بالأرقام مرسومة، لا بالصفات.",
         "the organization analyses and evaluates data and information from monitoring and measurement, and uses the results to evaluate conformity, customer satisfaction, the system's performance and effectiveness, and the need for improvement; methods can include statistical techniques. The evidence-based decision-making principle in ISO 9000:2026 (4.2.7) says facts, evidence and data analysis give decisions objectivity. That is why the current condition is written in numbers, drawn, not in adjectives."),
       R(EX, "«9.2% من الشحنات مرفوضة بين 1 أبريل و31 مايو (35 من 380)» مع خط زمني لأربع فترات، بدل «الرفض مرتفع جداً».",
         "“9.2% of loads rejected between 1 April and 31 May (35 of 380)” with a run chart of four periods, instead of “rejections are very high”."),
       L(("اكتب القيمة الأساسية وفترتها ومصدرها", "Write the baseline, its period and its source"), ("ارسمها: أعمدة أو خط زمني أو باريتو", "Draw it: bars, a run chart or a Pareto"), ("اكتب الفجوة في سطر واحد", "Write the gap in one line")),
       L(("الرسم ومصدر البيانات", "The chart and the data source"),),
       L(("«كثير» و«سيئ» بدل الأرقام", "“Many” and “bad” instead of numbers"), ("رقم بلا فترة", "A number with no period")),
       B("مالك البيانات", "Data owner"), B("نسبة الصفحات بأساس وفترة ورسم", "Share of A3s with a baseline, period and chart"))
  ]})

S.append({"id": "6.2", "grp": "core", "ph": "plan", "col": "#B8901E", "tint": "#FBF3DF",
  "t": B("البند 6.2 أهداف الجودة والتخطيط لتحقيقها", "Clause 6.2 Quality objectives and planning to achieve them"),
  "s": B("الهدف والخطة", "The goal and the plan"), "sh": B("6.2 · الهدف", "6.2 · Goal"),
  "p": B("الهدف رقم بتاريخ يُكتب قبل معرفة الأسباب، والخطة تقول ماذا ومن ومتى وكيف تُقيَّم النتائج.",
         "The goal is a number with a date written before the causes are known; the plan says what, who, when and how results are evaluated."),
  "fl": L(("قابل للقياس", "Measurable"), ("بتاريخ", "Dated"), ("قبل الأسباب", "Before the causes"), ("الخطة", "Plan")),
  "it": [
    IT("6.2.1", "PL3", B("هدف قابل للقياس بتاريخ", "A measurable goal with a date"),
       R(IS, "تضع المنشأة أهداف الجودة في الوظائف والمستويات والعمليات ذات الصلة، وتكون متسقة مع السياسة، وقابلة للقياس، وتراعي المتطلبات، ومرصودة، ومبلغة، ومحدّثة، ومتاحة معلومات موثقة. والهدف في ISO 9000:2026 ‏(3.7.11) نتيجة يراد تحقيقها، ويمكن أن يسمى غاية أو مستهدفاً.",
         "the organization establishes quality objectives at relevant functions, levels and processes; they are consistent with the policy, measurable, take requirements into account, monitored, communicated, updated and available as documented information. In ISO 9000:2026 (3.7.11) an objective is a result to be achieved, and it can be called an aim, a goal or a target."),
       R(EX, "«نسبة الشحنات المرفوضة من 9.2% إلى أقل من 3% بحلول 31 أغسطس 2026»، كُتب في 2 يونيو، قبل بدء التحقيق في 4 يونيو.",
         "“share of loads rejected from 9.2% to below 3% by 31 August 2026”, written on 2 June, before the investigation started on 4 June."),
       L(("اكتب المقياس والقيمة من وإلى والموعد", "Write the measure, the value from and to, and the date"), ("أرّخ كتابة الهدف", "Date when the goal was written")),
       L(("الهدف بتاريخ كتابته في الكتلة 3", "The goal with the date it was written in block 3"),),
       L(("«تحسين الجودة» هدفاً", "“Improve quality” as the goal"), ("هدف بلا موعد", "A goal with no date")),
       B("مالك الصفحة", "A3 owner"), B("نسبة الصفحات بهدف رقمي مؤرخ", "Share of A3s with a dated numeric goal")),
    IT("GD-4", "x:tools", B("الهدف قبل الأسباب، ولا يُعدَّل ليناسب النتيجة", "The goal before the causes, not changed to fit the result"),
       R(GD, "يُكتب الهدف قبل أن تُعرف الأسباب، لأنه يقول ما يجب أن يحدث، لا ما نعرف أننا نستطيع فعله. ولا يُعدَّل بعد النتيجة ليبدو أنه تحقق. إن عُدّل لسبب حقيقي (تغيّر المتطلب أو ظهر خطأ في القياس الأساسي) يبقى الهدف الأول مكتوباً ومعه السبب. تقارن الأداة تاريخ كتابة الهدف بتاريخ بدء التحليل.",
         "the goal is written before the causes are known, because it says what must happen, not what we know we can do. It is not changed after the result to look met. If it is changed for a real reason (the requirement changed or the baseline was measured wrongly), the first target stays written with the reason. The tool compares the date the goal was written with the date the analysis started."),
       R(EX, "بقي هدف الخرسانة أقل من 3% بعد أن جاءت المتابعة 6%، فسُجّلت النتيجة «تحقق جزئياً» بصدق.",
         "the concrete goal stayed below 3% after the follow-up came in at 6%, so the result was recorded honestly as “partly met”."),
       L(("أرّخ الهدف والتحليل", "Date the goal and the analysis"), ("اكتب سبب أي تعديل", "Write the reason for any change")),
       L(("تاريخ الهدف لا يأتي بعد تاريخ التحليل", "The goal's date is not after the analysis date"),),
       L(("هدف يُكتب بعد اختيار الحل", "A goal written after the solution was chosen"), ("هدف يُخفَّض بعد المتابعة", "A goal lowered after the follow-up")),
       B("الموجّه", "Coach"), B("نسبة الأهداف المكتوبة قبل التحليل", "Share of goals written before the analysis")),
    IT("6.2.2", "DO2", B("الخطة: ماذا ومن ومتى", "The plan: what, who, when"),
       R(IS, "عند التخطيط لتحقيق الأهداف تحدد المنشأة ما سيُعمل، والموارد اللازمة، والمسؤول، وموعد الإنجاز، وطريقة تقييم النتائج.",
         "when planning how to achieve its objectives, the organization determines what will be done, what resources will be required, who will be responsible, when it will be completed, and how the results will be evaluated."),
       R(EX, "لكل إجراء مضاد سطر أو أكثر: «تعديل بيان الطريقة MS-CON-04 — مدير المشروع — 15 يونيو — تم»، والإجراء التصحيحي في CAPA ‏CA-EX-04.",
         "each countermeasure has one line or more: “revise method statement MS-CON-04 — project manager — 15 June — done”, with the corrective action in CAPA CA-EX-04."),
       L(("سطر بمسؤول وتاريخ لكل إجراء مضاد", "A line with an owner and a date for each countermeasure"), ("ضع إجراءات عدم المطابقة في CAPA", "Put the actions of a nonconformity in CAPA")),
       L(("جدول الخطة في الكتلة 6", "The plan table in block 6"),),
       L(("خطة بلا مسؤول أو موعد", "A plan with no owner or date"),),
       B("مالك الصفحة", "A3 owner"), B("نسبة خطوات الخطة المنجزة في موعدها", "Share of plan steps done on time"))
  ]})

S.append({"id": "10.2", "grp": "core", "ph": "cause", "col": "#1B2A4A", "tint": "#E8ECF4",
  "t": B("البند 10.2 عدم المطابقة والإجراء التصحيحي", "Clause 10.2 Nonconformity and corrective action"),
  "s": B("الأسباب والإجراءات والمتابعة والتوحيد", "Causes, countermeasures, follow-up and standardisation"), "sh": B("10.2 · الأسباب", "10.2 · Causes"),
  "p": B("أسباب جذرية مثبتة بالدليل، وإجراء مضاد مختبر لكل منها، ومتابعة بالمقياس نفسه مقابل الهدف، ثم ما يدخل النظام.",
         "Root causes proved by evidence, a tested countermeasure for each, a follow-up on the same measure against the goal, then what goes into the system."),
  "fl": L(("الأسباب", "Causes"), ("الإجراءات", "Countermeasures"), ("الفعالية", "Effectiveness"), ("التوحيد", "Standardise")),
  "it": [
    IT("10.2.1 b 2", "AN1", B("أسباب جذرية مثبتة لا آراء", "Proved root causes, not opinions"),
       R(IS, "لتقييم الحاجة إلى إجراء يزيل سبب أو أسباب عدم المطابقة حتى لا تتكرر أو تقع في مكان آخر، تحدد المنشأة أسبابها. والسبب الجذري في صفحة A3 يُثبت بدليل موضوعي، وهو في ISO 9000:2026 ‏(3.8.6) بيانات تدعم وجود الشيء أو صحته. و«الخطأ البشري» نقطة بداية للسؤال، وليس سبباً جذرياً.",
         "to evaluate the need for action to eliminate the cause(s) of a nonconformity so it does not recur or occur elsewhere, the organization determines its causes. On an A3 a root cause is proved with objective evidence, which ISO 9000:2026 (3.8.6) defines as data supporting the existence or truth of something. “Human error” is a starting point for a question, not a root cause."),
       R(EX, "أُخذ سببان جذريان من التحقيق RC-EX-01 مع دليل كل منهما: «لا نافذة صب صيفية» (24 من 25 شحنة مرفوضة بين الظهر والرابعة) و«العقد لا يطلب ماء مبرداً» (40 من 380 شحنة فقط بماء مبرد).",
         "two root causes were taken from investigation RC-EX-01 with their evidence: “no summer pour window” (24 of 25 rejected loads between noon and 4 pm) and “the contract does not require chilled water” (only 40 of 380 loads with chilled water)."),
       L(("خذ الأسباب من RCA أو عظمة السمكة أو لماذا الخمس برقمها", "Take the causes from RCA, Fishbone or 5 Whys by id"), ("اكتب الدليل بجانب كل سبب", "Write the evidence next to each cause"), ("أعد كتابة كل سبب يشير إلى شخص", "Rewrite any cause that names a person")),
       L(("كتلة التحليل بالأسباب وأدلتها وطرقها", "The analysis block with causes, evidence and methods"),),
       L(("«قلة الوعي» سبباً بلا دليل", "“Lack of awareness” as a cause with no evidence"), ("«خطأ العامل» سبباً جذرياً", "“Operator error” as a root cause")),
       B("مالك الصفحة", "A3 owner"), B("نسبة الأسباب المثبتة بدليل", "Share of causes proved by evidence")),
    IT("GD-5", "DO1", B("إجراء مضاد لكل سبب، مختبر قبل التعميم", "A countermeasure for each cause, tested before roll-out"),
       R(GD, "كل إجراء مضاد مرتبط بسبب جذري مثبت، ولكل سبب مثبت إجراء. ويُختبر الإجراء على نطاق صغير (صبّتان، برج واحد، موقع واحد) قبل تعميمه، ويُسجَّل الأثر المتوقع. والإجراء الذي لم يُختبر افتراض.",
         "every countermeasure is tied to a proved root cause, and every proved cause has a countermeasure. A countermeasure is tested on a small scale (two pours, one tower, one site) before it is rolled out, and its expected effect is written. A countermeasure that was not tested is an assumption."),
       R(EX, "جُرّب نموذج خطة الرفع الجديد في البرج ب لأسبوعين (38 رفعة حزم، لا واحدة بحبل واحد) قبل إصداره للأبراج الثلاثة.",
         "the new lift plan template was trialled on Tower B for two weeks (38 bundle lifts, none with one sling) before it was issued to all three towers."),
       L(("اربط كل إجراء برمز سببه", "Tie each countermeasure to its cause's code"), ("جرّب صغيراً وسجّل النتيجة", "Trial small and record the result")),
       L(("جدول الإجراءات بأسبابها ونتيجة الاختبار", "The countermeasure table with causes and test results"),),
       L(("قائمة إجراءات لا ترتبط بسبب", "A list of actions tied to no cause"), ("تعميم فوري بلا تجربة", "Immediate roll-out with no trial")),
       B("مالك الصفحة", "A3 owner"), B("نسبة الإجراءات المختبرة قبل التعميم", "Share of countermeasures tested before roll-out")),
    IT("10.2.1 d", "CK1", B("المتابعة: الأثر مقابل الهدف", "Follow-up: the effect against the goal"),
       R(IS, "تراجع المنشأة فعالية أي إجراء تصحيحي اتُّخذ. والفعالية في ISO 9000:2026 ‏(3.7.17) مدى تنفيذ الأنشطة المخطط لها وتحقيق النتائج المخطط لها. لذلك تقيس المتابعة المقياس نفسه بالطريقة نفسها لفترة محددة، وتقارن النتيجة بالهدف المكتوب.",
         "the organization reviews the effectiveness of any corrective action taken. In ISO 9000:2026 (3.7.17) effectiveness is the extent to which planned activities are realized and planned results achieved. So the follow-up measures the same measure the same way over a stated period, and compares the result with the written goal."),
       R(EX, "في يوليو وأغسطس رُفضت 20 من 335 شحنة (6%) مقابل هدف أقل من 3%: «تحقق جزئياً».",
         "in July and August 20 of 335 loads were rejected (6%) against a goal below 3%: “partly met”."),
       L(("حدّد فترة المتابعة قبل أن تبدأ", "Set the follow-up period before it starts"), ("قارن بالهدف لا بالأمنية", "Compare with the goal, not with a wish")),
       L(("قيمة المتابعة وفترتها ونتيجتها", "The follow-up value, its period and its result"),),
       L(("«تحسن» دون رقم", "“It improved” with no number"), ("مقياس مختلف في المتابعة", "A different measure in the follow-up")),
       B("مالك البيانات", "Data owner"), B("نسبة الصفحات بمتابعة مكتملة", "Share of A3s with a complete follow-up")),
    IT("10.2.1 f", "CK2", B("وحّد ما نجح، أو ابدأ من جديد", "Standardise what worked, or start again"),
       R(IS, "تجري المنشأة تغييرات على نظام الجودة إذا لزم ذلك، وتحدّث المخاطر والفرص إذا لزم (10.2.1 هـ). وفي صفحة A3 يعني ذلك أن يدخل ما نجح إلى الإجراء أو النموذج أو العقد أو التدريب، وأن يبدأ ما لم يتحقق صفحة أو دورة جديدة.",
         "the organization makes changes to the quality system if necessary, and updates the risks and opportunities if necessary (10.2.1 e). On an A3 this means what worked goes into the procedure, the form, the contract or the training, and what was not achieved starts a new page or cycle."),
       R(EX, "دخلت نافذة الصب إلى بيان الطريقة MS-CON-04 الإصدار 3، وانتقل الالتزام بتبريد الماء إلى الدورة PD-EX-03.",
         "the pour window went into method statement MS-CON-04 rev 3, and compliance with chilled water moved to cycle PD-EX-03."),
       L(("سمِّ الوثيقة وإصدارها", "Name the document and its revision"), ("اكتب ما بقي مفتوحاً والخطوة التالية", "Write what is left open and the next step")),
       L(("الوثيقة المعدلة وإصدارها", "The revised document and its revision"),),
       L(("إجراء نجح ولم يُكتب في أي مكان", "A countermeasure that worked and was written nowhere"),),
       B("مالك العملية", "Process owner"), B("نسبة الصفحات التي وُحّدت نتيجتها", "Share of A3s whose result was standardised")),
    IT("A.10.2", "x:tools", B("متى تستحق المشكلة صفحة A3", "When a problem deserves an A3"),
       R(IS, "يوضح الملحق A.10.2 أن المنشأة تحدد طريقة التعامل مع عدم المطابقة، ومنها مدى التحقيق والطرق المستخدمة، بحسب سياقها، وتراعي خطر التكرار والأثر ومتطلبات العملاء والأطراف المعنية. فالمشكلة البسيطة يكفيها تصحيح وسجل CAPA قصير، والمشكلة المتكررة أو ذات الأثر تستحق صفحة A3، والجسيمة تحقيق RCA كاملاً تأخذ الصفحة أسبابه.",
         "Annex A.10.2 explains that the organization decides how to address nonconformities, including the extent of investigation and the methods used, based on its context, considering the risk of recurrence, the impact and the requirements of customers and other interested parties. A simple problem needs a correction and a short CAPA record; a recurring or high-impact one deserves an A3; a severe one a full RCA investigation whose causes the page takes."),
       R(EX, "المخططات الملغاة أخذت صفحة قصيرة بسبب واحد، والحادث الوشيك في الرفع أخذ تحقيق RCA كاملاً ثم صفحة A3 لإدارة الإجراءات والمتابعة.",
         "the superseded drawings got a short A3 with one cause; the lifting near miss got a full RCA investigation, then an A3 to manage the countermeasures and the follow-up."),
       L(("اختر الأداة بحسب الخطر والتكرار", "Choose the tool by risk and recurrence"),),
       L(("قاعدة مكتوبة لمتى تُفتح صفحة A3", "A written rule for when an A3 is opened"),),
       L(("صفحة A3 لكل صغيرة", "An A3 for every small thing"),),
       B("مدير الجودة", "Quality manager"), B("نسبة المشكلات المتكررة التي لها صفحة", "Share of recurring problems with an A3"))
  ]})

S.append({"id": "4.2", "grp": "core", "ph": "cause", "col": "#C9821A", "tint": "#FCF1DE",
  "t": B("ISO 9000:2026 · 4.2 مبادئ إدارة الجودة", "ISO 9000:2026 · 4.2 Quality management principles"),
  "s": B("الدليل والتحسين", "Evidence and improvement"), "sh": B("4.2 · المبادئ", "4.2 · Principles"),
  "p": B("مبدآن يقف عليهما المنهج: القرار المبني على الدليل، والتحسين.", "Two principles the method stands on: evidence-based decisions, and improvement."),
  "fl": L(("الدليل", "Evidence"), ("التحسين", "Improvement")),
  "it": [
    IT("4.2.7", "AN2", B("طرق الصندوق بدل الرأي", "Toolbox methods instead of opinion"),
       R(IS, "يقول مبدأ القرار المبني على الدليل في ISO 9000:2026 إن القرارات المبنية على تحليل البيانات والمعلومات وتقييمها أرجح أن تحقق النتائج المرجوة، ومن المهم فهم علاقات السبب والنتيجة والعواقب غير المقصودة. لذلك تستخدم صفحة A3 طرق الصندوق: باريتو لتأطير الفجوة، وعظمة السمكة ولماذا الخمس للأسباب، وRCA للتحقيق الكامل، والبيانات للإثبات.",
         "the evidence-based decision-making principle in ISO 9000:2026 says decisions based on the analysis and evaluation of data and information are more likely to produce the desired results, and that it is important to understand cause and effect relationships and unintended consequences. That is why an A3 uses the toolbox methods: Pareto to frame the gap, Fishbone and 5 Whys for the causes, RCA for a full investigation, and data to prove."),
       R(EX, "رسمت فئات باريتو PA-EX-02 الوضع الحالي، وجاءت الأسباب من التحقيق RC-EX-01 الذي استخدم عظمة السمكة FB-EX-02 ولماذا الخمس W5-EX-03.",
         "the categories of Pareto PA-EX-02 drew the current condition, and the causes came from investigation RC-EX-01, which used Fishbone FB-EX-02 and 5 Whys W5-EX-03."),
       L(("سجّل رقم التحليل الذي وجد كل سبب", "Record the id of the analysis that found each cause"),),
       L(("روابط التحليلات في كتلة التحليل", "The analysis links in the analysis block"),),
       L(("أسباب من نقاش الاجتماع فقط", "Causes from the meeting discussion only"),),
       B("مالك الصفحة", "A3 owner"), B("نسبة الأسباب المرتبطة بتحليل", "Share of causes linked to an analysis")),
    IT("4.2.6", "x:tools", B("التحسين: صفحة تلو صفحة", "Improvement: one page after another"),
       R(IS, "يقول مبدأ التحسين في ISO 9000:2026 إن المنشآت الناجحة تركز على التحسين باستمرار. ومن فوائده تركيز أكبر على التحقيق في السبب الجذري وتحديده، والاستخدام الفعال للتعلم. ومن إجراءاته تعليم الناس تطبيق الأدوات والمنهجيات الأساسية، وتتبع تخطيط إجراءات التحسين وتنفيذها ونتائجها. والتحسين في ISO 9000:2026 ‏(3.2.3) نشاط لتعزيز الأداء.",
         "the improvement principle in ISO 9000:2026 says successful organizations have an ongoing focus on improvement. Its benefits include an enhanced focus on root cause investigation and determination and the effective use of learning. Its possible actions include educating people to apply basic tools and methodologies, and tracking the planning, implementation and results of improvement actions. In ISO 9000:2026 (3.2.3) improvement is an activity to enhance performance."),
       R(EX, "انتهت صفحة المخططات الملغاة بفكرة لصفحة تالية: توزيع رقمي يُغني عن النسخ الورقية.",
         "the superseded drawings A3 ended with an idea for a next page: digital distribution that removes paper copies."),
       L(("ابدأ صفحة تالية لما بقي مفتوحاً", "Start a next page for what is left open"),),
       L(("سجل الصفحات ونتائجها", "The register of A3s and their results"),),
       L(("صفحة تُغلق ولا تبدأ بعدها أخرى", "A page closed with nothing after it"),),
       B("الإدارة العليا", "Top management"), B("عدد الصفحات المكتملة في السنة", "A3s completed per year"))
  ]})

S.append({"id": "10.1", "grp": "core", "ph": "learn", "col": "#3C9A5F", "tint": "#E5F4EA",
  "t": B("البند 10.1 التحسين المستمر", "Clause 10.1 Continual improvement"),
  "s": B("من صفحة إلى نظام", "From one page to the system"), "sh": B("10.1 · التحسين", "10.1 · Improvement"),
  "p": B("صفحات A3 مجتمعة تكشف ما يتكرر، فتصير فرص تحسين للنظام كله.", "A3s taken together reveal what repeats, and become improvement opportunities for the whole system."),
  "fl": L(("النتائج", "Results"), ("الفرص", "Opportunities"), ("الإجراءات", "Actions")),
  "it": [
    IT("10.1", "x:tools", B("اقرأ الصفحات معاً", "Read the pages together"),
       R(IS, "تحسّن المنشأة باستمرار ملاءمة نظام الجودة وكفايته وفعاليته، وتنظر في نتائج الرصد والقياس والتحليل والتقييم ونتائج مراجعة الإدارة لتحديد الفرص وتعالجها. ومن الإجراءات تحسين العمليات والمنتجات والخدمات، ومعالجة الاحتياجات المستقبلية، وتصحيح الآثار غير المرغوبة أو منعها أو تقليلها.",
         "the organization continually improves the suitability, adequacy and effectiveness of the quality system, and considers the results of monitoring, measurement, analysis and evaluation and of management review to determine and address opportunities. Actions include improving processes, products and services, addressing future needs, and correcting, preventing or reducing undesired effects."),
       R(EX, "صفحتان من ثلاث انتهتا إلى «النموذج لا يحدد الطريقة» (خطة الرفع، وإجراء الوثائق)، فصارت مراجعة النماذج بنداً في مراجعة الإدارة.",
         "two of three A3s ended at “the template does not set the method” (the lift plan, the document procedure), so a review of the templates became an item for management review."),
       L(("راجع لوحة صفحات A3 كل ربع سنة", "Review the A3 dashboard every quarter"),),
       L(("ملخص صفحات A3 في مراجعة الإدارة", "The A3 summary in management review"),),
       L(("كل صفحة تُقرأ وحدها", "Each page read on its own"),),
       B("مدير الجودة", "Quality manager"), B("عدد الأنماط المتكررة المعالجة", "Repeated patterns addressed"))
  ]})

S.append({"id": "7.1.6", "grp": "core", "ph": "learn", "col": "#1B2A4A", "tint": "#E8ECF4",
  "t": B("البند 7.1.6 المعرفة التنظيمية", "Clause 7.1.6 Organizational knowledge"),
  "s": B("الدروس والفجوات الشائعة", "Lessons and common gaps"), "sh": B("7.1.6 · المعرفة", "7.1.6 · Knowledge"),
  "p": B("الصفحة الواحدة سهلة المشاركة: تُعرض في دقائق، وتنتقل دروسها إلى الفرق والمواقع الأخرى.", "A one-page story is easy to share: it is presented in minutes, and its lessons pass to other teams and sites."),
  "fl": L(("الحفظ", "Retain"), ("المشاركة", "Share"), ("التطبيق", "Apply")),
  "it": [
    IT("7.1.6", "CK3", B("شارك الدرس", "Share the lesson"),
       R(IS, "تحدد المنشأة المعرفة اللازمة لتشغيل عملياتها وتحقيق نتائج نظام الجودة، وتحتفظ بها وتطبقها وتشاركها بالقدر اللازم. ومن أشكالها المعرفة المبنية على الخبرة، والمعرفة المضمّنة في الطرق والعمليات، والمعرفة الممثّلة في المعلومات الموثقة.",
         "the organization determines the knowledge needed to operate its processes and achieve quality system results, and retains, applies and shares it to the extent necessary. Its forms include experience-based knowledge, knowledge built into methods and processes, and knowledge held in documented information."),
       R(EX, "عُرضت صفحة الرفع في حديث السلامة الأسبوعي للأبراج الثلاثة، ودخل رسم الربط في نموذج خطة الرفع.",
         "the lifting A3 was presented at the weekly toolbox talk for the three towers, and the rigging sketch went into the lift plan template."),
       L(("اعرض الصفحة في اجتماع قصير", "Present the page in a short meeting"), ("ضع الدرس في الطريقة نفسها", "Put the lesson into the method itself")),
       L(("سجل الصفحات المشاركة", "The register of shared A3s"),),
       L(("صفحة في ملف لا يفتحه أحد", "A page in a file nobody opens"),),
       B("مدير الجودة", "Quality manager"), B("نسبة الصفحات التي شوركت دروسها", "Share of A3s whose lessons were shared")),
    IT("GD-6", "x:tools", B("الفجوات الشائعة وما يطلبه المدقق", "Common gaps and what an auditor asks for"),
       R(GD, "أكثر ما يضعف صفحة A3: البدء بالحل، والوضع الحالي بالصفات، والهدف بعد الأسباب أو بلا تاريخ، و«الخطأ البشري» سبباً، وإجراءات لا ترتبط بسبب ولا تُختبر، ومتابعة بمقياس آخر، وغياب ما وُحّد. ويطلب المدقق عادةً: الهدف وتاريخ كتابته، والدليل على كل سبب، وربط كل إجراء بسببه، ونتيجة المتابعة بالمقياس نفسه، والوثيقة المعدلة، وسجل CAPA عندما توجد حالة عدم مطابقة. الأداة تفحص هذا آلياً في تبويب التدقيق.",
         "what weakens an A3 most: starting with the solution, a current condition in adjectives, a goal after the causes or with no date, “human error” as a cause, countermeasures tied to no cause and never tested, a follow-up on another measure, and nothing standardised. An auditor usually asks for: the goal and the date it was written, the evidence for each cause, each countermeasure tied to its cause, the follow-up result on the same measure, the revised document, and the CAPA record when a nonconformity is involved. The tool checks this automatically in the Audit tab."),
       R(EX, "فحص التدقيق الآلي على صفحة الرفع: كل الفحوص ناجحة حتى الخطة، والمتابعة لا تنطبق بعد لأن فترتها لم تنتهِ.",
         "the automatic audit on the lifting A3: every check passes up to the plan, and the follow-up does not apply yet because its period has not ended."),
       L(("راجع تبويب التدقيق قبل مراجعة الموجّه", "Check the Audit tab before the coach's review"),),
       L(("نتيجة التدقيق الآلي لكل صفحة", "The automatic audit result for each A3"),),
       L(("صفحة جميلة الشكل بلا دليل", "A good-looking page with no evidence"),),
       B("المدقق الداخلي", "Internal auditor"), B("نسبة الفحوص الناجحة", "Audit pass rate"))
  ]})

# a section whose id is also an item code opens on that item, so the item that carries the section's number comes first
for sec in S:
    sec["it"].sort(key=lambda x: 0 if x["c"] == sec["id"] else 1)

legend = [[p["c"], p["n"]] for p in phases.values()]

DATA = {
    "meta": meta, "std": std, "texts": texts, "phases": phases, "flags": {}, "legend": legend,
    "diagram": {"type": "cycle", "centre": B("A3", "A3")},
    "matrix": {"tab": "", "d": B("", ""), "btn": B("", "")},
    "sections": S, "paths": [],
    "edges": [["0.3.2", "GD-1"], ["GD-1", "GD-2"], ["GD-2", "7.3"], ["GD-1", "GD-3"], ["GD-3", "9.1.3"], ["9.1.3", "6.2.1"], ["6.2.1", "GD-4"],
              ["GD-4", "10.2.1 b 2"], ["4.2.7", "10.2.1 b 2"], ["10.2.1 b 2", "GD-5"], ["GD-5", "6.2.2"], ["6.2.2", "10.2.1 d"],
              ["10.2.1 d", "10.2.1 f"], ["10.2.1 f", "10.1"], ["10.1", "4.2.6"], ["10.1", "7.1.6"], ["A.10.2", "10.2.1 b 2"], ["7.1.6", "GD-6"]],
    "changes": {"note": B("", ""), "tlT": B("", ""), "tlS": B("", ""), "tlCols": 4, "tl": [], "cardsT": B("", ""), "cardsS": B("", ""), "cards": [],
                "corr": {"t": B("", ""), "s": B("", ""), "h": [], "rows": []}, "steps": {"t": B("", ""), "s": B("", ""), "l": B("", "")}},
    "ui": {
        "ar": {"roles": "من يعمل على صفحة A3", "wheelT": "عجلة البنود", "purpose": "الغرض من الأداة", "smap": "خطوات صفحة A3",
               "smapSub": "كل خطوة في سطر. اضغط «اشرح» لفتح البند أو القاعدة التي تخدمها.", "rel": "علاقتها بأدوات المنصة", "comp": "المراجع المساندة",
               "assess": "قيّم هذا في التقييم الذاتي", "assessC": "قيّم هذا في التقييم الذاتي",
               "assessOff": "هذا البند خارج أسئلة التقييم الذاتي، ويُطبَّق مباشرة في صفحة A3.", "offGo": "افتح صفحة A3",
               "actCtx": "يفتح السؤال {s}", "explainA": "اشرح {c} في دليل البنود"},
        "en": {"roles": "Who works on the A3", "wheelT": "Clause wheel", "purpose": "What the tool is for", "smap": "Steps of an A3",
               "smapSub": "One line per step. Select “Explain” to open the clause or rule it serves.", "rel": "How it connects to the platform's tools", "comp": "Supporting references",
               "assess": "Assess this in the self-assessment", "assessC": "Assess this in the self-assessment",
               "assessOff": "This clause is outside the self-assessment questions; it is applied directly in the A3 sheet.", "offGo": "Open the A3 sheet",
               "actCtx": "Opens question {s}", "explainA": "Explain {c} in the clause guide"}
    }
}

if __name__ == "__main__":
    js = ("/* A3 explanation data for the CIA Explain Kit v1.4. A3 problem solving is a method on the PDCA cycle, not a clause.\n"
          "   Clause numbers and titles checked on 2026-10-16 against the uploaded ISO 9001:2026 and ISO 9000:2026 texts.\n"
          "   Requirements are interpretive summaries, not the official text; A3 and lean references, ISO 10009 and ISO 10017 are not uploaded (\"not verified\"). */\n"
          "const EXPLAIN_A3=" + json.dumps(DATA, ensure_ascii=False, indent=1) + ";\n")
    sys.stdout.write(js)
