/**
 * Logger.
 *
 * @author		Fei Zhan
 * @version		0.0
 * 
**/

var BOARDFUL = BOARDFUL || new Object();
BOARDFUL.DESKTOP = BOARDFUL.DESKTOP || new Object();

// set terminal
process.stdin.resume();
process.stdin.setEncoding('utf8');

// a list of board games
BOARDFUL.DESKTOP.BoardList = new Object();
// launch menu
BOARDFUL.DESKTOP.menuRun = function () {
	console.log("loading Boardful");
	// load game list
	var load_files = new BOARDFUL.ENGINE.FileLoader(["src/engine/gamelist.json"], function () {
		BOARDFUL.DESKTOP.BoardList = BOARDFUL.ENGINE.FileList[BOARDFUL.ENGINE.FileNameList["src/engine/gamelist.json"]].content.games;
		BOARDFUL.DESKTOP.menuShow(BOARDFUL.DESKTOP.BoardList);
	});
};
// show menu
BOARDFUL.DESKTOP.menuShow = function (list) {
	// show a list of boards
	for (var i in list) {
		console.log(i + ". " + list[i].name);
		console.log("\t" + list[i].descrip);
	}
	// input a board game number
	console.log("select a board");
	process.stdin.once('data', function (text) {
		console.log("loading board", BOARDFUL.DESKTOP.BoardList[parseInt(text)].name);
		BOARDFUL.DESKTOP.roomShow(BOARDFUL.DESKTOP.BoardList[parseInt(text)]);
	});
};

// current room
BOARDFUL.DESKTOP.CurrentRoom = undefined;
// show room config
BOARDFUL.DESKTOP.roomShow = function (game) {
	// load board game package
	var load_files = new BOARDFUL.ENGINE.FileLoader([game.package], function () {
		var board = BOARDFUL.ENGINE.FileList[BOARDFUL.ENGINE.FileNameList[game.package]].content;
		BOARDFUL.DESKTOP.CurrentRoom = new BOARDFUL.ENGINE.Room(board);
		BOARDFUL.DESKTOP.configRoom(BOARDFUL.DESKTOP.CurrentRoom);
	});
};
// config a room
BOARDFUL.DESKTOP.configRoom = function (room) {
	// input config for room
	console.log("config room");
	process.stdin.once('data', function (text) {
		console.log("config room done", room);
		BOARDFUL.DESKTOP.gameStart(room);
	});
};

// current game
BOARDFUL.DESKTOP.CurrentGame = undefined;
// start a game
BOARDFUL.DESKTOP.gameStart = function (room) {
	BOARDFUL.DESKTOP.CurrentGame = new BOARDFUL.DESKTOP.Game(room);
	console.log("game start");
	BOARDFUL.DESKTOP.CurrentGame.run();
};

// launch project in desktop
BOARDFUL.run("desktop");
