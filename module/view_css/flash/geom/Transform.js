define([
    "lib/Class"
],function( Class ){

    var Transform = Class( Object, function( cls, parent ){

        cls.constructor = function(){
            parent.constructor.apply(this,arguments);
        };

        // property
        cls.colorTransform = { get: function(){
            if( !this._owner ) return new ColorTransform();
            return this._owner._colorTransform.clone();
        }, set: function( value ){
            if( !this._owner ) return;
            !this._owner._setColorTransform( value );
        } };
        cls.concatenatedColorTransform = { get: function(){
            return ;//
        } };
        cls.concatenatedMatrix = { get: function(){
            return ;//
        } };
        cls.matrix = { get: function() {
            if( !this._owner ) return new Matrix();
            return this._owner._matrix.clone();
        }, set: function( value ) {
            if( !this._owner ) return;
            !this._owner._setMatrix( value );
        } };

        // internal

        cls._initwithOwner = function( owner ){
            this._owner = owner;
        };
        cls._getOwner = function(){ return this._owner; };

    } );

    return Transform;
});