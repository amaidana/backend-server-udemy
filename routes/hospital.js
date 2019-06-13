// Requires: importación de librerias
var express = require( 'express' ); // libreria del servidor express

var middlewareAuth = require( '../middlewares/auth' ); // middleware de autentiación


// Inicializar variables
var app = express(); // Inicializar servidor express


// Importar el modelo de hospital
var Hospital = require( '../models/hospital' );


// ===========================================
// obtener hospitales
// ===========================================
app.get( '/', ( request, response ) => {

	var desde = request.query.desde || 0;
	desde = Number( desde );

	Hospital.find( {} )
		.skip( desde ) // desde que número de registro empezar
		.limit( 5 ) // 5 registros por página
		.populate( 'usuario', 'nombre email' ) // para obtener usuario relacionado
		.exec( ( error, hospitales ) => {

			if( error ) {

				// enviar respuesta
				return response.status( 500 ).json( { // status 500: Error interno del servidor

					ok: false, 
					mensaje: 'Error al obtener hospitales',
					errors: error

				} );

			}

			Hospital.count( {}, ( error, cantReg ) => {

				// enviar respuesta
				response.status( 200 ).json( { // status 200: Ok

					ok: true,
					hospitales: hospitales,
					numRows: cantReg

				} );

			} );

		} );

} );


// ===========================================
// crear hospitales
// ===========================================
app.post( '/', middlewareAuth.verificaToken, ( request, response ) => {

	var body = request.body; // solo funciona con el body parser

	var hospital = Hospital( {

		nombre: body.nombre,
		img: body.img,
		usuario: request.usuario._id

	} );

	hospital.save( ( error, hospitalCreado ) => {

		if( error ) {

			return response.status( 400 ).json( { // status 400: Solicitud incorrecta

				ok: false, 
				mensaje: 'Error al crear nuevo hospital.',
				errors: error

			} );

		}

		// enviar respuesta
		response.status( 201 ).json( { // status 201: Recurso creado

			ok: true,
			hospital: hospitalCreado

		} );

	} );

} );


// ===========================================
// actualizar hospitales
// ===========================================
app.put( '/:id', middlewareAuth.verificaToken, ( request, response ) => {

	var id = request.params.id; // obtener el id que viene como parametro

	// averiguar si existe un hospital con el id
	Hospital.findById( id, ( error, hospitalEncontrado ) => {

		if( error ) {

			return response.status( 500 ).json( { // status 500: Error interno del servidor

				ok: false, 
				mensaje: 'Error al obtener hospital para actualizar.',
				errors: error

			} );

		}

		if( !hospitalEncontrado ) {

			return response.status( 400 ).json( { // status 400: Solicitud incorrecta

				ok: false,
				mensaje: 'Error al actualizar hospital.',
				errors: { message: 'No existe un hospital con el ID indicado.' }

			} );

		}

		var body = request.body;

		hospitalEncontrado.nombre = body.nombre;
		hospitalEncontrado.usuario = request.usuario._id;

		hospitalEncontrado.save( ( error, hospitalActualizado ) => {

			if( error ) {

				return response.status( 400 ).json( { // status 400: Solicitud incorrecta

					ok: false, 
					mensaje: 'Error al actualizar hospital.',
					errors: error

				} );

			}

			response.status( 200 ).json( { // status 200: Ok

				ok: true, 
				hospital: hospitalActualizado

			} );

		} );

	} );


} );


// ===========================================
// eliminar hospitales
// ===========================================
app.delete( '/:id', middlewareAuth.verificaToken, ( request, response ) => {

	var id = request.params.id;

	Hospital.findByIdAndRemove( id, ( error, hospitalEliminado ) => {

		if( error ) {

			return response.status( 500 ).json( { // status 500: Error interno del servidor

				ok: false, 
				mensaje: 'Error al obtener hospital para eliminar.',
				errors: error

			} );

		}

		if( !hospitalEliminado ) {

			return response.status( 400 ).json( { // status 400: Solicitud incorrecta

				ok: false, 
				mensaje: 'Error al eliminar hospital.',
				errors: { message: 'No existe un hospital con el ID indicado.' }

			} );

		}

		response.status( 200 ).json( {

			ok: true, 
			hospital: hospitalEliminado

		} );

	} );

} );


module.exports = app;