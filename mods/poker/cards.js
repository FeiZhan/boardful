/**
 * Cards for poker game.
 *
 * @author		Fei Zhan
 * @version		0.0
 * 
**/

// if nodejs, load BOARDFUL
if (typeof module !== 'undefined' && module.exports) {
	var BOARDFUL = require("../../build/boardful.core.js");
}

// poker
var Poker = Poker || {
	type: "Mod",
	name: "Poker"
};
// if nodejs, export as module
if (typeof module !== 'undefined' && module.exports) {
	module.exports = Poker;
} else {
	BOARDFUL.MODS.Poker = Poker;
}
Poker.register = function (owner) {
	Poker.owner = owner;
	Poker.game = BOARDFUL.Mngr.get(Poker.owner).game;
	BOARDFUL.Mngr.add(Poker);
	return Poker.id;
};

// create cards
Poker.createCards = function () {
	var card_list = new Array();
	var card;
	for (var i in Poker.RANKS) {
		if ("Joker" == i) {
			card = new BOARDFUL.Card({
				rank: i,
				suit: "Spade",
				name: "♠" + i
			}, Poker.id);
			card_list.push(card.id);
			card = new BOARDFUL.Card({
				rank: i,
				suit: "Heart",
				name: "♥" + i
			}, Poker.id);
			card_list.push(card.id);
		}
		else {
			for (var j in Poker.SUITS) {
				card = new BOARDFUL.Card({
					rank: i,
					suit: j,
					name: Poker.SUIT_NAMES[j] + i
				}, Poker.id);
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
Poker.SUIT_NAMES = {
	"Spade": "♠",
	"Heart": "♥",
	"Diamond": "♦",
	"Club": "♣"
};
// compare two cards
Poker.compare = function (id0, id1) {
	var card0 = BOARDFUL.Mngr.get(id0);
	var card1 = BOARDFUL.Mngr.get(id1);
	if (undefined === card0 || undefined === card1) {
		return (undefined === card1) - (undefined === card0);
	}
	else if (card0.rank != card1.rank) {
		return Poker.RANKS[card0.rank] - Poker.RANKS[card1.rank];
	}
	else if (card0.suit != card1.suit) {
		return Poker.SUITS[card0.suit] - Poker.SUITS[card1.suit];
	}
	else {
		return 0;
	}
};
Poker.HAND_TYPES = {
	"Straight flush": 9,
	"Four of a kind": 8,
	"Full house": 7,
	"Flush": 6,
	"Straight": 5,
	"Three of a kind": 4,
	"Two pair": 3,
	"One pair": 2,
	"High card": 1,
	"Less than five": 0
};
// compare two set of cards
Poker.compareHand = function (list0, list1) {
	if (list0.length != list1.length) {
		return list0.length - list1.length;
	}
	var type0 = Poker.getHandType(list0);
	var type1 = Poker.getHandType(list1);
	if (type0.type != type1.type) {
		return Poker.HAND_TYPES[type0.type] - Poker.HAND_TYPES[type1.type];
	}
	else {
		return Poker.compare(type0.card, type1.card);
	}
};
Poker.getHandType = function (list) {
	list.sort(Poker.compare);
	if (0 == list.length) {
		return {
			type: "Less than five",
			card: undefined
		};
	}
	else if (list.length < 5) {
		return {
			type: "Less than five",
			card: list[list.length - 1]
		};
	}
	var card_list = new Array();
	var suit_list = new Object();
	var ranks = new Array();
	var rank_list = new Object();
	for (var i in list) {
		var card = BOARDFUL.Mngr.get(list[i]);
		if (! (card.suit in suit_list)) {
			suit_list[card.suit] = 0;
		}
		++ suit_list[card.suit];
		var rank = Poker.RANKS[card.rank];
		if (! (rank in rank_list)) {
			rank_list[rank] = 0;
		}
		ranks.push(rank);
		++ rank_list[rank];
		card_list.push(card);
	}
	var max_rank_count = 0;
	var max_count_rank = 0;
	for (var i in rank_list) {
		if (rank_list[i] > max_rank_count) {
			max_rank_count = rank_list[i];
			max_count_rank = i;
		}
	}
	var cont_count = 1;
	var max_cont_count = 0;
	var max_cont_rank = 0;
	for (var i in ranks) {
		if (i > 0 && ranks[i] - ranks[i - 1] == 1) {
			++ cont_count;
		} else {
			cont_count = 1;
		}
		if (cont_count >= max_cont_count) {
			max_cont_count = cont_count;
			max_cont_rank = ranks[i];
		}
		prev = i;
	}
	if (1 == Object.keys(suit_list).length && 5 == max_cont_count) {
		return {
			type: "Straight flush",
			card: list[list.length - 1]
		};
	}
	else if (4 == max_rank_count) {
		var return_index = card_list.length - 1;
		for (var i = card_list.length - 1; i >= 0; -- i) {
			if (Poker.RANKS[card_list[i].rank] == max_count_rank) {
				return_index = i;
				break;
			}
		}
		return {
			type: "Four of a kind",
			card: list[return_index]
		};
	}
	else if (2 == Object.keys(rank_list).length && 3 == max_rank_count) {
		var return_index = card_list.length - 1;
		for (var i = card_list.length - 1; i >= 0; -- i) {
			if (Poker.RANKS[card_list[i].rank] == max_count_rank) {
				return_index = i;
				break;
			}
		}
		return {
			type: "Full house",
			card: list[return_index]
		};
	}
	else if (1 == Object.keys(suit_list).length) {
		return {
			type: "Flush",
			card: list[card_list.length - 1]
		};
	}
	else if (5 == max_cont_count) {
		return {
			type: "Straight",
			card: list[card_list.length - 1]
		};
	}
	else if (3 == max_rank_count) {
		var return_index = card_list.length - 1;
		for (var i = card_list.length - 1; i >= 0; -- i) {
			if (Poker.RANKS[card_list[i].rank] == max_count_rank) {
				return_index = i;
				break;
			}
		}
		return {
			type: "Three of a kind",
			card: list[return_index]
		};
	}
	else if (3 == Object.keys(rank_list).length) {
		var return_index = card_list.length - 1;
		for (var i in card_list) {
			if (i > 1 && card_list[i].rank == card_list[i - 1].rank) {
				return_index = i;
			}
		}
		return {
			type: "Two pair",
			card: list[return_index]
		};
	}
	else if (4 == Object.keys(rank_list).length) {
		var return_index = card_list.length - 1;
		for (var i in card_list) {
			if (i > 1 && card_list[i].rank == card_list[i - 1].rank) {
				return_index = i;
			}
		}
		return {
			type: "One pair",
			card: list[return_index]
		};
	} else {
		return {
			type: "High card",
			card: list[card_list.length - 1]
		};
	}
};