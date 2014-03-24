__req.define([
    "lib/Class",
    "src/NJModule",
    "lib/URL",
    "./audio/Audio"
], function( Class, NJModule, URL, Audio ) {

    var NJSound = Class( NJModule, function( cls, parent ){

        cls.constructor = function(){
            parent.constructor.apply(this,arguments);
        };


        cls.installTo = function( ctx ) {
            ctx.Audio = Audio;
        }

        cls.initJs = function( ctx ) {

        }

    } );

    return NJSound;
});