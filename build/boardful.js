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
};
/**
 * Board game.
 *
 * @author		Fei Zhan
 * @version		0.0
**/

var BOARDFUL = BOARDFUL || new Object();

// board game
BOARDFUL.Board = function (config, owner) {
	this.type = "Board";
	this.owner = owner;
	this.name = config.name;
	this.ui = undefined;
	BOARDFUL.Mngr.add(this);
	this.config = config;
	this.room_list = new Array();
};
// load board game
BOARDFUL.Board.prototype.load = function (callback) {
	this.callback = callback;
	this.loadPackage([this.config.package]);
};
BOARDFUL.Board.prototype.loadPackage = function (packages, callback) {
	var that = this;
	var load = new BOARDFUL.FileLoader(packages, function () {
		var dependencies = new Array();
		var files = new Array();
		for (var i in packages) {
			if (".json" != packages[i].substr(packages[i].length - 5)) {
				continue;
			}
			var pack = BOARDFUL.File.list[BOARDFUL.File.name_list[packages[i]]].content;
			if ("files" in pack) {
				files = files.concat(pack.files);
			}
			if ("dependencies" in pack) {
				dependencies = dependencies.concat(pack.dependencies);
			}
		}
		var load_files = function () {
			var load1 = new BOARDFUL.FileLoader(files, function () {
				for (var i in files) {
					if (".js" == files[i].substr(files[i].length - 3)) {
						BOARDFUL.File.setToMods(files[i]);
					}
				}
				if (undefined === callback) {
					BOARDFUL.logger.log("info", "load board", that.name);
					that.createRoom(BOARDFUL.File.list[BOARDFUL.File.name_list[that.config.package]].content);
				}
				else if ("function" == typeof callback) {
					callback();
				}
			});
		};
		if (dependencies.length > 0) {
			that.loadPackage(dependencies, load_files);
		} else {
			load_files();
		}
	});
};
// create room
BOARDFUL.Board.prototype.createRoom = function (package) {
	var room = new BOARDFUL.Room(package, this.id);
	this.room_list.push(room.id);
	if ("function" == typeof this.callback) {
		return this.callback(room.id);
	}
};

/**
 * Define the BOARDFUL namespace.
 *
 * @author		Fei Zhan
 * @version		0.0
 * 
**/

// namespace
var BOARDFUL = BOARDFUL || new Object();
// if nodejs, export as module
if (typeof module !== 'undefined' && module.exports) {
	module.exports = BOARDFUL;
	var $ = require('jquery');
	var _ = require("underscore");
}
BOARDFUL.MODS = BOARDFUL.MODS || new Object();

// init
BOARDFUL.init = function (config) {
	BOARDFUL.checkEnvi();
	// create logger
	BOARDFUL.logger = new BOARDFUL.Logger();
	BOARDFUL.logger.add(winston.transports.File, {
		//filename: 'logs/boardful_' + new Date().toString() + '.log'
		filename: 'logs/boardful.log'
	})
	.remove(winston.transports.Console);
	BOARDFUL.logger.log('info', "----------launch----------");
	// create debug logger
	BOARDFUL.Debugger = new BOARDFUL.Logger();
	BOARDFUL.Debugger.add(winston.transports.File, {
		filename: 'logs/debug.log'
	})
	.remove(winston.transports.Console);
	BOARDFUL.Debugger.log('info', "----------launch----------");

	BOARDFUL.logger.log('info', "launch type", config);
	BOARDFUL.logger.log('info', "environment", BOARDFUL.Envi);
	BOARDFUL.File.init();
	if ("browser" == BOARDFUL.Envi.type) {
		BOARDFUL.urlparam = BOARDFUL.parseUrl();
		BOARDFUL.logger.log('info', "url param", BOARDFUL.urlparam);
		BOARDFUL.File.getFromHtml();
	}
	BOARDFUL.Mngr = new BOARDFUL.Manager();
	BOARDFUL.loadBoards();
};
// board game list
BOARDFUL.BoardList = new Array();
// load board game list
BOARDFUL.loadBoards = function () {
	var BOARD_LIST_FILE = "mods/boardlist.json";
	var load_files = new BOARDFUL.FileLoader([BOARD_LIST_FILE], function () {
		var board_list = BOARDFUL.File.list[BOARDFUL.File.name_list[BOARD_LIST_FILE]].content.boards;
		for (var i in board_list) {
			BOARDFUL.BoardList.push(new BOARDFUL.Board(board_list[i]).id);
		}
	});
};

/**
 * Card.
 *
 * @author		Fei Zhan
 * @version		0.0
 * 
**/

var BOARDFUL = BOARDFUL || new Object();

// card
BOARDFUL.Card = function (config, owner) {
	this.type = "Card";
	this.rank = config.rank;
	this.suit = config.suit;
	this.color = config.color;
	this.name = config.name || this.suit + "_" + this.rank;
	this.owner = owner;
	this.game = BOARDFUL.Mngr.get(this.owner).game;
	this.ui = undefined;
	BOARDFUL.Mngr.add(this);
};
/**
 * Command.
 *
 * @author		Fei Zhan
 * @version		0.0
**/

var BOARDFUL = BOARDFUL || new Object();

// command
BOARDFUL.Command = BOARDFUL.Command || new Object();
BOARDFUL.Command.owner = undefined;
// call command function
BOARDFUL.Command.call = function (cmd) {
	var arg_list = cmd.replace(/\s/g, " ").split(" ");
	if (0 == arg_list.length) {
		return;
	}
	cmd = arg_list[0];
	arg_list.shift();
	if (cmd in BOARDFUL.Command.list) {
		return BOARDFUL.Command.list[cmd](arg_list);
	} else {
		console.log("unknow cmd", cmd);
	}
};
BOARDFUL.Command.list = {
	"test": function (args) {
		console.log("Hello Boardful !");
	},
	"get": function (args) {
		var obj = BOARDFUL.Mngr.get(args[0]);
		if (obj) {
			console.log(obj.name);
		} else {
			console.log(obj);
		}
	},
	"object": function (args) {
		console.log(BOARDFUL.Mngr.get(args[0]));
	},
	"currentEvent": function (args) {
		if (BOARDFUL.Command.owner) {
			console.log(BOARDFUL.Mngr.get(BOARDFUL.Command.owner).event_mngr.current.name);
		} else {
			console.log(undefined);
		}
	},
	"nextEvent": function (args) {
		if (BOARDFUL.Command.owner) {
			console.log(BOARDFUL.Mngr.get(BOARDFUL.Command.owner).event_mngr.list[0]);
		} else {
			console.log(undefined);
		}
	},
	"boards": function (args) {
		console.log(BOARDFUL.BoardList);
	},
	"pause": function (args) {
		if (BOARDFUL.Command.owner) {
			BOARDFUL.Mngr.get(BOARDFUL.Command.owner).pause();
		}
	},
	"resume": function (args) {
		if (BOARDFUL.Command.owner) {
			BOARDFUL.Mngr.get(BOARDFUL.Command.owner).resume();
		}
	},
	"exit": function (args) {
		process.exit(0);
	},
};

/**
 * Deck.
 *
 * @author		Fei Zhan
 * @version		0.0
 * 
**/

var BOARDFUL = BOARDFUL || new Object();

// deck
BOARDFUL.Deck = function (owner) {
	this.type = "Deck";
	this.owner = owner;
	this.game = BOARDFUL.Mngr.get(this.owner).game;
	this.ui = undefined;
	this.visible = false;
	BOARDFUL.Mngr.add(this);
	this.card_list = new Array();
	this.addListeners();
};
// get cards
BOARDFUL.Deck.prototype.getCards = function (card_list) {
	for (var i in card_list) {
		BOARDFUL.Mngr.get(card_list[i]).owner = this.id;
	}
	this.card_list = this.card_list.concat(card_list);
};

// add listeners
BOARDFUL.Deck.prototype.addListeners = function () {
	var that = this;
	BOARDFUL.Mngr.get(this.game).event_mngr.on("ShuffleDeck", {
		level: "game",
		callback: function (arg) {
			that.shuffleDeck(arg);
		},
		id: that.id
	});
	BOARDFUL.Mngr.get(this.game).event_mngr.on("DealCards", {
		level: "game",
		callback: function (arg) {
			that.dealCards(arg);
		},
		id: that.id
	});
	BOARDFUL.Mngr.get(this.game).event_mngr.on("DealCard", {
		level: "game",
		callback: function (arg) {
			that.dealCard(arg);
		},
		id: that.id
	});
};
// shuffle deck
BOARDFUL.Deck.prototype.shuffleDeck = function (arg) {
	// not me
	if (arg.deck != this.id) {
		return;
	}
	this.card_list = BOARDFUL.shuffle(this.card_list);
	// add ui event
	var event_list = new Array();
	var event = new BOARDFUL.Event({
		name: "ShuffleDeckUi",
		source: this.id,
		cards: this.card_list
	});
	event_list.push(event.id);
	BOARDFUL.Mngr.get(this.game).event_mngr.front(event_list);
};
// deal cards
BOARDFUL.Deck.prototype.dealCards = function (arg) {
	// not me
	if (arg.deck != this.id) {
		return;
	}
	var event_list = new Array();
	var event;
	if (arg.number > this.card_list.length) {
		event = new BOARDFUL.Event({
			name: "ReorderDeck",
			source: this.id,
			deck: this.id
		});
		event_list.push(event.id);
	}
	var arg1 = arg;
	arg1.name = "DealCard";
	for (var i = 0; i < arg.number; ++ i) {
		event = new BOARDFUL.Event(arg1);
		event_list.push(event.id);
	}
	BOARDFUL.Mngr.get(this.game).event_mngr.front(event_list);
};
// deal one card
BOARDFUL.Deck.prototype.dealCard = function (arg) {
	// not me
	if (arg.deck != this.id) {
		return;
	}
	var card = this.card_list[0];
	this.card_list.shift();
	BOARDFUL.Mngr.get(BOARDFUL.Mngr.get(arg.player).hand).getCards([card]);
	// create event for ui
	var event_list = new Array();
	var event = new BOARDFUL.Event({
		name: "DealCardUi",
		source: this.id,
		card: card,
		player: arg.player
	});
	event_list.push(event.id);
	BOARDFUL.Mngr.get(this.game).event_mngr.front(event_list);
};
/**
 * Event.
 *
 * @author		Fei Zhan
 * @version		0.0
**/

