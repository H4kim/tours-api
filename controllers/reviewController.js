const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError')

const Review = require('./../models/reviewModel')

exports.getAllReviews = catchAsync(async (req, res, next) => {
    let filter = {}
    if (req.params.tourId) filter = { tour: req.params.tourId }

    const reviews = await Review.find(filter).select('-__v');

    res.status(200).json({
        status: 'success',
        data: {
            reviews
        }
    })
})

exports.addReview = catchAsync(async (req, res, next) => {
    let { review, rating, user, tour } = req.body
    if (!user) user = req.user;
    if (!tour) tour = req.params.tourId;
    const newReview = await Review.create({
        review,
        rating,
        user,
        tour
    })

    res.status(201).json({
        status: 'success',
        data: {
            review: newReview
        }
    })
})