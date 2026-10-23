"""Product video audio: python3 gen_product_audio.py <seconds> <out.wav>  (needs kokoro model in /tmp/kk, bed from gen_bed.py)"""
import sys, wave, subprocess
import numpy as np, soundfile as sf
from kokoro_onnx import Kokoro

dur = float(sys.argv[1]); out_path = sys.argv[2]
sr = 44100; n = int(sr * dur); FPS = 30
subprocess.run([sys.executable, "gen_bed.py", str(dur), "/tmp/bed.wav"], check=True)
bed, _ = sf.read("/tmp/bed.wav")
mix = np.zeros(n); mix[:len(bed)] += 0.38 * bed[:n]
rng = np.random.default_rng(7)

def put(x, t):
    i = int(t * sr); mix[i:i + len(x)] += x[:max(0, n - i)]

def whoosh(L=0.45, amp=0.35):
    m = int(L * sr); tt = np.arange(m) / sr
    x = rng.standard_normal(m)
    k = np.convolve(x, np.ones(40) / 40, "same")  # crude low-pass sweep
    env = np.sin(np.pi * np.clip(tt / L, 0, 1)) ** 2
    return amp * (0.6 * k + 0.4 * x * 0.3) * env

def pop(amp=0.3):
    m = int(0.12 * sr); tt = np.arange(m) / sr
    return amp * np.sin(2 * np.pi * (900 - 5000 * tt) * tt) * np.exp(-tt * 38)

def hit(amp=0.5):
    m = int(0.6 * sr); tt = np.arange(m) / sr
    return amp * np.sin(2 * np.pi * (70 * tt + 40 * (1 - np.exp(-tt * 20)) / 20)) * np.exp(-tt * 7)

INTRO, SCENE, ITEMS = 70, 190, 3
starts = [INTRO + i * (SCENE - 12) for i in range(ITEMS)]
put(whoosh(0.5), 0.0)
for s in starts + [starts[-1] + SCENE - 12]:
    put(whoosh(), (s - 4) / FPS); put(hit(), s / FPS)
for s in starts:
    for b in range(1, 4):
        put(pop(), (s + 28 + 46 * b) / FPS)

k = Kokoro("/tmp/kk/kokoro-v1.0.onnx", "/tmp/kk/voices-v1.0.bin")
lines = [
    (0.35, "Meet the Bingooo lineup."),
    (starts[0] / FPS + 0.5, "The T-shirt. Combed cotton, classic crewneck. Rupees six ninety-nine."),
    (starts[1] / FPS + 0.5, "The oversized. Two forty G S M french terry. Rupees twelve ninety-nine."),
    (starts[2] / FPS + 0.5, "The hoodie. Four thirty G S M fleece. Rupees eight forty-nine."),
    ((starts[2] + SCENE - 12) / FPS + 0.4, "Or design your own. Bingooo. Wear what defines you."),
]
vo = np.zeros(n)
for t, text in lines:
    s, r = k.create(text, voice="am_michael", speed=1.0, lang="en-us")
    s = np.interp(np.arange(int(len(s) * sr / r)), np.arange(len(s)) * sr / r, s)
    print(round(t, 1), round(len(s) / sr, 1), text)
    i = int(t * sr); vo[i:i + len(s)] += s[:max(0, n - i)]
mix += 1.1 * vo
mix *= np.minimum(1, (dur - np.arange(n) / sr) / 1.2)
mix /= np.abs(mix).max() / 0.92
w = wave.open(out_path, "wb"); w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr)
w.writeframes((mix * 32767).astype(np.int16).tobytes()); w.close()
