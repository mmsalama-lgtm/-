function build(){
const AR=n=>String(n).replace(/\d/g,x=>'٠١٢٣٤٥٦٧٨٩'[x]);
function hajj(g,x,y,h,t0,arms){const W=mk('g',{},g);const f=figure(W,x,y,h,{arms:arms||'point'});
  mk('path',{d:'M-27 -178 Q0 -222 27 -178 Z',fill:'#fff',stroke:NAVY,'stroke-width':5,'stroke-linejoin':'round'},f.G);
  mk('path',{d:'M-12 -159 Q0 -166 12 -159',fill:'none',stroke:NAVY,'stroke-width':5,'stroke-linecap':'round'},f.G);
  if(arms!=='down'){mk('rect',{x:40,y:-206,width:12,height:24,rx:3,fill:NAVY},f.G);mk('rect',{x:30,y:-184,width:32,height:12,rx:3,fill:BURG},f.G)}
  pop(W,t0,0.38);return W}
function bldg(g,x,y,w,h,label,t0,dur){R.rect(g,x,y,w,h,t0,dur*0.45,{fill:'#fff',fillStyle:'solid'});
  R.poly(g,[[x-14,y],[x+w/2,y-h*0.35],[x+w+14,y]],t0+dur*0.45,dur*0.25,{fill:GOLD,fillStyle:'hachure',hachureGap:12,fillWeight:4});
  R.rect(g,x+w*0.38,y+h-h*0.42,w*0.24,h*0.42,t0+dur*0.7,dur*0.15,{strokeWidth:4});
  if(label)wtext(g,label,x+w/2,y+h*0.38,{font:'cairo',size:Math.round(w*0.14),t0:t0+dur*0.85,dur:dur*0.15})}
// ---------- S0: intro
{const g=scene(-1,2.3,'fade');
 R.circle(g,L_C.x,L_C.y,620,0.0,0.6,{stroke:GOLD,strokeWidth:9,roughness:0.9});
 wtext(g,'يعني إيه حوكمة ببساطة؟',960,875,{size:90,t0:1.38,dur:0.8});
}
// ---------- S1a: the small company
const s1end=T(8.56)+0.2;
{const g=scene(2.4,s1end);
 wtext(g,'كلّنا نعرف الشركة دي…',960,190,{size:80,t0:T(2.93)-0.05,dur:1.3});
 R.line(g,250,235,1670,235,T(2.93)+1.3,0.01,{stroke:'none',noHand:true});
 R.line(g,1000,740,1640,740,T(4.46)-0.1,0.2,{strokeWidth:6});
 bldg(g,1180,470,300,270,'الشركة',T(4.46)+0.05,0.75);
 wtext(g,'بدأت صغيّرة',1330,830,{size:62,t0:T(5.21)+0.3,dur:0.5});
 hajj(g,640,760,360,T(6.87)-0.15);
 const st=mk('g',{},g);[['القرار',520,360],['التوقيع',380,500],['الفلوس',420,650]].forEach(([s,x,y],i)=>{const t=mk('text',{x,y,'text-anchor':'middle','font-family':"'Cairo'",'font-weight':700,'font-size':38,fill:BURG,direction:'rtl'},st);t.textContent=s;pop(t,T(7.4)+i*0.18,0.3)});
 wtext(g,'كل حاجة عند الحاج',640,860,{size:60,color:BURG,t0:T(7.6)+0.3,dur:0.7});
}
// ---------- S1b: the company grew
const s2start=s1end+0.4, s2end=T(15.78)+0.35;
{const g=scene(s2start,s2end);
 wtext(g,'الشركة كبرت…',960,190,{size:84,t0:T(9.75)-0.1,dur:0.75});
 const b=T(10.75);
 R.line(g,140,560,960,560,b-0.15,0.15,{strokeWidth:5});
 [[700,'فرع ١'],[440,'فرع ٢'],[180,'فرع ٣']].forEach(([x,l],i)=>bldg(g,x,370,200,190,l,b+i*0.55,0.5));
 [...Array(12)].forEach((_,i)=>popFigure(g,860-i*62,760,120,b+1.0+i*0.07,{arms:'down',sw:7}));
 const cnt=mk('text',{x:540,y:865,'text-anchor':'middle','font-family':"'Cairo'",'font-weight':800,'font-size':58,fill:NAVY,direction:'rtl'},g);
 const c0=b+0.2,c1=T(13.1);events.push([c0,c1,'tick']);
 updaters.push(t=>{cnt.style.opacity=t<c0?0:1;cnt.textContent=AR(Math.round(100*ease(clamp((t-c0)/(c1-c0)))))+' موظف'});
 const d=T(13.73);
 R.line(g,1100,700,1560,700,d-0.1,0.18,{strokeWidth:7});R.line(g,1140,700,1140,800,d+0.08,0.06,{strokeWidth:6});R.line(g,1520,700,1520,800,d+0.14,0.06,{strokeWidth:6});
 hajj(g,1640,800,300,d+0.05,'down');
 const stack=mk('g',{},g);for(let i=0;i<12;i++){const y=680-i*26;const r=mk('rect',{x:1200+(i%3)*8-8,y,width:230,height:22,rx:3,fill:'#fff',stroke:NAVY,'stroke-width':3},stack);pop(r,d+0.25+i*0.13,0.22)}
 wtext(g,'ورق الكلور!',1330,850,{size:64,color:BURG,t0:T(15.0)-0.1,dur:0.65});
}
// ---------- S2: the result
const s3start=s2end+0.4, s3end=T(24.15)+0.35;
{const g=scene(s3start,s3end);
 wtext(g,'النتيجة؟',960,190,{size:96,color:RED,t0:T(16.73)-0.05,dur:0.6});
 const a=T(17.82);
 R.path(g,'M1300 340 H1440 L1370 450 L1440 560 H1300 L1370 450 Z',a-0.15,0.45,{strokeWidth:6});
 R.poly(g,[[1325,548],[1415,548],[1370,500]],a+0.3,0.12,{stroke:'none',fill:GOLD,fillStyle:'solid',noHand:true});
 wtext(g,'القرارات بتتأخّر',1370,690,{size:58,t0:a+0.4,dur:0.55});
 const b=T(19.52);
 [880,960,1040].forEach((x,i)=>popFigure(g,x,580,150,b-0.15+i*0.1,{arms:'down',sad:true}));
 [[880,355],[1000,335],[1050,380]].forEach(([x,y],i)=>{const q=mk('text',{x,y,'text-anchor':'middle','font-family':"'Cairo'",'font-weight':800,'font-size':54,fill:RED},g);q.textContent='؟';pop(q,b+0.3+i*0.12,0.3)});
 wtext(g,'مين المسؤول؟',960,690,{size:58,t0:b+0.65,dur:0.5});
 const c=T(21.62);
 R.rect(g,480,400,170,120,c-0.1,0.3,{fill:'#fff',fillStyle:'solid'});R.path(g,'M530 400 V370 H600 V400',c+0.2,0.1,{strokeWidth:5});R.line(g,480,450,650,450,c+0.3,0.08,{strokeWidth:4});
 wtext(g,'الحاج سافر ✈',565,690,{font:'cairo',size:44,t0:c+0.4,dur:0.45});
 const d=T(23.32);
 wtext(g,'الشغل بيقف!',960,850,{size:96,color:RED,t0:d-0.12,dur:0.6});
 R.line(g,1180,600,1560,600,d+0.5,0.01,{stroke:'none',noHand:true});
}
// ---------- S3: governance = 3 questions on a balance
const s4start=s3end+0.4, s4end=T(32.2)+0.3;
{const g=scene(s4start,s4end);
 const a=T(25.02);
 wtext(g,'الحوكمة',960,235,{size:130,t0:a+0.25,dur:0.75});
 wtext(g,'Governance',960,325,{font:'caveat',size:62,ltr:true,opacity:0.85,t0:T(26.48)-0.05,dur:0.55});
 const b=T(28.22)-0.1;
 R.rect(g,860,822,200,26,b,0.15,{fill:NAVY,fillStyle:'hachure',hachureGap:8,fillWeight:3});
 R.line(g,960,822,960,478,b+0.15,0.15,{strokeWidth:7});
 const beam=mk('g',{},g),pr=mk('g',{},g),pl=mk('g',{},g);
 R.line(beam,620,470,1300,470,b+0.3,0.2,{strokeWidth:8});mk('circle',{cx:960,cy:470,r:12,fill:GOLD,stroke:NAVY,'stroke-width':4},beam);
 R.lines(pr,[[1220,630],[1300,470],[1380,630]],b+0.5,0.12,{strokeWidth:4});R.path(pr,'M1200 630 Q1300 700 1400 630 Z',b+0.62,0.12,{fill:GOLD,fillStyle:'hachure',hachureGap:9,fillWeight:3,strokeWidth:5});
 R.lines(pl,[[540,630],[620,470],[700,630]],b+0.74,0.12,{strokeWidth:4});R.path(pl,'M520 630 Q620 700 720 630 Z',b+0.86,0.12,{fill:NAVY,fillStyle:'hachure',hachureGap:9,fillWeight:3,strokeWidth:5});
 const lv=T(31.29)+0.35;
 updaters.push(t=>{const p=clamp((t-lv)/1.0);const th=9*(1-easeOutBack(p));const dy=340*Math.sin(th*Math.PI/180);
   beam.setAttribute('transform',`rotate(${th},960,470)`);pr.setAttribute('transform',`translate(0,${dy})`);pl.setAttribute('transform',`translate(0,${-dy})`)});
 wtext(g,'مين يقرّر؟',1300,790,{size:66,t0:T(29.12)-0.1,dur:0.6});
 wtext(g,'وإزاي؟',960,420,{size:58,color:'#C98F00',t0:T(30.19)-0.05,dur:0.4});
 wtext(g,'ومين يحاسب مين؟',620,790,{size:66,t0:T(31.29)-0.15,dur:0.7});
 sparkle(g,1120,420,0.6,lv+0.9);sparkle(g,800,430,0.5,lv+1.0);
}
// ---------- S4: ISO 37000 definition
const s5start=s4end+0.4, s5end=T(41.35)+0.35;
{const g=scene(s5start,s5end);
 const a=T(33.35);
 R.rect(g,560,150,800,170,a-0.05,0.4,{fill:'#fff',fillStyle:'solid',strokeWidth:6});
 wtext(g,'ISO 37000:2021',960,235,{font:'cairo',weight:800,size:66,ltr:true,t0:T(34.76)-0.15,dur:0.6});
 wtext(g,'حوكمة المنظمات',960,293,{font:'cairo',size:38,t0:T(34.76)+0.5,dur:0.45});
 wtext(g,'الحوكمة نظام…',960,410,{size:66,t0:T(35.99),dur:0.8});
 const ix=[1420,960,500];
 const b=T(37.59);
 R.circle(g,ix[0],560,150,b-0.15,0.3,{fill:'#fff',fillStyle:'solid'});R.poly(g,[[ix[0],495],[ix[0]+18,560],[ix[0],625],[ix[0]-18,560]],b+0.15,0.15,{fill:GOLD,fillStyle:'solid',strokeWidth:4});
 wtext(g,'يوجّه',ix[0],750,{size:76,t0:b+0.32,dur:0.4});
 const c=T(39.01);
 R.path(g,`M${ix[1]-95} 560 Q${ix[1]} 480 ${ix[1]+95} 560 Q${ix[1]} 640 ${ix[1]-95} 560 Z`,c-0.2,0.3,{fill:'#fff',fillStyle:'solid'});R.circle(g,ix[1],560,62,c+0.1,0.12,{fill:GOLD,fillStyle:'solid',strokeWidth:4});
 const pu=mk('circle',{cx:ix[1],cy:560,r:12,fill:NAVY},g);pop(pu,c+0.22,0.2);
 wtext(g,'يراقب',ix[1],750,{size:76,t0:c+0.25,dur:0.35});
 const d=T(40.18);
 R.rect(g,ix[2]-60,465,120,170,d-0.15,0.25,{fill:'#fff',fillStyle:'solid',strokeWidth:5});R.rect(g,ix[2]-28,450,56,26,d+0.1,0.06,{fill:NAVY,fillStyle:'solid',strokeWidth:4});
 [520,565,610].forEach((y,k)=>{R.line(g,ix[2]-10,y,ix[2]+40,y,d+0.16+k*0.05,0.04,{strokeWidth:4});check(g,ix[2]-32,y-2,0.38,d+0.18+k*0.05,0.04,GOLD)});
 wtext(g,'يتحاسب',ix[2],750,{size:76,t0:d+0.3,dur:0.45});
 [[1210,560],[730,560]].forEach(([x,y],i)=>dashed(g,`M${x+60} ${y} L${x-60} ${y}`,[b+0.75,c+0.62][i],0.2,{color:GOLD,sw:6,dash:'12 10'}));
}
// ---------- S5: the key line
const s6start=s5end+0.4, s6end=T(46.65)+0.45;
{const g=scene(s6start,s6end);
 wtext(g,'افتكرها كده',960,250,{size:70,color:BURG,t0:T(42.19)-0.05,dur:0.55});
 wtext(g,'الحوكمة مش قيود…',960,470,{size:116,t0:T(43.96)-0.05,dur:0.85});
 wtext(g,'الحوكمة وضوح.',960,700,{size:150,color:GOLD,stroke:NAVY,sw:3.5,t0:T(45.67)-0.1,dur:0.75});
 R.path(g,'M640 745 Q800 728 960 742 T 1280 736',T(45.67)+0.7,0.25,{stroke:BURG,strokeWidth:7});
 sparkle(g,1330,600,0.7,T(45.67)+0.85);sparkle(g,600,620,0.55,T(45.67)+0.95);
}
// ---------- S6: the question
const tCL=tCloseLogo;
{const g=scene(s6end+0.4,tCL-0.05,'fade');
 wtext(g,'وإنت؟',960,300,{size:150,t0:T(47.44)-0.12,dur:0.55});
 wtext(g,'القرار واضح مين صاحبه؟',960,520,{size:92,color:GOLD,stroke:NAVY,sw:3,t0:T(48.53)-0.05,dur:0.9});
 const bub=mk('g',{},g);
 mk('path',{d:'M885 600 h150 a24 24 0 0 1 24 24 v66 a24 24 0 0 1 -24 24 h-90 l-34 30 l4 -30 h-30 a24 24 0 0 1 -24 -24 v-66 a24 24 0 0 1 24 -24 z',fill:'#fff',stroke:NAVY,'stroke-width':5,'stroke-linejoin':'round'},bub);
 [930,960,990].forEach(x=>mk('circle',{cx:x,cy:657,r:8,fill:GOLD},bub));pop(bub,T(50.38)-0.15,0.4);
 wtext(g,'اكتبلي في التعليقات',960,830,{font:'cairo',size:50,t0:T(50.38)+0.05,dur:0.7});
}
// ---------- S7: closing (no voice — written on screen)
{const g=scene(tCL,1e9);
 R.circle(g,L_E.x,L_E.y,460,tCL+0.05,0.6,{stroke:GOLD,strokeWidth:8,roughness:0.9});
 const a=tCL+0.75;
 wtext(g,'نتقابل… في مساء التميّز',960,705,{size:66,t0:a,dur:1.0});
 wtext(g,'',960,800,{size:66,t0:a+1.1,dur:1.1,spans:[['بكرة: ',GOLD],['الرؤية والرسالة والأهداف',NAVY]]});
 R.line(g,760,842,920,842,a+2.25,0.1,{stroke:BURG,strokeWidth:4});R.line(g,1000,842,1160,842,a+2.35,0.1,{stroke:BURG,strokeWidth:4});
 const dia=mk('path',{d:'M960 830 L972 842 L960 854 L948 842Z',fill:GOLD},g);pop(dia,a+2.35,0.25);
 wtext(g,'تابعني على لينكدإن  ·  Modather Salama',960,910,{font:'cairo',size:40,t0:a+2.5,dur:0.95});
}
}
