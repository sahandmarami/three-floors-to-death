# ==================================================================
# Ctx — لایه‌ی سازگارِ رسم Canvas2D روی CanvasItem._draw()
# پورتِ وفادارِ رسم‌های زامبی/برج/بازیکن از نسخه‌ی HTML:
#   begin_path/move_to/line_to/quad_to/close_path → draw_colored_polygon
#   stroke(path, w, color) → draw_polyline
#   rr() → rounded-rect polygon
# ==================================================================
extends RefCounted
class_name Ctx

var _item: CanvasItem
var _pts: PackedVector2Array = []
var _has_path := false

func _init(item: CanvasItem) -> void:
        _item = item

# ---- مسیرها ----
func begin_path() -> void:
        _pts = PackedVector2Array()
        _has_path = false

func move_to(x: float, y: float) -> void:
        _pts = PackedVector2Array()
        _pts.append(Vector2(x, y))
        _has_path = true

func line_to(x: float, y: float) -> void:
        _pts.append(Vector2(x, y))

func quad_to(cx: float, cy: float, x: float, y: float, seg := 6) -> void:
        # منحنی درجه ۲ به چند پاره‌خط
        if _pts.is_empty():
                _pts.append(Vector2(cx, cy))
        var p0: Vector2 = _pts[_pts.size() - 1]
        var c := Vector2(cx, cy)
        var p1 := Vector2(x, y)
        for i in range(1, seg + 1):
                var t := float(i) / seg
                var a: Vector2 = p0.lerp(c, t)
                var b: Vector2 = c.lerp(p1, t)
                _pts.append(a.lerp(b, t))

func close_path() -> void:
        if _pts.size() >= 3:
                _item.draw_colored_polygon(_clean(_pts), _fill)
        _fill = Color.WHITE

# پاک‌سازی نقاط تکراری/مخرب (triangulation شکست‌نخورد)
func _clean(pts: PackedVector2Array) -> PackedVector2Array:
        if pts.size() < 3:
                return PackedVector2Array()
        var out := PackedVector2Array()
        for p in pts:
                if out.is_empty() or out[out.size() - 1].distance_to(p) > 0.01:
                        out.append(p)
        # آخرین = اول؟ حذف
        if out.size() >= 3 and out[0].distance_to(out[out.size() - 1]) <= 0.01:
                out.remove_at(out.size() - 1)
        return out if out.size() >= 3 else PackedVector2Array()

var _fill := Color.WHITE
func set_fill(c: Color) -> void:
        _fill = c

func fill() -> void:
        var clean := _clean(_pts)
        if clean.size() >= 3:
                _item.draw_colored_polygon(clean, _fill)

func stroke(color: Color, width: float) -> void:
        if _pts.size() >= 2:
                _item.draw_polyline(_pts, color, width, false)

func fill_circle(x: float, y: float, r: float, color: Color) -> void:
        _item.draw_circle(Vector2(x, y), r, color)

func stroke_circle(x: float, y: float, r: float, color: Color, width: float) -> void:
        _item.draw_arc(Vector2(x, y), r, 0, TAU, 24, color, width, false)

func fill_ellipse(x: float, y: float, rx: float, ry: float, rot: float, color: Color) -> void:
        var pts := PackedVector2Array()
        var n := 18
        var ca := cos(rot)
        var sa := sin(rot)
        for i in range(n):
                var t := TAU * i / n
                var px := cos(t) * rx
                var py := sin(t) * ry
                pts.append(Vector2(x + px * ca - py * sa, y + px * sa + py * ca))
        _item.draw_colored_polygon(pts, color)

# ---- مستطیل گردگوشه (rr نسخه‌ی HTML) ----
func rr(x: float, y: float, w: float, h: float, r: float, color: Color) -> void:
        r = minf(r, minf(w, h) * 0.5)
        var pts := PackedVector2Array()
        var n := 4
        # چهار گوشه + چهار ضلع
        for i in range(n + 1):
                var t: float = PI * 0.5 * i / n
                pts.append(Vector2(x + r - cos(t) * r, y + r - sin(t) * r))
        for i in range(n + 1):
                var t: float = PI * 0.5 * i / n
                pts.append(Vector2(x + w - r + sin(t) * r, y + r - cos(t) * r))
        for i in range(n + 1):
                var t: float = PI * 0.5 * i / n
                pts.append(Vector2(x + w - r + cos(t) * r, y + h - r + sin(t) * r))
        for i in range(n + 1):
                var t: float = PI * 0.5 * i / n
                pts.append(Vector2(x + r - sin(t) * r, y + h - r + cos(t) * r))
        _item.draw_colored_polygon(pts, color)

func rr_outline(x: float, y: float, w: float, h: float, r: float, color: Color, width: float) -> void:
        r = minf(r, minf(w, h) * 0.5)
        var pts := PackedVector2Array()
        var n := 4
        for i in range(n + 1):
                var t: float = PI * 0.5 * i / n
                pts.append(Vector2(x + r - cos(t) * r, y + r - sin(t) * r))
        for i in range(n + 1):
                var t: float = PI * 0.5 * i / n
                pts.append(Vector2(x + w - r + sin(t) * r, y + r - cos(t) * r))
        for i in range(n + 1):
                var t: float = PI * 0.5 * i / n
                pts.append(Vector2(x + w - r + cos(t) * r, y + h - r + sin(t) * r))
        for i in range(n + 1):
                var t: float = PI * 0.5 * i / n
                pts.append(Vector2(x + r - sin(t) * r, y + h - r + cos(t) * r))
        _item.draw_polyline(pts, color, width, false)

# ---- گرادیان تقریبی: دو نوار روشن/تیره روی شکل (مثل shader ارزان) ----
func shade_lr(x: float, y: float, w: float, h: float, light_a: float, dark_a: float) -> void:
        # نیمه‌ی چپ روشن، نیمه‌ی راست تیره (حجم‌دهی ارزان و هم‌جهت با نسخه‌ی اصلی)
        _item.draw_rect(Rect2(x, y, w * 0.45, h), Color(1, 1, 1, light_a))
        _item.draw_rect(Rect2(x + w * 0.55, y, w * 0.45, h), Color(0, 0, 0, dark_a))
        _item.draw_rect(Rect2(x + w * 0.45, y, w * 0.1, h), Color(0, 0, 0, dark_a * 0.35))

func fill_rect(x: float, y: float, w: float, h: float, color: Color) -> void:
        _item.draw_rect(Rect2(x, y, w, h), color)

func line(x0: float, y0: float, x1: float, y1: float, color: Color, width: float) -> void:
        _item.draw_line(Vector2(x0, y0), Vector2(x1, y1), color, width, false)

# ---- تبدیل‌ها (معادل ctx.save/translate/rotate) ----
func transform(pos: Vector2, rot: float = 0.0, scale: Vector2 = Vector2.ONE) -> void:
        var xform := Transform2D(rot, scale, 0.0, pos)
        _item.draw_set_transform_matrix(xform)

func reset_transform() -> void:
        _item.draw_set_transform_matrix(Transform2D())
