define([
    "lib/Class",
    "module/NJModule",
    "module/common/event/EventDispatcher"
],function( Class, NJModule, EventDispatcher ){

    /**
     * ローカル通知機能とInterfaceを揃えたダミー実装
     * @class
     */
    var NJLocalNotification = Class( NJModule, function( cls, parent ){

        cls.constructor = function(){
            parent.constructor.apply(this,arguments);
        };

        cls.getName = function() { return "LocalNotification";}

        cls.installTo = function( ctx ) {
            ctx.LocalNotification = LocalNotification;
        }

        cls.initJs = function( ctx ) {
            ctx.localNotification = new LocalNotification( this );
        }

        cls.reset = function() {

        }

    } );

    var LocalNotification = Class( EventDispatcher, function( cls, parent ){

        cls.constructor = function( module ){
            parent.constructor.call( this );
            this._module = module;
        };

        cls.enable = function(){};

        cls.cancelAll = function(){};

        cls.schedule = function( value, message, data ){};

    } );



    return NJLocalNotification;
});