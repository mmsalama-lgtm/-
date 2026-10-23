/*CIA-LINKS {"panel":["swot","pestle","stakeholders","exc","kaqa"]}*/
/* Strategy & Performance Studio ⟵ SWOT, PESTLE and stakeholder results, and the EFQM / KAQA assessments, as inputs (read-only panel).
   Ranks and key parties are the source tools' own (SWOT rank, PESTLE significance × certainty, stakeholder power or interest ≥ 4). */
(function(){
 var L=CIALINK, B=function(en,ar){ return {en:en,ar:ar}; };
 var Q={s:B("Strength","قوة"),w:B("Weakness","ضعف"),o:B("Opportunity","فرصة"),t:B("Threat","تهديد")};
 function recs(k){ var i=CIAR.info(k), S=i?CIAR.read(i.key):null; return S&&Array.isArray(S.records)?S.records.filter(function(r){ return r&&typeof r==="object"; }):[]; }
 var CFG={id:"cia-lk-str",tab:"swot",
  title:B("Inputs from the analysis and excellence tools","مدخلات من أدوات التحليل والتميّز"),
  sub:B("Top-ranked SWOT items, the most significant PESTLE factors, the key stakeholders, and the EFQM / KAQA strengths and areas for improvement. Read-only: add what you keep to this studio's registers.","أعلى بنود SWOT ترتيباً، وأهم عوامل PESTLE، والأطراف المعنية الرئيسية، ونقاط القوة وفرص التحسين في تقييمَي EFQM وجائزة الملك عبدالعزيز. للقراءة فقط: أضف ما تعتمده إلى سجلات هذا الاستوديو."),
  groups:function(lg){ var out=[], i;
   var sw=[]; recs("swot").forEach(function(r){ (r.items||[]).forEach(function(x){ if(x&&x.t&&(+x.rk||9)<=2) sw.push({id:r.id+"/"+x.id,sev:x.q==="w"||x.q==="t"?2:1,title:x.t,meta:L.tx(Q[x.q]||"",lg)+" · "+(lg==="ar"?"الترتيب ":"rank ")+x.rk+" · "+(r.title||"")}); }); });
   if(sw.length&&(i=CIAR.info("swot"))) out.push({code:i.code,name:i.n,file:i.file,tab:"tools",items:sw});
   var pe=[]; recs("pestle").forEach(function(r){ (r.fac||[]).forEach(function(x){ var sc=(+x.sig||0)*(+x.cer||0); if(x&&x.t&&sc>=12) pe.push({id:r.id+"/"+x.id,sev:sc>=16?3:2,sc:sc,title:x.t,meta:(lg==="ar"?"الأهمية × اليقين = ":"significance × certainty = ")+sc+" · "+(r.title||"")}); }); });
   pe.sort(function(a,b){ return b.sc-a.sc; }); if(pe.length&&(i=CIAR.info("pestle"))) out.push({code:i.code,name:i.n,file:i.file,tab:"tools",items:pe});
   var st=[]; recs("stakeholders").forEach(function(r){ (r.pts||[]).forEach(function(x){ if(x&&x.n&&((+x.pw||0)>=4||(+x.in||0)>=4)) st.push({id:r.id+"/"+x.id,sev:((+x.pw||0)>=4&&(+x.in||0)>=4)?3:2,title:x.n,meta:(lg==="ar"?"القوة ":"power ")+(x.pw||"—")+" · "+(lg==="ar"?"الاهتمام ":"interest ")+(x.in||"—")+" · "+(r.title||"")}); }); });
   if(st.length&&(i=CIAR.info("stakeholders"))) out.push({code:i.code,name:i.n,file:i.file,tab:"tools",items:st});
   ["exc","kaqa"].forEach(function(k){ var i2=CIAR.info(k), S=i2?CIAR.read(i2.key):null; if(!S) return;
    var it=CIAR.strengths(k,S).map(function(x){ return {id:x.cl,sev:1,title:x.t,meta:B("Strength","نقطة قوة")}; })
     .concat(CIAR.items(k,S).map(function(x){ return {id:x.cl,sev:x.sev,title:CIAR.lab(x,"title",lg),meta:B("Area for improvement","فرصة تحسين")}; }));
    if(it.length) out.push({code:i2.code,name:i2.n,file:i2.file,tab:"plan",items:it}); });
   return out; }};
 L.panel(CFG);
})();
