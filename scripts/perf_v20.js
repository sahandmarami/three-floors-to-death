// سنجش سریع FPS صحنه‌های تازه‌ی ۲۰٫۰ — برجک ویژه/پناهگاه/فروشنده/باس
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const pg = await b.newPage({ viewport: { width: 1100, height: 640 } });
  const errs = [];
  pg.on('pageerror', e => errs.push(e.message));
  await pg.goto('file:///home/z/my-project/download/three-floors-to-survival.html');
  await pg.waitForTimeout(3000);
  const ev = async (js) => (await pg.evaluate(js).catch(e => 'ERR:' + e.message));
  const fps = async (label, secs = 3) => {
    await pg.evaluate(`window.__f=0;window.__ft=performance.now();'ok'`);
    await pg.waitForTimeout(secs * 1000);
    const r = await pg.evaluate(`(()=>{const dt=(performance.now()-window.__ft)/1000;return (window.__f/dt).toFixed(1)})()`);
    console.log(label + ' → ' + r + ' fps');
    return parseFloat(r);
  };
  await pg.evaluate(`(function(){const raf=window.requestAnimationFrame;window.requestAnimationFrame=function(cb){window.__f=(window.__f||0)+1;return raf(cb)}}(),'ok')`);
  // ۱) شب با سه برجک ویژه + زامبی‌ها
  await pg.evaluate(`GAME.v10.wipeSave();GAME.v10.startNewGame();GAME.v10.skipIntro();'ok'`);
  await pg.waitForTimeout(1500);
  await pg.evaluate(`GAME.skipToWave(20);GAME.v20.setBP('tesla');GAME.v20.setBP('missile');GAME.v20.setBP('flame');GAME.placeTurret('tesla',240,GROUND_Y+6);GAME.placeTurret('missile',700,GROUND_Y+6);GAME.placeTurret('flame',180,GROUND_Y+6);'ok'`);
  await pg.waitForTimeout(2500);
  await fps('شب فصل۳ + تسلا/موشک/شعله فعال');
  // ۲) باس + یورش
  await pg.evaluate(`GAME.skipToWave(36);'ok'`);
  await pg.waitForTimeout(2500);
  await fps('شب آخر (باس ۷۰۰۰)');
  // ۳) داخل پناهگاه
  await pg.evaluate(`GAME.v19.startShelterCine();GAME.v19.shelterGoto('inside',2);'ok'`);
  await pg.waitForTimeout(1200);
  await fps('داخل پناهگاه (پرسپکتیو)');
  // ۴) شب تاریک فصل ۲ (کم‌کیفیت شبیه‌سازی)
  await pg.evaluate(`GAME.v19.skipShelterCine&&GAME.v19.skipShelterCine();GAME.skipToWave(9);'ok'`);
  await pg.waitForTimeout(2500);
  await fps('شب تاریک فصل ۲');
  // ۵) رانندگی با امتیاز/کمبو
  await pg.evaluate(`GAME.endWave();GAME.v10.trGoto(8.5);'ok'`);
  await pg.waitForTimeout(1500);
  await pg.evaluate(`GAME.v10.trResume();'ok'`);
  await pg.waitForTimeout(1200);
  await fps('رانندگی + HUD امتیاز');
  console.log('خطاهای صفحه: ' + (errs.length ? JSON.stringify(errs).slice(0, 400) : 'صفر'));
  await b.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
