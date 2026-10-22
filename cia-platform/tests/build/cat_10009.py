"""Catalogue of the quality tools in ISO 10009:2024 (Quality management — Guidance for quality tools and their application),
one entry per tool reviewed in clauses 5 to 16, plus the "other relevant tools" each clause lists by name only.
Single source for modules/iso10009.html: the clause guide of the Explain Kit (data_10009.py) and the tool navigator, library and
storyboard of the host script (build_10009.py writes it as `const QT=...`).

Checked on 2026-10-16 against the uploaded file ISO-10009-2024-Quality-Management-Guidance-for-Quality-Tools.pdf (BS ISO 10009:2024,
first edition 2024-06):
  - subclause numbers and tool names: clauses 5 to 16 and the table of contents;
  - attributes (area of use, product or service, team or individual, minimum data quantity, level of capability, effort to apply):
    Annex C, Table C.1 (13.6 CTQ trees has only a level of capability in the table; TQM is listed there as "16.3" although the text
    numbers it 16.2 — the text number is used here and the difference is noted in the guide);
  - PDCA placement: Annex A, Tables A.1 (strategy and business planning), A.2 (process improvement) and A.3 (continual improvement).
    Where a table cell names a range ("13.1 to 14.6 Tools", "13.1 to 13.6", "13.1 to 13.7"), every reviewed tool in that range is
    placed in that phase and the entry is marked as coming from a range.
Descriptions, uses, benefits and points to note are interpretive summaries in independent wording, not the text of the standard.
The four aims ("char", "prob", "high", "eff") follow the scope of clause 1 a)–d); assigning a tool to them is the author's
classification (practical guidance), not the standard's. Platform links name the hub key, the tab and the level:
  own  — a dedicated tool on the platform        in   — part of a platform tool (a tab or a phase)
  here — worked in this guide (calculator or storyboard field)   rel — a related platform tool, not the same technique
  plan — on the toolbox build plan
Examples are illustrative (the fictitious Al-Waha Contracting of the toolbox examples), not real data."""


def B(ar, en):
    return {"ar": ar, "en": en}


def L(*pairs):
    return [B(a, e) for a, e in pairs]


def P(k, tab, lvl):
    return {"k": k, "tab": tab, "lvl": lvl}


AREAS = {
    "strategy": B("الاستراتيجية", "Strategy"), "process": B("العمليات", "Process"), "pcontrol": B("ضبط العمليات", "Process control"),
    "planning": B("التخطيط", "Planning"), "risk": B("تقييم المخاطر", "Risk assessment"), "change": B("إدارة التغيير", "Change management"),
    "objectives": B("الأهداف", "Objectives"), "objset": B("وضع الأهداف", "Objective setting"), "voc": B("صوت العميل", "Voice of customer"),
    "prior": B("تحديد الأولويات", "Prioritization"), "effect": B("الفعالية", "Effectiveness"), "product": B("الإنتاجية", "Productivity"),
    "resp": B("وضوح المسؤولية", "Clarity of responsibility"), "house": B("التنظيم والنظافة", "Housekeeping"), "effic": B("الكفاءة", "Efficiency"),
    "inventory": B("المخزون", "Inventory"), "lean": B("الإنتاج الرشيق", "Lean"), "defect": B("خفض العيوب", "Defect reduction"),
    "qc": B("ضبط الجودة", "Quality control"), "waste": B("خفض الهدر", "Waste reduction"), "vspc": B("الضبط الإحصائي المرئي", "Visual SPC"),
    "spc": B("الضبط الإحصائي للعمليات", "SPC"), "metro": B("المترولوجيا (القياس)", "Metrology"), "problem": B("حل المشكلات", "Problem solving"),
    "improve": B("التحسين", "Improvement"), "variation": B("خفض التباين", "Reducing variation"), "": B("غير محدد في الجدول", "Not given in the table")
}

CLAUSES = [
    ("5", B("الاستراتيجية", "Strategy"), "4.1 · 4.2 · 5.2 · 6.1"),
    ("6", B("نهج العمليات والتخطيط", "Process approach and planning"), "4.4 · 5.3 · 8.1"),
    ("7", B("المخاطر والفرص", "Risk and opportunity"), "6.1"),
    ("8", B("الأهداف وإدارتها", "Objectives and objective management"), "6.2 · 10.1"),
    ("9", B("التركيز على العميل وانطباعه", "Customer focus/perception"), "5.1.2 · 8.2 · 8.3 · 9.1.2"),
    ("10", B("أداء العمليات", "Process performance"), "7.1.3 · 7.1.4 · 8.5.1"),
    ("11", B("إدارة المخزون والحفظ", "Inventory management/preservation"), "8.5.4"),
    ("12", B("الاكتشاف والمنع", "Detection and prevention"), "8.5.1 g) · 8.6 · 8.7 · 9.1.3"),
    ("13", B("أدوات ضبط العمليات", "Process control tools"), "7.1.5 · 9.1.1 · 9.1.3"),
    ("14", B("الإجراء التصحيحي وتحليل المشكلات", "Corrective action/problem analysis"), "10.2"),
    ("15", B("التحسين", "Improvement"), "7.1.6 · 10.1"),
    ("16", B("عائلات أدوات الإدارة", "Families of management tools"), "10.1 · 0.3.2"),
]

# Annex A, Tables A.1–A.3: the subclauses each table places in Plan, Do, Check and Act (in the table's order).
# "R:13.2-14.6" style markers stand for the table's ranges; they are expanded below and marked as such.
ANNEX_A = {
    "s": {"P": ["5.1", "5.2", "5.3", "15.1", "15.2", "15.4", "15.6:BCG"],
          "D": ["5.4", "7.4", "8.3", "9.3", "9.5:mystery"],
          "C": ["7.1", "8.4:BSC", "8.3", "9.2", "10.1", "12.3", "R:13.1-14.6", "14.2", "14.7:solution", "15.4", "15.5"],
          "A": ["14.7:lewin", "6.5", "16.3:DWD", "7.2", "8.4:BSC", "9.5:PGCV", "12.2", "5.2", "5.3", "5.1", "15.1", "14.7:solution", "13.4"]},
    "p": {"P": ["15.4", "15.1", "15.6:BCG", "15.2", "9.2", "8.3", "10.7", "12.2", "14.6", "13.9:AHP"],
          "D": ["6.1", "6.2", "7.2", "9.1", "9.3", "14.5", "14.4", "10.3"],
          "C": ["10.1", "16.1", "12.3", "R:13.1-13.6", "14.2", "14.7:solution", "15.4", "15.5", "8.3", "10.3", "10.4", "10.9:RPA"],
          "A": ["7.2", "14.7:lewin", "10.8", "8.4:BSC", "8.3", "9.1", "9.5:PGCV", "12.2"]},
    "c": {"P": ["8.1", "16.2", "16.1", "15.4", "14.6", "14.2", "15.2", "13.9:AHP", "12.2"],
          "D": ["10.2", "6.1", "6.2", "7.3", "11.3:cycle", "11.3:turns", "12.3", "16.1", "14.5", "14.4", "10.3"],
          "C": ["16.1", "10.1", "12.3", "R:13.1-13.7", "14.2", "14.7:solution", "15.4", "15.5", "10.3", "11.1", "10.4"],
          "A": ["14.7:lewin", "10.8", "14.7:solution", "9.1", "13.4", "8.4:BSC", "8.3", "9.5:PGCV", "12.2"]},
}
CTX = {"s": B("الاستراتيجية وتخطيط الأعمال (الجدول A.1)", "Strategy and business planning (Table A.1)"),
       "p": B("تحسين العمليات (الجدول A.2)", "Process improvement (Table A.2)"),
       "c": B("التحسين المستمر (الجدول A.3)", "Continual improvement (Table A.3)")}

T = []


def tool(id_, c, n, area, ps, team, data, cap, eff, aims, d, use, ben, note, plat, ex, out, own):
    T.append({"id": id_, "c": c, "sec": c.split(".")[0], "n": n, "area": area, "ps": ps, "team": team, "data": data, "cap": cap,
              "eff": eff, "aims": aims, "d": d, "use": use, "ben": ben, "note": note, "plat": plat, "ex": ex, "out": out, "own": own})


# ---------------------------------------------------------------- 5 Strategy
tool("swot", "5.1", B("تحليل SWOT", "SWOT analysis"), "strategy", "both", "team", "small", 1, "easy", ["high"],
     B("أداة لبناء استراتيجية متينة بالنظر في نقاط القوة والضعف الداخلية والفرص والتهديدات الخارجية التي تواجه الاستراتيجية المقصودة.",
       "A tool to build a sound strategy by looking at the internal strengths and weaknesses and the external opportunities and threats the intended strategy faces."),
     L(("مراجعة أثر العوامل الداخلية والخارجية", "Reviewing the effect of internal and external factors"),
       ("ترتيب أولوية الإجراءات وتحديد الخيارات الاستراتيجية", "Setting action priorities and identifying strategic options"),
       ("كشف العوائق التي تحد من تحقيق الأهداف، وإمكانات التغيير وحدوده", "Finding the barriers to the objectives, and what change can and cannot do")),
     L(("يركز على الإجراءات الأنفع للأهداف الاستراتيجية والاستدامة", "Focuses on the actions most useful to strategic objectives and sustainability"),
       ("يستجيب للمؤثرات الجديدة كالتقنية والتشريع وطلب السوق", "Responds to new influences such as technology, legislation and market demand")),
     L(("يُراجع بتكرار يكفي لالتقاط التغيرات والتفاعل معها", "Review it often enough to catch changes and react to them"),
       ("تنوع وجهات النظر شرط: يجريه فريق القيادة بمدخلات خارجية، لا شخص واحد", "Diversity of views is a condition: the leadership team runs it with outside input, not one person"),
       ("انتبه لحدود جودة البيانات حتى لا تُحرَّف الصورة", "Be aware of the limits of the data so the picture is not distorted"),
       ("مخرجاته أساس لإجراءات لاحقة، لا وثيقة تُحفظ", "Its output is the basis for later actions, not a document to file")),
     [P("swot", "tools", "own"), P("str", "swot", "in"), P("str", "tows", "in")],
     B("فريق إدارة الواحة للمقاولات أعد تحليل SWOT لخطة 2027، فظهرت «خبرة الخرسانة في الحر» قوة، و«تأخر اعتماد المخططات» ضعفاً.",
       "Al-Waha Contracting's management team ran a SWOT for the 2027 plan: \"concrete know-how in hot weather\" came out as a strength and \"slow drawing approvals\" as a weakness."),
     B("مصفوفة SWOT مؤرخة بأسماء المشاركين، وقائمة إجراءات لكل بند مهم", "A dated SWOT grid with the names of those who took part, and an action list for each important item"), "")
tool("pestle", "5.2", B("تحليل PESTLE", "PESTLE analysis"), "strategy", "both", "team", "medium", 2, "medium", ["high"],
     B("أداة لتحديد البيئة الخارجية التي تعمل فيها المنشأة وتتبعها: العوامل السياسية والاقتصادية والاجتماعية والتقنية والقانونية والبيئية. وتُستخدم كثيراً مع SWOT ونموذج القوى الخمس أو الست.",
       "A tool to determine and track the external environment the organization works in: political, economic, social, technological, legal and environmental factors. It is often used with SWOT and the five or six forces."),
     L(("عند إعداد الخطة الاستراتيجية ومراجعتها وتحديثها", "When the strategic business plan is developed, reviewed and updated"),
       ("تمهيداً لتحديد الاستراتيجيات والمخاطر والفرص", "As a step before determining strategies, risks and opportunities"),
       ("لالتقاط القضايا الخارجية التي تؤثر في الاستراتيجية", "To capture the external issues that affect the strategy")),
     L(("نهج منظم", "A structured approach"), ("يلفت النظر إلى عوامل قد تُغفل", "Draws attention to factors that might otherwise be missed")),
     L(("يمكن تعديل أسماء العوامل أو إضافة عوامل تخص سياق المنشأة", "Factor names can be adjusted, or factors added, to fit the organization's context"),
       ("يُحدَّث دورياً، وبعد الأحداث الكبرى كالأوبئة أو الأوضاع الأمنية", "Update it periodically and after major events such as an epidemic or a security situation")),
     [P("pestle", "tools", "own"), P("str", "pestle", "in")],
     B("في PESTLE لعام 2027 سُجلت لوائح العزل الحراري الجديدة عاملاً قانونياً، وموجات الحر الأطول عاملاً بيئياً يمس صب الخرسانة.",
       "The 2027 PESTLE recorded the new thermal insulation code as a legal factor and longer heatwaves as an environmental factor affecting concrete pours."),
     B("جدول العوامل الستة بأهميتها ومصدر كل معلومة وتاريخ آخر تحديث", "The six-factor table with significance, the source of each item and the date of the last update"), "")
tool("porter", "5.3", B("القوى الخمس أو الست لبورتر", "Porter's five or six forces"), "strategy", "both", "team", "small", 3, "medium", ["high"],
     B("أداة تحليل استراتيجي لفهم القوى المتنافسة في القطاع: تهديد الداخلين الجدد، والتنافس بين القائمين، والقوة التفاوضية للمشترين وللموردين، وتهديد البدائل، ثم القوة السادسة: المكمِّلون.",
       "A strategic analysis tool to understand the competing forces in a sector: the threat of new entrants, rivalry among existing firms, the bargaining power of buyers and of suppliers, the threat of substitutes, and a sixth force: complementors."),
     L(("تحليل السياق لدعم وضع الأهداف الاستراتيجية", "Analysing context to support setting strategic objectives"),
       ("تقييم جاذبية القطاع", "Assessing how attractive the sector is")),
     L(("القوى الست تعطي اعتبارات للمخاطر والفرص معاً", "The six forces give both risk and opportunity considerations"), ("تقدم نظرة جديدة للاستراتيجية", "Often gives a fresh view of strategy")),
     L(("تُبنى الإجراءات على بيانات من مصادر موثوقة", "Base the actions on data from reliable sources"),
       ("تحتاج موارد وتقنيات ومعرفة لدعم التحليل", "It needs resources, technology and knowledge to support the analysis"),
       ("قد تحد بعض القوى من فرص التصرف", "Some forces can limit the room for action")),
     [],
     B("حللت الواحة القوى في سوق المقاولات الحكومية فوجدت أن قوة المشتري (الجهات المالكة) هي الأعلى، فوجهت عروضها نحو الجودة والالتزام بالمواعيد.",
       "Al-Waha analysed the forces in the public contracting market and found buyer power (the owners) the strongest, so it built its bids on quality and on-time delivery."),
     B("ورقة القوى بتقدير كل قوة ومصدره، وأثرها على الأهداف", "A forces sheet with the rating and source of each force and its effect on objectives"), "")
