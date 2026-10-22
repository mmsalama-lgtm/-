"""EXPLAIN_PESTLE — data for the CIA Explain Kit v1.4 in modules/pestle.html (build step 2026-10-17, PESTLE).
PESTLE is a technique, not a requirement of any standard. The clause guide is built on the ISO 9001:2026 clauses the scan serves.
Checked on 2026-10-17:
  ISO 9001:2026 (ISO_9001_2026en 1.pdf, read with pdftotext) — 4.1 Understanding the organization and its context (external and internal issues
                   relevant to purpose and strategic direction that affect the intended results; determine whether climate change is a relevant
                   issue; monitor and review information about these issues; NOTE 1 positive and negative factors or conditions; NOTE 2 legal,
                   technological, competitive, market, cultural, political, social, economic and environmental issues at the international,
                   national, regional or local level; NOTE 3 strategic direction, values, culture, resources, knowledge and performance);
                   4.2 Understanding the needs and expectations of interested parties (NOTE: requirements related to climate change);
                   6.1.1 Determining risks and opportunities (consider the issues of 4.1 and the requirements of 4.2; a)–d)); 6.1.2 Actions to
                   address risks (determine, analyse and evaluate; plan actions, integrate and implement them, evaluate their effectiveness;
                   proportionate; NOTE 1 disruption; NOTE 2 avoid, take, eliminate the source, change likelihood or consequences, share, retain);
                   6.1.3 Actions to address opportunities (same pattern; NOTE new practices, products, partnerships, emerging technologies);
                   9.3.2 Management review inputs (b) changes in external and internal issues; c) changes in interested parties' needs and
                   expectations; g) and h) effectiveness of actions on risks and opportunities); Annex A.4.1 (issues change over time; awareness of
                   the changes supports effectiveness); A.6.1.3 (opportunities can come from market conditions, emerging technologies or regulatory
                   requirements).
  ISO 9000:2026 (ISO 9000-2026.pdf; scanned, read by OCR with tesseract on 2026-10-17) — 3.1.2 context of the organization (combination of
                   internal and external issues that can have an effect on an organization's approach to specifying and achieving its objectives);
                   3.7.2 risk (effect of uncertainty; Note 1 a deviation from the expected, positive or negative; Note 2 uncertainty is a deficiency
                   of information about an event, its consequence or likelihood); 4.4.1 Context of an organization (internal issues such as mission,
                   vision, values, culture, history, knowledge and performance; external issues such as legal, technological, competitive, market,
                   cultural, impact of climate change, social, economic, environmental and governmental influences; understanding the context helps
                   manage risks and opportunities).
  ISO 10009:2024 (ISO-10009-2024-Quality-Management-Guidance-for-Quality-Tools.pdf, uploaded in this step, read with pdftotext) — 5.1 SWOT
                   analysis; 5.2 PESTLE analysis (a tool to determine and track the environment in which the organization operates; often used in
                   strategic planning, sometimes with SWOT (5.1) and Porter's five or six forces (5.3); used when developing, reviewing and updating
                   the strategic business plan, as a precursor to determining strategies and risks and opportunities, and to capture relevant
                   external issues; Table 5.2 benefits: a structured approach, factors that might not otherwise be considered; points to note:
                   adjust the names of some factors or add others relevant to the context, update the information periodically to reflect
                   incidents such as a pandemic, an epidemic or military situations); 5.3 Porter's five or six forces; 7.2 Risk register/risk
                   assessment (inputs may come from SWOT, PESTLE or FMEA); Annex A Table A.1 places 5.2 in Plan and in Act of strategy and business
                   planning; Annex C Table C.1 for 5.2: strategy, both, team, medium data, capability ••, medium effort.
Not uploaded, so "not verified": any PESTLE or PESTEL textbook, scenario planning, horizon scanning, ISO 31000.
No text of a standard is reproduced: every "requirement" is an interpretive summary in independent wording.
Items coded GD-n are the author's practical guidance on the technique, not clauses. Usage: python3 data_pestle.py > explain_pestle.js"""
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
    "code": "PESTLE",
    "name": B("تحليل PESTLE", "PESTLE analysis"),
    "edition": B("أداة منهجية: مسح البيئة الخارجية", "Method tool: scanning the outside world"),
    "status": B("الأداة الثانية عشرة في صندوق أدوات التحسين المستمر", "Twelfth tool in the Continual Improvement Toolbox"),
    "cert": False,
    "certNote": B("PESTLE أسلوب، وليس مواصفة ولا متطلباً. تراجعه ISO 10009:2024 في البند 5.2 مع SWOT في 5.1 وقوى بورتر في 5.3. والمتطلبات التي يخدمها في ISO 9001:2026: فهم المنشأة وسياقها وقرار تغير المناخ (4.1)، والأطراف المعنية (4.2)، وتحديد المخاطر والفرص والتخطيط لها (6.1.1 و6.1.2 و6.1.3)، ومدخلات مراجعة الإدارة (9.3.2 ب)).",
                  "PESTLE is a technique, not a standard or a requirement. ISO 10009:2024 reviews it in 5.2, with SWOT in 5.1 and Porter's forces in 5.3. The ISO 9001:2026 requirements it serves: understanding the organization and its context and the climate change decision (4.1), interested parties (4.2), determining and planning for risks and opportunities (6.1.1, 6.1.2 and 6.1.3) and management review inputs (9.3.2 b))."),
    "verified": B("2026-10-17، من الملفات الرسمية المرفوعة إلى المشروع: ISO_9001_2026en 1.pdf (قُرئ بالأداة pdftotext)، وISO 9000-2026.pdf (ممسوح ضوئياً، قُرئ بالتعرف الضوئي)، وISO-10009-2024-Quality-Management-Guidance-for-Quality-Tools.pdf (مرفق في هذه الخطوة، قُرئ بالأداة pdftotext). كل «متطلب» ملخص تفسيري، وليس النص الرسمي. أي كتاب في PESTLE أو PESTEL، وأساليب السيناريوهات ومسح الأفق، وISO 31000: «غير متحقق منه».",
                  "2026-10-17, against the official files uploaded to the project: ISO_9001_2026en 1.pdf (read with pdftotext), ISO 9000-2026.pdf (scanned, read with OCR) and ISO-10009-2024-Quality-Management-Guidance-for-Quality-Tools.pdf (attached in this step, read with pdftotext). Every “requirement” is an interpretive summary, not the official text. Any PESTLE or PESTEL textbook, scenario planning, horizon scanning and ISO 31000: “not verified”.")
}

