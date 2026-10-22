"""EXPLAIN_SWOT — data for the CIA Explain Kit v1.4 in modules/swot.html (build step 2026-10-17, SWOT).
SWOT is a technique, not a requirement of any standard. The clause guide is built on the ISO 9001:2026 clauses the analysis serves.
Checked on 2026-10-17:
  ISO 9001:2026 (ISO_9001_2026en 1.pdf, read on 2026-10-17 with pdftotext) — 4.1 Understanding the organization and its context (external and
                   internal issues relevant to purpose and strategic direction that affect the intended results; determine whether climate
                   change is a relevant issue; monitor and review information about these issues; NOTE 1 issues can be positive and negative
                   factors; NOTE 2 legal, technological, competitive, market, cultural, political, social, economic and environmental issues;
                   NOTE 3 strategic direction, values, culture, resources, knowledge and performance); 4.2 Understanding the needs and
                   expectations of interested parties (a) relevant interested parties, b) their relevant requirements, c) which are addressed
                   through the QMS; monitor and review; NOTE climate change requirements); 6.1 Actions to address risks and opportunities with
                   6.1.1 Determining risks and opportunities (consider 4.1 and 4.2; a)–d)), 6.1.2 Actions to address risks (determine, analyse,
                   evaluate; plan actions, integrate them and evaluate their effectiveness; proportionate; NOTE 2 avoid, take, eliminate the
                   source, change likelihood or consequences, share, retain), 6.1.3 Actions to address opportunities (same pattern; NOTE new
                   practices, products, partnerships, technologies, initiatives); 6.2 Quality objectives and planning to achieve them (6.2.1
                   a)–h); 6.2.2 what, resources, who, when, how evaluated); 9.3.2 Management review inputs (a) status of actions; b) changes in
                   external and internal issues; c) changes in needs and expectations of interested parties; e) opportunities for improvement;
                   g) effectiveness of actions on risks (6.1.2); h) on opportunities (6.1.3)); Annex A.4.1, A.4.2, A.6.1.1–A.6.1.3 (opportunities
                   can be determined from the external and internal context, interested parties, capability and monitoring results; sources such
                   as market conditions, emerging technologies, regulatory requirements; NOTE ISO 31000); A.9.1 NOTE 3 points to ISO 10009.
  ISO 9000:2026 (ISO 9000-2026.pdf; scanned, read by OCR on 2026-10-17) — 3.1.2 context of the organization (combination of internal and external
                   issues that can affect the organization's approach to its objectives); 3.1.4 interested party / stakeholder; 3.7.2 risk (effect
                   of uncertainty; Note 1 an effect is a deviation from the expected, positive or negative); 4.2.7 evidence-based decision-making;
                   4.3.8 risk-based thinking (includes a missed opportunity); 4.4.1 Context of an organization (internal issues such as mission,
                   vision, values, culture, history, knowledge, performance; external issues such as legal, technological, competitive, market,
                   cultural, climate change, social, economic, environmental, governmental); 4.4.2 Interested parties. ISO 9000:2026 has no term
                   entry for "opportunity" (ISO 9001:2026 A.6.1.1 describes it).
  ISO 10009:2024 — 5.1 SWOT analysis (Table 5.1: uses, benefits and points to note — diversity of views, the leadership team with outside
                   input, review often enough, limits of the data, output as the basis for actions), 5.2 PESTLE analysis, 5.3 Porter's five or six
                   forces; Annex A Table A.1 places 5.1, 5.2 and 5.3 in Plan and Act of strategy and business planning; Table C.1 for 5.1:
                   strategy, product and service, team, small data, capability •, easy. Taken from tests/build/cat_10009.py and cards_10009*.py,
                   which were checked against ISO-10009-2024-Quality-Management-Guidance-for-Quality-Tools.pdf on 2026-10-16; the PDF itself is
                   not attached in this step.
Not uploaded, so "not verified": the TOWS matrix as a named method, any strategy textbook, the Balanced Scorecard literature, ISO 31000.
No text of a standard is reproduced: every "requirement" is an interpretive summary in independent wording.
Items coded GD-n are the author's practical guidance on the technique, not clauses. Usage: python3 data_swot.py > explain_swot.js"""
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
    "code": "SWOT",
    "name": B("تحليل SWOT", "SWOT analysis"),
    "edition": B("أداة منهجية: من المصفوفة إلى القرار", "Method tool: from the grid to decisions"),
    "status": B("الأداة الحادية عشرة في صندوق أدوات التحسين المستمر", "Eleventh tool in the Continual Improvement Toolbox"),
    "cert": False,
    "certNote": B("SWOT أسلوب، وليس مواصفة ولا متطلباً. تراجعه ISO 10009:2024 في البند 5.1 مع PESTLE في 5.2 وقوى بورتر في 5.3. والمتطلبات التي يخدمها في ISO 9001:2026: فهم المنشأة وسياقها (4.1)، والأطراف المعنية (4.2)، وتحديد المخاطر والفرص والتخطيط لها (6.1.1 و6.1.2 و6.1.3)، والأهداف وخطط تحقيقها (6.2)، ومدخلات مراجعة الإدارة (9.3.2).",
                  "SWOT is a technique, not a standard or a requirement. ISO 10009:2024 reviews it in 5.1, with PESTLE in 5.2 and Porter's forces in 5.3. The ISO 9001:2026 requirements it serves: understanding the organization and its context (4.1), interested parties (4.2), determining and planning for risks and opportunities (6.1.1, 6.1.2 and 6.1.3), objectives and planning to achieve them (6.2), and management review inputs (9.3.2)."),
    "verified": B("2026-10-17، من الملفات الرسمية المرفوعة إلى المشروع: ISO_9001_2026en 1.pdf، وISO 9000-2026.pdf (ممسوح ضوئياً، قُرئ بالتعرف الضوئي). وأرقام ISO 10009:2024 من فهرس المنصة (cat_10009.py وcards_10009) المتحقق منه من الملف الرسمي في 2026-10-16؛ والملف غير مرفق في هذه الخطوة. كل «متطلب» ملخص تفسيري، وليس النص الرسمي. مصفوفة TOWS بوصفها طريقة مسماة، وكتب الاستراتيجية، وبطاقة الأداء المتوازن، وISO 31000: «غير متحقق منه».",
                  "2026-10-17, against the official files uploaded to the project: ISO_9001_2026en 1.pdf and ISO 9000-2026.pdf (scanned, read with OCR). ISO 10009:2024 numbers come from the platform's catalogue (cat_10009.py and cards_10009), checked against the official file on 2026-10-16; the file is not attached in this step. Every “requirement” is an interpretive summary, not the official text. The TOWS matrix as a named method, strategy textbooks, the Balanced Scorecard and ISO 31000: “not verified”.")
}

