"""Builds modules/stakeholders.html (step 2026-10-17, Stakeholder Analysis) from modules/pestle.html and the sources in this folder, the same
way build_pestle.py builds pestle.html. Run from the platform folder AFTER build_pestle.py:   python3 tests/build/build_stakeholders.py
What is copied unchanged from PESTLE: the head (with this tool's description and title), the PDCA base style sheet and host styles, the
home-button block with its in-hub link script, and the guided-tour layer (only its CFG line changes).
Styles: PDCA base and host, the toolbox additions (capa_host.css … pestle_host.css) and this tool's (stakeholders_host.css). The Explain Kit
blocks are copied from templates/explain-kit-template.html. The shared toolbox engine (engine.js) is inserted at the top of the host script,
byte-identical to the copies in the other toolbox tools.
Read-only parts copied at build time, so the tool reads the other tools with their own rules:
  - from modules/strategy-performance.html: the Studio's value reader (TKV, as ssTKV); the Studio holds no interested-parties register (its
    REGKEYS are checked), so only its SWOT and PESTLE rows that name a party are read;
  - from tests/build/swot_host.js: the SWOT tool's record repair, stage rule, items and codes (SWR), its stage and quadrant names (swst_*, swq_*);
  - from tests/build/pestle_host.js: the PESTLE tool's record repair, stage rule, items, scores, top items and codes (PER), its stage names (pest_*);
  - from tests/build/lessons_host.js: the Lessons Learned record repair and stage rule (LLR) and its stage names (llst_*)."""
import os, re, sys, subprocess

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
P = lambda *a: os.path.join(ROOT, *a)
src = open(P("modules", "pestle.html"), encoding="utf-8").read()
strat = open(P("modules", "strategy-performance.html"), encoding="utf-8").read()
tpl = open(P("templates", "explain-kit-template.html"), encoding="utf-8").read()
ENGINE = open(os.path.join(HERE, "engine.js"), encoding="utf-8").read()
SWH = open(os.path.join(HERE, "swot_host.js"), encoding="utf-8").read()
PEH = open(os.path.join(HERE, "pestle_host.js"), encoding="utf-8").read()
LLH = open(os.path.join(HERE, "lessons_host.js"), encoding="utf-8").read()
assert ENGINE in src, "pestle.html must carry the engine (run build_pestle.py first)"


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


# ---- head: same as PESTLE, with this tool's description and title ----
assert src.startswith("<!DOCTYPE html>") and src.count("<style>\n:root") == 1
head = src[:src.find("<style>\n:root")]
D_OLD = re.search(r'<meta name="description" content="PESTLE analysis that leads to decisions: [^"]*">', head).group(0)
T_OLD = "<title>PESTLE | Continual Improvement Academy — مدثر سلامه</title>"
assert head.count(D_OLD) == 1 and head.count(T_OLD) == 1
head = head.replace(D_OLD, '<meta name="description" content="Stakeholder analysis that leads to decisions: the scope and the decision or plan the register serves, a team of at least three roles with outside input, interested parties named specifically (generic names flagged), each party\'s requirements with their source and date, the ISO 9001:2026 4.2 c) decision on every requirement with the reason when it is not addressed, power and interest rated with reasons, the power/interest grid and the engagement approach, a relationship owner, channel and frequency, an explicit question on climate-related requirements, an outcome for every key party into SWOT, PESTLE, the risk register or the 6.1 plan, actions, and a review on a date and after major changes. Computed stages, the grid, the requirements matrix and a chart of parties. A technique, not a requirement; serves ISO 9001:2026 clauses 4.2, 4.3, 5.1.2, 6.1.1, 9.1.2 and 9.3.2. Continual Improvement Academy.">')
head = head.replace(T_OLD, "<title>Stakeholder Analysis | Continual Improvement Academy — مدثر سلامه</title>")
base_css = between(src, "<style>\n:root", "</style>") + "</style>\n"
host_css = between(src, "<style>\n/* ===== PDCA tool — host styles", "</style>") + "</style>\n"
add_css = (css("capa_host.css", "capa-css") + css("why5_host.css", "why5-css") + css("fish_host.css", "fish-css") + css("pareto_host.css", "pareto-css") +
           css("rca_host.css", "rca-css") + css("a3_host.css", "a3-css") + css("dmaic_host.css", "dmaic-css") + css("fmea_host.css", "fmea-css") +
           css("lessons_host.css", "lessons-css") + css("swot_host.css", "swot-css") + css("pestle_host.css", "pestle-css") +
           css("stakeholders_host.css", "stakeholders-css"))
