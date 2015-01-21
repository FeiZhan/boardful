/**
 * Define the BOARDFUL namespace.
 *
 * @author		Fei Zhan
 * @version		0.0
 * 
**/

// namespace
var BOARDFUL = BOARDFUL || new Object();

// run
BOARDFUL.run = function (config) {
	BOARDFUL.init();
	BOARDFUL.Mngr = new BOARDFUL.ENGINE.Manager();
	BOARDFUL.loadBoards();
	BOARDFUL.Logger.log('info', "start type", config);
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
	BOARDFUL.Debugger = new BOARDFUL.ENGINE.Logger();
	BOARDFUL.Debugger.add(winston.transports.File, {
		filename: 'logs/debug.log'
	})
	.remove(winston.transports.Console);

	BOARDFUL.Logger.log('info', "environment", BOARDFUL.ENGINE.Envi);
	BOARDFUL.Debugger.log('info', "start");
	BOARDFUL.ENGINE.initFileMngr();
	if ("browser" == BOARDFUL.ENGINE.Envi.type) {
		BOARDFUL.urlparam = BOARDFUL.ENGINE.parseUrl();
		BOARDFUL.Logger.log('info', "url param", BOARDFUL.urlparam);
		BOARDFUL.ENGINE.getFilesInHtml();
	}
};
// board game list
BOARDFUL.BoardList = new Array();
// load board game list
BOARDFUL.loadBoards = function () {
	console.log("loading Boardful");
	var load_files = new BOARDFUL.ENGINE.FileLoader(["src/engine/gamelist.json"], function () {
		var board_list = BOARDFUL.ENGINE.FileList[BOARDFUL.ENGINE.FileNameList["src/engine/gamelist.json"]].content.games;
		for (var i in board_list) {
			BOARDFUL.BoardList.push(new BOARDFUL.ENGINE.Board(board_list[i]));
		}
	});
	
};