std = {
    "purpose": B("أن يتحول فهم السياق إلى قرارات: قوة وضعف داخليان بدليل، وفرص وتهديدات خارجية من مصادر معروفة، مرتبة، ثم خيارات وإجراءات بمالك وموعد، ومخاطر وفرص تدخل خطة 6.1، ثم مراجعة عند تغير السياق. المصفوفة التي لا تصل إلى قرار لا تغيّر شيئاً.",
                 "To turn an understanding of the context into decisions: internal strengths and weaknesses with evidence, external opportunities and threats from known sources, ranked, then options and actions with an owner and a date, risks and opportunities carried into the 6.1 plan, then a review when the context changes. A grid that reaches no decision changes nothing."),
    "who": B("الإدارة العليا وفرق الاستراتيجية، ومديرو الجودة والمخاطر، ومديرو العطاءات والمشاريع، ومالكو العمليات، ومن يعد مراجعة الإدارة، والمدققون الداخليون.",
             "Top management and strategy teams, quality and risk managers, bid and project managers, process owners, whoever prepares management review, and internal auditors."),
    "rolesSub": B("التحليل لا يعمل وحده؛ يعمل بمن يحدد القرار، ومن يجمع الدليل، ومن يملك الإجراء. هذا توزيع مقترح للأدوار.",
                  "The analysis does not work by itself; it works through who sets the decision, who brings the evidence and who owns the action. This is a suggested split of roles."),
    "roles": [
        {"n": B("مالك القرار", "Decision owner"), "col": "#1B2A4A", "d": B("يحدد النطاق والقرار الذي تخدمه الدراسة، ويعتمد الخيارات، ويحمل النتيجة إلى مراجعة الإدارة.", "Sets the scope and the decision the study serves, approves the options, and carries the result to management review.")},
        {"n": B("الميسّر", "Facilitator"), "col": "#1E8C93", "d": B("يجمع الفريق والرأي الخارجي، ويطلب الدليل لكل بند، ويمنع أن يطغى رأي الأعلى منصباً.", "Brings the team and the outside input together, asks for evidence on every item, and keeps the most senior voice from taking over.")},
        {"n": B("أصحاب الدليل", "Evidence holders"), "col": "#3563C9", "d": B("الجودة والمالية والعمليات: مؤشرات الأداء ونتائج التدقيق والدروس وتحليل PESTLE وبيانات السوق.", "Quality, finance and operations: KPIs, audit results, lessons, the PESTLE analysis and market data.")},
        {"n": B("مالكو الإجراءات", "Action owners"), "col": "#C9821A", "d": B("ينفذون الإجراءات بمواعيدها، ويحملون التهديدات إلى سجل المخاطر.", "Carry out the actions on time, and carry the threats into the risk register.")},
        {"n": B("المدقق الداخلي", "Internal auditor"), "col": "#C2410C", "d": B("يسأل: ما القضايا الخارجية والداخلية؟ ومن أين جاءت؟ وما الذي تقرر بسببها؟ ومتى روجعت؟", "Asks: what are the external and internal issues? Where did they come from? What was decided because of them? When were they reviewed?")}
    ],
    "map": [
        {"no": "1", "t": B("النطاق والقرار", "Scope and decision"), "d": B("ماذا نحلل، ولأي قرار.", "What we analyse, and for which decision."), "go": "GD-1"},
        {"no": "2", "t": B("الفريق", "The team"), "d": B("ثلاثة أدوار ورأي من الخارج.", "Three roles and outside input."), "go": "GD-2"},
        {"no": "3", "t": B("الخارجي أولاً", "External first"), "d": B("PESTLE وقوى بورتر والسوق.", "PESTLE, Porter's forces and the market."), "go": "GD-5"},
        {"no": "4", "t": B("الداخلي بدليل", "Internal with evidence"), "d": B("مؤشرات وتدقيق ودروس.", "KPIs, audits and lessons."), "go": "GD-6"},
        {"no": "5", "t": B("كل بند في ربعه", "Each item in its quadrant"), "d": B("الداخلي قوة أو ضعف، والخارجي فرصة أو تهديد.", "Internal is a strength or weakness, external an opportunity or threat."), "go": "GD-4"},
        {"no": "6", "t": B("رتّب", "Rank"), "d": B("وزن ورتبة، والأعلى ثلاثة.", "Weight and rank; the top three."), "go": "GD-7"},
        {"no": "7", "t": B("خيارات TOWS", "TOWS options"), "d": B("SO وST وWO وWT.", "SO, ST, WO and WT."), "go": "GD-8"},
        {"no": "8", "t": B("إجراء بمالك وموعد", "An action with an owner and a date"), "d": B("لكل خيار.", "For every option."), "go": "GD-9"},
        {"no": "9", "t": B("إلى خطة 6.1", "Into the 6.1 plan"), "d": B("التهديدات والفرص العليا.", "The top threats and opportunities."), "go": "6.1.2"},
        {"no": "10", "t": B("راجع وأبلغ", "Review and communicate"), "d": B("عند تغير السياق وفي مراجعة الإدارة.", "When the context changes and at management review."), "go": "9.3.2"}
    ],
    "rel": [
        {"code": "Strategy Studio", "n": B("استوديو الاستراتيجية والأداء", "Strategy & Performance Studio"), "col": "#3563C9", "d": B("تبدأ دراسة من سجل SWOT أو خيار TOWS أو عامل PESTLE فيه (قراءة فقط)، وتبقى أهداف الاستراتيجية ومؤشراتها هناك.", "A study starts from its SWOT register, a TOWS option or a PESTLE factor (read-only); the strategy's objectives and KPIs stay there."), "tool": "./strategy-performance.html#swot"},
        {"code": "Lessons", "n": B("سجل الدروس المستفادة", "Lessons learned register"), "col": "#B8901E", "d": B("الدرس الناجح قوة، والمشكلة ضعف، ودليلهما من الدرس نفسه.", "A success lesson is a strength and a problem lesson a weakness, with the lesson's own evidence."), "tool": "./lessons.html"},
        {"code": "Pareto", "n": B("باريتو — القلة الحيوية", "Pareto — vital few"), "col": "#C9821A", "d": B("فئات القلة الحيوية ضعف داخلي بأرقامه.", "Vital-few categories as internal weaknesses, with their figures."), "tool": "./pareto.html"},
        {"code": "FMEA", "n": B("تحليل أنماط الفشل وآثارها", "Failure mode and effects analysis"), "col": "#B42318", "d": B("الصفوف عالية الأولوية تهديدات للعملية، ومدخل الخطر يسمي الدراسة برقمها.", "High-priority rows as threats to a process, and a risk entry names the study by its id."), "tool": "./fmea.html"},
        {"code": "ISO 10009", "n": B("دليل أدوات الجودة ISO 10009", "ISO 10009 quality tools guide"), "col": "#7B5BB8", "d": B("البند 5.1 SWOT مع 5.2 PESTLE و5.3 قوى بورتر، وأداة SWOT هنا أداته المستقلة على المنصة.", "Clause 5.1 SWOT with 5.2 PESTLE and 5.3 Porter's forces; this SWOT tool is its dedicated platform tool."), "tool": "./iso10009.html#explain-cl"},
        {"code": "ISO 31000", "n": B("استوديو المخاطر ISO 31000", "ISO 31000 Risk Studio"), "col": "#1B2A4A", "d": B("وجهة لمداخل الخطر التي تخرج من التهديدات العليا.", "A destination for the risk entries that come out of the top threats."), "tool": "./iso31000-risk-studio.html"},
        {"code": "RCA · A3 · DMAIC · CAPA · PDCA", "n": B("أدوات حل المشكلات", "Problem-solving tools"), "col": "#3C9A5F", "d": B("ضعف كبير يحتاج تحليل سبب أو مشروع تحسين قبل أن يصبح خياراً.", "A major weakness may need a cause analysis or an improvement project before it becomes an option."), "tool": "./rca.html"}
    ],
    "comp": [
        {"code": "ISO 9001:2026 §4.1 · §4.2 · A.4", "n": B("السياق والأطراف المعنية", "Context and interested parties"),
         "d": B("القضايا الخارجية والداخلية ذات الصلة بالغرض والتوجه الاستراتيجي، ومتابعتها، والأطراف المعنية ومتطلباتها.", "The external and internal issues relevant to purpose and strategic direction, monitoring them, and the interested parties and their requirements.")},
        {"code": "ISO 9001:2026 §6.1.1–6.1.3 · A.6.1", "n": B("المخاطر والفرص", "Risks and opportunities"),
         "d": B("مراعاة القضايا والمتطلبات عند تحديد المخاطر والفرص، والتخطيط للإجراءات ودمجها وتقييم فعاليتها.", "Considering the issues and requirements when determining risks and opportunities, and planning, integrating and evaluating the actions.")},
        {"code": "ISO 9000:2026 §3.1.2 · §3.1.4 · §3.7.2 · §4.4.1 · §4.4.2", "n": B("السياق والطرف المعني والخطر", "Context, interested party, risk"),
         "d": B("سياق المنشأة مزيج من القضايا الداخلية والخارجية، والخطر أثر عدم اليقين إيجاباً أو سلباً.", "The context of the organization is a combination of internal and external issues; risk is the effect of uncertainty, positive or negative.")},
        {"code": "ISO 10009:2024 §5.1 · §5.2 · §5.3", "n": B("SWOT وPESTLE وقوى بورتر", "SWOT, PESTLE and Porter's forces"),
         "d": B("أدوات الاستراتيجية في البند 5، وفي الملحق A في مرحلتي التخطيط والتصرف لتخطيط الاستراتيجية والأعمال.", "The strategy tools of clause 5, placed by Annex A in Plan and Act of strategy and business planning.")},
        {"code": "TOWS · ISO 31000 · BSC", "n": B("TOWS وإدارة المخاطر وبطاقة الأداء (غير متحقق منه)", "TOWS, risk management, scorecard (not verified)"),
         "d": B("لا يوجد منها شيء مرفوع إلى المشروع؛ ISO 31000 مذكورة فقط في ملاحظة الملحق A.6.1. فقواعد المراحل والتدقيق في الأداة صياغتها هي.", "None is uploaded to the project; ISO 31000 is named only in a NOTE of Annex A.6.1. So the stage and audit rules in the tool are its own wording.")}
    ],
    "buy": [],
    "buyNote": B("للنص الرسمي للمواصفات استخدم النسخ المنشورة من المنظمة الدولية للتوحيد القياسي، وليس هذه المنصة.",
                 "For the official text of the standards, use the copies published by the International Organization for Standardization, not this platform.")
}

texts = {
    "stdT": B("دليل المنهجية", "Method guide"),
    "stdS": B("متى يكون SWOT مفيداً: النطاق والقرار، والفريق برأي خارجي، والدليل لكل بند، والداخلي مقابل الخارجي، والترتيب، وخيارات TOWS، والإجراءات ومداخل المخاطر والفرص، والمراجعة عند تغير السياق، والفجوات الشائعة وما يطلبه المدقق.",
              "When a SWOT is useful: scope and decision, a team with outside input, evidence for every item, internal against external, ranking, TOWS options, actions and risk/opportunity entries, review when the context changes, the common gaps and what an auditor asks for."),
    "clT": B("دليل البنود", "Clause guide"),
    "clS": B("بنود ISO 9001:2026 التي يخدمها التحليل بأرقامها: السياق 4.1 والأطراف المعنية 4.2 والملحق A.4، والمخاطر والفرص 6.1.1 و6.1.2 و6.1.3 والملحق A.6.1، والأهداف 6.2، ومدخلات مراجعة الإدارة 9.3.2؛ وتعريفات ISO 9000:2026 ومفاهيمه؛ والبنود 5.1 و5.2 و5.3 من ISO 10009:2024. لكل بند ملخص تفسيري ومثال وما يطلبه المدقق. قواعد الأسلوب مرقّمة GD وهي إرشاد لا بنود. الأمثلة توضيحية وليست بيانات حقيقية.",
             "The ISO 9001:2026 clauses the analysis serves, by number: context 4.1, interested parties 4.2 and Annex A.4, risks and opportunities 6.1.1, 6.1.2 and 6.1.3 and Annex A.6.1, objectives 6.2 and management review inputs 9.3.2; the ISO 9000:2026 terms and concepts; and ISO 10009:2024 5.1, 5.2 and 5.3. Each one has an interpretive summary, an example and what the auditor asks for. The technique's rules are coded GD: guidance, not clauses. Examples are illustrative, not real data."),
    "note": B("ما يرد تحت «المتطلب» ملخص تفسيري بصياغة مستقلة، وليس النص الرسمي للمواصفة. وما تحت «كيف تطبقه» و«الفجوات» إرشاد تطبيقي. أرقام البنود وعناوينها متحقق منها من النصوص الرسمية المرفوعة.",
              "Text under “requirement” is an interpretive summary in independent wording, not the official text of the standard. “How to implement” and “common gaps” are practical guidance. Clause numbers and titles were checked against the uploaded official texts."),
    "chgT": B("ما الذي تغيّر", "What changed"),
    "chgS": B("", "")
}

phases = {
    "ctx": {"c": "#7A869E", "t": "#EEF1F6", "n": B("السياق والقرار", "Context and decision")},
    "evid": {"c": "#3563C9", "t": "#E8EEFA", "n": B("الدليل والموضع والترتيب", "Evidence, placement and ranking")},
    "risk": {"c": "#B7790F", "t": "#FBF1D9", "n": B("المخاطر والفرص", "Risks and opportunities")},
    "act": {"c": "#C9821A", "t": "#F8EEDC", "n": B("الخيارات والإجراءات", "Options and actions")},
    "rev": {"c": "#3C9A5F", "t": "#E5F4EA", "n": B("المراجعة والإبلاغ", "Review and communication")}
}

S = []

