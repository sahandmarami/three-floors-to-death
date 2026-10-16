
/* ==================================================================
   «سه طبقه تا مرگ» v32 — بازخورد کاربر (جلسه‌ی ۳۲، هشت درخواست):
   ۱) دکمه‌ی «سرنخ» بازطراحی (پرونده‌ای + نشان شمارنده) — «باهال نیست»
   ۲) انیمیشن پنل سرنخ: قبلاً keyframe ها translate(-50%,-50%)
      مرکزچین را له می‌کردند → پنل اول «پایین» می‌افتاد بعد می‌پرید وسط
      (دقیقاً گزارش کاربر) → keyframe تازه با حفظ مرکزچینی + scale
   ۳) نوار سلاح پایین-وسط حذف کامل — خرید/تعویض سلاح فقط از
      تب «سلاح‌ها»ی ساخت‌وساز (درخواست صریح کاربر)
   ۴) لوگوی ساخت‌وساز (جعبه) و کوله‌پشتی درشت‌تر — «خیلی ریزه»
   ۵) آیکون چراغ‌قوه SVG تمیز (به‌جای PNG بدبرش)
   ۶) خرید در شروع بازی: کاشی/تب/سربرگ touch-action + کاشی‌های
      درشت‌تر + داک همه‌عرض در لمس (نه ستون ۲۱۰px قدیمی) +
      بازخورد «پول کافی نیست» روی هر رد شدن خرید
   ۷) «ذخیره شد» سریع‌تر محو (۱٫۳۵s به‌جای ۳٫۴s)
   ۸) منوی سرنخ‌ها = پرونده‌ی مستندات: کارت شواهد شماره‌دار +
      کارت معماهای فعال + سرصفحه‌های خط‌کش‌شده (نه «— بقا —» معلق)
   ================================================================== */

/* ---------- ۳۲-۰) آیکون‌های SVG این نسخه ---------- */
const SVG32 = {
  /* پرونده + ذره‌بین — «پرونده‌ی سرنخ» */
  clue: '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<path d="M3.5 6.2c0-.9.7-1.7 1.6-1.7h3.3c.5 0 1 .24 1.3.64l1 1.36h6.7c.9 0 1.6.7 1.6 1.6v2.1"/>' +
    '<path d="M3.5 6.2v11.3c0 .9.7 1.6 1.6 1.6h4.2"/>' +
    '<circle cx="14.6" cy="14.9" r="3.7"/>' +
    '<path d="M17.4 17.7l3 3"/>' +
    '</svg>',
  /* چراغ‌قوه عمودی تمیز — بدنه + لنز + پرتوها */
  flash: '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<path d="M8.6 4.6h6.8v1.9c0 1-.4 1.9-1.1 2.6l-.7.7V19a2 2 0 0 1-2 2h-.8a2 2 0 0 1-2-2v-9.2l-.7-.7c-.7-.7-1.1-1.6-1.1-2.6V4.6z"/>' +
    '<path d="M8.6 6.9h6.8" opacity=".55"/>' +
    '<path d="M8.2 3.1L6.9 1.7M12 2.4V.7M15.8 3.1l1.3-1.4" opacity=".85"/>' +
    '<path d="M7.3 5.8L5.6 5M16.7 5.8l1.7-.8" opacity=".55"/>' +
    '</svg>',
};

