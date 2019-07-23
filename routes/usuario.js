// Requires: importación de librerias
var express = require( 'express' ); // libreria del servidor express
var bcrypt = require( 'bcryptjs' ); // libreria para hacer encriptaciones

var middlewareAuth = require( '../middlewares/auth' ); // middleware de autenticación

// Inicializar variables
var app = express(); // inicializar servidor express


// Importar el modelo de usuario
var Usuario = require( '../models/usuario' );


// ===========================================
// obtener usuarios
// ===========================================
app.get( '/', ( request, response ) => {

	var desde = request.query.desde || 0;
			desde = Number( desde );

	Usuario.find( {}, 'nombre email img role google' )
		.skip( desde ) // desde que número de registro empezar
		.limit( 5 ) // 5 registros por página
		.exec( ( error, usuarios ) => {

			if( error ) {

				// enviar respuesta
				return response.status( 500 ).json( { // status 500: Error interno del servidor

					ok: false,
					mensaje: 'Error al obtener usuarios.',
					errors: error

				} );

			}

			Usuario.countDocuments( {}, ( error, cantReg ) => {

				// enviar respuesta
				response.status( 200 ).json( { // status 200: OK

					ok: true,
					usuarios: usuarios,
					numRows: cantReg

				} );

			} );

		} );

} );


// ===========================================
// crear usuarios
// ===========================================
app.post( '/', ( request, response ) => {

	var body = request.body; // solo funciona con el body-parser

	var usuario = Usuario( {

		nombre: body.nombre,
		email: body.email,
		password: bcrypt.hashSync( body.password, 10 ),
		img: body.img,
		role: body.role

	} );

	usuario.save( ( error, usuarioCreado ) => {

		if( error ) {

			return response.status( 400 ).json( { // status 400: Solicitud incorrecta

				ok: false,
				mensaje: 'Error al crear nuevo usuario.',
				errors: error

			} );

		}

		// enviar respuesta
		response.status( 201 ).json( { // status 201: Recurso creado

			ok: true,
			usuario: usuarioCreado,
			usuarioToken: request.usuario

		} );

	} );

} );


// ===========================================
// actualizar usuarios
// ===========================================
app.put( '/:id', [ middlewareAuth.verificaToken, middlewareAuth.verificaRole ], ( request, response ) => {

	var id = request.params.id; // obtener el id que viene como parametro

	// averiguar si existe un usuario con el id
	Usuario.findById( id, ( error, usuarioEncontrado ) => {

		if( error ) {

			return response.status( 500 ).json( { // status 500: Error interno del servidor

				ok: false,
				mensaje: 'Error al obtener usuario para actualizar.',
				errors: error

			} );

		}

		if( !usuarioEncontrado ) {

			return response.status( 400 ).json( { // status 400: Solicitud incorrecta

				ok: false, 
				mensaje: 'Error al actualizar usuario.',
				errors: { message: 'No existe un usuario con el ID indicado.' }

			} );

		}

		var body = request.body;

		usuarioEncontrado.nombre = body.nombre;
		usuarioEncontrado.email = body.email;
		usuarioEncontrado.role = body.role;

		usuarioEncontrado.save( ( error, usuarioActualizado ) => {

			if( error ) {

				return response.status( 400 ).json( { // status 400: Solicitud incorrecta

					ok: false,
					mensaje: 'Error al actualizar usuario.',
					errors: error

				} );

			}

			usuarioActualizado.password = ':)';

			response.status( 200 ).json( { // status 200: ok

				ok: true,
				usuario: usuarioActualizado

			} );

		} );

	} );

} );


// ===========================================
// eliminar usuarios
// ===========================================
app.delete( '/:id', [ middlewareAuth.verificaToken, middlewareAuth.verificaRole ], ( request, response ) => {

	var id = request.params.id;

	Usuario.findByIdAndRemove( id, ( error, usuarioEliminado ) => {

		if( error ) {

			return response.status( 500 ).json( { // status 500: Error interno del servidor

				ok: false, 
				mensaje: 'Error al obtener usuario para eliminar.',
				errors: error

			} );

		}

		if( !usuarioEliminado ) {

			return response.status( 400 ).json( { // status 400: Solicitud incorrecta

				ok: false, 
				mensaje: 'Error al eliminar usuario.',
				errors: { message: 'No existe un usuario con el ID indicado.' }

			} );

		}

		response.status( 200 ).json( { // status 200: ok

			ok: true, 
			usuario: usuarioEliminado

		} );

	} );

} );


module.exports = app;