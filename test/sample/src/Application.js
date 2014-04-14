define([
    "lib/mini",
    "src/TitleScene",
    "src/GameScene",
    "src/FlappyFuguGame",
    "src/ResultScene",
    "src/User"
],function( mini, TitleScene, GameScene, FlappyFuguGame, ResultScene, User ){

    /**
     * @extend mini.Application
     * @constructor
     */
    var Application = function(){
        mini.Application.apply( this, arguments );

        this.config.debug = false;

//        this.config.screenshotMode = true;

        this.config.name = "フグッピーふぐ";
        this.config.urlscheme = "fugu";
        this.config.message = "ベストスコア#best点！ #charaNameでプレイ中 #name #store";

        this.config.useHelp = true;
        this.config.titleScene = TitleScene;
        this.config.gameScene = GameScene;
        this.config.resultScene = ResultScene;
        this.config.game = FlappyFuguGame;
        this.config.user = User;

        this.config.herlockRankingId = "fugu";

        // 勲章
        this.config.medal = {
            gold:   { score: 90, img:"./assets/medal01.png" },
            silver: { score: 40, img:"./assets/medal02.png" },
            bronze: { score: 10, img:"./assets/medal03.png" },
            none:   { score: 0, img:"./assets/medal00.png" }
        };

        // コレクション?
        this.config.collection = {
//            { name:"normal", condition: function(){ return true; } },
            mikan:  { name:"みかんふぐ美", text:"10回プレイありがとう！\nレビューして頂いた方全員に\n\"みかんふぐ美\"\nプレゼント中！\n\nレビューしますか？", condition: function(){ return false; } },
            green:  { name:"緑のふぐ美", text:"初心者卒業おめでとう！\n\"緑のふぐ美\"プレゼント！", condition: function(){ return application.user.bestScore >= 5; } },
            black:  { name:"黒焦げふぐ美", text:"30回プレイありがとう！\n\"黒焦げふぐ美\"プレゼント！", condition: function(){ return application.user.playCount >= 30; } },
            gold:   { name:"金のふぐ美", text:"50点超えおめでとう！\n\"金のふぐ美\"プレゼント！", condition: function(){ return application.user.bestScore >= 50; } },
            blue:   { name:"傷んだふぐ美", text:"ヘタクソなあなたへ・・\n\"傷んだふぐ美\"プレゼント", condition: function(){
                return ( application.user.playCount >= 20 && application.user.bestScore <= 5 )
                    || ( application.user.playCount >= 50 && application.user.bestScore <= 8 )
                    || ( application.user.playCount >= 100 && application.user.bestScore <= 10 );
            } }
        };
    };
    Application.prototype = Object.create( mini.Application.prototype, {

        createMessage:{ value: function( type ){
            var msg = mini.Application.prototype.createMessage.apply( this, arguments );
            var charaName = "ノーマルふぐ美";
            var collection = this.config.collection[ this.user.activeCharaId ];
            if( collection ) charaName = collection.name;
            // 置換
            msg = msg.replace( "#charaName", charaName );
            return msg;
        } }

    } );

    return Application;
});