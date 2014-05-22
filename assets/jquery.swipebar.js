
var scroll = 
    window.requestAnimationFrame || 
    window.webkitRequestAnimationFrame || 
    window.mozRequestAnimationFrame || 
    window.msRequestAnimationFrame || 
    window.oRequestAnimationFrame || 
    function(callback){ 
        window.setTimeout(callback, 1000/60) 
    };

(function($) {
    $.swipebar = function(options) {

        // Methods
        if ( typeof(options) == "undefined" || options == null ) { options = {}; };

        // Constructor
        var _swipebar = {

            // Options
            options: $.extend({

                // Elements
                containee : "#container",
                block     : ".block",
                margin    : 240,

                // Scrolling
                threshold : 400,

                // Navigation
                navigation : true,
                nav_margin : 4,

            }, options),

            // Settings
            settings : {

            },

            /**
             * Data
             *
             * Stores stuff which is used throughout the plugin.
             * Setup by setData()
             */
            data : {

                blocks : {
                    "cache" : [ ],
                    "active" : 1,
                    "last"   : 0,
                    "count"  : 0
                },

                container : {
                    "height"      : 0,
                    "$navigation" : null, 
                    "$position"   : null
                },

                scroll : {
                    "direction" : null,
                    "position"  : -1
                },

                navigation : {
                    "group_count"        : 0,
                    "group_blocks_count" : 0,
                    "block_height"       : 0,
                    "height"             : 0,
                    "innerheight"        : 0,
                    "update_position"    : false
                },

                window : {
                    "height" : 0,
                    "width"  : 0,
                    "mobile" : false,
                    "zoom"   : 0
                }

            },

            /**
             * Set Data
             *
             * Called whenever a project is loaded. Defines some critical things
             * such as how many blocks are on the page, builds a cahce of the block
             * elements and resets a few things related to the navigation.
             */
            setData : function() {

                var _data = _swipebar.data;

                // Clear the cache
                _data.blocks.cache = [ ];

                // Add blocks to the cache
                $(_swipebar.options.container).find(_swipebar.options.block).not("#fullscreen").each(function() {
                    _data.blocks.cache.push($(this)[0]);
                    _swipebar.resizeBlock($(this));
                    _swipebar.formatBlock($(this));
                });

                // Blocks
                _data.blocks.active = 1;
                _data.blocks.last   = 0;
                _data.blocks.count  = _data.blocks.cache.length;

                // Container
                _data.container.height = _data.blocks.count * _swipebar.options.threshold;

                // Scroll
                _data.scroll.position = -1;

                // Mobile
                if ( navigator.userAgent.match(/(iPod|iPhone|iPad)/) ) {
                    _data.window.mobile = true;
                }

            },

            /**
             * Timeouts stores debounced events
             */
            timeouts : { },

            /**
             * Delay
             * - Used to debounce events which are triggered often, like window resize
             */
            delay : function (callback, ms, uniqueId) {

                // Does it have an ID?
                if ( !uniqueId ) {
                    uniqueId = "Don't call this twice without a uniqueId";
                }

                // If it already exists, clear it
                if ( _swipebar.timeouts[uniqueId] ) {
                    clearTimeout ( _swipebar.timeouts[uniqueId] );
                }

                // Add the timeout
                _swipebar.timeouts[uniqueId] = setTimeout(callback, ms);

            },

            resize : function() {

                var height = $(window).height(),
                    width  = $(window).width();

                if ( height > 400 ) {
                    _swipebar.data.window.height = height;
                    _swipebar.data.window.width  = width;
                    _swipebar.setNavigationHeight();
                }

                // Set the height of the container
                $(_swipebar.options.container).css("height", _swipebar.data.container.height + height);

                if ( _swipebar.data.window.mobile ) {
                    _swipebar.data.window.zoom = document.body.offsetWidth / _swipebar.GetIOSWindowSize().width;
                }

                // Resize the blocks
                for (var i = _swipebar.data.blocks.count - 1; i >= 0; i--) {
                    _swipebar.resizeBlock($(_swipebar.data.blocks.cache[i]));
                };

            },

            /**
             * Loop
             *
             * Checks the window position. If we've scrolled, run some functions.
             */
            loop : function() {
                
                var position = $(window).scrollTop();

                // Avoid calculations if not needed
                if ( _swipebar.data.scroll.position == position ) {
                    scroll(_swipebar.loop);
                    return false

                } else {

                    // Set some data
                    if ( position > _swipebar.data.scroll.position ) {
                        _swipebar.data.scroll.direction = "down";
                    } else {
                        _swipebar.data.scroll.direction = "up";
                    }

                    _swipebar.data.scroll.position = position;

                }

                // Make a few calls
                _swipebar.getActiveBlock();
                _swipebar.setNavigationActive();

                // If the position should update
                if ( _swipebar.data.navigation.update_position ) {
                    _swipebar.setPositionActive();
                }

                _swipebar.delay(function() {
                    _swipebar.setPositionIdle();   
                }, 200, "position_idle");

                _swipebar.delay(function() {
                    _swipebar.setNavigationIdle();
                }, 3000, "scroll_idle");

                // Loop
                scroll(_swipebar.loop);

            },

            mousemove : function() {

                $("#project").mousemove(function() {
                    _swipebar.setNavigationActive();

                    _swipebar.delay(function() {
                        _swipebar.setNavigationIdle();
                    }, 1000, "mousemove_idle");
                });

                _swipebar.delay(function() {
                    _swipebar.setNavigationIdle();
                }, 1000, "mousemove_idle");

            },

            /**
             * Navigation
             */

            makeNavigation : function() {

                // Blocks cache
                var blocks = "";

                // Make the elements
                for ( var i = 0 ; i < _swipebar.data.blocks.count; i++ ) {
                    blocks = blocks + '<a href="#" data-block="' + i + '" class="swipebar_navigation_block"><span></span></a>';
                }

                _swipebar.data.container.$navigation.find("a[data-block]").remove();
                $("#swipebar_navigation_blocks").append(blocks);

                /**
                 * Navigation
                 */
                _swipebar.setNavigationEvents();

                // Inspector
                Cargo.Event.on("inspector_unload", function( ) {
                    _swipebar.setNavigationEvents();
                });

                // Set some data
                _swipebar.data.navigation.block_height = 25;
                _swipebar.data.navigation.innerheight  = _swipebar.data.navigation.block_height * _swipebar.data.blocks.count;

                // Callback
                Cargo.Event.trigger("swipebar_navigation_ready"); 

            },

            setNavigationEvents : function() {

                _swipebar.data.container.$navigation.find("a[data-block]").click(function() {
                    _swipebar.gotoBlock($(this).attr("data-block"));
                    _swipebar.setPositionInactive();
                    return false;
                });

                _swipebar.data.container.$navigation.find(".goto.prev").click(function() {
                    _swipebar.gotoPrev();
                    return false;
                });


                _swipebar.data.container.$navigation.find(".goto.next").click(function() {
                    _swipebar.gotoNext();                    
                    return false;
                });

            },

            gotoNext : function() {
                if ( _swipebar.data.blocks.active !== _swipebar.data.blocks.last ) {
                    _swipebar.gotoBlock(_swipebar.data.blocks.active + 1);
                    _swipebar.setPositionInactive();
                }
            },

            gotoPrev : function() {
                if ( _swipebar.data.blocks.active !== 0 ) {
                    _swipebar.gotoBlock(_swipebar.data.blocks.active - 1);
                    _swipebar.setPositionInactive();
                }
            },

            gotoBlock : function(block) {

                var distance = block * _swipebar.options.threshold;

                if ( _swipebar.data.window.mobile ) {
                    // Account for the zoom level for mobile
                    distance += Math.floor(_swipebar.data.window.zoom * block);
                }

                $(window).scrollTop(distance);

            },

            getDocumentHeight : function() {
                return Math.max(
                    Math.max(document.body.scrollHeight, document.documentElement.scrollHeight),
                    Math.max(document.body.offsetHeight, document.documentElement.offsetHeight),
                    Math.max(document.body.clientHeight, document.documentElement.clientHeight)
                );
            },

            setNavigationHeight : function() {

                var navigation = {
                    "height" : _swipebar.data.blocks.count * _swipebar.data.navigation.block_height,
                    "margin" : 150
                };

                // Update the global data
                _swipebar.data.navigation.group_blocks_count = Math.floor( ( _swipebar.data.window.height - ( navigation.margin * 2 ) ) / _swipebar.data.navigation.block_height );

                // Navigation
                $navigation = _swipebar.data.container.$navigation;

                // If the navigation is higher than the window
                if ( _swipebar.data.blocks.count >= _swipebar.data.navigation.group_blocks_count ) {
                    navigation.height = _swipebar.data.navigation.block_height * _swipebar.data.navigation.group_blocks_count;
                }

                // Update the styles
                $navigation.css({
                    "height"    : navigation.height,
                    "marginTop" : "-" + ( navigation.height / 2 ) + "px"
                });

            },

            getActiveBlock : function() {

                var scroll = {
                    "position"   : _swipebar.data.scroll.position
                };

                // If we're in scrolling range, run a bunch of stuff
                if ( scroll.position >= 0 && scroll.position < _swipebar.data.container.height ) {

                    // Update the global scroll position
                    _swipebar.data.scroll.position = scroll.position;

                    // What block are we on
                    var new_block = Math.floor( _swipebar.data.scroll.position / _swipebar.options.threshold );

                    // If we're on a new block
                    if ( new_block !== _swipebar.data.blocks.active ) {
                        _swipebar.data.blocks.last   = _swipebar.data.blocks.active;
                        _swipebar.data.blocks.active = new_block;
                        _swipebar.setActive();
                    }

                    // Position the indication

                    var top    = Math.round( _swipebar.data.blocks.active * _swipebar.data.navigation.block_height ) + 6,
                        height = Math.round( ( _swipebar.data.scroll.position / _swipebar.options.threshold ) * _swipebar.data.navigation.block_height - top ) + 9;

                    if ( _swipebar.data.scroll.direction == "up" ) {
                        top    = top - _swipebar.data.navigation.block_height + height;
                        height = _swipebar.data.navigation.block_height - height;
                    }

                    // Keep in range
                    if ( top < 0 ) {
                        top    = 7;
                        height = 0;
                    } else if ( top + _swipebar.data.navigation.block_height >= _swipebar.data.navigation.innerheight ) {
                        height = 0;

                    // If in range, remove the position attribute
                    } else {

                        $(_swipebar.options.container).attr("data-position", _swipebar.data.blocks.active);

                    }

                    // Update the styles
                    _swipebar.data.container.$position.css({
                        "top"     : top,
                        "height"  : height + 12
                    });

                }

            },

            setActive : function() {

                // Local version of group blocks count with the margin subtracted
                var group_blocks_count = _swipebar.data.navigation.group_blocks_count - _swipebar.options.nav_margin;

                var buffer = {

                        // Returns first or last, is added as an attribute to the nav
                        "group"  : "",

                        // The number of groups
                        "groups" : Math.floor( _swipebar.data.blocks.count / group_blocks_count ),

                        // Stores the active group by dividing the active block by the number of blocks in each group
                        "offset" : Math.floor( _swipebar.data.blocks.active / group_blocks_count),

                        // The distance for each step of scrolling
                        "distance" : Math.floor( _swipebar.data.navigation.block_height * group_blocks_count ),

                        // Used to calculate the correct difference between a full 
                        // group and the remaining blocks in the last group.
                        "diff" : 0,

                        "timeout" : 0

                };

                // Elements
                var $active_block = $(_swipebar.data.blocks.cache[_swipebar.data.blocks.active]);
                var $last_block   = $(_swipebar.data.blocks.cache[_swipebar.data.blocks.last]);

                // Add the active class to the existing block
                $last_block.removeClass("active");
                $active_block.addClass("active");

                // Remove active class from indicators in the nav
                $("#swipebar_navigation a[data-block]").removeClass("active");

                // Add active class to the active nav indicator
                $("#swipebar_navigation a[data-block]").eq(_swipebar.data.blocks.active).addClass("active");

                var temp = ( (buffer.groups + 1) * group_blocks_count ) - _swipebar.data.blocks.count;

                // First group
                if ( buffer.offset == 0 ) {

                    buffer.group   = "first";
                    buffer.timeout = 250;

                // Last group
                } else if ( buffer.offset == buffer.groups ) {

                    buffer.group   = "last";
                    buffer.timeout = 250;

                    buffer.diff    = temp * _swipebar.data.navigation.block_height + 50;
                    // @todo redundant + 50 offset

                }

                // If there is a single group
                if ( buffer.groups == 0 ) {
                    $("#swipebar_navigation").attr("data-group", "single");

                // If there are multiple groups
                } else {

                    _swipebar.delay(function() {
                        $("#swipebar_navigation").attr("data-group", buffer.group);
                    }, buffer.timeout, "group");

                }

                // Update the offset of the group
                buffer.offset = ( buffer.offset * buffer.distance ) - 50 - buffer.diff;

                // Reset if we're less than 0
                if ( buffer.offset < 0 ) {
                    buffer.offset = 0;
                }

                // Offset the navigation
                $("#swipebar_navigation_blocks").css("top", "-" + buffer.offset  + "px");

            },

            formatBlock : function($block) {

                // Class checks
                if ( $block.hasClass("full") ) {
                    _swipebar.formatFull($block);
                }

            },

            formatFull : function($block) {

                // Locate the first image
                var $img = $block.find("img:first");

                // Set the first image as the background
                $block.css({
                    "background-image" : "url(" + $img.attr("src") + ")"
                });

                // Remove the img
                $img.remove();

            },

            resizeBlock : function($block, block_height, block_width) {
                var originalBlock = $block;
                // Reference
                _this = this;

                var window_width = _swipebar.data.window.width - _this.options.margin;
                var window_height = _swipebar.data.window.height - _this.options.margin;

                // If we shouldn't resize, ignore
                if ( $block.hasClass("full") ) {
                    return false;
                }

                // Cargo video fix
                if ( $block.hasClass("video_component") ) {
                    $block = $block.find("object");
                }

                $solo = $(".solo");

                $block.css({
                    "height" : "",
                    "width"  : ""
                });

                var doResize = function($block, block_height, block_width){

                    // The block dimension
                    if ( block_height == undefined ) {
                        block_height = $block.height();
                    }

                    if ( block_width == undefined ) {
                        block_width  = $block.width();
                    }

                    // The block ratios
                    var height_ratio = window_height / block_height;
                    var width_ratio  = window_width / block_width;

                    // The difference
                    var height_diff = width_ratio * block_height;
                    var width_diff  = height_ratio * block_width;

                    // The updated height
                    var new_block_height = block_height;
                        new_block_width  = block_width;

                    // If the image is taller or wider than the window
                    if (block_height > window_height || block_width > window_width) {

                        if (window_height > height_diff) {
                            new_block_height = height_diff;
                            new_block_width  = window_width;
                        } else {
                            new_block_height = window_height;
                            new_block_width  = width_diff;
                        }

                    }

                    /*if($block.has('[width]')){
                        var imgMaxWidth = parseInt($block.attr('width'));
                        var imgMaxHeight = parseInt($block.attr('height'));
                        if(new_block_width > imgMaxWidth || new_block_height > imgMaxHeight){
                            new_block_height = imgMaxHeight;
                            new_block_width = imgMaxWidth;
                        }
                    }*/

                    // Resize for FF and IE
                    if ( $.browser.msie || $.browser.moz ) {
                        new_block_height = new_block_height + 10;
                        new_block_width  = new_block_width + 10;
                    }

                    // If we shouldn't resize
                    if ( $block.hasClass("noresize") ) {

                        new_block_height = block_height;
                        new_block_width  = block_width;

                    }

                    // Resize it
                    $block.css({
                        "height" : new_block_height,
                        "width"  : new_block_width
                    });
                }

                var slideshowObj = null;

                if($block.hasClass('slideshow')){
                    slideshowObj = Cargo.Core.Slideshow.SlideshowObjects[$block.attr('data-id')];
                    slideshowObj.resizeContainer();
                    _swipebar.positionBlock(originalBlock, originalBlock.find('.slideshow_container').height(), originalBlock.find('.slideshow_container').width());
                } else {
                    doResize($block, block_height, block_width);
                    _swipebar.positionBlock(originalBlock);
                }

            },

            positionBlock : function($block, block_height, block_width) {
                if ( block_height == undefined ) {
                    block_height = $block.height()
                }

                if ( block_width == undefined ) {
                    block_width = $block.width()
                }
                
                // Position it
                $block.css({
                    "marginTop" : "-" + ( block_height / 2 ) + "px",
                    "marginLeft": "-" + ( block_width / 2 ) + "px"
                });

            },

            setNavigationIdle : function() {
                _swipebar.data.container.$navigation.removeClass("active");
            },
            setNavigationActive : function() {
                _swipebar.data.container.$navigation.addClass("active");
            },

            setPositionIdle : function() {
                _swipebar.data.container.$position.removeClass("active");
            },
            setPositionActive : function() {
                _swipebar.data.container.$position.addClass("active");
            },
            setPositionInactive : function() {
                _swipebar.data.container.$position.addClass("ignore");
                _swipebar.delay(function() {
                    _swipebar.data.container.$position.removeClass("ignore");
                }, 600);
            },

            setPositionDelay : function() {
                _swipebar.data.navigation.update_position = false;

                _swipebar.delay(function() {
                    _swipebar.data.navigation.update_position = true;
                }, 600);
            },

            /**
             * iOS Scrolling
             */
            setIosScroll : function() {

                // Skip if we're not on iOS
                if ( ! _swipebar.data.window.mobile ) {
                    return false;
                }

                // Swipe navigation
                $("body").swipe({

                    // Options
                    threshold : 75,
                    triggerOnTouchEnd : false,

                    swipeUp : function(event, target) {
                         event.preventDefault();
                        $(".goto.next").click();
                    },

                    swipeDown : function(event, target) {
                        event.preventDefault();
                        $(".goto.prev").click();
                    }

                });

                $("body").addClass("ios");

            },

            removeIosScroll : function() {
                $("body").removeClass("ios");
                $("body").swipe("destroy");
            },

            GetIOSWindowSize : function() {
                var width   = screen.width;
                var height  = screen.height;

                if (window.orientation !== 0) {
                    width = screen.height;
                    height = screen.width;
                }

                if (navigator.userAgent.match(/i(Phone|Pod)/i)) {
                    if (window.orientation === 0) {
                        height -= 44;
                    } else {
                        height -= 32;
                    }
                }

                if (navigator.userAgent.match(/iPad/i))
                    height -= 58;

                return {
                    width: width,
                    height: height
                };
            },

            setElements : function() {
                if ( _swipebar.data.container.$navigation.length == 0 ) {
                    _swipebar.data.container.$navigation = $("#swipebar_navigation");
                    _swipebar.data.container.$position   = $("#swipebar_navigation .position");
                }
            },

            /**
             * On
             * - Initializes the plugin
             */
            on : function() {

                // Element cache
                 _swipebar.data.container.$navigation = $("#swipebar_navigation");
                _swipebar.data.container.$position   = $("#swipebar_navigation .position");

                //Cargo.Core.log(_swipebar.data.container.$position);

                // Init
                _swipebar.loop();
                _swipebar.setActive();
                _swipebar.resize();

                // Start
                _swipebar.gotoBlock(0);

                $(window).on('webkitfullscreenchange mozfullscreenchange fullscreenchange', _swipebar.resize);

            },

            off : function() {

                // Set as off
                $("body").attr("data-swipebar", "off");
                _swipebar.removeIosScroll();

                if ( _swipebar.data.window.mobile ) {
                    setTimeout(function() {
                        $(_swipebar.options.container).css("height", "");
                    }, 10);
                } else {
                    $(_swipebar.options.container).css("height", "");
                }

            },

            refresh : function() {

                // Set as active
                $("body").attr("data-swipebar", "on");

                // Reset the data
                _swipebar.setData();
                _swipebar.setIosScroll();

                // If there's navigation
                if ( _swipebar.options.navigation ) {

                    _swipebar.makeNavigation();
                    _swipebar.mousemove();
                    _swipebar.setPositionDelay();
                    _swipebar.resize();

                    // Resize
                    $(window).resize(function() {
                        _swipebar.delay(function() {
                            _swipebar.resize();
                        }, 1, "resize");
                    });

                }

            }

        };

        /**
         * Public methods
         */
        return {

            // Master
            init    : _swipebar.init,

            // Toggle
            on      : _swipebar.on,
            off     : _swipebar.off,

            refresh  : _swipebar.refresh,
            resize   : _swipebar.resizeBlock,
            position : _swipebar.positionBlock,

            gotoBlock: _swipebar.gotoBlock,
            gotoNext : _swipebar.gotoNext,
            gotoPrev : _swipebar.gotoPrev,

            // Handy
            data    : _swipebar.data,
            options : _swipebar.options,

            setElements : _swipebar.setElements

        };

    };

})(jQuery);