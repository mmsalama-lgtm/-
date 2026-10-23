"""Which tool reads which other tool (2026-10-22; step 15 adds the link panels and the link types).
    python3 tests/build/links_inventory.py
1. Scans every module for the other tools' storage keys (the hub registry in index.html gives key <-> tool). The shared blocks carried by every
   tool or every linked tool are left out of this scan (cia-org-js, cia-readers-js, cia-linkui-js, cia-links-cfg): they name every key but are
   not a link by themselves.
2. Adds the links each tool's link panel declares (the /*CIA-LINKS {...}*/ line at the top of its cia-links-cfg block).
3. Gives every link a type: start (starts a new record here from a record there), panel (shows the other tool's records read-only),
   outcome (the other tool sends an outcome here), reads (reads the other tool's results by its rules).
Writes tests/build/links.json ({tool: [tools it reads]}, the format of step 14.1) and tests/build/link_types.json ({tool: [[tool, type], ...]}).
Read-only links only: the platform never writes another tool's key. The organization profile (cia-org:v1) reaches every tool and is counted apart."""
import os, re, json
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
HERE = os.path.dirname(os.path.abspath(__file__))
idx = open(os.path.join(ROOT, "index.html"), encoding="utf-8").read()
reg = re.findall(r'\{k:"([a-z0-9]+)",\s*sys:"[a-z]+",\s*key:"([^"]+)"', idx)
k2key = dict(reg); key2k = {v: k for k, v in reg}
urls = dict(re.findall(r'^\s+(\w+):\s+"\./modules/([\w-]+)\.html"', idx, re.M))
SHARED = ("cia-org-js", "cia-readers-js", "cia-linkui-js", "cia-links-cfg")
def strip(s, id_):
    i = s.find('<script id="%s"' % id_)
    if i < 0: return s, ""
    j = s.find("</script>", i) + 9
    return s[:i] + s[j:], s[i:j]
READS = {"w8", "iso10009", "pmoexc", "kaqa", "iso37000", "iso42005", "aireg", "iso27701"}
PANEL = {("capa", "why5"), ("capa", "fish"), ("capa", "rca"), ("rca", "a3"), ("a3", "dmaic"), ("dmaic", "fmea"), ("fmea", "lessons"), ("why5", "fish"), ("fish", "pareto")}
links, types, profile = {}, {}, []
for k, f in urls.items():
    s = open(os.path.join(ROOT, "modules", f + ".html"), encoding="utf-8").read()
    cfg = ""
    for id_ in SHARED:
        s, b = strip(s, id_)
        if id_ == "cia-links-cfg": cfg = b
    if "cia-org:v1" in open(os.path.join(ROOT, "modules", f + ".html"), encoding="utf-8").read(): profile.append(k)
    found = sorted({key2k[x] for x in re.findall(r'"([a-z0-9-]+:v1)"', s) if x in key2k and x != k2key.get(k)})
    T = {x: ("reads" if k in READS else "panel" if (k, x) in PANEL else "start") for x in found}
    m = re.search(r"/\*CIA-LINKS (\{.*?\})\*/", cfg)
    if m:
        for ty, L in json.loads(m.group(1)).items():
            for x in L:
                if x != k and x not in T: T[x] = ty
    links[k] = sorted(T); types[k] = sorted([x, T[x]] for x in T)
json.dump(links, open(os.path.join(HERE, "links.json"), "w"), indent=1)
json.dump(types, open(os.path.join(HERE, "link_types.json"), "w"), indent=1)
iso = sorted(k for k in links if not links[k] and not any(k in v for v in links.values()))
print(len(links), "tools;", sum(len(v) for v in links.values()), "read-only links;", sum(1 for v in links.values() if not v), "tools read no other tool;",
      len(iso), "tools neither read nor are read" + (": " + ", ".join(iso) if iso else "") + ";", len(profile), "tools read the organization profile")
