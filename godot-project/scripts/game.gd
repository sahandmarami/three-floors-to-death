# ==================================================================
# Game — هسته‌ی گیم‌پلی: دنیای شب، برج سه‌طبقه، زامبی‌ها، شلیک، برجک‌ها
# پورتِ وفادارِ v3_part2/v3_part3/v4_chapters — ۳۶ موج در ۴ فصل
# ==================================================================
extends Node2D

const GROUND_Y := 492.0
const TOWER := {"base_half": 68.0, "floor_h": 66.0, "floors": 3}
var tower_x := 640.0
var tower_top_y: float

# موجودیت‌ها (مثل نسخه‌ی HTML: دیکشنری‌های ساده)
var zombies: Array = []
var bullets: Array = []
var coins_arr: Array = []
var particles: Array = []
var float_texts: Array = []

# وضعیت موج
var spawn_queue: Array = []
var spawn_timer := 0.0
var spawn_interval := 2.0
var wave_active := false
var intermission_t := 0.0
var dayness := 0.0          # ۰=شب ۱=روز

# ورودی
var aim := Vector2(640, 200)
var shoot_held := false
var shoot_cd := 0.0

# منظر ثابت (بذر ثابت — مثل srand 1379)
var stars: Array = []
var hills1: Array = []
var hills2: Array = []
var skyline: Array = []
var _seed := 1379

# HUD
var hud: CanvasLayer
var hp_label: Label
var coin_label: Label
var wave_label: Label
var boss_bar: Control
var boss_fill: ColorRect

# ------------------------------------------------------------------
func _ready() -> void:
        tower_x = get_viewport_rect().size.x * 0.5
        tower_top_y = GROUND_Y - TOWER.floor_h * TOWER.floors
        _build_scenery()
        _build_hud()
        G.mode = "intermission"
        G.wave = 0
        intermission_t = 1.2
        Snd.ambience_on(true)

func _build_scenery() -> void:
        _seed = 1379
        stars.clear(); hills1.clear(); hills2.clear(); skyline.clear()
        var vw := get_viewport_rect().size.x
        for i in range(80):
                stars.append({"x": _sr() * vw, "y": _sr() * (GROUND_Y - 90), "r": 0.6 + _sr() * 1.4,
                        "ph": _sr() * TAU, "sp": 0.5 + _sr() * 1.6})
        var n1 := int(ceil((vw + 90.0) / 60.0))
        for i in range(n1):
                hills1.append({"x": -30.0 + i * 60.0, "h": 22.0 + _sr() * 36.0})
        var n2 := int(ceil((vw + 125.0) / 85.0))
        for i in range(n2):
                hills2.append({"x": -40.0 + i * 85.0, "h": 10.0 + _sr() * 18.0})
        var x := -12.0
        while x < vw + 12.0:
                var bw := 34.0 + _sr() * 52.0
                var bh := 26.0 + _sr() * 95.0
                skyline.append({"x": x, "w": bw, "h": bh})
                x += bw + 8.0

func _sr() -> float:
        _seed = (_seed * 16807) % 2147483647
        return float(_seed - 1) / 2147483646.0

# ------------------------------------------------------------------
func _build_hud() -> void:
        hud = CanvasLayer.new()
        add_child(hud)
        var panel := PanelContainer.new()
        panel.anchor_left = 0.0; panel.anchor_top = 0.0
        panel.anchor_right = 1.0; panel.anchor_bottom = 0.0
        panel.offset_left = 8; panel.offset_top = 6; panel.offset_right = -8; panel.offset_bottom = 40
        var style := StyleBoxFlat.new()
        style.bg_color = Color(0.06, 0.09, 0.2, 0.85)
        style.corner_radius_top_left = 10; style.corner_radius_top_right = 10
        style.corner_radius_bottom_left = 10; style.corner_radius_bottom_right = 10
        style.border_color = Color(0.24, 0.33, 0.55); style.border_width_bottom = 1
        panel.add_theme_stylebox_override("panel", style)
        var row := HBoxContainer.new()
        row.alignment = BoxContainer.ALIGNMENT_BEGIN
        panel.add_child(row)
        hp_label = Label.new()
        coin_label = Label.new()
        wave_label = Label.new()
        for lbl in [hp_label, coin_label, wave_label]:
                lbl.add_theme_font_size_override("font_size", 15)
                lbl.add_theme_color_override("font_color", Color("eef2ff"))
        row.add_child(hp_label); row.add_child(_sep()); row.add_child(coin_label); row.add_child(_sep()); row.add_child(wave_label)
        hud.add_child(panel)
        G.hp_changed.connect(_on_hp)
        G.coins_changed.connect(_on_coins)
        _refresh_hud()

