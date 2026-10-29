# Soundtrack for the 30s LA webs ad (v2), synthesized from scratch: no samples, nothing to license.
# 120 BPM in C (C–G–Am–F). 0–2 builds with a hit on every montage cut, the drop lands at 2.0 as the last site
# shrinks into the hand; a break under the process (17–19), a second build into the wall of work at 20,
# a logo sting on the end card at 24. Every UI moment on screen has its sound.
# Usage: python soundtrack.py out.wav
import sys, wave
import numpy as np
from scipy.signal import butter, sosfilt

SR = 48000; DUR = 30.0; N = int(SR * DUR)
BPM = 120; B = 60 / BPM; S16 = B / 4
rng = np.random.default_rng(11)
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

def snare():
    n = int(.18 * SR); t = t_(n)
    return bp(rng.standard_normal(n), 1500, 8000) * np.exp(-t * 28) * .5 + np.sin(2 * np.pi * 210 * t) * np.exp(-t * 40) * .35

def hat(open_=False):
    n = int((.22 if open_ else .05) * SR); t = t_(n)
    return hp(rng.standard_normal(n), 7000, 4) * np.exp(-t * (14 if open_ else 90)) * .35

def crash():
    n = int(1.8 * SR); t = t_(n)
    return hp(rng.standard_normal(n), 5000, 2) * np.exp(-t * 2.2) * .35

def bass_note(f, d):
    n = int(d * SR); t = t_(n)
    saw = 2 * ((f * t) % 1) - 1
    x = lp(saw * .6 + np.sin(2 * np.pi * f * t), 380)
    env = np.minimum(1, t / .005) * np.exp(-t * 3.5)
    return np.tanh(x * env * 1.6) * .55

def chord(freqs, d, cutoff=1800):
    n = int(d * SR); t = t_(n); x = np.zeros(n)
    for f in freqs:
        for det in (-.004, .004):                 # detuned saw pair for width
            x += 2 * ((f * (1 + det) * t) % 1) - 1
    x = lp(x / (len(freqs) * 2), cutoff)
    fade = np.minimum(1, np.minimum(t / .03, (t[-1] - t) / .05))
    return x * fade * .35

def pad(freqs, d, lo=400, hi=2600):
    # a swelling pad whose filter opens across its length
    n = int(d * SR); t = t_(n); x = np.zeros(n)
    for f in freqs:
        for det in (-.006, 0, .006): x += 2 * ((f * (1 + det) * t) % 1) - 1
    x /= len(freqs) * 3
    out = np.zeros(n); seg = int(.05 * SR)
    for s in range(0, n, seg):
        c = lo * (hi / lo) ** (s / n)
        out[s:s + seg] = lp(x[max(0, s - 4000): s + seg], c)[-len(out[s:s + seg]):]
    env = np.minimum(1, t / (d * .6)) * np.minimum(1, (t[-1] - t) / .08)
    return out * env * .45

def pluck(f, d=.32):
    n = int(d * SR); t = t_(n)
    x = (2 * ((f * t) % 1) - 1) * .6 + (2 * ((f * 1.003 * t) % 1) - 1) * .4
    return lp(x, 2600) * np.exp(-t * 11) * .22

def riser(d=.6):
    n = int(d * SR); t = t_(n); x = rng.standard_normal(n)
    out = np.zeros(n); seg = int(.02 * SR)
    for s in range(0, n, seg):                    # sweeping band-pass, stepwise
        c = 500 * (14 ** (s / n))
        out[s:s + seg] = bp(x[max(0, s - 2000): s + seg], c * .7, min(c * 1.4, 20000))[-len(out[s:s + seg]):]
    tone = np.sin(2 * np.pi * np.cumsum(300 + 900 * (t / d) ** 2) / SR) * .25
    env = (t / d) ** 2.2
    return (out * 1.2 + tone) * env

def whoosh(d=.5, up=True):
    n = int(d * SR); t = t_(n); x = rng.standard_normal(n)
    out = np.zeros(n); seg = int(.015 * SR)
    for s in range(0, n, seg):
        p = s / n if up else 1 - s / n
        c = 300 * (20 ** p)
        out[s:s + seg] = bp(x[max(0, s - 1500): s + seg], c * .6, min(c * 1.6, 18000))[-len(out[s:s + seg]):]
    env = np.sin(np.pi * t / d) ** 1.5
    return out * env * .8

