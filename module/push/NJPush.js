define([
    "lib/Class",
    "module/NJModule",
    "module/common/event/EventDispatcher"
],function( Class, NJModule, EventDispatcher ){

    /**
     * プッシュ通知機能とInterfaceを揃えたダミー実装
     * @class
     */
    var NJPush = Class( NJModule, function( cls, parent ){

        cls.constructor = function(){
            parent.constructor.apply(this,arguments);
        };

        cls.getName = function() { return "Push";}

        cls.installTo = function( ctx ) {
            ctx.PushNotification = PushNotification;
        }

        cls.initJs = function( ctx ) {
            ctx.pushNotification = new PushNotification( this );
        }

        cls.reset = function() {

        }

    } );

    var PushNotification = Class( EventDispatcher, function( cls, parent ){

        cls.constructor = function( module ){
            parent.constructor.call( this );
            this._module = module;
        };

        cls.generateDeviceToken = function(){
            console.log( "PushNotification.generateDeviceToken ... dummy" )
            return null;
        };


    } );



    return NJPush;
});