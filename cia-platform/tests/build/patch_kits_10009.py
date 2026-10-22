"""Step 2026-10-16 (ISO 10009 guide): the Explain Kit data of Fishbone, Pareto, RCA, A3 and DMAIC said "ISO 10009 is not uploaded: not
verified". The text is now uploaded and checked, so each kit names the ISO 10009:2024 subclause that reviews its method and points to the
ISO 10009 guide on the platform. Only text inside <script id="cia-explain-data"> changes: no question, score, storage key, stored state,
example, report or audit rule changes. Every anchor must match exactly once inside the data block. Run AFTER build_dmaic.py and the
patches of the earlier steps (on modules that already carry them):
    python3 tests/build/patch_kits_10009.py
Clause numbers checked against ISO-10009-2024-Quality-Management-Guidance-for-Quality-Tools.pdf: 13.7 Pareto chart, 14.1 Root cause
analysis (RCA), 14.4 Five whys analysis, 14.5 Fishbone/Ishikawa diagrams, 14.7 Other relevant tools (8D and A3 charts), 16.1 Six Sigma
programme (DMAIC named as its project method), Annex A Tables A.1–A.3."""
import os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
V_AR = "ISO 10009:2024 مرفوعة وتُحقق منها في 2026-10-16"
V_EN = "ISO 10009:2024 was uploaded and checked on 2026-10-16"

