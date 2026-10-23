"""Shared by tests/build/patch_links_*.py (step 15, 2026-10-22): put the readers, the link panels and one tool's link configuration into that tool.
Inserted just before the organization profile kit (anchor <style id="cia-org-css">, exactly once), so they run after the tool's own scripts.
Blocks: cia-readers-js, cia-linkui-css, cia-linkui-js (byte-identical to templates/org-profile-kit.html) and cia-links-cfg (links/<name>.js).
Re-running replaces the blocks. Nothing else in the tool changes: no stored state, question, score, report, CSV or example."""
import os, re
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.abspath(os.path.join(HERE, "..", "..", ".."))

def block(s, tag, id_):
    i = s.find('<%s id="%s"' % (tag, id_))
    if i < 0: return None
    j = s.find('</%s>' % tag, i); return s[i:j + len(tag) + 3]

def hub_ciadash():
    """the hub's adapters (CIADASH), copied verbatim from index.html"""
    idx = open(os.path.join(ROOT, "index.html"), encoding="utf-8").read()
    a = idx.find("const CIADASH = (function(){"); b = idx.find("/* ===================== PERFORMANCE DASHBOARD", a)
    assert a > 0 and b > a
    return idx[a:b].rstrip() + "\n"

def apply(module, cfg_name, data_t="", extra=""):
    tpl = open(os.path.join(ROOT, "templates", "org-profile-kit.html"), encoding="utf-8").read()
    p = os.path.join(ROOT, "modules", module + ".html"); s = open(p, encoding="utf-8").read()
    for tag, id_ in (("script", "cia-readers-js"), ("style", "cia-linkui-css"), ("script", "cia-linkui-js"), ("script", "cia-links-cfg")):
        old = block(s, tag, id_)
        if old: s = s.replace(old + "\n", "", 1)
    cfg = open(os.path.join(HERE, "links", cfg_name + ".js"), encoding="utf-8").read().strip()
    add = (block(tpl, "script", "cia-readers-js") + "\n" + block(tpl, "style", "cia-linkui-css") + "\n" + block(tpl, "script", "cia-linkui-js") + "\n"
           + '<script id="cia-links-cfg"' + (' data-t="%s"' % data_t if data_t else "") + ">\n" + extra + cfg + "\n</script>\n")
    A = '<style id="cia-org-css">'
    assert s.count(A) == 1, (module, s.count(A))
    s = s.replace(A, add + A)
    open(p, "w", encoding="utf-8").write(s)
    print(module + ".html: link panel", cfg_name, "(%d bytes added)" % len(add))
