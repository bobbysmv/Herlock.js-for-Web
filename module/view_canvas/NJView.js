
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
    //

    if("webkitTransform" in s) window.__setTransform = function(style,value){ style.webkitTransform = value; };
    else if("MozTransform" in s) window.__setTransform = function(style,value){ style.MozTransform = value; };
    else if("transform" in s) window.__setTransform = function(style,value){ style.transform = value; };

    if( "transformOrigin" in s ) return;//IE TODO

    var impl = {};

    for( var k in __keys ) {
        (function(k,v){
            impl[k] = {
                get: function(){ return this[v]; },
                set: function(value){ this[v] = value; }
            };
        })( k, __keys[k] );
    }

    Object.defineProperties( CSSStyleDeclaration.prototype, impl );

})();

define([
    "lib/Class",
    "module/NJModule",
    "./window/window",
    "./layer/Layer",
    "./image/Image",
    "./flash/flash",
    "./geom/geom",
    "./geom/Rectangle",
    "module/view/touch/TouchEventInfo",
    "./flash/internal/renderer/CanvasRenderingSystem"
],function( Class, NJModule, window, Layer, Image, flash, geom, Rectangle, TouchEventInfo, RenderingSystem ){

    var NJView = Class( NJModule, function( cls, parent ){

        cls.constructor = function( container, width, height ){
            parent.constructor.apply(this,arguments);

            RenderingSystem.container = this._container = container;

            RenderingSystem.width = this._width = width;
            RenderingSystem.height = this._height = height;

            this._layers = [];


            var self = this;

            // draw frame TODO
            requestAnimationFrame( function(){
                self._onDrawFrame();
                requestAnimationFrame( arguments.callee );
            });
//            setInterval( function(){self._onDrawFrame();}, 1000/60 );

            // touch & mouse TODO
            var touchEnabled = false;
            var touchAndMouseEvantHandler = function(e){
                e.preventDefault();

                var actionType;
                var changedTouchesOnScreen = true;
                switch (e.type ) {
                    case "mousedown": actionType = TouchEventInfo.DOWN; break;
                    case "mousemove": actionType = TouchEventInfo.MOVE; break;
                    case "mouseup": actionType = TouchEventInfo.UP; changedTouchesOnScreen=false; break;
                    case "mouseleave": actionType = TouchEventInfo.CANCEL; changedTouchesOnScreen=false; break;

                    case "touchstart": actionType = TouchEventInfo.DOWN; break;
                    case "touchmove": actionType = TouchEventInfo.MOVE; break;
                    case "touchend": actionType = TouchEventInfo.UP; changedTouchesOnScreen=false; break;
                    case "touchcancel": actionType = TouchEventInfo.CANCEL; changedTouchesOnScreen=false; break;
                }

                var info = new TouchEventInfo( actionType );

                if( !touchEnabled && e.type.indexOf("mouse") !== -1 ) {
                    // mouse
                    var x, y;
//                    var x = e.offsetX, y = e.offsetY;
//                    if ( 'offsetX' in e !== true ) {
                        x = e.clientX - e.currentTarget.offsetLeft;
                        y = e.clientY - e.currentTarget.offsetTop;
                        if( this.style.transform!=="" ) {
                            var p = { x: x, y: y };
                            var val = this.style.transform;
                            var matrix = [];var tmp;
                            if( val.indexOf("matrix") !== -1 ) val.split(",").forEach(function(value){ matrix.push( parseFloat(value) ); });
                            if( val.indexOf("scale") !== -1 && (tmp = val.split("scale(")[1].split(",")) ) matrix = [ parseFloat(tmp[0]),0,0,parseFloat(tmp[1]),0,0 ];
                            x = p.x*matrix[0] + p.y*matrix[2] + 1*matrix[4];
                            y = p.x*matrix[1] + p.y*matrix[3] + 1*matrix[5];
                        }
//                    }
                    info.addTouchPoint( "mouse", x, y, true, changedTouchesOnScreen );

                } else if( e.type.indexOf("touch") !== -1 ){
//                    console.log( e.type );
                    touchEnabled = true;
                    // touch
                    var touches = e.touches;
                    var changedTouches = e.changedTouches;

                    for( var i=0; i<touches.length; i++ ) {
                        var touch = touches[i];

                        var x, y;
//                    var x = e.offsetX, y = e.offsetY;
//                    if ( 'offsetX' in e !== true ) {
                        x = touch.clientX - e.currentTarget.offsetLeft;
                        y = touch.clientY - e.currentTarget.offsetTop;
                        if( this.style.transform!=="" ) {
                            var p = { x: x, y: y };
                            var val = this.style.transform;
                            var matrix = [];var tmp;
                            if( val.indexOf("matrix") !== -1 ) val.split(",").forEach(function(value){ matrix.push( parseFloat(value) ); });
                            if( val.indexOf("scale") !== -1 && (tmp = val.split("scale(")[1].split(",")) ) matrix = [ parseFloat(tmp[0]),0,0,parseFloat(tmp[1]),0,0 ];
                            x = p.x*matrix[0] + p.y*matrix[2] + 1*matrix[4];
                            y = p.x*matrix[1] + p.y*matrix[3] + 1*matrix[5];
                        }
//                    }
                        info.addTouchPoint( touch.identifier , x, y, false, true );
                    }
                    for( var i=0; i<changedTouches.length; i++ ) {
                        var touch = changedTouches[i];

                        var x, y;
//                    var x = e.offsetX, y = e.offsetY;
//                    if ( 'offsetX' in e !== true ) {
                        x = touch.clientX - e.currentTarget.offsetLeft;
                        y = touch.clientY - e.currentTarget.offsetTop;
                        if( this.style.transform!=="" ) {
                            var p = { x: x, y: y };
                            var val = this.style.transform;
                            var matrix = [];var tmp;
                            if( val.indexOf("matrix") !== -1 ) val.split(",").forEach(function(value){ matrix.push( parseFloat(value) ); });
                            if( val.indexOf("scale") !== -1 && (tmp = val.split("scale(")[1].split(",")) ) matrix = [ parseFloat(tmp[0]),0,0,parseFloat(tmp[1]),0,0 ];
                            x = p.x*matrix[0] + p.y*matrix[2] + 1*matrix[4];
                            y = p.x*matrix[1] + p.y*matrix[3] + 1*matrix[5];
                        }
//                    }
                        info.addTouchPoint( touch.identifier , x, y, true, changedTouchesOnScreen );
                    }

                }

                self._notifyTouch( info );
            }

            this._container.addEventListener( "touchstart", touchAndMouseEvantHandler );
            this._container.addEventListener( "touchend", touchAndMouseEvantHandler );
            this._container.addEventListener( "touchmove", touchAndMouseEvantHandler );
            this._container.addEventListener( "touchcancel", touchAndMouseEvantHandler );

            this._container.addEventListener( "mousemove", touchAndMouseEvantHandler );
            this._container.addEventListener( "mouseup", touchAndMouseEvantHandler );
            this._container.addEventListener( "mousedown", touchAndMouseEvantHandler );
            this._container.addEventListener( "mouseleave", touchAndMouseEvantHandler );

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
            //gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT ); checkGlError("glClear");

            this._glRender( renderingObjects );

            this._notifyDrawFrame();
        };

        cls._glPrepare = function(){
            if(this._layers.length<=0) return;// drawPrepare(this);

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

            if(this._layers.length<=0) return;// drawRender(this);

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

    return NJView;
});