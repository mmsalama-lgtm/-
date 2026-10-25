function build(){
const Q=x=>x/1.07;
const AR=n=>String(n).replace(/\d/g,x=>'٠١٢٣٤٥٦٧٨٩'[x]);
const GREEN='#2E7D32', DGOLD='#C98F00';
// ---- section tag (top-left) -------------------------------------------------
{const ui=document.getElementById('ui');const tg=mk('g',{},ui);const r=mk('rect',{x:50,y:46,rx:18,ry:18,height:52,width:200,fill:GOLD,stroke:NAVY,'stroke-width':3},tg);
 const tx=mk('text',{x:150,y:82,'text-anchor':'middle','font-family':"'Cairo'",'font-weight':800,'font-size':28,fill:NAVY,direction:'rtl'},tg);
 const SEC=[[2.4,'سؤال'],[Q(10.7),'القصة'],[Q(32.2),'الفكرة'],[Q(48.9),'المثال'],[Q(59.2),'جرّبها بكرة'],[Q(77.0),'المرجع'],[Q(94.1),'لغز الحلقة الجاية'],[Q(105.64)-0.35,'']];
 updaters.push(t=>{let cur=null,ts=0;for(const [a,l] of SEC){if(t>=a){cur=l;ts=a}}if(!cur){tg.style.opacity=0;return}
   tx.textContent=cur;const w=Math.max(160,cur.length*22+50);r.setAttribute('width',w);tx.setAttribute('x',50+w/2);tg.style.opacity=clamp((t-ts)/0.25)});}
function doc(g,x,y,s,t0,dur,o={}){const q=a=>Object.assign({noHand:!!o.noHand},a);const G=mk('g',{transform:`translate(${x},${y}) scale(${s})`},g);
  R.rect(G,-90,-120,180,240,t0,dur*0.4,q({fill:o.fill||'#fff',fillStyle:'solid',strokeWidth:5}));
  [-80,-45,-10,25].forEach((yy,i)=>R.line(G,-60,yy,60,yy,t0+dur*0.4+i*dur*0.08,dur*0.08,q({strokeWidth:4,stroke:'#8E9AAB'})));
  return G}
function ctext(g,str,x,y,size,color,o={}){const t=mk('text',Object.assign({x,y,'text-anchor':'middle','font-family':"'Cairo'",'font-weight':800,'font-size':size,fill:color},o),g);t.textContent=str;return t}
function factory(g,x,y,t0,label){ // body bottom-centre at (x,y), ~300 wide
  R.rect(g,x-150,y-110,300,110,t0,0.3,{fill:'#E9F1FB',fillStyle:'solid',strokeWidth:5});
  R.path(g,`M${x-150} ${y-110} L${x-150} ${y-160} L${x-90} ${y-130} L${x-90} ${y-160} L${x-30} ${y-130} L${x-30} ${y-160} L${x+30} ${y-130} L${x+30} ${y-110}`,t0+0.3,0.3,{strokeWidth:5});
  R.rect(g,x+70,y-200,36,90,t0+0.55,0.15,{fill:'#C9CED6',fillStyle:'solid',strokeWidth:4});
  R.rect(g,x-20,y-60,40,60,t0+0.7,0.1,{strokeWidth:4,noHand:true});
  wtext(g,label,x,y+55,{size:44,t0:t0+0.75,dur:0.35});
}
function arrowHead(g,x,y,ang,t0,o={}){const a=ang*Math.PI/180,L=22;const p=(da)=>`${x-L*Math.cos(a+da)} ${y-L*Math.sin(a+da)}`;
  R.path(g,`M${p(0.5)} L${x} ${y} L${p(-0.5)}`,t0,0.06,Object.assign({strokeWidth:6,noHand:true},o))}
// ---------- S0: hook-first intro
{const g=scene(-1,2.3,'fade');
 wtext(g,'موجود… ولا ممتاز؟',960,150,{size:84,t0:0.02,dur:0.55,noHand:true});
 R.circle(g,L_C.x,L_C.y,600,0.0,0.6,{stroke:GOLD,strokeWidth:9,roughness:0.9});
 wtext(g,'',960,848,{size:76,t0:1.38,dur:0.8,spans:[['منطق ',NAVY],['RADAR',DGOLD]]});
}
// ---------- S1: the riddle answer — RADAR, both ways
const s1end=Q(10.44)+0.3;
{const g=scene(2.4,s1end);
 wtext(g,'لغز الحلقة اللي فاتت…',960,190,{size:62,t0:2.5,dur:0.6});
 const b=Q(4.22);
 'RADAR'.split('').forEach((ch,i)=>{const x=720+i*120;R.rect(g,x-50,260,100,120,b-0.3+i*0.08,0.08,{fill:'#fff',fillStyle:'solid',strokeWidth:5,stroke:i===2?GOLD:NAVY,noHand:true});
   const W=mk('g',{},g);ctext(W,ch,x,350,78,NAVY,{direction:'ltr'});pop(W,b+0.1+i*0.1,0.25)});
 sparkle(g,1290,250,0.5,b+0.75);
 const c=Q(5.39);
 R.path(g,'M700 440 L1220 440',c,0.3,{strokeWidth:6});arrowHead(g,1222,440,0,c+0.3);
 R.path(g,'M1220 490 L700 490',c+0.35,0.3,{strokeWidth:6});arrowHead(g,698,490,180,c+0.65);
 wtext(g,'بتتقري من الاتجاهين',960,580,{size:54,t0:c+0.7,dur:0.6});
 const d=Q(7.46);
 wtext(g,'موجود',1300,770,{size:80,color:'#8E9AAB',t0:d+0.3,dur:0.5});
 const ne=mk('g',{},g);ctext(ne,'≠',960,780,110,RED);pop(ne,Q(9.0),0.3);
 wtext(g,'ممتاز',620,770,{size:84,color:DGOLD,stroke:NAVY,sw:2,t0:Q(9.36),dur:0.5});
 sparkle(g,470,700,0.5,Q(9.36)+0.5);
}
// ---------- S2: two factories, same procedure
const s2start=s1end+0.4, s2end=Q(31.87)+0.35;
{const g=scene(s2start,s2end);
 const a=Q(10.90);
 factory(g,1450,330,a-0.1,'المصنع ١');
 factory(g,470,330,a+0.3,'المصنع ٢');
 wtext(g,'نفس إجراء',960,150,{size:50,t0:a+1.0,dur:0.4});
 wtext(g,'الصيانة الوقائية',960,220,{size:50,color:DGOLD,t0:a+1.4,dur:0.6});
 const b=Q(14.34);
 const aud=mk('g',{},g);const af=figure(aud,960,690,230,{arms:'point'});mk('rect',{x:40,y:-160,width:40,height:54,rx:4,fill:'#fff',stroke:NAVY,'stroke-width':4},af.G);pop(aud,b-0.1,0.35);
 wtext(g,'المراجع',960,760,{size:42,t0:b+0.3,dur:0.4});
 const bub=mk('g',{},g);mk('path',{d:'M840 300 h240 a22 22 0 0 1 22 22 v50 a22 22 0 0 1 -22 22 h-100 l-20 30 l-10 -30 h-110 a22 22 0 0 1 -22 -22 v-50 a22 22 0 0 1 22 -22 z',fill:'#fff',stroke:NAVY,'stroke-width':4,'stroke-linejoin':'round'},bub);
 ctext(bub,'عندكم إجراء؟',960,360,34,NAVY,{direction:'rtl'});pop(bub,Q(15.94)-0.1,0.3);
 // factory 1: only the file
 const c=Q(17.11);
 doc(g,1450,560,0.8,c-0.1,0.5);
 wtext(g,'في الملف',1450,740,{size:48,t0:c+0.5,dur:0.4});
 // factory 2: deployed, measured, revised
 const d=Q(21.50);
 [350,470,590].forEach((x,i)=>{R.rect(g,x-45,440,90,64,d+i*0.25,0.15,{fill:'#E9F1FB',fillStyle:'solid',strokeWidth:4,noHand:true});R.circle(g,x,472,34,d+0.1+i*0.25,0.08,{strokeWidth:3,noHand:true});check(g,x+40,440,0.55,d+0.2+i*0.25,0.15,GREEN)});
 const e=Q(23.45);
 R.line(g,300,750,300,540,e-0.1,0.15,{strokeWidth:4,noHand:true});R.line(g,300,750,560,750,e+0.05,0.15,{strokeWidth:4,noHand:true});
 [[340,80],[400,140],[460,110],[520,60]].forEach(([x,h],i)=>{const bar=mk('rect',{x:x-20,y:750-h,width:40,height:h,fill:i===1?RED:GOLD,stroke:NAVY,'stroke-width':3},g);fade(bar,e+0.25+i*0.15,0.2,1)});
 wtext(g,'الأعطال / شهر',430,800,{font:'cairo',size:26,t0:e+0.6,dur:0.5,noHand:true});
 const f=Q(25.36);
 const cal=mk('g',{},g);mk('rect',{x:620,y:560,width:120,height:110,rx:10,fill:'#fff',stroke:NAVY,'stroke-width':4},cal);mk('rect',{x:620,y:560,width:120,height:30,rx:8,fill:NAVY},cal);
 ctext(cal,'×٢',680,650,48,DGOLD);pop(cal,f,0.3);
 wtext(g,'اتعدّل',680,715,{size:36,t0:f+0.4,dur:0.4,noHand:true});
 const h=Q(28.27);
 check(g,1580,560,0.6,h,0.15,GREEN);check(g,240,480,0.6,h+0.25,0.15,GREEN);
 wtext(g,'مين فيهم ممتاز بجد؟',960,862,{size:66,color:RED,t0:Q(30.04)-0.05,dur:0.7});
}
// ---------- S3a: RADAR works like a GPS
const s3start=s2end+0.4, s3end=Q(40.16)+0.35;
{const g=scene(s3start,s3end);
 wtext(g,'',960,170,{size:66,t0:Q(32.39)-0.05,dur:0.8,spans:[['رادار شغال زي الـ ',NAVY],['GPS',DGOLD]]});
 const map=mk('rect',{x:240,y:240,width:1440,height:600,rx:30,fill:'#EEF2F7'},g);fade(map,Q(32.6),0.4,1);
 const a=Q(34.60);
 const pin=mk('g',{},g);mk('path',{d:'M400 420 C400 420 340 350 340 315 A60 60 0 1 1 460 315 C460 350 400 420 400 420 Z',fill:RED,stroke:NAVY,'stroke-width':4},pin);mk('circle',{cx:400,cy:312,r:20,fill:'#fff'},pin);pop(pin,a,0.35);
 wtext(g,'الوجهة',400,480,{size:44,color:RED,t0:a+0.3,dur:0.4});
 const route='M1580 760 C1400 760 1300 620 1150 620 S 900 700 760 560 S 560 420 420 430';
 const b=Q(35.82);const rd=dashed(g,route,b,0.8,{color:NAVY,sw:10,dash:'24 16'});
 wtext(g,'الطريق',1150,580,{size:42,t0:b+0.4,dur:0.4});
 const c=Q(37.01);
 const car=mk('g',{},g);const ci=mk('g',{},car);mk('rect',{x:-45,y:-30,width:90,height:38,rx:10,fill:GOLD,stroke:NAVY,'stroke-width':4},ci);mk('rect',{x:-25,y:-50,width:50,height:24,rx:6,fill:'#fff',stroke:NAVY,'stroke-width':4},ci);
 mk('circle',{cx:-25,cy:10,r:11,fill:NAVY},ci);mk('circle',{cx:25,cy:10,r:11,fill:NAVY},ci);
 const rp2=mk('path',{d:route,fill:'none'},g);const RL=rp2.getTotalLength();
 const wrongAt=Q(38.22), back=Q(39.46);
 updaters.push(t=>{if(t<c){car.style.opacity=0;return}car.style.opacity=1;
   let p=clamp((t-c)/(wrongAt-c))*0.45;
   let P=rp2.getPointAtLength(RL*p);let ox=0,oy=0;
   if(t>wrongAt){const k=clamp((t-wrongAt)/0.6)*(1-clamp((t-back)/0.5));ox=0;oy=110*k}
   if(t>back+0.5){p=0.45+clamp((t-back-0.5)/1.6)*0.5;P=rp2.getPointAtLength(RL*p)}
   car.setAttribute('transform',`translate(${P.x+ox},${P.y-22+oy})`)});
 wtext(g,'نسوق فعلًا',1500,840,{size:40,t0:c+0.2,dur:0.4,noHand:true});
 R.path(g,'M1150 640 C1150 700 1120 740 1060 760',wrongAt,0.3,{stroke:RED,strokeWidth:6});
 const x1=mk('g',{},g);ctext(x1,'✗',1020,790,60,RED);pop(x1,wrongAt+0.3,0.25);
 const d=back;
 const rcw=mk('g',{},g);const rc=mk('g',{},rcw);mk('path',{d:'M860 360 A50 50 0 1 1 830 310',fill:'none',stroke:DGOLD,'stroke-width':8,'stroke-linecap':'round'},rc);mk('path',{d:'M812 296 L834 306 L826 330',fill:'none',stroke:DGOLD,'stroke-width':8,'stroke-linecap':'round','stroke-linejoin':'round'},rc);pop(rcw,d-0.1,0.3);
 updaters.push(t=>{if(t>d)rc.setAttribute('transform',`rotate(${(t-d)*200} 815 355)`)});
 wtext(g,'إعادة حساب',815,460,{size:46,color:DGOLD,t0:d,dur:0.5});
}
// ---------- S3b: the five-letter loop
const s3bstart=s3end+0.4, s3bend=Q(48.68)+0.35;
{const g=scene(s3bstart,s3bend);
 const CX=960,CY=470,RR=255;
 const nodes=[['R','النتيجة',40.68],['A','المنهج',41.49],['D','التطبيق',42.34],['A','التقييم',43.23],['R','التحسين',44.16]];
 const pos=nodes.map((_,i)=>{const an=i*72*Math.PI/180;return [CX+RR*Math.sin(an),CY-RR*Math.cos(an),an]});
 const nodeG=[];
 nodes.forEach(([L,lab,t],i)=>{const [x,y,an]=pos[i];const t0=Q(t)-0.15;
   const W=mk('g',{},g);mk('circle',{cx:x,cy:y,r:60,fill:i===0?GOLD:'#fff',stroke:NAVY,'stroke-width':5},W);ctext(W,L,x,y+24,64,NAVY,{direction:'ltr'});pop(W,t0,0.3);nodeG.push(W);
   const lr=i===0?RR+105:RR+125;const lx=CX+lr*Math.sin(an),ly=CY-lr*Math.cos(an)+(i===0?10:16);
   wtext(g,lab,lx,ly,{size:46,color:i===0?DGOLD:NAVY,t0:t0+0.1,dur:0.35,noHand:true});
   // arc to next node
   const a1=an+0.3,a2=an+72*Math.PI/180-0.3;const p1=[CX+RR*Math.sin(a1),CY-RR*Math.cos(a1)],p2=[CX+RR*Math.sin(a2),CY-RR*Math.cos(a2)];
   const ta=Q(nodes[(i+1)%5][2])-0.35+(i===4?0.9:0);
   R.path(g,`M${p1[0]} ${p1[1]} A${RR} ${RR} 0 0 1 ${p2[0]} ${p2[1]}`,ta,0.25,{strokeWidth:5,stroke:DGOLD,noHand:true});
   const ang=(a2*180/Math.PI);arrowHead(g,p2[0],p2[1],ang,ta+0.25,{stroke:DGOLD,strokeWidth:5});
 });
 const e=Q(45.28);
 doc(g,CX,CY-20,0.55,e-0.1,0.4);
 R.circle(g,pos[1][0],pos[1][1],150,Q(46.87)-0.1,0.3,{stroke:RED,strokeWidth:6});
 dashed(g,`M${CX+55} ${CY-30} L${pos[1][0]-70} ${pos[1][1]+15}`,Q(46.87),0.3,{color:RED,sw:5,dash:'12 10'});
 wtext(g,'حرف واحد من ٥',CX,CY+120,{size:48,color:RED,t0:Q(47.1),dur:0.7,stroke:'#fff',sw:6});
}
// ---------- S4: example — open line vs closed loop
const s4start=s3bend+0.4, s4end=Q(58.89)+0.35;
{const g=scene(s4start,s4end);
 const a=Q(49.08);
 dashed(g,'M960 170 L960 840',a-0.2,0.4,{color:'#C9CED6',sw:5,dash:'14 14'});
 wtext(g,'المصنع ١',1400,200,{size:56,t0:a,dur:0.45});
 doc(g,1400,400,0.75,a+0.5,0.5);
 wtext(g,'طريقة مكتوبة',1400,570,{size:46,t0:Q(50.5),dur:0.6});
 [['من غير هدف',Q(51.45)],['ولا قياس',Q(52.35)]].forEach(([l,t],i)=>{const y=660+i*85;wtext(g,l,1440,y,{size:46,color:RED,t0:t,dur:0.5});const X=mk('g',{},g);ctext(X,'✗',1240,y+4,54,RED);pop(X,t+0.3,0.25)});
 const b=Q(53.43);
 wtext(g,'المصنع ٢',560,200,{size:56,t0:b-0.1,dur:0.45});
 const CX=560,CY=480,RR=170;
 R.circle(g,CX,CY,RR*2,b+0.3,0.6,{stroke:GREEN,strokeWidth:7,roughness:0.6});
 const spin=mk('g',{},g);[0,120,240].forEach(d=>{const a=d*Math.PI/180;const x=CX+RR*Math.sin(a),y=CY-RR*Math.cos(a);const G=mk('g',{transform:`translate(${x},${y}) rotate(${d})`},spin);mk('path',{d:'M-14 -16 L12 0 L-14 16',fill:'none',stroke:GREEN,'stroke-width':7,'stroke-linecap':'round','stroke-linejoin':'round'},G)});
 fade(spin,b+0.9,0.3,1);updaters.push(t=>{if(t>b+0.9)spin.setAttribute('transform',`rotate(${(t-b-0.9)*45} ${CX} ${CY})`)});
 const L=[['هدف',0,Q(55.05)],['طبّق',90,Q(56.80)],['قاس',180,Q(57.59)],['حسّن',270,Q(58.32)]];
 L.forEach(([l,d,t])=>{const a=d*Math.PI/180;const x=CX+95*Math.sin(a),y=CY-95*Math.cos(a)+16;const W=mk('g',{},g);ctext(W,l,x,y,40,NAVY,{direction:'rtl'});pop(W,t-0.05,0.25)});
 wtext(g,'قفل الدايرة ✓',560,760,{size:54,color:GREEN,t0:Q(53.8),dur:0.6});
}
// ---------- S5: try tomorrow — the five questions
const s5start=s4end+0.4, s5end=Q(76.68)+0.35;
{const g=scene(s5start,s5end);
 const a=Q(59.42);
 R.rect(g,300,150,1320,720,a-0.1,0.45,{fill:'#FFF9E8',fillStyle:'solid',stroke:GOLD,strokeWidth:7,roughness:0.7});
 wtext(g,'اختبار الخمس أسئلة',960,245,{size:68,t0:a+0.3,dur:0.6});
 wtext(g,'ممارسة واحدة… زي اجتماع الصبح',960,320,{font:'cairo',size:36,color:'#5B6B80',t0:Q(60.6),dur:1.4,noHand:true});
 const rows=[['عاوزين نوصل لإيه؟',65.03],['ليه الطريقة دي بالذات؟',66.51],['متطبّقة فين… وفين لأ؟',68.16],['بنقيسها إزاي؟',70.28],['آخر مرة حسّنّاها إمتى؟',71.52]];
 rows.forEach(([l,t],i)=>{const y=410+i*86;const t0=Q(t);const W=mk('g',{},g);mk('circle',{cx:1500,cy:y-14,r:30,fill:GOLD,stroke:NAVY,'stroke-width':4},W);ctext(W,AR(i+1),1500,y-2,32,NAVY);pop(W,t0-0.15,0.25);
   wtext(g,l,1450,y,{size:50,anchor:'start',t0:t0,dur:0.55})});
 [0,1,2,3].forEach(i=>check(g,520,410+i*86-14,0.6,Q(73.65)-0.3+i*0.07,0.1,GREEN));
 const xb=mk('g',{},g);mk('rect',{x:482,y:410+4*86-52,width:76,height:76,rx:12,fill:'#fff',stroke:RED,'stroke-width':5},xb);ctext(xb,'✗',520,410+4*86+4,52,RED);pop(xb,Q(73.9),0.3);
 wtext(g,'هنا مكان التحسين!',960,838,{size:60,color:DGOLD,stroke:NAVY,sw:2,t0:Q(75.33)-0.05,dur:0.6});
 sparkle(g,620,790,0.55,Q(75.33)+0.55);
}
// ---------- S6: the reference — EFQM RADAR
const s6start=s5end+0.4, s6end=Q(93.82)+0.35;
{const g=scene(s6start,s6end);
 const a=Q(77.15);
 wtext(g,'EFQM',960,190,{font:'cairo',weight:800,size:78,ltr:true,t0:a-0.05,dur:0.5});
 const b=Q(79.70);
 // balance scale
 R.line(g,430,300,430,560,b-0.1,0.2,{strokeWidth:7});R.path(g,'M360 590 L500 590 L430 555 Z',b+0.1,0.15,{strokeWidth:6,fill:NAVY,fillStyle:'solid'});
 R.line(g,280,320,580,320,b+0.25,0.2,{strokeWidth:7});
 [[280,320],[580,320]].forEach(([x,y],i)=>{R.line(g,x,y,x-40,y+110,b+0.45+i*0.1,0.08,{strokeWidth:3,noHand:true});R.line(g,x,y,x+40,y+110,b+0.5+i*0.1,0.08,{strokeWidth:3,noHand:true});
   R.path(g,`M${x-55} ${y+110} Q${x} ${y+160} ${x+55} ${y+110} Z`,b+0.6+i*0.1,0.12,{strokeWidth:5,fill:GOLD,fillStyle:'solid',noHand:true})});
 wtext(g,'RADAR',430,670,{font:'cairo',weight:800,size:54,color:DGOLD,ltr:true,t0:b+0.3,dur:0.4});
 wtext(g,'الميزان لكل معيار',430,735,{font:'cairo',size:34,t0:Q(80.8),dur:0.9,noHand:true});
 const cards=[['المنهج','سليم ومتكامل',82.66],['التطبيق','منظّم',85.31],['التحسين','قياس وتعلّم',86.84]];
 cards.forEach(([h,s,t],i)=>{const y=270+i*130;const t0=Q(t);R.rect(g,760,y,860,104,t0-0.15,0.3,{fill:'#fff',fillStyle:'solid',strokeWidth:5});
   wtext(g,h,1580,y+68,{size:50,anchor:'start',color:DGOLD,t0:t0+0.1,dur:0.4,noHand:true});
   wtext(g,s,1330,y+66,{font:'cairo',size:42,anchor:'start',t0:t0+0.35,dur:0.6,noHand:true})});
 const c=Q(89.45);
 doc(g,1590,712,0.33,c-0.1,0.3);
 wtext(g,'موجود = ورقة',1500,738,{anchor:'start',size:50,color:'#5B6B80',t0:c+0.3,dur:0.6});
 const d=Q(91.52);
 const lp=mk('g',{},g);mk('circle',{cx:1590,cy:822,r:38,fill:'none',stroke:GREEN,'stroke-width':7},lp);mk('path',{d:'M1576 774 L1598 784 L1576 796',fill:'none',stroke:GREEN,'stroke-width':7,'stroke-linecap':'round','stroke-linejoin':'round'},lp);
 const lpw=mk('g',{},g);lpw.appendChild(lp);pop(lpw,d-0.1,0.3);updaters.push(t=>{if(t>d)lp.setAttribute('transform',`rotate(${(t-d)*120} 1590 822)`)});
 wtext(g,'ممتاز = دايرة بتلف',1500,840,{anchor:'start',size:52,color:GREEN,t0:d+0.15,dur:0.7});
}
// ---------- S7: the riddle (next episode)
const tCL=tCloseLogo;
{const g=scene(s6end+0.4,tCL-0.05,'fade');
 const a=Q(94.25);
 wtext(g,'الكل مسؤول…',960,190,{size:80,t0:a,dur:0.6});
 [660,860,1060,1260].forEach((x,i)=>{popFigure(g,x,470,150,Q(95.55)+i*0.12,{arms:'up'});const W=mk('g',{},g);ctext(W,'أنا!',x,285,36,DGOLD,{direction:'rtl'});pop(W,Q(95.9)+i*0.15,0.25)});
 wtext(g,'ومحدّش مسؤول؟',960,580,{size:70,color:RED,t0:Q(97.63),dur:0.7});
 const b=Q(99.77);
 for(let i=0;i<4;i++){const x=780+i*120;R.rect(g,x-48,630,96,110,b+0.4+i*0.15,0.15,{fill:'#fff',fillStyle:'solid',strokeWidth:5,stroke:NAVY});
   const q=mk('text',{x,y:710,'text-anchor':'middle','font-family':"'Cairo'",'font-weight':800,'font-size':60,fill:DGOLD},g);q.textContent='؟';pop(q,b+0.6+i*0.15,0.25)}
 const c=Q(101.46);
 R.rect(g,280,630,330,180,c,0.3,{fill:'#fff',fillStyle:'solid',strokeWidth:5});
 [690,750].forEach((y,i)=>R.line(g,280,y,610,y,c+0.3+i*0.08,0.08,{strokeWidth:3,noHand:true}));
 [390,500].forEach((x,i)=>R.line(g,x,630,x,810,c+0.45+i*0.08,0.08,{strokeWidth:3,noHand:true}));
 wtext(g,'جدول واحد',445,860,{size:40,t0:c+0.6,dur:0.4,noHand:true});
 const bub=mk('g',{},g);mk('path',{d:'M1420 640 h150 a24 24 0 0 1 24 24 v56 a24 24 0 0 1 -24 24 h-90 l-34 28 l4 -28 h-30 a24 24 0 0 1 -24 -24 v-56 a24 24 0 0 1 24 -24 z',fill:'#fff',stroke:NAVY,'stroke-width':5,'stroke-linejoin':'round'},bub);
 [1465,1495,1525].forEach(x=>mk('circle',{cx:x,cy:692,r:8,fill:GOLD},bub));pop(bub,Q(104.36)-0.1,0.35);
}
// ---------- S8: closing
{const g=scene(tCL,1e9);
 R.circle(g,L_E.x,L_E.y,460,tCL+0.05,0.55,{stroke:GOLD,strokeWidth:8,roughness:0.9});
 const a=tCL+0.5;
 wtext(g,'احفظ الحلقة 🔖',960,690,{font:'cairo',weight:800,size:44,color:DGOLD,t0:a,dur:0.6,noHand:true});
 wtext(g,'',960,770,{size:68,t0:a+0.6,dur:1.1,spans:[['الحلقة الجاية: ',GOLD],['أربع حروف بتقول مين المسؤول',NAVY]]});
 R.line(g,760,812,920,812,a+1.75,0.1,{stroke:BURG,strokeWidth:4});R.line(g,1000,812,1160,812,a+1.85,0.1,{stroke:BURG,strokeWidth:4});
 const dia=mk('path',{d:'M960 800 L972 812 L960 824 L948 812Z',fill:GOLD},g);pop(dia,a+1.85,0.25);
 wtext(g,'تابعني على لينكدإن  ·  Modather Salama',960,875,{font:'cairo',size:38,t0:a+2.0,dur:0.95});
}
}
