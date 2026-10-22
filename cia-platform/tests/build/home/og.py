import re, base64, os
ROOT=os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)),"..","..",".."))
s=open(os.path.join(ROOT,"index.html"),encoding="utf-8").read()
logo=re.search(r'<a class="brand"[^>]*>\s*<img src="(data:image/webp;base64,[^"]+)"',s).group(1)
sd=os.path.join(ROOT,"assets","shots")+"/"
b64=lambda f:"data:image/webp;base64,"+base64.b64encode(open(sd+f,"rb").read()).decode()
OUTD=os.path.join(os.getcwd(),"og_tmp")+"/"; os.makedirs(OUTD,exist_ok=True)
html=f'''<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><style>
html,body{{margin:0;width:1200px;height:630px;overflow:hidden;font-family:"Noto Kufi Arabic","IBM Plex Sans Arabic",Tahoma,sans-serif}}
body{{background:radial-gradient(40% 55% at 12% 20%,rgba(214,176,74,.28),transparent 70%),radial-gradient(45% 50% at 90% 10%,rgba(30,140,147,.30),transparent 70%),radial-gradient(50% 60% at 70% 100%,rgba(53,99,201,.25),transparent 70%),linear-gradient(160deg,#101C33,#0A1220);color:#fff;position:relative}}
.fr{{position:absolute;width:430px;aspect-ratio:1413/882;border-radius:16px;overflow:hidden;border:1.5px solid rgba(214,176,74,.6);box-shadow:0 30px 60px rgba(0,0,0,.5)}}
.fr img{{width:100%;height:100%;object-fit:cover;display:block}}
.f1{{left:-40px;top:30px;transform:rotate(-8deg);opacity:.85}} .f2{{left:120px;top:240px;transform:rotate(5deg)}} .f3{{left:-60px;top:400px;transform:rotate(-3deg);opacity:.7}}
.txt{{position:absolute;right:56px;top:84px;width:560px;text-align:right}}
.lg{{display:flex;align-items:center;gap:16px}} .lg img{{width:96px;height:96px;border-radius:50%;background:#fff;box-shadow:0 0 0 6px rgba(214,176,74,.4)}}
.lg b{{font-size:30px;font-weight:800;display:block}} .lg span{{color:#E2C46B;font-size:20px;font-weight:700}}
h1{{font-size:58px;white-space:nowrap;line-height:1.3;margin:34px 0 14px;font-weight:800}} h1 em{{font-style:normal;color:#E2C46B}}
p{{font-size:22px;color:#C9D3E4;margin:0;line-height:1.7}} .by{{margin-top:26px;font-size:20px;color:#AEBAD0}} .by b{{color:#fff}}
.bar{{position:absolute;bottom:0;left:0;right:0;height:10px;background:linear-gradient(90deg,#1E8C93,#D6B04A)}}
</style></head><body>
<div class="fr f1"><img src="{b64("iso31000-heatmap-ar.webp")}"></div><div class="fr f3"><img src="{b64("exc-results-ar.webp")}"></div><div class="fr f2"><img src="{b64("iso9001-report-ar.webp")}"></div>
<div class="txt"><div class="lg"><img src="{logo}"><div><b>أكاديمية التحسين المستمر</b><span>Continual Improvement Academy</span></div></div>
<h1>من الامتثال <em>إلى الأداء</em></h1><p>أدوات تفاعلية لأنظمة إدارة ISO والحوكمة والمخاطر وإدارة المشاريع والتميّز المؤسسي، ومرشد يقترح الأدوات المناسبة لمنشأتك.</p>
<div class="by">إعداد <b>مدثر سلامه</b></div></div><div class="bar"></div></body></html>'''
open(OUTD+"og.html","w",encoding="utf-8").write(html)
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(viewport={"width":1200,"height":630})
    pg.goto("file://"+OUTD+"og.html"); pg.wait_for_timeout(500); pg.screenshot(path=OUTD+"og.png"); b.close()
from PIL import Image
Image.open(OUTD+"og.png").convert("RGB").save(os.path.join(ROOT,"assets","og-home.jpg"),"JPEG",quality=82,optimize=True,progressive=True)
print(os.path.getsize(os.path.join(ROOT,"assets","og-home.jpg")))
