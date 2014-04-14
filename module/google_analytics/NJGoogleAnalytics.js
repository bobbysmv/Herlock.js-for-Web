define([
    "lib/Class",
    "module/NJModule"
], function( Class, NJModule ) {

    var NJGoogleAnalytics = Class( NJModule, function( cls, parent ){

        cls.constructor = function(){
            parent.constructor.apply(this,arguments);
        };


        cls.installTo = function( ctx ) {
        }

        cls.initJs = function( ctx ) {
            ctx.googleAnalytics = new GA();
        }

    } );

    var GA = Class( Object, function( cls, parent ){

        cls.constructor = function(){
            parent.constructor.apply(this,arguments);
        };

        cls.init = function( ua ) {
            // TODO
        }

        cls.screen = function( name ) {
            // TODO
        }

        cls.event = function() {
            // TODO
        }

    } )

    return NJGoogleAnalytics;
});