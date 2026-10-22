"""EXPLAIN_CAPA — data for the CIA Explain Kit v1.4 in modules/capa.html (build step 2026-10-11).
Clause numbers and titles checked on 2026-10-11 against the uploaded official texts only:
  ISO 9001:2026 (sixth edition, 2026-09)  — 3.16, 3.17, 6.1, 6.1.1, 6.1.2, 7.5, 7.5.3, 8.7, 8.7.1, 8.7.2, 9.1.3, 9.2, 9.2.2,
                                           9.3, 9.3.2, 9.3.3, 10.1, 10.2, 10.2.1 a)–f), 10.2.2, Annex A.10.2
  ISO 9000:2026 (fifth edition, 2026-05)  — 3.5.13 nonconformity, 3.6.2 preventive action, 3.6.3 correction,
                                           3.6.4 corrective action, 3.7.17 effectiveness
  ISO 19011:2026 (fourth edition, 2026-05) — 3.11 audit finding, 6.7 conducting the audit follow-up
No text of a standard is reproduced: every "requirement" is an interpretive summary in independent wording.
Items coded GD-n are the author's practical guidance, not clauses. Usage: python3 data_capa.py > explain_capa.js"""
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
    "code": "CAPA",
    "name": B("CAPA — الإجراءات التصحيحية", "CAPA — Corrective action"),
    "edition": B("أداة منهجية مبنية على ISO 9001:2026 البند 10.2", "Method tool built on ISO 9001:2026 clause 10.2"),
    "status": B("الأداة الثانية في صندوق أدوات التحسين المستمر", "Second tool in the Continual Improvement Toolbox"),
    "cert": False,
    "certNote": B("CAPA طريقة عمل وليست مواصفة إشهاد. المتطلب الذي تخدمه هو البند 10.2 من ISO 9001:2026، ويُدقَّق عليه ضمن نظام إدارة الجودة.",
                  "CAPA is a way of working, not a certification standard. The requirement it serves is clause 10.2 of ISO 9001:2026, which is audited as part of the quality management system."),
    "verified": B("2026-10-11، من الملفات الرسمية المرفوعة إلى المشروع: ISO_9001_2026en 1.pdf وISO 9000-2026.pdf وISO 19011 2026 Standard.pdf. كل «متطلب» ملخص تفسيري، وليس النص الرسمي.",
                  "2026-10-11, against the official files uploaded to the project: ISO_9001_2026en 1.pdf, ISO 9000-2026.pdf and ISO 19011 2026 Standard.pdf. Every “requirement” is an interpretive summary, not the official text.")
}

std = {
    "purpose": B("أن تعالج كل عدم مطابقة مرتين: مرة بتصحيح الحالة نفسها، ومرة بإزالة سببها حتى لا تتكرر في المكان نفسه ولا في مكان آخر. ثم تثبت بالبيانات أن الإجراء نجح قبل أن يُغلق السجل.",
                 "To deal with every nonconformity twice: once by correcting the case itself, and once by removing its cause so it does not recur there or elsewhere. Then prove with data that the action worked before the record is closed."),
    "who": B("مالكو العمليات، ومديرو الجودة والسلامة والبيئة، ومشرفو المواقع والإنتاج، والمدققون الداخليون، والإدارة العليا التي تراجع الاتجاهات وتقرر الموارد.",
             "Process owners, quality, HSE and environment managers, site and production supervisors, internal auditors, and top management, who review trends and decide on resources."),
    "rolesSub": B("الإجراء التصحيحي عمل فريق. هذا توزيع مقترح للأدوار، وتعدّله المنشأة بحسب هيكلها.",
                  "Corrective action is team work. This is a suggested split of roles; adjust it to your structure."),
    "roles": [
        {"n": B("من يكتشف", "Whoever finds it"), "col": "#C2410C", "d": B("مفتش أو مدقق أو أي موظف: يسجّل عدم المطابقة بدليل ويبلغ فوراً.", "An inspector, an auditor or any employee: records the nonconformity with evidence and reports it at once.")},
        {"n": B("مالك العملية", "Process owner"), "col": "#1B2A4A", "d": B("يتفاعل مع الحالة، ويقود تحليل السبب، ويملك خطة الإجراء.", "Reacts to the case, leads the cause analysis and owns the action plan.")},
        {"n": B("مالك الإجراء", "Action owner"), "col": "#3563C9", "d": B("ينفذ إجراءه في موعده ويحفظ دليل التنفيذ.", "Carries out the action on time and keeps the implementation evidence.")},
        {"n": B("مسؤول الجودة", "Quality officer"), "col": "#C9821A", "d": B("يتابع المواعيد، ويراجع الفعالية، ويحلل الاتجاهات.", "Tracks dates, reviews effectiveness and analyses trends.")},
        {"n": B("المعتمد", "Approver"), "col": "#3C9A5F", "d": B("مدير مخوّل يوافق على الإغلاق بعد ثبوت الفعالية.", "An authorized manager who approves closure once effectiveness is shown.")},
        {"n": B("الإدارة العليا", "Top management"), "col": "#7B5BB8", "d": B("تراجع اتجاهات عدم المطابقة والإجراءات، وتقرر الموارد والتغييرات.", "Reviews trends in nonconformities and actions, and decides on resources and changes.")},
        {"n": B("المدقق الداخلي", "Internal auditor"), "col": "#1E8C93", "d": B("يتحقق في المتابعة من إنجاز الإجراءات ومن فعاليتها.", "Verifies at follow-up that actions were completed and were effective.")}
    ],
    "map": [
        {"no": "1", "t": B("التفاعل", "React"), "d": B("صحّح الحالة واحتوِها وتعامل مع عواقبها، بتاريخ.", "Correct and contain the case and deal with its consequences, with a date."), "go": "10.2.1 a"},
        {"no": "2", "t": B("تحليل السبب", "Analyse the cause"), "d": B("حدّد السبب الجذري بطريقة معروفة ودليل، وابحث عن الحالات المشابهة.", "Find the root cause with a known method and evidence, and look for similar cases."), "go": "10.2.1 b"},
        {"no": "3", "t": B("خطة الإجراء", "Action plan"), "d": B("إجراءات تعالج السبب، لكل منها مالك وموعد وحالة.", "Actions that remove the cause, each with an owner, a due date and a status."), "go": "10.2.1 c"},
        {"no": "4", "t": B("التنفيذ والدليل", "Implement and keep evidence"), "d": B("نفّذ الإجراءات واحفظ دليل كل منها مع السجل.", "Carry out the actions and keep the evidence of each with the record."), "go": "10.2.2"},
        {"no": "5", "t": B("مراجعة الفعالية", "Effectiveness review"), "d": B("قِس بمعيار محدد في موعد محدد؛ «غير فعال» يعيد فتح السجل.", "Measure against a set criterion on a set date; “not effective” reopens the record."), "go": "10.2.1 d"},
        {"no": "6", "t": B("التحديثات", "Updates"), "d": B("حدّث المخاطر والفرص ونظام الإدارة عند الحاجة.", "Update risks and opportunities and the management system where needed."), "go": "10.2.1 e"},
        {"no": "7", "t": B("الإغلاق", "Closure"), "d": B("أغلق بتبرير وموافقة شخص مخوّل بعد ثبوت الفعالية.", "Close with a justification and an authorized approval once effectiveness is shown."), "go": "7.5.3"}
    ],
    "rel": [
        {"code": "PDCA", "n": B("دورة التحسين المستمر", "Continual improvement cycle"), "col": "#1E8C93",
         "d": B("عندما يحتاج الإجراء التصحيحي تغييراً يُقاس على مراحل، تحمله دورة PDCA ويُسجَّل رقمها في سجل CAPA.", "When a corrective action needs a change measured in stages, a PDCA cycle carries it and its number is written in the CAPA record."), "tool": "./pdca.html"},
        {"code": "AUDIT", "n": B("مركز التدقيق والتحسين الذكي", "Smart audit & improvement center"), "col": "#C9821A",
         "d": B("الملاحظات والإجراءات المسجلة هناك تُستورد هنا بعد المعاينة، دون أي تعديل على بيانات المركز.", "Findings and actions recorded there are imported here after a preview, with no change to the center's data."), "tool": "./smart-audit-improvement.html"},
        {"code": "ISO 9001", "n": B("نظام إدارة الجودة", "Quality management system"), "col": "#1B2A4A",
         "d": B("البند 10.2 جزء من متطلبات نظام إدارة الجودة، ويُسأل عنه في كل تدقيق إشهاد.", "Clause 10.2 is part of the quality management system requirements and is asked about in every certification audit."), "tool": "./iso9001.html"},
        {"code": "5 Whys", "n": B("تحليل السبب الجذري", "Root cause analysis"), "col": "#3563C9",
         "d": B("أداة الصندوق التالية. ستُربط بقسم تحليل السبب في هذه الأداة.", "The next toolbox tool. It will connect to the cause analysis section of this tool."), "tool": ""}
    ],
    "comp": [
        {"code": "ISO 9001:2026 §10.2", "n": B("عدم المطابقة والإجراء التصحيحي", "Nonconformity and corrective action"),
         "d": B("المتطلب الذي تبني عليه الأداة: التفاعل، وتقييم الحاجة إلى إجراء، والتنفيذ، ومراجعة الفعالية، والتحديث، والسجلات.", "The requirement the tool is built on: react, evaluate the need for action, implement, review effectiveness, update, keep records.")},
        {"code": "ISO 9000:2026 §3.6", "n": B("مصطلحات الإجراءات", "Terms related to action"),
         "d": B("تعريفات التصحيح والإجراء التصحيحي والإجراء الوقائي، والفرق بينها.", "Definitions of correction, corrective action and preventive action, and how they differ.")},
        {"code": "ISO 19011:2026 §6.7", "n": B("متابعة التدقيق", "Audit follow-up"),
         "d": B("إرشاد للتحقق من إنجاز الإجراءات الناتجة عن التدقيق ومن فعاليتها.", "Guidance on verifying that actions from an audit were completed and were effective.")}
    ],
    "buy": [],
    "buyNote": B("للنص الرسمي للمواصفات استخدم النسخ المنشورة من المنظمة الدولية للتوحيد القياسي، وليس هذه المنصة.",
                 "For the official text of the standards, use the copies published by the International Organization for Standardization, not this platform.")
}