func _sep() -> Control:
        var s := VSeparator.new()
        s.custom_minimum_size = Vector2(14, 0)
        return s

func _refresh_hud() -> void:
        hp_label.text = "❤️ %s/%s" % [D.fa_num(int(ceil(G.tower_hp))), D.fa_num(int(G.tower_max_hp))]
        coin_label.text = "💰 %s" % D.fa_num(G.coins)
        var ch := D.wave_chapter(maxi(G.wave, 1))
        wave_label.text = "💀 موج %s از %s — %s" % [D.fa_num(G.wave), D.fa_num(D.FINAL_WAVE), D.CHAPTERS[ch - 1].title]
        _on_coins(G.coins)

func _on_hp(v: float, mx: float) -> void:
        _refresh_hud()

func _on_coins(v: int) -> void:
        coin_label.text = "💰 %s" % D.fa_num(v)

# ------------------------------------------------------------------
# جریان موج‌ها (v4_chapters)
func start_wave() -> void:
        G.wave += 1
        _refresh_hud()
        Snd.wave_start()
        zombies.clear()
        bullets.clear()
        spawn_queue = _make_wave(G.wave)
        spawn_timer = 0.6
        spawn_interval = maxf(0.65, 2.2 - G.wave * 0.045)
        wave_active = true
        dayness = 0.0
        G.save_game()

func _make_wave(w: int) -> Array:
        # مقیاسِ سختی نسخه‌ی اصلی: تعداد و ترکیب با موج/فصل
        var q: Array = []
        var ch := D.wave_chapter(w)
        var wch := D.wave_in_chapter(w)
        var total := int(4 + wch * 1.7 + ch * 1.4)
        var tank_from := 5 if ch == 1 else 2
        for i in range(total):
                var r := randf()
                if w >= 12 and r < 0.14:
                        q.append("tank")
                elif r < 0.14 + 0.10 * ch:
                        q.append("fast")
                else:
                        q.append("normal")
        if w == D.FINAL_WAVE:
                q = ["boss"]
        return q

func _wave_done() -> bool:
        return wave_active and zombies.is_empty() and spawn_queue.is_empty()

func wave_complete() -> void:
        wave_active = false
        Snd.clear_()
        G.best_night = maxi(G.best_night, G.wave)
        G.save_game()
        if G.wave >= D.FINAL_WAVE:
                G.mode = "victory"
                Snd.victory()
                return
        # روزِ بین موج‌ها
        dayness = 1.0
        G.mode = "day"
        Snd.morning()

# ------------------------------------------------------------------
func _process(delta: float) -> void:
        match G.mode:
                "playing":
                        _update_playing(delta)
                "day":
                        _update_day(delta)
                "intermission":
                        intermission_t -= delta
                        if intermission_t <= 0:
                                G.mode = "playing"
                                start_wave()
        queue_redraw()

func _update_playing(delta: float) -> void:
        # تولد
        if not spawn_queue.is_empty():
                spawn_timer -= delta
                if spawn_timer <= 0.0:
                        spawn_timer = spawn_interval
                        _spawn_zombie(spawn_queue.pop_front())
        # زامبی‌ها
        for z in zombies:
                _update_zombie(z, delta)
        zombies = zombies.filter(func(z): return not z.dead)
        # گلوله‌ها
        for b in bullets:
                b.pos += b.vel * delta
                b.ttl -= delta
                _bullet_hits(b)
        bullets = bullets.filter(func(b): return b.ttl > 0)
        # سکه‌ها
        for cn in coins_arr:
                cn.t -= delta
        coins_arr = coins_arr.filter(func(c): return c.t > 0)
        # شلیک بازیکن
        shoot_cd -= delta
        if shoot_held and shoot_cd <= 0:
                _shoot()
        # پایان موج
        if _wave_done():
                wave_complete()

