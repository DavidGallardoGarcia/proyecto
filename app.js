'use strict'

// Requires
var express = require('express');
//para poder convertir las peticiones que le llegan a objetos usables en js
var bodyParser = require('body-parser');

//Ejecutar express
var app = express();

//Cargar archivos de rutas
var user_routes = require('./routes/user');
var topic_routes = require('./routes/topic');
var comment_routes = require('./routes/comment');

//Middlewares -> funcionalidades que se ejecutan antes de llegar a las acciones de los controladores
app.use(bodyParser.urlencoded({extended:false}));//configuracion necesaria para que body-parser funcione
app.use(bodyParser.json());//convertir la peticion en objeto json

//Configurar cabeceras y cors(accesos cruzado entre dominios)
//para que funcione nodejs con el frontend en angular
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
    next();
});

//Reescribir rutas
app.use('/api', user_routes);//mete un middleware que modifica la ruta
app.use('/api', topic_routes);
app.use('/api', comment_routes);

//Exportar modulo
module.exports = app;