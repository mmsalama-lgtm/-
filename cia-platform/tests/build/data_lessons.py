"""EXPLAIN_LESSONS — data for the CIA Explain Kit v1.4 in modules/lessons.html (build step 2026-10-16, Lessons Learned).
Lessons learned is a practice, not a requirement of any standard, and ISO 10009:2024 does not review it as a tool of its own.
The clause guide is built on the ISO 9001:2026 clauses the practice serves. Checked on 2026-10-16:
  ISO 9001:2026 (ISO_9001_2026en 1.pdf, read on 2026-10-16) — 7.1.6 Organizational knowledge (determine the knowledge necessary for the
                   operation of processes and to achieve intended results; retained, applied and shared to the extent necessary; consider
                   current knowledge when addressing changing needs and trends; the NOTE lists forms: experience-based knowledge held by people,
                   knowledge acquired through education, training and learning from others, knowledge embedded in methods, processes and
                   products, knowledge in documented information, digital systems and other media — the 2026 NOTE does not use the words
                   "lessons learned"); Annex A.7.1.6 (knowledge is dynamic and updated through use and experience; acquiring or creating,
                   applying, maintaining it valid and relevant, retaining it to reduce risks of its loss; NOTE: ISO 30401); 7.4 Communication
                   (what, when, with whom, how, who); 8.1 Operational planning and control (criteria for the processes; control planned changes
                   and review unintended ones); 8.5.6 Control of changes; 9.1.3 Analysis and evaluation (e) effectiveness of actions taken to
                   address risks; h) need for improvements); 9.3.2 Management review inputs (a) status of actions from previous reviews;
                   d) 1) nonconformities and corrective actions, 3) audit results; e) opportunities for improvement); 10.1 Continual
                   improvement (c) correcting, preventing or reducing undesired effects); 10.2.1 (b) 3) whether similar nonconformities exist
                   or can potentially occur; e) update the risks and opportunities determined during planning, if necessary; f) make changes to
                   the quality management system, if necessary); Annex A.10.1 (improvement can involve adapting processes, knowledge and
                   resources)
  ISO 9000:2026 (ISO 9000-2026.pdf; scanned, read by OCR on 2026-10-16) — 3.2.3 improvement; 3.2.4 good practice (a method proven to work
                   well and recommended to be adopted as a model; Note 1: usually tested over time and validated through repeated trials);
                   3.10.4 knowledge (understanding that enables effective context-specific decisions and action; EXAMPLE insights, know-how,
                   good practices; Note 1: exists within and between individuals, teams and organizations); 4.2.4 Engagement of people
                   (possible actions include open discussion and sharing of knowledge and experience, and taking initiatives without fear);
                   4.2.6 Improvement (key benefit: effective use of learning for improvement); 4.2.7 Evidence-based decision-making;
                   4.3.9 Organizational quality culture (the extent to which people share knowledge)
  ISO 10009:2024 (ISO-10009-2024-Quality-Management-Guidance-for-Quality-Tools.pdf, BS ISO 10009:2024, read on 2026-10-16): clause 15 Improvement (the platform's mapping: ISO 9001
                   7.1.6 and 10.1), 15.1–15.5 (benchmarking, affinity diagram, quality circles, brainstorming, six thinking hats) and the
                   other relevant tools of 15.6 (PDCA, CMM, suggestion schemes with the PICK chart and Crawford slip method, BCG matrix and
                   waterfall chart). Lessons learned is not one of its 53 tools, and the words "lessons learned" do not appear in its text (Annex B
                   storyboards included); the lessons-learned field belongs to the platform's storyboard in modules/iso10009.html.
  ISO 19011:2026 (ISO_19011_2026_Standard.pdf, read on 2026-10-16) — 5.7 Reviewing and improving the audit programme (lessons learned from
                   the programme review used as inputs for its improvement); 6.3.2.2 Audit planning details (follow-up activities from a
                   previous audit or other sources, e.g. lessons learned, project reviews); 6.6 Completing the audit (lessons learned from the
                   audit can identify risks and opportunities for the programme and the auditee).
Not uploaded, so "not verified": ISO 30401 (named only in the NOTE of ISO 9001:2026 A.7.1.6), PMBOK and PRINCE2 lessons logs, any knowledge
management standard. No text of a standard is reproduced: every "requirement" is an interpretive summary in independent wording.
Items coded GD-n are the author's practical guidance on the practice, not clauses. Usage: python3 data_lessons.py > explain_lessons.js"""
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
    "code": "LL",
    "name": B("الدروس المستفادة", "Lessons learned"),
    "edition": B("أداة منهجية: معرفة تغيّر المشروع التالي", "Method tool: knowledge that changes the next project"),
    "status": B("الأداة العاشرة في صندوق أدوات التحسين المستمر", "Tenth tool in the Continual Improvement Toolbox"),
    "cert": False,
    "certNote": B("الدروس المستفادة ممارسة، وليست مواصفة ولا متطلباً، ولا تراجعها ISO 10009:2024 أداةً مستقلة؛ أقرب ما فيها البند 15 (التحسين) وأنظمة الاقتراحات بين الأدوات الأخرى في 15.6. والمتطلبات التي تخدمها الممارسة في ISO 9001:2026: المعرفة التنظيمية (7.1.6)، والتواصل (7.4)، وضبط العمليات والتغييرات (8.1 و8.5.6)، والتحليل والتقييم (9.1.3)، ومدخلات مراجعة الإدارة (9.3.2)، والتحسين (10.1)، وتحديث المخاطر وإجراء التغييرات بعد عدم المطابقة (10.2.1 هـ) و و)). ويذكر ISO 19011:2026 الدروس المستفادة في تخطيط التدقيق وتحسين برنامجه.",
                  "Lessons learned is a practice, not a standard or a requirement, and ISO 10009:2024 does not review it as a tool of its own; the nearest content is clause 15 (improvement), with suggestion schemes among the other relevant tools in 15.6. The ISO 9001:2026 requirements the practice serves: organizational knowledge (7.1.6), communication (7.4), control of processes and changes (8.1 and 8.5.6), analysis and evaluation (9.1.3), management review inputs (9.3.2), improvement (10.1), and updating risks and making changes after a nonconformity (10.2.1 e) and f)). ISO 19011:2026 names lessons learned in audit planning and in improving the audit programme."),
    "verified": B("2026-10-16، من الملفات الرسمية المرفوعة إلى المشروع: ISO_9001_2026en 1.pdf، وISO 9000-2026.pdf (ممسوح ضوئياً، قُرئ بالتعرف الضوئي)، وISO 19011:2026، وISO-10009-2024-Quality-Management-Guidance-for-Quality-Tools.pdf (BS ISO 10009:2024). كل «متطلب» ملخص تفسيري، وليس النص الرسمي. ISO 30401 وسجلات الدروس في PMBOK وPRINCE2 غير مرفوعة: «غير متحقق منه».",
                  "2026-10-16, against the official files uploaded to the project: ISO_9001_2026en 1.pdf, ISO 9000-2026.pdf (scanned, read with OCR), ISO 19011:2026, and ISO-10009-2024-Quality-Management-Guidance-for-Quality-Tools.pdf (BS ISO 10009:2024). Every “requirement” is an interpretive summary, not the official text. ISO 30401 and the PMBOK and PRINCE2 lessons logs are not uploaded: “not verified”.")
}

