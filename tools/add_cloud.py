"""Add optional accounts and cloud save to the CIA platform. Usage: python3 -I add_cloud.py <platform-dir>

Copies the Supabase browser library to assets/vendor/, admin.html next to index.html, and cloud-config.js (only if the
platform does not have one yet, so the keys already filled in are kept), and adds to index.html: the account button,
the sign-in dialog, the sync engine, and the database copy of feedback and requests. The tools are not touched.
While cloud-config.js is empty nothing changes for the visitor. Re-runnable: it replaces its own previous additions,
and stops before writing anything if the hub code around them changed."""
import sys, os, re, shutil

here = os.path.dirname(os.path.abspath(__file__))
src = os.path.join(here, "..", "cloud")
root = sys.argv[1]
path = os.path.join(root, "index.html")
s = open(path, encoding="utf-8").read()
s = re.sub(r"<!-- cia-cloud:start -->.*?<!-- cia-cloud:end -->", "", s, flags=re.S)
s = re.sub(r"/\* cia-cloud:start \*/.*?/\* cia-cloud:end \*/", "", s, flags=re.S)


def rep(old, new):
    global s
    n = s.count(old)
    if n != 1:
        sys.exit(f"expected 1 x {old[:70]!r}, found {n}")
    s = s.replace(old, new)


js = open(os.path.join(src, "cloud.js"), encoding="utf-8").read()
css = open(os.path.join(src, "cloud.css"), encoding="utf-8").read()

rep('<link rel="apple-touch-icon" href="assets/apple-touch-icon.png">',
    '<!-- cia-cloud:start --><script src="cloud-config.js"></script><!-- cia-cloud:end --><link rel="apple-touch-icon" href="assets/apple-touch-icon.png">')
rep('<a class="trainBtn" id="trainBtn"',
    '<!-- cia-cloud:start --><button class="trainBtn acctBtn" id="acctBtn" type="button" hidden><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg><span id="acctLabel"></span></button><!-- cia-cloud:end --><a class="trainBtn" id="trainBtn"')
rep('.trainBtn[hidden]{display:none!important}',
    '.trainBtn[hidden]{display:none!important}/* cia-cloud:start */\n' + css.strip() + '\n/* cia-cloud:end */')
rep('<dialog class="ddlg" id="hDlg" aria-labelledby="hDlgT"></dialog>',
    '<dialog class="ddlg" id="hDlg" aria-labelledby="hDlgT"></dialog><!-- cia-cloud:start -->\n<dialog class="ddlg" id="acctDlg" aria-labelledby="acctDlgT"></dialog><!-- cia-cloud:end -->')
rep('  else { tb.hidden=true; tb.removeAttribute("href"); }',
    '  else { tb.hidden=true; tb.removeAttribute("href"); }/* cia-cloud:start */\n  if(typeof cloudText==="function") cloudText();/* cia-cloud:end */')
rep('  const m=rqCompose(rqRef()); rqLast={...m,kind:rqKind,sent:false};',
    '  const m=rqCompose(rqRef()); rqLast={...m,kind:rqKind,sent:false};/* cia-cloud:start */\n  if(typeof cloudSubmit==="function" && await cloudSubmit(m)) return;/* cia-cloud:end */')
rep('${esc(EMAIL)}</a>`;\n',
    '${esc(EMAIL)}</a>`;/* cia-cloud:start */\n  if(typeof cloudFooter==="function") cloudFooter();/* cia-cloud:end */\n')
rep('/* init */\n(function(){',
    '/* cia-cloud:start */\n' + js.strip() + '\n/* cia-cloud:end *//* init */\n(function(){')

# ---------- the gate in every tool opened on its own (outside the hub): back to the hub, which asks for a sign-in ----------
GATE = ('<!-- cia-gate:start --><script src="../cloud-config.js"></script><script>(function(k){try{var c=window.CIA_CLOUD||{};'
        'if(!c.url||!c.key||c.gate!==true||(Array.isArray(c.free)?c.free:["iso9001"]).indexOf(k)>=0||window.top!==window.self'
        '||localStorage.getItem("cia-cloud-auth"))return;location.replace("../index.html#m="+k);}catch(e){}})("%s");</script><!-- cia-gate:end -->')
tools = dict(re.findall(r'(\w+):\s*"\./modules/([\w.-]+\.html)"', s))
if len(tools) < 10:
    sys.exit("tool list (URLS) not found in index.html")
gated = {}
for key, fname in tools.items():
    mp = os.path.join(root, "modules", fname)
    if not os.path.exists(mp):
        continue
    t = open(mp, encoding="utf-8").read()
    t = re.sub(r"<!-- cia-gate:start -->.*?<!-- cia-gate:end -->", "", t, count=1, flags=re.S)
    i = t.find("<head>")
    if i < 0 or i > 4000:
        sys.exit(f"{fname}: <head> not found near the top")
    gated[mp] = t[:i + 6] + GATE % key + t[i + 6:]

os.makedirs(os.path.join(root, "assets", "vendor"), exist_ok=True)
shutil.copyfile(os.path.join(src, "vendor", "supabase-2.117.2.js"), os.path.join(root, "assets", "vendor", "supabase-2.117.2.js"))
shutil.copyfile(os.path.join(src, "admin.html"), os.path.join(root, "admin.html"))
shutil.copyfile(os.path.join(src, "privacy.html"), os.path.join(root, "privacy.html"))
cfg = os.path.join(root, "cloud-config.js")
kept = os.path.exists(cfg)
if not kept:
    shutil.copyfile(os.path.join(src, "cloud-config.js"), cfg)
for mp, t in gated.items():
    open(mp, "w", encoding="utf-8").write(t)
open(path, "w", encoding="utf-8").write(s)
print(f"gate added to {len(gated)} tools")
print("accounts and cloud save added" + (" (existing cloud-config.js kept)" if kept else ""))
