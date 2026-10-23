"""EXPLAIN_STAKEHOLDERS — data for the CIA Explain Kit v1.4 in modules/stakeholders.html (build step 2026-10-17, Stakeholder Analysis).
Stakeholder analysis is a technique, not a requirement of any standard. The clause guide is built on the ISO 9001:2026 clauses the register serves.
Checked on 2026-10-17:
  ISO 9001:2026 (ISO_9001_2026en 1.pdf, read with pdftotext) — 4.2 Understanding the needs and expectations of interested parties (determine
                   a) the relevant interested parties, b) their relevant requirements, c) which of these requirements will be addressed through
                   the QMS; monitor and review information about them; NOTE: relevant interested parties can have requirements related to climate
                   change); 4.3 Determining the scope of the QMS (consider a) the issues of 4.1, b) the requirements of 4.2, c) products and
                   services); 5.1.2 Customer focus (a) customer and applicable statutory and regulatory requirements determined, understood and
                   consistently met; b) risks and opportunities affecting conformity and customer satisfaction; c) focus on enhancing customer
                   satisfaction); 6.1.1 Determining risks and opportunities (consider the issues of 4.1 and the requirements of 4.2); 9.1.2 Customer
                   satisfaction (monitor; methods; NOTE sources such as surveys, feedback, meetings, complaints); 9.3.2 Management review inputs
                   (c) changes in needs and expectations of interested parties relevant to the QMS; d) 4) customer satisfaction and feedback from
                   relevant interested parties; d) 7) performance of external providers); Annex A.4.2 (determining relevant parties and requirements;
                   relevant requirements fall within the QMS boundaries; parties and requirements change over time; climate expectations can
                   influence regulatory compliance, customer requirements and organizational commitments).
  ISO 9000:2026 (ISO 9000-2026.pdf; scanned, read by OCR with tesseract on 2026-10-17) — 3.1.4 interested party / stakeholder (person or
                   organization that can affect, be affected by, or perceive itself to be affected by a decision or activity; EXAMPLE customers,
                   owners, people in an organization, providers, bankers, regulatory authorities, unions, partners or society, including
                   competitors or opposing pressure groups); 4.4.2 Interested parties (a significant opportunity for sustained success when their
                   needs and expectations are met, a risk when they are not; identify relevant parties, their needs and expectations and their
                   effect on the organization; the concept extends the focus beyond the customer; engaging them improves performance, reputation,
                   risk anticipation, decisions and compliance).
  ISO 10009:2024 (ISO-10009-2024-Quality-Management-Guidance-for-Quality-Tools.pdf, read with pdftotext) — no tool named "stakeholder analysis";
                   5.1 SWOT, Table 5.1 (external review includes interested parties such as competitors and customers; carried out by the
                   leadership team with external inputs, not a single person); 5.5 Other relevant tools (context of the organization (COTO)
                   diagram/matrix/log; ISO/PAS 24644-1; the COSO framework, Figure 1); 6.5 Authority matrix/RACI/RASCI (consulted: other interested
                   parties with potential input or affected by outputs; supporting: interested parties with inputs only; informed: parties kept
                   informed).
Not uploaded, so "not verified": the power/interest grid (Mendelow and later textbooks), stakeholder-mapping textbooks, AA1000, ISO 26000.
No text of a standard is reproduced: every "requirement" is an interpretive summary in independent wording.
Items coded GD-n are the author's practical guidance on the technique, not clauses. Usage: python3 data_stakeholders.py > explain_stakeholders.js"""
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
    "code": "STK",
    "name": B("تحليل الأطراف المعنية", "Stakeholder analysis"),
    "edition": B("أداة منهجية: من يهمّ وماذا يحتاج", "Method tool: who matters and what they need"),
    "status": B("الأداة الثالثة عشرة في صندوق أدوات التحسين المستمر", "Thirteenth tool in the Continual Improvement Toolbox"),
    "cert": False,
    "certNote": B("تحليل الأطراف المعنية أسلوب، وليس مواصفة ولا متطلباً، ولا تسمي ISO 10009:2024 أداة بهذا الاسم. والمتطلبات التي يخدمها في ISO 9001:2026: الأطراف المعنية ومتطلباتها وقرار معالجتها ومتابعتها (4.2)، والنطاق (4.3 ب))، والتركيز على العميل (5.1.2)، والمخاطر والفرص (6.1.1)، ورضا العميل (9.1.2)، ومدخلات مراجعة الإدارة (9.3.2 ج)).",
                  "Stakeholder analysis is a technique, not a standard or a requirement, and ISO 10009:2024 names no tool by that name. The ISO 9001:2026 requirements it serves: interested parties, their requirements, the decision to address them and their monitoring (4.2), the scope (4.3 b)), customer focus (5.1.2), risks and opportunities (6.1.1), customer satisfaction (9.1.2) and management review inputs (9.3.2 c))."),
    "verified": B("2026-10-17، من الملفات الرسمية المرفوعة إلى المشروع: ISO_9001_2026en 1.pdf (قُرئ بالأداة pdftotext)، وISO 9000-2026.pdf (ممسوح ضوئياً، قُرئ بالتعرف الضوئي)، وISO-10009-2024-Quality-Management-Guidance-for-Quality-Tools.pdf (قُرئ بالأداة pdftotext). كل «متطلب» ملخص تفسيري، وليس النص الرسمي. مصفوفة القوة والاهتمام، وكتب رسم خرائط الأطراف، وAA1000، وISO 26000: «غير متحقق منها».",
                  "2026-10-17, against the official files uploaded to the project: ISO_9001_2026en 1.pdf (read with pdftotext), ISO 9000-2026.pdf (scanned, read with OCR) and ISO-10009-2024-Quality-Management-Guidance-for-Quality-Tools.pdf (read with pdftotext). Every “requirement” is an interpretive summary, not the official text. The power/interest grid, stakeholder-mapping textbooks, AA1000 and ISO 26000: “not verified”.")
}

