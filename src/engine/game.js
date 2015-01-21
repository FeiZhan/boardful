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
	this.event_mngr = new BOARDFUL.ENGINE.EventMngr(this.id);
	this.cmdline = new BOARDFUL.DESKTOP.Cmdline(this.id);
	this.status = "init";
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
	this.event_mngr.on("StartPlayer", {
		level: "game",
		callback: function (arg) {
			that.startPlayer(arg);
		},
		id: that.id
	});
};
// launch game
BOARDFUL.ENGINE.Game.prototype.run = function () {
	this.status = "run";
	// create first event
	var event = new BOARDFUL.ENGINE.Event({
		name: "StartGame",
		source: this.id
	});
	this.event_mngr.add(event.id);
	this.event_mngr.run();
};
// pause game
BOARDFUL.ENGINE.Game.prototype.pause = function () {
	switch (this.status) {
	case "init":
	case "exit":
	case "pause":
		break;
	default:
		this.status = "pause";
		console.log("game pause");
		break;
	}
};
// resume game
BOARDFUL.ENGINE.Game.prototype.resume = function () {
	switch (this.status) {
	case "init":
	case "exit":
		break;
	case "pause":
		this.status = "run";
		console.log("game resume");
		break;
	default:
		break;
	}
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
	event = new BOARDFUL.ENGINE.Event({
		name: "CreateDeck",
		source: this.id,
		deck: this.deck_list.draw,
		type: "poker"
	});
	event_list.push(event.id);
	event = new BOARDFUL.ENGINE.Event({
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
	event = new BOARDFUL.ENGINE.Event({
		name: "StartRound",
		source: this.id
	});
	event_list.push(event.id);
	this.event_mngr.front(event_list);
};
// shuffle players
BOARDFUL.ENGINE.Game.prototype.shufflePlayers = function (arg) {
	this.player_list = BOARDFUL.ENGINE.shuffle(this.player_list);
	var event_list = new Array();
	var event = new BOARDFUL.ENGINE.Event({
		name: "ShufflePlayersUi",
		source: this.id,
		players: this.player_list
	});
	event_list.push(event.id);
	this.event_mngr.front(event_list);
};
// start a round
BOARDFUL.ENGINE.Game.prototype.startRound = function (arg) {
	++ this.round;
	console.log("round", this.round);
	var event_list = new Array();
	var event;
	for (var i in this.player_list) {
		event = new BOARDFUL.ENGINE.Event({
			name: "StartPlayer",
			source: this.id,
			player: this.player_list[i]
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
// start players
BOARDFUL.ENGINE.Game.prototype.startPlayer = function (arg) {
	this.current_player = (this.current_player + 1) % this.player_list.length;
};
