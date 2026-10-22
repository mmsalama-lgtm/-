function build(){
const AR=n=>String(n).replace(/\d/g,x=>'٠١٢٣٤٥٦٧٨٩'[x]);
// microbus, ground-centre origin, facing left (towards Alexandria); o.noHand draws it instantly
function bus(parent,x,y,s,t0,dur,o={}){
  const G=mk('g',{transform:`translate(${x},${y}) scale(${s})`},parent);const k=dur/1.0;const nh=!!o.noHand;const q=(a)=>Object.assign({noHand:nh},a);
  R.path(G,'M150 -20 L150 -120 Q150 -142 128 -142 L-105 -142 Q-140 -142 -150 -100 L-150 -20 Z',t0,0.3*k,q({fill:'#fff',fillStyle:'solid',strokeWidth:6}));
  R.path(G,'M-118 -130 L-142 -130 L-148 -96 L-118 -96 Z',t0+0.3*k,0.06*k,q({fill:'rgba(159,195,240,0.5)',fillStyle:'solid',strokeWidth:4}));
  [-100,-50,0,50,100].forEach((wx,i)=>R.rect(G,wx-18,-130,38,36,t0+0.36*k+i*0.05*k,0.05*k,q({fill:'rgba(159,195,240,0.35)',fillStyle:'solid',strokeWidth:4})));
  R.line(G,-150,-70,150,-70,t0+0.62*k,0.08*k,q({stroke:GOLD,strokeWidth:9}));
  R.circle(G,-90,-20,52,t0+0.72*k,0.1*k,q({fill:NAVY,fillStyle:'solid'}));R.circle(G,95,-20,52,t0+0.82*k,0.1*k,q({fill:NAVY,fillStyle:'solid'}));
  R.rect(G,-50,-176,100,30,t0+0.92*k,0.08*k,q({fill:'#fff',fillStyle:'solid',strokeWidth:4}));
  return G}
function flag(g,x,y,t0){R.line(g,x,y,x,y-190,t0,0.15,{strokeWidth:7});R.path(g,`M${x} ${y-190} L${x-120} ${y-160} L${x} ${y-120} Z`,t0+0.15,0.25,{fill:GOLD,fillStyle:'hachure',hachureGap:8,fillWeight:4,strokeWidth:5})}
function clock(g,x,y,label,t0){R.circle(g,x,y,70,t0,0.2,{fill:'#fff',fillStyle:'solid',strokeWidth:5});R.line(g,x,y,x,y-22,t0+0.2,0.04,{strokeWidth:5});R.line(g,x,y,x+16,y+6,t0+0.24,0.04,{stroke:RED,strokeWidth:5});
  wtext(g,label,x,y+78,{font:'cairo',weight:800,size:38,ltr:true,t0:t0+0.3,dur:0.3})}
function tag(g,x,ar,en,t0){wtext(g,ar,x,345,{size:84,color:GOLD,stroke:NAVY,sw:3,t0,dur:0.45});wtext(g,en,x,400,{font:'caveat',size:46,ltr:true,opacity:0.85,t0:t0+0.48,dur:0.3})}
// ---------- S0: hook-first intro
{const g=scene(-1,2.3,'fade');
 wtext(g,'تركب ميكروباص… من غير ما تعرف رايح فين؟',960,140,{size:70,color:NAVY,t0:0.02,dur:0.6,noHand:true});
 R.circle(g,L_C.x,L_C.y,600,0.0,0.6,{stroke:GOLD,strokeWidth:9,roughness:0.9});
 wtext(g,'الرؤية والرسالة والأهداف',960,890,{size:88,t0:1.38,dur:0.8});
}
// ---------- S1: the microbus with no destination
const s1end=T(8.02)+0.15;
{const g=scene(2.4,s1end);
 wtext(g,'اثبتلي…',960,190,{size:96,t0:T(2.76)-0.1,dur:0.5});
 R.line(g,380,700,1540,700,T(2.76)+0.45,0.2,{strokeWidth:6});
 const G=bus(g,960,700,1.8,T(2.76)+0.7,1.7);
 const qs=mk('text',{x:960,y:418,'text-anchor':'middle','font-family':"'Cairo'",'font-weight':800,'font-size':60,fill:RED},g);qs.setAttribute('font-size',84);qs.setAttribute('y',432);qs.textContent='؟';pop(qs,T(6.27)-0.1,0.35);
 popFigure(g,1560,690,190,T(6.27)+0.05,{arms:'hips'});
 const q2=mk('text',{x:1610,y:470,'text-anchor':'middle','font-family':"'Cairo'",'font-weight':800,'font-size':54,fill:RED},g);q2.textContent='؟';pop(q2,T(6.27)+0.3,0.3);
 wtext(g,'رايح فين؟!',960,850,{size:96,color:RED,t0:T(6.27)+0.4,dur:0.7});
}
// ---------- S2: companies moving with no destination
const s2start=s1end+0.4, s2end=T(14.97)+0.35;
{const g=scene(s2start,s2end);
 wtext(g,'مستحيل… صح؟',960,220,{size:110,t0:T(9.48)-0.1,dur:0.75});
 const b=T(11.4);
 R.rect(g,860,450,200,190,b-0.1,0.3,{fill:'#fff',fillStyle:'solid'});R.poly(g,[[846,450],[960,380],[1074,450]],b+0.2,0.15,{fill:GOLD,fillStyle:'hachure',hachureGap:12,fillWeight:4});
 wtext(g,'شركة',960,560,{font:'cairo',size:38,t0:b+0.35,dur:0.15});
 [['M840 520 Q740 470 680 380',[682,374]],['M1080 520 Q1190 470 1250 390',[1250,386]],['M840 600 Q730 660 650 640',[646,640]],['M1080 600 Q1180 680 1280 650',[1284,650]]].forEach(([d],i)=>R.path(g,d,b+0.55+i*0.3,0.25,{stroke:RED,strokeWidth:7,roughness:1.6}));
 [[650,370],[1290,380],[610,650],[1320,660]].forEach(([x,y],i)=>{const q=mk('text',{x,y,'text-anchor':'middle','font-family':"'Cairo'",'font-weight':800,'font-size':52,fill:RED},g);q.textContent='؟';pop(q,b+0.8+i*0.3,0.3)});
 wtext(g,'ماشية… ومش عارفة رايحة فين',960,850,{size:76,color:RED,t0:b+2.0,dur:1.0});
}
// ---------- S3: the route Cairo → Tanta → Alexandria
const s3start=s2end+0.4, s3end=T(40.0)+0.3;
{const g=scene(s3start,s3end);
 wtext(g,'خلّينا نفهمها بالميكروباص',960,190,{size:76,t0:T(15.78)-0.05,dur:1.2});
 const r0=T(15.78)+1.25;
 R.line(g,1780,640,200,640,r0,0.4,{strokeWidth:9});
 dashed(g,'M1760 664 L220 664',r0+0.4,0.3,{color:NAVY,sw:4,dash:'26 20'});
 const cairo=mk('text',{x:1790,y:600,'text-anchor':'middle','font-family':"'Cairo'",'font-weight':700,'font-size':34,fill:NAVY},g);cairo.textContent='القاهرة';fade(cairo,r0+0.3,0.3);
 const mv=mk('g',{},g);const W=mk('g',{},mv);bus(W,0,0,0.75,0,0.01,{noHand:true});pop(W,r0+0.55,0.35);
 const heads=mk('g',{},W);[-100,-50,0,50].forEach(hx=>mk('circle',{cx:hx*0.75,cy:-84,r:10,fill:NAVY},heads));fade(heads,T(26.14)+0.3,0.3);
 const X0=1560,XT=960,XA=420,tm1=T(36.04),tm2=T(38.16);
 updaters.push(t=>{let x=X0;if(t>tm1)x=X0+(XT-X0)*ease(clamp((t-tm1)/1.1));if(t>tm2)x=XT+(XA-XT)*ease(clamp((t-tm2)/1.5));mv.setAttribute('transform',`translate(${x},640)`)});
 // vision
 const v=T(18.55);flag(g,300,640,v-0.1);tag(g,300,'الرؤية','Vision',v+0.3);
 wtext(g,'إسكندرية',300,720,{size:56,t0:T(21.8)-0.05,dur:0.6});
 // mission
 const m=T(23.57);tag(g,1560,'الرسالة','Mission',m-0.05);
 wtext(g,'إحنا مين؟ وبنخدم مين؟',1560,480,{font:'cairo',size:34,t0:T(26.14)-0.05,dur:0.7});
 wtext(g,'بأمان  •  بسعر معقول',1560,740,{font:'cairo',size:38,t0:T(28.7)+0.1,dur:1.0});
 // objectives
 const o=T(32.45);tag(g,960,'الأهداف','Objectives',o-0.05);
 R.line(g,1040,640,1040,470,T(34.18)-0.1,0.15,{strokeWidth:6});R.circle(g,1040,450,70,T(34.18)+0.05,0.15,{fill:GOLD,fillStyle:'solid',strokeWidth:5});
 wtext(g,'محطة',1040,460,{font:'cairo',size:19,t0:T(34.18)+0.22,dur:0.12});
 wtext(g,'طنطا',960,720,{size:56,t0:T(36.04)-0.05,dur:0.4});
 clock(g,1180,770,'10:00',T(36.04)+0.35);
 clock(g,500,770,'12:00',T(38.16)+0.2);
}
// ---------- S4: EFQM starts here
const s4start=s3end+0.4, s4end=T(47.01)+0.35;
{const g=scene(s4start,s4end);
 const a=Math.max(T(41.45),s4start+0.15);
 R.circle(g,620,520,380,a-0.1,0.4,{fill:'#fff',fillStyle:'solid',strokeWidth:7});R.circle(g,620,520,300,a+0.3,0.2,{strokeWidth:3});
 [[620,335,620,365],[620,675,620,705],[435,520,465,520],[775,520,805,520]].forEach(([x1,y1,x2,y2],i)=>R.line(g,x1,y1,x2,y2,a+0.5+i*0.04,0.04,{strokeWidth:5}));
 const nd=mk('g',{},g);mk('path',{d:'M620 380 L648 520 L620 660 L592 520 Z',fill:GOLD,stroke:NAVY,'stroke-width':4,'stroke-linejoin':'round'},nd);mk('path',{d:'M620 520 L648 520 L620 660 L592 520 Z',fill:RED,opacity:0.85},nd);mk('circle',{cx:620,cy:520,r:10,fill:NAVY},nd);
 pop(nd,a+0.7,0.4);updaters.push(t=>{const p=clamp((t-(a+0.7))/1.6);nd.setAttribute('transform',`rotate(${(1-easeOutBack(p))*-70} 620 520)`)});
 wtext(g,'EFQM',1270,350,{font:'cairo',weight:800,size:96,ltr:true,t0:a+0.15,dur:0.45});
 wtext(g,'بيبدأ من هنا:',1270,460,{size:66,t0:T(43.41)-0.05,dur:0.55});
 wtext(g,'الغاية • الرؤية • الاستراتيجية',1270,600,{size:70,color:GOLD,stroke:NAVY,sw:3,t0:T(44.87)-0.05,dur:1.6});
 const cr=mk('text',{x:1270,y:680,'text-anchor':'middle','font-family':"'Cairo'",'font-weight':700,'font-size':32,fill:NAVY,opacity:0},g);cr.textContent='نموذج EFQM 2020 – المعيار ١';fade(cr,T(44.87)+1.7,0.4,0.8);
}
// ---------- S5: the key line
const s5start=s4end+0.4, s5end=T(53.13)+0.4;
{const g=scene(s5start,s5end);
 wtext(g,'افتكرها كده',960,230,{size:70,color:BURG,t0:T(48.06)-0.05,dur:0.55});
 wtext(g,'من غير رؤية…',960,450,{size:120,t0:T(49.49)-0.05,dur:0.7});
 wtext(g,'أي طريق هيوصّلك لمكان مش عايزه',960,660,{size:92,color:GOLD,stroke:NAVY,sw:3,t0:T(51.43)-0.1,dur:1.45});
 R.path(g,'M520 705 Q740 688 960 702 T 1400 696',T(51.43)+1.35,0.25,{stroke:BURG,strokeWidth:7});
 sparkle(g,1450,560,0.6,T(51.43)+1.5);
}
// ---------- S6: the question
const tCL=tCloseLogo;
{const g=scene(s5end+0.4,tCL-0.05,'fade');
 wtext(g,'وإنت؟',960,280,{size:150,t0:T(54.53)-0.12,dur:0.55});
 wtext(g,'رؤية شغلك… في جملة واحدة؟',960,500,{size:92,color:GOLD,stroke:NAVY,sw:3,t0:T(54.53)+0.65,dur:1.1});
 R.rect(g,1300,600,46,46,T(56.6)+0.1,0.15,{strokeWidth:5});
 dashed(g,'M1270 640 L620 640',T(56.6)+0.3,0.4,{color:NAVY,sw:5,dash:'10 12'});
 const bub=mk('g',{},g);
 mk('path',{d:'M885 700 h150 a24 24 0 0 1 24 24 v56 a24 24 0 0 1 -24 24 h-90 l-34 28 l4 -28 h-30 a24 24 0 0 1 -24 -24 v-56 a24 24 0 0 1 24 -24 z',fill:'#fff',stroke:NAVY,'stroke-width':5,'stroke-linejoin':'round'},bub);
 [930,960,990].forEach(x=>mk('circle',{cx:x,cy:752,r:8,fill:GOLD},bub));pop(bub,T(58.03)-0.15,0.4);
 wtext(g,'اكتبها في التعليقات',960,900,{font:'cairo',size:46,t0:T(58.03)+0.05,dur:0.7});
}
// ---------- S7: closing
{const g=scene(tCL,1e9);
 R.circle(g,L_E.x,L_E.y,460,tCL+0.05,0.55,{stroke:GOLD,strokeWidth:8,roughness:0.9});
 const a=T(59.94)+0.25;
 wtext(g,'',960,720,{size:76,t0:a,dur:1.0,spans:[['بكرة: ',GOLD],['مش كل عاجل مهم',NAVY]]});
 wtext(g,'مصفوفة أيزنهاور',960,790,{font:'cairo',size:40,t0:a+1.05,dur:0.55});
 R.line(g,760,832,920,832,a+1.65,0.1,{stroke:BURG,strokeWidth:4});R.line(g,1000,832,1160,832,a+1.75,0.1,{stroke:BURG,strokeWidth:4});
 const dia=mk('path',{d:'M960 820 L972 832 L960 844 L948 832Z',fill:GOLD},g);pop(dia,a+1.75,0.25);
 wtext(g,'تابعني على لينكدإن  ·  Modather Salama',960,905,{font:'cairo',size:40,t0:a+1.9,dur:0.95});
}
}
