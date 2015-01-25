/**
 * Gui for card.
 *
 * @author		Fei Zhan
 * @version		0.0
**/

var BOARDFUL = BOARDFUL || new Object();
BOARDFUL.BRSR = BOARDFUL.BRSR || new Object();

BOARDFUL.BRSR.CardUi = function (instance, owner) {
	this.type = "CardUi";
	this.instance = instance;
	this.owner = owner;
	BOARDFUL.Mngr.add(this);
	var load_files = new BOARDFUL.CORE.FileLoader(["src/browser/card.html", "src/browser/card.css"], function () {
	});
};
BOARDFUL.BRSR.CardUi.prototype.draw = function (config, callback) {
	config = config || new Object();
	config.parent = config.parent || "";
	var that = this;
	$.get("src/browser/card.html", function (text, status, xhr) {
		$("#content " + config.parent).append(text);
		$("#content " + config.parent + " .card:last").attr("id", that.id);
		var card_jq = $("#content #" + that.id);
		if (config.position) {
			card_jq.css(config.position);
		}
		card_jq.find("h4").html(BOARDFUL.Mngr.get(that.instance).name);
		if ("function" == typeof callback) {
			callback(card_jq);
		}
	});
};
BOARDFUL.BRSR.CardUi.prototype.move = function (config) {
	var jq = $("#content #" + this.id);
	if (0 == jq.length) {
		var that = this;
		this.draw({
			position: {
				top: "50%",
				left: "80%"
			}
		}, function () {
			that.move(config);
		});
	} else {
		jq.animate({
			top: config.position.top,
			left: config.position.left
		}, "slow", function () {
			jq.css({
				top: 0,
				left: 0
			});
			var element = jq.detach();
			$('#content #myhand').append(element);
		});
	}
};