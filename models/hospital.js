var mongoose = require( 'mongoose' ); // libreria para conectar con BD de mongo
var uniqueValidator = require( 'mongoose-unique-validator' ); // libreria para hacer validaciones de campo único


var Schema = mongoose.Schema;


// Definir el esquema del modelo Hospital
var hospitalSchema = new Schema( {

	nombre: { type: String, required: [ true, 'El campo nombre es requerido.' ], unique: true },
	img: { type: String, required: false },
	usuario: { type: Schema.Types.ObjectId, ref: 'Usuario', required: true }

}, { collection: 'hospitales' } );

hospitalSchema.plugin( uniqueValidator, { message: 'El campo {PATH} ingresado ya existe.' } );

module.exports = mongoose.model( 'Hospital', hospitalSchema );