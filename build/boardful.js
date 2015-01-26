/**
 * Gui for card.
 *
 * @author		Fei Zhan
 * @version		0.0
**/

var BOARDFUL = BOARDFUL || new Object();
BOARDFUL.BRSR = BOARDFUL.BRSR || new Object();

BOARDFUL.BRSR.CardUi = function (instance, owner) {
	this.type = "CardUi";
	this.instance = instance;
	this.owner = owner;
	BOARDFUL.Mngr.add(this);
	var load_files = new BOARDFUL.CORE.FileLoader(["src/browser/card.html", "src/browser/card.css"], function () {
	});
};
BOARDFUL.BRSR.CardUi.prototype.load = function (config, callback) {
	config = config || new Object();
	config.parent = config.parent || "";
	var that = this;
	$.get("src/browser/card.html", function (text, status, xhr) {
		$("#content " + config.parent).append(text);
		$("#content " + config.parent + " .card:last").attr("id", that.id);
		var card_jq = $("#content #" + that.id);
		if (config.position) {
			card_jq.css(config.position);
		}
		card_jq.find("h4").html(BOARDFUL.Mngr.get(that.instance).name);
		card_jq.draggable({
			stop: function (event, ui) {
				// expand and disappear
				card_jq.animate({
					top: '-=100px',
					left: '-=100px',
					height: '+=200px',
					width: '+=200px',
					opacity: 0,
				}, "slow", function () {
					$(this).remove();
				});
			},
		});
		card_jq.hover(function () {
			// move to front
			$(this).css("z-index", 1);
		}, function () {
			// move back
			$(this).css("z-index", 0);
		});
		if ("function" == typeof callback) {
			callback(card_jq);
		}
	});
};
BOARDFUL.BRSR.CardUi.prototype.move = function (config) {
	var jq = $("#content #" + this.id);
	if (0 == jq.length) {
		var that = this;
		this.load({
			position: {
				top: "50%",
				left: "80%"
			}
		}, function () {
			that.move(config);
		});
	} else {
		jq.animate({
			top: config.position.top,
			left: config.position.left
		}, "slow", function () {
			jq.css({
				top: 0,
				left: 0
			});
			var element = jq.detach();
			$('#content #myhand').append(element);
		});
	}
};
/**
 * Gui for game.
 *
 * @author		Fei Zhan
 * @version		0.0
**/

var BOARDFUL = BOARDFUL || new Object();
BOARDFUL.BRSR = BOARDFUL.BRSR || new Object();

BOARDFUL.BRSR.GameUi = function (owner) {
	this.type = "GameUi";
	this.owner = owner;
	BOARDFUL.Mngr.add(this);
	BOARDFUL.CORE.Command.owner = this.owner;
	this.addListeners();
	$("#content").empty();
	$("#content").load("src/browser/game.html", function () {
		$("#content #ok").on("click", function () {
		});
	});
	this.player_list = new Array();
	for (var i in BOARDFUL.Mngr.get(this.owner).player_list) {
		this.player_list.push(new BOARDFUL.BRSR.PlayerUi(BOARDFUL.Mngr.get(this.owner).player_list[i]).id);
	}
	var load_files = new BOARDFUL.CORE.FileLoader(["src/browser/game.html", "src/browser/game.css"], function () {
	});
};
BOARDFUL.BRSR.GameUi.prototype.addListeners = function () {
	var that = this;
	BOARDFUL.Mngr.get(this.owner).event_mngr.on("DealCardsUi", {
		level: "game",
		callback: function (arg) {
			that.dealCardsUi(arg);
		},
		id: that.id
	});
};

