/* ==================================================================
   سه طبقه تا مرگ — نسخه‌ی ۲۳٫۰ — عمق بصری ۲.۵بعدی گیم‌پلی
   ==================================================================
   لایه‌ی پس‌پردازش روی دنیای بازی (بدون دست‌کاری کد رسم موجود):
     · مهِ زمینِ دونده بین ردیف‌های زامبی‌ها (عمق لِین‌ها)
     · اشعه‌های نورِ ماه (۲ پرتوی عریضِ آرامِ نوسان‌دار)
     · سایه‌زنی محیطی (AO) پایین/لبه‌ها + هاله‌ی افق
     · بارش باران مورب (فصل ۲) — با بادِ ملایم
     · گریدینگ رنگی سینمایی به تفکیک فصل + وینیت دوتُکه
     · فلشِ نورِ دهانه‌ی سلاح هنگام شلیک + پالس قرمزِ آسیب برج
     · ذرات نور معلق (fireflies شبه‌سه‌بعدی در فصل ۴)
   همه‌چیز سبک و متوقف‌شونده در حالت کم‌بار (PERF.low).
   ================================================================== */

const DEPTH23 = {
  t: 0, lastDt: 0.016,
  _bullets: 0, _hp: -1, _kills: -1,
  shotT: 0, hurtT: 0, killT: 0,
  rays: [], fogB: [], rain: [], motes: [],
  inited: false,

  init() {
    if (this.inited) return;
    this.inited = true;
    this.rays = [
      { x: 0.30, w: 120, sp: 0.05, ph: 0.0 },
      { x: 0.62, w: 90, sp: 0.035, ph: 2.1 },
      { x: 0.82, w: 60, sp: 0.05, ph: 4.0 },
    ];
    this.fogB = [];
    for (let i = 0; i < 10; i++) {
      this.fogB.push({ x: rand(0, W), y: 462 + (i % 5) * 17, w: 200 + (i % 4) * 120, v: 7 + (i % 3) * 6, a: 0.045 + (i % 3) * 0.02 });
    }
    this.rain = [];
    for (let i = 0; i < 46; i++) {
      this.rain.push({ x: rand(0, W), y: rand(0, H), l: 11 + Math.random() * 15, v: 460 + Math.random() * 260, ph: Math.random() * 6.28 });
    }
    this.motes = [];
    for (let i = 0; i < 16; i++) {
      this.motes.push({ x: rand(0, W), y: rand(160, GROUND_Y), ph: rand(0, 6.28), r: 0.8 + Math.random() * 1.4, up: 2 + Math.random() * 4 });
    }
  },

  /* رصد رویدادهای گیم‌پلی از روی state — بدون patch توابع */
  update(dt) {
    this.init();
    this.t += dt;
    this.lastDt = dt;
    try {
      const nb = state.bullets ? state.bullets.length : 0;
      if (nb > this._bullets) this.shotT = 0.09;
      this._bullets = nb;
      const hp = state.towerHp != null ? state.towerHp : (state.hp != null ? state.hp : -1);
      if (this._hp >= 0 && hp < this._hp) this.hurtT = 0.5;
      this._hp = hp;
      const k = state.stats ? state.stats.kills : -1;
      if (this._kills >= 0 && k > this._kills) this.killT = 0.16;
      this._kills = k;
    } catch (e) {}
    this.shotT = Math.max(0, this.shotT - dt);
    this.hurtT = Math.max(0, this.hurtT - dt);
    this.killT = Math.max(0, this.killT - dt);
  },

  /* لایه‌ی پس‌پردازش — بعد از رسم دنیا، قبل از UI */
  post() {
    this.init();
    const t = this.t;
    const ch = (typeof curCh !== 'undefined') ? curCh() : null;
    const theme = ch ? ch.theme : {};
    const low = (typeof PERF !== 'undefined' && PERF.low);
    const playing = state.mode === 'playing' || state.mode === 'day' || state.mode === 'intermission';
    if (!playing) return;

    /* --- ۱) اشعه‌های نورِ ماه (فصل‌های شب، بدون باران) --- */
    if (!low && !theme.snow && state.dayness < 0.5) {
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      for (const r of this.rays) {
        const sway = Math.sin(t * r.sp * 6 + r.ph) * 26;
        const rx = W * r.x + sway;
        const g = ctx.createLinearGradient(rx, 0, rx + r.w * 0.4, GROUND_Y);
        g.addColorStop(0, 'rgba(150,175,235,0.055)');
        g.addColorStop(0.7, 'rgba(140,165,225,0.02)');
        g.addColorStop(1, 'rgba(140,165,225,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.moveTo(rx - r.w * 0.2, 0);
        ctx.lineTo(rx + r.w * 0.35, 0);
        ctx.lineTo(rx + r.w * 0.9 + 60, GROUND_Y + 30);
        ctx.lineTo(rx - r.w * 0.5 - 40, GROUND_Y + 30);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    }

    /* --- ۲) مهِ زمین بین ردیف‌ها (عمق لِین‌ها) --- */
    for (const f of this.fogB) {
      f.x += f.v * this.lastDt;
      if (f.x - f.w > W) f.x = -f.w;
      const fa = f.a * (theme.fog ? 1.7 : 1.0);
      ctx.fillStyle = 'rgba(128,146,196,' + fa.toFixed(3) + ')';
      ctx.beginPath();
      ctx.ellipse(f.x, f.y + Math.sin(t * 0.5 + f.x * 0.01) * 4, f.w / 2, 13 + (f.w % 40), 0, 0, Math.PI * 2);
      ctx.fill();
    }

    /* --- ۳) بارش باران مورب (فصل ۲ — انبارها/کانال) --- */
    if (theme.skyline === 'warehouse' && !low) {
      ctx.save();
      ctx.strokeStyle = 'rgba(170,190,230,0.16)';
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      for (const r of this.rain) {
        r.y += r.v * this.lastDt;
        r.x += Math.sin(r.ph + t) * 0.4 - 1.2;
        if (r.y > H) { r.y = -20; r.x = rand(0, W); }
        if (r.x < -10) r.x = W + 8;
        ctx.moveTo(r.x, r.y);
        ctx.lineTo(r.x - 3.2, r.y + r.l);
      }
      ctx.stroke();
      ctx.restore();
    }

    /* --- ۴) ذرات نور معلق — فصل ۴ (پناهگاه، گرم) --- */
    if (theme.skyline !== 'warehouse' && theme.skyline !== 'ruin' && !low && state.dayness < 0.6) {
      for (const m of this.motes) {
        m.ph += this.lastDt * 0.02;
        m.y -= m.up * this.lastDt;
        if (m.y < 140) { m.y = GROUND_Y; m.x = rand(0, W); }
        const fl = 0.5 + 0.5 * Math.sin(m.ph * 3);
        ctx.fillStyle = 'rgba(255,200,120,' + (0.16 * fl).toFixed(2) + ')';
        ctx.fillRect(m.x + Math.sin(m.ph) * 6, m.y, m.r, m.r);
      }
    }

    /* --- ۵) AO: تیرگی لبه‌های پایین و کنار (عمق قاب) --- */
    const ao = ctx.createLinearGradient(0, H - 150, 0, H);
    ao.addColorStop(0, 'rgba(4,6,14,0)');
    ao.addColorStop(1, 'rgba(4,6,14,0.30)');
    ctx.fillStyle = ao; ctx.fillRect(0, H - 150, W, 150);
    const aol = ctx.createLinearGradient(0, 0, 70, 0);
    aol.addColorStop(0, 'rgba(4,6,14,0.20)'); aol.addColorStop(1, 'rgba(4,6,14,0)');
    ctx.fillStyle = aol; ctx.fillRect(0, 0, 70, H);
    const aor = ctx.createLinearGradient(W - 70, 0, W, 0);
    aor.addColorStop(0, 'rgba(4,6,14,0)'); aor.addColorStop(1, 'rgba(4,6,14,0.20)');
    ctx.fillStyle = aor; ctx.fillRect(W - 70, 0, 70, H);

    /* --- ۶) فلشِ دهانه‌ی سلاخ (نور گرم لحظه‌ای) --- */
    if (this.shotT > 0) {
      const k = this.shotT / 0.09;
      const g = ctx.createRadialGradient(W / 2, GROUND_Y - 80, 30, W / 2, GROUND_Y - 80, W * 0.5);
      g.addColorStop(0, 'rgba(255,220,150,' + (0.10 * k) + ')');
      g.addColorStop(1, 'rgba(255,220,150,0)');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    }

    /* --- ۷) پالس قرمزِ آسیبِ برج --- */
    if (this.hurtT > 0) {
      const k = this.hurtT / 0.5;
      const g = ctx.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, W * 0.62);
      g.addColorStop(0, 'rgba(180,20,20,0)');
      g.addColorStop(1, 'rgba(180,20,20,' + (0.30 * k).toFixed(2) + ')');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    }

    /* --- ۸) فلشِ طلاییِ کُشتن (بازخورد) --- */
    if (this.killT > 0 && !low) {
      const k = this.killT / 0.16;
      ctx.fillStyle = 'rgba(255,214,120,' + (0.045 * k).toFixed(3) + ')';
      ctx.fillRect(0, 0, W, H);
    }
  },
};

UPDATE_HOOKS.push(function depth23Update(dt) {
  try { DEPTH23.update(dt); } catch (e) {}
});
