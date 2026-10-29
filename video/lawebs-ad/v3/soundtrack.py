# Soundtrack for the 30s LA webs studio reel (v3), synthesized from scratch: no samples, nothing to license.
# Calm and polished: a half-time groove at 120 BPM (it feels like 60), an FM electric piano in D minor
# (Dm9 – Bbmaj7 – Fmaj9 – C6/9), a deep sub, soft marimba notes on the on-screen moments, and a convolution reverb
# for space. The bar grid starts at 1.0s so every cut (3, 5, 7, 9, 11, 13, 19, 23) lands on a downbeat.
# Usage: python soundtrack.py out.wav
import sys, wave
import numpy as np
from scipy.signal import butter, sosfilt, fftconvolve

SR = 48000; DUR = 30.0; N = int(SR * DUR)
B = .5; BAR = 2.0; T0 = 1.0                       # beat, bar, first downbeat
rng = np.random.default_rng(7)
bus = {k: np.zeros((N, 2)) for k in ('drums', 'music', 'fx')}

def t_(n): return np.arange(n) / SR
def bp(x, lo, hi, o=2): return sosfilt(butter(o, [lo, hi], 'band', fs=SR, output='sos'), x)
def hp(x, f, o=2): return sosfilt(butter(o, f, 'high', fs=SR, output='sos'), x)
def lp(x, f, o=2): return sosfilt(butter(o, f, 'low', fs=SR, output='sos'), x)
def place(name, sig, t, g=1.0, pan=0.0):
    i = int(round(t * SR))
    if i >= N or i < 0: return
    if sig.ndim == 1:
        l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
        sig = np.stack([sig * l, sig * r], 1) * 1.414
    j = min(N, i + len(sig)); bus[name][i:j] += sig[: j - i] * g

# ---------- instruments ----------
def rhodes(f, d, vel=1.0):
    # FM electric piano: a sine carrier, a bell-like attack from the modulator, a short tine ping, gentle tremolo
    n = int(d * SR); t = t_(n)
    idx = 1.6 * np.exp(-t * 5) + .25
    x = np.sin(2 * np.pi * f * t + idx * np.sin(2 * np.pi * f * t))
    x += .18 * np.sin(2 * np.pi * f * 7.02 * t) * np.exp(-t * 22)
    env = (1 - np.exp(-t * 300)) * np.exp(-t * 1.1) * np.minimum(1, (t[-1] - t) / .12 + 1e-9)
    trem = 1 + .07 * np.sin(2 * np.pi * 4.6 * t)
    return lp(x * env * trem, 3800) * .2 * vel

def rchord(freqs, d, vel=1.0, strum=.012):
    n = int((d + strum * len(freqs)) * SR); out = np.zeros(n)
    for i, f in enumerate(freqs):
        k = int(i * strum * SR); s = rhodes(f, d, vel); out[k:k + len(s)] += s
    return out

def sub(f, d):
    n = int(d * SR); t = t_(n)
    x = np.sin(2 * np.pi * f * t) + .25 * np.sin(4 * np.pi * f * t)
    env = np.minimum(1, t / .015) * np.minimum(1, (t[-1] - t) / .1 + 1e-9) * (.75 + .25 * np.exp(-t * 2))
    return np.tanh(x * env * 1.3) * .42

def marimba(f, d=.9):
    n = int(d * SR); t = t_(n)
    x = np.sin(2 * np.pi * f * t) * np.exp(-t * 7) + .35 * np.sin(2 * np.pi * f * 3.99 * t) * np.exp(-t * 18)
    click = hp(rng.standard_normal(n), 3000) * np.exp(-t * 400) * .15
    return (x + click) * (1 - np.exp(-t * 500)) * .32

def pad(freqs, d, lo=500, hi=2400):
    n = int(d * SR); t = t_(n); x = np.zeros(n)
    for f in freqs:
        for det in (-.005, 0, .005): x += np.sin(2 * np.pi * f * (1 + det) * t + det * 300) + .3 * (2 * ((f * (1 + det) * t) % 1) - 1)
    x /= len(freqs) * 3
    out = np.zeros(n); seg = int(.05 * SR)
    for s in range(0, n, seg):
        c = lo * (hi / lo) ** (s / n)
        out[s:s + seg] = lp(x[max(0, s - 4000): s + seg], c)[-len(out[s:s + seg]):]
    env = np.minimum(1, t / (min(d, 3) * .5)) * np.minimum(1, (t[-1] - t) / .6 + 1e-9)
    return out * env * .3

def kick():
    n = int(.5 * SR); t = t_(n)
    f = 45 + 75 * np.exp(-t * 26)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 5.5)
    return np.tanh(body * 1.6) * .8 + lp(rng.standard_normal(n), 900) * np.exp(-t * 60) * .08

def rim():
    n = int(.12 * SR); t = t_(n)
    return (np.sin(2 * np.pi * 1700 * t) * np.exp(-t * 70) * .35 + bp(rng.standard_normal(n), 1200, 5000) * np.exp(-t * 55) * .3)

