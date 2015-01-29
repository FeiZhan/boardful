/**
 * Gui for game.
 *
 * @author		Fei Zhan
 * @version		0.0
**/

var BOARDFUL = BOARDFUL || new Object();
BOARDFUL.BRSR = BOARDFUL.BRSR || new Object();

// game ui
BOARDFUL.BRSR.GameUi = function (owner) {
	this.type = "GameUi";
	this.owner = owner;
	BOARDFUL.Mngr.add(this);
	BOARDFUL.CORE.Command.owner = this.owner;
	this.addListeners();
	$("#content").empty();
	$("#content").hide().load("src/browser/game.html", function () {
		$(this).fadeIn("slow");
		$("#content #playerok").on("click", function () {
		});
		$("#content #table").droppable({
			drop: function(event, ui) {
				BOARDFUL.Mngr.get(parseInt($(ui.draggable).attr("id"))).instance.owner = undefined;
				var element = $(ui.draggable).detach();
				element.css({
					top: "auto",
					left: "auto"
				});
				$(this).append(element);
			}
		});
	});
	this.player_list = new Array();
	for (var i in BOARDFUL.Mngr.get(this.owner).player_list) {
		this.player_list.push(new BOARDFUL.BRSR.PlayerUi(BOARDFUL.Mngr.get(this.owner).player_list[i]).id);
	}
	var load_files = new BOARDFUL.CORE.FileLoader(["src/browser/game.html", "src/browser/game.css"], function () {
	});
};

BOARDFUL.BRSR.GameUi.prototype.addListeners = function () {
	var that = this;
	BOARDFUL.Mngr.get(this.owner).event_mngr.on("DealCardUi", {
		level: "game",
		callback: function (arg) {
			that.dealCardUi(arg);
		},
		id: that.id
	});
};
// ui for deal cards
BOARDFUL.BRSR.GameUi.prototype.dealCardUi = function (arg) {
	var card = new BOARDFUL.BRSR.CardUi(arg.card, this);
	var target_pos = new Object();
	var target_html_id = "";
	switch (BOARDFUL.Mngr.get(arg.player).name) {
	case "ai":
		target_pos = {
			top: "10%",
			left: "45%"
		};
		target_dom_id = "yourhand";
		break;
	case "me":
	default:
		target_pos = {
			top: "70%",
			left: "45%"
		};
		target_dom_id = "myhand";
		break;
	}
	card.move({
		position: target_pos,
		dom_id: target_dom_id
	});
};