__req.define([
    "lib/Class",
    "./DisplayObject"
],function( Class, DisplayObject ){

    var InteractiveObject = Class( DisplayObject, function( cls, parent ){

        cls.constructor = function(){
            parent.constructor.apply(this,arguments);
        };

        cls.mouseEnabled = true;

    } );


    return InteractiveObject;
});