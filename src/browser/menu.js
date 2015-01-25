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
	$("#content").empty();
	$("#content").load("src/browser/menu1.html", function () {
		$("#content button#ok").click(function () {
			if (undefined === BOARDFUL.BRSR.Selected) {
				return;
			}
			var board = BOARDFUL.Mngr.get(BOARDFUL.BRSR.Selected);
			board.load(BOARDFUL.BRSR.loadMenu2);
		});
		for (var i in BOARDFUL.BoardList) {
			var board = BOARDFUL.Mngr.get(BOARDFUL.BoardList[i]);
			$("#content #boardlist ul").append('<li id="' + BOARDFUL.BoardList[i] + '">' + board.config.name + "</li>");
			$("#content #boardlist ul li:last").click(function () {
				BOARDFUL.BRSR.Selected = $(this).attr('id');
				$("#content #boardlist li").removeClass("active");
				$(this).addClass("active");
				$("#content #descrip").html(BOARDFUL.Mngr.get(BOARDFUL.BRSR.Selected).config.descrip);
			});
		}
	});
	var load = new BOARDFUL.ENGINE.FileLoader(["src/browser/menu1.html", "src/browser/menu1.css"], function () {});
};
// load menu2
BOARDFUL.BRSR.loadMenu2 = function (id) {
	var room = BOARDFUL.Mngr.get(id);
	$("#content").empty();
	$("#content").load("src/browser/menu2.html", function () {
		$("#content button#ok").on("click", function () {
			var game = new BOARDFUL.ENGINE.Game(room);
			game.ui = new BOARDFUL.BRSR.GameUi(game.id);
			game.run();
		});
		$("#content #name").html(room.config.name);
		$("#content #descrip1").html(room.config.descrip);
		$("#content #players").append("<div><span>me</span></div>");
		for (var i = 1; i < room.config.max_players; ++ i) {
			$("#content #players").append("<div><span>empty</span></div>");
		}
		for (var i in room.config.options) {
			$("#content #roomoptions").append('<div id="' + i + '"></div>');
			$("#content #roomoptions #" + i).append('<span>' + i + '</span><select></select>');
			for (var j in room.options[i].value) {
				$("#content #roomoptions #" + i + " select").append('<option value="' + room.config.options[i].value[j] + '">' + room.options[i].value[j] + '</option>');
			}
		}
	});
	var load = new BOARDFUL.ENGINE.FileLoader(["src/browser/menu2.html", "src/browser/menu2.css"], function () {});
};
