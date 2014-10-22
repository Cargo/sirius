/**
 * Mobile
 */

$(window).bind("unload", function() {
	// This space is intentionally blank, forcing Mobile Safari to not cache refresh/back
});

Cargo.Core.Slideshow = {
	CheckForSlideshow: function() {
		return;
	}
};

var Mobile = {} || Mobile;
Mobile = {
	// Stores global data
	Data: {
		Device: {
			"iPhone": false,
			"iPad": false,
			"iOs": false,
			"Android": false,
			"Version": 0,
			"Fullscreen": window.navigator.standalone
		},
		Window: {
			"Scroll": 0,
			"Height": 0,
			"Width": 0
		},
		Content: {
			"Width": 0
		}
	},

	// Defines required data onload
	InitData: function() {
		if (navigator.userAgent.indexOf('iPhone') > 0 || navigator.userAgent.indexOf('iPod') > 0) {
			Mobile.Data.Device.iPhone = true;
			$("body").addClass("iPhone");
		} else if (navigator.userAgent.indexOf('iPad') > 0) {
			Mobile.Data.Device.iPad = true;
			$("body").addClass("iPad");
		} else if (navigator.userAgent.indexOf('Android') > 0) {
			Mobile.Data.Device.Android = true;
			$("body").addClass("android");
		}

		Mobile.Data.Device.iOs = Mobile.Data.Device.iPhone || Mobile.Data.Device.iPad;
	},

	// Fired on page load
	Init: function() {
		// Force lightbox view for image click
		Cargo.Model.DisplayOptions.set('lightbox_view', true);
		Cargo.Model.DisplayOptions.set('lightbox_zoom_enabled', true);
		
		Mobile.InitData();
		Mobile.Navigation.Init();
		Mobile.Resize();
		Mobile.Thumbnails.Init();
		Mobile.InitScroll();
		Mobile.Paginate();
		Mobile.svgCheck();

		Cargo.Core.ReplaceLoadingAnims.init();
	},

	// Hides the address bar by scrolling that distance on load.
	InitScroll: function() {
		if (Mobile.Data.Device.iOs) {
			$("html").css("min-height", $(window).height() + 60);
			$("html, body").scrollTop(0);
		}
	},

	Resize: function() {
		Mobile.Data.Content.Width = $("#content_container").width() - parseInt($(".project_content").css("paddingLeft")) - parseInt($(".project_content").css("paddingRight"));
		Mobile.Navigation.Resize();
		Mobile.Thumbnails.Resize();
		Mobile.Project.Resize();
	},

	Paginate: function() {
		Mobile.Thumbnails.Init();
		Mobile.Thumbnails.Resize();
		Mobile.Navigation.Hide();
	},

	svgCheck: function() {
		if (! document.implementation.hasFeature("http://www.w3.org/TR/SVG11/feature#BasicStructure", "1.1")) {
			$("body").addClass("svg_disabled");
		}
	}
}; 

/**
 * Navigation
 */

