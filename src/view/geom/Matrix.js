__req.define([
    "lib/Class",
    "./Point",
    "./Rectangle"
],function( Class, Point, Rectangle ){

    var M_PI = Math.PI;

    var Matrix = Class( Object, function( cls, parent ){

        cls._version = -1;
        cls._increment = function(){ this._version++; this._isInitialValue = false; }
        cls._getVersion = function(){ return this._version; }

        cls._isInitialValue = true;
        cls.isInitialValue = function() { return this._isInitialValue; }


        cls.constructor = function( a_, b_, c_, d_, tx_, ty_ ){
            parent.constructor.apply(this,arguments);

            var argLen = arguments.length;

            this.a = argLen>0?a_:1; this.b = argLen>1?b_:0; this.c = argLen>2?c_:0; this.d = argLen>3?d_:1; this.tx = argLen>4?tx_:0; this.ty = argLen>5?ty_:0;
            this._version = Math.floor(Math.random()*10000000);
            this._isInitialValue = ( this.a_==1 && this.b_ == 0 && this.c_ == 0 && this.d_ == 1 && this.tx_ == 0 && this.ty_ == 0 );

//            this._a = 1;
        };


//        cls.a = { get:function(){ return this._a; }, set: function( value ){
//            this._a = value;
//            if( isNaN(value) )
//                console.error(this, this._a);
//        } };
        cls.a = 1;
        cls.b = 0;
        cls.c = 0;
        cls.d = 1;
        cls.tx = 0;
        cls.ty = 0;

        cls.clone = function () {
            var m = new Matrix( this.a, this.b, this.c, this.d, this.tx, this.ty );
            m._version = this._version;
            return m;
        };
        cls.concat = function ( m ) {
            if( m.isInitialValue() ) return;

            if ( this.isInitialValue() ) {
                this.a = m.a;
                this.b = m.b;
                this.c = m.c;
                this.d = m.d;
                this.tx = m.tx;
                this.ty = m.ty;
            } else {
                var n = this.clone();
                this.a  = n.a*m.a   + n.b*m.c;// + u*m.tx;
                this.b  = n.a*m.b   + n.b*m.d;// + u*m.ty;
                this.c  = n.c*m.a   + n.d*m.c;// + v*m.tx;
                this.d  = n.c*m.b   + n.d*m.d;// + v*m.ty;
                this.tx = n.tx*m.a  + n.ty*m.c + /* 1* */m.tx;
                this.ty = n.tx*m.b  + n.ty*m.d + /* 1* */m.ty;
            }
            this._increment();
        };
        cls.createBox = function () {

        };
        cls.createGradientBox = function () {

        };
        cls.deltaTransformPoint = function () {

        };
        cls.identity = function () {
            this.a=1; this.b=0; this.c=0; this.d=1; this.tx=0; this.ty=0; this._increment(); this._isInitialValue = true;
        };
        cls.invert = function () {
            var det = this.a * this.d - this.c * this.b;
            if (det == 0) return ;
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
        };
        cls.rotate = function (radian) {
            var c = Math.cos( radian );
            var s = Math.sin( radian );
            var m = new Matrix( c, s, -s, c, 0, 0 );
            this.concat( m );
        };
        cls.scale = function (x,y) {
            this.concat( new Matrix( x, 0, 0, y, 0, 0 ) );
        };
        cls.transformPoint = function ( p ) {
            return new Point( p.x*this.a + p.y*this.c + 1*this.tx, p.x*this.b + p.y*this.d + 1*this.ty );
        };
        cls.translate = function (x,y) {
            var m = new Matrix( 1, 0, 0, 1, x, y );
            this.concat( m );
        };



        // internal

        cls._getScaleX = function(){ return Math.sqrt( this.a*this.a + this.b*this.b );  };
        cls._setScaleX = function( value ){
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
        };

        cls._getScaleY = function(){ return Math.sqrt( this.c*this.c + this.d*this.d ); };
        cls._setScaleY = function( value ) {
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
        };

        cls._getSkewX = function(){ return this._getSkewX_() * (180/M_PI); };
        cls._setSkewX = function( value ){ this._setSkewX_( value*( M_PI / 180 ) ); };

        cls._getSkewY = function(){ return this._getSkewY_() * (180/M_PI); };
        cls._setSkewY = function( value ){ this._setSkewY_( value*( M_PI / 180 ) ); };

        cls._getRotation = function(){ return this._getSkewY_()*( 180 / M_PI ); };
        cls._setRotation = function(value){ this._setRotation_( value * (M_PI/180) ); };

        cls._getX = function(){ return this.tx; };
        cls._setX = function(value){ this.tx = value; this._increment(); };

        cls._getY = function(){ return this.ty; };
        cls._setY = function(value){ this.ty = value; this._increment(); };


        cls._setRotation_ = function( value ) {
            var oldRotation = this._getSkewY_();
            var oldSkewX = this._getSkewX_();
            this._setSkewX_( oldSkewX + value - oldRotation );
            this._setSkewY_( value );
        }

        cls._getSkewX_ = function(){ return Math.atan2( -this.c, this.d ); };
        cls._setSkewX_ = function( value ) {
            var scaleY = this._getScaleY();
            this.c = -scaleY * Math.sin( value );
            this.d = scaleY * Math.cos( value );
            this._increment();
        }

        cls._getSkewY_ = function(){ return Math.atan2( this.b, this.a); };
        cls._setSkewY_ = function( value ) {
            var scaleX = this._getScaleX();
            this.a = scaleX * Math.cos( value );
            this.b = scaleX * Math.sin( value );
            this._increment();
        }


        /** */
        cls._calculateBoundsRect = function( rect ) {

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