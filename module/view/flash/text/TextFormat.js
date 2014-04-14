define([
    "lib/Class"
],function( Class ){

    var TextFormat = Class( Object, function( cls, parent ){

        /**
         *
         * @param font
         * @param size
         * @param color
         * @param bold
         * @param italic
         * @param underline
         * @param url
         * @param target
         * @param align
         * @param leftMargin
         * @param rightMargin
         * @param indent
         * @param leading
         */
        cls.constructor = function( font, size, color, bold, italic, underline, url, target, align, leftMargin, rightMargin, indent, leading ){
            parent.constructor.apply(this,arguments);
            var argCount = arguments.length;

            //font:String = null
            if( argCount >= 1 ) this.font = font;
            //size:Object = null
            if( argCount >= 2 ) this.size = size;
            //color:Object = null
            if( argCount >= 3 ) this.color = color;
            //bold:Object = null
            if( argCount >= 4 ) this.bold = bold;
            //italic:Object = null
            if( argCount >= 5 ) this.italic = italic;
            //underline:Object = null
            if( argCount >= 6 ) this.underline = underline;
            //url:String = null
            if( argCount >= 7 ) this.url = url;//TODO
            //target:String = null
            if( argCount >= 8 ) this.target = target;//TODO
            //align:String = null
            if( argCount >= 9 ) this.align = align;
            //leftMargin:Object = null
            if( argCount >= 10 ) this.leftMargin = leftMargin;
            //rightMargin:Object = null
            if( argCount >= 11 ) this.rightMargin = rightMargin;
            //indent:Object = null
            if( argCount >= 12 ) this.indent = indent;
            //leading:Object = null
            if( argCount >= 13 ) this.leading = leading;
        };

        cls.align = "left";//TextFormatAlign.LEFT;
        cls.blockIndent = 0;
        cls.bold = false;
//        bullet = false;
        cls.color = 0x000000;
        cls.font = "";
        cls.indent = 0;
        cls.italic = false;
        cls.kerning = false;
        cls.leading = 0;
        cls.leftMargin = 0;
        cls.letterSpacing = 0;
        cls.rightMargin = 0;
        cls.size = 12.0;
//        tabStops;
//        target = "";
        cls.underline = false;
//        url = "";

//        cls.align = null;
//        cls.blockIndent = null;
//        cls.bold = null;
//        //cls.bullet", bullet_getter, bullet_setter );
//        cls.color = null;
//        cls.font = null;
//        cls.indent = null;
//        cls.italic = null;
//        cls.kerning = null;
//        cls.leading = null;
//        cls.leftMargin = null;
//        cls.letterSpacing = null;
//        cls.rightMargin = null;
//        cls.size = null;
//        //cls.tabStops", tabStops_getter, tabStops_setter );
//        //cls.target", target_getter, target_setter );
//        cls.underline = null;
//        //cls.url", url_getter, url_setter );

        // function
        cls.toString = function(){ return "[object TextFormat]" };

    } );

    return TextFormat;
});