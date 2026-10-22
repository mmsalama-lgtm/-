"""Step 10.1 (2026-10-16): the clause-by-clause explanation of ISO 10009:2024 in modules/iso10009.html. Single source for the parts the
catalogue (cat_10009.py) did not hold yet; cat_10009.py imports it and the build carries everything into `const QT=...`:
  CARDS     — for each of the 53 tools: when not to use it, inputs, 5–8 steps, common mistakes, what an auditor asks to see, the tools
              usually before and after it (cards_10009_a.py, _b.py, _c.py);
  CLX       — for clauses 5–16: what the family of tools is for and when to start there;
  OTX       — a one-line explanation of each "other relevant tool" (same order as cat_10009.OTHER);
  FRONT     — clauses 1–4: the four aims of clause 1 a)–d) with an example each, clause 2, the terms the platform uses with their
              ISO 9000:2026 numbers (checked by OCR of ISO 9000-2026.pdf on 2026-10-16), clause 4 and how to read a tool entry;
  ANNEXB    — the three storyboard figures of Annex B (summarised) and how to build a storyboard;
  QUIZ      — three multiple-choice questions for each of clauses 5–16 (36), with the reason for the answer;
  PATHS     — five learning paths of 4–8 tools.
Checked on 2026-10-16 against ISO-10009-2024-Quality-Management-Guidance-for-Quality-Tools.pdf (BS ISO 10009:2024, first edition 2024-06),
ISO_9001_2026en 1.pdf and ISO 9000-2026.pdf (OCR). Everything is an interpretive summary or the author's guidance in independent wording,
not the text of the standard; the mapping of ISO 10009 clauses to ISO 9001:2026 clauses is the author's (the standard says only that
the tools follow the sequence of ISO 9001 approximately, 4.1). Examples use the fictitious Al-Waha Contracting."""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from cards_10009_a import CARDS, B, L  # noqa: E402
import cards_10009_b  # noqa: E402,F401
import cards_10009_c  # noqa: E402,F401

CLX = {
    "5": (B("أدوات تحليل السياق الخارجي والداخلي ووضع الاتجاه: لماذا نوجد، وما الذي يحيط بنا، وأين نتجه.", "Tools to analyse the external and internal context and set direction: why we exist, what surrounds us, and where we are heading."),
          B("ابدأ هنا عند إعداد الخطة الاستراتيجية أو مراجعتها، أو حين يتغير السوق أو التشريع تغيراً كبيراً.", "Start here when the strategic plan is prepared or reviewed, or when the market or the law changes a lot.")),
    "6": (B("أدوات تعريف العمليات وتسلسلها ومسؤولياتها وضوابطها.", "Tools to define processes, their sequence, responsibilities and controls."),
          B("ابدأ هنا قبل تحسين أي عملية: لا تُحسَّن عملية لم تُرسم.", "Start here before improving any process: a process that is not mapped cannot be improved.")),
    "7": (B("أدوات تحديد المخاطر والفرص وتحليلها وترتيبها وعرضها.", "Tools to identify, analyse, rank and display risks and opportunities."),
          B("ابدأ هنا عند التخطيط لعملية أو تغيير جديد، أو بعد فشل لم يكن متوقعاً.", "Start here when planning a new process or change, or after an unexpected failure.")),
    "8": (B("أدوات وضع الأهداف وتتاليها ومتابعتها.", "Tools to set, cascade and follow objectives."),
          B("ابدأ هنا بعد الاتفاق على الاستراتيجية، لتحويلها إلى أهداف ومسؤوليات.", "Start here once the strategy is agreed, to turn it into objectives and responsibilities.")),
    "9": (B("أدوات فهم ما يريده العميل وما يدركه، وتحويله إلى خصائص وقرارات.", "Tools to understand what the customer wants and perceives, and turn it into characteristics and decisions."),
          B("ابدأ هنا عند تصميم منتج أو خدمة، أو حين تتراجع ملاحظات العملاء.", "Start here when designing a product or service, or when customer feedback falls.")),
    "10": (B("أدوات تحسين تدفق العمليات وإنتاجيتها وإزالة الهدر.", "Tools to improve process flow and productivity and remove waste."),
           B("ابدأ هنا حين تطول المهلة أو يكثر الانتظار أو تنخفض إنتاجية المعدات.", "Start here when lead times grow, waiting piles up or equipment productivity falls.")),
    "11": (B("أدوات ضبط المخزون وتدفق المواد.", "Tools to control inventory and the flow of materials."),
           B("ابدأ هنا حين يتكدس المخزون أو تنفد المواد.", "Start here when stock piles up or materials run out.")),
    "12": (B("أدوات منع الأخطاء وكشفها مبكراً وقياس تكلفة الجودة.", "Tools to prevent errors, detect them early and measure the cost of quality."),
           B("ابدأ هنا حين يتكرر الخطأ نفسه أو ترتفع تكلفة الفشل.", "Start here when the same error repeats or failure costs rise.")),
    "13": (B("أدوات رسم البيانات وضبط العمليات والتحقق من القياس.", "Tools to chart data, control processes and check measurement."),
           B("ابدأ هنا قبل أي قرار مبني على أرقام: ارسم البيانات وتحقق من القياس.", "Start here before any decision based on numbers: chart the data and check the measurement.")),
    "14": (B("أدوات تحليل المشكلات وإيجاد أسبابها الجذرية لدعم الإجراء التصحيحي.", "Tools to analyse problems and find their root causes to support corrective action."),
           B("ابدأ هنا بعد عدم مطابقة أو شكوى أو حادث.", "Start here after a nonconformity, a complaint or an incident.")),
    "15": (B("أدوات توليد الأفكار والتعلم من الآخرين وإشراك الفرق في التحسين.", "Tools to generate ideas, learn from others and engage teams in improvement."),
           B("ابدأ هنا حين تحتاج أفكاراً أو مقارنة بالأفضل أو مشاركة أوسع.", "Start here when you need ideas, a comparison with the best, or wider engagement.")),
    "16": (B("عائلات أدوات على مستوى البرنامج أو المنشأة كلها.", "Families of tools at programme or organization level."),
           B("ابدأ هنا حين تريد إطاراً منظماً يجمع الأدوات في برنامج تحسين.", "Start here when you want a structured frame that brings the tools into an improvement programme.")),
}