texts = {
    "stdT": B("دليل المنهجية", "Method guide"),
    "stdS": B("ما الإجراء التصحيحي، ومن يقوم بماذا، وخطوات السجل من التفاعل حتى الإغلاق.", "What corrective action is, who does what, and the record's steps from reaction to closure."),
    "clT": B("دليل البنود", "Clause guide"),
    "clS": B("البند 10.2 والبنود التي يعمل معها، بأرقامها في ISO 9001:2026. لكل بند ملخص تفسيري ومثال وما يطلبه المدقق. الأمثلة توضيحية وليست بيانات حقيقية.",
             "Clause 10.2 and the clauses it works with, numbered as in ISO 9001:2026. Each one has an interpretive summary, an example and what the auditor asks for. Examples are illustrative, not real data."),
    "note": B("ما يرد تحت «المتطلب» ملخص تفسيري بصياغة مستقلة، وليس النص الرسمي للمواصفة. وما تحت «كيف تطبقه» و«الفجوات» إرشاد تطبيقي. أرقام البنود وعناوينها متحقق منها من النصوص الرسمية المرفوعة.",
              "Text under “requirement” is an interpretive summary in independent wording, not the official text of the standard. “How to implement” and “common gaps” are practical guidance. Clause numbers and titles were checked against the uploaded official texts."),
    "chgT": B("ما الذي تغيّر", "What changed"),
    "chgS": B("", "")
}

phases = {
    "detect": {"c": "#C2410C", "t": "#FDECE3", "n": B("الاكتشاف والضبط", "Detect and control")},
    "act": {"c": "#1B2A4A", "t": "#E8ECF3", "n": B("التصحيح والإجراء", "Correct and act")},
    "record": {"c": "#7B5BB8", "t": "#EFEAF8", "n": B("السجلات", "Records")},
    "check": {"c": "#C9821A", "t": "#FCF1DE", "n": B("التحقق والمراجعة", "Check and review")},
    "plan": {"c": "#1E8C93", "t": "#E3F4F4", "n": B("التخطيط للمخاطر", "Planning for risk")}
}

S = []

