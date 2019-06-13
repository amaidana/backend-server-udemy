var mongoose = require( 'mongoose' ); // libreria para conectar con BD de mongo
var uniqueValidator = require( 'mongoose-unique-validator' ); // libreria para hacer validaciones de campo único


var Schema = mongoose.Schema;


// Definir el esquema del modelo Medico
var medicoSchema = new Schema( {

	nombre: { type: String, required: [ true, 'El campo nombre es requerido.' ], unique: true },
	img: { type: String, required: false },
	usuario: { type: Schema.Types.ObjectId, ref: 'Usuario', required: true },
	hospital: { type: Schema.Types.ObjectId, ref: 'Hospital', required: [ true, 'El campo hospital es requerido.' ] }

} );

medicoSchema.plugin( uniqueValidator, { message: 'El campo {PATH} ingresado ya existe.' } );

module.exports = mongoose.model( 'Medico', medicoSchema );