def snap():
    n = int(.25 * SR); t = t_(n); x = rng.standard_normal(n); e = np.zeros(n)
    for o in (0, .007, .015): k = int(o * SR); e[k:] += np.exp(-(t[: n - k]) * 45)
    return bp(x, 1500, 7000) * e * .3

def hat(open_=False):
    n = int((.2 if open_ else .045) * SR); t = t_(n)
    return hp(rng.standard_normal(n), 8000, 4) * np.exp(-t * (16 if open_ else 110)) * .22

def shaker():
    n = int(.06 * SR); t = t_(n)
    return bp(rng.standard_normal(n), 4000, 11000) * np.sin(np.pi * t / t[-1]) ** 2 * .08

def whoosh(d=.6, up=True, lo=250, hi=5000):
    n = int(d * SR); t = t_(n); x = rng.standard_normal(n)
    out = np.zeros(n); seg = int(.015 * SR)
    for s in range(0, n, seg):
        p = s / n if up else 1 - s / n
        c = lo * (hi / lo) ** p
        out[s:s + seg] = bp(x[max(0, s - 1500): s + seg], c * .6, min(c * 1.6, 18000))[-len(out[s:s + seg]):]
    return out * np.sin(np.pi * t / d) ** 2 * .45

def swell(d=.6):                                   # a reversed-cymbal style swell into a downbeat
    n = int(d * SR); t = t_(n)
    return hp(rng.standard_normal(n), 3000) * (t / d) ** 3 * .35

def boom():
    n = int(1.6 * SR); t = t_(n)
    return np.sin(2 * np.pi * np.cumsum(38 + 30 * np.exp(-t * 6)) / SR) * np.exp(-t * 2.6) * .7

def click():
    n = int(.025 * SR); t = t_(n)
    return hp(rng.standard_normal(n), 2500) * np.exp(-t * 450) * .4 + np.sin(2 * np.pi * 2400 * t) * np.exp(-t * 350) * .2

def tick():
    n = int(.018 * SR); return hp(rng.standard_normal(n), 5000) * np.exp(-t_(n) * 380) * .18

def bell(f):
    n = int(2.2 * SR); t = t_(n)
    mod = np.sin(2 * np.pi * f * 2.0 * t) * 1.2 * np.exp(-t * 3)
    return np.sin(2 * np.pi * f * t + mod) * np.exp(-t * 2.2) * .22

