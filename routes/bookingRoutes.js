const express = require('express');
const authConntroller = require('../controllers/authController')
const bookingController = require('../controllers/bookingController')


const router = express.Router()

router.use(authConntroller.protect)

router.get('/checkout-session/:tourId', bookingController.getCheckoutSession)

router.use(authConntroller.restrictTo('admin', 'lead-guide'))

router.route('/')
    .get(bookingController.getAllBookings) 
    .post(bookingController.createBooking)

router.router('/:id')
    .get(bookingController.getBooking)
    .patch(bookingController.updateBooking)
    .delete(bookingController.deleteBooking)

module.exports = router;
