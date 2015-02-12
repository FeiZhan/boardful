/**
 * Event.
 *
 * @author		Fei Zhan
 * @version		0.0
**/

var BOARDFUL = BOARDFUL || new Object();

// event
BOARDFUL.Event = function (arg) {
	this.type = "Event";
	this.owner = undefined;
	BOARDFUL.Mngr.add(this);
	this.name = arg.name;
	this.arg = arg;
	this.arg.creation_time = new Date();
};

// event level precedence
BOARDFUL.EVENT_LEVELS = ["top", "system", "server", "board", "room", "game", "extension", "player", "card", "rear"];
// event manager
BOARDFUL.EventMngr = function (owner) {
	this.type = "EventMngr";
	this.owner = owner;
	BOARDFUL.Mngr.add(this);
	this.current = undefined;
	this.list = new Array();
	this.listener_list = new Object();
	this.timeout = 20;
	this.logger = new BOARDFUL.Logger();
	this.logger.add(winston.transports.File, {
		filename: 'logs/event.log'
	})
	.remove(winston.transports.Console);
	this.logger.log('info', "----------launch----------");
	this.name_logger = new BOARDFUL.Logger();
	this.name_logger.add(winston.transports.File, {
		filename: 'logs/event_name.log'
	})
	.remove(winston.transports.Console);
	this.name_logger.log('info', "----------launch----------");
};
// see or push to the front of event list
BOARDFUL.EventMngr.prototype.front = function (id) {
	if (undefined === id) {
		if (0 == this.list.length) {
			return undefined;
		}
	}
	else if ("array" == typeof id || "object" == typeof id) {
		this.list = id.concat(this.list);
		for (var i in id) {
			this.logger.log("info", "prepend events", BOARDFUL.Mngr.get(id[i]).name);
		}
	}
	else {
		this.list.unshift(id);
		this.logger.log("info", "prepend event", BOARDFUL.Mngr.get(id).name);
	}
	return BOARDFUL.Mngr.get(this.list[0]);
};
// add to the rear of event list
BOARDFUL.EventMngr.prototype.add = function (id) {
	if ("array" == typeof id || "object" == typeof id) {
		this.list = this.list.concat(id);
		for (var i in id) {
			this.logger.log("info", "append events", BOARDFUL.Mngr.get(id[i]).name);
		}
	}
	else {
		this.list.push(id);
		this.logger.log("info", "append event", BOARDFUL.Mngr.get(id).name);
	}
};
// add event listener
BOARDFUL.EventMngr.prototype.on = function (event, config) {
	if (! (event in this.listener_list)) {
		this.listener_list[event] = new Object();
	}
	config.level = config.level || "rear";
	if (! (config.level in this.listener_list[event])) {
		this.listener_list[event][config.level] = new Array();
	}
	this.listener_list[event][config.level].push(config);
	this.logger.log("info", "add listener", event);
};
// remove event listener
BOARDFUL.EventMngr.prototype.off = function (event, config) {
	if (! (event in this.listener_list)) {
		return;
	}
	config.level = config.level || "extension";
	if (! (config.level in this.listener_list[event])) {
		return;
	}
	var index = this.listener_list[event][config.level].indexOf(config);
	if (index >= 0) {
		this.listener_list[event][config.level].splice(index, 1);
	}
};
// launch event manager
BOARDFUL.EventMngr.prototype.run = function () {
	switch (BOARDFUL.Mngr.get(this.owner).status) {
	case "pause":
	case "exit":
	case "userinput":
	case "uieffect":
		break;
	case "run":
	default:
		if (this.list.length > 0) {
			// get the current event
			this.current = this.front();
			this.logger.log("info", "event", this.current.name, this.current);
			this.name_logger.log("info", this.current.name);
			this.list.shift();
			if (this.current && (this.current.name in this.listener_list)) {
				for (var i in BOARDFUL.EVENT_LEVELS) {
					if (BOARDFUL.EVENT_LEVELS[i] in this.listener_list[this.current.name]) {
						for (var j in this.listener_list[this.current.name][BOARDFUL.EVENT_LEVELS[i]]) {
							var listener = this.listener_list[this.current.name][BOARDFUL.EVENT_LEVELS[i]][j];
							this.logger.log("info", "listener", BOARDFUL.Mngr.get(listener.id).name);
							// trigger listener callback for event
							listener.callback(this.current.arg);
						}
					}
				}
			}
		}
		break;
	}
	var that = this;
	// start next event
	setTimeout(function () {
		that.run();
	}, this.timeout);
};
