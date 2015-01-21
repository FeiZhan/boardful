/**
 * File manager.
 *
 * @author		Fei Zhan
 * @version		0.0
 * 
*/

var BOARDFUL = BOARDFUL || new Object();
BOARDFUL.ENGINE = BOARDFUL.ENGINE || new Object();

BOARDFUL.ENGINE.File = BOARDFUL.ENGINE.File || new Object();
// init file manager
BOARDFUL.ENGINE.File.init = function () {
	// file mngr logger
	BOARDFUL.ENGINE.FileLogger = new BOARDFUL.ENGINE.Logger();
	BOARDFUL.ENGINE.FileLogger.add(winston.transports.File, {
		filename: 'logs/file.log'
	})
	.remove(winston.transports.Console);
	BOARDFUL.ENGINE.FileLogger.log('info', "----------launch----------");
};
// file list
BOARDFUL.ENGINE.File.list = new Object();
// file list by name
BOARDFUL.ENGINE.File.name_list = new Object();
BOARDFUL.ENGINE.File.next_id = 0;
// add to file list
BOARDFUL.ENGINE.File.add = function (file, content, status) {
	// new file
	if (! (file in BOARDFUL.ENGINE.File.name_list)) {
		BOARDFUL.ENGINE.File.list[BOARDFUL.ENGINE.File.next_id] = {
			name: file,
			type: "",
			content: content,
			status: status
		};
		BOARDFUL.ENGINE.File.name_list[file] = BOARDFUL.ENGINE.File.next_id;
		++ BOARDFUL.ENGINE.File.next_id;
	}
	else {
		BOARDFUL.ENGINE.File.list[BOARDFUL.ENGINE.File.name_list[file]] = {
			name: file,
			content: content,
			status: status
		};
	}
};
// get file list in current html
BOARDFUL.ENGINE.File.getFromHtml = function () {
	$("script").each(function () {
		BOARDFUL.ENGINE.File.add($(this).attr("src"), $(this), "loaded");
	});
	BOARDFUL.ENGINE.FileLogger.log('info', "files in html", BOARDFUL.ENGINE.File.name_list);
};
// set file script to MODS scope
BOARDFUL.ENGINE.File.setToMods = function (file) {
	var script = BOARDFUL.ENGINE.File.list[BOARDFUL.ENGINE.File.name_list[file]].content;
	for (var i in script) {
		BOARDFUL.MODS[i] = script[i];
	}
};

// file loader
BOARDFUL.ENGINE.FileLoader = function (list, callback) {
	this.list = list;
	this.callback = callback;
	this.done = false;
	this.load();
};
// load files and wait
BOARDFUL.ENGINE.FileLoader.prototype.load = function () {
	BOARDFUL.ENGINE.FileLogger.log("info", "loading", this.list);
	this.done = true;
	for (var i in this.list) {
		if (! (this.list[i] in BOARDFUL.ENGINE.File.name_list) || "loaded" != BOARDFUL.ENGINE.File.list[BOARDFUL.ENGINE.File.name_list[this.list[i]]].status) {
			this.done = false;
			this.loadFile(this.list[i]);
		}
	}
	var that = this;
	if (! this.done) {
		setTimeout(function () {
			that.load();
		}, 500);
	} else {
		this.callback();
	}
};
// load a file
BOARDFUL.ENGINE.FileLoader.prototype.loadFile = function (file) {
	switch (BOARDFUL.ENGINE.Envi.type) {
	case "browser":
		this.loadByAjax(file);
		break;
	case "nodejs":
		this.loadByRequire(file);
		break;
	default:
		break;
	}
}
BOARDFUL.ENGINE.FileLoader.prototype.loadByRequire = function (file) {
	try {
		var script = require("../" + file);
		BOARDFUL.ENGINE.File.add(file, script, "loaded");
		BOARDFUL.ENGINE.FileLogger.log("info", "file loaded", file);
	} catch (err) {
		BOARDFUL.ENGINE.File.add(file, "", "failed");
		BOARDFUL.ENGINE.FileLogger.log("info", "file failed", file, err);
	}
};
// load a file via ajax by browser
BOARDFUL.ENGINE.FileLoader.prototype.loadByAjax = function (file) {
	if (".js" == file.substr(file.length - 3)) {
		// load a js script
		$.getScript(file)
			.done(function( script, textStatus ) {
				BOARDFUL.ENGINE.File.add(file, script, "loaded");
				BOARDFUL.ENGINE.FileLogger.log("info", "js loaded", file);
			})
			.fail(function( jqxhr, settings, exception ) {
				BOARDFUL.ENGINE.File.add(file, "", "failed");
				BOARDFUL.ENGINE.FileLogger.log("info", "js failed", file);
			});
	}
	else if (".css" == file.substr(file.length - 4)) {
		// load a css
		$('head').append( $('<link rel="stylesheet" type="text/css" />').attr('href', file) );
		BOARDFUL.ENGINE.File.add(file, "", "loaded");
		BOARDFUL.ENGINE.FileLogger.log("info", "css loaded");
		BOARDFUL.ENGINE.FileLogger.log("info", file);
	}
	else if (".json" == file.substr(file.length - 5)) {
		$.getJSON(file, function(data, textStatus, jqXHR) {
			BOARDFUL.ENGINE.File.add(file, data, "loaded");
			BOARDFUL.ENGINE.FileLogger.log("info", "json loaded", file);
		})
		.fail(function (jqXHR, textStatus, errorThrown) {
			BOARDFUL.ENGINE.File.add(file, "", "failed");
			BOARDFUL.ENGINE.FileLogger.log("info", "json failed", file);
		})
		.always(function(data, textStatus, jqXHR) {
		});
	}
	else {
		BOARDFUL.ENGINE.File.add(file, "", "failed");
		BOARDFUL.ENGINE.FileLogger.log("info", "file unknown", file);
	}
};
