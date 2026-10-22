"""Builds modules/iso10009.html (step 2026-10-16, ISO 10009:2024 quality tools guide) from modules/dmaic.html and the sources in this
folder, the same way build_dmaic.py builds dmaic.html. Run from the platform folder AFTER build_dmaic.py:   python3 tests/build/build_10009.py
What is copied unchanged from DMAIC: the head (with this tool's description and title), the PDCA base style sheet and host styles, the
home-button block with its in-hub link script, and the guided-tour layer (only its CFG line changes).
Styles: PDCA base and host, CAPA's, 5 Whys', Fishbone's, Pareto's, RCA's, A3's and DMAIC's additions and this tool's (qt_host.css).
The Explain Kit blocks are copied from templates/explain-kit-template.html. The shared toolbox engine (engine.js) is inserted at the top of
the host script, byte-identical to the copies in pdca.html, capa.html, five-whys.html, fishbone.html, pareto.html, rca.html, a3.html and
dmaic.html. The tool catalogue (cat_10009.py) is written into the host script as QTC; the kit data (data_10009.py) uses the same catalogue."""
import os, re, sys, json, subprocess

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
P = lambda *a: os.path.join(ROOT, *a)
sys.path.insert(0, HERE)
import cat_10009 as C  # noqa: E402

src = open(P("modules", "dmaic.html"), encoding="utf-8").read()
tpl = open(P("templates", "explain-kit-template.html"), encoding="utf-8").read()
ENGINE = open(os.path.join(HERE, "engine.js"), encoding="utf-8").read()
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
head = head.replace(D_OLD, '<meta name="description" content="ISO 10009:2024 quality tools guide: the 53 quality tools of the standard explained (strategy, process, risk, objectives, customer, process performance, inventory, prevention, process control, corrective action, improvement and the Six Sigma and TQM families), with their Annex A PDCA placement and Annex C attributes, a tool navigator by aim, phase and resources, a library, a PDCA storyboard (Annex B) linked to the records of the platform\'s toolbox, NPS, OEE and cost of quality calculators, a self-assessment, an automatic audit, a dashboard and a report. Supports ISO 9001:2026 (Annex A.9.1, note 3). Continual Improvement Academy.">')
head = head.replace(T_OLD, "<title>ISO 10009 | Continual Improvement Academy — مدثر سلامه</title>")
base_css = between(src, "<style>\n:root", "</style>") + "</style>\n"
host_css = between(src, "<style>\n/* ===== PDCA tool — host styles", "</style>") + "</style>\n"
add_css = (css("capa_host.css", "capa-css") + css("why5_host.css", "why5-css") + css("fish_host.css", "fish-css") +
           css("pareto_host.css", "pareto-css") + css("rca_host.css", "rca-css") + css("a3_host.css", "a3-css") + css("dmaic_host.css", "dmaic-css") +
           css("qt_host.css", "qt-css"))
