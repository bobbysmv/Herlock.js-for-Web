__req.define([
    "lib/Class"
],function( Class ){

    var SubImageRenderingObject = Class( Object, function( cls, parent ){

        cls.constructor = function(){
            parent.constructor.apply(this,arguments);

            this.vertexes = new Array(24);
        };

        cls.textureId = -1;
        cls.textureHandle = null;

        cls.colorTransform = null;
        cls.blendMode = null;

        cls.maskNode = null;

        cls.vertexes = null;


        cls.getTextureId = function(){ return this.textureId; }

    } );

    return SubImageRenderingObject;
});