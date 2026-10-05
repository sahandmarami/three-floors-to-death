package io.spacez.threefloors;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.media.AudioManager;
import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;
import android.webkit.JavascriptInterface;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

/**
 * «سه طبقه تا بقا» — پوسته‌ی اندرویدیِ WebView برای بازیِ تک‌فایلی.
 * (۲۱٫۲) بدون کپاسیتور/کوردوا — APK سبک و مستقل:
 *   • تمام‌صفحه‌ی ایمرسیو + افقی + ناچ (ShortEdges)
 *   • file:///android_asset/www/index.html
 *   • دکمه‌ی بازگشت → رویداد «backbutton» بازی (توقف/ادامه/بستن پنل)؛
 *     خروج از منوی اصلی از طریق ttbNative.exit()
 *   • بازی با نشانه‌ی «wv» در UA حالت درون‌اپ را خودش فعال می‌کند
 * نکته‌ی فنی: هیچ رابطِ جنریک/کلاسِ بی‌نامی ندارد (سازگاری با d8 8.2)
 */
public class MainActivity extends Activity {

    private WebView web;

    /* پلِ خروج — بازی از منوی اصلی صدایش می‌زند */
    public static class JsBridge implements Runnable {
        private final Activity act;
        public JsBridge(Activity act) { this.act = act; }
        @JavascriptInterface
        public void exit() { act.runOnUiThread(this); }
        @Override public void run() { act.finish(); }
    }

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        /* بلندگو رسانه + روشن‌ماندن صفحه */
        setVolumeControlStream(AudioManager.STREAM_MUSIC);
        Window w = getWindow();
        w.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);

        web = new WebView(this);
        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setDatabaseEnabled(true);
        s.setAllowFileAccess(true);
        s.setAllowContentAccess(true);
        s.setLoadWithOverviewMode(true);
        s.setUseWideViewPort(true);
        s.setMediaPlaybackRequiresUserGesture(true);   /* بازی خودش بعد از اولین ژست صدا را باز می‌کند */
        s.setCacheMode(WebSettings.LOAD_NO_CACHE);      /* همیشه نسخه‌ی همراه‌شده */
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            s.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        }
        web.setWebChromeClient(new WebChromeClient());
        web.setWebViewClient(new WebViewClient());
        web.addJavascriptInterface(new JsBridge(this), "ttbNative");
        web.setBackgroundColor(0xFF060910);
        setContentView(web);
        hideBars();

        if (savedInstanceState == null) {
            web.loadUrl("file:///android_asset/www/index.html");
        } else {
            web.restoreState(savedInstanceState);
        }
    }

    @Override
    protected void onResume() {
        super.onResume();
        hideBars();
        web.onResume();
        web.evaluateJavascript(
            "try{if(typeof onApkResume==='function')onApkResume();}catch(e){} void 0;", null);
    }

    @Override
    protected void onPause() {
        web.evaluateJavascript(
            "try{if(typeof onApkPause==='function')onApkPause();}catch(e){} void 0;", null);
        web.onPause();
        super.onPause();
    }

    @Override
    protected void onSaveInstanceState(Bundle out) {
        super.onSaveInstanceState(out);
        web.saveState(out);
    }

    /* دکمه‌ی بازگشت اندروید → رویداد «backbutton» بازی
       (توقف/ادامه/بستن پنل‌ها؛ خروج از خودِ بازی و از منوی اصلی) */
    @Override
    public void onBackPressed() {
        web.evaluateJavascript(
            "try{document.dispatchEvent(new Event('backbutton'))}catch(e){} void 0;", null);
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus) hideBars();
    }

    private void hideBars() {
        View d = getWindow().getDecorView();
        d.setSystemUiVisibility(
            View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
                | View.SYSTEM_UI_FLAG_FULLSCREEN
                | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                | View.SYSTEM_UI_FLAG_LAYOUT_STABLE);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
            WindowManager.LayoutParams lp = getWindow().getAttributes();
            lp.layoutInDisplayCutoutMode =
                WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES;
            getWindow().setAttributes(lp);
        }
    }
}
