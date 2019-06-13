// Requires: importación de librerias
var express = require( 'express' ); // libreria del servidor express
var bcrypt = require( 'bcryptjs' ); // libreria para hacer encriptaciones
var jwt = require( 'jsonwebtoken' ); // libreria para crear tokens

var SEED = require( '../config/config' ).SEED; // imoportar el SEED para generar el token


// Inicializar variables
var app = express();


// Importar el modelo de usuario
var Usuario = require( '../models/usuario' );


app.post( '/', ( request, response ) => {

	var body = request.body; // solo funciona con el body-parser

	// averiguar si existe un usuario con el email
	Usuario.findOne( { email: body.email }, ( error, usuarioEncontrado ) => {

		if( error ) {

			return response.status( 500 ).json( { // status 500: Error interno del servidor

				ok: false, 
				mensaje: 'Error al obtener usuario.',
				errors: error

			} );

		}

		if( !usuarioEncontrado ) {

			return response.status( 400 ).json( { // status 400: Solicitus incorrecta

				ok: false, 
				mensaje: 'Credenciales incorrectas - email.',
				errors: error

			} );

		}

		// si la contraseña ingresada es distinta a la almacenada en la BD
		if( !bcrypt.compareSync( body.password, usuarioEncontrado.password ) ) {

			return response.status( 400 ).json( { // status 400: Solicitus incorrecta

				ok: false, 
				mensaje: 'Credenciales incorrectas - password.',
				errors: error

			} );

		}

		usuarioEncontrado.password = ':)';

		// Crear un token que expira en 4 hs
		var token = jwt.sign( { usuario: usuarioEncontrado }, SEED, { expiresIn: 14400 } );

		response.status( 200 ).json( { // status 200: ok

			ok: true,
			usuario: usuarioEncontrado,
			token: token,
			id: usuarioEncontrado._id

		} );

	} );

} );


module.exports = app;