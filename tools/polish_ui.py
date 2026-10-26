"""Tidy the CIA platform's interface. Usage: python3 -I polish_ui.py <platform-dir>

Adds to index.html the CSS in ui/ui.css and the script in ui/ui.js: one menu button on every screen size that opens
all the sections in three groups (instead of a top bar where some items scroll out of sight), plus the layout
touches listed in those files. The content is not changed. Re-runnable: it replaces its own previous additions, and
stops before writing anything if the hub code around them changed. Run it before add_pwa.py."""
import sys, os, re

here = os.path.dirname(os.path.abspath(__file__))
src = os.path.join(here, "..", "ui")
root = sys.argv[1]
path = os.path.join(root, "index.html")
s = open(path, encoding="utf-8").read()
s = re.sub(r"<!-- cia-ui:start -->.*?<!-- cia-ui:end -->", "", s, flags=re.S)
s = re.sub(r"/\* cia-ui:start \*/.*?/\* cia-ui:end \*/", "", s, flags=re.S)


def rep(old, new):
    global s
    n = s.count(old)
    if n != 1:
        sys.exit(f"expected 1 x {old[:70]!r}, found {n}")
    s = s.replace(old, new)


css = open(os.path.join(src, "ui.css"), encoding="utf-8").read().strip()
js = open(os.path.join(src, "ui.js"), encoding="utf-8").read().strip()

rep("</style>\n</head>", "/* cia-ui:start */\n" + css + "\n/* cia-ui:end */</style>\n</head>")
rep("/* init */\n(function(){", "/* cia-ui:start */\n" + js + "\n/* cia-ui:end *//* init */\n(function(){")
# the menu now serves wide screens too, so a resize no longer closes it
rep('window.addEventListener("resize", ()=>{ if(innerWidth>1020) closeMenu(); });',
    'window.addEventListener("resize", ()=>{ /* cia-ui:start */if(false)/* cia-ui:end */if(innerWidth>1020) closeMenu(); });')

# ---------- every tool: the shared opening card and section tiles (the tools share one page structure) ----------
tcss = open(os.path.join(src, "tool.css"), encoding="utf-8").read().strip()
TOOL = "<!-- cia-ui:start --><style>\n" + tcss + "\n</style><!-- cia-ui:end -->"
tools = dict(re.findall(r'(\w+):\s*"\./modules/([\w.-]+\.html)"', s))
if len(tools) < 10:
    sys.exit("tool list (URLS) not found in index.html")
styled = {}
for fname in sorted(set(tools.values())):
    mp = os.path.join(root, "modules", fname)
    if not os.path.exists(mp):
        continue
    t = open(mp, encoding="utf-8").read()
    t = re.sub(r"<!-- cia-ui:start -->.*?<!-- cia-ui:end -->", "", t, count=1, flags=re.S)
    m = re.search(r"</head>\s*<body", t)   # the page's own head; later copies sit inside print templates
    if not m:
        sys.exit(f"{fname}: </head> not found")
    styled[mp] = t[:m.start()] + TOOL + t[m.start():]

for mp, t in styled.items():
    open(mp, "w", encoding="utf-8").write(t)
open(path, "w", encoding="utf-8").write(s)
print(f"interface touches added to the hub and {len(styled)} tools")
