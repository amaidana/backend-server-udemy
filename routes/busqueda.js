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
app.get( '/coleccion/:table/:content', ( request, response ) => {

	var content = new RegExp( request.params.content, 'i' ); // contenido a buscar
	var table   = request.params.table; // colección en la que buscar

	var promesa;

	switch( table ) {

		case 'usuarios':

			promesa = buscarUsuarios( content );

			break;

		case 'medicos':

			promesa = buscarMedicos( content );

			break;

		case 'hospitales':

			promesa = buscarHospitales( content );

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
			[table]: data

		} );

	} );

} );


// ===========================================
// obtener resultado de busqueda general
// ===========================================
app.get( '/todo/:content', ( request, response ) => {

	var content = new RegExp( request.params.content, 'i' ); // expresión regular para que la busqueda no sea case sensitive

	Promise.all( [ 
		buscarHospitales( content ), 
		buscarMedicos( content ),
		buscarUsuarios( content ) ] 
	).then( respuestas => {

		response.status( 200 ).json( {

			ok: true, 
			hospitales: respuestas[0],
			medicos: respuestas[1],
			usuarios: respuestas[2]

		} );

	} ); // llamar a varias promesas en simultaneo

} );


function buscarHospitales( content ) {

	return new Promise( ( resolve, reject ) => {

		Hospital.find( { nombre: content } )
			.populate( 'usuario', 'nombre email' )
			.exec( ( error, hospitales ) => {

				if( error ) {

					reject( 'Ha ocurrido un error al buscar hospitales.', error );

				}

				if( error ) {

					reject( 'Ha ocurrido un error al buscar hospitales.', error );

				} else {

					resolve( hospitales );

				}

		} );

	} );

}

function buscarMedicos( content ) {

	return new Promise( ( resolve, reject ) => {

		Medico.find( { nombre: content } )
			.populate( 'usuario', 'nombre email img' )
			.populate( 'hospital' )
			.exec( ( error, medicos ) => {

			/*
			// ===============================================
			// Hacer esto para  obtener el total de registros
			// ===============================================

			if( error ) {

				reject( 'Ha ocurrido un error al buscar medicos.', error );

			}
			
			Medico.countDocuments( { [filter]: content }, function( error, cantReg ) {

				let data = {
					data: medicos, 
					cantReg: cantReg
				}
				
				resolve( data );

			} );
			*/

			if( error ) {

				reject( 'Ha ocurrido un error al buscar medicos.', error );

			} else {

				resolve( medicos );

			}

		} );

	} );

}

function buscarUsuarios( content ) {

	return new Promise( ( resolve, reject ) => {

		Usuario.find( {}, 'nombre email role img' )
			.or( [ { 'nombre': content }, { 'email': content } ] ) // buscar por email y por nombre solamente
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