/* ---------- ۳۲-۱) CSS ---------- */
(function css32() {
  const st = document.createElement('style');
  st.textContent = `
/* ==== (۳۲) حذف کامل نوار سلاح — خرید/تعویض فقط از ساخت‌وساز ==== */
#wpnChips28 { display: none !important; }

/* ==== (۳۲) داک ساخت‌وساز — درشت‌تر، لمس‌پایدار، همه‌عرض در لمس ==== */
#buildPanel .bp-head{
  min-height:calc(46px * var(--uiz,1))!important;
  font-size:calc(16px * var(--uiz,1))!important;
  padding:calc(6px * var(--uiz,1)) calc(18px * var(--uiz,1))!important;
  touch-action:manipulation;
}
#bpHead img.ic30{
  width:calc(34px * var(--uiz,1))!important;
  height:calc(34px * var(--uiz,1))!important;
  border-radius:calc(9px * var(--uiz,1));
}
#buildPanel .bp-head .bp-chev{font-size:calc(15px * var(--uiz,1))!important;margin-inline-start:calc(8px * var(--uiz,1))!important}
#buildPanel .bp-tab{
  min-height:calc(40px * var(--uiz2,1))!important;
  font-size:calc(12.5px * var(--uiz2,1))!important;
  padding:calc(5px * var(--uiz,1)) calc(6px * var(--uiz,1))!important;
  touch-action:manipulation;
}
/* کاشی‌ها: ردیفِ شکستنی (بدون اسکرول افقی — لمس مطمئن) */
#bpList{
  flex-wrap:wrap!important;
  overflow-x:visible!important;
  overflow-y:auto!important;
  max-height:calc(252px * var(--uiz2,1))!important;
  touch-action:manipulation;
}
#buildPanel .bp-tile{
  width:calc(94px * var(--uiz2,1))!important;
  height:calc(118px * var(--uiz2,1))!important;
  touch-action:manipulation;
}
#buildPanel .bp-ic,
#buildPanel .bp-tile .bp-ic29 img,
#buildPanel .bp-tile img.bp-ic30{
  width:calc(56px * var(--uiz2,1))!important;
  height:calc(56px * var(--uiz2,1))!important;
}
#buildPanel .bp-tile .bp-price{font-size:calc(11.5px * var(--uiz2,1))!important}
/* داک در لمس: عرضِ محتوا (تا ۷۲٪) — نه ستون ۲۱۰px قدیمی که
   فقط ۲٫۵ کاشی را جا می‌داد و خرید را سخت می‌کرد */
#wrap.touch #buildPanel{
  width:auto!important;
  max-width:min(700px,72%)!important;
}
#wrap.touch .bp-tile{height:calc(118px * var(--uiz2,1))!important}
#wrap.touch .bp-ic{width:calc(56px * var(--uiz2,1))!important;height:calc(56px * var(--uiz2,1))!important}
/* سقف ارتفاع کل داک — هرگز کل صفحه را نپوشاند (زمین/زامبی دیده بماند) */
#buildPanel{max-height:calc(100% - 150px * var(--uiz2,1))!important}
#wrap.touch #bpList{flex:0 0 auto!important}

/* ==== (۳۲) کوله‌پشتی — لوگوی درشت‌تر ==== */
#backpackBar .bpk-cap .ic30{
  width:calc(38px * var(--uiz,1))!important;
  height:calc(38px * var(--uiz,1))!important;
  border-radius:calc(11px * var(--uiz,1));
  margin-inline-end:calc(6px * var(--uiz,1))!important;
}
#backpackBar .bpk-cap{gap:calc(8px * var(--uiz,1))!important}

/* ==== (۳۲) چراغ‌قوه — آیکون SVG تمیز در قاب روشن‌تر ==== */
#ctlFlash .ic svg{
  width:calc(40px * var(--uiz,1))!important;
  height:calc(40px * var(--uiz,1))!important;
  filter:drop-shadow(0 0 6px rgba(255,224,130,.35));
}

/* ==== (۳۲) دکمه‌ی «سرنخ» — پرونده‌ی داغ (بازطراحی کامل) ==== */
#mystBtn{
  top:calc(74px * var(--uiz,1))!important;left:calc(12px * var(--uiz,1))!important;
  display:none;align-items:center;gap:calc(8px * var(--uiz,1));
  font-family:inherit;font-size:calc(14.5px * var(--uiz,1));font-weight:900;
  color:#ffe9b3;cursor:pointer;position:absolute;z-index:7;
  background:linear-gradient(180deg,#22315c,#131f40)!important;
  border:1.5px solid #e8b54a!important;
  border-radius:calc(15px * var(--uiz,1))!important;
  padding:calc(9px * var(--uiz,1)) calc(14px * var(--uiz,1))!important;
  box-shadow:0 7px 20px rgba(0,0,0,.55),inset 0 1.5px 0 rgba(255,255,255,.1);
  -webkit-tap-highlight-color:transparent;touch-action:manipulation;
  animation:mystBtnIn32 .3s cubic-bezier(.2,1.3,.4,1)!important;
}
#mystBtn .ic{display:flex;color:#ffd873;font-size:calc(22px * var(--uiz,1));line-height:1}
#mystBtn .ic svg{width:calc(23px * var(--uiz,1));height:calc(23px * var(--uiz,1))}
#mystBtn:active{transform:scale(.94)}
#mystBtn .cb-badge32{
  display:none;align-items:center;justify-content:center;
  min-width:calc(21px * var(--uiz,1));height:calc(21px * var(--uiz,1));
  border-radius:99px;font-style:normal;font-weight:900;
  font-size:calc(11.5px * var(--uiz,1));color:#fff;
  background:linear-gradient(180deg,#e0523e,#a92c1c);
  border:1px solid rgba(255,255,255,.35);
  padding:0 calc(5px * var(--uiz,1));
  box-shadow:0 2px 7px rgba(200,50,30,.55);
}
#mystBtn.glow{
  animation:mystBtnGlow32 1.5s ease-in-out infinite!important;
}
@keyframes mystBtnGlow32{
  0%,100%{box-shadow:0 7px 20px rgba(0,0,0,.55),0 0 0 0 rgba(232,181,74,.55),inset 0 1.5px 0 rgba(255,255,255,.1)}
  55%{box-shadow:0 7px 20px rgba(0,0,0,.55),0 0 0 10px rgba(232,181,74,0),inset 0 1.5px 0 rgba(255,255,255,.1)}
}
@keyframes mystBtnIn32{from{opacity:0;transform:translateX(-8px)}to{opacity:1;transform:none}}

/* ==== (۳۲) پنل سرنخ — انیمیشن مرکزچینِ درست (رفع «اول پایین بعد وسط») ==== */
.myst-panel{
  animation:mystPanelIn32 .3s cubic-bezier(.2,1.15,.4,1)!important;
  border-radius:calc(20px * var(--uiz,1))!important;
}
@keyframes mystPanelIn32{
  from{opacity:0;transform:translate(-50%,-50%) scale(.9)}
  60%{opacity:1;transform:translate(-50%,-50%) scale(1.02)}
  to{opacity:1;transform:translate(-50%,-50%) scale(1)}
}

/* ==== (۳۲) منوی سرنخ‌ها — پرونده‌ی مستندات (بازطراحی کامل) ==== */
.myst-panel .myst-head{
  padding:calc(12px * var(--uiz,1)) calc(14px * var(--uiz,1))!important;
  background:linear-gradient(180deg,rgba(52,42,18,.6),rgba(24,20,10,.35));
  border-bottom:1px solid rgba(232,181,74,.4)!important;
  gap:calc(8px * var(--uiz,1));
}
.mh-t32{display:flex;align-items:center;gap:calc(9px * var(--uiz,1));flex:1;min-width:0}
.mh-t32 .mh-ic32{
  width:calc(40px * var(--uiz,1));height:calc(40px * var(--uiz,1));flex:none;
  display:flex;align-items:center;justify-content:center;color:#ffd873;
  background:radial-gradient(circle at 32% 28%,rgba(232,181,74,.28),rgba(10,14,28,.5));
  border:1.5px solid rgba(232,181,74,.55);border-radius:calc(12px * var(--uiz,1));
}
.mh-t32 .mh-ic32 svg{width:calc(22px * var(--uiz,1));height:calc(22px * var(--uiz,1))}
.mh-tx32{display:flex;flex-direction:column;min-width:0}
.mh-tx32 b{font-size:calc(16.5px * var(--uiz,1));font-weight:900;color:#ffe9b3;line-height:1.4}
.mh-tx32 span{font-size:calc(10.5px * var(--uiz,1));color:#9aa8cc;font-weight:700;margin-top:1px}
.myst-panel .myst-x{
  width:calc(44px * var(--uiz,1))!important;height:calc(44px * var(--uiz,1))!important;
  border-radius:calc(13px * var(--uiz,1))!important;flex:none;
}
/* سرصفحه‌های بخش — خط‌کشی‌شده (نه متن معلق) */
.sec-hdr32{
  display:flex;align-items:center;gap:calc(10px * var(--uiz,1));
  color:#8fa3c8;font-size:calc(11.5px * var(--uiz,1));font-weight:900;
  letter-spacing:1.5px;margin:calc(4px * var(--uiz,1)) 0 0;
}
.sec-hdr32 i{flex:1;height:1px;background:linear-gradient(90deg,transparent,rgba(120,146,200,.45),transparent)}
.sec-hdr32.gold{color:#ffd873}
.sec-hdr32.gold i{background:linear-gradient(90deg,transparent,rgba(232,181,74,.5),transparent)}
/* کارت شواهد آرشیوشده */
.ev-card32{
  display:flex;align-items:center;gap:calc(10px * var(--uiz,1));
  padding:calc(10px * var(--uiz,1)) calc(12px * var(--uiz,1));
  border-radius:calc(13px * var(--uiz,1));
  background:linear-gradient(180deg,rgba(255,255,255,.055),rgba(255,255,255,.02));
  border:1px solid #2e3d66;border-inline-start:calc(3px * var(--uiz,1)) solid #ffd873;
}
.ev-card32 .ev-num32{
  font-style:normal;flex:none;
  font-size:calc(13px * var(--uiz,1));font-weight:900;color:#ffd873;
  background:rgba(232,181,74,.12);border:1px solid rgba(232,181,74,.4);
  border-radius:calc(8px * var(--uiz,1));
  padding:calc(3px * var(--uiz,1)) calc(6px * var(--uiz,1));
}
.ev-card32 .ev-ic32{
  width:calc(40px * var(--uiz,1));height:calc(40px * var(--uiz,1));flex:none;
  display:flex;align-items:center;justify-content:center;font-size:calc(21px * var(--uiz,1));
  background:rgba(10,14,28,.7);border-radius:calc(11px * var(--uiz,1));
}
.ev-card32 b{font-size:calc(14px * var(--uiz,1));font-weight:900;color:#eee6ff;line-height:1.5}
.ev-card32 div span{font-size:calc(11.5px * var(--uiz,1));color:#aeb9d8;line-height:1.7;display:block}
/* کارت معمای فعال — کهربایی با chevron */
.case-card32{
  display:flex;align-items:center;gap:calc(11px * var(--uiz,1));
  width:100%;text-align:start;cursor:pointer;font-family:inherit;
  padding:calc(11px * var(--uiz,1)) calc(13px * var(--uiz,1));
  border-radius:calc(14px * var(--uiz,1));
  background:linear-gradient(180deg,rgba(74,55,18,.5),rgba(42,30,10,.5))!important;
  border:1.5px solid #c9954a!important;
  box-shadow:0 4px 16px rgba(0,0,0,.4),inset 0 1px 0 rgba(255,255,255,.07);
  -webkit-tap-highlight-color:transparent;touch-action:manipulation;
}
.case-card32:active{transform:scale(.97)}
.case-card32 .cc-ic32{
  width:calc(44px * var(--uiz,1));height:calc(44px * var(--uiz,1));flex:none;
  display:flex;align-items:center;justify-content:center;font-size:calc(23px * var(--uiz,1));
  background:radial-gradient(circle at 35% 30%,rgba(255,216,115,.22),rgba(20,14,4,.5));
  border:1.5px solid rgba(232,181,74,.5);border-radius:calc(13px * var(--uiz,1));
}
.case-card32 > div{flex:1;min-width:0}
.case-card32 > div b{font-size:calc(14.5px * var(--uiz,1));font-weight:900;color:#ffe9b3;line-height:1.5}
.case-card32 > div span{font-size:calc(11.5px * var(--uiz,1));color:#c9b896;font-weight:700;line-height:1.6;display:block}
.case-card32 .cc-go32{
  font-style:normal;flex:none;color:#ffd873;font-size:calc(22px * var(--uiz,1));
  font-weight:900;line-height:1;transform:scaleX(-1);
}
/* کارت اکشن بقا */
.act-card32{
  display:flex;align-items:center;gap:calc(10px * var(--uiz,1));
  width:100%;text-align:start;cursor:pointer;font-family:inherit;
  padding:calc(10px * var(--uiz,1)) calc(12px * var(--uiz,1));
  border-radius:calc(13px * var(--uiz,1));
  background:rgba(255,255,255,.045)!important;
  border:1px solid #2e3d66!important;
  -webkit-tap-highlight-color:transparent;touch-action:manipulation;
}
.act-card32:active{transform:scale(.97)}
.act-card32 .ac-ic32{
  width:calc(38px * var(--uiz,1));height:calc(38px * var(--uiz,1));flex:none;
  display:flex;align-items:center;justify-content:center;font-size:calc(19px * var(--uiz,1));
  background:rgba(10,14,28,.7);border-radius:calc(11px * var(--uiz,1));
}
.act-card32 > div{flex:1;min-width:0}
.act-card32 > div b{font-size:calc(13.5px * var(--uiz,1));font-weight:900;color:#dbe5fa;line-height:1.5}
.act-card32 > div span{font-size:calc(11px * var(--uiz,1));color:#9aa8cc;font-weight:700;line-height:1.6;display:block}
.act-card32 .ac-price32{
  font-style:normal;flex:none;font-size:calc(12px * var(--uiz,1));
  font-weight:900;color:#ffd873;
}
/* حالت خالی — کارت خوش‌آمدپذیر */
.ev-empty32{
  display:flex;flex-direction:column;align-items:center;gap:calc(6px * var(--uiz,1));
  padding:calc(20px * var(--uiz,1)) calc(14px * var(--uiz,1));
  border-radius:calc(14px * var(--uiz,1));
  border:1.5px dashed rgba(120,146,200,.4);
  color:#8fa3c8;text-align:center;
}
.ev-empty32 svg{width:calc(34px * var(--uiz,1));height:calc(34px * var(--uiz,1));opacity:.55}
.ev-empty32 b{font-size:calc(14px * var(--uiz,1));color:#c3cdea}
.ev-empty32 span{font-size:calc(11.5px * var(--uiz,1));line-height:1.8}
/* بدنه‌ی پنل: فاصله‌ی بهتر */
.myst-panel .myst-body{gap:calc(9px * var(--uiz,1))!important;padding:calc(12px * var(--uiz,1)) calc(14px * var(--uiz,1)) calc(15px * var(--uiz,1))!important}
`;
  document.head.appendChild(st);
})();

