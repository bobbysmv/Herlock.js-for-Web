define([
    "lib/Class",
    "module/NJModule"
],function( Class, NJModule ){

    /**
     * ブラウザ提供のUI系機能を、Herlock仕様の非同期なものへオーバーライドする
     * @class
     */
    var NJNativeUI = Class( NJModule, function( cls, parent ){

        cls.constructor = function(){
            parent.constructor.apply(this,arguments);
        };

        cls.getName = function(){ return "NativeUI"; };


        cls.installTo = function( ctx ) {

        }


        cls.initJs = function( ctx ) {

            // ブラウザ提供機能のオーバーライド
            var __alert = window.alert;
            ctx.alert = function( message, callback ){
                if( !callback ) throw new Error( "ArgumentError! alert( String, Function() );" );
                setTimeout( function(){
                    __alert( message );
                    callback();
                }, 10 );
            };

            var __confirm = window.confirm;
            ctx.confirm = function( message, callback ){
                if( !callback ) throw new Error( "ArgumentError! confirm( String, Function( boolean ) );" );
                setTimeout( function(){
                    callback( __confirm( message ) );
                }, 10 );
            };

            var __prompt = window.prompt;
            ctx.prompt = function( message, defaultValue, callback ){
                if( !callback ) throw new Error( "ArgumentError! prompt( String, String, Function( String ) );" );
                setTimeout( function(){
                    callback( __prompt( message, defaultValue ) );
                }, 10 );
            };

            ctx.picker = function( items, defaultIndex, callback ){
                if( !callback ) throw new Error( "ArgumentError! picker( Array, Number, Function( String ) );" );
                setTimeout( function(){
                    console.log( "NJNativeUI.picker ... TODO picker UI" );
                    callback( items[defaultIndex] );
                }, 10 );
            };

        }

        cls.start = function() {
            parent.start.call( this );

        }

        cls.reset = function() {

        }



    } );

    return NJNativeUI;
});