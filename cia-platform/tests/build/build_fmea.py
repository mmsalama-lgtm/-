"""Builds modules/fmea.html (step 2026-10-16, FMEA) from modules/dmaic.html and the sources in this folder, the same way build_dmaic.py builds
dmaic.html. Run from the platform folder AFTER build_dmaic.py (patch_dmaic_fmea.py may run before or after: it only touches DMAIC's host
script, which is not copied here):   python3 tests/build/build_fmea.py
What is copied unchanged from DMAIC: the head (with this tool's description and title), the PDCA base style sheet and host styles, the
home-button block with its in-hub link script, and the guided-tour layer (only its CFG line changes).
Styles: PDCA base and host, CAPA's, 5 Whys', Fishbone's, Pareto's, RCA's, A3's and DMAIC's additions (capa_host.css … dmaic_host.css) and this
tool's (fmea_host.css). The Explain Kit blocks are copied from templates/explain-kit-template.html. The shared toolbox engine (engine.js) is
inserted at the top of the host script, byte-identical to the copies in the other toolbox tools.
Read-only parts copied from tests/build/dmaic_host.js at build time, so FMEA reads the other tools with their own rules:
  - the stage rules and previews of CAPA, RCA, 5 Whys, Fishbone, A3 and Pareto (the block from "stages of the other tools" to the charts);
  - DMAIC's own record repair and stage rule (helpers, constants and the block from "records" to the issues list), wrapped in DMR so they
    never touch FMEA's names; FMEA uses DMR.stage, DMR.steps (SIPOC steps) and DMR.proved (proved causes) only, for previews and starts;
  - the wording those previews use (the other tools' stage names, preview lines; DMAIC's stage names as dst_*)."""
import os, re, sys, subprocess

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
P = lambda *a: os.path.join(ROOT, *a)
src = open(P("modules", "dmaic.html"), encoding="utf-8").read()
tpl = open(P("templates", "explain-kit-template.html"), encoding="utf-8").read()
ENGINE = open(os.path.join(HERE, "engine.js"), encoding="utf-8").read()
DMH = open(os.path.join(HERE, "dmaic_host.js"), encoding="utf-8").read()
assert ENGINE in src, "dmaic.html must carry the engine (run build_dmaic.py first)"


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


# ---- head: same as DMAIC, with this tool's description and title ----
assert src.startswith("<!DOCTYPE html>") and src.count("<style>\n:root") == 1
head = src[:src.find("<style>\n:root")]
D_OLD = re.search(r'<meta name="description" content="DMAIC improvement project: [^"]*">', head).group(0)
T_OLD = "<title>DMAIC | Continual Improvement Academy — مدثر سلامه</title>"
assert head.count(D_OLD) == 1 and head.count(T_OLD) == 1
head = head.replace(D_OLD, '<meta name="description" content="FMEA — failure mode and effects analysis: a structured, team-based look ahead at how each process step (or design function) can fail, the effect on the customer or the next step, the causes and the prevention and detection controls. Written 1–10 scales agreed before the rating, the risk priority number and the action priority computed by a written rule (high severity first), actions with an owner and a date, re-rating with evidence (severity falls only with a design or process change), dated reviews, a severity × occurrence heat map. Starts read-only from DMAIC, RCA or Pareto. ISO 10009:2024 7.3; serves ISO 9001:2026 clauses 6.1, 8.5.1 g), 8.5.6 and 10.2. Continual Improvement Academy.">')
head = head.replace(T_OLD, "<title>FMEA | Continual Improvement Academy — مدثر سلامه</title>")
base_css = between(src, "<style>\n:root", "</style>") + "</style>\n"
host_css = between(src, "<style>\n/* ===== PDCA tool — host styles", "</style>") + "</style>\n"
add_css = (css("capa_host.css", "capa-css") + css("why5_host.css", "why5-css") + css("fish_host.css", "fish-css") + css("pareto_host.css", "pareto-css") +
           css("rca_host.css", "rca-css") + css("a3_host.css", "a3-css") + css("dmaic_host.css", "dmaic-css") + css("fmea_host.css", "fmea-css"))
