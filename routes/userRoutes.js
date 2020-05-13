const express = require('express');
const userController = require('../controllers/userController')
const authController = require('../controllers/authController')

const router = express.Router();


router.post('/signup', authController.signUp)
router.post('/login', authController.login)
router.get('/logout', authController.logout)
router.post('/forgotpassword', authController.forgotPassword)
router.patch('/resetpassword/:token', authController.resetPassword)

//from here we need to be loggedIn (DRY => add the protect middleware once)
router.use(authController.protect)

router.patch('/updateMyPassword', authController.updatePassword)

router.patch('/updateMe', userController.uploadUserPhoto, userController.resizeUploadPhoto, userController.updateMe)

router.delete('/deleteMe', userController.deleteMe)

router.get('/me', userController.getMe, userController.getUser)

//from here we need to be an Admin (DRY => add the protect middleware once)
router.use(authController.restrictTo('admin'))

router.route('/')
    .get(userController.getAllUsers)
    .post(userController.createUser)

router.route('/:id')
    .get(userController.getUser)
    .patch(userController.updateUser)
    .delete(userController.deleteUser)

module.exports = router;