std = {
    "purpose": B("أن تتحول البيئة الخارجية إلى قرارات: بنود محددة بمصدرها وتاريخها وأثرها، مرتبة بالأهمية × اليقين، وقرار صريح في تغير المناخ، ثم يذهب كل بند أعلى إلى SWOT أو سجل المخاطر أو خطة 6.1 أو يُستبعد بسبب، ثم مراجعة دورية وبعد الأحداث الكبرى. القائمة التي لا تصل إلى قرار لا تغيّر شيئاً.",
                 "To turn the outside world into decisions: specific items with their source, date and effect, ranked by significance × certainty, an explicit climate change decision, then every top item into SWOT, the risk register or the 6.1 plan, or set aside with a reason, then a periodic review and one after major events. A list that reaches no decision changes nothing."),
    "who": B("الإدارة العليا وفرق الاستراتيجية، ومديرو تطوير الأعمال والعطاءات، ومديرو الجودة والمخاطر، ومديرو المشاريع والمواقع، ومن يعد مراجعة الإدارة، والمدققون الداخليون.",
             "Top management and strategy teams, business development and bid managers, quality and risk managers, project and site managers, whoever prepares management review, and internal auditors."),
    "rolesSub": B("المسح لا يعمل وحده؛ يعمل بمن يحدد القرار، ومن يأتي بالمصدر، ومن يحمل البند إلى SWOT والمخاطر. هذا توزيع مقترح للأدوار.",
                  "The scan does not work by itself; it works through who sets the decision, who brings the source, and who carries the item into SWOT and the risk register. This is a suggested split of roles."),
    "roles": [
        {"n": B("مالك القرار", "Decision owner"), "col": "#1B2A4A", "d": B("يحدد النطاق والمستوى والقرار الذي يخدمه المسح، ويعتمد المخرجات، ويحمل التغيرات إلى مراجعة الإدارة.", "Sets the scope, the level and the decision the scan serves, approves the outcomes, and carries the changes to management review.")},
        {"n": B("الميسّر", "Facilitator"), "col": "#1E8C93", "d": B("يجمع الفريق والرأي الخارجي، ويمر على العوامل الستة واحداً واحداً، ويطلب لكل بند مصدره وتاريخه.", "Brings the team and the outside input together, goes through the six factors one by one, and asks for the source and date of every item.")},
        {"n": B("أصحاب المصادر", "Source holders"), "col": "#3563C9", "d": B("المالية والمشتريات والشؤون القانونية والسلامة وتطوير الأعمال: الأنظمة وتواريخ سريانها، والأسعار، والإعلانات الحكومية، وسجلات الطقس.", "Finance, procurement, legal, HSE and business development: regulations and effective dates, prices, public announcements, weather records.")},
        {"n": B("مالكو المخرجات", "Outcome owners"), "col": "#C9821A", "d": B("يحملون البنود العليا إلى دراسة SWOT وسجل المخاطر وخطة 6.1، وينفذون الإجراءات بمواعيدها.", "Carry the top items into the SWOT study, the risk register and the 6.1 plan, and carry out the actions on time.")},
        {"n": B("المدقق الداخلي", "Internal auditor"), "col": "#C2410C", "d": B("يسأل: ما القضايا الخارجية؟ ومن أين جاءت؟ وهل قُرر تغير المناخ؟ وما الذي تغير بسببها؟ ومتى روجعت؟", "Asks: what are the external issues? Where did they come from? Was climate change decided? What changed because of them? When were they reviewed?")}
    ],
    "map": [
        {"no": "1", "t": B("النطاق والقرار", "Scope and decision"), "d": B("ماذا نمسح، وعلى أي مستوى، ولأي قرار.", "What we scan, at what level, and for which decision."), "go": "GD-1"},
        {"no": "2", "t": B("الفريق", "The team"), "d": B("ثلاثة أدوار ورأي من الخارج.", "Three roles and outside input."), "go": "GD-2"},
        {"no": "3", "t": B("العوامل الستة", "The six factors"), "d": B("كل عامل ببنوده أو بسبب «لا شيء ذو صلة».", "Each factor with its items, or the reason nothing is relevant."), "go": "GD-10"},
        {"no": "4", "t": B("واقعة بمصدر وتاريخ", "A fact with a source and a date"), "d": B("لا رأي ولا عبارة عامة.", "No opinion, no stock phrase."), "go": "GD-3"},
        {"no": "5", "t": B("الأثر والتقييم", "Effect and rating"), "d": B("فرصة أو تهديد، والأهمية واليقين والأفق.", "Opportunity or threat; significance, certainty and horizon."), "go": "GD-5"},
        {"no": "6", "t": B("قرار المناخ", "The climate decision"), "d": B("ذو صلة أم لا، ولماذا.", "Relevant or not, and why."), "go": "GD-7"},
        {"no": "7", "t": B("رتّب", "Rank"), "d": B("الأهمية × اليقين، والأعلى ست.", "Significance × certainty; the top six."), "go": "GD-8"},
        {"no": "8", "t": B("إلى SWOT والمخاطر", "Into SWOT and risks"), "d": B("أو يُستبعد بسبب.", "Or set aside with a reason."), "go": "GD-9"},
        {"no": "9", "t": B("إلى خطة 6.1", "Into the 6.1 plan"), "d": B("المخاطر والفرص العليا.", "The top risks and opportunities."), "go": "6.1.1"},
        {"no": "10", "t": B("راجع وأبلغ", "Review and communicate"), "d": B("في الموعد وبعد الأحداث الكبرى وفي مراجعة الإدارة.", "On its date, after major events and at management review."), "go": "9.3.2"}
    ],
    "rel": [
        {"code": "Strategy Studio", "n": B("استوديو الاستراتيجية والأداء", "Strategy & Performance Studio"), "col": "#3563C9", "d": B("يبدأ مسح من سجل PESTLE فيه، بنداً أو السجل كله (قراءة فقط)، وتبقى أهداف الاستراتيجية ومؤشراتها هناك.", "A scan starts from its PESTLE register, one item or the whole register (read-only); the strategy's objectives and KPIs stay there."), "tool": "./strategy-performance.html#pestle"},
        {"code": "SWOT", "n": B("تحليل SWOT", "SWOT analysis"), "col": "#3C9A5F", "d": B("البنود العليا تدخل دراسة SWOT فرصاً وتهديدات برقم الدراسة، ويبدأ مسح من بنود SWOT التي مصدرها PESTLE (قراءة فقط).", "Top items go into a SWOT study as opportunities and threats by its id, and a scan can start from SWOT items whose source is PESTLE (read-only)."), "tool": "./swot.html"},
        {"code": "ISO 10009", "n": B("دليل أدوات الجودة ISO 10009", "ISO 10009 quality tools guide"), "col": "#7B5BB8", "d": B("البند 5.2 PESTLE مع 5.1 SWOT و5.3 قوى بورتر، وأداة PESTLE هنا أداته المستقلة على المنصة.", "Clause 5.2 PESTLE with 5.1 SWOT and 5.3 Porter's forces; this PESTLE tool is its dedicated platform tool."), "tool": "./iso10009.html#explain-cl"},
        {"code": "ISO 31000", "n": B("استوديو المخاطر ISO 31000", "ISO 31000 Risk Studio"), "col": "#1B2A4A", "d": B("وجهة للبنود التي تصير مخاطر تُدار هناك.", "A destination for the items that become risks to manage there."), "tool": "./iso31000-risk-studio.html"},
        {"code": "Lessons", "n": B("سجل الدروس المستفادة", "Lessons learned register"), "col": "#B8901E", "d": B("درس من مشروع سابق قد يكشف عاملاً خارجياً لم يُرصد (مثل الطقس أو الأنظمة).", "A lesson from a past project can reveal an external factor that was missed (such as weather or regulation)."), "tool": "./lessons.html"},
        {"code": "FMEA", "n": B("تحليل أنماط الفشل وآثارها", "Failure mode and effects analysis"), "col": "#B42318", "d": B("عامل خارجي يمس عملية بعينها قد يحتاج دراسة FMEA لأنماط الفشل التي يسببها.", "An external factor that hits one process may need an FMEA study of the failure modes it causes."), "tool": "./fmea.html"},
        {"code": "RCA · A3 · Pareto · PDCA", "n": B("أدوات حل المشكلات", "Problem-solving tools"), "col": "#3C9A5F", "d": B("أثر عامل خارجي ظهر مشكلةً متكررة يحتاج تحليل سبب أو دورة تحسين.", "The effect of an external factor that shows up as a repeated problem needs a cause analysis or an improvement cycle."), "tool": "./rca.html"}
    ],
    "comp": [
        {"code": "ISO 9001:2026 §4.1 · A.4.1", "n": B("السياق وتغير المناخ", "Context and climate change"),
         "d": B("القضايا الخارجية والداخلية ذات الصلة بالغرض والتوجه الاستراتيجي، وقرار تغير المناخ، ومتابعتها ومراجعتها؛ والملاحظة 2 تذكر مستوياتها.", "The external and internal issues relevant to purpose and strategic direction, the climate change decision, monitoring and review; NOTE 2 lists their levels.")},
        {"code": "ISO 9001:2026 §6.1.1–6.1.3 · §9.3.2", "n": B("المخاطر والفرص ومراجعة الإدارة", "Risks, opportunities and management review"),
         "d": B("مراعاة القضايا عند تحديد المخاطر والفرص والتخطيط لها، ومراجعة تغيراتها في مراجعة الإدارة.", "Considering the issues when determining and planning for risks and opportunities, and reviewing their changes at management review.")},
        {"code": "ISO 9000:2026 §3.1.2 · §3.7.2 · §4.4.1", "n": B("السياق والخطر", "Context and risk"),
         "d": B("سياق المنشأة مزيج من القضايا الداخلية والخارجية، والخطر أثر عدم اليقين، والسياق الخارجي يشمل أثر تغير المناخ والتأثيرات الحكومية.", "The context of the organization is a combination of internal and external issues; risk is the effect of uncertainty; the external context includes the impact of climate change and governmental influences.")},
        {"code": "ISO 10009:2024 §5.2 · §7.2 · A.1 · C.1", "n": B("PESTLE وسجل المخاطر", "PESTLE and the risk register"),
         "d": B("PESTLE في البند 5.2 بجدول فوائده ونقاط انتباهه، ومدخلات سجل المخاطر من SWOT وPESTLE وFMEA في 7.2، ومكانه في الجدولين A.1 وC.1.", "PESTLE in 5.2 with its table of benefits and points to note, inputs to the risk register from SWOT, PESTLE and FMEA in 7.2, and its place in Tables A.1 and C.1.")},
        {"code": "PESTEL · scenarios · ISO 31000", "n": B("كتب PESTLE والسيناريوهات وإدارة المخاطر (غير متحقق منه)", "PESTLE textbooks, scenarios, risk management (not verified)"),
         "d": B("لا يوجد منها شيء مرفوع إلى المشروع؛ ISO 31000 مذكورة فقط في ملاحظة الملحق A.6.1 من ISO 9001:2026. فقواعد المراحل والتدقيق والبند العام في الأداة صياغتها هي.", "None is uploaded to the project; ISO 31000 is named only in a NOTE of Annex A.6.1 of ISO 9001:2026. So the stage, audit and generic-item rules in the tool are its own wording.")}
    ],
    "buy": [],
    "buyNote": B("للنص الرسمي للمواصفات استخدم النسخ المنشورة من المنظمة الدولية للتوحيد القياسي، وليس هذه المنصة.",
                 "For the official text of the standards, use the copies published by the International Organization for Standardization, not this platform.")
}

texts = {
    "stdT": B("دليل المنهجية", "Method guide"),
    "stdS": B("متى يكون PESTLE مفيداً: النطاق والقرار، والفريق برأي خارجي، والبند المحدد بمصدره وتاريخه، والأثر والأهمية، واليقين والأفق، وقرار تغير المناخ، والترتيب، والمخرج إلى SWOT والمخاطر، والمراجعة دورياً وبعد الأحداث الكبرى، والفجوات الشائعة وما يطلبه المدقق.",
              "When a PESTLE is useful: scope and decision, a team with outside input, specific items with a source and a date, effect and significance, certainty and horizon, the climate change decision, ranking, outcomes into SWOT and risks, the review on a date and after major events, the common gaps and what an auditor asks for."),
    "clT": B("دليل البنود", "Clause guide"),
    "clS": B("بنود ISO 9001:2026 التي يخدمها المسح بأرقامها: السياق 4.1 بملاحظاته والملحق A.4.1، والأطراف المعنية 4.2، والمخاطر والفرص 6.1.1 و6.1.2 و6.1.3، ومدخلات مراجعة الإدارة 9.3.2؛ وتعريفات ISO 9000:2026 ومفاهيمه 3.1.2 و3.7.2 و4.4.1؛ والبند 5.2 من ISO 10009:2024 مع 5.1 و5.3 و7.2. لكل بند ملخص تفسيري ومثال وما يطلبه المدقق. قواعد الأسلوب مرقّمة GD وهي إرشاد لا بنود. الأمثلة توضيحية وليست بيانات حقيقية.",
             "The ISO 9001:2026 clauses the scan serves, by number: context 4.1 with its notes and Annex A.4.1, interested parties 4.2, risks and opportunities 6.1.1, 6.1.2 and 6.1.3, and management review inputs 9.3.2; the ISO 9000:2026 terms and concepts 3.1.2, 3.7.2 and 4.4.1; and ISO 10009:2024 5.2 with 5.1, 5.3 and 7.2. Each has an interpretive summary, an example and what the auditor asks for. Technique rules are coded GD: guidance, not clauses. Examples are illustrative, not real data."),
    "note": B("ما يرد تحت «المتطلب» ملخص تفسيري بصياغة مستقلة، وليس النص الرسمي للمواصفة. وما تحت «كيف تطبقه» و«الفجوات» إرشاد تطبيقي. أرقام البنود وعناوينها متحقق منها من النصوص الرسمية المرفوعة.",
              "Text under “requirement” is an interpretive summary in independent wording, not the official text of the standard. “How to implement” and “common gaps” are practical guidance. Clause numbers and titles were checked against the uploaded official texts."),
    "chgT": B("ما الذي تغيّر", "What changed"),
    "chgS": B("", "")
}

