"""Builds modules/lessons.html (step 2026-10-16, Lessons Learned) from modules/fmea.html and the sources in this folder, the same way
build_fmea.py builds fmea.html. Run from the platform folder AFTER build_fmea.py (patch_fmea_lessons.py may run before or after: it only
touches FMEA's host script inside modules/fmea.html, and none of it is copied here):   python3 tests/build/build_lessons.py
What is copied unchanged from FMEA: the head (with this tool's description and title), the PDCA base style sheet and host styles, the
home-button block with its in-hub link script, and the guided-tour layer (only its CFG line changes).
Styles: PDCA base and host, the toolbox additions (capa_host.css … fmea_host.css) and this tool's (lessons_host.css). The Explain Kit blocks
are copied from templates/explain-kit-template.html. The shared toolbox engine (engine.js) is inserted at the top of the host script,
byte-identical to the copies in the other toolbox tools.
Read-only parts copied at build time, so the tool reads the other tools with their own rules:
  - from tests/build/dmaic_host.js: the stage rules and previews of CAPA, RCA, 5 Whys, Fishbone, A3 and Pareto, DMAIC's own record repair and
    stage rule (wrapped in DMR), and the wording they use (the other tools' stage names and preview lines; DMAIC's stage names as dst_*);
  - from tests/build/fmea_host.js: FMEA's own record repair and stage rule with its helpers (wrapped in FMR, so they never touch this tool's
    names) and FMEA's stage names (as fmst_*);
  - from modules/pdca.html: PDCA's stage rule (as pdcaStage) and its stage names (as pdst_*)."""
import os, re, sys, subprocess

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
P = lambda *a: os.path.join(ROOT, *a)
src = open(P("modules", "fmea.html"), encoding="utf-8").read()
pdca = open(P("modules", "pdca.html"), encoding="utf-8").read()
tpl = open(P("templates", "explain-kit-template.html"), encoding="utf-8").read()
ENGINE = open(os.path.join(HERE, "engine.js"), encoding="utf-8").read()
DMH = open(os.path.join(HERE, "dmaic_host.js"), encoding="utf-8").read()
FMH = open(os.path.join(HERE, "fmea_host.js"), encoding="utf-8").read()
assert ENGINE in src, "fmea.html must carry the engine (run build_fmea.py first)"


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


# ---- head: same as FMEA, with this tool's description and title ----
assert src.startswith("<!DOCTYPE html>") and src.count("<style>\n:root") == 1
head = src[:src.find("<style>\n:root")]
D_OLD = re.search(r'<meta name="description" content="FMEA — failure mode and effects analysis: [^"]*">', head).group(0)
T_OLD = "<title>FMEA | Continual Improvement Academy — مدثر سلامه</title>"
assert head.count(D_OLD) == 1 and head.count(T_OLD) == 1
head = head.replace(D_OLD, '<meta name="description" content="Lessons learned register: what happened and the evidence, the cause taken read-only from a real analysis (RCA, 5 Whys, Fishbone, A3, DMAIC, FMEA, CAPA), the lesson written as a rule others can apply (When…, do…, because…) with where it applies, embedding actions that change a procedure, a form, a checklist, a training, an FMEA row or a control plan, verification on the next project and sharing. Computed stages, blame-free wording, a search of the register and a read-before-you-start list. A practice, not a requirement; serves ISO 9001:2026 clauses 7.1.6, 7.4, 8.1, 8.5.6, 9.1.3, 10.1 and 10.2.1. Continual Improvement Academy.">')
head = head.replace(T_OLD, "<title>Lessons Learned | Continual Improvement Academy — مدثر سلامه</title>")
base_css = between(src, "<style>\n:root", "</style>") + "</style>\n"
host_css = between(src, "<style>\n/* ===== PDCA tool — host styles", "</style>") + "</style>\n"
add_css = (css("capa_host.css", "capa-css") + css("why5_host.css", "why5-css") + css("fish_host.css", "fish-css") + css("pareto_host.css", "pareto-css") +
           css("rca_host.css", "rca-css") + css("a3_host.css", "a3-css") + css("dmaic_host.css", "dmaic-css") + css("fmea_host.css", "fmea-css") +
           css("lessons_host.css", "lessons-css"))