S.append({"id": "8.7", "grp": "core", "ph": "detect", "col": "#C2410C", "tint": "#FDECE3",
  "t": B("البند 8.7 ضبط المخرجات غير المطابقة", "Clause 8.7 Control of nonconforming outputs"),
  "s": B("ضبط المخرجات", "Nonconforming outputs"), "sh": B("8.7 · ضبط المخرجات", "8.7 · Nonconforming outputs"),
  "p": B("قبل أي تحليل أو إجراء، يجب أن يتوقف المخرج غير المطابق عن الوصول إلى العميل أو الاستخدام. من هنا تبدأ أغلب سجلات CAPA في المواقع والمصانع.",
         "Before any analysis or action, a nonconforming output must be stopped from reaching the customer or being used. Most CAPA records on sites and in plants start here."),
  "fl": L(("يُكتشف", "Found"), ("يُعزل", "Contained"), ("يُقرَّر", "Decided"), ("يُسجَّل", "Recorded")),
  "it": [
    IT("8.7.1", "RE1", B("اعزل المخرج غير المطابق وقرّر طريقة التعامل معه", "Contain the nonconforming output and decide how to deal with it"),
       R(IS, "تحدد المنشأة المخرجات غير المطابقة وتضبطها حتى لا تُستخدم أو تُسلَّم دون قصد، ويشمل ذلك ما يُكتشف بعد التسليم. وتتعامل معها بطريقة أو أكثر: التصحيح، أو العزل والاحتواء أو الإرجاع أو إيقاف التقديم، أو إبلاغ العميل، أو القبول بتنازل معتمد. وبعد التصحيح يُتحقق من المطابقة.",
         "the organization identifies nonconforming outputs and controls them so they are not used or delivered by mistake, including those found after delivery. It deals with them in one or more ways: correction; segregation, containment, return or suspension; informing the customer; or acceptance under an authorized concession. After a correction, conformity is verified."),
       R(EX, "وصلت شحنة حديد تسليح دون شهادات المصنع، فوُضعت عليها بطاقة «موقوف» وعُزلت في منطقة منفصلة حتى تصل الشهادات أو تُرفض الشحنة.",
         "a delivery of reinforcing steel arrived without mill certificates; it was tagged “on hold” and moved to a separate area until the certificates arrived or the load was rejected."),
       L(("ضع بطاقة واضحة على المخرج المعزول وسجّل مكانه", "Put a clear tag on the contained output and record where it is"),
         ("حدّد من يملك صلاحية القبول بتنازل، واكتب اسمه في السجل", "Name who has authority to accept under concession, and write it in the record"),
         ("بعد التصحيح أعد الفحص وسجّل نتيجته", "After a correction, re-inspect and record the result")),
       L(("بطاقة الإيقاف أو سجل العزل بتاريخه", "Hold tag or containment record with its date"),
         ("قرار التعامل مع المخرج ومن اتخذه", "The decision on the output and who took it"),
         ("نتيجة إعادة الفحص بعد التصحيح", "Re-inspection result after the correction")),
       L(("مخرج غير مطابق استُخدم قبل القرار", "A nonconforming output used before a decision"),
         ("قبول بتنازل دون صلاحية موثقة", "Acceptance under concession with no documented authority"),
         ("تصحيح دون إعادة فحص", "A correction with no re-inspection")),
       B("مشرف الموقع أو الإنتاج", "Site or production supervisor"), B("الزمن من الاكتشاف حتى العزل", "Time from detection to containment")),
    IT("8.7.2", "x:tools", B("احتفظ بدليل طبيعة عدم المطابقة والقرار", "Keep evidence of the nonconformity and the decision"),
       R(IS, "تُحفظ معلومات موثقة تبيّن طبيعة عدم المطابقة، والإجراءات المتخذة، وأي تنازل حصلت عليه المنشأة، والجهة التي قررت الإجراء.",
         "documented information is kept on the nature of the nonconformity, the actions taken, any concession obtained and who decided the action."),
       R(EX, "تقرير عدم مطابقة NCR يحمل رقمه ووصفه وصوره، وقرار «إرجاع للمورد» بتوقيع مدير الجودة.",
         "an NCR with its number, description and photos, and the decision “return to supplier” signed by the quality manager."),
       L(("استخدم نموذج NCR واحداً في كل المواقع", "Use one NCR form on every site"),
         ("اربط رقم NCR بسجل CAPA عندما يلزم إجراء تصحيحي", "Link the NCR number to the CAPA record when corrective action is needed")),
       L(("تقارير NCR مكتملة الحقول", "NCRs with every field complete"), ("توقيع صاحب الصلاحية على القرار", "Signature of the person with authority on the decision")),
       L(("NCR بلا قرار أو بلا اسم من قرر", "An NCR with no decision or no name of who decided"), ("سجلات متفرقة في البريد والهاتف", "Records scattered across email and phone")),
       B("مسؤول الجودة", "Quality officer"), B("نسبة تقارير NCR المكتملة الحقول", "Share of NCRs with every field complete"))
  ]})

