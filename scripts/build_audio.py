#!/usr/bin/env python3
"""Procedural sound design + score for the ad (48 kHz, stereo, 24-bit).

Everything is synthesized: no samples, no stock music. Timing comes from
src/config/timeline.json (VO cues, markers) and src/config/sound.json (SFX).

Outputs (audio/):
  music.wav   score stem           sfx.wav   sound-design stem
  mix.wav     music + sfx, mastered to -14 LUFS / -1 dBTP (VO-ready bed)
  mix_vo.wav  if audio/vo.wav exists: VO + ducked bed, mastered
Usage: python3 scripts/build_audio.py [--plot]
"""
import json, os, sys
import numpy as np
from scipy import signal
from scipy.ndimage import maximum_filter1d, minimum_filter1d
import soundfile as sf
import pyloudnorm as pyln

SR = 48000
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
TL = json.load(open(os.path.join(ROOT, 'src/config/timeline.json')))
SND = json.load(open(os.path.join(ROOT, 'src/config/sound.json')))
DUR = TL['duration']
N = int(round(DUR * SR))
M = TL['markers']
FREEZE, C0, C1 = M['freeze'], M['collapseStart'], M['collapseEnd']
rng = np.random.default_rng(1234)

# ------------------------------------------------------------------ primitives
def ns(d): return max(1, int(round(d * SR)))
def tt(n): return np.arange(n) / SR
def db(g): return 10 ** (g / 20)

def phase(freq, n):
    f = np.broadcast_to(np.asarray(freq, dtype=float), (n,))
    return np.cumsum(f) / SR  # cycles

def sine(freq, n, ph0=0.0): return np.sin(2 * np.pi * (phase(freq, n) + ph0))

def saw(freq, n, ph0=None):
    """PolyBLEP band-limited sawtooth."""
    f = np.broadcast_to(np.asarray(freq, dtype=float), (n,))
    p = (phase(f, n) + (rng.random() if ph0 is None else ph0)) % 1.0
    dt = f / SR
    y = 2 * p - 1
    m1 = p < dt
    x = p[m1] / dt[m1]; y[m1] -= x + x - x * x - 1
    m2 = p > 1 - dt
    x = (p[m2] - 1) / dt[m2]; y[m2] -= x * x + x + x + 1
    return y

def noise(n, color='white'):
    w = rng.standard_normal(n)
    if color == 'pink':
        b = [0.049922035, -0.095993537, 0.050612699, -0.004408786]
        a = [1, -2.494956002, 2.017265875, -0.522189400]
        w = signal.lfilter(b, a, w) * 4
    return w

def _sos(kind, f, order=2, q=None):
    ny = SR / 2
    if kind == 'bp':
        bw = f / (q or 1.0)
        lo, hi = max(20, f - bw / 2), min(ny * 0.95, f + bw / 2)
        return signal.butter(order, [lo / ny, hi / ny], 'band', output='sos')
    return signal.butter(order, min(f, ny * 0.95) / ny, 'low' if kind == 'lp' else 'high', output='sos')

def lp(x, f, order=2): return signal.sosfilt(_sos('lp', f, order), x)
def hp(x, f, order=2): return signal.sosfilt(_sos('hp', f, order), x)
def bp(x, f, q=1.0, order=2): return signal.sosfilt(_sos('bp', f, order, q), x)

def sweep(x, f0, f1, q=1.0, kind='bp', curve='exp', block=128):
    """Time-varying RBJ biquad (bp/lp/hp) with continuous state."""
    n = len(x); out = np.zeros(n); zi = np.zeros(2)
    for s in range(0, n, block):
        e = min(n, s + block)
        u = (s + e) / 2 / n
        f = f0 * (f1 / f0) ** u if curve == 'exp' else f0 + (f1 - f0) * u
        w0 = 2 * np.pi * min(f, SR * 0.45) / SR
        al = np.sin(w0) / (2 * q); cw = np.cos(w0)
        if kind == 'bp': b = [al, 0, -al]
        elif kind == 'lp': b = [(1 - cw) / 2, 1 - cw, (1 - cw) / 2]
        else: b = [(1 + cw) / 2, -(1 + cw), (1 + cw) / 2]
        a = [1 + al, -2 * cw, 1 - al]
        out[s:e], zi = signal.lfilter(np.array(b) / a[0], np.array(a) / a[0], x[s:e], zi=zi)
    return out

def env_exp(n, a=0.002, tau=0.1):
    t = tt(n)
    return np.minimum(1, t / max(a, 1e-4)) * np.exp(-np.maximum(0, t - a) / tau)

def env_ar(n, a, r, shape=2.0):
    t = tt(n); d = n / SR
    up = np.clip(t / a, 0, 1) ** shape
    dn = np.clip((d - t) / r, 0, 1) ** shape
    return np.minimum(up, dn)

