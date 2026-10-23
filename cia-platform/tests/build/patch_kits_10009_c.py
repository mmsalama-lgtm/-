"""Step 15 (2026-10-22), ISO 10009 "Part C" (left from steps 12–13): the three toolbox kits that did not name ISO 10009:2024 now do, in one
sentence added to their note (the kit's "about this explanation" text). Only text inside <script id="cia-explain-data"> changes: no question,
score, key, stored state, example, report, CSV or audit rule. Subclauses from tests/build/cat_10009.py (checked against the official ISO
10009:2024 PDF): 15.6 Plan-Do-Check-Act (PDCA), 14.4 Five whys analysis, 14.1 Root cause analysis and 14.7 "8D and A3 charts".
    python3 tests/build/patch_kits_10009_c.py"""
import os
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
G_AR, G_EN = "والشرح الكامل في دليل ISO 10009 على المنصة.", "The full guide is the ISO 10009 tool on the platform."
EDITS = {
 "pdca": [("وليس نصاً معيارياً.\",", "وليس نصاً معيارياً. وتشرح ISO 10009:2024 دورة PDCA في البند 15.6؛ " + G_AR + "\","),
          ("not normative text.\"", "not normative text. ISO 10009:2024 reviews the PDCA cycle in 15.6. " + G_EN + "\"")],
 "five-whys": [("متحقق منها من النصوص الرسمية المرفوعة.\",", "متحقق منها من النصوص الرسمية المرفوعة. وتشرح ISO 10009:2024 تحليل لماذا الخمس في البند 14.4؛ " + G_AR + "\","),
               ("checked against the uploaded official texts.\"", "checked against the uploaded official texts. ISO 10009:2024 reviews five whys analysis in 14.4. " + G_EN + "\"")],
 "capa": [("متحقق منها من النصوص الرسمية المرفوعة.\",", "متحقق منها من النصوص الرسمية المرفوعة. وتشرح ISO 10009:2024 تحليل السبب الجذري في البند 14.1، وتذكر «مخططات 8D وA3» في 14.7؛ " + G_AR + "\","),
          ("checked against the uploaded official texts.\"", "checked against the uploaded official texts. ISO 10009:2024 reviews root cause analysis in 14.1 and names “8D and A3 charts” in 14.7. " + G_EN + "\"")],
}
for f, edits in EDITS.items():
    p = os.path.join(ROOT, "modules", f + ".html"); s = open(p, encoding="utf-8").read()
    i = s.find('<script id="cia-explain-data"'); j = s.find("</script>", i); b = s[i:j]
    if "ISO 10009:2024" in b: continue
    for a, c in edits:
        assert b.count(a) == 1, (f, a[:40], b.count(a)); b = b.replace(a, c)
    open(p, "w", encoding="utf-8").write(s[:i] + b + s[j:]); print(f + ".html: kit names its ISO 10009:2024 subclause")
