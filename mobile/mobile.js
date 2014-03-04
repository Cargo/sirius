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
		$(".entry").MobileFreshBox();
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
 * Mobile freshBox
 */

(function($) {
	$.fn.MobileFreshBox = function(options) {
		var defaults = {
			fill: "fit",				// How is the image resized
			element: "img",				// What element are we targeting?
			parent: ".project_content"
		};

		// Update any options passed in with the defaults
		this.options = $.extend(defaults, options);
		var self = this;

		this.Data = {
		 	overflow: null,		// The overflow of body before opening the lightbox
		 	scroll_x: 0,		// Starting scroll position
		 	scroll_y: 0,		// Starting scroll position
		 	window_height: 0,	// Window height
		 	window_width: 0,	// Window width
		 	iOS: undefined		// Data store for cached UI element sizes on iOS
		};

		// Override the parent element
		if (typeof freshbox_parent_element !== 'undefined') {
			self.options.parent = freshbox_parent_element;
		}
		
		/**
		 * Sets up the click events for both fullscreen and lightbox
		 */
		this.Init = function() {
			var element;

			// Initialize fullscreen when clicking fullscreen button
			$("#fullscreen", self).off("click").unbind("click").click( function(e) {
				self.InitLightbox(e, $(this).attr("data-mid"), $(this).parents(".entry").attr("id"));
				return false;
			});

			// Find the parent, initialize lightbox when clicking project_content img
			$(self.options.parent+" "+self.options.element, self).each(function() {
				// If this is a Cargo uploaded image or not in an anchor tag
				if ($(this).is("[src_o]") && !$(this).parent("a").length > 0) {
					// Setup
					$(this).off("click").unbind("click").click( function(e) {
						self.InitLightbox(e, $(this).attr("data-mid"), $(this).parents(".entry").attr("id"));
						return false;
					});
				};
			});
		};

		this.InitLightbox = function(e, mid, element) {
			self.Construct();

			// Get the active container, based on the element that was clicked
			var active_container = $(e.currentTarget).parents(self.options.parent);

			// Write the container and hide the scrollbar
			$("#freshbox").data("state", "lightbox").append($("#fullscreen_src").html());

			// Append all of the images in freshbar content
			$(self.options.element, active_container).each(function() {
				// If it's a Cargo uploaded image
				if ($(this).is("[src_o]")) {
					$(this).clone().appendTo("#freshbox #fullscreen_imgs").attr("style", "");
				}
			});

			// Loop through each of those images and append them to the image container, until the id matches the clicked img
			var mid_match = false;
			$("#freshbox #fullscreen_imgs img").each(function() {
				if( mid_match == false && $(this).attr("data-mid") != mid ) {
					$(this).appendTo("#freshbox #fullscreen_imgs");
				} else if( mid_match == false && $(this).attr("data-mid") == mid ) {
					mid_match = true;
				}
			});

			// Click to close
			$("#freshbox").click(function() {
				self.Close();
				return false;
			});

			// Trigger next functions
			self.ConfigureSlideshow();
		};

		/**
		 * Shared between both functions
		 */
		this.Construct = function() {
			// Grab the overflow of body
			this.Data.overflow = $("body").css("overflow");
			this.Data.scroll_x = $(window).scrollLeft();
			this.Data.scroll_y = $(window).scrollTop();

			// If the address bar might be showing, be sure to hide it
			if (this.Data.scroll_y < 2) {
				$(window).scrollTop(0);
			}

			// Close previous instances
			self.Close();

			// Create the freshbox element
			$("body").append('<div id="freshbox" />');

			// If the body isn't already hidden, then hide it
			if( this.Data.overflow != "hidden" ) $("body").css("overflow", "hidden");

		 	// Disable scaling and scrolling in iOS
		 	this.PreventIOSEvents(true);

			$(window).on("resize orientationchange", function(e) {
				self.Resize();
			});
		};

		/**
		 * Create the slideshow and set the key commands
		 */
		this.ConfigureSlideshow = function() {
			// If there is a single image in the project, hide the prev/next buttons.
			if ($("#freshbox img").length == 1) {
				$("#freshbox").addClass("single");
				$("#fullscreen_next, #fullscreen_prev").remove();
			}

			// Assign the first image as active and format
			self.NewElement("next");
		 };

		 /**
		  *	For slideshows, what the next element will be
		  */
		this.NewElement = function(direction) {
			// Remove preload image and spinner
			$("#freshbox img.preload, #freshbox_loading").remove();

			if (direction == "prev") {
				// Prepend the active image to the begining of the container
				$("#freshbox img.active").removeClass("active").prependTo($("#fullscreen_imgs"));
				$("#fullscreen_imgs img:last").addClass("active");
			} else {
				// Append the active image to the end of the container
				$("#freshbox img.active").removeClass("active").appendTo($("#fullscreen_imgs"));
				$("#fullscreen_imgs img:first").addClass("active");
			};

			// Move the active image and preload
			$("#freshbox img.active").prependTo($("#freshbox"));
			self.LoadIMG($("#freshbox img.active"));
			self.Resize();
		 };

		/**
		 * Load an image
		 */
		this.LoadIMG = function($this) {
			// Setup the src swap
			var src = $this.attr("src");
			var src_o = $this.attr("src_o");

			// Create the loadspinner
			var spinner = $("<img />").attr("src", "/_gfx/loadingAnim.gif").attr("id", "freshbox_loading").prependTo("#freshbox");
			if (this.CheckIOS()) {
				// Spinners require specific placement on iOS
				var ios_window_size = this.GetIOSViewportSize();
				spinner.css({
					'top': Math.round(ios_window_size.height / 2),
					'left': Math.round(ios_window_size.width / 2)
				});
			}

			// Clone the active img to create the fake preload img
			$("#freshbox img.active").clone().attr("class", "preload").appendTo("#freshbox");

			// Set the src of the active image to the original src, should the original width be larger
			var width = parseInt($this.attr('width'));
			var width_o = parseInt($this.attr('width_o'));
			if (width_o > width) {
				$("#freshbox img.active").attr("src", src_o);
			}

			// If we're in lightbox set the cursor style
			if ($("#freshbox").data("state") == "lightbox") {
				$("#freshbox img.active").css("cursor", function() {
					if ($.browser.mozilla) {
						return '-moz-zoom-out';
					} else if ($.browser.webkit) {
						return '-webkit-zoom-out';
					} else {
						return 'pointer'; 
					}
				});
			}
		};

		/**
		 * Setup the navigation
		 */
		this.Navigation = function() {
			var transition_time = 200,
				hover = false,
				nav_fadeout = null,
				nav_timeout = 1500,
				nav_track = {},
				nav_fadeout = setTimeout('$(".freshbox_navigation").stop().fadeOut(200)', nav_timeout);

			$(".freshbox_navigation").mouseenter(function() {
				hover = true;
			});

			$(".freshbox_navigation").mouseleave(function() {
				hover = false;
			});

			$("#freshbox").mousemove(function(e) {
				// Show the project nav if you're on a project
				if(nav_track.x != e.clientX && nav_track.y != e.clientY) {
					$(".freshbox_navigation").fadeIn(transition_time);
				}

				nav_track = {
					"x": e.clientX,
					"y": e.clientY
				};

				// If the text is visible, or if you're hovering over the top always show the header/toolbar
				if (hover == true) {
					clearTimeout(nav_fadeout);
				} else {
					// Otherwise, fade the project nav / header out after a second or so
					if (nav_fadeout != null) {
						clearTimeout(nav_fadeout)
					}

					nav_fadeout = setTimeout('$(".freshbox_navigation").stop().fadeOut(200)', nav_timeout);
				}
			});
		 };

		/**
		 * What happens when the window is resized
		 */
		this.Resize = function() {
			var element = $("#freshbox img.active, #freshbox img.preload");

			this.Data.window_height = $(window).height();
			this.Data.window_width  = $(window).width();

			if (this.CheckIOS()) {
				var ios_window_size = this.GetIOSViewportSize();
				this.Data.window_height = ios_window_size.height;
				this.Data.window_width  = ios_window_size.width;
			}

			var window_height = this.Data.window_height;
			var window_width  = this.Data.window_width;
			var img_height = element.attr("height_o");
			var img_width = element.attr("width_o");
			var height_ratio = window_height / img_height;
			var width_ratio = window_width / img_width;
			var height_diff = width_ratio * img_height;
			var width_diff = height_ratio * img_width;

			if (img_height > window_height || img_width > window_width) {
				if (window_height > height_diff) {
					img_height = height_diff;
					img_width = window_width;
				} else {
					img_height = window_height;
					img_width = width_diff;
				}
			}

			if (this.CheckIOS()) {
				// Cover it all with black
				var widest_value = Math.max(window.pageXOffset, window.pageYOffset) + this.Data.window_width;
				var full_coverage = Math.max(screen.width, screen.height) * (window.devicePixelRatio || 1) + widest_value;
				$('#freshbox').css({
					'width': full_coverage + 'px',
					'height': full_coverage + 'px'
				});

				// Handle zoom
				var zoom = Math.min(this.GetIOSZoom(), this.GetIOSScale());
				if (zoom !== 1) {
					var reciprocal = (100 / zoom) / 100;
					img_width *= reciprocal;
					img_height *= reciprocal;
					window_width *= reciprocal;
					window_height *= reciprocal;
				}
			}

			element.css({
				"height": img_height + "px",
				"width": img_width + "px",
				"top": (window_height - img_height) / 2,
				"left": (window_width - img_width) / 2
			});
		};

		/**
		 * Opens the site into fullscreen mode
		 */
		this.OpenFullscreen = function() {
			// The element we're opening
			var docElem = document.documentElement;
			
			// Browser checks to open fullscreen
			if (docElem.requestFullscreen) {
				docElem.requestFullscreen();
			} else if (docElem.mozRequestFullScreen) {
				docElem.mozRequestFullScreen();
			} else if (docElem.webkitRequestFullScreen) {
				docElem.webkitRequestFullScreen();
			} else {
				// Fail, except on iOS
				if (! this.CheckIOS()) {
					return;
				}
			}

			// When we switch fullscreen states
			docElem.addEventListener("mozfullscreenchange", function() {
				if (! document.webkitIsFullScreen) {
					self.Close();
				}
			}, false);

			docElem.addEventListener("webkitfullscreenchange", function() {
				if (! document.webkitIsFullScreen) {
					self.Close();
				}
			}, false);

			// Show the freshbox
			if (! Cargo.Config.isIE()) {
				setTimeout('$("#freshbox").css("visibility", "visible")', 100);
			}
		};

		/**
		 * Exits fullscreen mode from elsewhere
		 */
		this.CloseFullscreen = function() {
			if (document.exitFullscreen) {
				document.exitFullscreen();
			} else if(document.mozCancelFullScreen) {
				document.mozCancelFullScreen();
			} else if(document.webkitCancelFullScreen) {
				document.webkitCancelFullScreen();
			}
		};

		/**
		 * Checks the window width versus screen width when resizing
		 * to toggle the fullscreen button and toolset
		 */
		this.CheckFullscreen = function() {
			if (screen.width > $(window).width() + 20) {
				self.Close();
			}
		};

		this.GetIOSWindowSize = function() {
			var width = screen.width;
			var height = screen.height - 20;

			if (window.orientation !== 0) {
				width = screen.height;
				height = screen.width;
			}

			if (navigator.userAgent.match(/i(Phone|Pod)/i)) {
				height -= 44;
			} else if (navigator.userAgent.match(/iPad/i)) {
				height -= 58;
			}

			return {
				width: width,
				height: height
			};
		};

		this.GetIOSViewportSize = function() {
			var windowSize = this.GetIOSWindowSize();
			var scale = this.GetIOSScale();

			return {
				width: (windowSize.width * scale),
				height: (windowSize.height * scale)
			};
		};

		this.GetIOSScale = function() {
			return document.body.offsetWidth / this.GetIOSWindowSize().width;
		};

		this.GetIOSZoom = function() {
			return document.documentElement.clientWidth / window.innerWidth;
		};

		this.FormatIOS = function() {
			if (! this.CheckIOS()) {
				return;
			}

			if (this.Data.iOS === undefined) {
				// Temporarily create elements to cache values based upon original sizes
				var ios_freshbox = $('<div id="ios_freshbox" style="display: none;"></div>').appendTo('body');
				$('<div class="freshbox_navigation"><div class="freshbox_navigation_group"><a href="#" class="freshbox_nav_button"></a></div></div>').appendTo(ios_freshbox);
				var og_freshbox_navigation = $('.freshbox_navigation', ios_freshbox);
				var og_freshbox_navigation_a = $('.freshbox_navigation a', ios_freshbox).filter(':first');

				this.Data.iOS = {
					navigation_width: parseInt(og_freshbox_navigation.css('width')),
					navigation_bottom: parseInt(og_freshbox_navigation.css('bottom')),
					navigation_margin: parseInt($('.freshbox_navigation_group', ios_freshbox).css('marginRight')),
					navigation_button_width: parseInt($('a.freshbox_nav_button', ios_freshbox).filter(':first').css('width')),
					navigation_button_height: parseInt(og_freshbox_navigation_a.css('height')),
					navigation_button_corner: parseInt(og_freshbox_navigation_a.css('marginTop'))
				};

				ios_freshbox.remove();
			}

			// Navigation button scaled sizes
			var scale = this.GetIOSScale();
			var scaled_width = Math.ceil(this.Data.iOS.navigation_button_width * scale);
			var scaled_height = Math.ceil(this.Data.iOS.navigation_button_height * scale);
			var scaled_corner = Math.ceil(this.Data.iOS.navigation_button_corner * scale);
			var scaled_navigation_pad = Math.ceil((this.Data.iOS.navigation_button_corner * 3) * scale);
			var scaled_navigation_width = Math.ceil(this.Data.iOS.navigation_width * scale) + scaled_navigation_pad;
			var scaled_navigation_margin = Math.ceil((scaled_navigation_width - (scaled_width / 2)) / 2) - Math.floor(this.Data.iOS.navigation_margin / 2);

			// Handle zoom
			var zoom = Math.min(this.GetIOSZoom(), scale);
			if (zoom !== 1) {
				var reciprocal = (100 / zoom) / 100;
				scaled_width *= reciprocal;
				scaled_height *= reciprocal;
				scaled_corner *= reciprocal;
				scaled_navigation_pad *= reciprocal;
				scaled_navigation_width *= reciprocal;
				scaled_navigation_margin *= reciprocal;
			}

			var scaled_bottom = Math.max(scaled_height, this.Data.iOS.navigation_bottom);
			var scaled_group_height = Math.round(scaled_height + scaled_corner);

			// Update navigation layout
			$('.freshbox_navigation').css({
				'width': scaled_navigation_width + 'px',
				'margin-left': '-' + scaled_navigation_margin + 'px',
				'bottom': scaled_bottom + 'px'
			});

			$('.freshbox_navigation_group').css({
				'height': scaled_group_height + 'px',
				'border-radius': scaled_corner + 'px',
				'-webkit-border-radius': scaled_corner + 'px',
				'-moz-border-radius': scaled_corner + 'px'
			});

			$('.freshbox_navigation a').each(function(index, item) {
				$(item).css({
					'width': scaled_width + 'px',
					'height': scaled_height + 'px',
					'border-radius': scaled_corner + 'px',
					'-webkit-border-radius': scaled_corner + 'px',
					'-moz-border-radius': scaled_corner + 'px'
				});
			});
		};

		this.CheckIOS = function() {
			if (navigator.userAgent.match(/i(Phone|Pod|Pad)/i)) {
				return true;	
			} else {
				return false;
			}
		};

		this.PreventIOSEvents = function(restrict) {
			if (restrict) {
				$('body').on('touchmove', function(event) {
					event.preventDefault();
				});
			} else {
				$('body').off('touchmove');
			}
		};

		/**
		 * Closes the lightbox
		 */
		this.Close = function() {
			// Reset the overflow on body
			if ($("body").attr("style") && this.Data.overflow != "hidden") {
				$("body").css("overflow", "");
			}

			// Remove the freshbox
			$("#freshbox").off().unbind().remove();

			// Reenable scaling and scrolling in iOS
			this.PreventIOSEvents(false);
		};

		// Return the data, keep it chaining
		return this.each(function() {
			// Keep chaining
			var $this = $(this);

			// Run it
			self.Init();
		});
	};
})(jQuery);

