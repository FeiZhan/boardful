/**
* Define the namespace.
*
* @author  Fei Zhan
* @version 0.0
*/

var BOARDFUL = BOARDFUL || new Object();
BOARDFUL.init = function () {
	BOARDFUL.urlparam = BOARDFUL.ENGINE.parseUrl();
	BOARDFUL.ENGINE.getFilesInHtml();
};

/**
* File loader.
*
* @author  Fei Zhan
* @version 0.0
*/

var BOARDFUL = BOARDFUL || new Object();
BOARDFUL.ENGINE = BOARDFUL.ENGINE || new Object();

BOARDFUL.ENGINE.FileList = new Object();
BOARDFUL.ENGINE.FileNameList = new Object();
BOARDFUL.ENGINE.NextFileId = 0;
BOARDFUL.ENGINE.addToFileList = function (file, content, status) {
	if (! (file in BOARDFUL.ENGINE.FileNameList)) {
		BOARDFUL.ENGINE.FileList[BOARDFUL.ENGINE.NextFileId] = {
			name: file,
			type: "",
			content: content,
			status: status
		};
		BOARDFUL.ENGINE.FileNameList[file] = BOARDFUL.ENGINE.NextFileId;
		++ BOARDFUL.ENGINE.NextFileId;
	}
	else {
		BOARDFUL.ENGINE.FileList[BOARDFUL.ENGINE.FileNameList[file]] = {
			name: file,
			content: content,
			status: status
		};
	}
};
BOARDFUL.ENGINE.getFilesInHtml = function () {
	$("script").each(function () {
		BOARDFUL.ENGINE.addToFileList($(this).attr("src"), $(this), "loaded");
	});
};
BOARDFUL.ENGINE.loadFile = function (file) {
	if (".js" == file.substr(file.length - 3)) {
		// load a js script
		$.getScript(file)
			.done(function( script, textStatus ) {
				BOARDFUL.ENGINE.addToFileList(file, script, "loaded");
			})
			.fail(function( jqxhr, settings, exception ) {
				BOARDFUL.ENGINE.addToFileList(file, "", "failed");
			});
	}
	else if (".css" == file.substr(file.length - 4)) {
		// load a css
		$('head').append( $('<link rel="stylesheet" type="text/css" />').attr('href', file) );
		BOARDFUL.ENGINE.addToFileList(file, "", "loaded");
	}
	else if (".json" == file.substr(file.length - 5)) {
		$.getJSON(file, function(data, textStatus, jqXHR) {
			BOARDFUL.ENGINE.addToFileList(file, data, "loaded");
		})
		.fail(function (jqXHR, textStatus, errorThrown) {
			BOARDFUL.ENGINE.addToFileList(file, "", "failed");
		})
		.always(function(data, textStatus, jqXHR) {
		});
	}
	else {
		BOARDFUL.ENGINE.addToFileList(file, "", "failed");
	}
};

