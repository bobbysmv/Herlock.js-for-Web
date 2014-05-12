define([
    "lib/Class",
    "module/common/event/EventDispatcher",
    "../internal/renderer/RenderingNode",
    "./BlendMode",
    "../geom/Transform",
    "module/view/geom/Point",
    "module/view/geom/Rectangle",
    "module/view/geom/Matrix",
    "module/view/geom/ColorTransform"
],function( Class, EventDispatcher, RenderingNode, BlendMode, Transform, Point, Rectangle, Matrix, ColorTransform ){

    var M_PI = Math.PI;

    var DisplayObject = Class( EventDispatcher, function( cls, parent ){

        cls.constructor = function(){
            parent.constructor.apply(this,arguments);


            /** 色変換情報 */
            this._colorTransform = new ColorTransform();

            /** 無変換描画エリア情報 private */
            this._naturalRect = new Rectangle();

            /** matrix反映後描画エリア情報 */
            this._boundsRect = new Rectangle();

            /** 座標変換情報 */
            this._matrix = new Matrix();

            /** */
            this._transformationPoint = null;

            /** */
            this._scale9Grid = new Rectangle();
        };

        // val
        cls._blendMode = BlendMode.NORMAL;
        cls._cacheAsBitmap = false;
        cls._cacheHandle = null;
        cls._visible = true;
        cls._parent = null;
        cls._mask = null;
        cls._containable = false;
        cls._interactive = false;
        cls._xValue = 0;
        cls._yValue = 0;
        cls._scaleXValue = 1;
        cls._scaleYValue = 1;
        cls._rotationValue = 0;
        cls._skewXValue = 0;
        cls._skewYValue = 0;
        cls._calcNaturalRectRequested = true;
        cls._calcBoundsRectRequested = true;
        cls._calcMatrixRequested = true;
        cls._enabledTransformationPoint = false;


        // property
        cls.alpha = { get: function(){ return this._colorTransform.alphaMultiplier; }, set: function( value ){
            this._colorTransform.alphaMultiplier = value;
        } };
        cls.blendMode = { get: function(){ return this._blendMode; }, set: function( value ){
            this._blendMode = value;
        } };
        cls.cacheAsBitmap = { get: function(){ return this._cacheAsBitmap; }, set: function( value ){
            this._cacheAsBitmap = value;
        } };
        /** TODO Filters */
        cls.height = { get: function(){
            return this._getBoundsRect().height;
        }, set: function( value ){
            this.scaleY = this.scaleY * value / this.height;
        } };
        /** TODO LoaderInfo? */
        cls.mask = { get: function(){ this._mask; }, set: function( value ){ this._mask = value; } };
        /** TODO mouse X,Y ?? */
        cls.name = "";
        /** TODO opaqueBackground ?? */
        cls.parent = { get: function(){ return this._parent; } };
        cls.root = { get: function(){  return this._parent? this._parent.root: this;  } };
        cls.scale9Grid = { get: function(){
            return this._scale9Grid.clone();
        }, set: function( value ){
            if( value === null )
                this._scale9Grid.setEmpty();
            else
                this._scale9Grid = value;
        } };

        cls.rotation = { get: function(){ return this._rotationValue; }, set: function( value ){
            if( this._enabledTransformationPoint ) {
                this._setRotationWithTransformPoint( value, this.transformationPoint );
                return;
            }
            // -180 180のあいだに収める
            while ( value > 180 ) value -= 360;
            while ( value < -180 ) value += 360;
            this._rotationValue = value;

            // skew
            var tmp = new Matrix();
            tmp._setSkewX(this._skewXValue);
            tmp._setSkewY(this._skewYValue);
            tmp.rotate( ( this._rotationValue - tmp._getRotation() ) / 180 * M_PI );
            this._skewXValue = tmp._getSkewX();
            this._skewYValue = tmp._getSkewY();

            // 描画エリア更新の通達
            this._requestCalcNaturalRect();
            //requestReleaseCache();
        } };
        cls._setRotationWithTransformPoint = function( value, transPoint ){
            // 現在の変形点座標 取得
            var matrix = this._getMatrix();
            var prevPoint = matrix.transformPoint( transPoint );

            // -180 180のあいだに収める
            while ( value > 180 ) value -= 360;
            while ( value < -180 ) value += 360;
            this._rotationValue = value;

            // skew
            var tmp = new Matrix();
            tmp._setSkewX(this._skewXValue);
            tmp._setSkewY(this._skewYValue);
            tmp.rotate( ( this._rotationValue - tmp._getRotation() ) / 180 * M_PI );
            this._skewXValue = tmp._getSkewX();
            this._skewYValue = tmp._getSkewY();

            // 描画エリア更新の通達
            this._requestCalcNaturalRect();

            // 更新後の変形点座標 取得
            matrix = this._getMatrix();
            var tmp = matrix.transformPoint( transPoint );

            // 差分 反映
            this._xValue += prevPoint.x - tmp.x;
            this._yValue += prevPoint.y - tmp.y;

            //
            this._requestCalcNaturalRect();
        };

        cls.scaleX = { get: function(){ return this._scaleXValue; }, set: function( value ){
            if( this._scaleXValue === value ) return;
            if( this._enabledTransformationPoint ) {
                this._setScaleXWithTransformPoint( value, this._transformationPoint );
                return;
            }

            if( isNaN( value ) ) console.error( "debug scaleX", this, value );
            this._scaleXValue = value;
            // 描画エリア更新の通達
            this._requestCalcNaturalRect();
        } };

        cls._setScaleXWithTransformPoint = function(value, transPoint){
            // 現在の変形点座標 取得
            var matrix = this._getMatrix();
            var prevPoint = matrix.transformPoint( transPoint );

            this._scaleXValue = value;
            this._requestCalcNaturalRect();

            // 更新後の変形点座標 取得
            matrix = this._getMatrix();
            var tmp = matrix.transformPoint( transPoint );

            // 差分 反映
            this._xValue += prevPoint.x - tmp.x;
            this._yValue += prevPoint.y - tmp.y;

            //
            this._requestCalcNaturalRect();
        };

        cls.scaleY = { get: function(){ return this._scaleYValue; }, set: function( value ){
            if( this._scaleYValue === value ) return;
            if( this._enabledTransformationPoint ) {
                this._setScaleYWithTransformPoint( value, this._transformationPoint );
                return;
            }
            this._scaleYValue = value;
            // 描画エリア更新の通達
            this._requestCalcNaturalRect();
            //requestReleaseCache();
        } };
        cls._setScaleYWithTransformPoint = function(value, transPoint){
            // 現在の変形点座標 取得
            var matrix = this._getMatrix();
            var prevPoint = matrix.transformPoint( transPoint );

            this._scaleYValue = value;
            this._requestCalcNaturalRect();

            // 更新後の変形点座標 取得
            matrix = this._getMatrix();
            var tmp = matrix.transformPoint( transPoint );

            // 差分 反映
            this._xValue += prevPoint.x - tmp.x;
            this._yValue += prevPoint.y - tmp.y;

            //
            this._requestCalcNaturalRect();
        };

        cls.stage = { get: function(){ return this._parent?this._parent.stage: null; } };
        cls.transform = { get: function(){
            var t = new Transform();
            t._initwithOwner( this );
            return t;
        }, set: function( value ){
            this._setColorTransform( value.getColorTransform() );
            this._setMatrix( value.getMatrix() );

            requestCalcNaturalRect();
        } };
        cls.visible = { get: function(){ return this._visible; }, set: function( value ){
            if( this._visible == value )return;
            this._visible = value;
            this._requestCalcNaturalRect();
        } };
        cls.width = { get: function(){
            return this._getBoundsRect().width;
        }, set: function( value ){
            this.scaleX = this.scaleX * value / this.width;
        } };
        cls.x = { get: function(){ return this._xValue; }, set: function( value ){
            if( this._xValue === value ) return;
            this._xValue = value;
            this._requestCalcNaturalRect();
        } };
        cls.y = { get: function(){ return this._yValue; }, set: function( value ){
            if( this._yValue === value ) return;
            this._yValue = value;
            this._requestCalcNaturalRect();
        } };

        // function
        cls.getBounds = function( targetCoordinateSpace ){
            // TODO Flash内部仕様と合わせる

            if( !targetCoordinateSpace ) targetCoordinateSpace = this;

            var myGlobalMatrix = this._getConcatenatedMatrix();
            var targetGlobalMatrix = targetCoordinateSpace._getConcatenatedMatrix();

            targetGlobalMatrix.invert();
            myGlobalMatrix.concat( targetGlobalMatrix );

            var naturalRect = this._getNaturalRect();
            var bounds = myGlobalMatrix._calculateBoundsRect( naturalRect );

            return bounds;
        };
        cls.getRect = function( targetCoordinateSpace ){
            //TODO Boundsと使い分ける
            return getBounds( targetCoordinateSpace );
        };
        cls.globalToLocal = function( point ) {
            // TODO Flash内部仕様と合わせる
            var tmp = this._getConcatenatedMatrix();
            tmp.invert();
            return tmp.transformPoint( point );
        };
        cls.hitTestObject = function ( obj ) {
            // TODO Flash内部仕様に合わせる
            var tmp = this._getNaturalRect();
            var bounds = this._getConcatenatedMatrix()._calculateBoundsRect( tmp );
            tmp = obj._getNaturalRect();
            var targetBounds = obj._getConcatenatedMatrix()._calculateBoundsRect( tmp );
            var result = bounds.containsRect( targetBounds ) || bounds.intersects( targetBounds );
            return result;
        }
        cls.hitTestPoint = function ( x, y, shapeFlag ) {
            // filter
            var stage = this.stage;
            if( !stage ) return false;

            // hitTest
            if( shapeFlag ) {
                // TODO Flashは描画ピクセルとの比較を謳っている。
                var bounds = this.getBounds( stage );
                return bounds.containsPoint( new Point( x,y ) );
            } else {
                var bounds = this.getBounds( stage );
                return bounds.containsPoint( new Point( x,y ) );
            }
        }
        cls.localToGlobal = function ( point ) {
            // TODO Flash内部仕様と合わせる
            return this._getConcatenatedMatrix().transformPoint( point );
        };

        // custom
        cls.transformationPoint = { get: function(){
            if( !this._transformationPoint ) return new Point(0,0);
            return this._transformationPoint.clone();
        }, set: function( point ){
            this._transformationPoint = point.clone();
            this._enabledTransformationPoint = true;
            if( point.x == 0 && point.y == 0 )
                this._enabledTransformationPoint = false;
        } };

        // internal

        cls._getMatrix = function(){
            return this._getMatrixRef().clone();
        };// { return matrix; } ;
        cls._getMatrixRef = function(){
            if( this._calcMatrixRequested ) {
                this._calcMatrixRequested = false;
                // matrix更新 重いので更新があれば取得時に計算している
                //matrix.createBox( scaleXValue, scaleYValue, rotationValue/180*M_PI , xValue, yValue, skewXValue, skewYValue );
                // @deprecated Flashの仕様に沿う実装。Matrixの仕組みとして反映したいがTODOで。
                this._matrix.identity();
                this._matrix.scale( this._scaleXValue, this._scaleYValue );
                if( this._skewXValue != this._skewYValue ) {
                    // 剪断
                    this._matrix._setSkewX( this._skewXValue );
                    this._matrix._setSkewY( this._skewYValue );
                } else {
                    // 回転
                    this._matrix.rotate( this._rotationValue / 180 * M_PI );
                }
                this._matrix.translate( this._xValue, this._yValue );
            }
            return this._matrix;
        };// { return matrix; } ;
        cls._setMatrix = function( mat ){

            this._xValue = mat._getX();
            this._yValue = mat._getY();
            this._rotationValue = mat._getRotation();
            this._scaleXValue = mat._getScaleX();
            this._scaleYValue = mat._getScaleY();
            this._skewXValue = mat._getSkewX();
            this._skewYValue = mat._getSkewY();

            this._requestCalcNaturalRect();
        };// { matrix = m; requestCalcNaturalRect(); };

        cls._getColorTransform = function() { return this._colorTransform.clone(); };
        cls._getColorTransformRef = function() { return this._colorTransform; };
        cls._setColorTransform = function( ct ){
            this._colorTransform = ct;
        };// { colorTransform = ct; };

        cls._getConcatenatedMatrix = function(){
            //TODO とりあえずの実装。内部仕様未調査
            // TODO getNodesToRoot つかってキャッシュ化とか

            var result = this._getMatrix();//matrix;
            var current = this.parent;
            while( current ) {
                var tmp = current._getMatrix();
                result.concat( tmp );
                current = current.parent;
            }
            return result;
        };

        cls._getConcatenatedColorTransform = function(){};

        cls._setParent = function( value ) {
            if( this._parent != null ) {
                this._parent = null;
            }
            if( value == null ) return;
            this._parent = value;
        };



        cls._notifyOnAddedToStage = function(){ if(this._hasEventListener("addedToStage")) this.dispatchEvent( new Event( "addedToStage" ) ); };

        cls._notifyOnRemovedFromStage = function(){ if(this._hasEventListener("removedFromStage")) this.dispatchEvent( new Event( "removedFromStage" ) ); };

        /** MainThread enterframeの通知  再生ヘッドが新しいフレームに入るときに送出されます。 */
        cls._notifyOnEnterFrame = function(){ if(this._hasEventListener("enterFrame")) this.dispatchEvent( new Event( "enterFrame" ) ); };

        /** MainThread frameConstructedの通知  フレーム表示オブジェクトのコンストラクターが実行した後で、かつフレームスクリプトが実行される前に送出されます。 */
        cls._notifyOnFrameConstructed = function(){};

        /** MainThread フレームスクリプト実行タイミングの通知 */
        cls._notifyOnExecuteFrameScript = function(){};

        /** MainThread exitframeの通知  再生ヘッドが現在のフレームを終了するときに送出されます。 */
        cls._notifyOnExitFrame = function(){ if(this._hasEventListener("exitFrame")) this.dispatchEvent( new Event( "exitFrame" ) ); };

        /** MainThread ベクター描画タイミングの通知 */
        cls._drawVectorGraphics = function(){};


        /** */
        cls._glPrepare = function( vis ){
            var node = this._getRenderingNode();

            // TODO 高負荷

            node.visible = this.visible;
            node.setMatrix( this._getMatrixRef() );
            node.setColorTransform( this._getColorTransform() );
            node.blendMode = this._blendMode;

            if( this._mask != null )
                node.mask = this._mask._getRenderingNode();
            else if( this._mask == null && !!node.mask )
                node.mask = null;

            return node;
        };



        /** 無変換描画エリア 取得 */
        cls._getNaturalRect = function() {
            if( this._calcNaturalRectRequested ) {
                this._calcNaturalRectRequested = false;
                this._calculateNaturalRect();
            }
            return this._naturalRect;
        }

        /** 無変換描画エリア情報計算 */
        cls._calculateNaturalRect = function() { this._naturalRect.setEmpty(); };

        /** 無変換描画エリア情報計算リクエスト
         *  @deprecated あとから親からの通知も受けるようにした為、リファクタリングしたい
         */
        cls._requestCalcNaturalRect = function( fromParent ){
            if( fromParent == true ) return;

            // filter
            if( this._calcMatrixRequested ) return;

            this._calcMatrixRequested = true;
            this._calcNaturalRectRequested = true;
            this._calcBoundsRectRequested = true;

            if( this._parent !== null )
                this._parent._requestCalcNaturalRect();
        };

        /** mtrix変換後描画エリア 取得 */
        cls._getBoundsRect = function() {
            if( this._calcBoundsRectRequested ) {
                this._calcBoundsRectRequested = false;

                // TODO 高速化
                var naturalRect = this._getNaturalRect();
                // 自身のMatrix反映
                this._boundsRect = this._getMatrix()._calculateBoundsRect( naturalRect );

                if( isNaN( this._boundsRect.width ) )
                    console.error( "debug", this, this._boundsRect );
            }
            return this._boundsRect;
        }

        /** rootまでの表示オブジェクトノードのリストを取得 TODO 名前イマイチ, キャッシュする？ */
        cls._getNodesToRoot = function(){
            var list = [];
            if( this._parent == null ) return list;

            var current = this;
            while( current != null ) {
                list.push(current);
                current = current.parent;
            }
            return list;
        };

        /** hitTest実装を内部と外部で分けるための関数。@deprecated */
        cls._hitTestStrictInternal = function( p ){
            // test
            var m = this._getMatrix();
            m.invert();
            //自座標系に変換し領域と比較する
            var transformedPoint = m.transformPoint(p);
            var test = this._getNaturalRect().containsPoint( transformedPoint );

//            console.log( ""+this+"\n "+test+"\n  "+this._getNaturalRect()+"\n  "+transformedPoint )

            //
            if( test && this.mask ) {
                // mask test
                var mask = this.mask;
                var cm = mask._getConcatenatedMatrix();
                cm.invert();

                // global化
                transformedPoint = this._getConcatenatedMatrix().transformPoint( transformedPoint );
                // maskLocal化
                transformedPoint = cm.transformPoint( transformedPoint );

                test = mask._getNaturalRect().containsPoint( transformedPoint ); // TODO 厳密化の際はmask->hitTestStrictInternalで
            }

            return test ? this : null;
        };


        /**  */
        cls._renderingNode = null;

        /** */
        cls._getRenderingNode = function(){
            if( !this._renderingNode ) this._renderingNode = this._createRenderingNode();
            return this._renderingNode;
        };
        /** factory method */
        cls._createRenderingNode = function() {
            return new RenderingNode();
        }

        cls.toString = function(){ return "[object DisplayObject name=\""+this.name+"\"]" }

    } );

    return DisplayObject;
});