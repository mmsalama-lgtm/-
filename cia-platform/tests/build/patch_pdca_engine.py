"""Step 2026-10-11: put the shared toolbox engine into modules/pdca.html without changing what PDCA does.
The engine block (tests/build/engine.js) is inserted at the top of PDCA's host script, and PDCA's generic helpers
become one-line calls into it. Every anchor must match exactly once. Run on the 2026-10-10 pdca.html:
    python3 tests/build/patch_pdca_engine.py modules/pdca.html
The regression check (tests/capa/test_capa.py, part "engine") proves the output is identical: same stored state,
same report HTML and CSV, same text on every tab."""
import sys, os

HERE = os.path.dirname(os.path.abspath(__file__))
path = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, "..", "..", "modules", "pdca.html")
s = open(path, encoding="utf-8").read()
ENGINE = open(os.path.join(HERE, "engine.js"), encoding="utf-8").read()
if "/* CIA toolbox engine v1 — start */" in s:
    print("pdca.html already carries the engine; nothing to do"); sys.exit(0)


def rep(old, new):
    global s
    n = s.count(old)
    assert n == 1, (n, old[:90])
    s = s.replace(old, new)


# ---- generic helpers become calls into the engine (same results) ----
rep('''function esc(s){ return String(s==null?"":s).replace(/[&<>"']/g,function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]; }); }
function today(){ return new Date().toISOString().slice(0,10); }
function load(){ try{ var v=JSON.parse(localStorage.getItem(STORE)||"null"); if(!v||typeof v!=="object") v={}; if(!Array.isArray(v.records)) v.records=[]; v.records=v.records.filter(function(r){ return r&&typeof r==="object"; }); v.records.forEach(fixRec); if(!v.assess||typeof v.assess!=="object") v.assess={}; return v; }catch(e){ return {records:[],assess:{}}; } }''',
'''function esc(s){ return TBX.esc(s); }
function today(){ return TBX.today(); }
function load(){ return TBX.load(STORE,function(v){ if(!Array.isArray(v.records)) v.records=[]; v.records=v.records.filter(function(r){ return r&&typeof r==="object"; }); v.records.forEach(fixRec); if(!v.assess||typeof v.assess!=="object") v.assess={}; return v; },function(){ return {records:[],assess:{}}; }); }''')
rep('''function persist(){ try{ localStorage.setItem(STORE, JSON.stringify(DB)); return true; }catch(e){ return false; } }''',
    '''function persist(){ return TBX.save(STORE,DB); }''')
rep('''function txt(v){ return String(v||"").trim(); }''', '''function txt(v){ return TBX.txt(v); }''')
rep('''function assessScore(filter){
 var sum=0,n=0;
 AQ.forEach(function(q){ if(filter && AS_STAGE[q[0].slice(0,2)]!==filter) return; n++; var v=DB.assess[q[0]]; if(v!==undefined) sum+=Number(v); });
 return n?Math.round(sum/(2*n)*100):0;
}
function assessAnswered(){ return AQ.filter(function(q){ return DB.assess[q[0]]!==undefined; }).length; }
function bandOf(p){ return p<50?t("band0"):(p<80?t("band1"):t("band2")); }''',
'''function assessScore(filter){ return TBX.score(AQ,DB.assess,filter?function(q){ return AS_STAGE[q[0].slice(0,2)]===filter; }:null); }
function assessAnswered(){ return TBX.answered(AQ,DB.assess); }
function bandOf(p){ return TBX.band(p,[t("band0"),t("band1"),t("band2")]); }''')
rep(''' var pass=0,applic=0,failRec=0,over=0;
 var rows=DB.records.map(function(r){
  var res=auditRecord(r), fails=0;
  var cells=CHECKS.map(function(k){
   var v=res[k];
   if(v===null) return '<td class="c pd-na">—</td>';
   applic++; if(v) pass++; else fails++;
   return '<td class="c '+(v?'pd-pass':'pd-fail')+'">'+(v?'✓':'✗')+'</td>';
  }).join("");
  if(fails) failRec++;
  if(res.time===false) over++;
  return '<tr><td>'+esc(r.title)+'<br><small dir="ltr">'+esc(r.linkRef)+'</small></td>'+cells+'</tr>';
 }).join("");''',
''' var A=TBX.audit(DB.records,auditRecord,CHECKS), pass=A.pass, applic=A.applic, failRec=A.failRec, over=0;
 var rows=A.rows.map(function(x){
  if(x.res.time===false) over++;
  return '<tr><td>'+esc(x.r.title)+'<br><small dir="ltr">'+esc(x.r.linkRef)+'</small></td>'+TBX.cells(x.res,CHECKS)+'</tr>';
 }).join("");''')
