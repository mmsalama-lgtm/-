"""Step 2026-10-15 (Root Cause Analysis): Pareto accepts "rca" as the next step of a vital-few category.
Run AFTER build_pareto.py:   python3 tests/build/patch_pareto_rca.py modules/pareto.html
What changes in modules/pareto.html, and nothing else:
  - the next-step method list gains "RCA investigation" (stored value "rca"; the stored-state schema only accepts the new value,
    nothing else changes in it). The id is picked from "cia-rca:v1" (datalist and preview with the RCA tool's own stage rule),
    which is read only, never written;
  - "Start an RCA investigation for this category" saves the analysis first (as the Fishbone start does), then opens the RCA tool
    with ?pareto=ID&cat=CAT (new tab) or the RCA tool's one-time hint "cia-nav:rca" = {pareto, cat} (hub overlay); "Open the linked
    one" opens it with ?open= / {open};
  - the dashboard's next-step breakdown shows an RCA row only when an RCA step exists, so with no RCA step the dashboard is unchanged.
Pareto's storage key, questions, scoring, ranking, stages, example, report and CSV format are untouched. Every anchor must match
exactly once."""
import sys, os

HERE = os.path.dirname(os.path.abspath(__file__))
path = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, "..", "..", "modules", "pareto.html")
s = open(path, encoding="utf-8").read()
if 'RCA_KEY="cia-rca:v1"' in s:
    print("already linked; nothing to do"); sys.exit(0)


def rep(old, new):
    global s
    n = s.count(old)
    assert n == 1, (n, old[:120])
    s = s.replace(old, new)


rep('''nx: {how: ""|"fish"|"why5"|"capa", ref}} ]''', '''nx: {how: ""|"fish"|"why5"|"capa"|"rca", ref}} ]''')
rep('''    NAV_KEY="cia-nav:pareto", FISH_NAV="cia-nav:fishbone", WHY5_NAV="cia-nav:five-whys";''',
    '''    NAV_KEY="cia-nav:pareto", FISH_NAV="cia-nav:fishbone", WHY5_NAV="cia-nav:five-whys";
/* RCA link (added 2026-10-15): "rca" is accepted as a next step; "cia-rca:v1" is read only (datalist and preview), and the RCA tool
   opens through its own ?pareto=&cat= / ?open= or its one-time hint "cia-nav:rca". */
var RCA_KEY="cia-rca:v1", RCA_NAV="cia-nav:rca";''')
rep('''var HOWS=["fish","why5","capa"];''', '''var HOWS=["fish","why5","capa","rca"];''')
rep('''how_capa:"سجل CAPA"''', '''how_capa:"سجل CAPA",how_rca:"تحقيق RCA",nxStartRca:"ابدأ تحقيق RCA لهذه الفئة",nxSaveR:"احفظ التحليل أولاً: أداة RCA تقرأ الفئة من التحليل المحفوظ.",pvRca:"{id} · {st} · السبب الجذري: {t}",
 rst_problem:"المشكلة",rst_evidence:"جُمعت الوقائع",rst_causes:"حُددت الأسباب",rst_root:"تأكد السبب الجذري",rst_actions:"اقتُرحت الإجراءات",rst_reviewed:"روجع التحقيق"''')
rep('''how_capa:"CAPA record"''', '''how_capa:"CAPA record",how_rca:"RCA investigation",nxStartRca:"Start an RCA investigation for this category",nxSaveR:"Save the analysis first: the RCA tool reads the category from the saved analysis.",pvRca:"{id} · {st} · Root cause: {t}",
 rst_problem:"Problem",rst_evidence:"Facts collected",rst_causes:"Causes mapped",rst_root:"Root cause confirmed",rst_actions:"Actions proposed",rst_reviewed:"Reviewed"''')