kit_css, kit_js = block(tpl, "style", "cia-explain-kit-css"), block(tpl, "script", "cia-explain-kit-js")
body = open(os.path.join(HERE, "lessons_body.html"), encoding="utf-8").read()
data_js = subprocess.run([sys.executable, os.path.join(HERE, "data_lessons.py")], capture_output=True, text=True, check=True).stdout
setup = '''<script id="cia-explain-setup">
/* Host adapter for the CIA Explain Kit v1.4 — Lessons Learned tool. The kit only reads these hooks; it never stores data through them.
   "Assess this" opens the tool's own question (CP1 … VS3) and highlights it; clauses applied directly in the lessons register carry the
   pseudo id "x:tools" and show the "outside the assessment" note with a button to the register. The language switch re-renders an open
   explain tab through applyLang (CIAEX.renderStandard / renderClauses). */
CIAEX.setup(function(){
 return {
  data:EXPLAIN_LESSONS,
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

# ---- read-only parts taken from the DMAIC host script (the same parts build_fmea.py takes) ----
ui_i = DMH.find("var UI={"); ui_j = DMH.find("\n};", ui_i); UIT = DMH[ui_i:ui_j]
ar_i = UIT.find("ar:{brand:"); en_i = UIT.find("\nen:{brand:"); assert 0 < ar_i < en_i
UIAR, UIEN = UIT[ar_i:en_i], UIT[en_i:]
PAIR = r'(?<![\w$])(%s):"((?:[^"\\]|\\.)*)"'
WANT = r'(?:rst|fst|w5st|a3st|pst|cst|pu|res)_\w+|resPend|pvNo|nxNoData|nxMiss|pkEvFish|pkEvWhy5|pvCat|pvVf|pvA3|pvFish|pvWhy5|pvPareto|pvCapa|pvRca|st_(?:D|M|A|I|C|closed|stop)'


def pairs(t, want, ren):
    out, seen = [], set()
    for k, v in re.findall(PAIR % want, t):
        if k in seen:
            continue
        seen.add(k); out.append((ren(k), v))
    return out


PA = pairs(UIAR, WANT, lambda k: ("dst_" + k[3:]) if k.startswith("st_") else k)
PE = pairs(UIEN, WANT, lambda k: ("dst_" + k[3:]) if k.startswith("st_") else k)
assert [k for k, _ in PA] == [k for k, _ in PE] and len(PA) > 40, (len(PA), len(PE))
# FMEA's stage names, as fmst_*
fu_i = FMH.find("var UI={"); fu_j = FMH.find("\n};", fu_i); FUT = FMH[fu_i:fu_j]
far, fen = FUT.find("ar:{brand:"), FUT.find("\nen:{brand:"); assert 0 < far < fen
FW = r'st_(?:draft|scoped|scales|struct|analysed|planned|done|reviewed)'
FA, FE = pairs(FUT[far:fen], FW, lambda k: "fm" + k), pairs(FUT[fen:], FW, lambda k: "fm" + k)
assert [k for k, _ in FA] == [k for k, _ in FE] and len(FA) == 8, (FA, FE)
# PDCA's stage names, as pdst_*
pu_i = pdca.find("var UI={"); pu_j = pdca.find("\n};", pu_i); PUT = pdca[pu_i:pu_j]
par, pen = PUT.find("ar:{brand:"), PUT.find("\nen:{brand:"); assert 0 < par < pen
PDN = {"stPlan": "pdst_plan", "stDo": "pdst_do", "stCheck": "pdst_check", "stAct": "pdst_act", "stClosed": "pdst_closed"}
PW = r'stPlan|stDo|stCheck|stAct|stClosed'
DA, DE = pairs(PUT[par:pen], PW, lambda k: PDN[k]), pairs(PUT[pen:], PW, lambda k: PDN[k])
assert sorted(k for k, _ in DA) == sorted(PDN.values()) and [k for k, _ in DA] == [k for k, _ in DE], (DA, DE)
ALLA, ALLE = PA + FA + DA, PE + FE + DE
tbx_ui = ("(function(){ var A={" + ",".join('%s:"%s"' % kv for kv in ALLA) + "}, E={" + ",".join('%s:"%s"' % kv for kv in ALLE) + "};\n"
          " for(var k in A){ if(UI.ar[k]===undefined) UI.ar[k]=A[k]; if(UI.en[k]===undefined) UI.en[k]=E[k]; } })();")
stages = between(DMH, "/* stages of the other tools, read with their own rules", "/* ---------- charts (inline SVG")
helpers = between(DMH, "function esc(s){ return TBX.esc(s); }", "\n/* ---------- records ---------- */\nfunction blankTm")
consts = between(DMH, "var PH=[\"D\",\"M\",\"A\",\"I\",\"C\"]", "\nvar DB=load();")
rules = between(DMH, "/* ---------- records ---------- */\nfunction blankTm", "function flagsOf(r)")
dmr = ("var DMR=(function(){\n function t(k){ return k; }\n" + helpers + "\n" + consts + "\n" + rules +
       " return {fix:fixRec,stage:stageOf,steps:steps,proved:proved};\n})();")
# ---- FMEA's own record repair and stage rule, from the FMEA host script ----
fhelpers = between(FMH, "function esc(s){ return TBX.esc(s); }", "\n/* ---------- records ---------- */\nfunction blankTm")
fconsts = between(FMH, "var STAGES=[\"draft\",\"scoped\"", "\nvar DB=load();")
frules = between(FMH, "/* ---------- records ---------- */\nfunction blankTm", "function flagsOf(r)")
fmr = ("var FMR=(function(){\n function t(k){ return k; }\n" + fhelpers + "\n" + fconsts + "\n" + frules +
       " return {fix:fixRec,stage:stageOf,rows:rowsOf,acts:acts,reRated:reRated,revs:revs,lastRev:lastRev,rowAfter:rowAfter};\n})();")
# ---- PDCA's stage rule, from modules/pdca.html ----
pst = between(pdca, "function stageOf(r){\n if(r.act && r.act.decision===\"close\")", "function stageName(s)")
pdr = pst.replace("function stageOf(r){", "function pdcaStage(r){", 1).rstrip("\n")

host = open(os.path.join(HERE, "lessons_host.js"), encoding="utf-8").read()
example = open(os.path.join(HERE, "lessons_example.js"), encoding="utf-8").read().rstrip("\n")
logo = re.search(r'var LOGO="(data:image/[^"]+)";', src).group(1)
for mk in ('var LOGO="__LOGO__";', "\n__EXAMPLE__\n", "/*__TBX_UI__*/", "/*__TBX_STAGES__*/", "/*__DM_RULES__*/", "/*__FM_RULES__*/", "/*__PD_RULES__*/"):
    assert host.count(mk) == 1, mk
host = (host.replace('var LOGO="__LOGO__";', 'var LOGO="' + logo + '";').replace("\n__EXAMPLE__\n", "\n" + example + "\n")
        .replace("/*__TBX_UI__*/", tbx_ui).replace("/*__TBX_STAGES__*/", stages.rstrip("\n")).replace("/*__DM_RULES__*/", dmr)
        .replace("/*__FM_RULES__*/", fmr).replace("/*__PD_RULES__*/", pdr))
cut = host.find("*/\n") + 3          # the engine goes right after the schema comment, as in the other toolbox tools
host = "<script>\n" + host[:cut] + ENGINE + host[cut:] + "</script>\n"
home_btn = between(src, "<style>\n#ciaHomeBtn", "\n<!-- CIA guided tour") + "\n"
tour_note = "<!-- CIA guided tour and example-load confirmation (added layer; reads the page only, never writes tool data) -->\n"
tour_css, tour_js = block(src, "style", "cia-tour-css"), block(src, "script", "cia-tour-js")
CFG_OLD = 'var CFG={"file": "fmea", "hasEx": true, "guard": {"pfEx": "all"}};'
assert tour_js.count(CFG_OLD) == 1
tour_js = tour_js.replace(CFG_OLD, 'var CFG={"file": "lessons", "hasEx": true, "guard": {"pfEx": "all"}};')

out = (head + base_css + host_css + add_css + kit_css + "\n" + body + kit_js + "\n" +
       '<script id="cia-explain-data">\n' + data_js + "</script>\n" + setup + host + home_btn + tour_note +
       tour_css + "\n" + tour_js + "\n</body>\n</html>\n")
open(P("modules", "lessons.html"), "w", encoding="utf-8").write(out)
print("modules/lessons.html:", len(out.encode()), "bytes")
