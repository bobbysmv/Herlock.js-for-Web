define([

],function(  ){

    var GLUtil = {
        getInfo: function(){
            if( !this._info ) this._info = new Information();
            return this._info;
        },

        checkGlError: function ( op ) {
            for (var error = gl.getError(); error; error = gl.getError() ) {
                console.error( "ndk_gl after " + op + "() glError" );
                console.error( "ndk_gl       error:" + error );
            }
        }
    };


    function Information() {
        checkGlError("- before");
        this._maxTextureSize = gl.getParameter( gl.MAX_TEXTURE_SIZE); checkGlError("a getParameter");
        this._maxVertexAttribs = gl.getParameter( gl.MAX_VERTEX_ATTRIBS ); checkGlError("b getParameter");
        this._maxVertexUniformVectors = gl.getParameter( gl.MAX_VERTEX_UNIFORM_VECTORS ); checkGlError("c getParameter");
        this._maxFragmentUniformVectors = gl.getParameter( gl.MAX_FRAGMENT_UNIFORM_VECTORS ); checkGlError("d getParameter");
        this._maxVaryingVectors = gl.getParameter( gl.MAX_VARYING_VECTORS ); checkGlError("e getParameter");
        this._maxVertexTextureImageUnits = gl.getParameter( gl.MAX_VARYING_VECTORS ); checkGlError("f getParameter");
        this._maxTextureImageUnits = gl.getParameter( gl.MAX_TEXTURE_IMAGE_UNITS ); checkGlError("g getParameter");
        this._maxRenderBufferSize = gl.getParameter( gl.MAX_RENDERBUFFER_SIZE ); checkGlError("h getParameter");
        this._shaderVersion = gl.getParameter( gl.SHADING_LANGUAGE_VERSION ); checkGlError("i getParameter");
        this._vendor = gl.getParameter( gl.VENDOR ); checkGlError("j getParameter");
        this._renderer = gl.getParameter( gl.RENDERER ); checkGlError("k getParameter");
        this._version = gl.getParameter( gl.VERSION ); checkGlError("l getParameter");
//        this._extensions = gl.getParameter( gl.EXTENSIONS ); checkGlError("m getParameter");
    };
    Information.prototype = Object.create({},{
        maxTextureSize: {get: function(){ return this._maxTextureSize;}},
        maxVertexAttribs: {get: function(){ return this._maxVertexAttribs;}},
        maxVertexUniformVectors: {get: function(){ return this._maxVertexUniformVectors;}},
        maxFragmentUniformVectors: {get: function(){ return this._maxFragmentUniformVectors;}},
        maxVaryingVectors: {get: function(){ return this._maxVaryingVectors;}},
        maxVertexTextureImageUnits: {get: function(){ return this._maxVertexTextureImageUnits;}},
        maxTextureImageUnits: {get: function(){ return this._maxTextureImageUnits;}},
        maxRenderBufferSize: {get: function(){ return this._maxRenderBufferSize;}},
        shaderVersion: {get: function(){ return this._shaderVersion;}},
        vendor: {get: function(){ return this._vendor;}},
        renderer: {get: function(){ return this._renderer;}},
        version: {get: function(){ return this._version;}},

        getOptimumTextureSize: {value: function(){
            if( this.maxTextureSize >= 4096 ) return 4096/2;
//    if( maxTextureSize >= 2048 ) return 2048/2;//TEST
            return this.maxTextureSize;
        }}
    });


    return GLUtil;
});