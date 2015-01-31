/**
 * AI for poker game.
 *
 * @author		Fei Zhan
 * @version		0.0
 * 
**/

// if nodejs, load BOARDFUL
if (typeof module !== 'undefined' && module.exports) {
	var BOARDFUL = require("../../build/boardful.core.js");
	var Poker = require("./cards.js");
	module.exports = Poker;
} else {
	BOARDFUL.MODS = BOARDFUL.MODS || new Object();
	var Poker = BOARDFUL.MODS.Poker || new Object();
}

Poker.getBestHand = function (cards, number) {
	cards.sort(Poker.compare);
	var comb = Poker.getCombination(cards, number);
	comb.sort(Poker.compareHand);
	if (0 == comb.length) {
		return new Array();
	} else {
		return comb[comb.length - 1];
	}
};
Poker.getCombination = function (cards, number) {
	if (cards.length < number) {
		return [];
	}
	if (0 == cards.length || number <= 0) {
		return [[]];
	}
	var card0 = cards[0];
	var cards1 = new Array();
	for (var i = 1; i < cards.length; ++ i) {
		cards1.push(cards[i]);
	}
	var ans = Poker.getCombination(cards1, number);
	var ans1 = Poker.getCombination(cards1, number - 1);
	for (var i in ans1) {
		var temp = [card0];
		for (var j in ans1[i]) {
			temp.push(ans1[i][j]);
		}
		ans.push(temp);
	}
	return ans;
};