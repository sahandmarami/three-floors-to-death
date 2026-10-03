import os, sys, subprocess
# دابل‌فورک دایمون — جدا از نشست پدر
if os.fork() > 0: sys.exit(0)
os.setsid()
if os.fork() > 0: sys.exit(0)
os.chdir('/home/z/my-project/webserve')
sys.stdout.flush(); sys.stderr.flush()
log = open('/tmp/http3000.log', 'ab')
for fd in (0, 1, 2):
    os.dup2(log.fileno() if fd else os.open('/dev/null', os.O_RDONLY), fd)
subprocess.Popen(['python3', '-m', 'http.server', '3000', '--bind', '0.0.0.0'],
                 stdout=log, stderr=log, start_new_session=True)
