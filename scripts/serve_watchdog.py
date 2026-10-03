import os, sys, time, subprocess, urllib.request
# دایمون نگهبان — هر ۲۰ ثانیه چک می‌کند؛ اگر سرور مرده بود دوباره بالا می‌آورد
if os.fork() > 0: sys.exit(0)
os.setsid()
if os.fork() > 0: sys.exit(0)
os.chdir('/home/z/my-project/webserve')
log = open('/tmp/http3000.log', 'ab')
for fd in (0, 1, 2):
    os.dup2(log.fileno() if fd else os.open('/dev/null', os.O_RDONLY), fd)
while True:
    try:
        urllib.request.urlopen('http://127.0.0.1:3000/', timeout=4).read(64)
    except Exception:
        try:
            # (۲۰٫۵) سرورِ no-cache — همیشه نسخه‌ی تازه به مرورگر می‌رسد
            subprocess.Popen(['python3', '/home/z/my-project/scripts/serve_nocache.py'],
                             stdout=log, stderr=log, start_new_session=True)
        except Exception:
            pass
    time.sleep(20)
