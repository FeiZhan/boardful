/**
 * Cards for uno game.
 *
 * @author		Fei Zhan
 * @version		0.0
 * 
**/

// if nodejs, load BOARDFUL
if (typeof module !== 'undefined' && module.exports) {
	var BOARDFUL = require("../../build/boardful.core.js");
}

// uno
var Uno = Uno || {
	type: "Mod",
	name: "Uno"
};
// if nodejs, export as module
if (typeof module !== 'undefined' && module.exports) {
	module.exports = Uno;
} else {
	BOARDFUL.MODS.Uno = Uno;
}
Uno.register = function (owner) {
	Uno.owner = owner;
	Uno.game = BOARDFUL.Mngr.get(Uno.owner).game;
	BOARDFUL.Mngr.add(Uno);
	return Uno.id;
};

// create cards
Uno.createCards = function () {
	var card_list = new Array();
	var card;
	for (var i = 0; i < 4; ++ i) {
		card = new BOARDFUL.Card({
			rank: 0,
			color: Uno.COLOR[i]
		}, Uno.id);
		card_list.push(card.id);
		for (var j = 0; j < 2; ++ j) {
			for (var k = 1; k <= 9; ++ k) {
				card = new BOARDFUL.Card({
					rank: k,
					color: Uno.COLOR[i]
				}, Uno.id);
				card_list.push(card.id);
			}
			card = new BOARDFUL.Card({
				rank: "skip",
				color: Uno.COLOR[i]
			}, Uno.id);
			card_list.push(card.id);
			card = new BOARDFUL.Card({
				rank: "draw two",
				color: Uno.COLOR[i]
			}, Uno.id);
			card_list.push(card.id);
			card = new BOARDFUL.Card({
				rank: "reverse",
				color: Uno.COLOR[i]
			}, Uno.id);
			card_list.push(card.id);
		}
	}
	for (var i = 0; i < 4; ++ i) {
		card = new BOARDFUL.Card({
			rank: "wild",
			color: "black"
		}, Uno.id);
		card_list.push(card.id);
		card = new BOARDFUL.Card({
			rank: "wild draw four",
			color: "black"
		}, Uno.id);
		card_list.push(card.id);
	}
	return card_list;
};
Uno.COLOR = ["red", "green", "blue", "yellow", "black"];