define([
    "lib/Class",
    "module/common/event/EventDispatcher",
    "lib/URL"
],function( Class, EventDispatcher, URL ){

    var Audio = Class( EventDispatcher, function( cls, parent ){

        cls.constructor = function( url, type ){
            parent.constructor.apply(this,arguments);

            this._src = "";
            this._type = type || Audio.MUSIC;

            this._volume = 1.0;

            this._playing = false;
            this._loop = false;

            if( url ) this.src = url;
        };

        cls.src = { get: function(){ return this._src; }, set: function( value ){

            this._src = value;

            var url = new URL(value);

            // ScriptTag ver
//            if ( this._audio ) document.head.removeChild( this._audio );
            this._audio = null;
            var audio = document.createElement("audio");
            // TODO handler

            var ctx = window.__herlock_ctx;
            audio.oncanplaythrough = (function(){
                this._audio = audio;
//                document.head.appendChild( this._audio );
                this._dispatchEventAndCallHandler( new Event("load") );
                this._audio.volume = this._volume;
                this._audio.loop = this._loop;
                if( this._playing ) this.play();
            }).bind( this ); //TODO
            audio.src = url.host===""? ctx._rootPath + url: url.toString();
        } };

        cls.type = { get: function(){ return this._type; }}
        cls.complete = { get:function(){
            return !!this._audio;
        } };
        cls.volume = { get: function(){
            return this._volume;
        }, set:function( value ){
            this._volume = value;
            if( this._audio ) this._audio.volume = value;
        } };
        cls.loop = { get: function() { return this._loop; }, set: function( value ) {
            this._loop = value;
            if( this._audio ) this._audio.loop = value;
        } };
        //cls.currentTime", currentTime_getter, currentTime_setter );
        //
        cls.play = function (){
            this._playing = true;
            if( !this._audio ) return;
            this._audio.pause();
            this._audio.currentTime = 0;
            this._audio.play();
        };
        cls.pause = function (){
            this._playing = false;
            if( !this._audio ) return;
            this._audio.pause();
        };
        cls.resume = function (){ // TODO HTML5外の仕様
            this._playing = true;
            if( !this._audio ) return;
            this._audio.pause();
            this._audio.play();
        };
        cls.stop = function (){ // TODO HTML5外の仕様
            this._playing = false;
            if( !this._audio ) return;
            this._audio.pause();
            this._audio.currentTime = 0;
        };
        cls.clone = function (){
            return new Audio( this.src, this.type );//TODO...
        };
    } );


    Audio.MUSIC = "music";
    Audio.SE = "se";

    return Audio;
});