S.append({"id": "4.1", "grp": "core", "ph": "ctx", "col": "#7A869E", "tint": "#EEF1F6",
  "t": B("البند 4.1 فهم المنشأة وسياقها", "Clause 4.1 Understanding the organization and its context"),
  "s": B("السياق والقرار", "Context and decision"), "sh": B("4.1 · السياق", "4.1 · Context"),
  "p": B("تطلب المواصفة تحديد القضايا الخارجية والداخلية ومتابعتها. وSWOT طريقة لتنظيمها، بشرط أن يخدم قراراً وأن يُراجع.",
         "The standard asks to determine and monitor the external and internal issues. A SWOT is a way to organise them, provided it serves a decision and is reviewed."),
  "fl": L(("القضايا", "Issues"), ("الخارجي", "External"), ("الداخلي", "Internal"), ("المتابعة", "Monitoring"), ("القرار", "Decision")),
  "it": [
    IT("4.1", "IN2", B("القضايا الخارجية والداخلية: تُحدد وتُتابع", "External and internal issues: determined and monitored"),
       R(IS, "تطلب ISO 9001:2026 في البند 4.1 تحديد القضايا الخارجية والداخلية ذات الصلة بغرض المنشأة وتوجهها الاستراتيجي، والتي تؤثر في قدرة نظام إدارة الجودة على تحقيق نتائجه المقصودة، وتحديد ما إذا كان تغير المناخ قضية ذات صلة، ومتابعة المعلومات عن هذه القضايا ومراجعتها. وتذكر الملاحظات أن القضايا قد تكون عوامل إيجابية أو سلبية، وأن فهم السياق الخارجي يسهل بالنظر في القضايا القانونية والتقنية والتنافسية والسوقية والثقافية والسياسية والاجتماعية والاقتصادية والبيئية، والداخلي بالنظر في التوجه الاستراتيجي والقيم والثقافة والموارد والمعرفة والأداء. ولا تذكر المواصفة SWOT؛ فهو وسيلة لا متطلب.",
         "ISO 9001:2026 clause 4.1 asks to determine the external and internal issues relevant to the organization's purpose and strategic direction that affect the ability of the quality management system to achieve its intended results, to determine whether climate change is a relevant issue, and to monitor and review information about these issues. Its notes say issues can be positive or negative factors, that the external context can be understood by considering legal, technological, competitive, market, cultural, political, social, economic and environmental issues, and the internal one by considering strategic direction, values, culture, resources, knowledge and performance. The standard does not name SWOT; it is a means, not a requirement."),
       R(EX, "في دراسة استراتيجية 2027 لشركة الواحة جاءت «موجات الحر الأطول» قضيةً خارجية من PESTLE البيئي، وقررت الشركة أن تغير المناخ قضية ذات صلة بأعمال الصب، وسجلت ذلك في المصفوفة المؤرخة.",
         "in Al-Waha's 2027 strategy study, \"longer heatwaves\" came in as an external issue from the environmental PESTLE factor; the company decided climate change is a relevant issue for its concrete work and recorded it in the dated grid."),
       L(("اجعل المصفوفة سجل القضايا الخارجية والداخلية بتاريخ", "Use the dated grid as the record of external and internal issues"), ("قرر صراحة هل تغير المناخ قضية ذات صلة، ولماذا", "Decide explicitly whether climate change is relevant, and why"), ("حدد من يتابع كل قضية ومتى تُراجع", "Name who monitors each issue and when it is reviewed")),
       L(("مصفوفة مؤرخة بأسماء المشاركين", "A dated grid with the names of those who took part"), ("قرار مكتوب بشأن تغير المناخ", "A written decision on climate change")),
       L(("قائمة قضايا كُتبت مرة ولم تُراجع", "A list of issues written once and never reviewed"), ("قضايا عامة لا تمس غرض المنشأة", "General issues unrelated to the organization's purpose")),
       B("الإدارة العليا", "Top management"), B("عدد القضايا المراجعة في آخر 12 شهراً", "Issues reviewed in the last 12 months")),
    IT("A.4.1", "x:tools", B("القضايا تتغير مع الوقت", "Issues change over time"),
       R(IS, "يوضح الملحق A.4.1 من ISO 9001:2026 أن القضايا الخارجية والداخلية جزء من سياق المنشأة، وقد تنشأ من عوامل تؤثر في غرضها وتوجهها الاستراتيجي وظروف عملها، وأنها تتغير مع الوقت، وأن الوعي بتغيرها يدعم استمرار فعالية النظام.",
         "Annex A.4.1 of ISO 9001:2026 explains that external and internal issues are part of the organization's context, that they can arise from factors affecting its purpose, strategic direction or operating conditions, that they change over time, and that awareness of the changes supports the continuing effectiveness of the system."),
       R(EX, "لما صدرت متطلبات العزل الحراري بموعد بدء في 2027 أضافت الواحة مراجعة للمصفوفة في 8 أكتوبر 2026، وثبتت وزن الفرصة.",
         "when the thermal insulation requirements came out with a 2027 start date, Al-Waha held a review of the grid on 8 October 2026 and confirmed the opportunity's weight."),
       L(("حدد أحداثاً تستدعي المراجعة فوراً (نظام جديد، عميل كبير، حادث)", "Name events that call for an immediate review (a new regulation, a major client, an incident)"),),
       L(("سجل المراجعات بتاريخها وما تغير", "The review log with dates and what changed"),),
       L(("مصفوفة لا تتغير رغم تغير السوق", "A grid that never changes while the market does"),),
       B("مالك القرار", "Decision owner"), B("—", "—")),
    IT("3.1.2", "x:tools", B("سياق المنشأة في ISO 9000:2026", "Context of the organization in ISO 9000:2026"),
       R(IS, "يعرّف ISO 9000:2026 سياق المنشأة (3.1.2) بأنه مزيج من القضايا الداخلية والخارجية التي قد تؤثر في طريقة المنشأة في تحديد أهدافها وتحقيقها. ويذكر البند 4.4.1 أن السياق الداخلي يشمل الرسالة والرؤية والقيم والثقافة والتاريخ والمعرفة والأداء، والخارجي يشمل القانوني والتقني والتنافسي والسوقي والثقافي وأثر تغير المناخ والاجتماعي والاقتصادي والبيئي والحكومي، وأن فهمه يوضح كيف تدير المنشأة مخاطرها وفرصها.",
         "ISO 9000:2026 defines the context of the organization (3.1.2) as the combination of internal and external issues that can affect the organization's approach to specifying and achieving its objectives. Subclause 4.4.1 says the internal context includes mission, vision, values, culture, history, knowledge and performance, the external one legal, technological, competitive, market, cultural, climate change, social, economic, environmental and governmental influences, and that understanding it clarifies how the organization manages its risks and opportunities."),
       R(EX, "«خبرة الخرسانة في الحر» معرفة وأداء (داخلي)، و«متطلبات العزل الجديدة» تأثير قانوني وحكومي (خارجي).",
         "\"concrete know-how in hot weather\" is knowledge and performance (internal); \"the new insulation requirements\" is a legal and governmental influence (external)."),
       L(("استخدم قوائم 4.4.1 للتأكد أن لا محور غائباً", "Use the 4.4.1 lists to check that no area is missing"),),
       L(("—", "—"),),
       L(("خلط الرسالة والقيم بالبنود", "Mixing mission and values in with the items"),),
       B("الميسّر", "Facilitator"), B("—", "—")),
    IT("GD-1", "x:tools", B("النطاق والقرار قبل المصفوفة", "Scope and decision before the grid"),
       R(GD, "اكتب قبل أي بند: ماذا نحلل (المنشأة، أو وحدة أعمال، أو مشروع، أو عملية، أو عطاء، أو منتج)، وأي قرار ستخدمه الدراسة، ومتى يُتخذ. فالقوة في عطاء مستشفى ليست القوة في عملية الرفع. والدراسة بلا قرار تنتج قائمة لا خيارات. لذلك لا تكتمل مرحلة «حُدد النطاق» حتى يُكتب القرار والتاريخ والميسّر.",
         "write before any item: what is being analysed (the organization, a business unit, a project, a process, a bid or a product), which decision the study serves, and when it is taken. A strength for a hospital bid is not a strength for the lifting process. A study with no decision produces a list, not options. So the \"scoped\" stage is not complete until the decision, the date and the facilitator are written."),
       R(EX, "دراسة العطاء SW-EX-02 تخدم قراراً واحداً: «نتقدم أم لا لمنافسة المستشفى، وبأي سعر أدنى» قبل 20 نوفمبر 2026.",
         "bid study SW-EX-02 serves one decision: \"bid or not for the hospital tender, and at what floor price\" before 20 November 2026."),
       L(("اكتب القرار جملة واحدة بفعل وموعد", "Write the decision as one sentence with a verb and a date"), ("اختر النطاق الأضيق الذي يكفي القرار", "Pick the narrowest scope that serves the decision")),
       L(("القرار المكتوب في رأس الدراسة", "The decision written at the head of the study"),),
       L(("SWOT «عام» للشركة بلا قرار", "A \"general\" company SWOT with no decision"),),
       B("مالك القرار", "Decision owner"), B("نسبة الدراسات التي لها قرار مكتوب", "Share of studies with a written decision"))
  ]})

