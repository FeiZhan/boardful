/**
 * Room.
 *
 * @author		Fei Zhan
 * @version		0.0
**/

var BOARDFUL = BOARDFUL || new Object();
BOARDFUL.ENGINE = BOARDFUL.ENGINE || new Object();

// room
BOARDFUL.ENGINE.Room = function (room) {
	this.type = "Room";
	this.owner = undefined;
	BOARDFUL.Mngr.add(this);
	this.config = room;
	this.options = room.options;
	this.player_list = room.player_list || ["me", "ai"];
};