def fade(x, fi=0.003, fo=0.01):
    x = x.copy(); a, b = ns(fi), ns(fo)
    x[:a] *= np.linspace(0, 1, a); x[-b:] *= np.linspace(1, 0, b)
    return x

def norm(x, peak=1.0):
    m = np.max(np.abs(x)) or 1
    return x / m * peak

def pan2(x, p=0.0):
    a = (p + 1) * np.pi / 4
    return np.stack([x * np.cos(a), x * np.sin(a)]) * np.sqrt(2)

def fm_bell(f, dur, ratio=3.5, index=1.2, tau=0.6, itau=0.25):
    n = ns(dur); t = tt(n)
    idx = index * np.exp(-t / itau)
    y = np.sin(2 * np.pi * f * t + idx * np.sin(2 * np.pi * f * ratio * t))
    return y * env_exp(n, 0.002, tau)

def fm_keys(f, dur=0.9, bright=1.0, tau=0.45):
    """Soft electric-piano / felt keys."""
    n = ns(dur); t = tt(n)
    idx = bright * 2.0 * np.exp(-t / 0.11) + 0.2
    y = np.sin(2 * np.pi * f * t + idx * np.sin(2 * np.pi * f * t))
    y += 0.16 * np.sin(2 * np.pi * f * 4.0 * t) * np.exp(-t / 0.06)
    y *= (1 - np.exp(-t / 0.004)) * np.exp(-t / tau)
    return fade(y, 0.001, 0.05)

def reverb_ir(rt=1.8, pre=0.018, damp=6500, width=1.0, seed=3):
    r = np.random.default_rng(seed)
    n = ns(rt * 1.25); t = tt(n)
    decay = np.exp(-6.9 * t / rt)
    ir = np.zeros((2, n + ns(pre)))
    for ch in range(2):
        nz = r.standard_normal(n) * decay
        lo = lp(nz, 900); hi = nz - lo
        hi *= np.exp(-6.9 * t / (rt * 0.45))            # HF decays faster
        nz = lp(lo + hi, damp)
        for k, (dt_, g) in enumerate([(0.007, 0.5), (0.013, 0.35), (0.021, 0.3), (0.034, 0.22), (0.047, 0.16)]):
            i = ns(dt_ * (1 + 0.07 * ch * width * (k % 2 * 2 - 1)))
            nz[i] += g * (1 if (k + ch) % 2 else -1)
        ir[ch, ns(pre):] = nz
    return ir / np.sqrt(np.sum(ir ** 2) / 2)

def convolve_st(x, ir):
    return np.stack([signal.fftconvolve(x[c], ir[c])[: x.shape[1]] for c in range(2)])

def place(bus, x, t, gain_db=0.0, p=0.0):
    """Add mono (pan p) or stereo buffer x into bus at time t."""
    if x.ndim == 1: x = pan2(x, p)
    s = int(round(t * SR))
    if s < 0: x = x[:, -s:]; s = 0
    e = min(bus.shape[1], s + x.shape[1])
    if e > s: bus[:, s:e] += x[:, : e - s] * db(gain_db)

# ------------------------------------------------------------------ sound palette
def s_air_in(c):
    n = ns(0.9); x = sweep(noise(n, 'pink'), 900, 5000, 0.9) * env_ar(n, 0.35, 0.5)
    return x * 0.6 + sine(52, n) * env_exp(n, 0.01, 0.25) * 0.5

def s_swipe(c):
    p = c.get('pitch', 1); n = ns(0.24)
    x = sweep(noise(n, 'pink'), 1100 * p, 4200 * p, 1.3) * env_ar(n, 0.07, 0.16)
    return x + 0.25 * sine(2600 * p, n) * env_exp(n, 0.001, 0.012)

def s_send_swoosh(c):
    n = ns(0.38); x = sweep(noise(n, 'pink'), 3600, 600, 1.1) * env_ar(n, 0.06, 0.3)
    return x + 0.12 * sine(np.geomspace(1300, 480, n), n) * env_ar(n, 0.05, 0.3)

def s_pop(c):
    p = c.get('pitch', 1); n = ns(0.16); t = tt(n)
    f = 380 * p + 560 * p * np.exp(-t / 0.012)
    y = sine(f, n) * env_exp(n, 0.0015, 0.045)
    y += 0.25 * hp(noise(n), 3000) * env_exp(n, 0.0005, 0.003)
    return lp(y, 7000)

def s_window_slam(c):
    n = ns(0.45); t = tt(n)
    pre = sweep(noise(n, 'pink'), 700, 2600, 1.0) * np.clip((t - 0.0) / 0.12, 0, 1) * np.exp(-np.maximum(0, t - 0.12) / 0.05)
    thud = sine(110 * np.exp(-np.maximum(0, t - 0.12) / 0.12) + 55, n) * np.where(t > 0.12, np.exp(-(t - 0.12) / 0.09), 0)
    return pre * 0.5 + thud * 0.9, 0.12

