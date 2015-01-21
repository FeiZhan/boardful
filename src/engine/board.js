/**
 * Board game.
 *
 * @author		Fei Zhan
 * @version		0.0
**/

var BOARDFUL = BOARDFUL || new Object();
BOARDFUL.ENGINE = BOARDFUL.ENGINE || new Object();

// board game
BOARDFUL.ENGINE.Board = function (config, owner) {
	this.type = "Board";
	this.owner = owner;
	this.name = config.name;
	BOARDFUL.Mngr.add(this);
	this.config = config;
};
// load board game
BOARDFUL.ENGINE.Board.prototype.load = function () {
	console.log("loading board", this.config.name);
	var that = this;
	var load = new BOARDFUL.ENGINE.FileLoader([this.config.package], function () {
		var config = BOARDFUL.ENGINE.FileList[BOARDFUL.ENGINE.FileNameList[that.config.package]].content;
		that.createRoom(config);
	});
};
// create room
BOARDFUL.ENGINE.Board.prototype.createRoom = function (config) {
	var room = new BOARDFUL.ENGINE.Room(config, this.id);
	room.configRoom();
};
