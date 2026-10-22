function build(){
const tint=(g,x,y,w,h,c,t0,op)=>{const r=mk('rect',{x,y,width:w,height:h,fill:c},g);fade(r,t0,0.35,op||0.14);return r};
function phone(g,x,y,s,t0,dur,o={}){const G=mk('g',{transform:`translate(${x},${y}) scale(${s})`},g);const q=a=>Object.assign({noHand:!!o.noHand},a);
  R.rect(G,-55,-95,110,190,t0,dur*0.4,q({fill:'#fff',fillStyle:'solid',strokeWidth:6}));R.rect(G,-42,-74,84,140,t0+dur*0.4,dur*0.2,q({strokeWidth:3,fill:'rgba(159,195,240,0.25)',fillStyle:'solid'}));
  R.path(G,'M-32 -50 h56 a10 10 0 0 1 10 10 v20 a10 10 0 0 1 -10 10 h-36 l-14 12 l2 -12 h-8 a10 10 0 0 1 -10 -10 v-20 a10 10 0 0 1 10 -10 z',t0+dur*0.6,dur*0.3,q({fill:GOLD,fillStyle:'solid',strokeWidth:3}));
  const D=mk('g',{},G);[-14,0,14].forEach(dx=>mk('circle',{cx:dx-3,cy:-30,r:3.5,fill:NAVY},D));fade(D,t0+dur*0.9,0.1);return G}
function ticket(g,x,y,s,t0,dur,o={}){const G=mk('g',{transform:`translate(${x},${y}) scale(${s})`},g);const q=a=>Object.assign({noHand:!!o.noHand},a);
  R.path(G,'M-85 -60 H85 V-15 A15 15 0 0 0 85 15 V60 H-85 V15 A15 15 0 0 0 -85 -15 Z',t0,dur*0.5,q({fill:'#fff',fillStyle:'solid',strokeWidth:5}));
  R.circle(G,-45,0,56,t0+dur*0.5,dur*0.2,q({fill:RED,fillStyle:'solid',stroke:RED,strokeWidth:3}));
  const ex=mk('text',{x:-45,y:14,'text-anchor':'middle','font-family':"'Cairo'",'font-weight':800,'font-size':40,fill:'#fff'},G);ex.textContent='!';fade(ex,t0+dur*0.7,0.1);
  [-22,0,22].forEach((dy,i)=>R.line(G,0,dy,60,dy,t0+dur*0.75+i*dur*0.07,dur*0.07,q({strokeWidth:4})));return G}
function cal(g,x,y,s,t0,dur,o={}){const G=mk('g',{transform:`translate(${x},${y}) scale(${s})`},g);const q=a=>Object.assign({noHand:!!o.noHand},a);
  R.rect(G,-80,-70,160,140,t0,dur*0.4,q({fill:'#fff',fillStyle:'solid',strokeWidth:5}));R.rect(G,-80,-70,160,36,t0+dur*0.4,dur*0.15,q({fill:BURG,fillStyle:'hachure',hachureGap:8,fillWeight:3,strokeWidth:4}));
  const D=mk('g',{},G);for(let r=0;r<2;r++)for(let c=0;c<4;c++)mk('rect',{x:-64+c*34,y:-22+r*36,width:24,height:24,rx:4,fill:r===1&&c===1?GOLD:'none',stroke:NAVY,'stroke-width':2.5},D);fade(D,t0+dur*0.6,0.2);
  return G}
// ---------- S0: hook-first intro
{const g=scene(-1,2.3,'fade');
 wtext(g,'تبدأ بإيه؟',960,150,{size:96,t0:0.02,dur:0.55,noHand:true});
 R.circle(g,L_C.x,L_C.y,600,0.0,0.6,{stroke:GOLD,strokeWidth:9,roughness:0.9});
 wtext(g,'مصفوفة أيزنهاور',960,890,{size:92,t0:1.38,dur:0.8});
}
// ---------- S1: test yourself — three things in front of you
const s1end=T(17.25)+0.3;
{const g=scene(2.4,s1end);
 wtext(g,'اختبر نفسك',960,190,{size:96,t0:T(3.13)-0.05,dur:0.6});
 const cards=[[1420,'رسالة واتساب'],[960,'شكوى عميل… النهارده!'],[500,'خطة الشهر الجاي']];
 const tt=[T(6.62),T(9.23),T(11.41)];
 cards.forEach(([x,l],i)=>{R.rect(g,x-160,290,320,330,tt[i]-0.15,0.3,{fill:'#fff',fillStyle:'solid',strokeWidth:5,roughness:0.8});
   const n=mk('g',{},g);mk('circle',{cx:x+160,cy:290,r:28,fill:GOLD,stroke:NAVY,'stroke-width':4},n);const nt=mk('text',{x:x+160,y:302,'text-anchor':'middle','font-family':"'Cairo'",'font-weight':800,'font-size':32,fill:NAVY},n);nt.textContent='١٢٣'[i];pop(n,tt[i]+0.1,0.3)});
 const ph=phone(g,1420,455,1.15,tt[0]+0.15,0.6);
 updaters.push(t=>{let w=0;for(const t0 of [tt[0]+0.75,T(15.89)+0.2]){if(t>t0&&t<t0+1.0)w=Math.sin((t-t0)*48)*5*(1-(t-t0))}ph.setAttribute('transform',`translate(1420,455) scale(1.15) rotate(${w})`)});
 wtext(g,cards[0][1],1420,690,{size:54,t0:tt[0]+0.75,dur:0.45});
 ticket(g,960,455,1.25,tt[1]+0.15,0.6);
 wtext(g,cards[1][1],960,690,{size:54,color:RED,t0:tt[1]+0.75,dur:0.6});
 cal(g,500,455,1.3,tt[2]+0.15,0.5);
 wtext(g,cards[2][1],500,690,{size:54,t0:tt[2]+0.62,dur:0.5});
 const q=wtext(g,'تبدأ بإيه؟',960,860,{size:100,t0:T(13.96)-0.1,dur:0.5});
 fadeOut(q.el,T(15.89)-0.15,0.2);
 R.ellipse(g,1420,455,380,420,T(15.89)-0.05,0.45,{stroke:RED,strokeWidth:7,roughness:1.4});
 wtext(g,'أغلبنا… بيرد على الواتساب الأول!',960,860,{size:78,color:RED,t0:T(15.89)+0.4,dur:1.0});
}
// ---------- S2: the matrix + Covey
const s2start=s1end+0.4, s2end=T(54.12)+0.35;
{const g=scene(s2start,s2end);
 wtext(g,'مصفوفة أيزنهاور',960,170,{size:84,t0:T(19.01)+0.1,dur:1.1});
 wtext(g,'Eisenhower Matrix',960,232,{font:'caveat',size:46,ltr:true,opacity:0.85,t0:T(21.73)-0.05,dur:0.6});
 const X0=630,XM=960,X1=1290,Y0=330,YM=550,Y1=770;
 const tg=mk('g',{},g);
 const a=T(23.78);
 R.rect(g,X0,Y0,X1-X0,Y1-Y0,a-0.1,0.45,{strokeWidth:6,roughness:0.7});R.line(g,XM,Y0,XM,Y1,a+0.35,0.15,{strokeWidth:5});R.line(g,X0,YM,X1,YM,a+0.5,0.15,{strokeWidth:5});
 wtext(g,'مهم',1375,455,{size:62,color:'#C98F00',t0:T(24.85)-0.05,dur:0.3});wtext(g,'مش مهم',1395,675,{size:50,opacity:0.6,t0:T(24.85)+0.25,dur:0.3,noHand:true});
 wtext(g,'عاجل',(XM+X1)/2,305,{size:62,color:RED,t0:T(25.5)-0.05,dur:0.3});wtext(g,'مش عاجل',(X0+XM)/2,305,{size:50,opacity:0.6,t0:T(25.5)+0.25,dur:0.3,noHand:true});
 // Q1 important + urgent
 const q1=T(27.5);tint(tg,XM,Y0,X1-XM,YM-Y0,RED,q1-0.1);
 wtext(g,'اعمله دلوقتي',(XM+X1)/2,430,{size:58,color:RED,t0:T(28.63)-0.05,dur:0.5});
 const t1=mk('g',{},g);ticket(t1,(XM+X1)/2,500,0.45,0,0.01,{noHand:true});pop(t1,T(29.68)-0.05,0.35);
 // Q2 important, not urgent
 const q2=T(31.89);tint(tg,X0,Y0,XM-X0,YM-Y0,GOLD,q2-0.1,0.22);
 wtext(g,'خطّطله',(X0+XM)/2,430,{size:64,color:'#B98500',t0:T(33.28)-0.05,dur:0.4});
 const c2=mk('g',{},g);cal(c2,(X0+XM)/2,500,0.4,0,0.01,{noHand:true});pop(c2,T(34.47)-0.05,0.35);
 // Q3 urgent, not important
 const q3=T(36.95);tint(tg,XM,YM,X1-XM,Y1-YM,NAVY,q3-0.1,0.1);
 wtext(g,'فوّضه',(XM+X1)/2,650,{size:66,t0:T(38.45)-0.05,dur:0.35});
 const p3=mk('g',{},g);phone(p3,(XM+X1)/2,722,0.36,0,0.01,{noHand:true});pop(p3,T(39.16)-0.05,0.35);
 // Q4 neither
 const q4=T(41.91);tint(tg,X0,YM,XM-X0,Y1-YM,'#8A94A6',q4-0.1,0.18);
 wtext(g,'شيله',(X0+XM)/2,670,{size:72,color:'#6B7486',t0:T(43.78)-0.05,dur:0.35});
 R.line(g,(X0+XM)/2-90,650,(X0+XM)/2+90,646,T(43.78)+0.35,0.15,{stroke:RED,strokeWidth:8});
 // Covey
 const c=T(45.55);
 R.rect(g,80,350,470,330,c-0.1,0.4,{fill:'#fff',fillStyle:'solid',strokeWidth:5,roughness:0.8});
 wtext(g,'ستيفن كوفي',315,430,{size:62,t0:c+0.3,dur:0.5});
 wtext(g,'«العادات السبع» – 1989',315,485,{font:'cairo',size:30,t0:c+0.85,dur:0.4,noHand:true});
 wtext(g,'الأكثر فعالية… في المربع التاني',315,575,{size:42,t0:T(47.66)-0.05,dur:1.4});
 wtext(g,'المهم اللي مش عاجل',315,640,{size:48,color:GOLD,stroke:NAVY,sw:2,t0:T(52.57)-0.05,dur:1.0});
 R.rect(g,X0+6,Y0+6,XM-X0-12,YM-Y0-12,T(49.55)+0.1,0.6,{stroke:GOLD,strokeWidth:12,roughness:1.1});
 dashed(g,`M555 520 Q600 470 ${X0+30} 450`,T(49.55)+0.75,0.3,{color:GOLD,sw:6,dash:'12 10'});
 sparkle(g,X0+40,Y0+30,0.6,T(49.55)+0.9);sparkle(g,XM-40,Y0+40,0.5,T(49.55)+1.0);
}
// ---------- S3: the key line
const s3start=s2end+0.4, s3end=T(57.93)+0.4;
{const g=scene(s3start,s3end);
 wtext(g,'افتكرها كده',960,250,{size:70,color:BURG,t0:Math.max(s3start+0.05,T(55.25)-0.05),dur:0.5});
 wtext(g,'مش كل عاجل…',960,480,{size:130,t0:T(57.01)-0.12,dur:0.6});
 wtext(g,'مهم.',960,720,{size:180,color:GOLD,stroke:NAVY,sw:4,t0:T(57.01)+0.52,dur:0.35});
 R.path(g,'M820 765 Q890 750 960 762 T 1100 758',T(57.01)+0.9,0.2,{stroke:BURG,strokeWidth:7});
 sparkle(g,1130,610,0.65,T(57.01)+1.0);
}
// ---------- S4: the question
const tCL=tCloseLogo;
{const g=scene(s3end+0.4,tCL-0.05,'fade');
 wtext(g,'وإنت؟',960,270,{size:140,t0:T(59.71)-0.12,dur:0.5});
 wtext(g,'يومك بيروح في أنهي مربع؟',960,470,{size:88,color:GOLD,stroke:NAVY,sw:3,t0:T(60.62)-0.15,dur:0.8});
 const mg=mk('g',{},g);[[0,0,RED],[-1,0,GOLD],[0,1,NAVY],[-1,1,'#8A94A6']].forEach(([cx,cy,c],i)=>{mk('rect',{x:960+cx*120,y:540+cy*90,width:110,height:80,rx:8,fill:c,'fill-opacity':0.16,stroke:NAVY,'stroke-width':3},mg);
   const n=mk('text',{x:960+cx*120+55,y:540+cy*90+54,'text-anchor':'middle','font-family':"'Cairo'",'font-weight':800,'font-size':34,fill:NAVY},mg);n.textContent='١٢٣٤'[i]});
 mg.setAttribute('transform','translate(-55,0)');pop(mg,T(60.62)+0.4,0.4);
 wtext(g,'اكتبلي في التعليقات',960,860,{font:'cairo',size:48,t0:T(62.31)-0.05,dur:0.6});
}
// ---------- S5: closing
{const g=scene(tCL,1e9);
 R.circle(g,L_E.x,L_E.y,460,tCL+0.05,0.55,{stroke:GOLD,strokeWidth:8,roughness:0.9});
 const a=T(64.39)+0.25;
 wtext(g,'',960,720,{size:72,t0:a,dur:1.15,spans:[['بكرة: ',GOLD],['الغلط الرخيص… بيطلع أغلى حاجة',NAVY]]});
 wtext(g,'تكلفة الجودة الرديئة',960,790,{font:'cairo',size:40,t0:a+1.2,dur:0.55});
 R.line(g,760,832,920,832,a+1.8,0.1,{stroke:BURG,strokeWidth:4});R.line(g,1000,832,1160,832,a+1.9,0.1,{stroke:BURG,strokeWidth:4});
 const dia=mk('path',{d:'M960 820 L972 832 L960 844 L948 832Z',fill:GOLD},g);pop(dia,a+1.9,0.25);
 wtext(g,'تابعني على لينكدإن  ·  Modather Salama',960,905,{font:'cairo',size:40,t0:a+2.05,dur:0.95});
}
}
