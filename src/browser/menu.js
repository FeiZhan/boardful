/**
 * Menus.
 *
 * @author		Fei Zhan
 * @version		0.0
**/

var BOARDFUL = BOARDFUL || new Object();
BOARDFUL.BRSR = BOARDFUL.BRSR || new Object();

// launch in browser
BOARDFUL.BRSR.run = function () {
	$('#header #options').click(function () {
		console.log("options");
	});
	$("#content").empty();
	// load menu0
	$("#content").load("src/browser/menu0.html", function () {
		$('#content #main #local').click(function () {
			BOARDFUL.BRSR.loadMenu1();
		});
		$('#content #secondary #options').click(function () {
			console.log("options");
		});
	});
	var load = new BOARDFUL.ENGINE.FileLoader(["src/browser/menu0.html", "src/browser/menu0.css"], function () {});
};
BOARDFUL.BRSR.Selected = undefined;
// load menu1
BOARDFUL.BRSR.loadMenu1 = function () {
	$("#content").load("src/browser/menu1.html", function () {
		$("#content button#ok").click(function () {
			if (undefined === BOARDFUL.BRSR.Selected || ! (BOARDFUL.BRSR.Selected in BOARDFUL.BRSR.GameList)) {
				return;
			}
			BOARDFUL.BRSR.roomStart(BOARDFUL.BRSR.GameList[BOARDFUL.BRSR.Selected]);
		});
		for (var i in BOARDFUL.BoardList) {
			var board = BOARDFUL.Mngr.get(BOARDFUL.BoardList[i]);
			$("#content #boardlist ul").append('<li id="' + i + '">' + board.name + "</li>");
			$("#content #boardlist ul li:last").click(function () {
				BOARDFUL.BRSR.Selected = $(this).attr('id');
				$("#content #boardlist li").removeClass("active");
				$(this).addClass("active");
				$("#content #descrip").html(board.descrip);
			});
		}
	});
	var load = new BOARDFUL.ENGINE.FileLoader(["src/browser/menu1.html", "src/browser/menu1.css"], function () {});
};
BOARDFUL.BRSR.GamePackage = new Object();
BOARDFUL.BRSR.roomStart = function (game) {
	$("#content").empty();
	$("#content").load("src/browser/menu1.html");
	var load_files = new BOARDFUL.ENGINE.loadFileList(["src/browser/menu1.css", game.package], function () {
		BOARDFUL.BRSR.GamePackage = BOARDFUL.ENGINE.FileList[BOARDFUL.ENGINE.FileNameList[game.package]].content;
		BOARDFUL.BRSR.setRoom(BOARDFUL.BRSR.GamePackage);
	});
};
BOARDFUL.BRSR.setRoom = function (package) {
	$("#content button#ok").on("click", function () {
		BOARDFUL.GAME.init(BOARDFUL.BRSR.GamePackage);
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
