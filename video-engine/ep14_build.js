function build(){
const Q=x=>x;
const AR=n=>String(n).replace(/\d/g,x=>'٠١٢٣٤٥٦٧٨٩'[x]);
const GREEN='#2E7D32', DGOLD='#C98F00', AMBER='#E08A00', GRAY='#5B6B80';
// ---- section tag (top-left) -------------------------------------------------
{const ui=document.getElementById('ui');const tg=mk('g',{},ui);const r=mk('rect',{x:50,y:46,rx:18,ry:18,height:52,width:200,fill:GOLD,stroke:NAVY,'stroke-width':3},tg);
 const tx=mk('text',{x:150,y:82,'text-anchor':'middle','font-family':"'Cairo'",'font-weight':800,'font-size':28,fill:NAVY,direction:'rtl'},tg);
 const SEC=[[2.4,'سؤال'],[Q(9.6),'القصة'],[Q(25.5),'الفكرة'],[Q(45.6),'المثال'],[Q(56.3),'جرّبها بكرة'],[Q(66.4),'المرجع'],[Q(76.4),'لغز الحلقة الجاية'],[Q(88.36)-0.35,'']];
 updaters.push(t=>{let cur=null,ts=0;for(const [a,l] of SEC){if(t>=a){cur=l;ts=a}}if(!cur){tg.style.opacity=0;return}
   tx.textContent=cur;const w=Math.max(160,cur.length*22+50);r.setAttribute('width',w);tx.setAttribute('x',50+w/2);tg.style.opacity=clamp((t-ts)/0.25)});}
function ctext(g,str,x,y,size,color,o={}){const t=mk('text',Object.assign({x,y,'text-anchor':'middle','font-family':"'Cairo'",'font-weight':800,'font-size':size,fill:color,direction:'rtl'},o),g);t.textContent=str;return t}
function arrowHead(g,x,y,ang,t0,o={}){const a=ang*Math.PI/180,L=22;const p=(da)=>`${x-L*Math.cos(a+da)} ${y-L*Math.sin(a+da)}`;
  R.path(g,`M${p(0.5)} L${x} ${y} L${p(-0.5)}`,t0,0.06,Object.assign({strokeWidth:6,noHand:true},o))}
// simple icons drawn with shapes (centre x,y, size s)
function icon(g,kind,x,y,s,t0){const W=mk('g',{},g);const G=mk('g',{transform:`translate(${x},${y}) scale(${s})`},W);const sw=4/s;
  if(kind==='money'){mk('rect',{x:-34,y:-22,width:68,height:44,rx:6,fill:'#E8F5E9',stroke:GREEN,'stroke-width':sw},G);mk('circle',{cx:0,cy:0,r:12,fill:'none',stroke:GREEN,'stroke-width':sw},G);}
  if(kind==='customer'){mk('circle',{cx:0,cy:0,r:30,fill:'#FFF4D6',stroke:NAVY,'stroke-width':sw},G);mk('circle',{cx:-10,cy:-6,r:3.5,fill:NAVY},G);mk('circle',{cx:10,cy:-6,r:3.5,fill:NAVY},G);mk('path',{d:'M-14 8 Q0 22 14 8',fill:'none',stroke:NAVY,'stroke-width':sw,'stroke-linecap':'round'},G);}
  if(kind==='gear'){let d='';for(let i=0;i<8;i++){const a=i*Math.PI/4;d+=`M${22*Math.cos(a)} ${22*Math.sin(a)} L${34*Math.cos(a)} ${34*Math.sin(a)} `}
    mk('path',{d,stroke:NAVY,'stroke-width':10/s*1.4,'stroke-linecap':'round'},G);mk('circle',{cx:0,cy:0,r:24,fill:'#E9F1FB',stroke:NAVY,'stroke-width':sw},G);mk('circle',{cx:0,cy:0,r:8,fill:NAVY},G);}
  if(kind==='book'){mk('path',{d:'M0 -20 Q-20 -30 -36 -22 L-36 24 Q-20 16 0 26 Q20 16 36 24 L36 -22 Q20 -30 0 -20 Z',fill:'#EDE7F6',stroke:BURG,'stroke-width':sw,'stroke-linejoin':'round'},G);mk('path',{d:'M0 -20 L0 26',stroke:BURG,'stroke-width':sw},G);}
  pop(W,t0,0.3);return W}
// gauge: centre (x,y), radius r; returns needle setter
function gauge(g,x,y,r,t0,label,o={}){
  R.path(g,`M${x-r} ${y} A${r} ${r} 0 0 1 ${x+r} ${y}`,t0,0.35,{strokeWidth:7,noHand:true});
  [[-80,o.c0||GRAY],[-40,GRAY],[0,GRAY],[40,GRAY],[80,o.c4||GRAY]].forEach(([d,c],i)=>{const an=(d-90)*Math.PI/180;R.line(g,x+(r-28)*Math.cos(an),y+(r-28)*Math.sin(an),x+(r-6)*Math.cos(an),y+(r-6)*Math.sin(an),t0+0.3+i*0.04,0.04,{stroke:c,strokeWidth:6,noHand:true})});
  const nd=mk('line',{x1:x,y1:y,x2:x,y2:y-r+36,stroke:RED,'stroke-width':7,'stroke-linecap':'round'},g);const hub=mk('circle',{cx:x,cy:y,r:14,fill:NAVY},g);fade(hub,t0+0.3,0.2,1);
  wtext(g,label,x,y+70,{size:46,t0:t0+0.35,dur:0.4,noHand:true});
  return {nd,set:(t,ang)=>{nd.style.opacity=t<t0+0.4?0:1;nd.setAttribute('transform',`rotate(${ang} ${x} ${y})`)}}}
// ---------- S0: hook-first intro
{const g=scene(-1,2.3,'fade');
 wtext(g,'باصص على عدّاد واحد بس؟',960,150,{size:78,t0:0.02,dur:0.6,noHand:true});
 R.circle(g,L_C.x,L_C.y,600,0.0,0.6,{stroke:GOLD,strokeWidth:9,roughness:0.9});
 wtext(g,'بطاقة الأداء المتوازن',960,848,{size:76,t0:1.38,dur:0.8});
}
// ---------- S1: riddle answer — four corners
const s1end=Q(9.38)+0.3;
{const g=scene(2.4,s1end);
 wtext(g,'لغز الحلقة اللي فاتت…',960,180,{size:62,t0:2.5,dur:0.6});
 const b=Q(3.28);
 R.rect(g,780,230,360,360,b-0.3,0.35,{fill:'#fff',fillStyle:'solid',stroke:GOLD,strokeWidth:6});R.line(g,960,230,960,590,b+0.05,0.12,{strokeWidth:4,noHand:true});R.line(g,780,410,1140,410,b+0.15,0.12,{strokeWidth:4,noHand:true});
 [['money',1050,320],['customer',870,320],['gear',1050,500],['book',870,500]].forEach(([k,x,y],i)=>icon(g,k,x,y,1.25,b+0.5+i*0.18));
 wtext(g,'بطاقة الأداء المتوازن',960,700,{size:70,color:DGOLD,stroke:NAVY,sw:1.5,t0:Q(4.11),dur:0.9});
 wtext(g,'مش الفلوس بس',960,800,{size:56,color:NAVY,t0:Q(8.46)-0.05,dur:0.5});
 sparkle(g,1180,225,0.5,Q(6.1));
}
// ---------- S2: profits up… everything else down
const s2start=s1end+0.4, s2end=Q(24.99)+0.35;
{const g=scene(s2start,s2end);
 const a=Q(9.74);
 R.line(g,300,700,300,300,a-0.1,0.15,{strokeWidth:5,noHand:true});R.line(g,300,700,900,700,a+0.05,0.15,{strokeWidth:5,noHand:true});
 [[370,120],[470,180],[570,250],[670,330]].forEach(([x,h],i)=>{const bar=mk('rect',{x:x-32,y:700-h,width:64,height:h,fill:i===3?GOLD:'#C9D6E8',stroke:NAVY,'stroke-width':3},g);fade(bar,a+0.2+i*0.15,0.2,1)});
 R.path(g,'M350 560 Q520 480 700 330',a+0.8,0.35,{stroke:GREEN,strokeWidth:7});arrowHead(g,700,330,-50,a+1.15,{stroke:GREEN,strokeWidth:7});
 wtext(g,'الأرباح',400,280,{size:52,color:GREEN,t0:a+0.5,dur:0.4});
 const c=Q(11.65);
 sparkle(g,760,300,0.45,c+0.1,GOLD);sparkle(g,850,380,0.35,c+0.3,'#E57373');sparkle(g,820,230,0.3,c+0.5,'#64B5F6');
 wtext(g,'احتفال!',620,240,{size:50,color:DGOLD,t0:c+0.2,dur:0.4,noHand:true});
 const S=[['الشكاوى زادت',14.16],['٣ مهندسين مشيوا',15.35],['الصيانة اتأجلت',17.24]];
 S.forEach(([l,t],i)=>{const y=300+i*120,t0=Q(t)-0.15;const W=mk('g',{},g);mk('rect',{x:1130,y:y-50,width:520,height:90,rx:14,fill:'#FDECEC',stroke:RED,'stroke-width':4},W);ctext(W,l,1350,y+12,40,RED);ctext(W,'▼',1600,y+12,34,RED);pop(W,t0,0.3)});
 const d=Q(19.81);
 const fb=mk('rect',{x:790-32,y:640,width:64,height:60,fill:RED,stroke:NAVY,'stroke-width':3},g);fade(fb,d-0.1,0.2,1);
 R.path(g,'M700 350 Q760 420 790 610',d+0.1,0.35,{stroke:RED,strokeWidth:7});arrowHead(g,790,610,80,d+0.45,{stroke:RED,strokeWidth:7});
 wtext(g,'الأرقام كانت كدابة؟',1390,690,{size:50,color:GRAY,t0:Q(21.80),dur:0.6});
 wtext(g,'ولا باصّين في المكان الغلط؟',960,850,{size:60,color:RED,t0:Q(23.21),dur:0.8,stroke:'#fff',sw:6});
}
// ---------- S3a: the car dashboard
const s3start=s2end+0.4, s3end=Q(33.26)+0.35;
{const g=scene(s3start,s3end);
 const a=Q(25.64);
 R.rect(g,240,250,1440,520,a-0.2,0.4,{fill:'#F3F5F8',fillStyle:'solid',strokeWidth:6,roughness:0.7});
 const G1=gauge(g,1450,560,140,a,'البنزين');
 const G2=gauge(g,1130,560,140,Q(27.46)-0.3,'السرعة');
 const G3=gauge(g,810,560,140,Q(27.46)+0.3,'الحرارة',{c4:RED});
 const G4=gauge(g,490,560,140,Q(28.6),'الزيت',{c0:RED});
 const w=Q(29.57), h=Q(31.26);
 updaters.push(t=>{G1.set(t,40+Math.sin(t*1.3)*4);G2.set(t,-10+Math.sin(t*0.9)*12);G4.set(t,10);
   G3.set(t,t<h?-30:-30+clamp((t-h)/1.4)*108)});
 R.circle(g,1450,540,360,w,0.35,{stroke:GOLD,strokeWidth:8,roughness:0.8});
 wtext(g,'بص هنا بس',1450,350,{size:50,color:DGOLD,t0:w+0.3,dur:0.5});
 const glow=mk('circle',{cx:810,cy:540,r:180,fill:'rgba(178,58,58,0.12)'},g);fade(glow,h+0.6,0.4,1);
 [[760,330],[810,300],[860,325]].forEach(([x,y],i)=>{const p=mk('circle',{cx:x,cy:y,r:26-i*3,fill:'#B0B8C4',opacity:0.8},g);pop(p,Q(32.36)+i*0.15,0.3)});
 wtext(g,'الموتور هيسخن!',810,860,{size:62,color:RED,t0:h+0.3,dur:0.6,stroke:'#fff',sw:6});
}
// ---------- S3b: the four perspectives
const s3bstart=s3end+0.4, s3bend=Q(45.40)+0.35;
{const g=scene(s3bstart,s3bend);
 wtext(g,'أربع زوايا',960,165,{size:70,t0:Q(33.72),dur:0.6});
 const a=Q(33.9);
 R.rect(g,440,220,1040,600,a,0.45,{fill:'#fff',fillStyle:'solid',stroke:GOLD,strokeWidth:6});R.line(g,960,220,960,820,a+0.4,0.15,{strokeWidth:4,noHand:true});R.line(g,440,520,1480,520,a+0.5,0.15,{strokeWidth:4,noHand:true});
 const P=[['money','الفلوس','إحنا كسبانين؟',1220,370,35.72],['customer','العميل','راضي… وهيرجع؟',700,370,37.65],['gear','العمليات','شغلنا ماشي صح؟',1220,670,39.97],['book','التعلّم والنمو','ناسنا بتكبر؟',700,670,42.70]];
 P.forEach(([k,n,q,x,y,t])=>{const t0=Q(t)-0.15;icon(g,k,x+170,y-60,1.0,t0);
   wtext(g,n,x-10,y-35,{size:54,anchor:'middle',t0:t0+0.1,dur:0.4,noHand:true});
   wtext(g,q,x,y+60,{font:'cairo',size:38,color:GRAY,t0:t0+0.45,dur:0.6,noHand:true})});
}
// ---------- S4: the cause-and-effect chain
const s4start=s3bend+0.4, s4end=Q(55.97)+0.35;
{const g=scene(s4start,s4end);
 const B=[['book','التعلّم والنمو',720,47.08],['gear','العمليات',560,48.08],['customer','العميل',400,49.36],['money','الفلوس',240,50.41]];
 B.forEach(([k,n,y,t],i)=>{const t0=Q(t)-0.2;R.rect(g,560,y-55,440,110,t0,0.25,{fill:i===3?'#FFF4D6':'#fff',fillStyle:'solid',strokeWidth:5,stroke:i===3?GOLD:NAVY});
   icon(g,k,935,y,0.9,t0+0.2);wtext(g,n,760,y+18,{size:50,t0:t0+0.25,dur:0.4,noHand:true});
   if(i<3){R.line(g,780,y-58,780,y-100,Q(B[i+1][3])-0.35,0.15,{strokeWidth:6,stroke:GREEN,noHand:true});arrowHead(g,780,y-102,-90,Q(B[i+1][3])-0.2,{stroke:GREEN})}});
 const c=Q(51.57);
 R.path(g,'M1020 240 L1120 240',c-0.1,0.2,{strokeWidth:5,stroke:DGOLD});
 wtext(g,'آخر عدّاد بيتحرك',1150,256,{size:52,anchor:'end',color:DGOLD,t0:c+0.1,dur:0.8});
 const d=Q(53.91);
 R.path(g,'M1030 340 Q1070 340 1070 380 L1070 520 Q1070 560 1110 560 Q1070 560 1070 600 L1070 740 Q1070 780 1030 780',d-0.1,0.4,{strokeWidth:5,stroke:GREEN});
 wtext(g,'بيحذّروك بدري',1140,578,{size:56,anchor:'end',color:GREEN,t0:d+0.3,dur:0.8});
 R.path(g,'M380 230 Q300 480 380 730',Q(45.71)+0.1,0.5,{strokeWidth:5,stroke:GRAY,noHand:true});arrowHead(g,382,226,-70,Q(45.71)+0.6,{stroke:GRAY});
 wtext(g,'السلسلة',215,500,{size:46,color:GRAY,t0:Q(45.71)+0.3,dur:0.5,noHand:true});
}
// ---------- S5: try tomorrow — the four-square sheet
const s5start=s4end+0.4, s5end=Q(66.16)+0.35;
{const g=scene(s5start,s5end);
 const a=Q(56.42);
 R.rect(g,300,140,1320,740,a-0.1,0.45,{fill:'#FFF9E8',fillStyle:'solid',stroke:GOLD,strokeWidth:7,roughness:0.7});
 wtext(g,'ورقة واحدة… أربع مربعات',960,225,{size:62,t0:a+0.3,dur:0.7});
 const b=Q(57.39);
 R.rect(g,640,270,640,460,b,0.35,{fill:'#fff',fillStyle:'solid',strokeWidth:5});
 R.line(g,960,270,960,730,Q(58.09),0.15,{strokeWidth:4});R.line(g,640,500,1280,500,Q(58.09)+0.2,0.15,{strokeWidth:4});
 const Qd=[['الفلوس','هامش الربح ٪',1120,310],['العميل','نسبة الشكاوى',800,310],['العمليات','وقت التسليم',1120,540],['التعلّم والنمو','',800,540]];
 const hd=mk('g',{},g);Qd.forEach(([n,_,x,y])=>ctext(hd,n,x,y+30,28,GRAY));fade(hd,Q(59.86),0.4,1);
 Qd.forEach(([n,m,x,y],i)=>{if(m)wtext(g,m,x,y+120,{font:'cairo',size:38,color:NAVY,t0:Q(60.84)+i*0.6,dur:0.5,noHand:true})});
 const e=Q(63.08);
 const xx=mk('g',{},g);ctext(xx,'✗',800,680,120,RED);pop(xx,e+0.4,0.3);R.rect(g,646,506,308,218,e,0.3,{stroke:RED,strokeWidth:6,roughness:0.6,noHand:true});
 wtext(g,'ده العدّاد اللي إنت سايق من غيره',960,830,{size:52,color:RED,t0:Q(64.46),dur:1.1});
}
// ---------- S6: the reference
const s6start=s5end+0.4, s6end=Q(76.07)+0.35;
{const g=scene(s6start,s6end);
 const a=Q(66.53);
 wtext(g,'Kaplan & Norton',960,215,{font:'cairo',weight:800,size:72,ltr:true,t0:a-0.05,dur:0.7});
 wtext(g,'Harvard Business Review · 1992',960,290,{font:'cairo',weight:700,size:40,color:DGOLD,ltr:true,t0:Q(68.6),dur:1.0,noHand:true});
 const b=Q(71.99);
 R.rect(g,1010,370,560,360,b-0.15,0.3,{fill:'#fff',fillStyle:'solid',strokeWidth:5});
 icon(g,'money',1290,450,1.2,b+0.1);
 wtext(g,'الأرقام المالية',1290,560,{size:50,t0:b+0.2,dur:0.4,noHand:true});
 wtext(g,'اللي حصل',1290,660,{size:56,color:GRAY,t0:b+0.8,dur:0.5});
 const c=Q(74.19);
 R.rect(g,350,370,560,360,c-0.15,0.3,{fill:'#FFF4D6',fillStyle:'solid',stroke:GOLD,strokeWidth:5});
 [['customer',530],['gear',630],['book',730]].forEach(([k,x],i)=>icon(g,k,x,450,0.95,c+0.05+i*0.12));
 wtext(g,'الزوايا التانية',630,560,{size:50,t0:c+0.3,dur:0.4,noHand:true});
 wtext(g,'اللي جاي',630,660,{size:60,color:GREEN,t0:Q(75.22),dur:0.5});
 R.path(g,'M1000 820 L920 820',c+0.4,0.2,{strokeWidth:6});arrowHead(g,918,820,180,c+0.6);
}
// ---------- S7: the riddle (next episode)
const tCL=tCloseLogo;
{const g=scene(s6end+0.4,tCL-0.05,'fade');
 wtext(g,'مين هيشيل الشغل معاك؟',960,175,{size:70,t0:Q(77.83)-0.05,dur:0.8});
 const a=Q(79.41);
 const mgr=mk('g',{},g);figure(mgr,1300,680,200,{arms:'up'});
 [0,1,2,3,4].forEach(i=>mk('rect',{x:1235+(i%2)*8,y:430-i*34,width:130,height:30,rx:4,fill:i%2?'#F7E2B8':'#E9F1FB',stroke:NAVY,'stroke-width':3},mgr));pop(mgr,a-0.1,0.35);
 wtext(g,'المدير',1300,750,{size:44,t0:a+0.3,dur:0.4,noHand:true});
 const b=Q(81.30);
 [480,620,760].forEach((x,i)=>popFigure(g,x,680,150,b+i*0.12,{arms:'down'}));
 const zz=mk('g',{},g);ctext(zz,'…',620,480,80,GRAY);pop(zz,b+0.5,0.3);
 wtext(g,'الفريق',620,750,{size:44,t0:b+0.4,dur:0.4,noHand:true});
 wtext(g,'ترمي الشغل…',1240,860,{size:58,color:RED,t0:Q(82.90)+0.6,dur:0.6,stroke:'#fff',sw:6});
 wtext(g,'ولا تفوّضه؟',680,860,{size:62,color:GREEN,t0:Q(85.06),dur:0.6,stroke:'#fff',sw:6});
 const bw=mk('g',{transform:'translate(120,-330)'},g);const bub=mk('g',{},bw);mk('path',{d:'M1420 640 h150 a24 24 0 0 1 24 24 v56 a24 24 0 0 1 -24 24 h-90 l-34 28 l4 -28 h-30 a24 24 0 0 1 -24 -24 v-56 a24 24 0 0 1 24 -24 z',fill:'#fff',stroke:NAVY,'stroke-width':5,'stroke-linejoin':'round'},bub);
 [1465,1495,1525].forEach(x=>mk('circle',{cx:x,cy:692,r:8,fill:GOLD},bub));pop(bub,Q(87.14)-0.1,0.35);
}
// ---------- S8: closing
{const g=scene(tCL,1e9);
 R.circle(g,L_E.x,L_E.y,460,tCL+0.05,0.55,{stroke:GOLD,strokeWidth:8,roughness:0.9});
 const a=tCL+0.5;
 wtext(g,'احفظ الحلقة 🔖',960,690,{font:'cairo',weight:800,size:44,color:DGOLD,t0:a,dur:0.6,noHand:true});
 wtext(g,'',960,770,{size:68,t0:a+0.6,dur:1.1,spans:[['الحلقة الجاية: ',GOLD],['ترمي الشغل… ولا تفوّضه؟',NAVY]]});
 R.line(g,760,812,920,812,a+1.75,0.1,{stroke:BURG,strokeWidth:4});R.line(g,1000,812,1160,812,a+1.85,0.1,{stroke:BURG,strokeWidth:4});
 const dia=mk('path',{d:'M960 800 L972 812 L960 824 L948 812Z',fill:GOLD},g);pop(dia,a+1.85,0.25);
 wtext(g,'تابعني على لينكدإن  ·  Modather Salama',960,875,{font:'cairo',size:38,t0:a+2.0,dur:0.95});
}
}