/* ---------- ۳۲-۲) دکمه‌ی «سرنخ» تازه + نشان شمارنده ---------- */
(function clueBtn32() {
  try {
    if (typeof MYST === 'undefined' || !MYST || MYST.ensureBtn.__32) return;
    MYST._badge32 = function () {
      const em = document.getElementById('clueBadge32');
      if (!em) return;
      const n = this.clues.length;
      if (n > 0) { em.textContent = faNum(n); em.style.display = 'flex'; }
      else { em.style.display = 'none'; }
    };
    MYST.ensureBtn = function () {
      if (this._btn && document.body.contains(this._btn)) { this._badge32(); return; }
      const b = document.createElement('button');
      b.id = 'mystBtn';
      b.innerHTML = '<i class="ic">' + SVG32.clue + '</i><span>سرنخ‌ها</span>' +
        '<em id="clueBadge32" class="cb-badge32"></em>';
      b.addEventListener('click', () => { SFX.click(); this.openArchive(); });
      $('wrap').appendChild(b);
      this._btn = b;
      this._badge32();
    };
    MYST.ensureBtn.__32 = true;
    /* شمارنده بعد از هر سرنخِ تازه به‌روز شود */
    const _ac = MYST.addClue.bind(MYST);
    MYST.addClue = function (icon, name, sub) {
      const r = _ac(icon, name, sub);
      try { this._badge32(); } catch (e) {}
      return r;
    };
    MYST.addClue.__32 = true;
  } catch (e) {}
})();

