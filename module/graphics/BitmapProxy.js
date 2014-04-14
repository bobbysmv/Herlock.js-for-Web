define([
    "lib/Class",
    "./CanvasProxy"
],function( Class, CanvasProxy ){

    var BitmapProxy = Class( Object, function( cls, parent ){

        cls.constructor = function(){
            parent.constructor.apply(this,arguments);

            var args = arguments;
            var argLen = arguments.length;

            // 管理対象 Image, Canvas

            //
            if( argLen==1 && args[0] instanceof HTMLImageElement ) {
                // image
                this._imageElm = args[0];
                return;
            }

            // canvas
            this._canvasElm = document.createElement("canvas");
            this._canvasElm.width = argLen>0? args[0]: 100;
            this._canvasElm.height = argLen>1? args[1]: 100;
        };


        cls.getCanvas = function(){
            //
            if( this._canvas == null ) this._canvas = new CanvasProxy( this );
            return this._canvas;
        };


        cls.getPixels = function(){
            if( this._imageElm ) return this._imageElm;
            return this._canvasElm;
        };

        /**
         *
         * @return {ImageData}
         */
        cls.getData = function(){
            // Element => subImageのパターン
//            if( this._imageElm ) return this._imageElm;
//            return this._canvasElm;

            // Canvas => ImageDataのパターン
            var ctx = this.getCanvas()._ctx;
            var clamped = ctx.getImageData(0,0,this.width(),this.height()).data;
            var data = new Uint8Array( this.width() * this.height() * 4 );
            for( var i = this.width() * this.height() * 4 - 1; i>=0;i-- )
                data[i] = clamped[i];
            return data;
        };

        /** 横幅取得 */
        cls.width = function(){
            if( this._imageElm ) return this._imageElm.naturalWidth;
            return this._canvasElm.width;
        };

        /** 縦幅取得 */
        cls.height = function(){
            if( this._imageElm ) return this._imageElm.naturalHeight;
            return this._canvasElm.height;
        };

        /** 複製 */
        cls.clone = function(){
            // TODO
        };
    } );

    BitmapProxy.create = function( width, height ){
        return new BitmapProxy( width, height );
    };

    return BitmapProxy;
});