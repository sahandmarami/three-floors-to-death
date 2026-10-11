#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Synthesize all game SFX as WAV files for the Godot port — same parameters
as the Web Audio Snd.tone/Snd.noise engine (faithful sound-alike)."""
import numpy as np
import wave, os, math

SR = 44100
OUT = '/home/z/my-project/godot-project/audio/sfx'
os.makedirs(OUT, exist_ok=True)

def env(n, att=0.004, dur_rel=None):
    """attack-decay envelope: fast attack, exponential decay"""
    e = np.ones(n)
    a = max(1, int(att * SR))
    e[:a] = np.linspace(0, 1, a)
    rel = n - a
    if rel > 0:
        e[a:] = np.exp(-np.linspace(0, 5.5, rel))
    return e

def osc(type_, f0, f1, dur, vol=0.2, att=0.004, delay=0.0):
    n = int(dur * SR)
    t = np.arange(n) / SR
    f = f0 * (f1 / f0) ** (t / dur) if (f1 and f1 != f0 and dur > 0) else np.full(n, f0)
    ph = 2 * np.pi * np.cumsum(f) / SR
    if type_ == 'sine':
        s = np.sin(ph)
    elif type_ == 'square':
        s = np.sign(np.sin(ph)) * 0.7
    elif type_ == 'triangle':
        s = 2 / np.pi * np.arcsin(np.sin(ph))
    elif type_ == 'sawtooth':
        s = 2 * ((ph / (2 * np.pi)) % 1) - 1
    else:
        s = np.sin(ph)
    s = s * env(n, att) * vol
    d = np.zeros(int(delay * SR))
    return np.concatenate([d, s])

def noise(dur, vol=0.2, ftype=None, freq=1000.0, q=1.0, att=0.004, delay=0.0):
    n = int(dur * SR)
    rng = np.random.default_rng(1379)
    s = rng.uniform(-1, 1, n)
    # simple biquad-ish filtering via FFT
    F = np.fft.rfft(s)
    freqs = np.fft.rfftfreq(n, 1 / SR)
    if ftype == 'highpass':
        H = 1 / (1 + (freq / np.maximum(freqs, 1)) ** (2 * q))
    elif ftype == 'bandpass':
        H = np.exp(-((np.log2(np.maximum(freqs, 1) / freq)) ** 2) / (2 * 0.35 ** 2))
    else:  # lowpass
        H = 1 / (1 + (np.maximum(freqs, 1) / max(freq, 1)) ** (2 * max(q, 0.5)))
    s = np.fft.irfft(F * H, n)
    m = np.max(np.abs(s)) or 1
    s = s / m * env(n, att) * vol
    d = np.zeros(int(delay * SR))
    return np.concatenate([d, s])

def mix(*parts):
    n = max(len(p) for p in parts)
    out = np.zeros(n)
    for p in parts:
        out[:len(p)] += p
    peak = np.max(np.abs(out))
    if peak > 0.95:
        out = out / peak * 0.95
    return out

def save(name, data):
    data16 = (np.clip(data, -1, 1) * 32767).astype(np.int16)
    with wave.open(f'{OUT}/{name}.wav', 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes(data16.tobytes())
    print(f'  {name}.wav  {len(data)/SR:.2f}s')

S = {}
S['click']      = mix(osc('square', 1300, 850, 0.05, 0.07))
S['shoot_p']    = mix(noise(0.09, 0.20, 'highpass', 700), osc('square', 230, 70, 0.08, 0.11))
S['shoot_s']    = mix(noise(0.22, 0.32, 'lowpass', 1300), osc('sine', 105, 36, 0.24, 0.28))
S['shoot_m']    = mix(noise(0.05, 0.13, 'bandpass', 1700, 1.1), osc('square', 300, 110, 0.05, 0.06))
S['hit']        = mix(osc('square', 165, 90, 0.06, 0.09))
S['crit']       = mix(osc('triangle', 1500, 2050, 0.07, 0.10), osc('triangle', 2050, 2650, 0.09, 0.08, delay=0.05))
S['combo1']     = mix(osc('triangle', 420, 420, 0.09, 0.12), osc('triangle', 630, 630, 0.14, 0.10, delay=0.07))
S['death']      = mix(osc('sawtooth', 180, 42, 0.30, 0.14), noise(0.22, 0.12, 'lowpass', 650))
S['coin']       = mix(osc('sine', 920, 920, 0.07, 0.12), osc('sine', 1360, 1360, 0.15, 0.12, delay=0.07))
S['tower_hit']  = mix(osc('sine', 78, 40, 0.20, 0.32), noise(0.16, 0.20, 'lowpass', 260))
S['buy']        = mix(osc('triangle', 520, 760, 0.09, 0.15), osc('triangle', 760, 1140, 0.14, 0.15, delay=0.09))
S['deny']       = mix(osc('square', 130, 130, 0.09, 0.11), osc('square', 96, 96, 0.15, 0.11, delay=0.10))
S['wave']       = mix(osc('sawtooth', 196, 196, 0.15, 0.11), osc('sawtooth', 262, 262, 0.20, 0.11, delay=0.16))
S['clear']      = mix(*[osc('triangle', f, f, 0.16, 0.11, delay=i * 0.09) for i, f in enumerate([440, 554, 659])])
S['gameover']   = mix(*[osc('triangle', f, f, 0.34, 0.15, delay=i * 0.22) for i, f in enumerate([330, 262, 196, 131])])
S['victory']    = mix(*[osc('triangle', f, f, 0.20, 0.14, delay=i * 0.13) for i, f in enumerate([523, 659, 784, 1047, 784, 1047])])
S['trap']       = mix(osc('square', 420, 110, 0.06, 0.07))
S['roar']       = mix(osc('sawtooth', 72, 30, 0.90, 0.26), noise(0.80, 0.18, 'lowpass', 300))
S['boss_die']   = mix(osc('sawtooth', 160, 24, 1.10, 0.24), *[osc('triangle', f, f, 0.20, 0.14, delay=0.9 + i * 0.13) for i, f in enumerate([523, 659, 784, 1047, 784, 1047])])
S['thunder']    = mix(noise(1.8, 0.24, 'lowpass', 110, 0.4, att=0.12), osc('sine', 52, 30, 1.6, 0.18, att=0.05))
S['power']      = mix(*[osc('triangle', f, f, 0.12, 0.12, delay=i * 0.06) for i, f in enumerate([620, 830, 1240])])
S['freeze']     = mix(noise(0.5, 0.10, 'highpass', 4000), osc('sine', 1800, 600, 0.5, 0.08))
S['heartbeat']  = mix(osc('sine', 64, 40, 0.12, 0.22), osc('sine', 58, 36, 0.14, 0.18, delay=0.18))
S['slowmo']     = mix(osc('sawtooth', 400, 60, 0.5, 0.10))
S['morning']    = mix(*[osc('sine', f, f * 1.18, 0.13, 0.09, delay=i * 0.15) for i, f in enumerate([1500, 1820, 1500, 2050])])
S['dusk']       = mix(osc('sawtooth', 160, 55, 0.9, 0.12), osc('sine', 240, 115, 1.0, 0.07, delay=0.12))
S['tur_shot']   = mix(noise(0.06, 0.10, 'bandpass', 1500, 1), osc('square', 210, 90, 0.05, 0.05))
S['sniper']     = mix(noise(0.30, 0.26, 'lowpass', 900), osc('sine', 150, 40, 0.32, 0.24), osc('triangle', 620, 190, 0.30, 0.06, delay=0.14))
S['frost_shot'] = mix(osc('sine', 1600, 520, 0.22, 0.07), noise(0.14, 0.05, 'highpass', 5000))
S['zap']        = mix(osc('sawtooth', 2400, 300, 0.10, 0.09), noise(0.10, 0.06, 'highpass', 3000))
S['missile_shot'] = mix(noise(0.4, 0.16, 'lowpass', 700), osc('sawtooth', 320, 640, 0.35, 0.07))
S['missile_boom'] = mix(noise(0.5, 0.24, 'lowpass', 200), osc('sine', 90, 34, 0.5, 0.22))
S['flame_shot'] = mix(noise(0.12, 0.06, 'bandpass', 900, 0.8))
S['place_t']    = mix(osc('sine', 130, 55, 0.14, 0.22), noise(0.12, 0.14, 'lowpass', 320))
S['blip']       = mix(osc('square', 950, 950, 0.018, 0.05))
# کمیبوی نردبان‌دار (۳ سطح برای تنوع)
for n in (2, 3, 5):
    f = 420 * (1.14 ** n)
    S[f'combo{n}'] = mix(osc('triangle', f, f, 0.09, 0.12), osc('triangle', f * 1.5, f * 1.5, 0.14, 0.10, delay=0.07))
# باد محیطی (لوپ ملایم برای موسیقی محیطی)
rng = np.random.default_rng(42)
wind = rng.uniform(-1, 1, SR * 4)
F = np.fft.rfft(wind)
freqs = np.fft.rfftfreq(len(wind), 1 / SR)
H = 1 / (1 + (freqs / 400.0) ** 2)
wind = np.fft.irfft(F * H, len(wind))
wind = wind / np.max(np.abs(wind)) * 0.16
# فید لوپ: ابتدا و انتها هم‌پوشان برای لوپ بی‌درز
fade = int(0.5 * SR)
wind[:fade] *= np.linspace(0, 1, fade)
wind[-fade:] *= np.linspace(1, 0, fade)
wind[-fade:] += wind[:fade] * np.linspace(1, 0, fade) * 0  # ساده: فقط فید
S['wind_loop'] = wind

for k, v in S.items():
    save(k, v)
print(f'\n{len(S)} SFX -> {OUT}')