# one line per "other relevant tool" entry of cat_10009.OTHER, in the same order
OTX = [
    B("مخطط أو سجل يجمع القضايا الداخلية والخارجية والأطراف المعنية في مكان واحد.", "A diagram or log that keeps internal and external issues and interested parties in one place."),
    B("مواصفة متاحة للعموم يذكرها المعيار بالاسم دون وصف؛ غير مرفوعة: «غير متحقق منها».", "A publicly available specification the standard names without a description; not uploaded: \"not verified\"."),
    B("إطار للرقابة الداخلية وإدارة المخاطر يعرضه الشكل 1 في المعيار.", "A framework for internal control and risk management, shown in Figure 1 of the standard."),
    B("طريقة نمذجة تصف القرارات والأفعال والأنشطة كصناديق بمدخلاتها ومخرجاتها وضوابطها وآلياتها.", "A modelling method that describes decisions, actions and activities as boxes with inputs, outputs, controls and mechanisms."),
    B("خطة تحدد ما يُطبق من إجراءات وموارد على منتج أو مشروع محدد؛ ISO 10005 غير مرفوعة.", "A plan that sets the procedures and resources applied to a specific product or project; ISO 10005 is not uploaded."),
    B("تخطيط مرحلي لجودة العملية والمنتج قبل الإطلاق، شائع في صناعة السيارات.", "Phased planning of process and product quality before launch, common in the automotive industry."),
    B("منهج يرسم المسار من الوضع الحالي إلى النجاح المنشود بخطوات وشروط.", "A method that maps the path from the current state to the desired success, with steps and conditions."),
    B("المنهج نفسه مذكور أيضاً بين أدوات المخاطر.", "The same method, also named among the risk tools."),
    B("FMEA مع تقدير الحرجية لترتيب أنماط الفشل.", "FMEA with a criticality rating to rank the failure modes."),
    B("FMEA لأنظمة الرصد وكيف يستجيب النظام لاكتشاف العطل.", "FMEA for monitoring systems and how the system responds when a fault is detected."),
    B("بطاقة تربط الأهداف بأربعة منظورات: المالي والعميل والعمليات والتعلم.", "A scorecard that links objectives across four perspectives: financial, customer, process and learning."),
    B("تحليل أسباب خسارة العملاء أو العروض.", "An analysis of why customers or bids were lost."),
    B("زيارة متخفية تقيس تجربة العميل كما يعيشها.", "An undercover visit that measures the customer experience as lived."),
    B("أسئلة منظمة أو نقاش موجه لجمع آراء العملاء.", "Structured questions or a guided discussion to collect customer views."),
    B("مؤشر يقدّر المكسب المحتمل من تحسين ما يقدّره العميل.", "An index that estimates the potential gain from improving what the customer values."),
    B("إدارة العلاقة مع العميل وبياناته؛ وISO 10004 إرشادات رصد رضا العملاء (غير مرفوعة).", "Managing the customer relationship and its data; ISO 10004 gives guidance on monitoring satisfaction (not uploaded)."),
    B("قوائم أسئلة أو بنود ثابتة تضمن ألا يُنسى شيء.", "Fixed lists of questions or items so nothing is forgotten."),
    B("منهج لحل المشكلات الابتكاري بمبادئ مستخلصة من براءات الاختراع.", "A method for inventive problem solving based on principles drawn from patents."),
    B("خفض زمن تغيير القوالب، وصيانة شاملة يشارك فيها المشغلون.", "Cutting die-change time, and maintenance that involves the operators."),
    B("تصنيف المشتريات بالمخاطر والأثر، وتخطيط المواد وموارد المنشأة.", "Classifying purchases by risk and impact, and planning materials and enterprise resources."),
    B("إدارة العمل بدورات قصيرة، وأتمتة المهام المتكررة بالبرمجيات.", "Managing work in short cycles, and automating repetitive tasks with software."),
    B("هندسة الموثوقية والإتاحة وقابلية الصيانة للمعدات والأنظمة.", "Reliability, availability and maintainability engineering for equipment and systems."),
    B("قواعد صرف المخزون، والجرد الدوري، ومعدل دورانه.", "Stock issue rules, cycle counting and inventory turnover."),
    B("قوائم الفحص، وISO 10014 التي يذكرها المعيار بالاسم فقط (غير مرفوعة: «غير متحقق منها»).", "Checklists, and ISO 10014, which the standard names only (not uploaded: \"not verified\")."),
    B("ترتيب البدائل بمقارنات زوجية، وISO 5725-2 لدقة طرق القياس (غير مرفوعة).", "Ranking options by pairwise comparison, and ISO 5725-2 on the precision of measurement methods (not uploaded)."),
    B("فحص أثر الحل قبل اعتماده، وتحليل القوى الدافعة والمعيقة للتغيير.", "Checking a solution's effect before adopting it, and analysing the forces for and against a change."),
    B("منهجا حل مشكلات في صفحة أو ثماني خطوات؛ وكلاهما على المنصة.", "Problem-solving methods on one page or in eight disciplines; both are on the platform."),
    B("مخطط يربط العناصر وعلاقاتها، وخريطة ذهنية لتنظيم الأفكار حول موضوع.", "A diagram linking elements and their relationships, and a mind map to organize ideas around a topic."),
    B("دورة الخطة والتنفيذ والتحقق والتصرف؛ أداة مستقلة على المنصة.", "The Plan-Do-Check-Act cycle; a dedicated tool on the platform."),
    B("نموذج يقيس نضج العمليات بمستويات متتالية.", "A model that measures process maturity in successive levels."),
    B("جمع اقتراحات الموظفين وترتيبها بالأثر والجهد (مخطط PICK)، وجمع الأفكار كتابياً على بطاقات (كروفورد)، وتقنيات SCRUM.", "Collecting staff suggestions and sorting them by payoff and effort (PICK chart), collecting ideas in writing on slips (Crawford), and SCRUM techniques."),
    B("مصفوفة لتقييم محفظة المنتجات، ومخطط يوضح تراكم الزيادات والنقصان.", "A matrix to assess a product portfolio, and a chart that shows how increases and decreases add up."),
    B("نظام الإنتاج الرشيد الأصلي، وتصميم العمل المتغير مع الطلب.", "The original lean production system, and work design that adapts to demand."),
]

