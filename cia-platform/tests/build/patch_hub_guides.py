"""Step 2026-10-22 (Guides center): a "Guides" view in the hub (index.html, #guides) that opens every explanation inside every tool directly.
    python3 tests/build/patch_hub_guides.py index.html          (reads tests/build/guides_data.json, written by guides_probe.py)
- Menu: a "Guides / الشروح" item after "Tools" (top menu and mobile menu).
- The view: an introduction (what the guides are, the three kinds of explanation with screenshots in Arabic and English from
  assets/shots/guide-*.webp, a learn → assess → apply → review path drawn in SVG, and the note that they are interpretive summaries), then a
  search box, system filters and one card per tool with an icon for each of its explanation tabs. A click opens the tool in the overlay on that
  tab (openModule(key, push, anchor) — the tab is checked by guides_probe.py: #anchor opens it in every tool).
- The knowledge centre gains a link to the guides center. No tool, adapter, snapshot or count changes."""
import sys, os, json, re

HERE = os.path.dirname(os.path.abspath(__file__))
path = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, "..", "..", "index.html")
s = open(path, encoding="utf-8").read()
if 'data-view="guides"' in s:
    print("Guides center already present; nothing to do"); sys.exit(0)
D = json.load(open(os.path.join(HERE, "guides_data.json"), encoding="utf-8"))
MODS = os.path.join(HERE, "..", "..", "modules")


def rep(old, new, times=1):
    global s
    n = s.count(old)
    assert n == times, (n, old[:100])
    s = s.replace(old, new)


# hub keys from URLS
urls = dict(re.findall(r'^\s+(\w+):\s+"\./modules/([\w-]+)\.html"', s[s.find("const URLS = {"):s.find("};", s.find("const URLS = {"))], re.M))
f2k = {f: k for k, f in urls.items()}
assert len(f2k) == len(D) == 39, (len(f2k), len(D))
KIND = {"standard": "doc", "explain-std": "book", "clauses": "list", "explain-cl": "wheel", "guide": "compass"}
G = {}
for f, tabs in D.items():
    src = open(os.path.join(MODS, f + ".html"), encoding="utf-8").read()
    order = sorted(tabs, key=lambda a: (src.find('data-go="%s"' % a) if 'data-go="%s"' % a in src else src.find('data-tab="%s"' % a)))
    items = []
    for a in order:
        x = tabs[a]; assert x["ar"]["vis"] and x["en"]["vis"] and x["ar"]["lab"] and x["en"]["lab"], (f, a)
        items.append([a, KIND[a], x["en"]["lab"], x["ar"]["lab"]])
    G[f2k[f]] = items
n_items = sum(len(v) for v in G.values())
data_js = "const GUIDES = " + json.dumps(G, ensure_ascii=False, separators=(",", ":")) + ";"

# 1. menu item after Tools (the first menu data and the later one that replaces it)
rep('["tools","Tools"],["systems","Systems"]', '["tools","Tools"],["guides","Guides"],["systems","Systems"]', 2)
rep('["tools","الأدوات"],["systems","المنظومات"]', '["tools","الأدوات"],["guides","الشروح"],["systems","المنظومات"]', 2)
# 2. the view (after the tools view)
rep('''  <section id="systems" data-view="systems" hidden>''', '''  <section id="guides" class="band" data-view="guides" hidden>
    <div class="wrap">
      <div class="sec-head"><div><h2 id="gdTitle"></h2><p id="gdSub"></p></div></div>
      <div class="gd-intro" id="gdIntro"></div>
      <div class="tk-bar" id="gdBar">
        <label class="tk-search"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg><input id="gdQ" type="search" autocomplete="off" spellcheck="false"></label>
        <span class="tk-count" id="gdCount" aria-live="polite"></span>
        <div class="filters" id="gdF" role="group"></div>
      </div>
      <div class="gd-grid" id="gdGrid"></div>
      <p class="tk-none" id="gdNone" hidden></p>
    </div>
  </section>

  <section id="systems" data-view="systems" hidden>''')