func _update_day(_delta: float) -> void:
        pass   # خرید از HUD؛ «شب شود» دکمه‌ی HUD

func _update_zombie(z: Dictionary, dt: float) -> void:
        if z.dead:
                z.deathT += dt
                return
        z.walkPhase += dt * (4.0 + z.spd * 0.06)
        var dir: float = -1.0 if z.x > tower_x else 1.0
        var dist: float = absf(z.x - tower_x) - TOWER.base_half
        if dist > 6.0:
                z.x += dir * z.spd * dt
                z.attacking = false
        else:
                z.attacking = true
                z.attackAnim += dt * 7.0
                z.biteTimer -= dt
                if z.biteTimer <= 0:
                        z.biteTimer = z.biteInt
                        G.damage_tower(z.dmg)
                        Snd.tower_hit()
        if G.tower_hp <= 0:
                G.mode = "gameover"
                Snd.gameover()

func _spawn_zombie(type: String) -> void:
        var T: Dictionary = D.ZTYPES[type]
        var hp: float = T.hp_base + T.hp_wave * G.wave
        var spd: float = T.spd_base + T.spd_wave * G.wave * 0.1
        var vw := get_viewport_rect().size.x
        var from_left := randf() < 0.5
        zombies.append({
                "type": type, "x": -40.0 if from_left else vw + 40.0,
                "y": GROUND_Y + randf_range(-3, 3), "dir": 1.0 if from_left else -1.0,
                "hp": hp, "maxHp": hp, "spd": spd, "radius": T.r,
                "dmg": T.dmg, "biteInt": T.bite, "biteTimer": T.bite,
                "walkPhase": randf() * TAU, "attackAnim": 0.0, "attacking": false,
                "dead": false, "deathT": 0.0, "hitFlash": 0.0,
                "coins": T.coins, "z": randf(),
        })
        if type == "boss":
                Snd.roar()

# ------------------------------------------------------------------
func _unhandled_input(event: InputEvent) -> void:
        if event is InputEventMouseMotion or event is InputEventScreenDrag:
                aim = event.position
        elif event is InputEventMouseButton:
                if event.button_index == MOUSE_BUTTON_LEFT:
                        shoot_held = event.pressed
                        aim = event.position
                        if event.pressed:
                                _shoot()
        elif event is InputEventScreenTouch:
                shoot_held = event.pressed
                aim = event.position
                if event.pressed:
                        _shoot()
        elif event is InputEventKey:
                if event.pressed and event.keycode == KEY_SPACE:
                        if G.mode == "day":
                                _night_falls()

func _shoot() -> void:
        if G.mode != "playing":
                return
        var W: Dictionary = D.WEAPONS[G.weapon]
        shoot_cd = G.weapon_rate()
        Snd.shoot(G.weapon)
        var origin := Vector2(tower_x, tower_top_y - 17)
        var dirv: Vector2 = (aim - origin).normalized()
        for i in range(W.pellets):
                var ang: float = dirv.angle() + randf_range(-W.spread, W.spread)
                var vel: Vector2 = Vector2(cos(ang), sin(ang)) * W.spd
                bullets.append({"pos": origin + dirv * W.barrel, "vel": vel,
                        "ttl": W.ttl, "dmg": G.weapon_dmg(), "knock": W.knock})
        _particles_muzzle(origin + dirv * W.barrel, dirv.angle())

