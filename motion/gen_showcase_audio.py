"""Showcase audio (music bed + UI SFX): python3 gen_showcase_audio.py <seconds> <out.wav>"""
import sys, wave, subprocess
import numpy as np

dur = float(sys.argv[1]); out_path = sys.argv[2]
sr = 44100; n = int(sr * dur); FPS = 30
subprocess.run([sys.executable, "gen_bed.py", str(dur), "/tmp/bed.wav"], check=True)
w = wave.open("/tmp/bed.wav"); bed = np.frombuffer(w.readframes(w.getnframes()), np.int16) / 32768.0; w.close()
mix = np.zeros(n); mix[:min(n, len(bed))] += 0.5 * bed[:n]
rng = np.random.default_rng(11)

def put(x, t):
    i = int(t * sr)
    if i < n: mix[i:i + len(x)] += x[:n - i]

def whoosh(L=0.4, amp=0.3):
    m = int(L * sr); tt = np.arange(m) / sr
    x = rng.standard_normal(m); k = np.convolve(x, np.ones(40) / 40, "same")
    return amp * (0.6 * k + 0.12 * x) * np.sin(np.pi * np.clip(tt / L, 0, 1)) ** 2

def tap(amp=0.35):
    m = int(0.09 * sr); tt = np.arange(m) / sr
    return amp * np.sin(2 * np.pi * (1500 - 7000 * tt) * tt) * np.exp(-tt * 45)

def key(amp=0.12):
    m = int(0.03 * sr); tt = np.arange(m) / sr
    return amp * np.sin(2 * np.pi * 2400 * tt) * np.exp(-tt * 140)

def hit(amp=0.5):
    m = int(0.6 * sr); tt = np.arange(m) / sr
    return amp * np.sin(2 * np.pi * (70 * tt + 40 * (1 - np.exp(-tt * 20)) / 20)) * np.exp(-tt * 7)

def chime(f0, amp=0.18):
    m = int(0.9 * sr); tt = np.arange(m) / sr
    return amp * (np.sin(2 * np.pi * f0 * tt) + 0.4 * np.sin(2 * np.pi * f0 * 2 * tt)) * np.exp(-tt * 5)

put(whoosh(0.7), 0.0); put(hit(), 0.6)
for fr in (150, 330, 600):                       # screen transitions
    put(whoosh(0.45), (fr - 4) / FPS)
put(whoosh(0.6, 0.35), (720 - 12) / FPS); put(hit(0.6), 720 / FPS)
for fr in (118, 150 + 136, 330 + 56, 330 + 146, 330 + 192, 330 + 232, 330 + 258, 600 + 84):
    put(tap(), fr / FPS)
for i in range(7):                               # typing "BINGOOO"
    put(key(), (330 + 82 + i * 4.3) / FPS)
for i, fr in enumerate((330 + 60, 330 + 150)):  # colour swap
    put(chime(660 + 200 * i), fr / FPS)
for i, fr in enumerate((600 + 28, 600 + 40, 600 + 52)):  # checklist ticks
    put(chime(880 + 220 * i, 0.12), fr / FPS)
put(chime(990, 0.2), (720 + 40) / FPS)
mix *= np.minimum(1, (dur - np.arange(n) / sr) / 1.5)
mix /= np.abs(mix).max() / 0.9
o = wave.open(out_path, "wb"); o.setnchannels(1); o.setsampwidth(2); o.setframerate(sr)
o.writeframes((mix * 32767).astype(np.int16).tobytes()); o.close()
