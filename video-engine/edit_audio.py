import numpy as np, soundfile as sf, json, sys
x,sr=sf.read(sys.argv[1],dtype='float32')
# (silence_start, silence_end, keep_seconds) in original timeline
cuts=[(1.794,3.14,0.85),(5.56,6.62,0.6),(12.06,13.167,0.6),(15.884,17.089,0.9),(20.73,22.098,0.6),
      (28.634,29.915,0.6),(31.53,32.72,0.7),(46.53,47.59,0.6),(58.62,59.75,0.8),(61.64,62.81,0.7),(66.30,67.32,0.6)]
fade=int(0.03*sr)
segs=[];cur=0;removed=[]  # removed: (orig_start, length)
for a,b,k in cuts:
    L=(b-a)-k
    if L<=0: continue
    ca=a+k/2; cb=b-k/2           # remove the middle of the pause
    segs.append((cur,int(ca*sr))); cur=int(cb*sr); removed.append((ca,cb))
segs.append((cur,len(x)))
out=x[segs[0][0]:segs[0][1]].copy()
for s,e in segs[1:]:
    nxt=x[s:e].copy()
    r=np.linspace(0,1,fade,dtype='float32')
    out[-fade:]=out[-fade:]*(1-r)+nxt[:fade]*r
    out=np.concatenate([out,nxt[fade:]])
sf.write(sys.argv[2],out,sr,subtype='PCM_24')
json.dump(removed,open(sys.argv[3],'w'))
print(len(x)/sr,'->',len(out)/sr)
