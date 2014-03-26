__req.define([
    "lib/Class"
],function( Class ){

    var CanvasProxy = Class( Object, function( cls, parent ){

        cls.constructor = function( bitmapProxy ){
            parent.constructor.apply(this,arguments);

            this._bitmapProxy = bitmapProxy;

            // bitmap has canvas?
            if( this._bitmapProxy._imageElm ) {
                // Image => Canvas
                var image = this._bitmapProxy._imageElm;
                this._bitmapProxy._imageElm = null;
                var canvas = this._bitmapProxy._canvasElm = document.createElement("canvas");
                canvas.width = image.naturalWidth;
                canvas.height = image.naturalHeight;
                canvas.getContext("2d").drawImage(image,0,0);
            }

            this._ctx = this._bitmapProxy._canvasElm.getContext("2d");

            this._fontSize = 12;
            this._letterSpacing = 0;
        };

        cls._updateFont = function(){
            this._ctx.font = ""+this._fontSize+"px/18px sans-serif";//TODO fontFamily
            this._metrics = null;
        };


        // TODO
        cls.fillStyle = "#ffffff";

        cls.strokeStyle = "#000000";


        cls.setFillColor = function( fillColor ) {
            // rgba
            var components = [
                (fillColor >>> 16 & 0xff),
                (fillColor >>> 8 & 0xff),
                (fillColor >>> 0 & 0xff),
                (fillColor >>> 24 & 0xff) / 255
            ];

            this._ctx.fillStyle = "rgba(" + components.join(",") + ")";
        }

        cls.setStrokeColor = function( color ){
            // rgba
            var components = [
                (color >>> 16 & 0xff),
                (color >>> 8 & 0xff),
                (color >>> 0 & 0xff),
                (color >>> 24 & 0xff) / 255
            ];

            this._ctx.strokeStyle = "rgba(" + components.join(",") + ")";
        }
        cls.fillRect = function( x, y, width, height ) {
            this._ctx.fillRect( x,y,width,height );
        }
        cls.strokeRect = function( x, y, width, height ) {
            this._ctx.strokeRect( x,y,width,height );
        }

        /** */
        cls.getFontSize = function(){ return this._fontSize; };
        /** */
        cls.setFontSize = function( value ) {
            this._fontSize = value;
            this._updateFont();
        };
        /** */
        cls.getLetterSpacing = function() {
            return this._letterSpacing;
        }

        /** */
        cls.setLetterSpacing = function( value ) {
            this._letterSpacing = value;
        }


        cls.getFontMetrics = function() {
//            SkPaint::FontMetrics skMetrics;
//            fillPaint.getFontMetrics( &skMetrics );

            if(!this._metrics) this._metrics = this._ctx.getTextMetrics("Aあa　亜");

            var metrics = {};
            metrics.ascent = this._metrics.ascent;
            metrics.descent = this._metrics.descent;

            return metrics;
        }

        cls.fillText = function( offsetX, offsetY, text, maxWidth ) {
            this._ctx.textBaseline = "top";

            if( maxWidth ) this._ctx.fillText( text, offsetX, offsetY, maxWidth );
            else this._ctx.fillText( text, offsetX, offsetY );

            // TODO lineHeight, letterSpacing
//            SkPaint::FontMetrics met;
//            fillPaint.getFontMetrics( &met );
//            var it = 0;//text.begin();
//            var itNext = 0;//text.begin();
//            var lengthUTF8 = text.length;
//            for( var i = 0; i < lengthUTF8; i++ ) {
//                itNext++;
//
//                this._ctx.fillText( it, itNext - it, offsetX, offsetY-met.fAscent, fillPaint );
//                offsetX += fillPaint.measureText( it, itNext - it );
//                offsetX += letterSpacing;
//
//                it = itNext;
//            }

        }
        /** */
        cls.strokeText = function( offsetX, offsetY, text, maxWidth ) {
            // TODO
        }
        /** 文章の横幅を得る */
        cls.measureText = function( text ) {

            var result = this._ctx.measureText( text, text.length).width;
            var lengthUTF8 = text.length;
            if( lengthUTF8 > 0 )
                result += this._letterSpacing * (lengthUTF8-1);
            return result;
        }
        /** 指定幅に収まる文字数を返す 多分。 */
        cls.breakText = function( text, width ) {

            /*
             int lengthUTF8 = utf8::distance( text.begin(), text.end() );
             if( lengthUTF8 > 0 )
             width -= letterSpacing * (lengthUTF8-1);

             const char* tmp = text.c_str();
             int result = fillPaint.breakText( text.c_str(), text.size(), width );
             return result;
             */

            if( this._ctx.measureText( text).width <= width ) return text.length;

            // とりいそぎ・・・総当りでやる
            var it = 0;
            while( it < text.length ){
                var tmp = text.substring( 0, it );
                var test = this._ctx.measureText( tmp).width;
                if( test > width ) break;
                it++;
            }
            it--;

            var result = it;
            return result;
        }

        cls.clear = function(){
            this._ctx.clearRect(0,0,this._bitmapProxy.width(),this._bitmapProxy.height());
        };

    } );

    return CanvasProxy;
});


/**
 This library rewrites the Canvas2D "measureText" function
 so that it returns a more complete metrics object.

 Author: Mike "Pomax" Kamermans
 **/
