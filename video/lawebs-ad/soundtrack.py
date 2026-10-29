# Soundtrack for the LA webs ad (v4). Music and sound design synthesized from scratch (no samples, nothing to license).
# Built on the series engine (Maavar/ad-alenu, PizzaManager/ad-pizza) and driven by this ad's timeline
# (node render.mjs timeline.json --events), so every effect lands on its visual.
#   128 BPM, 16 bars = 30 s.  Progression Am - Dm - G - C (vi ii V I): the drop into the wall of work at bar 11
#   and the final hit at bar 15 land on C major.  Drops at bars 2 and 11, a breakdown at bar 9, final hit at bar 15.
#   Studio colour: glassy bell arpeggios over the end card, a soft chime on the click.
# Usage: python soundtrack.py timeline.json out.wav
import sys, json, wave, os
import numpy as np
from scipy.signal import butter, sosfilt, lfilter, fftconvolve

meta = json.load(open(sys.argv[1], encoding='utf-8'))
OUT = sys.argv[2]
SR = 48000
DUR = meta['duration']; N = int(DUR * SR)
BPM = meta['bpm']; B = 60 / BPM; BAR = 4 * B; S16 = B / 4
ARR, EV, CUTS, KICKS = meta['arrangement'], meta['events'], meta['cuts'], meta['kicks']
rng = np.random.default_rng(2026)
bt = lambda bar, beat=0, s=0: bar * BAR + beat * B + s * S16
T = lambda n: np.arange(n) / SR

BUS = {k: np.zeros((N, 2)) for k in ('kick', 'drums', 'bass', 'music', 'fx', 'rev', 'dly')}

def bp(x, lo, hi, o=2): return sosfilt(butter(o, [lo, min(hi, SR * .47)], 'band', fs=SR, output='sos'), x)
def hp(x, f, o=2): return sosfilt(butter(o, f, 'high', fs=SR, output='sos'), x)
def lp(x, f, o=2): return sosfilt(butter(o, min(f, SR * .47), 'low', fs=SR, output='sos'), x)
def noise(n): return rng.standard_normal(n)
def stereo(x, pan=0.0):
    if x.ndim == 2: return x
    l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    return np.stack([x * l, x * r], 1) * 1.4142
def place(bus, sig, t, g=1.0, pan=0.0, rev=0.0, dly=0.0):
    i = int(round(t * SR))
    if i >= N or sig is None or len(sig) == 0: return
    s = stereo(sig, pan) * g
    if i < 0: s, i = s[-i:], 0
    j = min(N, i + len(s)); s = s[: j - i]
    BUS[bus][i:j] += s
    if rev: BUS['rev'][i:j] += s * rev
    if dly: BUS['dly'][i:j] += s * dly
def saw(f, t, ph=0.0): return 2 * ((f * t + ph) % 1) - 1

# ---------------- drums ----------------
def kick(big=False, vel=1.0):
    n = int((.6 if big else .42) * SR); t = T(n)
    f = 50 + 125 * np.exp(-t * 26) + 320 * np.exp(-t * 170)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * (5 if big else 8.5))
    knock = np.sin(2 * np.pi * 185 * t) * np.exp(-t * 38) * .4
    click = bp(noise(n), 1800, 6500) * np.exp(-t * 230) * .5
    return np.tanh((body + knock + click) * 2.3) * .85 * vel
def clap(vel=1.0):
    n = int(.4 * SR); t = T(n); e = np.zeros(n)
    for o in (0, .008, .017, .027): k = int(o * SR); e[k:] += np.exp(-t[: n - k] * 48)
    return (bp(noise(n), 950, 5500) * (e + np.exp(-t * 14) * .35) * .55 + np.sin(2 * np.pi * 225 * t) * np.exp(-t * 34) * .3) * vel
def snare(vel=1.0):
    n = int(.25 * SR); t = T(n)
    return (bp(noise(n), 1400, 8000) * np.exp(-t * 20) * .6 + np.sin(2 * np.pi * 205 * t) * np.exp(-t * 30) * .45) * vel
def hat(kind='c', vel=1.0):
    if kind == 'o': n = int(.3 * SR); d = 10
    elif kind == 's': n = int(.07 * SR); d = 45
    else: n = int(.06 * SR); d = 75
    t = T(n); x = hp(noise(n), 7200, 4) if kind != 's' else bp(noise(n), 4800, 11000)
    a = np.minimum(1, t / (.006 if kind == 's' else .0008))
    return x * a * np.exp(-t * d) * (.25 if kind == 'o' else .21 if kind == 'c' else .15) * vel
