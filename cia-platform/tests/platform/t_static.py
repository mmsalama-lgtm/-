"""Static checks: Explain Kit byte identity, tour layer identity, node syntax check of every inline script,
and the checksum list of changed files against the previous release folder (CIA_ORIG_DIR)."""
import os, re, sys, json, hashlib, subprocess, tempfile
sys.path.insert(0, os.path.dirname(__file__))
from common import ROOT, RES, Report, modules

ORIG_DIR = os.environ.get("CIA_ORIG_DIR", "/home/claude/orig")
R = Report("static")


def block(s, tag, id_):
    i = s.find('<%s id="%s">' % (tag, id_))
    if i < 0:
        return None
    j = s.find('</%s>' % tag, i)
    return s[i:j + len(tag) + 3]


tpl = open(os.path.join(ROOT, "templates", "explain-kit-template.html"), encoding="utf-8").read()
T_CSS, T_JS = block(tpl, "style", "cia-explain-kit-css"), block(tpl, "script", "cia-explain-kit-js")
R.check("template has both kit blocks", T_CSS and T_JS)

kit_tools, no_kit = [], []
tour_variants = {}
for m in modules():
    s = open(os.path.join(ROOT, "modules", m + ".html"), encoding="utf-8").read()
    css, js = block(s, "style", "cia-explain-kit-css"), block(s, "script", "cia-explain-kit-js")
    if css is None and js is None:
        no_kit.append(m)
    else:
        kit_tools.append(m)
        R.check(f"{m}: kit CSS block byte-identical to template", css == T_CSS, "differs")
        R.check(f"{m}: kit JS block byte-identical to template", js == T_JS, "differs")
        R.check(f"{m}: each kit block appears once", s.count('id="cia-explain-kit-css"') == 1 and s.count('id="cia-explain-kit-js"') == 1)
    tj = block(s, "script", "cia-tour-js")
    tc = block(s, "style", "cia-tour-css")
    R.check(f"{m}: guided tour layer present", tj is not None and tc is not None)
    if tj:
        norm = re.sub(r'var CFG=\{.*?\};', 'var CFG={};', tj, count=1)
        h = hashlib.sha1((norm + (tc or "")).encode()).hexdigest()[:10]
        tour_variants.setdefault(h, []).append(m)
R.check("every module carries the Explain Kit", not no_kit, no_kit)
same = [v for v in tour_variants.values() if "pdca" in v][0]
R.check("PDCA tour layer identical to the ISO 9001 one apart from its CFG line", "iso9001" in same, tour_variants)
R.check("CAPA tour layer identical to the PDCA one apart from its CFG line", "capa" in same, tour_variants)
R.check("5 Whys tour layer identical to the CAPA one apart from its CFG line", "five-whys" in same, tour_variants)
R.check("Fishbone tour layer identical to the 5 Whys one apart from its CFG line", "fishbone" in same, tour_variants)
R.check("Pareto tour layer identical to the Fishbone one apart from its CFG line", "pareto" in same, tour_variants)
R.check("RCA tour layer identical to the Pareto one apart from its CFG line", "rca" in same, tour_variants)
R.check("A3 tour layer identical to the RCA one apart from its CFG line", "a3" in same, tour_variants)
R.check("DMAIC tour layer identical to the A3 one apart from its CFG line", "dmaic" in same, tour_variants)
R.check("ISO 10009 tour layer identical to the DMAIC one apart from its CFG line", "iso10009" in same, tour_variants)
R.check("FMEA tour layer identical to the DMAIC one apart from its CFG line", "fmea" in same, tour_variants)
R.check("Lessons Learned tour layer identical to the FMEA one apart from its CFG line", "lessons" in same, tour_variants)
R.check("SWOT tour layer identical to the Lessons Learned one apart from its CFG line", "swot" in same, tour_variants)
R.check("PESTLE tour layer identical to the SWOT one apart from its CFG line", "pestle" in same, tour_variants)
R.check("Stakeholder Analysis tour layer identical to the PESTLE one apart from its CFG line", "stakeholders" in same, tour_variants)
# ---- shared toolbox engine: one marked block, identical in every tool that carries it
ENG_A, ENG_B = "/* CIA toolbox engine v1 — start */", "/* CIA toolbox engine v1 — end */"
engines = {}
for m in modules():
    s = open(os.path.join(ROOT, "modules", m + ".html"), encoding="utf-8").read()
    if ENG_A in s:
        R.check(f"{m}: engine block appears once", s.count(ENG_A) == 1 and s.count(ENG_B) == 1)
        engines[m] = s[s.find(ENG_A):s.find(ENG_B) + len(ENG_B)]
