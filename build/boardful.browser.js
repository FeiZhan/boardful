
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

/**
* Loader of menus.
*
* @author  Fei Zhan
* @version 0.0
*/

var BOARDFUL = BOARDFUL || new Object();
BOARDFUL.MENUS = BOARDFUL.MENUS || new Object();

BOARDFUL.MENUS.GamePackage = new Object();
BOARDFUL.MENUS.roomStart = function (game) {
	$("#content").empty();
	$("#content").load("src/browser/menu1.html");
	var load_files = new BOARDFUL.ENGINE.loadFileList(["src/browser/menu1.css", game.package], function () {
		BOARDFUL.MENUS.GamePackage = BOARDFUL.ENGINE.FileList[BOARDFUL.ENGINE.FileNameList[game.package]].content;
		BOARDFUL.MENUS.setRoom(BOARDFUL.MENUS.GamePackage);
	});
};
BOARDFUL.MENUS.setRoom = function (package) {
	$("#content button#ok").on("click", function () {
		BOARDFUL.GAME.init(BOARDFUL.MENUS.GamePackage);
	});
	$("#content #name").html(package.name);
	$("#content #descrip1").html(package.descrip);
	$("#content #players").append("<div><span>me</span></div>");
	for (var i = 1; i < package.max_players; ++ i) {
		$("#content #players").append("<div><span>empty</span></div>");
	}
	for (var i in package.options) {
		$("#content #options").append('<div id="' + i + '"></div>');
		$("#content #options #" + i).append('<span>' + i + '</span><select></select>');
		for (var j in package.options[i].value) {
			$("#content #options #" + i + " select").append('<option value="' + package.options[i].value[j] + '">' + package.options[i].value[j] + '</option>');
		}
	}
};