def s_tick(c):
    p = c.get('pitch', 1); n = ns(0.05)
    return sine(2400 * p, n) * env_exp(n, 0.0005, 0.007) + 0.3 * hp(noise(n), 5000) * env_exp(n, 0.0003, 0.003)

def s_notif(c):
    a = fm_bell(1318.5, 0.9, 1.41, 1.6, 0.32, 0.08)
    b = fm_bell(1760.0, 0.9, 1.41, 1.6, 0.32, 0.08)
    out = np.zeros(ns(1.0)); out[: len(a)] += a; out[ns(0.09): ns(0.09) + len(b)] += b[: len(out) - ns(0.09)]
    return lp(out, 6000) * 0.6

def s_slap(c):
    p = c.get('pitch', 1); n = ns(0.2); t = tt(n)
    body = bp(noise(n), 1700 * p, 0.8) * env_exp(n, 0.0008, 0.024)
    thump = sine(150 * p * np.exp(-t / 0.05) + 70 * p, n) * env_exp(n, 0.001, 0.06)
    crack = hp(noise(n), 6000) * env_exp(n, 0.0003, 0.006)
    return body * 0.9 + thump * 0.8 + crack * 0.25

def s_thwip(c):
    p = c.get('pitch', 1); n = ns(0.1); t = tt(n)
    air = sweep(noise(n, 'pink'), 800 * p, 3200 * p, 1.2) * env_exp(n, 0.004, 0.03)
    blip = sine(700 * p + 900 * p * (t / 0.1), n) * env_exp(n, 0.001, 0.025)
    return air * 0.8 + blip * 0.35

def s_click(c):
    n = ns(0.12); y = np.zeros(n)
    k = hp(noise(ns(0.01)), 2500) * env_exp(ns(0.01), 0.0002, 0.0018) + sine(1800, ns(0.01)) * env_exp(ns(0.01), 0.0002, 0.004)
    y[: len(k)] += k; y[ns(0.06): ns(0.06) + len(k)] += 0.45 * k
    return y

def s_modal(c):
    n = ns(0.3); t = tt(n)
    y = sine(520 + 260 * np.clip(t / 0.06, 0, 1), n) * env_exp(n, 0.004, 0.09)
    return y * 0.6 + 0.2 * fm_bell(2093, 0.3, 3.5, 0.5, 0.12)

def s_denied(c):
    n = ns(0.3); y = np.zeros(n)
    for i, f in enumerate([233, 196]):
        m = ns(0.075); tone = lp(saw(f, m), 900) * env_ar(m, 0.004, 0.02)
        s = ns(0.1 * i); y[s: s + m] += tone
    return y * 0.8

def s_blip(c):
    n = ns(0.14); t = tt(n)
    return sine(1150 + 250 * np.clip(t / 0.05, 0, 1), n) * env_exp(n, 0.002, 0.05)

def s_key(c):
    p = c.get('pitch', 1); n = ns(0.06)
    return bp(noise(n), 3200 * p, 1.5) * env_exp(n, 0.0005, 0.006) * 0.9 + sine(260 * p, n) * env_exp(n, 0.001, 0.016) * 0.5

def s_error_soft(c):
    n = ns(0.5); y = np.zeros(n)
    for i, f in enumerate([659.3, 554.4]):
        m = ns(0.3); s = ns(0.11 * i); y[s: s + m] += sine(f, m) * env_exp(m, 0.004, 0.1)
    return y * 0.7

def s_question(c):
    p = c.get('pitch', 1); n = ns(0.34); t = tt(n)
    f = 430 * p * (1 + 0.45 * np.clip(t / 0.14, 0, 1) ** 1.5)
    y = lp(saw(f, n), 1600) * 0.35 + sine(f, n) * 0.7
    return y * env_ar(n, 0.012, 0.2)

def s_suck(c):
    d = c.get('dur', 0.34); n = ns(d); t = tt(n); u = t / d
    x = sweep(noise(n, 'pink'), 200, 5200, 0.8, kind='hp') * u ** 3
    x += 0.35 * sine(70 * (1 + 3 * u ** 2), n) * u ** 2
    return fade(x, 0.002, 0.004)

def s_impact_deep(c):
    n = ns(3.0); t = tt(n)
    sub = sine(32 + 30 * np.exp(-t / 0.18), n) * env_exp(n, 0.003, 0.95)
    body = sine(60 + 60 * np.exp(-t / 0.05), n) * env_exp(n, 0.002, 0.16)
    thump = lp(noise(n), 380) * env_exp(n, 0.001, 0.025)
    air = hp(noise(n, 'pink'), 3800) * env_exp(n, 0.01, 0.55) * 0.06
    return np.tanh(1.3 * (sub * 1.0 + body * 0.55 + thump * 0.7)) + air

