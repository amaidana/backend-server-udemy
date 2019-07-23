var jwt = require( 'jsonwebtoken' ); // libreria para crear tokens

var SEED = require( '../config/config' ).SEED; // imoportar el SEED para decifrar el token

// ===========================================
// verificar token
// ===========================================
exports.verificaToken = function( request, response, next ) {

	var token = request.query.token;

	jwt.verify( token, SEED, ( error, decoded ) => {

		if( error ) {

			return response.status( 401 ).json( { // status 401: No autorizado

				ok: false, 
				mensaje: 'Token incorrecto',
				errors: error

			} );

		}

		request.usuario = decoded.usuario;

		// continuar con el método que fué llamado
		next();

	} );

}


// ===============================================
// verificar que el usuario sea ADMIN_ROLE
// verificar que el usuario sea el mismo logueado
// ===============================================
exports.verificaRole = function( request, response, next ) {

	var usuario = request.usuario;
	var id = request.params.id;

  if( usuario.role === 'ADMIN_ROLE' || usuario._id === id ) {

		next();
		return;

  } else {

  	var msg = 'Debe tener permisos de administrador.';

		if( usuario._id !== id ) {

			var msg = 'Solo puede actualizar su usuario.';

		}

		return response.status( 401 ).json( { // status 401: No autorizado

			ok: false, 
			mensaje: 'Token incorrecto',
			errors: { message: msg }

		} );

  }

}