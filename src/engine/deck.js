/**
 * Deck.
 *
 * @author		Fei Zhan
 * @version		0.0
 * 
**/

var BOARDFUL = BOARDFUL || new Object();
BOARDFUL.ENGINE = BOARDFUL.ENGINE || new Object();

// deck
BOARDFUL.ENGINE.Deck = function () {
	this.id = BOARDFUL.ENGINE.Deck.next_id;
	BOARDFUL.ENGINE.DeckList[this.id] = this;
	++ BOARDFUL.ENGINE.Deck.next_id;
	this.card_list = new Array();
};
BOARDFUL.ENGINE.Deck.next_id = 0;
// deck list
BOARDFUL.ENGINE.DeckList = new Object();

// get cards
BOARDFUL.ENGINE.Deck.prototype.getCards = function (card_list) {
	this.card_list = this.card_list.concat(card_list);
};
// shuffle cards
BOARDFUL.ENGINE.Deck.prototype.shuffle = function () {
	this.card_list = BOARDFUL.ENGINE.shuffle(this.card_list);
};
// deal cards
BOARDFUL.ENGINE.Deck.prototype.dealCards = function (num) {
	var cards = new Array();
	for (var i = 0; i < num; ++ i) {
		cards.push(this.card_list[0]);
		this.card_list.shift();
	}
	return cards;
};