def s_shimmer(c):
    d = c.get('dur', 2.0); n = ns(d); t = tt(n); y = np.zeros(n)
    for i, f in enumerate([2349.3, 2960.0, 3520.0, 4698.6]):
        am = 0.6 + 0.4 * np.sin(2 * np.pi * (5 + 1.7 * i) * t + i)
        y += sine(f, n) * am * env_exp(n, 0.04, 0.55 + 0.1 * i) / (1 + i * 0.5)
    return y * 0.35

def s_air(c):
    n = ns(0.4); return bp(noise(n, 'pink'), 3000, 0.7) * env_ar(n, 0.1, 0.28) * 0.5

def s_bloom(c):
    d = c.get('dur', 0.5); n = ns(d); t = tt(n)
    x = sweep(noise(n, 'pink'), 400, 3200, 1.0) * env_ar(n, d * 0.8, 0.12)
    tone = sine(np.geomspace(220, 880, n), n) * env_ar(n, d * 0.8, 0.12) * 0.25
    return x * 0.7 + tone

def s_shimmer_sweep(c):
    notes = [1760, 1975.5, 2217.5, 2637, 2960, 3520, 3951, 4434.9]
    n = ns(1.0); y = np.zeros(n)
    for i, f in enumerate(notes):
        b = fm_bell(f, 0.5, 2.0, 0.4, 0.12, 0.05); s = ns(0.045 * i); y[s: s + len(b)] += b[: n - s] * (0.9 - 0.06 * i)
    return y * 0.4

def s_glass(c):
    return (fm_bell(1568, 1.6, 3.5, 0.8, 0.6) + 0.5 * fm_bell(3136, 1.6, 3.5, 0.6, 0.4)) * 0.5

def s_sparkle(c):
    n = ns(1.4); y = np.zeros(n)
    for i, f in enumerate([1174.7, 1480.0, 1760.0, 2349.3]):
        b = fm_bell(f, 1.0, 3.5, 0.9, 0.35); s = ns(0.045 * i); y[s: s + len(b)] += b[: n - s]
    return y * 0.4 + np.pad(s_shimmer({'dur': 1.2}), (0, max(0, n - ns(1.2))))[:n] * 0.4

def s_whoosh(c):
    d = c.get('dur', 0.5); f0, f1 = c.get('f0', 500), c.get('f1', 2500)
    n = ns(d); t = tt(n); u = t / d
    shape = np.sin(np.pi * np.clip(u / 0.62, 0, 1) / 2) ** 2 * np.clip((1 - u) / 0.38, 0, 1) ** 1.5
    x = sweep(noise(n, 'pink'), f0, f1, 0.9) * shape
    return x

def s_swish(c):
    return s_whoosh({'dur': 0.26, 'f0': 900, 'f1': 3400})

def s_riser(c):
    d = c.get('dur', 0.5); n = ns(d); t = tt(n); u = t / d
    x = sweep(noise(n, 'pink'), 300, 7000, 0.7, kind='hp') * u ** 2.2
    for k in (-1, 0, 1):
        x += 0.12 * lp(saw(np.geomspace(147, 588, n) * 2 ** (k * 0.07 / 12), n), 3000) * u ** 2
    return fade(x, 0.002, 0.004)

def s_one_link(c):
    n = ns(3.2); y = np.zeros(n)
    latch = hp(noise(ns(0.02)), 2000) * env_exp(ns(0.02), 0.0003, 0.004)
    y[: len(latch)] += latch * 0.8
    for i, (f, g) in enumerate([(1174.7, 1.0), (1760.0, 0.8), (2349.3, 0.7), (2960.0, 0.35)]):
        b = fm_bell(f, 2.6, 3.5, 0.9, 0.9 - 0.1 * i, 0.2); s = ns(0.018 * i); y[s: s + len(b)] += b[: n - s] * g
    t = tt(n)
    y += sine(55 * (1 + 0.6 * np.exp(-t / 0.06)), n) * env_exp(n, 0.003, 0.45) * 0.9
    return y * 0.55

def s_zip(c):
    d = c.get('dur', 0.42); n = ns(d); t = tt(n)
    x = sweep(noise(n, 'pink'), 700, 4000, 1.4) * env_ar(n, d * 0.7, d * 0.3)
    tone = sine(np.geomspace(400, 1500, n) * (1 + 0.01 * np.sin(2 * np.pi * 30 * t)), n) * env_ar(n, d * 0.7, 0.08) * 0.15
    return x * 0.6 + tone

def s_load(c):
    d = c.get('dur', 0.3); n = ns(d); t = tt(n)
    return sine(np.geomspace(600, 1250, n), n) * (0.6 + 0.4 * np.sin(2 * np.pi * 22 * t)) * env_ar(n, 0.03, 0.08) * 0.5

