"""Step 2026-10-11 (Pareto): the Fishbone tool reads a request from the Pareto tool, and shows read-only which Pareto analyses send
a category to the analysis open in the form. Run AFTER build_fish.py and build_pareto.py:
    python3 tests/build/patch_fish_pareto.py modules/fishbone.html
What changes in modules/fishbone.html, and nothing else:
  - a new navigation request: "?pareto=ID&cat=CAT" outside the hub, or the existing one-time sessionStorage hint "cia-nav:fishbone"
    holding {pareto, cat} inside it. It fills the effect of a NEW, UNSAVED analysis from that Pareto category (title, reference,
    source, PDCA cycle, area, and the effect: what = the category and its definition, where = the area, when = the period,
    how much = its value and share). Nothing is stored until the user saves, and then as an ordinary Fishbone analysis;
  - a hidden read-only panel under the header fields, shown only when a Pareto analysis in this browser links one of its
    categories to the analysis open in the form, with "Open in Pareto" (the Pareto tool's own "?open=" / "cia-nav:pareto");
  - "cia-pareto:v1" is read only; it is never written here.
Fishbone's storage key, schema, stored state, questions, scoring, example, report and CSV are untouched; with no Pareto data the
page shows exactly what it showed before. The panel reuses the 5 Whys "w5-cap" style already in the page. Every anchor must
match exactly once."""
import sys, os

HERE = os.path.dirname(os.path.abspath(__file__))
path = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, "..", "..", "modules", "fishbone.html")
s = open(path, encoding="utf-8").read()
if 'PARETO_KEY="cia-pareto:v1"' in s:
    print("already linked; nothing to do"); sys.exit(0)


def rep(old, new):
    global s
    n = s.count(old)
    assert n == 1, (n, old[:120])
    s = s.replace(old, new)


rep('''var LKEY="cia-lang", STORE="cia-fish:v1", CAPA_KEY="cia-capa:v1", WHY5_KEY="cia-why5:v1", PDCA_KEY="cia-pdca:v1", NAV_KEY="cia-nav:fishbone", WHY5_NAV="cia-nav:five-whys";''',
    '''var LKEY="cia-lang", STORE="cia-fish:v1", CAPA_KEY="cia-capa:v1", WHY5_KEY="cia-why5:v1", PDCA_KEY="cia-pdca:v1", NAV_KEY="cia-nav:fishbone", WHY5_NAV="cia-nav:five-whys";
/* Pareto link (added 2026-10-11): "cia-pareto:v1" is read only, to fill a new analysis from a Pareto category (?pareto=ID&cat=CAT, or
   {pareto, cat} in this tool's own hint) and to show which Pareto analyses send a category to the analysis open in the form.
   "cia-nav:pareto" (sessionStorage) is the Pareto tool's one-time navigation hint. */
var PARETO_KEY="cia-pareto:v1", PARETO_NAV="cia-nav:pareto";''')
rep(''' rFormHdr:"تحليل عظمة السمكة",yes:"نعم",no:"لا"},''',
    ''' rFormHdr:"تحليل عظمة السمكة",yes:"نعم",no:"لا",
 paFromT:"تحليلات باريتو التي ترسل فئة إلى هذا التحليل (قراءة فقط)",paOpenOne:"افتح في باريتو",paUsed:"عُبّئ نموذج تحليل جديد من الفئة «{c}» في تحليل باريتو {id}. راجع الأثر على الوقائع ثم احفظ. لم يُكتب أي شيء في باريتو.",
 paMuch:"{v} {u} من {t} ({s}%) في تحليل باريتو {id}",pu_count:"بنداً",pu_cost:"ريال",pu_hours:"ساعة",pu_sev:"نقطة"},''')
rep(''' rFormHdr:"Fishbone analysis",yes:"Yes",no:"No"}''',
    ''' rFormHdr:"Fishbone analysis",yes:"Yes",no:"No",
 paFromT:"Pareto analyses that send a category to this analysis (read-only)",paOpenOne:"Open in Pareto",paUsed:"A new analysis form was filled from the category “{c}” of Pareto analysis {id}. Check the effect against the facts, then save. Nothing was written to Pareto.",
 paMuch:"{v} {u} of {t} ({s}%) in Pareto analysis {id}",pu_count:"items",pu_cost:"SAR",pu_hours:"hours",pu_sev:"points"}''')
rep('''      <div class="pd-fields" id="hdrFields"></div>''',
    '''      <div class="pd-fields" id="hdrFields"></div>
      <div class="w5-cap" id="paFrom" hidden></div>''')
rep('''function refreshForm(force){
 var r=formToRec(), raw=formRaw(), st=stageOf(r);''', '''function refreshForm(force){
 var r=formToRec(), raw=formRaw(), st=stageOf(r);
 paFromPanel(r);''')
