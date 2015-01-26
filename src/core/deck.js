/**
 * Deck.
 *
 * @author		Fei Zhan
 * @version		0.0
 * 
**/

var BOARDFUL = BOARDFUL || new Object();
BOARDFUL.CORE = BOARDFUL.CORE || new Object();

// deck
BOARDFUL.CORE.Deck = function (owner) {
	this.type = "Deck";
	this.owner = owner;
	this.game = this.owner;
	while (BOARDFUL.Mngr.get(this.game) && "Game" != BOARDFUL.Mngr.get(this.game).type) {
		this.game = BOARDFUL.Mngr.get(this.game).owner;
	}
	BOARDFUL.Mngr.add(this);
	this.card_list = new Array();
	this.addListeners();
};
// get cards
BOARDFUL.CORE.Deck.prototype.getCards = function (card_list) {
	for (var i in card_list) {
		BOARDFUL.Mngr.get(card_list[i]).owner = this.id;
	}
	this.card_list = this.card_list.concat(card_list);
};

// add listeners
BOARDFUL.CORE.Deck.prototype.addListeners = function () {
	var that = this;
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
	BOARDFUL.Mngr.get(this.owner).event_mngr.on("DealCard", {
		level: "game",
		callback: function (arg) {
			that.dealCard(arg);
		},
		id: that.id
	});
};
// shuffle deck
BOARDFUL.CORE.Deck.prototype.shuffleDeck = function (arg) {
	// not me
	if (arg.deck != this.id) {
		return;
	}
	this.card_list = BOARDFUL.CORE.shuffle(this.card_list);
	// add ui event
	var event_list = new Array();
	var event = new BOARDFUL.CORE.Event({
		name: "ShuffleDeckUi",
		source: this.id,
		cards: this.card_list
	});
	event_list.push(event.id);
	BOARDFUL.Mngr.get(this.owner).event_mngr.front(event_list);
};
// deal cards
BOARDFUL.CORE.Deck.prototype.dealCards = function (arg) {
	// not me
	if (arg.deck != this.id) {
		return;
	}
	var event_list = new Array();
	var event;
	if (arg.number > this.card_list.length) {
		event = new BOARDFUL.CORE.Event({
			name: "ReorderDeck",
			source: this.id,
			deck: this.id
		});
		event_list.push(event.id);
	}
	var arg1 = arg;
	arg1.name = "DealCard";
	for (var i = 0; i < arg.number; ++ i) {
		event = new BOARDFUL.CORE.Event(arg1);
		event_list.push(event.id);
	}
	BOARDFUL.Mngr.get(this.owner).event_mngr.front(event_list);
};
// deal one card
BOARDFUL.CORE.Deck.prototype.dealCard = function (arg) {
	// not me
	if (arg.deck != this.id) {
		return;
	}
	var card = this.card_list[0];
	this.card_list.shift();
	BOARDFUL.Mngr.get(BOARDFUL.Mngr.get(arg.player).hand).getCards([card]);
	// create event for ui
	var event_list = new Array();
	var event = new BOARDFUL.CORE.Event({
		name: "DealCardUi",
		source: this.id,
		card: card,
		player: arg.player
	});
	event_list.push(event.id);
	BOARDFUL.Mngr.get(this.owner).event_mngr.front(event_list);
};