import json,sys,numpy as np,soundfile as sf
SR=48000;TOT=float(sys.argv[3]) if len(sys.argv)>3 else 68.5;n=int(TOT*SR)
ev=json.load(open(sys.argv[1]))['events'];rng=np.random.default_rng(3)
def band(x,lo,hi):
    X=np.fft.rfft(x);f=np.fft.rfftfreq(len(x),1/SR);X[(f<lo)|(f>hi)]=0;return np.fft.irfft(X,len(x))
out=np.zeros(n)
# marker scratch: band-limited noise gated by a stroke-rhythm envelope during every hand-drawing interval
base=band(rng.standard_normal(n),1800,7500);base/=np.abs(base).max()
env=np.zeros(n);t=np.arange(n)/SR
for a,b,k in ev:
    if k!='draw':continue
    i,j=int(max(0,a)*SR),int(min(TOT,b)*SR)
    if j<=i:continue
    tt=t[i:j]-a;ph=rng.uniform(0,6)
    rhythm=0.55+0.45*np.abs(np.sin(2*np.pi*(5.5+rng.uniform(-1,1))*tt+ph))
    fade=np.minimum(1,np.minimum(tt/0.03,(b-a-tt)/0.05).clip(0))
    env[i:j]=np.maximum(env[i:j],rhythm*fade)
k=int(0.01*SR);env=np.convolve(env,np.ones(k)/k,'same')
out+=base*env*0.11
for a,b,kind in ev:
    i=int(max(0,a)*SR)
    if kind=='pop':
        d=int(0.09*SR);tt=np.arange(d)/SR;f=620+700*tt/0.09
        s=np.sin(2*np.pi*np.cumsum(f)/SR)*np.exp(-tt*38)*0.10
    elif kind in('whoosh','soft'):
        d=int(0.5*SR);tt=np.arange(d)/SR;nz=band(rng.standard_normal(d),250,3500)
        s=nz/np.abs(nz).max()*np.sin(np.pi*tt/0.5)**2*(0.12 if kind=='whoosh' else 0.06)
    elif kind=='stamp':
        d=int(0.35*SR);tt=np.arange(d)/SR
        s=(np.sin(2*np.pi*85*tt)*np.exp(-tt*16)*0.45+band(rng.standard_normal(d),800,5000)*np.exp(-tt*60)*0.05)
    elif kind=='tick':
        for tk in np.arange(a,b,0.075):
            d=int(0.012*SR);tt=np.arange(d)/SR;c=np.sin(2*np.pi*2400*tt)*np.exp(-tt*500)*0.05
            ii=int(tk*SR);ee=min(n,ii+d);out[ii:ee]+=c[:ee-ii]
        continue
    else: continue
    e=min(n,i+len(s));out[i:e]+=s[:e-i]
sf.write(sys.argv[2],np.stack([out,out],1).astype('float32'),SR);print('sfx ok')