Mobile.Navigation = {
	Data: {
		"Scroll": 0
	},

	Init: function() {
		$(".navigation_toggle").click(function(e) {
			if ($(".nav_container").is(":visible")) {
				Mobile.Navigation.Hide();
			} else {
				Mobile.Navigation.Show();
			}
			e.preventDefault();
		});

		$(".nav_screen").click(function(e) {
			Mobile.Navigation.Hide();
			e.preventDefault();
		});

		$(".toolset .project_close").click(function() {
			if ($("body").hasClass("project_open")) {
				Mobile.Thumbnails.Show();
				Mobile.Navigation.Hide();
				Mobile.Project.Hide();

				$(".loadspin").hide();
			}

			Mobile.Navigation.Hide();

			return false;
		});

		$(".toolset .project_next").click(function(e) {
			if (Cargo.Helper.GetNextProjectUrl() != Cargo.Helper.GetCurrentProjectUrl()) {
				$(".loadspin").hide();
				$(".loadspin", this).show();
			}
		});

		$(".toolset .project_prev").click(function(e) {
			if (Cargo.Helper.GetPrevProjectUrl() != Cargo.Helper.GetCurrentProjectUrl()) {
				$(".loadspin").hide();
				$(".loadspin", this).show();
			}
		});

		// Set the height
		$(".nav_container").attr("height_o", $(".nav_container").height());

		// Bug fix
		$("div[rel='next_project']").click(function() {});
		$("div[rel='prev_project']").click(function() {});
	},

	Show: function() {
		$(".nav_container, .nav_screen").show();
		$("body").addClass("nav_active");
		$("div[rel='history']").on("click", function(e) {});
		$("div[rel='linkage']").on("click", function(e) {
			e.preventDefault();
			window.location = $(this).attr('href');
		});
		$(".following_link").on("click", function(e) {
			e.preventDefault();
			window.location = Cargo.API.GetFollowingUrl();
		});
	},

	Hide: function() {
		$(".nav_container, .nav_screen").hide();
		$("body").removeClass("nav_active");
	},

	/**
	 * Checks to see if the height of the navigation is greater than the viewport.
	 * If so, make it scroll.
	 */
	Resize: function() {
		var height = $(".nav_container").attr("height_o");
		var window_height = $(window).height();

		if (height > window_height) {
			$("body").addClass("nav_scroll");
		} else {
			$("body").removeClass("nav_scroll");
		}
	}
};

/**
 * Thumbnails
 */

Mobile.Thumbnails = {
	Data: {
		"Scroll": 0,
		"Ratio": 0.67
	},

	Init: function() {
		// Nothing...for now
	},

	Show: function() {
		$(".thumbnails").show();
		Mobile.Navigation.Hide();
		$(".site_title").show();
		$(".header_image").show();
	},

	Resize: function(element) {
		$('.project_thumb').each(function(i) {
			// Cache
			var $cardimgcrop = $(this).find('.cardimgcrop'),
				$img         = $cardimgcrop.find('img');

			// Reset
			$(this).css({height: '', width: ''});
			$img.css({height: '', width: ''});

			// Data
			var thumb = {
				height: $(this).width() * ($img.height() / $img.width()),
				width: $(this).height() * ($img.width() / $img.height())
			};

			$cardimgcrop.css({
				"height": $(this).width() * Mobile.Thumbnails.Data.Ratio + "px",
				"width": $(this).width()
			});

			// Force the thumb size
			if ($img.height() > $cardimgcrop.height()) {
				$img.css('height', $cardimgcrop.height());
			} else {
				$img.css('height', 'auto');
			}

			if ($img.width() >  $cardimgcrop.width()) {
				$img.css('width', $cardimgcrop.width());
			} else {
				$img.css('width', 'auto');
			}

			// Show and mark as formatted
			$(this).css({
				"visibility": "visible"
			}).addClass('formatted');
		});
	},

	Hide: function() {
		$(".thumbnails").hide();
		$(".site_title").hide();
		$(".header_image").hide();
	}
};

/**
 * Projects
 */

