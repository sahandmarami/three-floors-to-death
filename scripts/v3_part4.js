/* ==================================================================
   سه طبقه تا بقا — نسخه‌ی ۳٫۰ — منطق بازی (بخش ۳)
     ۱۵) رابط کاربری (HUD / نوار سلاح / نوار باس / پنل ساخت‌وساز زنده)
     ۱۶) حلقه اصلی و راه‌اندازی + رابط دیباگ/تست
   تازه‌های ۳٫۰ در این بخش:
     - پنل ساخت‌وساز زنده‌ی کنار نقشه (به‌جای فروشگاه تمام‌صفحه):
       خرید در هر لحظه‌ی بازی با کلیک یا کلیدهای ۴ تا ۹؛ B پنل را جمع/باز می‌کند
     - HUD با شمارش زامبی‌های باقی‌مانده‌ی موج
     - اسلوموشن سینمایی در پایان موج و مرگ پادشاه
   ================================================================== */

/* ---------------------- ۱۵) رابط کاربری ---------------------- */
function showScreen(id) { $(id).classList.remove('hidden'); }
function hideScreen(id) { $(id).classList.add('hidden'); }
function hideOverlays() {
  ['startScreen', 'howtoScreen', 'pauseScreen', 'gameoverScreen', 'victoryScreen']
    .forEach(hideScreen);
}

function pauseGame() {
  if (!canPlay()) return;
  state.prevMode = state.mode; state.mode = 'paused';
  showScreen('pauseScreen');
  $('btnPause').textContent = '▶ ادامه';
}
function resumeGame() {
  if (state.mode !== 'paused') return;
  state.mode = state.prevMode || 'playing';
  hideScreen('pauseScreen');
  $('btnPause').textContent = '⏸ توقف';
}

/* قطع/وصل صدا — همه‌ی دکمه‌های صدا هم‌زمان به‌روز می‌شوند */
function toggleSound() {
  Snd.init();
  const m = Snd.toggleMute();
  $('btnMute').textContent = m ? '🔇' : '🔊';
  $('btnMute0').textContent = m ? '🔇' : '🔊';
  $('btnMute2').textContent = m ? '🔇 صدا خاموش' : '🔊 صدا روشن';
  if (!m) SFX.click();
}

/* ---------- پنل ساخت‌وساز زنده (۳٫۰) ----------
   تعریف ۶ آیتم پنل: ترتیب = ترتیب کلیدهای ۴ تا ۹ */
const BUILD_DEFS = [
  { kind: 'weapon',  icon: '🎯', name: 'ارتقای اسلحه', desc: 'قدرت گلوله‌ی همه‌ی سلاح‌ها بالا می‌رود' },
  { kind: 'health',  icon: '🧱', name: 'جون برج',     desc: '۳۰+ به حداکثر جون برج (و همین‌جا ترمیم می‌شود)' },
  { kind: 'repair',  icon: '🧰', name: 'تعمیر برج',   desc: '۵۰٪ جون برج را همان‌جا برمی‌گرداند' },
  { kind: 'trap',    icon: '⚡', name: 'تله پایه',    desc: 'آسیب خودکار به زامبی‌های نزدیک برج' },
  { kind: 'shotgun', icon: '💥', name: 'شاتگان',      desc: '۶ ساچمه با پراکندگی کشنده — بعد از خرید کلید ۲' },
  { kind: 'mg',      icon: '🌪', name: 'مسلسل',       desc: 'نگه‌دار و ببار؛ نرخ شلیک خیلی بالا — بعد از خرید کلید ۳' },
];

/* ساخت یک‌بارِ آیتم‌های پنل در شروع صفحه */
function buildPanelInit() {
  const list = $('bpList');
  BUILD_DEFS.forEach((d, i) => {
    const el = document.createElement('div');
    el.className = 'bp-item';
    el.id = 'bp-' + d.kind;
    el.title = d.desc;
    el.innerHTML =
      '<span class="bp-key">' + faNum(i + 4) + '</span>' +
      '<span class="bp-icon">' + d.icon + '</span>' +
      '<span class="bp-mid"><b>' + d.name + '</b><i id="bp-' + d.kind + '-sub"></i></span>' +
      '<span class="bp-cost" id="bp-' + d.kind + '-cost"></span>';
    el.addEventListener('click', () => attemptBuy(d.kind));
    list.appendChild(el);
  });
  /* کلیک روی سربرگ = جمع/باز کردن پنل */
  $('bpHead').addEventListener('click', toggleBuildPanel);
}

function toggleBuildPanel() {
  const p = $('buildPanel');
  p.classList.toggle('collapsed');
  $('bpChev').textContent = p.classList.contains('collapsed') ? '▸' : '▾';
  SFX.click();
}

