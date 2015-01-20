/**
* Deck.
*
* @author  Fei Zhan
* @version 0.0
*/

var BOARDFUL = BOARDFUL || new Object();
BOARDFUL.ENGINE = BOARDFUL.ENGINE || new Object();

BOARDFUL.ENGINE.DeckList = new Object();
BOARDFUL.ENGINE.Deck = function () {
	this.id = BOARDFUL.ENGINE.Deck.next_deck_id;
	++ BOARDFUL.ENGINE.Deck.next_deck_id;
	this.card_list = new Array();
};
BOARDFUL.ENGINE.Deck.next_deck_id = 0;
BOARDFUL.ENGINE.Deck.prototype.getCards = function (num) {
	var cards = new Array();
	for (var i = 0; i < num; ++ i) {
		cards.append(this.card_list[0]);
		this.card_list.remove(0);
	}
	return cards;
};
BOARDFUL.ENGINE.Deck.prototype.shuffle = function (num) {
	
};
