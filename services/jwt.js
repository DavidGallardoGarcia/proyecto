'use strict'

var jwt = require('jwt-simple');
var moment = require('moment');

exports.createToken = function(user){

//El token lo enviaremos al front-end para que tenga la informacion del usuario identificado
	var payload = {//payload = todos los datos del user que queremos identificar y generar su token
		sub: user._id,//id
		name: user.name,
		surname: user.surname,
		email: user.email,
		role: user.role,
		image: user.image,
		iat: moment().unix(),//fecha creacion token
		exp: moment().add(30, 'days').unix//fecha expiracion token(30 dias)
	};

	return jwt.encode(payload, 'clave-secreta-para-generar-el-token-9999');//generamos el token codificando el payload,
	//sin la clave no se podra generar ni decodificar el token
}