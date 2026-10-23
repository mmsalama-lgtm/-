"""The hub overlay keeps unsaved edits — step 15, 2026-10-22. Serve the platform over http first (CIA_BASE, default http://127.0.0.1:8802).
A tool with a record form (CAPA) holding typed, unsaved edits: asking for another tool asks first; Cancel keeps the tool and the typed value;
OK opens the other tool. Without typing, or after saving or starting a new record, no question is asked. Usage: python3 tests/hub/test_overlay.py"""
import os, sys
sys.path.insert(0, os.path.dirname(__file__))
from hubkit import *  # noqa

with sync_playwright() as p:
    b = launch(p)
    ctx = b.new_context(viewport={"width": 1280, "height": 900}); pg = ctx.new_page(); errs = []; dlg = []
    pg.on("pageerror", lambda e: errs.append(str(e)))
    ans = {"v": False}
    def on_dialog(d):
        dlg.append(d.message); (d.accept() if ans["v"] else d.dismiss())
    pg.on("dialog", on_dialog)
    pg.add_init_script("try{localStorage.setItem('cia-lang','ar'); localStorage.setItem('cia-tour:m:capa','done'); localStorage.setItem('cia-tour:m:iso9001','done'); localStorage.setItem('cia-tour:m:pdca','done');}catch(e){}")
    pg.goto(f"{BASE}/index.html#home"); pg.wait_for_timeout(600)
    pg.evaluate("openModule('capa', undefined, 'tools')"); pg.wait_for_function("document.getElementById('modFrame').dataset.k==='capa'"); pg.wait_for_timeout(1200)
    fr = [f for f in pg.frames if f.url.endswith("capa.html#tools") or "capa.html" in f.url][0]
    pg.evaluate("openModule('pdca')"); pg.wait_for_timeout(1200)
    check("no typing: another tool opens without a question", not dlg and pg.evaluate("document.getElementById('modFrame').dataset.k") == "pdca")
    pg.evaluate("openModule('capa', undefined, 'tools')"); pg.wait_for_function("document.getElementById('modFrame').dataset.k==='capa'"); pg.wait_for_timeout(1200)
    fr = [f for f in pg.frames if "capa.html" in f.url][0]
    fr.fill("#f-title", "سجل لم يُحفظ بعد"); pg.wait_for_timeout(100)
    ans["v"] = False; pg.evaluate("openModule('iso9001')"); pg.wait_for_timeout(800)
    check("unsaved edits: the hub asks before opening another tool", len(dlg) == 1 and "لم تُحفظ" in dlg[0], dlg)
    fr = [f for f in pg.frames if "capa.html" in f.url][0]
    check("Cancel keeps the open tool and the typed value", pg.evaluate("document.getElementById('modFrame').dataset.k") == "capa" and fr.input_value("#f-title") == "سجل لم يُحفظ بعد")
    ans["v"] = True; pg.evaluate("openModule('iso9001')"); pg.wait_for_timeout(1200)
    check("OK opens the other tool", len(dlg) == 2 and pg.evaluate("document.getElementById('modFrame').dataset.k") == "iso9001")
    pg.evaluate("openModule('capa', undefined, 'tools')"); pg.wait_for_function("document.getElementById('modFrame').dataset.k==='capa'"); pg.wait_for_timeout(1200)
    fr = [f for f in pg.frames if "capa.html" in f.url][0]
    fr.fill("#f-title", "x"); fr.click("#newBtn"); pg.wait_for_timeout(150)
    n = len(dlg); pg.evaluate("openModule('pdca')"); pg.wait_for_timeout(900)
    check("after 'New record' clears the form, no question is asked", len(dlg) == n and pg.evaluate("document.getElementById('modFrame').dataset.k") == "pdca")
    check("no errors", not errs, errs[:3])
    b.close()
sys.exit(1 if save("hub-overlay") else 0)
