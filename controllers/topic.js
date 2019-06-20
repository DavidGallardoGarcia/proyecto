'use strict'

var validator = require('validator');
var Topic = require('../models/topic');

var controller = {

	test: function(req, res){
		return res.status(200).send({
			message: 'hola que tal'
		});
	},

	save: function(req, res){

		// Recoger parametros por post
		var params = req.body;//Gracias a body-parser, nos combierte la req en un objeto de js

		// Validar datos
		try{
			var validate_title = !validator.isEmpty(params.title);
			var validate_content = !validator.isEmpty(params.content);
			var validate_lang = !validator.isEmpty(params.lang);

		}catch(err){
			return res.status(200).send({
				message: 'Faltan datos por enviar'
			});
		}

		if(validate_content && validate_title && validate_lang){
			// Crear objeto a guardar
			var topic = new Topic();

			// Asignar valores
			topic.title = params.title;
			topic.content = params.content;
			topic.code = params.code;
			topic.lang = params.lang;
			topic.user = req.user.sub;//Relacion del usuario con el topic

			// Guardar el topic
			topic.save((err, topicStore) => {
				if(err || !topicStore){
					res.status(404).send({
						status: 'error',
						message: 'El tema no se ha guardado'
					});
				}
				
				// Devolver respuesta
				return res.status(200).send({
					status: 'success',
					topic: topicStore
				});
			});

		}else{
			return res.status(200).send({
				message: 'Los datos no son validos'
			});
		}

	},

	getTopics: function(req, res){

		// Cargar libreria paginacion en el modelo

		// Recoger la pagina actual
		if(!req.params.page || req.params.page == 0 || req.params.page == '0' || req.params.page == undefined){//page es el parametro que le pasamos por la url
			var page = 1;
		}else{
			var page = parseInt(req.params.page);//nos devuelve un string, hay que parsearlo
		}

		// Indicar las opciones de paginacion(Ordenacion, el numero de topics por pagina...)
		var options = {
			sort: { date: -1}, //Orden de nuevo a viejo
			populate: 'user',  //Populate -> carga la propiedad con el usuario relacionado
			limit: 5, 		   //Numero de entradas por pagina
			page: page
		};

		// Find paginado
		Topic.paginate({}, options, (err, topics) =>{//1 condicion, 2 opciones para configuara paginacion, 3 callback

			if(err){
				return res.status(500).send({
					status: 'error',
					message: 'Error al hacer la consulta'
				});
			}

			if(!topics){
				return res.status(404).send({
					status: 'error',
					message: 'No hay topics'
				});
			}
			
			// Devolver resultado (topics, total de topics, total de paginas)
			return res.status(200).send({
				status: 'success',
				topics: topics.docs,//todos los documentos listados y paginados van en este objeto
				totalDocs: topics.totalDocs,
				totalPages: topics.totalPages
			});
		});

	},

	getTopicsByUser: function(req, res){

		//Conseguir el id del usuario
		var userId = req.params.user;
		// Find con una condicion de usuario
		Topic.find({
			user: userId
		})
		.sort([['date', 'descending']])
		.exec((err, topics) => {
			
			if(err){
				return res.status(500).send({
					status: 'error',
					message: 'Error en la peticion'
				});
			}

			if(!topics){
				return res.status(404).send({
					status: 'error',
					message: 'No hay temas para mostrar'
				});
			}

			// Devolver resultado
			return res.status(200).send({
				status: 'success',
				topics
			});
		});

	},

	getTopic: function(req, res){

		//Sacar el id del topic de la url
		var topicId = req.params.id;

		// Find por id del topic
		Topic.findById(topicId)
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

	},

	update: function(req, res){

		// Recoger el id del topic de la url
		var topicId = req.params.id;

		// Recoger los datos que llegan desde post
		var params = req.body;

		// Validar datos
		try{
			var validate_title = !validator.isEmpty(params.title);
			var validate_content = !validator.isEmpty(params.content);
			var validate_lang = !validator.isEmpty(params.lang);

		}catch(err){
			return res.status(200).send({
				message: 'Faltan datos por enviar'
			});
		}

		if(validate_title && validate_content && validate_lang){
			// Montar un json con los datos modificables
			var update = {
				title: params.title,
				content: params.content,
				code: params.code,
				lang: params.lang
			};

			// Fin and update del topic por id e id de usuario
			Topic.findOneAndUpdate({_id: topicId, user: req.user.sub}, update, {new:true}, (err, topicUpdated) => {
				
				if(err){
					// Devolver respuesta
					return res.status(500).send({
						status: 'error',
						message: 'Error en la peticion'
					});
				}

				if(!topicUpdated){
					// Devolver respuesta
					return res.status(400).send({
						status: 'error',
						message: 'No se ha actualizado el tema'
					});
				}

				// Devolver respuesta
				return res.status(200).send({
					status: 'success',
					topicUpdated
				});
			});

		}else{
			return res.status(200).send({
				message: 'La validacion de los datos no es correcta'
			});
		}
		
	},

	delete: function(req, res){

		// Sacar el id del topic de la url
		var topicId = req.params.id;

		//	Find and delete por topicId y por su userId
		Topic.findOneAndDelete({_id: topicId, user: req.user.sub}, (err, topicRemoved) => {

			if(err){
				// Devolver respuesta
				return res.status(500).send({
					status: 'error',
					message: 'Error en la peticion'
				});
			}

			if(!topicRemoved){
				// Devolver respuesta
				return res.status(400).send({
					status: 'error',
					message: 'No se ha borrado el tema'
				});
			}

			// Devolver respuesta
			return res.status(200).send({
				status: 'success',
				topic: topicRemoved
			});
		});
		
	},

	search: function(req, res){

		// Sacar string a buscar de la url
		var searchString = req.params.search;

		// Find or
		Topic.find({ '$or': [ //este operador me permite evaluar condiciones con OR (||)
			//Con el operador $regex comprobamos que el titulo contenga el string que nos llega por la url
			{ 'title': { '$regex': searchString, '$options': 'i'} },
			{ 'content': { '$regex': searchString, '$options': 'i'} },
			{ 'code': { '$regex': searchString, '$options': 'i'} },
			{ 'lang': { '$regex': searchString, '$options': 'i'} }
		]})
		.populate('user')
		.sort([['date', 'descending']]) //para que nos ordene de mas nuevo a mas viejo
		.exec((err, topics) => {

			if(err){
				return res.status(500).send({
					status: 'error',
					message: 'Error en al peticion'
				});
			}

			if(!topics){
				return res.status(404).send({
					status: 'error',
					message: 'No hay temas disponibles'
				});
			}

			//	Devolver respuesta
			return res.status(200).send({
				status: 'success',
				topics
			});

		});

	}

};

module.exports = controller;