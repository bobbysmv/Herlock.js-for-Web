__req.define([
    "lib/Class",
    "src/view/flash/display/BlendMode",
    "src/view/geom/Matrix",
    "src/view/geom/ColorTransform"
], function( Class, BlendMode, Matrix, ColorTransform ) {

    var RenderingNode = Class( Object, function( cls, parent ){

        cls.constructor = function(){
            parent.constructor.apply(this,arguments);

            this._matrix = new Matrix();
            this._colorTransform = new ColorTransform();
            this.children = [];

            this.concatenatedMatrix = new Matrix();
            this.concatenatedColorTransform = new ColorTransform();
            this.concatenatedBlendMode = "normal";

        };

        cls.mask = null;


        cls.visible = true;
        cls.cacheAsBitmap = false;
        cls.matrixIsUpdated = false;
        cls.concatenatedMatrixIsUpdated = false;
        cls.colorTransformIsUpdated = false;
        cls.concatenatedColorTransformIsUpdated = false;
        cls.blendMode = "normal";


        cls.setMatrix = function( value ) {
            if( this._matrix._getVersion() == value._getVersion() ) {
                this.matrixIsUpdated = false;
                return;
            }
            this._matrix = value.clone();
            this.matrixIsUpdated = true;
        }
        cls.getMatrix = function() {
            return this._matrix.clone();
        }

        cls.setColorTransform = function( value ) {
            if( this._colorTransform._getVersion() == value._getVersion() ) {
                this.colorTransformIsUpdated = false;
                return;
            }
            this._colorTransform = value.clone();
            this.colorTransformIsUpdated = true;
        }
        cls.getColorTransform = function() { return this._colorTransform; };


        cls.visit = function( visitor ){

            var parent = visitor.parent;

            // 変形情報
            if( parent.concatenatedMatrixIsUpdated || this.matrixIsUpdated ) {
                this.concatenatedMatrix = this.getMatrix();
                this.concatenatedMatrix.concat( parent.concatenatedMatrix );
                this.concatenatedMatrixIsUpdated = true;
            } else {
                this.concatenatedMatrixIsUpdated = false;
            }

            // 色変換情報
            if( parent.concatenatedColorTransformIsUpdated || this.colorTransformIsUpdated ) {
                this.concatenatedColorTransform = this._colorTransform;
                this.concatenatedColorTransform.concat( parent.concatenatedColorTransform );
                this.concatenatedColorTransformIsUpdated = true;
            } else {
                this.concatenatedColorTransformIsUpdated = false;
            }

            // 表示フラグ
            this.visible = this.visible && parent.visible;

            // マスク情報 TODO 何の形式で引き回すか？
            this.mask = parent.mask? parent.mask: this.mask;

            // blendMode TODO mode=Layerの実装
            this.blendMode = this.blendMode == BlendMode.NORMAL? parent.blendMode: this.blendMode;

            //
            visitor.parent = this;

            var numOfChildren = this.children.length;
            for( var i = 0; i < numOfChildren; ++i )
                this.children[i].visit( visitor.clone() );
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