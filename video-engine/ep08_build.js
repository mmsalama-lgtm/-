function build(){
function pitch(g,x,y,w,h,t0,dur,o={}){const q=a=>Object.assign({noHand:!!o.noHand},a);
  R.rect(g,x,y,w,h,t0,dur*0.35,q({fill:'rgba(46,125,50,0.08)',fillStyle:'solid',strokeWidth:5,roughness:0.6}));
  R.line(g,x+w/2,y,x+w/2,y+h,t0+dur*0.35,dur*0.15,q({strokeWidth:4}));R.circle(g,x+w/2,y+h/2,h*0.36,t0+dur*0.5,dur*0.2,q({strokeWidth:4}));
  R.rect(g,x,y+h*0.28,w*0.1,h*0.44,t0+dur*0.7,dur*0.15,q({strokeWidth:4}));R.rect(g,x+w*0.9,y+h*0.28,w*0.1,h*0.44,t0+dur*0.85,dur*0.15,q({strokeWidth:4}))}
function boss(g,x,y,h,t0,o={}){const W=mk('g',{},g);const f=figure(W,x,y,h,{arms:o.arms||'down'});
  mk('rect',{x:-30,y:-128,width:60,height:62,rx:6,fill:NAVY,opacity:0.85},f.G);mk('path',{d:'M-6 -142 L6 -142 L4 -132 L9 -100 L0 -90 L-9 -100 L-4 -132 Z',fill:GOLD},f.G);
  if(o.tag){const tg=mk('g',{},W);mk('rect',{x:x-80,y:y-h*1.2-44,width:160,height:40,rx:8,fill:GOLD,stroke:NAVY,'stroke-width':3},tg);const t=mk('text',{x,y:y-h*1.2-15,'text-anchor':'middle','font-family':"'Cairo'",'font-weight':800,'font-size':24,fill:NAVY},tg);t.textContent=o.tag}
  pop(W,t0,0.38);return W}
function compass(g,x,y,s,t0){const G=mk('g',{},g);mk('circle',{cx:x,cy:y,r:46*s,fill:'#fff',stroke:NAVY,'stroke-width':4},G);mk('path',{d:`M${x} ${y-36*s} L${x+11*s} ${y} L${x} ${y+36*s} L${x-11*s} ${y} Z`,fill:GOLD,stroke:NAVY,'stroke-width':3},G);pop(G,t0,0.35);return G}
function eye(g,x,y,s,t0){const G=mk('g',{},g);mk('path',{d:`M${x-60*s} ${y} Q${x} ${y-42*s} ${x+60*s} ${y} Q${x} ${y+42*s} ${x-60*s} ${y} Z`,fill:'#fff',stroke:NAVY,'stroke-width':4},G);mk('circle',{cx:x,cy:y,r:20*s,fill:GOLD,stroke:NAVY,'stroke-width':3},G);mk('circle',{cx:x,cy:y,r:7*s,fill:NAVY},G);pop(G,t0,0.35);return G}
// ---------- S0: hook-first intro
{const g=scene(-1,2.3,'fade');
 wtext(g,'رئيس النادي… بيلعب بدل الكابتن؟!',960,150,{size:78,t0:0.02,dur:0.6,noHand:true});
 R.circle(g,L_C.x,L_C.y,600,0.0,0.6,{stroke:GOLD,strokeWidth:9,roughness:0.9});
 wtext(g,'مجلس الإدارة ولا الإدارة التنفيذية؟',960,890,{size:74,t0:1.38,dur:0.85});
}
// ---------- S1: the club president on the pitch
const s1end=T(10.57)+0.3;
{const g=scene(2.4,s1end);
 pitch(g,360,330,1200,520,T(2.19)+0.2,1.1);
 [[640,560],[820,700],[1100,480],[1300,680]].forEach(([x,y],i)=>popFigure(g,x,y,140,T(3.96)-0.2+i*0.1,{arms:'down',tie:'#2E7D32'}));
 const ball=mk('circle',{cx:1000,cy:640,r:16,fill:'#fff',stroke:NAVY,'stroke-width':4},g);pop(ball,T(3.96)+0.3,0.3);
 const run=mk('g',{},g);boss(run,0,0,170,T(5.24)-0.15,{arms:'up',tag:'رئيس النادي'});
 updaters.push(t=>{const p=ease(clamp((t-(T(5.24)+0.1))/1.6));run.setAttribute('transform',`translate(${1450-420*p},${760-30*Math.sin(p*Math.PI*4)*(1-p)})`)});
 wtext(g,'شكلها غريب، صح؟',960,200,{size:80,color:RED,t0:T(7.07)-0.05,dur:0.7});
 const qm=mk('text',{x:1120,y:560,'text-anchor':'middle','font-family':"'Cairo'",'font-weight':800,'font-size':80,fill:RED},g);qm.textContent='؟!';pop(qm,T(7.07)+0.1,0.3);
 wtext(g,'…بس بيحصل في شركات كتير',960,285,{size:52,t0:T(9.11)-0.05,dur:0.9});
}
// ---------- S2: stands vs pitch
const s2start=s1end+0.4, s2end=T(31.11)+0.35;
{const g=scene(s2start,s2end);
 wtext(g,'خلّينا نفصل',960,165,{size:76,t0:Math.max(s2start+0.05,T(11.83)-0.05),dur:0.55});
 const a=T(13.79);
 [[140,500,700],[180,440,660],[220,380,620],[260,320,580]].forEach(([x1,y,x2],i)=>R.line(g,x1,y,x2,y,a-0.1+i*0.08,0.08,{strokeWidth:5}));
 [[330,320],[430,320],[530,320]].forEach(([x,y],i)=>boss(g,x,y,95,a+0.25+i*0.1));
 wtext(g,'مجلس الإدارة',1520,340,{size:66,t0:a+0.05,dur:0.5});
 wtext(g,'Board of Directors',1520,392,{font:'caveat',size:40,ltr:true,opacity:0.85,t0:T(15.09),dur:0.5,noHand:true});
 wtext(g,'زي إدارة النادي',1520,440,{font:'cairo',size:30,t0:T(16.69),dur:0.5,noHand:true});
 compass(g,860,380,1,T(18.09)-0.05);wtext(g,'يوجّه',860,480,{size:56,color:'#C98F00',t0:T(18.09)+0.05,dur:0.35});
 wtext(g,'الاستراتيجية والأهداف',860,520,{font:'cairo',size:24,t0:T(18.96),dur:0.8,noHand:true});
 eye(g,1120,380,1,T(22.11)-0.05);wtext(g,'يراقب',1120,480,{size:56,color:'#C98F00',t0:T(22.11)+0.05,dur:0.35});
 wtext(g,'يحاسب على النتايج',1120,520,{font:'cairo',size:24,t0:T(23.15),dur:0.7,noHand:true});
 dashed(g,'M120 548 L1800 548',T(24.4),0.4,{color:NAVY,sw:3,dash:'10 10'});
 const b=T(25.01);
 pitch(g,140,580,1100,270,b-0.15,0.8);
 wtext(g,'الإدارة التنفيذية',1520,660,{size:66,t0:b+0.3,dur:0.6});
 wtext(g,'Management',1520,712,{font:'caveat',size:40,ltr:true,opacity:0.85,t0:T(26.29),dur:0.4,noHand:true});
 const c=T(27.63);
 const coach=mk('g',{},g);const cf=figure(coach,330,840,150,{arms:'point'});mk('rect',{x:40,y:-160,width:36,height:48,rx:4,fill:'#fff',stroke:NAVY,'stroke-width':4},cf.G);pop(coach,c-0.1,0.35);
 [[620,800],[820,740],[1000,820]].forEach(([x,y],i)=>popFigure(g,x,y,120,c+0.2+i*0.1,{arms:'down',tie:'#2E7D32'}));
 wtext(g,'ينفّذوا… كل يوم',1520,780,{size:56,color:'#C98F00',t0:T(29.37)-0.05,dur:0.7});
}
// ---------- S3: OECD
const s3start=s2end+0.4, s3end=T(40.35)+0.35;
{const g=scene(s3start,s3end);
 const a=T(32.44);
 R.rect(g,460,170,1000,190,a-0.1,0.4,{fill:'#fff',fillStyle:'solid',strokeWidth:5,roughness:0.8});
 wtext(g,'OECD',960,260,{font:'cairo',weight:800,size:76,ltr:true,t0:a+0.35,dur:0.4});
 wtext(g,'مبادئ G20/OECD لحوكمة الشركات (2023)',960,320,{font:'cairo',size:34,t0:T(34.21)-0.05,dur:1.0});
 wtext(g,'دور المجلس:',960,450,{size:62,t0:T(36.4)-0.1,dur:0.5});
 compass(g,1270,620,1.5,T(36.4)+0.4);wtext(g,'التوجيه الاستراتيجي',1270,770,{size:62,color:'#C98F00',t0:T(36.4)+0.7,dur:0.8});
 eye(g,650,620,1.5,T(38.79)-0.05);wtext(g,'الرقابة الفعّالة',650,770,{size:62,color:'#C98F00',t0:T(38.79)+0.25,dur:0.8});
 wtext(g,'على الإدارة',650,830,{font:'cairo',size:32,t0:T(38.79)+1.05,dur:0.4,noHand:true});
}
// ---------- S4: the closed loop
const s4start=s3end+0.4, s4end=T(46.62)+0.35;
{const g=scene(s4start,s4end);
 wtext(g,'المجلس نزل يعتمد ورق الشغل اليومي؟',960,200,{size:70,t0:Math.max(s4start+0.05,T(41.45)-0.05),dur:1.3});
 boss(g,960,700,230,T(41.45)+0.6,{arms:'point',tag:'المجلس'});
 for(let i=0;i<6;i++){const r=mk('rect',{x:1080+(i%2)*10,y:640-i*24,width:150,height:20,rx:3,fill:'#fff',stroke:NAVY,'stroke-width':3},g);pop(r,T(43.73)-0.1+i*0.08,0.2)}
 const lc=T(45.82)-0.1;
 R.path(g,'M760 430 A250 250 0 0 1 1160 430',lc,0.3,{stroke:RED,strokeWidth:8});R.path(g,'M1160 800 A250 250 0 0 1 760 800',lc+0.3,0.3,{stroke:RED,strokeWidth:8});
 R.path(g,'M1132 400 L1164 432 L1124 446',lc+0.6,0.06,{stroke:RED,strokeWidth:8});R.path(g,'M788 830 L756 798 L796 784',lc+0.66,0.06,{stroke:RED,strokeWidth:8});
 wtext(g,'مين هيراقب مين؟',960,900,{size:80,color:RED,t0:lc+0.75,dur:0.55});
}
// ---------- S5: the key line
const s5start=s4end+0.4, s5end=T(51.25)+0.4;
{const g=scene(s5start,s5end);
 wtext(g,'افتكرها كده',960,250,{size:70,color:BURG,t0:Math.max(s5start+0.05,T(47.43)-0.05),dur:0.5});
 wtext(g,'اللي بيراقب…',960,480,{size:124,t0:T(48.94)-0.08,dur:0.6});
 wtext(g,'ما ينفعش يكون هو اللي بينفّذ.',960,700,{size:96,color:GOLD,stroke:NAVY,sw:3,t0:T(49.9)-0.05,dur:1.3});
 R.path(g,'M560 745 Q760 728 960 742 T 1360 736',T(49.9)+1.3,0.25,{stroke:BURG,strokeWidth:7});
 sparkle(g,1420,590,0.65,T(49.9)+1.45);
}
// ---------- S6: the question
const tCL=tCloseLogo;
{const g=scene(s5end+0.4,tCL-0.05,'fade');
 wtext(g,'وإنت؟',960,260,{size:140,t0:T(52.26)-0.12,dur:0.45});
 wtext(g,'المجلس عندكم في المدرّجات… ولا نازل الملعب؟',960,460,{size:72,color:GOLD,stroke:NAVY,sw:2.5,t0:T(53.02)-0.05,dur:1.7});
 const st=mk('g',{},g);[[1180,620,1360],[1200,590,1340],[1220,560,1320]].forEach(([a,y,b])=>mk('line',{x1:a,y1:y,x2:b,y2:y,stroke:NAVY,'stroke-width':5,'stroke-linecap':'round'},st));
 const sl=mk('text',{x:1270,y:690,'text-anchor':'middle','font-family':"'Cairo'",'font-weight':700,'font-size':30,fill:NAVY},st);sl.textContent='المدرّجات ✓';pop(st,T(54.77),0.35);
 const pt=mk('g',{},g);mk('rect',{x:560,y:550,width:180,height:100,rx:6,fill:'rgba(46,125,50,0.08)',stroke:NAVY,'stroke-width':4},pt);mk('line',{x1:650,y1:550,x2:650,y2:650,stroke:NAVY,'stroke-width':3},pt);
 const plb=mk('text',{x:650,y:690,'text-anchor':'middle','font-family':"'Cairo'",'font-weight':700,'font-size':30,fill:RED},pt);plb.textContent='الملعب ✗';pop(pt,T(54.99)+0.4,0.35);
 wtext(g,'اكتبلي في التعليقات',960,830,{font:'cairo',size:48,t0:T(56.66)-0.05,dur:0.6});
}
// ---------- S7: closing
{const g=scene(tCL,1e9);
 R.circle(g,L_E.x,L_E.y,460,tCL+0.05,0.55,{stroke:GOLD,strokeWidth:8,roughness:0.9});
 const a=T(58.33)+0.25;
 wtext(g,'',960,720,{size:76,t0:a,dur:1.0,spans:[['بكرة: ',GOLD],['تحليل SWOT صح',NAVY]]});
 wtext(g,'التحليل اللي ما يطلّعش قرار… مالوش لازمة',960,790,{font:'cairo',size:36,t0:a+1.05,dur:0.8});
 R.line(g,760,832,920,832,a+1.9,0.1,{stroke:BURG,strokeWidth:4});R.line(g,1000,832,1160,832,a+2.0,0.1,{stroke:BURG,strokeWidth:4});
 const dia=mk('path',{d:'M960 820 L972 832 L960 844 L948 832Z',fill:GOLD},g);pop(dia,a+2.0,0.25);
 wtext(g,'تابعني على لينكدإن  ·  Modather Salama',960,905,{font:'cairo',size:40,t0:a+2.15,dur:0.95});
}
}
