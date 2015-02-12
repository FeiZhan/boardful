/**
 * Gui for card.
 *
 * @author		Fei Zhan
 * @version		0.0
**/

var BOARDFUL = BOARDFUL || new Object();

// gui for card
BOARDFUL.CardUi = function (instance, owner) {
	this.type = "CardUi";
	this.instance = instance;
	this.owner = owner;
	this.visible = false;
	BOARDFUL.Mngr.add(this);
	this.addListeners();
	var load_files = new BOARDFUL.FileLoader(["src/browser/card.html", "src/browser/card.css"], function () {
	});
};
// display card
BOARDFUL.CardUi.prototype.load = function (config, callback) {
	config = config || new Object();
	config.parent = config.parent || "";
	var that = this;
	// get card html
	$.get("src/browser/card.html", function (text, status, xhr) {
		// add html to page
		$("#" + BOARDFUL.Menu.Canvas + " " + config.parent).append(text).fadeIn('slow');
		$("#" + BOARDFUL.Menu.Canvas + " " + config.parent + " .card:last").attr("id", that.id);
		var card_jq = $("#" + BOARDFUL.Menu.Canvas + " #" + that.id);
		if (that.visible) {
			card_jq.addClass("visible");
		}
		// set position
		if (config.position) {
			card_jq.css(config.position);
		}
		// set name
		card_jq.find("h4").html(BOARDFUL.Mngr.get(that.instance).name);
		var card_config = BOARDFUL.Mngr.get(BOARDFUL.Mngr.get(BOARDFUL.Mngr.get(that.instance).game).owner).config.cards;
		var back_img = "resources/poker_back.jpg";
		if (card_config && card_config.back) {
			back_img = card_config.back;
		}
		card_jq.find(".back").attr("src", back_img);
		var flip_interval;
		// draggable
		card_jq.draggable({
			revert: "invalid",
			start: function() {
				// flip card when dragging
				flip_interval = setInterval(function () {
					card_jq.toggleClass("flip");
				}, 2000);
			},
			drag: function() {},
			stop: function (event, ui) {
				clearInterval(flip_interval);
				card_jq.removeClass("flip");
			},
		});
		card_jq.hover(function () {
			if (! $(".boardful #detail").hasClass("active")) {
				//$(".boardful #detail").addClass("active").fadeIn("slow");
			}
		}, function () {
			if ($(".boardful #detail").hasClass("active")) {
				$(".boardful #detail").removeClass("active").fadeOut("fast");
			}
		});
		if ("function" == typeof callback) {
			callback(card_jq);
		}
	});
};
// move card
BOARDFUL.CardUi.prototype.move = function (source, target) {
	var jq = $("#" + BOARDFUL.Menu.Canvas + " #" + this.id);
	source = source || jq;
	// if not exist, load card
	if (0 == jq.length) {
		var that = this;
		this.load({
			position: {
				top: "50%",
				left: "80%"
			}
		}, function () {
			that.move(source, target);
		});
	} else {
		// move back to source
		var source_pos = {
			top: source.offset().top + source.height() / 2 - jq.height() / 2,
			left: source.offset().left + source.width() / 2 - jq.width() / 2
		};
		var element = jq.detach();
		$("#" + BOARDFUL.Menu.Canvas).append(element);
		jq = $("#" + BOARDFUL.Menu.Canvas + " #" + this.id);
		jq.offset(source_pos);
		// move to target
		var target_pos = {
			top: target.position().top + target.height() / 2 - jq.height() / 2,
			left: target.position().left + target.width() / 2 - jq.width() / 2
		};
		jq.animate(target_pos, "slow", function () {
			var element = jq.detach();
			target.append(element);
			jq = $("#" + BOARDFUL.Menu.Canvas + " #" + this.id);
			jq.css({
				top: "auto",
				left: "auto",
			});
		});
	}
};
BOARDFUL.CardUi.prototype.remove = function () {
	var jq = $("#" + BOARDFUL.Menu.Canvas + " #" + this.id);
	// don't disturb other cards during removing
	jq.css({
		"position": "absolute"
	});
	// expand and disappear
	jq.animate({
		top: '-=100px',
		left: '-=100px',
		height: '+=200px',
		width: '+=200px',
		opacity: 0,
	}, "slow", function () {
		$(this).remove();
	});
};