phases = {
    "ctx": {"c": "#7A869E", "t": "#EEF1F6", "n": B("السياق والقرار", "Context and decision")},
    "evid": {"c": "#3563C9", "t": "#E8EEFA", "n": B("الواقعة والمصدر والترتيب", "Fact, source and ranking")},
    "clim": {"c": "#2F7D4B", "t": "#E5F4EA", "n": B("تغير المناخ", "Climate change")},
    "risk": {"c": "#B7790F", "t": "#FBF1D9", "n": B("المخاطر والفرص", "Risks and opportunities")},
    "rev": {"c": "#3C9A5F", "t": "#E5F4EA", "n": B("المراجعة والإبلاغ", "Review and communication")}
}

S = []

S.append({"id": "4.1", "grp": "core", "ph": "ctx", "col": "#7A869E", "tint": "#EEF1F6",
  "t": B("البند 4.1 فهم المنشأة وسياقها", "Clause 4.1 Understanding the organization and its context"),
  "s": B("السياق والمستوى والقرار", "Context, level and decision"), "sh": B("4.1 · السياق", "4.1 · Context"),
  "p": B("تطلب المواصفة تحديد القضايا الخارجية والداخلية ومتابعتها، وقراراً صريحاً في تغير المناخ. وPESTLE طريقة لتنظيم الجانب الخارجي، بشرط أن يخدم قراراً وأن يُراجع.",
         "The standard asks to determine and monitor the external and internal issues, with an explicit decision on climate change. A PESTLE is a way to organise the external side, provided it serves a decision and is reviewed."),
  "fl": L(("القضايا الخارجية", "External issues"), ("المستوى", "Level"), ("تغير المناخ", "Climate change"), ("المتابعة", "Monitoring"), ("القرار", "Decision")),
  "it": [
    IT("4.1", "OU1", B("القضايا الخارجية وقرار تغير المناخ", "External issues and the climate change decision"),
       R(IS, "تطلب ISO 9001:2026 في البند 4.1 تحديد القضايا الخارجية والداخلية ذات الصلة بغرض المنشأة وتوجهها الاستراتيجي، والتي تؤثر في قدرة نظام إدارة الجودة على تحقيق نتائجه المقصودة، وتحديد ما إذا كان تغير المناخ قضية ذات صلة، ومتابعة المعلومات عن هذه القضايا ومراجعتها. وتذكر الملاحظة 1 أن القضايا قد تكون عوامل أو ظروفاً إيجابية أو سلبية، والملاحظة 2 أن فهم السياق الخارجي يسهل بالنظر في القضايا القانونية والتقنية والتنافسية والسوقية والثقافية والسياسية والاجتماعية والاقتصادية والبيئية على المستوى الدولي أو الوطني أو الإقليمي أو المحلي، والملاحظة 3 أن فهم السياق الداخلي يسهل بالنظر في التوجه الاستراتيجي والقيم والثقافة والموارد والمعرفة والأداء. ولا تسمي المواصفة PESTLE ولا تطلبه.",
         "ISO 9001:2026 clause 4.1 asks to determine the external and internal issues relevant to the organization's purpose and strategic direction that affect the ability of the quality management system to achieve its intended results, to determine whether climate change is a relevant issue, and to monitor and review information about these issues. NOTE 1 says issues can include positive and negative factors or conditions; NOTE 2 that the external context can be understood by considering legal, technological, competitive, market, cultural, political, social, economic and environmental issues at the international, national, regional or local level; NOTE 3 that the internal context can be understood through strategic direction, values, culture, resources, knowledge and performance. The standard neither names nor requires PESTLE."),
       R(EX, "في المسح الوطني PE-EX-01 لشركة الواحة قُرر أن تغير المناخ قضية ذات صلة، لأن موجات الحر (38 يوماً فوق 45 °م في 2026) تمس صب الخرسانة وسلامة الفرق، وسُجل القرار وسببه في المسح المؤرخ.",
         "in Al-Waha's national scan PE-EX-01, climate change was decided relevant because heatwaves (38 days above 45 °C in 2026) affect concrete pours and the crews' safety; the decision and its reason were recorded in the dated scan."),
       L(("اجعل المسح المؤرخ سجل القضايا الخارجية", "Use the dated scan as the record of external issues"), ("اذكر المستوى: دولي أو وطني أو إقليمي أو محلي", "State the level: international, national, regional or local"), ("اكتب قرار تغير المناخ وسببه، ولو كان «ليس ذا صلة»", "Write the climate change decision and its reason, even when it is \"not relevant\""), ("حدد من يتابع كل قضية ومتى تُراجع", "Name who monitors each issue and when it is reviewed")),
       L(("مسح مؤرخ بأسماء المشاركين ومستواه", "A dated scan with the names of those who took part and its level"), ("قرار مكتوب بشأن تغير المناخ مع السبب", "A written decision on climate change with the reason")),
       L(("قائمة قضايا كُتبت مرة ولم تُراجع", "A list of issues written once and never reviewed"), ("لا قرار في تغير المناخ، أو قرار بلا سبب", "No climate change decision, or one with no reason"), ("القضايا التنافسية والسوقية غائبة لأن PESTLE لا يسميها", "Competitive and market issues missing because PESTLE does not name them")),
       B("الإدارة العليا", "Top management"), B("مسوح بقرار مناخ وسبب ÷ كل المسوح", "Scans with a climate decision and reason ÷ all scans")),
    IT("A.4.1", "RV1", B("القضايا تتغير مع الوقت", "Issues change over time"),
       R(IS, "يوضح الملحق A.4.1 من ISO 9001:2026 أن القضايا الخارجية والداخلية جزء من سياق المنشأة، وقد تنشأ من عوامل تؤثر في غرضها وتوجهها الاستراتيجي وظروف عملها، وأنها تتغير مع الوقت، وأن الوعي بتغيرها يدعم استمرار فعالية النظام.",
         "Annex A.4.1 of ISO 9001:2026 explains that external and internal issues are part of the organization's context, that they can arise from factors affecting its purpose, strategic direction or operating conditions, that they change over time, and that awareness of the changes supports the continuing effectiveness of the system."),
       R(EX, "لما تأكد موعد سريان تعديل كود العزل في 2027، وبلغت زيادة سعر الحديد 12%، روجع المسح PE-EX-01 في 8 أكتوبر 2026 وسُجل ما تغير.",
         "when the insulation code amendment's 2027 effective date was confirmed and the rebar price rise reached 12%, scan PE-EX-01 was reviewed on 8 October 2026 and what changed was recorded."),
       L(("اكتب في المسح الأحداث التي تستدعي مراجعته قبل موعده", "Write in the scan the events that call for a review before its date"),),
       L(("سجل المراجعات بتاريخها وسببها وما تغير", "The review log with dates, reasons and what changed"),),
       L(("مسح لا يتغير رغم صدور نظام جديد", "A scan that never changes although a new regulation came out"),),
       B("مالك القرار", "Decision owner"), B("—", "—")),
    IT("GD-1", "x:tools", B("النطاق والمستوى والقرار قبل البنود", "Scope, level and decision before the items"),
       R(GD, "اكتب قبل أي بند: ماذا تمسح (المنشأة، أو وحدة أعمال، أو سوق، أو مشروع، أو عطاء، أو موقع)، وعلى أي مستوى (دولي أو وطني أو إقليمي أو محلي، كما في الملاحظة 2 من 4.1)، وأي قرار أو خطة يخدم المسح، ومتى يُتخذ. فعامل مهم لاستراتيجية الشركة قد لا يعني شيئاً لموقع واحد. لذلك لا تكتمل مرحلة «حُدد النطاق» حتى يُكتب القرار والمستوى والتاريخ والميسّر.",
         "write before any item: what is being scanned (the organization, a business unit, a market, a project, a bid or a site), at what level (international, national, regional or local, as in NOTE 2 of 4.1), which decision or plan the scan serves, and when it is taken. A factor that matters for the company strategy may mean nothing for one site. So the \"scoped\" stage is not complete until the decision, the level, the date and the facilitator are written."),
       R(EX, "مسح البرج ج PE-EX-03 محلي، ويخدم قراراً واحداً: ما الظروف الخارجية التي تغطيها خطة الرفع وخطة السلامة لعام 2027.",
         "the Tower C scan PE-EX-03 is local and serves one decision: which external conditions the lift plan and the 2027 HSE plan must cover."),
       L(("اكتب القرار جملة واحدة بفعل وموعد", "Write the decision as one sentence with a verb and a date"), ("اختر المستوى الذي يناسب القرار", "Pick the level that fits the decision")),
       L(("القرار والمستوى المكتوبان في رأس المسح", "The decision and the level written at the head of the scan"),),
       L(("PESTLE «عام» للشركة بلا قرار", "A \"general\" company PESTLE with no decision"),),
       B("مالك القرار", "Decision owner"), B("مسوح لها قرار مكتوب ÷ كل المسوح", "Scans with a written decision ÷ all scans")),
    IT("3.1.2", "x:tools", B("سياق المنشأة في ISO 9000:2026", "Context of the organization in ISO 9000:2026"),
       R(IS, "يعرّف ISO 9000:2026 سياق المنشأة (3.1.2) بأنه مزيج من القضايا الداخلية والخارجية التي قد تؤثر في طريقة المنشأة في تحديد أهدافها وتحقيقها. ويذكر البند 4.4.1 أن السياق الداخلي قد يشمل الرسالة والرؤية والقيم والثقافة والتاريخ والمعرفة والأداء، وأن الخارجي يشمل التأثيرات القانونية والتقنية والتنافسية والسوقية والثقافية وأثر تغير المناخ والاجتماعية والاقتصادية والبيئية والحكومية، وأن فهم السياق يساعد على إدارة المخاطر والفرص وتلبية احتياجات الأطراف المعنية.",
         "ISO 9000:2026 defines the context of the organization (3.1.2) as the combination of internal and external issues that can have an effect on the organization's approach to specifying and achieving its objectives. Subclause 4.4.1 says the internal context can include mission, vision, values, culture and history, knowledge and performance, and the external one legal, technological, competitive, market, cultural, impact of climate change, social, economic, environmental and governmental influences, and that understanding the context helps manage risks and opportunities and meet the needs and expectations of interested parties."),
       R(EX, "«متطلبات العزل الحراري الجديدة» تأثير قانوني وحكومي، و«تمويل رأس المال العامل بنسبة 7.1%» تأثير اقتصادي، وكلاهما خارجي.",
         "\"the new thermal insulation requirements\" is a legal and governmental influence, \"working capital finance at 7.1%\" an economic one; both are external."),
       L(("استخدم قائمة 4.4.1 للتأكد أن لا تأثير غائباً، ومنها الحكومي وأثر تغير المناخ", "Use the 4.4.1 list to check that no influence is missing, including governmental ones and the impact of climate change"),),
       L(("—", "—"),),
       L(("خلط القضايا الداخلية بالخارجية في المسح", "Mixing internal issues into the external scan"),),
       B("الميسّر", "Facilitator"), B("—", "—"))
  ]})

