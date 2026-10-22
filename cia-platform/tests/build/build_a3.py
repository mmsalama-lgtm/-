"""Builds modules/a3.html (step 2026-10-16, A3 problem solving) from modules/rca.html and the sources in this folder, the same
way build_rca.py builds rca.html. Run from the platform folder AFTER build_rca.py (patch_rca_a3.py may run before or after: it only
touches RCA's host script, which is not copied here):   python3 tests/build/build_a3.py
What is copied unchanged from RCA: the head (with this tool's description and title), the PDCA base style sheet and host
styles, the home-button block with its in-hub link script, and the guided-tour layer (only its CFG line changes).
Styles: PDCA base and host, CAPA's, 5 Whys', Fishbone's, Pareto's and RCA's additions (capa_host.css, why5_host.css, fish_host.css,
pareto_host.css, rca_host.css) and this tool's (a3_host.css). The Explain Kit blocks are copied from templates/explain-kit-template.html.
The shared toolbox engine (engine.js) is inserted at the top of the host script, byte-identical to the copies in pdca.html, capa.html,
five-whys.html, fishbone.html, pareto.html and rca.html."""
import os, re, sys, subprocess

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
P = lambda *a: os.path.join(ROOT, *a)
src = open(P("modules", "rca.html"), encoding="utf-8").read()
tpl = open(P("templates", "explain-kit-template.html"), encoding="utf-8").read()
ENGINE = open(os.path.join(HERE, "engine.js"), encoding="utf-8").read()
assert ENGINE in src, "rca.html must carry the engine (run build_rca.py first)"


def block(s, tag, id_):
    i = s.find('<%s id="%s">' % (tag, id_)); assert i >= 0 and s.count('<%s id="%s">' % (tag, id_)) == 1, id_
    j = s.find('</%s>' % tag, i)
    return s[i:j + len(tag) + 3]


def between(s, a, b):
    assert s.count(a) == 1, a[:60]
    i = s.find(a); j = s.find(b, i); assert j > i, b[:60]
    return s[i:j]


def css(name, id_):
    return '<style id="%s">' % id_ + open(os.path.join(HERE, name), encoding="utf-8").read() + "</style>\n"


# ---- head: same as RCA, with this tool's description and title ----
assert src.startswith("<!DOCTYPE html>") and src.count("<style>\n:root") == 1
head = src[:src.find("<style>\n:root")]
D_OLD = re.search(r'<meta name="description" content="Root cause analysis: [^"]*">', head).group(0)
T_OLD = "<title>RCA | Continual Improvement Academy — مدثر سلامه</title>"
assert head.count(D_OLD) == 1 and head.count(T_OLD) == 1
head = head.replace(D_OLD, '<meta name="description" content="A3 problem solving: the whole problem-solving story on one page, on the PDCA cycle described in ISO 9001:2026 introduction 0.3.2 — background, current condition from facts, a measurable goal written before the causes, proved root causes from RCA, Fishbone or 5 Whys, countermeasures tied to them and tested, the plan, the follow-up against the goal, coach reviews, audit and report. Continual Improvement Academy.">')
head = head.replace(T_OLD, "<title>A3 | Continual Improvement Academy — مدثر سلامه</title>")
base_css = between(src, "<style>\n:root", "</style>") + "</style>\n"
host_css = between(src, "<style>\n/* ===== PDCA tool — host styles", "</style>") + "</style>\n"
add_css = (css("capa_host.css", "capa-css") + css("why5_host.css", "why5-css") + css("fish_host.css", "fish-css") +
           css("pareto_host.css", "pareto-css") + css("rca_host.css", "rca-css") + css("a3_host.css", "a3-css"))
kit_css, kit_js = block(tpl, "style", "cia-explain-kit-css"), block(tpl, "script", "cia-explain-kit-js")
body = open(os.path.join(HERE, "a3_body.html"), encoding="utf-8").read()
data_js = subprocess.run([sys.executable, os.path.join(HERE, "data_a3.py")], capture_output=True, text=True, check=True).stdout
setup = '''<script id="cia-explain-setup">
/* Host adapter for the CIA Explain Kit v1.4 — A3 tool. The kit only reads these hooks; it never stores data through them.
   "Assess this" opens the tool's own question (OW1 … CK3) and highlights it; clauses applied directly in the A3 sheet carry the
   pseudo id "x:tools" and show the "outside the assessment" note with a button to the A3 sheet. The language switch
   re-renders an open explain tab through applyLang (CIAEX.renderStandard / renderClauses). */
CIAEX.setup(function(){
 return {
  data:EXPLAIN_A3,
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
host = open(os.path.join(HERE, "a3_host.js"), encoding="utf-8").read()
example = open(os.path.join(HERE, "a3_example.js"), encoding="utf-8").read().rstrip("\n")
logo = re.search(r'var LOGO="(data:image/[^"]+)";', src).group(1)
assert host.count('var LOGO="__LOGO__";') == 1 and host.count("\n__EXAMPLE__\n") == 1
host = host.replace('var LOGO="__LOGO__";', 'var LOGO="' + logo + '";').replace("\n__EXAMPLE__\n", "\n" + example + "\n")
cut = host.find("*/\n") + 3          # the engine goes right after the schema comment, as in PDCA, CAPA, 5 Whys, Fishbone, Pareto and RCA
host = "<script>\n" + host[:cut] + ENGINE + host[cut:] + "</script>\n"
home_btn = between(src, "<style>\n#ciaHomeBtn", "\n<!-- CIA guided tour") + "\n"
tour_note = "<!-- CIA guided tour and example-load confirmation (added layer; reads the page only, never writes tool data) -->\n"
tour_css, tour_js = block(src, "style", "cia-tour-css"), block(src, "script", "cia-tour-js")
CFG_OLD = 'var CFG={"file": "rca", "hasEx": true, "guard": {"pfEx": "all"}};'
assert tour_js.count(CFG_OLD) == 1
tour_js = tour_js.replace(CFG_OLD, 'var CFG={"file": "a3", "hasEx": true, "guard": {"pfEx": "all"}};')

out = (head + base_css + host_css + add_css + kit_css + "\n" + body + kit_js + "\n" +
       '<script id="cia-explain-data">\n' + data_js + "</script>\n" + setup + host + home_btn + tour_note +
       tour_css + "\n" + tour_js + "\n</body>\n</html>\n")
open(P("modules", "a3.html"), "w", encoding="utf-8").write(out)
print("modules/a3.html:", len(out.encode()), "bytes")
