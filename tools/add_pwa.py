"""Make the CIA platform an installable app (PWA). Usage: python3 -I add_pwa.py <platform-dir>

Copies pwa/manifest.webmanifest, pwa/sw.js and the 512 icons next to index.html, stamps the service worker with a
version computed from the platform files (any change to a page triggers the "new version" bar for installed users),
and adds to index.html: the manifest link, the install button, the iPhone/iPad help, the update bar and the
service worker registration. The tools themselves are not touched. Run it again after every new release:
it replaces its own previous additions and stops before writing anything if the hub code around them changed."""
import sys, os, re, shutil, hashlib

here = os.path.dirname(os.path.abspath(__file__))
src = os.path.join(here, "..", "pwa")
root = sys.argv[1]
path = os.path.join(root, "index.html")
s = open(path, encoding="utf-8").read()

# a previous run is undone first, so the script can be re-run on its own output
s = re.sub(r"<!-- cia-pwa:start -->.*?<!-- cia-pwa:end -->", "", s, flags=re.S)
s = re.sub(r"/\* cia-pwa:start \*/.*?/\* cia-pwa:end \*/", "", s, flags=re.S)


def rep(old, new):
    global s
    n = s.count(old)
    if n != 1:
        sys.exit(f"expected 1 x {old[:70]!r}, found {n}")
    s = s.replace(old, new)


# ---------- head ----------
rep('<link rel="apple-touch-icon" href="assets/apple-touch-icon.png">',
    '''<link rel="apple-touch-icon" href="assets/apple-touch-icon.png"><!-- cia-pwa:start -->
<link rel="manifest" href="manifest.webmanifest">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="CIA">
<meta name="apple-mobile-web-app-status-bar-style" content="default"><!-- cia-pwa:end -->''')

# ---------- header button ----------
rep('<a class="trainBtn" id="trainBtn"',
    '''<!-- cia-pwa:start --><button class="trainBtn appBtn" id="appBtn" type="button" hidden><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="6" y="2.5" width="12" height="19" rx="2.5"/><path d="M12 7.5v7M9 11.5l3 3 3-3M10.5 18.5h3"/></svg><span id="appLabel"></span></button><!-- cia-pwa:end --><a class="trainBtn" id="trainBtn"''')

# ---------- styles ----------
rep('.trainBtn[hidden]{display:none!important}',
    '''.trainBtn[hidden]{display:none!important}/* cia-pwa:start */
.appBtn{background:var(--gold-tint);border-color:var(--gold);color:var(--gold-ink)}
@media (max-width:640px){.appBtn span{display:none}.appBtn{padding:8px 10px}}
@media (min-width:1021px){#appBtn{display:none!important}}
@media (max-width:460px){.topbar:has(#appBtn:not([hidden])) .brand>div{display:none}}
.appUpd{position:fixed;left:max(16px,env(safe-area-inset-left,0px));right:max(16px,env(safe-area-inset-right,0px));bottom:calc(16px + env(safe-area-inset-bottom,0px));margin-inline:auto;max-width:520px;z-index:1200;display:flex;align-items:center;justify-content:space-between;gap:12px;background:var(--navy);color:#fff;border-radius:16px;padding:10px 12px 10px 18px;box-shadow:0 18px 50px rgba(10,18,34,.35);font-weight:600;font-size:14.5px}
html[dir="rtl"] .appUpd{padding:10px 18px 10px 12px}
.appUpd[hidden]{display:none!important}
.app-steps{margin:0;padding-inline-start:22px;display:grid;gap:8px}
/* cia-pwa:end */''')

# ---------- dialog and update bar ----------
rep('<dialog class="ddlg" id="hDlg" aria-labelledby="hDlgT"></dialog>',
    '''<dialog class="ddlg" id="hDlg" aria-labelledby="hDlgT"></dialog><!-- cia-pwa:start -->
<dialog class="ddlg" id="appDlg" aria-labelledby="appDlgT"></dialog>
<div class="appUpd" id="appUpd" role="status" aria-live="polite" hidden></div><!-- cia-pwa:end -->''')

# ---------- texts follow the language switch ----------
rep('''  else { tb.hidden=true; tb.removeAttribute("href"); }''',
    '''  else { tb.hidden=true; tb.removeAttribute("href"); }/* cia-pwa:start */
  if(typeof appText==="function") appText();/* cia-pwa:end */''')

