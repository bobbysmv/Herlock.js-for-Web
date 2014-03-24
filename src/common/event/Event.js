__req.define([
    "lib/Class"
],function( Class ){

    var Event = Class( Object, function( cls, parent ){

        cls.constructor = function( type, bubbles, cancelable ){
            parent.constructor.apply(this,arguments);

            this._type = type || "event";

            this._bubbles = arguments.length>1? bubbles: false;

            this._cancelable = arguments.length>2? cancelable: false;


            /** ネイティブな挙動をキャンセル済みかどうか */
            this._defaultPrevented = false;
            /** キャプチャー ⇒ 折り返し ⇒ バブリング のフェーズ */
            this._eventPhase = Event.NONE;
            /** 現在のイベント位置。ノードをたどるようなイベントのみが利用する */
            this._currentTarget = null;
            /** イベントを発生させたオブジェクト */
            this._target = null;
            /** イベント発生時刻 エポックタイムのミリ秒 */
            this._timeStamp = Date.now();

            /** イベント伝播をキャンセルされたかどうか */
            this._propagationStopped = false;
            /** イベント伝播を現ノードもキャンセルされたかどうか */
            this._immediatePropagationStopped = false;

        };

        cls.bubbles = { get:function(){ return this._bubbles; } };

        cls.cancelable = { get:function(){ return this._cancelable; } };

        cls.currentTarget = { get: function(){ return this._currentTarget; } };

        cls.defaultPrevented = { get: function(){ return this._defaultPrevented; } };

        cls.eventPhase = { get: function(){ return this._eventPhase; } };

        cls.target = { get: function(){ return this._target; } };

        cls.timeStamp = { get: function(){ return this._timeStamp; } };

        cls.type = { get: function(){ return this._type; } };


        // methods

        /** イベントのデフォルト動作をキャンセルできる場合に、その動作をキャンセルします。 */
        cls.preventDefault = function() {
            this._defaultPrevented = true;
        }

        /** イベントフローの現在のノードおよび後続するノードで、イベントリスナーが処理されないようにします。 */
        cls.stopImmediatePropagation = function() {
            this._propagationStopped = true;
            this._immediatePropagationStopped = true;
        }

        /** イベントフローの現在のノードに後続するノードで、イベントリスナーが処理されないようにします。 */
        cls.stopPropagation = function() {
            this._propagationStopped = true;
        }


        // internal

        cls._setEventPhase = function( value ){ this._eventPhase = value; }

        cls._setCurrentTarget = function( object ) { this._currentTarget = object; }

        cls._setTarget = function( object ) { this._target = object; }


        cls._getDefaultPrevented = function() { return this._defaultPrevented; }

        cls._isPropagationStopped = function() { return this._propagationStopped; }

        cls._isImmediatePropagationStopped = function() { return this._immediatePropagationStopped; }

        /**
         * temaplte method
         */
        cls._onPropagate = function( list, index ) {};

    } );

    Event.NONE = 1;
    Event.CAPTURING_PHASE = 1;
    Event.AT_TARGET = 2;
    Event.BUBBLING_PHASE = 3;

    return Event;
});