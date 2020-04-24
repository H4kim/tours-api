const Tour = require('../models/tourModel')
const catchAsync = require('../utils/catchAsync')



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
    res.status(200).render('tour', {
        title: 'The Forest Hiker',
        tour
    })
})

exports.getLoginForm = (req, res) => {
    res.status(200).render('login')
}