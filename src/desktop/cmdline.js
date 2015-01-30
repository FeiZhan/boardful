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
BOARDFUL.DESKTOP.Cmdline.prototype.keypress = function (chunk, key) {
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
			BOARDFUL.CORE.Command.call(text);
			// empty string to continue game
			return "" == text;
		}, function (text) {
			BOARDFUL.Mngr.get(that.owner).resume();
		});
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
// ui for deal cards
BOARDFUL.DESKTOP.Cmdline.prototype.playCardUi = function (arg) {
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
		var event = new BOARDFUL.CORE.Event({
			name: "PlaceCardOnTable",
			source: arg.player,
			source_event: arg.source_event,
			player: arg.player,
			card: card
		});
		BOARDFUL.Mngr.get(that.owner).event_mngr.front(event.id);
		BOARDFUL.Mngr.get(that.owner).status = "run";
	});
};
// ui for settle players duel
BOARDFUL.DESKTOP.Cmdline.prototype.settlePlayersDuelUi = function (arg) {
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
			console.log(i + ". " + board.config.name + "\t" + board.config.description);
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
