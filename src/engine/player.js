/**
 * Player.
 *
 * @author		Fei Zhan
 * @version		0.0
*/

var BOARDFUL = BOARDFUL || new Object();
BOARDFUL.ENGINE = BOARDFUL.ENGINE || new Object();

// player
BOARDFUL.ENGINE.Player = function (config, game_id) {
	this.id = BOARDFUL.ENGINE.Player.next_id;
	BOARDFUL.ENGINE.PlayerList[this.id] = this;
	++ BOARDFUL.ENGINE.Player.next_id;
	this.game_id = game_id;
	this.game = BOARDFUL.ENGINE.GameList[this.game_id];
	this.hand = new Array();
	this.turn = undefined;
	this.type = undefined;
	switch (config) {
	case "me":
		this.type = "me";
		break;
	case "ai":
		this.type = "ai";
		break;
	default:
		this.type = "other";
		break;
	}
	var that = this;
	// add event listeners
	this.game.event_mngr.on("Player" + this.id + "Start", {
		level: "game",
		callback: function (arg) {
			that.start(arg);
		},
		instance: that
	});
};
BOARDFUL.ENGINE.Player.next_id = 0;

// player start
BOARDFUL.ENGINE.Player.prototype.start = function (arg) {
	console.log("player start", this.game.player_list[this.game.current_player]);
	var event = new BOARDFUL.ENGINE.Event({
		source_type: "game",
		source_id: this.id,
		name: "PlayerEnd"
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
		source_type: "game",
		source_id: this.id,
		name: "PlayCard",
		player: this.id,
		card: card
	});
	this.game.event_mngr.front(event.id);
};

// player list
BOARDFUL.ENGINE.PlayerList = new Object();
// create a player list
BOARDFUL.ENGINE.getPlayerList = function (list) {
	var player_list = new Array();
	var player;
	for (var i in list) {
		switch (list[i]) {
		case "me":
			player = new BOARDFUL.ENGINE.Player("me");
			break;
		case "ai":
			player = new BOARDFUL.ENGINE.Player("ai");
			break;
		default:
			break;
		}
		player_list.push(player.id);
	}
	return player_list;
};
