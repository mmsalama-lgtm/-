/*CIA-LINKS {"reads":["pdca","capa","why5","fish","pareto","rca","a3","dmaic","iso10009","fmea","lessons","swot","pestle","stakeholders"]}*/
/* Executive Cockpit ⟵ the 14 continual-improvement toolbox tools, read through the hub's own adapters (CIADASH, copied from index.html at build
   time: same index, same data completeness, same open-item counts as the hub dashboard), and the organization profile (cia-org:v1).
   Read-only: the cockpit's registers, pillars and scan are unchanged. */
(function(){
 var L=CIALINK, B=function(en,ar){ return {en:en,ar:ar}; };
 var TBX=["pdca","capa","why5","fish","pareto","rca","a3","dmaic","iso10009","fmea","lessons","swot","pestle","stakeholders"];
 function pc(v){ return v==null?"—":Math.round(v)+"%"; }
 var CFG={id:"cia-lk-w8",tab:"cockpit",
  title:B("Continual improvement toolbox and organization profile","صندوق أدوات التحسين المستمر وملف المنشأة"),
  sub:B("The fourteen toolbox tools read exactly as the hub dashboard reads them (index, data completeness and open items), and the organization registered once in the hub. Read-only.","أدوات الصندوق الأربع عشرة كما تقرؤها لوحة أداء المنصة (المؤشر واكتمال البيانات والبنود المفتوحة)، والمنشأة المسجلة مرة واحدة في المنصة. للقراءة فقط."),
  open:true,
  groups:function(lg){ var out=[];
   try{ CIADASH.setLang(lg); }catch(e){}
   if(window.CIAORG&&CIAORG.has()){ var p=CIAORG.get();
    out.push({code:"ORG",name:B("Organization profile","ملف المنشأة"),
     head:(p.logo?'<img src="'+L.esc(p.logo)+'" alt="" style="width:44px;height:44px;object-fit:contain;border-radius:8px;background:#fff;vertical-align:middle;margin-inline-end:8px">':'')+'<b>'+L.esc(CIAORG.name(lg))+'</b>'+(p.legal?' · '+L.esc(p.legal):''),
     items:[{id:"",sev:1,title:B("Sites: "+p.sites.length+" · departments: "+p.depts.length+(p.top?" · top manager: "+p.top:""),"المواقع: "+p.sites.length+" · الإدارات: "+p.depts.length+(p.top?" · المدير الأعلى: "+p.top:"")),
      meta:B("Registered once in the hub; every report carries this cover.","مسجلة مرة واحدة في المنصة، وتظهر على غلاف كل تقرير."),acts:[]}]}); }
   var I=[];
   TBX.forEach(function(k){ var t=CIADASH.TOOLS.filter(function(x){ return x.k===k; })[0]; if(!t) return; var r=CIADASH.evalTool(t); if(!r||r.st!=="ok") return;
    var open=0; if(r.bd&&r.bd.items&&/Open items/.test(r.bd.t.en)) r.bd.items.forEach(function(x){ open+=parseInt(x.t,10)||0; }); else open=CIAR.items(k).length;
    var i=CIAR.info(k);
    I.push({id:t.code,sev:r.idx==null?2:(r.idx<50?3:(r.idx<70?2:1)),title:t.n,meta:(lg==="ar"?"المؤشر ":"index ")+pc(r.idx)+" · "+(lg==="ar"?"اكتمال البيانات ":"completeness ")+pc(r.comp)+" · "+(lg==="ar"?"بنود مفتوحة ":"open items ")+open,
     acts:[{label:B("Open","افتح"),run:function(){ L.openTool(i.file,"dash"); }}]}); });
   if(I.length) out.push({code:"TOOLBOX",name:B("Continual improvement toolbox","صندوق أدوات التحسين المستمر"),items:I});
   if(out.length) out.push({code:"REPORT",name:B("Integrated report","التقرير الشامل"),items:[{id:"",sev:1,title:B("Issue the integrated report for the whole platform","أصدر التقرير الشامل للمنصة كلها"),
    meta:B("Built by the hub from every tool that holds data: summary, map, status, action plans, roadmap, verification and re-assessment.","تبنيه المنصة من كل أداة فيها بيانات: الملخص والخريطة والوضع وخطط العمل وخارطة الطريق والتحقق وإعادة التقييم."),
    acts:[{label:B("Issue the integrated report","أصدر التقرير الشامل"),pri:1,run:function(){ try{ if(window.parent&&window.parent!==window&&typeof window.parent.ciaIntegratedReport==="function"){ window.parent.ciaIntegratedReport(); return; } }catch(e){}
     try{ window.open("../index.html#actions","_blank","noopener"); }catch(e){} }}]}]});
   return out; }};
 L.panel(CFG);
})();
