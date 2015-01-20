/**
 * Table.
 *
 * @author		Fei Zhan
 * @version		0.0
**/

var BOARDFUL = BOARDFUL || new Object();
BOARDFUL.ENGINE = BOARDFUL.ENGINE || new Object();

// table
BOARDFUL.ENGINE.Table = function (game) {
	this.id = BOARDFUL.ENGINE.Table.next_id;
	BOARDFUL.ENGINE.TableList[this.id] = this;
	++ BOARDFUL.ENGINE.Table.next_id;
	this.game = game;
	this.arg_list = new Array();
	this.addListeners();
};
BOARDFUL.ENGINE.Table.next_id = 0;
// table list
BOARDFUL.ENGINE.TableList = new Object();

BOARDFUL.ENGINE.Table.prototype.addListeners = function () {
	var that = this;
	BOARDFUL.ENGINE.GameList[this.game].event_mngr.on("PlayersDuel", {
		level: "game",
		callback: function (arg) {
			that.playersDuel(arg);
		},
		instance: that
	});
	BOARDFUL.ENGINE.GameList[this.game].event_mngr.on("PlaceCardOnTable", {
		level: "game",
		callback: function (arg) {
			that.placeCardOnTable(arg);
		},
		instance: that
	});
	BOARDFUL.ENGINE.GameList[this.game].event_mngr.on("SettlePlayersDuel", {
		level: "game",
		callback: function (arg) {
			that.settlePlayersDuel(arg);
		},
		instance: that
	});
};
// players duel
BOARDFUL.ENGINE.Table.prototype.playersDuel = function (arg) {
	var event_list = new Array();
	var event;
	for (var i in BOARDFUL.ENGINE.GameList[this.game].player_list) {
		event = new BOARDFUL.ENGINE.Event({
			source_type: "table",
			source_id: this.id,
			source_event: "PlayersDuel",
			name: "Player" + BOARDFUL.ENGINE.GameList[this.game].player_list[i] + "PlayCard",
			number: 1
		});
		event_list.push(event.id);
	}
	event = new BOARDFUL.ENGINE.Event({
		source_type: "table",
		source_id: this.id,
		source_event: "PlayersDuel",
		name: "SettlePlayersDuel"
	});
	event_list.push(event.id);
	BOARDFUL.ENGINE.GameList[this.game].event_mngr.front(event_list);
};
// place card arguments on table
BOARDFUL.ENGINE.Table.prototype.placeCardOnTable = function (arg) {
	var index = BOARDFUL.ENGINE.PlayerList[arg.player].hand.indexOf(arg.card);
	BOARDFUL.ENGINE.PlayerList[arg.player].hand.splice(index, 1);
	this.arg_list.push(arg);
};
// settle players duel
BOARDFUL.ENGINE.Table.prototype.settlePlayersDuel = function (arg) {
	var args = new Array();
	for (var i in this.arg_list) {
		if ("PlayersDuel" == this.arg_list[i].source_event) {
			args.push(i);
		}
	}
	/*args.sort(function (a, b) {
		return BOARDFUL.ENGINE.pokerSort(this.arg_list[a].card, this.arg_list[b].card);
	});*/
	for (var i  = args.length - 1; i >= 0; -- i) {
		this.arg_list.splice(args[i], 1);
	}
};
