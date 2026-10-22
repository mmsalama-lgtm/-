"""Step 2026-10-11 (Fishbone), optional link: the 5 Whys tool shows, read-only, which Fishbone analyses verify one of their selected
causes with the 5 Whys analysis open in the form. Run AFTER build_why5.py:   python3 tests/build/patch_why5_fish.py modules/five-whys.html
What changes in modules/five-whys.html, and nothing else:
  - a hidden panel under the analysis header fields, shown only when a Fishbone analysis in this browser links a selected cause to
    the analysis open in the form; it lists those analyses and the causes, with "Open in Fishbone";
  - "cia-fish:v1" is read only; "cia-nav:fishbone" (sessionStorage) is the Fishbone tool's one-time navigation hint.
The 5 Whys storage key, schema, stored state, questions, scoring, example, report and CSV are untouched; with no Fishbone data
the page shows exactly what it showed before. The panel reuses the 5 Whys "w5-cap" style. Every anchor must match exactly once."""
import sys, os

HERE = os.path.dirname(os.path.abspath(__file__))
path = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, "..", "..", "modules", "five-whys.html")
s = open(path, encoding="utf-8").read()
if 'FISH_KEY="cia-fish:v1"' in s:
    print("already linked; nothing to do"); sys.exit(0)


def rep(old, new):
    global s
    n = s.count(old)
    assert n == 1, (n, old[:120])
    s = s.replace(old, new)


rep('''var LKEY="cia-lang", STORE="cia-why5:v1", CAPA_KEY="cia-capa:v1", PDCA_KEY="cia-pdca:v1", NAV_KEY="cia-nav:five-whys";''',
    '''var LKEY="cia-lang", STORE="cia-why5:v1", CAPA_KEY="cia-capa:v1", PDCA_KEY="cia-pdca:v1", NAV_KEY="cia-nav:five-whys";
/* Fishbone link (added 2026-10-11): "cia-fish:v1" is read only, to show which Fishbone analyses verify a selected cause with the
   analysis open in the form. "cia-nav:fishbone" (sessionStorage) is the Fishbone tool's one-time navigation hint. */
var FISH_KEY="cia-fish:v1", FISH_NAV="cia-nav:fishbone";''')
rep(''' rFormHdr:"تحليل لماذا الخمس",yes:"نعم",no:"لا"},''',
    ''' rFormHdr:"تحليل لماذا الخمس",yes:"نعم",no:"لا",
 fbFromT:"تحليلات عظمة السمكة التي تتحقق من سبب مختار بهذا التحليل (قراءة فقط)",fbOpenOne:"افتح في عظمة السمكة"},''')
rep(''' rFormHdr:"5 Whys analysis",yes:"Yes",no:"No"}''',
    ''' rFormHdr:"5 Whys analysis",yes:"Yes",no:"No",
 fbFromT:"Fishbone analyses that verify a selected cause with this analysis (read-only)",fbOpenOne:"Open in Fishbone"}''')
rep('''      <div class="pd-fields" id="hdrFields"></div>''',
    '''      <div class="pd-fields" id="hdrFields"></div>
      <div class="w5-cap" id="fbFrom" hidden></div>''')
rep('''function refreshForm(){
 var r=formToRec(), st=stageOf(r), raw=formRaw();''', '''function refreshForm(){
 var r=formToRec(), st=stageOf(r), raw=formRaw();
 fbFromPanel(r);''')
rep('''function validate(r){''', '''/* ---------- Fishbone analyses that verify a selected cause with this analysis (read only) ---------- */
function fbFrom(id){
 var S=TBX.read(FISH_KEY), R=S&&Array.isArray(S.records)?S.records:[], out=[]; if(!id) return out;
 R.forEach(function(f){ if(!f||typeof f!=="object") return; var hits=[];
  (Array.isArray(f.bones)?f.bones:[]).forEach(function(b){ (b&&Array.isArray(b.causes)?b.causes:[]).forEach(function(c){ if(!c||typeof c!=="object") return;
   [c].concat(Array.isArray(c.subs)?c.subs:[]).forEach(function(x){ var v=obj(x&&x.ver); if(x&&x.sel===true&&x.st!=="out"&&v.how==="why5"&&str(v.w5)===id&&txt(str(x.t))) hits.push(str(x.t)); }); }); });
  if(hits.length) out.push({id:str(f.id),causes:hits}); });
 return out;
}
function fbFromPanel(r){
 var box=document.getElementById("fbFrom"); if(!box) return;
 var A=fbFrom(r.id); if(!A.length){ box.hidden=true; box.innerHTML=""; return; }
 box.hidden=false;
 box.innerHTML='<h4>'+esc(t("fbFromT"))+'</h4><ul>'+A.map(function(a){ return '<li><b dir="ltr">'+esc(a.id)+'</b><q>'+esc(a.causes.join(" · "))+'</q><button class="pd-rowbtn" type="button" data-fbopen="'+esc(a.id)+'">'+esc(t("fbOpenOne"))+' ↗</button></li>'; }).join("")+'</ul>';
}
function openFish(q){
 if(inHub()){ try{ sessionStorage.setItem(FISH_NAV,JSON.stringify(q)); }catch(e){} try{ if(window.parent.ciaOpenFile("fishbone.html")) return; }catch(e){} try{ sessionStorage.removeItem(FISH_NAV); }catch(e){} }
 try{ window.open("./fishbone.html"+(q.open?"?open="+encodeURIComponent(q.open):"")+"#tools","_blank","noopener"); }catch(e){}
}
function validate(r){''')
rep(''' if(e.target.closest("[data-pdca]")||e.target.closest("#pdOpen")){ openTool("pdca.html","docs"); return; }''',
    ''' if(e.target.closest("[data-pdca]")||e.target.closest("#pdOpen")){ openTool("pdca.html","docs"); return; }
 var fbo=e.target.closest("[data-fbopen]"); if(fbo){ openFish({open:fbo.getAttribute("data-fbopen")}); return; }''')
rep('''window.addEventListener("storage",function(e){ if(e.key===PDCA_KEY||e.key===CAPA_KEY){''',
    '''window.addEventListener("storage",function(e){ if(e.key===PDCA_KEY||e.key===CAPA_KEY||e.key===FISH_KEY){''')
open(path, "w", encoding="utf-8").write(s)
print("five-whys.html: read-only panel of the Fishbone analyses that verify a cause with this analysis")
