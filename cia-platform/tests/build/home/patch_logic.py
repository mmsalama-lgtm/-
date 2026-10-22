import os; p=os.path.join(os.path.dirname(os.path.abspath(__file__)),"logic.js"); s=open(p,encoding="utf-8").read()
def rep(a,b):
    global s
    assert s.count(a)==1, a[:70]; s=s.replace(a,b)
rep('''  const s = SHOTS[CAR.i], h = H(), anchor = s.tab;
  $("carCap").innerHTML =''','''  const s = SHOTS[CAR.i], h = H(), anchor = s.tab;
  $("carCap").setAttribute("aria-live", quiet ? "off" : "polite");
  $("carCap").innerHTML =''')
rep('''  if(!quiet) $("carCap").setAttribute("aria-live","polite");
''','')
rep('''/* ---------- back to top ---------- */
addEventListener("scroll", ()=>{ const t = $("toTop"); if(t) t.classList.toggle("on", scrollY > 700); }, {passive:true});''','''/* ---------- back to top; reveal safety net (anything scrolled into or past view is shown even if an observer was missed) ---------- */
let revT = 0;
function revealSweep(){ document.querySelectorAll(".rv:not(.in), #howSteps:not(.in)").forEach(e=>{ const r = e.getBoundingClientRect(); if(r.height && r.top < innerHeight*0.98) e.classList.add("in"); }); }
addEventListener("scroll", ()=>{ const t = $("toTop"); if(t) t.classList.toggle("on", scrollY > 700); if(!revT) revT = requestAnimationFrame(()=>{ revT = 0; revealSweep(); }); }, {passive:true});
addEventListener("load", ()=>setTimeout(revealSweep, 60));
addEventListener("beforeprint", ()=>document.querySelectorAll(".rv, #howSteps").forEach(e=>e.classList.add("in")));''')
rep('''  revealObserve();
}''','''  revealObserve(); setTimeout(revealSweep, 30);
}''')
rep('''UI.en.tour.steps = [''','''/* the desktop bar keeps nine items; "Start here" and FAQ stay in the phone menu, the footer and the command search */
UI.en.navTop = UI.en.nav.filter(([h])=>h!=="start" && h!=="faq"); UI.ar.navTop = UI.ar.nav.filter(([h])=>h!=="start" && h!=="faq");
UI.en.fLinks = [["start","Start here"], ...UI.en.fLinks]; UI.ar.fLinks = [["start","ابدأ هنا"], ...UI.ar.fLinks];
UI.en.tour.steps = [''')
rep('''  else if(e.key==="Enter"){ e.preventDefault(); cmdGo(cmdSel); }
});''','''  else if(e.key==="Enter"){ e.preventDefault(); cmdGo(cmdSel); }
  else if(e.key==="Escape"){ e.preventDefault(); $("cmdk").close(); }
});''')
rep('''  set("ctaAdv", h.adv); set("cta1", h.browse); set("cta3", h.consult); set("byLbl", h.by); set("byName", h.author);''','''  set("ctaAdv", h.adv); set("cta1", h.browse); set("cta3", h.consult); set("byLbl", h.by); set("byName", h.author);
  document.documentElement.classList.remove("pre-en");''')
open(p,"w",encoding="utf-8").write(s); print("logic patched", len(s))
