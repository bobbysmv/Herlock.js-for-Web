define([
    "lib/Class",
    "NativeJS",
    "module/script/NJScript",
    "module/app/NJApp",
    "module/location/NJLocation",
    "module/view/NJView",
    "module/view_css/NJView",
    "module/view_canvas/NJView",
    "module/google_analytics/NJGoogleAnalytics",
    "module/webview/NJWebView",
    "module/xhr/NJXhr",
    "module/sound/NJSound",
    "module/nativeui/NJNativeUI",
    "module/local_notification/NJLocalNotification",
    "module/push/NJPush"
],function( Class, NativeJS, NJScript, NJApp, NJLocation, NJView, NJView_css, NJView_canvas, NJGoogleAnalytics, NJWebView, NJXhr, NJSound, NJNativeUI, NJLocalNotification, NJPushNotification ){

    var Player = Class( Object, function( cls, parent ){

        cls.constructor = function( mainJsURL, options ){
            options = options || {};

            if( !mainJsURL && window.parent ) {
                try{
                    var params = window.parent.herlock.getParams();
                    var path = window.parent.location.href.split("?")[0].split("#")[0];
                    mainJsURL = path.substr( 0, path.lastIndexOf("/")+1 ) + params.mainJsURL
                    for( var key in params.options ) options[key] = params.options[key];
                } catch(e){}
            }

            this._container = options.container;
            if( this._container ) {
                options.width = options.width || this._container.width;
                options.height = options.height || this._container.height;
            } else {
                this._container = document.createElement("div");
                this._container.id = "herlock_player";
                this._container.width = options.width;
                this._container.height = options.height;
                this._container.style.overflow = "hidden";
                document.body.appendChild( this._container );
            }

            var njs = this._njs = new NativeJS();

            var app = null;

            // install src
            njs.registerModule( new NJScript() );
            njs.registerModule( app = new NJApp() );
            njs.registerModule( new NJLocation() );
            if( options.useViewCSS )
                njs.registerModule( new NJView_css( this._container, options.width || innerWidth, options.height || innerHeight ) );
            else if( options.useViewCanvas )
                njs.registerModule( new NJView_canvas( this._container, options.width || innerWidth, options.height || innerHeight ) );
            else
                njs.registerModule( new NJView( this._container, options.width || innerWidth, options.height || innerHeight ) );
            njs.registerModule( new NJGoogleAnalytics() );
            njs.registerModule( new NJWebView( this._container ) );
            njs.registerModule( new NJXhr() );
            njs.registerModule( new NJSound() );
            njs.registerModule( new NJNativeUI() );
            njs.registerModule( new NJLocalNotification() );
            njs.registerModule( new NJPushNotification() );

            if( mainJsURL ) njs.loadURL( mainJsURL );
        };

    } );

    return Player;
});