def s_positive(c):
    p = c.get('pitch', 1); f = 880 * p; n = ns(0.9); t = tt(n)
    y = sine(f, n) * env_exp(n, 0.002, 0.28) + 0.35 * sine(f * 3.93, n) * env_exp(n, 0.001, 0.05) + 0.25 * sine(f * 2, n) * env_exp(n, 0.002, 0.18)
    return y * 0.7

def s_scroll(c):
    d = c.get('dur', 0.45); n = ns(d); y = np.zeros(n)
    for i in range(9):
        s = ns(0.045 * i); k = s_tick({'pitch': 0.7})
        y[s: s + len(k)] += k[: n - s] * (0.8 - 0.07 * i)
    return y * 0.7

def s_impact_soft(c):
    n = ns(2.0); t = tt(n)
    return np.tanh(sine(40 + 36 * np.exp(-t / 0.08), n) * env_exp(n, 0.003, 0.6) * 1.2 + lp(noise(n), 300) * env_exp(n, 0.001, 0.02) * 0.5)

def s_chime_final(c):
    n = ns(3.5); y = np.zeros(n)
    for i, f in enumerate([587.3, 880.0, 1174.7, 1480.0]):
        b = fm_bell(f, 3.2, 3.5, 0.7, 1.4 - 0.15 * i, 0.3); s = ns(0.03 * i); y[s: s + len(b)] += b[: n - s] * (1 - 0.15 * i)
    return y * 0.45

def s_send(c):
    n = ns(0.5); y = np.zeros(n)
    p = s_pop({'pitch': 1.25}); y[: len(p)] += p
    w = s_whoosh({'dur': 0.3, 'f0': 900, 'f1': 4200}); y[ns(0.02): ns(0.02) + len(w)] += w * 0.8
    return y

PALETTE = {k[2:]: v for k, v in globals().items() if k.startswith('s_')}
REVERB_SEND = {'impact_deep': 0.35, 'shimmer': 0.6, 'one_link': 0.45, 'chime_final': 0.55, 'glass': 0.45, 'sparkle': 0.4,
               'bloom': 0.3, 'shimmer_sweep': 0.4, 'positive': 0.25, 'notif': 0.2, 'impact_soft': 0.3, 'air_in': 0.3, 'whoosh': 0.12}

# ------------------------------------------------------------------ score
B = 60 / 112                     # beat at 112 BPM
NOTE = lambda name: 440 * 2 ** ((
    {'C': -9, 'C#': -8, 'Db': -8, 'D': -7, 'D#': -6, 'Eb': -6, 'E': -5, 'F': -4, 'F#': -3, 'Gb': -3, 'G': -2, 'G#': -1, 'Ab': -1, 'A': 0, 'A#': 1, 'Bb': 1, 'B': 2}[name[:-1]]
    + 12 * (int(name[-1]) - 4)) / 12)

def pad_voice(freqs, dur, cutoff=1800, attack=0.5, release=0.9, detune=0.1):
    n = ns(dur); y = np.zeros(n)
    for f in freqs:
        for d in (-detune, 0.0, detune):
            y += saw(f * 2 ** (d / 12), n) / 3
        y += 0.5 * sine(f, n)
    y = lp(y, cutoff, 2) / len(freqs)
    return y * env_ar(n, attack, release, 1.5)

def kick_soft(n=None):
    n = ns(0.45); t = tt(n)
    sub = np.tanh(1.3 * sine(48 + 60 * np.exp(-t / 0.04), n) * env_exp(n, 0.002, 0.14)) * 0.75
    knock = bp(noise(n), 1400, 1.4) * env_exp(n, 0.0004, 0.008) * 0.55 + sine(190, n) * env_exp(n, 0.001, 0.022) * 0.5
    return sub + knock + 0.12 * hp(noise(n), 3000) * env_exp(n, 0.0003, 0.003)

def hat(n=None, tau=0.022):
    n = ns(0.12); return hp(noise(n), 7000) * env_exp(n, 0.0005, tau)

def rim():
    n = ns(0.15); return bp(noise(n), 1900, 1.2) * env_exp(n, 0.0005, 0.02) + 0.3 * sine(820, n) * env_exp(n, 0.001, 0.02)

