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
	if (this.owner) {
		BOARDFUL.Mngr.add(this);
		BOARDFUL.ENGINE.Command.owner = this.owner;
	}
	this.addListeners();
	$("#content").empty();
	$("#content").load("src/browser/game.html", function () {
		$("#content #ok").on("click", function () {
		});
	});
	var load_files = new BOARDFUL.ENGINE.FileLoader(["src/browser/game.html", "src/browser/game.css"], function () {
	});
};
BOARDFUL.BRSR.GameUi.prototype.addListeners = function () {
	var that = this;
	BOARDFUL.Mngr.get(this.owner).event_mngr.on("DealCardsUi", {
		level: "game",
		callback: function (arg) {
			that.dealCardsUi(arg);
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