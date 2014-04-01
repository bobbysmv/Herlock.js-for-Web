__req.define([
    "lib/Class"
],function( Class ){

    var CSSRenderingSystem = Class(Object, function( cls, parent ){

        cls.container = null;
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
        };

        cls.putBitmapProxy = function( bitmapProxy ){
            var index = this._sheet.cssRules.length;
            var id = "texture_" + this._idIncrementor++;

            bitmapProxy.getCanvas();
            this._sheet.insertRule( "."+id + " { background:url("+ bitmapProxy._canvasElm.toDataURL() +") }", index );
            var styleRow = { id:id, index: index };
            return styleRow;
        };

        // TODO rendering

        cls.render = function( object ){
            //
            object.element.className = object.cssId;
            object.element.style.width = object.width + "px";
            object.element.style.height = object.height + "px";
//            object.element.style.transform = "matrix( "+ object.matrix._values.join(",")+" )";
            var m = object.matrix;
            var m3d = [
                m.a, m.b, 0, 0,
                m.c, m.d, 0, 0,
                0,   0,   1, 0,
                m.tx,m.ty,0, 1
            ];
            object.element.style.transform = "matrix3d( "+ m3d.join(",")+" )";
            object.element.style.opacity = object.colorTransform.alphaMultiplier;//TODO


            this._curr.push( object.element );
        }

        cls.begin = function(){
//            this._fragment = new DocumentFragment();
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

    var system = new CSSRenderingSystem();

    return system;
});