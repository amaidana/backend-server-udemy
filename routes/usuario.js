var express = require( 'express' );
var bcrypt = require( 'bcryptjs' );

var middlewareAuth = require( '../middlewares/auth' );

var app = express();

// Importar el modelo de usuario
var Usuario = require( '../models/usuario' );

// Obtener todos los usuarios
app.get( '/', ( Request, Response, Next ) => {

	// Quiero que solo traida los campos: nombre, email, img y role
	Usuario.find( {}, 'nombre email img role' ).exec( ( error, usuarios ) => {

		if( error ) {

			return Response.status( 500 ).json( { // 500: error interno del servidor (Internal Server Error)
				
				ok: false,
				mensaje: 'Error obteniendo usuarios',
				errors: error
			
			} );

		}

		Response.status( 200 ).json( { // 200: OK
			ok: true,
			usuarios: usuarios
		} );

	} );

} );


// Crear un usuario
app.post( '/', middlewareAuth.verificaToken, ( Request, Response ) => {

	// obtener la información que viene en el body
	var body = Request.body;

	var usuario = new Usuario( {

		nombre: body.nombre,
		email: body.email,
		password: bcrypt.hashSync( body.password, 10 ), 
		img: body.img,
		role:body.role

	} );

	// insertar la información
	usuario.save( ( error, usuarioGuardado ) => {

		if( error ) {

			return Response.status( 400 ).json( { // 400: Solicitud incorrecta (Bad Request)

				ok: false,
				mensaje: 'Error al crear usuario.',
				errors: error

			} );

		}

		Response.status( 201 ).json( { // 201: Creado (Created)

			ok: true,
			usuario: usuarioGuardado,
			usuarioToken: Request.usuario

		} );

	} );

} );


// Actualizar un usuario
app.put( '/:id', middlewareAuth.verificaToken, ( Request, Response ) => {

	var id = Request.params.id;

	// averiguar si el id existe
	Usuario.findById( id, ( error, usuarioEncontrado ) => {

		if( error ) {

			return Response.status( 500 ).json( { // 500: Error interno del servidor (Internal Server Error)

				ok: false,
				mensaje: 'Error al buscar usuario',
				errors: error

			} );

		}

		if( !usuarioEncontrado ) {

			return Response.status( 400 ).json( { // 400: Solicitud incorrecta (Bad Request)

				ok: false,
				mensaje: 'Error al actualizar usuario: no existe',
				errors: { message: 'No existe un usuario con ese ID' }

			} );

		}

		// obtener la información que viene en el body
		var body = Request.body;

		usuarioEncontrado.nombre = body.nombre;
		usuarioEncontrado.email = body.email;
		usuarioEncontrado.role = body.role;

		// Grabar la información
		usuarioEncontrado.save( ( error, usuarioActualizado ) => {

			if( error ) {

				return Response.status( 400 ).json( { // 400: Solicitud incorrecta (Bad Request)

					ok: false,
					mensaje: 'Error al actualizar usuario',
					errors: error

				} );

			}

			usuarioActualizado.password = ':)'

			Response.status( 200 ).json( { // 200: OK

				ok: true,
				usuario: usuarioActualizado

			} );

		} );

	} );

} )


// Eliminar un usuario
app.delete( '/:id', middlewareAuth.verificaToken, ( Request, Response ) => {

	var id = Request.params.id;

	Usuario.findByIdAndRemove( id, ( error, usuarioEliminado ) => {

		if( error ) {

			return Response.status( 500 ).json( { // 500: Error interno del servidor (Internal Server Error)

				ok: false,
				mensaje: 'Error al borrar usuario',
				errors: error

			} );

		}

		if( !usuarioEliminado ) {

			return Response.status( 400 ).json( { // 400: Solicitud incorrecta (Bad Request)

				ok: false,
				mensaje:  'El id de usuario no existe.',
				errors: { mensaje: 'El id de usuario no existe.' }				

			} );

		}

		Response.status( 200 ).json( { // 200: OK

			ok: true,
			usuario: usuarioEliminado

		} );


	} );

} );

module.exports = app;