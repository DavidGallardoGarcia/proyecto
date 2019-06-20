'use strict'

var validator = require('validator');
var Topic = require('../models/topic');

var controller = {
	add: function(req, res){

		// Recoger el id del topic de la url
		var topicId = req.params.topicId;

		// Find por id del topic
		Topic.findById(topicId).exec((err, topic) => {

			if(err){
				return res.status(500).send({
					status: 'error',
					message: 'Error en la peticion'
				});
			}

			if(!topic){
				return res.status(404).send({
					status: 'error',
					message: 'No existe el tema'
				});
			}
			// Comprobar objeto usuario y validar datos
			if(req.body.content){
				try{
					var validate_content = !validator.isEmpty(req.body.content);
				}catch(err){
					return res.status(200).send({
						message: 'No has comentado nada'
					});
				}

				if(validate_content){
					//Creamos el comentario
					var comment = {
						user: req.user.sub,
						content: req.body.content,					
					};

					// Añade un subdocumento dentro de la propiedad de comments de topic
					topic.comments.push(comment);

					// Guardar el topic completo
					topic.save((err) => {
						
						if(err){
							return res.status(500).send({
								status: 'error',
								message: 'Error al guardar el comentario'
							});
						}

						Topic.findById(topic._id)
						 .populate('user') //populate es para recoger la informacion del usuario relacionado con el topic
						 .populate('comments.user')
						 .exec((err, topic) => {

						 	if(err){
						 		return res.status(500).send({
						 			status: 'error',
						 			message: 'Error en la peticion'
						 		});
						 	}

						 	if(!topic){
						 		return res.status(404).send({
						 			status: 'error',
						 			message: 'No existe el topic'
						 		});
						 	}

						 	return res.status(200).send({
						 		status: 'success',
						 		topic
							});
						 });
					});

				}else{
					return res.status(200).send({
						message: 'No se han validado los datos del comentario'
					});
				}
			}
			
		});
	
	},

	update: function(req, res){

		// Conseguir idComentario por url
		var commentId = req.params.commentId;

		// Recoger datos y validar
		var params = req.body;

		try{
			var validate_content = !validator.isEmpty(params.content);
		}catch(err){
			return res.status(200).send({
				message: 'No has comentado nada'
			});
		}

		if(validate_content){
			// Find and update de subdocumento
			Topic.findOneAndUpdate(
				{'comments._id': commentId},//documento cuyo comment tenga el id que le pasamos(commentId)
				{//Operador de actualización
					'$set': {
						'comments.$.content': params.content //comments.$ = al commentario que buscamos arriba
					}
				},
				{new:true},//Me permite sacar el documento actualizado mas nuevo
				(err, topicUpdated) =>{

					if(err){
						return res.status(500).send({
							status: 'error',
							message: 'Error en la peticion'
						});
					}

					if(!topicUpdated){
						return res.status(404).send({
							status: 'error',
							message: 'No existe el tema'
						});
					}
					
					// Devolver respuesta
					return res.status(200).send({
						status: 'success',
						topic: topicUpdated
					});
				});

		}
	
	},

	delete: function(req, res){

		// Sacar el id del topic y del comentario que llegan por url
		var topicId = req.params.topicId;
		var commentId = req.params.commentId;

		// Buscar el topic
		Topic.findById(topicId, (err, topic) => {

			if(err){
				return res.status(500).send({
					status: 'error',
					message: 'Error en la peticion'
				});
			}

			if(!topic){
				return res.status(404).send({
					status: 'error',
					message: 'No existe el tema'
				});
			}

			//	Seleccionar el subdocumento (comentario)
			var comment = topic.comments.id(commentId); //del array de comments del topic, sacamos el commentario por el id

			//	Borrar el comentario
			if(comment){
				comment.remove();

				//	Guardar el topic
				topic.save((err) => {

					if(err){
						return res.status(500).send({
							status: 'error',
							message: 'Error en la peticion'
						});
					}

					Topic.findById(topic._id)
						 .populate('user') //populate es para recoger la informacion del usuario relacionado con el topic
						 .populate('comments.user')
						 .exec((err, topic) => {

						 	if(err){
						 		return res.status(500).send({
						 			status: 'error',
						 			message: 'Error en la peticion'
						 		});
						 	}

						 	if(!topic){
						 		return res.status(404).send({
						 			status: 'error',
						 			message: 'No existe el topic'
						 		});
						 	}

						 	return res.status(200).send({
						 		status: 'success',
						 		topic
							});
						 });

				});

			}else{
				return res.status(404).send({
					status: 'error',
					message: 'No existe el comentario'
				});
			}
			
		});

	}

};

module.exports = controller;//Para utilizar el controller en otros archivos