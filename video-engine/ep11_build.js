function build(){
const Q=x=>x/1.05;
const AR=n=>String(n).replace(/\d/g,x=>'٠١٢٣٤٥٦٧٨٩'[x]);
// ---- section tag (top-left) -------------------------------------------------
{const ui=document.getElementById('ui');const tg=mk('g',{},ui);const r=mk('rect',{x:50,y:46,rx:18,ry:18,height:52,width:200,fill:GOLD,stroke:NAVY,'stroke-width':3},tg);
 const tx=mk('text',{x:150,y:82,'text-anchor':'middle','font-family':"'Cairo'",'font-weight':800,'font-size':28,fill:NAVY,direction:'rtl'},tg);
 const SEC=[[2.4,'سؤال'],[Q(10.0),'القصة'],[Q(26.4),'الفكرة'],[Q(40.8),'المثال'],[Q(53.0),'جرّبها بكرة'],[Q(64.6),'الأيزو'],[Q(80.8),'لغز الحلقة الجاية'],[Q(93.25)-0.35,'']];
 updaters.push(t=>{let cur=null,ts=0;for(const [a,l] of SEC){if(t>=a){cur=l;ts=a}}if(!cur){tg.style.opacity=0;return}
   tx.textContent=cur;const w=Math.max(160,cur.length*22+50);r.setAttribute('width',w);tx.setAttribute('x',50+w/2);tg.style.opacity=clamp((t-ts)/0.25)});}
function doc(g,x,y,s,t0,dur,o={}){const q=a=>Object.assign({noHand:!!o.noHand},a);const G=mk('g',{transform:`translate(${x},${y}) scale(${s})`},g);
  R.rect(G,-90,-120,180,240,t0,dur*0.4,q({fill:o.fill||'#fff',fillStyle:'solid',strokeWidth:5}));
  [-80,-45,-10,25].forEach((yy,i)=>R.line(G,-60,yy,60,yy,t0+dur*0.4+i*dur*0.08,dur*0.08,q({strokeWidth:4,stroke:'#8E9AAB'})));
  return G}
// ---------- S0: hook-first intro
{const g=scene(-1,2.3,'fade');
 wtext(g,'إجراء مكتوب… ومحدّش بيعمله زي ما هو؟',960,150,{size:74,t0:0.02,dur:0.6,noHand:true});
 R.circle(g,L_C.x,L_C.y,600,0.0,0.6,{stroke:GOLD,strokeWidth:9,roughness:0.9});
 wtext(g,'الإجراء على الورق ولا على الأرض؟',960,880,{size:76,t0:1.38,dur:0.85});
}
// ---------- S1: the signed procedure… and the floor
const s1end=Q(9.65)+0.3;
{const g=scene(2.4,s1end);
 const a=2.55;
 R.rect(g,560,230,330,420,a,0.35,{fill:'#EEF2F7',fillStyle:'solid',strokeWidth:6});[300,450,600].forEach((y,i)=>R.circle(g,580,y,28,a+0.35+i*0.05,0.05,{strokeWidth:4,noHand:true}));
 doc(g,735,440,1.25,a+0.5,0.6);
 wtext(g,'الإجراء',735,330,{size:46,t0:a+1.1,dur:0.3});
 R.path(g,'M680 560 Q700 530 720 560 T 760 555 Q780 540 800 560',Q(3.2),0.3,{stroke:NAVY,strokeWidth:4});
 const st=mk('g',{},g);const sr=mk('g',{transform:'rotate(-10 820 600)'},st);mk('circle',{cx:820,cy:600,r:52,fill:'none',stroke:'#2E7D32','stroke-width':6},sr);const stx=mk('text',{x:820,y:612,'text-anchor':'middle','font-family':"'Cairo'",'font-weight':800,'font-size':28,fill:'#2E7D32'},sr);stx.textContent='معتمد';pop(st,Q(3.6),0.3);events.push([Q(3.6),Q(3.6)+0.3,'stamp']);
 R.path(g,'M960 440 L1180 440',Q(5.53),0.25,{strokeWidth:8});R.path(g,'M1150 410 L1185 440 L1150 470',Q(5.53)+0.25,0.08,{strokeWidth:8});
 R.line(g,1240,720,1720,720,Q(5.9),0.2,{strokeWidth:6});
 [[1330,720],[1480,720],[1630,720]].forEach(([x,y],i)=>popFigure(g,x,y,170,Q(6.2)+i*0.12,{arms:i===1?'point':'down'}));
 wtext(g,'على الأرض',1480,450,{size:56,t0:Q(6.4),dur:0.5});
 const qm=mk('text',{x:1480,y:560,'text-anchor':'middle','font-family':"'Cairo'",'font-weight':800,'font-size':110,fill:RED},g);qm.textContent='؟';pop(qm,Q(7.9),0.35);
}
// ---------- S2: the auditor, 7 steps vs 5
const s2start=s1end+0.4, s2end=Q(26.21)+0.35;
{const g=scene(s2start,s2end);
 const a=Q(10.15);
 R.line(g,820,640,1700,640,a-0.1,0.3,{strokeWidth:6});R.line(g,820,690,1700,690,a+0.2,0.25,{strokeWidth:6});
 [900,1060,1220,1380,1540].forEach((x,i)=>R.circle(g,x,665,40,a+0.4+i*0.05,0.05,{strokeWidth:4,noHand:true}));
 [960,1200,1440].forEach((x,i)=>{const b=mk('rect',{x:x-45,y:580,width:90,height:58,rx:6,fill:'#F7E2B8',stroke:NAVY,'stroke-width':3},g);pop(b,a+0.7+i*0.1,0.25)});
 popFigure(g,1650,640,190,a+0.9,{arms:'down'});
 const aud=mk('g',{},g);const af=figure(aud,420,700,230,{arms:'point'});mk('rect',{x:40,y:-160,width:40,height:54,rx:4,fill:'#fff',stroke:NAVY,'stroke-width':4},af.G);pop(aud,a+0.2,0.35);
 wtext(g,'المراجع',420,780,{size:46,t0:a+0.5,dur:0.4});
 const b=Q(13.22);wtext(g,'الإجراء:',1590,315,{size:52,t0:b-0.05,dur:0.35});
 const dots=[];for(let i=0;i<7;i++){const x=1440-i*120;const G=mk('g',{},g);mk('circle',{cx:x,cy:300,r:34,fill:'#fff',stroke:NAVY,'stroke-width':4},G);const t=mk('text',{x,y:312,'text-anchor':'middle','font-family':"'Cairo'",'font-weight':800,'font-size':30,fill:NAVY},G);t.textContent=AR(i+1);pop(G,b+0.35+i*0.1,0.22);dots.push(G)}
 const c=Q(15.55);
 wtext(g,'العامل:',1590,432,{size:52,t0:c-0.05,dur:0.35});
 for(let i=0;i<5;i++){const x=1440-i*150;const G=mk('g',{},g);mk('circle',{cx:x,cy:420,r:36,fill:GOLD,stroke:NAVY,'stroke-width':4},G);const t=mk('text',{x,y:432,'text-anchor':'middle','font-family':"'Cairo'",'font-weight':800,'font-size':30,fill:NAVY},G);t.textContent=AR(i+1);pop(G,c+0.3+i*0.12,0.22)}
 [[1400,375],[1250,375],[1100,375]].forEach(([x,y],i)=>R.line(g,x-20,y,x-70,y,c+1.0+i*0.05,0.05,{stroke:'#C98F00',strokeWidth:4,noHand:true}));
 check(g,700,420,0.9,Q(18.3),0.2,'#2E7D32');
 const st=mk('g',{},g);const sr=mk('g',{transform:'rotate(-8 430 430)'},st);mk('rect',{x:280,y:385,width:300,height:84,rx:10,fill:'#fff','fill-opacity':0.92,stroke:RED,'stroke-width':6},sr);const sx=mk('text',{x:430,y:440,'text-anchor':'middle','font-family':"'Cairo'",'font-weight':800,'font-size':38,fill:RED},sr);sx.textContent='عدم مطابقة';pop(st,Q(20.6),0.3);events.push([Q(20.6),Q(20.6)+0.3,'stamp']);
 wtext(g,'مين الغلطان؟',960,860,{size:76,color:RED,t0:Q(23.72)-0.05,dur:0.55});
 R.path(g,'M1180 820 Q1290 760 1300 640',Q(24.84)-0.05,0.25,{stroke:RED,strokeWidth:6});
 R.path(g,'M740 820 Q640 600 1000 330',Q(25.59)-0.05,0.3,{stroke:RED,strokeWidth:6});
}
// ---------- S3: the garden — walkway vs worn path
const s3start=s2end+0.4, s3end=Q(40.62)+0.35;
{const g=scene(s3start,s3end);
 const a=Q(26.61);
 const grass=mk('rect',{x:220,y:200,width:1480,height:660,rx:30,fill:'rgba(46,125,50,0.10)'},g);fade(grass,a-0.1,0.4,1);
 R.rect(g,220,200,1480,660,a-0.1,0.4,{strokeWidth:5,stroke:'#2E7D32',roughness:0.8});
 const b=Q(28.08);
 R.path(g,'M1620 780 L1620 300 Q1620 260 1580 260 L340 260 Q300 260 300 300 L300 780',b-0.1,0.9,{strokeWidth:34,stroke:'#C9CED6',roughness:0.5});
 R.path(g,'M1620 780 L1620 300 Q1620 260 1580 260 L340 260 Q300 260 300 300 L300 780',b+0.8,0.01,{strokeWidth:4,stroke:NAVY,roughness:0.5,noHand:true});
 const c=Q(29.48);
 dashed(g,'M1580 790 L340 790',c,0.7,{color:'#8B5A2B',sw:22,dash:'30 14'});
 for(let i=0;i<6;i++){const fp=mk('ellipse',{cx:1450-i*200,cy:790,rx:12,ry:7,fill:'#5D3A1A'},g);pop(fp,c+0.7+i*0.08,0.2)}
 [[700,700],[1000,690],[1300,705]].forEach(([x,y],i)=>popFigure(g,x,y+90,110,c+0.6+i*0.1,{arms:'down'}));
 wtext(g,'الإجراء على الورق',960,345,{size:60,t0:Q(31.84)-0.05,dur:0.7});
 wtext(g,'الشغل الحقيقي',960,620,{size:60,color:'#8B5A2B',t0:Q(33.89)-0.05,dur:0.6});
 const d=Q(36.05);
 R.path(g,'M1500 380 L1500 740',d,0.3,{stroke:RED,strokeWidth:6});R.path(g,'M1480 410 L1500 380 L1520 410',d+0.3,0.05,{stroke:RED,strokeWidth:6});R.path(g,'M1480 710 L1500 740 L1520 710',d+0.35,0.05,{stroke:RED,strokeWidth:6});
 wtext(g,'المسافة',1500,560,{size:44,color:RED,t0:d+0.4,dur:0.4,stroke:'#fff',sw:6});
 wtext(g,'= ورقة للمراجع وبس',820,500,{size:54,color:RED,t0:Q(38.2),dur:0.9,stroke:'#fff',sw:6});
}
// ---------- S4: example — old procedure, new machine
const s4start=s3end+0.4, s4end=Q(52.79)+0.35;
{const g=scene(s4start,s4end);
 const a=Q(40.98);
 doc(g,1450,450,1.3,a-0.1,0.6,{fill:'#F6EBD0'});
 wtext(g,'من ٣ سنين',1450,690,{size:52,color:'#8E6A2A',t0:a+0.6,dur:0.5});
 const b=Q(43.12);
 R.rect(g,820,330,300,230,b-0.1,0.3,{fill:'#E9F1FB',fillStyle:'solid',strokeWidth:6});R.rect(g,860,370,110,80,b+0.2,0.1,{strokeWidth:4,noHand:true});R.circle(g,1050,410,60,b+0.3,0.1,{strokeWidth:4,noHand:true});R.line(g,850,560,1090,560,b+0.4,0.1,{strokeWidth:8,noHand:true});
 wtext(g,'ماكينة جديدة',970,640,{size:52,t0:b+0.5,dur:0.5});
 const c=Q(45.28);
 popFigure(g,520,620,200,c-0.1,{arms:'up'});
 const bolt=mk('path',{d:'M540 330 L500 410 L535 410 L505 480 L585 385 L548 385 L575 330 Z',fill:GOLD,stroke:NAVY,'stroke-width':4,'stroke-linejoin':'round'},g);pop(bolt,c+0.3,0.3);
 wtext(g,'طريقة أسرع',520,700,{size:50,color:'#C98F00',t0:c+0.5,dur:0.5});
 const web=mk('g',{},g);[[1370,330,1420,370],[1530,330,1480,370],[1450,320,1450,372]].forEach(([x1,y1,x2,y2])=>mk('line',{x1,y1,x2,y2,stroke:'#8E9AAB','stroke-width':2},web));mk('circle',{cx:1450,cy:372,r:10,fill:'none',stroke:'#8E9AAB','stroke-width':2},web);fade(web,Q(47.0),0.4,1);
 const d=Q(48.6);
 const card=mk('g',{},g);const cr=mk('g',{transform:'rotate(12 760 360)'},card);mk('rect',{x:710,y:290,width:100,height:140,rx:10,fill:RED,stroke:NAVY,'stroke-width':4},cr);const ct=mk('text',{x:760,y:375,'text-anchor':'middle','font-family':"'Cairo'",'font-weight':800,'font-size':26,fill:'#fff'},cr);ct.textContent='عقاب';pop(card,d-0.1,0.3);
 R.line(g,690,280,830,440,d+0.3,0.12,{stroke:NAVY,strokeWidth:10});R.line(g,830,280,690,440,d+0.43,0.12,{stroke:NAVY,strokeWidth:10});
 wtext(g,'مش عقاب…',760,520,{size:52,color:RED,t0:d+0.3,dur:0.5});
 const e=Q(50.67);
 wtext(g,'نكتب الإجراء معاه ✓',1200,830,{size:62,color:'#2E7D32',t0:e,dur:1.0});
}
// ---------- S5: try tomorrow — the 15-minute test
const s5start=s4end+0.4, s5end=Q(64.39)+0.35;
{const g=scene(s5start,s5end);
 const a=Q(53.19);
 R.rect(g,360,170,1200,690,a-0.1,0.45,{fill:'#FFF9E8',fillStyle:'solid',stroke:GOLD,strokeWidth:7,roughness:0.7});
 wtext(g,'اختبار الربع ساعة',1060,270,{size:72,t0:a+0.3,dur:0.6});
 R.circle(g,560,280,130,a+0.35,0.3,{fill:'#fff',fillStyle:'solid',strokeWidth:5});
 const arc=mk('path',{d:'',fill:GOLD,opacity:0.85},g);const cnt=mk('text',{x:560,y:292,'text-anchor':'middle','font-family':"'Cairo'",'font-weight':800,'font-size':34,fill:NAVY},g);
 updaters.push(t=>{const p=clamp((t-(a+0.7))/(Q(63.5)-a-0.7));const ang=p*2*Math.PI;const r=58;const x=560+r*Math.sin(ang),y=280-r*Math.cos(ang);
   arc.setAttribute('d',p<=0?'':`M560 280 L560 ${280-r} A${r} ${r} 0 ${ang>Math.PI?1:0} 1 ${x} ${y} Z`);cnt.textContent=t<a+0.7?'':AR(Math.round(15*p));cnt.style.opacity=t<a+0.7?0:1});
 wtext(g,'اطبع إجراء واحد… واقف جنب اللي بيعمله',960,410,{font:'cairo',size:40,t0:Q(54.95),dur:1.6,noHand:true});
 const rows=[['بتتعمل؟','✓','#2E7D32',Q(59.84)],['بتتعمل بشكل مختلف؟','↔','#C98F00',Q(60.95)],['ولا مش موجودة أصلًا؟','✗',RED,Q(61.89)]];
 rows.forEach(([l,ic,c,t0],i)=>{const y=530+i*100;const G=mk('g',{},g);mk('rect',{x:1300,y:y-38,width:76,height:76,rx:12,fill:'#fff',stroke:c,'stroke-width':5},G);const it=mk('text',{x:1338,y:y+18,'text-anchor':'middle','font-family':"'Cairo'",'font-weight':800,'font-size':50,fill:c},G);it.textContent=ic;pop(G,t0-0.1,0.3);
   wtext(g,l,1260,y+18,{size:58,anchor:'start',color:c,t0:t0,dur:0.6})});
 wtext(g,'هتتفاجئ!',620,760,{size:72,color:'#C98F00',stroke:NAVY,sw:2.5,t0:Q(63.8)-0.05,dur:0.45});
 sparkle(g,800,690,0.6,Q(63.8)+0.4);
}
// ---------- S6: ISO 9001 7.5 + 8.1
const s6start=s5end+0.4, s6end=Q(80.52)+0.35;
{const g=scene(s6start,s6end);
 const a=Q(64.76);
 wtext(g,'ISO 9001',960,210,{font:'cairo',weight:800,size:80,ltr:true,t0:a-0.05,dur:0.5});
 wtext(g,'بيطلب ده بالظبط',960,285,{size:52,t0:a+0.6,dur:0.6});
 const b=Q(68.04);
 R.rect(g,1010,350,700,250,b-0.1,0.35,{fill:'#fff',fillStyle:'solid',strokeWidth:5});
 wtext(g,'7.5',1360,420,{font:'cairo',weight:800,size:52,color:'#C98F00',ltr:true,t0:b+0.25,dur:0.3});
 wtext(g,'معلومات موثّقة: مناسبة',1360,495,{font:'cairo',size:36,t0:Q(69.46),dur:1.2,noHand:true});
 wtext(g,'ومتحكّم في تحديثها',1360,555,{font:'cairo',size:36,t0:Q(71.4),dur:1.0,noHand:true});
 const c=Q(73.88);
 R.rect(g,210,350,700,250,c-0.1,0.35,{fill:'#fff',fillStyle:'solid',strokeWidth:5});
 wtext(g,'8.1',560,420,{font:'cairo',weight:800,size:52,color:'#C98F00',ltr:true,t0:c+0.25,dur:0.3});
 wtext(g,'العمليات تتنفّذ',560,495,{font:'cairo',size:36,t0:Q(75.32),dur:0.8,noHand:true});
 wtext(g,'زي ما اتخطّطت',560,555,{font:'cairo',size:36,t0:Q(76.4),dur:0.7,noHand:true});
 const d=Q(77.86);
 doc(g,1180,760,0.55,d-0.1,0.35);
 const eq=mk('text',{x:960,y:790,'text-anchor':'middle','font-family':"'Cairo'",'font-weight':800,'font-size':90,fill:GOLD,stroke:NAVY,'stroke-width':3,'paint-order':'stroke'},g);eq.textContent='=';pop(eq,d+0.5,0.3);
 R.line(g,640,800,820,800,d+0.8,0.15,{strokeWidth:7});[680,740,790].forEach((x,i)=>popFigure(g,x,800,80,d+1.0+i*0.08,{arms:'down'}));
 wtext(g,'الورقة',1180,880,{size:44,t0:d+0.3,dur:0.3,noHand:true});wtext(g,'الأرض',730,880,{size:44,t0:d+1.2,dur:0.3,noHand:true});
}
// ---------- S7: the riddle (next episode)
const tCL=tCloseLogo;
{const g=scene(s6end+0.4,tCL-0.05,'fade');
 const a=Q(80.92);
 wtext(g,'موجود… ولا ممتاز؟',960,240,{size:96,t0:a,dur:0.9});
 const b=Q(85.87);
 wtext(g,'EFQM',960,360,{font:'cairo',weight:800,size:60,ltr:true,t0:b-0.05,dur:0.4});
 for(let i=0;i<5;i++){const x=720+i*120;R.rect(g,x-48,430,96,110,b+0.4+i*0.15,0.15,{fill:'#fff',fillStyle:'solid',strokeWidth:5,stroke:i===2?GOLD:NAVY});
   const q=mk('text',{x,y:510,'text-anchor':'middle','font-family':"'Cairo'",'font-weight':800,'font-size':60,fill:'#C98F00'},g);q.textContent='؟';pop(q,b+0.6+i*0.15,0.25)}
 R.path(g,'M700 600 L1220 600',Q(88.8),0.3,{strokeWidth:6});R.path(g,'M1190 580 L1222 600 L1190 620',Q(88.8)+0.3,0.06,{strokeWidth:6});
 R.path(g,'M1220 650 L700 650',Q(89.3),0.3,{strokeWidth:6});R.path(g,'M730 630 L698 650 L730 670',Q(89.3)+0.3,0.06,{strokeWidth:6});
 wtext(g,'بتتقري من الاتجاهين',960,730,{size:56,t0:Q(89.6),dur:0.7});
 const bub=mk('g',{},g);mk('path',{d:'M1420 640 h150 a24 24 0 0 1 24 24 v56 a24 24 0 0 1 -24 24 h-90 l-34 28 l4 -28 h-30 a24 24 0 0 1 -24 -24 v-56 a24 24 0 0 1 24 -24 z',fill:'#fff',stroke:NAVY,'stroke-width':5,'stroke-linejoin':'round'},bub);
 [1465,1495,1525].forEach(x=>mk('circle',{cx:x,cy:692,r:8,fill:GOLD},bub));pop(bub,Q(91.98)-0.1,0.35);
}
// ---------- S8: closing
{const g=scene(tCL,1e9);
 R.circle(g,L_E.x,L_E.y,460,tCL+0.05,0.55,{stroke:GOLD,strokeWidth:8,roughness:0.9});
 const a=tCL+0.5;
 wtext(g,'احفظ الحلقة 🔖',960,690,{font:'cairo',weight:800,size:44,color:'#C98F00',t0:a,dur:0.6,noHand:true});
 wtext(g,'',960,770,{size:68,t0:a+0.6,dur:1.1,spans:[['الحلقة الجاية: ',GOLD],['الكلمة اللي بتتقري من الاتجاهين',NAVY]]});
 R.line(g,760,812,920,812,a+1.75,0.1,{stroke:BURG,strokeWidth:4});R.line(g,1000,812,1160,812,a+1.85,0.1,{stroke:BURG,strokeWidth:4});
 const dia=mk('path',{d:'M960 800 L972 812 L960 824 L948 812Z',fill:GOLD},g);pop(dia,a+1.85,0.25);
 wtext(g,'تابعني على لينكدإن  ·  Modather Salama',960,875,{font:'cairo',size:38,t0:a+2.0,dur:0.95});
}
}
