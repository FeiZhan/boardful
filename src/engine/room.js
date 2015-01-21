/**
 * Room.
 *
 * @author		Fei Zhan
 * @version		0.0
**/

var BOARDFUL = BOARDFUL || new Object();
BOARDFUL.ENGINE = BOARDFUL.ENGINE || new Object();

// room
BOARDFUL.ENGINE.Room = function (owner) {
	this.type = "Room";
	this.owner = owner;
	BOARDFUL.Mngr.add(this);
	this.player_list = ["me", "ai"];
};
// load board
BOARDFUL.ENGINE.Room.prototype.loadBoard = function (board) {
	console.log("loading board", board.name);
	var that = this;
	var load = new BOARDFUL.ENGINE.FileLoader([board.package], function () {
		var package = BOARDFUL.ENGINE.FileList[BOARDFUL.ENGINE.FileNameList[board.package]].content;
		that.config = package;
		that.options = package.options;
		that.player_list = package.player_list || that.player_list;
	});
};
// config room
BOARDFUL.ENGINE.Room.prototype.configRoom = function () {
	// input config for room
	console.log("config room");
	var that = this;
	process.stdin.once('data', function (text) {
		console.log("config room done");
		var game = new BOARDFUL.ENGINE.Game(that);
		console.log("game start");
		game.run();
	});
};
