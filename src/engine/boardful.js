/**
 * Define the BOARDFUL namespace.
 *
 * @author		Fei Zhan
 * @version		0.0
 * 
**/

// namespace
var BOARDFUL = BOARDFUL || new Object();
if (module) {
	module.exports = BOARDFUL;
}
BOARDFUL.MODS = BOARDFUL.MODS || new Object();

// run
BOARDFUL.run = function (config) {
	BOARDFUL.init();
	BOARDFUL.Mngr = new BOARDFUL.ENGINE.Manager();
	BOARDFUL.loadBoards();
	BOARDFUL.Logger.log('info', "launch type", config);
	switch (config) {
	case "server":
		BOARDFUL.SERVER.port = process.argv[3] || 8080;
		BOARDFUL.SERVER.createServer();
		break;
	case "browser":
		BOARDFUL.MENUS.run();
		break;
	case "desktop":
	default:
		global.jquery = require('jquery');
		global.$ = jquery.create();
		BOARDFUL.Cmdline = new BOARDFUL.DESKTOP.Cmdline();
		BOARDFUL.DESKTOP.Cmdline.setCmdline();
		BOARDFUL.DESKTOP.Cmdline.showMenu();
		break;
	}
};
// init
BOARDFUL.init = function () {
	BOARDFUL.ENGINE.checkEnvi();
	// create logger
	BOARDFUL.Logger = new BOARDFUL.ENGINE.Logger();
	BOARDFUL.Logger.add(winston.transports.File, {
		//filename: 'logs/boardful_' + new Date().toString() + '.log'
		filename: 'logs/boardful.log'
	})
	.remove(winston.transports.Console);
	BOARDFUL.Logger.log('info', "----------launch----------");
	BOARDFUL.Debugger = new BOARDFUL.ENGINE.Logger();
	BOARDFUL.Debugger.add(winston.transports.File, {
		filename: 'logs/debug.log'
	})
	.remove(winston.transports.Console);
	BOARDFUL.Debugger.log('info', "----------launch----------");

	BOARDFUL.Logger.log('info', "environment", BOARDFUL.ENGINE.Envi);
	BOARDFUL.ENGINE.File.init();
	if ("browser" == BOARDFUL.ENGINE.Envi.type) {
		BOARDFUL.urlparam = BOARDFUL.ENGINE.parseUrl();
		BOARDFUL.Logger.log('info', "url param", BOARDFUL.urlparam);
		BOARDFUL.ENGINE.File.getFromHtml();
	}
};
// board game list
BOARDFUL.BoardList = new Array();
// load board game list
BOARDFUL.loadBoards = function () {
	console.log("loading Boardful");
	var load_files = new BOARDFUL.ENGINE.FileLoader(["src/engine/gamelist.json"], function () {
		var board_list = BOARDFUL.ENGINE.File.list[BOARDFUL.ENGINE.File.name_list["src/engine/gamelist.json"]].content.games;
		for (var i in board_list) {
			BOARDFUL.BoardList.push(new BOARDFUL.ENGINE.Board(board_list[i]));
		}
	});
	
};