/* ---------- ۳۲-۳) منوی سرنخ‌ها — پرونده‌ی مستندات (بازطراحی کامل) ---------- */
(function cluePanel32() {
  try {
    if (typeof MYST === 'undefined' || !MYST || MYST.openArchive.__32) return;
    MYST.openArchive = function () {
      this.closePanel();
      const av = this.avail();
      const wrap = this.panelShell('');
      wrap.classList.add('v32');
      /* سربرگ پرونده‌ای */
      const head = wrap.querySelector('.myst-head');
      head.innerHTML =
        '<div class="mh-t32"><span class="mh-ic32">' + SVG32.clue + '</span>' +
        '<div class="mh-tx32"><b>پرونده‌ی سرنخ‌ها</b><span>ردپای داستان، در گفتگوها پنهان است</span></div></div>' +
        '<button class="myst-x">✕</button>';
      head.querySelector('.myst-x').addEventListener('click', () => { SFX.click(); this.closePanel(); });
      const box = wrap.querySelector('.myst-body');
      let h = '';
      /* حالت خالی */
      if (this.clues.length === 0 && av.length === 0) {
        h += '<div class="ev-empty32">' + SVG32.clue +
          '<b>پرونده هنوز خالی است</b><span>جلوتر برو — سرنخ‌ها خودشان پیدا می‌شوند</span></div>';
      }
      /* شواهد آرشیوشده */
      if (this.clues.length > 0) {
        h += '<div class="sec-hdr32 gold"><i></i><span>شواهد آرشیوشده</span><i></i></div>';
        this.clues.forEach((c, i) => {
          h += '<div class="ev-card32"><em class="ev-num32">' + faNum(String(i + 1).padStart(2, '0')) + '</em>' +
            '<span class="ev-ic32">' + c.icon + '</span>' +
            '<div><b>' + c.name + '</b><span>' + c.sub + '</span></div></div>';
        });
      }
      /* معماهای فعال */
      if (av.length > 0) {
        h += '<div class="sec-hdr32 gold"><i></i><span>معماهای فعال</span><i></i></div>';
        for (const a of av) {
          if (a === 'radio') h += '<button class="case-card32" data-act="radio"><span class="cc-ic32">📻</span><div><b>کوک کردن بی‌سیم</b><span>فرکانس ایستگاه شمال را پیدا کن</span></div><i class="cc-go32">›</i></button>';
          if (a === 'code') h += '<button class="case-card32" data-act="code"><span class="cc-ic32">🔐</span><div><b>قفل ایستگاه</b><span>کد ۴رقمی از سرنخ‌ها</span></div><i class="cc-go32">›</i></button>';
          if (a === 'fuse') h += '<button class="case-card32" data-act="fuse"><span class="cc-ic32">💡</span><div><b>جعبه‌ی فیوز پناهگاه</b><span>سیم‌ها را به ترتیب وصل کن</span></div><i class="cc-go32">›</i></button>';
        }
      }
      /* اکشن‌های بقا */
      h += '<div class="sec-hdr32"><i></i><span>بقا</span><i></i></div>';
      h += '<button class="act-card32" data-act="scav"><span class="ac-ic32">🔍</span><div><b>جست‌وجوی محیط</b><span>روزی یک‌بار — شانس قراضه یا مدکیت</span></div></button>';
      h += '<button class="act-card32" data-act="molo"><span class="ac-ic32">🔥</span><div><b>ساخت کوکتل مولوتوف</b><span>داردی: ' + faNum(this.molotovs) + ' — در شب، دکمه‌ی شعله در ریل چپ</span></div><em class="ac-price32">۴۵🪙</em></button>';
      box.innerHTML = h;
      box.querySelectorAll('[data-act]').forEach((b) => {
        b.addEventListener('click', () => {
          const act = b.getAttribute('data-act');
          SFX.click();
          if (act === 'radio') this.openRadio();
          else if (act === 'code') this.openCode();
          else if (act === 'fuse') this.openFuse();
          else if (act === 'scav') this.scavenge();
          else if (act === 'molo') {
            if (this.craftMolotov()) {
              const sp = b.querySelector('div span');
              if (sp) sp.textContent = 'داردی: ' + faNum(this.molotovs) + ' — در شب، دکمه‌ی شعله در ریل چپ';
            }
          }
        });
      });
    };
    MYST.openArchive.__32 = true;
  } catch (e) {}
})();

