# Soundtrack for the 30s LA webs ad (built on the Alenu ad engine), synthesized from scratch (no samples, no licensing).
# 120 BPM: punchy kick, clap on 2 and 4, 16th hats, side-chained bass and chords,
# riser-into-impact transitions on every scene cut, soft UI pops and bells.
# Usage: python soundtrack.py out.wav
import sys, wave
import numpy as np
from scipy.signal import butter, sosfilt

SR = 48000; DUR = 30.0; N = int(SR * DUR)
BPM = 120; B = 60 / BPM; S16 = B / 4
CUTS = [3, 8, 13, 18, 22, 25]                      # must match window.CUTS in index.html
rng = np.random.default_rng(11)
bus = {k: np.zeros((N, 2)) for k in ('drums', 'music', 'fx')}

def t_(n): return np.arange(n) / SR
def bp(x, lo, hi, o=2): return sosfilt(butter(o, [lo, hi], 'band', fs=SR, output='sos'), x)
def hp(x, f, o=2): return sosfilt(butter(o, f, 'high', fs=SR, output='sos'), x)
def lp(x, f, o=2): return sosfilt(butter(o, f, 'low', fs=SR, output='sos'), x)
def place(name, sig, t, g=1.0, pan=0.0):
    i = int(round(t * SR))
    if i >= N: return
    if sig.ndim == 1:
        l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
        sig = np.stack([sig * l, sig * r], 1) * 1.414
    j = min(N, i + len(sig)); bus[name][i:j] += sig[: j - i] * g

# ---------- instruments ----------
def kick(big=False):
    n = int((.6 if big else .38) * SR); t = t_(n)
    f = 44 + 150 * np.exp(-t * 32)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * (5 if big else 8))
    click = hp(rng.standard_normal(n), 2500) * np.exp(-t * 260) * .5
    return np.tanh((body + click) * 1.8) * .9

def clap():
    n = int(.32 * SR); t = t_(n); x = rng.standard_normal(n); e = np.zeros(n)
    for o in (0, .009, .018, .028): k = int(o * SR); e[k:] += np.exp(-(t[: n - k]) * 38)
    body = np.sin(2 * np.pi * 190 * t) * np.exp(-t * 30) * .4
    return bp(x, 900, 6000) * e * .55 + body

def hat(open_=False):
    n = int((.22 if open_ else .05) * SR); t = t_(n)
    return hp(rng.standard_normal(n), 7000, 4) * np.exp(-t * (14 if open_ else 90)) * .35

def bass_note(f, d):
    n = int(d * SR); t = t_(n)
    saw = 2 * ((f * t) % 1) - 1
    x = lp(saw * .6 + np.sin(2 * np.pi * f * t), 380)
    env = np.minimum(1, t / .005) * np.exp(-t * 3.5)
    return np.tanh(x * env * 1.6) * .55

def chord(freqs, d):
    n = int(d * SR); t = t_(n); x = np.zeros(n)
    for f in freqs:
        for det in (-.004, .004):                 # detuned saw pair for width
            x += 2 * ((f * (1 + det) * t) % 1) - 1
    x = lp(x / (len(freqs) * 2), 1800)
    fade = np.minimum(1, np.minimum(t / .03, (t[-1] - t) / .05))
    return x * fade * .35

def riser(d=.6):
    n = int(d * SR); t = t_(n); x = rng.standard_normal(n)
    out = np.zeros(n); seg = int(.02 * SR)
    for s in range(0, n, seg):                    # sweeping band-pass, stepwise
        c = 500 * (14 ** (s / n))
        out[s:s + seg] = bp(x[max(0, s - 2000): s + seg], c * .7, min(c * 1.4, 20000))[-len(out[s:s + seg]):]
    tone = np.sin(2 * np.pi * np.cumsum(300 + 900 * (t / d) ** 2) / SR) * .25
    env = (t / d) ** 2.2
    return (out * 1.2 + tone) * env

def impact():
    n = int(1.1 * SR); t = t_(n)
    boom = np.sin(2 * np.pi * np.cumsum(30 + 60 * np.exp(-t * 9)) / SR) * np.exp(-t * 3.2)
    crash = lp(rng.standard_normal(n), 5000) * np.exp(-t * 6) * .35
    snap = hp(rng.standard_normal(n), 3000) * np.exp(-t * 80) * .6
    return np.tanh((boom * 1.4 + crash + snap) * 1.3)

