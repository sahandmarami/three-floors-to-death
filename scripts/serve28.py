import os, sys
# دایمون دوبل‌فورک — سرور پایدار بازی روی پورت ۳۰۰۲
# (پس‌از پایان دستورِ bash زنده می‌ماند)
PORT = 3002
ROOT = '/home/z/my-project/webserve'
if os.fork() > 0: sys.exit(0)
os.setsid()
if os.fork() > 0: sys.exit(0)
os.chdir(ROOT)
log = open('/tmp/http3002.log', 'ab')
for fd in (0, 1, 2):
    os.dup2(log.fileno() if fd else os.open('/dev/null', os.O_RDONLY), fd)
import http.server, socketserver, functools
class NoCache(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-cache, must-revalidate')
        super().end_headers()
    def log_message(self, fmt, *args):
        pass
socketserver.TCPServer.allow_reuse_address = True
with socketserver.ThreadingTCPServer(('0.0.0.0', PORT), functools.partial(NoCache)) as httpd:
    httpd.serve_forever()
