/**
 * Player.
 *
 * @author  Fei Zhan
 * @version 0.0
*/

var BOARDFUL = BOARDFUL || new Object();
BOARDFUL.ENGINE = BOARDFUL.ENGINE || new Object();

// player
BOARDFUL.ENGINE.Player = function (config) {
	this.id = BOARDFUL.ENGINE.NextPlayerId;
	BOARDFUL.ENGINE.PlayerList[this.id] = this;
	++ BOARDFUL.ENGINE.NextPlayerId;
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
};
BOARDFUL.ENGINE.Player.next_id = 0;

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
