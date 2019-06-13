// Requires: librerias
var express = require( 'express' );
var mongoose = require( 'mongoose' );

// Inicializar variables
var app = express();


// Conexión a la base de datos
mongoose.connection.openUri( 'mongodb://localhost:27017/hospitalDB', ( error, response ) => {

	if( error ) throw error; // si hay error de conexión mostramos el error y no hacemos más nada

	console.log( 'Base de datos conectada: \x1b[32m%s\x1b[0m', 'online' );

} );


// rutas
app.get( '/', ( Request, Response, next ) => {

	Response.status( 200 ).json( {

		ok: true,
		mensaje: 'Petición realizada correctamente'

	} ); 

} );


// Escuchar peticiones
app.listen( 3000, () => {

	console.log( 'Express server corriendo en el puerto 3000: \x1b[32m%s\x1b[0m', 'online' );

} ); // escuchar en el puerto 3000