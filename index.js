'use strict';
//cargamos la libreria mongoose de node_modules
var mongoose = require('mongoose');
var app = require('./app');
//si hay una variable de entorno configurada en el servidor la utilizara y en caso contrario utilizara 3999
var port = process.env.PORT || 3999;
mongoose.set('useFindAndModify', false);//Para que no muestre en consola error deprecated
mongoose.Promise = global.Promise;//Permite trabajar con promesas
//Conexion
mongoose.connect('mongodb://localhost:27017/api_rest_node', {useNewUrlParser: true})
//mongoose.connect(process.env.conexion_env, {useNewUrlParser: true})
        .then(() => {
            console.log('La conexión a mongo se ha realizado correctamente');

            //Crear el servidor
            app.listen(port, () => {
            	console.log('El servidor http://localhost:3999 esta funcionando');
            });
        })
        .catch(error => console.log(error));