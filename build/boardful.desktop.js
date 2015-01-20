/**
* Define the BOARDFUL namespace.
*
* @author		Fei Zhan
* @version		0.0
* 
*/

var BOARDFUL = BOARDFUL || new Object();

BOARDFUL.init = function () {
	BOARDFUL.ENGINE.checkEnvi();
	BOARDFUL.Logger = new BOARDFUL.ENGINE.Logger();
	BOARDFUL.Logger.add(winston.transports.File, {
		//filename: 'logs/boardful_' + new Date().toString() + '.log'
		filename: 'logs/boardful.log'
	})
	.remove(winston.transports.Console);
	BOARDFUL.Debugger = new BOARDFUL.ENGINE.Logger();
	BOARDFUL.Debugger.add(winston.transports.File, {
		filename: 'logs/debug.log'
	});

	BOARDFUL.Logger.log('info', "environment", BOARDFUL.ENGINE.Envi);
	BOARDFUL.ENGINE.FileLoader();
	if ("browser" == BOARDFUL.ENGINE.Envi.type) {
		BOARDFUL.urlparam = BOARDFUL.ENGINE.parseUrl();
		BOARDFUL.Logger.log('info', "url param", BOARDFUL.urlparam);
		BOARDFUL.ENGINE.getFilesInHtml();
	}
};
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
* Game.
*
* @author  Fei Zhan
* @version 0.0
*/

var BOARDFUL = BOARDFUL || new Object();
BOARDFUL.ENGINE = BOARDFUL.ENGINE || new Object();

BOARDFUL.ENGINE.CardList = new Object();
BOARDFUL.ENGINE.loadCards = function (config) {
	switch (config) {
	case "poker":
		BOARDFUL.ENGINE.CardList = BOARDFUL.ENGINE.loadPoker();
		break;
	default:
		break;
	}
};
BOARDFUL.ENGINE.loadPoker = function (num) {
	num = num || 1;
	var card;
	for (var i = 0; i < num; ++ i) {
		for (var j = 1; j <= 13; ++ j) {
			var value = j;
			switch (j) {
			case 11:
				value = "Jack";
				break;
			case 12:
				value = "Queen";
				break;
			case 13:
				value = "King";
				break;
			default:
				value = j;
				break;
			}
			for (var k in ["spade", "heart", "diamond", "club"]) {
				card = new BOARDFUL.ENGINE.Card({
					value: value,
					suit: k,
					color: (k % 2 ? "red" : "black")
				});
				BOARDFUL.ENGINE.CardList[card.id] = card;
			}
		}
	}
};

BOARDFUL.ENGINE.NextCardId = 0;
BOARDFUL.ENGINE.Card = function (config) {
	this.id = BOARDFUL.ENGINE.NextCardId;
	++ BOARDFUL.ENGINE.NextCardId;
	this.value = config.value;
	this.suit = config.suit;
	this.color = config.color;
};

/**
* Deck.
*
* @author  Fei Zhan
* @version 0.0
*/

var BOARDFUL = BOARDFUL || new Object();
BOARDFUL.ENGINE = BOARDFUL.ENGINE || new Object();

BOARDFUL.ENGINE.DeckList = new Object();
BOARDFUL.ENGINE.Deck = function () {
	this.id = BOARDFUL.ENGINE.Deck.next_deck_id;
	++ BOARDFUL.ENGINE.Deck.next_deck_id;
	this.card_list = new Array();
};
BOARDFUL.ENGINE.Deck.next_deck_id = 0;
BOARDFUL.ENGINE.Deck.prototype.getCards = function (num) {
	var cards = new Array();
	for (var i = 0; i < num; ++ i) {
		cards.append(this.card_list[0]);
		this.card_list.remove(0);
	}
	return cards;
};
BOARDFUL.ENGINE.Deck.prototype.shuffle = function (num) {
	
};

/**
* Game.
*
* @author  Fei Zhan
* @version 0.0
*/

var BOARDFUL = BOARDFUL || new Object();
BOARDFUL.ENGINE = BOARDFUL.ENGINE || new Object();

BOARDFUL.ENGINE.Event = function (name) {
	this.id = BOARDFUL.ENGINE.Event.next_id;
	BOARDFUL.ENGINE.EventList[this.id] = this;
	++ BOARDFUL.ENGINE.Event.next_id;
	this.name = name;
};
BOARDFUL.ENGINE.Event.next_id = 0;
BOARDFUL.ENGINE.EventList = new Object();