S.append({"id": "ev", "grp": "core", "ph": "evid", "col": "#3563C9", "tint": "#E8EEFA",
  "t": B("الفريق والبند المحدد بمصدره وتاريخه", "The team, and specific items with a source and a date"),
  "s": B("قواعد الأسلوب", "Technique rules"), "sh": B("GD · البنود", "GD · Items"),
  "p": B("البند واقعة أو اتجاه خارجي يمكن التحقق منه، يكتبه فريق فيه رأي من الخارج. والعامل الذي لا شيء فيه ذو صلة يُكتب سببه.",
         "An item is an external fact or trend that can be checked, written by a team with outside input. A factor with nothing relevant gets the reason written."),
  "fl": L(("الفريق", "Team"), ("الواقعة", "Fact"), ("المصدر", "Source"), ("التاريخ", "Date"), ("البند العام", "Generic item")),
  "it": [
    IT("GD-2", "IN1", B("فريق برأي من الخارج", "A team with outside input"),
       R(GD, "يُعدّ المسح فريق من ثلاثة أدوار على الأقل (مثلاً الإدارة والمالية والعمليات)، وفيه رأي من خارجه: عميل أو مورد أو مستشار خارجي أو إدارة أخرى. فالمورد يعرف أسعار المواد قبل أن تصل إلى العروض، والعميل يعرف ما ستطلبه المنافسات القادمة. ولا تكتمل مرحلة «اكتمل الفريق» بلا رأي خارجي، وتنبّه الأداة على مسح الشخص الواحد.",
         "the scan is prepared by a team of at least three roles (for example management, finance and operations) with input from outside it: a customer, a supplier, an external advisor or another department. A supplier knows material prices before they reach the quotes; a client knows what the next tenders will ask for. The \"team complete\" stage needs outside input, and the tool flags a one-person scan."),
       R(EX, "في مسح عطاء المستشفى PE-EX-02 شارك مدير مبيعات مورد الحديد، فجاء بند «سعر حديد التسليح زاد 12% في ستة أشهر» بمصدره وتاريخه.",
         "in the hospital bid scan PE-EX-02, the steel supplier's sales manager took part, and the item \"rebar price up 12% in six months\" came with its source and date."),
       L(("ادعُ صاحب رأي من خارج الفريق لكل مسح", "Invite someone from outside the team to every scan"), ("وزّع العوامل الستة على أصحاب المصادر قبل الجلسة", "Hand the six factors to the source holders before the session")),
       L(("أسماء الفريق وأدوارهم ومن هو من الخارج", "The team's names and roles, and who is from outside"),),
       L(("مسح يكتبه مدير الجودة وحده", "A scan written by the quality manager alone"),),
       B("الميسّر", "Facilitator"), B("مسوح فيها رأي خارجي ÷ كل المسوح", "Scans with outside input ÷ all scans")),
    IT("GD-3", "IN2", B("واقعة بمصدر وتاريخ، لا رأي", "A fact with a source and a date, not an opinion"),
       R(GD, "البند واقعة أو اتجاه خارجي: نظام وتاريخ سريانه، أو رقم منشور، أو توقع باسم صاحبه. ولكل بند مصدره وتاريخ المصدر. والبند بلا مصدر أو تاريخ رأي حتى يُعرف مصدره. ولا تكتمل مرحلة «بنود بمصادر» حتى يكون لكل بند مصدر وتاريخ، وحتى يُدرس كل عامل من العوامل الستة: ببند، أو بسبب مكتوب لعدم وجود شيء ذي صلة.",
         "an item is an external fact or trend: a regulation and its effective date, a published figure, or a forecast with its author. Each item has its source and the source's date. An item with no source or date is an opinion until its source is known. The \"items with sources\" stage is not complete until every item has a source and a date and every one of the six factors has been looked at: with an item, or with a written reason that nothing in it is relevant."),
       R(EX, "«متطلبات العزل الحراري الجديدة، إلزامية لتراخيص البناء الجديدة من 2027 — إشعار تعديل كود البناء، 2026-06-30».",
         "\"the new thermal insulation requirements, mandatory for new building permits from 2027 — building code amendment notice, 2026-06-30\"."),
       L(("اكتب المصدر بالاسم: الجهة أو الوثيقة", "Name the source: the body or the document"), ("اكتب تاريخ المصدر لا تاريخ الجلسة", "Write the source's date, not the session's")),
       L(("مصدر وتاريخ لكل بند في المسح", "A source and a date for every item in the scan"),),
       L(("«يتوقع أن ترتفع الأسعار» بلا مصدر", "\"Prices are expected to rise\" with no source"),),
       B("أصحاب المصادر", "Source holders"), B("بنود بمصدر وتاريخ ÷ كل البنود", "Items with a source and a date ÷ all items")),
    IT("GD-4", "IN3", B("البند المحدد والبند العام", "Specific items and generic items"),
       R(GD, "البند العام لا يقود إلى شيء: «الاقتصاد غير مستقر»، «المنافسة شديدة»، «التقنية تتغير». تنبّه الأداة على البند الذي لا رقم فيه ولا تاريخ، ويحمل عبارة جاهزة أو أقل من أربع كلمات. ولا يصح أن يكون بند عام بين البنود العليا: لا تكتمل مرحلة «رُتّبت» حتى يُصاغ برقم أو نظام أو تاريخ. وهذه قاعدة الأداة، لا نص في مواصفة.",
         "a generic item leads nowhere: \"the economy is uncertain\", \"competition is high\", \"technology is changing\". The tool flags an item with no figure and no date that uses a stock phrase or has fewer than four words. A generic item cannot be among the top items: the \"ranked\" stage is not complete until it is written with a figure, a regulation or a date. This is the tool's rule, not text from a standard."),
       R(EX, "«تقلب الأسعار» صار «سعر حديد التسليح زاد 9% بين مارس وأغسطس 2026 (عروض ثلاثة موردين)».",
         "\"price volatility\" became \"rebar price up 9% from March to August 2026 (quotes from three suppliers)\"."),
       L(("اسأل عن كل بند: ما الرقم؟ ما النظام؟ ما التاريخ؟", "Ask of every item: what figure? what regulation? what date?"),),
       L(("بنود عليا بصياغة محددة", "Top items in specific words"),),
       L(("ستة عناوين عامة بلا أرقام", "Six generic headings with no figures"),),
       B("الميسّر", "Facilitator"), B("بنود عامة بين العليا (الهدف صفر)", "Generic items among the top (target zero)")),
    IT("GD-10", "x:tools", B("العوامل الستة، وتعديل أسمائها أو إضافة عامل", "The six factors, and adjusting or adding factors"),
       R(GD, "PESTLE ستة عوامل: سياسي واقتصادي واجتماعي وتقني وقانوني وبيئي. ويمكن تعديل اسم عامل أو إضافة عامل يخص سياقكم، كما تذكر ISO 10009:2024 في نقاط الانتباه للبند 5.2؛ وفي الأداة يُعدّل الاسم في رأس العامل، ويُضاف حتى ثلاثة عوامل (مثلاً التنافسي أو السوقي أو الثقافي، وهي في الملاحظة 2 من 4.1). والعامل الذي لا شيء فيه ذو صلة لا يُترك فارغاً: يُكتب سببه.",
         "PESTLE is six factors: political, economic, social, technological, legal and environmental. A factor's name can be adjusted, or a factor added for your context, as ISO 10009:2024 notes for 5.2; in the tool the name is edited at the head of the factor, and up to three factors can be added (for example competitive, market or cultural, which are in NOTE 2 of 4.1). A factor with nothing relevant is not left empty: its reason is written."),
       R(EX, "في مسح العطاء PE-EX-02 كُتب للعامل البيئي: «الموقع داخل مدينة طبية قائمة بتصريح بيئي ساري؛ لم يظهر شرط بيئي جديد».",
         "in bid scan PE-EX-02 the environmental factor reads: \"the site is inside an existing medical city with a valid environmental permit; no new environmental condition was found\"."),
       L(("مر على العوامل الستة واحداً واحداً", "Go through the six factors one by one"), ("أضف عاملاً إن كان في سياقكم ما لا تغطيه الستة", "Add a factor when your context has something the six do not cover")),
       L(("كل عامل ببند أو بسبب «لا شيء ذو صلة»", "Every factor with an item or a \"nothing relevant\" reason"),),
       L(("عامل فارغ بلا سبب", "An empty factor with no reason"),),
       B("الميسّر", "Facilitator"), B("—", "—"))
  ]})

