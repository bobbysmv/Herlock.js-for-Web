new Script( "./lib/require.min.js" ).onload = function() {
    require( [ "src/Application" ], function( Application ){
        new Application().start();
    } );
};