std = {
    "purpose": B("أن تتحول «الأطراف المعنية» من قائمة عامة إلى قرارات: أطراف بأسمائها، ومتطلبات بمصادرها وتواريخها، وقرار صريح لكل متطلب، وقوة واهتمام بسبب يحددان طريقة التعامل ومالك العلاقة، وسؤال صريح عن المناخ، ثم يذهب كل طرف رئيسي إلى SWOT أو PESTLE أو المخاطر أو يُستبعد بسبب، ثم مراجعة دورية وبعد التغيرات. السجل الذي لا يغيّر قراراً لا قيمة له.",
                 "To turn \"interested parties\" from a generic list into decisions: parties by name, requirements with their sources and dates, an explicit decision on each requirement, power and interest with reasons that set the engagement approach and the relationship owner, an explicit climate question, then every key party into SWOT, PESTLE or risks or set aside with a reason, then a review on a date and after changes. A register that changes no decision has no value."),
    "who": B("الإدارة العليا ومديرو الجودة والمخاطر، ومديرو المشاريع والعطاءات والمشتريات، ومديرو السلامة، ومن يعد مراجعة الإدارة، والمدققون الداخليون.",
             "Top management, quality and risk managers, project, bid and procurement managers, HSE managers, whoever prepares management review, and internal auditors."),
    "rolesSub": B("السجل لا يعمل وحده؛ يعمل بمن يحدد القرار، ومن يعرف الطرف، ومن يحمل علاقته. هذا توزيع مقترح للأدوار.",
                  "The register does not work by itself; it works through who sets the decision, who knows the party, and who carries the relationship. This is a suggested split of roles."),
    "roles": [
        {"n": B("مالك القرار", "Decision owner"), "col": "#1B2A4A", "d": B("يحدد النطاق والقرار الذي يخدمه السجل، ويعتمد قرارات 4.2 ج)، ويحمل التغيرات إلى مراجعة الإدارة.", "Sets the scope and the decision the register serves, approves the 4.2 c) decisions, and carries the changes to management review.")},
        {"n": B("الميسّر", "Facilitator"), "col": "#1E8C93", "d": B("يجمع الفريق والرأي الخارجي، ويطلب لكل طرف اسمه بعينه، ولكل متطلب مصدره وتاريخه.", "Brings the team and the outside input together, asks for each party's specific name and for the source and date of each requirement.")},
        {"n": B("مالكو العلاقات", "Relationship owners"), "col": "#3563C9", "d": B("مدير المشاريع مع العميل، والمشتريات مع الموردين، والسلامة مع الجهات التنظيمية والعمال: يعرفون المتطلب ومصدره ويحافظون على القناة.", "Projects with the client, procurement with suppliers, HSE with regulators and workers: they know the requirement and its source and keep the channel open.")},
        {"n": B("مالكو المخرجات", "Outcome owners"), "col": "#C9821A", "d": B("يحملون الأطراف الرئيسية إلى SWOT وPESTLE وسجل المخاطر وخطة 6.1، وينفذون الإجراءات بمواعيدها.", "Carry the key parties into SWOT, PESTLE, the risk register and the 6.1 plan, and carry out the actions on time.")},
        {"n": B("المدقق الداخلي", "Internal auditor"), "col": "#C2410C", "d": B("يسأل: من الأطراف ذات الصلة؟ وما متطلباتها ومن أين؟ وأيها يعالجه النظام ولماذا لا يعالج الباقي؟ ومتى روجعت؟", "Asks: who are the relevant parties? What are their requirements and where do they come from? Which does the system address, and why not the rest? When was it reviewed?")}
    ],
    "map": [
        {"no": "1", "t": B("النطاق والقرار", "Scope and decision"), "d": B("لأي قرار نحلل الأطراف.", "Which decision the analysis serves."), "go": "GD-1"},
        {"no": "2", "t": B("الفريق", "The team"), "d": B("ثلاثة أدوار ورأي من الخارج.", "Three roles and outside input."), "go": "GD-2"},
        {"no": "3", "t": B("الطرف بعينه", "The specific party"), "d": B("لا «المجتمع» ولا «العملاء».", "Not \"the community\", not \"customers\"."), "go": "GD-3"},
        {"no": "4", "t": B("المتطلب ومصدره", "The requirement and its source"), "d": B("بند عقد، أو نظام، أو استبيان، أو محضر.", "A contract clause, a regulation, a survey or minutes."), "go": "GD-4"},
        {"no": "5", "t": B("قرار 4.2 ج)", "The 4.2 c) decision"), "d": B("يعالجه النظام أم لا، ولماذا.", "Addressed by the system or not, and why."), "go": "4.2"},
        {"no": "6", "t": B("القوة والاهتمام", "Power and interest"), "d": B("بسبب لكل درجة.", "With a reason for each score."), "go": "GD-6"},
        {"no": "7", "t": B("التعامل", "Engagement"), "d": B("مالك وقناة وتكرار.", "Owner, channel and frequency."), "go": "GD-7"},
        {"no": "8", "t": B("المناخ", "Climate"), "d": B("سؤال صريح لكل طرف رئيسي.", "An explicit question for each key party."), "go": "GD-8"},
        {"no": "9", "t": B("إلى SWOT وPESTLE والمخاطر", "Into SWOT, PESTLE and risks"), "d": B("أو يُستبعد بسبب.", "Or set aside with a reason."), "go": "GD-9"},
        {"no": "10", "t": B("راجع وأبلغ", "Review and communicate"), "d": B("في الموعد وبعد التغيرات وفي مراجعة الإدارة.", "On its date, after changes and at management review."), "go": "9.3.2"}
    ],
    "rel": [
        {"code": "SWOT", "n": B("تحليل SWOT", "SWOT analysis"), "col": "#3C9A5F", "d": B("الأطراف الرئيسية تدخل دراسة SWOT فرصاً وتهديدات برقم الدراسة، ويبدأ سجل من بنود SWOT التي مصدرها «العملاء» (قراءة فقط).", "Key parties go into a SWOT study as opportunities and threats by its id, and a register can start from SWOT items whose source is \"customer\" (read-only)."), "tool": "./swot.html"},
        {"code": "PESTLE", "n": B("تحليل PESTLE", "PESTLE analysis"), "col": "#3563C9", "d": B("الطرف قد يكون بنداً في عامل من العوامل الستة، ويبدأ سجل من «من يتأثر» في بنود المسح (قراءة فقط).", "A party can be an item under one of the six factors, and a register can start from the \"who is affected\" of a scan's items (read-only)."), "tool": "./pestle.html"},
        {"code": "Strategy Studio", "n": B("استوديو الاستراتيجية والأداء", "Strategy & Performance Studio"), "col": "#3563C9", "d": B("لا يحمل سجلاً للأطراف المعنية؛ يقرأ السجل بنود SWOT وPESTLE فيه التي تسمي طرفاً (قراءة فقط).", "It holds no interested-parties register; this tool reads its SWOT and PESTLE rows that name a party (read-only)."), "tool": "./strategy-performance.html"},
        {"code": "ISO 10009", "n": B("دليل أدوات الجودة ISO 10009", "ISO 10009 quality tools guide"), "col": "#7B5BB8", "d": B("لا أداة باسم «تحليل الأطراف المعنية»؛ الأقرب: سجل سياق المنشأة في 5.5، و«المستشارون» و«المطلعون» من الأطراف في RACI في 6.5.", "No tool named \"stakeholder analysis\"; the closest: the context of the organization log in 5.5, and the consulted and informed parties of RACI in 6.5."), "tool": "./iso10009.html#explain-cl"},
        {"code": "ISO 31000", "n": B("استوديو المخاطر ISO 31000", "ISO 31000 Risk Studio"), "col": "#1B2A4A", "d": B("وجهة للأطراف التي تحمل مخاطر تُدار هناك.", "A destination for parties that carry risks managed there."), "tool": "./iso31000-risk-studio.html"},
        {"code": "Lessons", "n": B("سجل الدروس المستفادة", "Lessons learned register"), "col": "#B8901E", "d": B("درس يخص عميلاً أو مورداً قد يكشف متطلباً لم يُكتب، ويبدأ منه سجل (قراءة فقط).", "A lesson about a customer or a supplier can reveal an unwritten requirement, and a register can start from it (read-only)."), "tool": "./lessons.html"},
        {"code": "Smart Audit · ISO 9001", "n": B("التدقيق ودليل ISO 9001", "Audit and the ISO 9001 guide"), "col": "#C2410C", "d": B("المدقق يطلب السجل دليلاً على البند 4.2؛ ودليل ISO 9001:2026 يشرح البند نفسه.", "The auditor asks for the register as evidence of clause 4.2; the ISO 9001:2026 guide explains the clause itself."), "tool": "./smart-audit-improvement.html"}
    ],
    "comp": [
        {"code": "ISO 9001:2026 §4.2 · A.4.2 · §4.3", "n": B("الأطراف المعنية والنطاق", "Interested parties and the scope"),
         "d": B("الأطراف ومتطلباتها وأيها يعالجه النظام، ومتابعتها ومراجعتها، وملاحظة المناخ؛ ومراعاة المتطلبات في تحديد النطاق.", "Parties, their requirements and which the system addresses, their monitoring and review, and the climate NOTE; the requirements considered when setting the scope.")},
        {"code": "ISO 9001:2026 §5.1.2 · §6.1.1 · §9.1.2 · §9.3.2", "n": B("العميل والمخاطر ومراجعة الإدارة", "Customer, risks and management review"),
         "d": B("التركيز على العميل، ومراعاة المتطلبات في المخاطر والفرص، ورضا العميل، وتغيرات احتياجات الأطراف في مراجعة الإدارة.", "Customer focus, requirements considered for risks and opportunities, customer satisfaction, and changes in the parties' needs at management review.")},
        {"code": "ISO 9000:2026 §3.1.4 · §4.4.2", "n": B("الطرف المعني", "Interested party"),
         "d": B("الطرف المعني (صاحب المصلحة) شخص أو منظمة تؤثر في قرار أو نشاط أو تتأثر به أو ترى أنها تتأثر؛ وتلبية احتياجاته فرصة وإهمالها خطر.", "An interested party (stakeholder) is a person or organization that can affect, be affected by, or perceive itself affected by a decision or activity; meeting its needs is an opportunity and neglecting them a risk.")},
        {"code": "ISO 10009:2024 §5.1 · §5.5 · §6.5", "n": B("ما يغطيه دليل الأدوات وما لا يغطيه", "What the tools guide covers and what it does not"),
         "d": B("لا أداة باسم تحليل الأطراف المعنية؛ الجدول 5.1 يذكر الأطراف في مراجعة SWOT الخارجية، و5.5 يذكر سجل سياق المنشأة، و6.5 يذكر الأطراف المستشارة والمطلعة في RACI.", "No tool named stakeholder analysis; Table 5.1 names parties in SWOT's external review, 5.5 names the context of the organization log, and 6.5 the consulted and informed parties of RACI.")},
        {"code": "Power/interest · AA1000 · ISO 26000", "n": B("مصفوفة القوة والاهتمام وأطر إشراك الأطراف (غير متحقق منها)", "Power/interest grid and engagement frameworks (not verified)"),
         "d": B("لا يوجد منها شيء مرفوع إلى المشروع؛ فالمصفوفة وقاعدة «الطرف الرئيسي» وقواعد المراحل والتدقيق صياغة الأداة.", "None is uploaded to the project; so the grid, the \"key party\" rule and the stage and audit rules are the tool's own wording.")}
    ],
    "buy": [],
    "buyNote": B("للنص الرسمي للمواصفات استخدم النسخ المنشورة من المنظمة الدولية للتوحيد القياسي، وليس هذه المنصة.",
                 "For the official text of the standards, use the copies published by the International Organization for Standardization, not this platform.")
}

