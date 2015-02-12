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
	BOARDFUL.checkEnvi();
	// create logger
	BOARDFUL.logger = new BOARDFUL.Logger();
	BOARDFUL.logger.add(winston.transports.File, {
		//filename: 'logs/boardful_' + new Date().toString() + '.log'
		filename: 'logs/boardful.log'
	})
	.remove(winston.transports.Console);
	BOARDFUL.logger.log('info', "----------launch----------");
	// create debug logger
	BOARDFUL.Debugger = new BOARDFUL.Logger();
	BOARDFUL.Debugger.add(winston.transports.File, {
		filename: 'logs/debug.log'
	})
	.remove(winston.transports.Console);
	BOARDFUL.Debugger.log('info', "----------launch----------");

	BOARDFUL.logger.log('info', "launch type", config);
	BOARDFUL.logger.log('info', "environment", BOARDFUL.Envi);
	BOARDFUL.File.init();
	if ("browser" == BOARDFUL.Envi.type) {
		BOARDFUL.urlparam = BOARDFUL.parseUrl();
		BOARDFUL.logger.log('info', "url param", BOARDFUL.urlparam);
		BOARDFUL.File.getFromHtml();
	}
	BOARDFUL.Mngr = new BOARDFUL.Manager();
	BOARDFUL.loadBoards();
};
// board game list
BOARDFUL.BoardList = new Array();
// load board game list
BOARDFUL.loadBoards = function () {
	var BOARD_LIST_FILE = "mods/boardlist.json";
	var load_files = new BOARDFUL.FileLoader([BOARD_LIST_FILE], function () {
		var board_list = BOARDFUL.File.list[BOARDFUL.File.name_list[BOARD_LIST_FILE]].content.boards;
		for (var i in board_list) {
			BOARDFUL.BoardList.push(new BOARDFUL.Board(board_list[i]).id);
		}
	});
};
