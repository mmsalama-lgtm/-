"""Step 2026-10-16 (FMEA): DMAIC lists, read-only, the FMEA studies that name a project.
Run AFTER build_dmaic.py:   python3 tests/build/patch_dmaic_fmea.py modules/dmaic.html
What changes in modules/dmaic.html, and nothing else:
  - in the Control phase, under the standardisation warning of the hand-over block, a hidden panel listing the FMEA studies whose DMAIC field
    names the project open in the form (read from "cia-fmea:v1", never written), each with its title, its number of analysis rows and its
    actions done, and "Open in FMEA". The panel stays hidden and empty when no study names the project, so with no FMEA data every tab shows
    exactly what it showed before;
  - opening a study: outside the hub a new tab with ?open=; inside the hub a one-time sessionStorage hint "cia-nav:fmea" that the FMEA tool
    reads and removes (navigation only, no tool data), then parent.ciaOpenFile.
The panel reuses the 5 Whys panel's style (w5-cap), so no style is added; no FMEA rule is copied (no priority or stage is computed here).
DMAIC's storage key, schema, stored state, questions, scoring, example, report, CSV, audit and Explain Kit data are untouched. Every anchor
must match exactly once."""
import sys, os

HERE = os.path.dirname(os.path.abspath(__file__))
path = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, "..", "..", "modules", "dmaic.html")
s = open(path, encoding="utf-8").read()
if 'FM_KEY="cia-fmea:v1"' in s:
    print("already linked; nothing to do"); sys.exit(0)


def rep(old, new):
    global s
    n = s.count(old)
    assert n == 1, (n, old[:120])
    s = s.replace(old, new)


rep('''    NAV_KEY="cia-nav:dmaic", A3_NAV="cia-nav:a3", RCA_NAV="cia-nav:rca", FISH_NAV="cia-nav:fishbone", WHY5_NAV="cia-nav:five-whys", PARETO_NAV="cia-nav:pareto";''',
    '''    NAV_KEY="cia-nav:dmaic", A3_NAV="cia-nav:a3", RCA_NAV="cia-nav:rca", FISH_NAV="cia-nav:fishbone", WHY5_NAV="cia-nav:five-whys", PARETO_NAV="cia-nav:pareto";
/* FMEA link (added 2026-10-16): "cia-fmea:v1" is read only, to list the FMEA studies that name a project. "cia-nav:fmea" (sessionStorage)
   is a one-time navigation hint for the hub overlay. */
var FM_KEY="cia-fmea:v1", FM_NAV="cia-nav:fmea";''')
rep(''' yes:"نعم",no:"لا"},
en:{brand:''', ''' yes:"نعم",no:"لا",
 fmT:"دراسات FMEA التي تذكر هذا المشروع (قراءة فقط)",fmOpen:"افتح في FMEA",fmRows:"{n} صف تحليل",fmActs:"الإجراءات المنفذة {d} من {n}"},
en:{brand:''')
rep(''' yes:"Yes",no:"No"}
};''', ''' yes:"Yes",no:"No",
 fmT:"FMEA studies that name this project (read-only)",fmOpen:"Open in FMEA",fmRows:"{n} analysis rows",fmActs:"actions done {d} of {n}"}
};''')
rep('''<div class="w5-warn" id="stdWarn" role="note" hidden></div>');''', '''<div class="w5-warn" id="stdWarn" role="note" hidden></div><div class="w5-cap" id="fmBox" hidden></div>');''')
rep(''' /* gates */
 PH.forEach(function(p){ var n=document.getElementById("gn-"+p);''', ''' fmPanel(r);
 /* gates */
 PH.forEach(function(p){ var n=document.getElementById("gn-"+p);''')
rep('''/* ---------- project form ---------- */''', '''/* ---------- FMEA studies that name this project (read only; counts of the study's own rows and actions, no FMEA rule copied) ---------- */
function fmList(id){ var R=recsOf(FM_KEY)||[]; return id?R.filter(function(f){ return str(f.dmaic)===id; }):[]; }
function fmPanel(r){
 var box=document.getElementById("fmBox"); if(!box) return;
 var F=fmList(r.id);
 if(!r.id || !F.length){ box.hidden=true; box.innerHTML=""; return; }
 box.hidden=false;
 box.innerHTML='<h4>'+esc(t("fmT"))+'</h4><ul>'+F.map(function(f){ var id=str(f.id), W=arr(f.rows).filter(function(w){ return txt(str(w.mode))||txt(str(w.cause)); }), A=arr(f.acts).filter(function(a){ return txt(str(a.what)); });
  return '<li><b dir="ltr">'+esc(id)+'</b><q>'+esc(short(str(f.title),90))+' — '+esc(t("fmRows",{n:W.length}))+(A.length?' · '+esc(t("fmActs",{d:A.filter(function(a){ return a.st==="done"; }).length,n:A.length})):'')+'</q><button class="pd-rowbtn" type="button" data-fmopen="'+esc(id)+'">'+esc(t("fmOpen"))+' ↗</button></li>'; }).join("")+'</ul>';
}
function openFm(q){
 if(inHub()){ try{ sessionStorage.setItem(FM_NAV,JSON.stringify(q)); }catch(e){} try{ if(window.parent.ciaOpenFile("fmea.html")) return; }catch(e){} try{ sessionStorage.removeItem(FM_NAV); }catch(e){} }
 try{ window.open("./fmea.html"+(q.open?"?open="+encodeURIComponent(q.open):"")+"#tools","_blank","noopener"); }catch(e){}
}

/* ---------- project form ---------- */''')
rep(''' var oc=e.target.closest("[data-orca]"); if(oc){ openRca(''', ''' var fmo=e.target.closest("[data-fmopen]"); if(fmo){ openFm({open:fmo.getAttribute("data-fmopen")}); return; }
 var oc=e.target.closest("[data-orca]"); if(oc){ openRca(''')
rep('''window.addEventListener("storage",function(e){ if([PDCA_KEY,CAPA_KEY,PARETO_KEY,FISH_KEY,WHY5_KEY,RCA_KEY,A3_KEY].indexOf(e.key)>=0){''',
    '''window.addEventListener("storage",function(e){ if([PDCA_KEY,CAPA_KEY,PARETO_KEY,FISH_KEY,WHY5_KEY,RCA_KEY,A3_KEY,FM_KEY].indexOf(e.key)>=0){''')
open(path, "w", encoding="utf-8").write(s)
print("dmaic.html: read-only panel of the FMEA studies that name the project")
