define([
    "lib/mini",
    "src/FlappyFuguGame"
],function( mini, FlappyFuguGame ){

    var ResultScene = function( ){
        mini.ResultScene.apply( this, arguments );
    };

    ResultScene.prototype = Object.create( mini.ResultScene.prototype ,{

        _onPrepare: { value: function(){
            log( "_onPrepare" );
            // レイアウト

            this.popupBG.display.scaleY = 1.35;
            this.popupBG.display.y -= 40;

            this.popupScoreView.display.scaleX = this.popupScoreView.display.scaleY = 1.1;

            // y
            var offsetY = -100;
            this.popupLabelResult.y += offsetY;
            this.popupScoreView.y += offsetY-15;
            this.popupLabelBest.y += offsetY;
            this.popupBestScoreView.y += offsetY;

            // x
            var offsetX = 90;
            this.popupLabelResult.x += offsetX;
            this.popupScoreView.x += offsetX;
            this.popupLabelBest.x += offsetX-95;
            this.popupBestScoreView.x += offsetX-125;

            this.adAreaBG.y += 5;

            //  勲章
            this._medalContainer = this.popup.addChild( new Sprite() );
            this._medalContainer.scaleX = this._medalContainer.scaleY = 1.0;
            this._medalContainer.x = offsetX-40;
            this._medalContainer.y = -15 + offsetY;

            this._medals = {};
            for( var id in this.config.medal ){
                var medal = this.config.medal[id];
                var medalImage = new mini.ImageView( medal.img );
                this._medalContainer.addChild( medalImage.display );
                medalImage.display.visible = false;
                this._medals[ id ] = medalImage;
            }


            // 世界ランク TODO miniへ
            this._popupLabelRank = new mini.ImageView( "./assets/mini/result_popup_label_rank.png" );
            this.popup.addChild( this._popupLabelRank.display );
            this._popupLabelRank.y = -170;
            this._popupLabelRank.x = 180;

            this._popupRankView = new mini.NumericImage("00000", "./assets/mini/_numbers_for_rank.png");
            this.popup.addChild( this._popupRankView.display );
            this._popupRankView.display.scaleX = this._popupRankView.display.scaleY = 0.7;
            this._popupRankView.y = -110;
            this._popupRankView.x = 180;




            // snsボタンを移動
            var fbSprite = this.popup.addChild( this.btnFacebook.display );
            var twSprite = this.popup.addChild( this.btnTwitter.display );
            var lnSprite = this.popup.addChild( this.btnLine.display );
            var rcSprite = this.popup.addChild( this.btnRecommendedSmall.display );
            fbSprite.x -= this.stage.stageWidth/2 + 35;
            twSprite.x -= this.stage.stageWidth/2 + 35;
            lnSprite.x -= this.stage.stageWidth/2 + 35;
            rcSprite.x -= this.stage.stageWidth/2 + 35;

            fbSprite.y = twSprite.y = lnSprite.y = rcSprite.y = -5;

            // コレクション
            this._collectionContainer = this.popup.addChild( new Sprite() );
            this._collectionContainer.x = -220;
            this._collectionContainer.y = -300;
            this._collections = {};

            //  normal
            var chara = new FlappyFuguGame.Character( true );
            this._collections[ "normal" ] = chara;
            chara.display.y = 0 * 57;
            chara.display.x = (0%2) * 75;
            chara.display.scaleX = chara.display.scaleY = 1.2;
            this._collectionContainer.addChild( chara.display );

            //  collections
            var i=0;
            for( var id in this.config.collection ) {
                collection = this.config.collection[id];
                chara = new FlappyFuguGame.Character( true, id );
                chara.dummy = new mini.ImageView( "./assets/fugu_dummy.png" );
                this._collections[ id ] = chara;
                chara.display.y = chara.dummy.display.y = (1+i) * 57;
                chara.display.x = chara.dummy.display.x = ((1+i)%2) * 75;
                chara.display.scaleX = chara.display.scaleY = 1.2;
                chara.dummy.display.scaleX = chara.dummy.display.scaleY = 1.2;

                this._collectionContainer.addChild( chara.dummy.display );

                this._collectionContainer.addChild( chara.display );
                i++;
            }

            //   selectable
            ResultScene.se = new Audio( "assets/sally.mp3", "se" );
            for( var id in this._collections ) {
                var chara = this._collections[id];
                // このやり方本当は×
                (function(chara, collections){
                    chara.display.addEventListener( "touchTap", function(){
                        //
                        for( var i in collections ) collections[i].display.transform.colorTransform = new ColorTransform( 0.7,0.7,0.7,0.6 );
                        //
                        chara.display.transform.colorTransform = new ColorTransform();
                        application.user.activeCharaId = chara.name;

                        // sound
                        ResultScene.se.play();
                    } );
                })(chara, this._collections);
            }

        } },


        _onUpdateNewRecord: { value: function( score ){

        } },
        _onUpdateRank: { value: function( rank, diff ) {
            this._popupRankView.display.visible = true;
            this._popupRankView.value = rank;
        } },

        _onShow: { value: function(){

            // TODO miniへ
            var rank = this.user.rank;
            this._popupRankView.display.visible = ( rank !== -1 );
            if( rank !== -1 )this._popupRankView.value = rank;


            // collection
            for( var id in this.config.collection ) {
                var collection = this.config.collection[id];
                var chara = this._collections[ id ];
                if( this.user.hasCollection( id ) ) {
                    // have
                    chara.display.visible = true;
                    chara.dummy.display.visible = false;
                } else {
                    chara.display.visible = false;
                    chara.dummy.display.visible = true;
                    //
                    if( collection.condition() ) {
                        // grant
                        this.user.grantCollection( id );

                        (function( collection, collections, chara ){
                            setTimeout( function(){ alert( collection.text, function(){

                                for( var id in collections ) collections[id].display.transform.colorTransform = new ColorTransform( 0.7,0.7,0.7,0.6 );
                                //
                                chara.display.transform.colorTransform = new ColorTransform();
                                application.user.activeCharaId = chara.name;

                                // sound
                                ResultScene.se.play();
                            } ); }, 500 );

                        })( collection, this._collections, chara );

                        // visible
                        chara.display.visible = true;
                        chara.dummy.display.visible = false;
                    }
                }
            }
            // active fugumi
            for( var id in this._collections ) {
                var chara = this._collections[id];
                if( id === application.user.activeCharaId )
                    chara.display.transform.colorTransform = new ColorTransform();
                else
                    chara.display.transform.colorTransform = new ColorTransform( 0.8,0.8,0.8,0.7 );
            }

            // 勲章
            for( var id in this._medals ) this._medals[id].display.visible = false;
            var best = this.user.bestScore;
            for( var id in this.config.medal ){
                var medal = this.config.medal[id];
                if( medal.score > best ) continue;

                var medalImage = this._medals[ id ];
                medalImage.display.visible = true;
                break;
            }

            // レビューお願い TODO Androidは？
            if( this.user.playCount === 10 && app.isIOS ) {
                //
                var self = this;
                var id = "mikan";
                var collection = self.config.collection[id];
                confirm( collection.text, function( result ){
                    if( result ) {
                        // ふよ
                        var chara = self._collections[id];
                        if( self.user.hasCollection( id ) ) {
                            // have
                            chara.display.visible = true;
                            chara.dummy.display.visible = false;
                        } else {
                            chara.display.visible = false;
                            chara.dummy.display.visible = true;

                            // grant
                            self.user.grantCollection( id );

                            (function( collection, collections, chara ){
                                setTimeout( function(){ alert( collection.text, function(){

                                    for( var id in collections )
                                        collections[id].display.transform.colorTransform = new ColorTransform( 0.7,0.7,0.7,0.6 );
                                    //
                                    chara.display.transform.colorTransform = new ColorTransform();
                                    application.user.activeCharaId = chara.name;

                                    // sound
                                    ResultScene.se.play();
                                } ); }, 500 );

                            })( collection, self._collections, chara );

                            // visible
                            chara.display.visible = true;
                            chara.dummy.display.visible = false;
                        }

                        // レビューへ
                        app.openURL( self.config.storeIOS );
                    }
                } );
            }
        } }

    });

    return ResultScene;
});