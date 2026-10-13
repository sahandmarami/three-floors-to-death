# ==================================================================
# Snd — سیستم صدا: جلوه‌ها + گفتار شخصیت‌ها (/autoload)
# SFX: فایل‌های WAV سنتز‌شده با همان پارامترهای نسخه‌ی HTML
# Voice: ۶۳ کلیپ MP3 الون‌لبز — گفتار + دروازه‌ی تکرار
# ==================================================================
extends Node

var _players: Array[AudioStreamPlayer] = []
var _voice_player: AudioStreamPlayer
var _ambience: AudioStreamPlayer
var _gate: Dictionary = {}
var sfx_on := true
var voice_on := true
var master_vol := 0.9

signal voice_started(key)
signal voice_finished(key)

func _ready() -> void:
	bus_setup()
	for i in range(10):
		var p := AudioStreamPlayer.new()
		p.bus = "SFX"
		add_child(p)
		_players.append(p)
	_voice_player = AudioStreamPlayer.new()
	_voice_player.bus = "Voice"
	add_child(_voice_player)
	_ambience = AudioStreamPlayer.new()
	_ambience.bus = "Ambience"
	_ambience.stream = load_res("res://audio/sfx/wind_loop.wav")
	add_child(_ambience)

func bus_setup() -> void:
	# بوس‌ها: Master > SFX / Voice / Ambience
	if AudioServer.get_bus_index("SFX") == -1:
		AudioServer.add_bus()
		AudioServer.set_bus_name(AudioServer.bus_count - 1, "SFX")
		AudioServer.set_bus_send(AudioServer.get_bus_index("SFX"), "Master")
	if AudioServer.get_bus_index("Voice") == -1:
		AudioServer.add_bus()
		AudioServer.set_bus_name(AudioServer.bus_count - 1, "Voice")
		AudioServer.set_bus_send(AudioServer.get_bus_index("Voice"), "Master")
	if AudioServer.get_bus_index("Ambience") == -1:
		AudioServer.add_bus()
		AudioServer.set_bus_name(AudioServer.bus_count - 1, "Ambience")
		AudioServer.set_bus_send(AudioServer.get_bus_index("Ambience"), "Master")

func load_res(path: String) -> AudioStream:
	if ResourceLoader.exists(path):
		return load(path)
	return null

func _gate_ok(name: String, ms: float) -> bool:
	var t := Time.get_ticks_msec()
	if _gate.has(name) and _gate[name] + ms > t:
		return false
	_gate[name] = t
	return true

func _pick_player() -> AudioStreamPlayer:
	for p in _players:
		if not p.playing:
			return p
	return _players[0]

func play(name: String, vol_db := 0.0) -> void:
	if not sfx_on:
		return
	var st := load_res("res://audio/sfx/%s.wav" % name)
	if st == null:
		return
	var p := _pick_player()
	p.stream = st
	p.volume_db = vol_db
	p.play()

# ---- API هم‌نام با نسخه‌ی HTML ----
func click() -> void: play("click")
func shoot(weapon: String) -> void:
	match weapon:
		"pistol": play("shoot_p")
		"shotgun": play("shoot_s")
		"mg": play("shoot_m")
func hit() -> void:
	if _gate_ok("hit", 60): play("hit")
func crit() -> void:
	if _gate_ok("crit", 60): play("crit")
func combo(n: int) -> void:
	var k := "combo5" if n >= 5 else ("combo3" if n >= 3 else "combo1")
	play(k)
func death() -> void:
	if _gate_ok("death", 70): play("death")
func coin() -> void:
	if _gate_ok("coin", 70): play("coin")
func tower_hit() -> void:
	if _gate_ok("towerHit", 90): play("tower_hit")
func buy() -> void: play("buy")
func deny() -> void: play("deny")
func wave_start() -> void: play("wave")
func clear_() -> void: play("clear")
func gameover() -> void: play("gameover")
func victory() -> void: play("victory")
func trap() -> void:
	if _gate_ok("trap", 200): play("trap")
func roar() -> void: play("roar")
func boss_die() -> void: play("boss_die")
func thunder() -> void:
	if _gate_ok("thunder", 800): play("thunder")
func power() -> void: play("power")
func freeze() -> void: play("freeze")
func heartbeat() -> void: play("heartbeat")
func slowmo() -> void: play("slowmo")
func morning() -> void: play("morning")
func dusk() -> void: play("dusk")
func tur_shot() -> void:
	if _gate_ok("turShot", 110): play("tur_shot")
func sniper_shot() -> void:
	if _gate_ok("sniperShot", 300): play("sniper")
func frost_shot() -> void:
	if _gate_ok("frostShot", 150): play("frost_shot")
func zap() -> void:
	if _gate_ok("zap", 120): play("zap")
func missile_shot() -> void:
	if _gate_ok("missileShot", 250): play("missile_shot")
func missile_boom() -> void:
	if _gate_ok("missileBoom", 90): play("missile_boom")
func flame_shot() -> void:
	if _gate_ok("flameShot", 70): play("flame_shot")
func place_t() -> void: play("place_t")
func blip() -> void: play("blip")

# ---- گفتار: ۶۳ کلیپ الون‌لبز ----
const VOICE_PATH := "res://audio/voice/%s.mp3"

func voice_dur(key: String) -> float:
	var st := load_res(VOICE_PATH % key)
	if st is AudioStreamMP3:
		return st.get_length()
	return 0.0

func speak(key: String) -> float:
	if not voice_on:
		return 0.0
	var st := load_res(VOICE_PATH % key)
	if st == null:
		return 0.0
	_voice_player.stream = st
	_voice_player.play()
	voice_started.emit(key)
	return st.get_length()

func stop_voice() -> void:
	_voice_player.stop()

func ambience_on(on: bool) -> void:
	if on and not _ambience.playing:
		_ambience.play()
	elif not on and _ambience.playing:
		_ambience.stop()

func set_master(vol: float) -> void:
	master_vol = clampf(vol, 0.0, 1.0)
	var db := linear_to_db(master_vol) if master_vol > 0.01 else -60.0
	for bus_name in ["Master", "SFX", "Voice", "Ambience"]:
		var idx := AudioServer.get_bus_index(bus_name)
		if idx >= 0:
			AudioServer.set_bus_volume_db(idx, db)

func toggle_sfx() -> bool:
	sfx_on = not sfx_on
	return sfx_on

func toggle_voice() -> bool:
	voice_on = not voice_on
	return voice_on
