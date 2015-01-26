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
	BOARDFUL.Mngr.add(this);
	this.card_list = new Array();
	this.addListeners();
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
// get cards
BOARDFUL.CORE.Deck.prototype.getCards = function (card_list) {
	for (var i in card_list) {
		BOARDFUL.Mngr.get(card_list[i]).owner = this.id;
	}
	this.card_list = this.card_list.concat(card_list);
};
// deal cards
BOARDFUL.CORE.Deck.prototype.dealCards = function (arg) {
	// not me
	if (arg.deck != this.id) {
		return;
	}
	var card_list = new Array();
	for (var i = 0; i < arg.number; ++ i) {
		card_list.push(this.card_list[0]);
		this.card_list.shift();
	}
	BOARDFUL.Mngr.get(arg.player).hand = BOARDFUL.Mngr.get(arg.player).hand.concat(card_list);
	// create event for ui
	var event_list = new Array();
	var event = new BOARDFUL.CORE.Event({
		name: "DealCardsUi",
		source: this.id,
		cards: card_list,
		player: arg.player
	});
	event_list.push(event.id);
	BOARDFUL.Mngr.get(this.owner).event_mngr.front(event_list);
};