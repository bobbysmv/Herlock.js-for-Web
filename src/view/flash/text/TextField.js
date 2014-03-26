__req.define([
    "lib/Class",
    "../display/InteractiveObject",
    "./TextFormat",
    "./TextFieldAutoSize",
    "./TextFormatAlign",
    "src/graphics/BitmapProxy",
    "src/view/flash/internal/renderer/RenderingNode",
    "src/view/flash/internal/renderer/SubImageRenderingObject",
    "src/view/gl/TextureObject",
    "src/view/gl/tile/SubImageHandle"
],function( Class, InteractiveObject, TextFormat, TextFieldAutoSize, TextFormatAlign, BitmapProxy, RenderingNode, SubImageRenderingObject, TextureObject, SubImageHandle ){

    var MARGIN_PX = 2;

    function RGBToARGBWithAlpha( color, alpha ) {
        return ( parseInt( alpha * 255 ) *0x01000000 ) + color;
    }

    var TextField = Class( InteractiveObject, function( cls, parent ){

        cls.constructor = function(){
            parent.constructor.apply(this,arguments);

            this._text = "";
            this._drawTextRequested = true;
            this._calcTextRequested = true;
            this._bitmapProxy = null;
            this._textureImageHandle = null;

            this._autoSize = TextFieldAutoSize.NONE;
            this._background = false;
            this._backgroundColor = 0xFFFFFF;
//            this._background = true;
//            this._backgroundColor = 0xFF0000;

            this._border = false;
            this._borderColor = 0x000000;
            this._defaultTextFormat = null;
            this._multiline = false;

//            this._type = TextFieldType.DYNAMIC;
            this._wordWrap = false;
            this._scrollH = 0;
            this._scrollV = 0;

            this._maxScrollH = 0;
            this._maxScrollV = 0;
            this._maxChars = 0;
            this._bottomScrollV = 0;

            this._naturalRect.height = 100;
            this._naturalRect.width = 100;

            this._defaultTextFormat = new TextFormat();
            this._bitmapProxy = BitmapProxy.create( 10 , 10 );// dummy
            this._textureImageHandle = new SubImageHandle();

        };



        //cls->prop( "alwaysShowSelection", alwaysShowSelection_getter );
        //cls->prop( "antiAliasType" , antiAliasType_getter );
        cls.autoSize = { get: function() { return this._autoSize; }, set: function( value ) {
            if( this._autoSize == value )return;
            this._autoSize = value;
            this._requestCalcNaturalRect();
        } };
        cls.background = { get: function() { return this._background; }, set: function( value ) {
            if( this._background == value )return;
            this._background = value;
            this._requestCalcAndDrawText();
        } };
        cls.backgroundColor = { get: function() { return this._backgroundColor; }, set: function( value ) {
            if( this._backgroundColor == value )return;
            this._backgroundColor = value;
            this._requestCalcAndDrawText();
        } };
        cls.border = { get: function() { return this._border; }, set: function( value ) {
            if( this._border == value )return;
            this._border = value;
            this._requestCalcAndDrawText();
        } };
        cls.borderColor = { get: function() { return this._borderColor; }, set: function( value ) {
            if( this._borderColor == value )return;
            this._borderColor = value;
            this._requestCalcAndDrawText();
        } };
        cls.bottomScrollV = { get: function() { return this._bottomScrollV; } };
        //cls.caretIndex", caretIndex_getter );
        //cls.condenseWhite", condenseWhite_getter, condenseWhite_setter );
        cls.defaultTextFormat = { get: function() { return this._defaultTextFormat; }, set: function( value ) {
            if( this._defaultTextFormat != null ) {
                delete this._defaultTextFormat;
                this._defaultTextFormat = null;
            }

            this._defaultTextFormat = value;
            this._requestCalcAndDrawText();
        } };
        //cls.displayAsPassword", displayAsPassword_getter, displayAsPassword_setter );
        //cls.embedFonts", embedFonts_getter, embedFonts_setter );
        //cls.gridFitType", gridFitType_getter, gridFitType_setter);
        //cls.htmlText", htmlText_getter, htmlText_setter );
        cls.length = { get: function() { return this._text.length; } };
        cls.maxChars = { get: function() { return this._maxChars; }, set: function( value ) {
            this._ = value;

        } };
        cls.maxScrollH = { get: function() { return this._maxScrollH; } };
        cls.maxScrollV = { get: function() { return this._maxScrollV; } };
        //cls.mouseWheelEnabled", mouseWheelEnabled_getter, mouseWheelEnabled_setter );
        cls.multiline = { get: function() { return this._multiline; }, set: function( value ) {
            if( this._multiline == value ) return;
            this._multiline = value;
            this._requestCalcAndDrawText();
        } };
        cls.numLines = { get: function() {
            if( this._calcTextRequested ) this._calcText();
            return this._numOfLines;
        } };
        //cls.restrict", restrict_getter, restrict_setter );
        cls.scrollH = { get: function() { return this._scrollH; }, set: function( value ) {
            this._scrollH = value;
            this._requestCalcAndDrawText();
        } };
        cls.scrollV = { get: function() { return this._scrollV; }, set: function( value ) {
            this._scrollV = value;
            this._requestCalcAndDrawText();
        } };
        //cls.selectable", selectable_getter, selectable_setter );
        //cls.selectionBeginIndex", selectionBeginIndex_getter );
        //cls.selectionEndIndex", selectionEndIndex_getter );
        //cls.sharpness", sharpness_getter, sharpness_setter );
        //cls.styleSheet", styleSheet_getter );
        cls.text = { get: function() { return this._text; }, set: function( value ) {
            this._text = value;
            this._requestCalcAndDrawText();
            this._requestCalcNaturalRect();// TODO
        } };
        cls.textColor = { get: function() { return this._defaultTextFormat.color; }, set: function( value ) {
            this._defaultTextFormat.color = value;
            this._requestCalcAndDrawText();
        } };
        cls.textHeight = { get: function() {
            if( this._calcTextRequested ) this._calcText();
            return this._textRect.h;
        } };
        cls.textWidth = { get: function() {
            if( this._calcTextRequested ) this._calcText();
            return this._textRect.w;
        } };
        //cls.thickness", thickness_getter, thickness_setter );
        cls.type = { get: function() { return this._type; }, set: function( value ) {
            this._type = value;
        } };
        //cls.useRichTextClipboard", useRichTextClipboard_getter, useRichTextClipboard_setter );
        cls.wordWrap = { get: function() { return this._wordWrap; }, set: function( value ) {
            this._wordWrap = value;
            this._requestCalcAndDrawText();
        } };


        // function
        cls.appendText = function( newText ){
            this._text += newText;
            this._requestCalcAndDrawText();
        };
        //cls.getCharBoundaries", getCharBoundaries_func );
        //cls.getCharIndexAtPoint", getCharIndexAtPoint_func );
        //cls.getFirstCharInParagraph", getFirstCharInParagraph_func );
        //cls.getImageReference", getImageReference_func );
        //cls.getLineIndexAtPoint", getLineIndexAtPoint_func );
        //cls.getLineIndexOfChar", getLineIndexOfChar_func );
        //cls.getLineLength", getLineLength_func );
        //cls.getLineMetrics", getLineMetrics_func );
        //cls.getLineOffset", getLineOffset_func );
        //cls.getLineText", getLineText_func );
        //cls.getParagraphLength", getParagraphLength_func );
        cls.getTextFormat = function(){
            // TODO そのうちちゃんとやる
            return this._defaultTextFormat;
        };
        //cls.isFontCompatible", isFontCompatible_func );
        //cls.replaceSelectedText", replaceSelectedText_func );
        //cls.replaceText", replaceText_func );
        //cls.setSelection", setSelection_func );
        cls.setTextFormat = function( format ){
            // TODO そのうちちゃんとやる
            // @deprecated
            if( this._defaultTextFormat ) {
                this._defaultTextFormat = null;
            }

            this._defaultTextFormat = format;
            this._requestCalcAndDrawText();
        };


        // internal
        /** 内部矩形に直接反映 */
        cls.height = { get:function(){
            return this._getBoundsRect().height;
        }, set:function( value ){
            if( this._naturalRect.height == value ) return ;
            this._naturalRect.height = value;
            this._requestCalcNaturalRect();
        }};

        /** 内部矩形に直接反映 */
        cls.width = { get:function(){
            return this._getBoundsRect().width;
        }, set:function( value ){
            if( this._naturalRect.width == value ) return ;
            this._naturalRect.width = value;
            this._requestCalcNaturalRect();
        }};


        /** 再計算再描画リクエスト*/
        cls._requestCalcAndDrawText = function(){
            this._drawTextRequested = true;
            this._calcTextRequested = true;
        };


        /** MainThread ベクター描画タイミングの通知 */
        cls._drawVectorGraphics = function(){
            //
            /* TEST glPrepareで処理
             if( drawTextRequested ) {
             drawText();
             textureImageHandle->set( *bitmapProxy );
             requestReleaseCache();
             }
             */
        };



        /** */
        cls._glPrepare = function( vis ){

            if( this._drawTextRequested ) {
                // gl準備段階でまだ処理できていない描画リクエストがあったら仕方なくここで処理する
                this._drawText();
                this._textureImageHandle.set( this._bitmapProxy );
            }

            if( this._textureImageHandle.isEmpty() ) return null;

            var node = this._getRenderingNode();

            // TexSubImage
            var info = this._textureImageHandle.getTextureImageInfo();// 更新されていればsubImage実行 TODO スマートな実装

            node.textureImageHandle = this._textureImageHandle;
            node.textureId = info.getTextureObject().getId();


            return parent._glPrepare.call(this,vis);
        }


        /** 無変換描画エリア情報計算 */
        cls._calculateNaturalRect = function(){
            if( this._calcTextRequested ) this._calcText();

            var defaultTextFormat = this._defaultTextFormat;

            // autoSize @link http://wonderfl.net/c/fr93/edit
            switch( this._autoSize ) {
                case TextFieldAutoSize.NONE: break;
                case TextFieldAutoSize.LEFT: {
                    // @deprecated
                    var work = new Rectangle();
                    work.width = this._textRect.width + MARGIN_PX*2 + this._defaultTextFormat.leftMargin + this._defaultTextFormat.blockIndent + this._defaultTextFormat.rightMargin;
                    work.height = this._textRect.height + MARGIN_PX*2;
                    this._naturalRect = work;
                    break;
                }
                case TextFieldAutoSize.CENTER: {
                    // @deprecated
                    var backupWidth = this._naturalRect.width;
                    var work = new Rectangle();
                    work.width = this._textRect.width + MARGIN_PX*2 + this._defaultTextFormat.leftMargin + this._defaultTextFormat.blockIndent + this._defaultTextFormat.rightMargin;
                    work.height = this._textRect.height + MARGIN_PX*2;
                    this._naturalRect = work;
                    this.x = ( this.x + ( backupWidth - work.width)/2 );
                    break;
                }
                case TextFieldAutoSize.RIGHT: {
                    // @deprecated
                    var backupWidth = this._naturalRect.width;
                    var work = new Rectangle();
                    work.width = this._textRect.width + MARGIN_PX*2 + this._defaultTextFormat.leftMargin + this._defaultTextFormat.blockIndent + this._defaultTextFormat.rightMargin;
                    work.height = this._textRect.height + MARGIN_PX*2;
                    this._naturalRect = work;
                    this.x = ( this.x + ( backupWidth - work.width) );
                    break;
                }
            }
        }

        /** 無変換描画エリア情報計算リクエスト
         *  @deprecated あとから親からの通知も受けるようにした為、リファクタリングしたい
         */
        cls._requestCalcNaturalRect = function( fromParent){
            if( fromParent ) return;// TODO 実描画サイズの変更から再描画はするが・・
            this._requestCalcAndDrawText();// TODO offsetのみの変更でもsubImageが走ってしまっている。
            parent._requestCalcNaturalRect.call( this, fromParent );
        }



        /** 描画 */
        cls._drawText = function() {
            var matrix = this._getMatrix();//this._getConcatenatedMatrix();

            // サイズ0なら描画処理自体しない。内部で無限ループしてしまう。
            if( matrix._getScaleX() == 0 || matrix._getScaleY() == 0 )
                return ;

            // 描画サイズ算出
            var naturalRect = this._getNaturalRect();
            var drawingRect = new Rectangle( 0, 0, matrix._getScaleX() * naturalRect.width, matrix._getScaleY() * naturalRect.height );


            this._drawTextRequested = false;

            // TODO AdjustAmountOfExternalAllocatedMemoryはmainthreadからのみ実行可能。フラグ管理するかサイズ算出時に予め呼ぶか
            /*
             #ifdef BUILD_FOR_ANDROID
             if( bitmapProxy.isNotEmpty() )
             V8::AdjustAmountOfExternalAllocatedMemory( -bitmapProxy->getDataSize() );
             #endif

             bitmapProxy = BitmapProxy::create( drawingRect.w, drawingRect.height );

             #ifdef BUILD_FOR_ANDROID
             V8::AdjustAmountOfExternalAllocatedMemory( bitmapProxy->getDataSize() );
             #endif
             */


            // 描画先Bitmap生成 @memoサイズが変わった場合のみ再生成
            if( !this._bitmapProxy || drawingRect.width != this._bitmapProxy.width() || drawingRect.height != this._bitmapProxy.height() )
                this._bitmapProxy = BitmapProxy.create( drawingRect.width, drawingRect.height );


            // 描画
            var canvas = this._bitmapProxy.getCanvas();

            //  background
            if( this._background ) {
                canvas.setFillColor( RGBToARGBWithAlpha( this._backgroundColor, 1.0) );
                canvas.fillRect(0,0, this._bitmapProxy.width(), this._bitmapProxy.height() );
            } else {
                canvas.clear();
            }
            //  border
            if( this._border ) {
                canvas.setStrokeColor( RGBToARGBWithAlpha( this._borderColor, 1.0 ) );
                canvas.strokeRect( 0,0, this._bitmapProxy.width(), this._bitmapProxy.height() );
            }


            // canvas 設定
            canvas.setFillColor( RGBToARGBWithAlpha( this._defaultTextFormat.color, 1.0 ) );
            canvas.setFontSize( this._defaultTextFormat.size * matrix._getScaleY() );// Flashの仕様
            canvas.setLetterSpacing( this._defaultTextFormat.letterSpacing );

            //
            var linePositions = this._calcTextLinePositions();
            var met = canvas.getFontMetrics();
            var ascent = met.ascent;
            var descent = met.descent;
            var leading = this._defaultTextFormat.leading;
            var offsetX = MARGIN_PX + this._defaultTextFormat.leftMargin + this._defaultTextFormat.blockIndent;
            var offsetY = MARGIN_PX;

            var numOfPositions = linePositions.length;
            for( var i = 0; i < numOfPositions; i+=2 ) {
                // TODO lineOffset
                var lineStart = linePositions[i];
                var lineEnd = linePositions[i+1];

                if( lineStart < 0 ) {
                    // 空文字改行
                    continue;
                }
                var tmp = this.text.substring( lineStart, lineEnd+1 );

                offsetX = MARGIN_PX + this._defaultTextFormat.leftMargin + this._defaultTextFormat.blockIndent;// TODO いろいろ
                // indent
                if( i == 0 || ( linePositions[i-1] + 1 ) != lineStart ) offsetX += this._defaultTextFormat.indent;
                // align
                switch( this._defaultTextFormat.align ) {
                    case TextFormatAlign.LEFT: break;
                    case TextFormatAlign.CENTER: {
                        var lineWidth = canvas.measureText(tmp);
                        offsetX += ( drawingRect.width - offsetX - this._defaultTextFormat.rightMargin - lineWidth ) / 2;
                        break;
                    }
                    case TextFormatAlign.RIGHT: {
                        var lineWidth = canvas.measureText(tmp);
                        offsetX += ( drawingRect.width - offsetX - this._defaultTextFormat.rightMargin - lineWidth );
                        break;
                    }
                    case TextFormatAlign.JUSTIFY: break;
                }

                offsetY = /*MARGIN_PX + */i/2 * ( -ascent + (descent) + leading );
                canvas.fillText( offsetX, offsetY, tmp );
            }
        }


        /** 算出 */
        cls._calcText = function() {
            calcTextRequested = false;

            // 描画エリア算出
            //  影響されるproperty
            //  ・width, height
            //  ・autoSize
            //  ・leading
            //　・blockIndent
            //　・leftMargin
            //　・rightMargin
            //　・letterSpacing
            //　・size
            //  TODO ConcatnatedMatrixの考慮 Flash TextFieldの仕様とすり合わせ
            //  更新するproperty
            //  ・textRect;
            //  ・maxScrollH;
            //  ・maxScrollV;
            //  ・bottomScrollV;
            //  ・numOfLines;

            var matrix = this._getMatrix();//this._getConcatenatedMatrix();

            var linePositions = this._calcTextLinePositions();

            var canvas = this._bitmapProxy.getCanvas();
            canvas.setFontSize( this._defaultTextFormat.size * matrix._getScaleY() );// Flashの仕様
            canvas.setLetterSpacing( this._defaultTextFormat.letterSpacing );

            // TODO flash TextRectは各行のテキスト描画エリアのunionっぽい。要調整
            this._textRect = new Rectangle();
            // width
            if( this._wordWrap ) {
                // wordWrap時は変更なし
                this._textRect.width = this._naturalRect.width - ( MARGIN_PX*2 + this._defaultTextFormat.leftMargin + this._defaultTextFormat.blockIndent + this._defaultTextFormat.rightMargin );
            } else {
                var numOfPositions = linePositions.length;
                for( var i = 0; i < numOfPositions; i+=2 ) {
                    var lineStart = linePositions[i];
                    var lineEnd = linePositions[i+1];

                    if( lineStart < 0 ) {
                        // 空文字改行のみの場合
                        continue;
                    }
                    var tmp = this._text.substring( lineStart, lineEnd+1 );
                    var lineWidth = canvas.measureText( tmp );
                    if( this._textRect.width < lineWidth ) this._textRect.width = lineWidth;
                }
            }
            // height
            var met = canvas.getFontMetrics();
            var ascent = met.ascent;
            var descent = met.descent;
            var leading = this._defaultTextFormat.leading;
            var numOfLines = linePositions.length / 2;
            this._textRect.height = ( -ascent + (descent) ) * numOfLines + leading * (numOfLines-1);

        }

        /** [start,end,start,end...]形式 */
        cls._calcTextLinePositions = function(){

            // text ⇒ lines
            var working = this._text;
            var marks = [];
            marks.push(0);
            var it;

            //  \r
            it = 0;
            while( true ) {
                var found = working.indexOf( '\r', it );
                if( found == -1 ) break;
                var index = found;
                // \r\nの場合
                if( (index+1)<working.length && working.charAt(index+1) == '\n' ) {
                    marks.push( index-1 );//行の終端位置
                    marks.push( index+2 );//次行の開始位置
                } else {
                    marks.push( index-1 );//行の終端位置
                    marks.push( index+1 );//次行の開始位置
                }
                it = found+1;
            }
            //  \n
            it = 0;
            while( true ) {
                var found = working.indexOf( '\n', it );
                if( found == -1 ) break;
                var index = found;
                // \r\nを省く
                if( (index-1)>=0 && working.charAt(index-1) != '\r' ) {
                    marks.push( index-1 );//行の終端位置
                    marks.push( index+1 );//次行の開始位置
                }
                it = found+1;
            }
            marks.push( working.length-1 );
            //  ソート
            marks.sort( function(a,b){return a-b;} );

            //
            if( this._wordWrap != true ) return marks;


            // wordWrapによる改行処理 TODO 単語区切りの実装

            // 描画サイズ情報
            var matrix = this._getConcatenatedMatrix();
            var drawableRect = new Rectangle( MARGIN_PX,
                MARGIN_PX,
                -MARGIN_PX*2 + matrix._getScaleX() * this._naturalRect.width - this._defaultTextFormat.leftMargin - this._defaultTextFormat.blockIndent - this._defaultTextFormat.rightMargin,
                -MARGIN_PX*2 + matrix._getScaleY() * this._naturalRect.height );

            // キャンバス設定
            var canvas = this._bitmapProxy.getCanvas();
            canvas.setFontSize( this._defaultTextFormat.size * matrix._getScaleY() );// Flashの仕様
            canvas.setLetterSpacing( this._defaultTextFormat.letterSpacing );


            var workingMarks = marks.slice();
            var markIt = 0;
            while( markIt < workingMarks.length ) {

                var lineStart = workingMarks[markIt];markIt++;
                if( lineStart == -1 ) lineStart = 0;// -1の場合は最初の行が改行コードのみの場合。
                var lineEnd = workingMarks[markIt];
                if( markIt < workingMarks.length ) markIt++;
                var lineLength = lineEnd - lineStart + 1;
                var tmp = working.substring( lineStart, lineEnd+1 );
                var breakIndex = canvas.breakText( tmp, drawableRect.width - this._defaultTextFormat.indent );

                while( breakIndex < lineLength ) {
                    // 改行
                    marks.push( lineStart + breakIndex-1 );
                    marks.push( lineStart + breakIndex );

                    lineStart += breakIndex;
                    lineLength = lineEnd - lineStart + 1;
                    var tmp = working.substring( lineStart, lineEnd+1 );
                    breakIndex = canvas.breakText( tmp, drawableRect.width );

                    if( breakIndex == lineLength ) break;
                }
            }
            marks.sort( function(a,b){return a-b;} );

            return marks;
        }

        cls._createRenderingNode = function() {
            return new TextFieldRenderingNode();
        }

        cls.toString = function(){ return "[object TextField name=\""+this.name+"\"]" }

    } );


    var TextFieldRenderingNode = Class( RenderingNode, function( cls, parent ){

        cls.textureImageHandle;
        cls.textureId;

        cls.object;

        cls.constructor = function(){
            parent.constructor.call(this);
            this.object = new SubImageRenderingObject();
        };

        cls.visit = function( visitor ){

            if( this.textureImageHandle.isEmpty() ) return;

            RenderingNode.prototype.visit.call( this, visitor );


            if( !this.visible ) return;

            var object = this.object;

            object.textureHandle = this.textureImageHandle;
            object.textureId = this.textureId;
            object.blendMode = this.blendMode;
            object.colorTransform = this.concatenatedColorTransform;
            object.maskNode = this.mask;

            var info = this.textureImageHandle.getTextureImageInfo();
            var textureObject = TextureObject.getById( this.textureId );


            var matrix = this.concatenatedMatrix;

            var texW = textureObject.getWidth();
            var texH = textureObject.getHeight();

            var texRect = info.area;

            // 頂点座標, texture座標, 頂...
            points = [
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


            // tri2

            object.vertexes[12] = (points[1].x);
            object.vertexes[13] = ( points[1].y );
            object.vertexes[14] = (texRect.left / texW);
            object.vertexes[15] = (texRect.bottom / texH);

            object.vertexes[16] = (points[2].x);
            object.vertexes[17] = ( points[2].y );
            object.vertexes[18] = (texRect.right / texW);
            object.vertexes[19] = (texRect.top / texH);

            object.vertexes[20] = (points[3].x);
            object.vertexes[21] = ( points[3].y );
            object.vertexes[22] = (texRect.right / texW);
            object.vertexes[23] = (texRect.bottom / texH);


            visitor.renderingRequests.push( object );
        };
    } );


    return TextField;
});