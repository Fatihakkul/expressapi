// IMPORT CONFIG AN DEPENDENCIES
const express = require('express');
const isAuth = require('../../middleware/is-auth');

const userController = require('../../controller/user/user');

const router = express.Router();

router.post('/test', userController.testMetodAuth);
router.post('/post' , userController.sendPost)
router.post('/like' , userController.likePost)
router.post('/comment' , userController.commentPost)
router.post('/group' , userController.createGroup)
router.get('/postdetail' , userController.getPostDetail)
router.get('/post' , userController.getAllPost)
router.get('/message' , userController.getMessage)
router.get('/usermessage' , userController.getUserMessage)
router.get('/messagedetail' , userController.getMessageDetail)

// router.post('./addMarque', isAuth, )



module.exports = router;
