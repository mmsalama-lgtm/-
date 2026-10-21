import json,re,sys
B=sys.argv[1];W=sys.argv[2]
s=open(B+'/index.html').read()
def rep(a,b):
    global s
    assert s.count(a)==1,(a[:70],s.count(a)); s=s.replace(a,b)
s=re.sub(r"const CUTS=\[.*?\];","const CUTS="+json.dumps(json.load(open(W+'/removed.json')))+";",s,count=1,flags=re.S)
caps=[[0.87,2.71,'مساء التميّز…'],[2.93,4.88,'كلّنا نعرف الشركة دي:'],[5.21,6.05,'بدأت صغيّرة'],[6.87,8.56,'والحاج هو اللي بيقرّر كل حاجة'],
 [9.75,10.46,'الشركة كبرت…'],[10.75,13.10,'بقى فيها مية موظف وتلات فروع'],[13.73,15.78,'والحاج لسه بيمضي على ورق الكلور!'],
 [16.73,17.68,'النتيجة؟'],[17.82,18.86,'القرارات بتتأخّر'],[19.52,21.05,'ومحدّش عارف مين المسؤول'],[21.62,22.66,'ولو الحاج سافر…'],[23.32,24.15,'الشغل بيقف.'],
 [25.02,26.05,'هنا بنحتاج الحوكمة'],[26.48,27.27,'Governance'],[28.22,28.77,'ببساطة:'],[29.12,29.95,'مين يقرّر؟'],[30.19,30.73,'وإزاي؟'],[31.29,32.20,'ومين يحاسب مين؟'],
 [33.35,35.70,'والمواصفة الدولية ISO 37000'],[35.99,37.17,'بتعرّفها إنها النظام'],[37.59,38.65,'اللي بيوجّه المؤسسة'],[39.01,39.59,'ويراقبها'],[40.18,41.35,'ويخلّيها تتحاسب'],
 [42.19,42.93,'افتكرها كده:'],[43.96,45.11,'الحوكمة مش قيود…'],[45.67,46.65,'الحوكمة وضوح.'],[47.44,48.04,'وإنت؟ في شغلك…'],[48.53,49.46,'القرار واضح مين صاحبه؟'],[50.38,51.42,'اكتبلي في التعليقات']]
i=s.index("const CAPS=[");j=s.index("].map(([a,b,s])=>[T(a),T(b),s]);")
s=s[:i]+"const CAPS="+json.dumps(caps,ensure_ascii=False)[:-1]+s[j:]
rep("t.textContent='EP 02 / 30'","t.textContent='EP 03 / 30'")
rep("const tCloseLogo=62.78;","const tCloseLogo=T(51.42)+0.3;")
rep("/تميّز|التميّز|Excellence/","/الحوكمة|حوكمة|Governance/"); rep("(/جودة|الجودة/","(/ISO|37000/")
# ---- landscape 16:9
rep('viewBox="0 0 1080 1920" width="1080" height="1920"','viewBox="0 0 1920 1080" width="1920" height="1080"')
rep('<rect width="1080" height="1920" fill="url(#bg)"/>','<rect width="1920" height="1080" fill="url(#bg)"/>')
rep("const L_C={x:540,y:800,d:600}, L_K={x:1080-50-70,y:50+70,d:140}, L_E={x:540,y:790,d:440};","const L_C={x:960,y:450,d:560}, L_K={x:1920-50-70,y:50+70,d:140}, L_E={x:960,y:350,d:400};")
rep("{x:540,y:1880,'text-anchor':'middle','font-family':\"'Cairo'\",'font-weight':700,'font-size':30","{x:960,y:1056,'text-anchor':'middle','font-family':\"'Cairo'\",'font-weight':700,'font-size':24")
rep("{x:540,y:1632,'text-anchor':'middle',direction:'rtl','font-family':\"'Cairo'\",'font-weight':800,'font-size':46","{x:960,y:992,'text-anchor':'middle',direction:'rtl','font-family':\"'Cairo'\",'font-weight':800,'font-size':42")
rep("const OFF={x:1250,y:2250};","const OFF={x:2200,y:1500};")
rep("translate(${p*1150},0)","translate(${p*2000},0)")
rep("rotate(${-30+wob}) scale(0.8)","rotate(${-30+wob}) scale(0.7)")
i=s.index("function build(){");j=s.index("// =====================================================================================\nlet READY")
s=s[:i]+open(B+'/ep03_build.js').read()+"\n"+s[j:]
open(B+'/ep03.html','w').write(s);print('ok')
