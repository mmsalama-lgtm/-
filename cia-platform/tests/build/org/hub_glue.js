/* views of step 15: rendered when shown (and again after a language switch or after a tool closes) */
function renderOrgViews(){ renderOrgBtn(); renderOrgPrompt();
  if(curView==="profile" && typeof renderProfile==="function" && !PFdirty) renderProfile();
  if(curView==="map" && typeof renderMap==="function") renderMap();
  if(curView==="actions" && typeof renderActions==="function") renderActions(); }
function orgView(v){
  try{ const a=document.querySelector('#nav a[aria-current="page"]'); if(a){ const n=a.parentNode, r=a.getBoundingClientRect(), q=n.getBoundingClientRect(); if(r.left<q.left||r.right>q.right) n.scrollLeft+= (r.left<q.left? r.left-q.left-20 : r.right-q.right+20); } }catch(e){}
  if(v==="profile"){ if(!PFdirty) pfLoad(); renderProfile(); }
  else if(v==="map" && typeof renderMap==="function") renderMap();
  else if(v==="actions" && typeof renderActions==="function"){ renderActions(); CIAR.loadLabels("assets/cia-labels.json").then(()=>{ if(curView==="actions") renderActions(); }); }
}
