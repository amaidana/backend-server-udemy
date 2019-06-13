// Requires: importación de librerias
var express = require( 'express' ); // libreria del servidor express

// Inicializar variables
var app = express(); // Inicializar servidor express


const path = require( 'path' ); // libreria de node para crear path de forma sencilla
const fs = require( 'fs' ); // libreria de node para manipular archivos


app.get( '/:tipo/:img', ( request, response ) => {

	var tipo = request.params.tipo;
	var img = request.params.img;

	// averiguar si la imagen existe
	var pathImagen = path.resolve( __dirname, `../uploads/${ tipo }/${ img }` );

	if( fs.existsSync( pathImagen ) ) { // si imagen existe

		response.sendFile( pathImagen );

	} else { // si la imagen no existe

		var pathNoImage = path.resolve( __dirname, '../assets/no-img.jpg' );

		response.sendFile( pathNoImage );

	}

} );


module.exports = app;