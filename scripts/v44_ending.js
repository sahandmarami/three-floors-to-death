'use strict';
/* ==================================================================
   سه طبقه تا مرگ — ماژول انتخابِ نهایی ۴۴٫۰ (سه پایانِ واقعی)
   ==================================================================
   · بعد از دیالوگِ اتاق کنترل، UI سه‌گزینه‌ای باز می‌شود و زمان متوقف است
   · هر انتخاب → DEC44.endingChoice + فاز اختصاصی با دیالوگ/صحنه/موسیقی
   ================================================================== */
const E44 = {
  el: null,

  openChoice() {
    if (this.el) return;
    E30.phase = 'choice';
    e43Reset();
    const ov = document.createElement('div');
    ov.id = 'e44choice';
    ov.style.cssText = 'position:fixed;inset:0;z-index:2140;display:flex;align-items:center;justify-content:center;font-family:Vazirmatn,Tahoma,sans-serif;direction:rtl;background:rgba(2,4,9,0.35)';
    const CARD = (key, icon, title, desc, col) =>
      '<button data-end="' + key + '" style="width:230px;max-width:28vw;text-align:right;padding:16px;border-radius:14px;cursor:pointer;font-family:inherit;' +
      'background:linear-gradient(180deg,rgba(20,28,44,.96),rgba(10,14,24,.96));border:1.5px solid ' + col + '55;box-shadow:0 14px 44px rgba(0,0,0,.55)">' +
      '<div style="font-size:26px;margin-bottom:6px">' + icon + '</div>' +
      '<div style="font-size:16px;font-weight:800;color:' + col + ';margin-bottom:8px">' + title + '</div>' +
      '<div style="font-size:12.5px;line-height:1.9;color:#cdd8ea">' + desc + '</div>' +
      '<div style="margin-top:10px;font-size:12px;font-weight:700;color:#ffd98a">انتخاب ›</div>' +
      '</button>';
    ov.innerHTML =
      '<div style="max-width:min(94vw,780px);text-align:center">' +
      '<div style="font-size:20px;font-weight:800;color:#ffd98a;margin-bottom:6px">Z-00 — کنسولِ فرستندهٔ مرکزی</div>' +
      '<div style="font-size:13px;color:#9fb2cc;margin-bottom:18px">سیگنال هنوز در هواست. تصمیمِ تو، شکلِ سال‌های بعد را تعیین می‌کند.</div>' +
      '<div style="display:flex;gap:14px;justify-content:center;flex-wrap:wrap">' +
      CARD('off', '⏻', 'خاموشیِ کامل', 'سیگنال برای همیشه قطع می‌شود. گله‌ها «طبیعی» می‌شوند؛ اما پناهگاه‌ها بی‌هماهنگ می‌مانند و رادیوها ساکت.', '#8fb7ff') +
      CARD('redirect', '🧭', 'انحرافِ سیگنال', 'الگو به دشتِ بی‌آدمِ نمک می‌رود. ماه‌ها امنیت — و گله‌ای بزرگ‌تر که روزی برمی‌گردد.', '#ffb03c') +
      CARD('broadcast', '📡', 'پخشِ حقیقت', 'آرشیوِ پروژهٔ Z به همهٔ فرکانس‌ها می‌رود. مردم حقیقت را می‌شنوند... و آدرسِ پناهگاه هم.', '#ff8f8f') +
      '</div></div>';
    document.body.appendChild(ov);
    this.el = ov;
    ov.querySelectorAll('button[data-end]').forEach((b) => {
      b.onmouseenter = () => { b.style.transform = 'translateY(-3px)'; b.style.borderColor = 'rgba(255,220,150,.8)'; };
      b.onmouseleave = () => { b.style.transform = ''; b.style.borderColor = ''; };
      b.onclick = () => {
        const choice = b.getAttribute('data-end');
        try { SFX.click(); } catch (e) {}
        DEC44.endingChoice = choice;
        try { saveGame(); } catch (e) {}
        this.choiceUI(true);
        /* فاز اختصاصی پایان */
        e43Next(choice === 'off' ? 'endOff' : (choice === 'redirect' ? 'endRedirect' : 'endBroadcast'));
      };
    });
    try { MUSIC.duck(999, 0.25); } catch (e) {}
  },

  choiceUI(hide) {
    if (this.el) { this.el.remove(); this.el = null; }
  },
};
window.E44 = E44;
console.log('[v44] ending-choice module ready');