var BOARDFUL = BOARDFUL || new Object();

// event
BOARDFUL.Event = function (arg) {
	this.type = "Event";
	this.owner = undefined;
	BOARDFUL.Mngr.add(this);
	this.name = arg.name;
	this.arg = arg;
	this.arg.creation_time = new Date();
};

// event level precedence
BOARDFUL.EVENT_LEVELS = ["top", "system", "server", "board", "room", "game", "extension", "player", "card", "rear"];
// event manager
BOARDFUL.EventMngr = function (owner) {
	this.type = "EventMngr";
	this.owner = owner;
	BOARDFUL.Mngr.add(this);
	this.current = undefined;
	this.list = new Array();
	this.listener_list = new Object();
	this.timeout = 20;
	this.logger = new BOARDFUL.Logger();
	this.logger.add(winston.transports.File, {
		filename: 'logs/event.log'
	})
	.remove(winston.transports.Console);
	this.logger.log('info', "----------launch----------");
	this.name_logger = new BOARDFUL.Logger();
	this.name_logger.add(winston.transports.File, {
		filename: 'logs/event_name.log'
	})
	.remove(winston.transports.Console);
	this.name_logger.log('info', "----------launch----------");
};
// see or push to the front of event list
BOARDFUL.EventMngr.prototype.front = function (id) {
	if (undefined === id) {
		if (0 == this.list.length) {
			return undefined;
		}
	}
	else if ("array" == typeof id || "object" == typeof id) {
		this.list = id.concat(this.list);
		for (var i in id) {
			this.logger.log("info", "prepend events", BOARDFUL.Mngr.get(id[i]).name);
		}
	}
	else {
		this.list.unshift(id);
		this.logger.log("info", "prepend event", BOARDFUL.Mngr.get(id).name);
	}
	return BOARDFUL.Mngr.get(this.list[0]);
};
// add to the rear of event list
BOARDFUL.EventMngr.prototype.add = function (id) {
	if ("array" == typeof id || "object" == typeof id) {
		this.list = this.list.concat(id);
		for (var i in id) {
			this.logger.log("info", "append events", BOARDFUL.Mngr.get(id[i]).name);
		}
	}
	else {
		this.list.push(id);
		this.logger.log("info", "append event", BOARDFUL.Mngr.get(id).name);
	}
};
// add event listener
BOARDFUL.EventMngr.prototype.on = function (event, config) {
	if (! (event in this.listener_list)) {
		this.listener_list[event] = new Object();
	}
	config.level = config.level || "rear";
	if (! (config.level in this.listener_list[event])) {
		this.listener_list[event][config.level] = new Array();
	}
	this.listener_list[event][config.level].push(config);
	this.logger.log("info", "add listener", event);
};
// remove event listener
BOARDFUL.EventMngr.prototype.off = function (event, config) {
	if (! (event in this.listener_list)) {
		return;
	}
	config.level = config.level || "extension";
	if (! (config.level in this.listener_list[event])) {
		return;
	}
	var index = this.listener_list[event][config.level].indexOf(config);
	if (index >= 0) {
		this.listener_list[event][config.level].splice(index, 1);
	}
};
// launch event manager
BOARDFUL.EventMngr.prototype.run = function () {
	switch (BOARDFUL.Mngr.get(this.owner).status) {
	case "pause":
	case "exit":
	case "userinput":
	case "uieffect":
		break;
	case "run":
	default:
		if (this.list.length > 0) {
			// get the current event
			this.current = this.front();
			this.logger.log("info", "event", this.current.name, this.current);
			this.name_logger.log("info", this.current.name);
			this.list.shift();
			if (this.current && (this.current.name in this.listener_list)) {
				for (var i in BOARDFUL.EVENT_LEVELS) {
					if (BOARDFUL.EVENT_LEVELS[i] in this.listener_list[this.current.name]) {
						for (var j in this.listener_list[this.current.name][BOARDFUL.EVENT_LEVELS[i]]) {
							var listener = this.listener_list[this.current.name][BOARDFUL.EVENT_LEVELS[i]][j];
							this.logger.log("info", "listener", BOARDFUL.Mngr.get(listener.id).name);
							// trigger listener callback for event
							listener.callback(this.current.arg);
						}
					}
				}
			}
		}
		break;
	}
	var that = this;
	// start next event
	setTimeout(function () {
		that.run();
	}, this.timeout);
};

/**
 * File manager.
 *
 * @author		Fei Zhan
 * @version		0.0
 * 
**/

var BOARDFUL = BOARDFUL || new Object();

// file manager
BOARDFUL.File = BOARDFUL.File || new Object();
// init file manager
BOARDFUL.File.init = function () {
	// file mngr logger
	BOARDFUL.File.logger = new BOARDFUL.Logger();
	BOARDFUL.File.logger.add(winston.transports.File, {
		filename: 'logs/file.log'
	})
	.remove(winston.transports.Console);
	BOARDFUL.File.logger.log('info', "----------launch----------");
};
// file list
BOARDFUL.File.list = new Object();
// file list by name
BOARDFUL.File.name_list = new Object();
BOARDFUL.File.next_id = 0;
// add to file list
BOARDFUL.File.add = function (file, content, status) {
	// new file
	if (! (file in BOARDFUL.File.name_list)) {
		BOARDFUL.File.list[BOARDFUL.File.next_id] = {
			name: file,
			type: "",
			content: content,
			status: status
		};
		BOARDFUL.File.name_list[file] = BOARDFUL.File.next_id;
		++ BOARDFUL.File.next_id;
	}
	else {
		BOARDFUL.File.list[BOARDFUL.File.name_list[file]] = {
			name: file,
			content: content,
			status: status
		};
	}
};
// get file list in current html
BOARDFUL.File.getFromHtml = function () {
	$("script").each(function () {
		BOARDFUL.File.add($(this).attr("src"), $(this), "loaded");
	});
	BOARDFUL.File.logger.log('info', "files in html", BOARDFUL.File.name_list);
};
// set file script to MODS scope
BOARDFUL.File.setToMods = function (file) {
	var script = BOARDFUL.File.list[BOARDFUL.File.name_list[file]].content;
	if (("array" == typeof script || "object" == typeof script || "function" == typeof script) && "name" in script) {
		BOARDFUL.MODS[script.name] = script;
	} else {
		for (var i in script) {
			BOARDFUL.MODS[i] = script[i];
		}
	}
};

// file loader
BOARDFUL.FileLoader = function (list, callback) {
	this.list = list;
	this.callback = callback;
	this.done = false;
	this.load();
};
// load files and wait
BOARDFUL.FileLoader.prototype.load = function () {
	this.done = true;
	for (var i in this.list) {
		if (! (this.list[i] in BOARDFUL.File.name_list) || "loaded" != BOARDFUL.File.list[BOARDFUL.File.name_list[this.list[i]]].status) {
			this.done = false;
			this.loadFile(this.list[i]);
			BOARDFUL.File.logger.log("info", "loading", this.list[i]);
		}
	}
	var that = this;
	if (! this.done) {
		setTimeout(function () {
			that.load();
		}, 500);
	} else {
		this.callback();
	}
};
// load a file
BOARDFUL.FileLoader.prototype.loadFile = function (file) {
	switch (BOARDFUL.Envi.type) {
	case "browser":
		this.loadByAjax(file);
		break;
	case "nodejs":
		this.loadByRequire(file);
		break;
	default:
		break;
	}
}
BOARDFUL.FileLoader.prototype.loadByRequire = function (file) {
	try {
		var script = require("../" + file);
		BOARDFUL.File.add(file, script, "loaded");
		BOARDFUL.File.logger.log("info", "file loaded", file);
	} catch (err) {
		BOARDFUL.File.add(file, "", "failed");
		BOARDFUL.File.logger.log("info", "file failed", file, err);
	}
};
// load a file via ajax by browser
BOARDFUL.FileLoader.prototype.loadByAjax = function (file) {
	var true_file = "../" + file;
	if (".js" == file.substr(file.length - 3)) {
		// load a js script
		$.getScript(true_file)
			.done(function( script, textStatus ) {
				BOARDFUL.File.add(file, script, "loaded");
				BOARDFUL.File.logger.log("info", "js loaded", file);
			})
			.fail(function( jqxhr, settings, exception ) {
				BOARDFUL.File.add(file, "", "failed");
				BOARDFUL.File.logger.log("info", "js failed", file);
			});
	}
	else if (".css" == file.substr(file.length - 4)) {
		// load a css
		$('head').append( $('<link rel="stylesheet" type="text/css" />').attr('href', true_file) );
		BOARDFUL.File.add(file, "", "loaded");
		BOARDFUL.File.logger.log("info", "css loaded", file);
	}
	else if (".json" == file.substr(file.length - 5)) {
		$.getJSON(true_file, function(data, textStatus, jqXHR) {
			BOARDFUL.File.add(file, data, "loaded");
			BOARDFUL.File.logger.log("info", "json loaded", file);
		})
		.fail(function (jqXHR, textStatus, errorThrown) {
			BOARDFUL.File.add(file, "", "failed");
			BOARDFUL.File.logger.log("info", "json failed", file);
		})
		.always(function(data, textStatus, jqXHR) {
		});
	}
	else {
		BOARDFUL.File.add(file, "", "loaded");
		BOARDFUL.File.logger.log("info", "file unknown", file);
	}
};

/**
 * Game.
 *
 * @author		Fei Zhan
 * @version		0.0
**/

var BOARDFUL = BOARDFUL || new Object();

