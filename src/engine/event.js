/**
 * Event.
 *
 * @author  Fei Zhan
 * @version 0.0
**/

var BOARDFUL = BOARDFUL || new Object();
BOARDFUL.ENGINE = BOARDFUL.ENGINE || new Object();

// event
BOARDFUL.ENGINE.Event = function (name) {
	this.id = BOARDFUL.ENGINE.Event.next_id;
	BOARDFUL.ENGINE.EventList[this.id] = this;
	++ BOARDFUL.ENGINE.Event.next_id;
	this.name = name;
};
BOARDFUL.ENGINE.Event.next_id = 0;
// event list
BOARDFUL.ENGINE.EventList = new Object();

// event level precedence
BOARDFUL.ENGINE.EventLevels = ["top", "system", "server", "board", "room", "game", "extension", "player", "card", "rear"];
// event manager
BOARDFUL.ENGINE.EventMngr = function () {
	this.list = new Array();
	this.listenerList = new Object();
	this.timeout = 300;
	this.logger = new BOARDFUL.ENGINE.Logger();
	this.logger.add(winston.transports.File, {
		filename: 'logs/event.log'
	})
	.remove(winston.transports.Console);
};
// see or push to the front of event list
BOARDFUL.ENGINE.EventMngr.prototype.front = function (id) {
	if (undefined === id) {
		if (0 == this.list.length) {
			return undefined;
		}
	} else {
		this.list.unshift(id);
	}
	return BOARDFUL.ENGINE.EventList[this.list[0]];
};
// add to the rear of event list
BOARDFUL.ENGINE.EventMngr.prototype.add = function (id) {
	this.list.push(id);
};
// add event listener
BOARDFUL.ENGINE.EventMngr.prototype.on = function (event, config) {
	if (! (event in this.listenerList)) {
		this.listenerList[event] = new Object();
	}
	config.level = config.level || "rear";
	if (! (config.level in this.listenerList[event])) {
		this.listenerList[event][config.level] = new Array();
	}
	this.listenerList[event][config.level].push(config);
	this.logger.log("info", "add listener", event, config);
};
// remove event listener
BOARDFUL.ENGINE.EventMngr.prototype.off = function (event, config) {
	if (! (event in this.listenerList)) {
		return;
	}
	config.level = config.level || "extension";
	if (! (config.level in this.listenerList[event])) {
		return;
	}
	var index = this.listenerList[event][config.level].indexOf(config);
	if (index >= 0) {
		this.listenerList[event][config.level].splice(index, 1);
	}
};
// launch event manager
BOARDFUL.ENGINE.EventMngr.prototype.run = function () {
	if (this.list.length > 0) {
		// get the current event
		var event = this.front();
		this.list.shift();
		this.logger.log("info", "event", event);
		if (event.name in this.listenerList) {
			for (var i in BOARDFUL.ENGINE.EventLevels) {
				if (BOARDFUL.ENGINE.EventLevels[i] in this.listenerList[event.name]) {
					for (var j in this.listenerList[event.name][BOARDFUL.ENGINE.EventLevels[i]]) {
						var listener = this.listenerList[event.name][BOARDFUL.ENGINE.EventLevels[i]][j];
						// trigger listener callback for event
						listener.callback();
						this.logger.log("info", "trigger", listener);
					}
				}
			}
		}
	}
	var that = this;
	// start next event
	setTimeout(function () {
		that.run();
	}, this.timeout);
};
