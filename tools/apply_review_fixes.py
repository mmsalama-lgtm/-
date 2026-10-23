"""Re-apply the review fixes to any newer copy of the CIA platform.

1. The "Share your feedback" channel in the hub (index.html).
2. "اسأل ايزو AI" -> "اسأل أيزو AI" in the tools (labels only).

Usage: python3 -I apply_review_fixes.py <platform-dir>
Every hub replacement must match exactly once; if the code around it changed, the script stops before writing anything."""
import sys, os

root = sys.argv[1]
path = os.path.join(root, "index.html")
s = open(path, encoding="utf-8").read()


def rep(old, new, count=1):
    global s
    n = s.count(old)
    if n != count:
        sys.exit(f"expected {count} x {old[:70]!r}, found {n}")
    s = s.replace(old, new)


# ---------- 1. markup: module bar button, CTA band button, about-section button ----------
rep('''    <span class="modName" id="modName"></span>
  </div>''',
    '''    <span class="modName" id="modName"></span>
    <button class="modFb" id="modFb" type="button">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/><path d="m9.5 11.5 1.8 1.8 3.4-3.6"/></svg>
      <span id="modFbLabel"></span>
    </button>
  </div>''')
rep('''<a class="btn" href="#request" data-rq="training" id="ctaTr"></a></div>''',
    '''<a class="btn" href="#request" data-rq="training" id="ctaTr"></a><a class="btn" href="#feedback" data-rq="feedback" id="ctaFb"></a></div>''')
rep('''<a class="btn" href="#request" data-rq="training" id="aRqT"></a>''',
    '''<a class="btn" href="#request" data-rq="training" id="aRqT"></a><a class="btn" href="#feedback" data-rq="feedback" id="aRqF"></a>''')

# ---------- 2. styles ----------
rep('''.modName{''',
    '''.modFb{margin-inline-start:auto;flex:0 0 auto;display:inline-flex;align-items:center;gap:7px;background:var(--gold);border:0;color:#1B2A4A;border-radius:999px;padding:8px 14px;font:inherit;font-weight:700;font-size:13.5px;cursor:pointer}
.modFb:hover{filter:brightness(1.06)}
.modFb svg{display:block}
@media (max-width:560px){.modFb span{display:none}.modFb{padding:8px 10px}}
.modBar .modName{min-width:0}
.modName{''')

# ---------- 3. feedback form definition ----------
rep('''const RQ_FORMS={
 consult:{code:"C", fields:[''',
    '''/* Feedback: one short form, delivered to the same two mailboxes as the requests. */
const FB_TOOLS=[O2("hub","The platform in general","المنصة بشكل عام"),...SYSTEMS.flatMap(sy=>sy.mods.map(m=>O2(m.k,m.name.en,m.name.ar)))];
const RQ_FORMS={
 feedback:{code:"F", fields:[
  {k:"tool",t:"select",req:1,full:1,l:{en:"Which tool is your feedback about?",ar:"عن أي أداة رأيك؟"},opts:FB_TOOLS},
  {k:"rate",t:"select",req:1,l:{en:"Overall rating",ar:"تقييمك العام"},opts:[O2("5","5 — Excellent","5 — ممتازة"),O2("4","4 — Very good","4 — جيدة جداً"),O2("3","3 — Good","3 — جيدة"),O2("2","2 — Needs work","2 — تحتاج إلى تحسين"),O2("1","1 — Poor","1 — ضعيفة")]},
  {k:"rec",t:"select",l:{en:"Would you recommend it to a colleague?",ar:"هل تنصح بها زميلاً؟"},opts:[O2("y","Yes","نعم"),O2("m","Maybe","ربما"),O2("n","No","لا")]},
  {k:"frole",t:"select",l:{en:"Your role",ar:"دورك"},opts:[O2("qhse","Quality / HSE / IMS manager","مدير جودة / سلامة / نظام متكامل"),O2("grc","Compliance, risk or governance","الامتثال أو المخاطر أو الحوكمة"),O2("aud","Auditor","مدقق"),O2("pmo","PMO or strategy team","مكتب المشاريع أو الاستراتيجية"),O2("exc","Excellence team","فريق التميّز"),O2("exec","Executive or board member","قيادة تنفيذية أو عضو مجلس"),O2("cons","Consultant or trainer","استشاري أو مدرب"),O2("stu","Student or trainee","طالب أو متدرب"),O2("ot","Other","أخرى")]},
  {k:"useful",t:"textarea",full:1,l:{en:"What helped you most?",ar:"ما أكثر ما أفادك؟"},ph:{en:"A clause explanation, the self-assessment, the report, a template…",ar:"شرح بند، أو التقييم الذاتي، أو التقرير، أو نموذج…"}},
  {k:"improve",t:"textarea",req:1,full:1,l:{en:"What is missing, or what should we improve?",ar:"ما الذي ينقصها، أو ما الذي نحسّنه؟"},ph:{en:"A standard or tool to add, something unclear, an error you noticed…",ar:"مواصفة أو أداة تريد إضافتها، أو شرح غير واضح، أو خطأ لاحظته…"}},
  {k:"name",t:"text",l:{en:"Name (optional)",ar:"الاسم (اختياري)"},ac:"name"},
  {k:"email",t:"email",l:{en:"Email (optional, if you would like a reply)",ar:"البريد الإلكتروني (اختياري، إن أردت رداً)"},ac:"email"}]},
 consult:{code:"C", fields:[''')

