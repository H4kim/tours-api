const express = require('express');
const authConntroller = require('./../controllers/authController')
const reviewController = require('./../controllers/reviewController')


const router = express.Router({ mergeParams: true })



router.route('/')
    .get(reviewController.getAllReviews)
    .post(authConntroller.protect, authConntroller.restrictTo('user'), reviewController.addReview)

module.exports = router;