BOARDFUL.CardUi.prototype.addListeners = function () {
	var that = this;
	BOARDFUL.Mngr.get(BOARDFUL.Mngr.get(this.instance).game).event_mngr.on("ShowCard", {
		level: "game",
		callback: function (arg) {
			that.show(arg);
		},
		id: that.id
	});
};
BOARDFUL.CardUi.prototype.show = function (arg) {
	if (undefined !== arg && arg.card != this.id && arg.card != this.instance) {
		return;
	}
	this.visible = true;
	var card_jq = $("#" + BOARDFUL.Menu.Canvas + " #" + this.id);
	card_jq.addClass("visible");
};
/**
 * 
 *
 * @author		Fei Zhan
 * @version		0.0
**/

var BOARDFUL = BOARDFUL || new Object();

BOARDFUL.ChangedValue = function (config, owner) {
	this.type = "ChangedValue";
	this.owner = owner;
	BOARDFUL.Mngr.add(this);
	this.run(config);
};
BOARDFUL.ChangedValue.prototype.run = function (config) {
	var content = (config.value >= 0 ? "+" : "") + config.value;
	$("#" + BOARDFUL.Menu.Canvas).append('<div id="' + this.id + '" class="changed_value">' + content + '</div>');
	var jq = $("#" + BOARDFUL.Menu.Canvas + ' #' + this.id);
	jq.offset({
		top: config.source_jq.offset().top,
		left: config.source_jq.offset().left,
	});
	var top = '0px';
	if (jq.offset().top >= $(window).height() / 2) {
		top = '-=100px';
	} else {
		top = '+=100px';
	}
	jq.animate({
		top: top,
		opacity: 0
	}, 5000);
};
/**
 * Gui for game.
 *
 * @author		Fei Zhan
 * @version		0.0
**/

var BOARDFUL = BOARDFUL || new Object();

// game ui
BOARDFUL.GameUi = function (instance) {
	this.type = "GameUi";
	this.instance = instance;
	BOARDFUL.Mngr.add(this);
	BOARDFUL.Command.owner = this.instance;
	this.addListeners();
	$("#" + BOARDFUL.Menu.Canvas).empty();
	var that = this;
	$("#" + BOARDFUL.Menu.Canvas).hide().load("src/browser/game.html", function () {
		$(this).fadeIn("slow");
		$("#" + BOARDFUL.Menu.Canvas + " #playerok").on("click", function () {
			if ("userinput" != BOARDFUL.Mngr.get(that.instance).status) {
				return;
			}
			for (var i in that.player_list) {
				if ("me" == BOARDFUL.Mngr.get(BOARDFUL.Mngr.get(that.player_list[i]).instance).name) {
					// cannot use event here
					BOARDFUL.Mngr.get(that.player_list[i]).playerOk();
				}
			}
		});
		$("#" + BOARDFUL.Menu.Canvas + " #chat div").on("click", function () {
			$(this).toggleClass("disable");
		});
		$("#" + BOARDFUL.Menu.Canvas + " #table").droppable({
			drop: function (event, ui) {
				that.dropCardOnTable(event, ui, this);
			}
		});
	});
	this.player_list = new Array();
	for (var i in BOARDFUL.Mngr.get(this.instance).player_list) {
		var player = BOARDFUL.Mngr.get(this.instance).player_list[i];
		var player_ui = new BOARDFUL.PlayerUi(player, this.id).id;
		BOARDFUL.Mngr.get(player).ui = player_ui;
		this.player_list.push(player_ui);
	}
	var load_files = new BOARDFUL.FileLoader(["src/browser/game.html", "src/browser/game.css"], function () {
	});
};
BOARDFUL.GameUi.prototype.dropCardOnTable = function (event, ui, droppable) {
	if ("userinput" != BOARDFUL.Mngr.get(this.instance).status) {
		return;
	}
	var element = $(ui.draggable).detach();
	element.css({
		top: "auto",
		left: "auto"
	});
	$(droppable).append(element);
};

