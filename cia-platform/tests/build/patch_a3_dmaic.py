"""Step 2026-10-16 (DMAIC improvement project): A3 lists, read-only, the DMAIC projects that name an A3.
Run AFTER build_a3.py:   python3 tests/build/patch_a3_dmaic.py modules/a3.html
What changes in modules/a3.html, and nothing else:
  - in the follow-up block, under the standardisation warning, a hidden panel listing the DMAIC projects whose A3 field names the A3
    open in the form (read from "cia-dmaic:v1", never written), each with its goal and result and "Open in DMAIC". The panel stays
    hidden and empty when no project names the A3, so with no DMAIC data every tab shows exactly what it showed before;
  - opening a project: outside the hub a new tab with ?open=; inside the hub a one-time sessionStorage hint "cia-nav:dmaic" that the
    DMAIC tool reads and removes (navigation only, no tool data), then parent.ciaOpenFile.
The panel reuses the 5 Whys panel's style (w5-cap), so no style is added. A3's storage key, schema, stored state, questions, scoring,
example, report, CSV, audit and Explain Kit data are untouched. Every anchor must match exactly once."""
import sys, os

HERE = os.path.dirname(os.path.abspath(__file__))
path = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, "..", "..", "modules", "a3.html")
s = open(path, encoding="utf-8").read()
if 'DM_KEY="cia-dmaic:v1"' in s:
    print("already linked; nothing to do"); sys.exit(0)


def rep(old, new):
    global s
    n = s.count(old)
    assert n == 1, (n, old[:120])
    s = s.replace(old, new)


rep('''    NAV_KEY="cia-nav:a3", RCA_NAV="cia-nav:rca", FISH_NAV="cia-nav:fishbone", WHY5_NAV="cia-nav:five-whys", PARETO_NAV="cia-nav:pareto";''',
    '''    NAV_KEY="cia-nav:a3", RCA_NAV="cia-nav:rca", FISH_NAV="cia-nav:fishbone", WHY5_NAV="cia-nav:five-whys", PARETO_NAV="cia-nav:pareto";
/* DMAIC link (added 2026-10-16): "cia-dmaic:v1" is read only, to list the DMAIC projects that name an A3. "cia-nav:dmaic" (sessionStorage)
   is a one-time navigation hint for the hub overlay. */
var DM_KEY="cia-dmaic:v1", DM_NAV="cia-nav:dmaic";''')
rep(''' yes:"نعم",no:"لا"},
en:{brand:''', ''' yes:"نعم",no:"لا",
 dmT:"مشاريع DMAIC التي تذكر هذه الصفحة (قراءة فقط)",dmOpen:"افتح في DMAIC",dmGoal:"الهدف: {g}",dmRes_met:"تحقق الهدف",dmRes_part:"تحقق جزئياً",dmRes_not:"لم يتحقق",dmRes_:"لم يُقس بعد التغيير"},
en:{brand:''')
rep(''' yes:"Yes",no:"No"}
};''', ''' yes:"Yes",no:"No",
 dmT:"DMAIC projects that name this A3 (read-only)",dmOpen:"Open in DMAIC",dmGoal:"Goal: {g}",dmRes_met:"Goal met",dmRes_part:"Partly met",dmRes_not:"Not met",dmRes_:"Not measured after the change yet"}
};''')
rep('''<div class="w5-warn" id="stdWarn" role="note" hidden></div>');''', '''<div class="w5-warn" id="stdWarn" role="note" hidden></div><div class="w5-cap" id="dmBox" hidden></div>');''')
rep(''' /* the A3 page */
 var pgb=document.getElementById("a3Page");''', ''' dmPanel(r);
 /* the A3 page */
 var pgb=document.getElementById("a3Page");''')
rep('''/* ---------- A3 form ---------- */''', '''/* ---------- DMAIC projects that name this A3 (read only; the DMAIC tool's own goal and result fields, no stage rules copied) ---------- */
function dmList(id){ var R=recsOf(DM_KEY)||[]; return id?R.filter(function(d){ return str(d.a3)===id; }):[]; }
function dmPanel(r){
 var box=document.getElementById("dmBox"); if(!box) return;
 var D=dmList(r.id);
 if(!r.id || !D.length){ box.hidden=true; box.innerHTML=""; return; }
 box.hidden=false;
 box.innerHTML='<h4>'+esc(t("dmT"))+'</h4><ul>'+D.map(function(d){ var id=str(d.id), g=obj(d.goal), c=obj(d.ctl), res=["met","part","not"].indexOf(c.res)>=0?c.res:"";
  var gl=txt(str(g.measure))?short(str(g.measure),60)+" · "+(g.from==null?"—":g.from)+" → "+(g.to==null?"—":g.to)+(isD(g.by)?" · "+g.by:""):"—";
  return '<li><b dir="ltr">'+esc(id)+'</b><q>'+esc(short(str(d.title),90))+' — '+esc(t("dmGoal",{g:gl}))+' · '+esc(t("dmRes_"+res))+'</q><button class="pd-rowbtn" type="button" data-dmopen="'+esc(id)+'">'+esc(t("dmOpen"))+' ↗</button></li>'; }).join("")+'</ul>';
}
function openDm(q){
 if(inHub()){ try{ sessionStorage.setItem(DM_NAV,JSON.stringify(q)); }catch(e){} try{ if(window.parent.ciaOpenFile("dmaic.html")) return; }catch(e){} try{ sessionStorage.removeItem(DM_NAV); }catch(e){} }
 try{ window.open("./dmaic.html"+(q.open?"?open="+encodeURIComponent(q.open):"")+"#tools","_blank","noopener"); }catch(e){}
}

/* ---------- A3 form ---------- */''')
rep(''' var oc=e.target.closest("[data-orca]");''', ''' var dmo=e.target.closest("[data-dmopen]"); if(dmo){ openDm({open:dmo.getAttribute("data-dmopen")}); return; }
 var oc=e.target.closest("[data-orca]");''')
rep('''window.addEventListener("storage",function(e){ if([PDCA_KEY,CAPA_KEY,PARETO_KEY,FISH_KEY,WHY5_KEY,RCA_KEY].indexOf(e.key)>=0){''',
    '''window.addEventListener("storage",function(e){ if([PDCA_KEY,CAPA_KEY,PARETO_KEY,FISH_KEY,WHY5_KEY,RCA_KEY,DM_KEY].indexOf(e.key)>=0){''')
open(path, "w", encoding="utf-8").write(s)
print("a3.html: read-only panel of the DMAIC projects that name the A3")