BOARDFUL.ENGINE.loadFileList = function (list, callback) {
	this.list = list;
	this.callback = callback;
	this.done = false;
	this.load();
};
BOARDFUL.ENGINE.loadFileList.prototype.load = function () {
	this.done = true;
	for (var i in this.list) {
		if (! (this.list[i] in BOARDFUL.ENGINE.FileNameList) || "loaded" != BOARDFUL.ENGINE.FileList[BOARDFUL.ENGINE.FileNameList[this.list[i]]].status) {
			this.done = false;
			BOARDFUL.ENGINE.loadFile(this.list[i]);
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

/**
* Utility functions.
*
* @author  Fei Zhan
* @version 0.0
*/

var BOARDFUL = BOARDFUL || new Object();
BOARDFUL.ENGINE = BOARDFUL.ENGINE || new Object();

BOARDFUL.ENGINE.parseUrlParam = function (query) {
	var query_string = {};
	var query = query || window.location.search.substring(1);
	var vars = query.split("&");
	for (var i=0;i<vars.length;i++) {
		var pair = vars[i].split("=");
			// If first entry with this name
		if (typeof query_string[pair[0]] === "undefined") {
		  query_string[pair[0]] = pair[1];
			// If second entry with this name
		} else if (typeof query_string[pair[0]] === "string") {
		  var arr = [ query_string[pair[0]], pair[1] ];
		  query_string[pair[0]] = arr;
			// If third or later entry with this name
		} else {
		  query_string[pair[0]].push(pair[1]);
		}
	}
	return query_string;
};
BOARDFUL.ENGINE.parseUrl = function () {
	var param = BOARDFUL.ENGINE.parseUrlParam(window.location.search.substring(1));
	param["#"] = window.location.hash.substring(1);
	var param1 = BOARDFUL.ENGINE.parseUrlParam(window.location.hash.substring(1));
	for (var index in param1) {
		if (! (index in param)) {
			param[index] = param1[index];
		}
	}
	return param;
};
// Get function from string, with or without scopes
BOARDFUL.ENGINE.getFunctionFromString = function (string) {
    var scope = window;
    var scopeSplit = string.split('.');
    for (i = 0; i < scopeSplit.length - 1; i++)
    {
        scope = scope[scopeSplit[i]];
        if (scope == undefined) return;
    }
    return scope[scopeSplit[scopeSplit.length - 1]];
};

/**
* Loader of menus.
*
* @author  Fei Zhan
* @version 0.0
*/

var BOARDFUL = BOARDFUL || new Object();
BOARDFUL.MENUS = BOARDFUL.MENUS || new Object();

BOARDFUL.MENUS.GameList = new Object();
BOARDFUL.MENUS.run = function () {
	$("#content").empty();
	$("#content").load("src/browser/menu0.html");
	var load_files = new BOARDFUL.ENGINE.loadFileList(["src/browser/menus.css", "src/engine/gamelist.json"], function () {
		BOARDFUL.MENUS.GameList = BOARDFUL.ENGINE.FileList[BOARDFUL.ENGINE.FileNameList["src/engine/gamelist.json"]].content.games;
		BOARDFUL.MENUS.loadGameList(BOARDFUL.MENUS.GameList);
	});
	$("#content button#ok").on("click", function () {
		if (undefined === BOARDFUL.MENUS.Selected || ! (BOARDFUL.MENUS.Selected in BOARDFUL.MENUS.GameList)) {
			return;
		}
		BOARDFUL.MENUS.roomStart(BOARDFUL.MENUS.GameList[BOARDFUL.MENUS.Selected]);
	});
};
BOARDFUL.MENUS.Selected = undefined;
BOARDFUL.MENUS.loadGameList = function (list) {
	for (var i in list) {
		$("#content #gamelist ul").append('<li id="' + i + '">' + list[i].name + "</li>");
		$("#content #gamelist ul li:last").click(function () {
			BOARDFUL.MENUS.Selected = $(this).attr('id');
			$("#content #gamelist li").removeClass("active");
			$(this).addClass("active");
			$("#content #descrip").empty();
			$("#content #descrip").append(list[BOARDFUL.MENUS.Selected].descrip);
		});
	}
};

BOARDFUL.MENUS.roomStart = function (game) {
	$("#content").empty();
	$("#content").load("src/browser/menu1.html");
	var load_files = new BOARDFUL.ENGINE.loadFileList(["src/browser/menus.css", "src/engine/gamelist.json"], function () {
		BOARDFUL.MENUS.GameList = BOARDFUL.ENGINE.FileList[BOARDFUL.ENGINE.FileNameList["src/engine/gamelist.json"]].content.games;
		BOARDFUL.MENUS.loadGameList(BOARDFUL.MENUS.GameList);
	});
	$("#content button#ok").on("click", function () {
		if (undefined === BOARDFUL.MENUS.Selected || ! (BOARDFUL.MENUS.Selected in BOARDFUL.MENUS.GameList)) {
			return;
		}
		BOARDFUL.MENUS.roomStart(BOARDFUL.MENUS.GameList[BOARDFUL.MENUS.Selected]);
	});
};
