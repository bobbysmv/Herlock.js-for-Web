define([
    "lib/Class"
],function( Class ){

    var Point = function( x, y ){
        this.x = 0;
        this.y = 0;

        if( arguments.length>=1 ) this.x = x;
        if( arguments.length>=2 ) this.y = y;
    };
    Point.prototype = Object.create( {}, {

        add: { value: function ( p ) { return new Point(this.x+p.x, this.y+p.y); }, writable: true },
        subtract: { value: function ( p ) { return new Point(this.x-p.x, this.y-p.y); }, writable: true },
        clone: { value: function ( ) { return new Point(this.x, this.y); }, writable: true },
        equals: { value: function ( p ) { return this.x === p.x && this.y === p.y; }, writable: true },
        normalize: { value: function ( thickness ) {
            var v = Math.sqrt(this.x*this.x+this.y*this.y);
            this.x = this.x/v*thickness;
            this.y = this.y/v*thickness;
        }, writable: true },
        offset: { value: function ( p ) { this.x+=p.x; this.y+=p.y; }, writable: true },

        toString: { value: function(){ return "[object Point x=\""+this.x+"\" y=\""+this.y+"\"]"; }, writable: true }
    } );

    return Point;
});