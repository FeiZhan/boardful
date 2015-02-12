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
	this.ui = undefined;
	BOARDFUL.Mngr.add(this);
	this.config = config;
	this.room_list = new Array();
};
// load board game
BOARDFUL.CORE.Board.prototype.load = function (callback) {
	this.callback = callback;
	this.loadPackage([this.config.package]);
};
BOARDFUL.CORE.Board.prototype.loadPackage = function (packages, callback) {
	var that = this;
	var load = new BOARDFUL.CORE.FileLoader(packages, function () {
		var dependencies = new Array();
		var files = new Array();
		for (var i in packages) {
			if (".json" != packages[i].substr(packages[i].length - 5)) {
				continue;
			}
			var pack = BOARDFUL.CORE.File.list[BOARDFUL.CORE.File.name_list[packages[i]]].content;
			if ("files" in pack) {
				files = files.concat(pack.files);
			}
			if ("dependencies" in pack) {
				dependencies = dependencies.concat(pack.dependencies);
			}
		}
		var load_files = function () {
			var load1 = new BOARDFUL.CORE.FileLoader(files, function () {
				for (var i in files) {
					if (".js" == files[i].substr(files[i].length - 3)) {
						BOARDFUL.CORE.File.setToMods(files[i]);
					}
				}
				if (undefined === callback) {
					BOARDFUL.Logger.log("info", "load board", that.name);
					that.createRoom(BOARDFUL.CORE.File.list[BOARDFUL.CORE.File.name_list[that.config.package]].content);
				}
				else if ("function" == typeof callback) {
					callback();
				}
			});
		};
		if (dependencies.length > 0) {
			that.loadPackage(dependencies, load_files);
		} else {
			load_files();
		}
	});
};
// create room
BOARDFUL.CORE.Board.prototype.createRoom = function (package) {
	var room = new BOARDFUL.CORE.Room(package, this.id);
	this.room_list.push(room.id);
	if ("function" == typeof this.callback) {
		return this.callback(room.id);
	}
};
