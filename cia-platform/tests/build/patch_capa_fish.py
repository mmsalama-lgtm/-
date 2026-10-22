"""Step 2026-10-11 (Fishbone): link CAPA's cause analysis to the Fishbone tool, read-only both ways.
Run AFTER build_capa.py and patch_capa_why5.py:   python3 tests/build/patch_capa_fish.py modules/capa.html
What changes in modules/capa.html, and nothing else:
  - next to the method field, an "Open the Fishbone tool" button, shown only when the method is Fishbone;
  - in the cause analysis section, under the 5 Whys panel (which stays exactly as it is), a second panel listing the Fishbone
    analyses that name this CAPA record (read from "cia-fish:v1", never written), each with "Open in Fishbone" and
    "Use this root cause". The latter copies the root cause text into this record's own field in the form; it is stored only
    when the user saves the record.
Opening a given analysis: outside the hub a new tab with ?open= / ?capa=; inside the hub a one-time sessionStorage hint
"cia-nav:fishbone" that the Fishbone tool reads and removes (navigation only, no tool data), then parent.ciaOpenFile.
The panel and the button reuse the 5 Whys panel's styles (w5-cap, w5-go), so no style is added.
CAPA's storage key, schema, questions, scoring, example, report, CSV and Explain Kit data are untouched. Every anchor must match
exactly once."""
import sys, os

HERE = os.path.dirname(os.path.abspath(__file__))
path = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, "..", "..", "modules", "capa.html")
s = open(path, encoding="utf-8").read()
if 'FISH_KEY="cia-fish:v1"' in s:
    print("already linked; nothing to do"); sys.exit(0)
assert 'WHY5_KEY="cia-why5:v1"' in s, "run patch_capa_why5.py first"


def rep(old, new):
    global s
    n = s.count(old)
    assert n == 1, (n, old[:120])
    s = s.replace(old, new)


# 1. key (read only) and the navigation hint
rep('''var WHY5_KEY="cia-why5:v1", WHY5_NAV="cia-nav:five-whys";''',
    '''var WHY5_KEY="cia-why5:v1", WHY5_NAV="cia-nav:five-whys";
/* Fishbone link (added 2026-10-11): "cia-fish:v1" is read only, to list the analyses that name a record and to copy a root cause
   into this form when the user asks. "cia-nav:fishbone" (sessionStorage) is a one-time navigation hint for the hub overlay. */
var FISH_KEY="cia-fish:v1", FISH_NAV="cia-nav:fishbone";''')
# 2. wording
rep(''' w5NoRoot:"لم يُكتب السبب الجذري بعد",w5OpenOne:"افتح في لماذا الخمس",w5Use:"استخدم هذا السبب الجذري",w5Copied:"نُسخ السبب الجذري من {id} إلى حقل «السبب الجذري». احفظ السجل لتثبيته."},''',
    ''' w5NoRoot:"لم يُكتب السبب الجذري بعد",w5OpenOne:"افتح في لماذا الخمس",w5Use:"استخدم هذا السبب الجذري",w5Copied:"نُسخ السبب الجذري من {id} إلى حقل «السبب الجذري». احفظ السجل لتثبيته.",
 fbOpen:"افتح أداة عظمة السمكة",fbT:"تحليلات عظمة السمكة لهذا السجل (قراءة فقط)",fbNone:"لا يوجد في هذا المتصفح تحليل «عظمة السمكة» يذكر هذا السجل. افتح الأداة لتبدأ تحليلاً منه.",
 fbOpenOne:"افتح في عظمة السمكة",fbCopied:"نُسخ السبب الجذري من {id} إلى حقل «السبب الجذري». احفظ السجل لتثبيته."},''')
rep(''' w5NoRoot:"Root cause not written yet",w5OpenOne:"Open in 5 Whys",w5Use:"Use this root cause",w5Copied:"The root cause from {id} was copied into the “Root cause” field. Save the record to keep it."}''',
    ''' w5NoRoot:"Root cause not written yet",w5OpenOne:"Open in 5 Whys",w5Use:"Use this root cause",w5Copied:"The root cause from {id} was copied into the “Root cause” field. Save the record to keep it.",
 fbOpen:"Open the Fishbone tool",fbT:"Fishbone analyses for this record (read-only)",fbNone:"No Fishbone analysis in this browser names this record. Open the tool to start one from it.",
 fbOpenOne:"Open in Fishbone",fbCopied:"The root cause from {id} was copied into the “Root cause” field. Save the record to keep it."}''')
