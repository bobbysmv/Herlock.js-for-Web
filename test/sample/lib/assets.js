define([
], function( ){

    var AssetsLoader = function( assets ){
        this.list = [];
        var self = this;
        function callback() {
            if( self.list.indexOf( this ) === -1 ) return;
            self.list.splice( self.list.indexOf( this ), 1 );
            if( self.list.length <= 0 ) self.onload( self );
        }

        for( var k in assets ) {
            var asset = assets[k];
            console.log( k + " " + asset );
            this[k] = asset;
            asset.onload = callback;
            this.list.push( asset );
        }
    };

    AssetsLoader.prototype = Object.create( {}, {

        onload: { value: null, writable:true }
    });

    return AssetsLoader;

});