FRONT = {
    "aims": [
        (B("توصيف عملية أو متغير", "Characterize a process or a variable"), B("قياس زمن اعتماد المخططات ورسم توزيعه بمخطط الصندوق.", "Measuring drawing approval time and charting its spread with a box plot.")),
        (B("تسهيل حل المشكلات", "Facilitate problem solving"), B("تحقيق RCA في سبب رفض شحنات الخرسانة.", "An RCA investigation into why concrete loads were rejected.")),
        (B("إبراز مجالات التحسين", "Highlight areas for improvement"), B("باريتو لأسباب إعادة العمل يبيّن أن القوالب سبب أغلبها.", "A Pareto of rework causes showing that formwork causes most of it.")),
        (B("تحسين الفعالية", "Improve effectiveness"), B("مصفوفة RACI تزيل التداخل في اعتماد المواد.", "A RACI matrix that removes overlaps in material approvals.")),
    ],
    "c1": B("ملخص تفسيري: يقدّم المعيار إرشادات لاختيار الأدوات وتطبيقها في نظام إدارة الجودة لأربعة أغراض (البند 1 أ–د). وهو إرشادات (ينبغي) لا متطلبات، وغير قابل للإشهاد، ولا يجعل أي أداة إلزامية.",
            "Interpretive summary: the standard gives guidance on selecting and applying tools in a quality management system for four aims (clause 1 a–d). It is guidance (should), not requirements, it is not certifiable, and it makes no tool mandatory."),
    "c2": B("ملخص تفسيري: المرجع المعياري الوحيد ISO 9000 (الأسس والمفردات).", "Interpretive summary: the only normative reference is ISO 9000 (fundamentals and vocabulary)."),
    "c3": B("ملخص تفسيري: تنطبق مصطلحات ISO 9000 ويُضاف مصطلح واحد: أداة الجودة (3.1) ومرادفها تقنية الجودة: طريقة أو إجراء لأداء عملية تحقق هدف جودة.", "Interpretive summary: ISO 9000 terms apply, plus one term: quality tool (3.1), also quality technique: a method or procedure to perform an operation that achieves a quality objective."),
    "terms": [("3.3.1", B("العملية", "Process")), ("3.3.4", B("نهج العمليات", "Process approach")), ("3.2.3", B("التحسين", "Improvement")), ("3.1.12", B("التحسين المستمر", "Continual improvement")),
              ("3.2.4", B("الممارسة الجيدة", "Good practice")), ("3.2.5", B("المقارنة المرجعية", "Benchmarking")), ("3.7.2", B("الخطر", "Risk")), ("3.7.12", B("هدف الجودة", "Quality objective")),
              ("3.7.17", B("الفعالية", "Effectiveness")), ("3.5.13", B("عدم المطابقة", "Nonconformity")), ("3.6.4", B("الإجراء التصحيحي", "Corrective action")), ("3.8.3", B("الأسلوب الإحصائي", "Statistical technique")),
              ("3.8.6", B("الدليل الموضوعي", "Objective evidence")), ("3.9.13", B("رضا العملاء", "Customer satisfaction")), ("3.10.2", B("الخاصية النوعية", "Quality characteristic")), ("3.11.4", B("القياس", "Measurement"))],
    "c4": B("ملخص تفسيري: رُتبت الأدوات بالتوافق التقريبي مع تسلسل متطلبات ISO 9001 دون أن يعني الترتيب أولوية (4.1). ولكل أداة كثيرة الاستخدام شرح قصير، وطريقة الاستخدام، وأسباب استخدامها وإرشادات فعاليتها في جدول الفوائد ونقاط الانتباه، وفي آخر كل بند «أدوات أخرى ذات صلة» بالاسم فقط (4.2). ويعرض الملحق A الأدوات على دورة PDCA، والملحق B لوحات القصة، والملحق C سمات الأدوات.",
            "Interpretive summary: the tools are arranged in approximate alignment with the sequence of the ISO 9001 requirements, and the order implies no priority (4.1). Each frequently used tool has a short explanation, how it is used, and the reasons to use it with guidance in a table of benefits and points to note; each clause ends with \"other relevant tools\" named only (4.2). Annex A places the tools on the PDCA cycle, Annex B gives storyboards, and Annex C the attributes of the tools."),
    "read": L(("ابدأ بالغرض: ماذا تريد أن تعرف أو تحل أو تحسّن؟", "Start with the aim: what do you want to understand, solve or improve?"),
              ("اقرأ «متى تُستخدم» و«متى لا تُستخدم»", "Read \"when to use\" and \"when not to use\""),
              ("انظر إلى السمات: فريق أم فرد، البيانات، القدرة بالنقاط، الجهد", "Look at the attributes: team or individual, data, capability in dots, effort"),
              ("انظر إلى مرحلة PDCA في الملحق A", "Look at the PDCA phase in Annex A"),
              ("اتبع الخطوات واحفظ السجل المذكور", "Follow the steps and keep the record named"),
              ("افتح الأداة على المنصة إن وُجدت", "Open the tool on the platform if it exists")),
    "front": B("المقدمة: الأدوات جزء أساسي من نظام إدارة الجودة، والمعيار يعرّف بمجموعة منها ويساعد في اختيار المناسب للمهمة؛ والأساليب الإحصائية في معيار مستقل هو ISO 10017 (غير مرفوع).",
               "Introduction: tools are an integral part of a QMS; the standard introduces a range of them and helps select the right one for the task; statistical techniques are in a separate standard, ISO 10017 (not uploaded)."),
}

