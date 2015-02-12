/**
 * File manager.
 *
 * @author		Fei Zhan
 * @version		0.0
 * 
**/

var BOARDFUL = BOARDFUL || new Object();

// file manager
BOARDFUL.File = BOARDFUL.File || new Object();
// init file manager
BOARDFUL.File.init = function () {
	// file mngr logger
	BOARDFUL.File.logger = new BOARDFUL.Logger();
	BOARDFUL.File.logger.add(winston.transports.File, {
		filename: 'logs/file.log'
	})
	.remove(winston.transports.Console);
	BOARDFUL.File.logger.log('info', "----------launch----------");
};
// file list
BOARDFUL.File.list = new Object();
// file list by name
BOARDFUL.File.name_list = new Object();
BOARDFUL.File.next_id = 0;
// add to file list
BOARDFUL.File.add = function (file, content, status) {
	// new file
	if (! (file in BOARDFUL.File.name_list)) {
		BOARDFUL.File.list[BOARDFUL.File.next_id] = {
			name: file,
			type: "",
			content: content,
			status: status
		};
		BOARDFUL.File.name_list[file] = BOARDFUL.File.next_id;
		++ BOARDFUL.File.next_id;
	}
	else {
		BOARDFUL.File.list[BOARDFUL.File.name_list[file]] = {
			name: file,
			content: content,
			status: status
		};
	}
};
// get file list in current html
BOARDFUL.File.getFromHtml = function () {
	$("script").each(function () {
		BOARDFUL.File.add($(this).attr("src"), $(this), "loaded");
	});
	BOARDFUL.File.logger.log('info', "files in html", BOARDFUL.File.name_list);
};
// set file script to MODS scope
BOARDFUL.File.setToMods = function (file) {
	var script = BOARDFUL.File.list[BOARDFUL.File.name_list[file]].content;
	if (("array" == typeof script || "object" == typeof script || "function" == typeof script) && "name" in script) {
		BOARDFUL.MODS[script.name] = script;
	} else {
		for (var i in script) {
			BOARDFUL.MODS[i] = script[i];
		}
	}
};

// file loader
BOARDFUL.FileLoader = function (list, callback) {
	this.list = list;
	this.callback = callback;
	this.done = false;
	this.load();
};
// load files and wait
BOARDFUL.FileLoader.prototype.load = function () {
	this.done = true;
	for (var i in this.list) {
		if (! (this.list[i] in BOARDFUL.File.name_list) || "loaded" != BOARDFUL.File.list[BOARDFUL.File.name_list[this.list[i]]].status) {
			this.done = false;
			this.loadFile(this.list[i]);
			BOARDFUL.File.logger.log("info", "loading", this.list[i]);
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
BOARDFUL.FileLoader.prototype.loadFile = function (file) {
	switch (BOARDFUL.Envi.type) {
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
BOARDFUL.FileLoader.prototype.loadByRequire = function (file) {
	try {
		var script = require("../" + file);
		BOARDFUL.File.add(file, script, "loaded");
		BOARDFUL.File.logger.log("info", "file loaded", file);
	} catch (err) {
		BOARDFUL.File.add(file, "", "failed");
		BOARDFUL.File.logger.log("info", "file failed", file, err);
	}
};
// load a file via ajax by browser
BOARDFUL.FileLoader.prototype.loadByAjax = function (file) {
	var true_file = "../" + file;
	if (".js" == file.substr(file.length - 3)) {
		// load a js script
		$.getScript(true_file)
			.done(function( script, textStatus ) {
				BOARDFUL.File.add(file, script, "loaded");
				BOARDFUL.File.logger.log("info", "js loaded", file);
			})
			.fail(function( jqxhr, settings, exception ) {
				BOARDFUL.File.add(file, "", "failed");
				BOARDFUL.File.logger.log("info", "js failed", file);
			});
	}
	else if (".css" == file.substr(file.length - 4)) {
		// load a css
		$('head').append( $('<link rel="stylesheet" type="text/css" />').attr('href', true_file) );
		BOARDFUL.File.add(file, "", "loaded");
		BOARDFUL.File.logger.log("info", "css loaded", file);
	}
	else if (".json" == file.substr(file.length - 5)) {
		$.getJSON(true_file, function(data, textStatus, jqXHR) {
			BOARDFUL.File.add(file, data, "loaded");
			BOARDFUL.File.logger.log("info", "json loaded", file);
		})
		.fail(function (jqXHR, textStatus, errorThrown) {
			BOARDFUL.File.add(file, "", "failed");
			BOARDFUL.File.logger.log("info", "json failed", file);
		})
		.always(function(data, textStatus, jqXHR) {
		});
	}
	else {
		BOARDFUL.File.add(file, "", "loaded");
		BOARDFUL.File.logger.log("info", "file unknown", file);
	}
};
