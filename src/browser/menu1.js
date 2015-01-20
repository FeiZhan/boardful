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
