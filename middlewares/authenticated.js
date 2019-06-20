//este middleware comprobara si nos llega la cabecera de autentificación
'use strict'

var jwt = require('jwt-simple');
var moment = require('moment');
var secret = 'clave-secreta-para-generar-el-token-9999';

//exports -> cuando solo tiene un metodo
//los middleware tienen 3 parametros: la request, response y next, 
//que permite que el flujo del programa salga del middleware y ejecute lo siguiente
exports.authenticated = function(req, res, next){

	console.log('Middleware authenticated');
	// Comprobar si llega autorización
	if(!req.headers.authorization){
		return res.status(403).send({
			message: 'La peticion no tiene la cabecera de authorization'
		});
	}

	// Limpiar el token y quitar comillas
	var token = req.headers.authorization.replace(/['"]+/g, ''); //elemina comilla simples y dobles
	// Decodificar token se tiene que hacer dentro de un try por que es sensible a errores
	try{
		var payload = jwt.decode(token, secret);

		// Comprobar si el token a expirado
		if(payload.exp <= moment().unix()){
			return res.status(404).send({
				message: 'El token ha expirado'
			});
		}
	}catch(ex){
		return res.status(404).send({
			message: 'El token no es valido'
		});
	}

	// Adjuntar usuario identificado a request
	req.user = payload;
	next();
};