"""Step 2026-10-16 (Lessons Learned): FMEA lists, read-only, the lessons that name a study.
Run AFTER build_fmea.py:   python3 tests/build/patch_fmea_lessons.py modules/fmea.html
What changes in modules/fmea.html, and nothing else:
  - in the review section of the study (5 · Study review), under the review warning, a hidden panel listing the lessons whose source is the
    study (source "fmea" and its id) or that carry an "FMEA row" embedding action naming the study (read from "cia-lessons:v1", never
    written), each with its title, its number of embedding actions done, and "Open in Lessons". The panel stays hidden and empty when no
    lesson names the study, so with no lessons data every tab shows exactly what it showed before;
  - opening a lesson: outside the hub a new tab with ?open=; inside the hub a one-time sessionStorage hint "cia-nav:lessons" that the
    Lessons Learned tool reads and removes (navigation only, no tool data), then parent.ciaOpenFile.
The panel reuses the 5 Whys panel's style (w5-cap), so no style is added; no Lessons rule is copied (no stage is computed here).
FMEA's storage key, schema, stored state, questions, scoring, example, report, CSV, audit and Explain Kit data are untouched. Every anchor
must match exactly once."""
import sys, os

HERE = os.path.dirname(os.path.abspath(__file__))
path = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, "..", "..", "modules", "fmea.html")
s = open(path, encoding="utf-8").read()
if 'LL_KEY="cia-lessons:v1"' in s:
    print("already linked; nothing to do"); sys.exit(0)


def rep(old, new):
    global s
    n = s.count(old)
    assert n == 1, (n, old[:120])
    s = s.replace(old, new)


rep('''    NAV_KEY="cia-nav:fmea", DM_NAV="cia-nav:dmaic", A3_NAV="cia-nav:a3", RCA_NAV="cia-nav:rca", FISH_NAV="cia-nav:fishbone", WHY5_NAV="cia-nav:five-whys", PARETO_NAV="cia-nav:pareto";''',
    '''    NAV_KEY="cia-nav:fmea", DM_NAV="cia-nav:dmaic", A3_NAV="cia-nav:a3", RCA_NAV="cia-nav:rca", FISH_NAV="cia-nav:fishbone", WHY5_NAV="cia-nav:five-whys", PARETO_NAV="cia-nav:pareto";
/* Lessons Learned link (added 2026-10-16): "cia-lessons:v1" is read only, to list the lessons that name a study. "cia-nav:lessons"
   (sessionStorage) is a one-time navigation hint for the hub overlay. */
var LL_KEY="cia-lessons:v1", LL_NAV="cia-nav:lessons";''')
rep(''' yes:"نعم",no:"لا",langNote:""},''', ''' yes:"نعم",no:"لا",langNote:"",
 llT:"الدروس المستفادة التي تذكر هذه الدراسة (قراءة فقط)",llOpen:"افتح في الدروس المستفادة",llActs:"إجراءات الترسيخ المنفذة {d} من {n}"},''')
rep(''' yes:"Yes",no:"No",langNote:""}''', ''' yes:"Yes",no:"No",langNote:"",
 llT:"Lessons learned that name this study (read-only)",llOpen:"Open in Lessons Learned",llActs:"embedding actions done {d} of {n}"}''')
rep('''<div class="w5-warn" id="rvWarn" role="note" hidden></div>';''', '''<div class="w5-warn" id="rvWarn" role="note" hidden></div><div class="w5-cap" id="llBox" hidden></div>';''')
rep(''' /* review */''', ''' llPanel(r);
 /* review */''')
rep('''/* ---------- study form ---------- */''', '''/* ---------- lessons that name this study (read only; counts of the lesson's own actions, no Lessons rule copied) ---------- */
function llList(id){ var R=recsOf(LL_KEY)||[]; return id?R.filter(function(l){ return (str(l.src)==="fmea"&&str(l.srcId)===id)||arr(l.acts).some(function(a){ return str(a.kind)==="fmea"&&txt(str(a.ref))===id; }); }):[]; }
function llPanel(r){
 var box=document.getElementById("llBox"); if(!box) return;
 var F=llList(r.id);
 if(!r.id || !F.length){ box.hidden=true; box.innerHTML=""; return; }
 box.hidden=false;
 box.innerHTML='<h4>'+esc(t("llT"))+'</h4><ul>'+F.map(function(l){ var id=str(l.id), A=arr(l.acts).filter(function(a){ return txt(str(a.what)); });
  return '<li><b dir="ltr">'+esc(id)+'</b><q>'+esc(short(str(l.title),90))+(A.length?' — '+esc(t("llActs",{d:A.filter(function(a){ return a.st==="done"; }).length,n:A.length})):'')+'</q><button class="pd-rowbtn" type="button" data-llopen="'+esc(id)+'">'+esc(t("llOpen"))+' ↗</button></li>'; }).join("")+'</ul>';
}
function openLl(q){
 if(inHub()){ try{ sessionStorage.setItem(LL_NAV,JSON.stringify(q)); }catch(e){} try{ if(window.parent.ciaOpenFile("lessons.html")) return; }catch(e){} try{ sessionStorage.removeItem(LL_NAV); }catch(e){} }
 try{ window.open("./lessons.html"+(q.open?"?open="+encodeURIComponent(q.open):"")+"#tools","_blank","noopener"); }catch(e){}
}

/* ---------- study form ---------- */''')
rep(''' var od=e.target.closest("[data-odm]");''', ''' var llo=e.target.closest("[data-llopen]"); if(llo){ openLl({open:llo.getAttribute("data-llopen")}); return; }
 var od=e.target.closest("[data-odm]");''')
rep('''window.addEventListener("storage",function(e){ if([PDCA_KEY,CAPA_KEY,PARETO_KEY,FISH_KEY,WHY5_KEY,RCA_KEY,A3_KEY,DM_KEY].indexOf(e.key)>=0){''',
    '''window.addEventListener("storage",function(e){ if([PDCA_KEY,CAPA_KEY,PARETO_KEY,FISH_KEY,WHY5_KEY,RCA_KEY,A3_KEY,DM_KEY,LL_KEY].indexOf(e.key)>=0){''')
open(path, "w", encoding="utf-8").write(s)
print("fmea.html: read-only panel of the lessons that name the study")
