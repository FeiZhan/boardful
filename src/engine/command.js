/**
 * Command.
 *
 * @author		Fei Zhan
 * @version		0.0
**/

var BOARDFUL = BOARDFUL || new Object();
BOARDFUL.ENGINE = BOARDFUL.ENGINE || new Object();

// command
BOARDFUL.ENGINE.Command = new Object();
BOARDFUL.ENGINE.Command.call = function (cmd) {
	var arg_list = cmd.split();
	if (0 == arg_list.length) {
		return;
	}
	cmd = arg_list[0];
	arg_list = arg_list.shift();
	if (cmd in BOARDFUL.ENGINE.Command.list) {
		return BOARDFUL.ENGINE.Command.list[cmd](arg_list);
	} else {
		console.log("unknow cmd", cmd);
	}
};
BOARDFUL.ENGINE.Command.list = {
	"why": function () {
		console.log("because I am rich and bitch");
	},
};