def crash(len_s=2.4, vel=1.0):
    n = int(len_s * SR); t = T(n)
    x = hp(noise(n), 3500) * np.exp(-t * 1.7)
    for f in (3150, 4720, 5880, 7420, 8810, 10240): x += np.sin(2 * np.pi * f * t + rng.random() * 6.3) * np.exp(-t * 2.4) * .06
    return lp(x, 13000) * .38 * vel
def reverse_crash(len_s):
    c = crash(len_s + .2)[: int(len_s * SR)][::-1]
    return c * np.linspace(0, 1, len(c)) ** 1.5

# ---------------- tonal ----------------
def bass(f, dur):
    n = int(dur * SR); t = T(n)
    x = .55 * np.sin(2 * np.pi * f * t) + .35 * saw(f, t) + .14 * np.sign(np.sin(2 * np.pi * f * t))
    env = np.minimum(1, t / .004) * (.55 + .45 * np.exp(-t * 9)) * np.clip((dur - t) / .025, 0, 1)
    return np.tanh(lp(x * env, 950) * 1.9) * .62
def supersaw(freqs, dur, cutoff, att=.012, rel=.12, det=(-.13, -.06, 0, .06, .13)):
    n = int(dur * SR); t = T(n); L = np.zeros(n); R = np.zeros(n)
    for f in freqs:
        for j, d in enumerate(det):
            s = saw(f * 2 ** (d / 12), t, rng.random())
            if d == 0: L += s * .7; R += s * .7
            elif j % 2: L += s
            else: R += s
    k = 1 / (len(freqs) * 4)
    env = np.minimum(1, t / att) * np.clip((dur - t) / rel, 0, 1)
    return np.stack([lp(L * k, cutoff) * env, lp(R * k, cutoff) * env], 1)
def pluck(f, dur=.5, bright=.5, decay=.996):
    n = int(dur * SR); d = max(2, int(round(SR / f)))
    x = np.zeros(n); x[:d] = lp(rng.uniform(-1, 1, d), 1500 + 9000 * bright)
    a = np.zeros(d + 2); a[0] = 1; a[d] = a[d + 1] = -.5 * decay
    y = lfilter([1], a, x)
    y = y / (np.max(np.abs(y)) + 1e-9)
    return y * np.minimum(1, T(n) / .002) * np.clip((dur - T(n)) / .03, 0, 1) * .55
def bell(f, dur=1.1, idx=2.2, vel=1.0):
    n = int(dur * SR); t = T(n)
    mod = np.sin(2 * np.pi * f * 3.5 * t) * idx * np.exp(-t * 6)
    return np.sin(2 * np.pi * f * t + mod) * np.exp(-t * 4.2) * np.minimum(1, t / .002) * .42 * vel
def lead(f, dur):
    n = int(dur * SR); t = T(n)
    vib = 1 + .006 * np.sin(2 * np.pi * 5.5 * t) * np.clip((t - .12) / .2, 0, 1)
    ph = np.cumsum(f * vib) / SR
    x = (2 * (ph % 1) - 1) * .6 + (2 * ((ph * 1.005) % 1) - 1) * .4
    env = np.minimum(1, t / .01) * (.7 + .3 * np.exp(-t * 6)) * np.clip((dur - t) / .06, 0, 1)
    return lp(x * env, 3800) * .32 + pluck(f * 2, dur, .7) * .35
def mando(f, dur, vel=1.0):  # mandolin-style tremolo: a double course plucked in 32nds
    n = int(dur * SR); out = np.zeros(n); step = B / 8; k = 0
    while k * step < dur - .02:
        i = int(k * step * SR); seg = min(n - i, int(.16 * SR))
        p = pluck(f * (1.002 if k % 2 else .998), .16, .75, .985)[:seg] * (.75 + .25 * (k % 2 == 0))
        out[i:i + seg] += p; k += 1
    return lp(out, 6500) * vel

