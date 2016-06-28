define([
    "./display/DisplayObject",
    "./display/InteractiveObject",
    "./display/DisplayObjectContainer",
    "./display/Sprite",
    "./display/Stage",
    "./display/BitmapData",
    "./display/Bitmap",
    "./text/TextField",
    "./text/TextFieldAutoSize",
    "./text/TextFormat",
    "./text/TextFormatAlign",
    "./geom/Transform",
    "./events/InteractiveObjectTouchEvent"
],function( DisplayObject, InteractiveObject, DisplayObjectContainer, Sprite, Stage, BitmapData, Bitmap, TextField, TextFieldAutoSize, TextFormat, TextFormatAlign, Transform, InteractiveObjectTouchEvent ){

    var flash = {
        installTo: function( ctx ){

            ctx.DisplayObject = DisplayObject;
            ctx.InteractiveObject = InteractiveObject;
            ctx.DisplayObjectContainer = DisplayObjectContainer;
            ctx.Sprite = Sprite;
            ctx.Stage = Stage;
            ctx.BitmapData = BitmapData;
            ctx.Bitmap = Bitmap;


            // text
            ctx.TextField = TextField;
            ctx.TextFieldAutoSize = TextFieldAutoSize;
            ctx.TextFormat = TextFormat;
            ctx.TextFormatAlign = TextFormatAlign;

            // geom
            ctx.Transform = Transform;

            // event
            ctx.InteractiveObjectTouchEvent = InteractiveObjectTouchEvent;
        },
        initJs: function( ctx ){

            ctx.Event.ENTER_FRAME = "enterFrame";
            ctx.Event.EXIT_FRAME = "exitFrame";
        }
    };

    return flash;
});