var jwt = require( 'jsonwebtoken' );

var SEED = require( '../config/config' ).SEED;

// Verificar token
exports.verificaToken = function( Request, Response, Next ) {

	var token = Request.query.token;

	jwt.verify( token, SEED, ( error, decoded ) => {

		if( error ) {

			return Response.status( 401 ).json( { // 401: No autorizado (Unauthorize)

				ok: false,
				mensaje: 'Token incorrecto',
				errors: error

			} );

		}

		Request.usuario = decoded.usuario;

		// para indicar que tiene que continuar sobre la ruta que se llamo
		Next();

	} );

}