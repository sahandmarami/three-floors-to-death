/* ==================================================================
   سه طبقه تا بقا — نسخه‌ی ۱۳٫۰ — بخش ۱۰: صدای گفتار، موسیقی و گفتگو
   ==================================================================
   - VOICE (۱۳٫۰ بازطراحی کامل — صدای طبیعیِ همیشگی):
     · ۳۳ کلیپ MP3 با «صدای نورال فارسی» از پیش ساخته و داخل همین فایل
       جاسازی شده (VOICES13) — روی هر گوشی/مرورگری پخش می‌شود؛ نه رباتیک،
       نه وابسته به صدای سیستم، نه نیازمند اینترنت.
     · هر خط گفتگو «کلید صدا» دارد (v)؛ اگر کلیپ نبود → صدای فارسی سیستم
       (Web Speech) → «صدای شخصیت» (بلیپ‌های نرم).
     · مدت واقعی هر کلیپ در داده هست → ماشین‌نویس دقیقاً هم‌زمان صدا تمام می‌شود.
   - MUSIC: آهنگساز الگویی با Web Audio (۵ قطعه) — ۱۲٫۰:
     · رفع «انباشت نُت» بعد از لگ: زمان‌بند جاافتاده را همگام می‌کند.
     · کراس‌فید نرم‌تر (۱٫۱s خاموش + ۱٫۶s روشن) — تعویض آهنگ نرم می‌شود.
     · حین «توقف» موسیقی و امبینت کامل خاموش می‌شود.
   - DLG: سیستم گفتگو — پرتره + ماشین‌نویس همگام با صدا + کلیک ادامه.
     (۱۲٫۰: رفع باگ متنِ سیاهِ نامرئی — متن همیشه روشن و خوانا)
   ================================================================== */

