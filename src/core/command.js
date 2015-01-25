/**
 * Command.
 *
 * @author		Fei Zhan
 * @version		0.0
**/

var BOARDFUL = BOARDFUL || new Object();
BOARDFUL.CORE = BOARDFUL.CORE || new Object();

// command
BOARDFUL.CORE.Command = BOARDFUL.CORE.Command || new Object();
BOARDFUL.CORE.Command.owner = undefined;
// call command function
BOARDFUL.CORE.Command.call = function (cmd) {
	var arg_list = cmd.replace(/\s/g, " ").split(" ");
	if (0 == arg_list.length) {
		return;
	}
	cmd = arg_list[0];
	arg_list.shift();
	if (cmd in BOARDFUL.CORE.Command.list) {
		return BOARDFUL.CORE.Command.list[cmd](arg_list);
	} else {
		console.log("unknow cmd", cmd);
	}
};
BOARDFUL.CORE.Command.list = {
	"test": function (args) {
		console.log("Hello Boardful !");
	},
	"get": function (args) {
		var obj = BOARDFUL.Mngr.get(args[0]);
		if (obj) {
			console.log(obj.name);
		} else {
			console.log(obj);
		}
	},
	"object": function (args) {
		console.log(BOARDFUL.Mngr.get(args[0]));
	},
	"currentEvent": function (args) {
		if (BOARDFUL.CORE.Command.owner) {
			console.log(BOARDFUL.Mngr.get(BOARDFUL.CORE.Command.owner).event_mngr.current.name);
		} else {
			console.log(undefined);
		}
	},
	"nextEvent": function (args) {
		if (BOARDFUL.CORE.Command.owner) {
			console.log(BOARDFUL.Mngr.get(BOARDFUL.CORE.Command.owner).event_mngr.list[0]);
		} else {
			console.log(undefined);
		}
	},
	"boards": function (args) {
		console.log(BOARDFUL.BoardList);
	},
	"pause": function (args) {
		if (BOARDFUL.CORE.Command.owner) {
			BOARDFUL.Mngr.get(BOARDFUL.CORE.Command.owner).pause();
		}
	},
	"resume": function (args) {
		if (BOARDFUL.CORE.Command.owner) {
			BOARDFUL.Mngr.get(BOARDFUL.CORE.Command.owner).resume();
		}
	},
	"exit": function (args) {
		process.exit(0);
	},
};
