#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""وصله‌ی ۲۲٫۰ — فایل ۳: v4_shelter.js (نسخه‌ی ریجکسی — بدون تطابق متن فارسی)"""
import re, sys

F = '/home/z/my-project/scripts/v4_shelter.js'
src = open(F, encoding='utf-8').read()
TAG = '/* (22.0) */'

# ---- ۱) skipShelterCine جدید ----
skip_pat = re.compile(r'function skipShelterCine\(\) \{.*?\n\}\n', re.S)
if not skip_pat.search(src): print('FAIL: skipShelterCine'); sys.exit(1)
new_skip = (
"function skipShelterCine() {\n"
"  if (!SHEL) return;\n"
"  SFX.click();\n"
"  if (SHEL.kind === 'arrive') { shelterArrivalDone(); return; }\n"
"  if (SHEL.phase === 'tbc') return;\n"
"  shelterHardReset();\n"
"  startTbcScreen();\n"
"}\n")
src = skip_pat.sub(lambda m: new_skip, src, count=1)

# ---- ۲) حذف SHEL_DLGS/SHEL_DLGS2/SHEL_SUBS ----
pat = re.compile(r'/\* گفتگوی داخل پناهگاه[^\n]*\n.*?const SHEL_SUBS = \{.*?\n\};\n', re.S)
if not pat.search(src): print('FAIL: SHEL_DLGS block'); sys.exit(1)
src = pat.sub('', src, count=1)

# ---- ۳) updateShelterCine جدید ----
pat2 = re.compile(r'function updateShelterCine\(dt\) \{.*?\n\}\n\nfunction setTimedShelterSubs', re.S)
if not pat2.search(src): print('FAIL: updateShelterCine'); sys.exit(1)

