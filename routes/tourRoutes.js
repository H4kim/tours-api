const express = require('express');
const reviewRouter = require('./reviewRoutes')
const tourController = require('../controllers/tourController')
const authController = require('../controllers/authController')


const router = express.Router();

router.use('/:tourId/reviews', reviewRouter)

router.route('/monthly-plan/:year')
    .get(authController.protect, authController.restrictTo('admin', 'lead-guide', 'guide'), tourController.getMonthlyPlan)

router.route('/tours-stats')
    .get(tourController.getToursStats)

router.route('/top-5-cheap')
    .get(tourController.topFiveCheap, tourController.getAllTours)

router.route('/')
    .get(tourController.getAllTours)
    .post(authController.protect, authController.restrictTo('admin', 'lead-guide'), tourController.createTour)

router.route('/:id')
    .get(tourController.getTour)
    .patch(authController.protect, authController.restrictTo('admin', 'lead-guide'), tourController.updateTour)
    .delete(authController.protect, authController.restrictTo('admin', 'lead-guide'), tourController.deleteTour)

module.exports = router;

