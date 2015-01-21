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
	BOARDFUL.Cmdline.output("loading board", this.config.name);
	var that = this;
	var load = new BOARDFUL.ENGINE.FileLoader([this.config.package], function () {
		var config = BOARDFUL.ENGINE.File.list[BOARDFUL.ENGINE.File.name_list[that.config.package]].content;
		var load1 = new BOARDFUL.ENGINE.FileLoader(config.files, function () {
			for (var i in config.files) {
				if (".js" == config.files[i].substr(config.files[i].length - 3)) {
					BOARDFUL.ENGINE.File.setToMods(config.files[i]);
				}
			}
			that.createRoom(config);
		});
	});
};
// create room
BOARDFUL.ENGINE.Board.prototype.createRoom = function (config) {
	var room = new BOARDFUL.ENGINE.Room(config, this.id);
	room.configRoom();
};