NEW_UPD = r'''function updateShelterCine(dt) {
  if (!SHEL) return;
  SHEL.t += dt;
  DLG.update(dt);
  state.shake = Math.max(0, state.shake - dt * 22);
  state.flash = Math.max(0, state.flash - dt * 2.2);
  updateParticles(dt);
  updateTexts(dt);
  if (SHEL.subT > 0) SHEL.subT -= dt;
  const ph = SHEL.phase;

  if (ph === 'walk') {
    /* (22.0) arrival: narrator + seeing the shelter */
    if (!SHEL.dlgStarted && SHEL.t > 0.8) {
      SHEL.dlgStarted = true;
      const head = (typeof STORY22 !== 'undefined') ? STORY22.shelterArrive.slice(0, 3) : [];
      DLG.start(head, () => { if (SHEL) SHEL.dlgDone = true; });
    }
    if ((SHEL.dlgDone || SHEL.t > 26) && SHEL.t > 3.5) { SHEL.phase = 'gate'; SHEL.t = 0; SFX.csRumble(); }
  } else if (ph === 'gate') {
    if (!SHEL.doorSfx && SHEL.t > 0.3) {
      SHEL.doorSfx = true;
      SFX.csEngine(); state.shake = 5;
    }
    if (SHEL.t > 1.0 && Math.random() < dt * 14) {
      spawnParticles(W * 0.73 + rand(-60, 60), 330 + rand(-30, 30), 1, 'rgba(255,226,168,0.5)',
        { speed: 16, life: 1.6, size: 2.4, grav: -8 });
    }
    if (SHEL.t >= 4.0) { SHEL.phase = 'inside'; SHEL.t = 0; }
  } else if (ph === 'inside') {
    /* (22.0) Dr. Maryam dialogue + final defense prep */
    if (!SHEL.dlgStarted && SHEL.t > 0.8) {
      SHEL.dlgStarted = true;
      const rest = (typeof STORY22 !== 'undefined') ? STORY22.shelterArrive.slice(3) : [];
      DLG.start(rest, () => { if (SHEL) SHEL.dlgDone = true; });
    }
    if (Math.random() < dt * 3) {
      spawnParticles(rand(80, W - 80), 300, 1, 'rgba(255,226,168,0.22)',
        { speed: 6, life: 2.2, size: 2, grav: 6 });
    }
    if ((SHEL.dlgDone || SHEL.t > 40) && SHEL.t > 1.0 && !SHEL.arrivalOver) {
      SHEL.arrivalOver = true;
      shelterArrivalDone();
    }
  } else if (ph === 'ending') {
    /* (22.0) cinematic ending: camera pulls away */
    if (!SHEL.dlgStarted && SHEL.t > 1.2) {
      SHEL.dlgStarted = true;
      const e1 = (typeof STORY22 !== 'undefined') ? STORY22.ending.slice(0, 1) : [];
      DLG.start(e1, () => { if (SHEL) SHEL.dlg1Done = true; });
    }
    if (SHEL.dlg1Done && !SHEL.dlg2Started) {
      SHEL.dlg2Started = true;
      SFX.alarm();
      const rest = (typeof STORY22 !== 'undefined') ? STORY22.ending.slice(1) : [];
      setTimeout(() => { try { if (SHEL && SHEL.phase === 'ending') DLG.start(rest, () => { if (SHEL) SHEL.dlgDone = true; }); } catch (e) {} }, 900);
    }
    if (SHEL.dlgDone && SHEL.t > 2.0) {
      if (!SHEL._fadeT) SHEL._fadeT = SHEL.t;
      SHEL.fade = clamp((SHEL.t - SHEL._fadeT) / 2.4, 0, 1);
      if (SHEL.t >= SHEL._fadeT + 2.6) startTbcScreen();
    }
  } else if (ph === 'tbc') {
    /* typing: «این داستان ادامه دارد...» */
    const full = 'این داستان ادامه دارد...';
    if (SHEL.typed < full.length) {
      SHEL.typeAcc = (SHEL.typeAcc || 0) + dt * 7.5;
      while (SHEL.typeAcc >= 1 && SHEL.typed < full.length) {
        SHEL.typeAcc -= 1;
        SHEL.typed++;
        if (SHEL.typed % 3 === 0) SFX.click();
      }
      const el = $('tbcTitle');
      if (el) el.innerHTML = full.slice(0, SHEL.typed) + '<span class="tbccaret">▌</span>';
    } else {
      if (!SHEL.tbcDone) {
        SHEL.tbcDone = true;
        const el = $('tbcTitle');
        if (el) el.textContent = full;
        $('tbcSub').classList.add('on');
        $('tbcTease').classList.add('on');
        $('tbcRow').classList.add('on');
        try { VOICE.speak(full, 'n', 'tbc1n'); } catch (e) {}
        SFX.heartbeat();
      }
      SHEL.teaseT = (SHEL.teaseT || 0) + dt;
      if (SHEL.teaseT > 2.2) { SHEL.teaseT = 0; SFX.heartbeat(); }
    }
  }
}

/* (22.0) end of arrival cine -> ch4 gameplay */
function shelterArrivalDone() {
  shelterHardReset();
  state.mode = 'day';
  enterDay();
  setAnnounce('🗺 فصل چهارم: ' + (typeof curCh !== 'undefined' ? curCh().name : 'آخرین پناهگاه'),
    'موج ' + faNum(waveInChapter(state.wave + 1)) + ' از ' + faNum(wavesInChapter(state.chapter)) + ' در راه است — دیوارها را تقویت کن!', 3.4);
  showChapterCard(state.chapter);
}

function setTimedShelterSubs'''
src = pat2.sub(lambda m: NEW_UPD, src, count=1)

# ---- ۴) startTbcScreen بدون وابستگی به SHEL ----
tbc_pat = re.compile(r'function startTbcScreen\(\) \{\n  if \(!SHEL\) return;\n', re.S)
if not tbc_pat.search(src): print('FAIL: startTbcScreen'); sys.exit(1)
src = tbc_pat.sub(
"function startTbcScreen() {\n"
"  if (!SHEL) {\n"
"    SHEL = { t: 0, phase: 'tbc', kind: 'end', typed: 0, tbcDone: false, fade: 0 };\n"
"    state.mode = 'sheltercine';\n"
"  }\n", src, count=1)

