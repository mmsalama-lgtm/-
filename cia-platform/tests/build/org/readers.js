/* CIA readers v1 — start */
/* Read-only readers of every tool's saved data (step 15, 2026-10-22). Each reader turns a tool's stored state into the open items that the tool
   itself shows: open findings, gaps of its own action plan, NCRs, risks above appetite, overdue or open actions. The rules are copied from the
   tools at build time (tests/build/org/build_readers.py) and never write to any tool: the platform reads another tool's key, it never writes it.
   Carried byte-identical by the hub (index.html) and by every tool that shows a "start from another tool" panel. */
var CIAR=(function(){
 "use strict";
 var REG=__REG__;
 var QM=__ISOMETA__;
 var ER={CE:{st:2,ad:1,wk:0,no:0},APP:{averse:4,minimal:6,cautious:9,open:12,hungry:16}};
 function B(en,ar){ return {en:en,ar:ar}; }
 function read(key){ try{ var raw=localStorage.getItem(key); if(!raw) return null; var o=JSON.parse(raw); return o&&typeof o==="object"?o:null; }catch(e){ return null; } }
 function L2(v){ return (Array.isArray(v)?v:[]).filter(function(x){ return x&&typeof x==="object"; }); }
 function o(x){ return (x&&typeof x==="object"&&!Array.isArray(x))?x:{}; }
 function tx(v){ if(v==null) return ""; if(typeof v==="object"&&!Array.isArray(v)) return String(v.ar!=null&&String(v.ar).trim()?v.ar:(v.en==null?"":v.en)).trim(); return String(v).trim(); }
 function bi(v){ if(v&&typeof v==="object"&&!Array.isArray(v)) return {ar:String(v.ar==null?"":v.ar).trim()||String(v.en==null?"":v.en).trim(), en:String(v.en==null?"":v.en).trim()||String(v.ar==null?"":v.ar).trim()}; var s=String(v==null?"":v).trim(); return {ar:s,en:s}; }
 function txt(v,lang){ if(v&&typeof v==="object"&&!Array.isArray(v)) return String(v[lang]!=null&&String(v[lang]).trim()?v[lang]:(v.ar||v.en||"")).trim(); return String(v==null?"":v).trim(); }
 function isD(d){ return /^\d{4}-\d{2}(-\d{2})?$/.test(String(d||"")); }
 function today(){ return new Date().toISOString().slice(0,10); }
 function late(due){ if(!isD(due)) return false; var t=today(); return String(due)<t.slice(0,String(due).length); }
 function num(v){ var n=typeof v==="number"?v:parseFloat(v); return isFinite(n)?n:null; }
 function info(k){ for(var i=0;i<REG.length;i++) if(REG[i][0]===k) return {k:REG[i][0],sys:REG[i][1],key:REG[i][2],file:REG[i][3],code:REG[i][4],n:REG[i][5]}; return null; }
 function byFile(f){ for(var i=0;i<REG.length;i++) if(REG[i][3]===f) return info(REG[i][0]); return null; }
 /* one item: who/what/when, read-only */
 function it(k,x){ var r={t:k,id:String(x.id==null?"":x.id),sub:String(x.sub==null?"":x.sub),kind:x.kind,title:bi(x.title),det:bi(x.det||""),owner:bi(x.owner||""),
   due:isD(x.due)?String(x.due):"",date:isD(x.date)?String(x.date):"",sev:x.sev||2,cl:String(x.cl||""),how:x.how||x.kind,plan:!!x.plan,ph:x.ph||0,act:bi(x.act||""),sug:bi(x.sug||""),site:bi(x.site||""),tab:x.tab||TAB[k]||"",val:x.val==null?null:x.val,open:x.open!==false};
   r.late=r.open&&late(r.due); return r; }
 var TAB={capa:"tools",pdca:"tools",a3:"tools",fmea:"tools",lessons:"tools",swot:"tools",pestle:"tools",stakeholders:"tools",iso10009:"tools",why5:"tools",fish:"tools",pareto:"tools",rca:"tools",dmaic:"tools",
  ims:"studio",aireg:"assess",iso42005:"roadmap",w8:"plan",exc:"plan",kaqa:"plan",oec:"scar"};
 var SEVC={maj:3,min:2,obs:1,ofi:1,H:3,M:2,L:1,h:3,m:2,l:1,high:3,med:2,low:1,crit:3};

 /* ---- the nine ISO toolkits: the tool's own action plan (every answer under 3 of 4, priority from the gap × weight) and the checklist verdicts ---- */
 function isoItems(k,S){
  var out=[], ans=o(o(S.assess).ans), st=o(o(S.check).st), notes=o(o(S.check).notes), M=QM[k]||[];
  M.forEach(function(q){ var v=ans[q[0]]; if(v==null||v>=3) return; var w=q[3], gp=(4-v)*w, pr=gp>=8||(q[4]&&v<=1&&w>=2)?"H":gp>=4?"M":"L";
   out.push(it(k,{id:q[0],kind:"gap",how:"iso",tab:"report",val:v,cl:q[2],sev:SEVC[pr],plan:true,ph:q[5],title:B(q[0],q[0]),det:B("Self-assessment answer "+v+" of 4","إجابة التقييم الذاتي "+v+" من 4")})); });
  Object.keys(st).forEach(function(n){ var v=st[n]; if(v!=="M"&&v!=="m"&&v!=="O") return;
   out.push(it(k,{id:n,kind:v==="O"?"ofi":"ncr",how:v==="O"?"ofi":"ncr",tab:"checklist",cl:n,sev:v==="M"?3:(v==="m"?2:1),title:B("Clause "+n,"البند "+n),det:notes[n]||"",
     sug:v==="M"?B("Major nonconformity","عدم مطابقة رئيسية"):(v==="m"?B("Minor nonconformity","عدم مطابقة ثانوية"):B("Opportunity for improvement","فرصة للتحسين"))})); });
  if(k==="iso31000"&&S.er&&Array.isArray(S.er.rows)){ var app=o(S.er.app), now=today().slice(0,7);
   L2(S.er.rows).forEach(function(r){ var Lk=+r.L||0, C=+r.C||0; if(!Lk||!C) return;
    var rl=Math.max(1,Lk-(ER.CE[r.ce]||0)), rc=Math.max(1,C-((r.ce==="st"&&tx(r.mc))?1:0)), res=rl*rc, lim=ER.APP[app[r.cat]||"cautious"], ab=!!(r.cat&&res>lim);
    var due=/^\d{4}-\d{2}$/.test(tx(r.due))?tx(r.due):"", od=!!due&&due<now;
    if(!(ab||res>=15||od)) return;
    out.push(it(k,{id:tx(r.id),kind:"risk",how:"risk",tab:"annexa",sev:res>=15?3:(res>=8?2:1),title:r.r,owner:r.o,due:due,act:r.ac,cl:r.cat,
      det:B("Residual "+res+(ab?" above appetite "+lim:""),"المتبقي "+res+(ab?" فوق الشهية "+lim:""))})); }); }
  return out;
 }
 /* readiness of an ISO toolkit by the hub's own reading (weighted answers of 4) and its checklist verdicts */
 function isoReady(k,S){ if(!S||!QM[k]) return null; var ans=o(o(S.assess).ans), st=o(o(S.check).st), s1=0, mx=0, a=0, c={C:0,m:0,M:0,O:0,NA:0};
  QM[k].forEach(function(q){ var v=ans[q[0]]; if(v==null) return; a++; s1+=v*q[3]; mx+=4*q[3]; });
  Object.keys(st).forEach(function(n){ if(c[st[n]]!=null) c[st[n]]++; });
  return {rd:mx?s1/mx*100:null, a:a, n:QM[k].length, ck:c, assessed:c.C+c.m+c.M+c.O}; }
 /* ---- toolbox tools: the actions each record holds with an owner, a date and a status ---- */
 function recs(S){ return L2(S&&S.records); }
 var DONE={done:1,dn:1,closed:1,cl:1,ok:1,met:1};
 function acts(k,S,path,fw,fo,fd,fs){ var out=[]; recs(S).forEach(function(r){ L2(path(r)).forEach(function(a,i){ var s=String(a[fs]||""); if(!tx(a[fw])||DONE[s]) return;
   out.push(it(k,{id:tx(r.id),sub:a.id||String(i+1),kind:"action",how:"action",title:a[fw],owner:a[fo],due:a[fd],sev:2,det:r.title||"",date:String(r.created||"").slice(0,10)})); }); }); return out; }
 var R={};
 R.capa=function(S){ var out=[]; recs(S).forEach(function(r){ if(tx(o(r.close).date)) return;
   out.push(it("capa",{id:tx(r.id),kind:"capa",how:"capa",title:r.title,det:r.desc,owner:r.owner,date:r.raised,due:o(r.eff).planned,sev:SEVC[r.cls]||2,cl:r.ref}));
   L2(r.actions).forEach(function(a,i){ if(a.st==="done"||!tx(a.t)) return; out.push(it("capa",{id:tx(r.id),sub:String(i+1),kind:"action",how:"capa",title:a.t,owner:a.owner,due:a.due,sev:2,det:r.title})); }); }); return out; };
 R.pdca=function(S){ return recs(S).filter(function(r){ return o(r.act).decision!=="close"&&tx(r.title); }).map(function(r){ return it("pdca",{id:tx(r.id),kind:"project",how:"action",title:r.title,owner:r.owner,due:r.due,date:r.start,sev:2}); }); };
 R.a3=function(S){ return acts("a3",S,function(r){ return r.plan; },"what","who","when","st"); };
 R.fmea=function(S){ return acts("fmea",S,function(r){ return r.acts; },"what","who","by","st"); };
 R.lessons=function(S){ return acts("lessons",S,function(r){ return r.acts; },"what","who","by","st"); };
 R.swot=function(S){ return acts("swot",S,function(r){ return r.acts; },"what","who","by","st"); };
 R.pestle=function(S){ return acts("pestle",S,function(r){ return r.acts; },"what","who","by","st"); };
 R.stakeholders=function(S){ return acts("stakeholders",S,function(r){ return r.acts; },"what","who","by","st"); };
 R.iso10009=function(S){ var out=[]; recs(S).forEach(function(r){ L2(r.steps).forEach(function(x,i){ if(x.st==="done"||!tx(x.tool)) return;
   out.push(it("iso10009",{id:tx(r.id),sub:x.id||String(i+1),kind:"action",how:"action",title:(x.out||x.tool),owner:x.who,due:x.date,sev:1,det:r.title})); }); }); return out; };
 /* FMEA rows with action priority H (the tool's rule: severity first, then severity × occurrence, then detection) and no completed action */
 function fmeaAP(s,oc,d){ if(!s||!oc||!d) return ""; var so=s*oc; if(s>=9||so>=40||(so>=20&&d>=7)) return "H"; if(so>=20||(so>=10&&d>=6)||(s>=7&&d>=7)) return "M"; return "L"; }
 function rt(v){ var n=Number(v); return (v!==null&&v!==""&&v!==undefined&&isFinite(n)&&n>=1&&n<=10&&Math.round(n)===n)?n:null; }
 function fmeaHigh(S){ var out=[]; recs(S).forEach(function(r){ var A=L2(r.acts); L2(r.rows).forEach(function(w){ if(fmeaAP(rt(w.s),rt(w.o),rt(w.d))!=="H") return;
   if(A.some(function(a){ return a.row===w.id&&a.st==="done"; })) return;
   out.push(it("fmea",{id:tx(r.id),sub:w.id,kind:"risk",how:"risk",title:w.mode,det:w.eff,act:w.cause,owner:r.owner,sev:3,cl:"S"+w.s+"·O"+w.o+"·D"+w.d})); }); }); return out; }
 /* ---- registers of the other tools ---- */
 R.ims=function(S){ return L2(S.capa).filter(function(x){ return x.st!=="cl"; }).map(function(x){ return it("ims",{id:x.id,kind:"capa",how:"capa",title:x.desc,owner:x.own,due:x.due,date:x.dt,sev:SEVC[x.sev]||2,act:x.ca}); }); };
 R.ccc=function(S){ var r=o(S.r), out=[];
  L2(r.obl).forEach(function(x){ if(x.st!=="not"&&x.st!=="part") return; out.push(it("ccc",{id:x.id,kind:"obligation",how:"ncr",tab:"obl",title:x.ob,owner:x.own,due:x.rev,sev:x.st==="not"?3:2,cl:tx(x.ref)})); });
  L2(r.breach).forEach(function(x){ if(x.st==="closed") return; out.push(it("ccc",{id:x.id,kind:"ncr",how:"ncr",tab:"breach",title:x.desc,owner:x.own,due:x.due,date:x.dt,sev:SEVC[x.imp]||2,act:x.ca})); });
  L2(r.inv).forEach(function(x){ if(x.stg==="closed") return; out.push(it("ccc",{id:x.id,kind:"finding",how:"ncr",tab:"inv",title:x.alleg,owner:x.lead,date:x.op,sev:3})); });
  L2(r.speak).forEach(function(x){ if(tx(x.cls)) return; out.push(it("ccc",{id:x.id,kind:"finding",how:"ncr",tab:"speak",title:B("Speak-up report "+x.id,"بلاغ "+x.id),owner:x.own,date:x.rcv,sev:x.po?3:2})); });
  L2(r.tp).forEach(function(x){ if(x.dd==="dn") return; out.push(it("ccc",{id:x.id,kind:"action",how:"action",tab:"tp",title:x.name,owner:x.own,due:x.ren,sev:x.po?3:2,det:B("Due diligence not complete","العناية الواجبة غير مكتملة")})); });
  return out; };
 R.aud=function(S){ var r=o(S.r), out=[], C=L2(r.capa);
  L2(r.fnd).forEach(function(f){ if(f.cls!=="maj"&&f.cls!=="min"&&f.cls!=="obs"&&f.cls!=="ofi") return; var cs=C.filter(function(c){ return c.f===f.id; });
   if(cs.length&&cs.every(function(c){ return c.st==="closed"; })) return; if(f.cls==="ofi"&&!cs.length) { out.push(it("aud",{id:f.id,kind:"ofi",how:"ofi",tab:"find",title:f.desc,date:f.dt,cl:(f.std?f.std+" ":"")+(f.cl||""),sev:1,site:f.site})); return; }
   out.push(it("aud",{id:f.id,kind:f.cls==="obs"?"obs":"ncr",how:f.cls==="obs"?"obs":"ncr",tab:"find",title:f.desc,date:f.dt,cl:(f.std?f.std+" ":"")+(f.cl||""),sev:SEVC[f.cls]||2,site:f.site,det:f.evid})); });
  C.forEach(function(c){ if(c.st==="closed") return; out.push(it("aud",{id:c.id,kind:"capa",how:"capa",tab:"capa",title:c.ca||c.corr,owner:c.own,due:c.due,sev:2,det:B("Finding "+c.f,"الملاحظة "+c.f)})); });
  return out; };
 R.str=function(S){ var r=o(S.r), out=[];
  L2(r.kpi).forEach(function(x){ var a=num(x.act), t=num(x.target); if(a==null||t==null) return; var bad=x.dir==="dn"?a>t:a<t; if(!bad) return;
   out.push(it("str",{id:x.id,kind:"kpi",how:"kpi",tab:"kpi",title:x.name,owner:x.owner,sev:2,det:B("Actual "+a+" against target "+t+(tx(x.unit)?" "+tx(x.unit):""),"الفعلي "+a+" مقابل المستهدف "+t+(tx(x.unit)?" "+tx(x.unit):""))})); });
  L2(r.raid).forEach(function(x){ if(x.st!=="open") return; out.push(it("str",{id:x.id,kind:x.t==="r"?"risk":"action",how:x.t==="r"?"risk":"action",tab:"raid",title:x.text,owner:x.owner,due:x.due,sev:SEVC[x.imp]||2})); });
  L2(r.ms).forEach(function(x){ if(x.done) return; out.push(it("str",{id:x.id,kind:"action",how:"action",tab:"init",title:x.name,due:x.due,sev:1,det:B("Milestone of "+x.init,"معلم للمبادرة "+x.init)})); });
  return out; };
 R.oec=function(S){ var r=o(S.r), out=[];
  L2(r.scar).forEach(function(x){ if(x.st==="closed") return; out.push(it("oec",{id:x.id,kind:"ncr",how:"ncr",title:x.issue,due:x.due,date:x.raised,sev:SEVC[x.sev]||2,act:x.act})); });
  L2(r.tna).forEach(function(x){ if(x.st==="dn"||x.st==="closed") return; out.push(it("oec",{id:x.id,kind:"action",how:"action",tab:"tna",title:x.course||x.comp,sev:SEVC[x.pri]||1,det:x.role})); });
  return out; };
 R.aireg=function(S){ return L2(o(S.r).obl).filter(function(x){ return x.st!=="dn"; }).map(function(x){ return it("aireg",{id:x.id,kind:"obligation",how:"ncr",title:x.t,owner:x.own,due:x.due,sev:x.dl==="now"?3:2,cl:x.ref}); }); };
 R.iso42005=function(S){ var out=[]; L2(o(S.r).sys).forEach(function(s){ L2(s.imp).forEach(function(x,i){ if(x.st==="dn"||!tx(x.d)) return;
   out.push(it("iso42005",{id:tx(s.id),sub:String(i+1),kind:"action",how:"risk",title:x.mit||x.d,det:x.d,owner:x.own,due:x.due,sev:(+x.rs||0)>=4?3:2})); }); }); return out; };
 R.w8=function(S){ var r=o(S.r), out=[];
  L2(r.plan).forEach(function(x){ if(x.status==="dn"||x.status==="done"||!tx(x.item)) return; out.push(it("w8",{id:x.id,kind:"action",how:"action",title:x.item,owner:x.owner,sev:2})); });
  L2(r.risks).forEach(function(x){ if(x.status!=="open"||!tx(x.risk)) return; var s=(num(x.impact)||0)*(num(x.likelihood)||0); out.push(it("w8",{id:x.id,kind:"risk",how:"risk",tab:"risks",title:x.risk,sev:s>=15?3:(s>=8?2:1),site:x.site})); });
  return out; };
 function afis(k,S){ var out=[]; Object.keys(o(S.self)).forEach(function(c){ var x=o(S.self[c]); if(!tx(x.afi)) return;
   out.push(it(k,{id:c,kind:"afi",how:"afi",title:x.afi,cl:c,sev:(num(x.s)!=null&&x.s<50)?3:2,det:B("Self-assessed "+(x.s==null?"—":x.s)+"%","التقييم الذاتي "+(x.s==null?"—":x.s)+"%")})); });
  Object.keys(o(S.rad||S.ev)).forEach(function(c){ var x=o((S.rad||S.ev)[c]); if(!tx(x.afi)||out.some(function(y){ return y.id===c; })) return;
   out.push(it(k,{id:c,kind:"afi",how:"afi",title:x.afi,cl:c,sev:2})); }); return out; }
 R.exc=function(S){ return afis("exc",S); };
 R.kaqa=function(S){ return afis("kaqa",S); };
 /* strengths written by the excellence tools (for the report) */
 function strengths(k,S){ var out=[]; [o(S.self),o(S.rad||S.ev)].forEach(function(src){ Object.keys(src).forEach(function(c){ var x=o(src[c]); if(tx(x.str)&&!out.some(function(y){ return y.cl===c; })) out.push({cl:c,t:bi(x.str)}); }); }); return out; }

 function items(k,S){ if(S===undefined){ var i=info(k); S=i?read(i.key):null; } if(!S) return [];
  try{ if(QM[k]) return isoItems(k,S); if(R[k]) return R[k](S); }catch(e){ try{ console.warn("[CIA readers]",k,e); }catch(_){} } return []; }
 /* outcomes another tool sent to a destination tool (SWOT risk/opportunity entries, PESTLE and stakeholder outcomes; FMEA high rows; ISO checklist NCRs) */
 function outcomes(to){ var out=[];
  if(to==="iso31000"){
   recs(read("cia-swot:v1")).forEach(function(r){ L2(r.items).length; L2(r.ros).forEach(function(x){ if(x.dest!=="iso31000") return; var src=L2(r.items).filter(function(i){ return i.id===x.item; })[0]||{};
     out.push(it("swot",{id:tx(r.id),sub:x.id,kind:x.kind==="opp"?"opp":"risk",how:"risk",title:x.what||src.t,det:src.t||"",owner:x.who,sev:2,cl:r.title})); }); });
   recs(read("cia-pestle:v1")).forEach(function(r){ L2(r.outs).forEach(function(x){ if(x.to!=="iso31000") return; var f=L2(r.fac).filter(function(i){ return i.id===x.f; })[0]||{};
     out.push(it("pestle",{id:tx(r.id),sub:x.id,kind:"risk",how:"risk",title:x.what||f.t,det:f.t||"",owner:x.who,sev:(+f.sig||0)>=4?3:2,cl:r.title})); }); });
   recs(read("cia-stakeholders:v1")).forEach(function(r){ L2(r.outs).forEach(function(x){ if(x.to!=="iso31000") return; var p=L2(r.pts).filter(function(i){ return i.id===x.p; })[0]||{};
     out.push(it("stakeholders",{id:tx(r.id),sub:x.id,kind:"risk",how:"risk",title:x.what||p.n,det:p.n||"",owner:x.who,sev:2,cl:r.title})); }); });
   out=out.concat(fmeaHigh(read("cia-fmea:v1")));
  }
  return out; }
 /* labels of the ISO toolkits (assets/cia-labels.json, read from the tools by org_labels.py): question, recommended action, suggested owner, clause titles */
 var LB=null, LBP=null;
 function loadLabels(url){ if(LBP) return LBP; try{ LBP=fetch(url||"assets/cia-labels.json").then(function(r){ return r.ok?r.json():null; }).then(function(j){ LB=j; return j; }).catch(function(){ return null; }); }catch(e){ LBP=Promise.resolve(null); } return LBP; }
 function lab(x,f,lang){ var I=LB&&LB.iso&&LB.iso[x.t]; if(I){
   if(x.kind==="gap"&&I.q[x.id]){ var q=I.q[x.id][lang]||I.q[x.id].ar; if(f==="title") return q.q; if(f==="act") return q.a; if(f==="sug") return q.o; }
   if((x.kind==="ncr"||x.kind==="ofi")&&I.cl&&I.cl[x.id]&&f==="title") return (lang==="ar"?"البند ":"Clause ")+x.id+" — "+(I.cl[x.id][lang]||I.cl[x.id].ar); }
  var v=x[f]; return v&&typeof v==="object"?String(v[lang]||v.ar||v.en||""):String(v==null?"":v); }
 function all(){ var o2={}; REG.forEach(function(t){ o2[t[0]]=items(t[0]); }); return o2; }
 return {version:"1",REG:REG,QM:QM,read:read,info:info,byFile:byFile,items:items,all:all,outcomes:outcomes,strengths:strengths,loadLabels:loadLabels,lab:lab,fmeaHigh:fmeaHigh,isoItems:isoItems,isoReady:isoReady,txt:txt,bi:bi,late:late,today:today};
})();
/* CIA readers v1 — end */
