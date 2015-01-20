/**
* Game.
*
* @author  Fei Zhan
* @version 0.0
*/

var BOARDFUL = BOARDFUL || new Object();
BOARDFUL.GAME = BOARDFUL.GAME || new Object();

BOARDFUL.GAME.init = function (config) {
	$("#content").empty();
	$("#content").load("src/browser/game.html");
	var load_files = new BOARDFUL.ENGINE.loadFileList(["src/browser/game.css"], function () {
	});
	$("#content button#ok").on("click", function () {
	});
};
