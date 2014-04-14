define([
    "lib/Class"
],function( Class ){

    var Renderer = Class( Object, function( cls, parent ){

        cls.constructor = function(){
            parent.constructor.apply(this,arguments);
        };

        /** Objectの受け入れ。描画条件にそぐわなければfalseを返す */
        cls.accept = function( object ){ return false; };

        /** 描画 */
        cls.render = function(){};

        cls._getShader = function(){ return null; };

    } );

    return Renderer;
});