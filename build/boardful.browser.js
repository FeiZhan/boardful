/**
 * Gui for card.
 *
 * @author		Fei Zhan
 * @version		0.0
**/

var BOARDFUL = BOARDFUL || new Object();
BOARDFUL.BRSR = BOARDFUL.BRSR || new Object();

// gui for card
BOARDFUL.BRSR.CardUi = function (instance, owner) {
	this.type = "CardUi";
	this.instance = instance;
	this.owner = owner;
	BOARDFUL.Mngr.add(this);
	var load_files = new BOARDFUL.CORE.FileLoader(["src/browser/card.html", "src/browser/card.css"], function () {
	});
};
// display card
BOARDFUL.BRSR.CardUi.prototype.load = function (config, callback) {
	config = config || new Object();
	config.parent = config.parent || "";
	var that = this;
	// get card html
	$.get("src/browser/card.html", function (text, status, xhr) {
		// add html to page
		$("#content " + config.parent).append(text);
		$("#content " + config.parent + " .card:last").attr("id", that.id);
		var card_jq = $("#content #" + that.id);
		// set position
		if (config.position) {
			card_jq.css(config.position);
		}
		// set name
		card_jq.find("h4").html(BOARDFUL.Mngr.get(that.instance).name);
		var flip_interval;
		// draggable
		card_jq.draggable({
			start: function() {
				// flip card when dragging
				flip_interval = setInterval(function () {
					card_jq.toggleClass("flip");
				}, 2000);
			},
			drag: function() {},
			stop: function (event, ui) {
				clearInterval(flip_interval);
				card_jq.removeClass("flip");
				// expand and disappear
				card_jq.animate({
					top: '-=100px',
					left: '-=100px',
					height: '+=200px',
					width: '+=200px',
					opacity: 0,
				}, "slow", function () {
					$(this).remove();
				});
			},
		});
		card_jq.hover(function () {
			// move to front
			$(this).css("z-index", 1);
		}, function () {
			// move back
			$(this).css("z-index", 0);
		});
		if ("function" == typeof callback) {
			callback(card_jq);
		}
	});
};
// move card
BOARDFUL.BRSR.CardUi.prototype.move = function (config) {
	var jq = $("#content #" + this.id);
	// if not exist, load card
	if (0 == jq.length) {
		var that = this;
		this.load({
			position: {
				top: "50%",
				left: "80%"
			}
		}, function () {
			that.move(config);
		});
	} else {
		// move card
		jq.animate({
			top: config.position.top,
			left: config.position.left
		}, "slow", function () {
			jq.css({
				top: 0,
				left: 0
			});
			var element = jq.detach();
			$('#content #myhand').append(element);
		});
	}
};
/**
 * Gui for game.
 *
 * @author		Fei Zhan
 * @version		0.0
**/

var BOARDFUL = BOARDFUL || new Object();
BOARDFUL.BRSR = BOARDFUL.BRSR || new Object();

BOARDFUL.BRSR.GameUi = function (owner) {
	this.type = "GameUi";
	this.owner = owner;
	BOARDFUL.Mngr.add(this);
	BOARDFUL.CORE.Command.owner = this.owner;
	this.addListeners();
	$("#content").empty();
	$("#content").load("src/browser/game.html", function () {
		$("#content #ok").on("click", function () {
		});
	});
	this.player_list = new Array();
	for (var i in BOARDFUL.Mngr.get(this.owner).player_list) {
		this.player_list.push(new BOARDFUL.BRSR.PlayerUi(BOARDFUL.Mngr.get(this.owner).player_list[i]).id);
	}
	var load_files = new BOARDFUL.CORE.FileLoader(["src/browser/game.html", "src/browser/game.css"], function () {
	});
};
BOARDFUL.BRSR.GameUi.prototype.addListeners = function () {
	var that = this;
	BOARDFUL.Mngr.get(this.owner).event_mngr.on("DealCardUi", {
		level: "game",
		callback: function (arg) {
			that.dealCardUi(arg);
		},
		id: that.id
	});
};

BOARDFUL.BRSR.GameUi.prototype.dealCardUi = function (arg) {
	var card = new BOARDFUL.BRSR.CardUi(arg.card, this);
	card.move({
		position: {
			top: "65%",
			left: "50%"
		}
	});
};
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
			if ($("#dialog").dialog("isOpen")) {
				$("#dialog").dialog("close");
			} else {
				$("#dialog").dialog("open");
			}
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

/**
 * Gui for player.
 *
 * @author		Fei Zhan
 * @version		0.0
**/

var BOARDFUL = BOARDFUL || new Object();
BOARDFUL.BRSR = BOARDFUL.BRSR || new Object();

BOARDFUL.BRSR.PlayerUi = function (owner) {
	this.type = "PlayerUi";
	this.owner = owner;
	BOARDFUL.Mngr.add(this);
	var load;
	switch (BOARDFUL.Mngr.get(this.owner).name) {
	case "ai":
		load = "src/browser/player_you.html";
		break;
	case "me":
	default:
		load = "src/browser/player_me.html";
		break;
	}
	$.get(load, function (text, status, xhr) {
		$("#content").append(text);
	});
	var load_files = new BOARDFUL.CORE.FileLoader(["src/browser/player_me.html", "src/browser/player_you.html", "src/browser/player.css"], function () {});
};