/**
 * Sirius
 */

var slideMargin = 300;

var Design = {
	// Navigation
	swipebar: null,

	data: {
		// Scroll positions
		scroll: {
			"index": 0,
			"project": 0
		},
		has_loaded: false,
		swipe_loaded: false
	},

	// First load
	init: function() {
		// Retry init if swipebar is not loaded
		if (typeof $.swipebar === "undefined") {
			setTimeout(function() {
				Design.init();
			}, 1);

			return;
		}

		Design.viewport();

		// Setup the project navigation
		Design.swipebar = $.swipebar({
			container: ".project_content",
			block	 : "> *:not(.fixed):not(style)"
		});

		// Turn it on
		Design.swipebar.on();
		Design.scroll();
		Design.paginate();
		Design.solo.init();

		// Fix the loading animations
		Cargo.Core.ReplaceLoadingAnims.init();

		this.data.has_loaded = true;
		this.data.swipe_loaded = true;
	},

	keybindings: function() {
		// Remove previous bindings
		Cargo.Core.KeyboardShortcut.Remove("Up");
		Cargo.Core.KeyboardShortcut.Remove("Down");
		Cargo.Core.KeyboardShortcut.Remove("Left");
		Cargo.Core.KeyboardShortcut.Remove("Right");

		Cargo.Core.KeyboardShortcut.Add("Left", 37, function() {
			Action.Project.Prev();
			return false;
		});

		Cargo.Core.KeyboardShortcut.Add("Right", 39, function() {
			Action.Project.Next();
			return false;
		});

		// On projects
		if (Cargo.Helper.GetCurrentPageType() == "project") {
			// Delay the rebinding
			setTimeout(function() {
				Cargo.Core.KeyboardShortcut.Add("Up", 38, function() {
					$(".goto.prev").click();
					return false;
				});

				Cargo.Core.KeyboardShortcut.Add("Down", 40, function() {
					$(".goto.next").click();
					return false;
				});
			}, 10);
		}
	},

	scroll: function() {
		var $window = $(window);

		$window.on("scroll", function(e) {
			// If we're on the index
			if ($("body").attr("data-view") == "index") {
				Design.data.scroll.index = $window.scrollTop();
			}
		});
	},

	paginate: function() {
		$(".thumbnail[data-formatted!='true']").each(function() {
			Design.formatThumbnail( $(this) );
		});
	},

	formatThumbnail: function($thumb) {
		// Default thumb
		if ($thumb.find(".thumb_image img").attr("src") == "/_gfx/thumb_custom.gif") {
			$thumb.find(".thumb_image").addClass("default_thumb");
		}

		$thumb.attr("data-formatted", "true");
	},

	viewport: function() {
		if (navigator.userAgent.match(/iPhone/i) || navigator.userAgent.match(/iPod/i)) {
			$("[name='viewport']").attr("content", "width=device-width, initial-scale=0.3, user-scalable=no");
		} else if (navigator.userAgent.match(/iPad/i)) {
			$("[name='viewport']").attr("content", "width=device-width, initial-scale=1, user-scalable=no");
		}
	},

	mobileIcons: function() {
		if (navigator.userAgent.match(/i(Phone|Pod|Pad)/i)) {
			$(".goto.prev").text("▲");
			$(".goto.next").text("▼");
			$(".project_nav .previous").text("◀");
			$(".project_nav .next").text("◀");
		}
	},

	// Replaces the arrows on windows
	ReplaceArrows: function() {
		if (navigator.appVersion.indexOf("Win")!=-1) {
			$("a[rel='prev_project']").html("&larr;");
			$("a[rel='next_project']").html("&larr;");
			$(".goto.prev").html("&uarr;");
			$(".goto.next").html("&darr;");
		}
	}
};

