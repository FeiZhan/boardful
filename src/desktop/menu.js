/**
 * Logger.
 *
 * @author		Fei Zhan
 * @version		0.0
 * 
*/

var BOARDFUL = BOARDFUL || new Object();
BOARDFUL.DESKTOP = BOARDFUL.DESKTOP || new Object();

var util = require('util');
process.stdin.resume();
process.stdin.setEncoding('utf8');

BOARDFUL.DESKTOP.GameList = new Object();
BOARDFUL.DESKTOP.menuRun = function () {
	console.info("loading");
	var load_files = new BOARDFUL.ENGINE.loadFileList(["src/engine/gamelist.json"], function () {
		BOARDFUL.DESKTOP.GameList = BOARDFUL.ENGINE.FileList[BOARDFUL.ENGINE.FileNameList["src/engine/gamelist.json"]].content.games;
		BOARDFUL.DESKTOP.menuShow(BOARDFUL.DESKTOP.GameList);
	});
};
BOARDFUL.DESKTOP.menuShow = function (list) {
	for (var i in list) {
		console.log(i + ". " + list[i].name);
		console.log("\t" + list[i].descrip);
	}
	console.log("select a board");
	process.stdin.once('data', function (text) {
		console.log("loading board", util.inspect(BOARDFUL.DESKTOP.GameList[parseInt(text)].name));
		BOARDFUL.DESKTOP.roomShow(BOARDFUL.DESKTOP.GameList[parseInt(text)]);
	});
};

BOARDFUL.DESKTOP.Room = undefined;
BOARDFUL.DESKTOP.roomShow = function (game) {
	var load_files = new BOARDFUL.ENGINE.loadFileList([game.package], function () {
		var board = BOARDFUL.ENGINE.FileList[BOARDFUL.ENGINE.FileNameList[game.package]].content;
		BOARDFUL.DESKTOP.Room = new BOARDFUL.ENGINE.Room(board);
		BOARDFUL.DESKTOP.configRoom(BOARDFUL.DESKTOP.Room);
	});
};
BOARDFUL.DESKTOP.configRoom = function (room) {
	console.log("config room");
	process.stdin.once('data', function (text) {
		console.log("config room done", room);
		BOARDFUL.DESKTOP.gameStart(room);
	});
};

BOARDFUL.DESKTOP.Game = undefined;
BOARDFUL.DESKTOP.gameStart = function (room) {
	BOARDFUL.DESKTOP.Game = new BOARDFUL.ENGINE.Game(room);
	console.log("game start");
	BOARDFUL.DESKTOP.Game.run();
};

BOARDFUL.init();
BOARDFUL.run("desktop");
