function build(){
const AR=n=>String(n).replace(/\d/g,x=>'٠١٢٣٤٥٦٧٨٩'[x]);
function counter(g,x,y,txt,c,t0,w=300){const G=mk('g',{},g);mk('rect',{x:x-w/2,y:y-46,width:w,height:72,rx:14,fill:'#fff',stroke:c,'stroke-width':5},G);const t=mk('text',{x,y:y+6,'text-anchor':'middle','font-family':"'Cairo'",'font-weight':800,'font-size':40,fill:c},G);t.textContent=txt;pop(G,t0,0.35);return {G,t}}
function hourglass(g,x,y,s,t0,dur,o={}){const q=a=>Object.assign({noHand:!!o.noHand},a);
  R.path(g,`M${x-50*s} ${y-80*s} H${x+50*s} L${x} ${y} L${x+50*s} ${y+80*s} H${x-50*s} L${x} ${y} Z`,t0,dur*0.7,q({strokeWidth:6}));
  R.line(g,x-62*s,y-80*s,x+62*s,y-80*s,t0+dur*0.7,dur*0.15,q({strokeWidth:8}));R.line(g,x-62*s,y+80*s,x+62*s,y+80*s,t0+dur*0.85,dur*0.15,q({strokeWidth:8}))}
// ---------- S0: hook-first intro
{const g=scene(-1,2.3,'fade');
 wtext(g,'١٦ ساعة شغل… ولا قرار!',960,150,{size:84,t0:0.02,dur:0.6,noHand:true});
 R.circle(g,L_C.x,L_C.y,600,0.0,0.6,{stroke:GOLD,strokeWidth:9,roughness:0.9});
 wtext(g,'الاجتماع الفعّال',960,890,{size:100,t0:1.38,dur:0.8});
}
// ---------- S1: 8 people × 2 hours
const s1end=T(9.94)+0.35;
{const g=scene(2.4,s1end);
 const a=T(2.77);const xs=[690,850,1070,1230];
 xs.forEach((x,i)=>popFigure(g,x,505,140,a+0.4+i*0.09,{arms:'down'}));
 R.rect(g,600,470,720,140,a-0.1,0.45,{fill:'#F3E6D3',fillStyle:'solid',strokeWidth:6});
 xs.forEach((x,i)=>popFigure(g,x,800,140,a+0.8+i*0.09,{arms:'down'}));
 const b=T(4.69);hourglass(g,330,520,1.4,b-0.1,0.5);
 const sand=mk('g',{},g);const st=mk('path',{d:'',fill:GOLD},sand),sb=mk('path',{d:'',fill:GOLD},sand);
 updaters.push(t=>{const p=clamp((t-b-0.4)/(T(7.15)-b));const top=1-p;const x=330,y=520,s=1.4;
   st.setAttribute('d',`M${x-44*s*top} ${y-70*s*top} H${x+44*s*top} L${x} ${y-4} Z`);sb.setAttribute('d',`M${x-44*s*p} ${y+76*s} H${x+44*s*p} L${x} ${y+76*s-60*s*p} Z`);sand.style.opacity=t>b+0.4?1:0});
 const c=counter(g,1620,420,'ساعات الشغل: ٠',NAVY,b,380);
 updaters.push(t=>{const p=clamp((t-b-0.2)/(T(7.15)-b));c.t.textContent='ساعات الشغل: '+AR(Math.round(16*ease(p)))});events.push([b+0.2,T(7.15),'tick']);
 wtext(g,'٨ أشخاص × ساعتين',1620,540,{font:'cairo',size:36,t0:T(5.86)-0.1,dur:0.7,noHand:true});
 const s=mk('g',{},g);const sr=mk('g',{transform:'rotate(-7 1620 690)'},s);mk('rect',{x:1440,y:640,width:360,height:96,rx:12,fill:'#fff','fill-opacity':0.9,stroke:RED,'stroke-width':7},sr);
 const sx=mk('text',{x:1620,y:705,'text-anchor':'middle','font-family':"'Cairo'",'font-weight':800,'font-size':48,fill:RED},sr);sx.textContent='قرارات: ٠ ✗';pop(s,T(9.39)-0.05,0.3);events.push([T(9.39),T(9.39)+0.3,'stamp']);
}
// ---------- S2: the five essentials
const s2start=s1end+0.4, s2end=T(33.10)+0.35;
{const g=scene(s2start,s2end);
 wtext(g,'الاجتماع الفعّال = ٥ حاجات',960,180,{size:80,t0:Math.max(s2start+0.05,T(10.9)-0.05),dur:1.3});
 const X=[1620,1290,960,630,300],Y=400;
 // 1 goal
 let t=T(13.81);[90,60,30].forEach((r,i)=>R.circle(g,X[0],Y,r*2,t-0.15+i*0.1,0.12,{stroke:i===2?RED:NAVY,strokeWidth:5,fill:i===2?RED:'none',fillStyle:'solid',noHand:i>0}));
 R.line(g,X[0]+120,Y-80,X[0]+8,Y-6,t+0.2,0.12,{strokeWidth:6});
 wtext(g,'هدف',X[0],545,{size:66,color:'#C98F00',t0:t+0.1,dur:0.3});wtext(g,'عشان نقرّر إيه؟',X[0],610,{font:'cairo',size:30,t0:T(14.46),dur:0.8,noHand:true});
 // 2 agenda
 t=T(16.79);R.rect(g,X[1]-65,Y-90,130,180,t-0.15,0.2,{fill:'#fff',fillStyle:'solid',strokeWidth:5});R.rect(g,X[1]-25,Y-102,50,22,t+0.05,0.05,{fill:NAVY,fillStyle:'solid',strokeWidth:3,noHand:true});
 const bl=mk('g',{},g);[Y-40,Y,Y+40].forEach((yy,i)=>{R.line(g,X[1]-35,yy,X[1]+40,yy,t+0.12+i*0.04,0.04,{strokeWidth:4,noHand:true});mk('circle',{cx:X[1]-48,cy:yy,r:5,fill:GOLD},bl)});fade(bl,t+0.12,0.12);
 wtext(g,'أجندة',X[1],545,{size:66,color:'#C98F00',t0:t+0.15,dur:0.3});wtext(g,'تتبعت قبلها',X[1],610,{font:'cairo',size:30,t0:T(17.87),dur:0.6,noHand:true});wtext(g,'مش أول ما نقعد',X[1],650,{font:'cairo',size:28,color:RED,t0:T(19.27),dur:0.6,noHand:true});
 // 3 time
 t=T(21.21);R.circle(g,X[2],Y,180,t-0.15,0.25,{fill:'#fff',fillStyle:'solid',strokeWidth:6});R.line(g,X[2],Y,X[2],Y-55,t+0.1,0.05,{strokeWidth:6,noHand:true});R.line(g,X[2],Y,X[2]+40,Y+20,t+0.12,0.05,{stroke:RED,strokeWidth:6,noHand:true});
 wtext(g,'وقت',X[2],545,{size:66,color:'#C98F00',t0:t+0.1,dur:0.3});wtext(g,'بداية ← نهاية',X[2],610,{font:'cairo',size:30,t0:T(22.25),dur:0.9,noHand:true});wtext(g,'ونحترمهم',X[2],650,{font:'cairo',size:28,t0:T(24.09),dur:0.5,noHand:true});
 // 4 chair
 t=T(25.51);const mic=mk('g',{},g);mk('rect',{x:X[3]-22,y:Y-80,width:44,height:80,rx:22,fill:NAVY},mic);mk('path',{d:`M${X[3]-40} ${Y-30} Q${X[3]-40} ${Y+30} ${X[3]} ${Y+30} Q${X[3]+40} ${Y+30} ${X[3]+40} ${Y-30}`,fill:'none',stroke:NAVY,'stroke-width':6},mic);mk('line',{x1:X[3],y1:Y+30,x2:X[3],y2:Y+80,stroke:NAVY,'stroke-width':6},mic);mk('line',{x1:X[3]-35,y1:Y+80,x2:X[3]+35,y2:Y+80,stroke:NAVY,'stroke-width':6},mic);pop(mic,t-0.1,0.35);
 wtext(g,'مسؤول',X[3],545,{size:66,color:'#C98F00',t0:t+0.1,dur:0.3});wtext(g,'بيدير النقاش',X[3],610,{font:'cairo',size:30,t0:T(26.48),dur:0.7,noHand:true});wtext(g,'ويرجّعنا للموضوع',X[3],650,{font:'cairo',size:28,t0:T(28.28),dur:0.6,noHand:true});
 // 5 minutes
 t=T(30.53);R.rect(g,X[4]-65,Y-90,130,180,t-0.15,0.2,{fill:'#fff',fillStyle:'solid',strokeWidth:5});[Y-50,Y-15,Y+20,Y+55].forEach((yy,i)=>R.line(g,X[4]-40,yy,X[4]+40,yy,t+0.1+i*0.03,0.03,{strokeWidth:4,noHand:true}));
 R.line(g,X[4]+30,Y+80,X[4]+95,Y-10,t+0.25,0.08,{stroke:GOLD,strokeWidth:12,noHand:true});
 wtext(g,'محضر',X[4],545,{size:66,color:'#C98F00',t0:t+0.1,dur:0.3});wtext(g,'مين؟ إيه؟ إمتى؟',X[4],610,{font:'cairo',size:30,t0:T(31.57),dur:0.9,noHand:true});
 [1620,1290,960,630,300].forEach((x,i)=>{const n=mk('g',{},g);mk('circle',{cx:x+90,cy:Y-100,r:24,fill:GOLD,stroke:NAVY,'stroke-width':3},n);const tt=mk('text',{x:x+90,y:Y-90,'text-anchor':'middle','font-family':"'Cairo'",'font-weight':800,'font-size':28,fill:NAVY},n);tt.textContent='١٢٣٤٥'[i];pop(n,[T(13.81),T(16.79),T(21.21),T(25.51),T(30.53)][i]+0.25,0.25)});
}
// ---------- S3: the minutes = documented information
const s3start=s2end+0.4, s3end=T(42.63)+0.35;
{const g=scene(s3start,s3end);
 wtext(g,'المحضر',960,175,{size:84,t0:Math.max(s3start+0.05,T(34.03)-0.05),dur:0.5});
 const a=T(34.03)+0.45;const x0=200,x1=1260,y0=270,rh=90;const cx=[1080,700,360];
 R.rect(g,x0,y0,x1-x0,rh*3,a,0.35,{fill:'#fff',fillStyle:'solid',strokeWidth:5,roughness:0.7});
 R.line(g,x0,y0+rh,x1,y0+rh,a+0.35,0.1,{strokeWidth:4});R.line(g,x0,y0+rh*2,x1,y0+rh*2,a+0.45,0.1,{strokeWidth:3});
 R.line(g,900,y0,900,y0+rh*3,a+0.55,0.08,{strokeWidth:3});R.line(g,520,y0,520,y0+rh*3,a+0.63,0.08,{strokeWidth:3});
 const hd=mk('rect',{x:x0,y:y0,width:x1-x0,height:rh,fill:NAVY},g);fade(hd,a+0.4,0.2,0.09);
 [['القرار','المسؤول','الموعد'],['اعتماد خطة الصيانة','مدير الصيانة','الخميس'],['تحديث إجراء الشراء','مسؤول المشتريات','١٥ نوفمبر']].forEach((row,r)=>row.forEach((c,k)=>wtext(g,c,cx[k],y0+rh*r+58,{font:'cairo',weight:r===0?800:700,size:r===0?38:32,color:r===0?NAVY:'#2B3F5C',t0:a+0.75+r*0.35+k*0.1,dur:0.25,noHand:true})));
 const b=T(35.55);
 R.rect(g,1370,300,420,220,b-0.1,0.35,{fill:'#FFF7DD',fillStyle:'solid',stroke:GOLD,strokeWidth:5});
 wtext(g,'ISO 9001 • 7.5',1580,380,{font:'cairo',weight:800,size:44,ltr:true,t0:b+0.3,dur:0.5});
 wtext(g,'معلومات موثّقة',1580,470,{size:60,color:'#B98500',t0:T(37.76)-0.05,dur:0.8});
 check(g,560,760,1.0,T(41.2)-0.05,0.2,GOLD);
 wtext(g,'دليل إن القرار اتاخد',860,780,{size:64,t0:T(41.2)+0.15,dur:0.9});
}
// ---------- S4: the key line
const s4start=s3end+0.4, s4end=T(48.28)+0.4;
{const g=scene(s4start,s4end);
 wtext(g,'افتكرها كده',960,250,{size:70,color:BURG,t0:Math.max(s4start+0.05,T(43.81)-0.05),dur:0.5});
 wtext(g,'الاجتماع اللي من غير قرار…',960,480,{size:104,t0:T(44.88)-0.08,dur:1.1});
 wtext(g,'كان ممكن يبقى إيميل.',960,710,{size:124,color:GOLD,stroke:NAVY,sw:3.5,t0:T(47.22)-0.12,dur:0.85});
 const env=mk('g',{},g);mk('rect',{x:1440,y:620,width:150,height:100,rx:8,fill:'#fff',stroke:NAVY,'stroke-width':5},env);mk('path',{d:'M1440 620 L1515 680 L1590 620',fill:'none',stroke:NAVY,'stroke-width':5,'stroke-linejoin':'round'},env);pop(env,T(47.22)+0.75,0.35);
}
// ---------- S5: the question
const tCL=tCloseLogo;
{const g=scene(s4end+0.4,tCL-0.05,'fade');
 wtext(g,'وإنت؟',960,260,{size:140,t0:T(49.36)-0.12,dur:0.45});
 wtext(g,'إيه أطول اجتماع حضرته… من غير ولا قرار؟',960,460,{size:74,color:GOLD,stroke:NAVY,sw:2.5,t0:T(49.36)+0.45,dur:1.9});
 hourglass(g,960,640,0.9,T(51.61)+0.1,0.35,{noHand:true});
 wtext(g,'اكتبلي في التعليقات',960,840,{font:'cairo',size:48,t0:T(53.01)-0.05,dur:0.6});
}
// ---------- S6: closing
{const g=scene(tCL,1e9);
 R.circle(g,L_E.x,L_E.y,460,tCL+0.05,0.55,{stroke:GOLD,strokeWidth:8,roughness:0.9});
 const a=T(54.99)+0.25;
 wtext(g,'',960,720,{size:76,t0:a,dur:1.0,spans:[['الحلقة الجاية: ',GOLD],['دورة PDCA',NAVY]]});
 wtext(g,'خطّط • نفّذ • افحص • صحّح',960,790,{font:'cairo',size:40,t0:a+1.05,dur:0.6});
 R.line(g,760,832,920,832,a+1.75,0.1,{stroke:BURG,strokeWidth:4});R.line(g,1000,832,1160,832,a+1.85,0.1,{stroke:BURG,strokeWidth:4});
 const dia=mk('path',{d:'M960 820 L972 832 L960 844 L948 832Z',fill:GOLD},g);pop(dia,a+1.85,0.25);
 wtext(g,'تابعني على لينكدإن  ·  Modather Salama',960,905,{font:'cairo',size:40,t0:a+2.0,dur:0.95});
}
}
