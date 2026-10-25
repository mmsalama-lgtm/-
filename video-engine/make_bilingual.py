# Patch a generated episode page: bilingual captions (Arabic karaoke pill + English line), counter moved bottom-left
import sys
p=sys.argv[1];s=open(p).read()
def rep(a,b):
    global s
    assert s.count(a)==1,(a[:70],s.count(a)); s=s.replace(a,b)
rep("].map(([a,b,s])=>[T(a),T(b),s]);","].map(([a,b,s,e])=>[T(a),T(b),s,e]);")
rep("const capEls=CAPS.map(([a,b,s],i)=>{","const capEls=CAPS.map(([a,b,s,en],i)=>{")
rep("const t=mk('text',{x:960,y:992,'text-anchor':'middle',direction:'rtl','font-family':\"'Cairo'\",'font-weight':800,'font-size':42,fill:'#fff'},g);",
    "const t=mk('text',{x:960,y:944,'text-anchor':'middle',direction:'rtl','font-family':\"'Cairo'\",'font-weight':800,'font-size':40,fill:'#fff'},g);")
rep("  return {g,rect,t,a:a-0.08,end,sa:a,sb:b,sps}});",
    "  const rectE=mk('rect',{rx:22,ry:22,fill:'#fff','fill-opacity':0.95,stroke:NAVY,'stroke-width':2.5},g);const te=mk('text',{x:960,y:1013,'text-anchor':'middle',direction:'ltr','font-family':\"'Cairo'\",'font-weight':700,'font-size':29,fill:NAVY},g);te.textContent=en||'';\n  return {g,rect,t,te,rectE,a:a-0.08,end,sa:a,sb:b,sps}});")
rep("function capsInit(){for(const c of capEls){const bb=c.t.getBBox();c.rect.setAttribute('x',bb.x-38);c.rect.setAttribute('y',bb.y-8);c.rect.setAttribute('width',bb.width+76);c.rect.setAttribute('height',bb.height+16)}}",
    "function capsInit(){for(const c of capEls){const bb=c.t.getBBox();c.rect.setAttribute('x',bb.x-38);c.rect.setAttribute('y',bb.y-8);c.rect.setAttribute('width',bb.width+76);c.rect.setAttribute('height',bb.height+16);\n  const be=c.te.getBBox();if(!c.te.textContent){c.rectE.setAttribute('width',0);continue}c.rectE.setAttribute('x',be.x-22);c.rectE.setAttribute('y',be.y-4);c.rectE.setAttribute('width',be.width+44);c.rectE.setAttribute('height',be.height+8)}}")
import re
s=re.sub(r"\{x:960,y:1056,'text-anchor':'middle'(,'font-family':\"'Cairo'\",'font-weight':700,'font-size':24)",r"{x:70,y:1058,'text-anchor':'start'\1",s,count=1)
open(p,'w').write(s);print('bilingual ok')
