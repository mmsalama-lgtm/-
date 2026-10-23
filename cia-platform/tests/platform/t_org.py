"""Organization profile in every tool — step 15, 2026-10-22 (needs this package on CIA_BASE and the step-14.1 package on CIA_ORIG).
For each of the 39 tools, Date and Math.random frozen:
- the kit is there and reads the profile (CIAORG); its report branding is wrapped (brandHeaderHTML or TBX.reportDoc);
- no profile: no bar, no suggestions, and the report branding gives byte-identical output to the previous release (for the toolbox tools the
  whole report of the example data, buildReportHTML());
- with a profile: the cover (logo + name + prepared for/by) is in the report; the example's stored state is unchanged after visiting every tab;
  the "fill the empty fields" bar fills only empty organization fields (a field already filled keeps its value); site/department/person fields
  get the profile's suggestions.
Also writes tests/build/org_map.json (tool → tab → organization fields and suggestion fields found). Usage: python3 t_org.py [shard count]"""
import os, sys, json
sys.path.insert(0, os.path.dirname(__file__))
from common import BASE, ORIG, ROOT, Report, modules, launch, new_page, load_example, sync_playwright
sys.path.insert(0, os.path.join(ROOT, "tests", "hub"))
from hubkit import FREEZE, PROFILE  # noqa: E402

k_, n_ = (int(sys.argv[1]), int(sys.argv[2])) if len(sys.argv) > 2 else (0, 1)
MODS = [m for i, m in enumerate(modules()) if i % n_ == k_]
R = Report("org" + (f"-{k_}" if n_ > 1 else ""))
DUMP = "()=>{const o={}; Object.keys(localStorage).sort().forEach(k=>{ if(!/^cia-(tour|lang|org)/.test(k)) o[k]=localStorage.getItem(k); }); return o;}"
TABS = "[...new Set([...document.querySelectorAll('#side button[data-t], #side button[data-go]')].map(b=>b.dataset.t||b.dataset.go))]"
SW = """async (t)=>{ const b=document.querySelector('#side button[data-t="'+t+'"]')||document.querySelector('#side button[data-go="'+t+'"]'); b&&b.click(); await new Promise(r=>setTimeout(r,160)); }"""
BRAND = """()=>{ const o={}; try{ if(typeof brandHeaderHTML==='function') o.bh=brandHeaderHTML(); }catch(e){ o.bh='ERR '+e; }
  try{ if(typeof TBX==='object'&&TBX) o.rd=TBX.reportDoc('ar','T','<p>x</p>',''); }catch(e){ o.rd='ERR '+e; }
  try{ if(typeof buildReportHTML==='function') o.rep=buildReportHTML(); }catch(e){ o.rep='ERR '+e; } return o; }"""
FIELDS = """()=>{ const F=['[data-p="org"]','[data-m="org"]','[data-ok="name"]','[data-p="scope"]','[data-m="scope"]','[data-p="sites"]'],
  S=['#f-area','#f-site','#fsite','#f-owner','#h-owner','[data-p="owner"]','[data-ok="owner"]','input[data-k="site"]','input[data-k="dept"]','input[data-k="owner"]'];
  const vis=e=>!!(e.offsetParent||e.getClientRects().length);
  return {fill:F.filter(s=>[...document.querySelectorAll(s)].some(vis)), sugg:S.filter(s=>[...document.querySelectorAll(s)].some(e=>vis(e)&&e.tagName==='INPUT'))}; }"""
