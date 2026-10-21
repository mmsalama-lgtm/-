function build(){
const AR=n=>String(n).replace(/\d/g,x=>'٠١٢٣٤٥٦٧٨٩'[x]);
// ---------- S0: intro — gold circle + logo stamp + episode title
{const g=scene(-1,2.3,'fade');
 R.circle(g,L_C.x,L_C.y,640,0.0,0.6,{stroke:GOLD,strokeWidth:9,roughness:0.9});
 wtext(g,'سرّ الـ ١٪',540,1290,{size:120,t0:1.38,dur:0.75});
 R.line(g,400,1335,680,1335,2.16,0.12,{stroke:BURG,strokeWidth:6});
}
// ---------- S1: the hook — +1% every day… where after a year?
const s1end=T(6.42)+0.05;
{const g=scene(2.4,s1end);
 wtext(g,'+1%',540,700,{font:'cairo',weight:800,size:240,color:GOLD,stroke:NAVY,sw:4,ltr:true,t0:2.5,dur:0.55});
 const a=T(3.79);
 R.rect(g,430,800,220,190,a-0.15,0.3,{fill:'#fff',fillStyle:'solid'});
 R.rect(g,430,800,220,50,a+0.15,0.12,{fill:BURG,fillStyle:'hachure',hachureGap:9,fillWeight:3,strokeWidth:4});
 R.line(g,480,782,480,822,a+0.27,0.04,{strokeWidth:6});R.line(g,600,782,600,822,a+0.31,0.04,{strokeWidth:6});
 wtext(g,'+1%',540,950,{font:'cairo',weight:800,size:64,color:'#C98F00',ltr:true,t0:a+0.32,dur:0.18});
 wtext(g,'كل يوم',540,1100,{size:84,t0:a+0.5,dur:0.4});
 const b=T(5.45);
 wtext(g,'هتوصل لفين بعد سنة؟',540,1320,{size:88,color:RED,t0:b-0.05,dur:0.9});
}
// ---------- growth / decline equation scenes (same layout so the eye compares them)
function equation(g,base,color,t0,tExp,tEq,tCnt,tCntEnd,fn,fmt,curve,curveStroke){
 wtext(g,base,500,660,{font:'cairo',weight:800,size:150,color,ltr:true,t0,dur:0.5});
 wtext(g,'365',655,560,{font:'cairo',weight:800,size:78,color:color===NAVY?'#C98F00':color,ltr:true,anchor:'start',t0:tExp,dur:0.35});
 R.line(g,500,760,580,760,tEq,0.12,{stroke:GOLD,strokeWidth:11});R.line(g,500,792,580,792,tEq+0.13,0.12,{stroke:GOLD,strokeWidth:11});
 const cnt=mk('text',{x:540,y:1010,'text-anchor':'middle','font-family':"'Cairo'",'font-weight':800,'font-size':200,fill:color===NAVY?GOLD:color,stroke:NAVY,'stroke-width':color===NAVY?4:0,'paint-order':'stroke',direction:'ltr'},g);
 updaters.push(t=>{if(t<tCnt){cnt.style.opacity=0;return}cnt.style.opacity=1;const p=clamp((t-tCnt)/(tCntEnd-tCnt));cnt.textContent=fmt(fn(p))});
 events.push([tCnt,tCntEnd,'tick']);
 R.lines(g,[[190,1110],[190,1390],[890,1390]],tCnt-0.1,0.25,{strokeWidth:5});
 const pts=[];for(let i=0;i<=40;i++){const u=i/40;pts.push([200+680*u,curve(u)])}
 R.lines(g,pts,tCnt+0.15,tCntEnd-tCnt-0.1,{stroke:curveStroke,strokeWidth:9,roughness:0.4});
}
const s2start=s1end+0.4, s2end=T(16.99)+0.35;
{const g=scene(s2start,s2end);
 equation(g,'1.01',NAVY,T(8.21),T(10.8),T(13.37)-0.25,T(13.37),T(15.99)+0.35,p=>Math.pow(1.01,365*p),v=>v.toFixed(1),u=>1380-250*(Math.pow(1.01,365*u)-1)/36.8,GOLD);
 wtext(g,'أحسن بحوالي ٣٨ مرة!',540,1475,{size:66,t0:T(15.99)+0.1,dur:0.75});
 sparkle(g,830,880,0.7,T(15.99)+0.4);sparkle(g,250,860,0.55,T(15.99)+0.5);
}
const s3start=s2end+0.4, s3end=T(23.91)+0.3;
{const g=scene(s3start,s3end);
 wtext(g,'والعكس؟',540,430,{size:120,color:RED,t0:T(18.31)-0.05,dur:0.5});
 equation(g,'0.99',RED,T(19.15),T(19.9),T(20.5),T(21.85),T(23.2),p=>Math.pow(0.99,365*p),v=>v.toFixed(2),u=>1120+250*(1-Math.pow(0.99,365*u))/0.974,RED);
 wtext(g,'أقل من ٣٪ من مستواك',540,1475,{size:66,color:RED,t0:T(22.7),dur:0.75});
}
// ---------- S4a: continuous improvement = kaizen
const s4start=s3end+0.4, s4end=T(33.32)+0.3;
{const g=scene(s4start,s4end);
 const a=T(25.4);
 wtext(g,'التحسين المستمر',540,430,{size:124,t0:a+0.1,dur:1.35});
 R.line(g,300,480,780,480,a+1.55,0.2,{stroke:BURG,strokeWidth:7});
 wtext(g,'Continuous Improvement',540,575,{font:'caveat',size:66,ltr:true,t0:T(27.52)-0.05,dur:0.7,opacity:0.85});
 const b=T(29.57);
 const pts=[[960,1390]];for(let i=0;i<8;i++){const x=900-90*i,y=1390-52*(i+1);pts.push([x,y],[x-90,y])}
 R.lines(g,pts,b,1.1,{stroke:NAVY,strokeWidth:7});
 R.line(g,60,1390,1000,1390,b+1.1,0.15,{strokeWidth:6});
 popFigure(g,860,1338,150,b+0.3,{arms:'down'});
 popFigure(g,225,1390-52*8,150,b+1.25,{arms:'up'});
 dashed(g,`M840 1240 Q560 980 300 900`,b+1.3,0.45,{color:GOLD,sw:7,dash:'16 14'});
 wtext(g,'كايزن',740,1010,{size:130,color:GOLD,stroke:NAVY,sw:3,t0:T(33.09)-0.25,dur:0.45});
 const sub=mk('text',{x:740,y:1085,'text-anchor':'middle','font-family':"'Cairo'",'font-weight':700,'font-size':36,fill:NAVY,direction:'rtl'},g);sub.textContent='خطوات صغيرة… كل يوم';fade(sub,T(33.09)+0.15,0.3);
}
// ---------- S4b: ISO 9001 clause 10.3
const s5start=s4end+0.4, s5end=T(42.44)+0.35;
{const g=scene(s5start,s5end);
 const a=T(34.8);
 R.rect(g,170,540,740,190,a,0.4,{fill:'#fff',fillStyle:'solid',strokeWidth:6});
 wtext(g,'ISO 9001',540,630,{font:'cairo',weight:800,size:84,ltr:true,t0:a+0.42,dur:0.45});
 wtext(g,'بند 10.3 — التحسين المستمر',540,700,{font:'cairo',size:42,t0:a+0.95,dur:0.8});
 R.ellipse(g,640,686,250,70,T(37.57)-0.1,0.35,{stroke:GOLD,strokeWidth:6,roughness:1.3});
 const b=T(39.01);
 wtext(g,'تحسين مستمر',590,920,{size:116,t0:b-0.05,dur:0.6});
 check(g,215,880,1.3,b+0.6,0.2,GOLD);
 const c=T(40.67);
 R.rect(g,800,1050,140,120,c-0.2,0.25,{fill:'#fff',fillStyle:'solid'});R.rect(g,800,1050,140,34,c+0.05,0.08,{fill:BURG,fillStyle:'hachure',hachureGap:8,fillWeight:3,strokeWidth:4});
 wtext(g,'١',870,1152,{font:'cairo',weight:800,size:52,t0:c+0.13,dur:0.08});
 wtext(g,'مرة في السنة… قبل المراجعة',450,1140,{size:58,t0:c+0.22,dur:0.95});
 R.line(g,120,1120,780,1112,c+1.2,0.22,{stroke:RED,strokeWidth:9});
 R.line(g,815,1065,925,1160,c+1.42,0.1,{stroke:RED,strokeWidth:9});R.line(g,925,1065,815,1160,c+1.53,0.1,{stroke:RED,strokeWidth:9});
}
// ---------- S5: 52 improvements a year
const s6start=s5end+0.4, s6end=T(50.76)+0.35;
{const g=scene(s6start,s6end);
 const a=T(43.86);
 wtext(g,'كل قسم… إجراء واحد كل أسبوع',540,400,{size:72,t0:a,dur:1.5});
 R.line(g,220,445,860,445,a+1.55,0.2,{stroke:BURG,strokeWidth:6});
 const cols=13,rows=4,cs=56,gap=10,W=cols*cs+(cols-1)*gap,x0=540+W/2,y0=600;
 const cells=[];const grid=mk('g',{},g);
 for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){const x=x0-(c+1)*cs-c*gap,y=y0+r*(cs+gap);
   const rc=mk('rect',{x,y,width:cs,height:cs,rx:9,fill:'#fff',stroke:NAVY,'stroke-width':3},grid);
   const ck=mk('path',{d:`M${x+14} ${y+29} L${x+24} ${y+40} L${x+43} ${y+17}`,fill:'none',stroke:NAVY,'stroke-width':5,'stroke-linecap':'round','stroke-linejoin':'round',opacity:0},grid);cells.push([rc,ck])}
 const tg=T(45.73)-0.3;fade(grid,tg,0.35);
 const f0=T(45.73)+0.2,f1=T(49.53)+0.5;events.push([f0,f1,'tick']);
 const cnt=mk('text',{x:540,y:1110,'text-anchor':'middle','font-family':"'Cairo'",'font-weight':800,'font-size':170,fill:GOLD,stroke:NAVY,'stroke-width':4,'paint-order':'stroke'},g);
 updaters.push(t=>{const n=Math.round(52*clamp((t-f0)/(f1-f0)));cells.forEach(([rc,ck],i)=>{const on=i<n;rc.setAttribute('fill',on?GOLD:'#fff');ck.setAttribute('opacity',on?1:0)});
   cnt.style.opacity=t<f0?0:1;cnt.textContent=AR(n)});
 wtext(g,'تحسين في السنة',540,1250,{size:80,t0:T(49.53)+0.05,dur:0.65});
 sparkle(g,800,1000,0.7,f1);sparkle(g,280,980,0.55,f1+0.08);
}
// ---------- S6: the key line
const s7start=s6end+0.4, s7end=T(55.93)+0.45;
{const g=scene(s7start,s7end);
 wtext(g,'افتكرها كده',540,560,{size:70,color:BURG,t0:T(51.84)-0.05,dur:0.55});
 wtext(g,'التحسين المستمر عادة…',540,820,{size:106,t0:T(53.16)+0.1,dur:1.0});
 wtext(g,'مش ثورة.',540,1060,{size:160,color:GOLD,stroke:NAVY,sw:3.5,t0:T(55.42)-0.12,dur:0.5});
 R.path(g,'M280 1110 Q410 1092 540 1106 T 800 1100',T(55.42)+0.4,0.25,{stroke:BURG,strokeWidth:7});
}
// ---------- S7: this series is your 1%
const s8start=s7end+0.4, s8end=T(60.44)+0.35;
{const g=scene(s8start,s8end);
 const a=T(57.14);
 const moon=mk('g',{},g);mk('path',{d:'M600 560 A150 150 0 1 0 600 860 A190 190 0 0 1 600 560 Z',fill:GOLD,stroke:NAVY,'stroke-width':5,'stroke-linejoin':'round'},moon);pop(moon,a-0.1,0.45);
 sparkle(g,680,600,0.6,a+0.5);
 wtext(g,'مساء التميّز',540,1000,{size:90,t0:a+0.45,dur:0.55});
 wtext(g,'الواحد في المية بتاعك',540,1150,{size:92,color:GOLD,stroke:NAVY,sw:3,t0:T(58.49)+0.1,dur:0.95});
 wtext(g,'كل مساء',540,1290,{size:80,t0:T(58.49)+1.05,dur:0.5});
}
// ---------- S8: the question
const tCL=tCloseLogo;
{const g=scene(s8end+0.4,tCL-0.05,'fade');
 const a=T(61.66);
 const bub=mk('g',{},g);
 mk('path',{d:'M465 470 h150 a24 24 0 0 1 24 24 v66 a24 24 0 0 1 -24 24 h-90 l-34 30 l4 -30 h-30 a24 24 0 0 1 -24 -24 v-66 a24 24 0 0 1 24 -24 z',fill:'#fff',stroke:NAVY,'stroke-width':5,'stroke-linejoin':'round'},bub);
 [510,540,570].forEach(x=>mk('circle',{cx:x,cy:527,r:8,fill:GOLD},bub));pop(bub,a-0.1,0.4);
 wtext(g,'قولّي في التعليقات',540,720,{font:'cairo',size:48,t0:a+0.2,dur:0.6});
 const b=T(63.23);
 wtext(g,'إيه الإجراء الواحد',540,900,{size:94,t0:b-0.05,dur:0.75});
 wtext(g,'اللي هتحسّنه الأسبوع ده؟',540,1040,{size:94,color:GOLD,stroke:NAVY,sw:3,t0:b+0.75,dur:0.85});
 R.rect(g,780,1150,70,70,b+1.65,0.18,{strokeWidth:6});
 dashed(g,'M750 1205 L240 1205',b+1.85,0.3,{color:NAVY,sw:5,dash:'10 12'});
}
// ---------- S9: closing
{const g=scene(tCL,1e9);
 R.circle(g,L_E.x,L_E.y,500,tCL+0.05,0.6,{stroke:GOLD,strokeWidth:8,roughness:0.9});
 const a=T(66.12);
 wtext(g,'',540,1170,{size:76,t0:a+0.05,dur:1.1,spans:[['بكرة: ',GOLD],['الجودة ولا التميّز؟',NAVY]]});
 R.line(g,330,1222,500,1222,a+1.2,0.1,{stroke:BURG,strokeWidth:4});R.line(g,580,1222,750,1222,a+1.3,0.1,{stroke:BURG,strokeWidth:4});
 const dia=mk('path',{d:'M540 1210 L552 1222 L540 1234 L528 1222Z',fill:GOLD},g);pop(dia,a+1.3,0.25);
 wtext(g,'تابعني على لينكدإن  ·  Modather Salama',540,1300,{font:'cairo',size:40,t0:a+1.45,dur:1.0});
}
}