# ---------------- sound effects ----------------
def sweep_noise(dur, f0, f1, q=1.4, shape=None):
    n = int(dur * SR); x = noise(n); out = np.zeros(n); seg = int(.012 * SR)
    for s in range(0, n, seg):
        c = f0 * (f1 / f0) ** (s / n); lo, hi = c / q, min(c * q, SR * .45)
        blk = bp(x[max(0, s - 1500): s + seg], lo, hi)[-len(out[s: s + seg]):]
        out[s: s + seg] = blk
    return out * (shape if shape is not None else np.sin(np.linspace(0, np.pi, n)) ** 2)
def whoosh(dur=.42, up=True, pan_from=-.8, pan_to=.8):
    n = int(dur * SR); shape = np.concatenate([np.linspace(0, 1, int(n * .62)) ** 2, np.linspace(1, 0, n - int(n * .62)) ** 1.5])
    x = sweep_noise(dur, 400 if up else 3000, 3000 if up else 400, 1.6, shape) * 1.6
    p = np.linspace(pan_from, pan_to, n); l, r = np.cos((p + 1) * np.pi / 4), np.sin((p + 1) * np.pi / 4)
    return np.stack([x * l, x * r], 1) * 1.4142
def riser(dur):
    n = int(dur * SR); t = T(n)
    nz = sweep_noise(dur, 350, 7000, 1.5, (t / dur) ** 2.2)
    f = 160 * (6 ** (t / dur)); tone = lp(saw(1, np.cumsum(f) / SR), 2600) * (t / dur) ** 2 * .35
    return (nz * 1.1 + tone) * np.clip((dur - t) / .02, 0, 1)
def downlifter(dur=1.2):
    t = T(int(dur * SR)); return sweep_noise(dur, 6000, 300, 1.5, np.exp(-t * 2.5)) * .9
def impact(size=1.0):
    n = int(1.6 * SR); t = T(n)
    boom = np.sin(2 * np.pi * np.cumsum(38 + 70 * np.exp(-t * 7)) / SR) * np.exp(-t * 2.6)
    mid = lp(noise(n), 900) * np.exp(-t * 7) * .45
    snap = bp(noise(n), 1500, 9000) * np.exp(-t * 55) * .7
    return np.tanh((boom * 1.3 + mid + snap) * 1.4) * .9 * size
def slap(vel=1.0):
    n = int(.35 * SR); t = T(n)
    return (bp(noise(n), 350, 3500) * np.exp(-t * 38) * .9 + np.sin(2 * np.pi * 95 * t) * np.exp(-t * 18) * .8 + bp(noise(n), 180, 600) * np.exp(-t * 22) * .5) * vel
def af_beep():
    n = int(.04 * SR); t = T(n); b1 = np.sin(2 * np.pi * 2350 * t) * np.minimum(1, t / .003) * np.clip((.04 - t) / .006, 0, 1) * .35
    out = np.zeros(int(.13 * SR)); out[: n] += b1; out[int(.07 * SR): int(.07 * SR) + n] += b1
    return out
def bubble_pop(f0=260, f1=900):
    n = int(.12 * SR); t = T(n)
    return np.sin(2 * np.pi * np.cumsum(f0 + f1 * np.exp(-t * 55)) / SR) * np.exp(-t * 32) * .55 + hp(noise(n), 3000) * np.exp(-t * 300) * .2
def mouse_click():
    n = int(.03 * SR); t = T(n)
    return hp(noise(n), 2000) * np.exp(-t * 900) * .7 + bp(noise(n), 900, 2200) * np.exp(-t * 350) * .4
def popper():
    n = int(1.0 * SR); t = T(n)
    x = bp(noise(n), 500, 6000) * np.exp(-t * 18) * .9 + np.sin(2 * np.pi * np.cumsum(120 + 200 * np.exp(-t * 40)) / SR) * np.exp(-t * 14) * .5
    for _ in range(70):
        s = rng.random() ** 1.6 * .9; k = int(s * SR); m = int(.004 * SR)
        if k + m < n: x[k: k + m] += hp(noise(m), 4000) * (1 - s) * .5
    return x
# pizza-specific
def ui_tap():  # finger on glass: a tick and a tiny blip
    n = int(.08 * SR); t = T(n)
    return hp(noise(n), 2500) * np.exp(-t * 700) * .5 + np.sin(2 * np.pi * 1250 * t) * np.exp(-t * 60) * .25
