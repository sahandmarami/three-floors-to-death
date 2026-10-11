#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""v21.4 patch A — v3_part2.js: scenery block -> buildScenery() + refitWorld()
(W responsive: viewport aspect settles AFTER load in WebViews; menu-time refit)."""
import re

P = '/home/z/my-project/scripts/v3_part2.js'
src = open(P, encoding='utf-8').read()

# --- 1) locate scenery block: from the STARS comment to the audio engine comment
start = src.index('/* عناصر ثابت صحنه: ستاره‌ها، تپه‌ها، سنگ‌ریزه‌ها، ابرها و افق شهر یک بار ساخته می‌شوند */')
end = src.index('/* ---------------------- ۳) موتور صدا (Web Audio) ---------------------- */')
block = src[start:end]

# --- 2) collect the const names declared in the block (skip SKYLINE_WINS special-cased)
names = re.findall(r'^const ([A-Z_0-9]+)\s*=', block, re.M)
print('scenery consts:', names)

# --- 3) transform: const X = ...  ->  X = ...
body = re.sub(r'^const ([A-Z_0-9]+)(\s*=)', r'\1\2', block, flags=re.M)
# special: SKYLINE = []; SKYLINE_WINS = []; { ... }  — the IIFE-ish braces stay as-is (plain block) — fine inside function

# --- 4) build the new section
decl = 'let ' + ', '.join(names) + ';'
header = (
    decl + '''   /* (۲۱٫۴) همه با buildScenery() ساخته می‌شوند تا بعد از جاافتادنِ نسبتِ
   صفحه (منو) بازسازی شوند — بذرِ ثابت ۱۳۷۹ یعنی منظره‌ی همیشگی تغییر نمی‌کند */
function buildScenery() {
  _seed = 1379;'''
)
footer = '''}

/* ---------------------- (۲۱٫۴) بازسازی دنیا برای نسبتِ تازه‌ی صفحه ----------------------
   فقط در منو (mode==='start') صدا زده می‌شود — وسط بازی لترباکسِ امن ترجیح داده
   می‌شود. بوم/کش‌ها با setDPR تازه می‌شوند و زامبی‌های منو دوباره چیده می‌شوند. */
function refitWorld(aw, ah) {
  const want = Math.max(960, Math.min(1440, Math.round(560 * (aw / Math.max(1, ah)))));
  if (want === W) return false;
  W = want;
  TOWER.x = W / 2;
  buildScenery();
  try { LAMPS.length = 2; LAMPS[0] = Math.round(W * 0.245); LAMPS[1] = Math.round(W * 0.755); } catch (e) {}
  setDPR(DPR);                       /* بومِ تازه + بی‌اعتبارسازی کش‌های پخته */
  try { if (typeof initMenuZ === 'function' && state.mode === 'start') initMenuZ(); } catch (e) {}
  return true;
}

'''
new_section = header + '\n' + body.rstrip() + '\n' + footer
src = src[:start] + new_section + src[end:]

open(P, 'w', encoding='utf-8').write(src)
print('OK — scenery wrapped,', len(names), 'arrays -> buildScenery()')
