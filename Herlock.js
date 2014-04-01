define(['module'], function (module) {

    /**
     *
     * @class {Herlock}
     */
    var Herlock = function( mainJsURL, options ){

        this._params = { mainJsURL:mainJsURL, options:options };

        this._iframe = document.createElement( "iframe" );
        this._iframe.width = options.width || "100%";
        this._iframe.height = options.height || "100%";
        document.body.appendChild( this._iframe );
        this._iframe.setAttribute( "seamless", true );

        var path = module.uri;
        this._iframe.src = path.substr(0,path.lastIndexOf("/")) + "/player.html";

        this._iframe.onload = (function(){
            //

        }).bind(this);

    };
    Herlock.prototype = {
        getParams: function(){ return this._params; }
    };

    return Herlock;
});