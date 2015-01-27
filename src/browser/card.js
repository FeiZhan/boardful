/**
 * Gui for card.
 *
 * @author		Fei Zhan
 * @version		0.0
**/

var BOARDFUL = BOARDFUL || new Object();
BOARDFUL.BRSR = BOARDFUL.BRSR || new Object();

// gui for card
BOARDFUL.BRSR.CardUi = function (instance, owner) {
	this.type = "CardUi";
	this.instance = instance;
	this.owner = owner;
	BOARDFUL.Mngr.add(this);
	var load_files = new BOARDFUL.CORE.FileLoader(["src/browser/card.html", "src/browser/card.css"], function () {
	});
};
// display card
BOARDFUL.BRSR.CardUi.prototype.load = function (config, callback) {
	config = config || new Object();
	config.parent = config.parent || "";
	var that = this;
	// get card html
	$.get("src/browser/card.html", function (text, status, xhr) {
		// add html to page
		$("#content " + config.parent).append(text);
		$("#content " + config.parent + " .card:last").attr("id", that.id);
		var card_jq = $("#content #" + that.id);
		// set position
		if (config.position) {
			card_jq.css(config.position);
		}
		// set name
		card_jq.find("h4").html(BOARDFUL.Mngr.get(that.instance).name);
		var flip_interval;
		// draggable
		card_jq.draggable({
			start: function() {
				// flip card when dragging
				flip_interval = setInterval(function () {
					card_jq.toggleClass("flip");
				}, 2000);
			},
			drag: function() {},
			stop: function (event, ui) {
				clearInterval(flip_interval);
				card_jq.removeClass("flip");
				// expand and disappear
				card_jq.animate({
					top: '-=100px',
					left: '-=100px',
					height: '+=200px',
					width: '+=200px',
					opacity: 0,
				}, "slow", function () {
					$(this).remove();
				});
			},
		});
		card_jq.hover(function () {
			// move to front
			$(this).css("z-index", 1);
		}, function () {
			// move back
			$(this).css("z-index", 0);
		});
		if ("function" == typeof callback) {
			callback(card_jq);
		}
	});
};
// move card
BOARDFUL.BRSR.CardUi.prototype.move = function (config) {
	var jq = $("#content #" + this.id);
	// if not exist, load card
	if (0 == jq.length) {
		var that = this;
		this.load({
			position: {
				top: "50%",
				left: "80%"
			}
		}, function () {
			that.move(config);
		});
	} else {
		// move card
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