R.check("toolbox engine carried by PDCA, CAPA, 5 Whys, Fishbone, Pareto, RCA, A3, DMAIC, ISO 10009, FMEA, Lessons Learned, SWOT, PESTLE and Stakeholder Analysis (fourteen files)", {"pdca", "capa", "five-whys", "fishbone", "pareto", "rca", "a3", "dmaic", "iso10009", "fmea", "lessons", "swot", "pestle", "stakeholders"} <= set(engines) and len(engines) == 14, sorted(engines))
R.check("toolbox engine block identical in every tool that carries it", len(set(engines.values())) == 1, sorted(engines))
# other tools keep the tour variant they were released with (information only)

# ---- step 15: the organization profile kit (every tool and the hub), the readers and the link panels (the hub and every linked tool)
otpl = open(os.path.join(ROOT, "templates", "org-profile-kit.html"), encoding="utf-8").read()
OB = {i: block(otpl, t, i) for t, i in (("style", "cia-org-css"), ("script", "cia-org-js"), ("script", "cia-readers-js"), ("style", "cia-linkui-css"), ("script", "cia-linkui-js"))}
R.check("org-profile template has its five blocks", all(OB.values()))
linked = []
for m in modules():
    s = open(os.path.join(ROOT, "modules", m + ".html"), encoding="utf-8").read()
    for i in ("cia-org-css", "cia-org-js"):
        tag = "style" if i.endswith("css") else "script"
        R.check(f"{m}: {i} block byte-identical to the template and carried once", block(s, tag, i) == OB[i] and s.count('id="%s"' % i) == 1)
    if 'id="cia-links-cfg"' in s:
        linked.append(m)
        for i in ("cia-readers-js", "cia-linkui-css", "cia-linkui-js"):
            tag = "style" if i.endswith("css") else "script"
            R.check(f"{m}: {i} block byte-identical to the template", block(s, tag, i) == OB[i] and s.count('id="%s"' % i) == 1)
R.check("link panels in the nine linked tools", sorted(linked) == sorted(["capa", "iso31000-risk-studio", "ims-builder", "smart-audit-improvement", "strategy-performance",
        "excellence-efqm", "kaqa", "pmo-excellence", "executive-cockpit-workspace"]), linked)
hub = open(os.path.join(ROOT, "index.html"), encoding="utf-8").read()
for i in ("cia-org-css", "cia-org-js", "cia-readers-js"):
    tag = "style" if i.endswith("css") else "script"
    R.check(f"index.html: {i} block byte-identical to the template", block(hub, tag, i) == OB[i])

# ---- node --check of every inline script
SCRIPT = re.compile(r'<script(?![^>]*\bsrc=)([^>]*)>(.*?)</script>', re.S | re.I)
files = ["index.html"] + ["modules/" + m + ".html" for m in modules()] + \
        ["templates/" + f for f in sorted(os.listdir(os.path.join(ROOT, "templates"))) if f.endswith(".html")]
n_scripts = 0
tmpd = tempfile.mkdtemp()
for f in files:
    s = open(os.path.join(ROOT, f), encoding="utf-8").read()
    bad = []
    for k, m in enumerate(SCRIPT.finditer(s)):
        attrs, body = m.group(1), m.group(2)
        ty = re.search(r'type\s*=\s*"([^"]+)"', attrs)
        if ty and ty.group(1).lower() not in ("text/javascript", "module", "application/javascript"):
            continue
        if not body.strip():
            continue
        n_scripts += 1
        p = os.path.join(tmpd, "s%d.%s" % (k, "mjs" if ty and ty.group(1) == "module" else "js"))
        open(p, "w", encoding="utf-8").write(body)
        r = subprocess.run(["node", "--check", p], capture_output=True, text=True)
        if r.returncode != 0:
            bad.append((k, attrs.strip()[:60], r.stderr.strip().splitlines()[-1][:200] if r.stderr.strip() else "?"))
    R.check(f"{f}: every inline script passes node --check", not bad, bad)

# ---- changed files against the previous release (checksums)
def tree(d):
    out = {}
    for base, _, fs in os.walk(d):
        for x in fs:
            p = os.path.join(base, x)
            rel = os.path.relpath(p, d)
            if rel.startswith("tests/platform/results") or "__pycache__" in rel:
                continue
            out[rel] = hashlib.sha256(open(p, "rb").read()).hexdigest()
    return out

changes = {}
if os.path.isdir(ORIG_DIR):
    a, b = tree(ORIG_DIR), tree(ROOT)
    changes = {"changed": sorted(k for k in a if k in b and a[k] != b[k]),
               "added": sorted(k for k in b if k not in a),
               "removed": sorted(k for k in a if k not in b),
               "unchanged": len([k for k in a if k in b and a[k] == b[k]]),
               "sha256": {k: b[k] for k in sorted(b) if k not in a or a[k] != b[k]}}
    R.check("no file removed from the previous release", not changes["removed"], changes["removed"])
    print("changed:", len(changes["changed"]), "added:", len(changes["added"]), "unchanged:", changes["unchanged"])

R.save({"kit_tools": kit_tools, "no_kit": no_kit, "inline_scripts_checked": n_scripts, "changes": changes,
        "tour_variants": {k: len(v) for k, v in tour_variants.items()}})
