/**
 * Room.
 *
 * @author		Fei Zhan
 * @version		0.0
**/

var BOARDFUL = BOARDFUL || new Object();
BOARDFUL.CORE = BOARDFUL.CORE || new Object();

// room
BOARDFUL.CORE.Room = function (config, owner) {
	this.type = "Room";
	this.owner = owner;
	this.ui = undefined;
	BOARDFUL.Mngr.add(this);
	this.config = config;
	// set default players
	this.player_list = config.player_list || ["me", "ai"];
	this.mod_list = config.mod_list || ["Poker"];
};