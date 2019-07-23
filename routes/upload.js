// Requires: importación de librerias
var express = require( 'express' ); // libreria del servidor express
var fileUpload = require( 'express-fileupload' ); // libreria para subir archivos
var fs = require( 'fs' ); // libreria de node para manipular archivos

// Inicializar variables
var app = express(); // Inicializar servidor express


var Usuario = require( '../models/usuario' );
var Hospital = require( '../models/hospital' );
var Medico = require( '../models/medico' );


app.use( fileUpload() );


app.put( '/:tipo/:id', ( request, response ) => {

	var tipo = request.params.tipo; // usuarios, medicos u hospitales
	var id = request.params.id; // id de tipo

	var tiposValidos = [ 'hospitales', 'medicos', 'usuarios' ];

	if( tiposValidos.indexOf( tipo ) < 0 ) { // si viene otra cosa que no sea hospitales, medicos o usuarios

		return response.status( 400 ).json( { // status 400: Solicitud incorrecta

			ok: false, 
			mensaje: 'Tipo de colección no válida.',
			errors: { message: 'Tipo de colección no válida.' }

		} );

	}

	if( !request.files ) { // si no vienen archivos

		return response.status( 400 ).json( { // status 400: Solicitud incorrecta

			ok: false,
			mensaje: 'No se seleccionaron archivos.',
			errors: { message: 'Sin archivos para subir.' }

		} );

	}	

	// verificar que el archivo sea una imagen
	var archivo = request.files.imagen; // obtener el nombre del archivo
	var nombreCortado = archivo.name.split( '.' ); // obtener un array seperando en el punto
	var ext = nombreCortado[ nombreCortado.length - 1 ];
	var	extArchivo = ext.toLowerCase();

	// extenciones permitidas
	var extencionesValidas = [ 'png', 'jpg', 'gif', 'jpeg' ];

	if( extencionesValidas.indexOf( extArchivo ) < 0 ) { // si la extención del archivo no esta entre las permitidas

		response.status( 400 ).json( { // status 400: Solicitud incorrecta

			ok: false,
			mensaje: 'El archivo ingresado no es una imagen.',
			errors: { message: 'Extensión de archivo debe estar estar entre ' + extencionesValidas.join( ', ' ) }

		} );


	}

	// Nombre de archivo personalizado
	var nombreArchivo = `${ id }-${ new Date().getMilliseconds() }.${ extArchivo }`;

	// Mover el archivo del temporal a un path en el servidor
	var path = `./uploads/${ tipo }/${ nombreArchivo }`;

	archivo.mv( path, ( error ) => {

		if( error ) {

			return response.status( 500 ).json( { // status 500: Error interno del servidor

				ok: false, 
				mensaje: 'Error al mover archivo.',
				errors: error

			} );

		}

		actualizarPorTipo( tipo, id, nombreArchivo, response );

	} );

} );


function actualizarPorTipo( tipo, id, nombreArchivo, response ) {

	if( tipo === 'usuarios' ) {

		Usuario.findById( id, ( error, usuarioEncontrado ) => {

			if( !usuarioEncontrado ) { // si el id de usuario no existe

				fs.unlink( './uploads/usuarios/' + nombreArchivo );// eliminar la imagen que acabo de subir

				return response.status( 400 ).json( { // status 400: solicitud incorrecta
				
					ok: false,
					mensaje: 'Error al actualizar imagen de usuario.',
					errors: { message: 'No existe un usuario con el ID indicado.' }
				
				} );

			}

			// averiguar si ya existe una imagen para el usuario
			var pathViejo = './uploads/usuarios/' + usuarioEncontrado.img;

			if( fs.existsSync( pathViejo ) ) { // si ya existe imagen

				fs.unlink( pathViejo ); // Eliminar imagen anterior asociada al usuario

			}

			usuarioEncontrado.img = nombreArchivo; // para grabar el nombre del archivo en la bd

			usuarioEncontrado.save( ( error, usuarioActualizado ) => {

				usuarioActualizado.password = ':)';

				return response.status( 200 ).json( { // status 200: Ok

					ok: true,
					mensaje: 'Imagen de usuario actualizada.',
					usuario: usuarioActualizado

				} );

			} )

		} );

	}

	if( tipo === 'medicos' ) {

		Medico.findById( id, ( error, medicoEncontrado ) => {

			if( !medicoEncontrado ) { // si el id de médico no existe

				fs.unlink( './uploads/medicos/' + nombreArchivo );// eliminar la imagen que acabo de subir

				return response.status( 400 ).json( { // status 400: solicitud incorrecta
				
					ok: false,
					mensaje: 'Error al actualizar imagen de médico.',
					errors: { message: 'No existe un médico con el ID indicado.' }
				
				} );

			}

			// averiguar si ya existe un imagen para el médico
			var pathViejo = './uploads/medicos/' + medicoEncontrado.img;

			if( fs.existsSync( pathViejo ) ) { // si ya existe imagen

				fs.unlink( pathViejo ); // Eliminar imagen anterior asociada al médico

			}

			medicoEncontrado.img = nombreArchivo; // para grabar el nombre del archivo en la bd

			medicoEncontrado.save( ( error, medicoActualizado ) => {

				return response.status( 200 ).json( { // status 200: ok

					ok: true,
					mensaje: 'Imagen de médico actualizada.',
					medico: medicoActualizado

				} );

			} );

		} );

	}

	if( tipo === 'hospitales' ) {

		Hospital.findById( id, ( error, hospitalEncontrado ) => {

			if( !hospitalEncontrado ) { // si el id de hospital no existe

				fs.unlink( './uploads/hospitales/' + nombreArchivo );// eliminar la imagen que acabo de subir

				return response.status( 400 ).json( { // status 400: solicitud incorrecta
				
					ok: false,
					mensaje: 'Error al actualizar imagen de hospital.',
					errors: { message: 'No existe un hospital con el ID indicado.' }
				
				} );

			}

			// averiguar si ya existe un imagen para el hospital
			var pathViejo = './uploads/hospitales/' + hospitalEncontrado.img;

			if( fs.existsSync( pathViejo ) ) { // si ya existe imagen

				fs.unlink( pathViejo ); // Eliminar imagen anterior asociada al hospital

			}

			hospitalEncontrado.img = nombreArchivo; // para grabar el nombre del archivo en la bd

			hospitalEncontrado.save( ( error, hospitalActualizado ) => {

				return response.status( 200 ).json( { // status 200: ok

					ok: true,
					mensaje: 'Imagen de hospital actualizada.',
					hospital: hospitalActualizado

				} );

			} );

		} );

	}

}

module.exports = app;