# 3. button next to the method field, panel under the 5 Whys panel
rep('''<button class="pd-btn ghost w5-go" type="button" id="w5Open" hidden>'+esc(t("w5Open"))+' ↗</button>';''',
    '''<button class="pd-btn ghost w5-go" type="button" id="w5Open" hidden>'+esc(t("w5Open"))+' ↗</button><button class="pd-btn ghost w5-go" type="button" id="fbOpen" hidden>'+esc(t("fbOpen"))+' ↗</button>';''')
rep('''  if(s.k==="cause") h+='<div class="w5-cap" id="w5Box" hidden></div>';''',
    '''  if(s.k==="cause") h+='<div class="w5-cap" id="w5Box" hidden></div>';
  if(s.k==="cause") h+='<div class="w5-cap" id="fbBox" hidden></div>';''')
rep(''' w5Panel(r);''', ''' w5Panel(r); fbPanel(r);''')
rep('''function validate(r){''', '''/* ---------- Fishbone analyses that name this record (read only) ---------- */
function fbList(id){ var S=TBX.read(FISH_KEY), R=S&&Array.isArray(S.records)?S.records:[]; return id?R.filter(function(x){ return x&&typeof x==="object"&&str(x.capa)===id; }):[]; }
function fbPanel(r){
 var btn=document.getElementById("fbOpen"); if(btn) btn.hidden=r.cause.method!=="fish";
 var box=document.getElementById("fbBox"); if(!box) return;
 var A=fbList(r.id);
 if(!r.id || (!A.length && r.cause.method!=="fish")){ box.hidden=true; box.innerHTML=""; return; }
 box.hidden=false;
 box.innerHTML='<h4>'+esc(t("fbT"))+'</h4>'+(A.length?'<ul>'+A.map(function(a){ var id=str(a.id), root=str(a.root);
  return '<li><b dir="ltr">'+esc(id)+'</b><q>'+esc(root||t("w5NoRoot"))+'</q><button class="pd-rowbtn" type="button" data-fbopen="'+esc(id)+'">'+esc(t("fbOpenOne"))+' ↗</button>'+(root?'<button class="pd-rowbtn" type="button" data-fbuse="'+esc(id)+'">'+esc(t("w5Use"))+'</button>':'')+'</li>'; }).join("")+'</ul>':'<p class="ca-hint" style="margin:0">'+esc(t("fbNone"))+'</p>');
}
function openFish(q){
 if(inHub()){ try{ sessionStorage.setItem(FISH_NAV,JSON.stringify(q)); }catch(e){} try{ if(window.parent.ciaOpenFile("fishbone.html")) return; }catch(e){} try{ sessionStorage.removeItem(FISH_NAV); }catch(e){} }
 var p=q.open?"?open="+encodeURIComponent(q.open):(q.capa?"?capa="+encodeURIComponent(q.capa):"");
 try{ window.open("./fishbone.html"+p+"#tools","_blank","noopener"); }catch(e){}
}
function validate(r){''')
rep('''  if(an&&fr){ fr.value=str(an.root); refreshForm(); document.getElementById("recErr").textContent=""; document.getElementById("recOk").textContent=t("w5Copied",{id:str(an.id)}); fr.focus(); } return; }''',
    '''  if(an&&fr){ fr.value=str(an.root); refreshForm(); document.getElementById("recErr").textContent=""; document.getElementById("recOk").textContent=t("w5Copied",{id:str(an.id)}); fr.focus(); } return; }
 if(e.target.closest("#fbOpen")){ var rid2=document.getElementById("rid").value; openFish(rid2?{capa:rid2}:{}); return; }
 var fo=e.target.closest("[data-fbopen]"); if(fo){ openFish({open:fo.getAttribute("data-fbopen")}); return; }
 var fu=e.target.closest("[data-fbuse]"); if(fu){ var fa=fbList(document.getElementById("rid").value).filter(function(a){ return str(a.id)===fu.getAttribute("data-fbuse"); })[0], fr2=document.getElementById("f-root");
  if(fa&&fr2){ fr2.value=str(fa.root); refreshForm(); document.getElementById("recErr").textContent=""; document.getElementById("recOk").textContent=t("fbCopied",{id:str(fa.id)}); fr2.focus(); } return; }''')
rep('''window.addEventListener("storage",function(e){ if(e.key===PDCA_KEY||e.key===AUD_KEY||e.key===WHY5_KEY){''',
    '''window.addEventListener("storage",function(e){ if(e.key===PDCA_KEY||e.key===AUD_KEY||e.key===WHY5_KEY||e.key===FISH_KEY){''')
open(path, "w", encoding="utf-8").write(s)
print("capa.html: Fishbone button, read-only analyses panel with 'Use this root cause'")