BOARDFUL.BRSR.GameUi.prototype.dealCardsUi = function (arg) {
	console.log("deal cards", arg.cards);
	for (var i in arg.cards) {
		var card = new BOARDFUL.BRSR.CardUi(arg.cards[i], this);
		card.move({
			position: {
				top: "65%",
				left: "50%"
			}
		});
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
BOARDFUL.BRSR.run = function () {
	$('#header #options').click(function () {
		console.log("options");
	});
	$("#content").empty();
	// load menu0
	$("#content").load("src/browser/menu0.html", function () {
		$('#content #main #local').click(function () {
			BOARDFUL.BRSR.loadMenu1();
		});
		$('#content #secondary #options').click(function () {
			console.log("options");
		});
	});
	var load = new BOARDFUL.CORE.FileLoader(["src/browser/menu0.html", "src/browser/menu0.css"], function () {});
};
BOARDFUL.BRSR.Selected = undefined;
// load menu1
BOARDFUL.BRSR.loadMenu1 = function () {
	$("#content").empty();
	$("#content").load("src/browser/menu1.html", function () {
		$("#content button#ok").click(function () {
			if (undefined === BOARDFUL.BRSR.Selected) {
				return;
			}
			var board = BOARDFUL.Mngr.get(BOARDFUL.BRSR.Selected);
			board.load(BOARDFUL.BRSR.loadMenu2);
		});
		for (var i in BOARDFUL.BoardList) {
			var board = BOARDFUL.Mngr.get(BOARDFUL.BoardList[i]);
			$("#content #boardlist ul").append('<li id="' + BOARDFUL.BoardList[i] + '">' + board.config.name + "</li>");
			$("#content #boardlist ul li:last").click(function () {
				BOARDFUL.BRSR.Selected = $(this).attr('id');
				$("#content #boardlist li").removeClass("active");
				$(this).addClass("active");
				$("#content #descrip").html(BOARDFUL.Mngr.get(BOARDFUL.BRSR.Selected).config.descrip);
			});
		}
	});
	var load = new BOARDFUL.CORE.FileLoader(["src/browser/menu1.html", "src/browser/menu1.css"], function () {});
};
// load menu2
BOARDFUL.BRSR.loadMenu2 = function (id) {
	var room = BOARDFUL.Mngr.get(id);
	$("#content").empty();
	$("#content").load("src/browser/menu2.html", function () {
		$("#content button#ok").on("click", function () {
			var game = new BOARDFUL.CORE.Game(id);
			game.ui = new BOARDFUL.BRSR.GameUi(game.id);
			game.run();
		});
		$("#content #name").html(room.config.name);
		$("#content #descrip1").html(room.config.descrip);
		$("#content #players").append("<div><span>me</span></div>");
		for (var i = 1; i < room.config.max_players; ++ i) {
			$("#content #players").append("<div><span>empty</span></div>");
		}
		for (var i in room.config.options) {
			$("#content #roomoptions").append('<div id="' + i + '"></div>');
			$("#content #roomoptions #" + i).append('<span>' + i + '</span><select></select>');
			for (var j in room.config.options[i].value) {
				$("#content #roomoptions #" + i + " select").append('<option value="' + room.config.options[i].value[j] + '">' + room.config.options[i].value[j] + '</option>');
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

BOARDFUL.BRSR.PlayerUi = function (owner) {
	this.type = "PlayerUi";
	this.owner = owner;
	BOARDFUL.Mngr.add(this);
	var load;
	switch (BOARDFUL.Mngr.get(this.owner).name) {
	case "ai":
		load = "src/browser/player_you.html";
		break;
	case "me":
	default:
		load = "src/browser/player_me.html";
		break;
	}
	$.get(load, function (text, status, xhr) {
		$("#content").append(text);
	});
	var load_files = new BOARDFUL.CORE.FileLoader(["src/browser/player_me.html", "src/browser/player_you.html", "src/browser/player.css"], function () {});
};
/**
 * Board game.
 *
 * @author		Fei Zhan
 * @version		0.0
**/

var BOARDFUL = BOARDFUL || new Object();
BOARDFUL.CORE = BOARDFUL.CORE || new Object();

// board game
BOARDFUL.CORE.Board = function (config, owner) {
	this.type = "Board";
	this.owner = owner;
	this.name = config.name;
	BOARDFUL.Mngr.add(this);
	this.config = config;
	this.room_list = new Array();
};
// load board game
BOARDFUL.CORE.Board.prototype.load = function (callback) {
	var that = this;
	var load = new BOARDFUL.CORE.FileLoader([this.config.package], function () {
		var package = BOARDFUL.CORE.File.list[BOARDFUL.CORE.File.name_list[that.config.package]].content;
		var load1 = new BOARDFUL.CORE.FileLoader(package.files, function () {
			for (var i in package.files) {
				if (".js" == package.files[i].substr(package.files[i].length - 3)) {
					BOARDFUL.CORE.File.setToMods(package.files[i]);
				}
			}
			BOARDFUL.Logger.log("info", "load board", that.name);
			that.createRoom(package, callback);
		});
	});
};
// create room
BOARDFUL.CORE.Board.prototype.createRoom = function (package, callback) {
	var room = new BOARDFUL.CORE.Room(package, this.id);
	this.room_list.push(room.id);
	if ("function" == typeof callback) {
		return callback(room.id);
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
	BOARDFUL.CORE.checkEnvi();
	// create logger
	BOARDFUL.Logger = new BOARDFUL.CORE.Logger();
	BOARDFUL.Logger.add(winston.transports.File, {
		//filename: 'logs/boardful_' + new Date().toString() + '.log'
		filename: 'logs/boardful.log'
	})
	.remove(winston.transports.Console);
	BOARDFUL.Logger.log('info', "----------launch----------");
	// create debug logger
	BOARDFUL.Debugger = new BOARDFUL.CORE.Logger();
	BOARDFUL.Debugger.add(winston.transports.File, {
		filename: 'logs/debug.log'
	})
	.remove(winston.transports.Console);
	BOARDFUL.Debugger.log('info', "----------launch----------");

	BOARDFUL.Logger.log('info', "launch type", config);
	BOARDFUL.Logger.log('info', "environment", BOARDFUL.CORE.Envi);
	BOARDFUL.CORE.File.init();
	if ("browser" == BOARDFUL.CORE.Envi.type) {
		BOARDFUL.urlparam = BOARDFUL.CORE.parseUrl();
		BOARDFUL.Logger.log('info', "url param", BOARDFUL.urlparam);
		BOARDFUL.CORE.File.getFromHtml();
	}
	BOARDFUL.Mngr = new BOARDFUL.CORE.Manager();
	BOARDFUL.loadBoards();
};
// board game list
BOARDFUL.BoardList = new Array();
// load board game list
BOARDFUL.loadBoards = function () {
	var BOARD_LIST_FILE = "src/core/boardlist.json";
	var load_files = new BOARDFUL.CORE.FileLoader([BOARD_LIST_FILE], function () {
		var board_list = BOARDFUL.CORE.File.list[BOARDFUL.CORE.File.name_list[BOARD_LIST_FILE]].content.boards;
		for (var i in board_list) {
			BOARDFUL.BoardList.push(new BOARDFUL.CORE.Board(board_list[i]).id);
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
BOARDFUL.CORE = BOARDFUL.CORE || new Object();

// card
BOARDFUL.CORE.Card = function (config, owner) {
	this.type = "Card";
	this.rank = config.rank;
	this.suit = config.suit;
	this.color = config.color;
	this.name = "card_" + this.rank + "_" + this.suit;
	this.owner = owner;
	BOARDFUL.Mngr.add(this);
};
/**
 * Command.
 *
 * @author		Fei Zhan
 * @version		0.0
**/

var BOARDFUL = BOARDFUL || new Object();
BOARDFUL.CORE = BOARDFUL.CORE || new Object();

// command
BOARDFUL.CORE.Command = BOARDFUL.CORE.Command || new Object();
BOARDFUL.CORE.Command.owner = undefined;
// call command function
BOARDFUL.CORE.Command.call = function (cmd) {
	var arg_list = cmd.replace(/\s/g, " ").split(" ");
	if (0 == arg_list.length) {
		return;
	}
	cmd = arg_list[0];
	arg_list.shift();
	if (cmd in BOARDFUL.CORE.Command.list) {
		return BOARDFUL.CORE.Command.list[cmd](arg_list);
	} else {
		console.log("unknow cmd", cmd);
	}
};
BOARDFUL.CORE.Command.list = {
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
		if (BOARDFUL.CORE.Command.owner) {
			console.log(BOARDFUL.Mngr.get(BOARDFUL.CORE.Command.owner).event_mngr.current.name);
		} else {
			console.log(undefined);
		}
	},
	"nextEvent": function (args) {
		if (BOARDFUL.CORE.Command.owner) {
			console.log(BOARDFUL.Mngr.get(BOARDFUL.CORE.Command.owner).event_mngr.list[0]);
		} else {
			console.log(undefined);
		}
	},
	"boards": function (args) {
		console.log(BOARDFUL.BoardList);
	},
	"pause": function (args) {
		if (BOARDFUL.CORE.Command.owner) {
			BOARDFUL.Mngr.get(BOARDFUL.CORE.Command.owner).pause();
		}
	},
	"resume": function (args) {
		if (BOARDFUL.CORE.Command.owner) {
			BOARDFUL.Mngr.get(BOARDFUL.CORE.Command.owner).resume();
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
BOARDFUL.CORE = BOARDFUL.CORE || new Object();

// deck
BOARDFUL.CORE.Deck = function (owner) {
	this.type = "Deck";
	this.owner = owner;
	BOARDFUL.Mngr.add(this);
	this.card_list = new Array();
	this.addListeners();
};
// add listeners
BOARDFUL.CORE.Deck.prototype.addListeners = function () {
	var that = this;
	BOARDFUL.Mngr.get(this.owner).event_mngr.on("ShuffleDeck", {
		level: "game",
		callback: function (arg) {
			that.shuffleDeck(arg);
		},
		id: that.id
	});
	BOARDFUL.Mngr.get(this.owner).event_mngr.on("DealCards", {
		level: "game",
		callback: function (arg) {
			that.dealCards(arg);
		},
		id: that.id
	});
};
// shuffle deck
BOARDFUL.CORE.Deck.prototype.shuffleDeck = function (arg) {
	// not me
	if (arg.deck != this.id) {
		return;
	}
	this.card_list = BOARDFUL.CORE.shuffle(this.card_list);
	// add ui event
	var event_list = new Array();
	var event = new BOARDFUL.CORE.Event({
		name: "ShuffleDeckUi",
		source: this.id,
		cards: this.card_list
	});
	event_list.push(event.id);
	BOARDFUL.Mngr.get(this.owner).event_mngr.front(event_list);
};
// get cards
BOARDFUL.CORE.Deck.prototype.getCards = function (card_list) {
	for (var i in card_list) {
		BOARDFUL.Mngr.get(card_list[i]).owner = this.id;
	}
	this.card_list = this.card_list.concat(card_list);
};
// deal cards
BOARDFUL.CORE.Deck.prototype.dealCards = function (arg) {
	// not me
	if (arg.deck != this.id) {
		return;
	}
	var card_list = new Array();
	for (var i = 0; i < arg.number; ++ i) {
		card_list.push(this.card_list[0]);
		this.card_list.shift();
	}
	BOARDFUL.Mngr.get(arg.player).hand = BOARDFUL.Mngr.get(arg.player).hand.concat(card_list);
	// create event for ui
	var event_list = new Array();
	var event = new BOARDFUL.CORE.Event({
		name: "DealCardsUi",
		source: this.id,
		cards: card_list,
		player: arg.player
	});
	event_list.push(event.id);
	BOARDFUL.Mngr.get(this.owner).event_mngr.front(event_list);
};
/**
 * Event.
 *
 * @author		Fei Zhan
 * @version		0.0
**/

var BOARDFUL = BOARDFUL || new Object();
BOARDFUL.CORE = BOARDFUL.CORE || new Object();

// event
BOARDFUL.CORE.Event = function (arg) {
	this.type = "Event";
	this.owner = undefined;
	BOARDFUL.Mngr.add(this);
	this.name = arg.name;
	this.arg = arg;
	this.arg.creation_time = new Date();
};

// event level precedence
BOARDFUL.CORE.EVENT_LEVELS = ["top", "system", "server", "board", "room", "game", "extension", "player", "card", "rear"];
// event manager
BOARDFUL.CORE.EventMngr = function (owner) {
	this.type = "EventMngr";
	this.owner = owner;
	BOARDFUL.Mngr.add(this);
	this.current = undefined;
	this.list = new Array();
	this.listener_list = new Object();
	this.timeout = 100;
	this.logger = new BOARDFUL.CORE.Logger();
	this.logger.add(winston.transports.File, {
		filename: 'logs/event.log'
	})
	.remove(winston.transports.Console);
	this.logger.log('info', "----------launch----------");
};
// see or push to the front of event list
BOARDFUL.CORE.EventMngr.prototype.front = function (id) {
	if (undefined === id) {
		if (0 == this.list.length) {
			return undefined;
		}
	}
	else if ("array" == typeof id || "object" == typeof id) {
		this.list = id.concat(this.list);
		this.logger.log("info", "prepend events", id);
	}
	else {
		this.list.unshift(id);
		this.logger.log("info", "prepend event", id);
	}
	return BOARDFUL.Mngr.get(this.list[0]);
};
// add to the rear of event list
BOARDFUL.CORE.EventMngr.prototype.add = function (id) {
	if ("array" == typeof id || "object" == typeof id) {
		this.list = this.list.concat(id);
		this.logger.log("info", "append events", id);
	}
	else {
		this.list.push(id);
		this.logger.log("info", "append event", id);
	}
};
// add event listener
BOARDFUL.CORE.EventMngr.prototype.on = function (event, config) {
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
BOARDFUL.CORE.EventMngr.prototype.off = function (event, config) {
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
BOARDFUL.CORE.EventMngr.prototype.run = function () {
	switch (BOARDFUL.Mngr.get(this.owner).status) {
	case "pause":
	case "exit":
		break;
	case "run":
	default:
		if (this.list.length > 0) {
			// get the current event
			this.current = this.front();
			this.logger.log("info", "event", this.current.name);
			this.list.shift();
			if (this.current && (this.current.name in this.listener_list)) {
				for (var i in BOARDFUL.CORE.EVENT_LEVELS) {
					if (BOARDFUL.CORE.EVENT_LEVELS[i] in this.listener_list[this.current.name]) {
						for (var j in this.listener_list[this.current.name][BOARDFUL.CORE.EVENT_LEVELS[i]]) {
							var listener = this.listener_list[this.current.name][BOARDFUL.CORE.EVENT_LEVELS[i]][j];
							this.logger.log("info", "trigger", listener);
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
BOARDFUL.CORE = BOARDFUL.CORE || new Object();

// file manager
BOARDFUL.CORE.File = BOARDFUL.CORE.File || new Object();
// init file manager
BOARDFUL.CORE.File.init = function () {
	// file mngr logger
	BOARDFUL.CORE.File.logger = new BOARDFUL.CORE.Logger();
	BOARDFUL.CORE.File.logger.add(winston.transports.File, {
		filename: 'logs/file.log'
	})
	.remove(winston.transports.Console);
	BOARDFUL.CORE.File.logger.log('info', "----------launch----------");
};
// file list
BOARDFUL.CORE.File.list = new Object();
// file list by name
BOARDFUL.CORE.File.name_list = new Object();
BOARDFUL.CORE.File.next_id = 0;
// add to file list
BOARDFUL.CORE.File.add = function (file, content, status) {
	// new file
	if (! (file in BOARDFUL.CORE.File.name_list)) {
		BOARDFUL.CORE.File.list[BOARDFUL.CORE.File.next_id] = {
			name: file,
			type: "",
			content: content,
			status: status
		};
		BOARDFUL.CORE.File.name_list[file] = BOARDFUL.CORE.File.next_id;
		++ BOARDFUL.CORE.File.next_id;
	}
	else {
		BOARDFUL.CORE.File.list[BOARDFUL.CORE.File.name_list[file]] = {
			name: file,
			content: content,
			status: status
		};
	}
};
// get file list in current html
BOARDFUL.CORE.File.getFromHtml = function () {
	$("script").each(function () {
		BOARDFUL.CORE.File.add($(this).attr("src"), $(this), "loaded");
	});
	BOARDFUL.CORE.File.logger.log('info', "files in html", BOARDFUL.CORE.File.name_list);
};
// set file script to MODS scope
BOARDFUL.CORE.File.setToMods = function (file) {
	var script = BOARDFUL.CORE.File.list[BOARDFUL.CORE.File.name_list[file]].content;
	for (var i in script) {
		BOARDFUL.MODS[i] = script[i];
	}
};

// file loader
BOARDFUL.CORE.FileLoader = function (list, callback) {
	this.list = list;
	this.callback = callback;
	this.done = false;
	this.load();
};
// load files and wait
BOARDFUL.CORE.FileLoader.prototype.load = function () {
	this.done = true;
	for (var i in this.list) {
		if (! (this.list[i] in BOARDFUL.CORE.File.name_list) || "loaded" != BOARDFUL.CORE.File.list[BOARDFUL.CORE.File.name_list[this.list[i]]].status) {
			this.done = false;
			this.loadFile(this.list[i]);
			BOARDFUL.CORE.File.logger.log("info", "loading", this.list[i]);
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
BOARDFUL.CORE.FileLoader.prototype.loadFile = function (file) {
	switch (BOARDFUL.CORE.Envi.type) {
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
BOARDFUL.CORE.FileLoader.prototype.loadByRequire = function (file) {
	try {
		var script = require("../" + file);
		BOARDFUL.CORE.File.add(file, script, "loaded");
		BOARDFUL.CORE.File.logger.log("info", "file loaded", file);
	} catch (err) {
		BOARDFUL.CORE.File.add(file, "", "failed");
		BOARDFUL.CORE.File.logger.log("info", "file failed", file, err);
	}
};
// load a file via ajax by browser
BOARDFUL.CORE.FileLoader.prototype.loadByAjax = function (file) {
	var true_file = "../" + file;
	if (".js" == file.substr(file.length - 3)) {
		// load a js script
		$.getScript(true_file)
			.done(function( script, textStatus ) {
				BOARDFUL.CORE.File.add(file, script, "loaded");
				BOARDFUL.CORE.File.logger.log("info", "js loaded", file);
			})
			.fail(function( jqxhr, settings, exception ) {
				BOARDFUL.CORE.File.add(file, "", "failed");
				BOARDFUL.CORE.File.logger.log("info", "js failed", file);
			});
	}
	else if (".css" == file.substr(file.length - 4)) {
		// load a css
		$('head').append( $('<link rel="stylesheet" type="text/css" />').attr('href', true_file) );
		BOARDFUL.CORE.File.add(file, "", "loaded");
		BOARDFUL.CORE.File.logger.log("info", "css loaded", file);
	}
	else if (".json" == file.substr(file.length - 5)) {
		$.getJSON(true_file, function(data, textStatus, jqXHR) {
			BOARDFUL.CORE.File.add(file, data, "loaded");
			BOARDFUL.CORE.File.logger.log("info", "json loaded", file);
		})
		.fail(function (jqXHR, textStatus, errorThrown) {
			BOARDFUL.CORE.File.add(file, "", "failed");
			BOARDFUL.CORE.File.logger.log("info", "json failed", file);
		})
		.always(function(data, textStatus, jqXHR) {
		});
	}
	else {
		BOARDFUL.CORE.File.add(file, "", "loaded");
		BOARDFUL.CORE.File.logger.log("info", "file unknown", file);
	}
};

/**
 * Game.
 *
 * @author		Fei Zhan
 * @version		0.0
**/

var BOARDFUL = BOARDFUL || new Object();
BOARDFUL.CORE = BOARDFUL.CORE || new Object();

// game
BOARDFUL.CORE.Game = function (owner) {
	this.type = "Game";
	this.owner = owner;
	BOARDFUL.Mngr.add(this);
	this.event_mngr = new BOARDFUL.CORE.EventMngr(this.id);
	this.ui = undefined;
	this.status = "init";
	// create from room config
	var room = BOARDFUL.Mngr.get(this.owner);
	this.mod_list = new Array();
	// load mods
	if (room.mod_list) {
		for (var i in room.mod_list) {
			if (room.mod_list[i] in BOARDFUL.MODS) {
				this.mod_list.push(new BOARDFUL.MODS[room.mod_list[i]](this.id).id);
			}
		}
	}
	this.table = new BOARDFUL.CORE.Table(this.id).id;
	this.deck_list = new Object();
	// create decks
	if (room.config.decks) {
		for (var i in room.config.decks) {
			this.deck_list[room.config.decks[i]] = new BOARDFUL.CORE.Deck(this.id).id;
		}
	}
	this.player_list = new Array();
	// create players
	for (var i in room.player_list) {
		var player = new BOARDFUL.CORE.Player(room.player_list[i], this.id);
		this.player_list.push(player.id);
	}
	this.current_player = -1;
	this.addListeners();
};
// add event listeners
BOARDFUL.CORE.Game.prototype.addListeners = function () {
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
BOARDFUL.CORE.Game.prototype.run = function () {
	this.status = "run";
	// create first event
	var event = new BOARDFUL.CORE.Event({
		name: "StartGame",
		source: this.id
	});
	this.event_mngr.add(event.id);
	this.event_mngr.run();
};
// pause game
BOARDFUL.CORE.Game.prototype.pause = function () {
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
BOARDFUL.CORE.Game.prototype.resume = function () {
	switch (this.status) {
	case "init":
	case "exit":
		break;
	case "pause":
		this.status = "run";
		var event = new BOARDFUL.CORE.Event({
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
BOARDFUL.CORE.Game.prototype.start = function (arg) {
	this.round = 0;
	var event_list = new Array();
	var event = new BOARDFUL.CORE.Event({
		name: "ShufflePlayers",
		source: this.id
	});
	event_list.push(event.id);
	event = new BOARDFUL.CORE.Event({
		name: "CreateDeck",
		source: this.id,
		deck: this.deck_list.draw,
		type: "poker"
	});
	event_list.push(event.id);
	event = new BOARDFUL.CORE.Event({
		name: "ShuffleDeck",
		source: this.id,
		deck: this.deck_list.draw
	});
	event_list.push(event.id);
	var init_cards = 0;
	// get number of init cards from room config
	if (BOARDFUL.Mngr.get(this.owner).config.cards) {
		init_cards = parseInt(BOARDFUL.Mngr.get(this.owner).config.cards.init);
	}
	for (var i in this.player_list) {
		var event = new BOARDFUL.CORE.Event({
			name: "DealCards",
			source: this.id,
			deck: this.deck_list.draw,
			player: this.player_list[i],
			number: init_cards
		});
		event_list.push(event.id);
	}
	event = new BOARDFUL.CORE.Event({
		name: "StartRound",
		source: this.id,
		number: this.round + 1
	});
	event_list.push(event.id);
	this.event_mngr.front(event_list);
};
// shuffle players
BOARDFUL.CORE.Game.prototype.shufflePlayers = function (arg) {
	this.player_list = BOARDFUL.CORE.shuffle(this.player_list);
	var event_list = new Array();
	var event = new BOARDFUL.CORE.Event({
		name: "ShufflePlayersUi",
		source: this.id,
		players: this.player_list
	});
	event_list.push(event.id);
	this.event_mngr.front(event_list);
};
// start a round
BOARDFUL.CORE.Game.prototype.startRound = function (arg) {
	++ this.round;
	var event_list = new Array();
	var event;
	for (var i in this.player_list) {
		event = new BOARDFUL.CORE.Event({
			name: "StartPlayer" + this.player_list[i],
			source: this.id,
			player: this.player_list[i]
		});
		event_list.push(event.id);
		event = new BOARDFUL.CORE.Event({
			name: "StartPlayer",
			source: this.id,
			player: this.player_list[i]
		});
		event_list.push(event.id);
		var cards = 0;
		// get number of cards for each round from room config
		if (BOARDFUL.Mngr.get(this.owner).config.cards) {
			cards = parseInt(BOARDFUL.Mngr.get(this.owner).config.cards.round);
		}
		event = new BOARDFUL.CORE.Event({
			name: "DealCards",
			source: this.id,
			deck: this.deck_list.draw,
			player: this.player_list[i],
			number: cards
		});
		event_list.push(event.id);
		event = new BOARDFUL.CORE.Event({
			name: "PlayerAct",
			source: this.id,
			player: this.player_list[i]
		});
		event_list.push(event.id);
		event = new BOARDFUL.CORE.Event({
			name: "PlayerEnd",
			source: this.id
		});
		event_list.push(event.id);
	}
	event = new BOARDFUL.CORE.Event({
		name: "EndRound",
		source: this.id
	});
	event_list.push(event.id);
	this.event_mngr.front(event_list);
};
// end a round
BOARDFUL.CORE.Game.prototype.endRound = function (arg) {
	var event = new BOARDFUL.CORE.Event({
		name: "StartRound",
		source: this.id,
		number: this.round + 1
	});
	this.event_mngr.add(event.id);
};
/**
 * Logger.
 *
 * @author		Fei Zhan
 * @version		0.0
 * 
**/

var BOARDFUL = BOARDFUL || new Object();
BOARDFUL.CORE = BOARDFUL.CORE || new Object();
var winston = {
	transports: {
		File: undefined,
		Console: undefined
	}
};

// logger
BOARDFUL.CORE.Logger = function () {
	var logger;
	switch (BOARDFUL.CORE.Envi.type) {
	case "nodejs":
		winston = require('winston');
		logger = new (BOARDFUL.CORE.WinstonLogger) ({
			transports: [
				new (winston.transports.Console)()
			]
		});
		break;
	case "browser":
		logger = new BOARDFUL.CORE.DefaultLogger();
		break;
	default:
		logger = new BOARDFUL.CORE.DefaultLogger();
		break;
	}
	return logger;
};

// default logger
BOARDFUL.CORE.DefaultLogger = function () {
	//return console;
};
BOARDFUL.CORE.DefaultLogger.prototype.log = function () {
	//console.log.apply(console, arguments);
	return this;
};
BOARDFUL.CORE.DefaultLogger.prototype.add = function () {
	return this;
};
BOARDFUL.CORE.DefaultLogger.prototype.remove = function () {
	return this;
};

// winston logger for nodejs
BOARDFUL.CORE.WinstonLogger = function (config) {
	this.winston = new (winston.Logger) (config);
	this.winston.log_base = this.winston.log;
	// new log function
	this.winston.log = function () {
		if ("nodejs" == BOARDFUL.CORE.Envi.type) {
			for (var i in arguments) {
				// convert to string
				if ("array" == typeof arguments[i] || "object" == typeof arguments[i] || "function" == typeof arguments[i]) {
					arguments[i] = BOARDFUL.CORE.toString(arguments[i]);
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
BOARDFUL.CORE = BOARDFUL.CORE || new Object();

// object manager
BOARDFUL.CORE.Manager = function () {
	this.logger = new BOARDFUL.CORE.Logger();
	this.logger.add(winston.transports.File, {
		filename: 'logs/mngr.log'
	})
	.remove(winston.transports.Console);
	this.logger.log('info', "----------launch----------");
	this.next_id = 0;
	this.list = new Object();
};
// get object by id
BOARDFUL.CORE.Manager.prototype.get = function (id) {
	return this.list[id];
};
// add object
BOARDFUL.CORE.Manager.prototype.add = function (object) {
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
BOARDFUL.CORE = BOARDFUL.CORE || new Object();

// player
BOARDFUL.CORE.Player = function (config, owner) {
	this.type = "Player";
	this.owner = owner;
	this.game = BOARDFUL.Mngr.get(this.owner);
	this.hand = new Array();
	this.turn = undefined;
	this.name;
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
	this.addListeners();
};
// add event listeners
BOARDFUL.CORE.Player.prototype.addListeners = function () {
	var that = this;
	this.game.event_mngr.on("StartPlayer" + this.id, {
		level: "game",
		callback: function (arg) {
			that.start(arg);
		},
		id: that.id
	});
	this.game.event_mngr.on("Player" + this.id + "PlayCard", {
		level: "game",
		callback: function (arg) {
			that.playCard(arg);
		},
		id: that.id
	});
};
// player start
BOARDFUL.CORE.Player.prototype.start = function (arg) {
	BOARDFUL.Mngr.get(this.owner).current_player = this.id;
};
// play card
BOARDFUL.CORE.Player.prototype.playCard = function (arg) {
	if ("ai" == this.name) {
		var event = new BOARDFUL.CORE.Event({
			name: "PlayCardAi",
			source: this.id,
			source_event: arg.source_event,
			player: this.id
		});
		this.game.event_mngr.front(event.id);
	} else {
		if (0 == this.hand.length) {
			return;
		}
		var card = this.hand[Math.floor((Math.random() * this.hand.length))];
		var event = new BOARDFUL.CORE.Event({
			name: "PlaceCardOnTable",
			source: this.id,
			source_event: arg.source_event,
			player: this.id,
			card: card
		});
		this.game.event_mngr.front(event.id);
	}
};
/**
 * Room.
 *
 * @author		Fei Zhan
 * @version		0.0
**/

var BOARDFUL = BOARDFUL || new Object();
BOARDFUL.CORE = BOARDFUL.CORE || new Object();

// room
BOARDFUL.CORE.Room = function (config, owner) {
	this.type = "Room";
	this.owner = owner;
	BOARDFUL.Mngr.add(this);
	this.config = config;
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
BOARDFUL.CORE = BOARDFUL.CORE || new Object();

// table
BOARDFUL.CORE.Table = function (owner) {
	this.type = "Table";
	this.owner = owner;
	BOARDFUL.Mngr.add(this);
	this.arg_list = new Array();
	this.addListeners();
};
// get cards by source event
BOARDFUL.CORE.Table.prototype.getCardsBySource = function (event) {
	var select_list = new Array();
	for (var i in this.arg_list) {
		if (event == this.arg_list[i].source_event) {
			// deep copy
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
BOARDFUL.CORE.Table.prototype.addListeners = function () {
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
BOARDFUL.CORE.Table.prototype.placeCardOnTable = function (arg) {
	var index = BOARDFUL.Mngr.get(arg.player).hand.indexOf(arg.card);
	BOARDFUL.Mngr.get(arg.player).hand.splice(index, 1);
	BOARDFUL.Mngr.get(arg.card).owner = this.id;
	this.arg_list.push(arg);
};
/**
 * Utility methods.
 *
 * @author		Fei Zhan
 * @version		0.0
**/

var BOARDFUL = BOARDFUL || new Object();
BOARDFUL.CORE = BOARDFUL.CORE || new Object();

// get function from string, with or without scopes
BOARDFUL.CORE.getFunctionFromString = function (string) {
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
BOARDFUL.CORE.toString = function (value) {
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
BOARDFUL.CORE.Envi = new Object();
BOARDFUL.CORE.checkEnvi = function () {
	if (typeof module !== 'undefined' && module.exports) {
		BOARDFUL.CORE.Envi.type = "nodejs";
	} else {
		BOARDFUL.CORE.Envi.type = "browser";
		BOARDFUL.CORE.Envi.isOpera = !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
		// Opera 8.0+ (UA detection to detect Blink/v8-powered Opera)
		BOARDFUL.CORE.Envi.isFirefox = typeof InstallTrigger !== 'undefined';   // Firefox 1.0+
		BOARDFUL.CORE.Envi.isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0;
		// At least Safari 3+: "[object HTMLElementConstructor]"
		BOARDFUL.CORE.Envi.isChrome = !!window.chrome && !BOARDFUL.CORE.Envi.isOpera;              // Chrome 1+
		BOARDFUL.CORE.Envi.isIE = /*@cc_on!@*/false || !!document.documentMode; // At least IE6
	}
};

// parse url parameters
BOARDFUL.CORE.parseUrlParam = function (query) {
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
BOARDFUL.CORE.parseUrl = function () {
	var param = BOARDFUL.CORE.parseUrlParam(window.location.search.substring(1));
	param["#"] = window.location.hash.substring(1);
	var param1 = BOARDFUL.CORE.parseUrlParam(window.location.hash.substring(1));
	for (var index in param1) {
		if (! (index in param)) {
			param[index] = param1[index];
		}
	}
	return param;
};

// shuffle
BOARDFUL.CORE.shuffle = function (o) {
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
BOARDFUL.DESKTOP = BOARDFUL.DESKTOP || new Object();

// command line
BOARDFUL.DESKTOP.Cmdline = function (owner) {
	this.type = "Cmdline";
	this.owner = owner;
	if (this.owner) {
		BOARDFUL.Mngr.add(this);
		BOARDFUL.CORE.Command.owner = this.owner;
	}
	this.wait_status = "init";
	this.wait_result = "";
	this.addListeners();
	var that = this;
	// set keypress
	if (this.owner) {
		keypress(process.stdin);
		process.stdin.on('keypress', function () {
			that.keypress.apply(that, arguments);
		});
		process.stdin.setRawMode(true);
	}
};
// add listeners
BOARDFUL.DESKTOP.Cmdline.prototype.addListeners = function () {
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
	BOARDFUL.Mngr.get(this.owner).event_mngr.on("SettlePlayersDuelUi", {
		level: "game",
		callback: function (arg) {
			that.settlePlayersDuelUi(arg);
		},
		id: that.id
	});
};
// output
BOARDFUL.DESKTOP.Cmdline.prototype.output = function () {
	console.log.apply(console, arguments);
};
// input
BOARDFUL.DESKTOP.Cmdline.prototype.input = function (callback) {
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
BOARDFUL.DESKTOP.Cmdline.prototype.waitInput = function (check, callback) {
	var that = this;
	switch (that.wait_status) {
	case "init":
		that.wait_status = "wait";
		that.input(function (text) {
			text = text.trim();
			that.wait_result = text;
			that.wait_status = "get";
		});
		break;
	case "wait":
		break;
	case "get":
		if (! check(that.wait_result)) {
			that.wait_status = "init";
		} else {
			return callback(that.wait_result);
		}
		break;
	}
	setTimeout(function () {
		that.waitInput(check, callback);
	}, 100);
};
// wait keypress
BOARDFUL.DESKTOP.Cmdline.prototype.keypress = function (chunk, key) {
	if (key && key.ctrl && key.name == 'c') {
		process.exit();
	}
	if (key && "p" == key.name && "pause" != BOARDFUL.Mngr.get(this.owner).status) {
		var that = this;
		BOARDFUL.Mngr.get(that.owner).pause();
		that.waitInput(function (text) {
			BOARDFUL.CORE.Command.call(text);
			return "" == text;
		}, function (text) {
			BOARDFUL.Mngr.get(that.owner).resume();
		});
	}
};

// ui for resume game
BOARDFUL.DESKTOP.Cmdline.prototype.resumeGame = function (arg) {
	this.output("resume game");
};
// ui for start round
BOARDFUL.DESKTOP.Cmdline.prototype.startRound = function (arg) {
	this.output("round", arg.number);
};
// ui for player start
BOARDFUL.DESKTOP.Cmdline.prototype.startPlayer = function (arg) {
	this.output("start player", arg.player);
};
// ui for deal cards
BOARDFUL.DESKTOP.Cmdline.prototype.dealCardsUi = function (arg) {
	this.output("deal cards", arg.cards);
};
// ui for settle players duel
BOARDFUL.DESKTOP.Cmdline.prototype.settlePlayersDuelUi = function (arg) {
	var text = "";
	for (var i in arg.players) {
		text += arg.players[i] + " " + BOARDFUL.Mngr.get(arg.cards[i]).name + "\t";
	}
	text += "\nwinner " + arg.player;
	this.output("duel", text);
};

// config command line
BOARDFUL.DESKTOP.Cmdline.setCmdline = function () {
	process.stdin.setEncoding('utf8');
	process.stdin.resume();
};
// show menu
BOARDFUL.DESKTOP.Cmdline.loadMenu = function () {
	var that = this;
	if (BOARDFUL.BoardList.length > 0) {
		// board menu
		for (var i in BOARDFUL.BoardList) {
			var board = BOARDFUL.Mngr.get(BOARDFUL.BoardList[i]);
			console.log(i + ". " + board.config.name + "\t" + board.config.descrip);
		}
		console.log("select a board:");
		process.stdin.once('data', function (text) {
			BOARDFUL.Mngr.get(BOARDFUL.BoardList[parseInt(text)]).load(function (id) {
				var room = BOARDFUL.Mngr.get(id);
				// input config for room
				BOARDFUL.Cmdline.output("config room");
				var that = this;
				process.stdin.once('data', function (text) {
					BOARDFUL.Cmdline.output("config room done");
					// create game
					var game = new BOARDFUL.CORE.Game(id);
					// set a new cmdline as ui
					game.ui = new BOARDFUL.DESKTOP.Cmdline(game.id);
					BOARDFUL.Cmdline.output("game start");
					game.run();
				});
			});
		});
	}
	else {
		setTimeout(BOARDFUL.DESKTOP.Cmdline.loadMenu, 300);
	}
};

// launch project in desktop
BOARDFUL.init("desktop");
BOARDFUL.Cmdline = new BOARDFUL.DESKTOP.Cmdline();
BOARDFUL.DESKTOP.Cmdline.setCmdline();
BOARDFUL.DESKTOP.Cmdline.loadMenu();

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
BOARDFUL.SERVER = BOARDFUL.SERVER || new Object();

var http = require("http"),
	url = require("url"),
	path = require("path"),
	fs = require("fs");

// create a server
BOARDFUL.SERVER.loadServer = function () {
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
	}).listen(parseInt(BOARDFUL.SERVER.port, 10));
	console.log("Static file server running at => http://localhost:" + BOARDFUL.SERVER.port + "/ CTRL + C to shutdown");
};

// launch project
BOARDFUL.init("server");
BOARDFUL.SERVER.port = process.argv[3] || 8080;
BOARDFUL.SERVER.loadServer();

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
}

// poker
var Poker = function (owner) {
	this.type = "Poker";
	this.owner = owner;
	BOARDFUL.Mngr.add(this);
	this.card_list = this.createCards();
};
// if nodejs, export as module
if (typeof module !== 'undefined' && module.exports) {
	module.exports.Poker = Poker;
} else {
	BOARDFUL.MODS.Poker = Poker;
}
// add listeners
Poker.prototype.addListeners = function () {
	var that = this;
	BOARDFUL.Mngr.get(this.owner).event_mngr.on("StartGame", {
		level: "game",
		callback: function (arg) {
			that.startGame(arg);
		},
		id: that.id
	});
	BOARDFUL.Mngr.get(this.owner).event_mngr.on("CreateDeck", {
		level: "game",
		callback: function (arg) {
			that.createDeck(arg);
		},
		id: that.id
	});
	BOARDFUL.Mngr.get(this.owner).event_mngr.on("PlayerAct", {
		level: "game",
		callback: function (arg) {
			that.playerAct(arg);
		},
		id: that.id
	});
	BOARDFUL.Mngr.get(this.owner).event_mngr.on("Settle", {
		level: "game",
		callback: function (arg) {
			that.settle(arg);
		},
		id: that.id
	});
	BOARDFUL.Mngr.get(this.owner).event_mngr.on("PlayCardAi", {
		level: "game",
		callback: function (arg) {
			that.playCard(arg);
		},
		id: that.id
	});
};
// start game
Poker.prototype.startGame = function () {
};
// create deck
Poker.prototype.createDeck = function (arg) {
	BOARDFUL.Mngr.get(arg.deck).getCards(this.card_list);
};
// players duel
Poker.prototype.playerAct = function (arg) {
	var event_list = new Array();
	var event;
	for (var i in BOARDFUL.Mngr.get(this.owner).player_list) {
		// each player play one card
		event = new BOARDFUL.CORE.Event({
			name: "Player" + BOARDFUL.Mngr.get(this.owner).player_list[i] + "PlayCard",
			source: this.id,
			source_event: "PlayersDuel",
			player: BOARDFUL.Mngr.get(this.owner).player_list[i],
			number: 1
		});
		event_list.push(event.id);
	}
	// settle players duel
	event = new BOARDFUL.CORE.Event({
		name: "Settle",
		source: this.id,
		source_event: "PlayersDuel"
	});
	event_list.push(event.id);
	BOARDFUL.Mngr.get(this.owner).event_mngr.front(event_list);
};
// settle players duel
Poker.prototype.settle = function (arg) {
	var select_list = BOARDFUL.Mngr.get(BOARDFUL.Mngr.get(this.owner).table).getCardsBySource("PlayersDuel");
	var that = this;
	select_list.sort(function (a, b) {
		return BOARDFUL.MODS.Poker.compare(a.card, b.card);
	});
	var player_list = new Array();
	var card_list = new Array();
	for (var i in select_list) {
		player_list.push(select_list[i].player);
		card_list.push(select_list[i].card);
	}
	var winner = undefined;
	if (select_list.length > 0) {
		winner = select_list[select_list.length - 1].player;
	}
	// event for ui
	var event_list = new Array();
	var event = new BOARDFUL.CORE.Event({
		name: "SettlePlayersDuelUi",
		source: this.id,
		cards: card_list,
		players: player_list,
		player: winner
	});
	event_list.push(event.id);
	BOARDFUL.Mngr.get(this.owner).event_mngr.front(event_list);
};
// play card AI
Poker.prototype.playCard = function (arg) {
	var player = BOARDFUL.Mngr.get(arg.player);
	if (0 == player.hand.length) {
		return;
	}
	var card = player.hand[Math.floor((Math.random() * player.hand.length))];
	var event = new BOARDFUL.CORE.Event({
		name: "PlaceCardOnTable",
		source: arg.player,
		source_event: arg.source_event,
		player: arg.player,
		card: card
	});
	BOARDFUL.Mngr.get(this.owner).event_mngr.front(event.id);
};

// create cards
Poker.prototype.createCards = function () {
	var card_list = new Array();
	var card;
	for (var i in Poker.RANKS) {
		if ("Joker" == i) {
			card = new BOARDFUL.CORE.Card({
				rank: i,
				suit: "Spade"
			});
			card_list.push(card.id);
			card = new BOARDFUL.CORE.Card({
				rank: i,
				suit: "Heart"
			});
			card_list.push(card.id);
		}
		else {
			for (var j in Poker.SUITS) {
				card = new BOARDFUL.CORE.Card({
					rank: i,
					suit: j
				});
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
// compare two cards
Poker.compare = function (id0, id1) {
	var card0 = BOARDFUL.Mngr.get(id0);
	var card1 = BOARDFUL.Mngr.get(id1);
	if (card0.rank != card1.rank) {
		return Poker.RANKS[card0.rank] - Poker.RANKS[card1.rank];
	}
	else if (card0.suit != card1.suit) {
		return Poker.SUITS[card0.suit] - Poker.SUITS[card1.suit];
	}
	else {
		return 0;
	}
};