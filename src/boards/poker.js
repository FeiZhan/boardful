/**
 * Poker cards.
 *
 * @author		Fei Zhan
 * @version		0.0
 * 
**/

var BOARDFUL = BOARDFUL || new Object();
BOARDFUL.BOARDS = BOARDFUL.BOARDS || new Object();

BOARDFUL.BOARDS.Poker = function () {
	this.card_list = this.createCards();
};
BOARDFUL.BOARDS.Poker.prototype.createCards = function () {
	var card_list = new Array();
	var card;
	for (var i in BOARDFUL.BOARDS.Poker.RANKS) {
		if ("Joker" == i) {
			card = new BOARDFUL.ENGINE.Card({
				rank: i,
				suit: "Spade"
			});
			card_list.push(card.id);
			card = new BOARDFUL.ENGINE.Card({
				rank: i,
				suit: "Heart"
			});
			card_list.push(card.id);
		}
		else {
			for (var j in BOARDFUL.BOARDS.Poker.SUITS) {
				card = new BOARDFUL.ENGINE.Card({
					rank: i,
					suit: j
				});
				card_list.push(card.id);
			}
		}
	}
	return card_list;
};

BOARDFUL.BOARDS.Poker.RANKS = {
	"2": 2,
	"3": 3,
	"4": 4,
	"5": 5,
	"6": 6,
	"7": 7,
	"8": 8,
	"9": 9,
	"10": 10,
	"Jack": 11,
	"Queen": 12,
	"King": 13,
	"Ace": 14,
	"Joker": 15
};
BOARDFUL.BOARDS.Poker.SUITS = {
	"Spade": 4,
	"Heart": 3,
	"Diamond": 2,
	"Club": 1
};
BOARDFUL.BOARDS.Poker.compare = function (id0, id1) {
	var card0 = BOARDFUL.Mngr.get(id0);
	var card1 = BOARDFUL.Mngr.get(id1);
	if (card0.rank != card1.rank) {
		return BOARDFUL.BOARDS.Poker.RANKS[card0.rank] - BOARDFUL.BOARDS.Poker.RANKS[card1.rank];
	}
	else if (card0.suit != card1.suit) {
		return BOARDFUL.BOARDS.Poker.SUITS[card0.suit] - BOARDFUL.BOARDS.Poker.SUITS[card1.suit];
	}
	else {
		return 0;
	}
};
BOARDFUL.BOARDS.Poker.cardToString = function (id) {
	return BOARDFUL.Mngr.get(id).rank + ' ' + BOARDFUL.Mngr.get(id).suit;
};