BOARDFUL.ENGINE.EventLevels = ["top", "system", "server", "board", "room", "game", "extension", "player", "card", "rear"];
BOARDFUL.ENGINE.EventMngr = function () {
	this.list = new Array();
	this.listenerList = new Object();
	this.timeout = 300;
	this.logger = new BOARDFUL.ENGINE.Logger();
	this.logger.add(winston.transports.File, {
		filename: 'logs/event.log'
	})
	.remove(winston.transports.Console);
};
BOARDFUL.ENGINE.EventMngr.prototype.front = function (id) {
	if (undefined === id) {
		if (0 == this.list.length) {
			return undefined;
		}
	} else {
		this.list.unshift(id);
	}
	return BOARDFUL.ENGINE.EventList[this.list[0]];
};
BOARDFUL.ENGINE.EventMngr.prototype.add = function (id) {
	this.list.push(id);
};
BOARDFUL.ENGINE.EventMngr.prototype.on = function (event, config) {
	if (! (event in this.listenerList)) {
		this.listenerList[event] = new Object();
	}
	config.level = config.level || "rear";
	if (! (config.level in this.listenerList[event])) {
		this.listenerList[event][config.level] = new Array();
	}
	this.listenerList[event][config.level].push(config);
	this.logger.log("info", "add listener", event, config);
};
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
BOARDFUL.ENGINE.EventMngr.prototype.run = function () {
	if (this.list.length > 0) {
		var event = this.front();
		this.list.shift();
		this.logger.log("info", "event", event);
		if (event.name in this.listenerList) {
			for (var i in BOARDFUL.ENGINE.EventLevels) {
				if (BOARDFUL.ENGINE.EventLevels[i] in this.listenerList[event.name]) {
					for (var j in this.listenerList[event.name][BOARDFUL.ENGINE.EventLevels[i]]) {
						var listener = this.listenerList[event.name][BOARDFUL.ENGINE.EventLevels[i]][j];
						listener.callback();
						this.logger.log("info", "trigger", listener);
					}
				}
			}
		}
	}
	var that = this;
	setTimeout(function () {
		that.run();
	}, this.timeout);
};

/**
* Game.
*
* @author  Fei Zhan
* @version 0.0
*/

var BOARDFUL = BOARDFUL || new Object();
BOARDFUL.ENGINE = BOARDFUL.ENGINE || new Object();

BOARDFUL.ENGINE.Game = function (config) {
	this.id = BOARDFUL.ENGINE.Game.next_id;
	++ BOARDFUL.ENGINE.Game.next_id;
	if (config instanceof BOARDFUL.ENGINE.Room) {
		this.config = config.config;
		this.options = config.options;
		this.player_list = new Array();
		for (var i in config.player_list) {
			this.player_list.push(new BOARDFUL.ENGINE.Player(config.player_list[i]));
		}
	}
	this.event_mngr = new BOARDFUL.ENGINE.EventMngr();
	var that = this;
	this.event_mngr.on("GameStart", {
		level: "game",
		callback: function () {
			that.start();
		},
		instance: that
	});
	this.event_mngr.on("RoundStart", {
		level: "game",
		callback: function () {
			that.roundStart();
		},
		instance: that
	});
	this.event_mngr.on("RoundEnd", {
		level: "game",
		callback: function () {
			that.roundEnd();
		},
		instance: that
	});
	var event = new BOARDFUL.ENGINE.Event("GameStart");
	this.event_mngr.add(event.id);
};
BOARDFUL.ENGINE.Game.next_id = 0;

BOARDFUL.ENGINE.Game.prototype.run = function () {
	this.event_mngr.run();
};
BOARDFUL.ENGINE.Game.prototype.start = function () {
	this.round = 0;
	var event = new BOARDFUL.ENGINE.Event("RoundStart");
	this.event_mngr.add(event.id);
};
BOARDFUL.ENGINE.Game.prototype.roundStart = function () {
	++ this.round;
	var event = new BOARDFUL.ENGINE.Event("RoundEnd");
	this.event_mngr.add(event.id);
};
BOARDFUL.ENGINE.Game.prototype.roundEnd = function () {
	++ this.round;
	var event = new BOARDFUL.ENGINE.Event("RoundStart");
	this.event_mngr.add(event.id);
};

/**
* File loader.
*
* @author		Fei Zhan
* @version		0.0
* 
*/

