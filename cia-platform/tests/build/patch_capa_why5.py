"""Step 2026-10-11 (5 Whys): link CAPA's cause analysis to the 5 Whys tool, read-only both ways.
Run AFTER build_capa.py:   python3 tests/build/patch_capa_why5.py modules/capa.html
What changes in modules/capa.html, and nothing else:
  - next to the method field, an "Open the 5 Whys tool" button, shown only when the method is 5 Whys;
  - in the cause analysis section, a panel listing the 5 Whys analyses that name this CAPA record (read from "cia-why5:v1",
    never written), each with "Open in 5 Whys" and "Use this root cause". The latter copies the root cause text into this
    record's own field in the form; it is stored only when the user saves the record;
  - the Explain Kit's related-tools entry for 5 Whys now points to the tool (it said "next tool").
Opening a given analysis: outside the hub a new tab with ?open= / ?capa=; inside the hub a one-time sessionStorage hint
"cia-nav:five-whys" that the 5 Whys tool reads and removes (navigation only, no tool data), then parent.ciaOpenFile.
CAPA's storage key, schema, questions, scoring, example, report and CSV are untouched. Every anchor must match exactly once."""
import sys, os

HERE = os.path.dirname(os.path.abspath(__file__))
path = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, "..", "..", "modules", "capa.html")
s = open(path, encoding="utf-8").read()
if 'WHY5_KEY="cia-why5:v1"' in s:
    print("already linked; nothing to do"); sys.exit(0)


def rep(old, new):
    global s
    n = s.count(old)
    assert n == 1, (n, old[:120])
    s = s.replace(old, new)


# 1. schema note and key (read only)
rep('''var LKEY="cia-lang", STORE="cia-capa:v1", AUD_KEY="audit-center:v1", PDCA_KEY="cia-pdca:v1";''',
    '''var LKEY="cia-lang", STORE="cia-capa:v1", AUD_KEY="audit-center:v1", PDCA_KEY="cia-pdca:v1";
/* 5 Whys link (added 2026-10-11): "cia-why5:v1" is read only, to list the analyses that name a record and to copy a root cause
   into this form when the user asks. "cia-nav:five-whys" (sessionStorage) is a one-time navigation hint for the hub overlay. */
var WHY5_KEY="cia-why5:v1", WHY5_NAV="cia-nav:five-whys";''')
# 2. wording
rep(' rFormHdr:"سجل CAPA"},', ''' rFormHdr:"سجل CAPA",
 w5Open:"افتح أداة لماذا الخمس",w5T:"تحليلات لماذا الخمس لهذا السجل (قراءة فقط)",w5None:"لا يوجد في هذا المتصفح تحليل «لماذا الخمس» يذكر هذا السجل. افتح الأداة لتبدأ تحليلاً منه.",
 w5NoRoot:"لم يُكتب السبب الجذري بعد",w5OpenOne:"افتح في لماذا الخمس",w5Use:"استخدم هذا السبب الجذري",w5Copied:"نُسخ السبب الجذري من {id} إلى حقل «السبب الجذري». احفظ السجل لتثبيته."},''')
rep(' rFormHdr:"CAPA record"}', ''' rFormHdr:"CAPA record",
 w5Open:"Open the 5 Whys tool",w5T:"5 Whys analyses for this record (read-only)",w5None:"No 5 Whys analysis in this browser names this record. Open the tool to start one from it.",
 w5NoRoot:"Root cause not written yet",w5OpenOne:"Open in 5 Whys",w5Use:"Use this root cause",w5Copied:"The root cause from {id} was copied into the “Root cause” field. Save the record to keep it."}''')
# 3. button next to the method field, panel in the cause section
rep('''else if(kind==="sel_method") inner='<select id="'+id+'">'+opts(["why5","fish","other"],"m_")+'</select>';''',
    '''else if(kind==="sel_method") inner='<select id="'+id+'">'+opts(["why5","fish","other"],"m_")+'</select><button class="pd-btn ghost w5-go" type="button" id="w5Open" hidden>'+esc(t("w5Open"))+' ↗</button>';''')
rep('''  if(s.reopen) h+='<div id="reopenBox"></div>';''', '''  if(s.reopen) h+='<div id="reopenBox"></div>';
  if(s.k==="cause") h+='<div class="w5-cap" id="w5Box" hidden></div>';''')
rep('''function refreshForm(){
 var r=formToRec(), st=stageOf(r);''', '''function refreshForm(){
 var r=formToRec(), st=stageOf(r);
 w5Panel(r);''')
