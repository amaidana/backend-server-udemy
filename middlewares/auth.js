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
				mensaej: 'Token incorrecto',
				errorr: error

			} );

		}

		request.usuario = decoded.usuario;

		// continuar con el método que fué llamado
		next();

	} );

}