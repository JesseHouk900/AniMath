// Javascript library for JQuery
// All developed by miyu

// Anonymous Class Manager  by miyu
function Class(obj, superObj) {
    var objType;
    var constructor;
    var prototype;
    var superPrototype;
    var inheritPrototype;
    var createPrototype = function (obj, constructor) {
        if (typeof constructor !== 'function') constructor = function () {};
        if (Object.create) {
            return Object.create(obj, {
                'constructor': {
                    'value': constructor,
                    'writable': true,
                    'enumerable': false,
                    'configurable': true
                }
            });
        } else {
            obj.constructor = constructor;
            constructor = function () {};
            constructor.prototype = obj;
            return new constructor();
        }
    };

    if ((objType = typeof obj) === 'function') {
        constructor = obj;
        if (!constructor.prototype) {
            constructor.prototype = createPrototype({}, constructor);
        }
    } else {
        switch (false) {
            case objType === 'object':
                prototype = new Object(obj);
                break;
            case typeof obj.constructor === 'function':
                obj.constructor = function () {};
            default:
                prototype = obj;
        }
        constructor = prototype.constructor;
        constructor.prototype = prototype;
    }

    if (superObj !== undefined) {
        inheritPrototype = createPrototype(
            superPrototype = this.Class(superObj).prototype,
            constructor
        );
        for (prop in constructor.prototype) {
            inheritPrototype[prop] = constructor.prototype[prop];
        }
        inheritPrototype._super = superPrototype;
        constructor.prototype = inheritPrototype;
    }
    return constructor;
}

// JQuery Plugins
$.extend($.fn, {

    // centering of the DOM
    'centering': function (container, overflow, rate_top, rate_left) {
        var $container;
        var parent = false;
        switch (container) {
            case 'window':
                $container = $(window);
                break;
            case 'document':
                $container = $(document);
                break;
            case 'parent':
                parent = true;
                break;
            default:
                if (($container = $(container)).length === 0) $container = $(window);
        }
        rate_top = (isFinite(rate_top) ? rate_top : 0.5);
        rate_left = (isFinite(rate_left) ? rate_left : 0.5);
        this.each(function () {
            var $this = $(this);
            if (parent) $container = $this.parent();
            var top = ($container.outerHeight() - $this.outerHeight()) * rate_top;
            var left = ($container.outerWidth() - $this.outerWidth()) * rate_left;
            if (!overflow) {
                if (top < 0) top = 0;
                if (left < 0) left = 0;
            }
            $this.css({
                'position': 'absolute',
                'top': (top + $(document).scrollTop()) + 'px',
                'left': (left + $(document).scrollLeft()) + 'px'
            });
        });
        return this;
    },

    // AJAPP (Asynchronous JSON App) loader
    'ajapp': function (args, $target, mode) {
        if (typeof args === 'string') args = {
            'url': args
        };
        var success = args.success;
        delete args.success;
        args = $.extend({
            'type': 'POST',
            'data': {},
            'cache': false,
            'async': true,
            'dataType': 'json',
            'success': function (r) {
                switch (r.status) {
                    case 'OK':
                        if (typeof $target === 'object' && typeof r.html === 'string') {
                            switch (mode) {
                                case 1:
                                    $target.append(r.html);
                                    break;
                                case -1:
                                    $target.prepend(r.html);
                                    break;
                                default:
                                    $target.empty().html(r.html);
                            }
                        }
                        if (typeof r.code === 'string') {
                            eval('(function(){' + r.code + '})();');
                        }
                        if (typeof success === 'function') success(r);
                        break;
                }
            },
            'error': function (XMLHttpRequest, textStatus, errorThrown) {
                console.log({
                    'XMLHttpRequest': XMLHttpRequest,
                    'textStatus': textStatus,
                    'errorThrown': errorThrown
                });
            }
        }, args);
        // args.data = $.extend({ 'token': $.token }, args.data );
        if (typeof args.url === 'string') $.ajax(args);
        return this;
    }
});