S.append({"id": "10.2", "grp": "core", "ph": "act", "col": "#1B2A4A", "tint": "#E8ECF3",
  "t": B("البند 10.2 عدم المطابقة والإجراء التصحيحي", "Clause 10.2 Nonconformity and corrective action"),
  "s": B("الإجراء التصحيحي", "Corrective action"), "sh": B("10.2 · الإجراء التصحيحي", "10.2 · Corrective action"),
  "p": B("قلب أداة CAPA: التفاعل مع عدم المطابقة، ثم تقرير هل يلزم إجراء يزيل سببها، ثم التنفيذ ومراجعة الفعالية، وتحديث المخاطر والنظام عند الحاجة، مع الاحتفاظ بالسجلات.",
         "The heart of the CAPA tool: react to the nonconformity, decide whether action is needed to remove its cause, carry it out and review its effectiveness, update risks and the system where needed, and keep the records."),
  "fl": L(("تفاعل", "React"), ("حلّل", "Analyse"), ("نفّذ", "Act"), ("راجع الفعالية", "Review effectiveness"), ("حدّث", "Update")),
  "it": [
    IT("10.2.1 a", "RE2", B("تفاعل مع عدم المطابقة وتعامل مع عواقبها", "React to the nonconformity and deal with its consequences"),
       R(IS, "عند وقوع عدم مطابقة تتفاعل المنشأة معها، وبحسب الحالة تتخذ إجراءً لضبطها وتصحيحها، وتتعامل مع عواقبها. والتصحيح في ISO 9000:2026 (3.6.3) إجراء يزيل عدم المطابقة المكتشفة نفسها.",
         "when a nonconformity occurs, the organization reacts to it and, as applicable, takes action to control and correct it and deals with the consequences. ISO 9000:2026 (3.6.3) describes correction as action to eliminate the detected nonconformity itself."),
       R(EX, "اكتُشف استخدام مخططات ملغاة في الموقع ب، فسُحبت النسخ القديمة في اليوم نفسه، وراجع المهندس ما نُفّذ عليها خلال الأسبوعين السابقين.",
         "superseded drawings were found in use on site B; the old copies were withdrawn the same day and the engineer reviewed the work built from them over the previous two weeks."),
       L(("سجّل التصحيح والاحتواء بتاريخهما", "Record correction and containment with their date"),
         ("اسأل: ما الذي تأثر قبل الاكتشاف؟ ثم عالجه", "Ask what was affected before detection, then deal with it"),
         ("أبلغ العميل عندما يتأثر ما سُلّم له", "Inform the customer when something delivered is affected")),
       L(("تاريخ التصحيح والاحتواء", "Date of correction and containment"), ("قائمة الأعمال أو المنتجات المتأثرة وما تقرر بشأنها", "List of affected work or products and the decision on each")),
       L(("تصحيح الحالة وحدها دون النظر في العواقب", "Fixing the single case without looking at consequences"), ("تفاعل غير مؤرّخ", "A reaction with no date")),
       B("مالك العملية", "Process owner"), B("متوسط الأيام حتى التفاعل", "Average days to react")),
    IT("10.2.1 b", "CA1", B("قيّم الحاجة إلى إجراء يزيل السبب، وحدّد الأسباب", "Evaluate the need for action on the cause, and determine the causes"),
       R(IS, "تقيّم المنشأة الحاجة إلى إجراء يزيل سبب عدم المطابقة حتى لا تتكرر ولا تحدث في مكان آخر، بمراجعة عدم المطابقة وتحديد أسبابها. ويوضح الملحق A.10.2 أن المنشأة تحدد مدى التحقيق والطرق المستخدمة بحسب سياقها، مع مراعاة خطر التكرار والأثر ومتطلبات العملاء.",
         "the organization evaluates the need for action to eliminate the cause so the nonconformity does not recur or occur elsewhere, by reviewing it and determining its causes. Annex A.10.2 explains that the organization sets the extent of investigation and the methods for its context, considering the risk of recurrence, the impact and customer requirements."),
       R(EX, "تحليل 5 Whys لشحنة الحديد: لماذا وصلت دون شهادات؟ لأن أمر الشراء لم يطلبها. ولماذا؟ لأن نموذج أمر الشراء لا يحتوي بند الشهادات للمواد الإنشائية.",
         "a 5 Whys for the steel delivery: why no certificates? Because the purchase order did not ask for them. Why? Because the purchase order form has no certificate clause for structural materials."),
       L(("اختر طريقة تناسب حجم المشكلة: 5 Whys للمشكلات المباشرة، وFishbone عندما تتعدد الأسباب", "Pick a method that fits the problem: 5 Whys for direct problems, Fishbone when several causes act together"),
         ("اجمع الدليل على كل سبب قبل اعتماده", "Collect evidence for each cause before accepting it"),
         ("توقّف عند سبب تستطيع المنشأة التحكم فيه", "Stop at a cause the organization can control")),
       L(("مخرجات التحليل (5 Whys أو Fishbone)", "The analysis output (5 Whys or Fishbone)"), ("الدليل الذي يدعم السبب الجذري", "Evidence supporting the root cause")),
       L(("سبب جذري مكتوب «خطأ بشري» فقط", "A root cause that says only “human error”"), ("اختيار الإجراء قبل التحليل", "Choosing the action before the analysis"), ("تحليل دون دليل", "Analysis without evidence")),
       B("فريق التحليل بقيادة مالك العملية", "Analysis team led by the process owner"), B("نسبة السجلات التي لها سبب جذري مدعوم بدليل", "Share of records with an evidence-backed root cause")),
    IT("10.2.1 b 3", "CA2", B("تحقّق من وجود حالات مشابهة أو احتمال حدوثها", "Check whether similar nonconformities exist or could occur"),
       R(IS, "من خطوات التقييم تحديد ما إذا كانت حالات مشابهة موجودة فعلاً أو قد تحدث. وهذا ما يمنع أن يُصحَّح الخطأ في موقع ويبقى في موقع آخر.",
         "part of the evaluation is determining whether similar nonconformities exist or could potentially occur. This is what stops a problem being fixed on one site and left on another."),
       R(EX, "بعد اكتشاف المخططات الملغاة في الموقع ب، فُحص الموقعان أ وج، ووُجدت نسختان ملغاتان في الموقع ج.",
         "after the superseded drawings on site B, sites A and C were checked and two superseded copies were found on site C."),
       L(("اسأل: أين يمكن أن يحدث الشيء نفسه؟", "Ask where the same thing could happen"), ("افحص عينة من المواقع أو العمليات المشابهة وسجّل النتيجة", "Check a sample of similar sites or processes and record the result")),
       L(("نتيجة فحص المواقع أو العمليات المشابهة", "Result of the check on similar sites or processes"),),
       L(("إغلاق الحالة دون النظر خارج مكانها", "Closing the case without looking beyond where it happened"),),
       B("مسؤول الجودة", "Quality officer"), B("نسبة السجلات التي فُحصت فيها الحالات المشابهة", "Share of records where similar cases were checked")),
    IT("10.2.1 c", "AC1", B("نفّذ الإجراء اللازم بمالك وموعد", "Implement the action needed, with an owner and a date"),
       R(IS, "تنفذ المنشأة أي إجراء لازم. وفي الممارسة يعني ذلك خطة بإجراءات محددة، لكل منها مالك وموعد وحالة، مع دليل على التنفيذ.",
         "the organization implements any action needed. In practice this means a plan of specific actions, each with an owner, a due date and a status, and evidence that it was done."),
       R(EX, "تعديل نموذج أمر الشراء ليشمل بند شهادات المصنع — مدير المشتريات — 2026-05-15 — منفّذ، والدليل: النموذج المعدّل بإصداره الجديد.",
         "revise the purchase order form to include a mill certificate clause — Procurement manager — 2026-05-15 — done; evidence: the revised form with its new revision number."),
       L(("اكتب كل إجراء بفعل واضح يمكن التحقق من إنجازه", "Write each action as a clear task whose completion can be checked"),
         ("تابع الحالة أسبوعياً حتى الإنجاز", "Track the status weekly until done"), ("احفظ دليل التنفيذ مع السجل", "Keep the implementation evidence with the record")),
       L(("خطة الإجراءات بالمالك والموعد والحالة", "Action plan with owner, due date and status"), ("دليل التنفيذ: وثيقة معدلة أو سجل تدريب أو صورة", "Implementation evidence: a revised document, a training record or a photo")),
       L(("إجراء بلا مالك أو موعد", "An action with no owner or date"), ("إجراءات متأخرة دون متابعة", "Overdue actions with no follow-up")),
       B("مالك الإجراء", "Action owner"), B("نسبة الإجراءات المنفذة في موعدها", "Share of actions done on time")),
    IT("GD-1", "AC2", B("اجعل الإجراء مناسباً لأثر المشكلة ويعالج سببها", "Make the action fit the effect and remove the cause"),
       R(IS, "يختم البند 10.2.1 بأن الإجراءات التصحيحية تكون مناسبة لآثار عدم المطابقة. فلا يُبنى نظام كامل لخطأ بسيط، ولا يُكتفى بتذكير لخطأ تكرر ووصل إلى العميل. والإجراء التصحيحي في ISO 9000:2026 (3.6.4) يزيل السبب ويمنع التكرار.",
         "clause 10.2.1 ends by saying corrective actions are appropriate to the effects of the nonconformities. A minor slip does not need a new system, and a repeated problem that reached the customer is not solved by a reminder. ISO 9000:2026 (3.6.4) describes corrective action as removing the cause and preventing recurrence."),
       R(EX, "رفض الخرسانة المتكرر عولج أولاً بتذكير المورد فقط، ثم تكرر. الإجراء المناسب كان شرطاً تعاقدياً لتبريد ماء الخلط مع فحص الحرارة في المصنع.",
         "repeated concrete rejections were first handled with a reminder to the supplier and came back. The fitting action was a contract clause on chilled mixing water plus a temperature check at the plant."),
       L(("قارن الإجراء بالسبب الجذري: هل يزيله فعلاً؟", "Compare the action with the root cause: does it really remove it?"), ("لا تعتمد على التدريب أو التذكير وحدهما", "Do not rely on training or reminders alone")),
       L(("ربط واضح بين كل إجراء وسبب", "A clear link between each action and a cause"),),
       L(("تدريب أو تذكير دون تغيير في الطريقة", "Training or a reminder with no change to the method"), ("إجراء أكبر بكثير من المشكلة", "An action far bigger than the problem")),
       B("مالك العملية", "Process owner"), B("نسبة الإجراءات التي غيّرت طريقة أو نموذجاً أو صلاحية", "Share of actions that changed a method, a form or an authority")),
    IT("10.2.1 d", "EF1", B("راجع فعالية الإجراء التصحيحي", "Review the effectiveness of the corrective action"),
       R(IS, "تراجع المنشأة فعالية أي إجراء تصحيحي اتخذته. والفعالية في ISO 9000:2026 (3.7.17) هي مدى تنفيذ الأنشطة المخططة وتحقيق النتائج المخططة؛ فالسؤال ليس «هل نُفّذ؟» فقط، بل «هل منع التكرار؟».",
         "the organization reviews the effectiveness of any corrective action taken. ISO 9000:2026 (3.7.17) describes effectiveness as the extent to which planned activities are realized and planned results achieved: the question is not only “was it done?” but “did it stop the recurrence?”."),
       R(EX, "معيار الفعالية: «صفر شحنات حديد تُستلم دون شهادات خلال 90 يوماً من تعديل النموذج»، ويُراجع من سجل الاستلام.",
         "effectiveness criterion: “no steel delivery received without certificates in the 90 days after the form change”, checked from the receiving log."),
       L(("اكتب معيار الفعالية وموعد المراجعة عند التخطيط للإجراء", "Write the effectiveness criterion and the review date when you plan the action"),
         ("اترك مدة كافية ليظهر التكرار إن وُجد", "Leave enough time for a recurrence to show"), ("راجع من بيانات جديدة لا من رأي المالك", "Review from new data, not from the owner's opinion")),
       L(("معيار الفعالية وتاريخ مراجعته", "Effectiveness criterion and review date"), ("نتيجة المراجعة ومصدر البيانات", "Review result and the data source")),
       L(("إغلاق الإجراء عند تنفيذه دون مراجعة فعاليته", "Closing on completion without an effectiveness review"), ("معيار عام مثل «لم تتكرر» دون مدة أو مصدر", "A vague criterion such as “did not recur” with no period or source")),
       B("مسؤول الجودة أو المدقق", "Quality officer or auditor"), B("نسبة السجلات المغلقة بعد مراجعة فعالية", "Share of records closed after an effectiveness review")),
    IT("GD-2", "EF2", B("أعد فتح السجل إذا لم يكن الإجراء فعالاً", "Reopen the record when the action was not effective"),
       R(GD, "إذا أظهرت المراجعة أن عدم المطابقة تكرر، فالإجراء لم يكن فعالاً. يعود السجل إلى التحليل للبحث عن سبب لم يُعالج، بدل إغلاقه وفتح سجل جديد منفصل يُخفي التاريخ.",
         "if the review shows the nonconformity recurred, the action was not effective. The record goes back to analysis to find the cause that was missed, instead of being closed and replaced by a separate new record that hides the history."),
       R(EX, "بعد شهرين بقيت نسبة رفض الخرسانة 6%، فأُعيد فتح السجل، وظهر سبب ثانٍ هو عدم التزام المورد بتبريد الماء.",
         "two months later concrete rejections were still 6%; the record was reopened and a second cause was found: the supplier was not chilling the water."),
       L(("سجّل نتيجة «غير فعال» بتاريخها ولا تحذفها", "Record the “not effective” result with its date; do not delete it"), ("ارجع إلى التحليل واسأل: ما الذي لم نره؟", "Go back to the analysis and ask what was missed")),
       L(("المراجعة السابقة غير الفعالة", "The earlier “not effective” review"), ("التحليل المحدّث والإجراءات الجديدة", "The updated analysis and the new actions")),
       L(("سجل جديد لكل محاولة فيضيع التاريخ", "A new record for every attempt, so the history is lost"), ("تمديد الموعد دون تحليل جديد", "Extending the date with no new analysis")),
       B("مسؤول الجودة", "Quality officer"), B("نسبة السجلات التي أعيد فتحها", "Share of records reopened")),
    IT("10.2.1 e", "LN1", B("حدّث المخاطر والفرص عند الحاجة", "Update risks and opportunities where needed"),
       R(IS, "تحدّث المنشأة المخاطر والفرص التي حددتها أثناء التخطيط إن لزم. فعدم المطابقة دليل على خطر قائم: إن لم يكن في السجل يُضاف، وإن كان تقديره منخفضاً يُراجع.",
         "the organization updates the risks and opportunities determined during planning, if necessary. A nonconformity is evidence of a live risk: if it is not in the register it is added, and if it was rated low it is reviewed."),
       R(EX, "أُضيف خطر «مواد إنشائية دون شهادات مطابقة» إلى سجل مخاطر المشتريات بدرجة متوسطة، وضابطه بند الشهادات في أمر الشراء.",
         "the risk “structural materials without conformity certificates” was added to the procurement risk register at medium, with the purchase order certificate clause as its control."),
       L(("اسأل بعد كل CAPA: هل سجل المخاطر ما زال صحيحاً؟", "After every CAPA, ask whether the risk register is still right"),),
       L(("تحديث سجل المخاطر بتاريخه ومرجع CAPA", "Risk register update with its date and the CAPA reference"),),
       L(("سجل مخاطر لا يتغير رغم تكرار عدم المطابقة", "A risk register that never changes although nonconformities repeat"),),
       B("مالك سجل المخاطر", "Risk register owner"), B("عدد تحديثات سجل المخاطر الناتجة عن CAPA", "Risk register updates triggered by CAPA")),
    IT("10.2.1 f", "x:tools", B("غيّر نظام الإدارة عند الحاجة", "Change the management system where needed"),
       R(IS, "تُجرى تغييرات على نظام إدارة الجودة إن لزم، مثل تعديل إجراء أو نموذج أو صلاحية أو تدريب. والتغيير يُخطط له ولا يُنفذ ارتجالاً.",
         "changes are made to the quality management system if necessary, such as revising a procedure, a form, an authority or training. The change is planned, not improvised."),
       R(EX, "أُضيف فحص الشهادات إلى إجراء استلام المواد (الإصدار 4)، ودُرّب أمناء المستودعات عليه.",
         "a certificate check was added to the material receiving procedure (revision 4) and storekeepers were trained on it."),
       L(("سجّل الوثيقة المعدلة ورقم إصدارها في سجل CAPA", "Record the revised document and its revision number in the CAPA record"),),
       L(("الوثيقة المعدلة وإشعار التغيير", "The revised document and the change notice"),),
       L(("تغيير في الممارسة دون تحديث الوثيقة", "A change in practice with no document update"),),
       B("مسؤول النظام", "System owner"), B("عدد الوثائق المعدلة بسبب CAPA", "Documents revised because of CAPA")),
    IT("10.2.2", "RD1", B("احتفظ بدليل طبيعة عدم المطابقة والإجراءات ونتائجها", "Keep evidence of the nonconformity, the actions and their results"),
       R(IS, "تُحفظ معلومات موثقة تبيّن طبيعة عدم المطابقة وما تبعها من إجراءات، ونتائج أي إجراء تصحيحي. وسجل CAPA في هذه الأداة يحقق ذلك عندما تكتمل حقوله.",
         "documented information is kept on the nature of the nonconformities and any later actions, and on the results of any corrective action. A CAPA record in this tool does that when its fields are complete."),
       R(EX, "السجل CA-EX-01 يحمل الوصف والدليل والتصحيح والتحليل والإجراءات ونتيجة الفعالية وتبرير الإغلاق.",
         "record CA-EX-01 carries the description, evidence, correction, analysis, actions, effectiveness result and closure justification."),
       L(("صدّر تقرير CAPA دورياً واحفظه في نظام الوثائق", "Export the CAPA report regularly and file it in the document system"),),
       L(("سجلات CAPA مكتملة", "Complete CAPA records"), ("التقرير المصدّر", "The exported report")),
       L(("نتيجة الإجراء غير مسجلة", "The action result not recorded"), ("سجلات تُحذف بعد الإغلاق", "Records deleted after closure")),
       B("مسؤول الجودة", "Quality officer"), B("نسبة السجلات التي تجتاز التدقيق الآلي", "Share of records passing the automatic audit"))
  ]})

