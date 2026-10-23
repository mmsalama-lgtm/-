/* CIA organization profile kit v1 (step 15, 2026-10-22) — carried byte-identical by the hub and every tool; checked by tests/platform/t_static.py.
   One shared key, cia-org:v1, written only by the hub (#profile) — tools read it. The schema below is the schema of the future server profile.
   {v:1, updated:ISO date-time,
    name:{ar,en}, legal, cr, sector, size, country, city,
    sites:[{name, city, act}], depts:[name], top, qhse, prepFor, prepBy, email, phone,
    scope:{ar,en}, held:[standard], target:[standard], fy:"01".."12", lang:"ar"|"en", logo:data-URL (PNG/JPEG/WebP/SVG, ≤ 300 KB), brand:"#rrggbb"}
   API: CIAORG.get() (repaired copy, never throws) · has() · logo() · name(lang) · coverHTML(lang, withAcademy[, profile]) · on(fn) (storage event) · KEY
   In a tool it also: puts the organization's logo and name on the cover of every HTML/PDF report (when a profile exists; without one the
   report is unchanged), offers to fill the empty organization fields of the open form from the profile, and turns site, department and
   person fields into suggestions from the profile. It never changes saved records or example data and never writes another tool's key. */
var CIAORG=(function(){
 "use strict";
 var KEY="cia-org:v1", W=window, D=document;
 var LOGO_RX=/^data:image\/(png|jpeg|webp|svg\+xml);base64,[A-Za-z0-9+\/=]+$/;
 function s(v,n){ v=v==null?"":String(v); v=v.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g,"").trim(); return n?v.slice(0,n):v; }
 function bi(v,n){ v=(v&&typeof v==="object"&&!Array.isArray(v))?v:{ar:v,en:""}; return {ar:s(v.ar,n),en:s(v.en,n)}; }
 function list(v,f,max){ return (Array.isArray(v)?v:[]).map(f).filter(function(x){ return x!=null&&x!==""; }).slice(0,max||200); }
 function repair(o){
  o=(o&&typeof o==="object"&&!Array.isArray(o))?o:{};
  var logo=s(o.logo); if(!LOGO_RX.test(logo)||logo.length>420000) logo="";
  var brand=s(o.brand); if(!/^#[0-9a-fA-F]{6}$/.test(brand)) brand="";
  var lang=o.lang==="en"?"en":"ar", fy=/^(0[1-9]|1[0-2])$/.test(s(o.fy))?s(o.fy):"01";
  return {v:1, updated:s(o.updated,40), name:bi(o.name,160), legal:s(o.legal,200), cr:s(o.cr,40), sector:s(o.sector,20), size:s(o.size,20),
   country:s(o.country,20), city:s(o.city,80),
   sites:list(o.sites,function(x){ x=(x&&typeof x==="object")?x:{name:x}; var n=s(x.name,120); return n?{name:n,city:s(x.city,80),act:s(x.act,160)}:null; },100),
   depts:list(o.depts,function(x){ return s(x,120)||null; },200),
   top:s(o.top,120), qhse:s(o.qhse,120), prepFor:s(o.prepFor,160), prepBy:s(o.prepBy,160), email:s(o.email,160), phone:s(o.phone,40),
   scope:bi(o.scope,1200), held:list(o.held,function(x){ return s(x,40)||null; },40), target:list(o.target,function(x){ return s(x,40)||null; },40),
   fy:fy, lang:lang, logo:logo, brand:brand};
 }
 function raw(){ try{ var t=localStorage.getItem(KEY); return t?JSON.parse(t):null; }catch(e){ return null; } }
 function get(){ try{ return repair(raw()); }catch(e){ return repair(null); } }
 function has(){ var p=get(); return !!(p.name.ar||p.name.en); }
 function name(lang){ var p=get(); return lang==="en"?(p.name.en||p.name.ar):(p.name.ar||p.name.en); }
 function txt(v,lang){ return v&&typeof v==="object"?(lang==="en"?(v.en||v.ar):(v.ar||v.en))||"":s(v); }
 function esc(v){ return String(v==null?"":v).replace(/[&<>"']/g,function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]; }); }
 function academyLogo(){ try{ if(typeof LOGO==="string"&&/^data:image\//.test(LOGO)) return LOGO; }catch(e){} try{ var i=D.querySelector("img[data-logo],.home-logo img,.brand img,header img"); if(i&&/^data:image\//.test(i.getAttribute("src")||"")) return i.getAttribute("src"); }catch(e){} return ""; }
 var T={ar:{pf:"أُعدّ لـ",pb:"أعدّه",cr:"السجل التجاري",scope:"النطاق",acad:"أكاديمية التحسين المستمر"},en:{pf:"Prepared for",pb:"Prepared by",cr:"CR no.",scope:"Scope",acad:"Continual Improvement Academy"}};
 /* the cover block: organization logo and name next to the academy logo, with "prepared for … · prepared by …" (inline styles: it travels into downloaded reports) */
 function coverHTML(lang,withAcademy,p0){
  var p=p0?repair(p0):get(); if(!(p.name.ar||p.name.en)) return "";
  lang=lang==="en"?"en":"ar"; var t=T[lang], col=p.brand||"#B8901E", nm=lang==="en"?(p.name.en||p.name.ar):(p.name.ar||p.name.en), ac=withAcademy?academyLogo():"";
  var sub=[p.legal&&p.legal!==nm?esc(p.legal):"", p.cr?esc(t.cr)+' <span dir="ltr">'+esc(p.cr)+"</span>":""].filter(Boolean).join(" · ");
  var sc=txt(p.scope,lang), who=[p.prepFor?esc(t.pf)+": <b>"+esc(p.prepFor)+"</b>":"", p.prepBy?esc(t.pb)+": <b>"+esc(p.prepBy)+"</b>":""].filter(Boolean).join(" · ");
  return '<div class="cia-org-cover" dir="'+(lang==="ar"?"rtl":"ltr")+'" style="display:flex;align-items:center;gap:14px;border:1px solid #DCE4EE;border-inline-start:5px solid '+col+';border-radius:12px;padding:12px 16px;margin:0 0 18px;background:#F7F9FC;color:#1B2A4A;break-inside:avoid;page-break-inside:avoid">'+
   (p.logo?'<img src="'+esc(p.logo)+'" alt="'+esc(nm)+'" style="width:72px;height:72px;object-fit:contain;flex:none;border-radius:8px;background:#fff">':'')+
   '<div style="display:grid;gap:2px;min-width:0;flex:1"><b style="font-size:18px;line-height:1.35">'+esc(nm)+'</b>'+(sub?'<span style="font-size:12.5px;color:#4B5874">'+sub+'</span>':'')+
   (sc?'<span style="font-size:12.5px;color:#4B5874">'+esc(t.scope)+": "+esc(sc.length>220?sc.slice(0,219)+"…":sc)+'</span>':'')+(who?'<span style="font-size:12.5px;color:#4B5874">'+who+'</span>':'')+'</div>'+
   (ac?'<img src="'+esc(ac)+'" alt="'+esc(t.acad)+'" style="width:56px;height:56px;border-radius:50%;flex:none">':'')+'</div>';
 }
 var subs=[];
 function on(fn){ if(typeof fn==="function") subs.push(fn); }
 try{ W.addEventListener("storage",function(e){ if(e.key===KEY||e.key===null){ subs.forEach(function(f){ try{ f(get()); }catch(_){} }); } }); }catch(e){}
 var API={KEY:KEY,get:get,has:has,name:name,logo:function(){ return get().logo; },coverHTML:coverHTML,on:on,repair:repair,esc:esc,txt:txt};

 /* ---------------- inside a tool (not the hub) ---------------- */
 var HUB=!!D.getElementById("modOverlay");
 function lang(){ var l=""; try{ l=localStorage.getItem("cia-lang")||""; }catch(e){} var h=D.documentElement.lang; return (h==="en"||h==="ar")?h:(l==="en"?"en":"ar"); }
 function hookReports(){
  /* the ISO toolkits and the kit-based centres brand every report through brandHeaderHTML(); the toolbox tools through TBX.reportDoc() */
  try{ if(typeof W.brandHeaderHTML==="function"&&!W.brandHeaderHTML.ciaOrg){ var ob=W.brandHeaderHTML;
    var nb=function(){ var h=ob.apply(this,arguments); return has()?h+coverHTML(lang(),false):h; }; nb.ciaOrg=1; W.brandHeaderHTML=nb; } }catch(e){}
  try{ if(typeof W.TBX==="object"&&W.TBX&&typeof W.TBX.reportDoc==="function"&&!W.TBX.reportDoc.ciaOrg){ var od=W.TBX.reportDoc;
    var nd=function(lg,title,body,css){ return od.call(this,lg,title,has()?coverHTML(lg,true)+body:body,css); }; nd.ciaOrg=1; W.TBX.reportDoc=nd; } }catch(e){}
 }
 /* print view of the tool itself: the cover on top of the printed page */
 function printCover(on){ var x=D.getElementById("cia-org-print"); if(x) x.remove(); if(on&&has()){ var d=D.createElement("div"); d.id="cia-org-print"; d.className="cia-org-print"; d.innerHTML=coverHTML(lang(),true); D.body.insertBefore(d,D.body.firstChild); } }
 /* organization fields a tool may have (read from the page, no tool code involved); see tests/build/org_map.json */
 var FILL=[['[data-p="org"]',"name"],['[data-m="org"]',"name"],['[data-ok="name"]',"name"],['[data-p="scope"]',"scope"],['[data-m="scope"]',"scope"],['[data-p="sites"]',"sites"]];
 var SUGG=[["#f-area","area"],["#f-site","sites"],["#fsite","sites"],["#f-owner","people"],["#h-owner","people"],['[data-p="owner"]',"people"],['[data-ok="owner"]',"people"],['input[data-k="site"]',"sites"],['input[data-k="dept"]',"depts"],['input[data-k="owner"]',"people"]];
 var U={ar:{fill:"املأ الحقول الفارغة من ملف المنشأة",have:"بيانات منشأتك محفوظة في ملف المنشأة.",done:"تمت تعبئة بيانات المنشأة من الملف — عدّلها إن لزم",x:"إغلاق"},
        en:{fill:"Fill the empty fields from the organization profile",have:"Your organization's details are saved in the organization profile.",done:"Organization details filled from the profile — edit them if needed",x:"Close"}};
 function val(f,lg){ var p=get(); if(f==="name") return name(lg); if(f==="scope") return txt(p.scope,lg); if(f==="sites") return p.sites.map(function(x){ return x.name; }).join(lg==="ar"?"، ":", "); return ""; }
 function vis(e){ return !!(e&&(e.offsetParent||e.getClientRects().length)); }
 function empty(e){ return e.isContentEditable?!String(e.innerText||"").trim():!String(e.value||"").trim(); }
 function fillables(){ var out=[]; FILL.forEach(function(m){ [].forEach.call(D.querySelectorAll(m[0]),function(e){ if(vis(e)&&!e.disabled&&!e.readOnly&&empty(e)&&val(m[1],lang())) out.push([e,m[1]]); }); }); return out; }
 var dismissed=false, bar=null, doneT=null;
 function banner(){
  if(HUB) return; var F=has()&&!dismissed?fillables():[];
  if(!F.length){ if(bar&&!bar.dataset.done){ bar.remove(); bar=null; } return; }
  var host=F[0][0].closest(".tk-panel,.pd-stage,.panel,.card,fieldset,form,section")||F[0][0].parentElement;
  if(bar&&bar.isConnected&&bar.nextElementSibling===host&&!bar.dataset.done) return;
  if(bar) bar.remove(); var u=U[lang()];
  bar=D.createElement("div"); bar.className="cia-org-bar"; bar.setAttribute("role","note");
  bar.innerHTML=(get().logo?'<img src="'+esc(get().logo)+'" alt="">':'<i aria-hidden="true">🏢</i>')+'<span>'+esc(u.have)+'</span><button type="button" class="cia-org-go">'+esc(u.fill)+'</button><button type="button" class="cia-org-x" aria-label="'+esc(u.x)+'">✕</button>';
  host.parentNode.insertBefore(bar,host);
  bar.querySelector(".cia-org-go").onclick=function(){ var lg=lang(), n=0;
   fillables().forEach(function(m){ var e=m[0], v=val(m[1],lg); if(!v) return; if(e.isContentEditable) e.innerText=v; else e.value=v; n++;
    e.dispatchEvent(new Event("input",{bubbles:true})); e.dispatchEvent(new Event("change",{bubbles:true})); });
   bar.dataset.done="1"; bar.innerHTML='<i aria-hidden="true">✓</i><span>'+esc(U[lg].done)+'</span>'; clearTimeout(doneT); doneT=setTimeout(function(){ if(bar){ bar.remove(); bar=null; } },6000); };
  bar.querySelector(".cia-org-x").onclick=function(){ dismissed=true; bar.remove(); bar=null; };
 }
 function dl(id,vals){ var d=D.getElementById(id); if(!vals.length){ if(d) d.remove(); return null; } if(!d){ d=D.createElement("datalist"); d.id=id; D.body.appendChild(d); }
  var h=vals.map(function(v){ return '<option value="'+esc(v)+'">'; }).join(""); if(d.innerHTML!==h) d.innerHTML=h; return id; }
 function suggest(){
  if(HUB) return; var on=has(), p=get();
  var lists=on?{sites:dl("cia-org-sites",p.sites.map(function(x){ return x.name; })), depts:dl("cia-org-depts",p.depts),
    area:dl("cia-org-area",p.sites.map(function(x){ return x.name; }).concat(p.depts)), people:dl("cia-org-people",[p.top,p.qhse,p.prepFor].filter(Boolean).concat(p.depts))}:{};
  SUGG.forEach(function(m){ [].forEach.call(D.querySelectorAll(m[0]),function(e){ if(e.tagName!=="INPUT") return; var id=lists[m[1]];
   if(on&&id){ if(!e.getAttribute("list")){ e.setAttribute("list",id); e.dataset.ciaList="1"; } } else if(e.dataset.ciaList){ e.removeAttribute("list"); delete e.dataset.ciaList; } }); });
 }
 var tick=0;
 function sweep(){ if(tick) return; tick=setTimeout(function(){ tick=0; try{ banner(); suggest(); }catch(e){} },120); }
 function boot(){
  hookReports();
  if(HUB) return;
  try{ W.addEventListener("beforeprint",function(){ printCover(true); }); W.addEventListener("afterprint",function(){ printCover(false); }); }catch(e){}
  var HAS=has(); on(function(){ HAS=has(); });
  try{ new MutationObserver(function(){ if(HAS||bar) sweep(); }).observe(D.body,{childList:true,subtree:true}); }catch(e){}
  W.addEventListener("hashchange",sweep); on(function(){ dismissed=false; sweep(); }); sweep();
 }
 if(D.readyState==="loading") D.addEventListener("DOMContentLoaded",boot); else boot();
 return API;
})();
