__req.define([
    "lib/Class",
    "src/NJModule",
    "src/common/event/EventDispatcher"
], function( Class, NJModule, EventDispatcher ) {

    var NJWebView = Class( NJModule, function( cls, parent ){

        cls.constructor = function( container ){
            parent.constructor.apply(this,arguments);
            this._container = container;
        };


        cls.installTo = function( ctx ) {
        }

        cls.initJs = function( ctx ) {
            ctx.webview = new WebView( this );
        }

    } );

    /**
     * iframe利用
     * @class
     */
    var WebView = Class( EventDispatcher, function( cls, parent ){

        cls.constructor = function( module ){
            parent.constructor.apply(this,arguments);

            this._module = module;

            this._iframe = null;

            this._layout = null;

            this._iframe = document.createElement( "iframe" );
            this._iframe.setAttribute( "seamless", true );
            this._iframe.style.position = "absolute";
            this._iframe.style.border = "0";
            document.head.appendChild(this._iframe);
        };

        cls.load = function( url ) {
            // TODO やっつけ。onloadが2回目以降呼ばれない問題対応
            if( !this._iframe || !this._iframe.parentNode ) {
                this._iframe = document.createElement( "iframe" );
                this._iframe.setAttribute( "seamless", true );
                this._iframe.style.position = "absolute";
                document.head.appendChild(this._iframe);
            }
            //
            if( this._iframe.src === url ) {
                setTimeout( (function(){
                    this._dispatchEventAndCallHandler(new Event("load"));
                }).bind(this), 10 );
                return;
            }

            var handler = (function(){
                this._iframe.removeEventListener( "load", handler );
                this._dispatchEventAndCallHandler(new Event("load"));
            }).bind(this);
            this._iframe.addEventListener( "load", handler );
            this._iframe.src = url;
        }

        cls.show = function(){
            this._module._container.appendChild( this._iframe );
//            document.body.appendChild( this._iframe );
        };

        cls.hide = function() {
            document.head.appendChild(this._iframe);
        }
        cls.goForward = function(){

        };
        cls.goBack = function(){

        };
        cls.reload = function(){

        };
        cls.getLayout = function(){
            return this._layout;
        };
        cls.setLayout = function(value){
            //
            this._layout = value;
            //
            this._iframe.style.top = this._layout.y+"px";
            this._iframe.style.left = this._layout.x+"px";
            this._iframe.style.width = this._layout.width+"px";
            this._iframe.style.height = this._layout.height+"px";
        };
        cls.sendMessage = function(){

        };
        cls.evalJS = function(){

        };

    } )

    return NJWebView;
});