# ---------- 4. texts ----------
rep('''let rqKind="consult", rqData={consult:{},training:{}}, rqLast=null;''',
    '''Object.assign(RQ.en,{titleF:"Share your feedback",subF:"Tell us what helped and what is missing. Every note is read, and it decides what we build next. It takes two minutes.",
  consentF:"I agree that my feedback is sent by email and used to improve the platform.",
  sideTF:"What happens to your feedback",sideF:[["1","Send","Your email app or Gmail opens with your feedback ready; press Send."],["2","Read","مدثر سلامه reads every note personally."],["3","Build","Recurring requests go into the next updates of the platform."]],
  doneTF:"Your feedback is ready",donePF:"Your email app should now be open with your feedback addressed to both mailboxes. Press Send to complete it. If nothing opened, use one of the options below.",
  sentTF:"Thank you for your feedback",sentPF:"Your feedback has reached both mailboxes. Thank you for helping us improve the platform.",
  againF:"New feedback",editF:"Edit feedback",copyF:"Copy feedback text"});
Object.assign(RQ.en.tabs,{feedback:"Share your feedback"}); Object.assign(RQ.en.submit,{feedback:"Send feedback"});
Object.assign(RQ.en.subj,{feedback:"Platform feedback"}); Object.assign(RQ.en.intro,{feedback:"Here is my feedback on the platform:"});
Object.assign(RQ.en.quick,{feedback:"Share your feedback"});
Object.assign(RQ.ar,{titleF:"شاركنا رأيك",subF:"قل لنا ما الذي أفادك وما الذي ينقص المنصة. نقرأ كل ملاحظة، وهي التي تحدد ما نطوره بعد ذلك. لن تستغرق أكثر من دقيقتين.",
  consentF:"أوافق على إرسال رأيي بالبريد الإلكتروني واستخدامه في تطوير المنصة.",
  sideTF:"ماذا يحدث لرأيك",sideF:[["1","الإرسال","يفتح تطبيق البريد أو Gmail ورأيك جاهز؛ اضغط «إرسال»."],["2","القراءة","يقرأ مدثر سلامه كل ملاحظة بنفسه."],["3","التطوير","تدخل الطلبات المتكررة في التحديثات القادمة للمنصة."]],
  doneTF:"رأيك جاهز للإرسال",donePF:"يُفترض أن تطبيق البريد فُتح الآن ورأيك موجّه إلى البريدين. اضغط «إرسال» لإتمامه. إذا لم يُفتح شيء فاستخدم أحد الخيارات أدناه.",
  sentTF:"شكراً على رأيك",sentPF:"وصل رأيك إلى البريدين. شكراً لأنك تساعدنا على تطوير المنصة.",
  againF:"رأي جديد",editF:"تعديل الرأي",copyF:"نسخ نص الرأي"});
Object.assign(RQ.ar.tabs,{feedback:"شاركنا رأيك"}); Object.assign(RQ.ar.submit,{feedback:"إرسال رأيي"});
Object.assign(RQ.ar.subj,{feedback:"رأي في المنصة"}); Object.assign(RQ.ar.intro,{feedback:"هذا رأيي في المنصة:"});
Object.assign(RQ.ar.quick,{feedback:"شاركنا رأيك"});
const ICO_F=`<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/><path d="m9.5 11.5 1.8 1.8 3.4-3.6"/></svg>`;

let rqKind="consult", rqData={consult:{},training:{},feedback:{}}, rqLast=null;''')
rep('''["consult","training"].forEach(k=>Object.assign(rqData[k],c));''',
    '''["consult","training"].forEach(k=>Object.assign(rqData[k],c)); Object.assign(rqData.feedback,{name:c.name,email:c.email});''')

