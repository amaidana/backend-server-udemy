var mongoose = require( 'mongoose' ); // libreria para conectar con BD de mongo
var uniqueValidator = require( 'mongoose-unique-validator' ); // libreria para hacer validaciones de campo único

var Schema = mongoose.Schema;

var rolesValidos = {
	values: [ 'ADMIN_ROLE', 'USER_ROLE' ],
	message: '{VALUE} no es un rol permitido.'
}

// Definir el esquema del modelo Usuario
var usuarioSchema = new Schema( {

	nombre: { type: String, required: [ true, 'El campo nombre es requerido.' ] },
	email: { type: String, unique: true, required: [ true, 'El campo correo es requerido.' ] },
	password: { type: String, required: [ true, 'El campo contraseña es requerido.' ] },
	img: { type: String, required: false },
	role: { type: String, required: true, default: 'USER_ROLE', enum: rolesValidos },
	google: { type: Boolean, default: false }

} );

usuarioSchema.plugin( uniqueValidator, { message: 'El campo {PATH} ingresado ya existe.' } );

module.exports = mongoose.model( 'Usuario', usuarioSchema );