#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""وصله‌ی ۲۲٫۰ — فایل ۴: v4_final.js + v4_audio.js
- victory cine جدید: سحر (گفتگوی پس از موج نهایی) → آژیر + هشدار بی‌سیم
  → startEndingCine (دوربین دور می‌شود)
- DLG_WHO: نام بازیکن = «سهند»، رادیو = «بی‌سیم»
- VOICES22 + کش LRU برای دیکد
"""
import re, sys

F = '/home/z/my-project/scripts/v4_final.js'
src = open(F, encoding='utf-8').read()

# ---- ۱) startVictoryCine: phase ----
src = src.replace("VC = { t: 0, radio: false };", "VC = { t: 0, phase: 'dawn', radio: false };", 1)

# ---- ۲) updateVictoryCine جدید ----
pat = re.compile(r'function updateVictoryCine\(dt\) \{.*?\n\}\n\nfunction renderVictoryCine', re.S)
if not pat.search(src): print('FAIL: updateVictoryCine'); sys.exit(1)

NEW = r'''function updateVictoryCine(dt) {
  if (!VC) return;
  VC.t += dt;
  DLG.update(dt);
  state.dayness = Math.min(1, state.dayness + dt * 0.55);
  state.shake = Math.max(0, state.shake - dt * 22);
  state.flash = Math.max(0, state.flash - dt * 2.2);
  state.comboPop = Math.max(0, state.comboPop - dt);
  updateParticles(dt);
  updateTexts(dt);
  if (VC.t < 2.4 && Math.random() < dt * 20) {
    spawnParticles(rand(0, W), -8, 1, '#ffd873',
      { speed: 26, life: 2.4, size: 2.4, grav: 110 });
  }
  if (VC.phase === 'dawn') {
    /* (22.0) گفتگوی پس از موج نهایی — «تموم شد؟ واقعاً تموم شد؟» */
    if (!VC.spoken && VC.t > 1.3) {
      VC.spoken = true;
      const dl = (typeof STORY22 !== 'undefined') ? STORY22.afterFinal : [];
      DLG.start(dl, () => { if (VC) VC.done = true; });
    }
    if (!VC.radio && VC.t > 3.2) { VC.radio = true; SFX.peddler(); }
    if ((VC.done || VC.t > 26) && VC.t > 8) {
      /* بی‌سیم ناگهان با صدای هشدار روشن می‌شود */
      VC.phase = 'alarm';
      VC.t = 0;
      SFX.alarm();
      state.shake = 8;
    }
  } else if (VC.phase === 'alarm') {
    /* آژیر قرمز + هشدار بی‌سیم + آمادگی تخلیه */
    state.shake = Math.max(state.shake, 2.5);
    if (Math.sin(VC.t * 4.4) > 0.92 && !VC._al2) { VC._al2 = true; SFX.alarm(); }
    if (Math.sin(VC.t * 4.4) < -0.92) VC._al2 = false;
    if (!VC.spoken2 && VC.t > 0.8) {
      VC.spoken2 = true;
      const dl = (typeof STORY22 !== 'undefined') ? STORY22.radioAlarm : [];
      DLG.start(dl, () => { if (VC) VC.done2 = true; });
    }
    if ((VC.done2 || VC.t > 44) && VC.t > 6) {
      VOICE.stop();
      DLG.skip();
      VC = null;
      startEndingCine();                        /* (22.0) پایان سینمایی */
    }
  }
}

function renderVictoryCine'''
src = pat.sub(lambda m: NEW, src, count=1)

# ---- ۳) رندر: پوشش قرمز آژیر + حذف محو سفید پایانی ----
old_fade = re.compile(r"  /\* محو به سفیدیِ سحر \*/\n  const a = clamp\(\(VC\.t - 6\.8\) / 0\.8, 0, 1\);\n  if \(a > 0\) \{\n    ctx\.fillStyle = 'rgba\(255,250,240,' \+ a\.toFixed\(2\) \+ '\)';\n    ctx\.fillRect\(0, 0, W, H\);\n  \}\n\}")
if old_fade.search(src):
    src = old_fade.sub(
"""  /* (22.0) پوشش قرمزِ آژیر در فاز هشدار */
  if (VC.phase === 'alarm') {
    const red = 0.5 + 0.5 * Math.sin(VC.t * 4.4);
    ctx.fillStyle = 'rgba(170,20,10,' + (0.08 + red * 0.09).toFixed(3) + ')';
    ctx.fillRect(0, 0, W, H);
    const vg = ctx.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, H * 0.75);
    vg.addColorStop(0, 'rgba(120,0,0,0)');
    vg.addColorStop(1, 'rgba(120,0,0,' + (0.22 + red * 0.14).toFixed(3) + ')');
    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, W, H);
  }
}""", src, count=1)
else:
    print('WARN: white-fade block not found (may differ)')

open(F, 'w', encoding='utf-8').write(src)
print('OK: v4_final.js patched')

# ================= v4_audio.js =================
F2 = '/home/z/my-project/scripts/v4_audio.js'
s2 = open(F2, encoding='utf-8').read()

# ---- ۴) DLG_WHO: سهند + بی‌سیم ----
s2 = s2.replace("p: { name: 'تو',          color: '#8fd6ff' },",
                "p: { name: 'سهند',        color: '#8fd6ff' },", 1)
s2 = s2.replace("r: { name: '📻 رادیو',    color: '#a8e4a0' },",
                "r: { name: '📻 بی‌سیم',    color: '#a8e4a0' },", 1)

# ---- ۵) VOICES17 → VOICES22 ----
n = s2.count('VOICES17')
s2 = s2.replace('VOICES17', 'VOICES22')
print(f'VOICES17 refs replaced: {n}')

# ---- ۶) کش LRU برای بوم‌های دیکدشده (محدودیت رم) ----
old_buf = """  _buf(key) {
    const meta = (typeof VOICES22 !== 'undefined') && VOICES22[key];
    if (!meta) return null;
    if (this._bufs[key] !== undefined) return this._bufs[key];   // ممکن است nullِ درصف دیکد باشد"""
new_buf = """  _buf(key) {
    const meta = (typeof VOICES22 !== 'undefined') && VOICES22[key];
    if (!meta) return null;
    /* (22.0) LRU: آخرین استفاده جلو می‌آید؛ بیش از ۴۸ بوم در رم نمی‌ماند */
    if (this._lru && this._lru.has(key)) { const b = this._lru.get(key); this._lru.delete(key); this._lru.set(key, b); }
    if (this._bufs[key] !== undefined) return this._bufs[key];   // ممکن است nullِ درصف دیکد باشد"""
if old_buf in s2:
    s2 = s2.replace(old_buf, new_buf, 1)
else:
    print('WARN: _buf head mismatch')

# after decode completes, insert into LRU and evict
old_dec = """      if (buf) this._bufs[key] = buf;
    }).catch(() => {});"""
new_dec = """      if (buf) {
        this._bufs[key] = buf;
        if (!this._lru) this._lru = new Map();
        this._lru.set(key, buf);
        while (this._lru.size > 48) {                       /* (22.0) اخراج قدیمی‌ترین */
          const old = this._lru.keys().next().value;
          this._lru.delete(old);
          delete this._bufs[old];
        }
      }
    }).catch(() => {});"""
if old_dec in s2:
    s2 = s2.replace(old_dec, new_dec, 1)
else:
    print('WARN: decode-cache block mismatch')

# ---- ۷) warmup سبک: فقط ۸ کلیپ اول افتتاحیه ----
old_warm = """  warmup() {
    if (this._warmAll || !(typeof VOICES22 !== 'undefined')) return;
    this._warmAll = true;
    const keys = Object.keys(VOICES22);
    let i = 0;
    const step = () => {
      if (i >= keys.length) return;
      this._buf(keys[i++]);
      setTimeout(step, 120);
    };
    step();
  },"""
new_warm = """  warmup() {
    /* (22.0) با ۱۷۰ کلیپ، پیش‌بارگیریِ کامل = ~۷۰MB رم؛ فقط افتتاحیه
       گرم می‌شود و بقیه با حالت clipwait در لحظه‌ی خود دیکد می‌شوند */
    if (this._warmAll || !(typeof VOICES22 !== 'undefined')) return;
    this._warmAll = true;
    const keys = ['i1n', 'i2n', 'i3a', 'i4p', 'i5a', 'i6p', 'i7a', 'i8p'].filter(k => VOICES22[k]);
    let i = 0;
    const step = () => {
      if (i >= keys.length) return;
      this._buf(keys[i++]);
      setTimeout(step, 120);
    };
    step();
  },"""
if old_warm in s2:
    s2 = s2.replace(old_warm, new_warm, 1)
else:
    print('WARN: warmup block mismatch')

open(F2, 'w', encoding='utf-8').write(s2)
print('OK: v4_audio.js patched')
