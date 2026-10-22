"""Builds modules/capa.html (step 2026-10-11) from modules/pdca.html and the sources in this folder.
Run from the platform folder AFTER patch_pdca_engine.py:   python3 tests/build/build_capa.py
What is copied unchanged from PDCA: the base style sheet and host styles, the home-button block with its in-hub link script,
and the guided-tour layer (only its CFG line changes). The Explain Kit blocks are copied from templates/explain-kit-template.html.
The shared toolbox engine (engine.js) is inserted at the top of the host script, byte-identical to the copy in pdca.html."""
import os, re, sys, subprocess, json

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
P = lambda *a: os.path.join(ROOT, *a)
pd = open(P("modules", "pdca.html"), encoding="utf-8").read()
tpl = open(P("templates", "explain-kit-template.html"), encoding="utf-8").read()
ENGINE = open(os.path.join(HERE, "engine.js"), encoding="utf-8").read()
assert ENGINE in pd, "run patch_pdca_engine.py first: pdca.html must carry the engine"


def block(s, tag, id_):
    i = s.find('<%s id="%s">' % (tag, id_)); assert i >= 0 and s.count('<%s id="%s">' % (tag, id_)) == 1, id_
    j = s.find('</%s>' % tag, i)
    return s[i:j + len(tag) + 3]


def between(s, a, b):
    assert s.count(a) == 1, a[:60]
    i = s.find(a); j = s.find(b, i); assert j > i, b[:60]
    return s[i:j]


# ---- head: same as PDCA, with CAPA's description and title ----
assert pd.startswith("<!DOCTYPE html>") and pd.count("<style>\n:root") == 1
head = pd[:pd.find("<style>\n:root")]
head = head.replace('<meta name="description" content="PDCA: Plan-Do-Check-Act improvement tool — learn, self-assess, record cycles, audit and report. Continual Improvement Academy.">',
                    '<meta name="description" content="CAPA: corrective action tool built on ISO 9001:2026 clause 10.2 — learn, self-assess, record nonconformities from reaction to verified closure, audit and report. Continual Improvement Academy.">')
head = head.replace("<title>PDCA | Continual Improvement Academy — مدثر سلامه</title>", "<title>CAPA | Continual Improvement Academy — مدثر سلامه</title>")
assert "CAPA:" in head and "<title>CAPA" in head
base_css = between(pd, "<style>\n:root", "</style>") + "</style>\n"
host_css = between(pd, "<style>\n/* ===== PDCA tool — host styles", "</style>") + "</style>\n"
capa_css = '<style id="capa-css">' + open(os.path.join(HERE, "capa_host.css"), encoding="utf-8").read() + "</style>\n"
kit_css, kit_js = block(tpl, "style", "cia-explain-kit-css"), block(tpl, "script", "cia-explain-kit-js")
body = open(os.path.join(HERE, "capa_body.html"), encoding="utf-8").read()
data_js = subprocess.run([sys.executable, os.path.join(HERE, "data_capa.py")], capture_output=True, text=True, check=True).stdout
setup = '''<script id="cia-explain-setup">
/* Host adapter for the CIA Explain Kit v1.4 — CAPA tool. The kit only reads these hooks; it never stores data through them.
   "Assess this" opens the tool's own question (RE1 … LN2) and highlights it; clauses applied directly in the record carry the
   pseudo id "x:tools" and show the "outside the assessment" note with a button to the CAPA record. */
CIAEX.setup(function(){
 return {
  data:EXPLAIN_CAPA,
  lang:function(){ return L; },
  go:function(t){ go(t); },
  switchLang:function(){ switchLang(); },
  secHead:function(t,s){ return "<h2>"+t+"</h2>"+(s?"<p>"+s+"</p>":""); },
  mount:{standard:"ex-std-box",clauses:"ex-cl-box"},
  enrich:function(it){ return it; },
  edges:function(){ return []; },
  assess:{root:"asList",item:".ex-aq[data-id]",head:"[data-ex-head]",mark:function(){},
   idOf:function(el){ return el.getAttribute("data-id")||""; },
   can:function(q){ return AQ.some(function(x){ return x[0]===q; }); },
   ctx:function(q){ return q; },
   open:function(q){ go("assess"); return q; },
   offGo:"tools"}
 };
});
</script>
'''
host = open(os.path.join(HERE, "capa_host.js"), encoding="utf-8").read()
logo = re.search(r'var LOGO="(data:image/[^"]+)";', pd).group(1)
assert host.count('var LOGO="__LOGO__";') == 1
host = host.replace('var LOGO="__LOGO__";', 'var LOGO="' + logo + '";')
cut = host.find("*/\n") + 3          # the engine goes right after the schema comment, as in PDCA
host = "<script>\n" + host[:cut] + ENGINE + host[cut:] + "</script>\n"
home_btn = between(pd, "<style>\n#ciaHomeBtn", "\n<!-- CIA guided tour") + "\n"
tour_note = "<!-- CIA guided tour and example-load confirmation (added layer; reads the page only, never writes tool data) -->\n"
tour_css, tour_js = block(pd, "style", "cia-tour-css"), block(pd, "script", "cia-tour-js")
CFG_OLD = 'var CFG={"file": "pdca", "hasEx": true, "guard": {"pfEx": "all"}};'
assert tour_js.count(CFG_OLD) == 1
tour_js = tour_js.replace(CFG_OLD, 'var CFG={"file": "capa", "hasEx": true, "guard": {"pfEx": "all"}};')

out = (head + base_css + host_css + capa_css + kit_css + "\n" + body + kit_js + "\n" +
       '<script id="cia-explain-data">\n' + data_js + "</script>\n" + setup + host + home_btn + tour_note +
       tour_css + "\n" + tour_js + "\n</body>\n</html>\n")
open(P("modules", "capa.html"), "w", encoding="utf-8").write(out)
print("modules/capa.html:", len(out.encode()), "bytes")