std = {
    "purpose": B("أن تتحول تجربة مشروع أو عملية (فشلاً كانت أو نجاحاً) إلى قاعدة يطبقها غيرك، ثم إلى تغيير في وثيقة أو ضابط أو ممارسة، ثم إلى دليل أن المشروع التالي طبّقها ونجحت. الدرس الذي يبقى في محضر اجتماع لا يغيّر شيئاً.",
                 "To turn the experience of a project or a process (a failure or a success) into a rule someone else can apply, then into a change in a document, a control or a practice, then into evidence that the next project applied it and it worked. A lesson that stays in meeting minutes changes nothing."),
    "who": B("مديرو المشاريع ومهندسو المواقع، ومديرو الجودة والصحة والسلامة، ومالكو العمليات، والمشتريات، ومن يبدأ مشروعاً أو تغييراً، والمدققون الداخليون.",
             "Project managers and site engineers, quality and HSE managers, process owners, procurement, anyone starting a project or a change, and internal auditors."),
    "rolesSub": B("السجل لا يعمل وحده؛ يعمل بمن يكتب الدرس ومن يرسّخه ومن يقرؤه قبل البدء. هذا توزيع مقترح للأدوار.",
                  "The register does not work by itself; it works through who writes the lesson, who embeds it and who reads it before starting. This is a suggested split of roles."),
    "roles": [
        {"n": B("مالك الدرس", "Lesson owner"), "col": "#1B2A4A", "d": B("يكتب الحدث بدليله ويربط السبب، ويصوغ القاعدة، ويتابع الترسيخ والتحقق.", "Writes the event with its evidence, links the cause, words the rule, and follows the embedding and the verification.")},
        {"n": B("مالك العملية أو الوثيقة", "Process or document owner"), "col": "#B8901E", "d": B("يغيّر الإجراء أو النموذج أو قائمة الفحص أو خطة الضبط، ويصدر النسخة الجديدة.", "Changes the procedure, the form, the checklist or the control plan, and issues the new version.")},
        {"n": B("مدير المشروع التالي", "The next project's manager"), "col": "#3C9A5F", "d": B("يقرأ القواعد التي تنطبق قبل البدء، ويطبقها، ويبلغ هل نجحت.", "Reads the rules that apply before starting, applies them, and reports whether they worked.")},
        {"n": B("الجودة", "Quality"), "col": "#3563C9", "d": B("تراجع السجل دورياً، وتدقق الصياغة بلا لوم، وتحمل الدروس إلى مراجعة الإدارة.", "Reviews the register periodically, checks the blame-free wording, and carries the lessons to management review.")},
        {"n": B("المدقق الداخلي", "Internal auditor"), "col": "#C2410C", "d": B("يسأل: ما الذي تغيّر بعد الدرس؟ ومن طبّقه بعد ذلك؟ ويستخدم الدروس في تخطيط التدقيق.", "Asks: what changed after the lesson? Who applied it next? And uses lessons in audit planning.")}
    ],
    "map": [
        {"no": "1", "t": B("سجّل الحدث", "Capture the event"), "d": B("مشكلة أو حادث وشيك أو نجاح، بدليله.", "A problem, a near miss or a success, with its evidence."), "go": "GD-1"},
        {"no": "2", "t": B("الدليل", "The evidence"), "d": B("المتوقع مقابل الفعلي، بالأرقام.", "Expected against actual, in numbers."), "go": "4.2.7"},
        {"no": "3", "t": B("السبب من تحليل", "The cause from an analysis"), "d": B("جملة من RCA أو A3 أو DMAIC أو FMEA، لا رأي.", "A sentence from RCA, A3, DMAIC or FMEA, not an opinion."), "go": "GD-3"},
        {"no": "4", "t": B("الدرس قاعدة", "The lesson as a rule"), "d": B("عندما… افعل… لأن… وأين ينطبق.", "When…, do…, because… and where it applies."), "go": "GD-4"},
        {"no": "5", "t": B("بلا لوم", "Blame-free"), "d": B("ما في العملية سمح بالخطأ، لا من أخطأ.", "What in the process allowed it, not who."), "go": "4.2.4"},
        {"no": "6", "t": B("رسّخه", "Embed it"), "d": B("وثيقة أو ضابط أو تدريب يتغيّر بدليل.", "A document, a control or a training changes, with evidence."), "go": "10.2.1"},
        {"no": "7", "t": B("إلى FMEA وخطة الضبط", "Into FMEA and the control plan"), "d": B("الدرس صف في FMEA أو بند في خطة ضبط.", "The lesson becomes an FMEA row or a control-plan item."), "go": "GD-6"},
        {"no": "8", "t": B("تحقق في المشروع التالي", "Verify on the next project"), "d": B("طُبّق ونجح؟ بتاريخ ودليل.", "Applied and worked? With a date and evidence."), "go": "3.2.4"},
        {"no": "9", "t": B("عمّمه", "Share it"), "d": B("من يحتاجه، وكيف، ومتى.", "Who needs it, how and when."), "go": "7.4"},
        {"no": "10", "t": B("اقرأ قبل أن تبدأ", "Read before you start"), "d": B("السجل يُقرأ عند بدء كل مشروع أو تغيير.", "The register is read at the start of each project or change."), "go": "7.1.6"}
    ],
    "rel": [
        {"code": "FMEA", "n": B("تحليل أنماط الفشل وآثارها", "Failure mode and effects analysis"), "col": "#B42318", "d": B("يبدأ درس من دراسة فيها مراجعة أو صف أعيد تقييمه، وإجراء الترسيخ «صف في FMEA» يسمي الدراسة برقمها؛ وتعرض الدراسة الدروس التي تذكرها (قراءة فقط).", "A lesson starts from a study with a review or a re-rated row, and an \"FMEA row\" embedding action names the study by its id; the study lists the lessons that name it (read-only)."), "tool": "./fmea.html"},
        {"code": "DMAIC", "n": B("مشروع التحسين بمنهج DMAIC", "DMAIC improvement project"), "col": "#1B2A4A", "d": B("يبدأ درس من مشروع مغلق أو موقوف: المشكلة حدثاً وأسبابه المثبتة سبباً.", "A lesson starts from a closed or stopped project: the problem as the event and its proved causes as the cause."), "tool": "./dmaic.html"},
        {"code": "A3", "n": B("حل المشكلات بأسلوب A3", "A3 problem solving"), "col": "#B8901E", "d": B("يبدأ درس من صفحة A3: الخلفية حدثاً والأسباب المثبتة سبباً.", "A lesson starts from an A3: the background as the event and the proved causes as the cause."), "tool": "./a3.html"},
        {"code": "RCA", "n": B("تحليل السبب الجذري — التحقيق", "Root cause analysis — investigation"), "col": "#1B2A4A", "d": B("يبدأ درس من تحقيق: المشكلة حدثاً والأسباب الجذرية سبباً، والجسامة من تقييم الخطر.", "A lesson starts from an investigation: the problem as the event, the root causes as the cause, and the severity from the risk rating."), "tool": "./rca.html"},
        {"code": "CAPA", "n": B("الإجراءات التصحيحية", "Corrective action"), "col": "#C2410C", "d": B("عندما يكون المصدر حالة عدم مطابقة، يبقى الإجراء التصحيحي في سجل CAPA الذي يذكره الدرس.", "When a nonconformity is the source, the corrective action stays in the CAPA record the lesson names."), "tool": "./capa.html"},
        {"code": "PDCA", "n": B("دورة PDCA", "PDCA cycle"), "col": "#3C9A5F", "d": B("يبدأ درس من دورة: المشكلة حدثاً والأسباب سبباً، وحقل الدروس فيها مسودة للقاعدة.", "A lesson starts from a cycle: the problem as the event, its causes as the cause, and its lessons field as a draft rule."), "tool": "./pdca.html"},
        {"code": "5 Whys · Fishbone · Pareto", "n": B("لماذا الخمس وعظمة السمكة وباريتو", "5 Whys, Fishbone and Pareto"), "col": "#3563C9", "d": B("مصادر للسبب بأرقامها، مع معاينة بقاعدة كل أداة.", "Sources of the cause by id, with a preview by each tool's own rule."), "tool": "./five-whys.html"},
        {"code": "ISO 10009", "n": B("دليل أدوات الجودة ISO 10009", "ISO 10009 quality tools guide"), "col": "#7B5BB8", "d": B("الدروس المستفادة ليست من أدواته الـ53؛ أقرب ما فيه البند 15 (التحسين) وأنظمة الاقتراحات في 15.6، ولا ترد عبارة «الدروس المستفادة» في نصه؛ وحقل الدروس في لوحة القصة من تصميم المنصة.", "Lessons learned is not one of its 53 tools; the nearest is clause 15 (improvement) and suggestion schemes in 15.6, and the words \"lessons learned\" do not appear in its text; the lessons field of the storyboard is the platform's own."), "tool": "./iso10009.html#explain-cl"}
    ],
    "comp": [
        {"code": "ISO 9001:2026 §7.1.6 · A.7.1.6", "n": B("المعرفة التنظيمية", "Organizational knowledge"),
         "d": B("تحديد المعرفة اللازمة، والاحتفاظ بها وتطبيقها ومشاركتها، وتحديثها بالاستخدام والخبرة، والاحتفاظ بها لتقليل خطر فقدانها.", "Determine the knowledge needed, retain, apply and share it, update it through use and experience, and retain it to reduce the risk of its loss.")},
        {"code": "ISO 9001:2026 §10.2.1 e) f) · §10.1", "n": B("تحديث المخاطر والتغييرات والتحسين", "Updating risks, changes and improvement"),
         "d": B("بعد عدم المطابقة: تحديث المخاطر والفرص وإجراء التغييرات على النظام عند الحاجة؛ والتحسين المستمر بما فيه منع الآثار غير المرغوبة.", "After a nonconformity: update the risks and opportunities and make changes to the system if necessary; and continual improvement, including preventing undesired effects.")},
        {"code": "ISO 9000:2026 §3.2.4 · §3.10.4 · §4.2.4 · §4.2.6", "n": B("الممارسة الجيدة والمعرفة ومشاركة الناس والتحسين", "Good practice, knowledge, engagement of people, improvement"),
         "d": B("الممارسة الجيدة طريقة ثبت أنها تعمل؛ والمعرفة تشمل الخبرة والممارسات الجيدة؛ ومشاركة المعرفة دون خوف؛ والاستخدام الفعال للتعلم في التحسين.", "A good practice is a method proven to work; knowledge includes know-how and good practices; sharing knowledge without fear; effective use of learning for improvement.")},
        {"code": "ISO 19011:2026 §5.7 · §6.3.2.2 · §6.6", "n": B("الدروس في التدقيق", "Lessons in auditing"),
         "d": B("الدروس من مراجعة برنامج التدقيق مدخلات لتحسينه؛ وتخطيط التدقيق يراعي المتابعة من الدروس ومراجعات المشاريع؛ والدروس من التدقيق تكشف مخاطر وفرصاً.", "Lessons from reviewing the audit programme feed its improvement; audit planning considers follow-up from lessons learned and project reviews; lessons from the audit can show risks and opportunities.")},
        {"code": "ISO 30401 · PMBOK · PRINCE2", "n": B("إدارة المعرفة وسجلات الدروس (غير متحقق منه)", "Knowledge management and lessons logs (not verified)"),
         "d": B("لا يوجد منها شيء مرفوع إلى المشروع؛ ISO 30401 مذكورة فقط في ملاحظة الملحق A.7.1.6. فقواعد المراحل والتدقيق في الأداة صياغتها هي.", "None is uploaded to the project; ISO 30401 is named only in the NOTE of Annex A.7.1.6. So the stage and audit rules in the tool are its own wording.")}
    ],
    "buy": [],
    "buyNote": B("للنص الرسمي للمواصفات استخدم النسخ المنشورة من المنظمة الدولية للتوحيد القياسي، وليس هذه المنصة.",
                 "For the official text of the standards, use the copies published by the International Organization for Standardization, not this platform.")
}

