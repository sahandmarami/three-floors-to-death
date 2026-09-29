#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""وصله‌ی test_v18.sh — مسیر مطلق، ارقام فارسی، escape و arshanOnRoof"""
import re

P = '/home/z/my-project/scripts/test_v18.sh'
src = open(P, encoding='utf-8').read()

# ۱) مسیر مطلق اسکرین‌شات‌ها
src = src.replace('S=scripts/shots18', 'S=/home/z/my-project/scripts/shots18')

# ۲) ارقام فارسی در چک برچسب موج
src = src.replace('"فصل 1 • موج 1/4"', '"فصل ۱ • موج ۱/۴"')

# ۳) استفاده از arshanOnRoof به‌جای vis خام
src = src.replace("chk \"منو: ارشان روی بام دیده می‌شود\" \"$(ev 'GAME.v17.ARSHAN.vis > 0.9')\" \"true\"",
                  "chk \"منو: ارشان روی بام دیده می‌شود\" \"$(ev 'GAME.v17.arshanOnRoof()')\" \"true\"")
src = src.replace("chk \"افتتاحیه: ارشان پشت صحنه است\" \"$(ev 'GAME.v17.ARSHAN.vis < 0.3')\" \"false\"",
                  "chk \"افتتاحیه: ارشان پشت صحنه است\" \"$(ev 'GAME.v17.arshanOnRoof()')\" \"false\"")
src = src.replace("chk \"شب: ارشان روی بام است\" \"$(ev 'GAME.v17.ARSHAN.vis > 0.9')\" \"true\"",
                  "chk \"شب: ارشان روی بام است\" \"$(ev 'GAME.v17.arshanOnRoof()')\" \"true\"")
src = src.replace("chk \"تعمیر → ارشان برگشت روی بام\" \"$(ev 'GAME.v17.ARSHAN.vis > 0.9')\" \"true\"",
                  "chk \"تعمیر → ارشان برگشت روی بام\" \"$(ev 'GAME.v17.arshanOnRoof()')\" \"true\"")
src = src.replace("chk \"روز: ارشان روی بام است\" \"$(ev 'GAME.v17.ARSHAN.vis > 0.9')\" \"true\"",
                  "chk \"روز: ارشان روی بام است\" \"$(ev 'GAME.v17.arshanOnRoof()')\" \"true\"")
src = src.replace("chk \"انتقال: ارشان کنار بازیکن است (نه بام)\" \"$(ev 'GAME.v17.ARSHAN.vis < 0.3')\" \"false\"",
                  "chk \"انتقال: ارشان کنار بازیکن است (نه بام)\" \"$(ev 'GAME.v17.arshanOnRoof()')\" \"false\"")

# ۴) escape های خراب: \"/\" → '/'
src = src.replace("$(ev 'GAME.state.mode + \\\"/\\\" + (GAME.v10.TR ? GAME.v10.TR.ch : 0)')",
                  "$(ev \"GAME.state.mode + '/' + (GAME.v10.TR ? GAME.v10.TR.ch : 0)\")")
src = src.replace("$(ev 'TR.phase + \\\"/\\\" + (MG.obs.length > 0 && MG.obs.every(o => o.dp >= 0.6 && o.dp <= 1))')",
                  "$(ev \"TR.phase + '/' + (MG.obs.length > 0 && MG.obs.every(o => o.dp >= 0.6 && o.dp <= 1))\")")
src = src.replace("$(ev 'GAME.state.mode + \\\"/\\\" + (GAME.state.wave + 1)')",
                  "$(ev \"GAME.state.mode + '/' + (GAME.state.wave + 1)\")")

open(P, 'w', encoding='utf-8').write(src)

# گزارش
leftover = re.findall(r'\\\"', src)
print('patched; leftover escaped-quotes:', len(leftover))
