/*CIA-LINKS {"start":["iso9001","iso14001","iso45001","iso27001","iso22301","iso37301","iso37001"]}*/
/* IMS Builder ⟵ the gap and readiness results of the seven certifiable ISO toolkits (read-only preview by the hub's own reading).
   "Start the integrated gap from these results" selects in this tool's picker every standard that already has results (its own toggles),
   then opens the integrated assessment. Nothing is copied into this tool's answers. */
(function(){
 var L=CIALINK, B=function(en,ar){ return {en:en,ar:ar}; };
 var MAP=[["iso9001","q"],["iso14001","e"],["iso45001","h"],["iso27001","i"],["iso22301","b"],["iso37301","c"],["iso37001","a"]];
 function data(){ return MAP.map(function(m){ var i=CIAR.info(m[0]), S=i?CIAR.read(i.key):null, r=CIAR.isoReady(m[0],S); return r&&(r.a||r.assessed)?{k:m[0],s:m[1],i:i,r:r}:null; }).filter(Boolean); }
 function on(s){ var b=document.querySelector('.pk-tg[data-tg="'+s+'"]'); return b&&b.getAttribute("aria-pressed")==="true"; }
 function include(s){ L.goTab("picker"); var b=document.querySelector('.pk-tg[data-tg="'+s+'"]'); if(b&&b.getAttribute("aria-pressed")!=="true") b.click(); }
 function startAll(){ var lg=L.lang(); data().forEach(function(x){ include(x.s); });
  L.note(CFG,lg==="ar"?"اختيرت المواصفات التي لها نتائج في أدواتها — ابدأ التقييم المتكامل الآن":"The standards with results in their own toolkits are selected — start the integrated assessment now");
  setTimeout(function(){ L.goTab("assess"); },900); }
 var CFG={id:"cia-lk-ims",tab:"picker",
  title:B("Start the integrated gap from the ISO toolkits' results","ابدأ الفجوة المتكاملة من نتائج أدوات الأيزو"),
  sub:B("Readiness of each standard as its own toolkit measured it (weighted self-assessment answers) and its checklist verdicts. Read-only: the integrated assessment is answered here.","جاهزية كل مواصفة كما قاستها أداتها (إجابات التقييم الذاتي الموزونة) ونتائج قائمة تدقيقها. للقراءة فقط: التقييم المتكامل يُجاب هنا."),
  where:function(h){ return h.querySelector(".pk-sum")||h.querySelector(".tk-panel"); },
  noteAt:function(){ return document.querySelector('.tabpane[data-tab="picker"]'); },
  groups:function(lg){ var X=data(); if(!X.length) return [];
   var items=[{id:"IMS",sev:1,title:B("Start the integrated gap from these results","ابدأ الفجوة المتكاملة من هذه النتائج"),meta:B(X.length+" standards with results","مواصفات لها نتائج: "+X.length),acts:[{label:B("Start","ابدأ"),pri:1,run:startAll}]}];
   X.forEach(function(x){ var r=x.r, c=r.ck, rd=r.rd==null?"—":Math.round(r.rd)+"%";
    items.push({id:x.i.code,sev:r.rd==null?2:(r.rd<50?3:(r.rd<70?2:1)),title:x.i.n,
     meta:(lg==="ar"?"الجاهزية ":"Readiness ")+rd+" · "+r.a+"/"+r.n+(lg==="ar"?" سؤالاً":" answered")+(r.assessed?(lg==="ar"?" · قائمة التدقيق: رئيسية "+c.M+"، ثانوية "+c.m+"، فرص "+c.O:" · checklist: "+c.M+" major, "+c.m+" minor, "+c.O+" OFI"):"")+(on(x.s)?(lg==="ar"?" · مختارة هنا":" · selected here"):""),
     acts:[{label:B("Open its toolkit","افتح أداتها"),run:function(){ L.openTool(x.i.file,"report"); }}].concat(on(x.s)?[]:[{label:B("Include","أدرجها"),pri:1,run:function(){ include(x.s); L.sweep(); }}])}); });
   return [{code:"ISO",name:B("ISO toolkits","أدوات الأيزو"),items:items}]; }};
 L.panel(CFG);
})();
