/**
 * Player.
 *
 * @author  Fei Zhan
 * @version 0.0
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
	this.game.event_mngr.on("PlayerStart", {
		level: "game",
		callback: function () {
			that.start();
		},
		instance: that
	});
};
BOARDFUL.ENGINE.Player.next_id = 0;

// player start
BOARDFUL.ENGINE.Player.prototype.start = function () {
	if (this.game.player_list[this.game.current_player].id != this.id) {
		return;
	}
	console.log("player start", this.game.current_player);
	var event = new BOARDFUL.ENGINE.Event("PlayerEnd");
	this.game.event_mngr.front(event.id);
};


// player list
BOARDFUL.ENGINE.PlayerList = new Object();
// create a player list
BOARDFUL.ENGINE.getPlayerList = function (list) {
	var player_list = new Object();
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
		player_list[player.id] = player;
	}
	return player_list;
};
