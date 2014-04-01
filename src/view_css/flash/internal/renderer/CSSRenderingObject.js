__req.define([
    "lib/Class"
],function( Class ){

    var CSSRenderingObject = Class( Object, function( cls, parent ){

        cls.constructor = function(){
            parent.constructor.apply(this,arguments);

            this.element = document.createElement("div");
            this.element.style.transformOrigin = "0 0";
            this.element.style.position = "absolute";
            this.element.style.top = 0;
            this.element.style.left = 0;
        };

        cls.cssId = null;
        cls.width = null;
        cls.height = null;

        cls.colorTransform = null;
        cls.blendMode = null;

        cls.maskNode = null;


        cls.getTextureId = function(){ return this.textureId; }

    } );

    return CSSRenderingObject;
});