/**
 * Board game.
 *
 * @author		Fei Zhan
 * @version		0.0
**/

var BOARDFUL = BOARDFUL || new Object();
BOARDFUL.CORE = BOARDFUL.CORE || new Object();

// board game
BOARDFUL.CORE.Board = function (config, owner) {
	this.type = "Board";
	this.owner = owner;
	this.name = config.name;
	BOARDFUL.Mngr.add(this);
	this.config = config;
	this.room_list = new Array();
};
// load board game
BOARDFUL.CORE.Board.prototype.load = function (callback) {
	var that = this;
	var load = new BOARDFUL.CORE.FileLoader([this.config.package], function () {
		var package = BOARDFUL.CORE.File.list[BOARDFUL.CORE.File.name_list[that.config.package]].content;
		var load1 = new BOARDFUL.CORE.FileLoader(package.files, function () {
			for (var i in package.files) {
				if (".js" == package.files[i].substr(package.files[i].length - 3)) {
					BOARDFUL.CORE.File.setToMods(package.files[i]);
				}
			}
			console.log("load board", that.name);
			that.createRoom(package, callback);
		});
	});
};
// create room
BOARDFUL.CORE.Board.prototype.createRoom = function (package, callback) {
	var room = new BOARDFUL.CORE.Room(package, this.id);
	this.room_list.push(room.id);
	if ("function" == typeof callback) {
		return callback(room.id);
	}
};