# ---- ۵) توابع شروع جدید ----
NEW_FUNCS = r'''/* (22.0) arrival cinematic — chapter 4 start (before wave 25) */
function startShelterArrival() {
  if (state.mode === 'sheltercine') return;
  SHEL = {
    t: 0, phase: 'walk', kind: 'arrive',
    dlgStarted: false, dlgDone: false, sub: '', subT: 0, typed: 0, tbcDone: false,
  };
  state.mode = 'sheltercine';
  state.mouse.down = false;
  state.placing = null;
  state.slowmo = 0;
  hideOverlays();
  hideDayPanel();
  hidePeddlerPanel();
  hideAnnounce();
  hideChapterCard();
  $('wrap').classList.add('cine-mode');
  $('skipCs').classList.remove('hidden');
  SFX.morning();
}

/* (22.0) cinematic ending — after radio alarm: camera pulls away */
function startEndingCine() {
  if (state.mode === 'sheltercine') return;
  try { wipeSave(); } catch (e) {}
  SHEL = {
    t: 0, phase: 'ending', kind: 'end',
    dlgStarted: false, dlgDone: false, dlg1Done: false, dlg2Started: false,
    typed: 0, tbcDone: false, fade: 0,
  };
  state.mode = 'sheltercine';
  state.mouse.down = false;
  state.placing = null;
  state.slowmo = 0;
  state.dayTarget = 0;
  state.dayness = 0;
  hideOverlays();
  hideDayPanel();
  hidePeddlerPanel();
  hideAnnounce();
  $('wrap').classList.add('cine-mode');
  $('skipCs').classList.remove('hidden');
  SFX.dusk();
}

'''
# anchor: قبل از بلوک «۱۳-۱) شروع کات‌سین پناهگاه»
m = re.search(r'\n(?=/\* -+ ۱۳-۱\)[^\n]*شروع کات‌سین پناهگاه)', src)
if not m:
    m = re.search(r'\n(?=function startShelterCine\(\) \{)', src)
if not m: print('FAIL: arrival anchor'); sys.exit(1)
src = src[:m.start()] + '\n' + NEW_FUNCS + src[m.start()+1:]

# ---- ۶) رندر فاز ending ----
old_render_pat = re.compile(r"  if \(ph === 'walk'\) renderShelterWalk\(t\);\n  else if \(ph === 'gate'\) renderShelterGate\(t\);\n  else if \(ph === 'inside' \|\| ph === 'alarm' \|\| ph === 'tbc'\) renderShelterInside\(t, ph\);")
if not old_render_pat.search(src): print('FAIL: render dispatch'); sys.exit(1)
src = old_render_pat.sub(
"  if (ph === 'walk') renderShelterWalk(t);\n"
"  else if (ph === 'gate') renderShelterGate(t);\n"
"  else if (ph === 'ending') renderShelterEnding(t);\n"
"  else if (ph === 'inside' || ph === 'alarm' || ph === 'tbc') renderShelterInside(t, ph);", src, count=1)

