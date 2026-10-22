"""Builds modules/pestle.html (step 2026-10-17, PESTLE) from modules/swot.html and the sources in this folder, the same way
build_swot.py builds swot.html. Run from the platform folder AFTER build_swot.py:   python3 tests/build/build_pestle.py
What is copied unchanged from SWOT: the head (with this tool's description and title), the PDCA base style sheet and host styles, the
home-button block with its in-hub link script, and the guided-tour layer (only its CFG line changes).
Styles: PDCA base and host, the toolbox additions (capa_host.css … swot_host.css) and this tool's (pestle_host.css). The Explain Kit blocks
are copied from templates/explain-kit-template.html. The shared toolbox engine (engine.js) is inserted at the top of the host script,
byte-identical to the copies in the other toolbox tools.
Read-only parts copied at build time, so the tool reads the other tools with their own rules:
  - from modules/strategy-performance.html: the Studio's value reader (TKV, as ssTKV) and its category lists for PESTLE factors, effect and
    timeframe (pestleF, pestleImp, tf, in SSO);
  - from tests/build/swot_host.js: the SWOT tool's own record repair, stage rule, item list, top items and display codes (wrapped in SWR), and
    its stage and quadrant names (as swst_* and swq_*)."""
import os, re, sys, subprocess

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
P = lambda *a: os.path.join(ROOT, *a)
src = open(P("modules", "swot.html"), encoding="utf-8").read()
strat = open(P("modules", "strategy-performance.html"), encoding="utf-8").read()
tpl = open(P("templates", "explain-kit-template.html"), encoding="utf-8").read()
ENGINE = open(os.path.join(HERE, "engine.js"), encoding="utf-8").read()
SWH = open(os.path.join(HERE, "swot_host.js"), encoding="utf-8").read()
assert ENGINE in src, "swot.html must carry the engine (run build_swot.py first)"


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


# ---- head: same as SWOT, with this tool's description and title ----
assert src.startswith("<!DOCTYPE html>") and src.count("<style>\n:root") == 1
head = src[:src.find("<style>\n:root")]
D_OLD = re.search(r'<meta name="description" content="SWOT analysis that leads to decisions: [^"]*">', head).group(0)
T_OLD = "<title>SWOT | Continual Improvement Academy — مدثر سلامه</title>"
assert head.count(D_OLD) == 1 and head.count(T_OLD) == 1
head = head.replace(D_OLD, '<meta name="description" content="PESTLE analysis that leads to decisions: the scope, the level and the decision or plan it serves, a team of at least three roles with outside input, the six factors (political, economic, social, technological, legal, environmental; names adjustable, factors can be added) with specific items, each with its source, date, effect, significance, certainty and time horizon, a flag on generic and unsourced items, an explicit climate change decision, a ranking by significance × certainty, an outcome for every top item into SWOT, the risk register or the 6.1 plan, actions, and a review on a date and after major events. Computed stages, the board, the significance × certainty matrix, the time horizon and a chart of sources. A technique, not a requirement; serves ISO 9001:2026 clauses 4.1, 4.2, 6.1 and 9.3.2 and ISO 10009:2024 5.2. Continual Improvement Academy.">')
head = head.replace(T_OLD, "<title>PESTLE | Continual Improvement Academy — مدثر سلامه</title>")
base_css = between(src, "<style>\n:root", "</style>") + "</style>\n"
host_css = between(src, "<style>\n/* ===== PDCA tool — host styles", "</style>") + "</style>\n"
add_css = (css("capa_host.css", "capa-css") + css("why5_host.css", "why5-css") + css("fish_host.css", "fish-css") + css("pareto_host.css", "pareto-css") +
           css("rca_host.css", "rca-css") + css("a3_host.css", "a3-css") + css("dmaic_host.css", "dmaic-css") + css("fmea_host.css", "fmea-css") +
           css("lessons_host.css", "lessons-css") + css("swot_host.css", "swot-css") + css("pestle_host.css", "pestle-css"))
