__req.define([
    "lib/Class",
    "src/NJModule",
    "lib/URL"
], function( Class, NJModule, URL ) {

    //
    var open = XMLHttpRequest.prototype.open;


    var NJXhr = Class( NJModule, function( cls, parent ){

        cls.constructor = function(){
            parent.constructor.apply(this,arguments);
        };


        cls.installTo = function( ctx ) {

            XMLHttpRequest.prototype.open = function( method, url, async, user, password ){
                var tmp = new URL(url);
                var ctx = window.__herlock_ctx;
                url = tmp.host===""? ctx._rootPath + tmp: tmp.toString();
                arguments[1] = url;
                open.apply( this, arguments );
            };

        }

        cls.initJs = function( ctx ) {

        }

    } );

    return NJXhr;
});