/* ---------------------- ۱۰-۱) صدای گفتار ---------------------- */
const VOICE = {
  faVoice: null, _voicesBound: false,
  mode: 'off',        // 'clip' | 'tts' | 'blip' | 'off'  (وضعیت خطِ فعلی)
  speaking: false,    // همین الان دارد حرف می‌زند؟
  dur: 0,             // مدت خط (ثانیه) — با کلیپ = مدت واقعی
  _safety: null,      // تایمر مهلت ایمنی (رویدادهای onend کروم گاهی نمی‌آیند)
  _blipT: 0,          // گیت زمانی بلیپ‌ها
  _bufs: {},          // کش بوم‌های دیکد‌شده‌ی کلیپ‌ها
  _src: null,         // بوم در حال پخش
  _gain: null,        // گین مستقل گفتار

  /* پروفایل صوتی شخصیت‌ها: p=پیچ، r=سرعت، f=فرکانس پایه‌ی بلیپ، w=موج، g=گین کلیپ */
  profile(who) {
    return {
      n: { p: 0.92, r: 0.95, f: 262, w: 'sine',      g: 1.0 },  // راوی — گرم و آرام
      a: { p: 1.3,  r: 1.12, f: 415, w: 'triangle', g: 1.0 },  // ارشان — تیز و شبدیز
      p: { p: 1.0,  r: 1.0,  f: 330, w: 'triangle', g: 1.0 },  // بازیکن
      r: { p: 0.88, r: 1.05, f: 208, w: 'square',    g: 1.1 },  // رادیو — فلزی
      b: { p: 0.45, r: 0.78, f: 131, w: 'sawtooth',  g: 1.2 },  // نگهبان — بم و غرم‌ود
      d: { p: 1.18, r: 1.06, f: 294, w: 'triangle', g: 1.0 },  // دستفروش
    }[who] || { p: 1, r: 1, f: 320, w: 'triangle', g: 1 };
  },

  /* ---------- (۱۳٫۰) پخش کلیپ جاسازی‌شده ---------- */
  _ensureGain() {
    if (!Snd.ready || !Snd.ctx) return false;
    if (!this._gain) {
      this._gain = Snd.ctx.createGain();
      this._gain.gain.value = 1;
      this._gain.connect(Snd.master || Snd.ctx.destination);
    }
    return true;
  },
  /* دیکد تنبل + کش؛ بوم آماده یا null */
  _buf(key) {
    const meta = (typeof VOICES13 !== 'undefined') && VOICES13[key];
    if (!meta) return null;
    if (this._bufs[key] !== undefined) return this._bufs[key];   // ممکن است nullِ درصف دیکد باشد
    if (!Snd.ready || !Snd.ctx || !window.fetch) return null;
    this._bufs[key] = null;                                     // «در صف» — دوباره دیکد نکن
    fetch(meta.a).then(r => r.arrayBuffer()).then(ab => {
      if (!Snd.ctx) return;
      return Snd.ctx.decodeAudioData(ab);
    }).then(buf => {
      if (buf) this._bufs[key] = buf;
    }).catch(() => {});
    return null;                                                // این بار هنوز آماده نیست
  },
  _playClip(key, who) {
    if (!this._ensureGain()) return false;
    const buf = this._buf(key);
    if (!buf) return false;
    try {
      const src = Snd.ctx.createBufferSource();
      src.buffer = buf;
      const g = Snd.ctx.createGain();
      const vol = (typeof SETT !== 'undefined' ? SETT.vol / 100 : 0.55) * (this.profile(who).g || 1);
      g.gain.value = Math.max(0.02, vol);
      src.connect(g); g.connect(this._gain);
      src.onended = () => { if (this._src === src) { this._src = null; this.speaking = false; } };
      src.start();
      this._src = src;
      return true;
    } catch (e) { return false; }
  },
  /* پیش‌بارگیری چند کلیپ پس از اولین ژست کاربر (شروع روان افتتاحیه) */
  warmup() {
    ['i1n1', 'i2n1', 'i3a1', 'i4p1'].forEach(k => this._buf(k));
  },

  /* پیدا کردن صدای فارسی سیستم (جایگزین وقتی کلیپی نیست) */
  initVoices() {
    if (this._voicesBound) return this.faVoice;
    this._voicesBound = true;
    try {
      const ss = window.speechSynthesis;
      if (!ss) return null;
      const pick = () => {
        const vs = ss.getVoices() || [];
        this.faVoice = vs.find(v => (v.lang || '').toLowerCase().startsWith('fa')) || null;
        return this.faVoice;
      };
      pick();
      if (!this.faVoice && typeof ss.onvoiceschanged !== 'undefined') {
        ss.addEventListener('voiceschanged', pick, { once: false });
      }
    } catch (e) { this.faVoice = null; }
    return this.faVoice;
  },

  /* پخش یک خط — v = کلید کلیپ (اختیاری) — خروجی: مدت (ثانیه) */
  speak(text, who, v) {
    this.stop();
    if (!text) return 0;
    const pr = this.profile(who);
    const muted = (typeof SETT !== 'undefined' && !SETT.sfx);
    /* ۱) کلیپ نورالِ جاسازی‌شده (۱۳٫۰) — مدتِ واقعی از داده */
    if (!muted && v && (typeof VOICES13 !== 'undefined') && VOICES13[v]) {
      this.dur = VOICES13[v].d;
      if (this._playClip(v, who)) {
        this.mode = 'clip';
        this.speaking = true;
        try { MUSIC.duck(this.dur, 0.35); } catch (e) {}
        return this.dur;
      }
      /* کلیپ هنوز دیکد نشده؟ — خط را با همان مدت ادامه بده؛ صدا دفعه‌ی بعد می‌آید */
      this._warmKey = v;
    }
    const words = String(text).trim().split(/\s+/).length;
    this.dur = clamp(0.65 + words * (0.46 / pr.r), 1.1, 7.5);
    /* ۲) صدای فارسی سیستم */
    if (!muted && this.initVoices() && window.speechSynthesis) {
      try {
        const u = new SpeechSynthesisUtterance(text);
        u.voice = this.faVoice;
        u.lang = this.faVoice.lang || 'fa-IR';
        u.rate = pr.r; u.pitch = pr.p;
        u.volume = clamp((typeof SETT !== 'undefined' ? SETT.vol : 55) / 100, 0, 1);
        const fin = () => { this.speaking = false; clearTimeout(this._safety); };
        u.onend = fin; u.onerror = fin;
        speechSynthesis.speak(u);
        this.mode = 'tts';
        this.speaking = true;
        this._safety = setTimeout(fin, (this.dur + 2.4) * 1000);
        return this.dur;
      } catch (e) { /* می‌رویم سراغ بلیپ */ }
    }
    /* ۳) صدای شخصیت: بلیپ‌ها با ماشین‌نویس (DLG.blip صدا می‌زند) */
    this.mode = muted ? 'off' : 'blip';
    this.speaking = !muted;
    return this.dur;
  },

  /* بلیپِ یک «هجا» — از DLG.update با هر حرفِ تازه صدا می‌شود */
  blip(who) {
    if (this.mode !== 'blip' || !Snd.ready || Snd.muted) return;
    const t = performance.now();
    if (t - this._blipT < 64) return;             // حداکثر ~۱۵ بلیپ در ثانیه
    this._blipT = t;
    const pr = this.profile(who);
    const f = pr.f * rand(0.9, 1.14);
    try {
      Snd.tone({ type: pr.w, f0: f, f1: f * 0.82, dur: 0.05, vol: 0.06 });
    } catch (e) {}
  },
  /* متن تمام شد → بلیپ‌ها هم تمام */
  finishBlips() { if (this.mode === 'blip') this.speaking = false; },

  stop() {
    clearTimeout(this._safety);
    this.speaking = false;
    try { if (window.speechSynthesis) speechSynthesis.cancel(); } catch (e) {}
    /* (۱۳٫۰) توقف کلیپ در حال پخش + برگشت موسیقی */
    if (this._src) {
      try { this._src.onended = null; this._src.stop(); } catch (e) {}
      this._src = null;
    }
    try { MUSIC.duckClear(); } catch (e) {}
  },
};
VOICE.initVoices();

/* ---------------------- ۱۰-۲) موسیقی الگویی ---------------------- */
/* آهنگساز کوچک روی Web Audio: هر قطعه = پیشروی آکورد + بیس + درام +
   آرپژ + ملودی. زمان‌بندی با lookahead ۲۸۰ms.
   (۱۲٫۰) رفع انباشت نُت: اگر زمان‌بند جا بیفتد (لگ/تب فعال/مکث)،
   به «الان» همگام می‌شود و نُت‌های عقب‌مانده را با هم نمی‌ریزد. */