tool("vision", "5.4", B("بيانا الرؤية والرسالة", "Vision and mission statements"), "strategy", "both", "both", "small", 2, "medium", ["eff"],
     B("الرؤية ما تطمح المنشأة أن تكونه كما تعبر عنه الإدارة العليا، والرسالة سبب وجودها وما تفعله وما تُعرف به (وتسمى أحياناً الغاية). ويُبنى بيان الرؤية على اتفاق الإدارة العليا على الهدف الاستراتيجي لإرضاء العملاء والأطراف المعنية، والسوق التي تريدها، والأفق المستقبلي.",
       "The vision is what the organization aspires to become, as top management puts it; the mission is why it exists, what it does and what it is known for (sometimes called its purpose). A vision statement rests on top management agreeing the strategic goal of satisfying customers and interested parties, the market it wants, and the future horizon."),
     L(("التواصل على أعلى مستوى مع العملاء والموظفين والأطراف المعنية", "Communicating at the highest level with customers, employees and interested parties"),
       ("أساس لاشتقاق الغايات والأهداف", "A basis to derive goals and objectives"),
       ("اختبار أي نشاط: هل يخدم غاية المنشأة؟", "Testing any activity: does it serve the organization's purpose?")),
     L(("أهداف مشتركة توجه كل التخطيط", "Common goals that guide all planning"), ("تؤطر القيم والمبادئ والسلوكيات", "Frames values, principles and behaviours"),
       ("تختصر استراتيجية معقدة في «خطة على صفحة»", "Distils a complex strategy into a plan on a page")),
     L(("يكون البيان بسيطاً سهل التواصل", "Keep the statement simple and easy to communicate"),),
     [P("str", "profile", "in")],
     B("رسالة الواحة: «نبني منشآت آمنة تُسلَّم في موعدها وبجودة يثق بها المالك»، وتُعرض في بداية كل اجتماع مراجعة.",
       "Al-Waha's mission: \"we build safe facilities, delivered on time, at a quality the owner trusts\", shown at the start of every review meeting."),
     B("بيانا الرؤية والرسالة المعتمدان من الإدارة العليا، ودليل تواصلهما", "The vision and mission approved by top management, and evidence they were communicated"), "")
# ---------------------------------------------------------------- 6 Process approach and planning
tool("sipoc", "6.1", B("SIPOC / COPIS", "SIPOC/COPIS"), "process", "both", "both", "small", 1, "easy", ["char"],
     B("أداة لرسم العملية على مستوى عالٍ: الموردون والمدخلات والعملية والمخرجات والعملاء. وCOPIS هو الاتجاه المعاكس ويفيد في تحديد العمليات المواجهة للعميل. ويبيّن حدود العملية والعمليات المرتبطة بها وضوابطها وكيف تُدار فعاليتها.",
       "A tool to map a process at high level: suppliers, inputs, process, outputs and customers. COPIS is the reverse and helps identify customer-facing processes. It shows the bounds of the process, the linked processes, the related controls and how effectiveness is managed."),
     L(("رسم عملية قائمة أو جديدة", "Mapping an existing or a new process"), ("وصف العملية باختصار في صفحة", "Giving basic process information briefly, on one page"),
       ("تحديد نطاق نشاط أو مشروع تحسين", "Defining the scope of an improvement activity or project")),
     L(("بسيطة وسريعة النتائج", "Simple and quick to give results"), ("نظرة كاملة على العملية من بدايتها إلى نهايتها في صفحة", "A whole view of the process, start to end, on one page")),
     L(("لا تدخل في التفاصيل: أربع إلى خمس خطوات رئيسية", "Avoid detail: four to five key steps"),
       ("يعدّها فريق ليتفق على بداية العملية ونهايتها", "A team prepares it, so the start and end of the process are agreed"),
       ("الموردون والعملاء قد يكونون داخليين، ويمكن أن تكون هرمية", "Suppliers and customers can be internal, and SIPOC can be hierarchical")),
     [P("oec", "sipoc", "in"), P("dmaic", "tools", "in")],
     B("في مشروع DMAIC للخرسانة رُسمت SIPOC لاستلام الخرسانة الجاهزة: المحطة ← الطلب والنقل والفحص عند البوابة والصب ← فريق الموقع والاستشاري.",
       "In the concrete DMAIC project a SIPOC was drawn for ready-mix receiving: the plant → ordering, transport, gate check and pour → the site team and the consultant."),
     B("SIPOC معتمدة من مالك العملية بحدود البداية والنهاية", "A SIPOC agreed by the process owner, with the start and end points"), "")
tool("turtle", "6.2", B("مخطط السلحفاة", "Turtle diagram"), "process", "both", "both", "small", 1, "easy", ["char"],
     B("أداة لتصوير مكونات العملية في شكل سلحفاة: العملية في الجسم، والمدخلات والمخرجات في الرأس والذيل، والموارد والأفراد والطرق والمقاييس في الأرجل؛ فتُفحص العملية عن قرب لفهمها وتنفيذها وتحسينها.",
       "A tool that pictures the components of a process as a turtle: the process as the body, inputs and outputs as head and tail, and resources, people, methods and measures as the legs, so the process can be examined closely to understand, run and improve it."),
     L(("وصف عناصر العملية للتواصل والفهم", "Describing the basic elements of a process for communication and understanding"),
       ("تمهيد لإجراءات ومخططات تدفق أكثر تفصيلاً", "A start for more detailed procedures and flow charts"),
       ("مساعدة المدققين على فهم العملية وتقييمها", "Helping auditors understand and assess processes")),
     L(("طريقة مرئية موحدة سهلة الفهم", "A visual, standard method that is easy to understand"), ("أهم عناصر العملية في صفحة واحدة", "The key elements of a process on one page"),
       ("يربط أداء العملية بالاستراتيجية والأهداف", "Ties process performance to strategy and objectives")),
     L(("لا يوثق كل ما يلزم لوصف العملية كاملاً، لكنه بداية جيدة", "It does not record everything needed to describe a process fully, but it is a good start"),),
     [P("oec", "proc", "rel"), P("aud", "clist", "rel")],
     B("أعد مدير الجودة في الواحة مخطط سلحفاة لعملية «استلام المواد» قبل التدقيق الداخلي، فظهر غياب مؤشر لزمن الفحص.",
       "Al-Waha's quality manager drew a turtle diagram of \"materials receiving\" before the internal audit, which showed there was no measure for inspection time."),
     B("مخطط سلحفاة لكل عملية رئيسية، مرتبط بمؤشراتها ومالكها", "A turtle diagram for each key process, tied to its measures and owner"), "")
tool("cplan", "6.3", B("خطة الضبط", "Control plan"), "pcontrol", "both", "ind", "medium", 3, "medium", ["eff", "char"],
     B("نهج منظم لتحديد الضوابط على العملية: كل مرحلة بالتسلسل (غالباً بمساعدة مخطط التدفق)، والخصائص المضبوطة بما فيها الخاصة (وكثيراً ما تكون FMEA العملية مدخلاً)، وطريقة القياس وتكراره وتسجيله، وخطة رد الفعل إذا خرجت الخاصية عن المتطلب.",
       "A structured way to set the controls on a process: each stage in sequence (often with a flow chart), the characteristics controlled including special ones (often with a process FMEA as input), the method, frequency and recording of measurement, and the reaction plan if a characteristic does not conform."),
     L(("في التصنيع والخدمات", "In manufacturing and in services"),
       ("حيث لا يمكن التحقق من المخرج بالفحص ولا يظهر العيب إلا لاحقاً", "Where the output cannot be verified by inspection and a defect shows only later"),
       ("عند اعتماد العملية قبل الإطلاق وأثناء الإنتاج", "For process approval before launch and in production"),
       ("حيث يلزم رصد العملية لتحديد قدرتها أو تقييم المطابقة", "Where monitoring is needed to find process capability or assess conformity")),
     L(("نهج واضح منظم لضبط المنتج والعملية", "A clear, structured approach to product and process control"), ("يساعد التدقيق الفعّال", "Helps effective auditing"),
       ("يدعم المطابقة حيث لا يكفي الفحص", "Drives conformity where inspection cannot")),
     L(("تُعرَّف خصائص المنتج والعملية بلا لبس", "Define product and process characteristics without ambiguity"),
       ("لا تحل محل تعليمات العمل الأكثر تفصيلاً", "It does not replace the more detailed work instructions"),
       ("مخططات التدفق وFMEA وخطط الضبط تُراجع وتُحدَّث عند حدوث عدم مطابقة", "Process flows, FMEA and control plans are reviewed and updated when nonconformities occur")),
     [P("dmaic", "tools", "in")],
     B("خطة الضبط في مشروع الخرسانة: حرارة كل شحنة عند البوابة، كل شحنة، بواسطة فني الجودة، ورد الفعل: إيقاف الصب وإبلاغ المحطة فوق 32 °م.",
       "The control plan of the concrete project: temperature of every load at the gate, every load, by the QC technician; reaction: stop the pour and call the plant above 32 °C."),
     B("خطة ضبط بالخاصية والطريقة والتكرار والمسؤول ورد الفعل، ومراجعتها بعد كل عدم مطابقة", "A control plan with characteristic, method, frequency, owner and reaction, reviewed after each nonconformity"), "dmaic")
tool("flow", "6.4", B("مخطط التدفق / مخطط الممرات / المخطط متعدد الوظائف", "Flow diagram/swim lane diagram/cross-functional flow chart"), "planning", "both", "both", "small", 1, "easy", ["char"],
     B("طريقة مرئية سريعة لبيان تسلسل الأنشطة أو المهام أو العمليات بالرموز والنصوص وخطوط الربط. ويضيف مخطط الممرات مسؤولية كل نشاط بفصل ما يقوم به كل قسم أو شخص في ممر.",
       "A quick, visual way to show how activities, tasks or processes follow each other, with symbols, text and connecting lines. A swim lane diagram adds who is responsible by placing each department's or person's activities in a lane."),
     L(("بداية لتوثيق الأنشطة", "A starting point for documenting activities"), ("توضيح كيف تُنفذ الأنشطة", "Showing how activities are carried out"),
       ("كشف مواطن عدم الكفاءة تمهيداً للتحسين", "Finding inefficiencies so they can be analysed and improved")),
     L(("مرئي وسهل لغير المختصين", "Visual and easy for non-experts"), ("سريع الإعداد غالباً", "Usually quick to prepare"),
       ("يساعد على أتمتة العمليات ورقمنتها", "Helps to automate and digitalize processes")),
     L(("اتجاه التدفق غالباً من اليسار إلى اليمين ومن الأعلى إلى الأسفل (ويُعكس في الواجهات العربية)", "Flow mainly runs left to right and top to bottom (mirrored in Arabic layouts)"),
       ("استخدم الأسهم كلما زادت الوضوح، وتوقع صعوبات القارئ", "Use arrows wherever they add clarity, and anticipate the reader's difficulties"),
       ("لا يُخلط بالمخطط الكتلي ولا بخرائط العمليات ذات الرموز الأخرى", "Not to be confused with block diagrams or with other process-charting symbol sets")),
     [P("oec", "pmap", "rel")],
     B("مخطط ممرات لاعتماد المخططات الفنية أظهر أن المخطط ينتقل بين المهندس والاستشاري ثلاث مرات قبل الاعتماد.",
       "A swim lane diagram of drawing approval showed each drawing passing between the engineer and the consultant three times before approval."),
     B("مخطط تدفق معتمد لكل عملية موثقة، بممرات المسؤولية", "An approved flow chart for each documented process, with responsibility lanes"), "")
tool("raci", "6.5", B("مصفوفة الصلاحيات / RACI / RASCI", "Authority matrix/RACI/RASCI"), "strategy", "both", "both", "small", 1, "easy", ["eff"],
     B("مصفوفة بالأشخاص أو الوظائف على محور والمسؤوليات على الآخر، تبين مستوى المشاركة أو صلاحية القرار. وفي الامتثال المالي تسمى مصفوفة تفويض الصلاحيات. والأدوار: المنفذ، والمساءَل (عضو الإدارة المكلف بالعملية)، والمستشار، والداعم، والمُبلَّغ.",
       "A matrix with persons or functions on one axis and responsibilities on the other, showing the level of engagement or decision authority. In financial compliance it is called a delegated authority matrix. The roles: responsible, accountable (the manager assigned to the process), consulted, supporting and informed."),
     L(("بيان المسؤوليات بوضوح", "Showing responsibilities clearly"), ("تحديد التغييرات في الأدوار وإبلاغها", "Identifying and communicating changes in roles"),
       ("رسم الوضع الحالي والمستقبلي للصلاحيات", "Mapping the current and future state of authorities")),
     L(("يزيل الغموض في التعاون والقرار", "Removes ambiguity in collaboration and decisions"), ("يبين العلاقات بين الأشخاص عبر العمليات", "Shows relationships between people across processes"),
       ("يدعم بناء الفريق", "Supports team-building")),
     L(("تُربط بالأوصاف الوظيفية وتُحدَّث عند الحاجة", "Link it to job descriptions and update it as needed"),),
     [P("oec", "raci", "in")],
     B("في مصفوفة RACI لاستلام الخرسانة: فني الجودة منفذ للفحص، ومدير المشروع مساءَل، والمحطة مستشارة، والاستشاري مُبلَّغ.",
       "In the concrete receiving RACI: the QC technician is responsible for the check, the project manager accountable, the plant consulted, the consultant informed."),
     B("مصفوفة RACI بمساءَل واحد لكل نشاط، مرتبطة بالأوصاف الوظيفية", "A RACI with one accountable per activity, linked to job descriptions"), "")
# ---------------------------------------------------------------- 7 Risk and opportunity
tool("swift", "7.1", B("أسلوب «ماذا لو» المنظم (SWIFT)", "SWIFT (Structured What If Technique)"), "risk", "both", "both", "medium", 2, "medium", ["high", "prob"],
     B("أسلوب مرن عالي المستوى لتحديد المخاطر، يُستخدم وحده أو مرحلة أولى قبل طرق تفصيلية مثل FMEA. يمر الفريق على كل خطوة من العملية بأسئلة «ماذا لو؟» موجهة تستحضر أنواع المخاطر المختلفة. ويذكر المعيار HAZOP مثالاً عليه.",
       "A flexible, high-level way to identify risks, used alone or as a first stage before detailed methods such as FMEA. The team goes through each step of the process with guided \"what if?\" prompts that bring up different types of hazard. The standard gives HAZOP as an example."),
     L(("تقييم مخاطر عملية أو نظام خطوة خطوة", "Risk assessment of a process or system step by step"), ("مرحلة أولى قبل FMEA توفر الجهد", "A first stage that makes FMEA more efficient")),
     L(("منظم: يتغلب على الرقابة الذاتية في العصف غير المنظم", "Structured: it overcomes the self-censorship of unstructured brainstorming"),
       ("بسيط: لا يدخل في تفاصيل FMEA", "Simple: it does not go into the detail of FMEA")),
     L(("تُرسم العملية في عشر خطوات أو مكونات على الأكثر", "Map the process in no more than ten steps or components"),),
     [P("iso31000", "annexa", "rel")],
     B("قبل موسم الصيف مر فريق الواحة على خطوات الصب بأسئلة «ماذا لو تأخرت الشاحنة؟ ماذا لو تعطل المبرد؟»، ثم أخذ الأخطر منها إلى FMEA.",
       "Before summer Al-Waha's team went through the pour steps asking \"what if the truck is late? what if the chiller fails?\", then took the worst ones into FMEA."),
     B("قائمة أسئلة «ماذا لو» لكل خطوة، والمخاطر التي نتجت عنها", "The \"what if\" prompts for each step and the risks they produced"), "")
