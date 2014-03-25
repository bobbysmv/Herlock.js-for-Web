__req.define([
    "lib/Class",
    "./Point",
    "./Rectangle"
],function( Class, Point, Rectangle ){

    var M_PI = Math.PI;
    var A = 0, B = 1, C = 2, D = 0, TX = 0, TY = 0;

    var initialValues = [1,0,0,1,0,0];

    var Matrix = function( a, b, c, d, tx, ty ){

        var argLen = arguments.length;
        var values = this._values = [
            argLen > 0 ? a : 1 ,
            argLen > 1 ? b : 0 ,
            argLen > 2 ? c : 0 ,
            argLen > 3 ? d : 1 ,
            argLen > 4 ? tx : 0,
            argLen > 5 ? ty : 0
        ];

        this._version = Math.floor(Math.random()*10000000);
        this._isInitialValue = ( values[A]===1 && values[B]===0 && values[C]===0 && values[D]===1 && values[TX]===0 && values[TY]===0 );

    };
    Matrix.prototype = Object.create({}, {

        a: { get: function() { return this._values[A]; }, set: function( value ) {
            this._values[A] = value;
            this._increment();
        } },
        b: { get: function() { return this._values[B]; }, set: function( value ) {
            this._values[B] = value;
            this._increment();
        } },
        c: { get: function() { return this._values[C]; }, set: function( value ) {
            this._values[C] = value;
            this._increment();
        } },
        d: { get: function() { return this._values[D]; }, set: function( value ) {
            this._values[D] = value;
            this._increment();
        } },
        tx: { get: function() { return this._values[TX]; }, set: function( value ) {
            this._values[TX] = value;
            this._increment();
        } },
        ty: { get: function() { return this._values[TY]; }, set: function( value ) {
            this._values[TY] = value;
            this._increment();
        } },

        increment: function(){ this._version++; this._isInitialValue = false; },

        _getVersion: function(){ return this._version; },

        isInitialValue: function() { return this._isInitialValue; },

        clone: function () {
            var m = new Matrix( this.a, this.b, this.c, this.d, this.tx, this.ty );
            m._version = this._version;
            return m;
        },
        concat: function ( m ) {
            if( m.isInitialValue() ) return;

            if ( this.isInitialValue() ) {
                this._values = m._values.slice();
            } else {
                var a = this._values;
                var b = m._values;
                this._values = [
                    a[A] * b[A] + a[B]*b[C],// + u*m.tx;
                    a[A] * b[B] + a[B]*b[B],// + u*m.ty;
                    a[C] * b[A] + a[D]*b[C],// + v*m.tx;
                    a[C] * b[B] + a[D]*b[B],// + v*m.ty;
                    a[TX]* b[A] + a[TX]*b[C] + /* 1* */b[TX],
                    a[TY]* b[B] + a[TY]*b[B] + /* 1* */b[TY]
                ];

            }
            this._increment();
        },
        _concat: function ( values ) {
            if ( this.isInitialValue() ) {
                this._values = values;
            } else {
                var a = this._values;
                var b = values;
                this._values = [
                    a[A] * b[A] + a[B]*b[C],// + u*m.tx;
                    a[A] * b[B] + a[B]*b[B],// + u*m.ty;
                    a[C] * b[A] + a[D]*b[C],// + v*m.tx;
                    a[C] * b[B] + a[D]*b[B],// + v*m.ty;
                    a[TX]* b[A] + a[TX]*b[C] + /* 1* */b[TX],
                    a[TY]* b[B] + a[TY]*b[B] + /* 1* */b[TY]
                ];

            }
            this._increment();
        },
        createBox: function () {

        },
        createGradientBox: function () {

        },
        deltaTransformPoint: function () {

        },
        identity: function () {
            this._values = [1,0,0,1,0,0];
            this._increment();
            this._isInitialValue = true;
        },
        invert: function () {
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
        },
        rotate: function (radian) {
            var c = Math.cos( radian );
            var s = Math.sin( radian );
            this._concat( [c, s, -s, c, 0, 0] );
        },
        scale: function (x,y) {
            this._concat( [x, 0, 0, y, 0, 0] );
        },
        transformPoint: function ( p ) {
            return new Point( p.x*this.a + p.y*this.c + 1*this.tx, p.x*this.b + p.y*this.d + 1*this.ty );
        },
        translate: function (x,y) {
            this._concat( [1, 0, 0, 1, x, y] );
        },



        // internal

        _getScaleX: function(){ return Math.sqrt( this.a*this.a + this.b*this.b );  },
        _setScaleX: function( value ){
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
        },

        _getScaleY: function(){ return Math.sqrt( this.c*this.c + this.d*this.d ); },
        _setScaleY: function( value ) {
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
        },

        _getSkewX: function(){ return this._getSkewX_() * (180/M_PI); },
        _setSkewX: function( value ){ this._setSkewX_( value*( M_PI / 180 ) ); },

        _getSkewY: function(){ return this._getSkewY_() * (180/M_PI); },
        _setSkewY: function( value ){ this._setSkewY_( value*( M_PI / 180 ) ); },

        _getRotation: function(){ return this._getSkewY_()*( 180 / M_PI ); },
        _setRotation: function(value){ this._setRotation_( value * (M_PI/180) ); },

        _getX: function(){ return this.tx; },
        _setX: function(value){ this.tx = value; this._increment(); },

        _getY: function(){ return this.ty; },
        _setY: function(value){ this.ty = value; this._increment(); },


        _setRotation_: function( value ) {
            var oldRotation = this._getSkewY_();
            var oldSkewX = this._getSkewX_();
            this._setSkewX_( oldSkewX + value - oldRotation );
            this._setSkewY_( value );
        },

        _getSkewX_: function(){ return Math.atan2( -this.c, this.d ); },
        _setSkewX_: function( value ) {
            var scaleY = this._getScaleY();
            this.c = -scaleY * Math.sin( value );
            this.d = scaleY * Math.cos( value );
            this._increment();
        },

        _getSkewY_: function(){ return Math.atan2( this.b, this.a); },
        _setSkewY_: function( value ) {
            var scaleX = this._getScaleX();
            this.a = scaleX * Math.cos( value );
            this.b = scaleX * Math.sin( value );
            this._increment();
        },


        /** */
        _calculateBoundsRect: function( rect ) {

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
        }
    } );

    return Matrix;
});