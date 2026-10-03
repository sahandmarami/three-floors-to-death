import os, sys, subprocess
# دابل‌فورک دایمون — جدا از نشست پدر
# (۲۰٫۵) از serve_nocache.py استفاده می‌کند (هدر Cache-Control: no-cache)
if os.fork() > 0: sys.exit(0)
os.setsid()
if os.fork() > 0: sys.exit(0)
os.chdir('/home/z/my-project/webserve')
sys.stdout.flush(); sys.stderr.flush()
log = open('/tmp/http3000.log', 'ab')
for fd in (0, 1, 2):
    os.dup2(log.fileno() if fd else os.open('/dev/null', os.O_RDONLY), fd)
subprocess.Popen(['python3', '/home/z/my-project/scripts/serve_nocache.py'],
                 stdout=log, stderr=log, start_new_session=True)