def build_music():
    mus = np.zeros((2, N))
    # ---------- Part A: 0 → freeze. Tense minor pulse, density rising.
    A_end = FREEZE
    beats = np.arange(0, A_end, B)
    for i, bt in enumerate(beats):                                        # soft pulse
        place(mus, kick_soft(), bt, -16.5 + 1.5 * min(1, bt / 14), 0)
    arp = ['D4', 'A4', 'F4', 'C5', 'D5', 'A4', 'F4', 'E5']
    for i, bt in enumerate(np.arange(0, A_end, B / 2)):                   # plucked ostinato
        cutoff = 1300 + 2600 * (bt / A_end)
        y = lp(fm_keys(NOTE(arp[i % 8]), 0.5, 1.0, 0.22), cutoff + 900)
        place(mus, y, bt, -19 + 1 * (bt / A_end), -0.25 if i % 2 else 0.25)
    pad = pad_voice([NOTE('D3'), NOTE('F3'), NOTE('A3'), NOTE('C4'), NOTE('E4')], A_end + 0.2, 850, 2.5, 0.05)
    place(mus, pad * np.linspace(0.6, 1.0, len(pad)), 0, -21)             # dark bed
    for bt in np.arange(0.0, A_end, B / 2):                                # pumping bass
        m = ns(B / 2); y = lp(saw(NOTE('D2'), m), 420) * env_ar(m, 0.01, B / 2 * 0.6)
        place(mus, y, bt, (-21 if bt < 4 else -20) + 3 * (bt / A_end))
    for bt in np.arange(0.0, A_end, B / 2): place(mus, hat(), bt, -34 if bt < 4 else -31, 0.3)   # hats 8ths
    for bt in np.arange(8.26, A_end, B / 4): place(mus, hat(tau=0.015), bt, -35 + 4 * ((bt - 8.26) / 6), -0.3)
    for bt in np.arange(12.4, A_end, B / 8): place(mus, hat(tau=0.01), bt, -36 + 6 * ((bt - 12.4) / 2), 0.1)
    rn = ns(A_end - 10.6); u = np.linspace(0, 1, rn)                         # tension riser
    r = sweep(noise(rn, 'pink'), 300, 6500, 0.7, kind='hp') * u ** 2.5
    for k in (-1, 0, 1): r += 0.1 * lp(saw(np.geomspace(NOTE('D3'), NOTE('D4'), rn) * 2 ** (k * 0.12 / 12), rn), 2500) * u ** 2
    place(mus, r, 10.6, -17)
    mus[:, int(FREEZE * SR):] = 0                                           # HARD CUT at «لا»

    # ---------- Part B: impact → end. Warm major, half-time, controlled.
    T0 = C1
    chords = [  # (start, voicing)
        (T0, ['D3', 'F#3', 'A3', 'C#4', 'E4']), (17.48, ['G2', 'B3', 'D4', 'F#4', 'A4']), (19.6, ['E3', 'G3', 'B3', 'D4', 'F#4']),
        (21.6, ['A2', 'E3', 'B3', 'C#4', 'F#4']), (23.95, ['F#2', 'A3', 'C#4', 'E4', 'G#4']), (24.95, ['G2', 'D3', 'A3', 'B3', 'F#4']),
        (26.25, ['E2', 'B2', 'G3', 'D4', 'F#4']), (27.94, ['D3', 'A3', 'C#4', 'E4', 'F#4']), (29.3, ['B2', 'F#3', 'A3', 'D4', 'E4']),
        (30.45, ['G2', 'D3', 'B3', 'F#4', 'A4']), (32.22, ['D3', 'F#3', 'A3', 'C#4', 'E4', 'A4']), (34.15, ['D3', 'A3', 'C#4', 'E4', 'F#4', 'A4']),
    ]
    for i, (st, notes) in enumerate(chords):
        en = chords[i + 1][0] if i + 1 < len(chords) else DUR
        cut = 900 if st == 26.25 else (3600 if st >= 32.2 else 2800)
        y = pad_voice([NOTE(n) for n in notes], en - st + 0.9, cut, 0.35 if st != T0 else 0.9, 0.9)
        place(mus, y, st, -21 if st < 32.2 else -19)
        root = NOTE(notes[0]) / (2 if NOTE(notes[0]) > 100 else 1)
        if st >= 17.4 and st != 26.25:                                     # sub bass on the root
            m = ns(en - st + 0.3); b = sine(root, m) * env_ar(m, 0.08, 0.3)
            place(mus, np.tanh(b * 1.3), st, -22)
    chord_at = lambda tm: [c for c in chords if c[0] <= tm + 1e-6][-1][1]
    grid = T0 + np.arange(0, 60) * B
    active = lambda tm: (17.48 <= tm < 26.25) or (27.94 <= tm < 34.15)
    for k, bt in enumerate(np.arange(17.48, 34.15, B / 2)):                 # felt-keys arpeggio
        if not active(bt): continue
        notes = chord_at(bt); f = NOTE(notes[1 + (k % (len(notes) - 1))]) * (2 if k % 4 == 3 else 1)
        place(mus, fm_keys(f, 0.8, 0.95, 0.35), bt, -22 + (2 if bt >= 32.2 else 0), [-0.35, 0.35][k % 2])
    for k, bt in enumerate(grid):
        if not active(bt) or bt < 17.95: continue
        if k % 2 == 0: place(mus, kick_soft(), bt, -21)
        if k % 4 == 2 and bt >= 19.6: place(mus, rim(), bt, -29, 0.15)
    for bt in np.arange(21.6, 34.15, B / 4):
        if active(bt) and bt >= 21.6: place(mus, hat(tau=0.012), bt, -36 + (2 if bt > 29.3 else 0), 0.35)
    # payoff lift: airy octave pad
    y = pad_voice([NOTE('A4'), NOTE('D5'), NOTE('F#5')], 34.15 - 32.22 + 0.8, 3200, 0.6, 0.8)
    place(mus, y, 32.22, -27)
    # gentle fade to the end
    fo = ns(1.4); mus[:, -fo:] *= np.linspace(1, 0, fo) ** 1.5
    return mus