// game
BOARDFUL.Game = function (owner) {
	this.type = "Game";
	this.owner = owner;
	BOARDFUL.Mngr.add(this);
	this.game = this.id;
	this.event_mngr = new BOARDFUL.EventMngr(this.id);
	this.ui = undefined;
	this.status = "init";
	// create from room config
	var room = BOARDFUL.Mngr.get(this.owner);
	room.game_list.push(this.id);
	this.mod_list = new Array();
	// load mods
	if (room.mod_list) {
		for (var i in room.mod_list) {
			if (room.mod_list[i] in BOARDFUL.MODS) {
				var mod = BOARDFUL.MODS[room.mod_list[i]].register(this.id);
				this.mod_list.push(mod);
			}
		}
	}
	this.table = new BOARDFUL.Table(this.id).id;
	this.deck_list = new Object();
	// create decks
	if (room.config.decks) {
		for (var i in room.config.decks) {
			this.deck_list[room.config.decks[i]] = new BOARDFUL.Deck(this.id).id;
			this.deck_list[room.config.decks[i]].name = this.name + "_" + room.config.decks[i];
		}
	}
	this.player_list = new Array();
	// create players
	for (var i in room.player_list) {
		var player = new BOARDFUL.Player(room.player_list[i], this.id);
		this.player_list.push(player.id);
	}
	this.current_player = -1;
	this.addListeners();
};
// add event listeners
BOARDFUL.Game.prototype.addListeners = function () {
	var that = this;
	this.event_mngr.on("StartGame", {
		level: "game",
		callback: function (arg) {
			that.start(arg);
		},
		id: that.id
	});
	this.event_mngr.on("ShufflePlayers", {
		level: "game",
		callback: function (arg) {
			that.shufflePlayers(arg);
		},
		id: that.id
	});
	this.event_mngr.on("StartRound", {
		level: "game",
		callback: function (arg) {
			that.startRound(arg);
		},
		id: that.id
	});
	this.event_mngr.on("EndRound", {
		level: "game",
		callback: function (arg) {
			that.endRound(arg);
		},
		id: that.id
	});
	// mod add listeners
	for (var i in this.mod_list) {
		if ("addListeners" in BOARDFUL.Mngr.get(this.mod_list[i])) {
			BOARDFUL.Mngr.get(this.mod_list[i]).addListeners();
		}
	}
};
// launch game
BOARDFUL.Game.prototype.run = function () {
	this.status = "run";
	// create first event
	var event = new BOARDFUL.Event({
		name: "StartGame",
		source: this.id
	});
	this.event_mngr.add(event.id);
	this.event_mngr.run();
};
// pause game
BOARDFUL.Game.prototype.pause = function () {
	switch (this.status) {
	case "init":
	case "exit":
	case "pause":
		break;
	default:
		this.status = "pause";
		// cannot create event here
		console.log("game pause");
		break;
	}
};
// resume game
BOARDFUL.Game.prototype.resume = function () {
	switch (this.status) {
	case "init":
	case "exit":
		break;
	case "pause":
		this.status = "run";
		var event = new BOARDFUL.Event({
			name: "ResumeGame",
			source: this.id
		});
		this.event_mngr.add(event.id);
		break;
	default:
		break;
	}
};
// start game
BOARDFUL.Game.prototype.start = function (arg) {
	this.round = 0;
	var event_list = new Array();
	var event = new BOARDFUL.Event({
		name: "ShufflePlayers",
		source: this.id
	});
	event_list.push(event.id);
	event = new BOARDFUL.Event({
		name: "CreateDeck",
		source: this.id,
		deck: this.deck_list.draw,
		type: "poker"
	});
	event_list.push(event.id);
	event = new BOARDFUL.Event({
		name: "ShuffleDeck",
		source: this.id,
		deck: this.deck_list.draw
	});
	event_list.push(event.id);
	var init_cards = 0;
	// get number of init cards from room config
	if (BOARDFUL.Mngr.get(this.owner).config.cards && BOARDFUL.Mngr.get(this.owner).config.cards.init) {
		init_cards = parseInt(BOARDFUL.Mngr.get(this.owner).config.cards.init);
	}
	for (var i in this.player_list) {
		var event = new BOARDFUL.Event({
			name: "DealCards",
			source: this.id,
			deck: this.deck_list.draw,
			player: this.player_list[i],
			number: init_cards
		});
		event_list.push(event.id);
	}
	event = new BOARDFUL.Event({
		name: "StartRound",
		source: this.id,
		number: this.round + 1
	});
	event_list.push(event.id);
	this.event_mngr.front(event_list);
};
// shuffle players
BOARDFUL.Game.prototype.shufflePlayers = function (arg) {
	this.player_list = BOARDFUL.shuffle(this.player_list);
	var event_list = new Array();
	var event = new BOARDFUL.Event({
		name: "ShufflePlayersUi",
		source: this.id,
		players: this.player_list
	});
	event_list.push(event.id);
	this.event_mngr.front(event_list);
};
// start a round
BOARDFUL.Game.prototype.startRound = function (arg) {
	++ this.round;
	var event_list = new Array();
	var event;
	for (var i in this.player_list) {
		var cards = 0;
		// get number of cards for each round from room config
		if (BOARDFUL.Mngr.get(this.owner).config.cards && BOARDFUL.Mngr.get(this.owner).config.cards.round) {
			cards = parseInt(BOARDFUL.Mngr.get(this.owner).config.cards.round);
		}
		event = new BOARDFUL.Event({
			name: "DealCards",
			source: this.id,
			deck: this.deck_list.draw,
			player: this.player_list[i],
			number: cards
		});
		event_list.push(event.id);
	}
	for (var i in this.player_list) {
		event = new BOARDFUL.Event({
			name: "StartPlayer" + this.player_list[i],
			source: this.id,
			player: this.player_list[i]
		});
		event_list.push(event.id);
		event = new BOARDFUL.Event({
			name: "StartPlayer",
			source: this.id,
			player: this.player_list[i]
		});
		event_list.push(event.id);
		var cards = 0;
		// get number of cards for each turn from room config
		if (BOARDFUL.Mngr.get(this.owner).config.cards && BOARDFUL.Mngr.get(this.owner).config.cards.turn) {
			cards = parseInt(BOARDFUL.Mngr.get(this.owner).config.cards.turn);
		}
		event = new BOARDFUL.Event({
			name: "DealCards",
			source: this.id,
			deck: this.deck_list.draw,
			player: this.player_list[i],
			number: cards
		});
		event_list.push(event.id);
		event = new BOARDFUL.Event({
			name: "PlayerAct",
			source: this.id,
			player: this.player_list[i]
		});
		event_list.push(event.id);
		event = new BOARDFUL.Event({
			name: "PlayerEnd",
			source: this.id
		});
		event_list.push(event.id);
	}
	event = new BOARDFUL.Event({
		name: "EndRound",
		source: this.id
	});
	event_list.push(event.id);
	event = new BOARDFUL.Event({
		name: "StartRound",
		source: this.id,
		number: this.round + 1
	});
	event_list.push(event.id);
	this.event_mngr.front(event_list);
};
// end a round
BOARDFUL.Game.prototype.endRound = function (arg) {
};
/**
 * Logger.
 *
 * @author		Fei Zhan
 * @version		0.0
 * 
**/

var BOARDFUL = BOARDFUL || new Object();
var winston = {
	transports: {
		File: "File",
		Console: "Console"
	}
};

// logger
BOARDFUL.Logger = function () {
	var logger;
	switch (BOARDFUL.Envi.type) {
	case "nodejs":
		winston = require('winston');
		logger = new (BOARDFUL.WinstonLogger) ({
			transports: [
				new (winston.transports.Console)()
			]
		});
		break;
	case "browser":
		logger = new BOARDFUL.DefaultLogger();
		break;
	default:
		logger = new BOARDFUL.DefaultLogger();
		break;
	}
	return logger;
};

// default logger
BOARDFUL.DefaultLogger = function () {
	this.enable = true;
	this.list = new Array();
	//return console;
};
BOARDFUL.DefaultLogger.prototype.log = function () {
	var content = "";
	for (var i in arguments) {
		if ("array" == typeof arguments[i] || "object" == typeof arguments[i] || "function" == typeof arguments[i]) {
			content += JSON.stringify(arguments[i]);
		} else {
			content += arguments[i];
		}
		content += " ";
	}
	this.list.push({
		time: new Date(),
		content: content
	});
	if (this.enable) {
		console.log.apply(console, arguments);
	}
	return this;
};
BOARDFUL.DefaultLogger.prototype.add = function (type) {
	if ("Console" == type) {
		this.enable = true;
	}
	return this;
};
BOARDFUL.DefaultLogger.prototype.remove = function (type) {
	if ("Console" == type) {
		this.enable = false;
	}
	return this;
};

// winston logger for nodejs
BOARDFUL.WinstonLogger = function (config) {
	this.winston = new (winston.Logger) (config);
	this.winston.log_base = this.winston.log;
	// new log function
	this.winston.log = function () {
		if ("nodejs" == BOARDFUL.Envi.type) {
			for (var i in arguments) {
				// convert to string
				if ("array" == typeof arguments[i] || "object" == typeof arguments[i] || "function" == typeof arguments[i]) {
					arguments[i] = BOARDFUL.toString(arguments[i]);
				}
			}
		}
		return this.log_base.apply(this, arguments);
	};
	return this.winston;
};

/**
 * Object manager.
 *
 * @author		Fei Zhan
 * @version		0.0
**/

var BOARDFUL = BOARDFUL || new Object();

// object manager
BOARDFUL.Manager = function () {
	this.logger = new BOARDFUL.Logger();
	this.logger.add(winston.transports.File, {
		filename: 'logs/mngr.log'
	})
	.remove(winston.transports.Console);
	this.logger.log('info', "----------launch----------");
	this.next_id = 0;
	this.list = new Object();
};
// get object by id
BOARDFUL.Manager.prototype.get = function (id) {
	return this.list[id];
};
// add object
BOARDFUL.Manager.prototype.add = function (object) {
	object.id = this.next_id;
	object.type = object.type || object.constructor.name;
	if (! ("name" in object)) {
		object.name = object.type + "_" + object.id;
	}
	++ this.next_id;
	this.list[object.id] = object;
	this.logger.log("info", "add", object.name, object);
	return object.id;
};

/**
 * Player.
 *
 * @author		Fei Zhan
 * @version		0.0
**/

var BOARDFUL = BOARDFUL || new Object();

