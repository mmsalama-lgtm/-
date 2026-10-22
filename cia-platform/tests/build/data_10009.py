"""EXPLAIN_10009 — data for the CIA Explain Kit v1.4 in modules/iso10009.html (build step 2026-10-16, ISO 10009:2024 quality tools guide).
ISO 10009:2024 is a guidance document (Quality management — Guidance for quality tools and their application), not a certifiable standard.
The clause guide follows its own structure: clauses 1 to 4, the tool clauses 5 to 16 (one item per reviewed tool, from cat_10009.py, plus
the "other relevant tools" each clause names), and Annexes A (PDCA overview), B (storyboards) and C (attributes of the tools).
Clause numbers, titles and tool names checked on 2026-10-16 against the uploaded file ISO-10009-2024-Quality-Management-Guidance-for-
Quality-Tools.pdf (BS ISO 10009:2024, first edition 2024-06). ISO 9001:2026 references checked against ISO_9001_2026en 1.pdf: Annex A.9.1
NOTE 3 (points to ISO 10009) and NOTE 4 (ISO 10017), introduction 0.3.2, and the clause titles named in the mapping (4.1, 4.2, 4.4, 5.1.2,
5.2, 5.3, 6.1, 6.2, 7.1.3, 7.1.4, 7.1.5, 7.1.6, 7.2, 8.1, 8.2, 8.3, 8.5.1, 8.5.4, 8.6, 8.7, 9.1.1, 9.1.2, 9.1.3, 9.3, 10.1, 10.2).
ISO 9000:2026 (normative reference of ISO 10009) principles 4.2.6 and 4.2.7 as verified by OCR in the earlier toolbox steps.
The mapping of each ISO 10009 clause to ISO 9001:2026 clauses is the author's (ISO 10009 says only that its clauses follow the sequence of
ISO 9001 approximately). Not uploaded, so "not verified": ISO 10017, ISO 10005, ISO 10004, ISO 10014, ISO/PAS 24644-1, ISO 5725-2,
ISO 5807 and every bibliography reference of ISO 10009.
No text of a standard is reproduced: every summary is an interpretive summary in independent wording. Items coded GD-n are the author's
practical guidance, not clauses. Usage: python3 data_10009.py > explain_10009.js"""
import json, sys, os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import cat_10009 as C  # noqa: E402

B, L = C.B, C.L
IS = ("ملخص تفسيري، وليس النص الرسمي: ", "Interpretive summary, not the official text: ")
GD = ("إرشاد تطبيقي من خبرة الكاتب، وليس نصاً معيارياً: ", "Practical guidance from the author's experience, not normative text: ")
EX = ("مثال توضيحي، وليس بيانات حقيقية: ", "Illustrative example, not real data: ")


def R(kind, ar, en):
    return B(kind[0] + ar, kind[1] + en)


def IT(c, q, t, r, x, h, e, g, owner, kpi, refs=None, f=None):
    o = {"c": c, "q": q, "t": t, "r": r, "x": x, "h": h, "e": e, "g": g, "owner": owner, "kpi": kpi}
    if refs:
        o["refs"] = refs
    if f:
        o["f"] = f
    return o


def REF(l_ar, l_en, t_ar=None, t_en=None):
    o = {"l": B(l_ar, l_en)}
    if t_ar:
        o["title"] = B(t_ar, t_en)
    return o


MAPN = ("ربط الكاتب، لا تذكره ISO 10009", "Author's mapping, not stated in ISO 10009")

phases = {
    "use": {"c": "#7A869E", "t": "#EEF1F6", "n": B("كيف تُستخدم المواصفة", "How to use the standard")},
    "plan": {"c": "#1B2A4A", "t": "#E8ECF4", "n": B("التوجه والتخطيط", "Direction and planning")},
    "cust": {"c": "#1E8C93", "t": "#E3F4F4", "n": B("العميل والعمليات", "Customer and operations")},
    "meas": {"c": "#C9821A", "t": "#FBF0DF", "n": B("القياس والتحليل والتحسين", "Measure, analyse and improve")},
}
SEC_PH = {"5": "plan", "6": "plan", "7": "plan", "8": "plan", "9": "cust", "10": "cust", "11": "cust", "12": "cust",
          "13": "meas", "14": "meas", "15": "meas", "16": "meas"}

LV = {"own": B("أداة مستقلة في المنصة", "Dedicated platform tool"), "in": B("جزء من أداة في المنصة", "Part of a platform tool"),
      "here": B("تُطبق في هذا الدليل", "Worked in this guide"), "rel": B("أداة قريبة في المنصة", "Related platform tool"),
      "none": B("ليست في المنصة بعد", "Not on the platform yet")}
flags = {
    "own": {"t": LV["own"], "row": B("أدوات مستقلة في المنصة", "Dedicated tools on the platform"), "col": "#2F7D4B", "tint": "#E5F4EA"},
    "in": {"t": LV["in"], "row": B("داخل أدوات المنصة", "Inside platform tools"), "col": "#3563C9", "tint": "#E7EEFB"},
    "here": {"t": LV["here"], "row": B("في هذا الدليل (حاسبة أو لوحة القصة)", "In this guide (calculator or storyboard)"), "col": "#B8901E", "tint": "#F7EFD9"},
    "rel": {"t": LV["rel"], "row": B("أداة قريبة في المنصة", "A related tool on the platform"), "col": "#7B5BB8", "tint": "#EFE9F8"},
}

OWN = {
    "5": (B("الإدارة العليا", "Top management"), B("نسبة القرارات الاستراتيجية المبنية على تحليل مراجَع", "Share of strategic decisions backed by a reviewed analysis")),
    "6": (B("مالك العملية", "Process owner"), B("نسبة العمليات الرئيسية بخريطة محدَّثة", "Share of key processes with an up-to-date map")),
    "7": (B("مالك الخطر", "Risk owner"), B("نسبة المخاطر العالية التي لها إجراء ومالك", "Share of high risks with an action and an owner")),
    "8": (B("الإدارة العليا", "Top management"), B("نسبة الأهداف المكتوبة بمعايير SMART والمتسلسلة", "Share of objectives written to SMART and cascaded")),
    "9": (B("مدير تجربة العميل", "Customer experience manager"), B("اتجاه رضا العملاء وصافي نقاط الترويج", "Trend of customer satisfaction and NPS")),
    "10": (B("مدير العمليات", "Operations manager"), B("اتجاه المهلة والفعالية الشاملة للمعدات", "Trend of lead time and OEE")),
    "11": (B("مدير سلسلة التوريد", "Supply chain manager"), B("دوران المخزون وحالات النفاد", "Inventory turns and stock-outs")),
    "12": (B("مدير الجودة", "Quality manager"), B("تكلفة الجودة نسبةً من المبيعات", "Cost of quality as a share of sales")),
    "13": (B("مهندس الجودة", "Quality engineer"), B("نسبة القرارات المدعومة برسم للبيانات", "Share of decisions supported by a chart of the data")),
    "14": (B("قائد التحقيق", "Investigation lead"), B("حالات عدم المطابقة المتكررة", "Repeat nonconformities")),
    "15": (B("قائد التحسين", "Improvement lead"), B("أفكار التحسين المنفذة ونتائجها", "Improvement ideas implemented and their results")),
    "16": (B("الإدارة العليا", "Top management"), B("المشاريع المغلقة التي حافظت على نتيجتها", "Projects closed with the result held")),
}
# ISO 10009 clause -> ISO 9001:2026 clauses it serves (author's mapping; numbers and titles checked against ISO_9001_2026en 1.pdf)
MAP9001 = {
    "5": [("4.1", "فهم المنشأة وسياقها", "Understanding the organization and its context"), ("4.2", "فهم احتياجات الأطراف المعنية وتوقعاتها", "Understanding the needs and expectations of interested parties"), ("5.2", "سياسة الجودة", "Quality policy"), ("6.1", "إجراءات معالجة المخاطر والفرص", "Actions to address risks and opportunities")],
    "6": [("4.4", "نظام إدارة الجودة", "Quality management system"), ("5.3", "الأدوار والمسؤوليات والصلاحيات", "Roles, responsibilities and authorities"), ("8.1", "التخطيط والضبط التشغيلي", "Operational planning and control")],
    "7": [("6.1", "إجراءات معالجة المخاطر والفرص", "Actions to address risks and opportunities")],
    "8": [("6.2", "أهداف الجودة والتخطيط لتحقيقها", "Quality objectives and planning to achieve them"), ("10.1", "التحسين المستمر", "Continual improvement")],
    "9": [("5.1.2", "التركيز على العميل", "Customer focus"), ("8.2", "متطلبات المنتجات والخدمات", "Requirements for products and services"), ("8.3", "تصميم المنتجات والخدمات وتطويرها", "Design and development of products and services"), ("9.1.2", "رضا العملاء", "Customer satisfaction")],
    "10": [("7.1.3", "البنية التحتية", "Infrastructure"), ("7.1.4", "بيئة تشغيل العمليات", "Environment for the operation of processes"), ("8.5.1", "ضبط الإنتاج وتقديم الخدمة", "Control of production and service provision")],
    "11": [("8.5.4", "الحفظ", "Preservation")],
    "12": [("8.5.1", "ضبط الإنتاج وتقديم الخدمة (ومنه ز: منع الخطأ البشري)", "Control of production and service provision (including g: preventing human error)"), ("8.6", "إطلاق المنتجات والخدمات", "Release of products and services"), ("8.7", "ضبط المخرجات غير المطابقة", "Control of nonconforming outputs")],
    "13": [("7.1.5", "موارد الرصد والقياس", "Monitoring and measuring resources"), ("9.1.1", "عام (الرصد والقياس والتحليل والتقييم)", "General (monitoring, measurement, analysis and evaluation)"), ("9.1.3", "التحليل والتقييم", "Analysis and evaluation")],
    "14": [("10.2", "عدم المطابقة والإجراء التصحيحي", "Nonconformity and corrective action")],
    "15": [("7.1.6", "المعرفة التنظيمية", "Organizational knowledge"), ("10.1", "التحسين المستمر", "Continual improvement")],
    "16": [("0.3.2", "دورة PDCA (المقدمة)", "Plan-Do-Check-Act cycle (introduction)"), ("10.1", "التحسين المستمر", "Continual improvement")],
}
# self-assessment questions each tool item opens with "Assess this" (the rest show the "outside the assessment" note)
QOF = {"5.1": "TM1", "5.2": "RV1", "6.3": "IN2", "7.2": "IN1", "7.3": "CP2", "7.4": "DT3", "12.3": "RV3", "13.8": "DT1", "14.6": "DT2", "15.5": "TM2"}

