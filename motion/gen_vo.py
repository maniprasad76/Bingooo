import json, soundfile as sf, numpy as np
from kokoro_onnx import Kokoro
FPS=30
SEGS = [
 ["Your style.", "Your story.", "Your Bingooo."],
 ["Meet Bingooo Custom T-Shirts.", "Made for the ideas, words, artwork,", "and moments that make you, you."],
 ["Choose your tee.", "Your colour.", "Your fit.", "Then make it yours."],
 ["Add your artwork, your words, your logo,", "or an idea that exists only in your head,", "and bring it to life in our live design studio."],
 ["Every design is printed with crisp, precise detail", "on premium heavyweight cotton,", "made to feel good, look sharp, and stay with you."],
 ["Because this isn't just another T-shirt."],
 ["It's something you created.", "Something that represents you.", "Something nobody else has to wear the same way."],
 ["Designed by you.", "Made by Bingooo.", "Delivered to your door."],
 ["Bingooo.", "Wear what defines you.", "Design yours today."],
]
PART_GAP, SEG_GAP, LEAD, TAIL = 0.14, 0.45, 0.2, 1.2
k = Kokoro("/tmp/kk/kokoro.onnx", "/tmp/kk/voices.bin")
out, t = [], LEAD
for si, parts in enumerate(SEGS):
    chunks, offs, cur = [], [], 0.0
    for p in parts:
        s, sr = k.create(p, voice="am_michael", speed=1.0, lang="en-us")
        offs.append({"text": p, "off": round(cur*FPS), "dur": len(s)/sr})
        chunks += [s, np.zeros(int(sr*PART_GAP))]
        cur += len(s)/sr + PART_GAP
    sf.write(f"public/vo/{si}.wav", np.concatenate(chunks), sr)
    out.append({"start": round(t*FPS), "dur": cur, "parts": offs})
    print(si, round(t,2), round(cur,2))
    t += cur + SEG_GAP
json.dump({"segs": out, "total": round((t-SEG_GAP+TAIL)*FPS)}, open("src/vo.json","w"), indent=1)
print("total s", round(t-SEG_GAP+TAIL,1))
