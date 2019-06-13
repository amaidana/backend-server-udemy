// Requires: importación de librerias
var express = require( 'express' ); // libreria del servidor express


// Inicializar variables
var app = express(); // inicializar servidor express


app.get( '/', ( request, response ) => {

	// enviar respuesta
	response.status( '200' ).json( { // status 200: OK

		ok: true,
		mensaje: 'Petición realizada correctamente'

	} );

} );

module.exports = app;