const MUSIC = {
  track: null, _want: null, gain: null, duckG: null,
  bpm: 120, step: 0, nextT: 0, timer: null, _fadeT: null, _lastAmb: 1,

  _ensure() {
    if (!Snd.ready || !Snd.ctx) return false;
    if (!this.gain) {
      this.gain = Snd.ctx.createGain(); this.gain.gain.value = 0.0001;
      this.duckG = Snd.ctx.createGain(); this.duckG.gain.value = 1;
      this.gain.connect(this.duckG); this.duckG.connect(Snd.musicGain || Snd.master);
    }
    return true;
  },
  nf(m) { return 440 * Math.pow(2, (m - 69) / 12); },

  /* ---------- سازها (همه یک‌نُتِ زمان‌بندی‌شده) ---------- */
  osc(t, f, dur, vol, type, cut, att) {
    try {
      const o = Snd.ctx.createOscillator(), g = Snd.ctx.createGain();
      o.type = type || 'sine'; o.frequency.value = f;
      if (cut) { const fl = Snd.ctx.createBiquadFilter(); fl.type = 'lowpass'; fl.frequency.value = cut; o.connect(fl); fl.connect(g); }
      else o.connect(g);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(vol, t + (att || 0.012));
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      g.connect(this.gain);
      o.start(t); o.stop(t + dur + 0.05);
    } catch (e) {}
  },
  nz(t, dur, vol, hp) {
    try {
      const s = Snd.ctx.createBufferSource(); s.buffer = Snd.noiseBuf; s.loop = true;
      const f = Snd.ctx.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = hp || 6000;
      const g = Snd.ctx.createGain();
      g.gain.setValueAtTime(vol, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      s.connect(f); f.connect(g); g.connect(this.gain);
      s.start(t); s.stop(t + dur + 0.05);
    } catch (e) {}
  },
  kick(t, v) { try {
    const o = Snd.ctx.createOscillator(), g = Snd.ctx.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(165, t);
    o.frequency.exponentialRampToValueAtTime(40, t + 0.12);
    g.gain.setValueAtTime(v || 0.5, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
    o.connect(g); g.connect(this.gain); o.start(t); o.stop(t + 0.25);
  } catch (e) {} },
  snare(t, v) { this.nz(t, 0.13, v || 0.2, 1500); this.osc(t, 190, 0.07, (v || 0.2) * 0.5, 'triangle'); },
  pad(t, midis, dur, vol) {
    for (const m of midis) {
      const f = this.nf(m);
      this.osc(t, f * 0.996, dur, vol, 'sawtooth', 850, dur * 0.3);
      this.osc(t, f * 1.004, dur, vol * 0.8, 'sawtooth', 900, dur * 0.32);
    }
  },
  pluck(t, m, dur, vol) { this.osc(t, this.nf(m), dur, vol, 'triangle', 2600); this.osc(t, this.nf(m) * 2, dur * 0.6, vol * 0.3, 'sine', 4000); },
  bass(t, m, dur, vol) { this.osc(t, this.nf(m), dur, vol, 'sawtooth', 300); this.osc(t, this.nf(m), dur, vol * 0.6, 'sine'); },

  /* ---------- قطعه‌ها: ۴ میزان × ۱۶ گام = حلقه‌ی ۶۴گامی ---------- */
  TRACKS: {
    menu: {
      bpm: 72, vol: 0.9,
      chords: [[57, 60, 64], [53, 57, 60], [60, 64, 67], [55, 59, 62]],
      roots: [45, 41, 48, 43],
      bassPat: [[0, 0, 6], [8, 0, 4], [12, 7, 3]],
      drums: { kick: [0, 8], hat: [4, 12] },
      mel: [[0, 0, 69, 4, 0.10], [0, 6, 72, 3, 0.09], [0, 12, 71, 4, 0.08],
            [1, 0, 72, 4, 0.10], [1, 4, 69, 3, 0.09], [1, 10, 65, 5, 0.08],
            [2, 0, 67, 4, 0.10], [2, 4, 64, 3, 0.09], [2, 10, 72, 5, 0.08],
            [3, 0, 71, 4, 0.10], [3, 6, 67, 3, 0.08], [3, 12, 62, 4, 0.07]],
      padVol: 0.035, melInst: 'pluck', arp: null,
    },
    day: {
      bpm: 96, vol: 1,
      chords: [[60, 64, 67], [55, 59, 62], [57, 60, 64], [53, 57, 60]],
      roots: [48, 43, 45, 41],
      bassPat: [[0, 0, 4], [6, 0, 2], [8, 7, 4], [14, 12, 2]],
      drums: { kick: [0], hat: [2, 6, 10, 14] },
      mel: [[0, 0, 72, 3, 0.08], [0, 4, 76, 3, 0.07], [0, 8, 79, 4, 0.08],
            [1, 2, 74, 3, 0.07], [1, 8, 71, 4, 0.08],
            [2, 0, 72, 3, 0.08], [2, 6, 69, 3, 0.07], [2, 10, 76, 4, 0.08],
            [3, 0, 77, 4, 0.09], [3, 8, 72, 6, 0.07]],
      padVol: 0.028, melInst: 'pluck', arp: { steps: [0, 2, 4, 6, 8, 10, 12, 14], vol: 0.05 },
    },
    night: {
      bpm: 128, vol: 1,
      chords: [[62, 65, 69], [58, 62, 65], [57, 60, 65], [60, 64, 67]],
      roots: [38, 34, 41, 36],
      bassPat: [[0, 0, 2], [2, 12, 1], [4, 0, 2], [6, 12, 1], [8, 0, 2], [10, 7, 1], [12, 0, 2], [14, 12, 2]],
      drums: { kick: [0, 4, 8, 12], snare: [4, 12], hat: [2, 6, 10, 14], ohat: 0 },
      mel: [[2, 0, 74, 3, 0.09], [2, 3, 72, 2, 0.08], [2, 6, 70, 2, 0.08], [2, 10, 69, 4, 0.09],
            [3, 0, 67, 3, 0.08], [3, 4, 72, 3, 0.08], [3, 10, 74, 4, 0.09]],
      padVol: 0.03, melInst: 'pluck', arp: { steps: [0, 2, 4, 6, 8, 10, 12, 14], vol: 0.045 },
    },
    boss: {
      bpm: 140, vol: 1.05,
      chords: [[60, 63, 66], [60, 63, 66], [56, 60, 63], [58, 62, 65]],
      roots: [36, 36, 32, 34],
      bassPat: [[0, 0, 1], [1, 0, 1], [2, 0, 1], [3, 12, 1], [4, 0, 1], [5, 0, 1], [6, 0, 1], [7, 10, 1],
                [8, 0, 1], [9, 0, 1], [10, 0, 1], [11, 12, 1], [12, 0, 1], [13, 3, 1], [14, 0, 2], [15, 0, 1]],
      drums: { kick: [0, 4, 8, 12, 14], snare: [4, 12], hat: [2, 6, 10, 14] },
      mel: [[0, 8, 75, 2, 0.08], [0, 10, 74, 2, 0.08], [0, 12, 72, 3, 0.09],
            [2, 0, 70, 2, 0.08], [2, 2, 70, 2, 0.08], [2, 4, 69, 4, 0.09],
            [3, 0, 67, 4, 0.1], [3, 8, 63, 6, 0.08]],
      padVol: 0.032, melInst: 'pluck', arp: null, stab: [[63, 66, 70]],
    },
    victory: {
      bpm: 110, vol: 1,
      chords: [[60, 64, 67], [65, 69, 72], [55, 59, 62], [60, 64, 67]],
      roots: [48, 53, 43, 48],
      bassPat: [[0, 0, 4], [4, 7, 2], [8, 0, 4], [12, 12, 4]],
      drums: { kick: [0, 8], snare: [4, 12], hat: [2, 6, 10, 14] },
      mel: [[0, 0, 72, 4, 0.11], [0, 4, 76, 3, 0.1], [0, 8, 79, 6, 0.11],
            [1, 0, 77, 4, 0.1], [1, 6, 81, 4, 0.1],
            [2, 0, 79, 4, 0.1], [2, 4, 74, 3, 0.09], [2, 8, 71, 4, 0.09],
            [3, 0, 72, 8, 0.12]],
      padVol: 0.04, melInst: 'pluck', arp: { steps: [0, 2, 4, 6, 8, 10, 12, 14], vol: 0.05 },
    },
  },

  /* ---------- تغییر قطعه با کراس‌فید نرم (۱۲٫۰) ---------- */
  set(name) {
    if (this.track === name || this._want === name) return;   // در حال رفتن به همان قطعه
    this._want = name;
    if (!this._ensure()) { this.track = name; return; }       // صدا هنوز نیست — فقط ثبت
    const t = Snd.ctx.currentTime;
    try {
      this.gain.gain.cancelScheduledValues(t);
      this.gain.gain.setValueAtTime(Math.max(0.0001, this.gain.gain.value), t);
      this.gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.1);
    } catch (e) {}
    clearTimeout(this._fadeT);
    this._fadeT = setTimeout(() => { this._start(name); }, 1120);
  },
  _start(name) {
    this.track = (this.TRACKS[name] ? name : this._want) || 'menu';
    this._want = this.track;
    if (!this._ensure()) return;
    this.step = 0;
    this.nextT = Snd.ctx.currentTime + 0.08;
    const T = this.TRACKS[this.track];
    try {
      const t = Snd.ctx.currentTime;
      this.gain.gain.cancelScheduledValues(t);
      this.gain.gain.setValueAtTime(0.0001, t);
      this.gain.gain.exponentialRampToValueAtTime(0.9 * (T.vol || 1), t + 1.6);
    } catch (e) {}
    if (!this.timer) this.timer = setInterval(() => this._tick(), 70);
  },
  /* محو کامل و توقف (صفحه‌ی باخت) */
  fadeStop() {
    if (!this.track && !this.timer) return;
    this._want = null;
    this.track = null;
    if (this.gain && Snd.ctx) {
      try {
        const t = Snd.ctx.currentTime;
        this.gain.gain.cancelScheduledValues(t);
        this.gain.gain.setValueAtTime(Math.max(0.0001, this.gain.gain.value), t);
        this.gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.2);
      } catch (e) {}
    }
    clearTimeout(this._fadeT);
    this._fadeT = setTimeout(() => {
      if (this.timer) { clearInterval(this.timer); this.timer = null; }
    }, 1250);
  },
  stop() {
    clearTimeout(this._fadeT); clearTimeout(this._duckT);
    if (this.timer) { clearInterval(this.timer); this.timer = null; }
    if (this.gain && Snd.ctx) { try { this.gain.gain.value = 0.0001; } catch (e) {} }
    this.track = null; this._want = null;
  },
  /* موسیقی حین گفتار آرام شود */
  duck(dur, level) {
    if (!this.gain || !Snd.ctx) return;
    clearTimeout(this._duckT);
    try {
      const t = Snd.ctx.currentTime;
      this.duckG.gain.cancelScheduledValues(t);
      this.duckG.gain.setValueAtTime(Math.max(0.0001, this.duckG.gain.value), t);
      this.duckG.gain.exponentialRampToValueAtTime(level || 0.4, t + 0.25);
    } catch (e) {}
  },
  duckClear() {
    if (!this.gain || !Snd.ctx) return;
    try {
      const t = Snd.ctx.currentTime;
      this.duckG.gain.cancelScheduledValues(t);
      this.duckG.gain.setValueAtTime(Math.max(0.0001, this.duckG.gain.value), t);
      this.duckG.gain.exponentialRampToValueAtTime(1, t + 0.5);
    } catch (e) {}
  },

  /* زمان‌بند: گام‌های آینده را می‌سازد — (۱۲٫۰) ضد انباشت */
  _tick() {
    if (!Snd.ready || !Snd.ctx || !this.track) return;
    const T = this.TRACKS[this.track];
    if (!T) return;
    const spb = 60 / T.bpm / 4;                       // طول یک گام ۱۶م
    const now = Snd.ctx.currentTime;
    /* اگر زمان‌بند جا افتاد (لگ فریم/تب مخفی)، عقب نمی‌ماند و انباشت نمی‌کند */
    if (this.nextT < now - 0.12) this.nextT = now + 0.05;
    let guard = 0;
    while (this.nextT < now + 0.28 && guard++ < 22) {
      const t = this.nextT, s = this.step % 64, bar = (s / 16) | 0, st = s % 16;
      if (t >= now - 0.02) {
        /* پد: ابتدای هر میزان */
        if (st === 0) this.pad(t, T.chords[bar], spb * 16 * 0.98, T.padVol);
        /* بیس */
        for (const [gs, off, len] of T.bassPat) if (gs === st) this.bass(t, T.roots[bar] + off, spb * len * 0.95, 0.16);
        /* درام */
        if (T.drums.kick && T.drums.kick.includes(st)) this.kick(t, 0.5);
        if (T.drums.snare && T.drums.snare.includes(st)) this.snare(t, 0.2);
        if (T.drums.hat && T.drums.hat.includes(st)) this.nz(t, 0.03, 0.05 + (st % 4 ? 0 : 0.03), 8000);
        /* آرپژ */
        if (T.arp && T.arp.steps.includes(st)) {
          const ch = T.chords[bar];
          this.osc(t, this.nf(ch[(st / 2 + bar) % ch.length] + 12), spb * 1.8, T.arp.vol, 'square', 3200);
        }
        /* فزع‌آوات باس */
        if (T.stab && st === 6) for (const m of T.stab[0]) this.osc(t, this.nf(m), spb * 3, 0.07, 'sawtooth', 2200);
        /* ملودی */
        for (const [mb, ms, note, len, vol] of T.mel) if (mb === bar && ms === st) {
          if (T.melInst === 'pluck') this.pluck(t, note, spb * len, vol);
        }
      }
      this.step++;
      this.nextT += spb;
    }
  },

  /* نگاشت حالت بازی → قطعه (هر فریم صدا زده می‌شود؛ ارزان است) */
  update() {
    if (!Snd.ready) { if (this._want) this._start(this._want); return; }
    let want = 'menu';
    const m = state.mode;
    if (m === 'start' || m === 'intro') want = 'menu';
    else if (m === 'day' || m === 'intermission') want = 'day';
    else if (m === 'playing') want = state.wave >= FINAL_WAVE ? 'boss' : 'night';
    else if (m === 'transition' || m === 'cutscene') want = 'night';
    else if (m === 'victorycine' || m === 'victory') want = 'victory';
    else if (m === 'defeatcine' || m === 'gameover') want = null;    // سکوت سینمایی (۱۲٫۰)
    else if (m === 'paused') want = this.track || 'menu';
    if (want === null) this.fadeStop();
    else if (this.track !== want || this._want !== want) this.set(want);
    /* (۱۲٫۰) توقف = موسیقی کاملاً خاموش */
    if (this.gain && Snd.ctx) {
      try {
        const target = (m === 'paused') ? 0.0001
          : (this.TRACKS[this.track] ? 0.9 * this.TRACKS[this.track].vol : 0.9);
        const cur = this.gain.gain.value;
        if (Math.abs(cur - target) > 0.05) this.gain.gain.setTargetAtTime(target, Snd.ctx.currentTime, 0.4);
      } catch (e) {}
    }
    /* (۱۲٫۰) امبینتِ پد/باد هم حین توقف خاموش شود */
    if (Snd.musicGain && Snd.ctx && Snd.musicOn !== false) {
      const amb = (m === 'paused') ? 0.0001 : 1;
      if (this._lastAmb !== amb) {
        this._lastAmb = amb;
        try { Snd.musicGain.gain.setTargetAtTime(amb, Snd.ctx.currentTime, 0.3); } catch (e) {}
      }
    }
  },
};

