"""EXPLAIN_FMEA — data for the CIA Explain Kit v1.4 in modules/fmea.html (build step 2026-10-16, FMEA).
FMEA (failure mode and effects analysis) is a method, not a requirement of any standard.
The clause guide is built on ISO 10009:2024 subclause 7.3 and the ISO 9001:2026 clauses the method serves. Checked on 2026-10-16:
  ISO 10009:2024 — through the catalogue tests/build/cat_10009.py, which was checked on 2026-10-16 against the uploaded file
                   ISO-10009-2024-Quality-Management-Guidance-for-Quality-Tools.pdf (BS ISO 10009:2024, first edition 2024-06):
                   7.3 Failure mode and effects analysis (FMEA) — area risk assessment, product and service, team, minimum data medium,
                   capability ••• , effort difficult (Table C.1); a risk-based method used in development and then in production or
                   service delivery; variants (design, process, DRBFM, tooling, software, service design and delivery, monitoring systems);
                   a team activity; a living document updated on unexpected issues; clear criteria for each point of the rating scale and no
                   incentive to score low; single, not compound, failure modes; preparation with flows; a competent facilitator; severity
                   cannot be reduced, only designed out. 6.3 Control plan (a process FMEA as an input; flows, FMEA and control plans reviewed
                   when nonconformities occur). 7.1 SWIFT (a first stage before detailed methods such as FMEA). 7.2 Risk register (FMEA as an
                   input). 7.5 names FMECA and FMEA-MSR among the other relevant tools. Annex A Table A.3 places 7.3 in the Do phase of
                   continual improvement. (The PDF itself is not attached in this session; the catalogue is the checked source.)
  ISO 9001:2026 (ISO_9001_2026en 1.pdf, read on 2026-10-16) — 6.1 Actions to address risks and opportunities (6.1.2: determine, analyse and
                   evaluate risks; plan actions, how to integrate them and evaluate their effectiveness; actions proportionate to the
                   potential impact; NOTE 2 lists ways to address risks); Annex A.6.1.2 (risk-based thinking does not imply formal risk
                   management or a documented risk management process); 8.1 Operational planning and control (criteria for the processes;
                   control planned changes and review unintended ones); 8.3.4 Design and development controls (reviews, verification,
                   validation; action on problems found); 8.5.1 Control of production and service provision (c) monitoring and measurement
                   at appropriate stages; g) actions to prevent human error); 8.5.6 Control of changes; 9.1.3 Analysis and evaluation
                   (e) effectiveness of actions taken to address risks); 10.1 Continual improvement (c) correcting, preventing or reducing
                   undesired effects); 10.2.1 (b) 3) whether similar nonconformities exist or can potentially occur; e) update the risks
                   and opportunities determined during planning)
  ISO 9000:2026 (ISO 9000-2026.pdf; scanned, read by OCR in the DMAIC step) — 4.2.6 Improvement, 4.2.7 Evidence-based decision-making
Not uploaded, so "not verified": IEC 60812, the AIAG-VDA FMEA handbook, ISO 31000 (named only in notes of ISO 9001:2026 Annex A.6.1),
ISO 31010, and any edition of an FMEA handbook (ISO 10009 does not name one).
No text of a standard is reproduced: every "requirement" is an interpretive summary in independent wording.
Items coded GD-n are the author's practical guidance on the method, not clauses. Usage: python3 data_fmea.py > explain_fmea.js"""
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
    "code": "FMEA",
    "name": B("تحليل أنماط الفشل وآثارها (FMEA)", "Failure Mode and Effects Analysis (FMEA)"),
    "edition": B("أداة منهجية: نظرة فريق منظمة إلى أنماط الفشل قبل وقوعها", "Method tool: a structured team look at failure modes before they happen"),
    "status": B("الأداة التاسعة في صندوق أدوات التحسين المستمر", "Ninth tool in the Continual Improvement Toolbox"),
    "cert": False,
    "certNote": B("FMEA منهج، وليس مواصفة ولا متطلباً. تراجعه ISO 10009:2024 في البند 7.3 (إرشادات لا متطلبات)، وتذكره مدخلاً لخطة الضبط في البند 6.3. وتطلب ISO 9001:2026 تحديد المخاطر وتحليلها وتقييمها والتخطيط لمعالجتها (6.1.2) دون أن تفرض طريقة، وتوضح في الملحق A.6.1.2 أن التفكير القائم على المخاطر لا يعني بالضرورة إدارة مخاطر رسمية. والمتطلبات التي يخدمها المنهج: معالجة المخاطر (6.1)، وضبط العمليات (8.1 و8.5.1 بما فيه منع الخطأ البشري)، وضبط التغييرات (8.5.6)، وتقييم فعالية إجراءات المخاطر (9.1.3)، والإجراء التصحيحي (10.2.1)، والتحسين المستمر (10.1).",
                  "FMEA is a method, not a standard or a requirement. ISO 10009:2024 reviews it in subclause 7.3 (guidance, not requirements) and names it as an input to the control plan in 6.3. ISO 9001:2026 asks the organization to determine, analyse and evaluate risks and to plan actions to address them (6.1.2) without imposing a method, and Annex A.6.1.2 explains that risk-based thinking does not imply formal risk management. The requirements the method serves: addressing risks (6.1), controlling processes (8.1 and 8.5.1, including preventing human error), control of changes (8.5.6), evaluating the effectiveness of actions on risks (9.1.3), corrective action (10.2.1) and continual improvement (10.1)."),
    "verified": B("2026-10-16، من الملفات الرسمية المرفوعة إلى المشروع: ISO_9001_2026en 1.pdf، وISO 9000-2026.pdf (ممسوح ضوئياً، قُرئ بالتعرف الضوئي)، وISO 10009:2024 عبر فهرس أدوات الجودة في المنصة الذي تُحقق منه من الملف الرسمي في التاريخ نفسه. كل «متطلب» ملخص تفسيري، وليس النص الرسمي. IEC 60812 ودليل AIAG-VDA FMEA وISO 31000 وISO 31010 غير مرفوعة: «غير متحقق منه».",
                  "2026-10-16, against the official files uploaded to the project: ISO_9001_2026en 1.pdf, ISO 9000-2026.pdf (scanned, read with OCR), and ISO 10009:2024 through the platform's quality tools catalogue, checked against the official file on the same date. Every “requirement” is an interpretive summary, not the official text. IEC 60812, the AIAG-VDA FMEA handbook, ISO 31000 and ISO 31010 are not uploaded: “not verified”.")
}

