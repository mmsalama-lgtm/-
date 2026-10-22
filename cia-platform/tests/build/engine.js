/* CIA toolbox engine v1 — start */
/* Shared by the Continual Improvement Toolbox tools (PDCA, CAPA). This block is identical in every tool that carries it;
   tests/capa/test_capa.py compares the copies. It holds only generic parts: the store, assessment scoring, the record
   audit runner, dashboard pieces, CSV and the HTML report frame. Wording, questions and rules stay in each tool.
   Storage: one JSON object per tool key, in this browser only, every access wrapped in try/catch. read() is for other
   tools' keys and never writes. */
var TBX=(function(){
 "use strict";
 function esc(s){ return String(s==null?"":s).replace(/[&<>"']/g,function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]; }); }
 function today(){ return new Date().toISOString().slice(0,10); }
 function txt(v){ return String(v||"").trim(); }
 /* ---- store ---- */
 function load(key,norm,empty){ try{ var v=JSON.parse(localStorage.getItem(key)||"null"); if(!v||typeof v!=="object") v={}; return norm(v); }catch(e){ return empty(); } }
 function save(key,obj){ try{ localStorage.setItem(key, JSON.stringify(obj)); return true; }catch(e){ return false; } }
 function drop(key){ try{ localStorage.removeItem(key); }catch(e){} }
 function read(key){ try{ var v=JSON.parse(localStorage.getItem(key)||"null"); return (v&&typeof v==="object")?v:null; }catch(e){ return null; } }
 /* ---- assessment: questions are [code, {ar,en}], answers 0..2; keep(q) limits the score to a group ---- */
 function score(Q,ans,keep){ var sum=0,n=0; Q.forEach(function(q){ if(keep && !keep(q)) return; n++; var v=ans[q[0]]; if(v!==undefined) sum+=Number(v); }); return n?Math.round(sum/(2*n)*100):0; }
 function answered(Q,ans){ return Q.filter(function(q){ return ans[q[0]]!==undefined; }).length; }
 function band(p,names){ return p<50?names[0]:(p<80?names[1]:names[2]); }
 /* ---- record audit runner: fn(record) returns {check: true | false | null}; null means "does not apply yet" ---- */
 function audit(recs,fn,checks){
  var out={rows:[],pass:0,applic:0,failRec:0};
  recs.forEach(function(r){ var res=fn(r), f=0; checks.forEach(function(k){ var v=res[k]; if(v===null) return; out.applic++; if(v) out.pass++; else f++; }); if(f) out.failRec++; out.rows.push({r:r,res:res,fails:f}); });
  out.rate=out.applic?Math.round(out.pass/out.applic*100):null; return out;
 }
 function cells(res,checks){ return checks.map(function(k){ var v=res[k]; if(v===null) return '<td class="c pd-na">—</td>'; return '<td class="c '+(v?'pd-pass':'pd-fail')+'">'+(v?'✓':'✗')+'</td>'; }).join(""); }
 /* ---- dashboard pieces ---- */
 function kpi(v,l){ return '<div class="pd-kpi"><b>'+esc(v)+'</b><span>'+esc(l)+'</span></div>'; }
 function bar(label,v,pct,col){
  return '<div class="pd-bar" style="--fc:'+col+'"><span class="lbl">'+esc(label)+'</span><div class="track" role="img" aria-label="'+esc(label+": "+pct+"%")+'"><div class="fill" style="width:'+pct+'%"></div></div><span class="v">'+esc(v)+'</span></div>';
 }
 function dist(keys,n,count,label,col){ return keys.map(function(k){ var c=count(k), p=Math.round(c/n*100); return bar(label(k),c,p,col(k)); }).join(""); }
 /* ---- CSV: UTF-8 with a byte-order mark so spreadsheet tools read Arabic ---- */
 function csvCell(v){ var s=String(v==null?"":v); return '"'+s.replace(/"/g,'""')+'"'; }
 function csv(head,rows){ return "﻿"+head.join(",")+"\n"+rows.map(function(r){ return r.map(csvCell).join(","); }).join("\n")+"\n"; }
 function download(name,type,content){
  var blob=new Blob([content],{type:type});
  var url=URL.createObjectURL(blob);
  var a=document.createElement("a"); a.href=url; a.download=name; document.body.appendChild(a); a.click();
  setTimeout(function(){ URL.revokeObjectURL(url); a.remove(); },0);
 }
 /* ---- HTML report frame (same look for every toolbox report) ---- */
 var REPORT_CSS='body{font-family:"IBM Plex Sans Arabic","IBM Plex Sans",Calibri,Tahoma,sans-serif;color:#1B2A4A;max-width:1000px;margin:auto;padding:28px;line-height:1.7;background:#fff}h1{font-family:Georgia,serif;border-bottom:4px solid #B8901E;padding-bottom:8px;margin-bottom:4px}h2{font-family:Georgia,serif;margin-top:28px;color:#1B2A4A}.meta{color:#4B5874;font-size:14px}table{border-collapse:collapse;width:100%;font-size:13.5px;margin-top:8px}th{background:#1B2A4A;color:#fff;text-align:start;padding:8px}td{border-bottom:1px solid #DCE4EE;padding:7px 8px;vertical-align:top}.k{display:flex;gap:10px;flex-wrap:wrap;margin:10px 0}.k div{background:#F3F7FB;border-radius:10px;padding:10px 14px;min-width:120px}.k b{font-size:22px;font-family:Georgia,serif;display:block}footer{margin-top:30px;color:#7A869E;font-size:12.5px;border-top:1px solid #DCE4EE;padding-top:10px}';
 function reportDoc(lang,title,body,extraCss){
  return '<!DOCTYPE html><html lang="'+lang+'" dir="'+(lang==="ar"?"rtl":"ltr")+'"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+title+'</title><style>'+REPORT_CSS+(extraCss||"")+'</style></head><body>'+body+'</body></html>';
 }
 return {version:"1",esc:esc,today:today,txt:txt,load:load,save:save,drop:drop,read:read,score:score,answered:answered,band:band,
  audit:audit,cells:cells,kpi:kpi,bar:bar,dist:dist,csvCell:csvCell,csv:csv,download:download,REPORT_CSS:REPORT_CSS,reportDoc:reportDoc};
})();
/* CIA toolbox engine v1 — end */
