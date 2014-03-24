__req.define([
    "lib/Class",
    "src/graphics/BitmapProxy",
    "src/view/gl/tile/SubImageHandle"
],function( Class, BitmapProxy, SubImageHandle ){

    function NJS$isNumber(value) { return typeof value === "number"; };
    function NJS$isBoolean(value) { return typeof value === "boolean"; };

    var BitmapData = Class( Object, function( cls, parent ){

        cls.constructor = function(){
            parent.constructor.apply(this,arguments);

            //
            var args = arguments;
            var argCount = arguments.length;
            var bitmapProxy = null;
            if( argCount>=2 && NJS$isNumber( args[0] ) && NJS$isNumber( args[1] ) ) {
                // width, height指定時
                var width = args[0];
                var height = args[1];

                // filter limitSize
                var limit = 2048 - 2; // TODO magic!
                if( width >= limit || height >= limit ) {
                    throw new Error("Argument Error. over limit size!! please 2046 > size.");
                    width = width >= limit ? limit: width;
                    height = height >= limit ? limit: height;
                }

                bitmapProxy = BitmapProxy.create( width, height );

                var transparent = true;
                var fillColor = 0xffffffff;

                if( argCount>=3 && NJS$isBoolean(args[2]) ) {
                    transparent = args[2];
                }
                if( argCount>=4 && NJS$isNumber(args[3]) ) { // TODO Stringの受け入れ
                    fillColor = args[3];
                }

                // fillColor
                var canvas = bitmapProxy.getCanvas();
                canvas.setFillColor( fillColor );
                canvas.fillRect(0,0, width, height );

//                canvas.setFillColor( 0xffffffff );//test


            } else if( argCount>=1 && args[0].isInstanceOf && args[0].isInstanceOf( Image ) ) {
                // image TODO imgだけ？ Canvasとかどうだろう

                bitmapProxy = args[0]._getBitmap();// TODO deep copy?
            } else {
                // (number,number),(image)以外
                throw new Error("Argument Error");
            }

            /** */
            this._bitmapProxy = bitmapProxy;
            /** memo GLthreadでも使用するので参照カウント管理化 */
            this._textureImageHandle = new SubImageHandle();
            this._textureImageHandle.set( bitmapProxy );
        };

        // property
        cls.width = { get: function(){ return !this._bitmapProxy? 0: this._bitmapProxy.width(); } };
        cls.height = { get: function(){ return !this._bitmapProxy? 0: this._bitmapProxy.height(); } };
        cls.transparent = { get: function(){ return true; } };
        cls.rect = { get: function(){ return new Rectangle( 0, 0, this.width, this.height ); } };
        // function
        //cls->func( "getBounds", getBounds_func );

        // @deprecated 落ちると思う
        cls.dispose = function () {
            // @deprecated
            this._bitmapProxy = null;//BitmapProxy::create(0, 0);
            this._textureImageHandle.reset();
        };



        /** MainThread enterframeの通知  再生ヘッドが新しいフレームに入るときに送出されます。 */
        cls._notifyEnterFrame = function(){};
        /** MainThread frameConstructedの通知  フレーム表示オブジェクトのコンストラクターが実行した後で、かつフレームスクリプトが実行される前に送出されます。 */
        cls._notifyFrameConstructed = function(){};
        /** MainThread フレームスクリプト実行タイミングの通知 */
        cls._notifyExecuteFrameScript = function(){};
        /** MainThread exitframeの通知  再生ヘッドが現在のフレームを終了するときに送出されます。 */
        cls._notifyExitFrame = function(){};
        /** MainThread ベクター描画タイミングの通知 */
        cls._notifyDrawVectorGraphics = function(){};

        /** */
        cls._glPrepare = function(){
            if( this._textureImageHandle.isEmpty() || this._textureImageHandle.isEmpty() ) return;
            // TexSubImage
            this._textureImageHandle.getTextureImageInfo();// 更新されていればsubImage実行 TODO スマートな実装
            //
        };


        // TODO Bitmapの参照を受け取る
        // TODO Bitmapへ自身の更新を通知
        cls._notifyUpdateForBitmap = function(){};

        /**
         * GLthread @deprecated
         */
        cls._getTextureImageInfo = function(){ return this._textureImageHandle.getTextureImageInfo(); };

        /**
         *
         */
        cls._getTextureImageHandle = function(){ return this._textureImageHandle; };


        cls.toString = function(){ return "[object BitmapData width=\""+this.width+"\" height=\""+this.height+"\"]"; }
    } );

    return BitmapData;
});