define([
    "lib/scene",
    "lib/make",
    "lib/ng_word",
    "lib/crypto/hmac-sha256",
    "lib/crypto/md5",
    "lib/base64"
], function ( Scene, make, NGWord, HmacSha256, md5, base64 ) {

    /**
     * ミニゲーム向けフレームワーク
     */
    var mini = {};


    /**
     * 設定・構成オブジェクト
     * @constructor
     */
    var Config = function(){

        // 設定
        this.debug = true ;
        this.screenshotMode = false;
        this.width = 640 ;
        this.height = (  window.innerHeight * 640 / window.innerWidth );
        this.orientation = "portrait" ;
        this.name = "開発中ゲーム";
        this.urlscheme = "dev";
        this.googleAnalyticsUAIOS = "UA-47071883-8" ;
        this.googleAnalyticsUAAndroid = "UA-47071883-8" ;
        this.storeIOS = null;
        this.storeAndroid = null;
        this.message = "スコア#score ベスト#best #name #store";

        // シーン設定
        this.initPath = "/";
        this.sceneMap = null;

        // 機能オプション
        this.useSound = true;
        this.useHelp = true;
        this.useResultAdIcons = true;

        // Herlock Baas
        this.herlockRankingId = "dev";

        // シーンクラス
        this.titleScene = TitleScene ;
        this.gameScene = GameScene ;
        this.resultScene = ResultScene ;

        // モデルクラス
        this.user = User;
        this.prize = Prize;

        // ゲームクラス デフォルトはnull GameSceneにゲームを実装するか、Gameクラスを使うかは実装者次第
        this.game = null;

        // タイトルシーン

        // ゲームシーン
        this.gameOverlayColor = 0xff000000;

        // 結果シーン


        // 画像情報

        //  数字
        this._numbers = "./assets/mini/_numbers.png"; // "0123456789." or "単位0123456789." の画像。小数点以外等幅の前提
        this.numberWidth = 51; // 数字の幅px。画像の横幅をこれで割った余りを小数点画像とする

        //  SNSボタン
        this._btn_facebook = "./assets/mini/_btn_facebook.png";
        this._btn_line = "./assets/mini/_btn_line.png";
        this._btn_twitter = "./assets/mini/_btn_twitter.png";

        //  ゲームシーン画像
        this.game_bg = "./assets/mini/game_bg.png";
        this.game_btn_pause = "./assets/mini/game_btn_pause.png";
        this.game_popup_bg = "./assets/mini/game_popup_bg.png";
        this.game_popup_btn_recommended = "./assets/mini/game_popup_btn_recommended.png";
        this.game_popup_btn_retry = "./assets/mini/game_popup_btn_retry.png";
        this.game_popup_btn_return_to_game = "./assets/mini/game_popup_btn_return_to_game.png";
        this.game_popup_btn_to_title = "./assets/mini/game_popup_btn_to_title.png";
        this.game_popup_label_pause = "./assets/mini/game_popup_label_pause.png";
        this.game_help_bg = "./assets/mini/game_help_bg.png";
        this.game_help_label_explain = "./assets/mini/game_help_label_explain.png";
        this.game_help_content = "./assets/mini/game_help_content.png";

        //  結果シーン画像
        this.result_bg = "./assets/mini/result_bg.png";
        this.result_btn_recommended_small = "./assets/mini/result_btn_recommended_small.png";
        this.result_btn_retry = "./assets/mini/result_btn_retry.png";
        this.result_btn_to_title = "./assets/mini/result_btn_to_title.png";
        this.result_popup_bg = "./assets/mini/result_popup_bg.png";
        this.result_popup_label_best = "./assets/mini/result_popup_label_best.png";
        this.result_popup_label_result = "./assets/mini/result_popup_label_result.png";

        //  タイトルシーン画像
        this.title_bg = "./assets/mini/title_bg.png";
        this.title_btn_recommended = "./assets/mini/title_btn_recommended.png";
        this.title_btn_sound = "./assets/mini/title_btn_sound.png";
        this.title_btn_start = "./assets/mini/title_btn_start.png";
        this.title_btn_smv = "./assets/mini/title_btn_smv.png";
    };
    Config.prototype = Object.create({},{
        googleAnalyticsUA: { get:function(){ return this.googleAnalyticsUAIOS; },
            set:function( value ){
                this.googleAnalyticsUAIOS = value;
                this.googleAnalyticsUAAndroid = value;
            }
        }
    });
    mini.Config = Config;



    /********************************************************************************************************************
     * Controller
     */

    /**
     * アプリケーション
     * @param config
     * @constructor
     */
    var Application = function( config ){
        window.application = this;
        this._config = config || new Config();

        var self = this;
        window.log = function(){ self.log.apply( self, arguments ); };
    };
    Application.prototype = Object.create( {} ,{

        /**
         * アプリの設定
         * @type mini.Config
         */
        config: {
            get: function(){ return this._config; },
            set: function( value ){ this._config = value; }
        },

        /**
         * ユーザー
         * @type mini.User
         */
        user: { value: null, writable:true },

        /**
         * 報奨
         * @type mini.Prize
         */
        prize: { value: null, writable:true  },

        /**
         * ステージ
         * @type Stage
         */
        stage: { value: null, writable:true  },

        /**
         * ログ
         * @aliase window.log()
         */
        log: { value: function(){
            console.log.apply( console, arguments );
        } },

        /**
         * アプリ起動
         */
        start: { value: function(){
            log("start Application");

            var config = this.config;

            // stage TODO
            this.layer = addLayer( new Stage( config.width, config.height ) );
            this.layer.scaleMode = Layer.SCALE_NO_BORDER;
            this.stage = this.layer.content;

            // tween
            this.stage.addEventListener( "enterFrame", function(){
                mini.Tween.tick();
            } );

            // 画面方向
            window.setOrientationType( config.orientation || "portrait" );

            // ボタン音
            if( config.useSound ) {
                // TODO mini自体の音対応
                Button.buttonAudio = new Audio("./assets/mini/button.mp3","se");
            }

            // GA設定
            googleAnalytics.init(
                config.debug?
                    "UA-47071883-8":
                    app.isIOS?
                        config.googleAnalyticsUAIOS:
                        config.googleAnalyticsUAAndroid
            );

            // 報奨
            this.prize = new config.prize();

            // ユーザー
            this.user = new config.user();
            this.user._launch();// 起動

            if( this.user.launchCount === 1 ) {
                // 初回起動
                this._onFirstLaunch();
            }

            // アプリバージョンチェック
            if( app.buildVersion ) { // buildVersionのAPIがあれば
                var latestAppBuildVersion = localStorage.getItem("app_buildVersion") || null;
                var buildVersion = app.buildVersion;
                if( buildVersion != latestAppBuildVersion ) {
                    // アプリ更新があったと推測できるので
                    this._onChangeAppVersion( latestAppBuildVersion, buildVersion );
                }
                localStorage.setItem("app_buildVersion", buildVersion);
            }


            // DEBUG mode
            if( this.config.debug !== true ) {
                // RELEASE
                //  デバッグ機能の削除
                this.log = function(){};
                if( window.devtools ) devtools.view.visible = false;
                //  show ad banner
                if( !this.config.screenshotMode ) app.sendMessage("showAdBanner");
            } else {
                // DEBUG
                //  デバッグ機能を有効化
                new DebugFooter();
                //  表示中画面で再読み込み機能
                var params = {};
                location.search.substr(1).split("&").forEach(function(value){ var tmp = value.split("="); params[ tmp[0] ] = tmp[1]; });
                if( params.dev_init_path ) this.config.initPath = params.dev_init_path;
            }

            // テキスト広告 TODO とりあえずここで2回めの起動以降毎回出しているが・・・
            if( !this.config.debug && this.user.launchCount > 1 ) {
                // テキスト広告
                setTimeout( function(){ app.sendMessage("showAid"); }, 2000 );
            }

            // シーンの設定
            Scene.mapping( this.config.sceneMap || {
                "/": new config.titleScene(),
                "/game": new config.gameScene(),
                "/result": new config.resultScene()
            } );

            Scene.goto( this.config.initPath );
        }},

        /**
         * SNS向けメッセージの生成
         */
        createMessage: { value: function( type ){
            var msg = this.config.message;
            msg = msg.replace( /#name/g, this.config.name );
            msg = msg.replace( /#score/g, this.user.score + "" );
            msg = msg.replace( /#best/g, this.user.bestScore + "" );

            if( type !== "facebook" )
                msg = msg.replace( /#store/g, this.config[ "store" + ( app.isIOS? "IOS": "Android" ) ] );
            else
                msg = msg.replace( /#store/g, "" );

            if( type === "twitter" ) msg += " #" + this.config.name;

            return msg;
        }, writable:true  },


        // Template methods
        /**
         * 初回起動時に呼ばれる
         */
        _onFirstLaunch: { value: function(){}, writable:true  },
        /**
         * アプリ本体アップデート後最初の起動で呼ばれる
         * @param {String} from アップデート前のバージョン。もしくはnull(初回かapp.buildVersion非対応だったか)
         * @param {String} to 現在のバージョン
         */
        _onChangeAppVersion: { value: function( from, to ){}, writable:true  }
    });
    mini.Application = Application;



    var SCENE_CHANGE_FRAMES = 20;
    /**
     * miniのシーン基底
     * @constructor
     */
    var MiniScene = function(){
        Scene.apply( this, arguments );

        this._rootContainer = new Sprite();
        this._cover = new Bitmap( new BitmapData(1,1,true,0xff000000) );
        this._cover.name = "cover";

        this._background = this._rootContainer.addChild( new Sprite() );
        this._background.name = "background";
        this._container = this._rootContainer.addChild( new Sprite() );
        this._container.name = "container";
        this._foreground = this._rootContainer.addChild( new Sprite() );
        this._foreground.name = "foreground";
    };
    MiniScene.prototype = Object.create( Scene.prototype ,{

        // callback

        onPrepare: { value: function(){
            log( "MiniScene.onPrepare" );
            this._rootContainer.name = ("scene_root:" + this.path);
            this._onPrepare();
            this.completePrepare();
        }, writable:true  },

        /**
         * prepare処理
         * @protected
         */
        _onPrepare: { value: function(){}, writable:true  },

        onShow: { value: function(){
            googleAnalytics.screen( this.path );
            this._onShow();
            this._cover.width = this.stage.stageWidth;
            this._cover.height = this.stage.stageHeight;

            this._rootContainer.mouseChildren = false;

            var self = this;
            mini.Tween.removeTweens( this._cover );

            mini.Tween
                .get( this._cover, { useTicks: true })
                .wait( SCENE_CHANGE_FRAMES/2 )
                .call( function(){
                    self.stage.addChild( self._rootContainer );
                    self.stage.addChild( self._cover );
                    self._cover.alpha = 1;
                } )
                .to( { alpha: 0 }, SCENE_CHANGE_FRAMES/2, mini.Ease.sineOut)
                .call( function(){
                    self.stage.removeChild( self._cover );
                    self._rootContainer.mouseChildren = true;
                } )
                .wait(0);
        }, writable:true  },

        /**
         * show処理
         * @protected
         */
        _onShow: { value: function(){}, writable:true  },

        onHide: { value: function(){
            this._onHide();
            this.stage.addChild( this._cover );

            this._rootContainer.mouseChildren = false;

            mini.Tween.removeTweens( this._cover );

            var self = this;
            this._cover.alpha = 0;
            mini.Tween
                .get( this._cover, { useTicks: true })
                .to( { alpha: 1 }, SCENE_CHANGE_FRAMES/2, mini.Ease.sineOut )
                .call( function(){
                    self.stage.removeChild( self._rootContainer );
                    self.stage.removeChild( self._cover );
                }).wait(0);
        }, writable:true  },

        /**
         * hide処理
         * @protected
         */
        _onHide: { value: function(){}, writable:true  },

        // property

        /**
         * ユーザー情報
         * @type mini.User
         */
        user: { get: function(){ return application.user; } },
        /**
         * 構成・設定オブジェクト
         * @type Object
         */
        config: { get: function(){ return application.config; } },
        /**
         * 表示ステージ
         * @type Stage
         */
        stage: { get: function(){ return application.stage; } },
        /**
         * シーン別 表示ルートコンテナ
         * @type Sprite
         */
        rootContainer: { get: function(){ return this._rootContainer; } },
        /**
         * 背景表示コンテナ
         * @type Sprite
         */
        background: { get: function(){ return this._background; } },
        /**
         * 表示コンテナ
         * @type Sprite
         */
        container: { get: function(){ return this._container; } },
        /**
         * 前景表示コンテナ
         * @type Sprite
         */
        foreground: { get: function(){ return this._foreground; } },


        // method

        /**
         * シーン遷移
         * @type string シーンパス
         */
        goto: { value: function( path ){ setTimeout( function(){ Scene.goto( path ); }, 0) }, writable:true  }
    });
    mini.MiniScene = MiniScene;


    /********************************************************************************************************************
     * Controller Sceneテンプレート実装
     * ・アプリケーションスキーム定義
     * ・実装上のマネタイズノウハウ共有の場
     */

    /**
     * タイトルシーン
     * @constructor
     */
    var TitleScene = function(){
        MiniScene.apply( this, arguments );
        log( "new TitleScene()" );
    };
    TitleScene.prototype = Object.create( MiniScene.prototype ,{

        onPrepare: { value: function(){

            this._bgImage = new ImageView( this.config.title_bg );
            this._btnSound = new Button( this.config.title_btn_sound, "タイトル画面:サウンドボタン" );
            this._btnStart = new Button( this.config.title_btn_start, "タイトル画面:スタートボタン" );
            this._btnRecommended = new Button( this.config.title_btn_recommended, "タイトル画面:おすすめボタン" );


            this._background.addChild( this._bgImage.display );
            this._bgImage.display.x = this.stage.stageWidth / 2;
            this._bgImage.display.y = this.stage.stageHeight / 2;

            this._foreground.addChild( this._btnSound.display );
            this._btnSound.display.x = 11 + 72/2;
            this._btnSound.display.y = 11 + 100 + 78/2;//this.stage.stageHeight/2;

            var span = 110;
            var offset = 92;
            this._foreground.addChild( this._btnStart.display );
            this._btnStart.display.x = this.stage.stageWidth/2;
            this._btnStart.display.y = this.stage.stageHeight/2 + offset + span*0;
            this._btnStart.onTap = function(){ Scene.goto("/game"); };

            this._foreground.addChild( this._btnRecommended.display );
            this._btnRecommended.display.x = this.stage.stageWidth/2;
            this._btnRecommended.display.y = this.stage.stageHeight/2 + offset + span*1;
            this._btnRecommended.onTap = function(){
                // TODO herlockに各広告モジュール組込み後はそれを使うこと
                if( Math.random()>0.5 )
                    app.sendMessage( "showGameFeat" );
                else
                    app.sendMessage( "showAppliPromotion" );
                app.sendMessage( "showBEAD_title" );
            };

            MiniScene.prototype.onPrepare.call(this);


            // RankingAPI check my rank
            var self = this;
            mini.HerlockRankingAPI.put( function( xhr ){
                var json;
                // jsonパース
                try{ json = JSON.parse( xhr.responseText ); }catch(e){ return log(e); }
                // エラーチェック
                if( json.error_message !== "" ) return log( JSON.stringify( json) );// TODO
                // ランク更新
                try{ self.user.rank = json.result.me.rank; } catch (e){ return log(e) ; }

            }, this.config.herlockRankingId, this.user.id, this.user.name, this.user.bestScore );
        }, writable:true  },

        onShow: { value: function(){
            MiniScene.prototype.onShow.call(this);

            // hide "splash image"
            app.sendMessage( "hideSplash" );
        }, writable:true  },
        onHide: { value: function(){
            MiniScene.prototype.onHide.call(this);

        } , writable:true },


        // parts
        /**
         * 背景
         * @type mini.ImageView
         */
        backgroundImage: { get: function(){ return this._bgImage; } },
        /**
         * 音声ボタン
         * @type mini.Button
         */
        buttonSound: { get: function(){ return this._btnSound; } },
        /**
         * スタートボタン
         * @type mini.Button
         */
        buttonStart: { get: function(){ return this._btnStart; } },
        /**
         * おすすめボタン
         * @type mini.Button
         */
        buttonRecommended: { get: function(){ return this._btnRecommended; } },


}   );
    mini.TitleScene = TitleScene;


    /**
     * ゲームシーン
     * @constructor
     */
    var GameScene = function(){
        MiniScene.apply( this, arguments );
        log( "new GameScene()" );
        // property values
        this._frameCount = 0;

        this._hasGame = false;

        var self = this;
        // callback internal
        this._enterFrameHander = function(){
            self._onEnterFrame( self._frameCount );
            self._frameCount++;
        }
        this._pauseHander = function(){
            log( "pauseHandler" );

            // filter help表示中なら
            if( self._help && self._help.parent ) return;

            self.pauseGame();
        }
    };
    GameScene.prototype = Object.create( MiniScene.prototype ,{

        onPrepare: { value: function(){

            this._bgImage = new ImageView( this.config.game_bg );
            this._btnPause = new Button( this.config.game_btn_pause, "ゲーム画面:一時停止ボタン" );

            this._overlay = new Sprite();
            this._overlay.addChild( new Bitmap( new BitmapData( 1,1,true, this.config.gameOverlayColor ) ) ); // TODO 画像入れたい
            this._overlay.alpha = 0.5;
            this._overlay.width = this.stage.stageWidth;
            this._overlay.height = this.stage.stageHeight;
            // popup
            this._popup = new Sprite();
            this._popupBG = new mini.ImageView( this.config.game_popup_bg );
            this._popupLabelPause = new mini.ImageView( this.config.game_popup_label_pause );
//            this._popupBtnRetry = new mini.Button( this.config.game_popup_btn_retry, "ゲーム画面:リトライボタン" );
            this._popupBtnToTitle = new mini.Button( this.config.game_popup_btn_to_title, "ゲーム画面:タイトルへボタン" );
            this._popupBtnReturnToGame = new mini.Button( this.config.game_popup_btn_return_to_game, "ゲーム画面:ゲームに戻るボタン" );
            this._popupBtnRecommended = new mini.Button( this.config.game_popup_btn_recommended, "ゲーム画面:おすすめボタン" );

            if( this.config.useHelp ) {
                // help
                this._help = new Sprite();
                this._helpBG = new mini.ImageView( this.config.game_help_bg );
                this._helpLabelExplain = new mini.ImageView( this.config.game_help_label_explain );
                this._helpContent = new mini.ImageView( this.config.game_help_content );
            }

            var self = this;

            this._background.addChild( this._bgImage.display );
            this._bgImage.display.x = this.stage.stageWidth/2;
            this._bgImage.display.y = this.stage.stageHeight/2;

            this._foreground.addChild( this._btnPause.display );
            this._btnPause.display.x = 11 + 72/2;
            this._btnPause.display.y = 11 + 78/2;//this.stage.stageHeight/2;
            this._btnPause.onTap = function(){ self.pauseGame() };

            // overlay pause
            this._popup.x = this.stage.stageWidth / 2;
            this._popup.y = this.stage.stageHeight - 320;

            this._popup.addChild( this._popupBG.display );

            var offset = -160;
            this._popup.addChild( this._popupLabelPause.display );
            this._popupLabelPause.display.y = 0 + offset;

            this._popup.addChild( this._popupBtnReturnToGame.display );
            this._popupBtnReturnToGame.display.y = 90 + offset;
            this._popupBtnReturnToGame.onTap = function(){ self.resumeGame(); };

            this._popup.addChild( this._popupBtnToTitle.display );
            this._popupBtnToTitle.display.y = 185 + offset;
            this._popupBtnToTitle.onTap = function(){ Scene.goto("/"); };


            this._popup.addChild( this._popupBtnRecommended.display );
            this._popupBtnRecommended.display.y = 280 + offset;
            this._popupBtnRecommended.onTap = function() {
                // TODO herlockに各広告モジュール組込み後はそれを使うこと
                if( Math.random()>0.5 )
                    app.sendMessage( "showGameFeat" );
                else
                    app.sendMessage( "showAppliPromotion" );

                app.sendMessage( "showBEAD_game" );
                self.pauseGame();
            };

            if( this.config.useHelp ) {
                //
                this._help = new Sprite();
                this._help.x = this.stage.stageWidth / 2;
                this._help.y = this.stage.stageHeight / 2;

                this._help.addChild( this._helpBG.display );
                this._help.addChild( this._helpLabelExplain.display );
                this._helpLabelExplain.y = -190;
                this._help.addChild( this._helpContent.display );
            }

            // Game
            if( this.config.game ) {
                this._game = new this.config.game( this );
                this._hasGame = true;

                this._game._onPrepare();
            }

            MiniScene.prototype.onPrepare.call(this);

        }, writable:true  },

        onShow: { value: function(){
            // ゲーム初期化
            this._onInitGame();
            MiniScene.prototype.onShow.call(this);

            // pause
            this._foreground.removeChild( this._overlay );
            this._foreground.removeChild( this._popup );


            if( this.config.useHelp ) {
                // help
                this._overlay.alpha = 0.5;
                this._help.y = this.stage.stageHeight / 2;
                this._help.alpha = 1;
                this._foreground.addChild( this._overlay );
                this._foreground.addChild( this._help );
                var self = this;
                this._foreground.addEventListener( "touchTap", this._onTapHelp = function(){
                    self._foreground.removeEventListener( "touchTap", self._onTapHelp );
                    //
                    mini.Tween.removeTweens( self._overlay );
                    mini.Tween.removeTweens( self._help );
                    mini.Tween
                        .get( self._overlay, { useTicks: true })
                        .to( { alpha: 0.0 }, 8, mini.Ease.sineIn)
                        .call( function(){
                            self._foreground.removeChild( self._overlay );
                        })
                        .wait(0);
                    mini.Tween
                        .get( self._help, { useTicks: true })
                        .to( { alpha: 0.0, y: self.stage.stageHeight / 2 + 40 }, 8, mini.Ease.circIn )
                        .call( function(){
                            self._foreground.removeChild( self._help );

                            // resume game
                            self.startGame();
                        })
                        .wait(0);
                } );
            } else {
                // resume game
                this.startGame();
            }
        }, writable:true  },

        onHide: { value: function(){
            MiniScene.prototype.onHide.call(this);
        }, writable:true  },


        // GAME LifeCycle

        /**
         * ゲームの初期化処理を実装する
         */
        _onInitGame: { value: function(){
            log("game init");
            if( this._hasGame ) this._game._onInit();
        }, writable:true  },
        /**
         * ゲームの開始処理を実装する
         */
        _onStartGame: { value: function(){
            log("game start");
            if( this._hasGame ) this._game._onStart();
        }, writable:true  },
        /**
         * ゲームの一時停止処理を実装する
         */
        _onPauseGame: { value: function(){
            log("game pause");
            if( this._hasGame ) this._game._onPause();
        }, writable:true  },
        /**
         * ゲームの再開処理を実装する
         */
        _onResumeGame: { value: function(){
            log("game resume");
            if( this._hasGame ) this._game._onResume();
        }, writable:true  },
        /**
         * ゲームの終了処理を実装する
         */
        _onFinishGame: { value: function(){
            log("game finish");
            if( this._hasGame ) this._game._onFinish();
        }, writable:true  },
        /**
         * 毎フレームの処理を実装する
         */
        _onEnterFrame: { value: function( frameCount ){
            if( this._hasGame ) this._game._onEnterFrame( frameCount );
        }, writable:true  },

        // property
        /**
         * startからのフレーム数
         */
        frameCount: { get: function(){ this._frameCount; } },


        // method

        /**
         * ゲームを開始する
         */
        startGame: { value: function(){

            this._onStartGame();

            this._frameCount = 0;

            // enterFrame
            this.stage.addEventListener( "enterFrame", this._enterFrameHander );
            app.addEventListener( "pause", this._pauseHander );
        }, writable:true  },
        /**
         * ゲームを一時停止させる
         */
        pauseGame: { value: function(){
            this._foreground.addChild( this._overlay );
            this._foreground.addChild( this._popup );

            mini.Tween.removeTweens( this._overlay );
            mini.Tween.removeTweens( this._popup );
            this._overlay.alpha = 0;
            mini.Tween
                .get( this._overlay, { useTicks: true })
                .to( { alpha: 0.5 }, 8, mini.Ease.sineOut );
            this._popup.alpha = 0;
            this._popup.y = this.stage.stageHeight - 320 + 40;
            mini.Tween
                .get( this._popup, { useTicks: true })
                .to( { alpha: 1, y: this.stage.stageHeight - 320 }, 8, mini.Ease.circOut );

            //
            this._onPauseGame();

            // enterFrame
            this.stage.removeEventListener( "enterFrame", this._enterFrameHander );
        }, writable:true  },
        /**
         * ゲームを再開させる
         */
        resumeGame: { value: function(){

            var self = this;

            mini.Tween.removeTweens( this._overlay );
            mini.Tween.removeTweens( this._popup );
            mini.Tween
                .get( this._overlay, { useTicks: true })
                .to( { alpha: 0.0 }, 8, mini.Ease.sineIn)
                .call( function(){
                    self._foreground.removeChild( self._overlay );
                })
                .wait(0);
            mini.Tween
                .get( this._popup, { useTicks: true })
                .to( { alpha: 0.0, y: this.stage.stageHeight - 320 + 40 }, 8, mini.Ease.circIn )
                .call( function(){
                    self._foreground.removeChild( self._popup );

                    // resume game
                    self._onResumeGame();
                    // enterFrame
                    self.stage.addEventListener( "enterFrame", self._enterFrameHander );
                })
                .wait(0);

        }, writable:true  },
        /**
         * ゲームを終了する
         * @param {Number} score スコア指定なければ結果画面へ遷移しない
         */
        finishGame: { value: function( score ){
            //
            this._onFinishGame();

            this._rootContainer.mouseChildren = false;

            // stop enterFrame
            this.stage.removeEventListener( "enterFrame", this._enterFrameHander );
            app.removeEventListener( "pause", this._pauseHander );


            // playCount
            this.user.playCount++;

            // goto result
            if( arguments.length > 0 ) // 互換
                this.goto( "/result?score=" + score );
        }, writable:true  },


        // parts
        /**
         * 背景
         * @type mini.ImageView
         */
        backgroundImage: { get: function(){ return this._bgImage; } },
        /**
         * 一時停止ボタン
         * @type mini.Button
         */
        buttonPause: { get: function(){ return this._btnPause; } },
        /**
         * ポップアップ
         * @type Sprite
         */
        popup: { get: function(){ return this._popup; } },
        /**
         * ポップアップ背景
         * @type mini.ImageView
         */
        popupBG: { get: function(){ return this._popupBG; } },
        /**
         * ポップアップ内 一時停止ラベル
         * @type mini.Button
         */
        popupLabelPause: { get: function(){ return this._popupLabelPause; } },
        /**
         * ポップアップ内 リトライボタン
         * @type mini.Button
         */
        popupBtnRetry: { get: function(){ return this._popupBtnRetry; } },
        /**
         * ポップアップ内 タイトルへボタン
         * @type mini.Button
         */
        popupBtnToTitle: { get: function(){ return this._popupBtnToTitle; } },
        /**
         * ポップアップ内 ゲームに戻るボタン
         * @type mini.Button
         */
        popupBtnReturnToGame: { get: function(){ return this._popupBtnReturnToGame; } },
        /**
         * ヘルプ
         * @type Sprite
         */
        help: { get: function(){ return this._help; } },
        /**
         * ヘルプ背景
         * @type mini.ImageView
         */
        helpBG: { get: function(){ return this._helpBG; } },
        /**
         * ヘルプ内 遊び方ラベル
         * @type mini.ImageView
         */
        helpLabelExplain: { get: function(){ return this._helpLabelExplain; } },
        /**
         * ヘルプ内 コンテンツ画像
         * @type mini.ImageView
         */
        helpContent: { get: function(){ return this._helpContent; } }
    });
    mini.GameScene = GameScene;


    /**
     * 結果シーン
     * @constructor
     */
    var ResultScene = function(){
        MiniScene.apply( this, arguments );
        log( "new ResultScene()" );
    };
    ResultScene.prototype = Object.create( MiniScene.prototype ,{

        onPrepare: { value: function(){
            log( "ResultScene.onPrepare" );

            this._bgImage = new ImageView( this.config.result_bg );
            this._popup = new Sprite();
            this._popupBG = new ImageView( this.config.result_popup_bg );
            this._popupLabelResult = new ImageView( this.config.result_popup_label_result );
            this._popupLabelBest = new ImageView( this.config.result_popup_label_best );
            this._btnToTitle = new Button( this.config.result_btn_to_title, "結果画面:タイトルへボタン" );
            this._btnRetry = new Button( this.config.result_btn_retry, "結果画面:リトライボタン" );
            this._btnLine = new Button( this.config._btn_line, "結果画面:Lineボタン" );
            this._btnFacebook = new Button( this.config._btn_facebook, "結果画面:Facebookボタン" );
            this._btnTwitter = new Button( this.config._btn_twitter, "結果画面:Twitterボタン" );
            this._btnRecommendedSmall = new Button( this.config.result_btn_recommended_small, "結果画面:おすすめ(小)ボタン" );
            this._adAreaBG = new Bitmap( new BitmapData( 1, 1, true , 0xff000000) ); // TODO 画像化

            this._popupScoreView = new NumericImage();
            this._popupBestScoreView = new NumericImage();

            var self = this;

            this._background.addChild( this._bgImage.display );
            this._bgImage.display.x = this.stage.stageWidth/2;
            this._bgImage.display.y = this.stage.stageHeight/2;

            this._popup.x = this.stage.stageWidth/2;
            this._popup.y = this.stage.stageHeight/2;
            this._foreground.addChild( this._popup );

            this._popup.addChild( this._popupBG.display );
            this._popupBG.display.y = -115;

            this._popup.addChild( this._popupLabelResult.display );
            this._popupLabelResult.display.y = -245;

            this._popup.addChild( this._popupLabelBest.display );
            this._popupLabelBest.display.y = -70;

            this._popup.addChild( this._popupScoreView.display );
            this._popupScoreView.display.y = -152;
            this._popupScoreView.value = 0;

            this._popup.addChild( this._popupBestScoreView.display );
            this._popupBestScoreView.display.y = -13;
            this._popupBestScoreView.display.scaleX = this._popupBestScoreView.display.scaleY = 0.7;
            this._popupBestScoreView.value = 0;


            var margin = 12;
            var offset = 100 / 2 + margin;
            this._foreground.addChild( this._btnRecommendedSmall.display );
            this._btnRecommendedSmall.display.x = 640 - offset;
            this._btnRecommendedSmall.display.y = this.stage.stageHeight/2 -580 + 200 + margin + 78/2;
            this._btnRecommendedSmall.onTap = function(){
                // TODO herlockに各広告モジュール組込み後はそれを使うこと
                if( Math.random()>0.5 )
                    app.sendMessage( "showGameFeat" );
                else
                    app.sendMessage( "showAppliPromotion" );

                app.sendMessage( "showBEAD_result" );
            };

            offset += 100 / 2 + 72 / 2 + margin;
            this._foreground.addChild( this._btnLine.display );
            this._btnLine.display.x = 640 - offset;
            this._btnLine.display.y = this.stage.stageHeight/2 -580 + 200 + margin + 78/2;
            this._btnLine.onTap = function(){ line.postMessage( application.createMessage( "line" ) ); };

            offset += 72 / 2 + 72 / 2 + margin;
            this._foreground.addChild( this._btnTwitter.display );
            this._btnTwitter.display.x = 640 - offset;
            this._btnTwitter.display.y = this.stage.stageHeight/2 -580 + 200 + margin + 78/2;
            this._btnTwitter.onTap = function(){ twitter.postMessage( application.createMessage( "twitter" ) ); };

            offset += 72 / 2 + 72 / 2 + margin;
            this._foreground.addChild( this._btnFacebook.display );
            this._btnFacebook.display.x = 640 - offset;
            this._btnFacebook.display.y = this.stage.stageHeight/2 -580 + 200 + margin + 78/2;
            this._btnFacebook.onTap = function(){
                var message = application.createMessage( "facebook" );
                var storeURL = self.config[ "store" + ( app.isIOS? "IOS" : "Android" ) ];
                facebook.postFeed( self.config.name, storeURL, message );
            };

            // TODO androidでfacebook投稿がイマイチなので
            if( app.isANDROID ) this._btnFacebook.display.visible = false;

            // ad bg.png
            if( false && !this.config.screenshotMode ) {
                this._foreground.addChild( this._adAreaBG );
                this._adAreaBG.alpha = 0.3;
                this._adAreaBG.width = this.stage.stageWidth;
                this._adAreaBG.height = this.stage.stageWidth / 640 * 200;
                this._adAreaBG.x = 0;
                this._adAreaBG.y = 57 + this.stage.stageHeight/2;
            }


            this._foreground.addChild( this._btnToTitle.display );
            this._btnToTitle.display.x = -140 + this.stage.stageWidth/2;
            this._btnToTitle.display.y = 310 + this.stage.stageHeight/2;
            this._btnToTitle.onTap = function(){ self.goto("/"); };

            this._foreground.addChild( this._btnRetry.display );
            this._btnRetry.display.x = 140 + this.stage.stageWidth/2;
            this._btnRetry.display.y = 310 + this.stage.stageHeight/2;
            this._btnRetry.onTap = function(){ self.goto("/game"); };


            MiniScene.prototype.onPrepare.call(this);
        }, writable:true  },

        onShow: { value:function(){

            // score
            var score = this.parameters.score;
            this.user.score = score;
            this._popupScoreView.value = this.user.score;
            this._popupBestScoreView.value = this.user.bestScore;

            // popup animation
            var self = this;
            this._popup.alpha = 0.01;
            this._popup.scaleX = this._popup.scaleY = 3;
            mini.Tween
                .get( this._popup, { useTicks:true })
                .wait( 20 )
                .to( { scaleX:0.9, scaleY:0.9, alpha:1 }, 9 )
                .to( { scaleX:1, scaleY:1 }, 6, mini.Ease.sineOut)
                .wait( 10 )
                .call(function(){
                    // finish fade animation

                    // new record?
                    if( self.user.score === self.user.bestScore ) {
                        // new record!
                        self._onUpdateNewRecord( self.user.score );
                    }

                }).wait(0);

            // ベストスコアなら...
            if( this.user.score === this.user.bestScore ) {
                // ランク更新
                var self = this;
                mini.HerlockRankingAPI.put( function( xhr ){
                    var json;
                    // jsonパース
                    try{ json = JSON.parse( xhr.responseText ); }catch(e){ return log(e); }
                    // エラーチェック
                    if( json.error_message !== "" ) return log( JSON.stringify( json) );// TODO
                    // ランク取得
                    try{
                        var prev = self.user.rank;
                        var rank = json.result.me.rank;
                        self.user.rank = rank;
                        if( prev !== rank )
                            self._onUpdateRank( rank, prev === -1? 0: (rank - prev) );
                    } catch (e){ return log(e) ; }

                }, this.config.herlockRankingId, this.user.id, this.user.name, score );
            }


            // show inline ad
            if( this.config.useResultAdIcons && !this.config.screenshotMode ) setTimeout( function(){ app.sendMessage( "showAdIcons" ); }, 50);

            MiniScene.prototype.onShow.call(this);
        }, writable:true  },
        onHide: { value: function(){
            MiniScene.prototype.onHide.call(this);

            // hide inline ad
            if( !this.config.screenshotMode ) app.sendMessage( "hideAdIcons" );
        }, writable:true  },


        /**
         * ベスト更新時
         */
        _onUpdateNewRecord: { value: function( score ){ log("new record: " + score); }, writable:true },

        /**
         * 世界ランク更新時
         */
        _onUpdateRank: { value: function( rank, diff ){ log("update rank: " + score + " diff: " + diff); }, writable:true  },

        // parts
        /**
         * 背景
         * @type mini.ImageView
         */
        backgroundImage: { get: function(){ return this._bgImage; } },
        /**
         * ポップアップ
         * @type Sprite
         */
        popup: { get: function(){ return this._popup; } },
        /**
         * ポップアップ背景
         * @type mini.ImageView
         */
        popupBG: { get: function(){ return this._popupBG; } },
        /**
         * ポップアップ内 結果ラベル
         * @type mini.ImageView
         */
        popupLabelResult: { get: function(){ return this._popupLabelResult; } },
        /**
         * ポップアップ内 ベストラベル
         * @type mini.ImageView
         */
        popupLabelBest: { get: function(){ return this._popupLabelBest; } },
        /**
         * ポップアップ内 スコア数値画像View
         * @type mini.NumericImage
         */
        popupScoreView: { get: function(){ return this._popupScoreView; } },
        /**
         * ポップアップ内 ベストスコア数値画像View
         * @type mini.NumericImage
         */
        popupBestScoreView: { get: function(){ return this._popupBestScoreView; } },
        /**
         * タイトルへボタン
         * @type mini.Button
         */
        btnToTitle: { get: function(){ return this._btnToTitle; } },
        /**
         * リトライボタン
         * @type mini.Button
         */
        btnRetry: { get: function(){ return this._btnRetry; } },
        /**
         * Lineボタン
         * @type mini.Button
         */
        btnLine: { get: function(){ return this._btnLine; } },
        /**
         * Facebookボタン
         * @type mini.Button
         */
        btnFacebook: { get: function(){ return this._btnFacebook; } },
        /**
         * Twitterボタン
         * @type mini.Button
         */
        btnTwitter: { get: function(){ return this._btnTwitter; } },
        /**
         * おすすめボタン（小）
         * @type mini.Button
         */
        btnRecommendedSmall: { get: function(){ return this._btnRecommendedSmall; } },
        /**
         * 広告エリア背景
         * @type Bitmap
         */
        adAreaBG: { get: function(){ return this._adAreaBG; } }

    });
    mini.ResultScene = ResultScene;



    /**
     * ゲーム抽象クラス
     * ライフサイクル
     * new -> prepare -> init -> start -> enterFrame [pause -> resume] -> finish -> init -> ...
     *
     * @param {mini.GameScene} scene
     * @constructor
     */
    var Game = function( scene ){
        this._scene = scene;
    };
    Game.prototype = Object.create( {}, {

        // property
        /**
         * user
         * @type mini.User
         */
        user: { get: function(){ return application.user; } },
        /**
         * config
         * @type mini.Config
         */
        config: { get: function(){ return application.config; } },
        /**
         * ゲームシーン
         * @type mini.GameScene
         */
        scene: { get: function(){ return this._scene; } },
        /**
         * ステージ
         * @type Stage
         */
        stage: { get: function(){ return this._scene.stage; } },
        /**
         * 表示コンテナ 主にゲーム表示要素はここへ入れる
         * @type Sprite
         */
        container: { get: function(){ return this._scene.container; } },
        /**
         * 背景用表示コンテナ 背景画像等ゲーム表示要素の背面に表示したいものをここへ入れる
         * @type Sprite
         */
        background: { get: function(){ return this._scene.background; } },
        /**
         * 前景用表示コンテナ ナビゲーション等ゲーム表示要素の前面に表示したいものをここへ入れる
         * @type Sprite
         */
        foreground: { get: function(){ return this._scene.foreground; } },

        // method
        /**
         * ゲームを終了し結果画面へ
         * @param {Number} score
         */
        finish: { value: function( score ){
            this.scene.finishGame( score );
        }, writable:true  },

        // template methods
        /**
         * ゲーム準備処理を実装する
         */
        _onPrepare: { value: function(){
            log("game prepare");

            // SAMPLE 5秒ゲーム
            this._btnTapSample5Game = new mini.Button( "./assets/mini/sample/btn_five.png" );
            this._btnTapSample5Game.display.x = this.stage.stageWidth/2;
            this._btnTapSample5Game.display.y = this.stage.stageHeight/2;
            this.container.addChild( this._btnTapSample5Game.display );
        }, writable:true  },
        /**
         * ゲームの初期化処理を実装する
         */
        _onInit: { value: function(){ log("game init"); }, writable:true  },
        /**
         * ゲームの開始処理を実装する
         */
        _onStart: { value: function(){
            log("game start");

            // SAMPLE 5秒ゲーム
            if( !this._btnTapSample5Game ) return;
            var start = Date.now();
            var self = this;
            this._btnTapSample5Game.onTap = function(){
                var score = ( ( Date.now() - start ) - 5000 ) / 1000;
                self.finish( Math.abs( score ) );
            };
        }, writable:true  },
        /**
         * ゲームの一時停止処理を実装する
         */
        _onPause: { value: function(){ log("game pause"); }, writable:true  },
        /**
         * ゲームの再開処理を実装する
         */
        _onResume: { value: function(){ log("game resume"); }, writable:true  },
        /**
         * ゲームの終了処理を実装する
         */
        _onFinish: { value: function(){ log("game finish"); }, writable:true  },
        /**
         * 毎フレームの処理を実装する
         * @param {Number} frameCount
         */
        _onEnterFrame: { value: function( frameCount ){ ; }, writable:true  }

    } );
    mini.Game = Game;


    /********
     *
     */
    var TplScene = function( tplName ){
        MiniScene.apply( this, arguments );
        this._content = null;
        this._tplName = tplName;
    };
    TplScene.prototype = Object.create( MiniScene.prototype ,{

        content: { get: function() { return this._content; }, set: function( value ) {
            this._content = value;

        } },

        // tplName
        _onPrepare: { value: function(){
            //
            var loader = new XMLHttpRequest();
            loader.open( "GET", "./tpl/" + this._tplName + ".json" );
            var self = this;
            loader.onload = function(){
                var jsonObject = null;
                try{
                    jsonObject = JSON.parse( this.responseText );
                } catch(e) {
                    throw "JSONのパースに失敗しました。" +  self._tplName + ".json";
                }
                self._content = mini.parse( jsonObject );
                self._content.addTo( self.container );
            };
            loader.send();
        }, writable:true  },

    });
    mini.TplScene = TplScene;



        /********************************************************************************************************************
     * Model
     */

    /**
     * モデルオブジェクトの抽象クラス
     * ・ミニマム構成では単体で稼働するシングルトン実装になる想定。
     * ・マスター＜＝＞トランザクション関係構築時はトランザクションテーブル相当
     * @constructor
     */
    var ModelObject = function( uniqueKey ){
        this._uniqueKey = uniqueKey;
        var saved = localStorage.getItem( this._uniqueKey );
        if( saved ){
            this._data = JSON.parse( saved );
        } else {
            this._data = this._createInitialData();
            this.save();
        }
        this._autoSave = true;
    };
    ModelObject.prototype = Object.create({},{
        // protected
        /**
         * 初期データオブジェクトを生成
         * Template Method
         * @return Object
         */
        _createInitialData: { value: function(){ return {}; }, writable:true  },

        // property
        /**
         * 自動保存
         * @type {Boolean}
         */
        autoSave: { get: function() { return this._autoSave; }, set: function( value ) {
            this._autoSave = value;
        } },

        // method
        /**
         * データ保存
         */
        save: { value: function(){
            if(!this._lock) localStorage.setItem( this._uniqueKey, this.toJSONString() );
            return this;
        }, writable:true  },
        _save:{value:function(){ this.save() }},//互換用

        /**
         * プロパティを複数設定
         * @param {Object} props
         */
        setProps: { value: function( props ){
            for( var propName in props ) this._data[propName] = props[propName];
            this.save();
            return this;
        }, writable:true  },
        /**
         * プロパティを設定
         * @param {*} key or object
         * @param {*} [value]
         */
        set: { value: function( key, value ){
            if( arguments.length<=1 ) return this.setProps( arguments[0] );
            this._data[key] = value;
            this.save();
            return this;
        }, writable:true  },
        /**
         * プロパティを取得
         * @param {String} key
         * @param {*} [defaultValue]
         * @return {*}
         */
        get: { value: function( key, defaultValue ){
            return this._data.hasOwnProperty(key)? this._data[key]: arguments.length>1? defaultValue: null;
        }, writable:true  },

        /**
         * JSON化
         */
        toJSONString: { value: function(){ return JSON.stringify( this._data ); }, writable:true  }

    });
    mini.ModelObject = ModelObject;

    /**
     * モデル抽象クラス
     * ・静的な設定データのラッパー
     * ・マスター＜＝＞トランザクション関係構築時はマスターテーブル相当
     * @constructor
     */
    var Model = function(){};
    Model.prototype = Object.create({},{

    });
    mini.Model = Model;


    /**
     * ユーザーモデルオブジェクト
     * @constructor
     */
    var User = function(){
        ModelObject.call( this, "user" );
    }
    User.prototype = Object.create( ModelObject.prototype, {

        /**
         * 初期データオブジェクトを生成
         */
        _createInitialData: { value: function(){
            // TODO ユーザーユニークなIDの発行 現状random値
            return { score:0, bestScore:0, launchCount:0, id: Math.random() + "" + Math.random() };
        }, writable:true  },

        /**
         * ユーザー識別子
         */
        id: { get: function(){ return this.get("id", null); } },

        /**
         * ユーザー名
         */
        name: { get: function(){ return this.get("name", "no name"); } },
        /**
         * ユーザー名の指定 失敗時はfalseを返す
         * @param {String} value
         * @return Boolean
         */
        setName: { value: function( value ){
            if( NGWord.check(value)!==true ) return false;
            this.set( { name: ""+value } );
            return true;
        }, writable:true  },

        /**
         * スコア
         */
        score: {
            get: function(){ return this.get("score", 0); },
            set: function ( value ) {
                value = parseFloat( value );
                this._data.score = value;
                //
                var best = this.bestScore;
                if( !best || this.compareScore( value, best ) )
                    this._data.bestScore = value; // ベスト更新
                //
                this.save();
            }
        },
        /**
         * スコアのベスト記録
         */
        bestScore: { get: function(){ return this.get("bestScore", 0); } },
        /**
         * スコア比較関数
         * Template Method
         */
        compareScore: { value: function( a, b ){ return a >= b; }, writable:true  },

        /**
         * 起動回数
         * @type Number
         */
        launchCount:{ get: function(){ return this.get("launchCount",0); } },
        _launch:{ value: function(){
            this.set( { launchCount : this.launchCount + 1 } );
        }, writable:true  },

        /**
         * プレイ回数
         * @type Number
         */
        playCount: { get: function(){ return this.get("playCount", 0); },
            set: function( value ){
                this.set( { playCount: value } );
            }
        },

        /**
         * ランキング
         * @type Number
         */
        rank: { get: function(){ return this.get("rank", -1); },
            set: function( value ){
                this.set( { rank: value } );
            }
        }
    } );
    mini.User = User;


    /**
     * 報酬モデル コレクション,称号,勲章,機能解除など、特定の条件とそれに対する報酬の抽象管理オブジェクトクラス
     * @constructor
     */
    var Prize = function(){
        ModelObject.call( this, "prize" );
        this._master = {};
    };
    Prize.prototype = Object.create( ModelObject.prototype, {

        // props

        /**
         * 報酬の付与を行う
         * @return {Boolean}
         */
        onGrant: { value: function(){ return false; }, writable:true  },


        // methods

        /**
         * 報酬を定義する
         */
        define: { value: function( definitions ){
            for( var name in definitions )
                this._master[name] = definitions[i];
        }, writable:true  },
        /**
         * 条件達成時に呼ぶ
         */
        achieve: { value: function( name ){
            this.set( name, { achieved:true, has:false } );
        }, writable:true  },

        /**
         * 条件達成した報奨をチェック
         * @param {Boolean} [oneByOne] 1つずつチェックしたい場合はtrue
         */
        check: { value: function( oneByOne ){
            for( var name in this._master ) {
                var prize = this._master[name];
                // filter
                if( this.has(name) ) continue;
                // condition
                if( prize.condition && prize.condition( application.user ) ) this.achieve( name );
                // check
                if( !this._data[name] || this._data[name].achieved !== true ) continue;
                // grant
                if( !this.onGrant( prize ) ) continue;
                // save
                this.set( name, { achieved:true, has:true } );
                //
                if( oneByOne ) return;
            }
        }, writable:true  },

        /**
         * 報酬付与済みならtrue
         */
        has: { value: function( name ){
            return this._data[name] && this._data[name].has;
        }, writable:true  }

    });
    mini.Prize = Prize;


    /********************************************************************************************************************
     * View
     */

    /**
     * View基底クラス
     * @constructor
     */
    var View = function(){
        this._display = new Sprite();
    };
    View.prototype = Object.create( {}, {
        /**
         * 内包する表示オブジェクトの参照
         * @type {Sprite}
         */
        display: { get: function(){ return this._display; } },
        /**
         * x
         * @type {Number}
         */
        x:{ get: function(){ return this._display.x; }, set: function( value ){ this._display.x = value; } },
        /**
         * y
         * @type {Number}
         */
        y:{ get: function(){ return this._display.y; }, set: function( value ){ this._display.y = value; } },
        /**
         * scaleX
         * @type {Number}
         */
        scaleX:{ get: function(){ return this._display.scaleX; }, set: function( value ){ this._display.scaleX = value; } },
        /**
         * scaleY
         * @type {Number}
         */
        scaleY:{ get: function(){ return this._display.scaleY; }, set: function( value ){ this._display.scaleY = value; } },
        /**
         * alpha
         * @type {Number}
         */
        alpha:{ get: function(){ return this._display.alpha; }, set: function( value ){ this._display.alpha = value; } },
        /**
         * rotation
         * @type {Number}
         */
        rotation:{ get: function(){ return this._display.rotation; }, set: function( value ){ this._display.rotation = value; } },
        /**
         * visible
         * @type {Boolean}
         */
        visible:{ get: function(){ return this._display.visible; }, set: function( value ){ this._display.visible = value; } },

        // method
        /**
         * プロパティを設定
         * @param {String} propName
         * @param {*} value
         */
        setProp: { value: function( propName, value ){ this[propName] = value; return this; }, writable:true  },
        /**
         * プロパティを複数設定
         * @param {Object} props
         */
        setProps: { value: function( props ){
            for( var propName in props ) this[propName] = props[propName];
            return this;
        }, writable:true  },
        /**
         * 表示オブジェクトのプロパティを設定
         * @param {String} propName
         * @param {*} value
         */
        setDisplayProp: { value: function( propName, value ){ this._display[propName] = value; return this; }, writable:true  },
        /**
         * 表示オブジェクトのプロパティを複数設定
         * @param {Object} props
         */
        setDisplayProps: { value: function( props ){
            for( var propName in props ) this._display[propName] = props[propName];
            return this;
        }, writable:true  },
        /**
         * 座標調整
         * @param {Number} x
         * @param {Number} y
         */
        offset: { value: function( x, y ){ this._display.x += x; this._display.y += y; return this; }, writable:true  },
        /**
         * スケール指定
         * @param {Number} x
         * @param {Number} y
         */
        scale: { value: function( x, y ){ this._display.scaleX = x; this._display.scaleY = y; return this; }, writable:true  },
        /**
         * 指定表示オブジェクトの子要素へ追加
         * @param {Sprite} parent
         */
        addTo: { value: function( parent ){ parent.addChild( this._display ); return this; }, writable:true  },
        /**
         * 表示ツリーから削除
         */
        removeFromParent: { value: function(){
            if( this._display.parent === null ) return this;
            this._display.parent.removeChild( this._display );
            return this;
        }, writable:true  },
        /**
         * Tween指定
         *  @param {Object} prop
         *  @param {Number} frame
         *  @param {Function} ease
         */
        tween: { value: function( prop, frame, ease ){
            mini.Tween.removeTweens( this._display );
            return mini.Tween.get( this._display, { useTicks:true }).to( prop, frame||15, ease||mini.Tween.sineInOut );
        }, writable:true  }
    });
    mini.View = View;

    /**
     * Viewのコンテナ
     * @param views
     * @constructor
     */
    var ContainerView = function( views ){
        View.call(this);
        for( var name in views ){
            views[name].addTo( this.display );
            if( !this.hasOwnProperty(name) )this[name] = views[name];
        }
        this._views = views;
    };
    ContainerView.prototype = Object.create( View.prototype, {
        /**
         * 子要素 { name: view, ... }
         * @type {Object}
         */
        views: { get: function(){ return this._views; } }
    });
    mini.ContainerView = ContainerView;


    /**
     * リストView
     * @constructor
     */
    var ListView = function(){
        View.call(this);

        window.test = this;

        this._area = new Bitmap( new BitmapData( 1,1,true, 0x00ff0000 ) );
        this._display.addChild( this._area );
        this._mask = new Bitmap( new BitmapData( 1,1,true, 0x33ff0000 ) );
        this._mask.visible = false;
        this._display.addChild( this._mask );
        this._container = new Sprite();
        this._container.mask = this._mask;
        this._display.addChild( this._container );

        this._offset = 0;

        this._rows = [];
        this._rowInfo = {offset:0,length:0, visbleRows:[]};

        this._width = 640;
        this._height = 640;
        this._length = -1;


        this._touchInfo = { speed:{x:0,y:0}, prev:null, stopTapPropagation:false };

        var self = this;
        var prevY = null;
        this.display.addEventListener("touchTap", function( e ){
            if(self._touchInfo.stopTapPropagation) e.stopPropagation();
        }, true );
        this.display.addEventListener("touchBegin", function( e ){
            e.stopPropagation();
            prevY = e.stageY;
            self._touchInfo.prev = { x:e.stageX, y:e.stageY };
            self._display.removeEventListener( "enterFrame", self._oef );

            this.stage.addEventListener( "touchEnd", function(){
                setTimeout( function(){ self._touchInfo.stopTapPropagation = false;},10);
                self._display.addEventListener( "enterFrame", self._oef );
            } );
        } );
        this.display.addEventListener("touchMove", function( e ){
            self._touchInfo.stopTapPropagation = true;
            if( prevY===null ) prevY = e.stageY;
            self.scroll( e.stageY - prevY );
            prevY = e.stageY;

            var touchInfo = self._touchInfo;
            var speed = { x:e.stageX - touchInfo.prev.x, y:e.stageY - touchInfo.prev.y };
            touchInfo.speed.x = speed.x * 0.5 + touchInfo.speed.x * 0.5;
            touchInfo.speed.y = speed.y * 0.5 + touchInfo.speed.y * 0.5;
            touchInfo.prev = { x:e.stageX, y:e.stageY };
        } );

        this._oef = function(){ self._onEnterFrame(); }
        this._display.addEventListener( "enterFrame", this._oef );

        this._updateArea();
    };
    ListView.prototype = Object.create( View.prototype, {

        width:{ get: function() { return this._width; }, set: function( value ) {
            this._width = value;
            this._updateArea();
        } },

        height: { get: function() { return this._height; }, set: function( value ) {
            this._height = value;
            this._updateArea();
        } },

        length: { get: function() { return this._length; }, set: function( value ) {
            this._length = value;
            this._updateArea();
        } },
        
        onCreateRow: { value: function(index,row){ return null; }, writable:true  },

        // internal
        _updateArea: { value: function(){
            // area
            this._area.x = -this._width/2;
            this._area.y = -this._height/2;
            this._area.width = this._width;
            this._area.height = this._height;

            this._mask.x = -this._width/2;
            this._mask.y = -this._height/2;
            this._mask.width = this._width;
            this._mask.height = this._height;

            if( this.display.parent )
                this.scroll(0);
        }, writable:true  },

        _getRow: { value: function( index ){
            if( index < 0 ) return null;
            if( this._rows[index] ) return this._rows[index];
            if( this._length!==-1 && this._length <= index ) return null;
            var row = this.onCreateRow( index, { index:index, height: 100, content: new Sprite() } );
            if( row === null ) return null;
            this._rows[index] = row;
            this._rows[index].offset = index===0? 0: this._rows[index-1].offset + this._rows[index].height;
            return this._rows[index];
        }, writable:true  },

        _onEnterFrame: { value: function(){
            if( this._touchInfo.speed.y === 0 )return;
            this.scroll( this._touchInfo.speed.y );
            this._touchInfo.speed.y *= 0.9;
            if( Math.abs(this._touchInfo.speed.y) < 0.5 )this._touchInfo.speed.y = 0;
        }, writable:true  },

        // method

        setOnCreateRow: { value: function( func ){
            this.onCreateRow = func;
            return this;
        }, writable:true  },

        addTo: { value: function(){
            View.prototype.addTo.apply(this, arguments);
            this.scroll(0);
            return this;
        }, writable:true  },

        scroll: { value: function( value ){
            this._offset -= value;

            // filter
            if( this._offset < 0 ) this._offset = 0;

            var rowInfo = { offset: -1, length: 0 };

            // 描画範囲のrowを算出
            var i = 0;
            while( true ) {
                var row = this._getRow(i);
                if( row === null ) {
                    var end = this._getRow(i-1);
                    if(!end)return;
//                    log( "before",this._offset );
                    var offset = end.offset + end.height - this._area.height;
                    if( this._offset > offset ) this._offset = offset;
//                    log( end.offset, end.height, this._area.height );
//                    log( "after",this._offset );
                    break;
                }
                // 上
                if( this._offset > (row.offset + row.height) ){ i++; continue };
                // 下
                if( (this._offset + this._area.height) < (row.offset) ) break;

                if( rowInfo.offset === -1 ) rowInfo.offset = i;
                rowInfo.length++;
                i++;
            }

            //
            var start = Math.min( rowInfo.offset, this._rowInfo.offset );
            var end = Math.max( rowInfo.offset + rowInfo.length, this._rowInfo.offset + this._rowInfo.length );
            var rowOffset = -(this._offset - this._getRow(rowInfo.offset).offset);
            //
            for( var i = start; i <= end; i++ ) {
                var row = this._getRow(i);
                if(!row) break;

                // 表示領域の上
                if( i < rowInfo.offset ){
                    this._container.removeChild( row.content );
                    continue;
                }
                // 表示領域の下
                if( (rowInfo.offset+rowInfo.length) < i ){
                    this._container.removeChild( row.content );
                    continue;
                }

//                log( "-----", i, this._offset + this._area.height, row.offset, rowOffset );
                // 表示
                this._container.addChild( row.content );
                row.content.y = -this._area.height/2 + row.height/2 + rowOffset;
                rowOffset += row.height;
            }

            this._rowInfo = rowInfo;
        }, writable:true  },
    });
    mini.ListView = ListView;


    /**
     * 画像読み込み表示View
     * @param {String} url
     * @param {Bitmap} [bmp]
     * @constructor
     */
    var ImageView = function( url, bmp ){
        View.apply(this, arguments);
        this._display.name = "ImageView: " + url || bmp;

        this._bmp = bmp || null;
        this._image = null;

        // clone機能対応
        this._waitingClones = [];

        var self = this;
        if( !this._bmp && url ) {
            // url
            var image = new Image( url );
            image.onload = function(){ self._onImageLoaded( this ); };
        } else if( this._bmp ) {
            // bitmap
            this._bmp.x = -this._bmp.width/2;
            this._bmp.y = -this._bmp.height/2;
            this._display.addChildAt( this._bmp, 0 );
            // 非同期感
            setTimeout( function(){ if( self.onLoad !== null ) self.onLoad(); },1 );
        } else {
            // empty

        }
    };
    ImageView.prototype = Object.create( View.prototype, {

        // property
        bitmap: { get: function(){ return this._bmp; } },
        width:{
            get: function(){ return this._bmp.width; },
            set: function( value ){
                this._bmp.width = value;
                this._bmp.x = -this._bmp.width/2;
            }
        },
        height:{
            get: function(){ return this._bmp.height; },
            set: function( value ){
                this._bmp.height = value;
                this._bmp.y = -this._bmp.height/2;
            }
        },
        isLoaded: { get: function(){ return this._bmp !== null; } },

        // callback
        onLoad: { value: null, writable:true  },

        // internal method
        _onImageLoaded: { value: function( image ){
            this._setBitmap( new Bitmap( new BitmapData( image ) ) );
        }, writable:true  },

        _setBitmap: { value: function( bmp ){
            this._bmp = bmp;
            this._bmp.x = -this._bmp.width/2;
            this._bmp.y = -this._bmp.height/2;
            this._display.addChildAt( this._bmp, 0 );

            if( this.onLoad !== null ) this.onLoad();

            // clones
            for( var i in this._waitingClones ) {
                this._waitingClones[i]._setBitmap( new Bitmap( this._bmp.bitmapData ) );
                log( this._waitingClones[i].bitmap.bitmapData.width );
            }
            this._waitingClones = [];
        }, writable:true  },

        // method
        /**
         * onLoadコールバックの指定
         * @param {Function} callback
         * @return {mini.ImageView}
         */
        setOnLoad: { value: function( callback ){ this.onLoad = callback; return this; }, writable:true  },

        /**
         * 画像参照の強制破棄
         */
        dispose: { value: function(){
            // TODO
        }, writable:true  },

        /**
         * 同じ画像をもつImageViewを複製する
         */
        clone: { value: function(){
            //
            if( this._bmp ) {
                // 読み込み済み
                return new ImageView( null, new Bitmap( this._bmp.bitmapData ) );
            } else {
                // 読み込み中
                var clone = new ImageView();
                clone.display.name = this.display.name + ":clone";
                this._waitingClones.push( clone );
                return clone;
            }
        }, writable:true  },
    } );
    mini.ImageView = ImageView;

    /**
     * 単色View
     * @param {Number} color
     * @constructor
     */
    var ColorView = function( color ){
        color = color > 0xffffff ? color: 0xff000000 + color;
        ImageView.call( this, null, new Bitmap( new BitmapData( 1,1,true, color ) ) );
        this.scale(100,100);
    };
    ColorView.prototype = Object.create( ImageView.prototype, {} );
    mini.ColorView = ColorView;

    /**
     * テキストView
     * @param {String} value
     * @constructor
     */
    var TextView = function( value ){
        View.call(this);
        this._tf = new TextField();
        this._tf.text = "" + value;
        this._display.addChild( this._tf );

        this._width = null;
        this._height = null;
        this._layout();
    };
    TextView.prototype = Object.create( View.prototype, {

        width: { get: function() { return this._width; }, set: function( value ) {
            this._width = value;
            this._layout();
        } },
        height: { get: function() { return this._height; }, set: function( value ) {
            this._height = value;
            this._layout();
        } },

        text: { get: function() { return this._tf._text; }, set: function( value ) {
            this._tf.text = value;
            this._layout();
        } },
        
        _layout: { value: function(){
            // autoSize?
            if( this._width === null && this._height === null ) {
                this._tf.wordWrap = false;
                this._tf.autoSize = "left";
            } else if( this._width === null && this._height !== null ) {
                this._tf.wordWrap = false;
                this._tf.autoSize = "left";
            } else if( this._width !== null && this._height === null ) {
                this._tf.wordWrap = true;
                this._tf.autoSize = "left";
                this._tf.width = this._width;
            } else {
                this._tf.wordWrap = true;
                this._tf.autoSize = "none";
                this._tf.width = this._width;
                this._tf.height = this._height;
            }
            this._tf.x = -this._tf.width / 2;
            this._tf.y = -this._tf.height / 2;
        }, writable:true  },

        setFormat: { value: function( fmt ) {
            this._tf.defaultTextFormat = fmt;
            this._layout();
            return this;
        }, writable:true  }
    });
    mini.TextView = TextView;

    /**
     * ボタンView
     * 背景画像を内包
     * @param url
     * @param gaLabel 計測用途のボタン識別文字列
	 * @param touchBegin
	 * @param touchRollOut
     * @constructor
     */
    var Button = function( url, gaLabel, touchBegin, touchRollOut){
        View.apply(this, arguments);
        var self = this;
        this._display.name = "Button: " + (url || "noimage");
        if( url ) {
            this._bg = new ImageView( url );
            this._display.addChildAt( this._bg.display, 0 );
            this._bg.onLoad = function(){ if( self.onLoad !== null ) self.onLoad(); };
        }

		this._touchBegin = touchBegin || function () {
			mini.Tween.removeTweens( self.display );
            this.display.scaleX = self.display.scaleY = 1.08;
		};
		this._touchRollOut = touchRollOut || function () {
			mini.Tween
                .get( self.display, { useTicks: true, override:true } )
                .to( { scaleX: 1.0, scaleY: 1.0 }, 30, mini.Ease.elasticOut );
		};
        this._gaLabel = gaLabel || null;

        this._display.addEventListener( "touchTap", self._onTap = function(e){
            if( self._gaLabel !== null )
                googleAnalytics.event( "button", "tap", self._gaLabel );
            if( self.onTap === null ) return;

            // audio
            if( Button.buttonAudio ) Button.buttonAudio.play();

            self.onTap(e);
        } );
        this._display.addEventListener( "touchBegin",
            self._onTouchBegin = function(e){ if( self.onTouchBegin !== null ) self.onTouchBegin(e); } );
        this._display.addEventListener( "touchEnd",
            self._onTouchEnd = function(e){ if( self.onTouchEnd !== null ) self.onTouchEnd(e); } );
        this._display.addEventListener( "touchRollOver",
            self._onTouchRollOver = function(e){ if( self.onTouchRollOver !== null ) self.onTouchRollOver(e); } );
        this._display.addEventListener( "touchRollOut",
            self._onTouchRollOut = function(e){ if( self.onTouchRollOut !== null ) self.onTouchRollOut(e); } );
    };
    Button.prototype = Object.create( View.prototype, {

        // property
        bg: { get: function(){ return this._bg; } },
        gaLabel: { get: function(){ return this._gaLabel; } },

        // handler
        _onTap: { value: null, writable:true  },
        _onTouchBegin: { value: null, writable:true  },
        _onTouchEnd: { value: null, writable:true  },
        _onTouchRollOver: { value: null, writable:true  },
        _onTouchRollOut: { value: null, writable:true  },

        // callback
        onLoad: { value: null, writable:true  },
        onTap: { value: null, writable:true  },
        onTouchBegin: { value: function(){
            this._touchBegin();
        }, writable:true  },
        onTouchEnd: { value: null, writable:true  },
        onTouchRollOver: { value: null, writable:true  },
        onTouchRollOut: { value: function(){
            this._touchRollOut();
        }, writable:true  },

        // method
        /**
         * onTapコールバックの指定
         * @param {Function} callback
         * @return {mini.ImageView}
         */
        setOnTap: { value: function( callback ){ this.onTap = callback; return this; }, writable:true  },

        dispose: { value: function(){
            // TODO
        }, writable:true  }

    } );
    /**
     * ボタン音
     * @static
     * @type {Audio}
     */
    Button.buttonAudio = null;
    mini.Button = Button;


    /**
     * 数値画像View
     * @param {Number|String} value
     * @param {String} [imageURL]
     * @param {Number} [numberWidth]
     * @constructor
     */
    var NumericImage = function( value, imageURL, numberWidth ){
        View.call(this);

        this._display.name = "NumericImage";
        this._bd = null;

        this._image = new Image( imageURL || application.config._numbers );
        var self = this;
        this._image.onload = function(){ self._onImageLoaded(); };

        this._value = value;

        this._numberWidth = numberWidth || application.config.numberWidth;

        this._bitmaps = [];

        this._hasUnit = null;

        this._margin = 0;
    };
    NumericImage.prototype = Object.create( View.prototype, {

        // property
        image: { get: function(){ return this._image; } },
        value: { get: function(){ return this._value; }, set: function( value ){
            this._value = value;
            // display更新
            // 文字列化
            var stringValue = value.toString();
            // filter state
            if( this._image.width <= 0 ) return;
            // filter value
            if( stringValue.indexOf("e") !== -1 ) throw new Error( "無効な数値が指定されました" );
            if( stringValue.indexOf("-") !== -1 ) throw new Error( "無効な数値 マイナス値が指定されました" );

            // child準備
            while( this._bitmaps.length < (stringValue.length+1/*単位分*/) ) this._bitmaps.push( new Bitmap( this._bd ) );

            // remove children
            while( this._display.numChildren > 0 ) this._display.removeChildAt(0);

            // 単位分
            var unitOffset = this._hasUnit ? 1: 0;

            // サイズ算出
            var numberWidth = this._numberWidth;
            var dotWidth = this._image.width % numberWidth;
            var imgHeight = this._image.height;
            var width = ( stringValue.length + unitOffset ) * numberWidth;
            if( stringValue.indexOf(".") !== -1 ) width += dotWidth - numberWidth;
            //  margin
            width += (stringValue.length-1) * this._margin + ( this._hasUnit? this._margin: 0 );

            var offset = -width/2;
            // 文字
            for( var i = 0; i < stringValue.length; i++ ) {
                var char = stringValue.charAt(i);
                var bmp = this._bitmaps[i];
                bmp.y = -imgHeight/2;
                //
                if( char === "." ) {
                    // dot
                    bmp.setClippingRect( new Rectangle( (10+unitOffset) * numberWidth, 0, dotWidth, imgHeight ) );
                    bmp.x = offset;
                    this._display.addChild( bmp );
                    offset += dotWidth + this._margin;
                } else {
                    // number
                    bmp.setClippingRect( new Rectangle( (unitOffset+parseInt(char)) * numberWidth, 0, numberWidth, imgHeight ) );
                    bmp.x = offset;
                    this._display.addChild( bmp );
                    offset += numberWidth + this._margin;
                }
            }

            // 単位
            if( this._hasUnit ) {
                var bmp = this._bitmaps[i];
                bmp.y = -imgHeight/2;
                // number
                bmp.setClippingRect( new Rectangle( 0, 0, numberWidth, imgHeight ) );
                bmp.x = offset;
                this._display.addChild( bmp );
            }

            // TODO 効率化
        } },

        margin: { get: function(){ return this._margin; }, set: function( value ){
            this._margin = value;
            this.value = this._value;
        } },

        // callback
        onLoad: { value: null, writable:true  },

        // internal method
        _onImageLoaded: { value: function(){
            this._bd = new BitmapData( this._image );
            // has unit?
            this._hasUnit = this._image.width > ( this._numberWidth * 11 );

            this.value = this._value;
            if( this.onLoad !== null ) this.onLoad();
        }, writable:true  },

        // method

        setMargin: { value: function( value ){ this.margin = value; return this; }, writable:true  },

        dispose: { value: function(){
            // TODO
        }, writable:true  }
    } );
    mini.NumericImage = NumericImage;

    /**
     * テンプレートパーサー
     * @param {Object} tpl
     * @param {Sprite} [container]
     */
    function parse( tpl, container ) {

        var viewDictionary = {};
        viewDictionary.put = function( name, view ){
            if( Object.prototype.toString.call(this[name]) === "[object Array]" )
                this[name].push( view );
            else if( this[name] )
                this[name] = [ this[name], view ];
            else
                this[name] = view;
            return view;
        };

        function _parse( name, elm ){
            // view
            var view = null;
            var viewIsContainer = false;
            if( elm.image ) view = new ImageView( elm.image );
            else if( elm.button ) view = new Button( elm.button );
            else if( elm.numeric ) view = new NumericImage(  elm.numeric.value, elm.numeric.image, elm.numeric.width );
            else if( elm.hasOwnProperty("color") ) view = new ColorView( elm.color );
            else if( elm.list ) view = new ListView();
            else {
                viewIsContainer = true;
                var views = {};
                for( var childName in elm )
                    if( typeof elm[childName] !== "string" && typeof elm[childName] !== "number" )
                        views[ childName ] = viewDictionary.put( childName, _parse(childName, elm[childName] ) );
                view = new ContainerView( views );
            }
            // props
            for( var propName in elm ) {
                var value = elm[propName];
                if( typeof value !== "string" && typeof value !== "number" ) continue;
                if( propName.indexOf("on") === 0 )
                    view[propName] = Function( value );
                else
                    view[propName] = value;
            }

            return view;
        }

        var result = _parse( "", tpl );
        if( container )
            for( var i in result.views )
                result.views[i].addTo(container);

        // node accessor
        result.getViewByName = function( name ){
            return viewDictionary[name];
        };

        return result;
    }
    mini.parse = parse;


    /**
     * createjs.TweenJSのユーティリティー
     */
    var Tween = {

        _targetInfoList: [],
        _tweenGroups: {},

        /**
         * トゥイーンを進める
         * @param {Number} delta
         * @param {String} groupName
         */
        tick: function( delta, groupName ){
            // 悩ましいがデフォルトのgroupを用意することに
//            if( !groupName ) {
//                createjs.Tween.tick();
//                return;
//            }
            groupName = groupName || "default";
            if( !this._tweenGroups[groupName] ) return;

            var group = this._tweenGroups[groupName].slice();
            for( var i in group ) {
                group[i].tween.tick( delta || 1 );
            }
        },

        /**
         *
         */
        get: function(){
            var target = arguments[0];
            var groupName = arguments.length>=2? arguments[1].group : null;
            var tween = createjs.Tween.get.apply( createjs.Tween, arguments );

            // 悩ましいがデフォルトのgroupを用意することに
//            if( !groupName ) return tween;
            if( !groupName ) groupName = "default";

            var targetInfo = null;
            for( var i in this._targetInfoList ) {
                if( this._targetInfoList[i].target === target ) {
                    targetInfo = this._targetInfoList[i];
                    break;
                }
            }

            if( !targetInfo ) {
                targetInfo = { target: target, tweens:[] };
                this._targetInfoList.push( targetInfo );
            }

            var group = this._tweenGroups[groupName];
            if( !group ) group = this._tweenGroups[groupName] = [];

            var tweenInfo =  { target:target, tween:tween, group:group };

            group.push( tweenInfo );
            targetInfo.tweens.push( tweenInfo );

            return tween;
        },

        /**
         *
         */
        removeTweens: function( target ) {

            createjs.Tween.removeTweens( target );

            var targetInfo = null;
            for( var i in this._targetInfoList ) {
                if( this._targetInfoList[i].target === target ) {
                    targetInfo = this._targetInfoList.splice( i, 1 )[0];
                    break;
                }
            }
            if( !targetInfo ) return;

            for( var i in targetInfo.tweens ) {
                var tweenInfo = targetInfo.tweens[i];
                var group = tweenInfo.group;
                group.splice( group.indexOf( tweenInfo ), 1 );
            }
        }
    };
    mini.Tween = Tween;

    /**
     * createjs.Ease のエイリアス
     * @type {createjs.Ease}
     */
    var Ease = mini.Ease = createjs.Ease;

    /**
     * デバッグ用フッターView
     * 広告と差し替わる想定
     * @constructor
     */
    var DebugFooter = function(){
        this._layer = new Layer( new Stage( 640, 100 ) );
        this._layer.verticalAlign = "bottom";
        this._stage = this._layer.content;

        var bg = new Bitmap( new BitmapData(1,1,true, 0xff000000) );
        bg.width = 640;
        bg.height = 100;
        bg.alpha = 0.5;
        this._stage.addChild( bg );

        var self = this;
        // buttons
        this._title = new mini.Button( "./assets/mini/dev/btn_title.png" );
        this._title.x = 90; this._title.y = 50;
        this._title.onTap = function(){ Scene.goto("/"); };
        this._stage.addChild( this._title.display );

        this._game = new mini.Button( "./assets/mini/dev/btn_game.png" );
        this._game.x = 90 * 3; this._game.y = 50;
        this._game.onTap = function(){ Scene.goto("/game"); };
        this._stage.addChild( this._game.display );

        this._result = new mini.Button( "./assets/mini/dev/btn_result.png" );
        this._result.x = 90 * 5; this._result.y = 50;
        this._result.onTap = function(){ Scene.goto("/result"); };
        this._stage.addChild( this._result.display );

        this._reload = new mini.Button( "./assets/mini/dev/btn_reload.png" );
        this._reload.x = 90 * 6 + 50; this._reload.y = 50;
        this._reload.onTap = function(){
            // 表示中のシーンを引き継ぐ
            var url = location.href;
            location.href = url.split("?")[0] + "?rand="+Math.random()+"&dev_init_path=" + Scene.getCurrent().path ;
        };
        this._stage.addChild( this._reload.display );

        // コンテンツの前面へ表示
        addLayer( this._layer );
    };
    DebugFooter.prototype = Object.create( {}, {

    } );

	
	var AnimationSprite = function (spriteSheet, jsonData, loop) {
		this._display = new Sprite();
		this._bmp = new Bitmap(spriteSheet);
		this._data = jsonData;
		this._loop = loop || true;
		this._frame = 0;
		this._totalFrames = this._data.frames.length;
		this._rect = new Rectangle();
		
		this._display.addChild(this._bmp);
		this._draw();
		
	};
	AnimationSprite.prototype = Object.create({}, {
		_draw: { value: function () {
			var obj = this._data.frames[this._frame];
			this._rect.x = obj.frame.x;
			this._rect.y = obj.frame.y;
			this._rect.width = obj.frame.w;
			this._rect.height = obj.frame.h;
			this._bmp.setClippingRect(this._rect);
			this._bmp.x = obj.spriteSourceSize.x;
			this._bmp.y = obj.spriteSourceSize.y;
		}},
		
		display: { get: function () { return this._display; }},
		
		frame: {
			get: function () { return this._frame; },
			set: function (value) {
				this._frame = Math.min(Math.max(0, value), this._totalFrames - 1);
				this._draw();
			}
		},
		
		loop: {
			get: function () { return this._loop; },
			set: function (value) { this._loop = value; }
		},
		
		update: { value: function () {
			if (++this._frame >= this._totalFrames) {
				(this._loop) ? 0 : this._totalFrames - 1;
			}
			this._draw();
		}}
	});
	mini.AnimationSprite = AnimationSprite;
	
	
	var VirtualPad = function (parent) {
		this._topView = new Sprite();
		this._bottomView = new Sprite();
		this._center = new Point();
		this._enabled = false;
		this._angle = 0;

		this._topView.alpha = this._bottomView.alpha = 0.6;
		this._topView.visible = this._bottomView.visible = false;
		parent.addChild(this._bottomView);
		parent.addChild(this._topView);

		var that = this;
		var topImage = new Image("./assets/mini/_pad_top.png");
		topImage.onload = function () {
			var bmp = new Bitmap(new BitmapData(topImage));
			bmp.x = -bmp.width / 2;
			bmp.y = -bmp.height / 2;
			that._topView.addChild(bmp);
		};
		var bottomImage = new Image("./assets/mini/_pad_bottom.png");
		bottomImage.onload = function () {
			var bmp = new Bitmap(new BitmapData(bottomImage));
			bmp.x = -bmp.width / 2;
			bmp.y = -bmp.height / 2;
			that._bottomView.addChild(bmp);
		};
		application.stage.addEventListener("touchBegin", this._onTouchBegin = function (event) {
			that._topView.x = that._bottomView.x = that._center.x = event.stageX;
			that._topView.y = that._bottomView.y = that._center.y = event.stageY;
			that._topView.visible = that._bottomView.visible = that._enabled = true;
		});
		application.stage.addEventListener("touchMove", this._onTouchMove = function (event) {
			that._angle = Math.atan2(event.stageY - that._center.y, event.stageX - that._center.x);
			that._topView.x = that._center.x + 10 * Math.cos(that._angle);
			that._topView.y = that._center.y + 10 * Math.sin(that._angle);
		});
		application.stage.addEventListener("touchEnd", this._onTouchEnd = function (event) {
			that._topView.visible = that._bottomView.visible = that._enabled = false;
		});
	};
	VirtualPad.prototype = Object.create({}, {
		// property
		enabled: { get: function () { return this._enabled; }},
		angle: { get: function () { return this._angle; }},

		// handler
		_onTouchBegin: { value: null, writable:true  },
		_onTouchMove: { value: null, writable:true  },
		_onTouchEnd: { value: null, writable:true  }
	});
	mini.VirtualPad = VirtualPad;



    // Herlock Baas sample

    var HerlockRankingAPI_ = function(){
        this._key = "aee73921fea95a6c33a0c9e1f22ad95c";
        this._secret = "A5vGT8ArbvhgdNEfshUlaToc";
        this._api = "http://api.herlock.do/v1/";
    };
    HerlockRankingAPI_.prototype = Object.create( {}, {

        _createXHR: { value: function( method, action, headers_ ){
            var headers = {
                "Content-Md5": "",// post bodyあるときはちゃんと入れる
                "Content-Type": "",// post bodyあるときはちゃんと入れる
                "X-HMB-Signature-Method": "sha256",// 暗号化アルゴリズム
                "X-HMB-TimeStamp": 1392823856,//Math.floor( Date.now() / 1000 ),//
            };
            for( var name in headers_ ) headers[name] = headers_[name];

            var message = method + "\n";
            var xhr = new XMLHttpRequest();
            xhr.open( method, this._api + action );
            for( var name in headers ) {
                var value = headers[name];
                xhr.setRequestHeader( name, value );
                message += value + "\n";
            }
            message +=  "/v1/" + action;
            log( message );

            var hash = CryptoJS.HmacSHA256( message, this._secret );
            log( hash.toString() );
            var signature = Base64.encode( hash.toString() );
            log( signature );
            xhr.setRequestHeader("Authorization", "Herlock " + this._key + ":" + signature );

            try{
                xhr.setRequestHeader("User-Agent", "HerlockJS/1.0" );
            } catch(e){ console.log(e); };

            return xhr;
        } },

        /**
         * ping test
         */
        ping: { value: function( callback ){
            var xhr = this._createXHR( "GET", "ping" );
            xhr.onload = callback;
            xhr.send();
        } },

        /**
         * サーバー日時取得
         */
        date: { value: function( callback ){
            var xhr = this._createXHR( "GET", "date" );
            xhr.onload = callback;
            xhr.send();
        } },

        /**
         * ランキングTOP数件の取得
         * @param {Function} callback
         * @param {String} rankingId
         * @param {Number} [length]
         */
        getTop: { value: function( callback, rankingId, length ) {
            length = length || 10;
            var action = "ranking/" + rankingId + "?limit=" + length;
            if( application.config.debug )
                action = "ranking/" + rankingId + "_dev?limit=" + length;
            var xhr = this._createXHR( "GET", action );
            xhr.onload = function(){ callback(this); };
            xhr.send();
        } },

        /**
         * 指定ユーザーのランクを取得
         * @param {Function} callback
         * @param {String} rankingId
         * @param {String} userId
         */
        get: { value: function( callback, rankingId, userId ) {
            length = length || 10;
            var action = "ranking/" + rankingId + "/" + userId;
            if( application.config.debug )
                action = "ranking/" + rankingId + "_dev/" + userId;
            var xhr = this._createXHR( "GET", action );
            xhr.onload = function(){ callback(this); };
            xhr.send();
        } },

        /**
         * ランキングへ反映
         * @param {Function} callback
         * @param {String} rankingId
         * @param {String} userId
         * @param {String} userName
         * @param {Number} userScore
         */
        put: { value: function( callback, rankingId, userId, userName, userScore ) {
            var body = JSON.stringify({ 'id': userId, 'name': userName, 'score': userScore });
            var action = "ranking/" + rankingId;
            if( application.config.debug )
                action = "ranking/" + rankingId + "_dev";
            var xhr = this._createXHR( "POST", action, {
                "Content-Md5" : CryptoJS.MD5( body ).toString(),
                "Content-Type": "application/json"
            } );
            xhr.onload = function(){ callback(this); };
            xhr.onerror = function(){ log("onerror"); };
            xhr.send( body );
        } }

    });
    var HerlockRankingAPI = new HerlockRankingAPI_();
    mini.HerlockRankingAPI = HerlockRankingAPI;


    // Android Install Referrer
    var AndroidInstallListener_ = function () {

        app.addEventListener( "message", function(e){
            try{
                var json = JSON.parse( e.data );
                if( json.type === "install_referrer" )
                    googleAnalytics.event( "android_referrer", "install", json.value );
            } catch(e){;}
        } );
        app.sendMessage("getInstallReferrerOnce");
    };
    var AndroidInstallListener = new AndroidInstallListener_();



    // global
    window.mini = mini;

    // AMD
    return mini;
});