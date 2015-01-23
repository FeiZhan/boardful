/**
 * Room.
 *
 * @author		Fei Zhan
 * @version		0.0
**/

var BOARDFUL = BOARDFUL || new Object();
BOARDFUL.ENGINE = BOARDFUL.ENGINE || new Object();

// room
BOARDFUL.ENGINE.Room = function (config, owner) {
	this.type = "Room";
	this.owner = owner;
	BOARDFUL.Mngr.add(this);
	this.config = config;
	this.options = config.options;
	this.player_list = config.player_list || ["me", "ai"];
};