/* ---------- ۳۲-۴) آیکون چراغ‌قوه — SVG تمیز (به‌جای PNG) ---------- */
(function flashIcon32() {
  try {
    const b = document.getElementById('ctlFlash');
    if (!b) return;
    const ic = b.querySelector('.ic');
    if (!ic) return;
    ic.innerHTML = SVG32.flash;
  } catch (e) {}
  /* دکمه ممکن است بعداً دوباره ساخته شود — هر ۱.۵s چک ایمن */
  setInterval(() => {
    try {
      const b = document.getElementById('ctlFlash');
      if (!b) return;
      const ic = b.querySelector('.ic');
      if (ic && !ic.querySelector('svg')) ic.innerHTML = SVG32.flash;
    } catch (e) {}
  }, 1500);
})();

/* ---------- ۳۲-۵) «ذخیره شد» — محوِ سریع (۱٫۳۵s، قبلاً ۳٫۴s) ---------- */
(function savedToast32() {
  try {
    if (typeof saveAndExit !== 'function' || saveAndExit.__32) return;
    const _se = saveAndExit;
    saveAndExit = function () {
      const r = _se.apply(this, arguments);
      setTimeout(() => { try { hideAnnounce(); } catch (e) {} }, 1350);
      return r;
    };
    saveAndExit.__32 = true;
  } catch (e) {}
})();

