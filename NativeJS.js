define([
    "lib/Class",
    "module/common/NJCommon"
], function( Class, NJCommon ) {

    window.__herlock_ctx = null;
    
    var NativeJS = Class( Object, function( cls, parent ){

        var State = {
            /**
             * インスタンス作成後startするまで
             */
            BUILD:{},
            /**
             * startが呼べる状態
             */
            READY:{},
            /**
             * 実行中
             */
            RUNNING:{},
            /**
             * 一時停止状態
             */
            PAUSED:{},
            /**
             * 破棄済み
             */
            DESTROYED:{}
        }
        
        cls.constructor = function () {

            this._currentContext  = null;

            this._state = State.BUILD;

            this._modules = [];
            this.registerModule( new NJCommon() );
        };

        cls.getState = function () {
            return this._state;
        };


        cls.executeScript = function ( script ) {
            this.evaluateScript(script, null);
        };

        cls.evaluateScript = function( script, callback ) {
            //
            setTimeout( (function(){
                // filter
                if (this._state == State.BUILD || this._state == State.READY) this._start();
                if (this._state != State.RUNNING) return;

                window.__herlock_ctx = this;


                var result = eval( "with( window.__herlock_ctx._currentContext ){"+script+"}" );
//                var result = eval( script );

                if( callback != null )
                    callback( result );
            }).bind(this), 0 );
        }

        cls.loadURL = function ( url ) {
//            if ( this.getModuleByName("Location") != null ) {
//                console.log("loadURL with NJLocation");
//                this.executeScript( "location.href = \"" + url + "\";" );
//
//            } else if ( this.getModuleByName("Script") != null ) {
                console.log("loadURL with NJScript");
                this._rootPath = url.substr( 0, url.lastIndexOf("/")+1 );
                this.executeScript("" +
                    "(function(){" +
                    "\n	var script = new Script();" +
                    "\n	script.onerror=function(){ console.log('load error '+script); application.sendMessage('type=error'); }" +
                    "\n	script.onabort=function(){ console.log('load abort '+script); }" +
                    "\n	script.onload=function(){" +
                    "\n		console.log('load complete '+script); " +
                    "\n	}" +
                    "\n	script.src = '" + url.substr(url.lastIndexOf("/")+1) + "';" +
                    "})();");

//            }
        };


        cls.reload = function () {
            //
            if (getModuleByName("Location") != null) {
                DebugUtil.log("loadURL with NJLocation");
                executeScript("location.reload();");
            }
        };


        cls.registerModule = function ( module ) {
            // filter
            if ( this._state != State.BUILD ) return;
            //
            this._modules.push( module );
            // callback
            module.onRegisterTo(this);
        };


        cls.getModuleByName = function( name ) {
            var  numOfModules = this._modules.length;
            for ( var i = 0; i < numOfModules; i++ )
                if ( this._modules[i].getName() === name )
                    return this._modules[i];
            return null;
        }


        cls._build = function(){
            // filter
            if (this._state != State.BUILD) return;

            // TODO 環境FIXしましたよ処理 必要？
            // JS環境のマスター的な概念がエンジンにあるならここで利用し
            // startで生成するのはそのインスタンスとしたい。
            // 2012210122現在 V8は有効。JCSは無効っぽい

            this._state = State.READY;
        };


        cls.reset = function () {
            setTimeout( (function(){ this._reset(); }).bind(this), 0 );
        };



        cls._reset = function() {
            // filter
            if (this._state == State.BUILD) return;

            console.log("NativeJS::reset");

            //  reset src
            var numOfModules = this._modules.length;
            for (var i = 0; i < numOfModules; i++) {
                var module = this._modules[i];
                module.reset();
            }

            // destroy TODO 描画処理の完了を待つ
//            nativeDestroyJSContext(currentContext.getNativePtr());
            this._currentContext  = null;

            // update state
            this._state = State.READY;
        }

        /**
         * スタート
         */
        cls.start = function() {
            setTimeout( (function(){ this._start(); }).bind(this), 0 );
        }
        cls._start = function() {

            // filter
            if (this._state == State.RUNNING) return;
            if (this._state == State.PAUSED) return;

            console.log("NativeJS::start");

            if (this._state == State.BUILD) this._build();
            console.log("NativeJS::build");

            // setup context
            this._currentContext  = new NativeJS.JSContext( 0/*TODO contextPtr*/ );
            console.log("NativeJS::CreateJSContext");

            //  install src
            var numOfModules = this._modules.length;
            for (var i = 0; i < numOfModules; i++) {
                var module = this._modules[i];
//                module.installTo( this._currentContext );
                module.installTo( window );
            }
            console.log("NativeJS::install modules");

            //  build
//            nativeBuildJSContext(currentContext.getNativePtr());
            console.log("NativeJS::BuildJSContext");

            //  initialize module JS objects
            for (var i = 0; i < numOfModules; i++) {
                var module = this._modules[i];
//                module.initJs( this._currentContext );
                module.initJs( window );
            }
            console.log("NativeJS::initJs modules");

            //  start src
            for (var i = 0; i < numOfModules; i++) {
                var module = this._modules[i];
                module.start();
            }
            console.log("NativeJS::start modules");

            // update state
            this._state = State.RUNNING;
        }

        /**
         * 処理一時停止
         */
        cls.pause = function() {
            setTimeout( (function(){ this._pause(); }).bind(this), 0 );
        }
        cls._pause = function() {

            // filter
            if (this._state != State.RUNNING) return;

            //  resume src
            var numOfModules = this._modules.length;
            for (var i = 0; i < numOfModules; i++) {
                var module = this._modules[i];
                module.pause();
            }

            // update state
            this._state = State.PAUSED;
        }

        /**
         * 処理再開
         */
        cls.resume = function() {
            setTimeout( (function(){ this._resume(); }).bind(this), 0 );
        }
        cls._resume = function() {

            // filter
            if (this._state != State.PAUSED) return;

            //  resume src
            var numOfModules = this._modules.length;
            for (var i = 0; i < numOfModules; i++) {
                var module = this._modules[i];
                module.resume();
            }

            // update state
            this._state = State.RUNNING;
        }

        /**
         * 破棄
         */
        cls.destroy = function() {
            setTimeout( (function(){ this._destroy(); }).bind(this), 0 );
        }
        cls._destroy = function() {
            // filter
            if (this._state == State.DESTROYED) return;

            //  destroy src
            var numOfModules = this._modules.length;
            for (var i = 0; i < numOfModules; i++) {
                var module = this._modules[i];
                module.destroy();
            }

            // destroy TODO 描画処理の完了を待つ
//            nativeDestroyJSContext( this._currentContext.getNativePtr());

            // update state
            this._state = State.DESTROYED;
        }

        // internal
        cls._rootPath = "";

    });

    NativeJS.JSContext = Class( function( cls ){

        cls.constructor = function( nativePtr ){
            this._nativePtr = nativePtr;
        };

        /**
         * @return
         */
        cls.getNativePtr = function() { return this._nativePtr; }

    } );
    
    return NativeJS; 
});