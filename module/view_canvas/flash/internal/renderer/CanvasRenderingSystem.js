define([
    "lib/Class"
],function( Class ){

/*
    // element使い回しパターン
    var CSSRenderingSystem = Class(Object, function( cls, parent ){

        cls._container = null;
        cls.width = null;
        cls.height = null;

        cls.constructor = function(){

            var s = document.createElement("style");
            document.head.appendChild(s);
            this._sheet = s.sheet;

            this._idIncrementor = 0;

            this._fragment = document.createDocumentFragment();
            this._curr=[];
            this._prev=[];

            this._elements = [];
            for( var i=0; i<100; i++ ){
                var elm = document.createElement("div");
                elm.style.display = "none";
                elm.style.transformOrigin = "0 0";
                this._elements.push(elm);
            }

            this._assignedElements = [];
        };

        cls.container = {
            get: function(){ return this._container; },
            set: function( value ){
                this._container = value;
                this._elements.forEach(function(elm){ value.appendChild(elm); });
            }
        };

        cls.putBitmapProxy = function( bitmapProxy ){
            var index = this._sheet.cssRules.length;
            var id = "texture_" + this._idIncrementor++;

            bitmapProxy.getCanvas();
            this._sheet.insertRule(
                objectToCSS( "."+id, {
                    background: "url("+ bitmapProxy._canvasElm.toDataURL() +")",
                    position: "absolute",
                    display: "block !important",
                    top: "0",
                    left: "0",
                    width: bitmapProxy.width() + "px",
                    height: bitmapProxy.height() + "px"
                } )
                , index );
            var styleRow = { id:id, index: index };
            return styleRow;
        };

        // rendering

        cls.begin = function(){
//            this._fragment = new DocumentFragment();

            for( var i in this._prevElements ) {
                var elm = this._prevElements[i];
                if( this._activeElements.indexOf(elm) === -1 ) {
                    elm.className = "";
                    elm.target.element = null;
                    elm.target = null;
                    this._elements.push(elm);
                }
            }

            this._prevElements = this._activeElements;
            this._activeElements = [];
        }

        cls.render = function( object ){
            //
            if( !object.element ) {
                object.element = this._elements.shift();
                object.element.className = object.cssId;
                object.element.target = object;
            }
            var elm = object.element;

            this._activeElements.push(elm);
            elm.style.zIndex = this._activeElements.length;

            var m = object.matrix;

            if( elm.__matrix && elm.__matrix._equal( m ) ) {
                //
            } else {
                __setTransform(elm.style,"matrix3d( "+m.a+", "+m.b+", 0, 0, "+m.c+", "+ m.d+", 0, 0, 0, 0, 1, 0, "+m.tx+", "+m.ty+", 0, 1 )");
                elm.__matrix = m.clone();
            }

            var alpha = object.colorTransform.alphaMultiplier;
            if( elm.__alpha !== alpha ) {
                elm.style.opacity = alpha;
                elm.__alpha = alpha;
            }
        }

        cls.end = function(){

        };

        cls.end_bk = function(){

            // check
            if( this._curr.length === this._prev.length ){
                var flg=true;
                for( var i =0; i<this._curr.length; i++)
                    flg = flg && this._curr[i] === this._prev[i];
                if(flg) {
                    this._prev = this._curr;
                    this._curr = [];
                    return;
                }
            }

            for(var i in this._curr)
                this._fragment.appendChild( this._curr[i] );
            // update
            this.container.innerHTML="";
            this.container.appendChild( this._fragment );
//            this._fragment = null;
            this._prev = this._curr;
            this._curr = [];
        }

    });
    var system = new CSSRenderingSystem();




    function objectToCSS( selector, obj ){
        var result = selector+"{";
        for( var k in obj ) result += ""+k+":"+obj[k]+";";
        result += "}";
        return result;
    };

*/

    // object<=>elementパターン
    var CSSRenderingSystem = Class(Object, function( cls, parent ){

        cls._container = null;
        cls.width = null;
        cls.height = null;

        cls.constructor = function(){

            this._canvas = document.createElement("canvas");
            this._ctx = this._canvas.getContext("2d");
            this._ctx.save();

            this._idIncrementor = 0;

            this._curr=[];
            this._prev=[];

            this._maskRect = null;
        };

        cls.container = { get: function(){ return this._container; }, set: function( value ) {
            this._container = value;
            this._container.appendChild( this._canvas );
        }};
        cls.width = { get: function(){ return this._width; }, set: function( value ) {
            this._width = value;
            this._canvas.width = value;
        }};
        cls.height = { get: function(){ return this._height; }, set: function( value ) {
            this._height = value;
            this._canvas.height = value;
        }};

        cls.putBitmapProxy = function( bitmapProxy ){
//            var index = this._sheet.cssRules.length;
//            var id = "texture_" + this._idIncrementor++;
//
//            this._sheet.insertRule(
//                objectToCSS( "."+id, {
//                    background: "url("+ (bitmapProxy._imageElm? bitmapProxy._imageElm.src: bitmapProxy._canvasElm.toDataURL()) +")",
//                    position: "absolute",
//                    display: "block !important",
//                    top: "0",
//                    left: "0",
//                    width: bitmapProxy.width() + "px",
//                    height: bitmapProxy.height() + "px"
//                } )
//                , index );
//
//            var styleRow = { id:id, index: index };
//            return styleRow;
        };

        // TODO rendering

        cls.render = function( object ){
            if ( !object.bitmapProxy ) return;
            //
//            var elm = object.element;
            var m = object.matrix;
            var clippingRect = object.clippingRect;
            var alpha = object.colorTransform.alphaMultiplier;
            var mask = object.maskNode;


            //
            var maskIsEmpty = !mask;
            var maskRect = null;
            if( !maskIsEmpty ) {
                maskRect = new Rectangle;
                mask.getBoundingBox( maskRect );
//                m.invert();
//                maskRect = m._calculateBoundsRect( maskRect );
                maskIsEmpty = maskRect.isEmpty();
            }

            if( maskIsEmpty ) {
                if( this._maskRect ){
                    this._ctx.restore();
                    this._ctx.save();
                    this._maskRect = null;
                }
            } else if( !this._maskRect || this._maskRect.equals(maskRect) !== true ) {
                this._ctx.setTransform.apply( this._ctx, [1,0,0,1,0,0] );
                this._ctx.beginPath();
                this._ctx.rect( maskRect.x, maskRect.y, maskRect.width, maskRect.height );
//                this._ctx.closePath();
                this._ctx.clip();
                this._maskRect = maskRect;
            }


            //
            this._ctx.globalAlpha = alpha;
            this._ctx.setTransform.apply( this._ctx, m._values );


            if ( clippingRect.isEmpty() )
                this._ctx.drawImage( object.bitmapProxy.getPixels(), 0, 0 );
            else
                this._ctx.drawImage( object.bitmapProxy.getPixels(),
                    clippingRect.x, clippingRect.y, clippingRect.width, clippingRect.height,
                    0, 0, clippingRect.width, clippingRect.height
                );

        }

        cls.begin = function(){
//            this._fragment = new DocumentFragment();

            this._ctx.restore();
            this._ctx.clearRect(0,0,this._width,this._height);
            this._ctx.save();

        }

        cls.end = function(){

            // check
            if( this._curr.length === this._prev.length ){
                var flg=true;
                for( var i =0; i<this._curr.length; i++)
                    flg = flg && this._curr[i] === this._prev[i];
                if(flg) {
                    this._prev = this._curr;
                    this._curr = [];
                    return;
                }
            }

            for(var i in this._curr)
                this._fragment.appendChild( this._curr[i] );
            // update
            this.container.innerHTML="";
            this.container.appendChild( this._fragment );
//            this._fragment = null;
            this._prev = this._curr;
            this._curr = [];
        }


    });

    function objectToCSS( selector, obj ){
        var result = selector+"{";
        for( var k in obj ) result += ""+k+":"+obj[k]+";";
        result += "}";
        return result;
    };


    var system = new CSSRenderingSystem();


    return system;
});