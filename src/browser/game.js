/**
 * Gui for game.
 *
 * @author		Fei Zhan
 * @version		0.0
**/

var BOARDFUL = BOARDFUL || new Object();
BOARDFUL.BRSR = BOARDFUL.BRSR || new Object();

// game ui
BOARDFUL.BRSR.GameUi = function (owner) {
	this.type = "GameUi";
	this.owner = owner;
	BOARDFUL.Mngr.add(this);
	BOARDFUL.CORE.Command.owner = this.owner;
	this.addListeners();
	$("#content").empty();
	$("#content").load("src/browser/game.html", function () {
		$("#content #playerok").on("click", function () {
		});
	});
	this.player_list = new Array();
	for (var i in BOARDFUL.Mngr.get(this.owner).player_list) {
		this.player_list.push(new BOARDFUL.BRSR.PlayerUi(BOARDFUL.Mngr.get(this.owner).player_list[i]).id);
	}
	var load_files = new BOARDFUL.CORE.FileLoader(["src/browser/game.html", "src/browser/game.css"], function () {
	});
};
BOARDFUL.BRSR.GameUi.prototype.addListeners = function () {
	var that = this;
	BOARDFUL.Mngr.get(this.owner).event_mngr.on("DealCardUi", {
		level: "game",
		callback: function (arg) {
			that.dealCardUi(arg);
		},
		id: that.id
	});
};

BOARDFUL.BRSR.GameUi.prototype.dealCardUi = function (arg) {
	var card = new BOARDFUL.BRSR.CardUi(arg.card, this);
	card.move({
		position: {
			top: "65%",
			left: "50%"
		}
	});
};