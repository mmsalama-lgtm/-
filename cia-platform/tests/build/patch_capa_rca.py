"""Step 2026-10-15 (Root Cause Analysis): CAPA lists, read-only, the RCA investigations that name a record.
Run AFTER build_capa.py, patch_capa_why5.py and patch_capa_fish.py:   python3 tests/build/patch_capa_rca.py modules/capa.html
What changes in modules/capa.html, and nothing else:
  - in the cause analysis section, under the 5 Whys and Fishbone panels (which stay exactly as they are), a third panel listing the
    RCA investigations whose CAPA field names this record (read from "cia-rca:v1", never written), each with its root causes that
    are not ruled out, "Open in RCA" and "Use this root cause". The latter copies the root cause text (several root causes joined in
    one line) into this record's own field in the form; it is stored only when the user saves the record. The panel stays hidden
    and empty when no investigation names the record, so with no RCA data every tab shows exactly what it showed before;
  - opening an investigation: outside the hub a new tab with ?open=; inside the hub a one-time sessionStorage hint "cia-nav:rca"
    that the RCA tool reads and removes (navigation only, no tool data), then parent.ciaOpenFile.
The panel reuses the 5 Whys panel's style (w5-cap), so no style is added. CAPA's storage key, schema, stored state, questions,
scoring, example, report, CSV, audit and Explain Kit data are untouched. Every anchor must match exactly once."""
import sys, os

HERE = os.path.dirname(os.path.abspath(__file__))
path = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, "..", "..", "modules", "capa.html")
s = open(path, encoding="utf-8").read()
if 'RCA_KEY="cia-rca:v1"' in s:
    print("already linked; nothing to do"); sys.exit(0)
assert 'FISH_KEY="cia-fish:v1"' in s, "run patch_capa_fish.py first"


def rep(old, new):
    global s
    n = s.count(old)
    assert n == 1, (n, old[:120])
    s = s.replace(old, new)


# 1. key (read only) and the navigation hint
rep('''var FISH_KEY="cia-fish:v1", FISH_NAV="cia-nav:fishbone";''',
    '''var FISH_KEY="cia-fish:v1", FISH_NAV="cia-nav:fishbone";
/* RCA link (added 2026-10-15): "cia-rca:v1" is read only, to list the investigations that name a record and to copy their root
   causes into this form when the user asks. "cia-nav:rca" (sessionStorage) is a one-time navigation hint for the hub overlay. */
var RCA_KEY="cia-rca:v1", RCA_NAV="cia-nav:rca";''')
# 2. wording
rep(''' fbOpenOne:"افتح في عظمة السمكة",fbCopied:"نُسخ السبب الجذري من {id} إلى حقل «السبب الجذري». احفظ السجل لتثبيته."},''',
    ''' fbOpenOne:"افتح في عظمة السمكة",fbCopied:"نُسخ السبب الجذري من {id} إلى حقل «السبب الجذري». احفظ السجل لتثبيته.",
 rcT:"تحقيقات تحليل السبب الجذري لهذا السجل (قراءة فقط)",rcOpenOne:"افتح في RCA",rcRoots:"{ok} من {n} سبب جذري مؤكد ومختبر",rcNoRoot:"لم يُكتب سبب جذري بعد",rcCopied:"نُسخ السبب الجذري من التحقيق {id} إلى حقل «السبب الجذري». احفظ السجل لتثبيته."},''')
rep(''' fbOpenOne:"Open in Fishbone",fbCopied:"The root cause from {id} was copied into the “Root cause” field. Save the record to keep it."}''',
    ''' fbOpenOne:"Open in Fishbone",fbCopied:"The root cause from {id} was copied into the “Root cause” field. Save the record to keep it.",
 rcT:"Root cause investigations for this record (read-only)",rcOpenOne:"Open in RCA",rcRoots:"{ok} of {n} root cause(s) confirmed and tested",rcNoRoot:"No root cause written yet",rcCopied:"The root cause from investigation {id} was copied into the “Root cause” field. Save the record to keep it."}''')
# 3. the panel under the Fishbone panel
rep('''  if(s.k==="cause") h+='<div class="w5-cap" id="fbBox" hidden></div>';''',
    '''  if(s.k==="cause") h+='<div class="w5-cap" id="fbBox" hidden></div>';
  if(s.k==="cause") h+='<div class="w5-cap" id="rcBox" hidden></div>';''')
