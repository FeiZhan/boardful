/**
 * Room.
 *
 * @author  Fei Zhan
 * @version 0.0
*/

var BOARDFUL = BOARDFUL || new Object();
BOARDFUL.ENGINE = BOARDFUL.ENGINE || new Object();

// room
BOARDFUL.ENGINE.Room = function (room) {
	this.id = BOARDFUL.ENGINE.Room.next_id;
	BOARDFUL.ENGINE.RoomList[this.id] = this;
	++ BOARDFUL.ENGINE.Room.next_id;
	this.config = room;
	this.options = room.options;
	this.player_list = room.player_list || ["me", "ai"];
};
BOARDFUL.ENGINE.Room.next_id = 0;

// room list
BOARDFUL.ENGINE.RoomList = new Object();
