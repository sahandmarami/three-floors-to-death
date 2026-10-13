#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""v25 مرحله ۲ — تولید مجددِ خطاهای ASR با seed جدید + استراتژی متن
استراتژی‌ها برای شکستن قرعه‌ی زبانی:
  ۱) seed جدید
  ۲) anchor فارسی: جمله با «.» تمام + فاصله + حرف آغازین فارسی کوچک («خب.»)
     که مدل را در حالت فارسی نگه می‌دارد (تکنیک previous context)
  ۳) تنظیمات style بالاتر (بیشترین ابراز → خوانش واقعی نویسه‌ها)
"""
import json, os, subprocess, sys, time

sys.path.insert(0, '/home/z/my-project/scripts')
from dialogues23 import LINES
from gen_voices25 import VOICE, RAW_DIR, gen_raw, SETTINGS, mood_of, KEY
import gen_voices25 as G

ASR_LOG = '/home/z/my-project/scripts/voice25_asr.json'

def main(round_no=1):
    results = json.load(open(ASR_LOG))
    fails = [k for k, v in results.items() if not v['pass']]
    print(f'round {round_no}: {len(fails)} failures to regen')
    lines_map = {k: (w, fa) for (k, w, fa, fg) in LINES}
    n = 0
    for key in fails:
        if key not in lines_map: continue
        who, fa = lines_map[key]
        # متن لنگر: برای round>=2 یک شروع فارسی کوچک اضافه کن
        text = fa
        if round_no >= 2:
            text = 'خب. ' + fa
        # seed جدید
        seed = (hash(key + 'r' + str(round_no)) % 900000) + 101
        # round>=3: style بالاتر
        if round_no >= 3:
            G.SETTINGS = {k2: dict(v, style=min(0.95, v['style'] + 0.25)) for k2, v in G.SETTINGS.items()}
        got = gen_raw(key, who, text, seed)
        if got:
            # نتیجه‌ی قبلی را پاک کن تا ASR دوباره چک کند
            del results[key]
            n += 1
        time.sleep(0.9)
    json.dump(results, open(ASR_LOG, 'w'), indent=1)
    print(f'regened: {n} — حالا asr25.mjs را دوباره اجرا کن')

if __name__ == '__main__':
    rnd = int(sys.argv[1]) if len(sys.argv) > 1 else 1
    main(rnd)
