/**
 * Gui for card.
 *
 * @author		Fei Zhan
 * @version		0.0
**/

var BOARDFUL = BOARDFUL || new Object();
BOARDFUL.BRSR = BOARDFUL.BRSR || new Object();

BOARDFUL.BRSR.CardUi = function (instance, owner) {
	this.type = "CardUi";
	this.instance = instance;
	this.owner = owner;
	BOARDFUL.Mngr.add(this);
	var load_files = new BOARDFUL.CORE.FileLoader(["src/browser/card.html", "src/browser/card.css"], function () {
	});
};
BOARDFUL.BRSR.CardUi.prototype.draw = function (config, callback) {
	config = config || new Object();
	config.parent = config.parent || "";
	var that = this;
	$.get("src/browser/card.html", function (text, status, xhr) {
		$("#content " + config.parent).append(text);
		$("#content " + config.parent + " .card:last").attr("id", that.id);
		var card_jq = $("#content #" + that.id);
		if (config.position) {
			card_jq.css(config.position);
		}
		card_jq.find("h4").html(BOARDFUL.Mngr.get(that.instance).name);
		if ("function" == typeof callback) {
			callback(card_jq);
		}
	});
};
BOARDFUL.BRSR.CardUi.prototype.move = function (config) {
	var jq = $("#content #" + this.id);
	if (0 == jq.length) {
		var that = this;
		this.draw({
			position: {
				top: "50%",
				left: "80%"
			}
		}, function () {
			that.move(config);
		});
	} else {
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
	if (this.owner) {
		BOARDFUL.Mngr.add(this);
		BOARDFUL.CORE.Command.owner = this.owner;
	}
	this.addListeners();
	$("#content").empty();
	$("#content").load("src/browser/game.html", function () {
		$("#content #ok").on("click", function () {
		});
	});
	var load_files = new BOARDFUL.CORE.FileLoader(["src/browser/game.html", "src/browser/game.css"], function () {
	});
};
BOARDFUL.BRSR.GameUi.prototype.addListeners = function () {
	var that = this;
	BOARDFUL.Mngr.get(this.owner).event_mngr.on("DealCardsUi", {
		level: "game",
		callback: function (arg) {
			that.dealCardsUi(arg);
		},
		id: that.id
	});
};

BOARDFUL.BRSR.GameUi.prototype.dealCardsUi = function (arg) {
	console.log("deal cards", arg.cards);
	for (var i in arg.cards) {
		var card = new BOARDFUL.BRSR.CardUi(arg.cards[i], this);
		card.move({
			position: {
				top: "65%",
				left: "50%"
			}
		});
	}
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
	var load = new BOARDFUL.CORE.FileLoader(["src/browser/menu0.html", "src/browser/menu0.css"], function () {});
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
	var load = new BOARDFUL.CORE.FileLoader(["src/browser/menu1.html", "src/browser/menu1.css"], function () {});
};
// load menu2
BOARDFUL.BRSR.loadMenu2 = function (id) {
	var room = BOARDFUL.Mngr.get(id);
	$("#content").empty();
	$("#content").load("src/browser/menu2.html", function () {
		$("#content button#ok").on("click", function () {
			var game = new BOARDFUL.CORE.Game(room);
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
	var load = new BOARDFUL.CORE.FileLoader(["src/browser/menu2.html", "src/browser/menu2.css"], function () {});
};