/* ---------------------- ۱۰-۳) سیستم گفتگو ---------------------- */
/* خط‌ها: {who:'n|a|p|r|b|d', text} — پرتره + ماشین‌نویسِ همگام با صدا +
   کلیک/Space برای ادامه. فقط در حالت‌های غیرقابل‌بازی (سینمایی). */
const DLG_WHO = {
  n: { name: 'راوی',        color: '#ffd9a0' },
  a: { name: 'ارشان',       color: '#ffb03c' },
  p: { name: 'تو',          color: '#8fd6ff' },
  r: { name: '📻 رادیو',    color: '#a8e4a0' },
  b: { name: 'نگهبان',      color: '#c44dff' },
  d: { name: 'دستفروش',     color: '#d8a3ff' },
};

const DLG = {
  active: false, lines: [], idx: 0, chars: 0, t: 0,
  lineT: 0, voiceDur: 0, holdT: 0, onDone: null, doneFired: false,

  start(lines, onDone) {
    if (!lines || !lines.length) { if (onDone) onDone(); return; }
    this.lines = lines; this.idx = 0; this.onDone = onDone;
    this.active = true; this.doneFired = false;
    $('dlgBox').classList.remove('hidden');
    this._line();
  },
  _line() {
    const L = this.lines[this.idx];
    this.chars = 0; this.t = 0; this.lineT = 0; this.holdT = 0;
    this.voiceDur = VOICE.speak(L.text, L.who, L.v);
    const w = DLG_WHO[L.who] || DLG_WHO.n;
    $('dlgWho').textContent = w.name;
    $('dlgWho').style.color = w.color;
    $('dlgText').textContent = '';
    $('dlgText').style.color = '';              /* (۱۲٫۰) رنگ از CSS روشن — متن سیاهِ نامرئی رفع شد */
    $('dlgPortrait').style.outlineColor = w.color;
    $('dlgPortrait').style.boxShadow = '0 0 14px ' + w.color + '55, inset 0 0 22px rgba(0,0,0,0.4)';
  },
  update(dt) {
    if (!this.active) return;
    const L = this.lines[this.idx];
    const full = L.text.length;
    this.t += dt;
    /* سرعت ماشین‌نویس: متن همزمان با صدا تمام شود */
    const vDur = this.voiceDur || Math.max(1.2, full / 26);
    const cps = full / Math.max(0.9, vDur * 0.9);
    if (this.chars < full) {
      this.lineT += dt * cps;
      const nc = Math.min(full, Math.floor(this.lineT));
      if (nc !== this.chars) {
        this.chars = nc;
        $('dlgText').textContent = L.text.slice(0, nc);
        if (VOICE.mode === 'blip') VOICE.blip(L.who);       /* صدای شخصیت */
      }
    } else {
      if (VOICE.mode === 'blip') VOICE.finishBlips();
      this.holdT += dt;
      /* بعد از پایان صدا کمی مکث، بعد خط بعد */
      if (!VOICE.speaking && this.holdT > 0.12 && this.t > vDur * 0.55) this._next();
      else if (this.t > vDur + 2.4) this._next();           /* مهلت ایمنی */
    }
    /* پرتره‌ی سخنگو (با دهانِ متحرک حین صدا) */
    drawPortrait($('dlgPortrait'), L.who, VOICE.speaking || this.chars < full, this.t);
  },
  _next() {
    this.idx++;
    if (this.idx >= this.lines.length) this._finish();
    else { SFX.click(); this._line(); }
  },
  _finish() {
    VOICE.stop();
    this.active = false;
    $('dlgBox').classList.add('hidden');
    if (!this.doneFired) { this.doneFired = true; const f = this.onDone; this.onDone = null; if (f) f(); }
  },
  /* کلیک/Space: متن کامل شود یا خط بعد */
  advance() {
    if (!this.active) return false;
    const L = this.lines[this.idx];
    if (this.chars < L.text.length) {
      this.chars = L.text.length;
      this.lineT = this.chars;
      $('dlgText').textContent = L.text;
      if (VOICE.mode === 'blip') VOICE.finishBlips();
    } else this._next();
    return true;
  },
  skip() { if (this.active) { this.doneFired = true; this._finish(); } },
};