BOARDFUL.GameUi.prototype.addListeners = function () {
	var that = this;
	BOARDFUL.Mngr.get(this.instance).event_mngr.on("DealCardUi", {
		level: "game",
		callback: function (arg) {
			that.dealCardUi(arg);
		},
		id: that.id
	});
	BOARDFUL.Mngr.get(this.instance).event_mngr.on("PlaceCardOnTable", {
		level: "game",
		callback: function (arg) {
			that.placeCardOnTable(arg);
		},
		id: that.id
	});
	BOARDFUL.Mngr.get(this.instance).event_mngr.on("Discard", {
		level: "game",
		callback: function (arg) {
			that.discard(arg);
		},
		id: that.id
	});
};
// ui for deal cards
BOARDFUL.GameUi.prototype.dealCardUi = function (arg) {
	var card_ui = new BOARDFUL.CardUi(arg.card, this);
	BOARDFUL.Mngr.get(arg.card).ui = card_ui.id;
	var target;
	switch (BOARDFUL.Mngr.get(arg.player).name) {
	case "ai":
		target = $("#player_you .hand");
		break;
	case "me":
	default:
		card_ui.visible = true;
		target = $("#player_me .hand");
		break;
	}
	card_ui.move($("#deck"), target);
};
BOARDFUL.GameUi.prototype.placeCardOnTable = function (arg) {
	for (var i in arg.cards) {
		var card_ui = BOARDFUL.Mngr.get(BOARDFUL.Mngr.get(arg.cards[i]).ui);
		card_ui.move(undefined, $("#table"));
	}
};
// discard
BOARDFUL.GameUi.prototype.discard = function (arg) {
	for (var i in arg.cards) {
		BOARDFUL.Mngr.get(BOARDFUL.Mngr.get(arg.cards[i]).ui).remove();
	}
};
/**
 * Menus.
 *
 * @author		Fei Zhan
 * @version		0.0
**/

var BOARDFUL = BOARDFUL || new Object();

BOARDFUL.Menu = BOARDFUL.Menu || new Object();
BOARDFUL.Menu.Canvas = "";
// launch in browser
BOARDFUL.Menu.run = function (canvas) {
	BOARDFUL.Menu.Canvas = canvas;
	$("#" + BOARDFUL.Menu.Canvas).addClass("boardful");
	$('#header #options').click(function () {
		$("#dialog").toggleClass("active");
	});
	$('#header #sound').click(function () {
		$(this).toggleClass("disable");
	});
	BOARDFUL.Menu.loadOptions();
	BOARDFUL.Menu.loadMenu0();
};
BOARDFUL.Menu.loadOptions = function () {
	$("#dialog").empty();
	$("#dialog").load("src/browser/options.html", function () {
		$('#dialog #options_debug').click(function () {
			$('#dialog > div').removeClass("active");
			$('#dialog #options_l1_debug').addClass("active");
		});
		$('#dialog #options_l1_debug li').click(function () {
			$('#dialog #options_l1_debug li').removeClass("active");
			$(this).addClass("active");
			var id = $(this).attr("id");
			var log_list = new Array();
			switch (id) {
			case "debug_logger":
				log_list = BOARDFUL.logger.list;
				break;
			case "debug_debugger":
				log_list = BOARDFUL.Debugger.list;
				break;
			case "debug_files":
				log_list = BOARDFUL.File.logger.list;
				break;
			case "debug_objects":
				log_list = BOARDFUL.Mngr.logger.list;
				break;
			case "debug_events":
				log_list = new Array();
				var board = BOARDFUL.Mngr.get(BOARDFUL.Menu.Selected);
				if (board) {
					var room = BOARDFUL.Mngr.get(board.room_list[0]);
					if (room) {
						var game = BOARDFUL.Mngr.get(room.game_list[0]);
						if (game) {
							log_list = game.event_mngr.logger.list;
						}
					}
				}
				break;
			case "debug_event_names":
				log_list = new Array();
				var board = BOARDFUL.Mngr.get(BOARDFUL.Menu.Selected);
				if (board) {
					var room = BOARDFUL.Mngr.get(board.room_list[0]);
					if (room) {
						var game = BOARDFUL.Mngr.get(room.game_list[0]);
						if (game) {
							log_list = game.event_mngr.name_logger.list;
						}
					}
				}
				break;
			default:
				log_list = new Array();
				break;
			}
			$('#dialog #options_debug_log').empty();
			for (var i in log_list) {
				$('#dialog #options_debug_log').append('<div>' + log_list[i].content + '</div>');
			}
		});
	});
	var load = new BOARDFUL.FileLoader(["src/browser/options.html", "src/browser/options.css"], function () {});
};

BOARDFUL.Menu.loadMenu0 = function () {
	$("#" + BOARDFUL.Menu.Canvas).empty();
	// load menu0
	$("#" + BOARDFUL.Menu.Canvas).hide().load("src/browser/menu0.html", function () {
		$(this).fadeIn("slow");
		$("#" + BOARDFUL.Menu.Canvas + ' #menu0_main #local').click(function () {
			BOARDFUL.Menu.loadMenu1();
		});
		$("#" + BOARDFUL.Menu.Canvas + ' #menu0_secondary #options').click(function () {
			$("#dialog").toggleClass("active");
		});
	});
	var load = new BOARDFUL.FileLoader(["src/browser/menu0.html", "src/browser/menu0.css"], function () {});
};

