/**
 * Game.
 *
 * @author  Fei Zhan
 * @version 0.0
*/

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
		this.player_list = new Array();
		this.current_player = -1;
		for (var i in config.player_list) {
			var player = new BOARDFUL.ENGINE.Player(config.player_list[i], this.id);
			this.player_list.push(player);
		}
	}
	var that = this;
	// add event listeners
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
	this.event_mngr.on("PlayerPrepare", {
		level: "game",
		callback: function () {
			that.playerPrepare();
		},
		instance: that
	});
	// create event
	var event = new BOARDFUL.ENGINE.Event("GameStart");
	this.event_mngr.add(event.id);
};
BOARDFUL.ENGINE.Game.next_id = 0;
// game list
BOARDFUL.ENGINE.GameList = new Object();

// launch game
BOARDFUL.ENGINE.Game.prototype.run = function () {
	this.event_mngr.run();
};
// start game
BOARDFUL.ENGINE.Game.prototype.start = function () {
	this.round = 0;
	var event = new BOARDFUL.ENGINE.Event("RoundStart");
	this.event_mngr.add(event.id);
};
// start a round
BOARDFUL.ENGINE.Game.prototype.roundStart = function () {
	++ this.round;
	var event_list = new Array();
	var event;
	for (var i in this.player_list) {
		event = new BOARDFUL.ENGINE.Event("PlayerPrepare");
		event_list.push(event.id);
		event = new BOARDFUL.ENGINE.Event("PlayerStart");
		event_list.push(event.id);
	}
	event = new BOARDFUL.ENGINE.Event("RoundEnd");
	event_list.push(event.id);
	this.event_mngr.front(event_list);
};
// end a round
BOARDFUL.ENGINE.Game.prototype.roundEnd = function () {
	var event = new BOARDFUL.ENGINE.Event("RoundStart");
	this.event_mngr.add(event.id);
};
// player start
BOARDFUL.ENGINE.Game.prototype.playerPrepare = function () {
	this.current_player = (this.current_player + 1) % this.player_list.length;
};
