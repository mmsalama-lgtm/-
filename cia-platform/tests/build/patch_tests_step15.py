"""Step 15 (2026-10-22): earlier suites follow this step's changes (run once; anchors must match exactly once).
- a3 / dmaic: "PDCA/CAPA/RCA… unchanged in this step" now checks the tools' own code: the shared blocks every tool carries since step 15
  (the organization kit; in CAPA the read-only readers registry and its link panel) name every tool's key and are left out of that check.
- swot: the news check looks for the SWOT item anywhere in NEWS (newer items came first since step 13).
- hub home: 20–40 screenshots (the Guides centre of step 14.1 added six); assets/cia-labels.json is an allowed new asset (labels, not a logo);
  the request forms are compared with the author's name written one way (step 15 writes "مدثر سلامه" in the English texts too).
- pdca_engine_regress / rca capa_regress: the explanation tabs of PDCA and CAPA now name ISO 10009:2024 (Part C); other tabs stay identical.
- run_all.sh: the ISO 10009 before/after checks of the PESTLE and Stakeholder steps run against the package of their step only."""
import os, re
T = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
def rep(p, a, b):
    p = os.path.join(T, p); s = open(p, encoding="utf-8").read()
    if b in s: return
    assert s.count(a) == 1, (p, a[:60], s.count(a)); open(p, "w", encoding="utf-8").write(s.replace(a, b))
OWN = '''def own(s):
    """the tool's own code: without the shared blocks of step 15 (organization kit, readers, link panels)"""
    for i in ("cia-org-js", "cia-readers-js", "cia-linkui-js", "cia-links-cfg"):
        a = s.find('<script id="%s"' % i)
        if a >= 0: s = s[:a] + s[s.find("</script>", a) + 9:]
    return s
'''
rep("a3/test_a3.py", 'check("PDCA and CAPA unchanged in this step (no A3 reference)", "cia-a3" not in src["pdca"] and "cia-a3" not in src["capa"])',
    OWN + 'check("PDCA and CAPA unchanged in this step (no A3 reference)", "cia-a3" not in own(src["pdca"]) and "cia-a3" not in own(src["capa"]))')
rep("dmaic/test_dmaic.py", 'check("RCA, PDCA and CAPA unchanged in this step (no DMAIC reference)", all("cia-dmaic" not in src[f] for f in ("rca", "pdca", "capa", "pareto", "fishbone", "five-whys")))',
    OWN + 'check("RCA, PDCA and CAPA unchanged in this step (no DMAIC reference)", all("cia-dmaic" not in own(src[f]) for f in ("rca", "pdca", "capa", "pareto", "fishbone", "five-whys")))')
rep("swot/test_swot.py", 'and pg.evaluate("NEWS[1].k") == "swot" and', 'and pg.evaluate("NEWS.some(n=>n.k===\'swot\')") and')
rep("hub/test_home_advisor.py", '20 <= len(shots) <= 30 and', '20 <= len(shots) <= 40 and')
rep("hub/test_home_advisor.py", r'all(re.match(r"assets/(shots/[\w-]+-(ar|en)\.webp|og-home\.jpg)$", f) for f in new_assets)', r'all(re.match(r"assets/(shots/[\w-]+-(ar|en)\.webp|og-home\.jpg|cia-labels\.json)$", f) for f in new_assets)')
rep("hub/test_home_advisor.py", 'R.check("request forms unchanged (fields, options, recipients, texts)", forms_new == forms_old)',
    'R.check("request forms unchanged (fields, options, recipients, texts; the author name written as مدثر سلامه)", forms_new == forms_old.replace("Modather Salama", "مدثر سلامه"))')
rep("platform/run_all.sh", 'python3 ../stakeholders/iso10009_regress.py > "results/iso10009-stakeholders-regress-run1.log" 2>&1',
    '# python3 ../stakeholders/iso10009_regress.py   (belongs to the Stakeholder step: run it against the PESTLE package)')
rep("platform/run_all.sh", 'python3 ../pestle/iso10009_regress.py > "results/iso10009-pestle-regress-run1.log" 2>&1',
    '# python3 ../pestle/iso10009_regress.py   (belongs to the PESTLE step: run it against the SWOT package)')
# PDCA's and CAPA's kits gained the ISO 10009 line (Part C): text may differ on their explanation tabs only
rep("capa/pdca_engine_regress.py", '''        check(f"{k} {part} identical", a == c, "" if a == c else (str(a)[:150] + " | " + str(c)[:150]))''',
    '''        if part == "text" and isinstance(a, dict) and isinstance(c, dict):   # step 15: the explanation tabs carry the ISO 10009 line (Part C)
            a = {t: v for t, v in a.items() if not t.startswith("explain")}; c = {t: v for t, v in c.items() if not t.startswith("explain")}
        check(f"{k} {part} identical", a == c, "" if a == c else (str(a)[:150] + " | " + str(c)[:150]))''')
rep("rca/capa_regress.py", '''    for k in old["tabs"]:
        if old["tabs"][k] != new["tabs"][k]:''', '''    for k in old["tabs"]:
        if old["tabs"][k] != new["tabs"][k] and ":explain-" not in k:   # step 15: CAPA's kit names its ISO 10009 subclauses (Part C)''')
print("earlier suites follow step 15")