texts = {
    "stdT": B("دليل المنهجية", "Method guide"),
    "stdS": B("متى يكون الدرس «مستفاداً»: تسجيل الحدث بدليله، والسبب من تحليل حقيقي، والدرس قاعدة بلا لوم، والترسيخ في الوثائق والضوابط وFMEA وخطط الضبط، والتحقق في المشروع التالي، والتعميم، والقراءة قبل البدء، والفجوات الشائعة وما يطلبه المدقق.",
              "When a lesson is really learned: capturing the event with its evidence, the cause from a real analysis, the lesson as a blame-free rule, embedding in documents, controls, FMEA and control plans, verification on the next project, sharing, reading before you start, the common gaps and what an auditor asks for."),
    "clT": B("دليل البنود", "Clause guide"),
    "clS": B("بنود ISO 9001:2026 التي تخدمها الممارسة بأرقامها: المعرفة التنظيمية 7.1.6 والملحق A.7.1.6، والإجراء التصحيحي 10.2.1، والتخطيط 8.1 والتغييرات 8.5.6، والتحليل 9.1.3، والتواصل 7.4، ومراجعة الإدارة 9.3.2، والتحسين 10.1؛ ومبادئ ISO 9000:2026 وتعريفاتها؛ والبند 15 من ISO 10009:2024؛ وISO 19011:2026. لكل بند ملخص تفسيري ومثال وما يطلبه المدقق. قواعد الممارسة مرقّمة GD وهي إرشاد لا بنود. الأمثلة توضيحية وليست بيانات حقيقية.",
             "The ISO 9001:2026 clauses the practice serves, by number: organizational knowledge 7.1.6 and Annex A.7.1.6, corrective action 10.2.1, planning 8.1 and changes 8.5.6, analysis 9.1.3, communication 7.4, management review 9.3.2 and improvement 10.1; the ISO 9000:2026 principles and terms; ISO 10009:2024 clause 15; and ISO 19011:2026. Each one has an interpretive summary, an example and what the auditor asks for. The practice's rules are coded GD: guidance, not clauses. Examples are illustrative, not real data."),
    "note": B("ما يرد تحت «المتطلب» ملخص تفسيري بصياغة مستقلة، وليس النص الرسمي للمواصفة. وما تحت «كيف تطبقه» و«الفجوات» إرشاد تطبيقي. أرقام البنود وعناوينها متحقق منها من النصوص الرسمية المرفوعة.",
              "Text under “requirement” is an interpretive summary in independent wording, not the official text of the standard. “How to implement” and “common gaps” are practical guidance. Clause numbers and titles were checked against the uploaded official texts."),
    "chgT": B("ما الذي تغيّر", "What changed"),
    "chgS": B("", "")
}

phases = {
    "know": {"c": "#7A869E", "t": "#EEF1F6", "n": B("المعرفة والتسجيل", "Knowledge and capture")},
    "cause": {"c": "#3563C9", "t": "#E8EEFA", "n": B("السبب والدليل", "Cause and evidence")},
    "rule": {"c": "#1B2A4A", "t": "#E8ECF3", "n": B("الدرس قاعدة", "The lesson as a rule")},
    "embed": {"c": "#B8901E", "t": "#F7F0DE", "n": B("الترسيخ", "Embedding")},
    "share": {"c": "#3C9A5F", "t": "#E5F4EA", "n": B("التحقق والتعميم والمراجعة", "Verification, sharing and review")}
}

S = []

S.append({"id": "7.1.6", "grp": "core", "ph": "know", "col": "#7A869E", "tint": "#EEF1F6",
  "t": B("البند 7.1.6 المعرفة التنظيمية", "Clause 7.1.6 Organizational knowledge"),
  "s": B("المعرفة والتسجيل", "Knowledge and capture"), "sh": B("7.1.6 · المعرفة", "7.1.6 · Knowledge"),
  "p": B("تطلب المواصفة معرفة محددة ومحفوظة ومطبقة ومشتركة. وسجل الدروس طريقة منظمة لذلك، بشرط أن يُقرأ قبل البدء.",
         "The standard asks for knowledge that is determined, retained, applied and shared. A lessons register is a structured way to do that, provided it is read before starting."),
  "fl": L(("التحديد", "Determine"), ("الاحتفاظ", "Retain"), ("التطبيق", "Apply"), ("المشاركة", "Share"), ("التحديث", "Update")),
  "it": [
    IT("7.1.6", "EM3", B("المعرفة اللازمة: محفوظة ومطبقة ومشتركة", "The knowledge needed: retained, applied and shared"),
       R(IS, "تطلب ISO 9001:2026 في البند 7.1.6 تحديد المعرفة اللازمة لتشغيل العمليات وتحقيق النتائج المقصودة، والاحتفاظ بها وتطبيقها ومشاركتها بالقدر اللازم، ومراعاة المعرفة الحالية عند التعامل مع الاحتياجات والتوجهات المتغيرة. وتذكر الملاحظة أشكال المعرفة: خبرة الأشخاص، وما يُكتسب بالتعليم والتدريب والتعلم من الآخرين، والمعرفة المضمنة في الطرق والعمليات والمنتجات، والمعلومات الموثقة. ولا تستخدم ملاحظة إصدار 2026 عبارة «الدروس المستفادة» نصاً؛ والسجل وسيلة لتطبيق المتطلب، لا متطلب بذاته.",
         "ISO 9001:2026 clause 7.1.6 asks to determine the knowledge necessary to operate the processes and achieve the intended results, to retain, apply and share it to the extent necessary, and to consider current knowledge when addressing changing needs and trends. Its NOTE lists the forms knowledge takes: experience held by people, what is acquired through education, training and learning from others, knowledge embedded in methods, processes and products, and documented information. The 2026 NOTE does not use the words \"lessons learned\"; a register is a means to meet the requirement, not a requirement in itself."),
       R(EX, "قبل أول صبة في المشروع PRJ-2026-118 اختار مدير المشروع في «اقرأ قبل أن تبدأ» عملية «توريد الخرسانة الجاهزة وصبها»، فظهرت قاعدة الماء المبرد ودخلت عقد التوريد قبل توقيعه.",
         "before the first pour on project PRJ-2026-118, the project manager picked the process \"ready-mix concrete supply and pouring\" in \"read before you start\"; the chilled-water rule showed up and went into the supply contract before it was signed."),
       L(("اجعل قراءة السجل خطوة في بدء كل مشروع أو تغيير", "Make reading the register a step in starting each project or change"), ("ابحث بالعملية ونوع المشروع والموقع", "Search by process, project type and site"), ("سجّل في محضر البدء الدروس التي قُرئت", "Record in the kick-off minutes the lessons that were read")),
       L(("محضر بدء المشروع يذكر الدروس المقروءة", "Kick-off minutes naming the lessons read"), ("السجل بوسومه", "The register with its tags")),
       L(("سجل لا يقرؤه أحد", "A register nobody reads"), ("دروس محفوظة في بريد شخص واحد", "Lessons kept in one person's mailbox")),
       B("مدير المشروع", "Project manager"), B("نسبة المشاريع التي قرأت السجل قبل البدء", "Share of projects that read the register before starting")),
    IT("A.7.1.6", "x:tools", B("المعرفة تتغير بالاستخدام والخبرة", "Knowledge changes through use and experience"),
       R(IS, "يوضح الملحق A.7.1.6 من ISO 9001:2026 أن المعرفة التنظيمية متغيرة وتتحدث بالاستخدام والخبرة، وأن إدارتها تشمل اكتساب المعرفة الجديدة أو إنشاءها، وتطبيقها، والمحافظة عليها صالحة وذات صلة، والاحتفاظ بها لتقليل خطر فقدانها. وتشير ملاحظته إلى ISO 30401 لمتطلبات أنظمة إدارة المعرفة (غير مرفوعة: «غير متحقق منه»).",
         "Annex A.7.1.6 of ISO 9001:2026 explains that organizational knowledge is dynamic and is updated through use and experience, and that managing it involves acquiring or creating new knowledge, applying it, keeping it valid and relevant, and retaining it to reduce the risk of its loss. Its NOTE points to ISO 30401 for knowledge management system requirements (not uploaded: \"not verified\")."),
       R(EX, "خبرة مشرف الرفع في ربط الحزم كانت في رأسه وحده؛ صارت بعد الدرس LL-EX-02 جزءاً من الإجراء LP-07 rev 3 ونموذج خطة الرفع، فلا تضيع إذا انتقل.",
         "the lifting supervisor's know-how on rigging bundles was in his head only; after lesson LL-EX-02 it became part of procedure LP-07 rev 3 and the lift plan template, so it is not lost if he moves."),
       L(("حوّل الخبرة الشخصية إلى وثيقة أو ضابط", "Turn personal know-how into a document or a control"), ("راجع القواعد القديمة: هل ما زالت صالحة؟", "Review old rules: are they still valid?")),
       L(("وثائق محدّثة تذكر الدرس", "Updated documents naming the lesson"),),
       L(("معرفة تغادر مع من يغادر", "Knowledge that leaves with whoever leaves"),),
       B("مدير الجودة", "Quality manager"), B("—", "—")),
    IT("3.10.4", "x:tools", B("المعرفة والممارسة الجيدة في ISO 9000:2026", "Knowledge and good practice in ISO 9000:2026"),
       R(IS, "يعرّف ISO 9000:2026 المعرفة (3.10.4) بأنها الفهم الذي يمكّن من قرارات وأفعال فعالة في سياقها، ومن أمثلتها البصائر والدراية والممارسات الجيدة، وهي موجودة داخل الأفراد والفرق والمنظمات وبينها. ويعرّف التحسين (3.2.3) بأنه نشاط لتعزيز الأداء قد يتكرر أو يكون مرة واحدة.",
         "ISO 9000:2026 defines knowledge (3.10.4) as the understanding that enables effective context-specific decisions and action; its examples are insights, know-how and good practices, and it exists within and between individuals, teams and organizations. It defines improvement (3.2.3) as an activity to enhance performance, which can be recurring or singular."),
       R(EX, "قاعدة «اكتب وزن الحزمة على بطاقتها» دراية عملية صغيرة، لكنها تمنع خطأ وزن قد يقلب رافعة.",
         "the rule \"write the bundle weight on its tag\" is a small piece of know-how, but it prevents a weight error that could overturn a crane."),
       L(("اكتب الدرس بما يمكّن من قرار أو فعل", "Write the lesson so it enables a decision or an action"),),
       L(("قواعد مكتوبة بأفعال محددة", "Rules written with specific actions"),),
       L(("دروس عامة مثل «يجب الاهتمام بالجودة»", "General lessons such as \"pay attention to quality\""),),
       B("مالك الدرس", "Lesson owner"), B("—", "—")),
    IT("15", "x:tools", B("ISO 10009:2024 البند 15 التحسين", "ISO 10009:2024 clause 15 Improvement"),
       R(IS, "لا تراجع ISO 10009:2024 الدروس المستفادة أداةً من أدواتها الـ53. أقرب ما فيها البند 15 (التحسين)، الذي يربطه فهرس المنصة بالبندين 7.1.6 و10.1 من ISO 9001 (ربط من إعداد الكاتب): المقارنة المرجعية (15.1)، ومخطط التقارب (15.2)، وحلقات الجودة (15.3)، والعصف الذهني (15.4)، والقبعات الست (15.5)، وبين الأدوات الأخرى ذات الصلة في 15.6: دورة PDCA ونموذج نضج القدرات وأنظمة الاقتراحات (مع مخطط PICK وطريقة كروفورد). ولا ترد عبارة «الدروس المستفادة» في نص المواصفة ولا في لوحات القصة في الملحق B؛ وحقل الدروس في لوحة القصة على المنصة من تصميمها.",
         "ISO 10009:2024 does not review lessons learned as one of its 53 tools. The nearest is clause 15 (improvement), which the platform's catalogue maps to ISO 9001 clauses 7.1.6 and 10.1 (the author's mapping): benchmarking (15.1), the affinity diagram (15.2), quality circles (15.3), brainstorming (15.4), six thinking hats (15.5), and among the other relevant tools in 15.6: PDCA, the capability maturity model and suggestion schemes (with the PICK chart and the Crawford slip method). The words \"lessons learned\" do not appear in the standard's text or in its Annex B storyboards; the lessons field of the platform's storyboard is the platform's own."),
       R(EX, "في دليل ISO 10009 على المنصة سجّلت شركة الواحة «الدروس المستفادة» في لوحة القصة، ثم نقلت الدرس الذي يغيّر الإجراءات إلى هذا السجل ليُرسَّخ ويُتحقق منه.",
         "in the ISO 10009 guide on the platform, Al-Waha wrote \"lessons learned\" in the storyboard, then carried the lesson that changes procedures into this register to be embedded and verified."),
       L(("افتح دليل ISO 10009 على البند 15", "Open the ISO 10009 guide on clause 15"), ("استخدم أنظمة الاقتراحات مصدراً للدروس", "Use suggestion schemes as a source of lessons")),
       L(("—", "—"),),
       L(("اعتبار الدروس المستفادة أداة في ISO 10009", "Treating lessons learned as an ISO 10009 tool"),),
       B("مدير الجودة", "Quality manager"), B("—", "—"))
  ]})

