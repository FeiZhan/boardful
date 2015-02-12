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
	$("#" + BOARDFUL.BRSR.Canvas).addClass("boardful");
	$('#header #options').click(function () {
		$("#dialog").toggleClass("active");
	});
	$('#header #sound').click(function () {
		$(this).toggleClass("disable");
	});
	BOARDFUL.BRSR.loadOptions();
	BOARDFUL.BRSR.loadMenu0();
};
BOARDFUL.BRSR.loadOptions = function () {
	$("#dialog").empty();
	$("#dialog").load("src/browser/options.html", function () {
		$('#dialog #options_debug').click(function () {
			$('#dialog > div').removeClass("active");
			$('#dialog #options_l1_debug').addClass("active");
		});
		$('#dialog #options_l1_debug li').click(function () {
			$('#dialog #options_l1_debug li').removeClass("active");
			$(this).addClass("active");
			var id = $(this).attr("id");
			var log_list = new Array();
			switch (id) {
			case "debug_logger":
				log_list = BOARDFUL.Logger.list;
				break;
			case "debug_debugger":
				log_list = BOARDFUL.Debugger.list;
				break;
			case "debug_files":
				log_list = BOARDFUL.CORE.File.logger.list;
				break;
			case "debug_objects":
				log_list = BOARDFUL.Mngr.logger.list;
				break;
			case "debug_events":
				log_list = new Array();
				var board = BOARDFUL.Mngr.get(BOARDFUL.BRSR.Selected);
				if (board) {
					var room = BOARDFUL.Mngr.get(board.room_list[0]);
					if (room) {
						var game = BOARDFUL.Mngr.get(room.game_list[0]);
						if (game) {
							log_list = game.event_mngr.logger.list;
						}
					}
				}
				break;
			case "debug_event_names":
				log_list = new Array();
				var board = BOARDFUL.Mngr.get(BOARDFUL.BRSR.Selected);
				if (board) {
					var room = BOARDFUL.Mngr.get(board.room_list[0]);
					if (room) {
						var game = BOARDFUL.Mngr.get(room.game_list[0]);
						if (game) {
							log_list = game.event_mngr.name_logger.list;
						}
					}
				}
				break;
			default:
				log_list = new Array();
				break;
			}
			$('#dialog #options_debug_log').empty();
			for (var i in log_list) {
				$('#dialog #options_debug_log').append('<div>' + log_list[i].content + '</div>');
			}
		});
	});
	var load = new BOARDFUL.CORE.FileLoader(["src/browser/options.html", "src/browser/options.css"], function () {});
};

BOARDFUL.BRSR.loadMenu0 = function () {
	$("#" + BOARDFUL.BRSR.Canvas).empty();
	// load menu0
	$("#" + BOARDFUL.BRSR.Canvas).hide().load("src/browser/menu0.html", function () {
		$(this).fadeIn("slow");
		$("#" + BOARDFUL.BRSR.Canvas + ' #menu0_main #local').click(function () {
			BOARDFUL.BRSR.loadMenu1();
		});
		$("#" + BOARDFUL.BRSR.Canvas + ' #menu0_secondary #options').click(function () {
			$("#dialog").toggleClass("active");
		});
	});
	var load = new BOARDFUL.CORE.FileLoader(["src/browser/menu0.html", "src/browser/menu0.css"], function () {});
};

