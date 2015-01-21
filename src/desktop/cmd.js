/**
 * Command line interface.
 *
 * @author		Fei Zhan
 * @version		0.0
 * 
**/

var BOARDFUL = BOARDFUL || new Object();
BOARDFUL.DESKTOP = BOARDFUL.DESKTOP || new Object();

// command line
BOARDFUL.DESKTOP.Cmdline = function (owner) {
	this.type = "Cmdline";
	this.owner = owner;
	BOARDFUL.Mngr.add(this);
	this.addListeners();
	// set terminal
	process.stdin.resume();
	process.stdin.setEncoding('utf8');
};
// add listeners
BOARDFUL.DESKTOP.Cmdline.prototype.addListeners = function () {
	var that = this;
	BOARDFUL.Mngr.get(this.owner).event_mngr.on("PlayerStart", {
		level: "game",
		callback: function (arg) {
			that.playerStart(arg);
		},
		id: that.id
	});
	BOARDFUL.Mngr.get(this.owner).event_mngr.on("DealCardsUi", {
		level: "game",
		callback: function (arg) {
			that.dealCardsUi(arg);
		},
		id: that.id
	});
	BOARDFUL.Mngr.get(this.owner).event_mngr.on("SettlePlayersDuelUi", {
		level: "game",
		callback: function (arg) {
			that.settlePlayersDuelUi(arg);
		},
		id: that.id
	});
};
// output
BOARDFUL.DESKTOP.Cmdline.prototype.output = function () {
	console.log.apply(console, arguments);
};
// input
BOARDFUL.DESKTOP.Cmdline.prototype.input = function (callback) {
	process.stdin.once('data', callback);
};

// ui for player start
BOARDFUL.DESKTOP.Cmdline.prototype.playerStart = function (arg) {
	this.output("player start", arg.player);
};
// ui for deal cards
BOARDFUL.DESKTOP.Cmdline.prototype.dealCardsUi = function (arg) {
	this.output("deal cards", arg.cards);
};
// ui for settle players duel
BOARDFUL.DESKTOP.Cmdline.prototype.settlePlayersDuelUi = function (arg) {
	var text = "";
	for (var i in arg.players) {
		text += arg.players[i] + " " + BOARDFUL.Mngr.get(arg.cards[i]).name + "\n";
	}
	text += "winner " + arg.player;
	this.output("duel", text);
};

// show menu
BOARDFUL.DESKTOP.Cmdline.showMenu = function () {
	var that = this;
	if (BOARDFUL.BoardList.length > 0) {
		for (var i in BOARDFUL.BoardList) {
			console.log(i + ". " + BOARDFUL.BoardList[i].config.name);
			console.log("\t" + BOARDFUL.BoardList[i].config.descrip);
		}
		console.log("select a board:");
		process.stdin.once('data', function (text) {
			BOARDFUL.BoardList[parseInt(text)].load();
		});
	}
	else {
		setTimeout(BOARDFUL.DESKTOP.Cmdline.showMenu, 300);
	}
};
// launch project in desktop
BOARDFUL.run("desktop");