texts = {
    "stdT": B("دليل المنهجية", "Method guide"),
    "stdS": B("متى يكون تحليل الأطراف المعنية مفيداً: النطاق والقرار، والفريق برأي خارجي، والطرف بعينه، والمتطلب بمصدره وتاريخه، وقرار 4.2 ج)، والقوة والاهتمام بسببهما، وطريقة التعامل ومالك العلاقة، ومتطلبات المناخ، والمخرج إلى SWOT وPESTLE والمخاطر، والمراجعة، والفجوات الشائعة وما يطلبه المدقق.",
              "When a stakeholder analysis is useful: scope and decision, a team with outside input, the specific party, the requirement with its source and date, the 4.2 c) decision, power and interest with reasons, the engagement approach and relationship owner, climate-related requirements, outcomes into SWOT, PESTLE and risks, the review, the common gaps and what an auditor asks for."),
    "clT": B("دليل البنود", "Clause guide"),
    "clS": B("بنود ISO 9001:2026 التي يخدمها السجل بأرقامها: الأطراف المعنية 4.2 بملاحظتها والملحق A.4.2، والنطاق 4.3 ب)، والتركيز على العميل 5.1.2، والمخاطر والفرص 6.1.1، ورضا العميل 9.1.2، ومدخلات مراجعة الإدارة 9.3.2 ج)؛ وتعريف ISO 9000:2026 ومفهومه 3.1.4 و4.4.2؛ والبنود 5.1 و5.5 و6.5 من ISO 10009:2024. لكل بند ملخص تفسيري ومثال وما يطلبه المدقق. قواعد الأسلوب مرقّمة GD وهي إرشاد لا بنود. الأمثلة توضيحية وليست بيانات حقيقية.",
             "The ISO 9001:2026 clauses the register serves, by number: interested parties 4.2 with its NOTE and Annex A.4.2, scope 4.3 b), customer focus 5.1.2, risks and opportunities 6.1.1, customer satisfaction 9.1.2 and management review inputs 9.3.2 c); the ISO 9000:2026 term and concept 3.1.4 and 4.4.2; and ISO 10009:2024 5.1, 5.5 and 6.5. Each has an interpretive summary, an example and what the auditor asks for. Technique rules are coded GD: guidance, not clauses. Examples are illustrative, not real data."),
    "note": B("ما يرد تحت «المتطلب» ملخص تفسيري بصياغة مستقلة، وليس النص الرسمي للمواصفة. وما تحت «كيف تطبقه» و«الفجوات» إرشاد تطبيقي. أرقام البنود وعناوينها متحقق منها من النصوص الرسمية المرفوعة.",
              "Text under “requirement” is an interpretive summary in independent wording, not the official text of the standard. “How to implement” and “common gaps” are practical guidance. Clause numbers and titles were checked against the uploaded official texts."),
    "chgT": B("ما الذي تغيّر", "What changed"),
    "chgS": B("", "")
}

phases = {
    "ctx": {"c": "#7A869E", "t": "#EEF1F6", "n": B("الأطراف ومتطلباتها", "Parties and their requirements")},
    "evid": {"c": "#3563C9", "t": "#E8EEFA", "n": B("الطرف المحدد والمصدر", "Specific party and source")},
    "rate": {"c": "#7B5BB8", "t": "#EFEAF7", "n": B("القرار والقوة والتعامل", "Decision, power and engagement")},
    "risk": {"c": "#B7790F", "t": "#FBF1D9", "n": B("المناخ والمخرجات والمخاطر", "Climate, outcomes and risks")},
    "rev": {"c": "#3C9A5F", "t": "#E5F4EA", "n": B("المراجعة والإبلاغ", "Review and communication")}
}

S = []

S.append({"id": "4.2", "grp": "core", "ph": "ctx", "col": "#7A869E", "tint": "#EEF1F6",
  "t": B("البند 4.2 فهم احتياجات الأطراف المعنية وتوقعاتها", "Clause 4.2 Understanding the needs and expectations of interested parties"),
  "s": B("الأطراف والمتطلبات والقرار", "Parties, requirements and the decision"), "sh": B("4.2 · الأطراف", "4.2 · Parties"),
  "p": B("تطلب المواصفة تحديد الأطراف ذات الصلة ومتطلباتها وأيها سيعالجه النظام، ومتابعتها ومراجعتها. والسجل طريقة لتنظيم ذلك، بشرط أن يخدم قراراً وأن يُراجع.",
         "The standard asks to determine the relevant parties, their requirements and which of them the system will address, and to monitor and review them. A register is a way to organise this, provided it serves a decision and is reviewed."),
  "fl": L(("الطرف ذو الصلة", "Relevant party"), ("المتطلب", "Requirement"), ("قرار ج)", "Decision c)"), ("المتابعة", "Monitoring"), ("المناخ", "Climate")),
  "it": [
    IT("4.2", "DE1", B("الأطراف ومتطلباتها وأيها يعالجه النظام", "Parties, their requirements, and which the system addresses"),
       R(IS, "تطلب ISO 9001:2026 في البند 4.2 أن تحدد المنشأة: أ) الأطراف المعنية ذات الصلة بنظام إدارة الجودة، ب) متطلبات هذه الأطراف ذات الصلة، ج) أي هذه المتطلبات سيعالجه النظام. وتطلب متابعة المعلومات عن هذه الأطراف ومتطلباتها ومراجعتها. وتذكر الملاحظة أن للأطراف ذات الصلة متطلبات قد تتصل بتغير المناخ.",
         "ISO 9001:2026 clause 4.2 asks the organization to determine a) the interested parties relevant to the quality management system, b) the relevant requirements of these parties and c) which of these requirements will be addressed through the system. It asks to monitor and review information about these parties and their requirements. Its NOTE says relevant parties can have requirements related to climate change."),
       R(EX, "في سجل الواحة ST-EX-01 كُتب متطلب البنك «قوائم مالية ربع سنوية وتقرير بالمشاريع المتأخرة» وقُرر «جزئياً»: يعالج النظام تقرير المشاريع المتأخرة، أما القوائم المالية فخارجه، وكُتب السبب.",
         "in Al-Waha's register ST-EX-01, the bank's requirement \"quarterly financial statements and a delayed-projects report\" was decided \"partly\": the system covers the delayed-projects report, the statements sit outside it, and the reason was written."),
       L(("سجّل لكل متطلب قراراً: نعم أو جزئياً أو لا", "Record a decision for every requirement: yes, partly or no"), ("اكتب السبب عند «جزئياً» أو «لا»", "Write the reason for partly or no"), ("حدد موعد مراجعة للسجل", "Set a review date for the register")),
       L(("سجل مؤرخ بالأطراف والمتطلبات وقراراتها", "A dated register of parties, requirements and decisions"), ("سجل المراجعات", "The review log")),
       L(("قائمة أطراف بلا متطلبات", "A list of parties with no requirements"), ("كل المتطلبات «نعم» دون تمييز", "Every requirement \"yes\" with no distinction"), ("متطلب مرفوض بلا سبب", "A requirement rejected with no reason")),
       B("الإدارة العليا", "Top management"), B("متطلبات لها قرار وسبب ÷ كل المتطلبات", "Requirements with a decision and reason ÷ all requirements")),
    IT("A.4.2", "RV1", B("الأطراف ومتطلباتها تتغير", "Parties and their requirements change"),
       R(IS, "يوضح الملحق A.4.2 من ISO 9001:2026 أن فهم الأطراف يعني تحديد الأطراف ذات الصلة بالنظام ومتطلباتها، وأن المتطلبات التي تعدها المنشأة ذات صلة تدخل في حدود النظام، وأن متطلبات المزودين الخارجيين قد تنطبق. ويذكر أن الأطراف ومتطلباتها تتغير مع الوقت، فالوعي بالتغير جزء من بقاء النظام فعالاً، وأن توقعات المناخ قد تؤثر في الامتثال التنظيمي ومتطلبات العملاء والتزامات المنشأة.",
         "Annex A.4.2 of ISO 9001:2026 explains that understanding parties means determining the parties relevant to the system and their requirements, that the requirements the organization considers relevant fall within the system's boundaries, and that requirements of external providers can apply. It says parties and their requirements change over time, so awareness of the changes is part of keeping the system effective, and that climate expectations can influence regulatory compliance, customer requirements and organizational commitments."),
       R(EX, "لما رُسّي عقد مدارس جدة في أكتوبر 2026، روجع السجل ST-EX-01 وسُجل أن عميلاً ثانياً يدخل السجل القادم.",
         "when the Jeddah schools contract was awarded in October 2026, register ST-EX-01 was reviewed and it was recorded that a second client joins the next register."),
       L(("اكتب في السجل التغيرات التي تستدعي مراجعته قبل موعده", "Write in the register the changes that call for a review before its date"),),
       L(("سجل المراجعات بتاريخها وسببها وما تغير", "The review log with dates, reasons and what changed"),),
       L(("سجل لم يتغير رغم عقد جديد أو مورد جديد", "A register that never changed despite a new contract or a new supplier"),),
       B("مالك القرار", "Decision owner"), B("—", "—")),
    IT("GD-1", "x:tools", B("النطاق والقرار قبل الأطراف", "Scope and decision before the parties"),
       R(GD, "اكتب قبل أي طرف: لماذا نحلل (المنشأة، أو وحدة، أو مشروع، أو عطاء، أو موقع، أو عملية)، وأي قرار أو خطة يخدم السجل، ومتى يُتخذ. فطرف رئيسي في موقع قد لا يهم استراتيجية الشركة. لذلك لا تكتمل مرحلة «حُدد النطاق» حتى يُكتب القرار والتاريخ والميسّر.",
         "write before any party: why we analyse (the organization, a unit, a project, a bid, a site or a process), which decision or plan the register serves, and when it is taken. A key party on a site may not matter for the company strategy. So the \"scoped\" stage is not complete until the decision, the date and the facilitator are written."),
       R(EX, "سجل البرج ج ST-EX-03 يخدم قراراً واحداً: أي الأطراف تغطيها خطة الرفع وخطة السلامة لعام 2027.",
         "the Tower C register ST-EX-03 serves one decision: which parties the lift plan and the 2027 HSE plan must cover."),
       L(("اكتب القرار جملة واحدة بفعل وموعد", "Write the decision as one sentence with a verb and a date"),),
       L(("القرار المكتوب في رأس السجل", "The decision written at the head of the register"),),
       L(("سجل «عام» للشركة بلا قرار", "A \"general\" company register with no decision"),),
       B("مالك القرار", "Decision owner"), B("سجلات لها قرار مكتوب ÷ كل السجلات", "Registers with a written decision ÷ all registers")),
    IT("4.3", "x:tools", B("النطاق يراعي متطلبات الأطراف", "The scope considers the parties' requirements"),
       R(IS, "تطلب ISO 9001:2026 في البند 4.3 تحديد حدود النظام وانطباقه لتحديد نطاقه، مع مراعاة: أ) القضايا في 4.1، ب) المتطلبات في 4.2، ج) منتجات المنشأة وخدماتها. فمتطلب طرف قُرر أن يعالجه النظام يدخل في حدود النطاق.",
         "ISO 9001:2026 clause 4.3 asks to determine the boundaries and applicability of the system to establish its scope, considering a) the issues of 4.1, b) the requirements of 4.2 and c) the organization's products and services. A party's requirement decided as addressed falls within the scope's boundaries."),
       R(EX, "شهادة السلامة قبل التسليم (الدفاع المدني) دخلت نطاق النظام لأنها شرط لتسليم كل مبنى.",
         "the safety certificate before handover (civil defence) fell within the system's scope because it conditions the handover of every building."),
       L(("راجع النطاق إذا قُرر متطلب جديد «نعم»", "Revisit the scope when a new requirement is decided \"yes\""),),
       L(("بيان النطاق", "The scope statement"),),
       L(("نطاق لا يعكس متطلبات العميل الرئيسية", "A scope that does not reflect the main client's requirements"),),
       B("مدير الجودة", "Quality manager"), B("—", "—"))
  ]})