def impact(soft=False):
    n = int(1.1 * SR); t = t_(n)
    boom = np.sin(2 * np.pi * np.cumsum(30 + 60 * np.exp(-t * 9)) / SR) * np.exp(-t * 3.2)
    crash_ = lp(rng.standard_normal(n), 5000) * np.exp(-t * 6) * .35
    snap = hp(rng.standard_normal(n), 3000) * np.exp(-t * 80) * .6
    return np.tanh((boom * 1.4 + crash_ + snap) * 1.3) * (.55 if soft else 1)

def pop(f=900):
    n = int(.12 * SR); t = t_(n)
    return np.sin(2 * np.pi * np.cumsum(f * (1 + 1.2 * np.exp(-t * 60))) / SR) * np.exp(-t * 40) * .6

def tick():
    n = int(.02 * SR); return hp(rng.standard_normal(n), 4000) * np.exp(-t_(n) * 300) * .25

def click():
    n = int(.03 * SR); t = t_(n)
    return (hp(rng.standard_normal(n), 2500) * np.exp(-t * 400) * .5 + np.sin(2 * np.pi * 2200 * t) * np.exp(-t * 300) * .3)

def bell(f=1046):
    n = int(1.0 * SR); t = t_(n)
    mod = np.sin(2 * np.pi * f * 3.5 * t) * 2.2 * np.exp(-t * 6)
    return np.sin(2 * np.pi * f * t + mod) * np.exp(-t * 4.5) * .45

def notify():                                     # a generic two-note message chime
    a, b = pop(1050), pop(1570)
    out = np.zeros(int(.25 * SR)); out[:len(a)] += a; k = int(.08 * SR); out[k:k + len(b)] += b
    return out

