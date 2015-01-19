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
	var load_files = new BOARDFUL.ENGINE.loadFileList(["src/browser/menus.css", "src/engine/gamelist.json"], function () {
		BOARDFUL.MENUS.GameList = BOARDFUL.ENGINE.FileList[BOARDFUL.ENGINE.FileNameList["src/engine/gamelist.json"]].content.games;
		BOARDFUL.MENUS.loadGameList(BOARDFUL.MENUS.GameList);
	});
	$("#content button#ok").on("click", function () {
		if (undefined === BOARDFUL.MENUS.Selected || ! (BOARDFUL.MENUS.Selected in BOARDFUL.MENUS.GameList)) {
			return;
		}
		BOARDFUL.MENUS.roomStart(BOARDFUL.MENUS.GameList[BOARDFUL.MENUS.Selected]);
	});
};
BOARDFUL.MENUS.Selected = undefined;
BOARDFUL.MENUS.loadGameList = function (list) {
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

BOARDFUL.MENUS.GamePackage = new Object();
BOARDFUL.MENUS.roomStart = function (game) {
	$("#content").empty();
	$("#content").load("src/browser/menu1.html");
	var load_files = new BOARDFUL.ENGINE.loadFileList([game.package], function () {
		BOARDFUL.MENUS.GamePackage = BOARDFUL.ENGINE.FileList[BOARDFUL.ENGINE.FileNameList[game.package]].content;
		BOARDFUL.MENUS.setRoom(BOARDFUL.MENUS.GamePackage);
	});
	$("#content button#ok").on("click", function () {
		//BOARDFUL.MENUS.boardStart(BOARDFUL.MENUS.GameList[BOARDFUL.MENUS.Selected]);
	});
};
BOARDFUL.MENUS.setRoom = function (package) {
	
};