/* به‌روزرسانی وضعیت آیتم‌های پنل (قیمت/سطح/قابلیت خرید) */
function refreshBuildPanel() {
  for (const d of BUILD_DEFS) {
    const item = $('bp-' + d.kind);
    if (!item) continue;
    const sub = $('bp-' + d.kind + '-sub');
    const cost = $('bp-' + d.kind + '-cost');
    item.classList.remove('deny');

    /* --- سلاح‌های یک‌بار خرید --- */
    if (d.kind === 'shotgun' || d.kind === 'mg') {
      const owned = WEAPONS[d.kind].owned;
      item.classList.toggle('max', owned);
      if (owned) { sub.textContent = 'خریده شد ✅'; cost.textContent = '—'; item.classList.remove('poor'); }
      else {
        const price = UPGRADES[d.kind].price;
        sub.textContent = 'قفل — کلید ' + faNum(d.kind === 'shotgun' ? 2 : 3);
        cost.textContent = faNum(price);
        item.classList.toggle('poor', state.coins < price);
      }
      continue;
    }

    /* --- تعمیر سریع --- */
    if (d.kind === 'repair') {
      const full = state.tower.hp >= state.tower.maxHp - 0.5;
      item.classList.toggle('max', full);
      sub.textContent = full ? 'سرِ سلامتی' : 'جون: ' + faNum(Math.ceil(state.tower.hp)) + '/' + faNum(state.tower.maxHp);
      if (full) { cost.textContent = '—'; item.classList.remove('poor'); }
      else {
        cost.textContent = faNum(UPGRADES.repair.price);
        item.classList.toggle('poor', state.coins < UPGRADES.repair.price);
      }
      continue;
    }

    /* --- ارتقاهای سطح‌دار (اسلحه/جون/تله) --- */
    const u = UPGRADES[d.kind], lvl = state.upgrades[d.kind];
    const maxed = lvl >= u.max;
    item.classList.toggle('max', maxed);
    if (maxed) {
      sub.textContent = 'حداکثر ✅';
      cost.textContent = '—';
      item.classList.remove('poor');
    } else {
      sub.textContent = 'سطح ' + faNum(lvl) + '/' + faNum(u.max) +
        (d.kind === 'trap' && lvl > 0 ? ' • ' + faNum(trapDps(lvl)) + ' دمیج/ث' : '');
      const price = priceOf(d.kind);
      cost.textContent = faNum(price);
      item.classList.toggle('poor', state.coins < price);
    }
  }
}

/* به‌روزرسانی HUD (نوار جون، سکه، موج + باقی‌مانده‌ی موج) + نوار سلاح + پنل ساخت */
function updateHUD() {
  const t = state.tower, ratio = t.hp / t.maxHp;
  const fill = $('healthFill');
  fill.style.width = (ratio * 100).toFixed(1) + '%';
  fill.className = ratio > 0.5 ? '' : (ratio > 0.25 ? 'mid' : 'low');
  $('healthText').textContent = faNum(Math.ceil(t.hp)) + '/' + faNum(t.maxHp);
  $('coinText').textContent = faNum(state.coins);
  if (state.mode === 'playing') {
    const rem = state.spawn.queue.length + state.zombies.filter(z => !z.dead).length;
    $('waveText').textContent = 'موج ' + faNum(clamp(state.wave, 1, TOTAL_WAVES)) + '/' + faNum(TOTAL_WAVES) + ' • ' + faNum(rem) + ' باقی';
  } else {
    $('waveText').textContent = 'موج ' + faNum(clamp(state.wave, 1, TOTAL_WAVES)) + '/' + faNum(TOTAL_WAVES);
  }
  refreshWeaponBar();
  refreshBuildPanel();
}

/* نوار سلاح: هایلایتِ سلاح فعال + قفل/قیمتِ سلاح‌های نخریده */
function refreshWeaponBar() {
  document.querySelectorAll('#weaponBar .wslot').forEach(el => {
    const id = el.dataset.w;
    el.classList.toggle('active', state.weapon === id && WEAPONS[id].owned);
    const locked = !WEAPONS[id].owned;
    el.classList.toggle('locked', locked);
    const info = el.querySelector('.wlockinfo');
    if (info) info.style.display = locked ? 'flex' : 'none';
  });
}

/* نوار جون پادشاه زامبی‌ها (فقط وقتی زنده است نمایش داده می‌شود) */
let bossBarVisible = false;
function updateBossBar() {
  const boss = state.zombies.find(z => z.type === 'boss' && !z.dead);
  const el = $('bossBar');
  if (boss) {
    el.style.display = 'block';
    $('bossFill').style.width = (clamp(boss.hp / boss.maxHp, 0, 1) * 100).toFixed(1) + '%';
    bossBarVisible = true;
  } else if (bossBarVisible) {
    el.style.display = 'none';
    bossBarVisible = false;
  }
}