PH_N = {"P": B("الخطة", "Plan"), "D": B("التنفيذ", "Do"), "C": B("التحقق", "Check"), "A": B("التصرف", "Act")}


def pdca_line(t):
    ar, en = [], []
    for k, lab in (("s", ("الاستراتيجية", "strategy")), ("p", ("تحسين العمليات", "process improvement")), ("c", ("التحسين المستمر", "continual improvement"))):
        ph = t["pdca"][k]
        if not ph:
            continue
        names_ar = "، ".join(PH_N[p[0]]["ar"] + (" (ضمن نطاق)" if p.endswith("*") else "") for p in ph)
        names_en = ", ".join(PH_N[p[0]]["en"] + (" (in a range)" if p.endswith("*") else "") for p in ph)
        ar.append(lab[0] + ": " + names_ar)
        en.append(lab[1] + ": " + names_en)
    if not ar:
        return B("لا يضعها الملحق A في جداول PDCA", "Annex A does not place it in the PDCA tables")
    return B("الملحق A — " + "؛ ".join(ar), "Annex A — " + "; ".join(en))


def plat_lines(t):
    out = []
    for p in t["plat"]:
        if p["lvl"] == "plan":
            out.append(B("أداة مستقلة لها ضمن خطة بناء صندوق الأدوات", "A dedicated tool is on the toolbox build plan"))
        elif p["lvl"] == "here":
            out.append(B("طبّقها في تبويب «مستكشف الأدوات» في هذا الدليل" + (" (الحاسبات)" if p["tab"] == "calc" else " (حقل في لوحة القصة)"),
                         "Work it in the Tool navigator tab of this guide" + (" (calculators)" if p["tab"] == "calc" else " (a storyboard field)")))
        else:
            nm = C.NAMES[p["k"]]
            pre = {"own": ("افتح أداة «", "Open the “"), "in": ("موجودة داخل «", "Found inside the “"), "rel": ("أداة قريبة: «", "Related tool: the “")}[p["lvl"]]
            post = {"own": ("» في المنصة", "” tool on the platform"), "in": ("» في المنصة", "” on the platform"), "rel": ("»", "”")}[p["lvl"]]
            out.append(B(pre[0] + nm["ar"] + post[0], pre[1] + nm["en"] + post[1]))
    if not out:
        out.append(B("ليست في المنصة بعد: سجّل استخدامها خطوةً في لوحة القصة وأرفق مخرجها", "Not on the platform yet: record its use as a storyboard step and attach its output"))
    return out


def tool_item(t):
    sec = t["sec"]
    use_ar = "، و".join(u["ar"] for u in t["use"])
    use_en = "; ".join(u["en"] for u in t["use"])
    r = R(IS, t["d"]["ar"] + " ومن استخداماتها: " + use_ar + ".", t["d"]["en"] + " Uses: " + use_en + ".")
    h = [B(b["ar"], b["en"]) for b in t["ben"][:1]]
    # step 10.1: the kit item carries the card's steps, what an auditor asks to see and the common mistakes (cards_10009.py)
    h = ([B("الخطوة %d: %s" % (i + 1, x["ar"]), "Step %d: %s" % (i + 1, x["en"])) for i, x in enumerate(t["st"])] +
         [B("الفائدة: " + t["ben"][0]["ar"], "Benefit: " + t["ben"][0]["en"])] + plat_lines(t) + [pdca_line(t)])
    hl = {"ar": [x["ar"] for x in h], "en": [x["en"] for x in h]}
    e = {"ar": [t["out"]["ar"]] + ["يطلب المدقق: " + x["ar"] for x in t["aud"]], "en": [t["out"]["en"]] + ["An auditor asks for: " + x["en"] for x in t["aud"]]}
    g = {"ar": [n["ar"] for n in t["note"]] + ["خطأ شائع: " + x["ar"] for x in t["mis"]], "en": [n["en"] for n in t["note"]] + ["Common mistake: " + x["en"] for x in t["mis"]]}
    refs = [REF("ISO 9001:2026 " + m[0], "ISO 9001:2026 " + m[0], m[1] + " — " + MAPN[0], m[2] + " — " + MAPN[1]) for m in MAP9001[sec]]
    own, kpi = OWN[sec]
    f = t["lv"] if t["lv"] in flags else None
    return IT(t["c"], QOF.get(t["c"], "x:tools"), t["n"], r, R(EX, t["ex"]["ar"], t["ex"]["en"]), hl, e, g, own, kpi, refs, f)


OTHER_INTRO = {
    "5.5": B("أدوات أخرى للاستراتيجية", "Other strategy tools"), "6.6": B("أدوات أخرى لنهج العمليات", "Other process tools"),
    "7.5": B("أدوات أخرى للمخاطر", "Other risk tools"), "8.4": B("أدوات أخرى للأهداف", "Other objective tools"),
    "9.5": B("أدوات أخرى لصوت العميل", "Other customer tools"), "10.9": B("أدوات أخرى لأداء العمليات", "Other process performance tools"),
    "11.3": B("أدوات أخرى للمخزون", "Other inventory tools"), "12.4": B("أدوات أخرى للاكتشاف والمنع", "Other detection and prevention tools"),
    "13.9": B("أدوات أخرى لضبط العمليات", "Other process control tools"), "14.7": B("أدوات أخرى لتحليل المشكلات", "Other problem analysis tools"),
    "15.6": B("أدوات أخرى للتحسين", "Other improvement tools"), "16.3": B("عائلات أدوات أخرى", "Other tool families"),
}


def other_item(code):
    lst = [o for o in C.OTHER if o[0] == code]
    names_ar = "، ".join(o[1]["ar"] for o in lst)
    names_en = "; ".join(o[1]["en"] for o in lst)
    on = [o for o in lst if o[2]]
    h_ar = ["ذُكرت بالاسم فقط، دون مراجعة تفصيلية في المعيار"] + ["%s: %s" % (o[1]["ar"], "، ".join(C.NAMES[p["k"]]["ar"] for p in o[2])) for o in on]
    h_en = ["Named only, with no detailed review in the standard"] + ["%s: %s" % (o[1]["en"], ", ".join(C.NAMES[p["k"]]["en"] for p in o[2])) for o in on]
    sec = code.split(".")[0]
    own, kpi = OWN[sec]
    f = "own" if any(p["lvl"] == "own" for o in on for p in o[2]) else ("in" if any(p["lvl"] == "in" for o in on for p in o[2]) else ("rel" if on else None))
    return IT(code, "x:tools", OTHER_INTRO[code],
              R(IS, "يختم البند بقائمة «أدوات أخرى ذات صلة» أقل استخداماً قد تهم القارئ: " + names_ar + ".",
                "The clause ends with a list of less frequently used \"other relevant tools\" that may be of interest: " + names_en + "."),
              None, {"ar": h_ar, "en": h_en}, {"ar": [], "en": []},
              {"ar": ["المراجع المذكورة في قائمة المراجع غير مرفوعة إلى المشروع: «غير متحقق منها»"], "en": ["The bibliography references are not uploaded to the project: “not verified”"]},
              own, kpi, None, f)


S = []