// player
BOARDFUL.Player = function (config, owner) {
	this.type = "Player";
	this.owner = owner;
	this.game = this.owner;
	this.turn = undefined;
	this.name;
	this.ui = undefined;
	switch (config) {
	case "me":
		this.name = "me";
		break;
	case "ai":
		this.name = "ai";
		break;
	default:
		this.name = "unknown_player";
		break;
	}
	BOARDFUL.Mngr.add(this);
	var hand_deck = new BOARDFUL.Deck(this.id);
	hand_deck.name = this.name + "_" + "hand";
	if ("me" == this.name) {
		hand_deck.visible = true;
	}
	this.hand = hand_deck.id;
	this.addListeners();
};
// add event listeners
BOARDFUL.Player.prototype.addListeners = function () {
	var that = this;
	BOARDFUL.Mngr.get(this.owner).event_mngr.on("StartPlayer" + this.id, {
		level: "game",
		callback: function (arg) {
			that.start(arg);
		},
		id: that.id
	});
	BOARDFUL.Mngr.get(this.owner).event_mngr.on("Player" + this.id + "PlayCard", {
		level: "game",
		callback: function (arg) {
			that.playCard(arg);
		},
		id: that.id
	});
};
// player start
BOARDFUL.Player.prototype.start = function (arg) {
	BOARDFUL.Mngr.get(this.owner).current_player = this.id;
};
// play card
BOARDFUL.Player.prototype.playCard = function (arg) {
	if ("ai" == this.name) {
		var event = new BOARDFUL.Event(arg);
		event.name = "PlayCardAi";
		BOARDFUL.Mngr.get(this.owner).event_mngr.front(event.id);
	} else {
		var event = new BOARDFUL.Event(arg);
		event.name = "PlayCardUi";
		BOARDFUL.Mngr.get(this.owner).event_mngr.front(event.id);
	}
};
/**
 * Room.
 *
 * @author		Fei Zhan
 * @version		0.0
**/

var BOARDFUL = BOARDFUL || new Object();

// room
BOARDFUL.Room = function (config, owner) {
	this.type = "Room";
	this.owner = owner;
	this.ui = undefined;
	BOARDFUL.Mngr.add(this);
	this.config = config;
	this.game_list = new Array();
	// set default players
	this.player_list = config.player_list || ["me", "ai"];
	this.mod_list = config.mod_list || ["Poker"];
};
/**
 * Table.
 *
 * @author		Fei Zhan
 * @version		0.0
**/

var BOARDFUL = BOARDFUL || new Object();

// table
BOARDFUL.Table = function (owner) {
	this.type = "Table";
	this.owner = owner;
	this.game = BOARDFUL.Mngr.get(this.owner).game;
	this.ui = undefined;
	BOARDFUL.Mngr.add(this);
	this.arg_list = new Array();
	this.addListeners();
};
// get cards by source event
BOARDFUL.Table.prototype.getCardsBySource = function (event) {
	var select_list = new Array();
	for (var i in this.arg_list) {
		if (event == this.arg_list[i].source_event) {
			select_list.push(this.arg_list[i]);
			this.arg_list[i] = undefined;
		}
	}
	// remove taken cards
	var index = this.arg_list.indexOf(undefined);
	while (-1 != index) {
		this.arg_list.splice(index, 1);
		index = this.arg_list.indexOf(undefined);
	}
	return select_list;
};
// add listeners
BOARDFUL.Table.prototype.addListeners = function () {
	var that = this;
	BOARDFUL.Mngr.get(this.owner).event_mngr.on("PlaceCardOnTable", {
		level: "game",
		callback: function (arg) {
			that.placeCardOnTable(arg);
		},
		id: that.id
	});
};
// place card on table
BOARDFUL.Table.prototype.placeCardOnTable = function (arg) {
	var hand = BOARDFUL.Mngr.get(BOARDFUL.Mngr.get(arg.player).hand).card_list;
	for (var i in arg.cards) {
		var index = hand.indexOf(arg.cards[i]);
		if (index >= 0) {
			hand.splice(index, 1);
		}
		BOARDFUL.Mngr.get(arg.cards[i]).owner = this.id;
	}
	this.arg_list.push(arg);
};
/**
 * Utility methods.
 *
 * @author		Fei Zhan
 * @version		0.0
**/

var BOARDFUL = BOARDFUL || new Object();

// get function from string, with or without scopes
BOARDFUL.getFunctionFromString = function (string) {
	var scope = window;
	var scopeSplit = string.split('.');
	for (i = 0; i < scopeSplit.length - 1; i++)
	{
		scope = scope[scopeSplit[i]];
		if (scope == undefined) return;
	}
	return scope[scopeSplit[scopeSplit.length - 1]];
};
// convert to string
BOARDFUL.toString = function (value) {
	var str = value;
	try {
		str = JSON.stringify(value);
	}
	catch (err) {
		// circular json, convert two levels
		if ("array" == typeof value || "object" == typeof value || "function" == typeof value) {
			str = "{";
			for (var i in value) {
				str += i + ":";
				if ("array" == typeof value[i] || "object" == typeof value[i] || "function" == typeof value[i]) {
					str += "{";
					for (var j in value[i]) {
						str += j + ":";
						if ("array" == typeof value[i][j] || "object" == typeof value[i][j] || "function" == typeof value[j]) {
							str += typeof value[i][j];
						} else {
							str += value[i][j];
						}
						str += ",";
					}
					str += "}";
				} else {
					str += value[i];
				}
				str += ",";
			}
			str += "}";
		} else {
			str = "" + value;
		}
	}
	return str;
};

// check environment
BOARDFUL.Envi = new Object();
BOARDFUL.checkEnvi = function () {
	if (typeof module !== 'undefined' && module.exports) {
		BOARDFUL.Envi.type = "nodejs";
	} else {
		BOARDFUL.Envi.type = "browser";
		BOARDFUL.Envi.isOpera = !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
		// Opera 8.0+ (UA detection to detect Blink/v8-powered Opera)
		BOARDFUL.Envi.isFirefox = typeof InstallTrigger !== 'undefined';   // Firefox 1.0+
		BOARDFUL.Envi.isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0;
		// At least Safari 3+: "[object HTMLElementConstructor]"
		BOARDFUL.Envi.isChrome = !!window.chrome && !BOARDFUL.Envi.isOpera;              // Chrome 1+
		BOARDFUL.Envi.isIE = /*@cc_on!@*/false || !!document.documentMode; // At least IE6
	}
};

// parse url parameters
BOARDFUL.parseUrlParam = function (query) {
	var query_string = {};
	var query = query || window.location.search.substring(1);
	var vars = query.split("&");
	for (var i=0;i<vars.length;i++) {
		var pair = vars[i].split("=");
			// If first entry with this name
		if (typeof query_string[pair[0]] === "undefined") {
		  query_string[pair[0]] = pair[1];
			// If second entry with this name
		} else if (typeof query_string[pair[0]] === "string") {
		  var arr = [ query_string[pair[0]], pair[1] ];
		  query_string[pair[0]] = arr;
			// If third or later entry with this name
		} else {
		  query_string[pair[0]].push(pair[1]);
		}
	}
	return query_string;
};
// parse url param and hash
BOARDFUL.parseUrl = function () {
	var param = BOARDFUL.parseUrlParam(window.location.search.substring(1));
	param["#"] = window.location.hash.substring(1);
	var param1 = BOARDFUL.parseUrlParam(window.location.hash.substring(1));
	for (var index in param1) {
		if (! (index in param)) {
			param[index] = param1[index];
		}
	}
	return param;
};

// shuffle
BOARDFUL.shuffle = function (o) {
    for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
};
/**
 * Command line interface.
 *
 * @author		Fei Zhan
 * @version		0.0
 * 
**/

var keypress = require('keypress');
var BOARDFUL = require("../build/boardful.core.js");
BOARDFUL = BOARDFUL || new Object();

// command line
BOARDFUL.Cmdline = function (owner) {
	this.type = "Cmdline";
	this.owner = owner;
	if (this.owner) {
		BOARDFUL.Mngr.add(this);
		BOARDFUL.Command.owner = this.owner;
	}
	this.addListeners();
	this.wait_status = "init";
	this.wait_result = "";
	// set keypress
	if (this.owner) {
		var that = this;
		keypress(process.stdin);
		process.stdin.on('keypress', function () {
			that.keypress.apply(that, arguments);
		});
		process.stdin.setRawMode(true);
	}
};
// output
BOARDFUL.Cmdline.prototype.output = function () {
	console.log.apply(console, arguments);
};
// input
BOARDFUL.Cmdline.prototype.input = function (callback) {
	// disable keypress
	if (this.owner) {
		process.stdin.removeListener('keypress', function () {
			that.keypress.apply(that, arguments);
		});
		process.stdin.setRawMode(false);
	}
	process.stdout.write("?> ");
	var that = this;
	process.stdin.once('data', function (text) {
		callback(text);
		// enable keypress
		if (that.owner) {
			process.stdin.on('keypress', function () {
				that.keypress.apply(that, arguments);
			});
			process.stdin.setRawMode(true);
		}
	});
};
// wait input
BOARDFUL.Cmdline.prototype.waitInput = function (check, callback) {
	var that = this;
	switch (that.wait_status) {
	case "init":
		that.wait_status = "wait";
		// get input text
		that.input(function (text) {
			text = text.trim();
			that.wait_result = text;
			that.wait_status = "get";
		});
		break;
	case "wait":
		break;
	case "get":
		that.wait_status = "init";
		// check if meet requirements
		if (check(that.wait_result)) {
			callback(that.wait_result);
			that.wait_result = "";
		}
		break;
	}
	setTimeout(function () {
		that.waitInput(check, callback);
	}, 500);
};
// wait keypress
BOARDFUL.Cmdline.prototype.keypress = function (chunk, key) {
	// ctrl + c to exit
	if (key && key.ctrl && key.name == 'c') {
		process.exit();
	}
	// p to pause
	else if (key && "p" == key.name && "pause" != BOARDFUL.Mngr.get(this.owner).status) {
		var that = this;
		// pause game
		BOARDFUL.Mngr.get(that.owner).pause();
		// wait input command
		that.waitInput(function (text) {
			BOARDFUL.Command.call(text);
			// empty string to continue game
			return "" == text;
		}, function (text) {
			BOARDFUL.Mngr.get(that.owner).resume();
		});
	}
};