# ---------- arrangement ----------
ROOT = {'C': 65.41, 'G': 98.0, 'Am': 110.0, 'F': 87.31}
CHORD = {'C': (261.63, 329.63, 392.0), 'G': (246.94, 293.66, 392.0), 'Am': (220.0, 261.63, 329.63), 'F': (220.0, 261.63, 349.23)}
ARP = {'C': (523.25, 659.25, 783.99, 659.25), 'G': (493.88, 587.33, 783.99, 587.33), 'Am': (440.0, 523.25, 659.25, 523.25), 'F': (440.0, 523.25, 698.46, 523.25)}
PROG = ['C', 'G', 'Am', 'F']
def chord_at(t): bar = int(t // (4 * B)); return 'C' if bar == 0 else PROG[(bar - 1) % 4]

def section(t):
    if t < 2.0: return 'build'
    if 17.0 <= t < 19.0: return 'break'
    if 19.0 <= t < 20.0: return 'build2'
    if t >= 28.0: return 'tail'
    return 'groove'

for k in range(int(DUR / S16)):
    t = k * S16; beat = k // 4; s = k % 4; sec = section(t); c = chord_at(t)
    if sec == 'tail': break
    on_beat = s == 0
    if sec == 'groove':
        if on_beat: place('drums', kick(), t, .95)
        if on_beat and beat % 2 == 1 and t < 24: place('drums', clap(), t, .8, -.1)
        open_ = s == 2 and (beat % 4 == 3 or 20 <= t < 24)
        place('drums', hat(open_=open_), t, .9 if s == 2 else .42, .35)
        if s in (0, 2): place('music', bass_note(ROOT[c] * (2 if s == 2 and beat % 2 else 1), B / 2), t, .9)
        if s in (0, 2): place('music', pluck(ARP[c][(k // 2) % 4]), t, .8 if t < 24 else .6, .25 if (k // 2) % 2 else -.25)
    elif sec == 'break':
        place('drums', hat(), t, .25 if s == 2 else .12, .35)
        if s in (0, 2): place('music', pluck(ARP[c][(k // 2) % 4]), t, .9, .25 if (k // 2) % 2 else -.25)
    elif sec == 'build2':                          # snare roll into the second drop
        g = .4 + .9 * (t - 19.0)
        place('drums', snare(), t, g, .1)
        if s in (0, 2): place('music', pluck(ARP[c][(k // 2) % 4]), t, .7)
    if on_beat and beat % 4 == 0 and sec in ('groove',) and t >= 2.0:
        place('music', chord(CHORD[c], 4 * B, 2200 if 20 <= t < 24 else 1800), t, .5, 0)

# the build: a pad swelling under four montage hits, a long riser, 16th hats rising
place('music', pad(CHORD['C'], 2.0), 0.0, .7)
place('fx', riser(1.9), 0.1, .6, -.3)
for i, h in enumerate((0.0, .5, 1.0, 1.5)):
    place('drums', kick(big=True), h, .95)
    place('fx', impact(soft=i > 0), h, .8 if i == 0 else .55, (i - 1.5) * .2)
    place('drums', clap(), h, .45)
for k in range(16): place('drums', hat(), k * S16, .15 + .45 * k / 16, .3)
# the break: a pad under the process, then the riser into the wall
place('music', pad(CHORD[chord_at(17.5)], 3.0, 700, 3600), 17.0, 1.1)
for h in (17.0, 18.0): place('drums', kick(), h, .45)
place('fx', riser(1.0), 19.0, .7, -.3)
# drops and cuts
for t, big in ((2.0, True), (20.0, True), (24.0, False), (14.0, False), (17.0, False)):
    place('fx', impact(soft=not big), t, 1.0 if big else .7, .1)
    place('drums', kick(big=True), t, 1.0)
    if big: place('drums', crash(), t, .7, .3)
for t in (13.45, 16.45): place('fx', riser(.55), t, .5, -.4)
place('fx', riser(.5), 9.5, .7)                                   # the green flood
place('fx', impact(soft=True), 10.0, .55)
# UI moments
place('fx', whoosh(.5, up=False), 1.95, .7)                                                    # the site shrinks into a card
for i in range(4): place('fx', pop(650 + i * 90), 2.15 + i * .07, .45, (i - 1.5) * .3)        # cards dealt
place('fx', bell(1046), 2.6, .35)                                                              # the hand opens
place('fx', tick(), 3.4, .5)                                                                    # cursor arrives
for c in (3.8, 4.8): place('fx', click(), c, .9, .3)                                           # cursor presses
for c in (4.0, 5.0): place('fx', whoosh(.45), c, .55, .4); place('fx', pop(520), c + .4, .45)   # the next card is dragged to the front
for c in (2.8, 4.5, 5.5): place('fx', tick(), c, .6, -.2)                                       # the selection box snaps on
place('fx', whoosh(.6), 5.95, .8)                                                               # the card lifts into the phone
place('drums', kick(), 6.6, .5)                                                                 # the phone settles
place('fx', pop(780), 6.85, .55)                                                                # contact bar rises
for k in range(14): place('fx', tick(), 7.0 + k * .16, .3, -.2)                                 # the site scrolls
place('fx', pop(600), 9.2, .8); place('fx', click(), 9.2, .7)                                    # tap on WhatsApp
for i, a in enumerate((10.5, 11.0, 11.5, 12.0, 12.5)): place('fx', notify(), a, .6, (i - 2) * .25)   # enquiries arrive
for i in range(4): place('fx', bell(988 + i * 132), 14.5 + i * .5, .55, (i - 1.5) * .4)          # tiles flip to included
for i in range(3): place('fx', pop(520 + i * 120), 17.45 + i * .5, .7); place('fx', bell(1318 + i * 176), 17.8 + i * .5, .4)   # steps, each checked
place('fx', whoosh(.6), 20.4, .55, -.3)                                                          # the ticker slides in
for i, f in enumerate((523.25, 659.25, 783.99, 1046.5)): place('fx', bell(f), 24.2 + i * .12, .5, (i - 1.5) * .2)   # logo sting
place('fx', pop(700), 25.15, .7)                                                                 # CTA
place('fx', pop(900), 25.5, .6)                                                                  # the number
place('music', chord(CHORD['C'], 2.0, 1500), 28.0, .55)                                          # final chord rings out
place('drums', kick(big=True), 28.0, .8)

# ---------- mix ----------
duck = np.ones(N)                                  # side-chain: duck the music on every kick of the groove
for k in range(int(DUR / B)):
    t = k * B
    if section(t) not in ('groove',): continue
    i = int(t * SR); n = int(.28 * SR); j = min(N, i + n)
    duck[i:j] = np.minimum(duck[i:j], 1 - .6 * np.exp(-t_(j - i) * 14))
mix = bus['drums'] * 1.0 + bus['music'] * duck[:, None] * .8 + bus['fx'] * .7
mix = np.tanh(mix * .9)                            # glue / soft clip
fade = np.ones(N); f0 = int(28.6 * SR); fade[f0:] = np.linspace(1, 0, N - f0) ** 1.5
mix *= fade[:, None]
mix = mix / np.abs(mix).max() * .93
with wave.open(sys.argv[1], 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((mix * 32767).astype('<i2').tobytes())
print('wrote', sys.argv[1])