Design.project = {
	init: function() {
		// Top
		$(window).scrollTop(0);

		// Mark as project
		$("body").attr("data-view", "project");

		// Move the fullscreen button
		$("#fullscreen").appendTo(".entry");

		// Format Cargo video
		$("#project .video_component").each(function() {
			Design.project.resizeVideo( $(this) );
		});

		Design.project.formatText($(".project_content"));

		// Refresh the plugin
		Design.swipebar.setElements();
		Design.swipebar.refresh();

		setTimeout(function() {
			$(window).trigger("resize");
		}, 1);

		Design.keybindings();

		// Do not scroll to top on index show
		Cargo.Model.DisplayOptions.attributes.disable_project_scroll = true;
	},

	resizeSlideshow: function(el, obj, state) {
		if (state == "resize") {
			el.css({
				"-webkit-transition": "margin 0s ease",
				"-moz-transition": "margin 0s ease",
				"transition": "margin 0s ease",
			});
		} else {
			el.css({
				"-webkit-transition": "margin " + obj.options.transition_duration + "s ease",
				"-moz-transition": "margin " + obj.options.transition_duration + "s ease",
				"transition": "margin " + obj.options.transition_duration + "s ease"
			});
		}

		if ($("body").attr("data-view") == "project") {
			// Resize the active image
			// Design.swipebar.resize(obj.slides[obj.data.slides.active]);
			// Set some size data
			var block_height = obj.slides[obj.data.slides.active].height();
			var block_width = obj.slides[obj.data.slides.active].width();

			// Resize and position the containing element
			Design.swipebar.resize(el, block_height, block_width);
			obj.resizeContainer();
		}
	},

	resizeVideo: function($element) {
		Design.swipebar.resize($element);
	},

	formatText: function(node, includeWhitespaceNodes) {
		var c = node.contents();
		var validTags = ['img', 'object', 'video', 'audio', 'iframe', 'div'];
		var pageCache = [];
		var pageCount = 0;
		var textPages = {};
		var newPageFromCache = true;

		c.each(function(key, val) {
			if ($.inArray(getTag(val), validTags) >= 0) {
				// save cache as new page
				if (pageCache.length > 0) {
					textPages[pageCount] = pageCache;
					pageCache = [];
					pageCount++;
				}
			} else {
				if (isValidText(val.data) && val.nodeType != 8) {
					pageCache.push(val);
				}
			}
		});

		// Still some stuff left in cache
		if (pageCache.length > 0) {
			// Check if it needs a new page
			for (var i = 0; i < pageCache.length; i++) {
				if (pageCache[i].nodeType == 8 || pageCache[i].nodeName == "SCRIPT" || pageCache[i].nodeName == "STYLE") {
					// Contains text, create new page
					newPageFromCache = false;
				}
			}

			if (newPageFromCache) {
				// Create new page
				textPages[pageCount] = pageCache;
				pageCache = [];
				pageCount++;
			} else {
				for (var i = 0; i < pageCache.length; i++) {
					// Dump and hide remaining elements
					$(pageCache[i]).hide().appendTo($('.project_footer'));
				}
			}
		}

		$.each(textPages, function(key, arr) {
			var breaks = 0;

			$.each(arr, function(key, el) {
				if (el.nodeName == "BR") {
					breaks++;
				}
			});

			if (breaks < arr.length) {
				var first = arr[0];
				var parent = $('<p />');
				$(first).before(parent);

				$.each(arr, function(key, el) {
					$(el).appendTo(parent);
				});
			} else {
				$.each(arr, function(key, el) {
					$(el).remove();
				});
			}
		});

		function isValidText(txt, strict) {
			if (txt !== undefined) {
				txt = txt.replace(/<!--([\s\S]*?)-->/mig, "");
				txt = txt.replace(/(\r\n|\n|\r|\t| )/gm, "");
				txt = txt.replace(/[^A-Za-z0-9\s!?\.,-\/#!$%\^&\*;:{}=\-_`~()[[\]]/g, "");

				if (txt.length > 0) {
					return true;
				}
			} else {
				if (strict) {
					return false;
				} else {
					return true;
				}
			}

			return false;
		}

		function getTag(el) {
			if (typeof el !== "undefined") {
				var tag = el.tagName;
				if (typeof tag === "undefined") {
					tag = 'text';
				}

				return tag.toLowerCase();
			}
		}
	}
};

Design.page = {
	init: function() {
		$("body").attr("data-view", "page");
		Design.swipebar.off();

		$("body").scrollTop(0);

		// Resize slideshows
		setTimeout(function() {
			Cargo.Plugins.elementResizer.refresh();
		}, 10);
	}
};

Design.index = {
	init: function() {
		// Mark as index
		$("body").attr("data-view", "index");

		// Turn off navigation
		Design.swipebar.off();
		Design.keybindings();
	}
};

Design.solo = {
	init: function() {
		$(document).ready(function() {
			if (Cargo.Helper.IsSololink()) {
				$(".project_nav").hide();
			}
		});
	}
};

/**
 * Events
 */

(function() {
	setTimeout(function() {
		Design.init();
	}, 10);

	setTimeout(function() {
		Cargo.View.Navigation.AddSetActive();
	}, 300);
})();

Cargo.Event.on("element_resizer_init", function(plugin) {
	plugin.setOptions({
		selectors: [".slideshow.on_page", ".slideshow .slideshow_container img"],
		centerElements: false
	});
});

Cargo.Event.on("pagination_complete", function(new_page) {
	Design.paginate();
});

Cargo.Event.on("project_load_complete", function(pid) {
	Design.ReplaceArrows();

	if (Design.data.has_loaded) {
		// Projects and pages
		if (Cargo.Helper.GetCurrentPageType() == "project") {
			Design.project.init();
			Cargo.Plugins.elementResizer.options.forceMargin = slideMargin;
		} else {
			Design.page.init();
			Cargo.Plugins.elementResizer.options.forceMargin = 0;
		}
		// Both
		Design.mobileIcons();
	} else {
		setTimeout(function() {
			Cargo.Event.trigger("project_load_complete");
		}, 1);
	}
});

Cargo.Event.on("show_index_complete", function(pid) {
	// If not loaded, re-init
	if (Design.data.has_loaded) {
		Design.index.init();
		$(window).scrollTop(Design.data.scroll.index);
	} else {
		setTimeout(function() {
			Cargo.Event.trigger("show_index_complete");
		}, 1);
	}
});

Cargo.Event.on("pagination_start", function() {
	setTimeout(function() {
		$("body > .retinaSpinner").hide();
	}, 1);
});

Cargo.Event.on("pagination_complete", function() {
	$("body > .retinaSpinner").css("display", "");
});

/**
 * Slideshows
 */

Cargo.Event.on("slideshow_resize", function(el, obj) {
	Design.project.resizeSlideshow(el, obj, "resize");
});

Cargo.Event.on("slideshow_transition_start", function(el, obj) {
	Design.project.resizeSlideshow(el, obj);
});

Cargo.Event.on("fullscreen_destroy_hotkeys", function() {
    Design.keybindings();
});

