'use strict'

var express = require('express');//Para utilizar rutas
var CommentController = require('../controllers/comment');

var router = express.Router();//Para acceder a los metodos de Router
var md_auth = require('../middlewares/authenticated');

router.post('/comment/topic/:topicId', md_auth.authenticated, CommentController.add);
router.put('/comment/:commentId', md_auth.authenticated, CommentController.update);
router.delete('/comment/:topicId/:commentId', md_auth.authenticated, CommentController.delete);

module.exports = router;