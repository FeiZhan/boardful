/**
 * Poker cards.
 *
 * @author		Fei Zhan
 * @version		0.0
 * 
**/
var BOARDFUL = require("../../build/boardful.engine.js");

// poker
var Poker = function (owner) {
	this.type = "Poker";
	this.owner = owner;
	BOARDFUL.Mngr.add(this);
	this.card_list = this.createCards();
};
if (module) {
	module.exports.Poker = Poker;
}
// create cards
Poker.prototype.createCards = function () {
	var card_list = new Array();
	var card;
	for (var i in Poker.RANKS) {
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
			for (var j in Poker.SUITS) {
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
Poker.RANKS = {
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
Poker.SUITS = {
	"Spade": 4,
	"Heart": 3,
	"Diamond": 2,
	"Club": 1
};
Poker.compare = function (id0, id1) {
	var card0 = BOARDFUL.Mngr.get(id0);
	var card1 = BOARDFUL.Mngr.get(id1);
	if (card0.rank != card1.rank) {
		return Poker.RANKS[card0.rank] - Poker.RANKS[card1.rank];
	}
	else if (card0.suit != card1.suit) {
		return Poker.SUITS[card0.suit] - Poker.SUITS[card1.suit];
	}
	else {
		return 0;
	}
};
Poker.cardToString = function (id) {
	return BOARDFUL.Mngr.get(id).rank + ' ' + BOARDFUL.Mngr.get(id).suit;
};