S.append({"id": "rk", "grp": "core", "ph": "evid", "col": "#1B2A4A", "tint": "#E8EDF5",
  "t": B("الأثر والأهمية واليقين والأفق، ثم الترتيب", "Effect, significance, certainty and horizon, then ranking"),
  "s": B("قواعد الأسلوب", "Technique rules"), "sh": B("GD · الترتيب", "GD · Ranking"),
  "p": B("لكل بند أثره على المنشأة وتقييمه، ثم يُرتب بالأهمية × اليقين ويُحتفظ بالأعلى. والخطر في ISO 9000 أثر عدم اليقين.",
         "Each item names its effect on the organization and its rating, then the list is ranked by significance × certainty and the top kept. In ISO 9000, risk is the effect of uncertainty."),
  "fl": L(("الأثر", "Effect"), ("الأهمية", "Significance"), ("اليقين", "Certainty"), ("الأفق", "Horizon"), ("الترتيب", "Ranking")),
  "it": [
    IT("GD-5", "EV1", B("أثر البند على المنشأة، ومن يتأثر", "The item's effect on the organization, and who is affected"),
       R(GD, "لا يكفي أن يُكتب ما يحدث في الخارج؛ يُكتب ما يعنيه للمنشأة: فرصة، أو تهديد، أو كلاهما، ومن يتأثر به في المنشأة. فالبند الذي يحمل الأمرين (مثل نسبة أعلى للكوادر الوطنية: تكلفة اليوم وميزة في التأهيل غداً) يُكتب «فرصة وتهديد». وتذكر الملاحظة 1 من 4.1 أن القضايا قد تكون إيجابية أو سلبية.",
         "it is not enough to write what happens outside; write what it means for the organization: an opportunity, a threat or both, and who in the organization is affected. An item that carries both (such as a higher national staff share: a cost today, a pre-qualification advantage tomorrow) is written \"opportunity and threat\". NOTE 1 of 4.1 says issues can be positive or negative."),
       R(EX, "«تسليمات BIM مطلوبة في 6 من آخر 8 منافسات» فرصة لمن عنده منسقون، وتهديد لمن ليس عنده؛ يتأثر بها قسم الهندسة.",
         "\"BIM deliverables required in 6 of the last 8 tenders\" is an opportunity for those with coordinators and a threat for those without; engineering is affected."),
       L(("اسأل: ماذا يعني هذا لنا؟", "Ask: what does this mean for us?"), ("اكتب القسم أو الدور الذي يتأثر", "Write the department or role affected")),
       L(("أثر محدد لكل بند", "A named effect for every item"),),
       L(("بنود بلا أثر، كأنها أخبار", "Items with no effect, like news"),),
       B("مالكو المخرجات", "Outcome owners"), B("—", "—")),
    IT("GD-6", "EV2", B("الأهمية واليقين والأفق الزمني", "Significance, certainty and time horizon"),
       R(GD, "لكل بند ثلاثة تقديرات: الأهمية (1 إلى 5: كم يمس القرار)، واليقين (1 إلى 5: كم نحن متأكدون أنه سيحدث أو حدث)، والأفق الزمني (قصير حتى سنة، ومتوسط من سنة إلى ثلاث، وطويل أكثر من ثلاث). ويعرّف ISO 9000:2026 الخطر (3.7.2) بأنه أثر عدم اليقين، وأن عدم اليقين نقص في المعلومات عن حدث أو نتيجته أو احتماله؛ فاليقين هنا مقياس لقوة المصدر، لا رأي. ولا تكتمل مرحلة «رُتّبت» حتى يُقيّم كل بند.",
         "each item gets three ratings: significance (1 to 5: how much it touches the decision), certainty (1 to 5: how sure we are it will happen or has happened) and time horizon (short up to a year, medium one to three years, long over three). ISO 9000:2026 defines risk (3.7.2) as the effect of uncertainty, and uncertainty as a deficiency of information about an event, its consequence or likelihood; so certainty here measures the strength of the source, not an opinion. The \"ranked\" stage is not complete until every item is rated."),
       R(EX, "كود العزل منشور بتاريخ سريان: يقين 5. وعرض البنك ساري لثلاثة أشهر: يقين 5 للمدى القصير.",
         "the insulation code is published with an effective date: certainty 5. The bank offer is valid for three months: certainty 5 for the short term."),
       L(("قيّم اليقين من المصدر: نظام منشور 5، توقع جهة واحدة 2 أو 3", "Rate certainty from the source: a published regulation 5, one body's forecast 2 or 3"),),
       L(("تقييم كامل لكل بند", "A full rating for every item"),),
       L(("كل البنود بأهمية 5", "Every item rated 5"),),
       B("الميسّر", "Facilitator"), B("—", "—")),
    IT("GD-8", "EV3", B("رتّب بالأهمية × اليقين واحتفظ بالأعلى", "Rank by significance × certainty and keep the top"),
       R(GD, "القائمة الطويلة بلا ترتيب فجوة: لا تعرف الإدارة أين تبدأ. الدرجة = الأهمية × اليقين، والبنود العليا هي أعلى ست درجات من 6 فأكثر، وعند التساوي الأهمية ثم ترتيب الإدخال. وتعرض الأداة المصفوفة 5 × 5 للأهمية واليقين، والأفق الزمني، واللوحة بأعلى بنود كل عامل. والحد ست بنود ودرجة 6 من تصميم الأداة، وليس معياراً رسمياً.",
         "a long unranked list is a gap: management does not know where to start. Score = significance × certainty; the top items are the six highest scores of 6 or more, ties by significance, then by order of entry. The tool shows the 5 × 5 significance × certainty matrix, the time horizon and the board with each factor's top items. The limits of six items and a score of 6 are the tool's design, not an official benchmark."),
       R(EX, "في PE-EX-01 جاء كود العزل وموجات الحر بدرجة 25، ثم برنامج المشاريع وسعر الحديد بدرجة 16؛ وبقي بند BIM (12) خارج البنود العليا لأنه السابع.",
         "in PE-EX-01, the insulation code and the heatwaves scored 25, then the projects programme and the rebar price 16; the BIM item (12) stayed outside the top items as the seventh."),
       L(("اعرض المصفوفة على الفريق قبل اعتماد البنود العليا", "Show the matrix to the team before agreeing the top items"),),
       L(("ترتيب مؤرخ وبنود عليا محددة", "A dated ranking with named top items"),),
       L(("عشرون بنداً بالأهمية نفسها", "Twenty items with the same importance"),),
       B("مالك القرار", "Decision owner"), B("—", "—")),
    IT("3.7.2", "x:tools", B("الخطر في ISO 9000:2026", "Risk in ISO 9000:2026"),
       R(IS, "يعرّف ISO 9000:2026 الخطر (3.7.2) بأنه أثر عدم اليقين، والأثر انحراف عن المتوقع إيجاباً أو سلباً، وعدم اليقين حالة نقص، ولو جزئي، في المعلومات أو الفهم أو المعرفة عن حدث أو نتيجته أو احتماله. وتذكر الملاحظات أن الخطر يوصف غالباً بالأحداث المحتملة ونتائجها، ويُعبَّر عنه بمزيج من النتيجة واحتمال الحدوث.",
         "ISO 9000:2026 defines risk (3.7.2) as the effect of uncertainty; an effect is a deviation from the expected, positive or negative, and uncertainty is the state, even partial, of deficiency of information, understanding or knowledge of an event, its consequence or likelihood. The notes say risk is often characterized by potential events and consequences and expressed as a combination of consequences and the likelihood of occurrence."),
       R(EX, "بند «تمويل رأس المال العامل بنسبة 7.1%» يحمل نتيجة (تكلفة أعلى) واحتمالاً (يقين 5)، فدخل سجل المخاطر برقم RR-2026-08.",
         "the item \"working capital finance at 7.1%\" carries a consequence (higher cost) and a likelihood (certainty 5), so it went into the risk register as RR-2026-08."),
       L(("استخدم الأهمية واليقين لغة مشتركة مع سجل المخاطر", "Use significance and certainty as a shared language with the risk register"),),
       L(("—", "—"),),
       L(("خلط الأهمية باليقين في رقم واحد بلا تفسير", "Mixing significance and certainty into one unexplained number"),),
       B("مدير المخاطر", "Risk manager"), B("—", "—"))
  ]})

S.append({"id": "cl", "grp": "core", "ph": "clim", "col": "#2F7D4B", "tint": "#E5F4EA",
  "t": B("تغير المناخ: قرار صريح", "Climate change: an explicit decision"),
  "s": B("4.1 و4.2", "4.1 and 4.2"), "sh": B("GD · المناخ", "GD · Climate"),
  "p": B("تطلب ISO 9001:2026 تحديد ما إذا كان تغير المناخ قضية ذات صلة، وتذكر أن للأطراف المعنية متطلبات قد تتصل به.",
         "ISO 9001:2026 asks to determine whether climate change is a relevant issue, and notes that interested parties can have requirements related to it."),
  "fl": L(("القرار", "Decision"), ("السبب", "Reason"), ("الأطراف المعنية", "Interested parties")),
  "it": [
    IT("GD-7", "OU1", B("قرار تغير المناخ وسببه", "The climate change decision and its reason"),
       R(GD, "اسأل: هل يمس تغير المناخ قدرة النظام على تحقيق نتائجه، أو متطلبات العملاء والأطراف المعنية؟ ثم اكتب القرار وسببه: «ذو صلة لأن…» أو «ليس ذا صلة لأن…». ولا يُترك القرار ضمنياً في بند بيئي: لا تكتمل مرحلة «قُرر المناخ» حتى يُكتب القرار والسبب.",
         "ask: does climate change affect the system's ability to achieve its results, or the requirements of customers and other interested parties? Then write the decision and its reason: \"relevant because…\" or \"not relevant because…\". The decision is not left implicit in an environmental item: the \"climate decided\" stage needs the decision and the reason written."),
       R(EX, "في مسح العطاء PE-EX-02 قُرر «ليس ذا صلة لقرار العطاء نفسه» مع السبب: معظم الأعمال تشطيبات داخلية، وخطة الصب في الحر المقررة في PE-EX-01 تغطي أعمال الهيكل.",
         "in bid scan PE-EX-02 the decision was \"not relevant for the bid decision itself\", with the reason: most of the work is indoor fit-out, and the hot-weather pour plan decided in PE-EX-01 covers the structure works."),
       L(("اربط القرار بأثر محدد: طقس أو نظام أو طلب عميل", "Tie the decision to a specific effect: weather, a regulation or a client request"), ("أعد النظر في القرار عند كل مراجعة", "Revisit the decision at every review")),
       L(("قرار مكتوب بسببه في كل مسح", "A written decision with its reason in every scan"),),
       L(("قرار «ليس ذا صلة» بلا سبب", "A \"not relevant\" decision with no reason"),),
       B("الإدارة العليا", "Top management"), B("مسوح بقرار مناخ وسبب ÷ كل المسوح", "Scans with a climate decision and reason ÷ all scans")),
    IT("4.2", "x:tools", B("الأطراف المعنية ومتطلبات المناخ", "Interested parties and climate requirements"),
       R(IS, "تطلب ISO 9001:2026 في البند 4.2 تحديد الأطراف المعنية ذات الصلة بنظام إدارة الجودة، ومتطلباتها ذات الصلة، وأي هذه المتطلبات يُعالج من خلال النظام، ومتابعة المعلومات عنها ومراجعتها. وتذكر الملاحظة أن للأطراف المعنية متطلبات قد تتصل بتغير المناخ، ويضيف الملحق A.4.2 أن توقعات المناخ قد تؤثر في الامتثال التنظيمي ومتطلبات العملاء والتزامات المنشأة. والأطراف المعنية مصدر لبنود PESTLE، وتحليلها أداة مستقلة قادمة في صندوق الأدوات.",
         "ISO 9001:2026 clause 4.2 asks to determine the interested parties relevant to the quality management system, their relevant requirements, and which of these will be addressed through the system, and to monitor and review information about them. Its NOTE says relevant interested parties can have requirements related to climate change, and Annex A.4.2 adds that climate expectations can influence regulatory compliance, customer requirements and organizational commitments. Interested parties are a source of PESTLE items; their analysis is a dedicated tool coming next in the toolbox."),
       R(EX, "عطاءات العميل الحكومي لعام 2027 تطلب طريقة عمل للصب في الحر: متطلب طرف معني يتصل بالمناخ، فدخل سبب قرار المناخ في PE-EX-01.",
         "the public client's 2027 tenders ask for a hot-weather pour method statement: an interested party requirement related to climate, so it went into the reason for the climate decision in PE-EX-01."),
       L(("اسأل العميل والجهة المنظمة عما يطلبانه بشأن المناخ", "Ask the client and the regulator what they require on climate"),),
       L(("—", "—"),),
       L(("متطلبات المناخ عند العملاء غير مرصودة", "Customers' climate requirements not captured"),),
       B("تطوير الأعمال", "Business development"), B("—", "—"))
  ]})

