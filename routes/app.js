var express = require( 'express' );

var app = express();

app.get( '/', ( Request, Response, next ) => {

	Response.status( 200 ).json( {

		ok: true,
		mensaje: 'Petición realizada correctamente'

	} ); 

} );

module.exports = app;