# ------------------------------------------------------------------ sfx
def build_sfx():
    dry = np.zeros((2, N)); send = np.zeros((2, N))
    for c in SND['cues']:
        fn = PALETTE.get(c['type'])
        if fn is None: print('  ! unknown sfx', c['type']); continue
        out = fn(c); pre = 0.0
        if isinstance(out, tuple): out, pre = out
        out = fade(np.asarray(out, dtype=float), 0.001, 0.01)
        place(dry, out, c['t'] - pre, c['gain'], c.get('pan', 0))
        s = REVERB_SEND.get(c['type'], 0.08)
        place(send, out, c['t'] - pre, c['gain'] + 20 * np.log10(s), c.get('pan', 0))
    wet = convolve_st(send, reverb_ir(2.2))
    sfx = dry + wet
    return sfx

def gate_freeze(x):
    """«لا.» — everything stops. Silence until the collapse begins."""
    a, b = int(FREEZE * SR), int(C0 * SR)
    x[:, a - 96: a] *= np.linspace(1, 0, 96)
    x[:, a: b] = 0
    return x

# ------------------------------------------------------------------ mastering
def limiter(x, ceiling_db=-1.2, look=0.004, release=0.08, osr=4):
    """Look-ahead limiter with true-peak (4x oversampled) detection."""
    thr = db(ceiling_db)
    n = x.shape[1]
    up = np.abs(signal.resample_poly(x, osr, 1, axis=1)).max(axis=0)[: n * osr]
    pk = up.reshape(n, osr).max(axis=1)
    peak = maximum_filter1d(pk, size=ns(look) * 2 + 1)
    g = np.minimum(1.0, thr / np.maximum(peak, 1e-9))
    g = minimum_filter1d(g, size=ns(look) * 2 + 1)
    a = np.exp(-1 / (release * SR))
    gs = signal.lfilter([1 - a], [1, -a], g - 1) + 1          # smooth release
    gs = np.minimum(gs, g)
    return x * gs

def true_peak_db(x):
    up = signal.resample_poly(x, 4, 1, axis=1)
    return 20 * np.log10(np.max(np.abs(up)) + 1e-12)

def shelf(x, f0, gain_db, kind='high', S=0.8):
    A = 10 ** (gain_db / 40); w0 = 2 * np.pi * f0 / SR; cw, sw = np.cos(w0), np.sin(w0)
    al = sw / 2 * np.sqrt((A + 1 / A) * (1 / S - 1) + 2); k = 2 * np.sqrt(A) * al
    if kind == 'high':
        b = [A * ((A + 1) + (A - 1) * cw + k), -2 * A * ((A - 1) + (A + 1) * cw), A * ((A + 1) + (A - 1) * cw - k)]
        a = [(A + 1) - (A - 1) * cw + k, 2 * ((A - 1) - (A + 1) * cw), (A + 1) - (A - 1) * cw - k]
    else:
        b = [A * ((A + 1) - (A - 1) * cw + k), 2 * A * ((A - 1) - (A + 1) * cw), A * ((A + 1) - (A - 1) * cw - k)]
        a = [(A + 1) + (A - 1) * cw + k, -2 * ((A - 1) + (A + 1) * cw), (A + 1) + (A - 1) * cw - k]
    return signal.lfilter(np.array(b) / a[0], np.array(a) / a[0], x, axis=-1)

def master_eq(x):
    x = np.stack([hp(x[c], 38, 2) for c in range(2)])
    x = shelf(x, 130, -3.0, 'low')
    x = shelf(x, 3500, 4.0, 'high')
    return x

def master(x, target=-14.0):
    meter = pyln.Meter(SR)
    x = master_eq(x)
    loud = meter.integrated_loudness(x.T)
    x = x * db(target - loud)
    # -2 dBTP ceiling: leaves room for AAC encoder overshoot so delivered
    # files stay at or below Meta's -1 dBTP guidance
    for _ in range(4):
        x = limiter(x, -2.3)
        loud = meter.integrated_loudness(x.T)
        x = x * db(target - loud)
    x = limiter(x, -2.3)
    tp = true_peak_db(x)
    if tp > -2.0: x = x * db(-2.0 - tp)                    # final true-peak safety
    return x, meter.integrated_loudness(x.T), true_peak_db(x)

