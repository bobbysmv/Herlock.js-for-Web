define([
    "lib/Class"
],function( Class ){

    var TextureImageInfo = Class( Object, function( cls, parent ){

        cls.constructor = function(){
            parent.constructor.apply(this,arguments);

            this.area = new Rectangle();

            this.reset();
        };


        cls.textureObject = null;

        cls.area = null;

        /** 対象Tilesの参照 */
        cls.tiles = null;
        cls.numOfTiles = null;

        cls.resetTiles = function( length ) {
            this.numOfTiles = length;
            if( this.tiles != null ) delete this.tiles;
            this.tiles = new Array( length );
        }
        cls.clearTiles = function() {
            if( this.tiles != null ) delete this.tiles;
            this.tiles = null;
            this.numOfTiles = 0;
        }

        cls.reset = function(){

            // Tileに利用終了を通達
            for( var i = this.numOfTiles-1; i >= 0; i-- )
                if( this.tiles[i].client == this )
                    this.tiles[i].reset();

            this.textureObject = null;
            this.area.setEmpty();
            this.clearTiles();
        };

        cls.checkTileClients = function() {
            if( this.textureObject==null ) return false;

            // A
            var i = this.numOfTiles;
            while( (--i) > -1 )
                if( this.tiles[i].client != this )
                    return false;

            // B 高速化
//            var i = numOfTiles;
//            var tmp = tiles[0];
//            while( (--i) > -1 ) {
//                if( (*tmp)->client != this )
//                    return false;
//                else
//                    ++tmp;
//            }

            return true;
        }



        cls.isEmpty = function () {
            return this.textureObject == null;
        }

        cls.getTextureObject = function(){ return this.textureObject; };


        // dev
        cls.onUse = function() {
            // A
//        for( int i = numOfTiles-1; i >= 0; i-- )
//            *(tiles[i]->demand) = 1;

            // B
            for( var i = this.numOfTiles-1; i > -1; --i )
                this.tiles[i].setDemand(10000);
        }

    } );

    return TextureImageInfo;
});