# ---- ۷) renderShelterEnding ----
NEW_RENDER = r'''/* --- (22.0) cinematic ending: night + shelter lights + valley shadows --- */
function renderShelterEnding(t) {
  const k = 1 - clamp(t / 16, 0, 1) * 0.16;
  ctx.save();
  ctx.translate(W / 2, H * 0.56);
  ctx.scale(k, k);
  ctx.translate(-W / 2, -H * 0.56);
  const g = ctx.createLinearGradient(0, -20, 0, GROUND_Y);
  g.addColorStop(0, '#070a18'); g.addColorStop(0.55, '#101430'); g.addColorStop(1, '#1c2340');
  ctx.fillStyle = g; ctx.fillRect(-40, -40, W + 80, GROUND_Y + 60);
  ctx.fillStyle = 'rgba(255,255,255,0.75)';
  for (let i = 0; i < 46; i++) {
    const sx = (i * 197.3) % W, sy = (i * 83.7) % (GROUND_Y * 0.55);
    const tw = 0.55 + 0.45 * Math.sin(t * 1.4 + i * 2.1);
    ctx.globalAlpha = tw * 0.8;
    ctx.fillRect(sx, sy, 1.6, 1.6);
  }
  ctx.globalAlpha = 1;
  const mx = W * 0.16, my = 92;
  const mg = ctx.createRadialGradient(mx, my, 6, mx, my, 84);
  mg.addColorStop(0, 'rgba(220,232,255,0.5)'); mg.addColorStop(1, 'rgba(220,232,255,0)');
  ctx.fillStyle = mg; circle(mx, my, 84);
  ctx.fillStyle = '#dfe8ff'; circle(mx, my, 21);
  ctx.fillStyle = '#b9c6e8'; circle(mx - 6, my - 4, 4); circle(mx + 7, my + 6, 3);
  ctx.fillStyle = '#0c1020';
  ctx.beginPath();
  ctx.moveTo(-40, GROUND_Y - 26);
  for (let x = -40; x <= W + 40; x += 60) {
    ctx.lineTo(x, GROUND_Y - 30 - 26 * Math.sin(x * 0.013) - 14 * Math.cos(x * 0.027));
  }
  ctx.lineTo(W + 40, GROUND_Y + 40); ctx.lineTo(-40, GROUND_Y + 40);
  ctx.closePath(); ctx.fill();
  for (let i = 0; i < 7; i++) {
    const zx = ((t * (5 + i * 1.3) + i * 173) % (W + 160)) - 80;
    const zs = 0.55 + (i % 3) * 0.22;
    const zxc = W - zx;
    const bob = Math.sin(t * 1.6 + i * 1.9) * 2.2;
    ctx.fillStyle = 'rgba(4,6,12,0.92)';
    ctx.beginPath();
    ctx.ellipse(zxc * 0.5 + zx * 0.5, GROUND_Y - 20 + bob, 13 * zs, 24 * zs, 0, 0, Math.PI * 2);
    ctx.fill();
    circle(zxc * 0.5 + zx * 0.5, GROUND_Y - 38 * zs + bob, 6.5 * zs);
  }
  ctx.fillStyle = '#141a2b'; ctx.fillRect(-40, GROUND_Y, W + 80, H - GROUND_Y + 40);
  const bx = W * 0.60, bw = 210, bh = 128, by = GROUND_Y - bh;
  const wg = ctx.createRadialGradient(bx + bw / 2, by + bh * 0.45, 12, bx + bw / 2, by + bh * 0.45, 170);
  wg.addColorStop(0, 'rgba(255,196,110,0.30)'); wg.addColorStop(1, 'rgba(255,196,110,0)');
  ctx.fillStyle = wg; circle(bx + bw / 2, by + bh * 0.45, 170);
  const bg2 = ctx.createLinearGradient(0, by, 0, GROUND_Y);
  bg2.addColorStop(0, '#2a3350'); bg2.addColorStop(1, '#171d33');
  ctx.fillStyle = bg2; rr(bx, by, bw, bh, 6); ctx.fill();
  ctx.strokeStyle = '#0a0e1c'; ctx.lineWidth = 3; rr(bx, by, bw, bh, 6); ctx.stroke();
  ctx.strokeStyle = '#3d4a6e'; ctx.lineWidth = 5;
  for (let i = 0; i < 4; i++) {
    const px = bx + 18 + i * ((bw - 36) / 3);
    ctx.beginPath(); ctx.moveTo(px, by + 10); ctx.lineTo(px, GROUND_Y - 4); ctx.stroke();
  }
  ctx.strokeStyle = '#4a5878'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(bx + 6, by + bh * 0.34); ctx.lineTo(bx + bw - 6, by + bh * 0.34); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(bx + 6, by + bh * 0.68); ctx.lineTo(bx + bw - 6, by + bh * 0.68); ctx.stroke();
  const lit = [0, 2, 3];
  for (let i = 0; i < 4; i++) {
    const wx = bx + 20 + i * ((bw - 40) / 3), wy = by + 22 + (i % 2) * 46;
    const on = lit.indexOf(i) >= 0;
    ctx.fillStyle = on ? '#ffc873' : '#10152a';
    rr(wx, wy, 26, 19, 3); ctx.fill();
    if (on) {
      ctx.fillStyle = 'rgba(255,200,115,0.16)';
      rr(wx - 7, wy - 6, 40, 31, 5); ctx.fill();
    }
    ctx.strokeStyle = '#0a0e1c'; ctx.lineWidth = 1.6; rr(wx, wy, 26, 19, 3); ctx.stroke();
  }
  ctx.fillStyle = '#1a2440'; rr(bx + bw / 2 - 17, GROUND_Y - 40, 34, 40, 4); ctx.fill();
  ctx.strokeStyle = '#0a0e1c'; ctx.lineWidth = 2; rr(bx + bw / 2 - 17, GROUND_Y - 40, 34, 40, 4); ctx.stroke();
  const blink = Math.sin(t * 3.2) > -0.2;
  ctx.fillStyle = blink ? '#7be389' : '#2c4a34'; circle(bx + bw / 2 + 10, GROUND_Y - 33, 2.6);
  const red = 0.5 + 0.5 * Math.sin(t * 4.4);
  const rg = ctx.createRadialGradient(bx + bw - 14, by - 8, 2, bx + bw - 14, by - 8, 46);
  rg.addColorStop(0, 'rgba(255,70,50,' + (0.4 * red).toFixed(2) + ')');
  rg.addColorStop(1, 'rgba(255,70,50,0)');
  ctx.fillStyle = rg; circle(bx + bw - 14, by - 8, 46);
  ctx.fillStyle = '#c8362a'; circle(bx + bw - 14, by - 8, 4.5);
  drawEndingFigure(bx - 34, GROUND_Y, 1, t);
  drawEndingFigure(bx - 58, GROUND_Y + 2, 0.94, t + 1.1);
  ctx.restore();
  if (SHEL.fade > 0.003) {
    ctx.fillStyle = 'rgba(0,0,0,' + SHEL.fade.toFixed(3) + ')';
    ctx.fillRect(0, 0, W, H);
  }
}

function drawEndingFigure(x, y, s, t) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  const breathe = Math.sin(t * 1.3) * 1.1;
  ctx.fillStyle = 'rgba(10,14,26,0.95)';
  rr(-5, -16, 4, 16, 2); ctx.fill();
  rr(1, -16, 4, 16, 2); ctx.fill();
  rr(-7, -38, 14, 24, 5); ctx.fill();
  circle(0, -44 + breathe * 0.3, 6);
  const lg = ctx.createRadialGradient(11, -6, 1, 11, -6, 26);
  lg.addColorStop(0, 'rgba(255,190,110,0.35)'); lg.addColorStop(1, 'rgba(255,190,110,0)');
  ctx.fillStyle = lg; circle(11, -6, 26);
  ctx.fillStyle = '#ffbe6e'; circle(11, -6, 2.4);
  ctx.restore();
}

'''
render_anchor_pat = re.compile(r'/\* -+ صحنه‌ی ۱: پیاده‌روی سحرگاهی تا پناهگاه -+ \*/')
if not render_anchor_pat.search(src):
    render_anchor_pat = re.compile(r'function renderShelterWalk\(t\) \{')
if not render_anchor_pat.search(src): print('FAIL: render anchor'); sys.exit(1)
src = render_anchor_pat.sub(lambda m: NEW_RENDER + m.group(0), src, count=1)

# ---- ۸) دکمه‌ی «شروع دوباره» ----
btn_pat = re.compile(r"(  const tc = \$\('tbcContinue'\);\n  if \(tc\) tc\.addEventListener\('click', tbcContinueToMenu\);)")
if not btn_pat.search(src): print('FAIL: tbc buttons'); sys.exit(1)
src = btn_pat.sub(r"\1\n  const tr = $('tbcRestart');\n  if (tr) tr.addEventListener('click', () => { SFX.click(); shelterHardReset(); startGame(); });", src, count=1)

# ---- ۹) خروجی دیباگ ----
src = re.sub(r"startShelterCine, skipShelterCine, startTbcScreen,",
             "startShelterCine, startShelterArrival, startEndingCine, skipShelterCine, startTbcScreen,", src, count=1)

open(F, 'w', encoding='utf-8').write(src)
print('OK: v4_shelter.js patched')
