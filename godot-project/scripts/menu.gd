# ==================================================================
# Menu — منوی اصلی فارسی راست‌چین (طراحی ۲۱٫۴: تمیز و سینمایی)
# ==================================================================
extends Control

signal start_new
signal continue_game

func _ready() -> void:
	set_anchors_preset(Control.PRESET_FULL_RECT)
	_build()

func _build() -> void:
	# پس‌زمینه‌ی تیره‌ی سینمایی
	var bg := ColorRect.new()
	bg.set_anchors_preset(Control.PRESET_FULL_RECT)
	bg.color = Color(0.02, 0.03, 0.08, 0.86)
	add_child(bg)

	var vb := VBoxContainer.new()
	vb.set_anchors_preset(Control.PRESET_CENTER)
	vb.grow_horizontal = Control.GROW_DIRECTION_BOTH
	vb.grow_vertical = Control.GROW_DIRECTION_BOTH
	vb.alignment = BoxContainer.ALIGNMENT_CENTER
	vb.add_theme_constant_override("separation", 10)
	add_child(vb)

	# قاب منو
	var frame := PanelContainer.new()
	var st := StyleBoxFlat.new()
	st.bg_color = Color(0.03, 0.05, 0.12, 0.88)
	st.border_color = Color("e8b54a55")
	st.set_border_width_all(1)
	st.set_corner_radius_all(18)
	st.content_margin_left = 34; st.content_margin_right = 34
	st.content_margin_top = 24; st.content_margin_bottom = 16
	frame.add_theme_stylebox_override("panel", st)
	vb.add_child(frame)

	var fv := VBoxContainer.new()
	fv.alignment = BoxContainer.ALIGNMENT_CENTER
	fv.add_theme_constant_override("separation", 10)
	frame.add_child(fv)

	# عنوان — «مرگ» قرمز
	var title := RichTextLabel.new()
	title.bbcode_enabled = true
	title.fit_content = true
	title.custom_minimum_size = Vector2(430, 84)
	title.append_text("[center][font_size=52][b][color=#f2f5ff]سه طبقه تا [/color][color=#ff6552]مرگ[/color][/b][/font_size][/center]")
	fv.add_child(title)

	var tag := Label.new()
	tag.text = "شهر ساکت است... و شب‌ها تازه شروع شده‌اند"
	tag.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	tag.add_theme_font_size_override("font_size", 14)
	tag.add_theme_color_override("font_color", Color("a9badd"))
	fv.add_child(tag)

	var divider := ColorRect.new()
	divider.custom_minimum_size = Vector2(210, 2)
	fv.add_child(divider)

	# دکمه‌ها — هم‌عرض
	var new_btn := _menu_btn("🎮 بازی جدید", "btn_start")
	new_btn.custom_minimum_size = Vector2(272, 52)
	_gold_style(new_btn)
	fv.add_child(new_btn)

	var cont_btn := _menu_btn("▶ ادامه‌ی بازی", "btn_continue")
	cont_btn.custom_minimum_size = Vector2(272, 46)
	fv.add_child(cont_btn)

	# ردیف کوچک
	var mini := HBoxContainer.new()
	mini.alignment = BoxContainer.ALIGNMENT_CENTER
	mini.add_theme_constant_override("separation", 12)
	fv.add_child(mini)
	mini.add_child(_mini_btn("⚙️ تنظیمات"))
	mini.add_child(_mini_btn("ℹ️ درباره"))

	# چیپ آمار
	var stats := Label.new()
	stats.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	stats.add_theme_font_size_override("font_size", 12)
	stats.add_theme_color_override("font_color", Color("ffd873"))
	if G.has_save():
		stats.text = "🌙 شب %s از %s   🧟 %s زامبی‌کُش   💰 %s سکه" % [
			D.fa_num(G.wave), D.fa_num(D.FINAL_WAVE), D.fa_num(G.kills), D.fa_num(G.coins)]
		cont_btn.disabled = false
	else:
		stats.text = "🌙 ۳۶ شبِ سخت تا پناهگاه"
		cont_btn.disabled = true
	fv.add_child(stats)

	# فوتر
	var foot := Label.new()
	foot.text = "ساخته‌ی سهند مرامی"
	foot.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	foot.add_theme_font_size_override("font_size", 10)
	foot.add_theme_color_override("font_color", Color("7d88a8"))
	fv.add_child(foot)

func _menu_btn(txt: String, _id: String) -> Button:
	var b := Button.new()
	b.text = txt
	b.add_theme_font_size_override("font_size", 17)
	b.add_theme_color_override("font_color", Color("eef2ff"))
	b.add_theme_color_override("font_hover_color", Color.WHITE)
	var st := StyleBoxFlat.new()
	st.bg_color = Color(0.09, 0.13, 0.25, 0.95)
	st.border_color = Color("3d5da0")
	st.set_border_width_all(1)
	st.set_corner_radius_all(12)
	st.content_margin_left = 22; st.content_margin_right = 22
	st.content_margin_top = 10; st.content_margin_bottom = 10
	b.add_theme_stylebox_override("normal", st)
	var sth := st.duplicate()
	sth.border_color = Color("e8b54a")
	sth.bg_color = Color(0.13, 0.2, 0.38, 0.97)
	b.add_theme_stylebox_override("hover", sth)
	b.add_theme_stylebox_override("pressed", sth)
	b.add_theme_stylebox_override("focus", sth)
	b.pressed.connect(func():
		Snd.click()
		if _id == "btn_start":
			start_new.emit()
		else:
			continue_game.emit())
	return b

func _gold_style(b: Button) -> void:
	var st := StyleBoxFlat.new()
	st.bg_color = Color("f0b53c")
	st.border_color = Color("ffe9a8")
	st.set_border_width_all(1)
	st.set_corner_radius_all(13)
	st.content_margin_left = 46; st.content_margin_right = 46
	st.content_margin_top = 13; st.content_margin_bottom = 13
	b.add_theme_stylebox_override("normal", st)
	var sth := st.duplicate()
	sth.bg_color = Color("ffd873")
	b.add_theme_stylebox_override("hover", sth)
	b.add_theme_stylebox_override("pressed", sth)
	b.add_theme_stylebox_override("focus", sth)
	b.add_theme_color_override("font_color", Color("141a2e"))
	b.add_theme_color_override("font_hover_color", Color("141a2e"))
	b.add_theme_color_override("font_pressed_color", Color("141a2e"))
	b.add_theme_color_override("font_focus_color", Color("141a2e"))

func _mini_btn(txt: String) -> Button:
	var b := Button.new()
	b.text = txt
	b.custom_minimum_size = Vector2(118, 34)
	b.add_theme_font_size_override("font_size", 12)
	b.add_theme_color_override("font_color", Color("d5dfef"))
	var st := StyleBoxFlat.new()
	st.bg_color = Color(0.09, 0.13, 0.26, 0.92)
	st.border_color = Color("3d5da0")
	st.set_border_width_all(1)
	st.set_corner_radius_all(99)
	st.content_margin_left = 18; st.content_margin_right = 18
	st.content_margin_top = 7; st.content_margin_bottom = 7
	b.add_theme_stylebox_override("normal", st)
	var sth := st.duplicate()
	sth.border_color = Color("e8b54a")
	b.add_theme_stylebox_override("hover", sth)
	b.add_theme_stylebox_override("pressed", sth)
	b.add_theme_stylebox_override("focus", sth)
	b.pressed.connect(func(): Snd.click())
	return b