func _bullet_hits(b: Dictionary) -> void:
        for z in zombies:
                if z.dead:
                        continue
                var zp := Vector2(z.x, z.y - 20)
                if b.pos.distance_to(zp) < z.radius + 4:
                        var dmg: float = b.dmg
                        z.hp -= dmg
                        z.hitFlash = 0.09
                        Snd.hit()
                        _float_text(zp, D.fa_num(int(dmg)))
                        _particles_hit(b.pos)
                        b.ttl = 0
                        # پس‌زُدِ
                        z.x += b.knock * (1.0 if b.vel.x > 0 else -1.0) * 0.4
                        if z.hp <= 0:
                                z.dead = true
                                G.kills += 1
                                Snd.death()
                                var c: int = randi_range(z.coins[0], z.coins[1])
                                G.add_coins(c)
                                G.earned += c
                                Snd.coin()
                                _coins_drop(zp, c)
                        return

# ------------------------------------------------------------------
func _particles_muzzle(pos: Vector2, ang: float) -> void:
        for i in range(4):
                var a: float = ang + randf_range(-0.4, 0.4)
                particles.append({"pos": pos, "vel": Vector2(cos(a), sin(a)) * randf_range(80, 200),
                        "t": 0.22, "col": Color(1, 0.85, 0.5, 0.9), "r": randf_range(1.5, 3)})

func _particles_hit(pos: Vector2) -> void:
        for i in range(3):
                var a: float = randf() * TAU
                particles.append({"pos": pos, "vel": Vector2(cos(a), sin(a)) * randf_range(30, 90),
                        "t": 0.3, "col": Color(0.55, 0.1, 0.08, 0.9), "r": randf_range(1, 2.2)})

func _float_text(pos: Vector2, txt: String) -> void:
        float_texts.append({"pos": pos + Vector2(0, -18), "t": 0.8, "txt": txt})

func _coins_drop(pos: Vector2, val: int) -> void:
        coins_arr.append({"pos": pos, "t": 1.2, "val": val})

func _night_falls() -> void:
        Snd.dusk()
        dayness = 0.0
        G.mode = "playing"
        start_wave()

# ==================================================================
# رسم
# ==================================================================
func _draw() -> void:
        var vw := get_viewport_rect().size.x
        var c := Ctx.new(self)
        _draw_sky(vw, dayness)
        _draw_moon()
        _draw_stars()
        _draw_hills()
        _draw_skyline()
        _draw_ground(vw)
        _draw_tower()
        # سکه‌های درجا
        for cn in coins_arr:
                draw_circle(cn.pos, 5, Color(1, 0.85, 0.25))
                draw_circle(cn.pos + Vector2(-1.5, -1.5), 2, Color(1, 1, 0.8, 0.9))
        # زامبی‌ها (مرتب از دور به نزدیک)
        var zs := zombies.duplicate()
        zs.sort_custom(func(a, b): return a.z < b.z)
        for z in zs:
                if z.dead and z.deathT > 0.8:
                        continue
                draw_set_transform(Vector2(z.x, z.y), 0.0, Vector2.ONE)
                ZombieDraw.draw_body(c, z, z.hitFlash > 0)
                draw_set_transform_matrix(Transform2D())
                if not z.dead:
                        # نوار جون کوچک
                        var wdt := 26.0 if z.type != "boss" else 60.0
                        var yy := -52.0 if z.type != "boss" else -110.0
                        draw_rect(Rect2(z.x - wdt / 2, z.y + yy, wdt, 3.5), Color(0, 0, 0, 0.55))
                        draw_rect(Rect2(z.x - wdt / 2, z.y + yy, wdt * z.hp / z.maxHp, 3.5),
                                Color("2ee06b") if z.hp / z.maxHp > 0.5 else Color("ef4d38"))
        # گلوله‌ها
        for b in bullets:
                draw_circle(b.pos, 2.2, Color(1, 0.95, 0.7))
                draw_line(b.pos, b.pos - b.vel.normalized() * 9, Color(1, 0.9, 0.55, 0.5), 1.5)
        # ذرات
        for p in particles:
                draw_circle(p.pos, p.r * (p.t / 0.3), p.col)
        # متن‌های شناور
        var f := ThemeDB.fallback_font
        for t in float_texts:
                draw_string(f, t.pos + Vector2(-10, 0), t.txt, HORIZONTAL_ALIGNMENT_CENTER, -1, 14,
                        Color(1, 0.95, 0.6, clampf(t.t, 0, 1)))
        # بازیکن روی بام
        _draw_player(c)

