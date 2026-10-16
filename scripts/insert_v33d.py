#!/usr/bin/env python3
# -*- coding: utf-8 -*-
# insert_v33d.py — افزودن کارت «گوش بسپار» به نسخه‌ی v32 از openArchive (که واقعاً اجرا می‌شود)
import io

P = '/home/z/my-project/download/three-floors-to-survival.html'
s = io.open(P, encoding='utf-8').read()
orig = len(s)

# کارت شنود در پرونده‌ی v32
old_card = """      h += '<button class="act-card32" data-act="molo"><span class="ac-ic32">🔥</span><div><b>ساخت کوکتل مولوتوف</b><span>داردی: ' + faNum(this.molotovs) + ' — در شب، دکمه‌ی شعله در ریل چپ</span></div><em class="ac-price32">۴۵🪙</em></button>';
      box.innerHTML = h;"""
new_card = """      h += '<button class="act-card32" data-act="molo"><span class="ac-ic32">🔥</span><div><b>ساخت کوکتل مولوتوف</b><span>داردی: ' + faNum(this.molotovs) + ' — در شب، دکمه‌ی شعله در ریل چپ</span></div><em class="ac-price32">۴۵🪙</em></button>';
      h += '<button class="act-card32" data-act="listen"><span class="ac-ic32">👂</span><div><b>گوش بسپار</b><span>۴ ثانیه ضربان دشمن‌ها در مه — ۱۴ ثانیه فرصت دوباره</span></div></button>';
      box.innerHTML = h;"""
assert s.count(old_card) == 1, 'act-card32 anchor'
s = s.replace(old_card, new_card)

# هندلر شنود در پرونده‌ی v32
old_h = """          else if (act === 'molo') {
            if (this.craftMolotov()) {
              const sp = b.querySelector('div span');
              if (sp) sp.textContent = 'داردی: ' + faNum(this.molotovs) + ' — در شب، دکمه‌ی شعله در ریل چپ';
            }
          }
        });"""
new_h = """          else if (act === 'molo') {
            if (this.craftMolotov()) {
              const sp = b.querySelector('div span');
              if (sp) sp.textContent = 'داردی: ' + faNum(this.molotovs) + ' — در شب، دکمه‌ی شعله در ریل چپ';
            }
          }
          else if (act === 'listen') {   /* (۳۳) شنود = کارت اکشن، نه دکمه‌ی شناور */
            if (this.listen.cd > 0) setAnnounce('گوش خسته است', 'هر ۱۴ ثانیه یک‌بار — کمی صبر کن', 2);
            else { this.startListen(); this.closePanel(); }
          }
        });"""
assert s.count(old_h) == 1, 'molo handler anchor'
s = s.replace(old_h, new_h)

io.open(P, 'w', encoding='utf-8').write(s)
print(f'  OK  کارت شنود به openArchive نسخه‌ی v32 افزوده شد — {orig} -> {len(s)} bytes')