/* صدای کوتاه حین گیم‌پلی (بدون بلوک ورودی): صدا + زیرنویس اعلان
   (۱۳٫۰) bark(v, who, text, title, sub, dur) — v = کلید کلیپ صدا */
function bark(v, who, text, title, sub, dur) {
  const d = (who && text && !(typeof SETT !== 'undefined' && !SETT.sfx)) ? VOICE.speak(text, who, v) : 0;
  setAnnounce(title || '', sub || '', dur || Math.max(1.8, d + 0.4));
  return d;
}

/* ---------------------- ۱۰-۴) پرتره‌ی شخصیت‌ها (Canvas) ---------------------- */
function drawPortrait(cv, who, talking, t) {
  if (!cv) return;
  const c = cv.getContext('2d');
  const S = cv.width;                                  // ۹۶
  c.clearRect(0, 0, S, S);
  /* پس‌زمینه: دایره‌ی تیره + وینیت */
  const bg = c.createRadialGradient(S / 2, S * 0.42, 8, S / 2, S / 2, S * 0.62);
  bg.addColorStop(0, 'rgba(40,46,64,0.95)');
  bg.addColorStop(1, 'rgba(12,14,22,0.98)');
  c.fillStyle = bg;
  c.beginPath(); c.arc(S / 2, S / 2, S * 0.48, 0, Math.PI * 2); c.fill();
  c.save();
  c.translate(S / 2, S / 2 + 2 + (talking ? Math.sin(t * 9) * 1.2 : 0));
  const bob = talking ? Math.sin(t * 9) : 0;
  const F = '#f0c49a';                                  // رنگ پوست
  function mouth(open) {
    c.fillStyle = '#3a1f22';
    if (open > 0.15) { c.beginPath(); c.ellipse(0, 13, 4.2, 3.2 * open, 0, 0, Math.PI * 2); c.fill(); }
    else { c.fillRect(-3.6, 12, 7.2, 1.8); }
  }
  function eyes(x1, x2, y, r, col) {
    c.fillStyle = col || '#fff';
    circle2(c, x1, y, r); circle2(c, x2, y, r);
    c.fillStyle = '#1a1f2c';
    circle2(c, x1 + 0.7, y, r * 0.5); circle2(c, x2 + 0.7, y, r * 0.5);
  }
  if (who === 'a') {                                    // ارشان: کلاه قرمز + خال خال
    c.fillStyle = '#4a7a4a'; rr2(c, -17, -8, 34, 26, 9); c.fill();     // کاپشن
    c.fillStyle = F; circle2(c, 0, -2, 15);
    c.fillStyle = '#7a2a2a';                                           // کلاه
    c.beginPath(); c.arc(0, -2, 15.6, Math.PI * 0.98, Math.PI * 2.02); c.fill();
    c.fillRect(-16, -5, 32, 5);
    c.fillStyle = '#7a2a2a'; circle2(c, -15, -4, 2.4);                 // دکمه کلاه
    eyes(-5.5, 5.5, -3, 3, '#fff');
    c.fillStyle = 'rgba(180,110,70,0.55)';                              // خال
    circle2(c, -8, 4, 0.9); circle2(c, 8, 4, 0.9); circle2(c, -6, 6, 0.9);
    mouth(0.5 + bob * 0.5);
  } else if (who === 'p') {                             // بازیکن: کلاه‌کاپیشنی آبی
    c.fillStyle = '#3a5a8a'; rr2(c, -17, -8, 34, 26, 9); c.fill();
    c.fillStyle = F; circle2(c, 0, -2, 14);
    c.fillStyle = '#2c3e5c';                                           // کلاه‌کاپ
    c.beginPath(); c.arc(0, -3, 14.8, Math.PI * 0.95, Math.PI * 2.05); c.fill();
    c.fillStyle = '#1d2433'; circle2(c, 7.5, -13, 4.6);                 // سوراخ کلاه
    c.fillStyle = '#8fd6ff'; circle2(c, 8.6, -13.4, 2.2);
    eyes(-5.5, 5.5, -3, 2.8, '#e8f2ff');
    mouth(0.4 + bob * 0.45);
  } else if (who === 'r') {                             // رادیوی قدیمی
    c.fillStyle = '#5a4228'; rr2(c, -20, -16, 40, 34, 6); c.fill();
    c.fillStyle = '#6e5233'; rr2(c, -17, -13, 34, 12, 4); c.fill();    // بلندگو
    c.strokeStyle = '#3a2a18'; c.lineWidth = 1;
    for (let i = -14; i <= 14; i += 4) { c.beginPath(); c.moveTo(i, -12); c.lineTo(i, -2); c.stroke(); }
    c.fillStyle = '#d8ccb0'; circle2(c, -8, 8, 5);                      // صفحه‌ی فرکانس
    c.strokeStyle = '#c05a3a'; c.lineWidth = 1.6;
    c.beginPath(); c.moveTo(-8, 8); c.lineTo(-4 + Math.sin(t * 2) * 2, 6); c.stroke();
    c.fillStyle = '#2a2f3a'; circle2(c, 9, 8, 4.6);
    c.fillStyle = (t % 0.7 < 0.35) ? '#ffb03c' : '#7a5a2e'; circle2(c, 9, 8, 2);  // LED
    c.strokeStyle = '#c8c8c8'; c.lineWidth = 1.4;                        // آنتن
    c.beginPath(); c.moveTo(14, -14); c.lineTo(22, -26); c.stroke();
  } else if (who === 'b') {                             // نگهبان: شاخ‌دار
    c.fillStyle = '#241019'; circle2(c, 0, 0, 17);
    c.fillStyle = '#170a10';
    c.beginPath(); c.moveTo(-14, -10); c.lineTo(-20, -26); c.lineTo(-8, -13); c.closePath(); c.fill();
    c.beginPath(); c.moveTo(14, -10); c.lineTo(20, -26); c.lineTo(8, -13); c.closePath(); c.fill();
    c.shadowColor = '#c44dff'; c.shadowBlur = 8;
    c.fillStyle = '#c44dff';
    circle2(c, -6, -2, 2.6); circle2(c, 6, -2, 2.6);
    c.shadowBlur = 0;
    c.fillStyle = '#0d060a'; mouth(0.6 + bob * 0.4);
    c.fillStyle = '#3f151d'; rr2(c, -18, 8, 36, 10, 4); c.fill();       // شانه‌ها
  } else if (who === 'd') {                             // دستفروش: هودی + فانوس
    c.fillStyle = '#2a2036';                                            // هودی
    c.beginPath(); c.arc(0, 0, 18, Math.PI * 0.9, Math.PI * 2.1); c.fill();
    c.fillRect(-18, 0, 36, 18);
    c.fillStyle = '#120d18'; c.beginPath(); c.ellipse(0, 2, 11, 13, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#ffd873';                                            // چشم‌های فانوسی
    c.shadowColor = '#ffd873'; c.shadowBlur = 6;
    circle2(c, -4, 0, 1.8); circle2(c, 4, 0, 1.8);
    c.shadowBlur = 0;
    c.fillStyle = '#8a7a4a'; circle2(c, 16, 10, 6);                     // فانوس
    c.fillStyle = '#ffe9a0'; circle2(c, 16, 10, 3.4);
    c.strokeStyle = '#5a4a2a'; c.lineWidth = 1.4;
    c.beginPath(); c.moveTo(16, 2); c.lineTo(16, 4); c.stroke();
  } else {                                              // راوی: کتابِ داستانِ باز
    c.save();
    c.rotate(-0.08);
    c.fillStyle = '#5a3d2a';                            // جلد کتاب
    rr2(c, -19, -14, 38, 28, 3); c.fill();
    c.fillStyle = '#e8dcc0';                            // دو صفحه‌ی باز
    c.beginPath(); c.moveTo(-1, -12); c.quadraticCurveTo(-11, -16, -16, -10);
    c.lineTo(-16, 10); c.quadraticCurveTo(-11, 5, -1, 9); c.closePath(); c.fill();
    c.beginPath(); c.moveTo(1, -12); c.quadraticCurveTo(11, -16, 16, -10);
    c.lineTo(16, 10); c.quadraticCurveTo(11, 5, 1, 9); c.closePath(); c.fill();
    c.strokeStyle = 'rgba(90,61,42,0.5)'; c.lineWidth = 1;   // خطوط متن
    for (let i = 0; i < 3; i++) {
      c.beginPath(); c.moveTo(-13, -6 + i * 5); c.lineTo(-4, -4 + i * 5); c.stroke();
      c.beginPath(); c.moveTo(4, -4 + i * 5); c.lineTo(13, -6 + i * 5); c.stroke();
    }
    c.strokeStyle = '#3a2418'; c.lineWidth = 1.6;       // عطف کتاب
    c.beginPath(); c.moveTo(0, -12); c.lineTo(0, 9); c.stroke();
    c.restore();
    c.fillStyle = 'rgba(232,217,176,0.7)';              // هاله‌ی خاطره
    c.font = 'bold 10px Tahoma'; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillText('· · ·', 0, 22);
  }
  c.restore();
}
function circle2(c, x, y, r) { c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill(); }
function rr2(c, x, y, w, h, r) { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }

/* ---------------------- ۱۰-۵) ورودی گفتگو + هوک‌ها ---------------------- */
window.addEventListener('pointerdown', (e) => {
  if (DLG.active) { DLG.advance(); e.stopPropagation(); e.preventDefault(); }
}, true);
window.addEventListener('keydown', (e) => {
  if (DLG.active && (e.code === 'Space' || e.code === 'Enter' || e.code === 'ArrowDown')) {
    DLG.advance(); e.preventDefault(); e.stopPropagation();
  }
}, true);

UPDATE_HOOKS.push(function audioUpdate(dt) {
  /* (۱۲٫۰) MUSIC.update از خود حلقه‌ی اصلی هر فریم صدا زده می‌شود تا
     در همه‌ی حالت‌ها (منو/توقف/سینمایی/باخت) رفتار درست داشته باشد */
});

/* دیباگ API — (۱۳٫۰) رابط کامل GAME.v13 در part4 تعریف می‌شود */
Object.assign((typeof GAME !== 'undefined' ? GAME : window), {
  VOICE, MUSIC, DLG,
  say(text, who, v) { return VOICE.speak(text, who || 'n', v); },
});
