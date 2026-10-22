"""Hub: every view in Arabic and English at 1280 and 390, the tool count and the wheel, every tool opening in the
overlay, the home button closing it, back and forward, the language shared both ways, and the knowledge-centre
guide links landing on the right tab."""
import os, sys, re
sys.path.insert(0, os.path.dirname(__file__))
from common import BASE, Report, modules, launch, new_page, bad_words, sync_playwright

R = Report("hub")
VIEWS = ["home", "start", "dash", "tools", "systems", "learn", "faq", "request", "about"]
FRAME_ERRS = "window.__e=[];addEventListener('error',function(e){window.__e.push(String(e.message))});"
ALL = modules()


def frame_ready(pg, tab=None, timeout=15000):
    pg.wait_for_function("""(t)=>{const f=document.getElementById('modFrame'); if(!f||!f.contentDocument) return false;
        const d=f.contentDocument, u=(URLS[f.dataset.k]||'#').split('/').pop();
        if(!f.dataset.k||d.location.pathname.split('/').pop()!==u) return false;
        if(d.readyState!=='complete'||!d.querySelector('#side')||!d.getElementById('ciaHomeBtn')) return false;
        if(!t) return true; const p=d.querySelector('.tabpane[data-tab="'+t+'"]'); return !!(p&&p.getClientRects().length);}""",
                         arg=tab, timeout=timeout)