# 3. knowledge centre: a link to the guides center
rep('''      <div class="sec-head"><div><h2 id="kTitle"></h2><p id="kSub"></p></div></div>''',
    '''      <div class="sec-head"><div><h2 id="kTitle"></h2><p id="kSub"></p></div><a class="btn" href="#guides" id="kGd"></a></div>''')
# 4. styles (before the closing style tag of the hub's main sheet: after the knowledge-guide link style)
rep('details.k .kb .kguide:hover{text-decoration:underline}', '''details.k .kb .kguide:hover{text-decoration:underline}
/* ===== Guides center (#guides) ===== */
#learn .sec-head{display:flex;flex-wrap:wrap;gap:12px;align-items:flex-end;justify-content:space-between}
.gd-intro{display:grid;gap:18px;margin:0 0 26px}
.gd-hero{position:relative;overflow:hidden;border-radius:22px;padding:26px 26px 22px;background:linear-gradient(135deg,var(--navy),color-mix(in srgb,var(--navy) 78%,var(--gold)));color:var(--on-navy)}
.gd-hero::after{content:"";position:absolute;inset-inline-end:-60px;top:-60px;width:240px;height:240px;border-radius:50%;border:30px solid color-mix(in srgb,var(--gold) 45%,transparent);opacity:.5}
.gd-hero h3{margin:0 0 8px;font-family:Georgia,serif;font-size:22px;color:#fff;position:relative;z-index:1}
.gd-hero p{margin:0 0 10px;max-width:820px;line-height:1.75;color:#E8EDF6;position:relative;z-index:1}
.gd-hero .gd-stats{display:flex;flex-wrap:wrap;gap:10px;position:relative;z-index:1}
.gd-hero .gd-stats span{background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.25);border-radius:999px;padding:5px 12px;font-size:13.5px}
.gd-hero .gd-stats b{font-family:Georgia,serif;color:#F6D77B;margin-inline-end:4px}
.gd-kinds{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}
.gd-kind{background:var(--surface);border:1px solid var(--line);border-radius:18px;overflow:hidden;display:flex;flex-direction:column;min-width:0}
.gd-kind figure{margin:0;background:color-mix(in srgb,var(--navy) 5%,var(--surface));border-bottom:1px solid var(--line);aspect-ratio:16/10;overflow:hidden}
.gd-kind img{width:100%;height:100%;object-fit:cover;object-position:top center;display:block}
.gd-kind .gd-kb{padding:14px 16px 16px;display:flex;flex-direction:column;gap:6px;flex:1}
.gd-kind h4{margin:0;font-size:16px;display:flex;align-items:center;gap:8px;color:var(--ink)}
.gd-kind h4 i{display:inline-grid;place-items:center;width:30px;height:30px;border-radius:9px;background:var(--gold-tint);color:var(--gold-ink);flex:none}
.gd-kind p{margin:0;color:var(--ink-soft);font-size:14px;line-height:1.7}
.gd-kind a{margin-top:auto;align-self:flex-start;font-weight:700;font-size:14px;color:var(--gold-ink);text-decoration:none}
.gd-kind a:hover{text-decoration:underline}
.gd-path{background:var(--surface);border:1px solid var(--line);border-radius:18px;padding:14px 16px}
.gd-path h4{margin:0 0 6px;font-size:15px;color:var(--ink)}
.gd-path svg{width:100%;height:auto;display:block}
.gd-note{margin:0;font-size:13px;color:var(--muted)}
.gd-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:14px}
.gd-sys{grid-column:1/-1;display:flex;align-items:center;gap:10px;margin:12px 0 0;font-size:16px;color:var(--ink)}
.gd-sys i{width:12px;height:12px;border-radius:50%;background:var(--c)}
.gd-sys small{color:var(--muted);font-weight:400;font-size:13px}
.gd-card{--c:var(--c-iso);background:var(--surface);border:1px solid var(--line);border-top:4px solid var(--c);border-radius:16px;padding:14px 14px 12px;display:flex;flex-direction:column;gap:10px;min-width:0}
.gd-ch{display:flex;align-items:center;gap:10px;min-width:0}
.gd-ic{flex:none;width:46px;height:46px;border-radius:13px;display:grid;place-items:center;background:color-mix(in srgb,var(--c) 14%,var(--surface));color:var(--c);font-family:Georgia,serif;font-weight:700;font-size:12px;line-height:1.05;text-align:center;padding:2px;overflow:hidden;word-break:break-all}
.gd-ch b{font-size:15px;line-height:1.35;color:var(--ink);min-width:0}
.gd-ch small{display:block;color:var(--muted);font-size:12.5px;font-weight:400}
.gd-links{display:grid;gap:6px;margin:0;padding:0;list-style:none}
.gd-links a{display:flex;align-items:center;gap:10px;padding:8px 10px;border:1px solid var(--line);border-radius:12px;text-decoration:none;color:var(--ink);font-weight:600;font-size:14px;background:color-mix(in srgb,var(--c) 4%,var(--surface));transition:border-color .2s,background .2s}
.gd-links a:hover,.gd-links a:focus-visible{border-color:var(--c);background:color-mix(in srgb,var(--c) 10%,var(--surface))}
.gd-links a i{flex:none;display:inline-grid;place-items:center;width:30px;height:30px;border-radius:9px;background:var(--c);color:#fff}
.gd-links a span{flex:1;min-width:0}
.gd-links a em{font-style:normal;color:var(--muted)}
@media (max-width:900px){.gd-kinds{grid-template-columns:1fr}.gd-kind{flex-direction:row}.gd-kind figure{width:42%;aspect-ratio:auto;border-bottom:0;border-inline-end:1px solid var(--line)}}
@media (max-width:560px){.gd-kind{flex-direction:column}.gd-kind figure{width:auto;aspect-ratio:16/10;border-inline-end:0;border-bottom:1px solid var(--line)}.gd-hero{padding:20px 18px}.gd-grid{grid-template-columns:minmax(0,1fr)}}''')
# 5. data and rendering (before the knowledge-centre renderer)
rep('''const KGUIDE = {en:"Read the guide", ar:"اقرأ الدليل"};''', '''/* ===================== GUIDES CENTER (#guides) =====================
   Every explanation tab of every tool, read from the tools themselves (tests/build/guides_probe.py checks that #anchor opens the tab and
   takes its label in Arabic and English): key → [[anchor, icon, English label, Arabic label], …]. A click opens the tool on that tab. */
''' + data_js + '''
const GD = {
 en:{title:"Guides center", sub:"Every tool on the platform carries its own explanation. Pick a guide here and the tool opens straight on that explanation, in the language you are using.",
  heroT:"Learn the standard before you assess against it",
  heroP:"Each guide is written independently in plain language and checked against the official texts uploaded to the platform: what the standard, model or method is for, who uses it, how its clauses connect, what each clause asks, an example from a fictitious Saudi company, how to apply it, what an auditor asks to see and the common gaps. From any clause, one button takes you to the matching self-assessment question, so learning leads straight to work.",
  stats:(t,g)=>[[t,"tools"],[g,"guides"],["2","languages"]],
  kinds:[["book","The standard or method explained","Purpose, who uses it, a map of the steps or clauses, and how it links to the other tools.","guide-std","iso9001","explain-std"],
         ["wheel","The clause guide","A wheel or a map of the clauses: select any part to open it, with its phase and the clauses it connects to.","guide-cl","iso9001","explain-cl"],
         ["card","One card per clause","The requirement in plain words, an example, how to apply it, what the auditor asks, common gaps, and \\"Assess this in the self-assessment\\".","guide-item","iso9001","explain-cl"]],
  tryIt:"Try it in ISO 9001", alt:"Screenshot: ",
  pathT:"How the guides fit your work", path:[["Understand","the guide"],["Assess","self-assessment"],["Apply","the tool's registers"],["Review","report and audit"]],
  note:"Guides are interpretive summaries in independent wording, not the official text of any standard; for the official text, use the copies published by ISO and the owners of each model.",
  ph:"Search a tool or a guide…", all:"All", count:(t,g)=>`${t} tools · ${g} guides`, none:"No guide matches your search.", open:"Opens inside the tool", know:"All the guides →",
  icon:{book:"Method guide",doc:"The standard",list:"Clauses",wheel:"Clause guide",compass:"Guide"}},
 ar:{title:"مركز الشروح", sub:"كل أداة في المنصة تحمل شرحها بداخلها. اختر الشرح من هنا، فتُفتح الأداة مباشرة على تبويب الشرح، وباللغة التي تستخدمها.",
  heroT:"افهم المواصفة قبل أن تقيّم نفسك عليها",
  heroP:"كل شرح مكتوب بصياغة مستقلة ولغة بسيطة، ومتحقق منه على النصوص الرسمية المرفوعة إلى المنصة: الغرض من المواصفة أو النموذج أو الأسلوب، ومن يستخدمه، وكيف تترابط بنوده، وما يطلبه كل بند، ومثال من شركة سعودية افتراضية، وكيف تطبقه، وما يطلبه المدقق، والفجوات الشائعة. ومن أي بند ينقلك زر واحد إلى سؤال التقييم الذاتي المقابل، فيقود التعلم إلى العمل مباشرة.",
  stats:(t,g)=>[[t,"أداة"],[g,"شرحاً"],["2","لغتان"]],
  kinds:[["book","شرح المواصفة أو المنهجية","الغرض، ومن يستخدمها، وخريطة الخطوات أو البنود، وعلاقتها بأدوات المنصة الأخرى.","guide-std","iso9001","explain-std"],
         ["wheel","دليل البنود","عجلة أو خريطة للبنود: اضغط أي جزء فيُفتح شرحه، مع مرحلته والبنود المرتبطة به.","guide-cl","iso9001","explain-cl"],
         ["card","بطاقة لكل بند","المتطلب بكلمات بسيطة، ومثال، وكيف تطبقه، وما يطلبه المدقق، والفجوات الشائعة، وزر «قيّم هذا في التقييم الذاتي».","guide-item","iso9001","explain-cl"]],
  tryIt:"جرّبه في ISO 9001", alt:"لقطة شاشة: ",
  pathT:"كيف تخدم الشروح عملك", path:[["افهم","الشرح"],["قيّم","التقييم الذاتي"],["طبّق","سجلات الأداة"],["راجع","التقرير والتدقيق"]],
  note:"الشروح ملخصات تفسيرية بصياغة مستقلة، وليست النص الرسمي لأي مواصفة؛ للنص الرسمي ارجع إلى النسخ المنشورة من ISO ومن ملاك كل نموذج.",
  ph:"ابحث عن أداة أو شرح…", all:"الكل", count:(t,g)=>`${t} أداة · ${g} شرحاً`, none:"لا يوجد شرح يطابق بحثك.", open:"يُفتح داخل الأداة", know:"كل الشروح ←",
  icon:{book:"دليل المنهجية",doc:"المواصفة",list:"البنود",wheel:"دليل البنود",compass:"الدليل"}}
};
const GD_ICO = {
 book:'<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 19V5M8 7h7M8 11h7"/></svg>',
 doc:'<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 3h9l4 4v14H6z"/><path d="M15 3v4h4M9 12h6M9 16h6"/></svg>',
 list:'<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6h11M9 12h11M9 18h11"/><circle cx="4.5" cy="6" r="1.3"/><circle cx="4.5" cy="12" r="1.3"/><circle cx="4.5" cy="18" r="1.3"/></svg>',
 wheel:'<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3"/><path d="M12 3v6M12 15v6M3 12h6M15 12h6"/></svg>',
 compass:'<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5-5 2 2-5z"/></svg>',
 card:'<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 9h10M7 13h6M14 17l2 2 4-4"/></svg>'};
let gdQ = "", gdSys = "all";
function gdTools(){ return SYSTEMS.flatMap(s=>s.mods.filter(m=>m.status==="live"&&GUIDES[m.k]&&URLS[m.k]).map(m=>({k:m.k, s}))).filter((x,i,a)=>a.findIndex(y=>y.k===x.k)===i); }
function gdTitle(k){ const t=TOOLKITS.find(x=>x.k===k); return t ? t.title[L] : modLabel(k); }
function gdCode(k){ const t=TOOLKITS.find(x=>x.k===k); return t ? String(t.code) : k.toUpperCase(); }
function gdPathSVG(){
  const g=GD[L], rtl=L==="ar", W=760, H=120, n=g.path.length, step=W/n, out=[];
  out.push(`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(g.pathT)}" direction="ltr" font-family="'IBM Plex Sans Arabic','IBM Plex Sans',Calibri,Tahoma,sans-serif">`);
  const cols=["var(--c-iso)","var(--gold)","var(--c-str)","var(--c-aud)"];
  g.path.forEach((p,i)=>{ const j=rtl?n-1-i:i, cx=step*j+step/2;
    if(i<n-1){ const nx=step*(rtl?j-1:j+1)+step/2, x1=cx+(rtl?-38:38), x2=nx+(rtl?38:-38);
      out.push(`<path d="M${x1} 44 L${x2} 44" stroke="var(--line)" stroke-width="3" stroke-dasharray="6 6"/><path d="M${x2+(rtl?8:-8)} 38 L${x2} 44 L${x2+(rtl?8:-8)} 50" fill="none" stroke="var(--muted)" stroke-width="2.5" stroke-linecap="round"/>`); }
    out.push(`<circle cx="${cx}" cy="44" r="30" fill="${cols[i]}" opacity=".16"/><circle cx="${cx}" cy="44" r="22" fill="${cols[i]}"/><text x="${cx}" y="50" text-anchor="middle" font-size="17" font-weight="700" fill="#fff" font-family="Georgia,serif">${i+1}</text>`);
    out.push(`<text x="${cx}" y="94" text-anchor="middle" font-size="15" font-weight="700" fill="var(--ink)">${esc(p[0])}</text><text x="${cx}" y="113" text-anchor="middle" font-size="12.5" fill="var(--muted)">${esc(p[1])}</text>`); });
  out.push(`</svg>`); return out.join("");
}
function renderGuides(){
  const g=GD[L], tools=gdTools(), nG=tools.reduce((a,x)=>a+GUIDES[x.k].length,0);
  const set=(id,v)=>{ const e=$(id); if(e) e.textContent=v; };
  set("gdTitle",g.title); set("gdSub",g.sub); set("kGd",g.know);
  $("gdIntro").innerHTML = `<div class="gd-hero"><h3>${esc(g.heroT)}</h3><p>${esc(g.heroP)}</p><div class="gd-stats">${g.stats(tools.length,nG).map(([b,t])=>`<span><b>${esc(String(b))}</b>${esc(t)}</span>`).join("")}</div></div>
    <div class="gd-kinds">${g.kinds.map(([ic,t,d,img,k,a])=>`<article class="gd-kind"><figure><img src="./assets/shots/${img}-${L}.webp" alt="${esc(g.alt+t)}" loading="lazy" width="880" height="550"></figure><div class="gd-kb"><h4><i>${GD_ICO[ic]}</i>${esc(t)}</h4><p>${esc(d)}</p><a href="${URLS[k]}#${a}" data-mod="${k}" data-anchor="${a}">${esc(g.tryIt)} ${EXT}</a></div></article>`).join("")}</div>
    <div class="gd-path"><h4>${esc(g.pathT)}</h4>${gdPathSVG()}</div><p class="gd-note">${esc(g.note)}</p>`;
  const q=$("gdQ"); q.placeholder=g.ph; q.setAttribute("aria-label",g.ph); if(q.value!==gdQ) q.value=gdQ;
  $("gdF").setAttribute("aria-label",g.title);
  $("gdF").innerHTML = [["all",g.all], ...SYSTEMS.filter(s=>tools.some(x=>x.s.id===s.id)).map(s=>[s.id, s.short[L].join(" ")])].map(([k,t])=>
    `<button type="button" class="chip" data-f="${k}" aria-pressed="${gdSys===k}">${k!=="all"?`<span class="dot" style="background:var(${SYSTEMS.find(s=>s.id===k).color})"></span>`:""}${esc(t)}</button>`).join("");
  $("gdF").querySelectorAll(".chip").forEach(b=>b.onclick=()=>{ gdSys=b.dataset.f; renderGuides(); });
  gdGridRender();
}
function gdGridRender(){
  const g=GD[L], words=tkNorm(gdQ).split(/\\s+/).filter(Boolean), tools=gdTools();
  const hay=x=>tkNorm([gdTitle(x.k), gdCode(x.k), x.s.name.en, x.s.name.ar, ...GUIDES[x.k].flatMap(i=>[i[2],i[3]]), ...(TOOLKITS.find(t=>t.k===x.k)?[TOOLKITS.find(t=>t.k===x.k).title.en,TOOLKITS.find(t=>t.k===x.k).title.ar]:[])].join(" | "));
  const list=tools.filter(x=>(gdSys==="all"||x.s.id===gdSys)&&(!words.length||words.every(w=>hay(x).includes(w))));
  const nG=list.reduce((a,x)=>a+GUIDES[x.k].length,0);
  $("gdCount").textContent=g.count(list.length,nG);
  let html="", cur=null;
  list.forEach(x=>{ if(x.s!==cur){ cur=x.s; const n=list.filter(y=>y.s===cur).length; html+=`<h3 class="gd-sys" style="--c:var(${cur.color})"><i></i>${esc(cur.name[L])} <small>${esc(g.count(n,list.filter(y=>y.s===cur).reduce((a,y)=>a+GUIDES[y.k].length,0)))}</small></h3>`; }
    html+=`<article class="gd-card" style="--c:var(${x.s.color})" data-k="${x.k}"><div class="gd-ch"><span class="gd-ic" dir="ltr">${esc(gdCode(x.k))}</span><b>${esc(gdTitle(x.k))}<small>${esc(g.open)}</small></b></div>
      <ul class="gd-links">${GUIDES[x.k].map(([a,ic,en,ar])=>`<li><a href="${URLS[x.k]}#${a}" data-mod="${x.k}" data-anchor="${a}" title="${esc(g.icon[ic])}"><i>${GD_ICO[ic]}</i><span>${esc(L==="ar"?ar:en)}</span><em aria-hidden="true">${L==="ar"?"←":"→"}</em></a></li>`).join("")}</ul></article>`; });
  $("gdGrid").innerHTML=html; $("gdNone").hidden=list.length>0; $("gdNone").textContent=g.none;
}
$("gdQ").addEventListener("input", e=>{ gdQ=e.target.value; gdGridRender(); });

const KGUIDE = {en:"Read the guide", ar:"اقرأ الدليل"};''')
# 6. render with the rest of the page
rep('renderKnow(); renderFAQ(); renderCompliance(); renderFooter(); renderHome2(); renderAdvisor(); renderDash(); if(tourI>=0) tourShow(); }',
    'renderKnow(); renderGuides(); renderFAQ(); renderCompliance(); renderFooter(); renderHome2(); renderAdvisor(); renderDash(); if(tourI>=0) tourShow(); }')
open(path, "w", encoding="utf-8").write(s)
print("index.html: Guides center added (%d tools, %d guides)" % (len(G), n_items))