std = {
    "purpose": B("أن ينظر فريق إلى العملية (أو التصميم) خطوة خطوة ويسأل: كيف يمكن أن تفشل؟ وماذا يرى العميل إن فشلت؟ وما الذي قد يسبب ذلك؟ وما الذي يمنعه أو يكشفه الآن؟ ثم يعالج الأخطر أولاً بإجراءات بمالك وتاريخ، ويقيّم من جديد بالدليل، ويُبقي الدراسة حية.",
                 "For a team to look at the process (or the design) step by step and ask: how could it fail? What would the customer see if it did? What could cause it? What prevents or detects it today? Then to act on the most severe first, with owned and dated actions, rate again with evidence, and keep the study alive."),
    "who": B("مهندسو الجودة والعمليات، ومالكو العمليات، ومسؤولو الصحة والسلامة، وفرق التصميم والتطوير، ومن يخطط لعملية جديدة أو تغيير، ومن يريد منع تكرار فشل وقع.",
             "Quality and process engineers, process owners, HSE leads, design and development teams, anyone planning a new process or a change, and anyone who wants to stop a failure from happening again."),
    "rolesSub": B("FMEA لا تنجح بالجدول؛ تنجح بمن يجلس حوله. ويذكر ISO 10009 أنها نشاط فريق يمثل الوظائف المعنية بميسر كفؤ. هذا توزيع مقترح للأدوار.",
                  "An FMEA does not succeed through the table; it succeeds through who sits around it. ISO 10009 describes it as a team activity representing the functions involved, with a competent facilitator. This is a suggested split of roles."),
    "roles": [
        {"n": B("الميسر", "Facilitator"), "col": "#1B2A4A", "d": B("يحضّر البنية والمقاييس، ويدير النقاش، ويمنع التقييم المتعجل والصياغات المركبة.", "Prepares the structure and the scales, runs the discussion, and stops hurried ratings and compound wording.")},
        {"n": B("مالك العملية", "Process owner"), "col": "#1E8C93", "d": B("يملك الإجراءات بعد الدراسة، ويطلب مراجعتها عند كل تغيير أو فشل جديد.", "Owns the actions after the study and asks for a review at each change or new failure.")},
        {"n": B("من يؤدي العمل", "The people who do the work"), "col": "#C2410C", "d": B("يعرفون كيف تفشل الخطوة فعلاً، وما الضوابط الموجودة حقاً لا على الورق.", "They know how the step really fails, and which controls exist in practice, not only on paper.")},
        {"n": B("الجودة أو السلامة", "Quality or HSE"), "col": "#B8901E", "d": B("يقدمون بيانات الحدوث والأعطال السابقة، ويتحققون من قاعدة الخطورة.", "Bring the occurrence data and past failures, and check the severity rule.")},
        {"n": B("العميل أو الخطوة التالية", "The customer or the next step"), "col": "#3563C9", "d": B("يصف الأثر كما يُرى من جهته، فتُقيَّم الخطورة على الأثر الحقيقي.", "Describes the effect as seen from their side, so severity is rated on the real effect.")}
    ],
    "map": [
        {"no": "1", "t": B("النطاق والفريق", "Scope and team"), "d": B("أين تبدأ العملية وأين تنتهي، ومن يجلس حول الطاولة.", "Where the process starts and stops, and who sits at the table."), "go": "7.3"},
        {"no": "2", "t": B("المقاييس المكتوبة", "Written scales"), "d": B("معنى لكل درجة، قبل أول تقييم.", "A meaning for each level, before the first rating."), "go": "GD-2"},
        {"no": "3", "t": B("بنية العملية", "Process structure"), "d": B("الخطوات بالترتيب قبل أنماط الفشل.", "The steps in order, before the failure modes."), "go": "GD-1"},
        {"no": "4", "t": B("النمط والأثر والسبب", "Mode, effect, cause"), "d": B("نمط منفرد، وأثر من جهة العميل.", "A single mode, an effect from the customer's side."), "go": "GD-3"},
        {"no": "5", "t": B("ضوابط المنع والكشف", "Prevention and detection controls"), "d": B("ما يخفض الحدوث وما يكشف قبل العميل.", "What lowers occurrence and what finds it before the customer."), "go": "8.5.1 c"},
        {"no": "6", "t": B("الخطورة أولاً", "Severity first"), "d": B("أولوية الإجراء بقاعدة، لا برقم الأولوية وحده.", "Action priority by a rule, not by the priority number alone."), "go": "GD-5"},
        {"no": "7", "t": B("الإجراءات", "Actions"), "d": B("مالك وموعد لكل إجراء.", "An owner and a due date for every action."), "go": "6.1.2"},
        {"no": "8", "t": B("إعادة التقييم بالدليل", "Re-rating with evidence"), "d": B("الدرجات من جديد بعد التنفيذ.", "The ratings again after the action."), "go": "9.1.3"},
        {"no": "9", "t": B("وثيقة حية", "A living document"), "d": B("مراجعة بعد التغيير والفشل والتدقيق.", "Reviewed after a change, a failure or an audit."), "go": "8.5.6"},
        {"no": "10", "t": B("إلى خطة الضبط", "Into the control plan"), "d": B("النتائج تدخل خطط الضبط والإجراءات.", "The results feed the control plans and procedures."), "go": "6.3"}
    ],
    "rel": [
        {"code": "DMAIC", "n": B("مشروع التحسين بمنهج DMAIC", "DMAIC improvement project"), "col": "#1B2A4A", "d": B("تبدأ الدراسة من خطوات SIPOC المشروع وأسبابه المثبتة (قراءة فقط)، ويعرض المشروع الدراسات التي تذكره؛ والإجراء الذي يحتاج مشروعاً يذهب إلى DMAIC.", "A study starts from a project's SIPOC steps and proved causes (read-only), and the project lists the studies that name it; an action that needs a project goes to DMAIC."), "tool": "./dmaic.html"},
        {"code": "RCA", "n": B("تحليل السبب الجذري — التحقيق", "Root cause analysis — investigation"), "col": "#1B2A4A", "d": B("الفشل الذي وقع فعلاً: يصبح نمطاً في الدراسة، وأسبابه الجذرية أسباباً.", "A failure that has already happened: it becomes a mode in the study, its root causes the causes."), "tool": "./rca.html"},
        {"code": "Pareto", "n": B("باريتو — تحليل القلة الحيوية", "Pareto — vital few analysis"), "col": "#C9821A", "d": B("الأعطال التي تكررت: الفئة الحيوية نمط فشل بدليل حدوثه.", "The failures that recurred: a vital-few category becomes a failure mode with its occurrence evidence."), "tool": "./pareto.html"},
        {"code": "Fishbone", "n": B("عظمة السمكة", "Fishbone"), "col": "#1E8C93", "d": B("ترسم الأسباب المحتملة لنمط فشل؛ يُؤخذ سببها برقم التحليل.", "Maps the candidate causes of a failure mode; its cause is taken by analysis id."), "tool": "./fishbone.html"},
        {"code": "5 Whys", "n": B("لماذا الخمس", "5 Whys"), "col": "#3563C9", "d": B("تحفر من نمط الفشل إلى سبب يمكن العمل عليه.", "Digs from the failure mode down to a cause that can be acted on."), "tool": "./five-whys.html"},
        {"code": "A3", "n": B("حل المشكلات بأسلوب A3", "A3 problem solving"), "col": "#B8901E", "d": B("للإجراء الذي يحتاج قصة على صفحة واحدة يملكها شخص.", "For an action that needs a one-page story owned by one person."), "tool": "./a3.html"},
        {"code": "CAPA", "n": B("الإجراءات التصحيحية", "Corrective action"), "col": "#C2410C", "d": B("عندما يكون مصدر الدراسة حالة عدم مطابقة، يبقى الإجراء التصحيحي في سجل CAPA الذي تذكره الدراسة.", "When a nonconformity is the source of the study, the corrective action stays in the CAPA record the study names."), "tool": "./capa.html"},
        {"code": "PDCA", "n": B("دورة PDCA", "PDCA cycle"), "col": "#3C9A5F", "d": B("متابعة الإجراءات والضوابط بعد الدراسة في دورة PDCA تُذكر برقمها.", "The follow-up of the actions and controls after the study runs in a PDCA cycle named by its id."), "tool": "./pdca.html"},
        {"code": "ISO 10009", "n": B("دليل أدوات الجودة ISO 10009", "ISO 10009 quality tools guide"), "col": "#7B5BB8", "d": B("يشرح البند 7.3 مع أدوات المخاطر الأخرى (SWIFT 7.1 وسجل المخاطر 7.2)، وتربط خطوة 7.3 في لوحة القصة دراسة FMEA برقمها.", "Explains subclause 7.3 with the other risk tools (SWIFT 7.1, the risk register 7.2), and a 7.3 storyboard step links an FMEA study by its id."), "tool": "./iso10009.html"}
    ],
    "comp": [
        {"code": "ISO 10009:2024 §7.3 · §6.3 · §7.1", "n": B("FMEA وخطة الضبط وSWIFT", "FMEA, the control plan and SWIFT"),
         "d": B("إرشادات لا متطلبات: FMEA منهجية قائمة على المخاطر بفريق ومقاييس واضحة ووثيقة حية؛ وهي مدخل لخطة الضبط؛ وقد يسبقها SWIFT مرحلة أولى. الجدول C.1: تقييم مخاطر، فريق، بيانات متوسطة، قدرة •••، جهد صعب.", "Guidance, not requirements: FMEA is a risk-based method with a team, clear scales and a living document; it feeds the control plan; SWIFT can come first. Table C.1: risk assessment, team, medium data, capability •••, difficult.")},
        {"code": "ISO 9001:2026 §6.1.2 · A.6.1.2", "n": B("معالجة المخاطر", "Actions to address risks"),
         "d": B("تحديد المخاطر وتحليلها وتقييمها، والتخطيط لإجراءات متناسبة وتقييم فعاليتها؛ ولا يُشترط نهج رسمي لإدارة المخاطر.", "Determine, analyse and evaluate risks, plan proportionate actions and evaluate their effectiveness; no formal risk management approach is required.")},
        {"code": "ISO 9001:2026 §8.5.1 · §8.5.6 · §10.2.1", "n": B("الضبط ومنع الخطأ البشري وضبط التغييرات والإجراء التصحيحي", "Controlled conditions, preventing human error, control of changes, corrective action"),
         "d": B("رصد في المراحل المناسبة وإجراءات لمنع الخطأ البشري، ومراجعة التغييرات، وتحديد ما إذا كانت حالات مماثلة قد تحدث وتحديث المخاطر.", "Monitoring at the right stages and actions to prevent human error, reviewing changes, and finding whether similar nonconformities could occur and updating the risks.")},
        {"code": "IEC 60812 · AIAG-VDA FMEA · ISO 31010", "n": B("أدلة FMEA وتقنيات المخاطر (غير متحقق منه)", "FMEA handbooks and risk techniques (not verified)"),
         "d": B("لا يوجد منها شيء مرفوع إلى المشروع، ولا يذكر ISO 10009 أي إصدار يُتبع. فالمقاييس الافتراضية وقاعدة أولوية الإجراء في الأداة صياغتها هي، وليست منقولة من دليل منشور.", "None is uploaded to the project, and ISO 10009 does not say which edition to follow. So the default scales and the action priority rule in the tool are its own wording, not copied from a published handbook.")}
    ],
    "buy": [],
    "buyNote": B("للنص الرسمي للمواصفات استخدم النسخ المنشورة من المنظمة الدولية للتوحيد القياسي، وليس هذه المنصة.",
                 "For the official text of the standards, use the copies published by the International Organization for Standardization, not this platform.")
}

texts = {
    "stdT": B("دليل المنهجية", "Method guide"),
    "stdS": B("كيف تُدار دراسة FMEA صادقة: النطاق والبنية أولاً، والمقاييس المكتوبة قبل التقييم، ونمط الفشل والأثر والسبب، وضوابط المنع والكشف، والخطورة أولاً وحدود رقم الأولوية، وأولوية الإجراء، والإجراءات وإعادة التقييم، وFMEA وثيقة حية، والفجوات الشائعة وما يطلبه المدقق.",
              "How to run an honest FMEA: scope and structure first, scales written before the rating, failure mode – effect – cause, prevention and detection controls, severity first and the limits of the priority number, action priority, actions and re-rating, FMEA as a living document, the common gaps and what an auditor asks for."),
    "clT": B("دليل البنود", "Clause guide"),
    "clS": B("البند 7.3 من ISO 10009:2024 (مع 6.3 و7.1 والجدول C.1)، وبنود ISO 9001:2026 التي يخدمها المنهج بأرقامها: المخاطر 6.1، والتخطيط 8.1، والتصميم 8.3.4، والضبط 8.5.1، والتحليل 9.1.3، وضبط التغييرات 8.5.6، والإجراء التصحيحي 10.2، والتحسين 10.1. لكل بند ملخص تفسيري ومثال وما يطلبه المدقق. قواعد المنهج مرقّمة GD وهي إرشاد لا بنود. الأمثلة توضيحية وليست بيانات حقيقية.",
             "ISO 10009:2024 subclause 7.3 (with 6.3, 7.1 and Table C.1), and the ISO 9001:2026 clauses the method serves, by number: risks 6.1, planning 8.1, design 8.3.4, controlled conditions 8.5.1, analysis 9.1.3, control of changes 8.5.6, corrective action 10.2 and improvement 10.1. Each one has an interpretive summary, an example and what the auditor asks for. The method's rules are coded GD: guidance, not clauses. Examples are illustrative, not real data."),
    "note": B("ما يرد تحت «المتطلب» ملخص تفسيري بصياغة مستقلة، وليس النص الرسمي للمواصفة. وما تحت «كيف تطبقه» و«الفجوات» إرشاد تطبيقي. أرقام البنود وعناوينها متحقق منها من النصوص الرسمية المرفوعة.",
              "Text under “requirement” is an interpretive summary in independent wording, not the official text of the standard. “How to implement” and “common gaps” are practical guidance. Clause numbers and titles were checked against the uploaded official texts."),
    "chgT": B("ما الذي تغيّر", "What changed"),
    "chgS": B("", "")
}