S.append({"id": "4.2", "grp": "core", "ph": "ctx", "col": "#1E8C93", "tint": "#E3F3F4",
  "t": B("البند 4.2 احتياجات الأطراف المعنية وتوقعاتها", "Clause 4.2 Needs and expectations of interested parties"),
  "s": B("الفريق والأطراف المعنية", "Team and interested parties"), "sh": B("4.2 · الأطراف المعنية", "4.2 · Interested parties"),
  "p": B("الأطراف المعنية مصدر للفرص والتهديدات، ورأيها في الفريق يمنع أن يكون التحليل نظرة من الداخل وحده.",
         "Interested parties are a source of opportunities and threats, and their voice in the team keeps the analysis from being an inside view only."),
  "fl": L(("الأطراف", "Parties"), ("المتطلبات", "Requirements"), ("الفريق", "Team"), ("الرأي الخارجي", "Outside input")),
  "it": [
    IT("4.2", "IN1", B("الأطراف المعنية ومتطلباتها", "Interested parties and their requirements"),
       R(IS, "تطلب ISO 9001:2026 في البند 4.2 تحديد الأطراف المعنية ذات الصلة بنظام إدارة الجودة، ومتطلباتها ذات الصلة، وأي هذه المتطلبات يُعالج من خلال النظام، ومتابعة المعلومات عنها ومراجعتها. وتذكر الملاحظة أن للأطراف المعنية متطلبات قد تتصل بتغير المناخ. ويعرّف ISO 9000:2026 الطرف المعني (3.1.4) بأنه شخص أو منشأة يمكن أن يؤثر في قرار أو نشاط أو يتأثر به أو يرى أنه يتأثر به، ومن أمثلته العملاء والملاك والعاملون والموردون والجهات التنظيمية والشركاء والمجتمع.",
         "ISO 9001:2026 clause 4.2 asks to determine the interested parties relevant to the quality management system, their relevant requirements, and which of these requirements will be addressed through the system, and to monitor and review information about them. Its note says interested parties can have requirements related to climate change. ISO 9000:2026 defines an interested party (3.1.4) as a person or organization that can affect, be affected by, or perceive itself to be affected by a decision or activity; its examples include customers, owners, people in the organization, providers, regulators, partners and society."),
       R(EX, "في دراسة عملية الرفع شارك مورد الرافعات في الفريق، فجاءت منه فرصة «نظام مراقبة الحمل» بعرض سعر مكتوب.",
         "in the lifting process study, the crane supplier joined the team, and the \"load-monitoring retrofit\" opportunity came from him with a written quotation."),
       L(("ادعُ طرفاً معنياً واحداً على الأقل إلى الفريق", "Invite at least one interested party into the team"), ("اربط كل فرصة أو تهديد بطرف معني عند الإمكان", "Link each opportunity or threat to an interested party where possible")),
       L(("قائمة الأطراف المعنية ومتطلباتها", "The list of interested parties and their requirements"), ("أسماء الحاضرين من الخارج", "The names of the outside participants")),
       L(("أطراف معنية في قائمة لا تصل إلى أي تحليل", "Interested parties in a list that never reaches any analysis"),),
       B("الميسّر", "Facilitator"), B("نسبة الدراسات برأي خارجي", "Share of studies with outside input")),
    IT("A.4.2", "x:tools", B("متطلبات تتغير مع الوقت", "Requirements that change over time"),
       R(IS, "يوضح الملحق A.4.2 أن فهم احتياجات الأطراف المعنية يعني تحديد ذات الصلة منها ومتطلباتها، وأن المتطلبات التي تراها المنشأة ذات صلة تدخل حدود النظام، وأنها تتغير مع الوقت فيلزم الوعي بتغيرها، وأن التوقعات المتصلة بتغير المناخ قد تؤثر في المتطلبات النظامية ومتطلبات العملاء.",
         "Annex A.4.2 explains that understanding interested parties' needs means determining the relevant ones and their requirements, that requirements the organization considers relevant come within the boundaries of the system, that they change over time so awareness of the changes is needed, and that expectations about climate change can influence regulatory and customer requirements."),
       R(EX, "طلب العميل الحكومي في المنافسة الأخيرة خطة للأعمال الصيفية، فصار ذلك سبباً إضافياً لخيار ST في دراسة 2027.",
         "the public client asked for a summer works plan in the latest tender, which became one more reason for the ST option in the 2027 study."),
       L(("راجع متطلبات العملاء الجديدة عند كل مراجعة للمصفوفة", "Check new customer requirements at each review of the grid"),),
       L(("—", "—"),),
       L(("متطلب عميل جديد لا يظهر في التحليل", "A new customer requirement that never shows in the analysis"),),
       B("مدير تطوير الأعمال", "Business development manager"), B("—", "—")),
    IT("3.1.4", "x:tools", B("الطرف المعني في ISO 9000:2026", "Interested party in ISO 9000:2026"),
       R(IS, "يعرّف ISO 9000:2026 الطرف المعني (3.1.4)، ويسميه أيضاً صاحب المصلحة، بأنه شخص أو منشأة يمكن أن يؤثر في قرار أو نشاط أو يتأثر به أو يرى أنه يتأثر به. ويذكر البند 4.4.2 أن بعض الأطراف المعنية قد تكون فرصة كبيرة للنجاح المستدام إذا لُبيت احتياجاتها وتوقعاتها، وخطراً إذا لم تُلبَّ، وأن تحديدها جزء من فهم سياق المنشأة.",
         "ISO 9000:2026 defines an interested party (3.1.4), also called a stakeholder, as a person or organization that can affect, be affected by, or perceive itself to be affected by a decision or activity. Subclause 4.4.2 says some interested parties can be a significant opportunity for sustained success if their needs and expectations are met, and a risk if they are not, and that identifying them is part of understanding the context."),
       R(EX, "العميل الحكومي في دراسة العطاء طرف معني يصنع تهديداً («قوة المشتري مرتفعة») وفرصة («برنامج مستشفيات مماثلة») في الوقت نفسه.",
         "the public client in the bid study is an interested party that creates a threat (\"high buyer power\") and an opportunity (\"a programme of similar hospitals\") at the same time."),
       L(("اسأل لكل طرف معني: ما الفرصة وما الخطر؟", "Ask for each interested party: what is the opportunity and what is the risk?"),),
       L(("—", "—"),),
       L(("أطراف معنية تُذكر في قائمة ولا تظهر في المصفوفة", "Interested parties listed but absent from the grid"),),
       B("الميسّر", "Facilitator"), B("—", "—")),
    IT("GD-2", "IN1", B("فريق، لا شخص واحد", "A team, not one person"),
       R(GD, "تحليل شخص واحد ليس تحليلاً SWOT. ثلاثة أدوار على الأقل، وواحد على الأقل من خارج الفريق: عميل أو مورد أو مستشار خارجي أو إدارة أخرى. وتذكر ISO 10009:2024 في نقاط الانتباه للبند 5.1 أن تنوع وجهات النظر شرط وأن فريق القيادة يجريه بمدخلات من خارجه (من فهرس المنصة المتحقق منه). والميسّر يطلب الدليل ويمنع أن يطغى رأي الأعلى منصباً. لذلك تنبّه الأداة على الشخص الواحد، ولا تكتمل مرحلة «اكتمل الفريق» بلا رأي خارجي.",
         "one person's SWOT is not a SWOT. At least three roles, and at least one from outside the team: a customer, a supplier, an external advisor or another department. ISO 10009:2024, in the points to note of 5.1, says diversity of views is a condition and that the leadership team runs it with outside input (from the platform's checked catalogue). The facilitator asks for evidence and keeps the most senior voice from taking over. So the tool flags a one-person study, and the \"team complete\" stage needs outside input."),
       R(EX, "دراسة العطاء ضمت مدير العطاءات ومهندس التسعير ومدير المشاريع والمدير المالي ومقاول الأعمال الكهروميكانيكية.",
         "the bid study brought together the tender manager, the estimating engineer, the projects director, the finance manager and the MEP subcontractor."),
       L(("سمّ ميسّراً لا يملك القرار", "Name a facilitator who does not own the decision"), ("اطلب البنود كتابة قبل النقاش", "Collect items in writing before the discussion")),
       L(("قائمة الفريق بأدوارهم", "The team list with roles"),),
       L(("المدير يكتب المصفوفة وحده", "The manager writes the grid alone"),),
       B("الميسّر", "Facilitator"), B("متوسط عدد الأدوار في الفريق", "Average number of roles in the team"))
  ]})

