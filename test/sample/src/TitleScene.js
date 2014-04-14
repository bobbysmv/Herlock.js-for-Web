define([
    "lib/mini",
    "src/FlappyFuguGame"
],function( mini, FlappyFuguGame ){

    var TitleScene = function(){
        mini.TitleScene.apply( this, arguments );
    };

    TitleScene.prototype = Object.create( mini.TitleScene.prototype ,{

        _onPrepare: { value: function(){

            // logo
            var logo = new mini.ImageView( "./assets/logo.png" );
            logo.x = this.stage.stageWidth / 2;
            logo.y = this.stage.stageHeight / 2 - 170;
            this.background.addChild( logo.display );
            logo.display.scaleX = logo.display.scaleY = 1.2;

            logo = new mini.ImageView( "./assets/logo.png" );
            logo.x = this.stage.stageWidth / 2;
            logo.y = this.stage.stageHeight / 2 - 170;
            logo.display.alpha = 0.3;
            this.foreground.addChild( logo.display );
            logo.display.scaleX = logo.display.scaleY = 1.2;

            this._hit = new Audio( "./assets/hit.mp3", "se" );
        } },

        _onShow: { value: function(){
            this.buttonSound.display.visible = false;

            this._charaList = [];
            var chara = new FlappyFuguGame.Character();
            this.container.addChild( chara.display );
            chara.display.x = this.stage.stageWidth/2;
            chara.display.y = this.stage.stageHeight/2;
            this._charaList.push( chara );

            chara.display.chara = chara;
            chara.display.addEventListener("touchRollOver", function(){
                self._hit.play();
                this.chara.knockback();
            });

            var self = this;
            for( var id in this.config.collection) {
                var collection = this.config.collection[id];
                if( !this.user.hasCollection( id ) ) continue;

                var chara = new FlappyFuguGame.Character( false, id );
                this.container.addChild( chara.display );
                chara.display.x = this.stage.stageWidth/2;
                chara.display.y = this.stage.stageHeight/2;
                this._charaList.push( chara );

                chara.display.chara = chara;
                chara.display.addEventListener("touchRollOver", function(){
                    self._hit.play();
                    this.chara.knockback();
                });
            }


            var self = this;
            var cnt = 0;
            this.stage.addEventListener( "enterFrame", this._oef = function(){
                cnt++;
                for( var i in self._charaList ) {
                    var chara = self._charaList[i];
                    var ratio = (chara.display.y / self.stage.stageHeight);
                    ratio*=ratio;
                    if( Math.random() < ratio*0.2 || chara.display.y > (self.stage.stageHeight-150) ) {
                        chara.startFlap();
                        var speedX = ( Math.random()>0.5? 2:-2 );
                        chara.display.scaleX = speedX>0?1:-1;
                        chara._speed.x = speedX;
                    }
                    if( chara.display.x > (self.stage.stageWidth+50) ) chara.display.x -= self.stage.stageWidth+50;
                    if( chara.display.x < -50 ) chara.display.x += self.stage.stageWidth+50;

                    chara.update();
                }
            } );
        } },

        _onHide: { value: function(){
            this.stage.removeEventListener( "enterFrame", this._oef );

            for ( var i in this._charaList ) {
                this.container.removeChild( this._charaList[i].display );
            }
            this._charaList = null;
        } }

    });

    return TitleScene;
});