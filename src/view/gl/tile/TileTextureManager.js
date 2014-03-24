__req.define([
    "lib/Class",
    "../GLUtil",
    "./TileTextureObject"
],function( Class, GLUtil, TileTextureObject ){

    var TileTextureManager = Class( Object, function( cls, parent ){

        cls.constructor = function(){
            parent.constructor.apply(this,arguments);

            this._textureSize = GLUtil.getInfo().getOptimumTextureSize();

            /** 全参照 */
            this._textures = [];

            /** 画像登録用 */
            this._imageTextures = [];
        };


        cls.getTextureObjectById = function( id ) {
            for( var i = 0; i < this._textures.length; i++ )
            if( this._textures[i].getId() == id )
                return this._textures[i];
            return null;
        }
        cls.getTextureObjectByIndex = function( index ) {
            if( this._textures.length <= index ) return null;
            return this._textures[index];
        }

        cls.getNumOfTixtures = function() {
            return this._textures.length;
        }


        cls.onNextFrame = function() {
            var len = this._textures.length;
            for( var i = 0; i < len; i++ )
                this._textures[i].onNextFrame();
        }

        cls.allocateImageArea = function( rect, renderingInfo  ) {

            // filter client size > texture size
            //  TODO 分割すれば対応可能だが・・やるかどうか。前はやってた
            if( rect.width > this._textureSize || rect.height > this._textureSize ) return console.error( "max image size: "+textureSize );
//            __sw("TileTextureManager::assign");


            // tileの空きを探し、なければTextureObjectを新しく作るか条件を緩くして再度探す
            var threshold_start = 1000;
            var threshold_span = 1000;
            var threshold_limit = 7000;
            var threshold = threshold_start;
            var assigned = false;
            while( renderingInfo.area.isEmpty() ) {
//                __sw_push("search area");
                // textureObject loop
                var len = this._imageTextures.length;
                for( var i = len-1; i >= 0; i-- ) {
                    //for( int i = 0; i < len; i++ ) {
                    var texObj = this._imageTextures[i];
                    assigned = texObj.allocate( rect, renderingInfo, threshold );
                    if( assigned ) break;
                }
                if( assigned ) break;

                threshold += threshold_span;
                if( threshold >= threshold_limit ) {
//                    __sw_push(" create texobj");
                    console.log("nj alloc texture.");
                    var texObj = new TileTextureObject( this._textureSize, this._textureSize );
                    this._textures.push( texObj );
                    this._imageTextures.push( texObj );
                    threshold = threshold_start;
                }
                // TODO 生成エラー時の妥協の仕方
            }
        }

        cls.reset = function() {
//            __sw("TileTextureManager::reset");
            var len = this._textures.size();
            for( var i = 0; i < len; i++ ) {
                var texObj = this._textures[i];
                delete texObj;
            }
            this._textures.clear();
            this._imageTextures.clear();
//            cacheTextures.clear();
//            workspaceTextures.clear();
        }

    } );

    TileTextureManager.getInstance = function() {
        if( !this._singleton ) this._singleton = new TileTextureManager();
        return this._singleton;
    }

    return TileTextureManager;
});