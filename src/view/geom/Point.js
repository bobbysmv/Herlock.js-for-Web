__req.define([
    "lib/Class"
],function( Class ){

    var Point = Class( Object, function( cls, parent ){

        cls.constructor = function( x, y ){
            parent.constructor.apply(this,arguments);

            if( arguments.length>=1 ) this.x = x;
            if( arguments.length>=2 ) this.y = y;
        };

        cls.x = 0;
        cls.y = 0;

        cls.add = function ( p ) { return new Point(this.x+p.x, this.y+p.y); };
        cls.subtract = function ( p ) { return new Point(this.x-p.x, this.y-p.y); };
        cls.clone = function ( p ) { return new Point(p.x, p.y); };
        cls.equals = function ( p ) { return this.x === p.x && this.y === p.y; };
        cls.normalize = function ( thickness ) {
            var v = Math.sqrt(this.x*this.x+this.y*this.y);
            this.x = this.x/v*thickness;
            this.y = this.y/v*thickness;
        };
        cls.offset = function ( p ) { this.x+=p.x; this.y+=p.y; };

        cls.toString = function(){ return "[object Point x=\""+this.x+"\" y=\""+this.y+"\"]"; };
    } );

    return Point;
});