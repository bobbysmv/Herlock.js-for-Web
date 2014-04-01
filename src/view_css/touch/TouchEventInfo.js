__req.define([
    "lib/Class"
],function( Class ){

    // TOUCH
    var TouchEventInfo = Class( Object, function( cls, parent ){

        cls.constructor = function( action ){
            parent.constructor.apply(this,arguments);

            this._action = action;

            this._pointers = {};
        };

        /** */
        cls.getAction = function(){ return this._action; }

        /**  */
        cls.addTouchPoint = function( id, x, y, isChanged, isOnScreen ) {
            this._pointers[ id ] = TouchEventInfo.Pointer.create( id, x, y, isChanged, isOnScreen );
        }

        /** 変更のあった指の情報を取得 */
        cls.getChangedPointers = function() {
            var results = [];
            //
            for( var i in this._pointers )
                if( this._pointers[i].isChanged )
                    results.push( this._pointers[i] );

            return results;
        }
        /** 現在タッチしているすべての指の情報を取得 */
        cls.getPointersOnScreen = function() {
            var results = [];
            //
            for( var i in this._pointers )
                if( this._pointers[i].isOnScreen )
                    results.push( this._pointers[i] );

            return results;
        }

    } );
    /**
     * TODO TOUCHENDの情報はchangedTouchesにしか入らない。touches,targetTouchesは現行タッチしている指の情報だけ入る
     * １指あたりの情報
     */
    TouchEventInfo.Pointer = {
        create: function( id, x, y, isChanged, isOnScreen ){
            return {
                id: id,
                x: x, y: y,
                isChanged: isChanged,
                isOnScreen: isOnScreen
            };
        }
    };

    TouchEventInfo.NONE = 0;
    TouchEventInfo.DOWN = 1;
    TouchEventInfo.MOVE = 2;
    TouchEventInfo.UP = 3;
    TouchEventInfo.CANCEL = 4;


    return TouchEventInfo;
});