phases = {
    "frame": {"c": "#7A869E", "t": "#EEF1F6", "n": B("المنهج والتحضير", "The method and preparation")},
    "plan": {"c": "#B8901E", "t": "#F7F0DE", "n": B("المخاطر والتخطيط", "Risks and planning")},
    "analyse": {"c": "#1B2A4A", "t": "#E8ECF3", "n": B("التحليل", "Analysis")},
    "act": {"c": "#C9821A", "t": "#FBEFD9", "n": B("الأولوية والإجراء", "Priority and action")},
    "learn": {"c": "#3C9A5F", "t": "#E5F4EA", "n": B("الوثيقة الحية والتعلّم", "The living document and learning")}
}

S = []

S.append({"id": "7.3", "grp": "core", "ph": "frame", "col": "#7A869E", "tint": "#EEF1F6",
  "t": B("ISO 10009:2024 البند 7.3 تحليل أنماط الفشل وآثارها", "ISO 10009:2024 subclause 7.3 Failure mode and effects analysis (FMEA)"),
  "s": B("المنهج والتحضير", "The method and preparation"), "sh": B("7.3 · FMEA", "7.3 · FMEA"),
  "p": B("FMEA نظرة منظمة إلى الأمام يقوم بها فريق: النطاق والبنية أولاً، ثم أنماط الفشل وآثارها وأسبابها وضوابطها، ثم الأخطر أولاً.",
         "FMEA is a structured, team-based look ahead: scope and structure first, then the failure modes, their effects, causes and controls, then the most severe first."),
  "fl": L(("النطاق", "Scope"), ("البنية", "Structure"), ("التحليل", "Analysis"), ("الأولوية", "Priority"), ("الإجراء", "Action")),
  "it": [
    IT("7.3", "PP1", B("FMEA في ISO 10009: نشاط فريق بميسر", "FMEA in ISO 10009: a team activity with a facilitator"),
       R(IS, "يراجع ISO 10009:2024 منهج FMEA في البند 7.3 منهجيةً قائمة على المخاطر لتحديد المشكلات المحتملة وتحليلها وترتيبها أثناء تطوير المنتج أو العملية، ثم أثناء الإنتاج أو تقديم الخدمة. ومن أنواعها: التصميم، والعملية، ومراجعة التصميم المبنية على نمط الفشل، والعِدد، والبرمجيات، وتصميم الخدمة وتقديمها، وأنظمة الرصد. وهي نشاط فريق يمثل الوظائف المعنية وقد يضم العميل، وتحتاج تحضيراً ومخططات تدفق وميسراً كفؤاً ووقتاً، وتتناول أنماط الفشل المنفردة لا المركبة. والمواصفة إرشادات، وFMEA ليس متطلباً في أي مواصفة.",
         "ISO 10009:2024 reviews FMEA in subclause 7.3 as a risk-based method to identify, analyse and rank potential problems during product or process development, then during production or service delivery. Variants include design, process, design review based on failure mode, tooling, software, service design and delivery, and monitoring systems. It is a team activity representing the functions involved and can include the customer; it needs preparation, flow charts, a competent facilitator and time, and covers single, not compound, failure modes. The standard is guidance, and FMEA is not a requirement of any standard."),
       R(EX, "في دراسة استلام الخرسانة جلس حول الطاولة مهندس الجودة ميسراً، ومشرف الصب، وممثل جودة المورد، وفني المختبر، ومسؤول المشتريات؛ خمسة أدوار من ثلاث جهات.",
         "in the concrete receiving study the quality engineer facilitated, with the pour supervisor, the supplier QA representative, the laboratory technician and the procurement officer: five roles from three parties."),
       L(("اختر الفريق من كل وظيفة تلمس العملية", "Pick the team from every function that touches the process"), ("عيّن ميسراً تدرب على المنهج", "Appoint a facilitator trained in the method"), ("اختر نوع الدراسة: عملية أو تصميم", "Choose the type: process or design")),
       L(("قائمة الفريق بأدواره", "The team list with its roles"), ("اسم الميسر", "The facilitator's name")),
       L(("دراسة يملؤها شخص واحد على مكتبه", "A study filled in by one person at a desk"), ("أنماط مركبة في سطر واحد", "Compound modes in one line")),
       B("الميسر", "Facilitator"), B("نسبة الدراسات بفريق من ثلاثة أدوار على الأقل", "Share of studies with a team of at least three roles")),
    IT("GD-1", "PP3", B("النطاق والبنية قبل أنماط الفشل", "Scope and structure before the failure modes"),
       R(GD, "اكتب أين تبدأ العملية وأين تنتهي وما خارجها، ثم ارسم خطواتها بالترتيب (3 إلى 15) من SIPOC مشروع DMAIC أو مخطط التدفق، قبل كتابة أي نمط فشل. فالبنية تمنع القفز إلى الأعطال المعروفة وحدها، وتكشف الخطوات التي لم يُحلَّل فيها شيء. والعملية الكبيرة تبدأ بأسلوب «ماذا لو» المنظم (SWIFT) لتحديد الخطوات الأخطر، ثم تُفصَّل بـ FMEA.",
         "write where the process starts and stops and what is outside it, then map its steps in order (3 to 15) from a DMAIC SIPOC or a flow chart, before writing any failure mode. The structure stops the team from jumping to the known failures only, and shows the steps where nothing was analysed. A large process starts with the structured what-if technique (SWIFT) to find the riskiest steps, then FMEA goes into detail."),
       R(EX, "أُخذت خطوات دراسة الخرسانة السبع من SIPOC المشروع DM-EX-01؛ وكشفت البنية أن خطوتي «الطلب» و«النقل» لم يكن فيهما صف قبل الاجتماع الثاني.",
         "the seven steps of the concrete study were taken from the SIPOC of project DM-EX-01; the structure showed that \"order\" and \"transport\" had no row before the second meeting."),
       L(("ابدأ بالنطاق مكتوباً", "Start with the scope in writing"), ("ارسم الخطوات بالترتيب قبل الأعطال", "Map the steps in order before the failures"), ("تأكد أن لكل خطوة صفاً على الأقل", "Check that every step has at least one row")),
       L(("النطاق وبنية الخطوات", "The scope and the step structure"),),
       L(("دراسة تبدأ من قائمة أعطال معروفة", "A study that starts from a list of known failures"), ("خطوات بلا تحليل", "Steps with no analysis")),
       B("الميسر", "Facilitator"), B("نسبة الدراسات التي حُلّلت فيها كل خطوة", "Share of studies with every step analysed")),
    IT("7.1", "x:tools", B("SWIFT قبل FMEA في العمليات الكبيرة", "SWIFT before FMEA for large processes"),
       R(IS, "يصف ISO 10009:2024 في البند 7.1 أسلوب «ماذا لو» المنظم (SWIFT) طريقةً مرنة عالية المستوى لتحديد المخاطر، تُستخدم وحدها أو مرحلة أولى قبل طرق تفصيلية مثل FMEA؛ يمر الفريق على خطوات العملية بأسئلة «ماذا لو؟» موجهة. ويذكر البند 7.2 سجل المخاطر الذي قد تكون FMEA من مدخلاته.",
         "ISO 10009:2024 subclause 7.1 describes the structured what-if technique (SWIFT) as a flexible, high-level way to identify risks, used alone or as a first stage before detailed methods such as FMEA; the team goes through the process steps with guided \"what if?\" prompts. Subclause 7.2 describes the risk register, which FMEA can feed."),
       R(EX, "قبل موسم الصيف مر فريق الواحة على خطوات الصب بأسئلة «ماذا لو تأخرت الشاحنة؟ ماذا لو تعطل المبرد؟»، ثم أخذ الأخطر منها إلى دراسة FMEA.",
         "before summer Al-Waha's team went through the pour steps asking \"what if the truck is late? what if the chiller fails?\", then took the worst ones into the FMEA."),
       L(("استخدم SWIFT عندما تكون العملية أكثر من 15 خطوة", "Use SWIFT when the process has more than 15 steps"), ("انقل نتائج FMEA إلى سجل المخاطر", "Carry the FMEA results into the risk register")),
       L(("أسئلة «ماذا لو» ونتائجها", "The what-if prompts and their results"),),
       L(("FMEA تفصيلية لعملية لم تُفرز أولاً", "A detailed FMEA of a process never screened first"),),
       B("الميسر", "Facilitator"), B("—", "—")),
    IT("C.1", "x:tools", B("FMEA في الجدول C.1 والملحق A", "FMEA in Table C.1 and Annex A"),
       R(IS, "يصنف الجدول C.1 من ISO 10009:2024 منهج FMEA: مجاله تقييم المخاطر، للمنتج والخدمة، بفريق، والحد الأدنى من البيانات متوسط، ومستوى القدرة ••• (دورة أطول وخبرة قبل التطبيق)، والجهد صعب. ويضعه الجدول A.3 في مرحلة التنفيذ (Do) من دورة التحسين المستمر. ويذكر البند 7.5 بين الأدوات الأخرى ذات الصلة FMECA (مع الحرجية) وFMEA للرصد واستجابة النظام.",
         "Table C.1 of ISO 10009:2024 classifies FMEA: area risk assessment, product and service, team, minimum data medium, level of capability ••• (a longer course and experience before applying), effort difficult. Table A.3 places it in the Do phase of continual improvement. Subclause 7.5 names FMECA (with criticality) and FMEA for monitoring and system response among the other relevant tools."),
       R(EX, "وضع مدير الجودة FMEA في مصفوفة الكفاءة (البند 7.2 من ISO 9001:2026) أداةً بمستوى •••، فلا ييسر الدراسة إلا من حضر الدورة وشارك في دراستين.",
         "the quality manager put FMEA in the competence matrix (ISO 9001:2026 clause 7.2) as a ••• tool, so only someone who took the course and joined two studies facilitates."),
       L(("ضع FMEA في مصفوفة الكفاءة", "Put FMEA in the competence matrix"), ("خطط وقتاً كافياً للدراسة", "Plan enough time for the study")),
       L(("سجل تدريب الميسرين", "The facilitators' training record"),),
       L(("ميسر بلا تدريب", "An untrained facilitator"),),
       B("مدير الجودة", "Quality manager"), B("نسبة الميسرين المؤهلين", "Share of qualified facilitators"))
  ]})