S.append({"id": "10.2", "grp": "core", "ph": "cause", "col": "#3563C9", "tint": "#E8EEFA",
  "t": B("البند 10.2 عدم المطابقة والإجراء التصحيحي", "Clause 10.2 Nonconformity and corrective action"),
  "s": B("السبب والدليل", "Cause and evidence"), "sh": B("10.2 · الإجراء التصحيحي", "10.2 · Corrective action"),
  "p": B("بعد عدم المطابقة تطلب المواصفة تحديث المخاطر وتغيير النظام عند الحاجة. والدرس يحمل التغيير إلى المشاريع الأخرى، والسبب يأتي من تحليل حقيقي.",
         "After a nonconformity the standard asks to update the risks and change the system if necessary. The lesson carries the change to other projects, and the cause comes from a real analysis."),
  "fl": L(("الحدث", "Event"), ("الدليل", "Evidence"), ("السبب", "Cause"), ("التغيير", "Change")),
  "it": [
    IT("10.2.1", "EM1", B("تحديث المخاطر وتغيير النظام بعد عدم المطابقة", "Update the risks and change the system after a nonconformity"),
       R(IS, "تطلب ISO 9001:2026 في البند 10.2.1 عند وقوع عدم مطابقة: الاستجابة لها، وتقييم الحاجة إلى إزالة أسبابها بمراجعتها وتحديد أسبابها وتحديد ما إذا كانت حالات مماثلة موجودة أو قد تحدث (ب) 3))، وتنفيذ الإجراءات، ومراجعة فعاليتها، و(هـ) تحديث المخاطر والفرص المحددة في التخطيط عند الحاجة، و(و) إجراء التغييرات على نظام إدارة الجودة عند الحاجة. والدرس هو ما يجعل التغيير يصل إلى المشاريع والعمليات الأخرى حيث قد تحدث «حالات مماثلة».",
         "ISO 9001:2026 clause 10.2.1 asks, when a nonconformity occurs, to react to it, to evaluate the need to eliminate its causes by reviewing it, determining its causes and determining whether similar nonconformities exist or could occur (b) 3)), to implement the actions, review their effectiveness, e) update the risks and opportunities determined during planning, if necessary, and f) make changes to the quality management system, if necessary. The lesson is what carries the change to the other projects and processes where \"similar nonconformities\" could occur."),
       R(EX, "بعد NCR-2026-044 لم يكفِ ملحق عقد المشروع PRJ-2026-112؛ أصبح بند الماء المبرد في نموذج عقد الشركة (PROC-T-05 rev 2)، فوصل إلى كل مشروع جديد.",
         "after NCR-2026-044 the PRJ-2026-112 contract addendum was not enough; the chilled-water clause went into the company contract template (PROC-T-05 rev 2), so it reached every new project."),
       L(("اسأل بعد كل CAPA: أين قد تحدث حالة مماثلة؟", "Ask after each CAPA: where could a similar case occur?"), ("غيّر الوثيقة على مستوى الشركة لا المشروع وحده", "Change the document at company level, not only for one project"), ("سجّل دليل التغيير (رقم الإصدار)", "Record the evidence of the change (the issue number)")),
       L(("وثائق محدّثة برقم إصدارها", "Updated documents with their issue numbers"), ("ربط الدرس بسجل CAPA", "The lesson linked to the CAPA record")),
       L(("إجراء تصحيحي يُغلق في مشروع واحد ويتكرر في غيره", "A corrective action closed on one project that recurs on another"),),
       B("مالك العملية", "Process owner"), B("نسبة الدروس التي غيّرت وثيقة أو ضابطاً", "Share of lessons that changed a document or a control")),
    IT("GD-1", "CP1", B("سجّل المشكلات والحوادث الوشيكة والنجاحات", "Capture problems, near misses and successes"),
       R(GD, "سجّل الدرس من كل حدث يعلّم شيئاً: مشكلة، حادث وشيك، ملاحظة تدقيق، إغلاق مشروع، ملاحظة عميل، ونجاح أيضاً. النجاح الذي لا يُسجّل لا يتكرر إلا بالصدفة. واكتب نوع الحدث وتاريخه ومالك الدرس من اليوم الأول، ثم الحدث كما وقع.",
         "capture a lesson from every event that teaches something: a problem, a near miss, an audit finding, a project close-out, customer feedback, and a success too. A success that is not recorded repeats only by chance. Record the type of event, its date and the lesson owner from day one, then the event as it happened."),
       R(EX, "LL-EX-02 درس من نجاح: بعد الحادث الوشيك في البرج ب نجح الربط بحبلين في 46 رفعة، فصار معياراً للشركة وعُمّم على البرج أ.",
         "LL-EX-02 is a lesson from a success: after the Tower B near miss, two-sling rigging worked in 46 lifts, so it became a company standard and was shared with Tower A."),
       L(("أضف بنداً «ما الذي تعلمناه؟» في إغلاق كل مشروع وتحقيق", "Add a \"what did we learn?\" item to every project close-out and investigation"), ("سجّل النجاحات بالطريقة نفسها", "Record successes the same way")),
       L(("سجل يضم أنواعاً مختلفة من الأحداث", "A register with different types of events"),),
       L(("دروس من الأعطال الكبيرة وحدها", "Lessons from big failures only"),),
       B("مالك الدرس", "Lesson owner"), B("نسبة الدروس من النجاحات", "Share of lessons from successes")),
    IT("GD-2", "x:tools", B("المتوقع مقابل الفعلي", "Expected against actual"),
       R(GD, "اكتب ما كان متوقعاً (هدف، متطلب، معيار قبول) وما حدث فعلاً، بالأرقام إن أمكن، ثم الأثر (تكلفة، وقت، سلامة، عميل). الفرق بين الاثنين هو الدرس؛ وبلا رقم يصبح الدرس رأياً.",
         "write what was expected (a target, a requirement, an acceptance criterion) and what actually happened, in numbers where possible, then the impact (cost, time, safety, customer). The difference between the two is the lesson; without a number the lesson becomes an opinion."),
       R(EX, "المتوقع: أقل من 3% شحنات مرفوضة أسبوعياً؛ الفعلي: 6% (20 من 335)؛ الأثر: نحو 38,000 ريال في شهرين.",
         "expected: under 3% of loads rejected a week; actual: 6% (20 of 335); impact: about SAR 38,000 over two months."),
       L(("اكتب الرقمين والمصدر", "Write both numbers and the source"),),
       L(("المتوقع والفعلي ومصدرهما", "Expected, actual and their source"),),
       L(("«حدثت مشكلة» دون رقم", "\"There was a problem\" with no number"),),
       B("مالك الدرس", "Lesson owner"), B("—", "—")),
    IT("GD-3", "CP3", B("السبب من تحليل حقيقي، لا يُعاد هنا", "The cause from a real analysis, not analysed again here"),
       R(GD, "خذ السبب في جملة واحدة من التحليل المرتبط: تحقيق RCA أو لماذا الخمس أو عظمة السمكة أو صفحة A3 أو مشروع DMAIC أو دراسة FMEA أو سجل CAPA. الأداة تقرأ السجل المصدر للقراءة فقط وتعرض مرحلته بقاعدة أداته. والسبب المكتوب هنا يحمل علامة «غير محلل»، وهي مقبولة لحدث غير جسيم فقط؛ الحدث الجسيم يحتاج تحليلاً حقيقياً قبل كتابة الدرس.",
         "take the cause in one sentence from the linked analysis: an RCA investigation, a 5 Whys, a Fishbone, an A3, a DMAIC project, an FMEA study or a CAPA record. The tool reads the source record read-only and shows its stage by its own tool's rule. A cause written here carries a \"not analysed\" flag, which is accepted only for an event that is not severe; a severe event needs a real analysis before the lesson is written."),
       R(EX, "سبب LL-EX-01 مأخوذ من DM-EX-01: الماء المبرد يعتمد على وردية المحطة، والعقد لا يطلب فحص الحرارة؛ ولم يُعَد التحليل في السجل.",
         "the cause of LL-EX-01 is taken from DM-EX-01: chilled water depends on the plant shift, and the contract does not ask for a temperature check; the analysis was not redone in the register."),
       L(("اربط الدرس بالسجل المصدر برقمه", "Link the lesson to the source record by its id"), ("استخدم «خذ السبب من الأداة المصدر»", "Use \"take the cause from the source tool\""), ("حدث جسيم بلا تحليل؟ ابدأ تحقيق RCA أولاً", "A severe event with no analysis? Start an RCA investigation first")),
       L(("رقم التحليل المصدر ومرحلته", "The source analysis id and its stage"),),
       L(("سبب من رأي في اجتماع", "A cause from an opinion in a meeting"), ("تحليل يُعاد في كل أداة", "An analysis redone in every tool")),
       B("مالك الدرس", "Lesson owner"), B("نسبة الدروس بسبب مرتبط بتحليل", "Share of lessons with a cause linked to an analysis"))
  ]})

