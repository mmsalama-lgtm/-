"""Builds modules/fishbone.html (step 2026-10-11, Fishbone) from modules/five-whys.html and the sources in this folder, the same
way build_why5.py builds five-whys.html. Run from the platform folder AFTER build_why5.py:   python3 tests/build/build_fish.py
What is copied unchanged from 5 Whys: the head (with this tool's description and title), the PDCA base style sheet and host
styles, the home-button block with its in-hub link script, and the guided-tour layer (only its CFG line changes).
Styles: PDCA base and host, CAPA's additions (capa_host.css), the 5 Whys additions (why5_host.css) and this tool's (fish_host.css).
The Explain Kit blocks are copied from templates/explain-kit-template.html. The shared toolbox engine (engine.js) is inserted at
the top of the host script, byte-identical to the copies in pdca.html, capa.html and five-whys.html."""
import os, re, sys, subprocess

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
P = lambda *a: os.path.join(ROOT, *a)
w5 = open(P("modules", "five-whys.html"), encoding="utf-8").read()
tpl = open(P("templates", "explain-kit-template.html"), encoding="utf-8").read()
ENGINE = open(os.path.join(HERE, "engine.js"), encoding="utf-8").read()
assert ENGINE in w5, "five-whys.html must carry the engine (run build_why5.py first)"


def block(s, tag, id_):
    i = s.find('<%s id="%s">' % (tag, id_)); assert i >= 0 and s.count('<%s id="%s">' % (tag, id_)) == 1, id_
    j = s.find('</%s>' % tag, i)
    return s[i:j + len(tag) + 3]


def between(s, a, b):
    assert s.count(a) == 1, a[:60]
    i = s.find(a); j = s.find(b, i); assert j > i, b[:60]
    return s[i:j]


# ---- head: same as 5 Whys, with this tool's description and title ----
assert w5.startswith("<!DOCTYPE html>") and w5.count("<style>\n:root") == 1
head = w5[:w5.find("<style>\n:root")]
D_OLD = '<meta name="description" content="5 Whys: root cause analysis tool serving ISO 9001:2026 clause 10.2.1 b) — define the problem from facts, ask why with evidence, test the root cause, link it to CAPA, audit and report. Continual Improvement Academy.">'
T_OLD = "<title>5 Whys | Continual Improvement Academy — مدثر سلامه</title>"
assert head.count(D_OLD) == 1 and head.count(T_OLD) == 1
head = head.replace(D_OLD, '<meta name="description" content="Fishbone (Ishikawa): cause and effect analysis tool serving ISO 9001:2026 clause 10.2.1 b) — write the effect from facts, map causes on categories with evidence, rule causes out, verify the likely few with 5 Whys or data, link it to CAPA, audit and report. Continual Improvement Academy.">')
head = head.replace(T_OLD, "<title>Fishbone | Continual Improvement Academy — مدثر سلامه</title>")
base_css = between(w5, "<style>\n:root", "</style>") + "</style>\n"
host_css = between(w5, "<style>\n/* ===== PDCA tool — host styles", "</style>") + "</style>\n"
add_css = ('<style id="capa-css">' + open(os.path.join(HERE, "capa_host.css"), encoding="utf-8").read() + "</style>\n" +
           '<style id="why5-css">' + open(os.path.join(HERE, "why5_host.css"), encoding="utf-8").read() + "</style>\n" +
           '<style id="fish-css">' + open(os.path.join(HERE, "fish_host.css"), encoding="utf-8").read() + "</style>\n")
kit_css, kit_js = block(tpl, "style", "cia-explain-kit-css"), block(tpl, "script", "cia-explain-kit-js")
body = open(os.path.join(HERE, "fish_body.html"), encoding="utf-8").read()
data_js = subprocess.run([sys.executable, os.path.join(HERE, "data_fish.py")], capture_output=True, text=True, check=True).stdout
setup = '''<script id="cia-explain-setup">
/* Host adapter for the CIA Explain Kit v1.4 — Fishbone tool. The kit only reads these hooks; it never stores data through them.
   "Assess this" opens the tool's own question (EF1 … LK2) and highlights it; clauses applied directly in the analysis carry the
   pseudo id "x:tools" and show the "outside the assessment" note with a button to the Fishbone analysis. The language switch
   re-renders an open explain tab through applyLang (CIAEX.renderStandard / renderClauses). */
CIAEX.setup(function(){
 return {
  data:EXPLAIN_FISH,
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
host = open(os.path.join(HERE, "fish_host.js"), encoding="utf-8").read()
example = open(os.path.join(HERE, "fish_example.js"), encoding="utf-8").read().rstrip("\n")
logo = re.search(r'var LOGO="(data:image/[^"]+)";', w5).group(1)
assert host.count('var LOGO="__LOGO__";') == 1 and host.count("\n__EXAMPLE__\n") == 1
host = host.replace('var LOGO="__LOGO__";', 'var LOGO="' + logo + '";').replace("\n__EXAMPLE__\n", "\n" + example + "\n")
cut = host.find("*/\n") + 3          # the engine goes right after the schema comment, as in PDCA, CAPA and 5 Whys
host = "<script>\n" + host[:cut] + ENGINE + host[cut:] + "</script>\n"
home_btn = between(w5, "<style>\n#ciaHomeBtn", "\n<!-- CIA guided tour") + "\n"
tour_note = "<!-- CIA guided tour and example-load confirmation (added layer; reads the page only, never writes tool data) -->\n"
tour_css, tour_js = block(w5, "style", "cia-tour-css"), block(w5, "script", "cia-tour-js")
CFG_OLD = 'var CFG={"file": "five-whys", "hasEx": true, "guard": {"pfEx": "all"}};'
assert tour_js.count(CFG_OLD) == 1
tour_js = tour_js.replace(CFG_OLD, 'var CFG={"file": "fishbone", "hasEx": true, "guard": {"pfEx": "all"}};')

out = (head + base_css + host_css + add_css + kit_css + "\n" + body + kit_js + "\n" +
       '<script id="cia-explain-data">\n' + data_js + "</script>\n" + setup + host + home_btn + tour_note +
       tour_css + "\n" + tour_js + "\n</body>\n</html>\n")
open(P("modules", "fishbone.html"), "w", encoding="utf-8").write(out)
print("modules/fishbone.html:", len(out.encode()), "bytes")