def bloop(f):  # the topping card lights up, pitched in key
    n = int(.32 * SR); t = T(n)
    ph = np.cumsum(f * (1 + .5 * np.exp(-t * 40))) / SR
    return (np.sin(2 * np.pi * ph) + .3 * np.sin(4 * np.pi * ph)) * np.exp(-t * 11) * np.minimum(1, t / .003) * .5
def tock():  # one piece landing on the cheese: soft, wet, low
    n = int(.07 * SR); t = T(n); f = 150 + rng.random() * 140
    body = np.sin(2 * np.pi * np.cumsum(f * (1 + .8 * np.exp(-t * 90))) / SR) * np.exp(-t * 55)
    squish = bp(noise(n), 600, 2400) * np.exp(-t * 120) * .45
    return (body + squish) * (.55 + rng.random() * .45)
def odo_roll():  # the total's digits roll: a few decelerating ticks and a settle
    out = np.zeros(int(.5 * SR))
    for k, o in enumerate([0, .05, .11, .19, .3]):
        i = int(o * SR); n = int(.03 * SR); t = T(n)
        c = (bp(noise(n), 2500, 8000) * np.exp(-t * 520) * .55 + bp(noise(n), 700, 2000) * np.exp(-t * 300) * .3) * (1 if k < 4 else 1.5)
        out[i:i + n] += c
    return out
def slice_fx():  # pizza cutter run across the pie
    n = int(.42 * SR); t = T(n)
    roll = sweep_noise(.42, 5200, 2200, 1.7, np.sin(np.pi * t / .42) ** .8) * .8
    grit = bp(noise(n), 1800, 6000) * (.5 + .5 * np.sin(2 * np.pi * 38 * t)) * np.sin(np.pi * t / .42) * .25
    ring = np.sin(2 * np.pi * 3150 * t) * np.exp(-t * 14) * .08
    return roll + grit + ring
def peel():  # wooden peel slides the pizza toward the oven
    n = int(.9 * SR); t = T(n)
    scrape = bp(noise(n), 250, 1400) * (.6 + .4 * np.sin(2 * np.pi * 23 * t)) * np.sin(np.pi * np.clip(t / .8, 0, 1)) ** 1.2
    thud = np.zeros(n); k = int(.78 * SR); m = n - k; tt = T(m)
    thud[k:] = np.sin(2 * np.pi * 110 * tt) * np.exp(-tt * 18) * .6
    return scrape * .6 + thud
def crackle(dur, dens=60, vel=1.0):  # wood fire: sparse pops and a low roar
    n = int(dur * SR); x = lp(noise(n), 500) * .18
    for _ in range(int(dens * dur)):
        k = int(rng.random() * (n - 800)); m = int((.002 + rng.random() * .006) * SR)
        x[k:k + m] += hp(noise(m), 1500 + rng.random() * 3000) * (.3 + rng.random() * .9) * np.exp(-np.arange(m) / (m / 3))
    return x * vel
def whoomph():  # the fire catches: a breathy low burst with crackle
    n = int(1.6 * SR); t = T(n)
    body = lp(noise(n), 700) * np.minimum(1, t / .07) * np.exp(-t * 2.6) * 1.2
    boom = np.sin(2 * np.pi * np.cumsum(55 + 40 * np.exp(-t * 6)) / SR) * np.exp(-t * 3.2) * .7
    return np.tanh(body + boom) + crackle(1.6, 90, .9) * np.exp(-t * 1.2)
def thump():  # a big order button lands
    n = int(.3 * SR); t = T(n)
    return np.tanh((np.sin(2 * np.pi * np.cumsum(90 + 120 * np.exp(-t * 40)) / SR) * np.exp(-t * 14) + bp(noise(n), 600, 3000) * np.exp(-t * 60) * .4) * 1.6) * .8
def scooter(dur):  # moped buzz passing left to right, revving up
    n = int(dur * SR); t = T(n); u = t / dur
    f = (92 + 46 * u ** 1.3) * (1 + .03 * np.sin(2 * np.pi * 7 * t))
    ph = np.cumsum(f) / SR
    eng = (saw(1, ph) * .6 + np.sign(np.sin(2 * np.pi * ph * 2)) * .25) * (1 + .4 * np.sin(2 * np.pi * ph * .5))
    eng = lp(eng, 1700) + bp(noise(n), 800, 2600) * .12
    env = np.minimum(1, t / .15) * np.clip((dur - t) / .35, 0, 1) * (.6 + .4 * np.sin(np.pi * u))
    x = eng * env * .5
    p = np.linspace(-.7, .7, n); l, r = np.cos((p + 1) * np.pi / 4), np.sin((p + 1) * np.pi / 4)
    return np.stack([x * l, x * r], 1) * 1.4142
