// Requires: librerias
var express = require( 'express' );
var mongoose = require( 'mongoose' );
var bodyParser = require( 'body-parser' );


// Inicializar variables
var app = express();


// Body Parser
// parse application/x-www-form-urlencoded
app.use( bodyParser.urlencoded( { extended: false } ) );
// parse application/json
app.use( bodyParser.json() );


// Importar rutas
var appRoutes = require( './routes/app' );
var usuarioRoutes = require( './routes/usuario' );
var loginRoutes = require( './routes/login' );


// Conexión a la base de datos
mongoose.connection.openUri( 'mongodb://localhost:27017/hospitalDB', ( error, response ) => {

	if( error ) throw error; // si hay error de conexión mostramos el error y no hacemos más nada

	console.log( 'Base de datos conectada: \x1b[32m%s\x1b[0m', 'online' );

} );


// Rutas - middleware
app.use( '/usuario', usuarioRoutes );
app.use( '/login', loginRoutes );
app.use( '/', appRoutes );


// Escuchar peticiones
app.listen( 3000, () => {

	console.log( 'Express server corriendo en el puerto 3000: \x1b[32m%s\x1b[0m', 'online' );

} ); // escuchar en el puerto 3000