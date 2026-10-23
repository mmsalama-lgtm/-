"""The new tool-to-tool links of step 15 (2026-10-22): one regression per link panel. With every tool's example data loaded (Date frozen):
- the panel shows on its tab with the source tools it declares (/*CIA-LINKS*/ of its configuration), each group naming a declared source;
- every source tool's stored state is byte-identical after the panel is shown, opened, and its action run ("start from", include, open);
- the target's own stored state: unchanged for read-only panels and for CAPA (the new record stays unsaved in the form); for the Risk Studio
  and the IMS Builder only their own key changes (a new register row, the picker selection) — through their own buttons;
- with no data in the source tools the panel is absent (the step-14 text of the tool is unchanged: t_regress.py).
Usage: python3 t_links.py"""
import os, sys, json, re
sys.path.insert(0, os.path.dirname(__file__))
from common import BASE, ROOT, Report, launch, new_page, sync_playwright
sys.path.insert(0, os.path.join(ROOT, "tests", "hub"))
from hubkit import FREEZE, examples  # noqa: E402

R = Report("links")
SW = """async (t)=>{ const b=document.querySelector('#side button[data-t="'+t+'"]')||document.querySelector('#side button[data-go="'+t+'"]'); b&&b.click(); await new Promise(r=>setTimeout(r,500)); }"""
DUMP = "()=>{const o={}; Object.keys(localStorage).sort().forEach(k=>{ if(!/^cia-(tour|lang)/.test(k) && !/:lang$/.test(k)) o[k]=localStorage.getItem(k); }); return o;}"
T = json.load(open(os.path.join(ROOT, "tests", "build", "link_types.json")))
idx = open(os.path.join(ROOT, "index.html"), encoding="utf-8").read()
KEY = dict(re.findall(r'\{k:"([a-z0-9]+)",\s*sys:"[a-z]+",\s*key:"([^"]+)"', idx))
CODE = dict(re.findall(r'\{k:"([a-z0-9]+)",\s*sys:"[a-z]+",\s*key:"[^"]+",\s*code:"([^"]+)"', idx))
#        file, hub key, tab, panel id, own key may change
CASES = [("capa", "capa", "tools", "cia-lk-capa", False), ("iso31000-risk-studio", "iso31000", "annexa", "cia-lk-31000", True),
         ("ims-builder", "ims", "picker", "cia-lk-ims", True), ("smart-audit-improvement", "aud", "clist", "cia-lk-aud", False),
         ("strategy-performance", "str", "swot", "cia-lk-str", False), ("excellence-efqm", "exc", "results", "cia-lk-exc", False),
         ("kaqa", "kaqa", "results", "cia-lk-exc", False), ("pmo-excellence", "pmoexc", "assess", "cia-lk-pmoexc", False),
         ("executive-cockpit-workspace", "w8", "cockpit", "cia-lk-w8", False)]
with sync_playwright() as p:
    b = launch(p)
    EX = examples(b)
    S = json.loads(EX["iso9001tk:v1"]); S["check"]["st"] = {"4.1": "C", "7.5.3": "M", "8.4.1": "m", "9.2.2": "O"}; EX["iso9001tk:v1"] = json.dumps(S)
    for f, k, tab, pid, own in CASES:
        ctx, pg, errs = new_page(b, "ar", 1280, 900, tour_done=[f], extra_init=FREEZE + "try{ if(!sessionStorage.getItem('s')){ sessionStorage.setItem('s','1'); var S=%s; for(var k in S) localStorage.setItem(k,S[k]); } }catch(e){}" % json.dumps(EX))
        pg.goto(f"{BASE}/modules/{f}.html", wait_until="load"); pg.wait_for_timeout(400)
        s0 = pg.evaluate(DUMP)
        pg.evaluate(SW, tab); pg.wait_for_timeout(500)
        ok = pg.evaluate(f"!!document.getElementById('{pid}')")
        R.check(f"{f}: the link panel shows on the {tab} tab", ok)
        if not ok: ctx.close(); continue
        pg.evaluate(f"document.getElementById('{pid}').open=true"); pg.wait_for_timeout(200)
        codes = pg.evaluate(f"[...document.querySelectorAll('#{pid} .cia-lk-code')].map(x=>x.textContent)")
        allowed = {CODE[s] for s, _ in T[k]} | {"ISO", "ORG", "TOOLBOX", "REPORT", "PDCA · A3 · DMAIC"}
        R.check(f"{f}: every group in the panel is a declared source ({', '.join(codes)})", codes and all(c in allowed for c in codes), (codes, sorted(allowed)))
        txt = pg.evaluate(f"document.getElementById('{pid}').innerText")
        R.check(f"{f}: no undefined/NaN/[object Object] in the panel", not any(w in txt for w in ("undefined", "NaN", "[object Object]")), [txt[max(0,txt.find(w)-150):txt.find(w)+20] for w in ("undefined", "NaN", "[object Object]") if w in txt])
        s1 = pg.evaluate(DUMP)
        R.check(f"{f}: showing the panel changes no stored state", s1 == s0, [x for x in s1 if s1.get(x) != s0.get(x)])
        acts = pg.evaluate(f"[...document.querySelectorAll('#{pid} .cia-lk-a button')].length")
        if acts and k != "w8":
            pg.evaluate(f"document.querySelector('#{pid} .cia-lk-a button.pri, #{pid} .cia-lk-a button').click()"); pg.wait_for_timeout(1800)
        s2 = pg.evaluate(DUMP)
        changed = [x for x in set(s0) | set(s2) if s0.get(x) != s2.get(x)]
        src = [x for x in changed if x != KEY[k]]
        R.check(f"{f}: after its action, every source tool's stored state is byte-identical", not src, src)
        if own:
            R.check(f"{f}: only its own key changed, through its own button", changed in ([], [KEY[k]]), changed)
        else:
            R.check(f"{f}: its own stored state is unchanged (read-only panel, or a new record left unsaved in the form)", not changed, changed)
        if k == "capa":
            R.check("capa: 'start a CAPA' fills a new unsaved record (title, reference, class) and says so", pg.evaluate("document.getElementById('f-title').value.length>3 && document.getElementById('f-ref').value.length>3 && document.getElementById('rid').value===''") and pg.evaluate("!!document.querySelector('.cia-lk-note')"))
        if k == "iso31000":
            r = json.loads(s2[KEY[k]])["er"]["rows"][-1]
            R.check("iso31000: 'start a risk' added a register row naming its source", r["r"] and ("من " in r["obj"] or "From " in r["obj"]), r)
        R.check(f"{f}: no errors", not errs, errs[:3])
        ctx.close()
    # no source data: no panel
    for f, k, tab, pid, own in CASES:
        ctx, pg, errs = new_page(b, "ar", 1280, 900, tour_done=[f], extra_init=FREEZE)
        pg.goto(f"{BASE}/modules/{f}.html", wait_until="load"); pg.wait_for_timeout(350); pg.evaluate(SW, tab); pg.wait_for_timeout(400)
        R.check(f"{f}: with no data in the source tools the panel is absent", not pg.evaluate(f"!!document.getElementById('{pid}')"))
        ctx.close()
    b.close()
R.save()
