(function(){

    /** クラス */
    function Class(){
        if( arguments.length>= 2 ) {
            var impl=arguments[1],work={};
            for( var k in impl ) ( typeof impl[k] === "function" )? work[k]={ value:impl[k], writable:true }: work[k]=impl[k];
            var constructor = work.constructor.value;
            constructor.prototype = Object.create( arguments[0].prototype, work );
            return constructor;
        }
        throw new Error("");
    };


    /**
     * コマンド
     * @class
     * @private
     */
    var Command = Class( Object, {
        constructor: function(){},
        onComplete: { value: null , writable:true},
        execute: function(){ this._complete(); },
        _complete: function(){ if(this.onComplete) this.onComplete(); }
    } );

    /**
     * 直列実行
     * @class
     * @private
     */
    var Serial = Class( Command, {
        constructor: function(){
            Command.apply(this,arguments);
            this._commands = [];
            for( var i = 0; i < arguments.length; i++ ) this._commands[i] = arguments[i];
        },
        push: function( cmd ) { this._commands.push(cmd); },
        execute: function(){ this._next(); },
        _next: function(){
            if( this._commands.length <= 0 ) return this._complete();
            var cmd = this._commands.shift();
            var self = this;
            cmd.onComplete = function(){ self._next(); };
            cmd.execute();
        }
    } );

    /**
     * 常駐コマンド実行者
     * @class
     * @private
     */
    var CommnadExecutor = Class( Serial, {
        constructor: function(){
            Serial.apply(this,arguments);
        },
        push: function( cmd ) { this._commands.push(cmd); this._next(); },
        _next: function(){
            if( this._commands.length<=0 ) return;
            var cmd = this._commands.shift();
            var self = this;
            cmd.onComplete = function(){ self._next(); };
            cmd.execute();
        }
    });



    /**
     * シーンをノードツリー管理するための仕組み
     * @class
     */
    var SceneNode = Class( Object, {

        constructor: function( scene ){
            /**
             * 対象シーン
             * @type {Scene}
             * @private
             */
            this._scene = scene;
            /**
             * 子シーン
             * @type {Object}
             * @private
             */
            this._children = {};
        },

        // accessor
        /**
         *
         * @type {String}
         */
        name: { get: function(){ return this._scene.name; } },
        /**
         *
         * @type {ScenePath}
         */
        path: { get: function(){ return this._scene.scenePath; } },
        /**
         *
         * @type {Scene}
         */
        scene: { get: function(){ return this._scene; } },

        // interface
        /**
         *
         * @param {internal.SceneNode} node
         */
        addChild: function ( node ) {
            this._children[ node.name ] = node;
        },
        /**
         *
         * @param {internal.SceneNode} node
         */
        removeChild: function( node ) {
            if( this._children[node.name] )
                delete this._children[node.name];
        },
        /**
         *
         * @param {internal.SceneNode} node
         * @return {Boolean}
         */
        contains: function( node ) {
            if( this._children[node.name] ) return true;
            for( var name in this._children )
                if( this._children[name].contains(node) )
                    return true;
            return false;
        },
        /**
         * 検索
         * @param {ScenePath} path
         * @return {internal.SceneNode}
         */
        search: function( path ) {
            if( this.path.equals( path ) ) return this;
            for( var name in this._children ) {
                var result = this._children[name].search( path );
                if( result !== null ) return result;
            }
            return null;
        },
        /**
         *
         */
        toString: function() {
            return "[object SceneNode path=\""+this.path.value+"\"]";
        }
    });



    /**
     * シーンパス<br />
     * TODO location.hash連動
     * @class
     */
    var ScenePath = Class( Object, {

        /**
         * コンストラクター
         * @constructor
         * @param {String} path クエリー文字列可 /parent/name?key=value
         */
        constructor: function( pathString ) {
            /**
             * 文字列
             * @type {*}
             * @private
             */
            this._value = pathString;
            /**
             * シーンパス
             * @type {String}
             * @private
             */
            this._path = null;
            /**
             * シーン名
             * @type {String}
             * @private
             */
            this._sceneName = null;
            /**
             * クエリー
             * @type {*}
             * @private
             */
            this._query = null;
            /**
             * パラメーターオブジェクト
             * @type {Object}
             * @private
             */
            this._parameters = {};

            // parse
            var path_query = pathString.split("?");
            //  path
            this._path = path_query[0];
            var splited = this._path.split("/");
            this._sceneName = splited[ splited.length-1 ];

            //  query
            if( path_query[1] ) {
                this._query = path_query[1].split("&");
                for( var i in this._query ) {
                    var tmp = this._query[i].split("=");
                    this._parameters[ tmp[0] ] = tmp[1]===undefined? null : tmp[1];
                }
            }
        },

        // accessor
        /**
         * 文字列値
         * @type {String}
         */
        value: { get: function(){ return this._value; } },
        /**
         * シーンパス
         * @type {String}
         */
        path: { get: function(){ return this._path; } },
        /**
         * クエリー文字列
         * @type {String}
         */
        query: { get: function(){ return this._query; } },
        /**
         * シーン名
         * @type {String}
         */
        sceneName: { get: function(){ return this._sceneName; } },
        /**
         * パラメーター
         * @type {Object}
         */
        parameters: { get: function(){ return this._parameters; } },
        /**
         *
         * @type {Object}
         */
        isRoot: { get: function(){ return this._path === "/"; } },

        // interfce
        /**
         * パスの比較 ※クエリー文字列は無視
         * @param {ScenePath} path
         */
        equals: function ( path ) {
            //console.log( ""+this.value+" === "+path.value+" = " + (this.value === path.value) );
            return (this.path === path.path);
        },
        /**
         *
         * @type {ScenePath}
         */
        createParentPath: function(){
            if( this.isRoot || this._path.indexOf("/")===-1 ) return null;
            var result = this._path.split( "/" + this._sceneName )[0];
            if( result === "" ) result = "/";
            return new ScenePath( result );
        },
        /**
         * 共通の先祖を探す
         * @param {ScenePath} target
         */
        findJointScenePath: function( target ) {
            var myList = this.path.split("/");
            var targetList = target.path.split("/");
            var path = "";
            var len = Math.min( myList.length, targetList.length );
            for( var index = 0 ; index < len; index++ ) {
                if( myList[index] !== targetList[index] ) break;
                path += myList[index] + "/";
            }

            if( path !== "/" ) // 末尾の/を削除
                path = path.substr(0, path.length-1);
            if( path === "" ) return null;

            return new ScenePath( path );
        },
        /** */
        toString: function(){ return "[object ScenePath value=\""+ this.value +"\"]"; }
    });





    /**
     * シーン管理者<br />
     * <br />
     * シーンはツリーを形成し、ルートシーンを"/"とする"パス"を識別子として管理される。<br />
     * <br />
     * Scene.mappingによりシーンマップを定義することでパスとSceneクラスを紐付ける。<br />
     * mappingしなくてもSceneを作り遷移することが可能だが、このシーンは野良扱いとなり
     * シーン管理者が提供するいくつかの機能が利用できない。<br />
     * <br />
     * シーンには５つの遷移時ハンドラーがある
     * ・onPrepare ・・・ 利用準備 Sceneインスタンス生成後、稼働に必要な準備を行う
     * ・onEnter   ・・・ 進入 遷移先が自身か子シーンで、今までEnter状態でなかった場合
     * ・onShow    ・・・ 表示 遷移先が自身の場合
     * ・onHide    ・・・ 非表示 遷移元が自身の場合
     * ・onLeave   ・・・ 退出 遷移元が自信か子シーンで、今までLeave状態でなかった場合
     *
     *
     * @class
     */
    var SceneManager = Class( Object, {

        constructor: function(){
            /**
             * シーン名とシーン定義の紐付け情報
             * @type {Object}
             */
            this._map = {};
            /**
             * 現在表示中のシーン
             * @type {Scene}
             * @private
             */
            this._current = null;
            /**
             * シーンツリー
             * @type {internal.SceneNode}
             * @private
             */
            this._sceneTree = null;
            /**
             *
             * @type {internal.CommandExecutor}
             * @private
             */
            this._executor = new CommnadExecutor();
        },

        // interface
        /**
         * 指定シーンの親を返す
         * @param scene
         * @return {Scene}
         */
        getParent: function( scene ) {
            //
            if( this._sceneTree === null ) return null;
            var parentPath = scene.scenePath.createParentPath();
            if( parentPath === null ) return null;
            var node = this._sceneTree.search( parentPath );
            if( node !== null ) return node.scene;
            return null;
        },
        /**
         * ルートシーンを返す
         * @param scene
         * @return {Scene}
         */
        getRoot: function() {
            //
            if( this._sceneTree === null ) return null;
            var node = this._sceneTree.search( new ScenePath("/") );
            if( node !== null ) return node.scene;
            return null;
        },
        /**
         * シーン名とシーン定義の紐付けを追加
         * @param {Object} map
         */
        mapping: function( map ){
            for( var path in map ) this._map[path] = map[path];
        },
        /**
         * 指定シーンへ遷移
         * @param {*} parameter String, Scene, ScenePath,
         */
        goto: function ( arg ) {
            console.log( "SceneManager.goto " + arg );

            // str to path
            if( typeof arg === "string" ) {
                arg = new ScenePath( arg );
            }

            // if node..
            if( this._sceneTree ) {
                var node = this._sceneTree.search( arg );
                if( node !== null ) {
                    var newPath = arg;
                    arg = node.scene;// TODO
                    arg._path = newPath;
                }
            }

            // path to Scene
            if( ScenePath.prototype.isPrototypeOf( arg ) ) {
                var path = arg;
                var mapped = this._map[ arg.path ];
                //
                if( !mapped ) throw new Error( "not found arg="+arg );
                // is Scene class
                if( typeof mapped === "function" ) {
                    arg = new mapped( arg );
                } else {
                    // Scene
                    arg = mapped;
                    arg._path = path;
                }
                arg._path = path;
            }

            // filter
            /*
             if( Scene.prototype.isPrototypeOf( arg ) !== true )
             throw new Error( "not found arg="+arg );
             */

            this._internalGoto( arg );
        },
        /**
         *
         * @param {Scene} scene
         * @private
         */
        _internalGoto: function( scene ) {

            var from = this._current;
            var to = scene;

            var joint = null;
            if( from !== null ) joint = from.scenePath.findJointScenePath( to.scenePath );


            var enterPaths = [];
            var leavePaths = [];

            var path = null;
            if( from !== null ) {
                path = from.scenePath;
                while( path !== null ) {
                    if( joint !== null && path.equals(joint) ) break;
                    leavePaths.push( path );
                    var parent = path.createParentPath();
                    path = parent;
                }
            }
            path = to.scenePath;
            while( path !== null ) {
                if( joint !== null && path.equals(joint) ) break;
                enterPaths.unshift( path );
                var parent = path.createParentPath();
                path = parent;
            }

            /**
             * 遷移処理コマンドリスト
             * @type {internal.Serial}
             */
            var commands = new Serial();

            // TODO searchキャッシュとして利用
            var enterNodes = [];
            var leaveNodes = [];

            // create & prepare
            var len = enterPaths.length;
            for( var i = 0; i < len; i++ ) {
                // TODO 検索コスト軽減可能
                path = enterPaths[i];

                if( this._sceneTree === null || this._sceneTree.search( path ) === null ) {
                    var scn = null;
                    if( i === len-1 ){
                        scn = to;
                    } else {
                        // 生成
                        var mapped = this._map[ path.value ];
                        if( !mapped ) throw new Error( "マッピングされていないシーンパス\""+path.value+"\"が指定されました。" );
                        // is Scene class
                        if( typeof mapped === "function" ) scn = new mapped( path );
                        // Scene
                        else {
                            scn = mapped;
                            scn._path = path;
                        }
                    }

                    // ノードをツリーへ追加
                    var node = new SceneNode( scn );
                    if( path.value === "/" ) {
                        //  root
                        this._sceneTree = node;
                    } else {
                        //  other
                        var parentPath = path.createParentPath();
                        var parentNode = null;
                        if( parentPath !== null ) parentNode = this._sceneTree.search( parentPath );
                        if( parentNode !== null ) {
                            parentNode.addChild( node );
                        } else {
                            // 野良シーン
                            throw new Error("野良シーン未実装 " + path );
                        }
                    }

                    // 準備
                    if( scn.isPrepared !== true )
                        commands.push( new SceneCommand( scn, SceneCommand.PREPARE ) );
                }
            }

            // hide & leave
            if( from )
                commands.push( new SceneCommand( from, SceneCommand.HIDE ) );
            for( var i in leavePaths ) {
                var node = leaveNodes[i] = this._sceneTree.search( leavePaths[i]);
                commands.push( new SceneCommand( node.scene, SceneCommand.LEAVE ) );
            }

            // enter & show
            for( var i in enterPaths )
                commands.push( new SceneCommand( this._sceneTree.search( enterPaths[i] ).scene, SceneCommand.ENTER ) );
            commands.push( new SceneCommand( to, SceneCommand.SHOW ) );

            // 不要になったSceneNodeの削除
            if( leaveNodes.length > 0 && joint!==null ) {
                commands.push( new RemoveLeaveNode( leaveNodes[leaveNodes.length-1], this._sceneTree.search( joint ) ) );
            }

            // TODO カレントの切り替えタイミング
            this._current = to;

            // 別スタック
            var self = this;
            setTimeout( function(){ self._executor.push( commands ); },0);
        }

    });

    /**
     * シーン管理者
     * @type {internal.SceneManager}
     */
    var sceneManager = new SceneManager();

    /**
     * シーン遷移処理時の
     * @class
     * @private
     */
    var SceneCommand = Class( Command, {
        constructor: function( scene, state ) {
            Command.apply(this,arguments);
            this._scene = scene;
            this._state = state;
        },
        execute: function(){
            console.log( this._scene + " " + this._state );
            if( this._state === SceneCommand.PREPARE ) {
                var self = this;
                this._scene._onCompletePrepare = function(){ self._complete(); };
                this._scene._prepare();
                return;
            }

            this._scene["_"+this._state]();
            this._complete();
        }
    });
    SceneCommand.PREPARE = "prepare";
    SceneCommand.ENTER = "enter";
    SceneCommand.SHOW = "show";
    SceneCommand.HIDE = "hide";
    SceneCommand.LEAVE = "leave";

    var RemoveLeaveNode = Class( Command, {
        constructor: function( removeRootNode, parentNode ) {
            Command.apply(this,arguments);
            this._target = removeRootNode;
            this._parent = parentNode;
        },
        execute: function() {
            // TODO 親がいな状態で呼ばれる場合がある。連打した時など 削除順？ 処理duplicate?


            // filter

            // remove
            this._parent.removeChild( this._target );
            this._target = null;
            this._complete();
        }
    });



    /**
     * シーン<br />
     * 5つの状態を持つ
     * ・prepare
     * ・enter
     * ・show
     * ・hide
     * ・leave
     * @class
     */
    var Scene = Class( Object, {

        /**
         *
         * @param {ScenePath} path
         */
        constructor: function( path ) {
            /**
             * シーン名
             * @type {ScenePath}
             * @private
             */
            this._path = !path? new ScenePath(""): typeof path === "string"? new ScenePath(path): path ;
            /**
             * 利用準備済みフラグ
             * @type {Boolean}
             * @private
             */
            this._isPrepared = false;
            /**
             * 前シーンの参照
             * @type {Scene}
             * @private
             */
            this._prev = null;
        },

        // property
        /**
         * 利用準備済みフラグ
         * @type {Boolean}
         */
        isPrepared: { get: function(){ return this._isPrepared; } },
        /**
         * シーンパス
         * @type {ScenePath}
         */
        scenePath: { get: function(){ return this._path; } },
        /**
         * シーンパス文字列
         * @type {String}
         */
        path: { get: function(){ return this._path.path; } },
        /**
         * シーン名
         * @type {String}
         */
        name: { get: function(){ return this._path.sceneName; } },
        /**
         * 遷移時パラメーター
         * @type {Object}
         */
        parameters: { get: function(){ return this._path.parameters; } },
        /**
         * 親シーンの参照
         * @type {String}
         */
        parent: { get: function(){ return sceneManager.getParent(this); } },

        /**
         *
         * @type {Object}
         */
        root: { get: function(){ return sceneManager.getRoot(); } },
        /**
         * 前シーンの参照
         * @type {String}
         */
        prev: { get: function(){ return this._prev; } },
        /**
         * 利用準備完了ハンドラー
         * @type {Function}
         * @private
         */
        _onCompletePrepare: function(){},
        /**
         * 利用準備時ハンドラー
         * @type {Function}
         * @private
         */
        onPrepare: { value:null, writable:true },
        /**
         * シーン進入時ハンドラー
         * @type {Function}
         * @private
         */
        onEnter: function(){},
        /**
         * シーン表示時ハンドラー
         * @type {Function}
         * @private
         */
        onShow: function(){},
        /**
         * シーン非表示時ハンドラー
         * @type {Function}
         * @private
         */
        onHide: function(){},
        /**
         * シーン退出時ハンドラー
         * @type {Function}
         * @private
         */
        onLeave: function(){},

        // interface
        /**
         * このシーンに遷移する。<br />
         * 軽量インターフェース
         */
        go: function() {
            // TODO
            Scene.goto( this );
        },

        // protected
        completePrepare: function(){
            this._isPrepared = true;
            if( this._onCompletePrepare )
                this._onCompletePrepare();
        },

        // internal interface
        /**
         * 利用準備
         * @private
         */
        _prepare: function(){
            if (this.onPrepare){
                this.onPrepare();
                return;
            }
            this.completePrepare();
        },
        /**
         * シーンに入る
         * @private
         */
        _enter: function(){
            if( this.onEnter ) this.onEnter();
        },
        /**
         * シーンを表示する
         * @private
         */
        _show: function(){
            if( this.onShow ) this.onShow();
        },
        /**
         * シーンを非表示にする
         * @private
         */
        _hide: function(){
            if( this.onHide ) this.onHide();
        },
        /**
         * シーンから出る
         * @private
         */
        _leave: function(){
            if( this.onLeave ) this.onLeave();
        },
        /**
         * 文字列
         * @return {String}
         */
        toString: function(){ return "[object Scene path=\""+this.path+"\"]"; }
    } );

    /**
     * カレントシーンの参照
     * @type {Scene}
     */
    Scene.getCurrent = function(){ return sceneManager._current; };
    /**
     * シーン名とシーン定義の紐付けを追加
     * @param {Object} map
     */
    Scene.mapping = function( map ){
        sceneManager.mapping.call( sceneManager, map );
    };
    /**
     * 指定シーンへ遷移
     * @param {*} parameter String, Scene, ScenePath,
     */
    Scene.goto = function ( arg ) {
        sceneManager.goto.apply( sceneManager, arguments );
    };

    // global
    window.Scene = Scene;

    // AMD
    if ( typeof define === "function" && define.amd ) {
        define( [], function () { return Scene; } );
    }
})();