import json, soundfile as sf, numpy as np
from kokoro_onnx import Kokoro
LINES = [
 "Your style. Your story.",
 "Meet Bingooo custom T-shirt design.",
 "Pick your tee, your colour, your fit.",
 "Add your art, your words, your logo, and watch it come alive in our live design studio.",
 "Every print is crisp and sharp, on heavyweight premium cotton that is built to last.",
 "Made just for you, and delivered to your door.",
 "Bingooo. Wear what defines you. Design yours today.",
]
k = Kokoro("/tmp/kk/kokoro.onnx", "/tmp/kk/voices.bin")
out = []
for i, t in enumerate(LINES):
    s, sr = k.create(t, voice="am_michael", speed=1.0, lang="en-us")
    s = np.concatenate([s, np.zeros(int(sr*0.05))])
    sf.write(f"public/vo/{i}.wav", s, sr)
    out.append({"text": t, "dur": len(s)/sr})
    print(i, round(len(s)/sr,2), t)
json.dump(out, open("src/vo.json","w"), indent=1)