def service_bell():  # the counter bell: "order up"
    n = int(2.4 * SR); t = T(n); f0 = 2380
    x = sum(a * np.sin(2 * np.pi * f0 * r * t + rng.random() * 6) * np.exp(-t * d) for r, a, d in ((1, 1, 1.6), (2.76, .5, 2.8), (5.40, .28, 4.5), (8.93, .14, 7)))
    strike = hp(noise(n), 3000) * np.exp(-t * 400) * .5
    return (x * .32 + strike) * np.minimum(1, t / .001)

# ---------------- music arrangement ----------------
CH = [  # bar % 4 -> chord voicing (mid register for phone speakers), bass root, arp tones
    {'v': [220.00, 261.63, 329.63, 440.00], 'b': 110.0, 'arp': [440.00, 523.25, 659.26, 880.00, 1046.5]},   # Am
    {'v': [174.61, 220.00, 293.66, 349.23], 'b': 73.42, 'arp': [293.66, 349.23, 440.00, 587.33, 698.46]},   # Dm
    {'v': [196.00, 246.94, 293.66, 392.00], 'b': 98.00, 'arp': [392.00, 493.88, 587.33, 783.99, 987.77]},   # G
    {'v': [261.63, 329.63, 392.00, 523.25], 'b': 65.41, 'arp': [523.25, 659.26, 783.99, 1046.5, 1318.5]},   # C
]
ARP_PAT = [0, 2, 1, 2, 3, 2, 1, 2, 0, 2, 1, 2, 3, 2, 4, 2]
LEAD = {13: [(0, 587.33), (1, 698.46), (2, 880.00), (3, 1046.5), (5, 880.00), (6, 698.46)],     # Dm bar, in 8ths
        14: [(0, 987.77), (2, 880.00), (3, 783.99), (4, 587.33), (6, 493.88)]}                   # G bar, leading home to C