Mobile.Project = {
	Data: {
		"Scroll" : 0
	},

	// Formatting which happens after the project has been loaded and displayed
	Show: function() {
		Mobile.Thumbnails.Hide();
		Mobile.Project.Dev();
		Mobile.Project.Imgs.Init();
		Mobile.Project.Videos.Init();
		Mobile.Resize();

		if (navigator.userAgent.match(/(Firefox)/i)) {
			// Set timeout for fixing FF
			setTimeout(function() { 
				window.scrollTo(0, 0); 
			}, 10);	
		} else {
			window.scrollTo(0, 0); 
		}

		$("#thumbnail_container").hide();
		$("body").addClass("project_open");
		$(".loadspin").hide();
	},

	Hide: function() {
		Mobile.Thumbnails.Show();
		$("#thumbnail_container").show();
		$("body").removeClass("project_open");
		$(document).trigger("closeProject");
	},

	// Fired before loading of a project
	Start: function(pid) {
		// If an entry isn't visible already
		if (! $("#maincontainer").is(":visible")) {
			Mobile.Thumbnails.Data.Scroll = $(window).scrollTop();
		}

		// Show the spinner
		$("#item_" + pid + " .loadspin").css("display", "block");
	},

	// Fired when closing a project
	Close: function(pid) {
		$("#item_" + pid + " .loadspin").hide();
		Mobile.Thumbnails.Resize();
	},

	Resize: function() {
		Mobile.Project.Imgs.Format();
		Mobile.Project.Videos.Format();
	},

	// Temporary slideshow intervention
	Dev: function() {
		$(".slideshow").each(function() {
			$(this).after('<div class="slideshow_mobile" />');
			$("img", this).appendTo($(this).next(".slideshow_mobile"));
			$(this).remove();
		});

		$(".slideshow_component").each(function() {
			$(this).after('<div class="slideshow_mobile" />');
			$("img", this).appendTo($(this).next(".slideshow_mobile"));
			$(this).remove();
		});

		$(".slideshow_mobile").MobileSlideshow();
	},

	Imgs: {
		// Sets the attributes
		Init: function() {
			$(".entry img").each(function() {
				if ($(this).attr("height") && $(this).attr("width")) {
					// If this has the height/width attributes
					$(this).attr("ratio", $(this).attr("height") / $(this).attr("width"));
					$(this).attr("height_i", $(this).attr("height")).attr("width_i", $(this).attr("width"));
				} else {
					// Otherwise retrieve via the DOM
					$(this).attr("ratio", $(this).height() / $(this).width() );
					$(this).attr("height_i", $(this).height()).attr("width_i", $(this).width());
				}
			});
		},

		// Loops through images in entries and formats them
		Format : function() {
			$(".entry img").each(function() {
				Mobile.Project.Imgs.Resize($(this));
			});
		},

		// Sets the max-width for images in the content, reserves the space to prevent a jump
		Resize : function(element) {
			if ($(element).attr("width_i") >= Mobile.Data.Content.Width) {
				$(element).css({
					"max-height": (Mobile.Data.Content.Width * $(element).attr("ratio")) + "px",
					"max-width": Mobile.Data.Content.Width + "px"
				});
			} else {
				$(element).css({"max-height": "", "max-width": ""});
			}
		}
	},

	Videos: {
		// Sets up the ratio for each video
		Init: function() {
			$(".entry iframe, .entry video, .entry object, .entry embed").each(function() {
				$(this).attr("height_o", $(this).height());
				$(this).attr("width_o", $(this).width());
				$(this).attr("ratio", $(this).height() / $(this).width());
			});
		},

		Format: function() {
			$(".entry iframe, .entry video, .entry object, .entry embed").each(function() {
				Mobile.Project.Videos.Resize($(this));
			});
		},

		Resize: function(element) {
			if ($(element).attr("width_o") > Mobile.Data.Content.Width) {
				$(element).css({
					"max-height": (Mobile.Data.Content.Width * $(element).attr("ratio")) + "px",
					"max-width": Mobile.Data.Content.Width + "px"
				});
			} else {
				$(element).css({"max-height": "", "max-width": ""});
			}
		}
	}
};

/**
 * Init
 */

$(document).ready(function() {
	Mobile.Init();
});

Cargo.Event.on("project_load_start", function(pid) {
	Mobile.Project.Start(pid);
});

Cargo.Event.on("project_load_complete", function(pid) {
	Mobile.Project.Show();
	Mobile.Navigation.Hide();
});

Cargo.Event.on("show_index_complete", function(pid) {
	Mobile.Project.Hide(pid);
	Mobile.Resize();
	$("html, body").scrollTop(Mobile.Thumbnails.Data.Scroll);
});