rep('''function validate(r){''', '''/* ---------- 5 Whys analyses that name this record (read only) ---------- */
function w5List(id){ var S=TBX.read(WHY5_KEY), R=S&&Array.isArray(S.records)?S.records:[]; return id?R.filter(function(x){ return x&&typeof x==="object"&&str(x.capa)===id; }):[]; }
function w5Panel(r){
 var btn=document.getElementById("w5Open"); if(btn) btn.hidden=r.cause.method!=="why5";
 var box=document.getElementById("w5Box"); if(!box) return;
 var A=w5List(r.id);
 if(!r.id || (!A.length && r.cause.method!=="why5")){ box.hidden=true; box.innerHTML=""; return; }
 box.hidden=false;
 box.innerHTML='<h4>'+esc(t("w5T"))+'</h4>'+(A.length?'<ul>'+A.map(function(a){ var id=str(a.id), root=str(a.root);
  return '<li><b dir="ltr">'+esc(id)+'</b><q>'+esc(root||t("w5NoRoot"))+'</q><button class="pd-rowbtn" type="button" data-w5open="'+esc(id)+'">'+esc(t("w5OpenOne"))+' ↗</button>'+(root?'<button class="pd-rowbtn" type="button" data-w5use="'+esc(id)+'">'+esc(t("w5Use"))+'</button>':'')+'</li>'; }).join("")+'</ul>':'<p class="ca-hint" style="margin:0">'+esc(t("w5None"))+'</p>');
}
function openWhy5(q){
 if(inHub()){ try{ sessionStorage.setItem(WHY5_NAV,JSON.stringify(q)); }catch(e){} try{ if(window.parent.ciaOpenFile("five-whys.html")) return; }catch(e){} try{ sessionStorage.removeItem(WHY5_NAV); }catch(e){} }
 var p=q.open?"?open="+encodeURIComponent(q.open):(q.capa?"?capa="+encodeURIComponent(q.capa):"");
 try{ window.open("./five-whys.html"+p+"#tools","_blank","noopener"); }catch(e){}
}
function validate(r){''')
rep('''if(e.target.closest("#pdOpen")){ openTool("pdca.html","docs"); return; }''', '''if(e.target.closest("#pdOpen")){ openTool("pdca.html","docs"); return; }
 if(e.target.closest("#w5Open")){ var rid=document.getElementById("rid").value; openWhy5(rid?{capa:rid}:{}); return; }
 var wo=e.target.closest("[data-w5open]"); if(wo){ openWhy5({open:wo.getAttribute("data-w5open")}); return; }
 var wu=e.target.closest("[data-w5use]"); if(wu){ var an=w5List(document.getElementById("rid").value).filter(function(a){ return str(a.id)===wu.getAttribute("data-w5use"); })[0], fr=document.getElementById("f-root");
  if(an&&fr){ fr.value=str(an.root); refreshForm(); document.getElementById("recErr").textContent=""; document.getElementById("recOk").textContent=t("w5Copied",{id:str(an.id)}); fr.focus(); } return; }''')
rep('''window.addEventListener("storage",function(e){ if(e.key===PDCA_KEY||e.key===AUD_KEY){''',
    '''window.addEventListener("storage",function(e){ if(e.key===PDCA_KEY||e.key===AUD_KEY||e.key===WHY5_KEY){''')
# 4. styles (same look as the 5 Whys tool's own panel)
rep('''@media (max-width:560px){.ca-pd{flex-wrap:wrap}.ca-pd .pd-btn{width:100%}}''', '''@media (max-width:560px){.ca-pd{flex-wrap:wrap}.ca-pd .pd-btn{width:100%}}
/* 5 Whys link (2026-10-11) */
.w5-go{margin-top:8px;padding:7px 14px;font-size:13.5px}
.w5-go[hidden]{display:none}
.w5-cap{margin-top:10px;border:1px dashed var(--line);border-radius:var(--radius);padding:10px 12px;background:#fff}
.w5-cap[hidden]{display:none}
.w5-cap h4{margin:0 0 6px;font-size:14px}
.w5-cap ul{margin:0;padding:0;list-style:none}
.w5-cap li{display:flex;flex-wrap:wrap;gap:6px;align-items:center;border-bottom:1px solid var(--line);padding:6px 0;font-size:13.5px}
.w5-cap li:last-child{border-bottom:0}
.w5-cap li q{flex:1 1 220px;quotes:none;color:var(--ink)}''')
# 5. Explain Kit: the related-tools entry now points to the live tool
rep('''     "ar": "أداة الصندوق التالية. ستُربط بقسم تحليل السبب في هذه الأداة.",
     "en": "The next toolbox tool. It will connect to the cause analysis section of this tool."
    },
    "tool": ""''', '''     "ar": "تبدأ التحليل من سجل CAPA وتعيد السبب الجذري إليه؛ ويعرض قسم تحليل السبب هنا التحليلات التي تذكر السجل.",
     "en": "Starts the analysis from a CAPA record and sends the root cause back to it; the cause analysis section here lists the analyses that name the record."
    },
    "tool": "./five-whys.html"''')
open(path, "w", encoding="utf-8").write(s)
print("capa.html: 5 Whys button, read-only analyses panel with 'Use this root cause', related-tools entry")
