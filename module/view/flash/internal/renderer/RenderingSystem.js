define([
    "lib/Class",
    "./SubImageRenderer",
    "./SubImageRendererAlpha",
    "./SubImageRendererColorTransform"
],function( Class, SubImageRenderer, SubImageRendererAlpha, SubImageRendererColorTransform ){

    var RenderingSystem = Class( Object, function( cls, parent ){

        cls.constructor = function(){
            parent.constructor.apply(this,arguments);

            this._subImage = new SubImageRenderer();
            this._subImageAlpha = new SubImageRendererAlpha();
            this._subImageColorTransform = new SubImageRendererColorTransform();

            this._currentRenderer = this._subImage;
        };

        /** */
        cls.begin = function(){};

        /** */
        cls.render = function( object ){

            var nextRenderer;

            var ct = object.colorTransform;

            if( ct._isColorTransform() ) {
                nextRenderer = this._subImageColorTransform;
            } else if( ct._isAlphaTransform() ){
                nextRenderer = this._subImageAlpha;
            } else {
                if( this._currentRenderer == this._subImageColorTransform )
                    nextRenderer = this._subImage;
                else
                    nextRenderer = this._currentRenderer;
            }


            if( this._currentRenderer != nextRenderer ) {
                this._currentRenderer.render();
                this._currentRenderer = nextRenderer;
            }

            var result = this._currentRenderer.accept( object );
            if( result ) return;

            this._currentRenderer.render();
            this._currentRenderer.accept( object );
        };

        /** */
        cls.end = function() {
            if( this._currentRenderer != null )
                this._currentRenderer.render();
        };
    } );
    RenderingSystem.getInstance = function () {
        if( !this._instance ) this._instance = new RenderingSystem();
        return this._instance;
    };

    return RenderingSystem;
});