Cargo.Event.on("pagination_complete", function(new_page) {
	Mobile.Resize();
	Mobile.Paginate();
});

$(window).on("resize orientationchange", function(e) {
	Mobile.Resize();
});

// If persisted then it is in the EVIL page cache of DEATH...force a reload of the page.
if ("onpageshow" in window) {
	window.onpageshow = function(event) {
		if (event.persisted) {
			document.body.style.display = 'none';
			location.reload();
		}
	};
}

Cargo.Event.on("project_load_complete", function(pid) {
	if (pid == Cargo.API.Config.start_project || (pid == undefined && Cargo.API.Config.start_project)) {
		var path = document.location.pathname;
		if (path == "/" || path == "/" + Cargo.API.Config.cargo_url) {
			$(".project_title").html($(".site_title").text());
		}
	}
});

/**
 * Mobile slideshow
 */

(function($) {
	$.fn.MobileSlideshow = function(options) {
		var defaults = {};

		// Update any options passed in with the defaults
		var options = $.extend(defaults, options);

		return this.each(function() {
			var Self = this;

			this.Data = {
				"ImgWidth": Mobile.Data.Content.Width,
				"CurrentImg": 0,
				"ContainerWidth" : 0,
				"ImgCount": 3,
				"Speed": 320,
				"Container": null,
				"Imgs": null
			};

			// Format the slideshows
			this.Init = function() {
				Self.Data.Container = $(this);
				$(this).wrapInner('<div class="imgs"/></div>');

				// Data
				Self.SetData();
				Self.Navigation();

				// Image sizes
				$("img", this).wrap('<div/>');
				$("img:first", this).imagesLoaded(function() {
					Self.Size();
				});

				// Caption
				Self.Caption($("img:first", this));

				// Resize
				$(window).on("resize orientationchange", function(e) {
					Self.Size();
					Self.PositionCurrentImage(false);
				});

				$(Self.Data.Imgs).swipe({
					triggerOnTouchEnd: true,
					click: this.Click,
					swipeStatus: this.Swipe,
					allowPageScroll: "vertical",
					threshold: 50	
				});
			};

			this.SetData = function() {
				Self.Data.Imgs = $(".imgs", this);
				Self.Data.ImgCount = $("img", this).length;
			};

			this.Navigation = function() {
				var nav_template = 
					'<div class="slideshow_navigation">' +
						'<span class="current">1</span> ' + 
						'<span class="of">of</span> ' + 
						'<span class="all">' + Self.Data.ImgCount + '</span>' + 
					'</div>';
				$(this).prepend(nav_template);
			};

			this.Size = function() {
				Self.Data.ImgWidth = Mobile.Data.Content.Width;
				Self.Data.ContainerWidth = Self.Data.ImgWidth * Self.Data.ImgCount;
				$(".imgs div", this).width(Self.Data.ImgWidth);
				$(Self.Data.Imgs).height($("img:eq(" + Self.Data.CurrentImg + ")", Self.Data.Imgs).height());
				$(Self.Data.Imgs).width(Self.Data.ContainerWidth);
			};

			/**
			 * Tracks finger position on touch move and positions the imgs correspondingly
			 * On touch end, move to the next/prev img
			 */
			this.Swipe = function(event, phase, direction, distance) {
				// Detect the direction of the swipe
				if (phase=="move" && (direction=="left" || direction=="right")) {
					var duration = 0;

					if (direction == "left") {
						Self.ScrollImgs((Self.Data.ImgWidth * Self.Data.CurrentImg) + distance, duration);
					} else if (direction == "right") {
						Self.ScrollImgs((Self.Data.ImgWidth * Self.Data.CurrentImg) - distance, duration);
					}
				} else if ( phase == "cancel") {
					// If we've stopped swipping without progressing
					Self.ScrollImgs(Self.Data.ImgWidth * Self.Data.CurrentImg, Self.Data.Speed);
				} else if ( phase =="end" ) {
					// If we've swiped and we're progressing
					if (direction == "right") {
						Self.PreviousImg();
					} else if (direction == "left") {
						Self.NextImg();
					}
				} else if ( phase == "click" ) {
					// Progress if we've clicked
					Self.NextImg();
				}
			};

			this.PositionCurrentImage = function(animated) {
				var speed = (animated === false) ? 0 : Self.Data.Speed;
				Self.ScrollImgs(Self.Data.ImgWidth * Self.Data.CurrentImg, speed);
				$(Self.Data.Imgs).height($("img:eq(" + Self.Data.CurrentImg + ")", Self.Data.Imgs).height());
				Self.Caption($("img:eq(" + Self.Data.CurrentImg + ")", Self.Data.Imgs));
			};

			this.PreviousImg = function() {
				Self.Data.CurrentImg = Math.max(Self.Data.CurrentImg - 1, 0);
				this.PositionCurrentImage(true);
			};

			this.NextImg = function() {
				Self.Data.CurrentImg = Math.min(Self.Data.CurrentImg + 1, Self.Data.ImgCount - 1);
				this.PositionCurrentImage(true);
			};

			this.ScrollImgs = function(distance, duration) {
				$(Self.Data.Imgs).css("transition-duration", (duration / 1000).toFixed(1) + "s");

				// Invert the number we set in the css
				var value = Math.abs(distance);
				if (distance > 0) {
					value *= -1;
				}

				if ($(".imgs", Self).position().left >= 0) {
					value = value / 3;
				} else if ($(".imgs", Self).position().left <= (Self.Data.ImgWidth * (Self.Data.ImgCount - 1) * -1)) {
					value = parseInt(value) + (Self.Data.ImgWidth - (parseInt(Self.Data.ContainerWidth) - Math.abs(value))) / 1.5;
				}

				$(Self.Data.Imgs).css("transform", "translate3d(" + value + "px,0px,0px)");
				$(".current", this).text(Self.Data.CurrentImg + 1);
			};

			this.Caption = function(element) {
				var caption = $(element).attr("caption");
				$(".caption", Self.Data.Container).remove();
				if ($(element).attr("caption")) {
					$(Self.Data.Imgs).after('<div class="caption">' + caption + '</div>');
				}
			};

			// Init
			Self.Init($(this));
		});
    };
})(jQuery);

