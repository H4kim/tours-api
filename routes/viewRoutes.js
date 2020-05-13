const express = require('express');
const viewsController = require('../controllers/viewsController')
const authController = require('../controllers/authController')
const bookingController = require('../controllers/bookingController')

const router = express.Router();


router.get('/', bookingController.createBookingCheckout, authController.isLoggedin, viewsController.getOverview)
router.get('/login', authController.isLoggedin, viewsController.getLoginForm)
router.get('/tours/:slug', authController.isLoggedin, viewsController.getTours)
router.get('/me', authController.protect, viewsController.getAccount)
router.get('/my-tours', authController.protect, viewsController.getMyTours)


module.exports = router;