function build(){
const Q=x=>x;
const AR=n=>String(n).replace(/\d/g,x=>'٠١٢٣٤٥٦٧٨٩'[x]);
const GREEN='#2E7D32', DGOLD='#C98F00', AMBER='#E08A00';
// ---- section tag (top-left) -------------------------------------------------
{const ui=document.getElementById('ui');const tg=mk('g',{},ui);const r=mk('rect',{x:50,y:46,rx:18,ry:18,height:52,width:200,fill:GOLD,stroke:NAVY,'stroke-width':3},tg);
 const tx=mk('text',{x:150,y:82,'text-anchor':'middle','font-family':"'Cairo'",'font-weight':800,'font-size':28,fill:NAVY,direction:'rtl'},tg);
 const SEC=[[2.4,'سؤال'],[Q(7.95),'القصة'],[Q(21.1),'الفكرة'],[Q(42.8),'المثال'],[Q(53.05),'جرّبها بكرة'],[Q(64.25),'المرجع'],[Q(75.55),'لغز الحلقة الجاية'],[Q(87.37)-0.35,'']];
 updaters.push(t=>{let cur=null,ts=0;for(const [a,l] of SEC){if(t>=a){cur=l;ts=a}}if(!cur){tg.style.opacity=0;return}
   tx.textContent=cur;const w=Math.max(160,cur.length*22+50);r.setAttribute('width',w);tx.setAttribute('x',50+w/2);tg.style.opacity=clamp((t-ts)/0.25)});}
function ctext(g,str,x,y,size,color,o={}){const t=mk('text',Object.assign({x,y,'text-anchor':'middle','font-family':"'Cairo'",'font-weight':800,'font-size':size,fill:color},o),g);t.textContent=str;return t}
function bubble(g,x,y,w,str,t0,o={}){const W=mk('g',{},g);const h=64,l=x-w/2;
  mk('path',{d:`M${l+20} ${y} h${w-40} a20 20 0 0 1 20 20 v${h-40} a20 20 0 0 1 -20 20 h${-(w/2-40)} l-20 26 l-8 -26 h${-(w/2-28)} a20 20 0 0 1 -20 -20 v${-(h-40)} a20 20 0 0 1 20 -20 z`,fill:o.fill||'#fff',stroke:o.stroke||NAVY,'stroke-width':4,'stroke-linejoin':'round'},W);
  ctext(W,str,x,y+43,o.size||32,o.color||NAVY,{direction:'rtl'});pop(W,t0,0.3);return W}
// ---------- S0: hook-first intro
{const g=scene(-1,2.3,'fade');
 wtext(g,'الكل مسؤول… ومحدّش مسؤول؟',960,150,{size:76,t0:0.02,dur:0.6,noHand:true});
 R.circle(g,L_C.x,L_C.y,600,0.0,0.6,{stroke:GOLD,strokeWidth:9,roughness:0.9});
 wtext(g,'مين يعمل إيه… ومين يعتمد؟',960,848,{size:72,t0:1.38,dur:0.8});
}
// ---------- S1: the riddle answer — RACI
const s1end=Q(7.84)+0.3;
{const g=scene(2.4,s1end);
 wtext(g,'لغز الحلقة اللي فاتت…',960,190,{size:62,t0:2.5,dur:0.6});
 const b=Q(3.81);
 'RACI'.split('').forEach((ch,i)=>{const x=780+i*120;R.rect(g,x-50,270,100,120,b-0.35+i*0.08,0.08,{fill:'#fff',fillStyle:'solid',strokeWidth:5,stroke:i===1?GOLD:NAVY,noHand:true});
   const W=mk('g',{},g);ctext(W,ch,x,360,78,NAVY,{direction:'ltr'});pop(W,b+0.05+i*0.1,0.25)});
 sparkle(g,1250,265,0.5,b+0.6);
 wtext(g,'أربع حروف',960,500,{size:56,color:DGOLD,t0:Q(4.6),dur:0.5});
 wtext(g,'مين بيعمل إيه…',960,620,{size:66,t0:Q(5.3),dur:0.8});
 wtext(g,'ومين بيقرّر',960,730,{size:72,color:BURG,t0:Q(6.93),dur:0.7});
}
// ---------- S2: the late shipment
const s2start=s1end+0.4, s2end=Q(20.92)+0.35;
{const g=scene(s2start,s2end);
 const a=Q(8.10);
 R.rect(g,840,160,240,150,a-0.1,0.35,{fill:'#F7E2B8',fillStyle:'solid',strokeWidth:5});R.line(g,840,215,1080,215,a+0.25,0.1,{strokeWidth:4,noHand:true});R.line(g,960,160,960,215,a+0.3,0.08,{strokeWidth:4,noHand:true});
 const clk=mk('g',{},g);mk('circle',{cx:1130,cy:180,r:42,fill:'#fff',stroke:RED,'stroke-width':5},clk);mk('path',{d:'M1130 180 L1130 152 M1130 180 L1150 192',stroke:RED,'stroke-width':5,'stroke-linecap':'round'},clk);pop(clk,a+0.6,0.3);
 wtext(g,'عميل مهم',960,370,{size:44,t0:a+0.8,dur:0.5});
 const P=[[1480,'المشتريات','إحنا طلبنا',10.15],[960,'المخزن','محدّش بلّغني',12.20],[440,'المالية','ماجاليش أعتمده',14.37]];
 P.forEach(([x,lab,say,t],i)=>{popFigure(g,x,740,190,Q(t)-0.25,{arms:i===0?'point':'down'});wtext(g,lab,x,810,{size:44,t0:Q(t),dur:0.4});
   bubble(g,x,440,300,say,Q(t)+0.5)});
 [1480,960,440].forEach((x,i)=>check(g,x+110,600,0.7,Q(16.98)+0.2+i*0.25,0.15,GREEN));
 const st=mk('g',{},g);const sr=mk('g',{transform:'rotate(-8 960 240)'},st);mk('rect',{x:820,y:200,width:280,height:80,rx:10,fill:'#fff','fill-opacity':0.92,stroke:RED,'stroke-width':6},sr);ctext(sr,'اتأخرت!',960,255,42,RED,{direction:'rtl'});pop(st,Q(18.6),0.3);events.push([Q(18.6),Q(18.9),'stamp']);
 wtext(g,'مين الغلطان؟',420,250,{size:70,color:RED,t0:Q(20.17)-0.1,dur:0.5,stroke:'#fff',sw:6});
}
// ---------- S3a: the gap — football with no positions
const s3start=s2end+0.4, s3end=Q(28.38)+0.35;
{const g=scene(s3start,s3end);
 wtext(g,'المشكلة في الفراغ اللي بينهم',960,165,{size:64,t0:Q(22.6),dur:0.9});
 const a=Q(24.43);
 const fld=mk('rect',{x:240,y:230,width:1440,height:600,rx:26,fill:'rgba(46,125,50,0.12)'},g);fade(fld,a-0.15,0.35,1);
 R.rect(g,240,230,1440,600,a-0.15,0.35,{stroke:GREEN,strokeWidth:5,roughness:0.7});
 R.line(g,960,230,960,830,a+0.2,0.15,{stroke:GREEN,strokeWidth:4,noHand:true});R.circle(g,960,530,170,a+0.3,0.2,{stroke:GREEN,strokeWidth:4,noHand:true});
 R.rect(g,240,430,70,200,a+0.5,0.2,{stroke:NAVY,strokeWidth:6});
 const b=Q(26.22);
 const ball=mk('g',{},g);mk('circle',{cx:1340,cy:560,r:22,fill:'#fff',stroke:NAVY,'stroke-width':4},ball);mk('path',{d:'M1332 552 l8 -6 l8 6 l-3 9 h-10 z',fill:NAVY},ball);pop(ball,b-0.1,0.25);
 [[1250,520],[1430,520],[1290,640],[1400,650],[1200,600],[1480,600]].forEach(([x,y],i)=>popFigure(g,x,y+60,110,b+0.1+i*0.08,{arms:i%2?'up':'down'}));
 const c=Q(27.68);
 R.path(g,'M640 760 Q420 760 330 640',c-0.1,0.3,{stroke:RED,strokeWidth:6});arrowHead(g,330,640,235,c+0.2,{stroke:RED});
 wtext(g,'الجون فاضي!',700,780,{size:54,color:RED,t0:c,dur:0.5,stroke:'#fff',sw:6});
}
function arrowHead(g,x,y,ang,t0,o={}){const a=ang*Math.PI/180,L=22;const p=(da)=>`${x-L*Math.cos(a+da)} ${y-L*Math.sin(a+da)}`;
  R.path(g,`M${p(0.5)} L${x} ${y} L${p(-0.5)}`,t0,0.06,Object.assign({strokeWidth:6,noHand:true},o))}
// ---------- S3b: the four letters
const s3bstart=s3end+0.4, s3bend=Q(42.70)+0.35;
{const g=scene(s3bstart,s3bend);
 wtext(g,'',960,165,{size:62,t0:Q(28.70)+0.2,dur:0.8,spans:[['RACI',DGOLD],[' بيسد الفراغ',NAVY]]});
 const C=[['R','المنفّذ','بيعمل الشغل',30.51],['A','المسؤول','واحد بس',32.51],['C','المستشار','قبل القرار',35.67],['I','المُبلَّغ','بعد القرار',37.28]];
 C.forEach(([L,n,d,t],i)=>{const x=420+i*360,t0=Q(t)-0.2;
   R.rect(g,x-150,230,300,330,t0,0.3,{fill:i===1?'#FFF4D6':'#fff',fillStyle:'solid',strokeWidth:5,stroke:i===1?GOLD:NAVY});
   const W=mk('g',{},g);ctext(W,L,x,345,96,i===1?DGOLD:NAVY,{direction:'ltr'});pop(W,t0+0.25,0.25);
   wtext(g,n,x,440,{size:54,t0:t0+0.35,dur:0.4,noHand:true});
   wtext(g,d,x,515,{font:'cairo',size:34,color:'#5B6B80',t0:t0+0.7,dur:0.5,noHand:true})});
 const b=Q(38.64);
 R.circle(g,780,395,420,b,0.4,{stroke:RED,strokeWidth:6,roughness:0.8});
 wtext(g,'كل مهمة ليها مسؤول واحد بس',960,700,{size:62,color:NAVY,t0:b+0.3,dur:1.0});
 const c=Q(41.35);
 wtext(g,'مش اتنين',1180,810,{size:52,color:RED,t0:c,dur:0.4});const x1=mk('g',{},g);ctext(x1,'✗',1340,815,56,RED);pop(x1,c+0.3,0.2);
 wtext(g,'ولا لجنة',740,810,{size:52,color:RED,t0:Q(42.09),dur:0.4});const x2=mk('g',{},g);ctext(x2,'✗',590,815,56,RED);pop(x2,Q(42.09)+0.3,0.2);
}
// ---------- S4: authority matrix — the approval stairs
const s4start=s3bend+0.4, s4end=Q(52.95)+0.35;
{const g=scene(s4start,s4end);
 const a=Q(42.96);
 wtext(g,'مصفوفة الصلاحيات',960,165,{size:66,t0:a-0.05,dur:0.7});
 wtext(g,'مين يعتمد لحد كام؟',1350,260,{font:'cairo',size:38,color:'#5B6B80',t0:Q(44.89),dur:0.8,noHand:true});
 R.line(g,520,760,1560,760,a+0.6,0.25,{strokeWidth:6});
 const b=Q(46.58);
 R.rect(g,1080,620,420,140,b-0.2,0.3,{fill:'#E9F1FB',fillStyle:'solid',strokeWidth:5});
 popFigure(g,1290,620,150,b+0.05,{arms:'down'});
 wtext(g,'مدير القسم',1290,440,{size:44,t0:b+0.2,dur:0.4});
 const t1=mk('g',{},g);ctext(t1,'حتى ٥٠ ألف',1290,710,40,NAVY,{direction:'rtl'});pop(t1,b+0.5,0.3);
 const c=Q(48.59);
 R.rect(g,580,450,500,310,c-0.2,0.3,{fill:'#FFF4D6',fillStyle:'solid',strokeWidth:5,stroke:GOLD});
 popFigure(g,830,450,150,c+0.05,{arms:'up'});
 wtext(g,'المدير العام',830,275,{size:44,color:DGOLD,t0:c+0.2,dur:0.4});
 const t2=mk('g',{},g);ctext(t2,'أكتر من ٥٠ ألف',830,620,40,NAVY,{direction:'rtl'});pop(t2,c+0.5,0.3);
 wtext(g,'محدّش يستنى',1290,860,{size:50,color:GREEN,t0:Q(50.42),dur:0.5,stroke:'#fff',sw:6});
 wtext(g,'ومحدّش يتجاوز',740,860,{size:50,color:GREEN,t0:Q(51.68),dur:0.6,stroke:'#fff',sw:6});
}
// ---------- S5: try tomorrow — the RACI grid
const s5start=s4end+0.4, s5end=Q(64.13)+0.35;
{const g=scene(s5start,s5end);
 const a=Q(53.19);
 R.rect(g,300,140,1320,740,a-0.15,0.45,{fill:'#FFF9E8',fillStyle:'solid',stroke:GOLD,strokeWidth:7,roughness:0.7});
 wtext(g,'جدول ريسي لعملية واحدة',960,225,{size:62,t0:a+0.25,dur:0.7});
 const X0=520,X1=1500,Y0=280,HR=70,RH=95,cols=[1130,885,640],sx=1377;
 const b=Q(56.24);
 R.rect(g,X0,Y0,X1-X0,HR+4*RH,b,0.4,{fill:'#fff',fillStyle:'solid',strokeWidth:4,noHand:true});
 [1255,1010,765].forEach((x,i)=>R.line(g,x,Y0,x,Y0+HR+4*RH,b+0.4+i*0.06,0.06,{strokeWidth:3,noHand:true}));
 for(let r=0;r<4;r++)R.line(g,X0,Y0+HR+r*RH,X1,Y0+HR+r*RH,b+0.6+r*0.06,0.06,{strokeWidth:3,noHand:true});
 const hd=mk('g',{},g);[['الخطوة',sx],['المشتريات',cols[0]],['المخزن',cols[1]],['المالية',cols[2]]].forEach(([s,x])=>ctext(hd,s,x,Y0+47,30,NAVY,{direction:'rtl'}));fade(hd,b+0.8,0.3,1);
 const steps=['طلب الشراء','الاعتماد','الاستلام','الشحن'];
 const st=mk('g',{},g);steps.forEach((s,r)=>ctext(st,s,sx,Y0+HR+r*RH+60,32,NAVY,{direction:'rtl'}));fade(st,Q(57.67),0.4,1);
 const M=[['R','I','A'],['C','','R'],['A','A','I'],['I','R','A']];
 const c=Q(58.72);let k=0;
 M.forEach((row,r)=>row.forEach((L,j)=>{if(!L)return;const W=mk('g',{},g);ctext(W,L,cols[j],Y0+HR+r*RH+66,52,L==='A'?DGOLD:NAVY,{direction:'ltr'});pop(W,c+k*0.1,0.2);k++}));
 const d=Q(60.32);
 const xr=mk('g',{},g);mk('circle',{cx:440,cy:Y0+HR+RH+48,r:36,fill:'#fff',stroke:RED,'stroke-width':5},xr);ctext(xr,'✗',440,Y0+HR+RH+66,46,RED);pop(xr,d+0.6,0.3);
 R.rect(g,X0+6,Y0+HR+RH+6,X1-X0-12,RH-12,d+0.2,0.3,{stroke:RED,strokeWidth:5,roughness:0.6,noHand:true});
 const e=Q(61.92);
 R.ellipse(g,1007,Y0+HR+2*RH+46,560,90,e,0.35,{stroke:AMBER,strokeWidth:6,roughness:0.7});
 const wr=mk('g',{},g);mk('circle',{cx:440,cy:Y0+HR+2*RH+48,r:36,fill:'#fff',stroke:AMBER,'stroke-width':5},wr);ctext(wr,'×٢',440,Y0+HR+2*RH+62,36,AMBER);pop(wr,e+0.3,0.3);
 wtext(g,'هنا سبب التأخير!',960,840,{size:58,color:DGOLD,stroke:NAVY,sw:2,t0:Q(62.87)-0.05,dur:0.6});
 sparkle(g,640,790,0.5,Q(62.87)+0.6);
}
// ---------- S6: ISO 9001 – 5.3
const s6start=s5end+0.4, s6end=Q(75.36)+0.35;
{const g=scene(s6start,s6end);
 const a=Q(64.40);
 wtext(g,'ISO 9001',960,200,{font:'cairo',weight:800,size:80,ltr:true,t0:a-0.05,dur:0.5});
 const n=mk('g',{},g);ctext(n,'5.3',960,300,60,DGOLD,{direction:'ltr'});pop(n,Q(65.8),0.3);
 wtext(g,'الأدوار · المسؤوليات · الصلاحيات',960,380,{font:'cairo',size:40,t0:Q(67.4),dur:1.6,noHand:true});
 [['تتحدد',1400,69.4],['تتبلّغ',960,70.35],['تكون مفهومة',520,71.2]].forEach(([s,x,t])=>{const t0=Q(t);R.rect(g,x-170,430,340,110,t0-0.15,0.25,{fill:'#fff',fillStyle:'solid',strokeWidth:5});
   wtext(g,s,x+15,505,{size:52,t0:t0,dur:0.4,noHand:true});check(g,x-120,485,0.55,t0+0.3,0.12,GREEN)});
 wtext(g,'مش كفاية تتكتب…',960,670,{size:56,color:'#5B6B80',t0:Q(72.26),dur:0.8});
 wtext(g,'لازم كل واحد يعرف دوره',960,790,{size:66,color:GREEN,t0:Q(74.13),dur:0.9});
}
// ---------- S7: the riddle (next episode)
const tCL=tCloseLogo;
{const g=scene(s6end+0.4,tCL-0.05,'fade');
 wtext(g,'الشركة ماشية صح؟',960,180,{size:76,t0:Q(77.15),dur:0.7});
 const a=Q(79.13);
 R.path(g,'M380 600 A220 220 0 0 1 820 600',a,0.4,{strokeWidth:7});
 [[-80,RED],[-40,AMBER],[0,GOLD],[40,'#7CB342'],[80,GREEN]].forEach(([d,c],i)=>{const an=(d-90)*Math.PI/180;R.line(g,600+190*Math.cos(an),600+190*Math.sin(an),600+215*Math.cos(an),600+215*Math.sin(an),a+0.4+i*0.05,0.05,{stroke:c,strokeWidth:6,noHand:true})});
 const nd=mk('line',{x1:600,y1:600,x2:600,y2:420,stroke:RED,'stroke-width':7,'stroke-linecap':'round'},g);const hub=mk('circle',{cx:600,cy:600,r:16,fill:NAVY},g);fade(hub,a+0.5,0.2,1);
 updaters.push(t=>{if(t<a+0.6){nd.style.opacity=0;return}nd.style.opacity=1;const ang=-60+Math.sin((t-a)*2.2)*35;nd.setAttribute('transform',`rotate(${ang} 600 600)`)});
 wtext(g,'عدّاد الفلوس بس',600,700,{size:52,t0:a+0.8,dur:0.6});
 const b=Q(82.11);
 R.rect(g,1000,300,380,380,b-0.1,0.35,{fill:'#fff',fillStyle:'solid',strokeWidth:6,stroke:GOLD});
 R.line(g,1190,300,1190,680,b+0.3,0.12,{strokeWidth:4,noHand:true});R.line(g,1000,490,1380,490,b+0.4,0.12,{strokeWidth:4,noHand:true});
 [[1095,420],[1285,420],[1095,610],[1285,610]].forEach(([x,y],i)=>{const q=mk('g',{},g);ctext(q,'؟',x,y,80,DGOLD);pop(q,b+0.6+i*0.15,0.25)});
 wtext(g,'أربع زوايا',1190,760,{size:56,color:DGOLD,t0:Q(82.8),dur:0.5});
 sparkle(g,1400,290,0.55,Q(84.0));
 const bub=mk('g',{},g);mk('path',{d:'M1500 640 h150 a24 24 0 0 1 24 24 v56 a24 24 0 0 1 -24 24 h-90 l-34 28 l4 -28 h-30 a24 24 0 0 1 -24 -24 v-56 a24 24 0 0 1 24 -24 z',fill:'#fff',stroke:NAVY,'stroke-width':5,'stroke-linejoin':'round'},bub);
 [1545,1575,1605].forEach(x=>mk('circle',{cx:x,cy:692,r:8,fill:GOLD},bub));pop(bub,Q(86.17)-0.1,0.35);
}
// ---------- S8: closing
{const g=scene(tCL,1e9);
 R.circle(g,L_E.x,L_E.y,460,tCL+0.05,0.55,{stroke:GOLD,strokeWidth:8,roughness:0.9});
 const a=tCL+0.5;
 wtext(g,'احفظ الحلقة 🔖',960,690,{font:'cairo',weight:800,size:44,color:DGOLD,t0:a,dur:0.6,noHand:true});
 wtext(g,'',960,770,{size:68,t0:a+0.6,dur:1.1,spans:[['الحلقة الجاية: ',GOLD],['بطاقة بأربع زوايا',NAVY]]});
 R.line(g,760,812,920,812,a+1.75,0.1,{stroke:BURG,strokeWidth:4});R.line(g,1000,812,1160,812,a+1.85,0.1,{stroke:BURG,strokeWidth:4});
 const dia=mk('path',{d:'M960 800 L972 812 L960 824 L948 812Z',fill:GOLD},g);pop(dia,a+1.85,0.25);
 wtext(g,'تابعني على لينكدإن  ·  Modather Salama',960,875,{font:'cairo',size:38,t0:a+2.0,dur:0.95});
}
}
