/**
 * Logger.
 *
 * @author		Fei Zhan
 * @version		0.0
 * 
**/

var BOARDFUL = BOARDFUL || new Object();
BOARDFUL.CORE = BOARDFUL.CORE || new Object();
var winston = {
	transports: {
		File: "File",
		Console: "Console"
	}
};

// logger
BOARDFUL.CORE.Logger = function () {
	var logger;
	switch (BOARDFUL.CORE.Envi.type) {
	case "nodejs":
		winston = require('winston');
		logger = new (BOARDFUL.CORE.WinstonLogger) ({
			transports: [
				new (winston.transports.Console)()
			]
		});
		break;
	case "browser":
		logger = new BOARDFUL.CORE.DefaultLogger();
		break;
	default:
		logger = new BOARDFUL.CORE.DefaultLogger();
		break;
	}
	return logger;
};

// default logger
BOARDFUL.CORE.DefaultLogger = function () {
	this.enable = true;
	//return console;
};
BOARDFUL.CORE.DefaultLogger.prototype.log = function () {
	if (this.enable) {
		console.log.apply(console, arguments);
	}
	return this;
};
BOARDFUL.CORE.DefaultLogger.prototype.add = function (type) {
	if ("Console" == type) {
		this.enable = true;
	}
	return this;
};
BOARDFUL.CORE.DefaultLogger.prototype.remove = function (type) {
	if ("Console" == type) {
		this.enable = false;
	}
	return this;
};

// winston logger for nodejs
BOARDFUL.CORE.WinstonLogger = function (config) {
	this.winston = new (winston.Logger) (config);
	this.winston.log_base = this.winston.log;
	// new log function
	this.winston.log = function () {
		if ("nodejs" == BOARDFUL.CORE.Envi.type) {
			for (var i in arguments) {
				// convert to string
				if ("array" == typeof arguments[i] || "object" == typeof arguments[i] || "function" == typeof arguments[i]) {
					arguments[i] = BOARDFUL.CORE.toString(arguments[i]);
				}
			}
		}
		return this.log_base.apply(this, arguments);
	};
	return this.winston;
};
