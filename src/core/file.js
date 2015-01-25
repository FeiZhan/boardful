/**
 * File manager.
 *
 * @author		Fei Zhan
 * @version		0.0
 * 
**/

var BOARDFUL = BOARDFUL || new Object();
BOARDFUL.CORE = BOARDFUL.CORE || new Object();

// file manager
BOARDFUL.CORE.File = BOARDFUL.CORE.File || new Object();
// init file manager
BOARDFUL.CORE.File.init = function () {
	// file mngr logger
	BOARDFUL.CORE.File.logger = new BOARDFUL.CORE.Logger();
	BOARDFUL.CORE.File.logger.add(winston.transports.File, {
		filename: 'logs/file.log'
	})
	.remove(winston.transports.Console);
	BOARDFUL.CORE.File.logger.log('info', "----------launch----------");
};
// file list
BOARDFUL.CORE.File.list = new Object();
// file list by name
BOARDFUL.CORE.File.name_list = new Object();
BOARDFUL.CORE.File.next_id = 0;
// add to file list
BOARDFUL.CORE.File.add = function (file, content, status) {
	// new file
	if (! (file in BOARDFUL.CORE.File.name_list)) {
		BOARDFUL.CORE.File.list[BOARDFUL.CORE.File.next_id] = {
			name: file,
			type: "",
			content: content,
			status: status
		};
		BOARDFUL.CORE.File.name_list[file] = BOARDFUL.CORE.File.next_id;
		++ BOARDFUL.CORE.File.next_id;
	}
	else {
		BOARDFUL.CORE.File.list[BOARDFUL.CORE.File.name_list[file]] = {
			name: file,
			content: content,
			status: status
		};
	}
};
// get file list in current html
BOARDFUL.CORE.File.getFromHtml = function () {
	$("script").each(function () {
		BOARDFUL.CORE.File.add($(this).attr("src"), $(this), "loaded");
	});
	BOARDFUL.CORE.File.logger.log('info', "files in html", BOARDFUL.CORE.File.name_list);
};
// set file script to MODS scope
BOARDFUL.CORE.File.setToMods = function (file) {
	var script = BOARDFUL.CORE.File.list[BOARDFUL.CORE.File.name_list[file]].content;
	for (var i in script) {
		BOARDFUL.MODS[i] = script[i];
	}
};

// file loader
BOARDFUL.CORE.FileLoader = function (list, callback) {
	this.list = list;
	this.callback = callback;
	this.done = false;
	this.load();
};
// load files and wait
BOARDFUL.CORE.FileLoader.prototype.load = function () {
	this.done = true;
	for (var i in this.list) {
		if (! (this.list[i] in BOARDFUL.CORE.File.name_list) || "loaded" != BOARDFUL.CORE.File.list[BOARDFUL.CORE.File.name_list[this.list[i]]].status) {
			this.done = false;
			this.loadFile(this.list[i]);
			BOARDFUL.CORE.File.logger.log("info", "loading", this.list[i]);
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
BOARDFUL.CORE.FileLoader.prototype.loadFile = function (file) {
	switch (BOARDFUL.CORE.Envi.type) {
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
BOARDFUL.CORE.FileLoader.prototype.loadByRequire = function (file) {
	try {
		var script = require("../" + file);
		BOARDFUL.CORE.File.add(file, script, "loaded");
		BOARDFUL.CORE.File.logger.log("info", "file loaded", file);
	} catch (err) {
		BOARDFUL.CORE.File.add(file, "", "failed");
		BOARDFUL.CORE.File.logger.log("info", "file failed", file, err);
	}
};
// load a file via ajax by browser
BOARDFUL.CORE.FileLoader.prototype.loadByAjax = function (file) {
	var true_file = "../" + file;
	if (".js" == file.substr(file.length - 3)) {
		// load a js script
		$.getScript(true_file)
			.done(function( script, textStatus ) {
				BOARDFUL.CORE.File.add(file, script, "loaded");
				BOARDFUL.CORE.File.logger.log("info", "js loaded", file);
			})
			.fail(function( jqxhr, settings, exception ) {
				BOARDFUL.CORE.File.add(file, "", "failed");
				BOARDFUL.CORE.File.logger.log("info", "js failed", file);
			});
	}
	else if (".css" == file.substr(file.length - 4)) {
		// load a css
		$('head').append( $('<link rel="stylesheet" type="text/css" />').attr('href', true_file) );
		BOARDFUL.CORE.File.add(file, "", "loaded");
		BOARDFUL.CORE.File.logger.log("info", "css loaded", file);
	}
	else if (".json" == file.substr(file.length - 5)) {
		$.getJSON(true_file, function(data, textStatus, jqXHR) {
			BOARDFUL.CORE.File.add(file, data, "loaded");
			BOARDFUL.CORE.File.logger.log("info", "json loaded", file);
		})
		.fail(function (jqXHR, textStatus, errorThrown) {
			BOARDFUL.CORE.File.add(file, "", "failed");
			BOARDFUL.CORE.File.logger.log("info", "json failed", file);
		})
		.always(function(data, textStatus, jqXHR) {
		});
	}
	else {
		BOARDFUL.CORE.File.add(file, "", "loaded");
		BOARDFUL.CORE.File.logger.log("info", "file unknown", file);
	}
};
