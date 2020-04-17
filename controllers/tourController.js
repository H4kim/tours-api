/* eslint-disable arrow-body-style */
const Tour = require('../models/tourModel');
const factory = require('./handlerFactory')
const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError')


exports.getAllTours = factory.getAll(Tour)

exports.createTour = factory.createOne(Tour)

exports.getTour = factory.getOne(Tour, { path: 'reviews' })

exports.updateTour = factory.updateOne(Tour)

exports.deleteTour = factory.deleteOne(Tour);

exports.topFiveCheap = async (req, res, next) => {
    req.query.limit = '5';
    req.query.fields = 'name,price,summary,ratingsAverage,difficulty';
    req.query.sort = '-ratingsAverage,price';
    next();
}

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