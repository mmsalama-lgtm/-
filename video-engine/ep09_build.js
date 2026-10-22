function build(){
const AR=n=>String(n).replace(/\d/g,x=>'٠١٢٣٤٥٦٧٨٩'[x]);
const COL={S:NAVY,W:RED,O:'#C98F00',T:BURG};
function chip(g,x,y,L,t0,r=34){const G=mk('g',{},g);mk('circle',{cx:x,cy:y,r,fill:COL[L],stroke:NAVY,'stroke-width':3},G);const t=mk('text',{x,y:y+r*0.42,'text-anchor':'middle','font-family':"'Cairo'",'font-weight':800,'font-size':r*1.2,fill:'#fff'},G);t.textContent=L;pop(G,t0,0.3);return G}
function counter(g,x,y,txt,c,t0){const G=mk('g',{},g);mk('rect',{x:x-150,y:y-46,width:300,height:72,rx:14,fill:'#fff',stroke:c,'stroke-width':5},G);const t=mk('text',{x,y:y+6,'text-anchor':'middle','font-family':"'Cairo'",'font-weight':800,'font-size':40,fill:c},G);t.textContent=txt;pop(G,t0,0.35);return G}
// ---------- S0: hook-first intro
{const g=scene(-1,2.3,'fade');
 wtext(g,'SWOT بتاعتك… طلّعت كام قرار؟',960,150,{size:80,t0:0.02,dur:0.6,noHand:true});
 R.circle(g,L_C.x,L_C.y,600,0.0,0.6,{stroke:GOLD,strokeWidth:9,roughness:0.9});
 wtext(g,'تحليل SWOT صح',960,890,{size:96,t0:1.38,dur:0.8});
}
// ---------- S1: the SWOT that ends in a drawer
const s1end=T(11.85)+0.3;
{const g=scene(2.4,s1end);
 wtext(g,'هات آخر SWOT عملته…',960,190,{size:80,t0:T(3.03)-0.05,dur:1.0});
 const paper=mk('g',{},g);const a=T(3.03)+1.0;
 R.rect(paper,500,300,520,460,a,0.35,{fill:'#fff',fillStyle:'solid',strokeWidth:5});R.line(paper,760,300,760,760,a+0.35,0.1,{strokeWidth:4});R.line(paper,500,530,1020,530,a+0.45,0.1,{strokeWidth:4});
 [['S',940,350],['W',680,350],['O',940,580],['T',680,580]].forEach(([L,x,y],i)=>{const t=mk('text',{x,y,'text-anchor':'middle','font-family':"'Cairo'",'font-weight':800,'font-size':40,fill:COL[L]},paper);t.textContent=L;fade(t,a+0.55+i*0.05,0.15);
   for(let k=0;k<3;k++)R.line(paper,x-170+(k%2)*20,y+45+k*40,x+60,y+45+k*40,a+0.75+i*0.12+k*0.03,0.03,{strokeWidth:3,stroke:'#8E9AAB',roughness:1.5})});
 counter(g,1420,420,'قرارات: ٠',RED,T(6.41)-0.05);
 const d=T(8.41);
 R.rect(g,1240,560,380,280,d-0.1,0.3,{fill:'#fff',fillStyle:'solid',strokeWidth:6});R.rect(g,1270,600,320,90,d+0.2,0.15,{strokeWidth:4});R.line(g,1390,645,1470,645,d+0.35,0.08,{strokeWidth:7});
 R.rect(g,1270,720,320,90,d+0.45,0.15,{strokeWidth:4});R.line(g,1390,765,1470,765,d+0.6,0.08,{strokeWidth:7});
 wtext(g,'٤ خانات مليانة كلام…',760,850,{size:58,t0:d+0.2,dur:0.8});
 const tm=T(11.06);
 updaters.push(t=>{const p=ease(clamp((t-tm)/0.7));paper.setAttribute('transform',`translate(${p*(1430-760)},${p*(645-530)}) scale(${1-0.8*p})`);paper.style.opacity=1-p*0.9;
   if(p>0){paper.setAttribute('transform',`translate(${760+p*(1430-760)},${530+p*(645-530)}) scale(${1-0.8*p}) translate(-760,-530)`)}});
 events.push([tm,tm+0.6,'soft']);
}
// ---------- S2: before → after
const s2start=s1end+0.4, s2end=T(18.05)+0.35;
{const g=scene(s2start,s2end);
 const a=T(13.33);
 wtext(g,'قبل',1400,230,{size:90,color:'#6B7486',t0:a-0.1,dur:0.35});
 R.rect(g,1260,300,280,340,a+0.25,0.3,{fill:'#fff',fillStyle:'solid',strokeWidth:5});
 for(let k=0;k<6;k++){R.circle(g,1490,350+k*48,12,a+0.55+k*0.05,0.04,{fill:NAVY,fillStyle:'solid',noHand:true});R.line(g,1300,350+k*48,1465,350+k*48,a+0.55+k*0.05,0.05,{strokeWidth:3,stroke:'#8E9AAB',noHand:true})}
 wtext(g,'SWOT = قايمة',1400,740,{size:66,color:'#6B7486',t0:T(14.95)-0.4,dur:0.6});
 R.path(g,'M1150 470 L800 470',T(16.05)-0.3,0.25,{strokeWidth:8});R.path(g,'M830 440 L795 470 L830 500',T(16.05)-0.05,0.08,{strokeWidth:8});
 const b=T(16.05);
 wtext(g,'بعد',520,230,{size:90,color:'#C98F00',t0:b+0.05,dur:0.35});
 R.rect(g,380,300,280,340,b+0.3,0.3,{fill:'#fff',fillStyle:'solid',strokeWidth:5,stroke:'#C98F00'});
 for(let k=0;k<4;k++){check(g,620,358+k*72,0.5,b+0.6+k*0.1,0.08,GOLD);R.line(g,420,358+k*72,580,358+k*72,b+0.65+k*0.1,0.05,{strokeWidth:5,noHand:true})}
 wtext(g,'SWOT = قرارات',520,740,{size:66,color:GOLD,stroke:NAVY,sw:2.5,t0:T(17.5)-0.05,dur:0.6});
}
// ---------- S3: the garment factory — four cards
const s3start=s2end+0.4, s3end=T(29.61)+0.3;
{const g=scene(s3start,s3end);
 wtext(g,'مصنع ملابس',960,185,{size:84,t0:Math.max(s3start+0.05,T(19.0)-0.05),dur:0.7});
 const cards=[['S','قوّة','جودة الخياطة',1500,T(20.69),T(21.8)],['W','ضعف','التسويق برّه',1140,T(23.45),T(24.34)],['O','فرصة','طلب تصدير',780,T(25.96),T(26.83)],['T','تهديد','منافسة الأسعار',420,T(28.1),T(28.6)]];
 cards.forEach(([L,ar,txt,x,t0,t1])=>{R.rect(g,x-150,330,300,400,t0-0.25,0.3,{fill:'#fff',fillStyle:'solid',strokeWidth:5,stroke:COL[L],roughness:0.8});
   chip(g,x,420,L,t0+0.05,46);wtext(g,ar,x,540,{size:62,color:COL[L],t0:t0+0.15,dur:0.3});wtext(g,txt,x,640,{size:50,t0:t1-0.05,dur:0.55})});
}
// ---------- S4: link the boxes → decisions (TOWS)
const s4start=s3end+0.4, s4end=T(47.39)+0.35;
{const g=scene(s4start,s4end);
 wtext(g,'اربط الخانات ببعض',960,170,{size:80,t0:Math.max(s4start+0.05,T(30.69)-0.05),dur:0.9});
 const rows=[['S','O','نصدّر بالجودة',T(32.38),T(33.5)],['W','O','نشارك مكتب تصدير',T(35.18),T(36.45)],['S','T','ننافس بالجودة مش بالسعر',T(38.37),T(39.44)],['W','T','نبدأ بطلبية صغيرة',T(41.59),T(43.01)]];
 rows.forEach(([A,Bb,dec,t0,t1],i)=>{const y=300+i*150;chip(g,1560,y,A,t0-0.05);const pl=mk('text',{x:1480,y:y+16,'text-anchor':'middle','font-family':"'Cairo'",'font-weight':800,'font-size':48,fill:NAVY},g);pl.textContent='+';pop(pl,t0+0.1,0.2);
   chip(g,1400,y,Bb,t0+0.2);const eq=mk('text',{x:1315,y:y+16,'text-anchor':'middle','font-family':"'Cairo'",'font-weight':800,'font-size':48,fill:GOLD},g);eq.textContent='=';pop(eq,t1-0.15,0.2);
   wtext(g,dec,1250,y+20,{size:58,color:'#B98500',anchor:'start',t0:t1-0.05,dur:0.9})});
 const c=T(45.18);
 const box=mk('g',{},g);mk('rect',{x:150,y:400,width:360,height:180,rx:16,fill:'#FFF7DD',stroke:GOLD,'stroke-width':6},box);
 const tw=mk('text',{x:330,y:480,'text-anchor':'middle','font-family':"'Cairo'",'font-weight':800,'font-size':64,fill:NAVY,direction:'ltr'},box);tw.textContent='TOWS';
 const tw2=mk('text',{x:330,y:545,'text-anchor':'middle','font-family':"'Ruqaa'",'font-weight':700,'font-size':52,fill:'#B98500'},box);tw2.textContent='مصفوفة';pop(box,c+0.1,0.4);
 counter(g,330,700,'قرارات: ٤',GOLD,T(46.46));sparkle(g,520,380,0.6,T(46.46)+0.3);
}
// ---------- S5: the key line
const s5start=s4end+0.4, s5end=T(51.52)+0.4;
{const g=scene(s5start,s5end);
 wtext(g,'افتكرها كده',960,250,{size:70,color:BURG,t0:Math.max(s5start+0.05,T(48.08)-0.05),dur:0.5});
 wtext(g,'التحليل اللي ما يطلّعش قرار…',960,480,{size:96,t0:T(49.23)-0.08,dur:1.0});
 wtext(g,'مالوش لازمة.',960,710,{size:150,color:GOLD,stroke:NAVY,sw:3.5,t0:T(50.96)-0.12,dur:0.55});
 R.path(g,'M720 755 Q840 738 960 752 T 1200 746',T(50.96)+0.45,0.22,{stroke:BURG,strokeWidth:7});
 sparkle(g,1260,600,0.65,T(50.96)+0.6);
}
// ---------- S6: the question
const tCL=tCloseLogo;
{const g=scene(s5end+0.4,tCL-0.05,'fade');
 wtext(g,'وإنت؟',960,260,{size:140,t0:T(52.92)-0.12,dur:0.45});
 wtext(g,'آخر SWOT عندكم… طلّعت كام قرار؟',960,460,{size:80,color:GOLD,stroke:NAVY,sw:2.5,t0:T(53.43)+0.05,dur:1.4});
 counter(g,960,620,'قرارات: ؟',NAVY,T(54.66)+0.2);
 wtext(g,'اكتبلي في التعليقات',960,830,{font:'cairo',size:48,t0:T(56.28)-0.05,dur:0.6});
}
// ---------- S7: closing
{const g=scene(tCL,1e9);
 R.circle(g,L_E.x,L_E.y,460,tCL+0.05,0.55,{stroke:GOLD,strokeWidth:8,roughness:0.9});
 const a=T(58.14)+0.25;
 wtext(g,'',960,720,{size:72,t0:a,dur:1.1,spans:[['الحلقة الجاية: ',GOLD],['الاجتماع الفعّال',NAVY]]});
 wtext(g,'الاجتماع اللي من غير قرار… كان ممكن يبقى إيميل',960,790,{font:'cairo',size:34,t0:a+1.15,dur:0.85});
 R.line(g,760,832,920,832,a+2.05,0.1,{stroke:BURG,strokeWidth:4});R.line(g,1000,832,1160,832,a+2.15,0.1,{stroke:BURG,strokeWidth:4});
 const dia=mk('path',{d:'M960 820 L972 832 L960 844 L948 832Z',fill:GOLD},g);pop(dia,a+2.15,0.25);
 wtext(g,'تابعني على لينكدإن  ·  Modather Salama',960,905,{font:'cairo',size:40,t0:a+2.3,dur:0.95});
}
}