S.append({"id": "3.1.4", "grp": "core", "ph": "evid", "col": "#3563C9", "tint": "#E8EEFA",
  "t": B("الفريق والطرف المحدد والمتطلب بمصدره", "The team, the specific party, the requirement with its source"),
  "s": B("قواعد الأسلوب", "Technique rules"), "sh": B("GD · الأطراف", "GD · Parties"),
  "p": B("الطرف يُسمّى بعينه، ويكتبه فريق فيه رأي من الخارج، واحتياجه يُكتب متطلباً بمصدر وتاريخ.",
         "A party is named specifically, by a team with outside input, and its need is written as a requirement with a source and a date."),
  "fl": L(("الفريق", "Team"), ("الاسم", "Name"), ("المتطلب", "Requirement"), ("المصدر", "Source"), ("التاريخ", "Date")),
  "it": [
    IT("3.1.4", "IN2", B("الطرف المعني في ISO 9000:2026", "Interested party in ISO 9000:2026"),
       R(IS, "يعرّف ISO 9000:2026 الطرف المعني، ويسميه أيضاً صاحب المصلحة (3.1.4)، بأنه شخص أو منظمة يمكن أن يؤثر في قرار أو نشاط، أو يتأثر به، أو يرى أنه يتأثر به. ومن أمثلته العملاء والملاك والعاملون والمزودون والمصارف والجهات التنظيمية والنقابات والشركاء والمجتمع، ومنه المنافسون وجماعات الضغط المعارضة.",
         "ISO 9000:2026 defines the interested party, also called stakeholder (3.1.4), as a person or organization that can affect, be affected by, or perceive itself to be affected by a decision or activity. Examples include customers, owners, people in the organization, providers, bankers, regulatory authorities, unions, partners and society, including competitors and opposing pressure groups."),
       R(EX, "«جمعية سكان حي النخيل» طرف يرى أنه يتأثر بمسار الرافعة، فهو طرف معني ولو لم يكن له عقد.",
         "\"the Al-Nakheel residents' association\" perceives itself affected by the crane's path, so it is an interested party even with no contract."),
       L(("مر على أمثلة 3.1.4 للتأكد أن لا فئة غائبة", "Go through the 3.1.4 examples to check that no group is missing"), ("سمِّ الجهة داخل كل فئة", "Name the body inside each group")),
       L(("قائمة الأطراف بأسمائها وأنواعها", "The list of parties with names and types"),),
       L(("نسيان الأطراف الداخلية مثل العاملين", "Forgetting internal parties such as employees"), ("«المجتمع» بلا جهة مسماة", "\"The community\" with no named body")),
       B("الميسّر", "Facilitator"), B("أطراف بأسماء محددة ÷ كل الأطراف", "Parties with specific names ÷ all parties")),
    IT("GD-2", "IN1", B("فريق برأي من الخارج", "A team with outside input"),
       R(GD, "ثلاثة أدوار على الأقل، وواحد على الأقل من خارج الفريق: ممثل عميل، أو مورد، أو مستشار، أو إدارة أخرى. فالإدارة وحدها لا ترى كل الأطراف، كما ينبّه الجدول 5.1 في ISO 10009:2024 بالنسبة لـ SWOT (أن يُنفذ بمدخلات خارجية لا بشخص واحد). وتنبّه الأداة على «سجل الشخص الواحد».",
         "at least three roles, and at least one from outside the team: a client representative, a supplier, an advisor or another department. Management alone does not see every party, as ISO 10009:2024 Table 5.1 notes for SWOT (carried out with external inputs, not by one person). The tool flags a \"one-person register\"."),
       R(EX, "في سجل الشركة جلس مهندس الإشراف ممثل العميل مع الفريق، فأضاف متطلب «تقرير التقدم الشهري بمؤشرات الجودة».",
         "in the company register the client's supervising engineer sat with the team and added the \"monthly progress report with quality indicators\" requirement."),
       L(("ادعُ ممثلاً لطرف رئيسي إلى الجلسة", "Invite a representative of a key party to the session"),),
       L(("أسماء الفريق وأدوارهم في السجل", "The team's names and roles in the register"),),
       L(("سجل يعده مدير الجودة وحده", "A register prepared by the quality manager alone"),),
       B("الميسّر", "Facilitator"), B("سجلات بفريق ورأي خارجي ÷ كل السجلات", "Registers with a team and outside input ÷ all registers")),
    IT("GD-3", "IN2", B("الطرف بعينه، لا الفئة", "The specific party, not the group"),
       R(GD, "سمِّ الجهة: «أمانة الرياض — إدارة رخص البناء» لا «الحكومة»، و«مصنع النخبة للخرسانة» لا «الموردون». فالجهة المسماة لها متطلبات تُقرأ ومالك علاقة يُسأل. وتنبّه الأداة على الاسم العام («المجتمع»، «الجمهور»، «العملاء»)، ولا تكتمل مرحلة «أطراف مسماة» وفيها اسم عام.",
         "name the body: \"Riyadh municipality — building permits department\", not \"the government\"; \"Al-Nukhba Ready-Mix plant\", not \"suppliers\". A named body has requirements that can be read and a relationship owner who can be asked. The tool flags generic names (\"the community\", \"the public\", \"customers\"), and the \"parties named\" stage is not complete while one remains."),
       R(EX, "كُتب «جمعية سكان حي النخيل» بدل «المجتمع المحلي»، فصار للطرف قناة (رسالة أسبوعية) ومالك (مدير الموقع).",
         "\"the Al-Nakheel residents' association\" was written instead of \"the local community\", so the party got a channel (a weekly message) and an owner (the site manager)."),
       L(("اسأل: من بالضبط؟ وما اسم الجهة؟", "Ask: who exactly? What is the body's name?"),),
       L(("—", "—"),),
       L(("أطراف عامة لا يمكن التواصل معها", "Generic parties no one can contact"),),
       B("الميسّر", "Facilitator"), B("—", "—")),
    IT("GD-4", "IN3", B("المتطلب بمصدره وتاريخه", "The requirement with its source and date"),
       R(GD, "اكتب الاحتياج متطلباً يمكن التحقق منه، واذكر مصدره: بند عقد، أو نظام وتعميم، أو استبيان، أو محضر اجتماع، أو شكوى، وتاريخ المصدر. فالمتطلب بلا مصدر رأي حتى يُعرف من قاله. وتطلب الأداة المصدر والتاريخ لكل متطلبات الأطراف الرئيسية، وتنبّه على غيرها.",
         "write the need as a requirement that can be checked, and name its source: a contract clause, a regulation or circular, a survey, meeting minutes or a complaint, with the source's date. A requirement with no source is an opinion until someone owns it. The tool requires the source and date for every key-party requirement and flags the others."),
       R(EX, "«طريقة عمل للصب في الحر قبل يونيو» مصدرها العقد RS-2025-114، الملحق الفني، البند 7.4، بتاريخ 2025-11-20.",
         "\"a hot-weather method statement before June\" comes from contract RS-2025-114, technical annex, clause 7.4, dated 2025-11-20."),
       L(("أرفق رقم البند أو التعميم أو المحضر", "Quote the clause, circular or minutes number"),),
       L(("المصادر المذكورة في السجل", "The sources named in the register"),),
       L(("متطلبات «متوقعة» بلا مصدر", "\"Expected\" requirements with no source"),),
       B("مالكو العلاقات", "Relationship owners"), B("متطلبات الرئيسيين بمصدر وتاريخ ÷ متطلبات الرئيسيين", "Key-party requirements with source and date ÷ key-party requirements"))
  ]})