var BOARDFUL = BOARDFUL || new Object();
BOARDFUL.ENGINE = BOARDFUL.ENGINE || new Object();
BOARDFUL.ENGINE.FileLoader = function () {
	BOARDFUL.ENGINE.LoaderLogger = new BOARDFUL.ENGINE.Logger();
	BOARDFUL.ENGINE.LoaderLogger.add(winston.transports.File, {
		filename: 'logs/fileloader.log'
	})
	.remove(winston.transports.Console);
};

BOARDFUL.ENGINE.FileList = new Object();
BOARDFUL.ENGINE.FileNameList = new Object();
BOARDFUL.ENGINE.NextFileId = 0;
BOARDFUL.ENGINE.addToFileList = function (file, content, status) {
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
BOARDFUL.ENGINE.getFilesInHtml = function () {
	$("script").each(function () {
		BOARDFUL.ENGINE.addToFileList($(this).attr("src"), $(this), "loaded");
	});
	BOARDFUL.Logger.log('info', "BOARDFUL.ENGINE.getFilesInHtml");
	BOARDFUL.Logger.log('info', BOARDFUL.ENGINE.FileNameList);
};

BOARDFUL.ENGINE.loadFile = function (file) {
	switch (BOARDFUL.ENGINE.Envi.type) {
	case "browser":
		BOARDFUL.ENGINE.loadFileAjax(file);
		break;
	case "nodejs":
		try {
			var script = require("../" + file);
			BOARDFUL.ENGINE.addToFileList(file, script, "loaded");
			BOARDFUL.ENGINE.LoaderLogger.log("info", "file loaded", file);
		} catch (err) {
			BOARDFUL.ENGINE.addToFileList(file, "", "failed");
			BOARDFUL.ENGINE.LoaderLogger.log("info", "file failed", file, err);
		}
		break;
	default:
		break;
	}
}
BOARDFUL.ENGINE.loadFileAjax = function (file) {
	if (".js" == file.substr(file.length - 3)) {
		// load a js script
		$.getScript(file)
			.done(function( script, textStatus ) {
				BOARDFUL.ENGINE.addToFileList(file, script, "loaded");
				BOARDFUL.ENGINE.LoaderLogger.log("info", "js loaded", file);
			})
			.fail(function( jqxhr, settings, exception ) {
				BOARDFUL.ENGINE.addToFileList(file, "", "failed");
				BOARDFUL.ENGINE.LoaderLogger.log("info", "js failed", file);
			});
	}
	else if (".css" == file.substr(file.length - 4)) {
		// load a css
		$('head').append( $('<link rel="stylesheet" type="text/css" />').attr('href', file) );
		BOARDFUL.ENGINE.addToFileList(file, "", "loaded");
		BOARDFUL.ENGINE.LoaderLogger.log("info", "css loaded");
		BOARDFUL.ENGINE.LoaderLogger.log("info", file);
	}
	else if (".json" == file.substr(file.length - 5)) {
		$.getJSON(file, function(data, textStatus, jqXHR) {
			BOARDFUL.ENGINE.addToFileList(file, data, "loaded");
			BOARDFUL.ENGINE.LoaderLogger.log("info", "json loaded", file);
		})
		.fail(function (jqXHR, textStatus, errorThrown) {
			BOARDFUL.ENGINE.addToFileList(file, "", "failed");
			BOARDFUL.ENGINE.LoaderLogger.log("info", "json failed", file);
		})
		.always(function(data, textStatus, jqXHR) {
		});
	}
	else {
		BOARDFUL.ENGINE.addToFileList(file, "", "failed");
		BOARDFUL.ENGINE.LoaderLogger.log("info", "file unknown", file);
	}
};

BOARDFUL.ENGINE.loadFileList = function (list, callback) {
	this.list = list;
	this.callback = callback;
	this.done = false;
	this.load();
};
BOARDFUL.ENGINE.loadFileList.prototype.load = function () {
	BOARDFUL.ENGINE.LoaderLogger.log("info", "loading", this.list);
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
 * Logger.
 *
 * @author		Fei Zhan
 * @version		0.0
 * 
*/

var BOARDFUL = BOARDFUL || new Object();
BOARDFUL.ENGINE = BOARDFUL.ENGINE || new Object();

BOARDFUL.ENGINE.Logger = function () {
	var logger = console;
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
		logger = console;
		break;
	default:
		logger = console;
		break;
	}
	return logger;
};
BOARDFUL.ENGINE.DefaultLogger = function () {
	return console;
};
BOARDFUL.ENGINE.DefaultLogger.prototype.add = function () {
	return this;
};
BOARDFUL.ENGINE.DefaultLogger.prototype.remove = function () {
	return this;
};

BOARDFUL.ENGINE.WinstonLogger = function (config) {
	this.winston = new (winston.Logger) (config);
	this.winston.log_base = this.winston.log;
	this.winston.log = function () {
		if ("nodejs" == BOARDFUL.ENGINE.Envi.type) {
			for (var i in arguments) {
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
* @author  Fei Zhan
* @version 0.0
*/

var BOARDFUL = BOARDFUL || new Object();
BOARDFUL.ENGINE = BOARDFUL.ENGINE || new Object();

BOARDFUL.ENGINE.playerList = function (list) {
	var player_list = new Object();
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
		player_list[player.id] = player;
	}
	return player_list;
};

BOARDFUL.ENGINE.NextPlayerId = 0;
BOARDFUL.ENGINE.Player = function (config) {
	this.id = BOARDFUL.ENGINE.NextPlayerId;
	++ BOARDFUL.ENGINE.NextPlayerId;
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
};

/**
* Room.
*
* @author  Fei Zhan
* @version 0.0
*/

var BOARDFUL = BOARDFUL || new Object();
BOARDFUL.ENGINE = BOARDFUL.ENGINE || new Object();

BOARDFUL.ENGINE.Room = function (room) {
	this.id = BOARDFUL.ENGINE.Room.next_id;
	++ BOARDFUL.ENGINE.Room.next_id;
	this.config = room;
	this.options = room.options;
	this.player_list = room.player_list || ["me", "ai"];
};
BOARDFUL.ENGINE.Room.next_id = 0;

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
BOARDFUL.ENGINE.toString = function (value) {
	var str = value;
	try {
		str = JSON.stringify(value);
	}
	catch (err) {
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

/**
 * Logger.
 *
 * @author		Fei Zhan
 * @version		0.0
 * 
*/

var BOARDFUL = BOARDFUL || new Object();
BOARDFUL.DESKTOP = BOARDFUL.DESKTOP || new Object();


/**
 * Logger.
 *
 * @author		Fei Zhan
 * @version		0.0
 * 
*/

var BOARDFUL = BOARDFUL || new Object();
BOARDFUL.DESKTOP = BOARDFUL.DESKTOP || new Object();

var util = require('util');
process.stdin.resume();
process.stdin.setEncoding('utf8');

BOARDFUL.DESKTOP.GameList = new Object();
BOARDFUL.DESKTOP.menuRun = function () {
	console.info("loading");
	var load_files = new BOARDFUL.ENGINE.loadFileList(["src/engine/gamelist.json"], function () {
		BOARDFUL.DESKTOP.GameList = BOARDFUL.ENGINE.FileList[BOARDFUL.ENGINE.FileNameList["src/engine/gamelist.json"]].content.games;
		BOARDFUL.DESKTOP.menuShow(BOARDFUL.DESKTOP.GameList);
	});
};
BOARDFUL.DESKTOP.menuShow = function (list) {
	for (var i in list) {
		console.log(i + ". " + list[i].name);
		console.log("\t" + list[i].descrip);
	}
	console.log("select a board");
	process.stdin.once('data', function (text) {
		console.log("loading board", util.inspect(BOARDFUL.DESKTOP.GameList[parseInt(text)].name));
		BOARDFUL.DESKTOP.roomShow(BOARDFUL.DESKTOP.GameList[parseInt(text)]);
	});
};

BOARDFUL.DESKTOP.Room = undefined;
BOARDFUL.DESKTOP.roomShow = function (game) {
	var load_files = new BOARDFUL.ENGINE.loadFileList([game.package], function () {
		var board = BOARDFUL.ENGINE.FileList[BOARDFUL.ENGINE.FileNameList[game.package]].content;
		BOARDFUL.DESKTOP.Room = new BOARDFUL.ENGINE.Room(board);
		BOARDFUL.DESKTOP.configRoom(BOARDFUL.DESKTOP.Room);
	});
};
BOARDFUL.DESKTOP.configRoom = function (room) {
	console.log("config room");
	process.stdin.once('data', function (text) {
		console.log("config room done", room);
		BOARDFUL.DESKTOP.gameStart(room);
	});
};

BOARDFUL.DESKTOP.Game = undefined;
BOARDFUL.DESKTOP.gameStart = function (room) {
	BOARDFUL.DESKTOP.Game = new BOARDFUL.ENGINE.Game(room);
	console.log("game start");
	BOARDFUL.DESKTOP.Game.run();
};

BOARDFUL.init();
BOARDFUL.run("desktop");
