__req.define([
    "lib/Class",
    "src/common/event/EventDispatcher",
    "lib/URL",
    "src/graphics/BitmapProxy"
],function( Class, EventDispatcher, URL, BitmapProxy ){

    var Image = Class( EventDispatcher, function( cls, parent ){

        cls.constructor = function( url ){
            parent.constructor.apply(this,arguments);

            this._src = "";

            this._bitmapProxy = null;

            if( url ) this.src = url;
        };

        cls.src = { get: function(){ this._src; }, set: function( value ){

            this._src = value;

            var url = new URL(value);

            // ScriptTag ver
//            if ( this._image ) document.head.removeChild( this._image );
            this._image = null;
            var image = document.createElement("img");
            // TODO handler

            var ctx = window.__herlock_ctx;
            image.onload = (function(){
                this._image = image;
//                document.head.appendChild( this._image );
                this._bitmapProxy = new BitmapProxy( this._image );
//                this.onload();
                this._dispatchEventAndCallHandler( new Event("load") );
            }).bind(this);//TODO
            image.src = url.host===""? ctx._rootPath + url: url.toString();

        } };
        cls.complete = { get: function(){} };

        cls.width = { get: function(){
            if(this._image) return this._image.width;
            return 0;
        } };
        cls.height = { get: function(){
            if(this._image) return this._image.height;
            return 0;
        } };
        cls.naturalWidth = { get: function(){
            if(this._image) return this._image.width;
            return 0;
        } };
        cls.naturalHeight = { get: function(){
            if(this._image) return this._image.height;
            return 0;
        } };

        cls.onload = function(){};
        cls.onerror = function(){};


        //

        cls._getBitmap = function(){
            return this._bitmapProxy;
        };

    } );

    return Image;
});