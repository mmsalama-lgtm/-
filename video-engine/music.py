# Light, optimistic ukulele bed (Karplus-Strong) + soft bass + shaker + sparse bells, synthesized offline.
import numpy as np, soundfile as sf, sys
SR=48000; TOTAL=float(sys.argv[2]); BPM=100; beat=60/BPM; bar=4*beat
n=int(TOTAL*SR)+SR*3
L=np.zeros(n); R=np.zeros(n)
def hz(m): return 440*2**((m-69)/12)
cache={}
def pluck(m, dur=1.6, seed=0):
    key=(m,seed)
    if key in cache: return cache[key]
    f=hz(m); N=int(round(SR/f)); rng=np.random.default_rng(seed+m)
    exc=rng.uniform(-1,1,N)
    for _ in range(3): exc=0.5*(exc+np.roll(exc,1))
    tot=int(dur*SR); y=np.zeros(tot+1); y[1:N+1]=exc; pos=N+1
    dec=0.5*0.9965
    while pos<tot+1:
        e=min(pos+N,tot+1); k=e-pos
        y[pos:e]=dec*(y[pos-N:pos-N+k]+y[pos-N-1:pos-N-1+k]); pos=e
    y=y[1:]; y*=np.exp(-np.arange(tot)/SR*1.8)
    att=int(0.004*SR); y[:att]*=np.linspace(0,1,att)
    cache[key]=y/np.abs(y).max(); return cache[key]
def add(sig,t,g=1.0,pan=0.0):
    i=int(t*SR); e=min(n,i+len(sig)); s=sig[:e-i]*g
    L[i:e]+=s*(1-pan)*0.5*2**0.5; R[i:e]+=s*(1+pan)*0.5*2**0.5
# ukulele voicings (strings 4..1), reentrant G tuning
C=[67,60,64,72]; G=[67,62,67,71]; Am=[69,60,64,69]; F=[69,60,65,69]; Dm=[69,62,65,69]
prog=[C,G,Am,F]; roots=[48,43,45,41]
pattern=[(0,'D',1.0),(2,'D',0.8),(3,'U',0.55),(5,'U',0.55),(6,'D',0.75),(7,'U',0.5)]
end_t=TOTAL-2.6; nb=int(end_t/bar)+1
for b in range(nb):
    ch=prog[b%4]; t0=b*bar
    if t0>end_t: break
    for (e8,d,v) in pattern:
        t=t0+e8*beat/2
        if t>end_t: break
        strs=ch if d=='D' else ch[::-1][:3]
        for k,m in enumerate(strs):
            add(pluck(m,seed=b*7+e8+k),t+k*(0.013 if d=='D' else 0.010),0.22*v*(0.9+0.2*((b+e8+k)%3)/2),pan=-0.25+0.15*k)
    # soft bass: sine + 2nd harmonic, beats 1 & 3
    for bt in (0,2):
        t=t0+bt*beat; f=hz(roots[b%4]); d=int(1.1*SR); tt=np.arange(d)/SR
        s=(np.sin(2*np.pi*f*tt)+0.25*np.sin(4*np.pi*f*tt))*np.exp(-tt*3.2); s[:200]*=np.linspace(0,1,200)
        add(s,t,0.30)
    # shaker 8ths
    rng=np.random.default_rng(b)
    for e8 in range(8):
        t=t0+e8*beat/2; d=int(0.06*SR); s=rng.standard_normal(d); s=np.diff(np.diff(s,prepend=0),prepend=0)
        s*=np.exp(-np.arange(d)/SR*60); add(s,t,0.012*(1.4 if e8%2 else 0.8),pan=0.3)
    # sparse bell every 2 bars
    if b%2==0:
        m=ch[3]+12; f=hz(m); d=int(1.8*SR); tt=np.arange(d)/SR
        s=(np.sin(2*np.pi*f*tt)+0.3*np.sin(2*np.pi*f*2.76*tt)*np.exp(-tt*6))*np.exp(-tt*2.2)
        add(s,t0+beat*0.02,0.05,pan=0.2)
# final ringing C chord
tf=nb*bar if nb*bar<=end_t+bar else end_t
tf=min(tf,TOTAL-2.4)
for k,m in enumerate(C+[76]):
    add(pluck(m,dur=3.0,seed=99+k),tf+k*0.03,0.26,pan=-0.2+0.1*k)
tt=np.arange(int(3*SR))/SR; s=np.sin(2*np.pi*hz(48)*tt)*np.exp(-tt*1.5); add(s,tf,0.3)
# simple stereo reverb (noise IR)
def conv(x,ir):
    m=len(x)+len(ir)-1; N=1<<(m-1).bit_length()
    return np.fft.irfft(np.fft.rfft(x,N)*np.fft.rfft(ir,N),N)[:len(x)]
rng=np.random.default_rng(5); irl=int(1.3*SR); te=np.arange(irl)/SR
irL=rng.standard_normal(irl)*np.exp(-te*4.5); irR=rng.standard_normal(irl)*np.exp(-te*4.5)
irL[:int(0.02*SR)]=0; irR[:int(0.025*SR)]=0
wl=conv(L,irL); wr=conv(R,irR); wl*=np.abs(L).max()/np.abs(wl).max(); wr*=np.abs(R).max()/np.abs(wr).max()
L2=L+0.22*wl; R2=R+0.22*wr
out=np.stack([L2,R2],1)[:int(TOTAL*SR)]
fi=int(0.4*SR); out[:fi]*=np.linspace(0,1,fi)[:,None]
fo=int(1.2*SR); out[-fo:]*=np.linspace(1,0,fo)[:,None]
out/=np.abs(out).max()/0.7
sf.write(sys.argv[1],out.astype('float32'),SR)
print('ok',out.shape[0]/SR, 'final chord at',tf)
