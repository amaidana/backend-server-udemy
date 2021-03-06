// Requires: importación de librerias
var express = require( 'express' ); // libreria del servidor express
var bcrypt = require( 'bcryptjs' ); // libreria para hacer encriptaciones
var jwt = require( 'jsonwebtoken' ); // libreria para crear tokens

var SEED = require( '../config/config' ).SEED; // imoportar el SEED para generar el token


// Inicializar variables
var app = express();


// Importar el modelo de usuario
var Usuario = require( '../models/usuario' );


// Configuración para hacer SingIn de Goole
var CLIENT_ID = require( '../config/config' ).CLIENT_ID;
const { OAuth2Client } = require( 'google-auth-library' );
const client = new OAuth2Client( CLIENT_ID );

var middlewareAuth = require( '../middlewares/auth' ); // middleware de autentiación

// =============================================
// Renovar token
// =============================================
app.get( '/renovarToken', middlewareAuth.verificaToken, ( request, response ) => {

	// crear un token que expira en 4hs
	var token = jwt.sign( { usuario: request.usuario }, SEED, { expiresIn: 14400 } );

	response.status( 200 ).json( {

		ok: true, 
		token: token

	} );

} );


// =============================================
// Autenticación de Google
// =============================================
async function verify( token ) {
  
  const ticket = await client.verifyIdToken( {
      idToken: token,
      audience: CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
      // Or, if multiple clients access the backend:
      //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
  } );

  const payload = ticket.getPayload();
  //const userid = payload['sub'];
  // If request specified a G Suite domain:
  //const domain = payload['hd'];

  return {
  	nombre: payload.name,
  	email: payload.email,
  	img: payload.picture,
  	google: true,
  	//payload: payload
  };

}

app.post( '/google', async ( request, response ) => { // para poder usar el await debe estar dentro de un async

	var token = request.body.token || '';

	var googleUser;

	try {

		googleUser = await verify( token ); // llamar a la promesa verify

	} catch( error ) {

		return response.status( 403 ).json( { // status 403: Prohibido

			ok: false, 
			mensaje: 'Token no válido.',
			errors: error

		} );

	}

	/*
	var googleUser = await verify( token ) // llamar a la promesa verify
		.catch( ( error ) => {

			return response.status( 403 ).json( { // status 403: Prohibido

				ok: false,
				mensaje: 'Token no válido.',
				errors: error

			} );

		} );
	*/

	// verificar si el correo ya está almacenado en la BD
	Usuario.findOne( { email: googleUser.email }, ( error, usuarioEncontrado ) => {

		if( error ) {

			return response.status( 500 ).json( { // status 500: Error interno del servidor

				ok: false,
				mensaje: 'Error al obtener usuario.',
				errors: error

			} );

		}

		if( usuarioEncontrado ) { // el usuario ya existe en la bd

			// comprobar si el usuario se registró por google o no
			if( usuarioEncontrado.google === false ) { // no fue registrado por google => no puede ingresar mediante google

				return response.status( 400 ).json( { // status 400: Solicitud incorrecta

					ok: false, 
					mensaje: 'No puede autenticarse mediante Google SingIn.',
					errors: { mensaje: 'Debe autenticarse por el formulario de LogIn.' }

				} );

			} else { // fué registrado por google

				// crear un token que expira en 4hs
				var token = jwt.sign( { usuario: usuarioEncontrado }, SEED, { expiresIn: 14400 } );

				response.status( 200 ).json( { // status 200: ok

					ok: true, 
					usuario: usuarioEncontrado,
					token: token,
					id: usuarioEncontrado._id,
					menu: obtenerMenu( usuarioEncontrado.role )

				} );

			}

		} else { // el usuario no existe en la bd

			// crear nuevo usuario
			var usuario = new Usuario();

			usuario.nombre = googleUser.nombre;
			usuario.email = googleUser.email;
			usuario.img = googleUser.img;
			usuario.google = true;
			usuario.password = ':)';

			usuario.save( ( error, usuarioCreado ) => {

				if( error ) {

					return response.status( 500 ).json( { // status 500: Error interno del servidor

						ok: false,
						mensaje: 'Error al crear usuario.',
						errors: error

					} );

				}

				// Crear un token que expira en 4 hs
				var token = jwt.sign( { usuario: usuarioCreado }, SEED, { expiresIn: 14400 } );
				
				response.status( 200 ).json( { // status 200: Ok

					ok: true,
					usuario: usuarioCreado,
					token: token,
					id: usuarioCreado._id,
					menu: obtenerMenu( usuarioCreado.role )

				} );

			} );

		}

	} );

} );


// =============================================
// Autenticación normal
// =============================================
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
				mensaje: 'Credenciales incorrectas (99).',
				errors: error

			} );

		}

		// si la contraseña ingresada es distinta a la almacenada en la BD
		if( !bcrypt.compareSync( body.password, usuarioEncontrado.password ) ) {

			return response.status( 400 ).json( { // status 400: Solicitus incorrecta

				ok: false, 
				mensaje: 'Credenciales incorrectas (98).',
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
			id: usuarioEncontrado._id,
			menu: obtenerMenu( usuarioEncontrado.role )

		} );

	} );

} );


function obtenerMenu( role ) {

	var menu = [
		{
			titulo: 'Principal',
			icono: 'mdi mdi-gauge',
			submenu: [
				{ titulo: 'Dashboard', url: '/dashboard' },
				{ titulo: 'ProgressBar', url: '/progress' },
				{ titulo: 'Gráficas', url: '/graficas1' },
				{ titulo: 'Promesas', url: '/promesas' },
				{ titulo: 'Rxjs', url: '/rxjs' }
			]
		},
		{
			titulo: 'Mantenimientos',
			icono: 'mdi mdi-folder-lock-open',
			submenu: [
				//{ titulo: 'Usuarios', url: '/usuarios' },
				{ titulo: 'Medicos', url: '/medicos' },
				{ titulo: 'Hospitales', url: '/hospitales' }
			]
		}
	];

	if( role === 'ADMIN_ROLE' ) {

		// agregar al principio del array menu[1].submenu
		menu[1].submenu.unshift( { titulo: 'Usuarios', url: '/usuarios' } );

	}

	return menu;

}


module.exports = app;