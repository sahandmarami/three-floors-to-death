# ==================================================================
# ZombieDraw — پورتِ وفادارِ رسمِ زامبی از v3_part3.js (۲۱٫۰)
# چهار نوع: normal / fast / tank / boss — همان مختصات و جزئیات
# ==================================================================
extends RefCounted
class_name ZombieDraw

const OUT := Color(0.031, 0.047, 0.078, 0.5)      # rgba(8,12,20,0.5)

static func _sh(c: Color, f: float) -> Color:
        return Color(c.r * f, c.g * f, c.b * f, c.a)

static func zpal(type: String, flash: bool) -> Dictionary:
        var T: Dictionary = D.ZTYPES[type]
        if flash:
                return {
                        "skin": Color("e9f7d8"), "skinD": Color("cfe6b8"), "skinL": Color("ffffff"),
                        "shirt": Color("b9cbe0"), "shirtD": Color("9db4cc"), "shirtL": Color("eef4fb"),
                        "pants": Color("7d8aa3"), "pantsD": Color("5d6a80"),
                        "gore": Color("e5b0a8"), "goreD": Color("c98a80"), "hair": Color("93a89e"),
                }
        return {
                "skin": T.skin, "skinD": _sh(T.skin, 0.58), "skinL": _sh(T.skin, 1.34),
                "shirt": T.shirt, "shirtD": _sh(T.shirt, 0.58), "shirtL": _sh(T.shirt, 1.38),
                "pants": T.pants, "pantsD": _sh(T.pants, 0.55),
                "gore": Color("5e1420") if type == "boss" else Color("6e1616"),
                "goreD": Color("400a0a"),
                "hair": Color("2e2312") if type == "fast" else Color("232b1a"),
        }

static func z_lean(z: Dictionary) -> float:
        if z.get("dead", false):
                return 0.0
        var a := -0.15 if z.type == "fast" else (0.02 if z.type == "tank"
                else (0.05 if z.type == "boss" else 0.045))
        if z.get("attacking", false):
                a += 0.09 + sin(z.get("attackAnim", 0.0)) * 0.05
        return a

