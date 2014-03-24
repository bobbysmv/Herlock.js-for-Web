__req.define([

],function(  ){

    var window = {
        installTo: function(ctx, module) {
            ctx.addLayer = function( layerOrContent ){
                return module.addLayer( layerOrContent );
            };
            ctx.addLayerAt = function( layerOrContent, index){
                return module.addLayer( layerOrContent, index );
            };
            ctx.getLayerAt = function( index ){
                return module.getLayerAt( index );
            };
            ctx.getLayerIndex = function( layer ){
                return module.getLayerIndex( layer );
            };
            ctx.removeLayer = function( layer ){
                return module.removeLayer( layer );
            };
            ctx.removeLayerAt = function( index ){
                return module.removeLayerAt( index );
            };
            ctx.innerWidth = module.getViewWidth();
//            ctx.innerHeigeht = module.getViewHeight();
            Object.defineProperties( ctx, {
                innerWidth:{get:function(){ return module.getViewWidth(); } },
                innerHeight:{get:function(){ return module.getViewHeight(); } }
            } );

            ctx.setOrientationType = function(){};
        },
        initJs: function(ctx) {

        }
    };

    return window;
});