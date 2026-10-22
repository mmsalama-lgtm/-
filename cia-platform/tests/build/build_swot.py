"""Builds modules/swot.html (step 2026-10-17, SWOT) from modules/lessons.html and the sources in this folder, the same way
build_lessons.py builds lessons.html. Run from the platform folder AFTER build_lessons.py:   python3 tests/build/build_swot.py
What is copied unchanged from Lessons Learned: the head (with this tool's description and title), the PDCA base style sheet and host styles,
the home-button block with its in-hub link script, and the guided-tour layer (only its CFG line changes).
Styles: PDCA base and host, the toolbox additions (capa_host.css … lessons_host.css) and this tool's (swot_host.css). The Explain Kit blocks
are copied from templates/explain-kit-template.html. The shared toolbox engine (engine.js) is inserted at the top of the host script,
byte-identical to the copies in the other toolbox tools.
Read-only parts copied at build time, so the tool reads the other tools with their own rules:
  - from modules/strategy-performance.html: the Studio's value reader (TKV, as ssTKV), its reference parser (ids, as ssIds) and its category
    lists for SWOT, PESTLE and TOWS (swotCat, pestleF, pestleImp, towsQ, in SSO);
  - from tests/build/dmaic_host.js: Pareto's ranking and stage rule (paNum, paRank, paStage) and the wording they use (Pareto stage and unit
    names, preview lines);
  - from tests/build/fmea_host.js: FMEA's own record repair, stage rule, high-priority rows and action priority (wrapped in FMR) and FMEA's
    stage names (as fmst_*);
  - from tests/build/lessons_host.js: the Lessons Learned record repair and stage rule (wrapped in LLR) and its stage names (as llst_*)."""
import os, re, sys, subprocess

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
P = lambda *a: os.path.join(ROOT, *a)
src = open(P("modules", "lessons.html"), encoding="utf-8").read()
strat = open(P("modules", "strategy-performance.html"), encoding="utf-8").read()
tpl = open(P("templates", "explain-kit-template.html"), encoding="utf-8").read()
ENGINE = open(os.path.join(HERE, "engine.js"), encoding="utf-8").read()
DMH = open(os.path.join(HERE, "dmaic_host.js"), encoding="utf-8").read()
FMH = open(os.path.join(HERE, "fmea_host.js"), encoding="utf-8").read()
LLH = open(os.path.join(HERE, "lessons_host.js"), encoding="utf-8").read()
assert ENGINE in src, "lessons.html must carry the engine (run build_lessons.py first)"


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


# ---- head: same as Lessons Learned, with this tool's description and title ----
assert src.startswith("<!DOCTYPE html>") and src.count("<style>\n:root") == 1
head = src[:src.find("<style>\n:root")]
D_OLD = re.search(r'<meta name="description" content="Lessons learned register: [^"]*">', head).group(0)
T_OLD = "<title>Lessons Learned | Continual Improvement Academy — مدثر سلامه</title>"
assert head.count(D_OLD) == 1 and head.count(T_OLD) == 1
head = head.replace(D_OLD, '<meta name="description" content="SWOT analysis that leads to decisions: the scope and the decision it serves, a team of at least three roles with outside input, internal strengths and weaknesses backed by a KPI, an audit result or a lesson, external opportunities and threats from PESTLE, Porter\'s forces and market data, each quadrant weighted and ranked, TOWS options that link two quadrants, actions with an owner and a date, risk and opportunity entries for the 6.1 plan, and a review when the context changes. Computed stages, evidence and placement checks, the grid, the TOWS matrix and a chart of sources. A technique, not a requirement; serves ISO 9001:2026 clauses 4.1, 4.2, 6.1, 6.2 and 9.3.2 and ISO 10009:2024 5.1. Continual Improvement Academy.">')
head = head.replace(T_OLD, "<title>SWOT | Continual Improvement Academy — مدثر سلامه</title>")
base_css = between(src, "<style>\n:root", "</style>") + "</style>\n"
host_css = between(src, "<style>\n/* ===== PDCA tool — host styles", "</style>") + "</style>\n"
add_css = (css("capa_host.css", "capa-css") + css("why5_host.css", "why5-css") + css("fish_host.css", "fish-css") + css("pareto_host.css", "pareto-css") +
           css("rca_host.css", "rca-css") + css("a3_host.css", "a3-css") + css("dmaic_host.css", "dmaic-css") + css("fmea_host.css", "fmea-css") +
           css("lessons_host.css", "lessons-css") + css("swot_host.css", "swot-css"))
