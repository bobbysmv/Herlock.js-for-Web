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
        +"attribute lowp vec4 a_colorMulti;\n"
        +"attribute lowp vec4 a_colorOffset;\n"
        // テクスチャ上の対象座標% フラグメントシェーダーへ
        +"varying vec2 v_texCoords;\n"
        +"varying lowp vec4 v_colorMulti;\n"
        +"varying lowp vec4 v_colorOffset;\n"
        +"void main() {\n"
        // テクスチャー座標
        +"   v_texCoords = a_positionAndTexPoint.zw;\n" //
        +"   v_colorMulti = a_colorMulti;\n" //
        +"   v_colorOffset = a_colorOffset;\n" //
        +"   gl_Position = vec4( a_positionAndTexPoint.xy, 0, 1 );\n"
        +"}";

    var fs = ""
        +"#ifdef GL_ES\n"
        +"precision highp float;\n"
        +"#endif\n"
        // texUnitNumber
        +"uniform sampler2D u_texUnitId;\n"
        +"varying vec2 v_texCoords;\n"
        +"varying lowp vec4 v_colorMulti;\n"
        +"varying lowp vec4 v_colorOffset;\n"
        +"void main() {\n"
        // 描画色 指定座標のテクスチャーから色を取得
        +"   vec4 color = texture2D( u_texUnitId, v_texCoords );\n"
        //  for webgl
//        +"   color.rgb /= ( color.a + 0.000001 );\n"
        +"   color = color * v_colorMulti + v_colorOffset;\n"
        +"   gl_FragColor = vec4( color.rgb * color.a, color.a );\n"
        //  original
//        +"   color.rgb /= ( color.a + 0.000001 );\n"
//        +"   gl_FragColor = color * v_colorMulti + v_colorOffset;\n"

        +"}";

    var SubImageRendererColorTransform = Class( Renderer, function( cls, parent ){

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

            this._a_colorMulti = this._shader.getAttributeLocation( "a_colorMulti" );
            gl.enableVertexAttribArray( this._a_colorMulti );

            this._a_colorOffset = this._shader.getAttributeLocation( "a_colorOffset" );
            gl.enableVertexAttribArray( this._a_colorOffset );

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
            var cmBuffer = [];
            var coBuffer = [];
            for( var i = 0; i < numOfObjects; i++ ) {
                var object = this._objects[i];
                Array.prototype.push.apply( buffer, object.vertexes );
                // alpha
//                Array.prototype.push.apply( cmBuffer, [] );
//                Array.prototype.push.apply( coBuffer, [] );

                var ct = object.colorTransform._getValueArray();
                var offset = i*6*4;
                cmBuffer[ offset + 0+0*4 ] = cmBuffer[ offset + 0+1*4 ] = cmBuffer[ offset + 0+2*4 ] =
                    cmBuffer[ offset + 0+3*4 ] = cmBuffer[ offset + 0+4*4 ] = cmBuffer[ offset + 0+5*4 ] = ct[0];
                cmBuffer[ offset + 1+0*4 ] = cmBuffer[ offset + 1+1*4 ] = cmBuffer[ offset + 1+2*4 ] =
                    cmBuffer[ offset + 1+3*4 ] = cmBuffer[ offset + 1+4*4 ] = cmBuffer[ offset + 1+5*4 ] = ct[1];
                cmBuffer[ offset + 2+0*4 ] = cmBuffer[ offset + 2+1*4 ] = cmBuffer[ offset + 2+2*4 ] =
                    cmBuffer[ offset + 2+3*4 ] = cmBuffer[ offset + 2+4*4 ] = cmBuffer[ offset + 2+5*4 ] = ct[2];
                cmBuffer[ offset + 3+0*4 ] = cmBuffer[ offset + 3+1*4 ] = cmBuffer[ offset + 3+2*4 ] =
                    cmBuffer[ offset + 3+3*4 ] = cmBuffer[ offset + 3+4*4 ] = cmBuffer[ offset + 3+5*4 ] = ct[3];

                coBuffer[ offset + 0+0*4 ] = coBuffer[ offset + 0+1*4 ] = coBuffer[ offset + 0+2*4 ] =
                    coBuffer[ offset + 0+3*4 ] = coBuffer[ offset + 0+4*4 ] = coBuffer[ offset + 0+5*4 ] = ct[4];
                coBuffer[ offset + 1+0*4 ] = coBuffer[ offset + 1+1*4 ] = coBuffer[ offset + 1+2*4 ] =
                    coBuffer[ offset + 1+3*4 ] = coBuffer[ offset + 1+4*4 ] = coBuffer[ offset + 1+5*4 ] = ct[5];
                coBuffer[ offset + 2+0*4 ] = coBuffer[ offset + 2+1*4 ] = coBuffer[ offset + 2+2*4 ] =
                    coBuffer[ offset + 2+3*4 ] = coBuffer[ offset + 2+4*4 ] = coBuffer[ offset + 2+5*4 ] = ct[6];
                coBuffer[ offset + 3+0*4 ] = coBuffer[ offset + 3+1*4 ] = coBuffer[ offset + 3+2*4 ] =
                    coBuffer[ offset + 3+3*4 ] = coBuffer[ offset + 3+4*4 ] = coBuffer[ offset + 3+5*4 ] = ct[7];

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
            gl.vertexAttribPointer( this._a_positionAndTexPoint, 4, gl.FLOAT, false, 4 * 4, 0 ); checkGlError("glVertexAttribPointer");

            // cm
            if( !this._cmVBO ) this._cmVBO = gl.createBuffer();
            gl.bindBuffer( gl.ARRAY_BUFFER, this._cmVBO );
            gl.bufferData( gl.ARRAY_BUFFER, new Float32Array(cmBuffer), gl.STATIC_DRAW);
            gl.vertexAttribPointer( this._a_colorMulti, 4, gl.FLOAT, false, 4 * 4, 0 ); checkGlError("glVertexAttribPointer");

            // co
            if( !this._coVBO ) this._coVBO = gl.createBuffer();
            gl.bindBuffer( gl.ARRAY_BUFFER, this._coVBO );
            gl.bufferData( gl.ARRAY_BUFFER, new Float32Array(coBuffer), gl.STATIC_DRAW);
            gl.vertexAttribPointer( this._a_colorOffset, 4, gl.FLOAT, false, 4 * 4, 0 ); checkGlError("glVertexAttribPointer");

            // draw
            gl.drawArrays( gl.TRIANGLES, 0, numOfObjects * 6 );  checkGlError("glDrawArrays");

            //
            if( scissor!=null ) {
                scissor.disable();
                delete scissor;
            }

            // reset
            this._objects = [];
            this._textureId = -1;
            this._blendMode = BlendMode.NONE;
            this._maskNode = null;

            sb.unbind();
        }

    } );

    return SubImageRendererColorTransform;
});