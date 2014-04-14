define([
    "lib/Class",
    "./Event"
],function( Class, Evnet ){

    var EventDispatcher = Class( Object, function( cls, parent ){

        cls.constructor = function(){
            parent.constructor.apply(this,arguments);

            this._dictionary = {};
        };
        
        cls.addEventListener = function( type, func, useCapture ){
            useCapture = !!useCapture;
            if( !this._dictionary[type] ) this._dictionary[type] = [];
            this._dictionary[type].push( { func:func, useCapture:useCapture } );
        };
        cls.removeEventListener = function( type, func, useCapture ){
            useCapture = !!useCapture;
            if( !this._dictionary[type] ) return;
            var listeners = this._dictionary[type];
            for( var i = listeners.length-1; i>=0; i-- ){
                if( listeners[i].func === func && listeners[i].useCapture === useCapture ){
                    listeners.splice( i, 1 );
                    return;
                }
            }
        };
        cls.dispatchEvent = function( event ){
            event._setEventPhase( Event.AT_TARGET );
            this._setEventTarget( event );
            this._setEventCurrentTarget( event );
            this._callListeners( event );
        };

        // custom
        cls.removeAllEventListeners = function(){
            this._dictionary = {};
        };


        // internal

        cls._hasEventListener = function( type ){
            var listeners = this._dictionary[type];
            if( !listeners ) return false;
            if( listeners.length <= 0 ) return false;
            return true;
        };

        cls._propagateEvent = function( event, list ) {
//            __sw( "EventDispatcher::propagateEvent" );
            var numOfList = list.length;

            event._setTarget(this);

            // capturing
            event._setEventPhase( Event.CAPTURING_PHASE );
            for( var i = 0; i < numOfList-1; i++ ) {
                var dispatcher = list[i];
                dispatcher._setEventCurrentTarget(event);
                event._onPropagate( list, i );
                dispatcher._callListeners( event, true, dispatcher );

                if( event._isPropagationStopped() ) return;// 中断
            }

            // target
            event._setEventPhase( Event.AT_TARGET );
            var dispatcher = list[ numOfList-1 ];
            dispatcher._setEventCurrentTarget(event);
            event._onPropagate( list, numOfList-1 );
            dispatcher._callListeners( event, false, dispatcher );

            if( event._isPropagationStopped() ) return;// 中断

            // filter
            if( event.bubbles != true ) return;

            // bubbling
            event._setEventPhase( Event.BUBBLING_PHASE );
            for( var i = numOfList-2; i >= 0; i-- ) {
                var dispatcher = list[i];
                dispatcher._setEventCurrentTarget(event);
                event._onPropagate( list, i );
                dispatcher._callListeners( event, false, dispatcher );

                if( event._isPropagationStopped() ) return;// 中断
            }
        };

        cls._callHandler = function( handlerName, event ) {
            if( this[ handlerName ] )
                this[ handlerName ]( event );
        }


        cls._dispatchEventAndCallHandler = function( event ){
            this.dispatchEvent( event );
            this._callHandler( "on" + event.type, event );
        };

        cls._callListeners = function( event, capture, caller ) {
//            __sw( "EventDispatcher::callListeners" );
            var argLen = arguments.length;
            capture = argLen>1? capture: false;
            caller = argLen>2? caller: this;

//            if( this._hasEventListener( event.type ) !== true ) return;

            // iterator利用時の要素変更への対応
            var listeners = this._dictionary[ event.type ];
            if( !listeners ) return;

            for( var i = 0; i < listeners.length; i++ ) {
                var listener = listeners[i];
                if( !listener ) {
                    //it++;
                    continue;//@deprecated
                }

                // filter
                // flashとhtmlでキャプチャーフラグ時のターゲットの挙動が違う。htmlはtarget_at = bubble||capture
                if( event.eventPhase != Event.AT_TARGET && event.bubbles && listener.useCapture != capture ) continue;

                // dispatch
                // コールバック内のthisはdispatcherになる
                listener.func.call( caller, event );

                if( event._isImmediatePropagationStopped() ) break;// 即時中断
            }
        }


        cls._setEventTarget = function( event ) {
            event._setTarget( this );
        };
        cls._setEventCurrentTarget = function( event ) {
            event._setCurrentTarget( this );
        };

        cls._numListeners = function( type ){
            if( !this._dictionary[type] ) return 0;
            return this._dictionary[type].length;
        };
    } );

    return EventDispatcher;
});