tool("riskreg", "7.2", B("سجل المخاطر / تقييم المخاطر", "Risk register/risk assessment"), "risk", "both", "team", "medium", 1, "easy", ["high"],
     B("جدول يحدد المخاطر ويرتبها ويسجلها ويتابع إجراءاتها: وصف الخطر ونوعه واحتماله وأثره ومالكه وإجراءات التخفيف والطوارئ والخطر المتبقي. ومدخلاته من SWOT وPESTLE وFMEA، ومخرجاته تغذي التحسينات والأهداف وتطوير الأفراد.",
       "A table that identifies, ranks, records and follows the actions on risks: the description, type, likelihood, impact, owner, mitigation and contingency actions, and the residual risk. Its inputs come from SWOT, PESTLE or FMEA, and its outputs feed improvements, objectives and people development."),
     L(("عرض المخاطر الحالية في وثيقة واحدة", "Showing current risks in one document"), ("متابعة إجراءات المعالجة والخطر المتبقي", "Following treatment actions and residual risk")),
     L(("سهل التصفح والفهم", "Easy to navigate and understand"), ("تعريف المخاطر قد يكشف فرصاً", "Defining risks can also show opportunities")),
     L(("يُرصد بانتظام ويُحدَّث", "Monitor it regularly and keep it up to date"), ("يُنظم غالباً بفئات: مالية وبشرية وتنظيمية وعملاء", "It is often organised by category: financial, people, regulatory, customer"),
       ("رقم أولوية الخطر (RPN) قد يُستخدم للترتيب، وقد تُربط بالمخاطر تكلفة أو تأمين", "A risk priority number may be used to rank; a cost, insurance or contingency may be linked to a risk")),
     [P("iso31000", "annexa", "in"), P("w8", "risks", "in"), P("str", "raid", "rel")],
     B("بعد مشروع الخرسانة أُضيف إلى سجل مخاطر المشروع خطر «تعطل مبرد المياه في المحطة» بمالك وخطة طوارئ (محطة بديلة).",
       "After the concrete project the project risk register gained \"the plant's water chiller fails\", with an owner and a contingency (a back-up plant)."),
     B("سجل مخاطر محدَّث بالمالكين والإجراءات والخطر المتبقي، وتاريخ آخر مراجعة", "An up-to-date register with owners, actions and residual risk, and the date of the last review"), "")
tool("fmea", "7.3", B("تحليل أنماط الفشل وآثارها (FMEA)", "Failure mode and effects analysis (FMEA)"), "risk", "both", "team", "medium", 3, "difficult", ["high", "prob"],
     B("منهجية قائمة على المخاطر لتحديد المشكلات المحتملة وتحليلها وترتيب أولويتها أثناء تطوير المنتج أو العملية، ثم أثناء الإنتاج أو تقديم الخدمة وعلى مدى دورة حياة المنتج. ومن أنواعها: التصميم، وعملية التصنيع، ومراجعة التصميم المبنية على نمط الفشل، والعِدد، والبرمجيات، وتصميم الخدمة وتقديمها، وأنظمة الرصد.",
       "A risk-based method to identify, analyse and rank potential problems during product or process development, then during production or service delivery and over the product life cycle. Variants include design, manufacturing process, design review based on failure mode, tooling, software, service design and delivery, and monitoring systems."),
     L(("قبل وقوع الفشل في التصميم أو العملية", "Before a failure happens, in design or in the process"), ("بعد ظهور مشكلة غير متوقعة لتحديث التحليل", "After an unexpected issue, to update the analysis")),
     L(("يكشف المشكلات مبكراً ويقلل التغييرات المتأخرة وأعطال الميدان", "Finds problems early and reduces late changes and field failures"),
       ("يركز على أهم المخاطر بأولوية لخفض الحدوث وإزالة أنماط الفشل عالية الخطورة بالتصميم ما أمكن", "Focuses on the most significant risks, with priority on reducing occurrence and, where possible, designing out high-severity failure modes")),
     L(("نشاط فريق يمثل كل الوظائف المعنية وقد يضم العميل", "A team activity that represents every function involved and can include the customer"),
       ("وثيقة حية تُحدَّث عند المشكلات غير المتوقعة", "A living document, updated when unexpected issues arise"),
       ("لكل درجة في مقياس التقييم معيار واضح، ولا حافز لخفض الدرجات تجنباً للإجراء", "Each point on the rating scale has clear criteria, and nobody gains by scoring low to avoid action"),
       ("الخطورة لا تنخفض بالضوابط؛ تُزال بالتصميم فقط", "Severity cannot be reduced by controls; it can only be designed out"),
       ("يتناول أنماط الفشل المنفردة لا المركبة، ويحتاج تحضيراً ومخططات تدفق وميسراً كفؤاً ووقتاً", "It covers single, not compound, failure modes, and needs preparation, flow charts, a competent facilitator and time")),
     [P("fmea", "tools", "own"), P("aud", "tools", "in")],
     B("FMEA عملية رفع حزم الحديد بالرافعة البرجية: نمط «انزلاق الحزمة من الحبال» خطورته 9، فعولج أولاً بغض النظر عن رقم الأولوية.",
       "The process FMEA of lifting rebar bundles with the tower crane: the failure mode \"bundle slips from the sling\" has severity 9, so it was acted on first whatever its priority number."),
     B("دراسة FMEA بمقاييس مكتوبة قبل التقييم، وإجراءات بمالك وتاريخ، وإعادة تقييم بعد التنفيذ", "An FMEA study with scales written before rating, actions with owner and date, and re-rating after them"), "fmea")
tool("heat", "7.4", B("إشارة المرور / خريطة الحرارة", "Traffic light/heat map"), "risk", "both", "ind", "small", 1, "easy", ["high", "char"],
     B("ألوان الأحمر والكهرماني والأخضر لبيان هل الوضع أو الخطر مقبول أو لا، مرتفع أو منخفض. وتوضع غالباً على مصفوفة الخطورة مقابل التكرار فتسمى خريطة الحرارة (RAG).",
       "Red, amber and green show whether a situation or risk is satisfactory or not, high or low. It is often laid on a severity-by-frequency matrix called a heat map (RAG)."),
     L(("تقارير مؤشرات الأداء", "Reports on key performance indicators"), ("تحليل المخاطر وسجلاتها", "Risk analysis and registers"),
       ("إشارات التحذير والسلامة ولوحات المؤشرات وأندون", "Warning and safety signals, dial gauges and andon")),
     L(("بسيطة وسهلة الفهم", "Simple and easy to understand"), ("تدعمها برامج الجداول بالتنسيق الشرطي", "Supported by spreadsheet conditional formatting")),
     L(("الخرائط المتماثلة قد تنحاز لأن عواقب الخطورة الفعلية تختلف", "Symmetrical heat maps can bias the result, because real severity consequences differ"),
       ("اللون يجذب الانتباه، لكن تغيراً صغيراً في البيانات قد يغيّره", "Colour draws attention, but a small change in data can change it"),
       ("لا تعتمد على اللون وحده: لا يراه مصاب عمى الألوان", "Do not rely on colour alone: a colour-blind reader will miss it")),
     [P("iso31000", "annexa", "in"), P("w8", "heatmap", "in")],
     B("خريطة حرارة مخاطر المشاريع في الواحة تضع الرقم داخل كل خلية بجانب اللون، حتى يقرأها الجميع.",
       "Al-Waha's project risk heat map puts the number in each cell next to the colour, so everyone can read it."),
     B("خريطة حرارة بقواعد ألوان مكتوبة وأرقام ظاهرة", "A heat map with written colour rules and visible numbers"), "")
# ---------------------------------------------------------------- 8 Objectives
tool("kaizen", "8.1", B("كايزن", "Kaizen"), "change", "both", "team", "medium", 2, "medium", ["eff"],
     B("التحسين المستمر بأهداف أعلى من المستوى الحالي، يشارك فيه الجميع من المديرين إلى العاملين، بتراكم تحسينات صغيرة منتظمة على المدى الطويل. وأول خطوة توحيد الإجراء أو اتباعه إن وُجد، ثم التنفيذ والتحقق والتصرف وتكرار الدورة (SDCA).",
       "Continual improvement with targets above the current level, involving everyone from managers to workers, by accumulating small, regular improvements over the long term. The first step is to standardize or follow the procedure if one exists, then Do, Check and Act, and repeat (SDCA)."),
     L(("أي مشروع تحسين", "Any improvement project"),),
     L(("توحيد الطريقة وإزالة الهدر وخفض التكلفة وتحسين الأداء", "Standardization, waste elimination, cost reduction and performance improvement"),),
     L(("ممارسة مستمرة لا مناسبة عارضة", "An ongoing practice, not an occasional event"), ("التغيير قد يأتي من أي موظف في أي وقت ولا يلزم أن يكون بطيئاً", "Change can come from any employee at any time and need not be slow"),
       ("يذكر المعيار أن دورة SDCA قد تعطي تحسناً أولياً بنحو 15%", "The standard notes that an initial improvement of about 15 % is possible with the SDCA cycle")),
     [P("pdca", "tools", "rel")],
     B("فريق موقع الواحة يجري دورة PDCA صغيرة كل أسبوعين على ترتيب مخزن الحديد، ويسجلها في أداة PDCA.",
       "Al-Waha's site team runs a small PDCA cycle every two weeks on the rebar yard layout and records it in the PDCA tool."),
     B("سجل دورات التحسين الصغيرة ونتائجها، والإجراء الموحد بعد كل دورة", "A log of small improvement cycles and their results, and the standard after each one"), "pdca")
tool("hoshin", "8.2", B("هوشين كانري (مصفوفة X)", "Hoshin Kanri (X-matrix)"), "objectives", "both", "team", "small", 3, "medium", ["eff"],
     B("«إدارة البوصلة»: عملية من سبع خطوات لتحويل الاستراتيجية إلى عمل بتجزئة الخطة الاستراتيجية إلى أهداف قابلة للتحقيق مترابطة، تتابعها مؤشرات أداء نحو الرؤية. وتُعرض غالباً في مصفوفة X.",
       "\"Compass management\": a seven-step process that puts strategy into practice by breaking the strategic plan into a linked set of achievable objectives, followed by KPIs towards the vision. It is often shown as an X-matrix."),
     L(("نشر الأهداف من الإدارة العليا إلى كل مستوى", "Deploying objectives from top management to every level"), ("تركيز الإدارة على المؤشرات المهمة استراتيجياً", "Focusing management on strategically important KPIs")),
     L(("يحول الطموحات إلى مخرجات", "Turns aspirations into deliverables"), ("أداة قوية للتواصل والوضوح والمواءمة", "A strong tool for communication, visibility and alignment"),
       ("ما لم يتحقق يُنقح ويُرحَّل للدورة التالية", "Objectives not met are refined and carried into the next cycle")),
     L(("التزام كامل من الإدارة العليا شرط", "Full commitment of top management is vital"),
       ("قد تصبح إطاراً جامداً يخنق الابتكار ويقلل المرونة والتكيف مع العميل والسوق", "It can become a rigid frame that stifles innovation and reduces agility and adaptation to customers and markets"),
       ("المؤشرات تتطابق مع متطلبات العميل، والموظفون يرون فائدة ملموسة", "KPIs match customer requirements, and employees see a tangible benefit")),
     [P("str", "trend", "rel"), P("str", "obj", "rel")],
     B("نشرت الواحة هدف «تسليم بلا ملاحظات جوهرية» من الإدارة إلى مديري المشاريع ثم إلى مشرفي المواقع، لكل مستوى مؤشر خاص به.",
       "Al-Waha deployed \"handover with no major snags\" from management to project managers and then to site supervisors, each level with its own indicator."),
     B("مصفوفة أهداف مترابطة بمؤشراتها ومالكيها لكل مستوى", "A linked matrix of objectives with indicators and owners for each level"), "")
tool("mbo", "8.3", B("الإدارة بالأهداف (MBO)", "Management by objectives (MBO)"), "objset", "both", "both", "small", 2, "easy", ["eff"],
     B("نهج رسمي لتحقيق الاستراتيجية بوضع الأهداف وتحقيقها، وتطبيق معايير SMART عليها (محددة، قابلة للقياس، ممكنة، ذات صلة، محددة بزمن)، وربطها بأداء العمليات والمنشأة وتسلسلها حتى يعرف كل فرد إسهامه. ويُستخدم مع بطاقة الأداء المتوازن.",
       "A formal approach to realize the strategy by setting and achieving objectives, applying SMART to them (specific, measurable, attainable, relevant, time-bound), linking them to process and organizational performance, and cascading them so that every person knows their contribution. It is used with the balanced scorecard."),
     L(("وضع الأهداف وتسلسلها ومتابعتها", "Setting, cascading and following objectives"),),
     L(("علاقة مباشرة بنتائج الأعمال", "A direct link to business results"), ("يعزز التمكين عند ربطه بتغذية راجعة إيجابية", "Improves empowerment when linked to positive feedback"),
       ("يقلل فيض المعلومات ويحفز المنشأة", "Reduces information overload and energizes the organization")),
     L(("الأهداف ليست مؤشرات، والمؤشرات المناسبة قياس إضافي", "Objectives are not KPIs; the right KPIs give an extra measurement"),
       ("تُحدَّث الخطط القائمة لتتسق مع الأهداف", "Update existing plans to match the objectives"),
       ("الأهداف لا تُحقَّق «بأي ثمن»، بل ضمن ظروف التشغيل العادية وقواعد السلوك", "Objectives are not \"at any cost\": they are met within normal operating conditions and the code of ethics")),
     [P("str", "obj", "in"), P("str", "kpi", "in")],
     B("هدف الواحة لعام 2027: «خفض الشحنات المرفوضة إلى أقل من 3% في كل المشاريع بحلول يونيو»، مرتبط بمؤشر شهري ومالك.",
       "Al-Waha's 2027 objective: \"cut rejected loads below 3 % on every project by June\", linked to a monthly indicator and an owner."),
     B("أهداف SMART بمؤشراتها ومالكيها وتسلسلها إلى الأقسام", "SMART objectives with indicators, owners and their cascade to departments"), "")
