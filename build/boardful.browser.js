/**
 * Define the BOARDFUL namespace.
 *
 * @author		Fei Zhan
 * @version		0.0
 * 
**/

// namespace
var BOARDFUL = BOARDFUL || new Object();

// run
BOARDFUL.run = function (config) {
	BOARDFUL.init();
	BOARDFUL.Mngr = new BOARDFUL.ENGINE.Manager();
	BOARDFUL.Logger.log('info', "start type", config);
	switch (config) {
	case "server":
		BOARDFUL.SERVER.port = process.argv[3] || 8080;
		BOARDFUL.SERVER.createServer();
		break;
	case "browser":
		BOARDFUL.MENUS.run();
		break;
	case "desktop":
	default:
		global.jquery = require('jquery');
		global.$ = jquery.create();
		BOARDFUL.DESKTOP.menuRun();
		break;
	}
};
// init
BOARDFUL.init = function () {
	BOARDFUL.ENGINE.checkEnvi();
	// create logger
	BOARDFUL.Logger = new BOARDFUL.ENGINE.Logger();
	BOARDFUL.Logger.add(winston.transports.File, {
		//filename: 'logs/boardful_' + new Date().toString() + '.log'
		filename: 'logs/boardful.log'
	})
	.remove(winston.transports.Console);
	BOARDFUL.Debugger = new BOARDFUL.ENGINE.Logger();
	BOARDFUL.Debugger.add(winston.transports.File, {
		filename: 'logs/debug.log'
	})
	.remove(winston.transports.Console);

	BOARDFUL.Logger.log('info', "environment", BOARDFUL.ENGINE.Envi);
	BOARDFUL.Debugger.log('info', "start");
	BOARDFUL.ENGINE.initFileMngr();
	if ("browser" == BOARDFUL.ENGINE.Envi.type) {
		BOARDFUL.urlparam = BOARDFUL.ENGINE.parseUrl();
		BOARDFUL.Logger.log('info', "url param", BOARDFUL.urlparam);
		BOARDFUL.ENGINE.getFilesInHtml();
	}
};

/**
 * Card.
 *
 * @author		Fei Zhan
 * @version		0.0
 * 
**/

var BOARDFUL = BOARDFUL || new Object();
BOARDFUL.ENGINE = BOARDFUL.ENGINE || new Object();

// card
BOARDFUL.ENGINE.Card = function (config) {
	this.type = "Card";
	this.rank = config.rank;
	this.suit = config.suit;
	this.color = config.color;
	this.name = "card_" + this.rank + "_" + this.suit;
	this.owner = undefined;
	BOARDFUL.Mngr.add(this);
};
// load cards
BOARDFUL.ENGINE.Card.load = function (config) {
	var card_list = new Array();
	switch (config) {
	case "poker":
		card_list = new BOARDFUL.BOARDS.Poker().card_list;
		break;
	default:
		break;
	}
	return card_list;
};

/**
 * Deck.
 *
 * @author		Fei Zhan
 * @version		0.0
 * 
**/

var BOARDFUL = BOARDFUL || new Object();
BOARDFUL.ENGINE = BOARDFUL.ENGINE || new Object();

