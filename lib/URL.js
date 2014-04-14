define([

],function(  ){

    var URL = function( value ){

        this._protocol = null;

        this._hostname = null;
        this._port = null;

        this._pathname = null;

        this._search = null;
        this._hash = null;

        var index;

        // hash
        index = value.indexOf("#");
        if( index !== -1 ) {
            this._hash = value.substr(index+1)
            value = value.substr(0,index);
        }
        // search
        index = value.indexOf("?");
        if( index !== -1 ) {
            this._search = value.substr(index+1)
            value = value.substr(0,index);
        }
        // protocol
        index = value.indexOf("://");
        if( index === -1 ) {
            this._pathname = value;
            return;
        }
        this._protocol = value.substr(0,index);
        value = value.substr(index+3);

        // host
        index = value.indexOf("/");
        if( index === -1 ) {
            this._hostname = value;
            return;
        }
        var tmp = value.substr( 0, index );
        this._pathname = value.substr( index );

        //port
        index = tmp.indexOf(":");
        if( index !== -1 ) {
            this._port = tmp.substr( index+1 );
            tmp = tmp.substr( 0, index );
        }

        this._hostname = tmp;


    };
    URL.prototype = Object.create({},{

        hash: { get: function(){ return this._hash? "#"+this._hash: ""; }, set:function( value ){
            if( value.indexOf("#") !== -1 ) value = value.split("#")[1];
            this._hash = value;
        } },
        host: { get: function(){
            return this._hostname ? this._hostname + (this._port? ":"+this._port: "" ): "";
        }, set:function( value ){
            if( value.indexOf(":") !== -1 ) {
                var tmp = value.split(":")[0];
                value = tmp[0];
                this._port = tmp[1];
            }
            this._hostname = value;
        } },
        hostname: { get: function(){ return this._hostname? this._hostname: ""; }, set:function( value ){
            this._hostname = value;
        } },
        pathname: { get: function(){ return this._pathname? this._pathname: ""; }, set:function( value ){ this._pathname = value; } },
        port: { get: function(){ return this._port? this._port: ""; }, set:function( value ){ this._port = value; } },
        protocol: { get: function(){ return this._protocol? this._protocol+":": "" }, set:function( value ){
            this._protocol = value.split(":")[0];
        } },
        search: { get: function(){ return this._search? this._search: ""; }, set:function( value ){ this._search = value; } },


        clone: { value:function(){
            return new URL( this.toString() );
        } },

        toString: { value:function(){
            var value = "";
            if( this._protocol ) value += this._protocol+"://";
            if( this._hostname ) value += this._hostname;
            if( this._port ) value += ":"+this._port;
            if( this._pathname ) value += this._pathname;
            if( this._search ) value += "?"+this._search;
            if( this._hash ) value += "#"+this._hash;
            return value;
        }},
    });

    return URL;
});