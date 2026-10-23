"""Step 15 (2026-10-22): writes templates/org-profile-kit.html — the shared blocks of the connected platform.
    python3 tests/build/org/build_kit.py
- <style id="cia-org-css"> + <script id="cia-org-js">: the organization profile kit (org_kit.css, org_kit.js), carried byte-identical by the hub and
  every tool (patch_org_modules.py, patch_hub_profile.py).
- <style id="cia-linkui-css"> + <script id="cia-linkui-js">: the link panels (linkui.css, linkui.js), carried byte-identical by every tool with a
  link panel (patch_links_*.py), each with its own configuration block <script id="cia-links-cfg"> (links/<tool>.js).
- <script id="cia-readers-js">: the read-only readers (readers.js) with the tool registry copied from the hub (TOOLS + URLS of index.html) and the
  plan metadata of the nine ISO toolkits (iso_meta.json, from org_labels.py). Carried byte-identical by the hub and every tool with a link panel."""
import os, re, json
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.abspath(os.path.join(HERE, "..", "..", ".."))
idx = open(os.path.join(ROOT, "index.html"), encoding="utf-8").read()
urls = dict(re.findall(r'^\s+(\w+):\s+"\./modules/([\w-]+)\.html"', idx[idx.find("const URLS = {"):idx.find("};", idx.find("const URLS = {"))], re.M))
reg = re.findall(r'\{k:"([a-z0-9]+)",\s*sys:"([a-z]+)",\s*key:"([^"]+)",\s*code:"([^"]+)",\s*n:B\("([^"]+)","([^"]+)"\)', idx)
assert len(reg) == 39 and all(k in urls for k, *_ in reg), (len(reg), [k for k, *_ in reg if k not in urls])
REG = [[k, sys, key, urls[k], code, {"en": en, "ar": ar}] for k, sys, key, code, en, ar in reg]
QM = json.load(open(os.path.join(HERE, "iso_meta.json")))
rd = open(os.path.join(HERE, "readers.js"), encoding="utf-8").read()
assert rd.count("__REG__") == 1 and rd.count("__ISOMETA__") == 1
rd = rd.replace("__REG__", json.dumps(REG, ensure_ascii=False, separators=(",", ":"))).replace("__ISOMETA__", json.dumps(QM, separators=(",", ":")))
css = open(os.path.join(HERE, "org_kit.css"), encoding="utf-8").read().strip()
lcss = open(os.path.join(HERE, "linkui.css"), encoding="utf-8").read().strip()
ljs = open(os.path.join(HERE, "linkui.js"), encoding="utf-8").read().strip()
js = open(os.path.join(HERE, "org_kit.js"), encoding="utf-8").read().strip()
out = ("<!-- CIA shared blocks v1 (step 15, 2026-10-22): the organization profile kit (cia-org-css, cia-org-js) is carried byte-identical by the hub and\n"
       "     every tool; the readers (cia-readers-js) by the hub and every tool with a link panel. Built by tests/build/org/build_kit.py; checked by\n"
       "     tests/platform/t_static.py. Author: مدثر سلامه. -->\n"
       '<style id="cia-org-css">\n' + css + "\n</style>\n"
       '<script id="cia-org-js">\n' + js + "\n</script>\n"
       '<script id="cia-readers-js">\n' + rd.strip() + "\n</script>\n"
       '<style id="cia-linkui-css">\n' + lcss + "\n</style>\n"
       '<script id="cia-linkui-js">\n' + ljs + "\n</script>\n")
open(os.path.join(ROOT, "templates", "org-profile-kit.html"), "w", encoding="utf-8").write(out)
print("templates/org-profile-kit.html", len(out), "bytes;", len(REG), "tools in the registry")