S.append({"id": "ev", "grp": "core", "ph": "evid", "col": "#3563C9", "tint": "#E8EEFA",
  "t": B("الدليل والموضع والترتيب", "Evidence, placement and ranking"),
  "s": B("قواعد الأسلوب", "Rules of the technique"), "sh": B("الدليل · الترتيب", "Evidence · ranking"),
  "p": B("البند بلا دليل رأي، والبند في غير ربعه يضلل، والقائمة بلا ترتيب لا تقود إلى خيار.",
         "An item with no evidence is an opinion, an item in the wrong quadrant misleads, and a list with no ranking leads to no option."),
  "fl": L(("الدليل", "Evidence"), ("المصدر", "Source"), ("الموضع", "Placement"), ("الوزن", "Weight"), ("الرتبة", "Rank")),
  "it": [
    IT("GD-3", "EV1", B("لكل بند دليل", "Evidence for every item"),
       R(GD, "لكل بند رقم أو واقعة، ومصدرها، وتاريخها. «دورة اعتماد المخططات 21 يوماً مقابل 10 في العقود (مؤشر DWG-01، الربع الثالث 2026)» دليل؛ و«بطء الاعتماد» رأي. والضعف المكتوب «نقص في…» بلا دليل يُنبَّه عليه، لأنه غالباً حل مقترح متخفٍّ في صورة مشكلة. ويعرّف ISO 9000:2026 في مبدأ اتخاذ القرار المبني على الدليل (4.2.7) أن القرارات المبنية على تحليل البيانات وتقييمها أرجح أن تحقق النتائج المرجوة.",
         "each item needs a figure or a fact, its source and its date. \"Drawing approval cycle 21 days against 10 in the contracts (KPI DWG-01, Q3 2026)\" is evidence; \"slow approvals\" is an opinion. A weakness written as \"lack of…\" with no evidence is flagged, because it is often a proposed solution dressed up as a problem. ISO 9000:2026, in the evidence-based decision-making principle (4.2.7), says decisions based on the analysis and evaluation of data are more likely to produce the desired results."),
       R(EX, "في دراسة 2027 كُتب الضعف «نقص منسقي BIM» بدليله: «منسقان مدربان لتسعة مشاريع جارية»، فلم يُنبَّه عليه.",
         "in the 2027 study the weakness \"lack of BIM coordinators\" was written with its evidence, \"two trained coordinators for nine live projects\", so it was not flagged."),
       L(("اكتب الرقم والمصدر والتاريخ في كل بند", "Write the figure, the source and the date on every item"), ("احذف البند الذي لا يجد أحد دليله", "Drop the item nobody can back with evidence"), ("علّم «رأي فقط» بدل إخفائه", "Mark \"opinion only\" rather than hiding it")),
       L(("البنود بأدلتها ومصادرها", "Items with their evidence and sources"),),
       L(("بنود من الانطباع", "Items from impressions"), ("«نقص في…» بلا رقم", "\"Lack of…\" with no figure")),
       B("أصحاب الدليل", "Evidence holders"), B("نسبة البنود العليا بدليل", "Share of top items with evidence")),
    IT("GD-4", "EV2", B("الداخلي قوة أو ضعف، والخارجي فرصة أو تهديد", "Internal is a strength or a weakness, external an opportunity or a threat"),
       R(GD, "القوة والضعف داخليان: ما في يد المنشأة من موارد وكفاءة وعمليات وأداء. والفرص والتهديدات خارجية: ما لا تسيطر عليه من سوق وعملاء ومنافسين وأنظمة وبيئة. وخلطهما يفسد الخيارات: «السوق يكبر» ليست قوة، و«فريقنا صغير» ليس تهديداً. وتفحص الأداة الموضع بنوع المصدر: عامل PESTLE أو قوة بورتر أو بيانات السوق في ربع داخلي، أو مؤشر أو تدقيق أو درس في ربع خارجي، ينبّه عليه حتى يُنقل أو تُكتب ملاحظة لماذا هو هنا.",
         "strengths and weaknesses are internal: the resources, competence, processes and performance the organization controls. Opportunities and threats are external: the market, customers, competitors, regulation and environment it does not control. Mixing them spoils the options: \"the market is growing\" is not a strength, and \"our team is small\" is not a threat. The tool checks placement by source type: a PESTLE factor, a Porter force or market data in an internal quadrant, or a KPI, an audit or a lesson in an external one, is flagged until it is moved or a note says why it belongs there."),
       R(EX, "في عملية الرفع جاءت صفوف FMEA عالية الخطورة تهديدات للعملية بمصدر «تحليل مخاطر»، وهو مصدر لا تنبّه عليه الأداة في أي ربع.",
         "in the lifting process, high-severity FMEA rows came in as threats to the process with the source \"risk analysis\", a source the tool does not flag in any quadrant."),
       L(("ابدأ بالخارجي ثم الداخلي", "Start with the external side, then the internal one"), ("اسأل: هل نسيطر على هذا؟", "Ask: do we control this?")),
       L(("—", "—"),),
       L(("فرص هي في الحقيقة نقاط قوة", "Opportunities that are really strengths"),),
       B("الميسّر", "Facilitator"), B("عدد البنود في غير ربعها", "Items in the wrong quadrant")),
    IT("GD-5", "IN2", B("PESTLE وقوى بورتر تغذي الجانب الخارجي", "PESTLE and Porter's forces feed the external side"),
       R(GD, "الفرص والتهديدات لا تأتي من الاجتماع؛ تأتي من مسح خارجي: PESTLE (العوامل السياسية والاقتصادية والاجتماعية والتقنية والقانونية والبيئية؛ ISO 10009:2024 البند 5.2) وقوى بورتر (المشترون والموردون والداخلون الجدد والبدائل والمنافسة، والقوة السادسة المكمّلون؛ 5.3)، وبيانات السوق والعملاء. وتقرأ الأداة عوامل PESTLE من استوديو الاستراتيجية للقراءة فقط.",
         "opportunities and threats do not come from the meeting; they come from an external scan: PESTLE (political, economic, social, technological, legal and environmental factors; ISO 10009:2024 5.2) and Porter's forces (buyers, suppliers, new entrants, substitutes and rivalry, with complementors as a sixth force; 5.3), plus market and customer data. The tool reads the Strategy Studio's PESTLE factors read-only."),
       R(EX, "في دراسة العطاء جاءت «قوة المشتري مرتفعة» من قوى بورتر: عميل حكومي واحد، وترسية بأقل سعر، وتسعة متقدمين.",
         "in the bid study, \"high buyer power\" came from Porter's forces: one public client, award at the lowest price, nine bidders."),
       L(("أجرِ PESTLE قبل SWOT أو حدّثه", "Run or update PESTLE before the SWOT"), ("اقرأ القطاع بقوى بورتر عند كل عطاء كبير", "Read the sector with Porter's forces for each major bid")),
       L(("عوامل PESTLE بمصادرها", "PESTLE factors with their sources"),),
       L(("فرص وتهديدات بلا مصدر خارجي", "Opportunities and threats with no external source"),),
       B("مدير تطوير الأعمال", "Business development manager"), B("نسبة البنود الخارجية من PESTLE أو بورتر أو السوق", "Share of external items from PESTLE, Porter or the market")),
    IT("GD-6", "IN3", B("المؤشرات والتدقيق والدروس تغذي الجانب الداخلي", "KPIs, audits and lessons feed the internal side"),
       R(GD, "القوة والضعف يأتيان من أداء المنشأة نفسه: مؤشرات الأداء، ونتائج التدقيق الداخلي والخارجي، وفئات القلة الحيوية في باريتو، والدروس المستفادة (الدرس الناجح قوة، والمشكلة ضعف). وتقرأ الأداة الدروس وباريتو للقراءة فقط، وتملأ البند بدليله ورقم مصدره.",
         "strengths and weaknesses come from the organization's own performance: KPIs, internal and external audit results, the vital-few categories of a Pareto, and lessons learned (a success lesson is a strength, a problem lesson a weakness). The tool reads lessons and Pareto read-only and fills the item with its evidence and source id."),
       R(EX, "قوة «حزم مربوطة وحبلان معياراً للشركة» في دراسة الرفع جاءت من الدرس LL-EX-02 بدليله: لا انزلاق في 46 رفعة.",
         "the strength \"banded bundles and two slings as a company standard\" in the lifting study came from lesson LL-EX-02 with its evidence: no slip in 46 lifts."),
       L(("افتح لوحة المؤشرات وتقارير التدقيق قبل الاجتماع", "Open the KPI dashboard and the audit reports before the meeting"), ("ابدأ من الدروس المستفادة الموثقة", "Start from the documented lessons learned")),
       L(("مراجع المؤشرات والتدقيق والدروس", "References to KPIs, audits and lessons"),),
       L(("قوة مبنية على السمعة وحدها", "A strength based on reputation alone"),),
       B("مدير الجودة", "Quality manager"), B("نسبة البنود الداخلية من مؤشر أو تدقيق أو درس", "Share of internal items from a KPI, an audit or a lesson")),
    IT("GD-7", "EV3", B("رتّب واحتفظ بالأهم", "Rank and keep the most important"),
       R(GD, "القوائم الطويلة بلا ترتيب فجوة. لكل بند وزن من 1 إلى 5 ورتبة داخل ربعه، والبنود العليا ثلاثة في كل ربع؛ عليها تُبنى الخيارات. وتنبّه الأداة على الربع الذي فيه أكثر من سبعة بنود دون ترتيب، وعلى الرتب المكررة، وعلى الرتبة التي تخالف الوزن. وزر «رتّب بالوزن» يقترح ترتيباً يراجعه الفريق.",
         "long unranked lists are a gap. Each item gets a weight from 1 to 5 and a rank inside its quadrant; the top items are three per quadrant, and the options are built on them. The tool flags a quadrant with more than seven unranked items, repeated ranks, and a rank that goes against the weight. The \"rank by weight\" button proposes an order for the team to check."),
       R(EX, "في دراسة العطاء جاء «سمعة ضعيفة في القطاع الصحي» رابعاً في الضعف بوزن 2 ودون دليل، فبقي خارج البنود العليا ولم يُبنَ عليه خيار.",
         "in the bid study, \"a weak name in the health sector\" came fourth among the weaknesses, with weight 2 and no evidence, so it stayed out of the top items and no option was built on it."),
       L(("صوّت على الوزن ثم ناقش الفروق", "Vote on the weight, then discuss the differences"), ("احتفظ بأعلى ثلاثة في كل ربع", "Keep the top three in each quadrant")),
       L(("الوزن والرتبة لكل بند", "The weight and rank of every item"),),
       L(("عشرون بنداً في ربع واحد", "Twenty items in one quadrant"),),
       B("الميسّر", "Facilitator"), B("نسبة الدراسات المرتبة", "Share of ranked studies")),
    IT("4.2.7", "x:tools", B("القرار المبني على الدليل", "Evidence-based decision-making"),
       R(IS, "يذكر ISO 9000:2026 مبدأ اتخاذ القرار المبني على الدليل (4.2.7): القرارات المبنية على تحليل البيانات والمعلومات وتقييمها أرجح أن تحقق النتائج المرجوة. وفي SWOT يعني ذلك أن يُحكم على البند بدليله لا بقوة صوت من قاله.",
         "ISO 9000:2026 states the evidence-based decision-making principle (4.2.7): decisions based on the analysis and evaluation of data and information are more likely to produce the desired results. In a SWOT this means an item is judged by its evidence, not by how loudly it was said."),
       R(EX, "رُفعت «الخبرة في الخرسانة الحارة» إلى الوزن 5 لأن دليلها رقمي من مشروعين.",
         "\"hot-weather concrete know-how\" was raised to weight 5 because its evidence is numeric, from two projects."),
       L(("اربط الوزن بقوة الدليل", "Tie the weight to the strength of the evidence"),),
       L(("—", "—"),),
       L(("وزن عالٍ لبند بلا دليل", "A high weight on an item with no evidence"),),
       B("الميسّر", "Facilitator"), B("—", "—"))
  ]})

