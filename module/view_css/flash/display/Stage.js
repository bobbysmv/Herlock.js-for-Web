define([
    "lib/Class",
    "./Sprite",
    "../internal/renderer/RenderingNode",
    "../internal/renderer/CSSRenderingSystem",
    "module/view/touch/TouchEventInfo",
    "../events/InteractiveObjectTouchEvent"
],function( Class, Sprite, RenderingNode, CSSRenderingSystem, TouchEventInfo, InteractiveObjectTouchEvent ){

    var Stage = Class( Sprite, function( cls, parent ){

        cls.constructor = function( stageWidth_, stageHeight_ ){
            parent.constructor.apply(this,arguments);

            this._stageWidth = stageWidth_ || 100;
            this._stageHeight = stageHeight_ || 100;
            this._layer = null;
            this._frameRate = 60;
            this._quality = null;//StageQuality::HIGH ),
            // fbo(NULL),
            this._offscreenHandle = null;


            this._primaryTouchId = -1;
            this._touchPointerStateDictionary = {};// TODO Objectのライフタイム完了が同期できていない。


            this._layerContentRenderObject = null;
        };

        cls.frameRate = { get: function(){ return this._frameRate; }, set: function(value){

        } };
        cls.stageWidth = { get: function(){ return this._stageWidth; }, set: function(value){
            this._stageWidth = value;
            if( this._layer != null ) this._layer._notifyResizeContent();
        } };
        cls.stageHeight = { get: function(){ return this._stageHeight; }, set: function(value){
            this._stageHeight = value;
            if( this._layer != null ) this._layer._notifyResizeContent();
        } };

        cls.stage = { get: function(){ return this; } };

        // TODO 参照のみになるDisplayObejctのプロパティ群
        cls.height = { get: function(){}};
        cls.width = { get: function(){}};
        // custom
        cls.layer = { get: function(){}};



        /**
         *
         */
        cls._getContentWidth = function() { return this.stageWidth; } ;
        cls._getContentHeight = function() { return this.stageHeight; };

        cls.getLayer = function() { return this._layer; };

        /** Layerへ反映された */
        cls._onAddedTo = function( layer_ ) {
            this._layer = layer_;
        };
        /** Layerから外された */
        cls._onRemovedFrom = function( layer_ ) {
            this._layer = NULL;
        };

        /**  */
        cls._glPrepare = function( matrix, colorTransform ){

            // check FPS // TODO やっつけ
//            needDrawFrame = false;
//            TimeUtil::epochTimeMs time = TimeUtil::getTimeMs();
//            if( nextDrawFrameTime <= time ) {
//                needDrawFrame = true;
//                while( nextDrawFrameTime <= time )
//                    nextDrawFrameTime += (1.0 / frameRate * 1000);
//            }

            // filter
            //if( needDrawFrame != true )return;

//            if( fbo == NULL ) fbo = new FrameBufferObject();

            // prepare for OpenGL

            //  init RenderingObject
            if( !this._layerContentRenderObject ) {
                this._layerContentRenderObject = new StageRenderObject();
//                layerContentRenderObject->fbo = fbo;
            }

            //

            var vis = {};//new PreparingVisitor;
            this._layerContentRenderObject.root = DisplayObjectContainer.prototype._glPrepare.call( this, vis );

            // TODO キャッシュするように変更。Matrixの算出結果キャシュが効かないので
            var m = new Matrix();
            m.concat( this.getLayer()._getContentMatrix() );
            m.concat( this.getLayer()._getMatrix() );
            if( !this._layerContentRenderObject.matrix._equal(m) )
                this._layerContentRenderObject.matrix = m;

            this._layerContentRenderObject.colorTransform = colorTransform;


            return this._layerContentRenderObject;
        };



        /** MainThread 描画の通知 */
        cls._notifyDrawFrame = function(){
            //
            this._notifyOnEnterFrame();
            this._drawVectorGraphics();
        };


        /** Viewサイズ更新を通知 画面回転等 */
        cls._notifyResizeView = function( viewWidth, viewHeight ){};



        /****************************************************************************************************
         * TOUCH
         * @deprecated
         */

        /** main thread タッチ情報を発信 */
        cls._dispatchTouchEvent = function( eventInfo ){
            var info = eventInfo;
            var changedPointers = info.getChangedPointers();

            var numOfPointers = changedPointers.length;
            for( var i = 0; i < numOfPointers; i++ )
                this._dispatchTouchEventWithChangedTouchPointer( info, changedPointers[i] );
        };

        //
        cls._dispatchTouchEventWithChangedTouchPointer = function( info, pointer ){

            /**
             *
             */
            var layerMatrix = this._layer._getMatrix();
            var stageMatrix = this._layer._getContentMatrix();
            stageMatrix.concat( layerMatrix );
            stageMatrix.invert();
            var stagePoint = stageMatrix.transformPoint( new Point( pointer.x , pointer.y ) );

            //

            // hitTest
            var current = this;
            var tmp = current._hitTestStrictInternal( stagePoint );
            if( !tmp) tmp = this;
            var targetObject = tmp;
            // @deprecated touch処理中はインスタンスを生存させる
//            Holder<InteractiveObject> workingHolder(this, "touch_temp", targetObject);
            var targetLocalPoint = targetObject.globalToLocal( stagePoint );

            // 伝播リスト。末端はtarget
            var hitList = [];
            hitList.push( targetObject );
            var container = targetObject.parent;
            while( container ) {
                hitList.unshift( container );
                container = container.parent;
            } ;

            // create Event
            var type = "";
            switch( info.getAction() ) {
                case TouchEventInfo.DOWN: type = "touchBegin"; break;
                case TouchEventInfo.MOVE: type = "touchMove";  break;
                case TouchEventInfo.UP: type = "touchEnd";  break;
                case TouchEventInfo.CANCEL: default: type = "touchEnd"; break;
            }

            // @deprecated dictが空にならない場合がある？ TODO実装見直し
            if( Object.keys( this._touchPointerStateDictionary ).length<=0 ) this._primaryTouchId = pointer.id;

            var isPrimary = (this._primaryTouchId == pointer.id);

            var event = new InteractiveObjectTouchEvent( type, true, true, pointer.id, isPrimary, targetLocalPoint.x, targetLocalPoint.y)._setStagePoint( stagePoint );
            event._setTarget( hitList[ hitList.length-1 ] );

            // dispatch with propagation
            hitList[ hitList.length-1 ]._propagateEvent( event, hitList );


            // @deprecated
            // 以下 副次的なTouchEvent
            var prevState = null;

            var tmp = this._touchPointerStateDictionary[ pointer.id ];
            if( tmp ) {
                prevState = tmp;
                delete this._touchPointerStateDictionary[ pointer.id ];
            }

            // TODO touchPointerStateDictionaryに保持されたもののLifeTimeと参照管理方法 => Weak参照

            switch( info.getAction() ) {
                case TouchEventInfo.DOWN: {

                    // dispatch over rollover

                    // new state
                    var newState = TouchPointerState.create( pointer.id, targetObject, targetObject );
                    this._touchPointerStateDictionary[ pointer.id ] = newState;

                    // over?
                    var event = new InteractiveObjectTouchEvent( "touchOver", true, true, pointer.id, isPrimary, targetLocalPoint.x, targetLocalPoint.y)._setStagePoint( stagePoint );
                    event._setTarget( hitList[ hitList.length-1 ] );
                    hitList[ hitList.length-1 ]._propagateEvent( event, hitList );

                    // roll over?
                    var numOfList = hitList.length;
                    for( var i = 0; i < numOfList; i++ ) {
                        var event = new InteractiveObjectTouchEvent( "touchRollOver", true, true, pointer.id, isPrimary, targetLocalPoint.x, targetLocalPoint.y)._setStagePoint( stagePoint );
                        hitList[ i ].dispatchEvent( event );
                    }

                    break;
                }
                case TouchEventInfo.MOVE: {

                    // dispatch out over rollout rollover

                    // update state
                    var newState = TouchPointerState.create( pointer.id,
                        ( prevState && prevState.beganFrom )?
                            prevState.beganFrom: null, targetObject );
                    this._touchPointerStateDictionary[ pointer.id ] = newState;

                    // filter
                    if( prevState && prevState.overNow == targetObject ) break;


                    // out?
                    var event = new InteractiveObjectTouchEvent( "touchOut", true, true, pointer.id, isPrimary,targetLocalPoint.x, targetLocalPoint.y)._setStagePoint( stagePoint );
                    event._setTarget( hitList[ hitList.length-1 ] );
                    hitList[ hitList.length-1 ]._propagateEvent( event, hitList );

                    // over?
                    var event = new InteractiveObjectTouchEvent( "touchOver", true, true, pointer.id, isPrimary, targetLocalPoint.x, targetLocalPoint.y )._setStagePoint( stagePoint );
                    event._setTarget( hitList[ hitList.length-1 ] );
                    hitList[ hitList.length-1 ]._propagateEvent( event, hitList );


                    //  ノードの分岐点を探す
                    var junctionIndex = -1;

                    var current = targetObject;
                    var rollOverList = [];
                    var prevList = [];
                    // TODO 落ちないためのやっつけ。RollOver->RollOutが必ずしも呼ばれなくなってしまう。
                    if( prevState && prevState.overNow ){
                        prevList = prevState.overNow._getNodesToRoot();
                        var numOfNodes = prevList.length;
                        while( junctionIndex == -1 ) {
                            rollOverList.push(current);
                            for( var i = 0; i < numOfNodes; i++ ) {
                                if( prevList[i] == current ) {
                                    junctionIndex = i;
                                    break;
                                }
                            }
                            current = current.parent;
                            if(!current) break;
                        }
                    }

                    // filter
                    if( junctionIndex == -1 ) break;

                    // rollOut?
                    for( var i = junctionIndex-1; i >= 0; i-- ) {
                        var event = new InteractiveObjectTouchEvent( "touchRollOut", true, true, pointer.id, isPrimary, targetLocalPoint.x, targetLocalPoint.y )._setStagePoint( stagePoint );
                        prevList[i].dispatchEvent( event );
                    }


                    // rollOver?
                    var len = rollOverList.length;
                    for( var i = 0; i < len; i++ ) {
                        var event = new InteractiveObjectTouchEvent( "touchRollOver", true, true, pointer.id, isPrimary, targetLocalPoint.x, targetLocalPoint.y )._setStagePoint( stagePoint );
                        rollOverList[i].dispatchEvent( event );
                    }

                    break;
                }
                case TouchEventInfo.UP:
                case TouchEventInfo.CANCEL:
                default: {

                    // dispatch out rollout rollover tap

                    // out?
                    var event = new InteractiveObjectTouchEvent( "touchOut", true, true, pointer.id, isPrimary, targetLocalPoint.x, targetLocalPoint.y )._setStagePoint( stagePoint );

//            event->setTarget( hitList.at( hitList.size()-1 ) );
//            hitList.at( hitList.size()-1 )->get1()->propagateEvent( event, hitList );

                    var outList = [];
                    if( prevState && prevState.overNow ) {

                        outList.push( prevState.overNow );
                        var container = prevState.overNow.parent;
                        while( container ) {
                            outList.unshift( container );
                            container = container.parent;
                        };

                        event._setTarget( prevState.overNow );
                    }

                    // roll out?
                    var numOfList = outList.length;
                    for( var i = 0; i < numOfList; i++ ) {
                        var event = new InteractiveObjectTouchEvent( "touchRollOut", true, true, pointer.id, isPrimary, targetLocalPoint.x, targetLocalPoint.y )._setStagePoint( stagePoint );

//                hitList.at( i )->get1()->dispatchEvent( event );
                        outList[ i ].dispatchEvent( event );
                    }


                    // tap? TODO イベント実行順はFlashに沿わせる
                    if( info.getAction()!=TouchEventInfo.CANCEL && prevState && prevState.beganFrom && prevState.beganFrom === targetObject ) {
                        var event = new InteractiveObjectTouchEvent( "touchTap", true, true, pointer.id, isPrimary, targetLocalPoint.x, targetLocalPoint.y )._setStagePoint( stagePoint );
                        event._setTarget( hitList[ hitList.length-1 ] );
                        hitList[ hitList.length-1 ]._propagateEvent( event, hitList );
                    }

                    // release state
                    if( this._primaryTouchId == pointer.id ) this._primaryTouchId = -1;//

                    break;
                }
            }

            // delete prev
//            if( prevState ) delete prevState;
        };

        cls.toString = function(){ return "[object Stage stageWidth=\""+this.stageWidth+"\" stageHeight=\""+this.stageHeight+"\"]"; }
    } );


    var Visitor = function( cloneBase ){
        cloneBase = cloneBase||{};
        this.parent = cloneBase.parent || new RenderingNode();
        this.offScreenRenderingRequests = cloneBase.offScreenRenderingRequests || [];
        this.renderingRequests = cloneBase.renderingRequests || [];
    };
    Visitor.prototype = {
        clone: function(){
            return new Visitor( this );
        }
    };

    var StageRenderObject = Class( Object, function( cls, parent ){

        cls.constructor = function(){
            parent.constructor.apply(this,arguments);

            this.visitor = new Visitor();// {clone:function(){return Object.create(this);}};
            this.visitor.parent = new RenderingNode();
            this.visitor.offScreenRenderingRequests = [];
            this.visitor.renderingRequests = [];

            this.matrix = new Matrix();
            this.colorTransform = new ColorTransform();

            this.root = null;
        };

        cls.processData = function() {

//            var global = new Matrix( 1 / CSSRenderingSystem.width, 0,0, 1/CSSRenderingSystem.height, 0, 0 );
//            global.scale( 2, -2 );
//            global.translate( -1, 1 );
            var global = new Matrix();
            // TODO globalMatrixのキャッシュ これではMatrixの算出結果キャシュが効かないのでViewportサイズの変更時のみ更新する形に。
            var tmp = this.matrix.clone();
            tmp.concat( global );

            if( this.visitor.parent._matrix._getVersion() !== tmp._getVersion() ) {
                this.visitor.parent.setMatrix( tmp );
                this.visitor.parent.concatenatedMatrix = this.visitor.parent.getMatrix();
                this.visitor.parent.concatenatedMatrixIsUpdated = true;
            } else {
                this.visitor.parent.setMatrix( tmp );
                this.visitor.parent.matrixIsUpdated = false;
                this.visitor.parent.concatenatedMatrixIsUpdated = false;
            }

            this.visitor.offScreenRenderingRequests = [];
            this.visitor.renderingRequests = [];
            this.root.visit( this.visitor.clone() );

        }

        cls.renderOffscreen = function() {
            //
        }

        cls.render = function() {

            CSSRenderingSystem.begin();

            var requests = this.visitor.renderingRequests;
            var len = requests.length;
            for( var i = 0; i < len; i++ )
                CSSRenderingSystem.render( requests[i] );

            CSSRenderingSystem.end();
        };
    } );


    /** Touch Pointer毎の状況 */
    var TouchPointerState = {

        create: function( pointerId, beganFrom, overNow ){
            return {
                /** */
                pointerId: pointerId,
                /** タッチ開始オブジェクト */
                beganFrom: beganFrom,
                /** タッチポインターが現在載っているオブジェクト */
                overNow: overNow
            };
        }
    };

    return Stage;
});