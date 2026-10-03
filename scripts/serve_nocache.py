import http.server, socketserver, functools
# (۲۰٫۵) سرور وبِ بازی — مثل SimpleHTTP ولی با Cache-Control: no-cache
# تا مرورگرِ کاربر همیشه نسخه‌ی تازه بگیرد (مشکل «چیزی نمی‌بینم» = کشِ کهنه)
# دایرکتوری را والدِ فراخواننده قبل از spawn تعیین می‌کند (CWD به ارث می‌رسد)
class NoCache(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-cache, must-revalidate")
        super().end_headers()

if __name__ == '__main__':
    with socketserver.ThreadingTCPServer(("0.0.0.0", 3000), functools.partial(NoCache)) as httpd:
        httpd.serve_forever()
