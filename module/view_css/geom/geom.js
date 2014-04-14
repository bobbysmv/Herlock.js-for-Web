define([
    "./Point",
    "./Rectangle",
    "./Matrix",
    "./ColorTransform"
],function( Point, Rectangle, Matrix, ColorTransform ){

    var geom = {
        installTo: function(ctx){
            ctx.Point = Point;
            ctx.Rectangle = Rectangle;
            ctx.Matrix = Matrix;
            ctx.ColorTransform = ColorTransform;
        },
        initJs: function(ctx){

        }
    };

    return geom;
});