# ---------------------------------------------------------------- 1–3
S.append({"id": "1–3", "grp": "core", "ph": "use", "col": "#7A869E", "tint": "#EEF1F6",
  "t": B("البنود 1 إلى 3: المجال والمراجع المعيارية والمصطلح", "Clauses 1 to 3: scope, normative reference and term"),
  "s": B("لماذا وُضعت المواصفة", "What the standard is for"), "sh": B("1–3 · المجال", "1–3 · Scope"),
  "p": B("دليل لاختيار الأدوات التي يمكن استخدامها في نظام إدارة الجودة وتطبيقها، لأربعة أغراض، ومرجعه المعياري الوحيد ISO 9000.",
         "Guidance on selecting and applying the tools that can be used in a quality management system, for four aims; its only normative reference is ISO 9000."),
  "fl": L(("وصف عملية أو متغير", "Characterize"), ("تيسير حل المشكلات", "Solve problems"), ("إبراز مجالات التحسين", "Highlight"), ("تحسين الفعالية", "Improve effectiveness")),
  "it": [
    IT("1", "SL1", B("المجال: أربعة أغراض للأدوات", "Scope: four aims for the tools"),
       R(IS, "تعطي المواصفة إرشاداً لاختيار أدوات تُستخدم في نظام إدارة الجودة وتطبيقها، من أجل: وصف عملية أو متغير، وتيسير حل المشكلات، وإبراز مجالات التحسين، وتحسين الفعالية.",
         "the standard gives guidance on selecting and applying tools that can be used in a quality management system to: characterize a process or a variable, facilitate problem solving, highlight areas for improvement and improve effectiveness."),
       R(EX, "عندما سألت إدارة الواحة «لماذا ترتفع الشحنات المرفوضة؟» كان الغرض «حل مشكلة»، فبدأ الاختيار من أدوات البند 14 لا من أدوات الاستراتيجية.",
         "when Al-Waha's management asked \"why are rejected loads rising?\" the aim was \"solve a problem\", so the choice started from clause 14 tools, not strategy tools."),
       L(("ابدأ كل استخدام لأداة بكتابة غرضه بجملة واحدة", "Start every use of a tool by writing its aim in one sentence"), ("اختر من مستكشف الأدوات بحسب الغرض", "Pick from the tool navigator by aim")),
       L(("غرض مكتوب لكل لوحة قصة أو مشروع", "A written aim for each storyboard or project"),),
       L(("أداة تُختار لأنها مألوفة لا لأنها تناسب الغرض", "A tool chosen because it is familiar, not because it fits the aim"),),
       B("مدير الجودة", "Quality manager"), B("نسبة الاستخدامات بغرض مكتوب", "Share of tool uses with a written aim")),
    IT("2", "x:tools", B("المرجع المعياري: ISO 9000", "Normative reference: ISO 9000"),
       R(IS, "المرجع المعياري الوحيد هو ISO 9000 (أسس أنظمة إدارة الجودة ومفرداتها) دون تاريخ، أي أحدث إصدار. ومنه تؤخذ المصطلحات، ومنها مبدأ التحسين (4.2.6) والقرار المبني على الدليل (4.2.7) في ISO 9000:2026.",
         "the only normative reference is ISO 9000 (Quality management systems — Fundamentals and vocabulary), undated, so the latest edition applies. Its terms apply, including the improvement principle (4.2.6) and evidence-based decision-making (4.2.7) in ISO 9000:2026."),
       None,
       L(("استخدم مصطلحات ISO 9000 نفسها في سجلات الأدوات", "Use the ISO 9000 terms themselves in tool records"),),
       L(("مصطلحات موحدة في الإجراءات والسجلات", "Consistent terms in procedures and records"),),
       L(("مصطلحات داخلية تخالف ISO 9000 فيختلف فهم الفرق", "In-house terms that differ from ISO 9000, so teams understand them differently"),),
       B("مدير الجودة", "Quality manager"), B("—", "—")),
    IT("3.1", "x:tools", B("المصطلح: أداة الجودة = أسلوب الجودة", "Term: quality tool = quality technique"),
       R(IS, "أداة الجودة (ويرادفها أسلوب الجودة) طريقة أو إجراء لتنفيذ عملية بهدف تحقيق هدف جودة. وتذكر المقدمة أن الأساليب الإحصائية لها مواصفة مستقلة هي ISO 10017.",
         "a quality tool (or quality technique) is a method or procedure to perform an operation to achieve a quality objective. The introduction notes that statistical techniques have their own standard, ISO 10017."),
       None,
       L(("اربط كل أداة بهدف جودة محدد", "Tie each tool to a stated quality objective"),),
       L(("هدف الجودة الذي خدمته الأداة", "The quality objective the tool served"),),
       L(("أداة تُطبق ولا يُعرف أي هدف خدمت", "A tool applied with no idea which objective it served"), ("ISO 10017 غير مرفوعة إلى المشروع: «غير متحقق منها»", "ISO 10017 is not uploaded to the project: “not verified”")),
       B("مدير الجودة", "Quality manager"), B("—", "—")),
    IT("9001 A.9.1", "RV2", B("صلتها بـ ISO 9001:2026", "How it links to ISO 9001:2026"),
       R(IS, "يشرح الملحق A.9.1 من ISO 9001:2026 أن الرصد والقياس يعطيان بيانات ومعلومات للتحليل والتقييم، وتحيل ملاحظته 3 إلى ISO 10009 للإرشاد في أدوات الجودة وتطبيقها، وملاحظته 4 إلى ISO 10017 للأساليب الإحصائية. والملحق والملاحظات شرح لا متطلبات.",
         "Annex A.9.1 of ISO 9001:2026 explains that monitoring and measurement give data and information for analysis and evaluation; its NOTE 3 points to ISO 10009 for guidance on quality tools and their application, and NOTE 4 to ISO 10017 for statistical techniques. The annex and notes explain; they set no requirements."),
       R(EX, "في تدقيق الواحة الداخلي على البند 9.1.3 طلب المدقق «كيف تحللون بيانات الرفض؟» فعُرض تحليل باريتو PA-EX-02 ولوحة القصة.",
         "in Al-Waha's internal audit on clause 9.1.3 the auditor asked \"how do you analyse rejection data?\"; Pareto PA-EX-02 and the storyboard were shown."),
       L(("اعرض الأداة دليلاً على التحليل والتقييم في 9.1.3", "Show the tool as evidence of analysis and evaluation under 9.1.3"), ("ISO 10009 إرشاد: لا يدقق عليها المدقق، بل على ما يطلبه ISO 9001", "ISO 10009 is guidance: the auditor checks what ISO 9001 requires, not ISO 10009")),
       L(("تحليل موثق يربط البيانات بالقرار", "A recorded analysis that links data to the decision"),),
       L(("ادعاء «المطابقة لـ ISO 10009»: هي ليست مواصفة إشهاد", "Claiming \"conformity to ISO 10009\": it is not a certification standard"),),
       B("مدير الجودة", "Quality manager"), B("نسبة القرارات المدعومة بتحليل موثق", "Share of decisions backed by a recorded analysis"),
       [REF("ISO 9001:2026 A.9.1", "ISO 9001:2026 A.9.1"), REF("ISO 9001:2026 9.1.3", "ISO 9001:2026 9.1.3")])
  ]})

# ---------------------------------------------------------------- 4
S.append({"id": "4", "grp": "core", "ph": "use", "col": "#7A869E", "tint": "#EEF1F6",
  "t": B("البند 4 أدوات الجودة: الترتيب وطريقة العرض", "Clause 4 Quality tools: arrangement and review"),
  "s": B("كيف تقرأ المواصفة", "How to read the standard"), "sh": B("4 · الترتيب", "4 · Arrangement"),
  "p": B("الأدوات مرتبة تقريباً بتسلسل متطلبات ISO 9001 دون أن يعني الترتيب أولوية، ولكل أداة متكررة الاستخدام شرح وطريقة استخدام وفوائد ونقاط تُراعى.",
         "The tools follow the sequence of ISO 9001 requirements approximately, with no priority implied; each frequently used tool has an explanation, how it is used, its benefits and points to note."),
  "fl": L(("اختر الغرض", "Pick the aim"), ("حدد مرحلة PDCA", "Place in PDCA"), ("راجع خصائص الأداة", "Check its demands"), ("طبّق وسجّل", "Apply and record")),
  "it": [
    IT("4.1", "SL1", B("الترتيب وفق تسلسل ISO 9001 والملاحق", "Arrangement on the ISO 9001 sequence, and the annexes"),
       R(IS, "رُتبت الأدوات تقريباً بتسلسل متطلبات ISO 9001 لمساعدة المستخدم، ولا يعني ذلك أولوية. ويعرض الملحق A الأدوات على دورة PDCA، والملحق B أمثلة استخدامها معاً في لوحات قصة، والملحق C خصائصها لتوجيه استخدامها المناسب.",
         "the tools are arranged approximately in the sequence of ISO 9001 requirements to help the user; this implies no priority. Annex A lists the tools against the PDCA cycle, Annex B shows examples of using them together as storyboards, and Annex C summarises their attributes to guide their use."),
       R(EX, "لربط أداة بمتطلب في نظام الواحة يبدأ المستخدم من البند المقابل: أدوات المخاطر في البند 7 للبند 6.1، وأدوات التصحيح في البند 14 للبند 10.2.",
         "to tie a tool to a requirement in Al-Waha's system the user starts from the matching clause: risk tools in clause 7 for 6.1, corrective action tools in clause 14 for 10.2."),
       L(("ابحث عن الأداة من البند المقابل لمتطلب ISO 9001 الذي تعمل عليه", "Look for the tool from the clause that matches the ISO 9001 requirement you are working on"), ("ثم تحقق من مرحلتها في الملحق A وخصائصها في الملحق C", "Then check its phase in Annex A and its attributes in Annex C")),
       L(("مبرر اختيار الأداة في سجل الاستخدام", "The reason for choosing the tool in the record of its use"),),
       L(("الظن بأن ترتيب الأدوات يعني أولوية أو إلزاماً", "Reading the order of the tools as a priority or an obligation"),),
       B("مدير الجودة", "Quality manager"), B("نسبة الاستخدامات بمبرر اختيار مكتوب", "Share of uses with a written reason for the choice")),
    IT("4.2", "SL3", B("طريقة عرض كل أداة", "How each tool is reviewed"),
       R(IS, "كل أداة متكررة الاستخدام تُعرض بشرح موجز لها ولاستخدامها في نظام الجودة، وكيف تُستخدم عادة، وأسباب استخدامها وإرشاد لاستخدامها الفعال في جدول «الفوائد ونقاط تُراعى». والأدوات الأقل استخداماً تُذكر بالاسم في آخر كل بند تحت «أدوات أخرى ذات صلة».",
         "each frequently used tool is reviewed with a short explanation of the tool and its use in a quality system, how it is normally used, and the reasons to use it with guidance on effective use in a table of benefits and points to note. Less frequently used tools are named at the end of each clause under \"other relevant tools\"."),
       None,
       L(("اعتمد مجموعة أدوات منشأتك بالصيغة نفسها: الغرض، والاستخدام، والفوائد، ونقاط تُراعى", "Adopt your organization's toolkit in the same format: purpose, use, benefits, points to note"), ("أضف مثالاً من عملك لكل أداة", "Add an example from your own work for each tool")),
       L(("دليل داخلي لأدوات الجودة مرتبط بالإجراءات", "An in-house quality tools guide linked to the procedures"),),
       L(("الاكتفاء بالأسماء دون «نقاط تُراعى»، فتُستخدم الأداة بطريقة خاطئة", "Listing names only, without the points to note, so tools are used wrongly"),),
       B("مدير الجودة", "Quality manager"), B("نسبة الأدوات المعتمدة بدليل استخدام", "Share of adopted tools with a usage guide")),
    IT("GD-1", "SL2", B("كيف تختار الأداة المناسبة", "How to pick the right tool"),
       R(GD, "ثلاثة أسئلة قبل أي أداة: ما الغرض (وصف، أو حل مشكلة، أو إبراز تحسين، أو فعالية)؟ وأين نحن في الدورة (خطة، تنفيذ، تحقق، تصرف) وفي أي سياق (استراتيجية، أو تحسين عملية، أو تحسين مستمر)؟ وما الذي نملكه: فريق أم فرد، وكم من البيانات، وأي مستوى كفاءة، وكم من الجهد؟ ومستكشف الأدوات في هذا الدليل يطبق هذه الأسئلة ويبين سبب كل اقتراح.",
         "three questions before any tool: what is the aim (characterize, solve a problem, highlight improvement, effectiveness)? Where are we in the cycle (Plan, Do, Check, Act) and in which context (strategy, process improvement, continual improvement)? And what do we have: a team or one person, how much data, what level of capability, how much effort? The tool navigator in this guide applies these questions and shows the reason for each suggestion."),
       R(EX, "فريق الواحة بلا بيانات كافية وبلا ميسّر مدرب على FMEA، فاقترح المستكشف SWIFT أولاً ثم FMEA بعد تدريب الميسّر.",
         "Al-Waha's team had little data and no trained FMEA facilitator, so the navigator suggested SWIFT first and FMEA once the facilitator was trained."),
       L(("أجب عن الأسئلة الثلاثة في مستكشف الأدوات", "Answer the three questions in the tool navigator"), ("أضف الأداة المختارة إلى لوحة القصة بمرحلتها ومبررها", "Add the chosen tool to the storyboard with its phase and reason")),
       L(("لوحة قصة بأدوات مختارة ومبرراتها", "A storyboard with the chosen tools and their reasons"),),
       L(("أداة صعبة (•••) بلا شخص مدرب", "A difficult tool (•••) with nobody trained"), ("أداة تحتاج بيانات كثيرة تُطبق على بيانات قليلة", "A tool that needs a lot of data applied to little data")),
       B("قائد التحسين", "Improvement lead"), B("نسبة الخطوات المناسبة لموارد الفريق", "Share of steps that fit the team's resources")),
    IT("GD-2", "CP1", B("الكفاءة: من يستطيع تطبيق كل أداة", "Competence: who can apply each tool"),
       R(GD, "يصنف الملحق C مستوى الكفاءة لكل أداة: نقطة واحدة يمكن تطبيقها بعد قراءة المعلومات الموثقة، ونقطتان بعد تدريب مخصص، وثلاث نقاط يُنصح فيها بدورة أطول واكتساب خبرة قبل التطبيق. وهذا يترجم مباشرة إلى متطلب الكفاءة في البند 7.2 من ISO 9001:2026: حدد الكفاءة اللازمة، وتأكد منها، واحتفظ بالدليل.",
         "Annex C rates the level of capability for each tool: one dot can be applied after reading documented information, two dots after dedicated training, and three dots call for a longer course and experience before applying. This maps straight onto the competence requirement of ISO 9001:2026 clause 7.2: determine the competence needed, ensure it, and keep the evidence."),
       R(EX, "أدرجت الواحة FMEA وGR&R وSix Sigma (•••) في مصفوفة الكفاءة، ولا يقود دراسة FMEA إلا من أكمل الدورة وشارك في دراستين.",
         "Al-Waha put FMEA, GR&R and Six Sigma (•••) into its competence matrix; only someone who completed the course and took part in two studies leads an FMEA."),
       L(("أضف أدوات •• و••• إلى مصفوفة الكفاءة", "Add the •• and ••• tools to the competence matrix"), ("اربط كل لوحة قصة باسم الميسّر المؤهل", "Name the qualified facilitator on each storyboard")),
       L(("سجلات التدريب والخبرة لكل أداة صعبة", "Training and experience records for each difficult tool"),),
       L(("أداة ••• يقودها من قرأ عنها فقط", "A ••• tool led by someone who has only read about it"),),
       B("مدير الموارد البشرية مع مدير الجودة", "HR manager with the quality manager"), B("نسبة الأدوات الصعبة بقائد مؤهل", "Share of difficult tools with a qualified lead"),
       [REF("ISO 9001:2026 7.2", "ISO 9001:2026 7.2", "الكفاءة — " + MAPN[0], "Competence — " + MAPN[1])])
  ]})

