__req.define([
    "lib/Class",
    "../TextureObject",
    "./Tile"
],function( Class,TextureObject, Tile ){

    var NUMBER_OF_SEGMENTS = 32 * 2;

    var MARGIN = 1;


    var TileTextureObject = Class( TextureObject, function( cls, parent ){

        cls.constructor = function( width, height ){
            parent.constructor.apply(this,arguments);

            /** タイルリスト */
            this._tiles = new Array( NUMBER_OF_SEGMENTS * NUMBER_OF_SEGMENTS );

            // 2013109 float -> int
            this._demands = new Array( NUMBER_OF_SEGMENTS * NUMBER_OF_SEGMENTS );


            // init tiles
            var numOfTiles = NUMBER_OF_SEGMENTS * NUMBER_OF_SEGMENTS;
            for( var i = 0; i < numOfTiles; i++ ) this._demands[i] = 0;
            //
            for( var i = 0; i < numOfTiles; i++ ) {
                var tile = this._tiles[i] = Tile.create( this );
                tile.index = i;
//                tile.demand = this._demands[i];
                tile.offsetX = i % NUMBER_OF_SEGMENTS;
                tile.offsetY = Math.floor( i / NUMBER_OF_SEGMENTS );

            }

            // init workspace
            this._workspace = new Uint8Array( 4 * Math.max( this.getWidth(), this.getHeight() ) );
        };

        cls._search = function( numOfHTiles, numOfVTiles, threshold ){

            // TODO ひどい実装を直す
            var numOfTiles = numOfHTiles * numOfVTiles;
            for ( var y=0; y < NUMBER_OF_SEGMENTS - (numOfVTiles-1); y++  ) {
                for ( var x=0; x < NUMBER_OF_SEGMENTS - (numOfHTiles-1); x++  ) {
                    //if( getTileByOffset(x, y).demand >= threshold ) continue;
                    if( this._getTileDemand(x, y) >= threshold ) continue;

                    var enable = true;
                    for( var i = 0; i < numOfTiles; i++ ) {
                        var localX = i % numOfHTiles;
                        var localY = Math.floor( i / numOfHTiles );
                        enable = enable && this._getTileDemand( x+localX, y+localY ) < threshold;
                        if( enable != true ) break;
                    }
                    if( enable ) return x + y * NUMBER_OF_SEGMENTS;
                }
            }

            return -1;
        };

        /** 指定矩形領域の確保 */
        cls.allocate = function( rect, renderingInfo, threshold ) {

            var numOfHTiles = this._coordToOffsetTileX( rect.width + MARGIN*2 );//+1;
            var numOfVTiles = this._coordToOffsetTileY( rect.height + MARGIN*2 );//+1;
            var result = this._search( numOfHTiles , numOfVTiles, threshold );
            // filter
            if( result < 0 ) return false;

            // setup info
            renderingInfo.textureObject = this;
            renderingInfo.area.x = this._tileIndexToCoordX( result ) + MARGIN;
            renderingInfo.area.y = this._tileIndexToCoordY( result ) + MARGIN;
            renderingInfo.area.width = rect.width;
            renderingInfo.area.height = rect.height;

            // assign tiles
            var offsetX = result % NUMBER_OF_SEGMENTS;
            var offsetY = Math.floor(result / NUMBER_OF_SEGMENTS);
            var len = numOfHTiles*numOfVTiles;
            renderingInfo.resetTiles( len );
            for( var i = 0; i < len; i++ ) {
                var x = i % numOfHTiles;
                var y = Math.floor( i / numOfHTiles);
                // tile設定
                var tile = this._getTileByOffset( offsetX + x, offsetY + y );
                tile.client = renderingInfo;//client;
                this._setTileDemand( offsetX + x, offsetY + y, 1 );
                renderingInfo.tiles[i] = tile;
            }

            return true;
        };

        /** 画像データを指定領域へ反映する */
        /**
         *
         * @param offsetX
         * @param offsetY
         * @param width
         * @param height
         * @param {Object} data
         */
        cls.putImage = function( offsetX, offsetY, width, height, data ){

            // TOP
            this.subImage2D( offsetX, offsetY-1, width, 1, data.subarray(0, width*4) );
            // BOTTOM
            this.subImage2D( offsetX, offsetY + height, width, 1, data.subarray( width * 4 * (height-1) ) );

            var dst = this._workspace;
            var src = data;

            var offset = 0;
            // LEFT TOP
            dst[0] = src[0+offset];
            dst[1] = src[1+offset];
            dst[2] = src[2+offset];
            dst[3] = src[3+offset];
            // LEFT
            for( var i = height-1; i >= 0 ; i-- ) {
                var index = (i+1)*4;
                var index2 = (i)*4;
                dst[index+0] = src[ 0 + width * index2 +offset];
                dst[index+1] = src[ 1 + width * index2 +offset];
                dst[index+2] = src[ 2 + width * index2 +offset];
                dst[index+3] = src[ 3 + width * index2 +offset];
            }
            // LEFT BOTTOM
            dst[(height+1)*4+0] = src[ 0 + width * (height-1)*4 +offset];
            dst[(height+1)*4+1] = src[ 1 + width * (height-1)*4 +offset];
            dst[(height+1)*4+2] = src[ 2 + width * (height-1)*4 +offset];
            dst[(height+1)*4+3] = src[ 3 + width * (height-1)*4 +offset];

            this.subImage2D( offsetX-1, offsetY-1, 1, height+2, dst.subarray( 0, (height+2)*4 ) );


            offset = (width-1)*4;
            // RIGHT TOP
            dst[0] = src[0+offset];
            dst[1] = src[1+offset];
            dst[2] = src[2+offset];
            dst[3] = src[3+offset];
            // RIGHT
            for( var i = height-1; i >= 0 ; i-- ) {
                var index = (i+1)*4;
                var index2 = (i)*4;
                dst[index+0] = src[ 0 + width * index2 +offset];
                dst[index+1] = src[ 1 + width * index2 +offset];
                dst[index+2] = src[ 2 + width * index2 +offset];
                dst[index+3] = src[ 3 + width * index2 +offset];
            }
            // RIGHT BOTTOM
            dst[(height+1)*4+0] = src[ 0 + width * (height-1)*4 +offset];
            dst[(height+1)*4+1] = src[ 1 + width * (height-1)*4 +offset];
            dst[(height+1)*4+2] = src[ 2 + width * (height-1)*4 +offset];
            dst[(height+1)*4+3] = src[ 3 + width * (height-1)*4 +offset];

            this.subImage2D( offsetX+width, offsetY-1, 1, height+2, dst.subarray( 0, (height+2)*4 ) );

            //
            this.subImage2D( offsetX, offsetY, width, height, data );
        }

        /** dev */
        cls.onNextFrame = function(){
            // A
            var numOfTiles = NUMBER_OF_SEGMENTS * NUMBER_OF_SEGMENTS;
            for( var i = 0; i < numOfTiles; i++ ) this._demands[i] -= 25;// TODO magic 400frame = 6.66sec
        };


        cls._tileIndexToCoordX = function( index ) {
            return ( index % NUMBER_OF_SEGMENTS ) / NUMBER_OF_SEGMENTS * this.getWidth();
        }
        cls._tileIndexToCoordY = function( index ) {
            return Math.floor( index / NUMBER_OF_SEGMENTS ) / NUMBER_OF_SEGMENTS * this.getHeight();
        }
        cls._coordToOffsetTileX = function( value ) {
            return Math.ceil( value / this.getWidth() * NUMBER_OF_SEGMENTS );
        }
        cls._coordToOffsetTileY = function( value ) {
            return Math.ceil( value / this.getWidth() * NUMBER_OF_SEGMENTS );
        }
        cls._getTileByCoords = function( x, y ) {
            return this._tiles[ this._coordToOffsetTileX(x) + this._coordToOffsetTileY(y) * NUMBER_OF_SEGMENTS ];
        }
        cls._getTileByOffset = function( x, y ) {
            return this._tiles[ x + y * NUMBER_OF_SEGMENTS ];
        }
        cls._getTileDemand = function( x, y ) {
            return this._demands[ x + y * NUMBER_OF_SEGMENTS ];
        }
        cls._setTileDemand = function( x, y, value ) {
            this._demands[ x + y * NUMBER_OF_SEGMENTS ] = value;
        }

    } );

    return TileTextureObject;
});