S.append({"id": "6.1", "grp": "core", "ph": "risk", "col": "#B7790F", "tint": "#FBF1D9",
  "t": B("البند 6.1 الإجراءات للتعامل مع المخاطر والفرص", "Clause 6.1 Actions to address risks and opportunities"),
  "s": B("المخرجات: SWOT والمخاطر والفرص", "Outcomes: SWOT, risks and opportunities"), "sh": B("6.1 · المخاطر", "6.1 · Risks"),
  "p": B("البنود العليا تُراعى عند تحديد المخاطر والفرص. كل بند أعلى يذهب إلى SWOT أو سجل المخاطر أو خطة 6.1، أو يُستبعد بسبب.",
         "The top items are considered when determining risks and opportunities. Every top item goes into SWOT, the risk register or the 6.1 plan, or is set aside with a reason."),
  "fl": L(("6.1.1", "6.1.1"), ("6.1.2", "6.1.2"), ("6.1.3", "6.1.3"), ("SWOT", "SWOT"), ("الاستبعاد", "Set aside")),
  "it": [
    IT("6.1.1", "OU3", B("تحديد المخاطر والفرص من القضايا", "Determining risks and opportunities from the issues"),
       R(IS, "تطلب ISO 9001:2026 في البند 6.1.1 عند التخطيط لنظام إدارة الجودة مراعاة القضايا المذكورة في 4.1 والمتطلبات المذكورة في 4.2، وتحديد المخاطر والفرص التي يلزم التعامل معها لضمان تحقيق النتائج المقصودة، ومنع الآثار غير المرغوبة أو تقليلها، وتحقيق التحسين المستمر، وتعزيز الآثار المرغوبة. وتذكر ISO 10009:2024 في البند 7.2 أن مدخلات سجل المخاطر قد تأتي من SWOT وPESTLE وFMEA.",
         "ISO 9001:2026 clause 6.1.1 asks, when planning the quality management system, to consider the issues referred to in 4.1 and the requirements referred to in 4.2 and to determine the risks and opportunities that need to be addressed to give assurance that the system can achieve its intended results, prevent or reduce undesired effects, achieve continual improvement and enhance desired effects. ISO 10009:2024 says in 7.2 that inputs to the risk register may come from SWOT, PESTLE or FMEA."),
       R(EX, "بند «غرامات تأخير حتى 10% من قيمة العقد» في مسح العطاء دخل سجل المخاطر برقم RR-2026-12، وبند «تكلفة التمويل» دخل خطة 6.1 لمخاطر العطاءات.",
         "the item \"delay penalties up to 10% of the contract value\" in the bid scan went into the risk register as RR-2026-12, and the \"cost of finance\" item into the 6.1 plan for bid risks."),
       L(("لكل بند أعلى مخرج برقم في الوجهة", "Give every top item an outcome with a reference at its destination"), ("اكتب سبب الاستبعاد عند عدم نقل البند", "Write the reason when an item is not carried")),
       L(("مخرجات البنود العليا بمراجعها", "The outcomes of the top items with their references"),),
       L(("مسح ينتهي دون أن يدخل سجل المخاطر شيء منه", "A scan that ends with nothing in the risk register"),),
       B("مدير المخاطر", "Risk manager"), B("بنود عليا لها مخرج ÷ البنود العليا", "Top items with an outcome ÷ top items")),
    IT("6.1.2", "x:tools", B("الإجراءات للتعامل مع المخاطر", "Actions to address risks"),
       R(IS, "تطلب ISO 9001:2026 في البند 6.1.2 تحديد المخاطر التي قد يكون لها أثر غير مرغوب وتحليلها وتقييمها، والتخطيط للإجراءات، وكيفية دمجها وتنفيذها في عمليات النظام وتقييم فعاليتها، وأن تتناسب الإجراءات مع الأثر المحتمل. وتذكر الملاحظة 2 من الخيارات: تجنب الخطر، أو قبوله لاقتناص فرصة، أو إزالة مصدره، أو تغيير احتماله أو نتائجه، أو مشاركته، أو الإبقاء عليه بقرار مدروس.",
         "ISO 9001:2026 clause 6.1.2 asks to determine, analyse and evaluate the risks that can have an undesired effect, to plan actions, how to integrate and implement them in the system's processes and evaluate their effectiveness, and that actions are proportionate to the potential impact. NOTE 2 lists options: avoiding the risk, taking it to pursue an opportunity, eliminating its source, changing its likelihood or consequences, sharing it, or retaining it by informed decision."),
       R(EX, "خطر ارتفاع سعر الحديد عولج بتغيير النتيجة: بند تعديل الأسعار في نموذج العطاء BT-07، نُفذ في 12 أكتوبر 2026.",
         "the rebar price risk was treated by changing the consequence: a price adjustment clause in bid template BT-07, done on 12 October 2026."),
       L(("لكل خطر أعلى إجراء بمالك وموعد", "Give every top risk an action with an owner and a date"),),
       L(("الإجراء ودليل تنفيذه", "The action and the evidence it was done"),),
       L(("خطر في السجل بلا إجراء", "A risk in the register with no action"),),
       B("مالكو المخرجات", "Outcome owners"), B("—", "—")),
    IT("6.1.3", "x:tools", B("الإجراءات للتعامل مع الفرص", "Actions to address opportunities"),
       R(IS, "تطلب ISO 9001:2026 في البند 6.1.3 تحديد الفرص التي قد يكون لها أثر مرغوب وتحليلها وتقييمها والتخطيط لإجراءاتها ودمجها وتقييم فعاليتها، وأن تناسب سياق المنشأة. ويذكر الملحق A.6.1.3 أن الفرص قد تأتي من تغير ظروف السوق أو التقنيات الناشئة أو المتطلبات التنظيمية: وهذه بنود PESTLE نفسها.",
         "ISO 9001:2026 clause 6.1.3 asks to determine, analyse and evaluate the opportunities that can have a desired effect, to plan, integrate and evaluate actions on them, appropriate to the organization's context. Annex A.6.1.3 says opportunities can come from changes in market conditions, emerging technologies or regulatory requirements: the very items of a PESTLE."),
       R(EX, "عرض نظام مراقبة الحمل (تقني) فرصة دخلت دراسة SWOT رقم SW-EX-03.",
         "the load-monitoring retrofit offer (technological) is an opportunity carried into SWOT study SW-EX-03."),
       L(("لا تقصر المخرجات على التهديدات", "Do not limit outcomes to threats"),),
       L(("—", "—"),),
       L(("فرص في المسح لا يتابعها أحد", "Opportunities in the scan that nobody follows"),),
       B("تطوير الأعمال", "Business development"), B("—", "—")),
    IT("GD-9", "OU2", B("كل بند أعلى يذهب إلى مكان", "Every top item goes somewhere"),
       R(GD, "PESTLE يغذي SWOT وقوى بورتر ولا يحل محلهما. فالبند الأعلى يدخل دراسة SWOT فرصةً أو تهديداً برقم الدراسة، أو سجل المخاطر أو خطة 6.1 بمرجعه، أو استوديو المخاطر، أو يُستبعد بسبب مكتوب. ولا تكتمل مرحلة «مخرجات» حتى يكون لكل بند أعلى مخرج كامل، وحتى يكون لكل إجراء مالك وموعد. وتعاين الأداة دراسة SWOT المذكورة بقاعدة أداة SWOT نفسها، ولا تكتب فيها شيئاً.",
         "PESTLE feeds SWOT and Porter's forces rather than replacing them. A top item goes into a SWOT study as an opportunity or a threat by the study's id, into the risk register or the 6.1 plan by its reference, into the Risk Studio, or is set aside with a written reason. The \"outcomes\" stage is not complete until every top item has a complete outcome and every action has an owner and a date. The tool previews the SWOT study named with the SWOT tool's own rule, and writes nothing into it."),
       R(EX, "من المسح PE-EX-01 دخل كود العزل وبرنامج المشاريع فرصتين، وموجات الحر تهديداً، في دراسة SW-EX-01؛ واستُبعد بند الكوادر الوطنية بسبب: مغطى في خطة القوى العاملة HR-2027.",
         "from scan PE-EX-01, the insulation code and the projects programme went into study SW-EX-01 as opportunities and the heatwaves as a threat; the national staff item was set aside with the reason: covered by the workforce plan HR-2027."),
       L(("استخدم «أضف مخرجاً لكل بند أعلى بلا مخرج»", "Use \"add an outcome row for each top item with none\""), ("افتح دراسة SWOT من المخرج للتحقق", "Open the SWOT study from the outcome to check")),
       L(("مخرج لكل بند أعلى", "An outcome for every top item"),),
       L(("PESTLE لا يصل إلى SWOT ولا إلى السجل", "A PESTLE that reaches neither the SWOT nor the register"),),
       B("مالك القرار", "Decision owner"), B("بنود عليا لها مخرج ÷ البنود العليا", "Top items with an outcome ÷ top items"))
  ]})

