/**
 * Gui for game.
 *
 * @author		Fei Zhan
 * @version		0.0
**/

var BOARDFUL = BOARDFUL || new Object();

// game ui
BOARDFUL.GameUi = function (instance) {
	this.type = "GameUi";
	this.instance = instance;
	BOARDFUL.Mngr.add(this);
	BOARDFUL.Command.owner = this.instance;
	this.addListeners();
	$("#" + BOARDFUL.Menu.Canvas).empty();
	var that = this;
	$("#" + BOARDFUL.Menu.Canvas).hide().load("src/browser/game.html", function () {
		$(this).fadeIn("slow");
		$("#" + BOARDFUL.Menu.Canvas + " #playerok").on("click", function () {
			if ("userinput" != BOARDFUL.Mngr.get(that.instance).status) {
				return;
			}
			for (var i in that.player_list) {
				if ("me" == BOARDFUL.Mngr.get(BOARDFUL.Mngr.get(that.player_list[i]).instance).name) {
					// cannot use event here
					BOARDFUL.Mngr.get(that.player_list[i]).playerOk();
				}
			}
		});
		$("#" + BOARDFUL.Menu.Canvas + " #chat div").on("click", function () {
			$(this).toggleClass("disable");
		});
		$("#" + BOARDFUL.Menu.Canvas + " #table").droppable({
			drop: function (event, ui) {
				that.dropCardOnTable(event, ui, this);
			}
		});
	});
	this.player_list = new Array();
	for (var i in BOARDFUL.Mngr.get(this.instance).player_list) {
		var player = BOARDFUL.Mngr.get(this.instance).player_list[i];
		var player_ui = new BOARDFUL.PlayerUi(player, this.id).id;
		BOARDFUL.Mngr.get(player).ui = player_ui;
		this.player_list.push(player_ui);
	}
	var load_files = new BOARDFUL.FileLoader(["src/browser/game.html", "src/browser/game.css"], function () {
	});
};
BOARDFUL.GameUi.prototype.dropCardOnTable = function (event, ui, droppable) {
	if ("userinput" != BOARDFUL.Mngr.get(this.instance).status) {
		return;
	}
	var element = $(ui.draggable).detach();
	element.css({
		top: "auto",
		left: "auto"
	});
	$(droppable).append(element);
};

BOARDFUL.GameUi.prototype.addListeners = function () {
	var that = this;
	BOARDFUL.Mngr.get(this.instance).event_mngr.on("DealCardUi", {
		level: "game",
		callback: function (arg) {
			that.dealCardUi(arg);
		},
		id: that.id
	});
	BOARDFUL.Mngr.get(this.instance).event_mngr.on("PlaceCardOnTable", {
		level: "game",
		callback: function (arg) {
			that.placeCardOnTable(arg);
		},
		id: that.id
	});
	BOARDFUL.Mngr.get(this.instance).event_mngr.on("Discard", {
		level: "game",
		callback: function (arg) {
			that.discard(arg);
		},
		id: that.id
	});
};
// ui for deal cards
BOARDFUL.GameUi.prototype.dealCardUi = function (arg) {
	var card_ui = new BOARDFUL.CardUi(arg.card, this);
	BOARDFUL.Mngr.get(arg.card).ui = card_ui.id;
	var target;
	switch (BOARDFUL.Mngr.get(arg.player).name) {
	case "ai":
		target = $("#player_you .hand");
		break;
	case "me":
	default:
		card_ui.visible = true;
		target = $("#player_me .hand");
		break;
	}
	card_ui.move($("#deck"), target);
};
BOARDFUL.GameUi.prototype.placeCardOnTable = function (arg) {
	for (var i in arg.cards) {
		var card_ui = BOARDFUL.Mngr.get(BOARDFUL.Mngr.get(arg.cards[i]).ui);
		card_ui.move(undefined, $("#table"));
	}
};
// discard
BOARDFUL.GameUi.prototype.discard = function (arg) {
	for (var i in arg.cards) {
		BOARDFUL.Mngr.get(BOARDFUL.Mngr.get(arg.cards[i]).ui).remove();
	}
};