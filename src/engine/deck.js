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
BOARDFUL.ENGINE.Deck = function (owner) {
	this.type = "Deck";
	this.card_list = new Array();
	this.owner = owner;
	BOARDFUL.Mngr.add(this);
	this.addListeners();
};
// add listeners
BOARDFUL.ENGINE.Deck.prototype.addListeners = function () {
	var that = this;
	BOARDFUL.Mngr.get(this.owner).event_mngr.on("CreateDeck", {
		level: "game",
		callback: function (arg) {
			that.createDeck(arg);
		},
		id: that.id
	});
	BOARDFUL.Mngr.get(this.owner).event_mngr.on("ShuffleDeck", {
		level: "game",
		callback: function (arg) {
			that.shuffleDeck(arg);
		},
		id: that.id
	});
	BOARDFUL.Mngr.get(this.owner).event_mngr.on("DealCards", {
		level: "game",
		callback: function (arg) {
			that.dealCards(arg);
		},
		id: that.id
	});
};
// create deck
BOARDFUL.ENGINE.Deck.prototype.createDeck = function (arg) {
	if (arg.deck != this.id) {
		return;
	}
	var card_list = BOARDFUL.ENGINE.Card.load(arg.type);
	BOARDFUL.Mngr.get(arg.deck).getCards(card_list);

	var event_list = new Array();
	var event = new BOARDFUL.ENGINE.Event({
		name: "CreateDeckUi",
		source: this.id,
		cards: card_list
	});
	event_list.push(event.id);
	BOARDFUL.Mngr.get(this.owner).event_mngr.front(event_list);
};
// shuffle deck
BOARDFUL.ENGINE.Deck.prototype.shuffleDeck = function (arg) {
	if (arg.deck != this.id) {
		return;
	}
	this.card_list = BOARDFUL.ENGINE.shuffle(this.card_list);

	var event_list = new Array();
	var event = new BOARDFUL.ENGINE.Event({
		name: "ShuffleDeckUi",
		source: this.id,
		cards: this.card_list
	});
	event_list.push(event.id);
	BOARDFUL.Mngr.get(this.owner).event_mngr.front(event_list);
};
// get cards
BOARDFUL.ENGINE.Deck.prototype.getCards = function (card_list) {
	for (var i in card_list) {
		BOARDFUL.Mngr.get(card_list[i]).owner = this.id;
	}
	this.card_list = this.card_list.concat(card_list);
};
// deal cards
BOARDFUL.ENGINE.Deck.prototype.dealCards = function (arg) {
	if (arg.deck != this.id) {
		return;
	}
	var card_list = new Array();
	for (var i = 0; i < arg.number; ++ i) {
		card_list.push(this.card_list[0]);
		this.card_list.shift();
	}
	BOARDFUL.Mngr.get(arg.player).hand = BOARDFUL.Mngr.get(arg.player).hand.concat(card_list);

	var event_list = new Array();
	var event = new BOARDFUL.ENGINE.Event({
		name: "DealCardsUi",
		source: this.id,
		cards: card_list
	});
	event_list.push(event.id);
	BOARDFUL.Mngr.get(this.owner).event_mngr.front(event_list);
};
