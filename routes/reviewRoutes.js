const express = require('express');
const authConntroller = require('./../controllers/authController')
const reviewController = require('./../controllers/reviewController')


const router = express.Router({ mergeParams: true })



router.route('/')
    .get(reviewController.getAllReviews)
    .post(authConntroller.protect, authConntroller.restrictTo('user'), reviewController.setTourUserIds, reviewController.createReview)

router.route('/:id')
    .get(reviewController.getReview)
    .patch(reviewController.updateReview)
    .delete(reviewController.deleteReview)

module.exports = router;