S.append({"id": "4.4.2", "grp": "core", "ph": "rate", "col": "#7B5BB8", "tint": "#EFEAF7",
  "t": B("القوة والاهتمام وطريقة التعامل", "Power, interest and the engagement approach"),
  "s": B("قواعد الأسلوب", "Technique rules"), "sh": B("GD · التقييم", "GD · Rating"),
  "p": B("درجة القوة ودرجة الاهتمام، كل منهما بسبب، تحددان طريقة التعامل، ولكل طرف رئيسي مالك وقناة.",
         "A power score and an interest score, each with a reason, set the engagement approach, and every key party has an owner and a channel."),
  "fl": L(("القوة", "Power"), ("الاهتمام", "Interest"), ("المصفوفة", "Grid"), ("المالك", "Owner"), ("القناة", "Channel")),
  "it": [
    IT("GD-6", "DE2", B("القوة والاهتمام بسبب", "Power and interest with a reason"),
       R(GD, "قيّم القوة أو التأثير (قدرة الطرف على تغيير قراراتك أو إيقاف عملك) والاهتمام (مدى تأثره بما تفعل) من 1 إلى 5، واكتب سبباً قصيراً لكل درجة. وتضع الأداة الطرف في مربع: إدارة عن قرب (كلاهما 4 أو أكثر)، أو إبقاء راضياً (القوة فقط)، أو إبقاء مطلعاً (الاهتمام فقط)، أو متابعة. والطرف «الرئيسي» قوته أو اهتمامه 4 أو أكثر. هذه المصفوفة والقاعدة تصميم الأداة، ولا تذكرها المواصفات المرفوعة.",
         "rate power or influence (the party's ability to change your decisions or stop your work) and interest (how much what you do affects it) from 1 to 5, with a short reason for each. The tool places the party: manage closely (both 4 or more), keep satisfied (power only), keep informed (interest only) or monitor. A \"key\" party has power or interest of 4 or more. This grid and rule are the tool's design; the uploaded standards do not state them."),
       R(EX, "الدفاع المدني: قوة 5 (يصدر شهادة التسليم) واهتمام 3 (يتدخل عند التسليم والحوادث)، فهو «إبقاء راضياً».",
         "civil defence: power 5 (issues the handover certificate) and interest 3 (steps in at handover and after incidents), so \"keep satisfied\"."),
       L(("اكتب سبباً من سطر لكل درجة", "Write a one-line reason for each score"),),
       L(("المصفوفة في السجل والتقرير", "The grid in the register and the report"),),
       L(("درجات بلا سبب تتغير بتغير من يكتبها", "Scores with no reason that change with whoever writes them"),),
       B("الميسّر", "Facilitator"), B("أطراف مقيّمة بسبب ÷ كل الأطراف", "Parties rated with reasons ÷ all parties")),
    IT("GD-7", "DE3", B("طريقة التعامل ومالك العلاقة", "Engagement approach and relationship owner"),
       R(GD, "لكل طرف رئيسي: مالك علاقة باسم وظيفته، وقناة تواصل (اجتماع، بوابة، تقرير، زيارة)، وتكرار. ويشبه ذلك تقسيم RACI في ISO 10009:2024 البند 6.5 للأطراف إلى من يُستشار ومن يُبلّغ. ولا تكتمل مرحلة «تعامل ومخرجات» وطرف رئيسي بلا مالك أو قناة أو تكرار.",
         "for every key party: a relationship owner by job title, a channel (a meeting, a portal, a report, a visit) and a frequency. This is close to how RACI in ISO 10009:2024 clause 6.5 splits parties into consulted and informed. The \"engagement and outcomes\" stage is not complete while a key party has no owner, channel or frequency."),
       R(EX, "مصنع النخبة: مالك العلاقة مدير المشتريات، والقناة اجتماع أسبوعي ونظام الطلبات، والتكرار أسبوعي.",
         "Al-Nukhba plant: the owner is the procurement manager, the channel a weekly meeting and the ordering system, the frequency weekly."),
       L(("اربط القناة بتكرار يناسب المربع", "Match the channel's frequency to the quadrant"),),
       L(("محاضر الاجتماعات أو التقارير الدورية", "Meeting minutes or periodic reports"),),
       L(("طرف «إدارة عن قرب» بلا اجتماع منتظم", "A \"manage closely\" party with no regular meeting"),),
       B("مالكو العلاقات", "Relationship owners"), B("أطراف رئيسية لها مالك وقناة ÷ الأطراف الرئيسية", "Key parties with an owner and channel ÷ key parties")),
    IT("4.4.2", "DE2", B("الأطراف فرصة وخطر في ISO 9000:2026", "Parties as opportunity and risk in ISO 9000:2026"),
       R(IS, "يذكر ISO 9000:2026 في البند 4.4.2 أن بعض الأطراف المعنية فرصة كبيرة للنجاح المستدام إذا لُبيت احتياجاتها وتوقعاتها، وخطر إذا لم تُلبَّ، وأن جزءاً من فهم السياق تحديد الأطراف ذات الصلة واحتياجاتها وتوقعاتها وأثرها في المنشأة، وأن المفهوم يوسع التركيز إلى ما بعد العميل، وأن إشراك الأطراف وبناء علاقات إيجابية معها يحسن الأداء والسمعة واستباق المخاطر والقرار والامتثال.",
         "ISO 9000:2026 clause 4.4.2 says some interested parties can be a significant opportunity for sustained success if their needs and expectations are met, and a risk if they are not; that part of understanding the context is identifying relevant parties, their needs and expectations and their effect on the organization; that the concept extends the focus beyond the customer; and that engaging parties and building positive relationships improves performance, reputation, risk anticipation, decisions and compliance."),
       R(EX, "عمال المواقع: تلبية متطلب الظل والماء فرصة (حوادث حرارية أقل)، وإهماله خطر.",
         "site workers: meeting the shade and water requirement is an opportunity (fewer heat incidents), neglecting it a risk."),
       L(("اسأل لكل طرف رئيسي: ما الفرصة إن لبّينا، وما الخطر إن لم نلبّ؟", "Ask for each key party: what is the opportunity if we meet it, the risk if we don't?"),),
       L(("—", "—"),),
       L(("التركيز على العميل وحده", "Focusing on the customer alone"),),
       B("مالك القرار", "Decision owner"), B("—", "—"))
  ]})

