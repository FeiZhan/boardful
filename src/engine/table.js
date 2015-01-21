/**
 * Table.
 *
 * @author		Fei Zhan
 * @version		0.0
**/

var BOARDFUL = BOARDFUL || new Object();
BOARDFUL.ENGINE = BOARDFUL.ENGINE || new Object();

// table
BOARDFUL.ENGINE.Table = function (owner) {
	this.type = "Table";
	this.owner = owner;
	BOARDFUL.Mngr.add(this);
	this.arg_list = new Array();
	this.addListeners();
};
// add listeners
BOARDFUL.ENGINE.Table.prototype.addListeners = function () {
	var that = this;
	BOARDFUL.Mngr.get(this.owner).event_mngr.on("PlayersDuel", {
		level: "game",
		callback: function (arg) {
			that.playersDuel(arg);
		},
		id: that.id
	});
	BOARDFUL.Mngr.get(this.owner).event_mngr.on("PlaceCardOnTable", {
		level: "game",
		callback: function (arg) {
			that.placeCardOnTable(arg);
		},
		id: that.id
	});
	BOARDFUL.Mngr.get(this.owner).event_mngr.on("SettlePlayersDuel", {
		level: "game",
		callback: function (arg) {
			that.settlePlayersDuel(arg);
		},
		id: that.id
	});
};
// players duel
BOARDFUL.ENGINE.Table.prototype.playersDuel = function (arg) {
	var event_list = new Array();
	var event;
	for (var i in BOARDFUL.Mngr.get(this.owner).player_list) {
		event = new BOARDFUL.ENGINE.Event({
			name: "Player" + BOARDFUL.Mngr.get(this.owner).player_list[i] + "PlayCard",
			source: this.id,
			source_event: "PlayersDuel",
			player: BOARDFUL.Mngr.get(this.owner).player_list[i],
			number: 1
		});
		event_list.push(event.id);
	}
	event = new BOARDFUL.ENGINE.Event({
		name: "SettlePlayersDuel",
		source: this.id,
		source_event: "PlayersDuel"
	});
	event_list.push(event.id);
	BOARDFUL.Mngr.get(this.owner).event_mngr.front(event_list);
};
// place card on table
BOARDFUL.ENGINE.Table.prototype.placeCardOnTable = function (arg) {
	var index = BOARDFUL.Mngr.get(arg.player).hand.indexOf(arg.card);
	BOARDFUL.Mngr.get(arg.player).hand.splice(index, 1);
	this.arg_list.push(arg);
};
// settle players duel
BOARDFUL.ENGINE.Table.prototype.settlePlayersDuel = function (arg) {
	var select_list = new Array();
	for (var i in this.arg_list) {
		if ("PlayersDuel" == this.arg_list[i].source_event) {
			select_list.push(i);
		}
	}
	var that = this;
	select_list.sort(function (a, b) {
		return BOARDFUL.BOARDS.Poker.compare(that.arg_list[a].card, that.arg_list[b].card);
	});
	for (var i in select_list) {
		console.log(this.arg_list[select_list[i]].player, BOARDFUL.BOARDS.Poker.cardToString(this.arg_list[select_list[i]].card));
	}
	if (select_list.length > 0) {
		console.log("winner", this.arg_list[select_list[select_list.length - 1]].player);
	}
	for (var i  = select_list.length - 1; i >= 0; -- i) {
		this.arg_list.splice(select_list[i], 1);
	}
};