rep('''function openWhy5(q){ openWith("five-whys.html",WHY5_NAV,q,q.open?"?open="+encodeURIComponent(q.open):""); }''',
    '''function openWhy5(q){ openWith("five-whys.html",WHY5_NAV,q,q.open?"?open="+encodeURIComponent(q.open):""); }
function openRca(q){ openWith("rca.html",RCA_NAV,q,q.open?"?open="+encodeURIComponent(q.open):(q.pareto?"?pareto="+encodeURIComponent(q.pareto)+"&cat="+encodeURIComponent(q.cat||""):"")); }''')
rep('''function storeOf(how){ return how==="fish"?FISH_KEY:(how==="why5"?WHY5_KEY:CAPA_KEY); }''',
    '''/* the RCA tool's stage (rca.html: stageOf), for previews only */
function rcaStage(a){
 var ar=function(v){ return Array.isArray(v)?v.filter(function(x){ return x&&typeof x==="object"; }):[]; }, p=obj(a.prob), k=obj(a.risk), cr=obj(a.crit), rv=obj(a.review);
 var sev=parseInt(k.sev,10)||0, lik=parseInt(k.lik,10)||0, D=["light","std","full"], q=(!sev||!lik)?"":((sev===5||sev*lik>=15)?"full":((sev===4||sev*lik>=6)?"std":"light"));
 var dep=D.indexOf(a.depth)>=0?a.depth:q, low=!!q&&D.indexOf(a.depth)>=0&&D.indexOf(a.depth)<D.indexOf(q);
 var probOk=["what","where","when","much","req"].every(function(f){ return !!txt(str(p[f])); }), depthOk=!!q&&(!low||!!txt(str(a.depthWhy)));
 var facts=ar(a.tl).filter(function(x){ return x.kind!=="asm"&&txt(str(x.ev))&&txt(str(x.src)); }).length, ev=ar(a.evid).filter(function(x){ return txt(str(x.item)); }).length;
 var C=ar(a.causes).filter(function(c){ return txt(str(c.t))&&c.st!=="out"; }), dir=C.filter(function(c){ return c.lvl!=="contrib"&&c.lvl!=="root"; }), R=C.filter(function(c){ return c.lvl==="root"; });
 var nd=function(v){ var n=Number(v); return isFinite(n)&&v!==null&&v!==""?n:null; }, dat=ar(a.data).filter(function(x){ var n=nd(x.n), kk=nd(x.k); return txt(str(x.g))&&n!==null&&n>0&&kk!==null&&kk>=0&&kk<=n; }).length, bar=ar(a.barrier).filter(function(x){ return txt(str(x.b))&&!!x.res; }).length;
 var seen={}, M=ar(a.methods).filter(function(m){ var ok=m.how==="data"?dat>0:(m.how==="barrier"?bar>0:(["pareto","fish","why5"].indexOf(m.how)>=0&&!!txt(str(m.ref)))); var kk=m.how+"|"+(m.how==="data"||m.how==="barrier"?"":txt(str(m.ref))); if(!ok||seen[kk]) return false; seen[kk]=1; return true; });
 var methOk=M.length>=(dep==="full"?2:(dep==="std"?1:0))&&(dep!=="full"||M.some(function(m){ return m.how==="data"||m.how==="pareto"; }));
 var person=/(خطأ\\s*(بشري|العامل|الموظف|الفني|المشغل|السائق|الشخص|الرافع|المشرف)|إهمال|اهمال|تقصير|عدم\\s*(انتباه|الانتباه|تركيز|التركيز)|سهو|لامبالاة|human\\s*error|operator\\s*error|worker\\s*error|staff\\s*error|employee\\s*error|rigger\\s*error|driver\\s*error|negligen|careless|inattent|not\\s*paying\\s*attention|lack\\s*of\\s*attention|complacen)/i;
 var rootsOk=R.length>0&&R.every(function(c){ return c.st==="conf"&&!!txt(str(c.ev))&&(c.test==="yes"||c.test==="part")&&!person.test(str(c.t)); });
 var acts=ar(a.acts), noAct=R.filter(function(c){ return !acts.some(function(x){ return x.cause===c.id&&txt(str(x.t))&&txt(str(x.owner)); }); }).length;
 var critOk=!!(txt(str(cr.what))&&txt(str(cr.where))&&txt(str(cr.period))&&isD(cr.date)&&cr.before===true);
 if(!(probOk&&depthOk&&facts>=2&&ev>=1)) return "problem"; if(!(dir.length&&R.length)) return "evidence"; if(!(rootsOk&&methOk)) return "causes";
 if(!(noAct===0&&critOk)) return "root"; if(!(txt(str(rv.by))&&isD(rv.date))) return "actions"; return "reviewed";
}
function rcaRoots(a){ return (Array.isArray(a.causes)?a.causes:[]).filter(function(c){ return c&&typeof c==="object"&&c.lvl==="root"&&c.st!=="out"&&txt(str(c.t)); }).map(function(c){ return txt(str(c.t)); }).join(" · "); }
function storeOf(how){ return how==="fish"?FISH_KEY:(how==="why5"?WHY5_KEY:(how==="rca"?RCA_KEY:CAPA_KEY)); }''')
rep(''' if(how==="why5") return t("pvWhy5",{id:id,st:t("w5st_"+why5Stage(r)),t:short(str(r.root),110)||t("pvNo")});''',
    ''' if(how==="why5") return t("pvWhy5",{id:id,st:t("w5st_"+why5Stage(r)),t:short(str(r.root),110)||t("pvNo")});
 if(how==="rca") return t("pvRca",{id:id,st:t("rst_"+rcaStage(r)),t:short(rcaRoots(r),110)||t("pvNo")});''')
