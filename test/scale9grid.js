
var stg,bmp;

new Image( "./img/check.png").onload = function(){



    stg = addLayer( new Stage()).content;

    bmp = stg.addChild( new Bitmap( new BitmapData( this ) ) );

//    bmp.scale9Grid = new Rectangle( 10*1/3,10*1/3,10*1/3,10*1/3 );
    bmp.width = 100;
    bmp.height = 100;
};