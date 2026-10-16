#!/usr/bin/env python3
# -*- coding: utf-8 -*-
# insert_v33c.py — بخش ۳: افزودن ماژول v33 (CSS + drawCsArash33 + پرچم‌های تست)
import io

P = '/home/z/my-project/download/three-floors-to-survival.html'
s = io.open(P, encoding='utf-8').read()
orig = len(s)

MODULE = """
<script>
/* ==================================================================
   سه طبقه تا مرگ — v33 — ماژول تکمیلی
   ------------------------------------------------------------------
   · مینی‌گیم: فرمان شیب گوشی حذف شد (ماشین دیگر خودش نمی‌لغزد)
   · مینی‌گیم: دکمه/عمل «رد کردن» در خود مینی‌گیم وجود ندارد
   · کات‌سین فروریختن برج: آرش از بام با پله‌ها پایین می‌آید،
     ماشین از قبل پارک است، زیرنویس‌های دیالوگ‌دار + صدای آرش
   · دکمه‌ی شنود از ریل چپ حذف → کارت «گوش بسپار» در پرونده سرنخ‌ها
   · نام کاشی‌های ساخت‌وساز همیشه دیده می‌شود (بدون hover)
   · منوی اصلی روشن‌تر + زامبی سایه‌ای با نیم‌رخ درست
   ================================================================== */

/* ---------- ۳۳-۱) CSS ---------- */
(function () {
  const st = document.createElement('style');
  st.textContent = `
/* (۳۳) دکمه‌ی شنودِ شناور حذف — گوش بسپار حالا کارتِ پرونده‌ی سرنخ‌هاست */
#listenBtn{display:none!important}
/* (۳۳) نام کاشی‌های ساخت‌وساز */
.bp-tile .bp-name{font-size:calc(10.5px * var(--uiz,1));font-weight:800;color:#e8eeff;line-height:1.15;
  max-width:calc(96px * var(--uiz,1));overflow:hidden;text-overflow:ellipsis;white-space:nowrap;
  padding:0 3px;text-shadow:0 1px 2px rgba(0,0,0,.7);pointer-events:none}
/* (۳۳) آیکون کمی جمع‌تر تا نام + قیمت در کاشی ۱۰۲px جا شود */
#buildPanel .bp-ic{width:calc(46px * var(--uiz,1))!important;height:calc(46px * var(--uiz,1))!important}
`;
  document.head.appendChild(st);
})();

/* ---------- ۳۳-۲) رسم آرش در کات‌سین فروریختن برج ----------
   سیلوئت دوستِ همراه: کلاه‌کپ + ژاکت زیتونی + کوله —
   روی بام: ایستاده/هشدار؛ پله‌ها: خمیده و زیگزاگ؛ دویدن: چرخه‌ی کامل پا */
function drawCsArash33(A) {
  const t = (typeof CS !== 'undefined' && CS) ? CS.t : 0;
  ctx.save();
  ctx.translate(A.x, A.y);
  ctx.scale(-1, 1);                       // رو به چپ (به سمت پله‌ها/ماشین)
  const run = A.st === 'run' || A.st === 'stairs';
  const ph = A.ph;
  const bob = run ? Math.abs(Math.sin(ph)) * 2 : Math.sin(t * 2.2) * 1.2;
  /* سایه روی سطح */
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  ctx.beginPath(); ctx.ellipse(0, 2, 12, 3.2, 0, 0, Math.PI * 2); ctx.fill();
  ctx.translate(0, -bob);
  /* پاها */
  ctx.strokeStyle = '#1f2c44'; ctx.lineWidth = 5.4; ctx.lineCap = 'round';
  ctx.beginPath();
  const l1 = run ? Math.sin(ph) * 8 : 2, l2 = run ? Math.sin(ph + Math.PI) * 8 : -2;
  ctx.moveTo(-2, -14); ctx.lineTo(-3 + l1, -1);
  ctx.moveTo(3, -14); ctx.lineTo(4 + l2, -1);
  ctx.stroke();
  /* بدن: ژاکت زیتونی + کوله‌ی پشتی */
  ctx.fillStyle = '#5f6f3a';
  rr(-7.5, -30, 15, 17, 5); ctx.fill();
  ctx.fillStyle = '#3c2f22';
  rr(-11, -28, 5, 11, 3); ctx.fill();
  /* بازوها */
  ctx.strokeStyle = '#5f6f3a'; ctx.lineWidth = 4.2;
  ctx.beginPath();
  const a1 = run ? Math.sin(ph + Math.PI) * 5 : 1;
  const a2 = run ? Math.sin(ph) * 5 : -1;
  ctx.moveTo(-5, -27); ctx.lineTo(-7 + a1, -16);
  ctx.moveTo(5, -27); ctx.lineTo(7 + a2, -16);
  ctx.stroke();
  /* سر + کلاه‌کپ با لبه‌ی جلو */
  ctx.fillStyle = '#c9a07a';
  circle(2.5, -35, 5.2);
  ctx.fillStyle = '#2c3a26';
  ctx.beginPath(); ctx.arc(2.5, -36.2, 5.5, Math.PI * 0.95, Math.PI * 2.05); ctx.fill();
  rr(-3.4, -41.2, 11, 3, 1.5); ctx.fill();
  ctx.restore();
}

/* ---------- ۳۳-۳) پرچم‌های تست/بوت ---------- */
window.__V33 = {
  tiltOff: true,          /* فرمان شیب گوشی حذف شد */
  skipGuard: true,        /* مینی‌گیم قابل رد کردن نیست */
  arashStairs: true,      /* آرش از پله‌ها می‌آید + ماشین پارک */
  listenCard: true,       /* شنود = کارت اکشن پرونده */
  bpNames: true,          /* نام کاشی‌ها همیشه مرئی */
  menuBright: true,       /* پالت منوی روشن‌تر */
  zombieProfile: true,    /* نیم‌رخ زامبی منو */
};
try { if (typeof MYST !== 'undefined' && MYST && MYST.ensureBtn) { MYST.ensureBtn(); } } catch (e) {}
</script>
"""

anchor = '</body>\n</html>'
assert s.count(anchor) == 1, 'anchor انتهای HTML پیدا نشد'
s = s.replace(anchor, MODULE + '\n' + anchor)
io.open(P, 'w', encoding='utf-8').write(s)
print(f'  OK  ماژول v33 افزوده شد — size: {orig} -> {len(s)} bytes')