S.append({"id": "7.5", "grp": "core", "ph": "record", "col": "#7B5BB8", "tint": "#EFEAF8",
  "t": B("البند 7.5 المعلومات الموثقة", "Clause 7.5 Documented information"),
  "s": B("المعلومات الموثقة", "Documented info"), "sh": B("7.5 · المعلومات الموثقة", "7.5 · Documented information"),
  "p": B("سجل CAPA معلومة موثقة: يُنشأ ويُحدَّث ويُضبط مثل أي سجل في النظام، ويُغلق بقرار واضح.",
         "A CAPA record is documented information: it is created, updated and controlled like any record in the system, and closed by a clear decision."),
  "fl": L(("يُنشأ", "Created"), ("يُحدَّث", "Updated"), ("يُغلق بموافقة", "Closed with approval")),
  "it": [
    IT("7.5.3", "RD2", B("اضبط سجلات CAPA وأغلقها بموافقة", "Control CAPA records and close them with approval"),
       R(IS, "يطلب البند 7.5 أن تُنشأ المعلومات الموثقة وتُحدَّث بطريقة مناسبة، وأن تُضبط (7.5.3) فتكون متاحة ومحمية. أما الإغلاق بتبرير وموافقة شخص مخوّل فممارسة تجعل الإغلاق قراراً واضحاً، وهي إرشاد وليست نصاً معيارياً.",
         "clause 7.5 asks that documented information is created and updated appropriately and controlled (7.5.3) so it is available and protected. Closing with a justification and the approval of an authorized person is a practice that makes closure a clear decision; it is guidance, not normative text."),
       R(EX, "يُغلق السجل بعبارة «فعال: صفر حالات خلال 90 يوماً من سجل الاستلام» وموافقة مدير الجودة.",
         "the record is closed with “effective: zero cases in 90 days from the receiving log” and the quality manager's approval."),
       L(("حدّد من يملك صلاحية إغلاق CAPA بحسب التصنيف", "Set who may close a CAPA by grade"), ("لا تُغلق دون نتيجة فعالية", "Never close without an effectiveness result")),
       L(("تبرير الإغلاق واسم المعتمد وتاريخه", "Closure justification, approver name and date"),),
       L(("إغلاق بتوقيع دون تبرير", "Closure by signature with no justification"), ("سجلات تُعدّل بعد الإغلاق دون أثر", "Records changed after closure without a trace")),
       B("مدير الجودة", "Quality manager"), B("نسبة السجلات المغلقة بتبرير وموافقة", "Share of records closed with justification and approval"))
  ]})

