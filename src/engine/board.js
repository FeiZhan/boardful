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
	this.room_list = new Array();
};
// load board game
BOARDFUL.ENGINE.Board.prototype.load = function (callback) {
	var that = this;
	var load = new BOARDFUL.ENGINE.FileLoader([this.config.package], function () {
		var config = BOARDFUL.ENGINE.File.list[BOARDFUL.ENGINE.File.name_list[that.config.package]].content;
		var load1 = new BOARDFUL.ENGINE.FileLoader(config.files, function () {
			for (var i in config.files) {
				if (".js" == config.files[i].substr(config.files[i].length - 3)) {
					BOARDFUL.ENGINE.File.setToMods(config.files[i]);
				}
			}
			console.log("loaded board game", that.name);
			that.createRoom(config, callback);
		});
	});
};
// create room
BOARDFUL.ENGINE.Board.prototype.createRoom = function (config, callback) {
	var room = new BOARDFUL.ENGINE.Room(config, this.id);
	this.room_list.push(room);
	//room.configRoom();
	if ("function" == typeof callback) {
		return callback(room.id);
	}
};