# ---------- 5. form rendering ----------
rep('''  $("qTitle").textContent=u.title; $("qSub").textContent=u.sub;
  $("rqSwitch").innerHTML=["consult","training"].map(k=>`<button type="button" role="tab" aria-selected="${rqKind===k}" data-k="${k}">${k==="consult"?ICO_C:ICO_T}<span>${esc(u.tabs[k])}</span></button>`).join("");''',
    '''  const fb=rqKind==="feedback";
  $("qTitle").textContent=fb?u.titleF:u.title; $("qSub").textContent=fb?u.subF:u.sub;
  $("rqSwitch").innerHTML=["consult","training","feedback"].map(k=>`<button type="button" role="tab" aria-selected="${rqKind===k}" data-k="${k}">${k==="consult"?ICO_C:k==="training"?ICO_T:ICO_F}<span>${esc(u.tabs[k])}</span></button>`).join("");''')
rep('''<input type="checkbox" id="rqConsent" ${d.consent?"checked":""}><span>${esc(u.consent)} <b class="rq-star">*</b>''',
    '''<input type="checkbox" id="rqConsent" ${d.consent?"checked":""}><span>${esc(fb?u.consentF:u.consent)} <b class="rq-star">*</b>''')
rep('''  $("rqSide").innerHTML=`<h3>${esc(u.sideT)}</h3><ol>${u.side.map(''',
    '''  $("rqSide").innerHTML=`<h3>${esc(fb?u.sideTF:u.sideT)}</h3><ol>${(fb?u.sideF:u.side).map(''')

# ---------- 6. compose, submit, done ----------
rep('''  const subject=`[CIA] ${u.subj[rqKind]} — ${d.org||d.name} — ${ref}`;''',
    '''  const who=rqKind==="feedback"?`${rqOptLabel(F.fields[0],d.tool)} · ${d.rate}/5`:(d.org||d.name);
  const subject=`[CIA] ${u.subj[rqKind]} — ${who} — ${ref}`;''')
rep('''  try{ localStorage.setItem("cia-rq-contact",JSON.stringify({name:d.name,org:d.org,email:d.email,phone:d.phone,country:d.country,city:d.city})); }catch(e){}''',
    '''  if(rqKind!=="feedback"){ try{ localStorage.setItem("cia-rq-contact",JSON.stringify({name:d.name,org:d.org,email:d.email,phone:d.phone,country:d.country,city:d.city})); }catch(e){} }''')
rep('''  const u=RQ[L], box=$("rqDone");
  box.innerHTML=`<div class="rq-done-in">''',
    '''  const u0=RQ[L], box=$("rqDone");
  const u=m.kind==="feedback"?{...u0,doneT:u0.doneTF,doneP:u0.donePF,sentT:u0.sentTF,sentP:u0.sentPF,again:u0.againF,edit:u0.editF,copy:u0.copyF}:u0;
  box.innerHTML=`<div class="rq-done-in">''')
rep('''function rqOpen(kind){ rqCollect(); rqKind=kind; rqLast=null;''',
    '''function rqOpen(kind,tool){ rqCollect(); rqKind=RQ_FORMS[kind]?kind:"consult"; rqLast=null;
  if(rqKind==="feedback" && tool && FB_TOOLS.some(o=>o[0]===tool)) rqData.feedback.tool=tool;''')

