/**
 * Gui for card.
 *
 * @author		Fei Zhan
 * @version		0.0
**/

var BOARDFUL = BOARDFUL || new Object();
BOARDFUL.BRSR = BOARDFUL.BRSR || new Object();

// gui for card
BOARDFUL.BRSR.CardUi = function (instance, owner) {
	this.type = "CardUi";
	this.instance = instance;
	this.owner = owner;
	BOARDFUL.Mngr.add(this);
	var load_files = new BOARDFUL.CORE.FileLoader(["src/browser/card.html", "src/browser/card.css"], function () {
	});
};
// display card
BOARDFUL.BRSR.CardUi.prototype.load = function (config, callback) {
	config = config || new Object();
	config.parent = config.parent || "";
	var that = this;
	// get card html
	$.get("src/browser/card.html", function (text, status, xhr) {
		// add html to page
		$("#" + BOARDFUL.BRSR.Canvas + " " + config.parent).append(text).fadeIn('slow');
		$("#" + BOARDFUL.BRSR.Canvas + " " + config.parent + " .card:last").attr("id", that.id);
		var card_jq = $("#" + BOARDFUL.BRSR.Canvas + " #" + that.id);
		// set position
		if (config.position) {
			card_jq.css(config.position);
		}
		// set name
		card_jq.find("h4").html(BOARDFUL.Mngr.get(that.instance).name);
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
BOARDFUL.BRSR.CardUi.prototype.move = function (source, target) {
	var jq = $("#" + BOARDFUL.BRSR.Canvas + " #" + this.id);
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
		$("#" + BOARDFUL.BRSR.Canvas).append(element);
		jq = $("#" + BOARDFUL.BRSR.Canvas + " #" + this.id);
		jq.offset(source_pos);
		// move to target
		var target_pos = {
			top: target.position().top + target.height() / 2 - jq.height() / 2,
			left: target.position().left + target.width() / 2 - jq.width() / 2
		};
		jq.animate(target_pos, "slow", function () {
			var element = jq.detach();
			target.append(element);
			jq = $("#" + BOARDFUL.BRSR.Canvas + " #" + this.id);
			jq.css({
				top: "auto",
				left: "auto",
			});
		});
	}
};
BOARDFUL.BRSR.CardUi.prototype.remove = function () {
	var jq = $("#" + BOARDFUL.BRSR.Canvas + " #" + this.id);
	// move out
	var source_pos = {
		top: jq.offset().top + jq.height() / 2 - jq.height() / 2,
		left: jq.offset().left + jq.width() / 2 - jq.width() / 2
	};
	var element = jq.detach();
	$("#" + BOARDFUL.BRSR.Canvas).append(element);
	jq = $("#" + BOARDFUL.BRSR.Canvas + " #" + this.id);
	jq.offset(source_pos);
	jq.attr("float", "inherit");
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
/**
 * Gui for game.
 *
 * @author		Fei Zhan
 * @version		0.0
**/

var BOARDFUL = BOARDFUL || new Object();
BOARDFUL.BRSR = BOARDFUL.BRSR || new Object();

// game ui
BOARDFUL.BRSR.GameUi = function (instance) {
	this.type = "GameUi";
	this.instance = instance;
	BOARDFUL.Mngr.add(this);
	BOARDFUL.CORE.Command.owner = this.instance;
	this.addListeners();
	$("#" + BOARDFUL.BRSR.Canvas).empty();
	var that = this;
	$("#" + BOARDFUL.BRSR.Canvas).hide().load("src/browser/game.html", function () {
		$(this).fadeIn("slow");
		$("#" + BOARDFUL.BRSR.Canvas + " #playerok").on("click", function () {
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
		$("#" + BOARDFUL.BRSR.Canvas + " #chat div").on("click", function () {
			$(this).toggleClass("disable");
		});
		$("#" + BOARDFUL.BRSR.Canvas + " #table").droppable({
			drop: function (event, ui) {
				that.dropCardOnTable(event, ui, this);
			}
		});
	});
	this.player_list = new Array();
	for (var i in BOARDFUL.Mngr.get(this.instance).player_list) {
		var player = BOARDFUL.Mngr.get(this.instance).player_list[i];
		var player_ui = new BOARDFUL.BRSR.PlayerUi(player, this.id).id;
		BOARDFUL.Mngr.get(player).ui = player_ui;
		this.player_list.push(player_ui);
	}
	var load_files = new BOARDFUL.CORE.FileLoader(["src/browser/game.html", "src/browser/game.css"], function () {
	});
};
BOARDFUL.BRSR.GameUi.prototype.dropCardOnTable = function (event, ui, droppable) {
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

BOARDFUL.BRSR.GameUi.prototype.addListeners = function () {
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
	BOARDFUL.Mngr.get(this.instance).event_mngr.on("SettlePlayersDuelUi", {
		level: "game",
		callback: function (arg) {
			that.settlePlayersDuelUi(arg);
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
BOARDFUL.BRSR.GameUi.prototype.dealCardUi = function (arg) {
	var card_ui = new BOARDFUL.BRSR.CardUi(arg.card, this);
	BOARDFUL.Mngr.get(arg.card).ui = card_ui.id;
	var target;
	switch (BOARDFUL.Mngr.get(arg.player).name) {
	case "ai":
		target = $("#yourhand");
		break;
	case "me":
	default:
		target = $("#myhand");
		break;
	}
	card_ui.move($("#deck"), target);
};
BOARDFUL.BRSR.GameUi.prototype.placeCardOnTable = function (arg) {
	for (var i in arg.cards) {
		var card_ui = BOARDFUL.Mngr.get(BOARDFUL.Mngr.get(arg.cards[i]).ui);
		card_ui.move(undefined, $("#table"));
	}
};
BOARDFUL.BRSR.GameUi.prototype.settlePlayersDuelUi = function (arg) {
	console.log("winner", BOARDFUL.Mngr.get(arg.player).name);
};
BOARDFUL.BRSR.GameUi.prototype.discard = function (arg) {
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
BOARDFUL.BRSR = BOARDFUL.BRSR || new Object();

// launch in browser
BOARDFUL.BRSR.run = function (canvas) {
	BOARDFUL.BRSR.Canvas = canvas;
	$("#" + BOARDFUL.BRSR.Canvas).addClass("boardful");
	$("#dialog").dialog({
		autoOpen: false,
		show: {
			effect: "fadeIn",
			duration: 500
		},
		hide: {
			effect: "fadeOut",
			duration: 500
		}
	});
	$('#header #options').click(function () {
		if ($("#dialog").dialog("isOpen")) {
			$("#dialog").dialog("close");
		} else {
			$("#dialog").dialog("open");
		}
	});
	$('#header #sound').click(function () {
		$(this).toggleClass("disable");
	});
	$("#" + BOARDFUL.BRSR.Canvas).empty();
	// load menu0
	$("#" + BOARDFUL.BRSR.Canvas).hide().load("src/browser/menu0.html", function () {
		$(this).fadeIn("slow");
		$("#" + BOARDFUL.BRSR.Canvas + ' #menu0_main #local').click(function () {
			BOARDFUL.BRSR.loadMenu1();
		});
		$("#" + BOARDFUL.BRSR.Canvas + ' #menu0_secondary #options').click(function () {
			$("#dialog").dialog("open");
		});
	});
	var load = new BOARDFUL.CORE.FileLoader(["src/browser/menu0.html", "src/browser/menu0.css"], function () {});
};
BOARDFUL.BRSR.Selected = undefined;
// load menu1
BOARDFUL.BRSR.loadMenu1 = function () {
	$("#" + BOARDFUL.BRSR.Canvas).empty();
	$("#" + BOARDFUL.BRSR.Canvas).hide().load("src/browser/menu1.html", function () {
		$(this).fadeIn("slow");
		$("#" + BOARDFUL.BRSR.Canvas + " #ok").click(function () {
			if (undefined === BOARDFUL.BRSR.Selected) {
				return;
			}
			var board = BOARDFUL.Mngr.get(BOARDFUL.BRSR.Selected);
			board.load(BOARDFUL.BRSR.loadMenu2);
		});
		$("#" + BOARDFUL.BRSR.Canvas + " #exit").click(function () {
			BOARDFUL.BRSR.run(BOARDFUL.BRSR.Canvas);
		});
		for (var i in BOARDFUL.BoardList) {
			var board = BOARDFUL.Mngr.get(BOARDFUL.BoardList[i]);
			$("#" + BOARDFUL.BRSR.Canvas + " #board_list ul").append('<li id="' + BOARDFUL.BoardList[i] + '">' + board.config.name + "</li>");
			if (0 == i) {
				BOARDFUL.BRSR.Selected = $("#" + BOARDFUL.BRSR.Canvas + " #board_list ul li:last").attr("id");
				$("#" + BOARDFUL.BRSR.Canvas + " #board_list ul li:last").addClass("active");
				$("#" + BOARDFUL.BRSR.Canvas + " #description div").html(BOARDFUL.Mngr.get(BOARDFUL.BRSR.Selected).config.description);
			}
			$("#" + BOARDFUL.BRSR.Canvas + " #board_list ul li:last").click(function () {
				BOARDFUL.BRSR.Selected = $(this).attr('id');
				$("#" + BOARDFUL.BRSR.Canvas + " #board_list li").removeClass("active");
				$(this).addClass("active");
				$("#" + BOARDFUL.BRSR.Canvas + " #description div").html(BOARDFUL.Mngr.get(BOARDFUL.BRSR.Selected).config.description);
			});
		}
	});
	var load = new BOARDFUL.CORE.FileLoader(["src/browser/menu1.html", "src/browser/menu1.css"], function () {});
};
// load menu2
BOARDFUL.BRSR.loadMenu2 = function (id) {
	var room = BOARDFUL.Mngr.get(id);
	$("#" + BOARDFUL.BRSR.Canvas).empty();
	$("#" + BOARDFUL.BRSR.Canvas).hide().load("src/browser/menu2.html", function () {
		$(this).fadeIn("slow");
		$("#" + BOARDFUL.BRSR.Canvas + " #ok").on("click", function () {
			var game = new BOARDFUL.CORE.Game(id);
			game.ui = new BOARDFUL.BRSR.GameUi(game.id);
			game.run();
		});
		$("#" + BOARDFUL.BRSR.Canvas + " #exit").click(function () {
			BOARDFUL.BRSR.run(BOARDFUL.BRSR.Canvas);
		});
		$("#" + BOARDFUL.BRSR.Canvas + " #room_config li").on("click", function () {
			$("#" + BOARDFUL.BRSR.Canvas + " #room_config li").removeClass("active");
			$("#" + BOARDFUL.BRSR.Canvas + " #room_config div").removeClass("active");
			$(this).addClass("active");
			$("#" + BOARDFUL.BRSR.Canvas + " #room_config div#" + $(this).attr("id")).addClass("active");
		});
		$("#" + BOARDFUL.BRSR.Canvas + " #room_config #name").html(room.config.name);
		$("#" + BOARDFUL.BRSR.Canvas + " #room_config #description2").html(room.config.description);
		$("#" + BOARDFUL.BRSR.Canvas + " #user_list #players").append('<div class="user"><span>me</span></div>');
		$("#" + BOARDFUL.BRSR.Canvas + " #user_list #judges").append('<div class="user"><span>empty</span></div>');
		$("#" + BOARDFUL.BRSR.Canvas + " #user_list #audience").append('<div class="user"><span>empty</span></div>');
		for (var i = 1; i < room.config.players[0]; ++ i) {
			$("#" + BOARDFUL.BRSR.Canvas + " #user_list #players").append('<div class="user"><span>empty</span></div>');
		}
		$("#" + BOARDFUL.BRSR.Canvas + " #user_list .user").on("click", function () {
			$("#" + BOARDFUL.BRSR.Canvas + " #user_list .user").removeClass("active");
			$(this).addClass("active");
		});
		for (var i in room.config.options) {
			$("#" + BOARDFUL.BRSR.Canvas + " #room_config").append('<div id="' + i + '"></div>');
			$("#" + BOARDFUL.BRSR.Canvas + " #room_config #" + i).append('<span>' + i + '</span><select></select>');
			for (var j in room.config.options[i].value) {
				$("#" + BOARDFUL.BRSR.Canvas + " #room_config #" + i + " select").append('<option value="' + room.config.options[i].value[j] + '">' + room.config.options[i].value[j] + '</option>');
			}
		}
	});
	var load = new BOARDFUL.CORE.FileLoader(["src/browser/menu2.html", "src/browser/menu2.css"], function () {});
};

/**
 * Gui for player.
 *
 * @author		Fei Zhan
 * @version		0.0
**/

var BOARDFUL = BOARDFUL || new Object();
BOARDFUL.BRSR = BOARDFUL.BRSR || new Object();

// gui for player
BOARDFUL.BRSR.PlayerUi = function (instance, owner) {
	this.type = "PlayerUi";
	this.instance = instance;
	this.owner = owner;
	BOARDFUL.Mngr.add(this);
	var load;
	switch (BOARDFUL.Mngr.get(this.instance).name) {
	case "ai":
		load = "src/browser/player_you.html";
		break;
	case "me":
	default:
		load = "src/browser/player_me.html";
		break;
	}
	this.addListeners();
	this.play_card_arg = undefined;
	$.get(load, function (text, status, xhr) {
		$("#" + BOARDFUL.BRSR.Canvas).append(text).fadeIn('slow');
	});
	var load_files = new BOARDFUL.CORE.FileLoader(["src/browser/player_me.html", "src/browser/player_you.html", "src/browser/player.css"], function () {});
};
BOARDFUL.BRSR.PlayerUi.prototype.addListeners = function () {
	var that = this;
	BOARDFUL.Mngr.get(BOARDFUL.Mngr.get(this.instance).owner).event_mngr.on("PlayCardUi", {
		level: "game",
		callback: function (arg) {
			that.playCardUi(arg);
		},
		id: that.id
	});
};
// ui for deal cards
BOARDFUL.BRSR.PlayerUi.prototype.playCardUi = function (arg) {
	if (arg.player != this.instance) {
		return;
	}
	this.play_card_arg = arg;
	BOARDFUL.Mngr.get(BOARDFUL.Mngr.get(this.instance).owner).status = "userinput";
};
// 
BOARDFUL.BRSR.PlayerUi.prototype.playerOk = function () {
	if ("me" != BOARDFUL.Mngr.get(this.instance).name || "userinput" != BOARDFUL.Mngr.get(BOARDFUL.Mngr.get(this.instance).owner).status || undefined === this.play_card_arg) {
		return;
	}
	var card_list = new Array();
	$("#" + BOARDFUL.BRSR.Canvas + " #table .card").each(function () {
		var card_ui = parseInt($(this).attr("id"));
		var card = BOARDFUL.Mngr.get(card_ui).instance;
		if ("me" == BOARDFUL.Mngr.get(BOARDFUL.Mngr.get(BOARDFUL.Mngr.get(card).owner).owner).name) {
			card_list.push(card);
		}
	});
	if (card_list.length != this.play_card_arg.number) {
		return;
	}
	var event = new BOARDFUL.CORE.Event({
		name: "PlaceCardOnTable",
		source: this.instance,
		source_event: this.play_card_arg.source_event,
		player: this.instance,
		cards: card_list
	});
	BOARDFUL.Mngr.get(BOARDFUL.Mngr.get(this.instance).owner).event_mngr.front(event.id);
	BOARDFUL.Mngr.get(BOARDFUL.Mngr.get(this.instance).owner).status = "run";
};