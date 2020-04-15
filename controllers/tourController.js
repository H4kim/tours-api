/* eslint-disable arrow-body-style */
const Tour = require('../models/tourModel');
const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError')


exports.topFiveCheap = async (req, res, next) => {
    req.query.limit = '5';
    req.query.fields = 'name,price,summary,ratingsAverage,difficulty';
    req.query.sort = '-ratingsAverage,price';
    next();
}

exports.getAllTours = catchAsync(async (req, res, next) => {
    //EXECUTE THE QUERY
    const features = new APIFeatures(Tour.find(), req.query).filter().sort().fields().paginate();
    const tours = await features.query

    //SEND THE QUERY

    res.status(200).json({
        status: 'success',
        results: tours.length,
        data: {
            tours
        }
    })
})

exports.addTour = catchAsync(async (req, res, next) => {
    // const newTour = new Tour({name: req.body.name,rating: req.body.rating,price: req.body.price}) 
    // newTour.save();
    const newTour = await Tour.create(req.body);
    res.status(201).json({
        status: 'success',
        data: {
            tour: newTour
        }
    })
})

exports.getTour = catchAsync(async (req, res, next) => {
    const tour = await Tour.findById(req.params.id).populate('reviews');
    //tour === null
    if (!tour) {
        //create custom error and send it to errorController.js
        return next(new AppError('Invalid tour id !', 404))
    }

    res.status(200).json({
        status: 'success',
        data: {
            tour
        }
    })
})

exports.updateTour = catchAsync(async (req, res, next) => {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    })

    if (!tour) {
        //create custom error and send it to errorController.js
        return next(new AppError('Invalid tour id !', 404))
    }

    res.status(201).json({
        status: 'success',
        data: {
            tour
        }
    })
})

exports.deleteTour = catchAsync(async (req, res, next) => {
    const tour = await Tour.findByIdAndDelete(req.params.id);

    if (!tour) {
        //create custom error and send it to errorController.js
        return next(new AppError('Invalid tour id !', 404))
    }

    res.status(204).json({
        status: 'success',
        message: 'tour deleted succesfully'
    })
})

exports.getToursStats = catchAsync(async (req, res, next) => {
    const stats = await Tour.aggregate([
        {
            $match: { ratingsAverage: { $gte: 4.5 } }
        },
        {
            $group: {
                _id: '$difficulty',
                numTours: { $sum: 1 },
                numRatings: { $sum: '$ratingsQuantity' },
                avgPrice: { $avg: '$price' },
                avgRatings: { $avg: '$ratingsAverage' },
                maxPrice: { $max: '$price' },
                minPrice: { $min: '$price' }
            }
        },
        {
            $sort: {
                avgPrice: 1
            }
        }

    ])

    res.status(200).json({
        status: 'success',
        stats
    })
})

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
    const year = req.params.year * 1
    const plan = await Tour.aggregate([
        {
            $unwind: '$startDates'
        },
        {
            $match: {
                startDates: {
                    $gte: new Date(`${year}-01-01`),
                }
            }
        },
        {
            $group: {
                _id: { $month: '$startDates' },
                sumToursStart: { $sum: 1 },
                tours: { $push: '$name' }
            }
        },
        {
            $addFields: {
                month: '$_id'
            }
        },
        {
            $project: { _id: 0 }
        },
        {
            $sort: { month: 1 }
        },
        // {
        //     $limit: 1
        // }


    ])
    res.status(200).json({
        status: 'success',
        length: plan.length,
        plan
    })
}) 