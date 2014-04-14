define([
    "lib/Class"
],function( Class ){

    var idIncrementor=0;

    var CSSRenderingObject = Class( Object, function( cls, parent ){

        cls.constructor = function(){
            parent.constructor.apply(this,arguments);


            this.element = document.createElement("div");
            this.element.style.transformOrigin = "0 0";
            this.element.style.position = "absolute";
            this.element.style.top = 0;
            this.element.style.left = 0;

            this.element.id = "CSSRO_"+idIncrementor++;

            this.style = this.element.style;

            this._cssId = null;
        };

        cls.cssId = { get: function(){ return this._cssId; }, set: function( value ){
            if( this._cssId === value ) return;
            this._cssId = value;
            this.element.className = value;
        } };
        cls.width = null;
        cls.height = null;

        cls.colorTransform = null;
        cls.blendMode = null;

        cls.maskNode = null;

        cls.clippingRect = null;


        cls.getTextureId = function(){ return this.textureId; }

    } );

    return CSSRenderingObject;
});