S.append({"id": "9.3.2", "grp": "core", "ph": "rev", "col": "#3C9A5F", "tint": "#E5F4EA",
  "t": B("البند 9.3.2 مدخلات مراجعة الإدارة", "Clause 9.3.2 Management review inputs"),
  "s": B("المراجعة والإبلاغ", "Review and communication"), "sh": B("9.3.2 · المراجعة", "9.3.2 · Review"),
  "p": B("تغيرات القضايا الخارجية مدخل لمراجعة الإدارة. والمسح يُراجع في موعده وبعد الأحداث الكبرى، وتُبلَّغ نتيجته.",
         "Changes in external issues are an input to management review. The scan is reviewed on its date and after major events, and its result is communicated."),
  "fl": L(("ب) القضايا", "b) Issues"), ("المراجعة", "Review"), ("الأحداث", "Events"), ("الإبلاغ", "Communication")),
  "it": [
    IT("9.3.2", "RV2", B("تغيرات القضايا الخارجية في مراجعة الإدارة", "Changes in external issues at management review"),
       R(IS, "تطلب ISO 9001:2026 في البند 9.3.2 أن تشمل مراجعة الإدارة، ضمن مدخلاتها: حالة إجراءات المراجعات السابقة (أ)، وتغيرات القضايا الخارجية والداخلية ذات الصلة (ب)، وتغيرات احتياجات الأطراف المعنية وتوقعاتها (ج)، وفرص التحسين (هـ)، وفعالية الإجراءات المتخذة للتعامل مع المخاطر (ز) والفرص (ح).",
         "ISO 9001:2026 clause 9.3.2 asks management review to include, among its inputs: the status of actions from previous reviews (a), changes in relevant external and internal issues (b), changes in the needs and expectations of interested parties (c), opportunities for improvement (e), and the effectiveness of actions taken to address risks (g) and opportunities (h)."),
       R(EX, "في مراجعة الإدارة لنهاية 2026 يُعرض ما تغير في المسح PE-EX-01 (موعد سريان كود العزل، وزيادة الحديد 12%) وحالة إجراءاته.",
         "at the end-2026 management review, what changed in scan PE-EX-01 (the insulation code's effective date, the 12% rebar rise) and the status of its actions are presented."),
       L(("اعرض في المراجعة البنود التي تغيرت منذ المراجعة السابقة", "Present at the review the items that changed since the last one"), ("اربط كل تغير بقرار أو إجراء", "Tie each change to a decision or an action")),
       L(("محضر مراجعة الإدارة يذكر تغيرات القضايا الخارجية", "Management review minutes that name the changes in external issues"),),
       L(("بند «القضايا» في المراجعة يُكتب «لا تغيير» كل مرة", "The \"issues\" input written as \"no change\" every time"),),
       B("الإدارة العليا", "Top management"), B("مراجعات إدارة فيها تغيرات PESTLE", "Management reviews that cover PESTLE changes")),
    IT("GD-11", "RV1", B("المراجعة في الموعد وبعد الأحداث الكبرى", "Review on a date and after major events"),
       R(GD, "يحمل المسح موعد مراجعته القادمة، والأحداث التي تستدعي مراجعة قبله: نظام جديد، أو أزمة، أو تغير كبير في الأسعار، أو حادث. وتنبّه ISO 10009:2024 في نقاط الانتباه للبند 5.2 إلى تحديث معلومات PESTLE دورياً لتعكس أحداثاً مثل الجوائح والأوبئة والأوضاع العسكرية. ويكتب في المراجعة: التاريخ، والسبب، وما تغير، وما أضيف أو حذف. وموعد المراجعة «ملتزم به» ما دام قادماً، أو إذا جرت مراجعة قبله.",
         "the scan carries its next review date and the events that call for a review before it: a new regulation, a crisis, a large price change, an incident. ISO 10009:2024, in the points to note for 5.2, says to update the PESTLE information periodically to reflect incidents such as a pandemic, an epidemic or military situations. At the review, write the date, the reason, what changed, and what was added or removed. The review date is \"kept\" while it is ahead, or when a review was held before it."),
       R(EX, "روجع PE-EX-01 في 8 أكتوبر 2026 بسبب «حدث كبير»: تأكد موعد سريان كود العزل؛ وموعد المراجعة القادمة 1 مارس 2027.",
         "PE-EX-01 was reviewed on 8 October 2026 for a \"major event\": the insulation code's effective date was confirmed; the next review is on 1 March 2027."),
       L(("اكتب الأحداث التي تستدعي المراجعة في رأس المسح", "Write the events that call for a review at the head of the scan"),),
       L(("سجل المراجعات بأسبابها", "The review log with its reasons"),),
       L(("مسح عمره سنتان لم يُراجع", "A two-year-old scan never reviewed"),),
       B("مالك القرار", "Decision owner"), B("مسوح روجعت ÷ كل المسوح", "Scans reviewed ÷ all scans")),
    IT("GD-12", "RV3", B("إبلاغ النتيجة", "Communicating the result"),
       R(GD, "تُبلَّغ نتيجة المسح والقرارات التي خرجت منه إلى من يحتاجها: فريق العطاءات، ومديرو المواقع، ومالك سجل المخاطر. وتقرير الأداة (HTML وCSV) يضم لوحة كل مسح ومصفوفته وبنوده العليا ومخرجاتها وإجراءاته ومراجعته.",
         "the result of the scan and the decisions taken from it are communicated to those who need them: the bid team, site managers, the risk register owner. The tool's report (HTML and CSV) has each scan's board, matrix, top items, outcomes, actions and review."),
       R(EX, "أُرسل تقرير المسح PE-EX-01 إلى فريق العطاءات مع نموذج العطاء المعدل BT-07.",
         "the PE-EX-01 report was sent to the bid team with the revised bid template BT-07."),
       L(("أرسل التقرير مع كل مراجعة", "Send the report after every review"),),
       L(("التقرير وقائمة من استلمه", "The report and who received it"),),
       L(("نتيجة يعرفها الفريق فقط", "A result only the team knows"),),
       B("الميسّر", "Facilitator"), B("—", "—")),
    IT("GD-13", "x:tools", B("الفجوات الشائعة وما يطلبه المدقق", "Common gaps and what an auditor asks for"),
       R(GD, "الفجوات الشائعة: بنود عامة بلا أرقام، وبنود بلا مصدر أو تاريخ، وعامل فارغ بلا سبب، وغياب قرار تغير المناخ، وقائمة طويلة بلا ترتيب، وبنود عليا لا تصل إلى SWOT أو سجل المخاطر، ومسح لم يُراجع منذ صدور نظام جديد. ويطلب المدقق عادة: سجل القضايا الخارجية بتاريخه ومصادره، وقرار المناخ وسببه، وكيف دخلت القضايا في المخاطر والفرص (6.1.1)، ومتى روجعت آخر مرة، وكيف عُرضت تغيراتها في مراجعة الإدارة (9.3.2 ب)). وفحوص التدقيق العشرة في الأداة تغطي هذه الأسئلة.",
         "common gaps: generic items with no figures, items with no source or date, an empty factor with no reason, no climate change decision, a long unranked list, top items that reach neither the SWOT nor the risk register, and a scan not reviewed since a new regulation came out. An auditor usually asks for: the record of external issues with its date and sources, the climate decision and its reason, how the issues went into risks and opportunities (6.1.1), when they were last reviewed, and how their changes were presented at management review (9.3.2 b)). The tool's ten audit checks cover these questions."),
       R(EX, "تدقيق المثال: المسوح الثلاثة تجتاز الفحوص العشرة المنطبقة، ويبقى مسحان لم يُراجعا بعد ضمن البنود المفتوحة.",
         "the example's audit: the three scans pass the ten applicable checks, and two scans not reviewed yet stay among the open items."),
       L(("شغّل التدقيق الآلي قبل مراجعة الإدارة", "Run the automatic audit before management review"),),
       L(("نتيجة التدقيق الآلي", "The automatic audit result"),),
       L(("—", "—"),),
       B("المدقق الداخلي", "Internal auditor"), B("نجاح التدقيق", "Audit pass rate"))
  ]})

