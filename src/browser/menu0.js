/**
* Loader of menus.
*
* @author  Fei Zhan
* @version 0.0
*/

var BOARDFUL = BOARDFUL || new Object();
BOARDFUL.MENUS = BOARDFUL.MENUS || new Object();

BOARDFUL.MENUS.GameList = new Object();
BOARDFUL.MENUS.run = function () {
	$("#content").empty();
	$("#content").load("src/browser/menu0.html");
	var load_files = new BOARDFUL.ENGINE.loadFileList(["src/browser/menu0.css", "src/engine/gamelist.json"], function () {
		BOARDFUL.MENUS.GameList = BOARDFUL.ENGINE.FileList[BOARDFUL.ENGINE.FileNameList["src/engine/gamelist.json"]].content.games;
		BOARDFUL.MENUS.loadGameList(BOARDFUL.MENUS.GameList);
	});
};
BOARDFUL.MENUS.Selected = undefined;
BOARDFUL.MENUS.loadGameList = function (list) {
	$("#content button#ok").click(function () {
		if (undefined === BOARDFUL.MENUS.Selected || ! (BOARDFUL.MENUS.Selected in BOARDFUL.MENUS.GameList)) {
			return;
		}
		BOARDFUL.MENUS.roomStart(BOARDFUL.MENUS.GameList[BOARDFUL.MENUS.Selected]);
	});
	for (var i in list) {
		$("#content #gamelist ul").append('<li id="' + i + '">' + list[i].name + "</li>");
		$("#content #gamelist ul li:last").click(function () {
			BOARDFUL.MENUS.Selected = $(this).attr('id');
			$("#content #gamelist li").removeClass("active");
			$(this).addClass("active");
			$("#content #descrip").empty();
			$("#content #descrip").append(list[BOARDFUL.MENUS.Selected].descrip);
		});
	}
};
