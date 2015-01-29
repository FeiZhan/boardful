/**
 * Gui for player.
 *
 * @author		Fei Zhan
 * @version		0.0
**/

var BOARDFUL = BOARDFUL || new Object();
BOARDFUL.BRSR = BOARDFUL.BRSR || new Object();

// gui for player
BOARDFUL.BRSR.PlayerUi = function (owner) {
	this.type = "PlayerUi";
	this.owner = owner;
	BOARDFUL.Mngr.add(this);
	var load;
	switch (BOARDFUL.Mngr.get(this.owner).name) {
	case "ai":
		load = "src/browser/player_you.html";
		break;
	case "me":
	default:
		load = "src/browser/player_me.html";
		break;
	}
	$.get(load, function (text, status, xhr) {
		$("#content").append(text).fadeIn('slow');
	});
	var load_files = new BOARDFUL.CORE.FileLoader(["src/browser/player_me.html", "src/browser/player_you.html", "src/browser/player.css"], function () {});
};