S.append({"id": "4.2", "grp": "core", "ph": "rule", "col": "#1B2A4A", "tint": "#E8ECF3",
  "t": B("ISO 9000:2026 البند 4.2 مبادئ إدارة الجودة", "ISO 9000:2026 clause 4.2 Quality management principles"),
  "s": B("الدليل والمشاركة والتحسين", "Evidence, engagement and improvement"), "sh": B("4.2 · المبادئ", "4.2 · Principles"),
  "p": B("ثلاثة مبادئ تحمل الممارسة: القرار المبني على الدليل، ومشاركة الناس دون خوف، والتحسين بالتعلم؛ ومعها ثقافة جودة تشارك المعرفة.",
         "Three principles carry the practice: evidence-based decisions, engagement of people without fear, and improvement through learning; with a quality culture that shares knowledge."),
  "fl": L(("الدليل", "Evidence"), ("المشاركة", "Engagement"), ("التحسين", "Improvement"), ("الثقافة", "Culture")),
  "it": [
    IT("4.2.7", "CP2", B("الدرس مبني على دليل", "A lesson built on evidence"),
       R(IS, "يقوم مبدأ اتخاذ القرار المبني على الدليل في ISO 9000:2026 (4.2.7) على أن القرارات المبنية على تحليل البيانات والمعلومات وتقييمها أكثر احتمالاً لتحقيق النتائج المرجوة. والدرس قرار يُطلب من الآخرين تطبيقه؛ فبلا دليل يصبح رأياً يُتجاهل.",
         "the principle of evidence-based decision-making in ISO 9000:2026 (4.2.7) holds that decisions based on the analysis and evaluation of data and information are more likely to produce the desired results. A lesson is a decision others are asked to apply; without evidence it becomes an opinion that is ignored."),
       R(EX, "دليل LL-EX-03: تقرير التدقيق IA-2026-07 الملاحظة F-03، وسجل CAPA CA-EX-02، والصف R4 في FM-EX-03.",
         "the evidence of LL-EX-03: audit report IA-2026-07 finding F-03, CAPA record CA-EX-02, and row R4 of FM-EX-03."),
       L(("أرفق المصدر لكل رقم", "Give the source of every number"), ("اكتب الدليل قبل الدرس", "Write the evidence before the lesson")),
       L(("الدليل المذكور في كل درس", "The evidence named in every lesson"),),
       L(("دروس من الذاكرة", "Lessons from memory"),),
       B("مالك الدرس", "Lesson owner"), B("نسبة الدروس بدليل", "Share of lessons with evidence")),
    IT("4.2.4", "RL2", B("بلا لوم: مشاركة الناس دون خوف", "Blame-free: engaging people without fear"),
       R(IS, "يذكر مبدأ مشاركة الناس في ISO 9000:2026 (4.2.4) بين الأفعال الممكنة تسهيل النقاش المفتوح وتبادل المعرفة والخبرة، وتمكين الناس من تحديد قيود الأداء والمبادرة دون خوف. والدرس الذي يلوم شخصاً يجعل الناس يخفون الأخطاء والحوادث الوشيكة فيضيع التعلم؛ لذلك تنبّه الأداة على الصياغة التي تشير إلى شخص (إهمال، عدم انتباه، خطأ فلان) بالقاعدة نفسها في FMEA وDMAIC وA3 وRCA.",
         "the principle of engagement of people in ISO 9000:2026 (4.2.4) lists, among possible actions, open discussion and sharing of knowledge and experience, and letting people identify constraints to performance and take initiatives without fear. A lesson that blames a person makes people hide errors and near misses, so the learning is lost; that is why the tool flags wording that names a person (negligence, inattention, someone's mistake), with the same rule as FMEA, DMAIC, A3 and RCA."),
       R(EX, "في FM-EX-02 ما زال سبب R4 «عدم انتباه الرافع»؛ أما درس الرفع LL-EX-02 فيقول ما في العملية سمح بالخطأ: نموذج خطة رفع بلا أسلوب ربط.",
         "in FM-EX-02 the cause of R4 still reads \"rigger not paying attention\"; the lifting lesson LL-EX-02 instead says what in the process allowed the error: a lift plan template with no rigging method."),
       L(("اسأل: ما الذي في العملية سمح بالخطأ؟", "Ask: what in the process allowed the error?"), ("لا أسماء أشخاص في الدرس", "No names of people in the lesson"), ("اشكر من أبلغ عن الحادث الوشيك", "Thank whoever reported the near miss")),
       L(("دروس بصياغة بلا لوم", "Lessons in blame-free wording"),),
       L(("«إهمال الموظف» سبباً", "\"Employee negligence\" as a cause"), ("حوادث وشيكة لا تُبلّغ", "Near misses not reported")),
       B("مدير الجودة", "Quality manager"), B("عدد تنبيهات اللوم", "Number of blame flags")),
    IT("4.2.6", "x:tools", B("التحسين بالتعلم", "Improvement through learning"),
       R(IS, "يقوم مبدأ التحسين في ISO 9000:2026 (4.2.6) على أن المنظمات الناجحة تركز باستمرار على التحسين، ومن فوائده الاستخدام الفعال للتعلم في التحسين، ومن أفعاله الممكنة إدخال التحسين في تطوير المنتجات والخدمات والعمليات الجديدة أو المعدلة.",
         "the improvement principle in ISO 9000:2026 (4.2.6) holds that successful organizations have an ongoing focus on improvement; its benefits include the effective use of learning for improvement, and its possible actions include building improvement into the development of new or modified products, services and processes."),
       R(EX, "عند تصميم خطة رفع لمشروع جديد يبدأ المهندس من القواعد المكتوبة في السجل، لا من صفحة بيضاء.",
         "when designing a lift plan for a new project, the engineer starts from the rules written in the register, not from a blank page."),
       L(("ابدأ كل تصميم جديد بالدروس المنطبقة", "Start every new design with the lessons that apply"),),
       L(("—", "—"),),
       L(("تكرار الأخطاء نفسها في كل مشروع", "The same mistakes repeated on every project"),),
       B("مدير الجودة", "Quality manager"), B("—", "—")),
    IT("4.3.9", "x:tools", B("ثقافة جودة تشارك المعرفة", "A quality culture that shares knowledge"),
       R(IS, "يذكر ISO 9000:2026 (4.3.9 ثقافة الجودة التنظيمية) أن ثقافة الجودة قد تؤثر في السياق الذي تُنشأ فيه المعرفة، وفي مدى مشاركة الناس لها، وفي القدرة على التكيف مع التغيير.",
         "ISO 9000:2026 (4.3.9 organizational quality culture) notes that quality culture can influence the context in which knowledge is created, the extent to which people share it, and the ability to adapt to change."),
       R(EX, "في اجتماع الجودة الشهري يعرض كل مشروع درساً واحداً، نجاحاً أو فشلاً، دون بحث عن مذنب.",
         "in the monthly quality meeting each project presents one lesson, a success or a failure, with no search for someone to blame."),
       L(("اجعل عرض الدروس عادة شهرية", "Make presenting lessons a monthly habit"),),
       L(("—", "—"),),
       L(("دروس تُكتب للتدقيق فقط", "Lessons written for the audit only"),),
       B("الإدارة العليا", "Top management"), B("—", "—"))
  ]})

