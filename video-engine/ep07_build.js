function build(){
const AR=n=>String(n).replace(/\d/g,x=>'٠١٢٣٤٥٦٧٨٩'[x]);
function gearPts(cx,cy,r,n){const p=[],ro=r,ri=r*0.82;for(let i=0;i<n;i++){const a=2*Math.PI*i/n,w=Math.PI/n;
  p.push([cx+ri*Math.cos(a-w*0.95),cy+ri*Math.sin(a-w*0.95)],[cx+ro*Math.cos(a-w*0.5),cy+ro*Math.sin(a-w*0.5)],[cx+ro*Math.cos(a+w*0.5),cy+ro*Math.sin(a+w*0.5)],[cx+ri*Math.cos(a+w*0.95),cy+ri*Math.sin(a+w*0.95)])}return p}
// gear that spins from tStart with direction dir; optional stop time
function gear(g,cx,cy,r,n,t0,dur,o={}){const G=mk('g',{},g);
  rp(G,gen.polygon(gearPts(cx,cy,r,n),ro({fill:o.fill||GOLD,fillStyle:'solid',strokeWidth:5,roughness:0.6})),t0,dur,o.noHand?{noHand:true}:{});
  R.circle(G,cx,cy,r*0.9,t0+dur*0.7,dur*0.3,{fill:'#fff',fillStyle:'solid',strokeWidth:4,roughness:0.5,noHand:true});
  const ts=t0+dur,sp=(o.dir||1)*70*(160/r),stop=o.stop||1e9;
  updaters.push(t=>{let a=0;if(t>ts){const tt=Math.min(t,stop)-ts;a=sp*Math.max(0,tt)}G.setAttribute('transform',`rotate(${a} ${cx} ${cy})`)});return G}
// ---------- S0: hook-first intro
{const g=scene(-1,2.3,'fade');
 wtext(g,'التميّز… نظام ولا بطل؟',960,150,{size:84,t0:0.02,dur:0.6,noHand:true});
 R.circle(g,L_C.x,L_C.y,600,0.0,0.6,{stroke:GOLD,strokeWidth:9,roughness:0.9});
 wtext(g,'نموذج EFQM في دقيقة',960,890,{size:90,t0:1.38,dur:0.8});
}
// ---------- S1: the myth — the one-man department
const s1end=T(13.09)+0.3;
{const g=scene(2.4,s1end);
 wtext(g,'كلّنا شفنا الموظف ده…',960,190,{size:80,t0:T(3.29)-0.05,dur:1.1});
 R.line(g,420,740,1500,740,T(3.29)+1.0,0.2,{strokeWidth:6});
 popFigure(g,620,740,200,T(4.99)-0.2,{arms:'hips'});popFigure(g,1300,740,200,T(4.99)-0.1,{arms:'hips'});
 const hero=mk('g',{},g);const hf=figure(hero,960,740,260,{arms:'up'});pop(hero,T(4.99)-0.15,0.35);
 const files=[];for(let i=0;i<7;i++){const fg=mk('g',{},g);mk('rect',{x:890+(i%2)*14-7,y:470-i*30,width:140,height:26,rx:4,fill:['#fff','#F7E2B8','#fff','#E9F1FB','#fff','#F7E2B8','#fff'][i],stroke:NAVY,'stroke-width':3.5},fg);files.push(fg);pop(fg,T(4.99)+0.1+i*0.12,0.25)}
 const tv=T(7.66);fadeOut(hero,tv+0.2,0.35);
 const sign=mk('g',{},g);mk('line',{x1:960,y1:740,x2:960,y2:610,stroke:NAVY,'stroke-width':6},sign);mk('rect',{x:870,y:560,width:180,height:66,rx:8,fill:GOLD,stroke:NAVY,'stroke-width':4},sign);
 const st=mk('text',{x:960,y:606,'text-anchor':'middle','font-family':"'Cairo'",'font-weight':800,'font-size':36,fill:NAVY},sign);st.textContent='إجازة';pop(sign,tv+0.45,0.35);
 const tf=T(9.19);
 files.forEach((f,i)=>updaters.push(t=>{if(t<tf+i*0.06)return;const p=clamp((t-tf-i*0.06)/0.55);const dx=(i%2?1:-1)*(60+i*25)*p;const dy=(720-(483-i*30))*p*p;
   f.setAttribute('transform',`translate(${dx},${dy}) rotate(${(i%2?1:-1)*p*(30+i*9)} ${960+dx} ${483-i*30})`)}));
 events.push([tf,tf+0.6,'whoosh']);
 wtext(g,'ده مش تميّز…',760,880,{size:76,t0:T(10.86)-0.05,dur:0.6});
 const stp=mk('g',{},g);const sr=mk('g',{transform:'rotate(-6 1280 860)'},stp);mk('rect',{x:1080,y:810,width:400,height:96,rx:12,fill:'#fff','fill-opacity':0.9,stroke:RED,'stroke-width':7},sr);
 const sx=mk('text',{x:1280,y:875,'text-anchor':'middle','font-family':"'Cairo'",'font-weight':800,'font-size':50,fill:RED},sr);sx.textContent='مجهود فردي ✗';pop(stp,T(12.32)-0.05,0.3);events.push([T(12.32),T(12.32)+0.3,'stamp']);
}
// ---------- S2: EFQM = three gears
const s2start=s1end+0.4, s2end=T(39.41)+0.35;
{const g=scene(s2start,s2end);
 wtext(g,'نموذج EFQM',960,175,{size:90,t0:Math.max(s2start+0.05,T(14.01)-0.05),dur:0.8});
 wtext(g,'التميّز = نظام',960,262,{size:62,color:'#C98F00',t0:T(16.48)-0.05,dur:0.7});
 const cy=530,G=[[1460,150,14,1,T(20.22)],[1150,135,12,-1,T(26.78)],[840,150,14,1,T(34.06)]];
 G.forEach(([x,r,nT,dir,t0])=>gear(g,x,cy,r,nT,t0-0.1,0.55,{dir,fill:x===1150?'#9FC3F0':(x===840?'#F7C9C9':GOLD)}));
 // hub icons (static)
 const h1=mk('g',{},g);mk('path',{d:'M1460 470 L1478 530 L1460 590 L1442 530 Z',fill:GOLD,stroke:NAVY,'stroke-width':4},h1);mk('circle',{cx:1460,cy:530,r:7,fill:NAVY},h1);pop(h1,T(20.22)+0.55,0.3);
 const h2=mk('g',{},g);[[1120,520],[1150,505],[1180,520]].forEach(([x,y])=>{mk('circle',{cx:x,cy:y,r:11,fill:NAVY},h2);mk('path',{d:`M${x-17} ${y+40} Q${x} ${y+10} ${x+17} ${y+40}`,fill:NAVY},h2)});pop(h2,T(26.78)+0.55,0.3);
 const h3=mk('g',{},g);[[805,560,30],[830,540,50],[855,515,75]].forEach(([x,y,hh])=>mk('rect',{x,y:575-hh,width:20,height:hh,fill:'#C98F00',stroke:NAVY,'stroke-width':3},h3));pop(h3,T(34.06)+0.55,0.3);
 const lab=[[1460,'التوجّه','Direction','ليه؟ ورايحين فين؟',T(21.68),T(22.43),T(23.51)],[1150,'التنفيذ','Execution','إزاي؟ ناس • عمليات',T(27.75),T(28.6),T(30.1)],[840,'النتائج','Results','وصلنا لإيه؟ بأرقام',T(34.63),T(35.6),T(36.73)]];
 lab.forEach(([x,ar,en,q,ta,te,tq])=>{wtext(g,ar,x,768,{size:66,t0:ta-0.05,dur:0.4});wtext(g,en,x,818,{font:'caveat',size:42,ltr:true,opacity:0.85,t0:te,dur:0.35,noHand:true});
   wtext(g,q,x,872,{font:'cairo',size:30,t0:tq,dur:0.9,noHand:true})});
 wtext(g,'وأصحاب المصلحة',1150,912,{font:'cairo',size:30,t0:T(31.48)+0.6,dur:0.6,noHand:true});
}
// ---------- S3: the example — a citizen service centre
const s3start=s2end+0.4, s3end=T(47.90)+0.35;
{const g=scene(s3start,s3end);
 wtext(g,'مركز خدمة مواطنين',960,190,{size:84,t0:Math.max(s3start+0.05,T(40.35)-0.05),dur:1.0});
 const a=T(42.43);
 R.circle(g,1400,480,170,a-0.1,0.3,{fill:'#fff',fillStyle:'solid',strokeWidth:6});R.line(g,1400,480,1400,420,a+0.2,0.06,{strokeWidth:6});R.line(g,1400,480,1440,500,a+0.26,0.06,{stroke:RED,strokeWidth:6});
 wtext(g,'١٥ دقيقة',1400,640,{font:'cairo',weight:800,size:48,color:'#C98F00',t0:a+0.4,dur:0.5});wtext(g,'الهدف',1400,710,{size:56,t0:a+0.95,dur:0.4});
 const b=T(45.12);
 R.rect(g,880,400,160,110,b-0.1,0.25,{fill:'rgba(159,195,240,0.3)',fillStyle:'solid',strokeWidth:5});R.path(g,'M850 510 H1070 L1090 545 H830 Z',b+0.15,0.15,{fill:'#fff',fillStyle:'solid',strokeWidth:5});
 wtext(g,'ميكنة + تدريب',960,640,{size:56,t0:b+0.45,dur:0.6});
 const c=T(46.5);
 R.lines(g,[[400,400],[400,560],[620,560]],c-0.1,0.2,{strokeWidth:5});[[430,60],[480,95],[530,130],[580,160]].forEach(([x,h],i)=>R.rect(g,x,560-h,34,h,c+0.1+i*0.1,0.1,{fill:GOLD,fillStyle:'hachure',hachureGap:7,fillWeight:3,strokeWidth:4}));
 wtext(g,'قياس كل شهر',510,640,{size:56,t0:c+0.6,dur:0.6});
 [[1400,'التوجّه'],[960,'التنفيذ'],[510,'النتائج']].forEach(([x,l],i)=>{const t=mk('text',{x,y:780,'text-anchor':'middle','font-family':"'Cairo'",'font-weight':700,'font-size':30,fill:NAVY,opacity:0.7},g);t.textContent='⚙ '+l;fade(t,[a+1.2,b+0.9,c+1.0][i],0.3,0.7)});
}
// ---------- S4: one gear stops, the machine stops
const s4start=s3end+0.4, s4end=T(52.12)+0.35;
{const g=scene(s4start,s4end);
 const ts=T(49.41)+0.25;
 [[1290,110,12,1],[1065,100,11,-1],[845,110,12,1]].forEach(([x,r,nT,dir],i)=>gear(g,x,420,r,nT,s4start+0.05+i*0.12,0.25,{dir,stop:ts,noHand:true,fill:[GOLD,'#9FC3F0','#F7C9C9'][i]}));
 R.line(g,1015,370,1115,470,ts,0.12,{stroke:RED,strokeWidth:12});R.line(g,1115,370,1015,470,ts+0.13,0.12,{stroke:RED,strokeWidth:12});
 wtext(g,'ترس واحد يقف…',960,700,{size:84,t0:T(49.41)+0.05,dur:0.6});
 wtext(g,'الماكينة كلها تقف',960,830,{size:84,color:RED,t0:T(50.69)-0.05,dur:0.8});
}
// ---------- S5: the key line
const s5start=s4end+0.4, s5end=T(56.22)+0.4;
{const g=scene(s5start,s5end);
 wtext(g,'افتكرها كده',960,250,{size:70,color:BURG,t0:Math.max(s5start+0.05,T(52.70)-0.05),dur:0.5});
 wtext(g,'التميّز نظام…',960,480,{size:130,t0:T(54.36)-0.08,dur:0.7});
 wtext(g,'مش مجهود فردي.',960,710,{size:130,color:GOLD,stroke:NAVY,sw:3.5,t0:T(54.36)+0.85,dur:0.75});
 R.path(g,'M680 755 Q820 738 960 752 T 1240 746',T(54.36)+1.6,0.25,{stroke:BURG,strokeWidth:7});
 sparkle(g,1310,600,0.65,T(54.36)+1.75);
}
// ---------- S6: the question
const tCL=tCloseLogo;
{const g=scene(s5end+0.4,tCL-0.05,'fade');
 wtext(g,'وإنت؟',960,270,{size:140,t0:T(57.34)-0.12,dur:0.5});
 wtext(g,'أنهي ترس عندكم محتاج زيت؟',960,470,{size:86,color:GOLD,stroke:NAVY,sw:3,t0:T(57.34)+0.6,dur:1.2});
 [[1060,640,70,10,GOLD],[960,640,60,9,'#9FC3F0'],[870,640,70,10,'#F7C9C9']].forEach(([x,y,r,nT,f],i)=>gear(g,x+(i===1?0:0),y,r,nT,T(57.34)+1.6+i*0.1,0.2,{dir:i===1?-1:1,noHand:true,fill:f}));
 const can=mk('g',{},g);mk('path',{d:'M1200 610 h70 v60 h-70 z M1230 610 l40 -40 l8 8 l-36 36',fill:GOLD,stroke:NAVY,'stroke-width':4,'stroke-linejoin':'round'},can);mk('circle',{cx:1282,cy:582,r:6,fill:NAVY},can);pop(can,T(57.34)+2.1,0.35);
 wtext(g,'اكتبلي في التعليقات',960,830,{font:'cairo',size:48,t0:T(57.34)+2.4,dur:0.7});
}
// ---------- S7: closing
{const g=scene(tCL,1e9);
 R.circle(g,L_E.x,L_E.y,460,tCL+0.05,0.55,{stroke:GOLD,strokeWidth:8,roughness:0.9});
 const a=T(61.82)+0.25;
 wtext(g,'',960,720,{size:66,t0:a,dur:1.15,spans:[['بكرة: ',GOLD],['مجلس الإدارة ولا الإدارة التنفيذية؟',NAVY]]});
 wtext(g,'مين يوجّه… ومين ينفّذ؟',960,790,{font:'cairo',size:40,t0:a+1.2,dur:0.55});
 R.line(g,760,832,920,832,a+1.8,0.1,{stroke:BURG,strokeWidth:4});R.line(g,1000,832,1160,832,a+1.9,0.1,{stroke:BURG,strokeWidth:4});
 const dia=mk('path',{d:'M960 820 L972 832 L960 844 L948 832Z',fill:GOLD},g);pop(dia,a+1.9,0.25);
 wtext(g,'تابعني على لينكدإن  ·  Modather Salama',960,905,{font:'cairo',size:40,t0:a+2.05,dur:0.95});
}
}
