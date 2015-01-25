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
BOARDFUL.CORE.Table.prototype.getCardsBySource = function (event) {
	var select_list = new Array();
	for (var i in this.arg_list) {
		if (event == this.arg_list[i].source_event) {
			select_list.push(this.arg_list[i]);
			this.arg_list.splice(i, 1);
		}
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
	var index = BOARDFUL.Mngr.get(arg.player).hand.indexOf(arg.card);
	BOARDFUL.Mngr.get(arg.player).hand.splice(index, 1);
	this.arg_list.push(arg);
};
