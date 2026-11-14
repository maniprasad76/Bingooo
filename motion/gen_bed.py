"""Generate the music bed for the realistic cuts: python3 gen_bed.py <seconds> <out.wav>"""
import sys, wave
import numpy as np

dur = float(sys.argv[1]); path = sys.argv[2]
sr = 44100; n = int(sr * dur); t = np.arange(n) / sr
beat = 60 / 100
out = np.zeros(n)
rng = np.random.default_rng(3)
# warm pad: Am - F - C - G, one bar each, detuned soft saws
chords = [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]]
for i in range(int(dur / (beat * 4)) + 1):
    t0 = i * beat * 4
    for note in chords[i % 4]:
        f = 440 * 2 ** ((note - 69) / 12)
        for det in (-0.004, 0.004):
            seg = slice(int(t0 * sr), min(n, int((t0 + beat * 4 + 0.5) * sr)))
            tt = t[seg] - t0
            env = np.minimum(1, tt / 0.8) * np.exp(-np.maximum(0, tt - beat * 4) * 6)
            out[seg] += 0.05 * env * sum(np.sin(2 * np.pi * f * (1 + det) * k * tt) / k**2 for k in range(1, 5))
# kick on the beat after the intro, hat on the offbeat
for b in range(int(dur / beat)):
    tb = b * beat
    if tb < 1.6:
        continue
    k = slice(int(tb * sr), min(n, int((tb + 0.35) * sr))); tt = np.arange(k.stop - k.start) / sr
    out[k] += 0.5 * np.sin(2 * np.pi * (48 * tt + 70 * (1 - np.exp(-tt * 30)) / 30)) * np.exp(-tt * 9)
    h = int((tb + beat / 2) * sr); L = int(0.05 * sr)
    if h + L < n:
        out[h:h + L] += 0.05 * rng.standard_normal(L) * np.exp(-np.arange(L) / sr * 70)
out *= np.minimum(1, t / 1.5)
out /= np.abs(out).max() / 0.7
w = wave.open(path, "wb"); w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr)
w.writeframes((out * 32767).astype(np.int16).tobytes()); w.close()