rep('''opts(["","fish","why5","capa"],"how_",n.how)''', '''opts(["","fish","why5","capa","rca"],"how_",n.how)''')
rep(''':(n.how==="capa"?'<button class="pd-btn ghost" type="button" data-nxcapa="'+esc(x.c.id)+'">'+esc(t("nxStartCapa"))+' ↗</button>':''));''',
    ''':(n.how==="capa"?'<button class="pd-btn ghost" type="button" data-nxcapa="'+esc(x.c.id)+'">'+esc(t("nxStartCapa"))+' ↗</button>':(n.how==="rca"?'<button class="pd-btn ghost" type="button" data-nxrca="'+esc(x.c.id)+'">'+esc(t("nxStartRca"))+' ↗</button>':'')));''')
rep('''   (n.how==="fish"?'<p class="ca-hint" style="margin:4px 0 0">'+esc(t("nxSave"))+'</p>':''',
    '''   (n.how==="fish"||n.how==="rca"?'<p class="ca-hint" style="margin:4px 0 0">'+esc(t(n.how==="rca"?"nxSaveR":"nxSave"))+'</p>':''')
rep(''' if(how==="why5"){ openWhy5({}); return; }
 openTool("capa.html","tools");''', ''' if(how==="why5"){ openWhy5({}); return; }
 if(how==="rca"){
  if(!savedSame()){ if(!saveRecord()) return; r=formToRec(); }
  openRca({pareto:r.id,cat:cid}); return;
 }
 openTool("capa.html","tools");''')
rep(''' var nc=e.target.closest("[data-nxcapa]"); if(nc){ startStep(nc.getAttribute("data-nxcapa"),"capa"); return; }''',
    ''' var nc=e.target.closest("[data-nxcapa]"); if(nc){ startStep(nc.getAttribute("data-nxcapa"),"capa"); return; }
 var nr=e.target.closest("[data-nxrca]"); if(nr){ startStep(nr.getAttribute("data-nxrca"),"rca"); return; }''')
rep('''else if(n.how==="why5") openWhy5({open:n.ref}); else openTool("capa.html","docs"); return; }''',
    '''else if(n.how==="why5") openWhy5({open:n.ref}); else if(n.how==="rca") openRca({open:n.ref}); else openTool("capa.html","docs"); return; }''')
rep('''nx:{fish:0,why5:0,capa:0,none:0}};''', '''nx:{fish:0,why5:0,capa:0,rca:0,none:0}};''')
rep(''' var nn=c.nx.fish+c.nx.why5+c.nx.capa+c.nx.none;''', ''' var nn=c.nx.fish+c.nx.why5+c.nx.capa+c.nx.rca+c.nx.none;''')
rep('''TBX.dist(["fish","why5","capa","none"],nn,function(k){ return c.nx[k]; },function(k){ return k==="none"?t("nx_none"):t("how_"+k); },function(k){ return {fish:"#1E8C93",why5:"#3563C9",capa:"#C2410C",none:"#9AA5B8"}[k]; })''',
    '''TBX.dist(["fish","why5","capa"].concat(c.nx.rca?["rca"]:[]).concat(["none"]),nn,function(k){ return c.nx[k]; },function(k){ return k==="none"?t("nx_none"):t("how_"+k); },function(k){ return {fish:"#1E8C93",why5:"#3563C9",capa:"#C2410C",rca:"#1B2A4A",none:"#9AA5B8"}[k]; })''')
rep('''window.addEventListener("storage",function(e){ if([PDCA_KEY,CAPA_KEY,FISH_KEY,WHY5_KEY,AUD_KEY].indexOf(e.key)>=0){''',
    '''window.addEventListener("storage",function(e){ if([PDCA_KEY,CAPA_KEY,FISH_KEY,WHY5_KEY,AUD_KEY,RCA_KEY].indexOf(e.key)>=0){''')
open(path, "w", encoding="utf-8").write(s)
print("pareto.html: 'rca' next step (read-only preview, start and open through the RCA tool's own request)")