S.append({"id": "6.1", "grp": "core", "ph": "plan", "col": "#B8901E", "tint": "#F7F0DE",
  "t": B("البند 6.1 الإجراءات لمعالجة المخاطر والفرص", "Clause 6.1 Actions to address risks and opportunities"),
  "s": B("المخاطر والتخطيط", "Risks and planning"), "sh": B("6.1 · المخاطر", "6.1 · Risks"),
  "p": B("تطلب المواصفة تحديد المخاطر وتحليلها وتقييمها ومعالجتها دون أن تفرض طريقة. وFMEA طريقة منظمة لذلك على مستوى العملية، بمقاييس مكتوبة قبل التقييم.",
         "The standard asks to determine, analyse, evaluate and address risks without imposing a method. FMEA is a structured way to do it at process level, with scales written before the rating."),
  "fl": L(("التحديد", "Determine"), ("التحليل", "Analyse"), ("التقييم", "Evaluate"), ("الإجراء", "Act"), ("الفعالية", "Effectiveness")),
  "it": [
    IT("6.1.2", "AC2", B("إجراءات بمالك وموعد ومتناسبة مع الخطر", "Owned, dated actions in proportion to the risk"),
       R(IS, "تطلب ISO 9001:2026 في البند 6.1.2 تحديد المخاطر التي قد تؤثر سلباً في القدرة على تقديم منتجات وخدمات مطابقة وتحليلها وتقييمها، والتخطيط لإجراءات معالجتها وكيفية دمجها في العمليات وتقييم فعاليتها، وأن تكون الإجراءات متناسبة مع الأثر المحتمل. وتذكر الملاحظة 2 طرقاً للمعالجة منها إزالة مصدر الخطر وتغيير الاحتمال أو العواقب.",
         "ISO 9001:2026 clause 6.1.2 asks to determine, analyse and evaluate the risks that can affect the ability to provide conforming products and services, to plan actions to address them, how to integrate them into the processes and how to evaluate their effectiveness, with actions proportionate to the potential impact. Note 2 lists ways to address risks, including eliminating the risk source and changing the likelihood or consequences."),
       R(EX, "في دراسة الرافعة: كل صف عالي الأولوية له إجراء بمالك وموعد؛ «حبال الدليل» لمشرف الرفع بموعد 20 سبتمبر، ونُفذ في 18 سبتمبر.",
         "in the crane study every high-priority row has an action with an owner and a due date; \"tag lines\" went to the lifting supervisor, due 20 September, done on 18 September."),
       L(("اكتب لكل إجراء مالكاً وموعداً", "Give every action an owner and a due date"), ("اختر نوع الإجراء: تغيير أو منع أو كشف", "Choose the type: change, prevention or detection"), ("تابع حتى التنفيذ", "Follow it until it is done")),
       L(("جدول الإجراءات بمالكيها ومواعيدها وحالتها", "The action table with owners, dates and status"),),
       L(("إجراء بلا مالك", "An action with no owner"), ("صفوف عالية بلا إجراء", "High rows with no action")),
       B("مالك العملية", "Process owner"), B("نسبة الصفوف عالية الأولوية التي لها إجراء", "Share of high-priority rows with an action")),
    IT("A.6.1.2", "x:tools", B("التفكير القائم على المخاطر لا يفرض FMEA", "Risk-based thinking does not impose FMEA"),
       R(IS, "يوضح الملحق A.6.1.2 من ISO 9001:2026 أن تطبيق التفكير القائم على المخاطر لا يعني استخدام نهج رسمي لإدارة المخاطر ولا عملية موثقة لها، وأن للمؤسسة أن تتبنى نهجاً أوسع بإرشادات أو مواصفات أخرى. فـ FMEA اختيار، يناسب العمليات التي يكون فشلها خطيراً أو مكلفاً.",
         "ISO 9001:2026 Annex A.6.1.2 explains that applying risk-based thinking does not imply a formal risk management approach or a documented risk management process, and that the organization can adopt a more extensive approach through other guidance or standards. So FMEA is a choice, suited to processes whose failure is severe or costly."),
       R(EX, "اختارت الواحة FMEA لعمليات الصب والرفع والمعايرة لأن فشلها خطير أو يمس نتائج الاختبارات، واكتفت بسجل المخاطر لبقية العمليات.",
         "Al-Waha chose FMEA for pouring, lifting and calibration because their failure is severe or touches test results, and kept the risk register for the other processes."),
       L(("اختر العمليات التي تستحق FMEA", "Pick the processes that deserve an FMEA"), ("اكتب سبب الاختيار", "Write down why")),
       L(("قائمة العمليات المختارة وسببها", "The list of chosen processes and why"),),
       L(("FMEA لكل شيء بلا تمييز", "An FMEA for everything without distinction"),),
       B("مدير الجودة", "Quality manager"), B("—", "—")),
    IT("GD-2", "PP2", B("المقاييس المكتوبة قبل التقييم", "Scales written before the rating"),
       R(GD, "لكل درجة من 1 إلى 10 للخطورة والحدوث والكشف معنى مكتوب، يُعتمد بتاريخ قبل أول تقييم ويبقى نفسه طوال الدراسة. ويذكر ISO 10009 البند 7.3 أن لكل درجة معياراً واضحاً، وألا يكون لأحد حافز لخفض الدرجات تجنباً للإجراء. والخطورة تُقيَّم على الأثر، والحدوث على السبب مع ضوابط المنع الحالية، والكشف على قدرة الضوابط الحالية على الاكتشاف قبل العميل. المقاييس الافتراضية في الأداة صياغتها هي، تُعدَّل مع الفريق.",
         "each level from 1 to 10 of severity, occurrence and detection has a written meaning, agreed on a date before the first rating and kept the same across the study. ISO 10009 subclause 7.3 asks for clear criteria for each point and for nobody to gain by scoring low to avoid action. Severity is rated on the effect, occurrence on the cause with the current prevention controls, and detection on how well the current controls find it before the customer. The tool's default scales are its own wording, to be edited with the team."),
       R(EX, "اعتمد فريق الخرسانة المقاييس في 15 سبتمبر وقيّم في 16 سبتمبر؛ وعدّل معنى الخطورة 7 ليذكر «رفض الشحنة عند البوابة».",
         "the concrete team agreed the scales on 15 September and rated on 16 September; it edited severity 7 to name \"load rejected at the gate\"."),
       L(("عدّل المقاييس لتناسب عمليتك", "Edit the scales to fit your process"), ("اعتمدها بتاريخ قبل التقييم", "Agree them on a date before the rating"), ("لا تغيرها في منتصف الدراسة", "Do not change them in the middle of the study")),
       L(("المقاييس المعتمدة بتاريخها", "The agreed scales with their date"),),
       L(("مقاييس تُكتب بعد التقييم", "Scales written after the rating"), ("درجات بلا معنى مكتوب", "Levels with no written meaning")),
       B("الميسر", "Facilitator"), B("نسبة الدراسات بمقاييس معتمدة قبل التقييم", "Share of studies with scales agreed before the rating"))
  ]})

