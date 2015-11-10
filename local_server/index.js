var connect = require('connect');
var serveStatic = require('serve-static');

var port = 8000;
var domain = "./";
connect().use( serveStatic( __dirname +"/../"+ domain ) ).listen(port);
console.log('Server has started at http://localhost:' + port);