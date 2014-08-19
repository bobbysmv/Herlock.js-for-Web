define([
    "lib/Class",
    "module/view/flash/display/BlendMode",
    "module/view/geom/Matrix",
    "module/view/geom/ColorTransform"
], function( Class, BlendMode, Matrix, ColorTransform ) {

    var RenderingNode = Class( Object, function( cls, parent ){

        /**
         * ブレンドモード
         * @type {String}
         * @private
         */
        cls._blendMode = "normal";
        /**
         * 連結済ブレンドモード
         * @type {String}
         */
        cls.concatenatedBlendMode = "normal";

        /**
         * マスク対象ノード
         * @type {*}
         * @private
         */
        cls._mask = null;
        /**
         * 連結済マスク対象ノード
         * @type {*}
         */
        cls.concatenatedMask = null;

        /**
         * 表示フラグ
         * @type {Boolean}
         * @private
         */
        cls._visible = true;
        /**
         * 連結済表示フラグ
         * @type {Boolean}
         */
        cls.concatenatedVisible = true;

        /**
         * 描画キャッシュフラグ
         * @type {Boolean}
         */
//        cls.cacheAsBitmap = false;

        /**
         * マトリックス
         * @type {*}
         * @private
         */
        cls._matrix = null;
        /**
         * 連結済マトリックス
         * @type {*}
         */
        cls.concatenatedMatrix = null;

        /**
         * ColorTransform
         * @type {*}
         * @private
         */
        cls._colorTransform = null;
        /**
         * 連結済ColorTransform
         * @type {*}
         */
        cls.concatenatedColorTransform = null;

        /**
         *
         * @type {Boolean}
         */
        cls.needUpdateRequests = false;
        /**
         *
         * @type {Boolean}
         */
        cls.needUpdateRequestsFromChildren = false;

        /**
         * 子要素リストの更新済フラグ
         * @type {Boolean}
         */
        cls.childrenIsUpdated = false;

        /**
         * マトリックス更新済フラグ
         * @type {Boolean}
         */
        cls.matrixIsUpdated = false;

        /**
         * 連結済マトリックス更新済フラグ
         * @type {Boolean}
         */
        cls.concatenatedMatrixIsUpdated = false;

        /**
         * ColorTransform更新済フラグ
         * @type {Boolean}
         */
        cls.colorTransformIsUpdated = false;

        /**
         * 連結済ColorTransform更新済フラグ
         * @type {Boolean}
         */
        cls.concatenatedColorTransformIsUpdated = false;


        /**
         *
         */
        cls.constructor = function(){
            parent.constructor.apply(this,arguments);

            this.children = [];

            this._matrix = new Matrix();
            this.concatenatedMatrix = new Matrix();

            this._colorTransform = new ColorTransform();
            this.concatenatedColorTransform = new ColorTransform();

            this._requestObjectsCache = [];
        };


        cls.setMatrix = function( value ) {
            if( this._matrix._getVersion() == value._getVersion() ) return;
            this._matrix = value.clone();
            this.matrixIsUpdated = true;
        }
        cls.getMatrix = function() {
            return this._matrix.clone();
        }

        cls.setColorTransform = function( value ) {
            if( this._colorTransform._getVersion() == value._getVersion() ) return;
            this._colorTransform = value.clone();
            this.colorTransformIsUpdated = true;
        }
        cls.getColorTransform = function() { return this._colorTransform; };


        /**
         * DisplayObjectのプロパティ反映
         * GL prepare段階で呼ばれる
         *
         * 内部仕様: プロパティに差分があればvisitorが持つ描画requestのうち、管轄のものを削除,更新する
         *
         * @param visitor
         * @param visible
         * @param blendMode
         * @param mask
         * @param matrix
         * @param colorTransform
         */
        cls.reflectProps = function( visitor, visible, blendMode, mask, matrix, colorTransform ) {
            var parent = visitor.parent;

            this.setMatrix( matrix );
            this.setColorTransform( colorTransform );

            if( false
                || this._visible !== visible
                || this._blendMode !== blendMode
                || this._mask !== mask
                || this.childrenIsUpdated
                || this.matrixIsUpdated
                || this.colorTransformIsUpdated
                ) {
                // 描画リクエストの更新が必要
                this.needUpdateRequests = true;
            }

            this._visible = visible;
            this._blendMode = blendMode;
            this._mask = mask;
        };

        cls.visit = function( visitor ){

            var parent = visitor.parent;

            // TODO 描画request使い回し
            if( !this.needUpdateRequests && !this.needUpdateRequestsFromChildren ) {
                //
                return this._requestObjectsCache;
            }


            //
            this.childrenIsUpdated = false;

            // 変形情報
            if( parent.concatenatedMatrixIsUpdated || this.matrixIsUpdated ) {
                this.matrixIsUpdated = false;
                this.concatenatedMatrix = this.getMatrix();
                this.concatenatedMatrix.concat( parent.concatenatedMatrix );
                this.concatenatedMatrixIsUpdated = true;
            } else {
                this.concatenatedMatrixIsUpdated = false;
            }

            // 色変換情報
            if( parent.concatenatedColorTransformIsUpdated || this.colorTransformIsUpdated ) {
                this.colorTransformIsUpdated = false;
                this.concatenatedColorTransform = this._colorTransform;
                this.concatenatedColorTransform.concat( parent.concatenatedColorTransform );
                this.concatenatedColorTransformIsUpdated = true;
            } else {
                this.concatenatedColorTransformIsUpdated = false;
            }

            // 表示フラグ
            this.concatenatedVisible = this._visible && parent.concatenatedVisible;

            // マスク情報 TODO 何の形式で引き回すか？
            this.concatenatedMask = parent.concatenatedMask? parent.concatenatedMask: this._mask;

            // blendMode TODO mode=Layerの実装
            this.concatenatedBlendMode =
                this._blendMode == BlendMode.NORMAL
                    ? parent.concatenatedBlendMode
                    : this._blendMode;

            //
            visitor.parent = this;


            this._requestObjectsCache.length = 0;


            var numOfChildren = this.children.length;
            for( var i = 0; i < numOfChildren; ++i ) {
                var child = this.children[i];
                child.needUpdateRequests = child.needUpdateRequests || this.needUpdateRequests;
                Array.prototype.push.apply(
                    this._requestObjectsCache,
                    child.visit( visitor.clone() )
                );
            }

            //
            this.needUpdateRequests = false;
            this.needUpdateRequestsFromChildren = false;

            return this._requestObjectsCache;
        };


        cls.getBoundingBox = function( box ){
            if( !this.visible ) return;
            var numOfChildren = this.children.length;
            for( var i = 0; i < numOfChildren; ++i )
                this.children[i].getBoundingBox( box );
        };

    } );

    return RenderingNode;
});