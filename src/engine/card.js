/**
* Game.
*
* @author  Fei Zhan
* @version 0.0
*/

var BOARDFUL = BOARDFUL || new Object();
BOARDFUL.ENGINE = BOARDFUL.ENGINE || new Object();

BOARDFUL.ENGINE.CardList = new Object();
BOARDFUL.ENGINE.loadCards = function (config) {
	switch (config) {
	case "poker":
		BOARDFUL.ENGINE.CardList = BOARDFUL.ENGINE.loadPoker();
		break;
	default:
		break;
	}
};
BOARDFUL.ENGINE.loadPoker = function (num) {
	num = num || 1;
	var card;
	for (var i = 0; i < num; ++ i) {
		for (var j = 1; j <= 13; ++ j) {
			var value = j;
			switch (j) {
			case 11:
				value = "Jack";
				break;
			case 12:
				value = "Queen";
				break;
			case 13:
				value = "King";
				break;
			default:
				value = j;
				break;
			}
			for (var k in ["spade", "heart", "diamond", "club"]) {
				card = new BOARDFUL.ENGINE.Card({
					value: value,
					suit: k,
					color: (k % 2 ? "red" : "black")
				});
				BOARDFUL.ENGINE.CardList[card.id] = card;
			}
		}
	}
};

BOARDFUL.ENGINE.NextCardId = 0;
BOARDFUL.ENGINE.Card = function (config) {
	this.id = BOARDFUL.ENGINE.NextCardId;
	++ BOARDFUL.ENGINE.NextCardId;
	this.value = config.value;
	this.suit = config.suit;
	this.color = config.color;
};
