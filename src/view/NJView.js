var gl;
function checkGlError( op ) {
    return ;

    for (var error = gl.getError(); error; error = gl.getError() ) {
        console.error( "ndk_gl after " + op + "() glError" );
        console.error( "ndk_gl       error:" + error );
//        console.error( "assert..." );
        //assert(0);
    }
}
//
window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame;

//
(function(){
    var s = document.createElement("div").style;
    var __keys = {
        transform:(
            "webkitTransform" in s ? "webkitTransform":
                "MozTransform" in s ? "MozTransform":
                    "transform"
            ),
        transformOrigin:(
            "webkitTransformOrigin" in s ? "webkitTransformOrigin":
                "MozTransformOrigin" in s ? "MozTransformOrigin":
                    "transformOrigin"
            )
    };
    if( "transformOrigin" in s ) return;
    //
    Object.defineProperties( CSSStyleDeclaration.prototype, {
        transform: { get:function(){
            return this[__keys.transform];
        }, set:function( value ){
            this[__keys.transform] = value;
        } },
        transformOrigin: { get:function(){
            return this[__keys.transformOrigin];
        }, set:function( value ){
            this[__keys.transformOrigin] = value;
        } }
    } );
})();

__req.define([
    "lib/Class",
    "src/NJModule",
    "./window/window",
    "./layer/Layer",
    "./image/Image",
    "./flash/flash",
    "./geom/geom",
    "src/view/gl/Viewport",
    "./geom/Rectangle",
    "src/view/gl/Shader",
    "src/view/touch/TouchEventInfo"
],function( Class, NJModule, window, Layer, Image, flash, geom, Viewport, Rectangle, Shader, TouchEventInfo ){

    var NJView = Class( NJModule, function( cls, parent ){

        cls.constructor = function( container, width, height ){
            parent.constructor.apply(this,arguments);

            this._container = container;

            this._width = width;
            this._height = height;

            this._layers = [];

            this._canvas = document.createElement("canvas");
            this._container.appendChild(this._canvas);
            this._canvas.width = width;
            this._canvas.height = height;
            gl = this._canvas.getContext("experimental-webgl",{ alpha: false });
            gl.clearColor( 0, 0, 0, 1 );

            var self = this;

            // draw frame TODO
            requestAnimationFrame( function(){
                self._onDrawFrame();
                requestAnimationFrame( arguments.callee );
            });

            // touch & mouse TODO
            var touchAndMouseEvantHandler = function(e){

                var actionType;
                var changedTouchesOnScreen = true;
                switch (e.type ) {
                    case "mousedown": actionType = TouchEventInfo.DOWN; break;
                    case "mousemove": actionType = TouchEventInfo.MOVE; break;
                    case "mouseup": actionType = TouchEventInfo.UP; changedTouchesOnScreen=false; break;
                    case "mouseleave": actionType = TouchEventInfo.CANCEL; changedTouchesOnScreen=false; break;
                }

                var info = new TouchEventInfo( actionType );

                if( e.type.indexOf("mouse") !== -1 ) {
                    //
                    var x = e.offsetX, y = e.offsetY;
                    if ( 'offsetX' in e !== true ) {
                        x = e.layerX - e.currentTarget.offsetLeft;
                        y = e.layerY - e.currentTarget.offsetTop;
                        if( this.style.transform!=="" ) {
                            var p = { x: x, y: y };
                            var val = this.style.transform;
                            var matrix = [];
                            val.split(",").forEach(function(value){ matrix.push( parseFloat(value) ); });
                            x = p.x*matrix[0] + p.y*matrix[2] + 1*matrix[4];
                            y = p.x*matrix[1] + p.y*matrix[3] + 1*matrix[5];
                        }
                    }
                    info.addTouchPoint( "mouse", x, y, true, changedTouchesOnScreen );
                } else {
                    // TODO touch events
//                    CGFloat scale = [iOSUtil scale];
//
//                    for( UITouch* touch in touchesForView ) {
//                        CGPoint p = [touch locationInView: controller.view ];
//                        info.addTouchPoint( touch.hash , p.x*scale, p.y*scale, false, true );
//                    }
//                    for( UITouch* touch in touches ) {
//                        CGPoint p = [touch locationInView: controller.view ];
//                        info.addTouchPoint( touch.hash , p.x*scale, p.y*scale, true, changedTouchesOnScreen );
//                    }
                }

                self._notifyTouch( info );
            }

            this._canvas.addEventListener( "mousemove", touchAndMouseEvantHandler );
            this._canvas.addEventListener( "mouseup", touchAndMouseEvantHandler );
            this._canvas.addEventListener( "mousedown", touchAndMouseEvantHandler );
            this._canvas.addEventListener( "mouseleave", touchAndMouseEvantHandler );
        };

        cls.getName = function(){ return "View"; };


        cls.installTo = function( ctx ) {
            window.installTo(ctx, this);
            ctx.Layer = Layer;
            ctx.Image = Image;
            flash.installTo(ctx);
            geom.installTo(ctx);
        }


        cls.initJs = function( ctx ) {
            window.initJs(ctx);

            flash.initJs(ctx);
            geom.initJs(ctx);
        }

        cls.start = function() {
        }

        cls.reset = function() {
        }



        cls.addLayer = function( layerOrContent ){
            return this.addLayerAt( layerOrContent, this._layers.length );
        };
        cls.addLayerAt = function( layerOrContent, index ){
            // TODO
            var layer = layerOrContent.isInstanceOf( Layer )? layerOrContent: new Layer( layerOrContent );

            if( this.getLayerIndex(layer) != -1 ) this.removeLayer(layer);

            this._layers.splice(index, 0, layer );
            layer._addedTo( this );
            // dispatch events

            return layer;
        };
        cls.getLayerAt = function( index ){ return this._layers[index]; };
        cls.getLayerIndex = function( layer ){ return this._layers.indexOf(layer); };
        cls.removeLayer = function( layer ){
            return this.removeLayerAt( this._layers.indexOf(layer) ) ;
        };
        cls.removeLayerAt = function( index ){
            var layer = this.getLayerAt(index);
            this._layers.splice( index, 1 );
            return layer;
        };


        /** */
        cls.getViewWidth = function(){ return this._width; };
        /** */
        cls.getViewHeight = function(){ return this._height; };
        /** */
        cls.getViewTop = function(){ return 0; };
        /** */
        cls.getViewLeft = function(){ return 0; };


        // internal

        cls._onDrawFrame = function(){
            //

            var renderingObjects = this._glPrepare();


            // スクリーン(platformFBO) clear
            gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT ); checkGlError("glClear");

            this._glRender( renderingObjects );

            this._notifyDrawFrame();
        };

        cls._glPrepare = function(){
            if(this._layers.length<=0) return drawPrepare(this);

            // GL 描画準備フロー 描画データの同期とテクスチャーデータ等の更新を行う
            var numOfLayers = this._layers.length;
            var renderingObjects = []; // TODO ここで？
            for( var i = 0; i < numOfLayers; i++ ) {
                var tmp = this._layers[i]._glPrepare();
                if(tmp) renderingObjects.push( tmp );
            }
            return renderingObjects;
        };
        cls._glRender = function( renderingObjects ){

            if(this._layers.length<=0) return drawRender(this);

            var numOfRenderObjects = renderingObjects.length;

            for( var i = 0; i < numOfRenderObjects; i++ )
                renderingObjects[i].processData();


            // スクリーン(platformFBO)への描画
            for( var i = 0; i < numOfRenderObjects; i++ ){
                var obj = renderingObjects[i];
                obj.render();
            }

        };
        cls._notifyDrawFrame = function () {
            for( var i in this._layers )
                this._layers[i]._notifyDrawFrame();
        };

        cls._notifyTouch = function( eventInfo ){
            //
            var copy = this._layers.slice();
            var numOfLayers = copy.length;
            for( var i = 0; i < numOfLayers; i++ )
                copy[i]._notifyTouch( eventInfo );
        };
    } );





    var M_PI = Math.PI;

    var dummyShader = null;
    var posIndex = -1;
    var colIndex = -1;
    var frameCount = 0;

    var vbo = null;

    var viewRect;
    var size;

    /** ダミー描画 @deprecated */
    function drawPrepare ( moduleObject ) {
//        __sw("drawDummyFrame");

        viewRect = new Rectangle( moduleObject.getViewLeft(), moduleObject.getViewTop(), moduleObject.getViewWidth(), moduleObject.getViewHeight() );
        size = Math.min( moduleObject.getViewWidth(), moduleObject.getViewHeight() );
    }

    /** ダミー描画 @deprecated */
    function drawRender ( moduleObject ) {
//        __sw("drawDummyFrame");

        if( dummyShader == null ) {
            // create dummy shader
            dummyShader = new Shader();
            dummyShader.setVertexShaderCode(""
                +"attribute highp vec4 a_pos;"
                +"attribute vec4 a_col;"
                +"varying vec4 v_col;"
                +""
                +"void main(void) {"
                +"  gl_Position = a_pos;"
                +"  v_col = a_col;"
                +"  gl_PointSize = 50.0;"
                +"}"
                +"");
            dummyShader.setFragmentShaderCode(""
                +"varying mediump vec4 v_col;"
                +""
                +"void main (void) {"
                +"  gl_FragColor = v_col;"
                +"}"
                +"");
            dummyShader.build();
            posIndex = dummyShader.getAttributeLocation("a_pos");
            colIndex = dummyShader.getAttributeLocation("a_col");

            dummyShader.activate();
            gl.enableVertexAttribArray( posIndex ); checkGlError("glEnableVertexAttribArray");
            gl.enableVertexAttribArray( colIndex ); checkGlError("glEnableVertexAttribArray");
        }

        // frameBuffer clear
        gl.disable( gl.SCISSOR_TEST ); checkGlError("glDisable");

        gl.clear( gl.COLOR_BUFFER_BIT );


        //glViewport( viewRect.x + ( viewRect.w - size )/2, viewRect.y + ( viewRect.h - size )/2, size, size ); checkGlError("glViewport");

        var viewport = new Viewport( viewRect.x + ( viewRect.width - size )/2, viewRect.y + ( viewRect.height - size )/2, size, size );
        var vs = Viewport.BindScope( viewport );

        var length = 12;
        var vertexs = new Array( (3+4) * length );

        // buffer 準備
        for( var i = 0; i < length; i++ ) {
            vertexs[i*7+0] = 0.5*Math.cos( (i-frameCount)/*(-frameCount/20 + i)*/ * (M_PI*2)/length );// x
            vertexs[i*7+1] = 0.5*Math.sin( (i-frameCount)/*(-frameCount/20 + i)*/ * (M_PI*2)/length );// y
            vertexs[i*7+2] = 0;// z

            var val = ((length-i)/length)*((length-i)/length);
            vertexs[i*7+3] = val;// red
            vertexs[i*7+4] = val;// green
            vertexs[i*7+5] = val;// blue
            vertexs[i*7+6] = 1;//((double)(length-i)/length)*((double)(length-i)/length);// alpha
        }

        if(!vbo) vbo = gl.createBuffer();
        gl.bindBuffer( gl.ARRAY_BUFFER, vbo );
        gl.bufferData( gl.ARRAY_BUFFER, new Float32Array(vertexs), gl.STATIC_DRAW );

        dummyShader.activate();

        gl.vertexAttribPointer(posIndex, 3, gl.FLOAT, false, 4*7, 0); checkGlError("glVertexAttribPointer");

        gl.vertexAttribPointer(colIndex, 4, gl.FLOAT, false, 4*7, 3*4); checkGlError("glVertexAttribPointer");

        gl.drawArrays(gl.POINTS, 0, length);
//        __sw_push("draw");

        frameCount++;
        vs.unbind();
    }




    return NJView;
});