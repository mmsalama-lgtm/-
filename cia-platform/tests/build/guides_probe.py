"""Reads every module served at :8802 and lists its explanation tabs (explain-std, explain-cl, standard, clauses, guide): whether #anchor opens
the tab, and the tab label in Arabic and English. Writes tests/build/guides_data.json, read by patch_hub_guides.py.
    python3 tests/build/guides_probe.py tests/build/guides_data.json"""
from playwright.sync_api import sync_playwright
import os,re,json,sys
ROOT=os.path.abspath(os.path.join(os.path.dirname(__file__),"..","..")); B="http://127.0.0.1:8802/modules/"
mods=sorted(f[:-5] for f in os.listdir(ROOT+"/modules") if f.endswith(".html"))
out={}
with sync_playwright() as p:
    b=p.chromium.launch()
    for lang in ["ar","en"]:
      ctx=b.new_context(); 
      ctx.add_init_script("try{localStorage.setItem('cia-lang','%s');for(const k of %s) localStorage.setItem('cia-tour:m:'+k,'done')}catch(e){}"%(lang,json.dumps(mods)))
      ctx.route(re.compile(r"fonts\.(googleapis|gstatic)"), lambda r:r.abort())
      pg=ctx.new_page()
      for m in mods:
        s=open(f"{ROOT}/modules/{m}.html",encoding="utf-8").read()
        cands=[a for a in ["explain-std","explain-cl","standard","clauses","guide"] if f'data-tab="{a}"' in s]
        for a in cands:
            pg.goto(B+m+".html#"+a); pg.wait_for_timeout(350)
            r=pg.evaluate("""(a)=>{ const p=document.querySelector('[data-tab="'+a+'"]'); const vis=p&&p.offsetParent!==null&&getComputedStyle(p).display!=='none';
              const btn=document.querySelector('[data-go="'+a+'"], [data-t="'+a+'"], a[href="#'+a+'"]'); return {vis, lab: btn?btn.textContent.trim().replace(/\\s+/g,' '):'', len:p?p.innerText.length:0}; }""",a)
            out.setdefault(m,{}).setdefault(a,{})[lang]=r
      ctx.close()
    b.close()
json.dump(out,open(sys.argv[1],"w"),ensure_ascii=False,indent=0)
for m,v in out.items():
    print(m, {a:(x["ar"]["vis"],x["ar"]["len"],x["ar"]["lab"][:30],x["en"]["lab"][:30]) for a,x in v.items()})
