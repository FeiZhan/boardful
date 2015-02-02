/**
 * AI for uno game.
 *
 * @author		Fei Zhan
 * @version		0.0
 * 
**/

// if nodejs, load BOARDFUL
if (typeof module !== 'undefined' && module.exports) {
	var BOARDFUL = require("../../build/boardful.core.js");
	var Uno = require("./cards.js");
	module.exports = Uno;
} else {
	BOARDFUL.MODS = BOARDFUL.MODS || new Object();
	var Uno = BOARDFUL.MODS.Uno || new Object();
}
