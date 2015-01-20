/**
 * Define the BOARDFUL namespace.
 *
 * @author		Fei Zhan
 * @version		0.0
 * 
*/

// namespace
var BOARDFUL = BOARDFUL || new Object();

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
// run
BOARDFUL.run = function (config) {
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
	this.id = BOARDFUL.ENGINE.Card.next_id;
	BOARDFUL.ENGINE.CardList[this.id] = this;
	++ BOARDFUL.ENGINE.Card.next_id;
	this.rank = config.rank;
	this.suit = config.suit;
	this.color = config.color;
};
BOARDFUL.ENGINE.Card.next_id = 0;

// card list
BOARDFUL.ENGINE.CardList = new Object();

// load cards
BOARDFUL.ENGINE.loadCards = function (config) {
	var card_list = new Array();
	switch (config) {
	case "poker":
		card_list = BOARDFUL.ENGINE.loadPoker();
		break;
	default:
		break;
	}
	return card_list;
};
// load poker cards
BOARDFUL.ENGINE.loadPoker = function (num) {
	num = num || 1;
	var card;
	var card_list = new Array();
	for (var i = 0; i < num; ++ i) {
		for (var j = 1; j <= 13; ++ j) {
			var rank = j;
			switch (j) {
			case 11:
				rank = "Jack";
				break;
			case 12:
				rank = "Queen";
				break;
			case 13:
				rank = "King";
				break;
			default:
				rank = j;
				break;
			}
			for (var k in ["spade", "heart", "diamond", "club"]) {
				card = new BOARDFUL.ENGINE.Card({
					rank: rank,
					suit: k,
					color: (k % 2 ? "red" : "black")
				});
				card_list.push(card.id);
			}
		}
	}
	return card_list;
};
BOARDFUL.ENGINE.pokerSort = function (id0, id1) {
	var card0 = BOARDFUL.ENGINE.CardList[id0];
	var card1 = BOARDFUL.ENGINE.CardList[id1];
	if (card0.rank != card1.rank) {
		var rank0 = pokerGetRankValue(card0.rank);
	}
};
var pokerGetRankValue = function (rank) {
	var rank_values = {
		Jack: 11,
		Queen: 11,
		King: 11
	};
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
BOARDFUL.ENGINE.Deck = function () {
	this.id = BOARDFUL.ENGINE.Deck.next_id;
	BOARDFUL.ENGINE.DeckList[this.id] = this;
	++ BOARDFUL.ENGINE.Deck.next_id;
	this.card_list = new Array();
};
BOARDFUL.ENGINE.Deck.next_id = 0;
// deck list
BOARDFUL.ENGINE.DeckList = new Object();

// get cards
BOARDFUL.ENGINE.Deck.prototype.getCards = function (card_list) {
	this.card_list = this.card_list.concat(card_list);
};
// shuffle cards
BOARDFUL.ENGINE.Deck.prototype.shuffle = function () {
	this.card_list = BOARDFUL.ENGINE.shuffle(this.card_list);
};
// deal cards
BOARDFUL.ENGINE.Deck.prototype.dealCards = function (num) {
	var cards = new Array();
	for (var i = 0; i < num; ++ i) {
		cards.push(this.card_list[0]);
		this.card_list.shift();
	}
	return cards;
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
	this.id = BOARDFUL.ENGINE.Event.next_id;
	BOARDFUL.ENGINE.EventList[this.id] = this;
	++ BOARDFUL.ENGINE.Event.next_id;
	this.name = arg.name;
	this.arg = arg;
	this.arg.creation_time = new Date();
};
BOARDFUL.ENGINE.Event.next_id = 0;
// event list
BOARDFUL.ENGINE.EventList = new Object();

// event level precedence
BOARDFUL.ENGINE.EventLevels = ["top", "system", "server", "board", "room", "game", "extension", "player", "card", "rear"];
// event manager
BOARDFUL.ENGINE.EventMngr = function () {
	this.list = new Array();
	this.listenerList = new Object();
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
	return BOARDFUL.ENGINE.EventList[this.list[0]];
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
	if (! (event in this.listenerList)) {
		this.listenerList[event] = new Object();
	}
	config.level = config.level || "rear";
	if (! (config.level in this.listenerList[event])) {
		this.listenerList[event][config.level] = new Array();
	}
	this.listenerList[event][config.level].push(config);
	this.logger.log("info", "add listener", event);
};
// remove event listener
BOARDFUL.ENGINE.EventMngr.prototype.off = function (event, config) {
	if (! (event in this.listenerList)) {
		return;
	}
	config.level = config.level || "extension";
	if (! (config.level in this.listenerList[event])) {
		return;
	}
	var index = this.listenerList[event][config.level].indexOf(config);
	if (index >= 0) {
		this.listenerList[event][config.level].splice(index, 1);
	}
};
// launch event manager
BOARDFUL.ENGINE.EventMngr.prototype.run = function () {
	if (this.list.length > 0) {
		// get the current event
		var event = this.front();
		this.logger.log("info", "event", event.name);
		this.list.shift();
		if (event && (event.name in this.listenerList)) {
			for (var i in BOARDFUL.ENGINE.EventLevels) {
				if (BOARDFUL.ENGINE.EventLevels[i] in this.listenerList[event.name]) {
					for (var j in this.listenerList[event.name][BOARDFUL.ENGINE.EventLevels[i]]) {
						var listener = this.listenerList[event.name][BOARDFUL.ENGINE.EventLevels[i]][j];
						this.logger.log("info", "trigger", listener.id);
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
 * @version	0.0
**/

var BOARDFUL = BOARDFUL || new Object();
BOARDFUL.ENGINE = BOARDFUL.ENGINE || new Object();

// game
BOARDFUL.ENGINE.Game = function (config) {
	this.id = BOARDFUL.ENGINE.Game.next_id;
	BOARDFUL.ENGINE.GameList[this.id] = this;
	++ BOARDFUL.ENGINE.Game.next_id;
	this.event_mngr = new BOARDFUL.ENGINE.EventMngr();
	// create from room
	if (config instanceof BOARDFUL.ENGINE.Room) {
		this.config = config.config;
		this.options = config.options;
		this.deck_list = {
			draw: new BOARDFUL.ENGINE.Deck().id,
			discard: new BOARDFUL.ENGINE.Deck().id
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
	// create event
	var event = new BOARDFUL.ENGINE.Event({
		source_type: "game",
		source_id: this.id,
		name: "GameStart"
	});
	this.event_mngr.add(event.id);
};
BOARDFUL.ENGINE.Game.next_id = 0;
// game list
BOARDFUL.ENGINE.GameList = new Object();

// add event listeners
BOARDFUL.ENGINE.Game.prototype.addListeners = function () {
	var that = this;
	this.event_mngr.on("GameStart", {
		level: "game",
		callback: function (arg) {
			that.start(arg);
		},
		instance: that
	});
	this.event_mngr.on("RoundStart", {
		level: "game",
		callback: function (arg) {
			that.roundStart(arg);
		},
		instance: that
	});
	this.event_mngr.on("RoundEnd", {
		level: "game",
		callback: function (arg) {
			that.roundEnd(arg);
		},
		instance: that
	});
	this.event_mngr.on("PlayerStart", {
		level: "game",
		callback: function (arg) {
			that.playerStart(arg);
		},
		instance: that
	});
	this.event_mngr.on("DealCards", {
		level: "game",
		callback: function (arg) {
			that.dealCards(arg);
		},
		instance: that
	});
};
// launch game
BOARDFUL.ENGINE.Game.prototype.run = function () {
	this.event_mngr.run();
};
// start game
BOARDFUL.ENGINE.Game.prototype.start = function (arg) {
	this.round = 0;
	this.player_list = BOARDFUL.ENGINE.shuffle(this.player_list);
	var card_list = BOARDFUL.ENGINE.loadCards("poker");
	BOARDFUL.ENGINE.DeckList[this.deck_list.draw].getCards(card_list);
	BOARDFUL.ENGINE.DeckList[this.deck_list.draw].shuffle();
	var event_list = new Array();
	for (var i in this.player_list) {
		var event = new BOARDFUL.ENGINE.Event({
			source_type: "game",
			source_id: this.id,
			name: "DealCards",
			deck: "draw",
			player: this.player_list[i],
			number: 5
		});
		event_list.push(event.id);
	}
	var event = new BOARDFUL.ENGINE.Event({
		source_type: "game",
		source_id: this.id,
		name: "RoundStart"
	});
	event_list.push(event.id);
	this.event_mngr.front(event_list);
};
// start a round
BOARDFUL.ENGINE.Game.prototype.roundStart = function (arg) {
	++ this.round;
	var event_list = new Array();
	var event;
	for (var i in this.player_list) {
		event = new BOARDFUL.ENGINE.Event({
			source_type: "game",
			source_id: this.id,
			name: "PlayerStart"
		});
		event_list.push(event.id);
		event = new BOARDFUL.ENGINE.Event({
			source_type: "game",
			source_id: this.id,
			name: "Player" + this.player_list[i] + "Start"
		});
		event_list.push(event.id);
		event = new BOARDFUL.ENGINE.Event({
			source_type: "game",
			source_id: this.id,
			name: "DealCards",
			deck: "draw",
			player: this.player_list[i],
			number: 2
		});
		event_list.push(event.id);
		event = new BOARDFUL.ENGINE.Event({
			source_type: "game",
			source_id: this.id,
			name: "PlayersDuel"
		});
		event_list.push(event.id);
	}
	event = new BOARDFUL.ENGINE.Event({
		source_type: "game",
		source_id: this.id,
		name: "RoundEnd"
	});
	event_list.push(event.id);
	this.event_mngr.front(event_list);
};
// end a round
BOARDFUL.ENGINE.Game.prototype.roundEnd = function (arg) {
	var event = new BOARDFUL.ENGINE.Event({
		source_type: "game",
		source_id: this.id,
		name: "RoundStart"
	});
	this.event_mngr.add(event.id);
};
// player start
BOARDFUL.ENGINE.Game.prototype.playerStart = function (arg) {
	this.current_player = (this.current_player + 1) % this.player_list.length;
};
// deal cards
BOARDFUL.ENGINE.Game.prototype.dealCards = function (arg) {
	var  card_list = BOARDFUL.ENGINE.DeckList[this.deck_list[arg.deck]].dealCards(arg.number);
	console.log("deal cards", card_list);
	BOARDFUL.ENGINE.PlayerList[arg.player].hand = BOARDFUL.ENGINE.PlayerList[arg.player].hand.concat(card_list);
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
 * Player.
 *
 * @author		Fei Zhan
 * @version		0.0
*/

var BOARDFUL = BOARDFUL || new Object();
BOARDFUL.ENGINE = BOARDFUL.ENGINE || new Object();

// player
BOARDFUL.ENGINE.Player = function (config, game_id) {
	this.id = BOARDFUL.ENGINE.Player.next_id;
	BOARDFUL.ENGINE.PlayerList[this.id] = this;
	++ BOARDFUL.ENGINE.Player.next_id;
	this.game_id = game_id;
	this.game = BOARDFUL.ENGINE.GameList[this.game_id];
	this.hand = new Array();
	this.turn = undefined;
	this.type = undefined;
	switch (config) {
	case "me":
		this.type = "me";
		break;
	case "ai":
		this.type = "ai";
		break;
	default:
		this.type = "other";
		break;
	}
	this.addListeners();
};
BOARDFUL.ENGINE.Player.next_id = 0;

// add event listeners
BOARDFUL.ENGINE.Player.prototype.addListeners = function () {
	var that = this;
	this.game.event_mngr.on("Player" + this.id + "Start", {
		level: "game",
		callback: function (arg) {
			that.start(arg);
		},
		instance: that
	});
	this.game.event_mngr.on("Player" + this.id + "PlayCard", {
		level: "game",
		callback: function (arg) {
			that.playCard(arg);
		},
		instance: that
	});
};
// player start
BOARDFUL.ENGINE.Player.prototype.start = function (arg) {
	console.log("player start", this.game.player_list[this.game.current_player]);
	var event = new BOARDFUL.ENGINE.Event({
		source_type: "game",
		source_id: this.id,
		name: "PlayerEnd"
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
		source_type: "game",
		source_id: this.id,
		source_event: arg.source_event,
		name: "PlaceCardOnTable",
		player: this.id,
		card: card
	});
	this.game.event_mngr.front(event.id);
};

// player list
BOARDFUL.ENGINE.PlayerList = new Object();
// create a player list
BOARDFUL.ENGINE.getPlayerList = function (list) {
	var player_list = new Array();
	var player;
	for (var i in list) {
		switch (list[i]) {
		case "me":
			player = new BOARDFUL.ENGINE.Player("me");
			break;
		case "ai":
			player = new BOARDFUL.ENGINE.Player("ai");
			break;
		default:
			break;
		}
		player_list.push(player.id);
	}
	return player_list;
};

/**
 * Room.
 *
 * @author  Fei Zhan
 * @version 0.0
*/

var BOARDFUL = BOARDFUL || new Object();
BOARDFUL.ENGINE = BOARDFUL.ENGINE || new Object();

// room
BOARDFUL.ENGINE.Room = function (room) {
	this.id = BOARDFUL.ENGINE.Room.next_id;
	BOARDFUL.ENGINE.RoomList[this.id] = this;
	++ BOARDFUL.ENGINE.Room.next_id;
	this.config = room;
	this.options = room.options;
	this.player_list = room.player_list || ["me", "ai"];
};
BOARDFUL.ENGINE.Room.next_id = 0;

// room list
BOARDFUL.ENGINE.RoomList = new Object();

/**
 * Table.
 *
 * @author		Fei Zhan
 * @version		0.0
**/

var BOARDFUL = BOARDFUL || new Object();
BOARDFUL.ENGINE = BOARDFUL.ENGINE || new Object();

// table
BOARDFUL.ENGINE.Table = function (game) {
	this.id = BOARDFUL.ENGINE.Table.next_id;
	BOARDFUL.ENGINE.TableList[this.id] = this;
	++ BOARDFUL.ENGINE.Table.next_id;
	this.game = game;
	this.arg_list = new Array();
	this.addListeners();
};
BOARDFUL.ENGINE.Table.next_id = 0;
// table list
BOARDFUL.ENGINE.TableList = new Object();

BOARDFUL.ENGINE.Table.prototype.addListeners = function () {
	var that = this;
	BOARDFUL.ENGINE.GameList[this.game].event_mngr.on("PlayersDuel", {
		level: "game",
		callback: function (arg) {
			that.playersDuel(arg);
		},
		instance: that
	});
	BOARDFUL.ENGINE.GameList[this.game].event_mngr.on("PlaceCardOnTable", {
		level: "game",
		callback: function (arg) {
			that.placeCardOnTable(arg);
		},
		instance: that
	});
	BOARDFUL.ENGINE.GameList[this.game].event_mngr.on("SettlePlayersDuel", {
		level: "game",
		callback: function (arg) {
			that.settlePlayersDuel(arg);
		},
		instance: that
	});
};
// players duel
BOARDFUL.ENGINE.Table.prototype.playersDuel = function (arg) {
	var event_list = new Array();
	var event;
	for (var i in BOARDFUL.ENGINE.GameList[this.game].player_list) {
		event = new BOARDFUL.ENGINE.Event({
			source_type: "table",
			source_id: this.id,
			source_event: "PlayersDuel",
			name: "Player" + BOARDFUL.ENGINE.GameList[this.game].player_list[i] + "PlayCard",
			number: 1
		});
		event_list.push(event.id);
	}
	event = new BOARDFUL.ENGINE.Event({
		source_type: "table",
		source_id: this.id,
		source_event: "PlayersDuel",
		name: "SettlePlayersDuel"
	});
	event_list.push(event.id);
	BOARDFUL.ENGINE.GameList[this.game].event_mngr.front(event_list);
};
// place card arguments on table
BOARDFUL.ENGINE.Table.prototype.placeCardOnTable = function (arg) {
	var index = BOARDFUL.ENGINE.PlayerList[arg.player].hand.indexOf(arg.card);
	BOARDFUL.ENGINE.PlayerList[arg.player].hand.splice(index, 1);
	this.arg_list.push(arg);
};
// settle players duel
BOARDFUL.ENGINE.Table.prototype.settlePlayersDuel = function (arg) {
	var args = new Array();
	for (var i in this.arg_list) {
		if ("PlayersDuel" == this.arg_list[i].source_event) {
			args.push(i);
		}
	}
	/*args.sort(function (a, b) {
		return BOARDFUL.ENGINE.pokerSort(this.arg_list[a].card, this.arg_list[b].card);
	});*/
	for (var i  = args.length - 1; i >= 0; -- i) {
		this.arg_list.splice(args[i], 1);
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
 * Server.
 * Start the server:
 * goto project root directory;
 * $ nodejs src/server/server.js
 *
 * @author		Fei Zhan
 * @version		0.0
 * 
*/

var BOARDFUL = BOARDFUL || new Object();
BOARDFUL.SERVER = BOARDFUL.SERVER || new Object();

var http = require("http"),
	url = require("url"),
	path = require("path"),
	fs = require("fs");

// create a server
BOARDFUL.SERVER.createServer = function () {
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
BOARDFUL.init();
BOARDFUL.run("server");