/**
 * Images loaded
 */

(function(c,n){var l="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";c.fn.imagesLoaded=function(f){function m(){var b=c(i),a=c(h);d&&(h.length?d.reject(e,b,a):d.resolve(e));c.isFunction(f)&&f.call(g,e,b,a)}function j(b,a){b.src===l||-1!==c.inArray(b,k)||(k.push(b),a?h.push(b):i.push(b),c.data(b,"imagesLoaded",{isBroken:a,src:b.src}),o&&d.notifyWith(c(b),[a,e,c(i),c(h)]),e.length===k.length&&(setTimeout(m),e.unbind(".imagesLoaded")))}var g=this,d=c.isFunction(c.Deferred)?c.Deferred():
0,o=c.isFunction(d.notify),e=g.find("img").add(g.filter("img")),k=[],i=[],h=[];c.isPlainObject(f)&&c.each(f,function(b,a){if("callback"===b)f=a;else if(d)d[b](a)});e.length?e.bind("load.imagesLoaded error.imagesLoaded",function(b){j(b.target,"error"===b.type)}).each(function(b,a){var d=a.src,e=c.data(a,"imagesLoaded");if(e&&e.src===d)j(a,e.isBroken);else if(a.complete&&a.naturalWidth!==n)j(a,0===a.naturalWidth||0===a.naturalHeight);else if(a.readyState||a.complete)a.src=l,a.src=d}):m();return d?d.promise(g):
g}})(jQuery);