kit_css, kit_js = block(tpl, "style", "cia-explain-kit-css"), block(tpl, "script", "cia-explain-kit-js")
body = open(os.path.join(HERE, "swot_body.html"), encoding="utf-8").read()
data_js = subprocess.run([sys.executable, os.path.join(HERE, "data_swot.py")], capture_output=True, text=True, check=True).stdout
setup = '''<script id="cia-explain-setup">
/* Host adapter for the CIA Explain Kit v1.4 — SWOT tool. The kit only reads these hooks; it never stores data through them.
   "Assess this" opens the tool's own question (IN1 … RV3) and highlights it; clauses applied directly in the SWOT studies carry the
   pseudo id "x:tools" and show the "outside the assessment" note with a button to the studies. The language switch re-renders an open
   explain tab through applyLang (CIAEX.renderStandard / renderClauses). */
CIAEX.setup(function(){
 return {
  data:EXPLAIN_SWOT,
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

# ---- the other tools' wording: Pareto's (from the DMAIC host script), FMEA's and Lessons Learned's stage names ----
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


DA, DE_ = ui_halves(DMH)
WANT = r'pst_\w+|pu_\w+|pvNo|nxNoData|nxMiss|pvPareto'
PA, PE = pairs(DA, WANT, lambda k: k), pairs(DE_, WANT, lambda k: k)
assert [k for k, _ in PA] == [k for k, _ in PE] and len(PA) >= 12, (PA, PE)
FA_, FE_ = ui_halves(FMH)
FW = r'st_(?:draft|scoped|scales|struct|analysed|planned|done|reviewed)'
FA, FE = pairs(FA_, FW, lambda k: "fm" + k), pairs(FE_, FW, lambda k: "fm" + k)
assert [k for k, _ in FA] == [k for k, _ in FE] and len(FA) == 8, (FA, FE)
LA_, LE_ = ui_halves(LLH)
LW = r'st_(?:draft|captured|cause|lesson|planned|embedded|verified|shared)'
LA, LE = pairs(LA_, LW, lambda k: "ll" + k), pairs(LE_, LW, lambda k: "ll" + k)
assert [k for k, _ in LA] == [k for k, _ in LE] and len(LA) == 8, (LA, LE)
ALLA, ALLE = PA + FA + LA, PE + FE + LE
tbx_ui = ("(function(){ var A={" + ",".join('%s:"%s"' % kv for kv in ALLA) + "}, E={" + ",".join('%s:"%s"' % kv for kv in ALLE) + "};\n"
          " for(var k in A){ if(UI.ar[k]===undefined) UI.ar[k]=A[k]; if(UI.en[k]===undefined) UI.en[k]=E[k]; } })();")
# ---- the Strategy & Performance Studio's own readers and category lists ----
tkv = re.search(r'const TKV=v=>[^\n;]*;', strat).group(0)
assert strat.count(tkv) == 1 and tkv.startswith("const TKV=v=>v==null")
ids_ = between(strat, "const ids=s=>", "\nconst byId=")
assert ids_.count("TKV(") == 1
lists = []
for name in ("swotCat", "pestleF", "pestleImp", "towsQ"):
    m = re.search(r'(?<![\w$])' + name + r':(\[\[.*?\)\]\])', strat)
    assert m and strat.count(name + ":[[") == 1, name
    lists.append(name + ":" + m.group(1))
ss = ("var ssTKV=" + tkv[len("const TKV="):] + "\nvar ssIds=" + ids_[len("const ids="):].replace("TKV(", "ssTKV(") + "\n"
      "var SSO=(function(){ function B(a,e){ return {ar:a,en:e}; } return {" + ",\n ".join(lists) + "}; })();")
# ---- Pareto's ranking and stage, from the DMAIC host script ----
pa = between(DMH, "/* Pareto's ranking and stage (pareto.html: ranked, isVital, stageOf) */\n", "function puName(u)")
pa = pa[pa.find("\n") + 1:].rstrip("\n")
assert pa.startswith("function paNum(v)") and "function paRank(p)" in pa and "function paStage(p)" in pa
# ---- FMEA's own record repair, stage rule and high-priority rows, from the FMEA host script ----
fhelpers = between(FMH, "function esc(s){ return TBX.esc(s); }", "\n/* ---------- records ---------- */\nfunction blankTm")
fconsts = between(FMH, "var STAGES=[\"draft\",\"scoped\"", "\nvar DB=load();")
frules = between(FMH, "/* ---------- records ---------- */\nfunction blankTm", "function flagsOf(r)")
assert "function hiRows(r)" in frules and "function rowAp(w)" in frules
fmr = ("var FMR=(function(){\n function t(k){ return k; }\n" + fhelpers + "\n" + fconsts + "\n" + frules +
       " return {fix:fixRec,stage:stageOf,rows:rowsOf,hi:hiRows,ap:rowAp,acts:acts,revs:revs,lastRev:lastRev};\n})();")
# ---- the Lessons Learned record repair and stage rule, from the Lessons Learned host script ----
lhelpers = between(LLH, "function esc(s){ return TBX.esc(s); }", "\n/* ---------- records ---------- */\nfunction blankAc")
lconsts = between(LLH, "var STAGES=[\"draft\",\"captured\"", "\nvar DB=load();")
lrules = between(LLH, "/* ---------- records ---------- */\nfunction blankAc", "function flagsOf(r)")
assert "function stageOf(r)" in lrules and "function fixRec(r)" in lrules
llr = ("var LLR=(function(){\n function t(k){ return k; }\n" + lhelpers + "\n" + lconsts + "\n" + lrules +
       " return {fix:fixRec,stage:stageOf};\n})();")

host = open(os.path.join(HERE, "swot_host.js"), encoding="utf-8").read()
example = open(os.path.join(HERE, "swot_example.js"), encoding="utf-8").read().rstrip("\n")
logo = re.search(r'var LOGO="(data:image/[^"]+)";', src).group(1)
for mk in ('var LOGO="__LOGO__";', "\n__EXAMPLE__\n", "/*__TBX_UI__*/", "/*__SS_RULES__*/", "/*__PA_RULES__*/", "/*__FM_RULES__*/", "/*__LL_RULES__*/"):
    assert host.count(mk) == 1, mk
host = (host.replace('var LOGO="__LOGO__";', 'var LOGO="' + logo + '";').replace("\n__EXAMPLE__\n", "\n" + example + "\n")
        .replace("/*__TBX_UI__*/", tbx_ui).replace("/*__SS_RULES__*/", ss).replace("/*__PA_RULES__*/", pa)
        .replace("/*__FM_RULES__*/", fmr).replace("/*__LL_RULES__*/", llr))
cut = host.find("*/\n") + 3          # the engine goes right after the schema comment, as in the other toolbox tools
host = "<script>\n" + host[:cut] + ENGINE + host[cut:] + "</script>\n"
home_btn = between(src, "<style>\n#ciaHomeBtn", "\n<!-- CIA guided tour") + "\n"
tour_note = "<!-- CIA guided tour and example-load confirmation (added layer; reads the page only, never writes tool data) -->\n"
tour_css, tour_js = block(src, "style", "cia-tour-css"), block(src, "script", "cia-tour-js")
CFG_OLD = 'var CFG={"file": "lessons", "hasEx": true, "guard": {"pfEx": "all"}};'
assert tour_js.count(CFG_OLD) == 1
tour_js = tour_js.replace(CFG_OLD, 'var CFG={"file": "swot", "hasEx": true, "guard": {"pfEx": "all"}};')

out = (head + base_css + host_css + add_css + kit_css + "\n" + body + kit_js + "\n" +
       '<script id="cia-explain-data">\n' + data_js + "</script>\n" + setup + host + home_btn + tour_note +
       tour_css + "\n" + tour_js + "\n</body>\n</html>\n")
open(P("modules", "swot.html"), "w", encoding="utf-8").write(out)
print("modules/swot.html:", len(out.encode()), "bytes")
