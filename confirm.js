(function () {
    'use strict';

    var CLS_HIDE = 'confirm-hide';
    // 定义一个全局变量
    window.plugin = {};

    function isFunction ( val ) {
        return (typeof val === 'function') || Object.prototype.toString.apply( val ) === '[object Function]';
    }

    function isObject ( val ) {
        return (val && (typeof val === 'object' || isFunction( val ))) || false;
    }

    function isUndefined ( val ) {
        return typeof val === 'undefined';
    }

    function decodeHTML ( str ) {
        return str.replace( /&lt;/g, '<' )
                  .replace( /&gt;/g, '>' )
                  .replace( /&amp;/g, '&' )
                  .replace( /&quot;/g, '"' )
                  .replace( /&#x27;/g, '\'' )
                  .replace( /&#x2F;/g, '\/' )
                  .replace( /&#x60;/g, '`' );
    }

    function encodeHTML ( html ) {
        var HTML_CHARS = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            '\'': '&#x27;',
            '/': '&#x2F;',
            '`': '&#x60;'
        };

        return html.replace( /[\r\t\n]/g, ' ' ).replace( /[&<>"'\/`]/g, function ( match ) {
            return HTML_CHARS[ match ];
        } );
    }

    function stripScripts ( str ) {
        var SCRIPT_FRAGMENT = '<script[^>]*>([\\S\\s]*?)<\/script\\s*>';

        return str.replace( new RegExp( SCRIPT_FRAGMENT, 'img' ), '' );
    }

    function template ( json, html ) {
        var prop,
            value;

        if ( !json || !html ) {
            return '';
        }

        for ( prop in json ) {

            if ( json.hasOwnProperty( prop ) ) {
                prop = String( prop );
                value = stripScripts( json[ prop ] );

                html = html.replace( new RegExp( '<%=' + prop + '%>', 'img' ), encodeHTML( value ) );
            }
        }

        return stripScripts( decodeHTML( html ) );
    }

    function Confirm ( options ) {
        this.attrs = {};

        this.elements = {
            parent: null,
            wrap: null,
            modal: null,
            header: null,
            title: null,
            close: null,
            body: null,
            content: null,
            footer: null,
            cancel: null,
            enter: null
        };

        if ( $.isPlainObject( options ) ) {
            this.initialize( options );
        }

        return this;
    };

    Confirm.defaults = {
        parent: document.body,
        title: '确认',
        message: '',
        WRAP: '<div class="confirm ' + CLS_HIDE + '"></div>',
        MODAL: '<div class="confirm-modal"></div>',
        HEADER: '<div class="confirm-modal-hd"></div>',
        TITLE: '<h2 class="confirm-modal-title"><%=title%></h2>',
        CLOSE: '<div class="confirm-modal-close" title="关闭">&times;</div>',
        BODY: '<div class="confirm-modal-bd"></div>',
        CONTENT: '<p class="confirm-modal-text"><%=message%></p>',
        FOOTER: '<div class="confirm-modal-ft"></div>',
        CANCEL: '<div class="confirm-button confirm-cancel-button"><%=cancel%></div>',
        ENTER: '<div class="confirm-button confirm-enter-button"><%=enter%></div>',
        OVERLAY: '<div class="confirm-overlay"></div>',
        buttons: [
            {
                text: '取消',
                callback: null
            },
            {
                text: '确认',
                callback: null
            }
        ]
    };

    Confirm.prototype = {
        constructor: Confirm,
        initialize: function ( options ) {

            this.set( Confirm.defaults )
                .set( options )
                .initElements()
                .render()
                .addListeners();

            return this;
        },
        set: function ( options ) {

            if ( $.isPlainObject ) {
                $.extend( this.attrs, options );
            }

            return this;
        },
        get: function ( prop ) {
            return this.attrs[ prop ];
        },
        getElements: function () {
            return this.elements;
        },
        initElements: function () {
            var self = this,
                elements = this.getElements(),
                buttons = this.get( 'buttons' );

            elements.parent = $( this.get( 'parent' ) );
            elements.wrap = $( this.get( 'WRAP' ) );
            elements.modal = $( this.get( 'MODAL' ) );
            elements.header = $( this.get( 'HEADER' ) );
            elements.title = $( template( {
                title: self.title()
            }, this.get( 'TITLE' ) ) );
            elements.close = $( this.get( 'CLOSE' ) );
            elements.body = $( this.get( 'BODY' ) );
            elements.content = $( template( {
                message: self.text()
            }, this.get( 'CONTENT' ) ) );
            elements.footer = $( this.get( 'FOOTER' ) );
            elements.cancel = $( template( {
                cancel: buttons[ 0 ].text
            }, this.get( 'CANCEL' ) ) );
            elements.enter = $( template( {
                enter: buttons[ 1 ].text
            }, this.get( 'ENTER' ) ) );
            elements.overlay = $( this.get( 'OVERLAY' ) );

            return this;
        },
        title: function ( title ) {
            if ( typeof title === 'string' ) {
                this.set( {
                    title: title
                } );
            }
            else {
                return this.get( 'title' );
            }

            return this;
        },
        text: function ( msg ) {
            if ( typeof msg === 'string' ) {
                this.set( {
                    message: msg
                } );
            }
            else {
                return this.get( 'message' );
            }

            return this;
        },
        reload: function ( options ) {
            this.destroy().initialize( options );

            return this;
        },
        render: function () {
            var elements = this.getElements();

            // 隐藏的时候绘制界面，并添加到文档中
            elements.header.append( elements.title ).append( elements.close );
            elements.body.append( elements.content );
            elements.footer.append( elements.cancel ).append( elements.enter );
            elements.modal.append( elements.header ).append( elements.body ).append( elements.footer );
            elements.wrap.append( elements.modal ).append( elements.overlay );
            elements.parent.append( elements.wrap );

            // 然后显示整个界面
            this.open();

            return this;
        },
        open: function () {
            var elements = this.getElements();

            elements.wrap.removeClass( CLS_HIDE );

            return this;
        },
        close: function () {
            var elements = this.getElements();

            elements.wrap.addClass( CLS_HIDE );

            return this;
        },
        off: function () {
            var elements = this.getElements();

            elements.wrap.off();

            return this;
        },
        remove: function () {
            var elements = this.getElements();

            elements.wrap.remove();

            return this;
        },
        destroy: function () {

            this.close().off().remove();

            return this;
        },
        addListeners: function () {
            var self = this,
                elements = this.getElements(),
                $wrap = elements.wrap,
                EvtData = {
                    context: self
                };

            $wrap.delegate( '.confirm-modal-close', 'click', EvtData, this.onCloseClick );
            $wrap.delegate( '.confirm-cancel-button', 'click', EvtData, this.onCancelClick );
            $wrap.delegate( '.confirm-enter-button', 'click', EvtData, this.onEnterClick );

            $wrap.bind('click', function (evt) {
                evt.stopPropagation();
                evt.preventDefault();
                evt.nativeEvent && evt.nativeEvent.stopImmediatePropagation && evt.nativeEvent.stopImmediatePropagation();
            });

            return this;
        },
        onCloseClick: function ( evt ) {
            var context = evt.data.context,
                callback = context.get( 'buttons' )[ 0 ].callback;

            context.close();

            if ( isFunction( callback ) ) {
                callback();
            }

            evt.stopPropagation();
            evt.preventDefault();

            return context;
        },
        onCancelClick: function ( evt ) {
            var context = evt.data.context,
                callback = context.get( 'buttons' )[ 0 ].callback;

            context.close();

            if ( isFunction( callback ) ) {
                callback();
            }

            evt.stopPropagation();
            evt.preventDefault();

            return context;
        },
        onEnterClick: function ( evt ) {
            var context = evt.data.context,
                callback = context.get( 'buttons' )[ 1 ].callback;

            context.close();

            if ( isFunction( callback ) ) {
                callback();
            }

            evt.stopPropagation();
            evt.preventDefault();

            return context;
        }
    };
    if ( isUndefined( plugin.Confirm ) ) {
        plugin.Confirm = Confirm;
        plugin.confirm = function(options) {
           return  new Confirm( {
                title: options.title,
                message: options.message,
                buttons: options.buttons
            } );
        }
    }else {

        if ( isObject( module ) && isObject( module.exports ) ) {

            // AMD
            module.exports = Confirm;
        }
        else {

            // CMD
            if ( isFunction( define ) && define.cmd ) {
                define( function ( require, exports, module ) {
                    module.exports = Confirm;
                } );
            }
        }
    }
})();