# ---------------------------------------------------------------- 5–16 tool clauses
P_TEXT = {
    "5": B("أدوات لفهم السياق واختيار الاتجاه: من SWOT وPESTLE والقوى التنافسية إلى بياني الرؤية والرسالة.", "Tools to understand context and choose direction: from SWOT, PESTLE and the competing forces to the vision and mission statements."),
    "6": B("أدوات لتعريف العمليات وحدودها وتسلسلها وضوابطها ومسؤولياتها.", "Tools to define processes, their bounds, sequence, controls and responsibilities."),
    "7": B("أدوات لتحديد المخاطر وترتيبها ومتابعتها، من أسئلة «ماذا لو» إلى FMEA وخريطة الحرارة.", "Tools to identify, rank and follow risks, from \"what if\" prompts to FMEA and the heat map."),
    "8": B("أدوات لتحويل الاستراتيجية إلى أهداف ومتابعتها، بخطوات صغيرة مستمرة أو بنشر منظم للأهداف.", "Tools to turn strategy into objectives and follow them, by small continual steps or by structured deployment."),
    "9": B("أدوات لفهم ما يهم العميل وقياس رضاه وولائه والاختيار بين البدائل.", "Tools to understand what matters to the customer, measure satisfaction and loyalty, and choose between alternatives."),
    "10": B("أدوات لرفع أداء العمليات: القيود، وتدفق القيمة، والهدر، والتنظيم، وفعالية المعدات.", "Tools to raise process performance: constraints, value stream, waste, workplace order and equipment effectiveness."),
    "11": B("أدوات لضبط التوريد والمخزون بإشارات الاستهلاك والتوريد في الوقت المحدد.", "Tools to control supply and inventory with consumption signals and just-in-time delivery."),
    "12": B("أدوات لمنع الخطأ واكتشافه، وقياس تكلفة سوء الجودة.", "Tools to prevent and detect errors, and to measure the cost of poor quality."),
    "13": B("أدوات رسومية بسيطة لعرض البيانات وضبط العمليات والثقة بالقياس؛ والأساليب الإحصائية الأوسع في ISO 10017.", "Simple graphical tools to show data, control processes and trust the measurement; the wider statistical techniques are in ISO 10017."),
    "14": B("أدوات لتعريف المشكلة والوصول إلى أسبابها الجذرية واتخاذ القرار.", "Tools to define the problem, reach its root causes and decide."),
    "15": B("أدوات لتوليد الأفكار وتنظيمها والتعلم من الآخرين وإشراك الصف الأول.", "Tools to generate and organise ideas, learn from others and involve the front line."),
    "16": B("عائلات أدوات على مستوى المنشأة: Six Sigma وإدارة الجودة الشاملة.", "Organization-wide families of tools: Six Sigma and total quality management."),
}
OTHER_CODE = {"5": "5.5", "6": "6.6", "7": "7.5", "8": "8.4", "9": "9.5", "10": "10.9", "11": "11.3", "12": "12.4", "13": "13.9", "14": "14.7", "15": "15.6", "16": "16.3"}

for code, nm, map9 in C.CLAUSES:
    ph = SEC_PH[code]
    its = [tool_item(t) for t in C.T if t["sec"] == code]
    if code == "13":
        its.insert(0, IT("13.1", "x:tools", B("عام: الأساليب الإحصائية في ISO 10017", "General: statistical techniques in ISO 10017"),
            R(IS, "تتناول ISO 10017 مجموعة من الأساليب الإحصائية، ويذكر هذا البند أدوات رسومية بسيطة لا تتناولها ISO 10017 تحديداً.",
              "ISO 10017 addresses a spectrum of statistical techniques; this clause notes some simple graphical tools that ISO 10017 does not specifically address."),
            None,
            L(("للأساليب الإحصائية الأعمق ارجع إلى ISO 10017", "For deeper statistical techniques go to ISO 10017"), ("الرسم التشغيلي والمتوسط والوسيط ونسبة العيوب في أداة DMAIC", "Run charts, mean, median and defect rate are in the DMAIC tool")),
            L(("رسم للبيانات بالفترة والمصدر قبل كل قرار", "A chart of the data with period and source before each decision"),),
            L(("ISO 10017 غير مرفوعة إلى المشروع: «غير متحقق منها»", "ISO 10017 is not uploaded to the project: “not verified”"),),
            OWN["13"][0], OWN["13"][1]))
    its.append(other_item(OTHER_CODE[code]))
    # a section whose id is also an item code opens on that item: none here (section ids are whole clause numbers)
    flt = [t for t in C.T if t["sec"] == code]
    S.append({"id": code, "grp": "core", "ph": ph, "col": phases[ph]["c"], "tint": phases[ph]["t"],
              "t": B("البند %s %s" % (code, nm["ar"]), "Clause %s %s" % (code, nm["en"])),
              "s": nm, "sh": B("%s · %s" % (code, nm["ar"]), "%s · %s" % (code, nm["en"])),
              "p": B(P_TEXT[code]["ar"] + " ويخدم في ISO 9001:2026 (ربط الكاتب): " + map9 + ".", P_TEXT[code]["en"] + " It serves ISO 9001:2026 (author's mapping): " + map9 + "."),
              "fl": [B(t["n"]["ar"].split(" (")[0].split(" / ")[0], t["n"]["en"].split(" (")[0].split("/")[0]) for t in flt][:6],
              "it": its})

# ---------------------------------------------------------------- Annex A
def annex_a_item(k, code, q, title, ex):
    rows_ar, rows_en = [], []
    for ph in "PDCA":
        lst = C.ANNEX_A[k][ph]
        ar, en = [], []
        for x in lst:
            if x.startswith("R:"):
                a, b = x[2:].split("-")
                ar.append("الأدوات %s إلى %s" % (a, b)); en.append("tools %s to %s" % (a, b)); continue
            c0 = x.split(":")[0]
            tt = [t for t in C.T if t["c"] == c0]
            if tt and ":" not in x:
                ar.append("%s %s" % (c0, tt[0]["n"]["ar"])); en.append("%s %s" % (c0, tt[0]["n"]["en"]))
            else:
                extra = {"BCG": ("مصفوفة BCG", "BCG matrix"), "mystery": ("المتسوق الخفي", "Mystery shopper"), "BSC": ("بطاقة الأداء المتوازن", "Balanced scorecard"),
                         "solution": ("أثر الحل", "Solution effect"), "lewin": ("تحليل مجال القوى", "Lewin's force field analysis"), "DWD": ("تصميم العمل الديناميكي", "Dynamic work design"),
                         "PGCV": ("المكسب المحتمل في قيمة العميل", "Potential gain in customer value"), "AHP": ("التحليل الهرمي AHP", "Analytic hierarchy process (AHP)"),
                         "RPA": ("أتمتة العمليات الروبوتية", "Robotic process automation"), "cycle": ("الجرد الدوري", "Cycle counts"), "turns": ("دوران المخزون", "Inventory turns")}[x.split(":")[1]]
                ar.append("%s %s" % (c0, extra[0])); en.append("%s %s" % (c0, extra[1]))
        rows_ar.append("%s: %s" % (PH_N[ph]["ar"], "، ".join(ar)))
        rows_en.append("%s: %s" % (PH_N[ph]["en"], "; ".join(en)))
    return IT(code, q, title,
              R(IS, "يضع الجدول أدوات %s على مراحل دورة PDCA الأربع، وقد تظهر الأداة في أكثر من مرحلة." % C.CTX[k]["ar"],
                "the table places the tools for %s on the four PDCA phases; a tool can appear in more than one phase." % C.CTX[k]["en"][0].lower() + C.CTX[k]["en"][1:]),
              ex, {"ar": rows_ar, "en": rows_en},
              L(("لوحة قصة بأدوات لكل مرحلة من المراحل الأربع", "A storyboard with tools for each of the four phases"),),
              L(("خطة بلا مرحلة تحقق: أداة في التنفيذ ثم إعلان النجاح", "A plan with no Check phase: a tool in Do, then success is declared"), ("نطاقات الجدول (مثل 13.1 إلى 14.6) تشمل كل أدوات النطاق", "The table's ranges (such as 13.1 to 14.6) cover every tool in the range")),
              B("قائد التحسين", "Improvement lead"), B("نسبة لوحات القصة التي تغطي المراحل الأربع", "Share of storyboards covering all four phases"))


