/**
 * Define the BOARDFUL namespace.
 *
 * @author		Fei Zhan
 * @version		0.0
 * 
**/

// namespace
var BOARDFUL = BOARDFUL || new Object();
if ('undefined' !== typeof module) {
	module.exports = BOARDFUL;
}
BOARDFUL.MODS = BOARDFUL.MODS || new Object();

// init
BOARDFUL.init = function (config) {
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
	BOARDFUL.Mngr = new BOARDFUL.ENGINE.Manager();
	BOARDFUL.loadBoards();
	BOARDFUL.Logger.log('info', "launch type", config);
};
// board game list
BOARDFUL.BoardList = new Array();
// load board game list
BOARDFUL.loadBoards = function () {
	var load_files = new BOARDFUL.ENGINE.FileLoader(["src/core/gamelist.json"], function () {
		var board_list = BOARDFUL.ENGINE.File.list[BOARDFUL.ENGINE.File.name_list["src/core/gamelist.json"]].content.games;
		for (var i in board_list) {
			BOARDFUL.BoardList.push(new BOARDFUL.ENGINE.Board(board_list[i]).id);
		}
		console.log("loaded Boardful");
	});
	
};