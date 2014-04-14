define([
    "lib/Class",
    "module/NJModule",
    "lib/URL"
], function( Class, NJModule, URL ) {


    var NJDevTools = Class( NJModule, function( cls, parent ){

        cls.constructor = function(){
            parent.constructor.apply(this,arguments);
        };


        cls.installTo = function( ctx ) {

            //

        }

        cls.initJs = function( ctx ) {

        }

    } );

    return NJDevTools;
});