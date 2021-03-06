/**
 * Gui for card.
 *
 * @author		Fei Zhan
 * @version		0.0
**/

var BOARDFUL = BOARDFUL || new Object();

// gui for card
BOARDFUL.CardUi = function (instance, owner) {
	this.type = "CardUi";
	this.instance = instance;
	this.owner = owner;
	this.visible = false;
	BOARDFUL.Mngr.add(this);
	this.addListeners();
	var load_files = new BOARDFUL.FileLoader(["src/browser/card.html", "src/browser/card.css"], function () {
	});
};
// display card
BOARDFUL.CardUi.prototype.load = function (config, callback) {
	config = config || new Object();
	config.parent = config.parent || "";
	var that = this;
	// get card html
	$.get("src/browser/card.html", function (text, status, xhr) {
		// add html to page
		$("#" + BOARDFUL.Menu.Canvas + " " + config.parent).append(text).fadeIn('slow');
		$("#" + BOARDFUL.Menu.Canvas + " " + config.parent + " .card:last").attr("id", that.id);
		var card_jq = $("#" + BOARDFUL.Menu.Canvas + " #" + that.id);
		if (that.visible) {
			card_jq.addClass("visible");
		}
		// set position
		if (config.position) {
			card_jq.css(config.position);
		}
		// set name
		card_jq.find("h4").html(BOARDFUL.Mngr.get(that.instance).name);
		var card_config = BOARDFUL.Mngr.get(BOARDFUL.Mngr.get(BOARDFUL.Mngr.get(that.instance).game).owner).config.cards;
		var back_img = "resources/poker_back.jpg";
		if (card_config && card_config.back) {
			back_img = card_config.back;
		}
		card_jq.find(".back").attr("src", back_img);
		var flip_interval;
		// draggable
		card_jq.draggable({
			revert: "invalid",
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
			},
		});
		card_jq.hover(function () {
			if (! $(".boardful #detail").hasClass("active")) {
				//$(".boardful #detail").addClass("active").fadeIn("slow");
			}
		}, function () {
			if ($(".boardful #detail").hasClass("active")) {
				$(".boardful #detail").removeClass("active").fadeOut("fast");
			}
		});
		if ("function" == typeof callback) {
			callback(card_jq);
		}
	});
};
// move card
BOARDFUL.CardUi.prototype.move = function (source, target) {
	var jq = $("#" + BOARDFUL.Menu.Canvas + " #" + this.id);
	source = source || jq;
	// if not exist, load card
	if (0 == jq.length) {
		var that = this;
		this.load({
			position: {
				top: "50%",
				left: "80%"
			}
		}, function () {
			that.move(source, target);
		});
	} else {
		// move back to source
		var source_pos = {
			top: source.offset().top + source.height() / 2 - jq.height() / 2,
			left: source.offset().left + source.width() / 2 - jq.width() / 2
		};
		var element = jq.detach();
		$("#" + BOARDFUL.Menu.Canvas).append(element);
		jq = $("#" + BOARDFUL.Menu.Canvas + " #" + this.id);
		jq.offset(source_pos);
		// move to target
		var target_pos = {
			top: target.position().top + target.height() / 2 - jq.height() / 2,
			left: target.position().left + target.width() / 2 - jq.width() / 2
		};
		jq.animate(target_pos, "slow", function () {
			var element = jq.detach();
			target.append(element);
			jq = $("#" + BOARDFUL.Menu.Canvas + " #" + this.id);
			jq.css({
				top: "auto",
				left: "auto",
			});
		});
	}
};
BOARDFUL.CardUi.prototype.remove = function () {
	var jq = $("#" + BOARDFUL.Menu.Canvas + " #" + this.id);
	// don't disturb other cards during removing
	jq.css({
		"position": "absolute"
	});
	// expand and disappear
	jq.animate({
		top: '-=100px',
		left: '-=100px',
		height: '+=200px',
		width: '+=200px',
		opacity: 0,
	}, "slow", function () {
		$(this).remove();
	});
};

BOARDFUL.CardUi.prototype.addListeners = function () {
	var that = this;
	BOARDFUL.Mngr.get(BOARDFUL.Mngr.get(this.instance).game).event_mngr.on("ShowCard", {
		level: "game",
		callback: function (arg) {
			that.show(arg);
		},
		id: that.id
	});
};
BOARDFUL.CardUi.prototype.show = function (arg) {
	if (undefined !== arg && arg.card != this.id && arg.card != this.instance) {
		return;
	}
	this.visible = true;
	var card_jq = $("#" + BOARDFUL.Menu.Canvas + " #" + this.id);
	card_jq.addClass("visible");
};