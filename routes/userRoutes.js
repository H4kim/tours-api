const express = require('express');
const userController = require('../controllers/userController')
const authController = require('../controllers/authController')

const router = express.Router();

router.post('/signup', authController.signUp)

router.post('/login', authController.login)

router.post('/forgotpassword', authController.forgotPassword)

router.patch('/resetpassword/:token', authController.resetPassword)

router.patch('/updateMyPassword', authController.protect, authController.updatePassword)

router.route('/')
    .get(userController.getAllUsers)
    .post(userController.addUser)

router.route('/:id')
    .get(userController.getUser)
    .patch(userController.updateUser)
    .delete(userController.deleteUser)

module.exports = router;