(function(){
    var NAME = "FontMetrics Library"
    var VERSION = "1-2011.0927.1431";
    var debug = false;

    // if there is no getComputedStyle, this library won't work.
    if(!document.defaultView.getComputedStyle) {
        throw("ERROR: 'document.defaultView.getComputedStyle' not found. This library only works in browsers that can report computed CSS values.");
    }

    // store the old text metrics function on the Canvas2D prototype
    CanvasRenderingContext2D.prototype.measureTextWidth = CanvasRenderingContext2D.prototype.measureText;

    /**
     *  shortcut function for getting computed CSS values
     */
    var getCSSValue = function(element, property) {
        return document.defaultView.getComputedStyle(element,null).getPropertyValue(property);
    };

    // debug function
    var show = function(canvas, ctx, xstart, w, h, metrics)
    {
        document.body.appendChild(canvas);
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';

        ctx.beginPath();
        ctx.moveTo(xstart,0);
        ctx.lineTo(xstart,h);
        ctx.closePath();
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(xstart+metrics.bounds.maxx,0);
        ctx.lineTo(xstart+metrics.bounds.maxx,h);
        ctx.closePath();
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0,h/2-metrics.ascent);
        ctx.lineTo(w,h/2-metrics.ascent);
        ctx.closePath();
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0,h/2+metrics.descent);
        ctx.lineTo(w,h/2+metrics.descent);
        ctx.closePath();
        ctx.stroke();
    }

    /**
     * The new text metrics function
     */
//    CanvasRenderingContext2D.prototype.measureText = function(textstring) {
    CanvasRenderingContext2D.prototype.getTextMetrics = function(textstring) {
//            var metrics = this.measureTextWidth(textstring);
//        fontFamily = getCSSValue(this.canvas,"font-family"),
//            fontSize = getCSSValue(this.canvas,"font-size").replace("px","");
        var metrics = this.measureTextWidth(textstring);
        var canvas = document.createElement("canvas");
        var padding = 100;
        canvas.style.opacity = 1;
        canvas.style.font = this.font;
        var fontFamily = canvas.style.fontFamily;//getCSSValue(this.canvas,"font-family");
        var fontSize = canvas.style.fontSize.replace("px","");//getCSSValue(this.canvas,"font-size").replace("px","");
        canvas.width = metrics.width + padding;
        canvas.height = 3*fontSize;
        metrics.fontsize = fontSize;
        var ctx = canvas.getContext("2d");
        ctx.font = fontSize + "px " + fontFamily;

        // for text lead values, we meaure a multiline text container.
        var leadDiv = document.createElement("div");
        leadDiv.style.position = "absolute";
        leadDiv.style.opacity = 0;
        leadDiv.style.font = fontSize + "px " + fontFamily;
        leadDiv.innerHTML = textstring + "<br/>" + textstring;
        document.body.appendChild(leadDiv);

        var w = canvas.width,
            h = canvas.height,
            baseline = h/2;

        // Set all canvas pixeldata values to 255, with all the content
        // data being 0. This lets us scan for data[i] != 255.
        ctx.fillStyle = "white";
        ctx.fillRect(-1, -1, w+2, h+2);
        ctx.fillStyle = "black";
        ctx.fillText(textstring, padding/2, baseline);
        var pixelData = ctx.getImageData(0, 0, w, h).data;

        // canvas pixel data is w*4 by h*4, because R, G, B and A are separate,
        // consecutive values in the array, rather than stored as 32 bit ints.
        var i = 0,
            w4 = w * 4,
            len = pixelData.length;

        // Finding the ascent uses a normal, forward scanline
        while (++i < len && pixelData[i] === 255) {}
        var ascent = (i/w4)|0;

        // Finding the descent uses a reverse scanline
        i = len - 1;
        while (--i > 0 && pixelData[i] === 255) {}
        var descent = (i/w4)|0;

        // find the min-x coordinate
        for(i = 0; i<len && pixelData[i] === 255; ) {
            i += w4;
            if(i>=len) { i = (i-len) + 4; }}
        var minx = ((i%w4)/4) | 0;

        // find the max-x coordinate
        var step = 1;
        for(i = len-3; i>=0 && pixelData[i] === 255; ) {
            i -= w4;
            if(i<0) { i = (len - 3) - (step++)*4; }}
        var maxx = ((i%w4)/4) + 1 | 0;

        // set font metrics
        metrics.ascent = (ascent - baseline)//(baseline - ascent);
        metrics.descent = (descent - baseline);
        metrics.bounds = { minx: minx - (padding/2),
            maxx: maxx - (padding/2),
            miny: 0,
            maxy: descent-ascent };
        metrics.height = 1+(descent - ascent);

        // make some initial guess at the text leading (using the standard TeX ratio)
        metrics.leading = 1.2 * fontSize;

        // then we try to get the real value from the browser
        var leadDivHeight = getCSSValue(leadDiv,"height");
        leadDivHeight = leadDivHeight.replace("px","");
        if (leadDivHeight >= fontSize * 2) { metrics.leading = (leadDivHeight/2) | 0; }
        document.body.removeChild(leadDiv);

        // show the canvas and bounds if required
        if(debug){show(canvas, ctx, 50, w, h, metrics);}

        return metrics;
    };
}());