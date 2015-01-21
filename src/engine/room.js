/**
 * Room.
 *
 * @author		Fei Zhan
 * @version		0.0
**/

var BOARDFUL = BOARDFUL || new Object();
BOARDFUL.ENGINE = BOARDFUL.ENGINE || new Object();

// room
BOARDFUL.ENGINE.Room = function (config, owner) {
	this.type = "Room";
	this.owner = owner;
	BOARDFUL.Mngr.add(this);
	this.config = config;
	this.options = config.options;
	this.player_list = config.player_list || ["me", "ai"];
};
// config room
BOARDFUL.ENGINE.Room.prototype.configRoom = function () {
	// input config for room
	BOARDFUL.Cmdline.output("config room");
	var that = this;
	process.stdin.once('data', function (text) {
		BOARDFUL.Cmdline.output("config room done");
		var game = new BOARDFUL.ENGINE.Game(that);
		BOARDFUL.Cmdline.output("game start");
		game.run();
	});
};
