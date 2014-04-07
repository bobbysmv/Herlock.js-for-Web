__req.define([
    "lib/Class",
    "./DisplayObjectContainer"
],function( Class, DisplayObjectContainer ){

    var Sprite = Class( DisplayObjectContainer, function( cls, parent ){

        cls.constructor = function(){
            parent.constructor.apply(this,arguments);
        };

        cls.toString = function(){ return "[object Sprite name=\""+this.name+"\"]" }
    } );

    return Sprite;
});