with sync_playwright() as p:
    b = launch(p)
    # ---- views
    for lang in ("ar", "en"):
        for w, h in ((1280, 900), (390, 844)):
            ctx, pg, errs = new_page(b, lang, w, h, tour_done=ALL, extra_init=FRAME_ERRS)
            pg.goto(BASE + "/index.html", wait_until="load"); pg.wait_for_timeout(600)
            for v in VIEWS:
                pg.evaluate(f"showView('{v}')"); pg.wait_for_timeout(120)
                r = pg.evaluate("""(v)=>{const S=[...document.querySelectorAll('main [data-view="'+v+'"]')];
                    const t=S.map(e=>e.innerText).join('\\n'); const de=document.documentElement;
                    return {vis:S.filter(e=>!e.hidden).length, len:t.trim().length, text:t, over:Math.max(de.scrollWidth,document.body.scrollWidth)-innerWidth}}""", v)
                tag = f"hub {lang} {w} view {v}"
                R.check(tag + ": shows", r["vis"] > 0 and r["len"] > 40, r["len"])
                R.check(tag + ": no undefined/NaN/[object Object]", not bad_words(r["text"]), bad_words(r["text"])[:3])
                R.check(tag + ": no horizontal overflow", r["over"] <= 1, r["over"])
            R.check(f"hub {lang} {w}: no errors", not errs, errs[:3])
            ctx.close()

    ctx, pg, errs = new_page(b, "ar", 1280, 900, tour_done=ALL, extra_init=FRAME_ERRS)
    pg.goto(BASE + "/index.html", wait_until="load"); pg.wait_for_timeout(600)
    # ---- counts and wheel
    n_tk = pg.evaluate("TOOLKITS.length")
    R.check("38 toolkit cards in the data", n_tk == 38, n_tk)
    pg.evaluate("showView('tools')"); pg.wait_for_timeout(150)
    R.check("38 toolkit cards on the page", pg.evaluate("document.querySelectorAll('#tools a[data-mod]').length") >= 38,
            pg.evaluate("document.querySelectorAll('#tools a[data-mod]').length"))
    per = pg.evaluate("wStats().per.map((x,i)=>[SYSTEMS[i].id,x.n])")
    R.check("wheel: Audit & Improvement counts 15 tools", dict(per).get("aud") == 15, per)
    R.check("wheel: the seven segments add up to 38", sum(n for _, n in per) == 38, per)
    pg.evaluate("showView('home')"); pg.wait_for_timeout(150)
    nums = pg.evaluate("[...document.querySelectorAll('#wheel .wseg .num')].map(e=>+e.textContent)")
    R.check("wheel shows the same counts", nums == [n for _, n in per], [nums, per])
    txt = pg.evaluate("document.body.innerText")
    R.check("no text still says 25 to 35 tools", not re.search(r"\b(2[56789]|3[012345])\s*(tool|أدا|أدوات)", txt), re.findall(r".{20}\b(?:2[56789]|3[012345])\b.{20}", txt)[:3])
    R.check("the toolbox entry counts 1 tool still to come, PDCA, CAPA, 5 Whys, Fishbone, Pareto, RCA, A3, DMAIC, FMEA, Lessons Learned, SWOT and PESTLE live", "1 tool · PDCA, CAPA, 5 Whys, Fishbone, Pareto, RCA, A3, DMAIC, FMEA, Lessons Learned, SWOT and PESTLE are live" in pg.evaluate("JSON.stringify(SOON.find(s=>s.k==='citbox'))"))
    soon = pg.evaluate("(typeof SOON!=='undefined'?SOON:[]).filter(s=>s.k==='citbox').length")
    R.check("one grouped 'coming soon' entry for the toolbox", soon == 1, soon)

    # ---- every tool opens in the overlay, home button closes it
    keys = pg.evaluate("Object.keys(URLS)")
    R.check("hub links all 38 tools", len(keys) == 38 and "pestle" in keys and "swot" in keys and "lessons" in keys and "fmea" in keys and "iso10009" in keys and "dmaic" in keys and "a3" in keys and "capa" in keys and "why5" in keys and "fish" in keys and "pareto" in keys and "rca" in keys, keys)
    for k in keys:
        pg.evaluate(f"openModule('{k}')")
        try:
            pg.wait_for_function("(k)=>document.getElementById('modFrame').dataset.k===k", arg=k, timeout=8000)
            frame_ready(pg)
            ok = True
        except Exception as e:
            ok = False
        R.check(f"overlay opens {k}", ok and pg.evaluate("document.getElementById('modOverlay').classList.contains('on')"))
        if not ok:
            pg.evaluate("closeModule()"); continue
        fe = pg.evaluate("document.getElementById('modFrame').contentWindow.__e||[]")
        R.check(f"{k}: no errors inside the overlay", not fe and not errs, (fe + errs)[:3])
        del errs[:]
        has = pg.evaluate("!!document.getElementById('modFrame').contentDocument.getElementById('ciaHomeBtn')")
        R.check(f"{k}: home button present", has)
        if has:
            pg.evaluate("document.getElementById('modFrame').contentDocument.getElementById('ciaHomeBtn').click()")
            pg.wait_for_timeout(250)
            R.check(f"{k}: home button closes the overlay", not pg.evaluate("document.getElementById('modOverlay').classList.contains('on')"))
        else:
            pg.evaluate("closeModule()")
        pg.wait_for_timeout(100)

    # ---- back and forward
    pg.evaluate("showView('tools')"); pg.wait_for_timeout(150)
    pg.evaluate("document.querySelector('#tools a[data-mod=\"pdca\"]').click()")
    frame_ready(pg)
    R.check("card link opens PDCA and sets #m=pdca", pg.evaluate("location.hash").startswith("#m=pdca"), pg.evaluate("location.hash"))
    pg.go_back(); pg.wait_for_timeout(400)
    R.check("Back closes the overlay", not pg.evaluate("document.getElementById('modOverlay').classList.contains('on')"))
    pg.go_forward(); pg.wait_for_timeout(300)
    frame_ready(pg)
    R.check("Forward reopens PDCA", pg.evaluate("document.getElementById('modOverlay').classList.contains('on') && document.getElementById('modFrame').dataset.k==='pdca'"))
    pg.evaluate("closeModule()"); pg.wait_for_timeout(300)

    # ---- language shared both ways
    pg.evaluate("document.getElementById('langBtn').click()"); pg.wait_for_timeout(300)
    R.check("hub switches to English", pg.evaluate("document.documentElement.lang") == "en")
    pg.evaluate("openModule('pdca')"); frame_ready(pg)
    R.check("tool opened from the English hub is in English", pg.evaluate("document.getElementById('modFrame').contentDocument.documentElement.lang") == "en")
    pg.evaluate("document.getElementById('modFrame').contentDocument.getElementById('langBtn').click()"); pg.wait_for_timeout(300)
    R.check("tool switches to Arabic", pg.evaluate("document.getElementById('modFrame').contentDocument.documentElement.lang") == "ar")
    pg.evaluate("document.getElementById('modFrame').contentDocument.getElementById('ciaHomeBtn').click()"); pg.wait_for_timeout(500)
    R.check("hub follows the tool back to Arabic", pg.evaluate("document.documentElement.lang") == "ar", pg.evaluate("document.documentElement.lang"))
    pg.evaluate("openModule('iso27001')"); frame_ready(pg)
    R.check("next tool opens in Arabic", pg.evaluate("document.getElementById('modFrame').contentDocument.documentElement.lang") == "ar")
    pg.evaluate("closeModule()"); pg.wait_for_timeout(300)

    # ---- knowledge-centre guide links land on the right tab
    for lang in ("ar", "en"):
        if pg.evaluate("document.documentElement.lang") != lang:
            pg.evaluate("document.getElementById('langBtn').click()"); pg.wait_for_timeout(300)
        pg.evaluate("showView('learn')"); pg.wait_for_timeout(150)
        guides = pg.evaluate("[...document.querySelectorAll('#kpath a.kguide')].map(a=>[a.dataset.mod,a.dataset.anchor])")
        if lang == "ar":
            need = {("pdca", "explain-cl"), ("capa", "explain-cl"), ("why5", "explain-std"), ("fish", "explain-std"), ("pareto", "explain-std"), ("rca", "explain-std"), ("a3", "explain-std"), ("dmaic", "explain-std"), ("iso10009", "explain-std"), ("iso10009", "explain-cl"), ("fmea", "explain-std"), ("lessons", "explain-std"), ("swot", "explain-std"), ("pestle", "explain-std"), ("iso9001", "explain-cl"), ("iso14001", "explain-cl"), ("iso45001", "explain-cl"),
                    ("iso27001", "explain-cl"), ("iso22301", "guide"), ("iso37301", "explain-cl"), ("iso37001", "explain-cl"),
                    ("iso31000", "explain-cl"), ("iso37000", "explain-cl")}
            R.check("knowledge centre has the new guide links", need <= set(map(tuple, guides)), sorted(need - set(map(tuple, guides))))
        for i, (k, a) in enumerate(guides):
            pg.evaluate(f"showView('learn')"); pg.wait_for_timeout(60)
            pg.evaluate(f"document.querySelectorAll('#kpath a.kguide')[{i}].click()")
            try:
                frame_ready(pg, a); ok = True
            except Exception:
                ok = False
            R.check(f"guide {lang} {k}#{a} lands on its tab", ok and pg.evaluate("document.getElementById('modFrame').dataset.k") == k,
                    pg.evaluate("location.hash"))
            fe = pg.evaluate("(document.getElementById('modFrame').contentWindow||{}).__e||[]")
            R.check(f"guide {lang} {k}#{a}: no errors", not fe and not errs, (fe + errs)[:3])
            del errs[:]
            pg.evaluate("closeModule()"); pg.wait_for_timeout(250)
    ctx.close()
    b.close()
R.save()