S.append({"id": "8.1", "grp": "core", "ph": "plan", "col": "#B8901E", "tint": "#F7F0DE",
  "t": B("البند 8.1 التخطيط والضبط التشغيلي، والبند 8.3.4 ضوابط التصميم", "Clause 8.1 Operational planning and control, and 8.3.4 design controls"),
  "s": B("المخاطر والتخطيط", "Risks and planning"), "sh": B("8.1 · 8.3.4", "8.1 · 8.3.4"),
  "p": B("FMEA العملية تخدم معايير العمليات وضبطها، وFMEA التصميم تخدم مراجعات التصميم والتحقق منه حيث ينطبق التصميم.",
         "A process FMEA serves the criteria and control of processes; a design FMEA serves design reviews and verification where design applies."),
  "fl": L(("المعايير", "Criteria"), ("الضبط", "Control"), ("التغييرات المخططة", "Planned changes"), ("مراجعة التصميم", "Design review")),
  "it": [
    IT("8.1", "x:tools", B("معايير العمليات وضبط التغييرات المخططة", "Process criteria and control of planned changes"),
       R(IS, "تطلب ISO 9001:2026 في البند 8.1 تخطيط العمليات اللازمة وتنفيذها وضبطها بوضع معايير للعمليات وتطبيق الضبط وفقها، وتنفيذ الإجراءات المحددة في البند 6، وضبط التغييرات المخططة ومراجعة عواقب التغييرات غير المقصودة. وFMEA العملية من طرق تحديد ما يجب ضبطه في كل خطوة.",
         "ISO 9001:2026 clause 8.1 asks to plan, implement and control the processes needed, by establishing criteria for the processes and controlling them accordingly, implementing the actions determined in Clause 6, and controlling planned changes and reviewing the consequences of unintended ones. A process FMEA is one way to decide what must be controlled at each step."),
       R(EX, "خرج من دراسة الخرسانة معياران للعملية: الحرارة 32 °م عند البوابة، والتفريغ خلال 90 دقيقة من الخلط.",
         "the concrete study produced two process criteria: 32 °C at the gate, and discharge within 90 minutes of batching."),
       L(("انقل الضوابط إلى معايير العملية", "Turn the controls into process criteria"), ("ابدأ FMEA قبل التغيير المخطط", "Start the FMEA before a planned change")),
       L(("معايير العملية المرتبطة بالصفوف", "The process criteria linked to the rows"),),
       L(("دراسة لا تغير شيئاً في العملية", "A study that changes nothing in the process"),),
       B("مالك العملية", "Process owner"), B("—", "—")),
    IT("8.3.4", "x:tools", B("FMEA التصميم في مراجعات التصميم", "Design FMEA in design reviews"),
       R(IS, "حيث ينطبق التصميم والتطوير، تطلب ISO 9001:2026 في البند 8.3.4 ضوابط تحدد النتائج المطلوبة، ومراجعات لتقييم قدرة النتائج على تلبية المتطلبات، وتحققاً وتصديقاً، واتخاذ إجراءات على المشكلات التي تظهر فيها، مع معلومات موثقة. وFMEA التصميم أداة مناسبة في هذه المراجعات لتحديد كيف قد تفشل وظيفة المنتج أو الخدمة.",
         "where design and development applies, ISO 9001:2026 clause 8.3.4 asks for controls that define the results to be achieved, reviews to evaluate whether the results can meet requirements, verification and validation, and action on the problems found, with documented information. A design FMEA suits these reviews to find how a product or service function could fail."),
       R(EX, "في تصميم خدمة «الصب الليلي» الجديدة، استُخدمت FMEA تصميم لوظيفة «توفير إضاءة كافية لفحص الهبوط»، فأُضيف برج إنارة متنقل للبوابة.",
         "in designing the new \"night pour\" service, a design FMEA was used on the function \"enough light to read the slump test\", and a mobile light tower was added at the gate."),
       L(("اختر نوع «تصميم» للوظائف قبل الإطلاق", "Choose the \"design\" type for functions before launch"), ("اربط الصفوف بمراجعة التصميم", "Link the rows to the design review")),
       L(("محضر مراجعة التصميم وصفوف FMEA", "The design review record and the FMEA rows"),),
       L(("FMEA تصميم بعد الإطلاق", "A design FMEA after launch"),),
       B("مهندس التصميم", "Design engineer"), B("—", "—"))
  ]})

S.append({"id": "8.5.1", "grp": "core", "ph": "analyse", "col": "#1B2A4A", "tint": "#E8ECF3",
  "t": B("البند 8.5.1 ضبط الإنتاج وتقديم الخدمة", "Clause 8.5.1 Control of production and service provision"),
  "s": B("التحليل: النمط والأثر والسبب والضوابط", "Analysis: mode, effect, cause and controls"), "sh": B("8.5.1 · الضوابط", "8.5.1 · Controls"),
  "p": B("لكل خطوة: الوظيفة، ونمط الفشل المنفرد، وأثره كما يراه العميل، وسببه، وضابط المنع، وضابط الكشف. و«الخطأ البشري» سبب يُزال بالتصميم.",
         "For each step: the function, the single failure mode, its effect as the customer sees it, its cause, the prevention control and the detection control. \"Human error\" is a cause to design out."),
  "fl": L(("الوظيفة", "Function"), ("النمط", "Mode"), ("الأثر", "Effect"), ("السبب", "Cause"), ("الضوابط", "Controls")),
  "it": [
    IT("GD-3", "AN1", B("نمط الفشل والأثر والسبب", "Failure mode, effect and cause"),
       R(GD, "نمط الفشل هو كيف تفشل الخطوة في وظيفتها (نمط منفرد في كل صف). والأثر ما يراه العميل أو الخطوة التالية إن وقع الفشل، وعليه تُقيَّم الخطورة. والسبب ما قد يؤدي إلى النمط، ويُكتب شيئاً يمكن العمل عليه في العملية أو التصميم. فلا يُخلط النمط بالسبب («الحرارة فوق 32 °م» نمط، و«لا يُستخدم الماء المبرد» سبب)، ولا يُكتب الأثر من جهة من ينفذ الخطوة فقط.",
         "the failure mode is how the step fails to do its job (one single mode per row). The effect is what the customer or the next step sees if the failure happens, and severity is rated on it. The cause is what could lead to the mode, written as something that can be acted on in the process or the design. Do not mix the mode and the cause (\"temperature above 32 °C\" is a mode, \"chilled water not used\" is a cause), and do not write the effect only from the side of the person doing the step."),
       R(EX, "R1 في دراسة الخرسانة: الوظيفة «خرسانة لا تزيد على 32 °م»، والنمط «الحرارة فوق 32 °م عند التفريغ»، والأثر «رفض الشحنة؛ وإن فاتت فواصل باردة»، والسبب «لا يُستخدم الماء المبرد في المحطة 1 بعد الظهر».",
         "R1 of the concrete study: function \"concrete at no more than 32 °C\", mode \"temperature above 32 °C at discharge\", effect \"load rejected; if missed, cold joints\", cause \"chilled water not used at plant 1 in the afternoon\"."),
       L(("اكتب نمطاً واحداً في كل صف", "Write one mode per row"), ("صف الأثر من جهة العميل", "Describe the effect from the customer's side"), ("افصل النمط عن السبب", "Keep the mode apart from the cause")),
       L(("صفوف التحليل كاملة", "Complete analysis rows"),),
       L(("نمط وسبب في الخانة نفسها", "Mode and cause in the same cell"), ("أثر لا يذكر العميل", "An effect that does not name the customer")),
       B("الفريق", "The team"), B("نسبة الصفوف المكتملة", "Share of complete rows")),
    IT("8.5.1 g", "AN2", B("منع الخطأ البشري: سبب يُزال بالتصميم", "Preventing human error: a cause to design out"),
       R(IS, "تجعل ISO 9001:2026 في البند 8.5.1 ز) من الظروف المضبوطة للإنتاج وتقديم الخدمة تطبيق إجراءات لمنع الخطأ البشري، حيثما انطبق. فلا يكون «الخطأ البشري» نمط فشل ولا سبباً يُلام عليه شخص؛ بل يُسأل: لماذا كان الخطأ ممكناً، وما الذي في العملية سمح به؟ ثم يُصمم ما يمنعه أو يكشفه.",
         "ISO 9001:2026 clause 8.5.1 g) makes the implementation of actions to prevent human error part of the controlled conditions of production and service provision, as applicable. So \"human error\" is neither a failure mode nor a cause to blame on someone; ask instead why the error was possible and what in the process allowed it, then design what prevents or detects it."),
       R(EX, "في دراسة الرافعة كُتب السبب «عدم انتباه الرافع»، فنبهت الأداة؛ فأعاد الفريق صياغته «الإنزال يتطلب توجيه الحمولة باليد»، وكان الإجراء حبال الدليل.",
         "in the crane study the cause was written \"rigger not paying attention\", and the tool flagged it; the team rewrote it as \"landing requires guiding the load by hand\", and the action was tag lines."),
       L(("اسأل لماذا كان الخطأ ممكناً", "Ask why the error was possible"), ("صمم منعاً للخطأ أو كشفاً آلياً", "Design error-proofing or automatic detection")),
       L(("صفوف لا تحمل «خطأ بشري» ولا اسم شخص", "Rows with no \"human error\" and no person's name"),),
       L(("«خطأ بشري» نمطاً أو سبباً", "\"Human error\" as a mode or a cause"), ("إجراء «توعية» وحده", "\"Awareness\" as the only action")),
       B("الميسر", "Facilitator"), B("عدد تنبيهات «خطأ بشري» المفتوحة", "Number of open \"human error\" flags")),
    IT("8.5.1 c", "AN3", B("ضوابط المنع وضوابط الكشف", "Prevention controls and detection controls"),
       R(IS, "تطلب ISO 9001:2026 في البند 8.5.1 ج) رصداً وقياساً في المراحل المناسبة للتحقق من استيفاء معايير ضبط العمليات ومعايير قبول المنتجات والخدمات. وفي FMEA يُفصل ما يمنع السبب (ضابط منع يخفض الحدوث) عما يكتشف السبب أو النمط قبل العميل (ضابط كشف يحسن الكشف). والضابط يُكتب كما هو مطبق فعلاً، لا كما هو مكتوب في الإجراء.",
         "ISO 9001:2026 clause 8.5.1 c) asks for monitoring and measurement at appropriate stages to verify that the criteria for process control and the acceptance criteria for products and services are met. In FMEA, what prevents the cause (a prevention control that lowers occurrence) is kept apart from what detects the cause or the mode before the customer (a detection control that improves detection). A control is written as it is actually applied, not as written in the procedure."),
       R(EX, "R3 في دراسة الخرسانة: ضابط المنع «مقارنة أسبوعية بالمجس المعاير» (الحدوث 3)، وضابط الكشف «المكعبات بعد 7 أيام» (الكشف 8): كشف متأخر جداً، فكانت أولوية الصف عالية.",
         "R3 of the concrete study: prevention control \"weekly comparison with the calibrated probe\" (occurrence 3), detection control \"cubes at 7 days\" (detection 8): detection far too late, so the row's priority was high."),
       L(("اكتب ضابطي المنع والكشف في خانتين", "Write the prevention and detection controls in two cells"), ("قيّم الحدوث مع ضابط المنع، والكشف مع ضابط الكشف", "Rate occurrence with the prevention control, detection with the detection control")),
       L(("صفوف بضابطي منع وكشف منفصلين", "Rows with separate prevention and detection controls"),),
       L(("ضابط واحد يُحسب منعاً وكشفاً", "One control counted as both prevention and detection"), ("ضوابط على الورق فقط", "Controls on paper only")),
       B("الفريق", "The team"), B("—", "—"))
  ]})

