#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Create GitHub Release v21.4 + upload APK & HTML assets (API-only, fast)."""
import json, urllib.request, os

TOKEN = 'REMOVED-rotate-key'
REPO = 'sahandmarami/three-floors-to-death'
TAG = 'v21.4'

NOTES = """## چه چیزی تازه است؟

🎙 **بازسازی کامل صداگذاری با ElevenLabs** — هر ۶۳ کلیپ گفتار از نو با مدل eleven_v3 ساخته شد؛ هفت صدای متمایز و جذاب برای شخصیت‌ها: راوی (Adam)، ارشان (Liam)، بازیکن (Eric)، رادیو (Daniel)، نگهبان (Roger)، دستفروش مرموز (Charlie) و دکتر مریم (Sarah). صحت تلفظ فارسیِ صداها با تست خودکار بازخوانی (ASR) تأیید شد.

📐 **W واکنش‌گرا — رفع ریشه‌ای «صفحه کوچک/نوار سیاه»**: اگر اندروید لحظه‌ی بارگذاری ابعاد نابالغ بدهد، بازی در منو دنیا را با مستطیل واقعی گوشی بازمی‌سازد؛ برج، تپه‌ها، افق شهر و چراغ‌ها دوباره هم‌تراز می‌شوند.

🎨 **منوی اصلی بازطراحی شد** — تیتر تمیز و آرام، دکمه‌های هم‌عرض و منظم، فاصله‌گذاری یکنواخت.

🖋 **متن‌های HUD دیگر له یا بریده نمی‌شوند** (رفع «باقی‌م...») و دکمه‌ی «رد کردن» فاصله‌ی امن از لبه گرفت.

📦 حجم بازی ~۴۰۰KB سبک‌تر شد.

**نصب:** `three-floors-to-death.apk` را بگیرید — روی نسخه‌ی قبلی به‌روزرسانی می‌شود (همان امضا)."""

def api(url, data=None, method=None, ctype='application/json', raw=None):
    req = urllib.request.Request(url, headers={'Authorization': f'token {TOKEN}'})
    if method:
        req.get_method = lambda: method
    if raw is not None:
        req.data = raw
        req.add_header('Content-Type', ctype)
    elif data is not None:
        req.data = json.dumps(data).encode()
        req.add_header('Content-Type', ctype)
    with urllib.request.urlopen(req, timeout=120) as r:
        return r.read()

def gh_json(path):
    return json.load(urllib.request.urlopen(urllib.request.Request(
        f'https://api.github.com{path}', headers={'Authorization': f'token {TOKEN}'}), timeout=60))

# 1) tag on current HEAD sha
sha = gh_json(f'/repos/{REPO}/commits/main')['sha']
tag = {'tag_name': TAG, 'object': sha, 'type': 'commit', 'message': 'نسخه‌ی ۲۱٫۴'}
req = urllib.request.Request(f'https://api.github.com/repos/{REPO}/git/tags',
                             data=json.dumps(tag).encode(),
                             headers={'Authorization': f'token {TOKEN}', 'Content-Type': 'application/json'})
try:
    urllib.request.urlopen(req, timeout=60).read()
except Exception as e:
    print('tag exists?', str(e)[:80])

# 2) create release
rel = {'tag_name': TAG, 'name': 'نسخه‌ی ۲۱٫۴ — صداگذاری الون‌لبز + رفع ریشه‌ای نمایش اندروید + منوی تازه',
       'body': NOTES, 'draft': False, 'prerelease': False, 'target_commitish': 'main'}
req = urllib.request.Request(f'https://api.github.com/repos/{REPO}/releases',
                             data=json.dumps(rel).encode(),
                             headers={'Authorization': f'token {TOKEN}', 'Content-Type': 'application/json'})
try:
    body = urllib.request.urlopen(req, timeout=60).read()
    rid = json.loads(body)['id']
    print('release id:', rid)
except urllib.error.HTTPError as e:
    d = json.loads(e.read())
    rid = None
    if d.get('errors') and 'already_exists' in str(d):
        r2 = gh_json(f'/repos/{REPO}/releases/tags/{TAG}')
        rid = r2['id']
        print('existing release:', rid)
    else:
        raise

# 3) upload assets
for path, name, ctype in [
    ('/home/z/my-project/download/three-floors-to-survival.apk', 'three-floors-to-death.apk', 'application/vnd.android.package-archive'),
    ('/home/z/my-project/download/three-floors-to-survival.html', 'three-floors-to-death.html', 'text/html'),
]:
    req = urllib.request.Request(
        f'https://uploads.github.com/repos/{REPO}/releases/{rid}/assets?name={name}',
        data=open(path, 'rb').read(),
        headers={'Authorization': f'token {TOKEN}', 'Content-Type': ctype})
    with urllib.request.urlopen(req, timeout=300) as r:
        res = json.loads(r.read())
    print('asset:', res.get('name'), res.get('size'))

print(f'RELEASE: https://github.com/{REPO}/releases/tag/{TAG}')