BOARDFUL.BRSR.Selected = undefined;
// load menu1
BOARDFUL.BRSR.loadMenu1 = function () {
	$("#" + BOARDFUL.BRSR.Canvas).empty();
	$("#" + BOARDFUL.BRSR.Canvas).hide().load("src/browser/menu1.html", function () {
		$(this).fadeIn("slow");
		$("#" + BOARDFUL.BRSR.Canvas + " #ok").click(function () {
			if (undefined === BOARDFUL.BRSR.Selected) {
				return;
			}
			var board = BOARDFUL.Mngr.get(BOARDFUL.BRSR.Selected);
			board.load(BOARDFUL.BRSR.loadMenu2);
		});
		$("#" + BOARDFUL.BRSR.Canvas + " #exit").click(function () {
			BOARDFUL.BRSR.run(BOARDFUL.BRSR.Canvas);
		});
		for (var i in BOARDFUL.BoardList) {
			var board = BOARDFUL.Mngr.get(BOARDFUL.BoardList[i]);
			$("#" + BOARDFUL.BRSR.Canvas + " #board_list ul").append('<li id="' + BOARDFUL.BoardList[i] + '">' + board.config.name + "</li>");
			if (0 == i) {
				BOARDFUL.BRSR.Selected = $("#" + BOARDFUL.BRSR.Canvas + " #board_list ul li:last").attr("id");
				$("#" + BOARDFUL.BRSR.Canvas + " #board_list ul li:last").addClass("active");
				$("#" + BOARDFUL.BRSR.Canvas + " #description div").html(BOARDFUL.Mngr.get(BOARDFUL.BRSR.Selected).config.description);
			}
			$("#" + BOARDFUL.BRSR.Canvas + " #board_list ul li:last").click(function () {
				BOARDFUL.BRSR.Selected = $(this).attr('id');
				$("#" + BOARDFUL.BRSR.Canvas + " #board_list li").removeClass("active");
				$(this).addClass("active");
				$("#" + BOARDFUL.BRSR.Canvas + " #description div").html(BOARDFUL.Mngr.get(BOARDFUL.BRSR.Selected).config.description);
			});
		}
	});
	var load = new BOARDFUL.CORE.FileLoader(["src/browser/menu1.html", "src/browser/menu1.css"], function () {});
};
// load menu2
BOARDFUL.BRSR.loadMenu2 = function (id) {
	var room = BOARDFUL.Mngr.get(id);
	$("#" + BOARDFUL.BRSR.Canvas).empty();
	$("#" + BOARDFUL.BRSR.Canvas).hide().load("src/browser/menu2.html", function () {
		$(this).fadeIn("slow");
		$("#" + BOARDFUL.BRSR.Canvas + " #ok").on("click", function () {
			var game = new BOARDFUL.CORE.Game(id);
			game.ui = new BOARDFUL.BRSR.GameUi(game.id);
			game.run();
		});
		$("#" + BOARDFUL.BRSR.Canvas + " #exit").click(function () {
			BOARDFUL.BRSR.run(BOARDFUL.BRSR.Canvas);
		});
		$("#" + BOARDFUL.BRSR.Canvas + " #room_config li").on("click", function () {
			$("#" + BOARDFUL.BRSR.Canvas + " #room_config li").removeClass("active");
			$("#" + BOARDFUL.BRSR.Canvas + " #room_config div").removeClass("active");
			$(this).addClass("active");
			$("#" + BOARDFUL.BRSR.Canvas + " #room_config div#" + $(this).attr("id")).addClass("active");
		});
		$("#" + BOARDFUL.BRSR.Canvas + " #room_config #name").html(room.config.name);
		$("#" + BOARDFUL.BRSR.Canvas + " #room_config #description2").html(room.config.description);
		$("#" + BOARDFUL.BRSR.Canvas + " #user_list #players").append('<div class="user"><span>me</span></div>');
		$("#" + BOARDFUL.BRSR.Canvas + " #user_list #judges").append('<div class="user"><span>empty</span></div>');
		$("#" + BOARDFUL.BRSR.Canvas + " #user_list #audience").append('<div class="user"><span>empty</span></div>');
		for (var i = 1; i < room.config.players[0]; ++ i) {
			$("#" + BOARDFUL.BRSR.Canvas + " #user_list #players").append('<div class="user"><span>empty</span></div>');
		}
		$("#" + BOARDFUL.BRSR.Canvas + " #user_list .user").on("click", function () {
			$("#" + BOARDFUL.BRSR.Canvas + " #user_list .user").removeClass("active");
			$(this).addClass("active");
		});
		for (var i in room.config.options) {
			$("#" + BOARDFUL.BRSR.Canvas + " #room_config").append('<div id="' + i + '"></div>');
			$("#" + BOARDFUL.BRSR.Canvas + " #room_config #" + i).append('<span>' + i + '</span><select></select>');
			for (var j in room.config.options[i].value) {
				$("#" + BOARDFUL.BRSR.Canvas + " #room_config #" + i + " select").append('<option value="' + room.config.options[i].value[j] + '">' + room.config.options[i].value[j] + '</option>');
			}
		}
	});
	var load = new BOARDFUL.CORE.FileLoader(["src/browser/menu2.html", "src/browser/menu2.css"], function () {});
};