S.append({"id": "9.1.3", "grp": "core", "ph": "check", "col": "#C9821A", "tint": "#FCF1DE",
  "t": B("البند 9.1.3 التحليل والتقييم", "Clause 9.1.3 Analysis and evaluation"),
  "s": B("التحليل والتقييم", "Analysis"), "sh": B("9.1.3 · التحليل", "9.1.3 · Analysis"),
  "p": B("بيانات CAPA من أهم مدخلات التحليل: المصادر المتكررة، والعمليات الأكثر تعرضاً، وزمن الإغلاق، ونسبة الفعالية.",
         "CAPA data is one of the main inputs to analysis: repeat sources, the processes most affected, closure time and the effectiveness rate."),
  "fl": L(("بيانات", "Data"), ("تحليل", "Analysis"), ("قرار تحسين", "Improvement decision")),
  "it": [
    IT("9.1.3 a–h", "x:tools", B("حلّل بيانات CAPA لتكتشف الاتجاهات", "Analyse CAPA data to spot trends"),
       R(IS, "تحلل المنشأة البيانات والمعلومات الناتجة عن الرصد والقياس وتقيّمها، وتستخدم النتائج لتقييم أمور منها مطابقة المنتجات والخدمات، وأداء النظام وفعاليته، وفعالية الإجراءات المتخذة للمخاطر والفرص، وأداء الموردين، والحاجة إلى التحسين.",
         "the organization analyses and evaluates data and information from monitoring and measurement, and uses the results to evaluate, among other things, conformity of products and services, system performance and effectiveness, the effectiveness of actions on risks and opportunities, external provider performance and the need for improvement."),
       R(EX, "لوحة CAPA تُظهر أن ثلاثة من أربعة سجلات مصدرها الموردون، فيُقترح تدقيق موردين في الربع القادم.",
         "the CAPA dashboard shows three of four records come from suppliers, so a supplier audit is proposed for next quarter."),
       L(("راجع لوحة CAPA شهرياً بحسب المصدر والعملية", "Review the CAPA dashboard monthly by source and process"), ("ابحث عن التكرار قبل أن يصبح عادة", "Look for repeats before they become normal")),
       L(("تقرير تحليل دوري لبيانات CAPA", "A periodic analysis report of CAPA data"),),
       L(("سجلات كثيرة دون أي تحليل لاتجاهها", "Many records with no trend analysis"),),
       B("مسؤول الجودة", "Quality officer"), B("عدد السجلات ذات المصدر المتكرر", "Records with a repeated source"))
  ]})