S.append({"id": "6.1.1", "grp": "core", "ph": "risk", "col": "#B7790F", "tint": "#FBF1D9",
  "t": B("المناخ والمخرجات والمخاطر والعميل", "Climate, outcomes, risks and the customer"),
  "s": B("إلى أين يذهب الطرف", "Where the party goes"), "sh": B("6.1 · المخرجات", "6.1 · Outcomes"),
  "p": B("يُسأل كل طرف رئيسي عن المناخ، ويذهب إلى SWOT أو PESTLE أو المخاطر أو خطة 6.1، أو يُستبعد بسبب.",
         "Every key party is asked about climate and goes into SWOT, PESTLE, risks or the 6.1 plan, or is set aside with a reason."),
  "fl": L(("المناخ", "Climate"), ("SWOT", "SWOT"), ("PESTLE", "PESTLE"), ("6.1", "6.1"), ("العميل", "Customer")),
  "it": [
    IT("GD-8", "OU1", B("سؤال صريح عن متطلبات المناخ", "An explicit question on climate-related requirements"),
       R(GD, "اسأل كل طرف رئيسي صراحة: هل لديكم متطلب يتصل بتغير المناخ؟ وعلّم المتطلب «يتصل بالمناخ»، واكتب في السجل ما الذي سُئل ومن سُئل والنتيجة، ولو كانت «لا متطلبات ذات صلة». فملاحظة 4.2 تذكر أن للأطراف متطلبات قد تتصل بتغير المناخ، والملحق A.4.2 يذكر أثرها في الامتثال التنظيمي ومتطلبات العملاء.",
         "ask every key party explicitly: do you have a requirement related to climate change? Mark the requirement \"climate-related\", and write in the register what was asked, of whom, and the result, even when it is \"no relevant requirement\". The NOTE to 4.2 says parties can have climate-related requirements, and Annex A.4.2 names their effect on regulatory compliance and customer requirements."),
       R(EX, "في عطاء المستشفى سُئلت الهيئة في اجتماع الاستيضاح، فظهر متطلب «خطة إدارة الحرارة» في الملحق ج.",
         "in the hospital bid the authority was asked at the clarification meeting, and the \"heat management plan\" requirement surfaced in appendix C."),
       L(("أضف سؤال المناخ إلى جدول الاجتماع مع كل طرف رئيسي", "Add the climate question to the agenda with every key party"),),
       L(("نتيجة السؤال في السجل", "The question's result in the register"),),
       L(("«لا متطلبات مناخية» دون أن يُسأل أحد", "\"No climate requirements\" without anyone being asked"),),
       B("الميسّر", "Facilitator"), B("سجلات سُئل فيها عن المناخ ÷ كل السجلات", "Registers where climate was asked ÷ all registers")),
    IT("GD-9", "OU2", B("الأطراف الرئيسية إلى SWOT وPESTLE", "Key parties into SWOT and PESTLE"),
       R(GD, "الأطراف مصدر للفرص والتهديدات: عميل يطلب شيئاً جديداً فرصة، وجهة تنظيمية تشدد شرطاً تهديد. فاحمل كل طرف رئيسي إلى دراسة SWOT (فرصة أو تهديد، برقم الدراسة) أو إلى مسح PESTLE (بعامله، برقم المسح)، أو إلى المخاطر، أو استبعده بسبب مكتوب. ولا تكتمل مرحلة «تعامل ومخرجات» وطرف رئيسي بلا مخرج.",
         "parties are sources of opportunities and threats: a client asking for something new is an opportunity, a regulator tightening a condition is a threat. So carry every key party into a SWOT study (an opportunity or a threat, by the study id) or a PESTLE scan (by its factor and scan id), or into risks, or set it aside with a written reason. The \"engagement and outcomes\" stage is not complete while a key party has no outcome."),
       R(EX, "متطلب العميل «طريقة العمل في الحر» دخل SW-EX-01 تهديداً، وكود العزل المعدل (الأمانة) دخل PE-EX-01 في العامل القانوني.",
         "the client's \"hot-weather method statement\" went into SW-EX-01 as a threat, and the amended insulation code (municipality) into PE-EX-01 under the legal factor."),
       L(("استخدم زر «أضف مخرجاً لكل طرف رئيسي»", "Use the \"add an outcome for every key party\" button"),),
       L(("أرقام الدراسات والمسوح في المخرجات", "Study and scan ids in the outcomes"),),
       L(("أطراف رئيسية لا أثر لها في SWOT ولا المخاطر", "Key parties with no trace in SWOT or risks"),),
       B("مالكو المخرجات", "Outcome owners"), B("أطراف رئيسية لها مخرج ÷ الأطراف الرئيسية", "Key parties with an outcome ÷ key parties")),
    IT("6.1.1", "OU3", B("المتطلبات في تحديد المخاطر والفرص", "Requirements in determining risks and opportunities"),
       R(IS, "تطلب ISO 9001:2026 في البند 6.1.1 أن تراعي المنشأة عند التخطيط للنظام القضايا في 4.1 والمتطلبات في 4.2، وتحدد المخاطر والفرص التي يجب معالجتها لضمان قدرة النظام على تحقيق نتائجه، ومنع الآثار غير المرغوبة أو تقليلها، وتحقيق التحسين المستمر، وتعزيز الآثار المرغوبة.",
         "ISO 9001:2026 clause 6.1.1 asks the organization, when planning the system, to consider the issues of 4.1 and the requirements of 4.2 and to determine the risks and opportunities to address to give assurance the system can achieve its intended results, prevent or reduce undesired effects, achieve continual improvement and enhance desired effects."),
       R(EX, "شهادة الدفاع المدني دخلت سجل المخاطر برقم RR-2026-15، والمورد البديل للخرسانة دخل خطة 6.1 للتوريد.",
         "the civil defence certificate went into the risk register as RR-2026-15, and a back-up concrete supplier into the 6.1 supply plan."),
       L(("اكتب رقم الخطر أو بند الخطة في مخرج الطرف", "Write the risk id or the plan entry in the party's outcome"),),
       L(("مراجع السجل والخطة في المخرجات", "Register and plan references in the outcomes"),),
       L(("خطة 6.1 لا تذكر أي طرف", "A 6.1 plan that names no party"),),
       B("مدير المخاطر", "Risk manager"), B("—", "—")),
    IT("5.1.2", "x:tools", B("التركيز على العميل", "Customer focus"),
       R(IS, "تطلب ISO 9001:2026 في البند 5.1.2 أن تُظهر الإدارة العليا قيادتها في التركيز على العميل بضمان: أ) تحديد متطلبات العميل والمتطلبات القانونية والتنظيمية المنطبقة وفهمها والوفاء بها باستمرار، ب) تحديد المخاطر والفرص التي تمس مطابقة المنتجات والخدمات ورضا العميل ومعالجتها، ج) الحفاظ على التركيز على تعزيز رضا العميل.",
         "ISO 9001:2026 clause 5.1.2 asks top management to show leadership on customer focus by ensuring that a) customer and applicable statutory and regulatory requirements are determined, understood and consistently met, b) the risks and opportunities affecting conformity and customer satisfaction are determined and addressed, and c) the focus on enhancing customer satisfaction is maintained."),
       R(EX, "العميل والأمانة والدفاع المدني في سجل الشركة: متطلبات العميل والجهات التنظيمية في مكان واحد بقراراتها.",
         "the client, the municipality and civil defence in the company register: the customer's and the regulators' requirements in one place, with their decisions."),
       L(("ضع العميل والجهات التنظيمية في أول السجل", "Put the customer and the regulators first in the register"),),
       L(("—", "—"),),
       L(("متطلبات تنظيمية غائبة عن السجل", "Regulatory requirements missing from the register"),),
       B("الإدارة العليا", "Top management"), B("—", "—")),
    IT("9.1.2", "x:tools", B("رضا العميل مصدر للمتطلبات", "Customer satisfaction as a source of requirements"),
       R(IS, "تطلب ISO 9001:2026 في البند 9.1.2 متابعة رضا العميل وتحديد طرق الحصول على معلوماته ومتابعتها ومراجعتها، وتذكر الملاحظة مصادر مثل الاستبيانات وملاحظات العملاء على ما سُلّم والاجتماعات معهم والشكاوى والمطالبات.",
         "ISO 9001:2026 clause 9.1.2 asks to monitor customer satisfaction and to determine the methods for obtaining, monitoring and reviewing its information; its NOTE names sources such as surveys, feedback on delivered products and services, meetings with customers and complaints and claims."),
       R(EX, "متطلب «تقرير تقدم شهري بمؤشرات الجودة» جاء من اجتماع التقدم مع العميل، فصار مصدره محضر الاجتماع.",
         "the \"monthly progress report with quality indicators\" requirement came from the progress meeting with the client, so its source is the meeting record."),
       L(("استخدم الاستبيانات والشكاوى مصادر للمتطلبات", "Use surveys and complaints as sources of requirements"),),
       L(("—", "—"),),
       L(("نتائج رضا العميل لا تغيّر السجل", "Customer satisfaction results that never change the register"),),
       B("مدير الجودة", "Quality manager"), B("—", "—"))
  ]})