rep('''/* ---------- start from a CAPA record (read only, preview first) ---------- */''', '''/* ---------- Pareto link (read only): a new analysis from a Pareto category, and the analyses that send one here ---------- */
function paRecs(){ var S=TBX.read(PARETO_KEY), R=S&&Array.isArray(S.records)?S.records:[]; return R.filter(function(r){ return r&&typeof r==="object"&&str(r.id); }); }
function paNum(v){ var n=typeof v==="number"?v:parseFloat(v); return (isFinite(n)&&n>=0)?n:0; }
function prefillFromPareto(pid,cid){
 var p=paRecs().filter(function(r){ return str(r.id)===pid; })[0]; if(!p) return false;
 var C=(Array.isArray(p.cats)?p.cats:[]).filter(function(c){ return c&&typeof c==="object"; }), c=C.filter(function(x){ return str(x.id)===cid; })[0]; if(!c) return false;
 var tot=C.reduce(function(a,x){ return a+paNum(x.v); },0)+paNum(obj(p.other).v), v=paNum(c.v), sh=tot?Math.round(v/tot*1000)/10:0;
 var u=["count","cost","hours","sev"].indexOf(p.unit)>=0?p.unit:"count", n=function(x){ return Number(x).toLocaleString("en-US",{maximumFractionDigits:2}); };
 var r=blank(), src=["ncr","capa","audit","cc","inc","kpi"].indexOf(str(p.src))>=0?str(p.src):"ncr";
 r.title=short(str(c.name)+" — "+str(p.title),120); r.ref=str(p.ref)||str(p.id); r.src=src; r.pdca=str(p.pdca); r.area=str(p.area); r.date=today();
 r.effect.what=str(c.name)+(txt(str(c.def))?": "+str(c.def):""); r.effect.where=str(p.area);
 r.effect.when=(isD(p.from)&&isD(p.to))?str(p.from)+" → "+str(p.to):"";
 r.effect.much=t("paMuch",{v:n(v),u:t("pu_"+u),t:n(tot),s:sh,id:str(p.id)});
 fixRec(r);
 editing=null; recToForm(r);
 go("tools");
 document.getElementById("recOk").textContent=t("paUsed",{id:str(p.id),c:str(c.name)});
 return true;
}
function paFrom(id){
 var out=[]; if(!id) return out;
 paRecs().forEach(function(p){ var hits=(Array.isArray(p.cats)?p.cats:[]).filter(function(c){ var x=obj(c&&c.nx); return c&&typeof c==="object"&&x.how==="fish"&&str(x.ref)===id; }).map(function(c){ return str(c.name); }).filter(Boolean);
  if(hits.length) out.push({id:str(p.id),cats:hits}); });
 return out;
}
function paFromPanel(r){
 var box=document.getElementById("paFrom"); if(!box) return;
 var A=paFrom(r.id); if(!A.length){ box.hidden=true; box.innerHTML=""; return; }
 box.hidden=false;
 box.innerHTML='<h4>'+esc(t("paFromT"))+'</h4><ul>'+A.map(function(a){ return '<li><b dir="ltr">'+esc(a.id)+'</b><q>'+esc(a.cats.join(" · "))+'</q><button class="pd-rowbtn" type="button" data-paopen="'+esc(a.id)+'">'+esc(t("paOpenOne"))+' ↗</button></li>'; }).join("")+'</ul>';
}
function openPareto(q){
 if(inHub()){ try{ sessionStorage.setItem(PARETO_NAV,JSON.stringify(q)); }catch(e){} try{ if(window.parent.ciaOpenFile("pareto.html")) return; }catch(e){} try{ sessionStorage.removeItem(PARETO_NAV); }catch(e){} }
 try{ window.open("./pareto.html"+(q.open?"?open="+encodeURIComponent(q.open):"")+"#tools","_blank","noopener"); }catch(e){}
}

/* ---------- start from a CAPA record (read only, preview first) ---------- */''')
rep(''' if(e.target.closest("[data-pdca]")||e.target.closest("#pdOpen")){ openTool("pdca.html","docs"); return; }''',
    ''' if(e.target.closest("[data-pdca]")||e.target.closest("#pdOpen")){ openTool("pdca.html","docs"); return; }
 var pao=e.target.closest("[data-paopen]"); if(pao){ openPareto({open:pao.getAttribute("data-paopen")}); return; }''')
rep('''window.addEventListener("storage",function(e){ if(e.key===PDCA_KEY||e.key===CAPA_KEY||e.key===WHY5_KEY){''',
    '''window.addEventListener("storage",function(e){ if(e.key===PDCA_KEY||e.key===CAPA_KEY||e.key===WHY5_KEY||e.key===PARETO_KEY){''')
rep(''' var q={}; try{ var u=new URLSearchParams(location.search); if(u.get("open")) q.open=u.get("open"); if(u.get("capa")) q.capa=u.get("capa"); }catch(e){}
 try{ var h=JSON.parse(sessionStorage.getItem(NAV_KEY)||"null"); sessionStorage.removeItem(NAV_KEY); if(h&&typeof h==="object"){ if(h.open) q.open=String(h.open); if(h.capa) q.capa=String(h.capa); } }catch(e){}''',
    ''' var q={}; try{ var u=new URLSearchParams(location.search); if(u.get("open")) q.open=u.get("open"); if(u.get("capa")) q.capa=u.get("capa"); if(u.get("pareto")){ q.pareto=u.get("pareto"); q.cat=u.get("cat")||""; } }catch(e){}
 try{ var h=JSON.parse(sessionStorage.getItem(NAV_KEY)||"null"); sessionStorage.removeItem(NAV_KEY); if(h&&typeof h==="object"){ if(h.open) q.open=String(h.open); if(h.capa) q.capa=String(h.capa); if(h.pareto){ q.pareto=String(h.pareto); q.cat=String(h.cat||""); } } }catch(e){}''')
rep(''' if(q.capa && prefillFromCapa(q.capa)) return;''', ''' if(q.capa && prefillFromCapa(q.capa)) return;
 if(q.pareto && prefillFromPareto(q.pareto,q.cat)) return;''')
open(path, "w", encoding="utf-8").write(s)
print("fishbone.html: reads the Pareto request (?pareto= / hint) and shows the Pareto analyses that send a category here (read-only)")
