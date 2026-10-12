/* ==================================================================
   سه طبقه تا مرگ — نسخه‌ی ۲۳٫۰ — لایه‌ی معما + مکانیزم‌های بقا (TLOU)
   ==================================================================
   الف) معماهای داستانی (در روزِ بین موج‌ها، دکمه‌ی «سرنخ»):
     ۱) کوکِ بی‌سیم (فصل ۱ / بعد موج ۴): فرکانس ۱۰۴٫۵ — با نویزِ
        زنده راهنمایی می‌شود → سرنخ «مسیر کانال» + ۴۰ سکه
     ۲) قفلِ ایستگاه (فصل ۳ / بعد موج ۱۹): کد ۴رقمی از سرنخ‌ها
        → سرنخ «نقشه‌ی برج مخابراتی» + ۸۰ سکه
     ۳) جعبه‌ی فیوز پناهگاه (فصل ۴ / بعد موج ۲۵): ترتیب سیم‌ها
        → ترمیم کامل برج + ۶۰ سکه
   ب) مکانیزم‌های بقا به سبک The Last of Us:
     · حالتِ شنود (گوش بسپار): ۴ ثانیه دیدنِ ضربانِ زامبی‌ها از مه
     · جست‌وجوی محیط (روزی یک‌بار): یافتن قراضه/مدکیت/هیچ
     · ساخت کوکتل مولوتوف (۴۵ سکه) → پرتاب روی متراکم‌ترین خوشه
   تمام UI دامِ بزرگِ RTL — سازگار با لمس موبایل.
   ================================================================== */