ANNEXB = {
    "figs": [("B.1", B("الاستراتيجية وعملية الأعمال على دورة PDCA: «خطة على صفحة»", "Strategy and business process on the PDCA cycle: \"plan on a page\""),
              B("لوحة تبدأ بالسياق والرؤية، ثم الأهداف والمبادرات، ثم المتابعة بالمؤشرات، ثم التعديل.", "A board that starts from context and vision, then objectives and initiatives, then follow-up by indicators, then adjustment.")),
             ("B.2", B("تحسين عملية بتسلسل PDCA المرجح", "Process improvement in the likely PDCA sequence"),
              B("لوحة تمر من تعريف المشكلة ورسم العملية إلى تحليل الأسباب والحل والتثبيت.", "A board that goes from defining the problem and mapping the process to analysing causes, solving and holding the gain.")),
             ("B.3", B("التحسين المستمر على لوحة PDCA", "Continuous improvement on a PDCA storyboard"),
              B("لوحة دورة تحسين متكررة بأدوات الأفكار والقياس والتوحيد.", "A board of a repeated improvement cycle with idea, measurement and standardization tools."))],
    "how": L(("اكتب المشكلة أو الغرض في رأس اللوحة", "Write the problem or aim at the top of the board"),
             ("اختر أدوات كل مرحلة من الملحق A", "Pick the tools of each phase from Annex A"),
             ("لكل خطوة: لماذا هذه الأداة، وما مخرجها، ومن نفذها", "For each step: why this tool, what it produced, who did it"),
             ("اربط كل خطوة بسجلها على المنصة", "Link each step to its record on the platform"),
             ("اكتب النتيجة مقابل الغرض وما وُحِّد", "Write the result against the aim and what was standardized"),
             ("راجع اللوحة بعد آخر خطوة", "Review the board after the last step")),
}