for i, a in enumerate(ARR):
    s0 = bt(i); c = CH[i % 4]
    gap = bt(i, 3, 2) if a.get('pause') else bt(i + 1)
    if a.get('final'):
        place('kick', kick(True, 1.1), s0); place('drums', crash(3.0, 1.2), s0, rev=.25)
        place('music', supersaw(c['v'] + [c['v'][0] * 2], 2.6, 4200, .005, 1.6), s0, .95, rev=.35)
        place('bass', bass(c['b'], 1.4), s0, 1.0)
        place('fx', impact(1.1), s0, .8, rev=.2)
        for k, f in enumerate([1046.5, 1318.5, 1568.0, 2093.0]): place('music', bell(f, 1.6, 1.8), s0 + k * S16, .5, (k - 1.5) * .3, rev=.3, dly=.3)
        for k, f in enumerate([1318.5, 1568.0, 2093.0, 2637.0, 3136.0]): place('music', bell(f, 1.2, 1.4), s0 + .25 + k * S16 / 2, .16, (k - 2) * .3, rev=.35, dly=.3)
        continue
    step = B if a.get('kick') == '4' else B / 2 if a.get('kick') == '8' else 0
    if step:
        tt = s0
        while tt < bt(i + 1) - 1e-6:
            if tt < gap - 1e-6:
                vel = 1.0 if a.get('kick') == '4' else .55 + .45 * (tt - s0) / BAR
                place('kick', kick(False, vel), tt)
            tt += step
    if a.get('clap'):
        for bb in (1, 3):
            if bt(i, bb) < gap - 1e-6: place('drums', clap(), bt(i, bb), .85, -.08, rev=.18)
    hk = a.get('hats')
    for s in range(16):
        tt = bt(i, 0, s)
        if tt >= gap - 1e-6: break
        if hk == 'full':
            if s % 4 == 2: place('drums', hat('o'), tt, .8, .25)
            else: place('drums', hat('c', .55 + .45 * (s % 2 == 0)), tt, .55, -.2)
            place('drums', hat('s', .6 + .4 * rng.random()), tt, .45, .45)
        elif hk == 'c8' and s % 2 == 0: place('drums', hat('c', .8 if s % 4 == 2 else .45), tt, .6, -.2)
        elif hk == 'shaker': place('drums', hat('s', .5 + .5 * (s % 2 == 0)), tt, .55, .4)
    if a.get('roll'):
        for s in range(16):
            tt = bt(i, 0, s)
            if tt >= gap - 1e-6: break
            if s < 8 and s % 2: continue
            place('drums', snare(.15 + .85 * (s / 15) ** 1.6), tt, .7, .1, rev=.15)
    if a.get('fill'):
        for s in range(12, 16): place('drums', snare(.5 + .12 * (s - 12)), bt(i, 0, s), .75, rev=.12)
    if a.get('bass'):
        for bb in range(4):
            tt = bt(i, bb, 2)
            if tt < gap - 1e-6: place('bass', bass(c['b'] * (2 if bb == 3 else 1), S16 * 1.7), tt, .95)
    ck = a.get('chords'); dur = gap - s0
    if ck == 'bright': place('music', supersaw(c['v'], dur, 4600), s0, .62, rev=.12)
    elif ck == 'dark': place('music', supersaw(c['v'], dur, 750, .2), s0, .55, rev=.25)
    elif ck == 'pad': place('music', supersaw(c['v'], dur, 2000, .25, .3), s0, .58, rev=.45)
    elif ck == 'sweep':
        dk, br = supersaw(c['v'], dur, 700, .05), supersaw(c['v'], dur, 5200, .05)
        w = np.linspace(0, 1, len(dk))[:, None] ** 1.8
        place('music', dk * (1 - w) + br * w, s0, .6, rev=.2)
    if a.get('arp'):
        soft = a['arp'] == 'soft'
        for s in range(16):
            tt = bt(i, 0, s)
            if tt >= gap - 1e-6: break
            f = c['arp'][ARP_PAT[s]]
            place('music', pluck(f, .42, .25 if soft else .6), tt, (.32 if soft else .42) * (1 if s % 4 == 0 else .8), (.25 if s % 2 else -.25), rev=.2, dly=.28)
    if a.get('lead'):
        notes = LEAD.get(i, [])
        for k, (pos, f) in enumerate(notes):
            nxt = notes[k + 1][0] if k + 1 < len(notes) else 8
            place('music', lead(f, (nxt - pos) * B / 2 * .95), bt(i) + pos * B / 2, .55, 0, rev=.25, dly=.22)
        for k in range(8): place('music', bell(c['arp'][(k * 2) % 5] * 2, .5, 1.2), s0 + k * B / 2, .1, (.4 if k % 2 else -.4), rev=.3, dly=.25)
    if a.get('riser'): place('fx', riser(gap - s0), s0, .55, rev=.2)
    if a.get('breakdown'):
        place('fx', downlifter(1.6), s0, .5, rev=.3)
        place('fx', sweep_noise(2 * BAR, 300, 1400, 1.6, np.sin(np.linspace(0, np.pi, int(2 * BAR * SR))) ** 2) * .25, s0, .5, rev=.3)   # air under the breakdown

# ---------------- sound effects from the animation timeline ----------------
CUT_FX = {'zoom': 1.0, 'push': .55, 'flash': .9}
for c in CUTS:
    k, t = c['kind'], c['t']
    if k in ('whip', 'whipUp'):
        place('fx', whoosh(.42, k == 'whipUp', -.8, .8), t - .3, .75, rev=.1)
        place('drums', crash(1.6, .5), t, rev=.15)
    else:
        place('fx', impact(CUT_FX[k]), t, .85, rev=.25)
        place('drums', crash(2.4, 1.0 if k != 'push' else .6), t, rev=.2)
        if k == 'push': place('fx', whoosh(.45, True, .6, -.6), t - .35, .7)
def chime(f=1568.0):  # a notification-like ping: two soft bell partials
    return bell(f, .9, 1.2) + bell(f * 1.5, .9, 1.0) * .6
def keytick():  # one key on a phone keyboard
    n = int(.03 * SR); t = T(n)
    return hp(noise(n), 3000) * np.exp(-t * 700) * .35 + np.sin(2 * np.pi * 1900 * t) * np.exp(-t * 400) * .12
def splash():  # paint fills the page: a soft liquid swell and a low bloop
    n = int(.7 * SR); t = T(n)
    body = sweep_noise(.7, 300, 2600, 1.4, np.sin(np.pi * np.clip(t / .7, 0, 1)) ** 1.5) * .7
    blp = np.sin(2 * np.pi * np.cumsum(140 + 420 * np.exp(-t * 18)) / SR) * np.exp(-t * 9) * .5
    return body + blp
