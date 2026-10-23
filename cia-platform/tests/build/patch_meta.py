"""Step 15 (2026-10-22), Part D: share card, description and version stamp on every page.
    python3 tests/build/patch_meta.py        (every module and index.html)
Each tool's <head> gains, before its first </head>: a description when it had none, Open Graph tags (type, site name, title = the page title,
description, image = assets/cia-share.jpg 1200×630 with its alt text, locale ar_SA / en_US) and a Twitter card, and <meta name="cia-version">.
The hub keeps its Open Graph tags and gains the version stamp. Nothing visible changes."""
import os, re, glob, html
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
VER = "1.0.0 · 2026-10-22"
idx = open(os.path.join(ROOT, "index.html"), encoding="utf-8").read()
urls = dict((f, k) for k, f in re.findall(r'^\s+(\w+):\s+"\./modules/([\w-]+)\.html"', idx, re.M))
names = {k: (en, ar) for k, en, ar in re.findall(r'\{k:"([a-z0-9]+)",\s*sys:"[a-z]+",\s*key:"[^"]+",\s*code:"[^"]+",\s*n:B\("([^"]+)","([^"]+)"\)', idx)}
for p in sorted(glob.glob(os.path.join(ROOT, "modules", "*.html"))):
    s = open(p, encoding="utf-8").read(); f = os.path.basename(p)[:-5]
    if 'name="cia-version"' in s: continue
    i = s.find("</head>"); assert 0 < i < s.find("<body"), f
    title = html.unescape(re.search(r"<title>([^<]*)</title>", s[:i]).group(1))
    en, ar = names[urls[f]]
    desc = f"{ar} — {en}. أداة تفاعلية ثنائية اللغة من أكاديمية التحسين المستمر، إعداد مدثر سلامه."
    e = lambda x: html.escape(x, quote=True)
    add = ("" if 'name="description"' in s[:i] else f'<meta name="description" content="{e(desc)}">\n') + \
        f'''<meta property="og:type" content="website">
<meta property="og:site_name" content="أكاديمية التحسين المستمر — Continual Improvement Academy">
<meta property="og:title" content="{e(title)}">
<meta property="og:description" content="{e(desc)}">
<meta property="og:image" content="../assets/cia-share.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="{e(ar + ' — ' + en)}">
<meta property="og:locale" content="ar_SA">
<meta property="og:locale:alternate" content="en_US">
<meta name="twitter:card" content="summary_large_image">
<meta name="cia-version" content="{VER}">
'''
    s = s[:i] + add + s[i:]; open(p, "w", encoding="utf-8").write(s)
p = os.path.join(ROOT, "index.html"); s = open(p, encoding="utf-8").read()
if 'name="cia-version"' not in s:
    a = '<meta name="twitter:card" content="summary_large_image">'; assert s.count(a) == 1
    s = s.replace(a, a + f'\n<meta name="cia-version" content="{VER}">'); open(p, "w", encoding="utf-8").write(s)
print("share card and version stamp on every page")
