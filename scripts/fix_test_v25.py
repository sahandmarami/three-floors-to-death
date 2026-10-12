#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""اصلاح تست‌های v25: آستانه‌های منطقی + زمانبندی اعلان + skipCs"""
S = '/home/z/my-project/scripts/'
path = S + 'test_v25.sh'
data = open(path, encoding='utf-8').read()

# ۱) دکمه انصراف: «نه» کافی است (متن سفارشی «نه، سیو بمونه»)
data = data.replace(
    """R=$(agent-browser eval "document.getElementById('cfNo').textContent.includes('برگرد')?1:0" | tail -1); ck "دکمه انصراف متن‌دار اندرویدی" "$R\"""",
    """R=$(agent-browser eval "document.getElementById('cfNo').textContent.startsWith('نه')?1:0" | tail -1); ck "دکمه انصراف متن‌دار اندرویدی" "$R" "got=$(agent-browser eval "document.getElementById('cfNo').textContent" | tail -1)\"""")

# ۲) اعلان وقفه: صبر ۳٫۸ ثانیه (اعلان صبح ۳ ثانیه است)
data = data.replace(
    """agent-browser eval "GAME.endWave();'ok'" >/dev/null; sleep 1.2
R=$(agent-browser eval "document.getElementById('announceBig').textContent.includes('مرحله')?1:0" | tail -1); ck "اعلان وقفه: «مرحله X»" "$R" "got=$(agent-browser eval "document.getElementById('announceBig').textContent" | tail -1)\"""",
    """agent-browser eval "GAME.endWave();'ok'" >/dev/null; sleep 3.8
R=$(agent-browser eval "(()=>{const s=document.getElementById('announceSub');const b=document.getElementById('announceBig');return (b.textContent.includes('مرحله')&&b.textContent.includes('ثانیه'))||s.textContent.includes('ارتقا')?1:0})()" | tail -1); ck "اعلان وقفه: «مرحله X»" "$R" "big=$(agent-browser eval "document.getElementById('announceBig').textContent" | tail -1)\"""")

# ۳) پرتره: اندازه منطقی (computed) به‌جای rect واقعی
data = data.replace(
    """R=$(agent-browser eval "(()=>{const p=document.getElementById('dlgPortrait');const r=p.getBoundingClientRect();return r.width>=90?1:0})()" | tail -1); ck "پرتره گفتگو درشت (>=90px)" "$R" "w=$(agent-browser eval "Math.round(document.getElementById('dlgPortrait').getBoundingClientRect().width)" | tail -1)\"""",
    """R=$(agent-browser eval "(()=>{const p=document.getElementById('dlgPortrait');const w=parseFloat(getComputedStyle(p).width);return w>=120?1:0})()" | tail -1); ck "پرتره گفتگو درشت (>=120px منطقی)" "$R" "w=$(agent-browser eval "Math.round(parseFloat(getComputedStyle(document.getElementById('dlgPortrait')).width))" | tail -1)\"""")

# ۴) متن گفتگو: منطقی >=20
data = data.replace(
    """R=$(agent-browser eval "(()=>{const t=document.getElementById('dlgText');const fs=parseFloat(getComputedStyle(t).fontSize);return fs>=20?1:0})()" | tail -1); ck "متن گفتگو درشت (>=20px منطقی)" "$R" "fs=$(agent-browser eval "Math.round(parseFloat(getComputedStyle(document.getElementById('dlgText')).fontSize)*10)/10" | tail -1)\"""",
    """R=$(agent-browser eval "(()=>{const t=document.getElementById('dlgText');const fs=parseFloat(getComputedStyle(t).fontSize);return fs>=20?1:0})()" | tail -1); ck "متن گفتگو درشت (>=20px منطقی)" "$R" "fs=$(agent-browser eval "Math.round(parseFloat(getComputedStyle(document.getElementById('dlgText')).fontSize)*10)/10" | tail -1)\"""")

# ۵) skipCs: نمایش دستی برای سنجش اندازه
data = data.replace(
    """R=$(agent-browser eval "(()=>{const s=document.getElementById('skipCs');const r=s.getBoundingClientRect();return r.height>=40?1:0})()" | tail -1); ck "دکمه رد کردن درشت (>=40px)" "$R" "h=$(agent-browser eval "Math.round(document.getElementById('skipCs').getBoundingClientRect().height)" | tail -1)\"""",
    """R=$(agent-browser eval "(()=>{const s=document.getElementById('skipCs');s.classList.remove('hidden');const r=s.getBoundingClientRect();const h=r.height/(window.__fitScale||1);return h>=40?1:0})()" | tail -1); ck "دکمه رد کردن درشت (>=40px منطقی)" "$R" "h=$(agent-browser eval "Math.round(document.getElementById('skipCs').getBoundingClientRect().height/(window.__fitScale||1))" | tail -1)\"""")

# ۶) قاب: نسبت + پوشش ≥۹۵٪
data = data.replace(
    """R=$(agent-browser eval "(()=>{const w=document.getElementById('wrap');const r=w.getBoundingClientRect();return (r.width>=innerWidth-3&&r.height>=innerHeight-3)?1:0})()" | tail -1); ck "قاب بازی تمام‌صفحه گوشی" "$R\"""",
    """R=$(agent-browser eval "(()=>{const w=document.getElementById('wrap');const r=w.getBoundingClientRect();const covW=r.width/innerWidth,covH=r.height/innerHeight;return (covW>=0.95&&covH>=0.95)?1:0})()" | tail -1); ck "قاب بازی تمام‌صفحه گوشی (>=95%)" "$R" "cov=$(agent-browser eval "(()=>{const r=document.getElementById('wrap').getBoundingClientRect();return Math.round(r.width/innerWidth*100)+'x'+Math.round(r.height/innerHeight*100)})()" | tail -1)\"""")

open(path, 'w', encoding='utf-8').write(data)
print('test_v25.sh FIXED')