# ---------------------------------------------------------------- 9 Customer
tool("qfd", "9.1", B("نشر وظيفة الجودة (QFD) — بيت الجودة", "Quality function deployment (QFD)"), "planning", "both", "team", "medium", 3, "difficult", ["eff"],
     B("طريقة لضمان رضا العميل والأطراف المعنية بتصميم المتطلبات الأهم لديهم من مستويات ووجهات نظر مختلفة، بأدوات كمية ونوعية تزيد الثقة في التصميم والتطوير. وتُسمى «بيت الجودة» لشكل مخططها، وتحسن عملية تطوير المنتجات نفسها.",
       "A method to secure customer and interested party satisfaction by designing in the requirements that matter most to them, from different levels and viewpoints, with quantitative and qualitative tools that raise confidence in design and development. It is called the \"house of quality\" after the shape of its diagram, and it also improves the development process itself."),
     L(("تصميم منتج أو خدمة جديدة أو تطوير قائمة", "Designing a new product or service, or developing an existing one"),),
     L(("رضا أعلى عند الإطلاق، وتواصل أفضل بين الوظائف", "Higher satisfaction at launch and better cross-functional communication"),
       ("قرارات تصميم منظمة قابلة للتتبع وإعادة عمل أقل", "Systematic, traceable design decisions and less rework"),
       ("زمن أقصر للسوق وتكلفة أقل على دورة الحياة وسمعة أفضل", "Shorter time to market, lower life-cycle cost and a better reputation")),
     L(("يحتاج وقتاً وموارد كبيرة", "Needs time and significant resources"), ("يبقى صوت العميل حاضراً طوال العمل", "Keep the voice of the customer in mind throughout")),
     [],
     B("استخدمت الواحة بيت الجودة في تصميم خدمة «الصيانة بعد التسليم»، فربطت «سرعة الاستجابة» التي يطلبها المالك بزمن وصول فريق الصيانة.",
       "Al-Waha used a house of quality to design its after-handover maintenance service, linking the owner's \"fast response\" to the crew's arrival time."),
     B("مصفوفة متطلبات العميل مقابل الخصائص الفنية بأوزانها", "A matrix of customer requirements against technical characteristics, with weights"), "")
tool("nps", "9.2", B("صافي نقاط الترويج (NPS)", "Net promoter score (NPS)"), "voc", "both", "ind", "medium", 1, "easy", ["high", "char"],
     B("مقياس لولاء العميل ورضاه بسؤاله عن احتمال أن يوصي بالمنتج أو الخدمة من 0 إلى 10: من 0 إلى 6 منتقدون، و7 و8 محايدون، و9 و10 مروجون. والنتيجة نسبة المروجين ناقص نسبة المنتقدين.",
       "A loyalty and satisfaction measure that asks customers how likely they are to recommend the product or service, from 0 to 10: 0 to 6 are detractors, 7 and 8 passives, 9 and 10 promoters. The score is the share of promoters minus the share of detractors."),
     L(("قياس تجربة العميل وولائه", "Measuring customer experience and loyalty"), ("كشف أسباب الشكاوى وترتيب أولويات التحسين", "Finding the causes of complaints and setting improvement priorities"),
       ("مقارنة داخلية وتوقع النمو", "Internal benchmarks and predicting growth")),
     L(("بسيط: سؤال واحد وغالباً سؤالان أو ثلاثة", "Simple: one question, usually two or three"), ("متابعة سريعة وسهل التطبيق بالهاتف أو البريد أو الويب", "Quick follow-up, easy by phone, email or web"),
       ("لا يحتاج خبراء إحصاء", "No specialist statisticians needed")),
     L(("خطة العينة وحجمها كبيران قدر الإمكان", "Make the sampling plan and sample as large as possible"),
       ("أضف أسئلة متابعة لمعرفة سبب الدرجة، خاصة الأقل من 6", "Add follow-up questions to learn why a score was given, especially below 6"),
       ("واحد من مقاييس رضا كثيرة", "It is one of many customer satisfaction measures")),
     [P("", "calc", "here")],
     B("استبيان التسليم في الواحة: 14 مروجاً و4 محايدين و2 منتقد من 20 مالكاً، فالنتيجة +60.",
       "Al-Waha's handover survey: 14 promoters, 4 passives and 2 detractors out of 20 owners, so the score is +60."),
     B("نتيجة NPS بحجم العينة وفترتها وأسباب الدرجات المنخفضة", "The NPS with sample size, period and the reasons for low scores"), "")
tool("kano", "9.3", B("نموذج كانو", "Kano model"), "voc", "both", "ind", "small", 2, "medium", ["eff", "high"],
     B("نموذج لتحسين رضا العميل بفهم محركاته وتصنيفها: صفات أساسية يجب وجودها، وصفات يزيد الرضا بزيادتها، وصفات مبهجة لم يتوقعها العميل. ويبين أن «المبهج» اليوم يصبح «متوقعاً» غداً.",
       "A model to improve customer satisfaction by understanding and classifying its drivers: must-have qualities, qualities where more gives more satisfaction, and delighters the customer did not expect. It shows that today's delighter becomes tomorrow's expectation."),
     L(("تطوير منتجات جديدة وتحديد الميزات الأساسية", "Developing new products and setting the must-have features"), ("اكتشاف احتياجات غير معروفة وإزالة الميزات غير المؤثرة", "Discovering unknown needs and removing features nobody cares about")),
     L(("بسيط ويكشف بسرعة الصفات المعروفة وغير المعروفة", "Simple, and quickly shows known and unknown qualities"), ("يركز على ميزات المنتج لا متطلبات العميل فقط", "Focuses on product features, not only on customer requirements")),
     L(("يُستطلع العملاء المعنيون", "Survey the relevant customers"), ("ابدأ من الحد الأدنى الذي يتوقعه العميل ثم ابنِ عليه", "Find the minimum the customer expects, then build on it")),
     [],
     B("في خدمة التسليم صُنفت «نظافة الموقع» صفة أساسية، و«دليل تشغيل مصور للمالك» صفة مبهجة.",
       "For the handover service \"a clean site\" was classed as a must-have and \"an illustrated operating guide for the owner\" as a delighter."),
     B("تصنيف ميزات المنتج أو الخدمة بنتيجة الاستبيان", "The classification of features with the survey results"), "")
tool("pugh", "9.4", B("مصفوفة بيو / مصفوفة القرار", "Pugh matrix/Decision matrix"), "prior", "both", "team", "small", 1, "easy", ["eff", "prob"],
     B("مقارنة بدائل عدة لاختيار الأفضل باختبارها على معايير رئيسية بأوزان، والأهم وزنه أعلى. يمكن أن يستخدمها فرد، لكنها أفضل في فريق، وتُستخدم عادة في بداية التصميم.",
       "Comparing several alternatives to pick the best by testing them against weighted key criteria, the most important weighted highest. One person can use it, but it works best in a team, usually early in design."),
     L(("تقييم بدائل التصميم", "Evaluating alternative design approaches"), ("اختيار الموردين", "Selecting vendors"), ("المفاضلة بين المتقدمين للوظائف", "Selecting applicants when hiring")),
     L(("طريقة منظمة للمقارنة", "A structured way to compare"), ("قد تنتج حلاً هجيناً من أكثر من بديل", "Can give a hybrid of several alternatives"),
       ("سريعة ويمكن إعادتها عند ظهور بدائل جديدة", "Quick, and can be repeated when new alternatives appear")),
     L(("تُقدَّر الدرجات بعناية وتُبرَّر ما أمكن", "Assess each score carefully and justify it where possible"), ("الأفضل في فريق", "Best used by a team")),
     [P("oec", "pq", "rel")],
     B("اختارت الواحة بين ثلاث محطات خرسانة بمصفوفة قرار بأوزان: المسافة 30%، والتبريد 30%، والسعر 25%، والسجل 15%.",
       "Al-Waha chose between three ready-mix plants with a weighted decision matrix: distance 30 %, cooling 30 %, price 25 %, track record 15 %."),
     B("مصفوفة بالمعايير وأوزانها ودرجات كل بديل ومبرراتها", "A matrix with criteria, weights and each alternative's scores and reasons"), "")
# ---------------------------------------------------------------- 10 Process performance
tool("toc", "10.1", B("نظرية القيود (ToC)", "Theory of constraints (ToC)"), "effect", "both", "both", "medium", 2, "medium", ["eff", "high"],
     B("منهجية لتحديد أهم عامل يحد من تحقيق الهدف (القيد) بخمس خطوات: حدد القيد، وقرر كيف تعالجه، وأبقِ التركيز عليه، ونفذ التصحيح، ثم عد إلى الخطوة الأولى.",
       "A method to find the most important factor limiting an objective (the constraint) in five steps: identify the constraint, decide how to address it, keep the focus on it, implement the correction, then return to step one."),
     L(("على العمليات الرئيسية لكشف حدودها ووضع الحلول", "On key processes, to find their limits and work out solutions"),),
     L(("استخدام أفضل للموارد وتحسين مركز", "Better use of resources and focused improvement"), ("تدفق وسعة أفضل، ومهل ومخزون أقل", "Better flow and capacity, shorter lead times and less inventory")),
     L(("أكثر فعالية مع طرق أخرى مثل التفكير الرشيق", "Most effective combined with methods such as lean thinking"),),
     [],
     B("القيد في تسليم المشروع كان «زيارة الاستشاري للاستلام» مرة في الأسبوع، فاتُّفق على زيارتين وارتفع معدل الاستلام.",
       "The constraint in project delivery was the consultant's inspection visit once a week; two visits were agreed and the inspection rate went up."),
     B("القيد المحدد بالبيانات، والإجراء، والقياس قبل وبعد", "The constraint found with data, the action, and before/after measures"), "")
tool("vsm", "10.2", B("إدارة تدفق القيمة (VSM)", "Value stream management (VSM)"), "product", "both", "both", "medium", 2, "medium", ["char", "high"],
     B("فهم العملية بأنشطتها المضيفة للقيمة وغير المضيفة (الانتظار والحركة والتجهيز وإعادة العمل والفرز). وخريطة تدفق القيمة تصور تدفق المواد والمعلومات معاً؛ تُرسم الحالة الحالية من بيانات مجمعة ثم تُصمم حالة مستقبلية بهدر أقل ومهلة أقصر.",
       "Understanding a process by its value-adding and non-value-adding activities (waiting, movement, set-up, rework, sorting). A value stream map shows both material and information flows; the current state is mapped from collected data and a future state is designed with less waste and a shorter lead time."),
     L(("إزالة الهدر والتأخير", "Removing waste and delays"), ("تصميم عمليات تصنيع أو خدمة جديدة", "Designing new manufacturing or service processes"), ("المساعدة في حل المشكلات", "Helping with problem solving")),
     L(("أداة مرئية بالرموز سهلة الفهم", "A visual tool with symbols, easy to understand"),),
     L(("ليست خريطة عمليات ولا تبين كل المسارات الممكنة", "It is not a process map and does not show every possible path"),
       ("تحتاج قياس زمن الدورة لكل نشاط", "It needs the cycle time of every activity measured"), ("تدعمها مخططات التدفق لفرز الأنشطة", "Flow charts support it in sorting the activities")),
     [],
     B("خريطة تدفق قيمة لطلب المواد من الموقع حتى التوريد بينت أن 70% من المهلة انتظار للموافقات.",
       "A value stream map of a material request from site to delivery showed that 70 % of the lead time was waiting for approvals."),
     B("خريطتا الحالة الحالية والمستقبلية بأزمنة مقاسة", "Current and future state maps with measured times"), "")
tool("muda", "10.3", B("هدر العمليات (مودا)", "Process wastes/muda"), "product", "both", "both", "small", 1, "easy", ["high", "eff"],
     B("تحديد الهدر في العمليات وتقليله أو إزالته، بثمانية أنواع: النقل، والمخزون، والحركة، والانتظار، والإفراط في الإنتاج، والإفراط في المعالجة، والعيوب، والمهارات غير المستغلة.",
       "Identifying waste in processes and reducing or removing it, in eight types: transportation, inventory, motion, waiting, overproduction, over-processing, defects and unused skills."),
     L(("تحسين أداء العمليات: زمن الدورة والمهلة والتسليم في الموعد", "Improving process performance: cycle time, lead time, on-time delivery"),),
     L(("أثر مباشر على الأداء والهدر", "A direct effect on performance and waste"),),
     L(("يحتاج جمع بيانات ميدانياً", "Needs hands-on data collection"), ("فرق متعددة الوظائف حتى لا تُحذف جوانب تضيف قيمة", "Use cross-functional teams so value-adding aspects are not removed"),
       ("جزء من نظام تويوتا للإنتاج، ويُستخدم مع 5S وكايزن", "Part of the Toyota Production System, used with 5S and Kaizen")),
     [],
     B("جولة هدر في موقع الواحة رصدت «انتظار» الرافعة لحزم الحديد غير المجهزة، و«حركة» العمال إلى مخزن بعيد.",
       "A waste walk on Al-Waha's site found \"waiting\" (the crane waiting for unprepared rebar bundles) and \"motion\" (workers walking to a distant store)."),
     B("قائمة الهدر بأنواعه الثمانية والإجراء لكل منها", "A list of wastes by the eight types and the action on each"), "")
tool("wbs", "10.4", B("هيكل تجزئة العمل (WBS)", "Work breakdown structure (WBS)"), "resp", "both", "team", "small", 1, "easy", ["eff"],
     B("تجزئة المخرجات الرئيسية لمشروع أو منتج أو خدمة إلى عناصر أصغر عبر مستويين هرميين أو أكثر.",
       "Breaking the main deliverables of a project, product or service into smaller elements through two or more hierarchical levels."),
     L(("إدارة المشاريع وتطوير المنتجات والخدمات", "Project management and product or service development"),),
     L(("تخطيط تفصيلي وتوزيع للموارد", "Detailed planning and resource allocation"), ("يكشف عناصر العمل الناقصة ويضع الحدود", "Finds missing work elements and sets boundaries")),
     L(("تُحدد كل المهام اللازمة للمخرجات", "Identify every task needed for the deliverables"), ("التركيز على المخرجات لا الأفعال", "Plan outcomes rather than actions"),
       ("تُجزأ المهام حتى تُنجز في دورة مراجعة واحدة أو بتخصص واحد", "Break tasks down until one review cycle or one discipline can deliver each")),
     [P("iso21500", "clauses", "rel"), P("pmo", "assess", "rel")],
     B("هيكل تجزئة مشروع المدرسة في الواحة: الأعمال الإنشائية ← الأساسات ← الحفر والقواعد والعزل، لكل عنصر مسؤول.",
       "The WBS of Al-Waha's school project: structural works → foundations → excavation, footings and waterproofing, each element with an owner."),
     B("هيكل تجزئة معتمد بمستوياته ومسؤول لكل عنصر", "An approved WBS with its levels and an owner per element"), "")
