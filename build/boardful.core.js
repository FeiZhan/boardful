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
	this.ui = undefined;
	BOARDFUL.Mngr.add(this);
	this.config = config;
	this.room_list = new Array();
};
// load board game
BOARDFUL.CORE.Board.prototype.load = function (callback) {
	this.loadPackage([this.config.package], callback);
};
BOARDFUL.CORE.Board.prototype.loadPackage = function (packages, callback) {
	var that = this;
	var load = new BOARDFUL.CORE.FileLoader(packages, function () {
		var dependencies = new Array();
		var files = new Array();
		for (var i in packages) {
			if (".json" != packages[i].substr(packages[i].length - 5)) {
				continue;
			}
			var pack = BOARDFUL.CORE.File.list[BOARDFUL.CORE.File.name_list[packages[i]]].content;
			if ("files" in pack) {
				files = files.concat(pack.files);
			}
			if ("dependencies" in pack) {
				dependencies = dependencies.concat(pack.dependencies);
			}
		}
		var callback1 = function () {
			var load1 = new BOARDFUL.CORE.FileLoader(files, function () {
				for (var i in files) {
					if (".js" == files[i].substr(files[i].length - 3)) {
						BOARDFUL.CORE.File.setToMods(files[i]);
					}
				}
				BOARDFUL.Logger.log("info", "load board", that.name);
				that.createRoom(BOARDFUL.CORE.File.list[BOARDFUL.CORE.File.name_list[that.config.package]].content, callback);
			});
		};
		if (dependencies.length > 0) {
			that.loadPackage(dependencies, callback1);
		} else {
			callback1();
		}
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
	var BOARD_LIST_FILE = "mods/boardlist.json";
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
	this.game = BOARDFUL.Mngr.get(this.owner).game;
	this.ui = undefined;
	BOARDFUL.Mngr.add(this);
	this.card_list = new Array();
	this.addListeners();
};
// get cards
BOARDFUL.CORE.Deck.prototype.getCards = function (card_list) {
	for (var i in card_list) {
		BOARDFUL.Mngr.get(card_list[i]).owner = this.id;
	}
	this.card_list = this.card_list.concat(card_list);
};

// add listeners
BOARDFUL.CORE.Deck.prototype.addListeners = function () {
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
	BOARDFUL.Mngr.get(this.game).event_mngr.front(event_list);
};
// deal cards
BOARDFUL.CORE.Deck.prototype.dealCards = function (arg) {
	// not me
	if (arg.deck != this.id) {
		return;
	}
	var event_list = new Array();
	var event;
	if (arg.number > this.card_list.length) {
		event = new BOARDFUL.CORE.Event({
			name: "ReorderDeck",
			source: this.id,
			deck: this.id
		});
		event_list.push(event.id);
	}
	var arg1 = arg;
	arg1.name = "DealCard";
	for (var i = 0; i < arg.number; ++ i) {
		event = new BOARDFUL.CORE.Event(arg1);
		event_list.push(event.id);
	}
	BOARDFUL.Mngr.get(this.game).event_mngr.front(event_list);
};
// deal one card
BOARDFUL.CORE.Deck.prototype.dealCard = function (arg) {
	// not me
	if (arg.deck != this.id) {
		return;
	}
	var card = this.card_list[0];
	this.card_list.shift();
	BOARDFUL.Mngr.get(BOARDFUL.Mngr.get(arg.player).hand).getCards([card]);
	// create event for ui
	var event_list = new Array();
	var event = new BOARDFUL.CORE.Event({
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
	this.timeout = 20;
	this.logger = new BOARDFUL.CORE.Logger();
	this.logger.add(winston.transports.File, {
		filename: 'logs/event.log'
	})
	.remove(winston.transports.Console);
	this.logger.log('info', "----------launch----------");
	this.name_logger = new BOARDFUL.CORE.Logger();
	this.name_logger.add(winston.transports.File, {
		filename: 'logs/event_name.log'
	})
	.remove(winston.transports.Console);
	this.name_logger.log('info', "----------launch----------");
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
BOARDFUL.CORE.EventMngr.prototype.add = function (id) {
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
	case "userinput":
	case "uieffect":
		break;
	case "run":
	default:
		if (this.list.length > 0) {
			// get the current event
			this.current = this.front();
			this.logger.log("info", "event", this.current.name);
			this.name_logger.log("info", "event", this.current.name);
			this.list.shift();
			if (this.current && (this.current.name in this.listener_list)) {
				for (var i in BOARDFUL.CORE.EVENT_LEVELS) {
					if (BOARDFUL.CORE.EVENT_LEVELS[i] in this.listener_list[this.current.name]) {
						for (var j in this.listener_list[this.current.name][BOARDFUL.CORE.EVENT_LEVELS[i]]) {
							var listener = this.listener_list[this.current.name][BOARDFUL.CORE.EVENT_LEVELS[i]][j];
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
	if (("array" == typeof script || "object" == typeof script || "function" == typeof script) && "name" in script) {
		BOARDFUL.MODS[script.name] = script;
	} else {
		for (var i in script) {
			BOARDFUL.MODS[i] = script[i];
		}
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
	this.game = this.id;
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
				var mod = BOARDFUL.MODS[room.mod_list[i]].register(this.id);
				this.mod_list.push(mod);
			}
		}
	}
	this.table = new BOARDFUL.CORE.Table(this.id).id;
	this.deck_list = new Object();
	// create decks
	if (room.config.decks) {
		for (var i in room.config.decks) {
			this.deck_list[room.config.decks[i]] = new BOARDFUL.CORE.Deck(this.id).id;
			this.deck_list[room.config.decks[i]].name = this.name + "_" + room.config.decks[i];
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
	if (BOARDFUL.Mngr.get(this.owner).config.cards && BOARDFUL.Mngr.get(this.owner).config.cards.init) {
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
		var cards = 0;
		// get number of cards for each round from room config
		if (BOARDFUL.Mngr.get(this.owner).config.cards && BOARDFUL.Mngr.get(this.owner).config.cards.round) {
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
	}
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
		// get number of cards for each turn from room config
		if (BOARDFUL.Mngr.get(this.owner).config.cards && BOARDFUL.Mngr.get(this.owner).config.cards.turn) {
			cards = parseInt(BOARDFUL.Mngr.get(this.owner).config.cards.turn);
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
	event = new BOARDFUL.CORE.Event({
		name: "StartRound",
		source: this.id,
		number: this.round + 1
	});
	event_list.push(event.id);
	this.event_mngr.front(event_list);
};
// end a round
BOARDFUL.CORE.Game.prototype.endRound = function (arg) {
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
		File: "File",
		Console: "Console"
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
	this.enable = true;
	//return console;
};
BOARDFUL.CORE.DefaultLogger.prototype.log = function () {
	if (this.enable) {
		console.log.apply(console, arguments);
	}
	return this;
};
BOARDFUL.CORE.DefaultLogger.prototype.add = function (type) {
	if ("Console" == type) {
		this.enable = true;
	}
	return this;
};
BOARDFUL.CORE.DefaultLogger.prototype.remove = function (type) {
	if ("Console" == type) {
		this.enable = false;
	}
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
	var hand_deck = new BOARDFUL.CORE.Deck(this.id);
	hand_deck.name = this.name + "_" + "hand";
	this.hand = hand_deck.id;
	this.addListeners();
};
// add event listeners
BOARDFUL.CORE.Player.prototype.addListeners = function () {
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
BOARDFUL.CORE.Player.prototype.start = function (arg) {
	BOARDFUL.Mngr.get(this.owner).current_player = this.id;
};
// play card
BOARDFUL.CORE.Player.prototype.playCard = function (arg) {
	if ("ai" == this.name) {
		var event = new BOARDFUL.CORE.Event(arg);
		event.name = "PlayCardAi";
		BOARDFUL.Mngr.get(this.owner).event_mngr.front(event.id);
	} else {
		var event = new BOARDFUL.CORE.Event(arg);
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
BOARDFUL.CORE = BOARDFUL.CORE || new Object();

// room
BOARDFUL.CORE.Room = function (config, owner) {
	this.type = "Room";
	this.owner = owner;
	this.ui = undefined;
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
	this.game = BOARDFUL.Mngr.get(this.owner).game;
	this.ui = undefined;
	BOARDFUL.Mngr.add(this);
	this.arg_list = new Array();
	this.addListeners();
};
// get cards by source event
BOARDFUL.CORE.Table.prototype.getCardsBySource = function (event) {
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