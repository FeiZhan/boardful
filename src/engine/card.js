/**
 * Card.
 *
 * @author		Fei Zhan
 * @version		0.0
 * 
**/

var BOARDFUL = BOARDFUL || new Object();
BOARDFUL.ENGINE = BOARDFUL.ENGINE || new Object();

// card
BOARDFUL.ENGINE.Card = function (config) {
	this.type = "Card";
	this.rank = config.rank;
	this.suit = config.suit;
	this.color = config.color;
	this.name = "card_" + this.rank + "_" + this.suit;
	this.owner = undefined;
	BOARDFUL.Mngr.add(this);
};
// load cards
BOARDFUL.ENGINE.Card.load = function (config) {
	var card_list = new Array();
	switch (config) {
	case "poker":
		card_list = new BOARDFUL.BOARDS.Poker().card_list;
		break;
	default:
		break;
	}
	return card_list;
};