S.append({"id": "9.1.3", "grp": "core", "ph": "act", "col": "#C9821A", "tint": "#FBEFD9",
  "t": B("البند 9.1.3 التحليل والتقييم: الأولوية وإعادة التقييم", "Clause 9.1.3 Analysis and evaluation: priority and re-rating"),
  "s": B("الأولوية والإجراء", "Priority and action"), "sh": B("9.1.3 · الأولوية", "9.1.3 · Priority"),
  "p": B("الخطورة العالية أولاً مهما كان رقم الأولوية، بقاعدة مكتوبة. والخطورة لا تنخفض إلا بتغيير. وبعد التنفيذ تُقيَّم الدرجات من جديد بالدليل.",
         "High severity first whatever the priority number, by a written rule. Severity falls only with a change. After the action, the ratings are given again with evidence."),
  "fl": L(("الخطورة", "Severity"), ("الخطورة × الحدوث", "Severity × occurrence"), ("الكشف", "Detection"), ("الإجراء", "Action"), ("إعادة التقييم", "Re-rating")),
  "it": [
    IT("GD-5", "AC1", B("الخطورة أولاً، وحدود رقم الأولوية", "Severity first, and the limits of the priority number"),
       R(GD, "رقم الأولوية (الخطورة × الحدوث × الكشف) يخفي الخطورة الكبيرة: صف بخطورة 10 وحدوث 2 وكشف 2 رقمه 40، وصف بخطورة 6 وحدوث 6 وكشف 7 رقمه 252. فلا يُرتَّب العمل به وحده. وتستخدم الأداة قاعدة مكتوبة لأولوية الإجراء: «عالية» إذا كانت الخطورة 9 أو 10 مهما كان الحدوث والكشف، أو الخطورة × الحدوث 40 فأكثر، أو 20 فأكثر مع كشف 7 فأكثر؛ ثم «متوسطة» و«منخفضة». ويضع ISO 10009 البند 7.3 الأولوية لخفض الحدوث وإزالة أنماط الفشل عالية الخطورة بالتصميم ما أمكن. والقاعدة صياغة الأداة، وليست منقولة من دليل منشور.",
         "the priority number (severity × occurrence × detection) hides big severities: a row with severity 10, occurrence 2 and detection 2 scores 40, a row with severity 6, occurrence 6 and detection 7 scores 252. So it is not used alone to rank the work. The tool uses a written action priority rule: \"high\" when severity is 9 or 10 whatever occurrence and detection, or severity × occurrence is 40 or more, or 20 or more with detection 7 or more; then \"medium\" and \"low\". ISO 10009 subclause 7.3 puts the priority on reducing occurrence and designing out high-severity failure modes where possible. The rule is the tool's wording, not copied from a published handbook."),
       R(EX, "في دراسة الرافعة: «تقدير الوزن بأقل من الحقيقة» رقمه 40 فقط لكن خطورته 10، فهو «عالٍ» وعولج قبل «تأرجح الحمولة» الذي رقمه 252 وخطورته 6.",
         "in the crane study \"bundle weight underestimated\" scores only 40 but has severity 10, so it is \"high\" and was acted on before \"load swings\", which scores 252 with severity 6."),
       L(("رتّب العمل بأولوية الإجراء لا بالرقم", "Rank the work by action priority, not by the number"), ("عالج كل خطورة 9 أو 10", "Act on every severity 9 or 10"), ("اعرض الرقم للمقارنة فقط", "Show the number for comparison only")),
       L(("قائمة الصفوف عالية الأولوية وإجراءاتها", "The list of high-priority rows and their actions"),),
       L(("ترتيب بالرقم وحده", "Ranking by the number alone"), ("حد ثابت للرقم (مثلاً 100) يقرر كل شيء", "A fixed number threshold (say 100) deciding everything")),
       B("الميسر", "Facilitator"), B("صفوف عالية الأولوية بلا إجراء", "High-priority rows with no action")),
    IT("GD-6", "AC4", B("الخطورة لا تنخفض إلا بتغيير", "Severity falls only with a change"),
       R(GD, "الخطورة تُقيَّم على الأثر، والضابط لا يغير أثر الفشل إذا وقع: ضابط المنع يخفض الحدوث، وضابط الكشف يحسن الكشف. ولا تنخفض الخطورة إلا بتغيير في التصميم أو العملية يزيل الأثر أو يخففه، كما يقول ISO 10009 البند 7.3: الخطورة لا تُخفض، بل تُزال بالتصميم. وتنبّه الأداة إذا خُفضت الخطورة في إعادة التقييم ونوع الإجراء ضابط منع أو كشف.",
         "severity is rated on the effect, and a control does not change the effect of a failure if it happens: a prevention control lowers occurrence and a detection control improves detection. Severity falls only with a design or process change that removes or reduces the effect, as ISO 10009 subclause 7.3 says: severity cannot be reduced, only designed out. The tool warns when severity is lowered in a re-rating while the action is a prevention or detection control."),
       R(EX, "حبال الدليل في دراسة الرافعة أبعدت يد الرافع عن الحمولة: تغيير في العملية، فانخفضت الخطورة من 8 إلى 6. أما الفحص اليومي لميزان الحرارة في دراسة الخرسانة فحسّن الكشف من 8 إلى 4 وبقيت الخطورة 8.",
         "tag lines in the crane study kept the rigger's hand away from the load: a process change, so severity fell from 8 to 6. The daily thermometer check in the concrete study improved detection from 8 to 4, and severity stayed at 8."),
       L(("حدد نوع كل إجراء", "Name the type of each action"), ("لا تخفض الخطورة بضابط", "Do not lower severity with a control")),
       L(("إعادة تقييم تحترم قاعدة الخطورة", "Re-ratings that respect the severity rule"),),
       L(("خطورة تنخفض بفحص إضافي", "Severity lowered by an extra check"),),
       B("الميسر", "Facilitator"), B("—", "—")),
    IT("9.1.3", "AC3", B("إعادة التقييم بالدليل: فعالية الإجراءات", "Re-rating with evidence: the effectiveness of the actions"),
       R(IS, "تطلب ISO 9001:2026 في البند 9.1.3 تحليل البيانات من الرصد والقياس وتقييمها، واستخدام النتائج لتقييم أمور منها هـ) فعالية الإجراءات المتخذة لمعالجة المخاطر. وفي FMEA يعني ذلك أن الدرجات بعد الإجراء تُعطى من جديد بدليل مكتوب (بيانات، ملاحظة، سجلات)، لا بالتمني.",
         "ISO 9001:2026 clause 9.1.3 asks to analyse and evaluate the data from monitoring and measurement, and to use the results to evaluate, among other things, e) the effectiveness of actions taken to address risks. In FMEA this means the ratings after the action are given again with written evidence (data, observation, records), not by wishful thinking."),
       R(EX, "R1 في دراسة الخرسانة: الحدوث من 7 إلى 3 بدليل بيانات ما بعد التغيير في DM-EX-01 (2.4% رفض من 14 سبتمبر إلى 11 أكتوبر).",
         "R1 of the concrete study: occurrence from 7 to 3, with the after-change data of DM-EX-01 as evidence (2.4% rejected from 14 September to 11 October)."),
       L(("أعد التقييم بعد التنفيذ لا قبله", "Re-rate after the action, not before"), ("اكتب الدليل بجانب الدرجات الجديدة", "Write the evidence next to the new ratings")),
       L(("الدرجات قبل وبعد مع الدليل", "Ratings before and after, with the evidence"),),
       L(("درجات جديدة بلا دليل", "New ratings with no evidence"), ("إجراء منفذ لم يُعَد تقييمه", "A completed action never re-rated")),
       B("مالك العملية", "Process owner"), B("نسبة الدراسات المعاد تقييمها بعد إجراءاتها", "Share of studies re-rated after their actions"))
  ]})