/**
 * Images loaded
 */

(function(c,n){var l="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";c.fn.imagesLoaded=function(f){function m(){var b=c(i),a=c(h);d&&(h.length?d.reject(e,b,a):d.resolve(e));c.isFunction(f)&&f.call(g,e,b,a)}function j(b,a){b.src===l||-1!==c.inArray(b,k)||(k.push(b),a?h.push(b):i.push(b),c.data(b,"imagesLoaded",{isBroken:a,src:b.src}),o&&d.notifyWith(c(b),[a,e,c(i),c(h)]),e.length===k.length&&(setTimeout(m),e.unbind(".imagesLoaded")))}var g=this,d=c.isFunction(c.Deferred)?c.Deferred():
0,o=c.isFunction(d.notify),e=g.find("img").add(g.filter("img")),k=[],i=[],h=[];c.isPlainObject(f)&&c.each(f,function(b,a){if("callback"===b)f=a;else if(d)d[b](a)});e.length?e.bind("load.imagesLoaded error.imagesLoaded",function(b){j(b.target,"error"===b.type)}).each(function(b,a){var d=a.src,e=c.data(a,"imagesLoaded");if(e&&e.src===d)j(a,e.isBroken);else if(a.complete&&a.naturalWidth!==n)j(a,0===a.naturalWidth||0===a.naturalHeight);else if(a.readyState||a.complete)a.src=l,a.src=d}):m();return d?d.promise(g):
g}})(jQuery);