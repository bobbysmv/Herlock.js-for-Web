define([
    "lib/Class",
    "./Point",
    "./Rectangle"
],function( Class, Point, Rectangle ){

    var M_PI = Math.PI;
    var A = 0, B = 1, C = 2, D = 3, TX = 4, TY = 5;

    var initialValues = [1,0,0,1,0,0];

    var Matrix = function( a, b, c, d, tx, ty ){

        var argLen = arguments.length;
        if( argLen === 0 ) {
            this._values = [ 1,0,0,1,0,0 ];
            this._isInitialValue = true;
        } else {
            var values = this._values = [
                argLen > 0 ? a : 1 ,
                argLen > 1 ? b : 0 ,
                argLen > 2 ? c : 0 ,
                argLen > 3 ? d : 1 ,
                argLen > 4 ? tx : 0,
                argLen > 5 ? ty : 0
            ];
            this._isInitialValue = ( values[0]===1 && values[1]===0 && values[2]===0 && values[3]===1 && values[4]===0 && values[5]===0 );
        }

        this._version = (Math.random()*10000000) << 0;

    };
    Matrix.prototype = Object.create({}, {

        a: { get: function() { return this._values[0]; }, set: function( value ) {
            this._values[0] = value;
            this._increment();
        } },
        b: { get: function() { return this._values[1]; }, set: function( value ) {
            this._values[1] = value;
            this._increment();
        } },
        c: { get: function() { return this._values[2]; }, set: function( value ) {
            this._values[2] = value;
            this._increment();
        } },
        d: { get: function() { return this._values[3]; }, set: function( value ) {
            this._values[3] = value;
            this._increment();
        } },
        tx: { get: function() { return this._values[4]; }, set: function( value ) {
            this._values[4] = value;
            this._increment();
        } },
        ty: { get: function() { return this._values[5]; }, set: function( value ) {
            this._values[5] = value;
            this._increment();
        } },

        _increment: { value: function(){ this._version++; this._isInitialValue = false; }, writable: true },

        _getVersion: { value: function(){ return this._version; }, writable: true },

        isInitialValue: { value: function() { return this._isInitialValue; }, writable: true },

        clone: { value: function () {
            var m = new Matrix();
            m._values = this._values.slice();
            m._version = this._version;
            m._isInitialValue = this._isInitialValue;
            return m;
        }, writable: true },
        concat: { value: function ( m ) {
            if( m.isInitialValue() ) return;
            this._concat( m._values );
        }, writable: true },
        _concat: { value: function ( values ) {
            if ( this.isInitialValue() ) {
                this._values = values;
            } else {
                var a = this._values;
                var b = values;
                this._values = [
                    a[0]*b[0]  + a[1]*b[2],// + u*b[4],
                    a[0]*b[1]  + a[1]*b[3],// + u*b[5],
                    a[2]*b[0]  + a[3]*b[2],// + v*b[4],
                    a[2]*b[1]  + a[3]*b[3],// + v*b[5],
                    a[4]*b[0]  + a[5]*b[2] + /* 1* */b[4],
                    a[4]*b[1]  + a[5]*b[3] + /* 1* */b[5]
                ];
            }
            this._increment();
        }, writable: true },
        createBox: { value: function () {

        }, writable: true },
        createGradientBox: { value: function () {

        }, writable: true },
        deltaTransformPoint: { value: function () {

        }, writable: true },
        identity: { value: function () {
            this._values = [1,0,0,1,0,0];
            this._increment();
            this._isInitialValue = true;
        }, writable: true },
        invert: { value: function () {
            var det = this.a * this.d - this.c * this.b;
            if (det === 0) return ;
            var rdet = 1 / det;
            var t = this.tx;
            this.tx = (this.c * this.ty - t * this.d) * rdet;
            this.ty = (t * this.b - this.a * this.ty) * rdet;
            this.c = -this.c * rdet;
            this.b = -this.b * rdet;
            t = this.a;
            this.a = this.d * rdet;
            this.d = t * rdet;

            this._increment();
        }, writable: true },
        rotate: { value: function (radian) {
            var c = Math.cos( radian );
            var s = Math.sin( radian );
            this._concat( [c, s, -s, c, 0, 0] );
        }, writable: true },
        scale: { value: function (x,y) {
            this._concat( [x, 0, 0, y, 0, 0] );
        }, writable: true },
        transformPoint: { value: function ( p ) {
            var values = this._values;
            return new Point(
                p.x*values[0] + p.y*values[2] + 1*values[4],
                p.x*values[1] + p.y*values[3] + 1*values[5]
            );
        }, writable: true },
        translate: { value: function (x,y) {
            this._concat( [1, 0, 0, 1, x, y] );
        }, writable: true },



        // internal

        _getScaleX: { value: function(){ return Math.sqrt( this.a*this.a + this.b*this.b );  }, writable: true },
        _setScaleX: { value: function( value ){
            this._increment();
            var prev = this._getScaleX();
            if ( prev > 0 ) {
                var ratio = value / prev;
                this.a *= ratio;
                this.b *= ratio;
            } else {
                // もと値が0
                var skewY = this._getSkewY_();
                this.a = Math.cos( skewY ) * value;
                this.b = Math.sin( skewY ) * value;
            }
        }, writable: true },

        _getScaleY: { value: function(){ return Math.sqrt( this.c*this.c + this.d*this.d ); }, writable: true },
        _setScaleY: { value: function( value ) {
            this._increment();
            var prev = this._getScaleY();
            if ( prev > 0 ) {
                var ratio = value / prev;
                this.c *= ratio;
                this.d *= ratio;
            } else {
                var skewX = this._getSkewX_();
                this.c = -Math.sin(skewX) * value;
                this.d = Math.cos(skewX) * value;
            }
        }, writable: true },

        _getSkewX: { value: function(){ return this._getSkewX_() * (180/M_PI); }, writable: true },
        _setSkewX: { value: function( value ){ this._setSkewX_( value*( M_PI / 180 ) ); }, writable: true },

        _getSkewY: { value: function(){ return this._getSkewY_() * (180/M_PI); }, writable: true },
        _setSkewY: { value: function( value ){ this._setSkewY_( value*( M_PI / 180 ) ); }, writable: true },

        _getRotation: { value: function(){ return this._getSkewY_()*( 180 / M_PI ); }, writable: true },
        _setRotation: { value: function(value){ this._setRotation_( value * (M_PI/180) ); }, writable: true },

        _getX: { value: function(){ return this.tx; }, writable: true },
        _setX: { value: function(value){ this.tx = value; this._increment(); }, writable: true },

        _getY: { value: function(){ return this.ty; }, writable: true },
        _setY: { value: function(value){ this.ty = value; this._increment(); }, writable: true },


        _setRotation_: { value: function( value ) {
            var oldRotation = this._getSkewY_();
            var oldSkewX = this._getSkewX_();
            this._setSkewX_( oldSkewX + value - oldRotation );
            this._setSkewY_( value );
        }, writable: true },

        _getSkewX_: { value: function(){ return Math.atan2( -this.c, this.d ); }, writable: true },
        _setSkewX_: { value: function( value ) {
            var scaleY = this._getScaleY();
            this.c = -scaleY * Math.sin( value );
            this.d = scaleY * Math.cos( value );
            this._increment();
        }, writable: true },

        _getSkewY_: { value: function(){ return Math.atan2( this.b, this.a); }, writable: true },
        _setSkewY_: { value: function( value ) {
            var scaleX = this._getScaleX();
            this.a = scaleX * Math.cos( value );
            this.b = scaleX * Math.sin( value );
            this._increment();
        }, writable: true },


        /** */
        _calculateBoundsRect: { value: function( rect ) {

            // TODO 高速化
            var transformedPoints = [
                this.transformPoint( rect.topLeft ),
                this.transformPoint( new Point( rect.right, rect.top ) ),
                this.transformPoint( new Point( rect.left, rect.bottom ) ),
                this.transformPoint( rect.bottomRight )
            ];

            var t = transformedPoints[0].y;
            var b = transformedPoints[0].y;
            var l = transformedPoints[0].x;
            var r = transformedPoints[0].x;

            for( var i = 1; i < 4; i++ ) {
                var p = transformedPoints[i];
                if( t > p.y ) t = p.y;
                if( b < p.y ) b = p.y;
                if( l > p.x ) l = p.x;
                if( r < p.x ) r = p.x;
            }

            return new Rectangle( l, t, r-l, b-t );
        }, writable: true },

        _equal: { value: function( m ){
            for( var i = 0; i < 6;i++ )
                if( this._values[i] != m._values[i] ) return false;
            return true;
        }, writable:true }
    } );

    return Matrix;
});