S.append({"id": "9.3", "grp": "core", "ph": "check", "col": "#B8901E", "tint": "#FBF4DF",
  "t": B("البند 9.3 مراجعة الإدارة", "Clause 9.3 Management review"),
  "s": B("مراجعة الإدارة", "Management review"), "sh": B("9.3 · مراجعة الإدارة", "9.3 · Management review"),
  "p": B("ترى الإدارة العليا اتجاه عدم المطابقة والإجراءات التصحيحية، وتقرر الموارد والتغييرات.",
         "Top management sees the trend of nonconformities and corrective actions, and decides on resources and changes."),
  "fl": L(("اتجاهات", "Trends"), ("قرارات", "Decisions"), ("موارد", "Resources")),
  "it": [
    IT("9.3.2 d 1", "LN2", B("اعرض اتجاهات عدم المطابقة والإجراءات التصحيحية في مراجعة الإدارة", "Present trends in nonconformities and corrective actions at management review"),
       R(IS, "من مدخلات مراجعة الإدارة معلومات عن أداء نظام الجودة، ومنها الاتجاهات في عدم المطابقة والإجراءات التصحيحية. ونتائج المراجعة تشمل قرارات التحسين وأي تغيير مطلوب في النظام والموارد (9.3.3).",
         "management review inputs include information on quality system performance, including trends in nonconformities and corrective actions. Review results include decisions on improvement and any needed changes to the system and resources (9.3.3)."),
       R(EX, "عرض ربع سنوي: 4 سجلات، واحد مغلق فعال، وواحد أعيد فتحه، وواحد متأخر. قرار الإدارة: تجربة مورد خرسانة بديل.",
         "quarterly slide: 4 records, one closed and effective, one reopened, one overdue. Management decision: trial an alternative concrete supplier."),
       L(("اجعل تقرير CAPA مدخلاً ثابتاً في كل مراجعة", "Make the CAPA report a standing input to every review"), ("سجّل قرار الإدارة ومرجعه في السجل", "Record management's decision and its reference in the record")),
       L(("محضر مراجعة الإدارة وفيه بند CAPA", "Management review minutes with a CAPA item"),),
       L(("مراجعة تذكر عدد السجلات فقط دون اتجاه أو قرار", "A review that gives a count only, with no trend or decision"),),
       B("الإدارة العليا", "Top management"), B("عدد قرارات مراجعة الإدارة المتعلقة بـ CAPA", "Management review decisions on CAPA"))
  ]})

S.append({"id": "6.1", "grp": "core", "ph": "plan", "col": "#1E8C93", "tint": "#E3F4F4",
  "t": B("البند 6.1 الإجراءات لمواجهة المخاطر والفرص", "Clause 6.1 Actions to address risks and opportunities"),
  "s": B("المخاطر والفرص", "Risks and opportunities"), "sh": B("6.1 · المخاطر والفرص", "6.1 · Risks and opportunities"),
  "p": B("هنا يقع «المنع» في ISO 9001:2026: التخطيط للمخاطر قبل وقوعها، وليس بنداً منفصلاً للإجراء الوقائي.",
         "This is where “prevention” sits in ISO 9001:2026: planning for risks before they happen, not a separate preventive action clause."),
  "fl": L(("حدّد", "Determine"), ("خطّط", "Plan"), ("قيّم الفعالية", "Evaluate effectiveness")),
  "it": [
    IT("6.1.1 b", "x:tools", B("امنع الآثار غير المرغوبة بالتخطيط للمخاطر", "Prevent undesired effects by planning for risks"),
       R(IS, "عند التخطيط تحدد المنشأة المخاطر والفرص التي تحتاج معالجة، ومن أغراض ذلك منع الآثار غير المرغوبة أو تقليلها. ويذكر البند 10.1 ج أن إجراءات التحسين تشمل تصحيح الآثار غير المرغوبة ومنعها وتقليلها. أما «الإجراء الوقائي» فمعرّف في ISO 9000:2026 (3.6.2) وفي ملاحظة المصطلح 3.17 من ISO 9001:2026، وليس له بند متطلبات مستقل.",
         "when planning, the organization determines the risks and opportunities to address, among other things to prevent or reduce undesired effects. Clause 10.1 c) says improvement actions include correcting, preventing or reducing undesired effects. “Preventive action” is defined in ISO 9000:2026 (3.6.2) and in the note to term 3.17 of ISO 9001:2026, but it has no requirement clause of its own."),
       R(EX, "بعد CA-EX-01 راجعت المشتريات كل المواد الإنشائية الأخرى وأضافت بند الشهادات قبل أن تحدث مشكلة مماثلة؛ هذا منع عبر المخاطر.",
         "after CA-EX-01, procurement reviewed every other structural material and added the certificate clause before a similar problem happened: prevention through risk."),
       L(("حوّل الدرس من CAPA إلى ضابط في سجل المخاطر", "Turn the lesson from a CAPA into a control in the risk register"), ("استخدم نتيجة «الحالات المشابهة» لتوسيع المنع", "Use the “similar cases” result to widen prevention")),
       L(("ضوابط مضافة إلى سجل المخاطر بمرجع CAPA", "Controls added to the risk register with the CAPA reference"),),
       L(("سجل «إجراءات وقائية» منفصل لا يرتبط بالمخاطر", "A separate “preventive actions” log with no link to risks"),),
       B("مالك سجل المخاطر", "Risk register owner"), B("عدد الضوابط الوقائية المضافة من دروس CAPA", "Preventive controls added from CAPA lessons")),
    IT("6.1.2", "LN1", B("خطط إجراءات المخاطر وقيّم فعاليتها", "Plan actions on risks and evaluate their effectiveness"),
       R(IS, "تحدد المنشأة المخاطر وتحللها وتقيّمها، وتخطط إجراءات معالجتها وطريقة دمجها في عملياتها وتقييم فعاليتها، على أن تكون متناسبة مع الأثر المحتمل.",
         "the organization determines, analyses and evaluates risks, and plans actions to address them, how to build them into its processes and how to evaluate their effectiveness, in proportion to the potential impact."),
       R(EX, "خطر تأخر شهادات الأجهزة المستأجرة عولج ببند تعاقدي ومتابعة شهرية.",
         "the risk of late certificates for rented devices was handled by a contract clause and a monthly check."),
       L(("اربط كل CAPA مهم بخطر في السجل", "Link every significant CAPA to a risk in the register"),),
       L(("سجل المخاطر بإجراءاته ونتيجة تقييم فعاليتها", "The risk register with its actions and their effectiveness results"),),
       L(("معالجة مخاطر دون تقييم لفعاليتها", "Risk treatment with no effectiveness check"),),
       B("مالك العملية", "Process owner"), B("نسبة المخاطر التي لها إجراء وتقييم فعالية", "Share of risks with an action and an effectiveness check"))
  ]})

