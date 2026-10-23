/* CIA link panels v1 (step 15, 2026-10-22) — the "start from another tool" boxes and read-only panels. Carried byte-identical by every tool that
   shows one; each tool adds its own small configuration (cia-links-<tool>). A panel reads other tools through CIAR (read-only), shows a preview by
   the other tool's own rules, opens the source in its tool, and — where the tool allows it — starts a NEW record in this tool with the source's
   id filled in, through this tool's own buttons and fields. It never writes another tool's key, and it shows nothing when there is no source data. */
var CIALINK=(function(){
 "use strict";
 var D=document, W=window, P=[], T=0;
 function lang(){ var h=D.documentElement.lang; if(h==="en"||h==="ar") return h; try{ return localStorage.getItem("cia-lang")==="en"?"en":"ar"; }catch(e){ return "ar"; } }
 function esc(v){ return String(v==null?"":v).replace(/[&<>"']/g,function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]; }); }
 function tx(v,lg){ lg=lg||lang(); return v&&typeof v==="object"?String(v[lg]||v.ar||v.en||""):String(v==null?"":v); }
 var U={ar:{open:"افتح في أداته",more:"عرض الكل",less:"عرض أقل",none:"لا توجد بيانات",ro:"للقراءة فقط — من بيانات الأدوات الأخرى في هذا المتصفح",
   started:"بدأ سجل جديد هنا من المصدر — راجعه ثم احفظه",startedAuto:"أُضيف سجل جديد هنا من المصدر — راجعه وأكمل بياناته",late:"متأخر",items:"بند"},
  en:{open:"Open in its tool",more:"Show all",less:"Show less",none:"No data",ro:"Read-only — from the other tools' data in this browser",
   started:"A new record was started here from the source — review it, then save",startedAuto:"A new record was added here from the source — review it and complete it",late:"Overdue",items:"items"}};
 function u(){ return U[lang()]; }
 /* open a source in its own tool: inside the hub overlay through parent.ciaOpenFile, otherwise in a new tab; q = one-time hint {open:id} */
 function openTool(file,tab,q){
  if(q){ try{ sessionStorage.setItem("cia-nav:"+file,JSON.stringify(q)); }catch(e){} }
  try{ if(W.parent&&W.parent!==W&&typeof W.parent.ciaOpenFile==="function"&&W.parent.ciaOpenFile(file+".html",tab)) return; }catch(e){}
  try{ W.open("./"+file+".html"+(q&&q.open?"?open="+encodeURIComponent(q.open):"")+(tab?"#"+tab:""),"_blank","noopener"); }catch(e){}
 }
 function goTab(t){ var b=D.querySelector('#side button[data-t="'+t+'"]')||D.querySelector('#side button[data-go="'+t+'"]'); if(b) b.click(); else if(location.hash!=="#"+t) location.hash="#"+t; }
 function pane(t){ return D.querySelector('.tabpane[data-tab="'+t+'"]'); }
 function shown(e){ return !!(e&&!e.hidden&&(e.offsetParent||e.getClientRects().length)); }
 /* set a field the way a person would: value, then input and change events so the tool's own handlers run */
 function put(el,v,noBlur){ if(!el) return false; v=String(v==null?"":v);
  if(el.isContentEditable){ el.innerText=v; el.dispatchEvent(new Event("input",{bubbles:true})); if(!noBlur) el.dispatchEvent(new Event("blur")); return true; }
  if(el.tagName==="SELECT"){ if(![].some.call(el.options,function(o){ return o.value===v; })) return false; }
  el.value=v; el.dispatchEvent(new Event("input",{bubbles:true})); el.dispatchEvent(new Event("change",{bubbles:true})); return true; }
 function note(cfg,msg){ var el=D.getElementById(cfg.id); var n=D.createElement("div"); n.className="cia-lk-note"; n.setAttribute("role","status"); n.textContent=msg;
  var host=cfg.noteAt?cfg.noteAt():null; (host||D.body).insertBefore(n,(host||D.body).firstChild); setTimeout(function(){ n.remove(); },7000); try{ n.scrollIntoView({block:"nearest"}); }catch(e){} return el; }
 function dot(sev){ return '<i class="cia-lk-dot s'+(sev||2)+'" aria-hidden="true"></i>'; }
 function html(cfg,G){ var lg=lang(), x=u(), n=0;
  var h='<summary><span class="cia-lk-ic" aria-hidden="true">⇄</span><b>'+esc(tx(cfg.title,lg))+'</b><em>'+G.reduce(function(a,g){ return a+g.items.length; },0)+' '+esc(x.items)+'</em></summary>';
  h+='<div class="cia-lk-b">'+(cfg.sub?'<p class="cia-lk-sub">'+esc(tx(cfg.sub,lg))+'</p>':'')+'<p class="cia-lk-ro">'+esc(x.ro)+'</p>';
  G.forEach(function(g,gi){ if(!g.items.length) return;
   h+='<section class="cia-lk-g"><header><span class="cia-lk-code" dir="ltr">'+esc(g.code)+'</span><b>'+esc(tx(g.name,lg))+'</b>'+(g.file?'<button type="button" class="cia-lk-o" data-of="'+esc(g.file)+'" data-ot="'+esc(g.tab||"")+'">'+esc(x.open)+' ↗</button>':'')+'</header>'+(g.head?'<div class="cia-lk-head">'+g.head+'</div>':'')+'<ul>';
   g.items.forEach(function(it,ii){ n++;
    h+='<li'+(ii>=6?' class="cia-lk-x" hidden':'')+'>'+dot(it.sev)+'<div class="cia-lk-t"><span><b dir="ltr">'+esc(it.id)+'</b> '+esc(tx(it.title,lg))+(it.late?' <span class="cia-lk-late">'+esc(x.late)+'</span>':'')+'</span>'+(it.meta?'<small>'+esc(tx(it.meta,lg))+'</small>':'')+'</div><span class="cia-lk-a">'+
     (it.acts||[]).map(function(a,ai){ return '<button type="button" class="'+(a.pri?"pri":"")+'" data-g="'+gi+'" data-i="'+ii+'" data-a="'+ai+'">'+esc(tx(a.label,lg))+'</button>'; }).join("")+'</span></li>'; });
   h+='</ul>'+(g.items.length>6?'<button type="button" class="cia-lk-more" data-more="'+gi+'">'+esc(x.more)+' ('+g.items.length+')</button>':'')+'</section>'; });
  return h+'</div>'; }
 function render(cfg){
  var host=pane(cfg.tab), el=D.getElementById(cfg.id);
  if(!host||!shown(host)){ return; }
  var G=[]; try{ G=(cfg.groups(lang())||[]).filter(function(g){ return g&&g.items&&g.items.length; }); }catch(e){ try{ console.warn("[CIA links]",e); }catch(_){} }
  if(!G.length){ if(el) el.remove(); return; }
  var h=html(cfg,G), key=lang()+"|"+h.length+"|"+h.slice(0,400)+h.slice(-400);
  if(el&&el.parentNode&&el.dataset.k===key&&host.contains(el)) return;
  var open=el?el.open:!!cfg.open;
  if(!el){ el=D.createElement("details"); el.id=cfg.id; el.className="cia-lk"; }
  el.dataset.k=key; el.innerHTML=h; el.open=open; el._G=G;
  var at=cfg.where?cfg.where(host):null; if(!at||!host.contains(at)||at===el) at=host.firstElementChild===el?el.nextElementSibling:host.firstElementChild;
  if(!el.parentNode||el.nextElementSibling!==at){ if(at&&at.parentNode) at.parentNode.insertBefore(el,at); else host.appendChild(el); }
  el.onclick=function(e){ var b=e.target.closest("button"); if(!b||!el.contains(b)) return;
   if(b.dataset.of){ openTool(b.dataset.of,b.dataset.ot||""); return; }
   if(b.dataset.more){ var sec=b.parentNode, hid=sec.querySelector(".cia-lk-x[hidden]"); [].forEach.call(sec.querySelectorAll(".cia-lk-x"),function(li){ li.hidden=!hid; }); b.textContent=hid?u().less:u().more+" ("+sec.querySelectorAll("li").length+")"; return; }
   var g=el._G[+b.dataset.g], it=g&&g.items[+b.dataset.i], a=it&&it.acts&&it.acts[+b.dataset.a]; if(a&&typeof a.run==="function"){ try{ a.run(it,g); }catch(err){ try{ console.warn(err); }catch(_){} } } };
 }
 function sweep(){ if(T) return; T=setTimeout(function(){ T=0; P.forEach(function(c){ try{ render(c); }catch(e){} }); },160); }
 function boot(){ try{ new MutationObserver(function(m){ if(m.some(function(r){ return !(r.target&&r.target.closest&&r.target.closest(".cia-lk")); })) sweep(); }).observe(D.body,{childList:true,subtree:true}); }catch(e){}
  try{ new MutationObserver(sweep).observe(D.documentElement,{attributes:true,attributeFilter:["lang"]}); }catch(e){}
  W.addEventListener("storage",sweep); W.addEventListener("hashchange",sweep); sweep(); }
 function panel(cfg){ P.push(cfg); sweep(); }
 /* a one-time request from the hub or another tool: ?from=<tool>:<id>[:<sub>] (or the hint cia-nav-from:<file>) runs the panel action named "start" */
 function request(file,run){ var q=""; try{ q=new URLSearchParams(location.search).get("from")||""; }catch(e){}
  if(!q){ try{ q=sessionStorage.getItem("cia-nav-from:"+file)||""; sessionStorage.removeItem("cia-nav-from:"+file); }catch(e){} }
  var m=/^([a-z0-9]+):([^:]+)(?::(.+))?$/.exec(q); if(m) setTimeout(function(){ try{ run(m[1],m[2],m[3]||""); }catch(e){} },400); }
 if(D.readyState==="loading") D.addEventListener("DOMContentLoaded",boot); else boot();
 return {panel:panel,openTool:openTool,goTab:goTab,put:put,note:note,lang:lang,esc:esc,tx:tx,request:request,sweep:sweep};
})();