def duck(bed, vo, depth_db=-9, att=0.04, rel=0.35):
    env = np.abs(vo).max(axis=0)
    env = maximum_filter1d(env, ns(0.02))
    a_a, a_r = np.exp(-1 / (att * SR)), np.exp(-1 / (rel * SR))
    sm = signal.lfilter([1 - a_r], [1, -a_r], env)            # release-smoothed
    sm = np.maximum(sm, signal.lfilter([1 - a_a], [1, -a_a], env))
    k = np.clip(sm / (np.percentile(sm[sm > 1e-4], 90) if np.any(sm > 1e-4) else 1), 0, 1)
    return bed * db(depth_db * k)

def write(name, x):
    p = os.path.join(ROOT, 'audio', name)
    sf.write(p, x.T.astype(np.float32), SR, subtype='PCM_24')
    return p

def main():
    os.makedirs(os.path.join(ROOT, 'audio'), exist_ok=True)
    print('· score'); mus = gate_freeze(build_music())
    print('· sound design'); sfx = gate_freeze(build_sfx())
    # bus balance: music sits under where the VO will be; SFX carry the edit
    mus_bus = np.tanh(mus * db(-2)) ; sfx_bus = sfx
    write('music.wav', mus_bus); write('sfx.wav', sfx_bus)
    bed = mus_bus * db(-1.5) + sfx_bus
    mix, lufs, tp = master(bed.copy())
    mix = gate_freeze(mix)
    write('mix.wav', mix)
    print(f'✓ mix.wav  {lufs:.1f} LUFS  TP {tp:.1f} dBTP')
    vo_path = os.path.join(ROOT, 'audio', 'vo.wav')
    if os.path.exists(vo_path):
        vo, sr = sf.read(vo_path, always_2d=True)
        vo = vo.T
        if sr != SR: vo = signal.resample_poly(vo, SR, sr, axis=1)
        if vo.shape[0] == 1: vo = np.vstack([vo, vo])
        vo = vo[:, :N] if vo.shape[1] >= N else np.pad(vo, ((0, 0), (0, N - vo.shape[1])))
        vo = np.stack([hp(vo[0], 80), hp(vo[1], 80)])
        meter = pyln.Meter(SR)
        vo *= db(-16 - meter.integrated_loudness(vo.T))
        bed_vo = duck(mus_bus * db(-5), vo, -9) + duck(sfx_bus * db(-3), vo, -4)
        mix2, l2, tp2 = master(vo + bed_vo)
        write('mix_vo.wav', mix2)   # VO «لا» lives in the freeze window: no re-gate here
        print(f'✓ mix_vo.wav  {l2:.1f} LUFS  TP {tp2:.1f} dBTP')
    if '--plot' in sys.argv: plot(mix)

def plot(x):
    from PIL import Image, ImageDraw
    W, H = 1800, 520
    im = Image.new('RGB', (W, H), (18, 18, 22)); d = ImageDraw.Draw(im)
    mono = x.mean(axis=0); step = len(mono) // W
    for i in range(W):
        seg = mono[i * step:(i + 1) * step]
        if len(seg) == 0: continue
        pk = np.max(np.abs(seg)); rms = np.sqrt(np.mean(seg ** 2))
        d.line([(i, 150 - pk * 140), (i, 150 + pk * 140)], fill=(90, 70, 190))
        d.line([(i, 150 - rms * 140), (i, 150 + rms * 140)], fill=(180, 160, 255))
    f, t, S = signal.spectrogram(mono, SR, nperseg=2048, noverlap=1024)
    S = 10 * np.log10(S + 1e-12); S = np.clip((S + 110) / 90, 0, 1)
    fi = np.searchsorted(f, np.geomspace(40, 16000, 200))
    for yi, k in enumerate(fi[::-1]):
        row = S[min(k, len(f) - 1)]
        xs = (np.arange(len(row)) * W / len(row)).astype(int)
        for xx, v in zip(xs, row):
            d.point((xx, 310 + yi), fill=(int(255 * v), int(180 * v), int(90 + 120 * v)))
    for s in range(0, int(DUR) + 1, 2):
        xx = int(s / DUR * W); d.line([(xx, 0), (xx, 12)], fill=(200, 200, 200)); d.text((xx + 2, 0), f'{s}s', fill=(200, 200, 200))
    out = os.path.join(ROOT, 'out', 'audio_plot.png'); os.makedirs(os.path.dirname(out), exist_ok=True); im.save(out); print('plot', out)

if __name__ == '__main__':
    main()