S.append({"id": "8.1", "grp": "core", "ph": "embed", "col": "#B8901E", "tint": "#F7F0DE",
  "t": B("البند 8.1 التخطيط والضبط التشغيلي والبند 8.5.6 ضبط التغييرات", "Clause 8.1 Operational planning and control, and 8.5.6 Control of changes"),
  "s": B("الترسيخ", "Embedding"), "sh": B("8.1 · الترسيخ", "8.1 · Embedding"),
  "p": B("الدرس قاعدة تدخل معايير العمليات وضوابطها: إجراء أو نموذج أو صف في FMEA أو خطة ضبط، ويُقرأ عند كل تغيير.",
         "The lesson is a rule that enters the process criteria and controls: a procedure, a form, an FMEA row or a control plan, and it is read at each change."),
  "fl": L(("القاعدة", "Rule"), ("المعايير", "Criteria"), ("الضوابط", "Controls"), ("التغيير", "Change")),
  "it": [
    IT("8.1", "x:tools", B("معايير العمليات وضبط التغييرات المخططة", "Process criteria and control of planned changes"),
       R(IS, "تطلب ISO 9001:2026 في البند 8.1 تخطيط العمليات وتنفيذها وضبطها بتحديد معايير للعمليات وقبول المنتجات والخدمات وضبط العمليات وفقها، وضبط التغييرات المخططة ومراجعة عواقب التغييرات غير المقصودة. والدرس المرسّخ يصبح معياراً أو ضابطاً في التخطيط التالي.",
         "ISO 9001:2026 clause 8.1 asks to plan, implement and control the processes by establishing criteria for the processes and for the acceptance of products and services and controlling the processes against them, and to control planned changes and review the consequences of unintended ones. An embedded lesson becomes a criterion or a control in the next planning."),
       R(EX, "حد 32 °م عند التفريغ وفحص الحرارة في المحطة أصبحا معايير قبول في نموذج الاستلام QF-CON-11 rev 3.",
         "the 32 °C limit at discharge and the plant temperature check became acceptance criteria in receiving form QF-CON-11 rev 3."),
       L(("اكتب الدرس معياراً قابلاً للقياس", "Write the lesson as a measurable criterion"),),
       L(("المعيار في الوثيقة المعتمدة", "The criterion in the approved document"),),
       L(("دروس لا تدخل أي معيار", "Lessons that enter no criterion"),),
       B("مالك العملية", "Process owner"), B("—", "—")),
    IT("8.5.6", "x:tools", B("اقرأ السجل عند كل تغيير", "Read the register at each change"),
       R(IS, "تطلب ISO 9001:2026 في البند 8.5.6 مراجعة التغييرات في الإنتاج أو تقديم الخدمة وضبطها بالقدر اللازم لضمان استمرار المطابقة، مع معلومات موثقة بنتائج المراجعة ومن اعتمد التغيير والإجراءات اللازمة. ومراجعة التغيير لحظة مناسبة لقراءة الدروس المنطبقة.",
         "ISO 9001:2026 clause 8.5.6 asks to review and control changes for production or service provision to the extent necessary to ensure continuing conformity, with documented information on the results of the review, who authorized the change and any necessary actions. The review of a change is the right moment to read the lessons that apply."),
       R(EX, "عند تغيير مورد الخرسانة لمشروع قائم قرأ الفريق قاعدة الماء المبرد، فدخلت عقد المورد الجديد.",
         "when the concrete supplier changed for a running project, the team read the chilled-water rule, and it went into the new supplier's contract."),
       L(("أضف «الدروس المنطبقة» إلى نموذج طلب التغيير", "Add \"lessons that apply\" to the change request form"),),
       L(("طلبات تغيير تذكر الدروس المقروءة", "Change requests naming the lessons read"),),
       L(("تغيير يعيد خطأً سبق تعلمه", "A change that repeats a mistake already learned"),),
       B("مالك العملية", "Process owner"), B("—", "—")),
    IT("GD-4", "RL1", B("الدرس قاعدة: عندما… افعل… لأن…", "The lesson as a rule: When…, do…, because…"),
       R(GD, "اكتب الدرس بحيث يطبقه شخص لم يحضر الحدث: «عندما» الموقف الذي يتكرر، «افعل» فعلاً محدداً يمكن التحقق منه، «لأن» ما تعلمتموه بالدليل؛ ثم أين تنطبق القاعدة (عملية، نوع مشروع، موقع) وأين لا تنطبق. والوسوم تجعل القاعدة تظهر لمن يحتاجها في «اقرأ قبل أن تبدأ».",
         "write the lesson so that someone who was not there can apply it: \"When\" the situation that comes back, \"do\" a specific action that can be checked, \"because\" what you learned, with evidence; then where the rule applies (process, project type, site) and where it does not. The tags make the rule show up for whoever needs it in \"read before you start\"."),
       R(EX, "«عندما نستأجر جهاز قياس، نكتب في أمر الاستئجار أن الجهاز يصل بشهادة معايرة سارية ونرفضه دونها، لأن اثنين من الأجهزة الستة المتأخرة كانا مستأجرين بلا شهادة.» ولا تنطبق على أجهزة المخزن المركزي.",
         "\"When we rent a measuring device, we write in the rental order that it must arrive with a valid calibration certificate and refuse it without one, because two of the six overdue devices were rented without a certificate.\" It does not apply to central-store devices."),
       L(("اكتب الأجزاء الثلاثة كاملة", "Write all three parts"), ("حدد النطاق وما خارجه", "State the scope and what is outside it"), ("ضع الوسوم: العملية ونوع المشروع والموقع", "Add the tags: process, project type and site")),
       L(("قواعد مكتوبة بنطاقها", "Rules written with their scope"),),
       L(("«الانتباه للجودة» درساً", "\"Pay attention to quality\" as a lesson"), ("قاعدة بلا نطاق تُطبق في غير موضعها", "A rule with no scope applied where it does not fit")),
       B("مالك الدرس", "Lesson owner"), B("نسبة الدروس المكتوبة قاعدة بنطاقها", "Share of lessons written as a rule with its scope")),
    IT("GD-6", "EM2", B("الدرس إلى FMEA وخطط الضبط", "The lesson into FMEA and control plans"),
       R(GD, "أقوى ترسيخ أن يدخل الدرس الأدوات التي تُستخدم كل يوم: صف جديد أو معدل في دراسة FMEA، وبند في خطة الضبط، ومعيار تصميم، وبند عقد، وقائمة فحص. وفي الأداة يسمي إجراء الترسيخ «صف في FMEA» الدراسة برقمها مع معاينة بقاعدتها، وتعرض دراسة FMEA الدروس التي تذكرها (قراءة فقط).",
         "the strongest embedding is when the lesson enters the tools used every day: a new or revised row in an FMEA study, an item in the control plan, a design standard, a contract clause, a checklist. In the tool an \"FMEA row\" embedding action names the study by its id, with a preview by its own rule, and the FMEA study lists the lessons that name it (read-only)."),
       R(EX, "صفا الماء المبرد وميزان الحرارة في FM-EX-01 أصبحا دراسة البداية لكل مشروع خرسانة؛ والدراسة تعرض LL-EX-01 في مراجعتها.",
         "the chilled-water and thermometer rows in FM-EX-01 became the starting study for every concrete project; the study shows LL-EX-01 in its review section."),
       L(("أضف إجراء «صف في FMEA» برقم الدراسة", "Add an \"FMEA row\" action with the study id"), ("حدّث خطة الضبط بالقاعدة", "Update the control plan with the rule")),
       L(("صفوف FMEA وبنود خطط الضبط التي تذكر الدرس", "FMEA rows and control-plan items naming the lesson"),),
       L(("FMEA لا تتغير بعد الدروس", "An FMEA that never changes after lessons"),),
       B("مالك العملية", "Process owner"), B("نسبة الدروس التي دخلت FMEA أو خطة ضبط", "Share of lessons in an FMEA or a control plan"))
  ]})

