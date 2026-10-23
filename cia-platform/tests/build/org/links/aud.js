/*CIA-LINKS {"panel":["iso9001","iso14001","iso45001","iso27001","iso22301","iso37301","iso37001","iso31000","iso37000"]}*/
/* Smart Audit ⟵ the ISO toolkits' checklists as audit criteria (read-only): what each toolkit's checklist found, clause by clause.
   The organization, its sites and departments come from the organization profile (the shared kit fills the profile tab on request). */
(function(){
 var L=CIALINK, B=function(en,ar){ return {en:en,ar:ar}; };
 var ISO=["iso9001","iso14001","iso45001","iso27001","iso22301","iso37301","iso37001","iso31000","iso37000"];
 try{ CIAR.loadLabels("../assets/cia-labels.json").then(L.sweep); }catch(e){}
 var CFG={id:"cia-lk-aud",tab:"clist",
  title:B("Audit criteria from the ISO toolkits' checklists","معايير التدقيق من قوائم تدقيق أدوات الأيزو"),
  sub:B("Each toolkit's checklist verdicts, read-only: use them as criteria and starting points when you build this audit's checklist. Findings are raised here, in the audit, not copied.","نتائج قائمة التدقيق في كل أداة، للقراءة فقط: استخدمها معاييرَ ونقاطَ بداية عند بناء قائمة هذا التدقيق. الملاحظات تُسجل هنا في التدقيق ولا تُنسخ."),
  groups:function(lg){ var out=[];
   ISO.forEach(function(k){ var i=CIAR.info(k), S=i?CIAR.read(i.key):null, r=CIAR.isoReady(k,S); if(!r||!r.assessed) return; var c=r.ck;
    var I=CIAR.items(k).filter(function(x){ return x.kind==="ncr"||x.kind==="ofi"; });
    out.push({code:i.code,name:i.n,file:i.file,tab:"checklist",
     head:L.esc(lg==="ar"?"بنود مقيّمة "+r.assessed+": مطابقة "+c.C+" · ثانوية "+c.m+" · رئيسية "+c.M+" · فرص تحسين "+c.O:r.assessed+" clauses assessed: "+c.C+" conforming · "+c.m+" minor · "+c.M+" major · "+c.O+" OFI"),
     items:I.map(function(x){ return {id:x.cl,sev:x.sev,title:CIAR.lab(x,"title",lg),meta:CIAR.lab(x,"sug",lg)+(CIAR.lab(x,"det",lg)?" — "+CIAR.lab(x,"det",lg):""),
      acts:[{label:B("Open in the toolkit","افتح في الأداة"),run:function(){ L.openTool(i.file,"checklist"); }}]}; }).concat(I.length?[]:[{id:"✓",sev:1,title:B("No nonconformity recorded in the checklist","لا عدم مطابقة مسجل في قائمة التدقيق"),acts:[]}])}); });
   return out; }};
 L.panel(CFG);
})();
