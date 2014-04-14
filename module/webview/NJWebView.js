define([
    "lib/Class",
    "module/NJModule",
    "module/common/event/EventDispatcher"
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

            this._layout = new Rectangle();

            this._iframe = this._createIframe();
            document.head.appendChild(this._iframe);
        };

        cls._createIframe = function(){
            var iframe = document.createElement( "iframe" );
            iframe.setAttribute( "seamless", true );
            iframe.style.position = "absolute";
            iframe.style.top = 0;
            iframe.style.left = 0;
            iframe.style.width = this._layout.width+"px";
            iframe.style.height = this._layout.height+"px";
            iframe.style.border = "0";
            return iframe;
        }

        cls.load = function( url ) {
            // TODO やっつけ。onloadが2回目以降呼ばれない問題対応
            if( !this._iframe || !this._iframe.parentNode ) {
                this._iframe = this._createIframe();
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
            this._module._container.parentNode.appendChild( this._iframe );
//            document.body.appendChild( this._iframe );
        };

        cls.hide = function() {
            if( this._iframe.parentNode ) this._iframe.parentNode.removeChild(this._iframe);
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
            //
            //if( this._layout.y != value.y || this._layout.x != value.x  )
                this._iframe.style.transform = "matrix3d( 1, 0, 0, 0,  0, 1, 0, 0,  0, 0, 1, 0,  "+value.x+","+value.y+", 0, 1)";

            if( this._layout.width != value.width )
                this._iframe.style.width = value.width+"px";
            if( this._layout.height != value.height )
                this._iframe.style.height = value.height+"px";

            this._layout = value;
        };
        cls.sendMessage = function(){

        };
        cls.evalJS = function(){

        };

    } )

    return NJWebView;
});