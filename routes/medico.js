// Requires: importación de librerias
var express = require( 'express' ); // libreria del servidor express

var middlewareAuth = require( '../middlewares/auth' ); // middleware de autentiación


// Inicializar variables
var app = express(); // Inicializar servidor express


// Importar el modelo de medico
var Medico = require( '../models/medico' );


// ===========================================
// obtener medicos
// ===========================================
app.get( '/', ( request, response ) => {

	var desde = request.query.desde || 0;
	desde = Number( desde );

	Medico.find( {} )
		.skip( desde ) // desde que número de registro empezar
		.limit( 5 ) // 5 registros por página
		.populate( 'usuario', 'nombre email' )  // para obtener usuario relacionado
		.populate( 'hospital' ) // para obtener hospital relacionado
		.exec( ( error, medicos ) => {

			if( error ) {

				// enviar respuesta
				return response.status( 500 ).json( { // status 500: Error interno del servidor

					ok: false, 
					mensaje: 'Error al obtener medicos.',
					errors: error

				} );

			}

			Medico.countDocuments( {}, ( error, cantReg ) => {

				// enviar respuesta
				response.status( 200 ).json( { // status 200: Ok

					ok: true,
					medicos: medicos,
					numRows: cantReg

				} );

			} );

		} );

} );


// ===========================================
// obtener medico por el id
// ===========================================
app.get( '/:id', ( request, response ) => {

	var id = request.params.id; // obtener el id que viene como parametro

	// averiguar si existe un medico con el id
	Medico.findById( id )
		.populate( 'usuario', 'nombre email img' )
		.populate( 'hospital' )
		.exec( ( error, medicoEncontrado ) => {

			if( error ) {

				return response.status( 500 ).json( { // status 500: Error interno del servidor

					ok: false, 
					mensaje: 'Error al obtener médico.',
					errors: error

				} );

			}

			if( !medicoEncontrado ) {

				return response.status( 400 ).json( { // status 400: Solicitud incorrecta

					ok: false,
					mensaje: 'Error al obtener médico.',
					errors: { message: 'No existe un médico con el ID indicado.' }

				} );

			}

			response.status( 200 ).json( { // status 200: Ok

				ok: true, 
				medico: medicoEncontrado

			} );

		} );

} );


// ===========================================
// crear medicos
// ===========================================
app.post( '/', middlewareAuth.verificaToken, ( request, response ) => {

	var body = request.body; // solo funciona con el body parser

	var medico = Medico( {

		nombre: body.nombre,
		img: body.img,
		usuario: request.usuario._id,
		hospital: body.hospital

	} );

	medico.save( ( error, medicoCreado ) => {

		if( error ) {

			return response.status( 400 ).json( { // status 400: Solicitud incorrecta

				ok: false, 
				mensaje: 'Error al crear nuevo medico.',
				errors: error

			} );

		}

		// enviar respuesta
		response.status( 201 ).json( { // status 201: Recurso creado

			ok: true,
			medico: medicoCreado

		} );

	} );

} );


// ===========================================
// actualizar medicos
// ===========================================
app.put( '/:id', middlewareAuth.verificaToken, ( request, response ) => {

	var id = request.params.id; // obtener el id que viene como parametro

	// averiguar si existe un medico con el id
	Medico.findById( id, ( error, medicoEncontrado ) => {

		if( error ) {

			return response.status( 500 ).json( { // status 500: Error interno del servidor

				ok: false, 
				mensaje: 'Error al obtener medico para actualizar.',
				errors: error

			} );

		}

		if( !medicoEncontrado ) {

			return response.status( 400 ).json( { // status 400: Solicitud incorrecta

				ok: false,
				mensaje: 'Error al actualizar medico.',
				errors: { message: 'No existe un medico con el ID indicado.' }

			} );

		}

		var body = request.body;

		medicoEncontrado.nombre = body.nombre;
		medicoEncontrado.usuario = request.usuario._id;
		medicoEncontrado.hospital = body.hospital;

		medicoEncontrado.save( ( error, medicoActualizado ) => {

			if( error ) {

				return response.status( 400 ).json( { // status 400: Solicitud incorrecta

					ok: false, 
					mensaje: 'Error al actualizar medico.',
					errors: error

				} );

			}

			response.status( 200 ).json( { // status 200: Ok

				ok: true, 
				medico: medicoActualizado

			} );

		} );

	} );


} );


// ===========================================
// eliminar medicos
// ===========================================
app.delete( '/:id', middlewareAuth.verificaToken, ( request, response ) => {

	var id = request.params.id;

	Medico.findByIdAndRemove( id, ( error, medicoEliminado ) => {

		if( error ) {

			return response.status( 500 ).json( { // status 500: Error interno del servidor

				ok: false, 
				mensaje: 'Error al obtener medico para eliminar.',
				errors: error

			} );

		}

		if( !medicoEliminado ) {

			return response.status( 400 ).json( { // status 400: Solicitud incorrecta

				ok: false, 
				mensaje: 'Error al eliminar medico.',
				errors: { message: 'No existe un medico con el ID indicado.' }

			} );

		}

		response.status( 200 ).json( {

			ok: true, 
			medico: medicoEliminado

		} );

	} );

} );


module.exports = app;