# ---------- 7. entry points ----------
rep('''  set("cta3",RQ[L].quick.consult); set("aRqC",RQ[L].quick.consult); set("aRqT",RQ[L].quick.training);''',
    '''  set("cta3",RQ[L].quick.consult); set("aRqC",RQ[L].quick.consult); set("aRqT",RQ[L].quick.training); set("aRqF",RQ[L].quick.feedback);
  set("modFbLabel",RQ[L].quick.feedback); $("modFb").title=RQ[L].quick.feedback;''')
rep('''  $("ctaT").textContent = h.ctaT; $("ctaP").textContent = h.ctaP; $("ctaC").textContent = h.ctaC; $("ctaTr").textContent = h.ctaTr;''',
    '''  $("ctaT").textContent = h.ctaT; $("ctaP").textContent = h.ctaP; $("ctaC").textContent = h.ctaC; $("ctaTr").textContent = h.ctaTr; $("ctaFb").textContent = RQ[L].quick.feedback;''')
rep('''$("modBack").onclick = ()=>closeModule();''',
    '''$("modBack").onclick = ()=>closeModule();
$("modFb").onclick = ()=>{ const k=$("modFrame").dataset.k; closeModule(false); rqOpen("feedback",k); };''')
# #feedback and #feedback/<tool> open the feedback form (also usable as a QR or social link)
rep('''  hash = String(hash||"").replace(/^#/,"");
  if(/^m=/.test(hash)) return;''',
    '''  hash = String(hash||"").replace(/^#/,"");
  if(/^m=/.test(hash)) return;
  const fbm = hash.match(/^feedback(?:\\/([\\w-]+))?$/);
  if(fbm){ rqOpen("feedback", fbm[1]); return; }''')
rep('''UI.en.fLinks = [["start","Start here"], ...UI.en.fLinks]; UI.ar.fLinks = [["start","ابدأ هنا"], ...UI.ar.fLinks];''',
    '''UI.en.fLinks = [["start","Start here"], ...UI.en.fLinks, ["feedback","Share your feedback"]]; UI.ar.fLinks = [["start","ابدأ هنا"], ...UI.ar.fLinks, ["feedback","شاركنا رأيك"]];''')

# ---------- 8. FAQ entry ----------
rep('''      ["How do I request consultation or training?","Use Request a service on this page. Your request reaches مدثر سلامه and the Academy mailbox, and you get a reply by your preferred channel."]],''',
    '''      ["How do I request consultation or training?","Use Request a service on this page. Your request reaches مدثر سلامه and the Academy mailbox, and you get a reply by your preferred channel."],
      ["How do I send feedback or suggest a tool?","Use Share your feedback: in the footer, in Request a service, or the gold button at the top of any open tool. Choose the tool, rate it and tell us what is missing. Every note is read and decides what we build next."]],''')
rep('''      ["كيف أطلب استشارة أو تدريباً؟","من قسم «اطلب خدمة» في هذه الصفحة. يصل طلبك إلى مدثر سلامه وإلى بريد الأكاديمية، ويأتيك الرد بالوسيلة التي تفضلها."]],''',
    '''      ["كيف أطلب استشارة أو تدريباً؟","من قسم «اطلب خدمة» في هذه الصفحة. يصل طلبك إلى مدثر سلامه وإلى بريد الأكاديمية، ويأتيك الرد بالوسيلة التي تفضلها."],
      ["كيف أرسل رأيي أو أقترح أداة؟","من «شاركنا رأيك»: في تذييل الصفحة، أو في قسم «اطلب خدمة»، أو من الزر الذهبي أعلى أي أداة مفتوحة. اختر الأداة وقيّمها واكتب ما ينقصها. نقرأ كل ملاحظة، وهي التي تحدد ما نطوره بعد ذلك."]],''')

open(path, "w", encoding="utf-8").write(s)
print("hub patched")

# ---------- 9. assistant label spelling in the tools ----------
mods = os.path.join(root, "modules")
fixed = 0
for name in sorted(os.listdir(mods)):
    if not name.endswith(".html"):
        continue
    p = os.path.join(mods, name)
    t = open(p, encoding="utf-8").read()
    if "ايزو AI" in t:
        fixed += t.count("ايزو AI")
        open(p, "w", encoding="utf-8").write(t.replace("ايزو AI", "أيزو AI"))
print(f"assistant label fixed in {fixed} places")
