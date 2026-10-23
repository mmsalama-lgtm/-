"""Shared by the step-15 hub suites (2026-10-22): test_profile, test_map, test_actions, test_integrated_report.
Serve the platform over http first (CIA_BASE, default http://127.0.0.1:8802). The example data of every tool is read from the tools themselves
(each tool's own example buttons, Date and Math.random frozen) once per run and kept in tests/hub/results/examples.json."""
import os, sys, re, json, time
from playwright.sync_api import sync_playwright  # noqa: F401
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "platform"))
from common import launch, new_page, load_example, modules  # noqa: E402
BASE = os.environ.get("CIA_BASE", "http://127.0.0.1:8802")
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
RES = os.path.join(os.path.dirname(__file__), "results"); os.makedirs(RES, exist_ok=True)
FREEZE = """(function(){ var T=Date.UTC(2026,9,22,9,0,0), OD=Date;
 function FD(){ if(!(this instanceof FD)) return new OD(T).toString(); var a=[].slice.call(arguments);
   return a.length? new (Function.prototype.bind.apply(OD,[null].concat(a)))() : new OD(T); }
 FD.prototype=OD.prototype; FD.now=function(){ return T; }; FD.UTC=OD.UTC; FD.parse=OD.parse; window.Date=FD;
 var s=20261022; Math.random=function(){ s=(s*16807)%2147483647; return (s-1)/2147483646; }; })();"""
BAD = ["undefined", "NaN", "[object Object]"]
PROFILE = {"v": 1, "name": {"ar": "شركة الريادة للمقاولات والطاقة", "en": "Al-Riyada Contracting & Energy"}, "legal": "شركة الريادة للمقاولات والطاقة المحدودة",
           "cr": "1010998877", "sector": "ene", "size": "l", "country": "sa", "city": "الرياض",
           "sites": [{"name": "المقر الرئيسي — الرياض", "city": "الرياض", "act": "الإدارة"}, {"name": "ساحة الدمام", "city": "الدمام", "act": "تصنيع"}],
           "depts": ["الجودة", "السلامة", "المشتريات"], "top": "م. أحمد العتيبي", "qhse": "م. سارة القحطاني", "prepFor": "الرئيس التنفيذي", "prepBy": "مدثر سلامه",
           "email": "qhse@example.com", "phone": "+966 11 000 0000", "scope": {"ar": "كل المواقع في الرياض والدمام", "en": "All sites in Riyadh and Dammam"},
           "held": ["ISO 9001:2026"], "target": ["ISO 45001:2018"], "fy": "01", "lang": "ar", "logo": "", "brand": "#1E8C93"}
results = []


def check(name, cond, detail=""):
    results.append((name, bool(cond), str(detail)[:600] if not cond else ""))
    print(("PASS " if cond else "FAIL ") + name + (("  -- " + str(detail)[:400]) if detail and not cond else ""), flush=True)


def save(name):
    n = len(results); f = sum(1 for r in results if not r[1])
    json.dump({"name": name, "checks": n, "failed": f, "rows": [{"label": a, "ok": b, "detail": c} for a, b, c in results]},
              open(os.path.join(os.path.dirname(__file__), "..", "platform", "results", name + ".json"), "w"), ensure_ascii=False, indent=1)
    print(f"== {name}: {n - f}/{n} passed", flush=True)
    return f


def examples(b):
    """every tool's example state, read through the tools' own example buttons (cached for the run)"""
    p = os.path.join(RES, "examples.json")
    if os.path.exists(p) and time.time() - os.path.getmtime(p) < 6 * 3600:
        return json.load(open(p, encoding="utf-8"))
    out = {}
    for m in modules():
        ctx, pg, errs = new_page(b, "ar", 1280, 900, tour_done=[m], extra_init=FREEZE)
        pg.goto(f"{BASE}/modules/{m}.html", wait_until="load"); pg.wait_for_timeout(350)
        load_example(pg, 600)
        st = pg.evaluate("()=>{const o={}; Object.keys(localStorage).forEach(k=>{ if(!/^cia-(tour|lang)/.test(k) && !/:lang$/.test(k)) o[k]=localStorage.getItem(k); }); return o;}")
        out.update(st); ctx.close()
    json.dump(out, open(p, "w", encoding="utf-8"), ensure_ascii=False)
    return out


def hub(b, lang="ar", w=1280, h=900, seed=None, profile=None, hash_="#home", freeze=True):
    init = "try{if(!sessionStorage.getItem('h-init')){sessionStorage.setItem('h-init','1');"
    if seed:
        init += "var S=%s; for(var k in S) localStorage.setItem(k,S[k]);" % json.dumps(seed)
    if profile:
        init += "localStorage.setItem('cia-org:v1',%s);" % json.dumps(json.dumps(profile))
    init += "localStorage.setItem('cia-hub-tour','done');}}catch(e){}"
    ctx, pg, errs = new_page(b, lang, w, h, tour_done=modules(), extra_init=(FREEZE if freeze else "") + init)
    pg.goto(f"{BASE}/index.html{hash_}", wait_until="load"); pg.wait_for_timeout(900)
    return ctx, pg, errs


def overflow(pg):
    return pg.evaluate("document.documentElement.scrollWidth-innerWidth")


def bad_words(t):
    return [w for w in BAD if w in t]