func _draw_sky(vw: float, day: float) -> void:
        var top := Color("0a1128").lerp(Color("3a5a8c"), day)
        var bot := Color("1c2b52").lerp(Color("e8956b"), day * 0.85)
        draw_rect(Rect2(0, 0, vw, GROUND_Y), bot)
        draw_rect(Rect2(0, 0, vw, GROUND_Y * 0.55), top)
        # نوار میانی نرم
        var mid := top.lerp(bot, 0.5)
        mid.a = 0.6
        draw_rect(Rect2(0, GROUND_Y * 0.4, vw, GROUND_Y * 0.3), mid)

func _draw_moon() -> void:
        var vw := get_viewport_rect().size.x
        var mx := vw * 0.16
        var my := 92.0
        draw_circle(Vector2(mx, my), 34, Color(0.98, 0.96, 0.88, 0.13))
        draw_circle(Vector2(mx, my), 26, Color(1, 0.98, 0.9))
        draw_circle(Vector2(mx + 9, my - 4), 5.5, Color(0.93, 0.91, 0.82))
        draw_circle(Vector2(mx - 7, my + 8), 4, Color(0.93, 0.91, 0.82))
        draw_circle(Vector2(mx + 2, my + 12), 3, Color(0.9, 0.88, 0.8))

func _draw_stars() -> void:
        var t := Time.get_ticks_msec() / 1000.0
        for s in stars:
                var tw := 0.55 + 0.45 * sin(t * s.sp + s.ph)
                draw_circle(Vector2(s.x, s.y), s.r, Color(1, 1, 0.95, 0.5 * tw * (1.0 - dayness)))

func _draw_hills() -> void:
        var vw := get_viewport_rect().size.x
        for h in hills2:
                draw_rect(Rect2(h.x, GROUND_Y - h.h * 0.6, 86, h.h * 0.6 + 4), Color("131c36"))
        for h in hills1:
                draw_rect(Rect2(h.x, GROUND_Y - h.h, 62, h.h + 4), Color("1a2442"))

func _draw_skyline() -> void:
        for b in skyline:
                draw_rect(Rect2(b.x, GROUND_Y - b.h, b.w, b.h), Color(0.02, 0.03, 0.07, 0.92))
                draw_rect(Rect2(b.x + 4, GROUND_Y - b.h + 5, 4, 3), Color(1, 0.84, 0.48, 0.75))
                draw_rect(Rect2(b.x + 11, GROUND_Y - b.h + 12, 4, 3), Color(1, 0.84, 0.48, 0.55))

func _draw_ground(vw: float) -> void:
        draw_rect(Rect2(0, GROUND_Y, vw, 80), Color("22301f"))
        draw_rect(Rect2(0, GROUND_Y, vw, 4), Color("31452c"))
        # جاده
        draw_rect(Rect2(0, GROUND_Y + 22, vw, 26), Color("2b2b33"))
        for x in range(0, int(vw), 46):
                draw_rect(Rect2(x, GROUND_Y + 33, 22, 3.5), Color(0.85, 0.82, 0.6, 0.5))

