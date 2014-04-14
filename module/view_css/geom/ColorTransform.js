define([
    "lib/Class"
],function( Class ){


    // ColorIndex
    var R = 0;
    var G = 1;
    var B = 2;
    var A = 3;

    function componentsToRGB( r, g, b  ) {
        return ( r << 16 ) | ( g << 8 ) | ( b << 0 );
    }
    function RGBToARGBWithAlpha( color, alpha ) {
        return (Math.round(alpha*255) << 24) | color;
    }
    function extractAlpha( color )  { return ( color >> 24 ) & 0xFF; };
    function extractRed( color )    { return ( color >> 16 ) & 0xFF; };
    function extractGreen( color )  { return ( color >> 8 ) & 0xFF; };
    function extractBlue( color )   { return ( color >> 0 ) & 0xFF; };

    var ColorTransform = function( rm, gm, bm, am, ro, go, bo, ao ){
        var argLen = arguments.length;

        if( argLen===0 ) {
            this._version = Math.floor( Math.random() * 10000000 );
            this.__isInitialValue = true;
            this._multiplier = [1,1,1,1];
            this._offset = [0,0,0,0];
            return;
        }

        rm = argLen>0? rm: 1;
        gm = argLen>1? gm: 1;
        bm = argLen>2? bm: 1;
        am = argLen>3? am: 1;

        ro = argLen>4? ro: 0;
        go = argLen>5? go: 0;
        bo = argLen>6? bo: 0;
        ao = argLen>7? ao: 0;

        this._version = Math.floor( Math.random() * 10000000 );
        this.__isInitialValue =
            ( rm == 1 && gm == 1 && bm == 1 && am == 1 && ro == 0 && go == 0 && bo == 0 && ao == 0 );

        this._multiplier = [rm, gm, bm, am];
        this._offset = [ro,go,bo,ao];
    };
    ColorTransform.prototype = Object.create( {}, {

        _increment: { writable:true, value:function(){ this._version++; this.__isInitialValue = false; } },
        _getVersion: { writable:true, value:function(){ return this._version; } },

        _isInitialValue: { writable:true, value:function() { return this.__isInitialValue; } },


        // property

        color: { get: function () {
            return componentsToRGB( this._offset[R], this._offset[G], this._offset[B] );
        }, set: function ( value ) {
            this._multiplier[R] = 1.0;
            this._multiplier[G] = 1.0;
            this._multiplier[B] = 1.0;
            this._offset[R] = extractRed( value );
            this._offset[G] = extractGreen( value );
            this._offset[B] = extractBlue( value );

            this._increment();
        } },
        /** アルファ 乗算値 */
        alphaMultiplier: { get: function() { return this._multiplier[A]; }, set: function( value ) {
            this._multiplier[A] = value;
            this._increment();
        } },

        /** 赤 乗算値 */
        redMultiplier: { get: function() { return this._multiplier[R]; }, set: function( value ) {
            this._multiplier[R] = value;
            this._increment();
        } },

        /** 緑 乗算値 */
        greenMultiplier: { get: function() { return this._multiplier[G]; }, set: function( value ) {
            this._multiplier[G] = value;
            this._increment();
        } },

        /** 青 乗算値 */
        blueMultiplier: { get: function() { return this._multiplier[B]; }, set: function( value ) {
            this._multiplier[B] = value;
            this._increment();
        } },

        /** アルファ 加算値 */
        alphaOffset: { get: function() { return this._offset[A]; }, set: function( value ) {
            this._offset[A] = value;
            this._increment();
        } },

        /** 赤 加算値 */
        redOffset: { get: function() { return this._offset[R]; }, set: function( value ) {
            this._offset[R] = value;
            this._increment();
        } },

        /** 緑 加算値 */
        greenOffset: { get: function() { return this._offset[G]; }, set: function( value ) {
            this._offset[G] = value;
            this._increment();
        } },

        /** 青 加算値 */
        blueOffset: { get: function(){ return this._offset[B]; }, set: function( value ) {
            this._offset[B] = value;
            this._increment();
        } },


        // method

        clone: { writable:true, value:function() {
            var clone = new ColorTransform(
                this._multiplier[R], this._multiplier[G], this._multiplier[B], this._multiplier[A],
                this._offset[R], this._offset[G], this._offset[B], this._offset[A]
            );
            clone._version = this._version;
            return clone;
        }},
        concat:{ writable:true, value: function ( ct ) {
            if( ct._isInitialValue() ) return;

            if( ct._isInitialValue() ) {
                var m = ct._multiplier;
                var o = ct._offset;

                this._multiplier[R] = m[R];
                this._multiplier[G] = m[G];
                this._multiplier[B] = m[B];
                this._multiplier[A] = m[A];

                this._offset[R] = o[R];
                this._offset[G] = o[G];
                this._offset[B] = o[B];
                this._offset[A] = o[A];

                this._increment();

            } else {
                this._concat( ct._multiplier, ct._offset );
            }
        }},

        _concat: {writable:true, value: function( m, o ) {
            this._multiplier[R] *= m[R];
            this._multiplier[G] *= m[G];
            this._multiplier[B] *= m[B];
            this._multiplier[A] *= m[A];

            this._offset[R] = this._offset[R] * m[R] + o[R];
            this._offset[G] = this._offset[G] * m[G] + o[G];
            this._offset[B] = this._offset[B] * m[B] + o[B];
            this._offset[A] = this._offset[A] * m[A] + o[A];

            this._increment();
        }},


        _isAlphaTransform: { writable:true, value: function() {
            return this._multiplier[A] != 1
                && this._multiplier[R] == 1
                && this._multiplier[G] == 1
                && this._multiplier[B] == 1
                && this._offset[R] == 0
                && this._offset[G] == 0
                && this._offset[B] == 0
                && this._offset[A] == 0;
        }},
        _isColorTransform: { writable:true, value:function() { // TODO
            return !this._isInitialValue() && !this._isAlphaTransform();
        }},

        _getValueArray: { writable:true, value:function(){
            var valueArray = [];
            valueArray[0] = this._multiplier[R];
            valueArray[1] = this._multiplier[G];
            valueArray[2] = this._multiplier[B];
            valueArray[3] = this._multiplier[A];
            valueArray[4] = this._offset[R] /255;
            valueArray[5] = this._offset[G] /255;
            valueArray[6] = this._offset[B] /255;
            valueArray[7] = this._offset[A] /255;
            return valueArray;
        }}
    } );

    return ColorTransform;
});