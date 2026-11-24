/* ==================================================================
   سه طبقه تا مرگ — ماژول ۴۳٫۰ — بخش الف: موتور سینمایی CINE43
   ==================================================================
   کاراکترهای واقعیِ بازی با صورت/لباس/انیمیشن — به‌جای سیلوئت‌های بی‌روح:
     آرش (کاپشن سرمه‌ای)، ارشان (سربند سرخ + پیراهن سبز)،
     دکتر مریم (روپوش سفید + روسری سبز)، دکتر سارا (روپوش خاکستری + باند)，
     نگهبان (کلاه‌خود + جلیقه)، بازمانده.
   همه پا در زمین، سایه زیر پا، راه‌رفتنِ مفصلی، نفس‌کشیدنِ آیدل،
   دهانِ متحرک هنگام حرف‌زدن، نورِ لبه (rim).
   + ابزار سینمایی: لنز اسکوپ، وینیِت، گرِین فیلم، دوربین زوم/پن.
   ================================================================== */
'use strict';

const CINE43 = {
  /* -------- پیکربندی کاراکترها -------- */
  CH: {
    arash: {
      skin: '#f2c9a2', skinD: '#d8a878',
      hair: '#2c2620', hairD: '#1a1613',
      top: '#31435e', topD: '#243349', topL: '#43597c',
      leg: '#3a4256', legD: '#2a3040',
      shoe: '#23262e', pack: '#6e4f2e',
      h: 56,
    },
    arshan: {
      skin: '#eec298', skinD: '#d0a272',
      hair: '#3a2c20', hairD: '#241a12',
      band: '#c83838', bandD: '#9a2626',
      top: '#4e7a56', topD: '#38603e', topL: '#5f9468',
      leg: '#4a4438', legD: '#363126',
      shoe: '#2a2620',
      h: 58,
    },
    maryam: {
      skin: '#f4cca6', skinD: '#dcae82',
      scarf: '#3aa88a', scarfD: '#2a8468',
      top: '#e9eef2', topD: '#c6d0d8', topL: '#f8fbfd',
      leg: '#2e7a68', legD: '#205a4c',
      shoe: '#e6e9ee',
      h: 54,
    },
    sara: {
      skin: '#e8bc96', skinD: '#cc9e74',
      hair: '#b8b4c2', hairD: '#8f8ba0',
      top: '#8d93a2', topD: '#6e7382', topL: '#a6acba',
      leg: '#3a3e4c', legD: '#2a2e3a',
      shoe: '#26262e', band: 'rgba(190,88,74,0.9)',
      h: 55,
    },
    guard: {
      skin: '#d9a874', skinD: '#ba8856',
      helm: '#39434c', helmD: '#262e36', helmL: '#4e5a64',
      top: '#5a6248', topD: '#434a34', topL: '#6e774f',
      leg: '#3c4034', legD: '#2c3026',
      shoe: '#1e2026', vest: '#4c4434', vestD: '#362f22',
      h: 57,
    },
    survivor: {
      skin: '#e4b48c', skinD: '#c6946a',
      hair: '#4a3423', hairD: '#322216',
      top: '#6e5844', topD: '#524030', topL: '#826a52',
      leg: '#46403a', legD: '#34302a',
      shoe: '#242018',
      h: 52,
    },
  },

  /* ================================================================
     شخصیت کامل — x,y = محل پاها روی زمین. s = مقیاس. opt:
     face(±1) · walk(فاز ۰..∞ یا ۰=ایست) · talk(true) · t(زمان)
     pose: 'idle'|'walk'|'talk'|'point'|'kneel'|'sit'|'carry'|'reach'
     pack(کوله) · flashlight([tx,ty]) · alpha
     ================================================================ */
  person(id, x, y, s, opt) {
    const o = opt || {};
    const C = this.CH[id] || this.CH.survivor;
    const t = o.t || 0;
    const walk = o.walk || 0;
    const talking = !!o.talk;
    const pose = o.pose || (walk > 0 ? 'walk' : 'idle');
    const face = o.face || 1;
    const H = C.h;
    const br = Math.sin(t * 1.9) * (pose === 'idle' ? 1 : 0.4);          // نفس‌کشیدن
    const legA = pose === 'sit' || pose === 'kneel' ? 0 : Math.sin(walk);
    const legB = -legA;
    const bob = pose === 'walk' ? Math.abs(Math.cos(walk)) * 1.7 : 0;

    ctx.save();
    ctx.globalAlpha = o.alpha != null ? o.alpha : 1;
    ctx.translate(x, y);
    ctx.scale(face < 0 ? -s : s, s);
    if (o.tilt) ctx.rotate(o.tilt * face);

    /* ---- سایه ---- */
    ctx.fillStyle = 'rgba(0,0,0,0.36)';
    ctx.beginPath(); ctx.ellipse(0, 1.5, H * 0.20, H * 0.052, 0, 0, Math.PI * 2); ctx.fill();

    const yy = -bob;                                    // کل بدن با گام بالا-پایین

    /* ---- پاها ---- */
    if (pose === 'sit') {
      ctx.strokeStyle = C.legD; ctx.lineWidth = 7; ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(-2, yy - 26); ctx.lineTo(11, yy - 22); ctx.lineTo(13, yy - 2);
      ctx.moveTo(2, yy - 26); ctx.lineTo(12, yy - 26 + 1); ctx.lineTo(16, yy - 10);
      ctx.stroke();
      ctx.fillStyle = C.shoe;
      ctx.beginPath(); ctx.ellipse(15, yy - 2, 4.6, 2.6, 0, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(18, yy - 10, 4.4, 2.5, 0, 0, Math.PI * 2); ctx.fill();
    } else if (pose === 'kneel') {
      ctx.strokeStyle = C.legD; ctx.lineWidth = 7; ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(-2, yy - 26); ctx.lineTo(-7, yy - 4);
      ctx.moveTo(2, yy - 26); ctx.lineTo(8, yy - 12); ctx.lineTo(14, yy - 1);
      ctx.stroke();
      ctx.fillStyle = C.shoe;
      ctx.beginPath(); ctx.ellipse(-8, yy - 3, 5, 2.8, 0, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(15.4, yy - 1, 4.8, 2.6, 0, 0, Math.PI * 2); ctx.fill();
    } else {
      ctx.strokeStyle = C.legD; ctx.lineWidth = 6.6; ctx.lineCap = 'round';
      ctx.beginPath();
      /* پای عقب با زانوی خم */
      ctx.moveTo(-1.5, yy - 27);
      ctx.quadraticCurveTo(-2 + legA * 4, yy - 14, -1 + legA * 8.5, yy - 1);
      /* پای جلو */
      ctx.moveTo(2.5, yy - 27);
      ctx.quadraticCurveTo(3 + legB * 4, yy - 15, 2.5 + legB * 8.5, yy - 1.5);
      ctx.stroke();
      /* کفش‌ها */
      ctx.fillStyle = C.shoe;
      ctx.beginPath(); ctx.ellipse(-1 + legA * 8.5 + 1.6, yy - 1.4, 4.4, 2.4, 0, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(2.5 + legB * 8.5 + 1.6, yy - 1.2, 4.4, 2.4, 0, 0, Math.PI * 2); ctx.fill();
    }

    /* ---- بالاتنه ---- */
    const hipY = yy - 26, shY = yy - 46 + br * 0.5;
    const g1 = ctx.createLinearGradient(0, shY, 0, hipY);
    g1.addColorStop(0, C.topL); g1.addColorStop(0.5, C.top); g1.addColorStop(1, C.topD);
    ctx.fillStyle = g1;
    ctx.beginPath();
    ctx.moveTo(-9, hipY + 1);
    ctx.quadraticCurveTo(-10.6, (hipY + shY) / 2, -8, shY + 1);
    ctx.quadraticCurveTo(0, shY - 3.4, 8, shY + 1);
    ctx.quadraticCurveTo(10.6, (hipY + shY) / 2, 9, hipY + 1);
    ctx.closePath(); ctx.fill();
    /* سایه زیربغل + کمربند */
    ctx.fillStyle = 'rgba(0,0,0,0.14)';
    ctx.beginPath(); ctx.moveTo(9, hipY + 1); ctx.quadraticCurveTo(10.6, (hipY + shY) / 2, 8, shY + 1);
    ctx.quadraticCurveTo(7, (hipY + shY) / 2 + 2, 6.6, hipY); ctx.closePath(); ctx.fill();
    if (id !== 'maryam' && id !== 'sara') {
      ctx.fillStyle = 'rgba(20,18,14,0.5)';
      ctx.fillRect(-8.6, hipY - 3.2, 17.4, 2.6);
    }

    /* ---- کوله آرش ---- */
    if (C.pack && pose !== 'sit') {
      ctx.fillStyle = C.pack;
      rr(-15, shY + 3, 7.4, 12, 3); ctx.fill();
      ctx.strokeStyle = 'rgba(30,20,10,0.5)'; ctx.lineWidth = 1.2;
      rr(-15, shY + 3, 7.4, 12, 3); ctx.stroke();
      ctx.fillRect(-14.4, shY + 7.4, 6.2, 1.6);
    }

    /* ---- بازوها ---- */
    const armSw = pose === 'walk' ? Math.sin(walk + Math.PI) * 5 : 0;
    ctx.strokeStyle = C.topD; ctx.lineWidth = 5; ctx.lineCap = 'round';
    /* بازوی عقب (سمت دور) */
    if (pose === 'talk') {
      ctx.beginPath(); ctx.moveTo(-6, shY + 3); ctx.quadraticCurveTo(-10, shY + 10, -8.6, shY + 17); ctx.stroke();
    } else if (pose === 'reach') {
      ctx.beginPath(); ctx.moveTo(-6, shY + 3); ctx.quadraticCurveTo(-11, shY + 8, -13, shY + 13); ctx.stroke();
    } else {
      ctx.beginPath(); ctx.moveTo(-6, shY + 3); ctx.quadraticCurveTo(-9 - armSw * 0.4, shY + 10, -7 - armSw * 0.8, hipY - 1); ctx.stroke();
    }
    /* بازوی جلو */
    ctx.strokeStyle = C.top === C.topD ? C.topD : C.top; ctx.lineWidth = 5.4;
    if (pose === 'talk') {
      ctx.beginPath(); ctx.moveTo(6, shY + 3.4);
      ctx.quadraticCurveTo(11, shY + 6 + Math.sin(t * 8.4) * 1.6, 9.5, shY + 12); ctx.stroke();
      ctx.fillStyle = C.skin; circle(9.5, shY + 13.4, 2.5);
    } else if (pose === 'point') {
      ctx.beginPath(); ctx.moveTo(6, shY + 3.4); ctx.quadraticCurveTo(14, shY + 2, 18.5, shY - 2); ctx.stroke();
      ctx.fillStyle = C.skin; circle(19.5, shY - 2.4, 2.4);
    } else if (pose === 'reach') {
      ctx.beginPath(); ctx.moveTo(6, shY + 3.4); ctx.quadraticCurveTo(12.5, shY + 6, 15, shY + 11); ctx.stroke();
      ctx.fillStyle = C.skin; circle(15.6, shY + 12.4, 2.6);
    } else if (pose === 'kneel') {
      ctx.beginPath(); ctx.moveTo(6, shY + 3.4); ctx.quadraticCurveTo(11, shY + 10, 10, shY + 18); ctx.stroke();
      ctx.fillStyle = C.skin; circle(10.2, shY + 19.4, 2.5);
    } else {
      ctx.beginPath(); ctx.moveTo(6, shY + 3.4);
      ctx.quadraticCurveTo(9 + armSw * 0.4, shY + 10, 7 + armSw * 0.8, hipY - 1); ctx.stroke();
      ctx.fillStyle = C.skin; circle(7 + armSw * 0.8, hipY - 0.4, 2.5);
    }

    /* ---- چراغ‌قوه نگهبان ---- */
    if (o.flashlight) {
      const [tx, ty] = o.flashlight;
      const cone = ctx.createLinearGradient(6, shY + 4, tx - x * face / s, ty - y / s);
      cone.addColorStop(0, 'rgba(255,238,190,0.42)');
      cone.addColorStop(1, 'rgba(255,238,190,0)');
      ctx.fillStyle = cone;
      ctx.beginPath();
      ctx.moveTo(6, shY + 2); ctx.lineTo(10, shY + 8);
      ctx.lineTo(tx - x * face / s + 26, ty - y / s + 30); ctx.lineTo(tx - x * face / s - 26, ty - y / s - 30);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = 'rgba(255,246,210,0.95)'; circle(9.6, shY + 6.4, 2.6);
    }

    /* ---- سر ---- */
    const headY = shY - 9 + br * 0.7;
    const headR = 8.4;
    /* گردن */
    ctx.strokeStyle = C.skinD; ctx.lineWidth = 4.4;
    ctx.beginPath(); ctx.moveTo(0.6, shY + 1); ctx.lineTo(0.2, headY + 5); ctx.stroke();
    /* جمجمه */
    const hg = ctx.createRadialGradient(-2, headY - 3, 2, 0, headY, headR + 2);
    hg.addColorStop(0, C.skin); hg.addColorStop(1, C.skinD);
    ctx.fillStyle = hg;
    ctx.beginPath(); ctx.ellipse(1.2, headY, headR, headR * 1.08, 0, 0, Math.PI * 2); ctx.fill();

    const blink = (Math.sin(t * 0.7 + x * 0.1) > 0.985) ? 0.15 : 1;   // پلک‌زدن
    const mou = talking ? (0.35 + 0.65 * Math.abs(Math.sin(t * 9.2))) : 0.14;

    /* --- مو/روسری/کلاه‌خود — هر کاراکتر متمایز --- */
    if (id === 'arash') {
      ctx.fillStyle = C.hair;
      ctx.beginPath(); ctx.ellipse(0.4, headY - 2.6, headR * 1.04, headR * 0.92, -0.08, Math.PI, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.moveTo(-headR + 1, headY - 2);
      ctx.quadraticCurveTo(-headR - 1.6, headY + 3, -headR + 2.4, headY + 4.6);
      ctx.quadraticCurveTo(-headR + 1, headY - 0.5, -headR + 4, headY - 1.6); ctx.closePath(); ctx.fill();
      ctx.fillStyle = C.hairD;
      ctx.beginPath(); ctx.ellipse(2.6, headY - 5, headR * 0.7, headR * 0.4, 0, Math.PI, Math.PI * 2); ctx.fill();
    } else if (id === 'arshan') {
      ctx.fillStyle = C.hair;
      ctx.beginPath(); ctx.ellipse(0.4, headY - 3, headR * 1.02, headR * 0.9, 0, Math.PI, Math.PI * 2); ctx.fill();
      /* سربند سرخ گره‌دار — دو دنباله در باد */
      const wv = Math.sin(t * 2.6) * 2.2;
      ctx.fillStyle = C.band;
      rr(-headR - 0.6, headY - 4.4, headR * 2.1, 5.2, 2.4); ctx.fill();
      ctx.beginPath();
      ctx.moveTo(-headR + 0.4, headY - 3);
      ctx.quadraticCurveTo(-headR - 6, headY - 1 + wv, -headR - 10.5, headY + 3.4 + wv);
      ctx.quadraticCurveTo(-headR - 4, headY + 2, -headR + 0.4, headY + 0.6);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = C.bandD;
      ctx.fillRect(-headR + 3, headY - 3.6, 2.4, 4);
    } else if (id === 'maryam') {
      ctx.fillStyle = C.scarf;
      ctx.beginPath(); ctx.ellipse(0.2, headY - 1.4, headR * 1.14, headR * 1.1, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = C.scarfD;
      ctx.beginPath(); ctx.ellipse(-1.4, headY - 4, headR * 0.92, headR * 0.74, 0, 0, Math.PI * 2); ctx.fill();
      /* قاب صورت */
      ctx.fillStyle = C.skin;
      ctx.beginPath(); ctx.ellipse(2.4, headY + 1.4, headR * 0.74, headR * 0.8, 0, 0, Math.PI * 2); ctx.fill();
      /* شالِ آویزان */
      ctx.fillStyle = C.scarfD;
      ctx.beginPath();
      ctx.moveTo(-6.4, headY + 4);
      ctx.quadraticCurveTo(-10.5, headY + 12, -8.5, shY + 3);
      ctx.quadraticCurveTo(-4.5, shY + 2, -3.4, headY + 6);
      ctx.closePath(); ctx.fill();
    } else if (id === 'sara') {
      ctx.fillStyle = C.hair;
      ctx.beginPath(); ctx.ellipse(0.2, headY - 1.6, headR * 1.08, headR * 1.02, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = C.hairD;
      ctx.beginPath(); ctx.ellipse(2.8, headY + 0.4, headR * 0.66, headR * 0.72, 0, 0, Math.PI * 2); ctx.fill();
      /* گویی مو */
      ctx.fillStyle = C.hairD;
      circle(-7.4, headY - 4.6, 3.4);
      /* باند روی گونه */
      ctx.fillStyle = C.band;
      rr(4.6, headY + 2.2, 5.4, 3.4, 1.6); ctx.fill();
    } else if (id === 'guard') {
      ctx.fillStyle = C.helm;
      ctx.beginPath(); ctx.ellipse(0.4, headY - 2.8, headR * 1.12, headR * 0.95, 0, Math.PI, Math.PI * 2); ctx.fill();
      ctx.fillStyle = C.helmD;
      rr(-headR - 1.4, headY - 4.6, headR * 2.4, 3.4, 1.6); ctx.fill();
      ctx.fillStyle = C.helmL;
      ctx.fillRect(-headR - 1.4, headY - 4.9, headR * 2.4, 1.2);
    } else {
      ctx.fillStyle = C.hair;
      ctx.beginPath(); ctx.ellipse(0.4, headY - 2.6, headR * 1.04, headR * 0.9, -0.06, Math.PI, Math.PI * 2); ctx.fill();
    }

    /* ---- صورت: چشم‌ها + ابرو + بینی + دهان ---- */
    const exL = 3.4, exR = 7.0, ey = headY + 0.2;
    ctx.fillStyle = 'rgba(255,255,255,0.92)';
    ctx.beginPath(); ctx.ellipse(exL, ey, 1.9, 1.5 * blink, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(exR, ey, 1.7, 1.4 * blink, 0, 0, Math.PI * 2); ctx.fill();
    if (blink > 0.5) {
      ctx.fillStyle = id === 'sara' ? '#5a4a44' : '#26303e';
      circle(exL + 0.7, ey + 0.1, 0.85); circle(exR + 0.6, ey + 0.1, 0.8);
    }
    ctx.strokeStyle = 'rgba(40,32,26,0.75)'; ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(exL - 1.8, ey - 2.6); ctx.lineTo(exL + 1.8, ey - 3.2);
    ctx.moveTo(exR - 1.5, ey - 3.0); ctx.lineTo(exR + 1.6, ey - 2.5);
    ctx.stroke();
    /* بینی کوچک */
    ctx.strokeStyle = 'rgba(150,110,80,0.55)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(8.6, headY + 1.6); ctx.quadraticCurveTo(9.6, headY + 2.8, 8.4, headY + 3.2); ctx.stroke();
    /* دهان — حرف‌زدن */
    ctx.fillStyle = '#5a2626';
    if (mou > 0.3) {
      ctx.beginPath(); ctx.ellipse(7.2, headY + 5.4, 2.1, 1.1 * mou, 0, 0, Math.PI * 2); ctx.fill();
    } else {
      ctx.strokeStyle = 'rgba(90,38,38,0.85)'; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.moveTo(5.6, headY + 5.4); ctx.lineTo(8.8, headY + 5.2); ctx.stroke();
    }

    /* ---- نور لبه (rim) ---- */
    ctx.strokeStyle = o.rim || 'rgba(255,190,130,0.35)';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(-8.4, shY + 3);
    ctx.quadraticCurveTo(-10.6, (hipY + shY) / 2, -8.6, hipY);
    ctx.stroke();

    ctx.restore();
  },

  /* ================================================================
     ابزار سینمایی
     ================================================================ */
  letterbox(k) {
    const bh = Math.max(0, Math.min(1, k)) * (H * 0.085);
    ctx.fillStyle = '#04050a';
    ctx.fillRect(0, 0, W, bh);
    ctx.fillRect(0, H - bh, W, bh);
  },
  vignette(k) {
    const vg = ctx.createRadialGradient(W / 2, H / 2, H * 0.34, W / 2, H / 2, H * 0.86);
    vg.addColorStop(0, 'rgba(0,0,0,0)');
    vg.addColorStop(1, 'rgba(2,3,8,' + (0.42 * k).toFixed(2) + ')');
    ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
  },
  grain(t, k) {
    if (k <= 0) return;
    ctx.save();
    ctx.globalAlpha = 0.05 * k;
    for (let i = 0; i < 34; i++) {
      const gx = ((i * 271 + (t * 977) % 101) * 7.3) % W;
      const gy = ((i * 197 + (t * 613) % 89) * 11.7) % H;
      ctx.fillStyle = i % 2 ? '#d8dde8' : '#0a0c14';
      ctx.fillRect(gx, gy, 1.4, 1.4);
    }
    ctx.restore();
  },
  /* دوربین: focus=[fx,fy] — زوم k حول نقطه + پن */
  cam(fx, fy, k, panX, panY) {
    ctx.translate(W / 2 + (panX || 0), H / 2 + (panY || 0));
    ctx.scale(k, k);
    ctx.translate(-(fx || W / 2), -(fy || H / 2));
  },
  starfield(t, n, aMax) {
    const a = aMax || 0.55;
    ctx.fillStyle = 'rgba(214,222,255,' + a.toFixed(2) + ')';
    for (let i = 0; i < (n || 46); i++) {
      const x = (i * 173.3 + 13) % W, y = (i * 97.7 + 7) % (GROUND_Y - 60);
      if (Math.sin(t * 1.3 + i * 2.1) > -0.35) ctx.fillRect(x, y, 1.5, 1.5);
    }
  },
  moon(x, y, r, t) {
    const g = ctx.createRadialGradient(x, y, r * 0.4, x, y, r * 4.4);
    g.addColorStop(0, 'rgba(228,234,255,0.34)');
    g.addColorStop(1, 'rgba(210,218,255,0)');
    ctx.fillStyle = g; circle(x, y, r * 4.4);
    ctx.fillStyle = '#eef1ff'; circle(x, y, r);
    ctx.fillStyle = 'rgba(180,190,225,0.4)';
    circle(x - r * 0.3, y - r * 0.24, r * 0.16); circle(x + r * 0.34, y + r * 0.2, r * 0.12); circle(x + r * 0.1, y - r * 0.42, r * 0.1);
    ctx.fillStyle = 'rgba(20,24,44,0.4)';
    ctx.beginPath(); ctx.ellipse(x + r * 0.9, y - r * 0.3, r * 1.7, r * 0.34, 0, 0, Math.PI * 2); ctx.fill();
  },
  groundRoad(y0, cA, cB) {
    const gr = ctx.createLinearGradient(0, y0, 0, H);
    gr.addColorStop(0, cA || '#171a2c'); gr.addColorStop(1, cB || '#10121f');
    ctx.fillStyle = gr; ctx.fillRect(0, y0, W, H - y0);
  },
  /* کارت شروع صحنه — مثل فیلم: مکان + زمان */
  slate(title, sub, t) {
    if (t < 0.2 || t > 3.2) return;
    const a = t < 0.8 ? t / 0.8 : (t > 2.4 ? clamp(1 - (t - 2.4) / 0.8, 0, 1) : 1);
    ctx.save();
    ctx.globalAlpha = a * 0.92;
    ctx.fillStyle = 'rgba(232,222,196,0.94)';
    ctx.font = 'bold 20px Vazirmatn, Tahoma, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(title, W / 2, H * 0.2);
    if (sub) {
      ctx.font = '12.5px Vazirmatn, Tahoma, sans-serif';
      ctx.fillStyle = 'rgba(210,206,190,0.8)';
      ctx.fillText(sub, W / 2, H * 0.2 + 24);
    }
    ctx.strokeStyle = 'rgba(232,222,196,0.55)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    const lw = 120 * a;
    ctx.moveTo(W / 2 - lw, H * 0.2 + 36); ctx.lineTo(W / 2 + lw, H * 0.2 + 36);
    ctx.stroke();
    ctx.restore();
    ctx.textAlign = 'left';
  },
};

window.__CINE43 = CINE43;
