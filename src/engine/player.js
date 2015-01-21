/**
 * Player.
 *
 * @author		Fei Zhan
 * @version		0.0
**/

var BOARDFUL = BOARDFUL || new Object();
BOARDFUL.ENGINE = BOARDFUL.ENGINE || new Object();

// player
BOARDFUL.ENGINE.Player = function (config, owner) {
	this.type = "Player";
	this.owner = owner;
	this.game = BOARDFUL.Mngr.get(this.owner);
	this.hand = new Array();
	this.turn = undefined;
	this.name = undefined;
	switch (config) {
	case "me":
		this.name = "me";
		break;
	case "ai":
		this.name = "ai";
		break;
	default:
		this.name = "unknown_player";
		break;
	}
	BOARDFUL.Mngr.add(this);
	this.addListeners();
};
// add event listeners
BOARDFUL.ENGINE.Player.prototype.addListeners = function () {
	var that = this;
	this.game.event_mngr.on("Player" + this.id + "Start", {
		level: "game",
		callback: function (arg) {
			that.start(arg);
		},
		instance: that
	});
	this.game.event_mngr.on("Player" + this.id + "PlayCard", {
		level: "game",
		callback: function (arg) {
			that.playCard(arg);
		},
		instance: that
	});
};
// player start
BOARDFUL.ENGINE.Player.prototype.start = function (arg) {
	console.log("player start", this.game.player_list[this.game.current_player]);
	var event = new BOARDFUL.ENGINE.Event({
		name: "PlayerEnd",
		source: this.id
	});
	this.game.event_mngr.front(event.id);
};
// play card
BOARDFUL.ENGINE.Player.prototype.playCard = function (arg) {
	if (0 == this.hand.length) {
		return;
	}
	var card = this.hand[Math.floor((Math.random() * this.hand.length))];
	var event = new BOARDFUL.ENGINE.Event({
		name: "PlaceCardOnTable",
		source: this.id,
		source_event: arg.source_event,
		player: this.id,
		card: card
	});
	this.game.event_mngr.front(event.id);
};
