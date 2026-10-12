# ==================================================================
# G — وضعیت سراسری بازی: جون/سکه/موج/ارتقا/کوله/سیو (autoload)
# پورت وفادار از state + saveGame نسخه‌ی HTML (localStorage → user://save.json)
# ==================================================================
extends Node

const SAVE_PATH := "user://save.json"

# ---- وضعیت بازی ----
var mode: String = "start"            # start/playing/intermission/day/paused/story/gameover/victory
var wave := 0                         # موج فعلی (۱..۳۶)
var night := 1
var coins := 40
var tower_hp := 100.0
var tower_max_hp := 100.0
var kills := 0
var earned := 0

# سلاح‌ها و ارتقاها
var weapons_owned := {"pistol": true, "shotgun": false, "mg": false}
var weapon := "pistol"
var upgrades := {"weapon": 0, "speed": 0, "health": 0}

# کوله‌پشتی (۶ جا)
var backpack: Array = []
const BACKPACK_MAX := 6

# برجک‌های نصب‌شده روی برج: {type, level, slot}
var turrets: Array = []

# نقشه‌های دستفروش (برجک‌های ویژه)
var blueprints := {"tesla": false, "missile": false, "flame": false}

# آمار منو
var best_night := 0

signal coins_changed(v)
signal hp_changed(v, max_v)
signal wave_changed(w)
signal backpack_changed

func _ready() -> void:
	load_save()

func reset_run() -> void:
	wave = 0; night = 1; coins = 40
	tower_hp = 100.0; tower_max_hp = 100.0
	kills = 0; earned = 0
	weapons_owned = {"pistol": true, "shotgun": false, "mg": false}
	weapon = "pistol"
	upgrades = {"weapon": 0, "speed": 0, "health": 0}
	backpack = []
	turrets = []
	blueprints = {"tesla": false, "missile": false, "flame": false}

# ---- موج‌ها/فصل‌ها ----
func chapter() -> int:
	return D.wave_chapter(wave)

func wave_in_ch() -> int:
	return D.wave_in_chapter(wave)

# ---- اقتصاد ----
func add_coins(v: int) -> void:
	coins += v
	coins_changed.emit(coins)

func spend(v: int) -> bool:
	if coins < v:
		return false
	coins -= v
	coins_changed.emit(coins)
	return true

func damage_tower(v: float) -> void:
	tower_hp = maxf(0.0, tower_hp - v)
	hp_changed.emit(tower_hp, tower_max_hp)

func heal_tower(v: float) -> void:
	tower_hp = minf(tower_max_hp, tower_hp + v)
	hp_changed.emit(tower_hp, tower_max_hp)

# ---- ارتقا: قیمت تصاعدی ----
func upgrade_price(kind: String) -> int:
	var u: Dictionary = D.UPGRADES[kind]
	return int(u.base * pow(u.growth, upgrades[kind]))

func buy_upgrade(kind: String) -> bool:
	if upgrades[kind] >= D.UPGRADES[kind].max:
		return false
	if not spend(upgrade_price(kind)):
		return false
	upgrades[kind] += 1
	if kind == "health":
		tower_max_hp += D.UPGRADES.health.bonus
		heal_tower(D.UPGRADES.health.bonus)
	return true
func weapon_dmg() -> float:
	var base: float = D.WEAPONS[weapon].dmg
	return base * (1.0 + upgrades.weapon * 0.18)
func weapon_rate() -> float:
	var base: float = D.WEAPONS[weapon].rate
	return base / (1.0 + upgrades.speed * 0.08)
# ---- کوله‌پشتی ----
func backpack_add(item: String) -> bool:
	if backpack.size() >= BACKPACK_MAX:
		return false
	backpack.append(item)
	backpack_changed.emit()
	return true

func backpack_use(idx: int) -> void:
	if idx < 0 or idx >= backpack.size():
		return
	backpack.remove_at(idx)
	backpack_changed.emit()

# ---- سیو ----
func save_game() -> void:
	var data := {
		"version": 214, "wave": wave, "night": night, "coins": coins,
		"tower_hp": tower_hp, "tower_max_hp": tower_max_hp,
		"kills": kills, "earned": earned,
		"weapons_owned": weapons_owned, "weapon": weapon,
		"upgrades": upgrades, "backpack": backpack,
		"turrets": turrets, "blueprints": blueprints,
		"best_night": best_night,
	}
	var f := FileAccess.open(SAVE_PATH, FileAccess.WRITE)
	if f:
		f.store_string(JSON.stringify(data))
		f.close()

func has_save() -> bool:
	return FileAccess.file_exists(SAVE_PATH)

func load_save() -> bool:
	if not has_save():
		return false
	var f := FileAccess.open(SAVE_PATH, FileAccess.READ)
	if f == null:
		return false
	var data = JSON.parse_string(f.get_as_text())
	f.close()
	if typeof(data) != TYPE_DICTIONARY:
		return false
	for k in ["wave", "night", "coins", "kills", "earned", "best_night"]:
		if data.has(k):
			set(k, int(data[k]))
	for k in ["tower_hp", "tower_max_hp"]:
		if data.has(k):
			set(k, float(data[k]))
	if data.has("weapons_owned"):
		weapons_owned = data["weapons_owned"]
	if data.has("weapon"):
		weapon = data["weapon"]
	if data.has("upgrades"):
		upgrades = data["upgrades"]
	if data.has("backpack"):
		backpack = data["backpack"]
	if data.has("turrets"):
		turrets = data["turrets"]
	if data.has("blueprints"):
		blueprints = data["blueprints"]
	return true

func wipe_save() -> void:
	if has_save():
		DirAccess.remove_absolute(ProjectSettings.globalize_path(SAVE_PATH))
	reset_run()
