function build(){
const AR=n=>String(n).replace(/\d/g,x=>'٠١٢٣٤٥٦٧٨٩'[x]);
function hatFig(g,x,y,h,t0,arms,hat){const W=mk('g',{},g);const f=figure(W,x,y,h,{arms});
  if(hat==='helmet')mk('path',{d:'M-34 -186 Q0 -236 34 -186 L40 -182 L-40 -182 Z',fill:GOLD,stroke:NAVY,'stroke-width':4,'stroke-linejoin':'round'},f.G);
  if(hat==='clip'){mk('rect',{x:40,y:-160,width:36,height:48,rx:4,fill:'#fff',stroke:NAVY,'stroke-width':4},f.G);mk('rect',{x:50,y:-166,width:16,height:8,fill:NAVY},f.G)}
  pop(W,t0,0.38);return W}
// ---------- S0: hook-first intro
{const g=scene(-1,2.3,'fade');
 wtext(g,'أغلى حاجة… هي الحاجة الرخيصة!',960,150,{size:80,t0:0.02,dur:0.6,noHand:true});
 R.circle(g,L_C.x,L_C.y,600,0.0,0.6,{stroke:GOLD,strokeWidth:9,roughness:0.9});
 wtext(g,'تكلفة الجودة الرديئة',960,890,{size:92,t0:1.38,dur:0.8});
}
// ---------- S1: the site story
const s1end=T(15.08)+0.3;
{const g=scene(2.4,s1end);
 const a=T(2.99);
 wtext(g,'في الموقع…',960,190,{size:84,t0:a-0.1,dur:0.6});
 R.line(g,420,720,1500,720,a+0.5,0.2,{strokeWidth:6});
 [640,960,1280].forEach((x,i)=>R.rect(g,x-30,470,60,250,a+0.7+i*0.18,0.18,{fill:'rgba(31,58,95,0.10)',fillStyle:'solid',strokeWidth:5}));
 R.rect(g,560,420,800,50,a+1.25,0.3,{fill:'rgba(31,58,95,0.10)',fillStyle:'solid',strokeWidth:6});
 for(let i=0;i<8;i++)R.line(g,600+i*100,410,600+i*100,330,a+1.6+i*0.05,0.05,{stroke:'#8E9AAB',strokeWidth:4,roughness:0.5});
 R.line(g,580,360,1340,360,a+2.0,0.15,{stroke:'#8E9AAB',strokeWidth:4,roughness:0.5});
 const b=T(6.96);
 hatFig(g,330,720,240,b-0.1,'down','helmet');
 R.circle(g,330,300,110,b+0.3,0.25,{fill:'#fff',fillStyle:'solid'});R.line(g,330,300,330,268,b+0.55,0.05,{strokeWidth:5});R.line(g,330,300,352,310,b+0.6,0.05,{strokeWidth:5});
 wtext(g,'وفّر ساعة',330,412,{size:52,color:'#C98F00',t0:b+0.75,dur:0.5});
 const c=T(9.99);
 hatFig(g,1620,720,240,c-0.1,'point','clip');
 const st=mk('g',{},g);mk('rect',{x:810,y:345,width:300,height:110,rx:12,fill:'#fff','fill-opacity':0.85,stroke:RED,'stroke-width':8},st);
 const stt=mk('text',{x:960,y:420,'text-anchor':'middle','font-family':"'Cairo'",'font-weight':800,'font-size':58,fill:RED},st);stt.textContent='مرفوض ✗';
 st.setAttribute('transform','rotate(-8 960 400)');const sw=mk('g',{},g);sw.appendChild(st);pop(sw,c+0.55,0.3);events.push([c+0.55,c+0.8,'stamp']);
 const d=T(12.98);
 wtext(g,'',960,850,{size:70,t0:d+0.3,dur:1.2,spans:[['التكلفة اللي باينة: ',NAVY],['خرسانة + عمالة',RED]]});
}
// ---------- S2: the iceberg
const s2start=s1end+0.4, s2end=T(23.79)+0.35;
{const g=scene(s2start,s2end);
 const a=T(15.49);
 const sea=mk('rect',{x:0,y:430,width:1920,height:560,fill:'rgba(159,195,240,0.20)'},g);fade(sea,a-0.05,0.4,1);
 R.path(g,'M80 430 Q240 410 400 430 T 720 430 T 1040 430 T 1360 430 T 1680 430 T 1860 430',a-0.1,0.5,{stroke:'#4A78B0',strokeWidth:5});
 R.poly(g,[[880,430],[930,320],[975,290],[1030,340],[1060,430]],a+0.4,0.4,{fill:'#fff',fillStyle:'solid',strokeWidth:5});
 wtext(g,'خرسانة + عمالة',970,250,{size:54,t0:a+0.55,dur:0.5});
 const b=T(17.12);
 R.poly(g,[[880,430],[640,520],[560,700],[700,880],[960,930],[1240,870],[1370,700],[1290,520],[1060,430]],b-0.1,0.7,{fill:'#E9F1FB',fillStyle:'solid',strokeWidth:5});
 const items=[[T(18.37),780,560,'تأخير'],[T(19.93),1140,560,'غرامات'],[T(20.83),780,760,'ساعات زيادة'],[T(22.22),1140,760,'ثقة العميل']];
 items.forEach(([t0,x,y,l],i)=>{
   if(i===0){R.rect(g,x-130,y-40,70,62,t0-0.1,0.18,{fill:'#fff',fillStyle:'solid',strokeWidth:4});R.rect(g,x-130,y-40,70,18,t0+0.08,0.06,{fill:BURG,fillStyle:'solid',strokeWidth:3})}
   if(i===1){R.rect(g,x-128,y-48,58,74,t0-0.1,0.18,{fill:'#fff',fillStyle:'solid',strokeWidth:4});wtext(g,'−ج',x-99,y+4,{font:'cairo',weight:800,size:28,color:RED,t0:t0+0.08,dur:0.1})}
   if(i===2){R.circle(g,x-100,y-8,66,t0-0.1,0.16,{fill:'#fff',fillStyle:'solid',strokeWidth:4});R.line(g,x-100,y-8,x-100,y-30,t0+0.06,0.04,{strokeWidth:4});R.line(g,x-100,y-8,x-84,y,t0+0.1,0.04,{stroke:RED,strokeWidth:4})}
   if(i===3){R.path(g,`M${x-100} ${y+24} L${x-136} ${y-10} Q${x-150} ${y-40} ${x-118} ${y-44} Q${x-104} ${y-44} ${x-100} ${y-30} Q${x-96} ${y-44} ${x-82} ${y-44} Q${x-50} ${y-40} ${x-64} ${y-10} Z`,t0-0.1,0.22,{fill:'rgba(178,58,58,0.25)',fillStyle:'solid',stroke:RED,strokeWidth:4});R.lines(g,[[x-100,y-30],[x-108,y-12],[x-94,y-2],[x-102,y+16]],t0+0.12,0.08,{stroke:RED,strokeWidth:4})}
   wtext(g,l,x+30,y+12,{size:48,color:i===3?RED:NAVY,t0:t0+0.15,dur:0.45})});
}
// ---------- S3: COPQ + ASQ
const s3start=s2end+0.4, s3end=T(36.10)+0.35;
{const g=scene(s3start,s3end);
 wtext(g,'تكلفة الجودة الرديئة',960,210,{size:100,t0:Math.max(s3start+0.05,T(25.29)-0.1),dur:0.9});
 wtext(g,'Cost of Poor Quality',960,285,{font:'caveat',size:54,ltr:true,opacity:0.85,t0:T(26.4),dur:0.5,noHand:true});
 const a=T(27.39);
 R.rect(g,560,350,800,400,a-0.1,0.4,{fill:'#fff',fillStyle:'solid',strokeWidth:5,roughness:0.8});
 wtext(g,'ASQ',960,440,{font:'cairo',weight:800,size:72,ltr:true,t0:a+0.3,dur:0.35});
 wtext(g,'الجمعية الأمريكية للجودة',960,500,{font:'cairo',size:36,t0:a+0.7,dur:0.8});
 const c0=T(30.75),c1=T(34.0);events.push([c0,c1,'tick']);
 const cnt=mk('text',{x:960,y:650,'text-anchor':'middle','font-family':"'Cairo'",'font-weight':800,'font-size':130,fill:GOLD,stroke:NAVY,'stroke-width':4,'paint-order':'stroke',direction:'rtl'},g);
 updaters.push(t=>{cnt.style.opacity=t<c0?0:1;const p=clamp((t-c0)/(c1-c0));cnt.textContent=p<1?AR(Math.round(20*ease(p)))+'٪':'١٥ – ٢٠٪'});
 wtext(g,'من المبيعات',960,720,{size:56,t0:T(35.16)-0.05,dur:0.6});
 sparkle(g,1260,560,0.6,c1+0.1);
}
// ---------- S4: the 1-10-100 rule
const s4start=s3end+0.4, s4end=T(46.52)+0.35;
{const g=scene(s4start,s4end);
 wtext(g,'قاعدة ١ – ١٠ – ١٠٠',960,210,{size:92,t0:Math.max(s4start+0.05,T(36.77)-0.1),dur:0.8});
 const cols=[[1380,1,'١',NAVY,T(38.61),'منع الغلط',T(41.14)],[960,5,'١٠','#C98F00',T(39.25),'تصليح جوّه',T(42.98)],[540,16,'١٠٠',RED,T(40.01),'عند العميل',T(44.88)]];
 cols.forEach(([x,nc,num,c,t0,lab,tl])=>{const st=mk('g',{},g);
   for(let k=0;k<nc;k++){const y=720-k*16;const e=mk('ellipse',{cx:x,cy:y,rx:78,ry:20,fill:GOLD,stroke:NAVY,'stroke-width':3.5},st);pop(e,t0-0.05+k*0.025,0.2)}
   const tx=mk('text',{x,y:720-nc*16-40,'text-anchor':'middle','font-family':"'Cairo'",'font-weight':800,'font-size':86,fill:c},g);tx.textContent=num;pop(tx,t0+0.1,0.3);
   wtext(g,lab,x,815,{size:56,color:c===RED?RED:NAVY,t0:tl-0.05,dur:0.6})});
 R.line(g,380,742,1540,742,Math.max(s4start+0.2,T(38.61)-0.3),0.25,{strokeWidth:5});
}
// ---------- S5: the key line
const s5start=s4end+0.4, s5end=T(51.54)+0.4;
{const g=scene(s5start,s5end);
 wtext(g,'افتكرها كده',960,250,{size:70,color:BURG,t0:Math.max(s5start+0.05,T(47.53)-0.05),dur:0.5});
 wtext(g,'الغلط الرخيص…',960,480,{size:124,t0:T(49.29)-0.08,dur:0.7});
 wtext(g,'بيطلع أغلى حاجة.',960,710,{size:140,color:GOLD,stroke:NAVY,sw:3.5,t0:T(50.5)-0.08,dur:0.85});
 R.path(g,'M680 755 Q820 738 960 752 T 1240 746',T(50.5)+0.8,0.25,{stroke:BURG,strokeWidth:7});
 sparkle(g,1300,600,0.65,T(50.5)+0.95);
}
// ---------- S6: the question
const tCL=tCloseLogo;
{const g=scene(s5end+0.4,tCL-0.05,'fade');
 wtext(g,'وإنت؟',960,270,{size:140,t0:T(52.57)-0.12,dur:0.5});
 wtext(g,'إيه أغلى غلطة صغيرة شفتها؟',960,480,{size:86,color:GOLD,stroke:NAVY,sw:3,t0:T(53.15),dur:1.2});
 const bub=mk('g',{},g);
 mk('path',{d:'M885 570 h150 a24 24 0 0 1 24 24 v56 a24 24 0 0 1 -24 24 h-90 l-34 28 l4 -28 h-30 a24 24 0 0 1 -24 -24 v-56 a24 24 0 0 1 24 -24 z',fill:'#fff',stroke:NAVY,'stroke-width':5,'stroke-linejoin':'round'},bub);
 [930,960,990].forEach(x=>mk('circle',{cx:x,cy:622,r:8,fill:GOLD},bub));pop(bub,T(55.42)-0.2,0.4);
 wtext(g,'اكتبهالي في التعليقات',960,820,{font:'cairo',size:48,t0:T(55.42)+0.05,dur:0.7});
}
// ---------- S7: closing
{const g=scene(tCL,1e9);
 R.circle(g,L_E.x,L_E.y,460,tCL+0.05,0.55,{stroke:GOLD,strokeWidth:8,roughness:0.9});
 const a=T(57.49)+0.25;
 wtext(g,'',960,720,{size:76,t0:a,dur:1.05,spans:[['بكرة: ',GOLD],['نموذج EFQM في دقيقة',NAVY]]});
 wtext(g,'التوجّه • التنفيذ • النتائج',960,790,{font:'cairo',size:40,t0:a+1.1,dur:0.6});
 R.line(g,760,832,920,832,a+1.75,0.1,{stroke:BURG,strokeWidth:4});R.line(g,1000,832,1160,832,a+1.85,0.1,{stroke:BURG,strokeWidth:4});
 const dia=mk('path',{d:'M960 820 L972 832 L960 844 L948 832Z',fill:GOLD},g);pop(dia,a+1.85,0.25);
 wtext(g,'تابعني على لينكدإن  ·  Modather Salama',960,905,{font:'cairo',size:40,t0:a+2.0,dur:0.95});
}
}
