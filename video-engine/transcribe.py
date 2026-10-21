import sys, numpy as np, soundfile as sf, sherpa_onnx
M=sys.argv[1]; wav=sys.argv[2]
segs=[(float(a),float(b)) for a,b in (l.split() for l in open(sys.argv[3]))]
rec=sherpa_onnx.OfflineRecognizer.from_whisper(encoder=M+"/turbo-encoder.int8.onnx",decoder=M+"/turbo-decoder.int8.onnx",tokens=M+"/turbo-tokens.txt",language="ar",task="transcribe",num_threads=4)
x,sr=sf.read(wav,dtype="float32")
for a,b in segs:
    s=rec.create_stream(); s.accept_waveform(sr,x[int(max(0,a-0.15)*sr):int((b+0.15)*sr)]); rec.decode_stream(s)
    print(f"{a:6.2f} {b:6.2f} | {s.result.text}",flush=True)
