/**
 * Player.
 *
 * @author		Fei Zhan
 * @version		0.0
**/

var BOARDFUL = BOARDFUL || new Object();
BOARDFUL.CORE = BOARDFUL.CORE || new Object();

// player
BOARDFUL.CORE.Player = function (config, owner) {
	this.type = "Player";
	this.owner = owner;
	this.hand = new BOARDFUL.CORE.Deck(this.owner).id;
	this.turn = undefined;
	this.name;
	this.ui = undefined;
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
BOARDFUL.CORE.Player.prototype.addListeners = function () {
	var that = this;
	BOARDFUL.Mngr.get(this.owner).event_mngr.on("StartPlayer" + this.id, {
		level: "game",
		callback: function (arg) {
			that.start(arg);
		},
		id: that.id
	});
	BOARDFUL.Mngr.get(this.owner).event_mngr.on("Player" + this.id + "PlayCard", {
		level: "game",
		callback: function (arg) {
			that.playCard(arg);
		},
		id: that.id
	});
};
// player start
BOARDFUL.CORE.Player.prototype.start = function (arg) {
	BOARDFUL.Mngr.get(this.owner).current_player = this.id;
};
// play card
BOARDFUL.CORE.Player.prototype.playCard = function (arg) {
	if ("ai" == this.name) {
		var event = new BOARDFUL.CORE.Event(arg);
		event.name = "PlayCardAi";
		BOARDFUL.Mngr.get(this.owner).event_mngr.front(event.id);
	} else {
		var event = new BOARDFUL.CORE.Event(arg);
		event.name = "PlayCardUi";
		BOARDFUL.Mngr.get(this.owner).event_mngr.front(event.id);
	}
};