S.append({"id": "6.1", "grp": "core", "ph": "risk", "col": "#B7790F", "tint": "#FBF1D9",
  "t": B("البند 6.1 الإجراءات للتعامل مع المخاطر والفرص", "Clause 6.1 Actions to address risks and opportunities"),
  "s": B("المخاطر والفرص", "Risks and opportunities"), "sh": B("6.1 · المخاطر والفرص", "6.1 · Risks and opportunities"),
  "p": B("تطلب المواصفة مراعاة القضايا (4.1) والمتطلبات (4.2) عند تحديد المخاطر والفرص، ثم التخطيط لها. والتهديدات والفرص العليا في SWOT مدخل مباشر لذلك.",
         "The standard asks to consider the issues (4.1) and requirements (4.2) when determining risks and opportunities, then to plan for them. The top threats and opportunities of a SWOT feed straight into that."),
  "fl": L(("التحديد", "Determine"), ("المخاطر", "Risks"), ("الفرص", "Opportunities"), ("التخطيط", "Plan"), ("الفعالية", "Effectiveness")),
  "it": [
    IT("6.1.1", "DE3", B("تحديد المخاطر والفرص من القضايا والمتطلبات", "Determining risks and opportunities from the issues and requirements"),
       R(IS, "تطلب ISO 9001:2026 في البند 6.1.1 أن تراعي المنشأة عند التخطيط لنظام إدارة الجودة القضايا المشار إليها في 4.1 والمتطلبات المشار إليها في 4.2، وأن تحدد المخاطر والفرص التي يلزم التعامل معها لضمان قدرة النظام على تحقيق نتائجه، ومنع الآثار غير المرغوبة أو تقليلها، وتحقيق التحسين المستمر، وتعزيز الآثار المرغوبة.",
         "ISO 9001:2026 clause 6.1.1 asks the organization, when planning for the quality management system, to consider the issues referred to in 4.1 and the requirements referred to in 4.2, and to determine the risks and opportunities that need to be addressed to give assurance the system can achieve its intended results, prevent or reduce undesired effects, achieve continual improvement, and enhance desired effects."),
       R(EX, "التهديدان الأعليان في دراسة 2027 (موجات الحر والداخلون الجدد) دخلا سجل المخاطر وخطة 6.1، والفرصة الأعلى (العزل الحراري) دخلت خطة الفرص.",
         "the two top threats of the 2027 study (heatwaves and new entrants) went into the risk register and the 6.1 plan, and the top opportunity (thermal insulation) into the opportunities plan."),
       L(("لكل تهديد أعلى مدخل خطر", "A risk entry for every top threat"), ("لكل فرصة عليا مدخل فرصة أو خيار", "An opportunity entry or an option for every top opportunity"), ("سجّل الوجهة ومرجعها", "Record the destination and its reference")),
       L(("سجل المخاطر يذكر رقم الدراسة", "A risk register that names the study"),),
       L(("SWOT وسجل مخاطر لا يعرف أحدهما الآخر", "A SWOT and a risk register that do not know each other"),),
       B("مدير المخاطر أو الجودة", "Risk or quality manager"), B("نسبة التهديدات العليا التي لها مدخل خطر", "Share of top threats with a risk entry")),
    IT("6.1.2", "DE3", B("الإجراءات للتعامل مع المخاطر", "Actions to address risks"),
       R(IS, "تطلب ISO 9001:2026 في البند 6.1.2 تحديد المخاطر التي قد يكون لها أثر غير مرغوب وتحليلها وتقييمها، والتخطيط لإجراءات التعامل معها، وكيفية دمج الإجراءات في عمليات النظام وتنفيذها وتقييم فعاليتها، وأن تكون الإجراءات متناسبة مع الأثر المحتمل. وتذكر الملاحظة أن الإجراءات قد تشمل تجنب الخطر، أو قبوله لاقتناص فرصة، أو إزالة مصدره، أو تغيير احتماله أو عواقبه، أو مشاركته، أو الاحتفاظ به بقرار مدروس.",
         "ISO 9001:2026 clause 6.1.2 asks to determine, analyse and evaluate the risks that can have an undesired effect, to plan actions to address them, how to integrate and implement the actions in the system's processes and evaluate their effectiveness, and that actions be proportionate to the potential impact. Its note says actions can include avoiding the risk, taking it to pursue an opportunity, eliminating the source, changing the likelihood or consequences, sharing it, or retaining it by informed decision."),
       R(EX, "خيار WT في دراسة العطاء «لا نسعّر دون التكلفة» تجنب لخطر الترسية بسعر خاسر، واعتماد سعر أدنى إجراء يخفض أثره.",
         "the WT option of the bid study, \"do not bid below cost\", avoids the risk of a loss-making award, and approving a floor price is an action that reduces its impact."),
       L(("اختر نوع الاستجابة صراحة", "Name the type of response explicitly"), ("قِس الفعالية في مراجعة لاحقة", "Measure the effectiveness at a later review")),
       L(("مدخل الخطر بنوع الاستجابة ومالكها", "The risk entry with its response type and owner"),),
       L(("خطر بلا إجراء أو بلا مالك", "A risk with no action or no owner"),),
       B("مالكو الإجراءات", "Action owners"), B("—", "—")),
    IT("6.1.3", "x:tools", B("الإجراءات للتعامل مع الفرص", "Actions to address opportunities"),
       R(IS, "تطلب ISO 9001:2026 في البند 6.1.3 تحديد الفرص التي قد يكون لها أثر مرغوب وتحليلها وتقييمها، والتخطيط لإجراءاتها ودمجها وتقييم فعاليتها، وأن تكون مناسبة لسياق المنشأة. وتذكر الملاحظة أمثلة: ممارسات جديدة، ومنتجات أو خدمات جديدة، وشراكات، وتقنيات ناشئة، ومبادرات. ويوضح الملحق A.6.1.3 أن الفرص قد تُحدد من تقييم السياق والأطراف المعنية والقدرة ونتائج المتابعة، ومن مصادر كظروف السوق والتقنيات والمتطلبات النظامية.",
         "ISO 9001:2026 clause 6.1.3 asks to determine, analyse and evaluate the opportunities that can have a desired effect, to plan actions on them, integrate them and evaluate their effectiveness, and that they be appropriate to the organization's context. Its note gives examples: new practices, new products or services, partnerships, emerging technologies, initiatives. Annex A.6.1.3 explains that opportunities can be determined from assessing the context, interested parties, capability and monitoring results, and from sources such as market conditions, technologies and regulatory requirements."),
       R(EX, "خيار SO «التقدم لمباني العزل الحراري الحكومية» إجراء لفرصة جاءت من متطلب نظامي جديد، بإجراء ملف تأهيل له مالك وموعد.",
         "the SO option \"bid for public buildings under the insulation code\" acts on an opportunity that came from a new regulatory requirement, through a pre-qualification action with an owner and a date."),
       L(("عامل الفرصة مثل الخطر: مدخل ومالك ومراجعة", "Treat an opportunity like a risk: an entry, an owner and a review"),),
       L(("خطة الفرص بمراجعها", "The opportunities plan with its references"),),
       L(("فرص تُذكر ولا يُعمل بها", "Opportunities that are named and never acted on"),),
       B("مدير تطوير الأعمال", "Business development manager"), B("—", "—")),
    IT("A.6.1", "x:tools", B("التفكير القائم على المخاطر والفرص", "Risk-based and opportunity-based thinking"),
       R(IS, "يوضح الملحق A.6.1.1 أن الخطر يُفهم كثيراً بوصفه أثر عدم اليقين الذي قد يضر بقدرة النظام على تحقيق نتائجه، والفرصة بوصفها ظروفاً تتيح آثاراً مفيدة، وأنهما مختلفان ويمكن تحديدهما ومعالجتهما بعمليات منفصلة. ويذكر A.6.1.2 أن التفكير القائم على المخاطر لا يعني بالضرورة نهجاً رسمياً لإدارة المخاطر، ويشير إلى ISO 31000 للإرشاد (غير مرفوعة: «غير متحقق منه»). ويعرّف ISO 9000:2026 الخطر (3.7.2) بأنه أثر عدم اليقين، والأثر انحراف عن المتوقع إيجاباً أو سلباً، ويذكر البند 4.3.8 أن التفكير القائم على المخاطر يشمل الفرصة الضائعة. ولا يعرّف ISO 9000:2026 «الفرصة» مصطلحاً.",
         "Annex A.6.1.1 explains that risk is often understood as the effect of uncertainty that can harm the system's ability to achieve its results, and opportunity as circumstances that make beneficial effects possible, that they are distinct and can be determined and addressed through separate processes. A.6.1.2 says risk-based thinking does not imply a formal risk management approach, and points to ISO 31000 for guidance (not uploaded: \"not verified\"). ISO 9000:2026 defines risk (3.7.2) as the effect of uncertainty, an effect being a deviation from the expected, positive or negative, and 4.3.8 says risk-based thinking includes a missed opportunity. ISO 9000:2026 has no term entry for \"opportunity\"."),
       R(EX, "فصلت الواحة مداخل المخاطر عن مداخل الفرص في الخطة، ولكل منهما مالك.",
         "Al-Waha kept risk entries apart from opportunity entries in the plan, each with its owner."),
       L(("لا تجعل الفرصة مجرد «خطر إيجابي» في الجدول", "Do not make an opportunity just a \"positive risk\" in the table"),),
       L(("—", "—"),),
       L(("جدول مخاطر بلا فرص", "A risk table with no opportunities"),),
       B("مدير الجودة", "Quality manager"), B("—", "—"))
  ]})

S.append({"id": "6.2", "grp": "core", "ph": "act", "col": "#C9821A", "tint": "#F8EEDC",
  "t": B("البند 6.2 أهداف الجودة والتخطيط لتحقيقها", "Clause 6.2 Quality objectives and planning to achieve them"),
  "s": B("الخيارات والإجراءات", "Options and actions"), "sh": B("6.2 · الإجراءات", "6.2 · Actions"),
  "p": B("الخيار الذي لا يصير إجراءً بمالك وموعد يبقى فكرة. والمواصفة تطلب: ماذا، وبأي موارد، ومن، ومتى، وكيف تُقيّم النتيجة.",
         "An option that never becomes an action with an owner and a date stays an idea. The standard asks: what, with which resources, who, when, and how the result is evaluated."),
  "fl": L(("الخيار", "Option"), ("الإجراء", "Action"), ("المالك", "Owner"), ("الموعد", "Due date"), ("التقييم", "Evaluation")),
  "it": [
    IT("6.2", "DE2", B("ماذا ومن ومتى وكيف تُقيّم النتيجة", "What, who, when and how the result is evaluated"),
       R(IS, "تطلب ISO 9001:2026 في البند 6.2.1 وضع أهداف للجودة في الوظائف والمستويات والعمليات ذات الصلة، متسقة مع السياسة وقابلة للقياس ومتابعة ومبلّغة ومحدّثة، وفي 6.2.2 أن يُحدد عند التخطيط لتحقيقها: ما الذي سيُعمل، وما الموارد، ومن المسؤول، ومتى يكتمل، وكيف تُقيّم النتائج. وإجراءات SWOT التي تمس أهداف الجودة تتبع هذه القاعدة.",
         "ISO 9001:2026 clause 6.2.1 asks for quality objectives at relevant functions, levels and processes, consistent with the policy, measurable, monitored, communicated and updated, and 6.2.2 asks, when planning to achieve them, to determine what will be done, what resources, who is responsible, when it will be completed and how the results will be evaluated. SWOT actions that touch quality objectives follow that rule."),
       R(EX, "إجراء «اعتماد السعر الأدنى في لجنة العطاءات» له مالك (المدير المالي) وموعد (5 نوفمبر 2026)، ويُقيّم بقرار اللجنة المكتوب.",
         "the action \"approve the floor price at the bid committee\" has an owner (the finance manager) and a date (5 November 2026), and is evaluated by the committee's written decision."),
       L(("لكل خيار إجراء واحد على الأقل بمالك وموعد", "At least one action with an owner and a date for every option"), ("اربط الإجراء بهدف أو مؤشر عند الإمكان", "Tie the action to an objective or a KPI where possible")),
       L(("قائمة الإجراءات بمالكيها ومواعيدها", "The action list with owners and dates"),),
       L(("إجراءات بلا مالك", "Actions with no owner"), ("«سنعمل على…» بلا موعد", "\"We will work on…\" with no date")),
       B("مالكو الإجراءات", "Action owners"), B("نسبة الإجراءات المنفذة في موعدها", "Share of actions done on time")),
    IT("GD-8", "DE1", B("من المصفوفة إلى خيارات TOWS", "From the grid to TOWS options"),
       R(GD, "يحوّل TOWS المصفوفة إلى خيارات، لكل خيار بند من ربعين: SO قوة تقتنص فرصة، وST قوة تواجه تهديداً، وWO فرصة تعالج ضعفاً، وWT تقليل ضعف أمام تهديد. ويدخل كل بند أعلى خياراً، أو مدخلاً في سجل المخاطر أو خطة 6.1. وتنبّه الأداة على الخيار الذي لا يربط بنداً من كل ربع، وعلى البند الأعلى الذي لم يدخل خياراً. (مصفوفة TOWS بوصفها طريقة مسماة: «غير متحقق منه»؛ ولا تذكرها ISO 10009 بالاسم في فهرس المنصة.)",
         "TOWS turns the grid into options, each taking an item from two quadrants: SO uses a strength to seize an opportunity, ST a strength to meet a threat, WO an opportunity to fix a weakness, WT reduces a weakness in front of a threat. Every top item goes into an option, or into an entry in the risk register or the 6.1 plan. The tool flags an option that does not link an item from each quadrant, and a top item that went into no option. (The TOWS matrix as a named method: \"not verified\"; ISO 10009 does not name it in the platform's catalogue.)"),
       R(EX, "في دراسة الرفع ربط خيار WT ضعفين (قراءة الرياح، والتوجيه باليد) بتهديدين (انزلاق الحزمة، والوزن المقدر بأقل) في إجراء واحد على تصريح الرفع.",
         "in the lifting study, a WT option tied two weaknesses (the wind reading, hand guiding) to two threats (the bundle slipping, the weight underestimated) in one action on the lift permit."),
       L(("ابدأ من البنود العليا لا من كل البنود", "Start from the top items, not from every item"), ("اكتب الخيار بفعل", "Write the option with a verb")),
       L(("مصفوفة TOWS بروابطها", "The TOWS matrix with its links"),),
       L(("خيارات عامة لا تذكر أي بند", "General options that name no item"),),
       B("الإدارة العليا", "Top management"), B("نسبة البنود العليا التي دخلت خياراً", "Share of top items in an option")),
    IT("GD-9", "DE2", B("الإجراء ومدخل الخطر", "The action and the risk entry"),
       R(GD, "لكل خيار إجراء بمالك وموعد وحالة ودليل عند التنفيذ. ولكل تهديد أعلى مدخل خطر يُنقل إلى سجل المخاطر أو خطة 6.1 أو دراسة FMEA، برقمه في الوجهة. ولا تكتمل مرحلة «إجراءات ومخاطر» حتى يكون ذلك كله. والأداة تعرض دراسة FMEA بقاعدتها للقراءة فقط، ولا تكتب في سجل المخاطر.",
         "each option gets an action with an owner, a due date, a status and evidence once done. Each top threat gets a risk entry carried into the risk register, the 6.1 plan or an FMEA study, with its reference there. The \"actions and risks\" stage is not complete until all of that is in place. The tool shows an FMEA study by its own rule, read-only, and never writes to the risk register."),
       R(EX, "مدخل الخطر R1 في دراسة الرفع يسمي دراسة FM-EX-02: «إعادة تقييم الصف R1 بعد التدقيقات الشهرية».",
         "risk entry R1 of the lifting study names study FM-EX-02: \"re-rate row R1 after the monthly audits\"."),
       L(("سجّل الوجهة والمرجع لكل مدخل", "Record the destination and the reference for each entry"),),
       L(("المداخل بمراجعها في الوجهة", "Entries with their references at the destination"),),
       L(("تهديد أعلى لا يظهر في سجل المخاطر", "A top threat that never shows in the risk register"),),
       B("مالكو الإجراءات", "Action owners"), B("نسبة الدراسات التي خرجت منها إجراءات", "Share of studies that led to actions"))
  ]})

