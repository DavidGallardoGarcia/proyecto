'use strict'

//Cargamos los servicios que necesitemos (requite == import)
var validator = require('validator');
var User = require('../models/user');//Necesitamos cargar el modelo del usuario para poder crear el objeto user
var bcrypt = require('bcrypt-nodejs');//Libreria para cifrar passwords
var jwt = require('../services/jwt');//Token
var fs = require('fs');//Libreria interna de node que permite trabajar con ficheros
var path = require('path');

var controller = {

	probando: function(req, res){
		return res.status(200).send({
			message: "Soy el metodo probando"
		});
	},

	testeando: function(req, res){
		return res.status(200).send({
			message: "Soy el metodo testeando"
		});
	},

	save: function(req, res){
		//Recoger los parametros de la peticion
		var params = req.body;

		//Validar los datos
		try{
			var validate_name = !validator.isEmpty(params.name);
			var validate_surname = !validator.isEmpty(params.surname);
			var validate_email = !validator.isEmpty(params.email) && validator.isEmail(params.email);
			var validate_password = !validator.isEmpty(params.password);
		}catch(err){
			return res.status(200).send({
				message: 'Faltas datos por enviar'
			});
		}
		//console.log(validate_name, validate_surname, validate_email, validate_password);
		if(validate_name && validate_surname && validate_email && validate_password){
		//Crear objeto user
		var user = new User();

		//Asignar valores
		user.name = params.name;
		user.surname = params.surname;
		user.email = params.email.toLowerCase();
		user.role = 'ROLE_USER';
		user.image = null;

		//Comprobar si el user existe(Lo comprobamos usando el modelo que hemos importado)
		User.findOne({email: user.email}, (err, issetUser) => {//error sera true si hay duplicado e issetUser sera el usuario que esta en la BD
			if(err){
				return res.status(500).send({
					message: 'Error al comprbar duplicidad de usuario'
				});
			}

			if(!issetUser){
				//Si no existe, cifrar la contraseña 
				bcrypt.hash(params.password, null, null, (err, hash) => {
					user.password = hash;

					//Guardar
					user.save((err, userStored) => {
						if(err){
							return res.status(500).send({
								message: 'Error al guardar el usuario'
							});
						}

						if(!userStored){
							return res.status(400).send({
								message: 'El usuario no se a guardado'
							});
						}

						//Devolver respuesta
						return res.status(200).send({
							status: 'success',
							user: userStored
						});

					});//close save
				});//close bcrypt
	
			}else{
				return res.status(200).send({
					message: 'El usuario ya esta registrado'
				});
			}

		});

		}else{
			return res.status(200).send({
				message: 'La validacion de los datos es incorrecta'
			});
		}
	},

	//Identifica al usuario, comprueba si existe y genera su token
	login: function(req, res){
		// Recoger los parametros de la peticion
		var params = req.body;//body son los datos que envio desde un formulario

		// Validar los datos
		try{
			var validate_email = !validator.isEmpty(params.email) && validator.isEmail(params.email);
			var validate_password = !validator.isEmpty(params.password);
		}catch(err){
			return res.status(200).send({
				message: 'Faltas datos por enviar'
			});
		}

		if(!validate_email || !validate_password){
			return res.status(200).send({
				message: 'Los datos son incorrectos'
			});
		}

		// Buscar usarios que coincidan con el mail
		User.findOne({email: params.email.toLowerCase()}, (err, user) => {//user = usuario encontrado

			if(err){
				return res.status(500).send({
					message: 'ERROR al intentar identificarse'
				});
			}

			if(!user){
				return res.status(404).send({
					message: 'ERROR el usuario no existe'
				});
			}

			// Si lo encuentra,
			// Comprobar la contraseña(coincidencia email y password / bcrypt)
			bcrypt.compare(params.password, user.password, (err, check) => {//check = true es que coinciden
				// Si es correcto,
				if(check){
					// Generar token y devolverlo
					if(params.gettoken){//comprobar si me llega el token
						// Devolver los datos
						return res.status(200).send({
							token: jwt.createToken(user)
						});
					}else{
						// Limpiar el objeto
						user.password = undefined;//Para que no aparezca la pass en respuestas del servidor

						// Devolver los datos
						return res.status(200).send({
							status: 'success',
							user
						});
					}
		
				}else{
					return res.status(200).send({
						message: 'ERROR las credenciales no son correctas'
					});
				}
				
			});
			
		});

	},

	update: function(req, res){
		// recoger los datos del usuario
		var params = req.body;

		//Validar datos
		try{
			var validate_name = !validator.isEmpty(params.name);
			var validate_surname = !validator.isEmpty(params.surname);
			var validate_email = !validator.isEmpty(params.email) && validator.isEmail(params.email);
		}catch(err){
			return res.status(200).send({
				message: 'Faltas datos por enviar',
				params
			});
		}
		// Eliminar propiedades innecesarias
		delete params.password;
		delete params.date;

		var userId = req.user.sub;//El id del usuario identificado(sub esta declarado en jwt.js)

		//Comprobar si el email es unico
		if(req.user.email != params.email){

				User.findOne({email: params.email.toLowerCase()}, (err, user) => {//user = usuario encontrado

				if(err){
					return res.status(500).send({
						message: 'ERROR al intentar identificarse'
					});
				}

				if(user && user.email == params.email){
					return res.status(200).send({
						message: 'El email no puede ser modificado'
					});
				}
			});
		}else{

			// Buscar y actualizar, metodo del ORM mongoose
			User.findOneAndUpdate({_id: userId}, params, {new:true}, (err, userUpdated) => {//(condicion, datos a actualizar, opciones, callback)
				
				//Si hay error
				if(err){
					return res.status(500).send({
						status: 'error',
						message: 'ERROR al actualizar usuario'
					});
				}

				//Si no llega el usuario actualizado
				if(!userUpdated){
					return res.status(200).send({
						status: 'error',
						message: 'No se a aztualizado el usuario'
					});
				}

				//Respuesta
				return res.status(200).send({//si todo va bien me devuelve el usuario actualizado
					status: 'success',
					user: userUpdated
				});
			});
		}
		
	},

	uploadAvatar: function(req, res){
		// Configurar el modulo multiparty (md para habiliar la subida de imagenes/ficheros)
		// Recoger el fichero de la peticion
		var file_name = 'Avatar no subido...';

		//console.log(req.files);
		if(!req.files){
			return res.status(200).send({
				status: 'error',
				message: file_name
			});
		}

		// Conseguir el nombre y la extension de archivo
		var file_path = req.files.file0.path;
		var file_split = file_path.split('\\');
		var file_name = file_split[2];//Nombre del archivo

		var ext_split = file_name.split('\.');
		var file_ext = ext_split[1];

		// Comprobar extension (solo imagenes), si no es valida borrar fichero subido
		if(file_ext != 'png' && file_ext != 'jpg' && file_ext != 'jpeg' && file_ext != 'gif'){
			fs.unlink(file_path, (err) => {//unlink -> permite borrar archivos
				
				return res.status(200).send({
					status: 'error',
					message: 'La extension del archivo no es valida'
				});

			});
		}else{

			// Sacar el id del usuario identificado
			var userId = req.user.sub;

			// Buscar y actualizar el documento bd
			//findOneAndUpdate 1 buscamos el usuario por el id, 2 le pasamos la imagen a actualizar, 3 le especificamos que nos devuelva el objeto actualizado 4 callback
			User.findOneAndUpdate({_id: userId}, {image: file_name}, {new:true}, (err, userUpdated) => {
				if(err || !userUpdated){
					return res.status(500).send({
						status: 'error',
						message: 'Error al guardar el usuario'
					});
				}

				return res.status(200).send({
					status: 'success',
					user: userUpdated
				});
			});
	
		}

	},

	avatar: function(req, res){
		var fileName = req.params.fileName;
		var pathFile = './uploads/users/'+fileName;

		fs.exists(pathFile, (exists) => {
			if(exists){
				return res.sendFile(path.resolve(pathFile));
			}else{
				return res.status(404).send({
					message: 'La imagen no existe'
				});
			}
		});
	},

	getUsers: function(req, res){
		User.find().exec((err, users) =>{//exec ejecuta la consulta
			if(err || !users){
				return res.status(404).send({
					status: 'error',
					message: 'No hay usuarios que mostrar'
				});
			}

			return res.status(200).send({
				status: 'success',
				users
			});
		});
	},

	getUser: function(req, res){
		var userId = req.params.userId;
		User.findById(userId).exec((err, user) => {
			if(err || !user){
				return res.status(404).send({
					status: 'error',
					message: 'No existe el usuario'
				});
			}

			return res.status(200).send({
				status: 'success',
				user
			});
		});
	}

};

module.exports = controller;