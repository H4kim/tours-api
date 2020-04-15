const express = require('express');
const reviewRouter = require('./reviewRoutes')
const tourController = require('../controllers/tourController')
const authController = require('../controllers/authController')


const router = express.Router();

router.use('/:tourId/reviews', reviewRouter)

router.route('/monthly-plan/:year')
    .get(tourController.getMonthlyPlan)

router.route('/tours-stats')
    .get(tourController.getToursStats)

router.route('/top-5-cheap')
    .get(tourController.topFiveCheap, tourController.getAllTours)

router.route('/')
    .get(authController.protect, tourController.getAllTours)
    .post(tourController.addTour)

router.route('/:id')
    .get(tourController.getTour)
    .patch(tourController.updateTour)
    .delete(authController.protect, authController.restrictTo('admin', 'lead-guide'), tourController.deleteTour)

module.exports = router;