tool("spaghetti", "10.5", B("مخطط السباغيتي", "Spaghetti diagram"), "product", "both", "both", "small", 1, "easy", ["char", "high"],
     B("أداة رشيقة مرئية ترسم مسار المنتج أو الشخص في مكان العمل، بهدف إعادة ترتيب العمل لتقليل التقاطعات ومسافة الحركة.",
       "A visual lean tool that draws the path of a product or person through the workplace, to rearrange the work so crossings and travel distance are reduced."),
     L(("تقييم التدفق في التحسين الرشيق", "Evaluating flows as part of lean"), ("تصميم أماكن العمل", "Designing workplaces"), ("الحد من الحوادث", "Reducing accidents")),
     L(("أداة مرئية بسيطة تكشف أماكن العمل غير الكفؤة وتصلح لأي مكان عمل", "A simple visual tool that shows inefficient workplaces and fits any workplace"),),
     L(("ارسم المسار الفعلي كما يحدث، لا كما يُفترض", "Draw the actual path as it happens, not as it should be"),),
     [],
     B("مخطط سباغيتي لعامل التسليح يوماً كاملاً أظهر 3.2 كم مشياً، فنُقلت منطقة القص إلى جانب منطقة التركيب.",
       "A spaghetti diagram of one rebar fixer for a full day showed 3.2 km of walking, so the cutting area was moved next to the fixing area."),
     B("المخطط قبل وبعد بالمسافات", "The diagram before and after, with distances"), "")
tool("5s", "10.6", B("5S", "5S"), "house", "both", "team", "small", 1, "easy", ["eff"],
     B("خمس كلمات يابانية تبني مكان عمل نظيفاً منظماً آمناً للضبط المرئي والإنتاج الرشيق، ويُضاف أحياناً «S» سادس للسلامة: الفرز، والترتيب، والتنظيف، والتوحيد، والاستدامة.",
       "Five Japanese terms that build a clean, orderly, safe workplace for visual control and lean production, sometimes with a sixth \"S\" for safety: sort, set in order, shine, standardize and sustain."),
     L(("أي بيئة عمل، حتى المنزل", "Any work environment, even at home"),),
     L(("يحسن السلامة ويخفض العيوب ويزيد جاهزية المعدات", "Improves safety, lowers defects and raises equipment availability"),
       ("يخفض التكلفة ويرفع الروح المعنوية والانطباع الأول", "Cuts cost and lifts morale and first impressions")),
     L(("يطبق بمنهج صارم ومنضبط ويحتاج جهداً ومثابرة", "Apply it with a rigorous, disciplined method; it needs effort and perseverance"),
       ("يمكن تطبيقه ركيزة تلو ركيزة", "It can be introduced one pillar at a time"),
       ("يُعزَّز بالتدقيق والتقييم، ولا يُعامل أداة بسيطة للنظافة", "Reinforce it with audits and scoring, and do not treat it as a minor tidiness tool")),
     [],
     B("طبق مخزن المعدات في الواحة 5S فصار لكل عدة مكان مرسوم، وانخفض وقت البحث عن العدد.",
       "Al-Waha's tool store applied 5S: every tool now has a marked place, and time spent searching dropped."),
     B("نتائج تدقيق 5S الدورية بالدرجات والصور", "Periodic 5S audit scores with photographs"), "")
tool("oee", "10.7", B("الفعالية الشاملة للمعدات (OEE)", "Overall equipment effectiveness (OEE)"), "effic", "mfg", "ind", "medium", 2, "medium", ["char", "high"],
     B("مقياس يجمع ثلاثة عوامل: الإتاحة والأداء والجودة، لتقييم فعالية معدة أو عملية وكشف فرص خفض التوقف وزمن الدورة وتحسين الجودة. ومن الخسائر التي يكشفها: التوقف المخطط وغير المخطط، والدورات البطيئة، ومرفوضات الإنتاج وبدء التشغيل.",
       "A measure that combines three factors, availability, performance and quality, to assess the effectiveness of equipment or a process and find chances to cut downtime and cycle time and improve quality. Losses it reveals include planned and unplanned stops, slow cycles, and production and start-up rejects."),
     L(("دعم التحسين ومؤشر رئيسي للصيانة الإنتاجية الشاملة", "Supporting improvement, and a key indicator of total productive maintenance"),),
     L(("يحدد مكان التحسين: الإتاحة أو الأداء أو الجودة", "Shows where improvement can be made: availability, performance or quality"), ("يمكن استخدامه للمقارنة المرجعية", "Can be used as a benchmark")),
     L(("لا يُستخدم تقديراً على مستوى المنشأة كلها", "Avoid it as an organization-wide estimate"), ("تُجمع البيانات على فترة ممثلة", "Gather the data over a representative period"),
       ("رقم واحد لا يبين أثر كل عامل منفرداً، فاعرض العوامل الثلاثة", "A single figure hides each factor's effect, so show the three factors")),
     [P("", "calc", "here")],
     B("مضخة الخرسانة في الواحة: إتاحة 85% × أداء 90% × جودة 98% = 75%، والخسارة الأكبر في الإتاحة (أعطال الخراطيم).",
       "Al-Waha's concrete pump: availability 85 % × performance 90 % × quality 98 % = 75 %; the biggest loss is availability (hose failures)."),
     B("OEE بعوامله الثلاثة على فترة ممثلة وأسباب الخسارة", "OEE with its three factors over a representative period, and the causes of loss"), "")
tool("heijunka", "10.8", B("تسوية الإنتاج (هيجونكا)", "Production levelling (Heijunka)"), "effic", "mfg", "ind", "medium", 2, "medium", ["eff"],
     B("منهجية لتقليل التفاوت في عملية إنتاج مستمرة، فتقل الأحمال الزائدة والطاقة الفائضة، ويُنتج بما يتوافق مع طلب العميل فيقل المخزون وأثر تذبذب الطلب. وتمكّنها كانبان.",
       "A method to reduce unevenness in a continual production process, so overload and spare capacity fall and output follows customer demand, cutting inventory and the effect of fluctuating demand. Kanban enables it."),
     L(("عمليات الإنتاج المستمرة", "Continual production processes"),),
     L(("خفض التكلفة (مخزون أمثل، وتوازن الخطوط، وOEE أفضل)", "Cost reduction (optimized inventory, line balancing, better OEE)"), ("هدر أقل في سلسلة التوريد", "Less waste in the supply chain")),
     L(("نجاحها يعتمد على قدرة الخط على إنتاج مزيج حسب الطلب", "Success depends on the line producing a mix on demand"), ("تُراعى بيئة العمل البشرية (الإرغونوميكس)", "Consider ergonomics")),
     [],
     B("وزّعت ورشة الحديد في الواحة أوامر القص بالتساوي على أيام الأسبوع بدل تكدسها يوم الخميس.",
       "Al-Waha's rebar shop spread cutting orders evenly across the week instead of piling them on Thursday."),
     B("جدول إنتاج مسوّى مقابل الطلب الفعلي", "A levelled production schedule against actual demand"), "")
# ---------------------------------------------------------------- 11 Inventory
tool("kanban", "11.1", B("كانبان", "Kanban"), "inventory", "both", "both", "medium", 1, "easy", ["eff"],
     B("«الإشارة» باليابانية: نظام لمنع الإفراط في التوريد أو الإنتاج، بإشارة تُرسل من نقطة الاستهلاك إلى الأعلى عند الحاجة إلى إعادة التوريد، ويمكن استخدامه في سلسلة التوريد كلها.",
       "\"Signal\" in Japanese: a system to prevent over-supply or over-production, by a signal sent upstream from the point of use when re-supply is needed; it can be used throughout a supply chain."),
     L(("ضبط التوريد والإنتاج المرئي، ومع تسوية الإنتاج", "Visual control of supply and production, and with production levelling"),),
     L(("سهل الاستخدام ويرتب أولوية التوريد", "Easy to use and prioritizes supply"), ("يخفض المخزون والعمل الجاري", "Reduces inventory and work in progress")),
     L(("كمية كل دورة تحددها سرعة الاستهلاك", "The amount per cycle is set by the rate of use"), ("كثيراً ما يحتاج مخزناً احتياطياً قرب نقطة الاستهلاك", "Often needs a buffer store near the point of use"),
       ("يُدار مع الوقت ليبقى متوازناً، ويحتاج مدخلات بلا عيوب", "Manage it over time to keep it balanced; it needs defect-free inputs")),
     [],
     B("بطاقتا كانبان لصناديق أدوات الربط في الموقع: عند فراغ الصندوق الأول تُرسل بطاقته إلى المستودع.",
       "Two kanban cards for tie-wire boxes on site: when the first box is empty its card goes to the warehouse."),
     B("قواعد الإشارة والكميات ومراجعتها", "The signal rules, quantities and their review"), "")
tool("jit", "11.2", B("في الوقت المحدد (JIT)", "Just-in-time (JIT)"), "lean", "both", "team", "medium", 1, "easy", ["eff"],
     B("توريد ما يلزم فقط عند الحاجة إليه، لتلبية طلب العميل بهدر أقل ومخزون أدنى. ومن عناصره: إزالة الهدر، و5S، وتقليل زمن التجهيز، والإنتاج المسوّى، وكانبان، والأتمتة الذكية (جيدوكا).",
       "Delivering only what is needed, when it is needed, to meet customer demand with less waste and minimum inventory. Its elements include removing waste, 5S, set-up time reduction, levelled production, Kanban and autonomation (Jidoka)."),
     L(("حيث تكون سلسلة التوريد مستقرة", "Where the supply chain is stable"),),
     L(("هدر أقل وجودة أفضل وتسليم في الموعد وتكلفة أقل", "Less waste, better quality and on-time delivery, lower cost"),),
     L(("سلسلة التوريد مستقرة شرط", "A stable supply chain is a condition"),),
     [],
     B("توريد الخرسانة الجاهزة نفسه «في الوقت المحدد»: الشحنة تُطلب على موعد الصب، فأي تأخير يظهر فوراً في جودة الصب.",
       "Ready-mix supply is itself just-in-time: each load is ordered for the pour, so any delay shows at once in pour quality."),
     B("خطة التوريد المرتبطة بالجدول، ومؤشر التسليم في الموعد", "The supply plan tied to the schedule, and the on-time delivery indicator"), "")
# ---------------------------------------------------------------- 12 Detection and prevention
tool("poka", "12.1", B("منع الخطأ (بوكا يوكي)", "Error proofing/poka-yoke"), "defect", "both", "ind", "small", 1, "easy", ["eff"],
     B("منع الاستخدام الخاطئ بضوابط مادية أو إلكترونية، في تصميم المنتج أو العملية (ومنها العدد والتثبيتات) لمنع حدوث نمط الفشل، حيث تكون السلامة أو الوظيفة مهمة جداً.",
       "Stopping incorrect use with physical or electronic controls, in the design of the product or process (including tools and fixtures), to prevent a failure mode from occurring, where safety or function matters greatly."),
     L(("حيث يؤثر الوضع الخاطئ في الوظيفة أو الاستخدام", "Where incorrect positioning can affect function or use"),),
     L(("يمنع سوء الاستخدام والتركيب الخاطئ", "Stops misuse and incorrect assembly"), ("ينبه بصرياً عند توقع سوء الاستخدام", "Gives a visual warning where misuse is expected")),
     L(("يؤثر في تصميم المكون أو المنتج أو التثبيتة", "It affects the design of the component, product or fixture"),
       ("وهو الطريق العملي لمنع «الخطأ البشري» الذي يطلبه البند 8.5.1 ز) من ISO 9001:2026، بدل لوم الأشخاص", "It is the practical route to the actions to prevent human error in ISO 9001:2026 8.5.1 g), instead of blaming people")),
     [P("dmaic", "tools", "rel"), P("a3", "tools", "rel")],
     B("قفل في خطاف الرافعة لا يُغلق إلا إذا كانت الحبال في مكانها، بدل الاعتماد على انتباه عامل الربط.",
       "A crane hook latch that closes only when the slings are seated, instead of relying on the rigger's attention."),
     B("وسيلة منع الخطأ ونتيجة اختبارها، وتحديث خطة الضبط", "The error-proofing device, its test result and the updated control plan"), "")
tool("visual", "12.2", B("الوسائل المرئية", "Visual aid"), "qc", "both", "ind", "medium", 1, "easy", ["eff", "char"],
     B("مرجع مصور يساعد على توحيد العمليات والحكم على جودة المنتج وحل المشكلات، مثل تصنيف العيوب ومواقعها ومعايير القبول.",
       "A pictorial reference that helps standardize operations, judge product quality and solve problems, such as classifying defects, showing their location and defining acceptance criteria."),
     L(("تصنيف العيوب وعرض مواقعها", "Classifying defects and showing where they are"), ("تعريف معايير القبول", "Defining acceptance criteria"), ("تقدير القدرات وتدريج المنتجات الطبيعية", "Grading ability and natural products")),
     L(("بسيطة ولا تعتمد على اللغة، فتناسب العمالة متعددة اللغات", "Simple and language-free, so they suit a multilingual workforce"), ("شرح المشكلة بالصورة أسهل من النص", "Easier to explain an issue with a picture than with text")),
     L(("تُراجع المواد المرئية دورياً", "Review the visual material periodically"), ("قد يلزم تحديد حد أدنى للإضاءة", "A minimum lighting level may have to be set")),
     [],
     B("لوحة مصورة عند بوابة الموقع تبين شكل الخرسانة المقبولة والمرفوضة في اختبار الهبوط، بالعربية والأردية والإنجليزية.",
       "A picture board at the site gate shows acceptable and rejected concrete in the slump test, in Arabic, Urdu and English."),
     B("الوسيلة المرئية المعتمدة بتاريخ مراجعتها", "The approved visual aid with its review date"), "")
tool("coq", "12.3", B("تكلفة الجودة (COQ)", "Cost of quality (COQ)"), "waste", "both", "team", "medium", 2, "medium", ["high"],
     B("مجموع تكلفة الفشل الداخلي والخارجي (تكلفة سوء الجودة) وتكلفة التقييم والوقاية، وهو أساس لتحديد الإجراءات. والغرض خفض التكلفة الكلية بإزالة أسباب سوء الجودة أو تقليلها.",
       "The total of internal and external failure costs (the cost of poor quality) and the costs of appraisal and prevention, used as the basis for deciding actions. The aim is to reduce the total by removing or reducing the causes of poor quality."),
     L(("التحسين المنظم للعمليات والمنتجات والخدمات", "Systematic improvement of processes, products and services"),),
     L(("يعطي الإدارة معلومة التكلفة اللازمة للقرار، بنظرة شاملة", "Gives management the cost information it needs, in a holistic way"), ("يطبق على الخدمات كما المنتجات", "Applies to services as well as products")),
     L(("هو أساس للاستثمار في الوقاية والتقييم، الذي يعوضه عادة انخفاض تكلفة الفشل", "It is the basis for investing in prevention and appraisal, which usually pays for itself in lower failure costs"),),
     [P("pareto", "tools", "in"), P("", "calc", "here")],
     B("تحليل باريتو PA-EX-03 رتب حالات عدم المطابقة في الواحة بتكلفة سوء الجودة، فظهرت إعادة أعمال القوالب والحديد في المقدمة.",
       "Pareto analysis PA-EX-03 ranked Al-Waha's nonconformities by the cost of poor quality, with formwork and rebar rework at the top."),
     B("تقرير تكلفة الجودة بفئاتها الأربع وفترتها ونسبتها من المبيعات", "A cost of quality report with its four categories, period and share of sales"), "")
