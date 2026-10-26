"""Prepare the CIA platform for its new address. Usage: python3 -I add_move.py <platform-dir> https://new-domain [--test old-origin]

Adds move/move.js and move/move.css to index.html with the new address filled in, and writes move-ping.png next to it.
Upload the result to the current site BEFORE connecting the domain: from then on the old address shows a notice
("we are moving soon"); once the new address answers, the copy kept in visitors' browsers shows "we have moved" and
moves their saved work to the new address in one click. --test replaces the GitHub address with a local origin.
Re-runnable; run it before add_pwa.py."""
import sys, os, re, json
from urllib.parse import urlparse

here = os.path.dirname(os.path.abspath(__file__))
src = os.path.join(here, "..", "move")
root, to = sys.argv[1], sys.argv[2].rstrip("/")
u = urlparse(to)
if u.scheme not in ("https", "http") or not u.netloc:
    sys.exit("the new address must look like https://example.com")
old = ["https://moddathersalamaeng-sudo.github.io"]
if "--test" in sys.argv:
    old = [sys.argv[sys.argv.index("--test") + 1].rstrip("/")]
cfg = {"to": to, "fromHosts": [urlparse(o).netloc for o in old], "fromOrigins": old}

path = os.path.join(root, "index.html")
s = open(path, encoding="utf-8").read()
s = re.sub(r"<!-- cia-move:start -->.*?<!-- cia-move:end -->", "", s, flags=re.S)
s = re.sub(r"/\* cia-move:start \*/.*?/\* cia-move:end \*/", "", s, flags=re.S)


def rep(old_, new):
    global s
    n = s.count(old_)
    if n != 1:
        sys.exit(f"expected 1 x {old_[:70]!r}, found {n}")
    s = s.replace(old_, new)


css = open(os.path.join(src, "move.css"), encoding="utf-8").read().strip()
js = open(os.path.join(src, "move.js"), encoding="utf-8").read().strip()
js = re.sub(r"/\*MOVE_CONFIG\*/.*?/\*END\*/", "/*MOVE_CONFIG*/" + json.dumps(cfg) + "/*END*/", js, count=1, flags=re.S)
rep("</style>\n</head>", "/* cia-move:start */\n" + css + "\n/* cia-move:end */</style>\n</head>")
rep("/* init */\n(function(){", "/* cia-move:start */\n" + js + "\n/* cia-move:end *//* init */\n(function(){")
open(path, "w", encoding="utf-8").write(s)
import base64
# a 1x1 transparent PNG: the old address loads it to know the new one is live
open(os.path.join(root, "move-ping.png"), "wb").write(base64.b64decode("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="))
print("moving to", to, "from", ", ".join(old))
