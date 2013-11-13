/*global jQuery, window*/

(function ($) {
    'use strict';

    var $window = $(window),
        defaultOptions = {
            $context: $('body')
        },
        Context;

    Context = function ($element) {
        console.log('Context.constructor', $element);
        this.$element = $element;
        this.elements = [];

        this.top = this.$element.position().top;
        this.height = this.$element.height();
        this.spread = this.top + this.height;
    };
    Context.prototype = {
        getOffset: function (scrollTop) {
            return scrollTop - this.top;
        },

        isVisible: function (scrollTop, windowHeight) {
            var visible = false,
                windowSpread = scrollTop + windowHeight;

            if (
                (this.top >= scrollTop && this.top <= windowSpread) ||
                (this.top <= scrollTop && this.spread >= scrollTop)
            ) {
                visible = true;
            }

            return visible;
        },

        addElement: function ($element) {
            var position = $element.offset();

            this.elements.push({
                $element: $element,
                speed: $element.data('speed'),
                top: position.top,
                left: position.left
            });
        },

        parallax: function (scrollTop, windowHeight) {
            var offset;

            if (this.isVisible(scrollTop, windowHeight)) {
                offset = this.getOffset(scrollTop);

                $.each(this.elements, function (index, element) {
                    element.$element.css({
                        top: element.top + (element.speed * offset)
                    });
                });
            }
        }
    };
    Context.create = (function () {
        var getContextId,
            contexts = {};

        getContextId = (function () {
            var count = 0,
                dataAttrinute = 'parallax-ctx-id';

            return function ($element) {
                var id = $element.data(dataAttrinute);

                if (!id) {
                    id = count;
                    $element.data(dataAttrinute, id);
                    count += 1;
                }
                console.log('Context.getContextId', id);
                return id;
            };
        }());

        $window.on('scroll', function () {
            var scrollTop = $window.scrollTop(),
                windowHeight = $window.height();

            $.each(contexts, function (id, context) {
                context.parallax(scrollTop, windowHeight);
            });
        });

        return function ($element) {
            console.log('Context.create', $element);
            var contextId = getContextId($element);

            if (contexts[contextId] === undefined) {
                contexts[contextId] = new Context($element);
            }

            return contexts[contextId];
        };
    }());

    $.fn.parallax = function (options) {
        options = $.extend({}, defaultOptions, options || {});

        return this.each(function () {
            var context = Context.create(options.$context);

            context.addElement($(this))
        });
    };
}(jQuery));