S.append({"id": "9.1.3", "grp": "core", "ph": "share", "col": "#1E8C93", "tint": "#E3F3F4",
  "t": B("البند 9.1.3 التحليل والتقييم", "Clause 9.1.3 Analysis and evaluation"),
  "s": B("التحقق", "Verification"), "sh": B("9.1.3 · التحقق", "9.1.3 · Verification"),
  "p": B("الدرس لا يكون مستفاداً حتى يُتحقق أن المشروع التالي طبّقه ونجح. الترسيخ بمالك وموعد ودليل، ثم تحقق مؤرخ بعده.",
         "A lesson is not learned until it is checked that the next project applied it and it worked. Embedding with an owner, a date and evidence, then a dated check after it."),
  "fl": L(("الإجراء", "Action"), ("الدليل", "Evidence"), ("التحقق", "Check"), ("النتيجة", "Result")),
  "it": [
    IT("9.1.3", "x:tools", B("تقييم فعالية الإجراءات", "Evaluating the effectiveness of actions"),
       R(IS, "تطلب ISO 9001:2026 في البند 9.1.3 تحليل البيانات والمعلومات الناتجة عن الرصد والقياس وتقييمها، واستخدام النتائج لتقييم أمور منها (هـ) فعالية الإجراءات المتخذة لمعالجة المخاطر، و(ح) الحاجة إلى تحسينات. والتحقق في المشروع التالي هو تقييم فعالية الدرس.",
         "ISO 9001:2026 clause 9.1.3 asks to analyse and evaluate the data and information from monitoring and measurement, and to use the results to evaluate, among other things, e) the effectiveness of actions taken to address risks and h) the need for improvements. The check on the next project is the evaluation of the lesson's effectiveness."),
       R(EX, "تحقق LL-EX-01 في المشروع PRJ-2026-118: شحنة واحدة مرفوضة من 64 (1.6%)، ولا شحنة بسبب الحرارة.",
         "the LL-EX-01 check on project PRJ-2026-118: 1 of 64 loads rejected (1.6%), none for temperature."),
       L(("قِس بالمقياس نفسها الذي كشف المشكلة", "Measure with the same measure that showed the problem"),),
       L(("نتيجة التحقق ومصدرها", "The result of the check and its source"),),
       L(("تحقق بالانطباع", "A check by impression"),),
       B("مدير المشروع التالي", "The next project's manager"), B("—", "—")),
    IT("3.2.4", "VS1", B("الممارسة الجيدة: ثبت أنها تعمل", "A good practice: proven to work"),
       R(IS, "يعرّف ISO 9000:2026 الممارسة الجيدة (3.2.4) بأنها طريقة ثبت أنها تعمل جيداً وتعطي نتائج جيدة، فيوصى باعتمادها نموذجاً؛ وتذكر الملاحظة أنها تُختبر عادة مع الوقت وتُثبت بالتجارب المتكررة قبل قبولها للاعتماد الواسع. لذلك تشترط الأداة تحققاً مؤرخاً بعد الإجراءات، يسمي المشروع أو العملية التالية، بنتيجة «طُبّق ونجح» ودليل.",
         "ISO 9000:2026 defines a good practice (3.2.4) as a method that has been proven to work well and produce good results, and is therefore recommended to be adopted as a model; its note says it has usually been tested over time and validated through repeated trials before being accepted for broad adoption. That is why the tool asks for a dated check after the actions, naming the next project or process, with the result \"applied and worked\" and evidence."),
       R(EX, "LL-EX-03 رُسّخ (أمر الاستئجار معدل) لكنه لم يُتحقق منه بعد؛ ينتظر أول استئجار في نوفمبر، ويبقى في مرحلة «رُسّخ».",
         "LL-EX-03 is embedded (the rental order revised) but not verified yet; it waits for the first rental in November and stays at the \"embedded\" stage."),
       L(("حدد من سيتحقق ومتى عند كتابة الدرس", "Name who will check and when, as you write the lesson"), ("سجّل «طُبّق جزئياً» بصدق وخطط إجراءً إضافياً", "Record \"applied, partly\" honestly and plan a further action")),
       L(("تحقق مؤرخ بعد الإجراءات بدليل", "A dated check after the actions, with evidence"),),
       L(("درس يُغلق يوم كتابته", "A lesson closed on the day it is written"),),
       B("مالك الدرس", "Lesson owner"), B("نسبة الدروس المتحقق منها", "Share of verified lessons")),
    IT("GD-5", "RL3", B("إجراءات الترسيخ بمالك وموعد ودليل", "Embedding actions with an owner, a date and evidence"),
       R(GD, "لكل إجراء ترسيخ: ما الذي يتغيّر (إجراء، نموذج، قائمة فحص، تدريب، صف FMEA، خطة ضبط، معيار تصميم، بند عقد)، ومرجع الوثيقة، ومالك، وموعد، وحالة، وتاريخ تنفيذ، ودليل على التغيير (رقم الإصدار، سجل التدريب). ولا يُعدّ الدرس «مرسّخاً» حتى تُنفذ كل إجراءاته بدليل.",
         "for each embedding action: what changes (procedure, form, checklist, training, FMEA row, control plan, design standard, contract clause), the document reference, an owner, a due date, a status, the date done and evidence of the change (the issue number, the training record). A lesson does not count as \"embedded\" until all its actions are done with evidence."),
       R(EX, "LL-EX-02: أربعة إجراءات (LP-07 rev 3، والوزن على البطاقة، والتدريب TBT-2026-41، وإعادة تقييم FM-EX-02)، كلها منفذة بدليل.",
         "LL-EX-02: four actions (LP-07 rev 3, the weight on the tag, training TBT-2026-41, the FM-EX-02 re-rating), all done with evidence."),
       L(("مالك وموعد لكل إجراء", "An owner and a due date for every action"), ("دليل التغيير لا مجرد «تم»", "Evidence of the change, not just \"done\"")),
       L(("جدول الإجراءات بمالكيها ودليلها", "The action table with owners and evidence"),),
       L(("إجراءات بلا مالك", "Actions with no owner"), ("«تم» بلا دليل", "\"Done\" with no evidence")),
       B("مالك الدرس", "Lesson owner"), B("نسبة إجراءات الترسيخ المنفذة بدليل", "Share of embedding actions done with evidence"))
  ]})

S.append({"id": "7.4", "grp": "core", "ph": "share", "col": "#3C9A5F", "tint": "#E5F4EA",
  "t": B("البند 7.4 التواصل والبند 9.3.2 مدخلات مراجعة الإدارة", "Clause 7.4 Communication, and 9.3.2 Management review inputs"),
  "s": B("التعميم والمراجعة", "Sharing and review"), "sh": B("7.4 · التعميم", "7.4 · Sharing"),
  "p": B("الدرس الذي لا يصل إلى من يحتاجه لا يغيّر شيئاً. والسجل يُراجع دورياً في مراجعة الإدارة.",
         "A lesson that does not reach those who need it changes nothing. The register is reviewed periodically in management review."),
  "fl": L(("ماذا", "What"), ("لمن", "To whom"), ("كيف", "How"), ("المراجعة", "Review")),
  "it": [
    IT("7.4", "VS2", B("التعميم: ماذا ومتى ولمن وكيف ومن", "Sharing: what, when, with whom, how and who"),
       R(IS, "تطلب ISO 9001:2026 في البند 7.4 تحديد التواصل الداخلي والخارجي المتعلق بالنظام: عمّا يُتواصل، ومتى، ومع من، وكيف، ومن يتواصل. ويوضح الملحق A.7.4 أن التواصل قد يُخطط له وتُقيَّم فعاليته. وتعميم الدرس تواصل مخطط: من يحتاجه، وكيف يصله، ومتى.",
         "ISO 9001:2026 clause 7.4 asks to determine the internal and external communications relevant to the system: on what, when, with whom, how, and who communicates. Annex A.7.4 explains that communication can be planned and evaluated for effectiveness. Sharing a lesson is planned communication: who needs it, how it reaches them, and when."),
       R(EX, "عُمّم LL-EX-02 على فريق البرج أ بتنبيه سلامة «ممارسة جيدة» وجولة في البرج ب، ثم على لجنة السلامة وكل مديري المشاريع.",
         "LL-EX-02 was shared with the Tower A team through a \"good practice\" safety alert and a walk-through at Tower B, then with the HSE committee and every project manager."),
       L(("حدد الجمهور قبل الوسيلة", "Pick the audience before the channel"), ("ضع بطاقة الدرس في حزمة بدء المشروع", "Put the lesson card in the project start pack")),
       L(("سجل التعميم: التاريخ ومن وكيف", "The sharing record: date, who and how"),),
       L(("بريد جماعي لا يقرؤه أحد", "A mass e-mail nobody reads"),),
       B("مالك الدرس", "Lesson owner"), B("نسبة الدروس المعممة", "Share of lessons shared")),
    IT("9.3.2", "VS3", B("مراجعة السجل في مراجعة الإدارة", "Reviewing the register in management review"),
       R(IS, "تطلب ISO 9001:2026 في البند 9.3.2 أن تشمل مراجعة الإدارة أموراً منها: حالة الإجراءات من المراجعات السابقة، ومعلومات أداء النظام بما فيها اتجاهات عدم المطابقة والإجراءات التصحيحية ونتائج التدقيق، وفرص التحسين. ومراجعة السجل دورياً تكشف الدروس التي لم تُرسّخ أو لم يُتحقق منها.",
         "ISO 9001:2026 clause 9.3.2 asks that management review include, among other things, the status of actions from previous reviews, information on system performance including trends in nonconformities and corrective actions and audit results, and opportunities for improvement. Reviewing the register periodically shows the lessons that are not embedded or not verified."),
       R(EX, "في مراجعة الإدارة للربع الثالث عُرض السجل: درسان عُمّما، ودرس ينتظر التحقق، وقُرر أن يُتحقق منه في أول استئجار.",
         "in the third-quarter management review the register was shown: two lessons shared, one waiting for verification, and it was decided to check it at the first rental."),
       L(("أدخل لوحة مؤشرات السجل في مراجعة الإدارة", "Bring the register dashboard to management review"), ("أغلق ما لم يُرسّخ بقرار", "Close what is not embedded by a decision")),
       L(("محضر مراجعة الإدارة يذكر السجل", "Management review minutes naming the register"),),
       L(("سجل لم يُراجع منذ إنشائه", "A register never reviewed since it was created"),),
       B("الإدارة العليا", "Top management"), B("عدد البنود المفتوحة في السجل", "Number of open items in the register")),
    IT("10.1", "x:tools", B("التحسين المستمر ومنع الآثار غير المرغوبة", "Continual improvement and preventing undesired effects"),
       R(IS, "تطلب ISO 9001:2026 في البند 10.1 تحسين ملاءمة النظام وكفايته وفعاليته باستمرار، وأن تشمل الإجراءات أموراً منها ج) تصحيح الآثار غير المرغوبة أو منعها أو خفضها. ويوضح الملحق A.10.1 أن أنشطة التحسين قد تشمل تكييف العمليات والمعرفة والموارد. والدرس منع: يحمل ما تعلمته إلى حيث لم يقع الفشل بعد.",
         "ISO 9001:2026 clause 10.1 asks to continually improve the suitability, adequacy and effectiveness of the system, with actions that include c) correcting, preventing or reducing undesired effects. Annex A.10.1 explains that improvement activities can involve adapting processes, knowledge and resources. A lesson is prevention: it carries what you learned to where the failure has not happened yet."),
       R(EX, "بعد LL-EX-02 عاد رفع الحزم في البرج ج بالنموذج الجديد: 24 رفعة دون حبل واحد.",
         "after LL-EX-02, bundle lifts restarted on Tower C with the new template: 24 lifts with no single sling."),
       L(("انقل الدرس إلى حيث لم يقع الفشل", "Carry the lesson to where the failure has not happened"),),
       L(("—", "—"),),
       L(("تحسين يبقى في مكان حدوثه", "An improvement that stays where it happened"),),
       B("مدير الجودة", "Quality manager"), B("—", "—"))
  ]})