EDITS = {
 "fishbone": [
  ("تشير ملاحظتاه 3 و4 إلى ISO 10009 للإرشاد في أدوات الجودة وISO 10017 للأساليب الإحصائية. هذان الدليلان غير مرفوعين، فمحتواهما «غير متحقق منه» هنا.",
   "تشير ملاحظتاه 3 و4 إلى ISO 10009 للإرشاد في أدوات الجودة وISO 10017 للأساليب الإحصائية. تشرح ISO 10009:2024 مخطط عظمة السمكة / إيشيكاوا في البند 14.5 والعصف الذهني في 15.4، وتضعه في مرحلة التنفيذ لتحسين العمليات والتحسين المستمر (الجدولان A.2 وA.3)؛ والشرح الكامل في دليل ISO 10009 على المنصة. أما ISO 10017 فغير مرفوعة: «غير متحقق منها»."),
  ("Its notes 3 and 4 point to ISO 10009 for guidance on quality tools and ISO 10017 for statistical techniques. Those two guides are not uploaded, so their content is “not verified” here.",
   "Its notes 3 and 4 point to ISO 10009 for guidance on quality tools and ISO 10017 for statistical techniques. ISO 10009:2024 reviews the fishbone/Ishikawa diagram in 14.5 and brainstorming in 15.4, and places it in Do for process improvement and continual improvement (Tables A.2 and A.3); the full guide is the ISO 10009 tool on the platform. ISO 10017 is not uploaded: “not verified”."),
 ],
 "pareto": [
  ("summaries, not the official text; ISO 10009 and ISO 10017 are not uploaded (",
   "summaries, not the official text; ISO 10009:2024 13.7 checked on 2026-10-16; ISO 10017 is not uploaded ("),
  ("كل «متطلب» ملخص تفسيري، وليس النص الرسمي. ISO 10009 وISO 10017 غير مرفوعين: «غير متحقق منه».",
   "كل «متطلب» ملخص تفسيري، وليس النص الرسمي. " + V_AR + " (البند 13.7)؛ وISO 10017 غير مرفوعة: «غير متحقق منها»."),
  ("Every “requirement” is an interpretive summary, not the official text. ISO 10009 and ISO 10017 are not uploaded: “not verified”.",
   "Every “requirement” is an interpretive summary, not the official text. " + V_EN + " (13.7); ISO 10017 is not uploaded: “not verified”."),
  ("\"ISO 10009 · ISO 10017\"", "\"ISO 10009:2024 §13.7 · ISO 10017\""),
  ("أدوات الجودة والأساليب الإحصائية (غير متحقق منه)", "أدوات الجودة (متحقق منها) والأساليب الإحصائية (غير متحقق منها)"),
  ("Quality tools and statistical techniques (not verified)", "Quality tools (checked) and statistical techniques (not verified)"),
  ("والدليلان غير مرفوعين إلى المشروع، فمحتواهما «غير متحقق منه» هنا، ويُذكران كما سمّتهما الملاحظتان فقط.",
   "وتشرح ISO 10009:2024 مخطط باريتو في البند 13.7 (القلة الحيوية وقاعدة 80:20)، وتضعه ضمن أدوات مرحلة التحقق في الجدولين A.1 وA.3؛ والشرح الكامل في دليل ISO 10009 على المنصة. أما ISO 10017 فغير مرفوعة: «غير متحقق منها»."),
  ("The two guides are not uploaded to the project, so their content is “not verified” here; they are named only as the notes name them.",
   "ISO 10009:2024 reviews the Pareto chart in 13.7 (the vital few and the 80:20 rule) and lists it among the Check tools of Tables A.1 and A.3; the full guide is the ISO 10009 tool on the platform. ISO 10017 is not uploaded: “not verified”."),
 ],
 "rca": [
  ("Requirements are interpretive summaries, not the official text; ISO 10009, ISO 10017 and IEC 62740 are not uploaded (",
   "Requirements are interpretive summaries, not the official text; ISO 10009:2024 14.1 checked on 2026-10-16; ISO 10017 and IEC 62740 are not uploaded ("),
  ("كل «متطلب» ملخص تفسيري، وليس النص الرسمي. ISO 10009 وISO 10017 وأي مواصفة لتحليل السبب الجذري مثل IEC 62740 غير مرفوعة: «غير متحقق منه».",
   "كل «متطلب» ملخص تفسيري، وليس النص الرسمي. " + V_AR + " (البند 14.1)؛ وISO 10017 وأي مواصفة لتحليل السبب الجذري مثل IEC 62740 غير مرفوعة: «غير متحقق منها»."),
  ("Every “requirement” is an interpretive summary, not the official text. ISO 10009, ISO 10017 and any root cause analysis standard such as IEC 62740 are not uploaded: “not verified”.",
   "Every “requirement” is an interpretive summary, not the official text. " + V_EN + " (14.1); ISO 10017 and any root cause analysis standard such as IEC 62740 are not uploaded: “not verified”."),
  ("\"IEC 62740 · ISO 10009 · ISO 10017\"", "\"ISO 10009:2024 §14.1 · IEC 62740 · ISO 10017\""),
  ("مواصفات الطرق والأدوات (غير متحقق منه)", "مواصفات الطرق والأدوات"),
  ("Method and tool standards (not verified)", "Method and tool standards"),
  ("هذه الوثائق غير مرفوعة إلى المشروع، فمحتواها «غير متحقق منه» هنا. ISO 10009 وISO 10017 تذكرهما ملاحظتا الملحق A.9.1 في ISO 9001:2026 فقط.",
   "تشرح ISO 10009:2024 تحليل السبب الجذري في البند 14.1 (فهم السبب لمنع التكرار، ولماذا لم تكتشفه الضوابط)، ولماذا الخمس في 14.4، وعظمة السمكة في 14.5، و«ما هو / ما ليس» في 14.6؛ والشرح الكامل في دليل ISO 10009 على المنصة. أما IEC 62740 وISO 10017 فغير مرفوعتين: «غير متحقق منهما»."),
  ("These documents are not uploaded to the project, so their content is “not verified” here. ISO 10009 and ISO 10017 are only named in the notes of Annex A.9.1 of ISO 9001:2026.",
   "ISO 10009:2024 reviews root cause analysis in 14.1 (understanding the cause to prevent recurrence, and why the controls missed it), five whys in 14.4, fishbone in 14.5 and is/is not in 14.6; the full guide is the ISO 10009 tool on the platform. IEC 62740 and ISO 10017 are not uploaded: “not verified”."),
 ],
 "a3": [
  ("Requirements are interpretive summaries, not the official text; A3 and lean references, ISO 10009 and ISO 10017 are not uploaded (",
   "Requirements are interpretive summaries, not the official text; ISO 10009:2024 14.7 checked on 2026-10-16; A3 and lean references and ISO 10017 are not uploaded ("),
  ("أي مرجع لمنهج A3 أو الإنتاج الرشيق، وISO 10009 وISO 10017، غير مرفوعة: «غير متحقق منه».",
   V_AR + " (البند 14.7)؛ وأي مرجع لمنهج A3 أو الإنتاج الرشيق، وISO 10017، غير مرفوعة: «غير متحقق منه»."),
  ("Any A3 or lean reference, ISO 10009 and ISO 10017 are not uploaded: “not verified”.",
   V_EN + " (14.7); any A3 or lean reference and ISO 10017 are not uploaded: “not verified”."),
  ("\"A3 · Lean · ISO 10009 · ISO 10017\"", "\"A3 · Lean · ISO 10009:2024 §14.7 · ISO 10017\""),
  ("ISO 10009 وISO 10017 تذكرهما ملاحظتا الملحق A.9.1 فقط.",
   "وتذكر ISO 10009:2024 «مخططات 8D وA3» بالاسم ضمن الأدوات الأخرى ذات الصلة في البند 14.7 دون مراجعة تفصيلية، وتعرض لوحات القصة في الملحق B؛ والشرح في دليل ISO 10009 على المنصة. أما ISO 10017 فغير مرفوعة."),
  ("ISO 10009 and ISO 10017 are only named in the notes of Annex A.9.1.",
   "ISO 10009:2024 names “8D and A3 charts” among the other relevant tools of 14.7, with no detailed review, and shows storyboards in Annex B; see the ISO 10009 guide on the platform. ISO 10017 is not uploaded."),
 ],
 "dmaic": [
  ("أي مرجع لـ Six Sigma، وISO 13053 وISO 7870 وISO 10017 وISO 10009 وأي مواصفة إحصاء، غير مرفوعة: «غير متحقق منه».",
   V_AR + " (البند 16.1 برنامج Six Sigma، ومنهجيته DMAIC)؛ وأي مرجع لـ Six Sigma، وISO 13053 وISO 7870 وISO 10017 وأي مواصفة إحصاء، غير مرفوعة: «غير متحقق منه»."),
  ("Any Six Sigma reference, ISO 13053, ISO 7870, ISO 10017, ISO 10009 and any statistics standard are not uploaded: “not verified”.",
   V_EN + " (16.1 Six Sigma programme, which names DMAIC as its project method); any Six Sigma reference, ISO 13053, ISO 7870, ISO 10017 and any statistics standard are not uploaded: “not verified”."),
 ],
}


def main():
    changed = []
    for f, edits in EDITS.items():
        p = os.path.join(ROOT, "modules", f + ".html")
        s = open(p, encoding="utf-8").read()
        if "ISO 10009:2024" in s:
            print(f + ".html: already patched"); continue
        a = s.find('<script id="cia-explain-data">'); b = s.find("</script>", a)
        assert a > 0 and b > a, f
        d = s[a:b]
        for old, new in edits:
            n = d.count(old)
            assert n == 1, (f, n, old[:70])
            d = d.replace(old, new)
        assert "not uploaded: “not verified”" not in d or "ISO 10009 and" not in d, f
        s = s[:a] + d + s[b:]
        open(p, "w", encoding="utf-8").write(s)
        changed.append(f)
    print("ISO 10009 references updated in:", ", ".join(changed) or "nothing")


if __name__ == "__main__":
    main()
