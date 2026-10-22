import json,re,sys
B=sys.argv[1];W=sys.argv[2];TOT=sys.argv[3]
s=open(B+'/index.html').read()
def rep(a,b):
    global s
    assert s.count(a)==1,(a[:70],s.count(a)); s=s.replace(a,b)
s=re.sub(r"const CUTS=\[.*?\];","const CUTS="+json.dumps(json.load(open(W+'/removed.json')))+";",s,count=1,flags=re.S)
caps=[[0.61,1.94,'مساء التميّز…'],[2.76,5.52,'اثبتلي إنك تقدر تركب ميكروباص…'],[6.27,7.61,'من غير ما تعرف هو رايح فين!'],
 [9.48,10.34,'مستحيل، صح؟'],[11.40,14.97,'طب ليه شركات كتير ماشية من غير ما تعرف هي رايحة فين؟'],[15.78,17.63,'خلّينا نفهمها بالميكروباص:'],
 [18.55,19.65,'الرؤية، Vision:'],[20.27,21.06,'الوجهة…'],[21.80,22.78,'«رايحين إسكندرية»'],
 [23.57,25.28,'الرسالة، Mission:'],[26.14,27.91,'إحنا مين، وبنخدم مين…'],[28.70,31.28,'«بننقل الركّاب بأمان، وبسعر معقول»'],
 [32.45,33.71,'الأهداف، Objectives:'],[34.18,35.41,'المحطات والمواعيد…'],[36.04,37.45,'«نوصل طنطا الساعة عشرة'],[38.16,40.00,'وإسكندرية الساعة اتناشر»'],
 [41.45,42.74,'ونموذج EFQM'],[43.41,44.12,'بيبدأ من هنا:'],[44.87,47.01,'الغاية، والرؤية، والاستراتيجية'],
 [48.06,48.85,'افتكرها كده:'],[49.49,50.20,'من غير رؤية…'],[51.43,53.13,'أي طريق هيوصّلك لمكان مش عايزه'],
 [54.53,56.17,'وإنت؟ تقدر تقول رؤية شغلك'],[56.60,57.22,'في جملة واحدة؟'],[58.03,59.09,'اكتبها في التعليقات'],[59.94,60.92,'نتقابل بكرة…'],[61.75,62.48,'في مساء التميّز']]
i=s.index("const CAPS=[");j=s.index("].map(([a,b,s])=>[T(a),T(b),s]);")
s=s[:i]+"const CAPS="+json.dumps(caps,ensure_ascii=False)[:-1]+s[j:]
rep("t.textContent='EP 02 / 30'","t.textContent='EP 04 / 30'")
rep("const tCloseLogo=62.78;","const tCloseLogo=T(59.94)-0.35;")
rep("const FPS=30, DURATION=68.5;","const FPS=30, DURATION="+TOT+";")
# karaoke captions: spoken words white, current word gold, upcoming words dimmed
rep("""  for(const w of s.split(' ')){const sp=mk('tspan',{fill:/تميّز|التميّز|Excellence/.test(w)?GOLD:(/جودة|الجودة/.test(w)?'#9FC3F0':'#fff')},t);sp.textContent=w+' '}
  const next=CAPS[i+1]?CAPS[i+1][0]:1e9;const end=Math.min(b+0.45,next-0.02);
  return {g,rect,t,a:a-0.08,end}});""","""  const ws=s.split(' '),tot=ws.reduce((n,w)=>n+w.length+1,0);let acc=0;const sps=[];
  for(const w of ws){const sp=mk('tspan',{fill:'#fff'},t);sp.textContent=w+' ';const f0=acc/tot;acc+=w.length+1;sps.push([sp,f0,acc/tot])}
  const next=CAPS[i+1]?CAPS[i+1][0]:1e9;const end=Math.min(b+0.45,next-0.02);
  return {g,rect,t,a:a-0.08,end,sa:a,sb:b,sps}});""")
rep("c.g.setAttribute('transform',`translate(0,${(1-easeOut(p))*14})`)}}","""c.g.setAttribute('transform',`translate(0,${(1-easeOut(p))*14})`);
  const k=clamp((t-c.sa)/Math.max(0.2,c.sb-c.sa));for(const [sp,f0,f1] of c.sps){if(k>=f1){sp.setAttribute('fill','#fff');sp.setAttribute('fill-opacity',1)}else if(k>=f0){sp.setAttribute('fill',GOLD);sp.setAttribute('fill-opacity',1)}else{sp.setAttribute('fill','#fff');sp.setAttribute('fill-opacity',0.5)}}}}""")
# progress bar + dotted paper
rep("t.textContent='EP 04 / 30'}","t.textContent='EP 04 / 30'}\nconst PBt=mk('rect',{x:0,y:1074,width:1920,height:6,fill:NAVY,'fill-opacity':0.08},document.getElementById('ui'));const PB=mk('rect',{x:1920,y:1074,width:0,height:6,fill:GOLD},document.getElementById('ui'));")
rep("  logoAt(t);capsAt(t);","  logoAt(t);capsAt(t);{const w=1920*clamp(t/DURATION);PB.setAttribute('width',w);PB.setAttribute('x',1920-w)}")
rep('<rect width="1080" height="1920" fill="url(#bg)"/>','<rect width="1920" height="1080" fill="url(#bg)"/><rect width="1920" height="1080" fill="url(#dots)"/>')
rep('</defs>','<pattern id="dots" width="36" height="36" patternUnits="userSpaceOnUse"><circle cx="18" cy="18" r="1.7" fill="#1F3A5F" fill-opacity="0.09"/></pattern>\n</defs>')
# ---- landscape 16:9
rep('viewBox="0 0 1080 1920" width="1080" height="1920"','viewBox="0 0 1920 1080" width="1920" height="1080"')
rep("const L_C={x:540,y:800,d:600}, L_K={x:1080-50-70,y:50+70,d:140}, L_E={x:540,y:790,d:440};","const L_C={x:960,y:500,d:540}, L_K={x:1920-50-70,y:50+70,d:140}, L_E={x:960,y:350,d:400};")
rep("{x:540,y:1880,'text-anchor':'middle','font-family':\"'Cairo'\",'font-weight':700,'font-size':30","{x:960,y:1056,'text-anchor':'middle','font-family':\"'Cairo'\",'font-weight':700,'font-size':24")
rep("{x:540,y:1632,'text-anchor':'middle',direction:'rtl','font-family':\"'Cairo'\",'font-weight':800,'font-size':46","{x:960,y:992,'text-anchor':'middle',direction:'rtl','font-family':\"'Cairo'\",'font-weight':800,'font-size':42")
rep("const OFF={x:1250,y:2250};","const OFF={x:2200,y:1500};")
rep("translate(${p*1150},0)","translate(${p*2000},0)")
rep("rotate(${-30+wob}) scale(0.8)","rotate(${-30+wob}) scale(0.7)")
i=s.index("function build(){");j=s.index("// =====================================================================================\nlet READY")
s=s[:i]+open(B+'/ep04_build.js').read()+"\n"+s[j:]
open(B+'/ep04.html','w').write(s);print('ok')