kit_css, kit_js = block(tpl, "style", "cia-explain-kit-css"), block(tpl, "script", "cia-explain-kit-js")
body = open(os.path.join(HERE, "fmea_body.html"), encoding="utf-8").read()
data_js = subprocess.run([sys.executable, os.path.join(HERE, "data_fmea.py")], capture_output=True, text=True, check=True).stdout
setup = '''<script id="cia-explain-setup">
/* Host adapter for the CIA Explain Kit v1.4 — FMEA tool. The kit only reads these hooks; it never stores data through them.
   "Assess this" opens the tool's own question (PP1 … LV2) and highlights it; clauses applied directly in the FMEA study carry the
   pseudo id "x:tools" and show the "outside the assessment" note with a button to the FMEA study. The language switch
   re-renders an open explain tab through applyLang (CIAEX.renderStandard / renderClauses). */
CIAEX.setup(function(){
 return {
  data:EXPLAIN_FMEA,
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

# ---- read-only parts taken from the DMAIC host script ----
ui_i = DMH.find("var UI={"); ui_j = DMH.find("\n};", ui_i); UIT = DMH[ui_i:ui_j]
ar_i = UIT.find("ar:{brand:"); en_i = UIT.find("\nen:{brand:"); assert 0 < ar_i < en_i
UIAR, UIEN = UIT[ar_i:en_i], UIT[en_i:]
PAIR = r'(?<![\w$])(%s):"((?:[^"\\]|\\.)*)"'
WANT = r'(?:rst|fst|w5st|a3st|pst|cst|pu|res)_\w+|resPend|pvNo|nxNoData|nxMiss|pkEvFish|pkEvWhy5|pvCat|pvVf|pvA3|pvFish|pvWhy5|pvPareto|pvCapa|pvRca|st_(?:D|M|A|I|C|closed|stop)'


def pairs(t):
    out, seen = [], set()
    for k, v in re.findall(PAIR % WANT, t):
        if k in seen:
            continue
        seen.add(k); out.append(((("dst_" + k[3:]) if k.startswith("st_") else k), v))
    return out


PA, PE = pairs(UIAR), pairs(UIEN)
assert [k for k, _ in PA] == [k for k, _ in PE] and len(PA) > 40, (len(PA), len(PE))
dm_ui = ("(function(){ var A={" + ",".join('%s:"%s"' % kv for kv in PA) + "}, E={" + ",".join('%s:"%s"' % kv for kv in PE) + "};\n"
         " for(var k in A){ if(UI.ar[k]===undefined) UI.ar[k]=A[k]; if(UI.en[k]===undefined) UI.en[k]=E[k]; } })();")
stages = between(DMH, "/* stages of the other tools, read with their own rules", "/* ---------- charts (inline SVG")
helpers = between(DMH, "function esc(s){ return TBX.esc(s); }", "\n/* ---------- records ---------- */\nfunction blankTm")
consts = between(DMH, "var PH=[\"D\",\"M\",\"A\",\"I\",\"C\"]", "\nvar DB=load();")
rules = between(DMH, "/* ---------- records ---------- */\nfunction blankTm", "function flagsOf(r)")
dmr = ("var DMR=(function(){\n function t(k){ return k; }\n" + helpers + "\n" + consts + "\n" + rules +
       " return {fix:fixRec,stage:stageOf,steps:steps,proved:proved};\n})();")

host = open(os.path.join(HERE, "fmea_host.js"), encoding="utf-8").read()
example = open(os.path.join(HERE, "fmea_example.js"), encoding="utf-8").read().rstrip("\n")
logo = re.search(r'var LOGO="(data:image/[^"]+)";', src).group(1)
for mk in ('var LOGO="__LOGO__";', "\n__EXAMPLE__\n", "/*__DM_UI__*/", "/*__TBX_STAGES__*/", "/*__DM_RULES__*/"):
    assert host.count(mk) == 1, mk
host = (host.replace('var LOGO="__LOGO__";', 'var LOGO="' + logo + '";').replace("\n__EXAMPLE__\n", "\n" + example + "\n")
        .replace("/*__DM_UI__*/", dm_ui).replace("/*__TBX_STAGES__*/", stages.rstrip("\n")).replace("/*__DM_RULES__*/", dmr))
cut = host.find("*/\n") + 3          # the engine goes right after the schema comment, as in the other toolbox tools
host = "<script>\n" + host[:cut] + ENGINE + host[cut:] + "</script>\n"
home_btn = between(src, "<style>\n#ciaHomeBtn", "\n<!-- CIA guided tour") + "\n"
tour_note = "<!-- CIA guided tour and example-load confirmation (added layer; reads the page only, never writes tool data) -->\n"
tour_css, tour_js = block(src, "style", "cia-tour-css"), block(src, "script", "cia-tour-js")
CFG_OLD = 'var CFG={"file": "dmaic", "hasEx": true, "guard": {"pfEx": "all"}};'
assert tour_js.count(CFG_OLD) == 1
tour_js = tour_js.replace(CFG_OLD, 'var CFG={"file": "fmea", "hasEx": true, "guard": {"pfEx": "all"}};')

out = (head + base_css + host_css + add_css + kit_css + "\n" + body + kit_js + "\n" +
       '<script id="cia-explain-data">\n' + data_js + "</script>\n" + setup + host + home_btn + tour_note +
       tour_css + "\n" + tour_js + "\n</body>\n</html>\n")
open(P("modules", "fmea.html"), "w", encoding="utf-8").write(out)
print("modules/fmea.html:", len(out.encode()), "bytes")
