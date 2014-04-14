define([
    "lib/Class"
],function( Class ){

    var Shader = Class( Object, function( cls, parent ){

        cls.constructor = function(){
            parent.constructor.apply(this,arguments);
            this._built = false;
            this._programId = null;
            this._vertexShaderCode;
            this._fragmentShaderCode;
        };

        /**
         *
         */
        cls.setVertexShaderCode = function( code ) {
            if( this.isBuilt() ) return;
            this._vertexShaderCode = code;
        };
        /**
         *
         */
        cls.setFragmentShaderCode = function( code ) {
            if( this.isBuilt() ) return;
            this._fragmentShaderCode = code;
        };


        cls.build = function(){
            if( this.isBuilt() )return;
//            __sw("Shader::build");
            //
            this._programId = createProgram( this._vertexShaderCode, this._fragmentShaderCode );
            if( this._programId == -1 ) return;

            this._built = true;
            this._onBuilt();
        };

        /**
         *
         */
        cls.getProgramId = function() { return this._programId; };

        /**
         *
         */
        cls.getAttributeLocation = function( name ){
            if( this.isBuilt()!=true ) return -1;
            var result = -1;
            result = gl.getAttribLocation( this._programId, name );	checkGlError( "glGetAttribLocation" );
            return result;
        };

        /**
         *
         */
        cls.getUniformLocation = function( name ) {
            if( this.isBuilt()!=true ) return -1;
            var result = -1;
            result = gl.getUniformLocation( this._programId, name );	checkGlError( "glGetUniformLocation" );
            return result;
        };

        cls.isBuilt = function() { return this._built; };

        cls.isActive = function() { return Shader._current == this; }

        /**
         *
         */
        cls.activate = function(){
            if( this.isActive() ) return;
//            __sw("Shader::activate");
            if( this.isBuilt() != true ) this.build();
            if( this.isBuilt() != true ) return;
            //
            if( Shader._current != null ) Shader._current.deactivate();
            Shader._current = this;
            // プログラム反映
            gl.useProgram( this._programId ); checkGlError("glUseProgram");
            //
            this._onActivate();
        };

        /**
         *
         */
        cls.deactivate = function(){
            if( this.isActive() != true ) return;
//            __sw("Shader::deactivate");
            //
            //current = NULL;
            //

            //
            this._onDeactivate();
        };

        /**
         * 描画 GLThreadのみ呼び出し可能
         */
        cls.draw = function( floatBufferPtr, numOfObject ){
            //
        };


        /**
         *
         */
        cls._onBuilt = function(){};
        /**
         *
         */
        cls._onActivate = function(){};
        /**
         *
         */
        cls._onDeactivate = function(){};



    } );

    var BindStack = new (function(){
        var stack = [];
        this.push = function( val ){
            stack.push(val);
            val.activate();
        };
        this.pop = function(){
            stack.pop();
            if(stack.length>0)stack[stack.length-1].activate();
        };
    });
    Shader._current = null;

    var scope = { unbind:function(){ BindStack.pop(); } };
    Shader.BindScope = function( value ){
        BindStack.push(value);
        return scope;
    };





    /**
     * シェーダーを生成
     * @param String shaderCode
     * @param int shaderType
     * @return int shader
     * @throws Exception
     */
    function createShader( shaderCode, shaderType ) {
//        __sw( string("ShaderUtil::createProgram shaderType: ").append( StringUtil::itos( shaderType) ) );

        // シェーダの生成とコンパイル
        var shader = gl.createShader( shaderType );		checkGlError("glCreateShader");
        gl.shaderSource( shader, shaderCode );	checkGlError("glShaderSource");
        gl.compileShader( shader );						checkGlError("glCompileShader");

        // コンパイルチェック
        if( !gl.getShaderParameter( shader, gl.COMPILE_STATUS ) ){
            var log = gl.getShaderInfoLog( shader );
            console.error( log );
            return -1;
        }

        return shader;
    }

    /**
     * プログラム を生成
     * @param vertexShaderCode
     * @param fragmentShaderCode
     * @return int program
     * @throws Exception
     */
    function createProgram( vertexShaderCode, fragmentShaderCode) {
//        __sw("ShaderUtil::createProgram");

        // シェーダ生成
        var vertexShader = createShader( vertexShaderCode, gl.VERTEX_SHADER);
        var fragmentShader = createShader( fragmentShaderCode, gl.FRAGMENT_SHADER);

        // 生成チェック
        if (vertexShader==-1) {
            console.error("gl Create Vertex Shaders Failed");
            //return -1;
        }

        if (fragmentShader==-1) {
            console.error("gl Create Fragment Shaders Failed");
            //return -1;
        }

        // プログラム生成とリンク
        var program = gl.createProgram();			checkGlError("glCreateProgram");
        gl.attachShader( program, vertexShader );	checkGlError("glAttachShader");
        gl.attachShader( program, fragmentShader);	checkGlError("glAttachShader");
        gl.linkProgram( program );					checkGlError("glLinkProgram");

        // リンクエラーチェック
        var linked = gl.getProgramInfoLog( program, gl.LINK_STATUS );	checkGlError("glGetProgramiv");
        if (linked ) {
            console.error( linked );
            return -1;
        }

        // シェーダの削除
        gl.deleteShader( vertexShader );		checkGlError("glDeleteShader");
        gl.deleteShader( fragmentShader );	checkGlError("glDeleteShader");

        return program;
    }


    return Shader;
});