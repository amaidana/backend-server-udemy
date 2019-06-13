// Requires: importación de librerias
var express = require( 'express' ); // libreria del servidor express
var mongoose = require( 'mongoose' ); // libreria para conectar con BD de mongo
var bodyParser = require( 'body-parser' ); // libreria para obtner los body de los requests


// Inicializar variables
var app = express(); // inicializar servidor express


// Configurar Body-Parser
app.use( bodyParser.urlencoded( { extended: false } ) ); // Parse application/x-www-form-urlencoded
app.use( bodyParser.json() ); // Parse application/json


// Importar rutas
var appRoutes = require( './routes/app' );
var usuarioRoutes = require( './routes/usuario' );
var hospitalRoutes = require( './routes/hospital' );
var medicoRoutes = require( './routes/medico' );
var busquedaRoutes = require( './routes/busqueda' );
var uploadRoutes = require( './routes/upload' );
var imgRoutes = require( './routes/imagenes' );
var loginRoutes = require( './routes/login' );


// Conectar con la BD de mongo
mongoose.connection.openUri( 'mongodb://localhost:27017/hospitalDB', ( error, response ) => {

	if( error ) throw error;

	console.log( 'Base de datos: \x1b[36m%s\x1b[0m', 'online' );

} );


// ============================================================
// Server index config 
// Para visualizar el path de imagenes: localhost:3000/uploads
// npm install serve-index --save
// ============================================================
/*
var serveIndex = require( 'serve-index' );
app.use( express.static( __dirname + '/' ) );
app.use( '/uploads', serveIndex( __dirname + '/uploads' ) );
*/


// Rutas
app.use( '/usuario', usuarioRoutes );
app.use( '/hospital', hospitalRoutes );
app.use( '/medico', medicoRoutes );
app.use( '/busqueda', busquedaRoutes );
app.use( '/upload', uploadRoutes );
app.use( '/img', imgRoutes );
app.use( '/login', loginRoutes );

app.use( '/', appRoutes );


// Escuchar peticiones
app.listen( 3000, () => {

	console.log( 'Express server puerto 3000: \x1b[36m%s\x1b[0m', 'online' );

} ); // poner a express a escuchar las peticiones del puerto 3000