# ---------------------------------------------------------------- 13 Process control tools
tool("box", "13.2", B("مخطط الصندوق", "Box plot"), "vspc", "both", "ind", "medium", 1, "easy", ["char"],
     B("يبين مدى البيانات الرقمية بخمس قيم: الأدنى، والربيع الأول، والوسيط، والربيع الثالث، والأعلى؛ لمقارنة العينات (عبر الزمن أو بين موردين) وإظهار المدى والقيم الشاذة.",
       "Shows the range of numerical data with five values: minimum, first quartile, median, third quartile and maximum, to compare samples (over time or between suppliers) and show the range and outliers."),
     L(("مقارنة توزيعات مجموعات مختلفة", "Comparing distributions across groups"),),
     L(("سهل الاستخدام والتفسير، برياضيات بسيطة تتولاها برامج كثيرة", "Easy to use and read, with simple maths many programs can handle"),),
     L(("التفسير الصحيح يحتاج بيانات كافية", "Proper reading needs enough data"),),
     [],
     B("مخطط صندوق لحرارة الشحنات من ثلاث محطات بيّن أن المحطة الثانية الأوسع تبايناً.",
       "A box plot of load temperatures from three plants showed plant 2 had the widest spread."),
     B("المخطط ببياناته وحجم كل مجموعة", "The chart with its data and the size of each group"), "")
tool("pie", "13.3", B("المخطط الدائري", "Pie chart"), "vspc", "both", "ind", "small", 1, "easy", ["char"],
     B("أداة مرئية بسيطة تبين النسب النسبية لمكونات مجموعة، كالمبيعات حسب المنطقة أو التكاليف أو فئات الشكاوى أو أنواع العيوب.",
       "A simple visual tool showing the relative shares of a population, such as sales by region, costs, categories of complaints or types of defect."),
     L(("عرض الحصص النسبية", "Showing relative shares"),),
     L(("سهل العرض والتفسير", "Easy to present and read"),),
     L(("يعمل جيداً مع فئات قليلة", "Works best with few categories"), ("قد تعبر مساحة الدائرة عن حجم العينة", "The area of the pie can show the sample size")),
     [],
     B("مخطط دائري لأنواع شكاوى الملاك بعد التسليم: التشطيبات 45%، والتكييف 30%، وغيرها 25%.",
       "A pie chart of owner complaints after handover: finishes 45 %, air conditioning 30 %, other 25 %."),
     B("المخطط بالقيم وفترة البيانات", "The chart with values and the data period"), "")
tool("radar", "13.4", B("المخطط الراداري / العنكبوتي", "Radar chart/spider diagram"), "spc", "both", "both", "medium", 2, "medium", ["char", "high"],
     B("مخطط يعرض عدة خصائص متجهات على شبكة قطبية، لعرض أداء كل خاصية ومقارنة متغير واحد أو أكثر، ويفيد فيه استخدام الألوان.",
       "A chart that displays several attributes as vectors on a polar grid, to show the performance of each attribute and compare one or more variables; colour helps."),
     L(("تتبع الأداء أو التقدم والإبلاغ عنه", "Tracking or reporting performance or progress"), ("قياس الأداء الكلي بعدة متغيرات", "Measuring overall performance with several variables")),
     L(("سهل وبسيط وجذاب ومضغوط", "Easy, simple, attractive and compact"),),
     L(("أبقِه بسيطاً وقلل عدد المتغيرات", "Keep it simple and limit the number of variables"),),
     [P("exc", "results", "in"), P("iso37000", "report", "in")],
     B("مخطط راداري لنتائج التقييم الذاتي EFQM في الواحة بين 2026 و2027 على المعايير السبعة.",
       "A radar chart of Al-Waha's EFQM self-assessment results for 2026 and 2027 across the seven criteria."),
     B("المخطط بقيمه ومصدر كل قيمة", "The chart with its values and the source of each"), "")
tool("precontrol", "13.5", B("الضبط المسبق", "Pre-control"), "spc", "both", "both", "medium", 2, "easy", ["char"],
     B("أسلوب إحصائي يمنع إنتاج وحدات خارج المواصفات: خمس وحدات متتالية يجب أن تقع في النصف الأوسط من مدى المواصفة، ثم يستمر الإنتاج بعينات دورية من وحدتين تقرر الاستمرار أو ضبط العملية.",
       "A statistical technique to prevent units outside specification: five consecutive units must fall in the middle half of the specification range, then production continues with periodic samples of two units that decide whether to go on or adjust the process."),
     L(("بديل منخفض التكلفة للضبط الإحصائي أو حيث لا يمكن تطبيقه", "A low-cost alternative to SPC, or where SPC is not viable"), ("رصد عمليات التشغيل المعرضة للانحراف بتآكل العدد", "Monitoring machining that drifts with tool wear")),
     L(("تدريب قليل وطريقة بسيطة بمقاييس «يمر / لا يمر»", "Little training and a simple method with go/no-go gauges"),),
     L(("رؤية محدودة للعملية، ولا يُنصح به للتحسين", "Limited insight into the process, and not advocated for improvement"), ("يناسب أكثر المنتجات من الخدمات", "Suits products more than services")),
     [],
     B("في ورشة القص يُفحص طول أول خمسة قضبان مقصوصة على مقياس «يمر / لا يمر»، ثم قضيبان كل ساعة.",
       "In the cutting shop the first five cut bars are checked on a go/no-go gauge, then two bars every hour."),
     B("سجل العينات وقرارات الاستمرار أو الضبط", "The sample record and the go-on or adjust decisions"), "")
tool("ctq", "13.6", B("شجرة المتطلبات الحرجة للجودة (CTQ)", "Critical to quality (CTQ) trees"), "", "", "", "", 3, "", ["char"],
     B("شجرة تبدأ من حاجة حرجة يُتوقع أن يلبيها المنتج أو الخدمة، ثم محركات الجودة لكل حاجة، ثم معايير الأداء التي تحقق كل محرك، وشجرة جديدة لكل حاجة. وتُستخدم في بداية المشروع أو لتوجيه تحسين قائم.",
       "A tree that starts from a critical need the product or service is expected to meet, then the quality drivers for each need, then the performance criteria that satisfy each driver, with a new tree for each need. It is used at project start or to drive an improvement of an existing product or service."),
     L(("تركيز التطوير على ما يهم فعلاً", "Focusing development on what really matters"), ("قيادة مبادرة تحسين", "Driving an improvement initiative")),
     L(("سهلة العرض والتفسير", "Easy to present and read"),),
     L(("الجدول C.1 لا يذكر لها إلا مستوى الكفاءة (•••)", "Table C.1 gives only its level of capability (•••)"),),
     [P("dmaic", "tools", "in")],
     B("في ميثاق DMAIC للخرسانة: حاجة «خرسانة تُصب دون رفض» ← محرك «حرارة مضبوطة» ← معيار «≤ 32 °م عند البوابة».",
       "In the concrete DMAIC charter: the need \"concrete poured without rejection\" → driver \"controlled temperature\" → criterion \"≤ 32 °C at the gate\"."),
     B("شجرة CTQ بمعايير قابلة للقياس وحدودها", "A CTQ tree with measurable criteria and their limits"), "dmaic")
tool("pareto", "13.7", B("مخطط باريتو", "Pareto chart"), "vspc", "both", "ind", "medium", 1, "easy", ["prob", "high"],
     B("يعرض الأسباب الأكثر تأثيراً في النتيجة. ومبدأ باريتو («قاعدة 80:20») أن أغلب النتائج تأتي من أسباب قليلة: «القلة الحيوية» مقابل «الكثرة المفيدة».",
       "Displays the causes with the greatest influence on the outcome. The Pareto principle (the \"80:20 rule\") says most outcomes come from a few causes: the \"vital few\" against the \"useful many\"."),
     L(("التكاليف وأسباب الشكاوى والعيوب", "Costs, causes of complaints and defects"), ("الموارد والمخاطر ومصادر الهدر وشرائح السوق", "Resources, risks, sources of waste and market segments")),
     L(("سهل الاستخدام والعرض والتفسير برياضيات بسيطة", "Easy to use, present and read, with simple maths"), ("يركز الإجراءات على ما يعطي أكبر نتيجة", "Focuses action on what gives the biggest result")),
     L(("سؤال واحد لكل مخطط وفترة ومصدر معلن", "One question per chart, with a stated period and source"), ("قسّم البيانات قبل الحكم: الترتيب يتغير بين المقياس عدداً وتكلفة", "Split the data before judging: the ranking can change between counts and cost")),
     [P("pareto", "tools", "own")],
     B("باريتو PA-EX-02: الحرارة سببت 14 من 35 شحنة مرفوضة، فصارت «القلة الحيوية» التي بدأ منها التحقيق ومشروع DMAIC.",
       "Pareto PA-EX-02: temperature caused 14 of 35 rejected loads, so it became the vital few the investigation and the DMAIC project started from."),
     B("مخطط باريتو بالفترة والمصدر ونقطة القطع والقلة الحيوية والخطوة التالية", "A Pareto chart with period, source, cut-off, vital few and next step"), "pareto")
tool("grr", "13.8", B("التكرار وإعادة الإنتاج للقياس (GR&R)", "Gage repeatability and reproducibility (GR&R)"), "metro", "mfg", "team", "medium", 3, "medium", ["char"],
     B("تقييم قدرة نظام القياس بتقدير مقدار التباين العائد إلى عناصر عملية القياس كالجهاز والأشخاص: التكرار يرتبط عادة بتباين الجهاز، وإعادة الإنتاج بتباين المقيّم.",
       "Assessing the capability of a measurement system by estimating how much variation comes from parts of the measurement process such as the equipment and the people: repeatability usually relates to equipment variation and reproducibility to appraiser variation."),
     L(("قبل الاعتماد على بيانات القياس في القرار", "Before relying on measurement data for a decision"), ("التحقق من فعالية التدريب", "Validating the effectiveness of training")),
     L(("يحدد قدرة نظام القياس كله ويفصل مصادر التباين", "Identifies the capability of the whole measurement system and separates the sources of variation"),
       ("يكشف أثر اختلاف أساليب القياس (زاوية النظر والإضاءة)", "Shows where differences in technique change the result (parallax, lighting)")),
     L(("أجهزة مناسبة للقياس ومعايرة سارية", "Instruments suited to the measurement, with valid calibration"),
       ("افهم النظام قبل البدء وصمم الدراسة على ذلك", "Understand the system in detail before starting and design the study for it"),
       ("القياس في بيئته العادية، وللبيانات المصنفة طرق بديلة مثل معامل كابا", "Measure in the normal environment; for attribute gauges there are alternatives such as Cohen's kappa")),
     [P("dmaic", "tools", "in")],
     B("في مرحلة القياس بمشروع الخرسانة قورنت موازين الحرارة بمجس معاير، فاستُبدل ميزان يقرأ أقل بدرجتين قبل تثبيت الأساس.",
       "In the Measure phase of the concrete project the thermometers were compared with a calibrated probe, and one reading 2 °C low was replaced before the baseline was fixed."),
     B("دراسة القياس بقاعدتها المكتوبة مسبقاً ونتيجتها وتاريخها قبل الأساس", "The measurement study with its rule written beforehand, its result and its date before the baseline"), "dmaic")
# ---------------------------------------------------------------- 14 Corrective action / problem analysis
tool("rca", "14.1", B("تحليل السبب الجذري (RCA)", "Root cause analysis (RCA)"), "problem", "both", "team", "small", 2, "easy", ["prob"],
     B("مجموعة منهجيات لفهم سبب المشكلة لمنع تكرارها في العملية نفسها أو غيرها، وفهم لماذا لم تكتشفها الضوابط أو تصعّدها، وهل هي منهجية أم عشوائية. والتركيز على الأسباب الأساسية لا الأعراض ولا التصحيح الفوري.",
       "A family of methods to understand why a problem happened so that it does not recur in the same or other processes, why the controls (if any) failed to catch or escalate it, and whether it is systemic or random. The focus is on the fundamental causes, not the symptoms or the immediate correction."),
     L(("بعد حالة عدم مطابقة أو حادث أو حادث وشيك", "After a nonconformity, an incident or a near miss"),),
     L(("حين تُعالج الأسباب الجذرية تقل احتمالية التكرار، وفي ذلك فائدة مالية", "When root causes are addressed, recurrence is less likely, which has financial benefit"),),
     L(("بيان مشكلة محدد بوضوح شرط", "A clearly defined problem statement is essential"),
       ("ضم أشخاص لا خبرة لهم في مجال المشكلة يتحدى طرق التفكير الراسخة", "Including people with no experience of the problem area can challenge embedded thinking")),
     [P("rca", "tools", "own"), P("capa", "tools", "rel")],
     B("تحقيق RC-EX-01 في رفض الشحنات للحرارة: ثلاثة مستويات للأسباب، وسؤال «لماذا لم يكشفها فحص المحطة؟» ضمن التحقيق.",
       "Investigation RC-EX-01 into loads rejected for temperature: three levels of cause, and \"why did the plant check not catch it?\" inside the investigation."),
     B("تقرير التحقيق ببيان المشكلة والأدلة والأسباب المثبتة وسبب فشل الضوابط", "The investigation report with problem statement, evidence, proved causes and why the controls failed"), "rca")
tool("dtree", "14.2", B("شجرة القرار", "Decision tree"), "problem", "both", "team", "small", 2, "medium", ["prob"],
     B("نموذج لاستكشاف البدائل وعواقبها المحتملة، للوصول إلى قرار أو حل عبر خطوات محددة. ويعطي عملية موحدة للتعامل مع الأحداث غير المخططة، ويُستخدم في حل النزاعات.",
       "A model to explore alternatives and their possible consequences, reaching a decision or solution through defined steps. It gives a standard process for unplanned events and is also used in dispute resolution."),
     L(("التعامل الموحد مع الأحداث غير المخططة", "Handling unplanned occurrences in a standard way"), ("حل النزاعات", "Dispute resolution")),
     L(("يمكّن من لا يملك خبرة عالية من اتخاذ القرار الأنسب في سيناريو محدد", "Lets people without deep knowledge make the most suitable decision in a given scenario"),),
     L(("ابدأ بالأحداث الأكثر تكراراً", "Prioritize the most frequent events"),),
     [],
     B("شجرة قرار لفني الجودة عند وصول شحنة حرارتها بين 30 و32 °م: قِس مرة ثانية ← إن بقيت فوق 31 أبلغ المهندس ← صب بإضافة مثبط بموافقته.",
       "A decision tree for the QC technician when a load arrives at 30–32 °C: measure again → if still above 31, call the engineer → pour with a retarder on his approval."),
     B("الشجرة المعتمدة في الإجراء، وسجل الحالات التي طُبقت فيها", "The approved tree in the procedure, and a log of cases where it was used"), "")
