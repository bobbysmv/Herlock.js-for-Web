__req.define([
    "lib/Class",
    "src/common/event/EventDispatcher",
    "lib/URL"
],function( Class, EventDispatcher, URL ){

    var ScriptObject = Class( EventDispatcher, function( cls, parent ){

        cls.constructor = function( src ){
            parent.constructor.apply(this,arguments);

            this._src = "";

            if( src ) this.src = src;
        };


        cls.src = { get: function(){ return this._src;}, set: function( value ) {
            this._src = value;
            // TODO ScriptタグかXHRか・・・

            var url = new URL(value);

            // ScriptTag ver
            if ( this._script ) document.head.removeChild( this._script );
            this._script = document.createElement("script");
            // TODO handler
            document.head.appendChild( this._script );

            var ctx = window.__herlock_ctx;
            this._script.onload = (function(){ this.onload(); }).bind(this);//TODO
            this._script.src = url.host===""? ctx._rootPath + url: url.toString();

//            // XHR var
//            var self = this;
//            var ctx = window.__herlock_ctx;
//            var loader = new XMLHttpRequest();
//            loader.open("GET", url.host===""? ctx._rootPath + url: url.toString() );
//            loader.onload = function(){
//                ctx.executeScript( this.responseText );
//                setTimeout( function(){ if(self.onload)self.onload(); }, 100 );
//            };
//            loader.send();

        } };

    } );

    return ScriptObject;
});