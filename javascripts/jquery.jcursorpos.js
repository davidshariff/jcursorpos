/**
 * jCursorPos
 * 
 * https://github.com/davidshariff/jCursorPos
 *
 * Copyright (c) 2013 David Shariff
 * http://davidshariff.com/blog/
 *
 * Licensed under the MIT license.
 * 
 **/

;(function ($, window, document, undefined) {
    'use strict';
    
    var defaults = {
            onChange: function(){},
            className: 'jCursorPos'
        },
        _HTML = {
            clone : '<pre class="' + defaults.className + ' ' + defaults.className + '-clone"></pre>',
            clone_cursor: '<span class="' + defaults.className + ' ' + defaults.className + '-cursor"></span>'
        };

    // constructor
    function JCursorPos(element, options) {
        this.$el        = $(element);
        this.$clone     = {};
        this.$cursor    = {};
        this.options    = $.extend({}, defaults, options);
        this._defaults  = defaults;
        this.init();
    }
    
    JCursorPos.prototype = {
        init: function () {
            
            var that = this;
            
            this.createPluginStyles();
            this.createClone();
            
            this.$el.bind('keyup keydown paste focus mouseup', function() {
                that.updateCursor();
                that.updateOrig();
                that.options.onChange.call(that.$el, that.$cursor);
            });
            
        },
        // gets the cloned cursor's dimensions and merges it with the source element
        calcCursor: function() {
            
            var offset, pos;
            
            // $el must of been resized, update the clone dimensions
            if (this.$el.width() !== this.$clone.width() || this.$el.height() !== this.$clone.height()) {
                this.cloneStyles();
            }
            
            offset  = this.$el.offset();
            pos     = this.$clone.find('.' + defaults.className + '-cursor').position();
                
            return {
                'position'  : pos,
                'offset'    : {
                    'left': (offset.left + pos.left) - this.$el.scrollLeft(),
                    'top': (offset.top + pos.top) - this.$el.scrollTop()
                }
            };
        
        },
        // copies the source element's styles to the cloned element
        cloneStyles: function() {
            
            var attrs = ['font-family','font-size','font-weight','font-style','color',
                    'text-transform','text-decoration','letter-spacing','word-spacing',
                    'line-height','text-align','vertical-align','direction','background-color',
                    'background-image','background-repeat','background-position',
                    'background-attachment','opacity','width','height','top','right','bottom',
                    'left','margin-top','margin-right','margin-bottom','margin-left',
                    'padding-top','padding-right','padding-bottom','padding-left',
                    'border-top-width','border-right-width','border-bottom-width',
                    'border-left-width','border-top-color','border-right-color',
                    'border-bottom-color','border-left-color','border-top-style',
                    'border-right-style','border-bottom-style','border-left-style','position',
                    'display','visibility','z-index','overflow-x','overflow-y','white-space',
                    'clip','float','clear','cursor','list-style-image','list-style-position',
                    'list-style-type','marker-offset'
                ],
                word_wrap = this.$el.prop('tagName') === 'TEXTAREA' ? 'break-word' : 'normal';
            
            // apply cloned styles and overwrite some as we want to position our clone offscreen
            this.$clone.css(this.$el.css(attrs)).css({
                'left': '-9999px',
                'position': 'absolute',
                'word-wrap': word_wrap,
                'white-space': 'pre-wrap'
            });
            
            // scrollbar was added to source, update clone
            if (this.$el.get(0).scrollHeight > this.$el.innerHeight()) {
                this.$clone.css('overflow-y', 'scroll');
            }
            if (this.$el.get(0).scrollWidth > this.$el.innerWidth()) {
                this.$clone.css('overflow-x', 'scroll');
            }
            
        },
        // creates the cloned element once
        createClone: function() {
            this.$clone = $(_HTML.clone).appendTo($('body'));
            this.cloneStyles();
        },
        // creates plugin specific styles
        createPluginStyles: function() {
            
            var style_tag = $('.' + defaults.className + '-styles');
            
            // once per page load
            if (style_tag.length === 0) {
                
                style_tag = $('<style class="' + defaults.className + '-styles"></style>')
                    .prepend('.' + defaults.className + ' br { display: block; }')
                    .prepend('.' + defaults.className + '-cursor { display: inline-block; padding: 0; border: 0; }')
                    .appendTo('head');
    
            }
            
        },
        // gets the caret position of the source element's cursor
        getCaretPos: function() {
        
            var el  = this.$el[0],
                pos = 0;
            
            if ('selectionStart' in el) {
                pos = el.selectionStart;
            }
            else if ('selection' in document) {
                
                el.focus();
                var range = el.createTextRange(),
                    range2 = document.selection.createRange().duplicate(),
                    // get the opaque string
                    range2Bookmark = range2.getBookmark();
            
                // move the current range to the duplicate range
                range.moveToBookmark(range2Bookmark);
            
                // counts how many units moved (range calculated as before char and after char, loop count is the position)
                while (range.moveStart('character' , -1) !== 0) {
                    pos++;
                }
                
            }
            
            return pos;
        
        },
        // the text in the source element
        getText: function() {
            return this.$el[0].contentEditable === 'true' ? this.$el.html() : this.$el.val();
        },
        // inserts the cloned cursor + text from the source element into the cloned element
        updateCursor: function() {
            
            var pos     = this.getCaretPos(),
                text    = this.getText(),
                before  = text.substring(0, pos).replace(/\n/g, '<br>'),
                after   = text.substring(pos).replace(/\n/g, '<br>');
            
            this.$clone.html(before  + _HTML.clone_cursor + after);
            this.$cursor = this.calcCursor();
            
        },
        // adds the top / left values of the cursor to the source element's attributes
        updateOrig: function() {
            
            this.$el.attr({
                'data-jcursorpos-offset-left'  : this.$cursor.offset.left,
                'data-jcursorpos-offset-top'   : this.$cursor.offset.top,
                'data-jcursorpos-position-left': this.$cursor.position.left,
                'data-jcursorpos-position-top' : this.$cursor.position.top
            });
            
        }
    };

    $.fn.jCursorPos = function (options) {
        return this.each(function () {
            // prevent multiple instantiations
            if (!$.data(this, 'plugin_jCursorPos')) {
                $.data(this, 'plugin_jCursorPos', new JCursorPos(this, options));
            }
        });
    };

})(jQuery, window, document);
