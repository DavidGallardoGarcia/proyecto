'user strict'

//con el metodo require cargas un modulo en una variable

var express = require('express');
var UserController = require('../controllers/user');

var router = express.Router();//Para acceder a los metodos de Router
var md_auth = require('../middlewares/authenticated');

var multipart = require('connect-multiparty');
var md_upload = multipart({ uploadDir: './uploads/users' });//uploadDir -> donde se van a subir los archivos

//Rutas prueba
router.get('/probando', UserController.probando);//Le pasamos la ruta, el controlador y el metodo
router.post('/testeando', UserController.testeando);

//Rutas de User
router.post('/register', UserController.save); //tiene que ser post por que vamos a guardar
router.post('/login', UserController.login);
//Para aplicar un middleware a una ruta, se le pasa por parametro
router.put('/user/update', md_auth.authenticated, UserController.update); //se utiliza put cuando queremos modificar
//como necesitarmos 2 middleware, hay que pasarlos como un array
router.post('/upload-avatar', [md_auth.authenticated, md_upload], UserController.uploadAvatar);
router.get('/avatar/:fileName', UserController.avatar);
router.get('/users', UserController.getUsers);
router.get('/user/:userId', UserController.getUser);

module.exports = router;