const Tour = require('../models/tourModel')
const Booking = require('../models/bookingModel')
const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/appError')



exports.getOverview = catchAsync(async (req, res) => {
    const tours = await Tour.find()
    res.status(200).render('overview', {
        title: 'All Tours',
        tours
    })
})

exports.getTours = catchAsync(async (req, res, next) => {
    const tour = await Tour.findOne({ slug: req.params.slug }).populate({
        path: 'reviews',
        select: 'review rating user'
    })

    if (!tour) {
        return next(new AppError('The is not tour with that name', 404))
    }
    res.status(200).render('tour', {
        title: 'The Forest Hiker',
        tour
    })
})

exports.getLoginForm = (req, res) => {
    res.status(200).render('login')
}

exports.getAccount = (req, res) => {
    res.status(200).render('account', {
        title : 'Your Account'
    })
}

exports.getMyTours = catchAsync(async (req, res, next) => {
    //1 find all booking 
    const bookings = await Booking.find({ user : req.user.id })

    //2 find tours booked by the user
    const toursIDs = bookings.map(el => el.tour);
    const tours = await Tour.find({ _id : { $in : toursIDs } })

    res.status(200).render('overview', {
        title : 'My Tours',
        tours
    })
})