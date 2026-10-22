"""Step 2026-10-16 (A3 problem solving): RCA lists, read-only, the A3s that name an investigation.
Run AFTER build_rca.py:   python3 tests/build/patch_rca_a3.py modules/rca.html
What changes in modules/rca.html, and nothing else:
  - in the actions section, under the CAPA hint, a hidden panel listing the A3s whose RCA field, or one of whose root causes, names
    the investigation open in the form (read from "cia-a3:v1", never written), each with its stage and result and "Open in A3".
    The panel stays hidden and empty when no A3 names the investigation, so with no A3 data every tab shows exactly what it showed
    before;
  - opening an A3: outside the hub a new tab with ?open=; inside the hub a one-time sessionStorage hint "cia-nav:a3" that the A3
    tool reads and removes (navigation only, no tool data), then parent.ciaOpenFile.
The panel reuses the 5 Whys panel's style (w5-cap), so no style is added. RCA's storage key, schema, stored state, questions,
scoring, example, report, CSV, audit and Explain Kit data are untouched. Every anchor must match exactly once."""
import sys, os

HERE = os.path.dirname(os.path.abspath(__file__))
path = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, "..", "..", "modules", "rca.html")
s = open(path, encoding="utf-8").read()
if 'A3_KEY="cia-a3:v1"' in s:
    print("already linked; nothing to do"); sys.exit(0)


def rep(old, new):
    global s
    n = s.count(old)
    assert n == 1, (n, old[:120])
    s = s.replace(old, new)


rep('''    NAV_KEY="cia-nav:rca", FISH_NAV="cia-nav:fishbone", WHY5_NAV="cia-nav:five-whys", PARETO_NAV="cia-nav:pareto";''',
    '''    NAV_KEY="cia-nav:rca", FISH_NAV="cia-nav:fishbone", WHY5_NAV="cia-nav:five-whys", PARETO_NAV="cia-nav:pareto";
/* A3 link (added 2026-10-16): "cia-a3:v1" is read only, to list the A3s that name an investigation. "cia-nav:a3" (sessionStorage) is
   a one-time navigation hint for the hub overlay. */
var A3_KEY="cia-a3:v1", A3_NAV="cia-nav:a3";''')
rep(''' revW:"المراجِع من أعضاء الفريق. اختر شخصاً من خارجه.",yes:"نعم",no:"لا",scoreS:"الدرجة"},''',
    ''' revW:"المراجِع من أعضاء الفريق. اختر شخصاً من خارجه.",yes:"نعم",no:"لا",scoreS:"الدرجة",
 a3T:"صفحات A3 التي تذكر هذا التحقيق (قراءة فقط)",a3Open:"افتح في A3",a3Goal:"الهدف: {g}",a3St:"المرحلة: {s}",a3Res_met:"تحقق الهدف",a3Res_part:"تحقق جزئياً",a3Res_not:"لم يتحقق",a3Res_:"لم يُتحقق بعد"},''')
rep(''' revW:"The reviewer is a team member. Choose someone from outside the team.",yes:"Yes",no:"No",scoreS:"Score"}''',
    ''' revW:"The reviewer is a team member. Choose someone from outside the team.",yes:"Yes",no:"No",scoreS:"Score",
 a3T:"A3s that name this investigation (read-only)",a3Open:"Open in A3",a3Goal:"Goal: {g}",a3St:"Stage: {s}",a3Res_met:"Goal met",a3Res_part:"Partly met",a3Res_not:"Not met",a3Res_:"Not checked yet"}''')
rep('''<p class="ca-hint" id="acCapaN" hidden></p>')+''', '''<p class="ca-hint" id="acCapaN" hidden></p><div class="w5-cap" id="a3Box" hidden></div>')+''')
rep(''' var an=document.getElementById("acCapaN"); an.hidden=!!txt(r.capa)||!r.acts.length; an.textContent=an.hidden?"":t("acCapaN");''',
    ''' var an=document.getElementById("acCapaN"); an.hidden=!!txt(r.capa)||!r.acts.length; an.textContent=an.hidden?"":t("acCapaN");
 a3Panel(r);''')
rep('''/* ---------- risk grid ---------- */''', '''/* ---------- A3s that name this investigation (read only; the A3 tool's own goal and result fields, no stage rules copied) ---------- */
function a3List(id){ var R=recsOf(A3_KEY)||[]; return id?R.filter(function(a){ return str(a.rca)===id||(Array.isArray(a.causes)&&a.causes.some(function(c){ return c&&c.how==="rca"&&str(c.ref)===id; })); }):[]; }
function a3Panel(r){
 var box=document.getElementById("a3Box"); if(!box) return;
 var A=a3List(r.id);
 if(!r.id || !A.length){ box.hidden=true; box.innerHTML=""; return; }
 box.hidden=false;
 box.innerHTML='<h4>'+esc(t("a3T"))+'</h4><ul>'+A.map(function(a){ var id=str(a.id), g=obj(a.goal), f=obj(a.fu), res=["met","part","not"].indexOf(f.res)>=0?f.res:"";
  var gl=txt(str(g.measure))?short(str(g.measure),60)+" · "+(g.from==null?"—":g.from)+" → "+(g.to==null?"—":g.to)+(isD(g.by)?" · "+g.by:""):"—";
  return '<li><b dir="ltr">'+esc(id)+'</b><q>'+esc(short(str(a.title),90))+' — '+esc(t("a3Goal",{g:gl}))+' · '+esc(t("a3Res_"+res))+'</q><button class="pd-rowbtn" type="button" data-a3open="'+esc(id)+'">'+esc(t("a3Open"))+' ↗</button></li>'; }).join("")+'</ul>';
}
function openA3(q){
 if(inHub()){ try{ sessionStorage.setItem(A3_NAV,JSON.stringify(q)); }catch(e){} try{ if(window.parent.ciaOpenFile("a3.html")) return; }catch(e){} try{ sessionStorage.removeItem(A3_NAV); }catch(e){} }
 try{ window.open("./a3.html"+(q.open?"?open="+encodeURIComponent(q.open):"")+"#tools","_blank","noopener"); }catch(e){}
}

/* ---------- risk grid ---------- */''')
rep(''' var mo=e.target.closest("[data-meopen]");''', ''' var a3o=e.target.closest("[data-a3open]"); if(a3o){ openA3({open:a3o.getAttribute("data-a3open")}); return; }
 var mo=e.target.closest("[data-meopen]");''')
rep('''window.addEventListener("storage",function(e){ if([PDCA_KEY,CAPA_KEY,PARETO_KEY,FISH_KEY,WHY5_KEY].indexOf(e.key)>=0){''',
    '''window.addEventListener("storage",function(e){ if([PDCA_KEY,CAPA_KEY,PARETO_KEY,FISH_KEY,WHY5_KEY,A3_KEY].indexOf(e.key)>=0){''')
open(path, "w", encoding="utf-8").write(s)
print("rca.html: read-only panel of the A3s that name the investigation")