// add listeners
BOARDFUL.Cmdline.prototype.addListeners = function () {
	if (undefined === this.owner) {
		return;
	}
	var that = this;
	BOARDFUL.Mngr.get(this.owner).event_mngr.on("ResumeGame", {
		level: "game",
		callback: function (arg) {
			that.resumeGame(arg);
		},
		id: that.id
	});
	BOARDFUL.Mngr.get(this.owner).event_mngr.on("StartRound", {
		level: "game",
		callback: function (arg) {
			that.startRound(arg);
		},
		id: that.id
	});
	BOARDFUL.Mngr.get(this.owner).event_mngr.on("StartPlayer", {
		level: "game",
		callback: function (arg) {
			that.startPlayer(arg);
		},
		id: that.id
	});
	BOARDFUL.Mngr.get(this.owner).event_mngr.on("DealCardsUi", {
		level: "game",
		callback: function (arg) {
			that.dealCardsUi(arg);
		},
		id: that.id
	});
	BOARDFUL.Mngr.get(this.owner).event_mngr.on("PlayCardUi", {
		level: "game",
		callback: function (arg) {
			that.playCardUi(arg);
		},
		id: that.id
	});
	BOARDFUL.Mngr.get(this.owner).event_mngr.on("SettlePlayersDuelUi", {
		level: "game",
		callback: function (arg) {
			that.settlePlayersDuelUi(arg);
		},
		id: that.id
	});
};
// ui for resume game
BOARDFUL.Cmdline.prototype.resumeGame = function (arg) {
	this.output("resume game");
};
// ui for start round
BOARDFUL.Cmdline.prototype.startRound = function (arg) {
	this.output("round", arg.number);
};
// ui for player start
BOARDFUL.Cmdline.prototype.startPlayer = function (arg) {
	this.output("start player", arg.player);
};
// ui for deal cards
BOARDFUL.Cmdline.prototype.dealCardsUi = function (arg) {
	this.output("deal cards", arg.cards);
};
// ui for deal cards
BOARDFUL.Cmdline.prototype.playCardUi = function (arg) {
	this.output("player", arg.player, "play card:");
	var hand = BOARDFUL.Mngr.get(BOARDFUL.Mngr.get(arg.player).hand).card_list;
	for (var i in hand) {
		this.output(i, BOARDFUL.Mngr.get(hand[i]).name);
	}
	BOARDFUL.Mngr.get(this.owner).status = "userinput";
	var that = this;
	this.waitInput(function (text) {
		var number = parseInt(text);
		return number >= 0 && number < hand.length
	}, function (text) {
		var card = hand[parseInt(text)];
		that.output("player selected", parseInt(text), BOARDFUL.Mngr.get(card).name);
		var event = new BOARDFUL.Event({
			name: "PlaceCardOnTable",
			source: arg.player,
			source_event: arg.source_event,
			player: arg.player,
			cards: [card]
		});
		BOARDFUL.Mngr.get(that.owner).event_mngr.front(event.id);
		BOARDFUL.Mngr.get(that.owner).status = "run";
	});
};
// ui for settle players duel
BOARDFUL.Cmdline.prototype.settlePlayersDuelUi = function (arg) {
	var text = "";
	for (var i in arg.players) {
		text += arg.players[i] + ": ";
		if ("array" == typeof arg.cards[i] || "object" == typeof arg.cards[i]) {
			var hand_type = BOARDFUL.MODS.Poker.getHandType(arg.cards[i]);
			text += hand_type.type + " " + BOARDFUL.Mngr.get(hand_type.card).name + "(";
			for (var j in arg.cards[i]) {
				text += " " + BOARDFUL.Mngr.get(arg.cards[i][j]).name;
			}
			text += ")";
		} else {
			text += BOARDFUL.Mngr.get(arg.cards[i]).name;
		}
		text += "\n";
	}
	text += "winner " + arg.player;
	this.output("duel", text);
};

// config command line
BOARDFUL.Cmdline.setCmdline = function () {
	process.stdin.setEncoding('utf8');
	process.stdin.resume();
};
// show menu
BOARDFUL.Cmdline.loadMenu = function () {
	var that = this;
	if (BOARDFUL.BoardList.length > 0) {
		// board menu
		for (var i in BOARDFUL.BoardList) {
			var board = BOARDFUL.Mngr.get(BOARDFUL.BoardList[i]);
			console.log(i + ". " + board.config.name + "\t" + board.config.description);
		}
		console.log("select a board:");
		process.stdin.once('data', function (text) {
			BOARDFUL.Mngr.get(BOARDFUL.BoardList[parseInt(text)]).load(function (id) {
				var room = BOARDFUL.Mngr.get(id);
				// input config for room
				BOARDFUL.cmdline.output("config room");
				var that = this;
				process.stdin.once('data', function (text) {
					BOARDFUL.cmdline.output("config room done");
					// create game
					var game = new BOARDFUL.Game(id);
					// set a new cmdline as ui
					game.ui = new BOARDFUL.Cmdline(game.id);
					BOARDFUL.cmdline.output("game start");
					game.run();
				});
			});
		});
	}
	else {
		setTimeout(BOARDFUL.Cmdline.loadMenu, 300);
	}
};

// launch project in desktop
BOARDFUL.init("desktop");
BOARDFUL.cmdline = new BOARDFUL.Cmdline();
BOARDFUL.Cmdline.setCmdline();
BOARDFUL.Cmdline.loadMenu();
/**
 * Server.
 * Start the server:
 * goto project root directory;
 * $ nodejs src/server/server.js
 *
 * @author		Fei Zhan
 * @version		0.0
 * 
**/

var BOARDFUL = require("../build/boardful.core.js");

var http = require("http"),
	url = require("url"),
	path = require("path"),
	fs = require("fs");

BOARDFUL.Server = BOARDFUL.Server || new Object();
// create a server
BOARDFUL.Server.load = function () {
	http.createServer(function(request, response) {
		var uri = url.parse(request.url).pathname, filename = path.join(process.cwd(), uri);
		var contentTypesByExtension = {
			'.html': "text/html",
			'.css':  "text/css",
			'.js':   "text/javascript"
		};
		// if file exists
		fs.exists(filename, function(exists) {
			if(! exists) {
				response.writeHead(404, {"Content-Type": "text/plain"});
				response.write("404 Not Found\n");
				response.end();
				return;
			}
			// default file name
			if (fs.statSync(filename).isDirectory()) filename += '/index.html';
			// read and display it
			fs.readFile(filename, "binary", function(err, file) {
				if (err) {        
					response.writeHead(500, {"Content-Type": "text/plain"});
					response.write(err + "\n");
					response.end();
					return;
				}
				var headers = {};
				var contentType = contentTypesByExtension[path.extname(filename)];
				if (contentType) headers["Content-Type"] = contentType;
				response.writeHead(200, headers);
				response.write(file, "binary");
				response.end();
			});
		});
	}).listen(parseInt(BOARDFUL.Server.port, 10));
	console.log("Static file server running at => http://localhost:" + BOARDFUL.Server.port + "/ CTRL + C to shutdown");
};

// launch project
BOARDFUL.init("server");
BOARDFUL.Server.port = process.argv[3] || 8080;
BOARDFUL.Server.load();

/**
 * AI for poker game.
 *
 * @author		Fei Zhan
 * @version		0.0
 * 
**/

// if nodejs, load BOARDFUL
if (typeof module !== 'undefined' && module.exports) {
	var BOARDFUL = require("../../build/boardful.core.js");
	var Poker = require("./cards.js");
	module.exports = Poker;
} else {
	BOARDFUL.MODS = BOARDFUL.MODS || new Object();
	var Poker = BOARDFUL.MODS.Poker || new Object();
}

Poker.getBestHand = function (cards, number) {
	cards.sort(Poker.compare);
	var comb = Poker.getCombination(cards, number);
	comb.sort(Poker.compareHand);
	if (0 == comb.length) {
		return new Array();
	} else {
		return comb[comb.length - 1];
	}
};
Poker.getCombination = function (cards, number) {
	if (cards.length < number) {
		return [];
	}
	if (0 == cards.length || number <= 0) {
		return [[]];
	}
	var card0 = cards[0];
	var cards1 = new Array();
	for (var i = 1; i < cards.length; ++ i) {
		cards1.push(cards[i]);
	}
	var ans = Poker.getCombination(cards1, number);
	var ans1 = Poker.getCombination(cards1, number - 1);
	for (var i in ans1) {
		var temp = [card0];
		for (var j in ans1[i]) {
			temp.push(ans1[i][j]);
		}
		ans.push(temp);
	}
	return ans;
};
/**
 * Cards for poker game.
 *
 * @author		Fei Zhan
 * @version		0.0
 * 
**/

// if nodejs, load BOARDFUL
if (typeof module !== 'undefined' && module.exports) {
	var BOARDFUL = require("../../build/boardful.core.js");
}

// poker
var Poker = Poker || {
	type: "Mod",
	name: "Poker"
};
// if nodejs, export as module
if (typeof module !== 'undefined' && module.exports) {
	module.exports = Poker;
} else {
	BOARDFUL.MODS.Poker = Poker;
}
Poker.register = function (owner) {
	Poker.owner = owner;
	Poker.game = BOARDFUL.Mngr.get(Poker.owner).game;
	BOARDFUL.Mngr.add(Poker);
	return Poker.id;
};

