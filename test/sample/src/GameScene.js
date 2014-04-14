define([
    "lib/mini"
],function( mini ){

    var GameScene = function(){
        mini.GameScene.apply( this, arguments );
    };

    GameScene.prototype = Object.create( mini.GameScene.prototype ,{

        _onPrepare: { value: function(){
            this.helpLabelExplain.y -= 10;
            this.helpContent.y += 10;
        } },

        _onShow: { value: function(){
        } },

        _onHide: { value: function(){} }

    });

    return GameScene;
});