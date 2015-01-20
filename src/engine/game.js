/**
 * Game.
 *
 * @author		Fei Zhan
 * @version	0.0
**/

var BOARDFUL = BOARDFUL || new Object();
BOARDFUL.ENGINE = BOARDFUL.ENGINE || new Object();

// game
BOARDFUL.ENGINE.Game = function (config) {
	this.id = BOARDFUL.ENGINE.Game.next_id;
	BOARDFUL.ENGINE.GameList[this.id] = this;
	++ BOARDFUL.ENGINE.Game.next_id;
	this.event_mngr = new BOARDFUL.ENGINE.EventMngr();
	// create from room
	if (config instanceof BOARDFUL.ENGINE.Room) {
		this.config = config.config;
		this.options = config.options;
		this.deck_list = {
			draw: new BOARDFUL.ENGINE.Deck().id,
			discard: new BOARDFUL.ENGINE.Deck().id
		};
		this.player_list = new Array();
		this.current_player = -1;
		for (var i in config.player_list) {
			var player = new BOARDFUL.ENGINE.Player(config.player_list[i], this.id);
			this.player_list.push(player.id);
		}
	}
	this.addListeners();
	// create event
	var event = new BOARDFUL.ENGINE.Event({
		source_type: "game",
		source_id: this.id,
		name: "GameStart"
	});
	this.event_mngr.add(event.id);
};
BOARDFUL.ENGINE.Game.next_id = 0;
// game list
BOARDFUL.ENGINE.GameList = new Object();

// add event listeners
BOARDFUL.ENGINE.Game.prototype.addListeners = function () {
	var that = this;
	this.event_mngr.on("GameStart", {
		level: "game",
		callback: function (arg) {
			that.start(arg);
		},
		instance: that
	});
	this.event_mngr.on("RoundStart", {
		level: "game",
		callback: function (arg) {
			that.roundStart(arg);
		},
		instance: that
	});
	this.event_mngr.on("RoundEnd", {
		level: "game",
		callback: function (arg) {
			that.roundEnd(arg);
		},
		instance: that
	});
	this.event_mngr.on("PlayerStart", {
		level: "game",
		callback: function (arg) {
			that.playerStart(arg);
		},
		instance: that
	});
	this.event_mngr.on("DealCards", {
		level: "game",
		callback: function (arg) {
			that.dealCards(arg);
		},
		instance: that
	});
};
// launch game
BOARDFUL.ENGINE.Game.prototype.run = function () {
	this.event_mngr.run();
};
// start game
BOARDFUL.ENGINE.Game.prototype.start = function (arg) {
	this.round = 0;
	this.player_list = BOARDFUL.ENGINE.shuffle(this.player_list);
	var card_list = BOARDFUL.ENGINE.loadCards("poker");
	BOARDFUL.ENGINE.DeckList[this.deck_list.draw].getCards(card_list);
	BOARDFUL.ENGINE.DeckList[this.deck_list.draw].shuffle();
	var event_list = new Array();
	for (var i in this.player_list) {
		var event = new BOARDFUL.ENGINE.Event({
			source_type: "game",
			source_id: this.id,
			name: "DealCards",
			deck: "draw",
			player: this.player_list[i],
			number: 5
		});
		event_list.push(event.id);
	}
	var event = new BOARDFUL.ENGINE.Event({
		source_type: "game",
		source_id: this.id,
		name: "RoundStart"
	});
	event_list.push(event.id);
	this.event_mngr.front(event_list);
};
// start a round
BOARDFUL.ENGINE.Game.prototype.roundStart = function (arg) {
	++ this.round;
	var event_list = new Array();
	var event;
	for (var i in this.player_list) {
		event = new BOARDFUL.ENGINE.Event({
			source_type: "game",
			source_id: this.id,
			name: "PlayerStart"
		});
		event_list.push(event.id);
		event = new BOARDFUL.ENGINE.Event({
			source_type: "game",
			source_id: this.id,
			name: "Player" + this.player_list[i] + "Start"
		});
		event_list.push(event.id);
		event = new BOARDFUL.ENGINE.Event({
			source_type: "game",
			source_id: this.id,
			name: "DealCards",
			deck: "draw",
			player: this.player_list[i],
			number: 2
		});
		event_list.push(event.id);
	}
	event = new BOARDFUL.ENGINE.Event({
		source_type: "game",
		source_id: this.id,
		name: "RoundEnd"
	});
	event_list.push(event.id);
	this.event_mngr.front(event_list);
};
// end a round
BOARDFUL.ENGINE.Game.prototype.roundEnd = function (arg) {
	var event = new BOARDFUL.ENGINE.Event({
		source_type: "game",
		source_id: this.id,
		name: "RoundStart"
	});
	this.event_mngr.add(event.id);
};
// player start
BOARDFUL.ENGINE.Game.prototype.playerStart = function (arg) {
	this.current_player = (this.current_player + 1) % this.player_list.length;
};
// deal cards
BOARDFUL.ENGINE.Game.prototype.dealCards = function (arg) {
	var  card_list = BOARDFUL.ENGINE.DeckList[this.deck_list[arg.deck]].dealCards(arg.number);
	console.log("deal cards", card_list);
	BOARDFUL.ENGINE.PlayerList[arg.player].hand = BOARDFUL.ENGINE.PlayerList[arg.player].hand.concat(card_list);
};
// deal cards
BOARDFUL.ENGINE.Game.prototype.playersDuel = function (arg) {
	var event = new BOARDFUL.ENGINE.Event({
		source_type: "game",
		source_id: this.id,
		name: "PlayersDuel"
	});
	this.event_mngr.add(event.id);
};