omap = {}
with sync_playwright() as p:
    b = launch(p)
    for m in MODS:
        # ---- no profile: same branding output as the previous release
        out = {}
        for name, base in (("old", ORIG), ("new", BASE)):
            ctx, pg, errs = new_page(b, "ar", 1280, 900, tour_done=[m], extra_init=FREEZE)
            pg.goto(f"{base}/modules/{m}.html", wait_until="load"); pg.wait_for_timeout(350); load_example(pg, 600)
            out[name] = pg.evaluate(BRAND)
            if name == "new":
                R.check(f"{m}: the organization profile kit runs (CIAORG) and finds no profile", pg.evaluate("typeof CIAORG==='object' && CIAORG.has()===false"))
                R.check(f"{m}: the report branding is wrapped by the kit", pg.evaluate("(typeof brandHeaderHTML==='function'&&!!brandHeaderHTML.ciaOrg)||(typeof TBX==='object'&&!!TBX.reportDoc.ciaOrg)"))
                tabs = pg.evaluate(TABS); bars = 0; lists = 0
                for t in tabs:
                    pg.evaluate(SW, t); bars += pg.evaluate("document.querySelectorAll('.cia-org-bar').length"); lists += pg.evaluate("document.querySelectorAll('input[list^=\"cia-org\"],datalist[id^=\"cia-org\"]').length")
                R.check(f"{m}: no profile → no fill bar and no suggestions on any tab", bars == 0 and lists == 0, (bars, lists))
                R.check(f"{m}: no errors", not errs, errs[:3])
            ctx.close()
        for k in ("bh", "rd", "rep"):
            if k in out["old"] or k in out["new"]:
                R.check(f"{m}: no profile → report output ({k}) byte-identical to the previous release", out["old"].get(k) == out["new"].get(k) and "ERR" not in str(out["new"].get(k))[:4])
        # ---- with a profile
        ctx, pg, errs = new_page(b, "ar", 1280, 900, tour_done=[m], extra_init=FREEZE)
        pg.goto(f"{BASE}/modules/{m}.html", wait_until="load"); pg.wait_for_timeout(300); load_example(pg, 600)
        s0 = pg.evaluate(DUMP)
        pg.evaluate("(p)=>localStorage.setItem('cia-org:v1',JSON.stringify(p))", PROFILE); pg.reload(wait_until="load"); pg.wait_for_timeout(400)
        o = pg.evaluate(BRAND)
        withc = [k for k in ("bh", "rd", "rep") if k in o]
        R.check(f"{m}: with a profile the report carries the organization cover ({', '.join(withc)})", withc and all("cia-org-cover" in o[k] and PROFILE["name"]["ar"] in o[k] and PROFILE["prepFor"] in o[k] for k in withc))
        tabs = pg.evaluate(TABS); omap[m] = {}
        for t in tabs:
            pg.evaluate(SW, t); f = pg.evaluate(FIELDS)
            if f["fill"] or f["sugg"]: omap[m][t] = f
        J = lambda d: {k: json.loads(v) if v and v[:1] in "{[" else v for k, v in d.items()}
        R.check(f"{m}: with a profile, visiting every tab leaves the stored state unchanged (same content; a tool may re-save its keys in its own order)", J(pg.evaluate(DUMP)) == J(s0))
        sug = [(t, s) for t, f in omap[m].items() for s in f["sugg"]]
        if sug:
            t, s = sug[0]; pg.evaluate(SW, t); pg.wait_for_timeout(250)
            R.check(f"{m}: suggestion field {s} lists the profile's values", pg.evaluate("(s)=>{ const e=[...document.querySelectorAll(s)].find(x=>x.offsetParent); const d=e&&document.getElementById(e.getAttribute('list')); return !!(d&&d.options.length); }", s))
        fills = [t for t, f in omap[m].items() if f["fill"]]
        if fills:
            t = fills[0]; pg.evaluate(SW, t); pg.wait_for_timeout(300)
            empty = pg.evaluate("()=>[...document.querySelectorAll('[data-p=\"org\"],[data-m=\"org\"],[data-ok=\"name\"],[data-p=\"scope\"],[data-m=\"scope\"],[data-p=\"sites\"]')].filter(e=>e.offsetParent&&!String(e.value||e.innerText||'').trim()).length")
            if empty:
                kept = pg.evaluate("()=>{ const e=[...document.querySelectorAll('[data-p=\"org\"],[data-m=\"org\"],[data-ok=\"name\"],[data-p=\"scope\"],[data-m=\"scope\"],[data-p=\"sites\"]')].filter(e=>e.offsetParent&&!String(e.value||'').trim()); if(e.length<2) return null; e[0].value='KEEP-ME'; e[0].dispatchEvent(new Event('input',{bubbles:true})); return true; }")
                pg.wait_for_timeout(250)
                ok = pg.evaluate("!!document.querySelector('.cia-org-bar .cia-org-go')")
                R.check(f"{m}: tab {t} has empty organization fields → the fill bar is offered", ok)
                if ok:
                    pg.click(".cia-org-bar .cia-org-go"); pg.wait_for_timeout(350)
                    vals = pg.evaluate("()=>[...document.querySelectorAll('[data-p=\"org\"],[data-m=\"org\"],[data-ok=\"name\"]')].filter(e=>e.offsetParent).map(e=>e.value)")
                    R.check(f"{m}: the fill bar fills the empty organization fields with the profile and keeps filled ones", (PROFILE["name"]["ar"] in vals or not vals) and (kept is None or "KEEP-ME" in pg.evaluate("()=>[...document.querySelectorAll('input,textarea')].map(e=>e.value).join('|')")), vals)
            else:
                R.check(f"{m}: tab {t} organization fields already filled (example) → no fill bar", not pg.evaluate("!!document.querySelector('.cia-org-bar')"))
        R.check(f"{m}: no errors with a profile", not errs, errs[:3])
        ctx.close()
    b.close()
json.dump(omap, open(os.path.join(os.path.dirname(__file__), "results", "org_map-%d.json" % k_), "w", encoding="utf-8"), indent=1)
parts = [os.path.join(os.path.dirname(__file__), "results", "org_map-%d.json" % i) for i in range(n_)]
if all(os.path.exists(x) for x in parts):   # the last shard to finish writes tests/build/org_map.json
    allm = {}
    for x in parts: allm.update(json.load(open(x, encoding="utf-8")))
    if len(allm) == len(modules()): json.dump(dict(sorted(allm.items())), open(os.path.join(ROOT, "tests", "build", "org_map.json"), "w", encoding="utf-8"), indent=1)
R.save({"modules": MODS})
