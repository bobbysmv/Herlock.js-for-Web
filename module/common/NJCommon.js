define([
    "lib/Class",
    "module/NJModule",
    "module/common/event/Event",
    "module/common/event/EventDispatcher"
], function( Class, NJModule, Event, EventDispatcher ) {

    var NJCommon = Class( NJModule, function( cls, parent ){

        cls.constructor = function(){
            parent.constructor.apply(this,arguments);
        };


        cls.installTo = function( ctx ) {
            ctx.Event = Event;
            ctx.EventDispatcher = EventDispatcher;
        }

    } )

    return NJCommon;
});