S.append({"id": "9.3.2", "grp": "core", "ph": "rev", "col": "#3C9A5F", "tint": "#E5F4EA",
  "t": B("المراجعة والإبلاغ ومراجعة الإدارة", "Review, communication and management review"),
  "s": B("السجل الحي", "A living register"), "sh": B("9.3.2 · المراجعة", "9.3.2 · Review"),
  "p": B("يؤرخ السجل ويُراجع دورياً وبعد التغيرات، وتذهب تغيراته إلى مراجعة الإدارة، وتُبلّغ نتيجته لمالكي العلاقات.",
         "The register is dated and reviewed periodically and after changes; its changes go to management review and its result to the relationship owners."),
  "fl": L(("الموعد", "Date"), ("التغير", "Change"), ("مراجعة الإدارة", "Management review"), ("الإبلاغ", "Communication"), ("التدقيق", "Audit")),
  "it": [
    IT("9.3.2", "RV2", B("تغيرات احتياجات الأطراف في مراجعة الإدارة", "Changes in parties' needs at management review"),
       R(IS, "تطلب ISO 9001:2026 في البند 9.3.2 أن تشمل مدخلات مراجعة الإدارة، ضمن أمور أخرى: ج) التغيرات في احتياجات الأطراف المعنية وتوقعاتها ذات الصلة بالنظام، ومن معلومات الأداء رضا العملاء وملاحظات الأطراف المعنية ذات الصلة، وأداء المزودين الخارجيين.",
         "ISO 9001:2026 clause 9.3.2 asks management review inputs to include, among others, c) changes in the needs and expectations of interested parties relevant to the system, and, within performance information, customer satisfaction and feedback from relevant interested parties, and the performance of external providers."),
       R(EX, "عُرضت مراجعة ST-EX-01 في 9 أكتوبر 2026 (عقد جدة، وتأكيد موعد كود العزل) في مراجعة الإدارة للربع الرابع.",
         "the 9 October 2026 review of ST-EX-01 (the Jeddah contract, the insulation code's confirmed date) went to the Q4 management review."),
       L(("أرفق ملخص تغيرات السجل بمدخلات مراجعة الإدارة", "Attach a summary of the register's changes to the management review inputs"),),
       L(("محضر مراجعة الإدارة يذكر التغيرات", "Management review minutes that mention the changes"),),
       L(("مراجعة إدارة لا تذكر الأطراف المعنية", "A management review that never mentions interested parties"),),
       B("مالك القرار", "Decision owner"), B("—", "—")),
    IT("GD-10", "RV1", B("المراجعة في موعدها وبعد التغيرات", "Review on its date and after changes"),
       R(GD, "يحمل السجل موعد المراجعة القادمة، والتغيرات التي تستدعي مراجعة قبله (عقد جديد، نظام جديد، شكوى كبيرة، مورد رئيسي جديد). وفي المراجعة يُكتب ما الذي تغير، والأطراف المضافة والمحذوفة. وتنبّه الأداة عندما يمضي الموعد بلا مراجعة.",
         "the register carries the next review date and the changes that call for a review before it (a new contract, a new regulation, a major complaint, a new key supplier). At the review, write what changed and the parties added or removed. The tool flags a review date that passes with no review."),
       R(EX, "سجل العطاء ST-EX-02 روجع في 14 أكتوبر 2026 بعد صدور الملحق 2.",
         "bid register ST-EX-02 was reviewed on 14 October 2026 after addendum 2 was issued."),
       L(("اربط موعد المراجعة بدورة مراجعة الإدارة", "Tie the review date to the management review cycle"),),
       L(("سجل المراجعات", "The review log"),),
       L(("سجل لم يُراجع منذ إعداده", "A register never reviewed since it was written"),),
       B("مالك القرار", "Decision owner"), B("سجلات روجعت ÷ كل السجلات", "Registers reviewed ÷ all registers")),
    IT("GD-11", "RV3", B("إبلاغ النتيجة", "Communicating the result"),
       R(GD, "أرسل نتيجة السجل وقراراته إلى مالكي العلاقات ومن يحتاجها: ما المتطلبات التي يعالجها النظام، وما الذي لن يُعالج ولماذا، ومن يتابع كل طرف. فالمالك الذي لا يعرف القرار لا يستطيع الوفاء به.",
         "send the register's result and decisions to the relationship owners and those who need them: which requirements the system addresses, what will not be addressed and why, and who follows each party. An owner who does not know the decision cannot keep it."),
       R(EX, "أُرسل التقرير إلى مديري المشاريع والمشتريات والسلامة بعد اعتماده.",
         "the report was sent to the projects, procurement and HSE managers after approval."),
       L(("نزّل تقرير HTML وأرسله بعد كل مراجعة", "Download the HTML report and send it after each review"),),
       L(("—", "—"),),
       L(("سجل لا يعرفه مالكو العلاقات", "A register the relationship owners have never seen"),),
       B("الميسّر", "Facilitator"), B("—", "—")),
    IT("GD-12", "x:tools", B("ما يطلبه المدقق والفجوات الشائعة", "What the auditor asks and the common gaps"),
       R(GD, "يطلب المدقق عادة: السجل المؤرخ، وأسماء الأطراف ونوعها، ومتطلباتها ومصادرها، وقرار 4.2 ج) لكل متطلب وسببه، وأين ظهرت الأطراف في المخاطر والفرص، وآخر مراجعة ومتى عُرضت في مراجعة الإدارة. والفجوات الشائعة: أطراف عامة، ومتطلبات بلا مصدر، وكل شيء «نعم»، وسجل لم يُراجع. والتدقيق الآلي في الأداة يفحص عشرة بنود منها.",
         "the auditor usually asks for: the dated register, the parties' names and types, their requirements and sources, the 4.2 c) decision on each requirement with its reason, where the parties show up in risks and opportunities, and the last review and when it went to management review. Common gaps: generic parties, unsourced requirements, everything \"yes\", and a register never reviewed. The tool's automatic audit checks ten of these."),
       R(EX, "نتيجة التدقيق الآلي لمثال الواحة تظهر في تبويب التدقيق.",
         "the automatic audit result of the Al-Waha example shows in the Audit tab."),
       L(("شغّل التدقيق الآلي قبل التدقيق الداخلي", "Run the automatic audit before the internal audit"),),
       L(("نتيجة التدقيق الآلي", "The automatic audit result"),),
       L(("—", "—"),),
       B("المدقق الداخلي", "Internal auditor"), B("نجاح التدقيق", "Audit pass rate"))
  ]})

