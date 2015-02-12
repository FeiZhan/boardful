/**
 * 
 *
 * @author		Fei Zhan
 * @version		0.0
**/

var BOARDFUL = BOARDFUL || new Object();

BOARDFUL.ChangedValue = function (config, owner) {
	this.type = "ChangedValue";
	this.owner = owner;
	BOARDFUL.Mngr.add(this);
	this.run(config);
};
BOARDFUL.ChangedValue.prototype.run = function (config) {
	var content = (config.value >= 0 ? "+" : "") + config.value;
	$("#" + BOARDFUL.Menu.Canvas).append('<div id="' + this.id + '" class="changed_value">' + content + '</div>');
	var jq = $("#" + BOARDFUL.Menu.Canvas + ' #' + this.id);
	jq.offset({
		top: config.source_jq.offset().top,
		left: config.source_jq.offset().left,
	});
	var top = '0px';
	if (jq.offset().top >= $(window).height() / 2) {
		top = '-=100px';
	} else {
		top = '+=100px';
	}
	jq.animate({
		top: top,
		opacity: 0
	}, 5000);
};