/**
 * Menus.
 *
 * @author		Fei Zhan
 * @version		0.0
**/

var BOARDFUL = BOARDFUL || new Object();
BOARDFUL.BRSR = BOARDFUL.BRSR || new Object();

// launch in browser
BOARDFUL.BRSR.run = function (canvas) {
	BOARDFUL.BRSR.Canvas = canvas;
	$("#" + canvas).addClass("boardful");
	$("#dialog").dialog({
		autoOpen: false,
		show: {
			effect: "fadeIn",
			duration: 500
		},
		hide: {
			effect: "fadeOut",
			duration: 500
		}
	});
	$('#header #options').click(function () {
		if ($("#dialog").dialog("isOpen")) {
			$("#dialog").dialog("close");
		} else {
			$("#dialog").dialog("open");
		}
	});
	$('#header #sound').click(function () {
		$(this).toggleClass("disable");
	});
	$("#content").empty();
	// load menu0
	$("#content").hide().load("src/browser/menu0.html", function () {
		$(this).fadeIn("slow");
		$('#content #menu0_main #local').click(function () {
			BOARDFUL.BRSR.loadMenu1();
		});
		$('#content #menu0_secondary #options').click(function () {
			$("#dialog").dialog("open");
		});
	});
	var load = new BOARDFUL.CORE.FileLoader(["src/browser/menu0.html", "src/browser/menu0.css"], function () {});
};
BOARDFUL.BRSR.Selected = undefined;
// load menu1
BOARDFUL.BRSR.loadMenu1 = function () {
	$("#content").empty();
	$("#content").hide().load("src/browser/menu1.html", function () {
		$(this).fadeIn("slow");
		$("#content #ok").click(function () {
			if (undefined === BOARDFUL.BRSR.Selected) {
				return;
			}
			var board = BOARDFUL.Mngr.get(BOARDFUL.BRSR.Selected);
			board.load(BOARDFUL.BRSR.loadMenu2);
		});
		$("#content #exit").click(function () {
			BOARDFUL.BRSR.run(BOARDFUL.BRSR.Canvas);
		});
		for (var i in BOARDFUL.BoardList) {
			var board = BOARDFUL.Mngr.get(BOARDFUL.BoardList[i]);
			$("#content #board_list ul").append('<li id="' + BOARDFUL.BoardList[i] + '">' + board.config.name + "</li>");
			if (0 == i) {
				//$("#content #board_list ul li:last").addClass("active");
			}
			$("#content #board_list ul li:last").click(function () {
				BOARDFUL.BRSR.Selected = $(this).attr('id');
				$("#content #board_list li").removeClass("active");
				$(this).addClass("active");
				$("#content #descrip div").html(BOARDFUL.Mngr.get(BOARDFUL.BRSR.Selected).config.descrip);
			});
		}
	});
	var load = new BOARDFUL.CORE.FileLoader(["src/browser/menu1.html", "src/browser/menu1.css"], function () {});
};
// load menu2
BOARDFUL.BRSR.loadMenu2 = function (id) {
	var room = BOARDFUL.Mngr.get(id);
	$("#content").empty();
	$("#content").hide().load("src/browser/menu2.html", function () {
		$(this).fadeIn("slow");
		$("#content #room_config li").on("click", function () {
			$("#content #room_config li").removeClass("active");
			$("#content #room_config div").removeClass("active");
			$(this).addClass("active");
			$("#content #room_config div#" + $(this).attr("id")).addClass("active");
		});
		$("#content #ok").on("click", function () {
			var game = new BOARDFUL.CORE.Game(id);
			game.ui = new BOARDFUL.BRSR.GameUi(game.id);
			game.run();
		});
		$("#content #exit").click(function () {
			BOARDFUL.BRSR.run(BOARDFUL.BRSR.Canvas);
		});
		$("#content #name").html(room.config.name);
		$("#content #description1").html(room.config.descrip);
		$("#content #player_list").append("<div><span>me</span></div>");
		for (var i = 1; i < room.config.max_players; ++ i) {
			$("#content #player_list").append("<div><span>empty</span></div>");
		}
		for (var i in room.config.options) {
			$("#content #room_config").append('<div id="' + i + '"></div>');
			$("#content #room_config #" + i).append('<span>' + i + '</span><select></select>');
			for (var j in room.config.options[i].value) {
				$("#content #room_config #" + i + " select").append('<option value="' + room.config.options[i].value[j] + '">' + room.config.options[i].value[j] + '</option>');
			}
		}
	});
	var load = new BOARDFUL.CORE.FileLoader(["src/browser/menu2.html", "src/browser/menu2.css"], function () {});
};
