'use strict'

var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate-v2');

var Schema = mongoose.Schema;

//Modelo de COMMENT(SUBMODELO DE TOPIC)
var CommentSchema = Schema({
	content: String,
	date: { type: Date, default: Date.now },
	user: { type: Schema.ObjectId, ref: 'User'},
});

var Comment = mongoose.model('Comment', CommentSchema);

//Modelo de TOPIC
var TopicSchema = Schema({
	title: String,
	content: String,
	code: String,
	lang: String,
	date: { type: Date, default: Date.now },
	//Guardamos el objectId del user al que haga referencia el topic
	user: { type: Schema.ObjectId, ref: 'User'},
	//en la propiedad de comments tendremos subdocumentos con el esquema del comentario
	comments: [CommentSchema]
});

// Cargar paginacion
TopicSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Topic', TopicSchema);