S.append({"id": "9.3.2", "grp": "core", "ph": "rev", "col": "#3C9A5F", "tint": "#E5F4EA",
  "t": B("البند 9.3.2 مدخلات مراجعة الإدارة", "Clause 9.3.2 Management review inputs"),
  "s": B("المراجعة والإبلاغ", "Review and communication"), "sh": B("9.3.2 · المراجعة", "9.3.2 · Review"),
  "p": B("المصفوفة المؤرخة تُراجع عند تغير السياق، وتغيراتها مدخل لمراجعة الإدارة مع فعالية الإجراءات على المخاطر والفرص.",
         "The dated grid is reviewed when the context changes, and its changes feed management review along with the effectiveness of the actions on risks and opportunities."),
  "fl": L(("التغيرات", "Changes"), ("الفعالية", "Effectiveness"), ("المراجعة", "Review"), ("الإبلاغ", "Communication")),
  "it": [
    IT("9.3.2", "RV2", B("تغيرات القضايا والأطراف المعنية وفعالية الإجراءات", "Changes in issues and interested parties, and the effectiveness of actions"),
       R(IS, "تطلب ISO 9001:2026 في البند 9.3.2 أن تشمل مراجعة الإدارة: حالة الإجراءات من المراجعات السابقة (أ)، والتغيرات في القضايا الخارجية والداخلية (ب)، والتغيرات في احتياجات الأطراف المعنية وتوقعاتها (ج)، وفرص التحسين (هـ)، وفعالية الإجراءات المتخذة للتعامل مع المخاطر (ز، انظر 6.1.2) ومع الفرص (ح، انظر 6.1.3).",
         "ISO 9001:2026 clause 9.3.2 asks that management review include the status of actions from previous reviews (a), changes in external and internal issues (b), changes in the needs and expectations of interested parties (c), opportunities for improvement (e), and the effectiveness of actions taken to address risks (g, see 6.1.2) and opportunities (h, see 6.1.3)."),
       R(EX, "عرضت الواحة في مراجعة الإدارة سجل مراجعات المصفوفة وحالة إجراءاتها الخمسة، فقُرر تقديم ملف التأهيل.",
         "Al-Waha presented the grid's review log and the status of its five actions at management review, and the pre-qualification pack was brought forward."),
       L(("اجعل تقرير SWOT بنداً ثابتاً في مراجعة الإدارة", "Make the SWOT report a standing item of management review"), ("اعرض ما تغير منذ آخر مراجعة، لا المصفوفة كلها", "Show what changed since the last review, not the whole grid")),
       L(("محضر مراجعة الإدارة يذكر الدراسة", "Management review minutes naming the study"),),
       L(("مراجعة إدارة بلا قضايا خارجية أو داخلية", "A management review with no external or internal issues"),),
       B("الإدارة العليا", "Top management"), B("مراجعات الإدارة التي تناولت تغيرات السياق", "Management reviews that covered context changes")),
    IT("GD-10", "RV1", B("مؤرخة وتُراجع عند تغير السياق", "Dated, and reviewed when the context changes"),
       R(GD, "تؤرخ المصفوفة ويُحدد موعد مراجعتها القادمة، وتُراجع قبله إن تغير السياق: نظام جديد، أو عميل كبير، أو منافس، أو حادث. وتسجل المراجعة ما تغير والبنود المضافة والمحذوفة. وتنبّه الأداة إذا مضى الموعد دون مراجعة، ولا تكتمل مرحلة «روجعت» إلا بمراجعة بعد التحليل وموعد قادم.",
         "the grid is dated with its next review date set, and reviewed earlier if the context changes: a new regulation, a major client, a competitor, an incident. The review records what changed and the items added and removed. The tool flags a review date that has passed with no review, and the \"reviewed\" stage needs a review after the analysis and a next date."),
       R(EX, "روجعت دراسة 2027 في 8 أكتوبر 2026 بعد صدور متطلبات العزل، وموعدها القادم 31 مارس 2027.",
         "the 2027 study was reviewed on 8 October 2026 after the insulation requirements came out, and its next date is 31 March 2027."),
       L(("حدد محفزات المراجعة الفورية", "Name the triggers for an immediate review"), ("سجّل البنود المضافة والمحذوفة", "Record the items added and removed")),
       L(("سجل المراجعات بتاريخها", "The review log with dates"),),
       L(("مصفوفة عمرها سنتان دون مراجعة", "A two-year-old grid never reviewed"),),
       B("مالك القرار", "Decision owner"), B("نسبة الدراسات التي روجعت في موعدها", "Share of studies reviewed on time")),
    IT("GD-11", "RV3", B("أبلغ النتيجة والقرار", "Communicate the result and the decision"),
       R(GD, "النتيجة التي لا تصل إلى من ينفذ لا تغيّر شيئاً. أبلغ القرار والخيارات المختارة والإجراءات ومالكيها، ولماذا تُرك ما تُرك. والتقرير في الأداة يجمع ذلك في صفحة قابلة للطباعة.",
         "a result that does not reach those who act changes nothing. Communicate the decision, the options chosen, the actions and their owners, and why what was left out was left out. The tool's report puts that on a printable page."),
       R(EX, "أرسلت الواحة تقرير دراسة الرفع إلى مشرفي الأبراج الثلاثة قبل خطة 2027.",
         "Al-Waha sent the lifting study report to the supervisors of all three towers before the 2027 plan."),
       L(("أرسل التقرير إلى مالكي الإجراءات", "Send the report to the action owners"),),
       L(("—", "—"),),
       L(("نتيجة يعرفها الفريق وحده", "A result only the team knows"),),
       B("الميسّر", "Facilitator"), B("—", "—")),
    IT("GD-12", "x:tools", B("الفجوات الشائعة وما يطلبه المدقق", "Common gaps and what an auditor asks for"),
       R(GD, "الفجوات الشائعة: SWOT يعده شخص واحد، وبنود من الرأي، وخلط الداخلي بالخارجي، وقوائم طويلة بلا ترتيب، ومصفوفة لا تصل إلى خيار، وخيارات بلا مالك أو موعد، وتهديدات لا تدخل سجل المخاطر، ومصفوفة لم تُراجع منذ إعدادها. والمدقق يسأل عادة: ما القضايا الخارجية والداخلية التي حددتموها (4.1)؟ ومن أين جاءت؟ وما المخاطر والفرص التي خرجت منها (6.1.1)؟ وما الإجراءات وأين دليل فعاليتها (6.1.2)؟ ومتى روجعت في مراجعة الإدارة (9.3.2)؟",
         "common gaps: a SWOT prepared by one person, items from opinion, internal and external mixed up, long unranked lists, a grid that reaches no option, options with no owner or date, threats that never reach the risk register, and a grid not reviewed since it was made. An auditor usually asks: which external and internal issues did you determine (4.1)? Where did they come from? Which risks and opportunities came out of them (6.1.1)? Which actions, and where is the evidence of their effectiveness (6.1.2)? When were they reviewed at management review (9.3.2)?"),
       R(EX, "التدقيق الآلي للمثال: الدراسات الثلاث تنجح في كل الفحوص المنطبقة؛ ودراستا العطاء والرفع لم تُراجعا بعد وموعداهما لم يحلا.",
         "the automatic audit of the example: all three studies pass every applicable check; the bid and lifting studies are not reviewed yet and their review dates have not come."),
       L(("راجع تبويب التدقيق قبل كل مراجعة إدارة", "Check the Audit tab before each management review"),),
       L(("نتيجة التدقيق الآلي لكل دراسة", "The automatic audit result for each study"),),
       L(("مصفوفة جميلة بلا قرار واحد", "A beautiful grid with not one decision"),),
       B("المدقق الداخلي", "Internal auditor"), B("نسبة الفحوص الناجحة", "Audit pass rate"))
  ]})

