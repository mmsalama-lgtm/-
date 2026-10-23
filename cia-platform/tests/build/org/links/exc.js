/*CIA-LINKS {"panel":["str","pdca","a3","dmaic"]}*/
/* EFQM 2025 / KAQA ⟵ the Strategy Studio's KPIs (for the results criteria) and the improvement projects of PDCA, A3 and DMAIC as evidence (read-only).
   KPI status uses the studio's direction rule (higher or lower is better) against its own target; project results are the tools' own fields. */
(function(){
 var L=CIALINK, B=function(en,ar){ return {en:en,ar:ar}; };
 var ME=document.querySelector('script#cia-links-cfg')&&document.querySelector('script#cia-links-cfg').dataset.t||"exc";
 function recs(k){ var i=CIAR.info(k), S=i?CIAR.read(i.key):null; return S&&Array.isArray(S.records)?S.records.filter(function(r){ return r&&typeof r==="object"; }):[]; }
 var RES={met:B("goal met","تحقق الهدف"),part:B("partly met","تحقق جزئياً"),not:B("not met","لم يتحقق")};
 var CFG={id:"cia-lk-exc",tab:"results",
  title:B("Evidence from the strategy and improvement tools","أدلة من أدوات الاستراتيجية والتحسين"),
  sub:B("Strategy Studio KPIs against their targets (results criteria), and finished or running improvement projects from PDCA, A3 and DMAIC. Read-only evidence for the assessment.","مؤشرات استوديو الاستراتيجية مقابل مستهدفاتها (معايير النتائج)، ومشاريع التحسين المكتملة أو الجارية في PDCA وA3 وDMAIC. أدلة للقراءة فقط للتقييم."),
  groups:function(lg){ var out=[], i=CIAR.info("str"), S=i?CIAR.read(i.key):null;
   var K=S&&S.r&&Array.isArray(S.r.kpi)?S.r.kpi:[];
   var ki=K.filter(function(x){ return x&&x.name; }).map(function(x){ var a=+x.act, t=+x.target, ok=isFinite(a)&&isFinite(t)&&x.act!==""&&x.target!=="", met=ok&&(x.dir==="dn"?a<=t:a>=t), h=S.hist&&Array.isArray(S.hist[x.id])?S.hist[x.id]:[];
    return {id:x.id,sev:ok?(met?1:2):2,title:x.name,meta:(lg==="ar"?"الفعلي ":"actual ")+(x.act===""?"—":x.act)+" / "+(lg==="ar"?"المستهدف ":"target ")+(x.target===""?"—":x.target)+(x.unit?" "+L.tx(x.unit,lg):"")+(ok?" · "+(met?(lg==="ar"?"محقق":"met"):(lg==="ar"?"دون المستهدف":"below target")):"")+(h.length?" · "+(lg==="ar"?"فترات القياس ":"periods ")+h.length:"")}; });
   if(ki.length) out.push({code:i.code,name:i.n,file:i.file,tab:"kpi",items:ki});
   var P=[];
   recs("pdca").forEach(function(r){ if(!r.title) return; var d=(r.act||{}).decision; P.push({k:"pdca",id:r.id,sev:1,title:r.title,meta:"PDCA · "+(d==="close"?(lg==="ar"?"أُغلقت الدورة":"cycle closed"):(lg==="ar"?"جارية":"running"))+(r.owner?" · "+r.owner:"")}); });
   recs("a3").forEach(function(r){ if(!r.title) return; var f=r.fu||{}; P.push({k:"a3",id:r.id,sev:1,title:r.title,meta:"A3 · "+(RES[f.res]?L.tx(RES[f.res],lg):(lg==="ar"?"جارية":"running"))+(r.owner?" · "+r.owner:"")}); });
   recs("dmaic").forEach(function(r){ if(!r.title) return; var c=r.ctl||{}; P.push({k:"dmaic",id:r.id,sev:1,title:r.title,meta:"DMAIC · "+(RES[c.res]?L.tx(RES[c.res],lg):(lg==="ar"?"جارٍ":"running"))+(r.lead?" · "+r.lead:"")}); });
   if(P.length) out.push({code:"PDCA · A3 · DMAIC",name:B("Improvement projects","مشاريع التحسين"),items:P.map(function(p){ var ii=CIAR.info(p.k); p.acts=[{label:B("Open","افتح"),run:function(){ L.openTool(ii.file,"tools",{open:p.id}); }}]; return p; })});
   return out; }};
 L.panel(CFG);
})();
