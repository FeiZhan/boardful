/**
 * Game for desktop.
 *
 * @author		Fei Zhan
 * @version		0.0
 * 
**/

var BOARDFUL = BOARDFUL || new Object();
BOARDFUL.DESKTOP = BOARDFUL.DESKTOP || new Object();

// game for desktop
BOARDFUL.DESKTOP.Game = function (config) {
	this.id = BOARDFUL.DESKTOP.Game.next_id;
	BOARDFUL.DESKTOP.GameList[this.id] = this;
	++ BOARDFUL.DESKTOP.Game.next_id;
	// create a game
	this.game = new BOARDFUL.ENGINE.Game(config);
	var that = this;
	this.game.event_mngr.on("RoundStart", {
		level: "game",
		callback: function () {
			that.roundStart();
		},
		instance: that
	});
};
BOARDFUL.DESKTOP.Game.next_id = 0;
BOARDFUL.DESKTOP.GameList = new Object();

// launch game
BOARDFUL.DESKTOP.Game.prototype.run = function () {
	this.game.run();
};
// start round
BOARDFUL.DESKTOP.Game.prototype.roundStart = function () {
	console.log("round", this.game.round);
};
