/* ==================================================================
   سه طبقه تا بقا — نسخه‌ی کامل ۲٫۰ — منطق بازی (بخش ۳)
     ۱۵) رابط کاربری (HUD / نوار سلاح / نوار باس / فروشگاه / اورلی‌ها)
     ۱۶) حلقه اصلی و راه‌اندازی + رابط دیباگ/تست
   ================================================================== */

/* ---------------------- ۱۵) رابط کاربری ---------------------- */
function showScreen(id) { $(id).classList.remove('hidden'); }
function hideScreen(id) { $(id).classList.add('hidden'); }
function hideOverlays() {
  ['startScreen', 'howtoScreen', 'shopScreen', 'pauseScreen', 'gameoverScreen', 'victoryScreen']
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
function openShop() {
  if (!canPlay()) return;
  state.prevMode = state.mode; state.mode = 'shop';
  refreshShop();
  showScreen('shopScreen');
}
function closeShop() {
  if (state.mode !== 'shop') return;
  state.mode = state.prevMode || 'playing';
  hideScreen('shopScreen');
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

/* به‌روزرسانی HUD (نوار جون، سکه، موج) + نوار سلاح */
function updateHUD() {
  const t = state.tower, ratio = t.hp / t.maxHp;
  const fill = $('healthFill');
  fill.style.width = (ratio * 100).toFixed(1) + '%';
  fill.className = ratio > 0.5 ? '' : (ratio > 0.25 ? 'mid' : 'low');
  $('healthText').textContent = faNum(Math.ceil(t.hp)) + '/' + faNum(t.maxHp);
  $('coinText').textContent = faNum(state.coins);
  $('waveText').textContent = 'موج ' + faNum(clamp(state.wave, 1, TOTAL_WAVES)) + '/' + faNum(TOTAL_WAVES);
  refreshWeaponBar();
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

/* به‌روزرسانی کارت‌های منوی ساخت‌وساز (۶ کارت) */
function setBuyBtn(btnId, kind) {
  const btn = $(btnId), u = UPGRADES[kind], lvl = state.upgrades[kind];
  if (lvl >= u.max) { btn.disabled = true; btn.textContent = 'حداکثر ✅'; return; }
  const price = priceOf(kind);
  btn.disabled = state.coins < price;
  btn.textContent = 'خرید — ' + faNum(price) + ' 💰';
}
function setWeaponBtn(btnId, kind) {
  const btn = $(btnId);
  if (WEAPONS[kind].owned) { btn.disabled = true; btn.textContent = 'خریده شد ✅'; return; }
  btn.disabled = state.coins < UPGRADES[kind].price;
  btn.textContent = 'خرید — ' + faNum(UPGRADES[kind].price) + ' 💰';
}
function refreshShop() {
  $('shopCoins').textContent = faNum(state.coins);
  const w = state.upgrades.weapon, h = state.upgrades.health, t = state.upgrades.trap;

  /* ارتقای اسلحه */
  const pd = weaponDmg(WEAPONS.pistol);
  $('weaponDesc').textContent = 'آسیب همه‌ی سلاح‌ها بالا می‌ره (تپانچه: ' + faNum(pd) +
    (w < UPGRADES.weapon.max ? ' ← ' + faNum(weaponDmg(WEAPONS.pistol, 1)) : '') + ')';
  $('weaponLvl').textContent = 'سطح ' + faNum(w) + ' از ' + faNum(UPGRADES.weapon.max);
  setBuyBtn('buyWeapon', 'weapon');

  /* شاتگان */
  $('shotgunDesc').textContent = WEAPONS.shotgun.owned
    ? 'آزاد شد — با کلید ۲ انتخابش کن'
    : '۶ ساچمه با پراکندگی کشنده (آسیب هر ساچمه: ' + faNum(weaponDmg(WEAPONS.shotgun)) + ')';
  $('shotgunLvl').textContent = WEAPONS.shotgun.owned ? 'در خدمتِ تو! 🎖' : 'قفل — کلید ۲';
  setWeaponBtn('buyShotgun', 'shotgun');

  /* مسلسل */
  $('mgDesc').textContent = WEAPONS.mg.owned
    ? 'آزاد شد — با کلید ۳ انتخابش کن'
    : 'نگه‌دار و ببار! (آسیب هر گلوله: ' + faNum(weaponDmg(WEAPONS.mg)) + ')';
  $('mgLvl').textContent = WEAPONS.mg.owned ? 'در خدمتِ تو! 🎖' : 'قفل — کلید ۳';
  setWeaponBtn('buyMg', 'mg');

  /* جون برج */
  $('healthDesc').textContent = 'حداکثر جون: ' + faNum(state.tower.maxHp) +
    (h < UPGRADES.health.max ? ' ← ' + faNum(state.tower.maxHp + UPGRADES.health.bonus) + ' (+' + faNum(UPGRADES.health.bonus) + ')' : '');
  $('healthLvl').textContent = 'سطح ' + faNum(h) + ' از ' + faNum(UPGRADES.health.max);
  setBuyBtn('buyHealth', 'health');

  /* تعمیر سریع */
  const full = state.tower.hp >= state.tower.maxHp - 0.5;
  const heal = Math.round(state.tower.maxHp * UPGRADES.repair.frac);
  $('repairDesc').textContent = full
    ? 'برج سرِ سلامتیه — فعلاً نیازی نیست'
    : 'جون برج: ' + faNum(Math.ceil(state.tower.hp)) + ' ← ' +
      faNum(Math.min(state.tower.maxHp, Math.ceil(state.tower.hp) + heal));
  const rbtn = $('buyRepair');
  if (full) { rbtn.disabled = true; rbtn.textContent = 'سرِ سلامتی ✅'; }
  else {
    rbtn.disabled = state.coins < UPGRADES.repair.price;
    rbtn.textContent = 'خرید — ' + faNum(UPGRADES.repair.price) + ' 💰';
  }

  /* تله */
  $('trapDesc').textContent = t === 0
    ? 'آسیب خودکار به زامبی‌های نزدیک برج (' + faNum(trapDps(1)) + ' دمیج در ثانیه)'
    : 'آسیب خودکار: ' + faNum(trapDps(t)) + (t < UPGRADES.trap.max ? ' ← ' + faNum(trapDps(t + 1)) : '') + ' در ثانیه';
  $('trapLvl').textContent = 'سطح ' + faNum(t) + ' از ' + faNum(UPGRADES.trap.max);
  setBuyBtn('buyTrap', 'trap');
}

/* ---------------------- ۱۶) حلقه اصلی و راه‌اندازی ---------------------- */
let last = performance.now();
function frame(now) {
  const dt = Math.min((now - last) / 1000, 0.05); // سقف dt برای جلوگیری از پرش فیزیک
  last = now;
  animTime += dt;                                // زمان نمایشی همیشه جلو می‌رود
  if (state.mode === 'playing' || state.mode === 'intermission') update(dt);
  else if (state.mode === 'gameover' || state.mode === 'victory') updateFx(dt);
  else if (state.mode === 'start') updateMenuScene(dt);
  /* حالت‌های paused/shop: هیچ آپدیتی نمی‌شوند (انجماد کامل) */
  updateShootingStar(dt);                        // شهاب در همه‌ی حالت‌ها
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
  $('btnShop').addEventListener('click', openShop);
  $('closeShop').addEventListener('click', closeShop);
  $('btnResume').addEventListener('click', resumeGame);
  $('btnRestart0').addEventListener('click', startGame);
  $('btnRestart1').addEventListener('click', startGame);
  $('btnRestart2').addEventListener('click', startGame);
  $('buyWeapon').addEventListener('click', () => attemptBuy('weapon'));
  $('buyShotgun').addEventListener('click', () => attemptBuy('shotgun'));
  $('buyMg').addEventListener('click', () => attemptBuy('mg'));
  $('buyHealth').addEventListener('click', () => attemptBuy('health'));
  $('buyRepair').addEventListener('click', () => attemptBuy('repair'));
  $('buyTrap').addEventListener('click', () => attemptBuy('trap'));

  /* کلیک روی اسلات‌های نوار سلاح */
  document.querySelectorAll('#weaponBar .wslot').forEach(el => {
    el.addEventListener('click', () => selectWeapon(el.dataset.w));
  });

  initMenuZ();       // زامبی‌های تزئینیِ صحنه‌ی منو
  updateHUD();
  refreshShop();
  requestAnimationFrame(frame);
}
init();

/* رابط اشکال‌زدایی/تست خودکار — برای توسعه‌های بعدی در دسترس است */
window.GAME = {
  state, startGame, startWave, spawnZombie, damageTower, selectWeapon, WEAPONS, ZTYPES, WAVES,
  giveCoins(n) { state.coins += n; updateHUD(); refreshShop(); },
  spawnType(type) { spawnZombie(type); },
  hurt(n) { damageTower(n, TOWER.x + 10); },
  hurtBoss(n) {
    const b = state.zombies.find(z => z.type === 'boss' && !z.dead);
    if (b) { b.hp -= n; if (b.hp <= 0) killZombie(b); }
  },
  /* پرش سریع به موج n (برای تست) */
  skipToWave(n) {
    n = clamp(n, 1, TOTAL_WAVES);
    state.zombies = []; state.bullets = []; state.coinsArr = [];
    state.wave = n - 1;
    state.spawn = { queue: [], timer: 0, interval: 1, bossDelay: false };
    if (state.mode === 'playing') waveComplete();
    else if (!['start', 'gameover', 'victory', 'paused', 'shop'].includes(state.mode)) {
      state.mode = 'intermission'; state.intermission = 0.3;
    }
  },
  /* شبیه‌سازی برد (برای تست) — از هر حالتی کار می‌کند */
  win() {
    state.wave = TOTAL_WAVES;
    state.spawn = { queue: [], timer: 0, interval: 1, bossDelay: false };
    state.zombies = []; state.bullets = [];
    state.mode = 'playing';          // حتی از وقفه/فروشگاه هم برد شبیه‌سازی شود
    waveComplete();
  },
};
</script>
</body>
</html>
