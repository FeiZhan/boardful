var winston = require('winston');
var BOARDFUL = BOARDFUL || new Object();

BOARDFUL.logger = new (winston.Logger) ({
	transports: [
		new (winston.transports.Console)(),
		new (winston.transports.File)({ filename: 'somefile.log' })
	]
});
