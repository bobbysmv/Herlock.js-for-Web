new Script( "./lib/require.min.js" ).onload = function() {
    require.config({ baseUrl: 'test/sample' });
    require( [ "src/Application" ], function( Application ){
        new Application().start();
    } );
};