tool("fta", "14.3", B("تحليل شجرة الأعطال (FTA)", "Fault tree analysis (FTA)"), "problem", "both", "team", "small", 2, "easy", ["prob", "high"],
     B("أداة للتحقيق في أعطال عملية أو نظام: الحدث غير المرغوب في رأس الشجرة، والمكونات والأنظمة والأحداث المعتمدة تحته برموز موحدة تبين نوع الاعتماد، فتظهر نقاط الضعف ومواقعها. وقد تشمل العناصر البشرية والبرمجيات.",
       "A tool to investigate failures of a process or system: the undesired event at the top of the tree, and the dependent components, systems or events beneath it, with standard symbols for the type of dependency, so vulnerabilities and their location show. Human elements and software can be included."),
     L(("فهم علاقات النظام وتقدير موثوقيته الكلية", "Understanding system relationships and estimating overall reliability"),),
     L(("يكشف الاعتماديات ونقاط الضعف والمخاطر", "Reveals dependencies, vulnerabilities and risks"),),
     L(("يجب معرفة بنية النظام بعناصره وعلاقاتها", "The architecture of the system must be known"), ("تقدير الموثوقية الكلية يحتاج مقاييس موثوقية لكل حدث", "An overall reliability figure needs reliability metrics for each event")),
     [P("iso31000", "explain-cl", "rel")],
     B("شجرة أعطال لـ«توقف مضخة الخرسانة أثناء الصب»: عطل هيدروليكي أو انسداد الخرطوم أو نفاد الوقود، ولكل فرع أسبابه.",
       "A fault tree for \"concrete pump stops during the pour\": hydraulic failure, hose blockage or fuel run-out, each branch with its causes."),
     B("الشجرة بالرموز الموحدة ومصادر بيانات الموثوقية", "The tree with standard symbols and the sources of reliability data"), "")
tool("why5", "14.4", B("تحليل لماذا الخمس", "Five whys analysis"), "problem", "both", "team", "any", 1, "easy", ["prob"],
     B("نهج منظم لتحديد الأسباب الفعلية والمحتملة لمشكلة بتكرار «لماذا؟» حتى الوصول إلى سبب جذري. وقد يكون لكل «لماذا» أكثر من جواب فتتفرع المسارات، وتُختبر بالوقائع والبيانات والأدلة.",
       "A structured way to find the actual and potential causes of a problem by asking \"why?\" repeatedly until a root cause is reached. Each \"why\" can have more than one answer, so paths branch; they are tested with facts, data and evidence."),
     L(("ضمن تحليل السبب الجذري", "Inside root cause analysis"), ("لاستكشاف أسباب محتملة إضافية", "To explore further potential causes")),
     L(("بسيط ويدعم تحليلاً شاملاً للقرار", "Simple, and supports a thorough analysis for decisions"),),
     L(("عدد مرات «لماذا» يختلف، وليس خمساً بالضرورة", "The number of whys varies; it is not always five"),
       ("أجرِ تحليلين متوازيين: لماذا حدثت المشكلة، ولماذا لم تُكتشف", "Run it in parallel for why it occurred and why it was not detected")),
     [P("why5", "tools", "own")],
     B("تحليل W5-EX-03: لماذا رُفضت الشحنات؟ الحرارة ← الانتظار عند البوابة ← لا مكان لوقوف الشاحنات ← ... ومسار ثانٍ: لماذا لم يكتشفها فحص المحطة؟",
       "Analysis W5-EX-03: why were loads rejected? temperature → waiting at the gate → no truck standing area → … and a second path: why did the plant check not catch it?"),
     B("سلسلة «لماذا» بدليل لكل خطوة، ومسار الحدوث ومسار عدم الاكتشاف", "The why chain with evidence at each step, for occurrence and for non-detection"), "why5")
tool("fish", "14.5", B("مخطط عظمة السمكة / إيشيكاوا", "Fishbone/Ishikawa diagram"), "problem", "both", "team", "small", 2, "easy", ["prob"],
     B("طريقة لتصوير أسباب حالة أو حدث قيد الدراسة. ومخطط إيشيكاوا للعملية يبين الأسباب في كل خطوة من خطواتها. ويُستخدم في تحليل المشكلات وتحسين العمليات.",
       "A way to picture the causes of a situation or event under study. An Ishikawa process cause-and-effect diagram shows the causes at each step of the process. It is used in problem analysis and process improvement."),
     L(("تحليل المشكلات وتحسين العمليات", "Problem analysis and process improvement"),),
     L(("أداة مرئية سهلة الفهم والتواصل", "A visual tool, easy to understand and communicate"),),
     L(("يمكن أن يحمل المخطط فروعاً بقدر ما يلزم التحليل", "The diagram can have as many branches as the analysis needs"),
       ("الأسباب على العظام فرضيات حتى تُتحقق بالبيانات", "The causes on the bones are hypotheses until checked with data")),
     [P("fish", "tools", "own")],
     B("عظمة السمكة FB-EX-02 لرفض الشحنات: فروع المواد والطريقة والبيئة والقياس، ثم تُحقق سبب «الماء غير المبرد» بالبيانات.",
       "Fishbone FB-EX-02 on rejected loads: materials, method, environment and measurement branches; then the cause \"water not chilled\" was checked with data."),
     B("المخطط بالأسباب المحتملة والمتحقق منها ودليل كل منها", "The diagram with candidate and verified causes and the evidence for each"), "fish")
tool("isnot", "14.6", B("تحليل «ما هو / ما ليس»", "Is/is not analysis"), "problem", "both", "both", "small", 1, "easy", ["prob"],
     B("يساعد على تعريف بيان المشكلة ونطاقها، وهو الخطوة الأولى في حلها: ما هو خطأ، وما ليس خطأ، فمعرفة ما ليس خطأ لا تقل أهمية عن معرفة الخطأ.",
       "Helps define the problem statement and its scope, the first step of problem solving: what is wrong and what is not wrong, because what is not wrong matters as much as what is."),
     L(("أول خطوة في حل أي مشكلة", "The first step of any problem solving"),),
     L(("سهل الفهم ويضيّق مجال المشكلة", "Easy to understand, and narrows the problem area"), ("يوفر الوقت الضائع بسبب بيانات مشكلة ضعيفة", "Saves the time lost to poor problem statements")),
     L(("مخططات التدفق والإجراءات تساعد على هيكلة العملية", "Flow charts, swim lanes or procedures help structure the process"),
       ("مخطط التقارب وخرائط العلاقات والخرائط الذهنية تساعد على تحديد النطاق", "Affinity diagrams, relationship diagrams or mind maps help identify the scope")),
     [P("", "tools", "here"), P("rca", "tools", "rel")],
     B("المشكلة «هي» شحنات المحطة 2 بعد الظهر في الصيف، و«ليست» شحنات المحطة 1 ولا شحنات الصباح، فضاق البحث إلى الانتظار والحرارة.",
       "The problem \"is\" plant 2 loads in summer afternoons and \"is not\" plant 1 loads or morning loads, which narrowed the search to waiting and heat."),
     B("جدول «ما هو / ما ليس» لما وأين ومتى وكم", "An is/is-not table for what, where, when and how much"), "")
# ---------------------------------------------------------------- 15 Improvement
tool("bench", "15.1", B("المقارنة المرجعية", "Benchmarking"), "improve", "both", "both", "large", 2, "medium", ["high"],
     B("مقارنة العمليات أو المنتجات أو الخدمات بأداء منشآت أو وحدات أخرى، لتحديد المخاطر والفرص ودعم التحسين. وأنواعها: مقارنة الأداء (كمية)، ومقارنة الممارسات (نوعية)، والمقارنة الاستراتيجية (التوجه المستقبلي).",
       "Comparing processes, products or services with the performance of other businesses or units, to identify risks and opportunities and support improvement. Types: performance benchmarking (quantitative), practice benchmarking (qualitative) and strategic benchmarking (future direction)."),
     L(("تحديد الفجوات والفرص مقارنة بالأفضل", "Finding gaps and opportunities against the best"),),
     L(("تحسينات ملموسة في وقت قصير نسبياً", "Tangible improvements in a relatively short time"),),
     L(("يُختار الموضوع ويُصمم بعناية وإلا جاءت النتيجة غير مرضية", "Choose and design the topic carefully, or the exercise may disappoint"),),
     [P("exc", "plan", "rel"), P("pmoexc", "results", "rel")],
     B("قارنت الواحة نسبة الشحنات المرفوضة لديها بمقاولين آخرين يعملون مع المحطة نفسها، فوجدت أن الأفضل يطلب الشحنات على دفعات أصغر.",
       "Al-Waha compared its rejected-load rate with other contractors using the same plant and found the best one ordered smaller batches."),
     B("تقرير المقارنة بالمصادر والمقاييس والفجوة والإجراءات", "A benchmarking report with sources, measures, the gap and actions"), "")
tool("affinity", "15.2", B("مخطط التقارب", "Affinity diagram"), "improve", "both", "both", "small", 2, "easy", ["prob"],
     B("أسلوب يصنف أعداداً كبيرة من الأفكار في مجموعات لمراجعتها وتحليلها نحو هدف محدد.",
       "A technique that sorts large numbers of ideas into groups for review and analysis towards a specific objective."),
     L(("بعد العصف الذهني لتنظيم الأفكار", "After brainstorming, to organise the ideas"),),
     L(("أداة بسيطة مرئية تساعد على الوصول إلى خطة عمل", "A simple, visual tool that helps reach an action plan"),),
     L(("النتيجة بقدر جودة أفكار المشاركين", "The result depends on the quality of the participants' ideas"), ("ينظم الأفكار لكنه لا يرتب أولويتها", "It organises ideas but does not prioritize them")),
     [],
     B("صُنفت 42 فكرة من ورشة «تسليم بلا ملاحظات» في خمس مجموعات: التخطيط، والمواد، والتشطيب، والفحص، والتواصل.",
       "42 ideas from the \"handover with no snags\" workshop were sorted into five groups: planning, materials, finishes, inspection and communication."),
     B("المجموعات بعناوينها والأفكار تحت كل منها", "The groups with their headings and the ideas under each"), "")
tool("qcc", "15.3", B("حلقات الجودة", "Quality circles/QC circles"), "improve", "both", "team", "small", 1, "easy", ["eff", "prob"],
     B("مجموعات دراسة لتحسين الجودة من عدد من العاملين في الصف الأول (عشرة أو أقل غالباً) مع مشرفهم، لتحسين استقرار العملية وحل المشكلات بمشاركة من يمارسون النشاط نفسه.",
       "Quality improvement study groups of frontline workers (usually ten or fewer) with their supervisor, to improve process stability, solve problems and build capability through the people who do the work."),
     L(("حل المشكلات اليومية وتحسين القدرة", "Solving everyday problems and building capability"),),
     L(("يعزز العمل الجماعي والتواصل بين الإدارة والعاملين", "Promotes teamwork and communication between managers and the workforce"),
       ("تحسينات صغيرة في الإنتاجية والجودة، وفرصة لتدريب العاملين على الأدوات الأساسية", "Small gains in productivity and quality, and a chance to train staff on basic tools")),
     L(("قد لا يرغب الجميع في المشاركة", "Not everyone may want to take part"),),
     [],
     B("حلقة جودة من فريق الخرسانة في الموقع تجتمع أسبوعياً نصف ساعة، واقترحت مظلة لوقوف الشاحنات.",
       "A quality circle from the site concrete crew meets for half an hour weekly; it proposed a shade for waiting trucks."),
     B("محاضر الحلقة ومقترحاتها وما نُفذ منها", "The circle's minutes, proposals and what was implemented"), "")
tool("brain", "15.4", B("العصف الذهني", "Brainstorming"), "improve", "both", "team", "small", 1, "easy", ["prob", "eff"],
     B("أسلوب لتوليد الأفكار وجمعها نحو هدف محدد بالنظر في الفرص والمخاطر والأساليب، ومن تطبيقاته حل قضية، وفهم مشكلة، وتحديد منتجات أو أسواق جديدة، وتحديد الأسباب المحتملة لعدم المطابقة.",
       "A technique to generate and gather ideas towards a specific objective by considering opportunities, risks or approaches; uses include resolving an issue, understanding a problem, finding new products or markets and identifying potential root causes of nonconformities."),
     L(("توليد الأسباب المحتملة والحلول", "Generating candidate causes and solutions"),),
     L(("يعزز المشاركة وتنوع الأفكار وقد يولد أفكاراً مبتكرة", "Promotes engagement and diverse ideas, and can produce creative ones"),),
     L(("كثرة المشاركين تضعف التفاعل", "Too many participants reduce engagement"), ("ميسّر مدرب مفيد", "A trained facilitator helps"),
       ("أبلغ المشاركين بالقواعد مسبقاً، ومنها عدم نقد الأفكار في البداية", "Brief participants on the rules beforehand, such as no early criticism of ideas")),
     [P("fish", "tools", "in")],
     B("في عظمة السمكة FB-EX-02 جمع الفريق 19 سبباً محتملاً في عشرين دقيقة قبل فرزها على الفروع.",
       "In fishbone FB-EX-02 the team gathered 19 candidate causes in twenty minutes before sorting them on the branches."),
     B("قائمة الأفكار كاملة قبل الفرز، وأسماء المشاركين", "The full list of ideas before sorting, and the participants' names"), "")
tool("hats", "15.5", B("القبعات الست للتفكير", "Six Thinking Hats"), "improve", "both", "team", "small", 2, "medium", ["prob"],
     B("نشاط يتقمص فيه المشاركون ستة منظورات ملونة لتوجيه النقاش وضمان تمثيل وجهات النظر: الوقائع، والنقد الإيجابي، والإبداع والبدائل، والمشاعر والحدس، والنقد السلبي، وإدارة التفكير (الميسّر).",
       "An activity in which participants take on six colour-coded perspectives to guide a discussion and make sure every viewpoint is represented: facts, positive critique, creativity and alternatives, feelings and intuition, negative critique, and managing the thinking (the facilitator)."),
     L(("مناقشة حل أو قرار من زوايا مختلفة", "Discussing a solution or decision from different angles"),),
     L(("يكسر عادات التفكير الراسخة", "Breaks persistent thinking habits"), ("فهم أفضل لوجهات النظر المختلفة ومبرراتها", "Better understanding of different views and their reasons")),
     L(("تنوع الشخصيات في المجموعة يفيد", "Diverse personalities in the group help"), ("تُحترم الأفكار وتُسجل لاستمرار المشاركة", "Respect and record people's ideas to keep them taking part")),
     [],
     B("نوقش مقترح «الصب الليلي صيفاً» بالقبعات الست: الوقائع (الحرارة)، والإيجابيات (جودة)، والسلبيات (السلامة والإضاءة والتكلفة).",
       "The \"night pours in summer\" proposal was discussed with the six hats: facts (temperature), positives (quality), negatives (safety, lighting, cost)."),
     B("محضر النقاش بمخرجات كل منظور والقرار", "Minutes with the output of each perspective and the decision"), "")
