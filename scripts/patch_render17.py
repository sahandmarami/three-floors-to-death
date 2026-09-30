#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""وصله‌ی ۱۷٫۰ روی v3_part3.js — فراخوانی رسم ارشان روی برج"""
import io

P = '/home/z/my-project/scripts/v3_part3.js'
src = io.open(P, encoding='utf-8').read()

old = """  drawTrap();
  drawTower();
  drawChapterProps();"""
new = """  drawTrap();
  drawTower();
  if (typeof drawTowerArshan === 'function') drawTowerArshan();   /* (۱۷٫۰) ارشان روی طبقه‌ی دوم */
  drawChapterProps();"""

assert src.count(old) == 1, 'render block not found'
src = src.replace(old, new, 1)
io.open(P, 'w', encoding='utf-8').write(src)
print('OK — drawTowerArshan به render() وصل شد')
