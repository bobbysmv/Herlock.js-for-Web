define([
    "lib/Class"
],function( Class ){

    var Scissor = Class( Object, function( cls, parent ){

        cls.constructor = function( x, y, w, h, already ){
            parent.constructor.apply(this,arguments);
            this._x=x;this._y=y;this._w=w;this._h=h;
            if( already ) Scissor._current = this;
        };

        cls.enable = function() {
            if( !this.isEmpty() ) {
                gl.enable( gl.SCISSOR_TEST );
                gl.scissor( this._x,this._y,this._w,this._h ); checkGlError("glScissor");
            }
            Scissor._current = this;
        }
        cls.disable = function() {

            gl.disable( gl.SCISSOR_TEST ); checkGlError("glDisable");

            Scissor._current = null;
            /*current = NULL;*/
        }

        cls.isEmpty = function(){ return this._x==0 && this._y==0 && this._w ==0 && this._h ==0; };

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
            else gl.disable( gl.SCISSOR_TEST );
        };
    });

    Scissor._current = null;

    var scope = { unbind:function(){ BindStack.pop(); } };
    Scissor.BindScope = function( value ){
        BindStack.push(value);
        return scope;
    };
    Scissor.getX = function(){ return this._current == null ? 0 : this._current._x; };
    Scissor.getY = function(){ return this._current == null ? 0 : this._current._y; };
    Scissor.getWidth = function(){ return this._current == null ? 0 : this._current._w; };
    Scissor.getHeight = function(){ return this._current == null ? 0 : this._current._h; };
    Scissor.getCancelScissor = function(){
        if( !this._cancelScissor )
            this._cancelScissor = new Scissor(0,0,0,0);
        return this._cancelScissor;
    };

    return Scissor;
});