const express = require('express');
const authConntroller = require('../controllers/authController')
const reviewController = require('../controllers/reviewController')


const router = express.Router({ mergeParams: true })

router.use(authConntroller.protect)

router.route('/')
    .get(reviewController.getAllReviews)
    .post(authConntroller.restrictTo('user'), reviewController.setTourUserIds, reviewController.createReview)

router.route('/:id')
    .get(reviewController.getReview)
    .patch(authConntroller.restrictTo('admin', 'user'), reviewController.updateReview)
    .delete(authConntroller.restrictTo('admin', 'user'), reviewController.deleteReview)

module.exports = router;
