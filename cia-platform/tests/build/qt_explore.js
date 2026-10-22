/* ---------- step 10.1 (2026-10-16): the full explanation of ISO 10009 ----------
   Clause guide explorer (tab explain-cl, above the kit's clause list): contents, clauses 1–4, each clause 5–16 with its tools, the other
   relevant tools and three self-check questions, a full card for each of the 53 tools, Annex A as an interactive matrix, Annex B,
   Annex C as a sortable table with a competence-matrix export, the platform link map and five learning paths. Reading path and diagram
   in the standard guide tab. Deep links: ?tool=7.3 (or the hint {tool} in the hub) open the card.
   Storage: only the learning-path progress, in its own key "cia-iso10009-paths:v1" ({studied:["7.3",...]}); never in "cia-iso10009:v1".
   Self-check answers are kept in memory only. All texts are interpretive summaries or the author's guidance, not the text of the standard. */
var QX=QTC.X, PKEY="cia-iso10009-paths:v1";
var ORD=TL.slice().sort(function(a,b){ return cmpCode(a.c,b.c); });
var QXU={
ar:{xT:"دليل البنود التفاعلي",xS:"تصفح المواصفة بنداً بنداً، وافتح بطاقة كاملة لكل أداة من الـ 53: متى تُستخدم ومتى لا، وخطواتها، وما يطلبه المدقق، وأين تطبقها في المنصة.",
 xQ:"ابحث عن أداة أو بند (مثل FMEA أو 13.7 أو باريتو)",xQL:"بحث في الدليل",xToc:"الفهرس",xFront:"البنود 1–4",xA:"الملحق A",xB:"الملحق B",xC:"الملحق C",xMap:"خريطة المنصة",xPaths:"مسارات التعلم",
 xNote:"ملخص تفسيري بصياغة مستقلة، وليس النص الرسمي. الأمثلة توضيحية من شركة الواحة للمقاولات (افتراضية).",
 xInv:"في المواصفة: {cl} بنداً رئيسياً، و{sub} بنداً فرعياً، و{t} أداة بشرح كامل، و{tb} جدولاً للفوائد ونقاط الانتباه، و{fg} شكلاً في المتن و{fb} في الملحق B، و{nm} اسماً في {ls} قائمة «أدوات أخرى ذات صلة»، و{bib} مرجعاً في قائمة المراجع.",
 xTools:"{n} أداة",xOth:"{n} أداة أخرى بالاسم",xMap9:"ISO 9001:2026 (ربط الكاتب): {m}",xRoot:"ISO 10009",xCl:"البند {c}",
 xFor:"لماذا هذا البند",xStart:"متى تبدأ منه",xMini:"خريطة أدوات البند",xOthT:"أدوات أخرى ذات صلة (بالاسم فقط في المواصفة)",xNotPl:"ليست في المنصة",
 xQuiz:"اختبر فهمك",xQuizS:"ثلاثة أسئلة لا تُحفظ إجاباتها.",xRight:"صحيح.",xWrong:"ليس تماماً.",xScore:"نتيجتك: {a} من {n}",
 xSum:"ما هي",xAims:"الغرض (البند 1)",xWhen:"متى تُستخدم",xNot:"متى لا تُستخدم",xInp:"المدخلات",xSteps:"خطوات التطبيق",xOut:"المخرج والسجل",
 xAttr:"سماتها في الجدول C.1",xPdca:"مكانها في دورة PDCA (الملحق A)",xBen:"الفوائد",xNotes:"نقاط الانتباه",xEx:"مثال الواحة",xMis:"أخطاء شائعة",xAud:"ما يطلبه المدقق",
 xChain:"قبلها وبعدها",xBefore:"عادة قبلها",xAfter:"عادة بعدها",xApply:"طبّقها على المنصة",xLib:"في مكتبة الأدوات",xFull:"البطاقة الكاملة",xNone:"ليست في المنصة بعد: سجّلها خطوةً في لوحة القصة وأرفق مخرجها.",
 xSrc:"في المواصفة: الجدول {tb}{fg}{rf}",xSrcF:" · الشكل {f}",xSrcR:" · مراجع مذكورة [{r}] (غير متحقق منها)",
 xPrev:"السابقة",xNext:"التالية",xCopy:"انسخ رابط الأداة",xCopied:"نُسخ الرابط",xCopyF:"انسخ الرابط يدوياً:",
 xStud:"علّمها كمدروسة",xStudOn:"مدروسة ✓",xInPaths:"ضمن مسار: {p}",
 xAttrW:"المجال: {a} · المنتج أو الخدمة: {p} · {w} · البيانات: {d} · الكفاءة: {c} · الجهد: {e}",xPsB:"كلاهما",xPsM:"التصنيع",xCapN:"{d} ({w})",
 cap1:"تكفي قراءة المعلومات الموثقة",cap2:"تحتاج تدريباً مخصصاً",cap3:"تحتاج دورة أطول وخبرة",
 xAT:"الملحق A: الأدوات على دورة PDCA",xAS:"اختر السياق، ثم اضغط أي أداة لفتح بطاقتها. اختر أداة من القائمة لإبراز كل مواضعها في الجداول الثلاثة.",xHl:"أبرز أداة",xHl0:"— بلا إبراز —",
 xRange:"نطاق: كل الأدوات المراجعة من {a} إلى {b}",xPlaces:"{n} موضعاً في الجداول الثلاثة",xAN:"النطاقات في الجدول تشمل كل أداة مراجعة في النطاق. وفي البند 13 يقل رقم الجدول عن رقم البند بواحد (مثلاً الجدول 13.3 لمخطط الرادار 13.4) لأن 13.1 بند عام.",
 xBT:"الملحق B: لوحات القصة",xBS:"ثلاثة أشكال توضيحية لما قد تبدو عليه لوحة القصة (ملخص لكل شكل، لا الشكل نفسه).",xBHow:"كيف تبني لوحة قصة",xBGo:"ابدأ لوحة قصة",
 xCT:"الملحق C: سمات الأدوات (الجدول C.1)",xCS:"رتّب بالضغط على رأس العمود، وصفِّ بالكفاءة أو الفريق أو الجهد أو مكانها في المنصة.",xCAll:"الكل",xCCnt:"{n} من 53 أداة",
 xCN:"يدرج الجدول C.1 إدارة الجودة الشاملة برقم 16.3 بينما رقمها في المتن 16.2، ويستخدم الدليل رقم المتن. وأداة 13.6 (شجرة CTQ) لها في الجدول مستوى كفاءة فقط.",
 xCsv:"صدّر مصفوفة الكفاءة (•• و•••)",xCsvN:"الأدوات التي تحتاج تدريباً أو خبرة، لتضعها في خطة الكفاءة حسب ISO 9001:2026 البند 7.2.",
 hCode:"#",hTool:"الأداة",hArea:"المجال",hPs:"منتج/خدمة",hTeam:"فريق/فرد",hData:"البيانات",hCap:"الكفاءة",hEff:"الجهد",hLv:"المنصة",
 xMT:"خريطة الربط بالمنصة",xMS:"كل أداة في المنصة وأدوات المواصفة التي تغطيها. داخل المنصة تُفتح الأداة في نافذتها، وخارجها في تبويب جديد.",xMHere:"هذا الدليل (الحاسبات ولوحة القصة)",xMNone:"أدوات ليست في المنصة بعد",xOpen:"افتح",
 xPT:"مسارات التعلم",xPS:"خمسة مسارات قصيرة. علّم الأداة كمدروسة من بطاقتها أو من هنا؛ يُحفظ التقدم في متصفحك في مفتاح مستقل لا يمس لوحات القصة.",xPGo:"تابع المسار",xPDone:"اكتمل المسار",xPReset:"صفّر التقدم",xProg:"{a} من {n}",
 xFT:"البنود 1 إلى 4: كيف تُقرأ المواصفة",xF1:"البند 1 — المجال",xFAim:"الأغراض الأربعة ومثال لكل منها",xF2:"البند 2 — المراجع المعيارية",xF3:"البند 3 — المصطلحات",xFTerms:"مصطلحات من ISO 9000:2026 يستخدمها الدليل",xF4:"البند 4 — أدوات الجودة",xFRead:"كيف تقرأ بطاقة أداة",hNum:"الرقم",hTerm:"المصطلح",hAim:"الغرض",hEx:"مثال",
 xSrT:"نتائج البحث",xSrN:"لا نتائج. جرّب رقم البند أو اسم الأداة بالعربية أو الإنجليزية.",xSrO:"أداة أخرى مذكورة بالاسم في {c}",
 xRP:"مسار القراءة المقترح",xRPS:"ست خطوات من الغرض إلى لوحة القصة. اضغط أي خطوة لتذهب إليها.",
 rp1:"اعرف الأغراض الأربعة وكيف تقرأ البطاقة (البنود 1–4)",rp2:"حدد غرضك ومرحلتك في مستكشف الأدوات",rp3:"افتح بطاقة الأداة المقترحة",rp4:"ضعها على دورة PDCA (الملحق A)",rp5:"ارو التحسين في لوحة قصة (الملحق B)",rp6:"خطط الكفاءة للأدوات •• و••• (الملحق C)",
 xDia:"بنية المواصفة: البنود 5–16 حول دورة PDCA، والملاحق A وB وC",xDiaA:"مخطط أصلي من إعداد الدليل يبين البنود 5 إلى 16 حول دورة PDCA. اضغط أي بند لفتحه.",
 apxL:"أضف ملحق الأدوات الـ 53 (البطاقة المختصرة ومصفوفة الكفاءة)",apxT:"ملحق: بطاقات الأدوات المختصرة",apxC:"مصفوفة الكفاءة (•• و•••)"},
en:{xT:"Interactive clause guide",xS:"Browse the standard clause by clause and open a full card for each of the 53 tools: when to use it and when not, its steps, what an auditor asks to see, and where to apply it on the platform.",
 xQ:"Search a tool or clause (e.g. FMEA, 13.7, Pareto)",xQL:"Search the guide",xToc:"Contents",xFront:"Clauses 1–4",xA:"Annex A",xB:"Annex B",xC:"Annex C",xMap:"Platform map",xPaths:"Learning paths",
 xNote:"Interpretive summary in independent wording, not the official text. Examples are illustrative, from the fictitious Al-Waha Contracting.",
 xInv:"In the standard: {cl} main clauses, {sub} subclauses, {t} tools reviewed in full, {tb} tables of benefits and points to note, {fg} figures in the body and {fb} in Annex B, {nm} names in {ls} \"other relevant tools\" lists, and {bib} bibliography references.",
 xTools:"{n} tools",xOth:"{n} other tools named",xMap9:"ISO 9001:2026 (author's mapping): {m}",xRoot:"ISO 10009",xCl:"Clause {c}",
 xFor:"What this clause is for",xStart:"When to start here",xMini:"Tools of the clause",xOthT:"Other relevant tools (named only in the standard)",xNotPl:"Not on the platform",
 xQuiz:"Check your understanding",xQuizS:"Three questions; answers are not saved.",xRight:"Correct.",xWrong:"Not quite.",xScore:"Your score: {a} of {n}",
 xSum:"What it is",xAims:"Aim (clause 1)",xWhen:"When to use it",xNot:"When not to use it",xInp:"Inputs",xSteps:"How to apply it",xOut:"Output and record",
 xAttr:"Attributes in Table C.1",xPdca:"Place on PDCA (Annex A)",xBen:"Benefits",xNotes:"Points to note",xEx:"Al-Waha example",xMis:"Common mistakes",xAud:"What an auditor asks to see",
 xChain:"Before and after",xBefore:"Usually before it",xAfter:"Usually after it",xApply:"Apply it on the platform",xLib:"In the tool library",xFull:"Full card",xNone:"Not on the platform yet: record it as a storyboard step and attach its output.",
 xSrc:"In the standard: Table {tb}{fg}{rf}",xSrcF:" · Figure {f}",xSrcR:" · references cited [{r}] (not verified)",
 xPrev:"Previous",xNext:"Next",xCopy:"Copy link to this tool",xCopied:"Link copied",xCopyF:"Copy the link by hand:",
 xStud:"Mark as studied",xStudOn:"Studied ✓",xInPaths:"In path: {p}",
 xAttrW:"Area: {a} · Product or service: {p} · {w} · Data: {d} · Capability: {c} · Effort: {e}",xPsB:"both",xPsM:"manufacturing",xCapN:"{d} ({w})",
 cap1:"reading the documented information is enough",cap2:"needs dedicated training",cap3:"needs a longer course and experience",
 xAT:"Annex A: tools on the PDCA cycle",xAS:"Pick the context, then click a tool to open its card. Pick a tool from the list to highlight all its places in the three tables.",xHl:"Highlight a tool",xHl0:"— no highlight —",
 xRange:"Range: every tool reviewed from {a} to {b}",xPlaces:"{n} places in the three tables",xAN:"Ranges in the tables cover every tool reviewed in the range. In clause 13 the table number is one less than the subclause (e.g. Table 13.3 is for the radar chart, 13.4) because 13.1 is a general subclause.",
 xBT:"Annex B: storyboards",xBS:"Three figures showing what a storyboard may look like (a summary of each figure, not the figure itself).",xBHow:"How to build a storyboard",xBGo:"Start a storyboard",
 xCT:"Annex C: tool attributes (Table C.1)",xCS:"Sort by clicking a column head; filter by capability, team, effort or platform place.",xCAll:"All",xCCnt:"{n} of 53 tools",
 xCN:"Table C.1 lists total quality management as 16.3 while the text numbers it 16.2; this guide uses the text number. Tool 13.6 (CTQ trees) has only a level of capability in the table.",
 xCsv:"Export the competence matrix (•• and •••)",xCsvN:"The tools that need training or experience, to put in your competence plan under ISO 9001:2026 clause 7.2.",
 hCode:"#",hTool:"Tool",hArea:"Area",hPs:"Product/service",hTeam:"Team/individual",hData:"Data",hCap:"Capability",hEff:"Effort",hLv:"Platform",
 xMT:"Platform link map",xMS:"Each platform tool and the tools of the standard it covers. Inside the hub a tool opens in its window; outside it, in a new tab.",xMHere:"This guide (calculators and storyboard)",xMNone:"Tools not on the platform yet",xOpen:"Open",
 xPT:"Learning paths",xPS:"Five short paths. Mark a tool as studied from its card or from here; progress is saved in your browser under its own key and never touches your storyboards.",xPGo:"Continue the path",xPDone:"Path complete",xPReset:"Reset progress",xProg:"{a} of {n}",
 xFT:"Clauses 1 to 4: how to read the standard",xF1:"Clause 1 — Scope",xFAim:"The four aims, with an example each",xF2:"Clause 2 — Normative references",xF3:"Clause 3 — Terms",xFTerms:"ISO 9000:2026 terms this guide uses",xF4:"Clause 4 — Quality tools",xFRead:"How to read a tool card",hNum:"No.",hTerm:"Term",hAim:"Aim",hEx:"Example",
 xSrT:"Search results",xSrN:"No results. Try the clause number or the tool name in English or Arabic.",xSrO:"Other tool named in {c}",
 xRP:"Suggested reading path",xRPS:"Six steps from the aim to the storyboard. Click a step to go there.",
 rp1:"Learn the four aims and how to read a card (clauses 1–4)",rp2:"Set your aim and phase in the tool navigator",rp3:"Open the card of the suggested tool",rp4:"Place it on the PDCA cycle (Annex A)",rp5:"Tell the improvement in a storyboard (Annex B)",rp6:"Plan competence for •• and ••• tools (Annex C)",
 xDia:"Structure of the standard: clauses 5–16 around the PDCA cycle, and Annexes A, B and C",xDiaA:"An original diagram made for this guide showing clauses 5 to 16 around the PDCA cycle. Click a clause to open it.",
 apxL:"Add the appendix of the 53 tools (short cards and competence matrix)",apxT:"Appendix: short tool cards",apxC:"Competence matrix (•• and •••)"}
};
function qx(k,v){ var d=QXU[L]||QXU.ar, s=d[k]!==undefined?d[k]:(QXU.ar[k]!==undefined?QXU.ar[k]:k); if(v){ for(var x in v){ s=String(s).split("{"+x+"}").join(v[x]); } } return s; }
var AAL={BCG:["مصفوفة BCG","BCG matrix"],mystery:["المتسوق الخفي","Mystery shopper"],BSC:["بطاقة الأداء المتوازن","Balanced scorecard"],solution:["أثر الحل","Solution effect"],lewin:["تحليل مجال القوى","Force field analysis"],DWD:["تصميم العمل الديناميكي","Dynamic work design"],PGCV:["المكسب المحتمل في قيمة العميل","Potential gain in customer value"],AHP:["التحليل الهرمي AHP","Analytic hierarchy process (AHP)"],RPA:["أتمتة العمليات الروبوتية","Robotic process automation"],cycle:["الجرد الدوري","Cycle counts"],turns:["دوران المخزون","Inventory turns"]};
var QS={v:"toc",c:"",tool:"",ctx:"p",hl:"",q:"",sort:"c",dir:1,fcap:"",fteam:"",feff:"",flv:"",quiz:{}};
var SEP=function(){ return L==="ar"?"، ":", "; };

