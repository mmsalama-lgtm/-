"""Step 15 (2026-10-22), Part B.3: the hub overlay no longer loses unsaved edits when another tool is opened.
    python3 tests/build/patch_hub_overlay.py index.html
The open tool's frame is watched for typing (input events); saving (form submit) or starting a new record clears the mark. When another tool is
asked for while the open one holds unsaved edits in its form, the hub asks first; "Cancel" keeps the open tool and its form as they are.
Tools that save as you type (most of the platform) are never marked. No tool changes."""
import os, sys
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
path = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, "index.html")
s = open(path, encoding="utf-8").read()
if "function modDirty(" in s: print("overlay guard already present; nothing to do"); sys.exit(0)
def rep(old, new, times=1):
    global s
    n = s.count(old); assert n == times, (n, old[:120]); s = s.replace(old, new)
rep('''function openModule(key, push, anchor){
  const url = URLS[key]; if(!url) return;''', '''/* unsaved edits: only the tools with an explicit Save (a record form) can hold them; autosaving tools are never marked */
const MODQ = {ar:(a,b)=>`في «${a}» تعديلات لم تُحفظ في النموذج المفتوح، وفتح «${b}» الآن سيفقدها. اضغط «إلغاء» للرجوع وحفظها، أو «موافق» لفتح الأداة الأخرى.`,
  en:(a,b)=>`“${a}” has unsaved edits in its open form; opening “${b}” now would lose them. Press Cancel to go back and save, or OK to open the other tool.`};
function modDirty(f){ try{ return !!(f && f.dataset.dirty==="1" && f.contentDocument && f.contentDocument.getElementById("rec-form")); }catch(e){ return false; } }
function modWatch(f){ try{ const d = f.contentDocument; if(!d || d.__ciaWatch) return; d.__ciaWatch = 1; f.dataset.dirty = "";
  const form = ()=>d.getElementById("rec-form");
  d.addEventListener("input", e=>{ const fm = form(); if(fm && fm.contains(e.target)) f.dataset.dirty = "1"; }, true);
  d.addEventListener("change", e=>{ const fm = form(); if(fm && fm.contains(e.target)) f.dataset.dirty = "1"; }, true);
  d.addEventListener("submit", ()=>{ setTimeout(()=>{ const ok = d.getElementById("recOk"); if(!ok || (ok.textContent||"").trim()) f.dataset.dirty = ""; }, 60); }, true);
  d.addEventListener("click", e=>{ if(e.target.closest && e.target.closest("#newBtn")) f.dataset.dirty = ""; }, true); }catch(e){} }
function openModule(key, push, anchor){
  const url = URLS[key]; if(!url) return;
  { const f0 = $("modFrame"); if($("modOverlay").classList.contains("on") && f0 && f0.dataset.k && f0.dataset.k!==key && modDirty(f0) && !confirm(MODQ[L](modLabel(f0.dataset.k), modLabel(key)))) return;
    if(f0 && f0.dataset.k!==key) f0.dataset.dirty = ""; }''')
rep('''function modFrameLoad(){
  const f=$("modFrame"), k=f.dataset.k; if(!k) return;''', '''function modFrameLoad(){
  const f=$("modFrame"), k=f.dataset.k; if(!k) return;
  modWatch(f);''')
open(path, "w", encoding="utf-8").write(s)
print("index.html: overlay asks before replacing a tool with unsaved edits")
