__req.define([
    "lib/Class",
    "src/view/geom/Rectangle",
    "./TextureImageInfo",
    "./TileTextureManager"
],function( Class, Rectangle, TextureImageInfo, TileTextureManager ){


    var SubImageHandle = Class( Object, function( cls, parent ){

        /**
         * @param {BitmapProxy} client
         * @constructor
         */
        cls.constructor = function(  ){
            parent.constructor.apply(this,arguments);

            this._client = null;
            this._renderingInfo = new TextureImageInfo();
            this._rect = new Rectangle();
        };
        /** */
        cls.set = function( client_ ) {
            this._free();
            this._client = client_;
            if( this._client ) {
                this._rect.width = this._client.width();
                this._rect.height = this._client.height();
            }
        };

        cls.getTextureImageInfo = function(){
            if( this._check() != true ) {
                this._allocate();
                if( this._renderingInfo.isEmpty() )
                    console.error("getTextureImageInfo.allocate texture failed"); // TODO たまに失敗している。
            }

            this._renderingInfo.onUse();// dev
            return this._renderingInfo;
        };
        cls.refTextureImageInfo = function() {
            return this._renderingInfo;
        }


        cls.isEmpty = function() { return this._rect.isEmpty(); }
        cls.isNotEmpty = function() { return this._rect.isEmpty() != true; }


        /** 初期化 */
        cls.reset = function() {
            //
            this._rect.setEmpty();
            this._renderingInfo.reset();
        }

        /** Tileのクライアントチェック */
        cls._check = function() {
            return this._renderingInfo.checkTileClients();
        };



        /** 領域開放 */
        cls._free = function() {
            // Tileに利用終了を通達
            this._renderingInfo.reset();
        }

        /** Texture領域を確保 TilesとRenderingInfoを取得 */
        cls._allocate = function(){
            this._free();
            TileTextureManager.getInstance().allocateImageArea( this._rect, this._renderingInfo );

            if( this._renderingInfo.getTextureObject() == null )
                console.error("ImageTextureHandle::allocate texture failed");

            if( this._client ) {
                // transport
                var rect = this._renderingInfo.area;
                this._renderingInfo.textureObject.putImage( rect.x, rect.y, rect.width, rect.height, this._client.getData() );
            }
        };


    } );

    return SubImageHandle;
});