extends Node
# تست خودکار گیم‌پلی: منو → شروع بازی → اینترمیشن → موج ۱ → زامبی/شلیک/سکه
var main: Node2D
var game: Node2D
var frames := 0
var checks := []

func _ready() -> void:
	main = preload("res://scripts/main.gd").new()
	add_child(main)

func _process(delta: float) -> void:
	frames += 1
	if frames == 20 and game == null:
		main._on_start_new()
		game = main.game
		checks.append(["game instantiated", game != null])
		checks.append(["mode intermission", G.mode == "intermission"])
	if frames == 900 and game:
		print("DEBUG mode=", G.mode, " intermission_t=", game.intermission_t, " wave=", G.wave)
		checks.append(["wave 1 started", G.wave == 1 and G.mode == "playing"])
		game.aim = Vector2(200, 300)
		game._shoot()
		checks.append(["bullet fired", game.bullets.size() >= 1])
	if frames == 1200 and game:
		checks.append(["zombies spawned", game.zombies.size() >= 1])
		if game.zombies.size() > 0:
			var b = {"pos": Vector2(game.zombies[0].x, game.zombies[0].y - 20), "vel": Vector2(1, 0), "ttl": 1.0, "dmg": 1000.0, "knock": 5.0}
			game._bullet_hits(b)
			checks.append(["kill rewarded", G.kills >= 1 and G.coins > 40]); print("DEBUG kill: kills=", G.kills, " coins=", G.coins, " zombies=", game.zombies.size(), " hp0=", game.zombies[0].hp if game.zombies.size() > 0 else -1)
	if frames == 1600:
		checks.append(["hud alive", game != null and game.hp_label != null])
		checks.append(["save written", G.has_save()])
		for c in checks:
			print(("PASS " if c[1] else "FAIL ") + c[0])
		var fails = checks.filter(func(c): return not c[1]).size()
		print("RESULT: %d/%d pass" % [checks.size() - fails, checks.size()])
		get_tree().quit(1 if fails else 0)