S.append({"id": "8.5.6", "grp": "core", "ph": "learn", "col": "#3C9A5F", "tint": "#E5F4EA",
  "t": B("البند 8.5.6 ضبط التغييرات، وISO 10009 البند 6.3 خطة الضبط", "Clause 8.5.6 Control of changes, and ISO 10009 subclause 6.3 control plan"),
  "s": B("الوثيقة الحية والتعلّم", "The living document and learning"), "sh": B("8.5.6 · 6.3", "8.5.6 · 6.3"),
  "p": B("كل تغيير في العملية يعيد فتح الدراسة، ونتائج الدراسة تدخل خطة الضبط والإجراءات.",
         "Every change in the process reopens the study, and the study's results feed the control plan and the procedures."),
  "fl": L(("التغيير", "Change"), ("المراجعة", "Review"), ("خطة الضبط", "Control plan"), ("الإجراءات", "Procedures")),
  "it": [
    IT("8.5.6", "LV1", B("مراجعة الدراسة عند تغيير العملية", "Reviewing the study when the process changes"),
       R(IS, "تطلب ISO 9001:2026 في البند 8.5.6 مراجعة التغييرات في الإنتاج أو تقديم الخدمة وضبطها بالقدر اللازم لضمان استمرار المطابقة، مع معلومات موثقة بنتائج المراجعة ومن اعتمد التغيير. ودراسة FMEA جزء طبيعي من هذه المراجعة: تغيير الخطوة أو المورد أو المعدة يعيد تقييم صفوفها.",
         "ISO 9001:2026 clause 8.5.6 asks to review and control changes for production or service provision to the extent necessary to ensure continuing conformity, with documented information on the results of the review and who authorized the change. The FMEA study is a natural part of that review: a change of step, supplier or equipment re-rates its rows."),
       R(EX, "بعد أن صار الماء المبرد قاعدة في المحطتين، روجعت دراسة الخرسانة في 12 أكتوبر وأعيد تقييم R1–R4.",
         "after chilled water became the rule at both plants, the concrete study was reviewed on 12 October and R1–R4 were re-rated."),
       L(("اجعل مراجعة FMEA بنداً في طلب التغيير", "Make the FMEA review an item of the change request"), ("سجّل التاريخ والفريق وما تغيّر", "Record the date, the team and what changed")),
       L(("مراجعات مؤرخة بعد آخر تغيير", "Dated reviews after the last change"),),
       L(("دراسة لم تُفتح منذ إعدادها", "A study never opened since it was written"),),
       B("مالك العملية", "Process owner"), B("نسبة الدراسات المراجعة بعد آخر تغيير", "Share of studies reviewed after their last change")),
    IT("6.3", "LV2", B("من FMEA إلى خطة الضبط", "From FMEA to the control plan"),
       R(IS, "يصف ISO 10009:2024 في البند 6.3 خطة الضبط: كل مرحلة بالتسلسل، والخصائص المضبوطة بما فيها الخاصة (وكثيراً ما تكون FMEA العملية مدخلاً)، وطريقة القياس وتكراره وتسجيله، وخطة رد الفعل إذا خرجت الخاصية عن المتطلب. ويذكر أن مخططات التدفق وFMEA وخطط الضبط تُراجع وتُحدَّث عند حدوث عدم مطابقة.",
         "ISO 10009:2024 subclause 6.3 describes the control plan: each stage in sequence, the characteristics controlled including special ones (often with a process FMEA as input), the method, frequency and recording of measurement, and the reaction plan if a characteristic does not conform. It notes that flows, FMEA and control plans are reviewed and updated when nonconformities occur."),
       R(EX, "دخلت ضوابط دراسة الخرسانة خطة الضبط في DM-EX-01: حرارة كل شحنة عند البوابة بالميزان المفحوص يومياً، ورد الفعل إيقاف الصب وإبلاغ المحطة فوق 32 °م.",
         "the concrete study's controls went into the control plan of DM-EX-01: the temperature of every load at the gate with the daily-checked thermometer; reaction: stop the pour and call the plant above 32 °C."),
       L(("انقل كل ضابط كشف إلى خطة الضبط", "Carry every detection control into the control plan"), ("حدّث الإجراءات وتعليمات العمل", "Update the procedures and work instructions")),
       L(("خطة ضبط تذكر صفوف FMEA", "A control plan that names the FMEA rows"),),
       L(("خطة ضبط لا علاقة لها بالدراسة", "A control plan unrelated to the study"),),
       B("مالك العملية", "Process owner"), B("—", "—"))
  ]})

S.append({"id": "10.2", "grp": "core", "ph": "learn", "col": "#3C9A5F", "tint": "#E5F4EA",
  "t": B("البند 10.2 عدم المطابقة والإجراء التصحيحي", "Clause 10.2 Nonconformity and corrective action"),
  "s": B("الوثيقة الحية والتعلّم", "The living document and learning"), "sh": B("10.2 · الإجراء التصحيحي", "10.2 · Corrective action"),
  "p": B("كل فشل جديد يعيد فتح الدراسة: هل كان نمطه فيها؟ هل قُيّم صحيحاً؟ وأين قد يحدث مثله؟",
         "Every new failure reopens the study: was its mode in it? Was it rated right? Where else could it happen?"),
  "fl": L(("عدم المطابقة", "Nonconformity"), ("السبب", "Cause"), ("حالات مماثلة", "Similar cases"), ("تحديث المخاطر", "Update the risks")),
  "it": [
    IT("10.2.1", "x:tools", B("بعد عدم المطابقة: حالات مماثلة وتحديث المخاطر", "After a nonconformity: similar cases and updated risks"),
       R(IS, "تطلب ISO 9001:2026 في البند 10.2.1 عند حدوث عدم مطابقة، ضمن تقييم الحاجة إلى إزالة أسبابها، تحديد ما إذا كانت حالات مماثلة موجودة أو قد تحدث (ب) 3))، ثم تحديث المخاطر والفرص المحددة أثناء التخطيط عند الحاجة (هـ). ودراسة FMEA مكان طبيعي لذلك: يُضاف النمط إن لم يكن فيها، ويُعاد تقييم الحدوث والكشف، ويُبحث في الخطوات المماثلة.",
         "ISO 9001:2026 clause 10.2.1 asks, when a nonconformity occurs and as part of evaluating the need to eliminate its causes, to determine whether similar nonconformities exist or can potentially occur (b) 3)), then to update the risks and opportunities determined during planning, if necessary (e)). The FMEA study is a natural place for this: the mode is added if it was missing, occurrence and detection are re-rated, and similar steps are checked."),
       R(EX, "بعد ملاحظة التدقيق IA-2026-07 عن تأخر المعايرة، ومع سجل CAPA CA-EX-02، أُعدت دراسة المعايرة وأُضيف نمط «جهاز مستأجر دون شهادة» الذي لم يكن مكتوباً.",
         "after audit finding IA-2026-07 on overdue calibration, with CAPA record CA-EX-02, the calibration study was written and the mode \"rented device with no certificate\", which had never been written, was added."),
       L(("افتح الدراسة بعد كل عدم مطابقة", "Open the study after each nonconformity"), ("اربطها بسجل CAPA", "Link it to the CAPA record"), ("ابحث عن الخطوات المماثلة", "Look for similar steps")),
       L(("مراجعة بعد عدم المطابقة وربط CAPA", "A review after the nonconformity and the CAPA link"),),
       L(("عدم مطابقة لا يغير شيئاً في الدراسة", "A nonconformity that changes nothing in the study"),),
       B("مدير الجودة", "Quality manager"), B("—", "—")),
    IT("GD-7", "x:tools", B("FMEA يستخدم صندوق الأدوات ولا يحل محله", "FMEA uses the toolbox rather than replacing it"),
       R(GD, "FMEA نظرة إلى الأمام، وبقية الأدوات تكملها: أسلوب «ماذا لو» المنظم أولاً للعملية الكبيرة، وباريتو وRCA للأعطال التي وقعت فعلاً (الفئة الحيوية أو الحدث نمطاً في الدراسة)، وعظمة السمكة ولماذا الخمس للأسباب، وDMAIC وA3 للإجراءات التي تحتاج مشروعاً، وCAPA عندما توجد حالة عدم مطابقة، وPDCA للمتابعة. وتربط الأداة كل ذلك برقمه وتقرأ الأدوات الأخرى دون أن تكتب فيها.",
         "FMEA looks ahead, and the other tools complete it: the structured what-if technique first for a large process, Pareto and RCA for the failures already seen (a vital-few category or the event as a mode in the study), Fishbone and 5 Whys for the causes, DMAIC and A3 for the actions that need a project, CAPA when a nonconformity is involved, and PDCA for the follow-up. The tool links all of these by id and reads the other tools without writing to them."),
       R(EX, "بدأت دراسة الرافعة من التحقيق RC-EX-02 (الحدث نمطاً وسببه الجذري سبباً)، وذكرت صفحة A3-EX-02 التي حملت إجراء الربط بحبلين.",
         "the crane study started from investigation RC-EX-02 (the event as a mode, its root cause as a cause), and named A3-EX-02, which carried the two-sling rigging action."),
       L(("ابدأ من أداة أخرى عندما يكون الفشل قد وقع", "Start from another tool when the failure has already happened"), ("أرسل الإجراء الكبير إلى DMAIC أو A3", "Send a large action to DMAIC or A3")),
       L(("روابط الدراسة بالأدوات الأخرى", "The study's links to the other tools"),),
       L(("FMEA تكرر تحليلاً موجوداً بدل ربطه", "An FMEA repeating an existing analysis instead of linking it"),),
       B("الميسر", "Facilitator"), B("—", "—"))
  ]})

