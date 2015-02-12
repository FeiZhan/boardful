/**
 * Gui for player.
 *
 * @author		Fei Zhan
 * @version		0.0
**/

var BOARDFUL = BOARDFUL || new Object();

// gui for player
BOARDFUL.PlayerUi = function (instance, owner) {
	this.type = "PlayerUi";
	this.instance = instance;
	this.owner = owner;
	BOARDFUL.Mngr.add(this);
	this.canvas = "";
	var load;
	switch (BOARDFUL.Mngr.get(this.instance).name) {
	case "ai":
		load = "src/browser/player_you.html";
		this.canvas = "player_you";
		break;
	case "me":
	default:
		load = "src/browser/player_me.html";
		this.canvas = "player_me";
		break;
	}
	this.addListeners();
	this.play_card_arg = undefined;
	$.get(load, function (text, status, xhr) {
		$("#" + BOARDFUL.Menu.Canvas).append(text).fadeIn('slow');
	});
	var load_files = new BOARDFUL.FileLoader(["src/browser/player_me.html", "src/browser/player_you.html", "src/browser/player.css"], function () {});
};
// 
BOARDFUL.PlayerUi.prototype.playerOk = function () {
	if ("me" != BOARDFUL.Mngr.get(this.instance).name || "userinput" != BOARDFUL.Mngr.get(BOARDFUL.Mngr.get(this.instance).owner).status || undefined === this.play_card_arg) {
		return;
	}
	var card_list = new Array();
	$("#" + BOARDFUL.Menu.Canvas + " #table .card").each(function () {
		var card_ui = parseInt($(this).attr("id"));
		var card = BOARDFUL.Mngr.get(card_ui).instance;
		if ("me" == BOARDFUL.Mngr.get(BOARDFUL.Mngr.get(BOARDFUL.Mngr.get(card).owner).owner).name) {
			card_list.push(card);
		}
	});
	if (card_list.length != this.play_card_arg.number) {
		return;
	}
	var event = new BOARDFUL.Event({
		name: "PlaceCardOnTable",
		source: this.instance,
		source_event: this.play_card_arg.source_event,
		player: this.instance,
		cards: card_list
	});
	BOARDFUL.Mngr.get(BOARDFUL.Mngr.get(this.instance).owner).event_mngr.front(event.id);
	BOARDFUL.Mngr.get(BOARDFUL.Mngr.get(this.instance).owner).status = "run";
};

BOARDFUL.PlayerUi.prototype.addListeners = function () {
	var that = this;
	BOARDFUL.Mngr.get(BOARDFUL.Mngr.get(this.instance).owner).event_mngr.on("PlayCardUi", {
		level: "game",
		callback: function (arg) {
			that.playCardUi(arg);
		},
		id: that.id
	});
	BOARDFUL.Mngr.get(BOARDFUL.Mngr.get(this.instance).owner).event_mngr.on("ChangePlayerValueUi", {
		level: "game",
		callback: function (arg) {
			that.changePlayerValueUi(arg);
		},
		id: that.id
	});
};
// ui for deal cards
BOARDFUL.PlayerUi.prototype.playCardUi = function (arg) {
	if (arg.player != this.instance) {
		return;
	}
	this.play_card_arg = arg;
	BOARDFUL.Mngr.get(BOARDFUL.Mngr.get(this.instance).owner).status = "userinput";
};

BOARDFUL.PlayerUi.prototype.changePlayerValueUi = function (arg) {
	if (arg.player != this.instance) {
		return;
	}
	var target_jq = $("#" + this.canvas + " .head #" + arg.target + " span");
	var value = parseInt(target_jq.html());
	target_jq.html(value + arg.value);
	var cv = new BOARDFUL.ChangedValue({
		source_jq: target_jq,
		value: arg.value,
	}, this.id);
};