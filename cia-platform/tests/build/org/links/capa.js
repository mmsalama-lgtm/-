/*CIA-LINKS {"start":["iso9001","iso14001","iso45001","iso27001","iso22301","iso37301","iso37001","iso31000","iso37000","exc","kaqa"]}*/
/* CAPA ⟵ the ISO toolkits (checklist nonconformities and self-assessment answers of 0 or 1) and the areas for improvement of EFQM and KAQA.
   "Start a CAPA from this finding" opens a NEW, unsaved CAPA record (the tool's own New button) with the source filled in; the person saves it. */
(function(){
 var L=CIALINK, B=function(en,ar){ return {en:en,ar:ar}; };
 var ISO=["iso9001","iso14001","iso45001","iso27001","iso22301","iso37301","iso37001","iso31000","iso37000"];
 try{ CIAR.loadLabels("../assets/cia-labels.json").then(L.sweep); }catch(e){}
 function src(it){ var i=CIAR.info(it.t); return (i?i.code:it.t)+(it.cl?" · "+it.cl:""); }
 function start(it){
  L.goTab("tools"); var nb=document.getElementById("newBtn"); if(!nb) return; nb.click();
  var lg=L.lang(), title=CIAR.lab(it,"title",lg), i=CIAR.info(it.t), name=i?L.tx(i.n,lg):it.t;
  L.put(document.getElementById("f-title"), title.length>140?title.slice(0,139)+"…":title);
  L.put(document.getElementById("f-ref"), (i?i.code:it.t)+" "+(it.kind==="gap"?it.id:(it.cl||it.id)));
  L.put(document.getElementById("f-src"), "ia");
  L.put(document.getElementById("f-cls"), it.kind==="ncr"?(it.sev>=3?"maj":"min"):(it.kind==="ofi"||it.kind==="afi"?"obs":""));
  L.put(document.getElementById("f-raised"), CIAR.today());
  var det=[title, CIAR.lab(it,"det",lg), CIAR.lab(it,"act",lg)].filter(Boolean).join("\n");
  L.put(document.getElementById("f-desc"), det+"\n"+(lg==="ar"?"المصدر: ":"Source: ")+name+" — "+src(it)+(lg==="ar"?" (قراءة فقط من الأداة)":" (read only from the tool)"));
  L.note(CFG,L.tx(lg==="ar"?"بدأ سجل CAPA جديد من «"+name+"» — راجعه ثم احفظه":"A new CAPA record was started from “"+name+"” — review it, then save",lg));
  var f=document.getElementById("rec-form"); if(f) try{ f.scrollIntoView({behavior:"smooth",block:"start"}); }catch(e){}
 }
 var CFG={id:"cia-lk-capa",tab:"tools",
  title:B("Start a CAPA from a finding in another tool","ابدأ إجراءً تصحيحياً من ملاحظة في أداة أخرى"),
  sub:B("Nonconformities found with the ISO toolkits' checklists, self-assessment answers of 0 or 1, and the areas for improvement of the EFQM and KAQA assessments.","حالات عدم المطابقة في قوائم تدقيق أدوات الأيزو، وإجابات التقييم الذاتي 0 أو 1، وفرص التحسين في تقييمَي EFQM وجائزة الملك عبدالعزيز."),
  noteAt:function(){ return document.querySelector('.tabpane[data-tab="tools"]'); },
  groups:function(lg){ var out=[];
   ISO.concat(["exc","kaqa"]).forEach(function(k){ var i=CIAR.info(k); if(!i) return;
    var I=CIAR.items(k).filter(function(x){ return x.kind==="ncr"||x.kind==="afi"||(x.kind==="gap"&&x.val!=null&&x.val<=1); })
     .sort(function(a,b){ return (b.kind==="ncr")-(a.kind==="ncr")||b.sev-a.sev; });
    if(!I.length) return;
    out.push({code:i.code,name:i.n,file:i.file,tab:I[0].tab,items:I.map(function(x){ return {id:x.kind==="gap"?x.id:(x.cl||x.id),sev:x.sev,title:CIAR.lab(x,"title",lg),
      meta:CIAR.lab(x,"det",lg)||CIAR.lab(x,"sug",lg),acts:[{label:B("Start a CAPA from this","ابدأ CAPA منها"),pri:1,run:function(){ start(x); }}]}; })}); });
   return out; }};
 L.panel(CFG);
 L.request("capa",function(k,id){ var x=CIAR.items(k).filter(function(y){ return y.id===id||y.cl===id; })[0]; if(x) start(x); });
})();
