define([
    "lib/Class",
    "lib/URL",
    "module/NJModule",
    "module/common/event/EventDispatcher"
],function( Class, URL, NJModule, EventDispatcher ){

    var NJLocation = Class( NJModule, function( cls, parent ){

        cls.constructor = function(){
            parent.constructor.apply(this,arguments);
        };

        cls.getName = function() { return "Location";}

        cls.installTo = function( ctx ) {
//            nativeInstallTo(getNativePtr(), ctx.getNativePtr());
            ctx.Location = Location;
        }

        cls.initJs = function( ctx ) {
//            nativeInitJs(getNativePtr(), ctx.getNativePtr());
//            ctx.location = new Location( this );
            // locationは上書きできない
            var loc = new Location( this );
//            for( var name in loc )
//                if( typeof loc[name] === "function" )
//                    ctx.location[name] = loc[name].bind(loc);

            ctx.location._assign = loc._assign.bind(loc);
        }

        cls.reset = function() {
//            nativeReset(getNativePtr());
        }

        cls.assign_native = function( url ) {
            console.log("NJLocation::assign_native");

            setTimeout( (function(){
                console.log("NJLocation::Starter::run");
                var njs = this._njs;
                // reset context
                njs.reset();
                // start
                njs.start();
//                njs.getHandler().post(new Runnable() {
//                    @Override
//                    public void run() {
//                        nativeSetURLInternal(getNativePtr(), url);
//                    }
//                });
                setTimeout( function(){
                    var urlObj = new URL(url);
                    var path = "";
                    if( urlObj.host !== "" )
                        path = urlObj.protocol+"//"+urlObj.host+urlObj.pathname;
                    else // 相対パスなら
                        path = location.protocol + "//" + location.host + location.pathname + urlObj.pathname;

                    njs._rootPath = path.substr( 0, path.lastIndexOf("/")+1 );

                    njs.executeScript("" +
                        "(function(){" +
                        "\n	var bootstrap = new Script();" +
                        "\n	bootstrap.onerror = function(e){ " +
                        "  app.nativeLog(\"\"+e); app.sendMessage(\"\"+e); " +
                        "  setTimeout( function(){ location._assign(); }, 2000 );" +
                        "}" +
                        "\n	bootstrap.onabort = function(){}" +
                        "\n	bootstrap.onload = function(){}" +
                        "\n	bootstrap.src = '" + ( path.substr( path.lastIndexOf("/") ) ) + "';" +
                        "})();");

                },0 );

            }).bind(this), 0 );
        }

    } );

    var Location = Class( EventDispatcher, function( cls, parent ){

        cls.constructor = function( module ){
            parent.constructor.call( this );
            this._module = module;
            this._url = new URL("");
        };

        //
        cls._assign = function( str ){ this._module.assign_native( str ) };

        cls.assign = function( str ){ this._module.assign_native( str ) };
        cls.reload = function(){ this.assign( this._url.toString() ); };
        cls.replace = function(){};
        // class変数定義
        cls.hash = { get:function(){ return this._url.hash; }, set:function( value ){
            this._url.hash = value;
            // TODO event
        } };
        cls.host = { get:function(){ return this._url.host; }, set:function( value ){
            this._url.host = value;
            this.reload();
        } };
        cls.hostname = { get:function(){ return this._url.hostname; }, set:function( value ){
            this._url.hostname = value;
            this.reload();
        } };
        cls.href = { get:function(){ return this._url.toString(); }, set:function( value ){
            this._url = new URL(value);
            this.reload();
        } };
        cls.pathname = { get:function(){ return this._url.pathname; }, set:function( value ){
            this._url.pathname = value;
            this.reload();
        } };
        cls.port = { get:function(){ return this._url.port; }, set:function( value ){
            this._url.port = value;
            this.reload();
        } };
        cls.protocol = { get:function(){ return this._url.protocol; }, set:function( value ){
            this._url.protocol = value;
            this.reload();
        } };
        cls.search = { get:function(){ return this._url.search; }, set:function( value ){
            this._url.search = value;
            this.reload();
        } };

    } );



    return NJLocation;
});