S.append({"id": "A", "grp": "annex", "ph": "use", "col": "#7A869E", "tint": "#EEF1F6",
  "t": B("الملحق A (للعلم) أدوات الجودة على دورة PDCA", "Annex A (informative) Overview of Plan-Do-Check-Act techniques"),
  "s": B("الأدوات على دورة PDCA", "Tools on the PDCA cycle"), "sh": B("A · PDCA", "A · PDCA"),
  "p": B("ثلاثة جداول تضع الأدوات على مراحل الخطة والتنفيذ والتحقق والتصرف في ثلاثة سياقات: الاستراتيجية وتخطيط الأعمال، وتحسين العمليات، والتحسين المستمر.",
         "Three tables place the tools on the Plan, Do, Check and Act phases in three contexts: strategy and business planning, process improvement and continual improvement."),
  "fl": L(("الخطة", "Plan"), ("التنفيذ", "Do"), ("التحقق", "Check"), ("التصرف", "Act")),
  "it": [annex_a_item("s", "A.1", "x:tools", B("الجدول A.1 — الاستراتيجية وتخطيط الأعمال", "Table A.1 — Strategy and business planning"),
                      R(EX, "خطة الواحة لعام 2027: SWOT وPESTLE في الخطة، والرسالة والأهداف في التنفيذ، وبطاقة الأداء المتوازن في التحقق، وتحديث سجل المخاطر في التصرف.", "Al-Waha's 2027 plan: SWOT and PESTLE in Plan, mission and objectives in Do, the balanced scorecard in Check, and the risk register update in Act.")),
         annex_a_item("p", "A.2", "x:tools", B("الجدول A.2 — تحسين العمليات", "Table A.2 — Process improvement"),
                      R(EX, "تحسين استلام الخرسانة: «ما هو / ما ليس» في الخطة، وSIPOC وعظمة السمكة ولماذا الخمس في التنفيذ، وDMAIC في التحقق، وسجل المخاطر في التصرف.", "Improving concrete receiving: is/is not in Plan, SIPOC, fishbone and five whys in Do, DMAIC in Check, the risk register in Act.")),
         annex_a_item("c", "A.3", "x:tools", B("الجدول A.3 — التحسين المستمر", "Table A.3 — Continual improvement"),
                      R(EX, "سلامة الرفع: العصف الذهني في الخطة، وFMEA وعظمة السمكة في التنفيذ، والأدوات 13.1 إلى 13.7 في التحقق، والوسائل المرئية في التصرف.", "Lifting safety: brainstorming in Plan, FMEA and fishbone in Do, tools 13.1 to 13.7 in Check, visual aids in Act."))]})

S.append({"id": "B", "grp": "annex", "ph": "use", "col": "#7A869E", "tint": "#EEF1F6",
  "t": B("الملحق B (للعلم) أمثلة لوحات القصة لتطبيق الأدوات", "Annex B (informative) Storyboard examples for quality tool application"),
  "s": B("لوحة القصة", "Storyboards"), "sh": B("B · القصة", "B · Storyboards"),
  "p": B("لوحة القصة ملخص مرئي في صفحة واحدة لحل قضية من بيان المشكلة: الأدوات التي استُخدمت حتى السبب الجذري، ثم التصحيح والإجراء التصحيحي والتحقق، وتحديث المخاطر والفرص، وتغيير العملية. وتُستخدم في التواصل الداخلي والخارجي.",
         "A storyboard is a one-page visual summary of resolving an issue from the problem statement: the tools used to reach the root cause, then correction, corrective action and validation, the update of risks and opportunities, and the change to the process. It is used in internal and external communication."),
  "fl": L(("بيان المشكلة", "Problem"), ("الأدوات", "Tools"), ("السبب", "Cause"), ("الإجراء", "Action"), ("التوحيد", "Standard")),
  "it": [
    IT("B.1", "IN3", B("الشكل B.1 — الاستراتيجية وعمليات الأعمال: «خطة على صفحة»", "Figure B.1 — Strategy and business process: plan on a page"),
       R(IS, "صفحة واحدة تربط الغرض والنية الاستراتيجية والعمليات والمقاييس والأداء على مراحل PDCA، بأدوات التحليل (SWOT وPESTLE والقوى الست والمقارنة والعصف) في الخطة، وأدوات الأداء (بطاقة الأداء المتوازن وسجل المخاطر والرادار) في التصرف.",
         "one page linking purpose, strategic intent, processes, measures and performance across the PDCA phases, with the analysis tools (SWOT, PESTLE, six forces, benchmarking, brainstorming) in Plan and the performance tools (balanced scorecard, risk register, radar) in Act."),
       R(EX, "لوحة القصة QT-EX-03 في الواحة: خطة 2027 على صفحة واحدة.", "Al-Waha's storyboard QT-EX-03: the 2027 plan on one page."),
       L(("ابنِ لوحة قصة بسياق «الاستراتيجية» في تبويب مستكشف الأدوات", "Build a storyboard with the \"strategy\" context in the tool navigator tab"), ("اربط كل خطوة بتبويبها في استوديو الاستراتيجية", "Link each step to its tab in the strategy studio")),
       L(("خطة على صفحة معتمدة من الإدارة العليا", "A plan on a page approved by top management"),),
       L(("خطة استراتيجية طويلة لا يقرؤها أحد", "A long strategic plan nobody reads"),),
       B("الإدارة العليا", "Top management"), B("—", "—")),
    IT("B.2", "IN3", B("الشكل B.2 — تحسين العمليات بالتسلسل المرجح لدورة PDCA", "Figure B.2 — Process improvement in the likely PDCA sequence"),
       R(IS, "سبع خطوات: اختيار العملية وحدودها، وجمع بيانات الأداء وأثر الأطراف المعنية، ورسم العملية أو تدفق القيمة، ثم رسم الهدر وتحليل السبب الجذري بعظمة السمكة ولماذا، ثم التحليل البياني وتطوير الحلول، ثم تنفيذ الحلول لتحسين التدفق، ثم ضبط التحسينات وتوحيدها.",
         "seven steps: select the process and its boundaries; collect data on process performance and stakeholder impact; map the process or value stream; map waste and analyse root causes with a fishbone and whys; analyse graphically and develop solutions; implement the solutions to improve flow; control and standardize the improvements."),
       R(EX, "لوحة القصة QT-EX-01 في الواحة: رفض شحنات الخرسانة من 6.0% إلى 2.4%.", "Al-Waha's storyboard QT-EX-01: rejected concrete loads from 6.0 % to 2.4 %."),
       L(("ابنِ لوحة قصة بسياق «تحسين العمليات»", "Build a storyboard with the \"process improvement\" context"), ("اربط الخطوات بسجلات باريتو وعظمة السمكة ولماذا الخمس وDMAIC بأرقامها", "Link the steps to the Pareto, fishbone, 5 Whys and DMAIC records by id")),
       L(("لوحة قصة بأدوات مرتبطة بسجلاتها ونتيجة وإجراء موحد", "A storyboard with tools linked to their records, a result and a standard"),),
       L(("القفز من رسم العملية إلى الحل دون تحليل", "Jumping from the process map to the solution with no analysis"),),
       B("مالك العملية", "Process owner"), B("نسبة لوحات القصة المغلقة بنتيجة", "Share of storyboards closed with a result")),
    IT("B.3", "IN3", B("الشكل B.3 — التحسين المستمر في لوحة قصة PDCA", "Figure B.3 — Continuous improvement in a PDCA storyboard"),
       R(IS, "ثماني خطوات تبدأ بتعريف القضية في نظام الإدارة وفهم احتياجات الأطراف المعنية، ثم مخطط التدفق، والسبب الجذري بالتقارب وعظمة السمكة وجمع البيانات، ولماذا الخمس على الأعلى، وفحص الحلول بالرسوم قبل وبعد، والتنفيذ والرصد، ثم تثبيت التغيير في الإجراءات والتدقيق الداخلي عليه. ويذكر الشكل أن البيانات تُجمع لتكون ذات صلة وموثوقة وممثلة وقابلة للقراءة.",
         "eight steps that start by defining the issue in the management system and understanding interested parties' needs, then the flow diagram, the root cause with affinity, fishbone and data collection, five whys on the highest, checking solutions with before-and-after charts, implementing and monitoring, then holding the change in the procedures and auditing it internally. The figure asks for data that are relevant, reliable, representative and readable."),
       R(EX, "لوحة القصة QT-EX-02 في الواحة: منع سقوط الحمولات في رفع حزم الحديد.", "Al-Waha's storyboard QT-EX-02: preventing dropped loads when lifting rebar bundles."),
       L(("ابنِ لوحة قصة بسياق «التحسين المستمر»", "Build a storyboard with the \"continual improvement\" context"), ("سجّل في خطوة التصرف الإجراء أو التعليمات التي تغيرت", "In the Act step record the procedure or instruction that changed")),
       L(("الإجراء المحدَّث ونتيجة التدقيق الداخلي عليه", "The updated procedure and the internal audit result on it"),),
       L(("تحسين لا يصل إلى الإجراءات فيضيع مع الوقت", "An improvement that never reaches the procedures, so it fades"),),
       B("قائد التحسين", "Improvement lead"), B("نسبة التحسينات التي حُدّثت إجراءاتها", "Share of improvements whose procedures were updated"))
  ]})