kit_css, kit_js = block(tpl, "style", "cia-explain-kit-css"), block(tpl, "script", "cia-explain-kit-js")
body = open(os.path.join(HERE, "stakeholders_body.html"), encoding="utf-8").read()
data_js = subprocess.run([sys.executable, os.path.join(HERE, "data_stakeholders.py")], capture_output=True, text=True, check=True).stdout
setup = '''<script id="cia-explain-setup">
/* Host adapter for the CIA Explain Kit v1.4 — Stakeholder Analysis tool. The kit only reads these hooks; it never stores data through them.
   "Assess this" opens the tool's own question (IN1 … RV3) and highlights it; clauses applied directly in the stakeholder registers carry
   the pseudo id "x:tools" and show the "outside the assessment" note with a button to the registers. The language switch re-renders an open
   explain tab through applyLang (CIAEX.renderStandard / renderClauses). */
CIAEX.setup(function(){
 return {
  data:EXPLAIN_STAKEHOLDERS,
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

# ---- the other tools' wording: SWOT stage and quadrant names, PESTLE stage names, Lessons Learned stage names ----
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
PA_, PE_ = ui_halves(PEH)
PW = r'st_(?:draft|scoped|team|sourced|climate|ranked|outcomes|reviewed)'
PA, PE = pairs(PA_, PW, lambda k: "pe" + k), pairs(PE_, PW, lambda k: "pe" + k)
assert [k for k, _ in PA] == [k for k, _ in PE] and len(PA) == 8, (PA, PE)
LA_, LE_ = ui_halves(LLH)
LW = r'st_(?:draft|captured|cause|lesson|planned|embedded|verified|shared)'
LA, LE = pairs(LA_, LW, lambda k: "ll" + k), pairs(LE_, LW, lambda k: "ll" + k)
assert [k for k, _ in LA] == [k for k, _ in LE] and len(LA) == 8, (LA, LE)
ALLA, ALLE = SA + QA + PA + LA, SE + QE + PE + LE
tbx_ui = ("(function(){ var A={" + ",".join('%s:"%s"' % kv for kv in ALLA) + "}, E={" + ",".join('%s:"%s"' % kv for kv in ALLE) + "};\n"
          " for(var k in A){ if(UI.ar[k]===undefined) UI.ar[k]=A[k]; if(UI.en[k]===undefined) UI.en[k]=E[k]; } })();")
# ---- the Strategy & Performance Studio's own value reader (it holds no interested-parties register) ----
tkv = re.search(r'const TKV=v=>[^\n;]*;', strat).group(0)
assert strat.count(tkv) == 1 and tkv.startswith("const TKV=v=>v==null")
assert 'REGKEYS=["swot","pestle","tows","obj","kpi","init","ms","raid"]' in strat, "the Studio's registers changed: check for a stakeholder register"
ss = "var ssTKV=" + tkv[len("const TKV="):]
# ---- the SWOT tool's own record repair, stage rule, items, top items and codes, from the SWOT host script ----
shelpers = between(SWH, "function esc(s){ return TBX.esc(s); }", "\n/* ---------- records ---------- */\nfunction blankTm")
sconsts = between(SWH, "var STAGES=[\"draft\",\"scoped\",\"team\",\"quads\"", "\nvar DB=load();")
srules = between(SWH, "/* ---------- records ---------- */\nfunction blankTm", "function flagsOf(r)")
assert "function stageOf(r)" in srules and "function fixRec(r)" in srules and "function tops(r)" in srules and "function codes(r)" in srules
swr = ("var SWR=(function(){\n function t(k){ return k; }\n" + shelpers + "\n" + sconsts + "\n" + srules +
       " return {fix:fixRec,stage:stageOf,items:items,tops:tops,codes:codes};\n})();")
# ---- the PESTLE tool's own record repair, stage rule, items, scores, top items and codes, from the PESTLE host script ----
phelpers = between(PEH, "function esc(s){ return TBX.esc(s); }", "\n/* ---------- records ---------- */\nfunction blankTm")
pconsts = between(PEH, "var STAGES=[\"draft\",\"scoped\",\"team\",\"sourced\"", "\nvar DB=load();")
prules = between(PEH, "/* ---------- records ---------- */\nfunction blankTm", "function flagsOf(r)")
assert "function stageOf(r)" in prules and "function fixRec(r)" in prules and "function topList(r)" in prules and "function codes(r)" in prules
per = ("var PER=(function(){\n function t(k){ return k; }\n" + phelpers + "\n" + pconsts + "\n" + prules +
       " return {fix:fixRec,stage:stageOf,items:facs,score:score,tops:topList,codes:codes};\n})();")
# ---- the Lessons Learned record repair and stage rule, from the Lessons Learned host script ----
lhelpers = between(LLH, "function esc(s){ return TBX.esc(s); }", "\n/* ---------- records ---------- */\nfunction blankAc")
lconsts = between(LLH, "var STAGES=[\"draft\",\"captured\"", "\nvar DB=load();")
lrules = between(LLH, "/* ---------- records ---------- */\nfunction blankAc", "function flagsOf(r)")
assert "function stageOf(r)" in lrules and "function fixRec(r)" in lrules
llr = ("var LLR=(function(){\n function t(k){ return k; }\n" + lhelpers + "\n" + lconsts + "\n" + lrules +
       " return {fix:fixRec,stage:stageOf};\n})();")

host = open(os.path.join(HERE, "stakeholders_host.js"), encoding="utf-8").read()
example = open(os.path.join(HERE, "stakeholders_example.js"), encoding="utf-8").read().rstrip("\n")
logo = re.search(r'var LOGO="(data:image/[^"]+)";', src).group(1)
for mk in ('var LOGO="__LOGO__";', "\n__EXAMPLE__\n", "/*__TBX_UI__*/", "/*__SS_RULES__*/", "/*__SW_RULES__*/", "/*__PE_RULES__*/", "/*__LL_RULES__*/"):
    assert host.count(mk) == 1, mk
host = (host.replace('var LOGO="__LOGO__";', 'var LOGO="' + logo + '";').replace("\n__EXAMPLE__\n", "\n" + example + "\n")
        .replace("/*__TBX_UI__*/", tbx_ui).replace("/*__SS_RULES__*/", ss).replace("/*__SW_RULES__*/", swr)
        .replace("/*__PE_RULES__*/", per).replace("/*__LL_RULES__*/", llr))
cut = host.find("*/\n") + 3          # the engine goes right after the schema comment, as in the other toolbox tools
host = "<script>\n" + host[:cut] + ENGINE + host[cut:] + "</script>\n"
home_btn = between(src, "<style>\n#ciaHomeBtn", "\n<!-- CIA guided tour") + "\n"
tour_note = "<!-- CIA guided tour and example-load confirmation (added layer; reads the page only, never writes tool data) -->\n"
tour_css, tour_js = block(src, "style", "cia-tour-css"), block(src, "script", "cia-tour-js")
CFG_OLD = 'var CFG={"file": "pestle", "hasEx": true, "guard": {"pfEx": "all"}};'
assert tour_js.count(CFG_OLD) == 1
tour_js = tour_js.replace(CFG_OLD, 'var CFG={"file": "stakeholders", "hasEx": true, "guard": {"pfEx": "all"}};')

out = (head + base_css + host_css + add_css + kit_css + "\n" + body + kit_js + "\n" +
       '<script id="cia-explain-data">\n' + data_js + "</script>\n" + setup + host + home_btn + tour_note +
       tour_css + "\n" + tour_js + "\n</body>\n</html>\n")
open(P("modules", "stakeholders.html"), "w", encoding="utf-8").write(out)
print("modules/stakeholders.html:", len(out.encode()), "bytes")
