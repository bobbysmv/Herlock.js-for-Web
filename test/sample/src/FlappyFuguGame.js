define([
    "lib/mini",
    "lib/assets"
],function ( mini, Assets ) {

    var FlappyFuguGame = function(){
        mini.Game.apply( this, arguments );

        this._score = 0;
        this._scoreView = null;

        // ゲームステージデータ frameNumber: data
        var data = this._stageData = [];

    };
    FlappyFuguGame.prototype = Object.create( mini.Game.prototype, {

        // property

        /**
         * ゲームスコア
         * TODO 汎用化できるかも
         * @type Number
         */
        score: { get: function(){ return this._score; }, set: function( value ){
            // update scoreView
            this._score = value;
            var strValue = value + "";
//            if( strValue.indexOf(".") === -1 ) strValue = strValue + ".0";
            this._scoreView.value = strValue;
            // animation
            mini.Tween.removeTweens( this._scoreView.display );

//            this._scoreView.display.scaleX =
            this._scoreView.display.scaleY = 0.8;//this._scoreView.display.scaleY + 0.10;//0.67
            this._scoreView.display.y = 47;
            mini.Tween.get( this._scoreView.display, { useTicks:true, group:"game" })
                .to({ scaleX: 0.75, scaleY: 0.75, y:50 }, 20, mini.Ease.elasticOut );
        } },
        /**
         * スコアView
         * @type mini.NumericImage
         */
        scoreView: { get: function(){ return this._scoreView; } },

        // implements

        _onPrepare: { value: function(){

            // nav
            //  背景
            var black = this.foreground.addChildAt( new Bitmap( new BitmapData( 1,1,true, 0xff000000 ) ), 0 );
            black.width = 640;
            black.height = 100;
            black.alpha = 0.2;

            //  スコア
            this._scoreView = new mini.NumericImage(0);
            this.foreground.addChild( this._scoreView.display );
            this._scoreView.display.scaleX = this._scoreView.display.scaleY = 0.75;
            this._scoreView.display.transform.colorTransform = new ColorTransform( 1,1,1 );
            this._scoreView.x = 320;
            this._scoreView.y = 50;

            // 背景
            this._clouds = new RepeatableImage( "./assets/clouds.png" );
            this.background.addChild( this._clouds.display );
            this._clouds.x = 640/2;
            this._clouds.y = this.stage.stageHeight/2 - 150;
            this._ground = new RepeatableImage( "./assets/ground.png" );
            this.background.addChild( this._ground.display );
            this._ground.x = 640/2;
            this._ground.y = this.stage.stageHeight/2 + 300;


            var self = this;
            this._onTapBeginHandler = function(){ self._onTapBegin(); };
            this._onTapEndHandler = function(){ self._onTapEnd(); };

            //
//            this._character = new Character( false, this.user.activeCharaName );

            //
            this._wallMaker = new WallMaker();
            this._objectList = [];
            this._objectContainer = new Sprite();

            // audio
            this._bgm = new Audio( "./assets/bgm.mp3" );
            this._bgm.loop = true;
            this._clear = new Audio( "./assets/clear.mp3", "se" );
            this._hit = new Audio( "./assets/hit.mp3", "se" );

            // flash
            this._white = new Bitmap( new BitmapData( 1,1, true, 0xffffffff) );
            this._white.width = this.stage.stageWidth;
            this._white.height = this.stage.stageHeight;

        } },

        _onInit: { value: function(){

            this.score = 0;

            // bg
            this._clouds.speedX = 0.2;
            this._ground.speedX = 0.5;

            // displays init
            this.container.addChild( this._objectContainer );
            while( this._objectList[0] ) {
                var object = this._objectList.shift();
                this._objectContainer.removeChild( object.display );
            }

            if(this._character) this._character.reset();
            this._character = new Character( false, this.user.activeCharaId );
            this.container.addChild( this._character.display );



            this._ended = false;
            this._speed = 0.1;

            this._clouds.y = this.stage.stageHeight * ( 0.5 - 0.02*(-0.5+this._character.display.y/this.stage.stageHeight)) - 150;
            this._ground.y = this.stage.stageHeight * ( 0.5 - 0.05*(-0.5+this._character.display.y/this.stage.stageHeight)) + 300;
            this._objectContainer.y = this.stage.stageHeight * ( -0.1*(-0.5+this._character.display.y/this.stage.stageHeight));

            this._wallCount = 0;

        } },

        _onStart: { value: function(){

            // listen events
            this.background.addEventListener( "touchBegin", this._onTapBeginHandler );
            this.container.addEventListener( "touchBegin", this._onTapBeginHandler );
            this.background.addEventListener( "touchEnd", this._onTapEndHandler );
            this.container.addEventListener( "touchEnd", this._onTapEndHandler );

            this._bgm.play();

            // 20140407
            var speed = 9;
            var speedY = ( Math.random()-0.5 )>0?1 :-1;
            for( var i=0; i<4; i++ ) {
                var object = this._wallMaker.make();
                object.speed = { x: -speed, y: speedY };
                object.display.x = -300;
                this._objectContainer.addChild( object.display );
                this._objectList.push(object);
            }

        } },

        _onEnterFrame: { value: function( frameCount ){

            if( this._ended ) return;

            // ゲーム用tick
            mini.Tween.tick( 1, "game" );



            // hit test
            for( var i = 0; i < this._objectList.length; i++ ) {
                var object = this._objectList[i];
                // hit test
                if( this._character.hitArea.hitTestObject( object.hitArea ) != true ) continue;
                this._character.knockback();
                this._ended = true;

                this._bgm.stop();
                this._hit.play();

                this.container.addChild(this._white);
                this._white.alpha = 1;
                mini.Tween.get( this._white, { useTicks:true }).to( { alpha: 0 }, 20, mini.Ease.circOut );


                // out
                var self = this;
                mini.Tween.get( this._character.display, { useTicks:true })
                    .to( { y: this.stage.stageHeight+200 }, 20, mini.Ease.circIn )
                    .call( function(){
                        setTimeout( function(){
                            self.finish( self.score );
                        },0 );
                    } )
                    .wait(0);
                mini.Tween.get( this._character.display, { useTicks:true })
                    .to( { x: 80 }, 19, mini.Ease.circOut )
                    .wait(0);
            }

            //

            this._character.level = this._speed * 0.04;

            this._clouds.speedX = this._speed * 4;
            this._ground.speedX = this._speed * 15;

            this._character.update();

            this._clouds.update();
//            this._clouds.y = this.stage.stageHeight * ( 0.5 - 0.02*(-0.5+this._character.display.y/this.stage.stageHeight)) - 150;
            this._ground.update();
//            this._ground.y = this.stage.stageHeight * ( 0.5 - 0.05*(-0.5+this._character.display.y/this.stage.stageHeight)) + 300;

//            this._objectContainer.y = this.stage.stageHeight * ( -0.1*(-0.5+this._character.display.y/this.stage.stageHeight));


            // test object make
            if( frameCount > 120 && frameCount%80===0 ) {


                var space = 240;
                var val = space / this.stage.stageHeight;
                var mid = ( (1-val)/2 + 1.2*(Math.random()-0.5)*val ) * this.stage.stageHeight;

                var speed = 9;

                var speedY = 3 * ( Math.random()-0.5 );
                var speedY = ( Math.random()-0.5 )>0?1 :-1;

                var flg = Math.random() > 0.5;
//                var flg = this._wallCount%2 === 0;
                // upper
//                var object = this._wallMaker.make();
                var object = this._objectList.shift();
                if (object) {
//                    this._objectContainer.addChild( object.display );
                    this._objectList.push(object);
                    object.display.x = 800;
                    object.display.y = mid - space/2;
                    object.display.rotation = 180;
                    object.display.scaleX = -1;
                    object.speed = { x: -speed, y: speedY };

                    if( flg ) {
                            object.display.y = mid - space*2;
                        mini.Tween.get( object.display, { useTicks:true, group:"game" }).wait(10).to( {y : mid - space/2},60,mini.Ease.elasticOut);
                    } else {
                        object.display.y = mid - space;
                        mini.Tween.get( object.display, { useTicks:true, group:"game" }).wait(10).to( {y : mid - space/2},30);//60,mini.Ease.elasticOut);
                    }

                    object.speed = { x: -speed, y: 0 };
                }
                // lower
//                var object = this._wallMaker.make();
                var object = this._objectList.shift();
                if (object) {
//                    this._objectContainer.addChild( object.display );
                    this._objectList.push(object);
                    object.display.x = 800;
                    object.display.y = mid + space/2;
                    object.speed = { x: -speed, y: speedY };

                    if( flg ) {
                        object.display.y = mid + space*2;
                        mini.Tween.get( object.display, { useTicks:true, group:"game" } ).wait(10).to( {y : mid + space/2},60,mini.Ease.elasticOut);
                    } else {
                        object.display.y = mid + space;
                        mini.Tween.get( object.display, { useTicks:true, group:"game" } ).wait(10).to( {y : mid + space/2},30);//60,mini.Ease.elasticOut);
                    }
                    object.speed = { x: -speed, y: 0 };
                }

                this._wallCount++;
            }

            // object update
            var removeList = [];
            var clear = false;
            for( var i = 0; i < this._objectList.length; i++ ) {
                var object = this._objectList[i];
                var prevX = object.display.x;
                object.update();
                var line = 80;
                var newX = object.display.x;
                if( prevX >= line && newX < line ) clear = true;
//                if( newX < -100 ) removeList.push( object );
            }
            //
            if( clear ) {
                this.score += 1;
                this._clear.play();
            }

            // object remove
//            while( removeList[0] ) {
//                var object = removeList.shift();
//                this._objectList.splice( this._objectList.indexOf(object), 1 );
//                this._objectContainer.removeChild( object.display );
//            }

            // time up!!
            if( this._character.display.y > (this.stage.stageHeight-100) ) {

                this._ended = true;
                this._bgm.stop();
                this._hit.play();

                this.container.addChild(this._white);
                this._white.alpha = 1;
                mini.Tween.get( this._white, { useTicks:true }).to( { alpha: 0 }, 10, mini.Ease.circOut );


//                this.finish( this.score );

                // out
                var self = this;
                mini.Tween.get( this._character.display, { useTicks:true })
                    .to( { y: this.stage.stageHeight-200 }, 10, mini.Ease.circOut )
                    .to( { y: this.stage.stageHeight+200 }, 10, mini.Ease.circIn )
                    .call( function(){
                        setTimeout( function(){
                            self.finish( self.score );
                        },0 );
                    } )
                    .wait(0);
            }

//            this._speed += 0.01/60;

        } },

        _onPause: { value: function(){
            this._bgm.pause();
        } },

        _onResume: { value: function(){
            this._bgm.resume();
        } },

        _onFinish: { value: function(){

            // unlisten events
            this.background.removeEventListener( "touchBegin", this._onTapBeginHandler );
            this.container.removeEventListener( "touchBegin", this._onTapBeginHandler );
            this.background.removeEventListener( "touchEnd", this._onTapEndHandler );
            this.container.removeEventListener( "touchEnd", this._onTapEndHandler );
        } },


        _onTapBegin: { value: function(){
            this._character.startFlap();
        } },

        _onTapEnd: { value: function(){
            this._character.endFlap();
        } }
    } );


    //
    var Character = function ( stop, charaId ){
        this._stop = arguments.length>0?arguments[0]:false;
        this._name = charaId || "normal";

        this.assets = new Assets( {
            spriteSheet : new Image( "./assets/fugu_"+this._name+"_walk.png" ),
            knockback : new Image( "./assets/fugu_"+this._name+"_attack.png" )
        } );

        var self = this;
        this.assets.onload = function( assets ){



            self._walk1 = new Bitmap( new BitmapData( assets.spriteSheet ) );
            self._walk1.scaleX *= -1;
            self._walk1.x = 37;
            self._walk1.y = -26;
            var frame = { x: 3, y: 3, w: 74.4, h: 52.1 };
            self._walk1.setClippingRect( new Rectangle( frame.x, frame.y, frame.w, frame.h ) );

            self._walk2 = new Bitmap( new BitmapData( assets.spriteSheet ) );
            self._walk2.scaleX *= -1;
            self._walk2.x = 37;
            self._walk2.y = -26;
            frame = { x: 3, y: 58.1, w: 72.8, h: 52.1 };
            self._walk2.setClippingRect( new Rectangle( frame.x, frame.y, frame.w, frame.h ) );

            self._knockback = new Bitmap( new BitmapData( assets.knockback ) );
            self._init();
        };


        this._container = new Sprite();

        this._knockback = null;


        this._hitArea = new Bitmap( new BitmapData( 1,1,true, 0x00ff0000 ) );
        this._hitArea.x = -30;
        this._hitArea.y = -22;
        this._hitArea.width = 57;
        this._hitArea.height = 44;
        this._container.addChild( this._hitArea );

        this._walk = { frameIndex:0, frameLimit: 2*4 };
//        this._walkFrames = [
//            {
//                "filename": "mc_walk インスタンス 10003",
//                "frame": {
//                    "x": 3,
//                    "y": 3,
//                    "w": 74.4,
//                    "h": 52.1
//                },
//                "rotated": false,
//                "trimmed": false,
//                "spriteSourceSize": {
//                    "x": 0,
//                    "y": 0,
//                    "w": 74.4,
//                    "h": 52.1
//                },
//                "sourceSize": {
//                    "w": 74.4,
//                    "h": 52.1
//                }
//            },
//            {
//                "filename": "mc_walk インスタンス 10004",
//                "frame": {
//                    "x": 3,
//                    "y": 58.1,
//                    "w": 72.8,
//                    "h": 52.1
//                },
//                "rotated": false,
//                "trimmed": true,
//                "spriteSourceSize": {
//                    "x": 1.1,
//                    "y": 0,
//                    "w": 74.4,
//                    "h": 52.1
//                },
//                "sourceSize": {
//                    "w": 74.4,
//                    "h": 52.1
//                }
//            }
//        ];

        this._speed = { x:0,y:0 };

        this.isInitialized = false;

        // stop?
        if( this._stop ) {
            this.speed = {x:0,y:0};
            var self = this;
            this.display.addEventListener("enterFrame", this._oef = function(){ self.update(); });
        }

        //
        this.display.y = 400;
        this._container.x = 200;
        this._speed.y = -14;
    };

    Character.prototype = Object.create( {}, {

        name: { get:function(){ return this._name; } },

        display: { get: function(){ return this._container; } },

        reset: { value: function(){

            this.display.y = 400;
            this._container.x = 230;
            this._speed.y = -14;
            if(this._knockback) this._container.removeChild( this._knockback );

            this.display.removeEventListener("enterFrame", this._oef );
            if( this.display.parent ) this.display.parent.removeChild( this.display );
        } },

        _init: { value: function(){
            this.isInitialized = true;

            this._container.addChild( this._walk1 );
            this._container.addChild( this._walk2 );
//            this._walkSprite.scaleX = this._walkSprite.scaleY = 1.4;
//            this._walkSprite.scaleX *= -1;
//            this._walkSprite.x = 37;
//            this._walkSprite.y = -26;


            this.update();
        } },

        update: { value: function(){
            if( !this.isInitialized ) return;

            if( !this._stop ) {
                // upper
                this._container.y += this._speed.y;
                if( this._container.y < 80 ) {
                    this._container.y = 80;
                    this._speed.y = -1;
                }
                //
                this._container.x += this._speed.x;

                // speed
                this._speed.y +=1;
                if(this._speed.y>0)this._speed.y *= 1.02;

                this._container.rotation = Math.atan2( this._speed.y,20 ) / Math.PI * 180;
            }


            // walk?
            if( this._walk.frameIndex >= this._walk.frameLimit ) this._walk.frameIndex = 0;

//            var frame = this._walkFrames[ Math.floor(this._walk.frameIndex/4) ].frame;
//            var sourceSize = this._walkFrames[ Math.floor(this._walk.frameIndex/4) ].spriteSourceSize;

            this._walk1.visible = Math.floor(this._walk.frameIndex/4)===0;
            this._walk2.visible = Math.floor(this._walk.frameIndex/4)===1;
//            this._walkSprite.setClippingRect( new Rectangle( frame.x, frame.y, frame.w, frame.h ) );
////            this._walkSprite.x = sourceSize.x;
////            this._walkSprite.y = sourceSize.y;
            this._walk.frameIndex += 1;

        } },

        startFlap: { value: function(){
            // filter
            this._walk.frameIndex = 0;//0;

            this._speed.y = -14;
//            this._speed.y = -8;
        } },
        endFlap: { value: function(){

//            this._speed.y = 8;
        } },

        hitArea: { get: function(){ return this._hitArea; } },

        knockback: { value: function(){
            //
            this.shake = 0;this.level=0;this.fxValue=0;
            this._container.addChild( this._knockback );
            this._knockback.x = -164/2;
            this._knockback.y = -164/2;
        } }
    });
    FlappyFuguGame.Character = Character;




    var WallMaker = function (){

        this.assets = new Assets( {
            spriteSheet : new Image( "./assets/wall.png" )
        } );

        this.isInialized = false;
        var self = this;
        this.assets.onload = function( assets ){
            self._spriteSheet = new BitmapData( assets.spriteSheet );
            self._init();
        };

    };
    WallMaker.prototype = Object.create( {}, {
        _init: { value: function(){ this.isInialized = true; } },

        make: { value: function(){
            if( !this.isInialized ) return null;
            return new Wall( this._spriteSheet );
        } }
    } );

    var dummyBD = new BitmapData( 1,1,true, 0x00ff0000 );

    var Wall = function( spriteSheet ){

        this._spriteSheet = spriteSheet;

        this._container = new Sprite();
        this._container.scaleY = 1.2;

        this._hitArea = new Bitmap( dummyBD );
        this._hitArea.y = 7;
        this._hitArea.width = (188-70);
        this._hitArea.height = 500;
        this._hitArea.x = -(188-70)/2;
        this._hitArea.y = 5;
        this._container.addChild( this._hitArea );

        this._sprite = new Bitmap( spriteSheet );
        this._sprite.x = -188/2;
        this._sprite.y = 0;
        this._container.addChild( this._sprite );


        this._init();
    };

    Wall.prototype = Object.create( {}, {

        display: { get: function(){return this._container; } },

        _init: { value: function(){
            var self = this;
            //
        } },

        update: { value: function(){

            this._container.x += this._speed.x;
            this._container.y += this._speed.y;

        } },

        speed: { get: function( ){ return this._speed; }, set: function( value ){ this._speed = value } },

        hitArea: { get: function(){ return this._hitArea; } }
    });


    var RepeatableImage = function(){
        mini.ImageView.apply(this,arguments);
        this._bmp2 = null;
        this._speedX = 0;
    };
    RepeatableImage.prototype = Object.create( mini.ImageView.prototype, {
        width:{
            get: function(){ return this._bmp.width; },
            set: function( value ){
                this._bmp.width = this._bmp2.width = value;
                this._bmp.x = -this._bmp.width/2;
            }
        },
        height:{
            get: function(){ return this._bmp.height; },
            set: function( value ){
                this._bmp.height = this._bmp2.height = value;
                this._bmp.y = -this._bmp.height/2;
            }
        },

        // callback
        onLoad: { value: null },

        // internal method
        _onImageLoaded: { value: function(image){
            this._bmp = new Bitmap( new BitmapData( image ) );
            this._bmp.x = -this._bmp.width/2;
            this._bmp.y = -this._bmp.height/2;
            this._display.addChild( this._bmp );

            this._bmp2 = new Bitmap( this._bmp.bitmapData );
            this._bmp2.x = -this._bmp2.width/2 + this._bmp.width;
            this._bmp2.y = -this._bmp2.height/2;
            this._display.addChild( this._bmp2 );

            if( this.onLoad !== null ) this.onLoad();
        } },

        // method
        dispose: { value: function(){
            // TODO
        } },

        speedX:{ get:function(){ return this._speedX; }, set:function(val){ this._speedX = val; } },

        update:{ value: function(){
            if(!this._bmp)return;
            //
            this._bmp.x -= this._speedX;
            this._bmp2.x -= this._speedX;

            if( this._bmp.x < -this._bmp.width*1.5 ) this._bmp.x = this._bmp2.x + this._bmp2.width;
            if( this._bmp2.x < -this._bmp2.width*1.5 ) this._bmp2.x = this._bmp.x + this._bmp.width;

        } }
    } );



    return FlappyFuguGame;
});