__req.define([
    "lib/Class",
    "./DisplayObject",
    "src/view/flash/internal/renderer/RenderingNode",
    "src/view/flash/internal/renderer/SubImageRenderingObject",
    "src/view/gl/TextureObject"
],function( Class, DisplayObject, RenderingNode, SubImageRenderingObject, TextureObject ){

    var Bitmap = Class( DisplayObject, function( cls, parent ){

        /**
         *
         * @param bitmapData
         * @param [pixelSnapping]
         * @param [smoothing]
         * @param [clippingRect]
         */
        cls.constructor = function( bitmapData, pixelSnapping, smoothing, clippingRect ){
            parent.constructor.apply(this,arguments);
            var argLen = arguments.length;

            this._bitmapData = bitmapData;
            this._pixelSnapping = argLen>1? pixelSnapping: false;
            this._smoothing =  argLen>2? smoothing: false;
            this._clippingRect =  argLen>3? clippingRect: new Rectangle();
        };

        // property
        cls.bitmapData = { get: function () { return this._bitmapData; }, set: function ( value ) {

            if( this._bitmapData != null ) {
                this._bitmapData = null;
            }
            if( value != null )
                this._bitmapData = value;

            // TODO Bitmapの参照をbitmapDataへ渡す
            this._requestCalcNaturalRect();
        } };

        // function
        cls.setClippingRect = function ( rect ) {
            this._clippingRect = rect;
            this._requestCalcNaturalRect();
        };

        cls._calculateNaturalRect = function() {
            // filter
            if( this.bitmapData == null ) {
                this._naturalRect.setEmpty();
                return;
            }

            // 拡張。部分表示機能
            if( this._clippingRect.isEmpty() ) {
                this._naturalRect.width = this.bitmapData.width;
                this._naturalRect.height = this.bitmapData.height;
                return;
            }

            this._naturalRect.width = this._clippingRect.width;
            this._naturalRect.height = this._clippingRect.height;
        }

        // internal
        cls._glPrepare = function( vis ) {
            var node = this._getRenderingNode();

            node.children = [];

            if( this.bitmapData == null ) return DisplayObject.prototype._glPrepare.call(this, vis );

            this.bitmapData._glPrepare();

            node.scale9Grid = this.scale9Grid;
            node.clippingRect = this._clippingRect;

            node.textureImageHandle = this.bitmapData._getTextureImageHandle();
            var info = node.textureImageHandle.getTextureImageInfo();
            node.textureId = info.getTextureObject().getId();

            return DisplayObject.prototype._glPrepare.call(this,vis);
        }

        cls._createRenderingNode = function() {
            return new BitmapRenderingNode();
        }

        cls.toString = function(){ return "[object Bitmap name=\""+this.name+"\"]" };
    } );

    var BitmapRenderingNode = Class( RenderingNode, function( cls, parent ){

        cls.constructor = function(){
            parent.constructor.apply(this,arguments);

            this._renderingObjects = [
                new SubImageRenderingObject(),
                new SubImageRenderingObject(),
                new SubImageRenderingObject(),
                new SubImageRenderingObject(),
                new SubImageRenderingObject(),
                new SubImageRenderingObject(),
                new SubImageRenderingObject(),
                new SubImageRenderingObject(),
                new SubImageRenderingObject()
            ];
        };

        cls.clippingRect = null;

        cls.textureImageHandle = null;
        cls.textureId = null;

        cls.scale9Grid = null;


        cls.setMatrix = function( value ) {
            parent.setMatrix.call(this,value);
        }

        cls.visit = function( visitor ){
            if( !this.textureImageHandle || this.textureImageHandle.isEmpty() ) return;


            if( !this.visible || !visitor.parent.visible ) {
                RenderingNode.prototype.visit.call( this, visitor );
                return;
            }
            if( this.scale9Grid.isEmpty() )
                RenderingNode.prototype.visit.call( this, visitor );


            var info = this.textureImageHandle.getTextureImageInfo();
            var textureObject = TextureObject.getById( this.textureId );

            var matrix = this.concatenatedMatrix.clone();

            var texW = textureObject.getWidth();
            var texH = textureObject.getHeight();


            if( this.scale9Grid.isEmpty() ) {


                var object = this._renderingObjects[0];

                var texRect = info.area.clone();

                object.textureHandle = this.textureImageHandle;
                object.textureId = this.textureId;
                object.blendMode = this.blendMode;
                object.maskNode = this.mask;
                object.colorTransform = this.concatenatedColorTransform;

                if( this.clippingRect.isEmpty()!==true ) {
                    texRect.x += this.clippingRect.x;
                    texRect.y += this.clippingRect.y;
                    texRect.width = this.clippingRect.width;
                    texRect.height = this.clippingRect.height;
                }

//                texRect = new Rectangle( 0,0,2048,2048 ); //test

                // 頂点座標, texture座標, 頂...
                var points = [
                    matrix.transformPoint( new Point( 0,0 ) ),
                    matrix.transformPoint( new Point( 0,texRect.height ) ),
                    matrix.transformPoint( new Point( texRect.width,0 ) ),
                    matrix.transformPoint( new Point( texRect.width,texRect.height ) )
                ];

                // tri1

                object.vertexes[0] = (points[0].x);
                object.vertexes[1] = ( points[0].y );
                object.vertexes[2] = (texRect.left / texW);
                object.vertexes[3] = (texRect.top / texH);

                object.vertexes[4] = (points[1].x);
                object.vertexes[5] = ( points[1].y );
                object.vertexes[6] = (texRect.left / texW);
                object.vertexes[7] = (texRect.bottom / texH);

                object.vertexes[8] = (points[2].x);
                object.vertexes[9] = (points[2].y);
                object.vertexes[10] = (texRect.right / texW);
                object.vertexes[11] = (texRect.top / texH);


                // tri2 20131120 反時計回りに修正

                object.vertexes[12] = (points[1].x);
                object.vertexes[13] = (points[1].y);
                object.vertexes[14] = (texRect.left / texW);
                object.vertexes[15] = (texRect.bottom / texH);

                object.vertexes[16] = (points[3].x);
                object.vertexes[17] = (points[3].y);
                object.vertexes[18] = (texRect.right / texW);
                object.vertexes[19] = (texRect.bottom / texH);

                object.vertexes[20] = (points[2].x);
                object.vertexes[21] = (points[2].y);
                object.vertexes[22] = (texRect.right / texW);
                object.vertexes[23] = (texRect.top / texH);

                visitor.renderingRequests.push( object );

            } else {

                // 9分割 @deprecated
                // TODO 9個の子要素に分割する感じで実装できないか？

                // bitmap TRBL
                var bt = 0, br = info.area.width, bb = info.area.height, bl = 0;
                if( this.clippingRect.isEmpty() != true ) {
                    bt = 0, br = this.clippingRect.width, bb = this.clippingRect.height, bl = 0;
                }

                // scale9Grip TRBL
                var gt = this.scale9Grid.top, gr = this.scale9Grid.right, gb = this.scale9Grid.bottom, gl = this.scale9Grid.left;
                // 可変域の伸縮済みサイズ
                var stretchableAreaWidth = (br-bl) * this.getMatrix()._getScaleX() - (gl-bl) - (br-gr);
                var stretchableAreaHeight = (bb-bt) * this.getMatrix()._getScaleY() - (gt-bt) - (bb-gb);
                // 可変域の縦,横方向変形情報
                var stretchH = new Matrix, stretchV = new Matrix;
                stretchH.scale( stretchableAreaWidth / this.scale9Grid.width , 1);
                stretchV.scale( 1, stretchableAreaHeight / this.scale9Grid.height );

                // matrix_rect data
                var rects = [ new Rectangle(),new Rectangle(),new Rectangle(),new Rectangle(),new Rectangle(),new Rectangle(),new Rectangle(),new Rectangle(),new Rectangle() ];
                var mats = [ new Matrix(),new Matrix(),new Matrix(),new Matrix(),new Matrix(),new Matrix(),new Matrix(),new Matrix(),new Matrix() ];

                // 元サイズで9分割した矩形
                var gridTL = rects[0];
                var gridTC = rects[1];
                var gridTR = rects[2];

                var gridML = rects[3];
                var gridMC = rects[4];
                var gridMR = rects[5];

                var gridBL = rects[6];
                var gridBC = rects[7];
                var gridBR = rects[8];

                gridTL._set( bl, bt, gl-bl, gt-bt );
                gridTC._set( gl, bt, gr-gl, gt-bt );
                gridTR._set( gr, bt, br-gr, gt-bt );

                gridML._set( bl, gt, gl-bl, gb-gt );
                gridMC._set( gl, gt, gr-gl, gb-gt );
                gridMR._set( gr, gt, br-gr, gb-gt );

                gridBL._set( bl, gb, gl-bl, bb-gb );
                gridBC._set( gl, gb, gr-gl, bb-gb );
                gridBR._set( gr, gb, br-gr, bb-gb );

                // 各Gridの変形情報を生成する
                var mat = this.getMatrix().clone();
                mat._setScaleX(1);
                mat._setScaleY(1);
                mat.concat( visitor.parent.concatenatedMatrix );
                /*
                 Matrix inv = matrix;
                 inv.invert();
                 Matrix tmp = visitor.parent.concatenatedMatrix;
                 inv.concat(tmp);
                 mat.concat( inv );
                 */

                var parentConcatenatedMatrix = mat;//visitor.parent.concatenatedMatrix;


                // 上段
                var matTL = mats[0];
                matTL.concat( parentConcatenatedMatrix );

                var matTC = mats[1];
                matTC.concat(stretchH);
                matTC.translate(gridTC.x, gridTC.y);
                matTC.concat( parentConcatenatedMatrix );

                var matTR = mats[2];
                matTR.translate(gridTC.x + stretchableAreaWidth, gridTR.y);
                matTR.concat( parentConcatenatedMatrix );

                // 中段
                var matML = mats[3];
                matML.concat(stretchV);
                matML.translate(gridML.x, gridML.y);
                matML.concat( parentConcatenatedMatrix );

                var matMC = mats[4];
                matMC.concat(stretchH);
                matMC.concat(stretchV);
                matMC.translate(gridMC.x, gridMC.y);
                matMC.concat( parentConcatenatedMatrix );

                var matMR = mats[5];
                matMR.concat(stretchV);
                matMR.translate(gridMC.x + stretchableAreaWidth, gridMR.y);
                matMR.concat( parentConcatenatedMatrix );

                // 下段
                var matBL = mats[6];
                matBL.translate( gridML.x, gridML.y + stretchableAreaHeight );
                matBL.concat( parentConcatenatedMatrix );

                var matBC = mats[7];
                matBC.concat(stretchH);
                matBC.translate( gridBC.x, gridMC.y + stretchableAreaHeight );
                matBC.concat( parentConcatenatedMatrix );

                var matBR = mats[8];
                matBR.translate(gridBC.x + stretchableAreaWidth, gridMR.y + stretchableAreaHeight );
                matBR.concat( parentConcatenatedMatrix );

                // clip
                if( !this.clippingRect.isEmpty() ) {
                    // offset
                    var offset = new Point( this.clippingRect.x, this.clippingRect.y );
                    gridTL.offsetPoint( offset );
                    gridTC.offsetPoint( offset );
                    gridTR.offsetPoint( offset );

                    gridML.offsetPoint( offset );
                    gridMC.offsetPoint( offset );
                    gridMR.offsetPoint( offset );

                    gridBL.offsetPoint( offset );
                    gridBC.offsetPoint( offset );
                    gridBR.offsetPoint( offset );
                }

                //
                RenderingNode.prototype.visit.call( this, visitor );


                for ( var i = 0; i < 9; i++ ) {

                    var object = this._renderingObjects[i];
                    var matrix = mats[i];
                    var clippingRect = rects[i];

                    if( clippingRect.isEmpty() ) continue;

                    var texRect = info.area.clone();

                    object.textureHandle = this.textureImageHandle;
                    object.textureId = this.textureId;
                    object.blendMode = this.blendMode;
                    object.maskNode = this.mask;
                    object.colorTransform = this.concatenatedColorTransform;

                    if( clippingRect.isEmpty() != true ) {
                        texRect.x += clippingRect.x;
                        texRect.y += clippingRect.y;
                        texRect.width = clippingRect.width;
                        texRect.height = clippingRect.height;
                    }

                    // 頂点座標, texture座標, 頂...
                    var points = [
                        matrix.transformPoint( new Point( 0,0 ) ),
                        matrix.transformPoint( new Point( 0,texRect.height ) ),
                        matrix.transformPoint( new Point( texRect.width,0 ) ),
                        matrix.transformPoint( new Point( texRect.width,texRect.height ) )
                    ];

                    // tri1

                    object.vertexes[0] = (points[0].x);
                    object.vertexes[1] = ( points[0].y );
                    object.vertexes[2] = (texRect.left / texW);
                    object.vertexes[3] = (texRect.top / texH);

                    object.vertexes[4] = (points[1].x);
                    object.vertexes[5] = ( points[1].y );
                    object.vertexes[6] = (texRect.left / texW);
                    object.vertexes[7] = (texRect.bottom / texH);

                    object.vertexes[8] = (points[2].x);
                    object.vertexes[9] = ( points[2].y );
                    object.vertexes[10] = (texRect.right / texW);
                    object.vertexes[11] = (texRect.top / texH);


                    // tri2 20131120 反時計回りに修正

                    object.vertexes[12] = (points[1].x);
                    object.vertexes[13] = ( points[1].y );
                    object.vertexes[14] = (texRect.left / texW);
                    object.vertexes[15] = (texRect.bottom / texH);

                    object.vertexes[16] = (points[3].x);
                    object.vertexes[17] = ( points[3].y );
                    object.vertexes[18] = (texRect.right / texW);
                    object.vertexes[19] = (texRect.bottom / texH);

                    object.vertexes[20] = (points[2].x);
                    object.vertexes[21] = ( points[2].y );
                    object.vertexes[22] = (texRect.right / texW);
                    object.vertexes[23] = (texRect.top / texH);

                    visitor.renderingRequests.push( object );
                }

            }
        }

        cls.getBoundingBox = function( box ){
            //
            var info = this.textureImageHandle.getTextureImageInfo();

            var matrix = this.concatenatedMatrix;

            var size = info.area.clone();
            if( this.clippingRect.isEmpty()!==true ) {
                size.width = this.clippingRect.width;
                size.height = this.clippingRect.height;
            }
            size.x = 0;
            size.y = 0;

            var self = matrix._calculateBoundsRect( size );
            var tmp = box.union( self );
            box._set( tmp.x, tmp.y, tmp.width, tmp.height );

        }

    });

    return Bitmap;
});