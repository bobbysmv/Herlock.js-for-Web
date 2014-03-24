__req.define([
    "lib/Class"
],function( Class ){

    var TextureObject = Class( Object, function( cls, parent ){

        cls.constructor = function( width, height ){
            parent.constructor.apply(this,arguments);

            this._id;
            this._width = width;
            this._height = height;

            // TODO 必要？ unitに対してobjectをバインドするタイミングでのみ使用したほうがいいのか？
            gl.activeTexture( gl.TEXTURE0 );

            // initialize
            {
                // オブジェクトを生成
                this._id = gl.createTexture();
                checkGlError("gl.createTexture");

                var bs = BindScope(this);

                // 拡縮時描画設定 default
                gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                checkGlError("gl.texParameterf");
                gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                checkGlError("gl.texParameterf");

                // テクスチャー範囲外描画設定
                gl.texParameterf( gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE );
                checkGlError("gl.texParameterf");
                gl.texParameterf( gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE );
                checkGlError("gl.texParameterf");

                // 空の画像データをオブジェクトへ登録 TODO NULLは初期化Dataとして正しくない？
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null );
//                string key( StringUtil::itos(width).append("_").append( StringUtil::itos(height) ) );
//                void* initialData = initialDataDict[key];
//                if( initialData == NULL ) {
//                    initialData = malloc( 4 * width * height );
//                    memset( initialData, 0x00, width * 4 * height );// fill
//                    initialDataDict[key] = initialData;
//                }
//                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, initialData );
                checkGlError("gl.texImage2D");

                bs.unbind();
            }

            TextureObject.put(this);
        };

        cls.getId = function(){ return this._id; };
        cls.getWidth = function(){ return this._width; };
        cls.getHeight = function(){ return this._height; };

        /**
         * @deprecated
         */
        cls.bind = function(){
//            __sw("TextureObject::bind");
            if( bindedId == this._id ) return;
            gl.bindTexture( gl.TEXTURE_2D, this._id );
            checkGlError("glBindTexture");
            bindedId = this._id;
        };
        /**
         * @deprecated
         */
        cls.unbind = function(){};

        /**
         *
         * @param {Number} offsetX
         * @param {Number} offsetY
         * @param {*} widthOrObject
         * @param {Number} [height]
         * @param {ArrayBufferView} [data]
         */
        cls.subImage2D = function( offsetX, offsetY, widthOrObject, height, data ){
            var argLen = arguments.length;
            var bs = BindScope(this);
            if( argLen>3 )
                gl.texSubImage2D( gl.TEXTURE_2D, 0, offsetX, offsetY, widthOrObject, height, gl.RGBA, gl.UNSIGNED_BYTE, data );
            else
                gl.texSubImage2D( gl.TEXTURE_2D, 0, offsetX, offsetY, gl.RGBA, gl.UNSIGNED_BYTE, widthOrObject );
            checkGlError("glTexSubImage2D");
            bs.unbind();
        };

    } );

    var bindedId;

    var BindStack = new (function(){
        var stack = [];
        this.push = function( val ){
            stack.push(val);
            val.bind();
        };
        this.pop = function(){
            stack.pop();
            if(stack.length>0)stack[stack.length-1].bind();
        };
    });
    var scope = { unbind:function(){ BindStack.pop(); } };
    var BindScope = TextureObject.BindScope = function( viewport ){
        BindStack.push(viewport);
        return scope;
    };

    TextureObject._list = [];

    TextureObject.getById = function( id ) {
        var len = this._list.length;
        for( var i = 0; i < len; i++ )
        if( this._list[i].getId() == id )
            return this._list[i];
        return null;
    }
    TextureObject.put = function( obj ) {
        this._list.push(obj);
    }
    TextureObject.release = function( obj ) {
        var len = this._list.length;
        for( var i = 0; i < len; i++ ){
            if( this._list[i] == obj ) {
                this._list.splice( i, 1 );
                return;
            }
        }
    }

    return TextureObject;
});