func _draw_tower() -> void:
        var c := Ctx.new(self)
        var bx := tower_x
        # سایه
        draw_ellipse_shadow(bx, GROUND_Y + 6, TOWER.base_half + 16, 8)
        for fl in range(TOWER.floors):
                var fy: float = GROUND_Y - TOWER.floor_h * (fl + 1)
                var col := Color("6b4a33") if fl == 0 else (Color("7a5638") if fl == 1 else Color("8a6242"))
                c.rr(bx - TOWER.base_half, fy, TOWER.base_half * 2, TOWER.floor_h, 6, col)
                c.fill_rect(bx - TOWER.base_half, fy, TOWER.base_half * 0.9, TOWER.floor_h, Color(1, 1, 1, 0.05))
                c.fill_rect(bx + TOWER.base_half * 0.1, fy, TOWER.base_half * 0.9, TOWER.floor_h, Color(0, 0, 0, 0.13))
                # پنجره‌های روشن
                var lit := 1.0 if G.tower_hp > G.tower_max_hp * 0.66 else (0.5 if G.tower_hp > G.tower_max_hp * 0.33 else 0.2)
                for wx in [-38, -12, 14, 38]:
                        var glow: float = lit * (0.8 + 0.2 * sin(Time.get_ticks_msec() / 700.0 + wx))
                        c.rr(bx + wx - 7, fy + 18, 14, 20, 2, Color(1, 0.84, 0.45, 0.28 * glow))
                        c.rr(bx + wx - 5, fy + 20, 10, 16, 2, Color(1, 0.88, 0.5, 0.85 * glow))
                # آجرها
                draw_line(Vector2(bx - TOWER.base_half + 4, fy + 30), Vector2(bx + TOWER.base_half - 4, fy + 30), Color(0, 0, 0, 0.16), 1.5)
        # کنگره‌ی بام
        for x in range(-3, 4):
                c.fill_rect(bx + x * 18 - 5, tower_top_y - 8, 11, 8, Color("93683f"))
        # پرچم
        draw_line(Vector2(bx, tower_top_y - 8), Vector2(bx, tower_top_y - 30), Color("5a4632"), 2.5)
        var flap := 3.0 * sin(Time.get_ticks_msec() / 380.0)
        var pts := PackedVector2Array([Vector2(bx, tower_top_y - 30), Vector2(bx + 18 + flap, tower_top_y - 26), Vector2(bx, tower_top_y - 21)])
        draw_colored_polygon(pts, Color("c9a35a"))

func draw_ellipse_shadow(x: float, y: float, rx: float, ry: float) -> void:
        var pts := PackedVector2Array()
        for i in range(16):
                var t := TAU * i / 16.0
                pts.append(Vector2(x + cos(t) * rx, y + sin(t) * ry))
        draw_colored_polygon(pts, Color(0, 0, 0, 0.3))

func _draw_player(c: Ctx) -> void:
        var px := tower_x
        var py := tower_top_y - 12
        var aim_ang: float = (aim - Vector2(px, py)).angle()
        # پاها روی لبه‌ی بام
        c.fill_rect(px - 6, py + 4, 5, 8, Color("2c3547"))
        c.fill_rect(px + 1, py + 4, 5, 8, Color("2c3547"))
        # تنه: کاپشن
        c.rr(px - 8, py - 14, 16, 20, 5, Color("3a4a63"))
        c.fill_rect(px - 8, py - 14, 7, 20, Color(1, 1, 1, 0.08))
        c.fill_rect(px + 1, py - 14, 7, 20, Color(0, 0, 0, 0.14))
        c.rr_outline(px - 8, py - 14, 16, 20, 5, Color(0.03, 0.05, 0.08, 0.55), 1.1)
        # سر + مو + ریش
        c.fill_circle(px, py - 19, 6, Color("e3b98a"))
        c.fill_circle(px - 1.6, py - 20.5, 4, Color("eecba0"))
        c.begin_path()
        for i in range(12):
                var t: float = lerp(PI * 0.6, PI * 1.75, float(i) / 11.0)
                c.line_to(px + 6.6 * cos(t), py - 19 + 6.6 * sin(t))
        c.set_fill(Color("3d2f1e"))
        c.fill()
        c.fill_rect(px - 4.5, py - 15.5, 9, 4, Color("4a3826"))   # ریش
        # اسلحه همراه زاویه‌ی هدف
        draw_set_transform(Vector2(px + 3, py - 7), aim_ang, Vector2.ONE)
        c.fill_rect(0, -2.2, 20, 4.4, Color("23282f"))
        c.fill_rect(4, -3.4, 6, 2.6, Color("3a4250"))
        c.fill_rect(16, -1.4, 5, 2.8, Color("14171c"))
        draw_set_transform_matrix(Transform2D())
        # بازو
        c.begin_path(); c.move_to(px + 4, py - 6); c.line_to(px + 10, py - 9)
        c.stroke(Color("e3b98a"), 3.4)