S.append({"id": "5.1", "grp": "core", "ph": "evid", "col": "#7B5BB8", "tint": "#EFEAF7",
  "t": B("ISO 10009:2024 البنود 5.1 و5.2 و5.3 أدوات الاستراتيجية", "ISO 10009:2024 5.1, 5.2 and 5.3 Strategy tools"),
  "s": B("دليل أدوات الجودة", "Quality tools guidance"), "sh": B("10009 · 5.1", "10009 · 5.1"),
  "p": B("تراجع ISO 10009:2024 أسلوب SWOT في البند 5.1 مع PESTLE وقوى بورتر، وتضعها في التخطيط والتصرف لاستراتيجية الأعمال.",
         "ISO 10009:2024 reviews SWOT in 5.1 with PESTLE and Porter's forces, and places them in Plan and Act of business strategy."),
  "fl": L(("SWOT", "SWOT"), ("PESTLE", "PESTLE"), ("بورتر", "Porter"), ("الملحق A", "Annex A"), ("الجدول C.1", "Table C.1")),
  "it": [
    IT("5.1", "x:tools", B("SWOT في ISO 10009:2024", "SWOT in ISO 10009:2024"),
       R(IS, "تراجع ISO 10009:2024 (إرشادات أدوات الجودة وتطبيقها) أسلوب SWOT في البند 5.1 أداةً لبناء استراتيجية بالنظر في نقاط القوة والضعف الداخلية والفرص والتهديدات الخارجية. ويذكر جدولها 5.1 استخداماته (مراجعة أثر العوامل الداخلية والخارجية، وترتيب أولوية الإجراءات وتحديد الخيارات، وكشف العوائق)، وفوائده، ونقاط الانتباه: المراجعة بتكرار يكفي لالتقاط التغيرات، وتنوع وجهات النظر بفريق قيادة ومدخلات خارجية، وحدود جودة البيانات، وأن المخرجات أساس لإجراءات لاحقة. ويضعه الملحق A (الجدول A.1) في مرحلتي التخطيط والتصرف لتخطيط الاستراتيجية والأعمال، ويصفه الجدول C.1: استراتيجية، منتج وخدمة، فريق، بيانات قليلة، مستوى كفاءة •، وجهد سهل. (من فهرس المنصة المتحقق منه من الملف الرسمي في 2026-10-16.)",
         "ISO 10009:2024 (guidance for quality tools and their application) reviews SWOT in 5.1 as a tool to build a strategy by looking at internal strengths and weaknesses and external opportunities and threats. Its Table 5.1 gives its uses (reviewing the effect of internal and external factors, setting action priorities and identifying options, finding barriers), its benefits, and points to note: review it often enough to catch changes, diversity of views through a leadership team with outside input, the limits of the data, and its output as the basis for later actions. Annex A (Table A.1) places it in Plan and Act of strategy and business planning, and Table C.1 describes it: strategy, product and service, team, small data, capability level •, easy effort. (From the platform's catalogue checked against the official file on 2026-10-16.)"),
       R(EX, "في دليل ISO 10009 على المنصة تفتح بطاقة الأداة 5.1 هذه الأداة لتطبيقها.",
         "in the ISO 10009 guide on the platform, the 5.1 tool card opens this tool to apply it."),
       L(("افتح بطاقة 5.1 في دليل ISO 10009", "Open card 5.1 in the ISO 10009 guide"), ("اتبع نقاط الانتباه الأربع", "Follow the four points to note")),
       L(("—", "—"),),
       L(("SWOT يعده شخص واحد ولا يُراجع", "A SWOT by one person, never reviewed"),),
       B("مدير الجودة", "Quality manager"), B("—", "—")),
    IT("5.2", "x:tools", B("PESTLE في ISO 10009:2024", "PESTLE in ISO 10009:2024"),
       R(IS, "تراجع ISO 10009:2024 تحليل PESTLE في البند 5.2 أداةً لتحديد البيئة الخارجية وتتبعها عبر العوامل السياسية والاقتصادية والاجتماعية والتقنية والقانونية والبيئية، وتذكر أنه يُستخدم كثيراً مع SWOT ونموذج القوى الخمس أو الست، وأنه يُحدّث دورياً وبعد الأحداث الكبرى. وفي الجدول C.1: فريق، بيانات متوسطة، كفاءة ••، جهد متوسط. (من فهرس المنصة.) وأداة PESTLE المستقلة هي التالية في صندوق الأدوات.",
         "ISO 10009:2024 reviews PESTLE analysis in 5.2 as a tool to determine and track the external environment through political, economic, social, technological, legal and environmental factors, and says it is often used with SWOT and the five or six forces, and is updated periodically and after major events. Table C.1: team, medium data, capability ••, medium effort. (From the platform's catalogue.) A dedicated PESTLE tool is next in the toolbox."),
       R(EX, "عاملا «متطلبات العزل الجديدة» (قانوني) و«موجات الحر الأطول» (بيئي) دخلا دراسة 2027 من PESTLE.",
         "the factors \"new insulation requirements\" (legal) and \"longer heatwaves\" (environmental) came into the 2027 study from PESTLE."),
       L(("ابدأ دراسة من عامل PESTLE في استوديو الاستراتيجية", "Start a study from a PESTLE factor in the Strategy Studio"),),
       L(("—", "—"),),
       L(("PESTLE لا يصل إلى SWOT", "A PESTLE that never reaches the SWOT"),),
       B("مدير تطوير الأعمال", "Business development manager"), B("—", "—")),
    IT("5.3", "x:tools", B("قوى بورتر في ISO 10009:2024", "Porter's forces in ISO 10009:2024"),
       R(IS, "تراجع ISO 10009:2024 القوى الخمس أو الست لبورتر في البند 5.3 أداةً لفهم القوى المتنافسة في القطاع: تهديد الداخلين الجدد، والتنافس بين القائمين، والقوة التفاوضية للمشترين وللموردين، وتهديد البدائل، والقوة السادسة المكمّلون؛ وتذكر أن الإجراءات تُبنى على بيانات من مصادر موثوقة. وفي الجدول C.1: فريق، بيانات قليلة، كفاءة •••، جهد متوسط. (من فهرس المنصة.)",
         "ISO 10009:2024 reviews Porter's five or six forces in 5.3 as a tool to understand the competing forces in a sector: the threat of new entrants, rivalry among existing firms, the bargaining power of buyers and of suppliers, the threat of substitutes, and complementors as a sixth force; it says actions are based on data from reliable sources. Table C.1: team, small data, capability •••, medium effort. (From the platform's catalogue.)"),
       R(EX, "«قوة المشتري مرتفعة» و«الداخلون الجدد» تهديدان من قوى بورتر في دراستي العطاء و2027.",
         "\"high buyer power\" and \"new entrants\" are threats from Porter's forces in the bid and 2027 studies."),
       L(("اقرأ القطاع بقوى بورتر قبل كل عطاء كبير", "Read the sector with Porter's forces before each major bid"),),
       L(("—", "—"),),
       L(("تهديدات تنافسية بلا أرقام", "Competitive threats with no figures"),),
       B("مدير العطاءات", "Tender manager"), B("—", "—"))
  ]})

# a section whose id is also an item code opens on that item, so the item that carries the section's number comes first
for sec in S:
    sec["it"].sort(key=lambda x: 0 if x["c"] == sec["id"] else 1)

legend = [[p["c"], p["n"]] for p in phases.values()]

DATA = {
    "meta": meta, "std": std, "texts": texts, "phases": phases, "flags": {}, "legend": legend,
    "diagram": {"type": "cycle", "centre": B("القرار", "Decision")},
    "matrix": {"tab": "", "d": B("", ""), "btn": B("", "")},
    "sections": S, "paths": [],
    "edges": [["GD-1", "4.1"], ["4.1", "A.4.1"], ["3.1.2", "4.1"], ["4.2", "A.4.2"], ["3.1.4", "4.2"], ["4.2", "GD-2"], ["GD-2", "GD-5"], ["5.2", "GD-5"], ["5.3", "GD-5"],
              ["GD-5", "GD-4"], ["GD-6", "GD-4"], ["GD-4", "GD-3"], ["4.2.7", "GD-3"], ["GD-3", "GD-7"], ["GD-7", "GD-8"], ["5.1", "GD-8"],
              ["GD-8", "GD-9"], ["GD-9", "6.2"], ["GD-9", "6.1.2"], ["6.1.1", "6.1.2"], ["6.1.1", "6.1.3"], ["A.6.1", "6.1.1"], ["6.1.2", "9.3.2"],
              ["6.1.3", "9.3.2"], ["GD-10", "9.3.2"], ["A.4.1", "GD-10"], ["9.3.2", "GD-11"], ["GD-11", "GD-12"]],
    "changes": {"note": B("", ""), "tlT": B("", ""), "tlS": B("", ""), "tlCols": 4, "tl": [], "cardsT": B("", ""), "cardsS": B("", ""), "cards": [],
                "corr": {"t": B("", ""), "s": B("", ""), "h": [], "rows": []}, "steps": {"t": B("", ""), "s": B("", ""), "l": B("", "")}},
    "ui": {
        "ar": {"roles": "من يعمل في دراسة SWOT", "wheelT": "عجلة البنود", "purpose": "الغرض من الأداة", "smap": "خطوات الدراسة من القرار إلى المراجعة",
               "smapSub": "كل خطوة في سطر. اضغط «اشرح» لفتح البند أو القاعدة التي تخدمها.", "rel": "علاقتها بأدوات المنصة", "comp": "المراجع المساندة",
               "assess": "قيّم هذا في التقييم الذاتي", "assessC": "قيّم هذا في التقييم الذاتي",
               "assessOff": "هذا البند خارج أسئلة التقييم الذاتي، ويُطبَّق مباشرة في دراسات SWOT.", "offGo": "افتح دراسات SWOT",
               "actCtx": "يفتح السؤال {s}", "explainA": "اشرح {c} في دليل البنود"},
        "en": {"roles": "Who works on a SWOT study", "wheelT": "Clause wheel", "purpose": "What the tool is for", "smap": "Steps of a study, from the decision to the review",
               "smapSub": "One line per step. Select “Explain” to open the clause or rule it serves.", "rel": "How it connects to the platform's tools", "comp": "Supporting references",
               "assess": "Assess this in the self-assessment", "assessC": "Assess this in the self-assessment",
               "assessOff": "This clause is outside the self-assessment questions; it is applied directly in the SWOT studies.", "offGo": "Open the SWOT studies",
               "actCtx": "Opens question {s}", "explainA": "Explain {c} in the clause guide"}
    }
}

if __name__ == "__main__":
    js = ("/* SWOT explanation data for the CIA Explain Kit v1.4. SWOT is a technique, not a requirement of any standard.\n"
          "   ISO 9001:2026 and ISO 9000:2026 (OCR) clause numbers and titles checked on 2026-10-17 against the uploaded texts; ISO 10009:2024\n"
          "   5.1, 5.2 and 5.3 from the platform's catalogue checked against the official PDF on 2026-10-16. Requirements are interpretive\n"
          "   summaries, not the official text; the TOWS matrix as a named method, strategy textbooks and ISO 31000 are not uploaded (\"not verified\"). */\n"
          "const EXPLAIN_SWOT=" + json.dumps(DATA, ensure_ascii=False, indent=1) + ";\n")
    sys.stdout.write(js)
