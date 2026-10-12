#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""جایگزینی building23 در v4_cine23.js — هماهنگ با برج داخل بازی"""
import io

P = '/home/z/my-project/scripts/v4_cine23.js'
s = io.open(P, encoding='utf-8').read()
lines = s.split('\n')

cm_start = None
for i, l in enumerate(lines):
    if 'ساختمانِ «موجودِ» نیمه‌کاره' in l and l.strip().startswith('/*'):
        cm_start = i
        break
fn_start = cm_start
while 'building23(' not in lines[fn_start]:
    fn_start += 1
depth = 0
fn_end = None
for i in range(fn_start, min(fn_start + 400, len(lines))):
    l = lines[i]
    depth += l.count('{') - l.count('}')
    if depth == 0 and i > fn_start:
        fn_end = i
        break
assert cm_start is not None and fn_end is not None

NEW = u'''  /* ساختمانِ «موجودِ» نیمه‌کاره — (۲۶٫۰) بازسازی کامل برای «همان بودن»
     با برجِ داخل بازی: طبقات مخروطی (پهن → باریک)، رنگ‌های فصل ۱
     (سنگ شنی / آجر سرخ / آبی)، بافت بلوک، کورنیس‌ها، درِ قوس‌دار،
     بنر نشان طلایی، میله پرچم و کنگره‌ی بام — در found خراب و
     نیمه‌کاره، در fort استحکام‌یافته با تخته و پرچم.
     حالت‌ها: found = پیدا شدن (خرابه) | fort = استحکام‌یافته */
  building23(x, y, s, t, mode, duskK) {
    const fh = 62;
    const FW = [158, 144, 130];                     /* پهنای طبقات: مخروطی مثل برج بازی */
    /* پالت فصل ۱ داخل بازی — با تیرگی شب مه‌آلود */
    const DK = 0.52;                                /* ضریب شب‌شدگی رنگ بدنه */
    const FL = [
      { l: lerpColor('#82705a', '#1c2036', DK), b: lerpColor('#6e5a44', '#181c30', DK), d: lerpColor('#4d3f2f', '#12162a', DK), e: lerpColor('#453a2c', '#101426', DK) },
      { l: lerpColor('#b25a47', '#232640', DK), b: lerpColor('#a04b3a', '#1f2238', DK), d: lerpColor('#7c3527', '#161a2c', DK), e: lerpColor('#6e2f24', '#141828', DK) },
      { l: lerpColor('#4f83b5', '#202a48', DK), b: lerpColor('#41729f', '#1c2640', DK), d: lerpColor('#2f557c', '#161e34', DK), e: lerpColor('#2a4b6b', '#141c30', DK) },
    ];
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s, s);
    const H3 = fh * 3;

    /* --- سایه روی زمین --- */
    ctx.fillStyle = 'rgba(0,0,0,0.42)';
    ctx.beginPath();
    ctx.moveTo(-FW[0] / 2, 3); ctx.lineTo(FW[0] / 2, 3);
    ctx.lineTo(FW[0] / 2 - 92, 26); ctx.lineTo(-FW[0] / 2 - 118, 26);
    ctx.closePath(); ctx.fill();

    /* --- سکوی سنگی پایه (پلینث) مثل برج بازی --- */
    ctx.fillStyle = lerpColor('#3f362b', '#141828', DK);
    rr(-FW[0] / 2 - 9, -6, FW[0] + 18, 14, 3); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    ctx.fillRect(-FW[0] / 2 - 9, -6, FW[0] + 18, 2);

    /* --- آوار و خرده‌سنگ کنار پایه (حالت found) --- */
    if (mode === 'found') {
      ctx.fillStyle = lerpColor('#5d4c39', '#20243a', DK);
      ctx.beginPath();
      ctx.moveTo(-FW[0] / 2 - 30, 2); ctx.lineTo(-FW[0] / 2 - 12, -13); ctx.lineTo(-FW[0] / 2 - 4, -6);
      ctx.lineTo(-FW[0] / 2 + 8, -17); ctx.lineTo(-FW[0] / 2 + 18, -5); ctx.lineTo(-FW[0] / 2 + 2, 2);
      ctx.closePath(); ctx.fill();
      ctx.fillRect(FW[0] / 2 + 10, -8, 13, 7); ctx.fillRect(FW[0] / 2 + 20, -4, 8, 4);
    }

    /* --- طبقات از پایین به بالا --- */
    for (let i = 0; i < 3; i++) {
      const hw = FW[i] / 2;
      const yT = -fh * (i + 1) - 6, yB = -fh * i - 6;
      const F = FL[i];
      const g = ctx.createLinearGradient(-hw, 0, hw, 0);
      g.addColorStop(0, F.l); g.addColorStop(0.55, F.b); g.addColorStop(1, F.d);
      ctx.fillStyle = g;
      ctx.fillRect(-hw, yT, hw * 2, fh);
      ctx.strokeStyle = F.e; ctx.lineWidth = 2;
      ctx.strokeRect(-hw + 1, yT + 1, hw * 2 - 2, fh - 2);
      /* بافت بلوک‌های سنگی/آجری — مثل برج بازی */
      ctx.strokeStyle = 'rgba(0,0,0,0.16)'; ctx.lineWidth = 1;
      const rows = i === 1 ? 5 : 4;
      const bw2 = i === 1 ? 15 : 20;
      ctx.beginPath();
      for (let r2 = 0; r2 < rows; r2++) {
        const yy = yT + (r2 + 1) * fh / rows;
        if (r2 < rows - 1) { ctx.moveTo(-hw + 3, yy); ctx.lineTo(hw - 3, yy); }
        const off = (r2 % 2) * (bw2 / 2);
        for (let xx = -hw + off + bw2; xx < hw - 4; xx += bw2) {
          ctx.moveTo(xx, yy - fh / rows + 2); ctx.lineTo(xx, yy - 1);
        }
      }
      ctx.stroke();
      /* سایه‌ی جداکننده‌ی طبقه‌ها */
      ctx.fillStyle = 'rgba(0,0,0,0.30)';
      ctx.fillRect(-hw, yB - 4, hw * 2, 4);
      /* کورنیس برآمده بالای طبقه‌های ۱ و ۲ */
      if (i < 2) {
        ctx.fillStyle = F.e;
        ctx.fillRect(-hw - 4, yT - 5, hw * 2 + 8, 6);
        ctx.fillStyle = 'rgba(255,255,255,0.12)';
        ctx.fillRect(-hw - 4, yT - 5, hw * 2 + 8, 1.6);
      }
      /* لبه‌ی مهتاب سمت چپ */
      ctx.strokeStyle = 'rgba(205,218,255,0.22)'; ctx.lineWidth = 2.2;
      ctx.beginPath(); ctx.moveTo(-hw, yT); ctx.lineTo(-hw, yB); ctx.stroke();
    }

    /* --- طبقه‌ی سومِ نیمه‌کاره در found: میل‌گرد + بام ناقص --- */
    if (mode === 'found') {
      ctx.strokeStyle = lerpColor('#2a3158', '#39405e', 0.3); ctx.lineWidth = 2.4;
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const rx = -FW[2] / 2 + 14 + i * 13;
        ctx.moveTo(rx, -H3 - 6 + 2); ctx.lineTo(rx + 2, -H3 - 6 - 14 - (i % 3) * 5);
      }
      ctx.stroke();
      ctx.fillStyle = FL[2].e;
      ctx.fillRect(-FW[2] / 2 - 6, -H3 - 6 - 9, FW[2] * 0.66, 10);
    }

    /* --- کنگره‌ی بام (fort کامل / found ناقص) --- */
    const topW = FW[2] / 2;
    ctx.fillStyle = FL[2].e;
    ctx.fillRect(-topW - 6, -H3 - 6 - 7, topW * 2 + 12, 7);
    ctx.fillStyle = 'rgba(255,255,255,0.10)';
    ctx.fillRect(-topW - 6, -H3 - 6 - 7, topW * 2 + 12, 1.6);
    const nB = mode === 'fort' ? 6 : 4;
    for (let k = 0; k < nB; k++) {
      const bx = -topW + 3 + k * ((topW * 2 - 8) / Math.max(1, nB - 1));
      ctx.fillStyle = FL[2].e;
      ctx.fillRect(bx - 6, -H3 - 6 - 13, 12, 7);
      ctx.fillStyle = 'rgba(0,0,0,0.28)';
      ctx.fillRect(bx + 4.6, -H3 - 6 - 13, 2.4, 7);
    }
    if (mode === 'found') {
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fillRect(topW - 26, -H3 - 6 - 13, 12, 6);
      ctx.fillRect(-topW + 14, -H3 - 6 - 13, 12, 5);
    }

    /* --- میله‌ی پرچم + گوی (پرچم فقط در fort — «پناهگاه شد») --- */
    ctx.fillStyle = lerpColor('#4a3b2a', '#20243a', DK);
    ctx.fillRect(-1.6, -H3 - 6 - 40, 3.2, 40);
    ctx.fillStyle = '#f7c948';
    circle(0, -H3 - 6 - 41, 2.6);
    if (mode === 'fort') {
      const wv = Math.sin(t * 3.2) * 3.5;
      ctx.fillStyle = '#c23a2c';
      ctx.beginPath();
      ctx.moveTo(1.4, -H3 - 6 - 38);
      ctx.quadraticCurveTo(16, -H3 - 6 - 36 + wv * 0.4, 30, -H3 - 6 - 33 + wv);
      ctx.lineTo(30, -H3 - 6 - 21 + wv);
      ctx.quadraticCurveTo(16, -H3 - 6 - 23 + wv * 0.4, 1.4, -H3 - 6 - 21);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#f7c948';
      circle(14, -H3 - 6 - 27 + wv * 0.5, 3);
    } else {
      ctx.strokeStyle = lerpColor('#4a3b2a', '#20243a', DK); ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(0, -H3 - 6 - 40); ctx.lineTo(6, -H3 - 6 - 44); ctx.stroke();
    }

    /* --- پنجره‌ها — شبکه‌ی برج بازی: ۲ در هر طبقه --- */
    const win23 = (wx, wy, ww, wh, state23) => {
      ctx.fillStyle = '#0a0e1c';
      rr(wx, wy, ww, wh, 2.5); ctx.fill();
      ctx.strokeStyle = FL.e; ctx.lineWidth = 1.4;
      rr(wx, wy, ww, wh, 2.5); ctx.stroke();
      if (state23 === 'broken') {
        ctx.strokeStyle = 'rgba(170,195,240,0.6)'; ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(wx + 3, wy + 5); ctx.lineTo(wx + ww * 0.45, wy + wh * 0.5); ctx.lineTo(wx + 5, wy + wh - 4);
        ctx.moveTo(wx + ww - 4, wy + 4); ctx.lineTo(wx + ww * 0.55, wy + wh * 0.4);
        ctx.stroke();
        ctx.fillStyle = 'rgba(200,220,255,0.10)';
        rr(wx, wy, ww, wh, 2.5); ctx.fill();
      } else if (state23 === 'board') {
        ctx.strokeStyle = lerpColor('#5c4722', '#8a6a34', 0.35); ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(wx - 3, wy + 5); ctx.lineTo(wx + ww + 3, wy + 9);
        ctx.moveTo(wx - 3, wy + wh - 8); ctx.lineTo(wx + ww + 3, wy + wh - 12);
        ctx.stroke();
        ctx.fillStyle = 'rgba(220,220,230,0.5)';
        ctx.fillRect(wx + 4, wy + 7, 1.6, 1.6); ctx.fillRect(wx + ww - 6, wy + wh - 10, 1.6, 1.6);
      } else if (state23 === 'lit') {
        const wm = 0.8 + 0.2 * Math.sin(t * 2.2) * Math.sin(t * 0.8);
        const g2 = ctx.createLinearGradient(wx, wy, wx, wy + wh);
        g2.addColorStop(0, 'rgba(255,198,112,' + (0.9 * wm * duskK) + ')');
        g2.addColorStop(1, 'rgba(220,130,60,' + (0.62 * wm * duskK) + ')');
        ctx.fillStyle = g2;
        rr(wx, wy, ww, wh, 2.5); ctx.fill();
        ctx.strokeStyle = 'rgba(18,14,8,0.85)'; ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(wx + ww / 2, wy); ctx.lineTo(wx + ww / 2, wy + wh);
        ctx.moveTo(wx, wy + wh / 2); ctx.lineTo(wx + ww, wy + wh / 2);
        ctx.stroke();
        const hg = ctx.createRadialGradient(wx + ww / 2, wy + wh / 2, 3, wx + ww / 2, wy + wh / 2, 54);
        hg.addColorStop(0, 'rgba(255,170,80,' + (0.17 * wm * duskK) + ')');
        hg.addColorStop(1, 'rgba(255,170,80,0)');
        ctx.fillStyle = hg; circle(wx + ww / 2, wy + wh / 2, 54);
      }
    };
    if (mode === 'found') {
      win23(-FW[0] / 2 + 16, -fh - 6 + 12, 28, 34, 'broken');
      win23(FW[0] / 2 - 44, -fh - 6 + 12, 28, 34, 'dark');
      win23(-FW[1] / 2 + 16, -fh * 2 - 6 + 12, 28, 34, 'broken');
      win23(FW[1] / 2 - 44, -fh * 2 - 6 + 12, 28, 34, 'broken');
      win23(-FW[2] / 2 + 16, -fh * 3 - 6 + 12, 28, 34, 'broken');
      win23(FW[2] / 2 - 44, -fh * 3 - 6 + 12, 28, 34, 'dark');
      /* ترک‌های دیوار */
      ctx.strokeStyle = 'rgba(0,0,0,0.55)'; ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(-FW[0] / 2 + 30, -fh - 6 + 8);
      ctx.lineTo(-FW[0] / 2 + 38, -fh - 6 + 34);
      ctx.lineTo(-FW[0] / 2 + 33, -fh - 6 + 56);
      ctx.moveTo(FW[0] / 2 - 40, -fh * 2 - 6 + 6);
      ctx.lineTo(FW[0] / 2 - 33, -fh * 2 - 6 + 30);
      ctx.stroke();
      /* دیوارنگاره‌ی مبهم — «زنده بمان» */
      ctx.fillStyle = 'rgba(232,84,64,0.5)';
      ctx.font = 'bold 15px Vazirmatn, Tahoma';
      ctx.textAlign = 'center';
      ctx.fillText('زنده بمان', 0, -fh * 2 - 20);
    } else {
      /* fort: طبقه بالا روشن (دیده‌بانی)، بقیه تخته‌کوبی */
      win23(-FW[2] / 2 + 16, -fh * 3 - 6 + 12, 28, 34, 'lit');
      win23(FW[2] / 2 - 44, -fh * 3 - 6 + 12, 28, 34, 'dark');
      win23(-FW[1] / 2 + 16, -fh * 2 - 6 + 12, 28, 34, 'board');
      win23(FW[1] / 2 - 44, -fh * 2 - 6 + 12, 28, 34, 'board');
      win23(-FW[0] / 2 + 16, -fh - 6 + 12, 28, 34, 'board');
      win23(FW[0] / 2 - 44, -fh - 6 + 12, 28, 34, 'board');
    }

    /* --- درِ قوس‌دار: found = شکسته/تاریک · fort = ورق فلزی --- */
    if (mode === 'found') {
      ctx.fillStyle = '#0e1424';
      ctx.beginPath();
      ctx.moveTo(-17, -2); ctx.lineTo(-17, -40);
      ctx.quadraticCurveTo(0, -52, 17, -40); ctx.lineTo(17, -2);
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = FL[0].e; ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(-21, -2); ctx.lineTo(-21, -40);
      ctx.quadraticCurveTo(0, -54, 21, -40); ctx.lineTo(21, -2);
      ctx.stroke();
      /* درِ یک‌طرفه آویزان */
      ctx.fillStyle = lerpColor('#241a12', '#1a1a2e', 0.4);
      ctx.save(); ctx.translate(-8, -2); ctx.rotate(-0.18);
      ctx.fillRect(0, -36, 15, 36); ctx.restore();
    } else {
      ctx.fillStyle = '#101828';
      ctx.beginPath();
      ctx.moveTo(-17, -2); ctx.lineTo(-17, -40);
      ctx.quadraticCurveTo(0, -52, 17, -40); ctx.lineTo(17, -2);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = lerpColor('#323846', '#4a5262', 0.3);
      ctx.beginPath();
      ctx.moveTo(-14, -2); ctx.lineTo(-14, -38);
      ctx.quadraticCurveTo(0, -48, 14, -38); ctx.lineTo(14, -2);
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#10182a'; ctx.lineWidth = 1.4;
      ctx.beginPath();
      for (let i = 0; i < 3; i++) { ctx.moveTo(-14, -34 + i * 11); ctx.lineTo(14, -34 + i * 11); }
      ctx.stroke();
      ctx.strokeStyle = FL[0].e; ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(-21, -2); ctx.lineTo(-21, -40);
      ctx.quadraticCurveTo(0, -54, 21, -40); ctx.lineTo(21, -2);
      ctx.stroke();
      const dg = ctx.createRadialGradient(0, -20, 3, 0, -20, 52);
      dg.addColorStop(0, 'rgba(255,190,100,' + (0.24 * duskK) + ')');
      dg.addColorStop(1, 'rgba(255,190,100,0)');
      ctx.fillStyle = dg; circle(0, -20, 52);
    }

    /* --- بنرِ دیواری طبقه‌ی دوم با نشان طلایی (مثل برج بازی) --- */
    {
      const by = -fh * 2 - 6 + 18;
      ctx.fillStyle = mode === 'fort' ? '#a12a20' : lerpColor('#a12a20', '#3a1e2e', 0.55);
      ctx.beginPath();
      ctx.moveTo(34, by);
      ctx.lineTo(56, by);
      ctx.lineTo(56, by + 24);
      ctx.lineTo(45, by + 31);
      ctx.lineTo(34, by + 24);
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,0.35)'; ctx.lineWidth = 1.2; ctx.stroke();
      ctx.fillStyle = '#f7c948';
      circle(45, by + 11, 4);
      ctx.fillStyle = mode === 'fort' ? '#7a1f18' : '#5a2a2a';
      circle(45, by + 11, 1.7);
      if (mode === 'found') {
        ctx.strokeStyle = 'rgba(0,0,0,0.5)'; ctx.lineWidth = 1.4;
        ctx.beginPath(); ctx.moveTo(38, by + 4); ctx.lineTo(42, by + 14); ctx.lineTo(39, by + 22); ctx.stroke();
      }
    }
    ctx.restore();
  },'''

lines[cm_start:fn_end + 1] = NEW.split('\n')
io.open(P, 'w', encoding='utf-8').write('\n'.join(lines))
print('OK building23 replaced. total lines:', len(lines))
