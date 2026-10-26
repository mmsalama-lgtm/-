"""Add the certification finder to the CIA platform. Usage: python3 -I add_certs.py <platform-dir>

Adds to index.html a view (#certs, "مرشد الشهادات"): 15 questions about the organization (field, size, customers,
activities, risks, readiness), then a report for top management: readiness with strengths and improvement opportunities, the certificates that fit
(ISO 9001 always as the base), accreditations, guidance standards, a priority matrix, an implementation timeline, a
training plan, obstacles and the decision required; with print, copy and a pre-filled consultation request. Also a
menu entry after the Advisor, and the Advisor and the finder as two cards under the home page's main buttons. The tool catalogue (39 tools) is not touched.
Sources: certs/certs-data.js, certs/certs.js, certs/certs.css. Re-runnable; run it before add_pwa.py."""
import sys, os, re

here = os.path.dirname(os.path.abspath(__file__))
src = os.path.join(here, "..", "certs")
root = sys.argv[1]
path = os.path.join(root, "index.html")
s = open(path, encoding="utf-8").read()
s = re.sub(r"<!-- cia-certs:start -->.*?<!-- cia-certs:end -->", "", s, flags=re.S)
s = re.sub(r"/\* cia-certs:start \*/.*?/\* cia-certs:end \*/", "", s, flags=re.S)


def rep(old, new):
    global s
    n = s.count(old)
    if n != 1:
        sys.exit(f"expected 1 x {old[:70]!r}, found {n}")
    s = s.replace(old, new)


read = lambda f: open(os.path.join(src, f), encoding="utf-8").read().strip()
rep("</style>\n</head>", "/* cia-certs:start */\n" + read("certs.css") + "\n/* cia-certs:end */</style>\n</head>")
rep('  <section id="start" class="band" data-view="start" hidden>',
    '  <!-- cia-certs:start --><section id="certs" data-view="certs" hidden aria-labelledby="ctTitle"><div class="wrap">'
    '<div class="sec-head"><div><span class="sec-k" id="ctK"></span><h2 id="ctTitle"></h2><p id="ctSub"></p></div></div><div id="ctBody"></div></div></section>\n\n'
    '  <!-- cia-certs:end --><section id="start" class="band" data-view="start" hidden>')
# the Advisor and the certification finder as two cards right under the home page's main buttons
rep('        <p class="h2-by">', '        <!-- cia-certs:start --><div class="ct-guides-h" id="ctGuides"></div><!-- cia-certs:end --><p class="h2-by">')
rep("/* init */\n(function(){", "/* cia-certs:start */\n" + read("certs-data.js") + "\n" + read("certs.js") + "\n/* cia-certs:end *//* init */\n(function(){")
open(path, "w", encoding="utf-8").write(s)
print("certification finder added")
