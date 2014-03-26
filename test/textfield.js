
var stg,tf,container;

var index = 0;

stg = addLayer( new Stage(640,640)).content;

container = stg.addChild( new Sprite() );

container.addChild( test( "test test 12345 嗚呼あ", "none", false ) );
container.addChild( test( "test test 12345 嗚呼あ", "none", true ) );
container.addChild( test( "test test 12345 嗚呼あ", "left", false ) );
container.addChild( test( "test test 12345 嗚呼あ", "left", true ) );

function test( text, autoSize, wordWrap ) {
    var tf = new TextField();
    tf.defaultTextFormat = new TextFormat(null,40);
    tf.text = text;
    tf.autoSize = autoSize;
    tf.wordWrap = wordWrap;
    tf.background = true;
    tf.backgroundColor = 0xffffff;
    tf.border = true;
    tf.x = (index%5)*101;
    tf.y = Math.floor(index/5)*101;
    index++;
    return tf;
}
