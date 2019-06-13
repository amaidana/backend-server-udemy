var mongoose = require( 'mongoose' );
var uniqueValidator = require( 'mongoose-unique-validator' );

var Schema = mongoose.Schema;


var rolesValidos = {
	values: [ 'ADMIN_ROLE', 'USER_ROLE' ],
	message: '{VALUE} no es un rol permitido.'
}


var usuarioSchema = new Schema( {

	nombre: { type: String, required: [ true, 'El campo nombre es obligatorio.' ] },
	email: { type: String,  required: [ true, 'El campo email es obligatorio.' ], unique: true },
	password: { type: String, required: [ true, 'El campo password es obligatorio.' ] },
	img: { type: String, required: false },
	role: { type: String, required: true, default: 'USER_ROLE', enum: rolesValidos }

} );

usuarioSchema.plugin( uniqueValidator, { message: 'El campo {PATH} ingresado ya existe.' } );

module.exports = mongoose.model( 'Usuario', usuarioSchema );