# ---------- behaviour ----------
rep('''/* init */
(function(){''',
    r'''/* cia-pwa:start */
/* ===================== INSTALLABLE APP (PWA) ===================== */
const APPT = {
 ar:{install:"ثبّت التطبيق", installT:"ثبّت المنصة على جهازك", iosT:"ثبّت المنصة على iPhone أو iPad",
   why:"تفتح المنصة من أيقونتها مثل أي تطبيق وبسرعة أكبر، وتعمل الأدوات التي فتحتها من قبل دون إنترنت. بياناتك تبقى على جهازك كما هي.",
   iosSteps:["افتح المنصة في Safari.","اضغط زر المشاركة (المربع والسهم) أسفل الشاشة.","اختر «إضافة إلى الشاشة الرئيسية»، ثم «إضافة»."],
   other:"على الحاسوب: اضغط أيقونة التثبيت في شريط العنوان في Chrome أو Edge. على Android: اختر «تثبيت التطبيق» من قائمة المتصفح.",
   close:"إغلاق", upd:"نسخة جديدة من المنصة جاهزة.", updBtn:"حدّث الآن", installed:"تم تثبيت التطبيق"},
 en:{install:"Install app", installT:"Install the platform on your device", iosT:"Install the platform on iPhone or iPad",
   why:"The platform opens from its own icon like any app, loads faster, and the tools you have opened keep working offline. Your data stays on your device as before.",
   iosSteps:["Open the platform in Safari.","Tap the Share button (the square with the arrow) at the bottom of the screen.","Choose Add to Home Screen, then Add."],
   other:"On a computer: click the install icon in the address bar of Chrome or Edge. On Android: choose Install app from the browser menu.",
   close:"Close", upd:"A new version of the platform is ready.", updBtn:"Update now", installed:"App installed"}
};
let appPrompt = null, appWaiting = null;
const appStandalone = () => matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;
const appIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
function appText(){
  const u = APPT[L], b = $("appBtn"); if(!b) return;
  $("appLabel").textContent = u.install; b.title = u.installT; b.setAttribute("aria-label", u.installT);
  b.hidden = appStandalone() || !(appPrompt || appIOS());
  if(!$("appUpd").hidden) appUpdShow();
}
function appHelp(){
  const u = APPT[L], dlg = $("appDlg"), ios = appIOS();
  dlg.innerHTML = `<div class="ddlg-h" style="--c:var(--gold)"><h3 id="appDlgT">${esc(ios?u.iosT:u.installT)}</h3><button type="button" class="ddlg-x" id="appDlgX" aria-label="${esc(u.close)}">×</button></div>
    <div class="ddlg-b"><p style="margin:0">${esc(u.why)}</p>${ios?`<ol class="app-steps">${u.iosSteps.map(x=>`<li>${esc(x)}</li>`).join("")}</ol>`:`<p style="margin:0">${esc(u.other)}</p>`}
    <div><button type="button" class="btn primary" id="appDlgC">${esc(u.close)}</button></div></div>`;
  $("appDlgX").onclick = $("appDlgC").onclick = () => dlg.close();
  dlg.showModal();
}
function appUpdShow(){
  const u = APPT[L], bar = $("appUpd");
  bar.innerHTML = `<span>${esc(u.upd)}</span><button type="button" class="btn gold" id="appUpdB">${esc(u.updBtn)}</button>`;
  bar.hidden = false;
  $("appUpdB").onclick = () => { if(appWaiting) appWaiting.postMessage("skipWaiting"); else location.reload(); };
}
$("appBtn").onclick = async () => {
  if(!appPrompt){ appHelp(); return; }
  appPrompt.prompt(); try{ await appPrompt.userChoice; }catch(e){}
  appPrompt = null; appText();
};
addEventListener("beforeinstallprompt", e => { e.preventDefault(); appPrompt = e; appText(); });
addEventListener("appinstalled", () => { appPrompt = null; appText(); toast(APPT[L].installed); });
if("serviceWorker" in navigator && /^https?:$/.test(location.protocol)){
  addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").then(reg => {
      const track = w => { if(w) w.addEventListener("statechange", () => { if(w.state === "installed" && navigator.serviceWorker.controller){ appWaiting = w; appUpdShow(); } }); };
      if(reg.waiting && navigator.serviceWorker.controller){ appWaiting = reg.waiting; appUpdShow(); }
      track(reg.installing); reg.addEventListener("updatefound", () => track(reg.installing));
    }).catch(() => {});
    let reloading = false;
    navigator.serviceWorker.addEventListener("controllerchange", () => { if(appWaiting && !reloading){ reloading = true; location.reload(); } });
  });
}
/* cia-pwa:end *//* init */
(function(){''')

# ---------- files ----------
shutil.copyfile(os.path.join(src, "manifest.webmanifest"), os.path.join(root, "manifest.webmanifest"))
for icon in ("icon-512.png", "icon-512-maskable.png"):
    shutil.copyfile(os.path.join(src, "icons", icon), os.path.join(root, "assets", icon))
h = hashlib.sha1()
for d, _, files in sorted(os.walk(root)):
    if os.sep + "tests" in d[len(root):]:
        continue
    for f in sorted(files):
        if f.endswith((".html", ".json", ".webp", ".png", ".jpg")):
            h.update(open(os.path.join(d, f), "rb").read() if f != "index.html" or d != root else s.encode("utf-8"))
m = re.search(r'<meta name="cia-version" content="([^"]+)"', s)
base = re.sub(r"[^0-9A-Za-z.]+", "-", m.group(1)).strip("-") if m else "dev"
version = f"{base}-{h.hexdigest()[:8]}"

sw = open(os.path.join(src, "sw.js"), encoding="utf-8").read().replace("__CIA_VERSION__", version)
open(os.path.join(root, "sw.js"), "w", encoding="utf-8").write(sw)
open(path, "w", encoding="utf-8").write(s)
print(f"PWA added · service worker version {version}")
