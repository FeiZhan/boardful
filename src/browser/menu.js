/**
 * Menus.
 *
 * @author		Fei Zhan
 * @version		0.0
**/

var BOARDFUL = BOARDFUL || new Object();

BOARDFUL.Menu = BOARDFUL.Menu || new Object();
BOARDFUL.Menu.Canvas = "";
// launch in browser
BOARDFUL.Menu.run = function (canvas) {
	BOARDFUL.Menu.Canvas = canvas;
	$("#" + BOARDFUL.Menu.Canvas).addClass("boardful");
	$('#header #options').click(function () {
		$("#dialog").toggleClass("active");
	});
	$('#header #sound').click(function () {
		$(this).toggleClass("disable");
	});
	BOARDFUL.Menu.loadOptions();
	BOARDFUL.Menu.loadMenu0();
};
BOARDFUL.Menu.loadOptions = function () {
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
				log_list = BOARDFUL.logger.list;
				break;
			case "debug_debugger":
				log_list = BOARDFUL.Debugger.list;
				break;
			case "debug_files":
				log_list = BOARDFUL.File.logger.list;
				break;
			case "debug_objects":
				log_list = BOARDFUL.Mngr.logger.list;
				break;
			case "debug_events":
				log_list = new Array();
				var board = BOARDFUL.Mngr.get(BOARDFUL.Menu.Selected);
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
				var board = BOARDFUL.Mngr.get(BOARDFUL.Menu.Selected);
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
	var load = new BOARDFUL.FileLoader(["src/browser/options.html", "src/browser/options.css"], function () {});
};

BOARDFUL.Menu.loadMenu0 = function () {
	$("#" + BOARDFUL.Menu.Canvas).empty();
	// load menu0
	$("#" + BOARDFUL.Menu.Canvas).hide().load("src/browser/menu0.html", function () {
		$(this).fadeIn("slow");
		$("#" + BOARDFUL.Menu.Canvas + ' #menu0_main #local').click(function () {
			BOARDFUL.Menu.loadMenu1();
		});
		$("#" + BOARDFUL.Menu.Canvas + ' #menu0_secondary #options').click(function () {
			$("#dialog").toggleClass("active");
		});
	});
	var load = new BOARDFUL.FileLoader(["src/browser/menu0.html", "src/browser/menu0.css"], function () {});
};

BOARDFUL.Menu.Selected = undefined;
// load menu1
BOARDFUL.Menu.loadMenu1 = function () {
	$("#" + BOARDFUL.Menu.Canvas).empty();
	$("#" + BOARDFUL.Menu.Canvas).hide().load("src/browser/menu1.html", function () {
		$(this).fadeIn("slow");
		$("#" + BOARDFUL.Menu.Canvas + " #ok").click(function () {
			if (undefined === BOARDFUL.Menu.Selected) {
				return;
			}
			var board = BOARDFUL.Mngr.get(BOARDFUL.Menu.Selected);
			board.load(BOARDFUL.Menu.loadMenu2);
		});
		$("#" + BOARDFUL.Menu.Canvas + " #exit").click(function () {
			BOARDFUL.Menu.run(BOARDFUL.Menu.Canvas);
		});
		for (var i in BOARDFUL.BoardList) {
			var board = BOARDFUL.Mngr.get(BOARDFUL.BoardList[i]);
			$("#" + BOARDFUL.Menu.Canvas + " #board_list ul").append('<li id="' + BOARDFUL.BoardList[i] + '">' + board.config.name + "</li>");
			if (0 == i) {
				BOARDFUL.Menu.Selected = $("#" + BOARDFUL.Menu.Canvas + " #board_list ul li:last").attr("id");
				$("#" + BOARDFUL.Menu.Canvas + " #board_list ul li:last").addClass("active");
				$("#" + BOARDFUL.Menu.Canvas + " #description div").html(BOARDFUL.Mngr.get(BOARDFUL.Menu.Selected).config.description);
			}
			$("#" + BOARDFUL.Menu.Canvas + " #board_list ul li:last").click(function () {
				BOARDFUL.Menu.Selected = $(this).attr('id');
				$("#" + BOARDFUL.Menu.Canvas + " #board_list li").removeClass("active");
				$(this).addClass("active");
				$("#" + BOARDFUL.Menu.Canvas + " #description div").html(BOARDFUL.Mngr.get(BOARDFUL.Menu.Selected).config.description);
			});
		}
	});
	var load = new BOARDFUL.FileLoader(["src/browser/menu1.html", "src/browser/menu1.css"], function () {});
};
// load menu2
BOARDFUL.Menu.loadMenu2 = function (id) {
	var room = BOARDFUL.Mngr.get(id);
	$("#" + BOARDFUL.Menu.Canvas).empty();
	$("#" + BOARDFUL.Menu.Canvas).hide().load("src/browser/menu2.html", function () {
		$(this).fadeIn("slow");
		$("#" + BOARDFUL.Menu.Canvas + " #ok").on("click", function () {
			var game = new BOARDFUL.Game(id);
			game.ui = new BOARDFUL.GameUi(game.id);
			game.run();
		});
		$("#" + BOARDFUL.Menu.Canvas + " #exit").click(function () {
			BOARDFUL.Menu.run(BOARDFUL.Menu.Canvas);
		});
		$("#" + BOARDFUL.Menu.Canvas + " #room_config li").on("click", function () {
			$("#" + BOARDFUL.Menu.Canvas + " #room_config li").removeClass("active");
			$("#" + BOARDFUL.Menu.Canvas + " #room_config div").removeClass("active");
			$(this).addClass("active");
			$("#" + BOARDFUL.Menu.Canvas + " #room_config div#" + $(this).attr("id")).addClass("active");
		});
		$("#" + BOARDFUL.Menu.Canvas + " #room_config #name").html(room.config.name);
		$("#" + BOARDFUL.Menu.Canvas + " #room_config #description2").html(room.config.description);
		$("#" + BOARDFUL.Menu.Canvas + " #user_list #players").append('<div class="user"><span>me</span></div>');
		$("#" + BOARDFUL.Menu.Canvas + " #user_list #judges").append('<div class="user"><span>empty</span></div>');
		$("#" + BOARDFUL.Menu.Canvas + " #user_list #audience").append('<div class="user"><span>empty</span></div>');
		for (var i = 1; i < room.config.players[0]; ++ i) {
			$("#" + BOARDFUL.Menu.Canvas + " #user_list #players").append('<div class="user"><span>empty</span></div>');
		}
		$("#" + BOARDFUL.Menu.Canvas + " #user_list .user").on("click", function () {
			$("#" + BOARDFUL.Menu.Canvas + " #user_list .user").removeClass("active");
			$(this).addClass("active");
		});
		for (var i in room.config.options) {
			$("#" + BOARDFUL.Menu.Canvas + " #room_config").append('<div id="' + i + '"></div>');
			$("#" + BOARDFUL.Menu.Canvas + " #room_config #" + i).append('<span>' + i + '</span><select></select>');
			for (var j in room.config.options[i].value) {
				$("#" + BOARDFUL.Menu.Canvas + " #room_config #" + i + " select").append('<option value="' + room.config.options[i].value[j] + '">' + room.config.options[i].value[j] + '</option>');
			}
		}
	});
	var load = new BOARDFUL.FileLoader(["src/browser/menu2.html", "src/browser/menu2.css"], function () {});
};