# ---------- بدنه‌ی کامل (drawZombieBody) ----------
static func draw_body(c: Ctx, z: Dictionary, flash: bool) -> void:
        var type: String = z.type
        var P := zpal(type, flash)
        var bulk := 1.5 if type == "boss" else (1.28 if type == "tank" else (0.88 if type == "fast" else 1.0))
        var thick := 1.26 if bulk > 1.15 else 1.0
        var atk: bool = z.get("attacking", false)
        var walk := sin(z.walkPhase)
        var bob := sin(z.attackAnim) * 1.5 if atk else absf(walk) * 1.2
        # NOTE: فراخوان باید translate(z.x,z.y) را خودش کرده باشد — اینجا فقط چرخش
        c.transform(Vector2(0, 0), z_lean(z))
        # خطوط سرعت سریع‌ها
        if type == "fast" and not z.get("dead", false):
                c.begin_path()
                for i in range(3):
                        var yy := -23.0 + i * 6.0
                        var xx := -11.0 - i * 3.0
                        c.move_to(xx, yy)
                        c.line_to(xx - 8.0, yy)
                c.stroke(Color(0.86, 0.746, 0.47, 0.34), 1.4)
        # شنل پادشاه
        if type == "boss":
                var flap := sin(z.walkPhase) * 2.6
                var col := Color("8d2740") if flash else Color("41101c")
                c.begin_path()
                c.move_to(-5.0, -29.0 + bob * 0.4)
                c.quad_to(-13.0 - flap, -21.0, -11.5 - flap * 1.5, -5.0 + bob * 0.3)
                c.quad_to(-6.5 - flap * 0.5, -9.0, -1.5, -13.0)
                c.set_fill(col)
                c.fill()
        # ---- پاها ----
        var stride := 8.5 if type == "fast" else 6.2
        for side in [-1, 1]:
                var ph: float = z.walkPhase + (PI if side < 0 else 0.0)
                var sw: float = 0.5 if atk else sin(ph)
                var lift: float = 0.0 if atk else maxf(0.0, cos(ph)) * 2.7
                var hx: float = side * (2.3 * bulk + (1.3 if bulk > 1.15 else 0.0))
                var hy := -13.5
                var fx: float = hx + sw * stride * (0.85 if side < 0 else 1.0) + (2.5 if atk else 0.0)
                var fy := -1.7 - lift
                var kx: float = (hx + fx) / 2.0 + 1.7 * bulk
                var ky: float = (hy + fy) / 2.0 - 0.7
                var wT: float = 4.6 * thick * (0.92 if side < 0 else 1.0)
                var wS: float = 3.5 * thick * (0.86 if side < 0 else 1.0)
                c.begin_path(); c.move_to(hx, hy); c.line_to(kx, ky); c.line_to(fx, fy - 1.2)
                c.stroke(OUT, wT + 1.7)
                c.begin_path(); c.move_to(hx, hy); c.line_to(kx, ky)
                c.stroke(P.pantsD if side < 0 else P.pants, wT)
                c.begin_path(); c.move_to(kx, ky); c.line_to(fx, fy)
                c.stroke(P.pantsD, wS)
                c.rr(fx - 1.6, fy - 1.7, 6.2 * thick, 3.0, 1.4, P.pantsD)
                c.rr_outline(fx - 1.6, fy - 1.7, 6.2 * thick, 3.0, 1.4, OUT, 0.8)
        # ---- بازوی دور ----
        var swF: float = sin(z.attackAnim) * 3.0 if atk else sin(z.walkPhase * 0.5) * 1.8
        var bd_sx := -5.5 * bulk
        var bd_sy := -26.0 + bob * 0.4
        var bd_ex := -1.5
        var bd_ey := -21.0 + swF * 0.5 + bob * 0.4
        var bd_wx := 6.5
        var bd_wy := -19.2 + swF + bob * 0.4
        c.begin_path(); c.move_to(bd_sx, bd_sy); c.line_to(bd_ex, bd_ey); c.line_to(bd_wx, bd_wy)
        c.stroke(OUT, 4.3 * thick + 1.6)
        c.begin_path(); c.move_to(bd_sx, bd_sy); c.line_to(bd_ex, bd_ey)
        c.stroke(P.skinD, 4.3 * thick)
        c.begin_path(); c.move_to(bd_ex, bd_ey); c.line_to(bd_wx, bd_wy)
        c.stroke(P.skinD, 3.5 * thick)
        c.fill_circle(bd_wx, bd_wy, 2.6, P.skinD)
        # ---- تنه ----
        var tw := 9.0 * bulk
        var ty := -31.0 + bob * 0.4
        c.rr(-tw, ty, tw * 2.0, 19.5, 4.5, P.shirt)
        # سایه‌روشن (تقریب گرادیان: دو لایه‌ی نیمه‌شفاف)
        c.fill_rect(-tw, ty, tw * 0.9, 19.5, Color(1, 1, 1, 0.12))
        c.fill_rect(tw * 0.1, ty, tw * 0.9, 19.5, Color(0, 0, 0, 0.2))
        c.rr_outline(-tw, ty, tw * 2.0, 19.5, 4.5, OUT, 1.1)
        # برق سرد شونه
        c.begin_path(); c.move_to(-tw + 2.0, ty + 1.6)
        c.quad_to(0.0, ty - 0.6, tw - 2.0, ty + 1.6)
        c.stroke(Color(0.647, 0.784, 1.0, 0.16), 1.2)
        # کمربند + سگک
        c.fill_rect(-tw + 0.5, ty + 16.6, tw * 2.0 - 1.0, 2.6, P.pantsD)
        c.fill_rect(-1.5, ty + 16.6, 3.0, 2.6, P.shirtL)
        # پارگی سینه + دنده‌ها
        c.fill_ellipse(tw * 0.45, ty + 7.5, tw * 0.42, 4.4, -0.08, Color(0.039, 0.039, 0.031, 0.55))
        c.begin_path()
        for i in range(3):
                var ry: float = ty + 4.9 + i * 2.5
                c.move_to(tw * 0.2, ry)
                c.quad_to(tw * 0.55, ry - 0.5, tw * 0.78, ry + 1.1)
        c.stroke(P.skin, 1.4)
        # لبه‌ی پاره‌ی دامن (۲۱٫۴: نقاط نسبی — روی تنه‌های باریک هم بدون خود‌تقاطع)
        c.begin_path()
        var hem_x := [-0.92, -0.62, -0.35, -0.10, 0.18, 0.46, 0.72, 0.93]
        var hem_dy := [0.0, -3.3, 0.0, -2.5, 0.0, -2.1, -2.9, 0.0]
        for i in range(hem_x.size()):
                c.line_to(tw * hem_x[i], ty + 19.5 + hem_dy[i])
        c.set_fill(P.shirtD)
        c.fill()
        # زخم
        c.fill_ellipse(-tw * 0.45, ty + 8.5, 2.5, 1.8, 0.4, P.gore)
        c.fill_circle(-tw * 0.45, ty + 8.5, 1.0, P.goreD)
        # ---- زره شونه ----
        if type == "tank" or type == "boss":
                for side in [-1, 1]:
                        var ax: float = side * (tw - 1.2)
                        var ay: float = ty + 2.0
                        c.rr(ax - 4.6, ay - 2.6, 9.2, 7.0, 2.0, Color("3f151d") if type == "boss" else Color("39364a"))
                        c.rr_outline(ax - 4.6, ay - 2.6, 9.2, 7.0, 2.0, OUT, 0.9)
                        c.fill_rect(ax - 3.6, ay - 1.9, 7.2, 1.1, Color(1, 1, 1, 0.24))
                        if type == "boss":
                                c.begin_path()
                                c.move_to(ax - 2.4, ay - 2.6); c.line_to(ax + side * 2.2, ay - 8.6); c.line_to(ax + 2.4, ay - 2.6)
                                c.set_fill(Color("e3a8f2") if flash else Color("c44dff"))
                                c.fill()
                        else:
                                c.fill_circle(ax - 2.4, ay + 1.3, 0.6, Color(0.9, 0.92, 0.98, 0.55))
                                c.fill_circle(ax + 2.4, ay + 1.3, 0.6, Color(0.9, 0.92, 0.98, 0.55))
        # ---- بازوی نزدیک ----
        var armSw: float = sin(z.attackAnim) * 4.5 if atk else sin(z.walkPhase * 0.5) * 2.0
        var na_sx := 5.5 * bulk
        var na_sy := -27.0 + bob * 0.4
        var na_ex: float = 9.5 + bulk * 1.4
        var na_ey := -24.0 + armSw * 0.6 + bob * 0.4
        var na_wx: float = 14.5 + (sin(z.attackAnim) * 2.0 if atk else 0.0)
        var na_wy := -22.6 + armSw + bob * 0.4
        # آستین روی بازو
        c.begin_path(); c.move_to(na_sx, na_sy - 1.2); c.line_to((na_sx + na_ex) / 2.0, (na_sy + na_ey) / 2.0)
        c.stroke(OUT, 6.6 * thick)
        c.begin_path(); c.move_to(na_sx, na_sy - 1.2); c.line_to((na_sx + na_ex) / 2.0, (na_sy + na_ey) / 2.0)
        c.stroke(P.shirt, 5.0 * thick)
        # ساعد و دست
        c.begin_path(); c.move_to(na_ex, na_ey); c.line_to(na_wx, na_wy)
        c.stroke(OUT, 4.2 * thick + 1.5)
        c.begin_path(); c.move_to(na_ex, na_ey); c.line_to(na_wx, na_wy)
        c.stroke(P.skin, 3.7 * thick)
        c.fill_circle(na_wx, na_wy, 2.9, P.skin)
        # چنگک‌ها
        c.begin_path()
        c.move_to(na_wx + 1.4, na_wy - 1.9); c.line_to(na_wx + 4.0, na_wy - 2.7)
        c.move_to(na_wx + 2.2, na_wy - 0.2); c.line_to(na_wx + 4.9, na_wy - 0.5)
        c.move_to(na_wx + 1.4, na_wy + 1.6); c.line_to(na_wx + 3.8, na_wy + 2.2)
        c.stroke(P.skinD, 1.2)
        # ---- سر ----
        var hy := -36.0 + bob * 0.5
        c.fill_rect(0.8, hy + 5.4, 4.6, 4.2, P.skinD)
        # مو
        if type != "tank":
                c.begin_path()
                var n := 14
                for i in range(n + 1):
                        var t: float = lerp(PI * 0.62, PI * 1.78, float(i) / n)
                        c.line_to(3.0 + 7.1 * cos(t), hy + 7.1 * sin(t))
                c.set_fill(P.hair)
                c.fill()
                var spikes: Array
                if type == "fast":
                        spikes = [[205, 6.5, 13], [240, 6.6, 14.5], [275, 6.6, 14.5], [310, 6.5, 12.5]]
                elif type == "boss":
                        spikes = [[125, 6.5, 11], [160, 6.6, 14], [200, 6.6, 13.5], [240, 6.5, 12], [280, 6.4, 11], [315, 6.0, 9]]
                else:
                        spikes = [[130, 6.3, 10], [172, 6.5, 11.3], [218, 6.5, 11.5], [262, 6.4, 11.8], [304, 6.2, 9.6]]
                for sp in spikes:
                        var A: float = deg_to_rad(sp[0])
                        var rb: float = sp[1]
                        var rt: float = sp[2]
                        c.begin_path()
                        c.move_to(3.0 + rb * cos(A - 0.17), hy + rb * sin(A - 0.17))
                        c.line_to(3.0 + rt * cos(A), hy + rt * sin(A))
                        c.line_to(3.0 + rb * cos(A + 0.17), hy + rb * sin(A + 0.17))
                        c.set_fill(P.hair)
                        c.fill()
        # جمجمه (تقریب گرادیان شعاعی با دو دایره)
        c.fill_circle(3.0, hy, 7.0, P.skin)
        c.fill_circle(1.4, hy - 2.2, 4.6, P.skinL)
        c.fill_circle(3.6, hy + 1.4, 5.4, P.skinD)
        c.fill_circle(3.0, hy, 7.0, Color(P.skin.r, P.skin.g, P.skin.b, 0.45))
        c.stroke_circle(3.0, hy, 7.0, OUT, 1.1)
        # برق سرد تاج سر
        c.begin_path()
        for i in range(10):
                var t: float = lerp(PI * 1.04, PI * 1.6, float(i) / 9)
                c.line_to(3.0 + 7.9 * cos(t), hy + 7.9 * sin(t))
        c.stroke(Color(0.647, 0.784, 1.0, 0.18), 1.3)
        # فک
        c.rr(1.2, hy + 3.1, 7.4, 4.6, 2.2, P.skin)
        c.rr(1.2, hy + 5.6, 7.4, 2.1, 1.8, Color(0, 0, 0, 0.22))
        # دهان
        if atk or type == "boss":
                c.fill_ellipse(4.9, hy + 4.6, 2.7, 2.0, 0.0, Color("1c0f0d"))
                c.fill_rect(3.6, hy + 3.1, 1.1, 1.5, Color("ece8d4"))
                c.fill_rect(5.6, hy + 3.3, 1.0, 1.4, Color("ece8d4"))
                c.fill_rect(4.6, hy + 5.4, 0.9, 1.2, Color("ece8d4"))
        else:
                c.begin_path(); c.move_to(3.2, hy + 4.9)
                c.quad_to(5.4, hy + 5.6, 7.4, hy + 4.7)
                c.stroke(Color(0.078, 0.055, 0.039, 0.7), 1.0)
                c.fill_rect(4.1, hy + 4.55, 0.9, 1.1, Color(0.91, 0.89, 0.82, 0.85))
                c.fill_rect(5.9, hy + 4.75, 0.8, 1.0, Color(0.91, 0.89, 0.82, 0.85))
        # چشم‌ها
        c.fill_ellipse(5.5, hy - 1.0, 2.3, 1.9, 0.0, Color(0.047, 0.063, 0.039, 0.85))
        c.fill_ellipse(8.8, hy - 1.5, 2.3, 1.9, 0.0, Color(0.047, 0.063, 0.039, 0.85))
        # ابروها
        c.begin_path()
        c.move_to(3.9, hy - 3.3); c.line_to(6.9, hy - 2.9)
        c.move_to(7.4, hy - 3.8); c.line_to(10.0, hy - 3.4)
        c.stroke(P.hair, 1.2)
        # گوش
        c.fill_circle(0.6, hy - 0.4, 1.7, P.skinD)
        # زخم پیشانی
        c.begin_path(); c.move_to(1.4, hy - 4.6); c.line_to(3.4, hy - 3.2)
        c.stroke(P.gore, 1.1)
        # کلاه‌خود تانک
        if type == "tank":
                c.rr(-4.9, hy - 9.0, 15.2, 5.4, 2.4, Color("5c5f74"))
                c.fill_rect(-4.9, hy - 9.0, 6.8, 5.4, Color(1, 1, 1, 0.13))
                c.fill_rect(3.4, hy - 9.0, 6.9, 5.4, Color(0, 0, 0, 0.16))
                c.rr_outline(-4.9, hy - 9.0, 15.2, 5.4, 2.4, OUT, 1.0)
                c.fill_circle(-2.6, hy - 6.4, 0.6, Color(0.9, 0.92, 0.98, 0.6))
                c.fill_circle(1.5, hy - 7.2, 0.6, Color(0.9, 0.92, 0.98, 0.6))
                c.fill_circle(5.8, hy - 7.2, 0.6, Color(0.9, 0.92, 0.98, 0.6))
                c.begin_path(); c.move_to(-2.6, hy - 3.8); c.line_to(0.8, hy + 0.6)
                c.stroke(Color(0.031, 0.047, 0.078, 0.6), 1.0)
        # تاج پادشاه
        if type == "boss":
                c.rr(-3.2, hy - 9.6, 12.8, 3.2, 1.4, Color("f7c948"))
                c.rr_outline(-3.2, hy - 9.6, 12.8, 3.2, 1.4, OUT, 0.9)
                c.begin_path()
                c.move_to(-3.0, hy - 9.6); c.line_to(-3.0, hy - 13.4); c.line_to(0.2, hy - 10.6)
                c.line_to(3.4, hy - 14.2); c.line_to(6.4, hy - 10.6); c.line_to(9.6, hy - 13.4)
                c.line_to(9.6, hy - 9.6)
                c.set_fill(Color("f7c948"))
                c.fill()
                var jc := Color("e3a8f2") if flash else Color("c44dff")
                c.fill_circle(-0.8, hy - 8.0, 0.9, jc)
                c.fill_circle(3.4, hy - 8.0, 1.1, jc)
                c.fill_circle(7.4, hy - 8.0, 0.9, jc)
        # چشم‌های درخشان (افکت)
        if not z.get("dead", false):
                var glow := Color(1.0, 0.86, 0.42, 0.85)
                c.fill_circle(5.5, hy - 1.0, 1.05, glow)
                c.fill_circle(8.8, hy - 1.5, 1.05, glow)
        c.reset_transform()
