
var stg,bmp,mask;

new Image( "./img/check.png").onload = function(){

    stg = addLayer( new Stage()).content;


    var bmp1 = stg.addChild( new Bitmap( new BitmapData( this ) ) );
    bmp1.x = bmp1.y = 0;
    bmp1.width = 50;
    bmp1.height = 50;


    bmp = stg.addChild( new Bitmap( new BitmapData( this ) ) );
    bmp.x = bmp.y = 10;

//    bmp.scale9Grid = new Rectangle( 10*1/3,10*1/3,10*1/3,10*1/3 );
    bmp.width = 100;
    bmp.height = 100;

    // mask

    mask = stg.addChild( new Bitmap( new BitmapData(20,20,true,0xff000000) ) );
    mask.x = mask.y = 20;
    mask.visible = false;

    bmp.mask = mask;


    var bmp2 = stg.addChild( new Bitmap( new BitmapData( this ) ) );
    bmp2.x = bmp2.y = 30;
    bmp2.width = 50;
    bmp2.height = 50;

};