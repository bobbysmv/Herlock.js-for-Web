__req.define([
    "lib/Class",
    "src/common/event/Event"
],function( Class, Event ){

    var InteractiveObjectTouchEvent = Class( Event, function( cls, parent ){

        cls.constructor = function(){
            parent.constructor.apply(this,arguments);
            var argLen = arguments.length;
            var args = arguments;

            this._touchPointID = argLen>3? args[3]: 0;
            this._isPrimaryTouchPoint = argLen>4? args[4]: false;
            this._localX = argLen>5? args[5]: 0;
            this._localY = argLen>6? args[6]: 0;
        };


        cls.isPrimaryTouchPoint = { get: function(){ return this._isPrimaryTouchPoint; }, set: function( value ){
            this._isPrimaryTouchPoint = value;
        } };
        cls.localX = { get: function(){ return this._localX; }, set: function( value ){
            this._localX = value;
        } };
        cls.localY = { get: function(){ return this._localY; }, set: function( value ){
            this._localY = value;
        } };
        //cls.pressure", pressure_getter, pressure_setter );
        cls.touchPointID = { get: function(){ return this._touchPointID; }, set: function( value ){
            this._touchPointID = value;
        } };
        cls.stageX = { get: function(){
            var target = this.target;
            return target.localToGlobal( new Point( this.localX, this.localY ) ).x;
        } };
        cls.stageY = { get: function(){
            var target = this.target;
            return target.localToGlobal( new Point( this.localX, this.localY ) ).y;
        } };

        // internal
        cls._setStagePoint = function( point ){
            // TODO Androidのみの実装。保険で入れたっぽい
            return this;
        };

    } );

    return InteractiveObjectTouchEvent;
});