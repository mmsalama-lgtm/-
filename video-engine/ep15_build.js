function build(){
const Q=x=>x;
const AR=n=>String(n).replace(/\d/g,x=>'٠١٢٣٤٥٦٧٨٩'[x]);
const GREEN='#2E7D32', DGOLD='#C98F00', GRAY='#5B6B80', BROWN='#8B5A2B', SKIN='#EBCB9F';
// ---- section tag (top-left) -------------------------------------------------
{const ui=document.getElementById('ui');const tg=mk('g',{},ui);const r=mk('rect',{x:50,y:46,rx:18,ry:18,height:52,width:200,fill:GOLD,stroke:NAVY,'stroke-width':3},tg);
 const tx=mk('text',{x:150,y:82,'text-anchor':'middle','font-family':"'Cairo'",'font-weight':800,'font-size':28,fill:NAVY,direction:'rtl'},tg);
 const SEC=[[2.4,'يوم في حياة مدير'],[Q(24.4),'الفكرة'],[Q(38.2),'الفرق'],[Q(49.3),'قبل ما تفوّض'],[Q(57.6),'جرّبها بكرة'],[Q(66.0),'المرجع'],[Q(77.9),'لغز الحلقة الجاية'],[Q(88.33)-0.35,'']];
 updaters.push(t=>{let cur=null,ts=0;for(const [a,l] of SEC){if(t>=a){cur=l;ts=a}}if(!cur){tg.style.opacity=0;return}
   tx.textContent=cur;const w=Math.max(160,cur.length*22+50);r.setAttribute('width',w);tx.setAttribute('x',50+w/2);tg.style.opacity=clamp((t-ts)/0.25)});}
function ctext(g,str,x,y,size,color,o={}){const t=mk('text',Object.assign({x,y,'text-anchor':'middle','font-family':"'Cairo'",'font-weight':800,'font-size':size,fill:color,direction:'rtl'},o),g);t.textContent=str;return t}
function arrowHead(g,x,y,ang,t0,o={}){const a=ang*Math.PI/180,L=22;const p=(da)=>`${x-L*Math.cos(a+da)} ${y-L*Math.sin(a+da)}`;
  R.path(g,`M${p(0.5)} L${x} ${y} L${p(-0.5)}`,t0,0.06,Object.assign({strokeWidth:6,noHand:true},o))}
function bubble(g,x,y,w,str,t0,o={}){const W=mk('g',{},g);const h=70,l=x-w/2;
  mk('path',{d:`M${l+20} ${y} h${w-40} a20 20 0 0 1 20 20 v${h-40} a20 20 0 0 1 -20 20 h${-(w/2-40)} l-20 26 l-8 -26 h${-(w/2-28)} a20 20 0 0 1 -20 -20 v${-(h-40)} a20 20 0 0 1 20 -20 z`,fill:o.fill||'#fff',stroke:o.stroke||NAVY,'stroke-width':4,'stroke-linejoin':'round'},W);
  ctext(W,str,x,y+47,o.size||34,o.color||NAVY);pop(W,t0,0.3);return W}
// cartoon monkey head; returns {W (pop wrapper), M (movable group)}
function monkey(g,x,y,s,t0){const W=mk('g',{},g);const M=mk('g',{transform:`translate(${x},${y})`},W);const G=mk('g',{transform:`scale(${s})`},M);
  mk('circle',{cx:-30,cy:0,r:14,fill:BROWN,stroke:NAVY,'stroke-width':3},G);mk('circle',{cx:30,cy:0,r:14,fill:BROWN,stroke:NAVY,'stroke-width':3},G);
  mk('circle',{cx:0,cy:0,r:30,fill:BROWN,stroke:NAVY,'stroke-width':3},G);mk('ellipse',{cx:0,cy:8,rx:21,ry:17,fill:SKIN},G);
  mk('circle',{cx:-9,cy:-6,r:4,fill:NAVY},G);mk('circle',{cx:9,cy:-6,r:4,fill:NAVY},G);mk('path',{d:'M-8 13 Q0 19 8 13',fill:'none',stroke:NAVY,'stroke-width':3,'stroke-linecap':'round'},G);
  if(t0!=null)pop(W,t0,0.3);return {W,M}}
// ---------- S0: hook-first intro
{const g=scene(-1,2.3,'fade');
 wtext(g,'«سيبها عليّا…»',960,150,{size:84,t0:0.02,dur:0.55,noHand:true});
 R.circle(g,L_C.x,L_C.y,600,0.0,0.6,{stroke:GOLD,strokeWidth:9,roughness:0.9});
 wtext(g,'التفويض الذكي',960,848,{size:80,t0:1.38,dur:0.7});
}
// ---------- S1: a day in the life — the monkeys pile up
const s1end=Q(24.11)+0.3;
{const g=scene(2.4,s1end);
 // clock
 const CX=380,CY=330;
 R.circle(g,CX,CY,240,2.45,0.4,{fill:'#fff',fillStyle:'solid',strokeWidth:6});
 for(let i=0;i<12;i++){const a=i*Math.PI/6;R.line(g,CX+100*Math.sin(a),CY-100*Math.cos(a),CX+110*Math.sin(a),CY-110*Math.cos(a),2.8+i*0.02,0.02,{strokeWidth:i%3?3:6,noHand:true})}
 const hh=mk('line',{x1:CX,y1:CY,x2:CX,y2:CY-60,stroke:NAVY,'stroke-width':10,'stroke-linecap':'round'},g);const mh=mk('line',{x1:CX,y1:CY,x2:CX,y2:CY-92,stroke:RED,'stroke-width':6,'stroke-linecap':'round'},g);mk('circle',{cx:CX,cy:CY,r:10,fill:NAVY},g);
 const lbl=ctext(g,'',CX,CY+175,48,NAVY);
 const K=[[0,270,'الساعة ٩'],[Q(12.58),300,'الساعة ١٠'],[Q(16.80),360,'الساعة ١٢'],[Q(19.85),510,'آخر اليوم']];
 updaters.push(t=>{let i=0;for(let k=0;k<K.length;k++)if(t>=K[k][0])i=k;const nx=K[i+1];let ang=K[i][1];
   if(i>0){const p=clamp((t-K[i][0])/0.8);ang=K[i-1][1]+(K[i][1]-K[i-1][1])*(p<1?(1-Math.pow(1-p,3)):1)}
   hh.setAttribute('transform',`rotate(${ang} ${CX} ${CY})`);mh.setAttribute('transform',`rotate(${ang*12} ${CX} ${CY})`);lbl.textContent=K[i][2];
   const vis=t>2.9;hh.style.opacity=mh.style.opacity=lbl.style.opacity=vis?1:0});
 // manager at desk
 const MX=1000;
 R.rect(g,820,600,360,40,Q(3.16),0.25,{fill:'#F7E2B8',fillStyle:'solid',strokeWidth:5});R.line(g,850,640,850,760,Q(3.4),0.08,{strokeWidth:5,noHand:true});R.line(g,1150,640,1150,760,Q(3.45),0.08,{strokeWidth:5,noHand:true});
 popFigure(g,MX,760,230,Q(3.16)+0.1,{arms:'down'});
 wtext(g,'المدير',MX,820,{size:42,t0:Q(3.7),dur:0.4,noHand:true});
 // employees
 const E=[[1480,5.08],[1630,13.65],[1780,17.86]];
 E.forEach(([x,t],i)=>{popFigure(g,x,760,170,Q(t)-0.1,{arms:i===0?'point':'down'});const ex=mk('g',{},g);ctext(ex,'!',x,560,70,RED);pop(ex,Q(t)+0.4,0.25);fadeOut(ex,Q(21.9),0.25)});
 bubble(g,1480,380,330,'عندنا مشكلة!',Q(7.48)-0.1,{color:RED});
 bubble(g,760,330,300,'سيبها عليّا',Q(10.46)-0.1,{fill:'#FFF4D6',stroke:GOLD});
 const cnt=mk('g',{},g);const cr=mk('circle',{cx:930,cy:300,r:30,fill:RED},cnt);const ct=ctext(cnt,'',930,313,32,'#fff');
 updaters.push(t=>{const n=t>=Q(18.78)?3:t>=Q(15.82)?2:0;cnt.style.opacity=n?1:0;ct.textContent=n?'×'+AR(n):''});
 // monkeys onto the manager
 const MK=[[MX+55,560,Q(10.9)],[MX-55,560,Q(15.95)],[MX,470,Q(18.9)],[MX-110,500,Q(20.1)],[MX+110,500,Q(20.3)],[MX-55,420,Q(20.5)],[MX+55,420,Q(20.7)],[MX,370,Q(20.9)]];
 MK.forEach(([x,y,t],i)=>monkey(g,x,y,i<3?1:0.85,t));
 wtext(g,'غرقان!',1240,520,{size:60,color:RED,t0:Q(21.0),dur:0.5,stroke:'#fff',sw:6});
 const w=Q(22.13);
 E.forEach(([x],i)=>{const d=mk('g',{},g);ctext(d,'…',x,520,64,GRAY);pop(d,w+i*0.15,0.25)});
 wtext(g,'والفريق مستني',1630,860,{size:48,color:GRAY,t0:w+0.3,dur:0.6});
}
// ---------- S2: who's got the monkey?
const s2start=s1end+0.4, s2end=Q(38.08)+0.35;
{const g=scene(s2start,s2end);
 wtext(g,'Harvard Business Review · 1974',960,140,{font:'cairo',weight:700,size:40,color:DGOLD,ltr:true,t0:Q(24.5),dur:0.9,noHand:true});
 wtext(g,'Oncken & Wass',960,205,{font:'cairo',weight:800,size:52,ltr:true,t0:Q(26.59),dur:0.6,noHand:true});
 wtext(g,'مين شايل القرد؟',960,320,{size:92,t0:Q(30.13)-0.05,dur:0.8});
 popFigure(g,1400,800,210,Q(31.3),{arms:'down'});wtext(g,'الموظف',1400,860,{size:42,t0:Q(31.5),dur:0.4,noHand:true});
 popFigure(g,560,800,210,Q(31.4),{arms:'down'});wtext(g,'إنت',560,860,{size:42,t0:Q(31.6),dur:0.4,noHand:true});
 const m=monkey(g,1460,660,1.1,Q(32.52)-0.1);
 const lb=mk('g',{},g);ctext(lb,'مشكلة',1590,630,38,BROWN);pop(lb,Q(32.6),0.25);
 bubble(g,560,420,300,'سيبها عليّا',Q(34.12)-0.1,{fill:'#FFF4D6',stroke:GOLD});
 const j0=Q(35.06),j1=j0+1.1;
 dashed(g,'M1460 630 Q1040 340 620 630',j0,1.1,{color:BROWN,sw:5,dash:'14 12'});
 updaters.push(t=>{const p=clamp((t-j0)/(j1-j0));const e=p<0.5?2*p*p:1-Math.pow(-2*p+2,2)/2;const x=(1-e)*(1-e)*1460+2*(1-e)*e*1040+e*e*620,y=(1-e)*(1-e)*660+2*(1-e)*e*370+e*e*660;
   m.M.setAttribute('transform',`translate(${x},${y}) rotate(${Math.sin(p*Math.PI)*-25})`);lb.style.opacity=t<j0?lb.style.opacity:0});
 events.push([j0,j1,'whoosh']);
}
// ---------- S3: dumping vs delegating
const s3start=s2end+0.4, s3end=Q(49.08)+0.35;
{const g=scene(s3start,s3end);
 wtext(g,'الفرق',960,165,{size:78,t0:Q(38.35),dur:0.5});
 const a=Q(40.99);
 R.rect(g,1010,230,600,560,a-0.2,0.35,{fill:'#FDECEC',fillStyle:'solid',stroke:RED,strokeWidth:5});
 wtext(g,'الرمي',1310,310,{size:66,color:RED,t0:a,dur:0.4});
 const box=mk('g',{},g);mk('rect',{x:1220,y:380,width:180,height:80,rx:10,fill:'#fff',stroke:NAVY,'stroke-width':4},box);ctext(box,'المهمة',1310,433,34,NAVY);pop(box,Q(41.71),0.3);
 const ghost=mk('g',{},g);popFigure(ghost,1310,710,160,Q(41.9),{arms:'down'});fadeOut(ghost,Q(42.9),0.7);
 wtext(g,'وتختفي…',1310,760,{size:52,color:RED,t0:Q(42.70),dur:0.5});
 const b=Q(43.56);
 R.rect(g,310,230,600,560,b-0.2,0.35,{fill:'#E8F5E9',fillStyle:'solid',stroke:GREEN,strokeWidth:5});
 wtext(g,'التفويض',610,310,{size:66,color:GREEN,t0:b,dur:0.45});
 [['المهمة',44.51],['الصلاحية',45.44],['المتابعة',46.44]].forEach(([l,t],i)=>{const y=400+i*95;const W=mk('g',{},g);mk('rect',{x:440,y:y-38,width:300,height:72,rx:12,fill:'#fff',stroke:GREEN,'stroke-width':4},W);ctext(W,l,610,y+12,34,NAVY);pop(W,Q(t)-0.1,0.3);check(g,400,y,0.5,Q(t)+0.2,0.12,GREEN)});
 wtext(g,'والمسؤولية تفضل معاك',610,735,{size:46,color:DGOLD,stroke:NAVY,sw:1.2,t0:Q(47.24),dur:0.9});
}
// ---------- S4: three questions before you delegate
const s4start=s3end+0.4, s4end=Q(57.38)+0.35;
{const g=scene(s4start,s4end);
 wtext(g,'قبل ما تفوّض… ٣ أسئلة',960,175,{size:72,t0:Q(49.45),dur:0.8});
 const C=[['النتيجة؟ وإمتى؟',1400,51.88,'target'],['الصلاحية؟',960,54.01,'key'],['المتابعة: إمتى وإزاي؟',520,55.46,'cal']];
 C.forEach(([l,x,t,k],i)=>{const t0=Q(t)-0.2;R.rect(g,x-200,270,400,420,t0,0.3,{fill:'#fff',fillStyle:'solid',strokeWidth:5,stroke:i===0?GOLD:NAVY});
   const W=mk('g',{},g);mk('circle',{cx:x,cy:270,r:32,fill:GOLD,stroke:NAVY,'stroke-width':4},W);ctext(W,AR(i+1),x,283,34,NAVY);pop(W,t0+0.1,0.25);
   const I=mk('g',{},g);
   if(k==='target'){[70,48,26].forEach((r,j)=>mk('circle',{cx:x,cy:430,r,fill:j%2?'#fff':'#FDECEC',stroke:RED,'stroke-width':4},I));mk('circle',{cx:x,cy:430,r:8,fill:RED},I)}
   if(k==='key'){mk('circle',{cx:x-40,cy:430,r:30,fill:'#FFF4D6',stroke:DGOLD,'stroke-width':6},I);mk('path',{d:`M${x-10} 430 H${x+70} M${x+45} 430 V455 M${x+65} 430 V450`,stroke:DGOLD,'stroke-width':8,'stroke-linecap':'round'},I)}
   if(k==='cal'){mk('rect',{x:x-60,y:370,width:120,height:115,rx:10,fill:'#fff',stroke:NAVY,'stroke-width':4},I);mk('rect',{x:x-60,y:370,width:120,height:30,rx:8,fill:NAVY},I);mk('path',{d:`M${x-30} 440 l18 18 l36 -40`,fill:'none',stroke:GREEN,'stroke-width':7,'stroke-linecap':'round','stroke-linejoin':'round'},I)}
   pop(I,t0+0.25,0.3);
   wtext(g,l,x,600,{font:'cairo',weight:800,size:36,t0:t0+0.4,dur:0.6,noHand:true})});
}
// ---------- S5: try tomorrow
const s5start=s4end+0.4, s5end=Q(65.75)+0.35;
{const g=scene(s5start,s5end);
 const a=Q(57.77);
 R.rect(g,300,140,1320,740,a-0.1,0.45,{fill:'#FFF9E8',fillStyle:'solid',stroke:GOLD,strokeWidth:7,roughness:0.7});
 wtext(g,'أول ما حد يجيلك بمشكلة…',960,230,{size:58,t0:Q(58.77),dur:0.9});
 bubble(g,1270,290,380,'سيبها عليّا',Q(60.42),{fill:'#fff'});
 R.line(g,1100,280,1440,380,Q(61.1),0.15,{stroke:RED,strokeWidth:8});R.line(g,1440,280,1100,380,Q(61.25),0.15,{stroke:RED,strokeWidth:8});
 bubble(g,650,290,380,'إيه اقتراحك؟',Q(61.82),{fill:'#E8F5E9',stroke:GREEN,color:GREEN});
 check(g,880,300,0.7,Q(62.4),0.15,GREEN);
 const b=Q(63.40);
 popFigure(g,1060,760,190,b-0.2,{arms:'down'});monkey(g,1110,600,0.9,b+0.1);
 popFigure(g,860,760,190,Q(64.82)-0.2,{arms:'point'});
 wtext(g,'القرد معاه… وإنت جنبه',960,840,{size:50,color:GREEN,t0:Q(64.82),dur:0.8,stroke:'#fff',sw:6});
}
// ---------- S6: the reference — EFQM + the line to remember
const s6start=s5end+0.4, s6end=Q(77.60)+0.35;
{const g=scene(s6start,s6end);
 wtext(g,'EFQM',960,175,{font:'cairo',weight:800,size:72,ltr:true,t0:Q(66.10)-0.05,dur:0.45});
 wtext(g,'القيادة المتميزة بتمكّن الناس',960,265,{size:58,color:DGOLD,t0:Q(67.9),dur:1.0});
 wtext(g,'مش بتشيل عنهم',960,345,{size:48,color:GRAY,t0:Q(70.73),dur:0.6});
 const a=Q(72.03);
 popFigure(g,560,760,190,a-0.1,{arms:'up'});
 [[520,600],[600,600],[560,520],[480,530],[640,530],[560,440]].forEach(([x,y],i)=>monkey(g,x,y,0.75,a+0.15+i*0.12));
 const x1=mk('g',{},g);ctext(x1,'✗',780,640,90,RED);pop(x1,a+1.2,0.3);
 const b=Q(74.69);
 [1200,1360,1520].forEach((x,i)=>{popFigure(g,x,760,160,b+i*0.12,{arms:'down'});monkey(g,x+40,630,0.6,b+0.4+i*0.12)});
 const c1=mk('g',{},g);ctext(c1,'✓',1060,640,90,GREEN);pop(c1,Q(75.78)+0.6,0.3);
 wtext(g,'فريقه عارف يربّي قروده',1360,850,{size:48,color:GREEN,t0:Q(75.78),dur:0.9,stroke:'#fff',sw:6});
}
// ---------- S7: the riddle (next episode)
const tCL=tCloseLogo;
{const g=scene(s6end+0.4,tCL-0.05,'fade');
 const a=Q(78.04);
 const gift=mk('g',{},g);mk('rect',{x:850,y:360,width:220,height:180,rx:8,fill:'#FDECEC',stroke:NAVY,'stroke-width':5},gift);mk('rect',{x:830,y:320,width:260,height:50,rx:8,fill:'#F8D7D7',stroke:NAVY,'stroke-width':5},gift);
 mk('rect',{x:945,y:320,width:30,height:220,fill:GOLD,stroke:NAVY,'stroke-width':3},gift);mk('path',{d:'M960 320 C920 260 880 290 905 318 M960 320 C1000 260 1040 290 1015 318',fill:'none',stroke:GOLD,'stroke-width':10,'stroke-linecap':'round'},gift);
 ctext(gift,'؟',960,480,90,NAVY);pop(gift,a-0.1,0.4);
 wtext(g,'ببلاش!',960,620,{size:54,color:DGOLD,t0:Q(79.3),dur:0.5});
 const b=Q(80.12);
 const mg=mk('g',{},g);mk('circle',{cx:470,cy:400,r:62,fill:'#fff',stroke:NAVY,'stroke-width':7},mg);mk('line',{x1:515,y1:445,x2:580,y2:510,stroke:NAVY,'stroke-width':14,'stroke-linecap':'round'},mg);ctext(mg,'✗',470,425,60,RED);pop(mg,b,0.35);
 wtext(g,'بتوريك فين بتغلط',490,610,{size:48,t0:b+0.3,dur:0.8});
 const c=Q(82.19);
 const bin=mk('g',{},g);mk('path',{d:'M1390 360 L1410 540 L1530 540 L1550 360 Z',fill:'#E9EDF2',stroke:NAVY,'stroke-width':5,'stroke-linejoin':'round'},bin);mk('rect',{x:1375,y:335,width:190,height:28,rx:8,fill:'#C9CED6',stroke:NAVY,'stroke-width':5},bin);[1430,1470,1510].forEach(x=>mk('line',{x1:x,y1:385,x2:x+(x-1470)*0.1,y2:515,stroke:NAVY,'stroke-width':4},bin));pop(bin,c,0.35);
 R.path(g,'M1100 420 Q1250 330 1370 390',Q(84.08),0.4,{stroke:RED,strokeWidth:6});arrowHead(g,1372,392,25,Q(84.08)+0.4,{stroke:RED});
 wtext(g,'وأغلب الشركات بترميها',1470,610,{size:46,color:RED,t0:c+0.3,dur:0.9});
 const bw=mk('g',{transform:'translate(-540,60)'},g);const bub=mk('g',{},bw);mk('path',{d:'M1420 640 h150 a24 24 0 0 1 24 24 v56 a24 24 0 0 1 -24 24 h-90 l-34 28 l4 -28 h-30 a24 24 0 0 1 -24 -24 v-56 a24 24 0 0 1 24 -24 z',fill:'#fff',stroke:NAVY,'stroke-width':5,'stroke-linejoin':'round'},bub);
 [1465,1495,1525].forEach(x=>mk('circle',{cx:x,cy:692,r:8,fill:GOLD},bub));pop(bub,Q(87.10)-0.1,0.35);
}
// ---------- S8: closing
{const g=scene(tCL,1e9);
 R.circle(g,L_E.x,L_E.y,460,tCL+0.05,0.55,{stroke:GOLD,strokeWidth:8,roughness:0.9});
 const a=tCL+0.5;
 wtext(g,'احفظ الحلقة 🔖',960,690,{font:'cairo',weight:800,size:44,color:DGOLD,t0:a,dur:0.6,noHand:true});
 wtext(g,'',960,770,{size:68,t0:a+0.6,dur:1.1,spans:[['الحلقة الجاية: ',GOLD],['الهدية اللي محدّش عاوزها',NAVY]]});
 R.line(g,760,812,920,812,a+1.75,0.1,{stroke:BURG,strokeWidth:4});R.line(g,1000,812,1160,812,a+1.85,0.1,{stroke:BURG,strokeWidth:4});
 const dia=mk('path',{d:'M960 800 L972 812 L960 824 L948 812Z',fill:GOLD},g);pop(dia,a+1.85,0.25);
 wtext(g,'تابعني على لينكدإن  ·  Modather Salama',960,875,{font:'cairo',size:38,t0:a+2.0,dur:0.95});
}
}