S.append({"id": "C", "grp": "annex", "ph": "use", "col": "#7A869E", "tint": "#EEF1F6",
  "t": B("الملحق C (للعلم) ملخص خصائص أدوات الجودة", "Annex C (informative) Summary of the attributes of quality tools"),
  "s": B("خصائص الأدوات", "Attributes of the tools"), "sh": B("C · الخصائص", "C · Attributes"),
  "p": B("جدول واحد يعطي لكل أداة: مجال الاستخدام، ومنتج أو خدمة أو كليهما، وفريق أو فرد، والحد الأدنى من البيانات، ومستوى الكفاءة، وجهد التطبيق.",
         "One table that gives each tool its area of use, product or service or both, team or individual, minimum data quantity, level of capability and effort to apply."),
  "fl": L(("المجال", "Area"), ("فريق / فرد", "Team / individual"), ("البيانات", "Data"), ("الكفاءة", "Capability"), ("الجهد", "Effort")),
  "it": [
    IT("C.1", "SL2", B("الجدول C.1 — كيف تقرأ خصائص الأداة", "Table C.1 — How to read a tool's attributes"),
       R(IS, "لكل أداة: مجال الاستخدام (مثل الاستراتيجية، أو حل المشكلات، أو الضبط الإحصائي)، وهل تخص المنتج أو الخدمة أو كليهما (وبعضها للتصنيع فقط)، وهل يطبقها فريق أو فرد أو أيهما، وأقل كمية بيانات تلزمها (صغيرة أو متوسطة أو كبيرة أو أي حجم)، ومستوى الكفاءة بنقطة إلى ثلاث نقاط، وجهد التطبيق (سهل أو متوسط أو صعب).",
         "for each tool: the area of use (such as strategy, problem solving or SPC), whether it applies to product, service or both (some to manufacturing only), whether a team, an individual or either applies it, the minimum data quantity (small, medium, large or any size), the level of capability from one to three dots, and the effort to apply (easy, medium or difficult)."),
       R(EX, "Six Sigma في الجدول: فريق، وبيانات كبيرة، و•••، وصعب؛ فلم تبدأ به الواحة إلا بعد تدريب قائد المشروع.", "Six Sigma in the table: team, large data, •••, difficult; so Al-Waha started it only after training the project lead."),
       L(("طابق خصائص الأداة مع موارد الفريق قبل البدء", "Match the tool's attributes with the team's resources before starting"), ("مستكشف الأدوات يقرأ هذه الخصائص ويحذر من عدم التطابق", "The tool navigator reads these attributes and warns about mismatches")),
       L(("مبرر اختيار يذكر خصائص الأداة", "A reason for the choice that names the tool's attributes"),),
       L(("الجدول يكتب TQM برقم 16.3 بينما رقمها في النص 16.2، وCTQ (13.6) بلا خصائص إلا الكفاءة", "The table lists TQM as 16.3 while the text numbers it 16.2, and CTQ (13.6) has only its capability level"),),
       B("مدير الجودة", "Quality manager"), B("نسبة الخطوات المطابقة لموارد الفريق", "Share of steps that match the team's resources")),
    IT("GD-3", "RV2", B("الفجوات الشائعة وما يطلبه المدقق", "Common gaps and what an auditor asks for"),
       R(GD, "أكثر ما يضعف استخدام الأدوات: أداة بلا غرض مكتوب، وأداة صعبة بلا شخص مدرب، وتحليل على بيانات لا يُوثق بها، ورسوم ملونة بلا أرقام ولا فترة، وأدوات «حية» (SWOT وPESTLE وسجل المخاطر وFMEA وخطة الضبط) لا تُراجع، ونتائج لا تصل إلى المخاطر والأهداف والإجراءات، والحكم على الأداة بأنها «عُبئت» لا بأنها «أوصلت إلى نتيجة». والمدقق يسأل عادة: كيف تحللون البيانات وتقيمونها (9.1.3)؟ وكيف حددتم أسباب عدم المطابقة (10.2.1)؟ وأين الدليل على فعالية الإجراء؟",
         "what weakens the use of tools most: a tool with no written aim, a difficult tool with nobody trained, analysis on data that cannot be trusted, coloured charts with no numbers or period, \"living\" tools (SWOT, PESTLE, risk register, FMEA, control plan) never reviewed, results that never reach risks, objectives and procedures, and judging a tool by being \"filled in\" rather than by \"leading to a result\". An auditor usually asks: how do you analyse and evaluate data (9.1.3)? How did you determine the causes of the nonconformity (10.2.1)? Where is the evidence that the action worked?"),
       R(EX, "التدقيق الآلي على لوحات قصة الواحة: QT-EX-01 ناجحة كلها، وQT-EX-02 ينقصها مراجعة بعد التنفيذ.", "The automatic audit on Al-Waha's storyboards: QT-EX-01 passes every check, QT-EX-02 still lacks a review after implementation."),
       L(("راجع تبويب التدقيق قبل كل مراجعة إدارة", "Check the Audit tab before each management review"),),
       L(("نتيجة التدقيق الآلي لكل لوحة قصة", "The automatic audit result for each storyboard"),),
       L(("أدوات كثيرة بلا نتيجة", "Many tools and no result"),),
       B("المدقق الداخلي", "Internal auditor"), B("نسبة الفحوص الناجحة", "Audit pass rate"),
       [REF("ISO 9001:2026 9.1.3", "ISO 9001:2026 9.1.3"), REF("ISO 9001:2026 10.2.1", "ISO 9001:2026 10.2.1")])
  ]})