S.append({"id": "9.2", "grp": "core", "ph": "check", "col": "#3563C9", "tint": "#E7EEFB",
  "t": B("البند 9.2 التدقيق الداخلي", "Clause 9.2 Internal audit"),
  "s": B("التدقيق الداخلي", "Internal audit"), "sh": B("9.2 · التدقيق الداخلي", "9.2 · Internal audit"),
  "p": B("التدقيق مصدر رئيسي لسجلات CAPA، وهو أيضاً الطريقة التي يُتحقق بها لاحقاً من إنجاز الإجراءات وفعاليتها.",
         "Audit is a main source of CAPA records, and it is also how completion and effectiveness of actions are checked later."),
  "fl": L(("ملاحظة", "Finding"), ("إجراء دون تأخير", "Action without undue delay"), ("متابعة", "Follow-up")),
  "it": [
    IT("9.2.2 d", "x:tools", B("اتخذ التصحيح والإجراء التصحيحي دون تأخير غير مبرر", "Take correction and corrective action without undue delay"),
       R(IS, "من متطلبات برنامج التدقيق الداخلي اتخاذ التصحيح والإجراءات التصحيحية المناسبة دون تأخير غير مبرر. ولهذا تُبرز هذه الأداة الإجراءات والمراجعات المتأخرة.",
         "the internal audit programme requires appropriate correction and corrective actions to be taken without undue delay. That is why this tool flags overdue actions and reviews."),
       R(EX, "ملاحظة التدقيق IA-2026-07 / F-03 فُتح لها سجل CAPA خلال أسبوع، بخطة تنتهي خلال 60 يوماً.",
         "audit finding IA-2026-07 / F-03 got a CAPA record within a week, with a plan due within 60 days."),
       L(("افتح سجل CAPA لكل عدم مطابقة من التدقيق خلال مدة محددة", "Open a CAPA record for every audit nonconformity within a set time"),
         ("استورد الملاحظات من مركز التدقيق الذكي بدل إعادة كتابتها", "Import findings from the Smart Audit center instead of retyping them")),
       L(("تاريخ الملاحظة وتاريخ فتح السجل", "Finding date and record opening date"),),
       L(("ملاحظات تدقيق بلا إجراء بعد أشهر", "Audit findings with no action months later"),),
       B("مدير برنامج التدقيق", "Audit programme manager"), B("متوسط الأيام من الملاحظة إلى خطة الإجراء", "Average days from finding to action plan")),
    IT("19011 6.7", "x:tools", B("تحقق في المتابعة من الإنجاز والفعالية", "Verify completion and effectiveness at follow-up"),
       R(IS, "يرشد البند 6.7 من ISO 19011:2026 إلى أن نتائج التدقيق قد تستلزم تصحيحاً أو إجراءً تصحيحياً أو فرصة تحسين، ينفذها من خضع للتدقيق خلال مدة متفق عليها، وأن يُتحقق من إنجاز هذه الإجراءات ومن فعاليتها، وقد يكون ذلك جزءاً من تدقيق لاحق. والملاحظة في المصطلح 3.11 هي نتيجة تقييم أدلة التدقيق مقابل معاييره.",
         "clause 6.7 of ISO 19011:2026 guides that audit outcomes can call for correction, corrective action or improvement, carried out by the auditee within an agreed time, and that completion and effectiveness of these actions should be verified, possibly as part of a later audit. An audit finding (term 3.11) is the result of evaluating audit evidence against audit criteria."),
       R(EX, "أضاف المدقق إلى خطة التدقيق القادم بنداً للتحقق من فعالية CA-EX-02.",
         "the auditor added a line to the next audit plan to verify the effectiveness of CA-EX-02."),
       L(("أضف مراجعات الفعالية المستحقة إلى خطة التدقيق القادم", "Add due effectiveness reviews to the next audit plan"),),
       L(("سجل المتابعة في تقرير التدقيق", "The follow-up entry in the audit report"),),
       L(("متابعة تتحقق من الإنجاز فقط دون الفعالية", "Follow-up that checks completion only, not effectiveness"),),
       B("المدقق الداخلي", "Internal auditor"), B("نسبة الملاحظات التي تُحقّق من فعاليتها", "Share of findings whose effectiveness was verified"))
  ]})

legend = [[p["c"], p["n"]] for p in phases.values()]

DATA = {
    "meta": meta, "std": std, "texts": texts, "phases": phases, "flags": {}, "legend": legend,
    "diagram": {"type": "cycle", "centre": B("دورة CAPA", "CAPA cycle")},
    "matrix": {"tab": "", "d": B("", ""), "btn": B("", "")},
    "sections": S, "paths": [],
    "edges": [["8.7.1", "10.2.1 a"], ["10.2.1 a", "10.2.1 b"], ["10.2.1 b", "10.2.1 b 3"], ["10.2.1 b", "10.2.1 c"], ["10.2.1 c", "10.2.1 d"],
              ["10.2.1 d", "GD-2"], ["GD-2", "10.2.1 b"], ["10.2.1 e", "6.1.2"], ["10.2.2", "7.5.3"], ["9.1.3 a–h", "9.3.2 d 1"], ["9.2.2 d", "19011 6.7"]],
    "changes": {"note": B("", ""), "tlT": B("", ""), "tlS": B("", ""), "tlCols": 4, "tl": [], "cardsT": B("", ""), "cardsS": B("", ""), "cards": [],
                "corr": {"t": B("", ""), "s": B("", ""), "h": [], "rows": []}, "steps": {"t": B("", ""), "s": B("", ""), "l": B("", "")}},
    "ui": {
        "ar": {"roles": "من يفعل ماذا", "wheelT": "عجلة البنود", "purpose": "الغرض من الأداة", "smap": "خطوات سجل CAPA",
               "smapSub": "كل خطوة في سطر. اضغط «اشرح» لفتح البند الذي تخدمه.", "rel": "علاقتها بأدوات المنصة", "comp": "المراجع المساندة",
               "assess": "قيّم هذا في التقييم الذاتي", "assessC": "قيّم هذا في التقييم الذاتي",
               "assessOff": "هذا البند خارج أسئلة التقييم الذاتي، ويُطبَّق مباشرة في سجل CAPA.", "offGo": "افتح سجل CAPA",
               "actCtx": "يفتح السؤال {s}", "explainA": "اشرح {c} في دليل البنود"},
        "en": {"roles": "Who does what", "wheelT": "Clause wheel", "purpose": "What the tool is for", "smap": "Steps of a CAPA record",
               "smapSub": "One line per step. Select “Explain” to open the clause it serves.", "rel": "How it connects to the platform's tools", "comp": "Supporting references",
               "assess": "Assess this in the self-assessment", "assessC": "Assess this in the self-assessment",
               "assessOff": "This clause is outside the self-assessment questions; it is applied directly in the CAPA record.", "offGo": "Open the CAPA record",
               "actCtx": "Opens question {s}", "explainA": "Explain {c} in the clause guide"}
    }
}

if __name__ == "__main__":
    js = ("/* CAPA explanation data for the CIA Explain Kit v1.4. Clause numbers and titles checked on 2026-10-11 against the uploaded\n"
          "   ISO 9001:2026, ISO 9000:2026 and ISO 19011:2026 texts. Requirements are interpretive summaries, not the official text. */\n"
          "const EXPLAIN_CAPA=" + json.dumps(DATA, ensure_ascii=False, indent=1) + ";\n")
    sys.stdout.write(js)
