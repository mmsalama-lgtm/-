import json,re,sys
B=sys.argv[1];W=sys.argv[2];TOT=sys.argv[3]
s=open(B+'/index.html').read()
def rep(a,b):
    global s
    assert s.count(a)==1,(a[:70],s.count(a)); s=s.replace(a,b)
s=re.sub(r"const CUTS=\[.*?\];","const CUTS="+json.dumps(json.load(open(W+'/removed.json')))+";",s,count=1,flags=re.S)
cfg=json.load(open(sys.argv[4]));caps=cfg['caps']
i=s.index("const CAPS=[");j=s.index("].map(([a,b,s])=>[T(a),T(b),s]);")
s=s[:i]+"const CAPS="+json.dumps(caps,ensure_ascii=False)[:-1]+s[j:]
rep("t.textContent='EP 02 / 30'","t.textContent='EP %s / 30'"%cfg['ep'])
rep("const tCloseLogo=62.78;","const tCloseLogo="+cfg['tcl']+";")
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
rep("t.textContent='EP %s / 30'}"%cfg['ep'],"t.textContent='EP %s / 30'}"%cfg['ep']+"\nconst PBt=mk('rect',{x:0,y:1074,width:1920,height:6,fill:NAVY,'fill-opacity':0.08},document.getElementById('ui'));const PB=mk('rect',{x:1920,y:1074,width:0,height:6,fill:GOLD},document.getElementById('ui'));")
rep("  logoAt(t);capsAt(t);","  logoAt(t);capsAt(t);{const w=1920*clamp(t/DURATION);PB.setAttribute('width',w);PB.setAttribute('x',1920-w)}")
rep('<rect width="1080" height="1920" fill="url(#bg)"/>','<rect width="1920" height="1080" fill="url(#bg)"/><rect width="1920" height="1080" fill="url(#dots)"/>')
rep('</defs>','<pattern id="dots" width="36" height="36" patternUnits="userSpaceOnUse"><circle cx="18" cy="18" r="1.7" fill="#1F3A5F" fill-opacity="0.09"/></pattern>\n</defs>')
rep('href="logo.png"','href="logo2.png"')
# ---- landscape 16:9
rep('viewBox="0 0 1080 1920" width="1080" height="1920"','viewBox="0 0 1920 1080" width="1920" height="1080"')
rep("const L_C={x:540,y:800,d:600}, L_K={x:1080-50-70,y:50+70,d:140}, L_E={x:540,y:790,d:440};","const L_C={x:960,y:500,d:540}, L_K={x:1920-50-70,y:50+70,d:140}, L_E={x:960,y:350,d:400};")
rep("{x:540,y:1880,'text-anchor':'middle','font-family':\"'Cairo'\",'font-weight':700,'font-size':30","{x:960,y:1056,'text-anchor':'middle','font-family':\"'Cairo'\",'font-weight':700,'font-size':24")
rep("{x:540,y:1632,'text-anchor':'middle',direction:'rtl','font-family':\"'Cairo'\",'font-weight':800,'font-size':46","{x:960,y:992,'text-anchor':'middle',direction:'rtl','font-family':\"'Cairo'\",'font-weight':800,'font-size':42")
rep("const OFF={x:1250,y:2250};","const OFF={x:2200,y:1500};")
rep("translate(${p*1150},0)","translate(${p*2000},0)")
rep("rotate(${-30+wob}) scale(0.8)","rotate(${-30+wob}) scale(0.7)")
i=s.index("function build(){");j=s.index("// =====================================================================================\nlet READY")
s=s[:i]+open(B+'/ep%s_build.js'%cfg['ep']).read()+"\n"+s[j:]
open(B+'/ep%s.html'%cfg['ep'],'w').write(s);print('ok')
