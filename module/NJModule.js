define([
    "lib/Class"
], function( Class ) {

    var NJModule = Class( Object, function( cls, parent ){

        cls.constructor = function(){

            this._njs = null;

        };


        cls.getName = function(){ return "Abstract"; };

        /**
         * NativeJSへの登録時コールバック
         * 　・グローバル定義を拡張するモジュールはここで行う
         *
         * @param njs
         * @deprecated
         */
        cls.onRegisterTo = function ( njs_ ) {
            this._njs = njs_;
        }

        /**
         * NativeJSへ機能を反映
         * 　・JSクラスの提供
         *
         * @param ctx
         */
        cls.installTo = function ( ctx ) {
        }

        /**
         * JSContext初期化
         * 　・提供した機能のJS上初期化
         *
         * @param ctx
         */
        cls.initJs = function( ctx ) {
        }

        /**
         * スタート
         */
        cls.start = function() {
        }

        /**
         * リセット
         */
        cls.reset = function() {
        }

        /**
         * 一時停止
         */
        cls.pause = function() {
        }

        /**
         * 再開
         */
        cls.resume = function() {
        }

        /**
         * 破棄
         */
        cls.destroy = function() {
        }


    } );

    return NJModule;
});