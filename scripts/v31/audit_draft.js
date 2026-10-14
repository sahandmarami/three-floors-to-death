#!/usr/bin/env node
/* بازرسی هم‌پوشانی: هیچ دکمه/عنصر تعاملی نباید روی دیگری بیفتد
   در حالت‌های: منو، روز، شب، داک باز، دستفروش باز، توقف */
const AUDIT = `(() => {
  const wrapR = { w: innerWidth, h: innerHeight };
  const els = Array.from(document.querySelectorAll('#wrap button, #wrap .bp-tile, #wrap .wchip28, #wrap .bp-tab, #wrap .bpk-slot, #wrap .bpk-cap, #wrap .pd-row31, #wrap .m23-btn, #wrap .mini-btn, #wrap .m27-btn, #wrap .switch, #wrap input[type=range]'));
  const vis = els.filter(el => {
    if (el.disabled) return false;
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity === 0) return false;
    const r = el.getBoundingClientRect();
    if (r.width < 4 || r.height < 4) return false;
    if (r.right < 0 || r.bottom < 0 || r.left > wrapR.w || r.top > wrapR.h) return false;
    return true;
  }).map(el => {
    const r = el.getBoundingClientRect();
    let id = el.id || (el.className && el.className.toString().split(' ')[0]) || el.tagName;
    return { id, x: r.x, y: r.y, w: r.width, h: r.height };
  });
  const overlaps = [];
  for (let i = 0; i < vis.length; i++) {
    for (let j = i + 1; j < vis.length; j++) {
      const a = vis[i], b = vis[j];
      /* پدر-فرزند مجاز است (دکمه داخل پنل) */
      const ax2 = a.x + a.w, ay2 = a.y + a.h, bx2 = b.x + b.w, by2 = b.y + b.h;
      const ox = Math.min(ax2, bx2) - Math.max(a.x, b.x);
      const oy = Math.min(ay2, by2) - Math.max(a.y, b.y);
      if (ox > 6 && oy > 6) {
        /* هم‌پوشانیِ معنادار */
        overlaps.push(a.id + ' × ' + b.id + ' (' + Math.round(ox) + 'x' + Math.round(oy) + 'px)');
      }
    }
  }
  return JSON.stringify({ state: state.mode, visibleCount: vis.length, overlaps: overlaps.slice(0, 12) });
})()`;
console.log(AUDIT.length);