// create cards
Poker.createCards = function () {
	var card_list = new Array();
	var card;
	for (var i in Poker.RANKS) {
		if ("Joker" == i) {
			card = new BOARDFUL.Card({
				rank: i,
				suit: "Spade",
				name: "♠" + i
			}, Poker.id);
			card_list.push(card.id);
			card = new BOARDFUL.Card({
				rank: i,
				suit: "Heart",
				name: "♥" + i
			}, Poker.id);
			card_list.push(card.id);
		}
		else {
			for (var j in Poker.SUITS) {
				card = new BOARDFUL.Card({
					rank: i,
					suit: j,
					name: Poker.SUIT_NAMES[j] + i
				}, Poker.id);
				card_list.push(card.id);
			}
		}
	}
	return card_list;
};
Poker.RANKS = {
	"2": 2,
	"3": 3,
	"4": 4,
	"5": 5,
	"6": 6,
	"7": 7,
	"8": 8,
	"9": 9,
	"10": 10,
	"Jack": 11,
	"Queen": 12,
	"King": 13,
	"Ace": 14,
	"Joker": 15
};
Poker.SUITS = {
	"Spade": 4,
	"Heart": 3,
	"Diamond": 2,
	"Club": 1
};
Poker.SUIT_NAMES = {
	"Spade": "♠",
	"Heart": "♥",
	"Diamond": "♦",
	"Club": "♣"
};
// compare two cards
Poker.compare = function (id0, id1) {
	var card0 = BOARDFUL.Mngr.get(id0);
	var card1 = BOARDFUL.Mngr.get(id1);
	if (undefined === card0 || undefined === card1) {
		return (undefined === card1) - (undefined === card0);
	}
	else if (card0.rank != card1.rank) {
		return Poker.RANKS[card0.rank] - Poker.RANKS[card1.rank];
	}
	else if (card0.suit != card1.suit) {
		return Poker.SUITS[card0.suit] - Poker.SUITS[card1.suit];
	}
	else {
		return 0;
	}
};
Poker.HAND_TYPES = {
	"Straight flush": 9,
	"Four of a kind": 8,
	"Full house": 7,
	"Flush": 6,
	"Straight": 5,
	"Three of a kind": 4,
	"Two pair": 3,
	"One pair": 2,
	"High card": 1,
	"Less than five": 0
};
// compare two set of cards
Poker.compareHand = function (list0, list1) {
	if (list0.length != list1.length) {
		return list0.length - list1.length;
	}
	var type0 = Poker.getHandType(list0);
	var type1 = Poker.getHandType(list1);
	if (type0.type != type1.type) {
		return Poker.HAND_TYPES[type0.type] - Poker.HAND_TYPES[type1.type];
	}
	else {
		return Poker.compare(type0.card, type1.card);
	}
};
Poker.getHandType = function (list) {
	list.sort(Poker.compare);
	if (0 == list.length) {
		return {
			type: "Less than five",
			card: undefined
		};
	}
	else if (list.length < 5) {
		return {
			type: "Less than five",
			card: list[list.length - 1]
		};
	}
	var card_list = new Array();
	var suit_list = new Object();
	var ranks = new Array();
	var rank_list = new Object();
	for (var i in list) {
		var card = BOARDFUL.Mngr.get(list[i]);
		if (! (card.suit in suit_list)) {
			suit_list[card.suit] = 0;
		}
		++ suit_list[card.suit];
		var rank = Poker.RANKS[card.rank];
		if (! (rank in rank_list)) {
			rank_list[rank] = 0;
		}
		ranks.push(rank);
		++ rank_list[rank];
		card_list.push(card);
	}
	var max_rank_count = 0;
	var max_count_rank = 0;
	for (var i in rank_list) {
		if (rank_list[i] > max_rank_count) {
			max_rank_count = rank_list[i];
			max_count_rank = i;
		}
	}
	var cont_count = 1;
	var max_cont_count = 0;
	var max_cont_rank = 0;
	for (var i in ranks) {
		if (i > 0 && ranks[i] - ranks[i - 1] == 1) {
			++ cont_count;
		} else {
			cont_count = 1;
		}
		if (cont_count >= max_cont_count) {
			max_cont_count = cont_count;
			max_cont_rank = ranks[i];
		}
		prev = i;
	}
	if (1 == Object.keys(suit_list).length && 5 == max_cont_count) {
		return {
			type: "Straight flush",
			card: list[list.length - 1]
		};
	}
	else if (4 == max_rank_count) {
		var return_index = card_list.length - 1;
		for (var i = card_list.length - 1; i >= 0; -- i) {
			if (Poker.RANKS[card_list[i].rank] == max_count_rank) {
				return_index = i;
				break;
			}
		}
		return {
			type: "Four of a kind",
			card: list[return_index]
		};
	}
	else if (2 == Object.keys(rank_list).length && 3 == max_rank_count) {
		var return_index = card_list.length - 1;
		for (var i = card_list.length - 1; i >= 0; -- i) {
			if (Poker.RANKS[card_list[i].rank] == max_count_rank) {
				return_index = i;
				break;
			}
		}
		return {
			type: "Full house",
			card: list[return_index]
		};
	}
	else if (1 == Object.keys(suit_list).length) {
		return {
			type: "Flush",
			card: list[card_list.length - 1]
		};
	}
	else if (5 == max_cont_count) {
		return {
			type: "Straight",
			card: list[card_list.length - 1]
		};
	}
	else if (3 == max_rank_count) {
		var return_index = card_list.length - 1;
		for (var i = card_list.length - 1; i >= 0; -- i) {
			if (Poker.RANKS[card_list[i].rank] == max_count_rank) {
				return_index = i;
				break;
			}
		}
		return {
			type: "Three of a kind",
			card: list[return_index]
		};
	}
	else if (3 == Object.keys(rank_list).length) {
		var return_index = card_list.length - 1;
		for (var i in card_list) {
			if (i > 1 && card_list[i].rank == card_list[i - 1].rank) {
				return_index = i;
			}
		}
		return {
			type: "Two pair",
			card: list[return_index]
		};
	}
	else if (4 == Object.keys(rank_list).length) {
		var return_index = card_list.length - 1;
		for (var i in card_list) {
			if (i > 1 && card_list[i].rank == card_list[i - 1].rank) {
				return_index = i;
			}
		}
		return {
			type: "One pair",
			card: list[return_index]
		};
	} else {
		return {
			type: "High card",
			card: list[card_list.length - 1]
		};
	}
};
/**
 * Poker game.
 *
 * @author		Fei Zhan
 * @version		0.0
 * 
**/

// if nodejs, load BOARDFUL
if (typeof module !== 'undefined' && module.exports) {
	var BOARDFUL = require("../../build/boardful.core.js");
	var Poker = require("./cards.js");
	var Poker1 = require("./ai.js");
	for (var i in Poker1) {
		if (! (i in Poker)) {
			Poker[i] = Poker1[i];
		}
	}
	module.exports = Poker;
} else {
	BOARDFUL.MODS = BOARDFUL.MODS || new Object();
	var Poker = BOARDFUL.MODS.Poker || new Object();
}

// poker
Poker.register = Poker.register || function (owner) {
	Poker.type = "Mod";
	Poker.owner = owner;
	Poker.name = "Poker";
	Poker.game = BOARDFUL.Mngr.get(Poker.owner).game;
	BOARDFUL.Mngr.add(Poker);
	return Poker.id;
};
// add listeners
Poker.addListeners = function () {
	BOARDFUL.Mngr.get(Poker.game).event_mngr.on("StartGame", {
		level: "game",
		callback: function (arg) {
			Poker.startGame(arg);
		},
		id: Poker.id
	});
	BOARDFUL.Mngr.get(Poker.game).event_mngr.on("CreateDeck", {
		level: "game",
		callback: function (arg) {
			Poker.createDeck(arg);
		},
		id: Poker.id
	});
	BOARDFUL.Mngr.get(Poker.game).event_mngr.on("PlayerAct", {
		level: "game",
		callback: function (arg) {
			Poker.playerAct(arg);
		},
		id: Poker.id
	});
	BOARDFUL.Mngr.get(Poker.game).event_mngr.on("Settle", {
		level: "game",
		callback: function (arg) {
			Poker.settle(arg);
		},
		id: Poker.id
	});
	BOARDFUL.Mngr.get(Poker.game).event_mngr.on("SettlePlayersDuelUi", {
		level: "game",
		callback: function (arg) {
			Poker.settlePlayersDuelUi(arg);
		},
		id: Poker.id
	});
	BOARDFUL.Mngr.get(Poker.game).event_mngr.on("ShowResult", {
		level: "game",
		callback: function (arg) {
			Poker.showResult(arg);
		},
		id: Poker.id
	});
	BOARDFUL.Mngr.get(Poker.game).event_mngr.on("Discard", {
		level: "game",
		callback: function (arg) {
			Poker.discard(arg);
		},
		id: Poker.id
	});
	BOARDFUL.Mngr.get(Poker.game).event_mngr.on("ReorderDeck", {
		level: "game",
		callback: function (arg) {
			Poker.reorderDeck(arg);
		},
		id: Poker.id
	});
	BOARDFUL.Mngr.get(Poker.game).event_mngr.on("PlayCardAi", {
		level: "game",
		callback: function (arg) {
			Poker.playCardAi(arg);
		},
		id: Poker.id
	});
};
// start game
Poker.startGame = function () {
};
// create deck
Poker.createDeck = function (arg) {
	BOARDFUL.Mngr.get(arg.deck).getCards(this.createCards());
};
// players duel
Poker.playerAct = function (arg) {
	var event_list = new Array();
	var event;
	for (var i in BOARDFUL.Mngr.get(this.owner).player_list) {
		// each player play one card
		event = new BOARDFUL.Event({
			name: "Player" + BOARDFUL.Mngr.get(this.owner).player_list[i] + "PlayCard",
			source: this.id,
			source_event: "PlayersDuel",
			player: BOARDFUL.Mngr.get(this.owner).player_list[i],
			number: 1
		});
		event_list.push(event.id);
	}
	// settle players duel
	event = new BOARDFUL.Event({
		name: "Settle",
		source: this.id,
		source_event: "PlayersDuel"
	});
	event_list.push(event.id);
	BOARDFUL.Mngr.get(this.owner).event_mngr.front(event_list);
};
// settle players duel
Poker.settle = function (arg) {
	var select_list = BOARDFUL.Mngr.get(BOARDFUL.Mngr.get(this.owner).table).getCardsBySource("PlayersDuel");
	// group player's cards together
	var select_player_list = new Array();
	for (var i in select_list) {
		if (! (select_list[i].player in select_player_list)) {
			select_player_list[select_list[i].player] = new Array();
		}
		select_player_list[select_list[i].player] = select_player_list[select_list[i].player].concat(select_list[i].cards);
	}
	// change to array
	var select_card_list = new Array();
	for (var i in select_player_list) {
		select_card_list.push({
			player: i,
			cards: select_player_list[i]
		});
	}
	var that = this;
	select_card_list.sort(function (a, b) {
		return BOARDFUL.MODS.Poker.compare(a.cards, b.cards);
	});
	var player_list = new Array();
	var card_list = new Array();
	var all_card_list = new Array();
	for (var i in select_card_list) {
		player_list.push(select_card_list[i].player);
		card_list.push(select_card_list[i].cards);
		all_card_list = all_card_list.concat(select_card_list[i].cards);
	}
	var winner = undefined;
	if (select_card_list.length > 0) {
		winner = select_card_list[select_card_list.length - 1].player;
	}
	// event for ui
	var event_list = new Array();
	var event = new BOARDFUL.Event({
		name: "SettlePlayersDuelUi",
		source: Poker.id,
		cards: card_list,
		all_cards: all_card_list,
		players: player_list,
		player: winner
	});
	event_list.push(event.id);
	BOARDFUL.Mngr.get(Poker.owner).event_mngr.front(event_list);
};
Poker.settlePlayersDuelUi = function (arg) {
	var event_list = new Array();
	for (var i in arg.all_cards) {
		var event = new BOARDFUL.Event({
			name: "ShowCard",
			source: BOARDFUL.Mngr.get(Poker.owner).table,
			card: arg.all_cards[i]
		});
		event_list.push(event.id);
	}
	var event = new BOARDFUL.Event({
		name: "ShowResult",
		source: BOARDFUL.Mngr.get(Poker.owner).table,
		cards: arg.all_cards,
		player: arg.player
	});
	event_list.push(event.id);
	var event = new BOARDFUL.Event({
		name: "Discard",
		source: BOARDFUL.Mngr.get(Poker.owner).table,
		cards: arg.all_cards
	});
	event_list.push(event.id);
	BOARDFUL.Mngr.get(Poker.owner).event_mngr.front(event_list);
};
Poker.showResult = function (arg) {
	var event_list = new Array();
	var event = new BOARDFUL.Event({
		name: "ChangePlayerValueUi",
		source: Poker.id,
		player: arg.player,
		target: "score",
		value: 1
	});
	event_list.push(event.id);
	BOARDFUL.Mngr.get(Poker.owner).event_mngr.front(event_list);
	BOARDFUL.Mngr.get(Poker.owner).status = "uieffect";
	setTimeout(function () {
		BOARDFUL.Mngr.get(Poker.owner).status = "run";
	}, 2000);
};
// discard
Poker.discard = function (arg) {
	var deck = BOARDFUL.Mngr.get(BOARDFUL.Mngr.get(Poker.owner).deck_list.discard);
	deck.getCards(arg.cards);
};
// reorder deck
Poker.reorderDeck = function (arg) {
	var discard = BOARDFUL.Mngr.get(BOARDFUL.Mngr.get(Poker.owner).deck_list.discard);
	discard.card_list = BOARDFUL.shuffle(discard.card_list);
	BOARDFUL.Mngr.get(arg.deck).getCards(discard.card_list);
	discard.card_list = new Array();
};
// play card AI
Poker.playCardAi = function (arg) {
	var hand = BOARDFUL.Mngr.get(BOARDFUL.Mngr.get(arg.player).hand).card_list;
	if (0 == hand.length) {
		return;
	}
	var card_list = Poker.getBestHand(hand, arg.number);
	var event = new BOARDFUL.Event({
		name: "PlaceCardOnTable",
		source: arg.player,
		source_event: arg.source_event,
		player: arg.player,
		cards: card_list
	});
	BOARDFUL.Mngr.get(Poker.owner).event_mngr.front(event.id);
};
/**
 * Poker game.
 *
 * @author		Fei Zhan
 * @version		0.0
 * 
**/

