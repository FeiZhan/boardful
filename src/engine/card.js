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
	this.id = BOARDFUL.ENGINE.Card.next_id;
	BOARDFUL.ENGINE.CardList[this.id] = this;
	++ BOARDFUL.ENGINE.Card.next_id;
	this.rank = config.rank;
	this.suit = config.suit;
	this.color = config.color;
};
BOARDFUL.ENGINE.Card.next_id = 0;

// card list
BOARDFUL.ENGINE.CardList = new Object();

// load cards
BOARDFUL.ENGINE.loadCards = function (config) {
	var card_list = new Array();
	switch (config) {
	case "poker":
		card_list = BOARDFUL.ENGINE.loadPoker();
		break;
	default:
		break;
	}
	return card_list;
};
// load poker cards
BOARDFUL.ENGINE.loadPoker = function (num) {
	num = num || 1;
	var card;
	var card_list = new Array();
	for (var i = 0; i < num; ++ i) {
		for (var j = 1; j <= 13; ++ j) {
			var rank = j;
			switch (j) {
			case 11:
				rank = "Jack";
				break;
			case 12:
				rank = "Queen";
				break;
			case 13:
				rank = "King";
				break;
			default:
				rank = j;
				break;
			}
			for (var k in ["spade", "heart", "diamond", "club"]) {
				card = new BOARDFUL.ENGINE.Card({
					rank: rank,
					suit: k,
					color: (k % 2 ? "red" : "black")
				});
				card_list.push(card.id);
			}
		}
	}
	return card_list;
};
BOARDFUL.ENGINE.pokerSort = function (id0, id1) {
	var card0 = BOARDFUL.ENGINE.CardList[id0];
	var card1 = BOARDFUL.ENGINE.CardList[id1];
	if (card0.rank != card1.rank) {
		var rank0 = pokerGetRankValue(card0.rank);
	}
};
var pokerGetRankValue = function (rank) {
	var rank_values = {
		Jack: 11,
		Queen: 11,
		King: 11
	};
};