/* ---------------------- ۱۶) حلقه اصلی و راه‌اندازی ---------------------- */
let last = performance.now();
function frame(now) {
  const dt = Math.min((now - last) / 1000, 0.05); // سقف dt برای جلوگیری از پرش فیزیک
  last = now;
  animTime += dt;                                // زمان نمایشی همیشه جلو می‌رود

  /* اسلوموشن سینمایی (۳٫۰): زمان بازی کند می‌شود ولی رندر عادی می‌ماند */
  let dtG = dt;
  if (state.slowmo > 0) {
    dtG = dt * 0.3;
    state.slowmo = Math.max(0, state.slowmo - dt);
  }

  if (state.mode === 'playing' || state.mode === 'intermission') update(dtG);
  else if (state.mode === 'gameover' || state.mode === 'victory') updateFx(dtG);
  else if (state.mode === 'start') updateMenuScene(dtG);
  /* حالت paused: هیچ آپدیتی نمی‌شود (انجماد کامل) */

  /* جلوه‌های محیطی (شهاب و رعدوبرق) در همه‌ی حالت‌ها جریان دارند */
  updateShootingStar(dt);
  updateLightning(dt);
  render();
  requestAnimationFrame(frame);
}

function init() {
  /* اتصال دکمه‌های منو و اورلی‌ها */
  $('btnStart').addEventListener('click', startGame);
  $('btnHowto').addEventListener('click', () => { SFX.click(); showScreen('howtoScreen'); });
  $('closeHowto').addEventListener('click', () => { SFX.click(); hideScreen('howtoScreen'); });
  $('btnMute0').addEventListener('click', toggleSound);
  $('btnMute').addEventListener('click', toggleSound);
  $('btnMute2').addEventListener('click', toggleSound);
  $('btnPause').addEventListener('click', () => {
    if (state.mode === 'paused') resumeGame(); else pauseGame();
  });
  $('btnResume').addEventListener('click', resumeGame);
  $('btnRestart0').addEventListener('click', startGame);
  $('btnRestart1').addEventListener('click', startGame);
  $('btnRestart2').addEventListener('click', startGame);

  /* کلیک روی اسلات‌های نوار سلاح */
  document.querySelectorAll('#weaponBar .wslot').forEach(el => {
    el.addEventListener('click', () => selectWeapon(el.dataset.w));
  });

  buildPanelInit();    // پنل ساخت‌وساز زنده‌ی کنار نقشه
  initMenuZ();         // زامبی‌های تزئینیِ صحنه‌ی منو
  updateHUD();
  requestAnimationFrame(frame);
}
init();

/* رابط اشکال‌زدایی/تست خودکار — برای توسعه‌های بعدی در دسترس است */
window.GAME = {
  state, startGame, startWave, spawnZombie, damageTower, selectWeapon, WEAPONS, ZTYPES, WAVES,
  giveCoins(n) { state.coins += n; updateHUD(); },
  spawnType(type) { spawnZombie(type); },
  hurt(n) { damageTower(n, TOWER.x + 10); },
  hurtBoss(n) {
    const b = state.zombies.find(z => z.type === 'boss' && !z.dead);
    if (b) { b.hp -= n; if (b.hp <= 0) killZombie(b); }
  },
  /* انداختن دستی جعبه‌ی قدرت (برای تست) */
  dropPower(type) { spawnPowerupObj(type || pickPowerType(), TOWER.x - 130, GROUND_Y - 60); },
  /* پرش سریع به موج n (برای تست) */
  skipToWave(n) {
    n = clamp(n, 1, TOTAL_WAVES);
    state.zombies = []; state.bullets = []; state.coinsArr = [];
    state.wave = n - 1;
    state.spawn = { queue: [], timer: 0, interval: 1, bossDelay: false };
    if (state.mode === 'playing') waveComplete();
    else if (!['start', 'gameover', 'victory', 'paused'].includes(state.mode)) {
      state.mode = 'intermission'; state.intermission = 0.3;
    }
  },
  /* شبیه‌سازی برد (برای تست) — از هر حالتی کار می‌کند */
  win() {
    state.wave = TOTAL_WAVES;
    state.spawn = { queue: [], timer: 0, interval: 1, bossDelay: false };
    state.zombies = []; state.bullets = [];
    state.mode = 'playing';          // حتی از وقفه هم برد شبیه‌سازی شود
    waveComplete();
  },
};
</script>
</body>
</html>
