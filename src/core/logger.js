/**
 * Logger.
 *
 * @author		Fei Zhan
 * @version		0.0
 * 
*/

var BOARDFUL = BOARDFUL || new Object();
BOARDFUL.ENGINE = BOARDFUL.ENGINE || new Object();
var winston = {
	transports: {
		File: undefined,
		Console: undefined
	}
};

// logger
BOARDFUL.ENGINE.Logger = function () {
	var logger;
	switch (BOARDFUL.ENGINE.Envi.type) {
	case "nodejs":
		winston = require('winston');
		logger = new (BOARDFUL.ENGINE.WinstonLogger) ({
			transports: [
				new (winston.transports.Console)()
			]
		});
		break;
	case "browser":
		logger = new BOARDFUL.ENGINE.DefaultLogger();
		break;
	default:
		logger = new BOARDFUL.ENGINE.DefaultLogger();
		break;
	}
	return logger;
};

// default logger
BOARDFUL.ENGINE.DefaultLogger = function () {
	//return console;
};
BOARDFUL.ENGINE.DefaultLogger.prototype.log = function () {
	//console.log.apply(console, arguments);
	return this;
};
BOARDFUL.ENGINE.DefaultLogger.prototype.add = function () {
	return this;
};
BOARDFUL.ENGINE.DefaultLogger.prototype.remove = function () {
	return this;
};

// winston logger for nodejs
BOARDFUL.ENGINE.WinstonLogger = function (config) {
	this.winston = new (winston.Logger) (config);
	this.winston.log_base = this.winston.log;
	// new log function
	this.winston.log = function () {
		if ("nodejs" == BOARDFUL.ENGINE.Envi.type) {
			for (var i in arguments) {
				// convert to string
				if ("array" == typeof arguments[i] || "object" == typeof arguments[i] || "function" == typeof arguments[i]) {
					arguments[i] = BOARDFUL.ENGINE.toString(arguments[i]);
				}
			}
		}
		return this.log_base.apply(this, arguments);
	};
	return this.winston;
};