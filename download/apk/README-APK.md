# 📦 ساخت APK اندروید — «سه طبقه تا بقا»

## ✅ راهِ سریع (۲۱٫۲): APK از پیش ساخته‌شده
فایل **`../three-floors-to-survival.apk`** (۱٫۴MB) از پیش ساخته و امضا شده است —
همان را مستقیم روی گوشی اندرویدی (نسخه‌ی ۷ به بالا) نصب کنید
(اجازه‌ی «نصب از منابع ناشناس» را بدهید). این APK از پوسته‌ی WebView سبکِ
سفارشی ساخته شده (`../../android/`) — بدون نیاز به اندروید استودیو یا گردل.

بازسازیِ آن (بعد از تغییر بازی):
```bash
bash ../../scripts/build_apk.sh   # → download/three-floors-to-survival.apk
```
پیش‌نیاز (یک‌بار): پوشه‌ی `.android-sdk` (cmdline-tools + platform-34 + build-tools 34 + JDK) — همان‌طور که در اسکریپت آمده.

## راهِ کپاسیتوری (قدیمی — همچنان معتبر)
این پوشه همه‌ی چیزهایی را دارد که برای تبدیل بازی به اپلیکیشن اندرویدی (فایل APK) لازم است.
بازی از قبل برای APK آماده شده است: `viewport-fit=cover`، حاشیه‌های امن (ناچ)، دکمه‌ی
بازگشت اندروید (توقف/ادامه‌ی بازی)، جلوگیری از pull-to-refresh و حالت تمام‌صفحه.

## محتویات
```
apk/
├── www/index.html            ← خود بازی (تک‌فایل — همان نسخه‌ی ۲۰٫۰)
├── capacitor.config.json     ← پیکربندی کپاسیتور (نام/شناسه‌ی اپ)
├── README-APK.md             ← همین راهنما
└── icon.png                  ← آیکون پیشنهادی اپ (اختیاری — می‌توانی عوضش کنی)
```

## پیش‌نیازها (یک‌بار روی کامپیوتر)
1. **Node.js** (نسخه ۱۸ یا بالاتر) — از nodejs.org
2. **Android Studio** — از developer.android.com (SDK اندروید را همراهش نصب کن)
3. **JDK 17** — همراه Android Studio نصب می‌شود

## مراحل ساخت (۵ قدم — در خط فرمان/ترمینال)

```bash
# ۱) یک پوشه‌ی خالی بساز و واردش شو
mkdir ttb-apk && cd ttb-apk

# ۲) کپاسیتور را نصب کن
npm init -y
npm install @capacitor/core @capacitor/cli @capacitor/android

# ۳) بازی را داخلش بگذار
#    (پوشه‌ی apk این پروژه را کنارِ ttb-apk کپی کن، بعد:)
mkdir www
cp ../apk/www/index.html www/

# ۴) پروژه‌ی اندروید را بساز
npx cap init "سه طبقه تا بقا" io.spacez.threefloors --web-dir=www
npx cap add android

# ۵) همگام‌سازی و ساخت APK
npx cap sync android
cd android
./gradlew assembleDebug
```

✅ فایل APK این‌جا ساخته می‌شود:
```
android/app/build/outputs/apk/debug/app-debug.apk
```
همین فایل را به گوشی منتقل کن و نصب کن (اجازه‌ی «نصب از منابع ناشناس» را بده).

## نسخه‌ی انتشار (Release) برای فروشگاه
```bash
cd android
./gradlew assembleRelease
```
(برای امضا باید keystore بسازی — راهنمای رسمی: developer.android.com/studio/publish)

## نکته‌ها
- **آیکون**: فایل `android/app/src/main/res/mipmap-*/ic_launcher.png` را با آیکون
  خودت جایگزین کن (اندازه‌های 48/72/96/144/192).
- **نام اپ فارسی** در `android/app/src/main/res/values/strings.xml` تنظیم می‌شود.
- **افقی بازی کن**: بازی برای صفحه‌ی افقی طراحی شده؛ اگر خواستی اپ فقط افقی بماند در
  `android/app/src/main/AndroidManifest.xml` به activity اضافه کن:
  `android:screenOrientation="sensorLandscape"`
- **بدون اینترنت**: بازی کاملاً آفلاین است — هیچ دسترسی‌ای نمی‌خواهد.
- **به‌روزرسانی بازی**: فقط `www/index.html` را با نسخه‌ی تازه عوض کن و
  `npx cap sync android` را دوباره بزن.

## مشکلات رایج
| مشکل | راه‌حل |
|---|---|
| `gradlew` اجازه ندارد | `chmod +x gradlew` |
| SDK پیدا نمی‌شود | Android Studio → SDK Manager → نصب API 34 |
| صفحه‌ی سفید | `npx cap sync android` را فراموش نکن و اپ را دوباره بساز |
