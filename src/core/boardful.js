/**
 * Define the BOARDFUL namespace.
 *
 * @author		Fei Zhan
 * @version		0.0
 * 
**/

// namespace
var BOARDFUL = BOARDFUL || new Object();
// if nodejs, export as module
if (typeof module !== 'undefined' && module.exports) {
	module.exports = BOARDFUL;
	var $ = require('jquery');
	var _ = require("underscore");
}
BOARDFUL.MODS = BOARDFUL.MODS || new Object();

// init
BOARDFUL.init = function (config) {
	BOARDFUL.CORE.checkEnvi();
	// create logger
	BOARDFUL.Logger = new BOARDFUL.CORE.Logger();
	BOARDFUL.Logger.add(winston.transports.File, {
		//filename: 'logs/boardful_' + new Date().toString() + '.log'
		filename: 'logs/boardful.log'
	})
	.remove(winston.transports.Console);
	BOARDFUL.Logger.log('info', "----------launch----------");
	// create debug logger
	BOARDFUL.Debugger = new BOARDFUL.CORE.Logger();
	BOARDFUL.Debugger.add(winston.transports.File, {
		filename: 'logs/debug.log'
	})
	.remove(winston.transports.Console);
	BOARDFUL.Debugger.log('info', "----------launch----------");

	BOARDFUL.Logger.log('info', "launch type", config);
	BOARDFUL.Logger.log('info', "environment", BOARDFUL.CORE.Envi);
	BOARDFUL.CORE.File.init();
	if ("browser" == BOARDFUL.CORE.Envi.type) {
		BOARDFUL.urlparam = BOARDFUL.CORE.parseUrl();
		BOARDFUL.Logger.log('info', "url param", BOARDFUL.urlparam);
		BOARDFUL.CORE.File.getFromHtml();
	}
	BOARDFUL.Mngr = new BOARDFUL.CORE.Manager();
	BOARDFUL.loadBoards();
};
// board game list
BOARDFUL.BoardList = new Array();
// load board game list
BOARDFUL.loadBoards = function () {
	var BOARD_LIST_FILE = "src/core/boardlist.json";
	var load_files = new BOARDFUL.CORE.FileLoader([BOARD_LIST_FILE], function () {
		var board_list = BOARDFUL.CORE.File.list[BOARDFUL.CORE.File.name_list[BOARD_LIST_FILE]].content.boards;
		for (var i in board_list) {
			BOARDFUL.BoardList.push(new BOARDFUL.CORE.Board(board_list[i]).id);
		}
	});
};
