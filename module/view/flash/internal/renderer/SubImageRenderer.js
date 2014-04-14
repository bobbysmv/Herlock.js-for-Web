define([
    "lib/Class",
    "./Renderer",
    "module/view/gl/Viewport",
    "module/view/gl/Scissor",
    "module/view/gl/TextureObject",
    "module/view/gl/Shader",
    "module/view/flash/display/BlendMode"
],function( Class, Renderer, Viewport, Scissor, TextureObject, Shader, BlendMode ){


    var vs = ""
        +"#ifdef GL_ES\n"
        +"precision highp float;\n"
        +"#endif\n"
        // オブジェクト座標とテクスチャー上の座標
        +"attribute vec4 a_positionAndTexPoint;\n"
        // テクスチャ上の対象座標% フラグメントシェーダーへ
        +"varying vec2 v_texCoords;\n"
        +"void main() {\n"
        // テクスチャー座標
        +"   v_texCoords = a_positionAndTexPoint.zw;\n" //
        +"   gl_Position = vec4( a_positionAndTexPoint.xy, 0.0, 1.0 );\n"
        +"}";

    var fs = ""
        +"#ifdef GL_ES\n"
        +"precision highp float;\n"
        +"#endif\n"
        // texUnitNumber
        +"uniform sampler2D u_texUnitId;\n"
        +""
        +"varying vec2 v_texCoords;\n"
        +"void main() {\n"
        // 描画色 指定座標のテクスチャーから色を取得
        //  for webgl
        +"	vec4 color = texture2D( u_texUnitId, v_texCoords );\n"
        +"	gl_FragColor = vec4(color.rgb * color.a , color.a);\n"
        //  original
//        +"	gl_FragColor = texture2D( u_texUnitId, v_texCoords );\n"
        +"}";

    var SubImageRenderer = Class( Renderer, function( cls, parent ){

        cls.constructor = function(){
            parent.constructor.apply(this,arguments);

            this._textureId = -1;
            this._blendMode = BlendMode.NONE;
            this._maskNode = null;

            this._objects = [];
        };
        cls._getShader = function() {
//            var key = "SubImageRenderer.Shader";
//            this._shader = ShaderManager::getInstance()->get(key);
            if( this._shader != null ) return this._shader;

            this._shader = new Shader();
//            ShaderManager::getInstance()->put("SubImageRenderer.Shader", shader );


            this._shader.setVertexShaderCode( vs );
            this._shader.setFragmentShaderCode( fs );
            this._shader.build();

            var sb = Shader.BindScope( this._shader );

            this._a_positionAndTexPoint = this._shader.getAttributeLocation( "a_positionAndTexPoint" );
            gl.enableVertexAttribArray( this._a_positionAndTexPoint );

            this._u_texUnitId = this._shader.getUniformLocation( "u_texUnitId" );
            gl.uniform1i(this._u_texUnitId, 0);

            gl.enable(gl.BLEND);

            sb.unbind();

            return this._shader;
        };
        cls._getVBO = function() {
            if( this._vbo != null ) return this._vbo;
            this._vbo = gl.createBuffer();
            return this._vbo;
        }

        cls.accept = function( object ) {
            //
            if( this._textureId == -1 && this._blendMode == BlendMode.NONE ){
                this._textureId = object.getTextureId();
                this._blendMode = object.blendMode;
                this._maskNode = object.maskNode;
                this._objects.push( object );
                return true;
            }

            if( object.getTextureId() != this._textureId ) return false;
            if( object.blendMode != this._blendMode ) return false;
            if( object.maskNode != this._maskNode ) return false;

            this._objects.push( object );

            return true;
        }

        cls.render = function() {

            var numOfObjects = this._objects.length;
            if( numOfObjects <= 0 ) return;

            // setup buffer
            var buffer = [];
            for( var i = 0; i < numOfObjects; i++ ) {
                var object = this._objects[i];
                Array.prototype.push.apply(buffer, object.vertexes);
            }

            // setup shader
            var sb = Shader.BindScope( this._getShader() );
            //  blendFunc
            switch( this._blendMode ) {
                case BlendMode.ADD:
                    gl.blendFunc( gl.ONE, gl.ONE ); checkGlError("glBlendFunc");
                    break;
                case BlendMode.NORMAL:
                default:
                    gl.blendFunc( gl.ONE, gl.ONE_MINUS_SRC_ALPHA ); checkGlError("glBlendFunc");
            }

            // mask
            var scissor = null;
            if( this._maskNode ) {
                var bounds = new Rectangle;
                this._maskNode.getBoundingBox( bounds );
                // viewportの座標系へ変換
                var toViewport = new Matrix;
                toViewport.translate(1, 1);
                toViewport.scale( Viewport.getWidth()/2, Viewport.getHeight()/2 );
                bounds = toViewport._calculateBoundsRect(bounds);

                scissor = new Scissor( Math.round( bounds.x ), Math.round( bounds.y ), Math.round( bounds.width ), Math.round( bounds.height ) );
                scissor.enable();
            }

            // texture
            //glActiveTexture( GL_TEXTURE0 ); checkGlError("glActiveTexture");
            var ts = TextureObject.BindScope( TextureObject.getById( this._textureId ) );

            // vbo
            gl.bindBuffer( gl.ARRAY_BUFFER, this._getVBO() );
            gl.bufferData( gl.ARRAY_BUFFER, new Float32Array(buffer), gl.STATIC_DRAW);

            // draw
            gl.vertexAttribPointer( this._a_positionAndTexPoint, 4, gl.FLOAT, false, 4 * 4, 0 ); checkGlError("glVertexAttribPointer");
            gl.drawArrays(gl.TRIANGLES, 0, numOfObjects * 6 );  checkGlError("glDrawArrays");

            //
            if( scissor!=null ) {
                scissor.disable();
//                delete scissor;
            }

            // reset
            this._objects = [];
            this._textureId = -1;
            this._blendMode = BlendMode.NONE;
            this._maskNode = null;

            sb.unbind();
        }

    } );

    return SubImageRenderer;
});