# three questions per clause 5–16: [question, [options], correct index, reason]
def Q(q, opts, ok, why):
    return {"q": B(*q), "o": [B(*o) for o in opts], "ok": ok, "why": B(*why)}


QUIZ = {
    "5": [Q(("من يجري تحليل SWOT حسب نقاط الانتباه؟", "Who should carry out a SWOT, per the points to note?"), [("شخص واحد خبير", "One expert"), ("فريق القيادة بمدخلات خارجية", "The leadership team with outside input"), ("المدقق الخارجي", "The external auditor")], 1, ("تنوع وجهات النظر شرط، ولا يجريه شخص واحد.", "Diversity of views is a condition; not a single person.")),
          Q(("PESTLE يحلل…", "PESTLE analyses…"), [("البيئة الخارجية", "The external environment"), ("نقاط القوة الداخلية", "Internal strengths"), ("رضا العملاء", "Customer satisfaction")], 0, ("عوامل سياسية واقتصادية واجتماعية وتقنية وقانونية وبيئية خارجية.", "External political, economic, social, technological, legal and environmental factors.")),
          Q(("القوة السادسة المضافة إلى نموذج بورتر هي…", "The sixth force added to Porter's model is…"), [("المكمِّلون", "Complementors"), ("الحكومة", "Government"), ("الموظفون", "Employees")], 0, ("أضيف المكمِّلون إلى القوى الخمس الأصلية.", "Complementors were added to the original five."))],
    "6": [Q(("SIPOC تبدأ عادة بـ…", "A SIPOC usually starts with…"), [("تفاصيل كل خطوة", "The detail of each step"), ("تحديد بداية العملية ونهايتها وخطواتها الرئيسية", "Setting the start, end and main steps of the process"), ("قائمة المخاطر", "The list of risks")], 1, ("SIPOC نظرة عالية المستوى بأربع إلى خمس خطوات.", "SIPOC is a high-level view with four to five key steps.")),
          Q(("مدخل شائع لخطة الضبط هو…", "A common input to a control plan is…"), [("FMEA العملية", "The process FMEA"), ("تحليل SWOT", "A SWOT analysis"), ("بيان الرسالة", "The mission statement")], 0, ("الخصائص الخاصة تأتي غالباً من FMEA العملية.", "Special characteristics often come from the process FMEA.")),
          Q(("في مصفوفة RACI كم مساءلاً لكل نشاط؟", "In a RACI matrix, how many accountable per activity?"), [("واحد", "One"), ("اثنان", "Two"), ("كل الفريق", "The whole team")], 0, ("مساءل واحد يزيل الغموض.", "One accountable removes ambiguity."))],
    "7": [Q(("SWIFT تُستخدم غالباً…", "SWIFT is often used…"), [("بعد FMEA", "After FMEA"), ("مرحلةً أولى قبل الطرق التفصيلية مثل FMEA", "As a first stage before detailed methods such as FMEA"), ("بدل سجل المخاطر", "Instead of a risk register")], 1, ("SWIFT عالية المستوى وتفرز قبل التفصيل.", "SWIFT is high-level and screens before detail.")),
          Q(("في FMEA الخطورة…", "In FMEA, severity…"), [("تنخفض بإضافة فحص", "Falls when a check is added"), ("لا تنخفض إلا بتغيير التصميم", "Falls only with a design change"), ("تساوي رقم الأولوية", "Equals the priority number")], 1, ("الخطورة لا تُخفض، بل تُزال بالتصميم.", "Severity is not reduced; it is designed out.")),
          Q(("خريطة الحرارة تحتاج قبل كل شيء…", "A heat map first needs…"), [("ألواناً جذابة", "Attractive colours"), ("حدوداً مكتوبة لكل لون", "Written limits for each colour"), ("برنامجاً خاصاً", "Special software")], 1, ("الألوان بلا حدود مكتوبة تضلل.", "Colours with no written limits mislead."))],
    "8": [Q(("كايزن يعني…", "Kaizen means…"), [("تحسينات صغيرة مستمرة", "Small, continuous improvements"), ("مشروعاً كبيراً واحداً", "One large project"), ("تقييم الموظفين", "Staff appraisal")], 0, ("تحسين تدريجي بمشاركة الجميع.", "Gradual improvement with everyone's engagement.")),
          Q(("هوشين كانري يُعرف أيضاً بـ…", "Hoshin Kanri is also known as…"), [("المصفوفة X", "The X-matrix"), ("بيت الجودة", "The house of quality"), ("مخطط السلحفاة", "The turtle diagram")], 0, ("المعيار يسميه «المصفوفة X» أيضاً.", "The standard also calls it the \"X-matrix\".")),
          Q(("أهداف الإدارة بالأهداف تُكتب…", "MBO objectives are written…"), [("بالاتفاق وقابلة للقياس", "By agreement and measurable"), ("من الإدارة وحدها", "By management alone"), ("دون موعد", "With no date")], 0, ("الاتفاق والقياس أساس المنهج.", "Agreement and measurement are the basis of the method."))],
    "9": [Q(("صافي نقاط الترويج = …", "Net promoter score = …"), [("نسبة المروّجين ناقص نسبة المنتقدين", "% promoters minus % detractors"), ("متوسط الدرجات", "The average score"), ("عدد الشكاوى", "The number of complaints")], 0, ("المروّجون 9–10 والمنتقدون 0–6.", "Promoters 9–10, detractors 0–6.")),
          Q(("في نموذج كانو، الخاصية الأساسية…", "In the Kano model, a basic feature…"), [("تُبهج العميل إذا وُجدت", "Delights the customer when present"), ("تُغضبه إذا غابت ولا تُرضيه كثيراً إذا وُجدت", "Upsets when absent and adds little when present"), ("لا أثر لها", "Has no effect")], 1, ("الأساسية متوقعة؛ غيابها يسبب عدم الرضا.", "Basics are expected; their absence causes dissatisfaction.")),
          Q(("QFD تربط…", "QFD links…"), [("احتياجات العميل بالخصائص الفنية", "Customer needs to technical characteristics"), ("المخزون بالطلب", "Stock to demand"), ("الأدوار بالمسؤوليات", "Roles to responsibilities")], 0, ("بيت الجودة يترجم صوت العميل.", "The house of quality translates the voice of the customer."))],
    "10": [Q(("في نظرية القيود، أول خطوة…", "In the theory of constraints, the first step is…"), [("تحديد القيد", "Identify the constraint"), ("شراء معدات", "Buy equipment"), ("تقليل العمالة", "Cut staff")], 0, ("القيد يحدد إنتاجية النظام كله.", "The constraint sets the throughput of the whole system.")),
           Q(("OEE حاصل ضرب…", "OEE is the product of…"), [("الإتاحة والأداء والجودة", "Availability, performance and quality"), ("التكلفة والوقت", "Cost and time"), ("الطلب والمخزون", "Demand and stock")], 0, ("ثلاثة عوامل مضروبة.", "Three factors multiplied.")),
           Q(("الخطوة الخامسة في 5S…", "The fifth S is…"), [("الاستدامة", "Sustain"), ("التنظيف", "Shine"), ("الفرز", "Sort")], 0, ("الاستدامة تحافظ على المكتسب بالتدقيق.", "Sustain keeps the gain through audits."))],
    "11": [Q(("كانبان نظام…", "Kanban is a … system"), [("سحب", "Pull"), ("دفع", "Push"), ("تقييم", "Appraisal")], 0, ("يُنتج أو يُورَّد عند الإشارة فقط.", "Produce or supply only on a signal.")),
           Q(("خطر JIT الأكبر…", "The biggest JIT risk is…"), [("مورد غير موثوق", "An unreliable supplier"), ("كثرة البطاقات", "Too many cards"), ("الرسوم البيانية", "Charts")], 0, ("مخزون منخفض مع مورد متقلب يوقف العمل.", "Low stock with an erratic supplier stops work.")),
           Q(("FIFO يعني…", "FIFO means…"), [("الوارد أولاً يُصرف أولاً", "First in, first out"), ("الأقرب أولاً", "Nearest first"), ("الأغلى أولاً", "Most expensive first")], 0, ("قاعدة صرف تحفظ المواد من التقادم.", "An issue rule that keeps materials from ageing."))],
    "12": [Q(("بوكا يوكا تعني…", "Poka-yoke means…"), [("منع الخطأ بالتصميم", "Error proofing by design"), ("تدريب إضافي", "More training"), ("تحذير شفهي", "A verbal warning")], 0, ("تجعل الخطأ مستحيلاً أو مكشوفاً فوراً.", "Makes the error impossible or detected at once.")),
           Q(("فئات تكلفة الجودة…", "The cost of quality categories are…"), [("الوقاية والتقييم والفشل الداخلي والخارجي", "Prevention, appraisal, internal and external failure"), ("المواد والعمالة", "Materials and labour"), ("الثابتة والمتغيرة", "Fixed and variable")], 0, ("أربع فئات.", "Four categories.")),
           Q(("الوسيلة المرئية الجيدة…", "A good visual aid is…"), [("بسيطة وفي مكان القرار", "Simple and where the decision is made"), ("طويلة ومفصلة", "Long and detailed"), ("في مكتب المدير", "In the manager's office")], 0, ("تُفهم من بعيد حيث تُستخدم.", "Read at a distance, where it is used."))],
    "13": [Q(("قبل الثقة بقياس متكرر نجري…", "Before trusting a repeated measurement we run…"), [("GR&R", "GR&R"), ("مخططاً دائرياً", "A pie chart"), ("SWOT", "SWOT")], 0, ("GR&R يقيس تباين نظام القياس.", "GR&R measures measurement system variation.")),
           Q(("باريتو يرتب الفئات…", "Pareto sorts the categories…"), [("تنازلياً مع خط تراكمي", "In descending order with a cumulative line"), ("أبجدياً", "Alphabetically"), ("زمنياً", "By time")], 0, ("لتحديد القلة الحيوية.", "To find the vital few.")),
           Q(("مخطط الصندوق يُظهر…", "A box plot shows…"), [("الوسيط والربيعين والقيم الشاذة", "The median, quartiles and outliers"), ("النسب فقط", "Shares only"), ("التسلسل الزمني", "The time sequence")], 0, ("يقارن التوزيع بين المجموعات.", "It compares distributions between groups."))],
    "14": [Q(("لماذا الخمس تتوقف عند…", "5 Whys stops at…"), [("سبب يمكن العمل عليه في العملية", "A cause that can be acted on in the process"), ("الشخص المخطئ", "The person who made the error"), ("السؤال الخامس دائماً", "Always the fifth question")], 0, ("العدد ليس قاعدة؛ القاعدة سبب قابل للعمل.", "The number is not the rule; an actionable cause is.")),
           Q(("تحليل «هو / ليس» يبحث عن…", "Is/is not analysis looks for…"), [("الفروق بين حيث يحدث وحيث لا يحدث", "Differences between where it occurs and where not"), ("أكبر الفئات", "The biggest categories"), ("الأفكار الجديدة", "New ideas")], 0, ("الفروق تقود إلى السبب.", "The differences lead to the cause.")),
           Q(("شجرة الأعطال FTA تبدأ من…", "A fault tree starts from…"), [("الحدث العلوي غير المرغوب", "The undesired top event"), ("الأسباب الأساسية", "The basic causes"), ("العميل", "The customer")], 0, ("تحليل من الأعلى إلى الأسفل ببوابات منطقية.", "Top-down analysis with logic gates."))],
    "15": [Q(("القاعدة الأولى في العصف الذهني…", "The first brainstorming rule is…"), [("لا نقد أثناء الجلسة", "No criticism during the session"), ("التصويت الفوري", "Immediate voting"), ("فكرة واحدة لكل شخص", "One idea per person")], 0, ("الكم أولاً ثم التقييم.", "Quantity first, then evaluation.")),
           Q(("القبعة السوداء تمثل…", "The black hat stands for…"), [("المخاطر والحذر", "Risks and caution"), ("الوقائع", "Facts"), ("المشاعر", "Feelings")], 0, ("الأبيض وقائع، الأحمر مشاعر، الأسود حذر.", "White facts, red feelings, black caution.")),
           Q(("المقارنة المرجعية تتطلب أولاً…", "Benchmarking first needs…"), [("قياس أدائك الحالي", "Measuring your current performance"), ("نسخ ممارسات المنافس", "Copying a rival's practices"), ("شراء برنامج", "Buying software")], 0, ("بلا قياس لا مقارنة.", "Without a measure there is no comparison."))],
    "16": [Q(("مراحل DMAIC…", "The DMAIC phases are…"), [("تعريف، قياس، تحليل، تحسين، ضبط", "Define, Measure, Analyse, Improve, Control"), ("خطة، تنفيذ، تحقق، تصرف", "Plan, Do, Check, Act"), ("فرز، ترتيب، تنظيف", "Sort, set, shine")], 0, ("خمس مراحل ببوابات.", "Five phases with gates.")),
           Q(("يذكر الجدول C.1 إدارة الجودة الشاملة برقم…", "Table C.1 lists TQM under number…"), [("16.3 بينما رقمها في النص 16.2", "16.3, while the text numbers it 16.2"), ("16.1", "16.1"), ("15.6", "15.6")], 0, ("فرق ترقيم بين الجدول والنص.", "A numbering difference between the table and the text.")),
           Q(("TQM تحتاج…", "TQM needs…"), [("التزام الإدارة العليا ومشاركة الجميع", "Top management commitment and everyone's engagement"), ("قسم الجودة وحده", "The quality department alone"), ("مشروعاً قصيراً", "A short project")], 0, ("تحول على مستوى المنشأة.", "An organization-wide transformation."))],
}

