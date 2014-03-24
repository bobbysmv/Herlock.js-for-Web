__req.define([
    "lib/Class",
    "./Point"
],function( Class, Point ){

    var Rectangle = Class( Object, function( cls, parent ){

        cls.constructor = function(){
            parent.constructor.apply(this,arguments);

            var argLen = arguments.length;
            if( argLen>0 ) this.x = arguments[0];
            if( argLen>1 ) this.y = arguments[1];
            if( argLen>2 ) this.width = arguments[2];
            if( argLen>3 ) this.height = arguments[3];
        };


        cls.x = 0;
        cls.y = 0;
        cls.width = 0;
        cls.height = 0;

        cls.top = {get: function(){ return this.y; }, set: function ( value ) {
            this.height += this.y - value; this.y = value;
        } };

        cls.right = {get: function(){ return this.x + this.width; }, set: function ( value ) {
            this.width += value - this.right;
        } };

        cls.bottom = {get: function(){ return this.y + this.height; }, set: function ( value ) {
            this.height += value - this.bottom;
        } };

        cls.left = {get: function(){ return this.x; }, set: function ( value ) {
            this.width += this.x - value; this.x = value;
        } };

        cls.topLeft = {get: function(){ return new Point( this.left, this.top ); }, set: function (p) {
            this.left = p.x; this.top = p.y;
        } };

        cls.bottomRight = {get: function(){ return new Point( this.right, this.bottom ); }, set: function (p) {
            this.right = p.x; this.bottom = p.y;
        } };

        cls.size = {get: function(){ return new Point( this.width, this.height ); }, set: function (p) {
            this.width = p.x; this.height = p.y;
        } };

        cls.clone = function () {
            return new Rectangle( this.x, this.y, this.width, this.height );
        };
        cls.contains = function ( x_, y_ ) {
            return ( this.left<=x_ && x_<=this.right ) && ( this.top<=y_ && y_<=this.bottom );
        };
        cls.containsPoint = function (p) {
            return this.contains( p.x, p.y );
        };
        cls.containsRect = function ( r ) {
            return ( this.top <= r.top && r.bottom <= this.bottom )
                && ( this.left <= r.left && r.right <= this.right );
        };
        cls.equals = function ( r ) {
            return ( this.x==r.x && this.y==r.y && this.width==r.width && this.height==r.height );
        };
        cls.inflate = function ( dx, dy ) {
            this.x -= dx; this.width += 2*dx; this.y -= dy; this.height += 2*dy;
        };
        cls.inflatePoint = function (p) {
            this.inflate( p.x, p.y );
        };
        cls.intersects = function ( r ) {
            // filter
            if ( this.top > r.bottom || this.left > r.right || this.right < r.left || this.bottom < r.top )
                return false;
            return true;
        };
        cls.intersection = function ( rect ) {
            // filter
            if( this.intersects( rect ) != true ) return new Rectangle();
            var t,r,b,l;
            t = this.top > rect.top ? this.top: rect.top ;
            r = this.right < rect.right ? this.right: rect.right ;
            b = this.bottom < rect.bottom ? this.bottom: rect.bottom ;
            l = this.left > rect.left ? this.left: rect.left ;
            return new Rectangle( l, t, r-l, b-t );
        };
        cls.isEmpty = function () {
            return ( this.width<=0 || this.height<=0 );
        };
        cls.offset = function ( x_, y_ ) {
            this.x+=x_; this.y+=y_;
        }
        cls.offsetPoint = function (p) {
            this.offset( p.x, p.y );
        };
        cls.setEmpty = function () {
            this.x=0;this.y=0;this.width=0;this.height=0;
        };
        cls.union = function ( rect ) {
            // filter
            if( this.isEmpty() && rect.isEmpty() ) return new Rectangle();
            if( rect.isEmpty() ) return this.clone();
            if( this.isEmpty() ) return rect.clone();
            //
            var t,r,b,l;
            t = this.top < rect.top ? this.top: rect.top ;
            r = this.right > rect.right ? this.right: rect.right ;
            b = this.bottom > rect.bottom ? this.bottom: rect.bottom ;
            l = this.left < rect.left ? this.left: rect.left ;
            return new Rectangle( l, t, r-l, b-t );
        };

        //
        cls._set = function( x,y,w,h ){
            this.x = x; this.y = y, this.width = w, this.height = h;
        };

        cls.toString = function(){ return "[object Rectangle x=\""+this.x+"\" y=\""+this.y+"\" width=\""+this.width+"\" height=\""+this.height+"\"]"; };
    } );

    return Rectangle;
});