# ---------- harmony ----------
CH = {
    'Dm9': ((73.42,), (174.61, 220.0, 261.63, 329.63)),
    'Bbmaj7': ((58.27,), (146.83, 174.61, 220.0, 261.63)),
    'Fmaj9': ((87.31,), (220.0, 261.63, 329.63, 392.0)),
    'C69': ((65.41,), (164.81, 196.0, 220.0, 293.66)),
    'Gm9': ((49.0,), (174.61, 220.0, 233.08, 293.66)),
    'A7b9': ((55.0,), (138.59, 196.0, 233.08, 277.18)),
}
# one chord per bar from the first downbeat (bar k starts at 1 + 2k)
BARS = ['Dm9', 'Dm9', 'Bbmaj7', 'Fmaj9', 'C69', 'Dm9', 'Bbmaj7', 'Fmaj9', 'C69', 'Dm9', 'Bbmaj7', 'Gm9', 'A7b9', 'Fmaj9', 'Fmaj9']
def bar_of(t): return int((t - T0) // BAR)
def chord_at(t): return BARS[max(0, min(len(BARS) - 1, bar_of(t)))]

def section(t):
    if t < 3.0: return 'intro'
    if t < 23.0: return 'groove'
    if t < 25.5: return 'break'
    return 'outro'

# ---------- arrangement ----------
# intro: the piano opens on Dm9 under the statement, a marimba note for each line, a swell into the first downbeat
place('music', rchord(CH['Dm9'][1], 3.2, .9, .03), 0.0, 1.0)
place('music', pad(CH['Dm9'][1], 3.4, 400, 1600), 0.0, .9)
for t, f in ((.05, 587.33), (.35, 698.46), (.65, 880.0)): place('fx', marimba(f), t, .7, .2)
place('fx', swell(.7), 2.3, .8, -.2)

for k in range(int(DUR / (B / 2))):                # 16th grid from the first downbeat
    t = T0 + k * B / 2
    if t >= DUR: break
    sec = section(t)
    if sec in ('intro', 'outro'): continue
    pos = ((t - T0) % BAR) / (B / 2)                # 0..15 within the bar
    p = int(round(pos)) % 16
    c = chord_at(t)
    if sec == 'groove':
        full = t >= 19.0
        if p == 0: place('drums', kick(), t, .95)
        if p == 7 and bar_of(t) % 2 == 1: place('drums', kick(), t, .55)          # a soft push before the next bar
        if p == 8: place('drums', rim(), t, .9, -.15); full and place('drums', snap(), t, .55, .1)
        if p % 2 == 0: place('drums', hat(open_=(p == 14 and full)), t + (.025 if p % 4 == 2 else 0), .5 if p % 4 == 0 else .32, .3)
        place('drums', shaker(), t, .9 if p % 2 else .6, -.35)
        if p == 0: place('music', sub(CH[c][0][0], 1.85), t, 1.0)
        if p == 0: place('music', rchord(CH[c][1], 1.9, .95), t, 1.0)
        if p == 6: place('music', rchord(CH[c][1][1:], .5, .55), t, .8)          # a light offbeat comp
    elif sec == 'break':
        if p == 8: place('drums', rim(), t, .7, -.15)
        place('drums', shaker(), t, .6 if p % 2 else .4, -.35)

# the break: Gm9 held under the three words, a marimba note for each, a swell and A7b9 into the end card
place('music', pad(CH['Gm9'][1], 2.2, 600, 2600), 23.0, .9)
place('music', rchord(CH['Gm9'][1], 2.0, .8, .03), 23.0, .9)
for t, f in ((23.1, 587.33), (23.62, 698.46), (24.14, 880.0)): place('fx', marimba(f), t, .75, .15)
place('music', rchord(CH['A7b9'][1], .55, .7, .02), 25.0, .7)
place('fx', swell(.6), 24.9, .8)
# the end card: a low boom, a bell chord for the logo, Fmaj9 ringing out
place('fx', boom(), 25.5, .8)
for i, f in enumerate((349.23, 440.0, 523.25, 659.25)): place('fx', bell(f), 25.55 + i * .06, .55, (i - 1.5) * .25)
place('music', rchord(CH['Fmaj9'][1], 4.2, .9, .04), 25.5, 1.0)
place('music', sub(87.31, 4.0), 25.5, .8)
place('music', pad(CH['Fmaj9'][1], 4.5, 500, 2000), 25.5, .8)
place('fx', marimba(1046.5), 26.75, .45)                                  # the number

# transitions and on-screen moments
place('fx', whoosh(.7, True, 200, 3000), 2.7, .6)                         # the phone rises
for L in (5, 7, 9, 11): place('fx', whoosh(.6, False, 300, 6000), L - .4, .5, .3)   # the screens swipe
place('fx', whoosh(.8, True, 200, 2500), 12.75, .55, -.2)                  # the card leaves the phone
for i in range(4): place('fx', tick(), 13.7 + i * .07, .7, (i - 1.5) * .3)  # grid columns
for i in range(3): place('fx', tick(), 14.2 + i * .14, .8, -.3)             # spacing lines
place('fx', tick(), 14.62, .8, -.4)
place('fx', click(), 14.98, .9, .25)                                         # the cursor clicks the button
place('fx', marimba(1174.66, .6), 15.05, .4)                                 # selection
for i, f in enumerate((587.33, 698.46, 880.0, 1046.5)): place('fx', marimba(f, .7), 15.45 + i * .14, .38, -.3)   # palette
place('fx', bell(587.33), 16.15, .45)                                         # typeface
place('fx', whoosh(.6, False, 300, 4000), 18.55, .5)                         # out
place('fx', whoosh(.7, True, 200, 3000), 18.95, .55)                         # the phone rises
place('fx', click(), 20.9, .9, .2)                                           # tap on WhatsApp
place('fx', whoosh(.35, True, 600, 7000), 21.12, .45)                        # WhatsApp opens
for k in range(18): place('fx', tick(), 21.67 + k * .055, .55 + .2 * rng.random(), .1)   # typing
place('fx', marimba(880.0, .5), 22.62, .35)
place('fx', whoosh(.5, False, 300, 4000), 22.7, .45)

# ---------- mix ----------
duck = np.ones(N)                                   # a light side-chain on the kick
for k in range(int((DUR - T0) / BAR) + 1):
    for off in (0, 1.75):
        t = T0 + k * BAR + off
        if not (3.0 <= t < 23.0): continue
        i = int(t * SR); n = int(.25 * SR); j = min(N, i + n)
        duck[i:j] = np.minimum(duck[i:j], 1 - .35 * np.exp(-t_(j - i) * 12))
music = bus['music'] * duck[:, None]

def reverb(x, rt=2.4, wet=.25):                     # convolution with a synthetic stereo room
    n = int(rt * SR); t = t_(n)
    ir = np.stack([lp(rng.standard_normal(n), 6000) * np.exp(-t * 6.9 / rt) for _ in range(2)], 1)
    ir[: int(.012 * SR)] = 0; ir /= np.abs(ir).sum(0) ** .5 * 6
    y = np.stack([fftconvolve(x[:, c], ir[:, c])[: len(x)] for c in range(2)], 1)
    return x + y * wet / max(1e-9, np.abs(y).max()) * np.abs(x).max()

mix = bus['drums'] * .95 + reverb(music, 2.6, .32) * .85 + reverb(bus['fx'], 2.2, .3) * .6
mix = reverb(mix, 1.2, .06)
mix = np.tanh(mix * .85)
fade = np.ones(N); f0 = int(28.4 * SR); fade[f0:] = np.linspace(1, 0, N - f0) ** 1.6
mix *= fade[:, None]
mix = mix / np.abs(mix).max() * .93
with wave.open(sys.argv[1], 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((mix * 32767).astype('<i2').tobytes())
print('wrote', sys.argv[1])