const MYST = {
  LS_KEY: 'ttb23_myst',
  done: { radio: false, code: false, fuse: false },   // معماهای حل‌شده (پایدار)
  clues: [],                                            // سرنخ‌های آرشیوشده
  scavengedWave: -1,                                   // جست‌وجوی امروز انجام شد؟
  molotovs: 0,
  listen: { active: false, t: 0, cd: 0 },
  _panel: null, _btn: null, _listenBtn: null,
  fx: [],                                              // ذرات انفجار مولوتوف
  throwFx: null,

  /* ---------- بارگذاری/ذخیره ---------- */
  load() {
    try {
      const raw = localStorage.getItem(this.LS_KEY);
      if (raw) {
        const d = JSON.parse(raw);
        if (d && typeof d === 'object') {
          this.done = Object.assign(this.done, d.done || {});
          this.clues = Array.isArray(d.clues) ? d.clues : [];
        }
      }
    } catch (e) {}
  },
  save() {
    try {
      localStorage.setItem(this.LS_KEY, JSON.stringify({ done: this.done, clues: this.clues }));
    } catch (e) {}
  },

  /* ---------- UI: دکمه‌ی شناور «سرنخ» (روزها) ---------- */
  ensureBtn() {
    if (this._btn && document.body.contains(this._btn)) return;
    const b = document.createElement('button');
    b.id = 'mystBtn';
    b.innerHTML = '🔍 <span>سرنخ</span>';
    b.addEventListener('click', () => { SFX.click(); this.openArchive(); });
    $('wrap').appendChild(b);
    this._btn = b;
  },
  ensureListenBtn() {
    if (this._listenBtn && document.body.contains(this._listenBtn)) return;
    const b = document.createElement('button');
    b.id = 'listenBtn';
    b.innerHTML = '👂';
    b.title = 'گوش بسپار — ضربان دشمن‌ها را حس کن';
    b.addEventListener('pointerdown', () => this.startListen());
    $('wrap').appendChild(b);
    this._listenBtn = b;
    /* (۲۳٫۰) دکمه‌ی شناور مولوتوف — لمس موبایل */
    if (!this._molotovBtn || !document.body.contains(this._molotovBtn)) {
      const m = document.createElement('button');
      m.id = 'molotovBtn';
      m.innerHTML = '🔥';
      m.title = 'پرتاب کوکتل مولوتوف (F)';
      m.addEventListener('pointerdown', (e) => { e.preventDefault(); this.throwMolotov(); });
      $('wrap').appendChild(m);
      this._molotovBtn = m;
    }
  },

  /* چه معمایی/امکانی الان در دسترس است؟ */
  avail() {
    const a = [];
    const ch = state.chapter || 1;
    const w = state.wave || 0;
    if (ch === 1 && w >= 4 && !this.done.radio) a.push('radio');
    if (ch === 3 && w >= 19 && !this.done.code) a.push('code');
    if (ch >= 4 && w >= 25 && !this.done.fuse) a.push('fuse');
    return a;
  },

  update(dt) {
    const day = state.mode === 'day';
    const playing = state.mode === 'playing';
    /* دکمه‌ی سرنخ — فقط روزها و وقتی چیزی برای دیدن هست */
    if (day) {
      this.ensureBtn();
      const has = this.avail().length > 0 || this.clues.length > 0;
      this._btn.style.display = has ? 'flex' : 'none';
      if (has) this._btn.classList.toggle('glow', this.avail().length > 0 && !this._panel);
    } else if (this._btn) this._btn.style.display = 'none';
    /* دکمه‌ی شنود — فقط شب‌ها */
    if (playing) {
      this.ensureListenBtn();
      this._listenBtn.style.display = 'flex';
      this._listenBtn.classList.toggle('cd', this.listen.cd > 0);
      this._listenBtn.disabled = this.listen.cd > 0;
      if (this._molotovBtn) this._molotovBtn.style.display = this.molotovs > 0 ? 'flex' : 'none';
    } else {
      if (this._listenBtn) this._listenBtn.style.display = 'none';
      if (this._molotovBtn) this._molotovBtn.style.display = 'none';
    }
    /* تایمرهای شنود */
    if (this.listen.active) {
      this.listen.t -= dt;
      if (this.listen.t <= 0) this.listen.active = false;
      /* صدای ضربان — هر ۰٫۷ ثانیه */
      this._hb = (this._hb || 0) + dt;
      if (this._hb > 0.7) {
        this._hb = 0;
        try {
          Snd.tone({ type: 'sine', f0: 64, f1: 40, dur: 0.16, vol: 0.30 });
          setTimeout(() => { try { Snd.tone({ type: 'sine', f0: 58, f1: 36, dur: 0.14, vol: 0.22 }); } catch (e) {} }, 190);
        } catch (e) {}
      }
    }
    if (this.listen.cd > 0) this.listen.cd = Math.max(0, this.listen.cd - dt);
    /* ذرات */
    for (let i = this.fx.length - 1; i >= 0; i--) {
      const p = this.fx[i];
      p.t += dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 60 * dt;
      if (p.t > p.life) this.fx.splice(i, 1);
    }
    if (this.throwFx) {
      this.throwFx.t += dt;
      if (this.throwFx.t > this.throwFx.dur) this.throwFx = null;
    }
  },

  startListen() {
    if (this.listen.cd > 0 || this.listen.active) return;
    SFX.click();
    this.listen.active = true;
    this.listen.t = 4.0;
    this.listen.cd = 14;
    setAnnounce('👂 گوش بسپار...', 'ضربان‌ها را در مه حس می‌کنی', 2);
  },

  /* ---------- ساخت مولوتوف + پرتاب ---------- */
  craftMolotov() {
    if (this.molotovs >= 3) { SFX.deny(); setAnnounce('مولوتوف پر است', 'حداکثر ۳ عدد حمل کن', 2); return false; }
    if (state.coins < 45) { SFX.deny(); setAnnounce('سکه کافی نیست', 'مولوتوف: ۴۵ سکه', 2); return false; }
    state.coins -= 45;
    this.molotovs++;
    SFX.placeT();
    return true;
  },
  throwMolotov() {
    if (state.mode !== 'playing' || this.molotovs <= 0) return false;
    /* متراکم‌ترین خوشه‌ی زامبی‌های زنده */
    let best = null, bestN = 0;
    for (const z of state.zombies) {
      if (z.dead) continue;
      let n = 0;
      for (const z2 of state.zombies) {
        if (!z2.dead && Math.abs(z2.x - z.x) < 90 && Math.abs(z2.y - z.y) < 40) n++;
      }
      if (n > bestN) { bestN = n; best = z; }
    }
    if (!best) { SFX.deny(); setAnnounce('هدفی نیست', 'صبر کن نزدیک‌تر بشن', 1.6); return false; }
    this.molotovs--;
    const tx = best.x, ty = best.y;
    /* آسیب محدوده‌ای */
    let hits = 0;
    for (const z of state.zombies) {
      if (z.dead) continue;
      const d = Math.hypot(z.x - tx, z.y - ty);
      if (d < 130) {
        z.hp -= 70 * (1 - d / 200);
        z.hitFlash = 0.4;
        if (z.hp <= 0 && !z.dead) { try { killZombie(z); } catch (e) { z.dead = true; } hits++; }
        hits++;
      }
    }
    /* جلوه‌ها */
    this.throwFx = { x: tx, y: ty, t: 0, dur: 0.9 };
    for (let i = 0; i < 26; i++) {
      const a = rand(0, Math.PI * 2), sp = rand(40, 190);
      this.fx.push({ x: tx, y: ty - 6, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 90, t: 0, life: rand(0.5, 1.1), fire: Math.random() < 0.7 });
    }
    try { Snd.tone({ type: 'sawtooth', f0: 240, f1: 40, dur: 0.5, vol: 0.4 }); Snd.noise({ dur: 0.6, vol: 0.35, freq: 900 }); } catch (e) {}
    setAnnounce('🔥 کوکتل مولوتوف!', hits + ' هدف در آتش گرفت', 2);
    return true;
  },

  /* ---------- جست‌وجوی محیط (روزی یک‌بار) ---------- */
  scavenge() {
    if (state.mode !== 'day') return;
    if (this.scavengedWave === state.wave) { SFX.deny(); setAnnounce('امروز جست‌وجو کردی', 'فردا دوباره', 2); return; }
    this.scavengedWave = state.wave;
    const r = Math.random();
    this.closePanel();
    if (r < 0.42) {
      const c = 22 + Math.floor(rand(0, 26));
      state.coins += c;
      setAnnounce('📦 قراضه پیدا شد!', '+' + faNum(c) + ' سکه از میان آوار', 3);
      SFX.placeT();
    } else if (r < 0.72) {
      const heal = Math.min(22, state.tower.maxHp - state.tower.hp);
      state.tower.hp += heal;
      setAnnounce('💉 کمک‌های اولیه!', heal > 0 ? 'برج ' + faNum(Math.round(heal)) + ' جون گرفت' : 'برج سالم است', 3);
      SFX.placeT();
    } else {
      setAnnounce('🚪 هیچی نبود', 'فقط خاک و سکوت... و صدایی که دور نیست', 3);
      SFX.deny();
    }
  },

  /* ==================================================================
     پنل آرشیو + معماهای DOM
     ================================================================== */
  openArchive() {
    this.closePanel();
    const av = this.avail();
    const wrap = this.panelShell('آرشیو سرنخ‌ها');
    const box = wrap.querySelector('.myst-body');
    /* سرنخ‌های collected */
    let h = '';
    if (this.clues.length === 0 && av.length === 0) {
      h += '<div class="myst-empty">هنوز سرنخی نداری.<br>داستان را دنبال کن — راهنمایی‌ها در گفتگوها پنهان‌اند.</div>';
    }
    for (const c of this.clues) {
      h += '<div class="myst-clue"><div class="mc-icon">' + c.icon + '</div><div><div class="mc-name">' + c.name + '</div><div class="mc-sub">' + c.sub + '</div></div></div>';
    }
    /* معماهای فعال */
    for (const a of av) {
      if (a === 'radio') h += '<button class="myst-act" data-act="radio">📻 کوک کردن بی‌سیم<span>فرکانس ایستگاه شمال را پیدا کن</span></button>';
      if (a === 'code') h += '<button class="myst-act" data-act="code">🔐 قفل ایستگاه<span>کد ۴رقمی از سرنخ‌ها</span></button>';
      if (a === 'fuse') h += '<button class="myst-act" data-act="fuse">💡 جعبه‌ی فیوز<span>سیم‌ها را به ترتیب وصل کن</span></button>';
    }
    /* اکشن‌های بقا */
    h += '<div class="myst-sep">— بقا —</div>';
    h += '<button class="myst-act small" data-act="scav">🔍 جست‌وجوی محیط<span>روزی یک‌بار — شانس قراضه یا مدکیت</span></button>';
    h += '<button class="myst-act small" data-act="molo">🔥 ساخت کوکتل مولوتوف <b>۴۵🪙</b><span>داردی: ' + faNum(this.molotovs) + ' — در شب، دکمه‌ی شعله در ریل چپ</span></button>';
    box.innerHTML = h;
    box.querySelectorAll('.myst-act').forEach((b) => {
      b.addEventListener('click', () => {
        const act = b.getAttribute('data-act');
        SFX.click();
        if (act === 'radio') this.openRadio();
        else if (act === 'code') this.openCode();
        else if (act === 'fuse') this.openFuse();
        else if (act === 'scav') this.scavenge();
        else if (act === 'molo') { if (this.craftMolotov()) { b.querySelector('span').innerHTML = 'داردی: ' + faNum(this.molotovs) + ' — در شب، دکمه‌ی شعله در ریل چپ'; } }
      });
    });
  },

  /* --- پوسته‌ی مشترک پنل --- */
  panelShell(title) {
    const wrap = document.createElement('div');
    wrap.className = 'myst-panel';
    wrap.innerHTML =
      '<div class="myst-head"><span>' + title + '</span><button class="myst-x">✕</button></div>' +
      '<div class="myst-body"></div>';
    wrap.querySelector('.myst-x').addEventListener('click', () => { SFX.click(); this.closePanel(); });
    $('wrap').appendChild(wrap);
    this._panel = wrap;
    return wrap;
  },
  closePanel() {
    if (this._radioNoise) { try { this._radioNoise.stop(); } catch (e) {} this._radioNoise = null; }
    if (this._panel) { this._panel.remove(); this._panel = null; }
  },

  /* --- معمای ۱: کوک بی‌سیم — اسلایدر با نویزِ زنده --- */
  openRadio() {
    this.closePanel();
    const wrap = this.panelShell('📻 کوک بی‌سیم');
    const TARGET = 104.5;
    const body = wrap.querySelector('.myst-body');
    body.innerHTML =
      '<div class="myst-hint">پیام ایستگاه شمال قطع شد. آرشان می‌گفت فرکانس نزدیکِ <b>صد و چهار</b> بود...</div>' +
      '<div class="radio-dial"><input type="range" id="rdSlider" min="880" max="1080" value="960" step="1"></div>' +
      '<div class="radio-read" id="rdRead">96.0</div>' +
      '<div class="radio-static" id="rdStat">شوش... شوش...</div>' +
      '<button class="myst-act" id="rdLock">قفل کردن فرکانس</button>';
    const slider = body.querySelector('#rdSlider');
    const read = body.querySelector('#rdRead');
    const stat = body.querySelector('#rdStat');
    const upd = () => {
      const f = slider.value / 10;
      read.textContent = f.toFixed(1);
      const dist = Math.abs(f - TARGET);
      /* کیفیت سیگنال */
      if (dist < 0.4) stat.innerHTML = '<b class="ok">...ایستگاه شمال... مسیر کانال... تکرار می‌شود...</b>';
      else if (dist < 2) stat.textContent = 'شو... شش... ایستگا... شش...';
      else if (dist < 6) stat.textContent = 'شووووش... شش...';
      else stat.textContent = 'شوش... شوش...';
      /* نویز زنده — فیلتر با نزدیکی باز می‌شود */
      this.radioNoise(1 - clamp(dist / 18, 0, 1));
    };
    slider.addEventListener('input', upd);
    body.querySelector('#rdLock').addEventListener('click', () => {
      const f = slider.value / 10;
      if (Math.abs(f - TARGET) <= 0.6) {
        this.done.radio = true;
        this.addClue('📻', 'مسیر کانال', 'فرکانس ۱۰۴٫۵ — «مسیر عبور از کانال هنوز باز است»');
        state.coins += 40;
        this.save();
        SFX.placeT();
        try { VOICE.speak('مسیر کانال هنوز باز است... تکرار می‌کنم...', 'r', 'c1er'); } catch (e) {}
        this.closePanel();
        setAnnounce('📻 بی‌سیم کوک شد!', 'سرنخ «مسیر کانال» + ۴۰ سکه', 4);
      } else {
        SFX.deny();
        stat.innerHTML = '<b class="no">فرکانس درست نیست — کمی بچرخان</b>';
      }
    });
    upd();
  },

  /* نویز رادیویی زنده — منبع نویز با فیلتر متغیر */
  radioNoise(openness) {
    try {
      if (!Snd.ready || !Snd.ctx) return;
      if (!this._radioNoise) {
        const src = Snd.ctx.createBufferSource();
        src.buffer = Snd.noiseBuf; src.loop = true;
        const flt = Snd.ctx.createBiquadFilter();
        flt.type = 'bandpass'; flt.frequency.value = 1400; flt.Q.value = 1.1;
        const g = Snd.ctx.createGain();
        g.gain.value = 0.0001;
        src.connect(flt); flt.connect(g); g.connect(Snd.master);
        src.start();
        this._radioNoise = { src, g, flt };
      }
      const n = this._radioNoise;
      const t = Snd.ctx.currentTime;
      n.g.gain.setTargetAtTime(0.05 + openness * 0.11, t, 0.1);
      n.flt.frequency.setTargetAtTime(700 + openness * 1600, t, 0.1);
    } catch (e) {}
  },

  /* --- معمای ۲: کد درب — صفحه‌کلید ۴رقمی --- */
  openCode() {
    this.closePanel();
    const CODE = '3146';
    const wrap = this.panelShell('🔐 قفل ایستگاه');
    const body = wrap.querySelector('.myst-body');
    body.innerHTML =
      '<div class="myst-hint">چهار رقم روی برگه‌ی کنار در: «طبقه‌ها، شب‌های فصل اول، رقم اول فرکانس، شماره‌ی پناهگاه»</div>' +
      '<div class="code-disp" id="cdDisp">— — — —</div>' +
      '<div class="code-pad" id="cdPad"></div>' +
      '<button class="myst-act" id="cdOK">باز کردن قفل</button>';
    let entered = '';
    const disp = body.querySelector('#cdDisp');
    const pad = body.querySelector('#cdPad');
    const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫'];
    for (const k of keys) {
      const kb = document.createElement('button');
      kb.className = 'code-key' + (isNaN(+k) ? ' fn' : '');
      kb.textContent = k;
      kb.addEventListener('click', () => {
        SFX.click();
        if (k === 'C') entered = '';
        else if (k === '⌫') entered = entered.slice(0, -1);
        else if (entered.length < 4) entered += k;
        disp.textContent = entered.padEnd(4, '·').split('').join(' ');
      });
      pad.appendChild(kb);
    }
    body.querySelector('#cdOK').addEventListener('click', () => {
      if (entered === CODE) {
        this.done.code = true;
        this.addClue('🗺️', 'نقشه‌ی برج مخابراتی', 'از ایستگاه: مسیر دره‌ی شرقی تا برج — بی‌سیم فعال');
        state.coins += 80;
        this.save();
        SFX.placeT();
        this.closePanel();
        setAnnounce('🔐 قفل باز شد!', 'سرنخ «نقشه‌ی برج مخابراتی» + ۸۰ سکه', 4);
      } else {
        SFX.deny();
        disp.classList.add('shake');
        setTimeout(() => disp.classList.remove('shake'), 500);
      }
    });
  },

  /* --- معمای ۳: جعبه فیوز — ترتیب سیم‌ها --- */
  openFuse() {
    this.closePanel();
    const ORDER = ['r', 'y', 'b'];    // قرمز → زرد → آبی (سرنخ: «از آتش به آب»)
    const wrap = this.panelShell('💡 جعبه‌ی فیوز پناهگاه');
    const body = wrap.querySelector('.myst-body');
    const names = { r: 'قرمز', y: 'زرد', b: 'آبی' };
    body.innerHTML =
      '<div class="myst-hint">روی درِ جعبه نوشته‌اند: «سیم‌ها را از آتش به آب وصل کن»</div>' +
      '<div class="fuse-wires" id="fw"></div>' +
      '<div class="fuse-log" id="fl">سیم‌ها را به ترتیب بزن</div>';
    const fw = body.querySelector('#fw');
    const fl = body.querySelector('#fl');
    const shuffled = ['b', 'y', 'r'];
    let picked = [];
    const draw = () => {
      fw.innerHTML = '';
      for (const c of shuffled) {
        const b = document.createElement('button');
        const used = picked.includes(c);
        b.className = 'fuse-wire w-' + c + (used ? ' used' : '');
        b.innerHTML = '<i></i><span>' + names[c] + '</span>';
        b.addEventListener('click', () => {
          if (used) return;
          SFX.click();
          picked.push(c);
          b.classList.add('used');
          if (picked.join('') === ORDER.join('') && picked.length === 3) {
            this.done.fuse = true;
            this.addClue('💡', 'برق پناهگاه', 'فیوزها سالم — چراغ‌های راهرو روشن ماندند');
            state.tower.hp = state.tower.maxHp;
            state.coins += 60;
            this.save();
            SFX.placeT();
            this.closePanel();
            setAnnounce('💡 برق برگشت!', 'ترمیم کامل برج + ۶۰ سکه', 4);
          } else if (picked.length === 3) {
            SFX.deny();
            fl.textContent = 'جرقه زد! ترتیب درست نیست — از اول';
            try { Snd.tone({ type: 'square', f0: 800, f1: 200, dur: 0.3, vol: 0.25 }); } catch (e) {}
            setTimeout(() => { picked = []; draw(); fl.textContent = 'سیم‌ها را به ترتیب بزن'; }, 900);
          } else {
            fl.textContent = 'سیم ' + names[c] + ' وصل شد...';
          }
        });
        fw.appendChild(b);
      }
    };
    draw();
  },

  addClue(icon, name, sub) {
    this.clues.push({ icon, name, sub });
    this.save();
  },

  /* ---------- رندر کانواس: نشانگرهای شنود + مولوتوف ---------- */
  render() {
    /* حالت شنود — حلقه‌های ضربان روی زامبی‌های زنده */
    if (this.listen.active && state.mode === 'playing') {
      const k = this.listen.t / 4;
      const pulse = 0.5 + 0.5 * Math.sin(this.listen.t * 9);
      for (const z of state.zombies) {
        if (z.dead) continue;
        ctx.strokeStyle = 'rgba(255,60,50,' + (0.25 + 0.35 * pulse * k).toFixed(2) + ')';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(z.x, z.y - 14, 16 + pulse * 7, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = 'rgba(255,60,50,' + (0.10 * k).toFixed(2) + ')';
        ctx.beginPath();
        ctx.arc(z.x, z.y - 14, 16 + pulse * 7, 0, Math.PI * 2);
        ctx.fill();
      }
      /* پوشش گوشِ محیط */
      ctx.fillStyle = 'rgba(10,14,30,' + (0.22 * k).toFixed(2) + ')';
      ctx.fillRect(0, 0, W, H);
    }
    /* مولوتوف — رد پرتاب + انفجار + ذرات آتش */
    if (this.throwFx) {
      const p = this.throwFx, f = p.t / p.dur;
      const g = ctx.createRadialGradient(p.x, p.y, 4, p.x, p.y, 130 * (0.4 + f * 0.8));
      g.addColorStop(0, 'rgba(255,160,60,' + (0.5 * (1 - f)).toFixed(2) + ')');
      g.addColorStop(0.5, 'rgba(255,90,30,' + (0.25 * (1 - f)).toFixed(2) + ')');
      g.addColorStop(1, 'rgba(255,60,20,0)');
      ctx.fillStyle = g;
      circle(p.x, p.y, 130 * (0.4 + f * 0.8));
    }
    for (const p of this.fx) {
      const a = 1 - p.t / p.life;
      if (p.fire) {
        ctx.fillStyle = 'rgba(255,' + Math.round(120 + 100 * a) + ',60,' + (0.7 * a).toFixed(2) + ')';
        circle(p.x, p.y, 2 + 3 * a);
      } else {
        ctx.fillStyle = 'rgba(70,70,80,' + (0.5 * a).toFixed(2) + ')';
        ctx.fillRect(p.x, p.y, 2, 2);
      }
    }
    /* پرچم مولوتوف کنار برج — تعداد */
    if (state.mode === 'playing' && this.molotovs > 0) {
      ctx.save();
      ctx.textAlign = 'right';
      ctx.font = 'bold 12px Vazirmatn, Tahoma';
      ctx.fillStyle = 'rgba(255,180,90,0.9)';
      ctx.fillText('🔥×' + faNum(this.molotovs), TOWER.x + TOWER.baseHalf + 26, GROUND_Y - 92);
      ctx.restore();
    }
  },
};

/* راه‌اندازی */
MYST.load();

/* دکمه‌ی شعله‌دار در شب — پرتاب مولوتوف (صفحه‌کلید F / دکمه‌ی شناور) */
(function () {
  try {
    window.addEventListener('keydown', (e) => {
      if (e.code === 'KeyF') { e.preventDefault(); MYST.throwMolotov(); }
    });
  } catch (e) {}
})();

UPDATE_HOOKS.push(function mystUpdate(dt) {
  try { MYST.update(dt); } catch (e) {}
});
