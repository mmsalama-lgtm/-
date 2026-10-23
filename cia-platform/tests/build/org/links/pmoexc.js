/*CIA-LINKS {"panel":["lessons"]}*/
/* PMO Excellence ⟵ the Lessons Learned register (project lessons as evidence, read-only). A lesson counts as verified when the register holds a
   verification result for it (the register's own field). */
(function(){
 var L=CIALINK, B=function(en,ar){ return {en:en,ar:ar}; };
 var CFG={id:"cia-lk-pmoexc",tab:"assess",
  title:B("Evidence from the Lessons Learned register","أدلة من سجل الدروس المستفادة"),
  sub:B("Lessons recorded for projects, with whether they were verified in a later project. Read-only evidence for the knowledge and lessons questions of this assessment.","الدروس المسجلة للمشاريع، ومدى التحقق منها في مشروع لاحق. أدلة للقراءة فقط لأسئلة المعرفة والدروس في هذا التقييم."),
  groups:function(lg){ var i=CIAR.info("lessons"), S=i?CIAR.read(i.key):null; if(!S||!Array.isArray(S.records)) return [];
   var I=S.records.filter(function(r){ return r&&r.title; }).map(function(r){ var v=Array.isArray(r.ver)?r.ver.filter(function(x){ return x&&x.res; }):[], ok=v.some(function(x){ return x.res==="worked"; });
    return {id:r.id,sev:ok?1:2,title:r.title,meta:[r.project||"",r.date||"",ok?(lg==="ar"?"تحقق في مشروع لاحق":"verified in a later project"):(lg==="ar"?"لم يُتحقق بعد":"not verified yet")].filter(Boolean).join(" · "),
     acts:[{label:B("Open","افتح"),run:function(){ L.openTool(i.file,"tools",{open:r.id}); }}]}; });
   return I.length?[{code:i.code,name:i.n,file:i.file,tab:"tools",items:I}]:[]; }};
 L.panel(CFG);
})();
