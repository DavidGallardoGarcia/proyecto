'use strict'

var mongoose = require('mongoose');//Cargamos el modulo
var Schema = mongoose.Schema;//Nos permitira crear esquemas de mongoose

var UserSchema = Schema({
	name: String,
	surname: String,
	email: String,
	password: String,
	image: String,
	role: String
});

/*UserSchema.methods.toJSON = function(){
	var obj = this.toObjects();
	delete obj.password;//eliminamos la pass de las respuestas json

	return obj;
}*/

module.exports = mongoose.model('User', UserSchema);//Esto generara un objeto usuario con todas las propiedades del esquema