// if nodejs, load BOARDFUL
if (typeof module !== 'undefined' && module.exports) {
	var BOARDFUL = require("../../build/boardful.core.js");
	var Poker = require("./cards.js");
	var Poker1 = require("./ai.js");
	for (var i in Poker1) {
		if (! (i in Poker)) {
			Poker[i] = Poker1[i];
		}
	}
	module.exports = Poker;
} else {
	BOARDFUL.MODS = BOARDFUL.MODS || new Object();
	var Poker = BOARDFUL.MODS.Poker || new Object();
}

// poker
Poker.register = Poker.register || function (owner) {
	Poker.type = "Mod";
	Poker.owner = owner;
	Poker.name = "Poker";
	Poker.game = BOARDFUL.Mngr.get(Poker.owner).game;
	BOARDFUL.Mngr.add(Poker);
	return Poker.id;
};
// add listeners
Poker.addListeners = function () {
	BOARDFUL.Mngr.get(Poker.owner).event_mngr.on("StartGame", {
		level: "game",
		callback: function (arg) {
			Poker.startGame(arg);
		},
		id: Poker.id
	});
	BOARDFUL.Mngr.get(Poker.owner).event_mngr.on("EndRound", {
		level: "game",
		callback: function (arg) {
			Poker.endRound(arg);
		},
		id: Poker.id
	});
	BOARDFUL.Mngr.get(Poker.owner).event_mngr.on("CreateDeck", {
		level: "game",
		callback: function (arg) {
			Poker.createDeck(arg);
		},
		id: Poker.id
	});
	BOARDFUL.Mngr.get(Poker.owner).event_mngr.on("PlayerAct", {
		level: "game",
		callback: function (arg) {
			Poker.playerAct(arg);
		},
		id: Poker.id
	});
	BOARDFUL.Mngr.get(Poker.owner).event_mngr.on("SettlePlayersDuelUi", {
		level: "game",
		callback: function (arg) {
			Poker.settlePlayersDuelUi(arg);
		},
		id: Poker.id
	});
	BOARDFUL.Mngr.get(Poker.owner).event_mngr.on("Settle", {
		level: "game",
		callback: function (arg) {
			Poker.settle(arg);
		},
		id: Poker.id
	});
	BOARDFUL.Mngr.get(Poker.owner).event_mngr.on("Discard", {
		level: "game",
		callback: function (arg) {
			Poker.discard(arg);
		},
		id: Poker.id
	});
	BOARDFUL.Mngr.get(Poker.owner).event_mngr.on("ReorderDeck", {
		level: "game",
		callback: function (arg) {
			Poker.reorderDeck(arg);
		},
		id: Poker.id
	});
	BOARDFUL.Mngr.get(Poker.owner).event_mngr.on("PlayCardAi", {
		level: "game",
		callback: function (arg) {
			Poker.playCardAi(arg);
		},
		id: Poker.id
	});
};
// start game
Poker.startGame = function (arg) {
};
Poker.endRound = function (arg) {
	var event_list = new Array();
	// settle players duel
	var event = new BOARDFUL.Event({
		name: "Settle",
		source: Poker.id,
		source_event: "PlayersDuel"
	});
	event_list.push(event.id);
	BOARDFUL.Mngr.get(Poker.owner).event_mngr.front(event_list);
};
// create deck
Poker.createDeck = function (arg) {
	var card_list = Poker.createCards();
	BOARDFUL.Mngr.get(arg.deck).getCards(card_list);
};
// players duel
Poker.playerAct = function (arg) {
	var event_list = new Array();
	var event;
	// each player play cards
	event = new BOARDFUL.Event({
		name: "Player" + arg.player + "PlayCard",
		source: Poker.id,
		source_event: "PlayersDuel",
		player: arg.player,
		number: 5
	});
	event_list.push(event.id);
	BOARDFUL.Mngr.get(Poker.owner).event_mngr.front(event_list);
};
// settle players duel
Poker.settle = function (arg) {
	var select_list = BOARDFUL.Mngr.get(BOARDFUL.Mngr.get(Poker.owner).table).getCardsBySource("PlayersDuel");
	// group player's cards together
	var select_player_list = new Array();
	for (var i in select_list) {
		if (! (select_list[i].player in select_player_list)) {
			select_player_list[select_list[i].player] = new Array();
		}
		select_player_list[select_list[i].player] = select_player_list[select_list[i].player].concat(select_list[i].cards);
	}
	// change to array
	var select_card_list = new Array();
	for (var i in select_player_list) {
		select_card_list.push({
			player: i,
			cards: select_player_list[i]
		});
	}
	select_card_list.sort(function (a, b) {
		return BOARDFUL.MODS.Poker.compareHand(a.cards, b.cards);
	});
	var player_list = new Array();
	var card_list = new Array();
	var all_card_list = new Array();
	for (var i in select_card_list) {
		player_list.push(select_card_list[i].player);
		card_list.push(select_card_list[i].cards);
		all_card_list = all_card_list.concat(select_card_list[i].cards);
	}
	var winner = undefined;
	if (select_card_list.length > 0) {
		winner = select_card_list[select_card_list.length - 1].player;
	}
	// event for ui
	var event_list = new Array();
	var event = new BOARDFUL.Event({
		name: "SettlePlayersDuelUi",
		source: Poker.id,
		cards: card_list,
		all_cards: all_card_list,
		players: player_list,
		player: winner
	});
	event_list.push(event.id);
	BOARDFUL.Mngr.get(Poker.owner).event_mngr.front(event_list);
};
Poker.settlePlayersDuelUi = function (arg) {
	console.log("winner", BOARDFUL.Mngr.get(arg.player).name);
	for (var i in arg.all_cards) {
		BOARDFUL.Mngr.get(BOARDFUL.Mngr.get(arg.cards[i]).ui).show();
	}
	var event_list = new Array();
	var event = new BOARDFUL.Event({
		name: "Discard",
		source: BOARDFUL.Mngr.get(Poker.owner).table,
		cards: arg.all_cards
	});
	event_list.push(event.id);
	BOARDFUL.Mngr.get(Poker.owner).event_mngr.front(event_list);
};
// discard
Poker.discard = function (arg) {
	var deck = BOARDFUL.Mngr.get(BOARDFUL.Mngr.get(Poker.owner).deck_list.discard);
	deck.getCards(arg.cards);
};
// reorder deck
Poker.reorderDeck = function (arg) {
	var discard = BOARDFUL.Mngr.get(BOARDFUL.Mngr.get(Poker.owner).deck_list.discard);
	discard.card_list = BOARDFUL.shuffle(discard.card_list);
	BOARDFUL.Mngr.get(arg.deck).getCards(discard.card_list);
	discard.card_list = new Array();
};
// play card AI
Poker.playCardAi = function (arg) {
	var hand = BOARDFUL.Mngr.get(BOARDFUL.Mngr.get(arg.player).hand).card_list;
	if (0 == hand.length) {
		return;
	}
	var card_list = Poker.getBestHand(hand, arg.number);
	var event = new BOARDFUL.Event({
		name: "PlaceCardOnTable",
		source: arg.player,
		source_event: arg.source_event,
		player: arg.player,
		cards: card_list
	});
	BOARDFUL.Mngr.get(Poker.owner).event_mngr.front(event.id);
};
/**
 * AI for uno game.
 *
 * @author		Fei Zhan
 * @version		0.0
 * 
**/

