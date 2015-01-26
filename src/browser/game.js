/**
 * Gui for game.
 *
 * @author		Fei Zhan
 * @version		0.0
**/

var BOARDFUL = BOARDFUL || new Object();
BOARDFUL.BRSR = BOARDFUL.BRSR || new Object();

BOARDFUL.BRSR.GameUi = function (owner) {
	this.type = "GameUi";
	this.owner = owner;
	BOARDFUL.Mngr.add(this);
	BOARDFUL.CORE.Command.owner = this.owner;
	this.addListeners();
	$("#content").empty();
	$("#content").load("src/browser/game.html", function () {
		$("#content #ok").on("click", function () {
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

BOARDFUL.BRSR.GameUi.prototype.dealCardsUi = function (arg) {
	console.log("deal cards", arg.cards);
	for (var i in arg.cards) {
		var card = new BOARDFUL.BRSR.CardUi(arg.cards[i], this);
		card.move({
			position: {
				top: "65%",
				left: "50%"
			}
		});
	}
};