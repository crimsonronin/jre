if (!jQuery) {
    throw new Error("Bootstrap requires jQuery")
} + function ($) {
    "use strict";

    function transitionEnd() {
        var el = document.createElement("bootstrap");
        var transEndEventNames = {
            WebkitTransition: "webkitTransitionEnd",
            MozTransition: "transitionend",
            OTransition: "oTransitionEnd otransitionend",
            transition: "transitionend"
        };
        for (var name in transEndEventNames) {
            if (el.style[name] !== undefined) {
                return {
                    end: transEndEventNames[name]
                }
            }
        }
    }
    $.fn.emulateTransitionEnd = function (duration) {
        var called = false,
            $el = this;
        $(this).one($.support.transition.end, function () {
            called = true
        });
        var callback = function () {
            if (!called) $($el).trigger($.support.transition.end)
        };
        setTimeout(callback, duration);
        return this
    };
    $(function () {
        $.support.transition = transitionEnd()
    })
}(window.jQuery); + function ($) {
    "use strict";
    var dismiss = '[data-dismiss="alert"]';
    var Alert = function (el) {
        $(el).on("click", dismiss, this.close)
    };
    Alert.prototype.close = function (e) {
        var $this = $(this);
        var selector = $this.attr("data-target");
        if (!selector) {
            selector = $this.attr("href");
            selector = selector && selector.replace(/.*(?=#[^\s]*$)/, "")
        }
        var $parent = $(selector);
        if (e) e.preventDefault();
        if (!$parent.length) {
            $parent = $this.hasClass("alert") ? $this : $this.parent()
        }
        $parent.trigger(e = $.Event("close.bs.alert"));
        if (e.isDefaultPrevented()) return;
        $parent.removeClass("in");

        function removeElement() {
            $parent.trigger("closed.bs.alert").remove()
        }
        $.support.transition && $parent.hasClass("fade") ? $parent.one($.support.transition.end, removeElement).emulateTransitionEnd(150) : removeElement()
    };
    var old = $.fn.alert;
    $.fn.alert = function (option) {
        return this.each(function () {
            var $this = $(this);
            var data = $this.data("bs.alert");
            if (!data) $this.data("bs.alert", data = new Alert(this));
            if (typeof option == "string") data[option].call($this)
        })
    };
    $.fn.alert.Constructor = Alert;
    $.fn.alert.noConflict = function () {
        $.fn.alert = old;
        return this
    };
    $(document).on("click.bs.alert.data-api", dismiss, Alert.prototype.close)
}(window.jQuery); + function ($) {
    "use strict";
    var Button = function (element, options) {
        this.$element = $(element);
        this.options = $.extend({}, Button.DEFAULTS, options)
    };
    Button.DEFAULTS = {
        loadingText: "loading..."
    };
    Button.prototype.setState = function (state) {
        var d = "disabled";
        var $el = this.$element;
        var val = $el.is("input") ? "val" : "html";
        var data = $el.data();
        state = state + "Text";
        if (!data.resetText) $el.data("resetText", $el[val]());
        $el[val](data[state] || this.options[state]);
        setTimeout(function () {
            state == "loadingText" ? $el.addClass(d).attr(d, d) : $el.removeClass(d).removeAttr(d)
        }, 0)
    };
    Button.prototype.toggle = function () {
        var $parent = this.$element.closest('[data-toggle="buttons"]');
        if ($parent.length) {
            var $input = this.$element.find("input").prop("checked", !this.$element.hasClass("active")).trigger("change");
            if ($input.prop("type") === "radio") $parent.find(".active").removeClass("active")
        }
        this.$element.toggleClass("active")
    };
    var old = $.fn.button;
    $.fn.button = function (option) {
        return this.each(function () {
            var $this = $(this);
            var data = $this.data("bs.button");
            var options = typeof option == "object" && option;
            if (!data) $this.data("bs.button", data = new Button(this, options));
            if (option == "toggle") data.toggle();
            else if (option) data.setState(option)
        })
    };
    $.fn.button.Constructor = Button;
    $.fn.button.noConflict = function () {
        $.fn.button = old;
        return this
    };
    $(document).on("click.bs.button.data-api", "[data-toggle^=button]", function (e) {
        var $btn = $(e.target);
        if (!$btn.hasClass("btn")) $btn = $btn.closest(".btn");
        $btn.button("toggle");
        e.preventDefault()
    })
}(window.jQuery); + function ($) {
    "use strict";
    var Carousel = function (element, options) {
        this.$element = $(element);
        this.$indicators = this.$element.find(".carousel-indicators");
        this.options = options;
        this.paused = this.sliding = this.interval = this.$active = this.$items = null;
        this.options.pause == "hover" && this.$element.on("mouseenter", $.proxy(this.pause, this)).on("mouseleave", $.proxy(this.cycle, this))
    };
    Carousel.DEFAULTS = {
        interval: 5e3,
        pause: "hover",
        wrap: true
    };
    Carousel.prototype.cycle = function (e) {
        e || (this.paused = false);
        this.interval && clearInterval(this.interval);
        this.options.interval && !this.paused && (this.interval = setInterval($.proxy(this.next, this), this.options.interval));
        return this
    };
    Carousel.prototype.getActiveIndex = function () {
        this.$active = this.$element.find(".item.active");
        this.$items = this.$active.parent().children();
        return this.$items.index(this.$active)
    };
    Carousel.prototype.to = function (pos) {
        var that = this;
        var activeIndex = this.getActiveIndex();
        if (pos > this.$items.length - 1 || pos < 0) return;
        if (this.sliding) return this.$element.one("slid", function () {
            that.to(pos)
        });
        if (activeIndex == pos) return this.pause().cycle();
        return this.slide(pos > activeIndex ? "next" : "prev", $(this.$items[pos]))
    };
    Carousel.prototype.pause = function (e) {
        e || (this.paused = true);
        if (this.$element.find(".next, .prev").length && $.support.transition.end) {
            this.$element.trigger($.support.transition.end);
            this.cycle(true)
        }
        this.interval = clearInterval(this.interval);
        return this
    };
    Carousel.prototype.next = function () {
        if (this.sliding) return;
        return this.slide("next")
    };
    Carousel.prototype.prev = function () {
        if (this.sliding) return;
        return this.slide("prev")
    };
    Carousel.prototype.slide = function (type, next) {
        var $active = this.$element.find(".item.active");
        var $next = next || $active[type]();
        var isCycling = this.interval;
        var direction = type == "next" ? "left" : "right";
        var fallback = type == "next" ? "first" : "last";
        var that = this;
        if (!$next.length) {
            if (!this.options.wrap) return;
            $next = this.$element.find(".item")[fallback]()
        }
        this.sliding = true;
        isCycling && this.pause();
        var e = $.Event("slide.bs.carousel", {
            relatedTarget: $next[0],
            direction: direction
        });
        if ($next.hasClass("active")) return;
        if (this.$indicators.length) {
            this.$indicators.find(".active").removeClass("active");
            this.$element.one("slid", function () {
                var $nextIndicator = $(that.$indicators.children()[that.getActiveIndex()]);
                $nextIndicator && $nextIndicator.addClass("active")
            })
        }
        if ($.support.transition && this.$element.hasClass("slide")) {
            this.$element.trigger(e);
            if (e.isDefaultPrevented()) return;
            $next.addClass(type);
            $next[0].offsetWidth;
            $active.addClass(direction);
            $next.addClass(direction);
            $active.one($.support.transition.end, function () {
                $next.removeClass([type, direction].join(" ")).addClass("active");
                $active.removeClass(["active", direction].join(" "));
                that.sliding = false;
                setTimeout(function () {
                    that.$element.trigger("slid")
                }, 0)
            }).emulateTransitionEnd(600)
        } else {
            this.$element.trigger(e);
            if (e.isDefaultPrevented()) return;
            $active.removeClass("active");
            $next.addClass("active");
            this.sliding = false;
            this.$element.trigger("slid")
        }
        isCycling && this.cycle();
        return this
    };
    var old = $.fn.carousel;
    $.fn.carousel = function (option) {
        return this.each(function () {
            var $this = $(this);
            var data = $this.data("bs.carousel");
            var options = $.extend({}, Carousel.DEFAULTS, $this.data(), typeof option == "object" && option);
            var action = typeof option == "string" ? option : options.slide;
            if (!data) $this.data("bs.carousel", data = new Carousel(this, options));
            if (typeof option == "number") data.to(option);
            else if (action) data[action]();
            else if (options.interval) data.pause().cycle()
        })
    };
    $.fn.carousel.Constructor = Carousel;
    $.fn.carousel.noConflict = function () {
        $.fn.carousel = old;
        return this
    };
    $(document).on("click.bs.carousel.data-api", "[data-slide], [data-slide-to]", function (e) {
        var $this = $(this),
            href;
        var $target = $($this.attr("data-target") || (href = $this.attr("href")) && href.replace(/.*(?=#[^\s]+$)/, ""));
        var options = $.extend({}, $target.data(), $this.data());
        var slideIndex = $this.attr("data-slide-to");
        if (slideIndex) options.interval = false;
        $target.carousel(options);
        if (slideIndex = $this.attr("data-slide-to")) {
            $target.data("bs.carousel").to(slideIndex)
        }
        e.preventDefault()
    });
    $(window).on("load", function () {
        $('[data-ride="carousel"]').each(function () {
            var $carousel = $(this);
            $carousel.carousel($carousel.data())
        })
    })
}(window.jQuery); + function ($) {
    "use strict";
    var Collapse = function (element, options) {
        this.$element = $(element);
        this.options = $.extend({}, Collapse.DEFAULTS, options);
        this.transitioning = null;
        if (this.options.parent) this.$parent = $(this.options.parent);
        if (this.options.toggle) this.toggle()
    };
    Collapse.DEFAULTS = {
        toggle: true
    };
    Collapse.prototype.dimension = function () {
        var hasWidth = this.$element.hasClass("width");
        return hasWidth ? "width" : "height"
    };
    Collapse.prototype.show = function () {
        if (this.transitioning || this.$element.hasClass("in")) return;
        var startEvent = $.Event("show.bs.collapse");
        this.$element.trigger(startEvent);
        if (startEvent.isDefaultPrevented()) return;
        var actives = this.$parent && this.$parent.find("> .panel > .in");
        if (actives && actives.length) {
            var hasData = actives.data("bs.collapse");
            if (hasData && hasData.transitioning) return;
            actives.collapse("hide");
            hasData || actives.data("bs.collapse", null)
        }
        var dimension = this.dimension();
        this.$element.removeClass("collapse").addClass("collapsing")[dimension](0);
        this.transitioning = 1;
        var complete = function () {
            this.$element.removeClass("collapsing").addClass("in")[dimension]("auto");
            this.transitioning = 0;
            this.$element.trigger("shown.bs.collapse")
        };
        if (!$.support.transition) return complete.call(this);
        var scrollSize = $.camelCase(["scroll", dimension].join("-"));
        this.$element.one($.support.transition.end, $.proxy(complete, this)).emulateTransitionEnd(350)[dimension](this.$element[0][scrollSize])
    };
    Collapse.prototype.hide = function () {
        if (this.transitioning || !this.$element.hasClass("in")) return;
        var startEvent = $.Event("hide.bs.collapse");
        this.$element.trigger(startEvent);
        if (startEvent.isDefaultPrevented()) return;
        var dimension = this.dimension();
        this.$element[dimension](this.$element[dimension]())[0].offsetHeight;
        this.$element.addClass("collapsing").removeClass("collapse").removeClass("in");
        this.transitioning = 1;
        var complete = function () {
            this.transitioning = 0;
            this.$element.trigger("hidden.bs.collapse").removeClass("collapsing").addClass("collapse")
        };
        if (!$.support.transition) return complete.call(this);
        this.$element[dimension](0).one($.support.transition.end, $.proxy(complete, this)).emulateTransitionEnd(350)
    };
    Collapse.prototype.toggle = function () {
        this[this.$element.hasClass("in") ? "hide" : "show"]()
    };
    var old = $.fn.collapse;
    $.fn.collapse = function (option) {
        return this.each(function () {
            var $this = $(this);
            var data = $this.data("bs.collapse");
            var options = $.extend({}, Collapse.DEFAULTS, $this.data(), typeof option == "object" && option);
            if (!data) $this.data("bs.collapse", data = new Collapse(this, options));
            if (typeof option == "string") data[option]()
        })
    };
    $.fn.collapse.Constructor = Collapse;
    $.fn.collapse.noConflict = function () {
        $.fn.collapse = old;
        return this
    };
    $(document).on("click.bs.collapse.data-api", "[data-toggle=collapse]", function (e) {
        var $this = $(this),
            href;
        var target = $this.attr("data-target") || e.preventDefault() || (href = $this.attr("href")) && href.replace(/.*(?=#[^\s]+$)/, "");
        var $target = $(target);
        var data = $target.data("bs.collapse");
        var option = data ? "toggle" : $this.data();
        var parent = $this.attr("data-parent");
        var $parent = parent && $(parent);
        if (!data || !data.transitioning) {
            if ($parent) $parent.find('[data-toggle=collapse][data-parent="' + parent + '"]').not($this).addClass("collapsed");
            $this[$target.hasClass("in") ? "addClass" : "removeClass"]("collapsed")
        }
        $target.collapse(option)
    })
}(window.jQuery); + function ($) {
    "use strict";
    var backdrop = ".dropdown-backdrop";
    var toggle = "[data-toggle=dropdown]";
    var Dropdown = function (element) {
        var $el = $(element).on("click.bs.dropdown", this.toggle)
    };
    Dropdown.prototype.toggle = function (e) {
        var $this = $(this);
        if ($this.is(".disabled, :disabled")) return;
        var $parent = getParent($this);
        var isActive = $parent.hasClass("open");
        clearMenus();
        if (!isActive) {
            if ("ontouchstart" in document.documentElement && !$parent.closest(".navbar-nav").length) {
                $('<div class="dropdown-backdrop"/>').insertAfter($(this)).on("click", clearMenus)
            }
            $parent.trigger(e = $.Event("show.bs.dropdown"));
            if (e.isDefaultPrevented()) return;
            $parent.toggleClass("open").trigger("shown.bs.dropdown");
            $this.focus()
        }
        return false
    };
    Dropdown.prototype.keydown = function (e) {
        if (!/(38|40|27)/.test(e.keyCode)) return;
        var $this = $(this);
        e.preventDefault();
        e.stopPropagation();
        if ($this.is(".disabled, :disabled")) return;
        var $parent = getParent($this);
        var isActive = $parent.hasClass("open");
        if (!isActive || isActive && e.keyCode == 27) {
            if (e.which == 27) $parent.find(toggle).focus();
            return $this.click()
        }
        var $items = $("[role=menu] li:not(.divider):visible a", $parent);
        if (!$items.length) return;
        var index = $items.index($items.filter(":focus"));
        if (e.keyCode == 38 && index > 0) index--;
        if (e.keyCode == 40 && index < $items.length - 1) index++;
        if (!~index) index = 0;
        $items.eq(index).focus()
    };

    function clearMenus() {
        $(backdrop).remove();
        $(toggle).each(function (e) {
            var $parent = getParent($(this));
            if (!$parent.hasClass("open")) return;
            $parent.trigger(e = $.Event("hide.bs.dropdown"));
            if (e.isDefaultPrevented()) return;
            $parent.removeClass("open").trigger("hidden.bs.dropdown")
        })
    }
    function getParent($this) {
        var selector = $this.attr("data-target");
        if (!selector) {
            selector = $this.attr("href");
            selector = selector && /#/.test(selector) && selector.replace(/.*(?=#[^\s]*$)/, "")
        }
        var $parent = selector && $(selector);
        return $parent && $parent.length ? $parent : $this.parent()
    }
    var old = $.fn.dropdown;
    $.fn.dropdown = function (option) {
        return this.each(function () {
            var $this = $(this);
            var data = $this.data("dropdown");
            if (!data) $this.data("dropdown", data = new Dropdown(this));
            if (typeof option == "string") data[option].call($this)
        })
    };
    $.fn.dropdown.Constructor = Dropdown;
    $.fn.dropdown.noConflict = function () {
        $.fn.dropdown = old;
        return this
    };
    $(document).on("click.bs.dropdown.data-api", clearMenus).on("click.bs.dropdown.data-api", ".dropdown form", function (e) {
        e.stopPropagation()
    }).on("click.bs.dropdown.data-api", toggle, Dropdown.prototype.toggle).on("keydown.bs.dropdown.data-api", toggle + ", [role=menu]", Dropdown.prototype.keydown)
}(window.jQuery); + function ($) {
    "use strict";
    var Modal = function (element, options) {
        this.options = options;
        this.$element = $(element);
        this.$backdrop = this.isShown = null;
        if (this.options.remote) this.$element.load(this.options.remote)
    };
    Modal.DEFAULTS = {
        backdrop: true,
        keyboard: true,
        show: true
    };
    Modal.prototype.toggle = function (_relatedTarget) {
        return this[!this.isShown ? "show" : "hide"](_relatedTarget)
    };
    Modal.prototype.show = function (_relatedTarget) {
        var that = this;
        var e = $.Event("show.bs.modal", {
            relatedTarget: _relatedTarget
        });
        this.$element.trigger(e);
        if (this.isShown || e.isDefaultPrevented()) return;
        this.isShown = true;
        this.escape();
        this.$element.on("click.dismiss.modal", '[data-dismiss="modal"]', $.proxy(this.hide, this));
        this.backdrop(function () {
            var transition = $.support.transition && that.$element.hasClass("fade");
            if (!that.$element.parent().length) {
                that.$element.appendTo(document.body)
            }
            that.$element.show();
            if (transition) {
                that.$element[0].offsetWidth
            }
            that.$element.addClass("in").attr("aria-hidden", false);
            that.enforceFocus();
            var e = $.Event("shown.bs.modal", {
                relatedTarget: _relatedTarget
            });
            transition ? that.$element.find(".modal-dialog").one($.support.transition.end, function () {
                that.$element.focus().trigger(e)
            }).emulateTransitionEnd(300) : that.$element.focus().trigger(e)
        })
    };
    Modal.prototype.hide = function (e) {
        if (e) e.preventDefault();
        e = $.Event("hide.bs.modal");
        this.$element.trigger(e);
        if (!this.isShown || e.isDefaultPrevented()) return;
        this.isShown = false;
        this.escape();
        $(document).off("focusin.bs.modal");
        this.$element.removeClass("in").attr("aria-hidden", true).off("click.dismiss.modal");
        $.support.transition && this.$element.hasClass("fade") ? this.$element.one($.support.transition.end, $.proxy(this.hideModal, this)).emulateTransitionEnd(300) : this.hideModal()
    };
    Modal.prototype.enforceFocus = function () {
        $(document).off("focusin.bs.modal").on("focusin.bs.modal", $.proxy(function (e) {
            if (this.$element[0] !== e.target && !this.$element.has(e.target).length) {
                this.$element.focus()
            }
        }, this))
    };
    Modal.prototype.escape = function () {
        if (this.isShown && this.options.keyboard) {
            this.$element.on("keyup.dismiss.bs.modal", $.proxy(function (e) {
                e.which == 27 && this.hide()
            }, this))
        } else if (!this.isShown) {
            this.$element.off("keyup.dismiss.bs.modal")
        }
    };
    Modal.prototype.hideModal = function () {
        var that = this;
        this.$element.hide();
        this.backdrop(function () {
            that.removeBackdrop();
            that.$element.trigger("hidden.bs.modal")
        })
    };
    Modal.prototype.removeBackdrop = function () {
        this.$backdrop && this.$backdrop.remove();
        this.$backdrop = null
    };
    Modal.prototype.backdrop = function (callback) {
        var that = this;
        var animate = this.$element.hasClass("fade") ? "fade" : "";
        if (this.isShown && this.options.backdrop) {
            var doAnimate = $.support.transition && animate;
            this.$backdrop = $('<div class="modal-backdrop ' + animate + '" />').appendTo(document.body);
            this.$element.on("click.dismiss.modal", $.proxy(function (e) {
                if (e.target !== e.currentTarget) return;
                this.options.backdrop == "static" ? this.$element[0].focus.call(this.$element[0]) : this.hide.call(this)
            }, this));
            if (doAnimate) this.$backdrop[0].offsetWidth;
            this.$backdrop.addClass("in");
            if (!callback) return;
            doAnimate ? this.$backdrop.one($.support.transition.end, callback).emulateTransitionEnd(150) : callback()
        } else if (!this.isShown && this.$backdrop) {
            this.$backdrop.removeClass("in");
            $.support.transition && this.$element.hasClass("fade") ? this.$backdrop.one($.support.transition.end, callback).emulateTransitionEnd(150) : callback()
        } else if (callback) {
            callback()
        }
    };
    var old = $.fn.modal;
    $.fn.modal = function (option, _relatedTarget) {
        return this.each(function () {
            var $this = $(this);
            var data = $this.data("bs.modal");
            var options = $.extend({}, Modal.DEFAULTS, $this.data(), typeof option == "object" && option);
            if (!data) $this.data("bs.modal", data = new Modal(this, options));
            if (typeof option == "string") data[option](_relatedTarget);
            else if (options.show) data.show(_relatedTarget)
        })
    };
    $.fn.modal.Constructor = Modal;
    $.fn.modal.noConflict = function () {
        $.fn.modal = old;
        return this
    };
    $(document).on("click.bs.modal.data-api", '[data-toggle="modal"]', function (e) {
        var $this = $(this);
        var href = $this.attr("href");
        var $target = $($this.attr("data-target") || href && href.replace(/.*(?=#[^\s]+$)/, ""));
        var option = $target.data("modal") ? "toggle" : $.extend({
            remote: !/#/.test(href) && href
        }, $target.data(), $this.data());
        e.preventDefault();
        $target.modal(option, this).one("hide", function () {
            $this.is(":visible") && $this.focus()
        })
    });
    $(document).on("show.bs.modal", ".modal", function () {
        $(document.body).addClass("modal-open")
    }).on("hidden.bs.modal", ".modal", function () {
        $(document.body).removeClass("modal-open")
    })
}(window.jQuery); + function ($) {
    "use strict";
    var Tooltip = function (element, options) {
        this.type = this.options = this.enabled = this.timeout = this.hoverState = this.$element = null;
        this.init("tooltip", element, options)
    };
    Tooltip.DEFAULTS = {
        animation: true,
        placement: "top",
        selector: false,
        template: '<div class="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>',
        trigger: "hover focus",
        title: "",
        delay: 0,
        html: false,
        container: false
    };
    Tooltip.prototype.init = function (type, element, options) {
        this.enabled = true;
        this.type = type;
        this.$element = $(element);
        this.options = this.getOptions(options);
        var triggers = this.options.trigger.split(" ");
        for (var i = triggers.length; i--;) {
            var trigger = triggers[i];
            if (trigger == "click") {
                this.$element.on("click." + this.type, this.options.selector, $.proxy(this.toggle, this))
            } else if (trigger != "manual") {
                var eventIn = trigger == "hover" ? "mouseenter" : "focus";
                var eventOut = trigger == "hover" ? "mouseleave" : "blur";
                this.$element.on(eventIn + "." + this.type, this.options.selector, $.proxy(this.enter, this));
                this.$element.on(eventOut + "." + this.type, this.options.selector, $.proxy(this.leave, this))
            }
        }
        this.options.selector ? this._options = $.extend({}, this.options, {
            trigger: "manual",
            selector: ""
        }) : this.fixTitle()
    };
    Tooltip.prototype.getDefaults = function () {
        return Tooltip.DEFAULTS
    };
    Tooltip.prototype.getOptions = function (options) {
        options = $.extend({}, this.getDefaults(), this.$element.data(), options);
        if (options.delay && typeof options.delay == "number") {
            options.delay = {
                show: options.delay,
                hide: options.delay
            }
        }
        return options
    };
    Tooltip.prototype.getDelegateOptions = function () {
        var options = {};
        var defaults = this.getDefaults();
        this._options && $.each(this._options, function (key, value) {
            if (defaults[key] != value) options[key] = value
        });
        return options
    };
    Tooltip.prototype.enter = function (obj) {
        var self = obj instanceof this.constructor ? obj : $(obj.currentTarget)[this.type](this.getDelegateOptions()).data("bs." + this.type);
        clearTimeout(self.timeout);
        self.hoverState = "in";
        if (!self.options.delay || !self.options.delay.show) return self.show();
        self.timeout = setTimeout(function () {
            if (self.hoverState == "in") self.show()
        }, self.options.delay.show)
    };
    Tooltip.prototype.leave = function (obj) {
        var self = obj instanceof this.constructor ? obj : $(obj.currentTarget)[this.type](this.getDelegateOptions()).data("bs." + this.type);
        clearTimeout(self.timeout);
        self.hoverState = "out";
        if (!self.options.delay || !self.options.delay.hide) return self.hide();
        self.timeout = setTimeout(function () {
            if (self.hoverState == "out") self.hide()
        }, self.options.delay.hide)
    };
    Tooltip.prototype.show = function () {
        var e = $.Event("show.bs." + this.type);
        if (this.hasContent() && this.enabled) {
            this.$element.trigger(e);
            if (e.isDefaultPrevented()) return;
            var $tip = this.tip();
            this.setContent();
            if (this.options.animation) $tip.addClass("fade");
            var placement = typeof this.options.placement == "function" ? this.options.placement.call(this, $tip[0], this.$element[0]) : this.options.placement;
            var autoToken = /\s?auto?\s?/i;
            var autoPlace = autoToken.test(placement);
            if (autoPlace) placement = placement.replace(autoToken, "") || "top";
            $tip.detach().css({
                top: 0,
                left: 0,
                display: "block"
            }).addClass(placement);
            this.options.container ? $tip.appendTo(this.options.container) : $tip.insertAfter(this.$element);
            var pos = this.getPosition();
            var actualWidth = $tip[0].offsetWidth;
            var actualHeight = $tip[0].offsetHeight;
            if (autoPlace) {
                var $parent = this.$element.parent();
                var orgPlacement = placement;
                var docScroll = document.documentElement.scrollTop || document.body.scrollTop;
                var parentWidth = this.options.container == "body" ? window.innerWidth : $parent.outerWidth();
                var parentHeight = this.options.container == "body" ? window.innerHeight : $parent.outerHeight();
                var parentLeft = this.options.container == "body" ? 0 : $parent.offset().left;
                placement = placement == "bottom" && pos.top + pos.height + actualHeight - docScroll > parentHeight ? "top" : placement == "top" && pos.top - docScroll - actualHeight < 0 ? "bottom" : placement == "right" && pos.right + actualWidth > parentWidth ? "left" : placement == "left" && pos.left - actualWidth < parentLeft ? "right" : placement;
                $tip.removeClass(orgPlacement).addClass(placement)
            }
            var calculatedOffset = this.getCalculatedOffset(placement, pos, actualWidth, actualHeight);
            this.applyPlacement(calculatedOffset, placement);
            this.$element.trigger("shown.bs." + this.type)
        }
    };
    Tooltip.prototype.applyPlacement = function (offset, placement) {
        var replace;
        var $tip = this.tip();
        var width = $tip[0].offsetWidth;
        var height = $tip[0].offsetHeight;
        var marginTop = parseInt($tip.css("margin-top"), 10);
        var marginLeft = parseInt($tip.css("margin-left"), 10);
        if (isNaN(marginTop)) marginTop = 0;
        if (isNaN(marginLeft)) marginLeft = 0;
        offset.top = offset.top + marginTop;
        offset.left = offset.left + marginLeft;
        $tip.offset(offset).addClass("in");
        var actualWidth = $tip[0].offsetWidth;
        var actualHeight = $tip[0].offsetHeight;
        if (placement == "top" && actualHeight != height) {
            replace = true;
            offset.top = offset.top + height - actualHeight
        }
        if (/bottom|top/.test(placement)) {
            var delta = 0;
            if (offset.left < 0) {
                delta = offset.left * -2;
                offset.left = 0;
                $tip.offset(offset);
                actualWidth = $tip[0].offsetWidth;
                actualHeight = $tip[0].offsetHeight
            }
            this.replaceArrow(delta - width + actualWidth, actualWidth, "left")
        } else {
            this.replaceArrow(actualHeight - height, actualHeight, "top")
        }
        if (replace) $tip.offset(offset)
    };
    Tooltip.prototype.replaceArrow = function (delta, dimension, position) {
        this.arrow().css(position, delta ? 50 * (1 - delta / dimension) + "%" : "")
    };
    Tooltip.prototype.setContent = function () {
        var $tip = this.tip();
        var title = this.getTitle();
        $tip.find(".tooltip-inner")[this.options.html ? "html" : "text"](title);
        $tip.removeClass("fade in top bottom left right")
    };
    Tooltip.prototype.hide = function () {
        var that = this;
        var $tip = this.tip();
        var e = $.Event("hide.bs." + this.type);

        function complete() {
            if (that.hoverState != "in") $tip.detach()
        }
        this.$element.trigger(e);
        if (e.isDefaultPrevented()) return;
        $tip.removeClass("in");
        $.support.transition && this.$tip.hasClass("fade") ? $tip.one($.support.transition.end, complete).emulateTransitionEnd(150) : complete();
        this.$element.trigger("hidden.bs." + this.type);
        return this
    };
    Tooltip.prototype.fixTitle = function () {
        var $e = this.$element;
        if ($e.attr("title") || typeof $e.attr("data-original-title") != "string") {
            $e.attr("data-original-title", $e.attr("title") || "").attr("title", "")
        }
    };
    Tooltip.prototype.hasContent = function () {
        return this.getTitle()
    };
    Tooltip.prototype.getPosition = function () {
        var el = this.$element[0];
        return $.extend({}, typeof el.getBoundingClientRect == "function" ? el.getBoundingClientRect() : {
            width: el.offsetWidth,
            height: el.offsetHeight
        }, this.$element.offset())
    };
    Tooltip.prototype.getCalculatedOffset = function (placement, pos, actualWidth, actualHeight) {
        return placement == "bottom" ? {
            top: pos.top + pos.height,
            left: pos.left + pos.width / 2 - actualWidth / 2
        } : placement == "top" ? {
            top: pos.top - actualHeight,
            left: pos.left + pos.width / 2 - actualWidth / 2
        } : placement == "left" ? {
            top: pos.top + pos.height / 2 - actualHeight / 2,
            left: pos.left - actualWidth
        } : {
            top: pos.top + pos.height / 2 - actualHeight / 2,
            left: pos.left + pos.width
        }
    };
    Tooltip.prototype.getTitle = function () {
        var title;
        var $e = this.$element;
        var o = this.options;
        title = $e.attr("data-original-title") || (typeof o.title == "function" ? o.title.call($e[0]) : o.title);
        return title
    };
    Tooltip.prototype.tip = function () {
        return this.$tip = this.$tip || $(this.options.template)
    };
    Tooltip.prototype.arrow = function () {
        return this.$arrow = this.$arrow || this.tip().find(".tooltip-arrow")
    };
    Tooltip.prototype.validate = function () {
        if (!this.$element[0].parentNode) {
            this.hide();
            this.$element = null;
            this.options = null
        }
    };
    Tooltip.prototype.enable = function () {
        this.enabled = true
    };
    Tooltip.prototype.disable = function () {
        this.enabled = false
    };
    Tooltip.prototype.toggleEnabled = function () {
        this.enabled = !this.enabled
    };
    Tooltip.prototype.toggle = function (e) {
        var self = e ? $(e.currentTarget)[this.type](this.getDelegateOptions()).data("bs." + this.type) : this;
        self.tip().hasClass("in") ? self.leave(self) : self.enter(self)
    };
    Tooltip.prototype.destroy = function () {
        this.hide().$element.off("." + this.type).removeData("bs." + this.type)
    };
    var old = $.fn.tooltip;
    $.fn.tooltip = function (option) {
        return this.each(function () {
            var $this = $(this);
            var data = $this.data("bs.tooltip");
            var options = typeof option == "object" && option;
            if (!data) $this.data("bs.tooltip", data = new Tooltip(this, options));
            if (typeof option == "string") data[option]()
        })
    };
    $.fn.tooltip.Constructor = Tooltip;
    $.fn.tooltip.noConflict = function () {
        $.fn.tooltip = old;
        return this
    }
}(window.jQuery); + function ($) {
    "use strict";
    var Popover = function (element, options) {
        this.init("popover", element, options)
    };
    if (!$.fn.tooltip) throw new Error("Popover requires tooltip.js");
    Popover.DEFAULTS = $.extend({}, $.fn.tooltip.Constructor.DEFAULTS, {
        placement: "right",
        trigger: "click",
        content: "",
        template: '<div class="popover"><div class="arrow"></div><h3 class="popover-title"></h3><div class="popover-content"></div></div>'
    });
    Popover.prototype = $.extend({}, $.fn.tooltip.Constructor.prototype);
    Popover.prototype.constructor = Popover;
    Popover.prototype.getDefaults = function () {
        return Popover.DEFAULTS
    };
    Popover.prototype.setContent = function () {
        var $tip = this.tip();
        var title = this.getTitle();
        var content = this.getContent();
        $tip.find(".popover-title")[this.options.html ? "html" : "text"](title);
        $tip.find(".popover-content")[this.options.html ? "html" : "text"](content);
        $tip.removeClass("fade top bottom left right in");
        if (!$tip.find(".popover-title").html()) $tip.find(".popover-title").hide()
    };
    Popover.prototype.hasContent = function () {
        return this.getTitle() || this.getContent()
    };
    Popover.prototype.getContent = function () {
        var $e = this.$element;
        var o = this.options;
        return $e.attr("data-content") || (typeof o.content == "function" ? o.content.call($e[0]) : o.content)
    };
    Popover.prototype.arrow = function () {
        return this.$arrow = this.$arrow || this.tip().find(".arrow")
    };
    Popover.prototype.tip = function () {
        if (!this.$tip) this.$tip = $(this.options.template);
        return this.$tip
    };
    var old = $.fn.popover;
    $.fn.popover = function (option) {
        return this.each(function () {
            var $this = $(this);
            var data = $this.data("bs.popover");
            var options = typeof option == "object" && option;
            if (!data) $this.data("bs.popover", data = new Popover(this, options));
            if (typeof option == "string") data[option]()
        })
    };
    $.fn.popover.Constructor = Popover;
    $.fn.popover.noConflict = function () {
        $.fn.popover = old;
        return this
    }
}(window.jQuery); + function ($) {
    "use strict";

        
    function ScrollSpy(element, options) {
        var href;
        var process = $.proxy(this.process, this);
        this.$element = $(element).is("body") ? $(window) : $(element);
        this.$body = $("body");
        this.$scrollElement = this.$element.on("scroll.bs.scroll-spy.data-api", process);
        this.options = $.extend({}, ScrollSpy.DEFAULTS, options);
        this.selector = (this.options.target || (href = $(element).attr("href")) && href.replace(/.*(?=#[^\s]+$)/, "") || "") + " .nav li > a";
        this.offsets = $([]);
        this.targets = $([]);
        this.activeTarget = null;
        this.refresh();
        this.process()
    }
    ScrollSpy.DEFAULTS = {
        offset: 10
    };
    ScrollSpy.prototype.refresh = function () {
        var offsetMethod = this.$element[0] == window ? "offset" : "position";
        this.offsets = $([]);
        this.targets = $([]);
        var self = this;
        var $targets = this.$body.find(this.selector).map(function () {
            var $el = $(this);
            var href = $el.data("target") || $el.attr("href");
            var $href = /^#\w/.test(href) && $(href);
            return $href && $href.length && [
                [$href[offsetMethod]().top + (!$.isWindow(self.$scrollElement.get(0)) && self.$scrollElement.scrollTop()), href]
            ] || null
        }).sort(function (a, b) {
            return a[0] - b[0]
        }).each(function () {
            self.offsets.push(this[0]);
            self.targets.push(this[1])
        })
    };
    ScrollSpy.prototype.process = function () {
        var scrollTop = this.$scrollElement.scrollTop() + this.options.offset;
        var scrollHeight = this.$scrollElement[0].scrollHeight || this.$body[0].scrollHeight;
        var maxScroll = scrollHeight - this.$scrollElement.height();
        var offsets = this.offsets;
        var targets = this.targets;
        var activeTarget = this.activeTarget;
        var i;
        if (scrollTop >= maxScroll) {
            return activeTarget != (i = targets.last()[0]) && this.activate(i)
        }
        for (i = offsets.length; i--;) {
            activeTarget != targets[i] && scrollTop >= offsets[i] && (!offsets[i + 1] || scrollTop <= offsets[i + 1]) && this.activate(targets[i])
        }
    };
    ScrollSpy.prototype.activate = function (target) {
        this.activeTarget = target;
        $(this.selector).parents(".active").removeClass("active");
        var selector = this.selector + '[data-target="' + target + '"],' + this.selector + '[href="' + target + '"]';
        var active = $(selector).parents("li").addClass("active");
        if (active.parent(".dropdown-menu").length) {
            active = active.closest("li.dropdown").addClass("active")
        }
        active.trigger("activate")
    };
    var old = $.fn.scrollspy;
    $.fn.scrollspy = function (option) {
        return this.each(function () {
            var $this = $(this);
            var data = $this.data("bs.scrollspy");
            var options = typeof option == "object" && option;
            if (!data) $this.data("bs.scrollspy", data = new ScrollSpy(this, options));
            if (typeof option == "string") data[option]()
        })
    };
    $.fn.scrollspy.Constructor = ScrollSpy;
    $.fn.scrollspy.noConflict = function () {
        $.fn.scrollspy = old;
        return this
    };
    $(window).on("load", function () {
        $('[data-spy="scroll"]').each(function () {
            var $spy = $(this);
            $spy.scrollspy($spy.data())
        })
    })
}(window.jQuery); + function ($) {
    "use strict";
    var Tab = function (element) {
        this.element = $(element)
    };
    Tab.prototype.show = function () {
        var $this = this.element;
        var $ul = $this.closest("ul:not(.dropdown-menu)");
        var selector = $this.attr("data-target");
        if (!selector) {
            selector = $this.attr("href");
            selector = selector && selector.replace(/.*(?=#[^\s]*$)/, "")
        }
        if ($this.parent("li").hasClass("active")) return;
        var previous = $ul.find(".active:last a")[0];
        var e = $.Event("show.bs.tab", {
            relatedTarget: previous
        });
        $this.trigger(e);
        if (e.isDefaultPrevented()) return;
        var $target = $(selector);
        this.activate($this.parent("li"), $ul);
        this.activate($target, $target.parent(), function () {
            $this.trigger({
                type: "shown.bs.tab",
                relatedTarget: previous
            })
        })
    };
    Tab.prototype.activate = function (element, container, callback) {
        var $active = container.find("> .active");
        var transition = callback && $.support.transition && $active.hasClass("fade");

        function next() {
            $active.removeClass("active").find("> .dropdown-menu > .active").removeClass("active");
            element.addClass("active");
            if (transition) {
                element[0].offsetWidth;
                element.addClass("in")
            } else {
                element.removeClass("fade")
            }
            if (element.parent(".dropdown-menu")) {
                element.closest("li.dropdown").addClass("active")
            }
            callback && callback()
        }
        transition ? $active.one($.support.transition.end, next).emulateTransitionEnd(150) : next();
        $active.removeClass("in")
    };
    var old = $.fn.tab;
    $.fn.tab = function (option) {
        return this.each(function () {
            var $this = $(this);
            var data = $this.data("bs.tab");
            if (!data) $this.data("bs.tab", data = new Tab(this));
            if (typeof option == "string") data[option]()
        })
    };
    $.fn.tab.Constructor = Tab;
    $.fn.tab.noConflict = function () {
        $.fn.tab = old;
        return this
    };
    $(document).on("click.bs.tab.data-api", '[data-toggle="tab"], [data-toggle="pill"]', function (e) {
        e.preventDefault();
        $(this).tab("show")
    })
}(window.jQuery); + function ($) {
    "use strict";
    var Affix = function (element, options) {
        this.options = $.extend({}, Affix.DEFAULTS, options);
        this.$window = $(window).on("scroll.bs.affix.data-api", $.proxy(this.checkPosition, this)).on("click.bs.affix.data-api", $.proxy(this.checkPositionWithEventLoop, this));
        this.$element = $(element);
        this.affixed = this.unpin = null;
        this.checkPosition()
    };
    Affix.RESET = "affix affix-top affix-bottom";
    Affix.DEFAULTS = {
        offset: 0
    };
    Affix.prototype.checkPositionWithEventLoop = function () {
        setTimeout($.proxy(this.checkPosition, this), 1)
    };
    Affix.prototype.checkPosition = function () {
        if (!this.$element.is(":visible")) return;
        var scrollHeight = $(document).height();
        var scrollTop = this.$window.scrollTop();
        var position = this.$element.offset();
        var offset = this.options.offset;
        var offsetTop = offset.top;
        var offsetBottom = offset.bottom;
        if (typeof offset != "object") offsetBottom = offsetTop = offset;
        if (typeof offsetTop == "function") offsetTop = offset.top();
        if (typeof offsetBottom == "function") offsetBottom = offset.bottom();
        var affix = this.unpin != null && scrollTop + this.unpin <= position.top ? false : offsetBottom != null && position.top + this.$element.height() >= scrollHeight - offsetBottom ? "bottom" : offsetTop != null && scrollTop <= offsetTop ? "top" : false;
        if (this.affixed === affix) return;
        if (this.unpin) this.$element.css("top", "");
        this.affixed = affix;
        this.unpin = affix == "bottom" ? position.top - scrollTop : null;
        this.$element.removeClass(Affix.RESET).addClass("affix" + (affix ? "-" + affix : ""));
        if (affix == "bottom") {
            this.$element.offset({
                top: document.body.offsetHeight - offsetBottom - this.$element.height()
            })
        }
    };
    var old = $.fn.affix;
    $.fn.affix = function (option) {
        return this.each(function () {
            var $this = $(this);
            var data = $this.data("bs.affix");
            var options = typeof option == "object" && option;
            if (!data) $this.data("bs.affix", data = new Affix(this, options));
            if (typeof option == "string") data[option]()
        })
    };
    $.fn.affix.Constructor = Affix;
    $.fn.affix.noConflict = function () {
        $.fn.affix = old;
        return this
    };
    $(window).on("load", function () {
        $('[data-spy="affix"]').each(function () {
            var $spy = $(this);
            var data = $spy.data();
            data.offset = data.offset || {};
            if (data.offsetBottom) data.offset.bottom = data.offsetBottom;
            if (data.offsetTop) data.offset.top = data.offsetTop;
            $spy.affix(data)
        })
    })
}(window.jQuery);
(function ($, undefined) {
    var Public = function (url) {
        if (_type === "pathname") {
            if (_last !== url) window.history.pushState({}, null, _last = url)
        } else if (_type === "hash") {
            if (_last !== url) {
                _last = location.hash = url;
                if (_ie67) {
                    if (!$("#jQueryHistory").length) throw new Error("jQuery." + publicName + ".push: iframe not found.");
                    if (_firstTime) {
                        _firstTime = 0;
                        _iframe.contentWindow.document.open().close();
                        _iframe.contentWindow.location.hash = "/"
                    }
                    _iframe.contentWindow.document.open().close();
                    _iframe.contentWindow.location.hash = url
                }
            }
        } else {
            throw new Error("jQuery." + publicName + ".push: listener is not active.")
        }
        Public.context.trigger("push", [url, _type]);
        return Public
    }, publicName = "history";
    Public.context = $({});
    $.each(["on", "off", "trigger"], function (index, method) {
        Public[method] = function () {
            Public.context[method].apply(Public.context, arguments);
            return Public
        }
    });
    Public.push = Public;
    Public.getListenType = function () {
        return _type
    };
    Public.listen = function (type, interval) {
        Public.unlisten();
        var size = arguments.length;
        if (!size || type === "auto") {
            type = _pushState ? "pathname" : "hash";
            size = 1
        } else if (type !== "pathname" && type !== "hash") {
            throw new Error("jQuery." + publicName + ".listen: type is not valid.")
        }
        if (type === "hash") {
            if (!_onhashchange && size === 1 || interval === true) {
                interval = Public.config.interval;
                size = 2
            }
            if (size === 2 && (isNaN(interval) || interval < 1)) throw new Error("jQuery." + publicName + ".listen: interval delay is not valid.")
        }
        if ((_type = type) === "pathname") {
            if (!_pushState) throw new Error("jQuery." + publicName + ".listen: this browser has not support to pushState.");
            $(window).on("popstate.history", function (event) {
                if (event.originalEvent && event.originalEvent.state && _last !== location.pathname) Public.trigger("change", [_last = location.pathname, "pathname"])
            });
            if (location.pathname.length > 1) Public.trigger("load", [location.pathname + location.search + location.hash, "pathname"])
        } else {
            if (_onhashchange && !interval) {
                $(window).on("hashchange.history", function (event) {
                    var hash = location.hash.substr(1);
                    if (_last !== hash) Public.trigger("change", [_last = hash, "hash"])
                })
            } else {
                if (_ie67 === undefined) _ie67 = Public.isIE67();
                if (_ie67) {
                    if (!(size = $("body")).length) throw new Error("jQuery." + publicName + ".listen: document is not ready.");
                    _iframe = $('<iframe id="jQueryHistory" style="display:none" src="javascript:void(0);" />').appendTo(size)[0];
                    var win = _iframe.contentWindow;
                    if (location.hash.length > 1) {
                        win.document.open().close();
                        win.location.hash = location.hash
                    }
                    _interval = setInterval(function () {
                        if ((_last = location.hash) !== win.location.hash) {
                            win.document.open().close();
                            win.location.hash = _last;
                            Public.trigger("change", [_last.substr(1), "hash"])
                        }
                    }, interval)
                } else {
                    _last = location.hash.substr(1);
                    _interval = setInterval(function () {
                        var hash = location.hash.substr(1);
                        if (_last !== hash) Public.trigger("change", [_last = hash, "hash"])
                    }, interval)
                }
            }
            if (location.hash.length > 1) Public.trigger("load", [location.hash.substr(1), "hash"])
        }
        return Public
    };
    Public.unlisten = function () {
        _type = _last = _iframe = null;
        $(window).off("popstate.history hashchange.history");
        $("#jQueryHistory").remove();
        clearInterval(_interval);
        return Public
    };
    Public.getSupports = function (type) {
        var result = {}, size = arguments.length,
            docmode;
        if (!size || type === "pushState") result.pushState = "pushState" in window.history;
        if (!size || type === "onhashchange") result.onhashchange = "onhashchange" in window && ((docmode = document.documentMode) === undefined || docmode > 7);
        if (size) return result[type];
        return result
    };
    Public.isIE67 = function () {
        var name = "_history_msie",
            $msie, result;
        window[name] = false;
        $msie = $('<span><!--[if lte IE 7]><script type="text/javascript">window.' + name + "=true;</script><![endif]--></span>").appendTo("body");
        result = window[name] === true;
        try {
            delete window[name]
        } catch (e) {
            window[name] = undefined
        }
        $msie.remove();
        return result
    };
    Public.supports = Public.getSupports();
    Public.config = {
        interval: 100
    };
    var _pushState = Public.supports.pushState,
        _onhashchange = Public.supports.onhashchange,
        _ie67, _type = null,
        _interval, _iframe, _firstTime = 1,
        _last;
    $[publicName] = Public
})(jQuery);
(function (root, factory) {
    if (typeof exports == "object") module.exports = factory();
    else if (typeof define == "function" && define.amd) define(factory);
    else root.Spinner = factory()
})(this, function () {
    "use strict";
    var prefixes = ["webkit", "Moz", "ms", "O"],
        animations = {}, useCssAnimations;

    function createEl(tag, prop) {
        var el = document.createElement(tag || "div"),
            n;
        for (n in prop) el[n] = prop[n];
        return el
    }
    function ins(parent) {
        for (var i = 1, n = arguments.length; i < n; i++) parent.appendChild(arguments[i]);
        return parent
    }
    var sheet = function () {
        var el = createEl("style", {
            type: "text/css"
        });
        ins(document.getElementsByTagName("head")[0], el);
        return el.sheet || el.styleSheet
    }();

    function addAnimation(alpha, trail, i, lines) {
        var name = ["opacity", trail, ~~ (alpha * 100), i, lines].join("-"),
            start = .01 + i / lines * 100,
            z = Math.max(1 - (1 - alpha) / trail * (100 - start), alpha),
            prefix = useCssAnimations.substring(0, useCssAnimations.indexOf("Animation")).toLowerCase(),
            pre = prefix && "-" + prefix + "-" || "";
        if (!animations[name]) {
            sheet.insertRule("@" + pre + "keyframes " + name + "{" + "0%{opacity:" + z + "}" + start + "%{opacity:" + alpha + "}" + (start + .01) + "%{opacity:1}" + (start + trail) % 100 + "%{opacity:" + alpha + "}" + "100%{opacity:" + z + "}" + "}", sheet.cssRules.length);
            animations[name] = 1
        }
        return name
    }
    function vendor(el, prop) {
        var s = el.style,
            pp, i;
        if (s[prop] !== undefined) return prop;
        prop = prop.charAt(0).toUpperCase() + prop.slice(1);
        for (i = 0; i < prefixes.length; i++) {
            pp = prefixes[i] + prop;
            if (s[pp] !== undefined) return pp
        }
    }
    function css(el, prop) {
        for (var n in prop) el.style[vendor(el, n) || n] = prop[n];
        return el
    }
    function merge(obj) {
        for (var i = 1; i < arguments.length; i++) {
            var def = arguments[i];
            for (var n in def) if (obj[n] === undefined) obj[n] = def[n]
        }
        return obj
    }
    function pos(el) {
        var o = {
            x: el.offsetLeft,
            y: el.offsetTop
        };
        while (el = el.offsetParent) o.x += el.offsetLeft, o.y += el.offsetTop;
        return o
    }
    var defaults = {
        lines: 12,
        length: 7,
        width: 5,
        radius: 10,
        rotate: 0,
        corners: 1,
        color: "#000",
        direction: 1,
        speed: 1,
        trail: 100,
        opacity: 1 / 4,
        fps: 20,
        zIndex: 2e9,
        className: "spinner",
        top: "auto",
        left: "auto",
        position: "relative"
    };

    function Spinner(o) {
        if (typeof this == "undefined") return new Spinner(o);
        this.opts = merge(o || {}, Spinner.defaults, defaults)
    }
    Spinner.defaults = {};
    merge(Spinner.prototype, {
        spin: function (target) {
            this.stop();
            var self = this,
                o = self.opts,
                el = self.el = css(createEl(0, {
                    className: o.className
                }), {
                    position: o.position,
                    width: 0,
                    zIndex: o.zIndex
                }),
                mid = o.radius + o.length + o.width,
                ep, tp;
            if (target) {
                target.insertBefore(el, target.firstChild || null);
                tp = pos(target);
                ep = pos(el);
                css(el, {
                    left: (o.left == "auto" ? tp.x - ep.x + (target.offsetWidth >> 1) : parseInt(o.left, 10) + mid) + "px",
                    top: (o.top == "auto" ? tp.y - ep.y + (target.offsetHeight >> 1) : parseInt(o.top, 10) + mid) + "px"
                })
            }
            el.setAttribute("role", "progressbar");
            self.lines(el, self.opts);
            if (!useCssAnimations) {
                var i = 0,
                    start = (o.lines - 1) * (1 - o.direction) / 2,
                    alpha, fps = o.fps,
                    f = fps / o.speed,
                    ostep = (1 - o.opacity) / (f * o.trail / 100),
                    astep = f / o.lines;
                (function anim() {
                    i++;
                    for (var j = 0; j < o.lines; j++) {
                        alpha = Math.max(1 - (i + (o.lines - j) * astep) % f * ostep, o.opacity);
                        self.opacity(el, j * o.direction + start, alpha, o)
                    }
                    self.timeout = self.el && setTimeout(anim, ~~ (1e3 / fps))
                })()
            }
            return self
        },
        stop: function () {
            var el = this.el;
            if (el) {
                clearTimeout(this.timeout);
                if (el.parentNode) el.parentNode.removeChild(el);
                this.el = undefined
            }
            return this
        },
        lines: function (el, o) {
            var i = 0,
                start = (o.lines - 1) * (1 - o.direction) / 2,
                seg;

            function fill(color, shadow) {
                return css(createEl(), {
                    position: "absolute",
                    width: o.length + o.width + "px",
                    height: o.width + "px",
                    background: color,
                    boxShadow: shadow,
                    transformOrigin: "left",
                    transform: "rotate(" + ~~ (360 / o.lines * i + o.rotate) + "deg) translate(" + o.radius + "px" + ",0)",
                    borderRadius: (o.corners * o.width >> 1) + "px"
                })
            }
            for (; i < o.lines; i++) {
                seg = css(createEl(), {
                    position: "absolute",
                    top: 1 + ~ (o.width / 2) + "px",
                    transform: o.hwaccel ? "translate3d(0,0,0)" : "",
                    opacity: o.opacity,
                    animation: useCssAnimations && addAnimation(o.opacity, o.trail, start + i * o.direction, o.lines) + " " + 1 / o.speed + "s linear infinite"
                });
                if (o.shadow) ins(seg, css(fill("#000", "0 0 4px " + "#000"), {
                    top: 2 + "px"
                }));
                ins(el, ins(seg, fill(o.color, "0 0 1px rgba(0,0,0,.1)")))
            }
            return el
        },
        opacity: function (el, i, val) {
            if (i < el.childNodes.length) el.childNodes[i].style.opacity = val
        }
    });

    function initVML() {
        function vml(tag, attr) {
            return createEl("<" + tag + ' xmlns="urn:schemas-microsoft.com:vml" class="spin-vml">', attr)
        }
        sheet.addRule(".spin-vml", "behavior:url(#default#VML)");
        Spinner.prototype.lines = function (el, o) {
            var r = o.length + o.width,
                s = 2 * r;

            function grp() {
                return css(vml("group", {
                    coordsize: s + " " + s,
                    coordorigin: -r + " " + -r
                }), {
                    width: s,
                    height: s
                })
            }
            var margin = -(o.width + o.length) * 2 + "px",
                g = css(grp(), {
                    position: "absolute",
                    top: margin,
                    left: margin
                }),
                i;

            function seg(i, dx, filter) {
                ins(g, ins(css(grp(), {
                    rotation: 360 / o.lines * i + "deg",
                    left: ~~dx
                }), ins(css(vml("roundrect", {
                    arcsize: o.corners
                }), {
                    width: r,
                    height: o.width,
                    left: o.radius,
                    top: -o.width >> 1,
                    filter: filter
                }), vml("fill", {
                    color: o.color,
                    opacity: o.opacity
                }), vml("stroke", {
                    opacity: 0
                }))))
            }
            if (o.shadow) for (i = 1; i <= o.lines; i++) seg(i, -2, "progid:DXImageTransform.Microsoft.Blur(pixelradius=2,makeshadow=1,shadowopacity=.3)");
            for (i = 1; i <= o.lines; i++) seg(i);
            return ins(el, g)
        };
        Spinner.prototype.opacity = function (el, i, val, o) {
            var c = el.firstChild;
            o = o.shadow && o.lines || 0;
            if (c && i + o < c.childNodes.length) {
                c = c.childNodes[i + o];
                c = c && c.firstChild;
                c = c && c.firstChild;
                if (c) c.opacity = val
            }
        }
    }
    var probe = css(createEl("group"), {
        behavior: "url(#default#VML)"
    });
    if (!vendor(probe, "transform") && probe.adj) initVML();
    else useCssAnimations = vendor(probe, "animation");
    return Spinner
});
(function (factory) {
    if (typeof exports == "object") {
        factory(require("jquery"), require("spin"))
    } else if (typeof define == "function" && define.amd) {
        define(["jquery", "spin"], factory)
    } else {
        if (!window.Spinner) throw new Error("Spin.js not present");
        factory(window.jQuery, window.Spinner)
    }
})(function ($, Spinner) {
    $.fn.spin = function (opts, color) {
        return this.each(function () {
            var $this = $(this),
                data = $this.data();
            if (data.spinner) {
                data.spinner.stop();
                delete data.spinner
            }
            if (opts !== false) {
                opts = $.extend({
                    color: color || $this.css("color")
                }, $.fn.spin.presets[opts] || opts);
                data.spinner = new Spinner(opts).spin(this)
            }
        })
    };
    $.fn.spin.presets = {
        tiny: {
            lines: 8,
            length: 2,
            width: 2,
            radius: 3
        },
        small: {
            lines: 8,
            length: 4,
            width: 3,
            radius: 5
        },
        large: {
            lines: 10,
            length: 8,
            width: 4,
            radius: 8
        }
    }
});
(function ($, window, document, undefined) {
    var $window = $(window);
    $.fn.lazyload = function (options) {
        var elements = this;
        var $container;
        var settings = {
            threshold: 0,
            failure_limit: 0,
            event: "scroll",
            effect: "show",
            container: window,
            data_attribute: "original",
            skip_invisible: true,
            appear: null,
            load: null
        };

        function update() {
            var counter = 0;
            elements.each(function () {
                var $this = $(this);
                if (settings.skip_invisible && !$this.is(":visible")) {
                    return
                }
                if ($.abovethetop(this, settings) || $.leftofbegin(this, settings)) {} else if (!$.belowthefold(this, settings) && !$.rightoffold(this, settings)) {
                    $this.trigger("appear");
                    counter = 0
                } else {
                    if (++counter > settings.failure_limit) {
                        return false
                    }
                }
            })
        }
        if (options) {
            if (undefined !== options.failurelimit) {
                options.failure_limit = options.failurelimit;
                delete options.failurelimit
            }
            if (undefined !== options.effectspeed) {
                options.effect_speed = options.effectspeed;
                delete options.effectspeed
            }
            $.extend(settings, options)
        }
        $container = settings.container === undefined || settings.container === window ? $window : $(settings.container);
        if (0 === settings.event.indexOf("scroll")) {
            $container.bind(settings.event, function (event) {
                return update()
            })
        }
        this.each(function () {
            var self = this;
            var $self = $(self);
            self.loaded = false;
            $self.one("appear", function () {
                if (!this.loaded) {
                    if (settings.appear) {
                        var elements_left = elements.length;
                        settings.appear.call(self, elements_left, settings)
                    }
                    $("<img />").bind("load", function () {
                        $self.hide().attr("src", $self.data(settings.data_attribute))[settings.effect](settings.effect_speed);
                        self.loaded = true;
                        var temp = $.grep(elements, function (element) {
                            return !element.loaded
                        });
                        elements = $(temp);
                        if (settings.load) {
                            var elements_left = elements.length;
                            settings.load.call(self, elements_left, settings)
                        }
                    }).attr("src", $self.data(settings.data_attribute))
                }
            });
            if (0 !== settings.event.indexOf("scroll")) {
                $self.bind(settings.event, function (event) {
                    if (!self.loaded) {
                        $self.trigger("appear")
                    }
                })
            }
        });
        $window.bind("resize", function (event) {
            update()
        });
        if (/iphone|ipod|ipad.*os 5/gi.test(navigator.appVersion)) {
            $window.bind("pageshow", function (event) {
                if (event.originalEvent.persisted) {
                    elements.each(function () {
                        $(this).trigger("appear")
                    })
                }
            })
        }
        $(window).load(function () {
            update()
        });
        return this
    };
    $.belowthefold = function (element, settings) {
        var fold;
        if (settings.container === undefined || settings.container === window) {
            fold = $window.height() + $window.scrollTop()
        } else {
            fold = $(settings.container).offset().top + $(settings.container).height()
        }
        return fold <= $(element).offset().top - settings.threshold
    };
    $.rightoffold = function (element, settings) {
        var fold;
        if (settings.container === undefined || settings.container === window) {
            fold = $window.width() + $window.scrollLeft()
        } else {
            fold = $(settings.container).offset().left + $(settings.container).width()
        }
        return fold <= $(element).offset().left - settings.threshold
    };
    $.abovethetop = function (element, settings) {
        var fold;
        if (settings.container === undefined || settings.container === window) {
            fold = $window.scrollTop()
        } else {
            fold = $(settings.container).offset().top
        }
        return fold >= $(element).offset().top + settings.threshold + $(element).height()
    };
    $.leftofbegin = function (element, settings) {
        var fold;
        if (settings.container === undefined || settings.container === window) {
            fold = $window.scrollLeft()
        } else {
            fold = $(settings.container).offset().left
        }
        return fold >= $(element).offset().left + settings.threshold + $(element).width()
    };
    $.inviewport = function (element, settings) {
        return !$.rightoffold(element, settings) && !$.leftofbegin(element, settings) && !$.belowthefold(element, settings) && !$.abovethetop(element, settings)
    };
    $.extend($.expr[":"], {
        "below-the-fold": function (a) {
            return $.belowthefold(a, {
                threshold: 0
            })
        },
        "above-the-top": function (a) {
            return !$.belowthefold(a, {
                threshold: 0
            })
        },
        "right-of-screen": function (a) {
            return $.rightoffold(a, {
                threshold: 0
            })
        },
        "left-of-screen": function (a) {
            return !$.rightoffold(a, {
                threshold: 0
            })
        },
        "in-viewport": function (a) {
            return $.inviewport(a, {
                threshold: 0
            })
        },
        "above-the-fold": function (a) {
            return !$.belowthefold(a, {
                threshold: 0
            })
        },
        "right-of-fold": function (a) {
            return $.rightoffold(a, {
                threshold: 0
            })
        },
        "left-of-fold": function (a) {
            return !$.rightoffold(a, {
                threshold: 0
            })
        }
    })
})(jQuery, window, document);
(function ($) {
    var CLOSE_EVENT = "Close",
        BEFORE_CLOSE_EVENT = "BeforeClose",
        AFTER_CLOSE_EVENT = "AfterClose",
        BEFORE_APPEND_EVENT = "BeforeAppend",
        MARKUP_PARSE_EVENT = "MarkupParse",
        OPEN_EVENT = "Open",
        CHANGE_EVENT = "Change",
        NS = "mfp",
        EVENT_NS = "." + NS,
        READY_CLASS = "mfp-ready",
        REMOVING_CLASS = "mfp-removing",
        PREVENT_CLOSE_CLASS = "mfp-prevent-close";
    var mfp, MagnificPopup = function () {}, _isJQ = !! window.jQuery,
        _prevStatus, _window = $(window),
        _body, _document, _prevContentType, _wrapClasses, _currPopupType;
    var _mfpOn = function (name, f) {
        mfp.ev.on(NS + name + EVENT_NS, f)
    }, _getEl = function (className, appendTo, html, raw) {
        var el = document.createElement("div");
        el.className = "mfp-" + className;
        if (html) {
            el.innerHTML = html
        }
        if (!raw) {
            el = $(el);
            if (appendTo) {
                el.appendTo(appendTo)
            }
        } else if (appendTo) {
            appendTo.appendChild(el)
        }
        return el
    }, _mfpTrigger = function (e, data) {
        mfp.ev.triggerHandler(NS + e, data);
        if (mfp.st.callbacks) {
            e = e.charAt(0).toLowerCase() + e.slice(1);
            if (mfp.st.callbacks[e]) {
                mfp.st.callbacks[e].apply(mfp, $.isArray(data) ? data : [data])
            }
        }
    }, _getCloseBtn = function (type) {
        if (type !== _currPopupType || !mfp.currTemplate.closeBtn) {
            mfp.currTemplate.closeBtn = $(mfp.st.closeMarkup.replace("%title%", mfp.st.tClose));
            _currPopupType = type
        }
        return mfp.currTemplate.closeBtn
    }, _checkInstance = function () {
        if (!$.magnificPopup.instance) {
            mfp = new MagnificPopup;
            mfp.init();
            $.magnificPopup.instance = mfp
        }
    }, supportsTransitions = function () {
        var s = document.createElement("p").style,
            v = ["ms", "O", "Moz", "Webkit"];
        if (s["transition"] !== undefined) {
            return true
        }
        while (v.length) {
            if (v.pop() + "Transition" in s) {
                return true
            }
        }
        return false
    };
    MagnificPopup.prototype = {
        constructor: MagnificPopup,
        init: function () {
            var appVersion = navigator.appVersion;
            mfp.isIE7 = appVersion.indexOf("MSIE 7.") !== -1;
            mfp.isIE8 = appVersion.indexOf("MSIE 8.") !== -1;
            mfp.isLowIE = mfp.isIE7 || mfp.isIE8;
            mfp.isAndroid = /android/gi.test(appVersion);
            mfp.isIOS = /iphone|ipad|ipod/gi.test(appVersion);
            mfp.supportsTransition = supportsTransitions();
            mfp.probablyMobile = mfp.isAndroid || mfp.isIOS || /(Opera Mini)|Kindle|webOS|BlackBerry|(Opera Mobi)|(Windows Phone)|IEMobile/i.test(navigator.userAgent);
            _body = $(document.body);
            _document = $(document);
            mfp.popupsCache = {}
        },
        open: function (data) {
            var i;
            if (data.isObj === false) {
                mfp.items = data.items.toArray();
                mfp.index = 0;
                var items = data.items,
                    item;
                for (i = 0; i < items.length; i++) {
                    item = items[i];
                    if (item.parsed) {
                        item = item.el[0]
                    }
                    if (item === data.el[0]) {
                        mfp.index = i;
                        break
                    }
                }
            } else {
                mfp.items = $.isArray(data.items) ? data.items : [data.items];
                mfp.index = data.index || 0
            }
            if (mfp.isOpen) {
                mfp.updateItemHTML();
                return
            }
            mfp.types = [];
            _wrapClasses = "";
            if (data.mainEl && data.mainEl.length) {
                mfp.ev = data.mainEl.eq(0)
            } else {
                mfp.ev = _document
            }
            if (data.key) {
                if (!mfp.popupsCache[data.key]) {
                    mfp.popupsCache[data.key] = {}
                }
                mfp.currTemplate = mfp.popupsCache[data.key]
            } else {
                mfp.currTemplate = {}
            }
            mfp.st = $.extend(true, {}, $.magnificPopup.defaults, data);
            mfp.fixedContentPos = mfp.st.fixedContentPos === "auto" ? !mfp.probablyMobile : mfp.st.fixedContentPos;
            if (mfp.st.modal) {
                mfp.st.closeOnContentClick = false;
                mfp.st.closeOnBgClick = false;
                mfp.st.showCloseBtn = false;
                mfp.st.enableEscapeKey = false
            }
            if (!mfp.bgOverlay) {
                mfp.bgOverlay = _getEl("bg").on("click" + EVENT_NS, function () {
                    mfp.close()
                });
                mfp.wrap = _getEl("wrap").attr("tabindex", -1).on("click" + EVENT_NS, function (e) {
                    if (mfp._checkIfClose(e.target)) {
                        mfp.close()
                    }
                });
                mfp.container = _getEl("container", mfp.wrap)
            }
            mfp.contentContainer = _getEl("content");
            if (mfp.st.preloader) {
                mfp.preloader = _getEl("preloader", mfp.container, mfp.st.tLoading)
            }
            var modules = $.magnificPopup.modules;
            for (i = 0; i < modules.length; i++) {
                var n = modules[i];
                n = n.charAt(0).toUpperCase() + n.slice(1);
                mfp["init" + n].call(mfp)
            }
            _mfpTrigger("BeforeOpen");
            if (mfp.st.showCloseBtn) {
                if (!mfp.st.closeBtnInside) {
                    mfp.wrap.append(_getCloseBtn())
                } else {
                    _mfpOn(MARKUP_PARSE_EVENT, function (e, template, values, item) {
                        values.close_replaceWith = _getCloseBtn(item.type)
                    });
                    _wrapClasses += " mfp-close-btn-in"
                }
            }
            if (mfp.st.alignTop) {
                _wrapClasses += " mfp-align-top"
            }
            if (mfp.fixedContentPos) {
                mfp.wrap.css({
                    overflow: mfp.st.overflowY,
                    overflowX: "hidden",
                    overflowY: mfp.st.overflowY
                })
            } else {
                mfp.wrap.css({
                    top: _window.scrollTop(),
                    position: "absolute"
                })
            }
            if (mfp.st.fixedBgPos === false || mfp.st.fixedBgPos === "auto" && !mfp.fixedContentPos) {
                mfp.bgOverlay.css({
                    height: _document.height(),
                    position: "absolute"
                })
            }
            if (mfp.st.enableEscapeKey) {
                _document.on("keyup" + EVENT_NS, function (e) {
                    if (e.keyCode === 27) {
                        mfp.close()
                    }
                })
            }
            _window.on("resize" + EVENT_NS, function () {
                mfp.updateSize()
            });
            if (!mfp.st.closeOnContentClick) {
                _wrapClasses += " mfp-auto-cursor"
            }
            if (_wrapClasses) mfp.wrap.addClass(_wrapClasses);
            var windowHeight = mfp.wH = _window.height();
            var windowStyles = {};
            if (mfp.fixedContentPos) {
                if (mfp._hasScrollBar(windowHeight)) {
                    var s = mfp._getScrollbarSize();
                    if (s) {
                        windowStyles.marginRight = s
                    }
                }
            }
            if (mfp.fixedContentPos) {
                if (!mfp.isIE7) {
                    windowStyles.overflow = "hidden"
                } else {
                    $("body, html").css("overflow", "hidden")
                }
            }
            var classesToadd = mfp.st.mainClass;
            if (mfp.isIE7) {
                classesToadd += " mfp-ie7"
            }
            if (classesToadd) {
                mfp._addClassToMFP(classesToadd)
            }
            mfp.updateItemHTML();
            _mfpTrigger("BuildControls");
            $("html").css(windowStyles);
            mfp.bgOverlay.add(mfp.wrap).prependTo(document.body);
            mfp._lastFocusedEl = document.activeElement;
            setTimeout(function () {
                if (mfp.content) {
                    mfp._addClassToMFP(READY_CLASS);
                    mfp._setFocus()
                } else {
                    mfp.bgOverlay.addClass(READY_CLASS)
                }
                _document.on("focusin" + EVENT_NS, mfp._onFocusIn)
            }, 16);
            mfp.isOpen = true;
            mfp.updateSize(windowHeight);
            _mfpTrigger(OPEN_EVENT);
            return data
        },
        close: function () {
            if (!mfp.isOpen) return;
            _mfpTrigger(BEFORE_CLOSE_EVENT);
            mfp.isOpen = false;
            if (mfp.st.removalDelay && !mfp.isLowIE && mfp.supportsTransition) {
                mfp._addClassToMFP(REMOVING_CLASS);
                setTimeout(function () {
                    mfp._close()
                }, mfp.st.removalDelay)
            } else {
                mfp._close()
            }
        },
        _close: function () {
            _mfpTrigger(CLOSE_EVENT);
            var classesToRemove = REMOVING_CLASS + " " + READY_CLASS + " ";
            mfp.bgOverlay.detach();
            mfp.wrap.detach();
            mfp.container.empty();
            if (mfp.st.mainClass) {
                classesToRemove += mfp.st.mainClass + " "
            }
            mfp._removeClassFromMFP(classesToRemove);
            if (mfp.fixedContentPos) {
                var windowStyles = {
                    marginRight: ""
                };
                if (mfp.isIE7) {
                    $("body, html").css("overflow", "")
                } else {
                    windowStyles.overflow = ""
                }
                $("html").css(windowStyles)
            }
            _document.off("keyup" + EVENT_NS + " focusin" + EVENT_NS);
            mfp.ev.off(EVENT_NS);
            mfp.wrap.attr("class", "mfp-wrap").removeAttr("style");
            mfp.bgOverlay.attr("class", "mfp-bg");
            mfp.container.attr("class", "mfp-container");
            if (mfp.st.showCloseBtn && (!mfp.st.closeBtnInside || mfp.currTemplate[mfp.currItem.type] === true)) {
                if (mfp.currTemplate.closeBtn) mfp.currTemplate.closeBtn.detach()
            }
            if (mfp._lastFocusedEl) {
                $(mfp._lastFocusedEl).focus()
            }
            mfp.currItem = null;
            mfp.content = null;
            mfp.currTemplate = null;
            mfp.prevHeight = 0;
            _mfpTrigger(AFTER_CLOSE_EVENT)
        },
        updateSize: function (winHeight) {
            if (mfp.isIOS) {
                var zoomLevel = document.documentElement.clientWidth / window.innerWidth;
                var height = window.innerHeight * zoomLevel;
                mfp.wrap.css("height", height);
                mfp.wH = height
            } else {
                mfp.wH = winHeight || _window.height()
            }
            if (!mfp.fixedContentPos) {
                mfp.wrap.css("height", mfp.wH)
            }
            _mfpTrigger("Resize")
        },
        updateItemHTML: function () {
            var item = mfp.items[mfp.index];
            mfp.contentContainer.detach();
            if (mfp.content) mfp.content.detach();
            if (!item.parsed) {
                item = mfp.parseEl(mfp.index)
            }
            var type = item.type;
            _mfpTrigger("BeforeChange", [mfp.currItem ? mfp.currItem.type : "", type]);
            mfp.currItem = item;
            if (!mfp.currTemplate[type]) {
                var markup = mfp.st[type] ? mfp.st[type].markup : false;
                _mfpTrigger("FirstMarkupParse", markup);
                if (markup) {
                    mfp.currTemplate[type] = $(markup)
                } else {
                    mfp.currTemplate[type] = true
                }
            }
            if (_prevContentType && _prevContentType !== item.type) {
                mfp.container.removeClass("mfp-" + _prevContentType + "-holder")
            }
            var newContent = mfp["get" + type.charAt(0).toUpperCase() + type.slice(1)](item, mfp.currTemplate[type]);
            mfp.appendContent(newContent, type);
            item.preloaded = true;
            _mfpTrigger(CHANGE_EVENT, item);
            _prevContentType = item.type;
            mfp.container.prepend(mfp.contentContainer);
            _mfpTrigger("AfterChange")
        },
        appendContent: function (newContent, type) {
            mfp.content = newContent;
            if (newContent) {
                if (mfp.st.showCloseBtn && mfp.st.closeBtnInside && mfp.currTemplate[type] === true) {
                    if (!mfp.content.find(".mfp-close").length) {
                        mfp.content.append(_getCloseBtn())
                    }
                } else {
                    mfp.content = newContent
                }
            } else {
                mfp.content = ""
            }
            _mfpTrigger(BEFORE_APPEND_EVENT);
            mfp.container.addClass("mfp-" + type + "-holder");
            mfp.contentContainer.append(mfp.content)
        },
        parseEl: function (index) {
            var item = mfp.items[index],
                type = item.type;
            if (item.tagName) {
                item = {
                    el: $(item)
                }
            } else {
                item = {
                    data: item,
                    src: item.src
                }
            }
            if (item.el) {
                var types = mfp.types;
                for (var i = 0; i < types.length; i++) {
                    if (item.el.hasClass("mfp-" + types[i])) {
                        type = types[i];
                        break
                    }
                }
                item.src = item.el.attr("data-mfp-src");
                if (!item.src) {
                    item.src = item.el.attr("href")
                }
            }
            item.type = type || mfp.st.type || "inline";
            item.index = index;
            item.parsed = true;
            mfp.items[index] = item;
            _mfpTrigger("ElementParse", item);
            return mfp.items[index]
        },
        addGroup: function (el, options) {
            var eHandler = function (e) {
                e.mfpEl = this;
                mfp._openClick(e, el, options)
            };
            if (!options) {
                options = {}
            }
            var eName = "click.magnificPopup";
            options.mainEl = el;
            if (options.items) {
                options.isObj = true;
                el.off(eName).on(eName, eHandler)
            } else {
                options.isObj = false;
                if (options.delegate) {
                    el.off(eName).on(eName, options.delegate, eHandler)
                } else {
                    options.items = el;
                    el.off(eName).on(eName, eHandler)
                }
            }
        },
        _openClick: function (e, el, options) {
            var midClick = options.midClick !== undefined ? options.midClick : $.magnificPopup.defaults.midClick;
            if (!midClick && (e.which === 2 || e.ctrlKey || e.metaKey)) {
                return
            }
            var disableOn = options.disableOn !== undefined ? options.disableOn : $.magnificPopup.defaults.disableOn;
            if (disableOn) {
                if ($.isFunction(disableOn)) {
                    if (!disableOn.call(mfp)) {
                        return true
                    }
                } else {
                    if (_window.width() < disableOn) {
                        return true
                    }
                }
            }
            if (e.type) {
                e.preventDefault();
                if (mfp.isOpen) {
                    e.stopPropagation()
                }
            }
            options.el = $(e.mfpEl);
            if (options.delegate) {
                options.items = el.find(options.delegate)
            }
            mfp.open(options)
        },
        updateStatus: function (status, text) {
            if (mfp.preloader) {
                if (_prevStatus !== status) {
                    mfp.container.removeClass("mfp-s-" + _prevStatus)
                }
                if (!text && status === "loading") {
                    text = mfp.st.tLoading
                }
                var data = {
                    status: status,
                    text: text
                };
                _mfpTrigger("UpdateStatus", data);
                status = data.status;
                text = data.text;
                mfp.preloader.html(text);
                mfp.preloader.find("a").on("click", function (e) {
                    e.stopImmediatePropagation()
                });
                mfp.container.addClass("mfp-s-" + status);
                _prevStatus = status
            }
        },
        _checkIfClose: function (target) {
            if ($(target).hasClass(PREVENT_CLOSE_CLASS)) {
                return
            }
            var closeOnContent = mfp.st.closeOnContentClick;
            var closeOnBg = mfp.st.closeOnBgClick;
            if (closeOnContent && closeOnBg) {
                return true
            } else {
                if (!mfp.content || $(target).hasClass("mfp-close") || mfp.preloader && target === mfp.preloader[0]) {
                    return true
                }
                if (target !== mfp.content[0] && !$.contains(mfp.content[0], target)) {
                    if (closeOnBg) {
                        if ($.contains(document, target)) {
                            return true
                        }
                    }
                } else if (closeOnContent) {
                    return true
                }
            }
            return false
        },
        _addClassToMFP: function (cName) {
            mfp.bgOverlay.addClass(cName);
            mfp.wrap.addClass(cName)
        },
        _removeClassFromMFP: function (cName) {
            this.bgOverlay.removeClass(cName);
            mfp.wrap.removeClass(cName)
        },
        _hasScrollBar: function (winHeight) {
            return (mfp.isIE7 ? _document.height() : document.body.scrollHeight) > (winHeight || _window.height())
        },
        _setFocus: function () {
            (mfp.st.focus ? mfp.content.find(mfp.st.focus).eq(0) : mfp.wrap).focus()
        },
        _onFocusIn: function (e) {
            if (e.target !== mfp.wrap[0] && !$.contains(mfp.wrap[0], e.target)) {
                mfp._setFocus();
                return false
            }
        },
        _parseMarkup: function (template, values, item) {
            var arr;
            if (item.data) {
                values = $.extend(item.data, values)
            }
            _mfpTrigger(MARKUP_PARSE_EVENT, [template, values, item]);
            $.each(values, function (key, value) {
                if (value === undefined || value === false) {
                    return true
                }
                arr = key.split("_");
                if (arr.length > 1) {
                    var el = template.find(EVENT_NS + "-" + arr[0]);
                    if (el.length > 0) {
                        var attr = arr[1];
                        if (attr === "replaceWith") {
                            if (el[0] !== value[0]) {
                                el.replaceWith(value)
                            }
                        } else if (attr === "img") {
                            if (el.is("img")) {
                                el.attr("src", value)
                            } else {
                                el.replaceWith('<img src="' + value + '" class="' + el.attr("class") + '" />')
                            }
                        } else {
                            el.attr(arr[1], value)
                        }
                    }
                } else {
                    template.find(EVENT_NS + "-" + key).html(value)
                }
            })
        },
        _getScrollbarSize: function () {
            if (mfp.scrollbarSize === undefined) {
                var scrollDiv = document.createElement("div");
                scrollDiv.id = "mfp-sbm";
                scrollDiv.style.cssText = "width: 99px; height: 99px; overflow: scroll; position: absolute; top: -9999px;";
                document.body.appendChild(scrollDiv);
                mfp.scrollbarSize = scrollDiv.offsetWidth - scrollDiv.clientWidth;
                document.body.removeChild(scrollDiv)
            }
            return mfp.scrollbarSize
        }
    };
    $.magnificPopup = {
        instance: null,
        proto: MagnificPopup.prototype,
        modules: [],
        open: function (options, index) {
            _checkInstance();
            if (!options) {
                options = {}
            } else {
                options = $.extend(true, {}, options)
            }
            options.isObj = true;
            options.index = index || 0;
            return this.instance.open(options)
        },
        close: function () {
            return $.magnificPopup.instance && $.magnificPopup.instance.close()
        },
        registerModule: function (name, module) {
            if (module.options) {
                $.magnificPopup.defaults[name] = module.options
            }
            $.extend(this.proto, module.proto);
            this.modules.push(name)
        },
        defaults: {
            disableOn: 0,
            key: null,
            midClick: false,
            mainClass: "",
            preloader: true,
            focus: "",
            closeOnContentClick: false,
            closeOnBgClick: true,
            closeBtnInside: true,
            showCloseBtn: true,
            enableEscapeKey: true,
            modal: false,
            alignTop: false,
            removalDelay: 0,
            fixedContentPos: "auto",
            fixedBgPos: "auto",
            overflowY: "auto",
            closeMarkup: '<button title="%title%" type="button" class="mfp-close">&times;</button>',
            tClose: "Close (Esc)",
            tLoading: "Loading..."
        }
    };
    $.fn.magnificPopup = function (options) {
        _checkInstance();
        var jqEl = $(this);
        if (typeof options === "string") {
            if (options === "open") {
                var items, itemOpts = _isJQ ? jqEl.data("magnificPopup") : jqEl[0].magnificPopup,
                    index = parseInt(arguments[1], 10) || 0;
                if (itemOpts.items) {
                    items = itemOpts.items[index]
                } else {
                    items = jqEl;
                    if (itemOpts.delegate) {
                        items = items.find(itemOpts.delegate)
                    }
                    items = items.eq(index)
                }
                mfp._openClick({
                    mfpEl: items
                }, jqEl, itemOpts)
            } else {
                if (mfp.isOpen) mfp[options].apply(mfp, Array.prototype.slice.call(arguments, 1))
            }
        } else {
            options = $.extend(true, {}, options);
            if (_isJQ) {
                jqEl.data("magnificPopup", options)
            } else {
                jqEl[0].magnificPopup = options
            }
            mfp.addGroup(jqEl, options)
        }
        return jqEl
    };
    var INLINE_NS = "inline",
        _hiddenClass, _inlinePlaceholder, _lastInlineElement, _putInlineElementsBack = function () {
            if (_lastInlineElement) {
                _inlinePlaceholder.after(_lastInlineElement.addClass(_hiddenClass)).detach();
                _lastInlineElement = null
            }
        };
    $.magnificPopup.registerModule(INLINE_NS, {
        options: {
            hiddenClass: "hide",
            markup: "",
            tNotFound: "Content not found"
        },
        proto: {
            initInline: function () {
                mfp.types.push(INLINE_NS);
                _mfpOn(CLOSE_EVENT + "." + INLINE_NS, function () {
                    _putInlineElementsBack()
                })
            },
            getInline: function (item, template) {
                _putInlineElementsBack();
                if (item.src) {
                    var inlineSt = mfp.st.inline,
                        el = $(item.src);
                    if (el.length) {
                        var parent = el[0].parentNode;
                        if (parent && parent.tagName) {
                            if (!_inlinePlaceholder) {
                                _hiddenClass = inlineSt.hiddenClass;
                                _inlinePlaceholder = _getEl(_hiddenClass);
                                _hiddenClass = "mfp-" + _hiddenClass
                            }
                            _lastInlineElement = el.after(_inlinePlaceholder).detach().removeClass(_hiddenClass)
                        }
                        mfp.updateStatus("ready")
                    } else {
                        mfp.updateStatus("error", inlineSt.tNotFound);
                        el = $("<div>")
                    }
                    item.inlineElement = el;
                    return el
                }
                mfp.updateStatus("ready");
                mfp._parseMarkup(template, {}, item);
                return template
            }
        }
    });
    var AJAX_NS = "ajax",
        _ajaxCur, _removeAjaxCursor = function () {
            if (_ajaxCur) {
                _body.removeClass(_ajaxCur)
            }
        }, _destroyAjaxRequest = function () {
            _removeAjaxCursor();
            if (mfp.req) {
                mfp.req.abort()
            }
        };
    $.magnificPopup.registerModule(AJAX_NS, {
        options: {
            settings: null,
            cursor: "mfp-ajax-cur",
            tError: '<a href="%url%">The content</a> could not be loaded.'
        },
        proto: {
            initAjax: function () {
                mfp.types.push(AJAX_NS);
                _ajaxCur = mfp.st.ajax.cursor;
                _mfpOn(CLOSE_EVENT + "." + AJAX_NS, _destroyAjaxRequest);
                _mfpOn("BeforeChange." + AJAX_NS, _destroyAjaxRequest)
            },
            getAjax: function (item) {
                if (_ajaxCur) _body.addClass(_ajaxCur);
                mfp.updateStatus("loading");
                var opts = $.extend({
                    url: item.src,
                    success: function (data, textStatus, jqXHR) {
                        var temp = {
                            data: data,
                            xhr: jqXHR
                        };
                        _mfpTrigger("ParseAjax", temp);
                        mfp.appendContent($(temp.data), AJAX_NS);
                        item.finished = true;
                        _removeAjaxCursor();
                        mfp._setFocus();
                        setTimeout(function () {
                            mfp.wrap.addClass(READY_CLASS)
                        }, 16);
                        mfp.updateStatus("ready");
                        _mfpTrigger("AjaxContentAdded")
                    },
                    error: function () {
                        _removeAjaxCursor();
                        item.finished = item.loadError = true;
                        mfp.updateStatus("error", mfp.st.ajax.tError.replace("%url%", item.src))
                    }
                }, mfp.st.ajax.settings);
                mfp.req = $.ajax(opts);
                return ""
            }
        }
    });
    var _imgInterval, _getTitle = function (item) {
        if (item.data && item.data.title !== undefined) return item.data.title;
        var src = mfp.st.image.titleSrc;
        if (src) {
            if ($.isFunction(src)) {
                return src.call(mfp, item)
            } else if (item.el) {
                return item.el.attr(src) || ""
            }
        }
        return ""
    };
    $.magnificPopup.registerModule("image", {
        options: {
            markup: '<div class="mfp-figure">' + '<div class="mfp-close"></div>' + "<figure>" + '<div class="mfp-img"></div>' + "<figcaption>" + '<div class="mfp-bottom-bar">' + '<div class="mfp-title"></div>' + '<div class="mfp-counter"></div>' + "</div>" + "</figcaption>" + "</figure>" + "</div>",
            cursor: "mfp-zoom-out-cur",
            titleSrc: "title",
            verticalFit: true,
            tError: '<a href="%url%">The image</a> could not be loaded.'
        },
        proto: {
            initImage: function () {
                var imgSt = mfp.st.image,
                    ns = ".image";
                mfp.types.push("image");
                _mfpOn(OPEN_EVENT + ns, function () {
                    if (mfp.currItem.type === "image" && imgSt.cursor) {
                        _body.addClass(imgSt.cursor)
                    }
                });
                _mfpOn(CLOSE_EVENT + ns, function () {
                    if (imgSt.cursor) {
                        _body.removeClass(imgSt.cursor)
                    }
                    _window.off("resize" + EVENT_NS)
                });
                _mfpOn("Resize" + ns, mfp.resizeImage);
                if (mfp.isLowIE) {
                    _mfpOn("AfterChange", mfp.resizeImage)
                }
            },
            resizeImage: function () {
                var item = mfp.currItem;
                if (!item || !item.img) return;
                if (mfp.st.image.verticalFit) {
                    var decr = 0;
                    if (mfp.isLowIE) {
                        decr = parseInt(item.img.css("padding-top"), 10) + parseInt(item.img.css("padding-bottom"), 10)
                    }
                    item.img.css("max-height", mfp.wH - decr)
                }
            },
            _onImageHasSize: function (item) {
                if (item.img) {
                    item.hasSize = true;
                    if (_imgInterval) {
                        clearInterval(_imgInterval)
                    }
                    item.isCheckingImgSize = false;
                    _mfpTrigger("ImageHasSize", item);
                    if (item.imgHidden) {
                        if (mfp.content) mfp.content.removeClass("mfp-loading");
                        item.imgHidden = false
                    }
                }
            },
            findImageSize: function (item) {
                var counter = 0,
                    img = item.img[0],
                    mfpSetInterval = function (delay) {
                        if (_imgInterval) {
                            clearInterval(_imgInterval)
                        }
                        _imgInterval = setInterval(function () {
                            if (img.naturalWidth > 0) {
                                mfp._onImageHasSize(item);
                                return
                            }
                            if (counter > 200) {
                                clearInterval(_imgInterval)
                            }
                            counter++;
                            if (counter === 3) {
                                mfpSetInterval(10)
                            } else if (counter === 40) {
                                mfpSetInterval(50)
                            } else if (counter === 100) {
                                mfpSetInterval(500)
                            }
                        }, delay)
                    };
                mfpSetInterval(1)
            },
            getImage: function (item, template) {
                var guard = 0,
                    onLoadComplete = function () {
                        if (item) {
                            if (item.img[0].complete) {
                                item.img.off(".mfploader");
                                if (item === mfp.currItem) {
                                    mfp._onImageHasSize(item);
                                    mfp.updateStatus("ready")
                                }
                                item.hasSize = true;
                                item.loaded = true;
                                _mfpTrigger("ImageLoadComplete")
                            } else {
                                guard++;
                                if (guard < 200) {
                                    setTimeout(onLoadComplete, 100)
                                } else {
                                    onLoadError()
                                }
                            }
                        }
                    }, onLoadError = function () {
                        if (item) {
                            item.img.off(".mfploader");
                            if (item === mfp.currItem) {
                                mfp._onImageHasSize(item);
                                mfp.updateStatus("error", imgSt.tError.replace("%url%", item.src))
                            }
                            item.hasSize = true;
                            item.loaded = true;
                            item.loadError = true
                        }
                    }, imgSt = mfp.st.image;
                var el = template.find(".mfp-img");
                if (el.length) {
                    var img = document.createElement("img");
                    img.className = "mfp-img";
                    item.img = $(img).on("load.mfploader", onLoadComplete).on("error.mfploader", onLoadError);
                    img.src = item.src;
                    if (el.is("img")) {
                        item.img = item.img.clone()
                    }
                    if (item.img[0].naturalWidth > 0) {
                        item.hasSize = true
                    }
                }
                mfp._parseMarkup(template, {
                    title: _getTitle(item),
                    img_replaceWith: item.img
                }, item);
                mfp.resizeImage();
                if (item.hasSize) {
                    if (_imgInterval) clearInterval(_imgInterval);
                    if (item.loadError) {
                        template.addClass("mfp-loading");
                        mfp.updateStatus("error", imgSt.tError.replace("%url%", item.src))
                    } else {
                        template.removeClass("mfp-loading");
                        mfp.updateStatus("ready")
                    }
                    return template
                }
                mfp.updateStatus("loading");
                item.loading = true;
                if (!item.hasSize) {
                    item.imgHidden = true;
                    template.addClass("mfp-loading");
                    mfp.findImageSize(item)
                }
                return template
            }
        }
    });
    var hasMozTransform, getHasMozTransform = function () {
        if (hasMozTransform === undefined) {
            hasMozTransform = document.createElement("p").style.MozTransform !== undefined
        }
        return hasMozTransform
    };
    $.magnificPopup.registerModule("zoom", {
        options: {
            enabled: false,
            easing: "ease-in-out",
            duration: 300,
            opener: function (element) {
                return element.is("img") ? element : element.find("img")
            }
        },
        proto: {
            initZoom: function () {
                var zoomSt = mfp.st.zoom,
                    ns = ".zoom",
                    image;
                if (!zoomSt.enabled || !mfp.supportsTransition) {
                    return
                }
                var duration = zoomSt.duration,
                    getElToAnimate = function (image) {
                        var newImg = image.clone().removeAttr("style").removeAttr("class").addClass("mfp-animated-image"),
                            transition = "all " + zoomSt.duration / 1e3 + "s " + zoomSt.easing,
                            cssObj = {
                                position: "fixed",
                                zIndex: 9999,
                                left: 0,
                                top: 0,
                                "-webkit-backface-visibility": "hidden"
                            }, t = "transition";
                        cssObj["-webkit-" + t] = cssObj["-moz-" + t] = cssObj["-o-" + t] = cssObj[t] = transition;
                        newImg.css(cssObj);
                        return newImg
                    }, showMainContent = function () {
                        mfp.content.css("visibility", "visible")
                    }, openTimeout, animatedImg;
                _mfpOn("BuildControls" + ns, function () {
                    if (mfp._allowZoom()) {
                        clearTimeout(openTimeout);
                        mfp.content.css("visibility", "hidden");
                        image = mfp._getItemToZoom();
                        if (!image) {
                            showMainContent();
                            return
                        }
                        animatedImg = getElToAnimate(image);
                        animatedImg.css(mfp._getOffset());
                        mfp.wrap.append(animatedImg);
                        openTimeout = setTimeout(function () {
                            animatedImg.css(mfp._getOffset(true));
                            openTimeout = setTimeout(function () {
                                showMainContent();
                                setTimeout(function () {
                                    animatedImg.remove();
                                    image = animatedImg = null;
                                    _mfpTrigger("ZoomAnimationEnded")
                                }, 16)
                            }, duration)
                        }, 16)
                    }
                });
                _mfpOn(BEFORE_CLOSE_EVENT + ns, function () {
                    if (mfp._allowZoom()) {
                        clearTimeout(openTimeout);
                        mfp.st.removalDelay = duration;
                        if (!image) {
                            image = mfp._getItemToZoom();
                            if (!image) {
                                return
                            }
                            animatedImg = getElToAnimate(image)
                        }
                        animatedImg.css(mfp._getOffset(true));
                        mfp.wrap.append(animatedImg);
                        mfp.content.css("visibility", "hidden");
                        setTimeout(function () {
                            animatedImg.css(mfp._getOffset())
                        }, 16)
                    }
                });
                _mfpOn(CLOSE_EVENT + ns, function () {
                    if (mfp._allowZoom()) {
                        showMainContent();
                        if (animatedImg) {
                            animatedImg.remove()
                        }
                        image = null
                    }
                })
            },
            _allowZoom: function () {
                return mfp.currItem.type === "image"
            },
            _getItemToZoom: function () {
                if (mfp.currItem.hasSize) {
                    return mfp.currItem.img
                } else {
                    return false
                }
            },
            _getOffset: function (isLarge) {
                var el;
                if (isLarge) {
                    el = mfp.currItem.img
                } else {
                    el = mfp.st.zoom.opener(mfp.currItem.el || mfp.currItem)
                }
                var offset = el.offset();
                var paddingTop = parseInt(el.css("padding-top"), 10);
                var paddingBottom = parseInt(el.css("padding-bottom"), 10);
                offset.top -= $(window).scrollTop() - paddingTop;
                var obj = {
                    width: el.width(),
                    height: (_isJQ ? el.innerHeight() : el[0].offsetHeight) - paddingBottom - paddingTop
                };
                if (getHasMozTransform()) {
                    obj["-moz-transform"] = obj["transform"] = "translate(" + offset.left + "px," + offset.top + "px)"
                } else {
                    obj.left = offset.left;
                    obj.top = offset.top
                }
                return obj
            }
        }
    });
    var IFRAME_NS = "iframe",
        _emptyPage = "//about:blank",
        _fixIframeBugs = function (isShowing) {
            if (mfp.currTemplate[IFRAME_NS]) {
                var el = mfp.currTemplate[IFRAME_NS].find("iframe");
                if (el.length) {
                    if (!isShowing) {
                        el[0].src = _emptyPage
                    }
                    if (mfp.isIE8) {
                        el.css("display", isShowing ? "block" : "none")
                    }
                }
            }
        };
    $.magnificPopup.registerModule(IFRAME_NS, {
        options: {
            markup: '<div class="mfp-iframe-scaler">' + '<div class="mfp-close"></div>' + '<iframe class="mfp-iframe" src="//about:blank" frameborder="0" allowfullscreen></iframe>' + "</div>",
            srcAction: "iframe_src",
            patterns: {
                youtube: {
                    index: "youtube.com",
                    id: "v=",
                    src: "//www.youtube.com/embed/%id%?autoplay=1"
                },
                vimeo: {
                    index: "vimeo.com/",
                    id: "/",
                    src: "//player.vimeo.com/video/%id%?autoplay=1"
                },
                gmaps: {
                    index: "//maps.google.",
                    src: "%id%&output=embed"
                }
            }
        },
        proto: {
            initIframe: function () {
                mfp.types.push(IFRAME_NS);
                _mfpOn("BeforeChange", function (e, prevType, newType) {
                    if (prevType !== newType) {
                        if (prevType === IFRAME_NS) {
                            _fixIframeBugs()
                        } else if (newType === IFRAME_NS) {
                            _fixIframeBugs(true)
                        }
                    }
                });
                _mfpOn(CLOSE_EVENT + "." + IFRAME_NS, function () {
                    _fixIframeBugs()
                })
            },
            getIframe: function (item, template) {
                var embedSrc = item.src;
                var iframeSt = mfp.st.iframe;
                $.each(iframeSt.patterns, function () {
                    if (embedSrc.indexOf(this.index) > -1) {
                        if (this.id) {
                            if (typeof this.id === "string") {
                                embedSrc = embedSrc.substr(embedSrc.lastIndexOf(this.id) + this.id.length, embedSrc.length)
                            } else {
                                embedSrc = this.id.call(this, embedSrc)
                            }
                        }
                        embedSrc = this.src.replace("%id%", embedSrc);
                        return false
                    }
                });
                var dataObj = {};
                if (iframeSt.srcAction) {
                    dataObj[iframeSt.srcAction] = embedSrc
                }
                mfp._parseMarkup(template, dataObj, item);
                mfp.updateStatus("ready");
                return template
            }
        }
    });
    var _getLoopedId = function (index) {
        var numSlides = mfp.items.length;
        if (index > numSlides - 1) {
            return index - numSlides
        } else if (index < 0) {
            return numSlides + index
        }
        return index
    }, _replaceCurrTotal = function (text, curr, total) {
        return text.replace(/%curr%/gi, curr + 1).replace(/%total%/gi, total)
    };
    $.magnificPopup.registerModule("gallery", {
        options: {
            enabled: false,
            arrowMarkup: '<button title="%title%" type="button" class="mfp-arrow mfp-arrow-%dir%"></button>',
            preload: [0, 2],
            navigateByImgClick: true,
            arrows: true,
            tPrev: "Previous (Left arrow key)",
            tNext: "Next (Right arrow key)",
            tCounter: "%curr% of %total%"
        },
        proto: {
            initGallery: function () {
                var gSt = mfp.st.gallery,
                    ns = ".mfp-gallery",
                    supportsFastClick = Boolean($.fn.mfpFastClick);
                mfp.direction = true;
                if (!gSt || !gSt.enabled) return false;
                _wrapClasses += " mfp-gallery";
                _mfpOn(OPEN_EVENT + ns, function () {
                    if (gSt.navigateByImgClick) {
                        mfp.wrap.on("click" + ns, ".mfp-img", function () {
                            if (mfp.items.length > 1) {
                                mfp.next();
                                return false
                            }
                        })
                    }
                    _document.on("keydown" + ns, function (e) {
                        if (e.keyCode === 37) {
                            mfp.prev()
                        } else if (e.keyCode === 39) {
                            mfp.next()
                        }
                    })
                });
                _mfpOn("UpdateStatus" + ns, function (e, data) {
                    if (data.text) {
                        data.text = _replaceCurrTotal(data.text, mfp.currItem.index, mfp.items.length)
                    }
                });
                _mfpOn(MARKUP_PARSE_EVENT + ns, function (e, element, values, item) {
                    var l = mfp.items.length;
                    values.counter = l > 1 ? _replaceCurrTotal(gSt.tCounter, item.index, l) : ""
                });
                _mfpOn("BuildControls" + ns, function () {
                    if (mfp.items.length > 1 && gSt.arrows && !mfp.arrowLeft) {
                        var markup = gSt.arrowMarkup,
                            arrowLeft = mfp.arrowLeft = $(markup.replace(/%title%/gi, gSt.tPrev).replace(/%dir%/gi, "left")).addClass(PREVENT_CLOSE_CLASS),
                            arrowRight = mfp.arrowRight = $(markup.replace(/%title%/gi, gSt.tNext).replace(/%dir%/gi, "right")).addClass(PREVENT_CLOSE_CLASS);
                        var eName = supportsFastClick ? "mfpFastClick" : "click";
                        arrowLeft[eName](function () {
                            mfp.prev()
                        });
                        arrowRight[eName](function () {
                            mfp.next()
                        });
                        if (mfp.isIE7) {
                            _getEl("b", arrowLeft[0], false, true);
                            _getEl("a", arrowLeft[0], false, true);
                            _getEl("b", arrowRight[0], false, true);
                            _getEl("a", arrowRight[0], false, true)
                        }
                        mfp.container.append(arrowLeft.add(arrowRight))
                    }
                });
                _mfpOn(CHANGE_EVENT + ns, function () {
                    if (mfp._preloadTimeout) clearTimeout(mfp._preloadTimeout);
                    mfp._preloadTimeout = setTimeout(function () {
                        mfp.preloadNearbyImages();
                        mfp._preloadTimeout = null
                    }, 16)
                });
                _mfpOn(CLOSE_EVENT + ns, function () {
                    _document.off(ns);
                    mfp.wrap.off("click" + ns);
                    if (mfp.arrowLeft && supportsFastClick) {
                        mfp.arrowLeft.add(mfp.arrowRight).destroyMfpFastClick()
                    }
                    mfp.arrowRight = mfp.arrowLeft = null
                })
            },
            next: function () {
                mfp.direction = true;
                mfp.index = _getLoopedId(mfp.index + 1);
                mfp.updateItemHTML()
            },
            prev: function () {
                mfp.direction = false;
                mfp.index = _getLoopedId(mfp.index - 1);
                mfp.updateItemHTML()
            },
            goTo: function (newIndex) {
                mfp.direction = newIndex >= mfp.index;
                mfp.index = newIndex;
                mfp.updateItemHTML()
            },
            preloadNearbyImages: function () {
                var p = mfp.st.gallery.preload,
                    preloadBefore = Math.min(p[0], mfp.items.length),
                    preloadAfter = Math.min(p[1], mfp.items.length),
                    i;
                for (i = 1; i <= (mfp.direction ? preloadAfter : preloadBefore); i++) {
                    mfp._preloadItem(mfp.index + i)
                }
                for (i = 1; i <= (mfp.direction ? preloadBefore : preloadAfter); i++) {
                    mfp._preloadItem(mfp.index - i)
                }
            },
            _preloadItem: function (index) {
                index = _getLoopedId(index);
                if (mfp.items[index].preloaded) {
                    return
                }
                var item = mfp.items[index];
                if (!item.parsed) {
                    item = mfp.parseEl(index)
                }
                _mfpTrigger("LazyLoad", item);
                if (item.type === "image") {
                    item.img = $('<img class="mfp-img" />').on("load.mfploader", function () {
                        item.hasSize = true
                    }).on("error.mfploader", function () {
                        item.hasSize = true;
                        item.loadError = true;
                        _mfpTrigger("LazyLoadError", item)
                    }).attr("src", item.src)
                }
                item.preloaded = true
            }
        }
    });
    var RETINA_NS = "retina";
    $.magnificPopup.registerModule(RETINA_NS, {
        options: {
            replaceSrc: function (item) {
                return item.src.replace(/\.\w+$/, function (m) {
                    return "@2x" + m
                })
            },
            ratio: 1
        },
        proto: {
            initRetina: function () {
                if (window.devicePixelRatio > 1) {
                    var st = mfp.st.retina,
                        ratio = st.ratio;
                    ratio = !isNaN(ratio) ? ratio : ratio();
                    if (ratio > 1) {
                        _mfpOn("ImageHasSize" + "." + RETINA_NS, function (e, item) {
                            item.img.css({
                                "max-width": item.img[0].naturalWidth / ratio,
                                width: "100%"
                            })
                        });
                        _mfpOn("ElementParse" + "." + RETINA_NS, function (e, item) {
                            item.src = st.replaceSrc(item, ratio)
                        })
                    }
                }
            }
        }
    });
    (function () {
        var ghostClickDelay = 1e3,
            supportsTouch = "ontouchstart" in window,
            unbindTouchMove = function () {
                _window.off("touchmove" + ns + " touchend" + ns)
            }, eName = "mfpFastClick",
            ns = "." + eName;
        $.fn.mfpFastClick = function (callback) {
            return $(this).each(function () {
                var elem = $(this),
                    lock;
                if (supportsTouch) {
                    var timeout, startX, startY, pointerMoved, point, numPointers;
                    elem.on("touchstart" + ns, function (e) {
                        pointerMoved = false;
                        numPointers = 1;
                        point = e.originalEvent ? e.originalEvent.touches[0] : e.touches[0];
                        startX = point.clientX;
                        startY = point.clientY;
                        _window.on("touchmove" + ns, function (e) {
                            point = e.originalEvent ? e.originalEvent.touches : e.touches;
                            numPointers = point.length;
                            point = point[0];
                            if (Math.abs(point.clientX - startX) > 10 || Math.abs(point.clientY - startY) > 10) {
                                pointerMoved = true;
                                unbindTouchMove()
                            }
                        }).on("touchend" + ns, function (e) {
                            unbindTouchMove();
                            if (pointerMoved || numPointers > 1) {
                                return
                            }
                            lock = true;
                            e.preventDefault();
                            clearTimeout(timeout);
                            timeout = setTimeout(function () {
                                lock = false
                            }, ghostClickDelay);
                            callback()
                        })
                    })
                }
                elem.on("click" + ns, function () {
                    if (!lock) {
                        callback()
                    }
                })
            })
        };
        $.fn.destroyMfpFastClick = function () {
            $(this).off("touchstart" + ns + " click" + ns);
            if (supportsTouch) _window.off("touchmove" + ns + " touchend" + ns)
        }
    })();
    _checkInstance()
})(window.jQuery || window.Zepto);
(function ($, window, undefined) {
    "$:nomunge";
    var str_hashchange = "hashchange",
        doc = document,
        fake_onhashchange, special = $.event.special,
        doc_mode = doc.documentMode,
        supports_onhashchange = "on" + str_hashchange in window && (doc_mode === undefined || doc_mode > 7);

    function get_fragment(url) {
        url = url || location.href;
        return "#" + url.replace(/^[^#]*#?(.*)$/, "$1")
    }
    $.fn[str_hashchange] = function (fn) {
        return fn ? this.bind(str_hashchange, fn) : this.trigger(str_hashchange)
    };
    $.fn[str_hashchange].delay = 50;
    special[str_hashchange] = $.extend(special[str_hashchange], {
        setup: function () {
            if (supports_onhashchange) {
                return false
            }
            $(fake_onhashchange.start)
        },
        teardown: function () {
            if (supports_onhashchange) {
                return false
            }
            $(fake_onhashchange.stop)
        }
    });
    fake_onhashchange = function () {
        var self = {}, timeout_id, last_hash = get_fragment(),
            fn_retval = function (val) {
                return val
            }, history_set = fn_retval,
            history_get = fn_retval;
        self.start = function () {
            timeout_id || poll()
        };
        self.stop = function () {
            timeout_id && clearTimeout(timeout_id);
            timeout_id = undefined
        };

        function poll() {
            var hash = get_fragment(),
                history_hash = history_get(last_hash);
            if (hash !== last_hash) {
                history_set(last_hash = hash, history_hash);
                $(window).trigger(str_hashchange)
            } else if (history_hash !== last_hash) {
                location.href = location.href.replace(/#.*/, "") + history_hash
            }
            timeout_id = setTimeout(poll, $.fn[str_hashchange].delay)
        }
        return self
    }()
})(jQuery, this);
$(document).ready(function () {
    $(function () {
        jQuery.history.listen();
        $(".nav .scroll").click(function () {
            $.history.push("index.html" + $(this).attr("href"))
        })
    });
    $(".lazy-container").spin({
        color: "#000"
    });
    $("img.lazy").lazyload({
        threshold: 200,
        effect: "fadeIn",
        effectspeed: 600,
        load: function (elements_left, settings) {
            $(".lazy-container").has(this).addClass("loaded");
            $(".loaded .spinner").remove();
            $('[data-spy="scroll"]').each(function () {
                var $spy = $(this).scrollspy("refresh")
            })
        }
    });
    $(".lightbox").magnificPopup({
        type: "image",
        disableOn: function () {
            if ($(window).width() < 500) {
                return false
            }
            return true
        },
        preloader: true,
        tLoading: "Loading",
        removalDelay: 300,
        mainClass: "mfp-fade",
        callbacks: {
            open: function () {
                $(".navbar").fadeOut("slow")
            },
            close: function () {
                $(".navbar").fadeIn("slow")
            }
        }
    });
    $(" .iframe").magnificPopup({
        type: "iframe",
        mainClass: "mfp-fad",
        disableOn: function () {
            if ($(window).width() < 500) {
                return false
            }
            return true
        },
        preloader: true,
        callbacks: {
            open: function () {
                $(".navbar").fadeOut("slow")
            },
            close: function () {
                $(".navbar").fadeIn("slow")
            }
        }
    });
    $('.scroll[href^="#"]').bind("click.smoothscroll", function (e) {
        e.preventDefault();
        var target = this.hash;
        $target = $(target);
        $("html, body").stop().animate({
            scrollTop: $target.offset().top
        }, 900, "swing", function () {
            window.location.hash = target
        })
    });
    $(".collapse").on("show.bs.collapse", function () {
        $(this).parent().find(".fa-plus").removeClass("fa-plus").addClass("fa-minus");
        $(this).parent().find(".panel-heading").addClass("active")
    }).on("hide.bs.collapse", function () {
        $(this).parent().find(".fa-minus").removeClass("fa-minus").addClass("fa-plus");
        $(this).parent().find(".panel-heading").removeClass("active")
    });
    $(".nav .scroll").click(function (e) {
        if ($(".navbar-toggle").is(":visible")) $("#nav-collapse").removeClass("in").addClass("collapse")
    })
});