// the class of floating window
$.floatingWindow = Class({
    'constructor': function (title, containment) {
        var that = this;
        this.$window = $('<table class="floatingWindow" style="position:absolute;z-index:1;display:none;"><thead class="ui-draggable-handle"><tr><th style="white-space:nowrap">New Window</th><td><img class="close" src="" alt="x" /></td></tr></thead><tbody><tr><td colspan="2"></td></tr></tbody></table>');
        this.$screen = $('tbody > tr > td', this.$window);
        $('thead > tr > td > img', this.$window).on({
            'click': function () {
                that.close();
            }
        });
        this.$window.on({
            'mousedown': function () {
                that.setZindex();
            }
        });
        this.setTitle(title);
        this.setButtonImg('close');
        switch (containment) {
            case undefined:
            case 'document':
            case 'parent':
                containment = 'document';
                this.$containment = $('body');
                break;
            default:
                this.$containment = $(containment);
        }
        this.$window.draggable({
            'handle': '.ui-draggable-handle',
            'containment': containment
        });
        this.$containment.append(this.$window);
        this.$window.css({
            'top': this.$containment.offset().top,
            'left': this.$containment.offset().left
        });
        return this;
    },
    'open': function (duration, callback) {
        if (this.onopen(duration, callback) === true) return this;
        return this.show(duration, callback);
    },
    'onopen': function () {
        return this;
    },
    'show': function (duration, callback) {
        this.$window.show((isFinite(duration) ? duration : 250), callback);
        this.onshow();
        return this;
    },
    'showDialog': function (duration, callback) {
        var that = this;
        var $mask = $('#modalWindowMask');
        if ($mask.length === 0) {
            $mask = $('<div id="modalWindowMask"></div>')
                .css('z-index', 65535)
                .on({
                    'click': function () {
                        that.close();
                    }
                });
            $('body').append($mask);
            $(window).off('.modalWindowMask').on({
                'scroll.modalWindowMask, resize.modalWindowMask, orientationchange.modalWindowMask': function () {
                    $mask.css({
                        'top': $('html').scrollTop(),
                        'left': $('html').scrollLeft(),
                        'width': $(window).width(),
                        'height': $(window).height()
                    });
                }
            }).trigger('resize');
            this.$window.css('z-index', 65536).show(duration, callback);
        }
        this.onshow();
        return this;
    },
    'onshow': function () {
        return this;
    },
    'isDialog': function () {
        return ($mask = $('#modalWindowMask')).length === 0;
    },
    'hide': function () {
        this.$window.hide();
        return this;
    },
    'close': function () {
        if (this.onclose() === true) return this;
        this.closeMask();
        this.$window.draggable('destroy').remove();
        return this;
    },
    'closeMask': function () {
        $(window).off('.modalWindowMask');
        $('div#modalWindowMask').remove();
        return this;
    },
    'onclose': function () {
        return this;
    },
    'centering': function (rate_top, rate_left) {
        this.$window.centering(this.$containment);
        return this;
    },
    'setTitle': function (title) {
        $('thead tr th', this.$window).html(title);
        return this;
    },
    'imgPath': '/_img/floatingWindow/',
    'setButtonImg': function (type, path, ext) {
        path = path || this.imgPath;
        ext = ext || '.png';
        $('thead > tr > td > img.' + type, this.$window).attr('src', (
            path.substr(path.length - 1) === '/' ?
            path + type + ext :
            path
        ));
        return this;
    },
    'setScreen': function (content) {
        this.$screen.html(content);
        return this;
    },
    'load': function (args, data) {
        if (typeof args !== 'object') args = {
            'url': args
        };
        if (typeof data === 'object') args.data = data;
        var success = args.success;
        var onload = this.onload;
        args.success = function () {
            onload();
            if (typeof success === 'function') success();
        }
        $.ajapp(args, this.$screen);
    },
    'onload': function () {
        return this;
    },
    'getMaxZindex': function () {
        var max = null;
        $('table.floatingWindow').not(this.$window)
            .each(function () {
                var z = $(this).css('z-index');
                if (max === null || max < z) max = z;
            });
        return max || 1;
    },
    'setZindex': function () {
        var z = this.getMaxZindex() + 1;
        if (this.$window.css('z-index') < z) this.$window.css('z-index', z);
        return this;
    }
});