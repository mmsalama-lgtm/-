/* each section's title gets the section's own icon from the side menu, so every screen opens on a clear header */
(function(){
  var raf = 0;
  function deco(){
    raf = 0;
    var side = document.getElementById("side"), pane = document.querySelector(".tabpane.on");
    if(!side || !pane) return;
    var btn = side.querySelector('button[aria-selected="true"]');
    if(!btn || btn.dataset.t === "home") return;
    var ic = btn.querySelector(".ic"); if(!ic) return;
    /* the page title: the section header, or else the card titled like the section (the first card otherwise) */
    var head = pane.querySelector(".sec-title"), h2 = head && head.querySelector("h2");
    if(!head){
      var name = ((btn.querySelector(".tl") || btn).textContent || "").trim(), cards = pane.querySelectorAll(".pd-card > h2");
      h2 = cards[0] || null;
      for(var i = 0; i < cards.length; i++) if(cards[i].textContent.trim() === name){ h2 = cards[i]; break; }
    }
    if(!h2) return;
    var host = head || h2.parentNode, cur = host.querySelector(":scope > .ui-ic");
    if(cur && cur.dataset.t === btn.dataset.t) return;
    if(cur) cur.remove();
    var t = document.createElement("span");
    t.className = "ui-ic"; t.dataset.t = btn.dataset.t; t.setAttribute("aria-hidden", "true");
    t.innerHTML = ic.innerHTML; t.setAttribute("style", ic.getAttribute("style") || "");
    host.insertBefore(t, head ? head.firstChild : h2);
    host.classList.add("ui-has-ic");
  }
  function soon(){ if(!raf) raf = requestAnimationFrame(deco); }
  function start(){
    deco();
    new MutationObserver(soon).observe(document.body, {subtree:true, childList:true, attributes:true, attributeFilter:["class", "aria-selected"]});
  }
  if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();