def draw_lines(dur=.9):  # the wireframe draws itself: a pencil-like scratch rising
    n = int(dur * SR); t = T(n)
    scr = bp(noise(n), 2500, 7000) * (.5 + .5 * np.sin(2 * np.pi * 31 * t)) * np.sin(np.pi * t / dur) ** 1.2 * .35
    return scr + sweep_noise(dur, 600, 3500, 1.5, np.sin(np.pi * t / dur) ** 2) * .3
PICK = [587.33, 698.46, 783.99, 880.00, 1046.5, 1174.66]
for e in EV:
    t, ty = e['t'], e['type']
    if ty == 'impact': place('fx', impact(1.0), t, .9, rev=.25); place('drums', crash(2.6), t, rev=.2)
    elif ty == 'slam': place('fx', impact(.55), t, .7, rev=.2)
    elif ty == 'seal': place('fx', bubble_pop(), t, .8); [place('fx', bell(f, .7, 1.5), t + k * .04, .25, (k - 1.5) * .4, rev=.3) for k, f in enumerate([1568.0, 2093.0, 2637.0])]
    elif ty == 'swish': place('fx', whoosh(.36, True, .5, -.5), t - .2, .45, rev=.1)
    elif ty == 'slide': place('fx', whoosh(.3, False, .6, -.6), t - .05, .45)
    elif ty == 'tap': place('fx', ui_tap(), t, 1.5, .15)
    elif ty == 'pick': place('fx', bloop(PICK[e['i']]), t, .85, (e['i'] - 2.5) * .2, rev=.2, dly=.15)
    elif ty == 'land': place('fx', tock(), t, .5, e.get('pan', 0) * .7)
    elif ty == 'thud': place('fx', thump(), t, .75); place('fx', slap(.5), t, .45, rev=.15)
    elif ty == 'splash': place('fx', splash(), t, .7, rev=.25)
    elif ty == 'draw': place('fx', draw_lines(.9), t, .8, rev=.15)
    elif ty == 'ping': place('fx', chime(1568.0), t, .55, .2, rev=.3, dly=.2)
    elif ty == 'shimmer': [place('fx', bell(f, .8, 1.3), t + k * .045, .22, (k - 3) * .25, rev=.35, dly=.2) for k, f in enumerate([1046.5, 1318.5, 1568.0, 2093.0, 2637.0, 3136.0, 4186.0])]
    elif ty == 'done': [place('fx', bell(f, 1.3, 1.6), t + k * .03, .3, (k - 1.5) * .3, rev=.3, dly=.2) for k, f in enumerate([523.25, 659.26, 783.99, 1046.5])]
    elif ty == 'price': place('fx', odo_roll(), t, 1.6, -.35)
    elif ty == 'tick': place('fx', bubble_pop(320, 1100), t, .3, (e['i'] - 2.5) * .25)
    elif ty == 'lock': place('fx', af_beep(), t, .6)
    elif ty == 'stretch': place('fx', whoosh(e['dur'] + .15, True, -.6, .6), t - .05, .7, rev=.2); place('fx', sweep_noise(e['dur'], 200, 1200, 1.4) * .4, t, .6)
    elif ty == 'key': place('fx', keytick(), t, .8, .1)
    elif ty == 'send': place('fx', whoosh(.25, True, .3, -.3), t - .05, .5); place('fx', bubble_pop(400, 1300), t + .05, .6)
    elif ty == 'deal': place('fx', thump(), t, .7, e.get('pan', 0)); place('fx', slap(.55), t, .5, e.get('pan', 0), rev=.15)
    elif ty == 'button': place('fx', thump(), t, .7); place('fx', slap(.4), t, .4)
    elif ty == 'sweep': place('fx', sweep_noise(.9, 800, 9000, 1.5, np.linspace(0, 1, int(.9 * SR)) ** 1.5 * np.linspace(1, .2, int(.9 * SR))), t, .35, rev=.3)
    elif ty == 'pop': place('fx', bubble_pop(), t, .6)
    elif ty == 'stampSmall': place('fx', slap(.6), t, .7, rev=.2)
    elif ty == 'click': place('fx', mouse_click(), t, .8)
    elif ty == 'bell': place('fx', chime(2093.0), t, .5, .1, rev=.3, dly=.25)
    elif ty == 'confetti':
        place('fx', popper(), t, .75, rev=.2)
        for k, f in enumerate([1046.5, 1318.5, 1568.0, 2093.0, 2637.0]): place('fx', bell(f, .9, 1.6), t + .06 + k * S16 / 2, .2, (k - 2) * .35, rev=.3, dly=.25)