// deck
BOARDFUL.ENGINE.Deck = function (owner) {
	this.type = "Deck";
	this.card_list = new Array();
	this.owner = owner;
	BOARDFUL.Mngr.add(this);
	this.addListeners();
};
// add listeners
BOARDFUL.ENGINE.Deck.prototype.addListeners = function () {
	var that = this;
	BOARDFUL.Mngr.get(this.owner).event_mngr.on("CreateDeck", {
		level: "game",
		callback: function (arg) {
			that.createDeck(arg);
		},
		id: that.id
	});
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
// create deck
BOARDFUL.ENGINE.Deck.prototype.createDeck = function (arg) {
	var card_list = BOARDFUL.ENGINE.Card.load(arg.type);
	BOARDFUL.Mngr.get(arg.deck).getCards(card_list);
};
// shuffle deck
BOARDFUL.ENGINE.Deck.prototype.shuffleDeck = function (arg) {
	if (arg.deck != this.id) {
		return;
	}
	this.card_list = BOARDFUL.ENGINE.shuffle(this.card_list);
};
// get cards
BOARDFUL.ENGINE.Deck.prototype.getCards = function (card_list) {
	for (var i in card_list) {
		BOARDFUL.Mngr.get(card_list[i]).owner = this.id;
	}
	this.card_list = this.card_list.concat(card_list);
};
// deal cards
BOARDFUL.ENGINE.Deck.prototype.dealCards = function (arg) {
	if (arg.deck != this.id) {
		return;
	}
	var card_list = new Array();
	for (var i = 0; i < arg.number; ++ i) {
		card_list.push(this.card_list[0]);
		this.card_list.shift();
	}
	console.log("deal cards", card_list);
	BOARDFUL.Mngr.get(arg.player).hand = BOARDFUL.Mngr.get(arg.player).hand.concat(card_list);
};

/**
 * Event.
 *
 * @author  Fei Zhan
 * @version 0.0
**/

var BOARDFUL = BOARDFUL || new Object();
BOARDFUL.ENGINE = BOARDFUL.ENGINE || new Object();

// event
BOARDFUL.ENGINE.Event = function (arg) {
	this.type = "Event";
	this.owner = undefined;
	BOARDFUL.Mngr.add(this);
	this.name = arg.name;
	this.arg = arg;
	this.arg.creation_time = new Date();
};

// event level precedence
BOARDFUL.ENGINE.EVENT_LEVELS = ["top", "system", "server", "board", "room", "game", "extension", "player", "card", "rear"];
// event manager
BOARDFUL.ENGINE.EventMngr = function (owner) {
	this.type = "EventMngr";
	this.owner = owner;
	BOARDFUL.Mngr.add(this);
	this.list = new Array();
	this.listener_list = new Object();
	this.timeout = 100;
	this.logger = new BOARDFUL.ENGINE.Logger();
	this.logger.add(winston.transports.File, {
		filename: 'logs/event.log'
	})
	.remove(winston.transports.Console);
};
// see or push to the front of event list
BOARDFUL.ENGINE.EventMngr.prototype.front = function (id) {
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
BOARDFUL.ENGINE.EventMngr.prototype.add = function (id) {
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
BOARDFUL.ENGINE.EventMngr.prototype.on = function (event, config) {
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
BOARDFUL.ENGINE.EventMngr.prototype.off = function (event, config) {
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
BOARDFUL.ENGINE.EventMngr.prototype.run = function () {
	if (this.list.length > 0) {
		// get the current event
		var event = this.front();
		this.logger.log("info", "event", event.name);
		this.list.shift();
		if (event && (event.name in this.listener_list)) {
			for (var i in BOARDFUL.ENGINE.EVENT_LEVELS) {
				if (BOARDFUL.ENGINE.EVENT_LEVELS[i] in this.listener_list[event.name]) {
					for (var j in this.listener_list[event.name][BOARDFUL.ENGINE.EVENT_LEVELS[i]]) {
						var listener = this.listener_list[event.name][BOARDFUL.ENGINE.EVENT_LEVELS[i]][j];
						this.logger.log("info", "trigger", listener);
						// trigger listener callback for event
						listener.callback(event.arg);
					}
				}
			}
		}
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
*/

var BOARDFUL = BOARDFUL || new Object();
BOARDFUL.ENGINE = BOARDFUL.ENGINE || new Object();

// init file manager
BOARDFUL.ENGINE.initFileMngr = function () {
	// file mngr logger
	BOARDFUL.ENGINE.FileLogger = new BOARDFUL.ENGINE.Logger();
	BOARDFUL.ENGINE.FileLogger.add(winston.transports.File, {
		filename: 'logs/file.log'
	})
	.remove(winston.transports.Console);
};

// file list
BOARDFUL.ENGINE.FileList = new Object();
// file list by name
BOARDFUL.ENGINE.FileNameList = new Object();
BOARDFUL.ENGINE.NextFileId = 0;
// add to file list
BOARDFUL.ENGINE.addToFileList = function (file, content, status) {
	// new file
	if (! (file in BOARDFUL.ENGINE.FileNameList)) {
		BOARDFUL.ENGINE.FileList[BOARDFUL.ENGINE.NextFileId] = {
			name: file,
			type: "",
			content: content,
			status: status
		};
		BOARDFUL.ENGINE.FileNameList[file] = BOARDFUL.ENGINE.NextFileId;
		++ BOARDFUL.ENGINE.NextFileId;
	}
	else {
		BOARDFUL.ENGINE.FileList[BOARDFUL.ENGINE.FileNameList[file]] = {
			name: file,
			content: content,
			status: status
		};
	}
};
// get file list in current html
BOARDFUL.ENGINE.getFilesInHtml = function () {
	$("script").each(function () {
		BOARDFUL.ENGINE.addToFileList($(this).attr("src"), $(this), "loaded");
	});
	BOARDFUL.ENGINE.FileLogger.log('info', "files in html", BOARDFUL.ENGINE.FileNameList);
};

// load a file
BOARDFUL.ENGINE.loadFile = function (file) {
	switch (BOARDFUL.ENGINE.Envi.type) {
	case "browser":
		BOARDFUL.ENGINE.loadFileAjax(file);
		break;
	case "nodejs":
		try {
			var script = require("../" + file);
			BOARDFUL.ENGINE.addToFileList(file, script, "loaded");
			BOARDFUL.ENGINE.FileLogger.log("info", "file loaded", file);
		} catch (err) {
			BOARDFUL.ENGINE.addToFileList(file, "", "failed");
			BOARDFUL.ENGINE.FileLogger.log("info", "file failed", file, err);
		}
		break;
	default:
		break;
	}
}
// load a file via ajax by browser
BOARDFUL.ENGINE.loadFileAjax = function (file) {
	if (".js" == file.substr(file.length - 3)) {
		// load a js script
		$.getScript(file)
			.done(function( script, textStatus ) {
				BOARDFUL.ENGINE.addToFileList(file, script, "loaded");
				BOARDFUL.ENGINE.FileLogger.log("info", "js loaded", file);
			})
			.fail(function( jqxhr, settings, exception ) {
				BOARDFUL.ENGINE.addToFileList(file, "", "failed");
				BOARDFUL.ENGINE.FileLogger.log("info", "js failed", file);
			});
	}
	else if (".css" == file.substr(file.length - 4)) {
		// load a css
		$('head').append( $('<link rel="stylesheet" type="text/css" />').attr('href', file) );
		BOARDFUL.ENGINE.addToFileList(file, "", "loaded");
		BOARDFUL.ENGINE.FileLogger.log("info", "css loaded");
		BOARDFUL.ENGINE.FileLogger.log("info", file);
	}
	else if (".json" == file.substr(file.length - 5)) {
		$.getJSON(file, function(data, textStatus, jqXHR) {
			BOARDFUL.ENGINE.addToFileList(file, data, "loaded");
			BOARDFUL.ENGINE.FileLogger.log("info", "json loaded", file);
		})
		.fail(function (jqXHR, textStatus, errorThrown) {
			BOARDFUL.ENGINE.addToFileList(file, "", "failed");
			BOARDFUL.ENGINE.FileLogger.log("info", "json failed", file);
		})
		.always(function(data, textStatus, jqXHR) {
		});
	}
	else {
		BOARDFUL.ENGINE.addToFileList(file, "", "failed");
		BOARDFUL.ENGINE.FileLogger.log("info", "file unknown", file);
	}
};

// file loader
BOARDFUL.ENGINE.FileLoader = function (list, callback) {
	this.list = list;
	this.callback = callback;
	this.done = false;
	this.load();
};
// load files and wait
BOARDFUL.ENGINE.FileLoader.prototype.load = function () {
	BOARDFUL.ENGINE.FileLogger.log("info", "loading", this.list);
	this.done = true;
	for (var i in this.list) {
		if (! (this.list[i] in BOARDFUL.ENGINE.FileNameList) || "loaded" != BOARDFUL.ENGINE.FileList[BOARDFUL.ENGINE.FileNameList[this.list[i]]].status) {
			this.done = false;
			BOARDFUL.ENGINE.loadFile(this.list[i]);
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

/**
 * Game.
 *
 * @author		Fei Zhan
 * @version		0.0
**/

var BOARDFUL = BOARDFUL || new Object();
BOARDFUL.ENGINE = BOARDFUL.ENGINE || new Object();

// game
BOARDFUL.ENGINE.Game = function (config) {
	this.type = "Game";
	this.owner = undefined;
	BOARDFUL.Mngr.add(this);
	this.event_mngr = new BOARDFUL.ENGINE.EventMngr();
	// create from room
	if (config instanceof BOARDFUL.ENGINE.Room) {
		this.config = config.config;
		this.options = config.options;
		this.deck_list = {
			draw: new BOARDFUL.ENGINE.Deck(this.id).id,
			discard: new BOARDFUL.ENGINE.Deck(this.id).id
		};
		this.table = new BOARDFUL.ENGINE.Table(this.id).id;
		
		this.player_list = new Array();
		this.current_player = -1;
		for (var i in config.player_list) {
			var player = new BOARDFUL.ENGINE.Player(config.player_list[i], this.id);
			this.player_list.push(player.id);
		}
	}
	this.addListeners();
};
// add event listeners
BOARDFUL.ENGINE.Game.prototype.addListeners = function () {
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
	this.event_mngr.on("StartPlayers", {
		level: "game",
		callback: function (arg) {
			that.startPlayers(arg);
		},
		id: that.id
	});
};
// launch game
BOARDFUL.ENGINE.Game.prototype.run = function () {
	// create first event
	var event = new BOARDFUL.ENGINE.Event({
		name: "StartGame",
		source: this.id
	});
	this.event_mngr.add(event.id);
	this.event_mngr.run();
};
// start game
BOARDFUL.ENGINE.Game.prototype.start = function (arg) {
	this.round = 0;
	var event_list = new Array();
	var event = new BOARDFUL.ENGINE.Event({
		name: "ShufflePlayers",
		source: this.id
	});
	event_list.push(event.id);
	var event = new BOARDFUL.ENGINE.Event({
		name: "CreateDeck",
		source: this.id,
		deck: this.deck_list.draw,
		type: "poker"
	});
	event_list.push(event.id);
	var event = new BOARDFUL.ENGINE.Event({
		name: "ShuffleDeck",
		source: this.id,
		deck: this.deck_list.draw
	});
	event_list.push(event.id);
	for (var i in this.player_list) {
		var event = new BOARDFUL.ENGINE.Event({
			name: "DealCards",
			source: this.id,
			deck: this.deck_list.draw,
			player: this.player_list[i],
			number: 5
		});
		event_list.push(event.id);
	}
	var event = new BOARDFUL.ENGINE.Event({
		name: "StartRound",
		source: this.id
	});
	event_list.push(event.id);
	this.event_mngr.front(event_list);
};
// shuffle players
BOARDFUL.ENGINE.Game.prototype.shufflePlayers = function (arg) {
	this.player_list = BOARDFUL.ENGINE.shuffle(this.player_list);
};
// start a round
BOARDFUL.ENGINE.Game.prototype.startRound = function (arg) {
	++ this.round;
	var event_list = new Array();
	var event;
	for (var i in this.player_list) {
		event = new BOARDFUL.ENGINE.Event({
			name: "StartPlayers",
			source: this.id
		});
		event_list.push(event.id);
		event = new BOARDFUL.ENGINE.Event({
			name: "StartPlayer" + this.player_list[i],
			source: this.id,
			player: this.player_list[i]
		});
		event_list.push(event.id);
		event = new BOARDFUL.ENGINE.Event({
			name: "DealCards",
			source: this.id,
			deck: this.deck_list.draw,
			player: this.player_list[i],
			number: 2
		});
		event_list.push(event.id);
		event = new BOARDFUL.ENGINE.Event({
			name: "PlayersDuel",
			source: this.id
		});
		event_list.push(event.id);
	}
	event = new BOARDFUL.ENGINE.Event({
		name: "EndRound",
		source: this.id
	});
	event_list.push(event.id);
	this.event_mngr.front(event_list);
};
// end a round
BOARDFUL.ENGINE.Game.prototype.endRound = function (arg) {
	var event = new BOARDFUL.ENGINE.Event({
		name: "StartRound",
		source: this.id
	});
	this.event_mngr.add(event.id);
};
// player start
BOARDFUL.ENGINE.Game.prototype.startPlayers = function (arg) {
	this.current_player = (this.current_player + 1) % this.player_list.length;
};

/**
 * Logger.
 *
 * @author		Fei Zhan
 * @version		0.0
 * 
*/

var BOARDFUL = BOARDFUL || new Object();
BOARDFUL.ENGINE = BOARDFUL.ENGINE || new Object();

// logger
BOARDFUL.ENGINE.Logger = function () {
	var logger;
	switch (BOARDFUL.ENGINE.Envi.type) {
	case "nodejs":
		global.winston = require('winston');
		logger = new (BOARDFUL.ENGINE.WinstonLogger) ({
			transports: [
				new (winston.transports.Console)()
			]
		});
		break;
	case "browser":
		logger = new BOARDFUL.ENGINE.DefaultLogger();
		break;
	default:
		logger = new BOARDFUL.ENGINE.DefaultLogger();
		break;
	}
	return logger;
};

// default logger
BOARDFUL.ENGINE.DefaultLogger = function () {
	return console;
};
BOARDFUL.ENGINE.DefaultLogger.prototype.add = function () {
	return this;
};
BOARDFUL.ENGINE.DefaultLogger.prototype.remove = function () {
	return this;
};

// winston logger for nodejs
BOARDFUL.ENGINE.WinstonLogger = function (config) {
	this.winston = new (winston.Logger) (config);
	this.winston.log_base = this.winston.log;
	// new log function
	this.winston.log = function () {
		if ("nodejs" == BOARDFUL.ENGINE.Envi.type) {
			for (var i in arguments) {
				// convert to string
				if ("array" == typeof arguments[i] || "object" == typeof arguments[i] || "function" == typeof arguments[i]) {
					arguments[i] = BOARDFUL.ENGINE.toString(arguments[i]);
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
 * @author  Fei Zhan
 * @version 0.0
**/

var BOARDFUL = BOARDFUL || new Object();
BOARDFUL.ENGINE = BOARDFUL.ENGINE || new Object();

// object manager
BOARDFUL.ENGINE.Manager = function () {
	this.logger = new BOARDFUL.ENGINE.Logger();
	this.logger.add(winston.transports.File, {
		filename: 'logs/mngr.log'
	})
	.remove(winston.transports.Console);
	this.next_id = 0;
	this.list = new Object();
};
// get object by id
BOARDFUL.ENGINE.Manager.prototype.get = function (id) {
	return this.list[id];
};
// add object
BOARDFUL.ENGINE.Manager.prototype.add = function (object) {
	object.id = this.next_id;
	if (! ("name" in object)) {
		object.name = object.constructor.name + "_" + object.id;
	}
	++ this.next_id;
	this.list[object.id] = object;
	this.logger.log("info", "add", object.name);
	return object.id;
};

/**
 * Player.
 *
 * @author		Fei Zhan
 * @version		0.0
**/

var BOARDFUL = BOARDFUL || new Object();
BOARDFUL.ENGINE = BOARDFUL.ENGINE || new Object();

// player
BOARDFUL.ENGINE.Player = function (config, owner) {
	this.type = "Player";
	this.owner = owner;
	this.game = BOARDFUL.Mngr.get(this.owner);
	this.hand = new Array();
	this.turn = undefined;
	this.name = undefined;
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
BOARDFUL.ENGINE.Player.prototype.addListeners = function () {
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
BOARDFUL.ENGINE.Player.prototype.start = function (arg) {
	console.log("player start", this.game.player_list[this.game.current_player]);
	var event = new BOARDFUL.ENGINE.Event({
		name: "PlayerEnd",
		source: this.id
	});
	this.game.event_mngr.front(event.id);
};
// play card
BOARDFUL.ENGINE.Player.prototype.playCard = function (arg) {
	if (0 == this.hand.length) {
		return;
	}
	var card = this.hand[Math.floor((Math.random() * this.hand.length))];
	var event = new BOARDFUL.ENGINE.Event({
		name: "PlaceCardOnTable",
		source: this.id,
		source_event: arg.source_event,
		player: this.id,
		card: card
	});
	this.game.event_mngr.front(event.id);
};

/**
 * Room.
 *
 * @author		Fei Zhan
 * @version		0.0
**/

var BOARDFUL = BOARDFUL || new Object();
BOARDFUL.ENGINE = BOARDFUL.ENGINE || new Object();

// room
BOARDFUL.ENGINE.Room = function (room) {
	this.type = "Room";
	this.owner = undefined;
	BOARDFUL.Mngr.add(this);
	this.config = room;
	this.options = room.options;
	this.player_list = room.player_list || ["me", "ai"];
};

/**
 * Table.
 *
 * @author		Fei Zhan
 * @version		0.0
**/

var BOARDFUL = BOARDFUL || new Object();
BOARDFUL.ENGINE = BOARDFUL.ENGINE || new Object();

// table
BOARDFUL.ENGINE.Table = function (owner) {
	this.type = "Table";
	this.owner = owner;
	BOARDFUL.Mngr.add(this);
	this.arg_list = new Array();
	this.addListeners();
};
// add listeners
BOARDFUL.ENGINE.Table.prototype.addListeners = function () {
	var that = this;
	BOARDFUL.Mngr.get(this.owner).event_mngr.on("PlayersDuel", {
		level: "game",
		callback: function (arg) {
			that.playersDuel(arg);
		},
		id: that.id
	});
	BOARDFUL.Mngr.get(this.owner).event_mngr.on("PlaceCardOnTable", {
		level: "game",
		callback: function (arg) {
			that.placeCardOnTable(arg);
		},
		id: that.id
	});
	BOARDFUL.Mngr.get(this.owner).event_mngr.on("SettlePlayersDuel", {
		level: "game",
		callback: function (arg) {
			that.settlePlayersDuel(arg);
		},
		id: that.id
	});
};
// players duel
BOARDFUL.ENGINE.Table.prototype.playersDuel = function (arg) {
	var event_list = new Array();
	var event;
	for (var i in BOARDFUL.Mngr.get(this.owner).player_list) {
		event = new BOARDFUL.ENGINE.Event({
			name: "Player" + BOARDFUL.Mngr.get(this.owner).player_list[i] + "PlayCard",
			source: this.id,
			source_event: "PlayersDuel",
			player: BOARDFUL.Mngr.get(this.owner).player_list[i],
			number: 1
		});
		event_list.push(event.id);
	}
	event = new BOARDFUL.ENGINE.Event({
		name: "SettlePlayersDuel",
		source: this.id,
		source_event: "PlayersDuel"
	});
	event_list.push(event.id);
	BOARDFUL.Mngr.get(this.owner).event_mngr.front(event_list);
};
// place card on table
BOARDFUL.ENGINE.Table.prototype.placeCardOnTable = function (arg) {
	var index = BOARDFUL.Mngr.get(arg.player).hand.indexOf(arg.card);
	BOARDFUL.Mngr.get(arg.player).hand.splice(index, 1);
	this.arg_list.push(arg);
};
// settle players duel
BOARDFUL.ENGINE.Table.prototype.settlePlayersDuel = function (arg) {
	var select_list = new Array();
	for (var i in this.arg_list) {
		if ("PlayersDuel" == this.arg_list[i].source_event) {
			select_list.push(i);
		}
	}
	var that = this;
	select_list.sort(function (a, b) {
		return BOARDFUL.BOARDS.Poker.compare(that.arg_list[a].card, that.arg_list[b].card);
	});
	for (var i in select_list) {
		console.log(this.arg_list[select_list[i]].player, BOARDFUL.BOARDS.Poker.cardToString(this.arg_list[select_list[i]].card));
	}
	if (select_list.length > 0) {
		console.log("winner", this.arg_list[select_list[select_list.length - 1]].player);
	}
	for (var i  = select_list.length - 1; i >= 0; -- i) {
		this.arg_list.splice(select_list[i], 1);
	}
};

/**
 * Utility methods.
 *
 * @author		Fei Zhan
 * @version		0.0
*/

var BOARDFUL = BOARDFUL || new Object();
BOARDFUL.ENGINE = BOARDFUL.ENGINE || new Object();

// get function from string, with or without scopes
BOARDFUL.ENGINE.getFunctionFromString = function (string) {
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
BOARDFUL.ENGINE.toString = function (value) {
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
BOARDFUL.ENGINE.Envi = new Object();
BOARDFUL.ENGINE.checkEnvi = function () {
	if (typeof module !== 'undefined' && module.exports) {
		BOARDFUL.ENGINE.Envi.type = "nodejs";
	} else {
		BOARDFUL.ENGINE.Envi.type = "browser";
		BOARDFUL.ENGINE.Envi.isOpera = !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
		// Opera 8.0+ (UA detection to detect Blink/v8-powered Opera)
		BOARDFUL.ENGINE.Envi.isFirefox = typeof InstallTrigger !== 'undefined';   // Firefox 1.0+
		BOARDFUL.ENGINE.Envi.isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0;
		// At least Safari 3+: "[object HTMLElementConstructor]"
		BOARDFUL.ENGINE.Envi.isChrome = !!window.chrome && !isOpera;              // Chrome 1+
		BOARDFUL.ENGINE.Envi.isIE = /*@cc_on!@*/false || !!document.documentMode; // At least IE6
	}
};

// parse url parameters
BOARDFUL.ENGINE.parseUrlParam = function (query) {
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
BOARDFUL.ENGINE.parseUrl = function () {
	var param = BOARDFUL.ENGINE.parseUrlParam(window.location.search.substring(1));
	param["#"] = window.location.hash.substring(1);
	var param1 = BOARDFUL.ENGINE.parseUrlParam(window.location.hash.substring(1));
	for (var index in param1) {
		if (! (index in param)) {
			param[index] = param1[index];
		}
	}
	return param;
};

// shuffle
BOARDFUL.ENGINE.shuffle = function (o) {
    for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
};


/**
* Game.
*
* @author  Fei Zhan
* @version 0.0
*/

var BOARDFUL = BOARDFUL || new Object();
BOARDFUL.GAME = BOARDFUL.GAME || new Object();

BOARDFUL.GAME.init = function (config) {
	$("#content").empty();
	$("#content").load("src/browser/game.html");
	var load_files = new BOARDFUL.ENGINE.loadFileList(["src/browser/game.css"], function () {
	});
	$("#content button#ok").on("click", function () {
	});
};

/**
* Loader of menus.
*
* @author  Fei Zhan
* @version 0.0
*/

var BOARDFUL = BOARDFUL || new Object();
BOARDFUL.MENUS = BOARDFUL.MENUS || new Object();

BOARDFUL.MENUS.GameList = new Object();
BOARDFUL.MENUS.run = function () {
	$("#content").empty();
	$("#content").load("src/browser/menu0.html");
	var load_files = new BOARDFUL.ENGINE.loadFileList(["src/browser/menu0.css", "src/engine/gamelist.json"], function () {
		BOARDFUL.MENUS.GameList = BOARDFUL.ENGINE.FileList[BOARDFUL.ENGINE.FileNameList["src/engine/gamelist.json"]].content.games;
		BOARDFUL.MENUS.loadGameList(BOARDFUL.MENUS.GameList);
	});
};
BOARDFUL.MENUS.Selected = undefined;
BOARDFUL.MENUS.loadGameList = function (list) {
	$("#content button#ok").click(function () {
		if (undefined === BOARDFUL.MENUS.Selected || ! (BOARDFUL.MENUS.Selected in BOARDFUL.MENUS.GameList)) {
			return;
		}
		BOARDFUL.MENUS.roomStart(BOARDFUL.MENUS.GameList[BOARDFUL.MENUS.Selected]);
	});
	for (var i in list) {
		$("#content #gamelist ul").append('<li id="' + i + '">' + list[i].name + "</li>");
		$("#content #gamelist ul li:last").click(function () {
			BOARDFUL.MENUS.Selected = $(this).attr('id');
			$("#content #gamelist li").removeClass("active");
			$(this).addClass("active");
			$("#content #descrip").empty();
			$("#content #descrip").append(list[BOARDFUL.MENUS.Selected].descrip);
		});
	}
};

/**
* Loader of menus.
*
* @author  Fei Zhan
* @version 0.0
*/

var BOARDFUL = BOARDFUL || new Object();
BOARDFUL.MENUS = BOARDFUL.MENUS || new Object();

BOARDFUL.MENUS.GamePackage = new Object();
BOARDFUL.MENUS.roomStart = function (game) {
	$("#content").empty();
	$("#content").load("src/browser/menu1.html");
	var load_files = new BOARDFUL.ENGINE.loadFileList(["src/browser/menu1.css", game.package], function () {
		BOARDFUL.MENUS.GamePackage = BOARDFUL.ENGINE.FileList[BOARDFUL.ENGINE.FileNameList[game.package]].content;
		BOARDFUL.MENUS.setRoom(BOARDFUL.MENUS.GamePackage);
	});
};
BOARDFUL.MENUS.setRoom = function (package) {
	$("#content button#ok").on("click", function () {
		BOARDFUL.GAME.init(BOARDFUL.MENUS.GamePackage);
	});
	$("#content #name").html(package.name);
	$("#content #descrip1").html(package.descrip);
	$("#content #players").append("<div><span>me</span></div>");
	for (var i = 1; i < package.max_players; ++ i) {
		$("#content #players").append("<div><span>empty</span></div>");
	}
	for (var i in package.options) {
		$("#content #options").append('<div id="' + i + '"></div>');
		$("#content #options #" + i).append('<span>' + i + '</span><select></select>');
		for (var j in package.options[i].value) {
			$("#content #options #" + i + " select").append('<option value="' + package.options[i].value[j] + '">' + package.options[i].value[j] + '</option>');
		}
	}
};