// if nodejs, load BOARDFUL
if (typeof module !== 'undefined' && module.exports) {
	var BOARDFUL = require("../../build/boardful.core.js");
	var Uno = require("./cards.js");
	module.exports = Uno;
} else {
	BOARDFUL.MODS = BOARDFUL.MODS || new Object();
	var Uno = BOARDFUL.MODS.Uno || new Object();
}

/**
 * Cards for uno game.
 *
 * @author		Fei Zhan
 * @version		0.0
 * 
**/

// if nodejs, load BOARDFUL
if (typeof module !== 'undefined' && module.exports) {
	var BOARDFUL = require("../../build/boardful.core.js");
}

// uno
var Uno = Uno || {
	type: "Mod",
	name: "Uno"
};
// if nodejs, export as module
if (typeof module !== 'undefined' && module.exports) {
	module.exports = Uno;
} else {
	BOARDFUL.MODS.Uno = Uno;
}
Uno.register = function (owner) {
	Uno.owner = owner;
	Uno.game = BOARDFUL.Mngr.get(Uno.owner).game;
	BOARDFUL.Mngr.add(Uno);
	return Uno.id;
};

// create cards
Uno.createCards = function () {
	var card_list = new Array();
	var card;
	for (var i = 0; i < 4; ++ i) {
		card = new BOARDFUL.Card({
			rank: 0,
			color: Uno.COLOR[i]
		}, Uno.id);
		card_list.push(card.id);
		for (var j = 0; j < 2; ++ j) {
			for (var k = 1; k <= 9; ++ k) {
				card = new BOARDFUL.Card({
					rank: k,
					color: Uno.COLOR[i]
				}, Uno.id);
				card_list.push(card.id);
			}
			card = new BOARDFUL.Card({
				rank: "skip",
				color: Uno.COLOR[i]
			}, Uno.id);
			card_list.push(card.id);
			card = new BOARDFUL.Card({
				rank: "draw two",
				color: Uno.COLOR[i]
			}, Uno.id);
			card_list.push(card.id);
			card = new BOARDFUL.Card({
				rank: "reverse",
				color: Uno.COLOR[i]
			}, Uno.id);
			card_list.push(card.id);
		}
	}
	for (var i = 0; i < 4; ++ i) {
		card = new BOARDFUL.Card({
			rank: "wild",
			color: "black"
		}, Uno.id);
		card_list.push(card.id);
		card = new BOARDFUL.Card({
			rank: "wild draw four",
			color: "black"
		}, Uno.id);
		card_list.push(card.id);
	}
	return card_list;
};
Uno.COLOR = ["red", "green", "blue", "yellow", "black"];
/**
 * Uno game.
 *
 * @author		Fei Zhan
 * @version		0.0
 * 
**/

// if nodejs, load BOARDFUL
if (typeof module !== 'undefined' && module.exports) {
	var BOARDFUL = require("../../build/boardful.core.js");
	var Uno = require("./cards.js");
	var Uno1 = require("./ai.js");
	for (var i in Uno1) {
		if (! (i in Uno)) {
			Uno[i] = Uno1[i];
		}
	}
	module.exports = Uno;
} else {
	BOARDFUL.MODS = BOARDFUL.MODS || new Object();
	var Uno = BOARDFUL.MODS.Uno || new Object();
}

// Uno
Uno.register = Uno.register || function (owner) {
	Uno.type = "Mod";
	Uno.owner = owner;
	Uno.name = "Uno";
	Uno.game = BOARDFUL.Mngr.get(Uno.owner).game;
	BOARDFUL.Mngr.add(Uno);
	return Uno.id;
};
// add listeners
Uno.addListeners = function () {
	BOARDFUL.Mngr.get(Uno.owner).event_mngr.on("StartGame", {
		level: "game",
		callback: function (arg) {
			Uno.startGame(arg);
		},
		id: Uno.id
	});
	BOARDFUL.Mngr.get(Uno.owner).event_mngr.on("CreateDeck", {
		level: "game",
		callback: function (arg) {
			Uno.createDeck(arg);
		},
		id: Uno.id
	});
	BOARDFUL.Mngr.get(Uno.owner).event_mngr.on("PlayerAct", {
		level: "game",
		callback: function (arg) {
			Uno.playerAct(arg);
		},
		id: Uno.id
	});
	BOARDFUL.Mngr.get(Uno.owner).event_mngr.on("Settle", {
		level: "game",
		callback: function (arg) {
			Uno.settle(arg);
		},
		id: Uno.id
	});
	BOARDFUL.Mngr.get(Uno.owner).event_mngr.on("SettlePlayersDuelUi", {
		level: "game",
		callback: function (arg) {
			Uno.settlePlayersDuelUi(arg);
		},
		id: Uno.id
	});
	BOARDFUL.Mngr.get(Uno.owner).event_mngr.on("Discard", {
		level: "game",
		callback: function (arg) {
			Uno.discard(arg);
		},
		id: Uno.id
	});
	BOARDFUL.Mngr.get(Uno.owner).event_mngr.on("ReorderDeck", {
		level: "game",
		callback: function (arg) {
			Uno.reorderDeck(arg);
		},
		id: Uno.id
	});
	BOARDFUL.Mngr.get(Uno.owner).event_mngr.on("PlayCardAi", {
		level: "game",
		callback: function (arg) {
			Uno.playCardAi(arg);
		},
		id: Uno.id
	});
};
// start game
Uno.startGame = function () {
};
// create deck
Uno.createDeck = function (arg) {
	BOARDFUL.Mngr.get(arg.deck).getCards(Uno.createCards());
};
// player act
Uno.playerAct = function (arg) {
	var event_list = new Array();
	var event;
	for (var i in BOARDFUL.Mngr.get(this.owner).player_list) {
		// each player play one card
		event = new BOARDFUL.Event({
			name: "Player" + BOARDFUL.Mngr.get(this.owner).player_list[i] + "PlayCard",
			source: this.id,
			source_event: "PlayersDuel",
			player: BOARDFUL.Mngr.get(this.owner).player_list[i],
			number: 1
		});
		event_list.push(event.id);
	}
	// settle players duel
	event = new BOARDFUL.Event({
		name: "Settle",
		source: this.id,
		source_event: "PlayersDuel"
	});
	event_list.push(event.id);
	BOARDFUL.Mngr.get(this.owner).event_mngr.front(event_list);
};
// settle players duel
Poker.settle = function (arg) {
	var select_list = BOARDFUL.Mngr.get(BOARDFUL.Mngr.get(this.owner).table).getCardsBySource("PlayersDuel");
	// group player's cards together
	var select_player_list = new Array();
	for (var i in select_list) {
		if (! (select_list[i].player in select_player_list)) {
			select_player_list[select_list[i].player] = new Array();
		}
		select_player_list[select_list[i].player] = select_player_list[select_list[i].player].concat(select_list[i].cards);
	}
	// change to array
	var select_card_list = new Array();
	for (var i in select_player_list) {
		select_card_list.push({
			player: i,
			cards: select_player_list[i]
		});
	}
	var that = this;
	select_card_list.sort(function (a, b) {
		return BOARDFUL.MODS.Poker.compare(a.cards, b.cards);
	});
	var player_list = new Array();
	var card_list = new Array();
	var all_card_list = new Array();
	for (var i in select_card_list) {
		player_list.push(select_card_list[i].player);
		card_list.push(select_card_list[i].cards);
		all_card_list = all_card_list.concat(select_card_list[i].cards);
	}
	var winner = undefined;
	if (select_card_list.length > 0) {
		winner = select_card_list[select_card_list.length - 1].player;
	}
	// event for ui
	var event_list = new Array();
	var event = new BOARDFUL.Event({
		name: "SettlePlayersDuelUi",
		source: Poker.id,
		cards: card_list,
		all_cards: all_card_list,
		players: player_list,
		player: winner
	});
	event_list.push(event.id);
	BOARDFUL.Mngr.get(Poker.owner).event_mngr.front(event_list);
};
Poker.settlePlayersDuelUi = function (arg) {
	console.log("winner", BOARDFUL.Mngr.get(arg.player).name);
	for (var i in arg.all_cards) {
		BOARDFUL.Mngr.get(BOARDFUL.Mngr.get(arg.cards[i]).ui).show();
	}
	var event_list = new Array();
	var event = new BOARDFUL.Event({
		name: "Discard",
		source: BOARDFUL.Mngr.get(Poker.owner).table,
		cards: arg.all_cards
	});
	event_list.push(event.id);
	BOARDFUL.Mngr.get(Poker.owner).event_mngr.front(event_list);
};
// discard
Poker.discard = function (arg) {
	var deck = BOARDFUL.Mngr.get(BOARDFUL.Mngr.get(Poker.owner).deck_list.discard);
	deck.getCards(arg.cards);
};
// reorder deck
Poker.reorderDeck = function (arg) {
	var discard = BOARDFUL.Mngr.get(BOARDFUL.Mngr.get(Poker.owner).deck_list.discard);
	discard.card_list = BOARDFUL.shuffle(discard.card_list);
	BOARDFUL.Mngr.get(arg.deck).getCards(discard.card_list);
	discard.card_list = new Array();
};
// play card AI
Poker.playCardAi = function (arg) {
	var hand = BOARDFUL.Mngr.get(BOARDFUL.Mngr.get(arg.player).hand).card_list;
	if (0 == hand.length) {
		return;
	}
	var card_list = Poker.getBestHand(hand, arg.number);
	var event = new BOARDFUL.Event({
		name: "PlaceCardOnTable",
		source: arg.player,
		source_event: arg.source_event,
		player: arg.player,
		cards: card_list
	});
	BOARDFUL.Mngr.get(Poker.owner).event_mngr.front(event.id);
};