S.append({"id": "19011", "grp": "core", "ph": "share", "col": "#C2410C", "tint": "#FBEBE3",
  "t": B("ISO 19011:2026 الدروس في التدقيق", "ISO 19011:2026 Lessons in auditing"),
  "s": B("التدقيق والفجوات", "Auditing and gaps"), "sh": B("19011 · التدقيق", "19011 · Auditing"),
  "p": B("الدروس مدخل لتخطيط التدقيق وتحسين برنامجه، والمدقق يسأل: ما الذي تغيّر؟ ومن طبّقه بعد ذلك؟",
         "Lessons feed audit planning and the improvement of the programme, and the auditor asks: what changed? Who applied it next?"),
  "fl": L(("البرنامج", "Programme"), ("التخطيط", "Planning"), ("الإكمال", "Completion"), ("الفجوات", "Gaps")),
  "it": [
    IT("5.7", "x:tools", B("الدروس لتحسين برنامج التدقيق", "Lessons to improve the audit programme"),
       R(IS, "يذكر ISO 19011:2026 في البند 5.7 (مراجعة برنامج التدقيق وتحسينه) أن مسؤول البرنامج وعميل التدقيق يراجعان البرنامج لتقييم تحقق أهدافه، وأن الدروس المستفادة من المراجعة ينبغي أن تُستخدم مدخلات لتحسينه. وISO 19011 إرشادات لا متطلبات.",
         "ISO 19011:2026 subclause 5.7 (reviewing and improving the audit programme) says the person managing the programme and the audit client review it to assess whether its objectives were achieved, and that lessons learned from the review should be used as inputs to improve it. ISO 19011 is guidance, not requirements."),
       R(EX, "بعد ملاحظة المعايرة F-03 أضاف برنامج التدقيق لعام 2027 فحص الأجهزة المستأجرة في كل موقع.",
         "after calibration finding F-03, the 2027 audit programme added a check of rented devices on every site."),
       L(("سجّل دروس برنامج التدقيق في السجل نفسه", "Record the audit programme's lessons in the same register"),),
       L(("—", "—"),),
       L(("برنامج تدقيق لا يتغير", "An audit programme that never changes"),),
       B("مسؤول برنامج التدقيق", "Audit programme manager"), B("—", "—")),
    IT("6.3.2.2", "x:tools", B("الدروس في تخطيط التدقيق", "Lessons in audit planning"),
       R(IS, "يذكر ISO 19011:2026 في البند 6.3.2.2 (تفاصيل تخطيط التدقيق) أن التخطيط يراعي، حسب الاقتضاء، أنشطة المتابعة من تدقيق سابق أو مصادر أخرى، ومن أمثلتها الدروس المستفادة ومراجعات المشاريع. ويذكر في البند 6.6 (إكمال التدقيق) أن الدروس المستفادة من التدقيق قد تكشف مخاطر وفرصاً لبرنامج التدقيق وللجهة المدققة.",
         "ISO 19011:2026 subclause 6.3.2.2 (audit planning details) says planning takes into account, as appropriate, follow-up activities from a previous audit or other sources, such as lessons learned and project reviews. Subclause 6.6 (completing the audit) says lessons learned from the audit can identify risks and opportunities for the audit programme and the auditee."),
       R(EX, "قبل تدقيق موقع جديد قرأ المدقق الداخلي دروس «ضبط أجهزة القياس» و«عمليات الرفع»، فوضع أسئلتها في قائمة الفحص.",
         "before auditing a new site, the internal auditor read the lessons on \"control of measuring devices\" and \"lifting operations\" and put their questions into the checklist."),
       L(("ابحث في السجل قبل كل تدقيق", "Search the register before each audit"), ("أضف درساً بعد كل تدقيق يعلّم شيئاً", "Add a lesson after every audit that teaches something")),
       L(("خطة التدقيق تذكر الدروس", "The audit plan naming the lessons"),),
       L(("تدقيق يتجاهل ما تعلمته الشركة", "An audit that ignores what the company learned"),),
       B("المدقق الداخلي", "Internal auditor"), B("—", "—")),
    IT("GD-7", "x:tools", B("الفجوات الشائعة وما يطلبه المدقق", "Common gaps and what an auditor asks for"),
       R(GD, "الفجوات الشائعة: دروس في محاضر لا يقرؤها أحد، ودروس من الأعطال وحدها، وسبب من رأي، ودرس يلوم شخصاً، ودرس عام بلا فعل محدد، وإجراء بلا مالك أو بلا دليل، ودرس «مغلق» يوم كتابته دون تحقق، وسجل لا يُبحث فيه قبل المشاريع ولا يُراجع. والمدقق يطلب عادة: الدرس ودليله، والتحليل الذي أخذ منه السبب، والوثيقة التي تغيّرت برقم إصدارها، والمشروع الذي طبّقه بعد ذلك ونتيجته، ومن أُبلغ، وكيف قُرئ السجل قبل مشروع جديد.",
         "common gaps: lessons in minutes nobody reads, lessons from failures only, a cause from an opinion, a lesson that blames a person, a general lesson with no specific action, an action with no owner or no evidence, a lesson \"closed\" on the day it was written with no check, and a register never searched before projects and never reviewed. An auditor usually asks for: the lesson and its evidence, the analysis the cause came from, the document that changed with its issue number, the project that applied it next and the result, who was told, and how the register was read before a new project."),
       R(EX, "التدقيق الآلي للمثال: LL-EX-01 وLL-EX-02 ينجحان في كل الفحوص المنطبقة؛ وLL-EX-03 لا تنطبق عليه فحوص التحقق والتعميم بعد، وبنده المفتوح «تحقق في المشروع التالي».",
         "the automatic audit of the example: LL-EX-01 and LL-EX-02 pass every applicable check; the verification and sharing checks do not apply to LL-EX-03 yet, and its open item is \"check on the next project\"."),
       L(("راجع تبويب التدقيق قبل كل مراجعة إدارة", "Check the Audit tab before each management review"),),
       L(("نتيجة التدقيق الآلي لكل درس", "The automatic audit result for each lesson"),),
       L(("سجل كبير بلا تغيير واحد", "A big register with not one change"),),
       B("المدقق الداخلي", "Internal auditor"), B("نسبة الفحوص الناجحة", "Audit pass rate"))
  ]})

# a section whose id is also an item code opens on that item, so the item that carries the section's number comes first
for sec in S:
    sec["it"].sort(key=lambda x: 0 if x["c"] == sec["id"] else 1)

legend = [[p["c"], p["n"]] for p in phases.values()]

DATA = {
    "meta": meta, "std": std, "texts": texts, "phases": phases, "flags": {}, "legend": legend,
    "diagram": {"type": "cycle", "centre": B("الدرس", "Lesson")},
    "matrix": {"tab": "", "d": B("", ""), "btn": B("", "")},
    "sections": S, "paths": [],
    "edges": [["GD-1", "GD-2"], ["GD-2", "4.2.7"], ["4.2.7", "GD-3"], ["10.2.1", "GD-3"], ["GD-3", "GD-4"], ["GD-4", "4.2.4"], ["4.2.4", "GD-5"],
              ["GD-5", "10.2.1"], ["GD-5", "GD-6"], ["GD-6", "8.1"], ["8.1", "8.5.6"], ["GD-5", "9.1.3"], ["9.1.3", "3.2.4"], ["3.2.4", "7.4"],
              ["7.4", "9.3.2"], ["9.3.2", "10.1"], ["7.1.6", "A.7.1.6"], ["3.10.4", "7.1.6"], ["8.5.6", "7.1.6"], ["15", "4.2.6"], ["4.2.6", "10.1"],
              ["4.3.9", "7.4"], ["5.7", "6.3.2.2"], ["6.3.2.2", "7.1.6"], ["10.1", "GD-7"]],
    "changes": {"note": B("", ""), "tlT": B("", ""), "tlS": B("", ""), "tlCols": 4, "tl": [], "cardsT": B("", ""), "cardsS": B("", ""), "cards": [],
                "corr": {"t": B("", ""), "s": B("", ""), "h": [], "rows": []}, "steps": {"t": B("", ""), "s": B("", ""), "l": B("", "")}},
    "ui": {
        "ar": {"roles": "من يعمل في سجل الدروس", "wheelT": "عجلة البنود", "purpose": "الغرض من الأداة", "smap": "خطوات الدرس من الحدث إلى المشروع التالي",
               "smapSub": "كل خطوة في سطر. اضغط «اشرح» لفتح البند أو القاعدة التي تخدمها.", "rel": "علاقتها بأدوات المنصة", "comp": "المراجع المساندة",
               "assess": "قيّم هذا في التقييم الذاتي", "assessC": "قيّم هذا في التقييم الذاتي",
               "assessOff": "هذا البند خارج أسئلة التقييم الذاتي، ويُطبَّق مباشرة في سجل الدروس.", "offGo": "افتح سجل الدروس",
               "actCtx": "يفتح السؤال {s}", "explainA": "اشرح {c} في دليل البنود"},
        "en": {"roles": "Who works on the lessons register", "wheelT": "Clause wheel", "purpose": "What the tool is for", "smap": "Steps of a lesson, from the event to the next project",
               "smapSub": "One line per step. Select “Explain” to open the clause or rule it serves.", "rel": "How it connects to the platform's tools", "comp": "Supporting references",
               "assess": "Assess this in the self-assessment", "assessC": "Assess this in the self-assessment",
               "assessOff": "This clause is outside the self-assessment questions; it is applied directly in the lessons register.", "offGo": "Open the lessons register",
               "actCtx": "Opens question {s}", "explainA": "Explain {c} in the clause guide"}
    }
}

if __name__ == "__main__":
    js = ("/* Lessons learned explanation data for the CIA Explain Kit v1.4. Lessons learned is a practice, not a requirement of any standard.\n"
          "   ISO 9001:2026, ISO 9000:2026 (OCR) and ISO 19011:2026 clause numbers and titles checked on 2026-10-16 against the uploaded texts;\n"
          "   ISO 10009:2024 clause 15 checked against the uploaded PDF. Requirements are interpretive summaries, not the official text;\n"
          "   ISO 30401, PMBOK and PRINCE2 are not uploaded (\"not verified\"). */\n"
          "const EXPLAIN_LESSONS=" + json.dumps(DATA, ensure_ascii=False, indent=1) + ";\n")
    sys.stdout.write(js)