# ---------------------------------------------------------------- std (method guide)
std = {
    "purpose": B("أن تُختار أداة الجودة بغرضها لا بعادتها: لوصف عملية أو متغير، أو لحل مشكلة، أو لإبراز ما يحتاج تحسيناً، أو لرفع الفعالية؛ وأن تُطبق بما تحتاجه من فريق وبيانات وكفاءة وجهد، وأن تُروى نتائجها في لوحة قصة واحدة من المشكلة إلى الإجراء الموحد.",
                 "To choose a quality tool for its purpose, not by habit: to characterize a process or variable, solve a problem, highlight what needs improving or raise effectiveness; to apply it with the team, data, capability and effort it needs; and to tell its results in one storyboard from the problem to the standard."),
    "who": B("مديرو الجودة وقادة التحسين ومالكو العمليات والمدققون الداخليون والإدارة العليا، وكل من يختار أداة لعمل في نظام إدارة الجودة.",
             "Quality managers, improvement leads, process owners, internal auditors and top management, and anyone choosing a tool for work in a quality management system."),
    "rolesSub": B("الأداة لا تعطي نتيجة وحدها؛ تعطيها بمن يختارها ويقودها ويستخدم مخرجاتها. هذا توزيع مقترح للأدوار.", "A tool gives no result on its own; it gives one through who chooses it, leads it and uses its outputs. This is a suggested split of roles."),
    "roles": [
        {"n": B("الإدارة العليا", "Top management"), "col": "#1B2A4A", "d": B("تستخدم أدوات الاستراتيجية والأهداف، وتطلب مخرجات الأدوات في مراجعة الإدارة.", "Uses the strategy and objective tools, and asks for tool outputs in management review."), "tool": B("SWOT · PESTLE · MBO", "SWOT · PESTLE · MBO")},
        {"n": B("مدير الجودة", "Quality manager"), "col": "#B8901E", "d": B("يعتمد مجموعة أدوات المنشأة، ويحدد الكفاءة اللازمة لكل أداة، ويراجع جودة استخدامها.", "Adopts the organization's toolkit, sets the competence each tool needs and reviews how well tools are used."), "tool": B("الملحق C · 7.2", "Annex C · 7.2")},
        {"n": B("مالك العملية", "Process owner"), "col": "#1E8C93", "d": B("يرسم عمليته ويضبطها ويحدّث خطة الضبط وFMEA بعد كل عدم مطابقة.", "Maps and controls the process, and updates the control plan and FMEA after each nonconformity."), "tool": B("SIPOC · خطة الضبط", "SIPOC · Control plan")},
        {"n": B("الميسّر وفريق التحسين", "Facilitator and improvement team"), "col": "#3563C9", "d": B("يطبق الأدوات بالبيانات، ويروي النتيجة في لوحة القصة.", "Applies the tools with data, and tells the result in the storyboard."), "tool": B("البند 14 · الملحق B", "Clause 14 · Annex B")},
        {"n": B("المدقق الداخلي", "Internal auditor"), "col": "#C2410C", "d": B("يستخدم مخطط السلحفاة وقوائم التحقق، ويفحص هل أوصلت الأداة إلى نتيجة.", "Uses turtle diagrams and checklists, and checks whether the tool led to a result."), "tool": B("6.2 · 9.1.3", "6.2 · 9.1.3")},
    ],
    "map": [
        {"no": "1", "t": B("حدد الغرض", "Set the aim"), "d": B("وصف، حل مشكلة، إبراز تحسين، فعالية.", "Characterize, solve, highlight, effectiveness."), "go": "1"},
        {"no": "2", "t": B("حدد المرحلة والسياق", "Place the phase and context"), "d": B("PDCA في الاستراتيجية أو العمليات أو التحسين المستمر.", "PDCA in strategy, process or continual improvement."), "go": "A.2"},
        {"no": "3", "t": B("ابحث من البند المقابل", "Search from the matching clause"), "d": B("الأدوات مرتبة بتسلسل ISO 9001.", "Tools follow the ISO 9001 sequence."), "go": "4.1"},
        {"no": "4", "t": B("راجع خصائص الأداة", "Check the tool's demands"), "d": B("فريق، بيانات، كفاءة، جهد.", "Team, data, capability, effort."), "go": "C.1"},
        {"no": "5", "t": B("تأكد من الكفاءة", "Make sure of competence"), "d": B("الأدوات •• و••• تحتاج تدريباً.", "•• and ••• tools need training."), "go": "GD-2"},
        {"no": "6", "t": B("عرّف المشكلة", "Define the problem"), "d": B("ما هو وما ليس.", "Is and is not."), "go": "14.6"},
        {"no": "7", "t": B("ثق بالبيانات", "Trust the data"), "d": B("قياس موثوق قبل التحليل.", "A trusted measurement before analysis."), "go": "13.8"},
        {"no": "8", "t": B("اروِ القصة", "Tell the story"), "d": B("لوحة قصة في صفحة.", "A one-page storyboard."), "go": "B.2"},
        {"no": "9", "t": B("غذِّ النظام", "Feed the system"), "d": B("المخاطر والأهداف والإجراءات.", "Risks, objectives and procedures."), "go": "7.2"},
        {"no": "10", "t": B("راجع الأدوات الحية", "Review the living tools"), "d": B("SWOT وFMEA وخطة الضبط.", "SWOT, FMEA and the control plan."), "go": "GD-3"},
    ],
    "rel": [
        {"code": "Pareto · RCA · 5 Whys · Fishbone", "n": B("أدوات البند 14 و13.7 المستقلة", "The dedicated tools of clause 14 and 13.7"), "col": "#C2410C",
         "d": B("13.7 باريتو، و14.1 تحليل السبب الجذري، و14.4 لماذا الخمس، و14.5 عظمة السمكة: أدوات مستقلة في صندوق الأدوات، تُربط بلوحة القصة برقم السجل.", "13.7 Pareto, 14.1 root cause analysis, 14.4 five whys and 14.5 fishbone: dedicated toolbox tools, linked to the storyboard by record id."), "tool": "./pareto.html"},
        {"code": "DMAIC", "n": B("مشروع DMAIC (16.1 Six Sigma)", "DMAIC project (16.1 Six Sigma)"), "col": "#1B2A4A",
         "d": B("منهجية مشروع Six Sigma، ويضم SIPOC (6.1) وشجرة CTQ (13.6) والتحقق من القياس (13.8) وخطة الضبط (6.3).", "The Six Sigma project method; it holds SIPOC (6.1), CTQs (13.6), the measurement check (13.8) and the control plan (6.3)."), "tool": "./dmaic.html"},
        {"code": "FMEA", "n": B("دراسة FMEA (7.3)", "FMEA study (7.3)"), "col": "#B42318",
         "d": B("أداة مستقلة: مقاييس مكتوبة قبل التقييم، وأولوية إجراء بالخطورة أولاً، وإعادة تقييم بالدليل، ومراجعة بعد التغيير؛ تربطها خطوة 7.3 في لوحة القصة برقم الدراسة.", "A dedicated tool: scales written before the rating, action priority with severity first, re-rating with evidence, and a review after a change; a 7.3 storyboard step links it by study id."), "tool": "./fmea.html"},
        {"code": "PDCA · A3 · CAPA", "n": B("PDCA وA3 وCAPA (15.6 و14.7)", "PDCA, A3 and CAPA (15.6 and 14.7)"), "col": "#3C9A5F",
         "d": B("دورة PDCA وA3 و8D مذكورة في «أدوات أخرى ذات صلة»، وهي أدوات مستقلة في المنصة.", "PDCA, A3 and 8D are named under \"other relevant tools\", and they are dedicated platform tools."), "tool": "./pdca.html"},
        {"code": "Strategy", "n": B("استوديو الاستراتيجية والأداء (البندان 5 و8)", "Strategy & Performance Studio (clauses 5 and 8)"), "col": "#3563C9",
         "d": B("SWOT وPESTLE والرسالة والرؤية والأهداف ومؤشراتها وبطاقة الأداء المتوازن.", "SWOT, PESTLE, mission and vision, objectives and their KPIs, and the balanced scorecard."), "tool": "./strategy-performance.html"},
        {"code": "Operations", "n": B("مركز التميز التشغيلي (البند 6)", "Operations Excellence Center (clause 6)"), "col": "#1E8C93",
         "d": B("SIPOC ومصفوفة RACI وخريطة العمليات ونضجها.", "SIPOC, the RACI matrix, the process map and process maturity."), "tool": "./operations-excellence.html"},
        {"code": "ISO 31000", "n": B("استوديو المخاطر ISO 31000 (البند 7)", "ISO 31000 Risk Studio (clause 7)"), "col": "#B42318",
         "d": B("سجل المخاطر وخريطة الحرارة.", "The risk register and the heat map."), "tool": "./iso31000-risk-studio.html"},
        {"code": "Smart Audit", "n": B("التدقيق الذكي والتحسين", "Smart Audit & Improvement"), "col": "#7B5BB8",
         "d": B("قوائم التحقق، وصندوق أدوات مرتبط بالملاحظات يضم FMEA.", "Checklists, and a toolbox linked to findings that includes FMEA."), "tool": "./smart-audit-improvement.html"},
    ],
    "comp": [
        {"code": "ISO 9001:2026 §A.9.1", "n": B("الملحق A.9.1 وملاحظتاه 3 و4", "Annex A.9.1 and its notes 3 and 4"),
         "d": B("تحيل الملاحظة 3 إلى ISO 10009 للإرشاد في أدوات الجودة، والملاحظة 4 إلى ISO 10017 للأساليب الإحصائية. والملاحق والملاحظات شرح لا متطلبات.", "NOTE 3 points to ISO 10009 for guidance on quality tools and NOTE 4 to ISO 10017 for statistical techniques. Annexes and notes explain; they set no requirements.")},
        {"code": "ISO 9001:2026 §0.3.2 · §9.1.3 · §10.2", "n": B("دورة PDCA والتحليل والإجراء التصحيحي", "PDCA cycle, analysis and corrective action"),
         "d": B("تشرح المقدمة دورة PDCA، ويطلب البند 9.1.3 تحليل البيانات وتقييمها، والبند 10.2 تحديد أسباب عدم المطابقة ومراجعة فعالية الإجراء.", "The introduction explains PDCA; clause 9.1.3 asks for analysis and evaluation of data, and 10.2 for determining the causes of nonconformities and reviewing the effectiveness of the action.")},
        {"code": "ISO 9000:2026 §4.2.6 · §4.2.7", "n": B("مبدأ التحسين والقرار المبني على الدليل", "Improvement and evidence-based decision-making"),
         "d": B("ISO 9000 هي المرجع المعياري الوحيد لـ ISO 10009.", "ISO 9000 is the only normative reference of ISO 10009.")},
        {"code": "ISO 10017 · ISO 10005 · ISO 10004 · ISO 10014", "n": B("مواصفات مساندة (غير متحقق منها)", "Supporting standards (not verified)"),
         "d": B("الأساليب الإحصائية وخطط الجودة ورضا العملاء والفوائد المالية والاقتصادية: تذكرها ISO 10009 لكنها غير مرفوعة إلى المشروع.", "Statistical techniques, quality plans, customer satisfaction and financial and economic benefits: ISO 10009 names them, but they are not uploaded to the project.")},
    ],
    "buy": [],
    "buyNote": B("للنص الرسمي للمواصفات استخدم النسخ المنشورة من المنظمة الدولية للتوحيد القياسي أو الجهات الوطنية الأعضاء، وليس هذه المنصة.",
                 "For the official text of the standards, use the copies published by the International Organization for Standardization or its national member bodies, not this platform.")
}

meta = {
    "code": "ISO 10009:2024",
    "name": B("إدارة الجودة — إرشاد لأدوات الجودة وتطبيقها", "Quality management — Guidance for quality tools and their application"),
    "edition": B("الإصدار الأول، يونيو 2024 (اللجنة ISO/TC 176/SC 3)", "First edition, June 2024 (ISO/TC 176/SC 3)"),
    "status": B("مواصفة إرشادية تساند ISO 9001؛ 53 أداة مشروحة في البنود 5 إلى 16", "Guidance standard supporting ISO 9001; 53 tools reviewed in clauses 5 to 16"),
    "cert": False,
    "certNote": B("ISO 10009 دليل إرشادي، وليست مواصفة إشهاد: لا يُمنح عليها شهادة، ولا يدقق عليها المدقق، وإنما تساعد على تلبية ما تطلبه ISO 9001:2026 من تحليل وتقييم (9.1.3) وتحديد أسباب (10.2.1) وتحسين (10.1). وتحيل إليها الملاحظة 3 في الملحق A.9.1 من ISO 9001:2026.",
                  "ISO 10009 is a guidance document, not a certification standard: no certificate is issued against it and auditors do not audit against it; it helps meet what ISO 9001:2026 asks for in analysis and evaluation (9.1.3), determining causes (10.2.1) and improvement (10.1). NOTE 3 of Annex A.9.1 of ISO 9001:2026 points to it."),
    "verified": B("2026-10-16، من الملف المرفوع ISO-10009-2024-Quality-Management-Guidance-for-Quality-Tools.pdf ‏(BS ISO 10009:2024، الإصدار الأول 2024-06): أرقام البنود وأسماء الأدوات، وخصائص الجدول C.1، ومواقع الجداول A.1 إلى A.3؛ ومن ISO_9001_2026en 1.pdf: الملحق A.9.1 وملاحظتاه وعناوين البنود المذكورة. كل شرح ملخص تفسيري، وليس النص الرسمي. ISO 10017 وISO 10005 وISO 10004 وISO 10014 ومراجع قائمة المراجع غير مرفوعة: «غير متحقق منها».",
                  "2026-10-16, against the uploaded file ISO-10009-2024-Quality-Management-Guidance-for-Quality-Tools.pdf (BS ISO 10009:2024, first edition 2024-06): clause numbers and tool names, the attributes of Table C.1 and the placements of Tables A.1 to A.3; and against ISO_9001_2026en 1.pdf: Annex A.9.1 with its notes and the clause titles named. Every explanation is an interpretive summary, not the official text. ISO 10017, ISO 10005, ISO 10004, ISO 10014 and the bibliography references are not uploaded: “not verified”.")
}

