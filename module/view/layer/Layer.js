define([
    "lib/Class",
    "module/view/gl/IRenderable",
    "module/view/gl/Viewport",
    "module/view/touch/TouchEventInfo"
],function( Class, IRenderable, Viewport, TouchEventInfo ){

    var Layer = Class( Object, function( cls, parent ){

        cls.constructor = function( content ){
            parent.constructor.apply(this,arguments);

            this._content = null;

            this._renderingObject = new RenderingObject;
            this._calcRequested = true;

            this._horizontalAlign = Layer.Align.CENTER;
            this._verticalAlign = Layer.Align.MIDDLE;
            this._scaleMode = Layer.ScaleMode.SHOW_ALL;
            this._colorTransform = new ColorTransform();
            this._backgroundColor = 0xFFFFFF;
            this._backgroundAlpha = 0;
            this._offsetPercentX = 0;
            this._offsetPercentY = 0;
            this._module = null;

            /** 座標変換情報 */
            this._matrix = new Matrix();

            /** contentの座標変換情報 */
            this._contentMatrix = new Matrix();

            /** calculate レイヤー内 コンテンツ描画エリア */
            this._contentDisplayRect = new Rectangle();

            //
            if(content)
                this.content = content;
        };

        cls.content = { get: function(){ return this._content; }, set: function( value ){
            if( this._content != null ) {
                this._content._onRemovedFrom( this );
            }
            this._calcRequested = true;

            this._content = value;
            if( value == null ) {
                //contentHandle.clear();
            } else {
                this._content._onAddedTo( this );
            }
        } };
        cls.contentScaleX = { get: function(){ return this._getContentMatrix()._getScaleX(); } };
        cls.contentScaleY = { get: function(){ return this._getContentMatrix()._getScaleY(); } };
        cls.horizontalAlign = { get: function(){ return this._horizontalAlign; }, set: function( value ){
            this._horizontalAlign = value;/*TODO check*/
            this._calcRequested = true;
        } };
        cls.verticalAlign = { get: function(){ return this._verticalAlign }, set: function( value ){
            this._verticalAlign = value;/*TODO check*/
            this._calcRequested = true;
        } };
        cls.scaleMode = { get: function(){ return this._scaleMode; }, set: function( mode ){
            this._scaleMode = mode;
            this._calcRequested = true;
        } };
        cls.offsetX = { get: function(){ return this._offsetPercentX; }, set: function( value ){
            this._offsetPercentX = value;
            this._calcRequested = true;
        } };
        cls.offsetY = { get: function(){ return this._offsetPercentY; }, set: function( value ){
            this._offsetPercentY = value;
            this._calcRequested = true;
        } };
        cls.alpha = { get: function(){ return this._colorTransform.getAlphaMultiplier(); }, set: function(value){
            this._colorTransform.getAlphaMultiplier(value);
        } };
        cls.backgroundColor = { get: function(){ return this._backgroundColor; }, set: function(color){
            this._backgroundColor = color;
        } };
        cls.backgroundAlpha = { get: function(){ return this._backgroundAlpha; }, set: function(value){
            this._backgroundAlpha = value;
        } };


        // internal
        /** MainThread 描画の通知 */
        cls._notifyDrawFrame = function(){
            if(this._content) this._content._notifyDrawFrame();
        };

        /** windowへ追加時にはしる接続処理 */
        cls._addedTo = function( module ) { this._module = module; calcRequested = true; }

        /** windowから削除時にはしる接続処理 */
        cls._removedFrom = function( module ) { this._module = null; }

        /** Viewサイズ更新を通知 画面回転等 */
        cls._notifyResizeView = function( viewWidth, viewHeight ) {
            if( this._content != null ) this._content._notifyResizeView( viewWidth, viewHeight );
            this._calcRequested = true;
        }

        /** Contentサイズ更新を通知 コンテンツのリサイズ時 */
        cls._notifyResizeContent = function() { this._calcRequested = true; };

        /** main thread タッチ情報を発信 */
        cls._notifyTouch = function( info ){
            if( !this._content ) return;

//            TouchEvent* event = TouchEvent::New( getJSContext() );
//            event->setTouchEventInfo( info );
//            this._content._dispatchTouchEvent( event );

            this._content._dispatchTouchEvent( info );
        };



        cls._calculate = function () {

            if( this._module == null ) return;
            if( this._content == null ) return;

            this._calcRequested = false;

            var layerWidth = this._module.getViewWidth();
            var layerHeight = this._module.getViewHeight();
            var layerAspectRatio = layerWidth / layerHeight;

            var contentWidth = this._content._getContentWidth();
            var contentHeight = this._content._getContentHeight();
            var contentAspectRatio = contentWidth / contentHeight;

            // scale
            if( this._scaleMode == Layer.ScaleMode.EXACT_FIT ) {
                // アスペクト比無視で画面いっぱいに表示
                this._contentMatrix._setScaleX( layerWidth / contentWidth );
                this._contentMatrix._setScaleY( layerHeight / contentHeight );

            } else if( this._scaleMode == Layer.ScaleMode.SHOW_ALL ) {
                // 画面内に収まるように
                var scale;
                if( layerAspectRatio < contentAspectRatio )
                    scale = layerWidth / contentWidth;// 水平幅をあわせる
                else
                    scale = layerHeight / contentHeight;// 垂直幅をあわせる
                this._contentMatrix._setScaleX( scale );
                this._contentMatrix._setScaleY( scale );

            } else if( this._scaleMode == Layer.ScaleMode.NO_BORDER ) {
                // 画面いっぱい使いはみ出してでもコンテンツを大きく表示
                var scale;
                if( layerAspectRatio > contentAspectRatio )
                    scale = layerWidth / contentWidth;// 水平幅をあわせる
                else
                    scale = layerHeight / contentHeight;// 垂直幅をあわせる
                this._contentMatrix._setScaleX( scale );
                this._contentMatrix._setScaleY( scale );

            } else if ( this._scaleMode == Layer.ScaleMode.NO_SCALE ) {
                // 拡大縮小しない
                this._contentMatrix._setScaleX( 1 );
                this._contentMatrix._setScaleY( 1 );

            }

            // layer offset
            this._matrix._setX( layerWidth * this._offsetPercentX );
            this._matrix._setY( layerHeight * this._offsetPercentY );

            // contentDisplayRect
            this._contentDisplayRect.width = this._content._getContentWidth() * this._contentMatrix._getScaleX();
            this._contentDisplayRect.height = this._content._getContentHeight() * this._contentMatrix._getScaleY();
            this._contentDisplayRect.x = this._matrix._getX();
            this._contentDisplayRect.y = this._matrix._getY();

            var alignOffsetX = 0, alighOffsetY = 0;
            //  align horizontal
            if( this._horizontalAlign == Layer.Align.LEFT )       alignOffsetX += 0;
            else if( this._horizontalAlign == Layer.Align.CENTER )alignOffsetX += 0.5 * ( layerWidth - this._contentDisplayRect.width );
            else if( this._horizontalAlign == Layer.Align.RIGHT ) alignOffsetX += 1.0 * ( layerWidth - this._contentDisplayRect.width );
            //  align vertical
            if( this._verticalAlign == Layer.Align.TOP )          alighOffsetY += 0;
            else if( this._verticalAlign == Layer.Align.MIDDLE )  alighOffsetY += 0.5 * ( layerHeight - this._contentDisplayRect.height );
            else if( this._verticalAlign == Layer.Align.BOTTOM )  alighOffsetY += 1.0 * ( layerHeight - this._contentDisplayRect.height );
            this._contentDisplayRect.x += alignOffsetX;
            this._contentDisplayRect.y += alighOffsetY;

            // offset
            this._contentMatrix._setX( alignOffsetX );
            this._contentMatrix._setY( alighOffsetY );
        }

        /** calculate 座標変換情報 */
        cls._getMatrix = function() {
            if( this._calcRequested ) this._calculate();
            return this._matrix.clone();
        };

        /** calculate コンテンツ座標変換情報 */
        cls._getContentMatrix = function() {
            if( this._calcRequested ) this._calculate();
            return this._contentMatrix.clone();
        }

        /** calculate レイヤー内 コンテンツ描画エリア */
        cls._getContentDisplayRect = function() {
            if( this._calcRequested ) this._calculate();
            return this._contentDisplayRect;
        }


        cls._glPrepare = function(){
            // filter
            if( this._module == null ) return null;
            if( this._content == null ) return null;

            // set viewport  TODO LayerのオフセットをViewportで処理するかMatrixで処理するか
            this._renderingObject.viewport = new Viewport( 0,0, this._module.getViewWidth(), this._module.getViewHeight() );
            var vb = Viewport.BindScope ( this._renderingObject.viewport );

            // render content
            var empty = new Matrix ();
            this._renderingObject.contentRenderingObject = this._content._glPrepare( empty, this._colorTransform );

            vb.unbind();

            return this._renderingObject;
        };

    } );
    Layer.Align = {
        TOP:"top", MIDDLE:"middle", BOTTOM:"bottom",
        LEFT:"left", CENTER:"center", RIGHT: "right", NONE: "none"
    };
    Layer.ScaleMode = {
        /** 指定された領域内にアプリケーション全体が、元の縦横比を維持しないで表示されるよう指定します。*/
        EXACT_FIT: "exactFit",
        /** 指定された領域いっぱいにアプリケーション全体が歪まずに表示されるように指定します。ただし、アプリケーションの元の縦横比を保つために、ある程度トリミングされることがあります。*/
        NO_BORDER: "noBorder",
        /** アプリケーションのサイズが固定され、Flash Player のウィンドウのサイズが変更された場合でも、サイズが維持されるように指定します。*/
        NO_SCALE: "noScale",
        /** 指定された領域内にアプリケーション全体が、アプリケーションの元の縦横比を維持したまま、歪まずに表示されるよう指定します。*/
        SHOW_ALL: "showAll",
        /** */
        MODE_NONE: "none"
    };


    var RenderingObject = Class( IRenderable, function(cls, parent) {

        cls.constructor = function () {
            parent.constructor.apply(this,arguments);
        };

        cls.viewport = null;
        cls.contentRenderingObject = null;

        cls.processData = function(){
            if( !this.contentRenderingObject ) return;

            var vb = Viewport.BindScope( this.viewport );

            this.contentRenderingObject.processData();
            vb.unbind();
        };

        cls.renderOffscreen = function(){};

        cls.render = function(){
            if( !this.contentRenderingObject ) return;

            var vb = Viewport.BindScope( this.viewport );

            // render content
            this.contentRenderingObject.render();

            vb.unbind();
        };


    });

    return Layer;
});