PATHS = [
    {"id": "recur", "n": B("حل مشكلة متكررة", "Solve a recurring problem"), "c": ["13.7", "14.5", "14.4", "14.1", "16.1"], "x": B("ثم A3/8D وPDCA (الأدوات الأخرى في 14.7 و15.6)", "then A3/8D and PDCA (other relevant tools in 14.7 and 15.6)")},
    {"id": "control", "n": B("ضبط عملية", "Control a process"), "c": ["6.4", "6.1", "7.3", "6.3", "13.5", "13.8"], "x": B("", "")},
    {"id": "plan", "n": B("التخطيط ووضع الأهداف", "Plan and set objectives"), "c": ["5.1", "5.2", "8.3", "8.2", "7.4"], "x": B("وبطاقة الأداء المتوازن (8.4) في استوديو الاستراتيجية", "and the balanced scorecard (8.4) in the Strategy Studio")},
    {"id": "voice", "n": B("سماع العميل", "Hear the customer"), "c": ["9.2", "9.3", "13.6", "9.1", "9.4"], "x": B("والاستبيانات ومجموعات التركيز (9.5)", "and surveys and focus groups (9.5)")},
    {"id": "risk", "n": B("إدارة المخاطر", "Manage risk"), "c": ["7.1", "7.2", "7.3", "7.4"], "x": B("", "")},
]


def merge(T, OTHER):
    """adds the card fields to each tool of the catalogue and the explanation to each other relevant tool; fails if anything is missing"""
    codes = [t["c"] for t in T]
    assert sorted(CARDS) == sorted(codes), sorted(set(codes) ^ set(CARDS))
    for t in T:
        k = CARDS[t["c"]]
        for c in k["pre"] + k["nxt"]:
            assert c in codes, (t["c"], c)
        t.update({"nw": k["nw"], "inp": k["inp"], "st": k["st"], "mis": k["mis"], "aud": k["aud"], "pre": k["pre"], "nxt": k["nxt"]})
    assert len(OTX) == len(OTHER), (len(OTX), len(OTHER))
    assert sorted(QUIZ) == sorted(str(i) for i in range(5, 17)) and all(len(v) == 3 for v in QUIZ.values())
    assert sorted(CLX) == sorted(QUIZ)
    for p in PATHS:
        assert 4 <= len(p["c"]) <= 8 and all(c in codes for c in p["c"]), p["id"]