S.append({"id": "5.2", "grp": "core", "ph": "evid", "col": "#7B5BB8", "tint": "#EFEAF7",
  "t": B("ISO 10009:2024 البند 5.2 تحليل PESTLE، مع 5.1 و5.3", "ISO 10009:2024 5.2 PESTLE analysis, with 5.1 and 5.3"),
  "s": B("دليل أدوات الجودة", "Quality tools guidance"), "sh": B("10009 · 5.2", "10009 · 5.2"),
  "p": B("تراجع ISO 10009:2024 تحليل PESTLE في البند 5.2، وتذكر أنه يُستخدم كثيراً مع SWOT (5.1) وقوى بورتر (5.3)، وتضعه في التخطيط والتصرف لاستراتيجية الأعمال.",
         "ISO 10009:2024 reviews PESTLE in 5.2, says it is often used with SWOT (5.1) and Porter's forces (5.3), and places it in Plan and Act of business strategy."),
  "fl": L(("PESTLE", "PESTLE"), ("SWOT", "SWOT"), ("بورتر", "Porter"), ("سجل المخاطر", "Risk register"), ("الجدول C.1", "Table C.1")),
  "it": [
    IT("5.2", "x:tools", B("PESTLE في ISO 10009:2024", "PESTLE in ISO 10009:2024"),
       R(IS, "تراجع ISO 10009:2024 (إرشادات أدوات الجودة وتطبيقها) تحليل PESTLE في البند 5.2 أداةً تحدد بها المنشأة البيئة التي تعمل فيها وتتتبعها، وتذكر أنه يُستخدم كثيراً في التخطيط الاستراتيجي، أحياناً مع SWOT (5.1) والقوى الخمس أو الست لبورتر (5.3). ويُستخدم عند إعداد خطة الأعمال الاستراتيجية ومراجعتها وتحديثها، وتمهيداً لتحديد الاستراتيجيات والمخاطر والفرص، ولالتقاط القضايا الخارجية ذات الصلة التي تؤثر في الاستراتيجية. ويذكر جدولها 5.2 فائدتين (نهج منظم، ويلفت إلى عوامل قد تُغفل) ونقطتي انتباه: تعديل أسماء بعض العوامل أو إضافة عوامل تخص السياق، وتحديث المعلومات دورياً لتعكس أحداثاً مثل الجوائح والأوبئة والأوضاع العسكرية. ويضعه الجدول A.1 في مرحلتي التخطيط والتصرف لتخطيط الاستراتيجية والأعمال، ويصفه الجدول C.1: استراتيجية، منتج وخدمة، فريق، بيانات متوسطة، كفاءة ••، جهد متوسط.",
         "ISO 10009:2024 (guidance for quality tools and their application) reviews PESTLE analysis in 5.2 as a tool an organization uses to determine and track the environment in which it operates, often used in strategic planning, sometimes with SWOT (5.1) and Porter's five or six forces (5.3). It is used when developing, reviewing and updating the strategic business plan, as a precursor to determining strategies and risks and opportunities, and to capture relevant external issues that affect the strategy. Its Table 5.2 gives two benefits (a structured approach; it draws attention to factors that might not otherwise be considered) and two points to note: adjust the names of some factors or add others relevant to the context, and update the information periodically to reflect incidents such as a pandemic, an epidemic or military situations. Table A.1 places it in Plan and Act of strategy and business planning, and Table C.1 describes it: strategy, product and service, team, medium data, capability level ••, medium effort."),
       R(EX, "في دليل ISO 10009 على المنصة تفتح بطاقة الأداة 5.2 هذه الأداة لتطبيقها.",
         "in the ISO 10009 guide on the platform, the 5.2 tool card opens this tool to apply it."),
       L(("افتح بطاقة 5.2 في دليل ISO 10009", "Open card 5.2 in the ISO 10009 guide"), ("اتبع نقطتي الانتباه: عوامل تناسب السياق، وتحديث دوري وبعد الأحداث", "Follow the two points to note: factors that fit the context, and updates on a date and after events")),
       L(("—", "—"),),
       L(("PESTLE يُعدّ مرة في السنة ولا يُحدث بعد الأحداث الكبرى", "A PESTLE prepared once a year and never updated after major events"),),
       B("مدير الجودة", "Quality manager"), B("—", "—")),
    IT("5.1", "OU2", B("SWOT في ISO 10009:2024", "SWOT in ISO 10009:2024"),
       R(IS, "تراجع ISO 10009:2024 أسلوب SWOT في البند 5.1 أداةً لبناء استراتيجية بالنظر في نقاط القوة والضعف والفرص والتهديدات، ويذكر جدولها 5.1 أن المراجعة الخارجية تشمل الأطراف المعنية كالمنافسين والعملاء، وأن التحليل يستجيب لمؤثرات جديدة كالتقنية والتشريع وطلب السوق. وهذه المؤثرات تأتي من PESTLE: فالمسح يغذي فرص SWOT وتهديداته.",
         "ISO 10009:2024 reviews SWOT in 5.1 as a tool to build a strategy by looking at strengths, weaknesses, opportunities and threats; its Table 5.1 says the external review includes interested parties such as competitors and customers, and that the analysis responds to new influences such as technology, legislation and market demand. Those influences come from PESTLE: the scan feeds SWOT's opportunities and threats."),
       R(EX, "دراسة SW-EX-01 أخذت فرصتين وتهديداً من المسح PE-EX-01.",
         "study SW-EX-01 took two opportunities and a threat from scan PE-EX-01."),
       L(("سمِّ دراسة SWOT في مخرج كل بند أعلى ينتقل إليها", "Name the SWOT study in the outcome of every top item carried into it"),),
       L(("—", "—"),),
       L(("فرص SWOT وتهديداته بلا مصدر خارجي", "SWOT opportunities and threats with no external source"),),
       B("مالك القرار", "Decision owner"), B("—", "—")),
    IT("5.3", "x:tools", B("قوى بورتر في ISO 10009:2024", "Porter's forces in ISO 10009:2024"),
       R(IS, "تراجع ISO 10009:2024 القوى الخمس أو الست لبورتر في البند 5.3 أداةً لفهم القوى المتنافسة في القطاع: تهديد الداخلين الجدد، والتنافس بين القائمين، والقوة التفاوضية للمشترين، وتهديد البدائل، والقوة التفاوضية للموردين، ثم المكمِّلون قوةً سادسة، وتستخدمه لتحليل السياق دعماً لوضع الأهداف الاستراتيجية. فالقضايا التنافسية والسوقية في الملاحظة 2 من 4.1 تُقرأ ببورتر، والعامة بـ PESTLE.",
         "ISO 10009:2024 reviews Porter's five or six forces in 5.3 as a tool to understand the competing forces in a sector: the threat of new entrants, rivalry among existing firms, the bargaining power of buyers, the threat of substitutes, the bargaining power of suppliers, and complementors as a sixth force; it uses the model to analyse context in support of strategic objectives. So the competitive and market issues of NOTE 2 of 4.1 are read with Porter, the general ones with PESTLE."),
       R(EX, "«قوة المشتري مرتفعة» في دراسة العطاء جاءت من بورتر، و«تكلفة التمويل» من PESTLE.",
         "\"high buyer power\" in the bid study came from Porter, \"the cost of finance\" from PESTLE."),
       L(("أضف عاملاً «تنافسياً» في المسح عند الحاجة، أو اقرأ القطاع ببورتر", "Add a \"competitive\" factor to the scan when needed, or read the sector with Porter"),),
       L(("—", "—"),),
       L(("المنافسة في PESTLE بلا أرقام", "Competition in the PESTLE with no figures"),),
       B("مدير العطاءات", "Tender manager"), B("—", "—")),
    IT("7.2", "OU3", B("سجل المخاطر في ISO 10009:2024", "The risk register in ISO 10009:2024"),
       R(IS, "تراجع ISO 10009:2024 سجل المخاطر وتقييمها في البند 7.2: جدول لتحديد المخاطر وترتيبها وتسجيلها ومتابعة إجراءاتها، يصف لكل خطر طبيعته واحتماله وأثره ومالكه وإجراءات التخفيف والطوارئ والخطر المتبقي، وتذكر أن مدخلاته قد تأتي من مصادر مثل SWOT وPESTLE وFMEA.",
         "ISO 10009:2024 reviews the risk register and risk assessment in 7.2: a table to identify, prioritize, record and monitor actions on risks, describing for each risk its nature, probability, impact, owner, mitigation and contingency actions and the residual risk; it says its inputs may come from sources such as SWOT, PESTLE or FMEA."),
       R(EX, "ثلاثة بنود من المسوح الثلاثة دخلت السجل: RR-2026-08 وRR-2026-12 وRR-LFT-04.",
         "items from the three scans went into the register as RR-2026-08, RR-2026-12 and RR-LFT-04."),
       L(("اكتب رقم الخطر في مخرج البند", "Write the risk id in the item's outcome"),),
       L(("مراجع السجل في المخرجات", "Register references in the outcomes"),),
       L(("مخاطر خارجية في المسح لا أثر لها في السجل", "External risks in the scan with no trace in the register"),),
       B("مدير المخاطر", "Risk manager"), B("—", "—"))
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
    "edges": [["GD-1", "4.1"], ["4.1", "A.4.1"], ["3.1.2", "4.1"], ["4.1", "GD-7"], ["4.2", "GD-7"], ["GD-2", "GD-3"], ["GD-10", "GD-3"], ["5.2", "GD-10"],
              ["GD-3", "GD-4"], ["GD-4", "GD-8"], ["GD-5", "GD-6"], ["3.7.2", "GD-6"], ["GD-6", "GD-8"], ["GD-8", "GD-9"], ["GD-9", "5.1"], ["5.3", "5.1"],
              ["GD-9", "6.1.1"], ["7.2", "6.1.1"], ["6.1.1", "6.1.2"], ["6.1.1", "6.1.3"], ["6.1.2", "9.3.2"], ["6.1.3", "9.3.2"], ["A.4.1", "GD-11"],
              ["GD-11", "9.3.2"], ["9.3.2", "GD-12"], ["GD-12", "GD-13"]],
    "changes": {"note": B("", ""), "tlT": B("", ""), "tlS": B("", ""), "tlCols": 4, "tl": [], "cardsT": B("", ""), "cardsS": B("", ""), "cards": [],
                "corr": {"t": B("", ""), "s": B("", ""), "h": [], "rows": []}, "steps": {"t": B("", ""), "s": B("", ""), "l": B("", "")}},
    "ui": {
        "ar": {"roles": "من يعمل في مسح PESTLE", "wheelT": "عجلة البنود", "purpose": "الغرض من الأداة", "smap": "خطوات المسح من القرار إلى المراجعة",
               "smapSub": "كل خطوة في سطر. اضغط «اشرح» لفتح البند أو القاعدة التي تخدمها.", "rel": "علاقتها بأدوات المنصة", "comp": "المراجع المساندة",
               "assess": "قيّم هذا في التقييم الذاتي", "assessC": "قيّم هذا في التقييم الذاتي",
               "assessOff": "هذا البند خارج أسئلة التقييم الذاتي، ويُطبَّق مباشرة في مسوح PESTLE.", "offGo": "افتح مسوح PESTLE",
               "actCtx": "يفتح السؤال {s}", "explainA": "اشرح {c} في دليل البنود"},
        "en": {"roles": "Who works on a PESTLE scan", "wheelT": "Clause wheel", "purpose": "What the tool is for", "smap": "Steps of a scan, from the decision to the review",
               "smapSub": "One line per step. Select “Explain” to open the clause or rule it serves.", "rel": "How it connects to the platform's tools", "comp": "Supporting references",
               "assess": "Assess this in the self-assessment", "assessC": "Assess this in the self-assessment",
               "assessOff": "This clause is outside the self-assessment questions; it is applied directly in the PESTLE scans.", "offGo": "Open the PESTLE scans",
               "actCtx": "Opens question {s}", "explainA": "Explain {c} in the clause guide"}
    }
}

if __name__ == "__main__":
    js = ("/* PESTLE explanation data for the CIA Explain Kit v1.4. PESTLE is a technique, not a requirement of any standard.\n"
          "   ISO 9001:2026, ISO 9000:2026 (OCR) and ISO 10009:2024 clause numbers and titles checked on 2026-10-17 against the uploaded texts.\n"
          "   Requirements are interpretive summaries, not the official text; PESTLE textbooks, scenario planning, horizon scanning and\n"
          "   ISO 31000 are not uploaded (\"not verified\"). */\n"
          "const EXPLAIN_PESTLE=" + json.dumps(DATA, ensure_ascii=False, indent=1) + ";\n")
    sys.stdout.write(js)