rep(''' w5Panel(r); fbPanel(r);''', ''' w5Panel(r); fbPanel(r); rcPanel(r);''')
rep('''function openFish(q){''', '''/* ---------- RCA investigations that name this record (read only) ---------- */
function rcList(id){ var S=TBX.read(RCA_KEY), R=S&&Array.isArray(S.records)?S.records:[]; return id?R.filter(function(x){ return x&&typeof x==="object"&&str(x.capa)===id; }):[]; }
function rcRoots(a){ return (Array.isArray(a.causes)?a.causes:[]).filter(function(c){ return c&&typeof c==="object"&&c.lvl==="root"&&c.st!=="out"&&txt(str(c.t)); }); }
function rcRootText(a){ return rcRoots(a).map(function(c){ return txt(str(c.t)); }).join(L==="ar"?"؛ ":"; "); }
function rcPanel(r){
 var box=document.getElementById("rcBox"); if(!box) return;
 var A=rcList(r.id);
 if(!r.id || !A.length){ box.hidden=true; box.innerHTML=""; return; }
 box.hidden=false;
 box.innerHTML='<h4>'+esc(t("rcT"))+'</h4><ul>'+A.map(function(a){ var id=str(a.id), R=rcRoots(a), root=rcRootText(a), ok=R.filter(function(c){ return c.st==="conf"&&txt(str(c.ev))&&(c.test==="yes"||c.test==="part"); }).length;
  return '<li><b dir="ltr">'+esc(id)+'</b><q>'+esc(root||t("rcNoRoot"))+(R.length?' ('+esc(t("rcRoots",{ok:ok,n:R.length}))+')':'')+'</q><button class="pd-rowbtn" type="button" data-rcopen="'+esc(id)+'">'+esc(t("rcOpenOne"))+' ↗</button>'+(root?'<button class="pd-rowbtn" type="button" data-rcuse="'+esc(id)+'">'+esc(t("w5Use"))+'</button>':'')+'</li>'; }).join("")+'</ul>';
}
function openRca(q){
 if(inHub()){ try{ sessionStorage.setItem(RCA_NAV,JSON.stringify(q)); }catch(e){} try{ if(window.parent.ciaOpenFile("rca.html")) return; }catch(e){} try{ sessionStorage.removeItem(RCA_NAV); }catch(e){} }
 try{ window.open("./rca.html"+(q.open?"?open="+encodeURIComponent(q.open):"")+"#tools","_blank","noopener"); }catch(e){}
}
function openFish(q){''')
rep('''  if(fa&&fr2){ fr2.value=str(fa.root); refreshForm(); document.getElementById("recErr").textContent=""; document.getElementById("recOk").textContent=t("fbCopied",{id:str(fa.id)}); fr2.focus(); } return; }''',
    '''  if(fa&&fr2){ fr2.value=str(fa.root); refreshForm(); document.getElementById("recErr").textContent=""; document.getElementById("recOk").textContent=t("fbCopied",{id:str(fa.id)}); fr2.focus(); } return; }
 var ro=e.target.closest("[data-rcopen]"); if(ro){ openRca({open:ro.getAttribute("data-rcopen")}); return; }
 var ru=e.target.closest("[data-rcuse]"); if(ru){ var ra=rcList(document.getElementById("rid").value).filter(function(a){ return str(a.id)===ru.getAttribute("data-rcuse"); })[0], fr3=document.getElementById("f-root");
  if(ra&&fr3){ fr3.value=rcRootText(ra); refreshForm(); document.getElementById("recErr").textContent=""; document.getElementById("recOk").textContent=t("rcCopied",{id:str(ra.id)}); fr3.focus(); } return; }''')
rep('''window.addEventListener("storage",function(e){ if(e.key===PDCA_KEY||e.key===AUD_KEY||e.key===WHY5_KEY||e.key===FISH_KEY){''',
    '''window.addEventListener("storage",function(e){ if(e.key===PDCA_KEY||e.key===AUD_KEY||e.key===WHY5_KEY||e.key===FISH_KEY||e.key===RCA_KEY){''')
open(path, "w", encoding="utf-8").write(s)
print("capa.html: read-only RCA investigations panel with 'Use this root cause'")
