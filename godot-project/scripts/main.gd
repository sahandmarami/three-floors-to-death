# ==================================================================
# Main — صحنه‌ی ریشه: منو ↔ بازی + زامبی‌های تزئینی منو
# ==================================================================
extends Node2D

var menu: Control
var game: Node2D
var menu_zombies: Array = []
var _menu_ctx: Ctx

func _ready() -> void:
        get_tree().root.content_scale_mode = Window.CONTENT_SCALE_MODE_CANVAS_ITEMS
        _build_menu()
        set_process(true)

func _build_menu() -> void:
        menu = preload("res://scripts/menu.gd").new()
        add_child(menu)
        menu.start_new.connect(_on_start_new)
        menu.continue_game.connect(_on_continue)
        # زامبی‌های تزئینی منو
        for i in range(4):
                var types := ["normal", "fast", "tank", "normal"]
                menu_zombies.append({
                        "type": types[i], "x": -200.0 + i * 500.0 + randf() * 120,
                        "y": 492.0 + randf_range(-3, 3),
                        "walkPhase": randf() * TAU, "attackAnim": 0.0, "attacking": false,
                        "spd": D.ZTYPES[types[i]].spd_base * 0.7, "dead": false, "radius": 15,
                        "hp": 1, "maxHp": 1, "coins": [0, 0],
                })

func _on_start_new() -> void:
        G.wipe_save()
        _start_game()

func _on_continue() -> void:
        G.load_save()
        _start_game()

func _start_game() -> void:
        if menu:
                menu.queue_free()
                menu = null
        menu_zombies.clear()
        var GameScript := load("res://scripts/game.gd")
        game = Node2D.new()
        game.set_script(GameScript)
        add_child(game)

func _process(delta: float) -> void:
        if menu != null:
                for z in menu_zombies:
                        z.walkPhase += delta * (4.0 + z.spd * 0.06)
                        var dir := -1.0 if z.x > 640 else 1.0
                        z.x += dir * z.spd * delta
                        if absf(z.x - 640.0) < 130.0:
                                z.x = 640.0 + (640.0 + randf_range(40, 260)) * (1.0 if randf() < 0.5 else -1.0)
        queue_redraw()

func _draw() -> void:
        if menu == null:
                return
        # پس‌زمینه‌ی زنده‌ی منو (همان دنیای شب)
        var vw := get_viewport_rect().size.x
        draw_rect(Rect2(0, 0, vw, 560), Color("0d1730"))
        draw_rect(Rect2(0, 0, vw, 300), Color("0a1128"))
        # ماه
        draw_circle(Vector2(vw * 0.16, 92), 34, Color(1, 0.98, 0.9, 0.13))
        draw_circle(Vector2(vw * 0.16, 92), 26, Color(1, 0.98, 0.9))
        # ستاره‌ها
        var t := Time.get_ticks_msec() / 1000.0
        for i in range(40):
                var sx: float = fmod(float(i) * 137.0, vw)
                var sy: float = fmod(float(i) * 89.0, 260.0)
                draw_circle(Vector2(sx, sy), 0.9, Color(1, 1, 0.95, 0.35 + 0.3 * sin(t * 1.5 + i)))
        # زمین
        draw_rect(Rect2(0, 492, vw, 80), Color("22301f"))
        # برجِ ساده در پس‌زمینه
        var bx := vw * 0.5
        for fl in range(3):
                var fy := 492.0 - 66.0 * (fl + 1)
                var col := Color("6b4a33") if fl == 0 else (Color("7a5638") if fl == 1 else Color("8a6242"))
                draw_rect(Rect2(bx - 68, fy, 136, 66), col)
                for wx in [-38, -12, 14, 38]:
                        var glow: float = 0.6 + 0.25 * sin(t * 0.9 + wx + fl)
                        draw_rect(Rect2(bx + wx - 5, fy + 20, 10, 16), Color(1, 0.88, 0.5, 0.7 * glow))
        # زامبی‌های تزئینی
        var c := Ctx.new(self)
        for z in menu_zombies:
                draw_set_transform(Vector2(z.x, z.y), 0.0, Vector2.ONE)
                ZombieDraw.draw_body(c, z, false)
                draw_set_transform_matrix(Transform2D())
