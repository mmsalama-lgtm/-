"""Step 10.1 (2026-10-16, full explanation of ISO 10009 in modules/iso10009.html): the hub (index.html) points to the new clause guide.
    python3 tests/build/patch_hub_10009_explain.py index.html
Run after patch_hub_lessons.py (and demo_lessons.py). Changes, every anchor matching once:
  1. the knowledge topic "ISO 10009: choosing the right quality tool" is rewritten and gets a second link, to the clause guide
     (guide2:{k:"iso10009",a:"explain-cl"}); the knowledge list renders an optional guide2 link after the first one;
  2. TOOLINFO.iso10009: brief, gain and time describe the full cards, Annexes A–C, learning paths and self-check (the number of
     self-assessment questions stays 16, the start tab stays the tool navigator);
  3. a NEWS item.
Nothing else changes: counts, the qtAd adapter, DEMO_RES, Advisor rules and the snapshots stay as they are."""
import sys, os

HERE = os.path.dirname(os.path.abspath(__file__))
path = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, "..", "..", "index.html")
s = open(path, encoding="utf-8").read()
if 'guide2:{k:"iso10009",a:"explain-cl"' in s:
    print("ISO 10009 clause guide already linked; nothing to do"); sys.exit(0)


def rep(old, new):
    global s
    n = s.count(old)
    assert n == 1, (n, old[:100])
    s = s.replace(old, new)


# 1a. knowledge list: optional second guide link
rep('''data-anchor="${k.guide.a}">${esc(KGUIDE[L])} ${EXT}</a>`:""}</div></details>`''',
    '''data-anchor="${k.guide.a}">${esc(KGUIDE[L])} ${EXT}</a>`:""}${k.guide2&&URLS[k.guide2.k]?` <a class="kguide" href="${URLS[k.guide2.k]}#${k.guide2.a}" data-mod="${k.guide2.k}" data-anchor="${k.guide2.a}">${esc(k.guide2.l[L])} ${EXT}</a>`:""}</div></details>`''')
# 1b. the topic
i = s.find('  {en:["ISO 10009: choosing the right quality tool"'); j = s.find('guide:{k:"iso10009",a:"explain-std"}},', i)
assert i > 0 and j > i and s.count('  {en:["ISO 10009: choosing the right quality tool"') == 1
end = j + len('guide:{k:"iso10009",a:"explain-std"}},')
s = s[:i] + '''  {en:["ISO 10009: choosing the right quality tool","ISO 10009:2024 is guidance on quality tools and their application, not a certifiable standard; NOTE 3 of Annex A.9.1 of ISO 9001:2026 points to it. Clauses 1 to 4 give the four aims of a tool (characterize a process, help solve a problem, highlight improvement, improve effectiveness) and how the tools are arranged. Clauses 5 to 16 review 53 tools in approximately the order of ISO 9001, from SWOT and SIPOC to FMEA, Pareto, fishbone and Six Sigma, each with what it is, how it is used, its benefits and points to note, and end with other relevant tools named only. Annex A places the tools on the PDCA cycle in three contexts, Annex B shows one-page storyboards, and Annex C gives what each tool demands: team or individual, data, capability and effort. The guide on the platform gives every tool a full card: when to use it and when not, the steps, the record, common mistakes, what an auditor asks to see and where to apply it. Choose a tool for its aim and phase, not by habit, and train people before the ••• tools."],
   ar:["ISO 10009: اختيار أداة الجودة المناسبة","ISO 10009:2024 إرشاد لأدوات الجودة وتطبيقها، وليست مواصفة إشهاد؛ وتحيل إليها الملاحظة 3 في الملحق A.9.1 من ISO 9001:2026. تبين البنود 1 إلى 4 أغراض الأداة الأربعة (وصف عملية، وتيسير حل مشكلة، وإبراز مجالات التحسين، وتحسين الفعالية) وكيف رُتبت الأدوات. وتراجع البنود 5 إلى 16 ثلاثاً وخمسين أداة بالترتيب التقريبي لـ ISO 9001، من SWOT وSIPOC إلى FMEA وباريتو وعظمة السمكة وSix Sigma، ولكل أداة: ما هي، وكيف تُستخدم، وفوائدها، ونقاط تُراعى، ويختم كل بند بأدوات أخرى ذات صلة بالاسم فقط. ويضع الملحق A الأدوات على دورة PDCA في ثلاثة سياقات، ويعرض الملحق B لوحات قصة في صفحة واحدة، ويبين الملحق C ما تحتاجه كل أداة: فريق أم فرد، والبيانات، والكفاءة، والجهد. ويعطي الدليل في المنصة كل أداة بطاقة كاملة: متى تُستخدم ومتى لا، والخطوات، والسجل، والأخطاء الشائعة، وما يطلبه المدقق، وأين تطبقها. اختر الأداة بغرضها ومرحلتها لا بالعادة، ودرّب الأفراد قبل أدوات •••."], rel:"ISO 10009:2024 · ISO 9001 §A.9.1 · §7.2", guide:{k:"iso10009",a:"explain-std"}, guide2:{k:"iso10009",a:"explain-cl",l:{en:"Open the tool cards",ar:"افتح بطاقات الأدوات"}}},''' + s[end:]
