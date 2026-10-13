# ==================================================================
# سه طبقه تا مرگ — داده‌های بازی (پورت وفادار از نسخه‌ی HTML)
# ZTYPES/WEAPONS/TURRETS/ITEMS/UPGRADES — همان اعداد نسخه‌ی اصلی
# ==================================================================
extends RefCounted
class_name D

# ---- ساختار فصل‌ها: ۶+۸+۱۰+۱۲ = ۳۶ موج؛ موج ۳۶ = آخرین شب ----
const WAVES_CH := [6, 8, 10, 12]
const FINAL_WAVE := 36
const CHAPTERS := [
        {"id": 1, "title": "محله‌ی قدیمی", "sub": "شب‌های آجری",
         "tower_style": "brick", "theme": "night"},
        {"id": 2, "title": "منطقه‌ی انبارها", "sub": "مه و قطع برق",
         "tower_style": "steel", "theme": "fog"},
        {"id": 3, "title": "پاسگاه نظامی", "sub": "ماه خونی و خاکستر",
         "tower_style": "ruins", "theme": "blood_moon"},
        {"id": 4, "title": "برج مخابراتی", "sub": "رعد و برف",
         "tower_style": "azure", "theme": "storm"},
]

static func waves_in_chapter(ch: int) -> int:
        return WAVES_CH[clampi(ch, 1, 4) - 1]

static func wave_chapter(w: int) -> int:
        w = clampi(w, 1, FINAL_WAVE)
        var acc := 0
        for c in range(1, 5):
                acc += WAVES_CH[c - 1]
                if w <= acc:
                        return c
        return 4

static func wave_in_chapter(w: int) -> int:
        w = clampi(w, 1, FINAL_WAVE)
        var ch := wave_chapter(w)
        var acc := 0
        for c in range(1, ch):
                acc += WAVES_CH[c - 1]
        return w - acc

# ---- چهار نوع زامبی (همان اعداد) ----
const ZTYPES := {
        "normal": {"r": 15.0, "hp_base": 11.0, "hp_wave": 3.1, "spd_base": 27.0, "spd_wave": 7.5,
                "bite": 1.0, "dmg": 5.0, "coins": [5, 7], "skin": Color("7fa657"), "shirt": Color("4a5d73"), "pants": Color("333d4d")},
        "fast":   {"r": 12.0, "hp_base": 7.0, "hp_wave": 2.2, "spd_base": 64.0, "spd_wave": 9.5,
                "bite": 0.7, "dmg": 3.0, "coins": [4, 5], "skin": Color("c9a35a"), "shirt": Color("7a5a2e"), "pants": Color("4d3d20")},
        "tank":   {"r": 22.0, "hp_base": 64.0, "hp_wave": 13.0, "spd_base": 14.0, "spd_wave": 2.4,
                "bite": 1.5, "dmg": 11.0, "coins": [12, 16], "skin": Color("8a8794"), "shirt": Color("565364"), "pants": Color("3a3846")},
        "boss":   {"r": 50.0, "hp_base": 7000.0, "hp_wave": 0.0, "spd_base": 13.5, "spd_wave": 1.0,
                "bite": 1.8, "dmg": 48.0, "coins": [80, 100], "skin": Color("9c3546"), "shirt": Color("5e1f2c"), "pants": Color("3f151d")},
}

# ---- سه سلاح ----
const WEAPONS := {
        "pistol":  {"name": "کلت", "dmg": 3.0, "rate": 0.30, "spd": 720.0, "pellets": 1, "spread": 0.02,
                "ttl": 2.0, "price": 0, "barrel": 18, "flash": 5, "knock": 5.0},
        "shotgun": {"name": "شاتگان", "dmg": 2.0, "rate": 0.95, "spd": 640.0, "pellets": 6, "spread": 0.16,
                "ttl": 0.5, "price": 120, "barrel": 22, "flash": 9, "knock": 2.6},
        "mg":      {"name": "مسلسل", "dmg": 2.0, "rate": 0.12, "spd": 760.0, "pellets": 1, "spread": 0.055,
                "ttl": 2.0, "price": 260, "barrel": 24, "flash": 6, "knock": 1.6},
}

# ---- شش برجک (سه‌تای اول آزاد، سه‌تای بعدی نقشه‌ی دستفروش) ----
const TURRETS := {
        "gatling": {"name": "برجک مسلسل", "price": 85, "dmg": 1.6, "rate": 0.34, "range": 300},
        "sniper":  {"name": "برجک تک‌تیرانداز", "price": 200, "dmg": 12.0, "rate": 2.15, "range": 520},
        "frost":   {"name": "برجک یخ‌زن", "price": 125, "dmg": 2.0, "rate": 1.05, "range": 260},
        "tesla":   {"name": "برجک تسلا", "price": 240, "dmg": 9.0, "rate": 2.3, "range": 340, "blueprint": true},
        "missile": {"name": "برجک موشک‌انداز", "price": 300, "dmg": 26.0, "rate": 3.4, "range": 640, "blueprint": true},
        "flame":   {"name": "برجک شعله‌افکن", "price": 210, "dmg": 2.4, "rate": 0.085, "range": 170, "blueprint": true},
}

# ---- ارتقاها ----
const UPGRADES := {
        "weapon": {"name": "ارتقای اسلحه", "base": 15, "growth": 1.55, "max": 8},
        "speed":  {"name": "سرعت شلیک", "base": 18, "growth": 1.55, "max": 6},
        "health": {"name": "افزایش جون برج", "base": 12, "growth": 1.45, "max": 8, "bonus": 30},
}

# ---- آیتم‌های بقا ----
const ITEMS := {
        "flashlight": {"name": "چراغ‌قوه", "price": 80},
        "battery":    {"name": "باتری", "price": 30},
        "canned":     {"name": "کنسرو", "price": 25},
        "medkit":     {"name": "کیت کمک‌های اولیه", "price": 45},
        "vest":       {"name": "جلیقه‌ی ضدّ گازگزش", "price": 260},
        "goldAmmo":   {"name": "فشنگ‌های طلایی", "price": 320},
        "helmet":     {"name": "کلاهخود فولادی", "price": 200},
        "airstrike":  {"name": "بی‌سیمِ حمله‌ی هوایی", "price": 380},
        "freezeBomb": {"name": "بمب یخی", "price": 240},
        "adrenaline": {"name": "آدرنالین", "price": 190},
}

# ---- پالت رنگ بازی (شب عمیق + طلایی) ----
const PAL := {
        "night_top": Color("0a1128"), "night_bot": Color("1c2b52"),
        "gold": Color("f0b53c"), "gold_light": Color("ffd873"),
        "ground": Color("2a3b2e"), "hp": Color("2ee06b"),
        "text": Color("eef2ff"), "accent": Color("ff6552"),
}

# ارقام فارسی
const FA_DIGITS := "۰۱۲۳۴۵۶۷۸۹"
static func fa_num(n) -> String:
        var s := str(n)
        var out := ""
        for c in s:
                if c >= "0" and c <= "9":
                        out += FA_DIGITS[c.to_int() - "0".to_int()]
                else:
                        out += c
        return out