S.append({"id": "10.1", "grp": "core", "ph": "learn", "col": "#3C9A5F", "tint": "#E5F4EA",
  "t": B("البند 10.1 التحسين المستمر، ومبادئ ISO 9000:2026", "Clause 10.1 Continual improvement, and ISO 9000:2026 principles"),
  "s": B("الوثيقة الحية والتعلّم", "The living document and learning"), "sh": B("10.1 · التعلّم", "10.1 · Learning"),
  "p": B("FMEA تمنع الآثار غير المرغوبة قبل وقوعها، وتُبنى على الوقائع والبيانات، وما تتعلمه يدخل الدراسة التالية.",
         "FMEA prevents undesired effects before they happen, rests on facts and data, and what it teaches goes into the next study."),
  "fl": L(("المنع", "Prevent"), ("الدليل", "Evidence"), ("التعلّم", "Learn"), ("التدقيق", "Audit")),
  "it": [
    IT("10.1", "x:tools", B("منع الآثار غير المرغوبة", "Preventing undesired effects"),
       R(IS, "تطلب ISO 9001:2026 في البند 10.1 تحسين ملاءمة النظام وكفايته وفعاليته باستمرار، وأن تشمل الإجراءات أموراً منها ج) تصحيح الآثار غير المرغوبة أو منعها أو خفضها. وFMEA أداة منع: تعالج الفشل قبل أن يقع، وتخفض حدوث ما لا يمكن منعه.",
         "ISO 9001:2026 clause 10.1 asks to continually improve the suitability, adequacy and effectiveness of the system, with actions that include c) correcting, preventing or reducing undesired effects. FMEA is a prevention tool: it acts on a failure before it happens, and lowers the occurrence of what cannot be prevented."),
       R(EX, "بعد دراسة الرافعة لم يتكرر سقوط حمولة في 46 رفعة مراقبة، ودخل الربط بحبلين إجراء الرفع LP-07.",
         "after the crane study no load dropped in 46 observed lifts, and two-sling rigging went into lifting procedure LP-07."),
       L(("انقل ما تعلمته إلى الدراسة التالية", "Carry what you learned into the next study"), ("استخدم الدراسات السابقة نقطة بداية", "Use past studies as a starting point")),
       L(("إجراءات وتعليمات محدّثة من الدراسة", "Procedures and instructions updated from the study"),),
       L(("دراسات لا يُرجع إليها", "Studies nobody goes back to"),),
       B("مدير الجودة", "Quality manager"), B("—", "—")),
    IT("4.2.7", "x:tools", B("التقييم من البيانات والفريق", "Ratings from data and the team"),
       R(IS, "يقوم مبدأ اتخاذ القرار المبني على الدليل في ISO 9000:2026 (4.2.7) على أن القرارات المبنية على تحليل البيانات والمعلومات وتقييمها أكثر احتمالاً لتحقيق النتائج المرجوة، ويقوم مبدأ التحسين (4.2.6) على التركيز المستمر على التحسين. وفي FMEA: يُقيَّم الحدوث من السجلات وبيانات باريتو والأعطال السابقة، ويقرر الفريق الدرجات معاً، لا شخص واحد.",
         "the principle of evidence-based decision-making in ISO 9000:2026 (4.2.7) holds that decisions based on the analysis and evaluation of data and information are more likely to produce the desired results, and the improvement principle (4.2.6) holds to an ongoing focus on improvement. In FMEA, occurrence is rated from records, Pareto data and past failures, and the team decides the ratings together, not one person."),
       R(EX, "دليل الحدوث في R1 من دراسة الخرسانة: «7.9% رفض دون ماء مبرد مقابل 1.9% معه» من تحليل DM-EX-01.",
         "the occurrence evidence of R1 in the concrete study: \"7.9% rejected without chilled water against 1.9% with it\", from the DM-EX-01 analysis."),
       L(("اكتب دليل الحدوث في الصف", "Write the occurrence evidence in the row"), ("قيّم بالإجماع بعد النقاش", "Rate by agreement after discussion")),
       L(("دليل الحدوث للصفوف المهمة", "Occurrence evidence for the important rows"),),
       L(("درجات يقررها شخص واحد", "Ratings decided by one person"),),
       B("الفريق", "The team"), B("—", "—")),
    IT("GD-8", "x:tools", B("الفجوات الشائعة وما يطلبه المدقق", "Common gaps and what an auditor asks for"),
       R(GD, "الفجوات الشائعة: دراسة يملؤها شخص واحد، ومقاييس تُكتب بعد التقييم، وأنماط مركبة، وأثر لا يذكر العميل، و«خطأ بشري» سبباً، وضابط واحد يُحسب منعاً وكشفاً، وترتيب العمل برقم الأولوية وحده، وخطورة تنخفض بفحص، وإجراءات بلا مالك، ودرجات جديدة بلا دليل، ودراسة لم تُفتح منذ إعدادها. وكثيراً ما يطلب المدقق: الفريق والميسر، والمقاييس المعتمدة بتاريخها، والبنية، وجدول التحليل، والصفوف عالية الخطورة وإجراءاتها، وإعادة التقييم بالدليل، وآخر مراجعة بعد تغيير أو عدم مطابقة، وصلة الدراسة بخطة الضبط. وتفحص الأداة ذلك آلياً في تبويب التدقيق.",
         "common gaps: a study filled in by one person, scales written after the rating, compound modes, an effect that does not name the customer, \"human error\" as a cause, one control counted as both prevention and detection, work ranked by the priority number alone, severity lowered by a check, actions with no owner, new ratings with no evidence, and a study never opened since it was written. An auditor usually asks for: the team and the facilitator, the agreed scales with their date, the structure, the analysis table, the high-severity rows and their actions, the re-rating with evidence, the last review after a change or a nonconformity, and the link to the control plan. The tool checks this automatically in the Audit tab."),
       R(EX, "التدقيق الآلي على دراسة الرافعة: كل الفحوص ناجحة ما عدا «لا خطأ بشري»، لأن سبب R4 ما زال «عدم انتباه الرافع».",
         "the automatic audit on the crane study: every check passes except \"no human error\", because the cause of R4 still reads \"rigger not paying attention\"."),
       L(("راجع تبويب التدقيق قبل كل مراجعة", "Check the Audit tab before each review"),),
       L(("نتيجة التدقيق الآلي لكل دراسة", "The automatic audit result for each study"),),
       L(("جدول كبير بلا إجراءات", "A big table with no actions"),),
       B("المدقق الداخلي", "Internal auditor"), B("نسبة الفحوص الناجحة", "Audit pass rate"))
  ]})

# a section whose id is also an item code opens on that item, so the item that carries the section's number comes first
for sec in S:
    sec["it"].sort(key=lambda x: 0 if x["c"] == sec["id"] else 1)

legend = [[p["c"], p["n"]] for p in phases.values()]

DATA = {
    "meta": meta, "std": std, "texts": texts, "phases": phases, "flags": {}, "legend": legend,
    "diagram": {"type": "cycle", "centre": B("FMEA", "FMEA")},
    "matrix": {"tab": "", "d": B("", ""), "btn": B("", "")},
    "sections": S, "paths": [],
    "edges": [["7.1", "7.3"], ["7.3", "GD-1"], ["GD-1", "GD-2"], ["GD-2", "GD-3"], ["6.1.2", "GD-3"], ["A.6.1.2", "6.1.2"], ["8.1", "GD-1"], ["8.3.4", "GD-3"],
              ["GD-3", "8.5.1 g"], ["GD-3", "8.5.1 c"], ["8.5.1 c", "GD-5"], ["GD-5", "6.1.2"], ["GD-5", "GD-6"], ["6.1.2", "9.1.3"], ["GD-6", "9.1.3"],
              ["9.1.3", "8.5.6"], ["8.5.6", "6.3"], ["10.2.1", "8.5.6"], ["10.2.1", "GD-7"], ["9.1.3", "10.1"], ["4.2.7", "9.1.3"], ["C.1", "7.3"], ["10.1", "GD-8"]],
    "changes": {"note": B("", ""), "tlT": B("", ""), "tlS": B("", ""), "tlCols": 4, "tl": [], "cardsT": B("", ""), "cardsS": B("", ""), "cards": [],
                "corr": {"t": B("", ""), "s": B("", ""), "h": [], "rows": []}, "steps": {"t": B("", ""), "s": B("", ""), "l": B("", "")}},
    "ui": {
        "ar": {"roles": "من يعمل في دراسة FMEA", "wheelT": "عجلة البنود", "purpose": "الغرض من الأداة", "smap": "خطوات دراسة FMEA",
               "smapSub": "كل خطوة في سطر. اضغط «اشرح» لفتح البند أو القاعدة التي تخدمها.", "rel": "علاقتها بأدوات المنصة", "comp": "المراجع المساندة",
               "assess": "قيّم هذا في التقييم الذاتي", "assessC": "قيّم هذا في التقييم الذاتي",
               "assessOff": "هذا البند خارج أسئلة التقييم الذاتي، ويُطبَّق مباشرة في دراسة FMEA.", "offGo": "افتح دراسة FMEA",
               "actCtx": "يفتح السؤال {s}", "explainA": "اشرح {c} في دليل البنود"},
        "en": {"roles": "Who works on an FMEA study", "wheelT": "Clause wheel", "purpose": "What the tool is for", "smap": "Steps of an FMEA study",
               "smapSub": "One line per step. Select “Explain” to open the clause or rule it serves.", "rel": "How it connects to the platform's tools", "comp": "Supporting references",
               "assess": "Assess this in the self-assessment", "assessC": "Assess this in the self-assessment",
               "assessOff": "This clause is outside the self-assessment questions; it is applied directly in the FMEA study.", "offGo": "Open the FMEA study",
               "actCtx": "Opens question {s}", "explainA": "Explain {c} in the clause guide"}
    }
}

if __name__ == "__main__":
    js = ("/* FMEA explanation data for the CIA Explain Kit v1.4. FMEA is a method, not a requirement of any standard.\n"
          "   ISO 10009:2024 (7.3, 6.3, 7.1, 7.2, 7.5, Table A.3, Table C.1) checked through tests/build/cat_10009.py; ISO 9001:2026 clause numbers and titles\n"
          "   checked on 2026-10-16 against the uploaded text. Requirements are interpretive summaries, not the official text; IEC 60812, AIAG-VDA FMEA,\n"
          "   ISO 31000 and ISO 31010 are not uploaded (\"not verified\"). */\n"
          "const EXPLAIN_FMEA=" + json.dumps(DATA, ensure_ascii=False, indent=1) + ";\n")
    sys.stdout.write(js)
