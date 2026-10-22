# Calm background: soft felt-piano arpeggios + warm pad + long reverb (synthesized, royalty-free)
import numpy as np, soundfile as sf, sys
SR=48000; TOTAL=float(sys.argv[2]); BPM=68; beat=60/BPM; bar=4*beat
n=int((TOTAL+4)*SR); L=np.zeros(n); R=np.zeros(n)
hz=lambda m:440*2**((m-69)/12)
def piano(m,dur=3.5,vel=1.0):
    f=hz(m);t=np.arange(int(dur*SR))/SR;s=np.zeros_like(t)
    for k,a in enumerate([1,0.45,0.22,0.12,0.06,0.03],1):
        fk=f*k*(1+0.0004*k*k); s+=a*np.sin(2*np.pi*fk*t)*np.exp(-t*(1.1+0.9*k))
    att=int(0.006*SR); s[:att]*=np.linspace(0,1,att)
    s=np.convolve(s,np.ones(6)/6,'same')  # felt softness
    return s*vel
def pad(ms,dur):
    t=np.arange(int(dur*SR))/SR;s=np.zeros_like(t)
    for m in ms:
        for det in (-0.12,0.12):
            f=hz(m)*2**(det/12);s+=np.sin(2*np.pi*f*t+0.3*np.sin(2*np.pi*0.2*t))+0.25*np.sin(4*np.pi*f*t)
    env=np.minimum(1,t/1.6)*np.minimum(1,(dur-t)/1.2).clip(0);return s*env/len(ms)
def add(sig,t,g,pan=0):
    i=int(t*SR);e=min(n,i+len(sig));s=sig[:e-i]*g;L[i:e]+=s*(1-pan);R[i:e]+=s*(1+pan)
prog=[[53,57,60,64],[52,55,60,67],[50,53,57,60],[48,55,60,62]]   # Fmaj7, C/E, Dm7, Csus2
end=TOTAL-3.2;nb=int(end/bar)+1
for b in range(nb):
    t0=b*bar
    if t0>end:break
    ch=prog[b%4]
    add(pad([m-12 for m in ch[:3]],bar+1.2),t0,0.10)
    add(piano(ch[0]-12,4.0,0.9),t0,0.30,-0.1)
    arp=[ch[1]+12,ch[2]+12,ch[3]+12,ch[2]+12,ch[1]+24,ch[2]+12,ch[3]+12,ch[2]+12]
    for k,m in enumerate(arp):
        tk=t0+k*beat/2
        if tk>end:break
        add(piano(m,2.6,0.75 if k%2==0 else 0.55),tk,0.16,0.15*((k%3)-1))
tf=min(nb*bar,TOTAL-3.0)
for k,m in enumerate([48,55,60,64,67,72]):add(piano(m,4.5,0.8),tf+k*0.09,0.22,-0.2+0.08*k)
add(pad([48,55,64],4.0),tf,0.10)
def conv(x,ir):
    m=len(x)+len(ir)-1;N=1<<(m-1).bit_length();return np.fft.irfft(np.fft.rfft(x,N)*np.fft.rfft(ir,N),N)[:len(x)]
rng=np.random.default_rng(9);irl=int(2.4*SR);te=np.arange(irl)/SR
irL=rng.standard_normal(irl)*np.exp(-te*2.6);irR=rng.standard_normal(irl)*np.exp(-te*2.6);irL[:960]=0;irR[:1200]=0
wl=conv(L,irL);wr=conv(R,irR);wl*=np.abs(L).max()/np.abs(wl).max();wr*=np.abs(R).max()/np.abs(wr).max()
out=np.stack([L+0.35*wl,R+0.35*wr],1)[:int(TOTAL*SR)]
fi=int(1.0*SR);out[:fi]*=np.linspace(0,1,fi)[:,None];fo=int(1.8*SR);out[-fo:]*=np.linspace(1,0,fo)[:,None]
out/=np.abs(out).max()/0.7;sf.write(sys.argv[1],out.astype('float32'),SR);print('calm ok',TOTAL)
