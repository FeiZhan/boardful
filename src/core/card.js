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
	this.name = "card_" + this.rank + "_" + this.suit;
	this.owner = owner;
	this.game = this.owner;
	this.ui = undefined;
	while (BOARDFUL.Mngr.get(this.game) && "Game" != BOARDFUL.Mngr.get(this.game).type) {
		this.game = BOARDFUL.Mngr.get(this.game).owner;
	}
	BOARDFUL.Mngr.add(this);
};