/* ---------- ۳۲-۶) خرید مطمئن — بازخورد مرئی رد شدن ---------- */
(function buyFeedback32() {
  try {
    if (typeof denyBPItem === 'function' && !denyBPItem.__32) {
      const _d = denyBPItem;
      denyBPItem = function (kind) {
        const r = _d.apply(this, arguments);
        try {
          const d = (typeof BUILD_DEFS !== 'undefined' ? BUILD_DEFS.find(x => x.kind === kind) : null) || {};
          setAnnounce('⛔ سکه کافی نیست', (d.name || 'این آیتم') + ' پول بیشتری می‌خواهد', 1.4);
        } catch (e) {}
        return r;
      };
      denyBPItem.__32 = true;
    }
  } catch (e) {}
  try {
    if (typeof attemptBuy === 'function' && !attemptBuy.__32) {
      const _a = attemptBuy;
      attemptBuy = function (kind) {
        try {
          if (kind === 'repair' && state.tower.hp >= state.tower.maxHp - 0.5) {
            setAnnounce('برج سالم است', 'تعمیری لازم نیست', 1.2);
            SFX.deny();
            return;
          }
        } catch (e) {}
        return _a.apply(this, arguments);
      };
      attemptBuy.__32 = true;
    }
  } catch (e) {}
})();

/* ---------- ۳۲-۷) راه‌اندازی پس از لود ---------- */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    try { flashIcon32(); } catch (e) {}
    try { if (typeof MYST !== 'undefined' && MYST) MYST._badge32(); } catch (e) {}
  }, { once: true });
} else {
  try { flashIcon32(); } catch (e) {}
}
