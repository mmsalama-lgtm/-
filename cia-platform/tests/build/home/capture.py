"""Capture tool screenshots for the hub showcase. Example data loaded in each tool; 1280x800 viewport at 1.5x density."""
import sys, os, json
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "platform"))
from common import BASE, launch, new_page, modules, load_example, sync_playwright
OUT = sys.argv[1] if len(sys.argv) > 1 else "shots_raw"
ONLY = sys.argv[2].split(",") if len(sys.argv) > 2 else None
SHOTS = json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "shots.json")))
os.makedirs(OUT, exist_ok=True)
HIDE_FIXED = """()=>{ for(const e of document.querySelectorAll('body *')){ const cs=getComputedStyle(e); if(cs.position==='fixed'){ const r=e.getBoundingClientRect(); if(r.top>innerHeight*0.5 && r.width<500) e.style.visibility='hidden'; } } }"""
with sync_playwright() as p:
    b = launch(p)
    _nc = b.new_context
    b.new_context = lambda **kw: _nc(device_scale_factor=1.5, **kw)
    for s in SHOTS:
        if ONLY and s["key"] not in ONLY: continue
        for lang in ("ar", "en"):
            ctx, pg, errs = new_page(b, lang, 1280, 800, tour_done=modules())
            pg.goto(f"{BASE}/modules/{s['file']}.html", wait_until="load"); pg.wait_for_timeout(700)
            pg.evaluate("document.documentElement.style.scrollBehavior='auto'")
            if s.get("example", True): load_example(pg, 800)
            pg.evaluate("(t)=>{const b=document.querySelector('#side button[data-t=\"'+t+'\"]')||document.querySelector('#side button[data-go=\"'+t+'\"]'); b&&b.click();}", s["tab"])
            pg.wait_for_timeout(900)
            if s.get("js"): pg.evaluate(s["js"]); pg.wait_for_timeout(600)
            pg.evaluate(HIDE_FIXED)
            sel = ".tabpane"; f = f"{OUT}/{s['key']}-{s['view']}-{lang}.png"
            if s.get("anchor"):
                pg.evaluate("(a)=>{ const e=(new Function('return '+a))(); if(e){ e.scrollIntoView({block:'start',behavior:'instant'}); window.scrollBy({top:-14,behavior:'instant'}); } }", s["anchor"]); pg.wait_for_timeout(500)
                pane = pg.evaluate("(sel)=>{ const e=[...document.querySelectorAll(sel)].find(e=>e.getClientRects().length); const r=e.getBoundingClientRect(); return {x:r.left, w:r.width}; }", sel)
                x = max(0, pane["x"]); w = min(1280 - x, pane["w"]); h = w / 1.6
                pg.screenshot(path=f, clip={"x": x, "y": 0, "width": w, "height": min(800, h)})
            else:
                pg.evaluate("(sel)=>{ const e=[...document.querySelectorAll(sel)].find(e=>e.getClientRects().length); if(e){ e.scrollIntoView({block:'start',behavior:'instant'}); window.scrollBy({top:-12,behavior:'instant'}); } }", sel)
                pg.wait_for_timeout(500)
                box = pg.evaluate("(sel)=>{ const e=[...document.querySelectorAll(sel)].find(e=>e.getClientRects().length); const r=e.getBoundingClientRect(); return {x:r.left, y:r.top, w:r.width}; }", sel)
                x = max(0, box["x"]); y = max(0, box["y"]); w = min(1280 - x, box["w"]); h = min(800 - y, w / 1.6)
                pg.screenshot(path=f, clip={"x": x, "y": y, "width": w, "height": h})
            print(s["key"], lang, "errors:", errs[:2], flush=True)
            ctx.close()
    b.close()
