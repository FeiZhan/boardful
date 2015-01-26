/**
 * Poker game.
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
var Poker = function (owner) {
	this.type = "Poker";
	this.owner = owner;
	BOARDFUL.Mngr.add(this);
	this.card_list = this.createCards();
};
// if nodejs, export as module
if (typeof module !== 'undefined' && module.exports) {
	module.exports.Poker = Poker;
} else {
	BOARDFUL.MODS.Poker = Poker;
}
// add listeners
Poker.prototype.addListeners = function () {
	var that = this;
	BOARDFUL.Mngr.get(this.owner).event_mngr.on("StartGame", {
		level: "game",
		callback: function (arg) {
			that.startGame(arg);
		},
		id: that.id
	});
	BOARDFUL.Mngr.get(this.owner).event_mngr.on("CreateDeck", {
		level: "game",
		callback: function (arg) {
			that.createDeck(arg);
		},
		id: that.id
	});
	BOARDFUL.Mngr.get(this.owner).event_mngr.on("PlayerAct", {
		level: "game",
		callback: function (arg) {
			that.playerAct(arg);
		},
		id: that.id
	});
	BOARDFUL.Mngr.get(this.owner).event_mngr.on("Settle", {
		level: "game",
		callback: function (arg) {
			that.settle(arg);
		},
		id: that.id
	});
	BOARDFUL.Mngr.get(this.owner).event_mngr.on("PlayCardAi", {
		level: "game",
		callback: function (arg) {
			that.playCard(arg);
		},
		id: that.id
	});
};
// start game
Poker.prototype.startGame = function () {
};
// create deck
Poker.prototype.createDeck = function (arg) {
	BOARDFUL.Mngr.get(arg.deck).getCards(this.card_list);
};
// players duel
Poker.prototype.playerAct = function (arg) {
	var event_list = new Array();
	var event;
	for (var i in BOARDFUL.Mngr.get(this.owner).player_list) {
		// each player play one card
		event = new BOARDFUL.CORE.Event({
			name: "Player" + BOARDFUL.Mngr.get(this.owner).player_list[i] + "PlayCard",
			source: this.id,
			source_event: "PlayersDuel",
			player: BOARDFUL.Mngr.get(this.owner).player_list[i],
			number: 1
		});
		event_list.push(event.id);
	}
	// settle players duel
	event = new BOARDFUL.CORE.Event({
		name: "Settle",
		source: this.id,
		source_event: "PlayersDuel"
	});
	event_list.push(event.id);
	BOARDFUL.Mngr.get(this.owner).event_mngr.front(event_list);
};
// settle players duel
Poker.prototype.settle = function (arg) {
	var select_list = BOARDFUL.Mngr.get(BOARDFUL.Mngr.get(this.owner).table).getCardsBySource("PlayersDuel");
	var that = this;
	select_list.sort(function (a, b) {
		return BOARDFUL.MODS.Poker.compare(a.card, b.card);
	});
	var player_list = new Array();
	var card_list = new Array();
	for (var i in select_list) {
		player_list.push(select_list[i].player);
		card_list.push(select_list[i].card);
	}
	var winner = undefined;
	if (select_list.length > 0) {
		winner = select_list[select_list.length - 1].player;
	}
	// event for ui
	var event_list = new Array();
	var event = new BOARDFUL.CORE.Event({
		name: "SettlePlayersDuelUi",
		source: this.id,
		cards: card_list,
		players: player_list,
		player: winner
	});
	event_list.push(event.id);
	BOARDFUL.Mngr.get(this.owner).event_mngr.front(event_list);
};
// play card AI
Poker.prototype.playCard = function (arg) {
	var player = BOARDFUL.Mngr.get(arg.player);
	if (0 == player.hand.length) {
		return;
	}
	var card = player.hand[Math.floor((Math.random() * player.hand.length))];
	var event = new BOARDFUL.CORE.Event({
		name: "PlaceCardOnTable",
		source: arg.player,
		source_event: arg.source_event,
		player: arg.player,
		card: card
	});
	BOARDFUL.Mngr.get(this.owner).event_mngr.front(event.id);
};

// create cards
Poker.prototype.createCards = function () {
	var card_list = new Array();
	var card;
	for (var i in Poker.RANKS) {
		if ("Joker" == i) {
			card = new BOARDFUL.CORE.Card({
				rank: i,
				suit: "Spade"
			});
			card_list.push(card.id);
			card = new BOARDFUL.CORE.Card({
				rank: i,
				suit: "Heart"
			});
			card_list.push(card.id);
		}
		else {
			for (var j in Poker.SUITS) {
				card = new BOARDFUL.CORE.Card({
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
// compare two cards
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