kit_css, kit_js = block(tpl, "style", "cia-explain-kit-css"), block(tpl, "script", "cia-explain-kit-js")
body = open(os.path.join(HERE, "qt_body.html"), encoding="utf-8").read()
data_js = subprocess.run([sys.executable, os.path.join(HERE, "data_10009.py")], capture_output=True, text=True, check=True).stdout
setup = '''<script id="cia-explain-setup">
/* Host adapter for the CIA Explain Kit v1.4 — ISO 10009 quality tools guide. The kit only reads these hooks; it never stores data through them.
   "Assess this" opens the tool's own question (SL1 … RV3) and highlights it; items applied directly in the tool navigator and storyboard
   carry the pseudo id "x:tools" and show the "outside the assessment" note with a button to the navigator. The language switch re-renders
   an open explain tab through applyLang (CIAEX.renderStandard / renderClauses). */
CIAEX.setup(function(){
 return {
  data:EXPLAIN_10009,
  lang:function(){ return L; },
  go:function(t){ go(t); if(t==="tools") setSub("nav"); },
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
host = open(os.path.join(HERE, "qt_host.js"), encoding="utf-8").read()
example = open(os.path.join(HERE, "qt_example.js"), encoding="utf-8").read().rstrip("\n")
# step 10.1: numbers taken from the inventory of the PDF (inv_10009.py): the table and figures of each subclause, the bibliography
# numbers each subclause cites, and the totals the guide shows (no text of the standard)
_inv = json.load(open(P("tests", "iso10009", "inventory_10009.json"), encoding="utf-8"))
INV = {"tab": {sc: tb for tb, sc in _inv["tables"]}, "fig": {}, "ref": _inv["bibliography"]["cited"],
       "n": {"clauses": len(_inv["clauses"]), "sub": len(_inv["subclauses"]), "tables": len(_inv["tables"]),
             "figs": len([f for f in _inv["figures"] if f[1] != "B"]), "figB": len(_inv["annex"]["B"]), "c1": len(_inv["annex"]["C1"]),
             "bib": _inv["bibliography"]["n"], "names": sum(len(v) for v in _inv["other"].values()), "lists": len(_inv["other"])}}
for f, sc in _inv["figures"]:
    INV["fig"].setdefault(sc, []).append(f)
EXPLORE = open(os.path.join(HERE, "qt_explore.js"), encoding="utf-8").read().rstrip("\n")
logo = re.search(r'var LOGO="(data:image/[^"]+)";', src).group(1)
CAT = {"T": [{k: t[k] for k in ("id", "c", "sec", "n", "area", "ps", "team", "data", "cap", "eff", "aims", "d", "use", "ben", "note", "plat", "ex", "out", "own", "pdca", "lv",
                                     "nw", "inp", "st", "mis", "aud", "pre", "nxt")} for t in C.T],
       "O": [[o[0], o[1], o[2]] for o in C.OTHER], "CL": [[c[0], c[1], c[2]] for c in C.CLAUSES], "CTX": C.CTX, "AREAS": C.AREAS,
       "FILES": C.FILES, "NAMES": C.NAMES, "REC": C.REC_KEYS, "NAV": C.NAV,
       "X": {"CLX": C.CX.CLX, "OTX": C.CX.OTX, "FRONT": C.CX.FRONT, "B": C.CX.ANNEXB, "QUIZ": C.CX.QUIZ, "PATHS": C.CX.PATHS,
             "AA": C.ANNEX_A, "INV": INV}}
assert host.count('var LOGO="__LOGO__";') == 1 and host.count("\n__EXAMPLE__\n") == 1 and host.count("var QTC=__CATALOG__;") == 1
assert host.count("\n/*__EXPLORE__*/\n") == 1
host = host.replace("\n/*__EXPLORE__*/\n", "\n" + EXPLORE + "\n")
host = (host.replace('var LOGO="__LOGO__";', 'var LOGO="' + logo + '";').replace("\n__EXAMPLE__\n", "\n" + example + "\n")
        .replace("var QTC=__CATALOG__;", "var QTC=" + json.dumps(CAT, ensure_ascii=False, separators=(",", ":")) + ";"))
cut = host.find("*/\n") + 3          # the engine goes right after the schema comment, as in the other toolbox tools
host = "<script>\n" + host[:cut] + ENGINE + host[cut:] + "</script>\n"
home_btn = between(src, "<style>\n#ciaHomeBtn", "\n<!-- CIA guided tour") + "\n"
tour_note = "<!-- CIA guided tour and example-load confirmation (added layer; reads the page only, never writes tool data) -->\n"
tour_css, tour_js = block(src, "style", "cia-tour-css"), block(src, "script", "cia-tour-js")
CFG_OLD = 'var CFG={"file": "dmaic", "hasEx": true, "guard": {"pfEx": "all"}};'
assert tour_js.count(CFG_OLD) == 1
tour_js = tour_js.replace(CFG_OLD, 'var CFG={"file": "iso10009", "hasEx": true, "guard": {"pfEx": "all"}};')

out = (head + base_css + host_css + add_css + kit_css + "\n" + body + kit_js + "\n" +
       '<script id="cia-explain-data">\n' + data_js + "</script>\n" + setup + host + home_btn + tour_note +
       tour_css + "\n" + tour_js + "\n</body>\n</html>\n")
open(P("modules", "iso10009.html"), "w", encoding="utf-8").write(out)
print("modules/iso10009.html:", len(out.encode()), "bytes")