BOARDFUL.Menu.Selected = undefined;
// load menu1
BOARDFUL.Menu.loadMenu1 = function () {
	$("#" + BOARDFUL.Menu.Canvas).empty();
	$("#" + BOARDFUL.Menu.Canvas).hide().load("src/browser/menu1.html", function () {
		$(this).fadeIn("slow");
		$("#" + BOARDFUL.Menu.Canvas + " #ok").click(function () {
			if (undefined === BOARDFUL.Menu.Selected) {
				return;
			}
			var board = BOARDFUL.Mngr.get(BOARDFUL.Menu.Selected);
			board.load(BOARDFUL.Menu.loadMenu2);
		});
		$("#" + BOARDFUL.Menu.Canvas + " #exit").click(function () {
			BOARDFUL.Menu.run(BOARDFUL.Menu.Canvas);
		});
		for (var i in BOARDFUL.BoardList) {
			var board = BOARDFUL.Mngr.get(BOARDFUL.BoardList[i]);
			$("#" + BOARDFUL.Menu.Canvas + " #board_list ul").append('<li id="' + BOARDFUL.BoardList[i] + '">' + board.config.name + "</li>");
			if (0 == i) {
				BOARDFUL.Menu.Selected = $("#" + BOARDFUL.Menu.Canvas + " #board_list ul li:last").attr("id");
				$("#" + BOARDFUL.Menu.Canvas + " #board_list ul li:last").addClass("active");
				$("#" + BOARDFUL.Menu.Canvas + " #description div").html(BOARDFUL.Mngr.get(BOARDFUL.Menu.Selected).config.description);
			}
			$("#" + BOARDFUL.Menu.Canvas + " #board_list ul li:last").click(function () {
				BOARDFUL.Menu.Selected = $(this).attr('id');
				$("#" + BOARDFUL.Menu.Canvas + " #board_list li").removeClass("active");
				$(this).addClass("active");
				$("#" + BOARDFUL.Menu.Canvas + " #description div").html(BOARDFUL.Mngr.get(BOARDFUL.Menu.Selected).config.description);
			});
		}
	});
	var load = new BOARDFUL.FileLoader(["src/browser/menu1.html", "src/browser/menu1.css"], function () {});
};
// load menu2
BOARDFUL.Menu.loadMenu2 = function (id) {
	var room = BOARDFUL.Mngr.get(id);
	$("#" + BOARDFUL.Menu.Canvas).empty();
	$("#" + BOARDFUL.Menu.Canvas).hide().load("src/browser/menu2.html", function () {
		$(this).fadeIn("slow");
		$("#" + BOARDFUL.Menu.Canvas + " #ok").on("click", function () {
			var game = new BOARDFUL.Game(id);
			game.ui = new BOARDFUL.GameUi(game.id);
			game.run();
		});
		$("#" + BOARDFUL.Menu.Canvas + " #exit").click(function () {
			BOARDFUL.Menu.run(BOARDFUL.Menu.Canvas);
		});
		$("#" + BOARDFUL.Menu.Canvas + " #room_config li").on("click", function () {
			$("#" + BOARDFUL.Menu.Canvas + " #room_config li").removeClass("active");
			$("#" + BOARDFUL.Menu.Canvas + " #room_config div").removeClass("active");
			$(this).addClass("active");
			$("#" + BOARDFUL.Menu.Canvas + " #room_config div#" + $(this).attr("id")).addClass("active");
		});
		$("#" + BOARDFUL.Menu.Canvas + " #room_config #name").html(room.config.name);
		$("#" + BOARDFUL.Menu.Canvas + " #room_config #description2").html(room.config.description);
		$("#" + BOARDFUL.Menu.Canvas + " #user_list #players").append('<div class="user"><span>me</span></div>');
		$("#" + BOARDFUL.Menu.Canvas + " #user_list #judges").append('<div class="user"><span>empty</span></div>');
		$("#" + BOARDFUL.Menu.Canvas + " #user_list #audience").append('<div class="user"><span>empty</span></div>');
		for (var i = 1; i < room.config.players[0]; ++ i) {
			$("#" + BOARDFUL.Menu.Canvas + " #user_list #players").append('<div class="user"><span>empty</span></div>');
		}
		$("#" + BOARDFUL.Menu.Canvas + " #user_list .user").on("click", function () {
			$("#" + BOARDFUL.Menu.Canvas + " #user_list .user").removeClass("active");
			$(this).addClass("active");
		});
		for (var i in room.config.options) {
			$("#" + BOARDFUL.Menu.Canvas + " #room_config").append('<div id="' + i + '"></div>');
			$("#" + BOARDFUL.Menu.Canvas + " #room_config #" + i).append('<span>' + i + '</span><select></select>');
			for (var j in room.config.options[i].value) {
				$("#" + BOARDFUL.Menu.Canvas + " #room_config #" + i + " select").append('<option value="' + room.config.options[i].value[j] + '">' + room.config.options[i].value[j] + '</option>');
			}
		}
	});
	var load = new BOARDFUL.FileLoader(["src/browser/menu2.html", "src/browser/menu2.css"], function () {});
};

