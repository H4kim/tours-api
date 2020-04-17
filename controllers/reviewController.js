const Review = require('./../models/reviewModel')
const factory = require('./handlerFactory')
// const catchAsync = require('./../utils/catchAsync');
// const AppError = require('./../utils/appError')


exports.setTourUserIds = (req, res, next) => {
    if (!req.body.user) req.body.user = req.user;
    if (!req.body.tour) req.body.tour = req.params.tourId;
    next()
}


exports.getAllReviews = factory.getAll(Review)

exports.getReview = factory.getOne(Review)

exports.createReview = factory.createOne(Review)

exports.deleteReview = factory.deleteOne(Review)

exports.updateReview = factory.updateOne(Review)
