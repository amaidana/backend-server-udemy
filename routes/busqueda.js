// Requires: importación de librerias
var express = require( 'express' ); // libreria del servidor express


// Inicializar variables
var app = express(); // Inicializar servidor express


var Hospital = require( '../models/hospital' );
var Medico = require( '../models/medico' );
var Usuario = require( '../models/usuario' );


// ===========================================
// obtener resultado de busqueda por colección
// ===========================================
app.get( '/coleccion/:tabla/:busqueda', ( request, response ) => {

	var busqueda = request.params.busqueda;
	var tabla = request.params.tabla;
	var expreg = new RegExp( busqueda, 'i' );

	var promesa;

	switch( tabla ) {

		case 'usuarios':

			promesa = buscarUsuarios( busqueda, expreg );

			break;

		case 'medicos':

			promesa = buscarMedicos( busqueda, expreg );

			break;

		case 'hospitales':

			promesa = buscarHospitales( busqueda, expreg );

			break;

		default:

			return response.status( 400 ).json( { // status 400: Solicitud incorrecta

				ok: false,
				mensaje: 'Tipo de busqueda debe ser usuarios, medicos u hospitales.',
				error: { message: 'Tipo de busqueda incorrecta.' }

			} );

	}

	promesa.then( data => {

		response.status( 200 ).json( { // status 200: Ok

			ok: true,
			[tabla]: data

		} );

	} );

} );


// ===========================================
// obtener resultado de busqueda general
// ===========================================
app.get( '/todo/:busqueda', ( request, response ) => {

	var busqueda = request.params.busqueda;
	var expreg = new RegExp( busqueda, 'i' ); // expresión regular para que la busqueda no sea case sensitive

	Promise.all( [ 
		buscarHospitales( busqueda, expreg ), 
		buscarMedicos( busqueda, expreg ),
		buscarUsuarios( busqueda, expreg ) ] 
	).then( respuestas => {

		response.status( 200 ).json( {

			ok: true, 
			hospitales: respuestas[0],
			medicos: respuestas[1],
			usuarios: respuestas[2]

		} );

	} ); // llamar a varias promesas en simultaneo

} );


function buscarHospitales( busqueda, expreg ) {

	return new Promise( ( resolve, reject ) => {

		Hospital.find( { nombre: expreg } )
			.populate( 'usuario', 'nombre email' )
			.exec( ( error, hospitales ) => {

			if( error ) {

				reject( 'Ha ocurrido un error al buscar hospitales.', error );

			} else {

				resolve( hospitales );

			}

		} );

	} );

}

function buscarMedicos( busqueda, expreg ) {

	return new Promise( ( resolve, reject ) => {

		Medico.find( { nombre: expreg } )
			.populate( 'usuario', 'nombre email' )
			.populate( 'hospital' )
			.exec( ( error, medicos ) => {

			if( error ) {

				reject( 'Ha ocurrido un error al buscar medicos.', error );

			} else {

				resolve( medicos );

			}

		} );

	} );

}

function buscarUsuarios( busqueda, expreg ) {

	return new Promise( ( resolve, reject ) => {

		Usuario.find( {}, 'nombre email role' )
			.or( [ { 'nombre': expreg }, { 'email': expreg } ] ) // buscar por email y por nombre solamente
			.exec( ( error, usuarios ) => {

				if( error ) {

					reject( 'Ha ocurrido un error al buscar usuarios.', error );

				} else {

					resolve( usuarios );

				}

			} );

	} );

}

module.exports = app;