
var stg = addLayer( new Stage(640,640)).content;

new Image( "./img/check.png").onload = function(){

    var img = this;

    function create( x, y ) {
        var container = stg.addChild( new Sprite );
        container.rotation = 10;
        container.scaleX = 2;
//        container.scaleY = -1;
        container.x = x;
        container.y = y;
        var bmp = container.addChild( new Bitmap( new BitmapData( img ) ) );
        bmp.width = 100;
        bmp.height = 100;
//        container.transformationPoint = new Point( 5, 5 );
        container.transformationPoint = new Point( bmp.width/2, bmp.height/2 );
//        container.transform.matrix = new Matrix( 1,0.05,0.05,1,x,y );
        return container;
    }

    c1 = create(0,0);
    c2 = create(100,100);
    c3 = create(200,200);

    var p = c1.addChild(new Bitmap(new BitmapData(10,10,true,0xffff0000)));

    var i = 0;
    stg.addEventListener("enterFrame", function(){
//        if(Math.random()<0.02){
//            c1.transformationPoint = new Point( 50, 50+50*Math.sin(i*5/180) );
//            p.x = c1.transformationPoint.x;
//            p.y = c1.transformationPoint.y;
//        }
//        c1.rotation = -i;
//
//        if(Math.random()<0.02){
//            c2.transformationPoint = new Point( 50+50*Math.sin(i*5/180),50 );
//        }
//        c2.scaleX = /*i/100;//*/Math.cos(i*20/180);
//        c3.scaleY = /*i/100;//*/Math.sin(i/180);

        i++;
//        if( i++ > 100) i=0;

    });
};