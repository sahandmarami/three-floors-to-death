#!/usr/bin/env python3
# -*- coding: utf-8 -*-
# release_v33.py — ساخت ریلیر v33.0 با APK + HTML (الگوی release_v214.py)
import json, os, urllib.request

TOKEN = os.environ.get('GH_TOKEN', '')
OWNER, REPO = 'sahandmarami', 'three-floors-to-death'
TAG = 'v33.0'

def api(path, data=None, method=None, headers=None):
    req = urllib.request.Request(
        f'https://api.github.com{path}',
        data=(json.dumps(data).encode() if data else None),
        method=method,
        headers={'Authorization': f'token {TOKEN}', 'Accept': 'application/vnd.github+json',
                 **(headers or {})})
    with urllib.request.urlopen(req, timeout=120) as r:
        body = r.read()
        return json.loads(body) if body else {}

# ۱) ریلیر
notes = """نسخه‌ی ۳۳٫۰ — رفع موارد باقی‌مانده‌ی بازخورد کاربر

🎲 مینی‌گیم فصل اول:
- ماشین دیگر خودش به سمت چپ نمی‌لغزد (فرمانِ کج‌کردن گوشی حذف شد — فرمان فقط با لمس چپ/راست یا کلیدهای جهت‌دار)
- در خودِ مینی‌گیم دیگر دکمه‌ی «رد کردن» وجود ندارد (افتتاحیه و پایان قابل رد شدن باقی‌اند)

🏗️ کات‌سین فروریختن برج — بازسازی منطقی:
- ارشان از بام با پله‌های کناری پایین می‌آید (نه «با ماشین از بیرون می‌آید»)
- ماشین از قبل کنار برج پارک است؛ ارشان آن را روشن می‌کند و زیر برج می‌آورد تا بازیکن از بام روی آن بپرد
- زیرنویس‌ها دیالوگ‌دار و درشت‌تر شدند + صدای ارشان در لحظه‌های درست

📁 پرونده‌ی سرنخ‌ها:
- دکمه‌ی شناور «گوش بسپار» حذف شد → حالا کارت اکشن داخل پرونده است (ریل چپ فقط چراغ‌قوه + مولوتوف — دو دایره‌ی هم‌اندازه)

🔨 ساخت‌وساز:
- نام همه‌ی کاشی‌ها (از جمله تب بقا) همیشه روی کاشی نمایش داده می‌شود

🌙 منوی اصلی:
- پس‌زمینه روشن‌تر شد + زامبی‌های سایه‌ای با چهره‌ی منطقی‌تر (نیم‌رخ، یک چشم، حرکت طبیعی دست‌وپا)

📦 نصب: فایل APK را دانلود و نصب کنید (روی نسخه‌های قبلی به‌روزرسانی می‌شود). فایل HTML برای اجرای مستقیم در مرورگر است."""

rel = api(f'/repos/{OWNER}/{REPO}/releases',
          {'tag_name': TAG, 'name': 'نسخه‌ی ۳۳٫۰ — مینی‌گیم اصلاح‌شده + فروریختن منطقی برج',
           'body': notes})
print('release id:', rel.get('id'), '| url:', rel.get('html_url'))

# ۲) asset ها
def upload(asset_path, name, ctype):
    url = f'https://uploads.github.com/repos/{OWNER}/{REPO}/releases/{rel["id"]}/assets?name={name}'
    data = open(asset_path, 'rb').read()
    req = urllib.request.Request(url, data=data, method='POST',
        headers={'Authorization': f'token {TOKEN}', 'Content-Type': ctype})
    with urllib.request.urlopen(req, timeout=300) as r:
        a = json.loads(r.read())
        print(f'  asset: {a.get("name")} ({a.get("size", 0)/1e6:.1f}MB) → {a.get("browser_download_url")}')

upload('/home/z/my-project/download/three-floors-to-survival.apk', 'three-floors-to-death.apk', 'application/vnd.android.package-archive')
upload('/home/z/my-project/download/three-floors-to-survival.html', 'three-floors-to-death.html', 'text/html')

# ۳) راستی‌آزمایی
for a in api(f'/repos/{OWNER}/{REPO}/releases/tags/{TAG}').get('assets', []):
    print('verify:', a['name'], a['size'], 'bytes, state:', a['state'])
