import sys
from PIL import Image,ImageDraw
fs=sys.argv[2:];out=sys.argv[1];im0=Image.open(fs[0]);W0,H0=im0.size
w=640 if W0>H0 else 480;h=int(w*H0/W0);cols=2 if W0>H0 else 3;rows=(len(fs)+cols-1)//cols
S=Image.new('RGB',(w*cols,h*rows),'gray')
for i,f in enumerate(fs):
  im=Image.open(f).resize((w,h));d=ImageDraw.Draw(im);d.rectangle([0,0,110,22],fill='black');d.text((5,5),f.split('/')[-1],fill='yellow');S.paste(im,((i%cols)*w,(i//cols)*h))
S.save(out,quality=85)
