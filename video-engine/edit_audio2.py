import numpy as np, soundfile as sf, json, sys
x,sr=sf.read(sys.argv[1],dtype='float32'); cuts=json.load(open(sys.argv[4]))
fade=int(0.03*sr); segs=[];cur=0;removed=[]
for a,b,k in cuts:
    if (b-a)-k<=0: continue
    ca=a+k/2; cb=b-k/2; segs.append((cur,int(ca*sr))); cur=int(cb*sr); removed.append((round(ca,3),round(cb,3)))
segs.append((cur,len(x)))
out=x[segs[0][0]:segs[0][1]].copy()
for s,e in segs[1:]:
    nxt=x[s:e].copy(); r=np.linspace(0,1,fade,dtype='float32')
    out[-fade:]=out[-fade:]*(1-r)+nxt[:fade]*r; out=np.concatenate([out,nxt[fade:]])
sf.write(sys.argv[2],out,sr,subtype='PCM_24'); json.dump(removed,open(sys.argv[3],'w')); print(len(x)/sr,'->',len(out)/sr)
