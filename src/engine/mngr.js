/**
 * Object manager.
 *
 * @author  Fei Zhan
 * @version 0.0
**/

var BOARDFUL = BOARDFUL || new Object();
BOARDFUL.ENGINE = BOARDFUL.ENGINE || new Object();

// object manager
BOARDFUL.ENGINE.Manager = function () {
	this.logger = new BOARDFUL.ENGINE.Logger();
	if ("nodejs" == BOARDFUL.ENGINE.Envi.type) {
		this.logger.add(winston.transports.File, {
			filename: 'logs/mngr.log'
		})
		.remove(winston.transports.Console);
	}
	this.logger.log('info', "----------launch----------");
	this.next_id = 0;
	this.list = new Object();
};
// get object by id
BOARDFUL.ENGINE.Manager.prototype.get = function (id) {
	return this.list[id];
};
// add object
BOARDFUL.ENGINE.Manager.prototype.add = function (object) {
	object.id = this.next_id;
	object.type = object.type || object.constructor.name;
	if (! ("name" in object)) {
		object.name = object.type + "_" + object.id;
	}
	++ this.next_id;
	this.list[object.id] = object;
	this.logger.log("info", "add", object.name, object);
	return object.id;
};
