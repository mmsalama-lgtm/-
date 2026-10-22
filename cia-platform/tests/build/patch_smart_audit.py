"""Step 2026-10-11: in modules/smart-audit-improvement.html add only a link from each CAPA register row to the CAPA tool.
Inside the platform hub the link opens CAPA in the hub overlay (parent.ciaOpenFile); outside the hub it opens a new tab.
No change to the center's data, scores, stored state, example, CSV or reports: the link is an extra table cell in the
on-screen register only (the CSV export is built from the column list, which is not touched).
Every anchor must match exactly once.   python3 tests/build/patch_smart_audit.py modules/smart-audit-improvement.html"""
import sys, os

HERE = os.path.dirname(os.path.abspath(__file__))
path = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, "..", "..", "modules", "smart-audit-improvement.html")
s = open(path, encoding="utf-8").read()
if "data-capa-tool" in s:
    print("already linked; nothing to do"); sys.exit(0)


def rep(old, new):
    global s
    n = s.count(old)
    assert n == 1, (n, old[:100])
    s = s.replace(old, new)


rep('''${def.open?"<th></th>":""}<th></th></tr></thead>''', '''${def.open?"<th></th>":""}${key==="capa"?"<th></th>":""}<th></th></tr></thead>''')
rep('''${def.open?`<td><button class="tk-btn sm" data-open="${i}">${u.open}</button></td>`:""}<td><button class="del" data-del="${i}"''',
    '''${def.open?`<td><button class="tk-btn sm" data-open="${i}">${u.open}</button></td>`:""}${key==="capa"?capaToolTD(r):""}<td><button class="del" data-del="${i}"''')
rep('''/* ================= IMPROVEMENT TOOLBOX ================= */''', '''/* link from each CAPA row to the CAPA tool (added 2026-10-11). It only opens the tool: the CAPA tool reads this
   center's data with a preview and never writes to it. In the hub it opens in the overlay, outside it in a new tab. */
function capaToolTD(r){ const l=B("افتح أداة CAPA","Open the CAPA tool")[L]; return `<td><a class="tk-btn sm" href="./capa.html#docs" data-capa-tool="${esc(String(TKV(r.id)))}" title="${l}" aria-label="${l} · ${esc(String(TKV(r.id)))}">CAPA ↗</a></td>`; }
document.addEventListener("click",e=>{ const a=e.target.closest&&e.target.closest("a[data-capa-tool]"); if(!a||e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey) return;
  e.preventDefault(); let hub=false; try{ hub=window.self!==window.top&&typeof window.parent.ciaOpenFile==="function"; }catch(x){}
  if(hub){ try{ if(window.parent.ciaOpenFile("capa.html")) return; }catch(x){} }
  window.open(a.getAttribute("href"),"_blank","noopener"); });

/* ================= IMPROVEMENT TOOLBOX ================= */''')
open(path, "w", encoding="utf-8").write(s)
print("smart-audit-improvement.html: CAPA link added to each CAPA register row")
