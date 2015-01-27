/**
 * Table.
 *
 * @author		Fei Zhan
 * @version		0.0
**/

var BOARDFUL = BOARDFUL || new Object();
BOARDFUL.CORE = BOARDFUL.CORE || new Object();

// table
BOARDFUL.CORE.Table = function (owner) {
	this.type = "Table";
	this.owner = owner;
	BOARDFUL.Mngr.add(this);
	this.arg_list = new Array();
	this.addListeners();
};
// get cards by source event
BOARDFUL.CORE.Table.prototype.getCardsBySource = function (event) {
	var select_list = new Array();
	for (var i in this.arg_list) {
		if (event == this.arg_list[i].source_event) {
			// deep copy
			select_list.push(this.arg_list[i]);
			this.arg_list[i] = undefined;
		}
	}
	// remove taken cards
	var index = this.arg_list.indexOf(undefined);
	while (-1 != index) {
		this.arg_list.splice(index, 1);
		index = this.arg_list.indexOf(undefined);
	}
	return select_list;
};
// add listeners
BOARDFUL.CORE.Table.prototype.addListeners = function () {
	var that = this;
	BOARDFUL.Mngr.get(this.owner).event_mngr.on("PlaceCardOnTable", {
		level: "game",
		callback: function (arg) {
			that.placeCardOnTable(arg);
		},
		id: that.id
	});
};
// place card on table
BOARDFUL.CORE.Table.prototype.placeCardOnTable = function (arg) {
	var hand = BOARDFUL.Mngr.get(BOARDFUL.Mngr.get(arg.player).hand).card_list;
	for (var i in arg.cards) {
		var index = hand.indexOf(arg.cards[i]);
		if (index >= 0) {
			hand.splice(index, 1);
		}
		BOARDFUL.Mngr.get(arg.cards[i]).owner = this.id;
	}
	this.arg_list.push(arg);
};