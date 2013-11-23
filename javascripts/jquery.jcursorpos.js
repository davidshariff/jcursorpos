/**
 * jCursorPos
 * 
 * Version 2.0
 * 
 * https://github.com/davidshariff/jCursorPos
 *
 * Copyright (c) 2013 David Shariff
 * http://davidshariff.com/blog/
 *
 * Licensed under the MIT license.
 * 
 **/

/**
 * Situations Tested
 * 1. Spaces between words in a sentence
 * 2. Multiple spaces between words
 * 3. Multiple spaces by themselve without words
 * 4. Line breaks without words
 * 5. Line breaks with multiple words
 * 6. Cursor at beginning and end of lines
 **/

;(function ($, window, document, undefined) {
    'use strict';
    
    var defaults = {
            onChange: function(){},
            className: 'jCursorPos'
        },
        _HTML = {
            clone       : '<pre class="' + defaults.className + ' ' + defaults.className + '-clone"></pre>',
            clone_cursor: '<span class="' + defaults.className + ' ' + defaults.className + '-cursor"></span>',
            linebreak   : '&#8203;<br>&#8203;',
            space       : '&#8203;&nbsp;&#8203;'
        },
        _REGEX = {
            'linebreak': /\r\n|\r|\n/g,
            'trim_space': /^ +| +$/gm,
            'trim_lead_space': /[^\S\n]+$/g,
            'space_and_lb': /[\n\r\s]+/g,
            'whitespace': /[^\S\n]/g
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
        /**
         * gets the cloned cursor's dimensions and merges it with the source element
         **/
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
        /**
         * copies the source element's styles to the cloned element
         **/
        cloneStyles: function() {
            
            // cross browser won't let us clone styles from Obj, so we manually define here.
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
                word_wrap   = this.$el.prop('tagName') === 'TEXTAREA' ? 'break-word' : 'normal',
                white_space = this.$el.prop('tagName') === 'TEXTAREA' ? 'pre-wrap' : 'nowrap';
            
            // apply cloned styles and overwrite some as we want to position our clone offscreen
            this.$clone.css(this.$el.css(attrs)).css({
                'left'          : '-9999px',
                'position'      : 'absolute',
                'word-wrap'     : word_wrap,
                'white-space'   : white_space
            });
            
            // scrollbar was added to source, update clone
            if (this.$el.get(0).scrollHeight > this.$el.innerHeight()) {
                this.$clone.css('overflow-y', 'scroll');
            }
            if (this.$el.get(0).scrollWidth > this.$el.innerWidth()) {
                this.$clone.css('overflow-x', 'scroll');
            }
            
        },
        /**
         * creates the cloned element once
         **/
        createClone: function() {
            this.$clone = $(_HTML.clone).appendTo($('body'));
            this.cloneStyles();
        },
        /**
         * creates plugin specific styles
         **/
        createPluginStyles: function() {
            
            var style_tag   = $('.' + defaults.className + '-styles'),
                styles      = '.' + defaults.className + '-cursor { display: inline-block; padding: 0; border: 0; }';
            
            // once per page load
            if (style_tag.length === 0) {
                $('<style class="' + defaults.className + '-styles">' + styles + '</style>').appendTo('head');
            }
            
        },
        /**
         * gets the caret position of the source element's cursor
         **/
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
        /**
         * text in the source element
         **/
        getText: function() {
            return this.$el[0].contentEditable === 'true' ? this.$el.html() : this.$el.val();
        },
        /**
         * takes raw text and preserves spaces / linebreaks
         **/
        textToHTML: function(text) {
            // <= IE8 strips leading whitespace
            if (!$.support.leadingWhitespace) {
                text.replace(/ /g, _HTML.space); 
            }
            return text.replace(_REGEX.linebreak, _HTML.linebreak);
        },
        wrapCharAtPos: function(str, pos, classname) {
            return str.slice(0, pos) + '<span class="' + classname + '">' + str.slice(pos, pos + 1) + '</span>' + str.slice(pos + 1, str.length);
        },
        wrapWordAtPos: function(str, boundary, chr) {
            
            var regex = {
                'first' : {
                    'classname' : 'after-word'
                },
                'last' : {
                    'classname' : 'before-word'
                }
            };
            
            var word_array  = [],
                replace_lbs = [],
                first_part  = '', replace_part = '', last_part = '';
            
            // previous word before cursor
            if (boundary === 'last') {

                // trim trailing whitespace only
                var trail_spaces        = str.match(_REGEX.trim_lead_space),
                    trail_spaces_len    = trail_spaces ? trail_spaces[0].length : 0;
                
                // add trailing spaces back after before-word, but before cursor
                if (trail_spaces_len > 0) {
                    str = str.replace(_REGEX.trim_lead_space, '');
                    for (var i = 0; i < trail_spaces_len; i++) {
                        last_part += ' ' || _HTML.space;
                    }
                }
                
                // split on spaces only
                str             = str.replace(_REGEX.whitespace, '!');
                word_array      = str.split('!');
                replace_part    += word_array.pop();
                // rejoin the first words together
                first_part      += word_array.join(' ');
                
                // linebreaks inside a span are invalid, so lets remove them
                replace_lbs = replace_part.split(_REGEX.linebreak) || [];
                
                if (replace_lbs.length > 1) {
                    // replace is simply the word after the last linebreak
                    replace_part = replace_lbs.pop();
                    // rejoin previous words that had linebreaks
                    first_part += replace_lbs.join(_HTML.linebreak) + _HTML.linebreak;
                }
                
                // maintain white space before before-word wrap
                if (word_array.length > 0) {
                    first_part += _HTML.space;
                }

            }
            // next word after cursor
            else {
                
                // first char after cursor is space
                if (chr === ' ') {
                    str = str.substring(1);
                    // append it back after we construct string
                    first_part += ' ';
                }
                
                 // split on spaces and linebreaks
                word_array   = str.split(_REGEX.space_and_lb);
                replace_part += word_array.shift();
                last_part    += ' ' + word_array.join(' ');
                
            }
            
            str = [first_part, '<span class="' + regex[boundary].classname + '">', replace_part, '</span>', last_part].join('');
            
            return str;
        
        },
        /**
         * inserts the cloned cursor + text from the source element into the cloned element
         **/
        updateCursor: function() {
            
            var pos         = this.getCaretPos(),
                text        = this.getText(),
                beforeText  = text.substring(0, pos),
                afterText   = text.substring(pos),
                beforeChar  = text.charAt(pos - 1),
                afterChar   = text.charAt(pos),
                beforeWord,
                afterWord;
            
            // wrap the words before and after the cursor
            beforeText  = this.wrapWordAtPos(beforeText, 'last', beforeChar);
            afterText   = this.wrapWordAtPos(afterText, 'first', afterChar);
            
            // update clone area with source text and new word wrappers
            this.$clone.html(this.textToHTML(beforeText)  + _HTML.clone_cursor + this.textToHTML(afterText));
            
            // update references to new nodes
            beforeWord  = $('.before-word');
            afterWord   = $('.after-word');
            
            // before and after word sitting on different lines
            if (afterWord.html().length > 0 && pos > 0 && afterWord.position().top > beforeWord.position().top) {
                
                // browsers drop to new line if last char on line is a space and next is pressed
                // NOTE: FF does not follow this behaviour
                if (beforeChar === ' ') {
                    beforeWord.after(_HTML.linebreak);
                }
                // simulate first word of sentence wrapping
                else if (afterChar !== ' ' && !beforeChar.match(_REGEX.linebreak)) {
                    beforeWord.before(_HTML.linebreak);
                }
                
            }

            // update position
            this.$cursor = this.calcCursor();
            
        },
        /**
         * adds the top / left values of the cursor to the source element's attributes
         **/
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