/* learning-path progress: its own key only */
function pRead(){ try{ var v=JSON.parse(localStorage.getItem(PKEY)||"null"); if(v&&Array.isArray(v.studied)) return v.studied.filter(function(c){ return !!BYC[c]; }); }catch(e){} return []; }
function pWrite(a){ try{ localStorage.setItem(PKEY,JSON.stringify({studied:a})); }catch(e){} }
function pHas(c){ return pRead().indexOf(c)>=0; }
function pToggle(c){ var a=pRead(), i=a.indexOf(c); if(i>=0) a.splice(i,1); else a.push(c); a.sort(cmpCode); pWrite(a); }
function pathsOf(c){ return QX.PATHS.filter(function(p){ return p.c.indexOf(c)>=0; }); }

function clName(c){ var x=QTC.CL.filter(function(k){ return k[0]===c; })[0]; return x?nm(x[1]):""; }
function tName(T0){ return T0.c+" "+nm(T0.n); }
function tChip(c,cls){ var T0=BYC[c]; return T0?'<button type="button" class="qx-chip'+(cls?" "+cls:"")+'" data-qxt="'+esc(c)+'"><code>'+esc(c)+'</code> '+esc(nm(T0.n))+'</button>':''; }
function ul(list){ return '<ul>'+list.map(function(x){ return '<li>'+esc(nm(x))+'</li>'; }).join("")+'</ul>'; }
function capW(n){ return n?qx("cap"+n):""; }
function attrWords(T0){ return qx("xAttrW",{a:nm(QTC.AREAS[T0.area]),p:T0.ps==="mfg"?qx("xPsM"):(T0.ps?qx("xPsB"):"—"),w:teamTxt(T0.team),d:T0.data?t("data_"+T0.data):"—",c:T0.cap?qx("xCapN",{d:dots(T0.cap),w:capW(T0.cap)}):"—",e:T0.eff?t("eff_"+T0.eff):"—"}); }
function srcLine(T0){ var I=QX.INV, tb=I.tab[T0.c]||(T0.c==="5.4"?I.tab["5.4.2"]:""), f=I.fig[T0.c]||[], r=I.ref[T0.c]||[];
 return qx("xSrc",{tb:tb||"—",fg:f.length?qx("xSrcF",{f:f.join(SEP())}):"",rf:r.length?qx("xSrcR",{r:r.join(", ")}):""}); }
