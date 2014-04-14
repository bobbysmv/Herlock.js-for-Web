define([
    "lib/Class",
    "../../../geom/Matrix"
],function( Class, Matrix ){

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

        cls.container = null;
        cls.width = null;
        cls.height = null;

        cls.constructor = function(){

            var s = document.createElement("style");
            document.head.appendChild(s);
            this._sheet = s.sheet;

            this._matrixSheet = document.createElement("style");
            document.head.appendChild(this._matrixSheet);

            this._idIncrementor = 0;

            this._fragment = document.createDocumentFragment();
            this._curr=[];
            this._prev=[];
        };

        cls.putBitmapProxy = function( bitmapProxy ){
            var index = this._sheet.cssRules.length;
            var id = "texture_" + this._idIncrementor++;

            //bitmapProxy.getCanvas();
//            this._sheet.insertRule( "."+id + " { background:url("+ bitmapProxy._canvasElm.toDataURL() +") }", index );
            this._sheet.insertRule(
                objectToCSS( "."+id, {
                    background: "url("+ (bitmapProxy._imageElm? bitmapProxy._imageElm.src: bitmapProxy._canvasElm.toDataURL()) +")",
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

        // TODO rendering

        var dummyMatrix = new Matrix( -1,0,0,1,-100,0 );

        cls.render = function( object ){
            //
            var elm = object.element;
            var m = object.matrix;
            var style = object.style;
            if( !object.visible ) m = dummyMatrix;

            var currMatrixValues = m._values;
            var prevMatrixValues = object.__matrix_values || [];

            var matrixUpdated = prevMatrixValues[0] !== currMatrixValues[0]
                    || prevMatrixValues[1] !== currMatrixValues[1]
                    || prevMatrixValues[2] !== currMatrixValues[2]
                    || prevMatrixValues[3] !== currMatrixValues[3]
                    || prevMatrixValues[4] !== currMatrixValues[4]
                    || prevMatrixValues[5] !== currMatrixValues[5]
                ;

            if( matrixUpdated ) {
                __setTransform( style, "matrix3d( "+currMatrixValues[0].toFixed(8)+", "+currMatrixValues[1].toFixed(8)+", 0, 0, "+currMatrixValues[2].toFixed(8)+", "+ currMatrixValues[3].toFixed(8)+", 0, 0, 0, 0, 1, 0, "+currMatrixValues[4].toFixed(8)+", "+currMatrixValues[5].toFixed(8)+", 0, 1 )");
                object.__matrix_values = currMatrixValues.slice();
            }



            if( !elm.__clippingRect || !elm.__clippingRect.equals( object.clippingRect ) ) {
                if( object.clippingRect.isEmpty() ) {
                    style.width = null;
                    style.height = null;
                    style.backgroundPosition = null;
                } else {
                    // clipping TODO
                    var rect = object.clippingRect;
                    style.width = rect.width+"px";
                    style.height = rect.height+"px";
                    style.backgroundPosition = (-rect.x)+"px "+(-rect.y)+"px";
                }
                elm.__clippingRect = object.clippingRect;
            }

            var alpha = object.colorTransform.alphaMultiplier;
            if( elm.__alpha !== alpha ) {
                style.opacity = alpha;
                elm.__alpha = alpha;
            }

            this._curr.push( object.element );
        }

        cls.render_bk = function( object ){
            //
            var elm = object.element;
            var m = object.matrix;
            var style = object.style;

            if( !object.visible ) m = dummyMatrix;

            if( elm.__matrix && elm.__matrix._equal( m ) ) {
                //
            } else {
                __setTransform( style, "matrix3d( "+m.a.toFixed(8)+", "+m.b.toFixed(8)+", 0, 0, "+m.c.toFixed(8)+", "+ m.d.toFixed(8)+", 0, 0, 0, 0, 1, 0, "+m.tx.toFixed(8)+", "+m.ty.toFixed(8)+", 0, 1 )");
                elm.__matrix = m.clone();
            }

            if( !elm.__clippingRect || !elm.__clippingRect.equals( object.clippingRect ) ) {
                if( object.clippingRect.isEmpty() ) {
                    style.width = null;
                    style.height = null;
                    style.backgroundPosition = null;
                } else {
                    // clipping TODO
                    var rect = object.clippingRect;
                    style.width = rect.width+"px";
                    style.height = rect.height+"px";
                    style.backgroundPosition = (-rect.x)+"px "+(-rect.y)+"px";
                }
                elm.__clippingRect = object.clippingRect;
            }

            var alpha = object.colorTransform.alphaMultiplier;
            if( elm.__alpha !== alpha ) {
                style.opacity = alpha;
                elm.__alpha = alpha;
            }

            this._curr.push( object.element );
        }

        cls.begin = function(){
//            this._fragment = new DocumentFragment();
            this._matrixSheetTexts = [];
        }

        cls.end = function(){

//            document.head.removeChild(this._matrixSheet);
//            this._matrixSheet.innerHTML = this._matrixSheetTexts.join("");
//            document.head.appendChild(this._matrixSheet);
//            while( this._matrixSheet.sheet.cssRules[0] ) this._matrixSheet.sheet.deleteRule(0);
//            for( var i in this._matrixSheetTexts ) this._matrixSheet.sheet.insertRule( this._matrixSheetTexts[i], i );

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