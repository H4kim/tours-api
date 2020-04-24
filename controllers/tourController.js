/* eslint-disable arrow-body-style */
const Tour = require('../models/tourModel');
const factory = require('./handlerFactory')
const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError')


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

// /tour-within route (get tours within certain distance provided by the user)
exports.getToursWithin = catchAsync(async (req, res, next) => {
    const { distance, latlng, unit } = req.params
    const [lat, lng] = latlng.split(',')
    const radius = unit === 'mi' ? distance / 3958.8 : distance / 6371

    if (!lat || !lng) {
        return next(new AppError('Please provide latitude and langitude in format of lat,lng'))
    }
    const tours = await Tour.find({
        startLocation: {
            $geoWithin: {
                $centerSphere: [[lng, lat], radius]
            }
        }
    }).select('name address')

    res.status(200).json({
        status: 'success',
        tours: tours.length,
        data: {
            tours
        }
    })
})

exports.getDistances = catchAsync(async (req, res, next) => { //BUG
    const { latlng, unit } = req.params
    let [lat, lng] = latlng.split(',')

    if (!lat || !lng) {
        return next(new AppError('Please provide latitude and langitude in format of lat,lng'))
    }

    const multiplier = unit === 'km' ? 0.001 : 0.000621371
    const distances = await Tour.aggregate([
        {
            $geoNear: {
                near: { type: 'Point', coordinates: [lng * 1, lat * 1] },
                distanceField: 'distance',
                distanceMultiplier: multiplier
            }
        },
        {
            $project: {
                name: 1,
                address: 1,
                distance: 1
            }
        }
    ])


    res.status(200).json({
        status: 'success',
        data: {
            data: distances
        }
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