# ---------------------------------------------------------------- 16 Families of management tools
tool("sixsigma", "16.1", B("برنامج Six Sigma", "Six Sigma programme"), "variation", "both", "team", "large", 3, "difficult", ["eff", "prob"],
     B("مفهوم إحصائي يقوم على قدرة العملية: انتشار العملية محصور داخل المواصفات فيقترب مستوى العيوب من الصفر حتى مع تحرك المتوسط. وهو أيضاً برنامج منظمي لتحقيق أهداف التحسين بإطار إداري، ويستخدم عادة منهجية مشروع DMAIC (التعريف والقياس والتحليل والتحسين والضبط) مع استثمار في التدريب على الأساليب الإحصائية وغيرها.",
       "A statistical concept based on process capability: the process spread is well inside the specification, so defects stay near zero even when the average shifts. It is also an organizational programme to reach improvement goals within a management framework, usually with the DMAIC project method (define, measure, analyse, improve, control) and investment in training on statistical and other techniques."),
     L(("حل المشكلات وتحسين الجودة والأداء", "Problem solving, quality and performance improvement"), ("خفض زمن الدورة والتكلفة، ومواءمة الموارد مع الأهداف الاستراتيجية", "Cutting cycle time and cost, and aligning resources with strategic goals")),
     L(("قد يحقق قفزات في جودة العمليات والمنتجات والخدمات وأدائها", "Can give quantum gains in the quality and performance of processes, products and services"),
       ("تكلفته يعوضها عادة خفض التكلفة وزيادة الإنتاجية، ويطبق في كل القطاعات", "Its cost is usually offset by lower costs and higher productivity, and it applies to every sector")),
     L(("يحتاج التزام القيادة العليا ومشاركتها", "Needs executive commitment and engagement at the highest level"),
       ("يحتاج استثماراً في التدريب على الإطار والأدوات الإحصائية", "Needs investment in training on the framework and statistical tools"),
       ("نهج منضبط بأهداف ومقاييس نجاح محددة", "A disciplined approach with defined targets and measures of success")),
     [P("dmaic", "tools", "own")],
     B("مشروع DM-EX-01 في الواحة: الأساس 6.0% شحنات مرفوضة، والسبب المثبت بالبيانات «الماء غير المبرد»، والنتيجة بعد التغيير 2.4% مقابل هدف أقل من 3%.",
       "Al-Waha's project DM-EX-01: baseline 6.0 % rejected loads, the cause proved with data \"water not chilled\", and 2.4 % after the change against a goal below 3 %."),
     B("مشاريع DMAIC ببواباتها وتحقق القياس والنتيجة بعد التغيير", "DMAIC projects with their gates, measurement check and after-change result"), "dmaic")
tool("tqm", "16.2", B("إدارة الجودة الشاملة (TQM)", "Total quality management (TQM)"), "variation", "both", "team", "large", 3, "difficult", ["eff"],
     B("تحتاج التزام الإدارة العليا ومشاركة كل الأفراد لتمكين التحسين المستمر ورضا العملاء، وتمتد على المنشأة كلها من حلقات الجودة وكايزن إلى التحسين الاستراتيجي والابتكار. وتشمل الرؤية والرسالة، وتكلفة الجودة، وصوت العميل، وصوت العملية.",
       "Needs top management commitment and the engagement of all people to enable continual improvement and customer satisfaction, across the whole organization, from QC circles and Kaizen to strategic improvement and innovation. It covers vision and mission, cost of quality, voice of the customer and voice of the process."),
     L(("تحول على مستوى المنشأة كلها", "An organization-wide transformation"),),
     L(("تركيز أكبر على العميل ورضاه", "Better customer focus and satisfaction"), ("إسهام أكبر من الموظفين", "Better employee contribution")),
     L(("تحتاج تبنياً على مستوى المنشأة كلها", "It needs organization-wide adoption"), ("يذكرها الجدول C.1 برقم 16.3 بينما رقمها في النص 16.2", "Table C.1 lists it as 16.3, while the text numbers it 16.2")),
     [P("exc", "standard", "rel"), P("kaqa", "standard", "rel")],
     B("تبنت الواحة نموذج التميز EFQM إطاراً شاملاً يربط أدوات الصندوق بالاستراتيجية والنتائج.",
       "Al-Waha adopted the EFQM excellence model as the overall frame that ties the toolbox to strategy and results."),
     B("إطار التحسين الشامل ونتائج التقييم الدوري", "The organization-wide improvement frame and periodic assessment results"), "")

# ---------------------------------------------------------------- other relevant tools (named only, not reviewed)
OTHER = [
    ("5.5", B("مخطط/مصفوفة/سجل سياق المنشأة (COTO)", "Context of the organization (COTO) diagram/matrix/log"), []),
    ("5.5", B("ISO/PAS 24644-1", "ISO/PAS 24644-1"), []),
    ("5.5", B("إطار COSO", "COSO framework"), [P("ccc", "standard", "rel")]),
    ("6.6", B("منهج IDEF0 للنمذجة الوظيفية", "IDEF0 functional modelling"), []),
    ("6.6", B("خطط الجودة (ISO 10005)", "Quality plans (ISO 10005)"), []),
    ("6.6", B("خطة العملية والجودة المتقدمة (APQP)", "Advanced process and quality plan (APQP)"), []),
    ("6.6", B("منهج مسار النجاح (SPM)", "Success path method (SPM)"), []),
    ("7.5", B("منهج مسار النجاح (SPM)", "Success path method (SPM)"), []),
    ("7.5", B("تحليل أنماط الفشل وآثارها وحرجيتها (FMECA)", "FMECA"), []),
    ("7.5", B("FMEA للرصد واستجابة النظام (FMEA-MSR)", "FMEA for monitoring and system response (FMEA-MSR)"), []),
    ("8.4", B("بطاقة الأداء المتوازن (BSC)", "Balanced scorecard (BSC)"), [P("str", "map", "in")]),
    ("9.5", B("تحليل الأعمال المفقودة", "Lost business analysis"), []),
    ("9.5", B("المتسوق الخفي", "Mystery shopper"), []),
    ("9.5", B("استبيانات العملاء ومجموعات التركيز", "Customer surveys and focus groups"), []),
    ("9.5", B("مؤشر المكسب المحتمل في قيمة العميل (PGCV)", "Potential gain in customer value (PGCV) index"), []),
    ("9.5", B("إدارة علاقات العملاء (CRM) وISO 10004", "Customer relationship management (CRM) and ISO 10004"), []),
    ("9.5", B("قوائم التحقق", "Checklists"), [P("aud", "clist", "in")]),
    ("9.5", B("TRIZ", "TRIZ"), []),
    ("10.9", B("تغيير القالب في دقائق (SMED) والصيانة الإنتاجية الشاملة", "SMED and total productive maintenance"), []),
    ("10.9", B("نموذج كرالييك، وMRP، وERP", "Kraljic model, MRP and ERP"), []),
    ("10.9", B("Agile/SCRUM وأتمتة العمليات الروبوتية (RPA)", "Agile/SCRUM and robotic process automation (RPA)"), []),
    ("10.9", B("الموثوقية والإتاحة وقابلية الصيانة", "Reliability – availability – maintainability"), []),
    ("11.3", B("الوارد أولاً يصرف أولاً (FIFO/LIFO)، والجرد الدوري، ودوران المخزون", "FIFO/LIFO, cycle counts and inventory turns"), []),
    ("12.4", B("قوائم التحقق وISO 10014", "Checklists and ISO 10014"), [P("aud", "clist", "in")]),
    ("13.9", B("عملية التحليل الهرمي (AHP) وISO 5725-2", "Analytic hierarchy process (AHP) and ISO 5725-2"), []),
    ("14.7", B("أثر الحل، وتحليل مجال القوى لليوين", "Solution effect and Lewin's force field analysis"), []),
    ("14.7", B("8D ومخططات A3", "8D and A3 charts"), [P("a3", "tools", "own"), P("capa", "tools", "own")]),
    ("14.7", B("مخطط العلاقات (مخططات علاقات الكيانات) والخرائط الذهنية", "Relationship diagram – entity relationship diagrams, and mind mapping"), []),
    ("15.6", B("دورة PDCA", "Plan-Do-Check-Act (PDCA)"), [P("pdca", "tools", "own")]),
    ("15.6", B("نموذج نضج القدرات (CMM)", "Capability maturity model (CMM)"), [P("pmo", "assess", "rel"), P("oec", "pmat", "rel")]),
    ("15.6", B("أنظمة الاقتراحات، ومخطط PICK، وطريقة كروفورد وتقنيات SCRUM", "Suggestion schemes, PICK chart, Crawford slip method and SCRUM techniques"), []),
    ("15.6", B("مصفوفة BCG ومخطط الشلال", "BCG matrix and waterfall chart"), []),
    ("16.3", B("نظام تويوتا للإنتاج (TPS) وتصميم العمل الديناميكي (DWD)", "Toyota Production System (TPS) and dynamic work design (DWD)"), []),
]

# ---------------------------------------------------------------- Annex A placement for each reviewed tool
CODES = [t["c"] for t in T]
RANGES = {"R:13.1-14.6": [c for c in CODES if c.split(".")[0] in ("13", "14")],
          "R:13.1-13.6": [c for c in CODES if c.startswith("13.") and int(c.split(".")[1]) <= 6],
          "R:13.1-13.7": [c for c in CODES if c.startswith("13.") and int(c.split(".")[1]) <= 7]}
for t in T:
    t["pdca"] = {}
    for ctx, phases in ANNEX_A.items():
        out = []
        for ph, lst in phases.items():
            direct = t["c"] in lst
            ranged = any(x.startswith("R:") and t["c"] in RANGES[x] for x in lst)
            if direct or ranged:
                out.append(ph if direct else ph + "*")
        t["pdca"][ctx] = out

assert len(T) == 53, len(T)
assert len(set(t["id"] for t in T)) == 53
assert len(set(t["c"] for t in T)) == 53

# hub keys and file names the platform links use (the host turns them into overlay or new-tab links)
FILES = {"pdca": "pdca.html", "capa": "capa.html", "why5": "five-whys.html", "fish": "fishbone.html", "pareto": "pareto.html", "rca": "rca.html",
         "a3": "a3.html", "dmaic": "dmaic.html", "fmea": "fmea.html", "swot": "swot.html", "pestle": "pestle.html", "str": "strategy-performance.html", "oec": "operations-excellence.html",
         "iso31000": "iso31000-risk-studio.html", "w8": "executive-cockpit-workspace.html", "aud": "smart-audit-improvement.html",
         "exc": "excellence-efqm.html", "iso21500": "iso21500.html", "iso37000": "iso37000-governance.html", "pmo": "pmo-maturity.html",
         "pmoexc": "pmo-excellence.html", "ccc": "compliance-anti-bribery.html", "kaqa": "kaqa.html"}
NAMES = {"pdca": B("دورة PDCA", "PDCA cycle"), "capa": B("الإجراءات التصحيحية CAPA", "CAPA"), "why5": B("لماذا الخمس", "5 Whys"),
         "fish": B("عظمة السمكة", "Fishbone"), "pareto": B("باريتو", "Pareto"), "rca": B("تحليل السبب الجذري", "Root cause analysis"),
         "a3": B("حل المشكلات A3", "A3 problem solving"), "dmaic": B("مشروع DMAIC", "DMAIC project"), "fmea": B("دراسة FMEA", "FMEA study"), "swot": B("دراسة SWOT", "SWOT study"), "pestle": B("مسح PESTLE", "PESTLE scan"),
         "str": B("استوديو الاستراتيجية والأداء", "Strategy & Performance Studio"), "oec": B("مركز التميز التشغيلي", "Operations Excellence Center"),
         "iso31000": B("استوديو المخاطر ISO 31000", "ISO 31000 Risk Studio"), "w8": B("قمرة القيادة التنفيذية", "Executive Cockpit"),
         "aud": B("التدقيق الذكي والتحسين", "Smart Audit & Improvement"), "exc": B("التميز المؤسسي EFQM", "EFQM Excellence"),
         "iso21500": B("إدارة المشاريع ISO 21500", "ISO 21500 project management"), "iso37000": B("الحوكمة ISO 37000", "ISO 37000 governance"),
         "pmo": B("نضج مكتب المشاريع", "PMO maturity"), "pmoexc": B("تميز مكتب المشاريع", "PMO excellence"),
         "ccc": B("الامتثال ومكافحة الرشوة", "Compliance & anti-bribery"), "kaqa": B("جائزة الملك عبدالعزيز للجودة", "King Abdulaziz Quality Award")}
# toolbox tools whose records this guide can read (read-only) to link a storyboard step
REC_KEYS = {"pdca": "cia-pdca:v1", "capa": "cia-capa:v1", "why5": "cia-why5:v1", "fish": "cia-fish:v1", "pareto": "cia-pareto:v1",
            "rca": "cia-rca:v1", "a3": "cia-a3:v1", "dmaic": "cia-dmaic:v1", "fmea": "cia-fmea:v1"}
NAV = {"why5": "cia-nav:five-whys", "fish": "cia-nav:fishbone", "pareto": "cia-nav:pareto", "rca": "cia-nav:rca", "a3": "cia-nav:a3", "dmaic": "cia-nav:dmaic", "fmea": "cia-nav:fmea"}

for t in T:
    for p in t["plat"]:
        assert p["lvl"] in ("own", "in", "here", "rel", "plan"), p
        assert p["k"] == "" or p["k"] in FILES, p
    assert t["own"] == "" or t["own"] in REC_KEYS, t["id"]
for o in OTHER:
    for p in o[2]:
        assert p["k"] in FILES


def level(t):
    """the best platform level of a tool, in the order own > in > here > rel > plan > none"""
    order = ["own", "in", "here", "rel", "plan"]
    ls = [p["lvl"] for p in t["plat"]]
    for x in order:
        if x in ls:
            return x
    return "none"


for t in T:
    t["lv"] = level(t)

# step 10.1 (2026-10-16): the full card of each tool and the explanation of each other relevant tool (cards_10009.py)
import cards_10009 as CX  # noqa: E402
CX.merge(T, OTHER)
