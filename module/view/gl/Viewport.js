define([
    "lib/Class"
],function( Class ){

    var Viewport = Class( Object, function( cls, parent ){

        cls.constructor = function( x, y, w, h, already ){
            parent.constructor.apply(this,arguments);
            this._x=x;this._y=y;this._w=w;this._h=h;
            if(already) Viewport._current = this;
        };

        cls.enable = function() {
            //@deprecated GL負荷対応
            if( Viewport._current == null || Viewport._current.equals( this._x,this._y,this._w,this._h ) != true ) {
                gl.viewport( this._x,this._y,this._w,this._h ); checkGlError("glViewport");
            }
            Viewport._current = this;
        }

        cls.equals = function( x_, y_, w_, h_ ) {
            return ( this._x==x_ && this._y==y_ && this._w==w_ && this._h==h_ );
        }

    } );

    var BindStack = new (function(){
        var stack = [];
        this.push = function( val ){
            stack.push(val);
            val.enable();
        };
        this.pop = function(){
            stack.pop();
            if(stack.length>0)stack[stack.length-1].enable();
        };
    });

    Viewport._current = null;

    var scope = { unbind:function(){ BindStack.pop(); } };
    Viewport.BindScope = function( viewport ){
        BindStack.push(viewport);
        return scope;
    };
    Viewport.getX = function(){ return this._current == null ? 0 : this._current._x; };
    Viewport.getY = function(){ return this._current == null ? 0 : this._current._y; };
    Viewport.getWidth = function(){ return this._current == null ? 0 : this._current._w; };
    Viewport.getHeight = function(){ return this._current == null ? 0 : this._current._h; };

    return Viewport;
});