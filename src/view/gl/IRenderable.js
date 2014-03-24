__req.define([
    "lib/Class"
],function( Class ){

    var IRendaerable = Class( Object, function( cls, parent ){

        cls.constructor = function(){
            parent.constructor.apply(this,arguments);
        };

        cls.processData = function(){};

        cls.renderOffscreen = function(){};

        cls.render = function(){};
    } );

    return IRendaerable;
});