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
	++ BOARDFUL.ENGINE.Game.next_id;
	// create from room
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
	// create event
	var event = new BOARDFUL.ENGINE.Event("GameStart");
	this.event_mngr.add(event.id);
};
BOARDFUL.ENGINE.Game.next_id = 0;

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
	var event = new BOARDFUL.ENGINE.Event("RoundEnd");
	this.event_mngr.add(event.id);
};
// end a round
BOARDFUL.ENGINE.Game.prototype.roundEnd = function () {
	var event = new BOARDFUL.ENGINE.Event("RoundStart");
	this.event_mngr.add(event.id);
};