/**
 * Gui for player.
 *
 * @author		Fei Zhan
 * @version		0.0
**/

var BOARDFUL = BOARDFUL || new Object();

// gui for player
BOARDFUL.PlayerUi = function (instance, owner) {
	this.type = "PlayerUi";
	this.instance = instance;
	this.owner = owner;
	BOARDFUL.Mngr.add(this);
	this.canvas = "";
	var load;
	switch (BOARDFUL.Mngr.get(this.instance).name) {
	case "ai":
		load = "src/browser/player_you.html";
		this.canvas = "player_you";
		break;
	case "me":
	default:
		load = "src/browser/player_me.html";
		this.canvas = "player_me";
		break;
	}
	this.addListeners();
	this.play_card_arg = undefined;
	$.get(load, function (text, status, xhr) {
		$("#" + BOARDFUL.Menu.Canvas).append(text).fadeIn('slow');
	});
	var load_files = new BOARDFUL.FileLoader(["src/browser/player_me.html", "src/browser/player_you.html", "src/browser/player.css"], function () {});
};
// 
BOARDFUL.PlayerUi.prototype.playerOk = function () {
	if ("me" != BOARDFUL.Mngr.get(this.instance).name || "userinput" != BOARDFUL.Mngr.get(BOARDFUL.Mngr.get(this.instance).owner).status || undefined === this.play_card_arg) {
		return;
	}
	var card_list = new Array();
	$("#" + BOARDFUL.Menu.Canvas + " #table .card").each(function () {
		var card_ui = parseInt($(this).attr("id"));
		var card = BOARDFUL.Mngr.get(card_ui).instance;
		if ("me" == BOARDFUL.Mngr.get(BOARDFUL.Mngr.get(BOARDFUL.Mngr.get(card).owner).owner).name) {
			card_list.push(card);
		}
	});
	if (card_list.length != this.play_card_arg.number) {
		return;
	}
	var event = new BOARDFUL.Event({
		name: "PlaceCardOnTable",
		source: this.instance,
		source_event: this.play_card_arg.source_event,
		player: this.instance,
		cards: card_list
	});
	BOARDFUL.Mngr.get(BOARDFUL.Mngr.get(this.instance).owner).event_mngr.front(event.id);
	BOARDFUL.Mngr.get(BOARDFUL.Mngr.get(this.instance).owner).status = "run";
};

BOARDFUL.PlayerUi.prototype.addListeners = function () {
	var that = this;
	BOARDFUL.Mngr.get(BOARDFUL.Mngr.get(this.instance).owner).event_mngr.on("PlayCardUi", {
		level: "game",
		callback: function (arg) {
			that.playCardUi(arg);
		},
		id: that.id
	});
	BOARDFUL.Mngr.get(BOARDFUL.Mngr.get(this.instance).owner).event_mngr.on("ChangePlayerValueUi", {
		level: "game",
		callback: function (arg) {
			that.changePlayerValueUi(arg);
		},
		id: that.id
	});
};
// ui for deal cards
BOARDFUL.PlayerUi.prototype.playCardUi = function (arg) {
	if (arg.player != this.instance) {
		return;
	}
	this.play_card_arg = arg;
	BOARDFUL.Mngr.get(BOARDFUL.Mngr.get(this.instance).owner).status = "userinput";
};

BOARDFUL.PlayerUi.prototype.changePlayerValueUi = function (arg) {
	if (arg.player != this.instance) {
		return;
	}
	var target_jq = $("#" + this.canvas + " .head #" + arg.target + " span");
	var value = parseInt(target_jq.html());
	target_jq.html(value + arg.value);
	var cv = new BOARDFUL.ChangedValue({
		source_jq: target_jq,
		value: arg.value,
	}, this.id);
};