S.append({"id": "5.5", "grp": "core", "ph": "evid", "col": "#7B5BB8", "tint": "#EFEAF7",
  "t": B("ISO 10009:2024: ما يغطيه وما لا يغطيه (5.1 و5.5 و6.5)", "ISO 10009:2024: what it covers and what it does not (5.1, 5.5, 6.5)"),
  "s": B("دليل أدوات الجودة", "Quality tools guidance"), "sh": B("10009 · 5.5", "10009 · 5.5"),
  "p": B("لا تسمي ISO 10009:2024 أداة «تحليل الأطراف المعنية». أقرب ما فيها: سجل سياق المنشأة بين الأدوات الأخرى في 5.5، والأطراف المستشارة والمطلعة في RACI في 6.5، والأطراف في مراجعة SWOT الخارجية في الجدول 5.1.",
         "ISO 10009:2024 names no \"stakeholder analysis\" tool. The closest: the context of the organization log among the other tools of 5.5, the consulted and informed parties of RACI in 6.5, and the parties in SWOT's external review in Table 5.1."),
  "fl": L(("5.5", "5.5"), ("COTO", "COTO"), ("RACI", "RACI"), ("SWOT", "SWOT"), ("حدود الدليل", "The guide's limits")),
  "it": [
    IT("5.5", "x:tools", B("أدوات أخرى ذات صلة في البند 5", "Other relevant tools in clause 5"),
       R(IS, "يذكر البند 5.5 من ISO 10009:2024 بين الموارد الأخرى ذات الصلة بأدوات الاستراتيجية: مخطط أو مصفوفة أو سجل سياق المنشأة (COTO)، والمواصفة ISO/PAS 24644-1، وإطار COSO في الشكل 1. ولا يراجع أياً منها بجدول فوائد ونقاط انتباه كما يفعل مع SWOT وPESTLE.",
         "ISO 10009:2024 clause 5.5 lists, among other resources relevant to the strategy tools, the context of the organization (COTO) diagram, matrix or log, ISO/PAS 24644-1, and the COSO framework in Figure 1. It does not review any of them with a table of benefits and points to note, as it does for SWOT and PESTLE."),
       R(EX, "يمكن أن يكون هذا السجل جزء «الأطراف المعنية» من سجل سياق المنشأة، بجانب مسح PESTLE للقضايا الخارجية.",
         "this register can be the \"interested parties\" part of a context of the organization log, next to the PESTLE scan of external issues."),
       L(("اجمع سجل الأطراف ومسح PESTLE في ملف سياق واحد", "Keep the parties register and the PESTLE scan in one context file"),),
       L(("—", "—"),),
       L(("ادعاء أن ISO 10009 تصف تحليل الأطراف المعنية", "Claiming ISO 10009 describes stakeholder analysis"),),
       B("مدير الجودة", "Quality manager"), B("—", "—")),
    IT("6.5", "x:tools", B("RACI والأطراف المعنية", "RACI and interested parties"),
       R(IS, "يراجع البند 6.5 من ISO 10009:2024 مصفوفة الصلاحيات وRACI/RASCI: المسؤول، والمساءل، والمستشار (أطراف معنية أخرى لها مدخلات محتملة في العملية أو تتأثر بمخرجاتها)، والداعم (أطراف بمدخلات فقط)، والمطلع (أطراف تُبلّغ دون مشاركة مباشرة).",
         "ISO 10009:2024 clause 6.5 reviews the authority matrix and RACI/RASCI: responsible, accountable, consulted (other interested parties with potential input to the process or affected by its outputs), supporting (parties with inputs only) and informed (parties kept informed but not directly involved)."),
       R(EX, "«إبقاء مطلعاً» في المصفوفة يقابل «المطلع» في RACI لعملية الرفع: جمعية السكان تُبلّغ أسبوعياً.",
         "\"keep informed\" in the grid matches \"informed\" in the lifting process RACI: the residents' association is told every week."),
       L(("استخدم المربعات لملء أعمدة المستشار والمطلع في RACI", "Use the quadrants to fill the consulted and informed columns of a RACI"),),
       L(("—", "—"),),
       L(("—", "—"),),
       B("مالكو العمليات", "Process owners"), B("—", "—")),
    IT("5.1", "OU2", B("الأطراف في SWOT في ISO 10009:2024", "Parties in SWOT in ISO 10009:2024"),
       R(IS, "يذكر الجدول 5.1 في ISO 10009:2024 أن المراجعة الخارجية في SWOT تشمل الأطراف المعنية كالمنافسين والعملاء، وأن التحليل يستفيد من تنوع وجهات النظر لأن الإدارة وحدها لا ترى وجهات نظر كل الأطراف، وأن يُنفذ بمدخلات خارجية لا بشخص واحد.",
         "ISO 10009:2024 Table 5.1 says SWOT's external review includes interested parties such as competitors and customers, that the analysis benefits from diverse perspectives because management alone will not see all interested parties' perspectives, and that it should be carried out with external inputs, not by a single person."),
       R(EX, "دراسة SW-EX-02 أخذت فرصة «مطابقة شرط الخبرة» من طرف الهيئة في سجل العطاء.",
         "study SW-EX-02 took the \"experience condition met\" opportunity from the authority in the bid register."),
       L(("سمِّ دراسة SWOT في مخرج كل طرف ينتقل إليها", "Name the SWOT study in the outcome of every party carried into it"),),
       L(("—", "—"),),
       L(("فرص وتهديدات في SWOT لا تذكر أي طرف", "SWOT opportunities and threats that name no party"),),
       B("مالك القرار", "Decision owner"), B("—", "—"))
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
    "edges": [["GD-1", "4.2"], ["3.1.4", "GD-3"], ["GD-2", "GD-3"], ["GD-3", "GD-4"], ["GD-4", "4.2"], ["4.2", "4.3"], ["4.2", "A.4.2"], ["4.2", "GD-6"],
              ["4.4.2", "GD-6"], ["GD-6", "GD-7"], ["6.5", "GD-7"], ["4.2", "GD-8"], ["GD-7", "GD-9"], ["GD-9", "5.1"], ["GD-9", "6.1.1"], ["5.1.2", "4.2"],
              ["9.1.2", "GD-4"], ["5.5", "4.2"], ["A.4.2", "GD-10"], ["GD-10", "9.3.2"], ["9.3.2", "GD-11"], ["GD-11", "GD-12"]],
    "changes": {"note": B("", ""), "tlT": B("", ""), "tlS": B("", ""), "tlCols": 4, "tl": [], "cardsT": B("", ""), "cardsS": B("", ""), "cards": [],
                "corr": {"t": B("", ""), "s": B("", ""), "h": [], "rows": []}, "steps": {"t": B("", ""), "s": B("", ""), "l": B("", "")}},
    "ui": {
        "ar": {"roles": "من يعمل في سجل الأطراف المعنية", "wheelT": "عجلة البنود", "purpose": "الغرض من الأداة", "smap": "خطوات السجل من القرار إلى المراجعة",
               "smapSub": "كل خطوة في سطر. اضغط «اشرح» لفتح البند أو القاعدة التي تخدمها.", "rel": "علاقتها بأدوات المنصة", "comp": "المراجع المساندة",
               "assess": "قيّم هذا في التقييم الذاتي", "assessC": "قيّم هذا في التقييم الذاتي",
               "assessOff": "هذا البند خارج أسئلة التقييم الذاتي، ويُطبَّق مباشرة في سجلات الأطراف.", "offGo": "افتح سجلات الأطراف",
               "actCtx": "يفتح السؤال {s}", "explainA": "اشرح {c} في دليل البنود"},
        "en": {"roles": "Who works on a stakeholder register", "wheelT": "Clause wheel", "purpose": "What the tool is for", "smap": "Steps of a register, from the decision to the review",
               "smapSub": "One line per step. Select “Explain” to open the clause or rule it serves.", "rel": "How it connects to the platform's tools", "comp": "Supporting references",
               "assess": "Assess this in the self-assessment", "assessC": "Assess this in the self-assessment",
               "assessOff": "This clause is outside the self-assessment questions; it is applied directly in the stakeholder registers.", "offGo": "Open the stakeholder registers",
               "actCtx": "Opens question {s}", "explainA": "Explain {c} in the clause guide"}
    }
}

QIDS = ["IN1", "IN2", "IN3", "DE1", "DE2", "DE3", "OU1", "OU2", "OU3", "RV1", "RV2", "RV3"]
_reached = {it["q"] for sec in S for it in sec["it"]}
assert all(q in _reached for q in QIDS), [q for q in QIDS if q not in _reached]
_codes = [it["c"] for sec in S for it in sec["it"]]
assert len(_codes) == len(set(_codes)), "duplicate item codes"
for a, b in DATA["edges"]:
    assert a in _codes and b in _codes, (a, b)
for m in std["map"]:
    assert m["go"] in _codes, m["go"]

if __name__ == "__main__":
    js = ("/* Stakeholder Analysis explanation data for the CIA Explain Kit v1.4. Stakeholder analysis is a technique, not a requirement of any\n"
          "   standard; ISO 10009:2024 names no tool by that name. ISO 9001:2026, ISO 9000:2026 (OCR) and ISO 10009:2024 clause numbers and titles\n"
          "   checked on 2026-10-17 against the uploaded texts. Requirements are interpretive summaries, not the official text; the power/interest\n"
          "   grid, stakeholder-mapping textbooks, AA1000 and ISO 26000 are not uploaded (\"not verified\"). */\n"
          "const EXPLAIN_STAKEHOLDERS=" + json.dumps(DATA, ensure_ascii=False, indent=1) + ";\n")
    sys.stdout.write(js)
