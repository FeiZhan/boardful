/**
 * Card.
 *
 * @author		Fei Zhan
 * @version		0.0
 * 
**/

var BOARDFUL = BOARDFUL || new Object();
BOARDFUL.CORE = BOARDFUL.CORE || new Object();

// card
BOARDFUL.CORE.Card = function (config, owner) {
	this.type = "Card";
	this.rank = config.rank;
	this.suit = config.suit;
	this.color = config.color;
	this.name = config.name || this.suit + "_" + this.rank;
	this.owner = owner;
	this.game = BOARDFUL.Mngr.get(this.owner).game;
	this.ui = undefined;
	BOARDFUL.Mngr.add(this);
};