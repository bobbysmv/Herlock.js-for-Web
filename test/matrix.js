
var stg,bmp,container;

new Image( "./img/check.png").onload = function(){

    stg = addLayer( new Stage()).content;

    container = stg.addChild( new Sprite );

    bmp = container.addChild( new Bitmap( new BitmapData( this ) ) );

    bmp.width = 100;
    bmp.height = 100;

    var i = 0;
    stg.addEventListener("enterFrame", function(){
        container.rotation++;
        container.x = i;//Math.cos(container.rotation/180)*10;
        container.y = i;//Math.sin(container.rotation/180)*10;
        if( i++ > 100) i=0;

    });
};