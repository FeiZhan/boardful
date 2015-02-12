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
	var Poker = require("./cards.js");
	var Poker1 = require("./ai.js");
	for (var i in Poker1) {
		if (! (i in Poker)) {
			Poker[i] = Poker1[i];
		}
	}
	module.exports = Poker;
} else {
	BOARDFUL.MODS = BOARDFUL.MODS || new Object();
	var Poker = BOARDFUL.MODS.Poker || new Object();
}

// poker
Poker.register = Poker.register || function (owner) {
	Poker.type = "Mod";
	Poker.owner = owner;
	Poker.name = "Poker";
	Poker.game = BOARDFUL.Mngr.get(Poker.owner).game;
	BOARDFUL.Mngr.add(Poker);
	return Poker.id;
};
// add listeners
Poker.addListeners = function () {
	BOARDFUL.Mngr.get(Poker.owner).event_mngr.on("StartGame", {
		level: "game",
		callback: function (arg) {
			Poker.startGame(arg);
		},
		id: Poker.id
	});
	BOARDFUL.Mngr.get(Poker.owner).event_mngr.on("CreateDeck", {
		level: "game",
		callback: function (arg) {
			Poker.createDeck(arg);
		},
		id: Poker.id
	});
	BOARDFUL.Mngr.get(Poker.owner).event_mngr.on("PlayerAct", {
		level: "game",
		callback: function (arg) {
			Poker.playerAct(arg);
		},
		id: Poker.id
	});
	BOARDFUL.Mngr.get(Poker.owner).event_mngr.on("Settle", {
		level: "game",
		callback: function (arg) {
			Poker.settle(arg);
		},
		id: Poker.id
	});
	BOARDFUL.Mngr.get(Poker.owner).event_mngr.on("SettlePlayersDuelUi", {
		level: "game",
		callback: function (arg) {
			Poker.settlePlayersDuelUi(arg);
		},
		id: Poker.id
	});
	BOARDFUL.Mngr.get(Poker.owner).event_mngr.on("Discard", {
		level: "game",
		callback: function (arg) {
			Poker.discard(arg);
		},
		id: Poker.id
	});
	BOARDFUL.Mngr.get(Poker.owner).event_mngr.on("ReorderDeck", {
		level: "game",
		callback: function (arg) {
			Poker.reorderDeck(arg);
		},
		id: Poker.id
	});
	BOARDFUL.Mngr.get(Poker.owner).event_mngr.on("PlayCardAi", {
		level: "game",
		callback: function (arg) {
			Poker.playCardAi(arg);
		},
		id: Poker.id
	});
};
// start game
Poker.startGame = function () {
};
// create deck
Poker.createDeck = function (arg) {
	BOARDFUL.Mngr.get(arg.deck).getCards(this.createCards());
};
// players duel
Poker.playerAct = function (arg) {
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
Poker.settle = function (arg) {
	var select_list = BOARDFUL.Mngr.get(BOARDFUL.Mngr.get(this.owner).table).getCardsBySource("PlayersDuel");
	// group player's cards together
	var select_player_list = new Array();
	for (var i in select_list) {
		if (! (select_list[i].player in select_player_list)) {
			select_player_list[select_list[i].player] = new Array();
		}
		select_player_list[select_list[i].player] = select_player_list[select_list[i].player].concat(select_list[i].cards);
	}
	// change to array
	var select_card_list = new Array();
	for (var i in select_player_list) {
		select_card_list.push({
			player: i,
			cards: select_player_list[i]
		});
	}
	var that = this;
	select_card_list.sort(function (a, b) {
		return BOARDFUL.MODS.Poker.compare(a.cards, b.cards);
	});
	var player_list = new Array();
	var card_list = new Array();
	var all_card_list = new Array();
	for (var i in select_card_list) {
		player_list.push(select_card_list[i].player);
		card_list.push(select_card_list[i].cards);
		all_card_list = all_card_list.concat(select_card_list[i].cards);
	}
	var winner = undefined;
	if (select_card_list.length > 0) {
		winner = select_card_list[select_card_list.length - 1].player;
	}
	// event for ui
	var event_list = new Array();
	var event = new BOARDFUL.CORE.Event({
		name: "SettlePlayersDuelUi",
		source: Poker.id,
		cards: card_list,
		all_cards: all_card_list,
		players: player_list,
		player: winner
	});
	event_list.push(event.id);
	BOARDFUL.Mngr.get(Poker.owner).event_mngr.front(event_list);
};
Poker.settlePlayersDuelUi = function (arg) {
	console.log("winner", BOARDFUL.Mngr.get(arg.player).name);
	var event_list = new Array();
	for (var i in arg.all_cards) {
		//BOARDFUL.Mngr.get(BOARDFUL.Mngr.get(arg.cards[i]).ui).show();
		var event = new BOARDFUL.CORE.Event({
			name: "ShowCard",
			source: BOARDFUL.Mngr.get(Poker.owner).table,
			card: arg.all_cards[i]
		});
		event_list.push(event.id);
	}
	var event = new BOARDFUL.CORE.Event({
		name: "Discard",
		source: BOARDFUL.Mngr.get(Poker.owner).table,
		cards: arg.all_cards
	});
	event_list.push(event.id);
	BOARDFUL.Mngr.get(Poker.owner).event_mngr.front(event_list);
};
// discard
Poker.discard = function (arg) {
	var deck = BOARDFUL.Mngr.get(BOARDFUL.Mngr.get(Poker.owner).deck_list.discard);
	deck.getCards(arg.cards);
};
// reorder deck
Poker.reorderDeck = function (arg) {
	var discard = BOARDFUL.Mngr.get(BOARDFUL.Mngr.get(Poker.owner).deck_list.discard);
	discard.card_list = BOARDFUL.CORE.shuffle(discard.card_list);
	BOARDFUL.Mngr.get(arg.deck).getCards(discard.card_list);
	discard.card_list = new Array();
};
// play card AI
Poker.playCardAi = function (arg) {
	var hand = BOARDFUL.Mngr.get(BOARDFUL.Mngr.get(arg.player).hand).card_list;
	if (0 == hand.length) {
		return;
	}
	var card_list = Poker.getBestHand(hand, arg.number);
	var event = new BOARDFUL.CORE.Event({
		name: "PlaceCardOnTable",
		source: arg.player,
		source_event: arg.source_event,
		player: arg.player,
		cards: card_list
	});
	BOARDFUL.Mngr.get(Poker.owner).event_mngr.front(event.id);
};