def pop(f=900):
    n = int(.12 * SR); t = t_(n)
    return np.sin(2 * np.pi * np.cumsum(f * (1 + 1.2 * np.exp(-t * 60))) / SR) * np.exp(-t * 40) * .6

def tick():
    n = int(.02 * SR); return hp(rng.standard_normal(n), 4000) * np.exp(-t_(n) * 300) * .25

def bell(f=1046):
    n = int(1.0 * SR); t = t_(n)
    mod = np.sin(2 * np.pi * f * 3.5 * t) * 2.2 * np.exp(-t * 6)
    return np.sin(2 * np.pi * f * t + mod) * np.exp(-t * 4.5) * .45

# ---------- arrangement ----------
roots = [110.0, 87.31, 130.81, 98.0]                       # A2 F2 C3 G2
chords = [(220, 261.6, 329.6), (174.6, 220, 261.6), (196, 261.6, 329.6), (196, 246.9, 293.7)]
end_t = 29.2
for k in range(int(DUR / S16)):
    t = k * S16; beat = k // 4; s = k % 4
    if t > end_t: break
    bar = int(t // (4 * B)); ci = bar % 4
    intro = t < 3.0
    fill = 24.5 <= t < 25.0                                  # snare roll into the end card
    if s == 0 and not fill:
        place('drums', kick(), t, .95)
    if not intro and not fill:
        if s == 0 and beat % 2 == 1: place('drums', clap(), t, .8, -.1)
        place('drums', hat(open_=(s == 2 and beat % 4 == 3)), t, .9 if s == 2 else .45, .35)
    if fill: place('drums', clap(), t, .35 + .5 * (t - 24.5) / .5, .1)
    # bass: 8th notes, octave jump on the off-beat
    if s in (0, 2) and t >= .5 and not fill:
        f = roots[ci] * (2 if s == 2 and beat % 2 else 1)
        place('music', bass_note(f, B / 2), t, .9 if not intro else .6)
    if s == 0 and beat % 4 == 0 and t >= 3.0:
        place('music', chord(chords[ci], 4 * B), t, .55, 0)

# opening + cuts
place('fx', impact(), 0.0, .9)
for c in CUTS:
    place('fx', riser(.55), c - .55, .55, -.4)
    place('fx', impact(), c, .75, .2)
    place('drums', kick(big=True), c, .9)
# UI moments
for i in range(5): place('fx', pop(650 + i * 90), 3.45 + i * .1, .5, (i - 2) * .25)          # cards dealt
place('fx', bell(1046), 4.0, .4)                                                               # hand opens
for c in (5.5, 6.5, 7.5): place('fx', pop(520), c, .55, .3); place('fx', tick(), c + .05, .5)  # hand turns
place('fx', bell(1318), 9.0, .55)                                                              # design opens out of the skeleton
for k in range(12): place('fx', tick(), 10.2 + k * .2, .35, -.2)                               # the site scrolls
place('fx', pop(780), 9.9, .6)                                                                 # contact bar rises
place('fx', pop(600), 12.3, .8)                                                                # tap on WhatsApp
for i in range(4): place('fx', bell(1568 - i * 66), 14.0 + i * .5, .45, (i - 1.5) * .3)        # messages arrive
for i in range(4): place('fx', bell(988 + i * 132), 19.0 + i * .5, .55, (i - 1.5) * .4)          # tiles flip to included
for i in range(3): place('fx', pop(520 + i * 120), 22.5 + i * .5, .7); place('fx', bell(1318 + i * 176), 22.85 + i * .5, .4)   # steps land, each checked
place('fx', bell(1318), 26.4, .7)                                                               # CTA

# ---------- mix ----------
# side-chain: duck music on every kick
duck = np.ones(N)
for k in range(int(DUR / B)):
    i = int(k * B * SR); n = int(.28 * SR); j = min(N, i + n)
    duck[i:j] = np.minimum(duck[i:j], 1 - .65 * np.exp(-t_(j - i) * 14))
mix = bus['drums'] * 1.0 + bus['music'] * duck[:, None] * .8 + bus['fx'] * .7
mix = np.tanh(mix * .9)                                     # glue / soft clip
fade = np.ones(N); f0 = int(28.9 * SR); fade[f0:] = np.linspace(1, 0, N - f0)
mix *= fade[:, None]
mix = mix / np.abs(mix).max() * .93
with wave.open(sys.argv[1], 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((mix * 32767).astype('<i2').tobytes())
print('wrote', sys.argv[1])
