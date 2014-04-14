define([
    "lib/Class",
    "module/NJModule",
    "module/script/object/ScriptObject"
],function( Class, NJModule, ScriptObject ){

    var NJScript = Class( NJModule, function( cls, parent ){

        cls.constructor = function(){
            parent.constructor.apply(this,arguments);
        };

        cls.getName = function(){ return "Script"; };


        cls.installTo = function( ctx ) {
//            nativeInstallTo(getNativePtr(), ctx.getNativePtr());


        }


        cls.initJs = function( ctx ) {
//            nativeInitJs(getNativePtr(), ctx.getNativePtr());

            ctx.Script = ScriptObject;

        }

        cls.start = function() {
            parent.start.call( this );
//            HttpLoaderManager.initialize( ctx, njs.getHandler() );
//            DataURIManager.initialize( ctx, njs.getHandler() );
        }

        cls.reset = function() {
//            nativeReset(getNativePtr());
        }



    } );

    return NJScript;
});