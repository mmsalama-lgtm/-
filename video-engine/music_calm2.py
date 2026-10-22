# Calm & beautiful: felt piano chords + gentle lyrical melody (soft bell-piano) + warm strings pad + long reverb
import numpy as np, soundfile as sf, sys
SR=48000; TOTAL=float(sys.argv[2]); BPM=66; beat=60/BPM; bar=4*beat
n=int((TOTAL+5)*SR); L=np.zeros(n); R=np.zeros(n)
hz=lambda m:440*2**((m-69)/12)
def piano(m,dur=3.5,vel=1.0,bright=1.0):
    f=hz(m);t=np.arange(int(dur*SR))/SR;s=np.zeros_like(t)
    for k,a in enumerate([1,0.42*bright,0.2*bright,0.1*bright,0.05,0.025],1):
        s+=a*np.sin(2*np.pi*f*k*(1+0.0004*k*k)*t)*np.exp(-t*(1.0+0.8*k))
    att=int(0.007*SR);s[:att]*=np.linspace(0,1,att);return np.convolve(s,np.ones(5)/5,'same')*vel
def bell(m,dur=3.0):
    f=hz(m);t=np.arange(int(dur*SR))/SR
    s=np.sin(2*np.pi*f*t)*np.exp(-t*1.4)+0.25*np.sin(2*np.pi*f*2.0*t)*np.exp(-t*3)+0.08*np.sin(2*np.pi*f*3.01*t)*np.exp(-t*5)
    att=int(0.01*SR);s[:att]*=np.linspace(0,1,att);return s
def strings(ms,dur):
    t=np.arange(int(dur*SR))/SR;s=np.zeros_like(t)
    for m in ms:
        for det in (-0.08,0,0.08):
            f=hz(m)*2**(det/12);ph=2*np.pi*f*t+0.25*np.sin(2*np.pi*5.2*t)*(t>0.8)
            s+=np.sin(ph)+0.3*np.sin(2*ph)+0.12*np.sin(3*ph)
    env=np.minimum(1,t/2.0)*np.minimum(1,(dur-t)/1.5).clip(0);return s*env/(3*len(ms))
def add(sig,t,g,pan=0):
    i=int(t*SR);e=min(n,i+len(sig));s=sig[:e-i]*g;L[i:e]+=s*(1-pan);R[i:e]+=s*(1+pan)
# C major: Cmaj7 - Am7 - Fmaj7 - G(sus4->G)
prog=[[48,55,64,71],[45,52,60,67],[41,48,57,64],[43,50,59,62]]
mel=[[(0,76),(2,74),(3,72)],[(0,72),(2,71),(3,69)],[(0,69),(1.5,72),(3,76)],[(0,74),(2,71)],
     [(0,79),(2,76),(3,74)],[(0,72),(2,74),(3,76)],[(0,77),(2,76),(3,72)],[(0,74),(3,72)]]
end=TOTAL-3.4;nb=int(end/bar)+1
for b in range(nb):
    t0=b*bar
    if t0>end:break
    ch=prog[b%4]
    add(strings([ch[1],ch[2],ch[3]-12],bar+1.5),t0,0.11)
    add(piano(ch[0],4.5,0.9,0.7),t0,0.26,-0.15)
    for k,m in enumerate([ch[1]+12,ch[2]+12,ch[3]+12,ch[2]+12]):
        tk=t0+(k*2+1)*beat/2
        if tk<end:add(piano(m,2.8,0.6),tk,0.12,0.12*((k%3)-1))
    if b>=1:   # melody enters on bar 2
        for (bt,m) in mel[(b-1)%8]:
            tk=t0+bt*beat
            if tk<end:add(bell(m,3.2),tk,0.10,0.18);add(piano(m,3.0,0.5,1.2),tk,0.07,0.18)
tf=min(nb*bar,TOTAL-3.2)
for k,m in enumerate([48,55,60,64,67,72,76]):add(piano(m,5,0.8),tf+k*0.11,0.2,-0.25+0.08*k)
add(bell(84,4),tf+0.8,0.09,0.2);add(strings([55,60,64],4.5),tf,0.11)
def conv(x,ir):
    m=len(x)+len(ir)-1;N=1<<(m-1).bit_length();return np.fft.irfft(np.fft.rfft(x,N)*np.fft.rfft(ir,N),N)[:len(x)]
rng=np.random.default_rng(11);irl=int(2.8*SR);te=np.arange(irl)/SR
irL=rng.standard_normal(irl)*np.exp(-te*2.2);irR=rng.standard_normal(irl)*np.exp(-te*2.2);irL[:1100]=0;irR[:1400]=0
wl=conv(L,irL);wr=conv(R,irR);wl*=np.abs(L).max()/np.abs(wl).max();wr*=np.abs(R).max()/np.abs(wr).max()
out=np.stack([L+0.4*wl,R+0.4*wr],1)[:int(TOTAL*SR)]
fi=int(1.2*SR);out[:fi]*=np.linspace(0,1,fi)[:,None];fo=int(2.0*SR);out[-fo:]*=np.linspace(1,0,fo)[:,None]
out/=np.abs(out).max()/0.7;sf.write(sys.argv[1],out.astype('float32'),SR);print('calm2 ok',TOTAL)
