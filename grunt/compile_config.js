require.config({
    baseUrl: '../',
//    paths:{
//        Player:"./Player.js",
//        requireLib: './lib/require'
//    },
//    namespace:"__req"
});
require([ "Player" ],function( Player ) {
    //
    console.log("required");
});