function crumb(parts){ return '<nav class="qx-crumb" aria-label="breadcrumb">'+parts.map(function(p,i){ return (i?'<span aria-hidden="true">›</span>':'')+(p[1]?'<button type="button" '+p[1]+'>'+esc(p[0])+'</button>':'<b>'+esc(p[0])+'</b>'); }).join("")+'</nav>'; }
function head(){ return '<div class="qx-bar"><label class="qx-q"><span class="sr" >'+esc(qx("xQL"))+'</span><input type="search" id="qxQ" value="'+esc(QS.q)+'" placeholder="'+esc(qx("xQ"))+'" aria-label="'+esc(qx("xQL"))+'"></label><div class="qx-nav">'+
 [["toc","xToc"],["front","xFront"],["A","xA"],["B","xB"],["C","xC"],["map","xMap"],["paths","xPaths"]].map(function(x){ return '<button type="button" class="pd-rowbtn" data-qxv="'+x[0]+'" aria-pressed="'+(QS.v===x[0]?"true":"false")+'">'+esc(qx(x[1]))+'</button>'; }).join("")+'</div></div>'; }

/* contents */
function vToc(){
 var n=QX.INV.n;
 var h='<p class="qx-inv">'+esc(qx("xInv",{cl:n.clauses,sub:n.sub,t:TL.length,tb:n.tables,fg:n.figs,fb:n.figB,nm:n.names,ls:n.lists,bib:n.bib}))+'</p><div class="qx-toc">';
 h+='<button type="button" class="qx-tc" data-qxv="front" style="--qc:#7A869E"><code>1–4</code><b>'+esc(qx("xFront"))+'</b><small>'+esc(qx("xFT"))+'</small></button>';
 QTC.CL.forEach(function(c){ var k=TL.filter(function(T0){ return T0.sec===c[0]; }).length, o=QTC.O.filter(function(x){ return x[0].split(".")[0]===c[0]; }).length;
  h+='<button type="button" class="qx-tc" data-qxc="'+c[0]+'" style="--qc:'+SECCOL[c[0]]+'"><code>'+c[0]+'</code><b>'+esc(nm(c[1]))+'</b><small>'+esc(qx("xTools",{n:k})+" · "+qx("xOth",{n:o}))+'</small></button>'; });
 [["A","xA","xAT"],["B","xB","xBT"],["C","xC","xCT"],["map","xMap","xMT"],["paths","xPaths","xPT"]].forEach(function(x){ h+='<button type="button" class="qx-tc" data-qxv="'+x[0]+'" style="--qc:#7A869E"><code>'+esc(x[0].length===1?x[0]:"↗")+'</code><b>'+esc(qx(x[1]))+'</b><small>'+esc(qx(x[2]))+'</small></button>'; });
 return crumb([[qx("xRoot")]])+h+'</div>';
}
/* clauses 1–4 */
function vFront(){
 var F=QX.FRONT;
 return crumb([[qx("xRoot"),'data-qxv="toc"'],[qx("xFront")]])+'<h2>'+esc(qx("xFT"))+'</h2><p>'+esc(nm(F.front))+'</p>'+
  '<h3>'+esc(qx("xF1"))+'</h3><p>'+esc(nm(F.c1))+'</p><table class="qx-tb"><caption>'+esc(qx("xFAim"))+'</caption><thead><tr><th>'+esc(qx("hAim"))+'</th><th>'+esc(qx("hEx"))+'</th></tr></thead><tbody>'+
  F.aims.map(function(a,i){ return '<tr><td><b>'+"abcd"[i]+')</b> '+esc(nm(a[0]))+'</td><td>'+esc(nm(a[1]))+'</td></tr>'; }).join("")+'</tbody></table>'+
  '<h3>'+esc(qx("xF2"))+'</h3><p>'+esc(nm(F.c2))+'</p><h3>'+esc(qx("xF3"))+'</h3><p>'+esc(nm(F.c3))+'</p>'+
  '<table class="qx-tb"><caption>'+esc(qx("xFTerms"))+'</caption><thead><tr><th>'+esc(qx("hNum"))+'</th><th>'+esc(qx("hTerm"))+'</th></tr></thead><tbody>'+F.terms.map(function(x){ return '<tr><td dir="ltr">ISO 9000:2026 '+esc(x[0])+'</td><td>'+esc(nm(x[1]))+'</td></tr>'; }).join("")+'</tbody></table>'+
  '<h3>'+esc(qx("xF4"))+'</h3><p>'+esc(nm(F.c4))+'</p><h3>'+esc(qx("xFRead"))+'</h3><ol>'+F.read.map(function(x){ return '<li>'+esc(nm(x))+'</li>'; }).join("")+'</ol>';
}
/* one clause 5–16 */
function vClause(c){
 var C0=QTC.CL.filter(function(k){ return k[0]===c; })[0]; if(!C0) return vToc();
 var ts=ORD.filter(function(T0){ return T0.sec===c; }), oth=[]; QTC.O.forEach(function(o,i){ if(o[0].split(".")[0]===c) oth.push([o,QX.OTX[i]]); });
 var X=QX.CLX[c], qz=QX.QUIZ[c]||[], st=QS.quiz[c]||{};
 var cn=Number(c), prev=cn>5?String(cn-1):"", next=cn<16?String(cn+1):"";
 var h=crumb([[qx("xRoot"),'data-qxv="toc"'],[qx("xCl",{c:c})+" · "+nm(C0[1])]])+'<h2><code>'+c+'</code> '+esc(nm(C0[1]))+'</h2><p class="qx-m9">'+esc(qx("xMap9",{m:C0[2]}))+'</p>'+
  '<div class="qx-two"><div><h3>'+esc(qx("xFor"))+'</h3><p>'+esc(nm(X[0]))+'</p></div><div><h3>'+esc(qx("xStart"))+'</h3><p>'+esc(nm(X[1]))+'</p></div></div>'+
  '<h3>'+esc(qx("xMini"))+'</h3><div class="qx-mini">'+ts.map(function(T0){ return '<button type="button" class="qx-mt" data-qxt="'+esc(T0.c)+'" style="--lc:'+LVCOL[T0.lv]+'"><code>'+esc(T0.c)+'</code><b>'+esc(nm(T0.n))+'</b><small>'+esc(t("lv_"+T0.lv))+' · '+dots(T0.cap)+'</small>'+(pHas(T0.c)?'<i class="qx-ok" aria-label="'+esc(qx("xStudOn"))+'">✓</i>':'')+'</button>'; }).join("")+'</div>'+
  (oth.length?'<h3>'+esc(qx("xOthT"))+'</h3><ul class="qx-oth">'+oth.map(function(p){ var o=p[0]; return '<li><b><code>'+esc(o[0])+'</code> '+esc(nm(o[1]))+'</b> — '+esc(nm(p[1]))+' '+(o[2].length?o[2].map(function(q){ return '<button class="pd-rowbtn" type="button" data-plat="'+esc(q.k)+'" data-ptab="'+esc(q.tab)+'">'+esc(nm(QTC.NAMES[q.k]))+' ↗</button>'; }).join(""):'<span class="qx-np">'+esc(qx("xNotPl"))+'</span>')+'</li>'; }).join("")+'</ul>':'');
 if(qz.length){ var right=0, ans=0;
  h+='<section class="qx-quiz"><h3>'+esc(qx("xQuiz"))+'</h3><p class="pd-sub">'+esc(qx("xQuizS"))+'</p>'+qz.map(function(q,i){ var a=st[i];
   if(a!==undefined){ ans++; if(a===q.ok) right++; }
   return '<div class="qx-qi"><p><b>'+(i+1)+'.</b> '+esc(nm(q.q))+'</p><div class="qx-opts">'+q.o.map(function(o,j){ var cls=a===undefined?"":(j===q.ok?" ok":(j===a?" bad":"")); return '<button type="button" class="qx-opt'+cls+'" data-qxq="'+c+'|'+i+'|'+j+'"'+(a!==undefined?' aria-pressed="'+(j===a)+'"':'')+'>'+esc(nm(o))+'</button>'; }).join("")+'</div>'+
    (a!==undefined?'<p class="qx-why '+(a===q.ok?"ok":"bad")+'" role="status"><b>'+esc(qx(a===q.ok?"xRight":"xWrong"))+'</b> '+esc(nm(q.why))+'</p>':'')+'</div>'; }).join("")+
   (ans?'<p class="qx-score">'+esc(qx("xScore",{a:right,n:qz.length}))+'</p>':'')+'</section>'; }
 h+='<div class="qx-pn">'+(prev?'<button type="button" class="pd-btn ghost" data-qxc="'+prev+'">← '+esc(qx("xCl",{c:prev})+" "+clName(prev))+'</button>':'<span></span>')+(next?'<button type="button" class="pd-btn ghost" data-qxc="'+next+'">'+esc(qx("xCl",{c:next})+" "+clName(next))+' →</button>':'')+'</div>';
 return h;
}
/* the full card of one tool */
function vTool(c){
 var T0=BYC[c]; if(!T0) return vToc();
 var i=ORD.indexOf(T0), P0=ORD[i-1], N0=ORD[i+1], pa=pathsOf(c), stud=pHas(c);
 var sec=function(k,body,cls){ return '<section class="qx-s'+(cls?" "+cls:"")+'"><h3>'+esc(qx(k))+'</h3>'+body+'</section>'; };
 var apply=platBtns(T0)+'<button class="pd-rowbtn" type="button" data-addt="'+esc(T0.id)+'" data-addp="'+esc(phFor(T0)||"")+'">'+esc(t("btnAdd"))+'</button><button class="pd-rowbtn" type="button" data-qxlib="'+esc(T0.id)+'">'+esc(qx("xLib"))+'</button><button class="pd-rowbtn" type="button" data-exp="'+esc(T0.c)+'">'+esc(t("btnExplain"))+'</button>';
 return crumb([[qx("xRoot"),'data-qxv="toc"'],[qx("xCl",{c:T0.sec})+" · "+clName(T0.sec),'data-qxc="'+T0.sec+'"'],[tName(T0)]])+
  '<article class="qx-card" id="qx-'+esc(T0.id)+'" style="--qc:'+SECCOL[T0.sec]+'"><header><h2><code>'+esc(T0.c)+'</code> '+esc(nm(T0.n))+'</h2>'+lvBadge(T0)+attrs(T0)+'<p class="qx-src">'+esc(srcLine(T0))+'</p>'+
  '<div class="qx-tools"><button type="button" class="pd-rowbtn" data-qxcopy="'+esc(T0.c)+'">'+esc(qx("xCopy"))+'</button><button type="button" class="pd-rowbtn'+(stud?" on":"")+'" data-qxdone="'+esc(T0.c)+'" aria-pressed="'+stud+'">'+esc(qx(stud?"xStudOn":"xStud"))+'</button>'+(pa.length?'<span class="qx-pin">'+esc(qx("xInPaths",{p:pa.map(function(p){ return nm(p.n); }).join(SEP())}))+'</span>':'')+'<span class="qx-cp" id="qxCp" role="status"></span></div></header>'+
  '<p class="qx-note">'+esc(qx("xNote"))+'</p>'+
  sec("xSum",'<p>'+esc(nm(T0.d))+'</p>')+
  sec("xAims",'<p>'+esc(T0.aims.map(function(a){ return t("aim_"+a); }).join(SEP()))+'</p>')+
  '<div class="qx-two">'+sec("xWhen",ul(T0.use))+sec("xNot",ul(T0.nw))+'</div>'+
  sec("xInp",ul(T0.inp))+
  sec("xSteps",'<ol>'+T0.st.map(function(x){ return '<li>'+esc(nm(x))+'</li>'; }).join("")+'</ol>',"steps")+
  sec("xOut",'<p>'+esc(nm(T0.out))+'</p>')+
  '<div class="qx-two">'+sec("xAttr",'<p>'+esc(attrWords(T0))+'</p>')+sec("xPdca",'<p>'+esc(pdcaTxt(T0))+'</p>')+'</div>'+
  '<div class="qx-two">'+sec("xBen",ul(T0.ben))+sec("xNotes",ul(T0.note))+'</div>'+
  sec("xEx",'<p>'+esc(nm(T0.ex))+'</p>',"ex")+
  '<div class="qx-two">'+sec("xMis",ul(T0.mis))+sec("xAud",ul(T0.aud),"aud")+'</div>'+
  sec("xChain",'<p><b>'+esc(qx("xBefore"))+':</b> '+(T0.pre.map(function(x){ return tChip(x); }).join(" ")||"—")+'</p><p><b>'+esc(qx("xAfter"))+':</b> '+(T0.nxt.map(function(x){ return tChip(x); }).join(" ")||"—")+'</p>')+
  sec("xApply",(T0.lv==="none"?'<p class="pd-sub">'+esc(qx("xNone"))+'</p>':'')+'<div class="qt-acts">'+apply+'</div>',"apply")+
  '<div class="qx-pn">'+(P0?'<button type="button" class="pd-btn ghost" data-qxt="'+esc(P0.c)+'">← '+esc(qx("xPrev"))+': '+esc(tName(P0))+'</button>':'<span></span>')+(N0?'<button type="button" class="pd-btn ghost" data-qxt="'+esc(N0.c)+'">'+esc(qx("xNext"))+': '+esc(tName(N0))+' →</button>':'')+'</div></article>';
}
/* Annex A */
function aaCell(x){
 if(x.indexOf("R:")===0){ var r=x.slice(2).split("-"), inr=ORD.filter(function(T0){ return cmpCode(T0.c,r[0])>=0&&cmpCode(T0.c,r[1])<=0; });
  return '<details class="qx-rg'+(QS.hl&&inr.some(function(T0){ return T0.c===QS.hl; })?" hl":"")+'"><summary>'+esc(r[0]+" – "+r[1])+'</summary><small>'+esc(qx("xRange",{a:r[0],b:r[1]}))+'</small><div>'+inr.map(function(T0){ return tChip(T0.c,T0.c===QS.hl?"hl":""); }).join("")+'</div></details>'; }
 var p=x.split(":"); if(p[1]){ var lb=AAL[p[1]]; return '<span class="qx-chip oth"><code>'+esc(p[0])+'</code> '+esc(lb?lb[L==="ar"?0:1]:p[1])+'</span>'; }
 return tChip(p[0],p[0]===QS.hl?"hl":"");
}
function aaPlaces(c){ var n=0; ["s","p","c"].forEach(function(k){ PH.forEach(function(ph){ QX.AA[k][ph].forEach(function(x){ if(x===c) n++; else if(x.indexOf("R:")===0){ var r=x.slice(2).split("-"); if(cmpCode(c,r[0])>=0&&cmpCode(c,r[1])<=0) n++; } }); }); }); return n; }
function vA(){
 var k=QS.ctx, h=crumb([[qx("xRoot"),'data-qxv="toc"'],[qx("xA")]])+'<h2>'+esc(qx("xAT"))+'</h2><p class="pd-sub">'+esc(qx("xAS"))+'</p><div class="qx-ctl"><div class="qx-seg" role="group">'+
  CTXS.map(function(c){ return '<button type="button" class="pd-rowbtn" data-qxctx="'+c+'" aria-pressed="'+(k===c)+'">'+esc(nm(QTC.CTX[c]))+'</button>'; }).join("")+'</div>'+
  '<label>'+esc(qx("xHl"))+' <select id="qxHl"><option value="">'+esc(qx("xHl0"))+'</option>'+ORD.map(function(T0){ return '<option value="'+esc(T0.c)+'"'+(QS.hl===T0.c?" selected":"")+'>'+esc(tName(T0))+'</option>'; }).join("")+'</select></label>'+
  (QS.hl?'<span class="qx-pin">'+esc(qx("xPlaces",{n:aaPlaces(QS.hl)}))+'</span>':'')+'</div>';
 h+='<div class="qx-aa" role="table" aria-label="'+esc(nm(QTC.CTX[k]))+'">'+PH.map(function(ph){ return '<div class="qx-ph" role="row" style="--pc:'+PCOL[ph]+'"><h3 role="columnheader">'+esc(t("ph_"+ph))+'</h3><div role="cell">'+QX.AA[k][ph].map(aaCell).join("")+'</div></div>'; }).join("")+'</div><p class="pd-sub">'+esc(qx("xAN"))+'</p>';
 return h;
}
/* Annex B */
function vB(){
 return crumb([[qx("xRoot"),'data-qxv="toc"'],[qx("xB")]])+'<h2>'+esc(qx("xBT"))+'</h2><p class="pd-sub">'+esc(qx("xBS"))+'</p><div class="qx-bf">'+
  QX.B.figs.map(function(f){ return '<div><code>'+esc("B."+f[0].split(".")[1])+'</code><b>'+esc(nm(f[1]))+'</b><p>'+esc(nm(f[2]))+'</p></div>'; }).join("")+'</div>'+
  '<h3>'+esc(qx("xBHow"))+'</h3><ol>'+QX.B.how.map(function(x){ return '<li>'+esc(nm(x))+'</li>'; }).join("")+'</ol><button type="button" class="pd-btn" data-plat="" data-ptab="sb">'+esc(qx("xBGo"))+'</button>';
}
/* Annex C */
var CCOLS=[["c","hCode"],["n","hTool"],["area","hArea"],["ps","hPs"],["team","hTeam"],["data","hData"],["cap","hCap"],["eff","hEff"],["lv","hLv"]];
function cVal(T0,k){ if(k==="c") return T0.c; if(k==="n") return nm(T0.n); if(k==="area") return nm(QTC.AREAS[T0.area]); if(k==="ps") return T0.ps; if(k==="team") return T0.team; if(k==="data") return DR[T0.data]||0; if(k==="cap") return T0.cap||0; if(k==="eff") return ER[T0.eff]||0; if(k==="lv") return LVS.indexOf(T0.lv); return ""; }
function cRows(){
 var r=ORD.filter(function(T0){ return (!QS.fcap||String(T0.cap)===QS.fcap)&&(!QS.fteam||T0.team===QS.fteam)&&(!QS.feff||T0.eff===QS.feff)&&(!QS.flv||T0.lv===QS.flv); });
 var k=QS.sort, d=QS.dir;
 return r.slice().sort(function(a,b){ if(k==="c") return d*cmpCode(a.c,b.c); var x=cVal(a,k), y=cVal(b,k); var s=(typeof x==="number")?x-y:String(x).localeCompare(String(y),L); return d*s||cmpCode(a.c,b.c); });
}
function fSel(id,cur,opts){ return '<select id="'+id+'"><option value="">'+esc(qx("xCAll"))+'</option>'+opts.map(function(o){ return '<option value="'+esc(o[0])+'"'+(cur===o[0]?" selected":"")+'>'+esc(o[1])+'</option>'; }).join("")+'</select>'; }
function vC(){
 var rows=cRows();
 return crumb([[qx("xRoot"),'data-qxv="toc"'],[qx("xC")]])+'<h2>'+esc(qx("xCT"))+'</h2><p class="pd-sub">'+esc(qx("xCS"))+'</p><div class="qx-ctl">'+
  '<label>'+esc(qx("hCap"))+' '+fSel("qxFcap",QS.fcap,[["1","•"],["2","••"],["3","•••"]])+'</label><label>'+esc(qx("hTeam"))+' '+fSel("qxFteam",QS.fteam,[["team",t("t_team")],["ind",t("t_ind")],["both",t("t_both")]])+'</label>'+
  '<label>'+esc(qx("hEff"))+' '+fSel("qxFeff",QS.feff,EFFS.map(function(e){ return [e,t("eff_"+e)]; }))+'</label><label>'+esc(qx("hLv"))+' '+fSel("qxFlv",QS.flv,LVS.map(function(e){ return [e,t("lv_"+e)]; }))+'</label>'+
  '<span class="qx-pin" id="qxCcnt">'+esc(qx("xCCnt",{n:rows.length}))+'</span></div><div class="qx-scroll"><table class="qx-tb qx-c1"><thead><tr>'+
  CCOLS.map(function(c){ var on=QS.sort===c[0]; return '<th aria-sort="'+(on?(QS.dir>0?"ascending":"descending"):"none")+'"><button type="button" data-qxsort="'+c[0]+'">'+esc(qx(c[1]))+(on?(QS.dir>0?" ▲":" ▼"):"")+'</button></th>'; }).join("")+'</tr></thead><tbody>'+
  rows.map(function(T0){ return '<tr><td><button type="button" class="qx-lnk" data-qxt="'+esc(T0.c)+'">'+esc(T0.c)+'</button></td><td>'+esc(nm(T0.n))+'</td><td>'+esc(nm(QTC.AREAS[T0.area]))+'</td><td>'+esc(T0.ps==="mfg"?qx("xPsM"):(T0.ps?qx("xPsB"):"—"))+'</td><td>'+esc(teamTxt(T0.team))+'</td><td>'+esc(T0.data?t("data_"+T0.data):"—")+'</td><td title="'+esc(capW(T0.cap))+'">'+dots(T0.cap)+'</td><td>'+esc(T0.eff?t("eff_"+T0.eff):"—")+'</td><td><span class="qt-lv '+T0.lv+'">'+esc(t("lv_"+T0.lv))+'</span></td></tr>'; }).join("")+
  '</tbody></table></div><p class="pd-sub">'+esc(qx("xCN"))+'</p><p><button type="button" class="pd-btn" data-qxcsv="1">'+esc(qx("xCsv"))+'</button></p><p class="pd-sub">'+esc(qx("xCsvN"))+'</p>';
}
function compRows(){ return ORD.filter(function(T0){ return T0.cap>=2; }); }
function compCSV(){
 var head=L==="ar"?["البند","الأداة","الكفاءة","المعنى","فريق/فرد","الجهد","ISO 9001:2026","في المنصة","المسؤول عن التدريب","الموعد"]:["Clause","Tool","Capability","Meaning","Team/individual","Effort","ISO 9001:2026","On the platform","Training owner","Due date"];
 return TBX.csv(head,compRows().map(function(T0){ return [T0.c,nm(T0.n),dots(T0.cap),capW(T0.cap),teamTxt(T0.team),T0.eff?t("eff_"+T0.eff):"",L==="ar"?"7.2 الكفاءة":"7.2 Competence",t("lv_"+T0.lv),"",""]; }));
}
/* platform link map */
function mapRows(){
 var R={}; Object.keys(QTC.FILES).forEach(function(k){ R[k]={t:[],o:[],tab:""}; });
 ORD.forEach(function(T0){ T0.plat.forEach(function(p){ if(p.k&&R[p.k]&&(p.lvl==="own"||p.lvl==="in"||p.lvl==="rel")){ R[p.k].t.push([T0.c,p.lvl,p.tab]); if(!R[p.k].tab) R[p.k].tab=p.tab; } }); });
 QTC.O.forEach(function(o){ o[2].forEach(function(p){ if(R[p.k]){ R[p.k].o.push(o); if(!R[p.k].tab) R[p.k].tab=p.tab; } }); });
 return Object.keys(R).filter(function(k){ return R[k].t.length||R[k].o.length; }).map(function(k){ return [k,R[k]]; });
}
function vMap(){
 var here=ORD.filter(function(T0){ return T0.lv==="here"; }), none=ORD.filter(function(T0){ return T0.lv==="none"; });
 return crumb([[qx("xRoot"),'data-qxv="toc"'],[qx("xMap")]])+'<h2>'+esc(qx("xMT"))+'</h2><p class="pd-sub">'+esc(qx("xMS"))+'</p><div class="qx-map">'+
  mapRows().map(function(x){ var R=x[1]; return '<div class="qx-mr"><div><b>'+esc(nm(QTC.NAMES[x[0]]))+'</b><small dir="ltr">'+esc(QTC.FILES[x[0]])+'</small><button type="button" class="pd-rowbtn" data-plat="'+esc(x[0])+'" data-ptab="'+esc(R.tab)+'">'+esc(qx("xOpen"))+' ↗</button></div><div>'+
   R.t.map(function(y){ return tChip(y[0],"lv-"+y[1]); }).join("")+R.o.map(function(o){ return '<span class="qx-chip oth"><code>'+esc(o[0])+'</code> '+esc(nm(o[1]))+'</span>'; }).join("")+'</div></div>'; }).join("")+
  '<div class="qx-mr"><div><b>'+esc(qx("xMHere"))+'</b><button type="button" class="pd-rowbtn" data-plat="" data-ptab="sb">'+esc(qx("xOpen"))+'</button></div><div>'+here.map(function(T0){ return tChip(T0.c,"lv-here"); }).join("")+'</div></div>'+
  '<div class="qx-mr"><div><b>'+esc(qx("xMNone"))+'</b><small>'+none.length+'</small></div><div>'+none.map(function(T0){ return tChip(T0.c,"lv-none"); }).join("")+'</div></div></div>';
}
/* learning paths */
function vPaths(){
 var S0=pRead();
 return crumb([[qx("xRoot"),'data-qxv="toc"'],[qx("xPaths")]])+'<h2>'+esc(qx("xPT"))+'</h2><p class="pd-sub">'+esc(qx("xPS"))+'</p><div class="qx-paths">'+
  QX.PATHS.map(function(p){ var d=p.c.filter(function(c){ return S0.indexOf(c)>=0; }).length, nx=p.c.filter(function(c){ return S0.indexOf(c)<0; })[0];
   return '<section class="qx-path" data-path="'+esc(p.id)+'"><h3>'+esc(nm(p.n))+'</h3><div class="qx-pbar" role="progressbar" aria-valuemin="0" aria-valuemax="'+p.c.length+'" aria-valuenow="'+d+'"><i style="width:'+Math.round(d/p.c.length*100)+'%"></i></div><small>'+esc(qx("xProg",{a:d,n:p.c.length}))+'</small><ol>'+
    p.c.map(function(c){ var on=S0.indexOf(c)>=0; return '<li><label><input type="checkbox" data-qxdone="'+esc(c)+'"'+(on?" checked":"")+'> </label>'+tChip(c)+'</li>'; }).join("")+'</ol><p class="pd-sub">'+esc(nm(p.x))+'</p>'+
    (nx?'<button type="button" class="pd-btn ghost" data-qxt="'+esc(nx)+'">'+esc(qx("xPGo"))+' →</button>':'<b class="qx-done">'+esc(qx("xPDone"))+' ✓</b>')+'</section>'; }).join("")+'</div>'+
  (S0.length?'<p><button type="button" class="pd-rowbtn" data-qxreset="1">'+esc(qx("xPReset"))+'</button></p>':'');
}
/* search */
function vSearch(){
 var q=libNorm(QS.q), hit=function(arr){ return libNorm(arr.join(" ")).indexOf(q)>=0; };
 var ts=ORD.filter(function(T0){ return T0.c===QS.q.trim()||hit([T0.c,T0.n.ar,T0.n.en,T0.d.ar,T0.d.en].concat(T0.use.map(function(u){ return u.ar+" "+u.en; }))); });
 var os=[]; QTC.O.forEach(function(o,i){ if(hit([o[0],o[1].ar,o[1].en,QX.OTX[i].ar,QX.OTX[i].en])) os.push(o); });
 return crumb([[qx("xRoot"),'data-qxv="toc"'],[qx("xSrT")]])+'<h2>'+esc(qx("xSrT"))+'</h2>'+(ts.length||os.length?'<div class="qx-mini">'+ts.map(function(T0){ return '<button type="button" class="qx-mt" data-qxt="'+esc(T0.c)+'" style="--lc:'+LVCOL[T0.lv]+'"><code>'+esc(T0.c)+'</code><b>'+esc(nm(T0.n))+'</b><small>'+esc(short(nm(T0.d),110))+'</small></button>'; }).join("")+
  os.map(function(o){ return '<button type="button" class="qx-mt" data-qxc="'+esc(o[0].split(".")[0])+'" style="--lc:#C9D2DF"><code>'+esc(o[0])+'</code><b>'+esc(nm(o[1]))+'</b><small>'+esc(qx("xSrO",{c:o[0]}))+'</small></button>'; }).join("")+'</div>':'<div class="pd-empty">'+esc(qx("xSrN"))+'</div>');
}
function qxRender(keepFocus){
 var box=document.getElementById("qxBox"); if(!box) return;
 var body=QS.q.trim()?vSearch():(QS.v==="tool"?vTool(QS.tool):QS.v==="cl"?vClause(QS.c):QS.v==="front"?vFront():QS.v==="A"?vA():QS.v==="B"?vB():QS.v==="C"?vC():QS.v==="map"?vMap():QS.v==="paths"?vPaths():vToc());
 box.innerHTML='<div class="qx-hd"><h2>'+esc(qx("xT"))+'</h2><p class="pd-sub">'+esc(qx("xS"))+'</p></div>'+head()+'<div class="qx-body" id="qxBody">'+body+'</div>';
 if(keepFocus){ var i=document.getElementById("qxQ"); if(i){ i.focus(); try{ i.setSelectionRange(i.value.length,i.value.length); }catch(e){} } }
}
function qxTop(){ var b=document.getElementById("qxBox"); if(b&&b.scrollIntoView&&curTab==="explain-cl") b.scrollIntoView({block:"start"}); }
function qxView(v){ QS.v=v; QS.q=""; qxRender(); qxTop(); }
function qxClause(c){ QS.v="cl"; QS.c=c; QS.q=""; qxRender(); qxTop(); }
function qxTool(c){ var T0=BYC[c]||BYID[c]; if(!T0) return false; QS.v="tool"; QS.tool=T0.c; QS.q=""; if(curTab!=="explain-cl") go("explain-cl"); else qxRender(); qxTop(); return true; }
function qxLink(c){ var u=location.href.split("#")[0].split("?")[0]; return u+"?tool="+encodeURIComponent(c)+"#explain-cl"; }
function qxCopy(c){
 var url=qxLink(c), out=document.getElementById("qxCp"), ok=function(){ if(out) out.textContent=qx("xCopied"); }, fail=function(){ if(out) out.innerHTML=esc(qx("xCopyF"))+' <input type="text" readonly dir="ltr" value="'+esc(url)+'" onfocus="this.select()">'; };
 try{ if(navigator.clipboard&&navigator.clipboard.writeText){ navigator.clipboard.writeText(url).then(ok,fail); return; } }catch(e){}
 fail();
}
/* reading path and diagram in the standard guide tab */
function qxStd(){
 var box=document.getElementById("qxStd"); if(!box) return;
 var steps=[["rp1",'data-qxgo="front"'],["rp2",'data-go="tools"'],["rp3",'data-qxgo="toc"'],["rp4",'data-qxgo="A"'],["rp5",'data-qxgo="B"'],["rp6",'data-qxgo="C"']];
 var cx=200, cy=190, R=150, cls=QTC.CL, svg='<svg viewBox="0 0 400 400" role="img" aria-labelledby="qxDiaT qxDiaD" class="qx-dia"><title id="qxDiaT">'+esc(qx("xDia"))+'</title><desc id="qxDiaD">'+esc(qx("xDiaA"))+'</desc>';
 svg+='<circle cx="'+cx+'" cy="'+cy+'" r="62" fill="#F3F7FB" stroke="#DCE4EE"/>';
 PH.forEach(function(ph,i){ var a=(-90+i*90+45)*Math.PI/180, x=cx+34*Math.cos(a), y=cy+34*Math.sin(a); svg+='<text x="'+x.toFixed(1)+'" y="'+(y+5).toFixed(1)+'" text-anchor="middle" font-size="15" font-weight="700" fill="'+PCOL[ph]+'">'+ph+'</text>'; });
 cls.forEach(function(c,i){ var a=(-90+i*30)*Math.PI/180, x=cx+R*Math.cos(a), y=cy+R*Math.sin(a), n=TL.filter(function(T0){ return T0.sec===c[0]; }).length;
  svg+='<g class="qx-dn" data-qxc="'+c[0]+'" tabindex="0" role="button" aria-label="'+esc(qx("xCl",{c:c[0]})+" "+nm(c[1]))+'"><line x1="'+cx+'" y1="'+cy+'" x2="'+x.toFixed(1)+'" y2="'+y.toFixed(1)+'" stroke="#DCE4EE"/><circle cx="'+x.toFixed(1)+'" cy="'+y.toFixed(1)+'" r="25" fill="'+SECCOL[c[0]]+'"/><text x="'+x.toFixed(1)+'" y="'+(y-1).toFixed(1)+'" text-anchor="middle" font-size="14" font-weight="700" fill="#fff">'+c[0]+'</text><text x="'+x.toFixed(1)+'" y="'+(y+12).toFixed(1)+'" text-anchor="middle" font-size="9" fill="#fff">'+n+'</text></g>'; });
 svg+='<text x="'+cx+'" y="394" text-anchor="middle" font-size="12" fill="#4B5874">A · PDCA   ·   B · Storyboards   ·   C · Table C.1</text></svg>';
 box.innerHTML='<h2>'+esc(qx("xRP"))+'</h2><p class="pd-sub">'+esc(qx("xRPS"))+'</p><ol class="qx-rp">'+steps.map(function(s){ return '<li><button type="button" '+s[1]+'>'+esc(qx(s[0]))+'</button></li>'; }).join("")+'</ol>'+
  '<figure class="qx-fig">'+svg+'<figcaption>'+esc(qx("xDiaA"))+'</figcaption></figure>';
}
document.addEventListener("click",function(e){
 var g=e.target.closest("[data-qxgo]"); if(g){ QS.v=g.getAttribute("data-qxgo"); QS.q=""; go("explain-cl"); return; }
 if(!e.target.closest("#qxBox")&&!e.target.closest("#qxStd")) return;
 var x;
 if((x=e.target.closest("[data-qxt]"))){ qxTool(x.getAttribute("data-qxt")); return; }
 if((x=e.target.closest("[data-qxc]"))){ if(curTab!=="explain-cl"){ QS.v="cl"; QS.c=x.getAttribute("data-qxc"); QS.q=""; go("explain-cl"); } else qxClause(x.getAttribute("data-qxc")); return; }
 if((x=e.target.closest("[data-qxv]"))){ qxView(x.getAttribute("data-qxv")); return; }
 if((x=e.target.closest("[data-qxctx]"))){ QS.ctx=x.getAttribute("data-qxctx"); qxRender(); return; }
 if((x=e.target.closest("[data-qxsort]"))){ var k=x.getAttribute("data-qxsort"); if(QS.sort===k) QS.dir=-QS.dir; else { QS.sort=k; QS.dir=1; } qxRender(); return; }
 if((x=e.target.closest("[data-qxq]"))){ var p=x.getAttribute("data-qxq").split("|"); QS.quiz[p[0]]=QS.quiz[p[0]]||{}; QS.quiz[p[0]][Number(p[1])]=Number(p[2]); qxRender(); return; }
 if((x=e.target.closest("[data-qxdone]"))){ pToggle(x.getAttribute("data-qxdone")); qxRender(); return; }
 if((x=e.target.closest("[data-qxreset]"))){ pWrite([]); qxRender(); return; }
 if((x=e.target.closest("[data-qxcopy]"))){ qxCopy(x.getAttribute("data-qxcopy")); return; }
 if((x=e.target.closest("[data-qxlib]"))){ focusTool(x.getAttribute("data-qxlib")); return; }
 if((x=e.target.closest("[data-qxcsv]"))){ TBX.download("ISO10009-competence-matrix-"+today()+".csv","text/csv;charset=utf-8",compCSV()); return; }
});
document.addEventListener("keydown",function(e){ var x=e.target.closest&&e.target.closest("g[data-qxc]"); if(x&&(e.key==="Enter"||e.key===" ")){ e.preventDefault(); QS.v="cl"; QS.c=x.getAttribute("data-qxc"); QS.q=""; go("explain-cl"); } });
document.addEventListener("input",function(e){ if(e.target&&e.target.id==="qxQ"){ QS.q=e.target.value; qxRender(true); } });
document.addEventListener("change",function(e){ var id=e.target&&e.target.id; if(id==="qxHl"){ QS.hl=e.target.value; qxRender(); } else if(id==="qxFcap"||id==="qxFteam"||id==="qxFeff"||id==="qxFlv"){ QS[id.slice(2).toLowerCase()]=e.target.value; qxRender(); } });
window.addEventListener("storage",function(e){ if(e.key===PKEY&&curTab==="explain-cl") qxRender(); });
/* report appendix (only when the box is ticked; without it the report is unchanged) */
function reportAppendix(){
 return '<h2>'+esc(qx("apxT"))+'</h2><p class="meta">'+esc(qx("xNote"))+'</p>'+ORD.map(function(T0){ return '<h3><code>'+esc(T0.c)+'</code> '+esc(nm(T0.n))+'</h3><p>'+esc(nm(T0.d))+'</p><p class="meta">'+esc(attrWords(T0))+' · '+esc(pdcaTxt(T0))+'</p><p><b>'+esc(qx("xSteps"))+':</b> '+esc(T0.st.map(function(x,i){ return (i+1)+". "+nm(x); }).join(" "))+'</p><p><b>'+esc(qx("xAud"))+':</b> '+esc(T0.aud.map(nm).join(SEP()))+'</p>'; }).join("")+
  '<h2>'+esc(qx("apxC"))+'</h2><table><thead><tr><th>#</th><th>'+esc(qx("hTool"))+'</th><th>'+esc(qx("hCap"))+'</th><th>'+esc(qx("hTeam"))+'</th><th>'+esc(qx("hEff"))+'</th><th>'+esc(qx("hLv"))+'</th></tr></thead><tbody>'+
  compRows().map(function(T0){ return '<tr><td><code>'+esc(T0.c)+'</code></td><td>'+esc(nm(T0.n))+'</td><td>'+dots(T0.cap)+' '+esc(capW(T0.cap))+'</td><td>'+esc(teamTxt(T0.team))+'</td><td>'+esc(T0.eff?t("eff_"+T0.eff):"—")+'</td><td>'+esc(t("lv_"+T0.lv))+'</td></tr>'; }).join("")+'</tbody></table><p class="meta">'+esc(qx("xCN"))+'</p>';
}
function qxLang(){ var l=document.getElementById("rpAppxL"); if(l) l.textContent=qx("apxL"); qxStd(); if(curTab==="explain-cl") qxRender(); }
