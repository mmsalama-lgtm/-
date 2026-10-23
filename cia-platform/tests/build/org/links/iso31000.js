/*CIA-LINKS {"outcome":["swot","pestle","stakeholders"],"start":["fmea","iso9001","iso14001","iso45001","iso27001","iso22301","iso37301","iso37001","iso37000"]}*/
/* ISO 31000 Risk Studio ⟵ the outcomes other tools send to it (SWOT risk/opportunity entries, PESTLE and stakeholder outcomes with the destination
   "ISO 31000 Risk Studio"), FMEA rows with action priority High and no completed action, and the major/minor nonconformities of the ISO checklists.
   "Start a risk from this" adds a new row to this tool's own risk register (its own Add button) with the source filled in. */
(function(){
 var L=CIALINK, B=function(en,ar){ return {en:en,ar:ar}; };
 var ISO=["iso9001","iso14001","iso45001","iso27001","iso22301","iso37301","iso37001","iso37000"];
 try{ CIAR.loadLabels("../assets/cia-labels.json").then(L.sweep); }catch(e){}
 function start(it){
  L.goTab("annexa");
  setTimeout(function(){
   var add=document.getElementById("erAdd"); if(!add) return; add.click();
   var rows=document.querySelectorAll("#crBox tbody tr[data-r]"), tr=rows[rows.length-1]; if(!tr) return;
   var lg=L.lang(), i=CIAR.info(it.t), name=i?L.tx(i.n,lg):it.t, cell=function(k){ return tr.querySelector('[contenteditable][data-k="'+k+'"]'); };
   var title=CIAR.lab(it,"title",lg), det=CIAR.lab(it,"det",lg), cause=CIAR.lab(it,"act",lg);
   L.put(cell("r"), title, true);
   L.put(cell("ca"), it.t==="fmea"?cause:det, true);
   if(it.t==="fmea") L.put(cell("co"), det, true);
   L.put(cell("o"), CIAR.lab(it,"owner",lg), true);
   L.put(cell("obj"), (lg==="ar"?"من ":"From ")+(i?i.code:it.t)+" "+it.id+(it.sub?"/"+it.sub:""), true);
   var r=cell("r"); if(r) r.dispatchEvent(new Event("blur"));
   L.note(CFG,lg==="ar"?"أُضيف خطر جديد إلى السجل من «"+name+"» — قيّم الاحتمالية والأثر وأكمل المعالجة":"A new risk was added to the register from “"+name+"” — rate likelihood and consequence and complete the treatment");
  },220);
 }
 var CFG={id:"cia-lk-31000",tab:"annexa",
  title:B("Start a risk from another tool","ابدأ خطراً من أداة أخرى"),
  sub:B("Entries sent to the Risk Studio by SWOT, PESTLE and the stakeholder analysis, FMEA rows with action priority High, and the nonconformities found with the ISO checklists.","ما أرسلته أدوات SWOT وPESTLE وتحليل الأطراف المعنية إلى استوديو المخاطر، وصفوف FMEA ذات أولوية الإجراء العالية، وحالات عدم المطابقة في قوائم تدقيق الأيزو."),
  where:function(h){ return h.querySelector("#crBox"); },
  noteAt:function(){ return document.querySelector('.tabpane[data-tab="annexa"]'); },
  groups:function(lg){ var out=[], O=CIAR.outcomes("iso31000");
   ["swot","pestle","stakeholders","fmea"].forEach(function(k){ var i=CIAR.info(k), I=O.filter(function(x){ return x.t===k; }); if(!i||!I.length) return;
    out.push({code:i.code,name:i.n,file:i.file,tab:"tools",items:I.map(function(x){ return {id:x.id+(x.sub?"/"+x.sub:""),sev:x.sev,title:CIAR.lab(x,"title",lg),
     meta:(x.cl?CIAR.txt(x.cl)+" · ":"")+CIAR.lab(x,"det",lg),acts:[{label:B("Start a risk from this","ابدأ خطراً منه"),pri:1,run:function(){ start(x); }}]}; })}); });
   ISO.forEach(function(k){ var i=CIAR.info(k); if(!i) return; var I=CIAR.items(k).filter(function(x){ return x.kind==="ncr"; }); if(!I.length) return;
    out.push({code:i.code,name:i.n,file:i.file,tab:"checklist",items:I.map(function(x){ return {id:x.cl,sev:x.sev,title:CIAR.lab(x,"title",lg),meta:CIAR.lab(x,"sug",lg)+(CIAR.lab(x,"det",lg)?" — "+CIAR.lab(x,"det",lg):""),
     acts:[{label:B("Start a risk from this","ابدأ خطراً منه"),pri:1,run:function(){ start(x); }}]}; })}); });
   return out; }};
 L.panel(CFG);
 L.request("iso31000-risk-studio",function(k,id,sub){ var x=CIAR.outcomes("iso31000").concat(CIAR.items(k)).filter(function(y){ return y.t===k&&(y.id===id||y.cl===id)&&(!sub||y.sub===sub); })[0]; if(x) start(x); });
})();