# 2. TOOLINFO
rep('''  {en:"Explains ISO 10009:2024 and its 53 quality tools, suggests the right tool for your aim, PDCA phase and resources, opens it where it lives on the platform, and tells the whole improvement as a one-page storyboard linked to the toolbox records.", ar:"تشرح ISO 10009:2024 وأدواتها الـ 53، وتقترح الأداة المناسبة لغرضك ومرحلتك ومواردك، وتفتحها حيث توجد في المنصة، وتروي التحسين كاملاً في لوحة قصة من صفحة واحدة مرتبطة بسجلات صندوق الأدوات."},''',
    '''  {en:"Explains ISO 10009:2024 clause by clause with a full card for each of its 53 quality tools (when to use it and when not, steps, record, mistakes, what an auditor asks to see), suggests the right tool for your aim, PDCA phase and resources, opens it where it lives on the platform, and tells the whole improvement as a one-page storyboard linked to the toolbox records.", ar:"تشرح ISO 10009:2024 بنداً بنداً ببطاقة كاملة لكل أداة من أدواتها الـ 53 (متى تُستخدم ومتى لا، والخطوات، والسجل، والأخطاء، وما يطلبه المدقق)، وتقترح الأداة المناسبة لغرضك ومرحلتك ومواردك، وتفتحها حيث توجد في المنصة، وتروي التحسين كاملاً في لوحة قصة من صفحة واحدة مرتبطة بسجلات صندوق الأدوات."},''')
rep('''  {en:"A standard guide, a clause guide of the 53 tools, a 16-question self-assessment,''', '''  {en:"A standard guide with a reading path, a clause guide with a full card for each of the 53 tools, Annex A as a PDCA matrix, Annex C as a sortable table with a competence-matrix export, five learning paths and 36 self-check questions, a 16-question self-assessment,''')
rep('''ar:"دليل للمواصفة، ودليل للأدوات الـ 53، وتقييم ذاتي من 16 سؤالاً،''', '''ar:"دليل للمواصفة بمسار قراءة، ودليل للبنود ببطاقة كاملة لكل أداة من الـ 53، والملحق A مصفوفة على PDCA، والملحق C جدولاً قابلاً للترتيب مع تصدير مصفوفة الكفاءة، وخمسة مسارات تعلم و36 سؤالاً للتحقق الذاتي، وتقييم ذاتي من 16 سؤالاً،''')
rep('''  {en:"15 minutes for the self-assessment; 10 minutes to pick a tool; 1 hour to set up a first storyboard", ar:"15 دقيقة للتقييم الذاتي، و10 دقائق لاختيار أداة، وساعة لإعداد أول لوحة قصة"}),''',
    '''  {en:"15 minutes for the self-assessment; 10 minutes to pick a tool and read its card; 20 minutes per learning path; 1 hour to set up a first storyboard", ar:"15 دقيقة للتقييم الذاتي، و10 دقائق لاختيار أداة وقراءة بطاقتها، و20 دقيقة لكل مسار تعلم، وساعة لإعداد أول لوحة قصة"}),''')
# 3. NEWS (after the Lessons Learned item, which stays first)
rep('''  {k:"fmea", d:"2026-10-16", t:{en:"New: FMEA''', '''  {k:"iso10009", d:"2026-10-16", t:{en:"Updated: the ISO 10009 guide now explains the standard in full — a card for each of the 53 tools with steps, mistakes and what an auditor asks to see, Annex A as a PDCA matrix, Annex C with a competence-matrix export, five learning paths and a self-check for each clause.", ar:"تحديث: دليل ISO 10009 يشرح المواصفة كاملة — بطاقة لكل أداة من الـ 53 بخطواتها وأخطائها الشائعة وما يطلبه المدقق، والملحق A مصفوفة على PDCA، والملحق C مع تصدير مصفوفة الكفاءة، وخمسة مسارات تعلم، واختبار قصير لكل بند."}},
  {k:"fmea", d:"2026-10-16", t:{en:"New: FMEA''')
open(path, "w", encoding="utf-8").write(s)
print("hub: ISO 10009 clause guide linked")
