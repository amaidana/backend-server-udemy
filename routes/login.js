// Requires: librerias
var express = require( 'express' );
var bcrypt = require( 'bcryptjs' );
var jwt = require( 'jsonwebtoken' );

var SEED = require( '../config/config' ).SEED;

// Inicializar variables
var app = express();

// Importar el modelo de usuario
var Usuario = require( '../models/usuario' );

app.post( '/', ( Request, Response ) => {

	// obtener la información que viene en el body
	var body = Request.body;

	// Averiguar si existe un usuario con el email
	Usuario.findOne( { email: body.email }, ( error, usuarioEncontrado ) => {

		if( error ) {

			return Response.status( 500 ).json( { // 500: Error interno del servidor (Internal Server Error)

				ok: false,
				mensaje: 'Error al buscar el usuario',
				errors: error

			} );

		}

		if( !usuarioEncontrado ) {

			return Response.status( 400 ).json( { // 400: Solicitud incorrecta (Bad Request)

				ok: false, 
				mensaje: 'Credenciales incorrectas - email',
				errors: { mensaje: 'Credenciales incorrectas - email' }

			} );

		}

		// Comparar las contraseñas encriptadas
		if( !bcrypt.compareSync( body.password, usuarioEncontrado.password ) ) {

			return Response.status( 400 ).json( { // 400: Solicitud incorrecta (Bad Request)

				ok: false,
				mensaje: 'Credenciales incorrectas - password',
				errors: { mensaje: 'Credenciales incorrectas - password' }

			} );

		}

		usuarioEncontrado.password = ':)';
		// Crear token
		var token = jwt.sign( { usuario: usuarioEncontrado }, SEED, { expiresIn: 14400 } ); // expira en 4hs

		Response.status( 200 ).json( { // 200: OK

			ok: true,
			usuario: usuarioEncontrado,
			token: token,
			id: usuarioEncontrado._id

		} );

	} );

} );

module.exports = app;