rep('''function kpi(v,l){ return '<div class="pd-kpi"><b>'+esc(v)+'</b><span>'+esc(l)+'</span></div>'; }
function auditSummary(){
 var pass=0,applic=0;
 DB.records.forEach(function(r){ var res=auditRecord(r); CHECKS.forEach(function(k){ if(res[k]===null) return; applic++; if(res[k]) pass++; }); });
 return {pass:pass,applic:applic,rate:applic?Math.round(pass/applic*100):null};
}''',
'''function kpi(v,l){ return TBX.kpi(v,l); }
function auditSummary(){ var A=TBX.audit(DB.records,auditRecord,CHECKS); return {pass:A.pass,applic:A.applic,rate:A.rate}; }''')
rep(''' else sb.innerHTML=STAGES.map(function(s){ var c=DB.records.filter(function(r){ return stageOf(r)===s; }).length; var p=Math.round(c/n*100); return bar(stageName(s),c,p,SCOL[s]); }).join("");''',
    ''' else sb.innerHTML=TBX.dist(STAGES,n,function(s){ return DB.records.filter(function(r){ return stageOf(r)===s; }).length; },stageName,function(s){ return SCOL[s]; });''')
rep(''' else lb.innerHTML=["project","process","audit","ncr","other"].map(function(k){ var c=DB.records.filter(function(r){ return r.linkType===k; }).length; var p=Math.round(c/n*100); return bar(t("lt_"+k),c,p,"#3563C9"); }).join("");''',
    ''' else lb.innerHTML=TBX.dist(["project","process","audit","ncr","other"],n,function(k){ return DB.records.filter(function(r){ return r.linkType===k; }).length; },function(k){ return t("lt_"+k); },function(){ return "#3563C9"; });''')
rep('''function bar(label,v,pct,col){
 return '<div class="pd-bar" style="--fc:'+col+'"><span class="lbl">'+esc(label)+'</span><div class="track" role="img" aria-label="'+esc(label+": "+pct+"%")+'"><div class="fill" style="width:'+pct+'%"></div></div><span class="v">'+esc(v)+'</span></div>';
}''', '''function bar(label,v,pct,col){ return TBX.bar(label,v,pct,col); }''')
rep('''function csvCell(v){ var s=String(v==null?"":v); return '"'+s.replace(/"/g,'""')+'"'; }''', '''function csvCell(v){ return TBX.csvCell(v); }''')
rep(''' var rows=DB.records.map(function(r){ return [r.id,r.title,r.linkType,r.linkRef,r.owner,r.start,r.due,stageOf(r),r.plan.baseline,r.plan.target,r.check.result,r.check.targetMet,r.act.decision,r.do.evidence,r.act.lessons].map(csvCell).join(","); });
 return "﻿"+head.join(",")+"\\n"+rows.join("\\n")+"\\n";''',
    ''' return TBX.csv(head,DB.records.map(function(r){ return [r.id,r.title,r.linkType,r.linkRef,r.owner,r.start,r.due,stageOf(r),r.plan.baseline,r.plan.target,r.check.result,r.check.targetMet,r.act.decision,r.do.evidence,r.act.lessons]; }));''')
# report: the CSS string moves into the engine frame (identical text)
i = s.find(" var css='body{font-family:")
j = s.find("';\n", i)
assert i > 0 and j > i and s.count(" var css='body{font-family:") == 1
css = s[i + len(" var css='"):j]
assert css in ENGINE, "report CSS differs from the engine copy"
s = s[:i] + s[j + 3:]
rep(''' return '<!DOCTYPE html><html lang="'+L+'" dir="'+(L==="ar"?"rtl":"ltr")+'"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>PDCA Report — مدثر سلامه</title><style>'+css+'</style></head><body>'+''',
    ''' return TBX.reportDoc(L,'PDCA Report — مدثر سلامه',''')
rep(''' '<footer>Prepared by / أعدّه: مدثر سلامه · Source / المرجع: ISO 9001:2026 clauses 0.3.2 and 10.2 (paraphrased) · Examples are illustrative.</footer></body></html>';''',
    ''' '<footer>Prepared by / أعدّه: مدثر سلامه · Source / المرجع: ISO 9001:2026 clauses 0.3.2 and 10.2 (paraphrased) · Examples are illustrative.</footer>');''')
rep('''function download(name,type,content){
 var blob=new Blob([content],{type:type});
 var url=URL.createObjectURL(blob);
 var a=document.createElement("a"); a.href=url; a.download=name; document.body.appendChild(a); a.click();
 setTimeout(function(){ URL.revokeObjectURL(url); a.remove(); },0);
}''', '''function download(name,type,content){ TBX.download(name,type,content); }''')
rep(''' try{ localStorage.removeItem(STORE); }catch(e){}
 clearForm(); renderAll();''', ''' TBX.drop(STORE);
 clearForm(); renderAll();''')
# ---- the engine block itself, at the top of the host script ----
rep('''/* ===== PDCA tool — host logic. Records and assessment are stored in this browser only (localStorage, wrapped in try/catch). ===== */
''', '''/* ===== PDCA tool — host logic. Records and assessment are stored in this browser only (localStorage, wrapped in try/catch). ===== */
''' + ENGINE)
open(path, "w", encoding="utf-8").write(s)
print("pdca.html: engine block added, helpers now call it;", len(s.encode()), "bytes")