# ---------------- mix (same chain and bus balance as the Alenu ad) ----------------
def reverb_ir(rt=1.7, pre=.022):
    n = int(rt * SR); t = T(n); dec = np.exp(-6.9 * t / rt)
    ir = np.zeros((n + int(pre * SR), 2))
    for ch in range(2):
        x = noise(n) * dec
        x = .6 * lp(x, 7000) + .4 * lp(x, 2500)
        ir[int(pre * SR):, ch] = x
    return ir / np.sqrt(np.sum(ir ** 2) / 2)
ir = reverb_ir()
wet = np.stack([fftconvolve(BUS['rev'][:, c], ir[:, c])[:N] for c in range(2)], 1) * .32
dly = np.zeros((N, 2)); src = BUS['dly'].copy(); dt = int(.75 * B * SR)
for k in range(1, 6):
    src = np.stack([lp(src[:, 0], 5200), lp(src[:, 1], 5200)], 1) * .42
    sh = k * dt
    if sh >= N: break
    ch = k % 2
    dly[sh:, ch] += src[: N - sh, 1 - ch] + src[: N - sh, ch] * .2
duck = np.ones(N)
for kt in KICKS:
    i = int(kt * SR); n = int(.32 * SR); j = min(N, i + n)
    if i >= N: continue
    tt = T(j - i); duck[i:j] = np.minimum(duck[i:j], 1 - .72 * np.exp(-tt * 11))
if os.environ.get('STEMS'):
    np.savez_compressed(os.environ['STEMS'], **{k: v.astype(np.float32) for k, v in BUS.items()}, wet=wet.astype(np.float32), dlyo=dly.astype(np.float32), duck=duck.astype(np.float32))
def sect_env():
    pts = [(0, .62), (bt(1), .66), (bt(2) - .01, 1.0), (bt(2), 1.0), (bt(9), 1.0), (bt(9) + .01, .58), (bt(10), .6),
           (bt(11) - .01, 1.0), (bt(13), 1.0), (bt(13) + .01, 1.08), (bt(15), 1.08), (bt(15) + .01, 1.15), (DUR, 1.15)]
    x = np.array([p[0] for p in pts]) * SR; y = np.array([p[1] for p in pts])
    return np.interp(np.arange(N), x, y)
SECT = sect_env()[:, None]
for k in ('drums', 'bass', 'music'): BUS[k] *= SECT
BUS['kick'] *= np.where(np.arange(N) < bt(2) * SR, .85, 1.0)[:, None]
MIXG = {'kick': .62, 'drums': 1.1, 'bass': 1.1, 'music': 3.7, 'fx': .7, 'wet': 2.5, 'dly': .9}
mix = (BUS['kick'] * MIXG['kick'] + BUS['drums'] * MIXG['drums'] + BUS['bass'] * duck[:, None] * MIXG['bass']
       + BUS['music'] * duck[:, None] * MIXG['music'] + BUS['fx'] * MIXG['fx'] + wet * MIXG['wet'] + dly * MIXG['dly'])
mix = hp(mix.T, 28, 2).T
lvl = np.sqrt(lfilter([.0015], [1, -.9985], np.mean(mix ** 2, 1)) + 1e-12)
thr = np.percentile(lvl, 80) * 1.15; gain = np.where(lvl > thr, (thr + (lvl - thr) / 2.0) / lvl, 1.0)
gain = lfilter([.004], [1, -.996], gain)
mix = mix * gain[:, None]
mix = mix / (np.abs(mix).max() + 1e-9) * 1.2
mix = np.tanh(mix * 1.05) / np.tanh(1.05 * 1.2)
f0 = int((DUR - .25) * SR); mix[f0:] *= np.linspace(1, 0, N - f0)[:, None]
mix = mix / (np.abs(mix).max() + 1e-9) * .95
with wave.open(OUT, 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((mix * 32767).astype('<i2').tobytes())
print('wrote', OUT)