texts = {
    "stdT": B("دليل المواصفة", "Standard guide"),
    "stdS": B("ما هي ISO 10009، ولمن، وكيف تُستخدم: الأغراض الأربعة، وترتيب الأدوات، ودورة PDCA، ولوحات القصة، وخصائص الأدوات، والكفاءة، وصلتها بـ ISO 9001:2026 وبأدوات المنصة.",
              "What ISO 10009 is, who it is for and how to use it: the four aims, how the tools are arranged, the PDCA cycle, storyboards, the attributes of the tools, competence, and how it links to ISO 9001:2026 and to the platform's tools."),
    "clT": B("دليل البنود والأدوات", "Clause and tool guide"),
    "clS": B("البنود 1 إلى 16 والملاحق A وB وC بأرقامها في النص المرفوع، ولكل أداة من الأدوات الـ 53: ملخص تفسيري، ومثال، والفائدة، ومكانها في المنصة، ومرحلتها في الملحق A، والمخرج، ونقاط تُراعى، والبنود التي تخدمها في ISO 9001:2026.",
             "Clauses 1 to 16 and Annexes A, B and C, numbered as in the uploaded text; for each of the 53 tools: an interpretive summary, an example, the benefit, where it is on the platform, its phase in Annex A, the output, points to note, and the ISO 9001:2026 clauses it serves."),
    "note": B("ما يرد تحت «ما تقوله المواصفة» ملخص تفسيري بصياغة مستقلة، وليس النص الرسمي. وما تحت «كيف تطبقه» و«نقاط تُراعى» إرشاد تطبيقي. وربط كل بند بـ ISO 9001:2026 من الكاتب، لأن ISO 10009 تقول فقط إن ترتيبها يتبع تسلسل ISO 9001 تقريباً. أرقام البنود وعناوينها تُحقق منها من النص المرفوع.",
              "Text under “what the standard says” is an interpretive summary in independent wording, not the official text. “How to apply” and “points to note” are practical guidance. The link of each clause to ISO 9001:2026 is the author's, since ISO 10009 says only that its order follows ISO 9001 approximately. Clause numbers and titles were checked against the uploaded text."),
    "chgT": B("ما الذي تغيّر", "What changed"), "chgS": B("", "")
}

legend = [[p["c"], p["n"]] for p in phases.values()]


def cov(code):
    ts = [t for t in C.T if t["sec"] == code]
    on = [t for t in ts if t["lv"] in ("own", "in", "here")]
    return "full" if len(on) == len(ts) else ("part" if on else "none")


diagram = {"type": "layers", "status": {"full": {"t": B("كلها في المنصة", "All on the platform"), "col": "#2F7D4B"},
                                         "part": {"t": B("بعضها في المنصة", "Some on the platform"), "col": "#B8901E"},
                                         "none": {"t": B("ليست في المنصة بعد", "Not on the platform yet"), "col": "#7A869E"}},
           "bands": [
               {"t": B("كيف تُستخدم المواصفة", "How to use the standard"), "s": B("المجال، والترتيب، والملاحق", "Scope, arrangement and annexes"), "col": "#7A869E", "tint": "#F3F5F9",
                "nodes": [{"go": "1–3", "t": B("1–3 المجال", "1–3 Scope"), "s": B("أربعة أغراض", "Four aims")}, {"go": "4", "t": B("4 الترتيب", "4 Arrangement"), "s": B("الاختيار والكفاءة", "Choice and competence")},
                          {"go": "A", "t": B("A دورة PDCA", "A PDCA"), "s": B("ثلاثة جداول", "Three tables")}, {"go": "B", "t": B("B لوحات القصة", "B Storyboards"), "s": B("ثلاثة أشكال", "Three figures")},
                          {"go": "C", "t": B("C الخصائص", "C Attributes"), "s": B("الجدول C.1", "Table C.1")}]},
           ] + [{"t": phases[ph]["n"], "s": B("البنود " + " و".join(cs), "Clauses " + ", ".join(cs)), "col": phases[ph]["c"], "tint": phases[ph]["t"],
                 "nodes": [{"go": c, "t": B(c + " " + dict((x[0], x[1]) for x in C.CLAUSES)[c]["ar"], c + " " + dict((x[0], x[1]) for x in C.CLAUSES)[c]["en"]),
                            "s": B("%d أدوات" % len([t for t in C.T if t["sec"] == c]), "%d tools" % len([t for t in C.T if t["sec"] == c])), "st": cov(c)} for c in cs]}
                for ph, cs in (("plan", ["5", "6", "7", "8"]), ("cust", ["9", "10", "11", "12"]), ("meas", ["13", "14", "15", "16"]))],
           "foot": B("اضغط أي بند لفتح أدواته. الشارة تبين هل أدوات البند موجودة في المنصة.", "Select any clause to open its tools. The badge shows whether the clause's tools are on the platform.")}

edges = [["1", "4.1"], ["4.1", "GD-1"], ["GD-1", "C.1"], ["C.1", "GD-2"], ["4.1", "A.1"], ["A.2", "B.2"], ["A.3", "B.3"], ["A.1", "B.1"],
         ["5.1", "7.2"], ["5.2", "7.2"], ["5.2", "5.1"], ["5.4", "8.2"], ["8.3", "8.2"], ["7.1", "7.3"], ["7.3", "6.3"], ["7.2", "7.4"],
         ["6.4", "6.3"], ["6.1", "6.2"], ["6.1", "16.1"], ["13.6", "16.1"], ["13.8", "16.1"], ["13.7", "14.5"], ["15.4", "14.5"], ["15.2", "15.4"],
         ["14.6", "14.1"], ["14.5", "14.4"], ["14.4", "14.1"], ["14.1", "6.3"], ["12.1", "6.3"], ["12.3", "13.7"], ["9.2", "9.1"], ["9.3", "9.1"],
         ["9.4", "14.2"], ["10.6", "10.3"], ["10.3", "10.2"], ["11.1", "10.8"], ["11.2", "11.1"], ["10.7", "13.7"], ["13.4", "15.1"],
         ["9001 A.9.1", "13.1"], ["GD-3", "9001 A.9.1"], ["16.2", "8.1"], ["8.1", "15.3"]]

DATA = {
    "meta": meta, "std": std, "texts": texts, "phases": phases, "flags": flags, "legend": legend,
    "diagram": diagram,
    "matrix": {"tab": "tools", "d": B("اختر الأداة المناسبة لغرضك ومرحلتك ومواردك، ثم ابنِ بها لوحة قصة مرتبطة بسجلات أدوات المنصة.", "Pick the right tool for your aim, phase and resources, then build a storyboard linked to the records of the platform's tools."),
               "btn": B("افتح مستكشف الأدوات", "Open the tool navigator")},
    "sections": S, "paths": [], "edges": edges,
    "changes": {"note": B("", ""), "tlT": B("", ""), "tlS": B("", ""), "tlCols": 4, "tl": [], "cardsT": B("", ""), "cardsS": B("", ""), "cards": [],
                "corr": {"t": B("", ""), "s": B("", ""), "h": [], "rows": []}, "steps": {"t": B("", ""), "s": B("", ""), "l": B("", "")}},
    "ui": {
        "ar": {"roles": "من يستخدم الأدوات في المنشأة", "wheelT": "خريطة البنود", "wheelHint": "اضغط أي بند لفتح أدواته", "purpose": "الغرض من المواصفة",
               "smap": "عشر خطوات لاستخدام المواصفة", "smapSub": "كل خطوة في سطر. اضغط «اشرح» لفتح البند أو الأداة التي تخدمها.",
               "rel": "علاقتها بأدوات المنصة", "comp": "المراجع المساندة", "idxCore": "البنود", "idxAnnex": "الملاحق", "items": "عناصر", "controls": "عناصر",
               "pReq": "ما تقوله المواصفة", "pHow": "كيف تطبقه", "pEv": "المخرج والدليل", "pGap": "نقاط تُراعى", "cnt": "{n} عناصر", "cntC": "{n} عناصر",
               "assess": "قيّم هذا في التقييم الذاتي", "assessC": "قيّم هذا في التقييم الذاتي",
               "assessOff": "هذا البند خارج أسئلة التقييم الذاتي، ويُطبَّق مباشرة في مستكشف الأدوات ولوحة القصة.", "offGo": "افتح مستكشف الأدوات",
               "actCtx": "يفتح السؤال {s}", "explainA": "اشرح {c} في دليل البنود", "clause": "البند", "group": "الملحق"},
        "en": {"roles": "Who uses the tools in the organization", "wheelT": "Map of the clauses", "wheelHint": "Select any clause to open its tools", "purpose": "What the standard is for",
               "smap": "Ten steps to use the standard", "smapSub": "One line per step. Select “Explain” to open the clause or tool it serves.",
               "rel": "How it connects to the platform's tools", "comp": "Supporting references", "idxCore": "Clauses", "idxAnnex": "Annexes", "items": "items", "controls": "items",
               "pReq": "What the standard says", "pHow": "How to apply it", "pEv": "Output and evidence", "pGap": "Points to note", "cnt": "{n} items", "cntC": "{n} items",
               "assess": "Assess this in the self-assessment", "assessC": "Assess this in the self-assessment",
               "assessOff": "This item is outside the self-assessment questions; it is applied directly in the tool navigator and the storyboard.", "offGo": "Open the tool navigator",
               "actCtx": "Opens question {s}", "explainA": "Explain {c} in the clause guide", "clause": "Clause", "group": "Annex"}
    }
}

# every question of the self-assessment has at least one item, and every item code is unique
_codes = [i["c"] for s in S for i in s["it"]]
assert len(_codes) == len(set(_codes)), [c for c in _codes if _codes.count(c) > 1]
_q = set(i["q"] for s in S for i in s["it"])
for q in ["SL1", "SL2", "SL3", "CP1", "CP2", "DT1", "DT2", "DT3", "TM1", "TM2", "IN1", "IN2", "IN3", "RV1", "RV2", "RV3"]:
    assert q in _q, q

if __name__ == "__main__":
    js = ("/* ISO 10009:2024 explanation data for the CIA Explain Kit v1.4. ISO 10009 is a guidance standard, not a certifiable one.\n"
          "   Clause numbers, titles, tool names, Annex A placements and Table C.1 attributes checked on 2026-10-16 against the uploaded ISO 10009:2024 text;\n"
          "   ISO 9001:2026 references against the uploaded ISO 9001:2026 text. Summaries are interpretive, not the official text; ISO 10017 and the other\n"
          "   standards ISO 10009 names are not uploaded (\"not verified\"). */\n"
          "const EXPLAIN_10009=" + json.dumps(DATA, ensure_ascii=False, indent=1) + ";\n")
    sys.stdout.write(js)