kit_css, kit_js = block(tpl, "style", "cia-explain-kit-css"), block(tpl, "script", "cia-explain-kit-js")
body = open(os.path.join(HERE, "pestle_body.html"), encoding="utf-8").read()
data_js = subprocess.run([sys.executable, os.path.join(HERE, "data_pestle.py")], capture_output=True, text=True, check=True).stdout
setup = '''<script id="cia-explain-setup">
/* Host adapter for the CIA Explain Kit v1.4 — PESTLE tool. The kit only reads these hooks; it never stores data through them.
   "Assess this" opens the tool's own question (IN1 … RV3) and highlights it; clauses applied directly in the PESTLE scans carry the
   pseudo id "x:tools" and show the "outside the assessment" note with a button to the scans. The language switch re-renders an open
   explain tab through applyLang (CIAEX.renderStandard / renderClauses). */
CIAEX.setup(function(){
 return {
  data:EXPLAIN_PESTLE,
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

# ---- the SWOT tool's wording: its stage names and quadrant names ----
PAIR = r'(?<![\w$])(%s):"((?:[^"\\]|\\.)*)"'


def pairs(t, want, ren):
    out, seen = [], set()
    for k, v in re.findall(PAIR % want, t):
        if k in seen:
            continue
        seen.add(k); out.append((ren(k), v))
    return out


def ui_halves(h):
    i = h.find("var UI={"); j = h.find("\n};", i); U = h[i:j]
    a, e = U.find("ar:{brand:"), U.find("\nen:{brand:"); assert 0 < a < e
    return U[a:e], U[e:]


SA_, SE_ = ui_halves(SWH)
SW = r'st_(?:draft|scoped|team|quads|ranked|options|actions|reviewed)'
SA, SE = pairs(SA_, SW, lambda k: "sw" + k), pairs(SE_, SW, lambda k: "sw" + k)
assert [k for k, _ in SA] == [k for k, _ in SE] and len(SA) == 8, (SA, SE)
QW = r'q1_[swot]'
QA, QE = pairs(SA_, QW, lambda k: "swq_" + k[3:]), pairs(SE_, QW, lambda k: "swq_" + k[3:])
assert [k for k, _ in QA] == [k for k, _ in QE] and len(QA) == 4, (QA, QE)
ALLA, ALLE = SA + QA, SE + QE
tbx_ui = ("(function(){ var A={" + ",".join('%s:"%s"' % kv for kv in ALLA) + "}, E={" + ",".join('%s:"%s"' % kv for kv in ALLE) + "};\n"
          " for(var k in A){ if(UI.ar[k]===undefined) UI.ar[k]=A[k]; if(UI.en[k]===undefined) UI.en[k]=E[k]; } })();")
# ---- the Strategy & Performance Studio's own value reader and category lists ----
tkv = re.search(r'const TKV=v=>[^\n;]*;', strat).group(0)
assert strat.count(tkv) == 1 and tkv.startswith("const TKV=v=>v==null")
lists = []
for name in ("pestleF", "pestleImp", "tf"):
    m = re.search(r'(?<![\w$])' + name + r':(\[\[.*?\)\]\])', strat)
    assert m and strat.count(name + ":[[") == 1, name
    lists.append(name + ":" + m.group(1))
ss = ("var ssTKV=" + tkv[len("const TKV="):] + "\n"
      "var SSO=(function(){ function B(a,e){ return {ar:a,en:e}; } return {" + ",\n ".join(lists) + "}; })();")
# ---- the SWOT tool's own record repair, stage rule, items, top items and codes, from the SWOT host script ----
shelpers = between(SWH, "function esc(s){ return TBX.esc(s); }", "\n/* ---------- records ---------- */\nfunction blankTm")
sconsts = between(SWH, "var STAGES=[\"draft\",\"scoped\",\"team\",\"quads\"", "\nvar DB=load();")
srules = between(SWH, "/* ---------- records ---------- */\nfunction blankTm", "function flagsOf(r)")
assert "function stageOf(r)" in srules and "function fixRec(r)" in srules and "function tops(r)" in srules and "function codes(r)" in srules
swr = ("var SWR=(function(){\n function t(k){ return k; }\n" + shelpers + "\n" + sconsts + "\n" + srules +
       " return {fix:fixRec,stage:stageOf,items:items,tops:tops,codes:codes};\n})();")

host = open(os.path.join(HERE, "pestle_host.js"), encoding="utf-8").read()
example = open(os.path.join(HERE, "pestle_example.js"), encoding="utf-8").read().rstrip("\n")
logo = re.search(r'var LOGO="(data:image/[^"]+)";', src).group(1)
for mk in ('var LOGO="__LOGO__";', "\n__EXAMPLE__\n", "/*__TBX_UI__*/", "/*__SS_RULES__*/", "/*__SW_RULES__*/"):
    assert host.count(mk) == 1, mk
host = (host.replace('var LOGO="__LOGO__";', 'var LOGO="' + logo + '";').replace("\n__EXAMPLE__\n", "\n" + example + "\n")
        .replace("/*__TBX_UI__*/", tbx_ui).replace("/*__SS_RULES__*/", ss).replace("/*__SW_RULES__*/", swr))
cut = host.find("*/\n") + 3          # the engine goes right after the schema comment, as in the other toolbox tools
host = "<script>\n" + host[:cut] + ENGINE + host[cut:] + "</script>\n"
home_btn = between(src, "<style>\n#ciaHomeBtn", "\n<!-- CIA guided tour") + "\n"
tour_note = "<!-- CIA guided tour and example-load confirmation (added layer; reads the page only, never writes tool data) -->\n"
tour_css, tour_js = block(src, "style", "cia-tour-css"), block(src, "script", "cia-tour-js")
CFG_OLD = 'var CFG={"file": "swot", "hasEx": true, "guard": {"pfEx": "all"}};'
assert tour_js.count(CFG_OLD) == 1
tour_js = tour_js.replace(CFG_OLD, 'var CFG={"file": "pestle", "hasEx": true, "guard": {"pfEx": "all"}};')

out = (head + base_css + host_css + add_css + kit_css + "\n" + body + kit_js + "\n" +
       '<script id="cia-explain-data">\n' + data_js + "</script>\n" + setup + host + home_btn + tour_note +
       tour_css + "\n" + tour_js + "\n</body>\n</html>\n")
open(P("modules", "pestle.html"), "w", encoding="utf-8").write(out)
print("modules/pestle.html:", len(out.encode()), "bytes")
